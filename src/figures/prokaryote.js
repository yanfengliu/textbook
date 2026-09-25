// A bacterial envelope, and what breaks it. A prokaryotic cell in section — nucleoid, plasmids,
// ribosomes, plasma membrane, wall — with a switchable envelope, a gram stain the reader runs, an
// osmotic challenge, and three ways of attacking the wall. The wall is not labelled here; it is tested.
//
// THE LAYERS, in nanometres, which is the whole reason the envelope is worth switching. They are drawn
// to scale both in the cell (where a gram-negative cell's peptidoglycan is correctly about one pixel)
// and in the magnified callout (where it is legible), so "as different as they are" is a measurement
// and not an assertion:
//
//   gram-positive   plasma membrane 7 · peptidoglycan 30 (the layer runs 20–80 nm)          = 37 nm
//   gram-negative   plasma membrane 7 · periplasm 5 · peptidoglycan 3 · periplasm 5 ·
//                   outer membrane 7, with lipopolysaccharide chains on its outer face       = 27 nm
//   archaeal        ether-linked membrane 7 · a gap of 8 · S-layer 10, and no peptidoglycan   = 25 nm
//   capsule         100–400 nm of loose polysaccharide; drawn at 150, and left off the callout
//                   because at the callout's scale it is four times the height of the frame
//
// THE GRAM STAIN runs in four steps the reader triggers: crystal violet floods in, iodine fixes it as a
// large complex, alcohol washes — dissolving a gram-negative cell's outer membrane so the complex runs
// out, and dehydrating a gram-positive cell's thick mesh so it cannot — and safranin counterstains
// whatever is left colourless. An archaeon has no peptidoglycan to hold anything, so it ends pink.
//
// THE WALL FAILS on accumulated damage, integrated over the reader's own actions so that setTime(t)
// reproduces a frame: removing it is instant, lysozyme cuts the sugar backbone in about 1.5 s, and
// penicillin blocks new cross-links, so it only does anything while the cell is growing and takes about
// 4 s of growth to matter. Neither enzyme nor antibiotic touches an archaeon. With the wall gone and the
// medium dilute the cell rounds up, swells and bursts; with the medium concentrated it plasmolyses,
// wall or no wall.
//
// Nothing here calls Math.random; the ribosomes, the nucleoid and the run-and-tumble schedule all come
// from one seeded generator.
import { mix, alpha, ORGANELLE_BY_ID } from '../palette.js';
import { h } from './lib/svg.js';
import { CELL_COLOUR, CELL_COLOURS, partInfo } from './lib/cell3-colours.js';
import {
  mulberry32, TAU, clamp, clamp01, lerp, smoothstep, FONT, fitCanvas, roundRectPath, panelCss, sigFigs,
} from './lib/cell-common.js';

export const meta = { kind: 'prokaryote', title: 'A prokaryotic cell', needsWebGL: false, aspect: 16 / 10 };

const SEED = 30331;
const CELL_LEN = 2000; // nm, an E. coli rod
const CELL_W = 800;
const SWIM_NM_PER_S = 25_000; // 25 µm s⁻¹, E. coli's own speed

const ENVELOPES = {
  'gram-positive': {
    organism: 'bacterium',
    pgNm: 30,
    label: 'Gram-positive',
    short: 'Gram +',
    layers: [
      { id: 'wall', name: 'Peptidoglycan', nm: 30, colour: 'wall' },
      { id: 'membrane', name: 'Plasma membrane', nm: 7, colour: 'membrane' },
    ],
    named: ['peptidoglycan', 'plasma membrane'],
    note: 'A thick mesh, tens of nanometres deep, threaded with teichoic acids. It holds the crystal violet through the alcohol wash, and the cell stays purple.',
  },
  'gram-negative': {
    organism: 'bacterium',
    pgNm: 3,
    label: 'Gram-negative',
    short: 'Gram −',
    layers: [
      { id: 'outerMembrane', name: 'Outer membrane', nm: 7, colour: 'membrane', lps: true },
      { id: 'periplasm', name: 'Periplasm', nm: 5, colour: 'periplasm' },
      { id: 'wall', name: 'Peptidoglycan', nm: 3, colour: 'wall' },
      { id: 'periplasm2', name: 'Periplasm', nm: 5, colour: 'periplasm' },
      { id: 'membrane', name: 'Plasma membrane', nm: 7, colour: 'membrane' },
    ],
    named: ['outer membrane', 'peptidoglycan', 'plasma membrane'],
    note: 'Only a few nanometres of peptidoglycan, under a second membrane whose outer face carries lipopolysaccharide. The alcohol dissolves that membrane and the dye runs out.',
  },
  archaeal: {
    organism: 'archaeon',
    pgNm: 0,
    label: 'Archaeal',
    short: 'Archaea',
    layers: [
      { id: 'sLayer', name: 'S-layer', nm: 10, colour: 'sLayer' },
      { id: 'quasi', name: 'Quasi-periplasm', nm: 8, colour: 'periplasm' },
      { id: 'membrane', name: 'Ether-linked membrane', nm: 7, colour: 'membrane', ether: true },
    ],
    named: ['S-layer', 'plasma membrane'],
    note: 'A lattice of protein subunits over a membrane of branched chains joined to glycerol by ether bonds. No peptidoglycan anywhere, so penicillin and lysozyme have nothing to work on.',
  },
};
const ENV_IDS = Object.keys(ENVELOPES);

const TREATMENTS = {
  penicillin: { label: 'Penicillin', short: 'Pen.', seconds: 4, needsGrowth: true, needsPg: true },
  lysozyme: { label: 'Lysozyme', short: 'Lyso.', seconds: 1.5, needsGrowth: false, needsPg: true },
  removed: { label: 'Remove wall', short: 'Strip', seconds: 0.25, needsGrowth: false, needsPg: false },
};
const APPENDAGES = ['capsule', 'flagella', 'pili'];
const APPENDAGE_LABEL = { capsule: 'Capsule', flagella: 'Flagella', pili: 'Pili' };

const CAPSULE_NM = 150;
const STAIN_STEPS = [
  { at: 0, until: 1.2, id: 'crystal-violet', label: 'Crystal violet floods in' },
  { at: 1.2, until: 2.2, id: 'iodine', label: 'Iodine fixes it as a large complex' },
  { at: 2.2, until: 3.8, id: 'alcohol', label: 'The alcohol wash' },
  { at: 3.8, until: 5.2, id: 'safranin', label: 'Safranin counterstains what is left' },
];
const STAIN_TOTAL = 5.2;

// Parts the reader can click, beyond the ones ORGANELLES and CELL_COLOURS already name.
const EXTRA_PARTS = {
  periplasm: { id: 'periplasm', name: 'Periplasm', color: null, role: 'The compartment between the two membranes of a gram-negative cell, where the peptidoglycan sits and much of the cell\'s chemistry is done.' },
  outerMembrane: { id: 'outerMembrane', name: 'Outer membrane', color: null, role: 'A second membrane outside the wall, unique to gram-negative bacteria; its outer face carries lipopolysaccharide and it keeps many drugs out.' },
  archaellum: { id: 'archaellum', name: 'Archaellum', color: null, role: 'An archaeon\'s swimming filament. It rotates like a bacterial flagellum but is built from proteins related to pili and is driven by ATP, not by protons.' },
};

const NARROW_W = 700;
// The wide layout's side column holds every control and the cell's fate only from about 540 px tall: at
// the 782 x 489 box of an 1150 px window it cut off "Growing" and the fate under it.
const NARROW_H = 540;
const SHORT_W = 560;

// ---------- the cell's model ----------

function buildContents() {
  const rng = mulberry32(SEED);
  const ribos = [];
  // 2 µm × 0.8 µm of cytoplasm holds tens of thousands of ribosomes; a section through it shows a few
  // hundred, which is what is drawn.
  while (ribos.length < 320) {
    const x = (rng() - 0.5) * CELL_LEN;
    const y = (rng() - 0.5) * CELL_W;
    const k = (x / (CELL_LEN / 2)) ** 2 + (y / (CELL_W / 2)) ** 2;
    if (k > 0.86) continue;
    ribos.push([x, y, 11 + rng() * 4]);
  }
  // The nucleoid: one circular chromosome folded into a loose mass in the middle of the cell. Drawn as
  // a closed random walk that stays inside an ellipse.
  const loop = [];
  const N = 120;
  for (let i = 0; i < N; i += 1) {
    const a = (i / N) * TAU;
    const wob = 1 + 0.42 * Math.sin(5 * a + 1.1) + 0.24 * Math.sin(9 * a + 2.4) + 0.13 * Math.sin(14 * a);
    loop.push([Math.cos(a) * 430 * wob, Math.sin(a) * 190 * wob]);
  }
  const plasmids = [];
  for (let i = 0; i < 3; i += 1) {
    const cx = (rng() - 0.5) * CELL_LEN * 0.62;
    const cy = (rng() > 0.5 ? 1 : -1) * (170 + rng() * 100);
    const r = 74 + rng() * 30;
    plasmids.push({ c: [cx, cy], r, rot: rng() * TAU, wob: rng() * TAU });
  }
  // The run-and-tumble schedule: runs of 0.8-2.4 s broken by tumbles of 0.15-0.35 s, fixed at mount.
  const phases = [];
  let clock = 0;
  for (let i = 0; i < 60; i += 1) {
    const run = 0.8 + rng() * 1.6;
    phases.push({ from: clock, to: clock + run, kind: 'run', dir: rng() * TAU });
    clock += run;
    const tumble = 0.15 + rng() * 0.2;
    phases.push({ from: clock, to: clock + tumble, kind: 'tumble', dir: 0 });
    clock += tumble;
  }
  // Solute particles, for the medium and for the cytoplasm. The medium's are drawn in proportion to the
  // slider, the cytoplasm's at a fixed density, so the reader can see which side is the concentrated one
  // instead of being told.
  const solutes = [];
  for (let i = 0; i < 420; i += 1) solutes.push([rng(), rng(), rng()]);
  return { ribos, loop, plasmids, phases, total: clock, solutes };
}

// The layers a damaged envelope actually has: peptidoglycan thins as it is cut, or as it fails to be
// cross-linked, and at full damage it is not there at all.
function layersOf(env, damage = 0) {
  const left = clamp01(1 - damage);
  return ENVELOPES[env].layers
    .map((l) => (l.id === 'wall' ? { ...l, nm: l.nm * left } : l))
    .filter((l) => l.nm > 0.01);
}
const layerTotal = (env, damage = 0) => layersOf(env, damage).reduce((a, l) => a + l.nm, 0);
// The thickest envelope, which sets the magnification of a callout laid across the stage: one scale for
// all three, so switching them shows how different they are.
const MAX_NM = Math.max(...ENV_IDS.map((id) => layerTotal(id)));
// A thickness as a reader writes it: a wall thinning under an attack is 22 nm, not 21.999000000000002.
const nmText = (nm) => `${nm >= 1 ? Math.round(nm) : nm.toFixed(1)} nm`;

// Centres for labels of widths `ws` that want to sit at centres `cs`, in order along a line from `lo` to
// `hi` and at least `gap` apart, each moved as little as the others allow. Null when they cannot fit.
function spread(cs, ws, lo, hi, gap) {
  const n = cs.length;
  if (ws.reduce((a, w) => a + w, 0) + gap * Math.max(0, n - 1) > hi - lo) return null;
  const out = cs.slice();
  for (let i = 0; i < n; i += 1) {
    const min = i === 0 ? lo + ws[0] / 2 : out[i - 1] + (ws[i - 1] + ws[i]) / 2 + gap;
    out[i] = Math.max(out[i], min);
  }
  for (let i = n - 1; i >= 0; i -= 1) {
    const max = i === n - 1 ? hi - ws[i] / 2 : out[i + 1] - (ws[i] + ws[i + 1]) / 2 - gap;
    out[i] = Math.min(out[i], max);
  }
  return out;
}

// ---------- the figure ----------

const CSS = (s) => `${panelCss(s)}
.${s} { display: grid; grid-template-columns: minmax(0, 1fr) clamp(210px, 33%, 320px); grid-template-rows: minmax(0, 1fr); padding-bottom: var(--pk-pad, 3.1rem); box-sizing: border-box; }
.${s} .pk-stage { grid-column: 1; grid-row: 1; position: relative; min-width: 0; min-height: 0; padding: var(--space-3) 0 var(--space-2) var(--space-3); box-sizing: border-box; }
.${s} .pk-stage canvas { width: 100%; height: 100%; border-radius: var(--radius); cursor: pointer; }
.${s} .pk-panel { grid-column: 2; grid-row: 1; padding: var(--space-3) var(--space-4) var(--space-2); gap: 0.5rem; box-sizing: border-box; overflow: hidden; }
.${s} .pk-block { display: flex; flex-direction: column; gap: 0.26rem; }
/* The verdict sits at the foot of the column, level with the bottom of the drawing, under a rule: the
   controls are the head of the page and what they did to the cell is its last line. */
.${s} .pk-foot { margin-top: auto; display: flex; flex-direction: column; gap: 0.3rem; }
.${s} .pk-fate { font-size: 12px; line-height: 1.4; color: var(--ink-soft); margin: 0; }
.${s} .pk-fate b { font-family: var(--font-display); font-size: 16px; font-weight: 500; }
.${s} .pk-swim { font-size: 11px; line-height: 1.35; color: var(--ink-soft); margin: 0; font-variant-numeric: lining-nums tabular-nums; }
.${s} .pk-swim b { color: var(--ink); font-weight: 600; }
.${s} .pk-fate[data-f="lysed"] b, .${s} .pk-fate[data-f="swollen"] b { color: var(--coral-text); }
.${s} .pk-fate[data-f="intact"] b { color: var(--leaf-text); }
.${s} .pk-fate[data-f="plasmolysed"] b { color: color-mix(in srgb, var(--gold) 74%, var(--ink)); }
.${s} .pk-layers { font-size: 10.5px; line-height: 1.4; color: var(--ink-faint); }
.${s} .pk-layers b { color: var(--ink-soft); font-weight: 600; }
.${s} .pk-stainchip { position: absolute; top: var(--space-4); left: var(--space-5); display: inline-flex; align-items: center; gap: 0.45em; background: color-mix(in srgb, var(--paper) 88%, transparent); backdrop-filter: blur(6px); }
.${s} .pk-stainchip::before { content: ""; width: 0.6em; height: 0.6em; border-radius: 50%; background: var(--pk-dot, var(--ink-faint)); }
.${s} .pk-stainchip[hidden] { display: none; }
.${s} .pk-card { top: auto; bottom: var(--space-3); left: var(--space-5); max-width: min(17rem, 62%); }
.${s} .pk-card[hidden] { display: none; }
.${s} .pk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.${s} .pk-short { display: none; }
.${s}.is-short .pk-long { display: none; }
.${s}.is-short .pk-short { display: inline; }
.${s}.is-short .fig-btn { padding: 0.3rem 0.5rem; }
.${s}.is-short .fig-toolbar { gap: 0.3rem; }
/* Narrow: the cell keeps the top of the stage and the panel becomes rows under it. The envelope callout
   turns on its side in the drawing itself, so the layer names are read across rather than down. */
.${s}.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; }
.${s}.is-narrow .pk-stage { grid-column: 1; grid-row: 1; padding: var(--space-2) var(--space-3) 0; }
.${s}.is-narrow .pk-panel { grid-column: 1; grid-row: 2; padding: var(--space-2) var(--space-3) 0; gap: 0.22rem; }
.${s}.is-narrow .pk-block { gap: 0.16rem; }
.${s}.is-narrow .pk-fate { font-size: 11px; }
.${s}.is-narrow .pk-fate b { font-size: 14px; }
.${s}.is-narrow .pk-foot { margin-top: 0; gap: 0.16rem; }
.${s}.is-narrow .cl-slider label { font-size: 10.5px; }
.${s}.is-narrow .pk-swim { display: none; }
.${s}.is-narrow .pk-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 var(--space-3); align-items: start; }
.${s}.is-narrow .pk-layers { display: none; }
/* The card comes down over the whole strip under the cell: stopping short of it left half of each layer's
   name showing under the card's frosted edge. */
.${s}.is-narrow .pk-card { max-width: 80%; bottom: 3px; }
.${s}.is-narrow .pk-stainchip { left: var(--space-4); top: var(--space-3); }
/* Flat: a box wider than it is tall and too small for the wide layout. The frame gives one from an 800 px
   window up, where the rail beside the text keeps the stage at 480 to 863 px wide, and stacking the panel
   under the drawing there left the drawing 12 to 135 px tall. So the controls stand beside the drawing at
   the stage's full height, the two toolbar buttons keep to the drawing's column under it, and the envelope
   is magnified across the foot of the drawing as on a phone. The slider names its own medium, so the
   "Outside" heading goes; the envelope's layer line and the swimming line come back once the box is tall
   enough to hold them. */
.${s}.is-narrow.is-flat { grid-template-columns: minmax(0, 1fr) var(--pk-side, 44%); grid-template-rows: minmax(0, 1fr); padding-bottom: 0; }
.${s}.is-narrow.is-flat .pk-stage { padding: var(--space-3) var(--space-1) var(--pk-pad, 3.1rem) var(--space-3); }
.${s}.is-narrow.is-flat .pk-panel { grid-column: 2; grid-row: 1; padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2); }
.${s}.is-narrow.is-flat .pk-two { display: flex; flex-direction: column; gap: 0.22rem; }
.${s}.is-narrow.is-flat .pk-two > .pk-block:first-child > .cl-head { display: none; }
.${s}.is-narrow.is-flat .pk-foot { margin-top: auto; }
.${s}.is-narrow.is-flat .fig-toolbar { right: calc(var(--pk-side, 44%) + var(--space-1)); }
.${s}.is-narrow.is-flat .pk-card { bottom: calc(var(--pk-pad, 3.1rem) + 3px); }
.${s}.is-narrow.is-flat.is-roomy .pk-layers { display: block; }
.${s}.is-narrow.is-flat.is-roomy .pk-swim { display: block; }
.${s}.is-narrow.is-flat.is-roomy .pk-swim[hidden] { display: none; }
/* Tight: the flat box of an 800 to 857 px window, 480 x 300 to 537 x 335, where the panel, 298 to 333 px
   tall, needs 322 for the longest fate. The rule and the heading over the fate go, since the fate's first
   word says what it is, and the panel's own padding halves. */
.${s}.is-narrow.is-flat.is-tight .pk-panel { padding-top: var(--space-1); padding-bottom: var(--space-1); }
.${s}.is-narrow.is-flat.is-tight .pk-foot > .cl-rule, .${s}.is-narrow.is-flat.is-tight .pk-foot > .cl-head { display: none; }
`;

export function mount(root, ctx) {
  const scope = 'tb-pro';
  const reduced = Boolean(ctx.reducedMotion);
  let palette = ctx.palette;
  let theme = ctx.theme;
  let t = ctx.pinnedTime ?? 0;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  const model = buildContents();

  const state = {
    envelope: 'gram-positive',
    solute: 1,
    appendages: new Set(['flagella']),
    stainFrom: Infinity,
    selected: null,
  };
  // envelope, treatment and growth changes are stamped so the wall's damage integrates over what the
  // reader actually did, and setTime(t) can replay it.
  let actions = [{ at: 0, kind: 'envelope', value: 'gram-positive' }];

  // ----- DOM -----
  const wrap = h('div', { class: scope });
  wrap.append(h('style', { text: CSS(scope) }));

  const canvas = h('canvas', {
    tabindex: 0,
    role: 'img',
    'aria-label': 'A prokaryotic cell in section with its envelope magnified beside it. Tab to the buttons to change the envelope, stain it, attack the wall and change the medium.',
  });
  const stainChip = h('span', { class: 'fig-chip fig-ui pk-stainchip', hidden: true, 'aria-live': 'polite' });
  const card = h('div', { class: 'fig-card pk-card', hidden: true });
  const stage = h('div', { class: 'pk-stage' }, [canvas, stainChip, card]);

  const mini = (label, short, onClick, cls = '') => {
    const b = h('button', { class: `cl-mini ${cls}`, type: 'button', 'aria-pressed': 'false', 'aria-label': label }, [
      h('span', { class: 'pk-long', text: label }),
      h('span', { class: 'pk-short', text: short ?? label }),
    ]);
    b.addEventListener('click', onClick);
    return b;
  };

  const envButtons = ENV_IDS.map((id) => mini(ENVELOPES[id].label, ENVELOPES[id].short, () => setEnvelope(id)));
  const treatButtons = Object.entries(TREATMENTS).map(([id, tr]) => mini(tr.label, tr.short, () => setTreatment(id), 'is-warn'));
  const btnHeal = mini('None', null, () => setTreatment(null));
  const btnGrow = mini('Growing', 'Grow', () => setGrowing(!current().grow));
  const appButtons = APPENDAGES.map((id) => mini(APPENDAGE_LABEL[id], null, () => {
    if (state.appendages.has(id)) state.appendages.delete(id);
    else state.appendages.add(id);
    syncButtons();
    draw();
  }));

  const soluteVal = h('span', { class: 'cl-val' });
  const soluteInput = h('input', {
    type: 'range', class: 'fig-range', min: 0, max: 200, step: 1, value: '100',
    'aria-label': 'Solute outside, relative to the cytoplasm',
  });
  soluteInput.addEventListener('input', () => {
    state.solute = Number(soluteInput.value) / 100;
    draw();
  });
  const soluteRow = h('div', { class: 'cl-slider' }, [
    h('label', {}, [h('span', { class: 'pk-long', text: 'Solute outside · 1.0 is isotonic' }), h('span', { class: 'pk-short', text: 'Solute outside' })]),
    soluteVal, soluteInput,
  ]);

  const fate = h('p', { class: 'pk-fate', 'aria-live': 'polite' });
  const swim = h('p', { class: 'pk-swim' });
  const layersLine = h('p', { class: 'pk-layers' });

  const block = (title, children) => h('div', { class: 'pk-block' }, [h('p', { class: 'cl-head', text: title }), ...children]);
  const panel = h('div', { class: 'cl-panel pk-panel' }, [
    block('Envelope', [h('div', { class: 'cl-group' }, envButtons), layersLine]),
    h('div', { class: 'pk-two' }, [
      block('Outside', [soluteRow]),
      block('Add', [h('div', { class: 'cl-group' }, appButtons)]),
    ]),
    block('Attack the wall', [h('div', { class: 'cl-group' }, [...treatButtons, btnHeal, btnGrow])]),
    h('div', { class: 'pk-foot' }, [h('div', { class: 'cl-rule' }), h('p', { class: 'cl-head', text: 'The cell' }), fate, swim]),
  ]);

  const btnStain = h('button', { class: 'fig-btn', type: 'button' }, [
    h('span', { class: 'pk-long', text: 'Run the gram stain' }),
    h('span', { class: 'pk-short', text: 'Gram stain' }),
  ]);
  btnStain.setAttribute('aria-label', 'Run the gram stain');
  btnStain.addEventListener('click', () => {
    state.stainFrom = Number.isFinite(state.stainFrom) ? Infinity : t;
    if (reduced && Number.isFinite(state.stainFrom)) t += STAIN_TOTAL;
    schedule();
    draw();
  });
  const btnReset = h('button', { class: 'fig-btn', type: 'button', text: 'Reset' });
  btnReset.setAttribute('aria-label', 'Reset the cell');
  btnReset.addEventListener('click', () => {
    actions = [{ at: t, kind: 'envelope', value: state.envelope }];
    state.stainFrom = Infinity;
    state.solute = 1;
    soluteInput.value = '100';
    state.selected = null;
    syncButtons();
    draw();
  });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [btnStain, btnReset]);

  wrap.append(stage, panel, toolbar);
  root.append(wrap);

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('this figure draws its cell on a 2D canvas and the browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // ----- the wall's state, integrated over the reader's actions -----
  function damageRate(env, treat, grow) {
    if (!treat) return 0;
    const tr = TREATMENTS[treat];
    if (tr.needsPg && ENVELOPES[env].pgNm === 0) return 0; // no peptidoglycan, nothing to attack
    if (tr.needsGrowth && !grow) return 0; // penicillin blocks new cross-links; an idle cell makes none
    return 1 / tr.seconds;
  }
  function current(tNow = t) {
    let env = 'gram-positive';
    let treat = null;
    let grow = false;
    let damage = 0;
    let brokeAt = Infinity;
    let lastT = 0;
    const step = (to) => {
      const rate = damageRate(env, treat, grow);
      if (rate > 0 && damage < 1 && to > lastT) {
        const need = (1 - damage) / rate;
        if (lastT + need <= to) brokeAt = Math.min(brokeAt, lastT + need);
      }
      damage = Math.min(4, damage + rate * Math.max(0, to - lastT));
      lastT = to;
    };
    for (const a of actions) {
      if (a.at > tNow) break;
      step(a.at);
      if (a.kind === 'envelope') { env = a.value; damage = 0; brokeAt = Infinity; treat = null; }
      else if (a.kind === 'treatment') { treat = a.value; if (!a.value) { damage = 0; brokeAt = Infinity; } }
      else if (a.kind === 'growing') grow = a.value;
    }
    step(tNow);
    return { env, treat, grow, damage, brokeAt, intact: damage < 1 };
  }

  function record(kind, value) {
    actions = actions.filter((a) => a.at <= t + 1e-9);
    actions.push({ at: t, kind, value });
  }
  function setEnvelope(id) {
    state.envelope = id;
    record('envelope', id);
    state.stainFrom = Infinity;
    state.selected = null;
    syncButtons();
    schedule();
    draw();
  }
  function setTreatment(id) {
    record('treatment', id);
    syncButtons();
    schedule();
    draw();
  }
  function setGrowing(v) {
    record('growing', v);
    syncButtons();
    schedule();
    draw();
  }

  // ----- the cell's fate -----
  function fateOf(tNow = t) {
    const w = current(tNow);
    const c = state.solute;
    const intact = w.intact;
    if (c > 1.15) return { fate: 'plasmolysed', burst: 0, swell: 1 };
    if (intact) return { fate: 'intact', burst: 0, swell: 1 };
    // No wall. In a dilute medium water floods in, the cell rounds up, swells and bursts; near
    // isotonic it survives as a round protoplast.
    const since = Math.max(0, tNow - w.brokeAt);
    if (c < 0.85) {
      const burst = clamp01((since - 1.0) / 1.4);
      return { fate: burst >= 1 ? 'lysed' : burst > 0 ? 'lysed' : 'swollen', burst, swell: 1 + 0.34 * clamp01(since / 1.0) };
    }
    return { fate: 'swollen', burst: 0, swell: 1 + 0.1 * clamp01(since / 1.0) };
  }

  // ----- the stain -----
  function stainState(tNow = t) {
    if (!Number.isFinite(state.stainFrom) || tNow < state.stainFrom) return { phase: null, colour: null, label: null, p: 0 };
    const e = tNow - state.stainFrom;
    const holds = ENVELOPES[state.envelope].pgNm >= 10; // only a thick mesh keeps the complex
    const step = STAIN_STEPS.find((s) => e < s.until) ?? STAIN_STEPS[STAIN_STEPS.length - 1];
    const p = clamp01((e - step.at) / (step.until - step.at));
    if (step.id === 'crystal-violet') return { phase: step.id, colour: 'purple', label: step.label, p, violet: p, pink: 0 };
    if (step.id === 'iodine') return { phase: step.id, colour: 'purple', label: 'Iodine fixes the dye as a large complex', p, violet: 1, pink: 0 };
    if (step.id === 'alcohol') {
      const v = holds ? 1 : 1 - p;
      return {
        phase: step.id,
        colour: holds ? 'purple' : v > 0.25 ? 'purple' : 'none',
        label: holds ? 'The alcohol wash: the mesh shrinks and holds the complex' : 'The alcohol wash: the outer membrane dissolves and the dye runs out',
        p,
        violet: v,
        pink: 0,
      };
    }
    const v = holds ? 1 : 0;
    return {
      phase: step.id,
      colour: holds ? 'purple' : 'pink',
      label: holds ? 'Safranin cannot show over the violet: gram-positive' : 'Safranin counterstains the colourless cell: gram-negative',
      p,
      violet: v,
      pink: holds ? 0 : p,
    };
  }

  // ----- swimming -----
  function motion(tNow = t) {
    if (!state.appendages.has('flagella')) return { kind: 'none', x: 0, y: 0, angle: 0, reversals: 0, spin: 0 };
    const f = fateOf(tNow);
    if (f.fate === 'lysed' || f.fate === 'plasmolysed') return { kind: 'none', x: 0, y: 0, angle: 0, reversals: 0, spin: 0 };
    let x = 0;
    let y = 0;
    let angle = 0;
    let reversals = 0;
    for (const ph of model.phases) {
      if (ph.from > tNow) break;
      const to = Math.min(ph.to, tNow);
      if (ph.kind === 'run') {
        x += Math.cos(angle) * SWIM_NM_PER_S * (to - ph.from);
        y += Math.sin(angle) * SWIM_NM_PER_S * (to - ph.from) * 0.35;
      } else {
        reversals += ph.to <= tNow ? 1 : 0;
        const p = clamp01((to - ph.from) / (ph.to - ph.from));
        angle = lerp(angle, ph.dir, p);
      }
      if (ph.to > tNow) {
        const cur = model.phases.find((q) => tNow >= q.from && tNow < q.to);
        return { kind: cur?.kind === 'tumble' ? 'tumble' : 'run', x, y, angle, reversals, spin: tNow };
      }
    }
    return { kind: 'run', x, y, angle, reversals, spin: tNow };
  }

  // ----- layout -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let narrow = null;
  let short = null;
  let flat = null;
  let roomy = null;
  let tight = null;
  let padPx = 0;
  let hits = [];

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const wantNarrow = w < NARROW_W || hh < NARROW_H;
    // A narrow box wider than it is tall takes the flat layout (see the CSS); a phone's tall one stacks.
    // The flat layout's column is at most 300 px wide, too narrow for the long button labels at any width.
    const wantFlat = wantNarrow && w > hh;
    const wantShort = w < SHORT_W || wantFlat;
    const wantRoomy = wantFlat && hh >= 440;
    const wantTight = wantFlat && hh < 336;
    if (wantNarrow !== narrow || wantShort !== short || wantFlat !== flat || wantRoomy !== roomy || wantTight !== tight) {
      narrow = wantNarrow;
      short = wantShort;
      flat = wantFlat;
      roomy = wantRoomy;
      tight = wantTight;
      wrap.classList.toggle('is-narrow', narrow);
      wrap.classList.toggle('is-short', short);
      wrap.classList.toggle('is-flat', flat);
      wrap.classList.toggle('is-roomy', roomy);
      wrap.classList.toggle('is-tight', tight);
    }
    // At least 232 px, the width that holds the three envelope buttons on one row: at 220 the third went
    // to a second row, and the panel of a 480 x 300 box ran 53 px past its foot with the longest fate.
    if (flat) wrap.style.setProperty('--pk-side', `${Math.round(clamp(w * 0.44, 232, 300))}px`);
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 22;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--pk-pad', `${pad}px`);
    }
    return true;
  }
  // The canvas's own box, not its stage's. The stage's padding is outside the canvas, and a backing store
  // sized to the whole stage was shrunk into the canvas, so every word was drawn smaller than its font and
  // a click landed a few pixels from the part it hit.
  function sizeCanvas() {
    const r = canvas.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const f = fitCanvas(canvas, w, hh);
    cw = w;
    ch = hh;
    dpr = f.dpr;
    return true;
  }

  // ---------- drawing ----------

  function colours() {
    const p = palette;
    const O = ORGANELLE_BY_ID;
    return {
      medium: mix(p.paper, p.water, 0.10),
      cyto: mix(p.paper, O.cytoplasm.color, 0.8),
      membrane: O.membrane.color,
      wall: CELL_COLOUR.wall,
      wallLine: CELL_COLOUR.wallLine,
      lps: CELL_COLOUR.lps,
      sLayer: CELL_COLOUR.sLayer,
      capsule: CELL_COLOUR.capsule,
      nucleoid: CELL_COLOUR.nucleoid,
      plasmid: CELL_COLOUR.plasmid,
      ribosome: O.ribosome.color,
      pilus: CELL_COLOUR.pilus,
      flagellum: CELL_COLOUR.flagellum,
      motor: CELL_COLOUR.motor,
      periplasm: mix(p.paper, p.water, 0.2),
      ink: p.ink,
      soft: p.inkSoft,
      faint: p.inkFaint,
      rule: p.rule,
      violet: p.violet,
      pink: mix(p.coral, p.violet, 0.18),
    };
  }

  // The cell, in section: concentric rounded capsules for the envelope at their true thickness, then
  // the contents. Returns the hit regions it drew.
  function drawCell(cx, cy, scale, C, st) {
    const env = ENVELOPES[st.env];
    const f = st.f;
    const round = 1 - clamp01((f.swell - 1) / 0.34) * 0.0; // a swelling cell rounds up
    const roundness = clamp01((f.swell - 1) / 0.34);
    const len = lerp(CELL_LEN, CELL_LEN * 0.72, roundness) * f.swell;
    const wid = lerp(CELL_W, CELL_W * 1.45, roundness) * f.swell;
    void round;
    const stain = st.stain;
    const burst = f.burst;

    const capsuleOn = state.appendages.has('capsule');
    const total = layerTotal(st.env, st.damage);
    const outer = (capsuleOn ? CAPSULE_NM : 0) + total;

    const shell = (inset, path = true) => {
      const w = Math.max(2, len / 2 + outer - inset);
      const hgt = Math.max(2, wid / 2 + outer - inset);
      if (path) roundRectPath(g, cx - w * scale, cy - hgt * scale, w * 2 * scale, hgt * 2 * scale, Math.min(w, hgt) * scale);
      return { w, h: hgt };
    };

    g.save();
    if (burst > 0) {
      // A lysing cell: the envelope tears and the contents spill. The tear opens from the middle of the
      // long side, which is where the pressure finds the weakest point.
      g.globalAlpha = 1 - burst * 0.55;
    }

    // --- appendages that sit behind the cell ---
    if (state.appendages.has('pili') && burst < 0.6) drawPili(cx, cy, len, wid, outer, scale, C, st);
    if (state.appendages.has('flagella') && burst < 0.6) drawFlagellum(cx, cy, len, wid, outer, scale, C, st);

    // --- capsule ---
    if (capsuleOn) {
      shell(0);
      g.fillStyle = alpha(C.capsule, 0.55);
      g.fill();
      g.strokeStyle = alpha(C.capsule, 0.9);
      g.setLineDash([5, 4]);
      g.lineWidth = 1;
      g.stroke();
      g.setLineDash([]);
      hits.push({ id: 'capsule', x: cx, y: cy - (wid / 2 + outer - CAPSULE_NM / 2) * scale, r: Math.max(8, (CAPSULE_NM / 2) * scale) });
    }

    // --- the envelope, outside in ---
    let inset = capsuleOn ? CAPSULE_NM : 0;
    // Plasmolysis pulls the membrane and everything inside it away from the wall.
    const gap = f.fate === 'plasmolysed' ? clamp(( state.solute - 1.15) * 900, 0, 190) : 0;
    for (const layer of layersOf(st.env, st.damage)) {
      const isInner = layer.id === 'membrane';
      const extra = isInner ? gap : 0;
      shell(inset + extra);
      const col = layer.colour === 'periplasm' ? C.periplasm
        : layer.colour === 'wall' ? C.wall
          : layer.colour === 'sLayer' ? C.sLayer
            : C.membrane;
      g.fillStyle = col;
      g.fill();
      const px = Math.max(6, layer.nm * scale);
      hits.push({ id: layer.id, x: cx - (len / 2 + outer - inset - layer.nm / 2) * scale, y: cy, r: Math.max(7, px) });
      if (layer.lps && layer.nm * scale > 2) drawLps(cx, cy, shell(inset, false), scale, C);
      inset += layer.nm;
    }
    // the wall's mesh, where it is thick enough to draw
    const nowLayers = layersOf(st.env, st.damage);
    const wallLayer = nowLayers.find((l) => l.id === 'wall');
    if (wallLayer && wallLayer.nm * scale >= 4) {
      const before = nowLayers.slice(0, nowLayers.indexOf(wallLayer)).reduce((a, l) => a + l.nm, 0);
      drawMesh(cx, cy, (capsuleOn ? CAPSULE_NM : 0) + before, wallLayer.nm, len, wid, outer, scale, C, st);
    }

    // --- the cytoplasm and its contents ---
    shell(inset + gap);
    g.fillStyle = C.cyto;
    g.fill();
    g.save();
    g.clip();
    const spill = burst > 0 ? burst : 0;
    drawContents(cx, cy, scale, C, st, spill, roundness);
    g.restore();
    hits.push({ id: 'cytoplasm', x: cx + len * 0.3 * scale, y: cy + wid * 0.3 * scale, r: 16 });

    // the stain, over everything inside the outermost wall layer
    if (stain && (stain.violet > 0.01 || stain.pink > 0.01)) {
      shell(capsuleOn ? CAPSULE_NM : 0);
      g.fillStyle = stain.violet > 0.01 ? alpha(C.violet, 0.62 * stain.violet) : alpha(C.pink, 0.6 * stain.pink);
      g.fill();
    }

    // the outline
    shell(capsuleOn ? CAPSULE_NM : 0);
    g.strokeStyle = mix(C.ink, C.medium, 0.45);
    g.lineWidth = 1.1;
    g.stroke();
    g.restore();

    if (burst > 0) drawBurst(cx, cy, len, wid, outer, scale, C, burst);
    return { len, wid, outer };
  }

  // The medium, with its solute drawn in proportion to the slider. The number of particles on screen is
  // literally `solute` times the number the cytoplasm carries, so which side is the concentrated one is
  // something the reader can see rather than something the readout asserts.
  function drawMedium(box, C) {
    const n = Math.round(model.solutes.length * clamp01(state.solute / 2));
    g.fillStyle = alpha(mix(C.medium, palette.water, 0.7), 0.5);
    for (let i = 0; i < n; i += 1) {
      const [u, v] = model.solutes[i];
      g.beginPath();
      g.arc(box.x + u * box.w, box.y + v * box.h, 2.1, 0, TAU);
      g.fill();
    }
  }

  // Which way water is going, and how hard. Four arrows across the envelope, their length set by how far
  // the medium is from isotonic, and never longer than the drawing has room for above and below the cell:
  // on a phone the full length ran off the top of the canvas, and the label with it.
  function drawOsmosis(cx, cy, scale, C, st, box) {
    const drive = state.solute - 1;
    if (Math.abs(drive) < 0.06) return;
    const inward = drive < 0;
    const mag = clamp(Math.abs(drive), 0, 1);
    const env = ENVELOPES[st.env];
    const outer = (state.appendages.has('capsule') ? CAPSULE_NM : 0) + layerTotal(st.env, st.damage);
    const len = lerp(CELL_LEN, CELL_LEN * 0.72, clamp01((st.f.swell - 1) / 0.34)) * st.f.swell;
    const wid = lerp(CELL_W, CELL_W * 1.45, clamp01((st.f.swell - 1) / 0.34)) * st.f.swell;
    void env;
    const top = cy - (wid / 2 + outer) * scale;
    const bottom = cy + (wid / 2 + outer) * scale;
    const room = Math.min(top - box.y - 18, box.y + box.h - bottom - 2);
    const arrow = clamp(20 + 34 * mag, 10, Math.max(10, room));
    g.strokeStyle = palette.water;
    g.fillStyle = palette.water;
    g.lineWidth = 1.6;
    for (const [ux, uy] of [[-0.62, -1], [0.62, -1], [-0.62, 1], [0.62, 1]]) {
      const px = cx + ux * (len / 2) * scale;
      const py = cy + uy * (wid / 2 + outer) * scale;
      // Outside the envelope, where the water is, running in or out. The sign was flipped for water coming
      // in, which drew those arrows inside the cell pointing out, under the words "water in".
      const dy = uy;
      const from = { x: px, y: py + dy * (inward ? arrow : 4) };
      const to = { x: px, y: py + dy * (inward ? 4 : arrow) };
      g.beginPath();
      g.moveTo(from.x, from.y);
      g.lineTo(to.x, to.y);
      g.stroke();
      const s2 = Math.sign(to.y - from.y) || 1;
      g.beginPath();
      g.moveTo(to.x, to.y);
      g.lineTo(to.x - 4, to.y - s2 * 6);
      g.lineTo(to.x + 4, to.y - s2 * 6);
      g.closePath();
      g.fill();
    }
    g.font = `600 10px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillStyle = mix(palette.water, palette.ink, 0.3);
    // Above the arrows where there is room, and otherwise between the two upper ones, halfway up them.
    const over = top - arrow - 8;
    g.fillText(inward ? 'water in' : 'water out', cx, over - 8 >= box.y + 2 ? over : Math.max(box.y + 10, top - arrow / 2 + 3.5));
  }

  function drawLps(cx, cy, box, scale, C) {
    // Short sugar chains standing off the outer face of the outer membrane.
    const n = 80;
    g.strokeStyle = C.lps;
    g.lineWidth = Math.max(0.7, 2.5 * scale);
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * TAU;
      const ex = Math.cos(a);
      const ey = Math.sin(a);
      const px = cx + ex * box.w * scale;
      const py = cy + ey * box.h * scale;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px + ex * 7 * scale, py + ey * 7 * scale);
      g.stroke();
    }
  }

  function drawMesh(cx, cy, before, nm, len, wid, outer, scale, C, st) {
    const rOut = { w: len / 2 + outer - before, h: wid / 2 + outer - before };
    const rIn = { w: rOut.w - nm, h: rOut.h - nm };
    const step = Math.max(7, 26 * scale) / scale;
    g.save();
    roundRectPath(g, cx - rOut.w * scale, cy - rOut.h * scale, rOut.w * 2 * scale, rOut.h * 2 * scale, Math.min(rOut.w, rOut.h) * scale);
    g.clip();
    g.strokeStyle = alpha(C.wallLine, st.damage > 0 ? Math.max(0.15, 0.6 - st.damage * 0.5) : 0.6);
    g.lineWidth = Math.max(0.6, 2 * scale);
    const per = Math.max(10, Math.round((rOut.w + rOut.h) * 2 / step));
    for (let i = 0; i < per; i += 1) {
      const a = (i / per) * TAU;
      const ex = Math.cos(a);
      const ey = Math.sin(a);
      g.beginPath();
      g.moveTo(cx + ex * rOut.w * scale, cy + ey * rOut.h * scale);
      g.lineTo(cx + ex * rIn.w * scale, cy + ey * rIn.h * scale);
      g.stroke();
    }
    g.restore();
  }

  function drawContents(cx, cy, scale, C, st, spill, roundness) {
    const push = 1 + spill * 1.7;
    // ribosomes
    g.fillStyle = C.ribosome;
    for (const [x, y, r] of model.ribos) {
      g.beginPath();
      g.arc(cx + x * scale * push * (1 - roundness * 0.2), cy + y * scale * push, Math.max(0.9, r * scale), 0, TAU);
      g.fill();
    }
    hits.push({ id: 'ribosome', x: cx + model.ribos[0][0] * scale, y: cy + model.ribos[0][1] * scale, r: 10 });
    // The nucleoid drifts outward a little and fades as the cell empties, rather than being stretched
    // into a starburst by the factor that throws the loose ribosomes about.
    const nPush = 1 + spill * 0.45;
    g.globalAlpha = 1 - spill * 0.85;
    g.beginPath();
    const L = model.loop;
    g.moveTo(cx + L[0][0] * scale * nPush, cy + L[0][1] * scale * nPush);
    for (let i = 1; i < L.length; i += 1) g.lineTo(cx + L[i][0] * scale * nPush, cy + L[i][1] * scale * nPush);
    g.closePath();
    g.strokeStyle = C.nucleoid;
    g.lineWidth = Math.max(1.1, 16 * scale);
    g.lineJoin = 'round';
    g.stroke();
    g.strokeStyle = alpha(C.nucleoid, 0.16);
    g.lineWidth = Math.max(3, 150 * scale);
    g.stroke();
    g.globalAlpha = 1;
    hits.push({ id: 'nucleoid', x: cx, y: cy, r: Math.max(14, 150 * scale) });
    // plasmids
    g.globalAlpha = 1 - spill * 0.85;
    g.strokeStyle = C.plasmid;
    g.lineWidth = Math.max(1, 13 * scale);
    for (const pl of model.plasmids) {
      g.beginPath();
      for (let i = 0; i <= 36; i += 1) {
        const a = (i / 36) * TAU;
        const rr = pl.r * (1 + 0.22 * Math.sin(3 * a + pl.wob));
        const x = cx + (pl.c[0] + Math.cos(a + pl.rot) * rr) * scale * nPush;
        const y = cy + (pl.c[1] + Math.sin(a + pl.rot) * rr * 0.8) * scale * nPush;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.stroke();
      hits.push({ id: 'plasmid', x: cx + pl.c[0] * scale * nPush, y: cy + pl.c[1] * scale * nPush, r: Math.max(9, pl.r * scale) });
    }
    g.globalAlpha = 1;
  }

  function drawBurst(cx, cy, len, wid, outer, scale, C, burst) {
    const n = 26;
    const rng = mulberry32(SEED + 3);
    g.fillStyle = C.ribosome;
    for (let i = 0; i < n; i += 1) {
      const a = rng() * TAU;
      const d = (wid / 2 + outer) * (1 + burst * (0.4 + rng() * 2.2));
      g.globalAlpha = (1 - burst) * 0.8;
      g.beginPath();
      g.arc(cx + Math.cos(a) * d * scale * 1.5, cy + Math.sin(a) * d * scale, Math.max(1, 13 * scale), 0, TAU);
      g.fill();
    }
    g.globalAlpha = 1;
    // the torn envelope
    g.strokeStyle = C.membrane;
    g.lineWidth = Math.max(1.2, 10 * scale);
    g.setLineDash([Math.max(3, 40 * scale), Math.max(3, 30 * scale)]);
    g.beginPath();
    const w = (len / 2 + outer) * scale * (1 + burst * 0.25);
    const hgt = (wid / 2 + outer) * scale * (1 + burst * 0.5);
    g.ellipse(cx, cy, w, hgt, 0, 0, TAU);
    g.globalAlpha = 1 - burst * 0.4;
    g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 1;
  }

  function drawFlagellum(cx, cy, len, wid, outer, scale, C, st) {
    const m = st.m;
    const x0 = cx - (len / 2 + outer) * scale;
    const y0 = cy;
    // A real filament is several micrometres of rigid helix with a pitch near 2.3 µm. It is drawn at
    // 3.4 µm so one full turn is in frame, and it is allowed to run off the edge.
    const L = 3400 * scale;
    const amp = 260 * scale;
    const k = 3400 / 2300;
    const phase = st.env === 'archaeal' ? m.spin * 9 : m.spin * 26;
    g.strokeStyle = C.flagellum;
    g.lineWidth = Math.max(1.2, (st.env === 'archaeal' ? 12 : 22) * scale);
    g.lineCap = 'round';
    for (const sgn of [-1, 1]) {
      if (st.env === 'archaeal' && sgn > 0) break;
      g.beginPath();
      for (let i = 0; i <= 60; i += 1) {
        const u = i / 60;
        const x = x0 - u * L;
        const wob = m.kind === 'tumble' ? 1.7 : 1;
        const y = y0 + sgn * 26 * scale * 4 * u + Math.sin(u * TAU * k - phase) * amp * u * wob;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    // the motor in the membrane
    const mr = Math.max(3, 90 * scale);
    g.fillStyle = C.motor;
    g.beginPath();
    g.arc(x0 + mr * 0.6, y0, mr, 0, TAU);
    g.fill();
    g.strokeStyle = mix(C.motor, C.ink, 0.4);
    g.lineWidth = Math.max(0.8, 8 * scale);
    for (let i = 0; i < 5; i += 1) {
      const a = phase * 0.5 + (i / 5) * TAU;
      g.beginPath();
      g.moveTo(x0 + mr * 0.6, y0);
      g.lineTo(x0 + mr * 0.6 + Math.cos(a) * mr * 0.8, y0 + Math.sin(a) * mr * 0.8);
      g.stroke();
    }
    hits.push({ id: st.env === 'archaeal' ? 'archaellum' : 'flagellum', x: x0 - L * 0.4, y: y0, r: Math.max(12, 200 * scale) });
    hits.push({ id: 'motor', x: x0 + mr * 0.6, y: y0, r: mr });
  }

  function drawPili(cx, cy, len, wid, outer, scale, C) {
    const rng = mulberry32(SEED + 11);
    g.strokeStyle = C.pilus;
    g.lineWidth = Math.max(0.7, 7 * scale);
    g.lineCap = 'round';
    let first = null;
    for (let i = 0; i < 34; i += 1) {
      const a = rng() * TAU;
      const ex = Math.cos(a);
      const ey = Math.sin(a);
      const px = cx + ex * (len / 2 + outer) * scale;
      const py = cy + ey * (wid / 2 + outer) * scale;
      const L = (260 + rng() * 280) * scale;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px + ex * L, py + ey * L * 1.3);
      g.stroke();
      if (!first) first = { x: px + ex * L * 0.6, y: py + ey * L * 0.8 };
    }
    if (first) hits.push({ id: 'pilus', x: first.x, y: first.y, r: 12 });
  }

  // The magnified envelope: the layers at their true relative thickness, big enough to read, with a
  // scale bar in nanometres and the names beside them.
  function drawCallout(box, C, st, vertical) {
    const env = { layers: layersOf(st.env, st.damage) };
    const total = Math.max(12, layerTotal(st.env, st.damage));
    const scaleW = 46; // room on the right for the nanometre bar and its label
    // Across the stage, one magnification for all three envelopes, set by the thickest and by the width
    // there is, so a strip's length is always its thickness: a cap on each strip alone would draw the
    // 27 nm envelope as long as the 37 nm one in a drawing under 235 px wide.
    const barPx = vertical ? Math.min(box.h - 40, total * 4.2) : total * Math.min(5, (box.w - 60) / MAX_NM);
    const px = barPx / total;
    const thick = vertical ? clamp(box.w * 0.32, 26, 54) : Math.min(46, box.h - 34);

    g.save();
    g.font = `9.5px ${FONT}`;
    g.textBaseline = 'middle';
    let at = 0;
    const labels = [];
    // Across, the outer membrane's sugar fringe stands 7 nm out past the strip's outer end, so the strip
    // starts that far in: from box.x + 4 the fringe ran off the canvas's left edge, 7 nm drawn as 2.
    const fringe = !vertical && env.layers[0]?.lps ? 7 * px : 0;
    const x0 = vertical ? box.x + box.w - thick - scaleW : box.x + 4 + fringe;
    const y0 = vertical ? box.y + (box.h - barPx) / 2 : box.y + 4;

    // the medium above the outermost layer
    g.fillStyle = C.medium;
    if (vertical) g.fillRect(x0, y0 - 10, thick, 10);
    else g.fillRect(x0 - 10, y0, 10, thick);

    for (const layer of env.layers) {
      const size = layer.nm * px;
      const col = layer.colour === 'periplasm' ? C.periplasm
        : layer.colour === 'wall' ? C.wall
          : layer.colour === 'sLayer' ? C.sLayer
            : C.membrane;
      g.fillStyle = col;
      if (vertical) g.fillRect(x0, y0 + at, thick, size);
      else g.fillRect(x0 + at, y0, size, thick);

      // the wall's mesh, the S-layer's lattice and the membrane's leaflets, at this magnification
      g.save();
      g.beginPath();
      if (vertical) g.rect(x0, y0 + at, thick, size);
      else g.rect(x0 + at, y0, size, thick);
      g.clip();
      if (layer.colour === 'wall') {
        // Glycan strands one way, peptide cross-links the other: a mesh, and the cross-links are what
        // penicillin stops being made and lysozyme is not even aiming at.
        const fade = st.damage > 0 ? Math.max(0.1, 0.8 - st.damage * 0.75) : 0.8;
        g.lineWidth = 1;
        const along = vertical ? thick : size;
        const across = vertical ? size : thick;
        for (let i = 0; i <= 10; i += 1) {
          const u = (i / 10) * along;
          g.strokeStyle = alpha(C.wallLine, fade);
          g.beginPath();
          if (vertical) { g.moveTo(x0 + u, y0 + at); g.lineTo(x0 + u, y0 + at + size); } else { g.moveTo(x0 + at + u, y0); g.lineTo(x0 + at + u, y0 + thick); }
          g.stroke();
        }
        const rungs = Math.max(2, Math.round(across / 7));
        for (let j = 1; j < rungs; j += 1) {
          const v = (j / rungs) * across;
          g.strokeStyle = alpha(C.wallLine, fade * 0.55);
          g.beginPath();
          if (vertical) { g.moveTo(x0, y0 + at + v); g.lineTo(x0 + thick, y0 + at + v); } else { g.moveTo(x0 + at, y0 + v); g.lineTo(x0 + at + size, y0 + v); }
          g.stroke();
        }
      } else if (layer.colour === 'sLayer') {
        g.strokeStyle = alpha(mix(C.sLayer, C.ink, 0.5), 0.8);
        g.lineWidth = 1;
        for (let i = 0; i < 26; i += 1) {
          const u = (i / 26) * (vertical ? thick : size);
          g.beginPath();
          if (vertical) { g.moveTo(x0 + u, y0 + at); g.lineTo(x0 + u + 6, y0 + at + size); } else { g.moveTo(x0 + at + (i / 26) * size, y0); g.lineTo(x0 + at + (i / 26) * size + 6, y0 + thick); }
          g.stroke();
        }
      } else if (layer.colour === 'membrane') {
        // two leaflets: a pale band down the middle of the bilayer
        g.fillStyle = alpha(mix(C.membrane, C.medium, 0.55), 0.9);
        if (vertical) g.fillRect(x0, y0 + at + size * 0.36, thick, size * 0.28);
        else g.fillRect(x0 + at + size * 0.36, y0, size * 0.28, thick);
      }
      g.restore();
      if (layer.lps) {
        g.strokeStyle = C.lps;
        g.lineWidth = 1.2;
        for (let i = 0; i < 16; i += 1) {
          const u = (i / 16) * thick + thick / 32;
          g.beginPath();
          if (vertical) { g.moveTo(x0 + u, y0 + at); g.lineTo(x0 + u, y0 + at - 7 * px); } else { g.moveTo(x0 - 7 * px, y0 + u); g.lineTo(x0, y0 + u); }
          g.stroke();
        }
      }

      labels.push({ layer, mid: at + size / 2, size });
      at += size;
    }

    // The names, laid out afterwards so two thin layers cannot write over each other. Down the side, each
    // is placed at its own layer's midpoint, then pushed down until it clears the one above, with a leader
    // back. Across the stage a name is wider than most layers, and centring each on its own layer wrote
    // "Quasi-periplasm" over both its neighbours and dropped the gram-negative wall's name altogether. So
    // across, the gaps between membranes are drawn and not named, as the panel's list of layers does not
    // name them either, and the names are spread along the strip, each as near its own layer as the
    // others allow, with a leader up to it when it had to move.
    g.font = `9.5px ${FONT}`;
    if (vertical) {
      let lastY = -Infinity;
      for (const L of labels) {
        const want = y0 + L.mid;
        const place = Math.max(want, lastY + 21);
        lastY = place;
        g.textAlign = 'right';
        g.fillStyle = C.soft;
        g.fillText(L.layer.name, x0 - 9, place - 5);
        g.fillStyle = C.faint;
        g.fillText(nmText(L.layer.nm), x0 - 9, place + 5);
        if (Math.abs(place - want) > 1.5) {
          g.strokeStyle = C.rule;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x0 - 7, place);
          g.lineTo(x0, want);
          g.stroke();
        }
      }
    } else {
      const named = labels.filter((L) => L.layer.colour !== 'periplasm');
      const words = named.map((L) => L.layer.name.split(' ')[0]);
      const sizes = named.map((L) => nmText(L.layer.nm));
      const widths = named.map((L, i) => Math.max(g.measureText(words[i]).width, g.measureText(sizes[i]).width));
      const want = named.map((L) => x0 + L.mid);
      const at2 = spread(want, widths, box.x + 2, box.x + box.w - 2, 6) ?? want;
      g.textAlign = 'center';
      for (const [i, x] of at2.entries()) {
        g.fillStyle = C.soft;
        g.fillText(words[i], x, y0 + thick + 12);
        g.fillStyle = C.faint;
        g.fillText(sizes[i], x, y0 + thick + 23);
        if (Math.abs(x - want[i]) > 2) {
          g.strokeStyle = C.rule;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(want[i], y0 + thick + 1);
          g.lineTo(x, y0 + thick + 6);
          g.stroke();
        }
      }
    }

    // the cytoplasm under the innermost layer
    g.fillStyle = C.cyto;
    if (vertical) g.fillRect(x0, y0 + at, thick, 12);
    else g.fillRect(x0 + at, y0, 12, thick);

    // the scale bar
    g.strokeStyle = C.soft;
    g.lineWidth = 1.6;
    g.beginPath();
    if (vertical) {
      const sx = x0 + thick + 5;
      g.moveTo(sx, y0);
      g.lineTo(sx, y0 + 20 * px);
      g.stroke();
      g.textAlign = 'left';
      g.fillStyle = C.soft;
      g.font = `600 9.5px ${FONT}`;
      g.fillText('20 nm', sx + 4, y0 + 10 * px);
    } else {
      // Above the strip, at its cytoplasm end: below it the layer names already have the line, and at the
      // outer end the leader from the cell lands. The bar is never longer than the strip, and its label
      // stands past the strip's end: 20 nm reaching back from a 7 nm membrane, with its label beyond that,
      // left the canvas.
      const sy = y0 - 5;
      const barNm = [20, 10, 5, 2, 1].find((n) => n * px <= at) ?? 1;
      g.moveTo(x0 + at - barNm * px, sy);
      g.lineTo(x0 + at, sy);
      g.stroke();
      g.textAlign = 'left';
      g.fillStyle = C.soft;
      g.font = `600 9.5px ${FONT}`;
      g.fillText(`${barNm} nm`, x0 + at + 5, sy);
    }
    g.restore();
    return { x0, y0, thick, barPx, vertical };
  }

  function draw() {
    if (!cw) return;
    hits = [];
    const C = colours();
    const w = current();
    const f = fateOf();
    const stain = stainState();
    const m = motion();
    const st = { env: w.env, damage: w.damage, f, stain, m };

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = C.medium;
    g.fillRect(0, 0, cw, ch);

    // the callout takes a strip of the stage; the cell gets the rest
    const vertical = !narrow;
    const calloutW = clamp(cw * 0.3, 172, 230);
    const callout = vertical
      ? { x: cw - calloutW - 4, y: 8, w: calloutW, h: ch - 16 }
      : { x: 6, y: ch - 62, w: cw - 12, h: 58 };
    const cellBox = vertical
      ? { x: 0, y: 0, w: cw - calloutW - 10, h: ch }
      : { x: 0, y: 0, w: cw, h: ch - 70 };

    // the cell, at a scale that fits it in its box with room for the flagellum and the capsule
    const capsuleOn = state.appendages.has('capsule');
    const outer = (capsuleOn ? CAPSULE_NM : 0) + layerTotal(w.env, w.damage);
    // A flagellar filament is several times the length of the cell, so it is drawn long and allowed to
    // run off the edge of the frame; only a stub of it is reserved for. Reserving 620 nm of it, and a
    // fifth of the cell's length each side, left the cell 230 px long in a 614 px pane.
    const flag = state.appendages.has('flagella') ? 300 : 120;
    const needW = CELL_LEN * 1.1 + outer * 2 + flag;
    // A cell losing its wall in a dilute medium rounds up and swells to 1.94 times its width (fateOf), so
    // from the moment the reader sets that up its box is kept for the swollen cell: kept for the rod alone,
    // the swollen cell ran off the top of a phone's drawing. The burst's ring and debris may still fly out.
    const swells = state.solute < 0.85 && (!w.intact || damageRate(w.env, w.treat, w.grow) > 0);
    const needH = CELL_W * (swells ? 2.1 : 1.42) + outer * 2 + (state.appendages.has('pili') ? 700 : 0);
    // Never below zero. Before the flat layout an 800 to 860 px window left the drawing 27 to 65 px tall,
    // less than the 90 px the cell's box and its pad take, and a negative scale made the torn envelope's
    // ellipse throw (docs/work/2_rest-of-the-book/reviews/2026-09-25-wide-band-probe.md).
    const scale = Math.max(0, Math.min((cellBox.w - 20) / needW, (cellBox.h - 20) / needH));
    // The cell swims across the field and comes back round; the wrap is centred on zero so a pinned
    // frame at t = 0 has it in the middle.
    const span = CELL_LEN * 2.4;
    const swimX = state.appendages.has('flagella') ? ((m.x + span / 2) % span + span) % span - span / 2 : 0;
    // Across a narrow box it swings only as far as the box has room for: in the flat box of an 800 to
    // 1231 px window, whose width sets the scale, the full swing carried the cell's far end 20 px past the
    // canvas's edge. The wide layout keeps the swing it was drawn with.
    const room = vertical ? Infinity : Math.max(0, cellBox.w / 2 - 10 - (CELL_LEN / 2 + outer) * scale - flag * scale * 0.5);
    const swing = Math.min((span / 2) * scale * 0.2, room);
    const cx = cellBox.x + cellBox.w / 2 + flag * scale * 0.5 + (swimX / (span / 2)) * swing;
    const cy = cellBox.y + cellBox.h / 2 + (state.appendages.has('flagella') ? Math.sin(m.y / 3000) * cellBox.h * 0.1 : 0);
    drawMedium(cellBox, C);
    drawCell(cx, cy, scale, C, st);
    drawOsmosis(cx, cy, scale, C, st, cellBox);

    // a leader from the cell's edge to the callout
    const geom = { len: CELL_LEN, wid: CELL_W, outer };
    g.strokeStyle = C.rule;
    g.lineWidth = 1;
    g.setLineDash([3, 3]);
    g.beginPath();
    if (vertical) {
      const ex = cx + (geom.len / 2 + outer) * scale * 0.72;
      const ey = cy - (geom.wid / 2 + outer) * scale;
      g.moveTo(ex, ey);
      g.lineTo(callout.x + 8, Math.max(callout.y + 10, ey - 40));
      g.stroke();
      g.beginPath();
      g.arc(ex, ey, 3, 0, TAU);
      g.fillStyle = palette.ruleStrong;
      g.fill();
    } else {
      // To the strip's outer end, where nothing is written: its scale bar and label sit at the other end.
      const ey = cy + (geom.wid / 2 + outer) * scale;
      g.moveTo(cx, ey);
      g.lineTo(callout.x + 6, callout.y + 2);
      g.stroke();
    }
    g.setLineDash([]);

    drawCallout(callout, C, st, vertical);

    // a frame round the drawing
    g.strokeStyle = palette.ruleStrong;
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, cw - 1, ch - 1);

    updatePanel(w, f, stain, m);
  }

  // ----- the readouts -----
  function syncButtons() {
    const w = current();
    for (const [i, b] of envButtons.entries()) b.setAttribute('aria-pressed', String(ENV_IDS[i] === state.envelope));
    const ids = Object.keys(TREATMENTS);
    for (const [i, b] of treatButtons.entries()) {
      b.setAttribute('aria-pressed', String(w.treat === ids[i]));
      const noPg = TREATMENTS[ids[i]].needsPg && ENVELOPES[state.envelope].pgNm === 0;
      b.disabled = noPg;
      b.title = noPg ? 'An archaeon has no peptidoglycan, so this does nothing' : '';
    }
    btnHeal.setAttribute('aria-pressed', String(!w.treat));
    btnGrow.setAttribute('aria-pressed', String(w.grow));
    for (const [i, b] of appButtons.entries()) b.setAttribute('aria-pressed', String(state.appendages.has(APPENDAGES[i])));
  }

  function updatePanel(w, f, stain, m) {
    const env = ENVELOPES[w.env];
    soluteVal.textContent = state.solute.toFixed(2);
    layersLine.innerHTML = `Outside in: <b>${wallLayers().join(' · ')}</b> · peptidoglycan <b>${w.intact ? env.pgNm : 0} nm</b>${
      !w.intact && env.pgNm > 0 ? ' — gone' : ''}.<br>${env.note}`;

    const treat = w.treat ? TREATMENTS[w.treat].label.toLowerCase() : null;
    const fateWord = f.fate;
    let why;
    if (fateWord === 'lysed') why = 'the wall is gone and the medium is dilute, so water floods in until the membrane gives way';
    else if (fateWord === 'plasmolysed') why = 'the medium is saltier than the cytoplasm, so water leaves and the contents pull away from the wall';
    else if (fateWord === 'swollen') why = state.solute < 0.85 ? 'the wall is failing' : 'no wall, but the medium is close enough to isotonic that nothing bursts';
    else if (!w.intact) why = 'no wall, and the medium is concentrated enough that water is not flooding in';
    else if (treat === 'penicillin' && !w.grow) why = 'penicillin blocks new cross-links, and a cell that is not growing is not making any';
    else if (treat && TREATMENTS[w.treat].needsPg && env.pgNm === 0) why = `an ${env.organism} has no peptidoglycan for ${treat} to attack`;
    else if (state.solute < 1) why = 'water is flooding in and the wall is taking the pressure';
    else why = 'nothing is pushing on it';
    fate.dataset.f = fateWord;
    fate.innerHTML = `<b>${fateWord[0].toUpperCase()}${fateWord.slice(1)}</b> — ${why}.`;
    swim.hidden = m.kind === 'none';
    if (m.kind !== 'none') swim.innerHTML = `Swimming: <b>${m.kind}</b> · ${sigFigs(SWIM_NM_PER_S / 1000, 2)} µm s⁻¹ · ${m.reversals} turn${m.reversals === 1 ? '' : 's'}`;

    const on = Number.isFinite(state.stainFrom);
    stainChip.hidden = !on;
    if (on) {
      stainChip.textContent = stain.label ?? '';
      stainChip.style.setProperty('--pk-dot', stain.colour === 'purple' ? palette.violet : stain.colour === 'pink' ? mix(palette.coral, palette.violet, 0.18) : palette.inkFaint);
    }
    btnStain.querySelector('.pk-long').textContent = on ? 'Wash the stain off' : 'Run the gram stain';
    btnStain.querySelector('.pk-short').textContent = on ? 'Unstain' : 'Gram stain';
    btnStain.setAttribute('aria-label', on ? 'Wash the stain off' : 'Run the gram stain');

    if (state.selected) {
      const info = partInfo(state.selected) || EXTRA_PARTS[state.selected];
      if (info) {
        card.innerHTML = '';
        card.append(h('h5', { text: info.name }), h('p', { text: info.role }));
        card.hidden = false;
      } else card.hidden = true;
    } else card.hidden = true;
  }

  function wallLayers() {
    const env = ENVELOPES[state.envelope];
    const out = [];
    if (state.appendages.has('capsule')) out.push('capsule');
    const w = current();
    for (const name of env.named) {
      if (name === 'peptidoglycan' && !w.intact) continue;
      out.push(name);
    }
    return out;
  }

  // ----- input -----
  const onClick = (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    let best = null;
    let bestD = Infinity;
    for (const hit of hits) {
      const d = Math.hypot(hit.x - x, hit.y - y);
      if (d <= hit.r && d < bestD) {
        bestD = d;
        best = hit.id;
      }
    }
    state.selected = best === state.selected ? null : best;
    draw();
  };
  canvas.addEventListener('click', onClick);
  const onKey = (e) => {
    if (e.key === 'Escape') {
      state.selected = null;
      draw();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const d = (e.key === 'ArrowRight' ? 5 : -5) * (e.shiftKey ? 4 : 1);
      soluteInput.value = String(clamp(Number(soluteInput.value) + d, 0, 200));
      soluteInput.dispatchEvent(new Event('input'));
    }
  };
  canvas.addEventListener('keydown', onKey);

  // ----- the loop -----
  function moving() {
    if (reduced) return false;
    const w = current();
    const f = fateOf();
    if (state.appendages.has('flagella') && f.fate !== 'lysed' && f.fate !== 'plasmolysed') return true;
    if (Number.isFinite(state.stainFrom) && t - state.stainFrom < STAIN_TOTAL) return true;
    if (w.treat && w.damage < 1 && damageRate(w.env, w.treat, w.grow) > 0) return true;
    if (!w.intact && state.solute < 0.85 && t - w.brokeAt < 2.6) return true;
    return false;
  }
  function frame(now) {
    raf = 0;
    if (destroyed || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    draw();
    if (moving()) raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (raf || destroyed || !visible || !moving()) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    if (!sizeCanvas()) return;
    draw();
    if (!ready) {
      ready = true;
      ctx.onReady();
    }
  }

  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && cw) draw(); });

  syncButtons();
  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(stage);
  observer.observe(toolbar);
  onResize();
  schedule();

  return {
    destroy() {
      destroyed = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      const next = Math.max(0, Number(seconds) || 0);
      if (next < t) {
        // Time moved backwards: the wall's damage is an integral, so the log is replayed from the start
        // and anything the reader did after `next` is dropped, which is what makes a pinned frame the
        // same frame on every run.
        actions = actions.filter((a) => a.at <= next + 1e-9);
        if (Number.isFinite(state.stainFrom) && state.stainFrom > next) state.stainFrom = Infinity;
      }
      t = next;
      stop();
      draw();
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else stop();
    },
    setTheme(nextTheme, nextPalette) {
      theme = nextTheme;
      palette = nextPalette;
      void theme;
      void CELL_COLOURS;
      void smoothstep;
      draw();
    },
    describe() {
      const w = current();
      const f = fateOf();
      const stain = stainState();
      const m = motion();
      return {
        organism: ENVELOPES[w.env].organism,
        envelope: w.env,
        wallLayers: wallLayers(),
        peptidoglycanNm: w.intact ? ENVELOPES[w.env].pgNm : 0,
        stain: Number.isFinite(state.stainFrom) ? (stain.colour ?? 'none') : null,
        externalSolute: Number(state.solute.toFixed(2)),
        wallIntact: w.intact,
        treatment: w.treat,
        growing: w.grow,
        fate: f.fate,
        appendages: APPENDAGES.filter((a) => state.appendages.has(a)),
        motility: m.kind,
        selected: state.selected,
      };
    },
  };
}
