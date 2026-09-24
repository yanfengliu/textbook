// Figure 8.1, `helix-lab`: read the photograph, then build the pairs. Two scenes, chosen with Scene.
//
// THE PHOTOGRAPH. On the left a helix the reader builds, drawn from the side: one, two or three strands of
// a given radius and pitch, with a dot at each repeating unit. On the right, in a canvas pane, the X-ray
// fibre-diffraction pattern that helix would give, recalculated as it changes, and beside it, in its own
// pane, the positions measured on Franklin's B-form photograph: the spacing of the rows (layer lines), the
// heavy arc on the axis, the spread of the X that gives the diameter, and the fourth row, missing.
//
// THE PATTERN IS A CALCULATION FROM THE MODEL, NOT PHOTOGRAPH 51. The figure does not reproduce the
// photograph or imitate it as one: it draws a smooth map of calculated intensity inside a round window,
// in the book's own ink on the paper, labelled "calculated" on the stage.
//
// The calculation is the one Cochran, Crick and Vand published for a helix of point scatterers (Acta
// Cryst. 5:581, 1952), cylindrically averaged, as a fibre is:
//   - The rows lie at Z = l / P (per nm) for pitch P, l = 1, 2, 3 ...
//   - With N = P / h units a turn (h the rise per unit), row l takes the Bessel orders n = l − mN for every
//     whole m, and its intensity at reciprocal radius R is the sum of J_n(2πrR)² over them, r being the
//     helix radius. The lowest orders make the cross, n = 0 on row N makes the arc on the axis at 1 / h,
//     and the arms' slope is set by r / P. N is a whole number because the Rise control steps through N
//     (6 to 14 a turn) rather than sliding, so the selection rule is exact.
//   - s strands, each a fraction f of a turn along the axis from the last, multiply row l by
//     |Σ_k exp(2πi·l·k·f)|² / s². For two strands that is cos²(πlf): zero on row 4 and on no other of the
//     first nine at f = 3/8, and zero on every odd row at f = 1/2, which is a different photograph. A row
//     counts as missing when that factor is below 0.05.
//   - The blur, for the disorder of a fibre, is stated here because it is a choice: each row is a Gaussian
//     of σ 0.03 per nm in Z; the pattern is arced by a Gaussian spread of fibre tilt of σ 3.5°, sampled at
//     seven angles over ±2.1σ; exp(−0.2 |S|²) stands in for thermal disorder; and the square root of the
//     intensity is drawn, which compresses its range the way a film does. Row 0, the equator, is left out,
//     as the beam stop leaves out the centre.
//   - J_n comes from Miller's backward recurrence, normalised by J0 + 2(J2 + J4 + ...) = 1.
//
// The offset runs from 1/4 to 1/2 of a turn. An offset of 1/8 also silences the fourth row and no other, so
// the pattern alone cannot tell 1/8 from 3/8; the chemistry can. The two sugars of one pair are about
// 1.07 nm apart on a helix whose sugars sit about 0.59 nm from the axis, which puts them about 130° apart
// round it: near 3/8 of a turn (135°) and far from 1/8 (45°). The slider stops where that argument does.
//
// THE PAIRS. Two backbone rails 2 nm apart and one base pair drawn to scale between them. The ring atoms are
// the standard base coordinates of Olson et al., J. Mol. Biol. 313:229 (2001), in the frame 3DNA uses: x
// toward the major groove, y along the pair. They were transcribed for this figure and checked only for
// consistency (ring bonds 1.31–1.45 Å, C=O 1.22–1.24 Å, C1′–N 1.46–1.47 Å), not against the paper's
// table. Each base is set with its Watson–Crick edge facing its partner's: the middle atoms (N1 of a
// purine, N3 of a pyrimidine) 2.95 Å apart on the pair's axis, the partner mirrored through the pair's
// pseudo-dyad when the strands run antiparallel and turned half a turn in the plane when they run parallel,
// which is what puts its sugar on the major-groove side. The width, `pairWidthNm`, is C1′ to C1′ measured
// along the pair: 1.07 nm for A·T and 1.08 for G·C, 1.1 at the precision shown, 1.25 for two purines and
// 0.9 for two pyrimidines. A pair fits the backbones when it is within 0.08 nm of the Watson–Crick pairs'
// own span.
//   - Each base offers three places on that edge — the major-groove side, the middle, the minor-groove
//     side — each a hydrogen donor (D), an acceptor (A) or nothing. A donor facing an acceptor is a
//     hydrogen bond. A donor facing a donor, or an acceptor an acceptor, is a clash, and a pair with a
//     clash is scored no bonds: it cannot make them without pulling out of shape.
//   - The rare form is guanine's and thymine's enol: the hydrogen of N1 (G) or N3 (T) carried on O6 or O4
//     instead. Every G and T on the stage takes it at once, which is the simplification: it is the form
//     the old textbook drawings showed, and in it the usual partner meets donor to donor.
//
// The narrow composition (below 800 px), on a stage two wide by three tall. A helix beside its pattern would
// put both below legibility on a phone, so the helix lies along the stage with its axis horizontal, above
// the pattern, and the pattern is turned a quarter turn with it so the fibre axis still runs the way the
// helix's does: the rows stand vertical. The measured positions are labelled in a strip under the pattern
// rather than beside it, and the table sits beneath that. The controls are steppers. Rise and the two bases
// take short labels (Rise, Left, Right; their accessible names stay whole) and every value drops its nm,
// which the table still prints, so the toolbar leaves the stage its room. The pairs scene stacks the pair,
// with its two groove sides named, above the duplex strip, and the table beneath them.

import { C, clamp, tint, el, h } from './lib/svg.js';
import { bench, fmt, EM_ADVANCE } from './lib/bench.js';
import { rgb, LIGHT } from '../palette.js';

export const meta = { kind: 'helix-lab', title: 'Read the photograph, then build the pairs', needsWebGL: false, aspect: 16 / 9, narrowAspect: 2 / 3 };

const NARROW_W = 800;
const TOL = 1e-9;

// ---------------------------------------------------------------- the photograph: the model

const OPEN_PHOTO = Object.freeze({ strands: 1, pitch: 2.8, perTurn: 7, radius: 0.6, offset16: 8 });
const FRACTION = { 4: '1/4', 5: '5/16', 6: '3/8', 7: '7/16', 8: '1/2' };
const FRACTION_WORDS = { 4: 'a quarter', 5: 'five sixteenths', 6: 'three eighths', 7: 'seven sixteenths', 8: 'a half' };
// Where J1 … J5 first peak: the X's arms on rows 1 to 5 of a helix of 1 nm radius sit at these over 2π.
const FIRST_MAX = [1.8412, 3.0542, 4.2012, 5.3176, 6.4156];
// Franklin's positions, per nm: rows every 1/3.4, the arc at 1/0.34, row 1's spread for a 1 nm radius.
const MEASURED = Object.freeze({ spacing: 1 / 3.4, arc: 1 / 0.34, spread: FIRST_MAX[0] / (2 * Math.PI) });

// The strand interference factor on row l: s strands, each f of a turn along from the last.
function strandFactor(l, s, f) {
  let re = 0;
  let im = 0;
  for (let k = 0; k < s; k += 1) {
    const a = 2 * Math.PI * l * k * f;
    re += Math.cos(a);
    im += Math.sin(a);
  }
  return (re * re + im * im) / (s * s);
}

function missingRows(strands, f) {
  const out = [];
  for (let l = 1; l <= 9; l += 1) if (strandFactor(l, strands, f) < 0.05) out.push(l);
  return out;
}

function derive(m) {
  const rise = m.pitch / m.perTurn;
  const f = m.offset16 / 16;
  const missing = missingRows(m.strands, f);
  const pitchOk = Math.abs(m.pitch - 3.4) <= 0.1 + TOL;
  const riseOk = Math.abs(rise - 0.34) <= 0.01 + TOL;
  const radiusOk = m.radius >= 0.9 - TOL && m.radius <= 1.1 + TOL;
  const missOk = missing.length === 1 && missing[0] === 4;
  return {
    rise, f, missing, pitchOk, riseOk, radiusOk, missOk,
    matches: m.strands === 2 && pitchOk && riseOk && radiusOk && missOk,
    spacing: 1 / m.pitch,
    arc: m.perTurn / m.pitch,
    spread: FIRST_MAX[0] / (2 * Math.PI * m.radius),
  };
}

// J_0 … J_nmax at x, by Miller's backward recurrence, rescaled when it grows and normalised at the end.
function besselRow(x, nmax, out) {
  out.fill(0);
  if (x < 1e-9) {
    out[0] = 1;
    return out;
  }
  const top = Math.max(nmax, Math.ceil(x));
  let m = top + 20 + Math.floor(Math.sqrt(40 * top));
  if (m % 2) m += 1;
  let jNext = 0;
  let jHere = 1e-30;
  let norm = 0;
  if (m <= nmax) out[m] = jHere;
  for (let k = m; k >= 1; k -= 1) {
    const jPrev = ((2 * k) / x) * jHere - jNext;
    jNext = jHere;
    jHere = jPrev;
    const n = k - 1;
    if (n <= nmax) out[n] = jHere;
    if (n > 0 && n % 2 === 0) norm += 2 * jHere;
    if (Math.abs(jHere) > 1e150) {
      jHere *= 1e-150;
      jNext *= 1e-150;
      norm *= 1e-150;
      for (let i = n; i <= nmax; i += 1) out[i] *= 1e-150;
    }
  }
  norm += jHere;
  for (let i = 0; i <= nmax; i += 1) out[i] /= norm;
  return out;
}

const Z_MAX = 3.4; // per nm: the window's radius
const R_TABLE = 3.6;
const TABLE_N = 720;
const SIGMA_Z = 0.03;
const SIGMA_ARC = (3.5 * Math.PI) / 180;
const ARC = (() => {
  const out = [];
  let sum = 0;
  for (let i = 0; i < 7; i += 1) {
    const u = -2.1 + (4.2 * i) / 6;
    const w = Math.exp(-(u * u) / 2);
    out.push({ c: Math.cos(u * SIGMA_ARC), s: Math.sin(u * SIGMA_ARC), w });
    sum += w;
  }
  for (const o of out) o.w /= sum;
  return out;
})();
const B_FACTOR = 0.2;
const APERTURE_FADE = 0.12;
const PATTERN_PIXELS = 190000;

// Row l's intensity along R, tabulated, and each row's strand factor and fall-off.
function layerTable(m) {
  const P = m.pitch;
  const N = m.perTurn;
  const f = m.offset16 / 16;
  const L = Math.ceil((Z_MAX + 0.1) * P);
  const nmax = Math.ceil(2 * Math.PI * m.radius * R_TABLE) + 12;
  const J = new Float64Array(nmax + 1);
  const T = [];
  for (let l = 0; l <= L; l += 1) T.push(new Float32Array(TABLE_N + 1));
  for (let i = 0; i <= TABLE_N; i += 1) {
    const R = (i / TABLE_N) * R_TABLE;
    besselRow(2 * Math.PI * m.radius * R, nmax, J);
    const fall = Math.exp(-B_FACTOR * R * R);
    for (let l = 0; l <= L; l += 1) {
      let sum = 0;
      const lo = Math.ceil((l - nmax) / N);
      const hi = Math.floor((l + nmax) / N);
      for (let k = lo; k <= hi; k += 1) {
        const n = Math.abs(l - k * N);
        if (n <= nmax) sum += J[n] * J[n];
      }
      T[l][i] = sum * fall;
    }
  }
  const lineK = [];
  for (let l = 0; l <= L; l += 1) lineK.push(strandFactor(l, m.strands, f) * Math.exp(-B_FACTOR * (l / P) ** 2));
  return { T, lineK, L, P };
}

const smoothstep = (a, b2, x) => {
  const t = clamp((x - a) / (b2 - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Where the pattern sits in its pane. Wide: the fibre axis vertical. Narrow: turned a quarter turn, so
// the axis runs along the stage as the helix above it does.
function patternGeo(W, H, narrow) {
  const cx = W / 2;
  const cy = H / 2;
  if (!narrow) {
    const s = Math.max(1, (Math.min(W, H) / 2 - 10) / Z_MAX);
    return { s, cx, cy, at: (R, Z) => [cx + R * s, cy - Z * s] };
  }
  const s = Math.max(1, (W / 2 - 12) / Z_MAX);
  return { s, cx, cy, at: (R, Z) => [cx + Z * s, cy - R * s] };
}

function joinList(xs) {
  const s = xs.map(String);
  return s.length < 2 ? s.join('') : `${s.slice(0, -1).join(', ')} and ${s[s.length - 1]}`;
}

function riseStr(rise) {
  return Math.abs(rise * 100 - Math.round(rise * 100)) < 1e-6 ? fmt(rise, 2) : fmt(rise, 3);
}

// What to move next, in the order a reader can see it on the pattern.
function hints(m, d) {
  const out = [];
  const gone = (xs) => (xs.length === 1 ? `Row ${xs[0]} is gone` : `Rows ${joinList(xs)} are gone`);
  if (m.strands === 1) out.push('One strand silences no row, and the photograph is missing the fourth: add a second strand.');
  else if (m.strands === 3) out.push(d.missing.length ? `${gone(d.missing)} with three strands, and the photograph is missing the fourth alone: try two.` : 'Three strands here silence no row, and the photograph is missing the fourth: try two.');
  else if (!d.missOk) out.push(d.missing.length ? `${gone(d.missing)}, not the fourth alone: move the offset.` : 'No row is missing: move the offset.');
  if (!d.pitchOk) out.push(`The rows are ${fmt(d.spacing, 3)} per nm apart and the photograph’s 0.294: ${m.pitch < 3.4 ? 'lengthen' : 'shorten'} the pitch.`);
  if (!d.riseOk) out.push(`The arc is at ${fmt(d.arc, 2)} per nm and the photograph’s at 2.94: ${d.rise > 0.34 ? 'more' : 'fewer'} bases a turn.`);
  if (!d.radiusOk) out.push(`Row 1 spreads to ${fmt(d.spread, 3)} per nm and the photograph’s to 0.293: ${m.radius < 1 ? 'widen' : 'narrow'} the helix.`);
  return out;
}

// ---------------------------------------------------------------- the pairs: the model

// Standard base coordinates, Å, in the 3DNA frame (Olson et al. 2001): x toward the major groove, y along
// the pair. Only the in-plane pair is needed; every atom is in the plane.
const ATOMS = {
  A: { "C1'": [-2.479, 5.346], N9: [-1.291, 4.498], C8: [0.024, 4.897], N7: [0.877, 3.902], C5: [0.071, 2.771], C6: [0.369, 1.398], N6: [1.611, 0.909], N1: [-0.668, 0.532], C2: [-1.912, 1.023], N3: [-2.320, 2.290], C4: [-1.267, 3.124] },
  G: { "C1'": [-2.477, 5.399], N9: [-1.289, 4.551], C8: [0.023, 4.962], N7: [0.870, 3.969], C5: [0.071, 2.833], C6: [0.424, 1.460], O6: [1.554, 0.955], N1: [-0.700, 0.641], C2: [-1.999, 1.087], N2: [-2.949, 0.139], N3: [-2.342, 2.364], C4: [-1.265, 3.177] },
  T: { "C1'": [-2.481, 5.354], N1: [-1.284, 4.500], C2: [-1.462, 3.135], O2: [-2.562, 2.608], N3: [-0.298, 2.407], C4: [0.994, 2.897], O4: [1.944, 2.119], C5: [1.106, 4.338], C7: [2.466, 4.961], C6: [-0.024, 5.057] },
  C: { "C1'": [-2.477, 5.402], N1: [-1.285, 4.542], C2: [-1.472, 3.158], O2: [-2.628, 2.709], N3: [-0.391, 2.344], C4: [0.837, 2.868], N4: [1.875, 2.027], C5: [1.056, 4.275], C6: [-0.023, 5.068] },
};
const SIX = ['N1', 'C2', 'N3', 'C4', 'C5', 'C6'];
const FIVE = ['C4', 'C5', 'N7', 'C8', 'N9'];
const PURINE = { A: true, G: true, C: false, T: false };
const GLYC = { A: 'N9', G: 'N9', T: 'N1', C: 'N1' };
const MIDDLE = { A: 'N1', G: 'N1', T: 'N3', C: 'N3' };
// The three places on the Watson–Crick edge: major-groove side, middle, minor-groove side.
const FACING = { A: ['N6', 'N1', 'C2'], G: ['O6', 'N1', 'N2'], T: ['O4', 'N3', 'O2'], C: ['N4', 'N3', 'O2'] };
const EDGE = { A: ['D', 'A', null], G: ['A', 'D', 'D'], T: ['A', 'D', 'A'], C: ['D', 'A', 'A'] };
const EDGE_RARE = { G: ['D', 'A', 'D'], T: ['D', 'A', 'A'] };
const EXO = { A: [['C6', 'N6', 1]], G: [['C6', 'O6', 2], ['C2', 'N2', 1]], T: [['C2', 'O2', 2], ['C4', 'O4', 2], ['C5', 'C7', 1]], C: [['C2', 'O2', 2], ['C4', 'N4', 1]] };
const EXO_RARE = { G: [['C6', 'O6', 1], ['C2', 'N2', 1]], T: [['C2', 'O2', 2], ['C4', 'O4', 1], ['C5', 'C7', 1]] };
const RING_NH = { G: { N1: ['C2', 'C6'] }, T: { N3: ['C2', 'C4'] } };
const AMINO = { A: { N6: 'C6' }, G: { N2: 'C2' }, C: { N4: 'C4' } };
const ENOL = { G: { O6: 'C6' }, T: { O4: 'C4' } };
const HETERO = { A: ['N1', 'N3', 'N7', 'N9', 'N6'], G: ['N1', 'N3', 'N7', 'N9', 'N2', 'O6'], T: ['N1', 'N3', 'O2', 'O4'], C: ['N1', 'N3', 'O2', 'N4'] };
const BASE_NAME = { A: 'adenine', G: 'guanine', C: 'cytosine', T: 'thymine' };
const BASE_COLOUR = { A: C.coral, T: C.gold, G: C.water, C: C.violet };
const ORDER = ['A', 'G', 'C', 'T'];
const WATSON_CRICK = new Set(['AT', 'TA', 'GC', 'CG']);
const GAP = 2.95; // Å between the two middle atoms
const REACH = Object.fromEntries(Object.entries(ATOMS).map(([k, at]) => [k, at["C1'"][1] - at[MIDDLE[k]][1]]));
const SITE_SPAN = (REACH.A + GAP + REACH.T + REACH.G + GAP + REACH.C) / 20; // nm, the two Watson–Crick pairs' mean
const SITE_TOL = 0.08;
const MAX_PAIRS = 12;
const SUGAR_R = 1.233; // Å, a five-membered ring's circumradius at 1.45 Å bonds
const OPEN_PAIR = Object.freeze({ left: 0, right: 1, tautomer: 'usual', run: 'antiparallel' });

const edgeOf = (base, rare) => (rare && EDGE_RARE[base]) || EDGE[base];

function pairState(L, R, tautomer, run) {
  const parallel = run === 'parallel';
  const rare = tautomer === 'rare';
  const pairType = PURINE[L] && PURINE[R] ? 'purine-purine' : !PURINE[L] && !PURINE[R] ? 'pyrimidine-pyrimidine' : 'purine-pyrimidine';
  const widthNm = (REACH[L] + GAP + REACH[R]) / 10;
  const widthOk = Math.abs(widthNm - SITE_SPAN) <= SITE_TOL;
  const eL = edgeOf(L, rare);
  const eR = edgeOf(R, rare);
  const links = [];
  const clashes = [];
  for (let i = 0; i < 3; i += 1) {
    const j = parallel ? 2 - i : i;
    const a = eL[i];
    const c = eR[j];
    if (!a || !c) continue;
    if (a === c) clashes.push({ i, j, kind: a });
    else links.push({ i, j, donorLeft: a === 'D' });
  }
  const bonds = widthOk && !clashes.length ? links.length : 0;
  let whyNot = null;
  if (!widthOk) whyNot = widthNm > SITE_SPAN ? 'too-wide' : 'too-narrow';
  else if (parallel) whyNot = 'sugars-misplaced';
  else if (rare && WATSON_CRICK.has(L + R)) whyNot = 'rare-tautomer';
  else if (!bonds) whyNot = 'no-hydrogen-bonds';
  return { L, R, pairType, widthNm, widthOk, links, clashes, bonds, whyNot, fits: whyNot === null, rare, parallel };
}

function pairVerdict(ps) {
  const kindOf = (x) => (PURINE[x] ? 'purine' : 'pyrimidine');
  switch (ps.whyNot) {
    case null:
      return `${cap(BASE_NAME[ps.L])} across from ${BASE_NAME[ps.R]}: a ${kindOf(ps.L)} across from a ${kindOf(ps.R)}, ${fmt(ps.widthNm, 1)} nm from sugar to sugar, and ${ps.bonds === 3 ? 'three' : 'two'} hydrogen bonds, each donor facing an acceptor. It fits.`;
    case 'too-wide':
      return `Two purines: ${fmt(ps.widthNm, 1)} nm from sugar to sugar, and the backbones hold every pair at 1.1. Too wide.`;
    case 'too-narrow':
      return `Two pyrimidines: ${fmt(ps.widthNm, 1)} nm from sugar to sugar, and the backbones hold every pair at 1.1. Too narrow.`;
    case 'sugars-misplaced':
      return 'Run parallel, the partner is turned over: its sugar comes out on the major-groove side of the pair, where the backbone cannot reach it.';
    case 'rare-tautomer':
      return ps.L === 'G' || ps.R === 'G'
        ? 'In its rare form guanine carries the hydrogen of N1 on O6 instead, and cytosine’s amino group now meets it donor to donor. The pair does not form.'
        : 'In its rare form thymine carries the hydrogen of N3 on O4 instead, and adenine’s amino group now meets it donor to donor. The pair does not form.';
    default: {
      const dd = ps.clashes.some((c) => c.kind === 'D');
      const aa = ps.clashes.some((c) => c.kind === 'A');
      const what = dd && aa ? 'a donor faces a donor and an acceptor faces an acceptor' : dd ? 'a donor faces a donor' : 'an acceptor faces an acceptor';
      return `The width is right, but ${what}: these two cannot make their hydrogen bonds without pulling the pair out of shape.`;
    }
  }
}

// Both bases in the pair's frame, Å: the middle atoms GAP apart on the axis and the C1′ span centred.
function placePair(L, R, run) {
  const shift = -(REACH[R] - REACH[L]) / 2;
  const put = (base, side) => {
    const at = ATOMS[base];
    const ymid = at[MIDDLE[base]][1];
    const out = {};
    for (const [n, [x, y]] of Object.entries(at)) {
      const yy = y - ymid + GAP / 2;
      if (side > 0) out[n] = [x, yy + shift];
      else out[n] = run === 'parallel' ? [-x, -yy + shift] : [x, -yy + shift];
    }
    return out;
  };
  return { left: put(L, -1), right: put(R, 1) };
}

const unit = (x, y) => {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};
const turn = ([x, y], deg) => {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};

// The hydrogens a base shows: one on each donor of its edge (on the ring NH, the enol OH, or the amino
// group's facing side) and the amino group's second, pointing away. `toward` is the partner atom the
// facing hydrogen should point nearest.
function hydrogensOf(base, at, donors) {
  const out = [];
  for (const { name, toward } of donors) {
    const d0 = at[name];
    const want = unit(toward[0] - d0[0], toward[1] - d0[1]);
    const ring = RING_NH[base]?.[name];
    if (ring) {
      const [a, c] = ring;
      const v = unit(2 * d0[0] - at[a][0] - at[c][0], 2 * d0[1] - at[a][1] - at[c][1]);
      out.push({ from: d0, at: [d0[0] + v[0], d0[1] + v[1]], facing: true, name });
      continue;
    }
    const amino = AMINO[base]?.[name];
    const enol = ENOL[base]?.[name];
    const partner = amino || enol;
    if (!partner) continue;
    const u = unit(at[partner][0] - d0[0], at[partner][1] - d0[1]);
    const angle = amino ? 120 : 109.5;
    const h1 = turn(u, angle);
    const h2 = turn(u, -angle);
    const dot = (v) => v[0] * want[0] + v[1] * want[1];
    const [face, away] = dot(h1) >= dot(h2) ? [h1, h2] : [h2, h1];
    out.push({ from: d0, at: [d0[0] + face[0], d0[1] + face[1]], facing: true, name });
    if (amino) out.push({ from: d0, at: [d0[0] + away[0], d0[1] + away[1]], facing: false, name });
  }
  return out;
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- subscripts

const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
const SUB_RUN = /([₀-₉]+)/;
function setSubscripts(svg) {
  for (const t of svg.querySelectorAll('text')) {
    const s = t.textContent;
    if (!SUB_RUN.test(s)) continue;
    const fs = parseFloat(t.getAttribute('font-size')) || 10;
    const drop = +(fs * 0.2).toFixed(2);
    t.textContent = '';
    let low = false;
    for (const part of s.split(SUB_RUN)) {
      if (!part) continue;
      const isSub = SUB_RUN.test(part);
      const span = el('tspan', {
        text: isSub ? [...part].map((c) => SUB_DIGITS.indexOf(c)).join('') : part,
        'font-size': isSub ? +(fs * 0.7).toFixed(2) : null,
        dy: isSub && !low ? drop : !isSub && low ? -drop : null,
      });
      low = isSub;
      t.append(span);
    }
  }
}

// ---------------------------------------------------------------- styles

const CSS = (sel) => `
${sel} .hl-num { font-variant-numeric: lining-nums tabular-nums; }
${sel} .hl-base .tb-val { min-width: 4.3rem; }
${sel}.is-narrow .hl-base .tb-val { min-width: 0.9rem; text-align: center; }
${sel} .hl-rise .tb-val { min-width: 3.3rem; }
${sel} .hl-offset .tb-val { min-width: 3.7rem; }
${sel}.is-narrow .hl-offset .tb-val { min-width: 2.1rem; }
${sel} .hl-len .tb-val { min-width: 2.9rem; }
${sel}.is-narrow .hl-rise .tb-val { min-width: 2.2rem; }
${sel}.is-narrow .hl-len .tb-val { min-width: 1.4rem; }
`;

// Each scene's share of the stage: wide columns (helix or pair | pattern | marks | table, the strip taking
// the pattern's and the marks' columns) and narrow rows in the same order.
const GRID = {
  photograph: { c: ['20fr', '40fr', '14fr', '26fr'], r: ['58fr', '137fr', '44px', '100fr'] },
  pairs: { c: ['55fr', '8fr', '7fr', '30fr'], r: ['185fr', '56fr', '0fr', '127fr'] },
};

const PHOTO_ARIA = 'A helix you build, drawn from the side, beside the X-ray diffraction pattern calculated from it and the positions measured on Franklin’s photograph. 1, 2 or 3 sets the strands, the up and down arrows the pitch, [ and ] the rise per base, the left and right arrows the radius, O the offset between the strands, M shows or hides the measurements, S switches to the pairs and Home resets.';
const PAIRS_ARIA = 'One base pair drawn to scale between two backbones 2 nm apart. The left and right arrows change the left and the right base, T switches the tautomer, P the direction the strands run, Enter or A adds the pair to the duplex, S switches to the photograph and Home resets.';

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 801 });
  let palette = ctx.palette || LIGHT;

  // ---- state ----
  let scene = 'photograph';
  const photo = { ...OPEN_PHOTO };
  let marksOn = true;
  const pair = { ...OPEN_PAIR };
  const built = []; // [left, right, bonds]
  let syncing = false;
  let drawn = false;

  const currentPair = () => pairState(ORDER[pair.left], ORDER[pair.right], pair.tautomer, pair.run);
  function counts() {
    const n = { A: 0, T: 0, G: 0, C: 0 };
    for (const [l, r] of built) {
      n[l] += 1;
      n[r] += 1;
    }
    return n;
  }

  // ---- panes: the keyboard's first, so it is the stage's first focusable thing ----
  const main = b.pane('main', { as: 'svg', focus: true, aria: PHOTO_ARIA });
  const pattern = b.pane('pattern', { as: 'canvas', aria: 'The diffraction pattern calculated from the helix' });
  const marks = b.pane('marks', { as: 'svg' });
  const strip = b.pane('strip', { as: 'svg', aria: 'The duplex built so far' });
  const table = b.pane('table', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, var(--hl-c1)) minmax(0, var(--hl-c2)) minmax(0, var(--hl-c3)) minmax(0, var(--hl-c4))',
      rows: 'minmax(0, 1fr)',
      at: { main: [1, 1], pattern: [2, 1], marks: [3, 1], strip: ['2 / 4', 1], table: [4, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, var(--hl-r1)) minmax(0, var(--hl-r2)) minmax(0, var(--hl-r3)) minmax(0, var(--hl-r4))',
      rowGap: 'var(--space-1)',
      at: { main: [1, 1], pattern: [1, 2], marks: [1, 3], strip: [1, '2 / 4'], table: [1, 4] },
    },
  });

  // ---- controls: what to change, then what to show and do, then the scene ----
  const strandsCtl = b.stepper('Strands', {
    min: 1, max: 3, step: 1, value: photo.strands,
    format: (v) => String(v),
    valueText: (v) => `${v} strand${v === 1 ? '' : 's'}`,
    onInput: (v) => { photo.strands = clamp(Math.round(v), 1, 3); if (syncing) return; afterChange(); },
  });
  const pitchCtl = b.stepper('Pitch', {
    min: 2.4, max: 4.6, step: 0.1, value: photo.pitch,
    format: (v, o) => (o.narrow ? fmt(v, 1) : `${fmt(v, 1)} nm`),
    valueText: (v) => `${fmt(v, 1)} nanometres a turn`,
    onInput: (v) => { photo.pitch = Math.round(v * 10) / 10; if (syncing) return; refreshRise(); afterChange(); },
  });
  // The rise steps through whole numbers of units a turn, 14 down to 6, so that raising it is what "up"
  // means: the range holds 20 − N.
  const riseCtl = b.stepper('Rise per base', {
    min: 6, max: 14, step: 1, value: 20 - photo.perTurn, short: 'Rise',
    format: (v, o) => (o.narrow ? riseStr(photo.pitch / (20 - Math.round(v))) : `${riseStr(photo.pitch / (20 - Math.round(v)))} nm`),
    valueText: (v) => {
      const n = 20 - Math.round(v);
      return `${riseStr(photo.pitch / n)} nanometres a base, ${n} bases a turn`;
    },
    onInput: (v) => { photo.perTurn = 20 - clamp(Math.round(v), 6, 14); if (syncing) return; afterChange(); },
  });
  const radiusCtl = b.stepper('Radius', {
    min: 0.4, max: 1.6, step: 0.1, value: photo.radius,
    format: (v, o) => (o.narrow ? fmt(v, 1) : `${fmt(v, 1)} nm`),
    valueText: (v) => `${fmt(v, 1)} nanometres`,
    onInput: (v) => { photo.radius = Math.round(v * 10) / 10; if (syncing) return; afterChange(); },
  });
  pitchCtl.node.classList.add('hl-len');
  radiusCtl.node.classList.add('hl-len');
  riseCtl.node.classList.add('hl-rise');

  const baseSteps = { down: { glyph: '‹', name: 'previous base' }, up: { glyph: '›', name: 'next base' } };
  const baseCtl = (label, key, short) => b.stepper(label, {
    min: 0, max: 3, step: 1, value: pair[key], steps: baseSteps, short,
    format: (v, o) => (o.narrow ? ORDER[Math.round(v)] : cap(BASE_NAME[ORDER[Math.round(v)]])),
    valueText: (v) => cap(BASE_NAME[ORDER[Math.round(v)]]),
    onInput: (v) => { pair[key] = clamp(Math.round(v), 0, 3); if (syncing) return; afterChange(); },
  });
  const leftCtl = baseCtl('Left base', 'left', 'Left');
  const rightCtl = baseCtl('Right base', 'right', 'Right');
  leftCtl.node.classList.add('hl-base');
  rightCtl.node.classList.add('hl-base');
  const tautCtl = b.choice('Tautomer', [
    { id: 'usual', label: 'Usual form', short: 'Usual', aria: 'Usual form, guanine and thymine as they are in DNA' },
    { id: 'rare', label: 'Rare form', short: 'Rare', aria: 'Rare form, guanine and thymine as the old drawings showed them' },
  ], (id) => { pair.tautomer = id; if (syncing) return; afterChange(); }, { segmented: true, value: pair.tautomer });
  const runCtl = b.choice('Strands run', [
    { id: 'antiparallel', label: 'Antiparallel', aria: 'Antiparallel, the partner strand runs the other way' },
    { id: 'parallel', label: 'Parallel', aria: 'Parallel, the partner strand runs the same way' },
  ], (id) => { pair.run = id; if (syncing) return; afterChange(); }, { segmented: true, value: pair.run });
  // The offset is a group of its own. It is the second strand's control, idle while there is one, and on
  // its own it is what wraps under the four above rather than pushing the whole group onto two rows.
  b.divide();
  const offsetCtl = b.stepper('Offset', {
    min: 4, max: 8, step: 1, value: photo.offset16,
    format: (v, o) => (o.narrow ? FRACTION[Math.round(v)] : `${FRACTION[Math.round(v)]} turn`),
    valueText: (v) => `${FRACTION_WORDS[Math.round(v)]} of a turn`,
    onInput: (v) => { photo.offset16 = clamp(Math.round(v), 4, 8); if (syncing) return; afterChange(); },
  });
  offsetCtl.node.classList.add('hl-offset');
  b.divide();
  const marksCtl = b.toggle('Show the measurements', (on) => { marksOn = on; if (syncing) return; afterChange(); }, {
    pressed: true, short: 'Measurements', aria: 'Show the measurements, Franklin’s positions on the pattern',
  });
  const addBtn = b.action('Add pair', () => addPair(), { primary: true, aria: 'Add pair, stack this pair on the duplex' });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the figure back as it opened' });
  b.divide();
  const sceneCtl = b.choice('Scene', [
    { id: 'photograph', label: 'The photograph', short: 'Photograph' },
    { id: 'pairs', label: 'The pairs', short: 'Pairs' },
  ], (id) => setScene(id), { segmented: true });

  const photoControls = [strandsCtl.node, pitchCtl.node, riseCtl.node, radiusCtl.node, offsetCtl.node, marksCtl.node];
  const pairControls = [leftCtl.node, rightCtl.node, ...tautCtl.nodes, tautCtl.strip, ...runCtl.nodes, runCtl.strip, addBtn];

  function refreshRise() {
    const was = syncing;
    syncing = true;
    riseCtl.set(riseCtl.value);
    syncing = was;
  }

  function syncEnabled() {
    const one = photo.strands < 2;
    for (const n of offsetCtl.node.querySelectorAll('input, button')) n.disabled = one;
    const ps = currentPair();
    addBtn.disabled = !(ps.fits && built.length < MAX_PAIRS);
  }

  function setGridVars() {
    const g = GRID[scene];
    g.c.forEach((v, i) => b.setVar(`--hl-c${i + 1}`, v));
    g.r.forEach((v, i) => b.setVar(`--hl-r${i + 1}`, v));
  }

  function applyScene() {
    const onPhoto = scene === 'photograph';
    for (const n of photoControls) n.style.display = onPhoto ? '' : 'none';
    for (const n of pairControls) n.style.display = onPhoto ? 'none' : '';
    pattern.el.style.display = onPhoto ? '' : 'none';
    marks.el.style.display = onPhoto ? '' : 'none';
    strip.el.style.display = onPhoto ? 'none' : '';
    main.node.setAttribute('aria-label', onPhoto ? PHOTO_ARIA : PAIRS_ARIA);
    setGridVars();
    syncEnabled();
  }

  function afterChange() {
    syncEnabled();
    b.redraw();
    b.announce();
  }

  function setScene(id) {
    scene = id;
    applyScene();
    b.redraw();
    b.announce();
  }

  function addPair() {
    const ps = currentPair();
    if (!ps.fits || built.length >= MAX_PAIRS) return;
    built.push([ps.L, ps.R, ps.bonds]);
    afterChange();
  }

  function resetAll() {
    syncing = true;
    Object.assign(photo, OPEN_PHOTO);
    strandsCtl.set(photo.strands);
    pitchCtl.set(photo.pitch);
    riseCtl.set(20 - photo.perTurn);
    radiusCtl.set(photo.radius);
    offsetCtl.set(photo.offset16);
    marksOn = true;
    marksCtl.set(true, { quiet: true });
    Object.assign(pair, OPEN_PAIR);
    built.length = 0;
    leftCtl.set(pair.left);
    rightCtl.set(pair.right);
    tautCtl.set(pair.tautomer, { quiet: true });
    runCtl.set(pair.run, { quiet: true });
    syncing = false;
    applyScene();
    b.restart();
    b.announce();
  }

  function nudge(ctl, dir) {
    if (ctl.input.disabled) return;
    if (dir > 0) ctl.input.stepUp();
    else ctl.input.stepDown();
    ctl.set(Number(ctl.input.value));
  }
  const onPhoto = (fn) => () => { if (scene === 'photograph') fn(); };
  const onPairs = (fn) => () => { if (scene === 'pairs') fn(); };
  const cycleBase = (ctl) => ctl.set((Math.round(ctl.value) + 1) % 4);
  const cycleOffset = () => { if (photo.strands > 1) offsetCtl.set(photo.offset16 >= 8 ? 4 : photo.offset16 + 1); };

  b.keys({
    s: () => sceneCtl.next(),
    S: () => sceneCtl.next(),
    Home: () => resetAll(),
    1: onPhoto(() => strandsCtl.set(1)),
    2: onPhoto(() => strandsCtl.set(2)),
    3: onPhoto(() => strandsCtl.set(3)),
    ArrowUp: onPhoto(() => nudge(pitchCtl, 1)),
    ArrowDown: onPhoto(() => nudge(pitchCtl, -1)),
    ArrowLeft: () => (scene === 'photograph' ? nudge(radiusCtl, -1) : cycleBase(leftCtl)),
    ArrowRight: () => (scene === 'photograph' ? nudge(radiusCtl, 1) : cycleBase(rightCtl)),
    '[': onPhoto(() => nudge(riseCtl, -1)),
    ']': onPhoto(() => nudge(riseCtl, 1)),
    o: onPhoto(cycleOffset),
    O: onPhoto(cycleOffset),
    m: onPhoto(() => marksCtl.toggle()),
    M: onPhoto(() => marksCtl.toggle()),
    t: onPairs(() => tautCtl.next()),
    T: onPairs(() => tautCtl.next()),
    p: onPairs(() => runCtl.next()),
    P: onPairs(() => runCtl.next()),
    a: onPairs(addPair),
    A: onPairs(addPair),
    Enter: onPairs(addPair),
  });

  // Nothing here runs on its own: the clock is only the frame's, and every change is the reader's.
  b.clock({ step: 1 / 60, advance: () => {}, restart: () => {} });

  // ---- what describe() reports ----
  b.onDescribe(() => {
    const d = derive(photo);
    const ps = currentPair();
    const n = counts();
    return {
      scene,
      strands: photo.strands,
      pitchNm: photo.pitch,
      riseNm: Number(d.rise.toFixed(3)),
      radiusNm: photo.radius,
      basesPerTurn: photo.perTurn,
      offsetTurns: photo.offset16 / 16,
      layerLineSpacingPerNm: Number(d.spacing.toFixed(3)),
      meridionalPerNm: Number(d.arc.toFixed(3)),
      missingLayerLines: d.missing,
      matchesPhotograph: d.matches,
      measurementsShown: marksOn,
      leftBase: ps.L,
      rightBase: ps.R,
      pairType: ps.pairType,
      pairWidthNm: Number(ps.widthNm.toFixed(1)),
      hydrogenBonds: ps.bonds,
      pairFits: ps.fits,
      whyNot: ps.whyNot,
      tautomer: pair.tautomer,
      strandsRun: pair.run,
      pairsBuilt: built.length,
      countA: n.A,
      countT: n.T,
      countG: n.G,
      countC: n.C,
      chargaffHolds: n.A === n.T && n.G === n.C,
      t: Number(b.time.toFixed(3)),
    };
  });

  b.onAnnounce((d) => {
    if (d.scene === 'photograph') {
      const rows = d.missingLayerLines.length ? `row${d.missingLayerLines.length === 1 ? '' : 's'} ${joinList(d.missingLayerLines)} missing` : 'no row missing';
      const apart = d.strands > 1 ? `, ${FRACTION[photo.offset16]} of a turn apart` : '';
      return `${d.strands} strand${d.strands === 1 ? '' : 's'}${apart}, ${fmt(d.pitchNm, 1)} nm a turn, ${d.basesPerTurn} bases a turn, ${fmt(2 * d.radiusNm, 1)} nm across: ${rows}. ${d.matchesPhotograph ? 'Every feature matches the photograph.' : 'The pattern does not match the photograph yet.'}`;
    }
    return `${pairVerdict(currentPair())} ${d.pairsBuilt} pair${d.pairsBuilt === 1 ? '' : 's'} built: ${d.countA} A, ${d.countT} T, ${d.countG} G and ${d.countC} C.`;
  });

  // ---------------------------------------------------------------- drawing: the helix

  function bracket(p, x1, y1, x2, y2, { tick = 4, dir = 1, colour = C.soft, dash = null, width = 1 } = {}) {
    // A straight measure from (x1, y1) to (x2, y2) with ticks at both ends, `dir` choosing their side.
    const [ux, uy] = unit(x2 - x1, y2 - y1);
    const nx = -uy * tick * dir;
    const ny = ux * tick * dir;
    return p.path(`M${fmt(x1 + nx)} ${fmt(y1 + ny)} L${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)} L${fmt(x2 + nx)} ${fmt(y2 + ny)}`, {
      fill: 'none', stroke: colour, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linejoin': 'round',
    });
  }

  function drawHelix() {
    const p = main;
    p.clear();
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const d = derive(photo);
    const P = photo.pitch;
    const r = photo.radius;
    const f = photo.strands > 1 ? d.f : 0;
    const colours = [C.ink, C.soft, tint(C.ink, 38)];
    let s;
    let at;
    let zLen;
    const g = {};
    if (!narrow) {
      g.yTop = 30;
      g.yBot = hh - 40;
      g.cx = w / 2;
      s = Math.max(4, Math.min((w - 68) / 3.2, (g.yBot - g.yTop) / 9));
      zLen = Math.max(P, (g.yBot - g.yTop) / s);
      at = (z, th) => [g.cx + r * Math.cos(th) * s, g.yBot - z * s];
    } else {
      g.x0 = 16;
      g.x1 = w - 78;
      s = Math.max(4, Math.min((hh - 26) / 3.2, (g.x1 - g.x0) / 9));
      g.cy = (18 + hh) / 2;
      zLen = Math.max(P, (g.x1 - g.x0) / s);
      at = (z, th) => [g.x0 + z * s, g.cy + r * Math.cos(th) * s];
    }
    const dotScale = narrow ? 0.8 : 1;

    // The strands, split where each passes behind the axis.
    const segs = { back: [], front: [] };
    const step = P / 64;
    for (let k = 0; k < photo.strands; k += 1) {
      let cur = null;
      let curFront = null;
      for (let i = 0; ; i += 1) {
        const z = Math.min(zLen, i * step);
        const th = 2 * Math.PI * (z / P - k * f);
        const front = Math.sin(th) < 0;
        const xy = at(z, th);
        if (cur && front !== curFront) {
          cur.pts.push(xy);
          (curFront ? segs.front : segs.back).push(cur);
          cur = null;
        }
        if (!cur) {
          cur = { k, pts: [] };
          curFront = front;
        }
        cur.pts.push(xy);
        if (z >= zLen) break;
      }
      if (cur) (curFront ? segs.front : segs.back).push(cur);
    }
    const dots = { back: [], front: [] };
    for (let k = 0; k < photo.strands; k += 1) {
      for (let j = 0; ; j += 1) {
        const z = j * d.rise + k * f * P;
        if (z > zLen + 1e-9) break;
        const th = 2 * Math.PI * (z / P - k * f);
        (Math.sin(th) < -1e-9 ? dots.front : dots.back).push({ k, xy: at(z, th) });
      }
    }
    const line = (pts) => `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L')}`;
    const g1 = p.group({ 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    for (const sg of segs.back) p.path(line(sg.pts), { fill: 'none', stroke: colours[sg.k], 'stroke-width': 1.1, opacity: 0.5 }, g1);
    for (const dt of dots.back) p.circle(dt.xy[0], dt.xy[1], 1.9 * dotScale, { fill: colours[dt.k], opacity: 0.5 }, g1);
    for (const sg of segs.front) p.path(line(sg.pts), { fill: 'none', stroke: colours[sg.k], 'stroke-width': 2.6 * dotScale }, g1);
    for (const dt of dots.front) p.circle(dt.xy[0], dt.xy[1], 2.8 * dotScale, { fill: colours[dt.k], stroke: C.paper, 'stroke-width': 0.8 }, g1);

    const riseText = `${riseStr(d.rise)} nm a base, ${photo.perTurn} a turn`;
    const across = `${fmt(2 * r, 1)} nm`;
    if (!narrow) {
      const { cx, yBot } = g;
      p.text(cx, 14, riseText, { anchor: 'middle', fit: [10.5, 8.5], width: w - 6, fill: C.soft, class: 'hl-num' });
      // One turn, on the left.
      const zA = P / 2;
      const zB = (3 * P) / 2;
      if (zB <= zLen) {
        const bx = cx - r * s - 9;
        const yA = yBot - zA * s;
        const yB = yBot - zB * s;
        bracket(p, bx, yA, bx, yB, { dir: -1 });
        const ym = (yA + yB) / 2;
        p.text(bx - 5, ym, `${fmt(P, 1)} nm a turn`, { anchor: 'middle', transform: `rotate(-90 ${fmt(bx - 5)} ${fmt(ym)})`, 'font-size': 10.5, fill: C.soft, class: 'hl-num' });
      }
      // How far along the second strand runs, on the right, where both pass the edge.
      if (photo.strands > 1 && P + f * P <= zLen) {
        const bx = cx + r * s + 9;
        const yA = yBot - P * s;
        const yB = yBot - (P + f * P) * s;
        bracket(p, bx, yA, bx, yB, { dir: 1 });
        const ym = (yA + yB) / 2;
        p.text(bx + 14, ym, `${FRACTION[photo.offset16]} turn apart`, { anchor: 'middle', transform: `rotate(-90 ${fmt(bx + 14)} ${fmt(ym)})`, 'font-size': 10.5, fill: C.soft, class: 'hl-num' });
      }
      // Across, underneath.
      const by = yBot + 12;
      bracket(p, cx - r * s, by, cx + r * s, by, { dir: -1 });
      p.text(cx, by + 15, `${across} across`, { anchor: 'middle', 'font-size': 10.5, fill: C.soft, class: 'hl-num' });
    } else {
      const { x0, x1, cy } = g;
      p.text(w, 12, riseText, { anchor: 'end', fit: [10, 8], width: w * 0.5, fill: C.soft, class: 'hl-num' });
      const by = cy - r * s - 6;
      const pitchLabel = `${fmt(P, 1)} nm a turn`;
      const pw = pitchLabel.length * EM_ADVANCE * 10;
      const pxA = x0 + (P / 2) * s;
      const pxB = x0 + ((3 * P) / 2) * s;
      let taken = null;
      if ((3 * P) / 2 <= zLen) {
        bracket(p, pxA, by, pxB, by, { dir: 1 });
        const pm = (pxA + pxB) / 2;
        p.text(pm, by - 4, pitchLabel, { anchor: 'middle', 'font-size': 10, fill: C.soft, class: 'hl-num' });
        taken = [pm - pw / 2 - 8, pm + pw / 2 + 8];
      }
      if (photo.strands > 1) {
        const label = `${FRACTION[photo.offset16]} turn apart`;
        const lw = label.length * EM_ADVANCE * 10;
        for (let k = 2; ; k += 1) {
          const za = (k + 0.5) * P;
          const zb = za + f * P;
          if (zb > zLen) break;
          const xa = x0 + za * s;
          const xb = x0 + zb * s;
          const xm = (xa + xb) / 2;
          const span = [xm - lw / 2, xm + lw / 2];
          if (span[0] < 0 || span[1] > x1 + 4) continue;
          if (taken && span[1] > taken[0] && span[0] < taken[1]) continue;
          bracket(p, xa, by, xb, by, { dir: 1 });
          p.text(xm, by - 4, label, { anchor: 'middle', 'font-size': 10, fill: C.soft, class: 'hl-num' });
          break;
        }
      }
      const bx = x1 + 8;
      bracket(p, bx, cy - r * s, bx, cy + r * s, { dir: -1 });
      p.text(bx + 5, cy - 2, across, { 'font-size': 10, fill: C.soft, class: 'hl-num' });
      p.text(bx + 5, cy + 10, 'across', { 'font-size': 10, fill: C.soft });
    }
  }

  // ---------------------------------------------------------------- drawing: the pattern

  let patternCache = null;
  function patternImage(W, H, narrow, dpr) {
    const scale = Math.min(dpr, Math.sqrt(PATTERN_PIXELS / (W * H)));
    let ow = Math.max(2, Math.round(W * scale));
    ow += ow % 2;
    let oh = Math.max(2, Math.round(H * scale));
    oh += oh % 2;
    const key = [W, H, narrow, ow, oh, photo.strands, photo.pitch, photo.perTurn, photo.radius, photo.strands > 1 ? photo.offset16 : 0, palette.paper2, palette.ink].join('|');
    if (patternCache && patternCache.key === key) return patternCache.canvas;
    const geo = patternGeo(W, H, narrow);
    const { T, lineK, L, P } = layerTable(photo);
    const hw = ow / 2;
    const hh = oh / 2;
    const vals = new Float32Array(hw * hh);
    const alphas = new Float32Array(hw * hh);
    const sx = W / ow;
    const sy = H / oh;
    const inv = 1 / (2 * SIGMA_Z * SIGMA_Z);
    const cut = 4 * SIGMA_Z;
    let max = 0;
    for (let qj = 0; qj < hh; qj += 1) {
      const dy = (qj + 0.5) * sy;
      for (let qi = 0; qi < hw; qi += 1) {
        const dx = (qi + 0.5) * sx;
        const R = (narrow ? dy : dx) / geo.s;
        const Z = (narrow ? dx : dy) / geo.s;
        const rho = Math.hypot(R, Z);
        let a = 1 - smoothstep(Z_MAX * (1 - APERTURE_FADE), Z_MAX, rho);
        if (narrow) a *= smoothstep(0, 9, H / 2 - dy);
        const idx = qj * hw + qi;
        alphas[idx] = a;
        if (a <= 0) continue;
        let v = 0;
        for (const arc of ARC) {
          const Rr = Math.abs(R * arc.c + Z * arc.s);
          const Zr = Math.abs(Z * arc.c - R * arc.s);
          const lc = Math.round(Zr * P);
          const l0 = Math.max(1, lc - 1);
          const l1 = Math.min(L, lc + 1);
          for (let l = l0; l <= l1; l += 1) {
            const dz = Zr - l / P;
            if (dz > cut || dz < -cut) continue;
            const k = lineK[l];
            if (k < 1e-7) continue;
            const u = (Rr / R_TABLE) * TABLE_N;
            const i0 = Math.min(TABLE_N - 1, Math.floor(u));
            const t = Math.min(1, u - i0);
            const row = T[l];
            v += arc.w * k * Math.exp(-dz * dz * inv) * (row[i0] + (row[i0 + 1] - row[i0]) * t);
          }
        }
        vals[idx] = v;
        if (v > max) max = v;
      }
    }
    const canvas = patternCache?.canvas ?? h('canvas');
    canvas.width = ow;
    canvas.height = oh;
    const g = canvas.getContext('2d');
    const img = g.createImageData(ow, oh);
    const data = img.data;
    const ground = rgb(palette.paper2);
    const ink = rgb(palette.ink);
    const norm = max > 0 ? 1 / max : 0;
    const put = (x, y, r0, g0, b0, a0) => {
      const o = (y * ow + x) * 4;
      data[o] = r0;
      data[o + 1] = g0;
      data[o + 2] = b0;
      data[o + 3] = a0;
    };
    for (let qj = 0; qj < hh; qj += 1) {
      for (let qi = 0; qi < hw; qi += 1) {
        const idx = qj * hw + qi;
        const a = alphas[idx];
        if (a <= 0) continue;
        const t = 0.95 * Math.min(1, Math.sqrt(vals[idx] * norm));
        const r0 = Math.round((ground[0] + (ink[0] - ground[0]) * t) * 255);
        const g0 = Math.round((ground[1] + (ink[1] - ground[1]) * t) * 255);
        const b0 = Math.round((ground[2] + (ink[2] - ground[2]) * t) * 255);
        const a0 = Math.round(a * 255);
        put(hw + qi, hh + qj, r0, g0, b0, a0);
        put(hw - 1 - qi, hh + qj, r0, g0, b0, a0);
        put(hw + qi, hh - 1 - qj, r0, g0, b0, a0);
        put(hw - 1 - qi, hh - 1 - qj, r0, g0, b0, a0);
      }
    }
    g.putImageData(img, 0, 0);
    patternCache = { key, canvas };
    return canvas;
  }

  function paintPattern() {
    const { w: W, h: H } = pattern.box;
    const narrow = b.narrow;
    const dpr = Math.min(3, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
    const cv = pattern.node;
    const cw = Math.max(1, Math.round(W * dpr));
    const ch = Math.max(1, Math.round(H * dpr));
    if (cv.width !== cw) cv.width = cw;
    if (cv.height !== ch) cv.height = ch;
    const g = cv.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cw, ch);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(patternImage(W, H, narrow, dpr), 0, 0, cw, ch);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Franklin's positions, drawn as hairlines on a paper halo so they read on the dark and the pale.
    const geo = patternGeo(W, H, narrow);
    const [ox, oy] = geo.at(0, 0);
    const stroke = (trace, dash = []) => {
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.setLineDash(dash);
      g.strokeStyle = palette.paper;
      g.lineWidth = 3;
      trace();
      g.stroke();
      g.strokeStyle = palette.ink;
      g.lineWidth = 1.2;
      trace();
      g.stroke();
      g.restore();
    };
    stroke(() => {
      g.beginPath();
      g.moveTo(ox - 5, oy);
      g.lineTo(ox + 5, oy);
      g.moveTo(ox, oy - 5);
      g.lineTo(ox, oy + 5);
    });
    if (marksOn) {
      const rad = (MEASURED.arc + 0.1) * geo.s;
      const half = (9 * Math.PI) / 180;
      for (const mid of narrow ? [0, Math.PI] : [-Math.PI / 2, Math.PI / 2]) {
        stroke(() => {
          g.beginPath();
          g.arc(ox, oy, rad, mid - half, mid + half);
        });
      }
      for (const sr of [1, -1]) {
        for (const sz of [1, -1]) {
          stroke(() => {
            g.beginPath();
            for (let n = 1; n <= 5; n += 1) {
              const [x, y] = geo.at((sr * FIRST_MAX[n - 1]) / (2 * Math.PI), (sz * n) / 3.4);
              if (n === 1) g.moveTo(x, y);
              else g.lineTo(x, y);
            }
          }, [4, 3]);
          const [x4, y4] = geo.at((sr * FIRST_MAX[3]) / (2 * Math.PI), (sz * 4) / 3.4);
          stroke(() => {
            g.beginPath();
            g.arc(x4, y4, 8, 0, 2 * Math.PI);
          }, [3, 3]);
        }
      }
    }
    const d = derive(photo);
    const miss = d.missing.length ? `row${d.missing.length === 1 ? '' : 's'} ${joinList(d.missing)} missing` : 'no row missing';
    pattern.node.setAttribute('aria-label', `The diffraction pattern calculated from this helix, not a photograph: rows every ${fmt(d.spacing, 3)} per nm, the arc on the axis at ${fmt(d.arc, 2)} per nm, ${miss}.`);
  }

  // The measured positions, labelled beside the pattern (wide) or under it (narrow), with the model's
  // own rows numbered so the reader can see which one has gone.
  function drawMarks() {
    const p = marks;
    p.clear();
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const pb = pattern.box;
    const geo = patternGeo(pb.w, pb.h, narrow);
    const d = derive(photo);
    const franklinRows = [];
    for (let l = 1; l <= 9; l += 1) franklinRows.push(l / 3.4);
    franklinRows.push(MEASURED.arc);
    if (!narrow) {
      const yOf = (Z) => geo.cy - Z * geo.s;
      if (marksOn) {
        let dd = '';
        for (const Z of franklinRows) {
          for (const sgn of [1, -1]) {
            const y = yOf(sgn * Z);
            if (y < 2 || y > hh - 2) continue;
            dd += `M0 ${fmt(y)} H6 `;
          }
        }
        if (dd) p.path(dd, { stroke: C.ink, 'stroke-width': 1.2, fill: 'none' });
      }
      for (let l = 1; l <= 9; l += 1) {
        const Z = l / photo.pitch;
        if (Z > Z_MAX - 0.06) break;
        const miss = d.missing.includes(l);
        p.text(12, yOf(Z) + 3.3, String(l), { 'font-size': 9.5, fill: miss ? C.coralText : C.soft, 'font-weight': miss ? 700 : 500, class: 'hl-num' });
      }
      if (marksOn) {
        const labels = [
          { Z: MEASURED.arc, a: '0.34 nm a base', b: 'from the arc' },
          { Z: 4 / 3.4, a: '4th row', b: 'missing' },
          { Z: -MEASURED.spacing, a: '3.4 nm a turn', b: 'from the rows' },
          { Z: -5 / 3.4, a: '2 nm across', b: 'from the X' },
        ];
        for (const lb of labels) {
          const y = yOf(lb.Z);
          p.text(26, y - 1.5, lb.a, { fit: [10.5, 8], width: w - 28, fill: C.ink, 'font-weight': 600, class: 'hl-num' });
          p.text(26, y + 10, lb.b, { fit: [9.5, 8], width: w - 28, fill: C.soft });
        }
      }
      p.text(0, hh - 17, 'Pattern: calculated', { fit: [9.5, 8], width: w, fill: C.faint });
      if (marksOn) p.text(0, hh - 5, 'marks: Franklin’s', { fit: [9.5, 8], width: w, fill: C.faint });
      return;
    }
    // Narrow: the axis runs along the stage, so the rows are columns and their labels go underneath.
    const xOf = (Z) => geo.cx + Z * geo.s;
    if (marksOn) {
      let dd = '';
      for (const Z of franklinRows) {
        for (const sgn of [1, -1]) {
          const x = xOf(sgn * Z);
          if (x < 2 || x > w - 2) continue;
          dd += `M${fmt(x)} 0 V6 `;
        }
      }
      if (dd) p.path(dd, { stroke: C.ink, 'stroke-width': 1.2, fill: 'none' });
    }
    p.text(0, 17, marksOn ? 'Calculated; marks: Franklin’s' : 'Calculated', { fit: [9.5, 8], width: geo.cx - 12, fill: C.faint });
    let lastX = -Infinity;
    for (let l = 1; l <= 9; l += 1) {
      const x = xOf(l / photo.pitch);
      if (x > w - 5) break;
      if (x - lastX < 9) continue;
      lastX = x;
      const miss = d.missing.includes(l);
      p.text(x, 17, String(l), { anchor: 'middle', 'font-size': 9.5, fill: miss ? C.coralText : C.soft, 'font-weight': miss ? 700 : 500, class: 'hl-num' });
    }
    if (!marksOn) return;
    const size = 10;
    const items = [
      { text: '3.4 nm a turn', x: xOf(-MEASURED.spacing), anchor: 'end' },
      { text: '2 nm across', x: xOf(-5 / 3.4), anchor: 'end' },
      { text: '4th row missing', x: xOf(4 / 3.4), anchor: 'start' },
      { text: '0.34 nm a base', x: xOf(MEASURED.arc), anchor: 'end' },
    ];
    const lines = [[], []];
    for (const it of items) {
      const wd = it.text.length * EM_ADVANCE * size;
      const x0 = clamp(it.anchor === 'end' ? it.x - wd : it.x, 0, Math.max(0, w - wd));
      const span = [x0, x0 + wd];
      const li = lines.findIndex((ln) => ln.every(([a, c]) => span[1] + 8 < a || span[0] > c + 8));
      if (li < 0) continue;
      lines[li].push(span);
      p.text(x0, li === 0 ? 30 : 42, it.text, { 'font-size': size, fill: C.ink, 'font-weight': 600, class: 'hl-num' });
    }
  }

  // Set as a table: the model's value beside Franklin's, the model's in coral where it is off.
  function fitTable(p, { size, levels, build }) {
    const { w, h: hh } = p.box;
    let out = null;
    for (let level = 0; level < levels; level += 1) {
      p.clear();
      const spec = build.columns(level);
      const rt = p.readout({ columns: spec, x: 0, y: 2, width: w, size });
      build.rows(rt, level);
      if (level === levels - 1 || rt.height(14) <= hh - 4) {
        rt.fill(hh - 4);
        out = { rt, level };
        break;
      }
    }
    return out;
  }

  function drawPhotoTable() {
    const p = table;
    const narrow = b.narrow;
    const m = photo;
    const d = derive(m);
    const off = (bad) => (bad ? { accent: C.coralText } : {});
    // The verdict ends the table, and the readout's closing rule sits 2.5 px under a note's baseline, through
    // the descenders of its last line; a rule of the table's own first puts the closing one clear of them.
    const verdict = (r, max) => {
      if (d.matches) {
        r.note(`Every feature matches the photograph: two strands 3/8 of a turn apart, ${fmt(m.pitch, 1)} nm a turn, ${m.perTurn} bases a turn, ${fmt(2 * m.radius, 1)} nm across.`, { accent: C.ink });
      } else {
        for (const hint of hints(m, d).slice(0, max)) r.note(hint, { accent: C.soft });
      }
      r.rule();
    };
    const helixRows = (r) => {
      r.head('The helix');
      r.row('Strands', [String(m.strands), '2'], off(m.strands !== 2));
      r.row('Pitch', [`${fmt(m.pitch, 1)} nm`, '3.4 nm'], off(!d.pitchOk));
      r.row('Rise per base', [`${riseStr(d.rise)} nm`, '0.34 nm'], off(!d.riseOk));
      r.row('Bases per turn', [String(m.perTurn), '10'], off(m.perTurn !== 10));
      r.row('Diameter', [`${fmt(2 * m.radius, 1)} nm`, '2 nm'], off(!d.radiusOk));
      r.row('Offset', [m.strands > 1 ? `${FRACTION[m.offset16]} turn` : '—', '3/8 turn'], off(m.strands > 1 && m.offset16 !== 6));
    };
    const patternRows = (r, { spacing = false, arc = false, spread = false } = {}) => {
      r.head('The pattern, per nm');
      if (spacing) r.row('Row spacing', [fmt(d.spacing, 3), '0.294'], off(!d.pitchOk));
      if (arc) r.row('Arc on the axis', [fmt(d.arc, 2), '2.94'], off(!d.riseOk));
      if (spread) r.row('Spread, row 1', [fmt(d.spread, 3), '0.293'], off(!d.radiusOk));
      r.row('Rows missing', [d.missing.length ? d.missing.join(', ') : 'none', '4'], off(!d.missOk));
    };
    const all = { spacing: true, arc: true, spread: true };
    const levels = narrow ? 4 : 3;
    fitTable(p, {
      size: narrow ? 10 : 10.6,
      levels,
      build: {
        columns: (level) => (narrow && level === levels - 1 ? null : ['Model', 'Franklin']),
        rows: (r, level) => {
          if (!narrow) {
            if (level === 0) helixRows(r);
            patternRows(r, level < 2 ? all : {});
            verdict(r, level < 2 ? 2 : 1);
            return;
          }
          if (level === 0) patternRows(r, all);
          else if (level === 1) patternRows(r, { spacing: true });
          else if (level === 2) patternRows(r);
          verdict(r, 1);
        },
      },
    });
    // Only the model's value is coral: Franklin's column is the measurement, and it is never wrong here.
    const right = p.box.w;
    for (const t of p.node.querySelectorAll('text.tb-rt-val')) {
      if (Math.abs(parseFloat(t.getAttribute('x')) - right) < 0.01) t.removeAttribute('style');
    }
  }

  // ---------------------------------------------------------------- drawing: the pair

  function drawPair() {
    const p = main;
    p.clear();
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const ps = currentPair();
    const placed = placePair(ps.L, ps.R, pair.run);
    const cx = w / 2;
    let k;
    let cy;
    if (!narrow) {
      k = Math.max(2, Math.min((w - 16) / 22.8, (hh - 117) / 10.3));
      cy = (hh + 21) / 2;
    } else {
      k = Math.max(2, Math.min((w - 32) / 20, (hh - 27) / 10.3));
      cy = 21 + 5.15 * k + Math.max(0, (hh - 27 - 10.3 * k) / 2);
    }
    const S = ([x, y]) => [cx + y * k, cy - x * k];
    const pts = [];
    const railX = [cx - 10 * k, cx + 10 * k];
    const ry0 = narrow ? 6 : 18;
    const ry1 = hh - (narrow ? 6 : 18);
    const sw = narrow ? 1.2 : 1.6;
    const small = narrow && k < 13;

    // The backbones, each with the way it runs, 5′ to 3′.
    const leftUp = pair.run === 'parallel';
    for (const X of railX) p.line(X, ry0, X, ry1, { stroke: C.soft, 'stroke-width': 3 });
    const arrow = (X, tipY, dir) => p.path(`M${fmt(X)} ${fmt(tipY)} L${fmt(X - 5)} ${fmt(tipY - dir * 9)} L${fmt(X + 5)} ${fmt(tipY - dir * 9)} Z`, { fill: C.soft });
    arrow(railX[0], leftUp ? ry0 - 3 : ry1 + 3, leftUp ? -1 : 1);
    arrow(railX[1], ry0 - 3, -1);
    const ends = [
      { X: railX[0], top: leftUp ? '3′' : '5′', bottom: leftUp ? '5′' : '3′', side: -1 },
      { X: railX[1], top: '3′', bottom: '5′', side: 1 },
    ];
    for (const e of ends) {
      if (!narrow) {
        p.text(e.X, ry0 - 7, e.top, { anchor: 'middle', 'font-size': 10.5, fill: C.soft, 'font-weight': 600 });
        p.text(e.X, ry1 + 16, e.bottom, { anchor: 'middle', 'font-size': 10.5, fill: C.soft, 'font-weight': 600 });
      } else {
        const x = e.X + e.side * 7;
        const anchor = e.side < 0 ? 'end' : 'start';
        p.text(x, ry0 + 9, e.top, { anchor, 'font-size': 10, fill: C.soft, 'font-weight': 600 });
        p.text(x, ry1, e.bottom, { anchor, 'font-size': 10, fill: C.soft, 'font-weight': 600 });
      }
    }

    // Each base: its sugar and the link to its backbone, its bonds, its rings.
    const sides = [
      { key: 'left', base: ps.L, other: 'right', otherBase: ps.R, rail: railX[0], misplaced: ps.parallel },
      { key: 'right', base: ps.R, other: 'left', otherBase: ps.L, rail: railX[1], misplaced: false },
    ];
    const hydrogens = { left: [], right: [] };
    for (const sd of sides) {
      const at = placed[sd.key];
      const edge = edgeOf(sd.base, ps.rare);
      const donors = [];
      edge.forEach((e, i) => {
        if (e !== 'D') return;
        const j = ps.parallel ? 2 - i : i;
        donors.push({ name: FACING[sd.base][i], toward: placed[sd.other][FACING[sd.otherBase][j]] });
      });
      hydrogens[sd.key] = hydrogensOf(sd.base, at, donors);
    }
    // Guanine against guanine points both amino groups at one spot, and the two hydrogens came out one
    // printed over the other, reading as a single shared H; where a donor meets a donor at the right width,
    // the cross drawn between them touched both letters. Two hydrogens from opposite bases that close are
    // drawn pulled back along their bonds, as far as half way, until they stand 1.35 Å apart.
    const along = (hy, s) => [hy.from[0] + (hy.at[0] - hy.from[0]) * s, hy.from[1] + (hy.at[1] - hy.from[1]) * s];
    for (const hl of hydrogens.left) {
      for (const hr of hydrogens.right) {
        let s = 1;
        const apart = () => Math.hypot(along(hl, s)[0] - along(hr, s)[0], along(hl, s)[1] - along(hr, s)[1]);
        while (s > 0.5 && apart() < 1.35) s -= 0.05;
        if (s < 1) {
          hl.at = along(hl, s);
          hr.at = along(hr, s);
        }
      }
    }

    const poly = (at, names) => `M${names.map((n) => S(at[n]).map((v) => fmt(v)).join(' ')).join(' L')} Z`;
    for (const sd of sides) {
      const at = placed[sd.key];
      const colour = BASE_COLOUR[sd.base];
      const c1 = at["C1'"];
      const ng = at[GLYC[sd.base]];
      const u = unit(c1[0] - ng[0], c1[1] - ng[1]);
      const cen = [c1[0] + u[0] * SUGAR_R, c1[1] + u[1] * SUGAR_R];
      const a0 = Math.atan2(c1[1] - cen[1], c1[0] - cen[0]);
      const verts = [];
      for (let i = 0; i < 5; i += 1) {
        const a = a0 + (i * 2 * Math.PI) / 5;
        verts.push(S([cen[0] + Math.cos(a) * SUGAR_R, cen[1] + Math.sin(a) * SUGAR_R]));
      }
      let far = verts[0];
      for (const v of verts) if (Math.abs(v[0] - cx) > Math.abs(far[0] - cx)) far = v;
      p.line(far[0], far[1], sd.rail, far[1], { stroke: sd.misplaced ? C.coral : C.soft, 'stroke-width': 1.6, 'stroke-dasharray': sd.misplaced ? '3 2.5' : null });
      p.circle(sd.rail, far[1], narrow ? 2.8 : 3.6, { fill: C.soft });
      // The glycosidic bond, then the sugar over its end.
      const [gx1, gy1] = S(ng);
      const [gx2, gy2] = S(c1);
      p.line(gx1, gy1, gx2, gy2, { stroke: C.soft, 'stroke-width': 1.4 });
      p.path(`M${verts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L')} Z`, { fill: C.paper3, stroke: C.soft, 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
      if (sd.misplaced) {
        const [scx, scy] = S(cen);
        p.circle(scx, scy, SUGAR_R * k + 5, { fill: 'none', stroke: C.coral, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' });
      }
      p.circle(gx2, gy2, 2, { fill: C.ink });
      verts.forEach((v) => pts.push(v));
      // Groups off the ring, in the ink of a bond: double bonds as a pair of lines.
      for (const [a, c, order] of (ps.rare && EXO_RARE[sd.base]) || EXO[sd.base]) {
        const [x1, y1] = S(at[a]);
        const [x2, y2] = S(at[c]);
        if (order === 2) {
          const [ux, uy] = unit(x2 - x1, y2 - y1);
          const o = 1.3;
          p.line(x1 - uy * o, y1 + ux * o, x2 - uy * o, y2 + ux * o, { stroke: C.soft, 'stroke-width': 1.1 });
          p.line(x1 + uy * o, y1 - ux * o, x2 + uy * o, y2 - ux * o, { stroke: C.soft, 'stroke-width': 1.1 });
        } else {
          p.line(x1, y1, x2, y2, { stroke: C.soft, 'stroke-width': 1.3 });
        }
        pts.push([x2, y2]);
      }
      if (PURINE[sd.base]) p.path(poly(at, FIVE), { fill: tint(colour, 28), stroke: colour, 'stroke-width': sw, 'stroke-linejoin': 'round' });
      p.path(poly(at, SIX), { fill: tint(colour, 28), stroke: colour, 'stroke-width': sw, 'stroke-linejoin': 'round' });
      for (const n of Object.keys(at)) pts.push(S(at[n]));
    }

    // Hydrogen bonds, where the pair makes them; a cross where a donor meets a donor or an acceptor an
    // acceptor. Neither is drawn at the wrong width: the pair is not in place to make either.
    if (ps.widthOk && ps.bonds) {
      for (const lk of ps.links) {
        const donorSide = lk.donorLeft ? 'left' : 'right';
        const accSide = lk.donorLeft ? 'right' : 'left';
        const donorName = FACING[lk.donorLeft ? ps.L : ps.R][lk.donorLeft ? lk.i : lk.j];
        const accName = FACING[lk.donorLeft ? ps.R : ps.L][lk.donorLeft ? lk.j : lk.i];
        const hy = hydrogens[donorSide].find((x) => x.facing && x.name === donorName);
        if (!hy) continue;
        const acc = placed[accSide][accName];
        const [ux, uy] = unit(acc[0] - hy.at[0], acc[1] - hy.at[1]);
        const len = Math.hypot(acc[0] - hy.at[0], acc[1] - hy.at[1]);
        const [x1, y1] = S([hy.at[0] + ux * 0.28, hy.at[1] + uy * 0.28]);
        const [x2, y2] = S([hy.at[0] + ux * (len - 0.42), hy.at[1] + uy * (len - 0.42)]);
        p.line(x1, y1, x2, y2, { stroke: C.ink, 'stroke-width': 1.4, 'stroke-dasharray': '2.5 2.5' });
      }
    }
    for (const sd of sides) {
      for (const hy of hydrogens[sd.key]) {
        const [x1, y1] = S(hy.from);
        const [x2, y2] = S(hy.at);
        p.line(x1, y1, x2, y2, { stroke: C.soft, 'stroke-width': 1.1 });
        pts.push([x2, y2]);
      }
    }
    // The atoms that carry a letter: every N and O, in the ink.
    const atomSize = narrow ? 9.5 : 10.5;
    for (const sd of sides) {
      const at = placed[sd.key];
      for (const n of HETERO[sd.base]) {
        const [x, y] = S(at[n]);
        p.label(x, y + atomSize * 0.36, n[0], { size: atomSize, halo: 2.6 });
      }
      if (sd.base === 'T') {
        const [x, y] = S(at.C7);
        const [cxr] = S(at.C5);
        p.label(x + (x > cxr ? 4 : -4), y + atomSize * 0.36, 'CH₃', { size: atomSize - 0.5, halo: 2.6, anchor: x > cxr ? 'start' : 'end', fill: C.soft });
      }
      for (const hy of hydrogens[sd.key]) {
        const [x, y] = S(hy.at);
        if (small) p.circle(x, y, 1.7, { fill: C.soft });
        else p.label(x, y + 9 * 0.36, 'H', { size: 9, halo: 2.4, fill: C.soft });
      }
      const ring = SIX.map((n) => S(at[n]));
      const gx = ring.reduce((s0, v) => s0 + v[0], 0) / ring.length;
      const gy = ring.reduce((s0, v) => s0 + v[1], 0) / ring.length;
      const bsz = narrow ? 13 : 17;
      p.text(gx, gy + bsz * 0.36, sd.base, { anchor: 'middle', 'font-size': bsz, 'font-weight': 700, fill: C.ink });
    }
    if (ps.widthOk) {
      for (const cl of ps.clashes) {
        const a = placed.left[FACING[ps.L][cl.i]];
        const c = placed.right[FACING[ps.R][cl.j]];
        const [mx, my] = S([(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]);
        const r = narrow ? 3.6 : 4.6;
        p.path(`M${fmt(mx - r)} ${fmt(my - r)} L${fmt(mx + r)} ${fmt(my + r)} M${fmt(mx + r)} ${fmt(my - r)} L${fmt(mx - r)} ${fmt(my + r)}`, { stroke: C.coral, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' });
      }
    }

    // The two widths: every pair's, fixed by the backbones, and this pair's, C1′ to C1′.
    const top = cy - 5.15 * k;
    const half = SITE_SPAN * 5 * k;
    const lc = S(placed.left["C1'"])[0];
    const rc = S(placed.right["C1'"])[0];
    const widthColour = ps.widthOk ? C.ink : C.coralText;
    const wText = fmt(ps.widthNm, 1);
    if (!narrow) {
      bracket(p, cx - half, top - 31, cx + half, top - 31, { dir: -1, dash: '3 2.5' });
      p.text(cx, top - 36, 'every pair in the helix: 1.1 nm', { anchor: 'middle', 'font-size': 10.5, fill: C.soft, class: 'hl-num' });
      bracket(p, lc, top - 13, rc, top - 13, { dir: -1, colour: widthColour, width: 1.3 });
      p.text(cx, top - 18, `this pair: ${wText} nm`, { anchor: 'middle', 'font-size': 10.5, 'font-weight': 600, fill: widthColour, class: 'hl-num' });
      const c1l = S(placed.left["C1'"]);
      const c1r = S(placed.right["C1'"]);
      p.line(lc, top - 9, c1l[0], c1l[1] - 3, { stroke: C.faint, 'stroke-width': 0.8, 'stroke-dasharray': '1.5 2.5' });
      p.line(rc, top - 9, c1r[0], c1r[1] - 3, { stroke: C.faint, 'stroke-width': 0.8, 'stroke-dasharray': '1.5 2.5' });
      // Which side of the pair faces which groove: placed off whatever is drawn near the middle.
      const band = pts.filter(([X]) => Math.abs(X - cx) < 50);
      const hiY = Math.min(...band.map(([, Y]) => Y));
      const loY = Math.max(...band.map(([, Y]) => Y));
      p.text(cx, Math.max(top - 2, hiY - 13), 'major-groove side', { anchor: 'middle', 'font-size': 10, fill: C.faint });
      p.text(cx, Math.min(cy + 5.15 * k + 4, loY + 19), 'minor-groove side', { anchor: 'middle', 'font-size': 10, fill: C.faint });
      const by = cy + 5.15 * k + 14;
      bracket(p, railX[0], by, railX[1], by, { dir: 1 });
      p.text(cx, by + 15, 'backbones 2 nm apart', { anchor: 'middle', 'font-size': 10.5, fill: C.soft, class: 'hl-num' });
    } else {
      const yS = top - 4;
      bracket(p, lc, yS, rc, yS, { dir: -1, colour: widthColour, width: 1.3 });
      bracket(p, cx - half, yS - 4, cx + half, yS - 4, { dir: -1, dash: '3 2.5', tick: 3 });
      p.text(cx, yS - 9, `this pair: ${wText} nm; every pair: 1.1 nm`, { anchor: 'middle', fit: [10, 8], width: railX[1] - railX[0] - 8, fill: widthColour, 'font-weight': 600, class: 'hl-num' });
      // The grooves are named here too: the parallel pair's verdict is about which side its sugar is on.
      const band = pts.filter(([X]) => Math.abs(X - cx) < 45);
      const hiY = Math.min(...band.map(([, Y]) => Y));
      const loY = Math.max(...band.map(([, Y]) => Y));
      p.text(cx, Math.max(yS + 14, hiY - 11), 'major-groove side', { anchor: 'middle', 'font-size': 9.5, fill: C.faint });
      p.text(cx, Math.min(ry1 - 2, loY + 17), 'minor-groove side', { anchor: 'middle', 'font-size': 9.5, fill: C.faint });
    }
  }

  // The duplex built so far, a rung for each pair added, bottom up (wide) or left to right (narrow).
  function drawStrip() {
    const p = strip;
    p.clear();
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const halfStroke = (x1, y1, x2, y2, colour) => p.line(x1, y1, x2, y2, { stroke: colour, 'stroke-width': 5 });
    const hbonds = (x1, y1, x2, y2, n, vertical) => {
      const offs = n === 3 ? [-1.8, 0, 1.8] : [-1, 1];
      for (const o of offs) {
        if (vertical) p.line(x1 + o, y1, x2 + o, y2, { stroke: C.ink, 'stroke-width': 0.8 });
        else p.line(x1, y1 + o, x2, y2 + o, { stroke: C.ink, 'stroke-width': 0.8 });
      }
    };
    if (!narrow) {
      const xl = 34;
      const xr = Math.max(xl + 40, w - 34);
      const y0 = 22;
      const y1 = Math.max(y0 + 40, hh - 22);
      p.line(xl, y0, xl, y1, { stroke: C.soft, 'stroke-width': 3 });
      p.line(xr, y0, xr, y1, { stroke: C.soft, 'stroke-width': 3 });
      p.text(xl, y0 - 8, '5′', { anchor: 'middle', 'font-size': 10.5, fill: C.soft, 'font-weight': 600 });
      p.text(xl, y1 + 16, '3′', { anchor: 'middle', 'font-size': 10.5, fill: C.soft, 'font-weight': 600 });
      p.text(xr, y0 - 8, '3′', { anchor: 'middle', 'font-size': 10.5, fill: C.soft, 'font-weight': 600 });
      p.text(xr, y1 + 16, '5′', { anchor: 'middle', 'font-size': 10.5, fill: C.soft, 'font-weight': 600 });
      const gap = (y1 - y0) / 12.5;
      const mid = (xl + xr) / 2;
      built.forEach(([L, R, n], i) => {
        const y = y1 - (i + 0.75) * gap;
        halfStroke(xl + 1.5, y, mid - 7, y, BASE_COLOUR[L]);
        halfStroke(mid + 7, y, xr - 1.5, y, BASE_COLOUR[R]);
        hbonds(mid - 7, y, mid + 7, y, n, false);
        p.text(xl - 9, y + 4, L, { anchor: 'end', 'font-size': 11, 'font-weight': 700, fill: C.ink });
        p.text(xr + 9, y + 4, R, { anchor: 'start', 'font-size': 11, 'font-weight': 700, fill: C.ink });
      });
      if (!built.length) {
        p.text(mid, (y0 + y1) / 2 - 5, 'Pairs you add', { anchor: 'middle', 'font-size': 10, fill: C.faint });
        p.text(mid, (y0 + y1) / 2 + 9, 'stack here', { anchor: 'middle', 'font-size': 10, fill: C.faint });
      }
    } else {
      const x0 = 18;
      const x1 = Math.max(x0 + 40, w - 18);
      const yt = Math.min(16, hh * 0.3);
      const yb = Math.max(yt + 12, hh - 16);
      p.line(x0, yt, x1, yt, { stroke: C.soft, 'stroke-width': 3 });
      p.line(x0, yb, x1, yb, { stroke: C.soft, 'stroke-width': 3 });
      p.text(x0 - 4, yt + 3.5, '5′', { anchor: 'end', 'font-size': 10, fill: C.soft, 'font-weight': 600 });
      p.text(x1 + 4, yt + 3.5, '3′', { anchor: 'start', 'font-size': 10, fill: C.soft, 'font-weight': 600 });
      p.text(x0 - 4, yb + 3.5, '3′', { anchor: 'end', 'font-size': 10, fill: C.soft, 'font-weight': 600 });
      p.text(x1 + 4, yb + 3.5, '5′', { anchor: 'start', 'font-size': 10, fill: C.soft, 'font-weight': 600 });
      const gap = (x1 - x0) / 12.5;
      const mid = (yt + yb) / 2;
      const inner = Math.min(6, (yb - yt) / 4);
      built.forEach(([L, R, n], i) => {
        const x = x0 + (i + 0.75) * gap;
        halfStroke(x, yt + 1.5, x, mid - inner, BASE_COLOUR[L]);
        halfStroke(x, mid + inner, x, yb - 1.5, BASE_COLOUR[R]);
        hbonds(x, mid - inner, x, mid + inner, n, true);
        p.text(x, yt - 4, L, { anchor: 'middle', 'font-size': 10, 'font-weight': 700, fill: C.ink });
        p.text(x, yb + 12, R, { anchor: 'middle', 'font-size': 10, 'font-weight': 700, fill: C.ink });
      });
      if (!built.length) p.text((x0 + x1) / 2, mid + 3.5, 'Pairs you add stack here', { anchor: 'middle', 'font-size': 10, fill: C.faint });
    }
    const listed = built.map(([L, R]) => `${L}·${R}`).join(', ');
    strip.node.setAttribute('aria-label', built.length ? `The duplex built so far, ${built.length} pair${built.length === 1 ? '' : 's'} from the bottom: ${listed}.` : 'The duplex built so far: no pairs yet.');
  }

  function drawPairsTable() {
    const p = table;
    const narrow = b.narrow;
    const ps = currentPair();
    const n = counts();
    const holds = built.length ? (n.A === n.T && n.G === n.C ? 'hold' : 'broken') : '—';
    const kindText = ps.pairType.replace('-', '–');
    const verdict = (r) => r.note(pairVerdict(ps) + (ps.fits && built.length >= MAX_PAIRS ? ' The strip holds twelve pairs; Reset to start again.' : ''), { accent: ps.fits ? C.ink : C.coralText });
    const countRows = (r, full) => {
      r.head('The duplex');
      if (full) r.row('Pairs built', String(built.length));
      r.row('A · T', `${n.A} · ${n.T}`);
      r.row('G · C', `${n.G} · ${n.C}`);
      r.row('Chargaff’s rules', holds);
    };
    const levels = narrow ? 5 : 3;
    fitTable(p, {
      size: narrow ? 10 : 10.6,
      levels,
      build: {
        columns: () => null,
        rows: (r, level) => {
          if (level === 0) {
            r.head('This pair');
            r.row('Left base', cap(BASE_NAME[ps.L]));
            r.row('Right base', cap(BASE_NAME[ps.R]));
            r.row('Kind', kindText);
            r.row('Width, C1′ to C1′', `${fmt(ps.widthNm, 1)} nm`, ps.widthOk ? {} : { accent: C.coralText });
            r.row('Hydrogen bonds', ps.bonds ? String(ps.bonds) : 'none');
            verdict(r);
            countRows(r, true);
            return;
          }
          if (level === 1) {
            r.head('This pair');
            if (!narrow) r.row('Kind', kindText);
            r.row('Width, C1′ to C1′', `${fmt(ps.widthNm, 1)} nm`, ps.widthOk ? {} : { accent: C.coralText });
            r.row('Hydrogen bonds', ps.bonds ? String(ps.bonds) : 'none');
            verdict(r);
            countRows(r, true);
            return;
          }
          verdict(r);
          if (level === 2) countRows(r, false);
          else if (level === 3) {
            r.head('The duplex');
            r.row('A · T · G · C', `${n.A} · ${n.T} · ${n.G} · ${n.C}`);
          } else r.rule(); // the verdict ends the table: see drawPhotoTable's verdict
        },
      },
    });
  }

  // ---------------------------------------------------------------- drawing

  b.onDraw(() => {
    if (scene === 'photograph') {
      drawHelix();
      paintPattern();
      drawMarks();
      drawPhotoTable();
    } else {
      drawPair();
      drawStrip();
      drawPairsTable();
    }
    addBtn.disabled = !(currentPair().fits && built.length < MAX_PAIRS);
    main.focusMark();
    setSubscripts(main.node);
    drawn = true;
  });

  applyScene();

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   scene                  'photograph' | 'pairs'
  //   strands                1, 2 or 3
  //   pitchNm, riseNm, radiusNm   the model's; riseNm is pitchNm ÷ basesPerTurn, three decimals
  //   basesPerTurn           a whole number, 6 to 14: the Rise control steps through it
  //   offsetTurns            the second strand's axial offset as a fraction of a turn, 0.25 to 0.5; it is
  //                          kept, and reported, while there is one strand
  //   layerLineSpacingPerNm  1 ÷ pitchNm, three decimals
  //   meridionalPerNm        1 ÷ riseNm, three decimals
  //   missingLayerLines      the rows from 1 to 9 whose strand factor is below 0.05: [4] at the B values,
  //                          never [4] for one strand
  //   matchesPhotograph      two strands, pitch 3.4 ± 0.1 nm, rise 0.34 ± 0.01 nm, radius 0.9–1.1 nm and
  //                          missingLayerLines exactly [4]
  //   measurementsShown      whether Franklin's positions are drawn
  //   leftBase, rightBase    'A' | 'T' | 'G' | 'C'
  //   pairType               'purine-pyrimidine' | 'purine-purine' | 'pyrimidine-pyrimidine'
  //   pairWidthNm            C1′ to C1′ along the pair, one decimal: 1.1 for either Watson–Crick pair
  //   hydrogenBonds          0, 2 or 3; 0 at the wrong width or with a donor facing a donor
  //   pairFits, whyNot       whyNot is 'too-wide' | 'too-narrow' | 'sugars-misplaced' | 'rare-tautomer' |
  //                          'no-hydrogen-bonds', checked in that order, and null when the pair fits
  //   tautomer               'usual' | 'rare'
  //   strandsRun             'antiparallel' | 'parallel'
  //   pairsBuilt, countA, countT, countG, countC   the duplex built with Add pair, twelve pairs at most
  //   chargaffHolds          countA === countT and countG === countC
  //   t                      the clock, seconds, three decimals; nothing in the figure moves with it
  // Reset puts every one of them back where it opened, and keeps the scene.
  return b.handle({
    setTheme(theme, pal) {
      if (pal) palette = pal;
      if (drawn) b.redraw();
    },
  });
}
