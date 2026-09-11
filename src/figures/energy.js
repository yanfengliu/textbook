// Energy flows, matter cycles. Two drawings of one idea, chosen by the stage's own width.
//
// Wide (stage >= 720 px): a landscape — the sun, a tree and grass (producers), a rabbit (primary
// consumer), a fox (secondary consumer), and fungi and bacteria in the soil (decomposers). Gold
// arrows carry energy one way and thin at every step, a wisp labelled "heat" leaves upward at each
// transfer, and green arrows carry carbon and nutrients round a closed loop through the decomposers
// and the soil back to the producers.
//
// Narrow (stage < 720 px): the same story as one left-to-right chain — sunlight, grass, rabbit, fox,
// fungi — with the gold line and its heat wisps above and the green return loop underneath. Its
// viewBox tracks the stage's width in CSS pixels, so a label authored at 12 px renders at about
// 12 device pixels at every width it covers, instead of shrinking with the drawing.
//
// A ResizeObserver on the figure's own root picks the layout and rebuilds the SVG when it changes;
// the emphasis mode survives the switch. Gold particles ride the energy routes and fade out as heat,
// green particles loop forever, and every particle position is a pure function of the clock, so
// setTime(t) shows the same frame anywhere. Under reduced motion the routes carry static flow marks
// instead. Toolbar: Energy, Matter, Both. describe() -> { mode, energyParticles, matterParticles,
// layout }.
import { el, h, text, C, tint, uid, polar, clamp } from './lib/svg.js';

export const meta = { kind: 'energy', title: 'Energy flows, matter cycles', needsWebGL: false, aspect: 16 / 9 };

const W = 1000;
const H = 562.5;
const GROUND = 402;
const SPEED = 62; // particle speed, viewBox units per second
const HEAT_FADE = 0.35; // energy particles fade over this fraction of their route's last segment

// Below this stage width the wide landscape's own labels fall under about 9 device pixels, so the
// narrow chain takes over instead. A little hysteresis keeps a stage hovering on the line from
// rebuilding on every frame of a drag.
const NARROW_MAX = 720;
const HYSTERESIS = 16;

const leafDark = 'color-mix(in srgb, var(--leaf) 82%, var(--ink))';
const goldDark = 'color-mix(in srgb, var(--gold) 72%, var(--ink))';
const goldText = 'color-mix(in srgb, var(--gold) 62%, var(--ink))'; // --gold is a figure colour; at label
const coralDark = 'color-mix(in srgb, var(--coral) 72%, var(--ink))'; // sizes it needs the ink in it
const soil = 'var(--paper-3)';
const soilDark = 'color-mix(in srgb, var(--ink-soft) 30%, var(--paper-3))';
const fur = 'color-mix(in srgb, var(--ink-soft) 34%, var(--paper))';

// ---------- the wide arrows: every segment is one path with an absolute start, so routes chain them ----------
// Energy (gold): one way, thinning. The six routes to the decomposers stay in the lane just under the
// ground line until they are past the trophic labels, then dive, so nothing crosses a word.
const E = {
  sun: { d: 'M148 112 C205 160 250 250 312 350', w: 10 },
  toRabbit: { d: 'M414 362 C428 362 440 362 452 362', w: 7 },
  toFox: { d: 'M548 338 C592 326 640 326 684 336', w: 4.5 },
  prodToDec: { d: 'M372 405 C430 409 488 413 532 421 C548 425 558 432 562 441', w: 3.2 },
  rabbitToDec: { d: 'M528 406 C548 411 566 418 578 427 C586 432 590 436 592 440', w: 2.6 },
  foxToDec: { d: 'M712 406 C700 412 688 420 676 428 C664 436 654 441 648 445', w: 2.6 },
  heatProd: { d: 'M372 338 C362 318 386 300 376 282 C366 264 390 246 380 226', w: 2 },
  heatRabbit: { d: 'M520 312 C510 292 534 274 524 254 C514 236 538 218 528 198', w: 2 },
  heatFox: { d: 'M776 286 C766 266 790 248 780 228 C770 210 794 192 784 172', w: 2 },
  heatDec: { d: 'M600 436 C594 426 606 417 600 406 C594 395 606 386 600 376', w: 1.6 },
};
// Matter (green): a closed loop through the decomposers and the soil. The return runs wide of the
// producers' label and climbs into the grass past the tree.
const M = {
  toRabbit: { d: 'M414 378 C428 378 440 378 452 378', w: 5 },
  toFox: { d: 'M548 354 C592 344 640 344 684 352', w: 5 },
  prodToDec: { d: 'M390 410 C436 416 482 424 518 438 C534 444 548 458 554 472', w: 4 },
  rabbitToDec: { d: 'M544 410 C564 419 582 432 592 446 C598 455 602 464 604 474', w: 4 },
  foxToDec: { d: 'M700 410 C688 419 676 430 666 442 C658 452 652 462 648 472', w: 4 },
  back: { d: 'M568 488 C486 498 386 500 306 490 C260 484 212 476 210 448 C208 427 222 412 242 404', w: 5 },
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

// ---------- the wide scenery ----------
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

// ---------- the narrow chain ----------
// Each glyph is authored in its own box, in units where 34 is the icon height at the phone, and
// placed with an explicit scale rather than an SVG transform, so a stroke never thins below about
// one device pixel however small the stage is. {x,y} is read as an offset from the station's
// ground point, multiplied by the art scale.
const at = (cx, gy, s) => (spec) => spec.replace(/\{(-?[\d.]+),(-?[\d.]+)\}/g, (_, x, y) => `${(cx + Number(x) * s).toFixed(1)} ${(gy + Number(y) * s).toFixed(1)}`);
const sw = (base, s) => Math.max(1.1, base * s);

// left and right are how far the glyph reaches either side of its station, in the units its own
// drawing is authored in: they set the gaps the arrows run through, so a fox's brush and snout never
// reach into the next station. `unit` is the icon height the glyph is drawn at, as a fraction of the
// row's icon height — a fox stands lower than a rabbit with its ears up.
const NARROW_STATIONS = [
  { id: 'grass', name: 'grass', role: ['producer'], left: 22, right: 22, unit: 1 },
  { id: 'rabbit', name: 'rabbit', role: ['primary', 'consumer'], left: 16.5, right: 16.5, unit: 1 },
  { id: 'fox', name: 'fox', role: ['secondary', 'consumer'], left: 30, right: 26, unit: 1 },
  { id: 'fungi', name: 'fungi', role: ['decomposers'], left: 17, right: 15, unit: 36 / 32 },
];

function nSun(g, cx, cy, r) {
  for (let i = 0; i < 10; i += 1) {
    const [x1, y1] = polar(cx, cy, r * 1.3, i * 36);
    const [x2, y2] = polar(cx, cy, r * (i % 2 ? 1.6 : 1.85), i * 36);
    g.append(el('path', { d: `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, stroke: C.gold, 'stroke-width': Math.max(1.4, r * 0.19), 'stroke-linecap': 'round' }));
  }
  g.append(el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: r.toFixed(1), fill: C.gold }));
  g.append(el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (r * 0.7).toFixed(1), fill: tint(C.gold, 82) }));
}

function nGrass(g, cx, gy, s) {
  const p = at(cx, gy, s);
  for (const [dx, lean, k] of [[-10, -12, 0.62], [-7, -6, 0.86], [-3, -2, 0.7], [0, 2, 1], [4, 5, 0.78], [7, 8, 0.92], [10, 12, 0.6]]) {
    const t = -32 * k;
    g.append(el('path', { d: p(`M{${dx},0} C{${dx + lean * 0.2},${t * 0.5}} {${dx + lean * 0.7},${t * 0.8}} {${dx + lean},${t}}`), stroke: C.leaf, 'stroke-width': sw(1.9, s), fill: 'none', 'stroke-linecap': 'round' }));
  }
  // two seed heads, so the tuft reads as a plant and not as a scribble
  for (const [dx, dy] of [[-8, -24], [9.5, -26]]) {
    g.append(el('ellipse', { cx: (cx + dx * s).toFixed(1), cy: (gy + dy * s).toFixed(1), rx: (1.8 * s).toFixed(1), ry: (3.8 * s).toFixed(1), fill: tint(C.leaf, 55), stroke: C.leaf, 'stroke-width': sw(0.9, s) }));
  }
}

function nRabbit(g, cx, gy, s) {
  const p = at(cx, gy, s);
  const edge = 'color-mix(in srgb, var(--ink-soft) 75%, var(--ink))';
  g.append(el('ellipse', { cx: (cx + 2 * s).toFixed(1), cy: (gy - 0.5 * s).toFixed(1), rx: (13 * s).toFixed(1), ry: (2.2 * s).toFixed(1), fill: tint(C.ink, 10), opacity: 0.55 }));
  // tail, body, haunch
  g.append(el('circle', { cx: (cx + 12 * s).toFixed(1), cy: (gy - 6.5 * s).toFixed(1), r: (3.4 * s).toFixed(1), fill: C.paper, stroke: edge, 'stroke-width': sw(1.2, s) }));
  g.append(el('path', { d: p('M{12,-1} C{15.5,-11} {10,-19} {0,-18.5} C{-8,-18} {-12,-11} {-10.5,-4} C{-10,-1.4} {-8,-1} {-4,-1} Z'), fill: fur, stroke: edge, 'stroke-width': sw(1.3, s), 'stroke-linejoin': 'round' }));
  g.append(el('ellipse', { cx: (cx + 4 * s).toFixed(1), cy: (gy - 8 * s).toFixed(1), rx: (6 * s).toFixed(1), ry: (4.6 * s).toFixed(1), fill: tint(C.ink, 16), opacity: 0.5 }));
  // ears behind the head
  g.append(el('path', { d: p('M{-13.5,-24} C{-16.5,-31.5} {-15.5,-35} {-12.8,-35} C{-10.4,-35} {-11,-29.5} {-11.6,-24} Z'), fill: fur, stroke: edge, 'stroke-width': sw(1.2, s), 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: p('M{-8.6,-24} C{-9.6,-30.4} {-7.4,-34} {-5.4,-33.4} C{-3.7,-32.9} {-6,-28.6} {-7.2,-24} Z'), fill: fur, stroke: edge, 'stroke-width': sw(1.2, s), 'stroke-linejoin': 'round' }));
  g.append(el('circle', { cx: (cx - 10.5 * s).toFixed(1), cy: (gy - 20 * s).toFixed(1), r: (5.8 * s).toFixed(1), fill: fur, stroke: edge, 'stroke-width': sw(1.3, s) }));
  g.append(el('circle', { cx: (cx - 12.6 * s).toFixed(1), cy: (gy - 21.4 * s).toFixed(1), r: Math.max(0.9, 1.5 * s).toFixed(1), fill: C.ink }));
  g.append(el('circle', { cx: (cx - 15.8 * s).toFixed(1), cy: (gy - 18.6 * s).toFixed(1), r: Math.max(0.7, 1.2 * s).toFixed(1), fill: coralDark }));
}

function nFox(g, cx, gy, s) {
  const p = at(cx, gy, s);
  const coat = tint(C.coral, 82);
  const edge = coralDark;
  g.append(el('ellipse', { cx: (cx + 2 * s).toFixed(1), cy: (gy - 0.5 * s).toFixed(1), rx: (19 * s).toFixed(1), ry: (2.2 * s).toFixed(1), fill: tint(C.ink, 10), opacity: 0.55 }));
  // brush, curling up behind
  g.append(el('path', { d: p('M{11,-12} C{18,-21} {26,-18} {24,-10} C{22.5,-3.8} {16,-3.2} {12,-7} Z'), fill: coat, stroke: edge, 'stroke-width': sw(1.3, s), 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: p('M{20,-4} C{23.5,-6} {25,-11} {24,-15} C{26.5,-10.5} {24.5,-3.4} {20,-3} Z'), fill: C.paper, stroke: edge, 'stroke-width': sw(0.9, s) }));
  for (const dx of [-9, -3, 9, 14]) {
    g.append(el('path', { d: p(`M{${dx},-9} L{${dx},-0.6}`), stroke: edge, 'stroke-width': sw(3.6, s), 'stroke-linecap': 'round' }));
    g.append(el('path', { d: p(`M{${dx},-9} L{${dx},-2.4}`), stroke: coat, 'stroke-width': sw(2.4, s), 'stroke-linecap': 'round' }));
  }
  g.append(el('path', { d: p('M{-13,-16} C{-6,-21} {10,-21} {16,-16} C{20,-13} {17,-6} {9,-5} L{-9,-5} C{-16,-6} {-17,-13} {-13,-16} Z'), fill: coat, stroke: edge, 'stroke-width': sw(1.3, s), 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: p('M{-11,-6} C{-2,-3.4} {8,-3.6} {15,-8} C{15,-4.6} {8,-4.6} {-9,-5} Z'), fill: C.paper, opacity: 0.8 }));
  // ears, head wedge over them, pale cheek, nose and eye
  g.append(el('path', { d: p('M{-19,-18} L{-21,-27} L{-13.5,-19.5} Z M{-12,-19} L{-13,-27.5} L{-6,-20} Z'), fill: coat, stroke: edge, 'stroke-width': sw(1.1, s), 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: p('M{-11,-19.5} C{-16,-22} {-21,-20} {-24.5,-16} C{-26.5,-13.6} {-28,-11.6} {-29.6,-10.8} C{-25,-8.6} {-20.5,-7.8} {-16,-8.8} C{-12,-10.4} {-10.6,-15} {-11,-19.5} Z'), fill: coat, stroke: edge, 'stroke-width': sw(1.3, s), 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: p('M{-29.6,-10.8} C{-25,-9.6} {-21,-8.8} {-16,-8.8} C{-19,-6.6} {-24,-7.6} {-29.6,-10.8} Z'), fill: C.paper, opacity: 0.85 }));
  g.append(el('circle', { cx: (cx - 29.1 * s).toFixed(1), cy: (gy - 10.8 * s).toFixed(1), r: Math.max(0.9, 1.6 * s).toFixed(1), fill: C.ink }));
  g.append(el('circle', { cx: (cx - 22 * s).toFixed(1), cy: (gy - 15.6 * s).toFixed(1), r: Math.max(0.8, 1.4 * s).toFixed(1), fill: C.ink }));
}

function nFungi(g, cx, gy, s) {
  const p = at(cx, gy, s);
  for (const [dx, dy, r, stem] of [[-7, -14, 7, 14], [3, -18, 5.5, 18], [11, -11, 4, 11]]) {
    g.append(el('rect', {
      x: (cx + (dx - r * 0.3) * s).toFixed(1), y: (gy + (dy - 1) * s).toFixed(1),
      width: (r * 0.6 * s).toFixed(1), height: (stem * s).toFixed(1), rx: (r * 0.3 * s).toFixed(1),
      fill: tint(C.ink, 8), stroke: C.soft, 'stroke-width': sw(0.9, s),
    }));
    g.append(el('path', { d: p(`M{${dx - r},${dy}} C{${dx - r},${dy - r}} {${dx + r},${dy - r}} {${dx + r},${dy}} Z`), fill: tint(C.gold, 58), stroke: goldDark, 'stroke-width': sw(1.1, s) }));
  }
  // mycelium and bacteria, below the ground line
  g.append(el('path', { d: p('M{-7,1} C{-10,6} {-13,7} {-15,11} M{-7,1} C{-4,7} {-2,9} {-3,14} M{3,1} C{5,6} {8,8} {9,12}'), stroke: C.paper, 'stroke-width': sw(1.1, s), fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 }));
  for (const [dx, dy, rot] of [[-11, 6, -20], [-4, 13, 25], [4, 8, 8]]) {
    g.append(el('rect', {
      x: (cx + (dx - 4.5) * s).toFixed(1), y: (gy + (dy - 1.7) * s).toFixed(1),
      width: (9 * s).toFixed(1), height: (3.4 * s).toFixed(1), rx: (1.7 * s).toFixed(1),
      fill: tint(C.water, 40), stroke: C.water, 'stroke-width': sw(0.8, s),
      transform: `rotate(${rot} ${(cx + dx * s).toFixed(1)} ${(gy + dy * s).toFixed(1)})`,
    }));
  }
}

// Geometry of the narrow chain for a viewBox of VW x VH units. The drawing is sized from the icon
// row and then centred in what the toolbar leaves, so a tall stage grows the sky rather than opening
// a gap under the words.
function narrowGeo(VW, VH) {
  const bar = 34; // the band the toolbar sits in, in units (a narrow unit is about a device pixel)
  const S = clamp(VW / 344, 0.85, 2.2); // art scale: the drawing grows with the box, the text does not
  const room = VH - bar;
  const F = clamp(room / 166, 1, 1.6); // row spacing grows a little, the text does not
  const below = 68 * F;
  const iconH = clamp(34 * S, 26, room * 0.40);
  const wispLen = clamp(1.1 * iconH, 24, room * 0.28);
  const head = 15; // the gold annotation row: "sunlight" and one "heat" per station
  // a little below centre: the words sit nearer the toolbar than the sky sits above the sun
  const top = clamp((room - (head + wispLen + iconH + below)) * 0.6, 4, 90);
  const gy = top + head + wispLen + iconH;

  // the left margin is wider than the right: the sun and its word live in it
  const padL = 30 * Math.min(S, 1.5);
  const padR = 16 * Math.min(S, 1.5);
  const step = (VW - padL - padR) / NARROW_STATIONS.length;
  const xs = NARROW_STATIONS.map((_, i) => padL + step * (i + 0.5));
  const scales = NARROW_STATIONS.map((st) => (iconH / 36) * st.unit);
  const lefts = NARROW_STATIONS.map((st, i) => st.left * scales[i]);
  const rights = NARROW_STATIONS.map((st, i) => st.right * scales[i]);

  const iconTop = gy - iconH;
  const wispTop = iconTop - wispLen;

  const goldY = iconTop + iconH * 0.40;
  const greenY = iconTop + iconH * 0.78;
  const rows = { loopTop: gy + 4 * F, caption: gy + 15 * F, loopRun: gy + 27 * F, name: gy + 42 * F, role: gy + 53 * F, role2: gy + 62 * F };

  // one gold hop per gap, thinning; matter runs the same gaps the other way round the loop
  const gap = (i, y, w) => {
    const x1 = xs[i] + rights[i] + 3 * S;
    const x2 = xs[i + 1] - lefts[i + 1] - 3 * S;
    const dx = x2 - x1;
    return { d: `M${x1.toFixed(1)} ${y.toFixed(1)} C${(x1 + dx * 0.35).toFixed(1)} ${y.toFixed(1)} ${(x1 + dx * 0.65).toFixed(1)} ${y.toFixed(1)} ${x2.toFixed(1)} ${y.toFixed(1)}`, w };
  };
  // the sun sits above and left of the producers, out of the row, with its word in the gold row
  const sunR = clamp(iconH * 0.28, 7, wispLen * 0.27);
  const sunCx = 6 + sunR * 1.9;
  const sunCy = wispTop + wispLen * 0.46;
  const rayFrom = [sunCx + sunR * 1.15, sunCy + sunR * 1.0];
  const rayTo = [xs[0] - lefts[0] * 0.25, iconTop + iconH * 0.2];
  const wisp = (i) => {
    const x = xs[i] + rights[i] * 0.5;
    const a = iconTop - 1;
    const b = wispTop;
    const m1 = a - (a - b) * 0.34;
    const m2 = a - (a - b) * 0.68;
    const k = Math.max(4, (a - b) * 0.13);
    return {
      d: `M${x.toFixed(1)} ${a.toFixed(1)} C${(x - k).toFixed(1)} ${((a + m1) / 2).toFixed(1)} ${(x + k).toFixed(1)} ${((a + m1) / 2).toFixed(1)} ${x.toFixed(1)} ${m1.toFixed(1)} C${(x - k).toFixed(1)} ${((m1 + m2) / 2).toFixed(1)} ${(x + k).toFixed(1)} ${((m1 + m2) / 2).toFixed(1)} ${x.toFixed(1)} ${m2.toFixed(1)} C${(x - k).toFixed(1)} ${((m2 + b) / 2).toFixed(1)} ${(x + k).toFixed(1)} ${((m2 + b) / 2).toFixed(1)} ${x.toFixed(1)} ${b.toFixed(1)}`,
      w: Math.max(1.2, 1.9 * S),
      x,
    };
  };

  const gw = [7, 4.6, 3, 2.1].map((w) => Math.max(1.6, w * Math.min(S, 1.7)));
  const mw = Math.max(2.1, 2.9 * Math.min(S, 1.7));
  const eg = {
    sun: { d: `M${rayFrom[0].toFixed(1)} ${rayFrom[1].toFixed(1)} C${(rayFrom[0] + (rayTo[0] - rayFrom[0]) * 0.5).toFixed(1)} ${(rayFrom[1] + (rayTo[1] - rayFrom[1]) * 0.3).toFixed(1)} ${(rayTo[0] - (rayTo[0] - rayFrom[0]) * 0.2).toFixed(1)} ${(rayTo[1] - (rayTo[1] - rayFrom[1]) * 0.4).toFixed(1)} ${rayTo[0].toFixed(1)} ${rayTo[1].toFixed(1)}`, w: gw[0] },
    g1: gap(0, goldY, gw[1]),
    g2: gap(1, goldY, gw[2]),
    g3: gap(2, goldY, gw[3]),
  };
  const wisps = [wisp(0), wisp(1), wisp(2), wisp(3)];
  const mg = { m1: gap(0, greenY, mw), m2: gap(1, greenY, mw), m3: gap(2, greenY, mw) };

  // the return: out of the fungi, under the chain, back up into the grass
  const xA = xs[3] + rights[3] * 0.2;
  const xB = xs[0] - lefts[0] * 0.45;
  const run = rows.loopRun;
  const t0 = rows.loopTop;
  const bulge = clamp(22 * S, 18, 34);
  mg.back = {
    d: `M${xA.toFixed(1)} ${t0.toFixed(1)} C${(xA + bulge * 0.55).toFixed(1)} ${(t0 + (run - t0) * 0.4).toFixed(1)} ${(xA + bulge * 0.35).toFixed(1)} ${run.toFixed(1)} ${(xA - bulge * 1.1).toFixed(1)} ${run.toFixed(1)} L${(xB + bulge * 1.1).toFixed(1)} ${run.toFixed(1)} C${(xB - bulge * 0.35).toFixed(1)} ${run.toFixed(1)} ${(xB - bulge * 0.55).toFixed(1)} ${(t0 + (run - t0) * 0.4).toFixed(1)} ${xB.toFixed(1)} ${t0.toFixed(1)}`,
    w: mw + 0.6,
  };

  return { top, bar, S, F, gy, xs, scales, lefts, rights, iconH, iconTop, wispTop, goldY, greenY, rows, eg, mg, wisps, sunR, sunCx, sunCy, step };
}

const CSS = `
.tb-energy { position: absolute; inset: 0; font-family: var(--font-ui); }
.tb-energy svg { user-select: none; -webkit-user-select: none; }
.tb-energy svg text { font-family: var(--font-ui); fill: var(--ink); }
.tb-energy .en-kicker { font-size: 12.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; fill: var(--ink-soft); }
.tb-energy .en-name { font-size: 13.5px; fill: var(--ink); }
.tb-energy .en-heat { font-size: 12.5px; font-weight: 500; fill: ${goldText}; }
.tb-energy .en-pct { font-size: 12.5px; font-weight: 600; fill: ${goldText}; }
.tb-energy .en-legend { font-size: 12.5px; fill: var(--ink-soft); }
/* after .en-name, so it wins the fill: a presentation attribute would lose to either class */
.tb-energy .en-cycle { font-size: 13.5px; fill: ${leafDark}; }
.tb-energy .en-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3.5px; stroke-linejoin: round; }
.tb-energy .en-flow { transition: opacity var(--dur) var(--ease); }
.tb-energy.is-cut .en-flow { transition: none; }
.tb-energy.mode-energy .en-matter { opacity: 0.16; }
.tb-energy.mode-matter .en-energy { opacity: 0.16; }
.tb-energy.is-narrow .en-name { font-size: 12px; }
.tb-energy.is-narrow .en-kicker { font-size: 10px; font-weight: 500; letter-spacing: 0; text-transform: none; }
.tb-energy.is-narrow .en-heat { font-size: 10.5px; }
.tb-energy.is-narrow .en-cycle { font-size: 10.5px; }
.tb-energy.is-narrow .en-halo { stroke-width: 3px; }
.tb-energy.is-narrow .fig-toolbar {
  left: var(--space-1); right: var(--space-1); bottom: var(--space-1);
  justify-content: center; flex-wrap: nowrap; gap: var(--space-1);
}
.tb-energy.is-narrow .fig-btn { padding: 0.22rem 0.6rem; font-size: 0.7rem; }
`;

export function mount(root, ctx) {
  const ns = uid('en');
  const reduced = Boolean(ctx.reducedMotion);
  const wrap = h('div', { class: 'tb-energy mode-both' });
  if (reduced || ctx.pinnedTime !== null) wrap.classList.add('is-cut');
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', { class: 'tb-fill', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
  wrap.append(svg);

  let t = ctx.pinnedTime ?? 0;
  let mode = 'both';
  let visibleE = 0;
  let visibleM = 0;
  let layout = null;
  let currentVW = 0;
  let energyRoutes = [];
  let matterRoutes = [];
  let routeLayer = null;

  // ---------- shared builders ----------
  function makeHeads(defs, sizes) {
    const heads = {};
    for (const [name, colour] of [['gold', C.gold], ['leaf', C.leaf]]) {
      for (const [size, px] of sizes) {
        const id = `${ns}-${name}-${size}`;
        const m = el('marker', { id, viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerWidth: px, markerHeight: px, orient: 'auto', markerUnits: 'userSpaceOnUse' });
        m.append(el('path', { d: 'M0 0.8 L10 5 L0 9.2 Z', fill: colour }));
        defs.append(m);
        heads[`${name}-${size}`] = `url(#${id})`;
      }
    }
    return heads;
  }

  function arrow(g, seg, colour, headUrl) {
    const attrs = { d: seg.d, stroke: colour, 'stroke-width': seg.w, fill: 'none', 'stroke-linecap': 'round' };
    if (headUrl) attrs['marker-end'] = headUrl;
    g.append(el('path', attrs));
  }

  function wispPaths(g, seg) {
    // three strokes thinning and fading upward, so the heat reads as a rising wisp
    g.append(el('path', { d: seg.d, stroke: C.gold, 'stroke-width': seg.w, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85, 'stroke-dasharray': '30 200', 'stroke-dashoffset': 0 }));
    g.append(el('path', { d: seg.d, stroke: C.gold, 'stroke-width': seg.w * 0.75, fill: 'none', 'stroke-linecap': 'round', opacity: 0.55, 'stroke-dasharray': '32 200', 'stroke-dashoffset': -30 }));
    g.append(el('path', { d: seg.d, stroke: C.gold, 'stroke-width': seg.w * 0.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.3, 'stroke-dasharray': '60 200', 'stroke-dashoffset': -62 }));
  }

  function staticMarks(g, segs) {
    for (const seg of segs) {
      if (seg.w < 2.2) continue;
      g.append(el('path', { d: seg.d, stroke: C.paper, 'stroke-width': Math.max(1.2, seg.w * 0.35), fill: 'none', 'stroke-dasharray': '2.5 9', 'stroke-linecap': 'round', opacity: 0.9 }));
    }
  }

  function buildRoutes(defsList, layer, colour, heat, dotR) {
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
        const halo = el('circle', { r: dotR * 1.875, fill: colour, opacity: 0.22 });
        const core = el('circle', { r: dotR, fill: C.paper, stroke: colour, 'stroke-width': dotR * 0.5 });
        layer.append(halo, core);
        dots.push({ halo, core, phase: (i / r.n + r.offset) % 1 });
      }
      out.push({ path, length, lastStart, dots, r: dotR });
    }
    return out;
  }

  // ---------- the wide landscape ----------
  function buildWide() {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const defs = el('defs');
    const heads = makeHeads(defs, [['l', 18], ['m', 13], ['s', 10]]);
    const headFor = (name, w) => heads[`${name}-${w >= 7 ? 'l' : w >= 4 ? 'm' : 's'}`];
    svg.append(defs);

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

    // Labels sit in one lane below the ground, clear of the arrows that dive past them to the soil.
    const labels = el('g');
    const role = (x, y, kicker, name) => {
      labels.append(text(x, y, kicker, { anchor: 'middle', class: 'en-kicker en-halo' }));
      labels.append(text(x, y + 16, name, { anchor: 'middle', class: 'en-name en-halo' }));
    };
    role(300, 450, 'Producers', 'grass, tree, algae');
    role(468, 450, 'Primary consumer', 'rabbit');
    role(778, 450, 'Secondary consumer', 'fox');
    role(848, 500, 'Decomposers', 'fungi and bacteria');
    labels.append(text(108, 148, 'sunlight', { anchor: 'middle', class: 'en-name en-halo' }));
    labels.append(text(900, 382, 'algae', { anchor: 'middle', class: 'en-name en-halo' }));
    svg.append(labels);

    const energyG = el('g', { class: 'en-flow en-energy' });
    const matterG = el('g', { class: 'en-flow en-matter' });
    for (const key of ['sun', 'toRabbit', 'toFox', 'prodToDec', 'rabbitToDec', 'foxToDec']) arrow(energyG, E[key], C.gold, headFor('gold', E[key].w));
    for (const key of ['heatProd', 'heatRabbit', 'heatFox', 'heatDec']) wispPaths(energyG, E[key]);
    for (const [x, y] of [[386, 216], [534, 188], [790, 162], [600, 368]]) energyG.append(text(x, y, 'heat', { anchor: 'middle', class: 'en-heat en-halo' }));
    energyG.append(text(433, 348, '≈ 1/10', { anchor: 'middle', class: 'en-pct en-halo' }));
    energyG.append(text(616, 316, '≈ 1/10', { anchor: 'middle', class: 'en-pct en-halo' }));
    for (const key of ['toRabbit', 'toFox', 'prodToDec', 'rabbitToDec', 'foxToDec', 'back']) arrow(matterG, M[key], C.leaf, headFor('leaf', M[key].w));
    matterG.append(text(420, 518, 'carbon and nutrients return', { anchor: 'middle', class: 'en-cycle en-halo' }));
    svg.append(matterG, energyG);

    if (reduced) {
      staticMarks(energyG, Object.values(E));
      staticMarks(matterG, Object.values(M));
    }

    const legend = el('g');
    legend.append(el('path', { d: 'M812 34 L844 34', stroke: C.gold, 'stroke-width': 5, 'stroke-linecap': 'round', 'marker-end': heads['gold-s'] }));
    legend.append(text(858, 38, 'energy, one way', { class: 'en-legend' }));
    legend.append(el('path', { d: 'M812 58 L844 58', stroke: C.leaf, 'stroke-width': 5, 'stroke-linecap': 'round', 'marker-end': heads['leaf-s'] }));
    legend.append(text(858, 62, 'matter, in a cycle', { class: 'en-legend' }));
    svg.append(legend);

    routeLayer = el('g', { fill: 'none', stroke: 'none' });
    svg.append(routeLayer);
    const particlesE = el('g', { class: 'en-flow en-energy' });
    const particlesM = el('g', { class: 'en-flow en-matter' });
    svg.append(particlesM, particlesE);
    energyRoutes = reduced ? [] : buildRoutes(ENERGY_ROUTES, particlesE, C.gold, true, 3.6);
    matterRoutes = reduced ? [] : buildRoutes(MATTER_ROUTES, particlesM, C.leaf, false, 3.4);
  }

  // ---------- the narrow chain ----------
  function buildNarrow(VW, VH) {
    const g = narrowGeo(VW, VH);
    svg.setAttribute('viewBox', `0 0 ${VW.toFixed(1)} ${VH.toFixed(1)}`);
    const defs = el('defs');
    const heads = makeHeads(defs, [['l', Math.max(8, 10 * Math.min(g.S, 1.6))], ['m', Math.max(7, 8.5 * Math.min(g.S, 1.6))], ['s', Math.max(6, 7 * Math.min(g.S, 1.6))]]);
    const headFor = (name, w) => heads[`${name}-${w >= 5 ? 'l' : w >= 3 ? 'm' : 's'}`];
    svg.append(defs);

    const scene = el('g');
    scene.append(el('rect', { x: 0, y: g.gy.toFixed(1), width: VW, height: (VH - g.gy).toFixed(1), fill: soil }));
    scene.append(el('path', { d: `M0 ${g.gy.toFixed(1)} L${VW} ${g.gy.toFixed(1)}`, stroke: C.ruleStrong, 'stroke-width': Math.max(1, 1.4 * g.S) }));
    nSun(scene, g.sunCx, g.sunCy, g.sunR);
    nGrass(scene, g.xs[0], g.gy, g.scales[0]);
    nRabbit(scene, g.xs[1], g.gy, g.scales[1]);
    nFox(scene, g.xs[2], g.gy, g.scales[2]);
    nFungi(scene, g.xs[3], g.gy, g.scales[3]);
    svg.append(scene);

    const labels = el('g');
    NARROW_STATIONS.forEach((st, i) => {
      labels.append(text(g.xs[i].toFixed(1), g.rows.name.toFixed(1), st.name, { anchor: 'middle', class: 'en-name en-halo' }));
      st.role.forEach((line, j) => {
        labels.append(text(g.xs[i].toFixed(1), (j ? g.rows.role2 : g.rows.role).toFixed(1), line, { anchor: 'middle', class: 'en-kicker en-halo' }));
      });
    });
    svg.append(labels);

    const energyG = el('g', { class: 'en-flow en-energy' });
    const matterG = el('g', { class: 'en-flow en-matter' });
    for (const key of ['sun', 'g1', 'g2', 'g3']) arrow(energyG, g.eg[key], C.gold, headFor('gold', g.eg[key].w));
    for (const seg of g.wisps) wispPaths(energyG, seg);
    // one gold row across the top: the word for what comes in, and one for what leaves at each step
    energyG.append(text(g.sunCx.toFixed(1), (g.wispTop - 5).toFixed(1), 'sunlight', { anchor: 'middle', class: 'en-heat en-halo' }));
    for (const seg of g.wisps) energyG.append(text(seg.x.toFixed(1), (g.wispTop - 5).toFixed(1), 'heat', { anchor: 'middle', class: 'en-heat en-halo' }));
    for (const key of ['m1', 'm2', 'm3', 'back']) arrow(matterG, g.mg[key], C.leaf, headFor('leaf', g.mg[key].w));
    matterG.append(text(((g.xs[0] + g.xs[3]) / 2).toFixed(1), g.rows.caption.toFixed(1), 'carbon and nutrients return', { anchor: 'middle', class: 'en-cycle en-halo' }));
    svg.append(matterG, energyG);

    if (reduced) {
      staticMarks(energyG, Object.values(g.eg));
      staticMarks(matterG, Object.values(g.mg));
    }

    routeLayer = el('g', { fill: 'none', stroke: 'none' });
    svg.append(routeLayer);
    const particlesE = el('g', { class: 'en-flow en-energy' });
    const particlesM = el('g', { class: 'en-flow en-matter' });
    svg.append(particlesM, particlesE);
    const dot = clamp(3 * g.S, 2.9, 4.6);
    const eRoutes = [
      { segs: [g.eg.sun, g.wisps[0]], n: 4, offset: 0 },
      { segs: [g.eg.sun, g.eg.g1, g.wisps[1]], n: 3, offset: 0.17 },
      { segs: [g.eg.sun, g.eg.g1, g.eg.g2, g.wisps[2]], n: 2, offset: 0.35 },
      { segs: [g.eg.sun, g.eg.g1, g.eg.g2, g.eg.g3, g.wisps[3]], n: 2, offset: 0.61 },
    ];
    const mRoutes = [
      { segs: [g.mg.m1, g.mg.m2, g.mg.m3, g.mg.back], n: 5, offset: 0 },
      { segs: [g.mg.m2, g.mg.m3, g.mg.back], n: 3, offset: 0.29 },
      { segs: [g.mg.m3, g.mg.back], n: 2, offset: 0.63 },
    ];
    energyRoutes = reduced ? [] : buildRoutes(eRoutes, particlesE, C.gold, true, dot);
    matterRoutes = reduced ? [] : buildRoutes(mRoutes, particlesM, C.leaf, false, dot);
  }

  // ---------- picking a layout ----------
  function stageWidth() {
    return root.clientWidth || root.getBoundingClientRect().width || W;
  }

  function build(px) {
    const wide = layout === 'wide'
      ? px >= NARROW_MAX - HYSTERESIS
      : px >= NARROW_MAX;
    const next = wide ? 'wide' : 'narrow';
    // In the narrow range one viewBox unit is one CSS pixel, so labels keep their authored size;
    // the width is rounded so a drag rebuilds in steps rather than on every pixel.
    const vw = next === 'narrow' ? clamp(Math.round(px / 8) * 8, 288, NARROW_MAX) : W;
    if (next === layout && vw === currentVW) return false;
    layout = next;
    currentVW = vw;
    svg.replaceChildren();
    wrap.classList.toggle('is-narrow', next === 'narrow');
    if (next === 'wide') buildWide();
    else buildNarrow(vw, vw / meta.aspect);
    draw();
    return true;
  }

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
    dot.core.setAttribute('r', (route.r * scale).toFixed(2));
    dot.halo.setAttribute('r', (route.r * 1.875 * scale).toFixed(2));
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
  let pinned = false;
  const playing = () => !reduced && ctx.pinnedTime === null && !pinned;
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

  root.append(wrap);
  build(stageWidth());

  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    build(stageWidth());
  });
  observer.observe(root);
  schedule();

  let readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      destroyed = true;
      observer.disconnect();
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
      return { mode, energyParticles: counts.energy, matterParticles: counts.matter, layout };
    },
  };
}
