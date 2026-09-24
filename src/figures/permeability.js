// One species at a time, against a bare bilayer. A sheet of lipid seen edge-on with water on both sides,
// and a stream of one chosen substance arriving at it. Almost every arrival bounces. The rare crossing is
// drawn, and the counter of refusals beside it is the figure: a reader who has watched a sodium ion
// turned away four thousand times has learned something 10⁻¹² cm s⁻¹ cannot teach.
//
// THE NUMBERS ARE THE CHAPTER'S. The permeability coefficients are Section 4.3's own table, for a
// synthetic bilayer with no protein in it, and each species carries the obstacle that table names.
// Flux is Fick's law, J = P·A·ΔC, with the coefficient scaled by the reference thickness over the
// thickness the reader has set, so the thickness and area sliders are the law rather than a decoration.
// For an ion the electrical term is real too: the chance of a crossing is multiplied by exp(∓zFΔV/2RT),
// a symmetric barrier, which means the tank settles at the Nernst ratio without that equation being
// anywhere in this file — set −70 mV and a monovalent cation ends up thirteen times more concentrated
// inside, which is what −70 mV means.
//
// WHAT IS COMPRESSED, AND WHY. The drawn chance of crossing is not the real one. At the real ratio
// oxygen would cross on every arrival and a sodium ion would need a hundred thousand million arrivals
// for one, and the figure would be a still picture of a queue. So the drawn chance is the coefficient
// raised to 1/3.45: twelve orders of magnitude become three and a half, one arrival in one for oxygen
// down to one in about three thousand for sodium. The ORDER is exact and is felt as waiting; the true
// number is on the bar and in the readout, which are not compressed. The counters count what is drawn,
// and the readout says so.
//
// Two compositions, and the narrow one is a different arrangement rather than a smaller copy:
//   wide   — the nine species as a typographic list down the left, which is Section 4.3's table and the
//            control at once; the membrane in the middle; the log flux bar down the right; the reading
//            under the membrane.
//   narrow — the species become one scrolling row above the membrane, the bar stays vertical at the
//            right of it where its decade marks stay legible, the reading goes underneath, and the two
//            Fick sliders are dropped rather than shrunk, because a nine-item list, three sliders and a
//            decade bar cannot share a 390 px stage without the type going under nine device pixels.
//            The reading says they have gone, and at what width they come back.
//
// Every frame is a function of the clock and the reader's actions: the walk advances in fixed steps of
// 1/60 s from a seed, so setTime(t) reproduces a frame exactly. describe() is documented at the bottom.
import { el, h, text, C, tint, uid, clamp } from './lib/svg.js';
import { readoutCss, readoutTable, readoutHeight, fitRows, focusMark, round, mulberry32, atom, bond, superscript, INK } from './lib/mol-draw.js';
import { membranePart } from '../palette.js';

export const meta = { kind: 'permeability', title: 'One species at a time, against a bare bilayer', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

// ---------------------------------------------------------------- the species
//
// `p` is the permeability coefficient of a bare synthetic bilayer in cm/s, from the table in §4.3.
// `barrier` is the one word that table's third column comes to, and `stops` is that column's sentence.
// `r` is the drawn radius in stage units, from the ionic radius for an ion and from the molecule's own
// size for the rest, so two ions of one colour are still told apart by how big they are.

const SPECIES = [
  { id: 'oxygen', name: 'Oxygen', formula: 'O₂', p: 1, barrier: 'none', stops: 'nothing: it dissolves straight into the oily core', shell: false, z: 0, r: 7.0, draw: 'O2' },
  { id: 'carbon-dioxide', name: 'Carbon dioxide', formula: 'CO₂', p: 1, barrier: 'none', stops: 'nothing: it dissolves straight into the oily core', shell: false, z: 0, r: 8.4, draw: 'CO2' },
  { id: 'water', name: 'Water', formula: 'H₂O', p: 1e-3, barrier: 'polarity', stops: 'its polarity — but it is tiny, uncharged, and there is a great deal of it', shell: false, z: 0, r: 6.6, draw: 'H2O' },
  { id: 'urea', name: 'Urea', formula: 'CH₄N₂O', p: 1e-6, barrier: 'size', stops: 'its polarity, and now its size as well', shell: false, z: 0, r: 9.0, draw: 'urea' },
  { id: 'glycerol', name: 'Glycerol', formula: 'C₃H₈O₃', p: 1e-6, barrier: 'size', stops: 'three hydroxyls to strip of water, and a larger body to push through', shell: false, z: 0, r: 9.6, draw: 'glycerol' },
  { id: 'glucose', name: 'Glucose', formula: 'C₆H₁₂O₆', p: 1e-7, barrier: 'size', stops: 'size and polarity together; published values for it disagree by orders of magnitude', shell: false, z: 0, r: 11.0, draw: 'glucose' },
  { id: 'chloride', name: 'Chloride', formula: 'Cl⁻', p: 1e-11, barrier: 'charge', stops: 'its charge, and the shell of water holding on to it', shell: true, z: -1, ion: 'Cl', r: 8.6, draw: 'ion' },
  { id: 'potassium', name: 'Potassium', formula: 'K⁺', p: 1e-12, barrier: 'charge', stops: 'its charge, and a shell of water it cannot take into the grease', shell: true, z: 1, ion: 'K', r: 7.4, draw: 'ion' },
  { id: 'sodium', name: 'Sodium', formula: 'Na⁺', p: 1e-12, barrier: 'charge', stops: 'its charge, and the tightest grip of all on its water', shell: true, z: 1, ion: 'Na', r: 6.2, draw: 'ion' },
];
const BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

// ---------------------------------------------------------------- the model

const RT = 8.314 * 310.15 / 1000; // kJ/mol at 37 °C
const F_KJ = 96.485 / 1000; // Faraday's constant, kJ per mol per mV
const AVOGADRO = 6.02214076e23;
const REF_NM = 4; // the oily core of a bare bilayer, the thickness P was measured across
const COMPRESS = 3.45; // see the header: twelve orders of magnitude drawn as three and a half
const CHANNEL_GAIN = 1e6; // what one channel does to a coefficient, capped at free diffusion
const PARTICLES = 30;
const STEP = 1 / 60;
const MAX_STEPS_PER_CALL = 2400;

const MIN_MM = 0;
const MAX_MM = 300;
const MIN_MV = -120;
const MAX_MV = 60;
const MIN_NM = 2;
const MAX_NM = 10;
const MIN_AREA = 0.25;
const MAX_AREA = 4;

// What the figure opens with. Both the opening state and reset() read this one object, so "Reset" and
// "as it mounted" cannot drift apart. They had: Reset cleared the counters and re-seeded the tank and
// left the species, both concentrations, the voltage, the two Fick sliders and any dropped-in channel
// exactly where the reader had put them, so a reader who had walked the bath up to 300 mmol/L pressed
// Reset and went on measuring 300.
const OPENING = { species: 'sodium', insideMM: 12, outsideMM: 145, voltageMv: -70, thicknessNm: REF_NM, areaUm2: 1, channel: false };

const NARROW_W = 640;
const NARROW_H = 340;
const DROP_FICK_W = 800; // below this the two Fick sliders go, and the reading says they have

// The coefficient this species actually has here: Fick's thin-barrier scaling, and a channel if one has
// been dropped in. A channel cannot make anything faster than a gas that simply dissolves through, so
// the gain is capped at 1 cm/s.
function coefficient(sp, thicknessNm, channel) {
  const base = sp.p * (REF_NM / thicknessNm);
  return channel ? Math.min(1, base * CHANNEL_GAIN) : base;
}

// Molecules per second across the patch. P in cm/s, area in µm², concentrations in mmol/L.
// 1 µm² = 1e-8 cm², 1 mmol/L = 1e-6 mol/cm³, so J = 6.022e9 · P · A · ΔC molecules per second.
function fluxPerSecond(pCmS, areaUm2, deltaMM) {
  return Math.abs(pCmS * areaUm2 * deltaMM * 1e-14 * AVOGADRO);
}

const drawnChance = (pCmS) => clamp(10 ** (Math.log10(Math.max(1e-16, pCmS)) / COMPRESS), 1e-5, 1);

// 10^-12 written the way a table writes it.
function power10(p) {
  const e = Math.round(Math.log10(p));
  return e === 0 ? '1' : `10${superscript(String(e))}`;
}

function formatFlux(v) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(v));
  const m = v / 10 ** e;
  if (e >= -1 && e <= 4) return v >= 100 ? String(Math.round(v)) : v.toFixed(Math.max(0, 2 - e));
  return `${m.toFixed(1)}×10${superscript(String(e))}`;
}

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-perm')}
.tb-perm { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 22fr) minmax(0, 64fr) minmax(0, 14fr);
  grid-template-rows: minmax(0, 1fr) var(--pm-read-h, 96px);
  padding: 0.35rem 0.5rem var(--pm-pad, 3rem); column-gap: var(--space-3); row-gap: var(--space-2);
  font-family: var(--font-ui); }
.tb-perm .pm-pane { position: relative; min-width: 0; min-height: 0; }
.tb-perm .pm-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-perm .pm-list { grid-column: 1; grid-row: 1; display: flex; flex-direction: column;
  min-width: 0; min-height: 0; overflow: hidden; }
.tb-perm .pm-scene { grid-column: 2; grid-row: 1; }
.tb-perm .pm-bar { grid-column: 3; grid-row: 1; }
/* The reading runs the whole width under all three, and is set as two columns of a table rather than
   one: eight rows in one column took a third of the stage and left the membrane a strip. */
.tb-perm .pm-read { grid-column: 1 / 4; grid-row: 2; }
.tb-perm svg text { font-family: var(--font-ui); }
.tb-perm .pm-side { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.06em;
  stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round; paint-order: stroke; }
.tb-perm .pm-tick { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-perm .pm-now { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
/* The one word drawn over the membrane carries the paper with it rather than a box. */
.tb-perm .pm-over { fill: var(--ink-soft); font-weight: 600; stroke: var(--paper); stroke-width: 3px;
  stroke-linejoin: round; paint-order: stroke; }
/* The species list is a table, not a menu: a name, its coefficient set in tabular figures at the right,
   a hairline between rows, and the one in hand told by the weight of its ink and a head rule on its own
   edge. No fill, no pill, no box. */
.tb-perm .pm-head { font-size: 9.2px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-faint); padding-bottom: 0.2rem; border-bottom: 1px solid var(--rule-strong); }
.tb-perm .pm-item { display: flex; justify-content: space-between; align-items: baseline; gap: 0.4rem;
  width: 100%; flex: 1 1 0; min-height: 0; appearance: none; background: none; border: 0;
  border-bottom: 1px solid var(--rule); border-left: 2px solid transparent;
  padding: 0 0.3rem 0 0.35rem; margin: 0; cursor: pointer; text-align: left;
  font-family: var(--font-ui); font-size: 11.4px; color: var(--ink-soft); }
.tb-perm .pm-item .pm-p { font-variant-numeric: lining-nums tabular-nums; color: var(--ink-faint); }
.tb-perm .pm-item[aria-pressed="true"] { color: var(--ink); font-weight: 600;
  border-left-color: var(--rule-head); }
.tb-perm .pm-item[aria-pressed="true"] .pm-p { color: var(--ink); }
.tb-perm .pm-item:hover { color: var(--ink); }
.tb-perm .fig-toolbar { justify-content: flex-start; }
.tb-perm .pm-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-perm .pm-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
.tb-perm .pm-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-perm .pm-slider { display: flex; align-items: center; gap: var(--space-1); color: var(--ink-soft);
}
.tb-perm .pm-slider input { width: 4.6rem; }
.tb-perm .pm-slider b { font-weight: 600; font-variant-numeric: lining-nums tabular-nums;
  min-width: 4.1rem; color: var(--ink); }
/* ---- the phone arrangement ---- */
.tb-perm.is-narrow { grid-template-columns: minmax(0, 1fr) var(--pm-bar-w, 60px);
  grid-template-rows: var(--pm-list-h, 30px) minmax(0, 1fr) var(--pm-read-h, 96px);
  column-gap: var(--space-2); }
.tb-perm.is-narrow .pm-list { grid-column: 1 / 3; grid-row: 1; flex-direction: row; overflow-x: auto;
  overflow-y: hidden; gap: 0.25rem; scrollbar-width: none; }
.tb-perm.is-narrow .pm-list::-webkit-scrollbar { display: none; }
.tb-perm.is-narrow .pm-head { display: none; }
.tb-perm.is-narrow .pm-item { flex: 0 0 auto; width: auto; border: 1px solid var(--rule-strong);
  border-radius: 999px; padding: 0.16rem 0.5rem; font-size: 0.68rem; color: var(--ink);
  background: color-mix(in srgb, var(--paper) 86%, transparent); }
.tb-perm.is-narrow .pm-item[aria-pressed="true"] { background: var(--leaf-text); color: var(--paper);
  border-color: var(--leaf-text); }
.tb-perm.is-narrow .pm-item .pm-p { display: none; }
.tb-perm.is-narrow .pm-scene { grid-column: 1; grid-row: 2; }
.tb-perm.is-narrow .pm-bar { grid-column: 2; grid-row: 2; }
.tb-perm.is-narrow .pm-read { grid-column: 1 / 3; grid-row: 3; }
.tb-perm.is-narrow .fig-toolbar { gap: 0.22rem; left: var(--space-2); right: var(--space-2);
  bottom: var(--space-2); }
.tb-perm.is-narrow .pm-group { gap: 0.22rem; }
.tb-perm.is-narrow .pm-sep { display: none; }
.tb-perm.is-narrow .fig-btn { padding: 0.18rem 0.38rem; font-size: 0.68rem; }
.tb-perm.is-narrow .pm-slider { font-size: 0.68rem; gap: 0.15rem; }
.tb-perm.is-narrow .pm-slider input { width: 3.2rem; }
.tb-perm.is-narrow .pm-slider b { min-width: 3.4rem; }
`;

const fmt = (v, dp = 1) => v.toFixed(dp);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('pm');
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let readPx = 0;
  let listPx = 0;
  let ready = false;

  const CHANNEL_C = membranePart('channel').color;
  const HEAD_C = membranePart('lipidHead').color;
  const TAIL_C = membranePart('lipidTail').color;
  const GLUCOSE_C = membranePart('glucose').color;

  // ---- state ----
  let speciesId = OPENING.species;
  let insideMM = OPENING.insideMM;
  let outsideMM = OPENING.outsideMM;
  let voltageMv = OPENING.voltageMv;
  let thicknessNm = OPENING.thicknessNm;
  let areaUm2 = OPENING.areaUm2;
  let channel = OPENING.channel;
  let t = ctx.pinnedTime ?? 0;
  let playing = false;
  let steps = 0;
  let seed = 5;
  let rand = mulberry32(seed);
  let crossingsIn = 0;
  let crossingsOut = 0;
  let rejections = 0;
  let equilibrium = false;
  let parts = [];

  const sp = () => BY_ID[speciesId];

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-perm' });
  wrap.append(h('style', { text: CSS }));
  const sceneSvg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'A bilayer seen edge-on, outside above and inside below, with the chosen substance arriving at it. Space runs and pauses the arrivals, up and down arrows step through the nine substances, C drops a channel in, Home puts every control back where it opened.',
  });
  const barSvg = el('svg', { 'aria-hidden': 'true' });
  const readSvg = el('svg', { 'aria-hidden': 'true' });
  const scenePane = h('div', { class: 'pm-pane pm-scene' }, [sceneSvg]);
  const barPane = h('div', { class: 'pm-pane pm-bar' }, [barSvg]);
  const readPane = h('div', { class: 'pm-pane pm-read' }, [readSvg]);

  const listHead = h('div', { class: 'pm-head', text: 'Substance · cm s⁻¹' });
  const items = SPECIES.map((s) => {
    const node = h('button', {
      class: 'pm-item', type: 'button', 'aria-pressed': String(s.id === speciesId),
      'aria-label': `${s.name}, permeability ${power10(s.p)} centimetres per second`,
    }, [h('span', { text: s.name }), h('span', { class: 'pm-p', text: power10(s.p) })]);
    node.addEventListener('click', () => setSpecies(s.id));
    return node;
  });
  const listPane = h('div', { class: 'pm-list' }, [listHead, ...items]);

  const button = (label, aria, onClick, attrs = {}) => {
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': aria, text: label, ...attrs });
    node.addEventListener('click', onClick);
    return node;
  };

  const slider = (label, min, max, step, value, unit, onInput, format) => {
    const input = h('input', { type: 'range', class: 'fig-range', min: String(min), max: String(max), step: String(step), value: String(value), 'aria-label': `${label}, ${min} to ${max} ${unit}` });
    const read = h('b', { text: format(value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      read.textContent = format(v);
      onInput(v);
    });
    const node = h('label', { class: 'pm-slider fig-ui' }, [h('span', { text: label }), input, read]);
    return { node, input, read, set: (v) => { input.value = String(v); read.textContent = format(v); } };
  };

  const mmFmt = (v) => `${Math.round(v)} mmol/L`;
  const outSlider = slider('Outside', MIN_MM, MAX_MM, 1, outsideMM, 'millimolar', (v) => { outsideMM = v; concentrationsChanged(); }, mmFmt);
  const inSlider = slider('Inside', MIN_MM, MAX_MM, 1, insideMM, 'millimolar', (v) => { insideMM = v; concentrationsChanged(); }, mmFmt);
  const mvSlider = slider('Voltage', MIN_MV, MAX_MV, 1, voltageMv, 'millivolts', (v) => { voltageMv = v; onSettingChanged(); }, (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))} mV`);
  const nmSlider = slider('Thickness', MIN_NM, MAX_NM, 0.5, thicknessNm, 'nanometres', (v) => { thicknessNm = v; onSettingChanged(); }, (v) => `${fmt(v, 1)} nm`);
  const areaSlider = slider('Area', MIN_AREA, MAX_AREA, 0.25, areaUm2, 'square micrometres', (v) => { areaUm2 = v; onSettingChanged(); }, (v) => `${fmt(v, 2)} µm²`);

  const btnRun = button('Run', 'Run, let the arrivals start', () => setPlaying(!playing), { class: 'fig-btn pm-primary' });
  const btnChannel = button('Channel', 'Channel, drop a channel for this substance into the membrane', () => setChannel(!channel), { 'aria-pressed': String(channel) });
  const btnEqual = button('Equalise', 'Equalise, set both sides to the same concentration', () => equalise());
  const btnReset = button('Reset', 'Reset, put every control back where it opened and start again', () => reset());

  const group = (kids) => h('div', { class: 'pm-group' }, kids);
  const sep = () => h('span', { class: 'pm-sep', 'aria-hidden': 'true' });
  const fickGroup = group([nmSlider.node, areaSlider.node]);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([outSlider.node, inSlider.node, mvSlider.node]),
    sep(),
    fickGroup,
    sep(),
    group([btnChannel, btnEqual, btnRun, btnReset]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(listPane, scenePane, barPane, readPane, toolbar, live);
  root.append(wrap);

  // ---------------------------------------------------------------- the model, in motion

  // Each drawn particle stands for the same slice of concentration, so a crossing moves that slice from
  // one side to the other and the two readings are the two populations. `unit` is that slice.
  function unitMM() {
    return Math.max(0.2, (insideMM + outsideMM) / PARTICLES);
  }

  function seedParticles() {
    parts = [];
    const total = insideMM + outsideMM;
    const nOut = total <= 0 ? Math.round(PARTICLES / 2) : Math.round((outsideMM / total) * PARTICLES);
    for (let i = 0; i < PARTICLES; i += 1) {
      const out = i < nOut;
      parts.push({
        x: rand(),
        y: out ? 0.06 + rand() * 0.34 : 0.60 + rand() * 0.34,
        vx: (rand() - 0.5) * 0.6,
        vy: (rand() - 0.5) * 0.6 + (out ? 0.24 : -0.24),
        out,
        shell: true,
        bounce: 0,
      });
    }
  }

  // The chance a crossing in this direction is accepted, drawn. The concentration part is already in the
  // arrival rate — a side with more of the substance sends more of it at the membrane — so what is left
  // is the electrical half-barrier, exp(∓zFΔV/2RT), which is what makes an ion settle at its Nernst
  // ratio rather than at equal concentrations.
  function acceptance(inward) {
    const s = sp();
    const base = drawnChance(coefficient(s, thicknessNm, channel));
    if (!s.z) return base;
    const g = (s.z * F_KJ * voltageMv) / (2 * RT);
    return clamp(base * Math.exp(inward ? -g : g), 0, 1);
  }

  function advanceOneStep() {
    const u = unitMM();
    for (const p of parts) {
      const wasOut = p.out;
      p.x += p.vx * STEP;
      p.y += p.vy * STEP;
      if (p.x < 0) p.x += 1;
      if (p.x > 1) p.x -= 1;
      // A little jitter, seeded, so the queue is a crowd and not a rank.
      p.vx += (rand() - 0.5) * 0.14;
      p.vy += (rand() - 0.5) * 0.14;
      p.vx = clamp(p.vx, -0.8, 0.8);
      p.vy = clamp(p.vy, -0.8, 0.8);
      if (p.y < 0.03) { p.y = 0.03; p.vy = Math.abs(p.vy); }
      if (p.y > 0.97) { p.y = 0.97; p.vy = -Math.abs(p.vy); }
      // The membrane occupies 0.44 to 0.56. An arrival is a particle that has reached its face.
      const face = wasOut ? MEM_TOP : MEM_BOT;
      const reached = wasOut ? p.y >= face : p.y <= face;
      if (!reached) { p.shell = true; continue; }
      const inward = wasOut;
      if (rand() < acceptance(inward)) {
        p.out = !wasOut;
        p.y = wasOut ? MEM_BOT + 0.02 : MEM_TOP - 0.02;
        p.vy = wasOut ? 0.3 : -0.3;
        p.shell = true;
        if (inward) { crossingsIn += 1; insideMM = clamp(insideMM + u, 0, MAX_MM); outsideMM = clamp(outsideMM - u, 0, MAX_MM); }
        else { crossingsOut += 1; outsideMM = clamp(outsideMM + u, 0, MAX_MM); insideMM = clamp(insideMM - u, 0, MAX_MM); }
        syncSliders();
      } else {
        // Turned back at the mouth, with its water put straight back on — which for an ion is the
        // whole explanation, and is why the shell is drawn stripped only at the face.
        p.y = wasOut ? face - 0.012 : face + 0.012;
        p.vy = wasOut ? -Math.abs(p.vy) : Math.abs(p.vy);
        p.shell = true;
        p.bounce = steps;
        rejections += 1;
      }
    }
    steps += 1;
  }

  function syncSliders() {
    outSlider.set(Math.round(outsideMM));
    inSlider.set(Math.round(insideMM));
  }

  function advanceTo(target, budgetMs = 3000) {
    const next = Math.max(0, Number(target) || 0);
    const want = Math.floor(next / STEP);
    if (want < steps) restart(false);
    const until = performance.now() + budgetMs;
    const limit = Math.min(want, steps + MAX_STEPS_PER_CALL);
    while (steps < limit) {
      advanceOneStep();
      if (performance.now() > until) break;
    }
    t = steps < want ? steps * STEP : next;
    noteEquilibrium();
  }

  // ---- reader actions ----
  function restart(clearCounters = true) {
    steps = 0;
    rand = mulberry32(seed);
    clearEquilibrium();
    if (clearCounters) {
      crossingsIn = 0;
      crossingsOut = 0;
      rejections = 0;
    }
    t = ctx.pinnedTime ?? 0;
    seedParticles();
  }

  function setSpecies(id) {
    if (speciesId === id) return;
    speciesId = id;
    for (let i = 0; i < SPECIES.length; i += 1) items[i].setAttribute('aria-pressed', String(SPECIES[i].id === speciesId));
    showSelected();
    clearEquilibrium();
    crossingsIn = 0;
    crossingsOut = 0;
    rejections = 0;
    draw();
    announce();
  }

  // On a phone the nine species are one scrolling row, so the one in hand has to be brought into it —
  // otherwise the figure opens on sodium with sodium off the right-hand end and nothing to say so.
  function showSelected() {
    if (!narrow) return;
    const node = items[SPECIES.findIndex((s) => s.id === speciesId)];
    if (!node) return;
    const max = Math.max(0, listPane.scrollWidth - listPane.clientWidth);
    const want = node.offsetLeft - (listPane.clientWidth - node.offsetWidth) / 2;
    listPane.scrollLeft = clamp(want, 0, max);
  }

  function setChannel(next) {
    channel = next;
    clearEquilibrium();
    btnChannel.setAttribute('aria-pressed', String(channel));
    draw();
    announce();
  }

  function equalise() {
    const mean = Math.round((insideMM + outsideMM) / 2);
    insideMM = mean;
    outsideMM = mean;
    syncSliders();
    concentrationsChanged();
  }

  // Reset means "as it mounted": every control back to OPENING, every counter cleared, the tank re-laid.
  // The seed moves on so that pressing Reset twice gives two different runs of the same experiment,
  // which is what makes the rarity of a crossing look like chance rather than like a fixed animation;
  // `seed` is not a state the figure reports.
  function reset() {
    speciesId = OPENING.species;
    insideMM = OPENING.insideMM;
    outsideMM = OPENING.outsideMM;
    voltageMv = OPENING.voltageMv;
    thicknessNm = OPENING.thicknessNm;
    areaUm2 = OPENING.areaUm2;
    channel = OPENING.channel;
    for (let i = 0; i < SPECIES.length; i += 1) items[i].setAttribute('aria-pressed', String(SPECIES[i].id === speciesId));
    btnChannel.setAttribute('aria-pressed', String(channel));
    syncSliders();
    mvSlider.set(voltageMv);
    nmSlider.set(thicknessNm);
    areaSlider.set(areaUm2);
    showSelected();
    seed = (seed + 1) % 100000;
    restart(true);
    setPlaying(false);
    draw();
    announce();
  }

  function onSettingChanged() {
    clearEquilibrium();
    paint();
    announce();
  }

  // A reading and a population are the same thing in this figure — each drawn particle IS a slice of
  // concentration, and `unitMM` is that slice — so a control that moves a reading has to lay the tank
  // out again to match. Without this, Equalise set both readings to 78 mmol/L and left twenty-eight of
  // the thirty particles outside, and the tank then walked the two readings back apart by as much as
  // 174 mmol/L, one crossing at a time, while the reader watched a figure that had just told them the
  // two sides were level. With it the same run holds 79 against 79 and the widest gap over 25 s falls
  // from 174 to 84 mmol/L, which is the tank's own noise. Measured 2026-09-16. The voltage, thickness
  // and area sliders do not do this: they change what the membrane does, not what is on each side.
  function concentrationsChanged() {
    relayoutParticles();
    onSettingChanged();
  }

  // Move only what has to move. A concentration slider fires an input event per step of a drag, and a
  // full seedParticles() there teleports all thirty every time, which is a snowstorm rather than a tank
  // filling. This flips the fewest particles that make the two populations match the two readings and
  // leaves the rest of the crowd exactly where it was, so a drag reads as molecules arriving.
  function relayoutParticles() {
    if (parts.length !== PARTICLES) { seedParticles(); return; }
    const total = insideMM + outsideMM;
    const wantOut = total <= 0 ? Math.round(PARTICLES / 2) : Math.round((outsideMM / total) * PARTICLES);
    let haveOut = parts.filter((p) => p.out).length;
    for (const p of parts) {
      if (haveOut === wantOut) break;
      if (haveOut < wantOut && !p.out) {
        p.out = true; p.y = 0.06 + rand() * 0.34; p.vy = Math.abs(p.vy) || 0.24; p.shell = true; haveOut += 1;
      } else if (haveOut > wantOut && p.out) {
        p.out = false; p.y = 0.60 + rand() * 0.34; p.vy = -(Math.abs(p.vy) || 0.24); p.shell = true; haveOut -= 1;
      }
    }
  }

  function setPlaying(next) {
    playing = next && ctx.pinnedTime === null;
    btnRun.textContent = playing ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-label', playing ? 'Pause, stop the arrivals' : 'Run, let the arrivals start');
    if (playing) tick();
    else paint();
    announce();
  }

  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  function tick() {
    if (raf || destroyed || !playing || !visible) return;
    lastFrame = 0;
    const frame = (now) => {
      raf = 0;
      if (destroyed || !playing || !visible) return;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : STEP;
      lastFrame = now;
      advanceTo(t + dt, 6);
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  const onKey = (e) => {
    const i = SPECIES.findIndex((s) => s.id === speciesId);
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setSpecies(SPECIES[Math.min(SPECIES.length - 1, i + 1)].id); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setSpecies(SPECIES[Math.max(0, i - 1)].id); }
    else if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setChannel(!channel); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
  };
  sceneSvg.addEventListener('keydown', onKey);

  // ---- what describe() reports ----
  // How close to balanced counts as balanced. Each drawn particle stands for a slice of concentration,
  // so thirty of them cannot put the two sides closer than a slice apart, and a tank of thirty wanders
  // about the balance point by several slices — that wandering is real, and it is what a dynamic
  // equilibrium looks like when you can count the molecules. Two slices is the tolerance.
  function equilibriumBand() {
    const mean = Math.max(1, (insideMM + outsideMM) / 2);
    return Math.max(0.12, (RT * 2 * unitMM()) / mean);
  }

  // ...and once it has been reached it stays reached until the reader changes something. Asked afresh
  // every frame, the figure flickered in and out of equilibrium as one particle crossed back and forth,
  // which says that a state the tank had genuinely arrived at keeps being undone. It does not: the
  // fluctuation is about the equilibrium, not away from it.
  //
  // A hysteresis release was written for this latch and then thrown away, because measuring it showed it
  // could not work. The worry was the other lie — a latch that can only ever close goes on saying
  // `equilibrated` from wherever the tank has since got to. The proposed release was "more than N bands
  // out, held for half a second". Measured over 25 s of the figure's own clock at 60 fps (2026-09-16,
  // oxygen, the light theme):
  //
  //   tank at its own equilibrium   max 9.95 bands out; longest stretch above 4 bands 1.95 s, above
  //                                 8 bands 0.40 s, above 10 bands none
  //   tank walked apart by the      max 10.30 bands out; longest stretch above 4 bands 2.32 s, above
  //   MAX_MM clamp (see below)      8 bands 0.53 s, above 10 bands 0.23 s
  //
  // The two distributions sit on top of each other. Thirty particles is a coarse instrument: an even
  // split wanders with an sd of sqrt(30 × 0.25) = 2.7 particles, which is nine slices of concentration,
  // so this tank genuinely cannot tell equilibrium from a 90 mmol/L gap and neither can any threshold
  // read off it. A release at four bands and half a second made `equilibrated` false on 18 per cent of
  // samples taken at a real equilibrium and still missed the drift — it would have failed
  // `i-passive-transport-2` about one sitting in five while catching nothing. So the latch stays as it
  // was, and the two things that actually walked a tank away from a latched equilibrium are dealt with
  // where they happen: `concentrationsChanged` re-lays the tank when a reading moves (fixed), and the
  // MAX_MM clamp in `advanceOneStep` breaks conservation when both sliders are at their top, which is
  // NOT fixed and is written up in the handoff.
  function noteEquilibrium() {
    if (Math.abs(drives().net) <= equilibriumBand()) equilibrium = true;
  }

  function clearEquilibrium() {
    equilibrium = false;
  }

  function drives() {
    const s = sp();
    const inC = Math.max(1e-6, insideMM);
    const outC = Math.max(1e-6, outsideMM);
    const chemical = RT * Math.log(outC / inC);
    const electrical = s.z ? -s.z * F_KJ * voltageMv : 0;
    return { chemical, electrical, net: chemical + electrical };
  }

  function state() {
    const s = sp();
    const d = drives();
    const pEff = coefficient(s, thicknessNm, channel);
    const band = equilibriumBand();
    return {
      species: s.id,
      permeabilityCmPerS: Number(pEff.toPrecision(3)),
      barrier: s.barrier,
      hydrationShell: s.shell,
      insideMM: round(insideMM, 1),
      outsideMM: round(outsideMM, 1),
      voltageMv: Math.round(voltageMv),
      chemicalDrive: round(d.chemical, 2),
      electricalDrive: round(d.electrical, 2),
      netDirection: d.net > band ? 'in' : d.net < -band ? 'out' : 'none',
      crossingsIn,
      crossingsOut,
      rejections,
      equilibrated: equilibrium || Math.abs(d.net) <= band,
      channelPresent: channel,
      thicknessNm: round(thicknessNm, 1),
      areaUm2: round(areaUm2, 2),
      fluxPerSecond: Number(fluxPerSecond(pEff, areaUm2, Math.abs(outsideMM - insideMM)).toPrecision(3)),
      t: round(t, 3),
      playing,
      layout: narrow ? 'narrow' : 'wide',
    };
  }

  function announce() {
    const d = state();
    const s = sp();
    live.textContent = `${s.name}, permeability ${power10(s.p)} centimetres per second${channel ? (s.id === 'water' ? ', with an aquaporin' : ', with a channel') : ''}. Outside ${Math.round(outsideMM)}, inside ${Math.round(insideMM)} millimoles per litre, ${d.voltageMv} millivolts. Net drive ${d.netDirection === 'none' ? 'balanced' : d.netDirection}. ${d.crossingsIn} crossings in, ${d.crossingsOut} out, ${d.rejections} turned away.`;
  }

  // ---------------------------------------------------------------- drawing the membrane

  // A substance, drawn. The ions come from the one element table, so they carry chapter 2's single ion
  // colour with their symbol written on them and are told apart by their ionic radii; the rest are drawn
  // as the molecules they are.
  function particleShape(s, scale) {
    const g = el('g');
    const r = s.r * scale;
    if (s.draw === 'ion') {
      g.append(atom(0, 0, s.ion, r, { charge: s.z > 0 ? '+' : '−', label: r >= 4.4 }));
      return g;
    }
    if (s.draw === 'O2') {
      g.append(bond(-r * 0.62, 0, r * 0.62, 0, 2, { width: r * 0.16 }));
      g.append(atom(-r * 0.62, 0, 'O', r * 0.62, { label: r >= 7 }));
      g.append(atom(r * 0.62, 0, 'O', r * 0.62, { label: r >= 7 }));
      return g;
    }
    if (s.draw === 'CO2') {
      g.append(bond(-r * 0.78, 0, r * 0.78, 0, 2, { width: r * 0.14 }));
      g.append(atom(-r * 0.78, 0, 'O', r * 0.5, { label: false }));
      g.append(atom(r * 0.78, 0, 'O', r * 0.5, { label: false }));
      g.append(atom(0, 0, 'C', r * 0.54, { label: false }));
      return g;
    }
    if (s.draw === 'H2O') {
      g.append(bond(0, 0, -r * 0.8, -r * 0.62, 1, { width: r * 0.16 }));
      g.append(bond(0, 0, r * 0.8, -r * 0.62, 1, { width: r * 0.16 }));
      g.append(atom(-r * 0.8, -r * 0.62, 'H', r * 0.34, { label: false }));
      g.append(atom(r * 0.8, -r * 0.62, 'H', r * 0.34, { label: false }));
      g.append(atom(0, 0, 'O', r * 0.62, { label: r >= 9 }));
      return g;
    }
    if (s.draw === 'urea') {
      g.append(bond(0, 0, 0, -r * 0.72, 2, { width: r * 0.12 }));
      g.append(bond(0, 0, -r * 0.74, r * 0.5, 1, { width: r * 0.12 }));
      g.append(bond(0, 0, r * 0.74, r * 0.5, 1, { width: r * 0.12 }));
      g.append(atom(0, -r * 0.72, 'O', r * 0.42, { label: false }));
      g.append(atom(-r * 0.74, r * 0.5, 'N', r * 0.42, { label: false }));
      g.append(atom(r * 0.74, r * 0.5, 'N', r * 0.42, { label: false }));
      g.append(atom(0, 0, 'C', r * 0.4, { label: false }));
      return g;
    }
    if (s.draw === 'glycerol') {
      for (let i = 0; i < 3; i += 1) {
        const x = (i - 1) * r * 0.62;
        if (i) g.append(bond((i - 2) * r * 0.62, 0, x, 0, 1, { width: r * 0.12 }));
        g.append(bond(x, 0, x, -r * 0.62, 1, { width: r * 0.12 }));
        g.append(atom(x, -r * 0.62, 'O', r * 0.34, { label: false }));
        g.append(atom(x, 0, 'C', r * 0.34, { label: false }));
      }
      return g;
    }
    // Glucose is the cargo of the rest of the chapter, so it takes the book's sugar gold and the ring
    // it is drawn with everywhere else.
    const pts = [];
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${(Math.cos(a) * r * 0.86).toFixed(1)} ${(Math.sin(a) * r * 0.86).toFixed(1)}`);
    }
    g.append(el('path', { d: `M${pts.join('L')}Z`, fill: GLUCOSE_C, stroke: C.ink, 'stroke-width': Math.max(0.8, r * 0.1), 'stroke-linejoin': 'round' }));
    return g;
  }

  // The shell of water an ion drags about with it, which is the whole reason it cannot cross. Drawn as
  // the four water molecules that would be nearest, not as a halo: a halo is decoration and this is the
  // explanation.
  function shellShape(s, scale) {
    const g = el('g', { class: 'pm-shell' });
    const r = s.r * scale;
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const cx = Math.cos(a) * r * 1.9;
      const cy = Math.sin(a) * r * 1.9;
      const w = el('g', { transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(0)})` });
      w.append(bond(0, 0, -r * 0.42, -r * 0.33, 1, { width: r * 0.1 }));
      w.append(bond(0, 0, r * 0.42, -r * 0.33, 1, { width: r * 0.1 }));
      w.append(atom(-r * 0.42, -r * 0.33, 'H', r * 0.2, { label: false }));
      w.append(atom(r * 0.42, -r * 0.33, 'H', r * 0.2, { label: false }));
      w.append(atom(0, 0, 'O', r * 0.34, { label: false }));
      g.append(w);
    }
    return g;
  }

  let sceneW = 0;
  let sceneH = 0;
  let partLayer = null;
  let partNodes = [];
  const MEM_TOP = 0.50;
  const MEM_BOT = 0.66;

  function layoutScene(w, hgt) {
    sceneW = w;
    sceneH = hgt;
    sceneSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    sceneSvg.replaceChildren();
    const s = sp();
    // The floor is 0.85 and not lower: below it `atom()` stops writing the symbol on an ion, and this
    // book never tells two ions apart by colour. A sodium at 0.85 is 5.3 units across with 'Na' on it at
    // six pixels, which on a 3x phone is eighteen device pixels.
    const scale = clamp(Math.min(w / 520, hgt / 300), 0.85, 1.25);

    const top = MEM_TOP * hgt;
    const bot = MEM_BOT * hgt;
    // The two compartments: water above, cytoplasm below, each a tint that runs edge to edge. No rule
    // round either, because the stage is the only rectangle the book draws.
    sceneSvg.append(el('rect', { x: 0, y: 0, width: fmt(w, 1), height: fmt(top, 1), fill: tint(C.water, 11) }));
    sceneSvg.append(el('rect', { x: 0, y: fmt(bot, 1), width: fmt(w, 1), height: fmt(Math.max(1, hgt - bot), 1), fill: tint(C.gold, 9) }));

    // The bilayer, edge on, drawn as the molecules of Figure 4.1 rather than as a slab: a head on each
    // face with its tails hanging into the core, which is what a reader has just watched assemble.
    const headR = Math.max(2.4, 5.6 * scale);
    const mid = (top + bot) / 2;
    const gap = headR * 2.0;
    const lipids = el('g');
    for (let x = gap / 2; x < w + gap; x += gap) {
      const cx = Math.min(w + headR, x);
      lipids.append(el('path', {
        d: `M${fmt(cx, 1)} ${fmt(top + headR, 1)} L${fmt(cx, 1)} ${fmt(mid - 0.6, 1)} M${fmt(cx, 1)} ${fmt(bot - headR, 1)} L${fmt(cx, 1)} ${fmt(mid + 0.6, 1)}`,
        stroke: TAIL_C, 'stroke-width': fmt(headR * 1.5, 1), 'stroke-linecap': 'round', fill: 'none',
      }));
    }
    for (let x = gap / 2; x < w + gap; x += gap) {
      const cx = Math.min(w + headR, x);
      lipids.append(el('circle', { cx: fmt(cx, 1), cy: fmt(top + headR, 1), r: fmt(headR, 1), fill: HEAD_C }));
      lipids.append(el('circle', { cx: fmt(cx, 1), cy: fmt(bot - headR, 1), r: fmt(headR, 1), fill: HEAD_C }));
    }
    sceneSvg.append(lipids);

    // A channel, when one has been dropped in: a hole through the sheet, in the chapter's channel
    // colour, with the lipid parted round it rather than drawn over.
    if (channel) {
      const cw = Math.max(18, 34 * scale);
      const cx = w * 0.5;
      sceneSvg.append(el('rect', { x: fmt(cx - cw / 2, 1), y: fmt(top, 1), width: fmt(cw, 1), height: fmt(Math.max(1, bot - top), 1), fill: C.paper }));
      const wall = Math.max(4, cw * 0.28);
      for (const dx of [-1, 1]) {
        sceneSvg.append(el('path', {
          d: `M${fmt(cx + dx * (cw / 2 - wall / 2), 1)} ${fmt(top, 1)} L${fmt(cx + dx * (cw / 2 - wall / 2), 1)} ${fmt(bot, 1)}`,
          stroke: CHANNEL_C, 'stroke-width': fmt(wall, 1), 'stroke-linecap': 'butt',
        }));
      }
      // Water's channel has a name, and §4.5 uses it. Naming it here is what lets the `aquaporin`
      // objective point at this figure: a reader who drops a channel in for water sees the word and
      // watches the coefficient climb three decades, which is what an aquaporin does to a membrane.
      const label = speciesId === 'water' ? 'aquaporin' : 'channel';
      const size = clamp(9.6 * scale, 8.4, 10.4);
      if (w > 220) sceneSvg.append(text(cx, top - 6, label, { anchor: 'middle', class: 'pm-over', 'font-size': fmt(size, 1) }));
    }

    partLayer = el('g');
    partNodes = parts.map(() => {
      const g = el('g');
      partLayer.append(g);
      return g;
    });
    sceneSvg.append(partLayer);
    // Which side is which, drawn AFTER the queue so that a molecule cannot be on top of the one word
    // that says where it is. Both carry the paper with them as well.
    const side = clamp(10.4 * scale, 9, 11.4);
    sceneSvg.append(text(6, side + 4, 'outside', { class: 'pm-side', 'font-size': fmt(side, 1) }));
    sceneSvg.append(text(6, hgt - 6, 'inside — the cytoplasm', { class: 'pm-side', 'font-size': fmt(side, 1) }));
    sceneSvg.append(focusMark(w, hgt));
    paintScene(scale);
  }

  function paintScene(scale) {
    if (!partLayer) return;
    const s = sp();
    const size = scale ?? clamp(Math.min(sceneW / 520, sceneH / 300), 0.85, 1.25);
    for (let i = 0; i < parts.length; i += 1) {
      const p = parts[i];
      const g = partNodes[i];
      if (!g) continue;
      g.replaceChildren();
      // The shell comes off at the mouth of the core and goes straight back on when the ion is turned
      // away: that is the explanation, so it is drawn at the moment it happens and nowhere else.
      const atFace = s.shell && (p.out ? p.y > MEM_TOP - 0.05 : p.y < MEM_BOT + 0.05);
      if (s.shell && !atFace) g.append(shellShape(s, size));
      g.append(particleShape(s, size));
      g.setAttribute('transform', `translate(${fmt(p.x * sceneW, 1)} ${fmt(p.y * sceneH, 1)})`);
    }
  }

  // ---------------------------------------------------------------- the log flux bar

  const BAR_LO = -4; // decades of molecules per second
  const BAR_HI = 11;

  function drawBar(w, hgt) {
    barSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    barSvg.replaceChildren();
    const d = state();
    const padT = 16;
    // On the wide stage the two lines under the bar need the axis to stop above them: at 20 the axis,
    // its bottom tick and the foot of the bar ran into the ascenders of "molecules per second", and the
    // note measured 4.18:1 light and 4.10:1 dark on them (npm run legible, 2026-09-23).
    const padB = narrow ? 20 : 30;
    const h0 = Math.max(24, hgt - padT - padB);
    const x = narrow ? 27 : Math.min(26, w * 0.34);
    const Y = (e) => padT + h0 * (1 - (e - BAR_LO) / (BAR_HI - BAR_LO));

    barSvg.append(text(0, 10, 'Flux', { class: 'mol-rt-title', 'font-size': narrow ? 8.4 : 9.2 }));
    // One rule with a tick at every decade: the span is the point, so every decade is marked and only
    // the powers of a thousand are labelled, which is what keeps the labels legible in a column this
    // narrow.
    barSvg.append(el('line', { x1: fmt(x, 1), y1: fmt(Y(BAR_LO), 1), x2: fmt(x, 1), y2: fmt(Y(BAR_HI), 1), stroke: C.ruleStrong }));
    for (let e = BAR_LO; e <= BAR_HI; e += 1) {
      const y = Y(e);
      const big = e % 3 === 0 || e === BAR_HI;
      barSvg.append(el('line', { x1: fmt(x - (big ? 5 : 2.5), 1), y1: fmt(y, 1), x2: fmt(x, 1), y2: fmt(y, 1), stroke: big ? C.ruleStrong : C.rule }));
      if (big && w > 34) barSvg.append(text(x - 7, y + 3.2, `10${superscript(String(e))}`, { anchor: 'end', class: 'pm-tick', 'font-size': narrow ? 7.8 : 8.8 }));
    }

    const flux = d.fluxPerSecond;
    if (flux > 0) {
      const e = clamp(Math.log10(flux), BAR_LO, BAR_HI);
      const y = Y(e);
      barSvg.append(el('rect', { x: fmt(x, 1), y: fmt(y, 1), width: fmt(Math.max(3, Math.min(9, w * 0.2)), 1), height: fmt(Math.max(1, Y(BAR_LO) - y), 1), fill: tint(C.coral, 55) }));
      barSvg.append(el('line', { x1: fmt(x, 1), y1: fmt(y, 1), x2: fmt(Math.min(w, x + 22), 1), y2: fmt(y, 1), stroke: INK.coral, 'stroke-width': 2 }));
      if (!narrow && w > 60) barSvg.append(text(Math.min(w, x + 24), y + 3.4, formatFlux(flux), { class: 'pm-now', 'font-size': 9.4 }));
    } else {
      barSvg.append(text(x + 4, Y(BAR_LO) - 2, 'none', { class: 'pm-tick', 'font-size': 8.8 }));
    }
    if (!narrow) {
      barSvg.append(text(0, hgt - 16, 'molecules per second', { class: 'mol-rt-note', 'font-size': 8.6 }));
      barSvg.append(text(0, hgt - 5, `through ${fmt(areaUm2, 2)} µm²`, { class: 'mol-rt-note', 'font-size': 8.6 }));
    }
  }

  // ---------------------------------------------------------------- the reading

  function readRows(d) {
    const s = sp();
    if (narrow) {
      return {
        left: [
          ['Turned away', String(d.rejections), { accent: INK.coral }],
          ['Crossings, in · out', `${d.crossingsIn} · ${d.crossingsOut}`],
          ['Net drive', d.netDirection === 'none' ? 'balanced' : d.netDirection],
        ],
        right: [],
        note: `Stopped by ${s.stops}. Thickness and area are on the wider stage.`,
      };
    }
    const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v), 2)} kJ/mol`;
    return {
      left: [
        ['Turned away', String(d.rejections), { accent: INK.coral }],
        ['Crossings, in · out', `${d.crossingsIn} · ${d.crossingsOut}`],
        ['Arrivals so far', String(d.crossingsIn + d.crossingsOut + d.rejections)],
      ],
      right: [
        ['Concentration term', signed(d.chemicalDrive)],
        ['Electrical term', s.z ? signed(d.electricalDrive) : 'none — it carries no charge'],
        ['Net', d.netDirection === 'none' ? 'balanced: as many each way' : `${d.netDirection === 'in' ? 'inwards' : 'outwards'}, ${fmt(Math.abs(d.chemicalDrive + d.electricalDrive), 2)} kJ/mol`],
      ],
      note: `${s.stops.charAt(0).toUpperCase()}${s.stops.slice(1)}. ${sentence(d, s)}`,
    };
  }

  // The one sentence, and it has to be right in every state its parts can take.
  function sentence(d, s) {
    if (d.equilibrated) return 'The two drives cancel, and both counters are still climbing: this is what a dynamic equilibrium is.';
    if (d.channelPresent) return `${s.id === 'water' ? 'An aquaporin' : 'A channel'} raises the coefficient for ${s.name.toLowerCase()} to ${power10(d.permeabilityCmPerS)} cm/s, and the bar moves with it.`;
    if (d.rejections + d.crossingsIn + d.crossingsOut === 0) return 'Nothing has arrived at the membrane yet. Press Run.';
    if (d.crossingsIn + d.crossingsOut === 0) return `${d.rejections} arrivals, and not one of them through.`;
    return `One crossing in every ${Math.round((d.rejections + d.crossingsIn + d.crossingsOut) / (d.crossingsIn + d.crossingsOut))} arrivals, as drawn; the bar carries the true rate.`;
  }

  // The prose broken into lines that fit, because readoutTable draws a note on one line and does not
  // wrap. Inter runs about 0.53 em a character at this size.
  function noteLines(str, width, size) {
    const max = Math.max(12, Math.floor(width / (size * 0.53)));
    const lines = [];
    let cur = '';
    for (const word of str.split(' ')) {
      if (!cur) cur = word;
      else if (`${cur} ${word}`.length <= max) cur = `${cur} ${word}`;
      else { lines.push(cur); cur = word; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  const READ_GAP = 26;

  function drawRead(w, hgt) {
    readSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    readSvg.replaceChildren();
    const d = state();
    const s = sp();
    const { left, right, note } = readRows(d);
    const size = narrow ? 10.2 : 10.6;
    const two = right.length > 0 && w > 460;
    const colW = two ? (w - READ_GAP) / 2 : w;
    // Water's channel is named on the membrane, so it is named here too: a panel headed "with a channel"
    // over a pore labelled "aquaporin" reads as two different things in one frame.
    const withOne = s.id === 'water' ? ' · with an aquaporin' : ' · with a channel';
    const title = narrow ? null : `${s.name} · ${power10(s.p)} cm s⁻¹${channel ? withOne : ''}`;
    const noteSize = narrow ? 9.4 : 9.8;
    const lines = noteLines(note, w, noteSize);
    const noteH = lines.length * (noteSize + 3) + 6;
    const tableH = Math.max(30, hgt - noteH);
    const rows = two ? left : [...left, ...right];
    const { rowH } = fitRows(rows, tableH, { width: colW, size, title }, 13, 24);
    const end = readoutTable(readSvg, rows, { width: colW, size, title, rowH, x: 0, y: 0 });
    if (two) readoutTable(readSvg, right, { width: colW, size, title: ' ', rowH, x: colW + READ_GAP, y: 0 });
    let y = end + 4;
    for (const line of lines) {
      y += noteSize + 3;
      readSvg.append(text(0, y, line, { class: 'mol-rt-note', 'font-size': fmt(noteSize, 1) }));
    }
  }

  // ---------------------------------------------------------------- layout

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(30, Math.round(r.width)), Math.max(24, Math.round(r.height))];
  }

  function draw() {
    if (destroyed) return;
    const [sw, sh] = paneBox(scenePane);
    layoutScene(sw, sh);
    const [bw, bh] = paneBox(barPane);
    drawBar(bw, bh);
    const [rw, rh] = paneBox(readPane);
    drawRead(rw, rh);
  }

  function paint() {
    if (destroyed) return;
    if (!partLayer) { draw(); return; }
    paintScene();
    const [bw, bh] = paneBox(barPane);
    drawBar(bw, bh);
    const [rw, rh] = paneBox(readPane);
    drawRead(rw, rh);
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
    // The two Fick sliders are dropped below 800 px rather than shrunk, and the reading says so.
    fickGroup.style.display = w < DROP_FICK_W ? 'none' : '';
    const { left, right, note } = readRows(state());
    const rowsForHeight = w > 460 && right.length ? left : [...left, ...right];
    const noteSize = narrow ? 9.4 : 9.8;
    const lines = noteLines(note, Math.max(160, w - 24), noteSize);
    const wantRead = Math.ceil(readoutHeight(rowsForHeight, { size: narrow ? 10.2 : 10.6, rowH: narrow ? 19 : 21, title: narrow ? null : 'x' })) + lines.length * (noteSize + 3) + 18;
    if (wantRead !== readPx) {
      readPx = wantRead;
      wrap.style.setProperty('--pm-read-h', `${wantRead}px`);
    }
    if (narrow && listPx !== 30) {
      listPx = 30;
      wrap.style.setProperty('--pm-list-h', '30px');
    }
    if (narrow) requestAnimationFrame(showSelected);
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 24;
    if (pad > 24 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--pm-pad', `${pad}px`);
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

  restart(true);
  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  const fontsReady = document.fonts?.ready;
  // The chips are wider once the interface face has loaded, so where the list has to be scrolled to is
  // worked out again then: done once at mount, the selected chip was left half off the right-hand end.
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) { draw(); showSelected(); } });
  onResize();
  void ns;

  return {
    destroy() {
      destroyed = true;
      playing = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      sceneSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(next) {
      if (destroyed) return;
      advanceTo(next);
      paint();
    },
    setVisible(v) {
      visible = v !== false;
      if (visible && playing) tick();
    },
    setTheme() {
      if (!destroyed && ready) draw();
    },
    // species              which of the nine is at the membrane
    // permeabilityCmPerS   the coefficient it has here: §4.3's table, scaled by thickness, and raised
    //                      by a channel if one has been dropped in
    // barrier              none | polarity | size | charge
    // hydrationShell       drawn for the ionic species
    // insideMM, outsideMM  the two concentrations, which crossings move
    // voltageMv            inside relative to outside
    // chemicalDrive, electricalDrive  kJ/mol, signed, positive inwards, so they can be compared
    // netDirection         in | out | none
    // crossingsIn, crossingsOut, rejections  counted from what is drawn, since the reader set this up
    // equilibrated         THE TWO DRIVES CANCEL — the concentration term and the electrical one. For an
    //                      uncharged species that is the two sides level; for an ion it is the Nernst
    //                      ratio, which is §4.3's whole point, so a charged species reports it at a
    //                      large concentration difference and is right to: chloride at 28 inside
    //                      against 129 outside is equilibrated at −41 mV, where the two terms come to
    //                      −0.02 kJ/mol, and is not at −45 or −35. It is NOT "the two sides are level",
    //                      and an item that means that should read insideMM and outsideMM. It latches
    //                      once reached, because the tank wanders about its equilibrium by up to nine
    //                      slices of concentration and asking afresh every frame blinked it off; see
    //                      noteEquilibrium for the measurement that says no threshold can do better.
    // channelPresent       a channel for this species is in the membrane
    // thicknessNm, areaUm2 the two Fick terms
    // fluxPerSecond        molecules per second through the patch — what the bar shows
    // t                    clock, seconds
    // playing              whether arrivals are running
    // layout               wide | narrow
    describe() {
      return state();
    },
  };
}
