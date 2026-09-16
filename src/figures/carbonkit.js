// Build a skeleton, hang groups on it. A molecule-building bench where the valence rule is enforced
// rather than stated: a carbon is never drawn with five bonds, because the bench will not make one, and
// the hydrogens that fill the rest appear and disappear as the reader works. When a build matches a
// molecule the book uses, the bench names it, and where another molecule shares the formula it names
// that too, so an isomer pair can be built on purpose.
//
// THE MODEL is a graph on a triangular lattice. Every carbon sits on a lattice site, so the six
// directions out of a site are the only places a bond can go, rings close exactly, and two carbons can
// never land on top of each other. A methyl group is not a group in the model at all — it is a carbon,
// which is what it is — but it is recorded in the order the reader attached it so describe().groups
// reports it. Everything else (hydroxyl, carbonyl, carboxyl, amino, sulfhydryl, phosphate) hangs off a
// carbon as a fixed little structure of real atoms, drawn in a free lattice direction.
//
// Hydrogens are never stored. They are computed every frame as 4 minus the bonds a carbon has used, and
// drawn in whatever directions are left, which is why watching them come and go is the point.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — the molecule on the left; on the right a specimen label (the name the bench has reached,
//            the formula, a reference table of what the build is made of) over the parts list, which is
//            the seven functional groups as a single column the reader drags from;
//   narrow — the molecule above a three-line readout, the group tray in one row of symbols.
// Both panes are authored in the stage's own device pixels, so a 10 px label is 10 device pixels.
//
// WHY THE PARTS LIST MOVED. It used to be a wrapping row along the bottom of the stage, which left the
// right-hand column holding nine table rows in five hundred pixels: half of it empty under the verdict.
// A column that is half empty is a composition that has not been decided, and the answer was not to
// stretch the table but to give the column the thing that belongs beside the drawing anyway — the parts
// you build with. The drawing then takes the whole left of the stage and the bottom line is free for the
// bench's own commentary at a size it can be read at.
//
// The bench has no clock: every frame is a function of the build, so setTime only redraws.
import { el, h, text, C, uid, clamp } from './lib/svg.js';
import { atom, bond, prettyFormula, CC_BOND_PM, readoutCss, readoutTable, fitRows, focusMark, INK } from './lib/mol-draw.js';

export const meta = { kind: 'carbonkit', title: 'Build a skeleton, hang groups on it', needsWebGL: false, aspect: 16 / 10 };

const MAX_CARBONS = 8;
const NARROW_W = 640;
const NARROW_H = 360;

// ---------------------------------------------------------------- the lattice

// Axial coordinates on a triangular lattice. The six neighbours of a site are the six directions a
// bond can take; four of them at most are ever used, because a carbon makes four bonds.
const DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
const L = 46; // one C–C bond, in drawing units
const RADIUS = 0.45; // how much of the covalent radius an atom is drawn at, so the drawing is to scale
const xyOf = (q, r) => [L * (q + r / 2), L * r * 0.8660254];
const dirXY = (d) => xyOf(DIRS[d][0], DIRS[d][1]);
const key = (q, r) => `${q},${r}`;

// ---------------------------------------------------------------- the functional groups

// `bonds` is how many of the host carbon's four bonds the group uses. `atoms` is the formula it adds,
// not counting the host carbon. `build` draws it, given the unit vector of the direction it hangs in.
const GROUPS = {
  hydroxyl: { id: 'hydroxyl', name: 'Hydroxyl', formula: '—OH', bonds: 1, atoms: { O: 1, H: 1 }, polar: 2, key: '1' },
  carbonyl: { id: 'carbonyl', name: 'Carbonyl', formula: 'C=O', bonds: 2, atoms: { O: 1 }, polar: 1.4, key: '2' },
  carboxyl: { id: 'carboxyl', name: 'Carboxyl', formula: '—COOH', bonds: 1, atoms: { C: 1, O: 2, H: 1 }, polar: 2.6, key: '3' },
  amino: { id: 'amino', name: 'Amino', formula: '—NH₂', bonds: 1, atoms: { N: 1, H: 2 }, polar: 2.6, key: '4' },
  sulfhydryl: { id: 'sulfhydryl', name: 'Sulfhydryl', formula: '—SH', bonds: 1, atoms: { S: 1, H: 1 }, polar: 0.8, key: '5' },
  phosphate: { id: 'phosphate', name: 'Phosphate', formula: '—OPO₃H₂', bonds: 1, atoms: { P: 1, O: 4, H: 2 }, polar: 3.2, key: '6' },
  methyl: { id: 'methyl', name: 'Methyl', formula: '—CH₃', bonds: 1, atoms: { C: 1, H: 3 }, polar: 0, key: '7' },
};
const GROUP_ORDER = ['hydroxyl', 'carbonyl', 'carboxyl', 'amino', 'sulfhydryl', 'phosphate', 'methyl'];

// ---------------------------------------------------------------- the molecules the bench knows

// Each recogniser is a predicate over a small description of the build. They are tried in order and
// the first that matches names the molecule, so the specific ones come before the general ones.
const ALKANES = ['methane', 'ethane', 'propane', 'butane', 'pentane', 'hexane', 'heptane', 'octane'];

function recognise(m) {
  const { n, chain, rings, ringSizes, doubles, triples, gc, groupsAt, branchPoints, maxCarbonDegree } = m;
  const plain = gc.total === 0;
  const only = (...kinds) => gc.total === kinds.length && kinds.every((k, i) => gc.list[i] === k);
  // rings first: a ring is never a chain, so nothing below can claim one
  if (rings === 1 && plain && !triples) {
    if (ringSizes[0] === 6 && n === 6) {
      if (doubles === 0) return 'cyclohexane';
      if (doubles === 1) return 'cyclohexene';
      if (doubles === 3) return 'benzene';
    }
    if (!doubles && ringSizes[0] === 5 && n === 5) return 'cyclopentane';
    if (!doubles && ringSizes[0] === 4 && n === 4) return 'cyclobutane';
    if (!doubles && ringSizes[0] === 3 && n === 3) return 'cyclopropane';
  }
  if (!chain) {
    // branched alkanes, the isomers of the straight ones
    if (plain && !doubles && !triples && !rings) {
      if (n === 4 && branchPoints === 1) return '2-methylpropane (isobutane)';
      if (n === 5 && branchPoints === 1 && maxCarbonDegree === 3) return '2-methylbutane (isopentane)';
      if (n === 5 && branchPoints === 1 && maxCarbonDegree === 4) return '2,2-dimethylpropane (neopentane)';
    }
    return null;
  }
  const ends = [chain[0], chain[chain.length - 1]];
  const at = (i) => groupsAt.get(chain[i]) || [];
  const has = (i, kind) => at(i).includes(kind);
  const bare = (i) => at(i).length === 0;
  if (plain && !doubles && !triples) return ALKANES[n - 1] || null;
  if (plain && n === 2 && doubles === 1) return 'ethene';
  if (plain && n === 2 && triples === 1) return 'ethyne (acetylene)';
  if (plain && n === 3 && doubles === 1) return 'propene';
  if (doubles || triples) return null;
  // one group on the skeleton
  if (only('hydroxyl')) {
    if (n === 1) return 'methanol';
    if (n === 2) return 'ethanol';
    if (n === 3) return has(0, 'hydroxyl') || has(2, 'hydroxyl') ? 'propan-1-ol' : 'propan-2-ol (isopropanol)';
  }
  if (only('carbonyl')) {
    if (n === 1) return 'methanal (formaldehyde)';
    if (n === 2) return 'ethanal (acetaldehyde)';
    if (n === 3) return has(1, 'carbonyl') ? 'acetone (propanone)' : 'propanal';
  }
  if (only('carboxyl') && (has(0, 'carboxyl') || has(n - 1, 'carboxyl'))) {
    if (n === 1) return 'acetic acid (ethanoic acid)';
    if (n === 2) return 'propanoic acid';
    if (n === 3) return 'butanoic acid, a short fatty acid';
    if (n === 4) return 'pentanoic acid, a short fatty acid';
    if (n === 5) return 'hexanoic acid, a short fatty acid';
    if (n >= 6) return 'a saturated fatty acid tail';
  }
  if (only('amino') && n === 1) return 'methylamine';
  if (only('sulfhydryl') && n === 1) return 'methanethiol';
  if (gc.total === 2 && gc.count.carboxyl === 1 && gc.count.amino === 1) {
    if (n === 1) return 'glycine';
    if (n === 2 && ends.some((_, i) => has(i, 'carboxyl') && has(i, 'amino')) && (bare(0) || bare(1))) return 'alanine';
  }
  if (gc.total === 3 && gc.count.carboxyl === 1 && gc.count.amino === 1 && n === 2) {
    const i = has(0, 'carboxyl') ? 0 : 1;
    const j = 1 - i;
    if (has(j, 'sulfhydryl')) return 'cysteine';
    if (has(j, 'hydroxyl')) return 'serine';
  }
  if (only('hydroxyl', 'hydroxyl') && n === 2) return 'ethane-1,2-diol (glycol)';
  if (gc.total === 2 && gc.count.amino === 2 && gc.count.carbonyl === 0 && n === 1) return null;
  if (gc.total === 3 && gc.count.amino === 2 && gc.count.carbonyl === 1 && n === 1) return 'urea';
  if (n === 3 && gc.count.hydroxyl === 3 && gc.total === 3) return 'glycerol';
  if (n === 3 && gc.count.hydroxyl === 2 && gc.count.phosphate === 1 && gc.total === 3 && (has(0, 'phosphate') || has(2, 'phosphate'))) return 'glycerol 3-phosphate';
  // the two the chapter needs: an open-chain hexose with a carbonyl and five hydroxyls
  if (n === 6 && gc.total === 6 && gc.count.carbonyl === 1 && gc.count.hydroxyl === 5) {
    const carbonylAt = [0, 1, 2, 3, 4, 5].find((i) => has(i, 'carbonyl'));
    if (carbonylAt === 0 || carbonylAt === 5) return 'glucose (open chain)';
    if (carbonylAt === 1 || carbonylAt === 4) return 'fructose (open chain)';
  }
  return null;
}

// Molecules that share a formula. The bench names one of these whenever the build has the formula,
// whether or not this particular arrangement is one the bench can recognise.
const ISOMERS = {
  CH4: ['methane'],
  C2H6: ['ethane'],
  C2H4: ['ethene'],
  C2H2: ['ethyne (acetylene)'],
  C2H6O: ['ethanol', 'dimethyl ether'],
  C2H4O: ['ethanal (acetaldehyde)', 'ethylene oxide'],
  C2H4O2: ['acetic acid (ethanoic acid)', 'methyl formate'],
  C2H6O2: ['ethane-1,2-diol (glycol)'],
  C2H5NO2: ['glycine'],
  C3H8: ['propane'],
  C3H6O: ['propanal', 'acetone (propanone)'],
  C3H8O: ['propan-1-ol', 'propan-2-ol (isopropanol)', 'methoxyethane'],
  C3H6O2: ['propanoic acid', 'methyl acetate'],
  C3H8O3: ['glycerol'],
  C3H7NO2: ['alanine', 'sarcosine', 'β-alanine'],
  C3H7NO2S: ['cysteine'],
  C4H10: ['butane', '2-methylpropane (isobutane)'],
  C4H8O2: ['butanoic acid, a short fatty acid', 'ethyl acetate'],
  C5H12: ['pentane', '2-methylbutane (isopentane)', '2,2-dimethylpropane (neopentane)'],
  C6H6: ['benzene'],
  C6H10: ['cyclohexene', 'hexa-1,5-diene'],
  C6H12: ['cyclohexane', 'hex-1-ene'],
  C6H14: ['hexane', '2-methylpentane', '2,2-dimethylbutane'],
  C6H12O6: ['glucose (open chain)', 'fructose (open chain)', 'galactose'],
  CH4N2O: ['urea'],
};

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-carbonkit')}
.tb-carbonkit { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 68fr) minmax(0, 32fr); grid-template-rows: minmax(0, 1fr) auto;
  padding: 0.3rem 0.4rem var(--ck-pad, 2.6rem); column-gap: var(--space-4); row-gap: var(--space-2);
  font-family: var(--font-ui); }
.tb-carbonkit .ck-pane { position: relative; min-width: 0; min-height: 0; }
.tb-carbonkit .ck-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-carbonkit .ck-mol { grid-column: 1; grid-row: 1 / 3; }
.tb-carbonkit .ck-read { grid-column: 2; grid-row: 1; }
.tb-carbonkit svg text { font-family: var(--font-ui); }
.tb-carbonkit .ck-hit { cursor: pointer; fill: transparent; }
.tb-carbonkit .ck-name { fill: var(--ink); font-weight: 600; }
.tb-carbonkit .ck-qual { fill: var(--ink-soft); }
.tb-carbonkit .ck-formula { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums; }
.tb-carbonkit .ck-note { fill: var(--ink-faint); }
.tb-carbonkit .ck-say { fill: var(--ink-soft); }
/* The parts list: one column beside the drawing, each part a rule-free row with its formula in the ink
   and its name in the quiet colour, so it reads as a list of parts and not as a row of buttons. */
.tb-carbonkit .ck-tray { grid-column: 2; grid-row: 2; display: flex; flex-direction: column;
  gap: 0; align-self: end; }
.tb-carbonkit .ck-traytitle { margin: 0 0 0.1rem; padding: 0 4px; font-family: var(--font-ui);
  font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-faint); }
.tb-carbonkit .ck-chip { appearance: none; font: inherit; font-family: var(--font-ui); font-size: var(--text-xs);
  display: flex; align-items: baseline; justify-content: space-between; gap: 0.6em; width: 100%;
  color: var(--ink); background: none; border: 0; border-top: 1px solid var(--rule);
  border-radius: 0; padding: 0.34rem 4px; text-align: left; cursor: grab; touch-action: none; }
.tb-carbonkit .ck-chip:first-of-type { border-top-color: var(--rule-strong); }
.tb-carbonkit .ck-chip:hover { background: var(--paper-2); color: var(--leaf-text); }
.tb-carbonkit .ck-chip.is-dragging { cursor: grabbing; background: var(--paper-2); color: var(--leaf-text); }
.tb-carbonkit .ck-chip .ck-chipname { color: var(--ink-faint); }
.tb-carbonkit .ck-chip:hover .ck-chipname, .tb-carbonkit .ck-chip.is-dragging .ck-chipname { color: var(--leaf-text); }
/* The five build controls in two groups on one rule: what makes the molecule, then what unmakes it. */
.tb-carbonkit .fig-toolbar { justify-content: flex-start; }
.tb-carbonkit .ck-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-carbonkit .ck-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
/* The primary action is the only button with the structural rule round it: on paper that is the ink
   itself, on the dark paper it is mixed back so it does not out-shout the drawing. */
.tb-carbonkit .ck-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-carbonkit .ck-short { display: none; }
/* The readout row is the height of what it draws — a name, a rule and three lines — and the molecule
   takes the rest. At a third of the stage the readout stopped a quarter of the way down its row and the
   rest of the row opened as a hole between it and the parts tray. */
.tb-carbonkit.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 4rem; }
.tb-carbonkit.is-narrow .ck-mol { grid-column: 1; grid-row: 1; }
.tb-carbonkit.is-narrow .ck-read { grid-column: 1; grid-row: 2; }
.tb-carbonkit.is-narrow .ck-traytitle { display: none; }
/* grid-area: auto matters. Left on grid-column 2 in a one-column grid, the absolutely positioned tray
   takes that (nonexistent) area as its containing block, so left/right resolved against a sliver, the
   seven parts wrapped into seven rows, --ck-pad grew by their height and the molecule was squeezed into
   a thirty-pixel band at the top of the stage. */
.tb-carbonkit.is-narrow .ck-tray { position: absolute; grid-area: auto; left: var(--space-3); right: var(--space-3);
  bottom: var(--ck-traybottom, 2.6rem); flex-direction: row; flex-wrap: wrap; gap: 0.26rem;
  align-items: center; pointer-events: none; }
.tb-carbonkit.is-narrow .ck-tray > * { pointer-events: auto; }
.tb-carbonkit.is-narrow .ck-chip { width: auto; border: 1px solid var(--rule-strong); border-radius: var(--radius);
  background: color-mix(in srgb, var(--paper) 88%, transparent); padding: 0.22rem 0.36rem; }
.tb-carbonkit.is-narrow .ck-long { display: none; }
.tb-carbonkit.is-narrow .ck-short { display: inline; }
.tb-carbonkit.is-narrow .ck-chip .ck-chipname { display: none; }
.tb-carbonkit.is-narrow .fig-btn { padding: 0.24rem 0.45rem; }
.tb-carbonkit.is-narrow .fig-toolbar { gap: 0.26rem; }
.tb-carbonkit.is-narrow .ck-sep { display: none; }
`;

const fmt = (v, dp = 1) => v.toFixed(dp);
const HILL = ['C', 'H', 'N', 'O', 'P', 'S'];

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('ck');
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let trayBottom = 0;
  let ready = false;

  // ---- the build ----
  let nextId = 0;
  let order = 0;
  let carbons = [];
  let cbonds = [];
  let groups = [];
  let sel = { type: 'carbon', id: 0 };
  let message = '';

  function reset() {
    nextId = 0;
    order = 0;
    carbons = [{ id: nextId++, q: 0, r: 0, methyl: false, order: order++ }];
    cbonds = [];
    groups = [];
    sel = { type: 'carbon', id: carbons[0].id };
    message = '';
  }
  reset();

  const carbonById = (id) => carbons.find((c) => c.id === id);
  const siteTaken = (q, r) => carbons.some((c) => c.q === q && c.r === r);
  const bondsOf = (id) => cbonds.filter((b) => b.a === id || b.b === id);
  const other = (b, id) => (b.a === id ? b.b : b.a);
  const groupsOf = (id) => groups.filter((g) => g.carbon === id);
  // A methyl is not a group in the model: it is a carbon, with a real carbon–carbon bond in `cbonds`.
  // It stays in `groups` only so describe() can report it in the order the reader attached it, and
  // counting its bond here as well as in cbonds took a hydrogen off the host — CH3 on propane came out
  // as C4H9, a carbon with three bonds, which is the one thing this bench must never draw.
  const hangingOn = (id) => groupsOf(id).filter((g) => g.kind !== 'methyl');
  const usedValence = (id) => bondsOf(id).reduce((s, b) => s + b.order, 0) + hangingOn(id).reduce((s, g) => s + GROUPS[g.kind].bonds, 0);
  const freeValence = (id) => 4 - usedValence(id);

  // Which of the six directions out of a carbon are already spoken for.
  function usedDirs(id) {
    const c = carbonById(id);
    const out = new Set();
    for (const b of bondsOf(id)) {
      const o = carbonById(other(b, id));
      const d = DIRS.findIndex((v) => c.q + v[0] === o.q && c.r + v[1] === o.r);
      if (d >= 0) out.add(d);
    }
    for (const g of hangingOn(id)) out.add(g.dir);
    return out;
  }

  // A direction to grow a carbon in. The two horizontal directions are kept for last, so a chain
  // zig-zags the way a chemist draws one instead of lying in a line of circles.
  function growDir(id) {
    const c = carbonById(id);
    const used = usedDirs(id);
    const incoming = (() => {
      const b = bondsOf(id)[0];
      if (!b) return null;
      const o = carbonById(other(b, id));
      return DIRS.findIndex((v) => o.q + v[0] === c.q && o.r + v[1] === c.r);
    })();
    // Unit vectors, not lattice vectors: the six directions differ in length by a factor of one, but
    // their x components are 1 and 0.5, and scoring the raw values would drown every preference below
    // in the scale of L. Scored raw, every chain came out as a straight horizontal line of circles.
    const unit = (d) => {
      const [x, y] = dirXY(d);
      const m = Math.hypot(x, y) || 1;
      return [x / m, y / m];
    };
    const score = (d) => {
      const [dx, dy] = unit(d);
      let s = dx; // grow rightwards
      // The horizontals must lose to the diagonals, whose x component is 0.5, so the penalty has to be
      // more than 0.5. At 0.35 every chain still came out as a straight line of circles.
      if (d === 0 || d === 3) s -= 0.6;
      if (incoming !== null) {
        if (d === (incoming + 3) % 6) s -= 100; // straight back at the parent
        // alternate up and down, which is what makes it a zig-zag
        const [, iy] = unit(incoming);
        if (Math.sign(dy) === Math.sign(iy) && dy !== 0) s -= 0.3;
      }
      return s;
    };
    const options = [0, 1, 2, 3, 4, 5]
      .filter((d) => !used.has(d) && !siteTaken(c.q + DIRS[d][0], c.r + DIRS[d][1]))
      .sort((a, b) => score(b) - score(a));
    return options.length ? options[0] : null;
  }

  // A direction to hang a group in: any free one, preferring the one pointing furthest from the
  // carbon's existing neighbours so the drawing does not fold over itself.
  function groupDir(id) {
    const used = usedDirs(id);
    const free = [0, 1, 2, 3, 4, 5].filter((d) => !used.has(d));
    if (!free.length) return null;
    const c = carbonById(id);
    const busy = [...used].map((d) => dirXY(d));
    let best = free[0];
    let bestScore = -Infinity;
    for (const d of free) {
      const [dx, dy] = dirXY(d);
      let s = 0;
      for (const [bx, by] of busy) s -= (dx * bx + dy * by) / (L * L);
      if (siteTaken(c.q + DIRS[d][0], c.r + DIRS[d][1])) s -= 6; // a group would sit on a carbon
      if (s > bestScore) {
        bestScore = s;
        best = d;
      }
    }
    return best;
  }

  // ---- actions ----
  function say(msg) {
    message = msg;
    live.textContent = msg;
  }

  function addCarbon(fromId, asMethyl = false) {
    if (carbons.length >= MAX_CARBONS) {
      say(`the bench holds ${MAX_CARBONS} carbons, which is enough for every molecule it names; press Reset to start again`);
      return null;
    }
    const c = carbonById(fromId);
    if (!c) return null;
    if (freeValence(fromId) < 1) {
      say(`that carbon already has its four bonds, so nothing more will go on it — this is the rule the bench will not break`);
      return null;
    }
    const d = growDir(fromId);
    if (d === null) {
      say('there is no room next to that carbon; grow from another one');
      return null;
    }
    const n = { id: nextId++, q: c.q + DIRS[d][0], r: c.r + DIRS[d][1], methyl: asMethyl, order: order++ };
    carbons.push(n);
    cbonds.push({ a: fromId, b: n.id, order: 1 });
    sel = { type: 'carbon', id: asMethyl ? fromId : n.id };
    say(asMethyl ? 'a methyl group is a carbon with three hydrogens, so the bench adds a carbon' : `carbon ${carbons.length} added; it arrives with its hydrogens`);
    return n;
  }

  // Distance between two carbons through the bonds, for working out how big a ring a closure makes.
  function bondDistance(from, to) {
    const seen = new Set([from]);
    let frontier = [from];
    let d = 0;
    while (frontier.length) {
      if (frontier.includes(to)) return d;
      const next = [];
      for (const id of frontier) {
        for (const b of bondsOf(id)) {
          const o = other(b, id);
          if (seen.has(o)) continue;
          seen.add(o);
          next.push(o);
        }
      }
      frontier = next;
      d += 1;
    }
    return Infinity;
  }

  function closeRing() {
    const chain = chainOrder();
    const n = carbons.length;
    // A plain chain gets laid out as a ring of its own length. This comes FIRST because a chain drawn
    // as a chemist draws it — zig-zagging by 120° — always puts carbon 1 and carbon 3 on neighbouring
    // lattice sites, so a bench that took the first adjacent pair it found turned every chain into
    // cyclopropane and never made a six-ring at all.
    const RING_SITES = {
      3: [[0, 0], [1, 0], [0, 1]],
      4: [[0, 0], [1, 0], [1, 1], [0, 1]],
      5: [[0, 0], [1, 0], [2, 0], [1, 1], [0, 1]],
      6: [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]],
    };
    if (chain && n >= 3 && n <= 6 && groups.length === 0) {
      if (freeValence(chain[0]) < 1 || freeValence(chain[n - 1]) < 1) {
        say('both ends of the chain need a spare bond before the ring can close');
        return;
      }
      chain.forEach((id, i) => {
        const c = carbonById(id);
        c.q = RING_SITES[n][i][0];
        c.r = RING_SITES[n][i][1];
      });
      cbonds.push({ a: chain[0], b: chain[n - 1], order: 1 });
      sel = { type: 'bond', id: `${chain[0]}-${chain[n - 1]}` };
      say(`a ring of ${n} carbons; every one of them still has four bonds`);
      return;
    }
    // Otherwise join two carbons already next to each other on the lattice, preferring the pair that
    // makes the biggest ring — which is the one the reader drew the chain round to get.
    const candidates = [];
    for (let i = 0; i < carbons.length; i += 1) {
      for (let j = i + 1; j < carbons.length; j += 1) {
        const a = carbons[i];
        const b = carbons[j];
        const adjacent = DIRS.some((v) => a.q + v[0] === b.q && a.r + v[1] === b.r);
        if (!adjacent) continue;
        if (cbonds.some((x) => (x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id))) continue;
        if (freeValence(a.id) < 1 || freeValence(b.id) < 1) continue;
        candidates.push({ a: a.id, b: b.id, size: bondDistance(a.id, b.id) + 1 });
      }
    }
    if (!candidates.length) {
      say('a ring needs two carbons side by side with a spare bond each, or a plain chain of three to six carbons');
      return;
    }
    candidates.sort((x, y) => y.size - x.size);
    const pick = candidates[0];
    cbonds.push({ a: pick.a, b: pick.b, order: 1 });
    sel = { type: 'bond', id: `${pick.a}-${pick.b}` };
    say(`a ring of ${pick.size} carbons`);
  }

  function cycleBond() {
    const b = selectedBond();
    if (!b) {
      say('select a bond first — click the line between two carbons, or step to it with the arrow keys');
      return;
    }
    const next = b.order === 3 ? 1 : b.order + 1;
    const cost = next - b.order;
    if (cost > 0 && (freeValence(b.a) < cost || freeValence(b.b) < cost)) {
      say(`a ${next === 2 ? 'double' : 'triple'} bond would take another bond from each carbon and one of them has none left`);
      return;
    }
    b.order = next;
    say(`${next === 1 ? 'single' : next === 2 ? 'double' : 'triple'} bond; the hydrogens that bond takes have gone`);
  }

  function attachGroup(carbonId, kind) {
    if (kind === 'methyl') {
      const made = addCarbon(carbonId, true);
      if (made) groups.push({ id: `m${made.id}`, carbon: carbonId, kind: 'methyl', dir: -1, order: made.order, carbonRef: made.id });
      return;
    }
    const g = GROUPS[kind];
    if (freeValence(carbonId) < g.bonds) {
      say(`${g.name.toLowerCase()} needs ${g.bonds} of that carbon's four bonds and there ${freeValence(carbonId) === 1 ? 'is only one' : `are only ${freeValence(carbonId)}`} left`);
      return;
    }
    const d = groupDir(carbonId);
    if (d === null) {
      say('that carbon has no free direction left to hang a group in');
      return;
    }
    groups.push({ id: `g${order}`, carbon: carbonId, kind, dir: d, order: order++ });
    sel = { type: 'carbon', id: carbonId };
    say(`${g.name.toLowerCase()} attached; ${g.bonds === 2 ? 'two hydrogens have' : 'a hydrogen has'} gone to make room`);
  }

  function deleteSelected() {
    if (sel.type === 'bond') {
      const b = selectedBond();
      if (!b) return;
      // only a ring bond can go: cutting a chain would leave two molecules
      const ringBond = cbonds.length >= carbons.length;
      if (!ringBond) {
        say('cutting that bond would leave two separate molecules; delete a carbon instead');
        return;
      }
      cbonds = cbonds.filter((x) => x !== b);
      sel = { type: 'carbon', id: carbons[0].id };
      say('ring opened');
      return;
    }
    const id = sel.id;
    const own = groupsOf(id);
    if (own.length) {
      const last = own[own.length - 1];
      groups = groups.filter((g) => g !== last);
      if (last.kind === 'methyl') {
        carbons = carbons.filter((c) => c.id !== last.carbonRef);
        cbonds = cbonds.filter((b) => b.a !== last.carbonRef && b.b !== last.carbonRef);
      }
      say(`${GROUPS[last.kind].name.toLowerCase()} removed; the hydrogens are back`);
      return;
    }
    if (carbons.length === 1) {
      say('one carbon is the least the bench can hold');
      return;
    }
    if (bondsOf(id).length > 1) {
      say('that carbon is in the middle of the skeleton; delete from an end');
      return;
    }
    const neighbour = other(bondsOf(id)[0], id);
    carbons = carbons.filter((c) => c.id !== id);
    cbonds = cbonds.filter((b) => b.a !== id && b.b !== id);
    groups = groups.filter((g) => g.carbon !== id);
    sel = { type: 'carbon', id: neighbour };
    say('carbon removed');
  }

  function selectedBond() {
    if (sel.type !== 'bond') return null;
    const [a, b] = sel.id.split('-').map(Number);
    return cbonds.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a)) || null;
  }

  // ---- what the build is ----

  function chainOrder() {
    if (cbonds.length !== carbons.length - 1) return null; // a ring, so not a chain
    const deg = new Map(carbons.map((c) => [c.id, bondsOf(c.id).length]));
    if ([...deg.values()].some((d) => d > 2)) return null;
    const endsList = carbons.filter((c) => deg.get(c.id) <= 1);
    if (carbons.length === 1) return [carbons[0].id];
    if (endsList.length !== 2) return null;
    const out = [endsList[0].id];
    const seen = new Set(out);
    while (out.length < carbons.length) {
      const last = out[out.length - 1];
      const nb = bondsOf(last).map((b) => other(b, last)).find((x) => !seen.has(x));
      if (nb === undefined) return null;
      out.push(nb);
      seen.add(nb);
    }
    return out;
  }

  function ringSizesOf() {
    // small graph: the ring count is the cyclomatic number, and for the one or two rings this bench
    // can hold a shortest cycle through each extra bond is the ring the reader sees.
    const ringCount = cbonds.length - carbons.length + 1;
    if (ringCount <= 0) return [];
    const sizes = [];
    const tree = [];
    const seen = new Set();
    const stack = [carbons[0].id];
    seen.add(carbons[0].id);
    const extra = [];
    for (const b of cbonds) {
      if (!seen.has(b.a) || !seen.has(b.b)) { /* fall through to the walk below */ }
    }
    // a plain breadth-first spanning tree
    const adj = new Map(carbons.map((c) => [c.id, []]));
    for (const b of cbonds) {
      adj.get(b.a).push({ to: b.b, b });
      adj.get(b.b).push({ to: b.a, b });
    }
    const visited = new Set([carbons[0].id]);
    const parent = new Map();
    const queue = [carbons[0].id];
    const treeBonds = new Set();
    while (queue.length) {
      const cur = queue.shift();
      for (const { to, b } of adj.get(cur)) {
        if (!visited.has(to)) {
          visited.add(to);
          parent.set(to, cur);
          treeBonds.add(b);
          queue.push(to);
        }
      }
    }
    for (const b of cbonds) if (!treeBonds.has(b)) extra.push(b);
    for (const b of extra) {
      // walk both endpoints up to their common ancestor
      const up = (x) => { const path = [x]; while (parent.has(x)) { x = parent.get(x); path.push(x); } return path; };
      const pa = up(b.a);
      const pb = up(b.b);
      const setB = new Map(pb.map((x, i) => [x, i]));
      let size = 0;
      for (let i = 0; i < pa.length; i += 1) {
        if (setB.has(pa[i])) { size = i + setB.get(pa[i]) + 1; break; }
      }
      sizes.push(size);
    }
    void tree;
    void stack;
    return sizes.sort((a, b) => a - b);
  }

  function describeBuild() {
    const counts = { C: 0, H: 0, N: 0, O: 0, P: 0, S: 0 };
    let free = 0;
    for (const c of carbons) {
      counts.C += 1;
      const hs = 4 - usedValence(c.id);
      counts.H += hs;
      free += hs;
    }
    for (const g of groups) {
      if (g.kind === 'methyl') continue; // already a carbon in the model
      for (const [sym, n] of Object.entries(GROUPS[g.kind].atoms)) counts[sym] += n;
    }
    const formula = HILL.filter((s) => counts[s] > 0).map((s) => s + (counts[s] > 1 ? counts[s] : '')).join('');
    const doubles = cbonds.filter((b) => b.order === 2).length;
    const triples = cbonds.filter((b) => b.order === 3).length;
    const rings = cbonds.length - carbons.length + 1;
    const carbonDegree = (id) => bondsOf(id).length + groupsOf(id).filter((g) => g.kind === 'carboxyl').length;
    const degrees = carbons.map((c) => carbonDegree(c.id));
    const branchPoints = degrees.filter((d) => d >= 3).length;
    const groupsAt = new Map(carbons.map((c) => [c.id, groupsOf(c.id).filter((g) => g.kind !== 'methyl').map((g) => g.kind)]));
    const ordered = groups.slice().sort((a, b) => a.order - b.order).map((g) => g.kind);
    const count = Object.fromEntries(GROUP_ORDER.map((k) => [k, ordered.filter((x) => x === k).length]));
    const gc = { total: ordered.filter((k) => k !== 'methyl').length, list: ordered.filter((k) => k !== 'methyl'), count };
    const chain = chainOrder();
    const m = { n: carbons.length, chain, rings, ringSizes: ringSizesOf(), doubles, triples, gc, groupsAt, branchPoints, maxCarbonDegree: Math.max(...degrees) };
    const match = recognise(m);
    const family = ISOMERS[formula] || null;
    const isomerOf = family ? family.find((x) => x !== match) || null : null;
    const polarUnits = groups.reduce((s, g) => s + GROUPS[g.kind].polar, 0);
    const ratio = polarUnits / Math.max(1, counts.C);
    return {
      formula,
      counts,
      carbons: counts.C,
      rings,
      branchPoints,
      doubleBonds: doubles,
      tripleBonds: triples,
      freeBonds: free,
      groups: ordered,
      polar: polarUnits > 0,
      chargeAtCellPh: (count.carboxyl || count.phosphate) && count.amino ? 'zwitterion'
        : (count.carboxyl || count.phosphate) ? 'negative'
          : count.amino ? 'positive' : 'neutral',
      solubility: ratio >= 0.7 ? 'high' : ratio >= 0.3 ? 'moderate' : 'low',
      match,
      isomerOf,
      valid: carbons.every((c) => usedValence(c.id) <= 4),
    };
  }

  // ---------------------------------------------------------------- drawing

  // Group geometries, in drawing units, given the unit direction (ux, uy) the group hangs in.
  function rot(u, deg) {
    const a = (deg * Math.PI) / 180;
    return [u[0] * Math.cos(a) - u[1] * Math.sin(a), u[0] * Math.sin(a) + u[1] * Math.cos(a)];
  }
  const R = (sym) => RADIUS * ({ C: 76, H: 31, O: 66, N: 71, P: 107, S: 105 }[sym]) * (L / CC_BOND_PM);

  // Returns { atoms: [[x,y,sym]], bonds: [[x1,y1,x2,y2,order]] } placed relative to the host carbon.
  function groupShape(kind, u) {
    const p = (v, k) => [v[0] * k, v[1] * k];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const atoms = [];
    const bonds = [];
    const head = p(u, L);
    if (kind === 'hydroxyl') {
      const hp = add(head, p(rot(u, 52), L * 0.72));
      atoms.push([head[0], head[1], 'O'], [hp[0], hp[1], 'H']);
      bonds.push([0, 0, head[0], head[1], 1], [head[0], head[1], hp[0], hp[1], 1]);
    } else if (kind === 'carbonyl') {
      atoms.push([head[0], head[1], 'O']);
      bonds.push([0, 0, head[0], head[1], 2]);
    } else if (kind === 'carboxyl') {
      const o1 = add(head, p(rot(u, -56), L));
      const o2 = add(head, p(rot(u, 56), L));
      const hp = add(o2, p(rot(u, 100), L * 0.72));
      atoms.push([head[0], head[1], 'C'], [o1[0], o1[1], 'O'], [o2[0], o2[1], 'O'], [hp[0], hp[1], 'H']);
      bonds.push([0, 0, head[0], head[1], 1], [head[0], head[1], o1[0], o1[1], 2], [head[0], head[1], o2[0], o2[1], 1], [o2[0], o2[1], hp[0], hp[1], 1]);
    } else if (kind === 'amino') {
      const h1 = add(head, p(rot(u, -58), L * 0.72));
      const h2 = add(head, p(rot(u, 58), L * 0.72));
      atoms.push([head[0], head[1], 'N'], [h1[0], h1[1], 'H'], [h2[0], h2[1], 'H']);
      bonds.push([0, 0, head[0], head[1], 1], [head[0], head[1], h1[0], h1[1], 1], [head[0], head[1], h2[0], h2[1], 1]);
    } else if (kind === 'sulfhydryl') {
      const hp = add(head, p(rot(u, 52), L * 0.72));
      atoms.push([head[0], head[1], 'S'], [hp[0], hp[1], 'H']);
      bonds.push([0, 0, head[0], head[1], 1], [head[0], head[1], hp[0], hp[1], 1]);
    } else if (kind === 'phosphate') {
      const pAt = add(head, p(u, L));
      const od = add(pAt, p(u, L));
      const o1 = add(pAt, p(rot(u, -74), L));
      const o2 = add(pAt, p(rot(u, 74), L));
      const h1 = add(o1, p(rot(u, -128), L * 0.72));
      const h2 = add(o2, p(rot(u, 128), L * 0.72));
      atoms.push([head[0], head[1], 'O'], [pAt[0], pAt[1], 'P'], [od[0], od[1], 'O'], [o1[0], o1[1], 'O'], [o2[0], o2[1], 'O'], [h1[0], h1[1], 'H'], [h2[0], h2[1], 'H']);
      bonds.push([0, 0, head[0], head[1], 1], [head[0], head[1], pAt[0], pAt[1], 1], [pAt[0], pAt[1], od[0], od[1], 2], [pAt[0], pAt[1], o1[0], o1[1], 1], [pAt[0], pAt[1], o2[0], o2[1], 1], [o1[0], o1[1], h1[0], h1[1], 1], [o2[0], o2[1], h2[0], h2[1], 1]);
    }
    return { atoms, bonds };
  }

  // Everything the molecule draws, in local units, plus a bounding box, so the pane can fit it.
  function molecule() {
    const items = { atoms: [], bonds: [], hits: [] };
    const at = (c) => xyOf(c.q, c.r);
    for (const b of cbonds) {
      const p = at(carbonById(b.a));
      const q = at(carbonById(b.b));
      items.bonds.push({ x1: p[0], y1: p[1], x2: q[0], y2: q[1], order: b.order, bond: b });
    }
    for (const c of carbons) {
      const p = at(c);
      const used = usedDirs(c.id);
      const hs = 4 - usedValence(c.id);
      const free = [0, 1, 2, 3, 4, 5].filter((d) => !used.has(d));
      // hydrogens go in the free directions that are furthest from the bonds already there
      const ordered = free.slice().sort((a, b) => {
        const sc = (d) => {
          const v = dirXY(d);
          let s = 0;
          for (const u of used) {
            const w = dirXY(u);
            s -= (v[0] * w[0] + v[1] * w[1]) / (L * L);
          }
          if (siteTaken(c.q + DIRS[d][0], c.r + DIRS[d][1])) s -= 6;
          return s;
        };
        return sc(b) - sc(a);
      });
      for (let i = 0; i < hs && i < ordered.length; i += 1) {
        const v = dirXY(ordered[i]);
        const hx = p[0] + v[0] * 0.7;
        const hy = p[1] + v[1] * 0.7;
        items.bonds.push({ x1: p[0], y1: p[1], x2: hx, y2: hy, order: 1, thin: true });
        items.atoms.push({ x: hx, y: hy, sym: 'H' });
      }
      items.atoms.push({ x: p[0], y: p[1], sym: 'C', carbon: c });
    }
    for (const g of groups) {
      if (g.kind === 'methyl') continue;
      const c = carbonById(g.carbon);
      const p = at(c);
      const v = dirXY(g.dir);
      const u = [v[0] / L, v[1] / L];
      const shape = groupShape(g.kind, u);
      for (const [x1, y1, x2, y2, o] of shape.bonds) items.bonds.push({ x1: p[0] + x1, y1: p[1] + y1, x2: p[0] + x2, y2: p[1] + y2, order: o });
      for (const [x, y, sym] of shape.atoms) items.atoms.push({ x: p[0] + x, y: p[1] + y, sym, group: g });
    }
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const a of items.atoms) {
      const r = R(a.sym) + 2;
      x0 = Math.min(x0, a.x - r);
      y0 = Math.min(y0, a.y - r);
      x1 = Math.max(x1, a.x + r);
      y1 = Math.max(y1, a.y + r);
    }
    return { items, box: [x0, y0, x1, y1] };
  }

  function drawMolecule(w, hgt) {
    molSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    molSvg.replaceChildren();
    const { items, box } = molecule();
    const bw = box[2] - box[0];
    const bh = box[3] - box[1];
    // The foot of the pane is two lines: what the bench just said, and the scale the drawing is at.
    // Sharing one line cost the commentary two thirds of its room and cut it off mid-word.
    const barH = narrow ? 30 : 34;
    const pad = Math.min(16, Math.max(4, hgt * 0.08));
    // Clamped above zero: on a phone the molecule pane is short enough that `hgt - pad*2 - barH` went
    // negative, every radius with it, and the console filled with "attribute r: a negative value is not
    // valid" while the figure drew nothing. Caught by npm run narrow, which is why that gate exists.
    const s = clamp(Math.min(2.2, (w - pad * 2) / Math.max(1, bw), Math.max(24, hgt - pad * 2 - barH) / Math.max(1, bh)), 0.25, 2.2);
    const ox = (w - bw * s) / 2 - box[0] * s;
    const oy = (hgt - barH - bh * s) / 2 - box[1] * s;
    const X = (x) => ox + x * s;
    const Y = (y) => oy + y * s;

    for (const b of items.bonds) {
      const g = bond(X(b.x1), Y(b.y1), X(b.x2), Y(b.y2), b.order, { width: (b.thin ? 1.7 : 2.6) * s, gap: 5.2 * s, colour: b.thin ? C.soft : C.ink });
      molSvg.append(g);
      if (b.bond) {
        const hit = el('line', { x1: fmt(X(b.x1), 1), y1: fmt(Y(b.y1), 1), x2: fmt(X(b.x2), 1), y2: fmt(Y(b.y2), 1), stroke: 'transparent', 'stroke-width': fmt(Math.max(14, 13 * s), 1), class: 'ck-hit' });
        hit.addEventListener('click', (e) => {
          e.stopPropagation();
          sel = { type: 'bond', id: `${b.bond.a}-${b.bond.b}` };
          say(`bond selected; press the double-bond button or B to change it`);
          redraw();
        });
        molSvg.append(hit);
        if (sel.type === 'bond' && selectedBond() === b.bond) {
          molSvg.append(el('line', { x1: fmt(X(b.x1), 1), y1: fmt(Y(b.y1), 1), x2: fmt(X(b.x2), 1), y2: fmt(Y(b.y2), 1), stroke: C.leaf, 'stroke-width': fmt(Math.max(9, 8 * s), 1), 'stroke-linecap': 'round', opacity: 0.24 }));
        }
      }
    }
    for (const a of items.atoms) {
      const r = R(a.sym) * s;
      if (a.carbon && sel.type === 'carbon' && sel.id === a.carbon.id) {
        molSvg.append(el('circle', { cx: fmt(X(a.x), 1), cy: fmt(Y(a.y), 1), r: fmt(r + 5 * s, 1), fill: 'none', stroke: C.leaf, 'stroke-width': fmt(2.4 * s, 1) }));
      }
      molSvg.append(atom(X(a.x), Y(a.y), a.sym, r, { label: r >= 5.2 }));
      if (a.carbon) {
        const hit = el('circle', { cx: fmt(X(a.x), 1), cy: fmt(Y(a.y), 1), r: fmt(Math.max(13, r * 1.5), 1), class: 'ck-hit' });
        hit.dataset.carbon = String(a.carbon.id);
        hit.addEventListener('click', (e) => {
          e.stopPropagation();
          // The spec's rule: clicking a carbon grows the chain from it, and clicking the same carbon
          // again grows a second branch. Clicking a different one selects it first, so the reader can
          // aim before they build.
          if (sel.type === 'carbon' && sel.id === a.carbon.id) addCarbon(a.carbon.id);
          else {
            sel = { type: 'carbon', id: a.carbon.id };
            say('carbon selected; click it again to grow from it');
          }
          redraw();
        });
        molSvg.append(hit);
      }
    }
    // the scale this drawing is at, on the last line, at the right
    const barLen = L * s;
    molSvg.append(el('path', { d: `M${fmt(w - 12 - barLen, 1)} ${fmt(hgt - 8, 1)} L${fmt(w - 12, 1)} ${fmt(hgt - 8, 1)} M${fmt(w - 12 - barLen, 1)} ${fmt(hgt - 11, 1)} L${fmt(w - 12 - barLen, 1)} ${fmt(hgt - 5, 1)} M${fmt(w - 12, 1)} ${fmt(hgt - 11, 1)} L${fmt(w - 12, 1)} ${fmt(hgt - 5, 1)}`, stroke: C.faint, 'stroke-width': 1 }));
    const barLabel = w > 380 ? `${CC_BOND_PM} pm, one C–C bond` : `${CC_BOND_PM} pm`;
    molSvg.append(text(w - 16 - barLen, hgt - 5, barLabel, { anchor: 'end', class: 'ck-note', 'font-size': 9.4 }));
    // The bench's running commentary is what it says back to the reader, so it has a line of its own
    // above the scale bar rather than the twenty words the scale bar leaves, and it is set in the soft
    // ink at eleven point rather than in the footnote colour at nine and a half.
    if (message) {
      const size = narrow ? 10 : 11;
      const max = Math.floor((w - 14) / (size * 0.53));
      if (max > 12) molSvg.append(text(6, hgt - (narrow ? 19 : 21), message.length > max ? `${message.slice(0, max - 1)}…` : message, { class: 'ck-say', 'font-size': size }));
    }
    molSvg.append(focusMark(w, hgt));
  }

  // A name like '2-methylpropane (isobutane)' or 'butanoic acid, a short fatty acid' is two things: the
  // name, and what the name is also called. Set as one line it has to shrink to eight point; split, the
  // name keeps its size and the gloss sits under it in the quiet colour, which is what a book does.
  function splitName(str) {
    const i = str.indexOf(' (');
    if (i > 0) return [str.slice(0, i), str.slice(i + 1)];
    const j = str.indexOf(', ');
    if (j > 0) return [str.slice(0, j), str.slice(j + 2)];
    return [str, null];
  }
  // Inter's average advance over mixed-case text is about 0.53 em, close enough to pick a size that fits
  // a column without a measurement pass. Never below `min`: a name that cannot fit is set at the floor
  // and the column is wide enough that this has no case in the molecules the bench names.
  const sizeToFit = (str, maxWidth, max, min) => clamp(maxWidth / Math.max(1, str.length * 0.53), min, max);

  function drawReadout(w, hgt) {
    readSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    readSvg.replaceChildren();
    const d = describeBuild();
    // The column's own left edge, shared with the parts list under it so the two blocks hang on one line.
    const pad = 4;
    if (narrow) {
      // A name, a rule, and two lines: the stage has no room for a table, and the name is what the
      // reader is building towards, so it takes the heading and the formula sits out at the right.
      const ns = clamp(w * 0.045, 13.5, 18);
      const name = d.match ? splitName(d.match)[0] : null;
      let y = ns;
      if (name) {
        readSvg.append(text(pad, y, name, { class: 'ck-name', 'font-size': fmt(ns, 1) }));
        readSvg.append(text(w - pad, y, prettyFormula(d.formula), { anchor: 'end', class: 'ck-formula', 'font-size': fmt(ns - 2.5, 1) }));
      } else {
        readSvg.append(text(pad, y, prettyFormula(d.formula), { class: 'ck-formula', 'font-size': fmt(ns, 1) }));
        readSvg.append(text(w - pad, y, 'not a molecule the bench names', { anchor: 'end', class: 'ck-note', 'font-size': 9.6 }));
      }
      y += 5;
      readSvg.append(el('line', { x1: pad, y1: fmt(y, 1), x2: fmt(w - pad, 1), y2: fmt(y, 1), stroke: C.ruleStrong }));
      const line = (dy, str, cls, size, style) => readSvg.append(text(pad, y + dy, str, { class: cls, 'font-size': fmt(size, 1), style }));
      line(14.5, `${d.carbons} C · ${d.rings} ring${d.rings === 1 ? '' : 's'} · ${d.doubleBonds} double · ${d.freeBonds} H filled in`, 'mol-rt-val', 10.6);
      line(28, `${d.polar ? 'polar' : 'nonpolar'} · ${d.chargeAtCellPh} at cell pH · ${d.solubility} solubility`, 'mol-rt-key', 10.4);
      if (d.isomerOf) line(41, `same formula as ${d.isomerOf}`, undefined, 10.2, `fill:${INK.violet}`);
      return;
    }
    // The specimen label. The name the bench has reached is the answer to the whole exercise, so it is
    // the heading; the formula sits under it. With no name the formula takes the heading, because the
    // formula is the one thing there always is, and the line under it says so in words.
    const tw = w - pad * 2;
    let y = 5;
    if (d.match) {
      const [name, qual] = splitName(d.match);
      const ns = sizeToFit(name, tw, clamp(w * 0.082, 16, 21), 13);
      y += ns;
      readSvg.append(text(pad, y, name, { class: 'ck-name', 'font-size': fmt(ns, 1) }));
      if (qual) {
        y += 13;
        readSvg.append(text(pad, y, qual, { class: 'ck-qual', 'font-size': 10.6 }));
      }
      y += 18;
      readSvg.append(text(pad, y, prettyFormula(d.formula), { class: 'ck-formula', 'font-size': 15.5 }));
    } else {
      const fs = clamp(w * 0.1, 19, 27);
      y += fs;
      readSvg.append(text(pad, y, prettyFormula(d.formula), { class: 'ck-formula', 'font-size': fmt(fs, 1) }));
      y += 14;
      readSvg.append(text(pad, y, 'no molecule of this bench has this shape', { class: 'ck-note', 'font-size': 10.4 }));
    }

    const rows = [
      ['carbons', String(d.carbons)],
      ['rings', String(d.rings)],
      ['branch points', String(d.branchPoints)],
      ['double bonds', String(d.doubleBonds)],
      ['triple bonds', String(d.tripleBonds)],
      ['hydrogens filled in', String(d.freeBonds)],
      ['groups hung on', d.groups.length ? d.groups.map((g) => GROUPS[g].formula).join(' ') : 'none'],
      { head: 'In water' },
      ['polar', d.polar ? 'yes' : 'no'],
      ['charge at cell pH', d.chargeAtCellPh],
      ['solubility', d.solubility],
    ];
    // The two lines under the table are part of the block, so the table is solved for the room that is
    // left after them rather than stopping where it happens to stop.
    const footLines = (d.isomerOf ? 26 : 0) + 15;
    const opts = { title: 'What it is made of', size: 10.8, titleSize: 9.2, headSize: 9 };
    const { rowH, slack } = fitRows(rows, hgt - y - 16 - footLines, opts, 15, 26);
    // Slack is spent above and below the table, not left at the bottom: a block justified between the
    // specimen label and the foot reads as a considered column, a block that stops two thirds down
    // reads as a panel somebody forgot to finish.
    y += 16 + slack * 0.45;
    y = readoutTable(readSvg, rows, { ...opts, x: pad, y, width: tw, rowH, size: clamp(rowH * 0.5, 10, 11.6) });
    y += slack * 0.55;
    if (d.isomerOf) {
      y += 14;
      readSvg.append(text(pad, y, 'same formula, different molecule', { class: 'ck-note', 'font-size': 9.8 }));
      y += 12.5;
      readSvg.append(text(pad, y, d.isomerOf, { 'font-size': 11, style: `fill:${INK.violet}`, 'font-weight': 600 }));
    }
    y += 15;
    readSvg.append(text(pad, y, d.valid ? 'every carbon has four bonds' : 'a carbon is over its four bonds', {
      class: d.valid ? 'ck-note' : undefined, 'font-size': 9.8,
      style: d.valid ? undefined : `fill:${INK.coral}`, 'font-weight': d.valid ? undefined : 600,
    }));
  }

  // ---------------------------------------------------------------- DOM

  const wrap = h('div', { class: 'tb-carbonkit' });
  wrap.append(h('style', { text: CSS }));
  const molSvg = el('svg', { tabindex: '0', role: 'img', 'aria-label': 'A carbon skeleton on a bench. Arrow keys move the selection between carbons and bonds, Enter grows a carbon, the number keys 1 to 7 attach a functional group, R closes a ring, B changes a bond, Delete removes.' });
  const readSvg = el('svg', { 'aria-hidden': 'true' });
  const molPane = h('div', { class: 'ck-pane ck-mol' }, [molSvg]);
  const readPane = h('div', { class: 'ck-pane ck-read' }, [readSvg]);

  const twoLabels = (long, short) => [h('span', { class: 'ck-long', text: long }), h('span', { class: 'ck-short', text: short ?? long })];
  const button = (long, short, aria, onClick, cls = '') => {
    const node = h('button', { class: `fig-btn ${cls}`.trim(), type: 'button', 'aria-label': aria }, twoLabels(long, short));
    node.addEventListener('click', onClick);
    return node;
  };
  const act = (fn) => () => { fn(); redraw(); };
  const btnCarbon = button('+ Carbon', '+C', 'Add carbon, grow the skeleton from the selected carbon', act(() => addCarbon(sel.type === 'carbon' ? sel.id : carbons[0].id)), 'ck-primary');
  const btnRing = button('Close ring', 'Ring', 'Close ring, join the skeleton into a ring', act(closeRing));
  const btnBond = button('Bond ×2', '×2', 'Bond, cycle the selected bond through single, double and triple', act(cycleBond));
  const btnDelete = button('Delete', 'Del', 'Delete the selected atom or group', act(deleteSelected));
  const btnReset = button('Reset', 'Reset', 'Reset, start again from one carbon', act(() => { reset(); say('back to one carbon'); }));
  // Two groups on one rule: the three that make the molecule, then the two that unmake it. Five buttons
  // in an undifferentiated row is a list; grouped, the row says what the bench can do.
  const group = (kids) => h('div', { class: 'ck-group' }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnCarbon, btnRing, btnBond]),
    h('span', { class: 'ck-sep', 'aria-hidden': 'true' }),
    group([btnDelete, btnReset]),
  ]);

  const chips = GROUP_ORDER.map((kind) => {
    const g = GROUPS[kind];
    const node = h('button', {
      class: 'ck-chip fig-ui', type: 'button',
      'aria-label': `${g.formula} ${g.name}, attach it to the selected carbon`,
      title: `${g.name} — drag onto a carbon, or press ${g.key}`,
    }, [h('span', { text: g.formula }), h('span', { class: 'ck-chipname', text: g.name })]);
    node.addEventListener('click', () => {
      if (sel.type !== 'carbon') {
        say('select a carbon first, then press the group');
        redraw();
        return;
      }
      attachGroup(sel.id, kind);
      redraw();
    });
    // Dragging a chip onto a carbon does the same thing, which is the gesture the caption promises.
    node.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      let moved = false;
      node.classList.add('is-dragging');
      node.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) > 6) moved = true;
      };
      const up = (ev) => {
        node.classList.remove('is-dragging');
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
        if (!moved) return; // a plain click; the click handler deals with it
        ev.preventDefault();
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const id = target?.dataset?.carbon;
        if (id === undefined) {
          say('drop a group on a carbon');
        } else {
          attachGroup(Number(id), kind);
        }
        redraw();
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });
    return node;
  });
  // The parts list carries its own heading, because seven ruled rows beside a ruled table would
  // otherwise read as more of the table rather than as the things the reader builds with.
  const tray = h('div', { class: 'ck-tray fig-ui', role: 'group', 'aria-label': 'Functional groups: press one to attach it to the selected carbon, or drag it onto a carbon' }, [
    h('p', { class: 'ck-traytitle', 'aria-hidden': 'true', text: 'Groups to hang on' }),
    ...chips,
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(molPane, readPane, tray, toolbar, live);
  root.append(wrap);

  // ---- keyboard ----
  function selectionList() {
    return [...carbons.map((c) => ({ type: 'carbon', id: c.id })), ...cbonds.map((b) => ({ type: 'bond', id: `${b.a}-${b.b}` }))];
  }
  const onKey = (e) => {
    const list = selectionList();
    const i = list.findIndex((x) => x.type === sel.type && String(x.id) === String(sel.id));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      sel = list[(Math.max(0, i) + 1) % list.length];
      say(`${sel.type} selected`);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = list[(Math.max(0, i) - 1 + list.length) % list.length];
      say(`${sel.type} selected`);
    } else if (e.key === 'Enter' || e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      addCarbon(sel.type === 'carbon' ? sel.id : carbons[0].id);
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      closeRing();
    } else if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      cycleBond();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelected();
    } else if (/^[1-7]$/.test(e.key)) {
      e.preventDefault();
      if (sel.type !== 'carbon') say('select a carbon first');
      else attachGroup(sel.id, GROUP_ORDER[Number(e.key) - 1]);
    } else {
      return;
    }
    redraw();
  };
  molSvg.addEventListener('keydown', onKey);

  // ---------------------------------------------------------------- layout

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }
  function redraw() {
    const [mw, mh] = paneBox(molPane);
    const [rw, rh] = paneBox(readPane);
    drawMolecule(mw, mh);
    drawReadout(rw, rh);
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
    const tbH = Math.round(toolbar.getBoundingClientRect().height);
    // Wide, the parts list is a column in the grid and costs the stage nothing at the bottom; narrow, it
    // goes back to a wrapping row above the toolbar and the stage has to make room for it.
    const trayH = narrow ? Math.round(tray.getBoundingClientRect().height) : 0;
    const nextTray = tbH + 20;
    if (nextTray !== trayBottom) {
      trayBottom = nextTray;
      wrap.style.setProperty('--ck-traybottom', `${nextTray}px`);
    }
    const pad = tbH + trayH + (narrow ? 24 : 18);
    if (pad > 30 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--ck-pad', `${pad}px`);
    }
    return true;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    redraw();
    if (!ready) {
      ready = true;
      say('one carbon, four hydrogens: methane');
      ctx.onReady();
    }
  }

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  observer.observe(tray);
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) redraw(); });
  onResize();
  void ns;

  return {
    destroy() {
      destroyed = true;
      observer.disconnect();
      molSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    // No clock: the bench is a function of the build alone.
    setTime() {
      if (ready) redraw();
    },
    setVisible() {},
    setTheme() {
      if (ready) redraw();
    },
    describe() {
      const d = describeBuild();
      return {
        formula: d.formula,
        carbons: d.carbons,
        rings: d.rings,
        branchPoints: d.branchPoints,
        doubleBonds: d.doubleBonds,
        tripleBonds: d.tripleBonds,
        freeBonds: d.freeBonds,
        groups: d.groups,
        polar: d.polar,
        chargeAtCellPh: d.chargeAtCellPh,
        solubility: d.solubility,
        match: d.match,
        isomerOf: d.isomerOf,
        valid: d.valid,
        selected: sel.type === 'carbon' ? `carbon ${sel.id}` : `bond ${sel.id}`,
        layout: narrow ? 'narrow' : 'wide',
      };
    },
  };
}
