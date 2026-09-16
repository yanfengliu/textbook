// Shared chemistry for the chapter-2 molecular figures (soup, bondlab, water3d, waterprops): the element
// table, the one colour per element the chapter's brief fixes, the geometry of a water molecule, the two
// energy models the bond bench and the soup both read from, and a seeded PRNG.
//
// Every number here is a measured value with its source named in the comment beside it, or a stated model
// with its form written out. Nothing is invented: a figure that needs a number it cannot source does not
// draw it.
//
// Colours resolve through `ctx.palette`, never a hex of their own. The table is the brief's:
//   carbon inkSoft · hydrogen paper3 on a ruleStrong outline · oxygen coral · nitrogen water
//   phosphorus violet · sulfur gold · ions leaf, always with the symbol written on them
//   covalent bond solid ink · hydrogen bond dashed inkFaint · ionic attraction dotted gold

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

// A stateless hash in [0, 1) from two integers: the flicker of one hydrogen bond at one instant has to be
// the same on every machine and at every frame rate, so it is a function of (pair, tick) and not a stream.
export function hash2(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x165667b1, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2545f491);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smoothstep = (x) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
// Rising 0 -> 1 as x goes from a to b (a may be greater than b, for a falling edge).
export const ramp = (x, a, b) => smoothstep((x - a) / (b - a));

// ---------- elements ----------
//
// valence   outer-shell electrons
// shell     electrons a full outer shell holds (2 for hydrogen, 8 for the rest here)
// en        Pauling electronegativity (CRC Handbook, 97th ed.)
// covalent  single-bond covalent radius, pm (Cordero et al. 2008)
// vdw       van der Waals radius, pm (Bondi 1964; Na+/Cl- carry their ionic radii below instead)
// ionic     Shannon ionic radius of the ion the element forms in a cell, pm, 6-coordinate
// mass      relative atomic mass
export const ELEMENTS = Object.freeze({
  H: { symbol: 'H', name: 'Hydrogen', valence: 1, shell: 2, en: 2.20, covalent: 31, vdw: 120, mass: 1.008, token: 'paper3', outline: 'ruleStrong', metal: false },
  C: { symbol: 'C', name: 'Carbon', valence: 4, shell: 8, en: 2.55, covalent: 76, vdw: 170, mass: 12.011, token: 'inkSoft', outline: 'inkSoft', metal: false },
  N: { symbol: 'N', name: 'Nitrogen', valence: 5, shell: 8, en: 3.04, covalent: 71, vdw: 155, mass: 14.007, token: 'water', outline: 'water', metal: false },
  O: { symbol: 'O', name: 'Oxygen', valence: 6, shell: 8, en: 3.44, covalent: 66, vdw: 152, mass: 15.999, token: 'coral', outline: 'coral', metal: false },
  P: { symbol: 'P', name: 'Phosphorus', valence: 5, shell: 8, en: 2.19, covalent: 107, vdw: 180, mass: 30.974, token: 'violet', outline: 'violet', metal: false },
  S: { symbol: 'S', name: 'Sulfur', valence: 6, shell: 8, en: 2.58, covalent: 105, vdw: 180, mass: 32.06, token: 'gold', outline: 'gold', metal: false },
  Na: { symbol: 'Na', name: 'Sodium', valence: 1, shell: 8, en: 0.93, covalent: 166, vdw: 227, ionic: 102, charge: 1, mass: 22.990, token: 'leaf', outline: 'leaf', metal: true },
  Cl: { symbol: 'Cl', name: 'Chlorine', valence: 7, shell: 8, en: 3.16, covalent: 99, vdw: 175, ionic: 181, charge: -1, mass: 35.45, token: 'leaf', outline: 'leaf', metal: false },
});

// Electrons short of a full outer shell. A metal is counted by what it gives away, not what it needs:
// sodium is one electron from an empty shell, not seven from a full one, and the bench says so.
export function shortOf(symbol) {
  const e = ELEMENTS[symbol];
  if (!e) return 0;
  return e.metal ? 0 : e.shell - e.valence;
}

export function gives(symbol) {
  const e = ELEMENTS[symbol];
  return e && e.metal ? e.valence : 0;
}

// The fill and the outline for an atom, resolved against a palette. Hydrogen is the only one drawn as a
// pale disc with a darker rule, because every other element is a colour and hydrogen is everywhere.
export function atomColours(palette, symbol) {
  const e = ELEMENTS[symbol];
  if (!e) return { fill: palette.inkSoft, stroke: palette.inkSoft };
  return { fill: palette[e.token], stroke: palette[e.outline] };
}

// ---------- geometry ----------

export const WATER = Object.freeze({
  angleDeg: 104.5, // H-O-H, gas-phase electron diffraction
  ohPm: 95.8, // O-H bond length, pm
  ooIcePm: 276, // O...O in ice Ih
  ooLiquidPm: 284, // first peak of g(O-O) in liquid water at 25 C
  vdwOPm: 152,
  vdwHPm: 120,
});

// A single covalent bond is close to the sum of the two covalent radii; a double is about 0.87 of that
// and a triple 0.78 (Pyykko's multiple-bond radii, rounded to one rule). Checked against the values the
// chapter quotes: C-C 152 (154 measured), C=C 132 (134), C#C 119 (120), O-H 97 (96), C-H 107 (109).
export function bondLengthPm(a, b, order = 1) {
  if (a === 'H' && b === 'H') return 74; // the sum of two covalent radii is 62; H2 is measured at 74
  const sum = ELEMENTS[a].covalent + ELEMENTS[b].covalent;
  return Math.round(sum * (order === 3 ? 0.78 : order === 2 ? 0.87 : 1));
}

// The separation of a sodium and a chloride ion, from their ionic radii: 283 pm, against 282 pm measured
// in the rock-salt crystal.
export function ionPairPm(a, b) {
  return Math.round((ELEMENTS[a].ionic ?? ELEMENTS[a].covalent) + (ELEMENTS[b].ionic ?? ELEMENTS[b].covalent));
}

// ---------- energy ----------

export const THERMAL_KJ_MOL = 2.6; // RT at 37 C is 2.58 kJ/mol; the chapter's table rounds it to 2.6
export const COULOMB_KJ_NM = 138.935; // e^2 / 4*pi*eps0, in kJ.nm/mol
export const EPS_WATER = 78.4; // relative permittivity of water at 25 C
// 1 kJ/(mol.nm) of force is 1.6605 pN.
export const KJ_PER_MOL_NM_TO_PN = 1.66054;

// Bond dissociation energies, kJ/mol, for the pairs the bench can make. Standard undergraduate table
// (Zumdahl, Chemical Principles, app. A; the same values Campbell quotes for C-C and O-H).
const BOND_ENERGY = {
  'H-H': 436, 'H-C': 413, 'H-N': 391, 'H-O': 463, 'H-Cl': 431,
  'C-C': 348, 'C=C': 614, 'C#C': 839,
  'C-N': 293, 'C=N': 615, 'C#N': 891,
  'C-O': 358, 'C=O': 799,
  'C-Cl': 328,
  'N-N': 163, 'N=N': 418, 'N#N': 941,
  'N-O': 201, 'N=O': 607,
  'N-Cl': 200,
  'O-O': 146, 'O=O': 498,
  'O-Cl': 203,
  'Cl-Cl': 242,
};

const ORDER_MARK = { 1: '-', 2: '=', 3: '#' };

export function bondEnergyKjMol(a, b, order = 1) {
  const m = ORDER_MARK[order] || '-';
  return BOND_ENERGY[`${a}${m}${b}`] ?? BOND_ENERGY[`${b}${m}${a}`] ?? null;
}

// A Morse well of depth D with its minimum at re: the energy still needed to pull the pair apart from a
// separation r. E(re) = D, E(infinity) = 0. `a` sets how quickly the well lets go; 20 nm^-1 for a
// covalent bond, 12 nm^-1 for the softer hydrogen bond.
export function morseRemaining(D, re, r, a = 20) {
  const x = Math.exp(-a * (r - re));
  return D * clamp01(x * (2 - x));
}

// The force holding a Morse pair together at separation r, in kJ/(mol.nm): dE/dr.
export function morseForce(D, re, r, a = 20) {
  const x = Math.exp(-a * (r - re));
  return 2 * a * D * Math.max(0, x * (1 - x));
}

// Two opposite unit charges at r nanometres, in a medium of relative permittivity eps: the work to take
// them to infinity. Na+Cl- at 283 pm comes out at 491 kJ/mol in air and 6.3 kJ/mol in water, which is
// the chapter's "a few kilojoules per mole".
export function coulombRemaining(z1z2, r, eps = 1) {
  return (COULOMB_KJ_NM * Math.abs(z1z2)) / (eps * Math.max(r, 1e-4));
}

export function coulombForce(z1z2, r, eps = 1) {
  return (COULOMB_KJ_NM * Math.abs(z1z2)) / (eps * Math.max(r, 1e-4) ** 2);
}

// ---------- water, as a liquid ----------

// The mean lifetime of one hydrogen bond, picoseconds. In liquid water at 25 C it is about 1.5 ps and it
// falls as the liquid warms; the chapter says "a few trillionths of a second". Below freezing a molecule
// keeps its partners until the whole lattice rearranges, which near 0 C takes of the order of 10 us
// (the dielectric relaxation time of ice Ih), so the two branches meet at a step, as freezing does.
export function bondLifePs(tempC) {
  if (tempC <= 0) return 1.0e7 * Math.exp(-tempC / 8);
  return 1.5 * Math.exp(-(tempC - 25) / 60);
}

// The fraction of a molecule's four hydrogen-bonding slots that are filled at this temperature. The model
// is linear in the liquid, fitted to the two numbers the chapter states: four in ice, about three and a
// half at 25 C. Above boiling it collapses.
export function bondDuty(tempC) {
  if (tempC <= 0) return 1;
  if (tempC <= 100) return clamp01(0.95 - 0.0026 * tempC);
  return clamp01(0.69 * (1 - ramp(tempC, 100, 118)) + 0.02);
}

export function phaseOf(tempC) {
  return tempC < 0 ? 'ice' : tempC > 100 ? 'steam' : 'liquid';
}

// Density of liquid water, g/cm^3, as a parabola about its maximum at 4 C. Gives 0.99821 at 20 C and
// 0.99990 at 0 C, against 0.99821 and 0.99984 measured.
export function liquidDensity(tempC, densestAtC = 4) {
  return 1.0 - 7.0e-6 * (tempC - densestAtC) ** 2;
}

// ---------- text ----------

export const MINUS = '−';
export const DEG = '°';

export function signed(x, dp = 2) {
  const v = Number(x.toFixed(dp));
  return `${v < 0 ? MINUS : '+'}${Math.abs(v).toFixed(dp)}`;
}

// A picosecond count in the unit a reader can hold: ps, ns, us, ms.
export function formatTime(ps) {
  if (ps >= 1e9) return `${(ps / 1e9).toPrecision(2)} ms`;
  if (ps >= 1e6) return `${(ps / 1e6).toPrecision(2)} µs`;
  if (ps >= 1e3) return `${(ps / 1e3).toPrecision(2)} ns`;
  return `${ps.toPrecision(2)} ps`;
}

export function formatTempC(tempC) {
  const v = Math.round(tempC);
  return `${v < 0 ? MINUS : ''}${Math.abs(v)} ${DEG}C`;
}
