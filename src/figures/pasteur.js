// Pasteur's swan-neck flasks (1859–1861): two flasks of broth on a bench, each with a long S-curved
// neck open to the air. A timeline of thirty days. Boil both, then snap flask B's neck, or tilt flask A
// so the broth touches the dust trapped in its bend, and scrub through the days to see which broth
// clouds. Unboiled, both cloud within days, which is what the old evidence looked like.
//
// The clock t is the day (0–30), running at one day per real second when playing. Every frame is a
// function of t and the recorded actions (boil at day 0, the day B was snapped, the day A was tilted),
// so setTime(t) shows the same frame on every machine: the drifting specks, the flames, the fall of the
// broken neck are all parametrised by t. Under reduced motion there is no play: scrubbing only.
import { el, h, C, tint, uid, clamp } from './lib/svg.js';

export const meta = { kind: 'pasteur', title: 'Pasteur\'s swan-neck flasks', needsWebGL: false, aspect: 16 / 9 };

const W = 960;
const H = 540;
const DAYS = 30;
const SPEED = 1; // days per real second
const BENCH_Y = 424;
const BULB_R = 78;
const NECK_W = 24; // inside width of the neck tube
const WALL = 2.2;
const FLASKS = { A: { cx: 300, cy: BENCH_Y - 104 }, B: { cx: 650, cy: BENCH_Y - 104 } };
const TILT_DEG = 50; // enough for the broth to run into the bend, not enough for the neck to hit the bench
const PIECE_DEG = 150; // how far the broken piece turns about the break as it falls
const LEVEL = 14; // broth surface, below the bulb centre
const SEED = 18590101;

// The neck's centre-line, relative to the bulb centre: up from the bulb, over an arch, down into a
// dip, and up to an open end. Cubic Béziers, sampled into a polyline for the particles.
const NECK = [
  [[0, -76], [0, -150]],
  [[0, -150], [0, -196], [42, -214], [82, -190]],
  [[82, -190], [118, -168], [104, -116], [140, -108]],
  [[140, -108], [170, -101], [178, -138], [202, -160]],
];

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

const smooth = (x) => {
  const u = clamp(x, 0, 1);
  return u * u * (3 - 2 * u);
};

// Sample the neck into points with cumulative lengths.
function sampleNeck() {
  const pts = [];
  const push = (x, y) => {
    const prev = pts[pts.length - 1];
    const s = prev ? prev.s + Math.hypot(x - prev.x, y - prev.y) : 0;
    pts.push({ x, y, s });
  };
  push(NECK[0][0][0], NECK[0][0][1]);
  push(NECK[0][1][0], NECK[0][1][1]);
  for (let i = 1; i < NECK.length; i += 1) {
    const [p0, p1, p2, p3] = NECK[i];
    for (let k = 1; k <= 28; k += 1) {
      const u = k / 28;
      const v = 1 - u;
      const x = v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0];
      const y = v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1];
      push(x, y);
    }
  }
  return pts;
}

const NECK_PTS = sampleNeck();
const NECK_LEN = NECK_PTS[NECK_PTS.length - 1].s;
// The dip: the lowest point past the arch, where dust settles. The break: the top of the arch.
const DIP = NECK_PTS.reduce((best, p) => (p.s > 120 && p.y > best.y ? p : best), { x: 0, y: -Infinity, s: 0 });
const BREAK = NECK_PTS.reduce((best, p) => (p.y < best.y ? p : best), NECK_PTS[0]);

function neckPoint(s) {
  const len = clamp(s, 0, NECK_LEN);
  let lo = 0;
  let hi = NECK_PTS.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (NECK_PTS[mid].s <= len) lo = mid;
    else hi = mid;
  }
  const a = NECK_PTS[lo];
  const b = NECK_PTS[hi];
  const u = b.s === a.s ? 0 : (len - a.s) / (b.s - a.s);
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

const neckPath = () => {
  let d = `M${NECK[0][0][0]} ${NECK[0][0][1]} L${NECK[0][1][0]} ${NECK[0][1][1]}`;
  for (let i = 1; i < NECK.length; i += 1) {
    const [, p1, p2, p3] = NECK[i];
    d += ` C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;
  }
  return d;
};

// The neck split at the break for the snapped flask: the stub that stays, and the piece that falls.
// The piece's resting pose is computed from its own points: turned PIECE_DEG about the break, then
// moved so it lies on the bench just right of the bulb.
function splitNeck() {
  const stub = [];
  const piece = [];
  for (const p of NECK_PTS) (p.s <= BREAK.s ? stub : piece).push(p);
  piece.unshift(BREAK);
  const toPath = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const a = (PIECE_DEG * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  let minX = Infinity;
  let maxY = -Infinity;
  for (const p of piece) {
    const dx = p.x - BREAK.x;
    const dy = p.y - BREAK.y;
    minX = Math.min(minX, BREAK.x + dx * cos - dy * sin);
    maxY = Math.max(maxY, BREAK.y + dx * sin + dy * cos);
  }
  const margin = NECK_W / 2 + WALL;
  const rest = { tx: BULB_R + 26 + margin - minX, ty: 104 - margin - maxY };
  return { stub: toPath(stub), piece: toPath(piece), rest };
}

// The narrow arrangement. Below NARROW_MAX stage pixels the whole scene is lifted and shrunk into the
// band left between the card strip at the top and the single row of controls at the bottom, so nothing
// covers the bench; the names stay outside that group and are drawn several times larger in viewBox
// units, which is what makes them legible at 390 px. The band is measured from the card and toolbar as
// they actually render rather than guessed, so a two-line card or a taller stage moves it honestly.
// SCENE_BOX is what the scene draws inside: the top is the arch of the neck, the bottom the front edge
// of the bench.
// 880 px of stage, not a phone's 340: the wide arrangement needs the height that comes with the width.
// A chapter's wide figure is about 656 px across at a 1024 px viewport, and at that size the wide
// layout's card covers flask A's whole neck and the flask names run into the toolbar.
const NARROW_MAX = 880;
const NAME_PX = 13; // device pixels for the flask names on a narrow stage, converted to viewBox units
const SCENE_BOX = { x0: 30, y0: 100, x1: 930, y1: BENCH_Y + 12 };

const CSS = `
.tb-pasteur { position: absolute; inset: 0; font-family: var(--font-ui); --ps-broth: color-mix(in srgb, var(--gold) 30%, var(--paper)); }
:root[data-theme="dark"] .tb-pasteur { --ps-broth: color-mix(in srgb, var(--gold) 46%, var(--paper)); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .tb-pasteur { --ps-broth: color-mix(in srgb, var(--gold) 46%, var(--paper)); } }
.tb-pasteur svg.tb-fill { outline: none; }
.tb-pasteur svg.tb-fill:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
.tb-pasteur .fig-card { max-width: min(19rem, 42%); }
.tb-pasteur .fig-card h5 { font-variant-numeric: lining-nums tabular-nums; }
.tb-pasteur .ps-range { flex: 1 1 6rem; max-width: 18rem; }
.tb-pasteur .ps-day { min-width: 4.2em; text-align: center; }
.tb-pasteur .ps-glass { fill: color-mix(in srgb, var(--water) 7%, var(--paper)); fill-opacity: 0.8; }
.tb-pasteur .ps-wall { fill: none; stroke: color-mix(in srgb, var(--ink-soft) 70%, var(--paper)); stroke-width: ${WALL}; }
.tb-pasteur .ps-tube { fill: none; stroke-linecap: butt; }
.tb-pasteur .ps-label { font-size: 12px; fill: var(--ink-soft); }
.tb-pasteur .ps-name { font-size: 12.5px; font-weight: 600; fill: var(--ink); letter-spacing: 0.02em; }
.tb-pasteur .ps-note { font-size: 11px; fill: var(--ink-faint); }
.tb-pasteur .ps-lead { fill: none; stroke: var(--ink-faint); stroke-width: 1; }
.tb-pasteur .fig-btn[disabled] { opacity: 0.45; cursor: default; }
.tb-pasteur .ps-short { display: none; }
/* Narrow: the scene lifts clear of the controls, the scene type is drawn several times larger in
   viewBox units so it lands at about 10 device px, and the card becomes a one-line strip on top. */
.tb-pasteur.is-narrow .ps-long { display: none; }
.tb-pasteur.is-narrow .ps-short { display: inline; }
.tb-pasteur.is-narrow .ps-day { display: none; }
.tb-pasteur.is-narrow .ps-range { flex: 1 1 3.5rem; min-width: 3rem; }
.tb-pasteur.is-narrow .fig-btn { padding: 0.22rem 0.5rem; }
.tb-pasteur.is-narrow .fig-toolbar { bottom: var(--space-1); left: var(--space-2); right: var(--space-2); }
.tb-pasteur.is-narrow .fig-toolbar { gap: var(--space-1); flex-wrap: nowrap; }
.tb-pasteur.is-narrow .fig-card {
  max-width: none; left: var(--space-2); right: var(--space-2); top: var(--space-1);
  padding: 0.18rem 0.45rem; border-radius: var(--radius); box-shadow: none; line-height: 1.25;
}
.tb-pasteur.is-narrow .fig-card h5 { display: inline; font-family: var(--font-ui); font-size: var(--text-xs); font-weight: 600; }
.tb-pasteur.is-narrow .fig-card h5::after { content: " · "; color: var(--ink-faint); }
.tb-pasteur.is-narrow .fig-card p { display: inline; font-size: var(--text-xs); }
`;

// ---------- one flask: geometry, layers, and its per-frame update ----------

function buildFlask(ns, id, rand) {
  const { cx, cy } = FLASKS[id];
  const g = el('g', { transform: `translate(${cx} ${cy})` });
  const rot = el('g'); // rotates for the tilt; the broth level stays horizontal outside it
  const { stub, piece, rest } = splitNeck();
  const full = neckPath();
  const clipLevel = `${ns}-${id}-level`;
  const clipBulb = `${ns}-${id}-bulb`;

  // Definitions: the level clip (world space, below the broth surface) and the bulb interior.
  const defs = el('defs');
  const levelRect = el('rect', { x: -400, y: LEVEL, width: 800, height: 400 });
  defs.append(el('clipPath', { id: clipLevel }, [levelRect]));
  defs.append(el('clipPath', { id: clipBulb }, [el('circle', { r: BULB_R - WALL / 2 })]));
  const hazeId = `${ns}-${id}-haze`;
  defs.append(el('linearGradient', { id: hazeId, x1: 0, y1: 0, x2: 0, y2: 1 }, [
    el('stop', { offset: '0', 'stop-color': 'color-mix(in srgb, var(--gold) 46%, var(--ink-soft))', 'stop-opacity': 0.55 }),
    el('stop', { offset: '1', 'stop-color': 'color-mix(in srgb, var(--gold) 46%, var(--ink-soft))', 'stop-opacity': 0.95 }),
  ]));
  g.append(defs);

  // Stand: a ring and two legs on the bench. The ring's back half is behind the bulb, its front half
  // in front, so the glass reads as sitting in it.
  const stand = el('g');
  const ringY = BULB_R - 20;
  stand.append(el('path', { d: `M-46 ${ringY} L-52 ${BENCH_Y - cy} M46 ${ringY} L52 ${BENCH_Y - cy}`, stroke: C.soft, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  stand.append(el('path', { d: `M-46 ${ringY} A46 9 0 0 1 46 ${ringY}`, fill: 'none', stroke: C.soft, 'stroke-width': 3.5 }));
  const ringFront = el('path', { d: `M-46 ${ringY} A46 9 0 0 0 46 ${ringY}`, fill: 'none', stroke: C.soft, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  g.append(stand);

  // Burner and flame, shown while the broth boils.
  const burner = el('g');
  burner.append(el('rect', { x: -15, y: BENCH_Y - cy - 16, width: 30, height: 16, rx: 3, fill: C.soft }));
  const flameOuter = el('path', { fill: C.gold, opacity: 0.85 });
  const flameInner = el('path', { fill: C.coral, opacity: 0.8 });
  burner.append(flameOuter, flameInner);
  burner.style.display = 'none';
  g.append(burner);

  // Glass: the bulb interior, the neck tube (a wide wall stroke with the interior painted over it).
  rot.append(el('circle', { r: BULB_R, class: 'ps-glass' }));
  const neckWall = el('path', { d: full, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--ink-soft) 70%, var(--paper))', 'stroke-width': NECK_W + WALL * 2 });
  const neckInside = el('path', { d: full, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--water) 7%, var(--paper))', 'stroke-width': NECK_W });
  const stubWall = el('path', { d: stub, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--ink-soft) 70%, var(--paper))', 'stroke-width': NECK_W + WALL * 2 });
  const stubInside = el('path', { d: stub, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--water) 7%, var(--paper))', 'stroke-width': NECK_W });
  const stubEnd = el('path', { d: `M${(BREAK.x - NECK_W / 2 - WALL).toFixed(1)} ${BREAK.y.toFixed(1)} L${(BREAK.x + NECK_W / 2 + WALL).toFixed(1)} ${BREAK.y.toFixed(1)}`, class: 'ps-wall', 'stroke-dasharray': '2 2' });
  const intactNeck = el('g', {}, [neckWall, neckInside]);
  const snappedNeck = el('g', {}, [stubWall, stubInside, stubEnd]);
  snappedNeck.style.display = 'none';
  rot.append(intactNeck, snappedNeck);

  // Broth: clear amber, then a haze that rises as it clouds, then specks. World-horizontal level.
  const brothWorld = el('g', { 'clip-path': `url(#${clipLevel})` });
  const brothRot = el('g');
  const brothClear = el('g');
  brothClear.append(el('circle', { r: BULB_R - WALL / 2, fill: 'var(--ps-broth)', opacity: 0.85 }));
  brothClear.append(el('path', { d: full, class: 'ps-tube', stroke: 'var(--ps-broth)', 'stroke-width': NECK_W, opacity: 0.85 }));
  const brothHaze = el('g', { opacity: 0 });
  brothHaze.append(el('circle', { r: BULB_R - WALL / 2, fill: `url(#${hazeId})` }));
  brothHaze.append(el('path', { d: full, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--gold) 46%, var(--ink-soft))', 'stroke-width': NECK_W, opacity: 0.8 }));
  const specks = el('g', { fill: 'color-mix(in srgb, var(--ink-soft) 80%, var(--gold))', 'clip-path': `url(#${clipBulb})` });
  const speckDots = [];
  for (let i = 0; i < 26; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = (BULB_R - 8) * Math.sqrt(rand());
    const dot = el('circle', { r: 1.1 + rand() * 1.2 });
    specks.append(dot);
    speckDots.push({ dot, ox: Math.cos(a) * r, oy: Math.sin(a) * r, w: 0.6 + rand() * 0.8, ph: rand() * Math.PI * 2, amp: 2 + rand() * 3 });
  }
  brothRot.append(brothClear, brothHaze, specks);
  brothWorld.append(brothRot);
  // The meniscus: a faint line at the surface, inside the bulb only.
  const meniscus = el('path', { d: `M${-Math.sqrt(BULB_R * BULB_R - LEVEL * LEVEL).toFixed(1)} ${LEVEL} L${Math.sqrt(BULB_R * BULB_R - LEVEL * LEVEL).toFixed(1)} ${LEVEL}`, stroke: C.paper, 'stroke-width': 1.2, opacity: 0.8 });

  // Bulb wall: an arc with a gap where the neck enters, and a highlight.
  const jx = NECK_W / 2 + WALL;
  const jy = -Math.sqrt(BULB_R * BULB_R - jx * jx);
  rot.append(el('path', { d: `M${-jx.toFixed(1)} ${jy.toFixed(1)} A${BULB_R} ${BULB_R} 0 1 0 ${jx.toFixed(1)} ${jy.toFixed(1)}`, class: 'ps-wall' }));
  rot.append(el('path', { d: `M-58 -34 A66 66 0 0 1 -30 -60`, fill: 'none', stroke: C.paper, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 }));

  // Dust piled in the dip, and motes drifting in from the open end.
  const dust = el('g', { fill: C.soft });
  const dustDots = [];
  for (let i = 0; i < 18; i += 1) {
    const along = (rand() - 0.5) * 34;
    const p = neckPoint(DIP.s + along);
    const dot = el('circle', { cx: p.x.toFixed(1), cy: (p.y + NECK_W / 2 - 2.2 - rand() * 3.5 - Math.abs(along) * 0.12).toFixed(1), r: (1 + rand() * 1.1).toFixed(2), opacity: 0.85 });
    dot.style.display = 'none';
    dust.append(dot);
    dustDots.push(dot);
  }
  const motes = el('g', { fill: C.soft, opacity: 0.8 });
  const moteDots = [];
  for (let i = 0; i < 4; i += 1) {
    const dot = el('circle', { r: 1.3 });
    motes.append(dot);
    moteDots.push({ dot, speed: 46 + rand() * 30, ph: rand() * 400, wob: rand() * Math.PI * 2 });
  }
  // Specks falling straight into a snapped flask.
  const fallers = el('g', { fill: C.soft, opacity: 0.85 });
  const fallDots = [];
  for (let i = 0; i < 5; i += 1) {
    const dot = el('circle', { r: 1.3 });
    fallers.append(dot);
    fallDots.push({ dot, speed: 60 + rand() * 40, ph: rand() * 300, dx: (rand() - 0.5) * 12 });
  }
  fallers.style.display = 'none';

  // The broken-off piece: in place until the snap, then falling, then lying on the bench.
  const pieceG = el('g');
  pieceG.append(el('path', { d: piece, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--ink-soft) 70%, var(--paper))', 'stroke-width': NECK_W + WALL * 2 }));
  pieceG.append(el('path', { d: piece, class: 'ps-tube', stroke: 'color-mix(in srgb, var(--water) 7%, var(--paper))', 'stroke-width': NECK_W }));
  pieceG.style.display = 'none';
  const pieceDust = el('g', { fill: C.soft });
  pieceG.append(pieceDust);

  // Steam wisps from the open end while boiling.
  const steam = el('g', { fill: 'none', stroke: C.faint, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
  const wisps = [];
  for (let i = 0; i < 3; i += 1) {
    const path = el('path');
    steam.append(path);
    wisps.push({ path, ph: i / 3, dx: (i - 1) * 9 });
  }
  steam.style.display = 'none';

  rot.append(dust, motes);
  g.append(rot, brothWorld, ringFront, pieceG, steam);
  // The meniscus and the fallers live in flask space too, so they turn with the tilt.
  rot.append(meniscus, fallers);

  const end = neckPoint(NECK_LEN);

  function update(t, s) {
    // s: { boiling (0..1 flame strength), tilt (degrees), cloud (0..1), dustDays, snapped, snapAge, dustAtSnap, open }
    rot.setAttribute('transform', s.tilt ? `rotate(${s.tilt.toFixed(2)})` : '');
    brothRot.setAttribute('transform', s.tilt ? `rotate(${s.tilt.toFixed(2)})` : '');
    // cloud
    brothHaze.setAttribute('opacity', s.cloud.toFixed(3));
    const nSpecks = Math.round(s.cloud * speckDots.length);
    speckDots.forEach((sp, i) => {
      const on = i < nSpecks;
      sp.dot.style.display = on ? '' : 'none';
      if (on) {
        sp.dot.setAttribute('cx', (sp.ox + Math.sin(t * sp.w * 6 + sp.ph) * sp.amp).toFixed(1));
        sp.dot.setAttribute('cy', (sp.oy + Math.cos(t * sp.w * 4.4 + sp.ph) * sp.amp * 0.6).toFixed(1));
      }
    });
    // dust in the dip: only while the neck is intact; the piece carries it away when snapped
    const nDust = Math.min(dustDots.length, Math.floor(s.dustDays * 0.75));
    dustDots.forEach((dot, i) => { dot.style.display = i < nDust && !s.snapped ? '' : 'none'; });
    // motes drifting in from the open end towards the dip (intact, after the boil has cooled)
    const showMotes = !s.snapped && s.open;
    motes.style.display = showMotes ? '' : 'none';
    if (showMotes) {
      const span = NECK_LEN - DIP.s;
      for (const m of moteDots) {
        const travelled = (t * 24 * m.speed + m.ph) % (span + 40);
        if (travelled > span) {
          m.dot.style.display = 'none';
          continue;
        }
        m.dot.style.display = '';
        const p = neckPoint(NECK_LEN - travelled);
        const wob = Math.sin(t * 40 + m.wob) * 4;
        m.dot.setAttribute('cx', (p.x + wob * 0.4).toFixed(1));
        m.dot.setAttribute('cy', (p.y + wob).toFixed(1));
        m.dot.setAttribute('opacity', (0.9 * smooth(travelled / 30) * smooth((span - travelled) / 30)).toFixed(2));
      }
    }
    // snapped: stub instead of the neck, the piece falling then lying on the bench, specks falling in
    intactNeck.style.display = s.snapped ? 'none' : '';
    snappedNeck.style.display = s.snapped ? '' : 'none';
    pieceG.style.display = s.snapped ? '' : 'none';
    if (s.snapped) {
      // Falls in half a day: turns about the break while dropping to its resting spot on the bench.
      const p = clamp(s.snapAge / 0.5, 0, 1);
      const fall = p * p;
      pieceG.setAttribute('transform', `translate(${(rest.tx * fall).toFixed(1)} ${(rest.ty * fall).toFixed(1)}) rotate(${(PIECE_DEG * fall).toFixed(1)} ${BREAK.x.toFixed(1)} ${BREAK.y.toFixed(1)})`);
      const nPieceDust = Math.min(dustDots.length, Math.floor(s.dustAtSnap * 0.75));
      if (pieceDust.childElementCount !== nPieceDust) {
        pieceDust.replaceChildren(...dustDots.slice(0, nPieceDust).map((d) => el('circle', { cx: d.getAttribute('cx'), cy: d.getAttribute('cy'), r: d.getAttribute('r'), opacity: 0.85 })));
      }
      fallers.style.display = s.open ? '' : 'none';
      if (s.open) {
        for (const f of fallDots) {
          const travelled = (t * 24 * f.speed + f.ph) % (BREAK.s + 60);
          if (travelled > BREAK.s) {
            f.dot.style.display = 'none';
            continue;
          }
          f.dot.style.display = '';
          const q = neckPoint(BREAK.s - travelled);
          f.dot.setAttribute('cx', (q.x + f.dx * 0.4).toFixed(1));
          f.dot.setAttribute('cy', q.y.toFixed(1));
          f.dot.setAttribute('opacity', (0.9 * smooth(travelled / 20)).toFixed(2));
        }
      }
    } else {
      fallers.style.display = 'none';
    }
    // boiling: flame and steam
    const boiling = s.boiling > 0;
    burner.style.display = boiling ? '' : 'none';
    steam.style.display = boiling ? '' : 'none';
    if (boiling) {
      const flick = 1 + 0.12 * Math.sin(t * 380) + 0.08 * Math.sin(t * 610 + 1);
      const hgt = 36 * s.boiling * flick;
      const base = BENCH_Y - cy - 16;
      flameOuter.setAttribute('d', `M-12 ${base} C-12 ${base - hgt * 0.5} -5 ${base - hgt * 0.7} 0 ${base - hgt} C5 ${base - hgt * 0.7} 12 ${base - hgt * 0.5} 12 ${base} Z`);
      flameInner.setAttribute('d', `M-6 ${base} C-6 ${base - hgt * 0.3} -2 ${base - hgt * 0.45} 0 ${base - hgt * 0.6} C2 ${base - hgt * 0.45} 6 ${base - hgt * 0.3} 6 ${base} Z`);
      burner.setAttribute('opacity', s.boiling.toFixed(2));
      const ox = s.snapped ? BREAK.x : end.x;
      const oy = s.snapped ? BREAK.y : end.y;
      for (const w of wisps) {
        const phase = (t * 1.6 + w.ph) % 1;
        const rise = phase * 46;
        const x = ox + w.dx + Math.sin(phase * 6 + w.ph * 7) * 5;
        const y = oy - 6 - rise;
        w.path.setAttribute('d', `M${x.toFixed(1)} ${(y + 12).toFixed(1)} C${(x - 5).toFixed(1)} ${(y + 6).toFixed(1)} ${(x + 5).toFixed(1)} ${(y + 2).toFixed(1)} ${x.toFixed(1)} ${(y - 4).toFixed(1)}`);
        w.path.setAttribute('opacity', (s.boiling * 0.8 * Math.sin(phase * Math.PI)).toFixed(2));
      }
    }
  }

  return { g, update, cx, cy };
}

// ---------- the story: what the recorded actions mean at day t ----------

const cloudAt = (t, start) => (start === null ? 0 : smooth((t - start - 0.8) / 3.2));

// Under reduced motion the transients are cuts: the flame is simply on for the first day, the tilt
// holds for the first day after the press, and the broken piece is already lying on the bench.
function storyAt(t, actions, reduced) {
  const boiled = actions.boil;
  const snapped = actions.snap !== null && t >= actions.snap;
  const tilted = actions.tilt !== null && t >= actions.tilt;
  let boiling = 0;
  if (boiled) boiling = reduced ? (t < 0.9 ? 1 : 0) : 1 - smooth((t - 0.75) / 0.35);
  const open = !boiled || t > 1.1; // after the boil the necks have cooled and air drifts in again
  // A: clouds if unboiled, or after the tilt. B: clouds if unboiled, or after the snap.
  const cloudA = boiled ? cloudAt(t, tilted ? actions.tilt : null) : cloudAt(t, 0);
  const cloudB = boiled ? cloudAt(t, snapped ? actions.snap : null) : cloudAt(t, 0);
  // The tilt itself: the flask leans for a moment so the broth runs into the bend, then stands again.
  let tilt = 0;
  if (tilted) {
    const age = t - actions.tilt;
    if (reduced) tilt = age < 0.9 ? TILT_DEG : 0;
    else tilt = TILT_DEG * smooth(age / 0.35) * (1 - smooth((age - 0.55) / 0.35));
  }
  const dustDays = boiled ? Math.max(0, t - 1) : t;
  const snapAge = snapped ? (reduced ? 1 : t - actions.snap) : 0;
  return {
    boiled, snapped, tilted, boiling, open, tilt,
    a: { cloud: cloudA, tilt, dustDays, snapped: false, snapAge: 0, dustAtSnap: 0, open, boiling },
    b: { cloud: cloudB, tilt: 0, dustDays, snapped, snapAge, dustAtSnap: snapped ? (boiled ? Math.max(0, actions.snap - 1) : actions.snap) : 0, open, boiling },
  };
}

// What a flask looks like right now, read from the haze the figure is actually drawing. The haze only
// begins 0.8 day after dust reaches the broth (see cloudAt), so a card that announced "both are
// clouding" at the moment of the tilt was describing a picture nobody could see; the card is written
// from this instead, and can never run ahead of the glass.
const APPEARANCE = { clear: 'is still clear', clouding: 'is clouding', cloudy: 'is cloudy' };
const lookOf = (cloud) => (cloud < 0.02 ? 'clear' : cloud < 0.6 ? 'clouding' : 'cloudy');

function narrate(t, actions, s) {
  const day = Math.floor(t + 1e-6);
  const title = `Day ${day}`;
  const A = lookOf(s.a.cloud);
  const B = lookOf(s.b.cloud);
  const out = (body, short) => ({ title, body, short });
  if (!actions.boil) {
    if (A === 'clear') return out('Two flasks of broth, unboiled, each with a swan neck open to the air. Boil them to start the experiment, or let the days run to see what unboiled broth does.', 'Unboiled broth. Press Boil to start.');
    if (A === 'clouding') return out('Nobody boiled the broth, and both flasks are clouding: the microbes already in it are multiplying. This is what the old evidence for spontaneous generation looked like.', 'Unboiled: both flasks are clouding.');
    return out('Both flasks are cloudy. Without boiling, the broth was never free of microbes, so the experiment shows nothing about where they come from. Press Boil to start again.', 'Both cloudy. Unboiled broth shows nothing.');
  }
  if (s.boiling > 0) return out('The broth boils. The heat kills every microbe in it, and the steam drives the air out of both necks.', 'Boiling: the heat kills every microbe.');
  const snapDay = actions.snap === null ? 0 : Math.floor(actions.snap);
  const tiltDay = actions.tilt === null ? 0 : Math.floor(actions.tilt);
  if (s.snapped && s.tilted) {
    const lead = `Flask B's neck was snapped on day ${snapDay}; flask A was tilted on day ${tiltDay}.`;
    if (A === 'cloudy' && B === 'cloudy') return out(`${lead} Both are cloudy now. Each clouded once dust reached its broth, and not before.`, 'Dust reached both, and both are cloudy.');
    if (A === 'clear' && B === 'clear') return out(`${lead} Dust has reached the broth in both, and neither has clouded yet.`, 'Dust reached both. Neither has clouded.');
    return out(`${lead} Dust reached the broth in both: flask A ${APPEARANCE[A]}, flask B ${APPEARANCE[B]}.`, `A ${APPEARANCE[A]}, B ${APPEARANCE[B]}.`);
  }
  if (s.snapped) {
    const lead = `Flask B's neck was snapped on day ${snapDay}. Dust falls straight in`;
    const body = B === 'clear' ? `${lead}; its broth has not clouded yet.` : `${lead}, and its broth ${APPEARANCE[B]}.`;
    return out(`${body} Flask A is still clear. The only difference is the neck.`, B === 'clear' ? "B's neck is open; nothing yet. A is clear." : `B's broth ${APPEARANCE[B]}; A is still clear.`);
  }
  if (s.tilted) {
    const lead = `Flask A was tilted on day ${tiltDay}, so the broth touched the dust caught in its bend.`;
    const body = A === 'clear' ? `${lead} It has not clouded yet.` : `${lead} It ${APPEARANCE[A]} now.`;
    return out(`${body} Flask B, never tilted, is still clear.`, A === 'clear' ? 'A met its dust; nothing yet. B is clear.' : `A ${APPEARANCE[A]}; B, never tilted, is clear.`);
  }
  if (day >= DAYS) return out('Both flasks are still clear, and would stay clear for years: some of Pasteur\'s flasks are clear to this day. Air reaches the broth, but dust and microbes are trapped in the bend.', 'Still clear after thirty days.');
  return out(`Both flasks are still clear. Air reaches the broth through the open necks, but dust and microbes settle in the bend${day >= 3 ? ', where they are collecting' : ''}.`, 'Both clear. Dust stops in the bend.');
}

// ---------- the figure ----------

export function mount(root, ctx) {
  const ns = uid('ps');
  const reduced = Boolean(ctx.reducedMotion);
  let t = clamp(ctx.pinnedTime ?? 0, 0, DAYS);
  let playing = false;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let readyRaf = 0;
  const actions = { boil: false, snap: null, tilt: null };

  const wrap = h('div', { class: 'tb-pasteur' });
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', { class: 'tb-fill', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', tabindex: 0, role: 'img', 'aria-label': 'Two swan-neck flasks of broth on a bench. Left and right arrow keys move a day; Space plays or pauses.' });

  // Bench, shadows and both flasks live in one group so the narrow layout can lift and shrink the
  // whole scene without disturbing anything measured from BENCH_Y inside a flask.
  const scene = el('g');
  scene.append(el('rect', { x: 30, y: BENCH_Y, width: W - 60, height: 24, rx: 3, fill: tint(C.ink, 14, C.paper2) }));
  scene.append(el('rect', { x: 30, y: BENCH_Y, width: W - 60, height: 5, rx: 2, fill: tint(C.ink, 26, C.paper2) }));
  for (const id of ['A', 'B']) {
    const { cx } = FLASKS[id];
    scene.append(el('ellipse', { cx: cx + 4, cy: BENCH_Y + 2, rx: 62, ry: 6, fill: C.ink, opacity: 0.08 }));
  }

  const rand = mulberry32(SEED);
  const flaskA = buildFlask(ns, 'A', rand);
  const flaskB = buildFlask(ns, 'B', rand);
  scene.append(flaskA.g, flaskB.g);

  // Labels sit outside the scene group, so their size is set in viewBox units and does not shrink with
  // it: names under the bench, two notes on flask A's neck. The bend note sits in the gap between the
  // two bulbs, where it clears flask B's glass at every day of the story.
  const labels = el('g');
  const nameA = el('text', { 'text-anchor': 'middle', class: 'ps-name', text: 'Flask A' });
  const nameB = el('text', { 'text-anchor': 'middle', class: 'ps-name', text: 'Flask B' });
  labels.append(nameA, nameB);
  const endA = { x: FLASKS.A.cx + 202, y: FLASKS.A.cy - 160 };
  const dipA = { x: FLASKS.A.cx + DIP.x, y: FLASKS.A.cy + DIP.y };
  const neckNotes = el('g');
  neckNotes.append(el('path', { d: `M${endA.x + 8} ${endA.y - 10} L${endA.x + 30} ${endA.y - 40}`, class: 'ps-lead' }));
  neckNotes.append(el('text', { x: endA.x + 34, y: endA.y - 44, class: 'ps-label', text: 'open to the air' }));
  neckNotes.append(el('path', { d: `M${dipA.x + 6} ${dipA.y + 14} L${dipA.x + 24} ${dipA.y + 58}`, class: 'ps-lead' }));
  neckNotes.append(el('text', { x: dipA.x + 26, y: dipA.y + 74, 'text-anchor': 'middle', class: 'ps-label', text: 'dust settles in the bend' }));
  labels.append(neckNotes);
  svg.append(scene, labels);
  wrap.append(svg);

  // Narration card
  const cardTitle = h('h5', { text: 'Day 0' });
  const cardBody = h('p');
  const card = h('div', { class: 'fig-card', 'aria-live': 'polite' }, [cardTitle, cardBody]);
  wrap.append(card);

  // Toolbar
  const button = (label, short, onClick) => {
    const children = short ? [h('span', { class: 'ps-long', text: label }), h('span', { class: 'ps-short', text: short })] : [label];
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': short ? label : null }, children);
    node.addEventListener('click', onClick);
    return node;
  };
  const btnBoil = button('Boil', null, () => boil());
  const btnSnap = button('Snap the neck', 'Snap', () => snap());
  const btnTilt = button('Tilt flask A', 'Tilt', () => tiltA());
  const btnPlay = button('Play', null, () => setPlaying(!playing));
  const range = h('input', { class: 'fig-range ps-range', type: 'range', min: 0, max: DAYS, step: 0.25, value: 0, 'aria-label': 'Day' });
  const dayChip = h('span', { class: 'fig-chip ps-day', text: 'Day 0' });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [btnBoil, btnSnap, btnTilt, reduced ? null : btnPlay, range, dayChip]);
  wrap.append(toolbar);
  root.append(wrap);

  let shownCard = '';
  let story = null;
  let narrow = null;

  function draw() {
    story = storyAt(t, actions, reduced);
    flaskA.update(t, story.a);
    flaskB.update(t, story.b);
    // The notes on A's neck step aside while it tilts.
    neckNotes.setAttribute('opacity', (1 - smooth(story.tilt / 8)).toFixed(2));
    const day = Math.floor(t + 1e-6);
    const text = narrate(t, actions, story);
    const body = narrow ? text.short : text.body;
    if (body !== shownCard) {
      shownCard = body;
      cardBody.textContent = body;
      fitNarrow(); // the card is the top of the narrow band, and a longer line makes it taller
    }
    cardTitle.textContent = text.title;
    dayChip.textContent = `Day ${day}`;
    if (Number(range.value) !== t) range.value = String(t);
    range.setAttribute('aria-valuetext', `Day ${day}`);
    btnSnap.disabled = story.snapped;
    btnTilt.disabled = story.tilted;
    btnSnap.setAttribute('aria-pressed', String(story.snapped));
    btnTilt.setAttribute('aria-pressed', String(story.tilted));
    btnBoil.setAttribute('aria-pressed', String(actions.boil));
  }

  // ----- clock -----
  function frame(now) {
    raf = 0;
    if (destroyed || !playing || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t = Math.min(DAYS, t + dt * SPEED);
    draw();
    if (t >= DAYS) {
      setPlaying(false);
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function schedule() {
    if (raf || destroyed || !playing || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function setPlaying(next) {
    if (reduced && next) return;
    playing = next;
    btnPlay.textContent = playing ? 'Pause' : 'Play';
    btnPlay.setAttribute('aria-label', playing ? 'Pause the days' : 'Play the days');
    if (playing) {
      if (t >= DAYS) t = 0;
      schedule();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function seek(next) {
    t = clamp(Number(next) || 0, 0, DAYS);
    draw();
  }

  // ----- actions -----
  function boil() {
    actions.boil = true;
    actions.snap = null;
    actions.tilt = null;
    seek(0);
    if (!reduced && ctx.pinnedTime === null) setPlaying(true);
  }

  function snap() {
    if (story?.snapped) return;
    actions.snap = Number(t.toFixed(2));
    draw();
    if (!reduced && !playing && ctx.pinnedTime === null && t < DAYS) setPlaying(true);
  }

  function tiltA() {
    if (story?.tilted) return;
    actions.tilt = Number(t.toFixed(2));
    draw();
    if (!reduced && !playing && ctx.pinnedTime === null && t < DAYS) setPlaying(true);
  }

  const onRange = () => {
    setPlaying(false);
    seek(Number(range.value));
  };
  const onKey = (e) => {
    if (e.target === range) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setPlaying(!playing);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPlaying(false);
      seek(t + (e.shiftKey ? 5 : 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPlaying(false);
      seek(t - (e.shiftKey ? 5 : 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPlaying(false);
      seek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPlaying(false);
      seek(DAYS);
    }
  };
  range.addEventListener('input', onRange);
  svg.addEventListener('keydown', onKey);

  // ----- layout: the wide bench-top scene, or the lifted narrow one -----
  let band = '';
  function placeNames(x0, x1, y) {
    for (const [node, x] of [[nameA, x0], [nameB, x1]]) {
      node.setAttribute('x', x.toFixed(1));
      node.setAttribute('y', y.toFixed(1));
    }
  }
  // Fit the scene into what the card and the controls have left. Called on every resize and whenever
  // the card changes height, because the card is the top of the band.
  function fitNarrow() {
    const w = root.clientWidth;
    const hpx = root.clientHeight;
    if (!narrow || !w || !hpx) return;
    const u = W / w; // viewBox units per device pixel
    const VH = Math.round(W * (hpx / w));
    const nameSize = NAME_PX * u; // the names live outside the scene, so they are sized in device pixels
    const top = (card.offsetTop + card.offsetHeight + 4) * u;
    const bottom = (toolbar.offsetTop - 4) * u - nameSize * 0.95;
    const key = `${VH}|${top.toFixed(1)}|${bottom.toFixed(1)}`;
    if (key === band) return;
    band = key;
    svg.setAttribute('viewBox', `0 0 ${W} ${VH}`);
    const sw = SCENE_BOX.x1 - SCENE_BOX.x0;
    const sh = SCENE_BOX.y1 - SCENE_BOX.y0;
    const k = Math.max(0.2, Math.min((W - 32) / sw, (bottom - top) / sh));
    const tx = 16 + (W - 32 - sw * k) / 2 - SCENE_BOX.x0 * k;
    const ty = top - SCENE_BOX.y0 * k;
    scene.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})`);
    for (const node of [nameA, nameB]) node.style.fontSize = `${nameSize.toFixed(1)}px`; // inline, so it beats the stylesheet's 12.5px
    placeNames(tx + k * FLASKS.A.cx, tx + k * FLASKS.B.cx, ty + k * SCENE_BOX.y1 + nameSize * 0.9);
  }
  function applyLayout(width) {
    const want = width > 0 && width < NARROW_MAX;
    if (want !== narrow) {
      narrow = want;
      band = '';
      wrap.classList.toggle('is-narrow', want);
      // The two notes on A's neck need more room than a phone has; the card carries them instead.
      neckNotes.style.display = want ? 'none' : '';
      if (!want) {
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        scene.removeAttribute('transform');
        for (const node of [nameA, nameB]) node.style.fontSize = '';
        placeNames(FLASKS.A.cx, FLASKS.B.cx, BENCH_Y + 46);
      }
      shownCard = '';
      draw();
    }
    fitNarrow();
  }
  const resize = new ResizeObserver((entries) => {
    if (destroyed) return;
    const r = entries[entries.length - 1].contentRect;
    if (r.width > 0) applyLayout(r.width);
  });
  resize.observe(root);
  applyLayout(root.clientWidth || W);

  readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (readyRaf) cancelAnimationFrame(readyRaf);
      raf = 0;
      resize.disconnect();
      range.removeEventListener('input', onRange);
      svg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      setPlaying(false);
      seek(seconds);
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setTheme() {},
    describe() {
      return {
        day: Number(t.toFixed(2)),
        boiled: actions.boil,
        snapped: story?.snapped ? actions.snap : false,
        tilted: story?.tilted ? actions.tilt : false,
        clearA: (story?.a.cloud ?? 0) < 0.5,
        clearB: (story?.b.cloud ?? 0) < 0.5,
        cloudA: Number((story?.a.cloud ?? 0).toFixed(3)),
        cloudB: Number((story?.b.cloud ?? 0).toFixed(3)),
        playing,
      };
    },
  };
}
