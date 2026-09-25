// Grow a cell until it starves. One cell whose size the reader sets from 1 µm to 1 mm across, with the
// two independent limits of §3.2 computed from that one number and drawn side by side.
//
// THE MODEL, written out because every readout here is a measurement of it:
//
//   Geometry, at a volume the shape buttons hold fixed. V is set by the slider as the volume of a
//   sphere of that diameter, so `radiusUm` is always the equivalent-sphere radius and
//   `sphereRatioPerUm` is always exactly 3 / radiusUm.
//     sphere      r = (3V/4π)^⅓          A = 4πr²                  deepest point r
//     disc        a cylinder as wide as four of its own thicknesses: h = R/2, V = πR³/2,
//                 A = 2πR² + 2πRh = 3πR², deepest point h/2 = R/4
//     cylinder    ten times longer than it is wide: L = 20a, V = 20πa³, A = 42πa²,
//                 deepest point a
//     microvilli  a sphere carrying microvilli 0.1 µm wide and up to 1 µm long at 60 per µm² —
//                 the brush border of a gut cell, which is what multiplies its absorbing surface
//                 about twentyfold (1 + 60·2π·0.05·L_v = 19.8 at L_v = 1 µm). The villi have their
//                 own volume, so the core shrinks until the total is V again; solved by bisection.
//
//   Diffusion   t = x²/2D to the deepest point, D = 1000 µm² s⁻¹ — the chapter's value for a small
//               molecule in cytoplasm, and the one its table is computed with. The drawing carries
//               the same arithmetic backwards: the green rind is how far a molecule released at the
//               surface gets in ONE SECOND, x = √(2D·1) = 44.7 µm, so a cell that outgrows that rind
//               is visibly mostly out of reach.
//
//   Supply      supply ÷ demand = (A/V) ÷ (A/V)_critical. Demand scales with volume at a rate Q and
//               supply with surface, so the ratio of the two is proportional to A/V; the constant is
//               fixed by the sphere that is exactly on the edge. That is the Warburg radius
//               r_max = √(6 D C₀ / Q) = 155 µm, with D = 1000 µm² s⁻¹, C₀ = 0.2 mol m⁻³ (water in
//               equilibrium with air at 37 °C) and Q = 0.05 mol m⁻³ s⁻¹ (a cultured mammalian cell
//               burning about 200 amol of oxygen a second in 4 pL). So (A/V)_critical = 3/r_max and
//               a sphere of radius r scores exactly r_max/r. Comfortable ≥ 3, marginal ≥ 1, starving
//               below it.
//
// Every frame is a function of the clock and the reader's settings: the running clock's elapsed time is
// (t − t_start) × rate, so setTime(t) reproduces the frame exactly. No Math.random anywhere.
//
// describe() reports the brief's nine fields plus `clockSeconds`: the simulated seconds the diffusion
// clock has run, null while it is not running, so a gate can tell a clock that ran from one that did not.
import { mix, alpha, ORGANELLE_BY_ID } from '../palette.js';
import { h } from './lib/svg.js';
import {
  TAU, clamp, clamp01, lerp, FONT, fitCanvas, roundRectPath, panelCss, human, humanSeconds, sigFigs,
} from './lib/cell-common.js';

export const meta = { kind: 'surface-volume', title: 'Why cells are small', needsWebGL: false, aspect: 16 / 9 };

const D = 1000; // µm² s⁻¹, the chapter's diffusion coefficient for a small molecule in cytoplasm
const ONE_SECOND_REACH = Math.sqrt(2 * D * 1); // 44.7 µm
const R_MAX = Math.sqrt(6 * 1e-9 * 0.2 / 0.05) * 1e6; // µm, the Warburg radius: 155
const CRIT_RATIO = 3 / R_MAX; // µm⁻¹
const MIN_UM = 1; // the cell's diameter, µm
const MAX_UM = 1000;
const PLAY_MAX = 7; // seconds of real time the clock may take, however long the journey is

const SHAPES = ['sphere', 'disc', 'cylinder', 'microvilli'];
const SHAPE_NAME = { sphere: 'Sphere', disc: 'Flat disc', cylinder: 'Long cylinder', microvilli: 'Microvilli' };
const SHAPE_SHORT = { sphere: 'Sphere', disc: 'Disc', cylinder: 'Rod', microvilli: 'Villi' };
const SHAPE_NOTE = {
  sphere: 'The worst shape there is: for a given volume nothing has less surface.',
  disc: 'Four times as wide as it is thick, like a red blood cell. The surface rises; the volume does not.',
  cylinder: 'Ten times longer than it is wide. A nerve cell can run a metre on this trick.',
  microvilli: 'A fringe of finger-like projections 1 µm long and 0.1 µm wide, 60 to the square micrometre, as on a gut cell.',
};

// Microvilli, from §3.2's own numbers.
const VIL_R = 0.05; // µm, half of the 0.1 µm width
const VIL_N = 60; // per µm² of core surface
const areaPerUm2 = (lv) => 1 + VIL_N * 2 * Math.PI * VIL_R * lv; // 19.8 at lv = 1
const volPerUm2 = (lv) => VIL_N * Math.PI * VIL_R * VIL_R * lv; // 0.471 at lv = 1

// Where things a reader has met sit on the axis. Spaced far enough apart on a log scale that their
// labels never fight; the ostrich yolk is eighty times off the right-hand end and is named there.
const LANDMARKS = [
  { um: 2, label: 'bacterium', sub: '1–5 µm' },
  { um: 20, label: 'animal cell', sub: '10–100 µm' },
  { um: 750, label: 'Thiomargarita', sub: '0.75 mm' },
];

const NARROW_W = 640;
const NARROW_H = 420;
const SHORT_W = 520;

// ---------- the geometry ----------

function geometry(shape, sizeUm) {
  const r = sizeUm / 2; // the equivalent-sphere radius
  const V = (4 / 3) * Math.PI * r ** 3;
  if (shape === 'sphere') {
    return { V, A: 4 * Math.PI * r * r, depth: r, draw: { kind: 'round', w: 2 * r, h: 2 * r } };
  }
  if (shape === 'disc') {
    const R = Math.cbrt((2 * V) / Math.PI);
    const hh = R / 2;
    return { V, A: 3 * Math.PI * R * R, depth: hh / 2, draw: { kind: 'slab', w: 2 * R, h: hh } };
  }
  if (shape === 'cylinder') {
    const a = Math.cbrt(V / (20 * Math.PI));
    return { V, A: 42 * Math.PI * a * a, depth: a, draw: { kind: 'slab', w: 20 * a, h: 2 * a } };
  }
  // microvilli: shrink the core until the core plus its villi is the volume the slider set
  let lo = 0;
  let hi = r;
  for (let i = 0; i < 40; i += 1) {
    const rc = (lo + hi) / 2;
    const lv = Math.min(1, rc / 2);
    const total = (4 / 3) * Math.PI * rc ** 3 + 4 * Math.PI * rc * rc * volPerUm2(lv);
    if (total < V) lo = rc;
    else hi = rc;
  }
  const rc = (lo + hi) / 2;
  const lv = Math.min(1, rc / 2);
  return {
    V,
    A: 4 * Math.PI * rc * rc * areaPerUm2(lv),
    depth: rc,
    draw: { kind: 'round', w: 2 * rc, h: 2 * rc, villi: lv },
  };
}

// Three significant figures written out, so an area-to-volume ratio reads 0.300 and not 0.3.
function sig3(v, n = 3) {
  if (!Number.isFinite(v) || v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e6 || a < 1e-3) return human(v, n);
  const mag = Math.floor(Math.log10(a));
  const dp = clamp(n - 1 - mag, 0, 6);
  const out = v.toFixed(dp);
  return Math.abs(v) >= 1000 ? Number(out).toLocaleString('en-GB', { minimumFractionDigits: dp }) : out;
}

const verdictOf = (sd) => (sd >= 3 ? 'comfortable' : sd >= 1 ? 'marginal' : 'starving');

// ---------- the figure ----------

const CSS = (s) => `${panelCss(s)}
.${s} { display: grid; grid-template-columns: minmax(0, 52%) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; padding-bottom: var(--sv-pad, 3.1rem); box-sizing: border-box; }
.${s} .sv-stage { grid-column: 1; grid-row: 1; position: relative; min-width: 0; min-height: 0; padding: var(--space-3) var(--space-1) 0 var(--space-3); box-sizing: border-box; }
.${s} .sv-stage canvas { width: 100%; height: 100%; border-radius: var(--radius); }
.${s} .sv-panel { grid-column: 2; grid-row: 1; justify-content: center; padding: var(--space-3) var(--space-4) var(--space-2) var(--space-4); gap: 0.62rem; box-sizing: border-box; overflow: hidden; }
.${s} .sv-axis { grid-column: 1 / -1; grid-row: 2; position: relative; padding: 0 var(--space-4) 0 var(--space-4); box-sizing: border-box; }
.${s} .sv-axis input { width: 100%; margin: -3px 0 -4px; height: 24px; accent-color: var(--leaf); display: block; }
.${s} .sv-axis input:focus-visible { outline-offset: -3px; }
.${s} .sv-marks { position: relative; height: 26px; margin-top: 1px; }
.${s} .sv-mark { position: absolute; top: 0; transform: translateX(-50%); text-align: center; font-size: 9.5px; line-height: 1.15; color: var(--ink-faint); white-space: nowrap; }
.${s} .sv-mark::before { content: ""; display: block; width: 1px; height: 4px; margin: 0 auto 2px; background: var(--rule-strong); }
.${s} .sv-mark.is-right { transform: none; right: auto; text-align: right; translate: -100% 0; }
.${s} .sv-mark.is-right::before { margin: 0 0 2px auto; }
.${s} .sv-mark.is-left { transform: none; text-align: left; }
.${s} .sv-mark.is-left::before { margin: 0 auto 2px 0; }
.${s} .sv-mark b { display: block; font-weight: 500; color: var(--ink-soft); }
.${s} .sv-axlab { display: flex; justify-content: space-between; align-items: baseline; font-size: 9.5px; color: var(--ink-faint); font-weight: 600; margin-bottom: 2px; }
.${s} .sv-axlab .sv-cap { letter-spacing: 0.11em; text-transform: uppercase; }
.${s} .sv-axlab .sv-size { font-size: 12px; color: var(--ink); font-variant-numeric: lining-nums tabular-nums; letter-spacing: 0; }
.${s} .sv-axlab .sv-off { font-weight: 400; letter-spacing: 0; }
.${s} .sv-metric { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 0.5em; }
.${s} .sv-metric .sv-name { font-size: 11px; color: var(--ink-soft); }
.${s} .sv-metric .sv-num { font-size: 12px; font-weight: 600; font-variant-numeric: lining-nums tabular-nums; white-space: nowrap; }
.${s} .sv-metric .cl-bar { grid-column: 1 / -1; margin-top: 2px; background-image: repeating-linear-gradient(to right, color-mix(in srgb, var(--ink) 16%, transparent) 0 1px, transparent 1px 10%); }
.${s} .sv-scale { grid-column: 1 / -1; font-size: 9px; color: var(--ink-faint); letter-spacing: 0.04em; }
.${s} .sv-head2 { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5em; }
.${s} .sv-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0 var(--space-4); }
.${s} .sv-big { font-size: 19px; font-weight: 600; line-height: 1.05; font-variant-numeric: lining-nums tabular-nums; }
.${s} .sv-sub { font-size: 10.5px; color: var(--ink-faint); line-height: 1.3; }
.${s} .sv-sub b { color: var(--ink-soft); font-weight: 600; }
.${s} .sv-sd { position: relative; height: 9px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 9%, transparent); overflow: hidden; }
.${s} .sv-sd > i { position: absolute; inset: 0 auto 0 0; display: block; border-radius: 999px; }
.${s} .sv-sd > u { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--ink); opacity: 0.55; }
.${s} .sv-verdict { font-weight: 600; }
.${s} .sv-verdict[data-v="comfortable"] { color: var(--leaf-text); }
.${s} .sv-verdict[data-v="marginal"] { color: color-mix(in srgb, var(--gold) 72%, var(--ink)); }
.${s} .sv-verdict[data-v="starving"] { color: var(--coral-text); }
.${s} .sv-note { font-size: 10.5px; line-height: 1.35; color: var(--ink-faint); margin: 0; }
.${s} .sv-short { display: none; }
.${s}.is-short .sv-long { display: none; }
.${s}.is-short .sv-short { display: inline; }
.${s}.is-short .fig-toolbar { gap: 0.3rem; }
.${s}.is-short .fig-btn { padding: 0.3rem 0.5rem; }
/* Narrow: the drawing keeps the top of the stage and the readouts become two columns of short rows
   under it, because a column of readouts beside a 390 px drawing leaves neither of them room. */
.${s}.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto auto; }
.${s}.is-narrow .sv-stage { grid-column: 1; grid-row: 1; padding: var(--space-2) var(--space-3) 0; }
.${s}.is-narrow .sv-panel { grid-column: 1; grid-row: 2; justify-content: flex-start; padding: var(--space-2) var(--space-3) 0; gap: 0.32rem; }
.${s}.is-narrow .sv-axis { grid-row: 3; padding: 0 var(--space-3); }
.${s}.is-narrow .sv-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 var(--space-3); }
.${s}.is-narrow .sv-note { display: none; }
.${s}.is-narrow .sv-big { font-size: 16px; }
.${s}.is-narrow .sv-mark { font-size: 9px; }
/* Flat: a box wider than it is tall and too small for the wide layout. The frame gives one from an 800 px
   window up, where the rail beside the text keeps the stage at 480 to 746 px wide, and the narrow stack
   there left the drawing 0 to 74 px tall. So the readouts stand beside the drawing at the full height
   above the toolbar, the size axis stays under the drawing it sizes, and the two bars share one line of
   scale, since it is the same scale. */
.${s}.is-narrow.is-flat { grid-template-columns: minmax(0, 1fr) var(--sv-side, 50%); grid-template-rows: minmax(0, 1fr) auto; }
.${s}.is-narrow.is-flat .sv-stage { grid-column: 1; grid-row: 1; padding: var(--space-3) var(--space-1) 0 var(--space-3); }
.${s}.is-narrow.is-flat .sv-axis { grid-column: 1; grid-row: 2; padding: 0 var(--space-1) 0 var(--space-3); }
.${s}.is-narrow.is-flat .sv-panel { grid-column: 2; grid-row: 1 / -1; justify-content: center; padding: var(--space-2) var(--space-3) 0; gap: 0.42rem; }
.${s}.is-narrow.is-flat .sv-two { grid-template-columns: minmax(0, 1fr); gap: 0.3rem 0; }
.${s}.is-narrow.is-flat .sv-metric:first-child .sv-scale { display: none; }
.${s}.is-narrow.is-flat .sv-off { display: none; }
/* The verdict under its heading, not beside it: a column 240 to 330 px wide split the two, and each broke
   onto a second line. */
.${s}.is-narrow.is-flat .sv-head2 { flex-direction: column; align-items: flex-start; gap: 0; }
/* Tight: the flat box of an 800 to 853 px window, 480 x 270 to 533 x 299, where the readouts' column, 216 to
   245 px tall, cannot also hold the working under the two middle figures. The figures and their headings
   stay, and so does the working at every larger size. */
.${s}.is-narrow.is-flat.is-tight .sv-panel { padding-top: var(--space-1); gap: 0.3rem; }
.${s}.is-narrow.is-flat.is-tight .sv-sub { display: none; }
`;

export function mount(root, ctx) {
  const scope = 'tb-sav';
  const reduced = Boolean(ctx.reducedMotion);
  let palette = ctx.palette;
  let theme = ctx.theme;
  let t = ctx.pinnedTime ?? 0;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;

  const state = {
    shape: 'sphere',
    sizeUm: 20,
    clockFrom: Infinity, // the clock's t at the moment the reader started it
  };

  // ----- DOM -----
  const wrap = h('div', { class: scope });
  wrap.append(h('style', { text: CSS(scope) }));

  const canvas = h('canvas', {
    tabindex: 0,
    role: 'img',
    'aria-label': 'The cell at the chosen size and shape, with the shell a small molecule can reach in one second shaded. The left and right arrow keys change the size.',
  });
  const stage = h('div', { class: 'sv-stage' }, [canvas]);

  const metric = (name) => {
    const num = h('span', { class: 'sv-num' });
    const bar = h('i');
    const node = h('div', { class: 'sv-metric' }, [
      h('span', { class: 'sv-name', text: name }), num,
      h('div', { class: 'cl-bar' }, [bar]),
      h('span', { class: 'sv-scale', text: '0.1 · each mark ×10 · 10⁹' }),
    ]);
    return { node, num, bar };
  };
  const mArea = metric('Surface area, µm²');
  const mVol = metric('Volume, µm³');

  const ratioBig = h('div', { class: 'sv-big' });
  const ratioSub = h('div', { class: 'sv-sub' });
  const clockBig = h('div', { class: 'sv-big' });
  const clockSub = h('div', { class: 'sv-sub' });
  const pair = h('div', { class: 'sv-pair' }, [
    h('div', {}, [h('p', { class: 'cl-head', text: 'Area ÷ volume' }), ratioBig, ratioSub]),
    h('div', {}, [h('p', { class: 'cl-head', text: 'To the centre' }), clockBig, clockSub]),
  ]);

  const sdFill = h('i');
  const sdMark = h('u');
  const sdBar = h('div', { class: 'sv-sd' }, [sdFill, sdMark]);
  const sdVerdict = h('span', { class: 'sv-verdict' });
  const sdNum = h('span', { class: 'sv-num' });
  const sdHead = h('div', { class: 'sv-head2' }, [
    h('p', { class: 'cl-head', text: 'Supply ÷ demand' }),
    h('span', {}, [sdNum, ' · ', sdVerdict]),
  ]);
  const shapeNote = h('p', { class: 'sv-note' });

  const panel = h('div', { class: 'cl-panel sv-panel' }, [
    h('div', { class: 'sv-two' }, [mArea.node, mVol.node]),
    pair,
    h('div', {}, [sdHead, sdBar]),
    shapeNote,
  ]);

  const sizeInput = h('input', {
    type: 'range', class: 'fig-range', min: 0, max: 1000, step: 1,
    value: String(Math.round((Math.log10(state.sizeUm / MIN_UM) / Math.log10(MAX_UM / MIN_UM)) * 1000)),
    'aria-label': 'Cell size across, 1 micrometre to 1 millimetre',
  });
  sizeInput.addEventListener('input', () => {
    state.sizeUm = MIN_UM * (MAX_UM / MIN_UM) ** (Number(sizeInput.value) / 1000);
    resetClock();
    draw();
  });
  const marks = h('div', { class: 'sv-marks' });
  const axis = h('div', { class: 'sv-axis' }, [
    h('div', { class: 'sv-axlab' }, [
      h('span', { class: 'sv-cap', text: 'Across' }),
      h('span', { class: 'sv-off sv-long', text: 'an ostrich yolk is one cell, 80 mm across — eighty times off the right of this scale' }),
      h('span', { class: 'sv-size' }),
    ]),
    sizeInput, marks,
  ]);
  const sizeLabel = axis.querySelector('.sv-size');

  const shapeButtons = SHAPES.map((id) => {
    const b = h('button', { class: 'fig-btn', type: 'button', 'aria-pressed': String(id === state.shape), 'aria-label': SHAPE_NAME[id] }, [
      h('span', { class: 'sv-long', text: SHAPE_NAME[id] }),
      h('span', { class: 'sv-short', text: SHAPE_SHORT[id] }),
    ]);
    b.addEventListener('click', () => {
      state.shape = id;
      for (const [k, node] of shapeButtons.entries()) node.setAttribute('aria-pressed', String(SHAPES[k] === id));
      resetClock();
      draw();
    });
    return b;
  });
  const btnClock = h('button', { class: 'fig-btn', type: 'button' }, [
    h('span', { class: 'sv-long', text: 'Run the clock' }),
    h('span', { class: 'sv-short', text: 'Clock' }),
  ]);
  btnClock.setAttribute('aria-label', 'Run the diffusion clock');
  btnClock.addEventListener('click', () => {
    if (Number.isFinite(state.clockFrom)) resetClock();
    else {
      state.clockFrom = t;
      if (reduced) {
        // Nothing moves on its own under reduced motion: the clock lands at the centre in one cut.
        t += totalPlaySeconds();
      }
      schedule();
    }
    draw();
  });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [...shapeButtons, btnClock]);

  wrap.append(stage, panel, axis, toolbar);
  root.append(wrap);

  for (const m of LANDMARKS) {
    const x = clamp((Math.log10(m.um / MIN_UM) / Math.log10(MAX_UM / MIN_UM)) * 100, 1, 99);
    // A label centred on a mark near either end runs off the stage, so the end ones hang inward and
    // their tick stays where the number actually is.
    const edge = x > 78 ? 'right' : x < 14 ? 'left' : 'mid';
    marks.append(h('span', { class: `sv-mark is-${edge}`, style: `left:${x}%` }, [
      h('b', { text: m.label }), m.sub,
    ]));
  }

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('this figure draws its cell on a 2D canvas and the browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // ----- the clock -----
  const totalSeconds = () => geometry(state.shape, state.sizeUm).depth ** 2 / (2 * D);
  const playRate = () => Math.max(1, totalSeconds() / PLAY_MAX);
  const totalPlaySeconds = () => totalSeconds() / playRate();
  function elapsed() {
    if (!Number.isFinite(state.clockFrom)) return 0;
    return clamp((t - state.clockFrom) * playRate(), 0, totalSeconds());
  }
  const clockDone = () => Number.isFinite(state.clockFrom) && elapsed() >= totalSeconds() - 1e-12;
  function resetClock() {
    state.clockFrom = Infinity;
  }

  // ----- layout -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let narrow = null;
  let short = null;
  let flat = null;
  let tight = null;
  let padPx = 0;

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const wantNarrow = w < NARROW_W || hh < NARROW_H;
    // A narrow box wider than it is tall takes the flat layout (see the CSS); a phone's tall one stacks.
    const wantFlat = wantNarrow && w > hh;
    const wantShort = w < SHORT_W;
    const wantTight = wantFlat && hh < 300;
    if (wantNarrow !== narrow || wantShort !== short || wantFlat !== flat || wantTight !== tight) {
      narrow = wantNarrow;
      short = wantShort;
      flat = wantFlat;
      tight = wantTight;
      wrap.classList.toggle('is-narrow', narrow);
      wrap.classList.toggle('is-short', short);
      wrap.classList.toggle('is-flat', flat);
      wrap.classList.toggle('is-tight', tight);
    }
    // Half the box for the readouts, and never under the 230 px their two columns of figures need.
    if (flat) wrap.style.setProperty('--sv-side', `${Math.round(clamp(w * 0.5, 230, 330))}px`);
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 22;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--sv-pad', `${pad}px`);
    }
    return true;
  }

  // The canvas's own box, not its stage's. The stage's padding is outside the canvas, and a backing store
  // sized to the whole stage was shrunk into the canvas: on a 390 px phone by 6 % across and 4 % down, so
  // every word was drawn smaller than its font and a sphere came out a little oval.
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

  // ----- the drawing -----
  // Every shape is drawn at ONE scale, set by the longest of them at this volume, so the four are
  // comparable at a glance: the rod is long and thin and the sphere is small, and that is the point.
  function draw() {
    if (!cw) return;
    const p = palette;
    const geo = geometry(state.shape, state.sizeUm);
    const sphereD = geometry('sphere', state.sizeUm).draw.w;
    const villi = geo.draw.villi || 0;
    const padX = 22;
    const padY = 30;
    // Fit the shape in view, and never let the equal-volume sphere behind it leave the frame either.
    const wantW = Math.max(geo.draw.w + 2 * villi, sphereD);
    const wantH = Math.max(geo.draw.h + 2 * villi, sphereD);
    // Never below zero. In an 800 to 860 px window the frame gives the wide box, the rail narrows it, and
    // the drawing is left 0 to 26 px tall, less than its two pads take; the scale went negative, so did
    // every radius below, and the canvas throws on a negative radius (docs/work/2_rest-of-the-book/reviews/
    // 2026-09-25-wide-band-probe.md).
    const scale = Math.max(0, Math.min((cw - padX * 2) / wantW, (ch - padY * 2) / wantH));
    const cx = cw / 2;
    const cy = ch / 2;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = p.paper;
    g.fillRect(0, 0, cw, ch);

    // The reach: the rind a molecule released at the surface covers in one second, or how far the
    // running clock has got, whichever is further.
    const e = elapsed();
    const reach = Number.isFinite(state.clockFrom)
      ? Math.max(ONE_SECOND_REACH, Math.sqrt(2 * D * e))
      : ONE_SECOND_REACH;
    const supplied = Math.min(geo.depth, reach);

    const supplyCol = mix(p.paper, p.leaf, 0.3);
    const starveCol = mix(p.paper, p.coral, 0.26);
    const edge = mix(p.ink, p.paper, 0.25);

    // The same volume as a sphere, behind, so a shape change is visibly a change of shape and not of size.
    if (state.shape !== 'sphere') {
      const sg = geometry('sphere', state.sizeUm);
      g.beginPath();
      g.arc(cx, cy, (sg.draw.w / 2) * scale, 0, TAU);
      g.setLineDash([4, 4]);
      g.strokeStyle = p.ruleStrong;
      g.lineWidth = 1;
      g.stroke();
      g.setLineDash([]);
    }

    const shapePath = (inset) => {
      const d = state.draw;
      const w = Math.max(0, geo.draw.w / 2 - inset) * scale;
      const hgt = Math.max(0, geo.draw.h / 2 - inset) * scale;
      g.beginPath();
      if (geo.draw.kind === 'round') g.arc(cx, cy, w, 0, TAU);
      else roundRectPath(g, cx - w, cy - hgt, w * 2, hgt * 2, Math.min(hgt, w));
      void d;
    };

    // microvilli, drawn round the core at their true length
    if (geo.draw.villi) {
      const lv = geo.draw.villi;
      const rc = geo.draw.w / 2;
      const circ = TAU * rc;
      // 60 per µm² over a sphere is 60·4πrc² villi; round the drawn circle we can only show the ones in
      // this section, which is 2πrc·√60 ≈ the number a great circle cuts through.
      const n = clamp(Math.round(circ * Math.sqrt(VIL_N)), 12, 260);
      g.strokeStyle = supplyCol;
      g.lineWidth = Math.max(0.8, 2 * VIL_R * scale);
      g.lineCap = 'round';
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * TAU;
        const c = Math.cos(a);
        const s2 = Math.sin(a);
        g.beginPath();
        g.moveTo(cx + c * rc * scale, cy + s2 * rc * scale);
        g.lineTo(cx + c * (rc + lv) * scale, cy + s2 * (rc + lv) * scale);
        g.stroke();
      }
    }

    shapePath(0);
    g.fillStyle = supplyCol;
    g.fill();
    if (supplied < geo.depth - 1e-9) {
      shapePath(supplied);
      g.fillStyle = starveCol;
      g.fill();
    }
    // A nucleus, so the drawing is a cell and not a disc, and so the reader can see which side of the
    // front it falls on. Drawn at a fixed share of the cell rather than to scale with it: a nucleus does
    // not keep pace with a cell that has grown to a millimetre, which is part of why none of them do.
    const nr = Math.min(geo.draw.h, geo.draw.w) * 0.17;
    if (nr * scale > 3) {
      const nx = cx - geo.draw.w * 0.11 * scale;
      g.beginPath();
      g.ellipse(nx, cy - geo.draw.h * 0.04 * scale, nr * scale, nr * 0.86 * scale, -0.2, 0, TAU);
      g.fillStyle = mix(p.paper, ORGANELLE_BY_ID.nucleus.color, 0.42);
      g.fill();
      g.strokeStyle = mix(p.paper, ORGANELLE_BY_ID.nucleus.color, 0.7);
      g.lineWidth = 1;
      g.stroke();
    }

    shapePath(0);
    g.strokeStyle = mix(p.paper, ORGANELLE_BY_ID.membrane.color, 0.85);
    g.lineWidth = 2;
    g.stroke();
    shapePath(0);
    g.strokeStyle = edge;
    g.lineWidth = 1;
    g.stroke();

    // the advancing front, while the clock runs
    if (Number.isFinite(state.clockFrom) && !clockDone()) {
      shapePath(Math.min(geo.depth, Math.sqrt(2 * D * e)));
      g.strokeStyle = p.leaf;
      g.lineWidth = 1.6;
      g.stroke();
    }

    // ----- the annotations on the drawing -----
    g.font = `10px ${FONT}`;
    g.textBaseline = 'alphabetic';
    const starvedFrac = geo.depth > 0 ? clamp01(1 - supplied / geo.depth) : 0;
    g.textAlign = 'left';
    g.fillStyle = mix(p.leaf, p.ink, 0.3);
    const reachLabel = Number.isFinite(state.clockFrom)
      ? `reached in ${humanSeconds(e)}`
      : 'reached in one second';
    g.fillText(reachLabel, padX - 12, 14);
    if (starvedFrac > 0.02) {
      g.textAlign = 'right';
      g.fillStyle = mix(p.coral, p.ink, 0.3);
      g.fillText(`${Math.round(starvedFrac * 100)}% still waiting`, cw - padX + 12, 14);
    }

    // a scale bar in whichever unit the cell is in
    const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    let bar = steps[0];
    for (const st of steps) if (st * scale <= (cw - padX * 2) * 0.32) bar = st;
    const bx = padX - 12;
    const by = ch - 12;
    g.strokeStyle = p.inkSoft;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(bx, by + 0.5);
    g.lineTo(bx + bar * scale, by + 0.5);
    g.stroke();
    g.fillStyle = p.inkSoft;
    g.font = `600 10px ${FONT}`;
    g.textAlign = 'left';
    g.fillText(bar >= 1000 ? `${bar / 1000} mm` : `${bar} µm`, bx, by - 5);

    // the clock, while it runs
    if (Number.isFinite(state.clockFrom)) {
      const rate = playRate();
      g.textAlign = 'right';
      g.font = `600 11px ${FONT}`;
      g.fillStyle = p.ink;
      g.fillText(humanSeconds(e), cw - padX + 12, by - 5);
      if (rate > 1.05) {
        g.font = `9.5px ${FONT}`;
        g.fillStyle = p.inkFaint;
        g.fillText(`× ${Math.round(rate)} speed`, cw - padX + 12, by + 6);
      }
    }

    updatePanel(geo);
  }

  // ----- the readouts -----
  const LOGLO = -1;
  const LOGHI = 9;
  const logWidth = (v) => `${clamp01((Math.log10(Math.max(v, 1e-6)) - LOGLO) / (LOGHI - LOGLO)) * 100}%`;

  function updatePanel(geo) {
    const p = palette;
    const r = state.sizeUm / 2;
    const ratio = geo.A / geo.V;
    const sphereRatio = 3 / r;
    const sd = ratio / CRIT_RATIO;
    const verdict = verdictOf(sd);
    const secs = geo.depth ** 2 / (2 * D);

    sizeLabel.textContent = state.sizeUm >= 1000 ? '1 mm' : `${sigFigs(state.sizeUm, 3)} µm`;
    mArea.num.textContent = human(geo.A, 3);
    mVol.num.textContent = human(geo.V, 3);
    mArea.bar.style.width = logWidth(geo.A);
    mVol.bar.style.width = logWidth(geo.V);
    mArea.bar.style.background = p.water;
    mVol.bar.style.background = p.violet;

    ratioBig.innerHTML = `${sig3(ratio)}<span class="cl-unit"> µm⁻¹</span>`;
    const gain = ratio / sphereRatio;
    ratioSub.innerHTML = state.shape === 'sphere'
      ? `3 ÷ <b>${sig3(r)} µm</b>, and it falls as fast as the cell grows`
      : `<b>${gain.toFixed(2)}×</b> the ${sig3(sphereRatio)} µm⁻¹ of a sphere of the same volume`;

    clockBig.textContent = humanSeconds(secs);
    clockSub.innerHTML = `the deepest point is <b>${sig3(geo.depth)} µm</b> in, and the wait is that squared ÷ 2D`;

    sdNum.textContent = `${sd >= 100 ? human(sd, 2) : sig3(sd, 2)}×`;
    sdVerdict.textContent = verdict;
    sdVerdict.dataset.v = verdict;
    // A log bar from 1/30 to 30 with the break-even mark where it belongs.
    const pos = (v) => clamp01((Math.log10(v) + 1.5) / 3) * 100;
    sdFill.style.width = `${pos(sd)}%`;
    sdFill.style.background = verdict === 'comfortable' ? p.leaf : verdict === 'marginal' ? p.gold : p.coral;
    sdMark.style.left = `${pos(1)}%`;
    const LESSON = {
      comfortable: 'The surface can feed the volume several times over.',
      marginal: 'Supply and demand are within a factor of three: this cell is at the edge of what a surface can feed.',
      starving: 'Demand has outrun supply. A cell this size has to fill itself with something that is not working cytoplasm, or stop being a sphere.',
    };
    shapeNote.innerHTML = `${LESSON[verdict]} ${SHAPE_NOTE[state.shape]}`;

    const running = Number.isFinite(state.clockFrom) && !clockDone();
    btnClock.querySelector('.sv-long').textContent = Number.isFinite(state.clockFrom) ? 'Reset the clock' : 'Run the clock';
    btnClock.querySelector('.sv-short').textContent = Number.isFinite(state.clockFrom) ? 'Reset' : 'Clock';
    btnClock.setAttribute('aria-label', Number.isFinite(state.clockFrom) ? 'Reset the diffusion clock' : 'Run the diffusion clock');
    btnClock.classList.toggle('is-live', running);
    void alpha;
  }

  // ----- the loop -----
  function frame(now) {
    raf = 0;
    if (destroyed || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (!Number.isFinite(state.clockFrom) || clockDone()) {
      draw();
      return; // nothing is moving; stop asking for frames
    }
    t += dt;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (raf || destroyed || !visible || reduced) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const onKey = (e) => {
    const step = e.shiftKey ? 40 : 8;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      sizeInput.value = String(clamp(Number(sizeInput.value) + step, 0, 1000));
      sizeInput.dispatchEvent(new Event('input'));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      sizeInput.value = String(clamp(Number(sizeInput.value) - step, 0, 1000));
      sizeInput.dispatchEvent(new Event('input'));
    }
  };
  canvas.addEventListener('keydown', onKey);

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

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(stage);
  observer.observe(toolbar);
  onResize();

  return {
    destroy() {
      destroyed = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      t = Math.max(0, Number(seconds) || 0);
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
      draw();
    },
    describe() {
      const geo = geometry(state.shape, state.sizeUm);
      const r = state.sizeUm / 2;
      const ratio = geo.A / geo.V;
      const sd = ratio / CRIT_RATIO;
      return {
        shape: state.shape,
        radiusUm: sigFigs(r, 3),
        surfaceAreaUm2: sigFigs(geo.A, 3),
        volumeUm3: sigFigs(geo.V, 3),
        ratioPerUm: sigFigs(ratio, 3),
        sphereRatioPerUm: sigFigs(3 / r, 3),
        diffusionSeconds: sigFigs(geo.depth ** 2 / (2 * D), 3),
        supplyDemand: sigFigs(sd, 3),
        verdict: verdictOf(sd),
        clockSeconds: Number.isFinite(state.clockFrom) ? sigFigs(elapsed(), 3) : null,
      };
    },
  };
}
