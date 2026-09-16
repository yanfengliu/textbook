// Write a sequence, fold it, break it. A short protein chain on a two-dimensional lattice surrounded by
// water. The reader writes the sequence; a seeded Monte Carlo search looks for the arrangement that
// buries the most hydrophobic residues away from the water, and a compact shape with a greasy core
// comes out of a rule that says nothing about shape at all.
//
// The model and the search live in lib/mol-fold.js, so that a harness and a unit test can run exactly
// the code the reader drives rather than a copy of it: read that file for the energy terms, the move
// set and what was measured about the search. This file is the bench — the drawing, the controls and
// what describe() reports.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — the lattice on the left, the readouts in a column on the right, the sequence strip below;
//   narrow — the lattice above the strip, the readouts as three lines rather than a table, and the
//            strip wrapped onto two or three rows rather than shrunk: a thirty-six residue chain
//            across a phone would put each bead at four device pixels with no room for the letter,
//            and the letter is how the reader tells a hydrophobe from a charge.
// Both panes are authored in the stage's own device pixels, so a 10 px label is 10 device pixels.
//
// setTime pins the running search: with the clock pinned the first fold is run to completion at once
// and nothing advances after it, so a screenshot at t is the same frame every run. NOTHING here calls
// Math.random, because the whole claim of the figure is that one sequence folds one way.
import { el, h, text, C, tint, clamp } from './lib/svg.js';
import { round, grouped, readoutCss, readoutTable, fitRows, focusMark, INK } from './lib/mol-draw.js';
import {
  TYPES, N4, MELT_C, AGGREGATE_C, kT, kkey, makeOcc, contactsOf, energyOf, burial, foldKey,
  secondary, createSearch, seedFor, ionicStrength,
} from './lib/mol-fold.js';

export const meta = { kind: 'foldlab', title: 'Write a sequence, fold it, break it', needsWebGL: false, aspect: 16 / 10 };

const MIN_LEN = 16;
const MAX_LEN = 36;
const TYPE_INFO = {
  H: { name: 'hydrophobic', colour: C.gold, glyph: 'H' },
  P: { name: 'polar', colour: C.water, glyph: 'P' },
  '+': { name: 'positively charged', colour: C.coral, glyph: '+' },
  '-': { name: 'negatively charged', colour: C.violet, glyph: '−' },
};
// The sequence the bench opens on. Chosen by running the real search over candidates (the harness is
// in the worker's scratchpad); the number of runs from different starts that reach the same fold is
// in the handoff, and it is what the figure reports as sameFoldFromDifferentStarts.
const DEFAULT_SEQ = 'PHP+HHPPHHPPHHPPHH-PHP';

// One Fold is RESTARTS independent anneals from RESTARTS different random starts, keeping the lowest
// energy arrangement ever seen. Why so many: see lib/mol-fold.js.
const RESTARTS = 10;
const ANNEAL_STEPS = 11000; // per restart
const RELAX_STEPS = 4000;
const STEPS_PER_FRAME = 1200;
const NARROW_W = 620;
const NARROW_H = 380;
const LEVELS = ['primary', 'secondary', 'tertiary', 'quaternary'];
// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-foldlab')}
.tb-foldlab { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 70fr) minmax(0, 30fr); grid-template-rows: minmax(0, 1fr) auto;
  padding: 0.3rem 0.45rem var(--fl-pad, 5rem); column-gap: var(--space-4); row-gap: var(--space-1);
  font-family: var(--font-ui); }
.tb-foldlab .fl-pane { position: relative; min-width: 0; min-height: 0; }
.tb-foldlab .fl-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-foldlab .fl-grid { grid-column: 1; grid-row: 1; }
.tb-foldlab .fl-read { grid-column: 2; grid-row: 1; }
.tb-foldlab .fl-seq { grid-column: 1 / 3; grid-row: 2; height: var(--fl-seqh, 46px); }
.tb-foldlab svg text { font-family: var(--font-ui); }
.tb-foldlab .fl-hit { fill: transparent; cursor: pointer; }
.tb-foldlab .fl-key { fill: var(--ink-soft); }
.tb-foldlab .fl-val { fill: var(--ink); font-variant-numeric: lining-nums tabular-nums; font-weight: 600; }
.tb-foldlab .fl-note { fill: var(--ink-faint); }
/* Anything set over the water carries the paper with it, so a letter never fights the field it stands
   in: the two chain ends, the legend at the foot, and the level labels. */
.tb-foldlab .fl-end, .tb-foldlab .fl-over { stroke: var(--paper); stroke-width: 3px;
  stroke-linejoin: round; paint-order: stroke; }
.tb-foldlab .fl-end { fill: var(--ink); font-weight: 700; }
.tb-foldlab .fl-sliders { position: absolute; left: var(--space-3); right: var(--space-3); bottom: var(--fl-slidersbottom, 2.6rem);
  display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; pointer-events: none; }
.tb-foldlab .fl-sliders > * { pointer-events: auto; }
.tb-foldlab .fl-slider { display: inline-flex; align-items: center; gap: 0.4rem; font-family: var(--font-ui); font-size: var(--text-xs);
  color: var(--ink-soft); background: color-mix(in srgb, var(--paper) 88%, transparent); border: 1px solid var(--rule);
  border-radius: 999px; padding: 0.14rem 0.6rem; }
.tb-foldlab .fl-slider input { width: 6.5rem; accent-color: var(--leaf); }
.tb-foldlab .fl-slider b { color: var(--ink); font-variant-numeric: lining-nums tabular-nums; font-weight: 600; min-width: 3.2em; text-align: right; }
/* Three groups on one rule: run the search, change the chain, label what it found. */
.tb-foldlab .fig-toolbar { justify-content: flex-start; }
.tb-foldlab .fl-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-foldlab .fl-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
.tb-foldlab .fl-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-foldlab .fl-short { display: none; }
.tb-foldlab.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto auto; }
.tb-foldlab.is-narrow .fl-grid { grid-column: 1; grid-row: 1; }
.tb-foldlab.is-narrow .fl-seq { grid-column: 1; grid-row: 2; }
.tb-foldlab.is-narrow .fl-read { grid-column: 1; grid-row: 3; height: 46px; }
.tb-foldlab.is-narrow .fl-long { display: none; }
.tb-foldlab.is-narrow .fl-short { display: inline; }
.tb-foldlab.is-narrow .fig-btn { padding: 0.24rem 0.45rem; }
.tb-foldlab.is-narrow .fig-toolbar, .tb-foldlab.is-narrow .fl-sliders,
.tb-foldlab.is-narrow .fl-group { gap: 0.3rem; }
.tb-foldlab.is-narrow .fl-sep { display: none; }
.tb-foldlab.is-narrow .fl-slider { padding: 0.1rem 0.4rem; }
.tb-foldlab.is-narrow .fl-slider input { width: 4.4rem; }
`;

const fmt = (v, dp = 1) => v.toFixed(dp);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  const pinned = ctx.pinnedTime !== null;
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let slidersBottom = 0;
  let ready = false;
  let raf = 0;
  let lastFrame = 0;

  // ---- state ----
  let sequence = DEFAULT_SEQ;
  let chains = 1;
  let tempC = 25;
  let ph = 7.4;
  let runIndex = 0;
  let steps = 0;
  let state = 'unfolded';
  let aggregated = false;
  let levelsOn = false;
  let coords = [];
  let chainIds = [];
  let seqAll = '';
  let recentFolds = [];
  let job = null; // a createSearch handle from lib/mol-fold.js, or null when nothing is running
  let jobKind = null;
  let t = ctx.pinnedTime ?? 0;
  let selected = 0;

  const ionic = () => ionicStrength(ph);
  const seqOf = () => (chains === 2 ? sequence + sequence : sequence);

  function layoutChains() {
    seqAll = seqOf();
    chainIds = new Array(sequence.length).fill(0);
    if (chains === 2) chainIds = chainIds.concat(new Array(sequence.length).fill(1));
    coords = [];
    for (let i = 0; i < sequence.length; i += 1) coords.push([i, 0]);
    if (chains === 2) for (let i = 0; i < sequence.length; i += 1) coords.push([i, 3]);
  }

  // ---- the search ----
  // The bench never implements a search of its own: it drives lib/mol-fold.js, the same object a
  // harness and a unit test drive, a few hundred trial moves per animation frame so the reader can
  // watch it happen. A `fold` job starts from new random walks; a `relax` job carries on from the
  // arrangement already on the bench, which is what makes heating and pH changes act on THIS fold.
  function startJob(kind) {
    const isFold = kind === 'fold';
    if (!isFold && aggregated) return;
    job = createSearch({
      seq: seqAll,
      chainIds,
      chains,
      seed: seedFor(seqAll, chains, runIndex, kind),
      tempC,
      ph,
      restarts: isFold ? RESTARTS : 1,
      stepsPerRestart: isFold ? ANNEAL_STEPS : RELAX_STEPS,
      keepBest: isFold,
      // A relax runs flat at the reader's own temperature with no quench: it is the bench settling at
      // the heat or the pH they just chose, and a hot start or a greedy tail would make it re-fold
      // instead of showing what that heat does to the fold that is already there.
      hot: isFold ? null : kT(tempC),
      quench: isFold ? 0.25 : 0,
      start: isFold ? null : coords,
    });
    jobKind = kind;
    if (isFold) {
      coords = job.coords;
      state = 'folding';
      aggregated = false;
    } else {
      state = tempC > MELT_C ? 'denatured' : 'folding';
    }
  }

  function runSteps(n) {
    if (!job) return;
    const before = job.steps;
    const done = job.step(n);
    steps += job.steps - before;
    coords = job.coords;
    if (!done) return;
    const finished = jobKind;
    job = null;
    jobKind = null;
    if (aggregated) state = 'aggregated';
    else if (tempC > MELT_C) state = 'denatured';
    else state = 'folded';
    if (finished === 'fold') {
      recentFolds.push(foldKey(seqAll, coords, chainIds));
      if (recentFolds.length > 5) recentFolds.shift();
      runIndex += 1;
    }
  }

  function runToEnd() {
    while (job) runSteps(8000);
  }

  // ---- reader actions ----
  function fold() {
    startJob('fold');
    if (reduced || pinned) runToEnd();
    else schedule();
    redraw();
    announce();
  }
  function relax() {
    if (aggregated) {
      state = 'aggregated';
      redraw();
      announce();
      return;
    }
    startJob('relax');
    if (reduced || pinned) runToEnd();
    else schedule();
    redraw();
    announce();
  }
  function setTemp(v) {
    tempC = clamp(Math.round(Number(v)), 20, 100);
    tempOut.textContent = `${tempC} °C`;
    if (tempC > AGGREGATE_C) aggregated = true;
    relax();
  }
  function setPh(v) {
    ph = clamp(Number(v) / 10, 3, 11);
    phOut.textContent = ph.toFixed(1);
    relax();
  }
  function cycleResidue(i) {
    const cur = sequence[i];
    const next = TYPES[(TYPES.indexOf(cur) + 1) % TYPES.length];
    sequence = sequence.slice(0, i) + next + sequence.slice(i + 1);
    selected = i;
    recentFolds = [];
    runIndex = 0;
    layoutChains();
    state = 'unfolded';
    aggregated = false;
    job = null;
    redraw();
    announce(`residue ${i + 1} is now ${TYPE_INFO[next].name}; press Fold`);
  }
  function setLength(n) {
    const want = clamp(n, MIN_LEN, MAX_LEN);
    if (want === sequence.length) return;
    if (want > sequence.length) {
      // grown residues repeat the pattern rather than arriving as a run of one kind
      let s = sequence;
      while (s.length < want) s += TYPES[[0, 1, 1, 0][s.length % 4]];
      sequence = s;
    } else sequence = sequence.slice(0, want);
    selected = Math.min(selected, sequence.length - 1);
    recentFolds = [];
    runIndex = 0;
    layoutChains();
    state = 'unfolded';
    aggregated = false;
    job = null;
    redraw();
    announce(`${sequence.length} residues`);
  }
  function setChains(n) {
    chains = n;
    btnChain.setAttribute('aria-pressed', String(chains === 2));
    recentFolds = [];
    runIndex = 0;
    layoutChains();
    state = 'unfolded';
    aggregated = false;
    job = null;
    fold();
  }
  function toggleLevels() {
    levelsOn = !levelsOn;
    btnLevels.setAttribute('aria-pressed', String(levelsOn));
    redraw();
  }
  function reset() {
    sequence = DEFAULT_SEQ;
    chains = 1;
    tempC = 25;
    ph = 7.4;
    aggregated = false;
    levelsOn = false;
    recentFolds = [];
    runIndex = 0;
    steps = 0;
    tempRange.value = String(tempC);
    phRange.value = String(Math.round(ph * 10));
    tempOut.textContent = `${tempC} °C`;
    phOut.textContent = ph.toFixed(1);
    btnLevels.setAttribute('aria-pressed', 'false');
    btnChain.setAttribute('aria-pressed', 'false');
    layoutChains();
    fold();
  }

  // ---- derived ----
  function report() {
    const ion = ionic();
    const { energy, contacts } = energyOf(seqAll, coords, chainIds, ion);
    const { total: hTotal, buried: hBuried, fraction } = burial(seqAll, coords);
    const { helix, sheet } = secondary(coords, chainIds);
    const kNow = foldKey(seqAll, coords, chainIds);
    const same = recentFolds.filter((k) => k === kNow).length;
    return {
      sequence,
      length: sequence.length,
      // NOT `state`, which FIGURES.md asks for: components/figure.js builds its description as
      //   { id, kind, number, state: dataset.state, ...handle.describe() }
      // so a figure that reports `state` overwrites the frame's own, and every gate that asks whether
      // the figure reached "ready" reads "folded" instead and fails. Found by `npm run figure`, which
      // reported: figure foldlab is in state "folded". See the handoff: either figure.js spreads the
      // handle first so it cannot shadow the frame's identity, or FIGURES.md takes this name.
      foldState: state,
      steps,
      energy: round(energy, 2),
      contacts,
      buriedFraction: round(fraction, 3),
      coords: coords.map((p) => [p[0], p[1]]),
      sameFoldFromDifferentStarts: same,
      tempC,
      ph: round(ph, 1),
      chains,
      helixResidues: helix.size,
      sheetResidues: sheet.size,
      levelsShown: levelsOn ? LEVELS.slice(0, chains === 2 ? 4 : 3) : [],
      ionicStrength: round(ion, 3),
      layout: narrow ? 'narrow' : 'wide',
      helixSet: helix,
      sheetSet: sheet,
      hBuried,
      hTotal,
    };
  }

  // ---------------------------------------------------------------- drawing

  function drawGrid(w, hgt) {
    gridSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    gridSvg.replaceChildren();
    const d = report();
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [x, y] of coords) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    const gw = x1 - x0 + 1;
    const gh = y1 - y0 + 1;
    const pad = 16;
    const cell = Math.min(58, (w - pad * 2) / (gw + 1.4), (hgt - pad * 2 - 14) / (gh + 1.4));
    const ox = (w - gw * cell) / 2 - x0 * cell + cell / 2;
    const oy = (hgt - 14 - gh * cell) / 2 - y0 * cell + cell / 2;
    const X = (x) => ox + x * cell;
    const Y = (y) => oy + y * cell;
    // The beads leave room between them for the backbone to show: at 0.42 of the cell they touch, and
    // the chain reads as a grid of counters rather than as one thread the reader can follow.
    const r = cell * 0.34;

    // The water. Every lattice site the chain does not stand on carries a dot, right across the pane, so
    // the fold reads as something immersed in a solvent. A dozen dots on the chain's shell alone read as
    // dust on the lens — which is what they were. The shell is still drawn stronger than the rest,
    // because the shell is what "buried" means: a residue with no strong dot against it has no water
    // touching it, and that is the whole claim of the figure.
    const occ = makeOcc(coords);
    const shell = new Set();
    for (const [x, y] of coords) {
      for (const [dx, dy] of N4) {
        const k = kkey(x + dx, y + dy);
        if (!occ.has(k)) shell.add(k);
      }
    }
    const water = el('g', { 'aria-hidden': 'true' });
    const dotR = Math.max(1.3, cell * 0.082);
    const i0 = Math.floor(-ox / cell) - 1;
    const i1 = Math.ceil((w - ox) / cell) + 1;
    const j0 = Math.floor(-oy / cell) - 1;
    const j1 = Math.ceil((hgt - 15 - oy) / cell) + 1;
    // A ceiling on the field, so a very small cell on a very large fold cannot put thousands of circles
    // in the document; at the cell sizes this bench actually reaches it is never met.
    let drawn = 0;
    for (let j = j0; j <= j1 && drawn < 900; j += 1) {
      for (let i = i0; i <= i1 && drawn < 900; i += 1) {
        const k = kkey(i, j);
        if (occ.has(k)) continue;
        drawn += 1;
        const near = shell.has(k);
        // Away from the fold the field thins, so the pane reads as a drop of water with the chain in the
        // middle of it rather than as a sheet of dots with a chain laid on top.
        const away = Math.max(0, i - x1, x0 - i) + Math.max(0, j - y1, y0 - j);
        water.append(el('circle', {
          cx: fmt(X(i), 1), cy: fmt(Y(j), 1), r: fmt(near ? dotR * 1.5 : dotR, 1),
          fill: C.water, opacity: near ? 0.72 : fmt(clamp(0.3 - away * 0.035, 0.08, 0.26), 2),
        }));
      }
    }
    gridSvg.append(water);

    // the tertiary outline: a box round the whole fold
    if (levelsOn) {
      gridSvg.append(el('rect', {
        x: fmt(X(x0) - cell * 0.75, 1), y: fmt(Y(y0) - cell * 0.75, 1),
        width: fmt((gw - 1) * cell + cell * 1.5, 1), height: fmt((gh - 1) * cell + cell * 1.5, 1),
        rx: fmt(cell * 0.5, 1), fill: 'none', stroke: C.leaf, 'stroke-width': 1.4, 'stroke-dasharray': '6 5',
      }));
      gridSvg.append(text(X(x0) - cell * 0.75, Y(y0) - cell * 0.75 - 5, 'tertiary · the whole fold', { class: 'fl-over', style: `fill:${INK.leaf}`, 'font-size': 10, 'font-weight': 600 }));
    }

    // the backbone
    for (let i = 1; i < coords.length; i += 1) {
      if (chainIds[i] !== chainIds[i - 1]) continue;
      gridSvg.append(el('line', {
        x1: fmt(X(coords[i - 1][0]), 1), y1: fmt(Y(coords[i - 1][1]), 1),
        x2: fmt(X(coords[i][0]), 1), y2: fmt(Y(coords[i][1]), 1),
        stroke: chainIds[i] === 1 ? C.soft : C.ink, 'stroke-width': fmt(Math.max(2.4, cell * 0.2), 1), 'stroke-linecap': 'round',
      }));
    }
    // favourable contacts, dashed like the weak bonds they are
    const { pairs } = contactsOf(coords, chainIds);
    for (const [i, j] of pairs) {
      const a = seqAll[i];
      const b = seqAll[j];
      const hh = a === 'H' && b === 'H';
      const ionicPair = (a === '+' && b === '-') || (a === '-' && b === '+');
      if (!hh && !ionicPair) continue;
      gridSvg.append(el('line', {
        x1: fmt(X(coords[i][0]), 1), y1: fmt(Y(coords[i][1]), 1),
        x2: fmt(X(coords[j][0]), 1), y2: fmt(Y(coords[j][1]), 1),
        stroke: hh ? C.gold : C.leaf, 'stroke-width': fmt(Math.max(1.6, cell * 0.1), 1), 'stroke-dasharray': '3 3',
        opacity: ionicPair ? fmt(0.35 + 0.65 * d.ionicStrength, 2) : '0.9',
      }));
    }
    // the residues
    for (let i = 0; i < coords.length; i += 1) {
      const kind = seqAll[i];
      const info = TYPE_INFO[kind];
      const buried = kind === 'H' && N4.every(([dx, dy]) => occ.has(kkey(coords[i][0] + dx, coords[i][1] + dy)));
      const cx = X(coords[i][0]);
      const cy = Y(coords[i][1]);
      if (levelsOn && d.helixSet.has(i)) gridSvg.append(el('circle', { cx: fmt(cx, 1), cy: fmt(cy, 1), r: fmt(r + 4, 1), fill: 'none', stroke: C.violet, 'stroke-width': 2.4 }));
      else if (levelsOn && d.sheetSet.has(i)) gridSvg.append(el('rect', { x: fmt(cx - r - 4, 1), y: fmt(cy - r - 4, 1), width: fmt((r + 4) * 2, 1), height: fmt((r + 4) * 2, 1), rx: 3, fill: 'none', stroke: C.water, 'stroke-width': 2.4 }));
      gridSvg.append(el('circle', {
        cx: fmt(cx, 1), cy: fmt(cy, 1), r: fmt(r, 1),
        fill: buried ? info.colour : tint(info.colour, 42),
        stroke: info.colour, 'stroke-width': fmt(Math.max(1.4, cell * 0.07), 1),
        'stroke-dasharray': chainIds[i] === 1 ? '3 2' : undefined,
      }));
      if (r >= 6.4) {
        gridSvg.append(text(cx, cy + r * 0.36, info.glyph, {
          anchor: 'middle', fill: buried ? C.paper : C.ink, 'font-size': fmt(r * 1.05, 1), 'font-weight': 700,
        }));
      }
    }
    // The ends, so the chain has a direction. They go in whichever direction is water rather than at a
    // fixed offset: in a compact fold a label above the first residue lands on another residue.
    if (coords.length && r >= 5) {
      // The ends are named in the ink, not in the footnote colour: at nine point in --ink-faint over the
      // water they were the two least visible marks on a pane whose subject is a chain with a direction.
      const size = Math.max(11, r * 0.86);
      const endLabel = (i, glyph) => {
        const [x, y] = coords[i];
        const free = N4.find(([dx, dy]) => !occ.has(kkey(x + dx, y + dy))) || [0, -1];
        gridSvg.append(text(X(x) + free[0] * (r + size * 0.66), Y(y) + free[1] * (r + size * 0.66) + size * 0.34, glyph, {
          anchor: 'middle', class: 'fl-end', 'font-size': fmt(size, 1),
        }));
      };
      endLabel(0, 'N');
      endLabel(chainIds.lastIndexOf(0), 'C');
    }
    if (levelsOn && chains === 2) {
      gridSvg.append(text(6, 12, 'quaternary · two chains, one unit', { class: 'fl-over', 'font-size': 10, 'font-weight': 600, style: `fill:${INK.coral}` }));
    }
    // One footer line, cut to the width that is actually there: the long form ran off a phone's edge.
    const wide = w > 430;
    if (levelsOn) {
      gridSvg.append(text(6, hgt - 3, wide ? 'secondary · ○ helix-like coil, □ sheet-like strands (the lattice analogues)' : 'secondary · ○ helix-like, □ sheet-like', { class: 'fl-note fl-over', 'font-size': 10.2 }));
    } else if (state === 'aggregated') {
      gridSvg.append(text(6, hgt - 3, wide ? 'aggregated: the opened chains tangled, and cooling will not undo it' : 'aggregated: tangled, and cooling will not undo it', { class: 'fl-over', style: `fill:${INK.coral}`, 'font-size': 10.4, 'font-weight': 600 }));
    } else {
      gridSvg.append(text(6, hgt - 3, wide ? 'gold dashes: hydrophobic contacts · green dashes: ionic · blue dots: water · N and C: the two ends of the chain' : 'gold: hydrophobic · green: ionic · dots: water', { class: 'fl-note fl-over', 'font-size': 10.2 }));
    }
    gridSvg.append(focusMark(w, hgt));
  }

  // How many rows the sequence strip needs at this width. A thirty-six residue chain across a phone's
  // 334 px would put each bead at four device pixels with no room for the letter on it, and a letter is
  // how the reader tells a hydrophobe from a charge — colour alone is not allowed to carry it. So the
  // strip wraps instead of shrinking, and the pane's height follows.
  function seqRows(w) {
    const perRow = Math.max(8, Math.floor((w - 8) / 13));
    return Math.min(3, Math.max(1, Math.ceil(sequence.length / perRow)));
  }

  function drawSeq(w, hgt) {
    seqSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    seqSvg.replaceChildren();
    const n = sequence.length;
    const pad = 4;
    const rows = seqRows(w);
    const per = Math.ceil(n / rows);
    const cw = (w - pad * 2) / per;
    const top = 12;
    const rowH = (hgt - top) / rows;
    const r = Math.min(rowH * 0.38, cw * 0.44);
    seqSvg.append(text(pad, 9, levelsOn ? 'primary · the sequence, which is all the gene specifies' : 'the sequence · click a residue to change it', { class: 'fl-note', 'font-size': 9.6 }));
    for (let i = 0; i < n; i += 1) {
      const info = TYPE_INFO[sequence[i]];
      const row = Math.floor(i / per);
      const col = i % per;
      const cx = pad + cw * (col + 0.5);
      const cy = top + rowH * (row + 0.5);
      if (i === selected) seqSvg.append(el('circle', { cx: fmt(cx, 1), cy: fmt(cy, 1), r: fmt(r + 3, 1), fill: 'none', stroke: C.leaf, 'stroke-width': 2 }));
      seqSvg.append(el('circle', { cx: fmt(cx, 1), cy: fmt(cy, 1), r: fmt(r, 1), fill: tint(info.colour, 55), stroke: info.colour, 'stroke-width': 1.4 }));
      if (r >= 5.6) seqSvg.append(text(cx, cy + r * 0.36, info.glyph, { anchor: 'middle', fill: C.ink, 'font-size': fmt(r * 1.05, 1), 'font-weight': 700 }));
      const hit = el('rect', { x: fmt(pad + cw * col, 1), y: fmt(top + rowH * row, 1), width: fmt(cw, 1), height: fmt(rowH, 1), class: 'fl-hit' });
      hit.addEventListener('click', () => cycleResidue(i));
      hit.append(el('title', { text: `residue ${i + 1}: ${TYPE_INFO[sequence[i]].name}` }));
      seqSvg.append(hit);
    }
    seqSvg.append(focusMark(w, hgt, { inset: 1 }));
  }

  function drawRead(w, hgt) {
    readSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    readSvg.replaceChildren();
    const d = report();
    const stateWord = { unfolded: 'unfolded', folding: 'folding…', folded: 'folded', denatured: 'denatured', aggregated: 'aggregated' }[d.foldState];
    if (narrow) {
      const line = (y, str, cls, size) => readSvg.append(text(4, y, str, { class: cls, 'font-size': fmt(size, 1) }));
      line(12, `${stateWord} · energy ${d.energy.toFixed(2)} · ${d.contacts} H–H contacts`, 'fl-val', 11);
      line(26, `${Math.round(d.buriedFraction * 100)}% of the greasy residues fully buried · ${d.steps} steps`, 'fl-key', 10.2);
      line(40, `${d.sameFoldFromDifferentStarts} of the last ${Math.min(5, recentFolds.length)} runs reached this fold · helix ${d.helixResidues} · sheet ${d.sheetResidues}`, 'fl-note', 10);
      return;
    }
    // Three groups, because the thirteen numbers are three different kinds of thing: what the fold is,
    // how hard the search worked for it, and the water it was found in. Ungrouped they were thirteen
    // hairlines in the top half of a column whose bottom half was empty.
    const rows = [
      ['state', stateWord],
      ['energy (lower is better)', d.energy.toFixed(2)],
      ['hydrophobic contacts', String(d.contacts)],
      ['greasy residues buried', `${d.hBuried} of ${d.hTotal}`],
      ['buried fraction', d.buriedFraction.toFixed(2)],
      ['helix-like residues', String(d.helixResidues)],
      ['sheet-like residues', String(d.sheetResidues)],
      ['chains', String(d.chains)],
      { head: 'The search' },
      ['search steps', grouped(d.steps)],
      ['same fold from a new start', `${d.sameFoldFromDifferentStarts} of ${Math.min(5, recentFolds.length)}`],
      { head: 'The water it is in' },
      ['temperature', `${d.tempC} °C`],
      ['pH', d.ph.toFixed(1)],
      ['charges still on', `${Math.round(d.ionicStrength * 100)}%`],
    ];
    if (d.foldState === 'aggregated') rows.push({ note: 'Heated past 75 °C: the egg-white case.', colour: INK.coral, size: 10.4 });
    const opts = { title: 'What the search found', size: 10.6, titleSize: 9.2, headSize: 9 };
    const { rowH, slack } = fitRows(rows, hgt - 12, opts, 14, 30);
    readoutTable(readSvg, rows, {
      ...opts, x: 4, y: 4 + slack * 0.4, width: w - 8, rowH, size: clamp(rowH * 0.48, 10, 11.4),
    });
  }

  // ---------------------------------------------------------------- DOM

  const wrap = h('div', { class: 'tb-foldlab' });
  wrap.append(h('style', { text: CSS }));
  const gridSvg = el('svg', { tabindex: '0', role: 'img', 'aria-label': 'A protein chain folded on a square lattice, surrounded by water.' });
  const seqSvg = el('svg', { tabindex: '0', role: 'img', 'aria-label': 'The sequence. Left and right arrows move along it, Enter or the up arrow changes the residue under the cursor.' });
  const readSvg = el('svg', { 'aria-hidden': 'true' });
  const gridPane = h('div', { class: 'fl-pane fl-grid' }, [gridSvg]);
  const seqPane = h('div', { class: 'fl-pane fl-seq' }, [seqSvg]);
  const readPane = h('div', { class: 'fl-pane fl-read' }, [readSvg]);

  const twoLabels = (long, short) => [h('span', { class: 'fl-long', text: long }), h('span', { class: 'fl-short', text: short ?? long })];
  const button = (long, short, aria, onClick, attrs = {}, cls = '') => {
    const node = h('button', { class: `fig-btn ${cls}`.trim(), type: 'button', 'aria-label': aria, ...attrs }, twoLabels(long, short));
    node.addEventListener('click', onClick);
    return node;
  };
  const btnFold = button('Fold', 'Fold', 'Fold, run the search again from a new start', () => fold(), {}, 'fl-primary');
  const btnShorter = button('Shorter', '−', 'Shorter, take one residue off the chain', () => setLength(sequence.length - 1));
  const btnLonger = button('Longer', '+', 'Longer, add one residue to the chain', () => setLength(sequence.length + 1));
  const btnLevels = button('Levels', 'Levels', 'Levels, label the four levels of protein structure', () => toggleLevels(), { 'aria-pressed': 'false' });
  const btnChain = button('Second chain', '2 chains', 'Second chain, add another copy for the quaternary demonstration', () => setChains(chains === 2 ? 1 : 2), { 'aria-pressed': 'false' });
  const btnReset = button('Reset', 'Reset', 'Reset, back to the sequence the bench starts with', () => reset());
  const group = (kids) => h('div', { class: 'fl-group' }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnFold, btnReset]),
    h('span', { class: 'fl-sep', 'aria-hidden': 'true' }),
    group([btnShorter, btnLonger]),
    h('span', { class: 'fl-sep', 'aria-hidden': 'true' }),
    group([btnLevels, btnChain]),
  ]);

  const tempRange = h('input', { type: 'range', class: 'fig-range', min: '20', max: '100', step: '1', value: String(tempC), 'aria-label': 'Temperature, 20 to 100 degrees Celsius' });
  const tempOut = h('b', { text: `${tempC} °C` });
  const phRange = h('input', { type: 'range', class: 'fig-range', min: '30', max: '110', step: '1', value: String(Math.round(ph * 10)), 'aria-label': 'pH, 3 to 11' });
  const phOut = h('b', { text: ph.toFixed(1) });
  tempRange.addEventListener('input', () => setTemp(tempRange.value));
  phRange.addEventListener('input', () => setPh(phRange.value));
  const sliders = h('div', { class: 'fl-sliders fig-ui' }, [
    h('label', { class: 'fl-slider' }, [h('span', { text: 'Heat' }), tempRange, tempOut]),
    h('label', { class: 'fl-slider' }, [h('span', { text: 'pH' }), phRange, phOut]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(gridPane, readPane, seqPane, sliders, toolbar, live);
  root.append(wrap);

  function announce(msg) {
    const d = report();
    live.textContent = msg || `${d.foldState}, energy ${d.energy.toFixed(2)}, ${d.contacts} hydrophobic contacts, ${d.hBuried} of ${d.hTotal} greasy residues fully buried.`;
  }

  const onSeqKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); selected = (selected + 1) % sequence.length; }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); selected = (selected - 1 + sequence.length) % sequence.length; }
    else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); cycleResidue(selected); return; }
    else return;
    redraw();
    announce(`residue ${selected + 1}, ${TYPE_INFO[sequence[selected]].name}`);
  };
  seqSvg.addEventListener('keydown', onSeqKey);
  const onGridKey = (e) => {
    if (e.key === 'f' || e.key === 'F' || e.key === 'Enter') { e.preventDefault(); fold(); }
  };
  gridSvg.addEventListener('keydown', onGridKey);

  // ---------------------------------------------------------------- layout and clock

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(26, Math.round(r.height))];
  }
  function redraw() {
    const [gwp, ghp] = paneBox(gridPane);
    const [swp, shp] = paneBox(seqPane);
    const [rwp, rhp] = paneBox(readPane);
    drawGrid(gwp, ghp);
    drawSeq(swp, shp);
    drawRead(rwp, rhp);
  }

  function tick(now) {
    raf = 0;
    if (destroyed) return;
    const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    t += dt;
    runSteps(STEPS_PER_FRAME);
    redraw();
    if (job) schedule();
    else announce();
  }
  function schedule() {
    if (raf || destroyed || reduced || pinned) return;
    lastFrame = 0;
    raf = requestAnimationFrame(tick);
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < NARROW_W || hgt < NARROW_H;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    const tbH = Math.round(toolbar.getBoundingClientRect().height);
    const slH = Math.round(sliders.getBoundingClientRect().height);
    const nextBottom = tbH + 18;
    if (nextBottom !== slidersBottom) {
      slidersBottom = nextBottom;
      wrap.style.setProperty('--fl-slidersbottom', `${nextBottom}px`);
    }
    const pad = tbH + slH + 22;
    if (pad > 30 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--fl-pad', `${pad}px`);
    }
    const rows = seqRows(w - 16);
    wrap.style.setProperty('--fl-seqh', `${rows === 1 ? (narrow ? 42 : 48) : 14 + rows * 26}px`);
    return true;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    redraw();
    if (!ready) {
      ready = true;
      announce();
      ctx.onReady();
    }
  }

  // The bench opens on a fold rather than on a straight line, because a straight line is not what the
  // section is about. It is run to completion here, so the first frame is the same on every machine.
  layoutChains();
  startJob('fold');
  runToEnd();

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  observer.observe(sliders);
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) redraw(); });
  onResize();

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      seqSvg.removeEventListener('keydown', onSeqKey);
      gridSvg.removeEventListener('keydown', onGridKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      t = Math.max(0, Number(seconds) || 0);
      // a pinned frame never catches a search half way: it finishes, so the frame is the fold
      runToEnd();
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (ready) redraw();
    },
    setVisible(v) {
      if (v) { if (job) schedule(); } else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setTheme() {
      if (ready) redraw();
    },
    describe() {
      const d = report();
      delete d.helixSet;
      delete d.sheetSet;
      return d;
    },
  };
}
