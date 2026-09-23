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
// It inherits the handshake's sitting term: `window.__textbook.state` does not become 'ready' until every
// <tb-sitting> on the page has booted (src/shell.js), so the /today/ frames here are of a booted study
// page rather than of whatever had finished loading. Before that term this gate raced the boot and said
// nothing about it — the frames it wrote of /today/ were not reproducible from one run to the next.
//
// Bound: one prefix (/textbook/), two viewports, two themes, one pinned time (t=0), one renderer
// (SwiftShader), a local server with no redirects, compression or caching of its own. It does not
// prove anything about GitHub's own serving — HTTPS, its 404 page, its trailing-slash redirects or
// its cache headers — and it cannot see a defect inside a figure that throws nothing; out/subpath/ is
// for a person to look at. It mirrors the working tree, not a checkout, so an untracked or ignored
// file the deploy will never have is still served here; the digest it prints names what it read.
// SUBPATH_PAGES trims the page list and a trimmed run proves only the pages it names; the run's last
// line says which pages it judged and which it did not, and a value naming no page stops the run rather
// than emptying it (tools/lib/trim.js).
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
import { PATTERNS, NEVER_WALKED, makeMatcher } from './pages-exclude.js';
import { trim, PAGE_HINT } from './lib/trim.js';

// SUBPATH_PREFIX=/ serves the same tree at the root, so the two runs can be compared byte for byte:
// equal figure PNGs are what proves a layout nit is the figure's own and not the prefix's doing.
// Compare the two printed digests first. If they differ the tree moved between the arms, the runs
// differ by more than the prefix, and the comparison says nothing — measured 2026-09-10, when two
// arms taken four minutes apart while other work landed agreed on 11 of 40 images and meant nothing.
const PREFIX = process.env.SUBPATH_PREFIX || '/textbook/';
const OUT = process.env.SUBPATH_OUT || 'out/subpath';
if (!PREFIX.startsWith('/') || !PREFIX.endsWith('/')) throw new Error(`SUBPATH_PREFIX must start and end with "/"; got ${PREFIX}`);

// The one exclusion list, read through the same matcher .github/workflows/pages.yml calls to trim its
// checkout, so the tree proved here and the tree deployed there cannot drift apart. .git and .github
// are added because upload-pages-artifact drops those itself, whatever the file says.
//
// An entry may name a path, not only a top-level directory, and since 2026-09-16 it may be a glob:
// matching only the first path segment here silently served two files the deploy drops (measured
// 2026-09-11), and naming each chapter's FIGURES.md by hand would have published chapter 4's. Neither
// `rm` nor `xargs` expands a glob, so the workflow no longer asks them to — it asks
// tools/pages-exclude.js for the paths and deletes those. One compiler, one meaning.
const excludesPublished = makeMatcher(PATTERNS);
const isExcluded = (rel) => {
  const path = rel.split(sep).join('/');
  return NEVER_WALKED.includes(path) || NEVER_WALKED.some((e) => path.startsWith(`${e}/`)) || excludesPublished(path);
};

// One page list for the whole repo, discovered from disk in lib/browser.js. This gate serves the site
// from a sub-path, so the leading slash comes off; the lab is not a reader page and is appended here.
//
// SUBPATH_PAGES trims it, the way SHOT_PAGES trims `npm run shot` and DEVICE_PAGES trims `npm run
// devices`, and a value naming no page stops the run rather than emptying it (tools/lib/trim.js). A
// trimmed run proves only the pages it names, and the gate's verdict line says which. It exists because
// the evidence this gate is asked for is often about ONE page — two runs of /today/ compared frame for
// frame — and a 52-load run of a tree several people are editing cannot answer that question: the frames
// differ for reasons that have nothing to do with the prefix. `npm test` runs it untrimmed.
const ALL_PAGES = [
  ...SITE_PAGES.map((p) => ({ id: p.id, path: p.path.replace(/^\//, '') })),
  { id: 'lab', path: 'lab/', query: 'kind=cell3d' },
];
const PAGES = trim('SUBPATH_PAGES', ALL_PAGES, { idOf: (p) => p.id, noun: 'page', hint: PAGE_HINT });
// LOCAL, and deliberately two. `tools/lib/browser.js` exports a `VIEWPORTS` of three — phone, tablet,
// desktop — which `tools/shot.js` and `tools/inspect.js` import, and this list shadows that name with a
// shorter one. That is easy to misread: a reader who sees `for (const vp of VIEWPORTS)` below and knows
// the shared export will take this gate for a three-width run and its header for stale prose. It is not.
// This gate's question is the PREFIX — a root-only absolute path, a same-origin 4xx, a request escaping
// /textbook/ — none of which is a function of the width, and the widths are here only so that the overflow
// check has the two ends of the range. The three-width overflow claim belongs to `npm run shot`, at the
// root, where it is made. Widening this list is a decision to take with the header and the AGENTS.md
// bullet, both of which say two; narrowing it is one too. (Nearly misread this way on 2026-09-16.)
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
// Which pages this run judged, and — said out loud — which it did not. A trimmed run that printed only
// "clean under /textbook/" would read as a verdict about the site; `npm run devices` prints the same
// sentence for the same reason.
function pagesVerdict() {
  const ran = PAGES.map((p) => p.id);
  const skipped = ALL_PAGES.map((p) => p.id).filter((id) => !ran.includes(id));
  if (!skipped.length) return `pages:   judged all ${ran.length} of the tree's page(s).`;
  return `pages:   judged ${ran.length} of the tree's ${ALL_PAGES.length} page(s): ${ran.join(', ')}. OUTSIDE THIS RUN, so this is not a site-wide verdict: ${skipped.join(', ')} — SUBPATH_PAGES=${process.env.SUBPATH_PAGES} selected ${ran.join(', ')}.`;
}

if (failures) {
  console.error(`FAIL: ${failures} of ${report.length} page loads had problems under ${PREFIX} (tree sha256:${digest.sha256}); see ${OUT}/report.json`);
  console.error(pagesVerdict());
  process.exit(1);
}
console.log(`subpath: ${report.length} page loads clean under ${PREFIX} for tree sha256:${digest.sha256}; screenshots in ${OUT}/`);
console.log(pagesVerdict());
