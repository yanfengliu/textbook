// npm run shot: load every page at phone, tablet and desktop widths in both themes, with every figure
// mounted (?eager=1) and every clock pinned (?t=0), and write full-page screenshots to out/shots/.
//
// Claim: a page passes when it reaches the handshake with no console error, no uncaught page error, no
// failed request, no figure in the error state, and no horizontal overflow of the document. Fails
// otherwise and names the page, viewport, theme and the errors.
//
// Bound: three viewports, two themes, one pinned time, one renderer (SwiftShader unless SHOT_GPU=1);
// SHOT_PAGES, SHOT_VIEWPORTS and SHOT_THEMES trim the matrix and a trimmed run proves only its part. It
// proves the pages load and lay out; it says nothing about whether the pixels are right, which is what
// the screenshots it writes are for. A visual defect inside a figure that throws nothing passes this gate.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES, VIEWPORTS, THEMES } from './lib/browser.js';

const OUT = 'out/shots';
const gpu = process.env.SHOT_GPU === '1';
const themes = process.env.SHOT_THEMES ? process.env.SHOT_THEMES.split(',') : THEMES;
const viewports = process.env.SHOT_VIEWPORTS ? VIEWPORTS.filter((v) => process.env.SHOT_VIEWPORTS.split(',').includes(v.id)) : VIEWPORTS;
const pages = process.env.SHOT_PAGES ? PAGES.filter((p) => process.env.SHOT_PAGES.split(',').includes(p.id)) : PAGES;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch({ gpu });
const report = [];
let failures = 0;
try {
  for (const pageDef of pages) {
    for (const vp of viewports) {
      for (const theme of themes) {
        const label = `${pageDef.id} ${vp.id} ${theme}`;
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
        page.setDefaultTimeout(ACTION_TIMEOUT_MS);
        const errors = collectErrors(page);
        const problems = [];
        let figures = {};
        const started = Date.now();
        try {
          figures = await openPage(page, `${server.url}${pageDef.path}?eager=1&t=0&theme=${theme}`);
          for (const [id, f] of Object.entries(figures)) {
            if (f.state !== 'ready') problems.push(`figure ${id} (${f.kind}) is in state "${f.state}"${f.error ? `: ${f.error}` : ''}`);
          }
          const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
          if (overflow.scrollWidth > overflow.clientWidth + 1) problems.push(`the document overflows horizontally: scrollWidth ${overflow.scrollWidth} > viewport ${overflow.clientWidth}`);
          const file = `${OUT}/${pageDef.id}-${vp.id}-${theme}.png`;
          await page.screenshot({ path: file, type: 'png', fullPage: true });
        } catch (err) {
          problems.push(err.message);
        }
        for (const e of errors) problems.push(e);
        await page.close();
        const ms = Date.now() - started;
        const entry = { page: pageDef.id, viewport: vp.id, theme, ms, figures: Object.fromEntries(Object.entries(figures).map(([k, v]) => [k, { kind: v.kind, state: v.state, drawCalls: v.drawCalls, triangles: v.triangles }])), problems };
        report.push(entry);
        if (problems.length) {
          failures += 1;
          console.log(`FAIL ${label} (${ms} ms)`);
          for (const p of problems) console.log(`  ${p}`);
        } else {
          console.log(`ok   ${label} (${ms} ms, ${Object.keys(figures).length} figures ready)`);
        }
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
if (failures) {
  console.error(`FAIL: ${failures} of ${report.length} page loads had problems; see ${OUT}/report.json`);
  process.exit(1);
}
console.log(`shot: ${report.length} page loads clean; screenshots in ${OUT}/`);
