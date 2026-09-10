// A drop of pond water: the chapter opener. A generative 2D canvas that looks like a microscope's field
// of view, with paramecia, euglena, diatoms, amoebae, volvox colonies and bacteria drifting through it,
// and a paramecium dividing every twelve seconds or so.
//
// Every frame is a pure function of the clock t: paths are ellipses plus sums of sines, cilia and
// flagella beat with phase t × frequency, and the fissions are scheduled at fixed clock times, so
// setTime(t) shows the same frame on every machine. The only randomness is a seeded PRNG used once,
// at mount, to lay the organisms out.

import { mix, alpha } from '../palette.js';

export const meta = { kind: 'pond', title: 'A drop of pond water', needsWebGL: false, aspect: 21 / 9 };

// Logical field: 21:9, drawn scaled to the stage. All sizes below are in these units.
const W = 1050;
const H = 450;
const SEED = 20260908;
const TAU = Math.PI * 2;

// Binary fission schedule: fission k starts at FISSION_FIRST + k × FISSION_EVERY seconds and lasts
// FISSION_LENGTH seconds; paramecium (k mod count) divides. The daughter swims off and fades over
// DAUGHTER_LIFE seconds so the population stays put.
const FISSION_FIRST = 11;
const FISSION_EVERY = 12;
const FISSION_LENGTH = 4;
const DAUGHTER_LIFE = 10;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- layout: the organisms, laid out once with the seeded PRNG ----------

function buildWorld(rand) {
  const range = (a, b) => a + (b - a) * rand();
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const sign = () => (rand() < 0.5 ? -1 : 1);

  // A slow elliptical orbit with two smaller sinusoidal wobbles: the velocity never vanishes, so the
  // heading (taken from the velocity) never flips.
  const orbit = (cx, cy, rx, ry, period, wob) => ({
    cx, cy, rx, ry,
    w: sign() * (TAU / period),
    phase: rand() * TAU,
    ax: wob * range(0.6, 1), wx: TAU / range(9, 17), px: rand() * TAU,
    ay: wob * range(0.6, 1), wy: TAU / range(9, 17), py: rand() * TAU,
  });

  // Orbit centres, listed so that the first fissions fall on cells near the middle of the field; the
  // radii are capped so no orbit leaves the field.
  const paramecia = [];
  const slots = [[430, 130], [640, 320], [200, 120], [860, 320], [640, 120], [420, 330], [200, 330], [860, 120]];
  slots.forEach(([sx, sy], i) => {
    const L = range(98, 126);
    const cx = sx + range(-30, 30);
    const cy = sy + range(-15, 15);
    const rx = Math.min(range(110, 170), cx - 70, W - 70 - cx);
    const ry = Math.min(range(55, 85), cy - 55, H - 55 - cy);
    paramecia.push({
      L,
      width: L * range(0.36, 0.42),
      orbit: orbit(cx, cy, rx, ry, range(48, 75), 22),
      ciliaPhase: rand() * TAU,
      spin: TAU / range(5, 8),
      spinPhase: rand() * TAU,
      focus: range(0.75, 1),
      vacuoles: Array.from({ length: 4 }, () => [range(-0.3, 0.25), range(-0.3, 0.3), range(0.024, 0.036)]),
      index: i,
    });
  });

  const euglena = [[300, 210], [560, 215], [800, 220], [120, 250]].map(([sx, sy]) => {
    const L = range(52, 66);
    return {
      L,
      width: L * range(0.26, 0.31),
      orbit: orbit(sx + range(-30, 30), sy + range(-20, 20), range(120, 180), range(60, 90), range(30, 48), 14),
      phase: rand() * TAU,
      focus: range(0.8, 1),
      chloroplasts: Array.from({ length: 9 }, () => [range(-0.36, 0.36), range(-0.55, 0.55), rand() * Math.PI]),
    };
  });

  const diatoms = [];
  const dslots = [[80, 400], [330, 40], [590, 415], [990, 60], [760, 45], [1000, 380], [450, 400]];
  dslots.forEach(([sx, sy], i) => {
    const kind = i % 3 === 2 ? 'centric' : 'pennate';
    diatoms.push({
      kind,
      L: kind === 'pennate' ? range(46, 74) : range(40, 58),
      ratio: range(0.18, 0.26),
      round: rand() < 0.5,
      cx: sx + range(-25, 25), cy: sy + range(-15, 15),
      heading: rand() * TAU,
      turn: sign() * (TAU / range(140, 260)),
      glide: range(14, 22), glideW: TAU / range(24, 40), glidePhase: rand() * TAU,
      drift: orbit(0, 0, range(10, 18), range(6, 12), range(50, 90), 0),
      focus: range(0.7, 1),
    });
  });

  const amoebae = [[860, 380], [230, 60]].map(([sx, sy], i) => ({
    R: i === 0 ? 42 : 34,
    cx: sx, cy: sy,
    drift: orbit(0, 0, range(18, 26), range(12, 18), range(60, 90), 0),
    harmonics: [
      [0.10, 2, range(0.09, 0.13), rand() * TAU],
      [0.07, 3, range(0.07, 0.11), rand() * TAU],
      [0.05, 5, range(0.12, 0.18), rand() * TAU],
    ],
    pods: Array.from({ length: 3 }, (_, k) => ({
      theta: (k / 3) * TAU + range(-0.4, 0.4),
      period: range(16, 26),
      phase: rand() * TAU,
      width: range(0.32, 0.45),
      height: range(0.45, 0.65),
    })),
    nucleus: [range(-0.25, 0.25), range(-0.25, 0.25), rand() * Math.PI],
    granules: Array.from({ length: 16 }, () => [range(-0.55, 0.55), range(-0.55, 0.55), rand() * TAU]),
    focus: range(0.85, 1),
  }));

  const volvox = [[640, 330], [380, 130]].map(([sx, sy], i) => {
    const n = i === 0 ? 170 : 130;
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let k = 0; k < n; k += 1) {
      const y = 1 - (2 * (k + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const a = golden * k;
      points.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    return {
      R: i === 0 ? 38 : 30,
      cx: sx, cy: sy,
      points,
      tilt: range(0.35, 0.7),
      spin: sign() * (TAU / range(34, 48)),
      spinPhase: rand() * TAU,
      drift: orbit(0, 0, range(30, 45), range(18, 26), range(45, 70), 0),
      daughters: Array.from({ length: 4 }, () => {
        const th = rand() * TAU;
        const ph = Math.acos(range(-0.8, 0.8));
        return [Math.sin(ph) * Math.cos(th) * 0.5, Math.cos(ph) * 0.5, Math.sin(ph) * Math.sin(th) * 0.5];
      }),
      focus: range(0.85, 1),
    };
  });

  const bacteria = Array.from({ length: 36 }, () => ({
    cx: range(30, W - 30), cy: range(20, H - 20),
    L: range(5.5, 9), width: range(2, 2.6),
    cocci: rand() < 0.2,
    heading: rand() * TAU,
    turn: sign() * (TAU / range(20, 60)),
    drift: orbit(0, 0, range(14, 34), range(10, 24), range(14, 40), 0),
    j: [range(25, 38), rand() * TAU, range(14, 20), rand() * TAU, range(22, 34), rand() * TAU, range(15, 21), rand() * TAU, range(20, 30), rand() * TAU],
    focus: range(0.6, 1),
    tone: pick(['ink', 'ink', 'ink', 'soft']),
  }));

  return { paramecia, euglena, diatoms, amoebae, volvox, bacteria };
}

// Position and velocity on an orbit at time t.
function onOrbit(o, t) {
  const a = o.w * t + o.phase;
  return {
    x: o.cx + o.rx * Math.cos(a) + o.ax * Math.sin(o.wx * t + o.px),
    y: o.cy + o.ry * Math.sin(a) + o.ay * Math.sin(o.wy * t + o.py),
    vx: -o.rx * o.w * Math.sin(a) + o.ax * o.wx * Math.cos(o.wx * t + o.px),
    vy: o.ry * o.w * Math.cos(a) + o.ay * o.wy * Math.cos(o.wy * t + o.py),
  };
}

// ---------- fission schedule ----------

// The paramecium that divides in fission k.
const fissionCell = (k, count) => k % count;

// Fissions that belong to paramecium i and have started by time t, most recent last.
function fissionsOf(i, count, t) {
  const out = [];
  for (let k = i; ; k += count) {
    const at = FISSION_FIRST + k * FISSION_EVERY;
    if (at > t) break;
    out.push(at);
  }
  return out;
}

// The path clock of paramecium i: it stops swimming while it divides, so subtract the time spent.
function pathTime(i, count, t) {
  let pt = t;
  for (const at of fissionsOf(i, count, t)) pt -= Math.min(FISSION_LENGTH, t - at);
  return pt;
}

// ---------- outlines ----------

// A paramecium outline in body coordinates (+x is the anterior). `elong` stretches the length,
// `pinch` (0..1) constricts the middle, for fission. Returns points with outward normals and tangents.
function parameciumOutline(L, width, n, elong = 1, pinch = 0) {
  const pts = [];
  const a = (L * elong) / 2;
  const b = width / 2;
  for (let k = 0; k < n; k += 1) {
    const th = (k / n) * TAU;
    const u = Math.cos(th);
    const s = Math.sin(th);
    const p = 0.85 - 0.15 * u; // the anterior end is blunter, the posterior more pointed
    let h = b * Math.pow(Math.abs(s), p) * (1 - 0.08 * u);
    if (s > 0) h -= b * 0.11 * Math.exp(-(((u - 0.3) / 0.3) ** 2)) * Math.sqrt(Math.abs(s)); // oral groove
    if (pinch > 0) h *= 1 - pinch * Math.exp(-((u / 0.3) ** 2));
    pts.push({ x: u * a, y: s >= 0 ? h : -h });
  }
  for (let k = 0; k < n; k += 1) {
    const p0 = pts[(k + n - 1) % n];
    const p1 = pts[(k + 1) % n];
    let tx = p1.x - p0.x;
    let ty = p1.y - p0.y;
    const m = Math.hypot(tx, ty) || 1;
    tx /= m;
    ty /= m;
    pts[k].tx = tx;
    pts[k].ty = ty;
    pts[k].nx = ty;
    pts[k].ny = -tx;
  }
  return pts;
}

function tracePath(g, pts) {
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let k = 1; k < pts.length; k += 1) g.lineTo(pts[k].x, pts[k].y);
  g.closePath();
}

// ---------- the figure ----------

export function mount(root, ctx) {
  const rand = mulberry32(SEED);
  const world = buildWorld(rand);
  const nP = world.paramecia.length;

  let palette = ctx.palette;
  let theme = ctx.theme;
  let colors = null;

  const reduced = Boolean(ctx.reducedMotion);
  let t = ctx.pinnedTime ?? 0;
  let playing = !reduced && ctx.pinnedTime === null;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  let lastFrameMs = 0;

  // ----- DOM -----
  const style = document.createElement('style');
  style.textContent = `
    .tb-pond { position: absolute; inset: 0; }
    .tb-pond canvas { display: block; width: 100%; height: 100%; outline: none; }
    .tb-pond canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
    .tb-pond .fig-toolbar { justify-content: flex-end; }
  `;
  const wrap = document.createElement('div');
  wrap.className = 'tb-pond';
  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Pond water under a microscope: paramecia, euglena, diatoms, amoebae, volvox and bacteria drifting; now and then a paramecium divides in two. Space pauses or plays; the arrow keys step time.');
  const toolbar = document.createElement('div');
  toolbar.className = 'fig-toolbar fig-ui';
  const chip = document.createElement('span');
  chip.className = 'fig-chip';
  chip.textContent = 'pond water · not to scale';
  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'fig-btn';
  toolbar.append(chip, playBtn);
  wrap.append(canvas, toolbar);
  root.append(style, wrap);

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('the pond needs a 2D canvas context and this browser gave none'));
    return { destroy() {}, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // ----- sizing -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let scale = 1;
  let ox = 0;
  let oy = 0;
  let fieldGradient = null;
  let vignette = null;

  function resize() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (!w || !h) return false;
    const nextDpr = Math.min(2, window.devicePixelRatio || 1);
    if (w !== cw || h !== ch || nextDpr !== dpr) {
      cw = w;
      ch = h;
      dpr = nextDpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      scale = Math.min(cw / W, ch / H);
      ox = (cw - W * scale) / 2;
      oy = (ch - H * scale) / 2;
      fieldGradient = null;
      vignette = null;
    }
    return true;
  }

  // ----- colours -----
  function buildColors() {
    const p = palette;
    const dark = theme === 'dark';
    const goldBrown = mix(p.gold, p.coral, dark ? 0.2 : 0.35);
    colors = {
      dark,
      fieldCentre: dark ? mix(p.paper, p.water, 0.09) : mix(p.paper, '#ffffff', 0.7),
      fieldMid: dark ? mix(p.paper, '#000000', 0.25) : p.paper,
      rim: dark ? mix(p.paper, '#000000', 0.55) : mix(p.paper3, p.ink, 0.62),
      glow: dark ? 0.16 : 0,
      para: { fill: alpha(p.water, dark ? 0.2 : 0.13), line: alpha(p.water, dark ? 0.85 : 0.62), cilia: alpha(p.water, dark ? 0.55 : 0.42), glow: alpha(p.water, 0.14) },
      eug: { fill: alpha(p.leaf, dark ? 0.22 : 0.15), line: alpha(p.leaf, dark ? 0.9 : 0.66), flag: alpha(p.leaf, dark ? 0.7 : 0.55), chloro: alpha(p.leaf, dark ? 0.7 : 0.5), eye: alpha(p.coral, 0.9), glow: alpha(p.leaf, 0.14) },
      dia: { fill: alpha(goldBrown, dark ? 0.22 : 0.16), line: alpha(goldBrown, dark ? 0.9 : 0.7), striae: alpha(goldBrown, dark ? 0.5 : 0.38), glow: alpha(goldBrown, 0.14) },
      amo: { fill: alpha(p.ink, dark ? 0.1 : 0.06), inner: alpha(p.ink, dark ? 0.08 : 0.05), line: alpha(p.ink, dark ? 0.7 : 0.42), granule: alpha(p.ink, dark ? 0.5 : 0.32), glow: alpha(p.ink, 0.12) },
      vol: { fill: alpha(p.leaf, dark ? 0.08 : 0.05), line: alpha(p.leaf, dark ? 0.5 : 0.32), front: alpha(p.leaf, dark ? 0.85 : 0.62), back: alpha(p.leaf, dark ? 0.3 : 0.2), daughter: alpha(p.leaf, dark ? 0.3 : 0.18), glow: alpha(p.leaf, 0.14) },
      bac: { ink: alpha(p.ink, dark ? 0.6 : 0.42), soft: alpha(p.inkSoft, dark ? 0.55 : 0.4) },
      nucleus: alpha(p.violet, dark ? 0.45 : 0.24),
      nucleusLine: alpha(p.violet, dark ? 0.7 : 0.4),
      detail: alpha(p.ink, dark ? 0.45 : 0.28),
      detailFaint: alpha(p.ink, dark ? 0.3 : 0.16),
      vacuole: alpha(p.gold, dark ? 0.35 : 0.2),
      clear: alpha(p.paper, dark ? 0.15 : 0.5),
    };
  }
  buildColors();

  // ----- drawing helpers -----
  const px = () => 1 / scale; // one CSS pixel in logical units

  function strokeGlow(color, widthPx) {
    if (!colors.dark) return;
    g.strokeStyle = color;
    g.lineWidth = widthPx * px();
    g.stroke();
  }

  function drawParameciumBody(o, elong, pinch, ciliaT, alphaMul, ctxColors) {
    const pts = parameciumOutline(o.L, o.width, 72, elong, pinch);
    const c = ctxColors;
    g.globalAlpha = alphaMul;
    // cilia: one path, a metachronal wave running around the outline
    const len = o.L * 0.048;
    g.beginPath();
    for (let k = 0; k < pts.length; k += 1) {
      const p = pts[k];
      const beta = 0.8 * Math.sin(ciliaT * TAU * 2.2 - (k / pts.length) * TAU * 3.5 + o.ciliaPhase);
      const cb = Math.cos(beta);
      const sb = Math.sin(beta);
      g.moveTo(p.x, p.y);
      g.lineTo(p.x + len * (cb * p.nx + sb * p.tx), p.y + len * (cb * p.ny + sb * p.ty));
    }
    g.strokeStyle = c.cilia;
    g.lineWidth = 0.9 * px();
    g.stroke();
    // body
    tracePath(g, pts);
    g.fillStyle = c.fill;
    g.fill();
    strokeGlow(c.glow, 5);
    g.strokeStyle = c.line;
    g.lineWidth = 1 * px();
    g.stroke();
    return pts;
  }

  function drawParameciumInterior(o, elong, pinch, tt, alphaMul) {
    const L = o.L * elong;
    const b = o.width / 2;
    g.globalAlpha = alphaMul;
    // oral groove: a shallow curve from the anterior ventral edge to the mouth near the middle
    g.beginPath();
    g.moveTo(0.34 * L, 0.72 * b);
    g.quadraticCurveTo(0.18 * L, 0.5 * b, 0.02 * L, 0.14 * b);
    g.strokeStyle = colors.detail;
    g.lineWidth = 1.1 * px();
    g.stroke();
    // macronucleus: stretches along the axis and splits during fission
    const stretch = 1 + 1.4 * smooth((pinch - 0.05) / 0.5);
    const split = smooth((pinch - 0.55) / 0.35);
    const drawNucleus = (cx, sx) => {
      g.beginPath();
      g.ellipse(cx, 0.03 * b, 0.13 * o.L * sx, 0.075 * o.L, 0.25, 0, TAU);
      g.fillStyle = colors.nucleus;
      g.fill();
      g.strokeStyle = colors.nucleusLine;
      g.lineWidth = 0.8 * px();
      g.stroke();
    };
    if (split <= 0) drawNucleus(-0.02 * L, stretch);
    else {
      const off = 0.22 * L * split;
      drawNucleus(-0.02 * L - off, lerp(stretch, 1, split));
      drawNucleus(-0.02 * L + off, lerp(stretch, 1, split));
    }
    // micronucleus
    g.beginPath();
    g.arc(0.08 * L, -0.12 * b, 0.02 * o.L, 0, TAU);
    g.fillStyle = colors.nucleusLine;
    g.fill();
    // contractile vacuoles, pulsing slowly, with their radial canals
    for (const [vx, vy, ph] of [[0.3, -0.42, 0], [-0.32, -0.4, 2.1]]) {
      const r = 0.042 * o.L * (0.75 + 0.25 * Math.sin(tt * TAU / 5.5 + ph));
      g.beginPath();
      g.arc(vx * L, vy * b, r, 0, TAU);
      g.fillStyle = colors.clear;
      g.fill();
      g.strokeStyle = colors.detail;
      g.lineWidth = 0.8 * px();
      g.stroke();
      g.beginPath();
      for (let k = 0; k < 6; k += 1) {
        const a = (k / 6) * TAU + 0.4;
        g.moveTo(vx * L + Math.cos(a) * r, vy * b + Math.sin(a) * r);
        g.lineTo(vx * L + Math.cos(a) * r * 2.1, vy * b + Math.sin(a) * r * 2.1);
      }
      g.strokeStyle = colors.detailFaint;
      g.stroke();
    }
    // food vacuoles
    for (const [fx, fy, fr] of o.vacuoles) {
      g.beginPath();
      g.arc(fx * L, fy * b, fr * o.L, 0, TAU);
      g.fillStyle = colors.vacuole;
      g.fill();
      g.strokeStyle = colors.detailFaint;
      g.lineWidth = 0.8 * px();
      g.stroke();
    }
  }

  // Draw one paramecium (or one of its daughters) at a pose. `elong`/`pinch` shape the body.
  function drawParamecium(o, x, y, heading, widthMod, elong, pinch, tt, alphaMul, showInterior = true) {
    g.save();
    g.translate(x, y);
    g.rotate(heading);
    g.scale(1, widthMod);
    drawParameciumBody(o, elong, pinch, tt, alphaMul * o.focus, colors.para);
    if (showInterior) drawParameciumInterior(o, elong, pinch, tt, alphaMul * o.focus);
    g.restore();
  }

  let dividing = null;

  function drawParamecia(tt) {
    world.paramecia.forEach((o, i) => {
      const pt = pathTime(i, nP, tt);
      const pos = onOrbit(o.orbit, pt);
      const heading = Math.atan2(pos.vy, pos.vx);
      const widthMod = 1 + 0.07 * Math.sin(o.spin * tt + o.spinPhase); // rolling about its long axis
      const fissions = fissionsOf(i, nP, tt);
      const at = fissions.length ? fissions[fissions.length - 1] : null;
      const since = at === null ? Infinity : tt - at;
      if (at !== null && since < FISSION_LENGTH) {
        // dividing: elongate, pinch, then two cells drawing apart
        const p = since / FISSION_LENGTH;
        const elong = 1 + 0.42 * smooth(p / 0.55);
        const pinch = smooth((p - 0.2) / 0.6);
        dividing = { index: i, progress: Number(p.toFixed(3)) };
        if (p < 0.8) {
          drawParamecium(o, pos.x, pos.y, heading, widthMod, elong, pinch, tt, 1);
        } else {
          const q = (p - 0.8) / 0.2;
          const half = { ...o, L: o.L * elong * 0.5, width: o.width * lerp(0.9, 1, q) };
          const sep = o.L * elong * 0.25 + o.L * 0.12 * smooth(q);
          const wob = 0.12 * Math.sin(q * Math.PI);
          const c = Math.cos(heading);
          const s = Math.sin(heading);
          drawParamecium(half, pos.x + c * sep, pos.y + s * sep, heading + wob, widthMod, 1, 0, tt, 1, true);
          drawParamecium(half, pos.x - c * sep, pos.y - s * sep, heading - wob, widthMod, 1, 0, tt, 1, true);
        }
        return;
      }
      // regrow after a division
      const regrow = at === null ? 1 : lerp(0.72, 1, smooth((since - FISSION_LENGTH) / 22));
      drawParamecium(o, pos.x, pos.y, heading, widthMod, regrow, 0, tt, 1);
      // the daughter swims off backwards along the mother's heading and fades at the rim
      if (at !== null && since < FISSION_LENGTH + DAUGHTER_LIFE) {
        const age = since - FISSION_LENGTH;
        const dh = heading + Math.PI + 0.35 * Math.sin(age * 0.9) * smooth(age / 2);
        const dist = o.L * 0.37 + 30 * age;
        const dx = pos.x + Math.cos(heading + Math.PI) * dist + Math.sin(age * 1.3) * 6;
        const dy = pos.y + Math.sin(heading + Math.PI) * dist + Math.cos(age * 1.1) * 6;
        const fade = 1 - smooth((age - DAUGHTER_LIFE + 3.5) / 3.5);
        const grow = lerp(0.72, 1, smooth(age / 22));
        drawParamecium(o, dx, dy, dh, widthMod, grow, 0, tt, fade);
      }
    });
  }

  function drawEuglena(tt) {
    for (const o of world.euglena) {
      const pos = onOrbit(o.orbit, tt);
      const heading = Math.atan2(pos.vy, pos.vx);
      const roll = 1 + 0.1 * Math.sin(tt * TAU / 2.6 + o.phase);
      g.save();
      g.translate(pos.x, pos.y);
      g.rotate(heading);
      g.scale(1, roll);
      g.globalAlpha = o.focus;
      const a = o.L / 2;
      const b = o.width / 2;
      // flagellum, whipping from the anterior tip
      g.beginPath();
      const n = 26;
      for (let k = 0; k <= n; k += 1) {
        const s = k / n;
        const along = a + s * o.L * 1.05;
        const lat = 0.2 * o.L * Math.pow(s, 0.8) * Math.sin(TAU * 1.3 * s - tt * TAU * 2.4 + o.phase);
        if (k === 0) g.moveTo(along, 0);
        else g.lineTo(along, lat);
      }
      g.strokeStyle = colors.eug.flag;
      g.lineWidth = 1 * px();
      g.stroke();
      // body: a spindle, blunt at the front, drawn to a point behind
      g.beginPath();
      const m = 44;
      for (let k = 0; k < m; k += 1) {
        const th = (k / m) * TAU;
        const u = Math.cos(th);
        const s = Math.sin(th);
        const p = 0.9 - 0.3 * u;
        const h = b * Math.pow(Math.abs(s), p) * (1 + 0.06 * u);
        const x = u * a;
        const y = s >= 0 ? h : -h;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fillStyle = colors.eug.fill;
      g.fill();
      strokeGlow(colors.eug.glow, 5);
      g.strokeStyle = colors.eug.line;
      g.lineWidth = 1 * px();
      g.stroke();
      // chloroplasts
      g.fillStyle = colors.eug.chloro;
      for (const [cx, cy, rot] of o.chloroplasts) {
        g.beginPath();
        g.ellipse(cx * o.L, cy * b, o.L * 0.055, o.L * 0.022, rot, 0, TAU);
        g.fill();
      }
      // nucleus
      g.beginPath();
      g.arc(-0.1 * o.L, 0, o.L * 0.06, 0, TAU);
      g.fillStyle = colors.nucleus;
      g.fill();
      // eyespot beside the reservoir at the front
      g.beginPath();
      g.arc(0.36 * o.L, -0.3 * b, o.L * 0.032, 0, TAU);
      g.fillStyle = colors.eug.eye;
      g.fill();
      g.restore();
    }
  }

  function drawDiatoms(tt) {
    for (const o of world.diatoms) {
      const d = onOrbit(o.drift, tt);
      const heading = o.heading + o.turn * tt;
      let x = o.cx + d.x;
      let y = o.cy + d.y;
      if (o.kind === 'pennate') {
        const glide = o.glide * Math.sin(o.glideW * tt + o.glidePhase);
        x += Math.cos(heading) * glide;
        y += Math.sin(heading) * glide;
      }
      g.save();
      g.translate(x, y);
      g.rotate(heading);
      g.globalAlpha = o.focus;
      if (o.kind === 'pennate') {
        const a = o.L / 2;
        const b = o.L * o.ratio;
        const e = o.round ? 0.58 : 0.78;
        const hw = (u) => b * Math.pow(Math.max(0, 1 - u * u), e);
        g.beginPath();
        const m = 48;
        for (let k = 0; k < m; k += 1) {
          const th = (k / m) * TAU;
          const u = Math.cos(th);
          const h = hw(u);
          const s = Math.sin(th);
          const yy = s >= 0 ? h : -h;
          if (k === 0) g.moveTo(u * a, yy);
          else g.lineTo(u * a, yy);
        }
        g.closePath();
        g.fillStyle = colors.dia.fill;
        g.fill();
        strokeGlow(colors.dia.glow, 5);
        g.strokeStyle = colors.dia.line;
        g.lineWidth = 1 * px();
        g.stroke();
        // striae either side of the axial area, and the raphe with its central nodule
        g.beginPath();
        const step = 3.4;
        for (let xx = -a + step; xx < a - step * 0.5; xx += step) {
          const h = hw(xx / a);
          if (h < 1.2) continue;
          g.moveTo(xx, 0.14 * b);
          g.lineTo(xx, h - 0.6);
          g.moveTo(xx, -0.14 * b);
          g.lineTo(xx, -h + 0.6);
        }
        g.strokeStyle = colors.dia.striae;
        g.lineWidth = 0.7 * px();
        g.stroke();
        g.beginPath();
        g.moveTo(-0.44 * a, 0);
        g.lineTo(-0.06 * a, 0);
        g.moveTo(0.06 * a, 0);
        g.lineTo(0.44 * a, 0);
        g.strokeStyle = colors.dia.line;
        g.lineWidth = 0.9 * px();
        g.stroke();
        g.beginPath();
        g.arc(0, 0, 1.4, 0, TAU);
        g.fillStyle = colors.dia.line;
        g.fill();
      } else {
        const r = o.L / 2;
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.fillStyle = colors.dia.fill;
        g.fill();
        strokeGlow(colors.dia.glow, 5);
        g.strokeStyle = colors.dia.line;
        g.lineWidth = 1 * px();
        g.stroke();
        g.beginPath();
        for (let k = 0; k < 28; k += 1) {
          const a = (k / 28) * TAU;
          g.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3);
          g.lineTo(Math.cos(a) * r * 0.94, Math.sin(a) * r * 0.94);
        }
        g.moveTo(r * 0.3, 0);
        g.arc(0, 0, r * 0.3, 0, TAU);
        g.moveTo(r * 0.64, 0);
        g.arc(0, 0, r * 0.64, 0, TAU);
        g.strokeStyle = colors.dia.striae;
        g.lineWidth = 0.7 * px();
        g.stroke();
        g.beginPath();
        for (let k = 0; k < 24; k += 1) {
          const a = (k / 24) * TAU + 0.13;
          g.moveTo(Math.cos(a) * r * 0.82 + 0.9, Math.sin(a) * r * 0.82);
          g.arc(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, 0.9, 0, TAU);
        }
        g.fillStyle = colors.dia.striae;
        g.fill();
      }
      g.restore();
    }
  }

  function drawAmoebae(tt) {
    for (const o of world.amoebae) {
      const d = onOrbit(o.drift, tt);
      const x = o.cx + d.x;
      const y = o.cy + d.y;
      const R = o.R;
      const radius = (th) => {
        let r = 1;
        for (const [amp, k, w, ph] of o.harmonics) r += amp * Math.sin(k * th + w * tt + ph);
        for (const pod of o.pods) {
          const ext = Math.pow(Math.max(0, Math.sin((TAU * tt) / pod.period + pod.phase)), 1.4) * pod.height;
          let dth = th - pod.theta - 0.06 * Math.sin(tt * 0.3 + pod.phase);
          dth = Math.atan2(Math.sin(dth), Math.cos(dth));
          r += ext * Math.exp(-((dth / pod.width) ** 2));
        }
        return R * r;
      };
      g.save();
      g.translate(x, y);
      g.globalAlpha = o.focus;
      const m = 84;
      g.beginPath();
      for (let k = 0; k < m; k += 1) {
        const th = (k / m) * TAU;
        const r = radius(th);
        if (k === 0) g.moveTo(Math.cos(th) * r, Math.sin(th) * r);
        else g.lineTo(Math.cos(th) * r, Math.sin(th) * r);
      }
      g.closePath();
      g.fillStyle = colors.amo.fill;
      g.fill();
      strokeGlow(colors.amo.glow, 5);
      g.strokeStyle = colors.amo.line;
      g.lineWidth = 1 * px();
      g.stroke();
      // the grainy endoplasm: the same outline, smaller, drawn faintly
      g.beginPath();
      for (let k = 0; k < m; k += 1) {
        const th = (k / m) * TAU;
        const r = radius(th) * 0.62;
        if (k === 0) g.moveTo(Math.cos(th) * r, Math.sin(th) * r);
        else g.lineTo(Math.cos(th) * r, Math.sin(th) * r);
      }
      g.closePath();
      g.fillStyle = colors.amo.inner;
      g.fill();
      // granules streaming slowly
      g.fillStyle = colors.amo.granule;
      g.beginPath();
      for (const [gx, gy, ph] of o.granules) {
        const px0 = (gx + 0.05 * Math.sin(tt * 0.35 + ph)) * R;
        const py0 = (gy + 0.05 * Math.cos(tt * 0.29 + ph)) * R;
        g.moveTo(px0 + 1.1, py0);
        g.arc(px0, py0, 1.1, 0, TAU);
      }
      g.fill();
      // nucleus and a contractile vacuole
      g.beginPath();
      g.ellipse(o.nucleus[0] * R, o.nucleus[1] * R, R * 0.19, R * 0.13, o.nucleus[2], 0, TAU);
      g.fillStyle = colors.nucleus;
      g.fill();
      g.strokeStyle = colors.nucleusLine;
      g.lineWidth = 0.8 * px();
      g.stroke();
      const vr = R * 0.12 * (0.7 + 0.3 * Math.sin(tt * TAU / 9));
      g.beginPath();
      g.arc(-o.nucleus[0] * R * 1.4, -o.nucleus[1] * R * 1.2, vr, 0, TAU);
      g.fillStyle = colors.clear;
      g.fill();
      g.strokeStyle = colors.detail;
      g.lineWidth = 0.8 * px();
      g.stroke();
      g.restore();
    }
  }

  function drawVolvox(tt) {
    for (const o of world.volvox) {
      const d = onOrbit(o.drift, tt);
      const x = o.cx + d.x;
      const y = o.cy + d.y;
      const R = o.R;
      const ang = o.spin * tt + o.spinPhase;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const ct = Math.cos(o.tilt);
      const st = Math.sin(o.tilt);
      const project = (p) => {
        // spin about y, then tilt about x
        const x1 = p[0] * ca + p[2] * sa;
        const z1 = -p[0] * sa + p[2] * ca;
        const y1 = p[1];
        const y2 = y1 * ct - z1 * st;
        const z2 = y1 * st + z1 * ct;
        return [x1, y2, z2];
      };
      g.save();
      g.translate(x, y);
      g.globalAlpha = o.focus;
      g.beginPath();
      g.arc(0, 0, R, 0, TAU);
      g.fillStyle = colors.vol.fill;
      g.fill();
      strokeGlow(colors.vol.glow, 6);
      g.strokeStyle = colors.vol.line;
      g.lineWidth = 1 * px();
      g.stroke();
      // far hemisphere, faint
      g.beginPath();
      for (const p of o.points) {
        const [px1, py1, pz1] = project(p);
        if (pz1 >= 0) continue;
        g.moveTo(px1 * R + 1, py1 * R);
        g.arc(px1 * R, py1 * R, 1, 0, TAU);
      }
      g.fillStyle = colors.vol.back;
      g.fill();
      // daughter colonies inside, turning with the sphere
      for (const dtr of o.daughters) {
        const [dx, dy, dz] = project(dtr);
        const rr = R * 0.2 * (0.85 + 0.15 * dz);
        g.beginPath();
        g.arc(dx * R, dy * R, rr, 0, TAU);
        g.fillStyle = colors.vol.daughter;
        g.fill();
        g.strokeStyle = colors.vol.line;
        g.lineWidth = 0.8 * px();
        g.stroke();
        g.beginPath();
        for (let k = 0; k < 10; k += 1) {
          const a = (k / 10) * TAU + ang;
          g.moveTo(dx * R + Math.cos(a) * rr * 0.72 + 0.7, dy * R + Math.sin(a) * rr * 0.72);
          g.arc(dx * R + Math.cos(a) * rr * 0.72, dy * R + Math.sin(a) * rr * 0.72, 0.7, 0, TAU);
        }
        g.fillStyle = colors.vol.front;
        g.fill();
      }
      // near hemisphere
      g.beginPath();
      for (const p of o.points) {
        const [px1, py1, pz1] = project(p);
        if (pz1 < 0) continue;
        const r = 1 + 0.5 * pz1;
        g.moveTo(px1 * R + r, py1 * R);
        g.arc(px1 * R, py1 * R, r, 0, TAU);
      }
      g.fillStyle = colors.vol.front;
      g.fill();
      g.restore();
    }
  }

  function drawBacteria(tt) {
    for (const tone of ['ink', 'soft']) {
      g.strokeStyle = colors.bac[tone];
      g.fillStyle = colors.bac[tone];
      g.lineCap = 'round';
      for (const o of world.bacteria) {
        if (o.tone !== tone) continue;
        const d = onOrbit(o.drift, tt);
        const j = o.j;
        // Brownian tremble: products of fast sines, irregular but a pure function of t
        const jx = 1.7 * Math.sin(j[0] * tt + j[1]) * Math.cos(j[2] * tt + j[3]);
        const jy = 1.7 * Math.sin(j[4] * tt + j[5]) * Math.cos(j[6] * tt + j[7]);
        const x = o.cx + d.x + jx;
        const y = o.cy + d.y + jy;
        const heading = o.heading + o.turn * tt + 0.3 * Math.sin(j[8] * tt + j[9]);
        g.globalAlpha = o.focus;
        if (o.cocci) {
          const r = o.width * 0.6;
          const c = Math.cos(heading) * r;
          const s = Math.sin(heading) * r;
          g.beginPath();
          g.arc(x - c, y - s, r, 0, TAU);
          g.moveTo(x + c + r, y + s);
          g.arc(x + c, y + s, r, 0, TAU);
          g.fill();
        } else {
          const c = Math.cos(heading) * o.L * 0.5;
          const s = Math.sin(heading) * o.L * 0.5;
          g.beginPath();
          g.moveTo(x - c, y - s);
          g.lineTo(x + c, y + s);
          g.lineWidth = o.width;
          g.stroke();
        }
      }
    }
    g.lineCap = 'butt';
    g.globalAlpha = 1;
  }

  function drawField() {
    if (!fieldGradient) {
      fieldGradient = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.56);
      fieldGradient.addColorStop(0, colors.fieldCentre);
      fieldGradient.addColorStop(0.55, colors.fieldMid);
      fieldGradient.addColorStop(1, colors.fieldMid);
      vignette = g.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.56);
      vignette.addColorStop(0, alpha(colors.rim, 0));
      vignette.addColorStop(0.5, alpha(colors.rim, 0.06));
      vignette.addColorStop(0.8, alpha(colors.rim, 0.62));
      vignette.addColorStop(1, alpha(colors.rim, 1));
    }
    g.fillStyle = fieldGradient;
    g.fillRect(-2, -2, W + 4, H + 4);
  }

  function draw() {
    if (!cw) return;
    const start = performance.now();
    dividing = null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = colors.rim;
    g.fillRect(0, 0, cw, ch);
    g.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
    g.lineJoin = 'round';
    drawField();
    drawBacteria(t);
    drawDiatoms(t);
    drawVolvox(t);
    drawAmoebae(t);
    drawEuglena(t);
    drawParamecia(t);
    g.globalAlpha = 1;
    g.fillStyle = vignette;
    g.fillRect(-2, -2, W + 4, H + 4);
    lastFrameMs = performance.now() - start;
  }

  // ----- clock -----
  function frame(now) {
    raf = 0;
    if (destroyed || !playing || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function schedule() {
    if (raf || destroyed || !playing || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function setPlaying(next) {
    playing = next;
    playBtn.textContent = playing ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-label', playing ? 'Pause the pond' : 'Play the pond');
    if (playing) schedule();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function seek(next) {
    t = Math.max(0, next);
    draw();
  }

  playBtn.addEventListener('click', () => setPlaying(!playing));
  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setPlaying(!playing);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seek(t + (e.shiftKey ? 5 : 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seek(t - (e.shiftKey ? 5 : 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      seek(0);
    }
  };
  canvas.addEventListener('keydown', onKey);

  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    if (!resize()) return;
    draw();
    if (!ready) {
      ready = true;
      ctx.onReady();
    }
  });
  observer.observe(root);
  setPlaying(playing);
  if (resize()) {
    draw();
    ready = true;
    ctx.onReady();
  }

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      canvas.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      setPlaying(false);
      seek(Number(seconds) || 0);
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setTheme(nextTheme, nextPalette) {
      theme = nextTheme;
      palette = nextPalette;
      buildColors();
      fieldGradient = null;
      vignette = null;
      draw();
    },
    describe() {
      return {
        t: Number(t.toFixed(3)),
        playing,
        organisms: {
          paramecia: world.paramecia.length,
          euglena: world.euglena.length,
          diatoms: world.diatoms.length,
          amoebae: world.amoebae.length,
          volvox: world.volvox.length,
          bacteria: world.bacteria.length,
        },
        dividing,
        frameMs: Number(lastFrameMs.toFixed(2)),
      };
    },
  };
}
