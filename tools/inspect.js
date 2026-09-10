// node tools/inspect.js <page-id> [--viewport phone|tablet|desktop] [--theme light|dark] [--at "#sel,#sel2"]
//                       [--eager] [--t 0] [--gpu]
//
// Viewport-sized frames of a page at named elements, written to out/inspect/. A diagnostic for looking
// at a long page one screen at a time, which a full-page screenshot scaled to fit cannot give. Not a
// gate: it asserts nothing.
import { mkdirSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES, VIEWPORTS } from './lib/browser.js';

const argv = process.argv.slice(2);
const opts = { page: null, viewport: 'desktop', theme: 'light', at: ['body'], eager: true, t: '0', gpu: false };
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--viewport') opts.viewport = argv[++i];
  else if (a === '--theme') opts.theme = argv[++i];
  else if (a === '--at') opts.at = argv[++i].split(',');
  else if (a === '--t') opts.t = argv[++i];
  else if (a === '--gpu') opts.gpu = true;
  else if (a === '--lazy') opts.eager = false;
  else if (!a.startsWith('--')) opts.page = a;
  else throw new Error(`unknown argument ${a}; see the header of tools/inspect.js`);
}
const pageDef = PAGES.find((p) => p.id === opts.page);
if (!pageDef) {
  console.error(`inspect needs a page id, one of ${PAGES.map((p) => p.id).join(', ')}`);
  process.exit(2);
}
const vp = VIEWPORTS.find((v) => v.id === opts.viewport);
if (!vp) {
  console.error(`unknown viewport ${opts.viewport}; one of ${VIEWPORTS.map((v) => v.id).join(', ')}`);
  process.exit(2);
}

mkdirSync('out/inspect', { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch({ gpu: opts.gpu });
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
    const file = `out/inspect/${pageDef.id}-${vp.id}-${opts.theme}-${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: file, type: 'png' });
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
