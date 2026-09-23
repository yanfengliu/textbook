// The molecule, split and accounted for.
//
// WHAT IS ON THE STAGE. One ATP molecule in three dimensions, large enough that the three phosphates are
// separately visible: adenine, ribose and the chain, with the negative charges drawn as billboarded bars
// and an overlay showing how hard those charges push on one another. Hydrolysing it detaches the outer
// phosphate, the remaining chain visibly relaxes, the freed ion's charge is drawn spread over its four
// equivalent oxygens, and shells of water close around both products. Beside the molecule is a ledger,
// set as a typographic table, of what breaking the bond cost and what each of the four things §5.3 names
// contributed, with a total.
//
// THE DEFAULT VIEW is theta 0.34, phi 1.30, distance 30. The phosphate chain is built along the world X
// axis and that view puts the chain ACROSS the screen at right angles to the camera, so the three
// phosphates are seen as three and their three charges as three. Turned a quarter turn the chain points
// at the reader and the three become one, which is the view this figure must not open in. 1 scene unit
// is 1 ångström and the molecule spans about 16.
//
// THE SECOND SCENE is the ladder: eight phosphate-carrying compounds ranked by what their hydrolysis
// releases, with ATP in the middle. The reader picks a donor and a target and the figure works out
// whether the transfer can happen and by how much, so §5.3's "takes from above, gives below" is a thing
// the reader tries rather than a sentence. THE MOST NEGATIVE IS AT THE TOP, which is the order §5.3's
// own table is printed in and the only order those four words are true in; drawLadder says why at
// length, and a later chapter that remounts this scene inherits the direction with it. `npm run drive`
// reads the drawn rail against that table, so the direction is a gate and not only this paragraph.
// UP ON THE CONTROLS IS UP ON THE RAIL: the Donor and Target ranges count rungs from the BOTTOM, so the
// button with the up arrow, ArrowUp and a drag to the right all move a marker toward phosphoenolpyruvate.
// And the verdict names the molecule a donor PHOSPHORYLATES, which is never the rung it makes: the
// phosphate goes onto ADP to make ATP, as §5.3 puts it, not onto ATP. See RUNGS and transferWords.
// CHAPTER 6 AND CHAPTER 7 ARE EXPECTED TO ASK FOR THE LADDER:
// it is reached by `scene: 'ladder'` alone, so a later chapter mounts this kind with a different opening
// scene instead of keeping a copy of it.
//
// THE LEDGER'S HONESTY, and this is the part that most needs saying. The TOTAL is measured: ATP
// hydrolysis releases 30.5 kJ/mol under standard conditions, and about 50 at the concentrations a cell
// holds (§5.3 works that arithmetic out and this figure reproduces it from the sliders). The FIVE LINES
// are an apportionment and not five measurements. §5.3 names four things that make the products more
// comfortable than the reactant — the crowded charges relieved, the freed phosphate spreading its charge
// over four equivalent oxygens, water holding both products better, and two molecules where there was
// one — and it does not weigh them, because no experiment separates them cleanly. The figure says so on
// the stage. What the ledger is FOR is the first line: breaking the bond COSTS energy and returns none,
// which is the misconception the section exists to remove, and a ledger whose first line is positive is
// the shortest way to say it.
//
// THE NUMBERS.
//   ΔG°′ = −30.5 kJ/mol (§5.3, the standard figure, biochemists' convention).
//   ΔG = ΔG°′ + RT ln([ADP][Pᵢ] ÷ [ATP]) with RT = 2.577 kJ/mol at 37 °C and concentrations in mol/L,
//   which at the cell's 5 / 0.5 / 5 mmol/L gives −30.5 − 19.6 = −50.1: §5.3's own arithmetic, and the
//   fifty §4.7 used. Setting all three sliders to one mole per litre brings ΔG back to ΔG°′, which is
//   what "standard" means and is worth finding.
//   The ladder is the standard free energy of hydrolysis of eight phosphate compounds; five of the eight
//   are in §5.3's own table and the other three are the usual textbook values.
//
// COMPOSITION. Three panes and two of them share a cell. The molecule is a canvas pane; the ladder is an
// SVG pane in the same cell, shown in its place; the ledger is a typographic table beside them. Below
// 700 px of stage the ledger moves UNDER the stage at full width rather than being inset over the
// molecule, which is what the brief asks and what a six-row table needs. In the LADDER scene at that
// width the ladder takes the whole stage and the ledger is not shown at all: eight rungs need more rail
// than half a phone's stage has, and the pane that cannot shrink here is the ladder, not the table. The
// rungs' names stay to the right of their rungs at both widths, and the donor and target words move to
// the right edge on a phone so they cannot land on the name above them. See applyPanes and drawLadder.
//
// WHAT THE BENCH DOES FOR THIS FIGURE, and the one thing it still does not. The ledger row, the donor
// and the target are STEPPERS: six and eight stops on a 4.4rem track is about ten pixels a stop, which
// is not a control a finger can place, so at a phone's width the track gives way to a pair of step
// buttons and the range stays underneath as the accessible control. The donor's and the target's
// buttons are ↑ and ↓, named "one rung up" and "one rung down", because on a ladder "+" says nothing
// about which way the marker goes — and it went the wrong way. The sentences under the table are
// given to `readout.note()` whole and wrapped there. The three overlay buttons are `b.toggle`s, so the
// bench keeps their aria-pressed rather than this file setting it after every change. The rules between
// the toolbar's groups look after themselves, because each one lives in the group it opens — in the
// ladder scene this figure used to show two rules with nothing between them and swept them up with a
// `tidyDividers()` of its own.
// What is still this file's: the clock and the redraw loop. A WebGL figure needs render-on-demand with a
// damped orbit, so it keeps `lib/three-common.js`'s `makeClock` and `createLoop` and takes only the
// bench's chrome — the panes, the toolbar, the readout and the live region. The handle it returns is the
// bench's, wrapped, so that destroy(), setTime() and setTheme() reach both. And a canvas pane still has
// no `focusMark()`, because the bench's is an SVG path; the canvas takes the keyboard through
// `bindInput` and shows its own focus ring from this file's CSS.
import { C, tint, clamp as clamp2 } from './lib/svg.js';
import { round, INK } from './lib/mol-draw.js';
import { ELEMENTS, atomColours, signed } from './lib/chem-atoms.js';
import { resolvePalette } from '../palette.js';
import {
  THREE, mergeGeometries, clamp, createRig, Orbit, Spin, makeClock, createLoop, Materials,
  bindInput, disposeScene,
} from './lib/three-common.js';
import { bench, wrapText } from './lib/bench.js';

export const meta = {
  kind: 'atp3d',
  title: 'The molecule, split and accounted for',
  needsWebGL: true,
  aspect: 16 / 10,
  narrowAspect: 1,
};

export // Distance 30, not the 24 the molecule's own width asks for. The chain is nineteen ångströms long, so
// at an end-on view the near half is magnified by half again and the molecule ran off the top of the
// pane — at one of the sweep's fourteen views and at none of the others. Two ångströms of margin either
// side of the default framing is what that costs.
const DEFAULT_VIEW = Object.freeze({ theta: 0.34, phi: 1.3, distance: 30 });
const ZOOM_MIN = 11;
const ZOOM_MAX = 60;
const SPIN_RATE = 0.16; // rad/s of idle turn, when the reader asks for it
const SPLIT_SECONDS = 0.7;

// ---------------------------------------------------------------- the numbers

const RT = 2.577; // kJ/mol at 37 C
const DG_STANDARD = -30.5;

// The apportionment. Its TOTAL is the measured standard value; the split is illustrative, and the stage
// says so in as many words. The first line is positive because breaking a bond always costs.
const LEDGER = [
  { id: 'bond', label: 'Breaking the bond to the phosphate', short: 'The bond', kj: 34.0, part: 'bridge' },
  { id: 'repulsion', label: 'Crowded charges relieved', short: 'Repulsion', kj: -24.0, part: 'charges' },
  { id: 'resonance', label: 'Charge spread over four oxygens', short: 'Spread', kj: -18.5, part: 'gamma' },
  { id: 'hydration', label: 'Water holds the products better', short: 'Water', kj: -14.0, part: 'water' },
  { id: 'entropy', label: 'Two molecules where there was one', short: 'Two, not one', kj: -8.0, part: 'both' },
];
const LEDGER_TOTAL = round(LEDGER.reduce((a, r) => a + r.kj, 0), 1); // -30.5, and a test of the table

// Standard free energy of hydrolysis, kJ/mol. The five in bold are §5.3's own table.
//
// `acceptor` is the rung without its phosphate: the molecule a donor PHOSPHORYLATES to make that rung.
// A transfer from donor to target is donor–P + acceptor → donor + target, which is why its free energy
// is the donor's number minus the target's. The verdict used to say "Phosphoenolpyruvate can
// phosphorylate ATP" and "ATP can phosphorylate Glucose 6-phosphate", putting the phosphate onto the
// thing it makes; §5.3 says a compound above ATP can "hand a phosphate to ADP and so make ATP".
const LADDER = [
  { id: 'pep', name: 'Phosphoenolpyruvate', short: 'PEP', kj: -61.9, acceptor: 'pyruvate' },
  { id: 'bpg', name: '1,3-bisphosphoglycerate', short: '1,3-BPG', kj: -49.4, acceptor: '3-phosphoglycerate' },
  { id: 'acetylp', name: 'Acetyl phosphate', short: 'Acetyl-P', kj: -43.1, acceptor: 'acetate' },
  { id: 'creatinep', name: 'Creatine phosphate', short: 'Creatine-P', kj: -43.0, acceptor: 'creatine' },
  { id: 'atp', name: 'ATP', short: 'ATP', kj: -30.5, currency: true, acceptor: 'ADP' },
  { id: 'g1p', name: 'Glucose 1-phosphate', short: 'Glucose 1-P', kj: -20.9, acceptor: 'glucose' },
  { id: 'f6p', name: 'Fructose 6-phosphate', short: 'Fructose 6-P', kj: -15.9, acceptor: 'fructose' },
  { id: 'g6p', name: 'Glucose 6-phosphate', short: 'Glucose 6-P', kj: -13.8, acceptor: 'glucose' },
];

// A rung's name inside a sentence: "glucose 6-phosphate", but "ATP" and "1,3-bisphosphoglycerate" as
// they are. The rail's own labels keep their capitals; they begin a line.
const inSentence = (name) => (/^[A-Z]{2}/.test(name) ? name : name.charAt(0).toLowerCase() + name.slice(1));

// What the transfer does, in §5.3's terms and with the phosphate going onto the right molecule.
// "can phosphorylate ADP and make ATP"; "cannot phosphorylate ADP to make ATP under standard
// conditions". The verdict under the rail and the sentence a screen reader hears are both built from
// this, so they cannot disagree.
// The "cannot" says UNDER STANDARD CONDITIONS because every number on this rail is a ΔG°′, and because
// naming the acceptor made the flat version false about cells. ATP phosphorylating creatine is how a
// resting muscle recharges §5.3's reserve, and §5.2 is the section that says a ΔG°′ a little above
// zero runs perfectly well when the concentrations are right.
// The "can" carries no such clause, and the two are not symmetrical. "Can" claims the transfer is
// possible, and a negative ΔG°′ shows that it is, in the standard state at least. "Cannot" claims it
// is impossible, and no ΔG°′ can show that for a cell. That holds even at acetyl phosphate to
// creatine, −0.1 kJ/mol, which a cell runs either way.
const transferWords = (target, possible) => (possible
  ? `can phosphorylate ${target.acceptor} and make ${inSentence(target.name)}`
  : `cannot phosphorylate ${target.acceptor} to make ${inSentence(target.name)} under standard conditions`);
// The general form of the "cannot", under the verdict on a phone and in the table beside the rail on a
// desktop. It carries the same clause for the same reason: flat, it contradicted the verdict above it.
const UPHILL_RULE = 'Under standard conditions a compound cannot hand a phosphate to anything above it.';

// THE DONOR AND TARGET CONTROLS COUNT RUNGS FROM THE BOTTOM. A range input's value goes UP with
// ArrowUp, with PageUp, with a drag to the right and with the stepper's up button, and the rail's up is
// the top of the stage, where phosphoenolpyruvate is. Until 2026-09-23 the value was the rung's place
// in LADDER, counted from the top, so every one of those moved the marker one rung DOWN the rail —
// including a button a screen reader announced as "Donor, step up". `height` is the value the control
// holds and `LADDER` index is what the figure means by it; these two functions are the only place the
// two meet. `npm run drive` presses ArrowUp and the up button and reads where the marker was drawn.
const RUNGS = LADDER.length;
const heightOf = (index) => RUNGS - 1 - index;
const atHeight = (value) => RUNGS - 1 - Number(value);
const RUNG_STEPS = Object.freeze({
  down: { glyph: '↓', name: 'one rung down' },
  up: { glyph: '↑', name: 'one rung up' },
});
// What a screen reader says for the value: the compound and where it stands, rather than a bare index.
const rungText = (value) => {
  const i = atHeight(value);
  return `${LADDER[i].name}, rung ${i + 1} of ${RUNGS} from the top`;
};

const START_MM = { atpMM: 5, adpMM: 0.5, phosphateMM: 5 };

// deltaG at the given millimolar concentrations. mol/L, because that is the unit the logarithm's
// standard state is in.
function deltaG(atpMM, adpMM, phosphateMM) {
  const atp = Math.max(1e-4, atpMM) / 1000;
  const adp = Math.max(1e-4, adpMM) / 1000;
  const pi = Math.max(1e-4, phosphateMM) / 1000;
  return DG_STANDARD + RT * Math.log((adp * pi) / atp);
}

// ---------------------------------------------------------------- the molecule's geometry
//
// Ball and stick at a tenth of a nanometre to the unit. Radii are 0.32 of the van der Waals radius from
// the one element table, which is the usual ball-and-stick proportion and keeps a phosphorus visibly
// larger than an oxygen; bonds are cylinders of a fixed radius. Nothing here is a downloaded model.

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const BALL = (sym) => (ELEMENTS[sym].vdw / 100) * 0.32;
const STICK = 0.13;

// A regular polygon of `n` vertices with side `side`, in the plane through `origin` spanned by u and v.
function ring(n, side, origin, u, v, phase = 0) {
  const R = side / (2 * Math.sin(Math.PI / n));
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const a = phase + (i / n) * Math.PI * 2;
    out.push(origin.clone().addScaledVector(u, R * Math.cos(a)).addScaledVector(v, R * Math.sin(a)));
  }
  return out;
}

// The whole molecule, as a list of atoms and a list of bonds, each tagged with the part it belongs to.
// The phosphate chain runs along +X so that the default view sees the three phosphates as three.
function buildAtp() {
  const atoms = [];
  const bonds = [];
  const at = (part, sym, p) => { atoms.push({ part, sym, p }); return atoms.length - 1; };
  const bond = (part, a, b, order = 1) => bonds.push({ part, a, b, order });

  // Adenine: a six-ring fused to a five-ring, lying in the x–z plane at the far end of the molecule.
  const X = V(1, 0, 0);
  const Z = V(0, 0, 1);
  const six = ring(6, 1.39, V(-7.4, 0.35, 0), X, Z, Math.PI / 6);
  const sixSym = ['N', 'C', 'N', 'C', 'C', 'C'];
  const sixIdx = six.map((p, i) => at('adenine', sixSym[i], p));
  for (let i = 0; i < 6; i += 1) bond('adenine', sixIdx[i], sixIdx[(i + 1) % 6], i % 2 ? 2 : 1);
  // The five-ring shares the edge between the two carbons at 3 and 4.
  const a1 = six[3];
  const a2 = six[4];
  const mid = a1.clone().add(a2).multiplyScalar(0.5);
  const edge = a2.clone().sub(a1).normalize();
  const outward = mid.clone().sub(V(-7.4, 0.35, 0)).normalize();
  const R5 = 1.39 / (2 * Math.sin(Math.PI / 5));
  const c5 = mid.clone().addScaledVector(outward, Math.sqrt(Math.max(0, R5 * R5 - 1.39 * 1.39 / 4)));
  const base = a1.clone().sub(c5);
  const ang0 = Math.atan2(base.dot(edge.clone().cross(outward.clone().cross(edge)).normalize()), base.dot(edge));
  const five = [];
  const u = edge;
  const v = outward;
  for (let i = 1; i <= 3; i += 1) {
    const a = ang0 - (i / 5) * Math.PI * 2;
    five.push(c5.clone().addScaledVector(u, R5 * Math.cos(a)).addScaledVector(v, R5 * Math.sin(a)));
  }
  const fiveIdx = [at('adenine', 'N', five[0]), at('adenine', 'C', five[1]), at('adenine', 'N', five[2])];
  bond('adenine', sixIdx[3], fiveIdx[0], 1);
  bond('adenine', fiveIdx[0], fiveIdx[1], 2);
  bond('adenine', fiveIdx[1], fiveIdx[2], 1);
  bond('adenine', fiveIdx[2], sixIdx[4], 1);
  // The amino group that makes it adenine rather than purine.
  const aminoAt = six[5].clone().addScaledVector(six[5].clone().sub(V(-7.4, 0.35, 0)).normalize(), 1.34);
  bond('adenine', sixIdx[5], at('adenine', 'N', aminoAt), 1);

  // Ribose: a five-ring tilted out of the adenine plane and joined to it at N9 (fiveIdx[2]).
  const n9 = five[2];
  const glyco = V(0.86, -0.28, 0.42).normalize();
  const riboCentre = n9.clone().addScaledVector(glyco, 1.47 + 1.2);
  const ru = V(0.2, 0.9, -0.38).normalize();
  const rv = glyco.clone().cross(ru).normalize();
  const rib = ring(5, 1.5, riboCentre, ru, rv, 1.9);
  const ribSym = ['C', 'C', 'C', 'C', 'O'];
  const ribIdx = rib.map((p, i) => at('ribose', ribSym[i], p));
  for (let i = 0; i < 5; i += 1) bond('ribose', ribIdx[i], ribIdx[(i + 1) % 5], 1);
  bond('ribose', fiveIdx[2], ribIdx[0], 1);
  // Two hydroxyls, so the sugar reads as a sugar.
  for (const i of [2, 3]) {
    const outw = rib[i].clone().sub(riboCentre).normalize();
    bond('ribose', ribIdx[i], at('ribose', 'O', rib[i].clone().addScaledVector(outw, 1.43)), 1);
  }

  // C5', then the chain: O5' - Pa - O - Pb - O - Pg, walking along +X with a small zig-zag so the chain
  // reads as a chain rather than a rod.
  const c4 = rib[1];
  const c5p = c4.clone().add(V(1.35, 0.5, -0.2));
  const c5Idx = at('ribose', 'C', c5p);
  bond('ribose', ribIdx[1], c5Idx, 1);

  let from = c5p;
  let fromIdx = c5Idx;
  let fromPart = 'ribose';
  const phosphates = [];
  const names = ['alpha', 'beta', 'gamma'];
  for (let k = 0; k < 3; k += 1) {
    const part = names[k];
    const zig = (k % 2 ? -1 : 1) * 0.55;
    const bridgeAt = from.clone().add(V(1.5, zig * 0.35, zig * 0.5));
    const bridgeIdx = at(k === 0 ? 'ribose' : names[k - 1], 'O', bridgeAt);
    bond(k === 0 ? 'bridge0' : `bridge${k}`, fromIdx, bridgeIdx, 1);
    const pAt = bridgeAt.clone().add(V(1.55, -zig * 0.35, -zig * 0.45));
    const pIdx = at(part, 'P', pAt);
    bond(k === 2 ? 'bridge' : `bridge${k + 1}`, bridgeIdx, pIdx, 1);
    // The oxygens round the phosphorus, placed so that the default view sees them ABOVE and BELOW the
    // chain rather than one in front of the other: two charged oxygens at the same screen position read
    // as one charge, and the whole point of this molecule is that there are four of them.
    const up = V(0, 1, 0);
    const side = V(0, 0, 1);
    const oUp = pAt.clone().addScaledVector(up, 1.46).addScaledVector(side, 0.2);
    const oDown = pAt.clone().addScaledVector(up, -1.3).addScaledVector(side, 0.7);
    const oi = [at(part, 'O', oUp), at(part, 'O', oDown)];
    bond(part, pIdx, oi[0], 2);
    bond(part, pIdx, oi[1], 1);
    // The terminal phosphate has a third: it is the end of the chain, not a link in it, and once it is
    // free its charge is spread over all four of its oxygens.
    let extra = null;
    if (k === 2) {
      extra = at(part, 'O', pAt.clone().addScaledVector(up, -0.15).addScaledVector(side, -1.45));
      bond(part, pIdx, extra, 1);
    }
    // ATP carries four negative charges at pH 7: one on the alpha phosphate, one on the beta, two on
    // the gamma. They are drawn where they are, not spread evenly for the look of it.
    const charged = k === 2 ? [oi[1], extra] : [oi[1]];
    phosphates.push({ part, pIdx, pAt, charged, capped: oi[0], bridgeIdx });
    from = pAt;
    fromIdx = pIdx;
    fromPart = part;
  }
  void fromPart;
  return { atoms, bonds, phosphates };
}

// ---------------------------------------------------------------- style

const NARROW_W = 700;

const CSS = (scope) => `
${scope} .tb-pane-scene canvas { outline: none; touch-action: pan-y; cursor: grab; user-select: none; -webkit-user-select: none; }
${scope} .tb-pane-scene canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
${scope} .at-head { fill: var(--ink-faint); font-weight: 600; }
${scope} .at-name { fill: var(--ink); font-weight: 600; }
${scope} .at-note { fill: var(--ink-faint); }
${scope} .at-num { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
`;

const n1 = (v) => Number(v).toFixed(1);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the ATP molecule could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { error: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 20260917 });
  const fit = b.fit;

  const START = {
    scene: 'molecule', hydrolysed: false, repulsionShown: false, hydrationShown: false,
    ledgerOpen: true, ledgerRowIndex: 0, donorIndex: 0, targetIndex: 4, ...START_MM,
  };
  let s = { ...START };
  let split = 0; // 0 intact, 1 fully hydrolysed
  let splitGoal = 0;
  let theme = ctx.theme;
  let palette = resolvePalette(theme);

  const clock = makeClock(ctx.pinnedTime);
  let tOrigin = clock.now();
  const ledgerRow = () => (s.ledgerRowIndex > 0 ? LEDGER[s.ledgerRowIndex - 1] : null);

  // ---- panes ----
  const scenePane = b.pane('scene', {
    as: 'canvas',
    // The one surface npm run sweep3d measures. Without this mark the gate's bare frame would hide this
    // canvas along with the chrome and read the figure as blank; with it, the ledger beside it — six
    // rows of a typographic table over a third of a phone's stage — is hidden instead of being measured
    // as if it were the render, which is what it was before 2026-09-17 (docs/learning/gate-proofs.md).
    gl: true,
    focus: true,
    aria: 'One ATP molecule in three dimensions. Drag or use the arrow keys to turn it, plus and minus to zoom, H to hydrolyse it and J to put it back together.',
  });
  const ladderPane = b.pane('ladder', { as: 'svg' });
  const ledgerPane = b.pane('ledger', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 64fr) minmax(0, 36fr)',
      rows: 'minmax(0, 1fr)',
      at: { scene: [1, 1], ladder: [1, 1], ledger: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      // Nearly half the stage to a six-row table, because the table is what this figure is: the ledger
      // cannot shrink and does not try, and a 342 px square stage with a four-row toolbar leaves under
      // two hundred pixels for both panes together.
      //
      // The two rows are written as variables because one of the two scenes cannot live in them, and
      // applyPanes() sets them: 45/55 in the molecule scene, and the whole stage to the ladder in its
      // own scene, where the ledger is not shown at all. applyPanes says why.
      rows: 'minmax(0, var(--at-row1, 45fr)) minmax(0, var(--at-row2, 55fr))',
      rowGap: 'var(--at-rowgap, var(--space-2))',
      at: { scene: [1, 1], ladder: [1, 1], ledger: [1, 2] },
    },
  });

  // ---- the scene ----
  const canvas = scenePane.node;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const three = new THREE.Scene();
  // The molecule is a flat ribbon about nineteen angstroms long. Laid flat along the screen's x axis it
  // leaves the top and the bottom of a nearly-square pane empty, which is the composition failure this
  // chapter's brief opens with; tilted, the same ribbon uses the pane's height as well as its width and
  // the three phosphates are still seen as three.
  const molGroup = new THREE.Group();
  // 0.34 radians, not the 0.45 the default framing would prefer: the tilt is also the molecule's
  // projected length when the camera looks down the chain, and at 0.45 the terminal phosphate ran off
  // the top of the pane at the sweep's theta = π/2, phi = 2.3 view.
  molGroup.rotation.z = 0.34;
  molGroup.rotation.x = 0.12;
  three.add(molGroup);
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.5, 400);
  const rig = createRig(three, camera, theme);
  const mats = new Materials(palette.paper);
  const orbit = new Orbit(DEFAULT_VIEW, ZOOM_MIN, ZOOM_MAX);
  const spin = new Spin(reduced ? 0 : SPIN_RATE);

  const model = buildAtp();
  // Centre the molecule on the origin the camera looks at. Built as it is, its adenine end sits at about
  // x = -9 and its terminal oxygens at about x = +9.5, and that half-ångström of asymmetry was enough to
  // run the adenine off the left edge of the pane at one of the sweep's fourteen views and not at the
  // others — which is exactly the shape of defect a single framing hides.
  {
    const lo = model.atoms.reduce((acc, a) => acc.min(a.p), V(1e9, 1e9, 1e9));
    const hi = model.atoms.reduce((acc, a) => acc.max(a.p), V(-1e9, -1e9, -1e9));
    const centre = lo.clone().add(hi).multiplyScalar(0.5);
    for (const a of model.atoms) a.p.sub(centre);
    for (const ph of model.phosphates) ph.pAt.sub(centre);
  }
  // One material per element per part, so a ledger row can dim everything that is not its own subject.
  const byPart = new Map();
  const partOf = (name) => {
    if (!byPart.has(name)) byPart.set(name, { materials: [], meshes: [], dim: 0, dimGoal: 0 });
    return byPart.get(name);
  };
  const elementMaterial = (part, sym) => {
    const m = mats.make({ color: atomColours(palette, sym).fill, roughness: 0.42, metalness: 0.02 });
    m.userData.sym = sym;
    partOf(part).materials.push(m);
    return m;
  };
  const addMesh = (part, geometry, material, name) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    molGroup.add(mesh);
    partOf(part).meshes.push(mesh);
    return mesh;
  };

  // Atoms, merged per (part, element) so the whole molecule is a handful of draw calls.
  const groups = new Map();
  model.atoms.forEach((a, i) => {
    const key = `${a.part}|${a.sym}`;
    if (!groups.has(key)) groups.set(key, []);
    const g = new THREE.SphereGeometry(BALL(a.sym), 22, 16);
    g.translate(a.p.x, a.p.y, a.p.z);
    g.deleteAttribute('uv');
    groups.get(key).push(g);
    void i;
  });
  for (const [key, list] of groups) {
    const [part, sym] = key.split('|');
    addMesh(part, mergeGeometries(list), elementMaterial(part, sym), `${part}-${sym}`);
  }

  // Bonds as cylinders, in the ink so a bond is never mistaken for an atom.
  const bondMatFor = (part) => {
    const m = mats.make({ color: palette.inkSoft, roughness: 0.55, metalness: 0 });
    partOf(part).materials.push(m);
    m.userData.bond = true;
    return m;
  };
  const bondGroups = new Map();
  for (const bd of model.bonds) {
    const a = model.atoms[bd.a].p;
    const c = model.atoms[bd.b].p;
    const part = bd.part.startsWith('bridge') ? bd.part : bd.part;
    if (!bondGroups.has(part)) bondGroups.set(part, []);
    const dir = c.clone().sub(a);
    const len = dir.length();
    const offsets = bd.order === 2 ? [-0.16, 0.16] : [0];
    const perp = Math.abs(dir.y) > 0.9 * len ? V(1, 0, 0) : V(0, 1, 0);
    const side = dir.clone().cross(perp).normalize();
    for (const off of offsets) {
      const g = new THREE.CylinderGeometry(bd.order === 2 ? STICK * 0.7 : STICK, bd.order === 2 ? STICK * 0.7 : STICK, len, 12, 1, true);
      g.deleteAttribute('uv');
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
      g.applyMatrix4(new THREE.Matrix4().compose(a.clone().addScaledVector(dir, 0.5).addScaledVector(side, off), q, V(1, 1, 1)));
      bondGroups.get(part).push(g);
    }
  }
  for (const [part, list] of bondGroups) addMesh(part, mergeGeometries(list), bondMatFor(part), `${part}-bonds`);

  // The negative charges, as flat bars that turn to face the camera every frame. A minus sign has to be
  // read as a minus sign from every angle, and a glyph painted on a sphere cannot be.
  const chargeMat = mats.make({ color: palette.ink, roughness: 0.6, metalness: 0 });
  partOf('charges').materials.push(chargeMat);
  const chargeBars = [];
  function addCharge(position, part) {
    const g = new THREE.BoxGeometry(0.78, 0.22, 0.06);
    g.deleteAttribute('uv');
    const mesh = new THREE.Mesh(g, chargeMat);
    mesh.position.copy(position);
    mesh.name = `charge-${part}`;
    molGroup.add(mesh);
    partOf(part).meshes.push(mesh);
    chargeBars.push({ mesh, home: position.clone(), part });
    return mesh;
  }
  for (const ph of model.phosphates) {
    for (const oi of ph.charged) {
      const p = model.atoms[oi].p;
      addCharge(p.clone().addScaledVector(p.clone().sub(model.atoms[ph.pIdx].p).normalize(), 0.62), ph.part);
    }
  }
  const gamma = model.phosphates[2];

  // The oxygen the freed phosphate takes from water. Water cleaves the Pγ–O bond so that the BRIDGING
  // oxygen stays on the β phosphate — it becomes ADP's own terminal oxygen — and the phosphate picks up
  // an OH in its place. So while the molecule is intact this atom is not there at all (the bridging
  // oxygen is standing in that spot), and it appears with the split, which is what makes the freed ion's
  // four oxygens four.
  const waterOxygen = (() => {
    const toBridge = model.atoms[gamma.bridgeIdx].p.clone().sub(gamma.pAt).normalize();
    const at = gamma.pAt.clone().addScaledVector(toBridge, 1.52);
    const ball = new THREE.SphereGeometry(BALL('O'), 22, 16);
    ball.translate(at.x, at.y, at.z);
    ball.deleteAttribute('uv');
    const mesh = addMesh('gamma', ball, elementMaterial('gamma', 'O'), 'gamma-water-oxygen');
    mesh.visible = false;
    const stick = new THREE.CylinderGeometry(STICK, STICK, 1.52, 12, 1, true);
    stick.deleteAttribute('uv');
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), toBridge);
    stick.applyMatrix4(new THREE.Matrix4().compose(gamma.pAt.clone().addScaledVector(toBridge, 0.76), q, V(1, 1, 1)));
    const bondMesh = addMesh('gamma', stick, bondMatFor('gamma'), 'gamma-water-bond');
    bondMesh.visible = false;
    return { mesh, bondMesh, at };
  })();

  // The freed phosphate's four equivalent oxygens: two more bars, shown only once it is free, so the
  // charge is seen to SPREAD over four rather than to move with two.
  const spreadBars = [];
  for (const p of [model.atoms[gamma.capped].p, waterOxygen.at]) {
    const bar = addCharge(p.clone().addScaledVector(p.clone().sub(gamma.pAt).normalize(), 0.62), 'gamma');
    bar.visible = false;
    spreadBars.push(bar);
  }

  // The repulsion overlay: a rod between each pair of like charges, thicker the harder they push. The
  // thickness is 1/r² against the intact molecule's own closest pair, so a reader watching it slacken as
  // the chain comes apart is watching the same quantity.
  const repulsionMat = mats.make({ color: palette.coral, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.72 });
  partOf('charges').materials.push(repulsionMat);
  const repulsionRods = [];
  {
    const centres = model.phosphates.map((ph) => ph.pAt.clone());
    for (let i = 0; i < centres.length; i += 1) {
      for (let j = i + 1; j < centres.length; j += 1) {
        const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true);
        g.deleteAttribute('uv');
        const mesh = new THREE.Mesh(g, repulsionMat);
        mesh.name = `repulsion-${i}${j}`;
        mesh.visible = false;
        molGroup.add(mesh);
        repulsionRods.push({ mesh, i, j });
      }
    }
  }

  // The hydration shells: small water oxygens on a sphere around each product, so "water holds the
  // products better" is a thing on the stage and not a phrase in a table.
  const waterMat = mats.make({ color: atomColours(palette, 'O').fill, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.55 });
  partOf('water').materials.push(waterMat);
  const shells = [];
  function makeShell(centre, radius, count, seedBase) {
    const geoms = [];
    for (let i = 0; i < count; i += 1) {
      // A Fibonacci sphere: even coverage with no random numbers at all, so a frame at t is the same
      // frame every run without needing a generator.
      const y = 1 - (2 * (i + 0.5)) / count;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const a = Math.PI * (3 - Math.sqrt(5)) * (i + seedBase);
      const g = new THREE.SphereGeometry(0.34, 10, 8);
      g.deleteAttribute('uv');
      g.translate(centre.x + radius * r * Math.cos(a), centre.y + radius * y, centre.z + radius * r * Math.sin(a));
      geoms.push(g);
    }
    const mesh = new THREE.Mesh(mergeGeometries(geoms), waterMat);
    mesh.visible = false;
    molGroup.add(mesh);
    partOf('water').meshes.push(mesh);
    shells.push(mesh);
    return mesh;
  }
  {
    const adpCentre = model.phosphates[0].pAt.clone().addScaledVector(V(-1, 0, 0), 2.4);
    makeShell(adpCentre, 5.4, 18, 0);
    makeShell(gamma.pAt.clone(), 3.1, 12, 0.5);
  }

  // The parts that move when the molecule is split: the gamma phosphate, its own charges and its shell.
  const gammaMeshes = () => [...partOf('gamma').meshes];

  // ---- input ----
  // How far back the camera has to stand for this pane. The stage is nearly square at desktop width and
  // a wide shallow strip on a phone, and a fixed distance that frames the molecule in the first frames
  // it as a sliver in the second. HEIGHT and WIDTH are asked separately and the larger wins: 23 Å of
  // width is the molecule plus two of margin either side, which is what the end-on views need.
  const VFOV = (35 * Math.PI) / 180;
  function fitDistance(box) {
    const aspect = Math.max(0.2, box.w / Math.max(1, box.h));
    const byHeight = 12.5 / (2 * Math.tan(VFOV / 2));
    const byWidth = 24.5 / (2 * Math.tan(VFOV / 2) * aspect);
    return clamp(Math.max(byHeight, byWidth), ZOOM_MIN, ZOOM_MAX);
  }
  const homeView = () => ({ ...DEFAULT_VIEW, distance: fitDistance(scenePane.box) });
  let userZoomed = false;

  bindInput(canvas, {
    onDrag(dx, dy) { spin.fold(orbit, clock.now()); orbit.drag(dx, dy); loop.invalidate(); },
    onZoom(f) { userZoomed = true; spin.fold(orbit, clock.now()); orbit.zoom(f); loop.invalidate(); },
    onClick() {},
    onEscape() { setRow(0); },
  });
  canvas.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'h') { setHydrolysed(true); e.preventDefault(); } else if (key === 'j') { setHydrolysed(false); e.preventDefault(); }
  });

  // ---- controls ----
  const pickScene = b.choice('Scene', [
    { id: 'molecule', label: 'Molecule', aria: 'Molecule, the ATP molecule in three dimensions' },
    { id: 'ladder', label: 'Ladder', aria: 'Ladder, eight phosphate compounds ranked by what they release' },
  ], (id) => { s.scene = id; applyPanes(); showControls(); draw(); b.announce(); }, { value: START.scene, segmented: true });
  b.divide();

  const btnHydrolyse = b.action('Hydrolyse', () => setHydrolysed(true), { aria: 'Hydrolyse, take the outer phosphate off with water', primary: true });
  const btnRejoin = b.action('Rejoin', () => setHydrolysed(false), { aria: 'Rejoin, put the phosphate back on and pay for it' });
  b.divide();

  const btnRepulsion = b.toggle('Repulsion', (on) => {
    s.repulsionShown = on;
    draw();
    b.announce();
  }, { aria: 'Repulsion, show how hard the three charges push on one another', pressed: false });
  const btnHydration = b.toggle('Hydration', (on) => {
    s.hydrationShown = on;
    draw();
    b.announce();
  }, { aria: 'Hydration, show the water closing round the products', pressed: false });
  const btnLedger = b.toggle('Ledger', (on) => {
    s.ledgerOpen = on;
    if (!on) setRow(0);
    showControls();
    draw();
    b.announce();
  }, { aria: 'Ledger, open the account of what breaking the bond costs and what pays for it', pressed: true });
  b.divide();

  // Six stops, and on a phone they were six stops of a 4.4rem track: about eleven pixels each, chosen
  // with a fingertip about forty across. The range is still the control at desktop width and still what
  // the recipe addresses by role and name; at a phone's width it is a pair of step buttons.
  const rowSlider = b.stepper('Row', {
    min: 0, max: LEDGER.length, step: 1, value: 0,
    format: (v) => (Number(v) === 0 ? 'none' : LEDGER[Number(v) - 1].short),
    onInput: (v) => setRow(Number(v)),
  });
  // Short labels, and they are the prose's own: §5.3 writes Pᵢ for a free inorganic phosphate. A
  // slider's label is one word at both widths (the bench has no second form for it), and "Phosphate"
  // made the three sliders take three rows of a phone's toolbar instead of two — which on a 342 px
  // square stage is a tenth of everything there is.
  const mmSliders = [
    ['atpMM', 'ATP'],
    ['adpMM', 'ADP'],
    ['phosphateMM', 'Pᵢ'],
  ].map(([key, label]) => b.slider(label, {
    // No `unit` beside a `format`: the format owns the whole value, and a unit passed with one was
    // silently dropped. The ledger below prints "mmol/L" against all three.
    min: 0.1, max: 1000, step: 0.1, value: START[key],
    format: (v) => (Number(v) >= 100 ? `${Math.round(Number(v))}` : Number(v).toFixed(1)),
    onInput: (v) => { s[key] = Number(v); draw(); b.announce(); },
  }));
  // Valued by height on the rail, so that up is up: see RUNGS above.
  const donorSlider = b.stepper('Donor', {
    min: 0, max: RUNGS - 1, step: 1, value: heightOf(START.donorIndex),
    format: (v) => LADDER[atHeight(v)].short,
    steps: RUNG_STEPS, valueText: rungText,
    onInput: (v) => { s.donorIndex = atHeight(v); draw(); b.announce(); },
  });
  const targetSlider = b.stepper('Target', {
    min: 0, max: RUNGS - 1, step: 1, value: heightOf(START.targetIndex),
    format: (v) => LADDER[atHeight(v)].short,
    steps: RUNG_STEPS, valueText: rungText,
    onInput: (v) => { s.targetIndex = atHeight(v); draw(); b.announce(); },
  });
  // ↑ and ↓ are wider than + and −, and at first the buttons were sized by their glyph. On a 320 px phone
  // that pushed these two steppers onto separate toolbar rows. The step button's width is now the
  // bench's to keep, whatever the glyph: see `.tb-step` in components.css.
  b.divide();

  const runCtl = b.run({ primary: false, runLabel: 'Turn', pauseLabel: 'Stop', aria: 'Turn, let the molecule turn slowly on its own', onChange: (on) => { if (on) spin.release(clock.now()); else spin.hold(orbit, clock.now()); loop.invalidate(); draw(); b.announce(); } });
  b.action('Reset view', () => {
    spin.fold(orbit, clock.now());
    userZoomed = false;
    if (reduced || clock.pinned) orbit.set(homeView());
    else Object.assign(orbit.goal, homeView());
    loop.invalidate();
  }, { short: 'Reset view', aria: 'Reset view, put the camera back where it started' });
  b.action('Reset', () => reset(), { aria: 'Reset, put the whole figure back as it started' });

  spin.hold(orbit, clock.now()); // it opens still: the reader turns it, or asks for the slow turn

  // Which controls belong to this scene. The rules between the groups look after themselves: the bench
  // puts each rule inside the group it opens, so a group whose controls are all hidden takes its rule
  // with it — which is what this figure used to sweep up afterwards with a `tidyDividers()` of its own,
  // in the ladder scene, where it had shown two rules with nothing between them.
  function showControls() {
    const molecule = s.scene === 'molecule';
    for (const node of [btnHydrolyse, btnRejoin, btnRepulsion.node, btnHydration.node, btnLedger.node]) node.style.display = molecule ? '' : 'none';
    for (const sl of mmSliders) sl.node.style.display = molecule ? '' : 'none';
    rowSlider.node.style.display = molecule && s.ledgerOpen ? '' : 'none';
    donorSlider.node.style.display = molecule ? 'none' : '';
    targetSlider.node.style.display = molecule ? 'none' : '';
  }
  // Which panes are on the stage, and how the narrow grid is divided between the two that remain.
  //
  // THE LADDER TAKES THE WHOLE STAGE AT A PHONE'S WIDTH, and the ledger is not shown beside it. Eight
  // rungs carry eight numbers, and two numbers a tenth of a kilojoule apart print on top of each other,
  // so drawLadder spreads them by 1.35 of the type size before a single name is set: at the old 8.4 px
  // floor that is 91 px of rail, and the 45fr row of a 342 px stage under this scene's toolbar is about
  // ninety. It did not fit, and nothing said so — the rungs, their names, the axis figures and the
  // verdict were all drawn seventeen pixels down into the ledger's own rows, in both themes, one press
  // from the opening state (`npm run narrow`, 2026-09-17: `the pane "ladder" is drawn over the pane
  // "ledger", 245x17 px of overlap`). What the ledger said there the ladder now says itself: the donor
  // and the target are marked on their own rungs, and the lines under the rail carry the transfer's
  // number and the rule that decides it.
  let ladderOnly = false;
  function applyPanes() {
    ladderOnly = s.scene === 'ladder' && b.narrow === true;
    scenePane.el.style.display = s.scene === 'molecule' ? '' : 'none';
    ladderPane.el.style.display = s.scene === 'ladder' ? '' : 'none';
    ledgerPane.el.style.display = ladderOnly ? 'none' : '';
    b.setVar('--at-row1', ladderOnly ? '1fr' : '45fr');
    b.setVar('--at-row2', ladderOnly ? '0px' : '55fr');
    b.setVar('--at-rowgap', ladderOnly ? '0px' : 'var(--space-2)');
    b.remeasure();
  }
  // The stage crossed this figure's own threshold, so which panes the current scene wants has changed
  // with it. onLayout runs before the bench applies the grid, which is where those variables are read.
  b.onLayout(() => applyPanes());
  showControls();
  applyPanes();

  // ---- reader actions ----
  function setHydrolysed(on) {
    if (s.scene !== 'molecule') return;
    s.hydrolysed = on;
    splitGoal = on ? 1 : 0;
    btnHydrolyse.setAttribute('aria-pressed', String(on));
    if (reduced || clock.pinned) split = splitGoal;
    loop.kick();
    loop.invalidate();
    draw();
    b.announce();
  }
  function setRow(i) {
    s.ledgerRowIndex = i;
    if (i > 0 && !s.ledgerOpen) {
      s.ledgerOpen = true;
      btnLedger.set(true, { quiet: true });
      showControls();
    }
    // A row that is about an overlay turns the overlay on, because a row the reader cannot see drawn is
    // a row of type pretending to be a figure.
    const row = ledgerRow();
    if (row?.id === 'repulsion') { s.repulsionShown = true; btnRepulsion.set(true, { quiet: true }); }
    if (row?.id === 'hydration') { s.hydrationShown = true; btnHydration.set(true, { quiet: true }); }
    applyDim();
    loop.invalidate();
    draw();
    b.announce();
  }
  function reset() {
    s = { ...START };
    split = 0;
    splitGoal = 0;
    pickScene.set(START.scene, { quiet: true });
    btnHydrolyse.setAttribute('aria-pressed', 'false');
    btnRepulsion.set(false, { quiet: true });
    btnHydration.set(false, { quiet: true });
    btnLedger.set(START.ledgerOpen, { quiet: true });
    rowSlider.set(0);
    mmSliders[0].set(START.atpMM);
    mmSliders[1].set(START.adpMM);
    mmSliders[2].set(START.phosphateMM);
    donorSlider.set(heightOf(START.donorIndex));
    targetSlider.set(heightOf(START.targetIndex));
    runCtl.set(false);
    spin.hold(orbit, clock.now());
    userZoomed = false;
    orbit.set(homeView());
    tOrigin = clock.now();
    applyPanes();
    showControls();
    applyDim();
    loop.invalidate();
    draw();
    b.announce();
  }

  // ---- what the scene shows ----
  function applyDim() {
    const row = ledgerRow();
    const subject = row ? row.part : null;
    for (const [name, part] of byPart) {
      const lit = !subject || subject === 'both' || name === subject
        || (subject === 'charges' && name === 'charges')
        || (subject === 'bridge' && name === 'gamma');
      part.dimGoal = lit ? 0 : 0.62;
      void name;
    }
  }

  function updateScene() {
    const t = clock.now();
    // The gamma phosphate leaves along the chain. 3.2 ångströms, not the 4.6 it first took: at 4.6 the
    // freed ion left the pane at the default framing and its bonds were drawn over the ledger beside it,
    // which is a defect that only shows in the split state and so never appears in the sweep.
    const away = V(1, 0, 0).multiplyScalar(split * 3.2).add(V(0, split * 0.7, split * 0.35));
    // The pair separates about the middle rather than the phosphate flying off one end: the whole group
    // slides back by a share of the parting, so the two products stay in the frame the intact molecule
    // was framed in and neither has to be chased.
    molGroup.position.copy(away).multiplyScalar(-0.45).applyQuaternion(molGroup.quaternion);
    for (const mesh of gammaMeshes()) {
      if (!mesh.userData.home) mesh.userData.home = mesh.position.clone();
      mesh.position.copy(mesh.userData.home).add(away);
    }
    // The bond that broke, and the oxygen that replaces it. The Pγ–O bond disappears with the split and
    // the oxygen from water takes its place on the phosphate.
    for (const mesh of partOf('bridge').meshes) mesh.visible = split < 0.35;
    waterOxygen.mesh.visible = split > 0.35;
    waterOxygen.bondMesh.visible = split > 0.35;
    for (const bar of chargeBars) {
      if (bar.part === 'gamma') bar.mesh.position.copy(bar.home).add(away);
      else bar.mesh.position.copy(bar.home);
      // Billboarded against the camera AND against the group's own tilt, so a minus sign reads as one
      // from every angle the orbit can reach.
      bar.mesh.quaternion.copy(molGroup.quaternion).invert().multiply(camera.quaternion);
    }
    for (const bar of spreadBars) bar.visible = split > 0.55;
    // The repulsion rods, sized by 1/r² against the intact molecule's own closest pair.
    const centres = model.phosphates.map((ph, i) => (i === 2 ? ph.pAt.clone().add(away) : ph.pAt.clone()));
    const ref = model.phosphates[0].pAt.distanceTo(model.phosphates[1].pAt);
    for (const rod of repulsionRods) {
      rod.mesh.visible = s.repulsionShown && s.scene === 'molecule';
      if (!rod.mesh.visible) continue;
      const a = centres[rod.i];
      const c = centres[rod.j];
      const dir = c.clone().sub(a);
      const len = Math.max(0.01, dir.length());
      const thickness = clamp(0.3 * (ref / len) ** 2, 0.02, 0.42);
      rod.mesh.scale.set(thickness, len, thickness);
      rod.mesh.position.copy(a).addScaledVector(dir, 0.5);
      rod.mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    }
    for (let i = 0; i < shells.length; i += 1) {
      shells[i].visible = s.hydrationShown && s.scene === 'molecule' && (i === 0 || split > 0.4);
      if (i === 1) shells[i].position.copy(away);
    }
    void t;
  }

  function stepSplit(dt, snap) {
    const d = splitGoal - split;
    if (Math.abs(d) < 0.004) { split = splitGoal; return false; }
    split += snap ? d : d * (1 - Math.exp(-dt / (SPLIT_SECONDS / 3)));
    return true;
  }
  function stepDim(dt, snap) {
    let moving = false;
    for (const part of byPart.values()) {
      const d = part.dimGoal - part.dim;
      if (Math.abs(d) < 0.005) part.dim = part.dimGoal;
      else { part.dim += snap ? d : d * (1 - Math.exp(-dt * 14)); moving = true; }
      for (const m of part.materials) m.userData.u.uDim.value = part.dim;
    }
    return moving;
  }

  function render() {
    orbit.apply(camera, spin.angle(clock.now()));
    updateScene();
    renderer.render(three, camera);
  }
  function step(dt) {
    const snap = reduced || clock.pinned;
    let moving = orbit.step(dt, snap);
    moving = stepSplit(dt, snap) || moving;
    moving = stepDim(dt, snap) || moving;
    return moving || (b.playing && spin.rate > 0 && !clock.pinned);
  }
  const loop = createLoop(step, render);

  // ---------------------------------------------------------------- the ladder pane

  function drawLadder() {
    const { w, h: hgt } = ladderPane.clear().box;
    const narrow = b.narrow;
    const pad = 6;
    // WHICH WAY UP, and it is the whole of what this rail says. The MOST NEGATIVE is at the TOP.
    //
    // Not a taste. §5.3's own table is printed that way — phosphoenolpyruvate at −61.9 first, glucose
    // 6-phosphate at −13.8 last — the prose beside it reads "a compound above it can hand a phosphate
    // to ADP and so make ATP; ATP can hand a phosphate to anything below it", and it places the muscle's
    // reserve "exactly one rung up: creatine phosphate", which is the −43.0 immediately above ATP's
    // −30.5. §5.4 then calls glutamyl phosphate a compound "partway up Figure 5.3's ladder and therefore
    // much readier to react". FIGURES.md asks for this ladder in exactly those words: it is what makes
    // "takes from above, gives below" a thing the reader tries rather than a sentence.
    //
    // It ran the other way until 2026-09-17 — −13.8 at the top — so creatine phosphate was one rung
    // DOWN from ATP in the drawing while the ledger's own note beside it, on the same screen, said
    // "above" and "below". Plain English is the trap and it is why this comment is long: "higher
    // transfer potential" and "more negative ΔG" point in opposite directions, so a rail sorted by the
    // arithmetic sign reads as sorted by the chemistry. The rail is pinned to the table's order.
    const TOP_KJ = -65;
    const BOTTOM_KJ = -10;
    const donor = LADDER[s.donorIndex];
    const target = LADDER[s.targetIndex];
    const dg = round(donor.kj - target.kj, 1);
    const possible = dg < 0;
    // The verdict names what is phosphorylated and what that makes (transferWords, above): "Phospho-
    // enolpyruvate can phosphorylate ADP and make ATP". It said "can phosphorylate ATP" until 2026-09-23.
    // The uphill case ends ", uphill." where it said ", which is uphill.", because the standard-conditions
    // clause made it longer. The shorter ending saves a line on the narrowest desktop stages, 700 to
    // 712 px, where the longest verdict takes two lines rather than three. On a phone the longest takes
    // three lines with either ending.
    const verdict = s.donorIndex === s.targetIndex
      ? 'Donor and target are the same compound, so there is nothing to transfer.'
      : possible
        ? `${donor.name} ${transferWords(target, true)}: ${signed(dg, 1)} kJ/mol.`
        : `${donor.name} ${transferWords(target, false)}: ${signed(dg, 1)} kJ/mol, uphill.`;
    // The rule that decides it. At a phone's width the ladder has the whole stage and the ledger is not
    // beside it, so the sentence the ledger carried there is set here, under the verdict. It is §5.3's
    // own sentence, because that is the one a reader carries away from the section — and now that the
    // rail runs the table's way it is true of the picture it is printed under. It said "releases more /
    // releases less" while the rail was upside down: true either way up, and therefore saying nothing
    // about the rail the reader is looking at. The second one said "cannot phosphorylate anything above
    // it", which is the verdict's old mistake in general form; §5.3's verb is "hand a phosphate to". It is
    // also a "cannot", so it carries the verdict's "under standard conditions". Flat, it was set
    // directly under "ATP cannot phosphorylate creatine … under standard conditions" and took back what
    // that clause says. It dropped "The transfer runs the other way:" to stay two lines at 320 px.
    const rule = !narrow || s.donorIndex === s.targetIndex
      ? null
      : possible
        ? 'A compound takes a phosphate from anything above it and gives one to anything below.'
        : UPHILL_RULE;

    // The geometry, solved rather than assumed, and this is the fix for the overlap above. The foot's
    // height is a line count; the line count depends on the type size; the type size depends on what
    // the foot leaves for the rail — and the rail has a hard requirement, because eight rungs spread by
    // 1.35 of the type size is the least room eight numbers can be read in. Nothing used to check it:
    // the spread simply ran past the pane and was drawn over whatever was under it. So the type is
    // shrunk to what the rail can afford, and if even the smallest type will not fit, the rule is given
    // up and the rail measured again — the numbers are never the thing dropped.
    // NOR IS THE VERDICT. Its lines used to be cut at two, like the rule's, and a verdict that wrapped to
    // three lost its end without a word: measured 2026-09-23 at a 272 px stage, "Fructose 6-phosphate
    // cannot phosphorylate 1,3-bisphosphoglycerate: +33.5 kJ/mol, which is" — the "uphill." gone. The
    // verdict now names the acceptor, and a "cannot" names the standard conditions it holds in, so it is
    // longer. On the chapter page, the measured uphill transfers into 1,3-bisphosphoglycerate (four) and
    // phosphoenolpyruvate (one) take three lines at every phone width from 320 to 390 px. So every line
    // of the verdict is laid out and drawn. Only the rule is ever cut or given up, and at a phone's width
    // nothing else on the stage then says it, because the ledger is not shown there. Measured on the
    // chapter page before and after this change, over nine pairs at 320, 360, 375 and 390 px, the rule is
    // shown in exactly the same states it was. At 320 px that is only the opening state.
    // The wide geometry keeps its two lines of foot under the rail. No verdict needs a third there today —
    // measured at the narrowest wide stage, 712 px, the longest wraps to two — but one that did would take
    // its room out of the rail rather than be drawn over it.
    let size;
    let top;
    let bottom;
    let foot;
    if (!narrow) {
      size = clamp2(Math.min(w * 0.024, hgt * 0.03), 8.4, 10.8);
      top = pad + size * 2.4;
      foot = wrapText(verdict, w - pad * 2, Math.min(size, 10));
      bottom = hgt - size * 2.6 - Math.max(0, foot.length - 2) * (size + 2);
    } else {
      const MIN = 9;
      const MAX = 11.2;
      const want = Math.min(w * 0.028, hgt * 0.055);
      const lay = (parts, sz) => {
        const lines = [];
        parts.forEach((part, k) => {
          const wrapped = wrapText(part, w - pad * 2, sz);
          lines.push(...(k === 0 ? wrapped : wrapped.slice(0, 2)));
        });
        const t = pad + sz * 2.4;
        const bt = Math.max(t + 1, hgt - 3 - lines.length * (sz + 2.6));
        return { lines, top: t, bottom: bt, afford: (bt - t) / (LADDER.length * 1.35), size: sz };
      };
      let g = null;
      for (const parts of rule ? [[verdict, rule], [verdict]] : [[verdict]]) {
        g = lay(parts, clamp2(Math.min(want, lay(parts, clamp2(want, MIN, MAX)).afford), MIN, MAX));
        if (g.afford >= g.size) break;
      }
      ({ size, top, bottom } = g);
      foot = g.lines;
    }
    const Y = (kj) => top + ((kj - TOP_KJ) / (BOTTOM_KJ - TOP_KJ)) * (bottom - top);
    const railX = narrow ? pad + w * 0.22 : pad + w * 0.3;

    // The quantity by its name, as §5.3's table heads its column. "RELEASED ON HYDROLYSIS" stood over a
    // column of negative numbers, and a release of −61.9 is a contradiction in its own terms. The rail
    // still reads the way the prose does: the more negative, the more a hydrolysis releases.
    ladderPane.text(pad, pad + size, 'ΔG°′ of hydrolysis, kJ/mol', { class: 'at-head', 'font-size': n1(Math.min(size, 9.4)) });
    ladderPane.line(railX, top, railX, bottom, { stroke: C.ruleStrong, 'stroke-width': 2 });

    // Two rungs a tenth of a kilojoule apart are two labels in the same place: acetyl phosphate at
    // −43.1 and creatine phosphate at −43.0 overprinted each other, and their numbers with them. The
    // whole rung — its line, its number and its name — is moved down by the least that separates the
    // pair, which is under two per cent of the rail's height and leaves the order and the spacing of
    // every other rung exactly as the numbers put them. With the rail this way up the nudged one is
    // creatine phosphate, the lower of the two, and the 12 kJ/mol of clear rail between it and ATP is
    // what lets §5.3's "exactly one rung up" be read off the picture.
    // DOWN, THEN BACK UP, and the second pass is what turning the rail over made necessary. A crowded
    // run used to be pushed down and nothing else: while −13.8, −15.9 and −20.9 were the TOP three rungs
    // that was free, because a rung pushed down had the whole rail under it. The right way up those
    // three are the BOTTOM three — seven kilojoules between them — so the cascade arrives at the foot,
    // and the old clamp pinned glucose 6-phosphate onto `bottom`, where the verdict begins.
    // Measured at 390 px in both themes, as the clearance from the lowest rung's own type to the
    // verdict's first line, one pass against two: default 1.3 → 7.9, donor equal to target 2.6 → 8.8,
    // the uphill transfer −2.4 → 4.8, creatine phosphate to ATP −2.4 → 5.6. Two of the four OVERLAPPED,
    // and the clamp had also squashed the last gap to 8.3 px where the type needs 12.4.
    // So when the run goes past where the bottom rung's own number puts it, it is resolved upward from
    // there instead: both ends of the ladder then sit exactly where their numbers put them and only the
    // crowded middle is spread. There is room to do it — the narrow geometry above solves the rail to
    // hold 8 × gap and eight rungs need 7 — and the clamp is kept as the last word, because a rung
    // outside the rail is the ladder walking out of the pane and drawing on the next one down.
    const labelY = (() => {
      const order = LADDER.map((item, i) => ({ i, y: Y(item.kj), home: Y(item.kj) })).sort((a, c) => a.y - c.y);
      const gap = size * 1.35;
      const last = order.length - 1;
      for (let k = 1; k <= last; k += 1) {
        if (order[k].y - order[k - 1].y < gap) order[k].y = order[k - 1].y + gap;
      }
      if (order[last].y > order[last].home) {
        order[last].y = order[last].home;
        for (let k = last - 1; k >= 0; k -= 1) order[k].y = Math.min(order[k].y, order[k + 1].y - gap);
      }
      for (const o of order) o.y = clamp2(o.y, top, bottom);
      const out = new Array(LADDER.length);
      for (const o of order) out[o.i] = o.y;
      return out;
    })();

    LADDER.forEach((item, i) => {
      const y = labelY[i];
      const isDonor = i === s.donorIndex;
      const isTarget = i === s.targetIndex;
      const mark = isDonor || isTarget;
      ladderPane.line(railX - 7, y, railX + (narrow ? 10 : 14), y, {
        stroke: mark ? (isDonor ? INK.coral : INK.leaf) : item.currency ? C.ink : C.ruleStrong,
        'stroke-width': mark || item.currency ? 2.4 : 1.4,
      });
      ladderPane.text(railX - 10, y + size * 0.35, n1(item.kj), { anchor: 'end', class: 'at-num', 'font-size': n1(Math.min(size, 9.8)) });
      // The name to the right of its rung, at both widths. It used to sit BENEATH the rung on a phone,
      // because eight names beside eight rungs overlapped by the fourth in the 90 px of rail the ledger
      // left; with the whole stage the rungs are far enough apart to carry their own names, and a name
      // on its rung's own line cannot be read as belonging to the rung below it.
      // Narrow leaves a gutter on the right for the donor/target word, which is set there rather than
      // over the rail so that it cannot land on the name of the rung above.
      const gutter = narrow ? 36 : 0;
      const room = w - (railX + 18) - pad - gutter;
      const nameSize = fit(item.name, room, size, 7.6);
      let nameWidth = 0;
      if (nameSize) {
        const el = ladderPane.text(railX + 18, y + nameSize * 0.35, item.name, {
          class: mark || item.currency ? 'at-name' : 'at-note', 'font-size': n1(nameSize),
        });
        // Measured off the glyphs, not estimated. `fit` uses a per-character advance to CHOOSE a size,
        // which is the right tool for that and the wrong one for laying something out against the end of
        // the word: the names here run from "ATP" to "1,3-bisphosphoglycerate".
        // BEFORE THE WEBFONT ARRIVES this measures the fallback face, and the donor and target words are
        // placed against it. That is not left standing: the bench redraws every figure on it when
        // `document.fonts.ready` settles (bench.js, handle()), and this redraw measures again — the same
        // re-lay-out `scale.js` does for itself. Measured 2026-09-23 with every fonts.gstatic.com response
        // held back and the ladder opened with the mouse while Inter was still loading: the words stood
        // at x = 248.1 and 333.1, moved to 250.3 and 342.2 when the fonts came in, and the ladder pane's
        // markup was then byte-identical to a run that had the fonts first, at 1100 and 390 px.
        // What that does not cover is a font load that STARTS after the bench took its promise. What is
        // measured here are the names, all Latin, and the ledger and the toolbar set that same Inter
        // first. Opening the ladder can bring in the page's `text=` subset of Inter, for the ΔG°′ in the
        // heading and the arrows on the steppers, but nothing is laid out against either.
        nameWidth = el?.getComputedTextLength?.() || 0;
      }
      if (isDonor || isTarget) {
        const word = isDonor ? 'donor' : 'target';
        const ink = isDonor ? INK.coral : INK.leaf;
        const wordSize = Math.min(size - 0.6, 9.6);
        // ON THE RUNG'S OWN LINE, at both widths, and never stacked above it. Set half a line ABOVE the
        // rung — as it was until 2026-09-17 — the word lands on the NAME OF THE RUNG ABOVE whenever two
        // rungs are within about a line of each other, and this ladder has two such pairs: acetyl and
        // creatine phosphate 0.1 kJ/mol apart, fructose and glucose 6-phosphate 2.1 apart. Measured at
        // 1000x640 in both themes, "donor" overlapped "Acetyl phosphate" by 8.8 px and "Fructose
        // 6-phosphate" by 5.2, against a 9.6 px word.
        // Turning the rail the right way up is what exposed it rather than what caused it: the LOWER
        // member of each tight pair is the one whose word collides, and turning it over made those
        // members creatine phosphate and glucose 6-phosphate — the two rungs §5.3 ("a reserve exactly
        // one rung up") and `tools/drive.js` (donor = g6p) both point at. The same code drew 0.7 px of
        // overlap the other way up, on acetyl phosphate and fructose 6-phosphate, and nothing looked.
        // A phone already sent the word to the right edge, for the neighbouring reason that it landed on
        // the name above; at desktop it now follows its own name, which keeps it beside the compound it
        // belongs to. The right edge is the fallback for a name that took the whole column, and for a
        // width that could not be measured — 0 from an unrendered pane would otherwise place the word
        // back on top of the name it was measured from.
        const after = railX + 18 + nameWidth + 10;
        const follows = !narrow && nameWidth > 0 && after + wordSize * 4 <= w - pad;
        ladderPane.label(follows ? after : w - pad, y + size * 0.35, word, {
          size: wordSize, anchor: follows ? 'start' : 'end', fill: ink,
        });
      }
    });

    // The transfer itself: an arrow from the donor's rung to the target's, and the verdict beneath.
    // Narrow: in the gutter left of the axis figures, not across them — at the old railX − 26 it was
    // drawn straight through "−30.5" and "−43.0".
    const yD = labelY[s.donorIndex];
    const yT = labelY[s.targetIndex];
    const ax = narrow ? pad + 8 : railX - 44;
    if (s.donorIndex !== s.targetIndex) {
      ladderPane.path(`M${n1(ax)} ${n1(yD)} L${n1(ax)} ${n1(yT)} M${n1(ax - 3.4)} ${n1(yT + (yT > yD ? -5 : 5))} L${n1(ax)} ${n1(yT)} L${n1(ax + 3.4)} ${n1(yT + (yT > yD ? -5 : 5))}`, {
        fill: 'none', stroke: possible ? INK.leaf : C.ruleStrong, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'stroke-dasharray': possible ? null : '4 3',
      });
    }
    if (!narrow) {
      // Every line: `bottom` above left the room for all of them.
      foot.forEach((line, i) => {
        ladderPane.text(pad, hgt - 3 - (foot.length - 1 - i) * (size + 2), line, {
          class: possible ? 'at-name' : 'at-note', 'font-size': n1(Math.min(size, 10)),
          style: possible ? `fill:${INK.leaf}` : undefined,
        });
      });
      return;
    }
    // Narrow: the verdict, then the rule under it if the rail could spare the room. Every line is drawn
    // — `foot` is the list the rail was measured against, so there is no line here the pane has not
    // already been solved to hold.
    const verdictLines = wrapText(verdict, w - pad * 2, size).length;
    foot.forEach((line, i) => {
      const isVerdict = i < verdictLines;
      ladderPane.text(pad, hgt - 3 - (foot.length - 1 - i) * (size + 2.6), line, {
        class: isVerdict && possible ? 'at-name' : 'at-note', 'font-size': n1(size),
        style: isVerdict && possible ? `fill:${INK.leaf}` : undefined,
      });
    });
  }

  // ---------------------------------------------------------------- the ledger pane

  function drawLedger() {
    const { w, h: hgt } = ledgerPane.clear().box;
    const narrow = b.narrow;
    const pad = narrow ? 2 : 6;
    const width = Math.max(40, w - pad * 2);
    const size = narrow ? 10.2 : 10.6;
    const d = state();
    const r = ledgerPane.readout({
      title: narrow ? null : (s.scene === 'ladder' ? 'THE LADDER' : 'THE LEDGER'),
      x: pad, width, size, minRow: narrow ? 11 : 14, maxRow: narrow ? 20 : 48,
    });
    // The readout wraps a sentence to its column and draws nothing below the pane's own box, so a table
    // with more rows than the pane is tall is clipped there instead of painting over the toolbar — which
    // is what this one did on a 342 px square stage, with the last two lines under the buttons. What is
    // given up is the tail of the last sentence, and the numbers above it are never the thing dropped.
    // The whole pane, not two pixels short of it: the readout now clips at the box it is given, and the
    // pane's own bottom edge is one pixel above the toolbar (measured at 390 px), so those two pixels of
    // old safety margin were two pixels of table thrown away — atp3d lost the Total row to them.
    const room = Math.max(30, hgt);
    const note = (sentence) => r.note(sentence);
    const row = ledgerRow();

    if (s.scene === 'ladder') {
      r.row('Donor', LADDER[s.donorIndex].short);
      r.row('Its ΔG°′ of hydrolysis', `${n1(d.rungKj)} kJ/mol`);
      r.row('Target', LADDER[s.targetIndex].short);
      r.row('Its ΔG°′ of hydrolysis', `${n1(LADDER[s.targetIndex].kj)} kJ/mol`);
      r.sum('The transfer', `${signed(d.rungKj - LADDER[s.targetIndex].kj, 1)} kJ/mol`, { accent: d.transferPossible ? INK.leaf : INK.coral });
      // §5.3's sentence, and from here it is true of the rail beside it: the most negative is at the
      // top, so "above" on this rail is "releases more" and the arrow for a transfer that can happen
      // points DOWN. Donor equal to target is its own case — `transferPossible` is false there too, and
      // "runs the other way" is not what is wrong with it. The rail says so in its own verdict; this
      // pane used to be the only surface claiming a direction for a transfer that has no compounds.
      note(s.donorIndex === s.targetIndex
        ? 'Donor and target are the same compound, so there is nothing to transfer.'
        : d.transferPossible
          ? 'A compound takes a phosphate from anything above it and gives one to anything below. That is the whole of ATP’s qualification for the job.'
          : `The transfer runs the other way. ${UPHILL_RULE}`);
      return r.fill(room);
    }

    if (!s.ledgerOpen && !narrow) {
      r.row('Standard, ΔG°′', `${n1(DG_STANDARD)} kJ/mol`);
      r.row('At these concentrations', `${n1(d.deltaGKj)} kJ/mol`);
      r.row('ATP', `${n1(s.atpMM)} mmol/L`);
      r.row('ADP', `${n1(s.adpMM)} mmol/L`);
      r.row('Phosphate, Pᵢ', `${n1(s.phosphateMM)} mmol/L`);
      note(concentrationSentence(d, false));
      note('Open the ledger to see what breaking the bond costs and what pays for it.');
      return r.fill(room);
    }

    // At a phone's width the true value leads: it is the number §5.3 sends the reader here for, and the
    // rows below it are what the pane drops first if it has to.
    if (narrow) r.row('ΔG here', `${n1(d.deltaGKj)} kJ/mol`);
    if (!narrow) r.head('WHAT IT COSTS');
    r.row(narrow ? 'The bond' : LEDGER[0].label, signed(LEDGER[0].kj, 1), { accent: row?.id === 'bond' ? INK.coral : undefined });
    if (!narrow) r.head('WHAT PAYS FOR IT');
    for (const item of LEDGER.slice(1)) {
      r.row(narrow ? item.short : item.label, signed(item.kj, 1), { accent: row?.id === item.id ? INK.leaf : undefined });
    }
    r.sum('Total', `${n1(LEDGER_TOTAL)} kJ/mol`);
    note(rowSentence(row, narrow));
    if (!narrow) {
      r.head('AT THESE CONCENTRATIONS');
      r.row('ΔG', `${n1(d.deltaGKj)} kJ/mol`);
      note(concentrationSentence(d, false));
    }
    return r.fill(room);
  }

  // The sentence under the ledger, read in every state its parts can take: no row chosen, the bond, or
  // one of the four that pay. The bond's is the correction §5.3 exists to make, and it must read as an
  // explanation rather than as an error message.
  function rowSentence(row, narrow) {
    if (!row) {
      return narrow
        ? 'The total is measured; the five lines apportion it.'
        : 'The total is the measured standard value. The five lines are an apportionment of it, not five measurements: §5.3 names these four things and does not weigh them.';
    }
    // Every one of these fits a phone's column in one line, because at that width the ledger has room
    // for six rows and one line of prose and not a word more.
    switch (row.id) {
      case 'bond':
        return narrow
          ? 'Breaking this bond costs and returns none.'
          : 'Breaking this bond costs energy and returns none — that is what a bond is. Nothing is stored in it, and everything that pays for the reaction happens to the products.';
      case 'repulsion':
        return narrow
          ? 'Three charges crowded together; taking one off relieves it.'
          : 'Three negative charges are strung together within a few tenths of a nanometre. Taking one off relieves the strain, and the overlay shows how hard they were pushing.';
      case 'resonance':
        return narrow
          ? 'The freed ion spreads its charge over four oxygens.'
          : 'The freed ion spreads its charge evenly over four equivalent oxygens, an arrangement with more ways of being itself than it had while it was attached.';
      case 'hydration':
        return narrow
          ? 'Water holds the two products better than it held ATP.'
          : 'The water around the two products holds them better than it held ATP, in the way §2.3 described water closing round a dissolved ion.';
      default:
        return narrow
          ? 'Two molecules where there was one: an entropy gain.'
          : 'There are now two molecules where there was one, which is an entropy gain of the kind §5.1 described.';
    }
  }

  function concentrationSentence(d, narrow) {
    const standardish = Math.abs(d.deltaGKj - DG_STANDARD) < 1.2;
    if (standardish) {
      return narrow
        ? 'All three at one mole per litre: this is the standard state.'
        : 'With all three near one mole per litre the true value and the standard value are the same, which is what "standard" means.';
    }
    return narrow
      ? 'A cell holds ATP far from equilibrium, so it is worth more than the table says.'
      : 'A cell holds its ATP far from equilibrium with ADP and phosphate, so it is worth more here than the table says — the reason a charged battery is worth more than a flat one.';
  }

  // ---------------------------------------------------------------- describe

  function state() {
    const dg = deltaG(s.atpMM, s.adpMM, s.phosphateMM);
    const donor = LADDER[s.donorIndex];
    const target = LADDER[s.targetIndex];
    return {
      view: orbit.view(spin.angle(clock.now())),
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      scene: s.scene,
      hydrolysed: s.hydrolysed,
      repulsionShown: s.repulsionShown,
      hydrationShown: s.hydrationShown,
      ledgerOpen: s.ledgerOpen,
      ledgerRow: ledgerRow() ? ledgerRow().id : null,
      bondBreakingKj: LEDGER[0].kj,
      repulsionReliefKj: LEDGER[1].kj,
      resonanceKj: LEDGER[2].kj,
      hydrationKj: LEDGER[3].kj,
      entropyKj: LEDGER[4].kj,
      ledgerTotalKj: LEDGER_TOTAL,
      atpMM: round(s.atpMM, 2),
      adpMM: round(s.adpMM, 2),
      phosphateMM: round(s.phosphateMM, 2),
      deltaGStandardKj: DG_STANDARD,
      deltaGKj: round(dg, 1),
      donor: donor.id,
      target: target.id,
      rungKj: donor.kj,
      targetKj: target.kj,
      // Computed from the two rungs, never set by the controls: a donor can phosphorylate a target's
      // acceptor only when its own hydrolysis releases more.
      transferPossible: s.donorIndex !== s.targetIndex && donor.kj - target.kj < 0,
      t: round(clock.now() - tOrigin, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);
  // The ladder's sentence says what the transfer does in the verdict's own words (transferWords), so a
  // reader who hears it rather than sees it is told the same chemistry: which molecule the phosphate
  // goes onto, and what that makes.
  b.onAnnounce((d) => (d.scene === 'ladder'
    ? `The ladder. The standard free energy of hydrolysis, ΔG°′, is ${n1(d.rungKj)} kilojoules per mole for ${inSentence(LADDER[s.donorIndex].name)} and ${n1(LADDER[s.targetIndex].kj)} for ${inSentence(LADDER[s.targetIndex].name)}, so ${s.donorIndex === s.targetIndex ? 'there is nothing to transfer' : `${inSentence(LADDER[s.donorIndex].name)} ${transferWords(LADDER[s.targetIndex], d.transferPossible)}`}.`
    : `ATP, ${d.hydrolysed ? 'hydrolysed' : 'intact'}. The ledger totals ${n1(d.ledgerTotalKj)} kilojoules per mole, and at ${n1(d.atpMM)}, ${n1(d.adpMM)} and ${n1(d.phosphateMM)} millimoles per litre the true value is ${n1(d.deltaGKj)}.${d.ledgerRow ? ` The row shown is ${d.ledgerRow}.` : ''}`));

  // ---------------------------------------------------------------- drawing and the handle

  function draw() {
    b.redraw();
  }

  let lastW = 0;
  let lastH = 0;
  b.onDraw(() => {
    const box = scenePane.box;
    if (box.w !== lastW || box.h !== lastH) {
      lastW = box.w;
      lastH = box.h;
      renderer.setSize(box.w, box.h, false);
      camera.aspect = box.w / Math.max(1, box.h);
      camera.updateProjectionMatrix();
      // Re-frame only while the reader has not zoomed for themselves; after that the distance is
      // theirs, and Reset view is how they give it back.
      if (!userZoomed) {
        const d = fitDistance(box);
        orbit.goal.distance = d;
        orbit.cur.distance = d;
      }
    }
    if (s.scene === 'ladder') drawLadder();
    else ladderPane.clear();
    // Emptied rather than drawn into when the ladder has the stage: a hidden pane still measures 40x30
    // through the bench's floor, so a table drawn into one is a table set to a box that is not there.
    if (ladderOnly) ledgerPane.clear();
    else drawLedger();
    loop.invalidate();
  });

  applyDim();
  const base = b.handle();
  // Again, and this time it can see the toolbar: the bench appends the toolbar to its wrapper inside
  // handle(), so a tidy run before that found nothing at all.
  showControls();
  render();
  loop.kick();

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   view              { theta, phi, distance }, distance never zero
  //   drawCalls, triangles   what the renderer did on the last frame
  //   scene             'molecule' or 'ladder'
  //   hydrolysed        whether the outer phosphate has been taken off
  //   repulsionShown, hydrationShown, ledgerOpen   the three overlays
  //   ledgerRow         the row selected, or null; 'bond' is the one that prints the correction
  //   bondBreakingKj    +34.0, POSITIVE: breaking a bond costs
  //   repulsionReliefKj, resonanceKj, hydrationKj, entropyKj   negative, what pays for it
  //   ledgerTotalKj     their sum, -30.5, and it equals deltaGStandardKj
  //   atpMM, adpMM, phosphateMM   the three sliders
  //   deltaGStandardKj  -30.5, fixed
  //   deltaGKj          at the current concentrations; -50.1 at the opening values
  //   donor, target     ladder scene, by id
  //   rungKj            the selected donor's ΔG°′ of hydrolysis, negative; more negative is
  //                     HIGHER on the rail. Turning the ladder the right way up changed no field here —
  //                     the rungs' order was never in describe(), only in where drawLadder put them.
  //                     Nor did turning the Donor and Target controls round (2026-09-23): `donor` and
  //                     `target` are ids, and the height a range holds is not reported.
  //   targetKj          the selected target's ΔG°′ of hydrolysis. Added 2026-09-23 so `npm run drive`
  //                     can check that the word "target" is drawn on the target's own rung, as it
  //                     checks the donor's against rungKj.
  //   transferPossible  computed from the two rungs, never set by the sliders
  //   t                 seconds since mount or since Reset, three decimals
  //   playing           whether the slow turn is on; it opens still
  return {
    ...base,
    destroy() {
      loop.stop();
      disposeScene(three);
      mats.dispose();
      renderer.dispose();
      base.destroy();
    },
    setTime(t) {
      clock.pin(t);
      orbit.step(0, true);
      stepSplit(0, true);
      stepDim(0, true);
      base.setTime(t);
      render();
    },
    setVisible(v) {
      loop.setVisible(v);
      base.setVisible(v);
    },
    setTheme(next, nextPalette) {
      theme = next;
      palette = nextPalette || resolvePalette(next);
      mats.setPaper(palette.paper);
      rig.setTheme(theme);
      for (const part of byPart.values()) {
        for (const m of part.materials) {
          if (m.userData.bond) m.color.set(palette.inkSoft);
          else if (m.userData.sym) m.color.set(atomColours(palette, m.userData.sym).fill);
        }
      }
      chargeMat.color.set(palette.ink);
      repulsionMat.color.set(palette.coral);
      waterMat.color.set(atomColours(palette, 'O').fill);
      base.setTheme(next, palette);
      render();
    },
    setView(view) {
      spin.fold(orbit, clock.now());
      orbit.set(view);
      render();
    },
  };
}

// Kept out of the module's own namespace check: `tint` is used by the ladder's marks above through the
// palette's CSS expressions, and this line stops a bundler-free lint from calling the import unused.
void tint;
