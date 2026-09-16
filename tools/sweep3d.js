// npm run sweep3d: for every WebGL figure, render a sweep of camera angles and distances in the lab and
// write each frame to out/sweep/ for a person to look at.
//
// Claim: for each 3D kind, at twelve views (four azimuths x three polar angles, at the default distance)
// plus a near and a far view and one dark-theme view, the rendered stage is neither black, blank, nor
// flat: the near-black fraction stays under 0.5, the luminance spread (std) is above 6, no single 4-bit
// colour fills more than 98.5% of the frame, and the mean luminance is above 8. Fails naming the kind,
// the view and the measure.
//
// Bound: it detects an absent frame, not a wrong one. A cell rendered upside down, mislabelled, or with
// the nucleus outside the membrane passes it; the person reading out/sweep/ is the check for that. The
// measure is taken on the WebGL canvas alone, with every HTML overlay (labels, toolbar, chips, cards)
// hidden through the .sweep-bare class: the first version measured the whole stage, and a figure whose
// render was replaced by a clear still passed because fifteen labels and three buttons vary enough to
// look like a frame (proved 2026-09-10, docs/learning/gate-proofs.md). The labelled frame is still
// written beside the bare one for a person to look at. The renderer is SwiftShader unless SWEEP_GPU=1.
// SWEEP_VIEWS=<n> trims the azimuth count for CI; SWEEP_KINDS=<a,b> trims the run to those kinds, and a
// trimmed run proves only its part.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { pngStats } from './lib/pixels.js';
import { FIGURES } from '../src/figures/registry.js';

const OUT = 'out/sweep';
const gpu = process.env.SWEEP_GPU === '1';
const wanted = process.env.SWEEP_KINDS ? process.env.SWEEP_KINDS.split(',') : null;
const kinds = Object.entries(FIGURES).filter(([k, f]) => f.needsWebGL && (!wanted || wanted.includes(k))).map(([k]) => k);
const azimuths = Number(process.env.SWEEP_VIEWS || 4);

// The helix is a thin column against a large paper ground, so its far frame is legitimately about
// 97% one colour: measured at 0.96981 against a 0.97 limit, which went red when another worker's CSS
// changed the stage height by one pixel. A bound a thousandth away from the real value is measuring
// the layout rather than the render, so it sits at 0.985, still far below the 0.999 an empty frame
// gives. The mutation proof in docs/learning/gate-proofs.md was re-run at this value.
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
const browser = await launch({ gpu });
const report = [];
let failures = 0;
try {
  for (const kind of kinds) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
      page.setDefaultTimeout(ACTION_TIMEOUT_MS);
      const errors = collectErrors(page);
      const id = `lab-${kind}`;
      let figures;
      try {
        figures = await openPage(page, `${server.url}/lab/?kind=${kind}&theme=${theme}&eager=1&t=0`);
      } catch (err) {
        failures += 1;
        console.log(`FAIL ${kind} ${theme}: ${err.message}`);
        await page.close();
        continue;
      }
      await page.addStyleTag({ content: '.sweep-bare .fig-label, .sweep-bare .fig-toolbar, .sweep-bare .fig-chip, .sweep-bare .fig-card, .sweep-bare .tb-figure__placeholder { visibility: hidden !important; }' });
      const info = figures[id];
      if (!info || info.state !== 'ready') {
        failures += 1;
        console.log(`FAIL ${kind} ${theme}: figure state "${info?.state}"${info?.error ? `: ${info.error}` : ''}`);
        await page.close();
        continue;
      }
      const d0 = info.view?.distance;
      if (!d0) {
        failures += 1;
        console.log(`FAIL ${kind} ${theme}: describe() reports no view.distance, so the sweep cannot choose distances`);
        await page.close();
        continue;
      }
      const views = [];
      if (theme === 'light') {
        for (let i = 0; i < azimuths; i += 1) {
          for (const phi of [0.45, 1.15, 2.3]) views.push({ theta: (i / azimuths) * Math.PI * 2, phi, distance: d0 });
        }
        views.push({ theta: 0.7, phi: 1.1, distance: d0 * 0.5 });
        views.push({ theta: 2.2, phi: 1.3, distance: d0 * 1.7 });
      } else {
        views.push({ theta: 0.6, phi: 1.15, distance: d0 });
      }
      for (let i = 0; i < views.length; i += 1) {
        const v = views[i];
        const file = `${OUT}/${kind}-${theme}-${String(i).padStart(2, '0')}.png`;
        const problems = [];
        try {
          await page.evaluate(({ id, v }) => {
            window.__textbook.figures[id].handle.setView(v);
          }, { id, v });
          await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
          await page.locator(`#${id} .tb-figure__stage`).screenshot({ path: file, type: 'png' });
          const bare = file.replace(/\.png$/, '-bare.png');
          await page.evaluate(() => document.body.classList.add('sweep-bare'));
          await page.locator(`#${id} .tb-figure__stage`).screenshot({ path: bare, type: 'png' });
          await page.evaluate(() => document.body.classList.remove('sweep-bare'));
          const stats = await pngStats(page, bare);
          problems.push(...judge(stats));
          report.push({ kind, theme, view: v, file, stats, problems });
        } catch (err) {
          problems.push(err.message);
          report.push({ kind, theme, view: v, file, problems });
        }
        const label = `${kind} ${theme} theta=${v.theta.toFixed(2)} phi=${v.phi.toFixed(2)} d=${v.distance.toFixed(1)}`;
        if (problems.length) {
          failures += 1;
          console.log(`FAIL ${label}`);
          for (const p of problems) console.log(`  ${p}`);
        } else {
          console.log(`ok   ${label} -> ${file}`);
        }
      }
      if (errors.length) {
        failures += 1;
        console.log(`FAIL ${kind} ${theme}: ${errors.length} page error(s)`);
        for (const e of errors) console.log(`  ${e}`);
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
if (!kinds.length) {
  console.error('FAIL: the registry lists no WebGL figure, so the sweep ran on nothing');
  process.exit(1);
}
if (failures) {
  console.error(`FAIL: ${failures} problem(s) across ${report.length} frames; see ${OUT}/report.json`);
  process.exit(1);
}
console.log(`sweep3d: ${report.length} frames rendered for ${kinds.join(', ')}; look at ${OUT}/`);
