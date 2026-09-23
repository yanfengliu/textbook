// npm run narrow: mount every figure at phone width, open what a reader can open, and check that what
// it draws is actually there and does not land on top of itself.
//
// Claim: at a 390 px stage, in both themes, every registered figure reaches `ready`, draws a frame
// that is not blank, flat or near-black, keeps at least one control reachable and pressable, and
// stays ready after it is pressed — and in the opening state AND in every state the toolbar's own
// toggles can open, its toolbar stays under CROWD.toolbarShare of the stage and, on a figure built on
// `src/figures/lib/bench.js`, no pane's drawing lands on another pane's drawing or on a control. Fails
// naming the kind, the theme, the presses that got there and the measure, and on any console error,
// page error or failed request.
//
// The crowding measure is keyed on `.fig-toolbar`, so it can fail by finding nothing: a figure that
// builds its own bar under its own class reports a 0 px toolbar in 0 rows, which is byte-for-byte what
// a figure with no controls reports. That is the local rule "a check must fail when its subject is
// missing", so a stage carrying visible controls of which NONE is inside a `.fig-toolbar` is a failure
// naming the count and the selector, and every line prints how many of the stage's controls the
// toolbar measure actually held.
//
// Why this exists: five of the nine figures gained a second composition for a narrow stage, built
// because their desktop drawings rendered type at about four device pixels on a phone. None of that
// code had a gate. `tools/drive.js` runs one viewport, 1000x640, and `tools/shot.js` loads the phone
// chapter but only asks whether the page threw. A whole second layout per figure was therefore
// standing on one worker's screenshots.
//
// Why it presses, added 2026-09-17. `enzyme-kinetics` reached a state at 390 px where its toolbar took
// TEN ROWS and 320 px of a 456 px stage, the readout was drawn over the graph, and the lane was a 40 px
// sliver. A reader got there by pressing two buttons. This gate was green on it, because it measured
// the OPENING STATE and every one of those defects lives behind a press — the "fixture that ends early"
// shape, a check whose bound is the first frame reporting confidently on everything after it. So the
// gate now opens what opens, and measures after every press.
//
// HOW IT DECIDES WHAT A READER CAN OPEN, and this is the part to argue with. Nothing in this repository
// declares a disclosure: `lib/bench.js` has no disclosure primitive, and `enzyme-kinetics` builds its
// two out of `b.toggle` plus `node.style.display`. So a disclosure cannot be read off the markup and is
// found by TRYING: a candidate is a **visible, enabled `button` inside `.fig-toolbar` that carries an
// `aria-pressed` attribute** — a control whose press is a state the reader can leave on. Each is pressed
// once, in DOM order; if the press made FEWER controls visible it is pressed a second time to try to
// undo it. The toolbar is re-read between rounds, because a press can reveal a toggle that was not there
// before (`enzyme-kinetics`'s Conditions reveals three controls, its Cases six). Every state visited is
// measured, so the search's only job is to reach crowded states, not to end in one.
//
// WHAT THAT RULE MISSES, stated rather than implied:
//   - **A disclosure with no `aria-pressed`.** DEMONSTRATED, not asserted: the same `enzyme-kinetics`
//     defect, with its two disclosures built from `b.action` instead of `b.toggle`, leaves this gate
//     GREEN, exit 0 — while the identical tree with the candidate rule widened to every visible button
//     goes red with the same two complaints word for word (`docs/learning/gate-proofs.md`, arms B and
//     B'). None exists in the book today, and one would be an accessibility defect on its own, but this
//     gate neither checks for that nor sees what it hides.
//   - **Controls a figure draws outside its `.fig-toolbar`.** None of them is ever pressed, and their
//     height is not in the toolbar measure. Zero of them in the toolbar is a failure (above); a
//     PARTIAL split is not, and is printed instead — `zj-words` puts 4 of its 27 controls in the
//     toolbar, `permeability` 7 of 16, `bondlab` 3 of 15, `prokaryote` 2 of 14.
//   - **A disclosure a slider or the drawing opens.** Only buttons are pressed. `enzyme-kinetics` shows
//     its inhibitor slider when the inhibitor CHOICE changes, which is a button and is reached; a figure
//     that revealed controls above a slider value would not be.
//   - **Combinations past greedy.** Nineteen controls is half a million states. The sweep is one press
//     per candidate per round, so a crowded state that needs two specific presses IN THE OTHER ORDER,
//     or needs a press already undone, is not visited. `enzyme-kinetics`'s own mutual exclusion is an
//     example of the shape: opening Cases closes Conditions, so `Conditions open + inhibitor slider` and
//     `Cases open + inhibitor slider` are two states and the sweep holds whichever it reaches second.
//   - **Everything at the other widths.** 390 px only. The same crowding at 320 px is nobody's.
//   - **Whether the layout is any good.** See the bound below.
//
// Actions are deliberately NOT pressed: a button with no `aria-pressed` is Run, Reset, a stepper's `+`,
// a scrubber's Next. None of them reveals a control, and `Reset` destroys the state the sweep has built.
// `tools/legible.js` presses every visible enabled button once, which is right for its question — each
// press is a new paint — and wrong for this one: a press that hides is undone by a later press that
// shows, so the accumulated open state is never held.
//
// Bound: it proves the narrow layout renders, survives being used, and does not collide with itself in
// the states this sweep reaches. It does not prove the layout is LEGIBLE — type size is a judgement a
// person makes from `out/narrow/`, which this writes at three times scale for that purpose, and contrast
// is `npm run legible`'s. The two collision checks are BENCH-ONLY (9 of the 44 registered kinds today:
// phlab and chapter 5's eight), because a pane grid with the toolbar's measured height as its bottom
// padding is a promise only the bench makes — for the other 35 a toolbar floating over the artwork is
// the design, and `pond`'s is. The toolbar-share check runs on all 44. NARROW_KINDS and NARROW_THEMES
// trim the run, a trimmed run proves only its part, and a value naming no kind or theme stops the run
// rather than emptying it (tools/lib/trim.js).
//
// The other demonstrated blind spot, because a stated bound is a claim and a demonstrated one is a
// measurement (docs/policies/local-rules.md): a drawing that overruns SIDEWAYS is not caught. The stage
// is `overflow: hidden`, so it is clipped rather than drawn on anything, and what is clipped collides
// with nothing — it is simply not there. Measured: `enzyme-kinetics` with its x-axis captions drawn
// 300 px right loses every number on its x axis, and this gate exits 0 with numbers identical to the
// control's (`docs/learning/gate-proofs.md`, arm C). That is one half of the report this check was
// written from — "the axis caption overran" — and it is the half it does not hold.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { pngStats } from './lib/pixels.js';
import { trim } from './lib/trim.js';
import { KINDS } from '../src/figures/registry.js';

const OUT = 'out/narrow';
const WIDTH = 390;
const HEIGHT = 844;
const THEMES = trim('NARROW_THEMES', ['light', 'dark'], { noun: 'theme' });
const wanted = trim('NARROW_KINDS', KINDS, { noun: 'kind' });

// The same judgement the 3D sweep uses, on the same bare-canvas principle: overlays hidden, because a
// toolbar and a card vary enough to look like a drawing.
const LIMITS = { darkFraction: 0.5, minStd: 6, dominantFraction: 0.985, minMean: 8 };

// The crowding bars, each a number with a measurement behind it rather than a round figure.
//
// `toolbarShare` — `enzyme-kinetics` in the state that produced this check: 320 px of a 456 px stage,
// 70%, ten rows. Fixed, the worst state a reader can reach on that figure is 196 px, 43%. The worst
// legitimate share measured over all 44 kinds in both themes on 2026-09-17 is recorded on the run's own
// lines; the bar sits above it and below 70%. A figure that wants more than this is telling the reader
// to operate a control panel, not read a book, and should give something up the way that figure did.
//
// `overlapPx` — both edges of the intersection must exceed it, so a halo'd label whose stroke reaches a
// pixel or two into its neighbour is not a collision. It is deliberately small: the defect this is for
// put a whole readout over a whole graph.
//
// `pressRounds`/`maxPresses` — the sweep's own bound, printed on every line.
const CROWD = { toolbarShare: 0.55, overlapPx: 4, pressRounds: 3, maxPresses: 40 };

function judge(stats) {
  const bad = [];
  if (stats.darkFraction > LIMITS.darkFraction) bad.push(`${(stats.darkFraction * 100).toFixed(1)}% of the frame is near black, over the ${LIMITS.darkFraction * 100}% allowed`);
  if (stats.std < LIMITS.minStd) bad.push(`luminance spread ${stats.std.toFixed(2)} is under ${LIMITS.minStd}: the frame is flat`);
  if (stats.dominantFraction > LIMITS.dominantFraction) bad.push(`one colour fills ${(stats.dominantFraction * 100).toFixed(1)}% of the frame, over the ${LIMITS.dominantFraction * 100}% allowed: the frame is blank`);
  if (stats.mean < LIMITS.minMean) bad.push(`mean luminance ${stats.mean.toFixed(1)} is under ${LIMITS.minMean}`);
  return bad;
}

// ---------------------------------------------------------------- what the page measures about itself
//
// Runs in the page, self-contained because page.evaluate serialises it. Everything is in stage
// coordinates, so a number here is directly comparable with the stage's own width and height.
function crowdProbe({ id, tol }) {
  const root = document.getElementById(id);
  const stage = root && root.querySelector('.tb-figure__stage');
  if (!stage) return { error: 'the figure has no .tb-figure__stage' };
  const sr = stage.getBoundingClientRect();
  const box = (el, min = 0.5) => {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return null;
    const r = el.getBoundingClientRect();
    if (r.width < min || r.height < min) return null;
    return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
  };
  const union = (a, b) => {
    if (!a) return b;
    if (!b) return a;
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
  };
  const over = (a, b) => {
    if (!a || !b) return null;
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return w > tol && h > tol ? { w: Math.round(w), h: Math.round(h) } : null;
  };

  // ---- the toolbar and its controls.
  // A control is a leaf: a `.tb-slider` holds an input and two label spans, and counting both the label
  // and the input would invent a row wherever their tops differ by a pixel.
  const toolbar = stage.querySelector('.fig-toolbar');
  let controls = [];
  if (toolbar) {
    const found = [...toolbar.querySelectorAll('button, input, select, .tb-slider')];
    controls = found
      .filter((el) => !found.some((other) => other !== el && other.contains(el)))
      .map((el) => ({ el, r: box(el, 4), name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) }))
      .filter((c) => c.r);
  }
  // Rows by clustering the controls' vertical centres: `align-items: center` puts a button and a slider
  // on one line at slightly different tops, and a row is what the reader sees, not what the box says.
  const centres = controls.map((c) => c.r.y + c.r.h / 2).sort((a, b) => a - b);
  let rows = 0;
  let at = -1e9;
  for (const c of centres) {
    if (c - at > 8) { rows += 1; at = c; }
  }
  const toolbarBox = toolbar ? box(toolbar) : null;
  const toolbarH = toolbarBox ? toolbarBox.h : 0;
  // Every control on the stage, wherever it lives. This exists so the toolbar measure cannot pass by
  // finding nothing: a figure that builds its own bar under its own class reports a 0 px toolbar in
  // 0 rows, which is byte-for-byte what a figure with no controls reports, and one of those is a
  // measurement and the other is the gate looking at the wrong element.
  const stageControls = [...stage.querySelectorAll('button, input[type=range], select')].filter((el) => box(el, 4)).length;

  // ---- the panes, and what is actually drawn in them.
  // The pane's own box is its grid cell; the drawing can leave it, because a pane's <svg> is
  // `overflow: visible`. So the ink is the union of the svg's own children's rendered boxes, which is
  // what a reader sees and what can land on something else.
  const bench = stage.querySelector('.tb-bench');
  const panes = [];
  if (bench) {
    for (const p of bench.querySelectorAll('.tb-pane')) {
      const cell = box(p);
      if (!cell) continue;
      const name = [...p.classList].filter((c) => c.startsWith('tb-pane-')).map((c) => c.slice(8))[0] || 'pane';
      let ink = null;
      const svg = p.querySelector(':scope > svg');
      if (svg) {
        for (const child of svg.children) {
          if (child.classList && child.classList.contains('tb-focus')) continue;
          ink = union(ink, box(child));
        }
      } else {
        const canvas = p.querySelector(':scope > canvas');
        if (canvas) ink = box(canvas);
      }
      panes.push({ name, cell, ink });
    }
  }

  const paneOverPane = [];
  for (let i = 0; i < panes.length; i += 1) {
    for (let j = i + 1; j < panes.length; j += 1) {
      const hit = over(panes[i].ink, panes[j].ink);
      if (hit) paneOverPane.push({ a: panes[i].name, b: panes[j].name, ...hit });
    }
  }
  const paneOverControl = [];
  for (const p of panes) {
    for (const c of controls) {
      const hit = over(p.ink, c.r);
      if (hit) paneOverControl.push({ a: p.name, b: c.name || 'a control', ...hit });
    }
  }

  return {
    stage: { w: Math.round(sr.width), h: Math.round(sr.height) },
    bench: Boolean(bench),
    controls: controls.length,
    stageControls,
    rows,
    toolbarH: Math.round(toolbarH),
    panes: panes.length,
    paneOverPane,
    paneOverControl,
  };
}

// A press hands its work to a click handler, a ResizeObserver and a redraw, and how long those take is a
// statement about how busy the machine is. So this polls the artefact — the toolbar's own geometry,
// frame by frame — and never the wall clock (docs/policies/local-rules.md). It waits for two consecutive
// frames that agree, after at least two frames have passed, and reports whether it settled: a press that
// never settles is a fact about the figure and is printed, not swallowed.
function settleProbe({ id, maxFrames }) {
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const read = () => {
    const bar = document.getElementById(id)?.querySelector('.fig-toolbar');
    if (!bar) return 'none';
    const r = bar.getBoundingClientRect();
    const n = [...bar.querySelectorAll('button, input, .tb-slider')].filter((e) => e.getBoundingClientRect().width > 4).length;
    return `${Math.round(r.height)}|${Math.round(r.width)}|${n}`;
  };
  return (async () => {
    let last = read();
    let same = 0;
    for (let i = 0; i < maxFrames; i += 1) {
      await frame();
      const now = read();
      same = now === last ? same + 1 : 0;
      last = now;
      if (same >= 1 && i >= 1) return { frames: i + 1, settled: true };
    }
    return { frames: maxFrames, settled: false };
  })();
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const problems = [];
const crowdNotes = [];
let frames = 0;
let unsettled = 0;

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

      // Where this figure's own problems start. The line below used to read `problems.length ? …`,
      // which is the whole run's count, so every figure after the first failure printed `note` whether
      // or not anything was wrong with it — a report that cannot tell "this one failed" from "something
      // earlier failed", which is the same shape as a gate that cannot tell passed from did not run.
      const mine = problems.length;
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

      // ---- the crowding sweep -------------------------------------------------------------------
      //
      // Measured at the opening state and again after every press, because the state that collides is
      // not necessarily the state the sweep ends in.
      const measure = () => page.evaluate(crowdProbe, { id, tol: CROWD.overlapPx });
      const settle = async () => {
        const s = await page.evaluate(settleProbe, { id, maxFrames: 24 });
        if (!s.settled) unsettled += 1;
        return s;
      };
      const seenCrowd = new Set();
      let worst = null;
      let states = 0;
      const check = async (howGotHere) => {
        const m = await measure();
        states += 1;
        if (m.error) { problems.push(`${where}: ${m.error}`); return m; }
        const share = m.stage.h ? m.toolbarH / m.stage.h : 0;
        const widest = !worst || m.toolbarH > worst.m.toolbarH;
        if (widest) worst = { m, how: howGotHere, share };
        // A frame of the widest state a press has reached, for a person to look at, because no measure
        // here judges whether the crowded layout is any good. Written from inside the measurement, so it
        // cannot miss a maximum reached by a press outside the sweep's own loop.
        if (widest && states > 1) await stage.screenshot({ path: `${OUT}/${kind}-${theme}-opened.png`, type: 'png' }).catch(() => {});
        const say = [];
        if (m.stageControls > 0 && m.controls === 0) {
          say.push(`${m.stageControls} control(s) are on the stage and none of them is inside a ".fig-toolbar", so the toolbar measures 0 px in 0 rows — which is exactly what a figure with no controls measures. Put the bar in a ".fig-toolbar" (every other figure's is), or teach this gate the class it uses`);
        }
        if (share > CROWD.toolbarShare) {
          say.push(`the toolbar is ${m.toolbarH} px of a ${m.stage.h} px stage (${(share * 100).toFixed(0)}%, over the ${(CROWD.toolbarShare * 100).toFixed(0)}% allowed) in ${m.rows} row(s) of ${m.controls} control(s)`);
        }
        for (const o of m.paneOverPane) say.push(`the pane "${o.a}" is drawn over the pane "${o.b}", ${o.w}x${o.h} px of overlap`);
        for (const o of m.paneOverControl) say.push(`the pane "${o.a}" is drawn over the control "${o.b}", ${o.w}x${o.h} px of overlap`);
        let fresh = false;
        for (const s of say) {
          // One line per distinct complaint: a sweep through fifteen states repeats the same collision
          // in every one of them, and fifteen copies of it hide the second finding.
          if (seenCrowd.has(s)) continue;
          seenCrowd.add(s);
          fresh = true;
          problems.push(`${where}: ${s} — reached by ${howGotHere}`);
        }
        // A frame of the state that failed, not of the state the sweep ends in. No measure here says
        // whether a collision is a readout over a graph or a hairline over a hairline, so the frame is
        // how a person finds out, and it has to be the right state or it answers a different question.
        if (fresh) await stage.screenshot({ path: `${OUT}/${kind}-${theme}-crowd.png`, type: 'png' }).catch(() => {});
        return m;
      };

      const opening = await check('nothing: this is the opening state');
      let latest = null;

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
        const first = pressable;
        // The accessible name before the words on it: a bench control carries BOTH labels as spans and
        // only one is displayed, so `textContent` reads "LadderLadder" and names a button nobody has.
        const name = ((await first.getAttribute('aria-label')) || (await first.textContent()) || '').trim().slice(0, 40);
        await first.click();
        await settle();
        const after = await page.evaluate((i) => document.getElementById(i).describe(), id);
        if (after.state !== 'ready') problems.push(`${where}: pressing "${name}" left the figure in state "${after.state}"`);
        // Deliberately NOT asserting that the state changed. Several controls are correctly
        // idempotent — Reset view at the default view, a mode button that is already the mode — and a
        // gate that called those inert would be asserting something untrue. What a control *does* is
        // drive.js's question, at desktop width; this one asks whether the narrow layout still has its
        // controls, still lets them be pressed, and survives the press.
        latest = await check(`pressing "${name}"`);
      }

      // ---- open what opens ------------------------------------------------------------------------
      //
      // The toolbar is re-read every round and every control addressed by an element handle taken in
      // that round, never by an index into a list that may have changed underneath (a Playwright locator
      // that matches nothing does not fail, it waits — 180 s of it, docs/policies/local-rules.md).
      const tried = new Set();
      const trail = [];
      let presses = 0;
      // The state the sweep actually starts from, which is the one press above and not the opening
      // state — comparing a press against a measurement two states old invents a shrink that never
      // happened, and the sweep would answer it by pressing a control a second time for no reason.
      let last = latest ?? opening;
      for (let round = 0; round < CROWD.pressRounds && presses < CROWD.maxPresses; round += 1) {
        const handles = await stage.locator('.fig-toolbar button[aria-pressed]:visible').elementHandles();
        let pressedAny = false;
        for (const handle of handles) {
          if (presses >= CROWD.maxPresses) { await handle.dispose(); continue; }
          const name = ((await handle.getAttribute('aria-label')) || (await handle.textContent()) || '').trim().slice(0, 40);
          if (!name || tried.has(name)) { await handle.dispose(); continue; }
          tried.add(name);
          if (!(await handle.isEnabled())) { await handle.dispose(); continue; }
          const before = last;
          let clicked = true;
          try {
            await handle.click({ timeout: 5000 });
          } catch {
            clicked = false; // it moved or vanished under the press; the next round re-reads the toolbar
          }
          if (!clicked) { await handle.dispose(); continue; }
          presses += 1;
          pressedAny = true;
          await settle();
          trail.push(name);
          last = await check(`pressing ${trail.map((t) => `"${t}"`).join(' then ')}`);
          // A press that made the toolbar smaller closed something. Press it again to try to put it
          // back — for a toggle that works, and for one member of a mutually exclusive pair it may not,
          // which is why every state is measured rather than only the state the sweep ends in.
          if (!last.error && !before.error && last.controls < before.controls) {
            try {
              await handle.click({ timeout: 5000 });
              presses += 1;
              await settle();
              trail.push(`${name} again`);
              last = await check(`pressing ${trail.map((t) => `"${t}"`).join(' then ')}`);
            } catch { /* it went away; the next round re-reads */ }
          }
          await handle.dispose();
        }
        if (!pressedAny) break;
      }

      for (const e of errors) problems.push(`${where} page error: ${e}`);
      const w = worst;
      const shareTxt = w ? `${w.m.toolbarH}/${w.m.stage.h} px (${(w.share * 100).toFixed(0)}%)` : 'no measure';
      crowdNotes.push({ kind, theme, share: w ? w.share : 0, toolbarH: w ? w.m.toolbarH : 0, stageH: w ? w.m.stage.h : 0, rows: w ? w.m.rows : 0, controls: w ? w.m.controls : 0, bench: w ? w.m.bench : false, states, presses });
      console.log(`${problems.length > mine ? 'FAIL' : 'ok  '} ${where}: stage ${Math.round(box?.width ?? 0)} px, ${buttons} button(s), ${ranges} slider(s), ${presses} press(es) over ${states} state(s), ${w ? w.m.panes : 0} pane(s), worst toolbar ${shareTxt} in ${w ? w.m.rows : 0} row(s) holding ${w ? w.m.controls : 0} of the stage's ${w ? w.m.stageControls : 0} control(s)`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

// The sweep's own census, printed on every run: a line saying `0 press(es)` over a figure with toggles
// is a sweep that did not run, and it must not look like a sweep that found nothing.
const swept = crowdNotes.filter((c) => c.presses > 0).length;
const benched = crowdNotes.filter((c) => c.bench).length;
const worstShare = crowdNotes.slice().sort((a, b) => b.share - a.share).slice(0, 5);
console.log(`narrow: ${frames} frames at ${WIDTH} px across ${wanted.length} figures; ${crowdNotes.reduce((n, c) => n + c.states, 0)} state(s) measured, ${crowdNotes.reduce((n, c) => n + c.presses, 0)} press(es) over ${swept} of ${crowdNotes.length} mount(s), ${benched} of them on the bench (the only ones the two collision checks can read)${unsettled ? `, ${unsettled} press(es) never settled within 24 frames` : ''}`);
console.log(`narrow: the five widest toolbars measured — ${worstShare.map((c) => `${c.kind} ${c.theme} ${c.toolbarH}/${c.stageH} px (${(c.share * 100).toFixed(0)}%) in ${c.rows} row(s) of ${c.controls}`).join('; ')}`);

if (problems.length) {
  console.error(`FAIL: ${problems.length} problem(s) over ${frames} narrow frame(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`narrow: green; look at ${OUT}/, including the ${OUT}/*-opened.png frames of the widest state each sweep reached`);
