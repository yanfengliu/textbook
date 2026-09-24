// A gradient is a battery: charged by the pump, spent by everything else.
//
// SCENE ONE, `gut-cell`. A cell from the lining of the small intestine, gut lumen above and a blood
// capillary below, with tight junctions sealing the two faces apart. On the apical face a sodium–glucose
// symporter takes two sodium ions in with every glucose. On the basolateral face the sodium–potassium
// pump throws the sodium straight back out, a glucose carrier lets glucose leave downhill into the
// blood, and potassium leak channels stand open. A voltmeter reads the membrane potential. Bars track
// sodium inside and out and glucose in the lumen, the cell and the blood, and a ratio says how far above
// the lumen the cell has concentrated its glucose.
//
// IT OPENS STOPPED, with all three glucose compartments at 5 mmol/L, so the ratio is exactly 1 and every
// number a task can name has to be made true by the reader pressing Run.
//
// SCENE TWO, `heart-cell`. Cardiac muscle, with a sodium–calcium antiporter that admits three sodium
// ions for every calcium ion it expels, so the sodium gradient pays for keeping calcium out. Digoxin
// partly blocks the pump; sodium inside rises; the antiporter's driving force falls with the cube of the
// sodium ratio; calcium stays in; and the cell contracts harder.
//
// THE EVIDENCE THIS FIGURE EXISTS FOR. §4.7 claims the resting potential is potassium leaking out and not
// the pump pushing, and the claim is settled by two blockers with visibly different time courses:
//   Block the leak: the potassium permeability drops, and the potential collapses within a frame,
//   because the potential is a property of the permeabilities and the concentrations as they stand.
//   Block the pump: the potential barely moves for minutes and then decays only as fast as the
//   concentrations themselves do. On this model, three minutes after the pump is stopped the potential
//   has moved under a millivolt, and an hour later it has gone from about −71 mV to about −53 mV.
// The trace draws the measured potential against time with a mark wherever a blocker was applied, so the
// difference is a shape on a chart and not a sentence.
//
// THE MODEL.
//   Potential: the Goldman equation in the form §4.7 uses, 61.5 mV per decade at body temperature, with
//   the potassium permeability taken as 1, the sodium permeability as 0.04, and the potassium
//   permeability falling to 0.02 when the leak channels are blocked. At the resting concentrations that
//   gives −71 mV, which is the figure the section quotes for a nerve cell at rest.
//   Nernst for potassium: 61.5 × log10(K_out / K_in), drawn beside the measured line so the reader can
//   check the 61.5 mV per tenfold change with the external potassium slider.
//   Leaks and pump: as in `pump` — a leak proportional to the gradient, a pump at a constant rate scaled
//   by its own affinity for cytosolic sodium, and the pump's size fixed by requiring the two to cancel
//   at rest. The sodium time constant is about fifty minutes, the order a poisoned cell takes.
//   Symporter: the thermodynamics, not a rule. ΔG for one mole of glucose carried in with two sodium is
//   RT·ln(G_cell/G_lumen) + 2·(RT·ln(Na_in/Na_out) + F·V), and the flux is proportional to how negative
//   that is, and zero once it is positive. So the symporter stops — and then runs backwards — as the
//   sodium gradient runs down, without anything in the code being told to stop it.
//   Energy: the same expression, reported per mole of sodium entering and split into its two terms. At
//   rest it gives 6.4 kJ from the concentration term and 6.9 from the electrical one, which are §4.7's
//   own numbers, against about 50 kJ from a mole of ATP.
//   Calcium: extruded at a rate proportional to (Na_out/Na_in)³, the antiporter's stoichiometry, and
//   leaking in at a constant rate, which puts resting cytosolic calcium at 100 nmol/L.
//
// ONE CLOCK, stated on the stage: one second here is about one minute in the cell, because what §4.7
// wants shown is a gradient taking minutes to notice that its pump has stopped. Nothing advances while
// the figure is stopped, so `setTime` only redraws — and a pinned clock cannot be started, because
// `setRunning` refuses while `ctx.pinnedTime` is set. That guard is the whole of the claim: without it
// this comment was true only until something pressed Run, which `tools/legible.js` does.
//
// COMPOSITION. Wide: the cell upright on the left (lumen above, blood below is already a tall
// arrangement), the bars and the ratio in the middle column, and the trace over the energy table on the
// right. Narrow is a real second composition: the cell keeps the top, the trace keeps FULL width because
// it is what shows the delay, and the bars, the voltmeter and the energy panel move into one column
// beneath it rather than flanking. The narrow energy table keeps all four of its rows rather than
// collapsing to two with the terms on a press: at 9.6 px four rows fit in the column the phone layout
// leaves, and a control that exists at only one width is a control an item cannot quote.
//
// COLOUR. `membranePart('pump')`, `('carrier')`, `('channel')`, `('glucose')`, `('lipidHead')` and
// `('lipidTail')`; the ions from the one element table, told apart by symbol and ionic radius. A symbol
// written on one of those fills takes `membranePart(id).symbolColor`, which is the colour itself and not
// a token to resolve through the theme: those fills are fixed hexes in both themes, so the symbol on them
// is fixed too and the measured ratio holds on either paper.
import { el, h, text, C, tint, clamp, uid } from './lib/svg.js';
import { atom, readoutCss, readoutTable, fitRows, round, INK, mulberry32 } from './lib/mol-draw.js';
import { membranePart, LIGHT } from '../palette.js';

export const meta = { kind: 'gradient-battery', title: 'The battery charged, and spent', needsWebGL: false, aspect: 16 / 10 };

// ---------------------------------------------------------------- the model

const RT = 2.577; // kJ/mol at 310 K
const F_KJ = 96.485; // kJ per mole per volt
const MV_PER_DECADE = 61.5; // at body temperature, for a singly charged ion
const ATP_KJ = 50; // per mole under cellular conditions, §4.7

const NA_OUT = 145;
const NA_IN0 = 12;
const K_IN0 = 140;
const K_OUT0 = 4;
const P_NA = 0.04; // relative to a potassium permeability of 1
const P_K_BLOCKED = 0.02;

const LAMBDA_NA = 3.3e-4; // per cell-second
const KM_PUMP = 10; // the pump's affinity for cytosolic sodium, mmol/L
const PUMP_NA = (LAMBDA_NA * (NA_OUT - NA_IN0)) / (NA_IN0 / (NA_IN0 + KM_PUMP));
const LAMBDA_K = ((2 / 3) * LAMBDA_NA * (NA_OUT - NA_IN0)) / (K_IN0 - K_OUT0);
const DIGOXIN_BLOCK = 0.85; // the fraction of the pump left working: a therapeutic dose, not a poisoning

const GLUCOSE0 = 5; // mmol/L, in the lumen, the cell and the blood alike, so the ratio opens at 1
const K_SYM = 1.24e-4; // mmol/L per second per kJ/mol of driving force
const K_GLUT = 6e-4; // the basolateral carrier, both ways
// Back around the OUTSIDE of the cell, once the tight junction is gone. It is much the largest of the
// three glucose terms by design: a tight junction's whole job is to be a high resistance, so the path it
// was sealing is a short circuit and not a trickle. At 9e-4 it was smaller than the symporter's own
// flux, so removing the junction left the cell still concentrating glucose and the ratio went on rising
// — the opposite of §3.7's point, and `npm run drive` caught it.
const K_PARA = 6e-3;
const LUMEN_VOLUMES = 0.8; // the lumen this cell is drawing on, in cell volumes

const CA_IN0 = 100; // nmol/L
const KM_CA = 1000; // nmol/L
const K_EX = 6; // nmol/L a second of extrusion at the resting sodium ratio and saturating calcium
const CA_LEAK = K_EX * (CA_IN0 / (CA_IN0 + KM_CA));
const NA_RATIO0 = (NA_OUT / NA_IN0) ** 3;

const CELL_SECONDS_PER_WATCHED = 60;
const TRACE_MINUTES = 60;
const K_OUT_RANGE = { min: 1, max: 40 };

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-gbat')}
.tb-gbat { position: absolute; inset: 0; box-sizing: border-box;
  padding: 0.35rem 0.5rem var(--gb-pad, 3rem); font-family: var(--font-ui); }
.tb-gbat .gb-pane { position: absolute; inset: 0.35rem 0.5rem var(--gb-pad, 3rem); }
.tb-gbat .gb-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-gbat svg text { font-family: var(--font-ui); }
.tb-gbat .gb-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; }
.tb-gbat .gb-key { fill: var(--ink-soft); }
.tb-gbat .gb-val { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-gbat .gb-volt { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-gbat .fig-toolbar { justify-content: flex-start; }
.tb-gbat .gb-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-gbat .gb-sep { width: 1px; min-height: 1.4rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
/* The primary action is told by the head rule on its edge and the weight of its ink, never by a fill. */
.tb-gbat .gb-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-gbat .gb-slider { display: flex; align-items: center; gap: 0.3rem; font-size: var(--text-xs);
  color: var(--ink-soft); background: color-mix(in srgb, var(--paper) 86%, transparent);
  padding: 0.18rem 0.4rem; }
.tb-gbat .gb-slider input { width: 4rem; }
.tb-gbat .gb-slider .gb-v { color: var(--ink); font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums; min-width: 3.4rem; text-align: right; }
.tb-gbat.is-heart .gb-only-gut { display: none; }
.tb-gbat.is-gut .gb-only-heart { display: none; }
/* Eight buttons and a slider have to fit a 342 px bar. At 10.5 px — thirty-one device pixels on a 3×
   phone, well over the nine-pixel floor — they come down from five rows to four, and the words are the
   same words as at desktop width, which is the constraint an item's goal depends on. */
.tb-gbat.is-narrow .fig-toolbar { gap: 0.28rem; }
.tb-gbat.is-narrow .fig-btn { font-size: 10.5px; padding: 0.22rem 0.42rem; }
.tb-gbat.is-narrow .gb-sep { display: none; }
.tb-gbat.is-narrow .gb-slider { font-size: 10.5px; padding: 0.1rem 0.26rem; gap: 0.22rem; }
.tb-gbat.is-narrow .gb-slider input { width: 2.8rem; }
.tb-gbat.is-narrow .gb-slider .gb-v { min-width: 2.7rem; }
`;

// ---------------------------------------------------------------- helpers

const f1 = (v) => v.toFixed(1);
const log10 = (v) => Math.log10(Math.max(v, 1e-9));

// `readoutTable` draws a note as one line, so a sentence longer than its column runs off the edge of the
// pane. Every note here is broken to the column first. Inter runs about 0.52 em over mixed-case text.
function notes(str, width, size) {
  const per = Math.max(10, Math.floor(width / (size * 0.52)));
  const out = [];
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > per && line) { out.push({ note: line }); line = word; } else line = next;
  }
  if (line) out.push({ note: line });
  return out;
}

function scatter(seed, n) {
  const rng = mulberry32(seed);
  const pts = [];
  let tries = 0;
  while (pts.length < n && tries < 6000) {
    tries += 1;
    const p = [0.05 + rng() * 0.9, 0.08 + rng() * 0.84];
    if (pts.every((q) => Math.hypot((q[0] - p[0]) * 2.2, q[1] - p[1]) > 0.2)) pts.push(p);
  }
  return pts;
}
// Twenty-two slots a field, used in pairs: the even ones carry glucose and the odd ones sodium, so
// the two species share a field without ever landing on each other.
const LUMEN_SPOTS = scatter(9101, 22);
const CELL_SPOTS = scatter(9102, 22);
const BLOOD_SPOTS = scatter(9103, 22);

function glucoseMark(cx, cy, r, fill) {
  let d = '';
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return el('path', { d: `${d} Z`, fill });
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('gb');
  let destroyed = false;
  let narrow = false;
  let padPx = 0;
  // A pinned clock is not advanced by any control. `?t=` pins every figure on the page and the gates take
  // their frames that way; this figure read nothing of ctx.pinnedTime at all, so pressing Run on a pinned
  // page started the cell and ran it at a simulated minute a second. Written as a function rather than
  // read once because the frame may pin a figure that mounted unpinned. `undefined` counts as unpinned as
  // well as `null`: a ctx that omits the field must leave the figure runnable for a reader.
  const pinned = () => ctx.pinnedTime !== null && ctx.pinnedTime !== undefined;

  const PUMP_FILL = membranePart('pump').color;
  const PUMP_LABEL = membranePart('pump').symbolColor;
  const CARRIER_FILL = membranePart('carrier').color;
  const CARRIER_LABEL = membranePart('carrier').symbolColor;
  const CHANNEL_FILL = membranePart('channel').color;
  const GLUCOSE_FILL = membranePart('glucose').color;
  const HEAD_FILL = membranePart('lipidHead').color;
  // The interior is a wash of the gold token mixed into the paper, which is how permeability and
  // bulk-transport draw the same cytoplasm: the voltmeter, the protein names and the ions' charge signs
  // are all set over it, so it has to follow the theme. The flat ORGANELLES.cytoplasm is a fixed light
  // cream, and mixing THAT into the paper only half works: 30% of it put `var(--ink)` right in both themes
  // but made a mid-grey slab of the dark theme's cell (#575652), on which the --ink-faint names measured
  // 2.15:1 (npm run legible, 2026-09-23). 8 and not the 9 or 10 of the other two figures because notes are
  // set straight on this one with no halo: --ink-faint on it is 4.78:1 light and 4.53:1 dark, where 9
  // gives 4.44:1 dark and 10 gives 4.34:1.
  const CYTO_FILL = tint(C.gold, 8);

  // ---- state ----
  let scene = 'gut-cell';
  let running = false;
  let naIn = NA_IN0;
  let kIn = K_IN0;
  let kOut = K_OUT0;
  let gLumen = GLUCOSE0;
  let gCell = GLUCOSE0;
  const gBlood = GLUCOSE0;
  let caIn = CA_IN0;
  let pumpRunning = true;
  let leakOpen = true;
  let symporter = true;
  let tightJunction = true;
  let digoxin = false;
  let cellSeconds = 0;
  let trace = [{ m: 0, v: 0, n: 0 }];
  let marks = []; // { m, label }
  let raf = 0;
  let lastFrame = 0;

  const pK = () => (leakOpen ? 1 : P_K_BLOCKED);
  function potential() {
    const num = pK() * kOut + P_NA * NA_OUT;
    const den = pK() * kIn + P_NA * naIn;
    return MV_PER_DECADE * log10(num / den);
  }
  const nernstK = () => MV_PER_DECADE * log10(kOut / kIn);
  const pumpFraction = () => (!pumpRunning ? 0 : digoxin ? DIGOXIN_BLOCK : 1);
  const naChemical = () => RT * Math.log(NA_OUT / Math.max(naIn, 0.1));
  const naElectrical = () => F_KJ * (-potential() / 1000);
  const naEnergy = () => naChemical() + naElectrical();
  // One mole of glucose carried in with two sodium. Negative means the symporter runs forwards.
  const symporterDeltaG = () => RT * Math.log(Math.max(gCell, 1e-3) / Math.max(gLumen, 1e-3)) - 2 * naEnergy();
  const glucoseRatio = () => gCell / Math.max(gLumen, 1e-3);
  const contraction = () => (caIn / CA_IN0) ** 0.35;

  function blockedList() {
    const list = [];
    if (!pumpRunning) list.push('pump');
    if (!leakOpen) list.push('leak');
    if (!symporter) list.push('symporter');
    if (!tightJunction) list.push('tight-junction');
    if (digoxin) list.push('digoxin');
    return list;
  }

  function advance(dt) {
    const pumpNa = PUMP_NA * pumpFraction() * (naIn / (naIn + KM_PUMP));
    let dNa = LAMBDA_NA * (NA_OUT - naIn) - pumpNa;
    let dK = -LAMBDA_K * (kIn - kOut) * pK() + (2 / 3) * pumpNa;
    if (scene === 'gut-cell') {
      const jSym = symporter ? K_SYM * -symporterDeltaG() : 0;
      const jGlut = K_GLUT * (gCell - gBlood);
      const jPara = tightJunction ? 0 : K_PARA * (gCell - gLumen);
      dNa += 2 * jSym;
      gCell = clamp(gCell + (jSym - jGlut - jPara) * dt, 0.01, 200);
      gLumen = clamp(gLumen + ((-jSym + jPara) / LUMEN_VOLUMES) * dt, 0.01, 200);
    } else {
      const ratio = (NA_OUT / Math.max(naIn, 0.5)) ** 3 / NA_RATIO0;
      const out = K_EX * ratio * (caIn / (caIn + KM_CA));
      caIn = clamp(caIn + (CA_LEAK - out) * dt, 1, 5000);
    }
    naIn = clamp(naIn + dNa * dt, 0.5, 200);
    kIn = clamp(kIn + dK * dt, 0.5, 200);
    cellSeconds += dt;
    const m = cellSeconds / 60;
    const last = trace[trace.length - 1];
    if (!last || m - last.m > TRACE_MINUTES / 600) {
      trace.push({ m, v: potential(), n: nernstK() });
      if (trace.length > 700) trace.shift();
    }
  }

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-gbat is-gut' });
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'A gut lining cell between the lumen and a capillary, with a sodium–glucose symporter, the sodium–potassium pump, a glucose carrier and potassium leak channels. Space runs and pauses it.',
  });
  const pane = h('div', { class: 'gb-pane' }, [svg]);

  const button = (label, onClick, { pressed = null, primary = false, cls = '' } = {}) => {
    const b = h('button', { class: `fig-btn${primary ? ' gb-primary' : ''}${cls ? ` ${cls}` : ''}`, type: 'button', text: label });
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    return b;
  };

  const btnGut = button('Gut cell', () => setScene('gut-cell'), { pressed: true });
  const btnHeart = button('Heart cell', () => setScene('heart-cell'), { pressed: false });
  const btnRun = button('Run', () => setRunning(!running), { primary: true });
  const btnPump = button('Block the pump', () => {
    pumpRunning = !pumpRunning;
    btnPump.setAttribute('aria-pressed', String(!pumpRunning));
    mark(pumpRunning ? 'pump back' : 'pump');
    redraw();
  }, { pressed: false });
  const btnLeak = button('Block the leak', () => {
    leakOpen = !leakOpen;
    btnLeak.setAttribute('aria-pressed', String(!leakOpen));
    mark(leakOpen ? 'leak back' : 'leak');
    redraw();
  }, { pressed: false, cls: '' });
  const btnSym = button('Block the symporter', () => {
    symporter = !symporter;
    btnSym.setAttribute('aria-pressed', String(!symporter));
    mark(symporter ? 'symporter back' : 'symporter');
    redraw();
  }, { pressed: false, cls: 'gb-only-gut' });
  const btnJunction = button('Remove the tight junction', () => {
    tightJunction = !tightJunction;
    btnJunction.setAttribute('aria-pressed', String(!tightJunction));
    mark(tightJunction ? 'junction back' : 'junction');
    redraw();
  }, { pressed: false, cls: 'gb-only-gut' });
  const btnDigoxin = button('Digoxin', () => {
    digoxin = !digoxin;
    btnDigoxin.setAttribute('aria-pressed', String(digoxin));
    mark(digoxin ? 'digoxin' : 'digoxin off');
    redraw();
  }, { pressed: false, cls: 'gb-only-heart' });
  const btnReset = button('Reset', () => reset());

  const kInput = h('input', { class: 'fig-range', type: 'range', min: K_OUT_RANGE.min, max: K_OUT_RANGE.max, step: 1, value: K_OUT0, 'aria-label': 'External potassium' });
  const kVal = h('span', { class: 'gb-v', text: `${K_OUT0} mmol/L` });
  kInput.addEventListener('input', () => {
    kOut = Number(kInput.value);
    kVal.textContent = `${kOut} mmol/L`;
    redraw();
  });
  const kSlider = h('label', { class: 'gb-slider fig-ui' }, [document.createTextNode('External potassium'), kInput, kVal]);

  const group = (kids, cls = '') => h('div', { class: `gb-group${cls ? ` ${cls}` : ''}` }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnGut, btnHeart]),
    h('span', { class: 'gb-sep', 'aria-hidden': 'true' }),
    group([btnRun, btnReset]),
    h('span', { class: 'gb-sep', 'aria-hidden': 'true' }),
    group([btnPump, btnLeak, btnSym, btnJunction, btnDigoxin]),
    group([kSlider]),
  ]);
  const live = h('span', { 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });
  wrap.append(pane, toolbar, live);
  root.append(wrap);

  // ---- reader actions ----
  function mark(label) {
    marks.push({ m: cellSeconds / 60, label });
    if (marks.length > 8) marks.shift();
  }
  function setScene(next) {
    scene = next;
    btnGut.setAttribute('aria-pressed', String(scene === 'gut-cell'));
    btnHeart.setAttribute('aria-pressed', String(scene === 'heart-cell'));
    wrap.classList.toggle('is-gut', scene === 'gut-cell');
    wrap.classList.toggle('is-heart', scene === 'heart-cell');
    redraw();
  }
  function setRunning(on) {
    // The intent is refused rather than recorded while the clock is pinned: that is this repo's settled
    // shape for a pinned Run (`playing = next && ctx.pinnedTime === null` in bilayer, bulk-transport,
    // osmometer, permeability and polymer), and a button reading Pause over a cell that is not moving is
    // the worse of the two lies. Every label below follows the EFFECTIVE state, not the asked-for one.
    running = on && !pinned();
    btnRun.textContent = running ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-label', running ? 'Pause the cell' : 'Run the cell');
    if (running) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; }
    redraw();
  }
  function reset() {
    naIn = NA_IN0; kIn = K_IN0; kOut = K_OUT0;
    gLumen = GLUCOSE0; gCell = GLUCOSE0; caIn = CA_IN0;
    pumpRunning = true; leakOpen = true; symporter = true; tightJunction = true; digoxin = false;
    cellSeconds = 0;
    trace = [{ m: 0, v: potential(), n: nernstK() }];
    marks = [];
    kInput.value = String(K_OUT0);
    kVal.textContent = `${K_OUT0} mmol/L`;
    for (const [b, p] of [[btnPump, false], [btnLeak, false], [btnSym, false], [btnJunction, false], [btnDigoxin, false]]) b.setAttribute('aria-pressed', String(p));
    setRunning(false);
    // The scene is a control like the others, and Reset means "as it mounted": left out, it was the one
    // thing a Reset did not put back, so a reader in the heart cell pressed Reset, got a rested cell and
    // every blocker cleared, and was still in the heart cell with the gut cell's numbers behind it.
    // setScene redraws, so this replaces the redraw rather than coming before one.
    setScene('gut-cell');
  }
  function redraw() {
    draw();
    announce();
  }
  function announce() {
    if (scene === 'gut-cell') {
      live.textContent = `Gut cell, ${(cellSeconds / 60).toFixed(1)} minutes in. Membrane potential ${potential().toFixed(1)} millivolts, predicted for potassium ${nernstK().toFixed(1)}. Glucose ${gCell.toFixed(2)} in the cell against ${gLumen.toFixed(2)} in the lumen, a ratio of ${glucoseRatio().toFixed(1)}. ${blockedList().length ? `Blocked: ${blockedList().join(', ')}.` : 'Nothing is blocked.'}`;
    } else {
      live.textContent = `Heart cell, ${(cellSeconds / 60).toFixed(1)} minutes in. Sodium inside ${naIn.toFixed(1)} millimoles per litre, calcium inside ${Math.round(caIn)} nanomoles per litre, contraction ${contraction().toFixed(2)} times untreated.`;
    }
  }

  function frame(ms) {
    raf = 0;
    if (destroyed) return;
    const dt = lastFrame ? Math.min(0.1, (ms - lastFrame) / 1000) : 1 / 60;
    lastFrame = ms;
    if (running) advance(dt * CELL_SECONDS_PER_WATCHED);
    draw();
    if (running) kick(); else lastFrame = 0;
  }
  const kick = () => { if (!raf && !destroyed) raf = requestAnimationFrame(frame); };

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setRunning(!running); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
  };
  svg.addEventListener('keydown', onKey);

  // ---------------------------------------------------------------- the cell

  // The cell, drawn two ways. At desktop width every part is named where it stands and the voltmeter is
  // set inside the cell. On a phone the drawing has about a hundred and thirty pixels of height for three
  // compartments, so four scattered protein names, a voltmeter and two dense fields of molecules all
  // land on each other; the narrow composition therefore names the proteins in one legend line under the
  // drawing, drops the voltmeter (the table beneath already reads it), and thins the fields.
  function drawCell(x, y, w, hgt) {
    const g = el('g');
    const sz = clamp(w * 0.038, 8.6, 10.4);
    const legendH = narrow ? sz * 2.4 : 0;
    const body = hgt - legendH;
    // A columnar cell: narrower than the fluids either side of it, and the three bands of comparable
    // depth, so none of the three is a field of paper with four molecules in it.
    const apical = y + body * 0.29;
    const basal = y + body * 0.73;
    const memH = clamp(body * 0.032, 6, 13);
    const cellL = x + w * 0.17;
    const cellR = x + w * 0.83;
    const cellW = cellR - cellL;

    g.append(el('path', {
      d: `M${f1(cellL)} ${f1(apical)} L${f1(cellR)} ${f1(apical)} L${f1(cellR)} ${f1(basal)} L${f1(cellL)} ${f1(basal)} Z`,
      fill: CYTO_FILL,
    }));
    for (const yy of [apical, basal]) {
      g.append(el('rect', { x: f1(cellL), y: f1(yy - memH / 2), width: f1(Math.max(2, cellW)), height: f1(memH), fill: HEAD_FILL }));
    }
    if (tightJunction) {
      for (const sx of [cellL, cellR]) {
        g.append(el('path', {
          d: `M${f1(sx)} ${f1(apical - memH * 1.5)} L${f1(sx)} ${f1(apical + memH * 1.5)}`,
          stroke: C.ink, 'stroke-width': f1(Math.max(2.4, memH * 0.42)), 'stroke-linecap': 'round',
        }));
      }
    }
    g.append(text(x, y + sz, 'Gut lumen', { class: 'gb-head', 'font-size': f1(sz) }));
    g.append(text(x, y + body - 3, 'Blood', { class: 'gb-head', 'font-size': f1(sz) }));
    if (!narrow) {
      g.append(text(x, apical - memH * 2.2, tightJunction ? 'tight junction' : 'no junction', {
        'font-size': f1(Math.max(8, sz - 1.4)), class: tightJunction ? 'mol-rt-note' : undefined,
        style: tightJunction ? undefined : `fill:${INK.coral}`, 'font-weight': tightJunction ? undefined : 600,
      }));
    }

    // --- the four proteins, each in the face it belongs to ---
    const pw = clamp(cellW * 0.13, 15, 30);
    const symX = cellL + cellW * 0.5;
    const pumpX = cellL + cellW * 0.22;
    const glutX = cellL + cellW * 0.55;
    const leakX = cellL + cellW * 0.85;
    const protein = (cx, yy, fill, label, labelInk) => {
      g.append(el('rect', { x: f1(cx - pw / 2), y: f1(yy - memH * 1.5), width: f1(pw), height: f1(memH * 3), fill, rx: f1(pw * 0.22) }));
      if (pw > 19) g.append(text(cx, yy + 3.2, label, { anchor: 'middle', 'font-size': f1(Math.min(9.6, pw * 0.46)), 'font-weight': 700, style: `fill:${labelInk}` }));
    };
    // A blocked protein is drawn in the rule colour, which is pale, so its letter takes the ink rather
    // than the paper its own fill would have asked for. The ink itself and not --ink-soft: the soft ink
    // on --rule-strong is 4.37:1 light and 3.88:1 dark (npm run legible, 2026-09-23), and --ink is 10.32:1
    // and 8.23:1. The grey of the fill is what says "blocked"; the letter still has to say which one.
    protein(symX, apical, symporter ? CARRIER_FILL : C.ruleStrong, 'S', symporter ? CARRIER_LABEL : C.ink);
    protein(pumpX, basal, pumpRunning ? PUMP_FILL : C.ruleStrong, 'P', pumpRunning ? PUMP_LABEL : C.ink);
    protein(glutX, basal, CARRIER_FILL, 'G', CARRIER_LABEL);
    protein(leakX, basal, leakOpen ? CHANNEL_FILL : C.ruleStrong, 'K', leakOpen ? LIGHT.ink : C.ink);
    const ls = f1(Math.max(7.8, sz - 1.4));
    if (!narrow) {
      g.append(text(symX, apical + memH * 1.5 + 10, 'symporter', { anchor: 'middle', class: 'mol-rt-note', 'font-size': ls }));
      g.append(text(pumpX, basal + memH * 1.5 + 10, 'pump', { anchor: 'middle', class: 'mol-rt-note', 'font-size': ls }));
      g.append(text(glutX, basal + memH * 1.5 + 10, 'carrier', { anchor: 'middle', class: 'mol-rt-note', 'font-size': ls }));
      g.append(text(leakX, basal + memH * 1.5 + 10, 'leak', { anchor: 'middle', class: 'mol-rt-note', 'font-size': ls }));
    }

    // --- the voltmeter, in the lower half of the cell where no glucose is drawn ---
    const vs = narrow ? 0 : clamp(cellW * 0.13, 12, 19);
    const voltY = narrow ? basal - memH * 1.4 : basal - memH * 1.4 - vs * 0.9;
    if (!narrow) {
      g.append(text(cellR - 4, voltY, `${potential().toFixed(1)} mV`, { anchor: 'end', class: 'gb-volt', 'font-size': f1(vs) }));
      g.append(text(cellR - 4, voltY + vs * 0.82, 'inside, against outside', { anchor: 'end', class: 'mol-rt-note', 'font-size': f1(Math.max(7.8, sz - 1.6)) }));
    }

    // --- the populations: glucose and sodium share each field, on alternate slots ---
    const gr = clamp(w * 0.018, 3.4, 6.6);
    const perMark = narrow ? 1.7 : 0.62; // mmol/L per drawn glucose, which the stage says out loud
    const naR = clamp(w * 0.018, 3.6, 6.8);
    const perNa = narrow ? 48 : 24; // mmol/L per drawn sodium ion
    const cap = narrow ? 4 : 11;
    const fields = [
      { spots: LUMEN_SPOTS, x0: x, w, y0: y + sz * 1.9, y1: apical - memH * (narrow ? 1.9 : 2.3), g: gLumen, na: NA_OUT },
      { spots: CELL_SPOTS, x0: cellL + 3, w: cellW - 6, y0: apical + memH * 2.2, y1: voltY - vs * 0.9, g: gCell, na: naIn },
      { spots: BLOOD_SPOTS, x0: x, w, y0: basal + memH * (narrow ? 2.2 : 2.4), g: gBlood, na: NA_OUT, y1: y + body - sz * 2.2 },
    ];
    for (const fld of fields) {
      const h0 = Math.max(8, fld.y1 - fld.y0);
      const nG = Math.round(clamp(fld.g / perMark, 0, cap));
      const nNa = Math.round(clamp(fld.na / perNa, 0, cap));
      for (let i = 0; i < nG; i += 1) {
        const p = fld.spots[i * 2];
        if (!p) break;
        g.append(glucoseMark(fld.x0 + p[0] * fld.w, fld.y0 + p[1] * h0, gr, GLUCOSE_FILL));
      }
      for (let i = 0; i < nNa; i += 1) {
        const p = fld.spots[i * 2 + 1];
        if (!p) break;
        g.append(atom(fld.x0 + p[0] * fld.w, fld.y0 + p[1] * h0, 'Na', naR, { charge: '+', label: naR >= 4.4 }));
      }
    }

    if (narrow) {
      // One legend line under the drawing instead of four names scattered through it, and a second line
      // for the junctions, which are two black bars and not a shape a reader can name unaided.
      g.append(text(x, y + body + sz, 'S symporter · P pump · G carrier · K leak', { class: 'mol-rt-note', 'font-size': f1(sz - 0.6) }));
      g.append(text(x, y + body + sz * 2.1, tightJunction ? 'the black bars are the tight junctions · 1 s ≈ 1 min' : 'the tight junction is gone · 1 s ≈ 1 min', {
        'font-size': f1(sz - 0.8), class: tightJunction ? 'mol-rt-note' : undefined,
        style: tightJunction ? undefined : `fill:${INK.coral}`, 'font-weight': tightJunction ? undefined : 600,
      }));
    } else {
      g.append(text(x + w, y + sz, `1 s ≈ 1 min · one Na⁺ per ${perNa} mmol/L, one glucose per ${perMark.toFixed(2)}`, { anchor: 'end', class: 'mol-rt-note', 'font-size': f1(Math.max(7.8, sz - 1.4)) }));
    }
    svg.append(g);
  }

  // The heart cell, and under it the thing the whole scene is for: a beat whose height is the contraction
  // the model is producing, against a dotted line at the untreated one. Drawn as a cell alone the column
  // was a pale box with six calcium ions in it and two thirds of it empty, and the payoff — that the cell
  // contracts harder — was a number in a table somewhere else.
  function drawHeartCell(x, y, w, hgt) {
    const g = el('g');
    const sz = clamp(w * 0.038, 8.6, 10.4);
    const beat = running ? 0.5 + 0.5 * Math.sin(cellSeconds * 0.42) : 0.5;
    const squeeze = 1 - 0.1 * beat * contraction();
    const naR = clamp(w * 0.018, 4.6, 6.8);
    // A cardiac cell is elongated, so its half-height is capped against the column's WIDTH: given the
    // whole column it became a tall pale box with eight ions adrift in it. The cell starts below the
    // heading and below the row of sodium waiting outside it, which is what the antiporter spends.
    const headerH = sz * 1.6 + naR * 2.4;
    const memH = clamp(hgt * 0.03, 6, 12);
    const halfH = clamp((hgt * 0.62 - headerH) * 0.5 * squeeze, 24, w * 0.27);
    const cy = y + headerH + halfH + memH;
    const body = cy + halfH + memH + sz * 1.6;
    const beatH = Math.max(52, y + hgt - body - 2);
    const cellL = x + w * 0.06;
    const cellR = x + w * 0.94;
    g.append(el('path', {
      d: `M${f1(cellL)} ${f1(cy - halfH)} L${f1(cellR)} ${f1(cy - halfH)} L${f1(cellR)} ${f1(cy + halfH)} L${f1(cellL)} ${f1(cy + halfH)} Z`,
      fill: CYTO_FILL,
    }));
    for (const yy of [cy - halfH, cy + halfH]) {
      g.append(el('rect', { x: f1(cellL), y: f1(yy - memH / 2), width: f1(Math.max(2, cellR - cellL)), height: f1(memH), fill: HEAD_FILL }));
    }
    // The striations of cardiac muscle, which crowd together as the cell contracts.
    const bands = 7;
    for (let i = 1; i < bands; i += 1) {
      const bx = cellL + ((cellR - cellL) * i) / bands;
      g.append(el('line', { x1: f1(bx), y1: f1(cy - halfH + memH), x2: f1(bx), y2: f1(cy + halfH - memH), stroke: C.rule, 'stroke-width': 1.2 }));
    }
    const pw = clamp(w * 0.1, 15, 30);
    const protein = (px, yy, fill, label, labelInk) => {
      g.append(el('rect', { x: f1(px - pw / 2), y: f1(yy - memH * 1.5), width: f1(pw), height: f1(memH * 3), fill, rx: f1(pw * 0.22) }));
      if (pw > 19) g.append(text(px, yy + 3.2, label, { anchor: 'middle', 'font-size': f1(Math.min(9.6, pw * 0.46)), 'font-weight': 700, style: `fill:${labelInk}` }));
    };
    const antiX = cellL + (cellR - cellL) * 0.3;
    const pumpX = cellL + (cellR - cellL) * 0.7;
    protein(antiX, cy - halfH, CARRIER_FILL, 'A', CARRIER_LABEL);
    // Blocked by digoxin, it takes the gut cell's blocked colours: the ink on --rule-strong.
    protein(pumpX, cy - halfH, digoxin ? C.ruleStrong : PUMP_FILL, 'P', digoxin ? C.ink : PUMP_LABEL);
    const ls = f1(Math.max(7.8, sz - 1.4));
    if (!narrow) {
      // Under the membrane, inside the cell: above it the two names shared a line with the heading, the
      // scale note and the row of sodium ions.
      g.append(text(antiX, cy - halfH + memH * 1.5 + 11, 'Na⁺/Ca²⁺ antiporter', { anchor: 'middle', class: 'mol-rt-note', 'font-size': ls }));
      g.append(text(pumpX, cy - halfH + memH * 1.5 + 11, digoxin ? 'pump, part blocked' : 'pump', { anchor: 'middle', class: 'mol-rt-note', 'font-size': ls }));
    } else {
      g.append(text(x, cy + halfH + memH + sz, digoxin ? 'A antiporter · P pump, part blocked' : 'A antiporter · P pump', { class: 'mol-rt-note', 'font-size': ls }));
    }

    // Calcium inside, at a count that follows the concentration, and the sodium the antiporter spends.
    const caR = clamp(w * 0.019, 4.6, 7);
    const perCa = 20; // nmol/L per drawn calcium ion
    const nCa = Math.round(clamp(caIn / perCa, 0, 11));
    const nNa = Math.round(clamp(naIn / 3, 0, 11));
    const fy0 = cy - halfH + memH * 2 + (narrow ? 0 : 14);
    const fh = Math.max(8, 2 * halfH - memH * 4 - (narrow ? 0 : 14));
    for (let i = 0; i < nCa; i += 1) {
      const p = CELL_SPOTS[i * 2];
      if (p) g.append(atom(cellL + 4 + p[0] * (cellR - cellL - 8), fy0 + p[1] * fh, 'Ca', caR, { charge: '2+', label: caR >= 4.4 }));
    }
    for (let i = 0; i < nNa; i += 1) {
      const p = CELL_SPOTS[i * 2 + 1];
      if (p) g.append(atom(cellL + 4 + p[0] * (cellR - cellL - 8), fy0 + p[1] * fh, 'Na', naR, { charge: '+', label: naR >= 4.4 }));
    }
    // And the sodium waiting outside, which is what pays for the calcium leaving.
    for (let i = 0; i < 6; i += 1) {
      g.append(atom(cellL + 8 + i * naR * 2.6, cy - halfH - memH * 1.1 - naR, 'Na', naR, { charge: '+', label: naR >= 4.4 }));
    }

    g.append(text(x, y + sz, 'Cardiac muscle cell', { class: 'gb-head', 'font-size': f1(sz) }));
    if (!narrow) g.append(text(x + w, y + sz, `1 s ≈ 1 min · one Ca²⁺ per ${perCa} nmol/L`, { anchor: 'end', class: 'mol-rt-note', 'font-size': f1(Math.max(7.8, sz - 1.4)) }));
    svg.append(g);
    drawBeat(x, body, w, beatH);
  }

  // Four beats of the contraction the model is producing, against a dotted line at the untreated one.
  // A pure function of the clock and of `contractionStrength`, so a pinned frame is the same frame.
  function drawBeat(x, y, w, hgt) {
    const g = el('g');
    const padL = 4;
    const padT = 13;
    const padB = 12;
    const pw = Math.max(20, w - padL - 4);
    const ph = Math.max(18, hgt - padT - padB);
    const base = y + padT + ph;
    const amp = clamp(contraction(), 0, 2);
    // The plot scales to whatever the beat now is, so it always fills its pane and never overshoots it.
    // The untreated line therefore sinks down the plot as the contraction grows, which is the reading:
    // the beat has climbed past what it was.
    const unit = ph / (1.15 * Math.max(1, amp));
    g.append(text(x, y + 9, 'Contraction, against untreated', { class: 'mol-rt-title', 'font-size': 9 }));
    g.append(el('line', { x1: f1(x + padL), y1: f1(base), x2: f1(x + padL + pw), y2: f1(base), stroke: C.ruleStrong }));
    g.append(el('line', { x1: f1(x + padL), y1: f1(base - unit), x2: f1(x + padL + pw), y2: f1(base - unit), stroke: C.soft, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    g.append(text(x + padL + pw, f1(base - unit - 3), 'untreated', { anchor: 'end', class: 'mol-rt-note', 'font-size': 8.6 }));
    const beats = 4;
    const phase = running ? (cellSeconds * 0.42) / (Math.PI * 2) : 0;
    let d = '';
    const N = 120;
    for (let i = 0; i <= N; i += 1) {
      const u = i / N;
      // One beat: a quick rise and a slower relaxation, repeated.
      const f = ((u * beats - phase) % 1 + 1) % 1;
      const h = f < 0.22 ? Math.sin((f / 0.22) * Math.PI * 0.5) : Math.exp(-(f - 0.22) * 6);
      d += `${i ? 'L' : 'M'}${f1(x + padL + u * pw)} ${f1(base - h * amp * unit)}`;
    }
    g.append(el('path', { d, fill: 'none', stroke: INK.coral, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    g.append(text(x + padL, f1(base + 10), `${amp.toFixed(2)} × the untreated contraction`, { class: 'gb-val', 'font-size': 9.6 }));
    svg.append(g);
  }

  // ---------------------------------------------------------------- the trace

  function drawTrace(x, y, w, hgt) {
    const g = el('g');
    const padL = 34;
    const padR = 8;
    const padT = 20;
    const padB = 20;
    const pw = Math.max(30, w - padL - padR);
    const ph = Math.max(28, hgt - padT - padB);
    const X0 = x + padL;
    const Y0 = y + padT;
    const lo = -110;
    const hi = 30;
    // The window grows with the run rather than sitting at an hour from the start: at a fixed hour, three
    // minutes of evidence was five per cent of the width and the two blocker marks sat on top of each
    // other. It never shrinks below six minutes, so the first step is still a step and not a spike.
    const span = clamp(Math.max(6, (cellSeconds / 60) * 1.3), 6, TRACE_MINUTES * 4);
    const X = (m) => X0 + (clamp(m, 0, span) / span) * pw;
    const Y = (v) => Y0 + (1 - (clamp(v, lo, hi) - lo) / (hi - lo)) * ph;
    g.append(el('line', { x1: f1(X0), y1: f1(Y0), x2: f1(X0), y2: f1(Y0 + ph), stroke: C.ruleStrong }));
    for (const v of [0, -50, -100]) {
      g.append(el('line', { x1: f1(X0), y1: f1(Y(v)), x2: f1(X0 + pw), y2: f1(Y(v)), stroke: v === 0 ? C.ruleStrong : C.rule }));
      g.append(text(X0 - 4, Y(v) + 3.2, String(v), { anchor: 'end', class: 'mol-rt-note', 'font-size': 9 }));
    }
    g.append(text(x, y + 9, 'Membrane potential, mV against minutes', { class: 'mol-rt-title', 'font-size': 9 }));
    g.append(text(X0 + pw, Y0 + ph + 14, `${Math.round(span)} min`, { anchor: 'end', class: 'mol-rt-note', 'font-size': 9 }));

    // Two blockers applied a few minutes apart land a few pixels apart, so a mark's label steps down a
    // line whenever the one before it is close enough to collide.
    let lastMarkX = -999;
    let markRow = 0;
    for (const mk of marks) {
      const mx = X(mk.m);
      markRow = mx - lastMarkX < mk.label.length * 5.2 + 6 ? (markRow + 1) % 3 : 0;
      lastMarkX = mx;
      g.append(el('line', { x1: f1(mx), y1: f1(Y0), x2: f1(mx), y2: f1(Y0 + ph), stroke: INK.coral, 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
      g.append(text(mx + 2, Y0 + 8 + markRow * 11, mk.label, { 'font-size': 8.6, style: `fill:${INK.coral}`, 'font-weight': 600 }));
    }
    const line = (key, colour, dash) => {
      let d = '';
      for (let i = 0; i < trace.length; i += 1) d += `${i ? 'L' : 'M'}${f1(X(trace[i].m))} ${f1(Y(trace[i][key]))}`;
      // The present moment, so a stopped figure still shows where it is rather than a single dot.
      d += `L${f1(X(cellSeconds / 60))} ${f1(Y(key === 'v' ? potential() : nernstK()))}`;
      g.append(el('path', { d, fill: 'none', stroke: colour, 'stroke-width': key === 'v' ? 2.2 : 1.4, 'stroke-dasharray': dash, 'stroke-linejoin': 'round' }));
    };
    // The gap between the two: what the small sodium leak costs, which is exactly why §4.7 says a real
    // nerve cell rests nearer −70 mV than potassium's own −95. It is also what fills a plot that has not
    // been run yet, with the one thing the plot is about rather than with decoration.
    const gapTop = Math.min(Y(potential()), Y(nernstK()));
    const gapBot = Math.max(Y(potential()), Y(nernstK()));
    if (gapBot - gapTop > 3) {
      g.append(el('rect', { x: f1(X0 + 1), y: f1(gapTop), width: f1(Math.max(1, pw - 2)), height: f1(gapBot - gapTop), fill: tint(C.water, 12) }));
      if (gapBot - gapTop > 22) {
        // In --ink-soft rather than the notes' --ink-faint, because it is set on the band and names it:
        // --ink-faint on the 12% water was 4.39:1 light and 4.30:1 dark (npm run legible, 2026-09-23),
        // --ink-soft is 5.92:1 and 5.48:1, and a paler band would lose the one thing the plot is about.
        g.append(text(X0 + pw / 2, f1((gapTop + gapBot) / 2 + 3), `the sodium leak's ${Math.abs(potential() - nernstK()).toFixed(0)} mV`, { anchor: 'middle', 'font-size': 9, style: `fill:${C.soft}` }));
      }
    }
    // Where it stands now, straight across, so a figure that has not been run yet still shows its state
    // and the two lines have something to be read against.
    g.append(el('line', { x1: f1(X0), y1: f1(Y(potential())), x2: f1(X0 + pw), y2: f1(Y(potential())), stroke: INK.water, 'stroke-width': 1, 'stroke-dasharray': '1 4' }));
    g.append(text(X0 + pw, f1(Y(potential()) - 4), `${potential().toFixed(1)} mV now`, { anchor: 'end', 'font-size': 9, style: `fill:${INK.water}`, 'font-weight': 600 }));
    g.append(el('line', { x1: f1(X0), y1: f1(Y(nernstK())), x2: f1(X0 + pw), y2: f1(Y(nernstK())), stroke: C.soft, 'stroke-width': 1, 'stroke-dasharray': '1 4' }));
    line('n', C.soft, '4 3');
    line('v', INK.water, null);
    g.append(el('circle', { cx: f1(X(cellSeconds / 60)), cy: f1(Y(potential())), r: 3, fill: INK.water, stroke: C.paper, 'stroke-width': 1.2 }));
    const legendY = Y0 + ph + 14;
    g.append(text(X0, legendY, 'measured', { 'font-size': 9, style: `fill:${INK.water}`, 'font-weight': 600 }));
    g.append(text(X0 + 58, legendY, 'predicted for K⁺', { 'font-size': 9, class: 'mol-rt-note' }));
    svg.append(g);
  }

  // ---------------------------------------------------------------- the readouts

  function barRows() {
    if (scene === 'heart-cell') {
      return [
        { head: 'The cell' },
        { bar: ['Na⁺ outside', NA_OUT, 200, `${Math.round(NA_OUT)}`] },
        { bar: ['Na⁺ inside', naIn, 200, naIn.toFixed(1)] },
        { bar: ['Ca²⁺ inside', caIn, 1200, `${Math.round(caIn)} nmol/L`] },
        { bar: ['Contraction', contraction(), 2, `${contraction().toFixed(2)} ×`] },
      ];
    }
    return [
      { head: 'Sodium, mmol/L' },
      // The key carries the species on a phone: the narrow layout drops the two subheads, and without
      // them five bars at two different scales sat in one block saying only "Outside, Inside, Lumen".
      { bar: [narrow ? 'Na⁺ outside' : 'Outside', NA_OUT, 200, `${Math.round(NA_OUT)}`] },
      { bar: [narrow ? 'Na⁺ inside' : 'Inside', naIn, 200, naIn.toFixed(1)] },
      { head: 'Glucose, mmol/L' },
      { bar: [narrow ? 'Glucose lumen' : 'Lumen', gLumen, 20, gLumen.toFixed(2)] },
      { bar: [narrow ? 'Glucose cell' : 'Cell', gCell, 20, gCell.toFixed(2)] },
      { bar: [narrow ? 'Glucose blood' : 'Blood', gBlood, 20, gBlood.toFixed(2)] },
    ];
  }

  // A bar is a mark, not a container: the name beside it, the figure at the end of it, and nothing
  // written over the fill.
  function drawBars(x, y, w, rows, size, rowHWanted = 0) {
    const g = el('g');
    const rowH = rowHWanted || size * 2.2;
    // Room for the longest key at this size ('Glucose lumen' is thirteen characters), so a label never
    // runs into the bar beside it.
    const keyW = Math.max(size * 7.4, 68);
    const valW = Math.max(size * 4.4, 44);
    const barW = Math.max(12, w - keyW - valW - 8);
    let cy = y;
    for (const r of rows) {
      if (r.head) {
        cy += cy > y ? size * 1.9 : size + 3;
        g.append(text(x, f1(cy), r.head, { class: 'mol-rt-head', 'font-size': f1(size - 1.2) }));
        cy += 4;
        g.append(el('line', { x1: f1(x), y1: f1(cy), x2: f1(x + w), y2: f1(cy), stroke: C.ruleStrong }));
        continue;
      }
      const [key, v, max, label] = r.bar;
      cy += rowH;
      g.append(text(x, f1(cy), key, { class: 'gb-key', 'font-size': f1(size) }));
      g.append(text(f1(x + w), f1(cy), label, { anchor: 'end', class: 'gb-val', 'font-size': f1(size) }));
      const bh = Math.max(3.2, size * 0.4);
      g.append(el('line', { x1: f1(x + keyW), y1: f1(cy + 3.2), x2: f1(x + keyW + barW), y2: f1(cy + 3.2), stroke: C.rule }));
      g.append(el('rect', { x: f1(x + keyW), y: f1(cy + 3.2 - bh), width: f1(Math.max(0.6, (clamp(v, 0, max) / max) * barW)), height: f1(bh), fill: C.leaf }));
    }
    svg.append(g);
    return cy + size;
  }

  function energyRows() {
    const chem = naChemical();
    const elec = naElectrical();
    return [
      ['Concentration term', `${chem.toFixed(1)} kJ/mol`],
      ['Electrical term', `${elec.toFixed(1)} kJ/mol`],
      ['One mole of Na⁺ in', `${(chem + elec).toFixed(1)} kJ/mol`],
      ['Three, as the pump moves', `${(3 * (chem + elec)).toFixed(1)} kJ/mol`],
      ['One mole of ATP', `${ATP_KJ} kJ/mol`],
    ];
  }

  function stateRows() {
    if (scene === 'heart-cell') {
      return [
        ['Calcium inside', `${Math.round(caIn)} nmol/L`],
        ['Contraction', `${contraction().toFixed(2)} ×`],
        ['Minutes', (cellSeconds / 60).toFixed(1)],
        ];
    }
    return [
      ['Measured', `${potential().toFixed(1)} mV`],
      ['Predicted for K⁺', `${nernstK().toFixed(1)} mV`],
      ['Glucose, cell / lumen', `${glucoseRatio().toFixed(2)} ×`],
      ['Minutes', (cellSeconds / 60).toFixed(1)],
    ];
  }

  // The sentence each scene closes its table with, broken to the column it is set in.
  function stateNote(width, size) {
    const str = scene === 'heart-cell'
      ? (digoxin ? 'Digoxin is on the pump. Sodium inside is rising, so the antiporter has less to spend and calcium stays in.' : 'The antiporter spends the sodium gradient to keep calcium out.')
      : (symporterDeltaG() < 0 ? 'The symporter is running forwards: sodium falling in pays for glucose climbing.' : 'The symporter has stopped. The sodium gradient no longer pays for the climb.');
    return notes(str, width, size);
  }

  // ---------------------------------------------------------------- layout

  let ready = false;
  function draw() {
    const r = pane.getBoundingClientRect();
    const w = Math.max(60, Math.round(r.width));
    const hgt = Math.max(60, Math.round(r.height));
    svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    svg.replaceChildren();
    if (narrow) drawNarrow(w, hgt); else drawWide(w, hgt);
    svg.append(focusBrackets(w, hgt));
  }

  function drawWide(w, hgt) {
    const colGap = 18;
    const cellW = Math.round(w * 0.35);
    const midW = Math.round(w * 0.29);
    const rightW = w - cellW - midW - colGap * 2;
    const midX = cellW + colGap;
    const rightX = midX + midW + colGap;
    if (scene === 'gut-cell') drawCell(0, 0, cellW, hgt); else drawHeartCell(0, 0, cellW, hgt);

    // The middle column carries every number: the bars, where it stands, and the energy. It is sized so
    // the three fill it between them rather than one of them ending half way down.
    const size = 10.2;
    const bars = barRows();
    const nBars = bars.filter((r) => r.bar).length;
    const nHeads = bars.filter((r) => r.head).length;
    const barsTarget = hgt * 0.4;
    const barRowH = clamp((barsTarget - nHeads * size * 2.1) / Math.max(1, nBars), size * 2.2, size * 3.4);
    const after = drawBars(midX, 4, midW, bars, size, barRowH);
    const rows = [...stateRows(), ...stateNote(midW, size)];
    const erows = [...energyRows(), ...notes('The pump spends one ATP to store about three sodium ions’ worth. Little margin — and steeper, it runs backwards.', midW, size)];
    const room = Math.max(60, hgt - after - 10);
    const share = room * (rows.length + 1.4) / (rows.length + erows.length + 2.8);
    const { rowH } = fitRows(rows, share - 6, { size, title: 'x' }, 13, 24);
    readoutTable(svg, rows, { x: midX, y: after + 6, width: midW, rowH, size, title: scene === 'gut-cell' ? 'Where it stands' : 'The heart' });
    const { rowH: erh } = fitRows(erows, room - share - 6, { size, title: 'x' }, 13, 24);
    readoutTable(svg, erows, { x: midX, y: after + 6 + share, width: midW, rowH: erh, size, title: 'Energy' });

    // The trace takes the whole of the right column: it is the evidence §4.7 turns on.
    drawTrace(rightX, 0, rightW, hgt);
  }

  // The phone composition, budgeted before anything is drawn. The cell keeps the top, the trace keeps
  // FULL width because it is what shows the delay after the pump is blocked, and the bars and the
  // readings follow in one column. Four of the desktop column's rows are dropped rather than shrunk —
  // the minutes, the ATP line and the two energy terms — because five bars and eleven rows at a legible
  // size do not fit under a drawing and a trace, and a row set at eight pixels is not a row.
  function drawNarrow(w, hgt) {
    const rows = scene === 'heart-cell'
      ? [['Measured', `${potential().toFixed(1)} mV`], ['One mole of Na⁺ in', `${naEnergy().toFixed(1)} kJ/mol`], ['Minutes', (cellSeconds / 60).toFixed(1)]]
      : [['Measured', `${potential().toFixed(1)} mV`], ['Predicted for K⁺', `${nernstK().toFixed(1)} mV`], ['Glucose, cell / lumen', `${glucoseRatio().toFixed(2)} ×`], ['One mole of Na⁺ in', `${naEnergy().toFixed(1)} kJ/mol`]];
    const bars = barRows().filter((r) => r.bar);
    const size = 9.6;
    // Budgeted from the bottom up: the table and the bars take exactly the room their rows need at a
    // legible height, the trace takes its fifth, and the cell drawing takes what is left. Budgeted from
    // the top down by fractions, the table's last row was drawn under the toolbar.
    const tableRowH = 12.5;
    const tableH = rows.length * tableRowH + 3;
    const barRowH = 12;
    const barsH = bars.length * barRowH + 4;
    const traceH = clamp(hgt * 0.19, 54, 82);
    const cellH = Math.max(80, hgt - tableH - barsH - traceH - 14);
    if (scene === 'gut-cell') drawCell(0, 0, w, cellH); else drawHeartCell(0, 0, w, cellH);
    // The trace keeps FULL width: it is what shows the delay after the pump is blocked.
    drawTrace(0, cellH + 2, w, traceH);
    drawBars(0, cellH + traceH + 8, w, bars, size, barRowH);
    readoutTable(svg, rows, { x: 0, y: hgt - tableH, width: w, rowH: tableRowH, size });
  }

  function focusBrackets(w, hgt) {
    const len = Math.max(9, Math.min(20, w * 0.06, hgt * 0.16));
    const a = 2;
    const x1 = w - 2;
    const y1 = hgt - 2;
    const d = [
      `M${a} ${f1(a + len)} L${a} ${a} L${f1(a + len)} ${a}`,
      `M${f1(x1 - len)} ${a} L${f1(x1)} ${a} L${f1(x1)} ${f1(a + len)}`,
      `M${f1(x1)} ${f1(y1 - len)} L${f1(x1)} ${f1(y1)} L${f1(x1 - len)} ${f1(y1)}`,
      `M${f1(a + len)} ${f1(y1)} L${a} ${f1(y1)} L${a} ${f1(y1 - len)}`,
    ].join(' ');
    return el('path', { d, class: 'mol-focus', fill: 'none', stroke: C.water, 'stroke-width': 2.2, 'stroke-linecap': 'square' });
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < 700 || hgt < 330;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 18;
    if (pad > 18 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--gb-pad', `${pad}px`);
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
  trace = [{ m: 0, v: potential(), n: nernstK() }];
  onResize();
  void ns;

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      svg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    // Nothing advances on its own: the cell moves only while Run is on, and `setRunning` will not turn
    // Run on while the clock is pinned, so pinning the clock redraws and keeps redrawing the same frame.
    setTime() {
      if (!destroyed && ready) draw();
    },
    setVisible(v) {
      if (!v && raf) { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; } else if (v && running) kick();
    },
    setTheme() {
      if (!destroyed && ready) draw();
    },
    describe() {
      const chem = naChemical();
      const elec = naElectrical();
      return {
        scene,
        pumpRunning,
        leakChannelsOpen: leakOpen,
        naInsideMM: round(naIn, 2),
        naOutsideMM: NA_OUT,
        kInsideMM: round(kIn, 2),
        kOutsideMM: kOut,
        potentialMv: round(potential(), 2),
        nernstKMv: round(nernstK(), 2),
        glucoseLumenMM: round(gLumen, 3),
        glucoseCellMM: round(gCell, 3),
        glucoseBloodMM: gBlood,
        glucoseRatio: round(glucoseRatio(), 3),
        symporterActive: symporter,
        tightJunction,
        naEnergyKjPerMol: round(chem + elec, 2),
        naChemicalKj: round(chem, 2),
        naElectricalKj: round(elec, 2),
        atpKjPerMol: ATP_KJ,
        blocked: blockedList(),
        calciumInsideNm: round(caIn, 1),
        contractionStrength: round(contraction(), 3),
        running,
        cellMinutes: round(cellSeconds / 60, 2),
        layout: narrow ? 'narrow' : 'wide',
        t: round(cellSeconds / CELL_SECONDS_PER_WATCHED, 3),
      };
    },
  };
}
