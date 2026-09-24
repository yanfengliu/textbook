// Let go, and watch a membrane happen. A tank of water a few tens of nanometres across, into which the
// reader tips one chosen amphipathic molecule and then stops interfering. Every molecule moves under a
// seeded random walk, and the ONLY thing the walk weighs is how much tail surface is touching water.
// Out of that one rule, with no target arrangement anywhere in this file, two-tailed phospholipids find
// a flat bilayer, single-tailed detergents find micelles, a pure hydrocarbon finds one droplet, and
// cholesterol wedges among phospholipid tails.
//
// WHAT THIS IS, HONESTLY. A two-dimensional energy-minimising toy at a scale of nanometres, not a
// molecular dynamics simulation. There are no forces, no momentum and no water molecules: there is a
// Metropolis walk over molecule positions, and one energy term. Four things about it are a model rather
// than a measurement, and each is stated where it is used below:
//   - The molecules are drawn in cross-section with their two tails side by side, so a phospholipid
//     here is about 1.2 nm wide where a real one is about 0.8 nm. Its LENGTH is to scale, 3.2 nm, which
//     is what the thickness reading depends on.
//   - The Metropolis step weighs tail exposure through a pairwise proxy — every pair of tail beads in
//     contact removes a fixed amount of water contact — because that is what can be recomputed for one
//     molecule at a time. The readout measures the real thing: a probe the size of a water molecule is
//     walked round every tail bead, and the fraction of directions it can reach is the exposure. The two
//     are the same quantity to within the width of the kernel, and it is the readout that is quoted.
//   - The temperature slider moves the jostling linearly and faster than absolute temperature does.
//     Over 0-90 °C the absolute temperature changes by only a third, which would not take even this toy
//     apart, and it does not take a real bilayer apart at all: a membrane survives boiling, and it is a
//     detergent, not heat, that dissolves one. The slider is here because the arrangement is a
//     competition between the penalty and the jostling, and this is the only way to let a reader see
//     the losing side of it. The number it reports is the number it is set to.
//   - Two dimensions. A 2D bilayer is a strip, and its vesicle is a ring; the areas and the counts are
//     therefore lengths and counts along a line. What survives the loss of a dimension is the argument:
//     which shape of molecule gives which arrangement, and that an edge is what costs.
// The claim the figure makes is that one rule is enough. A figure that quietly helped the lipids into
// line would be making a different claim, and this header would be the only place the difference showed.
//
// One drawing unit is one nanometre. The tank is 20 nm wide; its height follows the shape of its pane,
// between MIN_RATIO and MAX_RATIO of its width, and a pane flatter than that is given the whole tank at
// the scale its height allows, with paper beside it.
// It is periodic left to right, so a bilayer spanning it is a closed bag with no rim — and that wrap is
// what holds the sheet flat. `Curl` takes the wrap away and does nothing else; the two rims it opens
// are what the sheet then rolls up to be rid of, and it does: the exposed edge goes to nothing and the
// buried fraction reaches about 0.98.
//
// HOW IT CLOSES, AND WHY IT IS NOT A RING. Thirty-four molecules close by rolling their ends in and
// capping them, not by making a ring with water inside. That is arithmetic and not a shortcoming of the
// walk. A ring of this sheet would have an inner leaflet of circumference 2*pi*(R - 3) and an outer one
// of 2*pi*(R + 3), and at 1.16 nm a molecule the smallest R that leaves the inner leaflet room is about
// 8 nm, which needs some ninety molecules. A tank that held ninety would take three times as long to
// assemble and would draw them at two thirds the size. So this tank shows the argument — an edge is what
// costs, and a sheet left running will get rid of one — at the scale where a reader can count the
// molecules, and the reading says which of the two closed shapes it has. `assembly` still has 'vesicle'
// in it, and the classifier still finds one; a tank this size does not reach it.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — the tank filling a left pane, the reading and the edge trace in a right column;
//   narrow — the tank above with the whole column it does not need, three reading rows beneath it, and
//            the trace dropped, because a trace with an axis in a 100 px column puts its labels under
//            nine device pixels.
//
// Every frame is a function of the clock and the reader's actions: the walk advances SWEEPS_PER_SECOND
// sweeps per second of clock, so setTime(t) reproduces a frame exactly, rewinding by replaying from the
// seed when it has to. describe() is documented at the bottom of this file.
import { el, h, text, C, tint, uid, clamp } from './lib/svg.js';
import { readoutCss, readoutTable, readoutHeight, fitRows, focusMark, scaleBar, round, mulberry32, INK } from './lib/mol-draw.js';
import { membranePart } from '../palette.js';

export const meta = { kind: 'bilayer', title: 'Let go, and watch a membrane happen', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

// ---------------------------------------------------------------- the molecules
//
// Local coordinates run +y from the head down the molecule. Every radius and offset is in nanometres.
// A phospholipid is 3.5 nm from the top of its head to the end of its tails, which is the length this
// book draws it at. Two of them meeting tip to tip interleave by about a nanometre, as a real bilayer's
// do, and the sheet they make measures about 5.8 nm with an oily core of 3.5 — which is the right answer
// for BARE LIPID and is what the tank has in it. Section 4.1's "about 7 nm from one watery face to the
// other" is a plasma membrane, and half the mass of one is protein; its core, which the same paragraph
// puts at three or four nanometres, is what this sheet's core should be compared with. The readout says
// which of the two it is quoting, because a figure that printed 5.8 beside a chapter that says 7 and
// left the reader to guess would be the worse of the two mistakes. The tail tips are the fattest beads in the molecule: two leaflets meeting tip
// to tip do interleave a little, as a real bilayer's do, and a thin tip would let them interleave far
// more than one does and give a sheet a nanometre too thin.
//
// The widths are the whole of the shape rule, and they were found by running the tank rather than read
// out of a book: a phospholipid's head is 1.16 nm across against a pair of tails 1.16 nm across that can
// tilt and interleave, so the two take about the same room, which is a cylinder, and cylinders tile flat.
// A detergent's head is 1.72 nm against one 0.80 nm tail, which is a wedge, and wedges close into a
// ball. Cholesterol's hydroxyl is 0.60 nm against a 1.08 nm ring system, which is a wedge the other way
// up, so it can make nothing of its own and slots between somebody else's tails instead. The shape rule
// is real; where the line between flat and curved falls in a two-dimensional tank of beads is not
// something to derive from a textbook, and it was found by looking. Nothing else in this file knows any
// of it: it is the arithmetic of what fits beside what.

const HEAD_R = 0.58;
const TAIL_R = 0.34;
const TIP_R = 0.40; // the tail tips are the fattest beads: see the note above about interleaving

const SPECIES = {
  phospholipid: {
    id: 'phospholipid',
    head: { x: 0, y: 0, r: HEAD_R, part: 'lipidHead' },
    tails: [
      { x: -0.18, y: 1.40, r: TAIL_R }, { x: -0.18, y: 2.52, r: TIP_R },
      { x: 0.18, y: 1.40, r: TAIL_R }, { x: 0.18, y: 2.52, r: TIP_R },
    ],
    tailPart: 'lipidTail',
  },
  detergent: {
    id: 'detergent',
    head: { x: 0, y: 0, r: 0.86, part: 'lipidHead' },
    tails: [{ x: 0, y: 1.30, r: TAIL_R }, { x: 0, y: 2.14, r: TIP_R }],
    tailPart: 'lipidTail',
  },
  hydrocarbon: {
    id: 'hydrocarbon',
    head: null,
    tails: [{ x: 0, y: 0, r: 0.42 }, { x: 0, y: 0.86, r: 0.42 }, { x: 0, y: 1.72, r: 0.42 }],
    tailPart: 'lipidTail',
  },
  cholesterol: {
    id: 'cholesterol',
    head: { x: 0, y: 0, r: 0.28, part: 'lipidHead' },
    tails: [{ x: 0, y: 0.78, r: 0.50 }, { x: 0, y: 1.60, r: 0.40 }],
    tailPart: 'cholesterol',
  },
};

// The mixture is a quarter cholesterol, which is about a plasma membrane's proportion. `count` is the
// same in every tank, so the five runs are the same number of molecules.
const COUNT = 34;
const MIX_CHOLESTEROL = 8;
const MAX_BEADS = 5;

const MOLECULES = [
  { id: 'phospholipid', label: 'Phospholipid', aria: 'Phospholipid, two tails and a small head' },
  { id: 'detergent', label: 'Detergent', aria: 'Detergent, one tail and a bulky head' },
  { id: 'hydrocarbon', label: 'Hydrocarbon', aria: 'Hydrocarbon, no head at all' },
  { id: 'cholesterol', label: 'Cholesterol', aria: 'Cholesterol, stiff rings and one hydroxyl' },
  { id: 'mixed', label: 'Mixture', aria: 'Mixture, phospholipid with cholesterol among the tails' },
];
const MOLECULE_LABEL = Object.fromEntries(MOLECULES.map((m) => [m.id, m.label]));

function recipeFor(molecule, i) {
  if (molecule === 'mixed') return i % 4 === 0 && i < MIX_CHOLESTEROL * 4 ? SPECIES.cholesterol : SPECIES.phospholipid;
  return SPECIES[molecule];
}

// What each arrangement is, and the sentence the reading gives for it. These are prose: they are read
// by the same reader who reads the chapter, and they say what the tank has done, never what to expect.
// Dispersed said "nothing is together yet, and almost every tail is in the water", which broke that rule
// with "yet" and was false where it is read most: a tank held at 90 °C, beside a reading of 55-60% of
// its tail surface hidden, because a crowded tank's molecules touch whether or not anything assembles.
const ARRANGEMENT = {
  dispersed: { word: 'Dispersed', line: 'nothing holds together: molecules meet and part again, and much of every tail is in the water' },
  micelle: { word: 'Micelles', line: 'a wedge cannot tile a sheet, so the tails hide in small balls' },
  bilayer: { word: 'Bilayer', line: 'cylinders tile flat: tails inward, heads facing the water on both sides' },
  vesicle: { word: 'Vesicle', line: 'the sheet has closed on itself, and the edge that cost has gone' },
  droplet: { word: 'Droplet', line: 'with no head to face the water, all it can do is gather' },
};

// ---------------------------------------------------------------- the model

const TANK_W = 20; // nm
// The tank never gets flatter than MIN_RATIO of its width, nor taller than MAX_RATIO. The floor is physics,
// not layout: the count is fixed, so a flatter tank is a more crowded one, and a crowded enough tank
// cannot be taken apart by any heat the slider offers — its molecules have nowhere to go that is not
// against another's tails. The floor was 0.52, a 10.4 nm tank, which is what a chapter page at 1024 px
// gave; measured 2026-09-23 with this file's model over 30 s of clock at 90 °C, that tank was a sheet or
// micelles in 89% of sweeps where the lab's 13.8 nm tank was in 10%, so the figure's claim that heat
// wins held on one screen and not on another. With the verdict held over a second (SAMPLE_SWEEPS), over
// nine seeds and 30 s of clock each, a tank came together at 90 °C in 3 runs at 12.0 nm, 1 at 12.4 nm and
// none at 12.8 nm, which still came together once at 88 °C; at 13.2 nm no run did at 88 °C or 90 °C. So
// 0.66, a 13.2 nm tank, and a pane flatter than that is drawn narrower rather than holding a flatter tank.
const MIN_RATIO = 0.66;
const MAX_RATIO = 1.15;

const WELL = 1.0; // the water contact one touching pair of tail beads removes, in model units
const RANGE = 0.55; // nm over which that contact falls away
const KREP = 26; // the overlap penalty, per nm² of squeeze
const KT37 = 0.60; // the jostling at 37 °C, in the same units as WELL
const T_SLOPE = 0.030; // per °C, and exponential; see the header — far faster than absolute temperature moves
const STEP_NM = 0.34;
const STEP_RAD = 0.55;
// One move in eight is a long one. A walk of small steps only does find the same arrangement, but a
// molecule that has joined a small aggregate almost never leaves it again, so the aggregates stop
// merging and the tank freezes half way. A long step is the same Metropolis move at a larger scale —
// it changes nothing about what is being weighed.
const LONG_EVERY = 8;
const LONG_NM = 2.6;
const CLUSTER_EVERY = 4; // sweeps between one round of whole-aggregate moves
const CLUSTER_NM = 1.1;
const CLUSTER_RAD = 0.30;
const SWEEPS_PER_SECOND = 1400;
const MAX_SWEEPS_PER_CALL = 24000; // one setTime may not run for ever; a longer jump stops short and says so

const PROBE = 0.30; // the water probe that measures exposure, nm
const DIRS = 12;
// What the reader is told the tank IS — its arrangement, and whether its edge has sealed — is what the
// tank has HELD over the last second of its own clock, not what one sweep shows. One sweep is a single
// microstate of a thermal walk, and it flickers: measured 2026-09-23 over 30 s of clock with this file's
// own model (three seeds, the lab's 13.8 nm tank), a formed sheet at 37 °C classified as micelles in 0.2%
// of sweeps and at 48 °C in 2.7%, because the spanning sheet momentarily splits in two; and at 90 °C the
// tank read micelles or a sheet in about one sweep in ten, because a tank this crowded buries half its
// tail surface by jostling alone, 0.36-0.74 of it from one sweep to the next, astride the 0.62 line.
// No line on one sweep can separate the two cases — a sheet at 65 °C dips to 0.65 and a hot tank at
// 90 °C reaches 0.74 — so the verdict is read from the history instead: a sample every SAMPLE_SWEEPS
// sweeps, and the arrangement the most samples in the last VERDICT_SAMPLES of them agree on. A spike
// lasts a few hundredths of a second of clock, so a second holds twenty of the walk's own fluctuations
// and a spike cannot outvote them; a sheet that has formed holds, and is reported from the second after
// it does. Every sample is taken at a fixed sweep count, so the verdict is still a function of the clock.
const SAMPLE_SWEEPS = 70; // 0.05 s of clock
const VERDICT_SAMPLES = 20; // one second of clock
// An end is open when the exposed edge, averaged over that same second, is more than a lone molecule
// shows. A closed sheet's thermal rim is one molecule at a time — about 1.6 nm of edge on and off, which
// the one-sweep test this replaced (under 0.5 nm) called unsealed for most of the time after a sheet had
// capped both its ends — while two open ends keep three or four molecules' tails in the water, 3-6 nm.
// 2.5 nm is between the two.
const HELD_SEALED_NM = 2.5;
const PUNCTURE_R = 3.2; // nm the needle clears
const NEEDLE_SHOW_S = 0.7;
const TRACE_S = 6;

const TEMP_MIN = 0;
const TEMP_MAX = 90;
const kTat = (tempC) => KT37 * Math.exp((tempC - 37) * T_SLOPE);

const DIR_X = [];
const DIR_Y = [];
for (let i = 0; i < DIRS; i += 1) {
  DIR_X.push(Math.cos((i * 2 * Math.PI) / DIRS));
  DIR_Y.push(Math.sin((i * 2 * Math.PI) / DIRS));
}

// The end of the tails, per species, so a thickness measurement never has to guess which bead it is,
// and the tail surface one molecule shows to water when it is ALONE in the tank, which is the
// denominator the burial reading is given as a fraction of. Reported that way, nought is a molecule on
// its own and one is a tail with no water anywhere near it; reported as a bare fraction of each bead's
// own circumference, a lone phospholipid already reads seventy per cent, because four overlapping discs
// hide most of one another whatever else is in the tank. This is the relative accessible surface a
// protein structure is described with, and it is measured the same way.
for (const sp of Object.values(SPECIES)) {
  // Put the molecule's own origin at the middle of it, not at its head. Every neighbour test in the
  // walk is "are these two molecules close enough to touch", asked of their origins, and a head-origin
  // molecule reaches 2.9 nm while a middle-origin one reaches 1.8 — which is the difference between
  // fourteen molecules to test against and six, and between a walk that keeps up with the clock and one
  // that does not.
  const beads = sp.head ? [sp.head, ...sp.tails] : sp.tails;
  const lo = Math.min(...beads.map((b) => b.y - b.r));
  const hi = Math.max(...beads.map((b) => b.y + b.r));
  const mid = (lo + hi) / 2;
  for (const b of beads) b.y -= mid;
  sp.reach = Math.max(...beads.map((b) => Math.hypot(b.x, b.y) + b.r));
  sp.len = hi - lo;
  sp.tipY = Math.max(...sp.tails.map((tp) => tp.y));
  let arc = 0;
  for (const tp of sp.tails) {
    let open = 0;
    for (let d = 0; d < DIRS; d += 1) {
      const px = tp.x + DIR_X[d] * (tp.r + PROBE);
      const py = tp.y + DIR_Y[d] * (tp.r + PROBE);
      let blocked = false;
      const others = sp.head ? [sp.head, ...sp.tails] : sp.tails;
      for (const ob of others) {
        if (ob === tp) continue;
        const lim = ob.r + PROBE;
        if ((px - ob.x) ** 2 + (py - ob.y) ** 2 < lim * lim) { blocked = true; break; }
      }
      if (!blocked) open += 1;
    }
    arc += (open / DIRS) * 2 * Math.PI * tp.r;
  }
  sp.soloArc = Math.max(1e-6, arc);
}


// A tank of molecules. Everything the walk changes lives here, so a rewind is a fresh Tank replayed
// from the same seed rather than an undo log.
class Tank {
  constructor(molecule, seed, width, height, wrapped) {
    this.molecule = molecule;
    this.seed = seed;
    this.w = width;
    this.h = height;
    this.wrapped = wrapped;
    this.sweeps = 0;
    this.rand = mulberry32(seed);
    this.mol = [];
    const rnd = mulberry32((seed ^ 0x5bf03635) >>> 0);
    // Dispersed: a jittered grid, every molecule pointing somewhere of its own. Nothing in here knows
    // what a bilayer is.
    const cols = Math.max(1, Math.round(Math.sqrt((COUNT * width) / height)));
    const rows = Math.ceil(COUNT / cols);
    for (let i = 0; i < COUNT; i += 1) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const recipe = recipeFor(molecule, i);
      const n = recipe.tails.length + (recipe.head ? 1 : 0);
      const m = {
        recipe,
        x: ((c + 0.5) / cols) * width + (rnd() - 0.5) * (width / cols) * 0.3,
        y: ((r + 0.5) / rows) * height + (rnd() - 0.5) * (height / rows) * 0.3,
        a: rnd() * Math.PI * 2,
        n,
        bx: new Float64Array(n),
        by: new Float64Array(n),
        br: new Float64Array(n),
        tail: new Uint8Array(n),
      };
      this.mol.push(m);
      this.place(m);
    }
    this.cell = 2 * Math.max(...Object.values(SPECIES).map((sp) => sp.reach)) + RANGE; // for the energy neighbours
    this.bcell = 1.15; // a probe's reach, for the exposure measurement
    this.rebuild();
    this.startHistory();
  }

  // Bead positions in tank coordinates, from the molecule's centre and its angle.
  place(m) {
    const { recipe } = m;
    const ca = Math.cos(m.a);
    const sa = Math.sin(m.a);
    let k = 0;
    if (recipe.head) {
      m.bx[k] = m.x + recipe.head.x * ca - recipe.head.y * sa;
      m.by[k] = m.y + recipe.head.x * sa + recipe.head.y * ca;
      m.br[k] = recipe.head.r;
      m.tail[k] = 0;
      k += 1;
    }
    for (const tp of recipe.tails) {
      m.bx[k] = m.x + tp.x * ca - tp.y * sa;
      m.by[k] = m.y + tp.x * sa + tp.y * ca;
      m.br[k] = tp.r;
      m.tail[k] = 1;
      k += 1;
    }
  }

  // Two grids, rebuilt whenever anything moves: molecules by their centre, for the energy, and every
  // bead, for the exposure probe. Rebuilding both here is also what drops the measurement caches, so a
  // reading can never be one that was taken before the molecules moved.
  rebuild() {
    this._at = -1;
    this._cAt = -1;
    this.nx = Math.max(1, Math.floor(this.w / this.cell));
    this.ny = Math.max(1, Math.floor(this.h / this.cell));
    this.grid = Array.from({ length: this.nx * this.ny }, () => []);
    this.bnx = Math.max(1, Math.floor(this.w / this.bcell));
    this.bny = Math.max(1, Math.floor(this.h / this.bcell));
    this.bgrid = Array.from({ length: this.bnx * this.bny }, () => []);
    for (let i = 0; i < this.mol.length; i += 1) {
      const m = this.mol[i];
      const cx = clamp(Math.floor((m.x / this.w) * this.nx), 0, this.nx - 1);
      const cy = clamp(Math.floor((m.y / this.h) * this.ny), 0, this.ny - 1);
      this.grid[cy * this.nx + cx].push(i);
      for (let b = 0; b < m.n; b += 1) {
        const gx = clamp(Math.floor((m.bx[b] / this.w) * this.bnx), 0, this.bnx - 1);
        const gy = clamp(Math.floor((m.by[b] / this.h) * this.bny), 0, this.bny - 1);
        this.bgrid[gy * this.bnx + gx].push(i * MAX_BEADS + b);
      }
    }
  }

  // The shortest x separation, which wraps while the tank is wrapped.
  dx(a, b) {
    let d = a - b;
    if (this.wrapped) {
      if (d > this.w / 2) d -= this.w;
      else if (d < -this.w / 2) d += this.w;
    }
    return d;
  }

  neighbours(m, out) {
    out.length = 0;
    const cx = clamp(Math.floor((m.x / this.w) * this.nx), 0, this.nx - 1);
    const cy = clamp(Math.floor((m.y / this.h) * this.ny), 0, this.ny - 1);
    for (let jy = cy - 1; jy <= cy + 1; jy += 1) {
      if (jy < 0 || jy >= this.ny) continue;
      for (let jx = cx - 1; jx <= cx + 1; jx += 1) {
        let wx = jx;
        if (wx < 0 || wx >= this.nx) {
          if (!this.wrapped) continue;
          wx = ((wx % this.nx) + this.nx) % this.nx;
        }
        const cellList = this.grid[jy * this.nx + wx];
        for (let n = 0; n < cellList.length; n += 1) out.push(cellList[n]);
      }
    }
  }

  // The energy of one molecule against everything else: a soft overlap on every bead pair, and the
  // water contact removed by every tail pair in reach. Nothing else, and nothing about arrangement.
  energyOf(idx, list) {
    const m = this.mol[idx];
    let e = 0;
    for (let n = 0; n < list.length; n += 1) {
      const j = list[n];
      if (j === idx) continue;
      const o = this.mol[j];
      // Two molecules that cannot reach each other at all are dropped before any bead is looked at.
      const cdx = this.dx(m.x, o.x);
      const cdy = m.y - o.y;
      const cut = m.recipe.reach + o.recipe.reach + RANGE;
      if (cdx * cdx + cdy * cdy > cut * cut) continue;
      for (let a = 0; a < m.n; a += 1) {
        for (let b = 0; b < o.n; b += 1) {
          const ddx = this.dx(m.bx[a], o.bx[b]);
          const ddy = m.by[a] - o.by[b];
          const s = m.br[a] + o.br[b];
          const lim = s + RANGE;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 > lim * lim) continue;
          const d = Math.sqrt(d2);
          if (d < s) e += KREP * (s - d) * (s - d);
          if (m.tail[a] && o.tail[b]) e -= WELL * (d <= s ? 1 : 0.5 * (1 + Math.cos((Math.PI * (d - s)) / RANGE)));
        }
      }
    }
    // The floor and the ceiling of the tank, and its two ends while the wrap is off. A wall keeps a
    // molecule in and nothing more: nothing here is attracted to one.
    for (let a = 0; a < m.n; a += 1) {
      const top = m.by[a] - m.br[a];
      const bot = this.h - (m.by[a] + m.br[a]);
      if (top < 0) e += KREP * top * top;
      if (bot < 0) e += KREP * bot * bot;
      if (!this.wrapped) {
        const left = m.bx[a] - m.br[a];
        const right = this.w - (m.bx[a] + m.br[a]);
        if (left < 0) e += KREP * left * left;
        if (right < 0) e += KREP * right * right;
      }
    }
    return e;
  }

  // One sweep: as many attempted moves as there are molecules, each accepted by Metropolis.
  sweep(kT) {
    const list = [];
    for (let n = 0; n < this.mol.length; n += 1) {
      const idx = Math.min(this.mol.length - 1, Math.floor(this.rand() * this.mol.length));
      const m = this.mol[idx];
      this.neighbours(m, list);
      const before = this.energyOf(idx, list);
      const ox = m.x;
      const oy = m.y;
      const oa = m.a;
      const far = n % LONG_EVERY === 0;
      const reach = far ? LONG_NM : STEP_NM;
      m.x += (this.rand() - 0.5) * 2 * reach;
      m.y += (this.rand() - 0.5) * 2 * reach;
      m.a += (this.rand() - 0.5) * 2 * (far ? Math.PI : STEP_RAD);
      m.x = this.wrapped ? ((m.x % this.w) + this.w) % this.w : clamp(m.x, 0, this.w);
      m.y = clamp(m.y, 0, this.h);
      this.place(m);
      const dE = this.energyOf(idx, list) - before;
      if (dE > 0 && this.rand() >= Math.exp(-dE / kT)) {
        m.x = ox;
        m.y = oy;
        m.a = oa;
        this.place(m);
      }
    }
    this.sweeps += 1;
    this.rebuild();
  }

  // Every fourth sweep, offer each aggregate a step of its own. A walk that only ever offers ONE
  // molecule a step is still a correct walk, but a molecule that has joined an aggregate almost never
  // leaves it again, so the aggregates stop finding each other and the tank freezes as a scatter of
  // small balls — which is a fact about how long a reader would have to wait, not about what the rule
  // wants. This is the same Metropolis test on the same energy, offered to a whole cluster at once:
  // rigid, so every pair inside the cluster keeps its distance and cancels out of the comparison.
  // The move is small beside the cell the neighbours are drawn from, so each molecule's neighbour list
  // is taken once, before the move, and used for both sides of the comparison: a molecule outside it
  // contributes nothing to either side, so the difference is exact, and the grid is rebuilt once at the
  // end rather than twice per cluster.
  clusterSweep(kT) {
    const groups = this.clusters();
    for (let g = 0; g < groups.length; g += 1) {
      const idxs = groups[g];
      if (idxs.length < 2) continue;
      const refX = this.mol[idxs[0]].x;
      const refY = this.mol[idxs[0]].y;
      const dxs = idxs.map((i) => this.dx(this.mol[i].x, refX));
      const dys = idxs.map((i) => this.mol[i].y - refY);
      const old = idxs.map((i) => ({ x: this.mol[i].x, y: this.mol[i].y, a: this.mol[i].a }));
      const lists = idxs.map((i) => { const out = []; this.neighbours(this.mol[i], out); return out; });
      let before = 0;
      for (let k = 0; k < idxs.length; k += 1) before += this.energyOf(idxs[k], lists[k]);
      const mx = (this.rand() - 0.5) * 2 * CLUSTER_NM;
      const my = (this.rand() - 0.5) * 2 * CLUSTER_NM;
      const rot = (this.rand() - 0.5) * 2 * CLUSTER_RAD;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      for (let k = 0; k < idxs.length; k += 1) {
        const m = this.mol[idxs[k]];
        const u = dxs[k] * cr - dys[k] * sr;
        const v = dxs[k] * sr + dys[k] * cr;
        const nx = refX + u + mx;
        m.x = this.wrapped ? ((nx % this.w) + this.w) % this.w : clamp(nx, 0, this.w);
        m.y = clamp(refY + v + my, 0, this.h);
        m.a = old[k].a + rot;
        this.place(m);
      }
      let after = 0;
      for (let k = 0; k < idxs.length; k += 1) after += this.energyOf(idxs[k], lists[k]);
      const dE = after - before;
      if (dE > 0 && this.rand() >= Math.exp(-dE / kT)) {
        for (let k = 0; k < idxs.length; k += 1) {
          const m = this.mol[idxs[k]];
          m.x = old[k].x;
          m.y = old[k].y;
          m.a = old[k].a;
          this.place(m);
        }
      }
    }
    this.rebuild();
  }

  // The needle: push every molecule out of a disc. Nothing closes the hole afterwards but the walk.
  puncture(cx, cy) {
    for (const m of this.mol) {
      const ddx = this.dx(m.x, cx);
      const ddy = m.y - cy;
      const d = Math.hypot(ddx, ddy);
      if (d < PUNCTURE_R) {
        const k = d < 1e-3 ? 1 : (PUNCTURE_R + 0.35) / d;
        const nx = cx + (d < 1e-3 ? PUNCTURE_R : ddx * k);
        m.x = this.wrapped ? ((nx % this.w) + this.w) % this.w : clamp(nx, 0.2, this.w - 0.2);
        m.y = clamp(cy + ddy * k, 0.2, this.h - 0.2);
        this.place(m);
      }
    }
    this.rebuild();
  }

  // What the tank has held, begun again: when it is filled, and when the wrap comes off or goes back on.
  // Until a full second of samples has come in, the tank as it stood at that moment stands for the rest
  // of the second — so a verdict changes once, when the samples that disagree with it are a majority,
  // rather than following the first two or three samples wherever they point.
  startHistory() {
    this.history = [];
    this.baseline = { assembly: classify(this), edge: this.measure().edgeLengthNm };
    this.verdict = this.baseline.assembly;
  }

  // One sample of what the tank is, for the verdict the reader is shown. Called at fixed sweep counts
  // only, so the history — and every verdict read off it — is a function of the clock.
  remember() {
    this.history.push({ assembly: classify(this), edge: this.measure().edgeLengthNm });
    if (this.history.length > VERDICT_SAMPLES) this.history.shift();
    this.verdict = nextVerdict(this.verdict, heldSamples(this));
  }

  // Keep the molecules inside a tank whose pane has changed shape.
  reshape(width, height) {
    const sx = width / this.w;
    const sy = height / this.h;
    this.w = width;
    this.h = height;
    for (const m of this.mol) {
      m.x = clamp(m.x * sx, 0, width);
      m.y = clamp(m.y * sy, 0, height);
      this.place(m);
    }
    this.rebuild();
  }

  // ---- what the tank measures about itself ----
  //
  // Exposure is the solvent-accessible surface, measured rather than inferred: a probe the size of a
  // water molecule is set down in twelve directions round each tail bead, and a direction counts as
  // water when the probe fits there. A head shields the tails under it, which is what a head is for, so
  // only a rim or a hole leaves tail surface open.
  measure() {
    if (this._at === this.sweeps) return this._m;
    let exposedArc = 0;
    let soloArc = 0;
    let edge = 0;
    let rim = 0;
    for (let i = 0; i < this.mol.length; i += 1) {
      const m = this.mol[i];
      let arc = 0;
      for (let a = 0; a < m.n; a += 1) {
        if (!m.tail[a]) continue;
        let open = 0;
        for (let d = 0; d < DIRS; d += 1) {
          const px = m.bx[a] + DIR_X[d] * (m.br[a] + PROBE);
          const py = m.by[a] + DIR_Y[d] * (m.br[a] + PROBE);
          if (!this.blocked(px, py, i, a)) open += 1;
        }
        arc += (open / DIRS) * 2 * Math.PI * m.br[a];
      }
      const solo = m.recipe.soloArc;
      exposedArc += arc;
      soloArc += solo;
      // A molecule still showing two fifths of the tail surface it would show on its own is at a rim or
      // at the lip of a hole. A molecule in the middle of a sheet shows almost none. The exposed EDGE is
      // what those rim molecules show, and it is what falls to nothing when a sheet closes on itself —
      // which the sum over every molecule never does, because a sheet always leaks a little between its
      // heads.
      if (arc > solo * 0.40) { rim += 1; edge += arc; }
    }
    this._at = this.sweeps;
    this._m = {
      tailsBuried: soloArc > 0 ? clamp(1 - exposedArc / soloArc, 0, 1) : 0,
      edgeLengthNm: edge,
      rim,
    };
    return this._m;
  }

  blocked(px, py, skipMol, skipBead) {
    const gx = clamp(Math.floor((px / this.w) * this.bnx), 0, this.bnx - 1);
    const gy = clamp(Math.floor((py / this.h) * this.bny), 0, this.bny - 1);
    for (let jy = gy - 1; jy <= gy + 1; jy += 1) {
      if (jy < 0 || jy >= this.bny) continue;
      for (let jx = gx - 1; jx <= gx + 1; jx += 1) {
        let wx = jx;
        if (wx < 0 || wx >= this.bnx) {
          if (!this.wrapped) continue;
          wx = ((wx % this.bnx) + this.bnx) % this.bnx;
        }
        const cellList = this.bgrid[jy * this.bnx + wx];
        for (let n = 0; n < cellList.length; n += 1) {
          const packed = cellList[n];
          const j = Math.floor(packed / MAX_BEADS);
          const b = packed - j * MAX_BEADS;
          if (j === skipMol && b === skipBead) continue;
          const o = this.mol[j];
          const ddx = this.dx(px, o.bx[b]);
          const ddy = py - o.by[b];
          const lim = o.br[b] + PROBE;
          if (ddx * ddx + ddy * ddy < lim * lim) return true;
        }
      }
    }
    return false;
  }

  // Molecules joined where their tails are in reach. `assembly` is read off these, and nothing in here
  // knows the name of an arrangement before it has measured one.
  clusters() {
    if (this._cAt === this.sweeps) return this._c;
    const n = this.mol.length;
    const parent = new Int32Array(n);
    for (let i = 0; i < n; i += 1) parent[i] = i;
    const find = (start) => {
      let r = start;
      while (parent[r] !== r) r = parent[r];
      let i = start;
      while (parent[i] !== r) { const p = parent[i]; parent[i] = r; i = p; }
      return r;
    };
    const list = [];
    const reach = 0.35;
    for (let i = 0; i < n; i += 1) {
      const m = this.mol[i];
      this.neighbours(m, list);
      for (let k = 0; k < list.length; k += 1) {
        const j = list[k];
        if (j <= i) continue;
        const o = this.mol[j];
        const cdx = this.dx(m.x, o.x);
        const cdy = m.y - o.y;
        const cut = m.recipe.reach + o.recipe.reach + reach;
        if (cdx * cdx + cdy * cdy > cut * cut) continue;
        let joined = false;
        for (let a = 0; a < m.n && !joined; a += 1) {
          if (!m.tail[a]) continue;
          for (let b = 0; b < o.n; b += 1) {
            if (!o.tail[b]) continue;
            const ddx = this.dx(m.bx[a], o.bx[b]);
            const ddy = m.by[a] - o.by[b];
            const lim = m.br[a] + o.br[b] + reach;
            if (ddx * ddx + ddy * ddy < lim * lim) { joined = true; break; }
          }
        }
        if (joined) { const ra = find(i); const rb = find(j); if (ra !== rb) parent[ra] = rb; }
      }
    }
    const groups = new Map();
    for (let i = 0; i < n; i += 1) {
      const r = find(i);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(i);
    }
    this._cAt = this.sweeps;
    this._c = [...groups.values()].sort((a, b) => b.length - a.length);
    return this._c;
  }
}

// The spread of a cluster about its own centre, in the tank's wrapped coordinates: where its middle is,
// how round it is, and whether it is hollow. Used by the classifier and by the thickness measurement.
function spreadOf(tank, idxs, beads) {
  const ox = tank.mol[idxs[0]].x;
  const pts = [];
  for (const i of idxs) {
    const m = tank.mol[i];
    if (beads) for (let a = 0; a < m.n; a += 1) pts.push([tank.dx(m.bx[a], ox), m.by[a]]);
    else pts.push([tank.dx(m.x, ox), m.y]);
  }
  let cx = 0;
  let cy = 0;
  for (const p of pts) { cx += p[0]; cy += p[1]; }
  cx /= pts.length;
  cy /= pts.length;
  let xx = 0;
  let yy = 0;
  let xy = 0;
  for (const p of pts) { const u = p[0] - cx; const v = p[1] - cy; xx += u * u; yy += v * v; xy += u * v; }
  xx /= pts.length; yy /= pts.length; xy /= pts.length;
  const tr = xx + yy;
  const disc = Math.max(0, (tr * tr) / 4 - (xx * yy - xy * xy));
  const l1 = tr / 2 + Math.sqrt(disc);
  const l2 = Math.max(1e-9, tr / 2 - Math.sqrt(disc));
  const rg = Math.sqrt(Math.max(1e-9, tr));
  let inner = 0;
  let rSum = 0;
  let rSq = 0;
  for (const p of pts) {
    const r = Math.hypot(p[0] - cx, p[1] - cy);
    if (r < rg * 0.45) inner += 1;
    rSum += r;
    rSq += r * r;
  }
  const rMean = rSum / pts.length;
  const rStd = Math.sqrt(Math.max(0, rSq / pts.length - rMean * rMean));
  return {
    ox, cx, cy, pts, l1, l2, rg, xx, yy, xy,
    elongation: Math.sqrt(l1 / l2),
    inner: inner / pts.length,
    // How evenly the molecules sit at one distance from the centre: small for a ring, large for
    // anything lumpy.
    evenness: rMean > 1e-6 ? rStd / rMean : 1,
  };
}

// The direction a molecule's head faces: local -y, turned by the molecule's own angle.
function headDir(m) {
  return [Math.sin(m.a), -Math.cos(m.a)];
}

// Where a molecule's tails end, in tank coordinates.
function tipOf(m) {
  return [m.x - m.recipe.tipY * Math.sin(m.a), m.y + m.recipe.tipY * Math.cos(m.a)];
}

// The thickness of a sheet, measured where the sheet is rather than across a bounding box, so a sheet
// that has bent is measured as honestly as a flat one. Every molecule is paired with the one whose tails
// end nearest to where its own tails end and which faces the other way — that is what "across the
// midplane" means — and the distance between the two heads, with a head's own radius added at each end,
// is one reading of the sheet. The median of those is the answer.
//   The first version took the nearest head facing the other way instead, which is not the same thing:
// a single flipped molecule two nanometres away in the SAME leaflet satisfies it, and enough of them do
// that the median came out a nanometre and a half short — and it got shorter when the molecule was made
// longer, which is what gave it away.
function sheetThickness(tank, idxs) {
  const spans = [];
  for (const i of idxs) {
    const mi = tank.mol[i];
    if (!mi.recipe.head) continue;
    const [ux, uy] = headDir(mi);
    const [tix, tiy] = tipOf(mi);
    let best = Infinity;
    let partner = -1;
    for (const j of idxs) {
      if (j === i) continue;
      const mj = tank.mol[j];
      if (!mj.recipe.head) continue;
      const [vx, vy] = headDir(mj);
      if (ux * vx + uy * vy > -0.55) continue;
      const [tjx, tjy] = tipOf(mj);
      const d = Math.hypot(tank.dx(tjx, tix), tjy - tiy);
      if (d < best) { best = d; partner = j; }
    }
    if (partner < 0 || best > 1.8) continue;
    const mj = tank.mol[partner];
    spans.push(Math.hypot(tank.dx(mj.bx[0], mi.bx[0]), mj.by[0] - mi.by[0]) + mi.br[0] + mj.br[0]);
  }
  if (!spans.length) return 0;
  spans.sort((a, b) => a - b);
  return spans[Math.floor(spans.length / 2)];
}

// The largest aggregate a ball can be, worked out from the molecule rather than chosen. Its tails have
// to reach the middle, so the tail core cannot be wider than one molecule less its head; and the tail
// beads have to fit inside that disc at a packing a two-dimensional fluid actually reaches, about 0.85.
// A cluster bigger than that is not a ball, and in this model there is nothing else a crowd of
// amphipathic molecules can be but a sheet — flat, or closed on itself. It comes out at eighteen
// molecules for this phospholipid and nine for the detergent, and it moves with the geometry above
// instead of being a number somebody once measured and left behind: written as a constant 13, it went
// stale the moment the molecule was made longer, and a tank of plain micelles was reported as a sheet.
const PACKING_2D = 0.85;
for (const sp of Object.values(SPECIES)) {
  const beads = sp.head ? [sp.head, ...sp.tails] : sp.tails;
  const len = Math.max(...beads.map((b) => b.y + b.r)) - Math.min(...beads.map((b) => b.y - b.r));
  const core = Math.max(0.4, len - (sp.head ? 2 * sp.head.r : 0));
  const tailArea = sp.tails.reduce((sum, tp) => sum + Math.PI * tp.r * tp.r, 0);
  sp.micelleMax = Math.max(4, Math.round((Math.PI * core * core * PACKING_2D) / tailArea));
}

function micelleMax(tank, idxs) {
  let m = 0;
  for (const i of idxs) m = Math.max(m, tank.mol[i].recipe.micelleMax);
  return m;
}

// What the largest cluster IS, read off its geometry. Never set by the button that chose the molecule:
// a detergent tank that somehow made a sheet would be reported as a sheet.
function classify(tank) {
  const big = tank.clusters()[0] || [];
  const n = tank.mol.length;
  // Dispersed is a statement about water, not about cluster bookkeeping: most of the tail surface is
  // still wet. Asked as "is the largest cluster small", it answered `bilayer` for the opening frame,
  // where a jittered grid puts a few molecules close enough to chain the whole tank into one group
  // while nothing whatever is buried. The tank is crowded — thirty-four molecules three and a half
  // nanometres long in twenty by fifteen — so a molecule on the opening grid already has its neighbours
  // in the way and reads about 0.43; an assembled sheet reads 0.96, and the line is drawn between them.
  if (tank.measure().tailsBuried < 0.62) return 'dispersed';
  if (big.length < Math.max(4, n * 0.14)) return 'dispersed';
  if (!big.some((i) => tank.mol[i].recipe.head)) return 'droplet';
  // A sheet that reaches right across the wrapped tank is a sheet, and it has to be asked first: its
  // molecules' offsets from one another wrap, so the centre of the cluster comes out somewhere in the
  // water and every hollowness test below reads it as a ring. That is exactly what happened — a flat
  // spanning bilayer was reported as a vesicle, on and off, as the walk ran.
  if (spansTank(tank, big)) return 'bilayer';
  const s = spreadOf(tank, big, false);
  // A ring is hollow AND even: nothing within half its radius of the centre, and every molecule at
  // about the same distance from it. Asked on hollowness alone, two bilayer patches with water between
  // them passed — they have nothing at their common centre either — and the tank reported a vesicle
  // where a person could see two flat sheets.
  const ballMax = micelleMax(tank, big);
  // A bag and a ball both have their molecules at one distance from the middle and nothing at the
  // centre — a two-dimensional micelle is a ring of molecule centres as much as a vesicle is — so
  // hollowness alone cannot tell them apart, and a tank of detergent micelles was reported as a
  // vesicle. What differs is SIZE: a ball is one molecule across and a bag is several, because a bag
  // has two leaflets and water inside them.
  const span = Math.max(...big.map((i) => tank.mol[i].recipe.len));
  if (big.length > ballMax && s.rg > span * 1.15 && s.inner < 0.06 && s.elongation < 1.9 && s.evenness < 0.24) return 'vesicle';
  if (big.length > ballMax) return 'bilayer';
  return 'micelle';
}

// The last second of samples, with the tank as it stood when the history began standing in for any of
// the second that has not come in yet. See startHistory().
function heldSamples(tank) {
  const pad = VERDICT_SAMPLES - tank.history.length;
  return pad > 0 ? [...Array(pad).fill(tank.baseline), ...tank.history] : tank.history;
}

// Whether a cluster reaches right across the wrapped tank: something in every twelfth of its width.
function spansTank(tank, idxs) {
  if (!tank.wrapped) return false;
  const bins = 12;
  const seen = new Array(bins).fill(false);
  for (const i of idxs) seen[clamp(Math.floor((tank.mol[i].x / tank.w) * bins), 0, bins - 1)] = true;
  return seen.every(Boolean);
}

// The arrangement the tank has held, moved on only when the last second says so plainly: to the one the
// most samples agree on (the most recent of them on a tie) once that one holds SWITCH_SAMPLES of the
// second, or once the arrangement being reported has fallen under KEEP_SAMPLES of it. Between the two
// the reading stays where it was. A plain majority was not enough on its own: at 80 °C, where the sheet
// is melting, the tank spends the second split between a sheet and nothing, and a majority vote flipped
// the word 65 times in 30 s of clock where a single sweep flipped it 307. This is hysteresis, and it is
// honest to the model rather than a filter laid over it: the tank near its melting point genuinely holds
// neither arrangement for long, and the reading changes when the tank has plainly changed.
const SWITCH_SAMPLES = 14; // seven tenths of the second
const KEEP_SAMPLES = 5; // a quarter of it
function nextVerdict(current, samples) {
  const count = new Map();
  let most = 0;
  for (const s of samples) {
    const c = (count.get(s.assembly) || 0) + 1;
    count.set(s.assembly, c);
    most = Math.max(most, c);
  }
  let mode = samples[samples.length - 1].assembly;
  for (let i = samples.length - 1; i >= 0; i -= 1) if (count.get(samples[i].assembly) === most) { mode = samples[i].assembly; break; }
  if (mode === current || most >= SWITCH_SAMPLES || (count.get(current) || 0) < KEEP_SAMPLES) return mode;
  return current;
}

function heldArrangement(tank) {
  return tank.verdict;
}

// Whether the tank has held no open end: its exposed edge averaged over the last second is less than two
// rim molecules show. See HELD_SEALED_NM.
function heldSealed(tank) {
  let sum = 0;
  const hist = heldSamples(tank);
  for (const s of hist) sum += s.edge;
  return sum / hist.length < HELD_SEALED_NM;
}

// One sweep of the walk, the whole-aggregate moves on their own schedule, and a sample of what the tank
// is on its. The figure's clock and anything that replays it go through here, so the three cannot drift.
function stepTank(tank, kT) {
  tank.sweep(kT);
  if (tank.sweeps % CLUSTER_EVERY === 0) tank.clusterSweep(kT);
  if (tank.sweeps % SAMPLE_SWEEPS === 0) tank.remember();
}

// ---------------------------------------------------------------- style

const NARROW_W = 620;
const NARROW_H = 330;

const CSS = `${readoutCss('.tb-bilayer')}
.tb-bilayer { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 69fr) minmax(0, 31fr);
  grid-template-rows: minmax(0, 1fr);
  padding: 0.35rem 0.5rem var(--bl-pad, 3rem); column-gap: var(--space-3); row-gap: var(--space-2);
  font-family: var(--font-ui); }
.tb-bilayer .bl-pane { position: relative; min-width: 0; min-height: 0; }
.tb-bilayer .bl-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-bilayer .bl-tank { grid-column: 1; grid-row: 1; }
.tb-bilayer .bl-side { grid-column: 2; grid-row: 1; }
.tb-bilayer svg text { font-family: var(--font-ui); }
.tb-bilayer .bl-needle { stroke: var(--ink); fill: none; stroke-linecap: round; }
/* The one line the tank prints over its own water, and the scale bar's label, carry the paper with them
   rather than a box: both stand over molecules that move, so there is no clear place to put them. */
.tb-bilayer .bl-over, .tb-bilayer .mol-scale text { stroke: var(--paper); stroke-width: 3px;
  stroke-linejoin: round; paint-order: stroke; }
.tb-bilayer .bl-over { font-weight: 600; fill: var(--ink-soft); }
/* Three groups on one rule: what is in the tank, what is done to it, and what runs it. */
.tb-bilayer .fig-toolbar { justify-content: flex-start; }
.tb-bilayer .bl-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-bilayer .bl-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
/* The primary action is told by the head rule on its edge and the weight of its ink, never by a fill. */
.tb-bilayer .bl-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-bilayer .bl-temp { display: flex; align-items: center; gap: var(--space-1); color: var(--ink-soft);
}
.tb-bilayer .bl-temp input { width: 5.4rem; }
.tb-bilayer .bl-temp b { font-weight: 600; font-variant-numeric: lining-nums tabular-nums;
  min-width: 3.2rem; color: var(--ink); }
.tb-bilayer.is-narrow { grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) var(--bl-side-h, 92px); }
.tb-bilayer.is-narrow .bl-tank { grid-column: 1; grid-row: 1; }
.tb-bilayer.is-narrow .bl-side { grid-column: 1; grid-row: 2; }
/* The phone toolbar is the whole design problem of this figure: ten controls and a slider under a stage
   only 487 px tall. Set at the desktop size they took three fifths of it and left the tank two molecule
   lengths deep. Everything here is smaller by a measured amount — 10.9 px type, which is 33 device
   pixels on a 3x phone and well clear of the nine the book's floor asks for — and the labels are the
   same words, because an item's goal quotes them. */
.tb-bilayer.is-narrow .fig-toolbar { gap: 0.22rem; left: var(--space-2); right: var(--space-2);
  bottom: var(--space-2); }
.tb-bilayer.is-narrow .bl-group { gap: 0.22rem; }
.tb-bilayer.is-narrow .bl-sep { display: none; }
.tb-bilayer.is-narrow .fig-btn { padding: 0.18rem 0.38rem; font-size: 0.68rem; }
.tb-bilayer.is-narrow .bl-temp { font-size: 0.68rem; gap: 0.2rem; padding: 0; }
.tb-bilayer.is-narrow .bl-temp input { width: 3.2rem; }
.tb-bilayer.is-narrow .bl-temp b { min-width: 2.7rem; }
`;

const fmt = (v, dp = 1) => v.toFixed(dp);

// A sentence broken into note rows that fit the column. readoutTable draws a note on one line and does
// not wrap, so a sentence longer than the column was cut off at the stage edge — "heads facing the water
// on bot". Inter runs about 0.53 em a character at this size over mixed-case prose.
function noteRows(str, width, size) {
  const max = Math.max(10, Math.floor(width / (size * 0.53)));
  const lines = [];
  let cur = '';
  for (const word of str.split(' ')) {
    if (!cur) cur = word;
    else if (`${cur} ${word}`.length <= max) cur = `${cur} ${word}`;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines.map((line) => ({ note: line, size }));
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('bl');
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let sideH = 0;
  let ready = false;

  const PART = {
    lipidHead: membranePart('lipidHead').color,
    lipidTail: membranePart('lipidTail').color,
    cholesterol: membranePart('cholesterol').color,
  };

  // ---- state ----
  // The state the tank mounts in, so that `reset()` below has one place to read it from rather than two
  // literals that can drift apart from these.
  const OPENING = { molecule: 'phospholipid', tempC: 37 };
  let molecule = OPENING.molecule;
  let seed = 11;
  let tempC = OPENING.tempC;
  let wrapped = true;
  let t = ctx.pinnedTime ?? 0;
  let playing = false;
  let tankH = TANK_W / 1.35;
  let tank = new Tank(molecule, seed, TANK_W, tankH, wrapped);
  let punctured = false;
  let punctureAt = null;
  let puncturePoint = null;
  let edgeBefore = 0;
  let edgeAtPuncture = 0;
  let healSeconds = null;
  // The last thing the reader did to the tank, needle or curl, so the reading speaks of that and not of
  // an older one: a heal time is news until the reader curls the sheet, and then it is history.
  let lastEvent = null;
  // Whether the last Curl had a sheet reaching across the tank to open. When nothing reached across, the
  // wrap was holding nothing flat and taking it away opened no ends — which the reading has to say
  // rather than describe ends that were never there: a sheet the needle had split into two short
  // pieces was reported as having "sealed both ends" by rolling them in, when nothing had rolled.
  let curlOpened = false;
  const OPENED_NM = 1.0; // less than the tails of one molecule at an open end
  let trace = [{ t: 0, edge: tank.measure().edgeLengthNm }];

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-bilayer' });
  wrap.append(h('style', { text: CSS }));
  const tankSvg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'A tank of water holding the chosen molecule. Space releases the molecules and pauses them again, right arrow steps the walk on, N puts the needle through the sheet, C takes away the wrap, Home starts the tank again.',
  });
  const sideSvg = el('svg', { 'aria-hidden': 'true' });
  const tankPane = h('div', { class: 'bl-pane bl-tank' }, [tankSvg]);
  const sidePane = h('div', { class: 'bl-pane bl-side' }, [sideSvg]);

  const button = (label, aria, onClick, attrs = {}) => {
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': aria, text: label, ...attrs });
    node.addEventListener('click', onClick);
    return node;
  };

  const molBtns = MOLECULES.map((m) => button(m.label, m.aria, () => setMolecule(m.id), { 'aria-pressed': String(m.id === molecule) }));
  const btnRelease = button('Release', 'Release, let the molecules go', () => setPlaying(!playing), { class: 'fig-btn bl-primary' });
  const btnStep = button('Step', 'Step, advance the walk a little', () => step());
  const btnReset = button('Reset', 'Reset, empty the tank and start again with a new seed', () => reset(true));
  const btnNeedle = button('Needle', 'Needle, put a hole through the sheet', () => needle());
  const btnCurl = button('Curl', 'Curl, take away the wrap that was holding the sheet flat', () => setWrapped(!wrapped), { 'aria-pressed': String(!wrapped) });

  const tempInput = h('input', {
    type: 'range', class: 'fig-range', min: String(TEMP_MIN), max: String(TEMP_MAX), step: '1', value: String(tempC),
    'aria-label': 'Temperature, 0 to 90 degrees Celsius',
  });
  const tempRead = h('b', { text: `${tempC} °C` });
  tempInput.addEventListener('input', () => {
    tempC = Number(tempInput.value);
    tempRead.textContent = `${tempC} °C`;
    paint();
    announce();
  });
  const tempGroup = h('label', { class: 'bl-temp fig-ui' }, [h('span', { text: 'Temperature' }), tempInput, tempRead]);

  const group = (kids) => h('div', { class: 'bl-group' }, kids);
  const sep = () => h('span', { class: 'bl-sep', 'aria-hidden': 'true' });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group(molBtns),
    sep(),
    group([btnNeedle, btnCurl, tempGroup]),
    sep(),
    group([btnRelease, btnStep, btnReset]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(tankPane, sidePane, toolbar, live);
  root.append(wrap);

  // ---- reader actions ----
  function freshTank(nextSeed) {
    seed = nextSeed;
    tank = new Tank(molecule, seed, TANK_W, tankH, wrapped);
    t = ctx.pinnedTime ?? 0;
    punctured = false;
    punctureAt = null;
    puncturePoint = null;
    healSeconds = null;
    lastEvent = null;
    trace = [{ t: 0, edge: tank.measure().edgeLengthNm }];
    molLayer = null;
  }

  function setMolecule(id) {
    if (molecule === id) return;
    molecule = id;
    for (let i = 0; i < MOLECULES.length; i += 1) molBtns[i].setAttribute('aria-pressed', String(MOLECULES[i].id === molecule));
    freshTank(seed);
    setPlaying(false);
    draw();
    announce();
  }

  function setWrapped(next) {
    const edgeAsWas = tank.measure().edgeLengthNm;
    wrapped = next;
    tank.wrapped = wrapped;
    // Taking the wrap away changes the rules the tank is under, so what it held before is no evidence of
    // what it holds now: a flat sheet's last second says "sealed", and the two ends Curl has just opened
    // say otherwise. The verdict starts again from the tank as it stands.
    lastEvent = 'curl';
    tank.rebuild();
    tank.startHistory();
    // The same molecules, measured with the wrap and without it: whatever edge that exposes is the ends
    // the Curl opened. It is exact rather than a guess at whether the sheet reached across — the first
    // version asked whether the biggest cluster had a molecule in every twelfth of the tank, and a sheet
    // just healed from the needle failed that while unwrapping it opened 4.5 nm of edge.
    if (!next) curlOpened = tank.baseline.edge - edgeAsWas > OPENED_NM;
    btnCurl.setAttribute('aria-pressed', String(!wrapped));
    paint();
    announce();
  }

  // Reset means "as it mounted", which is what it means on the other seven figures of this chapter. It
  // used to mean only "empty the tank and unwrap nothing": the molecule and the temperature survived it,
  // so a reader who had dragged the heat to 90 °C, pressed Reset and watched nothing assemble was looking
  // at a tank that was still boiling and said Reset. The promise a control makes has to be the same
  // promise on every figure, or pressing it on the second one is a surprise.
  //
  // This was load-bearing for a gate, which is the only reason it survived: `tools/drive.js`'s
  // `hot-enough-and-nothing-assembles` set the temperature to 90, pressed Reset, and then asserted the
  // temperature was still 90. That step now sets the temperature AFTER the Reset, which proves the same
  // thing — 90 °C disperses the tank — without depending on Reset being narrower here than elsewhere.
  function reset(newSeed) {
    wrapped = true;
    btnCurl.setAttribute('aria-pressed', 'false');
    if (molecule !== OPENING.molecule) {
      molecule = OPENING.molecule;
      for (let i = 0; i < MOLECULES.length; i += 1) molBtns[i].setAttribute('aria-pressed', String(MOLECULES[i].id === molecule));
    }
    tempC = OPENING.tempC;
    tempInput.value = String(tempC);
    tempRead.textContent = `${tempC} °C`;
    freshTank(newSeed ? (seed + 1) % 100000 : seed);
    setPlaying(false);
    draw();
    announce();
  }

  function needle() {
    edgeBefore = tank.measure().edgeLengthNm;
    puncturePoint = sheetPoint();
    tank.puncture(puncturePoint.x, puncturePoint.y);
    edgeAtPuncture = tank.measure().edgeLengthNm;
    punctured = true;
    punctureAt = t;
    healSeconds = null;
    lastEvent = 'needle';
    record();
    paint();
    announce();
  }

  // Where the needle goes in: ON a molecule, deep inside the biggest cluster — the one with the most
  // company within three nanometres. The centre of the cluster is not a safe answer: a sheet that wraps
  // round the tank has its averaged centre out in the water, and the needle went through nothing.
  function sheetPoint() {
    const big = tank.clusters()[0] || [];
    if (!big.length) return { x: tank.w / 2, y: tank.h / 2 };
    let best = big[0];
    let bestCount = -1;
    for (const i of big) {
      const mi = tank.mol[i];
      let count = 0;
      for (const j of big) {
        if (j === i) continue;
        const mj = tank.mol[j];
        const ddx = tank.dx(mi.x, mj.x);
        const ddy = mi.y - mj.y;
        if (ddx * ddx + ddy * ddy < 9) count += 1;
      }
      if (count > bestCount) { bestCount = count; best = i; }
    }
    return { x: tank.mol[best].x, y: tank.mol[best].y };
  }

  function setPlaying(next) {
    playing = next && ctx.pinnedTime === null;
    btnRelease.textContent = playing ? 'Pause' : 'Release';
    btnRelease.setAttribute('aria-label', playing ? 'Pause, stop the molecules where they are' : 'Release, let the molecules go');
    if (playing) tick();
    else paint();
    announce();
  }

  const STEP_SECONDS = 0.5;
  function step() {
    advanceTo(t + STEP_SECONDS);
    paint();
    announce();
  }

  // ---- the clock ----
  //
  // The walk is a function of the clock: sweeps = floor(t * SWEEPS_PER_SECOND). Forward runs the sweeps
  // that are missing; backward replays from the seed, which is why the seed is reported.
  function advanceTo(target, budgetMs = 6000) {
    const next = Math.max(0, Number(target) || 0);
    const want = Math.floor(next * SWEEPS_PER_SECOND);
    if (want < tank.sweeps) {
      tank = new Tank(molecule, seed, TANK_W, tankH, wrapped);
      punctured = false;
      punctureAt = null;
      puncturePoint = null;
      healSeconds = null;
      lastEvent = null;
      trace = [{ t: 0, edge: tank.measure().edgeLengthNm }];
      molLayer = null;
    }
    const kT = kTat(tempC);
    const limit = Math.min(want, tank.sweeps + MAX_SWEEPS_PER_CALL);
    // A budget in milliseconds as well as in sweeps. Without it the walk took whatever the clock asked
    // for, the main thread never came back between frames, and the page stopped answering a click at
    // all — which looks exactly like a figure that has hung.
    const until = performance.now() + budgetMs;
    while (tank.sweeps < limit) {
      stepTank(tank, kT);
      if (performance.now() > until) break;
    }
    // The clock follows the walk and not the other way round: a jump that ran out of sweeps or of
    // milliseconds leaves the clock where the walk actually reached, so `t` and the tank cannot disagree.
    t = tank.sweeps < want ? tank.sweeps / SWEEPS_PER_SECOND : next;
    // The hole is closed when four fifths of the edge it opened has gone. Measured against a fixed
    // margin instead, a sheet whose rim was already a few nanometres long counted as healed on the very
    // next frame, and the figure reported a heal time of 0.02 s for a hole it had not closed.
    if (punctured) {
      const spike = Math.max(0.8, edgeAtPuncture - edgeBefore);
      if (t - punctureAt > 0.25 && tank.measure().edgeLengthNm <= edgeBefore + spike * 0.2) {
        punctured = false;
        healSeconds = round(Math.max(0, t - punctureAt), 2);
      }
    }
    record();
  }

  // The trace of exposed edge against time: a point every twentieth of a second of clock, kept to the
  // last few seconds. A puncture is the spike in it, and the fall is the whole argument about healing.
  function record() {
    const edge = tank.measure().edgeLengthNm;
    const last = trace[trace.length - 1];
    if (!last || t - last.t >= 0.1 || t < last.t) trace.push({ t, edge });
    while (trace.length > 2 && trace[0].t < t - TRACE_S) trace.shift();
  }

  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  function tick() {
    if (raf || destroyed || !playing || !visible) return;
    lastFrame = 0;
    const frame = (now) => {
      raf = 0;
      if (destroyed || !playing || !visible) return;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
      lastFrame = now;
      advanceTo(t + dt, 9);
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); step(); }
    else if (e.key === 'Home') { e.preventDefault(); reset(false); }
    else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); needle(); }
    else if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setWrapped(!wrapped); }
  };
  tankSvg.addEventListener('keydown', onKey);

  // ---- what describe() reports ----
  function state() {
    const m = tank.measure();
    const assembly = heldArrangement(tank);
    return {
      molecule,
      count: tank.mol.length,
      assembly,
      tailsBuried: round(m.tailsBuried, 3),
      edgeLengthNm: round(m.edgeLengthNm, 1),
      thicknessNm: round(thickness(assembly), 2),
      sealed: heldSealed(tank),
      punctured,
      healSeconds,
      temperatureC: tempC,
      seed,
      t: round(t, 3),
      playing,
      layout: narrow ? 'narrow' : 'wide',
    };
  }

  function thickness(assembly) {
    if (assembly !== 'bilayer') return 0;
    const big = tank.clusters()[0] || [];
    if (big.length < 4) return 0;
    return sheetThickness(tank, big);
  }

  function announce() {
    const d = state();
    live.textContent = `${MOLECULE_LABEL[molecule]}, ${d.count} molecules at ${d.temperatureC} °C: ${ARRANGEMENT[d.assembly].word.toLowerCase()}. ${fmt(d.tailsBuried * 100, 0)} per cent of tail surface hidden from water, ${fmt(d.edgeLengthNm, 1)} nm of tail still exposed.${d.punctured ? ' The hole is still open.' : ''}`;
  }

  // ---------------------------------------------------------------- the tank, drawn
  //
  // The molecules are built once, as one group each whose shape depends only on its species, and moved
  // by their transforms every frame. Rebuilding three hundred shapes sixty times a second is what a
  // figure does when it has not thought about it.
  let molLayer = null;
  let molGroups = [];
  let scalePx = 10;
  let tankTop = 0;
  const needleG = el('g');
  const overText = text(0, 0, '', { class: 'bl-over' });

  function moleculeShape(recipe, scale) {
    const g = el('g');
    const stroke = PART[recipe.tailPart];
    const sides = recipe.tails.some((tp) => tp.x < 0) ? [-1, 1] : [0];
    for (const side of sides) {
      const tails = recipe.tails.filter((tp) => (side === 0 ? true : Math.sign(tp.x) === side));
      if (!tails.length) continue;
      // The stroke starts at the head's own centre, which the head disc then covers, so the molecule
      // reads as one piece. Started at a fixed 0.05 it began at the middle of the molecule instead, once
      // the local origin moved there, and every tail was drawn a third short.
      const startY = recipe.head ? recipe.head.y : tails[0].y;
      let d = `M${fmt(tails[0].x * scale, 1)} ${fmt(startY * scale, 1)}`;
      for (const tp of tails) d += `L${fmt(tp.x * scale, 1)} ${fmt(tp.y * scale, 1)}`;
      g.append(el('path', { d, stroke, 'stroke-width': fmt(Math.max(1, 2 * tails[0].r * scale), 1), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }));
    }
    if (recipe.head) g.append(el('circle', { cx: 0, cy: 0, r: fmt(Math.max(0.6, recipe.head.r * scale), 1), fill: PART[recipe.head.part] }));
    return g;
  }

  // Everything in the tank pane that does not change from frame to frame.
  function layoutTank(w, hgt) {
    tankSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    const wantH = clamp(hgt / (w / TANK_W), TANK_W * MIN_RATIO, TANK_W * MAX_RATIO);
    if (Math.abs(wantH - tank.h) > 0.05) {
      tankH = wantH;
      tank.reshape(TANK_W, tankH);
    }
    // The tank fills the pane's width, unless the pane is flatter than MIN_RATIO: then the whole tank is
    // drawn at the scale the pane's height allows rather than cut off at top and bottom, and it keeps the
    // left edge the toolbar keeps, with the paper it does not need between it and the reading.
    const scale = Math.min(w / TANK_W, hgt / tank.h);
    scalePx = scale;
    const drawnW = TANK_W * scale;
    const drawnH = tank.h * scale;
    tankTop = (hgt - drawnH) / 2;
    const visTop = Math.max(0, tankTop);
    const visH = Math.max(1, Math.min(drawnH, hgt - visTop));

    tankSvg.replaceChildren();
    // The water is the tank: a tint from edge to edge of the pane with no rule round it, because the
    // stage is the only rectangle the book draws, and paper beside it only on a pane too flat for it.
    // The one line is the surface at the top.
    tankSvg.append(el('rect', { x: 0, y: fmt(visTop, 1), width: fmt(Math.max(1, drawnW), 1), height: fmt(visH, 1), fill: tint(C.water, 13) }));
    tankSvg.append(el('line', { x1: 0, y1: fmt(visTop, 1), x2: fmt(drawnW, 1), y2: fmt(visTop, 1), stroke: tint(C.water, 46) }));

    // The clip is written in the holder's own coordinates, because a clip-path on a transformed group is
    // read after that group's transform: written in the pane's, it sat one offset too far down whenever
    // the tank did not fill the pane's height, and cut off the part of the tank it was meant to show.
    const clipId = `${ns}-clip`;
    tankSvg.append(el('defs', {}, [el('clipPath', { id: clipId }, [el('rect', { x: 0, y: fmt(visTop - tankTop, 1), width: fmt(Math.max(1, drawnW), 1), height: fmt(visH, 1) })])]));
    molLayer = el('g');
    molGroups = tank.mol.map((m) => {
      const g = moleculeShape(m.recipe, scale);
      molLayer.append(g);
      return g;
    });
    const holder = el('g', { 'clip-path': `url(#${clipId})`, transform: `translate(0 ${fmt(tankTop, 1)})` });
    holder.append(molLayer, needleG);
    tankSvg.append(holder);

    // The scale bar, so the seven nanometres of the prose is measured here rather than asserted.
    const barNm = 5;
    const bx = drawnW - barNm * scale - 10;
    if (bx > 14 && hgt > 74) tankSvg.append(scaleBar(bx, hgt - 9, barNm * scale, '5 nm', { fontSize: narrow ? 9.6 : 10.5 }));

    overText.setAttribute('x', '9');
    overText.setAttribute('y', fmt(visTop + (narrow ? 15 : 17), 1));
    overText.setAttribute('font-size', narrow ? '10.4' : '11.4');
    tankSvg.append(overText);
    tankSvg.append(focusMark(w, hgt));
  }

  // Everything that does change: where the molecules are, the needle, the one line over the water.
  function paintTank() {
    if (!molLayer) return;
    for (let i = 0; i < tank.mol.length; i += 1) {
      const m = tank.mol[i];
      molGroups[i].setAttribute('transform', `translate(${fmt(m.x * scalePx, 1)} ${fmt(m.y * scalePx, 1)}) rotate(${fmt((m.a * 180) / Math.PI, 1)})`);
    }
    needleG.replaceChildren();
    if (punctureAt !== null && puncturePoint) {
      const age = t - punctureAt;
      if (age >= 0 && age <= NEEDLE_SHOW_S) {
        const x = puncturePoint.x * scalePx;
        const y = puncturePoint.y * scalePx;
        const len = Math.max(18, tank.h * scalePx * 0.45);
        needleG.append(el('path', {
          d: `M${fmt(x, 1)} ${fmt(y - len, 1)} L${fmt(x, 1)} ${fmt(y, 1)}`,
          class: 'bl-needle', 'stroke-width': fmt(Math.max(1.2, 0.09 * scalePx), 1), opacity: (1 - age / NEEDLE_SHOW_S).toFixed(2),
        }));
      }
    }
    overText.textContent = overlayNote() || '';
  }

  // What the wrap coming off has done, said about the tank as it is now. It said "two open ends" for as
  // long as the wrap was off, so a sheet that had rolled both ends in and capped them was still described
  // as open beside a reading that said it had closed; and it said "the sheet" of a tank that had none.
  function curlNote() {
    const assembly = heldArrangement(tank);
    if (assembly !== 'bilayer' && assembly !== 'vesicle') return 'the wrap is off';
    if (!curlOpened) return narrow ? 'the wrap is off: no ends opened' : 'the wrap is off, and no ends opened: the sheet did not reach across';
    if (heldSealed(tank)) return narrow ? 'the wrap is off: ends sealed' : 'the wrap is off, and the sheet has sealed both ends';
    return narrow ? 'the wrap is off: two open ends' : 'the wrap is off: the sheet has two open ends';
  }

  function overlayNote() {
    if (punctured) return narrow ? 'a hole, and only the walk to close it' : 'a hole, and nothing is closing it but the walk';
    if (!wrapped) return curlNote();
    if (!playing && tank.sweeps === 0) return narrow ? 'nothing has been let go yet' : 'dispersed, and nothing has been let go yet';
    return null;
  }

  // ---------------------------------------------------------------- the reading

  function sideRows(d, w) {
    if (narrow) {
      return [
        ['Arrangement', ARRANGEMENT[d.assembly].word, { accent: INK.water }],
        ['Tails hidden', `${fmt(d.tailsBuried * 100, 0)}%`],
        ['Exposed tail', `${fmt(d.edgeLengthNm, 1)} nm`],
      ];
    }
    return [
      ['Arrangement', ARRANGEMENT[d.assembly].word, { accent: INK.water }],
      ['Tails hidden from water', `${fmt(d.tailsBuried * 100, 0)}%`],
      ['Exposed tail edge', `${fmt(d.edgeLengthNm, 1)} nm`],
      ['Sheet thickness', d.thicknessNm ? `${fmt(d.thicknessNm, 1)} nm` : '—'],
      ['of which oily core', d.thicknessNm ? `${fmt(Math.max(0, d.thicknessNm - 4 * HEAD_R), 1)} nm` : '—'],
      { head: 'The tank' },
      ['Molecules', String(d.count)],
      ['Temperature', `${d.temperatureC} °C`],
      ['Clock', `${fmt(d.t, 1)} s`],
      ...noteRows(sentence(d), w, 9.8),
    ];
  }

  const MAX_ROW = 30;

  function drawSide(w, hgt) {
    sideSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    sideSvg.replaceChildren();
    const d = state();
    const rows = sideRows(d, w);
    const opts = { width: w, size: narrow ? 10.4 : 10.8, title: narrow ? null : 'What the rule has done' };
    // The trace takes about a third of the column and the table fills the rest exactly. Sized the other
    // way round — a share each — the table stopped at its largest row and the column ended in a hole.
    const traceH = narrow ? 0 : clamp(hgt * 0.34, 78, 190);
    const tableH = Math.max(40, hgt - traceH - (traceH > 0 ? 14 : 0));
    const { rowH } = fitRows(rows, tableH, opts, 14, MAX_ROW);
    const end = readoutTable(sideSvg, rows, { ...opts, rowH, x: 0, y: 0 });
    if (traceH > 44) drawTrace(w, end + 12, hgt - (end + 12));
  }

  // A sentence about the state the tank is in, assembled so that it is grammatical in every one of
  // them. It says what has happened, not what the reader should expect. A heal time is spoken only while
  // the needle is the last thing the reader did: once the sheet has been curled the reading is about what
  // Curl did, and "the last hole closed in 0.9 s" beside a sheet rolling its ends up answered a question
  // nobody had just asked. "No tail left in the water" was dropped for the same honesty: a capped sheet
  // still shows the one-molecule rim any closed sheet shows, and the readout beside it says so.
  function sentence(d) {
    const sheet = d.assembly === 'bilayer' || d.assembly === 'vesicle';
    if (d.punctured) return 'The hole is open, and the edge below is what is closing it.';
    if (lastEvent === 'needle' && d.healSeconds !== null && d.assembly !== 'dispersed') return `The last hole closed in ${fmt(d.healSeconds, 2)} s.`;
    if (!wrapped && sheet && !curlOpened) return 'The wrap is off, but the sheet did not reach across the tank, so taking the wrap away opened no ends.';
    if (!wrapped && d.assembly === 'vesicle') return 'With the wrap gone the sheet rolled up into a ring, and the edge went with it.';
    if (!wrapped && sheet && d.sealed) return `With the wrap gone the sheet rolled both ends in and capped them. A ring with water inside needs about ninety molecules at this thickness; these ${d.count} close by capping.`;
    if (!wrapped && sheet) return 'The wrap is off: the two open ends are what the sheet is working on.';
    if (d.assembly === 'dispersed' && tank.sweeps === 0) return 'Nothing has been released yet. Press Release.';
    // The one place the tank has to say which of two numbers it is quoting. Section 4.1's 7 nm is a
    // plasma membrane, half of whose mass is protein; this is bare lipid, and its core is what the same
    // paragraph puts at three or four nanometres.
    if (d.assembly === 'bilayer' && d.thicknessNm) return `Tails inward, heads on both faces. ${fmt(d.thicknessNm, 1)} nm of bare lipid; a plasma membrane, with its proteins, measures about 7.`;
    const line = ARRANGEMENT[d.assembly].line;
    return `${line.charAt(0).toUpperCase()}${line.slice(1)}.`;
  }

  // Exposed tail edge against the last few seconds. No axes and no box: a hairline for the floor, the
  // curve, and one figure at the right where the curve ends. A puncture is the spike.
  function drawTrace(w, y, hgt) {
    const g = el('g');
    const padT = 15;
    const padB = 14;
    const ph = Math.max(12, hgt - padT - padB);
    let hi = 8;
    for (const p of trace) hi = Math.max(hi, p.edge);
    hi *= 1.12;
    const t0 = Math.max(0, t - TRACE_S);
    const span = Math.max(1e-3, t - t0);
    const X = (tt) => clamp(((tt - t0) / span) * w, 0, w);
    const Y = (e) => y + padT + ph - clamp(e / hi, 0, 1) * ph;
    g.append(text(0, y + 9, 'Exposed tail edge, last 6 s', { class: 'mol-rt-title', 'font-size': 9.2 }));
    g.append(el('line', { x1: 0, y1: fmt(y + padT + ph, 1), x2: fmt(w, 1), y2: fmt(y + padT + ph, 1), stroke: C.ruleStrong }));
    let d = '';
    for (const p of trace) {
      if (p.t < t0) continue;
      d += `${d ? 'L' : 'M'}${fmt(X(p.t), 1)} ${fmt(Y(p.edge), 1)}`;
    }
    if (d && trace.length >= 2) g.append(el('path', { d, fill: 'none', stroke: C.coral, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    else g.append(text(0, y + padT + ph - 5, 'nothing has run yet', { fill: C.faint, 'font-size': 9.4 }));
    g.append(text(w, y + padT + ph + 11, `${fmt(tank.measure().edgeLengthNm, 1)} nm now`, { anchor: 'end', fill: C.faint, 'font-size': 9.4 }));
    sideSvg.append(g);
  }

  // ---------------------------------------------------------------- layout

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }

  // A full rebuild: both panes from scratch. Used on resize and whenever the tank is replaced.
  function draw() {
    if (destroyed) return;
    const [tw, th] = paneBox(tankPane);
    layoutTank(tw, th);
    paintTank();
    const [sw, sh] = paneBox(sidePane);
    drawSide(sw, sh);
  }

  // A frame: the molecules move, the reading is reset. The tank's scaffolding is left alone.
  function paint() {
    if (destroyed) return;
    if (!molLayer) { draw(); return; }
    paintTank();
    const [sw, sh] = paneBox(sidePane);
    drawSide(sw, sh);
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < NARROW_W || hgt < NARROW_H;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    // The narrow reading is content-sized, so the tank takes the whole of the rest of the stage rather
    // than a fixed share of it with a hole under the table.
    if (narrow) {
      const rows = sideRows(state(), Math.max(80, Math.round(sidePane.getBoundingClientRect().width)));
      const want = Math.ceil(readoutHeight(rows, { size: 10.4, rowH: 22 })) + 4;
      if (want !== sideH) {
        sideH = want;
        wrap.style.setProperty('--bl-side-h', `${want}px`);
      }
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 18;
    if (pad > 18 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--bl-pad', `${pad}px`);
    }
    return true;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    draw();
    if (!ready) {
      ready = true;
      announce();
      ctx.onReady();
    }
  }

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) draw(); });
  onResize();

  return {
    destroy() {
      destroyed = true;
      playing = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      tankSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(next) {
      if (destroyed) return;
      advanceTo(next);
      paint();
    },
    setVisible(v) {
      visible = v !== false;
      if (visible && playing) tick();
    },
    setTheme() {
      if (!destroyed && ready) draw();
    },
    // molecule       which of the five is in the tank
    // count          molecules in it
    // assembly       dispersed | micelle | bilayer | vesicle | droplet, classified from the geometry
    //                every 0.05 s of clock, and reported as the one the most of the last second's twenty
    //                samples agree on (see SAMPLE_SWEEPS), so a one-sweep spike is not a verdict.
    //                'vesicle' means a closed ring with water inside, and a tank of this size does not
    //                reach one: thirty-four molecules close their rims by capping. See the header.
    // tailsBuried    0-1, the fraction of tail surface a water probe cannot reach
    // edgeLengthNm   the exposed tail perimeter, nm; about 0 for a sheet with no rim
    // thicknessNm    measured across the sheet, and 0 when there is no sheet
    // sealed         no open end: the exposed tail edge, averaged over the same second, is under
    //                HELD_SEALED_NM, less than two rim molecules show. The lone thermal rim molecule any
    //                closed sheet shows is not an open end.
    // punctured      true from the needle until the hole closes
    // healSeconds    how long the last puncture took to close, null until one is made
    // temperatureC   the slider
    // seed           so a run can be repeated
    // t              clock, seconds
    // playing        whether the walk is running
    // layout         wide | narrow
    describe() {
      return state();
    },
  };
}

// The model, for test/bilayer-model.test.js, which runs it in Node over windows of clock no browser gate
// can afford. Nothing in the book reads this; the figure is still `meta` and `mount`.
export const model = { Tank, stepTank, heldArrangement, heldSealed, kTat, TANK_W, MIN_RATIO, MAX_RATIO, SWEEPS_PER_SECOND };
