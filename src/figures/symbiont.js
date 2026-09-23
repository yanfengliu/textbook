// The evidence for endosymbiosis. A mitochondrion and a chloroplast, either of which can be cut open,
// beside a table of seven observations scored against two rival hypotheses: endosymbiosis, and an
// inward fold of the host's own membrane that pinched off and specialised.
//
// The figure is a piece of reasoning, not a labelled organelle. The reader picks an observation; the
// structure highlights the part that shows it, both columns fill in, and the tally counts how many of
// the observations tested so far actually tell the two hypotheses apart. Two of the seven do not, and
// one of those is the double membrane — the observation the chapter warns about by name.
//
// Scoring, and what the three words mean. `supports` is "this hypothesis predicts it", `contradicts` is
// "this hypothesis is incompatible with it", `neutral` is "it says nothing either way". An observation
// discriminates when the two columns differ, which is a comparison the figure computes rather than a
// judgement written into the table: double membrane and genes-in-nucleus come out supports/supports and
// therefore settle nothing, and the other five come out supports/contradicts.
//
// Scale. The two membranes are about 7 nm thick on an organelle 1000 nm across, so at true scale they
// would be a thousandth of the drawing and invisible. They are drawn as bands about 3% of the body's
// half-length, in the way a textbook section does, so that "two membranes" is a thing the reader can
// look at. Everything else — the shape, the proportion of the body the cristae and grana take, the
// relative sizes named under each organelle — is to scale with itself.
//
// Colour. The outer membrane is the host's, so it takes the `membrane` colour the reader already knows;
// the inner membrane is the swallowed cell's own, so it takes the organelle's colour. That difference is
// not decoration: it is the observation in the last row but one.
//
// Two compositions, chosen by a ResizeObserver: wide puts the drawing beside the table, narrow stacks
// them and the table drops to the short form of each observation with a glyph in each cell.
import { el, h, text, C, tint, smooth, uid, tween, clamp } from './lib/svg.js';
import { ORGANELLE_BY_ID } from '../palette.js';
import { colourOf } from './lib/cell3-colours.js';
import { mulberry32, outline, insetOutline, scatterInside, loopPoints } from './lib/cell3-draw.js';

export const meta = { kind: 'symbiont', title: 'The evidence for endosymbiosis', needsWebGL: false, aspect: 16 / 9 };

const SEED = 20260310;
const NARROW_W = 640;
const OPEN_MS = 420;
// A clip region with no area. `d=""` leaves the clipped group fully visible in Chromium, which showed the
// whole section through a closed organelle; a degenerate subpath far outside the view clips properly.
const EMPTY_CLIP = 'M-99999 -99999L-99998 -99999L-99998 -99998Z';

// Ordered as the chapter argues them: the one that settles nothing first, then the ones that do.
const OBSERVATIONS = Object.freeze([
  {
    id: 'double-membrane',
    part: 'membranes',
    short: 'Two membranes',
    mid: 'Each organelle is wrapped in two membranes, an outer and an inner.',
    full: 'Each organelle is wrapped in two membranes: a smooth outer one, and an inner one thrown into folds.',
    endosymbiosis: 'supports',
    infolding: 'supports',
    why: 'Endosymbiosis expects two — the swallowed cell’s own membrane, and the pocket of host membrane that swallowed it. Infolding expects two for its own reason: a pouch pinched off the surface has an inner face and an outer one. Both stories predict it, so on its own it settles nothing.',
  },
  {
    id: 'circular-dna',
    part: 'dna',
    short: 'Circular DNA, no histones',
    mid: 'A genome of its own: one circular molecule, no histones, loose inside.',
    full: 'Each carries its own genome: usually one circular molecule with no histones wrapped round it, sitting loose in the matrix or stroma.',
    endosymbiosis: 'supports',
    infolding: 'contradicts',
    why: 'That is a bacterial nucleoid. The host’s own chromosomes are linear and wound on histones, and a pouch of the host’s membrane would enclose cytosol — not a second genome of a different kind.',
  },
  {
    id: 'bacterial-ribosomes',
    part: 'ribosomes',
    short: 'Bacterial-type ribosomes',
    mid: 'It makes its own ribosomes, and they are the bacterial kind, not the cytosol’s.',
    full: 'Both make their own ribosomes, and those ribosomes are of the bacterial type rather than the cytosol’s.',
    endosymbiosis: 'supports',
    infolding: 'contradicts',
    why: 'The host has only one kind of ribosome to give. A second kind inside the organelle means a second lineage of protein-making machinery got in from somewhere.',
  },
  {
    id: 'antibiotics',
    part: 'ribosomes',
    short: 'Antibiotics act on them',
    mid: 'Antibiotics that jam bacterial protein synthesis interfere with mitochondria too.',
    full: 'Antibiotics that jam bacterial protein synthesis interfere with mitochondria as well — a real side effect of some of them.',
    endosymbiosis: 'supports',
    infolding: 'contradicts',
    why: 'The drug is a reagent here: it binds bacterial ribosomes and not ours, so where it bites, a bacterial ribosome is. Same conclusion as the row above, reached from a hospital pharmacy rather than a microscope.',
  },
  {
    id: 'fission',
    part: 'fission',
    short: 'Division by fission',
    mid: 'They divide by pinching in two, and a cell that loses them cannot build a new one.',
    full: 'Both divide by pinching in two, and a cell that loses all of them cannot make a new one.',
    endosymbiosis: 'supports',
    infolding: 'contradicts',
    why: 'Every compartment made by infolding — the Golgi, the ER — is rebuilt from the membrane it came from. These are not. Every mitochondrion comes from a mitochondrion, which is Virchow’s rule one level down.',
  },
  {
    id: 'sequence-match',
    part: 'dna',
    short: 'Genes match living bacteria',
    mid: 'Their genes are closest to alphaproteobacteria and to cyanobacteria.',
    full: 'Sequencing places mitochondrial genes closest to the alphaproteobacteria, and chloroplast genes closest to the cyanobacteria.',
    endosymbiosis: 'supports',
    infolding: 'contradicts',
    why: 'This names the partner. The sequences sort each organelle onto a branch of the bacterial tree, which is not something a fold of the host’s own membrane could do.',
  },
  {
    id: 'genes-in-nucleus',
    part: 'import',
    short: 'Most genes now in the nucleus',
    mid: 'A mitochondrion needs a thousand proteins; its own genome encodes thirteen.',
    full: 'A working mitochondrion needs more than a thousand different proteins and its own genome encodes thirteen; the rest are made in the cytosol and imported.',
    endosymbiosis: 'supports',
    infolding: 'supports',
    why: 'Infolding expects every gene to be nuclear, and almost every one is. Endosymbiosis expects the same after two billion years of genes moving to the nucleus. The tell-tale is not the genes that left but the handful that stayed.',
  },
]);

const BY_ID = Object.fromEntries(OBSERVATIONS.map((o) => [o.id, o]));

const ORGANELLES = Object.freeze({
  mitochondrion: { id: 'mitochondrion', name: 'Mitochondrion', um: 2, inner: 'mitochondrion' },
  chloroplast: { id: 'chloroplast', name: 'Chloroplast', um: 5, inner: 'chloroplast' },
});

const VERDICT = {
  supports: { glyph: '✓', word: 'supports', long: 'predicts it' },
  contradicts: { glyph: '✗', word: 'contradicts', long: 'cannot explain it' },
  neutral: { glyph: '–', word: 'says nothing', long: 'says nothing either way' },
};

const CSS = `
/* 50%: one step deeper than INK.gold's 55% in src/figures/lib/mol-draw.js, because this one is written
   on the table's PRESSED row rather than on the page. At the 66% it started at it is #8f7422 — 3.87:1 on
   --paper-2 and 3.37:1 on that row; at 55% it is 4.48:1 there, still under AA; at 50% it is 4.99:1
   (measured 2026-09-16, npm run legible). */
.tb-symbiont { --sy-gold: color-mix(in srgb, var(--gold) 50%, var(--ink));
  position: absolute; inset: 0; display: grid; box-sizing: border-box;
  padding: 0.35rem 0.7rem var(--sy-pad, 3rem); gap: 0.3rem 0.9rem; font-family: var(--font-ui);
  grid-template-columns: minmax(0, 51fr) minmax(0, 49fr);
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas: "art table" "note note"; }
.tb-symbiont .sy-art { grid-area: art; position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.tb-symbiont .sy-art svg { display: block; position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.tb-symbiont .sy-tablewrap { grid-area: table; min-width: 0; min-height: 0; display: flex;
  flex-direction: column; justify-content: center; gap: 0.15rem; overflow: clip; }
.tb-symbiont .sy-note { grid-area: note; min-width: 0; display: flex; align-items: baseline; gap: 0.8rem; }
.tb-symbiont .sy-why { flex: 1 1 auto; font-size: var(--text-xs); line-height: 1.4; color: var(--ink-soft);
  text-wrap: pretty; min-height: 5.6em; }
.tb-symbiont .sy-why b { color: var(--ink); font-weight: 600; }
.tb-symbiont .sy-why em { font-style: normal; color: var(--sy-gold); font-weight: 600; }
.tb-symbiont .sy-tally { flex: 0 0 auto; font-size: var(--text-xs); color: var(--ink); font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums; text-align: right; line-height: 1.4; }
.tb-symbiont .sy-tally span { display: block; font-weight: 400; color: var(--ink-faint); }

.tb-symbiont .sy-head { display: grid; grid-template-columns: minmax(0, 1fr) 5.6rem 5.6rem;
  gap: 0 0.3rem; font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-faint); padding: 0 0.3rem 0.2rem; border-bottom: 1px solid var(--rule-strong); }
.tb-symbiont .sy-head span + span { text-align: center; }
.tb-symbiont .sy-row { display: grid; grid-template-columns: minmax(0, 1fr) 5.6rem 5.6rem;
  gap: 0 0.3rem; align-items: center; width: 100%; text-align: left; appearance: none; font: inherit;
  font-family: var(--font-ui); color: var(--ink); background: none; border: 0;
  border-bottom: 1px solid var(--rule); border-left: 2px solid transparent;
  padding: 0.3rem 0.3rem 0.3rem 0.42rem; cursor: pointer; }
.tb-symbiont .sy-row:hover { background: color-mix(in srgb, var(--ink) 5%, transparent); }
.tb-symbiont .sy-row:focus-visible { outline: 2px solid var(--water); outline-offset: -2px; }
/* 4%, not 7%: the row's own flag and verdict are written in --sy-gold and --coral-text, and over a 7%
   ink ground those measured 4.22:1 and 4.29:1 in the light theme (2026-09-16). The row is also marked by
   its left border, so the ground does not have to carry the state on its own. */
.tb-symbiont .sy-row[aria-pressed="true"] { background: color-mix(in srgb, var(--ink) 4%, transparent);
  border-left-color: var(--ink); }
.tb-symbiont .sy-row[data-same="yes"] { border-left-color: var(--gold); }
.tb-symbiont .sy-obs { font-size: var(--text-xs); line-height: 1.3; text-wrap: pretty; }
.tb-symbiont .sy-flag { display: inline-block; margin-left: 0.35rem; font-size: 0.62rem;
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--sy-gold); }
/* A verdict is a mark and a word in the accent's text colour, not a pill: the check's own vocabulary,
   a coloured glyph and never colour alone. An untested row holds a dot in the faint ink. */
.tb-symbiont .sy-cell { font-size: var(--text-xs); line-height: 1.2; text-align: center; color: var(--ink-faint);
  white-space: nowrap; }
.tb-symbiont .sy-cell[data-v] { font-weight: 600; }
.tb-symbiont .sy-cell[data-v="supports"] { color: var(--leaf-text); }
.tb-symbiont .sy-cell[data-v="contradicts"] { color: var(--coral-text); }
.tb-symbiont .sy-cell[data-v="neutral"] { color: var(--ink-faint); }

.tb-symbiont text { font-family: var(--font-ui); }
.tb-symbiont .sy-name { fill: var(--ink); font-weight: 600; }
.tb-symbiont .sy-sub { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-symbiont .sy-tag text { fill: var(--ink); font-weight: 600; paint-order: stroke;
  stroke: var(--paper); stroke-width: 3.4; stroke-linejoin: round; }
.tb-symbiont .sy-tag line { stroke: var(--ink-faint); stroke-width: 1; }
.tb-symbiont .sy-part { transition: opacity 180ms ease; }
.tb-symbiont .sy-p-fission { opacity: 0.42; }
.tb-symbiont .sy-p-import { opacity: 0.6; }
.tb-symbiont svg[data-hot] .sy-part { opacity: 0.28; }
.tb-symbiont svg[data-hot] .sy-part.is-hot { opacity: 1; }
.tb-symbiont .sy-halo { display: none; }
.tb-symbiont .is-hot .sy-halo { display: block; }
.tb-symbiont .sy-back { cursor: pointer; }
.tb-symbiont .sy-backhit:focus-visible { outline: 2px solid var(--water); outline-offset: 2px; }

.tb-symbiont.is-narrow { grid-template-columns: minmax(0, 1fr); gap: 0.2rem;
  grid-template-rows: minmax(118px, 40fr) auto auto; grid-template-areas: "art" "table" "note"; }
.tb-symbiont.is-narrow .sy-head, .tb-symbiont.is-narrow .sy-row {
  grid-template-columns: minmax(0, 1fr) 1.5rem 1.5rem; gap: 0 0.15rem; }
.tb-symbiont.is-narrow .sy-row { padding: 0.1rem 0.25rem 0.1rem 0.35rem; }
.tb-symbiont.is-narrow .sy-obs { font-size: 0.71rem; }
.tb-symbiont.is-narrow .sy-cell { font-size: 0.76rem; line-height: 1.15; }
.tb-symbiont.is-narrow .sy-head { font-size: 0.55rem; letter-spacing: 0.02em; padding-bottom: 0.12rem; }
.tb-symbiont.is-narrow .sy-head span + span { font-size: 0.5rem; }
.tb-symbiont.is-narrow .sy-note { flex-direction: column; align-items: stretch; gap: 0; }
.tb-symbiont.is-narrow .sy-tally { text-align: left; font-size: 0.68rem; }
.tb-symbiont.is-narrow .sy-tally span { display: inline; }
.tb-symbiont.is-narrow .sy-tally span::before { content: ' · '; }
.tb-symbiont.is-narrow .sy-why { min-height: 5.1em; font-size: 0.66rem; line-height: 1.3; }
`;

// ---------- one organelle, drawn in its own local space around (0, 0) ----------
// Returns the SVG nodes plus the local anchors the tags hang on. `rx` is the body's half-length.
function buildOrganelle(kind, rx, rng) {
  const isMito = kind === 'mitochondrion';
  const ry = rx * (isMito ? 0.46 : 0.56);
  const body = isMito
    ? outline(0, 0, rx, ry, { p: 2.7, bend: 0.30 })
    : outline(0, 0, rx, ry, { p: 2.15, taper: 0.11 });
  const tm = Math.max(2.4, rx * 0.030); // one membrane, drawn thick enough to be a thing you can see
  const gap = Math.max(2.0, rx * 0.026); // the intermembrane space
  const faceIn = insetOutline(body, tm);
  const innerOut = insetOutline(body, tm + gap);
  const matrix = insetOutline(body, tm + gap + tm);
  const rxIn = rx - (tm + gap + tm);
  const ryIn = ry - (tm + gap + tm);

  const outerCol = ORGANELLE_BY_ID.membrane.color;
  const innerCol = colourOf(ORGANELLES[kind].inner);
  const ring = (a, b) => `${smooth(a)} ${smooth(b)}`;

  const nodes = [];
  const halo = (d, w) => el('path', { class: 'sy-halo', d, fill: 'none', stroke: C.gold, 'stroke-width': w, 'stroke-linejoin': 'round', opacity: 0.85 });

  // The section: outer membrane band, intermembrane space, inner membrane band, matrix.
  const membranes = el('g', { class: 'sy-part sy-p-membranes' }, [
    halo(ring(body, matrix), 3),
    el('path', { d: ring(body, faceIn), fill: tint(outerCol, 96), 'fill-rule': 'evenodd' }),
    el('path', { d: ring(faceIn, innerOut), fill: C.paper, 'fill-rule': 'evenodd' }),
    el('path', { d: ring(innerOut, matrix), fill: tint(innerCol, 94), 'fill-rule': 'evenodd' }),
  ]);
  nodes.push(el('path', { d: smooth(matrix), fill: tint(innerCol, isMito ? 16 : 14) }), membranes);

  // Where an outline actually is at a given x, read off the outline itself rather than from the formula
  // that made it: a mitochondrion is a bean, so its bend moves every interior feature with it, and a
  // crista that starts three pixels inside its own membrane reads as a mistake.
  const edgeY = (pts, x, sign) => {
    let best = null;
    for (let i = 0; i < pts.length; i += 1) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      if ((x0 - x) * (x1 - x) > 0) continue;
      const y = y0 + ((y1 - y0) * (x - x0)) / ((x1 - x0) || 1e-6);
      if (best === null || (sign > 0 ? y > best : y < best)) best = y;
    }
    return best ?? 0;
  };
  const midY = (x) => (edgeY(matrix, x, 1) + edgeY(matrix, x, -1)) / 2;

  // Cristae or grana: folds of the inner membrane, so they carry the inner membrane's colour.
  const folds = [];
  const ridges = []; // the same structures as faint hints on the intact surface
  const granaCentres = [];
  if (isMito) {
    for (let i = 0; i < 7; i += 1) {
      const side = i % 2 ? 1 : -1;
      const x = (-0.78 + i * 0.26) * rxIn;
      const yb = edgeY(matrix, x, side);
      const mid = midY(x);
      const yt = mid - side * Math.abs(yb - mid) * 0.30;
      const d = `M${x.toFixed(1)} ${yb.toFixed(1)} L${x.toFixed(1)} ${yt.toFixed(1)}`;
      folds.push(el('path', { d, fill: 'none', stroke: tint(innerCol, 82), 'stroke-width': (tm * 2.5).toFixed(2), 'stroke-linecap': 'round' }));
      folds.push(el('path', { d, fill: 'none', stroke: tint(innerCol, 20), 'stroke-width': (tm * 0.85).toFixed(2), 'stroke-linecap': 'round' }));
      const top = edgeY(matrix, x, -1);
      const bot = edgeY(matrix, x, 1);
      ridges.push(el('path', {
        d: `M${x.toFixed(1)} ${(top + (bot - top) * 0.16).toFixed(1)} Q${(x + rx * 0.035).toFixed(1)} ${((top + bot) / 2).toFixed(1)} ${x.toFixed(1)} ${(bot - (bot - top) * 0.16).toFixed(1)}`,
        fill: 'none', stroke: tint(innerCol, 62), 'stroke-width': Math.max(1, tm * 0.6).toFixed(2), 'stroke-linecap': 'round', opacity: 0.4,
      }));
    }
  } else {
    // Grana: stacks of flattened discs, joined between stacks by stroma lamellae.
    const stacks = [-0.66, -0.34, -0.02, 0.32, 0.64];
    const discW = rxIn * 0.15;
    const discH = Math.max(2.2, tm * 0.85);
    const pitch = discH * 2.2;
    const centres = [];
    stacks.forEach((u, i) => {
      const n = 4 + (i % 2);
      const x = u * rxIn;
      const room = Math.abs(edgeY(matrix, x, 1) - edgeY(matrix, x, -1)) / 2;
      const y = midY(x) + (i % 2 ? 1 : -1) * Math.min(ryIn * 0.20, Math.max(0, room - (n * discH * 1.2)));
      centres.push([x, y, n]);
      granaCentres.push([x, y, n]);
      ridges.push(el('ellipse', {
        cx: x.toFixed(1), cy: y.toFixed(1), rx: (discW * 1.1).toFixed(1), ry: (n * pitch * 0.6).toFixed(1),
        fill: tint(innerCol, 62), opacity: 0.34,
      }));
      for (let k = 0; k < n; k += 1) {
        const yy = y + (k - (n - 1) / 2) * pitch;
        folds.push(el('rect', { x: (x - discW).toFixed(1), y: (yy - discH / 2).toFixed(1), width: (discW * 2).toFixed(1), height: discH.toFixed(1), rx: (discH / 2).toFixed(1), fill: colourOf('thylakoid') }));
      }
    });
    for (let i = 0; i < centres.length - 1; i += 1) {
      const [x0, y0] = centres[i];
      const [x1, y1] = centres[i + 1];
      folds.push(el('path', { d: `M${(x0 + discW * 0.6).toFixed(1)} ${(y0 + (i % 2 ? -1 : 1) * pitch).toFixed(1)} L${(x1 - discW * 0.6).toFixed(1)} ${(y1 + (i % 2 ? 1 : -1) * pitch * 0.6).toFixed(1)}`, fill: 'none', stroke: colourOf('thylakoid'), 'stroke-width': (discH * 0.55).toFixed(2), 'stroke-linecap': 'round', opacity: 0.85 }));
    }
    // A starch grain in the stroma: a plant cell's sugar, parked where it was made.
    folds.push(el('ellipse', { cx: (rxIn * 0.42).toFixed(1), cy: (midY(rxIn * 0.42) + ryIn * 0.42).toFixed(1), rx: (rxIn * 0.12).toFixed(1), ry: (rxIn * 0.085).toFixed(1), fill: C.paper3, stroke: tint(innerCol, 35), 'stroke-width': 1 }));
  }
  nodes.push(el('g', { class: 'sy-part sy-p-folds' }, folds));

  // The circular genome: a supercoiled loop, in the book's colour for DNA.
  const dnaAt = [-rxIn * 0.46, midY(-rxIn * 0.46) + ryIn * (isMito ? 0.34 : 0.44)];
  const dnaR = Math.max(7, rxIn * 0.13);
  const dnaPath = smooth(loopPoints(dnaAt[0], dnaAt[1], dnaR, rng, { squash: 0.66 }));
  nodes.push(el('g', { class: 'sy-part sy-p-dna' }, [
    halo(dnaPath, Math.max(6, dnaR * 0.55)),
    el('path', { d: dnaPath, fill: 'none', stroke: C.violet, 'stroke-width': Math.max(1.6, dnaR * 0.17).toFixed(2) }),
  ]));

  // Bacterial ribosomes: loose in the matrix, and smaller than the cytosol's.
  const riboR = Math.max(1.6, rxIn * 0.016);
  const spots = scatterInside(matrix, 38, rng, riboR * 3.2).filter(([x, y]) => Math.hypot(x - dnaAt[0], y - dnaAt[1]) > dnaR * 1.25);
  nodes.push(el('g', { class: 'sy-part sy-p-ribosomes' }, [
    el('g', { class: 'sy-halo' }, spots.map(([x, y]) => el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (riboR * 2.2).toFixed(1), fill: C.gold, opacity: 0.5 }))),
    ...spots.map(([x, y]) => el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: riboR.toFixed(1), fill: ORGANELLE_BY_ID.ribosome.color })),
  ]));

  // The division ring: a band of protein that pinches the organelle in two, waisting the body a little.
  const fx = -rxIn * 0.06;
  const fTop = edgeY(body, fx, -1);
  const fBot = edgeY(body, fx, 1);
  const fissionD = `M${fx.toFixed(1)} ${fTop.toFixed(1)} L${fx.toFixed(1)} ${fBot.toFixed(1)}`;
  const pinch = (sign) => {
    const y = sign > 0 ? fBot : fTop;
    const back = y - sign * tm * 2.4;
    return el('path', {
      d: `M${(fx - tm * 2.8).toFixed(1)} ${back.toFixed(1)} Q${fx.toFixed(1)} ${(y + sign * tm * 0.4).toFixed(1)} ${(fx + tm * 2.8).toFixed(1)} ${back.toFixed(1)}`,
      fill: 'none', stroke: C.leaf, 'stroke-width': (tm * 0.9).toFixed(2), 'stroke-linecap': 'round',
    });
  };
  nodes.push(el('g', { class: 'sy-part sy-p-fission' }, [
    halo(fissionD, tm * 3),
    el('path', { d: fissionD, fill: 'none', stroke: C.leaf, 'stroke-width': (tm * 0.8).toFixed(2), 'stroke-dasharray': `${(tm * 1.4).toFixed(1)} ${(tm * 1.1).toFixed(1)}`, opacity: 0.9 }),
    pinch(1), pinch(-1),
  ]));

  // Protein import: channels through both membranes, and the cytosol-made proteins coming in.
  const pores = [];
  const poreXs = [-0.62, -0.30, 0.04];
  const poreW = Math.max(3.4, tm * 1.6);
  const envelope = tm + gap + tm;
  for (const u of poreXs) {
    const x = u * rxIn;
    const y0 = edgeY(body, x, -1); // the outer surface at this x; the pore runs down through both membranes
    const arrow = Math.max(1.3, tm * 0.42).toFixed(2);
    pores.push(el('rect', { class: 'sy-halo', x: (x - poreW * 0.9).toFixed(1), y: (y0 - tm * 0.9).toFixed(1), width: (poreW * 1.8).toFixed(1), height: (envelope + tm * 1.8).toFixed(1), rx: (poreW * 0.9).toFixed(1), fill: 'none', stroke: C.gold, 'stroke-width': 3 }));
    pores.push(el('rect', { x: (x - poreW / 2).toFixed(1), y: (y0 - tm * 0.3).toFixed(1), width: poreW.toFixed(1), height: (envelope + tm * 0.6).toFixed(1), rx: (poreW / 2).toFixed(1), fill: tint(C.violet, 72) }));
    pores.push(el('path', { d: `M${x.toFixed(1)} ${(y0 - tm * 5.4).toFixed(1)} L${x.toFixed(1)} ${(y0 - tm * 1.4).toFixed(1)}`, fill: 'none', stroke: C.violet, 'stroke-width': arrow }));
    pores.push(el('path', { d: `M${(x - tm * 1.0).toFixed(1)} ${(y0 - tm * 2.6).toFixed(1)} L${x.toFixed(1)} ${(y0 - tm * 1.2).toFixed(1)} L${(x + tm * 1.0).toFixed(1)} ${(y0 - tm * 2.6).toFixed(1)}`, fill: 'none', stroke: C.violet, 'stroke-width': arrow, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  nodes.push(el('g', { class: 'sy-part sy-p-import' }, pores));

  return {
    nodes,
    ridges,
    rimD: smooth(insetOutline(body, tm / 2)),
    shadeD: smooth(insetOutline(body, tm * 2.4)),
    body,
    rx,
    ry,
    tm,
    outerCol,
    innerCol,
    anchors: {
      membranes: [-rx * 0.86, edgeY(body, -rx * 0.86, 1) - tm],
      dna: dnaAt,
      ribosomes: spots.length ? spots.reduce((a, b) => (b[1] < a[1] ? b : a)) : [0, 0],
      fission: [fx, fTop],
      import: [poreXs[1] * rxIn, edgeY(body, poreXs[1] * rxIn, -1) - tm * 4.4],
    },
  };
}

const TAGS = {
  membranes: ['Outer membrane · the host’s', 'Inner membrane · the symbiont’s'],
  dna: ['Circular DNA, no histones'],
  ribosomes: ['Bacterial ribosomes'],
  fission: ['Division ring'],
  import: ['Proteins imported from the cytosol'],
};

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  const pinned = () => ctx.pinnedTime !== null && ctx.pinnedTime !== undefined;
  const instant = () => reduced || pinned();

  let front = 'mitochondrion';
  let selected = null;
  const tested = [];
  const openState = { mitochondrion: true, chloroplast: true };
  const cutP = { mitochondrion: 1, chloroplast: 1 };
  let narrow = null;
  let destroyed = false;
  let ready = false;
  const tweens = new Set();

  // ----- DOM -----
  const wrap = h('div', { class: 'tb-symbiont' });
  wrap.append(h('style', { text: CSS }));
  const art = h('div', { class: 'sy-art' });
  const tableWrap = h('div', { class: 'sy-tablewrap' });
  const head = h('div', { class: 'sy-head' }, [
    h('span', { text: 'Observation' }),
    h('span', { text: 'Endosymbiosis' }),
    h('span', { text: 'Inward folding' }),
  ]);
  const headCells = [...head.children].slice(1);
  const rows = new Map();
  const rowList = h('div', { role: 'group', 'aria-label': 'Seven observations, scored against two hypotheses' });
  for (const obs of OBSERVATIONS) {
    const obsText = h('span', { class: 'sy-obs' });
    const flag = h('span', { class: 'sy-flag', text: '' });
    const cellE = h('span', { class: 'sy-cell' });
    const cellI = h('span', { class: 'sy-cell' });
    const row = h('button', {
      type: 'button', class: 'sy-row', 'aria-pressed': 'false',
      'aria-label': `${obs.short}. ${obs.full} Score it against both hypotheses.`,
    }, [h('span', { class: 'sy-obs' }, [obsText, flag]), cellE, cellI]);
    row.addEventListener('click', () => select(obs.id));
    rowList.append(row);
    rows.set(obs.id, { row, obsText, flag, cellE, cellI });
  }
  tableWrap.append(head, rowList);
  const why = h('div', { class: 'sy-why', 'aria-live': 'polite' });
  const tally = h('div', { class: 'sy-tally' });
  const note = h('div', { class: 'sy-note' }, [why, tally]);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' });
  wrap.append(art, tableWrap, note);
  root.append(wrap, toolbar);

  const button = (label, onClick, pressed = null) => {
    const b = h('button', { type: 'button', class: 'fig-btn', text: label });
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    toolbar.append(b);
    return b;
  };
  const btnMito = button('Mitochondrion', () => setFront('mitochondrion'), true);
  const btnChloro = button('Chloroplast', () => setFront('chloroplast'), false);
  const btnOpen = button('Cut open', () => setOpen(!openState[front]), true);
  const btnReset = button('Reset', () => {
    tested.length = 0;
    selected = null;
    paintTable();
    paintArt();
  });
  btnReset.setAttribute('aria-label', 'Reset: clear the tally and start again');

  // ----- drawing -----
  const clipId = uid('sy-lid');
  let biteNodes = {};
  function artSvg(w, ha) {
    const rng = mulberry32(SEED);
    const back = front === 'mitochondrion' ? 'chloroplast' : 'mitochondrion';
    const nodes = [];
    const defs = el('defs');
    const svg = el('svg', { viewBox: `0 0 ${w} ${ha}`, width: w, height: ha, 'aria-hidden': 'true' });

    // The body is sized so that it and its name fit the pane it has been given: the block under it is
    // reserved first, and the half-height of a rotated body is ry·cos + rx·sin, not ry. On a phone there
    // is only room for one body, so the other is reached through the toolbar instead of the thumbnail.
    const nameBlock = narrow ? 28 : 46;
    const frontRot = front === 'mitochondrion' ? -0.14 : -0.10;
    const backRot = 0.16;
    const room = (ryK, rot) => Math.max(20, (ha - nameBlock) / 2 - 10) / (ryK * Math.cos(rot) + Math.abs(Math.sin(rot)));
    const ryK = front === 'mitochondrion' ? 0.46 : 0.56;
    const frontRx = Math.min(w * (narrow ? 0.44 : 0.40), room(ryK, frontRot));
    const backRx = frontRx * 0.46;
    const frontAt = [w * (narrow ? 0.5 : 0.46), (ha - nameBlock) / 2];
    const backAt = [w * 0.82, ha * 0.28];

    biteNodes = {};
    const place = (kind, at, rx, rot, isFront) => {
      const g = buildOrganelle(kind, rx, rng);
      const deg = (rot * 180) / Math.PI;
      // Two clip paths per organelle, both driven by the same bite outline: the section is drawn only
      // inside the bite, the intact surface only outside it. A clipPath unions its children, so
      // "everything except the bite" has to be one path element with two subpaths and even-odd, not two
      // elements — as two it clipped nothing and the lid covered the whole drawing.
      const inId = `${clipId}-${kind}-in`;
      const outId = `${clipId}-${kind}-out`;
      const bodyId = `${clipId}-${kind}-body`;
      const bodyD = smooth(g.body);
      const f = (rx * 3).toFixed(0);
      const frame = `M-${f} -${f}H${f}V${f}H-${f}Z`;
      const inPath = el('path', { d: EMPTY_CLIP });
      const outPath = el('path', { d: frame, 'clip-rule': 'evenodd' });
      const edge = el('path', { d: '', fill: 'none', stroke: C.faint, 'stroke-width': 1, 'clip-path': `url(#${bodyId})`, opacity: 0.7 });
      biteNodes[kind] = { inPath, outPath, edge, frame, rx: g.rx, ry: g.ry };
      defs.append(
        el('clipPath', { id: inId, clipPathUnits: 'userSpaceOnUse' }, [inPath]),
        el('clipPath', { id: outId, clipPathUnits: 'userSpaceOnUse' }, [outPath]),
        el('clipPath', { id: bodyId, clipPathUnits: 'userSpaceOnUse' }, [el('path', { d: bodyD })]),
      );
      const section = el('g', { 'clip-path': `url(#${inId})` }, g.nodes);
      // The intact surface: the body in the outer membrane's colour, with one soft highlight so it
      // reads as a body and not a sticker, and the folds beneath showing as faint ridges.
      const lid = el('g', { 'clip-path': `url(#${outId})` }, [
        el('path', { d: bodyD, fill: tint(g.innerCol, 40), stroke: tint(g.innerCol, 60), 'stroke-width': 1 }),
        ...g.ridges,
        el('path', { d: g.shadeD, fill: 'none', stroke: tint(g.innerCol, 70), 'stroke-width': (g.tm * 2.6).toFixed(2), opacity: 0.22 }),
        el('path', { d: g.rimD, fill: 'none', stroke: tint(g.outerCol, 92), 'stroke-width': g.tm.toFixed(2) }),
        el('ellipse', { cx: (-g.rx * 0.30).toFixed(1), cy: (-g.ry * 0.42).toFixed(1), rx: (g.rx * 0.44).toFixed(1), ry: (g.ry * 0.28).toFixed(1), fill: C.paper, opacity: 0.26 }),
      ]);
      const node = el('g', {
        class: isFront ? 'sy-front' : 'sy-back',
        transform: `translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${deg.toFixed(2)})`,
        opacity: isFront ? 1 : 0.82,
      }, [section, lid, edge]);
      return { g, node, at, deg };
    };

    // Draw the back one first so the front sits over it.
    const b = narrow ? null : place(back, backAt, backRx, backRot, false);
    const f = place(front, frontAt, frontRx, frontRot, true);

    // A hit area over the back organelle, so it can be brought forward by click or by keyboard.
    const hit = b && el('rect', {
      class: 'sy-backhit',
      x: (b.at[0] - backRx * 1.05).toFixed(1), y: (b.at[1] - backRx * 0.8).toFixed(1),
      width: (backRx * 2.1).toFixed(1), height: (backRx * 1.6).toFixed(1),
      rx: 8, fill: 'transparent', tabindex: '0', role: 'button',
      'aria-label': `Bring the ${ORGANELLES[back].name.toLowerCase()} to the front`,
      onclick: () => setFront(back),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFront(back); } },
    });

    // Name and scale bar. The two bodies are drawn at different magnifications — the one in front fills
    // the pane whichever it is — so each carries its own micrometre, which is how a micrograph says it.
    const nameFor = (rec, kind, big, above) => {
      const rot = (rec.deg * Math.PI) / 180;
      const halfH = rec.g.ry * Math.cos(rot) + rec.g.rx * Math.abs(Math.sin(rot));
      const size = big ? 13 : 11;
      const tick = big ? 4.5 : 3.5;
      const barW = (2 * rec.g.rx) / ORGANELLES[kind].um;
      const label = big ? 30 : 26;
      const oneLine = big && narrow;
      const nameW = oneLine ? ORGANELLES[kind].name.length * 6.6 + 12 : 0;
      const x0 = rec.at[0] - (barW + 6 + label) / 2 + nameW / 2;
      const yName = rec.at[1] + (above ? -halfH - (big ? 30 : 26) : halfH + (big ? 20 : 18));
      const yBar = oneLine ? yName - 4 : yName + (big ? 17 : 14);
      return el('g', {}, [
        text(oneLine ? x0 - 12 : rec.at[0], yName, ORGANELLES[kind].name, { anchor: oneLine ? 'end' : 'middle', class: 'sy-name', 'font-size': size }),
        el('path', {
          d: `M${x0.toFixed(1)} ${(yBar - tick).toFixed(1)}v${(tick * 2).toFixed(1)}M${x0.toFixed(1)} ${yBar.toFixed(1)}h${barW.toFixed(1)}M${(x0 + barW).toFixed(1)} ${(yBar - tick).toFixed(1)}v${(tick * 2).toFixed(1)}`,
          fill: 'none', stroke: C.faint, 'stroke-width': 1.1,
        }),
        text(x0 + barW + 6, yBar + (big ? 4 : 3.4), '1 µm', { class: 'sy-sub', 'font-size': big ? 10.5 : 9.5 }),
      ]);
    };

    nodes.push(defs);
    if (b) nodes.push(b.node, hit);
    nodes.push(f.node);
    if (b) nodes.push(nameFor(b, back, false, true));
    nodes.push(nameFor(f, front, true, false));

    // The tag for the highlighted part, on the front organelle only.
    const obs = selected && openState[front] ? BY_ID[selected] : null;
    if (obs) {
      const [ax, ay] = f.g.anchors[obs.part];
      const cs = Math.cos(f.deg * Math.PI / 180);
      const sn = Math.sin(f.deg * Math.PI / 180);
      const wx = f.at[0] + ax * cs - ay * sn;
      const wy = f.at[1] + ax * sn + ay * cs;
      // Which side the tag goes, and where it can sit without running off the pane. The width of a
      // label is estimated from its longest line (about 6.2 px a character at 11 px), because SVG text
      // cannot be measured before it is in the document, and a label clamped by its anchor alone ran
      // off the left edge whenever it was long and set to end-anchor.
      const lines = TAGS[obs.part];
      const fontSize = narrow ? 10 : 11;
      const estW = Math.max(...lines.map((l) => l.length)) * fontSize * 0.56;
      const room = (side) => (side < 0 ? wx - 30 : w - wx - 30);
      let dir = wx > w * 0.52 ? -1 : 1;
      if (room(dir) < estW + 8 && room(-dir) > room(dir)) dir = -dir;
      const raw = wx + dir * 30;
      const tx = dir < 0 ? Math.max(raw, estW + 8) : Math.min(raw, w - estW - 8);
      const toLeft = dir < 0;
      const above = wy < ha * 0.55;
      const ty = clamp(wy + (above ? -1 : 1) * (narrow ? 22 : 30), 12 + lines.length * 6, ha - 22);
      const tag = el('g', { class: 'sy-tag' }, [
        el('line', { x1: wx.toFixed(1), y1: wy.toFixed(1), x2: tx.toFixed(1), y2: ty.toFixed(1) }),
        el('circle', { cx: wx.toFixed(1), cy: wy.toFixed(1), r: 2.4, fill: C.gold, stroke: C.paper, 'stroke-width': 1 }),
        ...lines.map((line, i) => text(tx, ty + i * 13 - (lines.length - 1) * 6, line, { anchor: toLeft ? 'end' : 'start', 'font-size': narrow ? 10 : 11 })),
      ]);
      nodes.push(tag);
      svg.setAttribute('data-hot', obs.part);
    }
    svg.append(...nodes);
    if (obs) for (const g of svg.querySelectorAll(`.sy-p-${obs.part}`)) g.classList.add('is-hot');
    return svg;
  }

  function biteFor(kind, p) {
    const rec = biteNodes[kind];
    if (!rec) return;
    if (p <= 0.002) {
      rec.inPath.setAttribute('d', EMPTY_CLIP);
      rec.outPath.setAttribute('d', rec.frame);
      rec.edge.setAttribute('d', '');
      return;
    }
    const cx = -rec.rx * 0.38;
    const pts = outline(cx, 0, rec.rx * 0.70 * p, rec.ry * 1.7 * p, { n: 52, p: 2.1, taper: -0.10, rot: 0.20 });
    // A torn edge rather than a clean oval: the cut is a break, not a machined window.
    const rng = mulberry32(SEED + 7);
    const torn = pts.map(([x, y]) => {
      const k = 1 + (rng() - 0.5) * 0.06;
      return [cx + (x - cx) * k, y * k];
    });
    const d = smooth(torn);
    rec.inPath.setAttribute('d', d);
    rec.outPath.setAttribute('d', `${rec.frame} ${d}`);
    rec.edge.setAttribute('d', d);
  }

  function applyBites() {
    for (const kind of Object.keys(biteNodes)) biteFor(kind, cutP[kind]);
  }

  function paintArt() {
    const w = Math.max(120, Math.round(art.clientWidth));
    const ha = Math.max(90, Math.round(art.clientHeight));
    art.replaceChildren(artSvg(w, ha));
    applyBites();
  }

  // ----- the table -----
  function paintTable() {
    for (const obs of OBSERVATIONS) {
      const r = rows.get(obs.id);
      const on = tested.includes(obs.id);
      const same = obs.endosymbiosis === obs.infolding;
      r.obsText.textContent = narrow ? obs.short : obs.mid;
      r.row.setAttribute('aria-pressed', String(selected === obs.id));
      r.row.dataset.same = on && same ? 'yes' : 'no';
      r.flag.textContent = on && same && !narrow ? 'no help' : '';
      for (const [cell, verdict] of [[r.cellE, obs.endosymbiosis], [r.cellI, obs.infolding]]) {
        if (!on) {
          cell.textContent = '·';
          cell.removeAttribute('data-v');
          continue;
        }
        const v = VERDICT[verdict];
        cell.textContent = narrow ? v.glyph : `${v.glyph} ${v.word}`;
        cell.dataset.v = verdict;
      }
    }
    const n = tested.length;
    const d = tested.filter((id) => BY_ID[id].endosymbiosis !== BY_ID[id].infolding).length;
    tally.replaceChildren(
      document.createTextNode(n ? `${d} of ${n} discriminate` : 'Nothing tested yet'),
      h('span', { text: n === OBSERVATIONS.length ? 'all seven tested' : `${OBSERVATIONS.length - n} to try` }),
    );
    why.replaceChildren();
    if (!selected) {
      why.append(h('b', { text: 'Pick an observation. ' }), document.createTextNode('Each is highlighted in the structure and scored against both hypotheses. The ones worth having are the ones the two columns disagree about.'));
      return;
    }
    const obs = BY_ID[selected];
    const same = obs.endosymbiosis === obs.infolding;
    if (narrow) why.append(h('b', { text: `Endosymbiosis ${VERDICT[obs.endosymbiosis].word}, inward folding ${VERDICT[obs.infolding].word}. ` }));
    else why.append(h('b', { text: `${obs.full} ` }));
    why.append(document.createTextNode(obs.why));
    if (same) why.append(document.createTextNode(' '), h('em', { text: 'It does not tell the two apart.' }));
  }

  function select(id) {
    selected = id;
    if (!tested.includes(id)) tested.push(id);
    paintTable();
    if (!openState[front]) setOpen(true); // setOpen repaints nothing, so the paint below still runs
    paintArt();
  }

  function setFront(kind) {
    if (front === kind) return;
    front = kind;
    btnMito.setAttribute('aria-pressed', String(front === 'mitochondrion'));
    btnChloro.setAttribute('aria-pressed', String(front === 'chloroplast'));
    btnOpen.setAttribute('aria-pressed', String(openState[front]));
    paintArt();
  }

  function setOpen(on) {
    const kind = front;
    openState[kind] = on;
    btnOpen.setAttribute('aria-pressed', String(on));
    const from = cutP[kind];
    const to = on ? 1 : 0;
    // `let`, declared before the call, because `tween()` runs `done` SYNCHRONOUSLY when it is instant —
    // which is every mount under reduced motion and every run of a gate that pins the clock. With `const`
    // the callback reached `tw` inside its own temporal dead zone and the page threw
    // "Cannot access 'tw' before initialization" on load, found by npm run legible on 2026-09-16.
    let tw;
    tw = tween({
      duration: OPEN_MS,
      instant: instant(),
      update: (p) => { cutP[kind] = from + (to - from) * p; biteFor(kind, cutP[kind]); },
      done: () => tweens.delete(tw),
    });
    if (tw.running) tweens.add(tw);
  }

  // ----- layout -----
  let padPx = 0;
  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    if (!w) return false;
    const wantNarrow = w < NARROW_W;
    const changed = wantNarrow !== narrow;
    if (changed) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
      btnMito.textContent = narrow ? 'Mito.' : 'Mitochondrion';
      btnChloro.textContent = narrow ? 'Chloro.' : 'Chloroplast';
      btnOpen.textContent = narrow ? 'Open' : 'Cut open';
      headCells[0].textContent = narrow ? 'Endo' : 'Endosymbiosis';
      headCells[1].textContent = narrow ? 'Fold' : 'Inward folding';
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 22;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--sy-pad', `${pad}px`);
    }
    return changed;
  }

  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    const changed = applyLayout();
    if (changed) paintTable();
    paintArt();
    if (!ready) { ready = true; ctx.onReady(); }
  });
  observer.observe(root);
  observer.observe(toolbar);
  observer.observe(art);

  applyLayout();
  paintTable();
  paintArt();
  if (root.getBoundingClientRect().width) { ready = true; ctx.onReady(); }

  return {
    destroy() {
      destroyed = true;
      for (const tw of tweens) tw.cancel();
      tweens.clear();
      observer.disconnect();
      root.replaceChildren();
    },
    setTime() {
      for (const tw of tweens) tw.finish();
      tweens.clear();
      for (const kind of Object.keys(cutP)) cutP[kind] = openState[kind] ? 1 : 0;
      applyBites();
    },
    setVisible() {},
    setTheme() { paintArt(); },
    describe() {
      const obs = selected ? BY_ID[selected] : null;
      return {
        organelle: front,
        open: openState[front],
        observation: selected,
        verdict: {
          endosymbiosis: obs ? obs.endosymbiosis : null,
          infolding: obs ? obs.infolding : null,
        },
        discriminates: Boolean(obs && obs.endosymbiosis !== obs.infolding),
        tested: [...tested],
        discriminatingCount: tested.filter((id) => BY_ID[id].endosymbiosis !== BY_ID[id].infolding).length,
        highlighted: obs ? obs.part : null,
      };
    },
  };
}
