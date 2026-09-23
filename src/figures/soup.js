// What a drop is made of: a window into liquid water with everything at the same scale.
//
// The field is a slab about 0.35 nm thick seen face on, 12 nm across on a wide stage and 7 nm on a
// narrow one. It holds water on a jittered triangular lattice at about 11.5 molecules per square
// nanometre (which is the real 33.4 per cubic nanometre of liquid water through a 0.35 nm slab), two
// sodium and two chloride ions each wearing a hydration shell, one ring of glucose, and one small
// protein drawn as the atoms on the face towards the reader. Short dashed links mark the hydrogen
// bonds, which appear and vanish as the molecules move.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — 12 nm across, both ion pairs, the glucose and the protein;
//   narrow — 7 nm across, one ion pair and the glucose, so the molecules and the type keep their size
//            instead of the desktop drawing being shrunk (the brief's instruction); the protein too,
//            but only when the field is tall enough to hold a 2.6 nm globe with water round it, which
//            the registered narrowAspect decides (see buildWorld).
//
// Every frame is a pure function of the clock and the reader's actions. Positions are a home site plus
// a bounded sum of sines, orientations are a phase plus a rate, and whether a given hydrogen bond
// exists at time t is a square wave with a per-pair phase and period, so setTime(t) draws the same
// frame on every machine. The only randomness is one seeded PRNG used at mount to lay the field out.
//
// The clock runs at 8 picoseconds per second of screen time, a slowing of about 1.2e11, and the bond
// flicker runs on that same clock: a bond's on-time is the mean lifetime the readout reports, so what
// the reader watches flicker is what the number says.
//
// Two conventions worth knowing before reading the numbers:
//   - In the ice state the drawing is the hexagonal net seen face on, so three of each molecule's four
//     hydrogen bonds lie in the plane and the fourth goes to the layer behind. The fourth is counted
//     and the readout says so; drawing six hundred stubs pointing out of the page was only noise.
//   - bondsPerWater is the mean over interior molecules only — those more than 0.6 nm from every edge
//     of the field and from every solute — because a molecule at the edge has half a neighbourhood and
//     would drag the mean below the number the chapter states.
import { alpha, mix } from '../palette.js';
import {
  mulberry32, hash2, clamp, clamp01, lerp, ramp, ELEMENTS, WATER, atomAccent,
  bondLifePs, bondDuty, phaseOf, formatTime, formatTempC,
} from './lib/chem-atoms.js';

export const meta = { kind: 'soup', title: 'What a drop is made of', needsWebGL: false, aspect: 21 / 9 };

const SEED = 20260210;
const TAU = Math.PI * 2;
const PS_PER_SECOND = 8; // simulated picoseconds per second of clock
const WIDE_NM = 12;
const NARROW_NM = 7;
// Below this stage width the narrow field is used. Measured: the 12 nm field on a 390 px stage puts an
// oxygen at 4.9 device pixels across and the ion labels touch; the 7 nm field keeps the oxygen at 8.5 px.
const NARROW_W = 640;
// 0.335 nm between centres is 10.3 molecules per square nanometre, which is the real 33.4 per cubic
// nanometre of liquid water through a slab 0.31 nm thick — one molecule deep. Drawn at their true van
// der Waals sizes they cover about three quarters of the field, so the slab is rendered as a slice:
// each molecule sits at a seeded depth and the ones away from the plane of focus are smaller and paler,
// which is both what a slice of a liquid looks like and what lets the hydrogen bonds show through.
const SPACING_NM = 0.335;
const CUTOFF_NM = 0.40; // O...O within which a hydrogen bond can exist, in this projection
// The in-plane spacing of the hexagonal net. Not ice's true 0.276 nm O...O, because the drawing is a
// projection of a three-dimensional lattice onto the same 0.31 nm slab the liquid is drawn in: ice is
// 30.7 molecules per cubic nanometre against the liquid's 33.4, so the slab holds 9.5 per square
// nanometre, which a honeycomb reaches at 0.285 nm. The eight per cent fewer molecules is why the net
// pushes past the edges of the window as it freezes.
const ICE_OO_NM = 0.285;
const MAX_BONDS = 4;
const INTERIOR_NM = 0.6; // margin excluded from the bondsPerWater mean
const ROT_FRAMES = 24; // rotation buckets in the water sprite sheet
const DEPTH_BUCKETS = 5; // depth buckets in the sprite sheet: rows of it, one scale each
const DEPTH_MIN = 0.58; // the scale of a molecule at the far face of the slab
// Every atom is drawn at this fraction of its van der Waals radius — the same fraction for all of them,
// so the relative sizes are exact — and every distance is true. At full size the molecules of a liquid
// touch, which is the truth but leaves no gap for a hydrogen bond to be drawn in, and the link the
// figure exists to show cannot be seen at all.
const ATOM_K = 0.62;

// The cell's composition, which is what the readout reports. A cell is about 70 per cent water by mass
// (the chapter's margin note), and because water is so small that works out at about 99 molecules in
// every 100. These are not this slice's numbers and the readout says so.
const WATER_BY_COUNT = 0.99;
const WATER_BY_MASS = 0.70;

const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

const NAMES = {
  water: { name: 'Water', formula: 'H₂O', widthNm: 0.28, note: 'Bent at 104.5°, negative at the oxygen and positive at each hydrogen. Nearly everything else here is dissolved in it.' },
  sodium: { name: 'Sodium ion', formula: 'Na⁺', widthNm: 0.20, note: 'Sodium with its one outer electron given away. Smaller than a water molecule, and it travels wrapped in about six of them.' },
  chloride: { name: 'Chloride ion', formula: 'Cl⁻', widthNm: 0.36, note: 'Chlorine with one electron taken. Water turns its hydrogens towards it, which is why salt dissolves.' },
  glucose: { name: 'Glucose', formula: 'C₆H₁₂O₆', widthNm: 0.86, note: 'A six-carbon ring wearing five hydroxyl groups, every one of them able to hydrogen-bond with water.' },
  protein: { name: 'A small protein', formula: '≈ 70 amino acids', widthNm: 2.6, note: 'One folded chain, drawn as the atoms on the face towards you. A cell holds on the order of ten thousand water molecules for each of these.' },
};

// ---------- the field ----------

// Honeycomb sites of bond length a covering a rectangle: each site has three neighbours at a, which is
// the hexagonal net of ice seen face on.
function honeycomb(a, x0, y0, x1, y1) {
  const ax = 1.5 * a;
  const ay = (Math.sqrt(3) / 2) * a;
  const out = [];
  const iMax = Math.ceil((x1 - x0) / ax) + 2;
  const jMax = Math.ceil((y1 - y0) / (2 * ay)) + 2;
  for (let i = -2; i <= iMax; i += 1) {
    const bx = x0 + i * ax;
    for (let j = -1; j <= jMax; j += 1) {
      const by = y0 + (i % 2 === 0 ? 0 : ay) + j * 2 * ay;
      out.push([bx, by], [bx + a, by]);
    }
  }
  return out;
}

function buildWorld(Wn, Hn, wide) {
  const rand = mulberry32(SEED);
  const range = (a, b) => a + (b - a) * rand();

  const solutes = [];
  const fx = (u) => u * Wn;
  const fy = (v) => v * Hn;
  if (wide) {
    // Low enough in the field to clear the key in the top right corner, and far enough right that the
    // open water runs the whole length of the picture in front of it.
    solutes.push({ kind: 'protein', id: 'protein', x: fx(0.762), y: fy(0.655), r: 1.28, spin: 0.052, phase: range(0, TAU) });
    solutes.push({ kind: 'glucose', id: 'glucose', x: fx(0.204), y: fy(0.245), r: 0.43, spin: -0.16, phase: range(0, TAU) });
    solutes.push({ kind: 'ion', id: 'na-0', el: 'Na', x: fx(0.112), y: fy(0.75), r: 0.102 });
    solutes.push({ kind: 'ion', id: 'cl-0', el: 'Cl', x: fx(0.379), y: fy(0.808), r: 0.181 });
    solutes.push({ kind: 'ion', id: 'na-1', el: 'Na', x: fx(0.517), y: fy(0.225), r: 0.102 });
    solutes.push({ kind: 'ion', id: 'cl-1', el: 'Cl', x: fx(0.262), y: fy(0.53), r: 0.181 });
  } else {
    // The phone's window. The toolbar floats over the foot of a narrow stage — two rows of it, across
    // the left three quarters — so every solute sits in the band above it: the chloride was at 0.74 of
    // the height and lay under the H-bonds button. The protein is 2.6 nm across and needs water round
    // it, so it is drawn only when the field is tall enough: at 7 nm wide that is a stage taller than
    // it is wide (narrowAspect 4/5 gives 7.1 nm; the 4/3 it was registered at gives 3.6, of which the
    // toolbar leaves under two visible). Where it cannot fit it is not drawn, and the readout's count
    // says so.
    const tall = Hn >= 5.6;
    solutes.push({ kind: 'glucose', id: 'glucose', x: fx(0.27), y: fy(tall ? 0.20 : 0.24), r: 0.43, spin: -0.16, phase: range(0, TAU) });
    solutes.push({ kind: 'ion', id: 'na-0', el: 'Na', x: fx(0.60), y: fy(0.20), r: 0.102 });
    solutes.push({ kind: 'ion', id: 'cl-0', el: 'Cl', x: fx(0.88), y: fy(0.40), r: 0.181 });
    // High enough that its foot clears the toolbar's first row, and far enough from the chloride that
    // the ion keeps its shell of six.
    if (tall) solutes.push({ kind: 'protein', id: 'protein', x: fx(0.60), y: fy(0.55), r: 1.28, spin: 0.052, phase: range(0, TAU) });
  }

  // A protein is a globe of atoms and only the face towards the reader is drawn, so the points are
  // spread over a sphere and the far ones are dropped each frame as it turns. The mixture is a real
  // one: half a protein's heavy atoms are carbon, most of the rest oxygen and nitrogen, a little sulfur.
  for (const s of solutes) {
    if (s.kind !== 'protein') continue;
    // Enough points that the face towards the reader is a *surface* at the size the atoms are drawn.
    // The front half of a 1.28 nm globe is 10.3 nm² and a drawn atom covers about 0.035 nm², so 620
    // points only just met: the gaps between them showed the water through and the protein read as a
    // heap of beans. At 1150 they overlap, and the same points become a skin.
    const n = 1150;
    const golden = Math.PI * (3 - Math.sqrt(5));
    s.atoms = [];
    for (let k = 0; k < n; k += 1) {
      const y = 1 - (2 * (k + 0.5)) / n;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const ang = golden * k + range(-0.16, 0.16);
      const u = rand();
      const el = u < 0.56 ? 'C' : u < 0.76 ? 'O' : u < 0.955 ? 'N' : 'S';
      // A folded chain is not a ball: the surface is pushed in and out so the outline has real
      // bumps and pockets, and a little jitter keeps the points off the Fibonacci spiral's grid.
      const dir = [Math.cos(ang) * rr, y, Math.sin(ang) * rr];
      const lump = 1
        + 0.10 * Math.sin(2.7 * dir[0] + 1.1) * Math.cos(2.2 * dir[1])
        + 0.07 * Math.sin(3.4 * dir[2] - 0.6)
        + range(-0.035, 0.035);
      s.atoms.push({ p: dir.map((v) => v * lump), el, wob: range(0.9, 1.06) });
    }
  }

  // Water on a jittered triangular lattice, skipping anything a solute already occupies.
  const a = SPACING_NM;
  const dy = a * (Math.sqrt(3) / 2);
  const waters = [];
  const rows = Math.ceil(Hn / dy);
  const cols = Math.ceil(Wn / a);
  for (let j = 0; j <= rows; j += 1) {
    for (let i = 0; i <= cols; i += 1) {
      const x = i * a + (j % 2 ? a / 2 : 0) + range(-0.055, 0.055);
      const y = j * dy + range(-0.055, 0.055);
      if (x < -0.08 || x > Wn + 0.08 || y < -0.08 || y > Hn + 0.08) continue;
      let blocked = false;
      let shellOf = -1;
      for (let k = 0; k < solutes.length; k += 1) {
        const s = solutes[k];
        const d = Math.hypot(x - s.x, y - s.y);
        if (d < s.r + 0.17) { blocked = true; break; }
        if (s.kind === 'ion' && d < s.r + 0.52) shellOf = k;
      }
      if (blocked) continue;
      // Depth inside the slab: 0 is the plane of focus, 1 either face. A molecule in a hydration shell
      // is kept near the front, because its orientation is the thing worth seeing.
      const z = shellOf >= 0 ? range(0, 0.35) : Math.abs(range(-1, 1));
      waters.push({
        hx: x,
        hy: y,
        shellOf,
        z,
        bucket: Math.round((1 - z) * (DEPTH_BUCKETS - 1)),
        depth: DEPTH_MIN + (1 - DEPTH_MIN) * (1 - z),
        rot: range(0, TAU),
        spin: range(-1.1, 1.1),
        f: [range(1.3, 3.4), range(0, TAU), range(1.7, 4.1), range(0, TAU), range(1.2, 3.1), range(0, TAU),
          range(1.9, 4.4), range(0, TAU), range(0.16, 0.34), range(0, TAU), range(0.14, 0.31), range(0, TAU)],
        rank: rand(),
        ix: x,
        iy: y,
        inIce: false,
      });
    }
  }

  // A hydration shell is about six water molecules, so each ion keeps the six nearest and the rest go
  // back to being ordinary water. Any more and the ion vanishes under its own leader lines.
  solutes.forEach((s, k) => {
    if (s.kind !== 'ion') return;
    const mine = [];
    waters.forEach((w, i) => { if (w.shellOf === k) mine.push([Math.hypot(w.hx - s.x, w.hy - s.y), i]); });
    mine.sort((a, b) => a[0] - b[0]);
    for (let n = 6; n < mine.length; n += 1) waters[mine[n][1]].shellOf = -1;
  });

  // The ice arrangement: the honeycomb sites nearest the centre of the field, one per molecule. The net
  // at its real 0.276 nm spacing is more open than the liquid, so the outermost molecules land outside
  // the field and fade as it freezes — which is the whole point of the cold end of the slider.
  const grow = 1.10;
  const cx = Wn / 2;
  const cy = Hn / 2;
  const halfW = (Wn / 2) * grow;
  const halfH = (Hn / 2) * grow;
  const sites = honeycomb(ICE_OO_NM, cx - halfW, cy - halfH, cx + halfW, cy + halfH)
    .filter(([x, y]) => {
      if (Math.abs(x - cx) > halfW || Math.abs(y - cy) > halfH) return false;
      for (const s of solutes) if (Math.hypot(x - s.x, y - s.y) < s.r + 0.17) return false;
      return true;
    })
    // Ordered by the rectangle they fill, not by a circle: the field is more than twice as wide as tall.
    .map((p) => [p[0], p[1], Math.max(Math.abs(p[0] - cx) / halfW, Math.abs(p[1] - cy) / halfH)])
    .sort((p, q) => p[2] - q[2])
    .slice(0, waters.length);

  // Give each site the nearest unassigned molecule, taking the molecule's home expanded about the
  // centre, so freezing is a short move for everything rather than a shuffle across the field.
  const cell = 0.6;
  const gw = Math.ceil((2 * halfW) / cell) + 4;
  const gh = Math.ceil((2 * halfH) / cell) + 4;
  const buckets = new Map();
  const bkey = (i, j) => i * 8192 + j;
  const ci = (x) => clamp(Math.floor((x - cx + halfW) / cell) + 2, 0, gw);
  const cj = (y) => clamp(Math.floor((y - cy + halfH) / cell) + 2, 0, gh);
  waters.forEach((w, idx) => {
    w.ex = cx + (w.hx - cx) * grow;
    w.ey = cy + (w.hy - cy) * grow;
    const k = bkey(ci(w.ex), cj(w.ey));
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(idx);
  });
  const taken = new Uint8Array(waters.length);
  for (const [sx, sy] of sites) {
    const i0 = ci(sx);
    const j0 = cj(sy);
    let best = -1;
    let bestD = Infinity;
    for (let r = 0; r <= 14; r += 1) {
      for (let i = i0 - r; i <= i0 + r; i += 1) {
        for (let j = j0 - r; j <= j0 + r; j += 1) {
          if (r > 0 && Math.abs(i - i0) !== r && Math.abs(j - j0) !== r) continue;
          const list = buckets.get(bkey(i, j));
          if (!list) continue;
          for (const idx of list) {
            if (taken[idx]) continue;
            const d = (waters[idx].ex - sx) ** 2 + (waters[idx].ey - sy) ** 2;
            if (d < bestD) { bestD = d; best = idx; }
          }
        }
      }
      // One ring past the first hit, so a site does not take a distant molecule from the ring it found
      // when a nearer one sits just outside it.
      if (best >= 0 && bestD <= ((r + 1) * cell) ** 2) break;
      if (best >= 0 && r >= 2) break;
    }
    if (best < 0) continue;
    taken[best] = 1;
    waters[best].ix = sx;
    waters[best].iy = sy;
    waters[best].inIce = sx > -0.04 && sx < Wn + 0.04 && sy > -0.04 && sy < Hn + 0.04;
  }
  // Anything the search could not place drifts out with the expansion and leaves the picture.
  for (let i = 0; i < waters.length; i += 1) {
    if (taken[i]) continue;
    waters[i].ix = waters[i].ex;
    waters[i].iy = waters[i].ey;
    waters[i].inIce = false;
  }

  const n = waters.length;
  const gx = Math.ceil(Wn / CUTOFF_NM) + 4;
  const gy = Math.ceil(Hn / CUTOFF_NM) + 4;
  // Far molecules first, so the near ones sit over them. The depth never changes, so this order is
  // settled once here rather than sorted every frame.
  const order = waters.map((_, i) => i).sort((a, b) => waters[b].z - waters[a].z);
  return {
    Wn,
    Hn,
    waters,
    solutes,
    wide,
    drawOrder: order,
    // Every per-frame array is allocated once here: seven hundred molecules at sixty frames a second is
    // no place to be handing the collector fresh arrays.
    buf: {
      px: new Float64Array(n),
      py: new Float64Array(n),
      pa: new Float64Array(n),
      pf: new Float64Array(n),
      deg: new Uint8Array(n),
      cap: new Uint8Array(n),
      cellOf: new Int32Array(n),
      items: new Int32Array(n),
      start: new Int32Array(gx * gy + 1),
      fillAt: new Int32Array(gx * gy),
      gx,
      gy,
      pd: new Float64Array(n * 7),
      pi: new Int32Array(n * 7),
      pj: new Int32Array(n * 7),
      order: new Int32Array(n * 7),
      bonds: new Int32Array(n * 5),
    },
  };
}

// ---------- colours ----------

function buildColours(palette, theme) {
  const dark = theme === 'dark';
  const p = palette;
  const white = dark ? p.paper : '#ffffff';
  const black = dark ? '#000000' : p.ink;
  // Which way the light is, in colour. On dark paper the lit end has to go towards the ink, which is the
  // pale token there; mixing towards the paper, as the rest of this table does to desaturate, would put
  // the highlight in the shadows and turn the protein inside out — which is exactly what it did.
  const toLight = dark ? p.ink : '#ffffff';
  const toDark = dark ? '#000000' : p.ink;
  // The protein is one body, not three hundred sweets. Each element keeps its own hue so the mixture is
  // still read off the picture, but the hue is drained most of the way out and the spread of *value* —
  // lit face to shadowed rim — does the drawing instead. Nine steps, mixed once here: shade[el][0] is
  // the atom in shadow, shade[el][8] the one facing the light.
  const shade = {};
  // The body the atoms sit on, and the value the whole mass sits at: a warm neutral a little away from
  // the water, so the protein reads as the big quiet thing and the liquid keeps the frame.
  // On dark paper the whole body has to come down a long way: the field there is nearly black and the
  // water on it is a deep coral, so a mid grey protein is the brightest thing in the frame and the
  // figure's subject changes. The value is set against the *water*, not against the paper.
  const proteinBase = dark ? mix(p.inkSoft, p.paper, 0.70) : mix(p.inkSoft, p.paper3, 0.55);
  // The element's colour comes from the one table. It was written out here by hand as
  // [['C', p.inkSoft], ['O', p.coral], ['N', p.water], ['S', p.gold]] — a fourth place the element colours
  // lived, after lib/chem-atoms.js, lib/mol-draw.js and bondlab's own token map, and the only one of the
  // four that no check could have caught. Nothing here was illegible: no symbol is written on these 1150
  // spheres. What it was, was a copy that could drift, and on 2026-09-17 it did.
  //
  // `atomAccent` and not `atomColours().fill`, deliberately: the deepened disc value exists to carry a
  // symbol and there is no symbol here, so it would only drain the hue this figure is made of. Measured
  // with tools/figure-diff.js — `atomColours().fill` moved 4.6% of the narrow frame by up to 11 levels
  // and turned the sulfur speckles from gold to brown. This spelling is pixel-identical to the list it
  // replaced, which the same tool confirmed.
  for (const el of PROTEIN_ELS) {
    const token = atomAccent(p, el);
    // How much of the element's own colour survives. Carbon is half the protein, so it stays nearly
    // neutral and the coloured quarter reads as a tint across it rather than as confetti.
    const hue = el === 'C' ? 0.08 : 0.13;
    const base = mix(proteinBase, token, hue);
    const lit = dark ? 0.22 : 0.40;
    const shadow = dark ? -0.22 : -0.32;
    shade[el] = Array.from({ length: 9 }, (_, i) => {
      const k = shadow + (i / 8) * (lit - shadow);
      return k >= 0 ? mix(base, toLight, k) : mix(base, toDark, -k);
    });
  }
  return {
    shade,
    dark,
    proteinLit: mix(proteinBase, toLight, dark ? 0.16 : 0.26),
    proteinBody: proteinBase,
    proteinDeep: mix(proteinBase, toDark, dark ? 0.20 : 0.30),
    // How far each of the protein's thousand atoms is lit above and shaded below its own step. On dark
    // paper a wide spread makes every atom a bead with a catchlight and the mass reads as a lamp.
    proteinSpec: dark ? 1 : 2,
    field: dark ? mix(p.paper, p.water, 0.10) : mix(p.paper, '#ffffff', 0.5),
    fieldEdge: dark ? mix(p.paper, '#000000', 0.26) : mix(p.paper2, p.ink, 0.04),
    // A pale body with a saturated rule: at ten molecules to the square nanometre a solid fill makes
    // one orange sheet, and the reader has to be able to count the molecules. The body is a sphere,
    // not a disc, so it is lit: `oLit` is the highlight up and left of centre, `o` the body, `oDeep`
    // the shaded lower right. Three stops is what turns six hundred rings into six hundred molecules.
    oLit: dark ? mix(p.coral, p.paper3, 0.18) : mix(p.coral, '#ffffff', 0.74),
    o: dark ? mix(p.coral, p.paper, 0.42) : mix(p.coral, '#ffffff', 0.45),
    oDeep: dark ? mix(p.coral, '#000000', 0.34) : mix(p.coral, p.ink, 0.18),
    oEdge: p.coral,
    // Hydrogen is the paper-coloured atom. On dark paper the token itself is nearly the background, so
    // it is lifted towards the ink; on light paper it is pushed the other way. Either way it reads as
    // the pale small one beside the oxygen.
    hLit: dark ? mix(p.paper3, p.ink, 0.16) : '#ffffff',
    h: dark ? mix(p.paper3, p.ink, 0.42) : mix(p.paper3, '#ffffff', 0.25),
    hDeep: dark ? mix(p.paper3, p.ink, 0.62) : mix(p.paper3, p.ink, 0.16),
    hEdge: dark ? mix(p.ruleStrong, p.ink, 0.3) : mix(p.ruleStrong, p.ink, 0.22),
    // The hydrogen bond is the weak one, and it was drawn at the weight of a girder: full ink-soft at
    // nearly two pixels, so nine hundred of them made a scaffold over the liquid. Lightened until it
    // reads as the dotted suggestion it is and the molecules keep the frame.
    bond: dark ? mix(p.inkSoft, p.paper, 0.30) : mix(p.inkSoft, p.paper3, 0.22),
    ionic: p.gold,
    ion: p.leaf,
    ionLit: mix(p.leaf, toLight, dark ? 0.28 : 0.52),
    ionDeep: mix(p.leaf, toDark, dark ? 0.44 : 0.34),
    ionEdge: mix(p.leaf, p.ink, dark ? 0.2 : 0.3),
    ink: p.ink,
    soft: p.inkSoft,
    faint: p.inkFaint,
    paper: p.paper,
    // The sugar's ring: its carbons a warm neutral clearly darker than the water, coral for every
    // oxygen, and the bonds between them a middle weight. It is the one drawn-in-line molecule in the
    // field and has to read as a small made thing among six hundred identical ones — not as the black
    // cage it became when the bonds went to full ink at two pixels, and not as the ghost before that.
    cLit: dark ? mix(p.inkSoft, p.ink, 0.40) : mix(p.inkSoft, '#ffffff', 0.46),
    c: dark ? mix(p.inkSoft, p.paper, 0.22) : p.inkSoft,
    cDeep: dark ? mix(p.inkSoft, p.paper, 0.56) : mix(p.inkSoft, p.ink, 0.36),
    cEdge: dark ? mix(p.inkSoft, p.paper, 0.30) : mix(p.inkSoft, p.ink, 0.40),
    sugarBond: dark ? mix(p.ink, p.paper, 0.40) : mix(p.ink, p.paper3, 0.24),
    proteinEdge: alpha(p.ink, dark ? 0.5 : 0.32),
    // The soft ground a solute stands on: the field, deepened, feathered out to nothing. It lifts the
    // sugar and the ions off the water without drawing a box round any of them.
    ground: alpha(black, dark ? 0.20 : 0.10),
    ring: p.leaf,
  };
}

// One water molecule drawn ROT_FRAMES times round a circle at DEPTH_BUCKETS sizes, into an offscreen
// sheet: columns are rotations, rows are depths. Six hundred molecules a frame is too many to build
// from arcs, so each one is a single drawImage of a tile.
//
// Each atom is a lit sphere, not a disc: one light, up and to the left, fixed in the *frame* rather than
// in the molecule, so a field of six hundred is lit as one scene. The molecule's own rotation lives in
// which tile is drawn, and the highlight sits at the same place in every tile, which is what makes the
// light read as light. A flat fill with a ring around it made the field a sheet of salmon Cheerios.
const LIGHT = [-0.38, -0.42]; // the highlight, in radii from the centre of an atom

function litSphere(g, x, y, r, lit, body, deep, edge, lw) {
  const grad = g.createRadialGradient(
    x + LIGHT[0] * r, y + LIGHT[1] * r, r * 0.04,
    x + LIGHT[0] * r * 0.5, y + LIGHT[1] * r * 0.5, r * 1.42,
  );
  grad.addColorStop(0, lit);
  grad.addColorStop(0.46, body);
  grad.addColorStop(1, deep);
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = grad;
  g.fill();
  if (lw > 0) {
    g.lineWidth = lw;
    g.strokeStyle = edge;
    g.stroke();
  }
}

function buildSprite(scale, dpr, colours) {
  const k = scale * dpr;
  const rO = (WATER.vdwOPm / 1000) * ATOM_K * k;
  const rH = (WATER.vdwHPm / 1000) * ATOM_K * k;
  const d = (WATER.ohPm / 1000) * k;
  const reach = Math.max(rO, d + rH) + 2;
  const tile = Math.ceil(reach * 2) + 2;
  const sheet = document.createElement('canvas');
  sheet.width = tile * ROT_FRAMES;
  sheet.height = tile * DEPTH_BUCKETS;
  const g = sheet.getContext('2d');
  const half = (WATER.angleDeg / 2) * (Math.PI / 180);
  for (let row = 0; row < DEPTH_BUCKETS; row += 1) {
    const f = DEPTH_MIN + ((1 - DEPTH_MIN) * row) / (DEPTH_BUCKETS - 1);
    // The rule thins as the molecule recedes, and goes altogether on the smallest ones: a 1 px outline
    // on a 5 px disc is half the disc, and the far rows came out as rings rather than as molecules.
    const lwO = rO * f > 4.2 ? clamp(rO * f * 0.11, 0.7, 1.6) : 0;
    const lwH = rH * f > 4.6 ? clamp(rH * f * 0.10, 0.6, 1.2) : 0;
    for (let col = 0; col < ROT_FRAMES; col += 1) {
      const ang = (col / ROT_FRAMES) * TAU;
      const cxx = col * tile + tile / 2;
      const cyy = row * tile + tile / 2;
      for (const s of [-1, 1]) {
        const a = ang + s * half;
        litSphere(g, cxx + Math.sin(a) * d * f, cyy - Math.cos(a) * d * f, rH * f,
          colours.hLit, colours.h, colours.hDeep, colours.hEdge, lwH);
      }
      litSphere(g, cxx, cyy, rO * f, colours.oLit, colours.o, colours.oDeep, colours.oEdge, lwO);
    }
  }
  return { sheet, tile, tileNm: tile / k };
}

// The protein's atoms, drawn once into a sheet: four elements across, nine steps of light down. Every
// other atom in this picture is a lit sphere and the protein's were flat discs, which is most of why a
// thousand of them read as a mosaic; a gradient each, five hundred a frame, is not affordable, so they
// are stamped from here instead.
const PROTEIN_ELS = ['C', 'O', 'N', 'S'];
function buildProteinSprite(scale, dpr, colours) {
  const k = scale * dpr;
  const rMax = (ELEMENTS.S.vdw / 1000) * ATOM_K * k * 1.05;
  const tile = Math.ceil(rMax * 2) + 4;
  const sheet = document.createElement('canvas');
  sheet.width = tile * PROTEIN_ELS.length;
  sheet.height = tile * 9;
  const g = sheet.getContext('2d');
  const radii = {};
  for (let col = 0; col < PROTEIN_ELS.length; col += 1) {
    const el = PROTEIN_ELS[col];
    const r = (ELEMENTS[el].vdw / 1000) * ATOM_K * k;
    radii[el] = r;
    for (let row = 0; row < 9; row += 1) {
      const shade = colours.shade[el][row];
      // The body's own colour at this step, with a highlight a step and a half brighter and a shaded
      // side a step and a half darker: one atom lit by the same light the field is.
      const sp = colours.proteinSpec;
      litSphere(g, col * tile + tile / 2, row * tile + tile / 2, r,
        colours.shade[el][Math.min(8, row + sp)], shade, colours.shade[el][Math.max(0, row - sp)], shade, 0);
    }
  }
  return { sheet, tile, tileNm: tile / k, radii, col: Object.fromEntries(PROTEIN_ELS.map((e, i) => [e, i])) };
}

// ---------- the figure ----------

export function mount(root, ctx) {
  let palette = ctx.palette;
  let theme = ctx.theme;
  let colours = buildColours(palette, theme);
  const reduced = Boolean(ctx.reducedMotion);

  // A pinned clock is not advanced by any control. `?t=` pins every figure on the page and the gates take
  // their frames that way, so the line below was only true until something pressed Play — which is what
  // `npm run pinned` presses. Written as a function rather than read once because the frame may pin a
  // figure that mounted unpinned. `undefined` counts as unpinned as well as `null`: a ctx that omits the
  // field must leave the water playable for a reader.
  const pinned = () => ctx.pinnedTime !== null && ctx.pinnedTime !== undefined;
  let t = ctx.pinnedTime ?? 0;
  let playing = !reduced && ctx.pinnedTime === null;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  let lastFrameMs = 0;

  let tempC = 25;
  let showBonds = true;
  let countMode = 'count';
  let selected = null;
  let narrow = null;
  let world = null;
  let sprite = null;
  let protein = null;
  let bondCount = 0;
  let bondsDrawn = 0;
  let interiorMean = 0;
  let centreWater = -1;

  // ----- DOM -----
  const style = document.createElement('style');
  style.textContent = `
    .tb-soup { position: absolute; inset: 0; font-family: var(--font-ui); }
    .tb-soup canvas { display: block; width: 100%; height: 100%; outline: none; }
    .tb-soup canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
    /* The key, set as a marginal note rather than as a panel: a hairline spine, the type hung off it,
       flush left so the rag falls on the outside edge of the picture. The panel it replaced was a
       rounded box with a blurred backdrop — furniture borrowed from an interface — and its ragged-left
       setting broke phrases across lines. The ground the type needs is painted on the canvas instead,
       as a soft wash that has no edge (drawScrim). */
    .tb-soup .sp-read { position: absolute; top: var(--space-4); right: var(--space-4);
      width: min(19rem, 44%); padding-left: 0.6rem; border-left: 1px solid var(--rule-strong); }
    /* One step below --text-xs on the same 1.2 ratio the scale is built from: 0.75 / 1.2 = 0.625rem.
       The eyebrow is a label, not text to read, and at --text-xs letterspaced it out-shouted the
       number underneath it. */
    .tb-soup .sp-read i { display: block; font-style: normal; font-size: 0.625rem; font-weight: 600;
      /* --ink-soft, not --ink-faint: this eyebrow sits over the canvas rather than over the page, and on
         the dark drop it measured 4.25:1 (2026-09-16, npm run legible). It is still a label and still
         quieter than the number under it, which is --ink. */
      letter-spacing: 0.13em; text-transform: uppercase; color: var(--ink-soft); line-height: 1.2; }
    .tb-soup .sp-read b { display: block; font-family: var(--font-display); font-size: var(--text-lg);
      font-weight: 500; color: var(--ink); font-variant-numeric: lining-nums tabular-nums;
      line-height: 1.06; margin-top: 0.1rem; }
    .tb-soup .sp-read span { display: block; font-size: var(--text-xs); color: var(--ink-soft);
      line-height: 1.3; margin-top: 0.1rem; text-wrap: pretty; }
    /* --ink-soft for the same reason the eyebrow above it takes it, and found the same way: this line
       sits over the canvas, and on the dark drop --ink-faint measured 4.31:1 (2026-09-17, npm run
       legible — 11% of its pixels under the bar where the wash thins over a molecule). --ink-soft is
       5.5:1 on that ground. It is still the quietest line in the readout; the ink above it is --ink. */
    .tb-soup .sp-read em { display: block; font-size: var(--text-xs); color: var(--ink-soft); font-style: normal;
      margin-top: 0.5rem; line-height: 1.45; white-space: pre-line;
      font-variant-numeric: lining-nums tabular-nums; }
    .tb-soup .fig-card { max-width: min(17rem, 50%); }
    .tb-soup .fig-card .sp-meta { margin-top: 0.25rem; color: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
    .tb-soup .fig-toolbar { align-items: center; }
    .tb-soup .sp-temp { display: inline-flex; align-items: center; gap: 0.45rem;
      background: color-mix(in srgb, var(--paper) 88%, transparent); border: 1px solid var(--rule);
      border-radius: 999px; padding: 0.2rem 0.7rem 0.2rem 0.6rem; }
    .tb-soup .sp-temp input { width: 8.5rem; accent-color: var(--water); }
    .tb-soup .sp-val { min-width: 5.1rem; font-size: var(--text-xs); color: var(--ink);
      font-variant-numeric: lining-nums tabular-nums; font-weight: 600; }
    .tb-soup.is-narrow .sp-temp input { width: 5rem; }
    .tb-soup.is-narrow .sp-val { min-width: 4.4rem; }
    /* On a phone the picture is barely 340 px wide, and a key floated in a corner of it covers the
       field whatever it is set on. So the plate splits: the key is a band of paper across the top with
       a rule under it, and the water starts below. */
    .tb-soup.is-narrow .sp-read { top: var(--space-2); left: var(--space-3); right: var(--space-3);
      width: auto; padding: 0 0 var(--space-2); border-left: none; border-bottom: 1px solid var(--rule-strong); }
    /* Three lines and no more: the phone's stage is 4:3 and every line the caption takes comes straight
       off the picture. The eyebrow goes, and the headline and its qualifier share a line. */
    .tb-soup.is-narrow .sp-read i { display: none; }
    .tb-soup.is-narrow .sp-read b { display: inline; font-size: var(--text-base); }
    .tb-soup.is-narrow .sp-read span { display: inline; margin-left: 0.3rem; }
    .tb-soup.is-narrow .sp-read em { margin-top: 0.2rem; line-height: 1.35; }
    /* Under the key's band, not over it: the card names a molecule in the picture, and the key is
       what the picture is being read against. On a stage too short to hold a card between the key
       and the controls it stands on the controls instead and reaches up over the key, because a card
       half under the toolbar cannot be read at all and the key is still there when the card goes. */
    .tb-soup.is-narrow .fig-card { max-width: 74%; top: calc(var(--sp-top, 0px) + var(--space-2)); }
    .tb-soup.is-narrow.is-short .fig-card { top: auto; bottom: calc(var(--sp-tb, 3rem) + var(--space-2)); }
    .tb-soup .sp-long { display: inline; }
    .tb-soup .sp-short { display: none; }
    .tb-soup.is-narrow .sp-long { display: none; }
    .tb-soup.is-narrow .sp-short { display: inline; }
    .tb-soup.is-narrow .fig-btn { padding: 0.28rem 0.55rem; }
    .tb-soup.is-narrow .fig-toolbar { gap: 0.3rem; }
  `;
  const wrap = document.createElement('div');
  wrap.className = 'tb-soup';
  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label',
    'A window into liquid water at molecular scale: hundreds of water molecules with a few ions, one glucose and one small protein among them, and hydrogen bonds flickering between the waters. Space pauses or plays, the arrow keys step time, Enter names the molecules in turn, Escape clears the card.');
  const readout = document.createElement('div');
  readout.className = 'sp-read fig-ui';
  const readEyebrow = document.createElement('i');
  readEyebrow.textContent = 'In a cell';
  const readBig = document.createElement('b');
  const readSmall = document.createElement('span');
  const readMeta = document.createElement('em');
  readout.append(readEyebrow, readBig, readSmall, readMeta);
  const card = document.createElement('div');
  card.className = 'fig-card';
  card.hidden = true;
  const toolbar = document.createElement('div');
  toolbar.className = 'fig-toolbar fig-ui';

  const tempBox = document.createElement('label');
  tempBox.className = 'sp-temp';
  const range = document.createElement('input');
  range.type = 'range';
  range.className = 'fig-range';
  range.min = '-20';
  range.max = '120';
  range.step = '1';
  range.value = String(tempC);
  range.setAttribute('aria-label', 'Temperature, from minus 20 to 120 degrees Celsius');
  const tempVal = document.createElement('span');
  tempVal.className = 'sp-val';
  tempBox.append(range, tempVal);
  toolbar.append(tempBox);

  const setLabel = (node, text) => {
    node.querySelector('.sp-long').textContent = text;
    node.querySelector('.sp-short').textContent = text;
    node.setAttribute('aria-label', text);
  };
  const button = (long, short, onClick, pressed = null) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fig-btn';
    const a = document.createElement('span');
    a.className = 'sp-long';
    a.textContent = long;
    const c = document.createElement('span');
    c.className = 'sp-short';
    c.textContent = short ?? long;
    b.append(a, c);
    b.setAttribute('aria-label', long);
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    toolbar.append(b);
    return b;
  };
  const btnPlay = button('Pause', 'Pause', () => setPlaying(!playing));
  const btnBonds = button('Hydrogen bonds', 'H-bonds', () => {
    showBonds = !showBonds;
    btnBonds.setAttribute('aria-pressed', String(showBonds));
    draw();
  }, true);
  const btnMode = button('By count', 'By count', () => {
    countMode = countMode === 'count' ? 'mass' : 'count';
    setLabel(btnMode, countMode === 'count' ? 'By count' : 'By mass');
    draw();
  });

  wrap.append(canvas, readout, card, toolbar);
  root.append(style, wrap);

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('the molecular soup needs a 2D canvas context and this browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // ----- sizing -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let scale = 1; // CSS pixels per nanometre
  let toolbarH = 46;
  // The paper the key is set on, at the top of a narrow stage. Zero on a wide one, where the key floats
  // over the picture instead.
  let topPad = 0;

  function resize() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (!w || !h) return false;
    const nextDpr = Math.min(2, window.devicePixelRatio || 1);
    const wantNarrow = w < NARROW_W;
    const changedNarrow = wantNarrow !== narrow;
    if (changedNarrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
      world = null;
    }
    const wantTop = narrow ? Math.round(readout.offsetHeight) + 10 : 0;
    const changedTop = wantTop !== topPad;
    if (w === cw && h === ch && nextDpr === dpr && !changedNarrow && !changedTop && world) return true;
    cw = w;
    ch = h;
    dpr = nextDpr;
    topPad = wantTop;
    wrap.style.setProperty('--sp-top', `${topPad}px`);
    wrap.style.setProperty('--sp-tb', `${toolbarH}px`);
    // The tallest card is the protein's, about 170 px on a phone.
    wrap.classList.toggle('is-short', narrow && h - topPad - toolbarH < 180);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const windowNm = narrow ? NARROW_NM : WIDE_NM;
    scale = w / windowNm;
    const fieldH = (h - topPad) / scale;
    if (!world || Math.abs(world.Hn - fieldH) / world.Hn > 0.02) {
      world = buildWorld(windowNm, fieldH, !narrow);
      centreWater = -1;
      if (selected && selected !== 'water' && !findById(selected)) { selected = null; showCard(); }
    }
    sprite = buildSprite(scale, dpr, colours);
    protein = buildProteinSprite(scale, dpr, colours);
    return true;
  }

  const findById = (id) => world?.solutes.find((s) => s.id === id) ?? null;

  // ----- one frame of state -----
  // Positions, orientations and the bond network at time t and temperature tempC. Everything below is a
  // function of those two numbers alone.

  function motion() {
    const T = tempC;
    const iceFrac = ramp(T, 2, -2);
    const steam = ramp(T, 100, 118);
    const speed = clamp(0.35 + T / 90, 0.18, 2.2);
    const amp = lerp(0.018, lerp(0.055, 0.115, clamp01(T / 100)), 1 - iceFrac);
    return { iceFrac, steam, speed, amp };
  }

  function stepPositions() {
    const { waters, Wn, Hn, buf } = world;
    const { px, py, pa, pf, deg } = buf;
    const m = motion();
    const cx = Wn / 2;
    const cy = Hn / 2;
    // Above 100 the window keeps its size and the molecules leave it: steam is about sixteen hundred
    // times less dense than the liquid, so all but a few per cent of them go.
    const survive = lerp(1, 0.05, m.steam);
    for (let i = 0; i < waters.length; i += 1) {
      const w = waters[i];
      const f = w.f;
      const s = m.speed;
      const wander = (1 - m.iceFrac) * 0.085;
      let x = lerp(w.hx, w.ix, m.iceFrac)
        + m.amp * (0.62 * Math.sin(f[0] * s * t + f[1]) + 0.38 * Math.sin(f[2] * s * t + f[3]))
        + wander * Math.sin(f[8] * s * t + f[9]);
      let y = lerp(w.hy, w.iy, m.iceFrac)
        + m.amp * (0.62 * Math.sin(f[4] * s * t + f[5]) + 0.38 * Math.sin(f[6] * s * t + f[7]))
        + wander * Math.sin(f[10] * s * t + f[11]);
      let op = w.inIce ? 1 : 1 - m.iceFrac;
      if (m.steam > 0) {
        const flee = m.steam * (0.4 + w.rank) * 0.6;
        x += (x - cx) * flee + Math.sin(f[0] * s * t * 0.5 + f[1]) * m.steam * 0.6;
        y += (y - cy) * flee + Math.sin(f[4] * s * t * 0.5 + f[5]) * m.steam * 0.6;
        if (w.rank > survive) op *= clamp01(1 - (w.rank - survive) * 14);
      }
      px[i] = x;
      py[i] = y;
      pf[i] = op;
      // A molecule in a hydration shell keeps its face to the ion: oxygens in towards a positive one,
      // hydrogens in towards a negative one. That orientation is what dissolving a salt means.
      if (w.shellOf >= 0) {
        const ion = world.solutes[w.shellOf];
        const toIon = Math.atan2(ion.x - x, -(ion.y - y));
        pa[i] = ion.el === 'Na' ? toIon : toIon + Math.PI;
      } else {
        pa[i] = w.rot + w.spin * s * t * (1 - m.iceFrac * 0.85);
      }
      deg[i] = 0;
    }
  }

  // Which pairs could hold a hydrogen bond, and which of those hold one now. Candidates come from a
  // counting-sort grid at CUTOFF_NM, are taken nearest first and capped at four per molecule; whether
  // an accepted pair is bonded at time t is a square wave whose on-time is the mean lifetime the
  // readout reports and whose phase and period vary per pair, so the field flickers rather than
  // blinking in step.
  function stepBonds() {
    const { waters, Wn, Hn, buf } = world;
    const { px, py, pf, deg, cap, cellOf, items, start, fillAt, gx, gy, pd, pi, pj, order, bonds } = buf;
    const n = waters.length;
    const cs = CUTOFF_NM;
    const nCells = gx * gy;
    start.fill(0);
    fillAt.fill(0);
    cap.fill(0);
    for (let i = 0; i < n; i += 1) {
      if (pf[i] < 0.3) { cellOf[i] = -1; continue; }
      const gi = clamp(Math.floor(px[i] / cs) + 2, 0, gx - 1);
      const gj = clamp(Math.floor(py[i] / cs) + 2, 0, gy - 1);
      const c = gj * gx + gi;
      cellOf[i] = c;
      start[c + 1] += 1;
    }
    for (let c = 0; c < nCells; c += 1) start[c + 1] += start[c];
    for (let i = 0; i < n; i += 1) {
      const c = cellOf[i];
      if (c < 0) continue;
      items[start[c] + fillAt[c]] = i;
      fillAt[c] += 1;
    }

    let np = 0;
    const cut2 = cs * cs;
    const maxPairs = pd.length;
    for (let gj = 0; gj < gy; gj += 1) {
      for (let gi = 0; gi < gx; gi += 1) {
        const c = gj * gx + gi;
        const a0 = start[c];
        const a1 = start[c] + fillAt[c];
        if (a0 === a1) continue;
        for (let di = 0; di <= 1; di += 1) {
          for (let dj = di === 0 ? 0 : -1; dj <= 1; dj += 1) {
            const ni = gi + di;
            const nj = gj + dj;
            if (ni < 0 || ni >= gx || nj < 0 || nj >= gy) continue;
            const d = nj * gx + ni;
            const b0 = start[d];
            const b1 = start[d] + fillAt[d];
            const same = d === c;
            for (let ai = a0; ai < a1; ai += 1) {
              const i = items[ai];
              for (let bi = same ? ai + 1 : b0; bi < b1; bi += 1) {
                const j = items[bi];
                const dx = px[i] - px[j];
                const dy2 = py[i] - py[j];
                const d2 = dx * dx + dy2 * dy2;
                if (d2 >= cut2 || np >= maxPairs) continue;
                pd[np] = d2;
                pi[np] = i;
                pj[np] = j;
                order[np] = np;
                np += 1;
              }
            }
          }
        }
      }
    }
    const view = order.subarray(0, np);
    view.sort((a, b) => pd[a] - pd[b]);

    // Pass one: the network of pairs close enough to bond, taken nearest first, four to a molecule.
    // Its mean degree is geometry, not chemistry, and it varies with how the molecules happen to sit.
    let na = 0;
    for (let k = 0; k < np; k += 1) {
      const idx = view[k];
      const i = pi[idx];
      const j = pj[idx];
      if (cap[i] >= MAX_BONDS || cap[j] >= MAX_BONDS) continue;
      cap[i] += 1;
      cap[j] += 1;
      view[na] = idx;
      na += 1;
    }
    const m = motion();
    const ice = m.iceFrac > 0.5;
    const inside = (x, y) => x >= INTERIOR_NM && y >= INTERIOR_NM && x <= Wn - INTERIOR_NM && y <= Hn - INTERIOR_NM;
    let accSum = 0;
    let accN = 0;
    for (let i = 0; i < n; i += 1) {
      if (pf[i] < 0.3 || !inside(px[i], py[i])) continue;
      let near = false;
      for (const s of world.solutes) if (Math.hypot(px[i] - s.x, py[i] - s.y) < s.r + INTERIOR_NM) { near = true; break; }
      if (near) continue;
      accSum += cap[i];
      accN += 1;
    }
    const meanAccepted = accN ? accSum / accN : MAX_BONDS;

    // Pass two: which of those are bonded at this instant. The fraction is set so the mean over
    // interior molecules comes out at the model's value — four in ice, about three and a half at 25 °C
    // — rather than at whatever the two-dimensional packing happens to offer. Each pair's own square
    // wave has an on-time equal to the lifetime the readout reports, with a per-pair phase and period,
    // so the field flickers instead of blinking in step.
    const duty = bondDuty(tempC);
    const target = MAX_BONDS * duty - (ice ? 1 : 0); // in ice the fourth bond leaves the plane
    const effDuty = clamp(target / Math.max(meanAccepted, 0.01), 0, 1);
    const tauOn = clamp(bondLifePs(tempC) / PS_PER_SECOND, 0.05, 6);
    let nb = 0;
    for (let k = 0; k < na; k += 1) {
      const idx = view[k];
      const i = pi[idx];
      const j = pj[idx];
      const id = i * 8191 + j;
      const period = (tauOn / Math.max(effDuty, 0.02)) * (0.6 + 0.8 * hash2(id, 7));
      const on = effDuty >= 1 || (((t / period + hash2(id, 13)) % 1) + 1) % 1 < effDuty;
      if (!on || nb + 2 > bonds.length) continue;
      bonds[nb] = i;
      bonds[nb + 1] = j;
      nb += 2;
      deg[i] += 1;
      deg[j] += 1;
    }
    bondsDrawn = nb;

    let drawn = 0;
    for (let i = 0; i < n; i += 1) if (pf[i] > 0.4) drawn += 1;
    // In the hexagonal net each molecule keeps three partners in this plane and one in the layer behind.
    // The fourth is counted and named in the readout; six hundred stubs out of the page were only noise.
    bondCount = nb / 2 + (ice ? drawn : 0);

    // The mean is over interior molecules only: one at the edge or against a solute has half a
    // neighbourhood and would drag it below the number the chapter states.
    let sum = 0;
    let cnt = 0;
    for (let i = 0; i < n; i += 1) {
      if (pf[i] < 0.3 || !inside(px[i], py[i])) continue;
      let near = false;
      for (const s of world.solutes) if (Math.hypot(px[i] - s.x, py[i] - s.y) < s.r + INTERIOR_NM) { near = true; break; }
      if (near) continue;
      sum += deg[i] + (ice ? 1 : 0);
      cnt += 1;
    }
    interiorMean = cnt ? sum / cnt : 0;
  }

  // ----- drawing -----

  // The field is lit from the same corner the molecules are: an even wash that settles towards the
  // edges. It was a top-to-bottom ramp, which put a hard horizon across a picture that has none and
  // left the top-left corner — where the sugar sits — the palest part of the frame.
  function drawBackground() {
    g.fillStyle = colours.field;
    g.fillRect(-1, -1, world.Wn + 2, world.Hn + 2);
    const cx = world.Wn * 0.38;
    const cy = world.Hn * 0.34;
    const r = Math.hypot(world.Wn, world.Hn) * 0.62;
    const grad = g.createRadialGradient(cx, cy, r * 0.18, cx, cy, r);
    grad.addColorStop(0, alpha(colours.dark ? '#000000' : palette.ink, 0));
    grad.addColorStop(0.62, alpha(colours.dark ? '#000000' : palette.ink, colours.dark ? 0.10 : 0.022));
    grad.addColorStop(1, alpha(colours.dark ? '#000000' : palette.ink, colours.dark ? 0.30 : 0.075));
    g.fillStyle = grad;
    g.fillRect(-1, -1, world.Wn + 2, world.Hn + 2);
  }

  // A soft pool of shade under a solute, feathered to nothing. It lifts the sugar and the ions clear of
  // the water without drawing a box round either of them — the sugar was camouflaged against a field of
  // the same value, and a hard clearing would have read as a hole cut in the liquid.
  function drawGround(x, y, r) {
    const grad = g.createRadialGradient(x, y + r * 0.06, r * 0.2, x, y + r * 0.06, r * 1.9);
    grad.addColorStop(0, colours.ground);
    grad.addColorStop(0.5, alpha(colours.dark ? '#000000' : palette.ink, colours.dark ? 0.08 : 0.04));
    grad.addColorStop(1, alpha(colours.dark ? '#000000' : palette.ink, 0));
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y + r * 0.06, r * 1.9, 0, TAU);
    g.fill();
  }

  // Two short strokes in the gap between the two oxygens, so the link is drawn where it can be seen
  // rather than under the discs. A dash pattern over six hundred segments costs more than it is worth,
  // and two ticks read as a broken line at every size the figure is drawn.
  const O_R = (WATER.vdwOPm / 1000) * ATOM_K;
  function drawBonds() {
    if (!showBonds || !bondsDrawn) return;
    const { px, py, bonds } = world.buf;
    g.lineWidth = Math.max(1.1, scale * 0.017) / scale;
    g.strokeStyle = colours.bond;
    g.lineCap = 'round';
    // Four passes, one stroke each, so the links thin out under the key with the molecules rather than
    // staying at full strength and drawing a net over the type. Bucketing keeps this at four strokes
    // instead of nine hundred.
    const BUCKETS = 4;
    for (let b0 = 0; b0 < BUCKETS; b0 += 1) {
      const lo = b0 / BUCKETS;
      const hi = (b0 + 1) / BUCKETS;
      g.globalAlpha = 0.9 * ((lo + hi) / 2);
      g.beginPath();
      let any = false;
      for (let k = 0; k < bondsDrawn; k += 2) {
        const i = bonds[k];
        const j = bonds[k + 1];
        const ko = Math.min(keepOut(px[i], py[i]), keepOut(px[j], py[j]));
        if (ko < lo || ko >= hi + (b0 === BUCKETS - 1 ? 1 : 0)) continue;
        const x = px[i];
        const y = py[i];
        const dx = px[j] - x;
        const dy = py[j] - y;
        const d = Math.hypot(dx, dy) || 1;
        // The visible gap: from just outside one oxygen to just outside the other, scaled by how big each
        // is drawn at its own depth.
        const a = (O_R * world.waters[i].depth + 0.012) / d;
        const b = 1 - (O_R * world.waters[j].depth + 0.012) / d;
        if (b - a < 0.08) continue;
        const m = (a + b) / 2;
        const g1 = a + (m - a) * 0.05;
        const g2 = m - (m - a) * 0.22;
        const g3 = m + (b - m) * 0.22;
        const g4 = b - (b - m) * 0.05;
        g.moveTo(x + dx * g1, y + dy * g1);
        g.lineTo(x + dx * g2, y + dy * g2);
        g.moveTo(x + dx * g3, y + dy * g3);
        g.lineTo(x + dx * g4, y + dy * g4);
        any = true;
      }
      if (any) g.stroke();
    }
    g.globalAlpha = 1;
    g.lineCap = 'butt';
  }

  function drawIonicLinks() {
    const { px, py, pf } = world.buf;
    g.lineWidth = Math.max(1.1, scale * 0.02) / scale;
    g.strokeStyle = colours.ionic;
    g.setLineDash([1.4 / scale, 2.8 / scale]);
    g.lineCap = 'round';
    g.globalAlpha = 0.95;
    g.beginPath();
    for (let i = 0; i < world.waters.length; i += 1) {
      const w = world.waters[i];
      if (w.shellOf < 0 || pf[i] < 0.3) continue;
      const s = world.solutes[w.shellOf];
      const dx = px[i] - s.x;
      const dy = py[i] - s.y;
      const d = Math.hypot(dx, dy) || 1;
      const a = (s.r * ATOM_K + 0.012) / d;
      const b = 1 - (O_R * w.depth + 0.012) / d;
      if (b <= a) continue;
      g.moveTo(s.x + dx * a, s.y + dy * a);
      g.lineTo(s.x + dx * b, s.y + dy * b);
    }
    g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 1;
    g.lineCap = 'butt';
  }

  function drawWaters() {
    const { tile, tileNm, sheet } = sprite;
    const { px, py, pa, pf } = world.buf;
    const step = TAU / ROT_FRAMES;
    const order = world.drawOrder;
    for (let n = 0; n < order.length; n += 1) {
      const i = order[n];
      const op = pf[i];
      if (op <= 0.06) continue;
      const w = world.waters[i];
      const k = Math.round(((pa[i] % TAU) + TAU) % TAU / step) % ROT_FRAMES;
      g.globalAlpha = op * (0.58 + 0.42 * (1 - w.z)) * keepOut(px[i], py[i]);
      g.drawImage(sheet, k * tile, w.bucket * tile, tile, tile,
        px[i] - tileNm / 2, py[i] - tileNm / 2, tileNm, tileNm);
    }
    g.globalAlpha = 1;
  }

  function drawIon(s) {
    const r = s.r * ATOM_K;
    drawGround(s.x, s.y, r * 1.5);
    litSphere(g, s.x, s.y, r, colours.ionLit, colours.ion, colours.ionDeep,
      colours.ionEdge, Math.max(1, scale * 0.016) / scale);
    const label = s.el === 'Na' ? 'Na⁺' : 'Cl⁻';
    const dPx = r * 2 * scale;
    const size = clamp(dPx * 0.42, 9, 13);
    g.save();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sx = s.x * scale;
    const sy = s.y * scale + topPad;
    g.font = `600 ${size.toFixed(1)}px ${FONT}`;
    g.textAlign = 'center';
    if (dPx >= size * 2.4) {
      g.textBaseline = 'middle';
      g.fillStyle = colours.paper;
      g.fillText(label, sx, sy + 0.5);
    } else {
      g.textBaseline = 'alphabetic';
      haloText(label, sx, sy - r * scale - 5, colours.ionEdge);
    }
    g.restore();
  }

  // Glucose as the ring it is: five carbons and an oxygen closing a six-membered ring, wearing the five
  // hydroxyls that dissolve it. Drawn from atoms rather than as a line diagram, because at 0.86 nm a
  // line diagram in this company reads as a black smudge.
  // Ring C–C is 0.152 nm, so a regular hexagon of that side; the hydroxyl oxygen is 0.143 nm further
  // out and its hydrogen 0.096 nm beyond that, which makes the whole ring about 0.86 nm across.
  const RING_R = 0.152;
  const OH_O = 0.143;
  const OH_H = 0.096;
  function drawGlucose(s) {
    const ang = s.phase + s.spin * t * clamp(0.3 + tempC / 100, 0.1, 1.6);
    const lw = Math.max(1.3, scale * 0.020) / scale;
    const ring = [];
    for (let k = 0; k < 6; k += 1) {
      const a = ang + (k / 6) * TAU;
      ring.push([s.x + Math.cos(a) * RING_R, s.y + Math.sin(a) * RING_R]);
    }
    drawGround(s.x, s.y, s.r * 0.86);
    g.lineWidth = lw;
    g.lineCap = 'round';
    g.strokeStyle = colours.sugarBond;
    g.beginPath();
    for (let k = 0; k < 6; k += 1) {
      g.moveTo(ring[k][0], ring[k][1]);
      g.lineTo(ring[(k + 1) % 6][0], ring[(k + 1) % 6][1]);
      if (k === 0) continue;
      const a = ang + (k / 6) * TAU;
      g.moveTo(ring[k][0], ring[k][1]);
      g.lineTo(s.x + Math.cos(a) * (RING_R + OH_O), s.y + Math.sin(a) * (RING_R + OH_O));
    }
    g.stroke();
    g.lineCap = 'butt';
    // A ring whose carbons are 0.152 nm apart cannot show that it is a ring if each of them is drawn
    // 0.21 nm across, so the sugar's own atoms take a smaller fraction than the rest of the figure.
    // Its distances — the ring, the hydroxyls — are the real ones, so its width is still to scale. It is
    // drawn smaller again than it was, at 0.60 rather than 0.68, because at 0.68 the six discs met and
    // swallowed the bonds between them, and a ring you cannot see the ring of is a blob.
    const k = ATOM_K * 0.60;
    const rC = (ELEMENTS.C.vdw / 1000) * k;
    const rO = (ELEMENTS.O.vdw / 1000) * k;
    const rH = (ELEMENTS.H.vdw / 1000) * k;
    const edge = Math.max(0.7, scale * 0.009) / scale;
    // The five hydroxyls, each an oxygen with its hydrogen beyond it.
    for (let k = 1; k < 6; k += 1) {
      const a = ang + (k / 6) * TAU;
      const ox = s.x + Math.cos(a) * (RING_R + OH_O);
      const oy = s.y + Math.sin(a) * (RING_R + OH_O);
      litSphere(g, ox + Math.cos(a) * OH_H, oy + Math.sin(a) * OH_H, rH,
        colours.hLit, colours.h, colours.hDeep, colours.hEdge, edge * 0.8);
      litSphere(g, ox, oy, rO, colours.oLit, colours.o, colours.oDeep, colours.oEdge, edge);
    }
    // The ring: five carbons and the oxygen that closes it. The carbons are the one place in this field
    // where a neutral is darker than the water, which is how a 0.86 nm sugar holds its own against six
    // hundred molecules of the same warm colour.
    for (let k = 0; k < 6; k += 1) {
      if (k === 0) litSphere(g, ring[0][0], ring[0][1], rO, colours.oLit, colours.o, colours.oDeep, colours.oEdge, edge);
      else litSphere(g, ring[k][0], ring[k][1], rC, colours.cLit, colours.c, colours.cDeep, colours.cEdge, edge);
    }
  }

  // The protein: the atoms on the face towards the reader, turning slowly. Half of them are carbon.
  //
  // It is the biggest thing in the field and it is not the subject — the water is — so it is drawn as
  // one lit body and kept quieter in both colour and contrast than the liquid around it. Three changes
  // do that: every atom is shaded by where it sits against the same light the water is lit by, rather
  // than by depth alone; each element's hue is drained most of the way towards a neutral, so the
  // mixture still reads without the ball turning into confetti; and the outline goes, because three
  // hundred outlined discs are a mosaic and a protein is a surface.
  const LIGHT_DIR = (() => {
    const n = Math.hypot(LIGHT[0], LIGHT[1]);
    const x = LIGHT[0] / n;
    const y = LIGHT[1] / n;
    // The light sits above the plane of the page, so its z is the rest of the unit vector.
    return [x * 0.72, y * 0.72, 0.69];
  })();

  function drawProtein(s) {
    const ang = s.phase + s.spin * t * clamp(0.3 + tempC / 110, 0.12, 1.4);
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const ct = Math.cos(0.42);
    const st = Math.sin(0.42);
    const front = [];
    for (const at of s.atoms) {
      const p = at.p;
      const x1 = p[0] * ca + p[2] * sa;
      const z1 = -p[0] * sa + p[2] * ca;
      const y2 = p[1] * ct - z1 * st;
      const z2 = p[1] * st + z1 * ct;
      if (z2 < -0.3) continue;
      front.push([z2, x1 * at.wob, y2 * at.wob, at.el]);
    }
    front.sort((a, b) => a[0] - b[0]);
    drawGround(s.x, s.y, s.r * 0.92);
    // The body first, as one lit globe, and the atoms over it. Six hundred points on a sphere only just
    // cover its front face, so drawn alone they left gaps the field showed through and the protein read
    // as a heap of beans with a hole in it. With a body underneath, the same gaps become its shading.
    litSphere(g, s.x, s.y, s.r * 0.98, colours.proteinLit, colours.proteinBody, colours.proteinDeep, colours.proteinDeep, 0);
    const { sheet, tile, tileNm, col } = protein;
    for (const [z, ux, uy, el] of front) {
      const x = s.x + ux * s.r;
      const y = s.y + uy * s.r;
      // Where this atom sits on the globe, as a unit normal, and how much of the light it catches.
      const n = Math.hypot(ux, uy, z) || 1;
      const lam = clamp01((ux / n) * LIGHT_DIR[0] + (uy / n) * LIGHT_DIR[1] + (z / n) * LIGHT_DIR[2]);
      // Ambient occlusion at the silhouette: the rim of a globe is where the least light reaches, and
      // it is what tells the eye this is a ball rather than a disc of dots.
      const rim = clamp01(z / 0.55);
      const key = clamp01(0.18 + 0.82 * lam) * (0.34 + 0.66 * rim);
      const row = clamp(Math.round(key * 8), 0, 8);
      // The tile holds the atom at its own van der Waals size; it is stamped a little larger as the
      // atom comes towards the reader, which is the same 0.9 + 0.14 z the flat discs used.
      const w = tileNm * (0.9 + 0.14 * z);
      g.drawImage(sheet, col[el] * tile, row * tile, tile, tile, x - w / 2, y - w / 2, w, w);
    }
  }

  function nearestWaterToCentre() {
    if (centreWater >= 0) return centreWater;
    let best = -1;
    let bestD = Infinity;
    const cx = world.Wn * 0.42;
    // Above the toolbar on a narrow stage, where the ring round the chosen molecule can be seen.
    const cy = world.Hn * (narrow ? 0.36 : 0.64);
    world.waters.forEach((w, i) => {
      const d = (w.hx - cx) ** 2 + (w.hy - cy) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    });
    centreWater = best;
    return best;
  }

  function drawSelection() {
    if (!selected) return;
    let x;
    let y;
    let r;
    if (selected === 'water') {
      const i = nearestWaterToCentre();
      if (i < 0) return;
      x = world.buf.px[i];
      y = world.buf.py[i];
      r = 0.2;
    } else {
      const s = findById(selected);
      if (!s) return;
      x = s.x;
      y = s.y;
      r = s.r + 0.1;
    }
    g.beginPath();
    g.arc(x, y, r + 0.05, 0, TAU);
    g.lineWidth = Math.max(1.8, scale * 0.024) / scale;
    g.strokeStyle = colours.ring;
    g.stroke();
  }

  // The ground the key is set on. Not a panel and not a patch of fog: the liquid itself thins out where
  // the type goes, the way the depth of field already thins it, and only a light wash finishes the job.
  // A wash strong enough to carry type on its own bleached a quarter of the picture, and a bordered box
  // with a blurred backdrop is interface furniture, not a caption.
  let scrim = null;
  function measureScrim() {
    // On a narrow stage the key has its own paper above the picture, so there is nothing to thin out.
    if (narrow) { scrim = null; return; }
    const r = readout.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    if (!r.width || !b.width) { scrim = null; return; }
    const pad = 14;
    scrim = {
      x: r.right - b.left,
      y: r.top - b.top,
      w: r.width + pad,
      h: r.height + pad,
      // The same rectangle in nanometres, for the molecules, with the feather it fades over.
      nx: (r.left - b.left - pad) / scale,
      ny: (r.bottom - b.top + pad) / scale,
      feather: 1.1,
    };
  }

  // 1 out in the open liquid, falling towards 0.16 under the key.
  function keepOut(x, y) {
    if (!scrim) return 1;
    const f = scrim.feather;
    const kx = clamp01((x - scrim.nx + f) / f);
    const ky = clamp01((scrim.ny + f - y) / f);
    const u = kx * ky;
    return 1 - 0.84 * (u * u * (3 - 2 * u));
  }

  // An ellipse the shape of the key itself, not a circle on its diagonal: a circle big enough to cover a
  // wide short block reaches a long way below it, and it washed the protein out.
  function drawScrim() {
    if (!scrim) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rx = scrim.w * 0.66;
    const ry = scrim.h * 0.56;
    const cx = scrim.x - scrim.w * 0.42;
    const cy = scrim.y + scrim.h * 0.40;
    g.save();
    g.translate(cx, cy);
    g.scale(1, ry / rx);
    const grad = g.createRadialGradient(0, 0, rx * 0.30, 0, 0, rx);
    grad.addColorStop(0, alpha(colours.paper, colours.dark ? 0.62 : 0.55));
    grad.addColorStop(0.62, alpha(colours.paper, colours.dark ? 0.36 : 0.30));
    grad.addColorStop(1, alpha(colours.paper, 0));
    g.fillStyle = grad;
    g.fillRect(-rx, -rx, rx * 2, rx * 2);
    g.restore();
  }

  // A bar in nanometres, because every size in this figure is to scale and the reader must be able to
  // check that. It sits at the right-hand end of the row the controls are in, which they never reach:
  // above them, at the left, it read as a broken part of the temperature slider.
  function drawScaleBar() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const barNm = narrow ? 1 : 2;
    const w = barNm * scale;
    const x0 = cw - 16 - w;
    const y0 = ch - 22;
    g.strokeStyle = colours.soft;
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x0 + w, y0);
    g.moveTo(x0, y0 - 3.5);
    g.lineTo(x0, y0 + 3.5);
    g.moveTo(x0 + w, y0 - 3.5);
    g.lineTo(x0 + w, y0 + 3.5);
    g.stroke();
    g.font = `500 10.5px ${FONT}`;
    g.textAlign = 'left';
    g.textBaseline = 'bottom';
    haloText(`${barNm} nm`, x0, y0 - 5, colours.soft);
  }

  // Type set over the liquid, with a soft paper halo rather than a patch of paper behind it: a filled
  // rectangle under two characters reads as a sticker, and at this density unhaloed type is unreadable.
  function haloText(str, x, y, fill) {
    g.lineJoin = 'round';
    g.lineWidth = 3.2;
    g.strokeStyle = alpha(colours.paper, colours.dark ? 0.9 : 0.85);
    g.strokeText(str, x, y);
    g.fillStyle = fill;
    g.fillText(str, x, y);
  }

  function counts() {
    const { pf } = world.buf;
    let water = 0;
    for (let i = 0; i < world.waters.length; i += 1) if (pf[i] > 0.4) water += 1;
    let sodium = 0;
    let chloride = 0;
    let glucose = 0;
    let protein = 0;
    for (const s of world.solutes) {
      if (s.kind === 'ion') { if (s.el === 'Na') sodium += 1; else chloride += 1; }
      else if (s.kind === 'glucose') glucose += 1;
      else protein += 1;
    }
    return { water, sodium, chloride, glucose, protein };
  }

  let shownRead = '';
  function updateReadout() {
    const phase = phaseOf(tempC);
    tempVal.textContent = `${formatTempC(tempC)} · ${phase}`;
    const c = counts();
    const parts = [`${c.water} water`];
    // A count of one is not written on a phone, where the line has to hold the protein too and "1 Na⁺
    // · 1 Cl⁻ · glucose · protein" ran to a fourth line of the key.
    const n = (k) => (k === 1 && narrow ? '' : `${k} `);
    if (c.sodium) parts.push(`${n(c.sodium)}Na⁺`);
    if (c.chloride) parts.push(`${n(c.chloride)}Cl⁻`);
    if (c.glucose) parts.push('glucose');
    if (c.protein) parts.push('protein');
    // Every line is written to fit the measure the key is set to, so none of them wraps. A phrase broken
    // across a line by the box it happened to be in — "one in the layer / behind" — reads as an
    // accident, and a caption in a book is set, not poured.
    const bondLine = !showBonds ? 'hydrogen bonds hidden'
      : phase === 'ice'
        ? (narrow ? `${interiorMean.toFixed(2)} bonds each · 3 here, 1 behind` : `${interiorMean.toFixed(2)} bonds each: three here, one behind`)
        : `${interiorMean.toFixed(2)} bonds each, ${formatTime(bondLifePs(tempC))} apiece`;
    // The narrow stage is 390 px wide and the key has to leave the field visible, so it says the same
    // thing in three lines instead of four.
    const meta = narrow
      ? `${world.Wn.toFixed(0)} nm across · ${parts.join(' · ')}\n${bondLine}`
      : `${world.Wn.toFixed(0)} nm across, and it holds\n${parts.join(' · ')}\n${bondLine}\none second here is ${PS_PER_SECOND} picoseconds`;
    const key = `${countMode}|${meta}`;
    if (key === shownRead) return;
    shownRead = key;
    if (countMode === 'count') {
      readBig.textContent = narrow ? '99 in 100' : '99 in every 100';
      readSmall.textContent = narrow ? 'molecules are water' : 'molecules are water';
    } else {
      readBig.textContent = '70 per cent';
      readSmall.textContent = narrow ? 'of its mass is water' : 'of its mass is water';
    }
    readMeta.textContent = meta;
    measureScrim();
  }

  function draw() {
    if (!cw || !world) return;
    const start = performance.now();
    stepPositions();
    stepBonds();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    // The world sits below the key's band of paper on a narrow stage, and fills the stage on a wide one.
    const world0 = () => g.setTransform(dpr * scale, 0, 0, dpr * scale, 0, topPad * dpr);
    world0();
    g.lineJoin = 'round';
    // On a narrow stage the picture starts at the rule under the key, so the field is clipped to its
    // own rectangle: the background is painted a nanometre past each edge and the lattice starts a
    // little above the top one, and both ran up into the key's band, which came out as two tones of
    // paper with a row of half-molecules across the join. A wide stage has no band, and the canvas
    // edge already clips the same overrun there.
    g.save();
    if (topPad) {
      g.beginPath();
      g.rect(0, 0, world.Wn, world.Hn);
      g.clip();
    }
    drawBackground();
    drawBonds();
    drawIonicLinks();
    drawWaters();
    for (const s of world.solutes) {
      if (s.kind === 'ion') drawIon(s);
      else if (s.kind === 'glucose') drawGlucose(s);
      else drawProtein(s);
    }
    world0();
    drawSelection();
    g.restore();
    if (topPad) {
      // The rule between the caption and the picture. The plate's own edge, drawn once.
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.strokeStyle = colours.fieldEdge;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, topPad + 0.5);
      g.lineTo(cw, topPad + 0.5);
      g.stroke();
    }
    drawScrim();
    drawScaleBar();
    updateReadout();
    lastFrameMs = performance.now() - start;
  }

  // ----- the card -----
  function showCard() {
    const key = !selected ? null
      : selected === 'water' ? 'water'
        : selected.startsWith('na') ? 'sodium'
          : selected.startsWith('cl') ? 'chloride'
            : selected;
    const info = key ? NAMES[key] : null;
    if (!info) { card.hidden = true; return; }
    card.replaceChildren();
    const h5 = document.createElement('h5');
    h5.textContent = `${info.name} · ${info.formula}`;
    const p = document.createElement('p');
    p.textContent = info.note;
    const meta = document.createElement('p');
    meta.className = 'sp-meta';
    meta.textContent = `about ${info.widthNm.toFixed(2)} nm across`;
    card.append(h5, p, meta);
    card.hidden = false;
  }

  function cycleSelection() {
    const order = ['water', ...world.solutes.map((s) => s.id)];
    const at = order.indexOf(selected);
    selected = at + 1 >= order.length ? null : order[at + 1];
    showCard();
    draw();
  }

  function pick(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / scale;
    const y = (clientY - r.top - topPad) / scale;
    for (const s of world.solutes) if (Math.hypot(x - s.x, y - s.y) <= s.r + 0.08) return s.id;
    const { px, py, pf } = world.buf;
    let best = -1;
    let bestD = 0.24;
    for (let i = 0; i < world.waters.length; i += 1) {
      if (pf[i] < 0.4) continue;
      const d = Math.hypot(x - px[i], y - py[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best >= 0) { centreWater = best; return 'water'; }
    return null;
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    canvas.focus({ preventScroll: true });
    selected = pick(e.clientX, e.clientY);
    showCard();
    draw();
  });

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
    // Starting is refused while the clock is pinned, and refused rather than recorded: that is this
    // repo's settled shape (secretion, gradient-battery, bilayer, polymer), and a button reading Pause
    // over water that is not moving is the worse of the two lies. Stopping is never refused, so
    // setTime() still calls in. The Space key comes through here too.
    if (next && pinned()) return;
    playing = next;
    setLabel(btnPlay, playing ? 'Pause' : 'Play');
    if (playing) schedule();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function seek(next) {
    t = Math.max(0, Number(next) || 0);
    draw();
  }

  range.addEventListener('input', () => {
    tempC = Number(range.value);
    draw();
  });

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setPlaying(!playing);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seek(t + (e.shiftKey ? 2 : 0.4));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seek(t - (e.shiftKey ? 2 : 0.4));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      cycleSelection();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      selected = null;
      showCard();
      draw();
    } else if (e.key === 'Home') {
      e.preventDefault();
      seek(0);
    }
  };
  canvas.addEventListener('keydown', onKey);

  const measureToolbar = () => {
    toolbarH = Math.max(34, Math.round(toolbar.getBoundingClientRect().height) + 12);
  };
  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    measureToolbar();
    if (!resize()) return;
    measureScrim();
    draw();
    if (!ready) { ready = true; ctx.onReady(); }
  });
  observer.observe(root);
  observer.observe(toolbar);
  // The key's own height sets how much paper the narrow layout gives it, so a change in it has to
  // rebuild the field: measured once at mount, the band was the height the key had before its face and
  // its numbers arrived.
  observer.observe(readout);
  setPlaying(playing);
  measureToolbar();
  if (resize()) {
    draw();
    ready = true;
    ctx.onReady();
  }
  // The key is set in the display face, so its height changes when that face arrives and the wash under
  // it has to be measured again; measuring only at mount left a halo the wrong size on every load.
  document.fonts?.ready.then(() => { if (!destroyed && cw) { measureScrim(); draw(); } });

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
      seek(seconds);
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setTheme(nextTheme, nextPalette) {
      theme = nextTheme;
      palette = nextPalette;
      colours = buildColours(palette, theme);
      sprite = buildSprite(scale, dpr, colours);
      protein = buildProteinSprite(scale, dpr, colours);
      shownRead = '';
      draw();
    },
    describe() {
      const c = counts();
      return {
        t: Number(t.toFixed(3)),
        playing,
        tempC,
        phase: phaseOf(tempC),
        showBonds,
        // What is there, not what is drawn: hiding the links does not break the bonds, and
        // bondsPerWater would contradict a count that went to zero with the toggle.
        bonds: bondCount,
        bondsPerWater: Number(interiorMean.toFixed(2)),
        meanBondLifePs: Number(bondLifePs(tempC).toPrecision(3)),
        counts: c,
        waterFractionByCount: WATER_BY_COUNT,
        waterFractionByMass: WATER_BY_MASS,
        countMode,
        selected,
        windowNm: Number(world ? world.Wn.toFixed(2) : 0),
        layout: narrow ? 'narrow' : 'wide',
        frameMs: Number(lastFrameMs.toFixed(2)),
      };
    },
  };
}
