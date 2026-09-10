// Energy flows, matter cycles. A small landscape: the sun, a tree and grass (producers), a rabbit
// (primary consumer), a fox (secondary consumer), and fungi and bacteria in the soil (decomposers).
// Gold arrows carry energy one way and thin at every step, and a wisp labelled "heat" leaves upward
// at each transfer; green arrows carry carbon and nutrients round a closed loop through the
// decomposers and the soil back to the producers. Gold particles ride the energy routes and fade out
// as heat; green particles loop forever. Every particle position is a pure function of the clock, so
// setTime(t) shows the same frame anywhere. Under reduced motion the routes carry static flow marks
// instead. Toolbar: Energy, Matter, Both. describe() -> { mode, energyParticles, matterParticles }.
import { el, h, text, C, tint, uid, polar } from './lib/svg.js';

export const meta = { kind: 'energy', title: 'Energy flows, matter cycles', needsWebGL: false, aspect: 16 / 9 };

const W = 1000;
const H = 562.5;
const GROUND = 402;
const SPEED = 62; // particle speed, viewBox units per second
const HEAT_FADE = 0.35; // energy particles fade over this fraction of their route's last segment

const leafDark = 'color-mix(in srgb, var(--leaf) 68%, var(--ink))';
const goldDark = 'color-mix(in srgb, var(--gold) 72%, var(--ink))';
const coralDark = 'color-mix(in srgb, var(--coral) 72%, var(--ink))';
const soil = 'var(--paper-3)';
const soilDark = 'color-mix(in srgb, var(--ink-soft) 30%, var(--paper-3))';
const fur = 'color-mix(in srgb, var(--ink-soft) 34%, var(--paper))';

// ---------- the arrows: every segment is one path with an absolute start, so routes can chain them ----------
// Energy (gold): one way, thinning.
const E = {
  sun: { d: 'M148 112 C205 160 250 250 312 350', w: 11 },
  toRabbit: { d: 'M414 362 C428 362 440 362 452 362', w: 7 },
  toFox: { d: 'M548 338 C592 326 640 326 684 336', w: 4.5 },
  prodToDec: { d: 'M372 404 C420 430 500 452 552 462', w: 3.2 },
  rabbitToDec: { d: 'M528 406 C548 428 566 446 578 458', w: 2.6 },
  foxToDec: { d: 'M712 406 C690 428 664 446 646 458', w: 2.6 },
  heatProd: { d: 'M372 338 C362 318 386 300 376 282 C366 264 390 246 380 226', w: 2 },
  heatRabbit: { d: 'M520 312 C510 292 534 274 524 254 C514 236 538 218 528 198', w: 2 },
  heatFox: { d: 'M776 286 C766 266 790 248 780 228 C770 210 794 192 784 172', w: 2 },
  heatDec: { d: 'M612 440 C606 430 618 421 612 410 C606 399 618 390 612 380', w: 1.6 },
};
// Matter (green): a closed loop through the decomposers and the soil.
const M = {
  toRabbit: { d: 'M414 378 C428 378 440 378 452 378', w: 5 },
  toFox: { d: 'M548 354 C592 344 640 344 684 352', w: 5 },
  prodToDec: { d: 'M390 408 C436 438 512 462 566 474', w: 4 },
  rabbitToDec: { d: 'M544 410 C562 432 580 452 590 468', w: 4 },
  foxToDec: { d: 'M698 410 C678 432 656 452 640 470', w: 4 },
  back: { d: 'M556 492 C470 500 380 500 302 490 C284 486 276 470 276 450 C276 432 282 416 294 404', w: 5 },
};

// A route: the segments a particle follows, in order. Energy routes end in a heat wisp; matter routes close.
const ENERGY_ROUTES = [
  { segs: [E.sun, E.heatProd], n: 5, offset: 0 },
  { segs: [E.sun, E.toRabbit, E.heatRabbit], n: 3, offset: 0.13 },
  { segs: [E.sun, E.toRabbit, E.toFox, E.heatFox], n: 2, offset: 0.29 },
  { segs: [E.sun, E.prodToDec, E.heatDec], n: 2, offset: 0.41 },
  { segs: [E.sun, E.toRabbit, E.rabbitToDec, E.heatDec], n: 1, offset: 0.57 },
  { segs: [E.sun, E.toRabbit, E.toFox, E.foxToDec, E.heatDec], n: 1, offset: 0.71 },
];
const MATTER_ROUTES = [
  { segs: [M.toRabbit, M.toFox, M.foxToDec, M.back], n: 6, offset: 0 },
  { segs: [M.prodToDec, M.back], n: 4, offset: 0.37 },
  { segs: [M.toRabbit, M.rabbitToDec, M.back], n: 3, offset: 0.61 },
];

export const MODES = Object.freeze([
  { id: 'energy', label: 'Energy' },
  { id: 'matter', label: 'Matter' },
  { id: 'both', label: 'Both' },
]);

// ---------- the scenery ----------
function drawSun(g) {
  for (let i = 0; i < 12; i += 1) {
    const [x1, y1] = polar(108, 78, 42, i * 30);
    const [x2, y2] = polar(108, 78, i % 2 ? 50 : 56, i * 30);
    g.append(el('path', { d: `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, stroke: C.gold, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  }
  g.append(el('circle', { cx: 108, cy: 78, r: 32, fill: C.gold }));
  g.append(el('circle', { cx: 108, cy: 78, r: 24, fill: tint(C.gold, 82) }));
}

function drawTree(g) {
  const x = 190;
  g.append(el('path', { d: `M${x - 4} ${GROUND + 2} C${x - 30} ${GROUND + 22} ${x - 60} ${GROUND + 26} ${x - 80} ${GROUND + 46} M${x + 4} ${GROUND + 2} C${x + 26} ${GROUND + 20} ${x + 50} ${GROUND + 30} ${x + 60} ${GROUND + 52} M${x} ${GROUND + 4} C${x - 2} ${GROUND + 24} ${x + 6} ${GROUND + 40} ${x - 4} ${GROUND + 62}`, stroke: soilDark, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('path', { d: `M${x - 9} ${GROUND + 1} C${x - 8} 350 ${x - 11} 300 ${x - 24} 262 L${x + 24} 262 C${x + 11} 300 ${x + 8} 350 ${x + 9} ${GROUND + 1} Z`, fill: soilDark }));
  g.append(el('path', { d: `M${x - 12} 300 C${x - 30} 290 ${x - 50} 280 ${x - 66} 262 M${x + 10} 292 C${x + 30} 286 ${x + 46} 270 ${x + 58} 250`, stroke: soilDark, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }));
  const canopy = [[x, 196, 70], [x - 62, 246, 48], [x + 62, 244, 50], [x - 26, 176, 42], [x + 34, 180, 44]];
  for (const [cx, cy, r] of canopy) g.append(el('circle', { cx, cy, r, fill: tint(C.leaf, 58) }));
  for (const [cx, cy, r] of [[x - 30, 232, 34], [x + 40, 226, 36], [x + 4, 214, 40]]) g.append(el('circle', { cx, cy, r, fill: tint(C.leaf, 72), opacity: 0.85 }));
  g.append(el('circle', { cx: x - 22, cy: 190, r: 22, fill: tint(C.leaf, 40) }));
}

function drawGrass(g) {
  const tufts = [[262, 34], [282, 44], [300, 38], [322, 46], [346, 40], [368, 48], [388, 40], [406, 34]];
  for (const [x, hgt] of tufts) {
    for (const [dx, lean] of [[-7, -14], [-2, -5], [3, 6], [8, 15]]) {
      g.append(el('path', { d: `M${x + dx} ${GROUND + 1} C${x + dx + lean * 0.2} ${GROUND - hgt * 0.5} ${x + dx + lean * 0.7} ${GROUND - hgt * 0.8} ${x + dx + lean} ${GROUND - hgt}`, stroke: C.leaf, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
    }
  }
  g.append(el('path', { d: `M270 ${GROUND + 2} C280 ${GROUND + 14} 300 ${GROUND + 16} 312 ${GROUND + 24} M330 ${GROUND + 2} C336 ${GROUND + 16} 350 ${GROUND + 20} 358 ${GROUND + 30} M392 ${GROUND + 2} C386 ${GROUND + 14} 380 ${GROUND + 22} 372 ${GROUND + 28}`, stroke: soilDark, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }));
}

function drawRabbit(g) {
  const holder = el('g', { transform: `translate(494 ${GROUND})` });
  const edge = 'color-mix(in srgb, var(--ink-soft) 75%, var(--ink))';
  holder.append(el('ellipse', { cx: 34, cy: -3, rx: 20, ry: 7, fill: tint(C.ink, 10), opacity: 0.6 }));
  holder.append(el('circle', { cx: 42, cy: -20, r: 8, fill: C.paper, stroke: edge, 'stroke-width': 1.5 }));
  holder.append(el('path', { d: 'M-36 -6 C-40 -34 -22 -54 6 -54 C30 -54 46 -40 44 -18 C43 -6 34 -2 20 -2 L-26 -2 C-34 -2 -36 -4 -36 -6 Z', fill: fur, stroke: edge, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
  holder.append(el('ellipse', { cx: 20, cy: -16, rx: 17, ry: 12, fill: tint(C.ink, 18), opacity: 0.55 }));
  holder.append(el('ellipse', { cx: -22, cy: -3, rx: 9, ry: 3.5, fill: fur, stroke: edge, 'stroke-width': 1.3 }));
  holder.append(el('path', { d: 'M-36 -60 C-46 -84 -44 -104 -36 -104 C-28 -104 -28 -82 -30 -60 Z', fill: fur, stroke: edge, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  holder.append(el('path', { d: 'M-36 -64 C-42 -84 -40 -98 -36 -98 C-32 -98 -32 -82 -33 -64 Z', fill: tint(C.coral, 30) }));
  holder.append(el('path', { d: 'M-24 -58 C-22 -84 -16 -100 -10 -98 C-4 -96 -12 -76 -18 -58 Z', fill: fur, stroke: edge, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  holder.append(el('circle', { cx: -34, cy: -44, r: 16, fill: fur, stroke: edge, 'stroke-width': 1.6 }));
  holder.append(el('circle', { cx: -40, cy: -47, r: 2.4, fill: C.ink }));
  holder.append(el('circle', { cx: -49, cy: -41, r: 2, fill: coralDark }));
  holder.append(el('path', { d: 'M-49 -39 C-46 -34 -40 -34 -38 -38', stroke: edge, 'stroke-width': 1, fill: 'none' }));
  g.append(holder);
}

function drawFox(g) {
  const holder = el('g', { transform: `translate(732 ${GROUND})` });
  const coat = tint(C.coral, 82);
  const edge = coralDark;
  holder.append(el('ellipse', { cx: 6, cy: -2, rx: 56, ry: 6, fill: tint(C.ink, 10), opacity: 0.55 }));
  holder.append(el('path', { d: 'M46 -36 C64 -60 92 -58 100 -42 C106 -30 96 -14 80 -16 C68 -18 58 -26 48 -30 Z', fill: coat, stroke: edge, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
  holder.append(el('path', { d: 'M84 -18 C90 -22 96 -30 100 -42 C104 -32 100 -18 90 -16 Z', fill: C.paper, stroke: edge, 'stroke-width': 1.2 }));
  for (const [x, w] of [[-24, 7], [-12, 7], [30, 7], [42, 7]]) {
    holder.append(el('path', { d: `M${x} -24 L${x} -2`, stroke: edge, 'stroke-width': w + 2.5, 'stroke-linecap': 'round' }));
    holder.append(el('path', { d: `M${x} -24 L${x} -6`, stroke: coat, 'stroke-width': w, 'stroke-linecap': 'round' }));
  }
  holder.append(el('path', { d: 'M-40 -34 C-30 -54 20 -58 46 -50 C60 -46 60 -30 50 -22 C36 -12 -10 -14 -34 -20 C-44 -22 -46 -28 -40 -34 Z', fill: coat, stroke: edge, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
  holder.append(el('path', { d: 'M-34 -20 C-20 -12 20 -12 44 -24 C36 -12 -10 -12 -34 -20 Z', fill: C.paper, opacity: 0.85 }));
  // ears, then the wedge of the head over them, then the pale cheek, nose and eye
  holder.append(el('path', { d: 'M-58 -50 L-62 -72 L-46 -54 Z M-42 -50 L-44 -73 L-28 -54 Z', fill: coat, stroke: edge, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  holder.append(el('path', { d: 'M-60 -71 L-52 -56 M-43 -71 L-35 -56', stroke: tint(C.coral, 30), 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.9 }));
  holder.append(el('path', { d: 'M-34 -52 C-46 -58 -62 -54 -72 -44 C-78 -38 -84 -32 -88 -30 C-76 -25 -62 -23 -50 -25 C-40 -29 -33 -40 -34 -52 Z', fill: coat, stroke: edge, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
  holder.append(el('path', { d: 'M-88 -30 C-74 -27 -62 -25 -50 -25 C-56 -20 -72 -22 -88 -30 Z', fill: C.paper, opacity: 0.85 }));
  holder.append(el('circle', { cx: -87, cy: -30, r: 2.8, fill: C.ink }));
  holder.append(el('circle', { cx: -62, cy: -42, r: 2.5, fill: C.ink }));
  g.append(holder);
}

function drawDecomposers(g) {
  const mushrooms = [[586, 456, 15, 20], [606, 452, 11, 15], [624, 460, 8, 12]];
  for (const [x, y, r, hgt] of mushrooms) {
    g.append(el('rect', { x: x - r * 0.28, y: y - 2, width: r * 0.56, height: hgt, rx: r * 0.28, fill: tint(C.ink, 8), stroke: C.soft, 'stroke-width': 1.1 }));
    g.append(el('path', { d: `M${x - r} ${y} C${x - r} ${y - r * 0.95} ${x + r} ${y - r * 0.95} ${x + r} ${y} Z`, fill: tint(C.gold, 58), stroke: goldDark, 'stroke-width': 1.3 }));
    g.append(el('path', { d: `M${x - r + 2} ${y} L${x + r - 2} ${y}`, stroke: goldDark, 'stroke-width': 1, opacity: 0.6 }));
  }
  // mycelium threads through the soil
  g.append(el('path', { d: 'M586 476 C580 490 566 496 552 508 M586 476 C596 492 606 500 604 516 M606 468 C618 484 634 488 646 502 M624 472 C628 486 640 494 656 496', stroke: C.paper, 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 }));
  // bacteria: rods and cocci
  for (const [x, y, rot] of [[664, 468, -20], [682, 484, 30], [652, 500, 10], [700, 470, -35], [716, 492, 15]]) {
    g.append(el('rect', { x: x - 7, y: y - 2.6, width: 14, height: 5.2, rx: 2.6, fill: tint(C.water, 40), stroke: C.water, 'stroke-width': 1, transform: `rotate(${rot} ${x} ${y})` }));
  }
  for (const [x, y] of [[672, 504], [690, 508], [706, 480], [640, 486], [726, 476]]) {
    g.append(el('circle', { cx: x, cy: y, r: 2.6, fill: tint(C.water, 40), stroke: C.water, 'stroke-width': 1 }));
  }
}

function drawPond(g) {
  g.append(el('ellipse', { cx: 900, cy: GROUND + 1, rx: 86, ry: 13, fill: tint(C.water, 28), stroke: tint(C.water, 55), 'stroke-width': 1.2 }));
  g.append(el('path', { d: 'M850 400 C870 396 890 396 910 400 M870 406 C890 404 910 404 930 406', stroke: tint(C.water, 60), 'stroke-width': 1, fill: 'none', opacity: 0.8 }));
  for (const [x, y, r] of [[822, 396, 4], [830, 402, 3], [836, 396, 2.6], [972, 398, 3.6], [980, 404, 2.8], [964, 404, 2.4], [844, 405, 2]]) {
    g.append(el('circle', { cx: x, cy: y, r, fill: tint(C.leaf, 55), stroke: C.leaf, 'stroke-width': 0.9 }));
  }
  for (const [x, hgt] of [[948, 62], [958, 54], [940, 44]]) {
    g.append(el('path', { d: `M${x} ${GROUND} L${x} ${GROUND - hgt}`, stroke: C.leaf, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    g.append(el('rect', { x: x - 3, y: GROUND - hgt - 2, width: 6, height: 18, rx: 3, fill: soilDark }));
  }
}

const CSS = `
.tb-energy { position: absolute; inset: 0; font-family: var(--font-ui); }
.tb-energy svg { user-select: none; -webkit-user-select: none; }
.tb-energy svg text { font-family: var(--font-ui); fill: var(--ink); }
.tb-energy .en-kicker { font-size: 10.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; fill: var(--ink-soft); }
.tb-energy .en-name { font-size: 12px; fill: var(--ink); }
.tb-energy .en-heat { font-size: 11px; font-weight: 500; fill: var(--gold); }
.tb-energy .en-pct { font-size: 10.5px; font-weight: 600; fill: var(--gold); }
.tb-energy .en-legend { font-size: 11.5px; fill: var(--ink-soft); }
.tb-energy .en-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3.5px; stroke-linejoin: round; }
.tb-energy .en-flow { transition: opacity var(--dur) var(--ease); }
.tb-energy.is-cut .en-flow { transition: none; }
.tb-energy.mode-energy .en-matter { opacity: 0.16; }
.tb-energy.mode-matter .en-energy { opacity: 0.16; }
@container (max-width: 640px) {
  .tb-energy .fig-toolbar { top: var(--space-2); bottom: auto; left: 18%; right: 18%; justify-content: center; flex-wrap: nowrap; }
  .tb-energy .fig-btn { padding: 0.2rem 0.5rem; font-size: 0.62rem; }
}
`;

export function mount(root, ctx) {
  const ns = uid('en');
  const reduced = Boolean(ctx.reducedMotion);
  const wrap = h('div', { class: 'tb-energy mode-both' });
  if (reduced || ctx.pinnedTime !== null) wrap.classList.add('is-cut');
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', { class: 'tb-fill', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
  wrap.append(svg);

  // Arrowheads in three sizes per colour, sized in user units so a thin arrow keeps a readable head.
  const defs = el('defs');
  const heads = {};
  for (const [name, colour] of [['gold', C.gold], ['leaf', C.leaf]]) {
    for (const [size, px] of [['l', 18], ['m', 13], ['s', 10]]) {
      const id = `${ns}-${name}-${size}`;
      const m = el('marker', { id, viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerWidth: px, markerHeight: px, orient: 'auto', markerUnits: 'userSpaceOnUse' });
      m.append(el('path', { d: 'M0 0.8 L10 5 L0 9.2 Z', fill: colour }));
      defs.append(m);
      heads[`${name}-${size}`] = `url(#${id})`;
    }
  }
  svg.append(defs);
  const headFor = (name, w) => heads[`${name}-${w >= 7 ? 'l' : w >= 4 ? 'm' : 's'}`];

  // ----- scenery -----
  const scene = el('g');
  scene.append(el('rect', { x: 0, y: GROUND, width: W, height: H - GROUND, fill: soil }));
  scene.append(el('path', { d: `M0 ${GROUND} L${W} ${GROUND}`, stroke: C.ruleStrong, 'stroke-width': 1.5 }));
  drawSun(scene);
  drawTree(scene);
  drawGrass(scene);
  drawPond(scene);
  drawRabbit(scene);
  drawFox(scene);
  drawDecomposers(scene);
  svg.append(scene);

  // ----- labels -----
  const labels = el('g');
  const role = (x, y, kicker, name, anchor = 'middle') => {
    labels.append(text(x, y, kicker, { anchor, class: 'en-kicker en-halo' }));
    labels.append(text(x, y + 15, name, { anchor, class: 'en-name en-halo' }));
  };
  role(334, 430, 'Producers', 'grass, tree, algae');
  role(482, 430, 'Primary consumer', 'rabbit');
  role(772, 430, 'Secondary consumer', 'fox');
  role(640, 528, 'Decomposers', 'fungi and bacteria in the soil');
  labels.append(text(108, 140, 'sunlight', { anchor: 'middle', class: 'en-name en-halo' }));
  labels.append(text(900, 384, 'algae', { anchor: 'middle', class: 'en-name en-halo' }));
  svg.append(labels);

  // ----- flows -----
  const energyG = el('g', { class: 'en-flow en-energy' });
  const matterG = el('g', { class: 'en-flow en-matter' });
  const arrow = (g, seg, colour, name, { dashed = false, head = true } = {}) => {
    const attrs = { d: seg.d, stroke: colour, 'stroke-width': seg.w, fill: 'none', 'stroke-linecap': 'round' };
    if (head) attrs['marker-end'] = headFor(name, seg.w);
    if (dashed) attrs['stroke-dasharray'] = '5 6';
    g.append(el('path', attrs));
  };
  for (const key of ['sun', 'toRabbit', 'toFox', 'prodToDec', 'rabbitToDec', 'foxToDec']) arrow(energyG, E[key], C.gold, 'gold');
  for (const key of ['heatProd', 'heatRabbit', 'heatFox', 'heatDec']) {
    // A wisp: three strokes thinning and fading upward.
    const seg = E[key];
    energyG.append(el('path', { d: seg.d, stroke: C.gold, 'stroke-width': seg.w, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85, 'stroke-dasharray': '30 200', 'stroke-dashoffset': 0 }));
    energyG.append(el('path', { d: seg.d, stroke: C.gold, 'stroke-width': seg.w * 0.75, fill: 'none', 'stroke-linecap': 'round', opacity: 0.55, 'stroke-dasharray': '32 200', 'stroke-dashoffset': -30 }));
    energyG.append(el('path', { d: seg.d, stroke: C.gold, 'stroke-width': seg.w * 0.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.3, 'stroke-dasharray': '60 200', 'stroke-dashoffset': -62 }));
  }
  for (const [x, y] of [[386, 216], [534, 188], [790, 162], [624, 372]]) energyG.append(text(x, y, 'heat', { anchor: 'middle', class: 'en-heat en-halo' }));
  energyG.append(text(433, 350, '≈ 1/10', { anchor: 'middle', class: 'en-pct en-halo' }));
  energyG.append(text(616, 318, '≈ 1/10', { anchor: 'middle', class: 'en-pct en-halo' }));
  for (const key of ['toRabbit', 'toFox', 'prodToDec', 'rabbitToDec', 'foxToDec', 'back']) arrow(matterG, M[key], C.leaf, 'leaf');
  matterG.append(text(430, 517, 'carbon and nutrients return through the soil', { anchor: 'middle', class: 'en-name en-halo', fill: leafDark }));
  svg.append(matterG, energyG);

  // Under reduced motion the routes carry static flow marks instead of moving particles.
  if (reduced) {
    for (const [g, table] of [[energyG, E], [matterG, M]]) {
      for (const seg of Object.values(table)) {
        if (seg.w < 2.5) continue;
        g.append(el('path', { d: seg.d, stroke: C.paper, 'stroke-width': Math.max(1.2, seg.w * 0.35), fill: 'none', 'stroke-dasharray': '2.5 9', 'stroke-linecap': 'round', opacity: 0.9 }));
      }
    }
  }

  // ----- legend -----
  const legend = el('g');
  legend.append(el('path', { d: 'M842 34 L874 34', stroke: C.gold, 'stroke-width': 5, 'stroke-linecap': 'round', 'marker-end': heads['gold-s'] }));
  legend.append(text(886, 38, 'energy, one way', { class: 'en-legend' }));
  legend.append(el('path', { d: 'M842 56 L874 56', stroke: C.leaf, 'stroke-width': 5, 'stroke-linecap': 'round', 'marker-end': heads['leaf-s'] }));
  legend.append(text(886, 60, 'matter, in a cycle', { class: 'en-legend' }));
  svg.append(legend);

  // ----- particles: each route is one hidden path whose length is measured once -----
  const routeLayer = el('g', { fill: 'none', stroke: 'none' });
  svg.append(routeLayer);
  const particlesE = el('g', { class: 'en-flow en-energy' });
  const particlesM = el('g', { class: 'en-flow en-matter' });
  svg.append(particlesM, particlesE);

  function buildRoutes(defsList, layer, colour, heat) {
    const out = [];
    for (const r of defsList) {
      const path = el('path', { d: r.segs.map((s) => s.d).join(' ') });
      routeLayer.append(path);
      const length = path.getTotalLength();
      // Where the last segment (the heat wisp) begins along the route.
      let lastStart = 0;
      if (heat) {
        const before = el('path', { d: r.segs.slice(0, -1).map((s) => s.d).join(' ') });
        routeLayer.append(before);
        lastStart = before.getTotalLength();
        before.remove();
      }
      const dots = [];
      for (let i = 0; i < r.n; i += 1) {
        const halo = el('circle', { r: 6, fill: colour, opacity: 0.22 });
        const core = el('circle', { r: 3.2, fill: C.paper, stroke: colour, 'stroke-width': 1.6 });
        layer.append(halo, core);
        dots.push({ halo, core, phase: (i / r.n + r.offset) % 1 });
      }
      out.push({ path, length, lastStart, dots });
    }
    return out;
  }
  const energyRoutes = reduced ? [] : buildRoutes(ENERGY_ROUTES, particlesE, C.gold, true);
  const matterRoutes = reduced ? [] : buildRoutes(MATTER_ROUTES, particlesM, C.leaf, false);

  let t = ctx.pinnedTime ?? 0;
  let mode = 'both';
  let visibleE = 0;
  let visibleM = 0;

  function place(route, dot, s, heat) {
    const p = route.path.getPointAtLength(s);
    let alpha = 1;
    let scale = 1;
    if (heat) {
      const tail = route.length - route.lastStart;
      const into = (s - route.lastStart) / tail;
      if (into > 0) {
        const k = Math.min(1, into / (1 - HEAT_FADE + 0.0001));
        alpha = Math.max(0, 1 - k ** 1.6);
        scale = 1 - 0.5 * k;
      }
    }
    for (const c of [dot.halo, dot.core]) {
      c.setAttribute('cx', p.x.toFixed(1));
      c.setAttribute('cy', p.y.toFixed(1));
    }
    dot.core.setAttribute('r', (3.2 * scale).toFixed(2));
    dot.halo.setAttribute('r', (6 * scale).toFixed(2));
    dot.core.setAttribute('opacity', alpha.toFixed(3));
    dot.halo.setAttribute('opacity', (0.22 * alpha).toFixed(3));
    return alpha > 0.02;
  }

  function draw() {
    visibleE = 0;
    visibleM = 0;
    for (const route of energyRoutes) {
      for (const dot of route.dots) {
        const s = ((t * SPEED) / route.length + dot.phase) % 1 * route.length;
        if (place(route, dot, s, true)) visibleE += 1;
      }
    }
    for (const route of matterRoutes) {
      for (const dot of route.dots) {
        const s = ((t * SPEED) / route.length + dot.phase) % 1 * route.length;
        if (place(route, dot, s, false)) visibleM += 1;
      }
    }
  }

  // ----- clock -----
  let raf = 0;
  let last = 0;
  let visible = true;
  let destroyed = false;
  const playing = () => !reduced && ctx.pinnedTime === null && !pinned;
  let pinned = false;
  function frame(now) {
    raf = 0;
    if (destroyed || !playing() || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (raf || destroyed || !playing() || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // ----- toolbar -----
  const buttons = MODES.map((m) => h('button', { class: 'fig-btn', type: 'button', 'aria-pressed': String(m.id === mode), 'data-mode': m.id, text: m.label }));
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, buttons);
  wrap.append(toolbar);
  function setMode(next) {
    mode = next;
    wrap.classList.remove('mode-energy', 'mode-matter', 'mode-both');
    wrap.classList.add(`mode-${mode}`);
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
  }
  const onMode = (e) => setMode(e.currentTarget.dataset.mode);
  for (const b of buttons) b.addEventListener('click', onMode);

  draw();
  root.append(wrap);
  schedule();

  let readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(readyRaf);
      stop();
      for (const b of buttons) b.removeEventListener('click', onMode);
      root.replaceChildren();
    },
    setTime(seconds) {
      pinned = true;
      stop();
      wrap.classList.add('is-cut');
      t = Math.max(0, Number(seconds) || 0);
      draw();
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else stop();
    },
    setTheme() {},
    describe() {
      const counts = { energy: mode === 'matter' ? 0 : visibleE, matter: mode === 'energy' ? 0 : visibleM };
      return { mode, energyParticles: counts.energy, matterParticles: counts.matter };
    },
  };
}
