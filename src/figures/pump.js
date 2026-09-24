// The sodium–potassium pump, one cycle at a time, and what it costs.
//
// WHAT IS ON THE STAGE. A patch of plasma membrane drawn large — extracellular fluid above, cytosol
// below, the bilayer as two rows of heads with the tails between them — and one pump protein in it, big
// enough that its two shapes are genuinely two shapes rather than one shape with a label. The binding
// sites face the cytosol in one and the extracellular fluid in the other, and they fit sodium in one and
// potassium in the other. Beside it, four bars: sodium and potassium, outside and inside, each pair one
// above the other so the comparison is vertical. A ledger counts cycles, ATP spent, ions moved and the
// charge carried out; a cost panel says what the rate on the stage is worth to the cell.
//
// IT OPENS STOPPED at stage 0, so the reader steps it rather than watching it.
//
// TWO CLOCKS, and the stage says so. The cycle is drawn at whatever rate the reader sets, because a real
// cycle takes about ten milliseconds and nothing can be read at that speed. The cell — the four bars, the
// volume, the ledger's cost line — runs at about one minute a second while Run is on, because the thing
// §4.6 wants shown is a gradient collapsing over minutes. Nothing advances at all while the pump is
// stopped: the figure is a function of the reader's presses, and `setTime` only redraws.
//
// THE MODEL.
//   The outside is finite, three times the cell's volume, so both bars of a pair move and they meet:
//   sodium settles at 112 mmol/L on both sides and potassium at 38, which is what a collapsed gradient
//   looks like. With an infinite outside, two of the four bars would never move at all.
//   Leak: dNa_in/dt = λ·leakiness·(Na_out − Na_in), with λ chosen so that at the default leakiness the
//   sodium gradient runs down with a time constant near half an hour — the order of magnitude a cell
//   poisoned with ouabain actually takes.
//   Pump: a constant efflux, not a gradient-driven one, because a pump works at its own rate whatever
//   the gradient; scaled by Na_in/(Na_in + 5 mmol/L), the pump's own affinity for cytosolic sodium, which
//   is also what stops it driving the concentration below zero. Its size is fixed by requiring that at
//   the default leakiness and full ATP the two exactly cancel, which is why the bars hold steady while
//   the pump runs and move the moment it is stopped. Raise the leakiness and the pump is outrun: the
//   gradient settles somewhere shallower, which is the section's point about what sets a pump's workload.
//   Potassium: the pump brings two in for every three sodium out, and its leak constant is fixed by the
//   same balance, so the potassium bars hold when the sodium bars do.
//   Volume: water follows the solute that has stopped being kept out. The modelled volume rises with
//   cytosolic sodium, to half again at a fully collapsed gradient, which is about where a red cell bursts.
//
// COMPOSITION. At desktop width the scene takes the left, the bars stand either side of the membrane
// line on its right, and the reading column carries the sentence, the ledger and the cost as one
// typographic table — no boxes, no pills, no bar with a caption over its fill. On a phone the scene keeps
// the top, the four bars become one stacked group beneath it with each ion's inside and outside adjacent,
// and the ledger and the cost fold into a single table.
//
// COLOUR. The pump takes `membranePart('pump')`; the sheet takes `lipidHead` and `lipidTail`; the ions
// come from the one element table and are told apart by the symbol written on them and by their ionic
// radii, never by colour. A symbol on one of the membrane fills takes `membranePart(id).symbolColor`,
// which is the colour itself and not a token to resolve through the theme: those fills are fixed hexes in
// both themes, so the symbol on them is fixed too and the measured ratio holds on either paper.
import { el, h, text, C, tint, clamp, uid } from './lib/svg.js';
import { atom, readoutCss, readoutTable, fitRows, round, INK, mulberry32 } from './lib/mol-draw.js';
import { ELEMENTS } from './lib/chem-atoms.js';
import { membranePart } from '../palette.js';

export const meta = { kind: 'pump', title: 'One cycle at a time, and what it costs', needsWebGL: false, aspect: 16 / 10 };

// ---------------------------------------------------------------- the cycle

const STAGES = [
  {
    name: 'na-binding', facing: 'in', phos: false, na: 3, k: 0,
    title: 'Three sodium ions bind',
    short: 'Three sodium ions bind to sites facing the cytosol.',
    line: 'Three sodium ions bind to sites facing the cytosol. These sites fit sodium and not potassium.',
  },
  {
    name: 'phosphorylated', facing: 'in', phos: true, na: 3, k: 0,
    title: 'ATP hands over its phosphate',
    short: 'With sodium bound, it takes the phosphate from ATP.',
    line: 'With sodium bound, the protein takes the phosphate from a molecule of ATP and keeps it for itself.',
  },
  {
    name: 'na-released', facing: 'out', phos: true, na: 0, k: 0,
    title: 'The protein turns inside out',
    short: 'The sites now face out and no longer fit sodium.',
    line: 'Phosphorylated, the protein changes shape. The sites now face outwards and no longer fit sodium, so the three ions leave whether they like it or not.',
  },
  {
    name: 'k-binding', facing: 'out', phos: true, na: 0, k: 2,
    title: 'Two potassium ions bind',
    short: 'A different pair of sites fits potassium; two bind.',
    line: 'In this shape a different pair of sites fits potassium, and two potassium ions bind from the extracellular fluid.',
  },
  {
    name: 'dephosphorylated', facing: 'out', phos: false, na: 0, k: 2,
    title: 'The phosphate comes off',
    short: 'Potassium binding takes the phosphate off again.',
    line: 'Potassium binding triggers the removal of the phosphate. Nothing has moved yet; the protein has simply stopped being held in this shape.',
  },
  {
    name: 'k-released', facing: 'in', phos: false, na: 0, k: 0,
    title: 'The protein relaxes, and lets go',
    short: 'It relaxes, the sites turn in, and potassium goes.',
    line: 'Without the phosphate the protein relaxes into its first shape. The sites turn inward and stop fitting potassium, so the two ions are released into the cytosol.',
  },
];

// The one line a phone has room for. The desktop sentence truncated to fit ended "…These…", which is a
// sentence the reader cannot finish; these are whole ones.
const BLOCK_SHORT = {
  'no-atp': 'No ATP: it cannot take a phosphate, and stops here.',
  ouabain: 'Ouabain is bound from outside; it cannot change shape.',
};

const BLOCK_LINES = {
  'no-atp': 'No ATP is left. The protein is holding three sodium ions and cannot take a phosphate, so the cycle stops here.',
  ouabain: 'Ouabain is bound to the outward-facing form, from the extracellular side. The protein cannot complete its change of shape, and the cycle stops here.',
};
// Ouabain binds the outward-open, phosphorylated protein from outside, so that is the stage it jams;
// without ATP the protein cannot leave the stage where it would take the phosphate.
const BLOCK_STAGE = { ouabain: 2, 'no-atp': 0 };

// ---------------------------------------------------------------- the cell

const NA_OUT0 = 145;
const NA_IN0 = 12;
const K_IN0 = 140;
const K_OUT0 = 4;
const OUT_VOLUMES = 3; // extracellular space, in cell volumes
const LAMBDA_NA = 0.0008; // per cell-second at leakiness 1
const KM_NA = 5; // the pump's affinity for cytosolic sodium, mmol/L
const LEAK0 = 0.5;
const CELL_SECONDS_PER_WATCHED = 60;
const REAL_TURNOVER = 150; // cycles a second for one pump at body temperature
const BUDGET_SHARE = 0.33; // of a resting animal cell's ATP, from §4.6

// The pump's constant efflux, fixed by requiring that it exactly cancels the leak at rest.
const PUMP_NA = (LAMBDA_NA * LEAK0 * (NA_OUT0 - NA_IN0)) / (NA_IN0 / (NA_IN0 + KM_NA));
// The potassium leak constant, fixed by the same balance: two potassium in per three sodium out.
const LAMBDA_K = ((2 / 3) * LAMBDA_NA * LEAK0 * (NA_OUT0 - NA_IN0)) / (LEAK0 * (K_IN0 - K_OUT0));
const NA_END = (NA_OUT0 * OUT_VOLUMES + NA_IN0) / (OUT_VOLUMES + 1);

const RATE = { min: 0.4, max: 4, start: 1.2 }; // cycles a second, as drawn
const SHAPE_SECONDS = 0.55;

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-pump')}
.tb-pump { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 63fr) minmax(0, 37fr); grid-template-rows: minmax(0, 1fr);
  padding: 0.4rem 0.5rem var(--pump-pad, 3rem); column-gap: var(--space-4);
  font-family: var(--font-ui); }
.tb-pump .pm-pane { position: relative; min-width: 0; min-height: 0; }
.tb-pump .pm-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-pump svg text { font-family: var(--font-ui); }
.tb-pump .pm-title { fill: var(--ink); font-weight: 600; }
.tb-pump .pm-line { fill: var(--ink-soft); }
.tb-pump .pm-side { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; }
.tb-pump .pm-barkey { fill: var(--ink-soft); }
.tb-pump .pm-barval { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-pump .fig-toolbar { justify-content: flex-start; }
.tb-pump .pm-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-pump .pm-sep { width: 1px; min-height: 1.4rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
/* The primary action is told by the head rule on its edge and the weight of its ink, never by a fill. */
.tb-pump .pm-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-pump .pm-slider { display: flex; align-items: center; gap: 0.3rem; font-size: var(--text-xs);
  color: var(--ink-soft); background: color-mix(in srgb, var(--paper) 86%, transparent);
  padding: 0.18rem 0.4rem; }
.tb-pump .pm-slider input { width: 3.6rem; }
.tb-pump .pm-slider .pm-val { color: var(--ink); font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums; min-width: 2.2rem; text-align: right; }
.tb-pump.is-narrow { grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 50fr) minmax(0, 50fr); row-gap: var(--space-2); }
.tb-pump.is-narrow .pm-sep { display: none; }
/* Eight controls have to fit a 342 px bar without taking half the stage. At 10.5 px — thirty-one device
   pixels on a 3× phone, well over the nine-pixel floor — they come down from five rows to three. */
.tb-pump.is-narrow .fig-toolbar { gap: 0.28rem; }
.tb-pump.is-narrow .fig-btn { font-size: 10.5px; padding: 0.22rem 0.42rem; }
.tb-pump.is-narrow .pm-slider { font-size: 10.5px; padding: 0.1rem 0.26rem; gap: 0.22rem; }
.tb-pump.is-narrow .pm-slider input { width: 2.3rem; }
/* The three sliders go last on a phone, so the five buttons share one row instead of the button groups
   being pushed apart by a slider row between them. Five rows of controls became three. */
.tb-pump.is-narrow .pm-sliders { order: 2; }
.tb-pump.is-narrow .pm-slider .pm-val { min-width: 1.9rem; }
`;

// ---------------------------------------------------------------- helpers

const fmt1 = (v) => v.toFixed(1);
const sideSize = (w) => clamp(w * 0.026, 8.6, 10.4);
// Inter runs about 0.52 em over mixed-case text, which is close enough to break a sentence into lines
// without a measurement pass per word.
function wrapLines(str, width, size, maxLines = 6) {
  // Nothing at all is a legitimate answer: a column that cannot hold one whole line asks for none, and
  // the caller has already decided that. Without this the truncation reached lines[-1] and threw, which
  // the frame reported as a figure in state "error" at 390 px and nowhere else.
  if (maxLines <= 0 || !str) return [];
  const per = Math.max(8, Math.floor(width / (size * 0.52)));
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > per && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[ ,.]+$/, '')}…`;
  }
  return lines;
}

// The ion radii are the Shannon ionic radii of the one element table, so sodium is visibly the smaller
// of the two and the difference is the one §4.5 turns into a selectivity filter.
const ionRadius = (sym, base) => base * (ELEMENTS[sym].ionic / ELEMENTS.K.ionic);

// Where the loose ions sit, as fractions of a region. The bars give the concentrations exactly; the
// scatter gives them as a crowd, so a gradient collapsing is something the reader watches rather than
// reads, and the extracellular fluid and the cytosol are populated rather than empty. Fixed seeded
// positions, so an ion appears and disappears in place as the number drawn changes; a fresh scatter per
// frame would be a shimmer. One drawn ion stands for MM_PER_ION mmol/L, and the scene says so.
const MM_PER_ION = 10;
const SLOTS = 18;
function scatterSlots(seed) {
  const rng = mulberry32(seed);
  const pts = [];
  let tries = 0;
  while (pts.length < SLOTS * 2 && tries < 4000) {
    tries += 1;
    const p = [0.04 + rng() * 0.92, 0.1 + rng() * 0.82];
    if (pts.every((qq) => Math.hypot((qq[0] - p[0]) * 2.4, qq[1] - p[1]) > 0.19)) pts.push(p);
  }
  return pts;
}
const OUT_SLOTS = scatterSlots(4061);
const IN_SLOTS = scatterSlots(4062);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('pm');
  let destroyed = false;
  let narrow = false;
  let padPx = 0;
  // A pinned clock is not advanced by any control. `?t=` pins every figure on the page and the gates take
  // their frames that way; `stepStage` read `ctx.pinnedTime` already, but `setRunning` did not, so Run on
  // a pinned page started the cell and stepped the cycle. Written as a function rather than read once
  // because the frame may pin a figure that mounted unpinned. `undefined` counts as unpinned as well as
  // `null`: a ctx that omits the field must leave the pump runnable for a reader.
  const pinned = () => ctx.pinnedTime !== null && ctx.pinnedTime !== undefined;

  const PUMP_FILL = membranePart('pump').color;
  const PUMP_LABEL = membranePart('pump').symbolColor;
  const HEAD_FILL = membranePart('lipidHead').color;
  const TAIL_FILL = membranePart('lipidTail').color;

  // ---- state ----
  let stage = 0;
  let cycles = 0;
  let atpSpent = 0;
  let naMoved = 0;
  let kMoved = 0;
  let naIn = NA_IN0;
  let naOut = NA_OUT0;
  let kIn = K_IN0;
  let kOut = K_OUT0;
  let atp = 1;
  let leakiness = LEAK0;
  let ouabain = false;
  let running = false;
  let rate = RATE.start;
  let cellSeconds = 0;
  let openCur = -1; // -1 sites face the cytosol, +1 they face outside
  let openGoal = -1;
  let raf = 0;
  let lastFrame = 0;
  let sinceStep = 0;

  // Michaelis in ATP, normalised so a full supply is exactly 1: the rate has to fall a long way before
  // the pump notices, which is why a cell can run its ATP down a good deal before its gradients move.
  const atpFactor = () => (atp < 0.03 ? 0 : (atp / (atp + 0.05)) * 1.05);
  const blockedBy = () => {
    if (ouabain && stage === BLOCK_STAGE.ouabain) return 'ouabain';
    if (atpFactor() === 0 && stage === BLOCK_STAGE['no-atp']) return 'no-atp';
    return null;
  };
  // What fraction of its proper rate the cell's pumping is achieving. The reader's Run speed is how fast
  // the drawing goes, not how hard the cell is working; a pump that is blocked or out of ATP is what
  // makes the cell's own numbers move.
  const effort = () => (blockedBy() ? 0 : ouabain ? 0 : atpFactor());
  const volumeFraction = () => 1 + 0.5 * clamp((naIn - NA_IN0) / (NA_END - NA_IN0), 0, 1.02);

  function advanceCell(dtCell) {
    const e = effort();
    const pumpNa = PUMP_NA * e * (naIn / (naIn + KM_NA));
    const dNaIn = LAMBDA_NA * leakiness * (naOut - naIn) - pumpNa;
    const dKIn = -LAMBDA_K * leakiness * (kIn - kOut) + (2 / 3) * pumpNa;
    naIn = clamp(naIn + dNaIn * dtCell, 0.5, 200);
    kIn = clamp(kIn + dKIn * dtCell, 0.5, 200);
    // Conserved: what leaves the cell arrives in an extracellular space three cell volumes big.
    naOut = clamp((NA_OUT0 * OUT_VOLUMES + NA_IN0 - naIn) / OUT_VOLUMES, 0.5, 300);
    kOut = clamp((K_OUT0 * OUT_VOLUMES + K_IN0 - kIn) / OUT_VOLUMES, 0.5, 300);
    cellSeconds += dtCell;
  }

  function stepStage(by = 1) {
    if (by > 0 && blockedBy()) return false;
    const next = (stage + by + STAGES.length) % STAGES.length;
    if (by > 0) {
      if (STAGES[stage].name === 'na-binding') atpSpent += 1;
      if (STAGES[next].name === 'na-released') naMoved += 3;
      if (STAGES[next].name === 'k-released') kMoved += 2;
      if (next === 0) cycles += 1;
    }
    stage = next;
    openGoal = STAGES[stage].facing === 'out' ? 1 : -1;
    // Start the loop that eases the shape across. Without this the goal moved and nothing ever ran to
    // follow it, so the protein held its first shape through all six stages while the readout said it
    // had turned inside out — the one thing this figure exists to show.
    if (ctx.reducedMotion || pinned()) openCur = openGoal;
    else kick();
    return true;
  }

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-pump' });
  wrap.append(h('style', { text: CSS }));
  const sceneSvg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'The sodium–potassium pump in a patch of plasma membrane. Right arrow steps the cycle on, left arrow steps it back, Home returns to the start.',
  });
  const readSvg = el('svg', { 'aria-hidden': 'true' });
  const scenePane = h('div', { class: 'pm-pane pm-scene' }, [sceneSvg]);
  const readPane = h('div', { class: 'pm-pane pm-read' }, [readSvg]);

  const button = (label, onClick, { pressed = null, primary = false } = {}) => {
    const b = h('button', { class: `fig-btn${primary ? ' pm-primary' : ''}`, type: 'button', text: label });
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    return b;
  };
  const slider = (label, opts) => {
    const input = h('input', { class: 'fig-range', type: 'range', min: opts.min, max: opts.max, step: opts.step, value: opts.value, 'aria-label': label });
    const val = h('span', { class: 'pm-val', text: opts.format(opts.value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      val.textContent = opts.format(v);
      opts.onInput(v);
    });
    return h('label', { class: 'pm-slider fig-ui' }, [document.createTextNode(label), input, val]);
  };

  const btnStep = button('Step', () => { if (stepStage(1)) { draw(); announce(); } }, { primary: true });
  const btnBack = button('Back', () => { stepStage(-1); draw(); announce(); });
  const btnRun = button('Run', () => setRunning(!running), { pressed: false });
  const btnOuabain = button('Ouabain', () => {
    ouabain = !ouabain;
    btnOuabain.setAttribute('aria-pressed', String(ouabain));
    draw();
    announce();
  }, { pressed: false });
  const btnReset = button('Reset', () => reset());
  const sRate = slider('Rate', { min: 0.4, max: 4, step: 0.2, value: RATE.start, format: (v) => `${v.toFixed(1)}/s`, onInput: (v) => { rate = v; draw(); } });
  const sAtp = slider('ATP', { min: 0, max: 100, step: 1, value: 100, format: (v) => `${v} %`, onInput: (v) => { atp = v / 100; draw(); announce(); } });
  const sLeak = slider('Leakiness', { min: 10, max: 100, step: 5, value: LEAK0 * 100, format: (v) => `${v} %`, onInput: (v) => { leakiness = v / 100; draw(); } });

  const group = (kids) => h('div', { class: 'pm-group' }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnStep, btnBack, btnRun]),
    h('span', { class: 'pm-sep', 'aria-hidden': 'true' }),
    h('div', { class: 'pm-group pm-sliders' }, [sRate, sAtp, sLeak]),
    h('span', { class: 'pm-sep', 'aria-hidden': 'true' }),
    group([btnOuabain, btnReset]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });
  wrap.append(scenePane, readPane, toolbar, live);
  root.append(wrap);

  function announce() {
    const b = blockedBy();
    live.textContent = b ? `${STAGES[stage].title}. ${BLOCK_LINES[b]}` : `Stage ${stage + 1} of 6. ${STAGES[stage].title}. ${STAGES[stage].line}`;
  }

  function reset() {
    stage = 0;
    cycles = 0;
    atpSpent = 0;
    naMoved = 0;
    kMoved = 0;
    naIn = NA_IN0; naOut = NA_OUT0; kIn = K_IN0; kOut = K_OUT0;
    atp = 1; leakiness = LEAK0; ouabain = false;
    cellSeconds = 0;
    openCur = -1; openGoal = -1;
    setRunning(false);
    // The Run speed is a control like the others, and Reset means "as it mounted": left out, it was the
    // one thing a Reset did not put back, so a reader who had wound the pump up to 4 cycles a second
    // pressed Reset and watched it race.
    rate = RATE.start;
    sRate.querySelector('input').value = String(RATE.start);
    sRate.querySelector('.pm-val').textContent = `${RATE.start.toFixed(1)}/s`;
    sAtp.querySelector('input').value = '100';
    sAtp.querySelector('.pm-val').textContent = '100 %';
    sLeak.querySelector('input').value = String(LEAK0 * 100);
    sLeak.querySelector('.pm-val').textContent = `${LEAK0 * 100} %`;
    btnOuabain.setAttribute('aria-pressed', 'false');
    draw();
    announce();
  }

  function setRunning(on) {
    // The intent is refused rather than recorded while the clock is pinned: that is this repo's settled
    // shape for a pinned Run (gradient-battery, bilayer, bulk-transport, osmometer, permeability,
    // polymer, secretion), and a button reading Pause over a pump that is not moving is the worse of the
    // two lies. Every label below follows the EFFECTIVE state, not the asked-for one. Space comes through
    // here too. Stopping is never refused, so Reset still calls in.
    running = on && !pinned();
    btnRun.textContent = running ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-pressed', String(running));
    btnRun.setAttribute('aria-label', running ? 'Pause the pump' : 'Run the pump');
    if (running) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; }
    draw();
  }

  function frame(ms) {
    raf = 0;
    if (destroyed) return;
    const dt = lastFrame ? Math.min(0.1, (ms - lastFrame) / 1000) : 1 / 60;
    lastFrame = ms;
    let moved = false;
    if (running) {
      advanceCell(dt * CELL_SECONDS_PER_WATCHED);
      sinceStep += dt;
      if (sinceStep >= 1 / rate) { sinceStep = 0; stepStage(1); }
      moved = true;
    }
    if (Math.abs(openGoal - openCur) > 1e-3) {
      const k = 1 - Math.exp(-dt / (SHAPE_SECONDS / 3));
      openCur += (openGoal - openCur) * k;
      moved = true;
    } else openCur = openGoal;
    draw();
    if (moved || running) kick(); else lastFrame = 0;
  }
  const kick = () => { if (!raf && !destroyed) raf = requestAnimationFrame(frame); };

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); if (stepStage(1)) { draw(); announce(); } }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); stepStage(-1); draw(); announce(); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
    else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setRunning(!running); }
  };
  sceneSvg.addEventListener('keydown', onKey);

  // ---------------------------------------------------------------- the scene

  function drawScene(w, hgt) {
    sceneSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    sceneSvg.replaceChildren();
    const barsW = narrow ? 0 : clamp(w * 0.29, 116, 186);
    const stageW = w - barsW - (barsW ? 14 : 0);
    const memTop = hgt * 0.4;
    const memBot = hgt * 0.62;
    const memMid = (memTop + memBot) / 2;

    // --- the bilayer, drawn as heads and tails ---
    const headR = clamp(Math.min((memBot - memTop) * 0.16, stageW * 0.018), 3.6, 8.5);
    const g = el('g');
    const pumpCx = stageW * 0.46;
    const pumpHalf = clamp(stageW * 0.13, 26, 62);
    const step = headR * 2.05;
    for (let x = headR; x < stageW; x += step) {
      const inPump = Math.abs(x - pumpCx) < pumpHalf + headR;
      if (inPump) continue;
      for (const [cy, dir] of [[memTop + headR, 1], [memBot - headR, -1]]) {
        g.append(el('circle', { cx: fmt1(x), cy: fmt1(cy), r: fmt1(headR), fill: HEAD_FILL }));
        g.append(el('line', {
          x1: fmt1(x - headR * 0.35), y1: fmt1(cy + dir * headR * 0.7), x2: fmt1(x - headR * 0.35), y2: fmt1(cy + dir * (memMid - memTop - headR * 0.2)),
          stroke: TAIL_FILL, 'stroke-width': fmt1(headR * 0.42), 'stroke-linecap': 'round',
        }));
        g.append(el('line', {
          x1: fmt1(x + headR * 0.35), y1: fmt1(cy + dir * headR * 0.7), x2: fmt1(x + headR * 0.35), y2: fmt1(cy + dir * (memMid - memTop - headR * 0.2)),
          stroke: TAIL_FILL, 'stroke-width': fmt1(headR * 0.42), 'stroke-linecap': 'round',
        }));
      }
    }
    sceneSvg.append(g);

    // --- the loose ions, one drawn per 10 mmol/L ---
    // `atom()` draws no symbol under 4.4 units, and an ion without its symbol is charge and identity by
    // colour alone, which chapter 2's one element table exists to prevent. So the floor is set on SODIUM,
    // the smaller of the two: at a base of 6.3 its disc is 4.65 and it keeps its name at a phone's width.
    const scatterR = clamp(Math.min(stageW * 0.019, hgt * 0.026), 6.3, 8.4);
    const naS = ionRadius('Na', scatterR);
    const kS = ionRadius('K', scatterR);
    // Fewer drawn ions on a small stage, so bigger discs do not turn a dilute solution into a crowd.
    const perIon = narrow ? MM_PER_ION * 2 : MM_PER_ION;
    const regions = [
      { slots: OUT_SLOTS, top: sideSize(stageW) * 2.2, bot: memTop - scatterR * 1.8, na: naOut, k: kOut },
      { slots: IN_SLOTS, top: memBot + scatterR * 1.8, bot: hgt - sideSize(stageW) * 2.4, na: naIn, k: kIn },
    ];
    const ions = el('g');
    // A slot is skipped where the protein, its cargo or the drug bound to it already is: a loose ion
    // drawn over the ouabain or over the pump's own mouth reads as an ion inside the protein.
    const clearOf = (px, py, near) => !(Math.abs(px - pumpCx) < pumpHalf * 2 && near);
    for (const r of regions) {
      const h0 = Math.max(10, r.bot - r.top);
      const nNa = Math.round(clamp(r.na / perIon, 0, SLOTS));
      const nK = Math.round(clamp(r.k / perIon, 0, SLOTS));
      const draw = (p, sym, rad) => {
        if (!p) return;
        const px = p[0] * stageW;
        const py = r.top + p[1] * h0;
        const nearMembrane = r === regions[0] ? py > r.bot - h0 * 0.5 : py < r.top + h0 * 0.45;
        if (!clearOf(px, py, nearMembrane)) return;
        ions.append(atom(px, py, sym, rad, { charge: '+', label: rad >= 4.4 }));
      };
      for (let i = 0; i < nNa; i += 1) draw(r.slots[i * 2], 'Na', naS);
      for (let i = 0; i < nK; i += 1) draw(r.slots[i * 2 + 1], 'K', kS);
    }
    sceneSvg.append(ions);

    // --- which side is which: at the two far edges, where no ion and no protein reaches ---
    const sz = sideSize(stageW);
    sceneSvg.append(text(2, sz, 'Extracellular fluid', { class: 'pm-side', 'font-size': fmt1(sz) }));
    sceneSvg.append(text(2, hgt - sz * 0.5, 'Cytosol', { class: 'pm-side', 'font-size': fmt1(sz) }));
    sceneSvg.append(text(stageW, sz, `one ion drawn per ${perIon} mmol/L`, { anchor: 'end', class: 'mol-rt-note', 'font-size': fmt1(sz - 0.8) }));

    // --- the pump ---
    // Two lobes that hinge: the cavity opens downwards when the sites face the cytosol and upwards when
    // they face outside, and the waist between them never quite closes, so the protein reads as two
    // halves of one machine rather than as a block with a notch in it.
    const open = openCur;
    const mouth = pumpHalf * 0.74;
    // A hairline seam, not a slit: the two halves meet along the midline at the closed end, and a gap of
    // a pixel or two says they are two halves. At a seventeenth of the half-width the protein had a
    // channel straight through it at every stage, which is the one thing a carrier does not have.
    const waist = Math.max(1.2, pumpHalf * 0.03);
    const mouthTop = waist + (mouth - waist) * Math.max(0, open);
    const mouthBot = waist + (mouth - waist) * Math.max(0, -open);
    const top = memTop - headR * 1.6;
    const bot = memBot + headR * 1.6;
    const mid = (top + bot) / 2;
    const r = Math.min(pumpHalf * 0.34, (bot - top) * 0.16);
    const lobe = (sign) => {
      const X = (v) => fmt1(pumpCx + sign * v);
      return `M${X(mouthTop)} ${fmt1(top + r * 0.3)}`
        + ` Q${X(mouthTop)} ${fmt1(top)} ${X(mouthTop + r * 0.5)} ${fmt1(top)}`
        + ` L${X(pumpHalf - r)} ${fmt1(top)}`
        + ` Q${X(pumpHalf)} ${fmt1(top)} ${X(pumpHalf)} ${fmt1(top + r)}`
        + ` L${X(pumpHalf)} ${fmt1(bot - r)}`
        + ` Q${X(pumpHalf)} ${fmt1(bot)} ${X(pumpHalf - r)} ${fmt1(bot)}`
        + ` L${X(mouthBot + r * 0.5)} ${fmt1(bot)}`
        + ` Q${X(mouthBot)} ${fmt1(bot)} ${X(mouthBot)} ${fmt1(bot - r * 0.3)}`
        + ` L${X(waist)} ${fmt1(mid)} Z`;
    };
    const pg = el('g');
    for (const sign of [-1, 1]) pg.append(el('path', { d: lobe(sign), fill: PUMP_FILL, 'stroke-linejoin': 'round' }));
    sceneSvg.append(pg);
    // Its name, on the protein, in the colour the palette records for a symbol written on this fill.
    // Fixed light fills in both themes, so the label takes the LIGHT palette's paper whatever the page is.
    const nameSize = clamp(pumpHalf * 0.3, 8.4, 11.6);
    if (pumpHalf > 34) {
      // In the solid half, which is the one the cavity is not open into.
      const nameY = open < 0 ? top + (mid - top) * 0.55 : bot - (bot - mid) * 0.45;
      // The word straddles the seam between the two lobes, and the seam is a gap onto the stage: bare, the
      // "u" and "m" crossing it put paper on the light theme's paper, 1.11:1 (npm run legible, 2026-09-23).
      // A halo in the protein's own fill closes the seam under the letters and nowhere else, so the word
      // sits on the pump and the two halves still read as two halves.
      sceneSvg.append(text(pumpCx, nameY, 'pump', {
        anchor: 'middle', 'font-size': fmt1(nameSize), 'font-weight': 600, style: `fill:${PUMP_LABEL}`,
        stroke: PUMP_FILL, 'stroke-width': 3, 'stroke-linejoin': 'round', 'paint-order': 'stroke',
      }));
    }

    // --- the ions the protein is holding, and the ones it has just let go ---
    const naR = ionRadius('Na', clamp(pumpHalf * 0.24, 5.4, 11));
    const kR = ionRadius('K', clamp(pumpHalf * 0.24, 5.4, 11));
    const st = STAGES[stage];
    const held = el('g');
    // Held ions sit in the cavity, on the side the sites are facing.
    const cavityY = st.facing === 'out' ? mid - (bot - top) * 0.17 : mid + (bot - top) * 0.17;
    if (st.na) {
      const spread = Math.min(pumpHalf * 0.5, naR * 1.9);
      [-1, 0, 1].forEach((i) => held.append(atom(pumpCx + i * spread, cavityY + (i === 0 ? -naR * 1.5 : 0), 'Na', naR, { charge: '+', title: 'Sodium ion' })));
    }
    if (st.k) {
      const spread = Math.min(pumpHalf * 0.55, kR * 1.6);
      [-1, 1].forEach((i) => held.append(atom(pumpCx + i * spread, cavityY, 'K', kR, { charge: '+', title: 'Potassium ion' })));
    }
    // The ions released by the step just taken, drawn leaving.
    if (st.name === 'na-released') {
      [-1.6, 0, 1.6].forEach((i, j) => held.append(atom(pumpCx + i * naR * 2.3, top - naR * (2.2 + j * 0.4), 'Na', naR, { charge: '+' })));
    }
    if (st.name === 'k-released') {
      [-1.2, 1.2].forEach((i) => held.append(atom(pumpCx + i * kR * 2.3, bot + kR * 2.8, 'K', kR, { charge: '+' })));
    }
    sceneSvg.append(held);

    // --- the phosphate, and the ATP that supplied it ---
    if (st.phos) {
      const px = pumpCx + pumpHalf * 1.02;
      sceneSvg.append(atom(px, mid + (bot - top) * 0.12, 'P', Math.max(5, naR * 0.92), { title: 'The phosphate taken from ATP' }));
    }
    // The nucleotide sits in the cytosol beside the protein it supplies, and says which it is now. On a
    // phone it is one word on the region line at the foot of the stage: the two-line block stood in the
    // middle of the cytosol's potassium and had an ion sitting on the word.
    const atpSize = clamp(stageW * 0.028, 9, 11.4);
    const atpWord = st.phos ? 'ADP' : 'ATP';
    if (narrow) {
      sceneSvg.append(text(stageW, hgt - sz * 0.5, `${atpWord}${st.phos ? ' · its phosphate is on the protein' : ''}`, { anchor: 'end', class: 'mol-rt-note', 'font-size': fmt1(atpSize - 1.4) }));
    } else {
      const atpX = 2;
      const atpY = Math.min(bot + atpSize * 2.4, hgt - sideSize(stageW) * 2.6);
      sceneSvg.append(text(atpX, atpY, atpWord, { class: 'pm-barval', 'font-size': fmt1(atpSize) }));
      sceneSvg.append(text(atpX, atpY + atpSize + 2.5, st.phos ? 'its phosphate is on the protein' : `${Math.round(atp * 100)} % of the supply left`, { class: 'mol-rt-note', 'font-size': fmt1(atpSize - 1.4) }));
    }

    // --- ouabain, which binds from the outside only ---
    if (ouabain) {
      // Above the ions it has just turned out, not on top of them.
      const oy = top - naR * 5.2;
      const ow = pumpHalf * 0.62;
      sceneSvg.append(el('path', {
        d: `M${fmt1(pumpCx - ow)} ${fmt1(oy)} Q${fmt1(pumpCx)} ${fmt1(oy - ow * 0.9)} ${fmt1(pumpCx + ow)} ${fmt1(oy)} Q${fmt1(pumpCx)} ${fmt1(oy + ow * 0.5)} ${fmt1(pumpCx - ow)} ${fmt1(oy)} Z`,
        fill: tint(C.coral, 76), stroke: INK.coral, 'stroke-width': 1.4,
      }));
      const os = clamp(pumpHalf * 0.3, 8.2, 10.6);
      sceneSvg.append(text(pumpCx, oy - ow * 0.62, 'ouabain', { anchor: 'middle', 'font-size': fmt1(os), style: `fill:${INK.coral}`, 'font-weight': 600 }));
    }

    // --- the four bars, flanking the membrane line ---
    if (barsW) drawBars(sceneSvg, stageW + 14, 0, barsW, hgt, memTop, memBot);

    sceneSvg.append(focusBrackets(w, hgt));
  }

  function focusBrackets(w, hgt) {
    const len = Math.max(9, Math.min(20, w * 0.06, hgt * 0.16));
    const a = 3;
    const x1 = w - 3;
    const y1 = hgt - 3;
    const d = [
      `M${a} ${fmt1(a + len)} L${a} ${a} L${fmt1(a + len)} ${a}`,
      `M${fmt1(x1 - len)} ${a} L${fmt1(x1)} ${a} L${fmt1(x1)} ${fmt1(a + len)}`,
      `M${fmt1(x1)} ${fmt1(y1 - len)} L${fmt1(x1)} ${fmt1(y1)} L${fmt1(x1 - len)} ${fmt1(y1)}`,
      `M${fmt1(a + len)} ${fmt1(y1)} L${a} ${fmt1(y1)} L${a} ${fmt1(y1 - len)}`,
    ].join(' ');
    return el('path', { d, class: 'mol-focus', fill: 'none', stroke: C.water, 'stroke-width': 2.2, 'stroke-linecap': 'square' });
  }

  // Four bars: outside above the membrane line, inside below it, sodium then potassium in both, so each
  // ion's pair reads down the column. The label is beside the bar and the figure at the end of it; no
  // number sits on a fill.
  function drawBars(parent, x, y, w, hgt, memTop, memBot) {
    const g = el('g');
    const size = clamp(w * 0.072, 8.8, 10.6);
    const rowH = Math.max(size * 2.5, 26);
    const scale = 200;
    // Room for the longest key at this size, so a label never runs into the bar beside it.
    const keyW = Math.max(size * 6.4, 58);
    const valW = Math.max(size * 2.4, 24);
    const barW = Math.max(12, w - keyW - valW - 8);
    const rows = [
      { key: 'Na⁺ outside', v: naOut, top: true },
      { key: 'K⁺ outside', v: kOut, top: true },
      { key: 'Na⁺ inside', v: naIn, top: false },
      { key: 'K⁺ inside', v: kIn, top: false },
    ];
    const topStart = Math.max(size * 2, memTop - rowH * 2 - 4);
    const botStart = memBot + 8;
    let ti = 0;
    let bi = 0;
    for (const r of rows) {
      const yy = r.top ? topStart + rowH * ti++ : botStart + rowH * bi++;
      const base = yy + size + 4;
      g.append(text(x, base, r.key, { class: 'pm-barkey', 'font-size': fmt1(size) }));
      g.append(text(x + w, base, String(Math.round(r.v)), { anchor: 'end', class: 'pm-barval', 'font-size': fmt1(size) }));
      const bx = x + keyW;
      const bh = Math.max(3.4, size * 0.44);
      g.append(el('line', { x1: fmt1(bx), y1: fmt1(base + 5.5), x2: fmt1(bx + barW), y2: fmt1(base + 5.5), stroke: C.rule }));
      g.append(el('rect', { x: fmt1(bx), y: fmt1(base + 5.5 - bh), width: fmt1(Math.max(0.6, (clamp(r.v, 0, scale) / scale) * barW)), height: fmt1(bh), fill: C.leaf }));
    }
    g.append(text(x, botStart + rowH * bi + size, 'mmol/L, 0 to 200', { class: 'mol-rt-note', 'font-size': fmt1(size - 1.2) }));
    parent.append(g);
    void y;
    void hgt;
  }

  // ---------------------------------------------------------------- the reading column

  function ledgerRows() {
    const b = blockedBy();
    const e = effort();
    return [
      { head: 'The ledger' },
      ['Cycles completed', String(cycles)],
      ['ATP spent', String(atpSpent)],
      ['Na⁺ carried out', String(naMoved)],
      ['K⁺ carried in', String(kMoved)],
      ['Charge out per cycle', '+1'],
      { head: 'The cost' },
      ['Cycles a second, here', `${rate.toFixed(1)} /s`],
      ['A real pump', `${REAL_TURNOVER} /s`],
      ['Share of the cell’s ATP', `${Math.round(BUDGET_SHARE * e * 100)} %`],
      { head: 'The cell' },
      ['Cell volume', `${volumeFraction().toFixed(2)} ×`],
      ['Time since reset', `${(cellSeconds / 60).toFixed(1)} min`],
      b ? { note: volumeFraction() > 1.35 ? 'A red cell bursts at about one and a half times its resting volume.' : 'Stopped. The bars run down at whatever speed the membrane leaks.', colour: INK.coral } : null,
    ].filter(Boolean);
  }

  function drawRead(w, hgt) {
    readSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    readSvg.replaceChildren();
    const b = blockedBy();
    const st = STAGES[stage];
    const titleSize = clamp(w * 0.055, 11.5, 14.5);
    const lineSize = clamp(w * 0.038, 9.8, 11.4);
    const stepSize = 9.2;

    let cy = stepSize;
    readSvg.append(text(0, cy, `Stage ${stage + 1} of 6`, { class: 'mol-rt-title', 'font-size': stepSize }));
    cy += 5;
    readSvg.append(el('line', { x1: 0, y1: fmt1(cy), x2: fmt1(w), y2: fmt1(cy), stroke: C.ruleStrong }));
    cy += titleSize + 5;
    readSvg.append(text(0, fmt1(cy), st.title, { class: 'pm-title', 'font-size': fmt1(titleSize) }));
    cy += 5;
    const sentence = b ? BLOCK_LINES[b] : st.line;
    const lines = wrapLines(sentence, w, lineSize, narrow ? 3 : 6);
    for (const ln of lines) {
      cy += lineSize + 2.4;
      readSvg.append(text(0, fmt1(cy), ln, { class: 'pm-line', 'font-size': fmt1(lineSize), style: b ? `fill:${INK.coral}` : undefined }));
    }
    cy += 10;

    const rows = ledgerRows();
    const room = Math.max(60, hgt - cy);
    const { rowH, slack } = fitRows(rows, room, { size: narrow ? 9.8 : 10.4 }, 13, 26);
    // The slack is spent as space between the sentence and the table, not left as a hole under it.
    readoutTable(readSvg, rows, { x: 0, y: cy + slack, width: w, rowH, size: narrow ? 9.8 : 10.4 });
  }

  // ---------------------------------------------------------------- layout

  let ready = false;
  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }

  function draw() {
    const [sw, sh] = paneBox(scenePane);
    const [rw, rh] = paneBox(readPane);
    drawScene(sw, sh);
    if (narrow) drawNarrowRead(rw, rh);
    else drawRead(rw, rh);
  }

  // On a phone the four bars leave the scene and become one stacked group at the head of the reading
  // column, each ion's inside and outside adjacent; the ledger and the cost fold into one table under it.
  // The phone's reading column, laid out SEQUENTIALLY: each block is drawn where the one above it ended,
  // and only the table is anchored to the foot. Laid out at fixed fractions instead, a row height that
  // had to be clamped up to its legible minimum pushed the four bars ten pixels past their share and the
  // last one was drawn across the stage sentence.
  function drawNarrowRead(w, hgt) {
    readSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    readSvg.replaceChildren();
    const size = 9.8;
    const barRowH = 11.5;
    // Room for the longest key at this size, so a label never runs into the bar beside it.
    const keyW = Math.max(size * 6.6, 62);
    const valW = Math.max(size * 2.6, 26);
    const barW = Math.max(12, w - keyW - valW - 8);
    const rows = [['Na⁺ outside', naOut], ['Na⁺ inside', naIn], ['K⁺ outside', kOut], ['K⁺ inside', kIn]];
    let cy = size;
    readSvg.append(text(0, cy, 'Concentrations, mmol/L', { class: 'mol-rt-title', 'font-size': 9 }));
    cy += 4;
    readSvg.append(el('line', { x1: 0, y1: fmt1(cy), x2: fmt1(w), y2: fmt1(cy), stroke: C.ruleStrong }));
    for (const [key, v] of rows) {
      cy += barRowH;
      readSvg.append(text(0, fmt1(cy), key, { class: 'pm-barkey', 'font-size': fmt1(size) }));
      readSvg.append(text(fmt1(w), fmt1(cy), String(Math.round(v)), { anchor: 'end', class: 'pm-barval', 'font-size': fmt1(size) }));
      const bh = 3.6;
      readSvg.append(el('line', { x1: fmt1(keyW), y1: fmt1(cy + 3), x2: fmt1(keyW + barW), y2: fmt1(cy + 3), stroke: C.rule }));
      readSvg.append(el('rect', { x: fmt1(keyW), y: fmt1(cy + 3 - bh), width: fmt1(Math.max(0.6, (clamp(v, 0, 200) / 200) * barW)), height: fmt1(bh), fill: C.leaf }));
    }
    cy += 6;

    // The ledger, four rows, anchored to the foot; what is left between it and the bars is the stage
    // sentence's, and the sentence takes as many lines as that room allows and no more.
    const b = blockedBy();
    const st = STAGES[stage];
    const rows2 = [
      ['Cycles · ATP spent', `${cycles} · ${atpSpent}`],
      ['Na⁺ out / K⁺ in', `${naMoved} / ${kMoved}`],
      ['Charge out per cycle', '+1'],
      ['Cell volume', `${volumeFraction().toFixed(2)} ×`],
    ];
    // The table takes exactly the room its four rows need, so what is left between it and the bars is
    // the sentence's and can be measured rather than guessed.
    const tableRowH = 12.6;
    const tableH = rows2.length * tableRowH + 3;
    const lineSize = 10;
    readSvg.append(el('line', { x1: 0, y1: fmt1(cy), x2: fmt1(w), y2: fmt1(cy), stroke: C.ruleStrong }));
    cy += lineSize + 4;
    readSvg.append(text(0, fmt1(cy), `${stage + 1}/6 · ${st.title}`, { class: 'pm-title', 'font-size': fmt1(lineSize + 0.6) }));
    // Whole lines only, and never one that would be drawn into the table below it.
    // `readoutTable` leaves about three tenths of a row above its first baseline, so a line may end two
    // pixels into the table's own box and still be clear of its rule.
    const maxLines = clamp(Math.floor((hgt - tableH - cy + 2) / (lineSize + 2.2)), 0, 3);
    for (const ln of wrapLines(b ? BLOCK_SHORT[b] : st.short, w, lineSize, maxLines)) {
      if (cy + lineSize + 2.2 > hgt - tableH + 2) break;
      cy += lineSize + 2.2;
      readSvg.append(text(0, fmt1(cy), ln, { class: 'pm-line', 'font-size': fmt1(lineSize), style: b ? `fill:${INK.coral}` : undefined }));
    }
    readoutTable(readSvg, rows2, { x: 0, y: hgt - tableH, width: w, rowH: tableRowH, size: 9.6 });
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < 620 || hgt < 330;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 18;
    if (pad > 18 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--pump-pad', `${pad}px`);
    }
    return true;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    draw();
    if (!ready) {
      ready = true;
      announce();
      ctx.onReady();
    }
  }

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  document.fonts?.ready.then(() => { if (!destroyed && ready) draw(); });
  onResize();
  void ns;

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      sceneSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    // The bench has no clock of its own: every number is a function of the reader's presses and of how
    // long Run has been on, so pinning time snaps the shape change and redraws.
    setTime() {
      if (destroyed || !ready) return;
      openCur = openGoal;
      draw();
    },
    setVisible(v) {
      if (!v && raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; } else if (v && running) kick();
    },
    setTheme() {
      if (!destroyed && ready) draw();
    },
    describe() {
      const st = STAGES[stage];
      const b = blockedBy();
      return {
        stage,
        stageName: st.name,
        facing: st.facing,
        phosphorylated: st.phos,
        naInsideMM: round(naIn, 1),
        naOutsideMM: round(naOut, 1),
        kInsideMM: round(kIn, 1),
        kOutsideMM: round(kOut, 1),
        cycles,
        atpSpent,
        naMoved,
        kMoved,
        chargePerCycle: 1,
        atp: round(atp, 2),
        blocked: b,
        stalled: b !== null,
        leakiness: round(leakiness, 2),
        cellVolumeFraction: round(volumeFraction(), 3),
        cellMinutes: round(cellSeconds / 60, 2),
        rate: round(rate, 1),
        running,
        ouabain,
        layout: narrow ? 'narrow' : 'wide',
        t: round(cellSeconds / CELL_SECONDS_PER_WATCHED, 3),
      };
    },
  };
}
