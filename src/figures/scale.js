// How small is a cell? A logarithmic ruler from 10 m down to 0.1 nm, seventeen things drawn at their
// true positions with a tiny icon each, three bands for what the naked eye, a light microscope and an
// electron microscope can resolve, and a hand lens the reader slides along the ruler. The lens shows
// the ruler under it magnified 2.6×, so crowded neighbours spread out, and a card names the nearest
// thing with its size, one line about it, and the instrument that can see it. The only motion is the
// lens gliding to a new place (280 ms, a cut under reduced motion). describe() -> { lensMetres, nearest }.
import { el, h, text, C, tint, tween, clamp, uid, lerp } from './lib/svg.js';

export const meta = { kind: 'scale', title: 'How small is a cell?', needsWebGL: false, aspect: 16 / 7 };

const W = 1000;
const H = 437.5;
const X0 = 62; // ruler x at 10 m, leaving room for the lens at the far left
const X1 = 934; // ruler x at 0.1 nm, leaving room for the lens and its handle at the far right
const U_MAX = 1; // log10 of 10 m
const U_MIN = -10; // log10 of 0.1 nm
const RY = 226; // the ruler's y
const ROW_Y = [176, 136, 96]; // icon centres, row 0 nearest the ruler
const LR = 72; // lens radius
const HANDLE = 26; // handle length beyond the rim
const HANDLE_DEG = 62; // handle angle below the horizontal, so it clears the right edge and the card
const ZOOM = 2.6;
const GLIDE_MS = 280;

const xOf = (u) => X0 + ((U_MAX - u) / (U_MAX - U_MIN)) * (X1 - X0);
const uOf = (x) => U_MAX - ((x - X0) / (X1 - X0)) * (U_MAX - U_MIN);
const uOfMetres = (m) => Math.log10(m);

const coralDark = 'color-mix(in srgb, var(--coral) 70%, var(--ink))';
const glass = 'color-mix(in srgb, var(--water) 78%, var(--ink))';
// The glass is a touch brighter than the stage in both themes (paper-2 is the stage).
const glassFill = 'light-dark(var(--paper), var(--paper-3))';

// ---------- the ruler's ticks ----------
const DECADE_LABELS = ['10 m', '1 m', '10 cm', '1 cm', '1 mm', '100 µm', '10 µm', '1 µm', '100 nm', '10 nm', '1 nm', '0.1 nm'];
const TICKS = [];
for (let d = U_MAX; d >= U_MIN; d -= 1) {
  TICKS.push({ u: d, major: true, label: DECADE_LABELS[U_MAX - d] });
  if (d > U_MIN) for (let k = 2; k <= 9; k += 1) TICKS.push({ u: d - 1 + Math.log10(k), major: false });
}

// ---------- the instruments ----------
const BANDS = [
  { id: 'eye', label: 'naked eye', from: 10, to: 1e-4, limit: 'down to about 100 µm', colour: C.soft },
  { id: 'light', label: 'light microscope', from: 5e-3, to: 2e-7, limit: 'down to about 200 nm', colour: C.water },
  { id: 'electron', label: 'electron microscope', from: 5e-4, to: 1e-10, limit: 'down to about 0.1 nm', colour: C.violet },
];

function seenWith(metres) {
  if (metres >= 1e-4) return BANDS[0];
  if (metres >= 2e-7) return BANDS[1];
  return BANDS[2];
}

// ---------- the seventeen things, with an icon each drawn in a 24-unit box on the origin ----------
function iconHuman(g) {
  g.append(el('circle', { cx: 0, cy: -9, r: 3.1, fill: C.soft }));
  g.append(el('path', { d: 'M-4.2 -5 Q0 -7 4.2 -5 L5.4 4 L2.8 4 L3.4 12 L1 12 L0 6.5 L-1 12 L-3.4 12 L-2.8 4 L-5.4 4 Z', fill: C.soft }));
}
function iconEgg(g) {
  g.append(el('path', { d: 'M0 -11 C5.5 -11 8.5 -4 8.5 2 C8.5 7.5 4.5 11 0 11 C-4.5 11 -8.5 7.5 -8.5 2 C-8.5 -4 -5.5 -11 0 -11 Z', fill: tint(C.gold, 28), stroke: C.soft, 'stroke-width': 1.4 }));
}
function iconFrogEgg(g) {
  g.append(el('circle', { r: 9.5, fill: tint(C.ink, 7), stroke: C.soft, 'stroke-width': 1.3 }));
  g.append(el('circle', { r: 5, fill: tint(C.ink, 38) }));
  g.append(el('path', { d: 'M-5 0 A5 5 0 0 1 5 0 Z', fill: C.soft }));
}
function iconParamecium(g) {
  const d = 'M-11 0 C-11 -5 -6 -6.5 0 -6 C6 -5.5 11 -3 11 0.5 C11 4.5 5 6.5 -1 6 C-7 5.5 -11 4 -11 0 Z';
  g.append(el('path', { d, fill: 'none', stroke: C.leaf, 'stroke-width': 3.6, 'stroke-dasharray': '0.8 1.9', opacity: 0.55 }));
  g.append(el('path', { d, fill: tint(C.leaf, 24), stroke: C.leaf, 'stroke-width': 1.3 }));
  g.append(el('ellipse', { cx: 1, cy: 0, rx: 3.2, ry: 1.8, fill: C.leaf, opacity: 0.7 }));
}
function iconHumanEgg(g) {
  g.append(el('circle', { r: 11, fill: 'none', stroke: C.coral, 'stroke-width': 1, 'stroke-dasharray': '2 1.6' }));
  g.append(el('circle', { r: 8, fill: tint(C.coral, 26), stroke: C.coral, 'stroke-width': 1.3 }));
  g.append(el('circle', { cx: 1, cy: -0.5, r: 3, fill: tint(C.violet, 55) }));
}
function iconHair(g) {
  g.append(el('path', { d: 'M-1.5 -12 C-3.5 -5 3 3 1.5 12', stroke: C.soft, 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }));
}
function iconCell(g) {
  g.append(el('path', { d: 'M-10 -3 C-10 -9 -4 -11 1 -10 C7 -9 11 -6 10.5 0 C10 6 6 10 0 10 C-6 10 -11 5 -10 -3 Z', fill: tint(C.coral, 24), stroke: C.coral, 'stroke-width': 1.4 }));
  g.append(el('circle', { cx: -1, cy: 0, r: 3.6, fill: tint(C.violet, 58), stroke: C.violet, 'stroke-width': 0.8 }));
}
function iconRBC(g) {
  g.append(el('circle', { r: 9, fill: tint(C.coral, 62), stroke: C.coral, 'stroke-width': 1.3 }));
  g.append(el('circle', { r: 4, fill: tint(C.coral, 28) }));
}
function iconEcoli(g) {
  g.append(el('path', { d: 'M9 0 C14 -3 15 -8 20 -7 M-9 0 C-14 3 -15 8 -20 7 M-5 3.5 C-9 8 -7 12 -11 14', stroke: C.leaf, 'stroke-width': 1, fill: 'none', opacity: 0.8 }));
  g.append(el('rect', { x: -10, y: -4, width: 20, height: 8, rx: 4, fill: tint(C.leaf, 26), stroke: C.leaf, 'stroke-width': 1.4 }));
}
function iconMito(g) {
  g.append(el('rect', { x: -11, y: -5, width: 22, height: 10, rx: 5, fill: tint(C.coral, 22), stroke: C.coral, 'stroke-width': 1.4 }));
  g.append(el('path', { d: 'M-6 -3.5 L-6 1 M-1 3.5 L-1 -1 M4 -3.5 L4 1', stroke: C.coral, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
}
function iconVirus(g) {
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    const [cx, cy] = [Math.cos(a), Math.sin(a)];
    g.append(el('path', { d: `M${(cx * 6).toFixed(1)} ${(cy * 6).toFixed(1)} L${(cx * 9.4).toFixed(1)} ${(cy * 9.4).toFixed(1)}`, stroke: C.violet, 'stroke-width': 1.1 }));
    g.append(el('circle', { cx: (cx * 10).toFixed(1), cy: (cy * 10).toFixed(1), r: 1.3, fill: C.violet }));
  }
  g.append(el('circle', { r: 6.2, fill: tint(C.violet, 24), stroke: C.violet, 'stroke-width': 1.3 }));
}
function iconRibosome(g) {
  g.append(el('path', { d: 'M-8 1 C-9.5 -5 -3 -9.5 2 -8.5 C7 -7.5 9.5 -2.5 7.5 1.5 C4 3 -5 3 -8 1 Z', fill: tint(C.ink, 34), stroke: C.soft, 'stroke-width': 1.1 }));
  g.append(el('path', { d: 'M-6.5 3 C-7.5 8 -1 11.5 4.5 9 C7.5 7.5 7 4 5 3.2 C1 4 -3 4 -6.5 3 Z', fill: tint(C.ink, 22), stroke: C.soft, 'stroke-width': 1.1 }));
}
function iconMembrane(g) {
  for (let i = -3; i <= 3; i += 1) {
    const x = i * 5;
    g.append(el('path', { d: `M${x} -4 L${x - 1} -0.6 M${x} -4 L${x + 1} -0.6 M${x} 4 L${x - 1} 0.6 M${x} 4 L${x + 1} 0.6`, stroke: C.coral, 'stroke-width': 0.9, 'stroke-linecap': 'round' }));
    g.append(el('circle', { cx: x, cy: -6.2, r: 2.3, fill: C.coral }));
    g.append(el('circle', { cx: x, cy: 6.2, r: 2.3, fill: C.coral }));
  }
}
function iconDNA(g) {
  g.append(el('path', { d: 'M-9 -4.6 L-9 4.6 M-6 -2.2 L-6 2.2 M6 -2.2 L6 2.2 M9 -4.6 L9 4.6', stroke: C.violet, 'stroke-width': 0.9 }));
  g.append(el('path', { d: 'M-12 -6 C-6 -6 -6 6 0 6 C6 6 6 -6 12 -6', stroke: C.violet, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('path', { d: 'M-12 6 C-6 6 -6 -6 0 -6 C6 -6 6 6 12 6', stroke: tint(C.violet, 62), 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }));
}
function iconGlucose(g) {
  const pts = [];
  for (let i = 0; i < 6; i += 1) {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    pts.push(`${(Math.cos(a) * 8).toFixed(1)} ${(Math.sin(a) * 8).toFixed(1)}`);
  }
  g.append(el('path', { d: `M${pts.join(' L')} Z`, fill: tint(C.water, 22), stroke: C.water, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }));
  g.append(el('circle', { cx: 6.9, cy: -4, r: 2.2, fill: C.coral }));
}
function iconWater(g) {
  g.append(el('circle', { cx: -6, cy: -6, r: 4.2, fill: tint(C.ink, 12), stroke: C.soft, 'stroke-width': 1 }));
  g.append(el('circle', { cx: 6, cy: -6, r: 4.2, fill: tint(C.ink, 12), stroke: C.soft, 'stroke-width': 1 }));
  g.append(el('circle', { cx: 0, cy: 1, r: 7, fill: C.coral, stroke: coralDark, 'stroke-width': 1 }));
}
function iconAtom(g) {
  g.append(el('circle', { r: 9, fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.3 }));
  g.append(el('circle', { r: 2.4, fill: C.coral }));
  g.append(el('circle', { cx: 0, cy: -9, r: 2, fill: C.water }));
}

// `label` is the short name on the ruler; `name` is the card's title. `row` staggers the labels so
// that none overlap at 1000 px; `anchor` keeps the two ends inside the frame.
export const MARKERS = Object.freeze([
  { id: 'human', label: 'Human', name: 'A person', metres: 1.7, row: 0, about: 'About 1.7 m tall: the largest thing on this ruler, and some 37 trillion cells.', icon: iconHuman },
  { id: 'chicken-egg', label: 'Chicken egg', name: 'Chicken egg', metres: 0.05, row: 0, about: 'Its yolk is a single cell, the biggest cell most people ever see.', icon: iconEgg },
  { id: 'frog-egg', label: 'Frog egg', name: 'Frog egg', metres: 2e-3, row: 0, about: 'One cell, big enough to see and to watch divide.', icon: iconFrogEgg },
  { id: 'paramecium', label: 'Paramecium', name: 'Paramecium', metres: 1.5e-4, row: 2, about: 'A single cell that swims, eats and divides, just visible as a moving speck.', icon: iconParamecium },
  { id: 'human-egg', label: 'Human egg', name: 'Human egg cell', metres: 1e-4, row: 1, about: 'The largest human cell, and the only one visible without a lens, as a speck.', icon: iconHumanEgg },
  { id: 'hair', label: 'Width of a hair', name: 'Width of a hair', metres: 8e-5, row: 0, about: 'A human hair is about 80 µm across, right at the limit of the naked eye.', icon: iconHair },
  { id: 'animal-cell', label: 'Animal cell', name: 'Typical animal cell', metres: 2e-5, row: 2, about: 'A thousand side by side would span the width of a thumbnail.', icon: iconCell },
  { id: 'red-blood-cell', label: 'Red blood cell', name: 'Red blood cell', metres: 7.5e-6, row: 1, about: 'A disc with no nucleus that squeezes through capillaries narrower than itself.', icon: iconRBC },
  { id: 'e-coli', label: 'E. coli', name: 'E. coli, a bacterium', metres: 2e-6, row: 0, about: 'A whole organism the size of one mitochondrion.', icon: iconEcoli },
  { id: 'mitochondrion', label: 'Mitochondrion', name: 'Mitochondrion', metres: 1e-6, row: 2, about: 'The organelle that makes ATP, and the size of the bacterium it descends from.', icon: iconMito },
  { id: 'influenza', label: 'Influenza virus', name: 'Influenza virus', metres: 1e-7, row: 1, about: 'Too small for a light microscope, and not a cell at all.', icon: iconVirus },
  { id: 'ribosome', label: 'Ribosome', name: 'Ribosome', metres: 2.5e-8, row: 0, about: 'The machine that builds proteins: tens of thousands in a bacterium, millions in one of your cells.', icon: iconRibosome },
  { id: 'membrane', label: 'Cell membrane', name: 'Cell membrane thickness', metres: 7e-9, row: 2, about: 'Two layers of lipid molecules, tail to tail, about 7 nm thick.', icon: iconMembrane },
  { id: 'dna', label: 'DNA', name: 'DNA, the width of the helix', metres: 2e-9, row: 1, about: 'The double helix is 2 nm wide and, in one human cell, about 2 m long.', icon: iconDNA },
  { id: 'glucose', label: 'Glucose', name: 'Glucose molecule', metres: 1e-9, row: 0, about: 'The sugar cells burn for energy: six carbons, about a nanometre across.', icon: iconGlucose },
  { id: 'water', label: 'Water molecule', name: 'Water molecule', metres: 3e-10, row: 2, about: 'Counted by molecules, most of a cell is water.', icon: iconWater },
  { id: 'hydrogen', label: 'Hydrogen atom', name: 'Hydrogen atom', metres: 1e-10, row: 1, anchor: 'end', about: 'The smallest atom, and the end of the ruler.', icon: iconAtom },
]);

// A size in metres as a short SI string with two significant digits: 2e-5 -> "20 µm".
export function formatMetres(m) {
  const sig = (v) => String(Number(v.toPrecision(2)));
  if (m >= 0.999) return `${sig(m)} m`;
  if (m >= 0.999e-2) return `${sig(m * 100)} cm`;
  if (m >= 0.999e-3) return `${sig(m * 1e3)} mm`;
  if (m >= 0.999e-6) return `${sig(m * 1e6)} µm`;
  if (m >= 0.999e-10) return `${sig(m * 1e9)} nm`;
  return `${sig(m * 1e12)} pm`;
}

const CSS = `
.tb-scale { position: absolute; inset: 0; font-family: var(--font-ui); touch-action: none; }
.tb-scale svg { user-select: none; -webkit-user-select: none; }
.tb-scale svg text { font-family: var(--font-ui); fill: var(--ink); font-variant-numeric: lining-nums tabular-nums; }
.tb-scale .sc-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3.5px; stroke-linejoin: round; }
.tb-scale .sc-lens .sc-halo { stroke: var(--paper); stroke: light-dark(var(--paper), var(--paper-3)); }
.tb-scale .sc-name { font-size: 11.5px; font-weight: 500; }
.tb-scale .sc-size { font-size: 10.5px; fill: var(--ink-soft); }
.tb-scale .sc-tick { font-size: 11.5px; fill: var(--ink-soft); }
.tb-scale .sc-band { font-size: 11px; font-weight: 500; }
.tb-scale .is-near .sc-name, .tb-scale text.is-near { fill: var(--leaf); font-weight: 600; }
.tb-scale .sc-lens { cursor: grab; outline: none; }
.tb-scale .sc-lens:focus-visible .sc-focus { stroke: var(--leaf); stroke-width: 2; }
.tb-scale.is-dragging .sc-lens { cursor: grabbing; }
.tb-scale .sc-track { cursor: pointer; }
.tb-scale .fig-card { top: auto; bottom: var(--space-3); left: var(--space-3); max-width: min(23rem, 46%); padding: var(--space-2) var(--space-4) var(--space-3); }
.tb-scale .fig-card h5 { display: flex; align-items: baseline; gap: 0.5em; flex-wrap: wrap; }
.tb-scale .fig-card h5 .sc-card-size { font-family: var(--font-ui); font-size: var(--text-xs); font-weight: 600; color: var(--leaf); font-variant-numeric: lining-nums tabular-nums; }
.tb-scale .fig-card .sc-seen { margin-top: 0.35em; display: flex; align-items: center; gap: 0.45em; }
.tb-scale .fig-card .sc-seen i { width: 0.55em; height: 0.55em; border-radius: 50%; background: var(--dot); flex: none; }
.tb-scale .fig-toolbar { left: 52%; justify-content: flex-end; flex-wrap: nowrap; }
.tb-scale .sc-range { flex: 0 1 12rem; min-width: 4rem; }
@container (max-width: 640px) {
  .tb-scale .fig-card { max-width: 60%; padding: 0.25rem 0.55rem; bottom: var(--space-2); left: var(--space-2); border-radius: var(--radius); box-shadow: none; }
  .tb-scale .fig-card h5 { font-size: var(--text-xs); gap: 0.35em; margin: 0; }
  .tb-scale .fig-card p, .tb-scale .fig-card .sc-seen { display: none; }
  .tb-scale .fig-toolbar { left: auto; right: var(--space-2); bottom: var(--space-2); }
  .tb-scale .fig-chip, .tb-scale .sc-range { display: none; }
  .tb-scale .fig-btn { padding: 0.2rem 0.45rem; }
}
`;

export function mount(root, ctx) {
  const ns = uid('sc');
  const wrap = h('div', { class: 'tb-scale' });
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', { class: 'tb-fill', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
  wrap.append(svg);

  const defs = el('defs');
  svg.append(defs);

  // ----- the instrument bands, each fading in on its left ("and larger") and capped at its limit -----
  const bands = el('g');
  BANDS.forEach((b, i) => {
    const y = 10 + i * 15;
    const xa = xOf(uOfMetres(b.from));
    const xb = xOf(uOfMetres(b.to));
    const gid = `${ns}-band${i}`;
    const grad = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: xa, x2: xa + 80, y1: 0, y2: 0 });
    grad.append(el('stop', { offset: 0, style: `stop-color: ${b.colour}; stop-opacity: 0` }));
    grad.append(el('stop', { offset: 1, style: `stop-color: ${b.colour}; stop-opacity: 0.34` }));
    defs.append(grad);
    bands.append(el('rect', { x: xa, y, width: xb - xa, height: 11, rx: 5.5, fill: `url(#${gid})` }));
    bands.append(el('path', { d: `M${xb} ${y - 1} L${xb} ${y + 12}`, stroke: b.colour, 'stroke-width': 2, 'stroke-linecap': 'round' }));
    bands.append(el('path', { d: `M${xb} ${y + 13} L${xb} ${RY - 6}`, stroke: b.colour, 'stroke-width': 1, 'stroke-dasharray': '1.5 4', opacity: 0.5 }));
    bands.append(text(xa + 72, y + 9, b.label, { class: 'sc-band', fill: b.colour }));
    bands.append(text(xb - 7, y + 9, b.limit, { anchor: 'end', class: 'sc-band sc-halo', fill: b.colour }));
  });
  svg.append(bands);

  // ----- the ruler -----
  const ruler = el('g');
  ruler.append(el('path', { d: `M${X0 - 8} ${RY} L${X1 + 8} ${RY}`, stroke: C.ink, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
  for (const t of TICKS) {
    const x = xOf(t.u).toFixed(1);
    ruler.append(el('path', { d: `M${x} ${RY} L${x} ${RY + (t.major ? 10 : 5)}`, stroke: t.major ? C.ink : C.ruleStrong, 'stroke-width': t.major ? 1.5 : 1 }));
    if (t.major) ruler.append(text(x, RY + 24, t.label, { anchor: 'middle', class: 'sc-tick' }));
  }
  svg.append(ruler);

  // ----- the markers: a dot on the ruler, a stem, an icon and a two-line label -----
  const stems = el('g');
  const icons = el('g');
  const labels = el('g', { class: 'sc-labels' });
  const dots = el('g');
  const markerNodes = MARKERS.map((m) => {
    const x = xOf(uOfMetres(m.metres));
    const y = ROW_Y[m.row];
    stems.append(el('path', { d: `M${x.toFixed(1)} ${RY - 4} L${x.toFixed(1)} ${y + 12}`, stroke: C.ruleStrong, 'stroke-width': 1 }));
    const icon = el('g', { transform: `translate(${x.toFixed(1)} ${y})` });
    m.icon(icon);
    icons.append(icon);
    const anchor = m.anchor || 'middle';
    const lx = anchor === 'end' ? x + 12 : x;
    const label = el('g', { class: 'sc-label' });
    label.append(text(lx.toFixed(1), y - 27, m.label, { anchor, class: 'sc-name sc-halo' }));
    label.append(text(lx.toFixed(1), y - 15, formatMetres(m.metres), { anchor, class: 'sc-size sc-halo' }));
    labels.append(label);
    const dot = el('circle', { cx: x.toFixed(1), cy: RY, r: 3, fill: C.ink });
    dots.append(dot);
    return { m, x, label, dot };
  });
  svg.append(stems, icons, labels, dots);

  // A wide invisible track: a click or tap anywhere near the ruler sends the lens there.
  const track = el('rect', { class: 'sc-track', x: 0, y: RY - LR - 40, width: W, height: LR * 2 + 90, fill: 'transparent' });
  svg.append(track);

  // ----- the lens -----
  const clipId = `${ns}-lensclip`;
  defs.append(el('clipPath', { id: clipId }, [el('circle', { r: LR })]));
  const lensG = el('g', { class: 'sc-lens', tabindex: 0, role: 'slider', 'aria-label': 'Lens along the ruler', 'aria-valuemin': U_MIN, 'aria-valuemax': U_MAX, 'aria-orientation': 'horizontal' });
  const ha = (HANDLE_DEG * Math.PI) / 180;
  const hx1 = (Math.cos(ha) * (LR - 2)).toFixed(1);
  const hy1 = (Math.sin(ha) * (LR - 2)).toFixed(1);
  const hx2 = (Math.cos(ha) * (LR + HANDLE)).toFixed(1);
  const hy2 = (Math.sin(ha) * (LR + HANDLE)).toFixed(1);
  lensG.append(el('path', { d: `M${hx1} ${hy1} L${hx2} ${hy2}`, stroke: glass, 'stroke-width': 11, 'stroke-linecap': 'round' }));
  lensG.append(el('circle', { r: LR, fill: C.paper, style: `fill: ${glassFill}` }));
  const inner = el('g', { 'clip-path': `url(#${clipId})` });
  lensG.append(inner);
  lensG.append(el('circle', { class: 'sc-ring', r: LR, fill: 'none', stroke: glass, 'stroke-width': 2.5 }));
  lensG.append(el('circle', { class: 'sc-focus', r: LR + 3.5, fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1 }));
  lensG.append(el('path', { d: `M${(-LR * 0.62).toFixed(1)} ${(-LR * 0.62).toFixed(1)} A${LR - 6} ${LR - 6} 0 0 1 ${(-LR * 0.16).toFixed(1)} ${(-LR * 0.86).toFixed(1)}`, stroke: C.paper, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 }));
  svg.append(lensG);

  // ----- card and toolbar -----
  const cardTitle = h('h5');
  const cardAbout = h('p');
  const cardSeen = h('p', { class: 'sc-seen' });
  const card = h('div', { class: 'fig-card fig-ui sc-card', 'aria-live': 'polite' }, [cardTitle, cardAbout, cardSeen]);
  wrap.append(card);

  const prev = h('button', { class: 'fig-btn', type: 'button', 'aria-label': 'Previous, larger thing', text: '←' });
  const next = h('button', { class: 'fig-btn', type: 'button', 'aria-label': 'Next, smaller thing', text: '→' });
  const chip = h('span', { class: 'fig-chip' });
  const range = h('input', { class: 'fig-range sc-range', type: 'range', min: 0, max: 1000, step: 5, value: 0, 'aria-label': 'Lens position along the ruler' });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [prev, chip, range, next]);
  wrap.append(toolbar);

  // ----- state -----
  let u = uOfMetres(2e-5);
  let nearest = null;
  let glide = null;
  let dragging = null;

  function nearestMarker(uu) {
    let best = null;
    for (const m of MARKERS) {
      const d = Math.abs(uOfMetres(m.metres) - uu);
      if (!best || d < best.d) best = { m, d };
    }
    return best.m;
  }

  // The magnified strip: the ruler under the lens at ZOOM, with ticks and the things in view.
  function paintLens() {
    const lx = xOf(u);
    lensG.setAttribute('transform', `translate(${lx.toFixed(2)} ${RY})`);
    inner.replaceChildren();
    inner.append(el('path', { d: `M${-LR} 0 L${LR} 0`, stroke: C.ink, 'stroke-width': 1.5 }));
    const items = [];
    for (const t of TICKS) {
      const x = (xOf(t.u) - lx) * ZOOM;
      if (Math.abs(x) > LR + 8) continue;
      inner.append(el('path', { d: `M${x.toFixed(1)} 0 L${x.toFixed(1)} ${t.major ? 11 : 6}`, stroke: t.major ? C.ink : C.ruleStrong, 'stroke-width': t.major ? 1.5 : 1 }));
      if (!t.major) continue;
      const width = t.label.length * 6.6 + 8;
      if (Math.abs(x) + width / 2 < LR - 4) items.push({ x, width, tick: t });
    }
    for (const m of MARKERS) {
      const x = (xOf(uOfMetres(m.metres)) - lx) * ZOOM;
      if (Math.abs(x) > LR - 12) continue;
      items.push({ x, width: Math.max(m.label.length, 7) * 6.8 + 10, m });
    }
    // Labels below the line, in up to three rows, so neighbours never overlap.
    items.sort((a, b) => a.x - b.x);
    const rowEnd = [-Infinity, -Infinity, -Infinity];
    for (const it of items) {
      const left = it.x - it.width / 2;
      let row = rowEnd.findIndex((end) => end <= left);
      if (row < 0) row = 0;
      rowEnd[row] = it.x + it.width / 2;
      const y = 24 + row * 26;
      const xs = it.x.toFixed(1);
      if (it.tick) {
        inner.append(text(xs, y, it.tick.label, { anchor: 'middle', class: 'sc-tick sc-halo' }));
        continue;
      }
      const near = it.m === nearest;
      inner.append(el('circle', { cx: xs, cy: 0, r: near ? 4.5 : 3.2, fill: near ? C.leaf : C.ink }));
      const icon = el('g', { transform: `translate(${xs} -38) scale(1.7)` });
      it.m.icon(icon);
      inner.append(icon);
      inner.append(text(xs, y, it.m.label, { anchor: 'middle', class: `sc-name sc-halo${near ? ' is-near' : ''}` }));
      inner.append(text(xs, y + 12, formatMetres(it.m.metres), { anchor: 'middle', class: 'sc-size sc-halo' }));
    }
  }

  function paintCard() {
    const m = nearest;
    cardTitle.replaceChildren(m.name, h('span', { class: 'sc-card-size', text: formatMetres(m.metres) }));
    cardAbout.textContent = m.about;
    const seen = seenWith(m.metres);
    cardSeen.replaceChildren(h('i', { style: `--dot: ${seen.colour}` }), `${seen.label} · ${seen.limit}`);
  }

  function setU(value, { paintAll = true } = {}) {
    u = clamp(value, U_MIN, U_MAX);
    const m = nearestMarker(u);
    if (m !== nearest) {
      nearest = m;
      for (const node of markerNodes) {
        const near = node.m === m;
        node.label.classList.toggle('is-near', near);
        node.dot.setAttribute('r', near ? 4.5 : 3);
        node.dot.setAttribute('fill', near ? C.leaf : C.ink);
      }
      paintCard();
    }
    const metres = 10 ** u;
    const valueText = `${formatMetres(metres)}, nearest ${m.name}`;
    lensG.setAttribute('aria-valuenow', u.toFixed(2));
    lensG.setAttribute('aria-valuetext', valueText);
    range.setAttribute('aria-valuetext', valueText);
    chip.textContent = `lens at ${formatMetres(metres)}`;
    if (paintAll) {
      const v = Math.round(((U_MAX - u) / (U_MAX - U_MIN)) * 1000);
      if (Number(range.value) !== v) range.value = String(v);
    }
    paintLens();
    const idx = MARKERS.indexOf(m);
    prev.disabled = idx === 0 && Math.abs(uOfMetres(m.metres) - u) < 1e-6;
    next.disabled = idx === MARKERS.length - 1 && Math.abs(uOfMetres(m.metres) - u) < 1e-6;
  }

  function glideTo(target) {
    if (glide) glide.finish();
    const from = u;
    const to = clamp(target, U_MIN, U_MAX);
    glide = tween({
      duration: GLIDE_MS,
      instant: ctx.reducedMotion || ctx.pinnedTime !== null,
      update(p) { setU(lerp(from, to, p)); },
      done() { glide = null; },
    });
  }

  // Step to the next thing on the ruler in either direction; from between two, the nearer one first.
  function step(dir) {
    const eps = 1e-6;
    const sorted = MARKERS.map((m) => uOfMetres(m.metres));
    let target = null;
    if (dir > 0) {
      for (const uu of sorted) if (uu < u - eps) { target = uu; break; }
    } else {
      for (let i = sorted.length - 1; i >= 0; i -= 1) if (sorted[i] > u + eps) { target = sorted[i]; break; }
    }
    if (target !== null) glideTo(target);
  }

  // ----- pointer: drag the lens by its glass or handle, or tap the ruler to send it there -----
  function svgX(e) {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return pt.x;
  }
  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const onLens = lensG.contains(e.target);
    if (!onLens && e.target !== track) return;
    e.preventDefault();
    if (glide) glide.finish();
    const x = svgX(e);
    const offset = onLens ? xOf(u) - x : 0;
    dragging = { id: e.pointerId, offset };
    wrap.classList.add('is-dragging');
    try { svg.setPointerCapture(e.pointerId); } catch { /* not every target supports capture */ }
    if (!onLens) setU(uOf(x));
    lensG.focus({ preventScroll: true });
  };
  const onMove = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    e.preventDefault();
    setU(uOf(svgX(e) + dragging.offset));
  };
  const onUp = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    dragging = null;
    wrap.classList.remove('is-dragging');
    try { svg.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  };
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);

  // ----- keyboard: arrows on the lens step between things (Shift nudges), Home/End go to the ends -----
  const onKey = (e) => {
    if (e.target === range) return;
    const nudge = e.shiftKey ? 0.1 : null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nudge ? glideTo(u - nudge) : step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); nudge ? glideTo(u + nudge) : step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); glideTo(U_MAX); }
    else if (e.key === 'End') { e.preventDefault(); glideTo(U_MIN); }
  };
  lensG.addEventListener('keydown', onKey);
  const onRange = () => {
    if (glide) glide.cancel();
    glide = null;
    setU(U_MAX - (Number(range.value) / 1000) * (U_MAX - U_MIN), { paintAll: false });
  };
  range.addEventListener('input', onRange);
  const onPrev = () => step(-1);
  const onNext = () => step(1);
  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);

  setU(u);
  root.append(wrap);

  let readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      cancelAnimationFrame(readyRaf);
      if (glide) glide.cancel();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      lensG.removeEventListener('keydown', onKey);
      range.removeEventListener('input', onRange);
      prev.removeEventListener('click', onPrev);
      next.removeEventListener('click', onNext);
      root.replaceChildren();
    },
    setTime() {
      if (glide) glide.finish();
    },
    setVisible() {},
    setTheme() {},
    describe() {
      return { lensMetres: Number((10 ** u).toPrecision(3)), nearest: nearest.id };
    },
  };
}
