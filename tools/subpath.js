// node tools/subpath.js: prove the site works where GitHub Pages puts it — under /textbook/, not at /.
//
// It copies the repository into a temporary directory as `textbook/`, dropping exactly what
// .github/workflows/pages.yml excludes from the Pages artifact, serves that directory, and loads every
// page at http://127.0.0.1:<port>/textbook/.
//
// Claim: a page passes when it reaches the handshake with every figure ready, no console error, no
// uncaught page error, no failed request, no same-origin response of 400 or worse, no horizontal
// overflow, and no same-origin request to a path outside /textbook/ — that last one is the root-only
// absolute path this tool exists to catch. Screenshots land in out/subpath/.
//
// Bound: one prefix (/textbook/), two viewports, two themes, one pinned time (t=0), one renderer
// (SwiftShader), a local server with no redirects, compression or caching of its own. It does not
// prove anything about GitHub's own serving — HTTPS, its 404 page, its trailing-slash redirects or
// its cache headers — and it cannot see a defect inside a figure that throws nothing; out/subpath/ is
// for a person to look at. It mirrors the working tree, not a checkout, so an untracked or ignored
// file the deploy will never have is still served here; the digest it prints names what it read.
//
// It also writes each figure's stage on its own at native resolution to out/subpath/figures/, because
// a full-page screenshot of a long chapter scaled to fit answers "is there one of each" and never "is
// each one right". tools/inspect.js and tools/figure-shot.js are the repo's instruments for looking at
// figures; neither can serve the site under a prefix, which is the only question this tool asks.
//
// Those per-figure images are not a golden set. Scrolling each stage into view hands the figure a
// moment of wall clock before the shot, so the pond comes out at a different phase from run to run —
// measured 2026-09-10: two runs at the same prefix matched on 38 of 40 images, and both misses were
// the pond. Comparing two runs is therefore evidence about the other 38; a pond diff is the tool.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { startServer, REPO_ROOT } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES as SITE_PAGES } from './lib/browser.js';

// SUBPATH_PREFIX=/ serves the same tree at the root, so the two runs can be compared byte for byte:
// equal figure PNGs are what proves a layout nit is the figure's own and not the prefix's doing.
// Compare the two printed digests first. If they differ the tree moved between the arms, the runs
// differ by more than the prefix, and the comparison says nothing — measured 2026-09-10, when two
// arms taken four minutes apart while other work landed agreed on 11 of 40 images and meant nothing.
const PREFIX = process.env.SUBPATH_PREFIX || '/textbook/';
const OUT = process.env.SUBPATH_OUT || 'out/subpath';
if (!PREFIX.startsWith('/') || !PREFIX.endsWith('/')) throw new Error(`SUBPATH_PREFIX must start and end with "/"; got ${PREFIX}`);

// The one exclusion list, read from the same file .github/workflows/pages.yml deletes from the
// checkout, so the tree proved here and the tree deployed there cannot drift apart. .git and .github
// are added because upload-pages-artifact drops those itself, whatever the file says.
//
// An entry may name a path, not only a top-level directory: the workflow runs `xargs rm -rf` over the
// list, which deletes biology/ch02-chemistry-of-life/FIGURES.md perfectly well, so matching only the
// first path segment here silently served two files the deploy drops — the drift the list exists to
// prevent, measured 2026-09-11. Neither reader expands globs: rm does not, and `xargs` does not either,
// so `biology/*/FIGURES.md` would match nothing in the workflow. Entries are literal paths.
const EXCLUDE = [
  '.git',
  '.github',
  ...readFileSync(new URL('./pages-exclude.txt', import.meta.url), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean),
];
const isExcluded = (rel) => {
  const path = rel.split(sep).join('/');
  return EXCLUDE.some((e) => path === e || path.startsWith(`${e}/`));
};

// One page list for the whole repo, discovered from disk in lib/browser.js. This gate serves the site
// from a sub-path, so the leading slash comes off; the lab is not a reader page and is appended here.
const PAGES = [
  ...SITE_PAGES.map((p) => ({ id: p.id, path: p.path.replace(/^\//, '') })),
  { id: 'lab', path: 'lab/', query: 'kind=cell3d' },
];
const VIEWPORTS = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'desktop', width: 1440, height: 900 },
];
const THEMES = ['light', 'dark'];

function mirrorSite() {
  const dir = mkdtempSync(join(tmpdir(), 'textbook-subpath-'));
  const segments = PREFIX.split('/').filter(Boolean);
  const dest = segments.length ? join(dir, ...segments) : dir;
  cpSync(REPO_ROOT, dest, {
    recursive: true,
    filter: (src) => {
      const rel = relative(REPO_ROOT, src);
      if (!rel) return true;
      return !isExcluded(rel);
    },
  });
  return { dir, dest };
}

// A digest of the bytes that were actually served, so a run's evidence names the tree it inspected and
// a later edit strands that evidence instead of inheriting it.
function digestOf(root) {
  const files = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(root);
  const h = createHash('sha256');
  for (const f of files) {
    h.update(relative(root, f).split(sep).join('/'));
    h.update(readFileSync(f));
  }
  return { sha256: h.digest('hex').slice(0, 16), files: files.length };
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/figures`, { recursive: true });

const { dir, dest } = mirrorSite();
const digest = digestOf(dest);
console.log(`mirrored the shipped tree to ${dest} (${digest.files} files, sha256:${digest.sha256})`);
const server = await startServer({ port: 0, root: dir, quiet: true });
console.log(`serving ${dir} at ${server.url}${PREFIX}`);
const browser = await launch();
const report = [];
let failures = 0;

try {
  for (const pageDef of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const label = `${pageDef.id} ${vp.id} ${theme}`;
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
        page.setDefaultTimeout(ACTION_TIMEOUT_MS);
        const errors = collectErrors(page);
        const problems = [];
        const requests = [];
        const outside = [];
        const badStatus = [];
        page.on('request', (req) => {
          const url = new URL(req.url());
          requests.push(req.url());
          if (url.origin !== server.url) return;
          if (!url.pathname.startsWith(PREFIX)) outside.push(`${req.url()} (a root-only path: it would 404 under ${PREFIX})`);
        });
        page.on('response', (res) => {
          const url = new URL(res.url());
          if (url.origin === server.url && res.status() >= 400) badStatus.push(`${res.status()} ${res.url()}`);
        });
        let figures = {};
        const started = Date.now();
        const query = `eager=1&t=0&theme=${theme}${pageDef.query ? `&${pageDef.query}` : ''}`;
        try {
          figures = await openPage(page, `${server.url}${PREFIX}${pageDef.path}?${query}`);
          for (const [id, f] of Object.entries(figures)) {
            if (f.state !== 'ready') problems.push(`figure ${id} (${f.kind}) is in state "${f.state}"${f.error ? `: ${f.error}` : ''}`);
          }
          const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
          if (overflow.scrollWidth > overflow.clientWidth + 1) problems.push(`the document overflows horizontally: scrollWidth ${overflow.scrollWidth} > viewport ${overflow.clientWidth}`);
          await page.screenshot({ path: `${OUT}/${pageDef.id}-${vp.id}-${theme}.png`, type: 'png', fullPage: true });
          // Each figure's stage on its own, at the size it actually renders, for a person to look at.
          for (const id of Object.keys(figures)) {
            const stage = page.locator(`#${id} .tb-figure__stage`);
            if (await stage.count()) {
              await stage.scrollIntoViewIfNeeded();
              await page.waitForTimeout(150);
              await stage.screenshot({ path: `${OUT}/figures/${pageDef.id}-${vp.id}-${theme}-${id}.png`, type: 'png' });
            }
          }
        } catch (err) {
          problems.push(err.message);
        }
        for (const e of errors) problems.push(e);
        for (const o of outside) problems.push(o);
        for (const b of badStatus) problems.push(`a request under ${PREFIX} was refused: ${b}`);
        await page.close();
        const ms = Date.now() - started;
        const sameOrigin = requests.filter((u) => u.startsWith(server.url));
        report.push({
          page: pageDef.id,
          viewport: vp.id,
          theme,
          ms,
          sameOriginRequests: sameOrigin.map((u) => new URL(u).pathname),
          crossOriginRequests: [...new Set(requests.filter((u) => !u.startsWith(server.url)).map((u) => new URL(u).origin))],
          figures: Object.fromEntries(Object.entries(figures).map(([k, v]) => [k, { kind: v.kind, state: v.state }])),
          problems,
        });
        if (problems.length) {
          failures += 1;
          console.log(`FAIL ${label} (${ms} ms)`);
          for (const p of problems) console.log(`  ${p}`);
        } else {
          console.log(`ok   ${label} (${ms} ms, ${Object.keys(figures).length} figures ready, ${sameOrigin.length} requests all under ${PREFIX})`);
        }
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
  if (!process.env.SUBPATH_KEEP) rmSync(dir, { recursive: true, force: true });
}

writeFileSync(`${OUT}/report.json`, JSON.stringify({ prefix: PREFIX, tree: digest, loads: report }, null, 2));
if (failures) {
  console.error(`FAIL: ${failures} of ${report.length} page loads had problems under ${PREFIX} (tree sha256:${digest.sha256}); see ${OUT}/report.json`);
  process.exit(1);
}
console.log(`subpath: ${report.length} page loads clean under ${PREFIX} for tree sha256:${digest.sha256}; screenshots in ${OUT}/`);
