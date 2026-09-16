// node tools/inspect.js <page-id> [--viewport phone|tablet|desktop] [--theme light|dark] [--at "#sel,#sel2"]
//                       [--label <name>] [--lazy] [--t 0] [--gpu]
//
// Viewport-sized frames of a page at named elements. A diagnostic for looking at a long page one screen
// at a time, which a full-page screenshot scaled to fit cannot give. Not a gate: it asserts nothing about
// the page. It exits non-zero only when it could not do what was asked: a bad argument, a page that never
// reached the handshake, or a selector list that matched nothing.
//
// The directory is the run. out/inspect/ is emptied before the first frame is written, the way every gate
// empties its own directory, so after a run each file in it is from that run and nothing from an earlier
// one sits beside them under a name a reader would take as current. It used to only overwrite: a run with
// two selectors left frames 02-04 of an earlier five-selector run in place, a run whose selector matched
// nothing left every earlier frame in place, and on 2026-09-15 a dark frame captured hours before a
// redesign was read as the redesigned page. A stale frame and a fresh one are pixel-identical apart from
// being true, so the reader is not asked to check a timestamp: there is nothing stale left to open.
//
// --label <name> writes to out/inspect-<name>/ instead, emptied the same way, so two runs can be kept for
// a before/after comparison: `--label before`, change something, run again without the label. The name is
// 1-32 characters of a-z, 0-9, underscore or hyphen, so the directory is always one of this tool's own.
//
// Files are <page>-<viewport>-<theme>-<NN>-<selector>.png, NN in --at order and the selector reduced to
// a-z, 0-9 and hyphens, so the file says what it shows. A selector that matches nothing is reported and
// skipped; when none matches the directory is left empty, the run says so, and exits 2.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES, VIEWPORTS, THEMES } from './lib/browser.js';

const LABEL_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;

function usage(message) {
  console.error(`${message}; see the header of tools/inspect.js`);
  process.exit(2);
}

const argv = process.argv.slice(2);
const opts = { page: null, viewport: 'desktop', theme: 'light', at: ['body'], label: null, eager: true, t: '0', gpu: false };
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  const value = () => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) usage(`${a} needs a value`);
    i += 1;
    return v;
  };
  if (a === '--viewport') opts.viewport = value();
  else if (a === '--theme') opts.theme = value();
  else if (a === '--at') opts.at = value().split(',');
  else if (a === '--label') opts.label = value();
  else if (a === '--t') opts.t = value();
  else if (a === '--gpu') opts.gpu = true;
  else if (a === '--lazy') opts.eager = false;
  else if (!a.startsWith('--')) opts.page = a;
  else usage(`unknown argument ${a}`);
}
const pageDef = PAGES.find((p) => p.id === opts.page);
if (!pageDef) usage(`inspect needs a page id, one of ${PAGES.map((p) => p.id).join(', ')}`);
const vp = VIEWPORTS.find((v) => v.id === opts.viewport);
if (!vp) usage(`unknown viewport ${opts.viewport}; one of ${VIEWPORTS.map((v) => v.id).join(', ')}`);
if (!THEMES.includes(opts.theme)) usage(`unknown theme ${opts.theme}; one of ${THEMES.join(', ')}`);
if (opts.label !== null && !LABEL_RE.test(opts.label)) {
  usage(`--label "${opts.label}" is not usable as a directory name; use 1 to 32 characters of a-z, 0-9, underscore or hyphen, starting with a letter or digit`);
}

const OUT = opts.label === null ? 'out/inspect' : `out/inspect-${opts.label}`;
// The selector, reduced to what a file name can carry. The index stays in front, so two selectors that
// reduce to the same word still get two files.
const slug = (sel) => sel.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/^-|-$/g, '') || 'el';

// Emptied here, after the arguments are known to be good, so a mistyped page id or label reports and
// touches nothing.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
console.log(`emptied ${OUT}/`);
const server = await startServer({ port: 0, quiet: true });
const browser = await launch({ gpu: opts.gpu });
let written = 0;
try {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const errors = collectErrors(page);
  const q = new URLSearchParams({ theme: opts.theme });
  if (opts.eager) {
    q.set('eager', '1');
    q.set('t', opts.t);
  }
  await openPage(page, `${server.url}${pageDef.path}?${q}`);
  for (let i = 0; i < opts.at.length; i += 1) {
    const sel = opts.at[i];
    const found = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return false;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      window.scrollBy(0, -70);
      return true;
    }, sel);
    if (!found) {
      console.log(`skip ${sel}: no element matches`);
      continue;
    }
    await page.waitForTimeout(300);
    const file = `${OUT}/${pageDef.id}-${vp.id}-${opts.theme}-${String(i).padStart(2, '0')}-${slug(sel)}.png`;
    await page.screenshot({ path: file, type: 'png' });
    written += 1;
    console.log(`wrote ${file} (${sel})`);
  }
  if (errors.length) {
    console.log(`${errors.length} page error(s) while inspecting (not a gate; listed for information):`);
    for (const e of errors.slice(0, 8)) console.log(`  ${e}`);
  }
} finally {
  await browser.close();
  await server.close();
}
if (written === 0) {
  console.error(`wrote nothing: none of ${opts.at.join(', ')} matches an element on ${pageDef.id}, so ${OUT}/ is empty`);
  process.exit(2);
}
console.log(`${written} frame(s) in ${OUT}/`);
