// The carbon, and where it goes: Figure 7.2, §7.3.
//
// WHAT IS ON THE STAGE. The Krebs cycle as a ring of eight intermediates, each drawn as a chain of
// carbon discs lying along the ring with its carbon count written inside it: citrate and isocitrate are
// a five-carbon chain with a sixth carbon hanging off the middle, α-ketoglutarate five in a row, and the
// four-carbon acids four. The molecule the cycle is working on is drawn dark and the other seven light,
// so the whole cycle is always in view and the reader can see which step it is at. The eight steps are
// numbered where they happen; the carbon dioxide, NADH, FADH₂ and ATP each one makes sit just outside
// the ring at that step, drawn in outline until the current turn has made them. The fuel comes in along
// the top and hands an acetyl group down to the join at twelve o'clock. In the middle of the ring: the
// turn, the carbon arithmetic of the last step ("6 − 1 = 5") and one sentence saying what it did. Beside
// the ring (or under it, on a tall or narrow stage), the ledger: the books for this turn and so far, the
// label, oxaloacetate's level, and the fuel's yield.
//
// THE LABEL, which is the reason the figure exists (FIGURES.md, 7.2; the accuracy review of 2026-09-24,
// which counts carbon, not atoms). Every carbon of the molecule on the ring is a SLOT, and the model
// carries the share of the labelled carbon that sits in each slot. A step moves the shares with the
// carbons: the join puts the acetyl group's carbonyl carbon and methyl carbon in citrate's slots 0 and 1
// and oxaloacetate's four behind them, its first carbon (the carboxyl beside the keto group) becoming
// the carboxyl that hangs off citrate's middle carbon. Aconitase moves the hydroxyl to the carbon that
// came from oxaloacetate, not the one from the acetyl group — the enzyme holds citrate at three points,
// which is Ogston's argument in §7.3's margin note — so the carboxyl isocitrate dehydrogenase takes is
// that hanging one, oxaloacetate's C1, and the one α-ketoglutarate dehydrogenase takes next is the far
// end, oxaloacetate's C4. Neither step can reach slots 0 and 1, so the carbons that leave on a turn are
// never the two that just arrived, on any turn. At succinate the molecule becomes symmetrical, and the
// enzymes after it cannot tell its ends apart: the share on each slot becomes the mean of itself and its
// mirror image, which is where the halves come from. Nothing about which carbon leaves when is written
// down anywhere in this file; it comes out of those five lines of mapping, and it comes out as the brief
// requires: acetyl C1 leaves none on turn 1 and all on turn 2 (half at each decarboxylation); acetyl C2
// none on turns 1 and 2, half on turn 3 and half of what is left on every turn after; oxaloacetate C1
// and C4 all on turn 1; C3 on turn 2; C2 as acetyl C2. Choosing a label puts the cycle back at the start,
// so the label's turns are the counter's turns.
//   The shares are exact. They are kept as mantissas over one shared power of two that is lowered by 2⁶⁴
// whenever every share has fallen below it, so a methyl carbon followed for a thousand turns is still a
// positive number of the form n/2ᵏ, and is printed as one; describe() reports it as a double, floored
// at Number.MIN_VALUE, so `labelRemaining` is never 0 for acetyl C2, which is what the brief asks.
//
// THE BOOKS. Carbons in and carbons out are counted per reaction — two at each join, one at each
// decarboxylation — so they are equal at the end of every turn, and the turn is the number of joins. The
// yields per turn (3 NADH, 1 FADH₂, 1 ATP) are summed from the table of steps below, not written in.
// A drain and a top-up move carbon in and out of the pool, and neither is in these books, which count
// what the cycle's own eight reactions do with the acetyl groups it is fed.
//
// OXALOACETATE, AND THE DRAINS. `oxaloacetateLevel` is in multiples of the trace a working mitochondrion
// keeps: 1 is that trace, 0.5 half of it. A join happens at a rate proportional to the level, which is
// what citrate synthase does below its Km, and the level is always far below it. A drain takes half the
// intermediate it is set on each time the molecule arrives there — half the pool, and half of any label
// in it — so without a top-up the level halves every turn, the joins take 2, 4 and 8 times as long, and
// below a fifth of the trace (L_MIN) the acetyl group waits and the cycle has stopped: `stalled` is
// computed from that, never set. Top up adds oxaloacetate made by carboxylating pyruvate, at a tenth of
// the trace per second, up to the trace, which restarts a stopped cycle; its carbons are not counted as
// carbons in. The drains are DATA: `DRAINS` below names each one's intermediate and product, and
// `mountKrebs(root, ctx, { drains })` mounts the same figure with another table, so a later chapter about
// biosynthesis (succinyl-CoA to haem, say) mounts this module rather than copying it. A drain on citrate
// is labelled "exported citrate" rather than "fat": only citrate's acetyl end becomes fat in the cytosol,
// and its oxaloacetate end comes back, so a labelled carbon drained with it is only known to have left.
//
// THE FUELS, and what each is worth, from §7.6's 2.5 ATP per NADH and 1.5 per FADH₂, computed by
// `fuelYield()` from the carriers each route makes outside the cycle plus the cycle's own turns.
//   Glucose: glycolysis 2 ATP and 2 NADH, the link reaction 2 NADH, two turns. 32 ATP, with the cytosol's
// NADH carried in by the malate–aspartate shuttle, which is heart, liver and brain (§7.6); a single number
// names its tissue. 32 / 180.16 g = 0.18 mol per gram.
//   A sixteen-carbon fatty acid, palmitate: 2 ATP to activate it, seven two-carbon cuts each making one
// NADH and one FADH₂, eight acetyl-CoA, eight turns. 106 ATP, §7.3's number; 106 / 256.42 = 0.41.
//   An amino acid: glutamate, because §7.3 and its items name it and because it does not enter as
// acetyl-CoA, so it traces an entry point of its own. Glutamate dehydrogenase takes its nitrogen off as
// ammonia (one NADH) and leaves α-ketoglutarate, which the cycle runs to oxaloacetate (2 NADH, 1 FADH₂,
// 1 ATP). That oxaloacetate is one more than the cycle needs, so it leaves as phosphoenolpyruvate (a GTP
// spent) and becomes pyruvate (an ATP made), then acetyl-CoA (1 NADH), which the cycle burns in one full
// turn. The ammonia costs four ATP-equivalents per urea, two per nitrogen (Nelson & Cox, Lehninger
// Principles of Biochemistry, the urea cycle's energetics). 7 NADH, 2 FADH₂ and no net ATP: 20.5 ATP, and
// 20.5 / 147.13 = 0.14 mol per gram. The handoff says this number is the figure's own arithmetic, since
// the chapter gives none for protein.
//
// THE COMPOSITIONS. Wide: the ring on the left at about the pane's height and the ledger in a column to
// its right; on a stage taller than it is wide the ledger goes under the ring in two columns. The ring's
// radius leaves room above it for the lines a drain or the top-up adds over the two top names, so those
// lines never run into the fuel's route and switching one on does not move the ring.
//   Narrow (a stage below 600 px): the ring keeps its shape and its carbon counts. Each name becomes the
// number of the step that makes it, set just outside its node, and the names are listed by number under
// the ring, four to a row, or three on a pane under 372 px; the current one is underlined on the ring
// and has a dot and bold type in the list. The track's own step numbers go, since the names' numbers
// say the same, and a product token that would sit on a number moves clear of it. The sentence goes
// under the ring when the ring can keep a radius of R_SENTENCE with it; otherwise the centre says the
// turn and the arithmetic, and says STOPPED in place of the turn when the cycle stops. A ring too small
// for the turn sends it to the books' title. The fuel's route becomes one line of type. The ledger is the
// books in five rows beside one block, chosen by what the reader has set going (narrowColumn()). The
// drain choice shortens to None, Fat, Glutamate and Aspartate, and the label stepper's value has a fixed
// width, so the stepper's buttons stay put while a reader steps through the carbons. narrowAspect is 2/3
// rather than FIGURES.md's 4/5; the registry comment has the measurements.
//
// WHAT THE BENCH COULD NOT DO. A label and a readout row are plain text, and CO₂, FADH₂ and NAD⁺ need a
// subscript and a superscript, as does 2ᵏ in a share: those strings carry `_2`, `^+` and `^{40}` marks
// and `typeset()` rebuilds them as tspans after each draw, so no character is a Unicode sub- or
// superscript a font would have to supply. `plain()` strips the marks for the live region.
import { C, clamp, lerp, easeInOut, polar, el } from './lib/svg.js';
import { INK, element } from './lib/mol-draw.js';
import { metabolismPart } from '../palette.js';
import { bench, wrapText, fmt } from './lib/bench.js';

export const meta = {
  kind: 'krebs',
  title: 'The carbon, and where it goes',
  needsWebGL: false,
  aspect: 16 / 10,
  narrowAspect: 2 / 3,
};

// ---------------------------------------------------------------- the cycle
//
// Node n is the intermediate step n + 1 makes, so the step numbers on the ring and the numbers in the
// narrow list are the same numbers. `chain` is how many carbons lie along the ring; citrate and
// isocitrate hang their sixth off the middle one.
export const NODES = Object.freeze([
  { name: 'citrate', carbons: 6, chain: 5 },
  { name: 'isocitrate', carbons: 6, chain: 5 },
  { name: 'α-ketoglutarate', carbons: 5, chain: 5 },
  { name: 'succinyl-CoA', carbons: 4, chain: 4 },
  { name: 'succinate', carbons: 4, chain: 4 },
  { name: 'fumarate', carbons: 4, chain: 4 },
  { name: 'malate', carbons: 4, chain: 4 },
  { name: 'oxaloacetate', carbons: 4, chain: 4 },
]);
const OAA = 7;

// Step r takes the molecule from node (r + 7) % 8 to node r. What it releases and reduces, the carbon
// arithmetic the centre shows after it, and the sentence that says what it did.
export const STEPS = Object.freeze([
  { co2: 0, nadh: 0, fadh2: 0, atp: 0, sum: '2 + 4 = 6', words: 'The acetyl group joins oxaloacetate, and the six-carbon citrate is made.' },
  { co2: 0, nadh: 0, fadh2: 0, atp: 0, sum: '6', words: 'Citrate is rearranged into isocitrate. Nothing leaves.' },
  { co2: 1, nadh: 1, fadh2: 0, atp: 0, sum: '6 − 1 = 5', words: 'A carbon leaves as CO_2, and not one of the two that just arrived. NAD^+ is reduced to NADH.' },
  { co2: 1, nadh: 1, fadh2: 0, atp: 0, sum: '5 − 1 = 4', words: 'A second carbon leaves as CO_2, again not one of the two that just arrived, with a second NADH.' },
  { co2: 0, nadh: 0, fadh2: 0, atp: 1, sum: '4', words: 'A phosphate goes to a nucleotide: one ATP. Succinate’s two ends are alike, so a label on one is now shared by both.' },
  { co2: 0, nadh: 0, fadh2: 1, atp: 0, sum: '4', words: 'FAD is reduced to FADH_2.' },
  { co2: 0, nadh: 0, fadh2: 0, atp: 0, sum: '4', words: 'Water is added.' },
  { co2: 0, nadh: 1, fadh2: 0, atp: 0, sum: '4', words: 'A third NAD^+ is reduced, and oxaloacetate is back: two carbons in this turn, and two out.' },
]);
const PER_TURN = Object.freeze(['co2', 'nadh', 'fadh2', 'atp'].reduce((o, key) => ({ ...o, [key]: STEPS.reduce((n, s) => n + s[key], 0) }), {}));

// Where each carbon of the molecule before step r goes: a slot of the molecule after it, or 'co2'.
// Slots run along the chain from the trailing end to the leading one; slot 5 of citrate and isocitrate
// is the carboxyl hanging off slot 2. Join: oxaloacetate's C1 becomes that hanging carboxyl and its C2 the
// middle carbon, and the acetyl group's two carbons (not in this table) take slots 0 and 1.
const MAP = Object.freeze([
  [5, 2, 3, 4],
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 'co2'],
  [0, 1, 2, 3, 'co2'],
  [0, 1, 2, 3],
  [0, 1, 2, 3],
  [0, 1, 2, 3],
  [0, 1, 2, 3],
]);
const SYMMETRIC_FROM = 4; // succinate, the product of step 5 (index 4), is where the two ends become alike

// What a label's slot is, for the words: a carboxyl, one of the two middle carbons of a four-carbon acid,
// or neither (which the words then call a carbon).
const ROLE = Object.freeze([
  ['carboxyl', null, null, null, 'carboxyl', 'carboxyl'],
  ['carboxyl', null, null, null, 'carboxyl', 'carboxyl'],
  ['carboxyl', null, null, null, 'carboxyl'],
  ['carboxyl', null, null, null],
  ['carboxyl', 'middle', 'middle', 'carboxyl'],
  ['carboxyl', 'middle', 'middle', 'carboxyl'],
  ['carboxyl', 'middle', 'middle', 'carboxyl'],
  ['carboxyl', 'middle', 'middle', 'carboxyl'],
]);

// The six carbons a reader can label. `acetyl` is the share on the waiting acetyl group's two carbons;
// `oaa` the share on oxaloacetate's four, numbered from the carboxyl beside the keto group.
export const LABELS = Object.freeze([
  null,
  { id: 'acetyl-1', short: 'acetyl C1', what: 'the acetyl group’s carbonyl carbon', acetyl: [1, 0] },
  { id: 'acetyl-2', short: 'acetyl C2', what: 'the acetyl group’s methyl carbon', acetyl: [0, 1] },
  { id: 'oxaloacetate-1', short: 'oxaloacetate C1', what: 'oxaloacetate’s carboxyl beside the keto group', oaa: 0 },
  { id: 'oxaloacetate-2', short: 'oxaloacetate C2', what: 'oxaloacetate’s keto carbon', oaa: 1 },
  { id: 'oxaloacetate-3', short: 'oxaloacetate C3', what: 'oxaloacetate’s CH_2 carbon', oaa: 2 },
  { id: 'oxaloacetate-4', short: 'oxaloacetate C4', what: 'oxaloacetate’s far carboxyl', oaa: 3 },
]);

// The drains: which intermediate each takes, what it builds, and what a label drained with it is
// called. A table, so another chapter can mount the figure with its own (see the header).
export const DRAINS = Object.freeze({
  fat: { node: 0, label: 'Drain for fat', short: 'Fat', product: 'fat', into: 'exported citrate', aria: 'Drain for fat, send half the citrate out of the mitochondrion each turn, where its acetyl group builds fat' },
  glutamate: { node: 2, label: 'Drain for glutamate', short: 'Glutamate', product: 'glutamate', into: 'glutamate', aria: 'Drain for glutamate, take half the α-ketoglutarate each turn to build glutamate' },
  aspartate: { node: 7, label: 'Drain for aspartate', short: 'Aspartate', product: 'aspartate', into: 'aspartate', aria: 'Drain for aspartate, take half the oxaloacetate each turn to build aspartate' },
});

// §7.6's rates.
const ATP_PER_NADH = 2.5;
const ATP_PER_FADH2 = 1.5;
// What each fuel's route makes before and around the cycle, and how many turns it pays for.
export const FUELS = Object.freeze({
  glucose: {
    label: 'Glucose', name: 'glucose', carbons: 6, grams: 180.16, turns: 2, entry: 'acetyl-CoA', entryNode: null,
    outside: { nadh: 4, fadh2: 0, atp: 2 }, tissue: 'heart, liver and brain',
    aria: 'Glucose, feed the cycle from glucose, through glycolysis and the link reaction',
  },
  'fatty-acid': {
    label: 'Fatty acid', name: 'palmitate', carbons: 16, grams: 256.42, turns: 8, entry: 'acetyl-CoA', entryNode: null,
    outside: { nadh: 7, fadh2: 7, atp: -2 }, cuts: 7,
    aria: 'Fatty acid, feed the cycle from a sixteen-carbon fatty acid, cut two carbons at a time',
  },
  'amino-acid': {
    label: 'Amino acid', name: 'glutamate', carbons: 5, grams: 147.13, turns: 1, entry: 'α-ketoglutarate', entryNode: 2,
    // Glutamate dehydrogenase 1 NADH; α-ketoglutarate to oxaloacetate 2 NADH, 1 FADH2, 1 ATP; oxaloacetate
    // to pyruvate −1 GTP +1 ATP; the link reaction 1 NADH; the urea, −2 per nitrogen.
    outside: { nadh: 4, fadh2: 1, atp: -1 },
    aria: 'Amino acid, feed the cycle from glutamate, which enters as α-ketoglutarate',
  },
});
export function fuelYield(f) {
  const nadh = f.outside.nadh + f.turns * PER_TURN.nadh;
  const fadh2 = f.outside.fadh2 + f.turns * PER_TURN.fadh2;
  const atp = f.outside.atp + f.turns * PER_TURN.atp;
  const total = nadh * ATP_PER_NADH + fadh2 * ATP_PER_FADH2 + atp;
  return { nadh, fadh2, atp, total, perGram: total / f.grams };
}

// The pace, in seconds of the figure's clock, and the pool.
const T_STEP = 0.7; // one reaction at the full trace
const DWELL = 0.36; // the share of each reaction spent resting at the intermediate before moving on
const L_MIN = 0.2; // below this share of the trace, the acetyl group cannot find an oxaloacetate
const DRAIN_SHARE = 0.5;
const TOP_RATE = 0.1; // the trace per second that carboxylating pyruvate adds
const STEP_CAP = 10; // the longest one Step will run the clock for, in seconds
const TICK = 1 / 60;

// ---------------------------------------------------------------- exact shares
//
// A share is m × 2^e. Every step halves or adds, so m stays a small odd integer times a power of two and
// the arithmetic is exact in a double as long as the exponent is carried separately.
const two = (n) => 2 ** n;
function dyAdd(a, b) {
  if (!b.m) return a;
  if (!a.m) return b;
  const e = Math.max(a.e, b.e);
  return { m: a.m * two(a.e - e) + b.m * two(b.e - e), e };
}
function dyNum({ m, e }) {
  if (!(m > 0)) return 0;
  const v = m * two(e);
  return v > 0 ? v : Number.MIN_VALUE;
}
// n / 2^k with n odd, or n = 0.
function dyParts({ m, e }) {
  if (!(m > 0)) return { n: 0, k: 0 };
  let n = m;
  let k = -e;
  for (let i = 0; i < 80 && !Number.isInteger(n); i += 1) {
    n *= 2;
    k += 1;
  }
  while (k > 0 && n % 2 === 0) {
    n /= 2;
    k -= 1;
  }
  return { n, k };
}
// A share as the ledger prints it: 'none', 'all', '3/8', or '1/2^{40}' once the denominator is too long
// to read as digits.
function shareText(d) {
  const { n, k } = dyParts(d);
  if (n === 0) return 'none';
  if (k <= 0) return n * two(-k) >= 1 ? 'all' : String(n * two(-k));
  if (n >= 1000) return fmt(dyNum(d), 3);
  return k <= 10 ? `${n}/${two(k)}` : `${n}/2^{${k}}`;
}
const WORDS = Object.freeze({ '1/2': 'half', '1/4': 'a quarter', '3/4': 'three quarters', '1/8': 'an eighth', '3/8': 'three eighths' });
function shareWords(d) {
  const { n, k } = dyParts(d);
  if (n === 0) return 'none';
  if (k <= 0) return 'all';
  const t = `${n}/${two(k)}`;
  if (WORDS[t]) return WORDS[t];
  if (n >= 1000) return fmt(dyNum(d), 3);
  return k <= 10 ? t : `${n} part${n === 1 ? '' : 's'} in 2 to the power ${k}`;
}

// ---------------------------------------------------------------- the label's model
//
// Slot shares are mantissas over 2^E. `rel` is what this turn has released, over the same 2^E; `co2`
// what each decarboxylation released this turn, for the drawing; `byTurn` each finished turn's release;
// `drained` what each drain has taken, keyed by the drain's id.
function newLabel(idx, drainIds) {
  const def = LABELS[idx];
  if (!def) return null;
  const lab = { def, E: 0, s: [0, 0, 0, 0], acetyl: def.acetyl ? [...def.acetyl] : null, rel: 0, co2: [0, 0], byTurn: [], drained: {}, first: null };
  if (def.oaa !== undefined) lab.s[def.oaa] = 1;
  for (const id of drainIds) lab.drained[id] = { m: 0, e: 0 };
  return lab;
}

function labelStep(lab, r, turn) {
  const to = new Array(NODES[r].carbons).fill(0);
  let out = 0;
  MAP[r].forEach((dest, i) => {
    const v = lab.s[i] || 0;
    if (dest === 'co2') out += v;
    else to[dest] += v;
  });
  if (r === 0) {
    if (lab.acetyl) {
      to[0] += lab.acetyl[0];
      to[1] += lab.acetyl[1];
    }
    lab.acetyl = null;
    lab.co2 = [0, 0];
  }
  if (r === SYMMETRIC_FROM) symmetrise(to);
  lab.s = to;
  if (r === 2 || r === 3) lab.co2[r - 2] = out;
  if (out > 0) {
    lab.rel += out;
    if (lab.first === null) lab.first = turn;
  }
  renormalise(lab);
}

function symmetrise(s) {
  const n = s.length;
  const was = [...s];
  for (let i = 0; i < n; i += 1) s[i] = (was[i] + was[n - 1 - i]) / 2;
}

function drainLabel(lab, id) {
  let took = 0;
  lab.s = lab.s.map((v) => {
    const half = v * DRAIN_SHARE;
    took += half;
    return v - half;
  });
  if (took > 0) lab.drained[id] = dyAdd(lab.drained[id] ?? { m: 0, e: 0 }, { m: took, e: lab.E });
  renormalise(lab);
}

function closeTurn(lab) {
  lab.byTurn.push({ m: lab.rel, e: lab.E });
  lab.rel = 0;
}

// Lower the shared exponent once everything still moving is below 2^-64, so nothing underflows.
function renormalise(lab) {
  const big = Math.max(lab.rel, ...lab.s, ...lab.co2);
  if (big > 0 && big < two(-64)) {
    const up = two(64);
    lab.s = lab.s.map((v) => v * up);
    lab.rel *= up;
    lab.co2 = lab.co2.map((v) => v * up);
    lab.E -= 64;
  }
}

// ---------------------------------------------------------------- typesetting
//
// `_2`, `^+` and `^{40}` in a string become a subscript and a superscript tspan; `plain` strips the marks
// for the live region. The same pair calvin-cycle.js and glycolysis.js carry.
const MARK = /([_^])(?:\{([^}]*)\}|(.))/g;
function segments(str) {
  const out = [];
  let last = 0;
  MARK.lastIndex = 0;
  for (let hit = MARK.exec(str); hit; hit = MARK.exec(str)) {
    if (hit.index > last) out.push({ text: str.slice(last, hit.index), shift: null });
    out.push({ text: hit[2] ?? hit[3], shift: hit[1] === '_' ? 'sub' : 'sup' });
    last = MARK.lastIndex;
  }
  if (last < str.length) out.push({ text: str.slice(last), shift: null });
  return out;
}
function plain(str) {
  return segments(String(str)).map((s) => s.text).join('');
}
function typeset(svg) {
  for (const t of svg.querySelectorAll('text')) {
    const s = t.textContent;
    if (!s || !/[_^]/.test(s) || t.children.length) continue;
    t.textContent = '';
    for (const part of segments(s)) {
      if (!part.shift) t.append(part.text);
      else t.append(el('tspan', { 'baseline-shift': part.shift === 'sub' ? '-0.3em' : '0.55em', 'font-size': '72%', text: part.text }));
    }
  }
}

const CARBON = element('C');
const OXYGEN = element('O');
const ATP_PART = metabolismPart('atp');
const LOADED = metabolismPart('electronCarrierLoaded');

// A string's advance, a little wider than the bench's 0.53 em, because most of these are set at 600.
const EM = 0.55;
const widthOf = (str, size, em = EM) => plain(str).length * size * em;
const f2 = (v) => fmt(v, 2);
const round = (v, dp = 3) => Number(Number(v).toFixed(dp));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const pct = (v) => `${Math.round(v * 100)}%`;
const RAD = Math.PI / 180;

const CSS = (scope) => `
${scope} .kb-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.1em; }
${scope} .kb-head.kb-stop { fill: var(--coral-text); }
/* The label's value is as wide as its longest, so stepping through the six carbons never re-flows the
   toolbar and resizes the ring under the reader's finger. */
${scope} .tb-stepper .tb-val { min-width: 8em; text-align: center; }
${scope} .kb-name { fill: var(--ink-soft); }
${scope} .kb-name.is-now { fill: var(--ink); font-weight: 650; }
${scope} .kb-count { fill: var(--ink-faint); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
${scope} .kb-count.is-now { fill: var(--ink); font-weight: 700; }
${scope} .kb-step { fill: var(--ink-faint); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
${scope} .kb-step.is-next { fill: var(--ink); font-weight: 700; }
${scope} .kb-sum { fill: var(--ink); font-weight: 650; font-variant-numeric: lining-nums tabular-nums; }
${scope} .kb-note { fill: var(--ink-soft); }
${scope} .kb-faint { fill: var(--ink-faint); }
${scope} .kb-alert { fill: var(--coral-text); font-weight: 600; }
${scope} .kb-out { fill: var(--coral-text); font-weight: 600; }
${scope} .kb-in { fill: var(--leaf-text); font-weight: 600; }
${scope} .kb-gold { fill: ${INK.gold}; font-weight: 600; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  return mountKrebs(root, ctx);
}

export function mountKrebs(root, ctx, { drains = DRAINS } = {}) {
  const NARROW_W = 600;
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 20260924 });
  const reduce = Boolean(ctx.reducedMotion);
  const DRAIN_IDS = Object.keys(drains);

  // The reader's settings, which a label pick keeps and Reset puts back.
  const set = { label: 0, drain: null, topUp: false, fuel: 'glucose' };
  // The run: reactions completed, progress through the next, the clock, the pool, the label.
  const st = { k: 0, prog: 0, ticks: 0, L: 1, drainTick: -1e9, drainNode: -1, lab: null };
  // What the last press refused, when it refused: 'stalled'.
  let note = null;
  let hush = false;
  let mode = 'side';
  let layoutKey = '';
  let ledgerKey = '';
  // Whether the ring's middle had room for the turn; the ring draws first and the books read it.
  let turnInCentre = true;

  function resetRun() {
    st.k = 0;
    st.prog = 0;
    st.ticks = 0;
    st.L = 1;
    st.drainTick = -1e9;
    st.drainNode = -1;
    st.lab = newLabel(set.label, DRAIN_IDS);
  }
  resetRun();

  // ---- panes ----
  const ring = b.pane('ring', {
    as: 'svg',
    focus: true,
    aria: 'The Krebs cycle as a ring of eight intermediates, each a chain of carbon atoms with its carbon count, the fuel handing acetyl groups in at the top, and the carbon dioxide, NADH, FADH2 and ATP each step makes beside it. Press the right arrow or S to step, Space to run, L to label the next carbon, D to change the drain, T to top up, F to change the fuel, and Home to reset.',
  });
  const ledger = b.pane('ledger', { as: 'svg' });

  const WIDE = {
    columns: 'var(--kb-cols, minmax(0, 60fr) minmax(0, 40fr))',
    rows: 'var(--kb-rows, minmax(0, 1fr))',
    at: { ring: [1, 1], ledger: ['var(--kb-lc, 2)', 'var(--kb-lr, 1)'] },
  };
  const NARROW = {
    columns: 'minmax(0, 1fr)',
    rows: 'var(--kb-nrows, minmax(0, 1fr) minmax(0, 118px))',
    at: { ring: [1, 1], ledger: [1, 2] },
  };
  b.compose({ wide: WIDE, narrow: NARROW });

  const changed = () => {
    if (hush) return;
    b.redraw();
    b.announce();
  };
  const quietly = (fn) => {
    hush = true;
    try {
      fn();
    } finally {
      hush = false;
    }
  };

  // ---- controls: run it; label it; drain it; feed it ----
  b.action('Step', () => stepOnce(), { primary: true, aria: 'Step, take the cycle on by one reaction' });
  const runCtl = b.run({
    primary: false,
    onChange: () => {
      note = null;
      changed();
    },
  });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the cycle back as it opened' });
  b.divide();

  const labelCtl = b.stepper('Label a carbon', {
    short: 'Label',
    min: 0, max: LABELS.length - 1, step: 1, value: 0,
    format: (v) => (LABELS[v] ? LABELS[v].short : 'none'),
    valueText: (v) => (LABELS[v] ? `${LABELS[v].short}, ${plain(LABELS[v].what)}` : 'no carbon labelled'),
    onInput: (v) => pickLabel(Math.round(Number(v))),
  });
  b.divide();

  // The fuel before the drain: the three fuels fit on the first row beside the run controls and the label,
  // and the drain's four and Top up fill the second, so a 900 px stage has two rows of controls, not three.
  const fuelCtl = b.choice('Fuel', Object.entries(FUELS).map(([id, f]) => ({ id, label: f.label, aria: f.aria })), (id) => {
    set.fuel = id;
    changed();
  }, { value: 'glucose', segmented: true });
  b.divide();

  const drainCtl = b.choice('Drain', [
    { id: 'none', label: 'No drain', short: 'None', aria: 'No drain, keep every intermediate in the cycle' },
    ...DRAIN_IDS.map((id) => ({ id, label: drains[id].label, short: drains[id].short, aria: drains[id].aria })),
  ], (id) => {
    set.drain = id === 'none' ? null : id;
    note = null;
    changed();
  }, { value: 'none', segmented: true });
  const topCtl = b.toggle('Top up', (on) => {
    set.topUp = on;
    note = null;
    changed();
  }, { aria: 'Top up, carboxylate pyruvate to make oxaloacetate' });

  b.keys({
    ArrowRight: () => stepOnce(),
    s: () => stepOnce(),
    S: () => stepOnce(),
    ' ': () => runCtl.toggle(),
    Home: () => resetAll(),
    l: () => labelCtl.set((set.label + 1) % LABELS.length),
    L: () => labelCtl.set((set.label + 1) % LABELS.length),
    d: () => drainCtl.next(),
    D: () => drainCtl.next(),
    t: () => topCtl.toggle(),
    T: () => topCtl.toggle(),
    f: () => fuelCtl.next(),
    F: () => fuelCtl.next(),
  });

  // ---- the model ----
  const stalledNow = () => st.k % 8 === 0 && st.L < L_MIN;

  // One sixtieth of a second of the cycle. Returns true when it finished a reaction.
  function tick() {
    st.ticks += 1;
    if (set.topUp && st.L < 1) st.L = Math.min(1, st.L + TOP_RATE * TICK);
    const r = st.k % 8;
    let rate = 1 / T_STEP;
    if (r === 0) {
      if (st.L < L_MIN) return false;
      rate *= Math.min(1, st.L);
    }
    st.prog += rate * TICK;
    if (st.prog < 1 - 1e-9) return false;
    st.prog = 0;
    complete(r);
    return true;
  }

  function complete(r) {
    const turn = Math.floor(st.k / 8) + 1;
    if (st.lab) labelStep(st.lab, r, turn);
    st.k += 1;
    const dr = set.drain ? drains[set.drain] : null;
    if (dr && dr.node === r) {
      st.L *= 1 - DRAIN_SHARE;
      if (st.lab) drainLabel(st.lab, set.drain);
      st.drainTick = st.ticks;
      st.drainNode = r;
    }
    if (r === 7 && st.lab) closeTurn(st.lab);
  }

  b.clock({
    step: TICK,
    advance() {
      if (!b.playing) return;
      const wasStalled = stalledNow();
      const done = tick();
      if ((done && st.k % 8 === 0) || (!wasStalled && stalledNow())) b.announce();
    },
    restart() {
      resetRun();
      note = null;
    },
  });

  // ---- reader actions ----
  function stepOnce() {
    if (b.playing) quietly(() => runCtl.set(false));
    note = null;
    if (stalledNow() && !set.topUp) {
      note = 'stalled';
    } else {
      const k0 = st.k;
      for (let i = 0; i < STEP_CAP / TICK && st.k === k0; i += 1) tick();
      if (st.k === k0) note = 'stalled';
    }
    b.redraw();
    b.announce();
  }

  function pickLabel(v) {
    set.label = clamp(v, 0, LABELS.length - 1);
    if (b.playing) quietly(() => runCtl.set(false));
    resetRun();
    note = null;
    changed();
  }

  function resetAll() {
    quietly(() => {
      runCtl.set(false);
      labelCtl.set(0);
      drainCtl.set('none', { quiet: true });
      topCtl.set(false, { quiet: true });
      fuelCtl.set('glucose', { quiet: true });
      set.label = 0;
      set.drain = null;
      set.topUp = false;
      set.fuel = 'glucose';
    });
    note = null;
    b.restart();
    b.announce();
  }

  // ---- the books, from the number of reactions done ----
  function counted(k) {
    const full = Math.floor(k / 8);
    const part = k % 8;
    const n = (r) => full + (r < part ? 1 : 0);
    const sum = (key) => STEPS.reduce((acc, s, r) => acc + s[key] * n(r), 0);
    return { turn: n(0), cIn: 2 * n(0), cOut: sum('co2'), nadh: sum('nadh'), fadh2: sum('fadh2'), atp: sum('atp') };
  }
  function booksNow() {
    const all = counted(st.k);
    const start = all.turn > 0 ? counted(8 * (all.turn - 1)) : all;
    const turn = {
      cIn: all.cIn - start.cIn, cOut: all.cOut - start.cOut, nadh: all.nadh - start.nadh,
      fadh2: all.fadh2 - start.fadh2, atp: all.atp - start.atp,
    };
    // Reactions done in the current turn, 0 before the first join and 1 to 8 after it.
    const done = all.turn > 0 ? st.k - 8 * (all.turn - 1) : 0;
    return { all, turn, done };
  }

  // ---- the label, as the ledger and describe() read it ----
  const nodeNow = () => (st.k + 7) % 8;
  function labelNow() {
    const lab = st.lab;
    if (!lab) return null;
    const remaining = lab.acetyl ? { m: lab.acetyl[0] + lab.acetyl[1], e: lab.E } : { m: lab.s.reduce((a, v) => a + v, 0), e: lab.E };
    const drainedIds = DRAIN_IDS.filter((id) => lab.drained[id] && lab.drained[id].m > 0);
    const drained = drainedIds.reduce((acc, id) => dyAdd(acc, lab.drained[id]), { m: 0, e: 0 });
    let position;
    if (lab.acetyl) position = 'acetyl-CoA';
    else if (remaining.m > 0) position = NODES[nodeNow()].name;
    else if (drainedIds.length) position = `carbon dioxide and ${drainedIds.map((id) => drains[id].into).join(' and ')}`;
    else position = 'carbon dioxide';
    return { lab, remaining, drained, drainedIds, position, thisTurn: { m: lab.rel, e: lab.E } };
  }

  // Where on the molecule the label sits, in words: 'a quarter on each of its four carbons'.
  function spread(lab) {
    if (lab.acetyl) return lab.acetyl[0] > 0 ? 'on the carbonyl carbon' : 'on the methyl carbon';
    const node = nodeNow();
    const on = lab.s.map((m, i) => ({ m, i })).filter((x) => x.m > 0);
    if (!on.length) return '';
    const total = on.reduce((a, x) => a + x.m, 0);
    const equal = on.every((x) => x.m === on[0].m);
    const roles = new Set(on.map((x) => ROLE[node][x.i]));
    const role = roles.size === 1 ? [...roles][0] : null;
    const noun = role === 'carboxyl' ? 'carboxyl' : role === 'middle' ? 'middle carbon' : 'carbon';
    // Once some of the label has left, "it" would read as the whole of it; the words say what is left.
    const whole = dyNum({ m: total, e: lab.E }) > 1 - 1e-9;
    if (on.length === 1) return `${whole ? 'all of it' : 'all that is left'} on one ${noun}`;
    if (!equal) return `${whole ? '' : 'what is left, '}spread over ${on.length} carbons`;
    const each = { m: on[0].m / total, e: 0 };
    const count = on.length === 2 ? 'each' : `each of ${on.length === NODES[node].carbons ? 'its' : ''} ${['', '', 'two', 'three', 'four', 'five', 'six'][on.length]}`.replace(/\s+/g, ' ');
    return `${shareWords(each)} of ${whole ? 'it' : 'what is left'} on ${count} ${noun}${on.length === 2 ? '' : 's'}`.replace(/\s+/g, ' ');
  }

  function state() {
    const bk = booksNow();
    const lv = labelNow();
    const fuel = FUELS[set.fuel];
    const y = fuelYield(fuel);
    const dr = set.drain ? drains[set.drain] : null;
    const stalled = stalledNow();
    return {
      turn: bk.all.turn,
      position: NODES[nodeNow()].name,
      carbonsHere: NODES[nodeNow()].carbons,
      carbonsIn: bk.all.cIn,
      carbonsOut: bk.all.cOut,
      thisTurn: { ...bk.turn },
      nadhPerTurn: PER_TURN.nadh,
      fadh2PerTurn: PER_TURN.fadh2,
      atpPerTurn: PER_TURN.atp,
      nadhTotal: bk.all.nadh,
      fadh2Total: bk.all.fadh2,
      atpTotal: bk.all.atp,
      labelledCarbon: lv ? lv.lab.def.id : null,
      labelPosition: lv ? lv.position : null,
      labelFirstLeftOnTurn: lv ? lv.lab.first : null,
      labelReleasedByTurn: lv ? lv.lab.byTurn.map(dyNum) : [],
      labelReleasedThisTurn: lv ? dyNum(lv.thisTurn) : 0,
      labelRemaining: lv ? dyNum(lv.remaining) : 0,
      labelDrained: lv ? dyNum(lv.drained) : 0,
      labelDrainedInto: lv ? lv.drainedIds.map((id) => drains[id].into) : [],
      oxaloacetateLevel: round(st.L, 3),
      joinRate: stalled ? 0 : round(Math.min(1, st.L), 3),
      drainedTo: dr ? dr.product : null,
      drainedFrom: dr ? NODES[dr.node].name : null,
      stalled,
      shortOf: stalled ? 'oxaloacetate' : null,
      toppedUp: set.topUp,
      fuel: set.fuel,
      fuelMolecule: fuel.name,
      entryPoint: fuel.entry,
      acetylPerFuel: fuel.turns,
      atpPerFuel: y.total,
      atpPerGram: round(y.perGram, 2),
      cutsDone: set.fuel === 'fatty-acid' ? cutsDone(bk.all.turn) : null,
      refused: note,
      t: round(st.ticks * TICK, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // How many two-carbon cuts the palmitate feeding the join has had: the acetyl group waiting is the
  // (turn mod 8) + 1th of its eight, and the last cut makes two.
  function cutsDone(turn) {
    return Math.min((turn % 8) + 1, FUELS['fatty-acid'].cuts);
  }

  // ---------------------------------------------------------------- words
  //
  // Every sentence is read in every state its parts can take: before the first join, mid-turn, at a
  // turn's end, stalled and slowed, with and without a label, drained and not, for each fuel. Numbers come
  // from the books and the label's model, never from a sentence's own arithmetic.
  function refusedWords() {
    if (note !== 'stalled') return '';
    return set.topUp
      ? 'Nothing to step yet: the acetyl group is still waiting for oxaloacetate. '
      : 'Nothing to step: the acetyl group has no oxaloacetate to join. Top up, or take the drain off and reset. ';
  }

  function poolWords() {
    if (stalledNow()) return stalledWords()[set.topUp ? 0 : 1];
    if (st.L < 0.999 && st.k % 8 === 0) return `Oxaloacetate is at ${pct(st.L)} of its usual trace, so the next join comes at ${pct(Math.min(1, st.L))} of the usual rate.`;
    if (st.L < 0.999) return `Oxaloacetate is at ${pct(st.L)} of its usual trace.`;
    return '';
  }

  const startWords = () => 'An acetyl group is waiting to join oxaloacetate.';
  // Every sentence poolWords() can put in the centre when the cycle has stopped, for measuring.
  const stalledWords = () => ['Stopped, short of oxaloacetate, until the top-up has made enough.', 'Stopped: short of oxaloacetate for the acetyl group to join.'];

  function centreWords(nar = false) {
    if (stalledNow()) return poolWords();
    if (st.k === 0) return startWords();
    const r = (st.k - 1) % 8;
    let s = STEPS[r].words;
    if (!nar && st.k % 8 === 0 && st.L < 0.999) s = `${s} ${poolWords()}`;
    return s;
  }

  function labelWords() {
    const lv = labelNow();
    if (!lv) return '';
    const who = `The label, on ${lv.lab.def.what},`;
    const turns = lv.lab.byTurn.length;
    const left = turns ? `Left on turn${turns === 1 ? '' : 's'} ${turns === 1 ? '1' : `1 to ${turns}`}: ${lv.lab.byTurn.map(shareWords).join(', ')}.` : '';
    const where = lv.remaining.m > 0
      ? `${who} is in ${lv.position}, ${spread(lv.lab)}.`
      : `${who} has all left the cycle, as ${lv.position}.`;
    const still = lv.remaining.m > 0 ? ` Still in the cycle: ${shareWords(lv.remaining)}.` : '';
    const drained = lv.drained.m > 0 ? ` Drained off: ${shareWords(lv.drained)}.` : '';
    return `${where} ${left}${still}${drained}`.replace(/\s+/g, ' ').trim();
  }

  b.onAnnounce((d) => {
    const where = d.turn === 0 && st.k === 0
      ? 'Before the first join: oxaloacetate, with an acetyl group waiting.'
      : `Turn ${d.turn}, after step ${((st.k - 1) % 8) + 1}: ${d.position}, ${d.carbonsHere} carbons. ${STEPS[(st.k - 1) % 8].words}`;
    const books = `So far ${d.carbonsIn} carbons in and ${d.carbonsOut} out; NADH ${d.nadhTotal}, FADH2 ${d.fadh2Total}, ATP ${d.atpTotal}.`;
    const pool = poolWords();
    const lab = labelWords();
    const fuel = `Fuel: ${FUELS[d.fuel].name}, entering as ${d.entryPoint}.`;
    return plain([refusedWords(), where, books, pool, lab, fuel].filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim();
  });

  // ---------------------------------------------------------------- geometry
  //
  // Node n sits at 22.5° + 45n clockwise from twelve o'clock and step r at 45r, so the join is at the
  // top, where the fuel comes in, and the molecule passes each step's number on its way between two
  // intermediates. A slot is an angle and a radius; the chain's carbons are sp apart along the ring.
  const nodeAngle = (n) => 22.5 + 45 * n;

  // The room the ring leaves round itself, wide and narrow: the gap over its top, the width a step's
  // products take beside it (at three o'clock a CO2 and an NADH in a row, 109 px past the ring at the
  // largest disc and type, 114 with a margin), and what the bottom names and the ATP take below it. The
  // top names and their extra lines are budgeted in geometry(). The fuel's band over all of that is
  // 56 px deep, which is what its route needs at the largest disc and type it is drawn at, and 20 px as
  // one line of type.
  const ROOM = Object.freeze({
    wide: { side: 114, topGap: 30, below: 40 },
    narrow: { side: 66, topGap: 20, below: 30 },
  });
  const ROUTE_BAND = 56;
  const LINE_BAND = 20;
  // Narrow, under the ring: the sentence and the list of names, in 9.5 px type. The list is four
  // columns of two rows where four fit (a 372 px pane) and three of three below that. The sentence
  // takes the room of the longest one it can say at this width, so the ring is the same size at every
  // step; and where that room would take the ring under R_SENTENCE, the sentence gives it back and the
  // ledger's rows carry what the cycle is short of.
  const NARROW_FS = 9.5;
  const LIST_LH = 13;
  const SENT_LH = 12.2;
  const R_SENTENCE = 72;
  const sentenceLines = new Map();
  function mostLines(width) {
    const key = Math.round(width);
    if (!sentenceLines.has(key)) {
      const all = [...STEPS.map((s) => s.words), startWords(), ...stalledWords()];
      sentenceLines.set(key, Math.max(...all.map((s) => wrapText(s, width, NARROW_FS).length)));
    }
    return sentenceLines.get(key);
  }
  const listCols = (w) => (w >= 372 ? 4 : 3);

  // `compact`: the route as one line of type, with the acetyl group waiting just over the ring.
  function geometry(w, h, compact = false) {
    const nar = Boolean(b.narrow);
    const line = nar || compact;
    const room = nar ? ROOM.narrow : ROOM.wide;
    const cols = listCols(w);
    const listH = nar ? Math.ceil(8 / cols) * LIST_LH + 6 : 0;
    const feedH = line ? LINE_BAND : ROUTE_BAND;
    const byWidth = (w - 2 * room.side) / 2;
    const usable = h - feedH - room.topGap - room.below - listH;
    let sentH = nar ? mostLines(w - 16) * SENT_LH + 8 : 0;
    if (nar && Math.min(byWidth, (usable - sentH) / 2) < R_SENTENCE) sentH = 0;
    let R = clamp(Math.min(byWidth, (usable - sentH) / 2), 26, 250);
    // Wide, the two top nodes carry their names, and any drain or feed line over the name, up towards the
    // fuel's route. The ring is sized so the highest of those lines clears the route by 6 px: room for
    // one line always, so a drain or the top-up never moves the ring, and for a second when oxaloacetate
    // is both drained and topped up.
    const topLines = nar ? 0 : Math.max(1, extrasAt(0).length, extrasAt(7).length);
    const above = (RR) => {
      if (nar) return RR + room.topGap;
      const nf = clamp(RR * 0.068, 10, 12.5);
      const stack = Math.cos(22.5 * RAD) * (RR + clamp(RR * 0.043, 2.4, 7.2) * 1.9 + 17) + (0.71 + 1.22 * topLines) * nf + 6;
      return Math.max(RR + room.topGap, stack);
    };
    while (R > 26 && above(R) + R + room.below + sentH + listH > h - feedH) R -= 0.5;
    const r = clamp(R * 0.043, 2.4, 7.2);
    const sp = r * 2.3;
    const spare = Math.max(0, h - feedH - above(R) - R - room.below - sentH - listH);
    const cx = w / 2;
    const cy = feedH + above(R) + spare / 2;
    const dA = (sp / R) / RAD;
    const numFs = clamp(R * 0.082, 9.5, 14);
    const nameFs = nar ? 9.5 : clamp(R * 0.068, 10, 12.5);
    const tokFs = nar ? 9 : clamp(R * 0.06, 9.5, 11);
    const feedY = line ? 13 : 28;
    return {
      w, h, nar, line, cx, cy, R, r, sp, dA, numFs, nameFs, tokFs, feedH, feedY, listH, sentH, cols,
      numR: R - sp * 2.35,
      waitX: cx,
      waitY: line ? cy - R - room.topGap * 0.5 : feedY,
    };
  }

  function slotPolar(g, node, i) {
    const nd = NODES[node];
    const mid = (nd.chain - 1) / 2;
    if (i >= nd.chain) return { a: nodeAngle(node), rad: g.R - g.sp * 0.98 };
    return { a: nodeAngle(node) + (i - mid) * g.dA, rad: g.R };
  }
  const xy = (g, p) => polar(g.cx, g.cy, p.rad, p.a);

  // Where step r's products sit. A step on either side of the ring sets them in a row running outwards
  // from just outside the ring at the step's own height, the CO2 first, so a diagonal step's products lie
  // level between the two names above and below it rather than out along the diagonal into one of them;
  // the step at the bottom (the ATP) hangs its one token below the ring.
  function productSpots(g, r) {
    const s = STEPS[r];
    const a = 45 * r;
    const side = Math.sin(a * RAD);
    const [px, py] = polar(g.cx, g.cy, g.R + g.r * 1.9 + 3, a);
    const spots = {};
    const tok = tokenText(r);
    const rx = tok ? tokenRx(tok, g.tokFs) : 0;
    const ry = g.tokFs * 0.85;
    // Narrow, on a small ring, a token can come within reach of the step numbers either side of it; it
    // moves out, sideways or down, until it clears them.
    const near = g.nar && tok ? [numberAt(g, (r + 7) % 8), numberAt(g, r)] : [];
    const hits = (x0, x1, y0, y1) => near.filter((nb) => Math.min(x1, nb.x1) - Math.max(x0, nb.x0) > -2 && Math.min(y1, nb.y1) - Math.max(y0, nb.y0) > -1);
    if (Math.abs(side) < 0.3) {
      if (tok) {
        let ty = py + ry + 2;
        for (let i = 0; i < 3; i += 1) for (const nb of hits(px - rx, px + rx, ty - ry, ty + ry)) ty = Math.max(ty, nb.y1 + ry + 2);
        spots.tok = [px, ty];
      }
      spots.tokRx = rx;
      return spots;
    }
    const dir = Math.sign(side);
    const co2Half = g.sp * 0.92 + g.r * 0.9;
    let x = px + dir * 2;
    if (s.co2) {
      spots.co2 = [x + dir * co2Half, py];
      x += dir * (2 * co2Half + 6);
    }
    if (tok) {
      for (let i = 0; i < 3; i += 1) {
        for (const nb of hits(Math.min(x, x + dir * 2 * rx), Math.max(x, x + dir * 2 * rx), py - ry, py + ry)) x = dir > 0 ? Math.max(x, nb.x1 + 3) : Math.min(x, nb.x0 - 3);
      }
      spots.tok = [x + dir * rx, py];
    }
    spots.tokRx = rx;
    return spots;
  }
  const tokenText = (r) => (STEPS[r].nadh ? 'NADH' : STEPS[r].fadh2 ? 'FADH_2' : STEPS[r].atp ? 'ATP' : null);
  const tokenPart = (r) => (STEPS[r].atp ? ATP_PART : LOADED);
  const tokenRx = (str, fs) => widthOf(str, fs, 0.62) / 2 + fs * 0.6;

  // ---------------------------------------------------------------- drawing primitives

  function haloText(pane, x, y, str, { size, cls, anchor = 'middle', weight = null, parent } = {}) {
    return pane.text(x, y, str, {
      anchor, class: cls, 'font-size': fmt(size), 'font-weight': weight ?? undefined, parent,
      stroke: 'var(--paper-2)', 'stroke-width': `${fmt(Math.max(2.5, size * 0.32))}px`, 'stroke-linejoin': 'round', 'paint-order': 'stroke',
    });
  }

  function wedge(pane, x, y, rr, share, parent) {
    if (!(share > 0)) return;
    if (share >= 0.999) {
      pane.circle(x, y, rr, { fill: INK.gold }, parent);
      return;
    }
    const a = 360 * share;
    if (a < 1) return;
    const [x1, y1] = polar(x, y, rr, 0);
    const [x2, y2] = polar(x, y, rr, a);
    pane.path(`M${f2(x)} ${f2(y)} L${f2(x1)} ${f2(y1)} A${f2(rr)} ${f2(rr)} 0 ${a > 180 ? 1 : 0} 1 ${f2(x2)} ${f2(y2)} Z`, { fill: INK.gold }, parent);
  }

  // One carbon, with the share of the label it carries as a gold wedge and a gold ring round it.
  function carbon(pane, x, y, rr, share, parent) {
    pane.circle(x, y, rr, { fill: CARBON.fill, stroke: 'var(--paper-2)', 'stroke-width': f2(Math.max(0.7, rr * 0.17)) }, parent);
    if (share > 0) {
      wedge(pane, x, y, rr * 0.86, share, parent);
      pane.circle(x, y, rr * 1.62, { fill: 'none', stroke: INK.gold, 'stroke-width': f2(Math.max(1, rr * 0.28)) }, parent);
    }
  }
  const bondAttrs = (rr) => ({ stroke: C.soft, 'stroke-width': f2(Math.max(0.8, rr * 0.46)), 'stroke-linecap': 'round' });

  // A chain of n carbons from (x, y) to the right, sp apart; `shares` is the label on each.
  function flatChain(pane, x, y, n, rr, spc, { shares = null, parent } = {}) {
    for (let i = 0; i + 1 < n; i += 1) pane.line(x + i * spc, y, x + (i + 1) * spc, y, bondAttrs(rr), parent);
    for (let i = 0; i < n; i += 1) carbon(pane, x + i * spc, y, rr, shares ? shares[i] : 0, parent);
  }

  // O=C=O, the carbon carrying whatever label left in it; drawn in outline until it has been made.
  function co2(pane, x, y, rr, spc, share, lit, parent) {
    const d = spc * 0.92;
    if (!lit) {
      const dash = { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '1.8 1.5' };
      pane.circle(x, y, rr, dash, parent);
      pane.circle(x - d, y, rr * 0.9, dash, parent);
      pane.circle(x + d, y, rr * 0.9, dash, parent);
      return;
    }
    for (const sgn of [-1, 1]) {
      for (const off of [-rr * 0.3, rr * 0.3]) pane.line(x, y + off, x + sgn * d, y + off, { stroke: C.soft, 'stroke-width': f2(Math.max(0.7, rr * 0.24)) }, parent);
      pane.circle(x + sgn * d, y, rr * 0.9, { fill: OXYGEN.fill, stroke: 'var(--paper-2)', 'stroke-width': f2(rr * 0.3) }, parent);
    }
    carbon(pane, x, y, rr, share, parent);
  }

  function token(pane, x, y, str, part, lit, fs, parent) {
    const rx = tokenRx(str, fs);
    const ry = fs * 0.85;
    if (lit) pane.ellipse(x, y, rx, ry, { fill: part.color, stroke: part === ATP_PART ? C.soft : 'none', 'stroke-width': 0.8 }, parent);
    else pane.ellipse(x, y, rx, ry, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '2.2 1.8' }, parent);
    pane.text(x, y + fs * 0.36, str, { anchor: 'middle', 'font-size': fmt(fs), 'font-weight': 600, style: `fill:${lit ? part.symbolColor : 'var(--ink-faint)'}`, parent });
  }

  function arrowHead(pane, x, y, dx, dy, size, fill, parent) {
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const bx = x - ux * size;
    const by = y - uy * size;
    pane.path(`M${f2(x)} ${f2(y)} L${f2(bx - uy * size * 0.55)} ${f2(by + ux * size * 0.55)} L${f2(bx + uy * size * 0.55)} ${f2(by - ux * size * 0.55)} Z`, { fill }, parent);
  }

  // ---------------------------------------------------------------- the ring
  //
  // The visual progress through the current reaction: at rest for the first DWELL of it, then eased
  // along. Under reduced motion nothing moves between two states; the molecule is drawn where it is.
  function visProgress() {
    if (reduce || st.prog <= DWELL) return 0;
    return easeInOut((st.prog - DWELL) / (1 - DWELL));
  }

  function drawTrack(g) {
    ring.circle(g.cx, g.cy, g.R, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.4 });
    const next = st.k % 8;
    const stalled = stalledNow();
    for (let r = 0; r < 8; r += 1) {
      // An arrowhead on the ring just past each step, pointing the way round.
      const a = 45 * r + (g.nar ? 4 : 6.5) * (g.R > 80 ? 1 : 1.4);
      const [x, y] = polar(g.cx, g.cy, g.R, a);
      const [x2, y2] = polar(g.cx, g.cy, g.R, a + 1);
      arrowHead(ring, x, y, x2 - x, y2 - y, clamp(g.r * 1.3, 4, 7), C.ruleStrong);
      if (g.nar) continue;
      const [nx, ny] = polar(g.cx, g.cy, g.R, 45 * r);
      const t = haloText(ring, nx, ny + g.numFs * 0.3, String(r + 1), { size: Math.max(10, g.numFs * 0.8), cls: `kb-step${r === next ? ' is-next' : ''}` });
      if (r === 0 && stalled) t.setAttribute('class', 'kb-alert');
    }
  }

  function drawGhosts(g, skip) {
    const ghost = ring.group({ opacity: 0.22 });
    for (let n = 0; n < 8; n += 1) {
      if (n === skip) continue;
      moleculeAt(g, n, null, ghost);
    }
  }

  // The resting molecule at node n, drawn along the ring.
  function moleculeAt(g, n, shares, parent) {
    const nd = NODES[n];
    const pts = [];
    for (let i = 0; i < nd.carbons; i += 1) pts.push(xy(g, slotPolar(g, n, i)));
    for (let i = 0; i + 1 < nd.chain; i += 1) ring.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], bondAttrs(g.r), parent);
    if (nd.carbons > nd.chain) ring.line(pts[2][0], pts[2][1], pts[5][0], pts[5][1], bondAttrs(g.r), parent);
    pts.forEach(([x, y], i) => carbon(ring, x, y, g.r, shares ? shares[i] : 0, parent));
  }

  function drawCounts(g) {
    const here = nodeNow();
    for (let n = 0; n < 8; n += 1) {
      const [x, y] = polar(g.cx, g.cy, g.numR, nodeAngle(n));
      ring.text(x, y + g.numFs * 0.36, String(NODES[n].carbons), { anchor: 'middle', class: `kb-count${n === here ? ' is-now' : ''}`, 'font-size': fmt(g.numFs) });
    }
  }

  // The extra lines a node carries under (or over) its name: a drain, the fuel coming in, the top-up.
  function extrasAt(n) {
    const out = [];
    const dr = set.drain ? drains[set.drain] : null;
    if (dr && dr.node === n) out.push({ text: `→ ${dr.product}`, cls: 'kb-out', dir: 'out' });
    const f = FUELS[set.fuel];
    if (f.entryNode === n) out.push({ text: `← ${f.name}`, cls: 'kb-in', dir: 'in' });
    if (set.topUp && n === OAA) out.push({ text: '← pyruvate', cls: 'kb-in', dir: 'in' });
    return out;
  }

  // A short arrow at node n, from the chain's outer edge outwards (a drain) or inwards (a feed). `side`
  // moves it along the ring, so a node both drained and fed carries its two arrows side by side.
  function spur(g, n, dir, colour, side = 0) {
    const a = nodeAngle(n);
    const r0 = g.R + g.r * 1.9;
    const r1 = r0 + (g.nar ? 9 : 12);
    const d = side * (g.nar ? 3.5 : 4.5);
    const [x0, y0] = polar(g.cx, g.cy, r0, a).map((v, i) => v + d * (i ? Math.sin(a * RAD) : Math.cos(a * RAD)));
    const [x1, y1] = polar(g.cx, g.cy, r1, a).map((v, i) => v + d * (i ? Math.sin(a * RAD) : Math.cos(a * RAD)));
    ring.line(x0, y0, x1, y1, { stroke: colour, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    if (dir === 'out') arrowHead(ring, x1 + (x1 - x0) * 0.25, y1 + (y1 - y0) * 0.25, x1 - x0, y1 - y0, 5.5, colour);
    else arrowHead(ring, x0, y0, x0 - x1, y0 - y1, 5.5, colour);
  }

  // Narrow, where a node's step number sits and the box its glyph and the current step's underline take.
  function numberAt(g, n) {
    const a = nodeAngle(n);
    const [ox, oy] = polar(g.cx, g.cy, g.R + g.r * 1.9 + (extrasAt(n).length ? 13 : 3), a);
    const fs = g.nameFs + 0.5;
    const x = ox + Math.sin(a * RAD) * fs * 0.35;
    const y = oy + fs * 0.36 - Math.cos(a * RAD) * fs * 0.3;
    return { x, y, fs, x0: x - fs * 0.34, x1: x + fs * 0.34, y0: y - fs * 0.74, y1: y + fs * 0.26 + 2.5 };
  }

  function drawNames(g) {
    const here = nodeNow();
    for (let n = 0; n < 8; n += 1) {
      const extras = extrasAt(n);
      extras.forEach((x, i) => spur(g, n, x.dir, x.dir === 'out' ? INK.coral : INK.leaf, extras.length > 1 ? (i ? 1 : -1) : 0));
      const a = nodeAngle(n);
      const gap = g.r * 1.9 + (extras.length ? (g.nar ? 13 : 17) : (g.nar ? 3 : 5));
      const [ox, oy] = polar(g.cx, g.cy, g.R + gap, a);
      const s = Math.sin(a * RAD);
      const c = -Math.cos(a * RAD); // positive below the centre
      if (g.nar) {
        // The step number that makes it, where the name would be, and under the current one a rule.
        const nb = numberAt(g, n);
        haloText(ring, nb.x, nb.y, String(n + 1), { size: nb.fs, cls: `kb-name${n === here ? ' is-now' : ''}`, weight: 650 });
        if (n === here) ring.line(nb.x0, nb.y + nb.fs * 0.26 + 1.5, nb.x1, nb.y + nb.fs * 0.26 + 1.5, { stroke: C.ink, 'stroke-width': 1.3 });
        continue;
      }
      const anchor = s > 0.2 ? 'start' : s < -0.2 ? 'end' : 'middle';
      const lh = g.nameFs * 1.22;
      // The name, and one line for whatever else the node carries: over the name in the top half, under
      // it in the bottom half, so the line always points away from the ring's middle.
      const base = oy + g.nameFs * (0.34 + 0.42 * c);
      const up = c < 0;
      ring.text(ox, base, NODES[n].name, { anchor, class: `kb-name${n === here ? ' is-now' : ''}`, 'font-size': fmt(g.nameFs) });
      // A node that is both fed and drained (glutamate in and out of α-ketoglutarate) carries two lines.
      extras.forEach((x, i) => ring.text(ox, base + (up ? -1 : 1) * lh * (i + 1), x.text, { anchor, class: x.cls, 'font-size': fmt(g.nameFs * 0.92) }));
    }
  }

  // The names, numbered, in rows: 1 to 4 over 5 to 8, or three to a row. A node a drain takes from or a
  // feed comes into carries its arrow after the name, in the drain's or the feed's colour; what the drain
  // makes and what the feed is are in the ledger and the fuel's line, which have the room to say it.
  function drawList(g) {
    const here = nodeNow();
    const fs = NARROW_FS;
    const cols = g.cols;
    const top = g.h - g.listH + 4;
    const numW = fs * 0.95;
    const cellW = (n) => numW + widthOf(NODES[n].name, fs, 0.53) + extrasAt(n).length * fs * 1.25;
    const colW = [];
    for (let n = 0; n < 8; n += 1) colW[n % cols] = Math.max(colW[n % cols] ?? 0, cellW(n));
    const used = colW.reduce((a, c) => a + c, 0);
    const gap = Math.max(10, (g.w - 16 - 9 - used) / Math.max(1, cols - 1));
    for (let n = 0; n < 8; n += 1) {
      const col = n % cols;
      const row = Math.floor(n / cols);
      let x = 8 + 9;
      for (let c = 0; c < col; c += 1) x += colW[c] + gap;
      const y = top + row * LIST_LH + fs;
      const cls = `kb-name${n === here ? ' is-now' : ''}`;
      if (n === here) ring.circle(x - 6, y - fs * 0.33, 2.3, { fill: C.ink });
      ring.text(x, y, String(n + 1), { class: cls, 'font-size': fmt(fs), 'font-weight': 650 });
      const nameX = x + numW;
      ring.text(nameX, y, NODES[n].name, { class: cls, 'font-size': fmt(fs) });
      let ex = nameX + widthOf(NODES[n].name, fs, 0.53) + fs * 0.35;
      for (const x2 of extrasAt(n)) {
        ring.text(ex, y, x2.dir === 'out' ? '→' : '←', { class: x2.cls, 'font-size': fmt(fs) });
        ex += fs * 1.25;
      }
    }
  }

  function drawProducts(g, done, lab) {
    for (let r = 0; r < 8; r += 1) {
      const s = STEPS[r];
      if (!s.co2 && !tokenText(r)) continue;
      const lit = done > r;
      const spots = productSpots(g, r);
      if (spots.co2) {
        const [x, y] = spots.co2;
        const share = lab && lit ? dyNum({ m: lab.co2[r - 2], e: lab.E }) : 0;
        co2(ring, x, y, g.r, g.sp, share, lit);
        if (!g.nar) {
          const lbl = ring.text(x, y + g.r * 2.1 + g.tokFs * 0.8, 'CO_2', { anchor: 'middle', class: lit ? 'kb-note' : 'kb-faint', 'font-size': fmt(Math.max(9, g.tokFs * 0.92)) });
          if (share > 0) lbl.setAttribute('class', 'kb-gold');
        }
      }
      if (spots.tok) token(ring, spots.tok[0], spots.tok[1], tokenText(r), tokenPart(r), lit, g.tokFs);
    }
  }

  // The molecule the cycle is working on, part way through reaction r = k % 8, and the acetyl group
  // waiting at the join.
  function drawMolecule(g) {
    const r = st.k % 8;
    const v = visProgress();
    const from = (r + 7) % 8;
    const lab = st.lab;
    const shares = lab && !lab.acetyl ? lab.s.map((m) => dyNum({ m, e: lab.E })) : null;
    const waitShares = lab && lab.acetyl ? lab.acetyl.map((m) => dyNum({ m, e: lab.E })) : [0, 0];
    const group = ring.group({});
    // At rest.
    if (v <= 0) {
      moleculeAt(g, from, shares, group);
      drawWaiting(g, waitShares, 1);
      return;
    }
    const map = MAP[r];
    const toN = r;
    const pos = [];
    const destOf = [];
    const shareOf = [];
    // Shares after this reaction, for the crossfade at succinate.
    let after = null;
    if (shares && r === SYMMETRIC_FROM) {
      after = [...shares];
      symmetrise(after);
    }
    map.forEach((dest, i) => {
      const p0 = slotPolar(g, from, i);
      const a0 = p0.a + (r === 0 ? -360 : 0);
      let p;
      if (dest === 'co2') {
        const [sx, sy] = xy(g, { a: a0, rad: p0.rad });
        const [ex, ey] = productSpots(g, r).co2;
        p = [lerp(sx, ex, v), lerp(sy, ey, v)];
      } else {
        const p1 = slotPolar(g, toN, dest);
        p = polar(g.cx, g.cy, lerp(p0.rad, p1.rad, v), lerp(a0, p1.a, v));
      }
      pos[i] = p;
      destOf[i] = dest;
      shareOf[i] = shares ? (after ? lerp(shares[i], after[i], v) : shares[i]) : 0;
    });
    // The acetyl group coming down onto slots 0 and 1 of citrate.
    const incoming = [];
    if (r === 0) {
      for (let j = 0; j < 2; j += 1) {
        const [sx, sy] = [g.waitX + (j - 0.5) * g.sp, g.waitY];
        const [ex, ey] = xy(g, slotPolar(g, 0, j));
        incoming.push({ p: [lerp(sx, ex, v), lerp(sy, ey, v)], share: waitShares[j] });
      }
    }
    // Bonds: the structure before, until half way, then the structure after.
    const at = (slot) => {
      if (v < 0.5) return pos[slot];
      if (r === 0 && slot < 2) return incoming[slot].p;
      const i = destOf.indexOf(slot);
      return i >= 0 ? pos[i] : null;
    };
    const nd = v < 0.5 ? NODES[from] : NODES[toN];
    const bond = (i, j) => {
      const a = at(i);
      const c = at(j);
      if (a && c) ring.line(a[0], a[1], c[0], c[1], bondAttrs(g.r), group);
    };
    for (let i = 0; i + 1 < nd.chain; i += 1) {
      if (v < 0.5 && destOf[i + 1] === 'co2' && v > 0.12) continue;
      bond(i, i + 1);
    }
    if (nd.carbons > nd.chain && !(v < 0.5 && destOf[5] === 'co2' && v > 0.12)) bond(2, 5);
    pos.forEach((p, i) => {
      if (destOf[i] === 'co2') {
        const fade = ring.group({ opacity: fmt(1 - 0.3 * v, 2) }, group);
        carbon(ring, p[0], p[1], g.r, shareOf[i], fade);
      } else carbon(ring, p[0], p[1], g.r, shareOf[i], group);
    });
    for (const inc of incoming) carbon(ring, inc.p[0], inc.p[1], g.r, inc.share, group);
    if (r !== 0) drawWaiting(g, waitShares, 1);
  }

  // The acetyl group waiting at the top, on its coenzyme A.
  function drawWaiting(g, shares, opacity) {
    const grp = ring.group(opacity < 1 ? { opacity: fmt(opacity, 2) } : {});
    const x0 = g.waitX - g.sp / 2;
    ring.line(x0, g.waitY, x0 + g.sp, g.waitY, bondAttrs(g.r), grp);
    carbon(ring, x0, g.waitY, g.r, shares[0], grp);
    carbon(ring, x0 + g.sp, g.waitY, g.r, shares[1], grp);
  }

  // The drain taking half the pool: a faint copy of the molecule slides out along the spur and fades,
  // for half a second of the figure's clock after the molecule arrives.
  function drawDrainFlash(g) {
    if (reduce || st.drainNode < 0) return;
    const age = (st.ticks - st.drainTick) * TICK;
    if (age < 0 || age > 0.5) return;
    const k = age / 0.5;
    const n = st.drainNode;
    const a = nodeAngle(n) * RAD;
    const off = 16 * k;
    const grp = ring.group({ opacity: fmt(0.55 * (1 - k), 2), transform: `translate(${f2(Math.sin(a) * off)} ${f2(-Math.cos(a) * off)})` });
    moleculeAt(g, n, null, grp);
  }

  // ---- the fuel, along the top ----
  //
  // Wide, the fuel's route is drawn along the top of the ring pane and ends at the acetyl group waiting
  // over the join: molecules as chains of discs with their names over them, and each process as an arrow
  // with its name over it and what it makes under it. The route is measured before it is drawn, and a
  // pane too narrow for it (a stage under about 800 px, with three rows of controls) gets the phone's one
  // line of type instead, with the acetyl group waiting just over the ring.
  function routeItems() {
    if (set.fuel === 'glucose') {
      return [
        { mol: 6, label: 'glucose' },
        { arrow: 'glycolysis', products: [] },
        { mol: 3, rows: 2, label: '2 pyruvate' },
        { arrow: 'link reaction', products: ['co2', 'NADH'] },
      ];
    }
    if (set.fuel === 'fatty-acid') {
      const cuts = cutsDone(booksNow().all.turn);
      return [
        { fat: cuts, label: `palmitate, cut ${cuts} of ${FUELS['fatty-acid'].cuts}` },
        { arrow: 'β-oxidation', products: ['NADH', 'FADH_2'] },
      ];
    }
    return [
      { mol: 4, label: 'spare oxaloacetate' },
      { arrow: '', products: ['co2'] },
      { mol: 3, label: 'pyruvate' },
      { arrow: 'link reaction', products: ['co2', 'NADH'] },
    ];
  }

  // The route's type and discs, largest first: the first size at which the route fits is the one drawn.
  const ROUTE_TYPE = [11, 10.5, 10, 9.5];
  function routeSizes(fs) {
    const rr = clamp(fs * 0.45, 2.6, 5);
    return { fs, rr, spc: rr * 2.3, pfs: clamp(fs - 0.5, 9, 10), gap: 6 };
  }
  const productW = (p, z) => (p === 'co2' ? 2 * (z.spc * 0.92 + z.rr * 0.9) : 2 * tokenRx(p, z.pfs));
  const fatUnits = (z) => ({ prr: z.rr * 0.8, pspc: z.rr * 0.8 * 2.3, gapU: z.rr * 0.9 });
  function fatWidth(z) {
    const { prr, pspc, gapU } = fatUnits(z);
    return 7 * (2 * pspc + gapU) + pspc + 2 * prr;
  }
  function itemWidth(it, z) {
    const label = it.label ? widthOf(it.label, z.fs) : 0;
    if (it.arrow !== undefined) {
      const prods = it.products.reduce((a, p) => a + productW(p, z), 0) + 4 * Math.max(0, it.products.length - 1);
      return Math.max(30, (it.arrow ? widthOf(it.arrow, z.fs) : 0) + 10, prods + 10);
    }
    if (it.fat !== undefined) return Math.max(fatWidth(z), label);
    return Math.max((it.mol - 1) * z.spc + 2 * z.rr, label);
  }

  // Draws the route when it fits between the pane's left edge and the waiting acetyl group; says whether.
  function drawRoute(g) {
    const items = routeItems();
    const x0 = 14; // 8 set the first carbon against the end of the focus mark's corner
    const x1 = g.waitX - g.sp / 2 - g.r - 8;
    const fits = ROUTE_TYPE.map(routeSizes).map((z) => {
      const widths = items.map((it) => itemWidth(it, z));
      return { z, widths, need: widths.reduce((a, w) => a + w, 0) + z.gap * (items.length - 1) };
    }).find((f) => f.need <= x1 - x0);
    if (!fits) return false;
    const { z, widths, need } = fits;
    const arrows = items.filter((it) => it.arrow !== undefined).length;
    const give = Math.min(36, (x1 - x0 - need) / Math.max(1, arrows));
    let x = x1 - need - give * arrows;
    const y = g.feedY;
    const lblY = y - z.rr * 2.4 - 4;
    items.forEach((it, i) => {
      const w = widths[i] + (it.arrow !== undefined ? give : 0);
      const mid = x + w / 2;
      if (it.arrow !== undefined) {
        ring.line(x + 2, y, x + w - 6, y, { stroke: C.soft, 'stroke-width': 1.2 });
        arrowHead(ring, x + w - 1, y, 1, 0, 6, C.soft);
        if (it.arrow) ring.text(mid, lblY, it.arrow, { anchor: 'middle', class: 'kb-faint', 'font-size': fmt(z.fs) });
        const pw = it.products.map((p) => productW(p, z));
        let px = mid - (pw.reduce((a, v) => a + v, 0) + 4 * (pw.length - 1)) / 2;
        const py = y + z.rr + 4 + z.pfs * 0.85;
        it.products.forEach((p, j) => {
          if (p === 'co2') co2(ring, px + pw[j] / 2, py, z.rr, z.spc, 0, true);
          else token(ring, px + pw[j] / 2, py, p, LOADED, true, z.pfs);
          px += pw[j] + 4;
        });
      } else {
        if (it.fat !== undefined) drawFat(mid - fatWidth(z) / 2, y, it.fat, z);
        else {
          const cw = (it.mol - 1) * z.spc;
          const rows = it.rows || 1;
          for (let k = 0; k < rows; k += 1) flatChain(ring, mid - cw / 2, rows === 1 ? y : y + (k - 0.5) * z.rr * 2.6, it.mol, z.rr, z.spc);
        }
        ring.text(mid, lblY, it.label, { anchor: 'middle', class: 'kb-note', 'font-size': fmt(z.fs) });
      }
      x += w + z.gap;
    });
    ring.text(g.waitX + g.sp / 2 + g.r + 6, y + z.fs * 0.35, 'acetyl-CoA', { class: 'kb-note', 'font-size': fmt(z.fs) });
    return true;
  }

  // Palmitate's sixteen carbons in eight pairs, the carboxyl end on the right, nearest the cycle, which is
  // the end β-oxidation cuts from. The pairs already cut off are drawn in outline; after the seventh cut
  // the last pair is itself an acetyl group, so all eight are.
  function drawFat(x, y, cuts, z) {
    const { prr, pspc, gapU } = fatUnits(z);
    const pitch = 2 * pspc + gapU;
    const whole = 8 - cuts - (cuts >= FUELS['fatty-acid'].cuts ? 1 : 0);
    const dash = { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '1.6 1.4' };
    for (let u = 0; u < 8; u += 1) {
      const ux = x + prr + u * pitch;
      if (u >= whole) {
        ring.circle(ux, y, prr, dash);
        ring.circle(ux + pspc, y, prr, dash);
        continue;
      }
      ring.line(ux, y, ux + (u + 1 < whole ? pitch : pspc), y, bondAttrs(prr));
      carbon(ring, ux, y, prr, 0);
      carbon(ring, ux + pspc, y, prr, 0);
    }
  }

  // The route as one line of type: the phone's, and a wide pane's too narrow for the drawing.
  function feedLine(nar) {
    const f = FUELS[set.fuel];
    if (set.fuel === 'glucose') return 'Glucose → 2 pyruvate → 2 acetyl-CoA, with 2 CO_2 and 2 NADH';
    if (set.fuel === 'fatty-acid') return `Palmitate, cut ${cutsDone(booksNow().all.turn)} of ${f.cuts} → acetyl-CoA; each cut 1 NADH, 1 FADH_2`;
    return nar ? 'Glutamate enters at 3; its spare oxaloacetate → acetyl-CoA' : 'Glutamate enters as α-ketoglutarate; its spare oxaloacetate → acetyl-CoA';
  }

  // The turn, the last step's carbon arithmetic, and what the step did. On a phone the ring is too small
  // to hold a sentence as well, so the sentence goes under the ring, over the list of names, in two
  // lines at most.
  function drawCentre(g) {
    const bk = booksNow();
    // The disc inside the carbon counts. The sum is sized so its widest form ("6 − 1 = 5") and the turn
    // over it fit that disc at every step, so the type does not change size from one step to the next.
    // A ring too small for the turn over an 11 px sum sends the turn to the head of the books, and one too
    // small for the sum alone leaves its middle empty: the counts round the ring say the same.
    const inner = g.numR - g.numFs * 0.9;
    const headFs = clamp(inner * 0.1, 9, 11);
    const room = (fs, head) => Math.hypot(widthOf('6 − 1 = 5', fs, 0.56) / 2, ((head ? headFs + 8 : 0) + fs) / 2 + 2);
    const withTurn = room(11, true) <= inner;
    const withSum = withTurn || room(11, false) <= inner;
    turnInCentre = withTurn;
    let sumFs = clamp(inner * 0.24, 13, 30);
    while (sumFs > 11 && room(sumFs, withTurn) > inner) sumFs -= 0.5;
    const txtFs = g.nar ? NARROW_FS : clamp(inner * 0.095, 9.5, 12);
    const stalled = stalledNow();
    const sum = st.k === 0 ? '4' : STEPS[(st.k - 1) % 8].sum;
    const words = centreWords(g.nar);
    const cls = stalled ? 'kb-alert' : 'kb-note';
    const inside = g.nar ? [] : wrapText(words, inner * 1.62, txtFs);
    const lh = txtFs * 1.28;
    const block = (withTurn ? headFs + 8 : 0) + sumFs + (inside.length ? 6 + inside.length * lh : 0);
    let y = g.cy - block / 2;
    // On a phone with no room for the sentence, the turn's heading is where a stop is said.
    const stop = g.nar && !g.sentH && stalled;
    if (withTurn) {
      y += headFs * 0.9;
      ring.text(g.cx, y, stop ? 'STOPPED' : `TURN ${bk.all.turn}`, { anchor: 'middle', class: stop ? 'kb-head kb-stop' : 'kb-head', 'font-size': fmt(headFs) });
      y += 8;
    }
    y += sumFs * 0.86;
    if (withSum) ring.text(g.cx, y, sum, { anchor: 'middle', class: 'kb-sum', 'font-size': fmt(sumFs) });
    y += 6 + sumFs * 0.14;
    inside.forEach((ln, i) => ring.text(g.cx, y + (i + 1) * lh - lh * 0.22, ln, { anchor: 'middle', class: cls, 'font-size': fmt(txtFs) }));
    if (!g.nar || !g.sentH) return;
    const top = g.h - g.listH - g.sentH + 2;
    wrapText(words, g.w - 16, txtFs).forEach((ln, i) => ring.text(8, top + txtFs + i * SENT_LH, ln, { class: cls, 'font-size': fmt(txtFs) }));
  }

  function drawRing() {
    ring.clear();
    const { w, h } = ring.box;
    let g = geometry(w, h);
    const bk = booksNow();
    const v = visProgress();
    if (g.nar || !drawRoute(g)) {
      if (!g.nar) g = geometry(w, h, true);
      ring.text(8, g.feedY, feedLine(g.nar), { class: 'kb-note', 'font-size': '9.5' });
    }
    drawTrack(g);
    drawGhosts(g, v > 0 ? -1 : nodeNow());
    drawCounts(g);
    drawNames(g);
    if (g.nar) drawList(g);
    drawProducts(g, bk.done, st.lab);
    drawDrainFlash(g);
    drawMolecule(g);
    drawCentre(g);
    ring.focusMark();
    typeset(ring.node);
  }

  // ---------------------------------------------------------------- the ledger

  // The books' two columns of figures. The readout sets two value columns a quarter of the table apart,
  // which in a column under about 200 px puts SO FAR against THIS TURN and reads as one phrase; there an
  // empty column between them sets the two a third apart instead.
  const BOOK_COLS = ['This turn', 'So far'];
  const headW = (str) => str.length * 9 * 0.63;
  const booksSpread = (w) => w / 4 - headW(BOOK_COLS[1]) < 14;
  function booksRows(r, spread3) {
    const bk = booksNow();
    const vals = (a, b2) => (spread3 ? [a, '', b2] : [a, b2]);
    r.row('Carbons in', vals(bk.turn.cIn, bk.all.cIn));
    r.row('Carbons out', vals(bk.turn.cOut, bk.all.cOut));
    r.row('NADH', vals(bk.turn.nadh, bk.all.nadh));
    r.row('FADH_2', vals(bk.turn.fadh2, bk.all.fadh2));
    r.row('ATP', vals(bk.turn.atp, bk.all.atp));
  }
  function booksTable(opts, w, title) {
    const spread3 = booksSpread(w);
    const books = ledger.readout({ title, columns: spread3 ? [BOOK_COLS[0], '', BOOK_COLS[1]] : BOOK_COLS, width: w, ...opts });
    booksRows(books, spread3);
    return books;
  }

  // The ledger's other three blocks. `terse` 0 is the fullest, with its sentences; 1 the rows alone; 2
  // the rows a reader needs most; 3 one or two lines. `col` is the column's width and the type's size,
  // so a value with a long and a short form takes the long one where it fits beside its label.
  const fitsRow = (label, value, col) => widthOf(label, col.size, 0.56) + widthOf(value, col.size, 0.56) + 12 <= col.w;
  const firstFitting = (label, forms, col) => forms.find((v) => fitsRow(label, v, col)) ?? forms[forms.length - 1];

  function labelRows(r, terse, col) {
    const lv = labelNow();
    r.head('The label');
    if (!lv) {
      if (terse < 2) r.note('Label a carbon to follow it round the cycle.');
      else r.row('Carbon', 'none');
      return;
    }
    const lab = lv.lab;
    const gone = lv.remaining.m <= 0;
    r.row('Carbon', lab.def.short, { accent: INK.gold });
    if (terse < 3) {
      const into = lv.drainedIds.map((id) => drains[id].into).join(' and ');
      r.row('Sits in', gone && into ? firstFitting('Sits in', [lv.position, `CO_2 and ${into}`, 'CO_2, and drained'], col) : lv.position);
      if (terse === 0 && !gone) r.note(`${cap(spread(lab))}.`);
    }
    if (terse < 2) {
      const turns = lab.byTurn.length;
      if (turns) {
        // As many of the last four finished turns as the column has room for, and at least the last.
        const left = (m) => [m === 1 ? `Left on turn ${turns}` : `Left, turns ${turns - m + 1}–${turns}`, lab.byTurn.slice(turns - m).map(shareText).join(', ')];
        let m = Math.min(4, turns);
        while (m > 1 && !fitsRow(...left(m), col)) m -= 1;
        r.row(...left(m));
      } else if (st.k === 0) r.row('Left so far', 'none');
      if (st.k % 8 !== 0) r.row('Left this turn', shareText(lv.thisTurn));
    }
    r.row('Still in the cycle', shareText(lv.remaining), { strong: true, accent: gone ? undefined : INK.gold });
    if (lv.drained.m > 0 && terse < 3) r.row('Drained off', shareText(lv.drained));
  }

  function poolRows(r, terse, col) {
    const dr = set.drain ? drains[set.drain] : null;
    const low = st.L < 0.999 ? { accent: INK.coral } : {};
    if (terse >= 3) {
      r.row('Oxaloacetate', pct(st.L), low);
      return;
    }
    r.head('Oxaloacetate');
    r.row('Level', firstFitting('Level', [`${pct(st.L)} of its trace`, pct(st.L)], col), low);
    if (terse < 2 || dr) r.row('Drain', dr ? firstFitting('Drain', [`${NODES[dr.node].name} → ${dr.product}`, `→ ${dr.product}`], col) : 'none');
    if (terse < 2 || set.topUp) r.row('Top-up', set.topUp ? firstFitting('Top-up', ['pyruvate → oxaloacetate', 'on'], col) : 'off');
    if (stalledNow()) r.note(set.topUp ? 'Stopped until the top-up has made enough.' : 'Stopped: short of oxaloacetate.', { accent: INK.coral });
    else if (st.L < 0.999 && terse < 2) r.note(`Joins at ${pct(Math.min(1, st.L))} of the usual rate.`);
  }

  function fuelRows(r, terse, col) {
    const f = FUELS[set.fuel];
    const y = fuelYield(f);
    r.head('Fuel');
    r.row('Burning', firstFitting('Burning', [`${f.name}, ${f.carbons} carbons`, f.name], col));
    if (terse < 2) r.row('Enters as', f.entry);
    if (terse < 2) r.row(`ATP per ${f.name}`, `about ${y.total}`);
    r.row('ATP per gram', `${fmt(y.perGram, 2)} mol`, { strong: true });
    if (terse > 0) return;
    if (set.fuel === 'glucose') r.note(`Two turns per glucose. The 32 assumes the malate–aspartate shuttle: ${f.tissue}.`);
    else if (set.fuel === 'fatty-acid') r.note(`Seven cuts, each 1 NADH and 1 FADH_2; 8 acetyl-CoA; 2 ATP to start.`);
    else r.note('Its nitrogen leaves for urea; its spare oxaloacetate comes back round as acetyl-CoA.');
  }

  // Narrow, the column beside the books holds one block, chosen by what the reader has set going: the
  // pool when the cycle has stopped, or when a drain or a top-up is on and nothing is labelled; the label
  // when one is; the fuel otherwise. The other block, when there is one, follows in a line or two if the
  // column has the room.
  function narrowColumn(r, level, col) {
    const pooled = stalledNow() || set.drain || set.topUp || st.L < 0.999;
    const first = stalledNow() || (pooled && !st.lab) ? 'pool' : st.lab ? 'label' : 'fuel';
    const then = first === 'pool' && st.lab ? 'label' : first === 'label' && pooled ? 'pool' : null;
    const block = (which, terse) => (which === 'pool' ? poolRows : which === 'label' ? labelRows : fuelRows)(r, terse, col);
    block(first, level === 2 ? 2 : 1);
    if (then && level === 0) block(then, 3);
  }

  function drawLedger() {
    const { w, h } = ledger.box;
    const key = [w, h, mode, b.narrow, st.k, st.L.toFixed(3), set.label, set.drain, set.topUp, set.fuel, st.lab ? st.lab.byTurn.length : 0, note, turnInCentre].join('|');
    if (key === ledgerKey) return;
    ledgerKey = key;
    ledger.clear();
    const nar = Boolean(b.narrow);
    const size = nar ? 9.8 : clamp(w * 0.031, 10.4, 11.4);
    const opts = { size, titleSize: Math.max(9.2, size - 1.2), headSize: 9, minRow: nar ? 12.5 : 14, maxRow: nar ? 17 : 22 };
    // The turn is in the middle of the ring; where the ring is too small to hold it, it heads the books.
    const title = turnInCentre ? 'The books' : `The books, turn ${booksNow().all.turn}`;
    if (mode === 'side') {
      const col = { w, size };
      const books = booksTable(opts, w, title);
      const rowH = clamp(h * 0.045, 15, 21);
      const bottom = books.draw(rowH, h);
      const rest = ledger.readout({ y: bottom + rowH * 0.9, width: w, ...opts });
      rest.fit(h - bottom - rowH * 0.9, (r, level) => {
        labelRows(r, level, col);
        poolRows(r, level, col);
        fuelRows(r, level, col);
      }, { levels: 3 });
    } else {
      const gap = nar ? 14 : 22;
      const colW = (w - gap) / 2;
      const col = { w: colW, size };
      const books = booksTable(opts, colW, title);
      if (nar) {
        books.fill(h);
        const rest = ledger.readout({ x: colW + gap, width: colW, ...opts });
        rest.fit(h, (r, level) => narrowColumn(r, level, col), { levels: 3 });
      } else {
        const rowH = clamp(h * 0.07, 15, 21);
        const bottom = books.draw(rowH, h);
        const pool = ledger.readout({ y: bottom + rowH * 0.9, width: colW, ...opts });
        pool.fit(h - bottom - rowH * 0.9, (r, level) => poolRows(r, level, col), { levels: 2 });
        const rest = ledger.readout({ x: colW + gap, width: colW, ...opts });
        rest.fit(h, (r, level) => {
          labelRows(r, level, col);
          fuelRows(r, level, col);
        }, { levels: 3 });
      }
    }
    typeset(ledger.node);
  }

  // ---------------------------------------------------------------- layout
  //
  // Side by side, the ring at about the pane's height; on a stage taller than about four fifths of its
  // width, the ledger under the ring in two columns; narrow, the ledger under the ring in two columns
  // sized to five rows of books.
  function arrange() {
    const rect = b.wrap.getBoundingClientRect();
    const bar = b.wrap.querySelector('.tb-toolbar');
    const barH = bar ? bar.getBoundingClientRect().height : 0;
    const W = Math.max(0, rect.width - 14);
    const H = Math.max(0, rect.height - barH - 26);
    let want;
    let vars;
    if (b.narrow) {
      want = 'narrow';
      // The books' five rows at their least height, 94 px, and a little more as the stage grows.
      vars = { '--kb-nrows': `minmax(0, 1fr) minmax(0, ${Math.round(clamp(H * 0.24, 94, 132))}px)` };
    } else if (H > W * 0.78) {
      want = 'stacked';
      const led = Math.round(clamp(H * 0.3, 170, 260));
      vars = { '--kb-cols': 'minmax(0, 1fr)', '--kb-rows': `minmax(0, 1fr) minmax(0, ${led}px)`, '--kb-lc': '1', '--kb-lr': '2' };
    } else {
      want = 'side';
      // The ledger's column is a third of the stage, 300 to 400 px, and the ring's pane the rest: the ring
      // itself is sized by the height, and the width left over beside it is the fuel's route's.
      const ringW = Math.round(W - clamp(W * 0.34, 300, 400));
      vars = { '--kb-cols': `minmax(0, ${ringW}px) minmax(0, 1fr)`, '--kb-rows': 'minmax(0, 1fr)', '--kb-lc': '2', '--kb-lr': '1' };
    }
    const keyNow = `${want}|${JSON.stringify(vars)}`;
    if (keyNow === layoutKey) return false;
    layoutKey = keyNow;
    mode = want;
    for (const [name, value] of Object.entries(vars)) b.setVar(name, value);
    ledgerKey = '';
    return true;
  }

  b.onDraw(() => {
    if (arrange()) b.remeasure();
    drawRing();
    drawLedger();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   turn                  the number of joins so far; 0 before the first
  //   position, carbonsHere the intermediate the molecule is at (whole steps only) and its carbons
  //   carbonsIn, carbonsOut cumulative, two per join and one per decarboxylation; equal at every turn's end
  //   thisTurn              { cIn, cOut, nadh, fadh2, atp } for the turn in progress (or just finished)
  //   nadhPerTurn, fadh2PerTurn, atpPerTurn   3, 1 and 1, summed from STEPS
  //   nadhTotal, fadh2Total, atpTotal         cumulative
  //   labelledCarbon        'acetyl-1', 'acetyl-2', 'oxaloacetate-1' … 'oxaloacetate-4', or null
  //   labelPosition         'acetyl-CoA' before the join; the intermediate while any is left in the cycle;
  //                         'carbon dioxide' once it has all left, or 'carbon dioxide and <what it was
  //                         drained into>'; null with no label
  //   labelFirstLeftOnTurn  the first turn any of it left on (2 for acetyl-1, 3 for acetyl-2), or null
  //   labelReleasedByTurn   finished turns only: [0, 1] for acetyl-1, [0, 0, 0.5, 0.25, …] for acetyl-2
  //   labelReleasedThisTurn what has left so far in the turn in progress
  //   labelRemaining        1 down towards 0; never 0 for acetyl-2 or oxaloacetate-2
  //   labelDrained, labelDrainedInto   the share drains have taken, and what they took it into
  //   oxaloacetateLevel     in multiples of the usual trace (1 = the trace a working mitochondrion keeps)
  //   joinRate              the join's rate against the usual one: the level, capped at 1, or 0 stalled
  //   drainedTo, drainedFrom   the drain's product and intermediate, or null
  //   stalled, shortOf      computed: waiting at the join below a fifth of the trace; 'oxaloacetate'
  //   toppedUp              whether Top up is on
  //   fuel                  'glucose' | 'fatty-acid' | 'amino-acid'; fuelMolecule its molecule
  //   entryPoint            'acetyl-CoA', or 'α-ketoglutarate' for glutamate
  //   acetylPerFuel, atpPerFuel, atpPerGram   turns a molecule pays for, ATP a molecule, mol ATP a gram
  //   cutsDone              the fatty acid's two-carbon cuts so far, 1 to 7, or null
  //   refused               'stalled' when the last Step could not take the cycle on, else null
  //   t                     seconds of the figure's clock the cycle has run since it was last put back
  //   playing               whether Run is on
  return b.handle();
}
