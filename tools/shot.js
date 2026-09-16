// npm run shot: load every page at phone, tablet and desktop widths in both themes, with every figure
// mounted (?eager=1) and every clock pinned (?t=0), and write full-page screenshots to out/shots/.
//
// Claim: a page passes when it reaches the handshake with no console error, no uncaught page error, no
// failed request, no figure in the error state, no horizontal overflow of the document, and — on a page
// whose `<html lang>` this gate knows the script of — every figure caption's number word (`.fig-num`)
// and the figure's aria-label in that script's word. Fails otherwise and names the page, viewport,
// theme and the errors.
//
// Bound: three viewports, two themes, one pinned time, one renderer (SwiftShader unless SHOT_GPU=1);
// SHOT_PAGES, SHOT_VIEWPORTS and SHOT_THEMES trim the matrix and a trimmed run proves only its part, and
// a value naming no page, viewport or theme stops the run rather than emptying it (tools/lib/trim.js).
// It proves the pages load and lay out; it says nothing about whether the pixels are right, which is
// what the screenshots it writes are for. A visual defect inside a figure that throws nothing passes
// this gate. The caption-word check knows English and Chinese (`en`, `zh`, `zh-Hans`, `zh-Hant`) and
// nothing else; a page in another language is not asked.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES, VIEWPORTS, THEMES } from './lib/browser.js';
import { trim, PAGE_HINT } from './lib/trim.js';

const OUT = 'out/shots';
const gpu = process.env.SHOT_GPU === '1';
const themes = trim('SHOT_THEMES', THEMES, { noun: 'theme' });
const viewports = trim('SHOT_VIEWPORTS', VIEWPORTS, { idOf: (v) => v.id, noun: 'viewport' });
const pages = trim('SHOT_PAGES', PAGES, { idOf: (p) => p.id, noun: 'page', hint: PAGE_HINT });

// The word the frame writes before a figure's number, by the page's script. `test/lexicon.test.js`
// reads authored files and cannot see what the frame writes at runtime: every caption of the Simplified
// 資治通鑑 pages read 圖 N.1 over prose citing 图 N.1, because src/components/figure.js keyed its word on
// the primary subtag alone (found by review, 2026-09-16). This table is this gate's own and not the
// frame's, so it is not the code agreeing with itself.
function figureWordFor(lang) {
  const l = String(lang || '').toLowerCase();
  if (l === 'zh-hant' || l.startsWith('zh-hant-')) return '圖';
  if (l === 'zh' || l.startsWith('zh-')) return '图';
  if (l === 'en' || l.startsWith('en-')) return 'Figure';
  return null;
}

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
        let captionNote = '';
        const started = Date.now();
        try {
          figures = await openPage(page, `${server.url}${pageDef.path}?eager=1&t=0&theme=${theme}`);
          for (const [id, f] of Object.entries(figures)) {
            if (f.state !== 'ready') problems.push(`figure ${id} (${f.kind}) is in state "${f.state}"${f.error ? `: ${f.error}` : ''}`);
          }
          const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
          if (overflow.scrollWidth > overflow.clientWidth + 1) problems.push(`the document overflows horizontally: scrollWidth ${overflow.scrollWidth} > viewport ${overflow.clientWidth}`);
          const captions = await page.evaluate(() => ({
            lang: document.documentElement.getAttribute('lang') || '',
            nums: [...document.querySelectorAll('tb-figure figcaption .fig-num')].map((n) => ({
              id: n.closest('tb-figure')?.id ?? '?',
              text: n.textContent.trim(),
              label: n.closest('figure')?.getAttribute('aria-label') ?? '',
            })),
          }));
          const word = figureWordFor(captions.lang);
          if (word) {
            for (const c of captions.nums) {
              if (!c.text.startsWith(`${word} `)) problems.push(`the caption of ${c.id} numbers itself "${c.text}", but a page in lang="${captions.lang}" writes its figure word as "${word}"`);
              if (!c.label.startsWith(`${word} `)) problems.push(`the aria-label of ${c.id} is "${c.label}", so a screen reader hears a word other than "${word}" before it on a lang="${captions.lang}" page`);
            }
            captionNote = `, ${captions.nums.length} caption(s) in "${word}"`;
          }
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
          console.log(`ok   ${label} (${ms} ms, ${Object.keys(figures).length} figures ready${captionNote})`);
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
