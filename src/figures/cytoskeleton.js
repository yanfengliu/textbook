// Motors on tracks. A microtubule and an actin filament at their true relative diameters — 25 nm and
// 7 nm — with a bundle of intermediate filaments crossing behind them, plus and minus ends marked, and a
// cargo vesicle hauled along by whichever motor the reader picks.
//
// What is to scale, and what is not. One number sets the whole drawing: `PX_PER_NM`, derived from the
// stage, so the filament diameters, the tubulin lattice (8 nm a dimer), the actin subunits (5.5 nm), the
// motor's step and the cargo are all one scale and cannot disagree. Time is not: the figure runs at
// 1/SLOW of real time, stated on a chip, because kinesin takes a hundred 8 nm steps a second and a
// hundred steps a second is a blur. Every speed the readout gives is the real one.
//
// The model:
//   compatibility  kinesin and dynein grip tubulin, myosin grips actin. An impossible pair is refused
//                  with the reason, which is the lesson rather than an error.
//   direction      kinesin to the plus end, dynein to the minus end, myosin V to actin's plus end.
//   speed          v = vmax · (a / (a + KM)) normalised so a = 1 gives vmax, and a stall below 0.02.
//                  One ATP per step, so the ATP count is the step count.
//   position       a run is { t0, pos0, direction, speed }, and the position is a pure function of the
//                  clock over that run. Any change — motor, ATP, drug — closes the run and opens a new
//                  one at the current position, so setTime(t) reproduces the same frame every time.
//   diffusion      the racing cargo is a seeded random walk with D = 0.1 µm² s⁻¹, which is a measured
//                  value for a 50 nm vesicle in crowded cytoplasm. The motor is quicker beyond
//                  x* = 2D/v — 250 nm for kinesin — and that crossing is marked on the track itself.
//
// Two compositions: wide runs the filaments across the stage with the panel beside them; narrow turns
// them vertical, plus end up, with the panel alongside. The drawing is built once in a horizontal local
// frame and the narrow layout rotates that group, so there is one geometry and not two.
import { el, h, text, C, tint, smooth, clamp, easeInOut } from './lib/svg.js';
import { ORGANELLE_BY_ID } from '../palette.js';
import { colourOf } from './lib/cell3-colours.js';
import { mulberry32 } from './lib/cell3-draw.js';

export const meta = { kind: 'cytoskeleton', title: 'Motors on tracks', needsWebGL: false, aspect: 16 / 7 };

const SEED = 20260311;
const NARROW_W = 700;
const SLOW = 20; // the figure runs at a twentieth of real time; every reported speed is the real one
const KM = 0.12; // the ATP concentration at which a motor runs at half speed, as a fraction of full
const STALL = 0.02;
const D_UM2_S = 0.1; // a 50 nm vesicle in crowded cytoplasm
const WALK_N = 2400; // samples of the seeded diffusion walk
const WALK_DT = 0.004; // simulated seconds per sample

const FILAMENTS = {
  microtubule: {
    id: 'microtubule', name: 'Microtubule', article: 'a', diameterNm: 25, built: 'thirteen rows of α/β-tubulin, hollow',
    job: 'Resists compression; tracks for kinesin and dynein; the spindle; the core of a cilium.',
  },
  actin: {
    id: 'actin', name: 'Actin filament', article: 'an', diameterNm: 7, built: 'two twisted strands of actin subunits',
    job: 'Bears tension; myosin walks it; the cleavage furrow; the core of a microvillus.',
  },
};

const MOTORS = {
  kinesin: {
    id: 'kinesin', name: 'Kinesin-1', short: 'Kinesin', track: 'microtubule', direction: 'plus', stepNm: 8, vmax: 800,
    refuse: 'Kinesin’s motor domain grips the tubulin lattice. An actin filament has no tubulin in it, so there is nothing for the head to hold.',
  },
  dynein: {
    id: 'dynein', name: 'Cytoplasmic dynein', short: 'Dynein', track: 'microtubule', direction: 'minus', stepNm: 8, vmax: 1000,
    refuse: 'Dynein binds tubulin as well, and it is the microtubule’s minus-end motor. On actin it has no track at all.',
  },
  myosin: {
    id: 'myosin', name: 'Myosin V', short: 'Myosin V', track: 'actin', direction: 'plus', stepNm: 36, vmax: 400,
    refuse: 'Myosin’s head is built to bind actin. It cannot grip tubulin, so a microtubule is not a track for it.',
  },
};

const DRUGS = {
  nocodazole: { id: 'nocodazole', name: 'Nocodazole', hits: 'microtubule', breaks: true, note: 'Nocodazole stops tubulin adding to the plus end, so the microtubule falls apart from that end and its cargo is stranded.' },
  taxol: { id: 'taxol', name: 'Taxol', hits: 'microtubule', breaks: false, note: 'Taxol freezes the microtubule: it can neither grow nor shrink. Transport carries on — what taxol kills is the spindle, which needs the microtubules to be dynamic.' },
  latrunculin: { id: 'latrunculin', name: 'Latrunculin', hits: 'actin', breaks: true, note: 'Latrunculin holds free actin subunits so none can add, and the filament breaks up from its ends. Myosin has nothing left to walk on.' },
};

const clampNm = (v, hi) => clamp(v, 0, hi);
const fmt = (v, n = 0) => v.toLocaleString('en-GB', { maximumFractionDigits: n, minimumFractionDigits: n });

// How long a cargo takes to cover `um` micrometres, in words.
function saidTime(seconds) {
  if (seconds < 90) return `${fmt(seconds, seconds < 10 ? 1 : 0)} s`;
  if (seconds < 5400) return `${fmt(seconds / 60, 0)} min`;
  if (seconds < 172800) return `${fmt(seconds / 3600, 1)} h`;
  if (seconds < 3.15e7) return `${fmt(seconds / 86400, 0)} days`;
  const years = seconds / 3.156e7;
  return years >= 1000 ? `${fmt(Math.round(years / 100) * 100, 0)} years` : `${fmt(years, 0)} years`;
}

const CSS = `
.tb-cyto { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  padding: 0.5rem 0.7rem var(--cy-pad, 3rem); gap: 0.3rem 0.9rem; font-family: var(--font-ui);
  grid-template-columns: minmax(246px, 30fr) minmax(0, 70fr); grid-template-rows: minmax(0, 1fr);
  grid-template-areas: "panel track"; }
.tb-cyto .cy-panel { grid-area: panel; min-width: 0; min-height: 0; display: flex; flex-direction: column;
  gap: 0.28rem; overflow: hidden; }
.tb-cyto .cy-track { grid-area: track; position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.tb-cyto .cy-track svg { display: block; position: absolute; inset: 0; width: 100%; height: 100%; }
.tb-cyto .cy-group { display: flex; flex-direction: column; gap: 0.12rem; }
.tb-cyto .cy-legend { font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-faint); }
.tb-cyto .cy-pick { display: flex; flex-wrap: wrap; gap: 0.22rem; }
.tb-cyto .cy-pick button { appearance: none; font: inherit; font-family: var(--font-ui);
  font-size: var(--text-xs); font-weight: 500; line-height: 1.15; color: var(--ink-soft);
  background: var(--paper); border: 1px solid var(--rule-strong); border-radius: 999px;
  padding: 0.2rem 0.5rem; cursor: pointer; }
.tb-cyto .cy-pick button:hover { border-color: var(--ink-faint); color: var(--ink); }
.tb-cyto .cy-pick button[aria-pressed="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.tb-cyto .cy-pick button:focus-visible { outline: 2px solid var(--water); outline-offset: 1px; }
.tb-cyto .cy-pick button[data-swatch]::before { content: ''; display: inline-block; width: 0.5rem;
  height: 0.5rem; border-radius: 50%; background: var(--cy-swatch); margin-right: 0.32rem;
  vertical-align: baseline; }
.tb-cyto .cy-read { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.05rem 0.5rem;
  font-size: var(--text-xs); font-variant-numeric: lining-nums tabular-nums; }
.tb-cyto .cy-read dt { color: var(--ink-faint); }
.tb-cyto .cy-read dd { margin: 0; color: var(--ink); font-weight: 600; }
.tb-cyto .cy-msg { flex: 0 0 auto; font-size: var(--text-xs); line-height: 1.34; color: var(--ink-soft);
  text-wrap: pretty; min-height: 5.4em; }
.tb-cyto .cy-msg b { color: var(--ink); font-weight: 600; }
.tb-cyto .cy-foot { flex: 0 0 auto; margin-top: 0.25rem; font-size: 0.66rem; line-height: 1.3; color: var(--ink-faint);
  font-variant-numeric: lining-nums tabular-nums; }
.tb-cyto .cy-msg.is-refused b { color: var(--coral-text); }
.tb-cyto text { font-family: var(--font-ui); }
.tb-cyto .cy-lab { fill: var(--ink); font-weight: 600; paint-order: stroke; stroke: var(--paper);
  stroke-width: 3.2; stroke-linejoin: round; }
.tb-cyto .cy-sub { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums;
  paint-order: stroke; stroke: var(--paper); stroke-width: 3; stroke-linejoin: round; }
.tb-cyto .cy-end { fill: var(--ink); font-weight: 700; paint-order: stroke; stroke: var(--paper);
  stroke-width: 3.4; stroke-linejoin: round; }
.tb-cyto .cy-dim { opacity: 0.34; }
.tb-cyto .cy-slider { display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.2rem 0.6rem 0.2rem 0.5rem; }
.tb-cyto .cy-slider input { width: 6.5rem; accent-color: var(--leaf); }
.tb-cyto .cy-slider span { min-width: 3.4rem; color: var(--ink); font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums; }

.tb-cyto.is-narrow { grid-template-columns: minmax(148px, 46fr) minmax(0, 54fr);
  grid-template-areas: "track panel"; gap: 0.2rem 0.5rem; }
.tb-cyto.is-narrow .cy-read { grid-template-columns: auto minmax(0, 1fr); font-size: 0.68rem; }
.tb-cyto.is-narrow .cy-msg { font-size: 0.66rem; line-height: 1.28; min-height: 4.2em; }
.tb-cyto.is-narrow .cy-foot { font-size: 0.6rem; }
.tb-cyto.is-narrow .cy-group { gap: 0.05rem; }
.tb-cyto.is-narrow .cy-pick button { padding: 0.16rem 0.38rem; font-size: 0.68rem; }
.tb-cyto.is-narrow .cy-legend { font-size: 0.56rem; }
.tb-cyto-narrow .cy-slider input { width: 4.2rem; }
.tb-cyto-narrow .cy-slider span { min-width: 2.8rem; font-size: 0.68rem; }
.tb-cyto-narrow .cy-slider { padding: 0.16rem 0.4rem 0.16rem 0.35rem; gap: 0.25rem; }
.tb-cyto-narrow .fig-btn { padding: 0.26rem 0.5rem; font-size: 0.7rem; }
.tb-cyto-narrow .fig-toolbar { gap: 0.3rem; }
`;

// ---------- the scene, built in a local frame where s runs right and d runs up ----------
// `k` is pixels per nanometre. Everything below is in nanometres until it is multiplied by k.
function buildFilament(kind, trackNm, k, rng, { drug = null, dim = false } = {}) {
  const f = FILAMENTS[kind];
  const col = colourOf(kind);
  const r = (f.diameterNm / 2) * k;
  const g = el('g', { class: `cy-fil cy-fil-${kind}${dim ? ' cy-dim' : ''}` });
  const broken = drug && DRUGS[drug].hits === kind && DRUGS[drug].breaks;
  // Where the filament still exists, in nm along the track. Nocodazole eats the microtubule back from
  // its plus end; latrunculin breaks actin into pieces from both ends.
  const live = broken
    ? (kind === 'microtubule' ? [[0, trackNm * 0.26]] : [[trackNm * 0.06, trackNm * 0.2], [trackNm * 0.34, trackNm * 0.48], [trackNm * 0.72, trackNm * 0.82]])
    : [[0, trackNm]];

  if (kind === 'microtubule') {
    // Thirteen protofilaments seen side on: five rows of 8 nm α/β dimers, each row offset along the
    // lattice, in a hollow tube whose lumen is paler than its walls.
    const rows = 5;
    // HAIRLINE is the gap that makes neighbouring dimers read as separate tiles. It is in pixels while
    // the lattice is in nanometres, so the two are only comparable after the multiplication by k, and a
    // tile narrower than the hairline has nothing left to draw. The guard below was in nanometres alone
    // (`s1 - s0 < 1.2`), which cannot see the hairline: the 1.8 nm remnant at the plus end of the third
    // row is 0.65 px wide once the track is 224 px for 400 nm — a tablet's narrow stage — and
    // 0.65 − 0.7 is a negative width, which the browser refuses. The row height has the same shape: at a
    // stage that has not been measured yet, 2r/rows is a fifth of a pixel and the hairline is more than
    // all of it. So both are worked out in pixels, at the precision actually written to the attribute,
    // and a tile with no room left is not drawn. The tube rect above still carries the filament, which
    // is the whole of what a lattice at that scale could show anyway.
    const HAIRLINE = 0.7;
    const tileH = Number(((2 * r) / rows - HAIRLINE).toFixed(1));
    for (const [a, b] of live) {
      g.append(el('rect', { x: (a * k).toFixed(1), y: (-r).toFixed(1), width: ((b - a) * k).toFixed(1), height: (2 * r).toFixed(1), rx: (r * 0.28).toFixed(1), fill: tint(col, 24) }));
      if (!(tileH > 0)) continue; // a row of dimers is thinner here than the gap that would separate them
      for (let row = 0; row < rows; row += 1) {
        const yTop = -r + (row * 2 * r) / rows;
        const offset = (row * 0.9) % 8; // the three-start helix, seen as a stagger between rows
        const inner = row > 0 && row < rows - 1;
        for (let s = a - offset; s < b; s += 8) {
          const s0 = Math.max(a, s);
          const s1 = Math.min(b, s + 8);
          if (s1 - s0 < 1.2) continue; // under a seventh of a dimer is not a dimer
          const tileW = Number(((s1 - s0) * k - HAIRLINE).toFixed(1));
          if (!(tileW > 0)) continue; // and this one is narrower than the gap around it
          const beta = Math.round((s + offset) / 8) % 2 === 0;
          g.append(el('rect', {
            x: (s0 * k).toFixed(1), y: yTop.toFixed(1), width: tileW, height: tileH,
            rx: 1.2, fill: tint(col, inner ? (beta ? 44 : 30) : (beta ? 94 : 74)),
          }));
        }
      }
    }
    if (broken) {
      // Free tubulin dimers, the microtubule that was.
      for (let i = 0; i < 52; i += 1) {
        const s = trackNm * (0.28 + rng() * 0.72);
        const d = (rng() * 2 - 1) * 3.2 * r / k;
        g.append(el('rect', { x: (s * k).toFixed(1), y: (d * k - 1.6).toFixed(1), width: (8 * k * 0.8).toFixed(1), height: 3.2, rx: 1.4, fill: tint(col, 70), transform: `rotate(${(rng() * 90 - 45).toFixed(1)} ${(s * k).toFixed(1)} ${(d * k).toFixed(1)})` }));
      }
    }
  } else {
    // Two strands of 5.5 nm subunits wound about a common axis, crossing over every 36 nm. The twist is
    // only ±0.75 nm — a real filament is a slightly wavy rod — so which strand is in front is what makes
    // the twist visible, and that is drawn rather than exaggerated.
    const sub = 5.5;
    const amp = (f.diameterNm - sub) / 2;
    const rr = (sub / 2) * k;
    for (const [a, b] of live) {
      const back = [];
      const front = [];
      for (const [strand, phase] of [[0, 0], [1, Math.PI]]) {
        for (let s = a + strand * (sub / 2); s <= b; s += sub) {
          const ph = (2 * Math.PI * s) / 72 + phase;
          const d = amp * Math.sin(ph);
          const inFront = Math.cos(ph) > 0;
          const node = el('circle', { cx: (s * k).toFixed(1), cy: (-d * k).toFixed(1), r: rr.toFixed(2), fill: tint(col, inFront ? 92 : 54), stroke: tint(col, inFront ? 100 : 66), 'stroke-width': 0.7 });
          (inFront ? front : back).push(node);
        }
      }
      g.append(...back, ...front);
    }
    if (broken) {
      for (let i = 0; i < 34; i += 1) {
        const s = trackNm * rng();
        const d = (rng() * 2 - 1) * 5;
        g.append(el('circle', { cx: (s * k).toFixed(1), cy: (d * k).toFixed(1), r: (rr * 0.9).toFixed(2), fill: tint(col, 62) }));
      }
    }
  }
  return { node: g, live, r, col };
}

// A bundle of intermediate filaments crossing behind: ropes with no polarity and no motor on them.
function buildIntermediates(trackNm, k, across, rng) {
  const col = colourOf('intermediateFilament');
  const g = el('g', { class: 'cy-if' });
  const w = 10 * k; // 8-12 nm across, so a third of a microtubule
  for (let i = 0; i < 3; i += 1) {
    const s0 = trackNm * (-0.02 + i * 0.34);
    const pts = [];
    for (let j = 0; j <= 5; j += 1) {
      const u = j / 5;
      pts.push([(s0 + u * trackNm * 0.42) * k, (across * (0.55 - u * 1.1) + (rng() - 0.5) * across * 0.2)]);
    }
    const d = smooth(pts, { closed: false });
    g.append(el('path', { d, fill: 'none', stroke: tint(col, 44), 'stroke-width': w.toFixed(1), 'stroke-linecap': 'round', opacity: 0.42 }));
    g.append(el('path', { d, fill: 'none', stroke: tint(col, 70), 'stroke-width': (w * 0.14).toFixed(1), 'stroke-linecap': 'round', opacity: 0.32 }));
  }
  return g;
}

// The motor, its cargo and its two heads, drawn in the local frame at position `s` (nm along the track).
function buildMotor(motorId, s, k, { phase, dirSign, r, stalled, detached, side = 1 }) {
  const m = MOTORS[motorId];
  const col = colourOf('motor');
  const cargoCol = ORGANELLE_BY_ID.vesicle.color;
  const g = el('g', { class: 'cy-motor' });
  const step = m.stepNm;
  const lift = detached ? 6 : 0;
  // Hand over hand: the rear head swings over the leading one during the first part of each step.
  const n = s / step;
  const kFloor = Math.floor(n);
  const ph = stalled ? 0 : clamp(phase ?? n - kFloor, 0, 1);
  const u = clamp(ph / 0.62, 0, 1);
  const lead = (kFloor + (dirSign > 0 ? 1 : 0)) * step;
  const rearFrom = (kFloor + (dirSign > 0 ? 0 : 1)) * step;
  const rearTo = rearFrom + dirSign * 2 * step;
  const rear = rearFrom + (rearTo - rearFrom) * easeInOut(u);
  const arc = Math.sin(Math.PI * u) * step * 0.55;
  const headR = (motorId === 'dynein' ? 7 : 4.5) * k;
  const neck = (motorId === 'myosin' ? 20 : motorId === 'dynein' ? 18 : 12) * k;
  const foot = (d) => -side * (r + lift * k + d);
  const stalkTop = foot(neck + headR * 1.4);
  const away = (d) => stalkTop - side * d;
  const cargoR = 25 * k; // a 50 nm vesicle

  const legs = [[lead, 0], [rear, arc]];
  for (const [pos, up] of legs) {
    const hx = pos * k;
    const hy = foot(headR + up * k);
    g.append(el('path', {
      d: `M${(s * k).toFixed(1)} ${stalkTop.toFixed(1)} Q${((s * k + hx) / 2).toFixed(1)} ${((stalkTop + hy) / 2 - side * 3).toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`,
      fill: 'none', stroke: tint(col, 86), 'stroke-width': Math.max(1.6, 2.4 * k * 1.2).toFixed(1), 'stroke-linecap': 'round',
    }));
    if (motorId === 'dynein') {
      g.append(el('circle', { cx: hx.toFixed(1), cy: hy.toFixed(1), r: headR.toFixed(1), fill: 'none', stroke: tint(col, 100), 'stroke-width': (headR * 0.5).toFixed(1) }));
    } else {
      g.append(el('ellipse', { cx: hx.toFixed(1), cy: hy.toFixed(1), rx: (headR * 1.25).toFixed(1), ry: headR.toFixed(1), fill: tint(col, 100) }));
    }
  }
  // Stalk and cargo.
  g.append(el('path', { d: `M${(s * k).toFixed(1)} ${stalkTop.toFixed(1)} L${(s * k).toFixed(1)} ${away(cargoR * 0.35).toFixed(1)}`, fill: 'none', stroke: tint(col, 86), 'stroke-width': Math.max(1.8, 3 * k).toFixed(1), 'stroke-linecap': 'round' }));
  g.append(el('circle', { cx: (s * k).toFixed(1), cy: away(cargoR * 1.3).toFixed(1), r: cargoR.toFixed(1), fill: tint(cargoCol, 74), stroke: tint(cargoCol, 100), 'stroke-width': 1.2 }));
  return g;
}

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  let pinned = typeof ctx.pinnedTime === 'number';
  let clockT = pinned ? ctx.pinnedTime : 0;
  const wall0 = performance.now() / 1000;
  const now = () => (pinned ? clockT : performance.now() / 1000 - wall0);

  let filament = 'microtubule';
  let motor = 'kinesin';
  let atp = 1;
  let drug = null;
  let race = false;
  let narrow = null;
  let trackNm = 600;
  let destroyed = false;
  let ready = false;
  let raf = 0;

  // The seeded diffusion walk: cumulative displacement in nm at WALK_DT simulated seconds a sample.
  const walk = new Float64Array(WALK_N);
  {
    const rng = mulberry32(SEED + 3);
    const sigma = Math.sqrt(2 * D_UM2_S * WALK_DT) * 1000; // nm per sample
    let x = 0;
    for (let i = 0; i < WALK_N; i += 1) {
      // Box-Muller from the seeded generator, so every run is the same walk.
      const u1 = Math.max(1e-9, rng());
      const u2 = rng();
      x += sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      walk[i] = x;
    }
  }

  const compatible = () => MOTORS[motor].track === filament;
  const trackBroken = () => Boolean(drug && DRUGS[drug].hits === filament && DRUGS[drug].breaks);
  const speedNow = () => {
    if (!compatible() || trackBroken() || atp < STALL) return 0;
    return MOTORS[motor].vmax * (atp / (atp + KM)) * (1 + KM);
  };
  const dirSign = () => (MOTORS[motor].direction === 'plus' ? 1 : -1);

  // A run is the stretch of clock over which nothing the reader controls has changed, so the position is
  // a pure function of the clock and setTime reproduces it exactly.
  let run = { t0: 0, pos0: 0, v: 0, sign: 1, steps0: 0, diffT0: 0, diff0: 0, arrived: null };
  function restart(t = now(), { hard = false } = {}) {
    const pos = hard ? (dirSign() > 0 ? 0 : trackNm) : positionNm(t);
    run = {
      t0: t, pos0: pos, v: speedNow(), sign: dirSign(),
      steps0: hard ? 0 : stepsAt(t),
      diffT0: t, diff0: hard ? 0 : diffusionNm(t), arrived: hard ? null : run.arrived,
    };
  }
  function positionNm(t = now()) {
    const dt = Math.max(0, t - run.t0) / SLOW;
    return clampNm(run.pos0 + run.sign * run.v * dt, trackNm);
  }
  function stepsAt(t = now()) {
    return run.steps0 + Math.floor(Math.abs(positionNm(t) - run.pos0) / MOTORS[motor].stepNm);
  }
  function diffusionNm(t = now()) {
    if (run.arrived !== null) return trackNm;
    const sim = Math.max(0, t - run.diffT0) / SLOW;
    const i = Math.min(WALK_N - 1, Math.floor(sim / WALK_DT));
    const frac = Math.min(1, sim / WALK_DT - i);
    const a = walk[i];
    const b = walk[Math.min(WALK_N - 1, i + 1)];
    return clampNm(run.diff0 + (a + (b - a) * frac), trackNm);
  }

  // ----- DOM -----
  const wrap = h('div', { class: 'tb-cyto' });
  wrap.append(h('style', { text: CSS }));
  const panel = h('div', { class: 'cy-panel' });
  const trackBox = h('div', { class: 'cy-track' });
  wrap.append(panel, trackBox);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' });
  root.append(wrap, toolbar);

  const group = (legendText, buttons) => {
    const pick = h('div', { class: 'cy-pick', role: 'group', 'aria-label': legendText });
    pick.append(...buttons);
    return h('div', { class: 'cy-group' }, [h('div', { class: 'cy-legend', text: legendText }), pick]);
  };
  const pickBtn = (label, onClick, swatch = null) => {
    const b = h('button', { type: 'button', text: label, 'aria-pressed': 'false' });
    if (swatch) { b.dataset.swatch = ''; b.style.setProperty('--cy-swatch', swatch); }
    b.addEventListener('click', onClick);
    return b;
  };
  const filBtns = Object.values(FILAMENTS).map((f) => { const b = pickBtn(f.name, () => setFilament(f.id), colourOf(f.id)); b.dataset.id = f.id; return b; });
  const motorBtns = Object.values(MOTORS).map((m) => { const b = pickBtn(m.short, () => setMotor(m.id), colourOf('motor')); b.dataset.id = m.id; b.title = m.name; return b; });
  panel.append(group('Filament', filBtns), group('Motor', motorBtns));

  const read = h('dl', { class: 'cy-read' });
  const rows = {};
  for (const [key, label] of [['direction', 'Direction'], ['step', 'Step'], ['speed', 'Speed'], ['steps', 'Steps · ATP'], ['position', 'Travelled']]) {
    const dt = h('dt', { text: label });
    const dd = h('dd', { text: '—' });
    rows[key.split(' ')[0]] = dd;
    read.append(dt, dd);
  }
  const msg = h('div', { class: 'cy-msg', 'aria-live': 'polite' });
  const foot = h('div', { class: 'cy-foot' });
  panel.append(read, msg, foot);

  const button = (label, onClick, pressed = null) => {
    const b = h('button', { type: 'button', class: 'fig-btn', text: label });
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    toolbar.append(b);
    return b;
  };
  const atpBox = h('label', { class: 'fig-chip cy-slider' });
  const atpRange = h('input', { type: 'range', class: 'fig-range', min: '0', max: '100', step: '1', value: '100', 'aria-label': 'ATP, 0 to 100 per cent' });
  const atpVal = h('span', { text: 'ATP 100%' });
  atpBox.append(atpRange, atpVal);
  toolbar.append(atpBox);
  atpRange.addEventListener('input', () => {
    atp = Number(atpRange.value) / 100;
    restart();
    paintPanel();
    paintMotor();
    schedule();
  });
  const drugBtns = {};
  for (const d of Object.values(DRUGS)) drugBtns[d.id] = button(d.name, () => setDrug(d.id), false);
  const btnRace = button('Race diffusion', () => {
    race = !race;
    btnRace.setAttribute('aria-pressed', String(race));
    restart(now(), { hard: false });
    run.diffT0 = now();
    run.diff0 = 0;
    run.arrived = null;
    paintPanel();
    paintTrack();
    schedule();
  }, false);
  const btnReset = button('Reset', () => {
    drug = null;
    atp = 1;
    atpRange.value = '100';
    for (const b of Object.values(drugBtns)) b.setAttribute('aria-pressed', 'false');
    restart(now(), { hard: true });
    paintPanel();
    paintTrack();
    schedule();
  });
  btnReset.setAttribute('aria-label', 'Reset: put the cargo back and clear the drugs');


  // ----- state changes -----
  function setFilament(id) {
    if (filament === id) return;
    filament = id;
    restart(now(), { hard: true });
    paintPanel();
    paintTrack();
    schedule();
  }
  function setMotor(id) {
    if (motor === id) return;
    motor = id;
    restart(now(), { hard: true });
    paintPanel();
    paintTrack();
    schedule();
  }
  function setDrug(id) {
    drug = drug === id ? null : id;
    for (const [k, b] of Object.entries(drugBtns)) b.setAttribute('aria-pressed', String(drug === k));
    restart();
    paintPanel();
    paintTrack();
    schedule();
  }

  // ----- drawing -----
  let geom = null;
  let motorLayer = null;
  let raceLayer = null;

  function paintTrack() {
    const w = Math.max(120, Math.round(trackBox.clientWidth));
    const hgt = Math.max(90, Math.round(trackBox.clientHeight));
    const rng = mulberry32(SEED);
    trackNm = narrow ? 400 : 600;
    const along = narrow ? hgt : w;
    const across = narrow ? w : hgt;
    const pad = narrow ? 40 : 46;
    const k = (along - pad * 2) / trackNm; // pixels per nanometre: the one scale in the drawing
    const svg = el('svg', { viewBox: `0 0 ${w} ${hgt}`, width: w, height: hgt, 'aria-hidden': 'true' });

    // Local frame: s to the right, d up. The narrow layout rotates the group rather than redrawing it.
    const lanes = narrow
      ? { microtubule: across * 0.62, actin: across * 0.18 }
      : { microtubule: across * 0.40, actin: across * 0.82 };
    // side = 1 puts the motor on the local -y side, which is up when wide and left when narrow.
    const sides = narrow ? { microtubule: 1, actin: -1 } : { microtubule: 1, actin: 1 };
    const toScreen = (s, laneAcross) => (narrow
      ? [laneAcross, hgt - pad - s * k]
      : [pad + s * k, laneAcross]);
    const laneTransform = (laneAcross) => (narrow
      ? `translate(${laneAcross} ${hgt - pad}) rotate(-90)`
      : `translate(${pad} ${laneAcross})`);

    const ifg = buildIntermediates(trackNm, k, across * 0.22, rng);
    ifg.setAttribute('transform', laneTransform(narrow ? across * 0.50 : across * 0.62));
    svg.append(ifg);

    const parts = {};
    for (const id of ['microtubule', 'actin']) {
      const dim = id !== filament;
      const f = buildFilament(id, trackNm, k, mulberry32(SEED + (id === 'actin' ? 11 : 5)), { drug, dim });
      f.node.setAttribute('transform', laneTransform(lanes[id]));
      svg.append(f.node);
      parts[id] = f;
    }

    // Ends, names and the scale bar, in screen space so the type is never rotated.
    const labels = el('g');
    for (const id of ['microtubule', 'actin']) {
      const f = FILAMENTS[id];
      const dim = id !== filament;
      const [mx, my] = toScreen(-6, lanes[id]);
      const [px, py] = toScreen(trackNm + 6, lanes[id]);
      const gEnd = el('g', { class: dim ? 'cy-dim' : '' }, [
        text(mx, my + (narrow ? 0 : 5), '−', { anchor: narrow ? 'middle' : 'end', class: 'cy-end', 'font-size': 15 }),
        text(px, py + (narrow ? 10 : 5), '+', { anchor: narrow ? 'middle' : 'start', class: 'cy-end', 'font-size': 15 }),
      ]);
      const label = narrow ? `${f.name.split(' ')[0]} · ${f.diameterNm} nm` : `${f.name} · ${f.diameterNm} nm`;
      const est = label.length * (narrow ? 5.2 : 6.1);
      // On the narrow stage the names sit past the track ends. The selected filament's goes to the end
      // its motor walks toward, because the cargo starts at the other one and sat on the name there.
      const atTop = !dim && dirSign() > 0;
      const nameAt = narrow
        ? [clamp(lanes[id], est / 2 + 2, w - est / 2 - 2), atTop ? pad - 6 * k - 9 : hgt - pad + (dim ? 27 : 14)]
        : [pad + trackNm * k * 0.78, lanes[id] - parts[id].r - 9];
      gEnd.append(text(nameAt[0], nameAt[1], label, { anchor: 'middle', class: dim ? 'cy-sub' : 'cy-lab', 'font-size': narrow ? 9.5 : 11 }));
      labels.append(gEnd);
    }
    if (!narrow) {
      const [ix, iy] = toScreen(trackNm * 0.5, across * 0.62);
      labels.append(text(ix, iy + 4, 'Intermediate filaments · 10 nm · no polarity, so no motor walks them', { anchor: 'middle', class: 'cy-sub', 'font-size': 10 }));
    }

    // Where the motor starts to beat diffusion, marked on the track it is racing along.
    if (race && compatible()) {
      const xStar = (2 * D_UM2_S * 1e6) / MOTORS[motor].vmax; // nm
      if (xStar > 12 && xStar < trackNm * 0.92) {
        const [ax, ay] = toScreen(xStar, lanes[filament]);
        const arm = parts[filament].r + 14;
        labels.append(el('path', {
          d: narrow ? `M${(ax - arm).toFixed(1)} ${ay.toFixed(1)}h${(arm * 2).toFixed(1)}` : `M${ax.toFixed(1)} ${(ay - arm).toFixed(1)}v${(arm * 2).toFixed(1)}`,
          stroke: C.gold, 'stroke-width': 1.4, 'stroke-dasharray': '3 3', fill: 'none',
        }));
        const right = ax + arm + 46 < w;
        labels.append(text(
          narrow ? (right ? ax + arm + 4 : ax - arm - 4) : ax,
          narrow ? ay - 4 : ay - arm - 5,
          `${Math.round(xStar)} nm`,
          { anchor: narrow ? (right ? 'start' : 'end') : 'middle', class: 'cy-sub', 'font-size': 9.5 },
        ));
      }
    }

    motorLayer = el('g', { transform: laneTransform(lanes[filament]) });
    raceLayer = el('g', { transform: laneTransform(lanes[filament]) });
    svg.append(raceLayer, motorLayer, labels);
    trackBox.replaceChildren(svg);
    geom = { k, lanes, trackNm, r: parts[filament].r, side: sides[filament] };
    paintMotor();
  }

  function paintMotor() {
    if (!geom || !motorLayer) return;
    const t = now();
    const s = positionNm(t);
    const broken = trackBroken();
    const stalled = !compatible() || broken || atp < STALL;
    motorLayer.replaceChildren();
    if (compatible()) {
      motorLayer.append(buildMotor(motor, s, geom.k, {
        dirSign: dirSign(), r: geom.r, stalled, detached: broken, side: geom.side,
        phase: stalled ? 0 : undefined,
      }));
    }
    raceLayer.replaceChildren();
    if (race) {
      const d = diffusionNm(t);
      if (run.arrived === null && d >= geom.trackNm - 0.5) run.arrived = t;
      const cargoR = 25 * geom.k;
      raceLayer.append(el('circle', {
        cx: (d * geom.k).toFixed(1), cy: (narrow ? 0 : geom.side * (geom.r + cargoR + 5)).toFixed(1), r: cargoR.toFixed(1),
        fill: tint(C.water, 42), 'fill-opacity': narrow ? 0.55 : 1, stroke: tint(C.water, 88), 'stroke-width': 1.3, 'stroke-dasharray': '4 3',
      }));
    }
  }

  function paintReadout() {
    const m = MOTORS[motor];
    const ok = compatible();
    const stalled = !ok || trackBroken() || atp < STALL;
    rows.direction.textContent = ok && !stalled ? (m.direction === 'plus' ? 'to the plus end →' : '← to the minus end') : 'none';
    rows.step.textContent = ok ? `${m.stepNm} nm` : '—';
    rows.speed.textContent = ok ? `${fmt(speedNow(), 0)} nm/s` : '—';
    rows.steps.textContent = ok ? fmt(stepsAt()) : '—';
    rows.position.textContent = ok ? `${fmt(positionNm(), 0)} of ${trackNm} nm` : '—';
  }

  function paintPanel() {
    const m = MOTORS[motor];
    const ok = compatible();
    const broken = trackBroken();
    const stalled = !ok || broken || atp < STALL;
    const v = speedNow();
    for (const b of filBtns) b.setAttribute('aria-pressed', String(b.dataset.id === filament));
    for (const b of motorBtns) b.setAttribute('aria-pressed', String(b.dataset.id === motor));
    atpVal.textContent = `ATP ${Math.round(atp * 100)}%`;
    paintReadout();
    foot.textContent = narrow
      ? `${trackNm} nm of track · 1/${SLOW} speed${race ? ' · blue = diffusion' : ''}`
      : race
        ? `Gold cargo: hauled. Dashed blue: the same cargo left to diffuse, D = ${D_UM2_S} µm² s⁻¹. ${trackNm} nm of track at 1/${SLOW} of real speed.`
        : `${trackNm} nm of track, shown at 1/${SLOW} of real speed. One ATP a step.`;

    msg.classList.toggle('is-refused', !ok);
    msg.replaceChildren();
    if (!ok) {
      msg.append(h('b', { text: `${m.name} cannot walk on ${FILAMENTS[filament].article} ${FILAMENTS[filament].name.toLowerCase()}. ` }), document.createTextNode(m.refuse));
      return;
    }
    if (broken) {
      msg.append(h('b', { text: 'The track is gone. ' }), document.createTextNode(`${DRUGS[drug].note} The cargo stays where it was: a motor with nothing to hold does not drift home.`));
      return;
    }
    if (drug && DRUGS[drug].hits === filament) {
      msg.append(h('b', { text: `${DRUGS[drug].name}. ` }), document.createTextNode(DRUGS[drug].note));
      return;
    }
    if (atp < STALL) {
      msg.append(h('b', { text: 'Stalled: no ATP. ' }), document.createTextNode('Each step costs one molecule. With none left the heads stay bound and the cargo stops where it is.'));
      return;
    }
    if (race) {
      const xStar = (2 * D_UM2_S) / (m.vmax / 1000); // µm
      const cellS = 20 / (m.vmax / 1000);
      const cellD = (20 * 20) / (2 * D_UM2_S);
      const axonS = 1e6 / (m.vmax / 1000);
      const axonD = (1e6 * 1e6) / (2 * D_UM2_S);
      msg.append(
        h('b', { text: `Diffusion is quicker below ${fmt(xStar * 1000, 0)} nm. ` }),
        document.createTextNode(narrow
          ? `Past that the motor wins. A 20 µm cell: ${saidTime(cellS)} against ${saidTime(cellD)}. A metre of axon: ${saidTime(axonS)} against ${saidTime(axonD)}.`
          : `Past that the motor wins, by more the further it goes. Across a 20 µm cell: ${saidTime(cellS)} against ${saidTime(cellD)}. Down a metre of axon: ${saidTime(axonS)} against ${saidTime(axonD)}.`),
      );
      return;
    }
    msg.append(
      h('b', { text: `${m.name} walks ${m.direction === 'plus' ? 'to the plus end' : 'to the minus end'}. ` }),
      document.createTextNode(narrow
        ? `${m.stepNm} nm a step, ${fmt(m.vmax, 0)} nm a second at full ATP.`
        : `${m.stepNm} nm a step, one ATP a step, ${fmt(m.vmax, 0)} nm a second at full ATP. ${FILAMENTS[filament].name}: ${FILAMENTS[filament].built}.`),
    );
  }

  // ----- clock -----
  function frame() {
    raf = 0;
    if (destroyed) return;
    paintMotor();
    paintReadout();
    schedule();
  }
  function moving() {
    if (pinned || reduced || destroyed) return false;
    if (race && run.arrived === null) return true;
    if (speedNow() <= 0) return false;
    const p = positionNm();
    return dirSign() > 0 ? p < trackNm - 0.01 : p > 0.01;
  }
  let visible = true;
  function schedule() {
    if (raf || !visible || !moving()) return;
    raf = requestAnimationFrame(frame);
  }

  // ----- layout -----
  let padPx = 0;
  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    if (!w) return false;
    const wantNarrow = w < NARROW_W;
    const changed = wantNarrow !== narrow;
    if (changed) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
      root.classList.toggle('tb-cyto-narrow', narrow);
      btnRace.textContent = narrow ? 'Race' : 'Race diffusion';
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 22;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--cy-pad', `${pad}px`);
    }
    return changed;
  }

  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    applyLayout();
    paintTrack();
    paintPanel();
    if (!ready) { ready = true; ctx.onReady(); }
  });
  observer.observe(root);
  observer.observe(toolbar);
  observer.observe(trackBox);

  applyLayout();
  // The run starts at t = 0, not at whatever the clock says now, so `?t=6` is six seconds of walking
  // rather than the starting frame with a different number on it.
  restart(0, { hard: true });
  paintTrack();
  paintPanel();
  if (root.getBoundingClientRect().width) { ready = true; ctx.onReady(); }
  schedule();

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      root.replaceChildren();
    },
    setTime(seconds) {
      pinned = true;
      clockT = Number(seconds) || 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      paintMotor();
      paintPanel();
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setTheme() { paintTrack(); paintPanel(); },
    describe() {
      const ok = compatible();
      const intact = !trackBroken();
      const stalled = !ok || !intact || atp < STALL;
      return {
        filament,
        filamentDiameterNm: FILAMENTS[filament].diameterNm,
        motor,
        compatible: ok,
        direction: ok && !stalled ? MOTORS[motor].direction : 'none',
        stepNm: MOTORS[motor].stepNm,
        steps: ok ? stepsAt() : 0,
        positionNm: Number(positionNm().toFixed(1)),
        speedNmPerS: Number(speedNow().toFixed(1)),
        atp: Number(atp.toFixed(2)),
        drug,
        trackIntact: intact,
        stalled,
        diffusionRace: race,
      };
    },
  };
}
