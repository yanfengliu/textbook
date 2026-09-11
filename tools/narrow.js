// npm run narrow: mount every figure at phone width and check that what it draws is actually there.
//
// Claim: at a 390 px stage, in both themes, every registered figure reaches `ready`, draws a frame
// that is not blank, flat or near-black, keeps at least one control reachable and pressable, and
// stays ready after it is pressed. Fails naming the kind, the theme and the
// measure, and on any console error, page error or failed request.
//
// Why this exists: five of the nine figures gained a second composition for a narrow stage, built
// because their desktop drawings rendered type at about four device pixels on a phone. None of that
// code had a gate. `tools/drive.js` runs one viewport, 1000x640, and `tools/shot.js` loads the phone
// chapter but only asks whether the page threw. A whole second layout per figure was therefore
// standing on one worker's screenshots.
//
// Bound: it proves the narrow layout renders and survives being used, not that it is legible and not
// that its controls do the right thing. Type size is a judgement a person makes from `out/narrow/`,
// which this writes at three times scale for that purpose. It presses one control per figure and only
// asks that the figure stay ready, because several controls are correctly idempotent (Reset view at
// the default view, a mode button already in that mode); what a control *does* is drive.js's question
// at desktop width. So this is a smoke test of the narrow arrangement, not a second set of recipes.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { pngStats } from './lib/pixels.js';
import { KINDS } from '../src/figures/registry.js';

const OUT = 'out/narrow';
const WIDTH = 390;
const HEIGHT = 844;
const THEMES = process.env.NARROW_THEMES ? process.env.NARROW_THEMES.split(',') : ['light', 'dark'];
const wanted = process.env.NARROW_KINDS ? process.env.NARROW_KINDS.split(',') : KINDS;

// The same judgement the 3D sweep uses, on the same bare-canvas principle: overlays hidden, because a
// toolbar and a card vary enough to look like a drawing.
const LIMITS = { darkFraction: 0.5, minStd: 6, dominantFraction: 0.985, minMean: 8 };

function judge(stats) {
  const bad = [];
  if (stats.darkFraction > LIMITS.darkFraction) bad.push(`${(stats.darkFraction * 100).toFixed(1)}% of the frame is near black, over the ${LIMITS.darkFraction * 100}% allowed`);
  if (stats.std < LIMITS.minStd) bad.push(`luminance spread ${stats.std.toFixed(2)} is under ${LIMITS.minStd}: the frame is flat`);
  if (stats.dominantFraction > LIMITS.dominantFraction) bad.push(`one colour fills ${(stats.dominantFraction * 100).toFixed(1)}% of the frame, over the ${LIMITS.dominantFraction * 100}% allowed: the frame is blank`);
  if (stats.mean < LIMITS.minMean) bad.push(`mean luminance ${stats.mean.toFixed(1)} is under ${LIMITS.minMean}`);
  return bad;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const problems = [];
let frames = 0;

try {
  for (const kind of wanted) {
    for (const theme of THEMES) {
      const where = `${kind} ${theme}`;
      // Three times scale: the point of the narrow layouts is type size, and a 390 px screenshot is
      // too small for a person to judge that from.
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 3 });
      page.setDefaultTimeout(ACTION_TIMEOUT_MS);
      const errors = collectErrors(page);
      const id = `lab-${kind}`;
      let described;
      try {
        const figures = await openPage(page, `${server.url}/lab/?kind=${kind}&theme=${theme}&eager=1&t=0&width=text`);
        described = figures[id];
      } catch (err) {
        problems.push(`${where}: ${err.message}`);
        await page.close();
        continue;
      }
      if (!described || described.state !== 'ready') {
        problems.push(`${where}: the figure is in state "${described?.state}"${described?.error ? `: ${described.error}` : ''}`);
        await page.close();
        continue;
      }

      const stage = page.locator(`#${id} .tb-figure__stage`);
      const box = await stage.boundingBox();
      if (!box || box.width > WIDTH + 1) problems.push(`${where}: the stage is ${box ? Math.round(box.width) : '?'} px wide in a ${WIDTH} px viewport, so it is not laid out narrow`);

      // The labelled frame for a person, then the bare one for the measure.
      await stage.screenshot({ path: `${OUT}/${kind}-${theme}.png`, type: 'png' });
      await page.addStyleTag({ content: '.narrow-bare .fig-label, .narrow-bare .fig-toolbar, .narrow-bare .fig-chip, .narrow-bare .fig-card, .narrow-bare .tb-figure__placeholder { visibility: hidden !important; }' });
      await page.evaluate(() => document.body.classList.add('narrow-bare'));
      const bare = `${OUT}/${kind}-${theme}-bare.png`;
      await stage.screenshot({ path: bare, type: 'png' });
      await page.evaluate(() => document.body.classList.remove('narrow-bare'));
      const stats = await pngStats(page, bare);
      for (const p of judge(stats)) problems.push(`${where}: ${p}`);
      frames += 1;

      // The controls must still be there and still do something. One control, pressed for real.
      const buttons = await stage.locator('button:visible').count();
      const ranges = await stage.locator('input[type=range]:visible').count();
      // Which button to press is not obvious. The first visible one may be disabled by design
      // (Pasteur's Play before the broth is boiled, a scrubber's Previous at the first step), and it
      // may be the toggle that is already on (the tree opens in its Domains mode), where changing
      // nothing is the correct behaviour rather than an inert control. So: the first enabled button
      // that is not already pressed, falling back to any enabled one.
      let pressable = null;
      let fallback = null;
      for (let i = 0; i < buttons; i += 1) {
        const candidate = stage.locator('button:visible').nth(i);
        if (!(await candidate.isEnabled())) continue;
        if (!fallback) fallback = candidate;
        if ((await candidate.getAttribute('aria-pressed')) !== 'true') {
          pressable = candidate;
          break;
        }
      }
      pressable = pressable || fallback;
      if (buttons === 0 && ranges === 0) {
        problems.push(`${where}: no button or slider is reachable at ${WIDTH} px, so the narrow layout has dropped its controls`);
      } else if (buttons > 0 && !pressable) {
        problems.push(`${where}: all ${buttons} visible button(s) are disabled at ${WIDTH} px, so nothing can be operated`);
      } else if (pressable) {
        const before = JSON.stringify(await page.evaluate((i) => document.getElementById(i).describe(), id));
        const first = pressable;
        const name = (await first.textContent())?.trim().slice(0, 24);
        await first.click();
        await page.waitForTimeout(500);
        const after = await page.evaluate((i) => document.getElementById(i).describe(), id);
        if (after.state !== 'ready') problems.push(`${where}: pressing "${name}" left the figure in state "${after.state}"`);
        // Deliberately NOT asserting that the state changed. Several controls are correctly
        // idempotent — Reset view at the default view, a mode button that is already the mode — and a
        // gate that called those inert would be asserting something untrue. What a control *does* is
        // drive.js's question, at desktop width; this one asks whether the narrow layout still has its
        // controls, still lets them be pressed, and survives the press.
        void before;
      }

      for (const e of errors) problems.push(`${where} page error: ${e}`);
      console.log(`${problems.length ? 'note' : 'ok  '} ${where}: stage ${Math.round(box?.width ?? 0)} px, ${buttons} button(s), ${ranges} slider(s)`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} problem(s) over ${frames} narrow frame(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`narrow: ${frames} frames at ${WIDTH} px across ${wanted.length} figures; look at ${OUT}/`);
