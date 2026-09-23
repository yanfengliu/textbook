// Levels of organisation: one thread from an oxygen atom to the biosphere, through a frog in a pond.
// Twelve hand-drawn SVG vignettes on a round plate, a text panel naming what is new at each level,
// a filmstrip of thumbnails, a scrubber, and Previous/Next. Transitions crossfade over 300 ms and
// cut under reduced motion. describe() -> { level, title }.
import { el, h, text, C, tint, tween, clamp, uid, polar, smooth } from './lib/svg.js';

export const meta = { kind: 'levels', title: 'Levels of organisation', needsWebGL: false, aspect: 16 / 10 };

const W = 1000;
const H = 625;
const PLATE = { cx: 252, cy: 250, r: 206 };
const FADE_MS = 300;

const leafDark = 'color-mix(in srgb, var(--leaf) 68%, var(--ink))';
const coralDark = 'color-mix(in srgb, var(--coral) 70%, var(--ink))';

// ---------- shared drawing pieces ----------

// The caption under a plate, which runs the full width of the drawing and so crosses whatever the plate
// has drawn down there: the frog's legs on the organ-system plate, the pond bank on the ecosystem one.
// It takes the halo for that reason — measured 2026-09-17, it was 3.70:1 light and 3.19:1 dark over the
// organ system's pale green and 4.37:1 dark over the ecosystem's mud. On the plates whose caption sits on
// the bare paper the halo is the paper and cannot be seen.
function note(g, str, y = 188) {
  g.append(text(0, y, str, { anchor: 'middle', class: 'lv-note lv-halo' }));
}

function clipCircle(g, ns, r) {
  const id = `${ns}-clip`;
  g.append(el('clipPath', { id }, [el('circle', { r })]));
  return `url(#${id})`;
}

// A frog in side view, facing left, about 350 wide and 190 tall, feet on y = 92.
function frog(ns) {
  const g = el('g', { class: 'lv-frog' });
  const body = 'M-172 20 C-168 2 -152 -18 -128 -34 C-92 -58 -52 -86 -8 -86 C52 -86 122 -64 154 -28 C172 -6 174 30 152 54 C126 76 60 82 0 80 C-72 78 -122 66 -150 46 C-164 38 -172 30 -172 20 Z';
  const skin = tint(C.leaf, 78);
  const belly = tint(C.leaf, 22);
  const clipId = `${ns}-frogclip`;
  g.append(el('clipPath', { id: clipId }, [el('path', { d: body })]));
  // hind leg: shin and foot behind the thigh
  g.append(el('path', { d: 'M46 62 L132 87', stroke: leafDark, 'stroke-width': 20, 'stroke-linecap': 'round', fill: 'none' }));
  g.append(el('path', { d: 'M46 62 L132 87', stroke: skin, 'stroke-width': 15, 'stroke-linecap': 'round', fill: 'none' }));
  g.append(el('path', { d: 'M132 88 L36 90 M36 90 L4 94 M36 90 L14 102 M36 90 L30 106', stroke: leafDark, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }));
  g.append(el('path', { d: 'M132 88 L36 90 M36 90 L4 94 M36 90 L14 102 M36 90 L30 106', stroke: skin, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }));
  // body
  g.append(el('path', { d: body, fill: skin, stroke: leafDark, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }));
  g.append(el('ellipse', { cx: -6, cy: 68, rx: 156, ry: 26, fill: belly, 'clip-path': `url(#${clipId})` }));
  // spots on the back
  for (const [x, y, rx, ry, rot] of [[-36, -56, 9, 4.5, -30], [26, -64, 10, 5, -8], [86, -44, 8, 4, 20], [-2, -34, 7, 3.5, -20], [56, -30, 6, 3, 10], [120, -8, 7, 3.5, 40]]) {
    g.append(el('ellipse', { cx: x, cy: y, rx, ry, fill: leafDark, transform: `rotate(${rot} ${x} ${y})`, opacity: 0.85 }));
  }
  g.append(el('path', { d: 'M-92 -46 C-40 -70 40 -74 124 -50', stroke: leafDark, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  // thigh, with dark bands
  g.append(el('ellipse', { cx: 95, cy: 35, rx: 60, ry: 37, fill: skin, stroke: leafDark, 'stroke-width': 2.2, transform: 'rotate(-22 95 35)' }));
  for (const t of [-26, 2, 30]) {
    const cx = 95 + t * Math.cos(-22 * Math.PI / 180);
    const cy = 35 + t * Math.sin(-22 * Math.PI / 180);
    g.append(el('ellipse', { cx, cy, rx: 5, ry: 15, fill: leafDark, opacity: 0.8, transform: `rotate(-22 ${cx} ${cy})` }));
  }
  // front leg
  g.append(el('path', { d: 'M-96 34 C-100 52 -104 66 -116 84', stroke: leafDark, 'stroke-width': 19, 'stroke-linecap': 'round', fill: 'none' }));
  g.append(el('path', { d: 'M-96 34 C-100 52 -104 66 -116 84', stroke: skin, 'stroke-width': 15, 'stroke-linecap': 'round', fill: 'none' }));
  g.append(el('path', { d: 'M-116 86 L-140 90 M-116 86 L-132 98 M-116 86 L-108 100', stroke: leafDark, 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }));
  g.append(el('path', { d: 'M-116 86 L-140 90 M-116 86 L-132 98 M-116 86 L-108 100', stroke: skin, 'stroke-width': 4.5, 'stroke-linecap': 'round', fill: 'none' }));
  // face
  g.append(el('path', { d: 'M-171 24 C-140 30 -105 34 -78 30', stroke: leafDark, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('circle', { cx: -156, cy: 6, r: 2.6, fill: leafDark }));
  g.append(el('circle', { cx: -66, cy: -6, r: 16, fill: tint(C.leaf, 60), stroke: leafDark, 'stroke-width': 1.8 }));
  g.append(el('circle', { cx: -112, cy: -40, r: 26, fill: skin, stroke: leafDark, 'stroke-width': 2.2 }));
  g.append(el('circle', { cx: -112, cy: -40, r: 17, fill: C.gold, stroke: leafDark, 'stroke-width': 1.5 }));
  g.append(el('ellipse', { cx: -112, cy: -40, rx: 11, ry: 6, fill: C.ink }));
  g.append(el('circle', { cx: -118, cy: -46, r: 3, fill: C.paper }));
  return g;
}

function placedFrog(ns, x, y, scale, flip = false) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})` });
  g.append(frog(ns));
  return g;
}

function lilyPad(cx, cy, r) {
  const [x1, y1] = polar(cx, cy, r, 206);
  const [x2, y2] = polar(cx, cy, r, 236);
  const g = el('g');
  g.append(el('path', { d: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 1 0 ${x2} ${y2} Z`, fill: tint(C.leaf, 52), stroke: C.leaf, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
  for (const a of [300, 350, 40, 90, 140]) {
    const [vx, vy] = polar(cx, cy, r * 0.85, a);
    g.append(el('path', { d: `M${cx} ${cy} L${vx} ${vy}`, stroke: C.leaf, 'stroke-width': 1, opacity: 0.6 }));
  }
  return g;
}

function reed(x, y0, y1) {
  const g = el('g');
  g.append(el('path', { d: `M${x} ${y0} C${x - 8} ${y0 - 50} ${x - 28} ${y0 - 80} ${x - 44} ${y0 - 118}`, stroke: C.leaf, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('path', { d: `M${x} ${y0} C${x + 6} ${y0 - 40} ${x + 22} ${y0 - 70} ${x + 30} ${y0 - 96}`, stroke: C.leaf, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('path', { d: `M${x} ${y0} L${x} ${y1}`, stroke: C.leaf, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  g.append(el('path', { d: `M${x} ${y1 - 38} L${x} ${y1 - 58}`, stroke: C.leaf, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  g.append(el('rect', { x: x - 5.5, y: y1 - 40, width: 11, height: 42, rx: 5.5, fill: tint(C.ink, 62) }));
  return g;
}

function dragonfly(cx, cy) {
  const g = el('g', { transform: `translate(${cx} ${cy}) rotate(-12)` });
  const wing = (x, y, rot) => el('ellipse', { cx: x, cy: y, rx: 24, ry: 6.5, fill: tint(C.water, 18), stroke: C.water, 'stroke-width': 1.2, transform: `rotate(${rot} ${x} ${y})` });
  g.append(wing(-16, -10, -28), wing(14, -10, 28), wing(-16, 10, 28), wing(14, 10, -28));
  g.append(el('path', { d: 'M-8 0 L44 0', stroke: C.water, 'stroke-width': 3.2, 'stroke-linecap': 'round' }));
  g.append(el('ellipse', { cx: -10, cy: 0, rx: 9, ry: 5.5, fill: C.water }));
  g.append(el('circle', { cx: -22, cy: 0, r: 5, fill: C.water }));
  return g;
}

function fish(cx, cy, scale = 1, flip = false) {
  const g = el('g', { transform: `translate(${cx} ${cy}) scale(${flip ? -scale : scale} ${scale})` });
  const fill = tint(C.gold, 68);
  const edge = tint(C.gold, 75, C.ink);
  g.append(el('path', { d: 'M26 0 L44 -13 L40 0 L44 13 Z', fill, stroke: edge, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: 'M-6 -11 L2 -20 L12 -11 Z', fill, stroke: edge, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  g.append(el('ellipse', { rx: 30, ry: 12, fill, stroke: edge, 'stroke-width': 1.5 }));
  g.append(el('path', { d: 'M-2 4 L6 12 L12 4', fill: 'none', stroke: edge, 'stroke-width': 1.3 }));
  g.append(el('circle', { cx: -18, cy: -3, r: 2.6, fill: C.ink }));
  return g;
}

function tadpole(cx, cy, flip = false) {
  const g = el('g', { transform: `translate(${cx} ${cy}) scale(${flip ? -1 : 1} 1)` });
  g.append(el('path', { d: 'M8 0 C18 -7 22 7 34 0', stroke: C.soft, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('ellipse', { rx: 10, ry: 7.5, fill: C.soft }));
  g.append(el('circle', { cx: -4, cy: -2, r: 1.6, fill: C.paper }));
  return g;
}

function sun(cx, cy, r) {
  const g = el('g');
  for (let i = 0; i < 8; i += 1) {
    const [x1, y1] = polar(cx, cy, r + 9, i * 45);
    const [x2, y2] = polar(cx, cy, r + 19, i * 45);
    g.append(el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: C.gold, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  }
  g.append(el('circle', { cx, cy, r, fill: C.gold }));
  return g;
}

// The living things of the pond, shared by Community and Ecosystem so the reader sees the same
// scene twice: first the organisms alone, then with their non-living surroundings.
function pondLife(g, ns) {
  g.append(reed(126, 42, -128), reed(152, 44, -160), reed(174, 46, -108));
  g.append(lilyPad(-88, 62, 50), lilyPad(24, 88, 42), lilyPad(80, 40, 30));
  g.append(placedFrog(`${ns}-f1`, -84, 34, 0.34));
  g.append(placedFrog(`${ns}-f2`, -150, -12, 0.26, true));
  g.append(dragonfly(-4, -134));
  g.append(fish(70, 140, 0.95));
  g.append(fish(-70, 158, 0.6, true));
  g.append(tadpole(-20, 122), tadpole(28, 150, true));
  for (const [x, y] of [[-130, 36], [-124, 42], [-136, 44], [-30, 40], [-24, 46], [110, 90], [120, 96]]) {
    g.append(el('circle', { cx: x, cy: y, r: 3, fill: C.leaf, opacity: 0.8 }));
  }
}

// ---------- the twelve vignettes, each drawn in a 400 x 400 box centred on the origin ----------

function drawAtom(g) {
  g.append(el('circle', { r: 76, fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.6 }));
  g.append(el('circle', { r: 158, fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.6 }));
  const spots = [[0, 0]];
  for (let i = 0; i < 6; i += 1) spots.push(polar(0, 0, 24, i * 60));
  for (let i = 0; i < 9; i += 1) spots.push(polar(0, 0, 45, i * 40 + 20));
  spots.forEach(([x, y], i) => {
    const proton = i % 2 === 0;
    g.append(el('circle', { cx: x, cy: y, r: 13.5, fill: proton ? C.coral : tint(C.ink, 28), stroke: C.paper, 'stroke-width': 1.5 }));
  });
  for (const a of [90, 270]) {
    const [x, y] = polar(0, 0, 76, a);
    g.append(el('circle', { cx: x, cy: y, r: 7.5, fill: C.water }));
  }
  for (let i = 0; i < 6; i += 1) {
    const [x, y] = polar(0, 0, 158, i * 60 + 30);
    g.append(el('circle', { cx: x, cy: y, r: 7.5, fill: C.water }));
  }
  g.append(text(52, -60, '8 protons', { class: 'lv-note lv-note-small lv-coral' }));
  g.append(text(52, -44, '8 neutrons', { class: 'lv-note lv-note-small' }));
  g.append(text(118, 118, '8 electrons', { class: 'lv-note lv-note-small lv-water' }));
  note(g, 'an oxygen atom: a nucleus and two shells of electrons');
}

function drawMolecule(g) {
  const d = 92;
  const a = (52.25 * Math.PI) / 180;
  const hx = d * Math.sin(a);
  const hy = 30 - d * Math.cos(a);
  const hFill = tint(C.ink, 12);
  g.append(el('path', { d: `M${-hx} ${hy} L0 30 L${hx} ${hy}`, stroke: C.faint, 'stroke-width': 1.5, 'stroke-dasharray': '4 5', fill: 'none' }));
  g.append(el('circle', { cx: -hx, cy: hy, r: 44, fill: hFill, stroke: tint(C.ink, 40), 'stroke-width': 1.8 }));
  g.append(el('circle', { cx: hx, cy: hy, r: 44, fill: hFill, stroke: tint(C.ink, 40), 'stroke-width': 1.8 }));
  g.append(el('circle', { cx: 0, cy: 30, r: 70, fill: C.coral, stroke: coralDark, 'stroke-width': 1.8 }));
  // the bond angle, marked from the oxygen's centre
  const ra = 44;
  const [ax, ay] = [-Math.sin(a) * ra, 30 - Math.cos(a) * ra];
  const [bx, by] = [Math.sin(a) * ra, 30 - Math.cos(a) * ra];
  g.append(el('path', { d: `M${ax} ${ay} L0 30 L${bx} ${by}`, stroke: C.paper, 'stroke-width': 1.6, fill: 'none', opacity: 0.9 }));
  g.append(el('path', { d: `M${-Math.sin(a) * 30} ${30 - Math.cos(a) * 30} A30 30 0 0 1 ${Math.sin(a) * 30} ${30 - Math.cos(a) * 30}`, stroke: C.paper, 'stroke-width': 1.6, fill: 'none', opacity: 0.9 }));
  // The angle sits on the oxygen's own coral, which no label colour clears in both themes: the ink is
  // 4.88:1 light and 1.95:1 dark, the paper 3.32:1 light and 7.26:1 dark. So it takes the halo `scale`
  // and `tree` already use for a label over a drawing, and reads on --paper-2 in both (6.14:1). The
  // letter on the disc is the one element table's own rule — paper on a coloured disc
  // (src/figures/lib/chem-atoms.js) — stated as a class here, because a `fill` attribute loses to
  // `.tb-levels svg text` and the O had been drawn in the ink: 1.95:1 on a dark page.
  g.append(text(0, 22, '104.5°', { anchor: 'middle', class: 'lv-note lv-note-small lv-halo' }));
  g.append(text(0, 80, 'O', { anchor: 'middle', class: 'lv-atomlabel' }));
  g.append(text(-hx, hy + 8, 'H', { anchor: 'middle', class: 'lv-atomlabel lv-atomlabel-h' }));
  g.append(text(hx, hy + 8, 'H', { anchor: 'middle', class: 'lv-atomlabel lv-atomlabel-h' }));
  note(g, 'a water molecule, H₂O: two hydrogens bonded to one oxygen');
}

function drawMitochondrion(g) {
  const bend = (x, y) => [x, y - 0.0009 * x * x + 12];
  const pts = (list) => list.map(([x, y]) => bend(x, y).map((v) => v.toFixed(1)).join(' ')).join(' L');
  const outer = [];
  for (let i = 0; i <= 120; i += 1) {
    const t = (i / 120) * Math.PI * 2;
    outer.push([172 * Math.cos(t), 86 * Math.sin(t)]);
  }
  g.append(el('path', { d: `M${pts(outer)} Z`, fill: tint(C.coral, 15), stroke: C.coral, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  // inner membrane with cristae folded in from the top and the bottom
  const rx = 150;
  const ry = 66;
  const w = 9;
  const top = [];
  const topCristae = [-108, -40, 28, 96];
  const bottomCristae = [-74, -6, 62];
  const yTop = (x) => -ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
  // A crista: the membrane leaves its edge at xc - w, runs `depth` into the matrix (dir = +1 from
  // the top edge, -1 from the bottom), rounds off, and returns to the edge at xc + w.
  const fold = (xc, dir, depth) => {
    const edge = (x) => (dir === 1 ? yTop(x) : -yTop(x));
    const yb = edge(xc - w) + dir * depth;
    const out = [[xc - w, edge(xc - w)], [xc - w, yb]];
    for (let k = 1; k < 8; k += 1) {
      const t = Math.PI * (k / 8);
      out.push([xc - w * Math.cos(t), yb + dir * w * Math.sin(t)]);
    }
    out.push([xc + w, yb], [xc + w, edge(xc + w)]);
    return out;
  };
  for (let x = -rx; x <= rx; x += 2) {
    const c = topCristae.find((xc) => x >= xc - w && x <= xc + w);
    if (c !== undefined) {
      if (x < c - w + 2) top.push(...fold(c, 1, 100));
      continue;
    }
    top.push([x, yTop(x)]);
  }
  const bottom = [];
  for (let x = rx; x >= -rx; x -= 2) {
    const c = bottomCristae.find((xc) => x >= xc - w && x <= xc + w);
    if (c !== undefined) {
      if (x > c + w - 2) bottom.push(...fold(c, -1, 96).reverse());
      continue;
    }
    bottom.push([x, -yTop(x)]);
  }
  g.append(el('path', { d: `M${pts([...top, ...bottom])} Z`, fill: tint(C.coral, 34), stroke: C.coral, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }));
  // a loop of mitochondrial DNA and a few ribosomes in the matrix
  const [dx, dy] = bend(-14, 12);
  g.append(el('ellipse', { cx: dx, cy: dy, rx: 12, ry: 7, fill: 'none', stroke: C.violet, 'stroke-width': 2.2 }));
  for (const [x, y] of [[-134, 4], [120, 10], [-60, 38], [-16, -36]]) {
    const [px, py] = bend(x, y);
    g.append(el('circle', { cx: px, cy: py, r: 2.4, fill: C.soft }));
  }
  g.append(text(-96, -118, 'outer membrane', { anchor: 'middle', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M-96 -112 L-96 -88', stroke: C.faint, 'stroke-width': 1 }));
  g.append(text(96, -118, 'inner membrane', { anchor: 'middle', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M96 -112 L96 -70', stroke: C.faint, 'stroke-width': 1 }));
  g.append(text(28, 134, 'cristae', { anchor: 'middle', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M28 122 L28 52', stroke: C.faint, 'stroke-width': 1 }));
  note(g, 'a mitochondrion: the inner membrane folds into cristae, where ATP is made');
}

function zigzag(x, y0, y1, amp = 6, step = 8) {
  let d = `M${x} ${y0}`;
  let y = y0;
  let side = 1;
  while (y + step <= y1) {
    y += step;
    d += ` L${x + side * amp} ${y}`;
    side = -side;
  }
  d += ` L${x} ${y1}`;
  return d;
}

const CELL_PATH = 'M-176 -38 L40 -38 C70 -38 86 -50 110 -62 L176 -86 L178 -52 L128 -34 C118 -30 118 30 128 34 L178 52 L176 86 L110 62 C86 50 70 38 40 38 L-176 38 C-192 38 -192 -38 -176 -38 Z';

function drawCell(g, ns) {
  const clipId = `${ns}-cellclip`;
  g.append(el('clipPath', { id: clipId }, [el('path', { d: CELL_PATH })]));
  g.append(el('path', { d: CELL_PATH, fill: tint(C.coral, 22), stroke: C.coral, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  const bands = el('g', { 'clip-path': `url(#${clipId})` });
  for (let x = -170; x <= 176; x += 12) bands.append(el('path', { d: `M${x} -100 L${x} 100`, stroke: C.coral, 'stroke-width': 4, opacity: 0.28 }));
  g.append(bands);
  for (const [x, y, rot] of [[-122, -18, -10], [-108, 18, 12], [-60, 22, 5], [34, -18, -8], [26, 18, 6], [140, -62, -20], [140, 60, 20]]) {
    g.append(el('ellipse', { cx: x, cy: y, rx: 13, ry: 6, fill: tint(C.coral, 60), stroke: C.coral, 'stroke-width': 1.5, transform: `rotate(${rot} ${x} ${y})` }));
  }
  g.append(el('ellipse', { cx: -40, cy: 0, rx: 34, ry: 17, fill: tint(C.violet, 72), stroke: C.violet, 'stroke-width': 1.5 }));
  g.append(el('path', { d: zigzag(-176, -38, 38), stroke: coralDark, 'stroke-width': 2.5, fill: 'none', 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: 'M176 -86 L178 -52', stroke: coralDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  g.append(el('path', { d: 'M178 52 L176 86', stroke: coralDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  g.append(text(-40, -62, 'nucleus', { anchor: 'middle', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M-40 -56 L-40 -20', stroke: C.faint, 'stroke-width': 1 }));
  g.append(text(-112, 70, 'mitochondria', { anchor: 'middle', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M-108 60 L-108 26', stroke: C.faint, 'stroke-width': 1 }));
  g.append(text(-192, -88, 'joins the next cell', { anchor: 'start', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M-176 -82 L-176 -44', stroke: C.faint, 'stroke-width': 1 }));
  note(g, 'a heart muscle cell: striped, branched, with one nucleus');
}

function drawTissue(g, ns) {
  const clip = clipCircle(g, ns, 176);
  const inner = el('g', { 'clip-path': clip });
  const rows = [-124, -62, 0, 62, 124];
  rows.forEach((cy, r) => {
    const offset = r % 2 ? 80 : 0;
    for (let k = -2; k <= 2; k += 1) {
      const x0 = k * 160 + offset - 80;
      const cellId = `${ns}-t${r}-${k + 2}`;
      const cell = el('g');
      cell.append(el('clipPath', { id: cellId }, [el('rect', { x: x0, y: cy - 22, width: 156, height: 44, rx: 8 })]));
      cell.append(el('rect', { x: x0, y: cy - 22, width: 156, height: 44, rx: 8, fill: tint(C.coral, 22), stroke: C.coral, 'stroke-width': 1.8 }));
      const bands = el('g', { 'clip-path': `url(#${cellId})` });
      for (let x = x0 + 6; x < x0 + 156; x += 11) bands.append(el('path', { d: `M${x} ${cy - 24} L${x} ${cy + 24}`, stroke: C.coral, 'stroke-width': 3.5, opacity: 0.26 }));
      cell.append(bands);
      cell.append(el('ellipse', { cx: x0 + 78, cy, rx: 20, ry: 9, fill: tint(C.violet, 72), stroke: C.violet, 'stroke-width': 1.2 }));
      cell.append(el('path', { d: zigzag(x0 + 156, cy - 22, cy + 22, 4, 7), stroke: coralDark, 'stroke-width': 2, fill: 'none' }));
      inner.append(cell);
    }
  });
  for (const [x, y] of [[-110, -93], [40, -31], [-40, 31], [110, 93], [140, -93], [-150, 31]]) {
    inner.append(el('path', { d: `M${x - 14} ${y - 12} L${x + 14} ${y + 12}`, stroke: C.coral, 'stroke-width': 16, 'stroke-linecap': 'butt' }));
    inner.append(el('path', { d: `M${x - 14} ${y - 12} L${x + 14} ${y + 12}`, stroke: tint(C.coral, 22), 'stroke-width': 12, 'stroke-linecap': 'butt' }));
  }
  g.append(inner);
  g.append(el('circle', { r: 176, fill: 'none', stroke: C.rule, 'stroke-width': 1.5 }));
  note(g, 'heart muscle tissue: branching cells joined end to end', 196);
}

function tube(g, d, width, fill, edge) {
  g.append(el('path', { d, stroke: edge, 'stroke-width': width + 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  g.append(el('path', { d, stroke: fill, 'stroke-width': width, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
}

function drawHeart(g) {
  const atrium = tint(C.coral, 40);
  // 52, not 74. `tint()` follows the theme, but at 74 the fill is mid-luminance in BOTH themes, and
  // the ink over it measured 6.76:1 light and 3.16:1 dark — the word vanished on a dark page. Mixed
  // further towards the paper it is 8.90:1 and 4.98:1, and it still reads a clear step deeper than
  // the atria's 40. No new colour: the same coral, further into the paper.
  const ventricle = tint(C.coral, 52);
  const vessel = tint(C.coral, 56);
  // veins bringing blood in (behind)
  tube(g, 'M-124 -150 C-110 -128 -96 -112 -84 -96', 14, tint(C.water, 55), C.water);
  tube(g, 'M124 -150 C110 -128 96 -112 84 -96', 14, tint(C.water, 55), C.water);
  tube(g, 'M-150 -122 C-128 -116 -110 -108 -96 -92', 11, tint(C.water, 55), C.water);
  // the artery leaving: truncus arteriosus splitting into two arches
  tube(g, 'M-26 -20 C-30 -70 -28 -100 -22 -128', 24, vessel, C.coral);
  tube(g, 'M-22 -126 C-24 -152 -60 -150 -86 -168', 17, vessel, C.coral);
  tube(g, 'M-22 -126 C-20 -152 26 -150 52 -168', 17, vessel, C.coral);
  // two atria
  g.append(el('ellipse', { cx: -66, cy: -62, rx: 62, ry: 47, fill: atrium, stroke: C.coral, 'stroke-width': 2.6 }));
  g.append(el('ellipse', { cx: 68, cy: -60, rx: 62, ry: 47, fill: atrium, stroke: C.coral, 'stroke-width': 2.6 }));
  // one ventricle
  g.append(el('path', { d: 'M-92 -14 C-102 60 -50 150 8 154 C62 150 102 60 92 -14 C92 -40 -92 -40 -92 -14 Z', fill: ventricle, stroke: C.coral, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  g.append(el('path', { d: 'M-60 10 C-30 40 -10 90 8 128', stroke: coralDark, 'stroke-width': 2, fill: 'none', opacity: 0.55 }));
  // `lv-onfill`, not a `fill` attribute: `.tb-levels .lv-note` is a CSS rule and beats a presentation
  // attribute, so the ink these three asked for never reached the page and all three were drawn in
  // --ink-soft — 4.35:1, 4.35:1 and 2.87:1 in the light theme, 3.07:1 and 1.49:1 in the dark one.
  g.append(text(-66, -58, 'atrium', { anchor: 'middle', class: 'lv-note lv-note-small lv-onfill' }));
  g.append(text(68, -56, 'atrium', { anchor: 'middle', class: 'lv-note lv-note-small lv-onfill' }));
  g.append(text(36, 62, 'ventricle', { anchor: 'middle', class: 'lv-note lv-note-small lv-onfill' }));
  g.append(text(-150, -178, 'to the body', { anchor: 'start', class: 'lv-note lv-note-small' }));
  g.append(text(150, -160, 'from the body', { anchor: 'end', class: 'lv-note lv-note-small' }));
  note(g, 'a frog heart: two atria, one ventricle');
}

function drawSystem(g) {
  const outline = tint(C.leaf, 45);
  const body = tint(C.leaf, 9);
  const limb = (d, w) => {
    g.append(el('path', { d, stroke: outline, 'stroke-width': w + 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    g.append(el('path', { d, stroke: body, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  };
  // hind legs folded beside the body, front legs, then the body over them
  for (const s of [1, -1]) {
    limb(`M${s * 112} 176 L${s * 92} 192 M${s * 112} 176 L${s * 106} 196 M${s * 112} 176 L${s * 122} 196`, 7);
    limb(`M${s * 70} 84 L${s * 146} 44 L${s * 154} 132 L${s * 112} 176`, 26);
    limb(`M${s * 132} 6 L${s * 148} 18 M${s * 132} 6 L${s * 138} 24 M${s * 132} 6 L${s * 124} 22`, 5);
    limb(`M${s * 80} -58 L${s * 126} -44 L${s * 132} 6`, 17);
  }
  g.append(el('path', { d: 'M0 -176 C-44 -176 -74 -142 -84 -100 C-98 -58 -98 22 -88 70 C-72 132 -32 168 0 168 C32 168 72 132 88 70 C98 22 98 -58 84 -100 C74 -142 44 -176 0 -176 Z', fill: body, stroke: outline, 'stroke-width': 2.2 }));
  g.append(el('circle', { cx: -42, cy: -122, r: 17, fill: tint(C.leaf, 26), stroke: outline, 'stroke-width': 1.6 }));
  g.append(el('circle', { cx: 42, cy: -122, r: 17, fill: tint(C.leaf, 26), stroke: outline, 'stroke-width': 1.6 }));
  // lungs, faint
  g.append(el('ellipse', { cx: -36, cy: -40, rx: 16, ry: 30, fill: tint(C.water, 14), stroke: tint(C.water, 45), 'stroke-width': 1.2 }));
  g.append(el('ellipse', { cx: 36, cy: -40, rx: 16, ry: 30, fill: tint(C.water, 14), stroke: tint(C.water, 45), 'stroke-width': 1.2 }));
  // veins (blue) beneath the arteries
  const vein = { stroke: C.water, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  g.append(el('path', { d: 'M-28 -138 C-38 -110 -24 -84 -10 -72', ...vein, 'stroke-width': 2.4 }));
  g.append(el('path', { d: 'M28 -138 C38 -110 24 -84 10 -72', ...vein, 'stroke-width': 2.4 }));
  g.append(el('path', { d: 'M-142 20 C-120 6 -60 -4 -22 -56', ...vein, 'stroke-width': 2 }));
  g.append(el('path', { d: 'M142 20 C120 6 60 -4 22 -56', ...vein, 'stroke-width': 2 }));
  g.append(el('path', { d: 'M-118 166 C-132 148 -142 136 -146 124 C-144 102 -140 80 -134 58 C-120 62 -100 72 -80 82 C-50 90 -20 80 -8 60', ...vein, 'stroke-width': 2.2 }));
  g.append(el('path', { d: 'M118 166 C132 148 142 136 146 124 C144 102 140 80 134 58 C120 62 100 72 80 82 C50 90 20 80 8 60', ...vein, 'stroke-width': 2.2 }));
  g.append(el('path', { d: 'M8 60 C10 20 10 -20 8 -56', ...vein, 'stroke-width': 3 }));
  // arteries (coral)
  const artery = { stroke: C.coral, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  g.append(el('path', { d: 'M0 -76 C-4 -96 -30 -100 -36 -84 C-40 -70 -20 -46 -4 -20', ...artery, 'stroke-width': 3.6 }));
  g.append(el('path', { d: 'M0 -76 C4 -96 30 -100 36 -84 C40 -70 20 -46 -4 -20', ...artery, 'stroke-width': 3.6 }));
  g.append(el('path', { d: 'M-36 -84 C-40 -110 -30 -128 -34 -140', ...artery, 'stroke-width': 2.4 }));
  g.append(el('path', { d: 'M36 -84 C40 -110 30 -128 34 -140', ...artery, 'stroke-width': 2.4 }));
  g.append(el('path', { d: 'M-32 -70 C-70 -60 -100 -50 -124 -36', ...artery, 'stroke-width': 2 }));
  g.append(el('path', { d: 'M32 -70 C70 -60 100 -50 124 -36', ...artery, 'stroke-width': 2 }));
  g.append(el('path', { d: 'M-124 -36 C-128 -10 -134 6 -140 22', ...artery, 'stroke-width': 1.6 }));
  g.append(el('path', { d: 'M124 -36 C128 -10 134 6 140 22', ...artery, 'stroke-width': 1.6 }));
  g.append(el('path', { d: 'M-4 -20 C-6 20 -6 60 -2 84', ...artery, 'stroke-width': 3.4 }));
  g.append(el('path', { d: 'M-4 10 C-30 8 -50 18 -62 30', ...artery, 'stroke-width': 1.6 }));
  g.append(el('path', { d: 'M-4 30 C20 34 40 30 56 44', ...artery, 'stroke-width': 1.6 }));
  g.append(el('path', { d: 'M-2 84 C-40 94 -60 86 -80 78 C-110 66 -128 56 -140 50 C-146 78 -150 104 -152 128 C-142 144 -128 158 -112 172', ...artery, 'stroke-width': 2.6 }));
  g.append(el('path', { d: 'M-2 84 C40 94 60 86 80 78 C110 66 128 56 140 50 C146 78 150 104 152 128 C142 144 128 158 112 172', ...artery, 'stroke-width': 2.6 }));
  // the heart in the chest
  g.append(el('ellipse', { cx: -9, cy: -66, rx: 10, ry: 8, fill: tint(C.coral, 45), stroke: C.coral, 'stroke-width': 1.5 }));
  g.append(el('ellipse', { cx: 9, cy: -66, rx: 10, ry: 8, fill: tint(C.coral, 45), stroke: C.coral, 'stroke-width': 1.5 }));
  g.append(el('path', { d: 'M-16 -60 C-16 -36 -6 -24 0 -22 C6 -24 16 -36 16 -60 Z', fill: tint(C.coral, 76), stroke: C.coral, 'stroke-width': 1.8 }));
  // x = 120 and not 150: the plate's rim is a circle of radius 206 about the origin, which at y = -96 is
  // at x = 182, and "arteries" set from 150 ran to 192 — its last two letters outside the plate with the
  // rim drawn through them. Measured 2026-09-17: 4.02:1, 11% of the word's pixels on the rim's own grey.
  // The word is moved off the rule rather than given a ground, because a label crossing the edge of its
  // own plate is a composition fault first. At 120 it ends at 162, and the rim is at x = 176 at the
  // highest point the word reaches, so it is clear of it over its whole height; the two words stay a
  // legend for the two colours in the drawing beside them.
  g.append(text(120, -96, 'arteries', { anchor: 'start', class: 'lv-note lv-note-small lv-coral' }));
  g.append(text(120, -80, 'veins', { anchor: 'start', class: 'lv-note lv-note-small lv-water' }));
  g.append(text(-186, -96, 'heart', { anchor: 'start', class: 'lv-note lv-note-small' }));
  g.append(el('path', { d: 'M-150 -92 L-20 -66', stroke: C.faint, 'stroke-width': 1 }));
  note(g, 'the circulatory system: heart, arteries and veins reach every part', 198);
}

function drawOrganism(g, ns) {
  g.append(placedFrog(ns, 0, -6, 0.98));
  g.append(el('path', { d: 'M-190 88 L190 88', stroke: C.ruleStrong, 'stroke-width': 1.5 }));
  note(g, 'a frog: one individual, alive');
}

function drawPopulation(g, ns) {
  g.append(el('path', { d: 'M-196 44 L196 44', stroke: C.ruleStrong, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' }));
  g.append(lilyPad(-104, 66, 54), lilyPad(34, 84, 60), lilyPad(134, 40, 40));
  g.append(placedFrog(`${ns}-a`, -104, 40, 0.32));
  g.append(placedFrog(`${ns}-b`, 30, 52, 0.4));
  g.append(placedFrog(`${ns}-c`, 134, 20, 0.25, true));
  g.append(placedFrog(`${ns}-d`, -124, -100, 0.28));
  g.append(placedFrog(`${ns}-e`, 92, -104, 0.34, true));
  g.append(placedFrog(`${ns}-f`, -20, -50, 0.2));
  g.append(tadpole(-50, 136), tadpole(6, 156, true), tadpole(70, 132), tadpole(130, 150, true));
  note(g, 'a population: all the frogs of one kind living in one pond');
}

function drawCommunity(g, ns) {
  g.append(el('path', { d: 'M-196 40 L196 40', stroke: C.ruleStrong, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' }));
  pondLife(g, ns);
  note(g, 'a community: every population in the pond, living together');
}

function drawEcosystem(g, ns) {
  const clip = clipCircle(g, ns, 198);
  const scene = el('g', { 'clip-path': clip });
  scene.append(el('rect', { x: -200, y: 40, width: 400, height: 170, fill: tint(C.water, 22) }));
  scene.append(el('path', { d: 'M-200 152 C-150 140 -110 160 -60 150 C0 140 60 166 120 152 C160 144 180 156 200 150 L200 210 L-200 210 Z', fill: tint(C.ink, 16) }));
  scene.append(el('path', { d: 'M-200 40 C-180 32 -160 26 -136 30 C-118 34 -108 40 -100 40 L-100 70 C-140 80 -170 90 -200 80 Z', fill: tint(C.leaf, 20), stroke: 'none' }));
  scene.append(el('path', { d: 'M-186 42 C-180 26 -160 24 -150 38 C-144 46 -180 48 -186 42 Z', fill: tint(C.ink, 26), stroke: C.faint, 'stroke-width': 1.2 }));
  scene.append(el('path', { d: 'M-150 66 C-146 50 -120 50 -116 64 C-114 72 -150 74 -150 66 Z', fill: tint(C.ink, 22), stroke: C.faint, 'stroke-width': 1.2 }));
  scene.append(el('path', { d: 'M-40 158 C-36 146 -14 146 -10 158 C-8 164 -40 164 -40 158 Z', fill: tint(C.ink, 30), stroke: C.faint, 'stroke-width': 1 }));
  scene.append(el('path', { d: 'M140 160 C144 148 166 148 170 160 C172 166 140 166 140 160 Z', fill: tint(C.ink, 30), stroke: C.faint, 'stroke-width': 1 }));
  scene.append(el('path', { d: 'M-196 40 L196 40', stroke: C.water, 'stroke-width': 1.5, opacity: 0.6 }));
  scene.append(sun(-106, -110, 26));
  pondLife(scene, ns);
  g.append(scene);
  note(g, 'an ecosystem: the community plus sunlight, water, rock and mud');
}

function drawBiosphere(g, ns) {
  const clip = clipCircle(g, ns, 172);
  g.append(el('circle', { r: 179, fill: 'none', stroke: C.leaf, 'stroke-width': 6, opacity: 0.55 }));
  g.append(el('circle', { r: 172, fill: tint(C.water, 46) }));
  const land = el('g', { 'clip-path': clip, fill: tint(C.leaf, 82) });
  // continents in an Atlantic-centred view: the Americas on the left, Europe and Africa on the right
  const northAmerica = [[-152, -60], [-146, -112], [-112, -142], [-70, -138], [-56, -120], [-44, -98], [-54, -66], [-64, -38], [-90, -26], [-82, 2], [-76, 30], [-94, 10], [-116, -6], [-136, -28]];
  const southAmerica = [[-78, 36], [-44, 40], [-16, 66], [-28, 104], [-44, 136], [-62, 164], [-72, 134], [-84, 98], [-90, 60]];
  const africa = [[26, -34], [70, -42], [114, -34], [144, 10], [118, 62], [92, 122], [62, 98], [52, 48], [14, 34], [2, -2]];
  const eurasia = [[24, -52], [46, -86], [72, -128], [122, -136], [170, -104], [154, -72], [112, -62], [64, -56]];
  const greenland = [[-64, -152], [-30, -170], [-6, -152], [-16, -126], [-46, -122]];
  const antarctica = [[-104, 152], [0, 168], [104, 152], [96, 184], [-96, 184]];
  land.append(el('path', { d: smooth(northAmerica) }));
  land.append(el('path', { d: smooth(southAmerica) }));
  land.append(el('path', { d: smooth(africa) }));
  land.append(el('path', { d: smooth(eurasia) }));
  land.append(el('path', { d: smooth(greenland), fill: tint(C.ink, 8) }));
  land.append(el('path', { d: smooth(antarctica), fill: tint(C.ink, 8) }));
  g.append(land);
  g.append(el('circle', { r: 172, fill: 'none', stroke: tint(C.water, 70, C.ink), 'stroke-width': 1.5 }));
  g.append(el('path', { d: 'M126 -128 L150 -160', stroke: C.faint, 'stroke-width': 1 }));
  g.append(text(154, -166, 'life lives in a skin', { anchor: 'start', class: 'lv-note lv-note-small' }));
  g.append(text(154, -150, 'a few km thick', { anchor: 'start', class: 'lv-note lv-note-small' }));
  note(g, 'the biosphere: every ecosystem on Earth, a thin green skin on one planet', 198);
}

export const LEVELS = Object.freeze([
  { id: 'atom', title: 'Atom', size: 'about 0.1 nm', what: 'The smallest unit of an element. An oxygen atom has eight protons, and that number alone is what makes it oxygen.', draw: drawAtom },
  { id: 'molecule', title: 'Molecule', size: 'about 0.3 nm', what: 'Atoms bond into molecules with properties of their own: two hydrogens and an oxygen make water, which behaves like neither gas.', draw: drawMolecule },
  { id: 'organelle', title: 'Organelle', size: 'about 1 µm', what: 'Molecules assemble into working parts. A mitochondrion burns sugar with oxygen to make ATP, the cell’s energy currency.', draw: drawMitochondrion },
  { id: 'cell', title: 'Cell', size: 'about 100 µm long', what: 'The first level that is alive. A cell keeps its own chemistry running, responds to its surroundings, and can make more cells.', draw: drawCell },
  { id: 'tissue', title: 'Tissue', size: 'about 1 mm', what: 'Cells of one kind working together. Muscle cells joined end to end contract in step, which no single cell can do alone.', draw: drawTissue },
  { id: 'organ', title: 'Organ', size: 'about 1 cm', what: 'Several tissues combined into a structure with a job. Muscle, lining and nerve tissue together make a heart that pumps.', draw: drawHeart },
  { id: 'system', title: 'Organ system', size: 'about 8 cm', what: 'Organs that cooperate. The heart and the vessels together carry blood, and with it oxygen and food, to every cell in the body.', draw: drawSystem },
  { id: 'organism', title: 'Organism', size: 'about 8 cm', what: 'An individual living thing. All of its organ systems together keep one frog alive, and it can leave offspring.', draw: drawOrganism },
  { id: 'population', title: 'Population', size: 'about 20 m across', what: 'All the individuals of one species in one place. A population can grow, shrink and evolve, which a single frog cannot.', draw: drawPopulation },
  { id: 'community', title: 'Community', size: 'about 20 m across', what: 'Every population that lives in the same place: predators and prey, plants and grazers, competitors and partners.', draw: drawCommunity },
  { id: 'ecosystem', title: 'Ecosystem', size: 'about 20 m across', what: 'The community plus its non-living surroundings. Energy flows in as sunlight and out as heat; water, carbon and minerals cycle round.', draw: drawEcosystem },
  { id: 'biosphere', title: 'Biosphere', size: '12,700 km across', what: 'Every ecosystem on Earth. All known life lives in a skin a few kilometres deep on one planet.', draw: drawBiosphere },
]);

const CSS = `
.tb-levels { position: absolute; inset: 0; font-family: var(--font-ui); }
.tb-levels svg text { font-family: var(--font-ui); fill: var(--ink); }
.tb-levels .lv-note { fill: var(--ink-soft); font-size: 12.5px; }
.tb-levels .lv-note-small { font-size: 11.5px; }
/* A fill ATTRIBUTE on one of these texts does nothing: a CSS rule beats a presentation attribute, so
   '.tb-levels svg text' and '.tb-levels .lv-note' win over text(..., { fill: C.paper }). Nine labels were
   written that way and were drawn in the ink or the soft ink instead. A label that needs a colour of its
   own takes a class here, and no text() call in this file passes a fill any more, so the file and the
   page cannot disagree again. */
.tb-levels .lv-atomlabel { font-family: var(--font-display); font-size: 40px; font-weight: 500; fill: var(--paper); }
.tb-levels .lv-atomlabel-h { font-size: 28px; fill: var(--ink); }
/* On a coloured fill, stated after .lv-note so it wins the cascade at the same specificity. */
.tb-levels .lv-onfill { fill: var(--ink); }
/* Four notes name a thing the plate has already coloured — the protons and the arteries in coral, the
   electrons and the veins in water — and asked for that colour with a dead fill attribute. They are keyed
   to the drawing here instead, which is the whole reason a reader can read the plate without a legend.
   The -text values and not the accents: --coral as 11.5px type on the paper is 3.32:1 in the light theme,
   and spending a figure accent on type was the commonest defect the 2026-09-16 legibility census found,
   in six figures. --coral-text is 5.34:1 light and 8.84:1 dark, --water-text 5.24:1 and 8.27:1. */
.tb-levels .lv-coral { fill: var(--coral-text); }
.tb-levels .lv-water { fill: var(--water-text); }
/* The halo scale and tree use for a label over a drawing: the glyph gets its own ground, so the fill
   under it stops deciding whether the word can be read. */
.tb-levels .lv-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3px; stroke-linejoin: round; }
.tb-levels .lv-panel { position: absolute; left: 51%; top: 11%; width: 45%; pointer-events: none; }
.tb-levels .lv-kicker { font-size: max(9px, 1.15cqw); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-levels .lv-title { font-family: var(--font-display); font-weight: 500; font-size: max(18px, 4.2cqw); line-height: 1.05; letter-spacing: -0.015em; color: var(--ink); margin: 0.15em 0 0.3em; font-variation-settings: "SOFT" 50, "WONK" 0; }
.tb-levels .lv-size { display: flex; align-items: center; gap: 0.5em; font-size: max(9px, 1.4cqw); color: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.tb-levels .lv-size::before { content: ""; width: 0.55em; height: 0.55em; border-radius: 50%; background: var(--leaf); flex: none; }
.tb-levels .lv-new { margin-top: 1.6em; font-size: max(8px, 1.05cqw); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--leaf-text); }
.tb-levels .lv-what { font-family: var(--font-text); font-size: max(10px, 1.8cqw); line-height: 1.42; color: var(--ink); margin: 0.35em 0 0; max-width: 34ch; text-wrap: pretty; }
.tb-levels .lv-strip { position: absolute; left: var(--space-3); right: var(--space-3); bottom: calc(var(--space-3) + 2.6rem); display: flex; justify-content: center; gap: 0.9cqw; }
.tb-levels .lv-thumb { appearance: none; padding: 0; width: 6.3cqw; height: 6.3cqw; border-radius: 8px; border: 1px solid var(--rule-strong); background: var(--paper); cursor: pointer; overflow: hidden; transition: border-color var(--dur) var(--ease); }
.tb-levels .lv-thumb:hover { border-color: var(--ink-faint); }
.tb-levels .lv-thumb[aria-pressed="true"] { border-color: var(--leaf); outline: 2px solid var(--leaf); outline-offset: -1px; }
.tb-levels .lv-thumb:focus-visible { outline: 2px solid var(--water); outline-offset: 2px; }
.tb-levels .lv-thumb svg { display: block; width: 100%; height: 100%; }
.tb-levels .lv-thumb .lv-note, .tb-levels .lv-thumb .lv-atomlabel { display: none; }
.tb-levels .lv-range { flex: 1 1 6rem; max-width: 22rem; margin: 0 0.25rem; }
@container (max-width: 640px) {
  .tb-levels .lv-strip { display: none; }
  .tb-levels .lv-panel { top: 8%; }
  .tb-levels .lv-new { margin-top: 0.8em; }
  .tb-levels .lv-word { display: none; }
  .tb-levels .fig-btn { padding: 0.3rem 0.6rem; }
  /* The notes on the plate are set in viewBox units, so on a phone-width stage they land at about four
     device pixels: a grey smudge, not a word. The panel beside the plate says the same things in HTML
     type that scales, so the plate is left as a clean drawing instead — the same call the thumbnails
     already make. The letters on the water molecule are large enough to survive and stay. */
  .tb-levels .lv-note { display: none; }
}
`;

export function mount(root, ctx) {
  const ns = uid('lv');
  const wrap = h('div', { class: 'tb-levels' });
  wrap.append(h('style', { text: CSS }));

  const svg = el('svg', { class: 'tb-fill', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
  const plate = el('g', { transform: `translate(${PLATE.cx} ${PLATE.cy})` });
  plate.append(el('circle', { r: PLATE.r, fill: C.paper, stroke: C.ruleStrong, 'stroke-width': 1.2 }));
  const vigs = LEVELS.map((lv, i) => {
    const outer = el('g', { class: 'lv-vig' });
    const inner = el('g');
    lv.draw(inner, `${ns}-m${i}`);
    outer.append(inner);
    outer.style.opacity = i === 0 ? '1' : '0';
    outer.style.display = i === 0 ? '' : 'none';
    plate.append(outer);
    return { outer, inner };
  });
  svg.append(plate);
  wrap.append(svg);

  // Text panel
  const kicker = h('div', { class: 'lv-kicker' });
  const title = h('div', { class: 'lv-title' });
  const size = h('div', { class: 'lv-size' });
  const what = h('p', { class: 'lv-what' });
  const panel = h('div', { class: 'lv-panel', 'aria-live': 'polite' }, [kicker, title, size, h('div', { class: 'lv-new', text: 'New at this level' }), what]);
  wrap.append(panel);

  // Filmstrip of thumbnails
  const strip = h('div', { class: 'lv-strip', role: 'group', 'aria-label': 'Levels of organisation' });
  const thumbs = LEVELS.map((lv, i) => {
    const mini = el('svg', { viewBox: '-215 -215 430 430', 'aria-hidden': 'true' });
    const g = el('g');
    lv.draw(g, `${ns}-t${i}`);
    mini.append(g);
    const btn = h('button', { class: 'lv-thumb', type: 'button', 'aria-label': `Level ${i + 1}: ${lv.title}`, 'aria-pressed': 'false', title: lv.title }, [mini]);
    btn.addEventListener('click', () => go(i));
    strip.append(btn);
    return btn;
  });
  wrap.append(strip);

  // Toolbar: previous, scrubber, next
  const prev = h('button', { class: 'fig-btn', type: 'button', 'aria-label': 'Previous level' }, ['←', h('span', { class: 'lv-word', text: ' Previous' })]);
  const next = h('button', { class: 'fig-btn', type: 'button', 'aria-label': 'Next level' }, [h('span', { class: 'lv-word', text: 'Next ' }), '→']);
  const range = h('input', { class: 'fig-range lv-range', type: 'range', min: 0, max: LEVELS.length - 1, step: 1, value: 0, 'aria-label': 'Level of organisation' });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [prev, range, next]);
  wrap.append(toolbar);

  let current = 0;
  let running = null;

  function paintPanel(i) {
    const lv = LEVELS[i];
    kicker.textContent = `Level ${i + 1} of ${LEVELS.length}`;
    title.textContent = lv.title;
    size.textContent = lv.size;
    what.textContent = lv.what;
    range.value = String(i);
    range.setAttribute('aria-valuetext', lv.title);
    thumbs.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    prev.disabled = i === 0;
    next.disabled = i === LEVELS.length - 1;
  }

  function go(target) {
    const i = clamp(Math.round(target), 0, LEVELS.length - 1);
    if (i === current) {
      paintPanel(i);
      return;
    }
    if (running) running.finish();
    const from = current;
    current = i;
    const a = vigs[from];
    const b = vigs[i];
    b.outer.style.display = '';
    let swapped = false;
    running = tween({
      duration: FADE_MS,
      instant: ctx.reducedMotion,
      update(p) {
        a.outer.style.opacity = String(1 - p);
        a.inner.setAttribute('transform', `scale(${1 - 0.05 * p})`);
        b.outer.style.opacity = String(p);
        b.inner.setAttribute('transform', `scale(${1.05 - 0.05 * p})`);
        panel.style.opacity = String(Math.abs(1 - 2 * p));
        if (!swapped && p >= 0.5) {
          swapped = true;
          paintPanel(i);
        }
      },
      done() {
        a.outer.style.display = 'none';
        a.inner.setAttribute('transform', 'scale(1)');
        b.inner.setAttribute('transform', 'scale(1)');
        panel.style.opacity = '1';
        if (!swapped) paintPanel(i);
        running = null;
      },
    });
  }

  const onPrev = () => go(current - 1);
  const onNext = () => go(current + 1);
  const onRange = () => go(Number(range.value));
  const onKey = (e) => {
    if (e.target === range) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(LEVELS.length - 1); }
  };
  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);
  range.addEventListener('input', onRange);
  wrap.addEventListener('keydown', onKey);

  paintPanel(0);
  root.append(wrap);

  let readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      cancelAnimationFrame(readyRaf);
      if (running) running.cancel();
      wrap.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime() {
      if (running) running.finish();
    },
    setVisible() {},
    setTheme() {},
    describe() {
      return { level: current, title: LEVELS[current].title };
    },
  };
}
