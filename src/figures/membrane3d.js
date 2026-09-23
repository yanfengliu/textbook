// A patch of plasma membrane in three dimensions, turned over and set running.
//
// WHAT IS ON THE STAGE. A square patch 22 nm on a side — 0.000 48 µm², well under the square micrometre
// of the brief, and at a scale where one phospholipid is a disc you can pick out. 1 scene unit = 1 nm.
// Two leaflets of phospholipid with their tails meeting in the middle (head centres at y = ±3.1, so the
// sheet measures about 7 nm across, the figure §4.1 gives); cholesterol wedged between the tails;
// transmembrane proteins as helix bundles and as barrels; peripheral proteins resting on the inner face;
// branched sugar chains standing on the OUTER face only; and filaments of cytoskeleton under the sheet,
// tethering five of the proteins from below.
//
// THE DEFAULT VIEW is theta 0.62, phi 1.10, distance 47 — about twenty-five degrees above the plane of
// the sheet, which is the family of angles that shows the outer face with its sugars AND the underside
// with its peripheral proteins and tethers at the same time. Looking straight down (phi near 0) the
// sheet is a carpet of heads and the cytoskeleton is invisible; edge-on (phi near π/2) neither face
// reads at all.
//
// COLOUR comes from `membranePart(id)` in src/palette.js and from the one element table; no hex is
// written here. Those fills are fixed light colours in both themes, so a symbol written on one takes the
// LIGHT palette's ink or paper whatever the page's theme is — but this figure writes no symbol on a
// fill, and what it does instead is check the same fills under the light rig in both themes, which is
// what the sweep frames are for.
//
// THE CLOCK. One second on this stage is about six microseconds in a real membrane: a slowdown of about
// 170 000, stated on the stage and in the readout, because at life speed a lipid crosses this patch in a
// hundred nanoseconds. Everything that moves is a function of that clock and of a seeded generator, so
// setTime(t) reproduces a frame exactly. The walk is stepped fifteen times a second and the drawn
// position is interpolated between steps — the walk is unchanged, only the drawing is smoothed, which is
// the difference between a sheet that flows and a sheet that flickers.
//
// THE MODEL, and what is calibrated rather than derived.
//   Order. A composition sets at a temperature that falls with unsaturation: T_m = 41 − 45u, which puts
//   an all-saturated sheet at 41 °C (DPPC) and a half-unsaturated one near 18 °C. The order parameter is
//   o(T) = 0.5 + A·tanh((T_m − T)/w) with A = 0.5(1 − 0.8c) and w = 6 + 30c for cholesterol fraction c.
//   Cholesterol therefore does two opposite things, which is the buffering claim §4.2 makes and the
//   reason the two numbers are both on the readout: it FLATTENS the curve, so the temperature at which
//   the sheet sets (o = 0.66, reported as `transitionC`) drops by about twelve degrees between c = 0 and
//   c = 0.5, and it RAISES the order at body temperature, where the sheet was fluid.
//   Diffusion. D = D_MAX·(1 − o)², with D_MAX chosen so that the default composition (37 °C, 20 %
//   cholesterol, 50 % unsaturated tails) gives about 1 µm² s⁻¹ — the measured figure the prose quotes.
//   That calibration is the only fitted constant here; everything else falls out of it. A protein moves
//   at a fortieth of that, and a tethered protein not at all.
//   Swaps. A hopping walk with jump length a and coefficient D exchanges neighbours at 4D/a², which for
//   D = 1 µm² s⁻¹ and a = 0.8 nm is 6 × 10⁶ a second per molecule — the "ten million times a second" of
//   §4.2. The counter is that rate over the whole patch. Leaflet crossings are counted, not modelled:
//   nothing in the walk can move a lipid between leaflets, so the counter stays at zero until the reader
//   forces one, which is the comparison the section is making.
//   Bleach. A 7 nm disc of label is switched off and the recovery is the fraction of the molecules now
//   inside that disc which are unbleached. D is fitted from the half-time by Axelrod's t½ = 0.224 w²/D,
//   so the number in the readout is the reader's own measurement and not a constant printed on the
//   figure. The immobile fraction is reported over the PROTEINS in the disc, because that is what it is
//   about: the tethered ones never come back, and the reader can see which.
//
// COMPOSITION. The drawing is the whole stage. A typographic readout sits over the top-left corner at
// desktop width and across the top at a phone's, where the patch is centred and that strip is paper. The
// recovery curve is inset over the membrane's lower right above 800 px and takes a row of its own under
// the view below it, as the brief asks, and it exists only after a bleach — before that it would be an
// empty pane, and an empty pane is the composition failure this chapter's brief opens with.
//
// The narrow composition stacks the three composition sliders under the view rather than making them one
// row of steppers. A stepper row is what the brief suggested; three eleven-character words and six
// buttons measure about 360 px at the 10.5 px the interface face is set in here, which at 390 px leaves
// nothing and forces either a wrap or type under the nine-device-pixel floor. The words are the same at
// both widths, which is the constraint that matters, because an item's goal quotes them.
import { ORGANELLE_BY_ID, membranePart, mix } from '../palette.js';
import {
  THREE, mergeGeometries, mulberry32, clamp, createRig, Orbit, Spin, makeClock, createLoop,
  Labels, Materials, bindInput, pickAt, disposeScene,
} from './lib/three-common.js';
import { readoutCss, readoutTable, round, grouped } from './lib/mol-draw.js';
import { el, h, text, C } from './lib/svg.js';

export const meta = { kind: 'membrane3d', title: 'A patch of membrane, turned over and set running', needsWebGL: true, aspect: 16 / 10 };
// About twenty-five degrees above the plane of the sheet. High enough that the mosaic reads as a mosaic
// — proteins scattered across a face — and low enough that the sheet's own edge shows two rows of heads
// with the tails between them, the cholesterol among the tails, and the underside with its peripheral
// proteins and its tethers. Looking further down, the only face on the stage is the outer one.
export const DEFAULT_VIEW = Object.freeze({ theta: 0.62, phi: 1.1, distance: 47 });

// ---------------------------------------------------------------- constants

const PATCH = 22; // nm across, square, periodic: a molecule leaving one edge comes back at the other
const HALF = PATCH / 2;
const ROWS = 25;
const COLS = 22;
const DZ = PATCH / ROWS;
const DX = PATCH / COLS;
const HEAD_Y = 3.1; // head centre above the mid-plane, nm
// A head is drawn a little wider than the lattice spacing, so each face reads as a packed surface. At
// the true 0.42 nm the heads stood apart and the eye went straight through the gaps into the tails, and
// a sheet 7 nm thick looked like a hairy carpet half its own depth again.
const HEAD_R = 0.53;
const TAIL_LEN = 2.5;

const SECONDS_PER_WATCHED = 6e-6; // membrane seconds per second on this stage
const WALK_HZ = 15;
const D_MAX = 1.28e6; // nm^2/s, chosen so the default composition reads about 1 µm^2/s
const PROTEIN_D_SHARE = 0.025; // a membrane protein against a lipid
const JUMP_NM = 0.8; // neighbour-exchange distance, for the swap counter
// The bleached disc, nm. Its size is a compromise the patch forces and the readout states: the patch is
// finite and periodic, so a disc that is a third of it can never come back more than two thirds of the
// way, and one small enough to recover fully holds no protein to measure an immobile fraction with. At
// 5 nm the disc is a sixth of the patch — it recovers to about 85 %, in about a second, and holds four
// proteins of which about one is tethered. At 7 nm it plateaued at 0.68 and `npm run drive` read that as
// a figure that had failed to recover.
const BLEACH_R = 5;
const FLIP_SECONDS = 1.1;
const ZOOM_MIN = 15;
const ZOOM_MAX = 95;
// No idle autorotation. The sheet is already moving — eleven hundred lipids shuffling is the subject —
// and a patch that also turned on its own would be two motions competing for the same attention.
const SPIN_RATE = 0;
const TRAIL_MAX = 240;

const TEMP = { min: 0, max: 50, start: 37 };
const CHOL = { min: 0, max: 0.5, start: 0.2 };
const UNSAT = { min: 0, max: 1, start: 0.5 };

const Y = new THREE.Vector3(0, 1, 0);

// Order parameter, and the two temperatures the composition puts either side of it.
const amplitude = (c) => 0.5 * (1 - 0.8 * c);
const width = (c) => 6 + 30 * c;
const meltC = (u) => 41 - 45 * u;
function orderAt(tempC, c, u) {
  return clamp(0.5 + amplitude(c) * Math.tanh((meltC(u) - tempC) / width(c)), 0, 1);
}
// The temperature at which this composition reaches order `o`; NaN-free because A is never 0 here.
function tempAtOrder(o, c, u) {
  const x = clamp((o - 0.5) / amplitude(c), -0.999, 0.999);
  return meltC(u) - width(c) * Math.atanh(x);
}
const phaseOf = (o) => (o >= 0.66 ? 'gel' : o <= 0.34 ? 'fluid' : 'transition');

// Box-Muller from two stateless hashes, so a lipid's step n is the same on every machine and at every
// frame rate. No Math.random anywhere in this file.
function hash2(a, b) {
  let hv = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x165667b1, 0xc2b2ae35);
  hv ^= hv >>> 15;
  hv = Math.imul(hv, 0x2545f491);
  hv ^= hv >>> 13;
  return (hv >>> 0) / 4294967296;
}
function gauss2(i, n) {
  const u1 = Math.max(hash2(i, n * 2), 1e-7);
  const u2 = hash2(i, n * 2 + 1);
  const r = Math.sqrt(-2 * Math.log(u1));
  return [r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)];
}

const wrap = (v) => (v > HALF ? v - PATCH : v < -HALF ? v + PATCH : v);

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-mem3d')}
.tb-mem3d { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto auto;
  font-family: var(--font-ui); }
.tb-mem3d .m3-view { position: relative; min-height: 0; outline: none; touch-action: pan-y;
  cursor: grab; user-select: none; -webkit-user-select: none; }
.tb-mem3d .m3-view.is-active { touch-action: none; }
.tb-mem3d .m3-view.is-drag { cursor: grabbing; }
.tb-mem3d .m3-view.is-pick { cursor: pointer; }
.tb-mem3d .m3-view:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
.tb-mem3d .m3-view canvas { display: block; width: 100%; height: 100%; }
.tb-mem3d .m3-leaders { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;
  overflow: visible; }
.tb-mem3d .m3-leaders line { stroke: var(--ink-faint); stroke-width: 1; fill: none; }
.tb-mem3d .m3-leaders circle { fill: var(--paper); stroke: var(--ink-soft); stroke-width: 1.2; }
.tb-mem3d .m3-labels { position: absolute; inset: 0; pointer-events: none; }
.tb-mem3d .m3-labels .fig-label { transition: none; }
.tb-mem3d .m3-read { position: absolute; left: 0.55rem; top: 0.4rem; pointer-events: none; overflow: visible; }
/* The readout and the recovery curve are set over the membrane, and zoomed in the membrane fills the
   corner they sit in. Each glyph carries the paper with it — the sorting activity's trick, and phlab's —
   rather than sitting on a panel, because the stage is the only drawn rectangle in the book. */
.tb-mem3d .m3-read text, .tb-mem3d .m3-curve text { stroke: var(--paper); stroke-width: 2.6px;
  stroke-linejoin: round; paint-order: stroke; }
.tb-mem3d .m3-read line, .tb-mem3d .m3-curve line, .tb-mem3d .m3-curve path { paint-order: stroke; }
/* Above 800 px the recovery curve is inset over the lower right of the membrane; below it, the element
   goes back into the grid and takes a row under the view. An absolutely positioned grid item is out of
   flow, so the row it would have filled collapses to nothing at the wide size. */
.tb-mem3d .m3-curve { position: absolute; right: 0.5rem; bottom: 0.4rem; width: 34%; height: 33%; }
.tb-mem3d.is-narrow .m3-curve { position: static; width: auto; height: 78px; margin: 0 0.55rem 0.15rem; }
.tb-mem3d .m3-curve[hidden] { display: none; }
.tb-mem3d .m3-curve > svg { display: block; width: 100%; height: 100%; overflow: visible; }
/* Two rows, grouped by what the controls do: what to show and what to run on the first, what to change
   on the second. Eleven controls on one line wrapped wherever the width happened to run out, which put
   "Reset" beside "Temperature" and made the grouping unreadable.

   THE BAR IS .fig-toolbar, AND THAT NAME IS NOT COSMETIC. It used to be .m3-bar, and that one
   difference hid this figure from two gates in one week: npm run sweep3d hides overlays by class
   before measuring the bare canvas and had no entry for it, so this figure was never covered at all and
   passed with its renderer replaced by a clear; npm run narrow measures .fig-toolbar and read
   "0/342 px in 0 rows", which is byte-for-byte what a figure with no controls reports. Teaching each
   gate the private name fixes the gates it has and leaves the next one. So the container takes the
   shared name and the figure-private layout is set back here, scoped under this figure's own root: the
   shared rule describes a bar that FLOATS over the artwork, and this one is a two-row block in the flow
   under the view, which is a grid row of .tb-mem3d above. Every declaration below undoes one of the
   shared rule's — position and the offsets that go with it, the row direction, the wrap, the centring,
   the gap and the pointer-events — and nothing else. */
.tb-mem3d .fig-toolbar { position: static; left: auto; right: auto; bottom: auto;
  display: flex; flex-direction: column; flex-wrap: nowrap; align-items: stretch; gap: 0.2rem;
  padding: 0.3rem 0.55rem 0.4rem; pointer-events: auto; }
.tb-mem3d .m3-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); }
.tb-mem3d .m3-group { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.tb-mem3d .m3-sliders { flex: 1 1 auto; gap: var(--space-4); }
.tb-mem3d .m3-slider { display: flex; align-items: center; gap: 0.3rem; font-size: 10.5px;
  color: var(--ink-soft); }
.tb-mem3d .m3-slider input { width: 4.2rem; }
.tb-mem3d .m3-slider .m3-val { color: var(--ink); font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums; min-width: 3.1rem; text-align: right; }
.tb-mem3d .fig-btn { font-size: 10.5px; padding: 0.3rem 0.62rem; }
/* The primary action is told by the head rule on its edge and the weight of its ink, never by a fill. */
.tb-mem3d .m3-primary { border-color: var(--rule-head); font-weight: 600; }
.tb-mem3d .m3-note { font-size: 9.6px; color: var(--ink-faint); }
.tb-mem3d.is-narrow .fig-toolbar { padding: 0.25rem 0.4rem 0.35rem; }
.tb-mem3d.is-narrow .m3-row { gap: var(--space-2); }
.tb-mem3d.is-narrow .m3-sliders { flex: 1 1 100%; flex-direction: column; align-items: stretch; gap: 0.05rem; }
.tb-mem3d.is-narrow .m3-slider { justify-content: space-between; }
.tb-mem3d.is-narrow .m3-slider input { flex: 1 1 auto; width: auto; margin: 0 0.35rem; }
.tb-mem3d.is-narrow .m3-note { display: none; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the membrane patch could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { failed: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const clock = makeClock(ctx.pinnedTime);
  const rng = mulberry32(20260916);

  // ---- DOM ----
  const wrapEl = h('div', { class: 'tb-mem3d' });
  wrapEl.append(h('style', { text: CSS }));
  const view = h('div', {
    class: 'm3-view', tabindex: '0',
    'aria-label': 'A patch of plasma membrane in three dimensions. Drag or use the arrow keys to turn it over, + and − to zoom; click a molecule to follow it.',
  });
  const leaders = el('svg', { class: 'm3-leaders', 'aria-hidden': 'true' });
  const labelsEl = h('div', { class: 'm3-labels' });
  const readSvg = el('svg', { class: 'm3-read', 'aria-hidden': 'true' });
  const curveSvg = el('svg', { 'aria-hidden': 'true' });
  // The curve lives inside the view at desktop width, inset over the lower right of the membrane, and
  // moves out into a row of its own under the view on a phone. Moving the node is how the same element
  // can be both, and `hidden` on a div is the property a browser honours (an SVG element has none).
  const curvePane = h('div', { class: 'm3-curve' }, [curveSvg]);
  curvePane.hidden = true;
  // `.fig-toolbar`, the one name every gate keys on — see the CSS above for why this is not `.m3-bar`.
  const bar = h('div', { class: 'fig-toolbar fig-ui' });
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  view.append(renderer.domElement, leaders, labelsEl, readSvg, curvePane);
  wrapEl.append(view, bar);
  root.append(wrapEl);

  // ---- scene ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.5, 400);
  const rig = createRig(scene, camera, ctx.theme);
  const mats = new Materials(ctx.palette.paper);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 200); // 200 clips nothing
  const clipping = [plane];
  const material = (opts) => {
    const m = mats.make({ roughness: 0.55, metalness: 0, cap: 0.5, side: THREE.DoubleSide, ...opts });
    m.clippingPlanes = clipping;
    return m;
  };

  const COLOUR = {
    head: membranePart('lipidHead').color,
    tail: membranePart('lipidTail').color,
    cholesterol: membranePart('cholesterol').color,
    sugar: membranePart('sugarChain').color,
    barrel: membranePart('channel').color,
    helix: membranePart('carrier').color,
    peripheral: membranePart('carrier').color,
    filament: ORGANELLE_BY_ID.cytoskeleton.color,
  };
  // A bleached molecule keeps its shape and loses its label, so it is drawn as the paper the sheet sits
  // on rather than as a second colour of its own.
  let bleachedHead = mix(COLOUR.head, ctx.palette.paper3, 0.85);

  // ---- the lipids ----
  const N_LEAF = ROWS * COLS;
  const N_LIPID = N_LEAF * 2;
  const lx0 = new Float32Array(N_LIPID);
  const lz0 = new Float32Array(N_LIPID);
  const lx1 = new Float32Array(N_LIPID);
  const lz1 = new Float32Array(N_LIPID);
  const leaflet = new Int8Array(N_LIPID); // +1 outer, -1 inner
  const bleached = new Uint8Array(N_LIPID);
  {
    let i = 0;
    for (let side = 0; side < 2; side += 1) {
      for (let r = 0; r < ROWS; r += 1) {
        for (let cIdx = 0; cIdx < COLS; cIdx += 1) {
          const x = -HALF + (cIdx + (r % 2 ? 0.5 : 0)) * DX + (rng() - 0.5) * 0.18;
          const z = -HALF + (r + 0.5) * DZ + (rng() - 0.5) * 0.18;
          lx0[i] = wrap(x); lz0[i] = wrap(z);
          lx1[i] = lx0[i]; lz1[i] = lz0[i];
          leaflet[i] = side === 0 ? 1 : -1;
          i += 1;
        }
      }
    }
  }

  const N_CHOL_MAX = Math.round(CHOL.max * N_LIPID);
  const cx0 = new Float32Array(N_CHOL_MAX);
  const cz0 = new Float32Array(N_CHOL_MAX);
  const cx1 = new Float32Array(N_CHOL_MAX);
  const cz1 = new Float32Array(N_CHOL_MAX);
  const cLeaf = new Int8Array(N_CHOL_MAX);
  for (let i = 0; i < N_CHOL_MAX; i += 1) {
    cx0[i] = wrap((rng() - 0.5) * PATCH);
    cz0[i] = wrap((rng() - 0.5) * PATCH);
    cx1[i] = cx0[i]; cz1[i] = cz0[i];
    cLeaf[i] = i % 2 ? 1 : -1;
  }

  // ---- the proteins ----
  // Fourteen crossing the sheet (barrels and helix bundles) and six resting on the inner face; five of
  // the twenty are tied to the filaments below and never move, which is what the bleach measures.
  const PROTEINS = [];
  {
    // Twenty-four, so that the bleached disc holds four of them and an immobile fraction means something.
    // The loop is capped rather than left to find room it may not have: a rejection sampler with no cap
    // is an infinite loop the first time somebody widens the separation.
    const spots = [];
    let tries = 0;
    while (spots.length < 24 && tries < 8000) {
      tries += 1;
      const p = [(rng() - 0.5) * (PATCH - 3), (rng() - 0.5) * (PATCH - 3)];
      if (spots.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 2.8)) spots.push(p);
    }
    spots.forEach(([x, z], i) => {
      const kind = i < 8 ? 'barrel' : i < 18 ? 'helix' : 'peripheral';
      PROTEINS.push({
        kind, x0: x, z0: z, x1: x, z1: z, x, z,
        tethered: i % 4 === 1,
        sugars: kind !== 'peripheral' && i % 3 === 0 ? 1 : 0,
        bleached: false, node: null,
      });
    });
  }
  const N_TETHERED = PROTEINS.filter((p) => p.tethered).length;

  // Six glycolipids, on the outer leaflet only, carried by a lipid each.
  const GLYCOLIPIDS = [];
  for (let i = 0; i < 6; i += 1) GLYCOLIPIDS.push({ lipid: Math.floor(rng() * N_LEAF), node: null });
  const OUTER_SUGARS = PROTEINS.reduce((s, p) => s + p.sugars, 0) + GLYCOLIPIDS.length;

  // ---- geometry ----
  const headGeom = new THREE.SphereGeometry(HEAD_R, 7, 5);
  headGeom.deleteAttribute('uv');
  const tailGeom = (() => {
    const parts = [];
    for (const dx of [-0.23, 0.23]) {
      const g = new THREE.CylinderGeometry(0.23, 0.17, TAIL_LEN, 6, 1, true);
      g.deleteAttribute('uv');
      g.translate(dx, -TAIL_LEN / 2 - 0.35, 0);
      parts.push(g);
    }
    return mergeGeometries(parts);
  })();
  const cholGeom = (() => {
    const g = new THREE.CylinderGeometry(0.34, 0.24, 2.0, 6, 1, false);
    g.deleteAttribute('uv');
    g.translate(0, -1.55, 0);
    return g;
  })();

  const headMat = material({ color: 0xffffff, roughness: 0.42 });
  const tailMat = material({ color: COLOUR.tail, roughness: 0.75 });
  const cholMat = material({ color: COLOUR.cholesterol, roughness: 0.4 });
  const heads = new THREE.InstancedMesh(headGeom, headMat, N_LIPID);
  heads.name = 'lipid-heads';
  heads.userData.pick = 'lipid';
  const tails = new THREE.InstancedMesh(tailGeom, tailMat, N_LIPID);
  tails.name = 'lipid-tails';
  const chols = new THREE.InstancedMesh(cholGeom, cholMat, N_CHOL_MAX);
  chols.name = 'cholesterol';
  chols.userData.pick = 'cholesterol';
  heads.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N_LIPID * 3), 3);
  for (const m of [heads, tails, chols]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    scene.add(m);
  }
  heads.instanceColor.setUsage(THREE.DynamicDrawUsage);

  // The proteins, each its own mesh so it can be picked, tracked and labelled.
  function proteinGeometry(kind) {
    if (kind === 'barrel') {
      const outer = new THREE.CylinderGeometry(1.15, 1.15, 7.4, 16, 1, true);
      const inner = new THREE.CylinderGeometry(0.5, 0.5, 7.4, 12, 1, true);
      const ring = new THREE.TorusGeometry(0.82, 0.33, 6, 16);
      ring.rotateX(Math.PI / 2);
      const ring2 = ring.clone();
      ring.translate(0, 3.7, 0);
      ring2.translate(0, -3.7, 0);
      for (const g of [outer, inner, ring, ring2]) g.deleteAttribute('uv');
      return mergeGeometries([outer, inner, ring, ring2]);
    }
    if (kind === 'helix') {
      const parts = [];
      for (let k = 0; k < 4; k += 1) {
        const a = (k / 4) * Math.PI * 2;
        const g = new THREE.CylinderGeometry(0.45, 0.45, 7.6, 10, 1, false);
        g.deleteAttribute('uv');
        g.translate(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62);
        parts.push(g);
      }
      return mergeGeometries(parts);
    }
    const g = new THREE.SphereGeometry(1.15, 14, 10);
    g.deleteAttribute('uv');
    g.scale(1, 0.62, 1);
    return g;
  }
  const sugarGeom = (() => {
    const parts = [];
    const add = (x, y, z, r) => {
      const s = new THREE.SphereGeometry(r, 8, 6);
      s.deleteAttribute('uv');
      s.translate(x, y, z);
      parts.push(s);
      const stick = new THREE.CylinderGeometry(0.09, 0.09, Math.hypot(x, y, z) * 0.7, 5, 1, true);
      stick.deleteAttribute('uv');
      stick.translate(0, Math.hypot(x, y, z) * 0.35, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(Y, new THREE.Vector3(x, y, z).normalize());
      stick.applyQuaternion(q);
      parts.push(stick);
    };
    add(0, 0.85, 0, 0.3);
    add(0.55, 1.6, 0.2, 0.26);
    add(-0.5, 1.7, -0.25, 0.26);
    add(1.0, 2.4, 0.5, 0.22);
    add(-0.9, 2.5, -0.5, 0.22);
    return mergeGeometries(parts);
  })();

  const proteinMats = {
    barrel: material({ color: COLOUR.barrel, roughness: 0.5 }),
    helix: material({ color: COLOUR.helix, roughness: 0.5 }),
    peripheral: material({ color: COLOUR.peripheral, roughness: 0.6 }),
  };
  const bleachMat = material({ color: mix(COLOUR.helix, ctx.palette.paper3, 0.82), roughness: 0.6 });
  const sugarMat = material({ color: COLOUR.sugar, roughness: 0.55 });
  const pickables = [heads, chols];
  for (const p of PROTEINS) {
    const mesh = new THREE.Mesh(proteinGeometry(p.kind), proteinMats[p.kind]);
    mesh.name = `protein-${p.kind}`;
    mesh.userData.pick = 'protein';
    mesh.userData.protein = p;
    if (p.kind === 'peripheral') mesh.position.y = -(HEAD_Y + 1.35);
    scene.add(mesh);
    pickables.push(mesh);
    p.node = mesh;
    if (p.sugars) {
      const s = new THREE.Mesh(sugarGeom, sugarMat);
      s.position.y = HEAD_Y + 0.6;
      s.name = 'sugar-chain';
      scene.add(s);
      p.sugarNode = s;
    }
  }
  for (const g of GLYCOLIPIDS) {
    const s = new THREE.Mesh(sugarGeom, sugarMat);
    s.name = 'sugar-chain';
    scene.add(s);
    g.node = s;
  }

  // The cytoskeleton under the sheet, and a short tether from each pinned protein down to it.
  const filamentY = -(HEAD_Y + 3.2);
  {
    const parts = [];
    for (let k = 0; k < 5; k += 1) {
      const a = (k / 5) * Math.PI + 0.35;
      const off = (k - 2) * 4.4;
      const pts = [];
      for (let s = -1; s <= 1; s += 0.25) {
        pts.push(new THREE.Vector3(
          Math.cos(a) * s * HALF * 1.05 - Math.sin(a) * off,
          filamentY + Math.sin(s * 2.1 + k) * 0.5,
          Math.sin(a) * s * HALF * 1.05 + Math.cos(a) * off,
        ));
      }
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 26, 0.42, 7, false);
      g.deleteAttribute('uv');
      parts.push(g);
    }
    const filaments = new THREE.Mesh(mergeGeometries(parts), material({ color: COLOUR.filament, roughness: 0.8 }));
    filaments.name = 'cytoskeleton';
    scene.add(filaments);
  }
  const tetherMat = material({ color: COLOUR.filament, roughness: 0.8 });
  for (const p of PROTEINS) {
    if (!p.tethered) continue;
    const g = new THREE.CylinderGeometry(0.16, 0.16, Math.abs(filamentY) - HEAD_Y + 1.2, 6, 1, true);
    g.deleteAttribute('uv');
    g.translate(0, (filamentY - (p.kind === 'peripheral' ? -HEAD_Y - 1.4 : -HEAD_Y)) / 2 - HEAD_Y * 0.1, 0);
    const mesh = new THREE.Mesh(g, tetherMat);
    mesh.name = 'tether';
    scene.add(mesh);
    p.tetherNode = mesh;
  }

  // The tracked molecule's path, drawn as segments so a wrap across the edge is a break and not a
  // line straight back across the patch.
  const trail = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX * 6), 3)),
    new THREE.LineBasicMaterial({ color: new THREE.Color(ctx.palette.ink), transparent: true, opacity: 0.85 }),
  );
  trail.frustumCulled = false;
  trail.visible = false;
  scene.add(trail);

  // ---- state ----
  const orbit = new Orbit(DEFAULT_VIEW, ZOOM_MIN, ZOOM_MAX);
  const spin = new Spin(reduced ? 0 : SPIN_RATE);
  const raycaster = new THREE.Raycaster();
  let W = 1;
  let H = 1;
  let narrow = false;
  let tempC = TEMP.start;
  let cholFraction = CHOL.start;
  let unsatFraction = UNSAT.start;
  let cut = false;
  let labelsOn = true;
  let simSeconds = 0; // membrane seconds since reset
  let stepIndex = 0;
  let stepAlpha = 0;
  let swapCount = 0;
  let flipFlops = 0;
  let flip = null; // { lipid, start }
  let tracked = null; // { what, index, distanceNm, startSim, points: [] }
  // It opens running, because a fluid sheet is what §4.2 claims and a still one is a picture of a noun.
  // Under prefers-reduced-motion, or with the clock pinned, it opens stopped and the reader starts it.
  let playing = !reduced && !clock.pinned;
  let bleachedAt = null;
  let recovery = []; // [{ s, f }]
  let bleachStats = { proteins: 0, immobile: 0 };
  let fittedD = 0;

  const order = () => orderAt(tempC, cholFraction, unsatFraction);
  const mobility = () => (1 - order()) ** 2;
  const lipidD = () => D_MAX * mobility();
  const cholCount = () => Math.round(cholFraction * N_LIPID);

  // ---- the walk ----
  const tmpV = new THREE.Vector3();
  function advanceOne() {
    const dt = SECONDS_PER_WATCHED / WALK_HZ;
    const sigmaL = Math.sqrt(2 * lipidD() * dt);
    const sigmaP = Math.sqrt(2 * lipidD() * PROTEIN_D_SHARE * dt);
    stepIndex += 1;
    const n = stepIndex;
    for (let i = 0; i < N_LIPID; i += 1) {
      lx0[i] = lx1[i]; lz0[i] = lz1[i];
      const [g1, g2] = gauss2(i, n);
      lx1[i] = wrap(lx0[i] + sigmaL * g1);
      lz1[i] = wrap(lz0[i] + sigmaL * g2);
    }
    for (let i = 0; i < N_CHOL_MAX; i += 1) {
      cx0[i] = cx1[i]; cz0[i] = cz1[i];
      const [g1, g2] = gauss2(i + 100000, n);
      cx1[i] = wrap(cx0[i] + sigmaL * 0.8 * g1);
      cz1[i] = wrap(cz0[i] + sigmaL * 0.8 * g2);
    }
    PROTEINS.forEach((p, i) => {
      p.x0 = p.x1; p.z0 = p.z1;
      if (p.tethered) return;
      const [g1, g2] = gauss2(i + 200000, n);
      p.x1 = wrap(p.x1 + sigmaP * g1);
      p.z1 = wrap(p.z1 + sigmaP * g2);
    });
    simSeconds += dt;
    // Neighbour exchanges over the whole patch: a hopping walk with jump a and coefficient D swaps at
    // 4D/a^2 per molecule, and each swap is two molecules.
    swapCount += (N_LIPID * 4 * lipidD()) / (JUMP_NM * JUMP_NM) * dt * 0.5;
    if (tracked) trackStep();
    if (bleachedAt !== null) sampleRecovery();
  }

  function positionOf(what, index) {
    if (what === 'protein') {
      const p = PROTEINS[index];
      return [p.x0 + (p.x1 - p.x0) * stepAlpha, p.z0 + (p.z1 - p.z0) * stepAlpha];
    }
    if (what === 'cholesterol') return [cx0[index] + (cx1[index] - cx0[index]) * stepAlpha, cz0[index] + (cz1[index] - cz0[index]) * stepAlpha];
    return [lx0[index] + (lx1[index] - lx0[index]) * stepAlpha, lz0[index] + (lz1[index] - lz0[index]) * stepAlpha];
  }

  // Net displacement, not path length: the prose's "two micrometres in a second" is a random walk's
  // root-mean-square displacement, and path length would be a different and much larger number.
  function trackStep() {
    const t = tracked;
    const prev = t.last;
    const [x, z] = t.what === 'protein' ? [PROTEINS[t.index].x1, PROTEINS[t.index].z1] : t.what === 'cholesterol' ? [cx1[t.index], cz1[t.index]] : [lx1[t.index], lz1[t.index]];
    let dx = x - prev[0];
    let dz = z - prev[1];
    if (dx > HALF) dx -= PATCH; else if (dx < -HALF) dx += PATCH;
    if (dz > HALF) dz -= PATCH; else if (dz < -HALF) dz += PATCH;
    t.netX += dx;
    t.netZ += dz;
    t.last = [x, z];
    t.points.push([x, z]);
    if (t.points.length > TRAIL_MAX) t.points.shift();
  }

  function bleachedInDisc() {
    // Everything the label was on: lipid heads and the proteins. `recoveryFraction` is over all of it;
    // the immobile fraction is reported over the proteins, because that is the quantity it is about.
    let inside = 0;
    let clear = 0;
    for (let i = 0; i < N_LIPID; i += 1) {
      const [x, z] = [lx1[i], lz1[i]];
      if (x * x + z * z > BLEACH_R * BLEACH_R) continue;
      inside += 1;
      if (!bleached[i]) clear += 1;
    }
    for (const p of PROTEINS) {
      if (p.x1 * p.x1 + p.z1 * p.z1 > BLEACH_R * BLEACH_R) continue;
      inside += 1;
      if (!p.bleached) clear += 1;
    }
    return inside ? clear / inside : 1;
  }

  function sampleRecovery() {
    const f = bleachedInDisc();
    const s = simSeconds - bleachedAt;
    if (!recovery.length || s - recovery[recovery.length - 1].s > 2e-7) recovery.push({ s, f });
    if (recovery.length > 400) recovery.shift();
    // Axelrod's half-time for a circular spot: t½ = 0.224 w² / D. Nothing is fitted until the spot has
    // come back a third of the way: the first samples are all near zero, so the half-way sample is the
    // one at s = 0 and the coefficient it gives is a division by nothing.
    const plateau = Math.max(...recovery.map((r) => r.f), 0.001);
    if (plateau < 0.33) { fittedD = 0; return; }
    const halfway = recovery.find((r) => r.f >= plateau / 2 && r.s > 0);
    fittedD = halfway ? (0.224 * BLEACH_R * BLEACH_R) / halfway.s / 1e6 : 0;
  }

  // ---- drawing the scene ----
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const xAxis = new THREE.Vector3(1, 0, 0);
  const qUp = new THREE.Quaternion();
  const qDown = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
  const pos = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const colour = new THREE.Color();
  const headColour = new THREE.Color();
  const bleachColour = new THREE.Color();

  function flipAngle(i) {
    if (!flip || flip.lipid !== i) return 0;
    const u = clamp((clock.now() - flip.start) / FLIP_SECONDS, 0, 1);
    return u * Math.PI;
  }

  function placeMolecules() {
    headColour.set(COLOUR.head);
    bleachColour.set(bleachedHead);
    for (let i = 0; i < N_LIPID; i += 1) {
      const x = lx0[i] + (lx1[i] - lx0[i]) * stepAlpha;
      const z = lz0[i] + (lz1[i] - lz0[i]) * stepAlpha;
      const a = flipAngle(i);
      const side = leaflet[i];
      // A forced flip-flop turns the molecule end over end through the core, which is the journey the
      // core exists to prevent, so it is drawn as one.
      const y = a ? side * HEAD_Y * Math.cos(a) : side * HEAD_Y;
      if (a) q.setFromAxisAngle(xAxis, side > 0 ? a : Math.PI + a);
      else q.copy(side > 0 ? qUp : qDown);
      pos.set(x, y, z);
      m4.compose(pos, q, one);
      heads.setMatrixAt(i, m4);
      tails.setMatrixAt(i, m4);
      colour.copy(bleached[i] ? bleachColour : headColour);
      heads.setColorAt(i, colour);
    }
    heads.instanceMatrix.needsUpdate = true;
    tails.instanceMatrix.needsUpdate = true;
    if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
    const nc = cholCount();
    chols.count = nc;
    for (let i = 0; i < nc; i += 1) {
      const x = cx0[i] + (cx1[i] - cx0[i]) * stepAlpha;
      const z = cz0[i] + (cz1[i] - cz0[i]) * stepAlpha;
      // The hydroxyl end sits at the level of the ester carbonyls, just under the heads, so the top of
      // the ring shows between them; dropped to the middle of the tails it was invisible from any angle.
      pos.set(x, cLeaf[i] * (HEAD_Y + 0.35), z);
      m4.compose(pos, cLeaf[i] > 0 ? qUp : qDown, one);
      chols.setMatrixAt(i, m4);
    }
    chols.instanceMatrix.needsUpdate = true;

    PROTEINS.forEach((p, i) => {
      const [x, z] = positionOf('protein', i);
      p.x = x; p.z = z;
      p.node.position.set(x, p.kind === 'peripheral' ? -(HEAD_Y + 1.35) : 0, z);
      p.node.material = p.bleached ? bleachMat : proteinMats[p.kind];
      if (p.sugarNode) p.sugarNode.position.set(x, HEAD_Y + 0.6, z);
      if (p.tetherNode) p.tetherNode.position.set(x, 0, z);
    });
    for (const g of GLYCOLIPIDS) {
      const [x, z] = positionOf('lipid', g.lipid);
      g.node.position.set(x, HEAD_Y + 0.45, z);
    }

    // the trail
    if (tracked && tracked.points.length > 1) {
      const arr = trail.geometry.attributes.position.array;
      let n = 0;
      const yTrail = tracked.what === 'protein' && PROTEINS[tracked.index].kind === 'peripheral' ? -(HEAD_Y + 1.6) : (tracked.side || 1) * (HEAD_Y + 0.75);
      for (let k = 1; k < tracked.points.length && n < TRAIL_MAX; k += 1) {
        const a0 = tracked.points[k - 1];
        const a1 = tracked.points[k];
        if (Math.abs(a1[0] - a0[0]) > HALF || Math.abs(a1[1] - a0[1]) > HALF) continue;
        arr[n * 6] = a0[0]; arr[n * 6 + 1] = yTrail; arr[n * 6 + 2] = a0[1];
        arr[n * 6 + 3] = a1[0]; arr[n * 6 + 4] = yTrail; arr[n * 6 + 5] = a1[1];
        n += 1;
      }
      trail.geometry.setDrawRange(0, n * 2);
      trail.geometry.attributes.position.needsUpdate = true;
      trail.visible = n > 0;
    } else trail.visible = false;
  }

  // ---- labels ----
  // Seven names, and each one is placed on the ray from the centre of the patch out through the thing it
  // names, at a distance that puts it clear of the silhouette — the way a plate in a book is lettered.
  // Placed with one fixed offset instead, all seven stacked above their anchors and sat on the sheet.
  const labels = new Labels(labelsEl, leaders);
  const LABELS = [
    ['heads', 'Phospholipid heads'],
    ['tails', 'Tails'],
    ['cholesterol', 'Cholesterol'],
    ['sugar', 'Sugar chain'],
    ['barrel', 'Transmembrane protein'],
    ['peripheral', 'Peripheral protein'],
    ['tether', 'Tethered to the cytoskeleton'],
  ];
  for (const [id, name] of LABELS) labels.add(id, name);
  labels.setGroup('main', labelsOn);
  const anchor = new Map(LABELS.map(([id]) => [id, new THREE.Vector3()]));
  const camRight = new THREE.Vector3();
  const camUp = new THREE.Vector3();
  const projV = new THREE.Vector3();
  const centreXY = [0, 0];
  const cornerXY = [0, 0];
  const projected = (x, y, z, out) => {
    projV.set(x, y, z).project(camera);
    out[0] = ((projV.x + 1) / 2) * W;
    out[1] = ((1 - projV.y) / 2) * H;
    return out;
  };
  // The molecule of each kind nearest a chosen corner of the patch, so the seven labels start apart.
  const nearest = (list, tx, tz) => {
    let best = null;
    let bestD = Infinity;
    for (const it of list) {
      const d = (it.x - tx) ** 2 + (it.z - tz) ** 2;
      if (d < bestD) { bestD = d; best = it; }
    }
    return best;
  };
  function updateLabels() {
    const nc = cholCount();
    let chol = null;
    for (let i = 0; i < nc; i += 1) {
      const [x, z] = positionOf('cholesterol', i);
      const d = (x - HALF * 0.8) ** 2 + (z + HALF * 0.8) ** 2;
      if (!chol || d < chol.d) chol = { x, z, d };
    }
    const barrel = nearest(PROTEINS.filter((p) => p.kind === 'barrel'), -HALF * 0.8, HALF * 0.3);
    const peri = nearest(PROTEINS.filter((p) => p.kind === 'peripheral' || p.tethered), 0, HALF * 0.9);
    const pinned = nearest(PROTEINS.filter((p) => p.tethered), -HALF * 0.6, -HALF * 0.9);
    const sugarP = nearest(PROTEINS.filter((p) => p.sugars), HALF * 0.9, HALF * 0.5);
    anchor.get('heads').set(-HALF * 0.85, HEAD_Y + HEAD_R, -HALF * 0.55);
    anchor.get('tails').set(HALF * 0.55, 0, 0.2);
    if (chol) anchor.get('cholesterol').set(chol.x, HEAD_Y - 0.6, chol.z);
    if (sugarP) anchor.get('sugar').set(sugarP.x, HEAD_Y + 3.1, sugarP.z);
    if (barrel) anchor.get('barrel').set(barrel.x, HEAD_Y + 0.9, barrel.z);
    if (peri) anchor.get('peripheral').set(peri.x, -(HEAD_Y + 1.6), peri.z);
    if (pinned) anchor.get('tether').set(pinned.x, filamentY + 0.9, pinned.z);

    // The silhouette of the sheet on the stage this frame, as an ellipse through its eight corners. Each
    // label is pushed along its own ray until it is clear of that ellipse, so a name never lands on the
    // sheet it is naming. A fixed offset put "Tethered to the cytoskeleton" in the middle of the patch.
    projected(0, 0, 0, centreXY);
    let halfW = 1;
    let halfH = 1;
    for (const cx of [-HALF, HALF]) {
      for (const cz of [-HALF, HALF]) {
        for (const cy of [HEAD_Y + 3.4, filamentY - 0.6]) {
          projected(cx, cy, cz, cornerXY);
          halfW = Math.max(halfW, Math.abs(cornerXY[0] - centreXY[0]));
          halfH = Math.max(halfH, Math.abs(cornerXY[1] - centreXY[1]));
        }
      }
    }
    halfW = Math.min(halfW, W * 0.42);
    halfH = Math.min(halfH, H * 0.36);
    camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    for (const [id] of LABELS) {
      if (!labelsOn) { labels.set(id, null); continue; }
      if (id === 'tails' && !cut) { labels.set(id, null); continue; }
      if (id === 'cholesterol' && !chol) { labels.set(id, null); continue; }
      const a = anchor.get(id);
      let dx = a.dot(camRight);
      let dy = -a.dot(camUp);
      const len = Math.hypot(dx, dy);
      if (len < 0.5) { dx = 0; dy = -1; } else { dx /= len; dy /= len; }
      projected(a.x, a.y, a.z, cornerXY);
      const here = Math.hypot(cornerXY[0] - centreXY[0], cornerXY[1] - centreXY[1]);
      const rim = 1 / Math.sqrt((dx / halfW) ** 2 + (dy / halfH) ** 2);
      const off = clamp(rim + 20 - here, 26, 260);
      labels.set(id, a, dx * off, dy * off);
    }
  }

  // ---- render ----
  function render() {
    orbit.apply(camera, spin.angle(clock.now()));
    placeMolecules();
    updateLabels();
    labels.obstacles = readBox ? [readBox] : [];
    labels.update(camera, W, H, 14);
    renderer.render(scene, camera);
  }

  let lastReadout = -1;
  function step(dt) {
    const t = clock.now();
    let moving = orbit.step(dt, reduced);
    if (playing && !clock.pinned) {
      stepAlpha += dt * WALK_HZ;
      while (stepAlpha >= 1) { stepAlpha -= 1; advanceOne(); }
      moving = true;
    }
    if (flip && (clock.pinned || reduced || t - flip.start >= FLIP_SECONDS)) {
      leaflet[flip.lipid] *= -1;
      flip = null;
      moving = true;
    } else if (flip) moving = true;
    if (t - lastReadout > 0.12 || lastReadout < 0) { lastReadout = t; drawReadout(); drawCurve(); }
    return moving || (spin.rate > 0 && !spin.held && !clock.pinned);
  }
  const loop = createLoop(step, render);

  // ---- reader actions ----
  function selectAt(pt) {
    const hits = pickAt(raycaster, camera, pt, pickables, cut ? clipping : null);
    const hit = hits[0];
    if (!hit) { tracked = null; loop.invalidate(); drawReadout(); return; }
    const what = hit.object.userData.pick;
    const index = what === 'protein' ? PROTEINS.indexOf(hit.object.userData.protein) : hit.instanceId ?? 0;
    const [x, z] = what === 'protein' ? [PROTEINS[index].x1, PROTEINS[index].z1] : what === 'cholesterol' ? [cx1[index], cz1[index]] : [lx1[index], lz1[index]];
    tracked = {
      what, index, netX: 0, netZ: 0, startSim: simSeconds, last: [x, z], points: [[x, z]],
      side: what === 'lipid' ? leaflet[index] : 1,
    };
    loop.invalidate();
    drawReadout();
  }

  function trackedKind() {
    if (!tracked) return null;
    if (tracked.what === 'protein') return PROTEINS[tracked.index].tethered ? 'tethered-protein' : 'protein';
    return tracked.what === 'cholesterol' ? 'cholesterol' : 'lipid';
  }

  function doBleach() {
    for (let i = 0; i < N_LIPID; i += 1) bleached[i] = lx1[i] * lx1[i] + lz1[i] * lz1[i] <= BLEACH_R * BLEACH_R ? 1 : 0;
    let proteins = 0;
    let immobile = 0;
    for (const p of PROTEINS) {
      p.bleached = p.x1 * p.x1 + p.z1 * p.z1 <= BLEACH_R * BLEACH_R;
      if (p.bleached) { proteins += 1; if (p.tethered) immobile += 1; }
    }
    bleachStats = { proteins, immobile };
    bleachedAt = simSeconds;
    recovery = [{ s: 0, f: bleachedInDisc() }];
    fittedD = 0;
    curvePane.hidden = false;
    loop.invalidate();
    drawReadout();
    drawCurve();
  }

  function forceFlip() {
    // The outermost unflipping lipid of the outer leaflet, so the journey is visible rather than buried.
    let best = -1;
    let bestR = -1;
    for (let i = 0; i < N_LIPID; i += 1) {
      if (leaflet[i] < 0) continue;
      const r = lx1[i] * lx1[i] + lz1[i] * lz1[i];
      if (r > bestR && r < HALF * HALF * 0.5) { bestR = r; best = i; }
    }
    if (best < 0) best = 0;
    flip = { lipid: best, start: clock.now() };
    flipFlops += 1;
    if (clock.pinned || reduced) { leaflet[best] *= -1; flip = null; }
    loop.invalidate();
    drawReadout();
  }

  function reset() {
    simSeconds = 0;
    stepIndex = 0;
    stepAlpha = 0;
    swapCount = 0;
    flipFlops = 0;
    flip = null;
    tracked = null;
    bleachedAt = null;
    recovery = [];
    fittedD = 0;
    bleachStats = { proteins: 0, immobile: 0 };
    bleached.fill(0);
    for (const p of PROTEINS) p.bleached = false;
    curvePane.hidden = true;
    // Reset means "as it mounted", and the three sliders and the two view toggles are controls like any
    // other. Cleared only down to here, a Reset gave a fresh, unbleached membrane still held at 13 °C
    // with 38 per cent cholesterol and the cut open — an experiment the reader thought they had put
    // away. The clock restarts where mount leaves it: running, unless motion is reduced or pinned.
    tempC = TEMP.start;
    sTemp.input.value = String(TEMP.start);
    sTemp.val.textContent = `${TEMP.start} °C`;
    cholFraction = CHOL.start;
    sChol.input.value = String(Math.round(CHOL.start * 100));
    sChol.val.textContent = `${Math.round(CHOL.start * 100)} %`;
    unsatFraction = UNSAT.start;
    sUnsat.input.value = String(Math.round(UNSAT.start * 100));
    sUnsat.val.textContent = `${Math.round(UNSAT.start * 100)} %`;
    setCut(false);
    labelsOn = true;
    btnLabels.setAttribute('aria-pressed', 'true');
    labels.setGroup('main', true);
    playing = !reduced && !clock.pinned;
    btnRun.textContent = playing ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-label', playing ? 'Pause the membrane' : 'Run the membrane');
    loop.invalidate();
    drawReadout();
  }

  function setCut(on) {
    cut = on;
    btnCut.setAttribute('aria-pressed', String(on));
    plane.constant = on ? 0 : 200;
    loop.invalidate();
  }

  bindInput(view, {
    onDrag(dx, dy) { spin.fold(orbit, clock.now()); orbit.drag(dx, dy); loop.invalidate(); },
    onZoom(f) { spin.fold(orbit, clock.now()); orbit.zoom(f); loop.invalidate(); },
    onClick(pt) { selectAt(pt); },
    onEscape() { tracked = null; loop.invalidate(); drawReadout(); },
  });

  // ---- controls ----
  const button = (label, onClick, { pressed = null, primary = false } = {}) => {
    const b = h('button', { class: `fig-btn${primary ? ' m3-primary' : ''}`, type: 'button', text: label });
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    return b;
  };
  const slider = (label, { min, max, step, value, format, onInput }) => {
    const input = h('input', { class: 'fig-range', type: 'range', min, max, step, value, 'aria-label': label });
    const val = h('span', { class: 'm3-val', text: format(value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      val.textContent = format(v);
      onInput(v);
    });
    return { node: h('label', { class: 'm3-slider' }, [document.createTextNode(label), input, val]), input, val };
  };

  const btnCut = button('Cut away', () => setCut(!cut), { pressed: false });
  const btnLabels = button('Labels', () => {
    labelsOn = !labelsOn;
    btnLabels.setAttribute('aria-pressed', String(labelsOn));
    labels.setGroup('main', labelsOn);
    loop.invalidate();
  }, { pressed: true });
  const sTemp = slider('Temperature', {
    min: TEMP.min, max: TEMP.max, step: 1, value: TEMP.start,
    format: (v) => `${v} °C`,
    onInput: (v) => { tempC = v; loop.invalidate(); drawReadout(); },
  });
  const sChol = slider('Cholesterol', {
    min: 0, max: 50, step: 1, value: Math.round(CHOL.start * 100),
    format: (v) => `${v} %`,
    onInput: (v) => { cholFraction = v / 100; loop.invalidate(); drawReadout(); },
  });
  const sUnsat = slider('Unsaturation', {
    min: 0, max: 100, step: 1, value: Math.round(UNSAT.start * 100),
    format: (v) => `${v} %`,
    onInput: (v) => { unsatFraction = v / 100; loop.invalidate(); drawReadout(); },
  });
  const btnRun = button(playing ? 'Pause' : 'Run', () => {
    playing = !playing;
    btnRun.textContent = playing ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-label', playing ? 'Pause the membrane' : 'Run the membrane');
    loop.invalidate();
  });
  btnRun.setAttribute('aria-label', playing ? 'Pause the membrane' : 'Run the membrane');
  const btnBleach = button('Bleach a spot', doBleach, { primary: true });
  const btnFlip = button('Force a flip-flop', forceFlip);
  const btnReset = button('Reset', reset);
  bar.append(
    h('div', { class: 'm3-row' }, [
      h('div', { class: 'm3-group' }, [btnCut, btnLabels]),
      h('div', { class: 'm3-group' }, [btnRun, btnBleach, btnFlip, btnReset]),
    ]),
    h('div', { class: 'm3-row' }, [
      h('div', { class: 'm3-group m3-sliders' }, [sTemp.node, sChol.node, sUnsat.node]),
      h('span', { class: 'm3-note', text: '22 nm across · 1 s here ≈ 6 µs in a membrane' }),
    ]),
  );

  // ---- the readout: a typographic table, not a panel ----
  const fmtUm = (nm) => (nm / 1000).toFixed(nm < 100 ? 3 : 2);
  const fmtSeconds = (s) => (s >= 1e-3 ? `${(s * 1e3).toFixed(2)} ms` : `${(s * 1e6).toFixed(1)} µs`);
  let readBox = null;

  function readoutRows() {
    const o = order();
    const rows = [
      ['Phase', phaseOf(o)],
      ['Tail order', o.toFixed(2)],
      ['Sets below', `${tempAtOrder(0.66, cholFraction, unsatFraction).toFixed(0)} °C`],
      ['Sideways swaps', grouped(swapCount)],
      ['Leaflet crossings', String(flipFlops)],
      ['Sugars out / in', `${OUTER_SUGARS} / 0`],
    ];
    if (tracked) {
      const kind = trackedKind();
      const name = kind === 'tethered-protein' ? 'tethered protein' : kind;
      const nm = Math.hypot(tracked.netX, tracked.netZ);
      const elapsed = simSeconds - tracked.startSim;
      rows.push({ head: 'Following' });
      rows.push(['Molecule', name]);
      rows.push(['Gone', `${fmtUm(nm)} µm`]);
      rows.push(['In', fmtSeconds(elapsed)]);
      if (elapsed > 0) {
        // A random walk: four times the time is twice the distance, so one second is the measured
        // distance scaled by the square root of the ratio of the times.
        const perSecond = (nm / 1000) * Math.sqrt(1 / elapsed);
        rows.push({ note: `at this rate, about ${perSecond < 0.05 ? perSecond.toFixed(3) : perSecond.toFixed(1)} µm in a second` });
      }
    }
    if (bleachedAt !== null) {
      rows.push({ head: 'Bleached spot' });
      rows.push(['Recovered', `${Math.round(bleachedInDisc() * 100)} %`]);
      rows.push(['Diffusion', fittedD > 0 ? `${fittedD.toFixed(2)} µm²/s` : 'not yet']);
      rows.push(['Immobile', bleachStats.proteins ? `${bleachStats.immobile} of ${bleachStats.proteins} proteins` : 'no protein in the spot']);
      rows.push({ note: 'the patch is small, so the spot stops short of full' });
    }
    return rows;
  }

  function drawReadout() {
    if (narrow) { drawNarrowReadout(); return; }
    const rows = readoutRows();
    const w = clamp(W * 0.23, 150, 212);
    const opts = { title: 'This patch', size: 10.4, titleSize: 9.2 };
    const rowH = 16.5;
    const height = rows.reduce((s2, r) => s2 + (r.head ? 14 : r.note ? 14 : rowH), 0) + 16;
    readSvg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${height.toFixed(1)}`);
    readSvg.setAttribute('width', w.toFixed(1));
    readSvg.setAttribute('height', height.toFixed(1));
    readSvg.replaceChildren();
    readoutTable(readSvg, rows, { x: 0, y: 0, width: w, rowH, ...opts });
    // A margin round the readout that labels treat as taken, with room for a label's own box.
    readBox = { x: w / 2 + 9, y: height / 2 + 12, w: w + 26, h: height + 36 };
  }

  // A phone's readout: two columns of label and figure across the top of the view, with no rules at all.
  // The desktop table is six rows deep and its hairlines ran straight across the membrane, which is the
  // one thing the stage is meant to be showing. Every glyph carries the paper with it, so the numbers
  // read over the sheet without a panel behind them.
  function drawNarrowReadout() {
    const o = order();
    const pairs = [
      ['Phase', phaseOf(o)],
      ['Sets below', `${tempAtOrder(0.66, cholFraction, unsatFraction).toFixed(0)} °C`],
      ['Sideways swaps', grouped(swapCount)],
      ['Leaflet crossings', String(flipFlops)],
    ];
    if (tracked) {
      pairs.push(['Following', trackedKind() === 'tethered-protein' ? 'tethered' : trackedKind()]);
      pairs.push(['Gone', `${fmtUm(Math.hypot(tracked.netX, tracked.netZ))} µm`]);
    }
    if (bleachedAt !== null) {
      pairs.push(['Recovered', `${Math.round(bleachedInDisc() * 100)} %`]);
      pairs.push(['Diffusion', fittedD > 0 ? `${fittedD.toFixed(2)} µm²/s` : 'not yet']);
    }
    const w = Math.max(150, W - 16);
    const size = 9.8;
    const rowH = 14;
    const rowsN = Math.ceil(pairs.length / 2);
    const height = rowsN * rowH + 14;
    readSvg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${height.toFixed(1)}`);
    readSvg.setAttribute('width', w.toFixed(1));
    readSvg.setAttribute('height', height.toFixed(1));
    readSvg.replaceChildren();
    readSvg.append(text(0, 9, 'This patch', { class: 'mol-rt-title', 'font-size': 9 }));
    const colW = (w - 12) / 2;
    pairs.forEach(([k, v], i) => {
      const cx = (i % 2) * (colW + 12);
      const cy = 14 + Math.floor(i / 2) * rowH + size;
      readSvg.append(text(cx, cy, k, { class: 'mol-rt-key', 'font-size': size.toFixed(1) }));
      readSvg.append(text(cx + colW, cy, v, { anchor: 'end', class: 'mol-rt-val', 'font-size': size.toFixed(1) }));
    });
    readBox = { x: w / 2 + 9, y: height / 2 + 10, w: w + 20, h: height + 24 };
  }

  // ---- the recovery curve ----
  function drawCurve() {
    if (curvePane.hidden) return;
    const r = curvePane.getBoundingClientRect();
    const w = Math.max(80, Math.round(r.width));
    const hgt = Math.max(46, Math.round(r.height));
    curveSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    curveSvg.replaceChildren();
    const padL = 26;
    const padR = 6;
    const padT = 15;
    const padB = 15;
    const pw = Math.max(20, w - padL - padR);
    const ph = Math.max(16, hgt - padT - padB);
    const last = recovery.length ? recovery[recovery.length - 1].s : 1;
    const span = Math.max(last, 4e-6);
    const X = (s) => padL + (s / span) * pw;
    const Yc = (f) => padT + (1 - clamp(f, 0, 1)) * ph;
    curveSvg.append(el('line', { x1: padL, y1: padT + ph, x2: padL + pw, y2: padT + ph, stroke: C.ruleStrong }));
    curveSvg.append(el('line', { x1: padL, y1: padT, x2: padL, y2: padT + ph, stroke: C.ruleStrong }));
    for (const f of [0, 0.5, 1]) {
      curveSvg.append(text(padL - 4, Yc(f) + 3.2, `${Math.round(f * 100)}`, { anchor: 'end', class: 'mol-rt-note', 'font-size': 8.6 }));
      if (f > 0) curveSvg.append(el('line', { x1: padL, y1: Yc(f), x2: padL + pw, y2: Yc(f), stroke: C.rule }));
    }
    curveSvg.append(text(0, 9, 'Fluorescence back, % against time', { class: 'mol-rt-title', 'font-size': 8.6 }));
    curveSvg.append(text(padL + pw, hgt - 3, `${fmtSeconds(span)}`, { anchor: 'end', class: 'mol-rt-note', 'font-size': 8.6 }));
    if (recovery.length > 1) {
      let d = '';
      for (let i = 0; i < recovery.length; i += 1) d += `${i ? 'L' : 'M'}${X(recovery[i].s).toFixed(1)} ${Yc(recovery[i].f).toFixed(1)}`;
      // The paper first, then the line on it, so the curve reads over the membrane behind it.
      curveSvg.append(el('path', { d, fill: 'none', stroke: C.paper, 'stroke-width': 4.4, 'stroke-linejoin': 'round' }));
      curveSvg.append(el('path', { d, fill: 'none', stroke: C.water, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    } else {
      curveSvg.append(text(padL + pw / 2, padT + ph / 2, 'let it run', { anchor: 'middle', class: 'mol-rt-note', 'font-size': 9 }));
    }
  }

  // ---- layout ----
  let alive = true;
  // Three things are watched, not one: the root (which decides narrow), the view (which sizes the
  // renderer) and the control bar (whose height changes when it wraps, which changes the view). Watching
  // only the root left the renderer at the size the view had before the grid had resolved.
  function relayout() {
    const rootBox = root.getBoundingClientRect();
    if (!rootBox.width || !rootBox.height) return;
    const wantNarrow = rootBox.width < 800;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrapEl.classList.toggle('is-narrow', narrow);
      // The curve is inset over the membrane at desktop width and takes its own row on a phone.
      if (narrow) wrapEl.insertBefore(curvePane, bar);
      else view.append(curvePane);
      // Nine labels over a 390 px patch would cover the thing they name, so a phone opens without them.
      if (narrow && labelsOn) {
        labelsOn = false;
        btnLabels.setAttribute('aria-pressed', 'false');
        labels.setGroup('main', false);
      }
    }
    const box = view.getBoundingClientRect();
    const w = Math.max(40, Math.round(box.width));
    const hgt = Math.max(40, Math.round(box.height));
    if (w !== W || hgt !== H) {
      W = w;
      H = hgt;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    labels.measure();
    drawReadout();
    drawCurve();
    loop.invalidate();
  }
  const observer = new ResizeObserver(() => { if (alive) relayout(); });
  observer.observe(root);
  observer.observe(view);
  observer.observe(bar);
  const unobserve = () => observer.disconnect();
  relayout();

  document.fonts?.ready.then(() => { if (alive) { labels.measure(); drawReadout(); loop.invalidate(); } });
  drawReadout();
  render();
  ctx.onReady();
  loop.kick();

  return {
    destroy() {
      alive = false;
      loop.stop();
      unobserve();
      disposeScene(scene);
      mats.dispose();
      renderer.dispose();
      root.replaceChildren();
    },
    setTime(t) {
      clock.pin(t);
      orbit.step(0, true);
      // The walk is re-run from its start, so a pinned frame is the same frame every run. Capped, because
      // a very large t must not turn a screenshot into a simulation.
      const wantSteps = clamp(Math.round(t * WALK_HZ), 0, 3000);
      if (wantSteps < stepIndex) {
        stepIndex = 0;
        simSeconds = 0;
        swapCount = 0;
        for (let i = 0; i < N_LIPID; i += 1) { lx1[i] = lx0[i]; lz1[i] = lz0[i]; }
      }
      while (stepIndex < wantSteps) advanceOne();
      stepAlpha = 0;
      if (flip) { leaflet[flip.lipid] *= -1; flip = null; }
      drawReadout();
      drawCurve();
      render();
    },
    setVisible(v) { loop.setVisible(v); },
    setTheme(theme, palette) {
      mats.setPaper(palette.paper);
      rig.setTheme(theme);
      bleachedHead = mix(COLOUR.head, palette.paper3, 0.85);
      bleachMat.color.set(mix(COLOUR.helix, palette.paper3, 0.82));
      trail.material.color.set(palette.ink);
      drawReadout();
      drawCurve();
      render();
    },
    setView(v) {
      spin.fold(orbit, clock.now());
      orbit.set(v);
      render();
    },
    describe() {
      const info = renderer.info.render;
      const o = order();
      const nm = tracked ? Math.hypot(tracked.netX, tracked.netZ) : 0;
      return {
        view: orbit.view(spin.angle(clock.now())),
        drawCalls: info.calls,
        triangles: info.triangles,
        cut,
        labels: labelsOn,
        playing,
        temperatureC: tempC,
        cholesterolFraction: round(cholFraction, 3),
        unsaturatedFraction: round(unsatFraction, 3),
        order: round(o, 3),
        phase: phaseOf(o),
        transitionC: round(tempAtOrder(0.66, cholFraction, unsatFraction), 1),
        // Cumulative, and the only two fields Reset does not put back to a number: it zeroes both, and
        // the sheet is running again by the time anything reads them. Everything else in here equals
        // what it said at mount once Reset has been pressed.
        lateralSwaps: Math.round(swapCount),
        flipFlops,
        tracked: trackedKind(),
        trackedDistanceUm: round(nm / 1000, 4),
        trackedSeconds: tracked ? round(simSeconds - tracked.startSim, 9) : 0,
        diffusionUm2PerS: round(fittedD, 3),
        bleached: bleachedAt !== null,
        recoveryFraction: bleachedAt !== null ? round(bleachedInDisc(), 3) : 1,
        immobileFraction: bleachStats.proteins ? round(bleachStats.immobile / bleachStats.proteins, 3) : 0,
        tetheredProteins: N_TETHERED,
        outerSugars: OUTER_SUGARS,
        innerSugars: 0,
        membraneSeconds: round(simSeconds, 9), // cumulative; see lateralSwaps above
        layout: narrow ? 'narrow' : 'wide',
      };
    },
  };
}
