// Small drawing helpers shared by the chapter's two flat figures (symbiont, cytoskeleton): a seeded
// generator, closed outlines built from a radial formula, and an inward offset of a closed outline so a
// membrane can be drawn as a band of real thickness rather than a stroke.
//
// Everything here is deterministic: no Date, no Math.random.

// The generator three-common.js uses, repeated here so a 2D figure need not import Three.js to get it.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// A closed outline as [x, y] points around (cx, cy).
//   p      superellipse exponent: 2 is an ellipse, 3 a rounded rectangle (a capsule seen side on)
//   bend   fraction of ry the outline bows by, so a mitochondrion is a bean and not a pill
//   taper  makes one end fatter than the other, so a chloroplast reads as a lens and not a sausage
//   rot    radians, applied last
export function outline(cx, cy, rx, ry, { n = 84, p = 2, bend = 0, taper = 0, rot = 0 } = {}) {
  const pts = [];
  const cs = Math.cos(rot);
  const sn = Math.sin(rot);
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const k = 2 / p;
    let x = Math.sign(ca) * Math.abs(ca) ** k;
    let y = Math.sign(sa) * Math.abs(sa) ** k * (1 + taper * ca);
    y += bend * (x * x - 0.5);
    pts.push([cx + (x * rx) * cs - (y * ry) * sn, cy + (x * rx) * sn + (y * ry) * cs]);
  }
  return pts;
}

// The same closed outline moved inward by `d` along its own normal. Exact enough for the smooth convex
// shapes here, and it keeps a membrane band an even thickness all the way round, which offsetting by a
// scale factor about the centre does not.
export function insetOutline(points, d) {
  const n = points.length;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const [px, py] = points[(i - 1 + n) % n];
    const [qx, qy] = points[(i + 1) % n];
    const tx = qx - px;
    const ty = qy - py;
    const len = Math.hypot(tx, ty) || 1;
    // Outward normal for a counter-clockwise outline in screen coordinates (y down).
    const nx = ty / len;
    const ny = -tx / len;
    out.push([points[i][0] - nx * d, points[i][1] - ny * d]);
  }
  return out;
}

// The centroid of a closed outline, for placing something in the middle of a shape that is not an
// ellipse.
export function centroid(points) {
  let x = 0;
  let y = 0;
  for (const [px, py] of points) { x += px; y += py; }
  return [x / points.length, y / points.length];
}

// True when (x, y) is inside the closed polygon: used to scatter ribosomes inside a matrix without
// having them land in the membrane.
export function inside(points, x, y) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// `count` seeded points inside a closed outline, each at least `gap` from the outline's own edge.
export function scatterInside(points, count, rng, gap = 0) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const room = gap > 0 ? insetOutline(points, gap) : points;
  const out = [];
  for (let tries = 0; out.length < count && tries < count * 60; tries += 1) {
    const x = x0 + rng() * (x1 - x0);
    const y = y0 + rng() * (y1 - y0);
    if (inside(room, x, y)) out.push([x, y]);
  }
  return out;
}

// A closed wobbly loop of radius r about (cx, cy) — a plasmid, or a circle of organelle DNA.
export function loopPoints(cx, cy, r, rng, { n = 26, wobble = 0.22, squash = 0.78 } = {}) {
  const phase = rng() * Math.PI * 2;
  const k1 = 2 + Math.floor(rng() * 2);
  const k2 = 3 + Math.floor(rng() * 3);
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + wobble * (Math.sin(k1 * a + phase) * 0.6 + Math.cos(k2 * a - phase) * 0.4));
    pts.push([cx + rr * Math.cos(a), cy + rr * squash * Math.sin(a)]);
  }
  return pts;
}
