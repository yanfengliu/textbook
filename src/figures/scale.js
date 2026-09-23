// How small is a cell? A logarithmic ruler from 10 m down to 0.1 nm, seventeen things drawn at their
// true positions with a tiny icon each, and the instrument each one needs. The figure draws itself two
// ways and a ResizeObserver on the stage picks between them at NARROW_MAX of stage width.
//
// Wide (a stage of NARROW_MAX px or more): the whole eleven decades at once, three bands for what the naked
// eye, a light microscope and an electron microscope can resolve, and a hand lens the reader slides
// along the ruler. The lens shows the ruler under it magnified 2.6x, so crowded neighbours spread out.
//
// Narrow (a phone, where the whole ruler at 1000 units would render an 11.5 px label at 4 px): the
// frame becomes the magnified window. A thin strip across the top carries the whole range, coloured by
// the instrument that reaches it, with a bracket showing which slice is open below; the window under it
// is a couple of decades of ruler with the things in it drawn at full size. Dragging, the arrow keys
// and the buttons move the window instead of the lens. The narrow drawing's viewBox is the stage's own
// pixel size, so a 11.5 px label is 11.5 device pixels.
//
// The only motion is the glide to a new place (280 ms, a cut under reduced motion).
// describe() -> { lensMetres, nearest }.
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

// Below this stage width the narrow layout is drawn. The wide drawing is 1000 units across, so all of
// its type lands at (size * stage / 1000) device pixels, and the binding one is the 10.5 px size line
// under every name: at 900 it is 9.5 px, the floor for type in this book, and under that the wide
// layout is not a smaller picture but an unreadable one. Stages this decides for: the lab at a 1000 px
// viewport is 952 and stays wide (the drive gate's viewport, so its recipe still meets the lens); the
// chapter is 100vw under an 800 px viewport, and measured 656 at 1024 and 989 at 1440.
const NARROW_MAX = 900;

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

// Where one instrument gives out and the next takes over, as log10 metres. The narrow strip paints the
// whole range in these three pieces, so the reader sees which instrument reaches which size at a glance.
const HANDOVER = [uOfMetres(1e-4), uOfMetres(2e-7)];

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
.tb-scale .is-near .sc-name, .tb-scale text.is-near { fill: var(--leaf-text); font-weight: 600; }
.tb-scale .sc-lens { cursor: grab; outline: none; }
.tb-scale .sc-lens:focus-visible .sc-focus { stroke: var(--leaf); stroke-width: 2; }
.tb-scale.is-dragging .sc-lens { cursor: grabbing; }
.tb-scale .sc-track { cursor: pointer; }
.tb-scale .fig-card { top: auto; bottom: var(--space-3); left: var(--space-3); max-width: min(23rem, 46%); padding: var(--space-2) var(--space-4) var(--space-3); }
.tb-scale .fig-card h5 { display: flex; align-items: baseline; gap: 0.5em; flex-wrap: wrap; }
.tb-scale .fig-card h5 .sc-card-size { font-family: var(--font-ui); font-size: var(--text-xs); font-weight: 600; color: var(--leaf-text); font-variant-numeric: lining-nums tabular-nums; }
.tb-scale .fig-card .sc-seen { margin-top: 0.35em; display: flex; align-items: center; gap: 0.45em; }
.tb-scale .fig-card .sc-seen i { width: 0.55em; height: 0.55em; border-radius: 50%; background: var(--dot); flex: none; }
.tb-scale .fig-toolbar { left: 52%; justify-content: flex-end; flex-wrap: nowrap; }
.tb-scale .sc-range { flex: 0 1 12rem; min-width: 4rem; }
/* The chip carries one short phrase and must not break it over two lines when the toolbar is tight. */
.tb-scale .fig-chip { white-space: nowrap; }

/* The narrow layout. The drawing's viewBox is the stage's own pixel box, so every size below is the
   size it lands at on the glass; nothing here may go under 10. The card and the buttons share one
   band across the bottom that the drawing leaves empty (NARROW_BAND in this file). */
.tb-scale.is-narrow .sc-name { font-size: 11.5px; }
.tb-scale.is-narrow .sc-size { font-size: 10px; }
.tb-scale.is-narrow .sc-tick { font-size: 10.5px; }
.tb-scale.is-narrow .sc-band { font-size: 11.5px; font-weight: 600; }
.tb-scale.is-narrow .sc-halo { stroke-width: 3px; }
.tb-scale.is-narrow .sc-inline { font-size: 10.5px; font-weight: 600; fill: var(--leaf-text); }
.tb-scale.is-narrow .sc-track { cursor: grab; }
.tb-scale.is-narrow.is-dragging .sc-track { cursor: grabbing; }
.tb-scale.is-narrow .fig-card {
  top: auto; bottom: var(--space-1); left: var(--space-2); max-width: 52%;
  padding: 0.2rem 0.5rem; border-radius: var(--radius); box-shadow: none;
}
.tb-scale.is-narrow .fig-card h5 { display: block; margin: 0; font-size: var(--text-xs); line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tb-scale.is-narrow .fig-card h5 .sc-card-size { margin-left: 0.4em; }
.tb-scale.is-narrow .fig-card p, .tb-scale.is-narrow .fig-card .sc-seen { display: none; }
.tb-scale.is-narrow .fig-toolbar { left: auto; right: var(--space-2); bottom: var(--space-1); gap: var(--space-1); }
.tb-scale.is-narrow .fig-chip { display: none; }
.tb-scale.is-narrow .sc-range { flex: 0 1 6rem; min-width: 3rem; }
.tb-scale.is-narrow .fig-btn { padding: 0.2rem 0.5rem; line-height: 1.25; }
@container (max-width: 290px) {
  .tb-scale.is-narrow .fig-card { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); padding: 0; border: 0; }
}
`;

// The bottom band of the narrow stage, in px: the card and the buttons live there and the drawing
// stops above it. Measured, not guessed: a narrow .fig-btn is 12px type on line-height 1.25, 0.2rem of
// padding and a hairline, and it hangs var(--space-1) = 6.4px off the floor, so the band is 29 px and
// this leaves a pixel of air. tools/inspect.js frames elements but does not report boxes inside a
// stage, so the number came from a scratch probe that reads the toolbar's box relative to the stage.
const NARROW_BAND = 30;

export function mount(root, ctx) {
  const ns = uid('sc');
  const wrap = h('div', { class: 'tb-scale' });
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', { class: 'tb-fill', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
  wrap.append(svg);

  // ----- card and toolbar: one set for both layouts -----
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
  let layout = null;
  let destroyed = false;
  // getComputedTextLength() is a layout flush, so each distinct string is measured once per layout.
  const widths = new Map();

  function nearestMarker(uu) {
    let best = null;
    for (const m of MARKERS) {
      const d = Math.abs(uOfMetres(m.metres) - uu);
      if (!best || d < best.d) best = { m, d };
    }
    return best.m;
  }

  // The rendered width of a text node already in the tree. Falls back to an estimate if the node is
  // not measurable, which would otherwise return 0 and pile every label into one row.
  function widthOf(node, key, str) {
    let w = widths.get(key);
    if (w === undefined) {
      w = node.getComputedTextLength();
      if (!(w > 0)) w = str.length * 6.4 + 8;
      widths.set(key, w);
    }
    return w;
  }

  // Greedy row packing over real measured extents: the first row with no overlap at this x wins, so a
  // gap in a row is reusable. Sets `row`, and may move `lx`. Items must arrive in x order.
  function packRows(items, nRows, min, max) {
    const used = Array.from({ length: nRows }, () => []);
    const free = (row, l, r) => !used[row].some(([a, b]) => l < b && r > a);
    for (const it of items) {
      const hw = it.w / 2 + 3;
      let row = 0;
      while (row < nRows && !free(row, it.lx - hw, it.lx + hw)) row += 1;
      if (row < nRows) {
        it.row = row;
        used[row].push([it.lx - hw, it.lx + hw]);
        continue;
      }
      // Every row is busy under this thing. Slide the label to the nearest clear spot rather than
      // stack it on a neighbour: a name a little off its stem still reads, two names on top of each
      // other do not. Nothing in this book's window has needed this yet; it is the floor, not the plan.
      let best = null;
      for (let r2 = 0; r2 < nRows; r2 += 1) {
        const edges = [min + hw];
        for (const [a, b] of used[r2]) edges.push(a - hw, b + hw);
        for (const e of edges) {
          const lx = clamp(e, min + hw, max - hw);
          if (!free(r2, lx - hw, lx + hw)) continue;
          const d = Math.abs(lx - it.lx);
          if (!best || d < best.d) best = { row: r2, lx, d };
        }
      }
      if (best) {
        it.row = best.row;
        it.lx = best.lx;
        used[best.row].push([best.lx - hw, best.lx + hw]);
      } else {
        it.row = nRows - 1;
      }
    }
  }

  // ---------------------------------------------------------------- the wide layout
  function buildWide() {
    const defs = el('defs');
    svg.append(defs);

    // the instrument bands, each fading in on its left ("and larger") and capped at its limit
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

    // the ruler
    const ruler = el('g');
    ruler.append(el('path', { d: `M${X0 - 8} ${RY} L${X1 + 8} ${RY}`, stroke: C.ink, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
    for (const t of TICKS) {
      const x = xOf(t.u).toFixed(1);
      ruler.append(el('path', { d: `M${x} ${RY} L${x} ${RY + (t.major ? 10 : 5)}`, stroke: t.major ? C.ink : C.ruleStrong, 'stroke-width': t.major ? 1.5 : 1 }));
      if (t.major) ruler.append(text(x, RY + 24, t.label, { anchor: 'middle', class: 'sc-tick' }));
    }
    svg.append(ruler);

    // the markers: a dot on the ruler, a stem, an icon and a two-line label
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

    // the lens
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

    // The magnified strip: the ruler under the lens at ZOOM, with ticks and the things in view.
    function paint() {
      for (const node of markerNodes) {
        const near = node.m === nearest;
        node.label.classList.toggle('is-near', near);
        node.dot.setAttribute('r', near ? 4.5 : 3);
        node.dot.setAttribute('fill', near ? C.leaf : C.ink);
      }
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

    // Drag the lens by its glass or handle, or tap the ruler to send it there.
    //
    // `onLens` is decided by the caller, BEFORE any glide is finished, and never re-derived here. The
    // lens's interior is redrawn with replaceChildren() on every repaint, so a press that landed on the
    // ruler line or a tick INSIDE the lens is a detached node the moment the glide finishes, and
    // `lensG.contains(e.target)` answers no about a node that is no longer anywhere — which dropped the
    // press entirely. See onDown below for the measurement.
    function down(e, x, y, onLens) {
      if (!onLens && e.target !== track) return null;
      const offset = onLens ? xOf(u) - x : 0;
      if (!onLens) setU(uOf(x));
      return { move: (mx) => setU(uOf(mx + offset)) };
    }

    return { mode: 'wide', vw: W, vh: H, lens: lensG, paint, down };
  }

  // ---------------------------------------------------------------- the narrow layout
  // vw x vh are the stage's own pixels, so one unit here is one device pixel.
  function buildNarrow(vw, vh) {
    const pad = 9;
    const x0 = pad;
    const x1 = vw - pad;
    const span = x1 - x0;

    const barH = vh > 210 ? 11 : 8;
    const barTop = vh > 210 ? 17 : 14;
    const stripBottom = barTop + barH + 4;

    // Laid out from the bottom up, because the floor is fixed: the card and the buttons own the last
    // NARROW_BAND pixels, three rows of names must fit above them at a phone's 149 px of stage, and
    // whatever is left over between the strip and the ruler becomes the icon row. A taller narrow
    // stage (the chapter at a 1024 px viewport gives 656 x 287) spends the extra on bigger icons, a
    // size under every name and a fourth row rather than on empty paper.
    const twoLine = vh >= 215;
    const rowGap = twoLine ? 21 : 12.5;
    const tail = (twoLine ? 10 : 0) + 5; // the size line under the last row, plus its descenders
    const rulerToRow = 17;
    const tickAbove = 14; // the ruler line up to the top of a decade label's glyphs
    const stem = clamp(17 + (vh - 150) * 0.05, tickAbove + 3, 26);
    const rowLast = vh - NARROW_BAND - tail;
    const iconTop = stripBottom + 3;
    // How many rows, and how big the icons, comes from what is actually left between the strip and the
    // control band. Rows are chosen before portraits: a name that had to slide off its stem to fit is a
    // worse figure than a small icon, and at a 320 px phone one of the two has to give. Deriving the
    // icon from the space left over is also what keeps it off the ruler; sizing it first and hoping put
    // the icons through the line at a 272 px stage.
    const rulerFor = (rows) => rowLast - (rows - 1) * rowGap - rulerToRow;
    let nRows = 2;
    let iconScale = 0;
    for (const rows of [4, 3]) {
      const space = rulerFor(rows) - stem - iconTop;
      if (space < 21) continue;
      nRows = rows;
      iconScale = clamp(space / 26, 0.82, 1.5);
      break;
    }
    if (!iconScale) {
      for (const rows of [3, 2]) {
        // The decade labels still need their band above the line, icons or no icons.
        if (rulerFor(rows) - iconTop < tickAbove + 2) continue;
        nRows = rows;
        const space = rulerFor(rows) - stem - iconTop;
        iconScale = space >= 16 ? clamp(space / 26, 0.62, 1.5) : 0;
        break;
      }
    }
    const rulerY = rulerFor(nRows);
    const row0 = rulerY + rulerToRow;
    const iconHalf = 13 * iconScale;
    const iconBottom = rulerY - stem;
    // Sit the icons a little below the middle of their space: the stems to the ruler shorten and the
    // room under the strip grows, which is where the bracket's two connector lines want to run.
    const iconCy = iconTop + iconHalf + Math.max(0, iconBottom - iconTop - iconHalf * 2) * 0.62;
    const iconRow = iconScale ? iconCy - iconHalf : rulerY - tickAbove; // the top of the drawing below the strip
    const top = Math.max(barTop + barH + 6, iconRow - 4); // where the mark's plumb line starts

    // How much of the ruler the window holds. A wider stage opens a wider window, so the crowd of
    // things per inch stays about the same wherever the reader is; a stage with a fourth label row can
    // carry a denser window, which is what keeps a 852 px stage from being six things on a lot of paper.
    const decades = clamp(vw / (nRows >= 4 ? 145 : 160), 1.7, 5);
    const perU = span / decades;

    const sx = (uu) => x0 + ((U_MAX - uu) / (U_MAX - U_MIN)) * span;
    const uStrip = (x) => U_MAX - ((x - x0) / span) * (U_MAX - U_MIN);
    let lo = u + decades / 2; // the window's large end, set by every paint
    const uWin = (x) => lo - ((x - x0) / span) * decades;

    const defs = el('defs');
    svg.append(defs);

    // Not every icon is the nominal 24-unit box: E. coli's flagella reach 40 units across and the DNA
    // helix 24, so clamping them all by 13 pushed E. coli's tail through the frame edge. Measure each
    // one once per layout and let the spread and the edge clamp use the real half-width.
    const probe = el('g', { opacity: 0, 'pointer-events': 'none' });
    svg.append(probe);
    const iconHW = new Map();
    for (const m of MARKERS) {
      const g = el('g');
      m.icon(g);
      probe.append(g);
      let hw = 13;
      try {
        const bb = g.getBBox();
        if (bb.width > 0) hw = Math.max(-bb.x, bb.x + bb.width);
      } catch { /* not rendered: the nominal box is close enough */ }
      iconHW.set(m.id, hw);
    }
    probe.remove();

    // ---- the strip: the whole eleven decades, in the three pieces the instruments carve it into ----
    const stripG = el('g');
    const clipId = `${ns}-strip`;
    defs.append(el('clipPath', { id: clipId }, [el('rect', { x: x0, y: barTop, width: span, height: barH, rx: barH / 2 })]));
    const zones = el('g', { 'clip-path': `url(#${clipId})` });
    const edges = [U_MAX, HANDOVER[0], HANDOVER[1], U_MIN];
    BANDS.forEach((b, i) => {
      const a = sx(edges[i]);
      const z = sx(edges[i + 1]);
      zones.append(el('rect', { x: a, y: barTop, width: z - a, height: barH, fill: tint(b.colour, 34) }));
      if (i > 0) zones.append(el('path', { d: `M${a.toFixed(1)} ${barTop} L${a.toFixed(1)} ${barTop + barH}`, stroke: b.colour, 'stroke-width': 1.4 }));
    });
    stripG.append(zones);
    // --rule-strong is a hairline against paper; against the dark theme's stage it is very nearly the
    // stage, and the eleven decade stubs under the bar vanished. A mix of the ink shows in both.
    const stripRule = tint(C.ink, 30);
    stripG.append(el('rect', { x: x0, y: barTop, width: span, height: barH, rx: barH / 2, fill: 'none', stroke: stripRule, 'stroke-width': 1 }));
    for (let d = U_MAX; d >= U_MIN; d -= 1) {
      const x = sx(d).toFixed(1);
      stripG.append(el('path', { d: `M${x} ${barTop + barH} L${x} ${barTop + barH + 3.5}`, stroke: stripRule, 'stroke-width': 1 }));
    }
    // Two lines splaying from the bracket out to the window's edges, so the bracket reads as the slice
    // the frame below has opened. Only when there is real room between the strip and the icons: at a
    // phone's height they would be a 3 px stub, which reads as a stray mark, not as a zoom.
    const gap = iconRow - 4 - (barTop + barH + 4);
    const conn = gap >= 14 ? el('path', { stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '2 3', fill: 'none' }) : null;
    if (conn) stripG.append(conn);
    svg.append(stripG);

    // ---- the bracket on the strip: the slice the window below is showing, and a knob at the mark ----
    const lensG = el('g', { class: 'sc-lens', tabindex: 0, role: 'slider', 'aria-label': 'Window along the ruler', 'aria-valuemin': U_MIN, 'aria-valuemax': U_MAX, 'aria-orientation': 'horizontal' });
    // The bracket is its own focus ring: a separate outer rect would have to grow, and at either end of
    // the strip it grew straight through the instrument's name and the range caption on the line above.
    const bracket = el('rect', { class: 'sc-focus', fill: 'none', stroke: C.ink, 'stroke-width': 1.2, rx: 4 });
    const knob = el('circle', { class: 'sc-knob', r: 3.4, cy: barTop + barH / 2, fill: C.leaf });
    lensG.append(bracket, knob);
    svg.append(lensG);

    // The captions go on top of the bracket, with a halo: at either end of the strip the bracket's
    // focus ring runs under them, and the descender of "naked eye" sat on the green line.
    const caps = el('g', { 'pointer-events': 'none' });
    const bandText = text(x0 + 1, barTop - 6, '', { class: 'sc-band sc-halo' });
    caps.append(bandText);
    caps.append(text(x1, barTop - 6, '10 m → 0.1 nm', { anchor: 'end', class: 'sc-tick sc-halo' }));
    svg.append(caps);

    // The whole strip is one scrubber: a press anywhere on it sends the window there and keeps dragging.
    const stripHit = el('rect', { class: 'sc-track', x: 0, y: 0, width: vw, height: stripBottom + 4, fill: 'transparent' });
    svg.append(stripHit);

    // ---- the window ----
    const winG = el('g');
    svg.append(winG);
    const winHit = el('rect', { class: 'sc-track', x: 0, y: stripBottom + 4, width: vw, height: Math.max(0, vh - NARROW_BAND - stripBottom - 4), fill: 'transparent' });
    svg.append(winHit);

    function paint() {
      const half = decades / 2;
      lo = u + half;
      let hi = u - half;
      if (lo > U_MAX) { lo = U_MAX; hi = U_MAX - decades; }
      if (hi < U_MIN) { hi = U_MIN; lo = U_MIN + decades; }
      const wx = (uu) => x0 + ((lo - uu) / decades) * span;

      // the strip's bracket, knob, connectors and the name of the instrument at the mark
      const bl = sx(lo) - 2;
      const br = sx(hi) + 2;
      bracket.setAttribute('x', bl.toFixed(1));
      bracket.setAttribute('width', (br - bl).toFixed(1));
      bracket.setAttribute('y', barTop - 3.5);
      bracket.setAttribute('height', barH + 7);
      knob.setAttribute('cx', sx(u).toFixed(1));
      const band = seenWith(10 ** u);
      bandText.textContent = band.label;
      bandText.setAttribute('fill', band.colour);
      if (conn) conn.setAttribute('d', `M${bl.toFixed(1)} ${barTop + barH + 4} L${x0} ${(iconRow - 4).toFixed(1)} M${br.toFixed(1)} ${barTop + barH + 4} L${x1} ${(iconRow - 4).toFixed(1)}`);

      // the window: one ruler line, its ticks, the things on it, and the mark
      winG.replaceChildren();
      const rulerG = el('g');
      const stemG = el('g');
      const iconG = el('g');
      const dotG = el('g');
      const labelG = el('g');
      winG.append(rulerG, stemG, iconG, dotG, labelG);
      rulerG.append(el('path', { d: `M${x0} ${rulerY.toFixed(1)} L${x1} ${rulerY.toFixed(1)}`, stroke: C.ink, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
      // The mark's own plumb line goes in first, behind the icons it passes through.
      const markX = wx(u);
      rulerG.append(el('path', { d: `M${markX.toFixed(1)} ${top.toFixed(1)} L${markX.toFixed(1)} ${rulerY.toFixed(1)}`, stroke: C.leaf, 'stroke-width': 1, opacity: 0.3 }));

      // The decade labels sit above the line, right under the icons, so the three rows below it are
      // the things' names alone: at a phone's window a cluster like the hair, the human egg and the
      // paramecium needs all three, and a decade label taking one of them costs a name.
      for (const t of TICKS) {
        if (t.u > lo || t.u < hi) continue;
        const x = wx(t.u);
        rulerG.append(el('path', { d: `M${x.toFixed(1)} ${rulerY.toFixed(1)} L${x.toFixed(1)} ${(rulerY + (t.major ? 7 : 4)).toFixed(1)}`, stroke: t.major ? C.ink : C.ruleStrong, 'stroke-width': t.major ? 1.4 : 1 }));
        if (!t.major) continue;
        const node = text(0, (rulerY - 6).toFixed(1), t.label, { anchor: 'middle', class: 'sc-tick sc-halo' });
        labelG.append(node);
        const w = widthOf(node, `t:${t.label}`, t.label);
        node.setAttribute('x', clamp(x, x0 + w / 2, x1 - w / 2).toFixed(1));
      }

      const items = [];
      for (const m of MARKERS) {
        const mu = uOfMetres(m.metres);
        if (mu > lo || mu < hi) continue;
        items.push({ x: wx(mu), m, near: m === nearest });
      }
      items.sort((a, b) => a.x - b.x);

      // Build the labels first so they can be measured, then pack them into rows and place them.
      for (const it of items) {
        const node = el('text', { x: 0, y: -50, 'text-anchor': 'middle', class: `sc-name sc-halo${it.near ? ' is-near' : ''}` });
        node.append(document.createTextNode(it.m.label));
        const size = formatMetres(it.m.metres);
        if (it.near && !twoLine) node.append(el('tspan', { class: 'sc-inline', dx: 5, text: size }));
        labelG.append(node);
        it.node = node;
        it.w = widthOf(node, `${twoLine ? 'n' : it.near ? 'N' : 'n'}:${it.m.id}`, `${it.m.label}${it.near && !twoLine ? size : ''}`);
        if (twoLine) {
          it.sizeNode = text(0, -50, size, { anchor: 'middle', class: `sc-size sc-halo${it.near ? ' is-near' : ''}` });
          labelG.append(it.sizeNode);
          it.w = Math.max(it.w, widthOf(it.sizeNode, `s:${size}`, size));
        }
        it.hw = (iconHW.get(it.m.id) ?? 13) * iconScale;
        it.ix = clamp(it.x, x0 + it.hw, x1 - it.hw);
      }

      // Things a tenth of a decade apart (the hair and the human egg) draw icons on top of each other.
      // Push them apart just enough to separate, and let each stem slant back to the true position:
      // the dot on the ruler is where the size is read, the icon is only the portrait.
      for (let pass = 0; pass < 4; pass += 1) {
        for (let i = 1; i < items.length; i += 1) {
          const want = items[i - 1].hw + items[i].hw + 2;
          const d = items[i].ix - items[i - 1].ix;
          if (d >= want) continue;
          const push = (want - d) / 2;
          items[i - 1].ix -= push;
          items[i].ix += push;
        }
        for (const it of items) it.ix = clamp(it.ix, x0 + it.hw, x1 - it.hw);
      }

      for (const it of items) {
        if (iconScale) {
          const icon = el('g', { transform: `translate(${it.ix.toFixed(1)} ${iconCy.toFixed(1)}) scale(${iconScale.toFixed(2)})` });
          it.m.icon(icon);
          iconG.append(icon);
          stemG.append(el('path', { d: `M${it.ix.toFixed(1)} ${(iconCy + iconHalf).toFixed(1)} L${it.x.toFixed(1)} ${(rulerY - 1).toFixed(1)}`, stroke: C.ruleStrong, 'stroke-width': 1 }));
        }
        dotG.append(el('circle', { cx: it.x.toFixed(1), cy: rulerY.toFixed(1), r: it.near ? 4.5 : 3.2, fill: it.near ? C.leaf : C.ink }));
      }
      for (const it of items) it.lx = clamp(it.x, x0 + it.w / 2, x1 - it.w / 2);
      packRows(items, nRows, x0, x1);
      for (const it of items) {
        const y = row0 + it.row * rowGap;
        it.node.setAttribute('x', it.lx.toFixed(1));
        it.node.setAttribute('y', y.toFixed(1));
        if (it.sizeNode) {
          it.sizeNode.setAttribute('x', it.lx.toFixed(1));
          it.sizeNode.setAttribute('y', (y + 10).toFixed(1));
        }
      }

      // the mark's head, below the line among the ticks: where the reader actually is, which is not
      // always on a thing
      const markG = el('g');
      markG.append(el('path', { d: `M${(markX - 5).toFixed(1)} ${(rulerY + 8).toFixed(1)} L${(markX + 5).toFixed(1)} ${(rulerY + 8).toFixed(1)} L${markX.toFixed(1)} ${(rulerY + 1).toFixed(1)} Z`, fill: C.leaf }));
      winG.insertBefore(markG, labelG);
    }

    // The strip scrubs; the window pans with the finger, and a tap in it goes to what was tapped.
    function down(e, x, y) {
      if (y <= stripBottom + 4) {
        setU(uStrip(x));
        return { move: (mx) => setU(uStrip(mx)) };
      }
      if (y > vh - NARROW_BAND + 4) return null;
      const u0 = u;
      const x0c = x;
      let moved = 0;
      return {
        move: (mx) => {
          moved = Math.max(moved, Math.abs(mx - x0c));
          setU(u0 + (mx - x0c) / perU);
        },
        up: (mx) => {
          if (moved >= 4) return;
          const target = uWin(mx);
          const m = nearestMarker(target);
          const mu = uOfMetres(m.metres);
          glideTo(Math.abs(mu - target) * perU <= 20 ? mu : target);
        },
      };
    }

    return { mode: 'narrow', vw, vh, lens: lensG, paint, down };
  }

  // ---------------------------------------------------------------- shared behaviour
  function paintCard() {
    const m = nearest;
    const narrow = layout?.mode === 'narrow';
    cardTitle.replaceChildren(narrow ? m.label : m.name, h('span', { class: 'sc-card-size', text: formatMetres(m.metres) }));
    cardAbout.textContent = m.about;
    const seen = seenWith(m.metres);
    cardSeen.replaceChildren(h('i', { style: `--dot: ${seen.colour}` }), `${seen.label} · ${seen.limit}`);
  }

  function setU(value, { paintAll = true } = {}) {
    u = clamp(value, U_MIN, U_MAX);
    const m = nearestMarker(u);
    if (m !== nearest) {
      nearest = m;
      paintCard();
    }
    const metres = 10 ** u;
    const valueText = `${formatMetres(metres)}, nearest ${m.name}`;
    layout.lens.setAttribute('aria-valuenow', u.toFixed(2));
    layout.lens.setAttribute('aria-valuetext', valueText);
    range.setAttribute('aria-valuetext', valueText);
    chip.textContent = `lens at ${formatMetres(metres)}`;
    if (paintAll) {
      const v = Math.round(((U_MAX - u) / (U_MAX - U_MIN)) * 1000);
      if (Number(range.value) !== v) range.value = String(v);
    }
    layout.paint();
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

  // ----- pointer: each layout says what a press on it means -----
  function svgPoint(e) {
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  }
  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    // WHAT WAS PRESSED IS READ FIRST, before the glide is finished, and this order is the fix rather
    // than a tidy-up. `glide.finish()` runs the tween's last update, which calls setU, which repaints —
    // and the wide layout's repaint rebuilds the lens's interior with `inner.replaceChildren()`. So a
    // press that landed on the ruler line, a tick or a label drawn inside the lens targeted a node that
    // finishing the glide had just thrown away, `lensG.contains(e.target)` said no about a detached
    // node, `down()` returned null, and the press was dropped: grabbing the lens while it was still
    // gliding did nothing at all. Measured 2026-09-17 through `DRIVE_KINDS=scale npm run drive` —
    // `drag-the-lens-left` failed 17 of 20 runs, and the pointerdown the figure had just handled read
    // back `stillInDocument: false, defaultPrevented: false` (out/scaleprobe/probe2.mjs). The three runs
    // that passed were the ones where the glide had ended before the press arrived.
    const onLens = layout.lens.contains(e.target);
    if (glide) glide.finish();
    const p = svgPoint(e);
    const d = layout.down(e, p.x, p.y, onLens);
    if (!d) return;
    e.preventDefault();
    dragging = { id: e.pointerId, ...d };
    wrap.classList.add('is-dragging');
    try { svg.setPointerCapture(e.pointerId); } catch { /* not every target supports capture */ }
    layout.lens.focus({ preventScroll: true });
  };
  const onMove = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    e.preventDefault();
    const p = svgPoint(e);
    dragging.move(p.x, p.y);
  };
  const onUp = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const p = svgPoint(e);
    const up = dragging.up;
    dragging = null;
    wrap.classList.remove('is-dragging');
    try { svg.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    up?.(p.x, p.y);
  };
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);

  // ----- keyboard: arrows step between things (Shift nudges), Home/End go to the ends -----
  const onKey = (e) => {
    if (e.target === range) return;
    const nudge = e.shiftKey ? 0.1 : null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nudge ? glideTo(u - nudge) : step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); nudge ? glideTo(u + nudge) : step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); glideTo(U_MAX); }
    else if (e.key === 'End') { e.preventDefault(); glideTo(U_MIN); }
  };
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

  // ----- choosing a layout, and rebuilding when the stage changes shape -----
  function applyLayout() {
    const w = root.clientWidth || W;
    const hgt = root.clientHeight || (w * 7) / 16;
    const mode = w < NARROW_MAX ? 'narrow' : 'wide';
    // The narrow drawing is authored in device pixels; snapping the viewBox to a 4 px step keeps the
    // scale within half a percent of 1:1 and keeps a slow drag-resize from rebuilding every frame.
    const vw = mode === 'narrow' ? Math.max(240, Math.round(w / 4) * 4) : W;
    const vh = mode === 'narrow' ? (vw * hgt) / w : H;
    // Height as well as width: the frame can hand a figure a different aspect on a narrow screen
    // (registry narrowAspect), and this figure lays itself out from the floor up.
    if (layout && layout.mode === mode && layout.vw === vw && Math.abs(layout.vh - vh) < 0.5) return;
    const keep = u;
    if (layout) layout.lens.removeEventListener('keydown', onKey);
    svg.replaceChildren();
    widths.clear();
    wrap.classList.toggle('is-narrow', mode === 'narrow');
    layout = mode === 'wide' ? buildWide() : buildNarrow(vw, vh);
    svg.setAttribute('viewBox', `0 0 ${layout.vw} ${layout.vh.toFixed(2)}`);
    layout.lens.addEventListener('keydown', onKey);
    nearest = null; // the card's title differs between the layouts, so make setU repaint it
    setU(keep);
  }

  let roRaf = 0;
  const ro = new ResizeObserver(() => {
    if (roRaf) return;
    roRaf = requestAnimationFrame(() => { roRaf = 0; if (!destroyed) applyLayout(); });
  });

  // The wrap goes in first: the narrow layout packs its rows from getComputedTextLength(), which is 0
  // for text that is not in a rendered tree, and a wrong width there is labels sitting on top of each other.
  root.append(wrap);
  applyLayout();
  ro.observe(root);

  // Label rows are packed from measured text, and before the webfont arrives those measurements are
  // the fallback face's. One repaint once Inter is in hand keeps the narrow rows honest.
  document.fonts?.ready?.then(() => {
    if (destroyed) return;
    widths.clear();
    layout.paint();
  });

  let readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(readyRaf);
      cancelAnimationFrame(roRaf);
      ro.disconnect();
      if (glide) glide.cancel();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      layout?.lens.removeEventListener('keydown', onKey);
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
