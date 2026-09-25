// Shared helpers for the chapter-3 cell figures (microscopes, surface-volume, prokaryote, secretion):
// a seeded generator, the small maths every one of them repeats, canvas path helpers for organic
// outlines, number formatting for readouts, and the one panel stylesheet the four figures share so a
// readout in one looks like a readout in another.
//
// Nothing here draws a colour of its own: every colour is passed in from `ctx.palette`, from
// `ORGANELLES`, or from `cell-colours.js`.

// ---------- determinism ----------

// The fleet's seeded generator. No figure in this chapter calls Math.random.
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

// A stateless hash in [0, 1) from two integers, for a per-item jitter that must be the same at every
// frame rate and on every machine: a function of (item, tick) rather than a stream.
export function hash2(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x165667b1, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2545f491);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// ---------- maths ----------

export const TAU = Math.PI * 2;
export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (x) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
// Rising 0 -> 1 as x goes from a to b. a may be greater than b, for a falling edge.
export const ramp = (x, a, b) => smoothstep((x - a) / (b - a));
export const easeOut = (t) => 1 - (1 - clamp01(t)) ** 3;
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

// ---------- canvas ----------

export const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

// Size a canvas to w x h CSS pixels at the device ratio and leave its context in CSS-pixel units.
// Returns true when the backing store actually changed, so a caller can skip work.
export function fitCanvas(canvas, w, h, dprCap = 2) {
  const dpr = Math.min(dprCap, window.devicePixelRatio || 1);
  const bw = Math.max(1, Math.round(w * dpr));
  const bh = Math.max(1, Math.round(h * dpr));
  const changed = canvas.width !== bw || canvas.height !== bh;
  if (changed) {
    canvas.width = bw;
    canvas.height = bh;
  }
  return { changed, dpr };
}

// The corner radius is floored at zero: a caller scales it with its drawing, a drawing squeezed past its
// own padding hands in a negative one, and arcTo throws on a negative radius.
export function roundRectPath(g, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  g.beginPath();
  g.moveTo(x + rr, y);
  g.lineTo(x + w - rr, y);
  g.arcTo(x + w, y, x + w, y + rr, rr);
  g.lineTo(x + w, y + h - rr);
  g.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  g.lineTo(x + rr, y + h);
  g.arcTo(x, y + h, x, y + h - rr, rr);
  g.lineTo(x, y + rr);
  g.arcTo(x, y, x + rr, y, rr);
  g.closePath();
}

// A closed smooth path through points, Catmull-Rom turned into cubic Béziers. The organic outline
// every cell in this chapter is drawn from.
export function smoothClosed(g, pts, tension = 6) {
  const n = pts.length;
  if (n < 3) return;
  const at = (i) => pts[(i + n) % n];
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    g.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / tension, p1[1] + (p2[1] - p0[1]) / tension,
      p2[0] - (p3[0] - p1[0]) / tension, p2[1] - (p3[1] - p1[1]) / tension,
      p2[0], p2[1],
    );
  }
  g.closePath();
}

// The same, open: the first and last points are ends rather than neighbours.
export function smoothOpen(g, pts, tension = 6, moveTo = true) {
  const n = pts.length;
  if (n < 2) return;
  const at = (i) => pts[clamp(i, 0, n - 1)];
  if (moveTo) g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    g.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / tension, p1[1] + (p2[1] - p0[1]) / tension,
      p2[0] - (p3[0] - p1[0]) / tension, p2[1] - (p3[1] - p1[1]) / tension,
      p2[0], p2[1],
    );
  }
}

// An irregular closed outline: `n` points on a radius modulated by three harmonics, then scaled along
// x and y. Seeded from the phases handed in, so the same cell is the same shape on every machine.
export function blobPoints(n, rx, ry, phases, amps = [0.16, 0.09, 0.05]) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * TAU;
    const k = 1
      + amps[0] * Math.sin(3 * a + phases[0])
      + amps[1] * Math.sin(5 * a + phases[1])
      + amps[2] * Math.sin(8 * a + phases[2]);
    pts.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]);
  }
  return pts;
}

// Rotate and translate a list of points in place-free fashion.
export function place(pts, cx, cy, rot) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}

// A capsule: a thick round-capped line through the points. Used for mitochondria, flagella and vesicle
// necks, all of which are tubes rather than outlines.
export function capsule(g, pts, width, tension = 6) {
  g.beginPath();
  smoothOpen(g, pts, tension);
  g.lineWidth = width;
  g.lineCap = 'round';
  g.lineJoin = 'round';
}

// ---------- numbers for readouts ----------

export function sigFigs(v, n = 3) {
  if (!Number.isFinite(v) || v === 0) return 0;
  // toPrecision, not a power-of-ten round trip: 6.59e7 rounded through 1e-5 comes back as
  // 65899999.99999999, and a describe() field that reports that is reporting noise.
  return Number(v.toPrecision(n));
}

// A number a reader can hold: thousands separated below a million, then a mantissa and a power of ten.
export function human(v, digits = 3) {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a === 0) return '0';
  if (a >= 1e6 || a < 1e-3) {
    const e = Math.floor(Math.log10(a));
    const m = v / 10 ** e;
    return `${m.toFixed(Math.max(0, digits - 1))} × 10${superscript(e)}`;
  }
  const r = sigFigs(v, digits);
  return r >= 1000 ? r.toLocaleString('en-GB') : String(r);
}

const SUPER = { '-': '−', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function superscript(n) {
  return String(n).split('').map((c) => SUPER[c] ?? c).join('');
}

// A duration in the unit a reader would actually say it in.
export function humanSeconds(s) {
  if (!Number.isFinite(s)) return '—';
  if (s < 1e-3) return `${sigFigs(s * 1e6, 2)} µs`;
  if (s < 1) return `${sigFigs(s * 1e3, 2)} ms`;
  if (s < 90) return `${sigFigs(s, 2)} s`;
  if (s < 5400) return `${sigFigs(s / 60, 2)} min`;
  return `${sigFigs(s / 3600, 2)} h`;
}

// ---------- the shared panel stylesheet ----------

// One readout vocabulary for the four figures, so a label in the microscope panel is set exactly like a
// label in the secretion panel. `scope` is the figure's own root class, so nothing leaks between them.
export function panelCss(scope) {
  return `
.${scope} { position: absolute; inset: 0; font-family: var(--font-ui); color: var(--ink); }
.${scope} .cl-panel { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.${scope} .cl-head { font-size: 9.5px; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase; color: var(--ink-faint); margin: 0; }
.${scope} .cl-title { font-family: var(--font-display); font-size: 15px; font-weight: 500; line-height: 1.15; margin: 0; color: var(--ink); }
.${scope} .cl-note { font-size: 11px; line-height: 1.35; color: var(--ink-soft); margin: 0; text-wrap: pretty; }
.${scope} .cl-row { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5em; font-size: 11.5px; color: var(--ink-soft); }
.${scope} .cl-row > .cl-val { color: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; white-space: nowrap; }
.${scope} .cl-big { font-size: 20px; font-weight: 600; line-height: 1.05; font-variant-numeric: lining-nums tabular-nums; color: var(--ink); }
.${scope} .cl-unit { font-size: 11px; font-weight: 500; color: var(--ink-soft); }
.${scope} .cl-slider { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 0 0.5em; }
.${scope} .cl-slider label { font-size: 11px; color: var(--ink-soft); }
.${scope} .cl-slider .cl-val { font-size: 11.5px; font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
/* A slider's box is 24px tall, the WCAG minimum target, and pulls the extra height back into the gaps
   around it with negative margins so the panel's rhythm is the track's, not the hit area's. */
.${scope} .cl-slider input { grid-column: 1 / -1; width: 100%; margin: -3px 0 -4px; accent-color: var(--leaf); height: 24px; }
.${scope} input[type="range"]:focus-visible { outline-offset: -3px; }
.${scope} .cl-group { display: flex; flex-wrap: wrap; gap: 0.3rem; }
/* 11px type, 0.36rem above and below and a 1px border: 24.5px tall, the minimum target size. */
.${scope} .cl-mini { appearance: none; font-family: var(--font-ui); font-size: 11px; font-weight: 500; line-height: 1; color: var(--ink); background: color-mix(in srgb, var(--paper) 80%, transparent); border: 1px solid var(--rule-strong); border-radius: 999px; padding: 0.36rem 0.62rem; cursor: pointer; transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease); }
/* :not([aria-pressed="true"]) is load-bearing. Without it the hover rule (three simple selectors) beats
   the pressed rule (two) on background only, so a pressed button under the pointer kept its paper-coloured
   text and lost its dark ground: a blank pill. Caught in a screenshot, not by a gate. */
.${scope} .cl-mini:hover:not(:disabled):not([aria-pressed="true"]) { background: var(--paper); border-color: var(--ink-faint); }
.${scope} .cl-mini[aria-pressed="true"]:hover:not(:disabled) { background: color-mix(in srgb, var(--leaf-text) 86%, var(--ink)); }
.${scope} .cl-mini[aria-pressed="true"] { background: var(--leaf-text); border-color: var(--leaf-text); color: var(--paper); }
.${scope} .cl-mini:disabled { opacity: 0.42; cursor: default; }
.${scope} .cl-mini.is-warn[aria-pressed="true"] { background: var(--coral-text); border-color: var(--coral-text); }
.${scope} .cl-bar { position: relative; height: 7px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 9%, transparent); overflow: hidden; }
.${scope} .cl-bar > i { position: absolute; inset: 0 auto 0 0; display: block; border-radius: 999px; transition: width var(--dur) var(--ease), background var(--dur) var(--ease); }
.${scope} .cl-rule { height: 1px; background: var(--rule); border: 0; margin: 0; }
.${scope} canvas { display: block; outline: none; }
.${scope} canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
.${scope} .fig-toolbar { justify-content: flex-start; }
.${scope} .cl-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
`;
}
