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
// its right; on a stage taller than it is wide the ledger goes under the ring in two columns. Narrow
// (below 600 px): the ring keeps its shape and its carbon counts, the names become their step numbers on
// the ring and a numbered list beneath it (the current one marked in both), the fuel's route becomes one
// line of type, the step numbers on the ring go (the list's numbers are the steps that make each
// intermediate), and the books re-stack to five rows beside the label. narrowAspect is 2/3, not the 4/5
// FIGURES.md's table asks for: at 390 px, 4/5 leaves a ring about 60 px in radius once three toolbar rows
// and the five rows of books are taken out, and the registry comment has the measurement.
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

  const drainCtl = b.choice('Drain', [
    { id: 'none', label: 'No drain', short: 'No drain', aria: 'No drain, keep every intermediate in the cycle' },
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
  b.divide();

  const fuelCtl = b.choice('Fuel', Object.entries(FUELS).map(([id, f]) => ({ id, label: f.label, aria: f.aria })), (id) => {
    set.fuel = id;
    changed();
  }, { value: 'glucose', segmented: true });

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
  function spread(lab, spoken) {
    if (lab.acetyl) return lab.acetyl[0] > 0 ? 'on the carbonyl carbon' : 'on the methyl carbon';
    const node = nodeNow();
    const on = lab.s.map((m, i) => ({ m, i })).filter((x) => x.m > 0);
    if (!on.length) return '';
    const total = on.reduce((a, x) => a + x.m, 0);
    const equal = on.every((x) => x.m === on[0].m);
    const roles = new Set(on.map((x) => ROLE[node][x.i]));
    const role = roles.size === 1 ? [...roles][0] : null;
    const noun = role === 'carboxyl' ? 'carboxyl' : role === 'middle' ? 'middle carbon' : 'carbon';
    if (on.length === 1) return `all of it on one ${noun}`;
    if (!equal) return `spread over ${on.length} carbons`;
    const each = { m: on[0].m / total, e: 0 };
    const eachWords = spoken ? shareWords(each) : shareWords(each);
    const count = on.length === 2 ? 'each' : `each of ${on.length === NODES[node].carbons ? 'its' : ''} ${['', '', 'two', 'three', 'four', 'five', 'six'][on.length]}`.replace(/\s+/g, ' ');
    return `${eachWords} of it on ${count} ${noun}${on.length === 2 ? '' : 's'}`.replace(/\s+/g, ' ');
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
    if (stalledNow()) return set.topUp ? 'Stopped, short of oxaloacetate, until the top-up has made enough.' : 'Stopped: short of oxaloacetate for the acetyl group to join.';
    if (st.L < 0.999 && st.k % 8 === 0) return `Oxaloacetate is at ${pct(st.L)} of its usual trace, so the next join comes at ${pct(Math.min(1, st.L))} of the usual rate.`;
    if (st.L < 0.999) return `Oxaloacetate is at ${pct(st.L)} of its usual trace.`;
    return '';
  }

  function centreWords() {
    if (stalledNow()) return poolWords();
    if (st.k === 0) return 'An acetyl group is waiting to join oxaloacetate.';
    const r = (st.k - 1) % 8;
    let s = STEPS[r].words;
    if (st.k % 8 === 0 && st.L < 0.999) s = `${s} ${poolWords()}`;
    return s;
  }

  function labelWords(spoken) {
    const lv = labelNow();
    if (!lv) return '';
    const who = `The label, on ${lv.lab.def.what},`;
    const turns = lv.lab.byTurn.length;
    const left = turns ? `Left on turn${turns === 1 ? '' : 's'} ${turns === 1 ? '1' : `1 to ${turns}`}: ${lv.lab.byTurn.map(shareWords).join(', ')}.` : '';
    const where = lv.remaining.m > 0
      ? `${who} is in ${lv.position}, ${spread(lv.lab, spoken)}.`
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
    const lab = labelWords(true);
    const fuel = `Fuel: ${FUELS[d.fuel].name}, entering as ${d.entryPoint}.`;
    return plain([refusedWords(), where, books, pool, lab, fuel].filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim();
  });

  // ---------------------------------------------------------------- geometry
  //
  // Node n sits at 22.5° + 45n clockwise from twelve o'clock and step r at 45r, so the join is at the
  // top, where the fuel comes in, and the molecule passes each step's number on its way between two
  // intermediates. A slot is an angle and a radius; the chain's carbons are sp apart along the ring.
  const nodeAngle = (n) => 22.5 + 45 * n;

  function geometry(w, h) {
    const nar = Boolean(b.narrow);
    const listH = nar ? 4 * 13.5 + 10 : 0;
    const feedH = nar ? 20 : clamp(h * 0.15, 54, 86);
    const side = nar ? 70 : 102;
    const below = nar ? 30 : 42;
    const topGap = nar ? 34 : 40;
    const usable = h - feedH - topGap - below - listH;
    const R = clamp(Math.min((w - 2 * side) / 2, usable / 2), 34, 250);
    const r = clamp(R * 0.043, 2.4, 7.2);
    const sp = r * 2.3;
    const spare = Math.max(0, usable - 2 * R);
    const cx = w / 2;
    const cy = feedH + topGap + R + spare / 2;
    const dA = (sp / R) / RAD;
    const numFs = clamp(R * 0.082, 9.5, 14);
    const nameFs = nar ? 9.5 : clamp(R * 0.07, 10, 12.5);
    const tokFs = nar ? 8.6 : clamp(R * 0.058, 9, 11);
    const feedY = nar ? 13 : feedH * 0.64;
    return {
      w, h, nar, cx, cy, R, r, sp, dA, numFs, nameFs, tokFs, feedH, feedY, listH,
      numR: R - sp * 2.35,
      waitX: cx,
      waitY: nar ? cy - R - sp * 2.6 : feedY,
    };
  }

  function slotPolar(g, node, i) {
    const nd = NODES[node];
    const mid = (nd.chain - 1) / 2;
    if (i >= nd.chain) return { a: nodeAngle(node), rad: g.R - g.sp * 0.98 };
    return { a: nodeAngle(node) + (i - mid) * g.dA, rad: g.R };
  }
  const xy = (g, p) => polar(g.cx, g.cy, p.rad, p.a);

  // Where step r's products sit: a CO2 nearest the ring, then the token, along the step's own radius.
  function productSpots(g, r) {
    const s = STEPS[r];
    const co2W = g.sp * 0.92 * 2 + g.r * 1.8;
    const firstAt = g.R + g.r + 6 + co2W / 2;
    const spots = {};
    let at = g.R + g.r + 6;
    if (s.co2) {
      spots.co2 = polar(g.cx, g.cy, firstAt, 45 * r);
      at = firstAt + co2W / 2 + 5;
    }
    const tok = tokenText(r);
    if (tok) {
      const rx = tokenRx(tok, g.tokFs);
      // Along the radius, far enough out that the token's own box clears what is inside it.
      const a = 45 * r * RAD;
      const reach = Math.abs(Math.sin(a)) * rx + Math.abs(Math.cos(a)) * g.tokFs * 0.85;
      spots.tok = polar(g.cx, g.cy, at + reach + 1, 45 * r);
      spots.tokRx = rx;
    }
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
      const t = haloText(ring, nx, ny + g.numFs * 0.3, String(r + 1), { size: g.numFs * 0.78, cls: `kb-step${r === next ? ' is-next' : ''}` });
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

  // A short arrow at node n, from the chain's outer edge outwards (a drain) or inwards (a feed).
  function spur(g, n, dir, colour) {
    const a = nodeAngle(n);
    const r0 = g.R + g.r * 1.9;
    const r1 = r0 + (g.nar ? 9 : 12);
    const [x0, y0] = polar(g.cx, g.cy, r0, a);
    const [x1, y1] = polar(g.cx, g.cy, r1, a);
    ring.line(x0, y0, x1, y1, { stroke: colour, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    if (dir === 'out') arrowHead(ring, x1 + (x1 - x0) * 0.25, y1 + (y1 - y0) * 0.25, x1 - x0, y1 - y0, 5.5, colour);
    else arrowHead(ring, x0, y0, x0 - x1, y0 - y1, 5.5, colour);
  }

  function drawNames(g) {
    const here = nodeNow();
    for (let n = 0; n < 8; n += 1) {
      const extras = extrasAt(n);
      extras.forEach((x, i) => {
        if (i === 0) spur(g, n, x.dir, x.dir === 'out' ? INK.coral : INK.leaf);
      });
      const a = nodeAngle(n);
      const gap = g.r * 1.9 + (extras.length ? (g.nar ? 13 : 17) : (g.nar ? 3 : 5));
      const [ox, oy] = polar(g.cx, g.cy, g.R + gap, a);
      const s = Math.sin(a * RAD);
      const c = -Math.cos(a * RAD); // positive below the centre
      if (g.nar) {
        // The step number that makes it, where the name would be.
        const fs = g.nameFs + 0.5;
        haloText(ring, ox + s * fs * 0.35, oy + fs * 0.36 + c * fs * 0.3, String(n + 1), { size: fs, cls: `kb-name${n === here ? ' is-now' : ''}`, weight: 650 });
        if (n === here) {
          const [ux, uy] = [ox + s * fs * 0.35, oy + c * fs * 0.3 + fs * 0.62];
          ring.line(ux - fs * 0.34, uy + 1.5, ux + fs * 0.34, uy + 1.5, { stroke: C.ink, 'stroke-width': 1.3 });
        }
        continue;
      }
      const anchor = s > 0.2 ? 'start' : s < -0.2 ? 'end' : 'middle';
      const lh = g.nameFs * 1.22;
      const lines = [{ text: NODES[n].name, cls: `kb-name${n === here ? ' is-now' : ''}` }, ...extras];
      // Upper half: the name on the bottom line and its extras above it; lower half, the other way.
      const up = c < 0;
      const base = oy + g.nameFs * (0.34 + 0.42 * c);
      lines.forEach((ln, i) => {
        const y = up ? base - (lines.length - 1 - i) * lh : base + i * lh;
        ring.text(ox, y, ln.text, { anchor, class: ln.cls, 'font-size': fmt(i === 0 ? g.nameFs : g.nameFs * 0.92) });
      });
    }
  }

  function drawList(g) {
    const here = nodeNow();
    const fs = 9.5;
    const lh = 13.5;
    const top = g.h - g.listH + 8;
    const colW = (g.w - 16) / 2;
    for (let n = 0; n < 8; n += 1) {
      const col = n < 4 ? 0 : 1;
      const row = n % 4;
      const x = 8 + col * colW + 9;
      const y = top + row * lh + fs;
      if (n === here) ring.circle(x - 6, y - fs * 0.33, 2.3, { fill: C.ink });
      ring.text(x, y, String(n + 1), { class: `kb-name${n === here ? ' is-now' : ''}`, 'font-size': fmt(fs), 'font-weight': 650 });
      const nameX = x + fs * 0.95;
      ring.text(nameX, y, NODES[n].name, { class: `kb-name${n === here ? ' is-now' : ''}`, 'font-size': fmt(fs) });
      let ex = nameX + widthOf(NODES[n].name, fs, 0.53) + 5;
      for (const x2 of extrasAt(n)) {
        ring.text(ex, y, x2.text, { class: x2.cls, 'font-size': fmt(fs) });
        ex += widthOf(x2.text, fs, 0.55) + 5;
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
          const lbl = ring.text(x, y + g.r * 2.1 + g.tokFs * 0.8, 'CO_2', { anchor: 'middle', class: lit ? 'kb-note' : 'kb-faint', 'font-size': fmt(g.tokFs * 0.92) });
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
      if (v < 0.5 && r === 0 && i === 0 && false) continue;
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
    if (g.nar) {
      ring.text(x0 + g.sp + g.r * 2.2, g.waitY + g.nameFs * 0.34, 'acetyl-CoA', { class: 'kb-note', 'font-size': fmt(g.nameFs) });
    }
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
  function feedLabel(x, y, str, g, cls = 'kb-note', anchor = 'middle') {
    ring.text(x, y, str, { anchor, class: cls, 'font-size': fmt(g.nameFs * 0.9) });
  }

  function feedArrow(g, x0, x1, y, label, products = []) {
    ring.line(x0, y, x1 - 5, y, { stroke: C.soft, 'stroke-width': 1.2 });
    arrowHead(ring, x1, y, 1, 0, 6, C.soft);
    if (label) feedLabel((x0 + x1) / 2, y - g.r * 2.2, label, g, 'kb-faint');
    if (!products.length) return;
    const fs = g.tokFs * 0.9;
    const widths = products.map((p) => (p === 'co2' ? g.sp * 0.8 * 1.84 + g.r * 1.44 : tokenRx(p, fs) * 2));
    const total = widths.reduce((a, w) => a + w, 0) + 6 * (widths.length - 1);
    let x = (x0 + x1) / 2 - total / 2;
    const py = y + g.r * 1.2 + fs;
    products.forEach((p, i) => {
      const cx = x + widths[i] / 2;
      if (p === 'co2') co2(ring, cx, py, g.r * 0.8, g.sp * 0.8, 0, true);
      else token(ring, cx, py, p, p === 'ATP' ? ATP_PART : LOADED, true, fs);
      x += widths[i] + 6;
    });
  }

  function drawFeedWide(g) {
    const rr = g.r * 0.8;
    const spc = rr * 2.3;
    const y = g.feedY;
    const x0 = 12;
    const x1 = g.waitX - g.sp / 2 - g.r * 2.4;
    const lblY = y - rr * 2.6;
    const fuel = set.fuel;
    // The acetyl group's own name, over it.
    feedLabel(g.waitX, lblY, 'acetyl-CoA', g, 'kb-note');
    if (fuel === 'glucose') {
      const wG = 5 * spc;
      const wP = 2 * spc;
      const flex = x1 - x0 - wG - wP - 4 * rr;
      flatChain(ring, x0 + rr, y, 6, rr, spc);
      feedLabel(x0 + rr + wG / 2, lblY, 'glucose', g);
      const a0 = x0 + wG + 2 * rr + 4;
      const a1 = a0 + flex * 0.34;
      feedArrow(g, a0, a1, y, 'glycolysis');
      const px = a1 + 4 + rr;
      flatChain(ring, px, y - rr * 1.3, 3, rr, spc);
      flatChain(ring, px, y + rr * 1.3, 3, rr, spc);
      feedLabel(px + wP / 2, lblY - rr * 0.6, '2 pyruvate', g);
      feedArrow(g, px + wP + rr + 4, x1, y, 'link reaction', ['co2', 'NADH']);
    } else if (fuel === 'fatty-acid') {
      const cuts = cutsDone(booksNow().all.turn);
      const units = 8;
      const gapU = rr * 0.9;
      const prr = rr * 0.78;
      const pspc = prr * 2.3;
      const wF = units * pspc * 2 - pspc + (units - 1) * gapU;
      // Whole 16-carbon chain; the units already cut off are drawn in outline, the rest solid.
      let x = x0 + prr;
      for (let u = 0; u < units; u += 1) {
        const gone = u >= units - cuts - (cuts === FUELS['fatty-acid'].cuts ? 1 : 0);
        const ux = x + u * (2 * pspc + gapU);
        if (gone) {
          const dash = { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '1.6 1.4' };
          ring.circle(ux, y, prr, dash);
          ring.circle(ux + pspc, y, prr, dash);
        } else {
          ring.line(ux, y, ux + pspc, y, bondAttrs(prr));
          if (u + 1 < units) {
            const nextGone = u + 1 >= units - cuts - (cuts === FUELS['fatty-acid'].cuts ? 1 : 0);
            if (!nextGone) ring.line(ux + pspc, y, ux + 2 * pspc + gapU, y, bondAttrs(prr));
          }
          carbon(ring, ux, y, prr, 0);
          carbon(ring, ux + pspc, y, prr, 0);
        }
      }
      feedLabel(x0 + wF / 2, lblY, `palmitate, cut ${cuts} of ${FUELS['fatty-acid'].cuts}`, g);
      const a0 = x0 + wF + 2 * prr + 6;
      feedArrow(g, a0, x1, y, 'each cut', ['NADH', 'FADH_2']);
    } else {
      const wO = 3 * spc;
      const wP = 2 * spc;
      const flex = x1 - x0 - wO - wP - 4 * rr;
      flatChain(ring, x0 + rr, y, 4, rr, spc);
      feedLabel(x0 + rr + wO / 2, lblY, 'spare oxaloacetate', g);
      const a0 = x0 + wO + 2 * rr + 4;
      const a1 = a0 + flex * 0.42;
      feedArrow(g, a0, a1, y, null, ['co2']);
      const px = a1 + 4 + rr;
      flatChain(ring, px, y, 3, rr, spc);
      feedLabel(px + wP / 2, lblY, 'pyruvate', g);
      feedArrow(g, px + wP + rr + 4, x1, y, 'link reaction', ['co2', 'NADH']);
    }
  }

  function feedLine() {
    const f = FUELS[set.fuel];
    if (set.fuel === 'glucose') return 'Glucose → 2 pyruvate → 2 acetyl-CoA, with 2 CO_2 and 2 NADH';
    if (set.fuel === 'fatty-acid') return `Palmitate, cut ${cutsDone(booksNow().all.turn)} of ${f.cuts}; each cut 1 NADH and 1 FADH_2 → acetyl-CoA`;
    return 'Glutamate in at 3, its nitrogen to urea; spare oxaloacetate → pyruvate → acetyl-CoA';
  }

  function drawCentre(g) {
    const bk = booksNow();
    const inner = Math.max(24, g.numR - g.numFs * 1.1);
    const headFs = clamp(inner * 0.1, 8.6, 11);
    const sumFs = clamp(inner * 0.24, 15, 30);
    const txtFs = clamp(inner * 0.095, 9, 12);
    const stalled = stalledNow();
    const sum = st.k === 0 ? '4' : STEPS[(st.k - 1) % 8].sum;
    const words = centreWords();
    const width = inner * 1.62;
    const lines = wrapText(plain(words).length > 0 ? words : '', width, txtFs);
    const lh = txtFs * 1.28;
    const block = headFs + 8 + sumFs + 6 + lines.length * lh;
    let y = g.cy - block / 2 + headFs * 0.9;
    ring.text(g.cx, y, `TURN ${bk.all.turn}`, { anchor: 'middle', class: 'kb-head', 'font-size': fmt(headFs) });
    y += 8 + sumFs * 0.86;
    ring.text(g.cx, y, sum, { anchor: 'middle', class: 'kb-sum', 'font-size': fmt(sumFs) });
    y += 6 + sumFs * 0.14;
    lines.forEach((ln, i) => {
      ring.text(g.cx, y + (i + 1) * lh - lh * 0.22, ln, { anchor: 'middle', class: stalled ? 'kb-alert' : 'kb-note', 'font-size': fmt(txtFs) });
    });
  }

  function drawRing() {
    ring.clear();
    const { w, h } = ring.box;
    const g = geometry(w, h);
    const bk = booksNow();
    const v = visProgress();
    if (g.nar) ring.text(8, g.feedY, feedLine(), { class: 'kb-note', 'font-size': '9.5' });
    else drawFeedWide(g);
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

  function booksRows(r) {
    const bk = booksNow();
    r.row('Carbons in', [bk.turn.cIn, bk.all.cIn]);
    r.row('Carbons out', [bk.turn.cOut, bk.all.cOut]);
    r.row('NADH', [bk.turn.nadh, bk.all.nadh]);
    r.row('FADH_2', [bk.turn.fadh2, bk.all.fadh2]);
    r.row('ATP', [bk.turn.atp, bk.all.atp]);
  }

  function labelRows(r, level) {
    const lv = labelNow();
    r.head('The label');
    if (!lv) {
      if (level < 2) r.note('Label a carbon to follow it round the cycle.');
      else r.row('Carbon', 'none');
      return;
    }
    const lab = lv.lab;
    r.row('Carbon', lab.def.short, { accent: INK.gold });
    if (lv.remaining.m > 0) {
      r.row('Sits in', lv.position);
      if (level === 0) r.note(cap(spread(lab, false)) + '.');
    } else r.row('Sits in', lv.drainedIds.length ? 'carbon dioxide, and drained' : 'carbon dioxide');
    const turns = lab.byTurn.length;
    if (turns) {
      const from = Math.max(1, turns - 3);
      const shown = lab.byTurn.slice(from - 1).map(shareText).join(', ');
      r.row(turns === 1 ? 'Left on turn 1' : `Left, turns ${from}–${turns}`, shown);
    } else r.row('Left so far', 'none');
    if (booksNow().done > 0 && booksNow().done < 8 && st.k % 8 !== 0) r.row('Left this turn', shareText(lv.thisTurn));
    r.row('Still in the cycle', shareText(lv.remaining), { strong: true, accent: lv.remaining.m > 0 ? INK.gold : undefined });
    if (lv.drained.m > 0) r.row('Drained off', shareText(lv.drained));
  }

  function poolRows(r, level) {
    const dr = set.drain ? drains[set.drain] : null;
    const stalled = stalledNow();
    r.head('Oxaloacetate');
    r.row('Level', `${pct(st.L)} of its trace`, st.L < 0.999 ? { accent: INK.coral } : {});
    if (level < 2 || dr) r.row('Drain', dr ? `${NODES[dr.node].name} → ${dr.product}` : 'none');
    if (level < 2 || set.topUp) r.row('Top-up', set.topUp ? 'pyruvate → oxaloacetate' : 'off');
    if (stalled) r.note(set.topUp ? 'Stopped until the top-up has made enough.' : 'Stopped: short of oxaloacetate.', { accent: INK.coral });
    else if (st.L < 0.999 && level < 2) r.note(`Joins come at ${pct(Math.min(1, st.L))} of the usual rate.`);
  }

  function fuelRows(r, level) {
    const f = FUELS[set.fuel];
    const y = fuelYield(f);
    r.head('Fuel');
    r.row('Burning', `${f.name}, ${f.carbons} carbons`);
    r.row('Enters as', f.entry);
    r.row(`ATP per ${f.name}`, `about ${y.total}`);
    r.row('ATP per gram', `${fmt(y.perGram, 2)} mol`, { strong: true });
    if (level > 0) return;
    if (set.fuel === 'glucose') r.note(`Two turns a glucose. The 32 is ${f.tissue}’s.`);
    else if (set.fuel === 'fatty-acid') r.note(`Seven cuts, each 1 NADH and 1 FADH_2; 8 acetyl-CoA; 2 ATP to start.`);
    else r.note('Its nitrogen leaves for urea; its spare oxaloacetate comes back round as acetyl-CoA.');
  }

  function drawLedger() {
    const { w, h } = ledger.box;
    const key = [w, h, mode, b.narrow, st.k, st.L.toFixed(3), set.label, set.drain, set.topUp, set.fuel, st.lab ? st.lab.byTurn.length : 0, note].join('|');
    if (key === ledgerKey) return;
    ledgerKey = key;
    ledger.clear();
    const nar = Boolean(b.narrow);
    const size = nar ? 9.6 : clamp(w * 0.031, 10, 11.4);
    const opts = { size, titleSize: size - 1.2, headSize: size - 1.6, minRow: nar ? 12.5 : 14, maxRow: nar ? 17 : 22 };
    if (mode === 'side') {
      const books = ledger.readout({ title: 'The books', columns: ['This turn', 'So far'], width: w, ...opts });
      booksRows(books);
      const rowH = clamp(h * 0.045, 15, 21);
      const bottom = books.draw(rowH, h);
      const rest = ledger.readout({ y: bottom + rowH * 0.9, width: w, ...opts });
      rest.fit(h - bottom - rowH * 0.9, (r, level) => {
        labelRows(r, level);
        poolRows(r, level);
        fuelRows(r, level);
      }, { levels: 3 });
    } else {
      const gap = nar ? 14 : 22;
      const colW = (w - gap) / 2;
      const books = ledger.readout({ title: 'The books', columns: ['This turn', 'So far'], width: colW, ...opts });
      booksRows(books);
      if (nar) {
        books.fill(h);
        const rest = ledger.readout({ x: colW + gap, width: colW, ...opts });
        rest.fit(h, (r, level) => {
          if (stalledNow() || set.drain || level >= 2) poolRows(r, 2);
          if (st.lab || level < 2) labelRows(r, level + 1);
          if (!set.drain && !stalledNow() && level < 1) fuelRows(r, 1);
        }, { levels: 3 });
      } else {
        const rowH = clamp(h * 0.07, 15, 21);
        const bottom = books.draw(rowH, h);
        const pool = ledger.readout({ y: bottom + rowH * 0.9, width: colW, ...opts });
        pool.fit(h - bottom - rowH * 0.9, (r, level) => poolRows(r, level), { levels: 2 });
        const rest = ledger.readout({ x: colW + gap, width: colW, ...opts });
        rest.fit(h, (r, level) => {
          labelRows(r, level);
          fuelRows(r, level);
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
      vars = { '--kb-nrows': `minmax(0, 1fr) minmax(0, ${Math.round(clamp(H * 0.24, 104, 132))}px)` };
    } else if (H > W * 0.78) {
      want = 'stacked';
      const led = Math.round(clamp(H * 0.3, 170, 260));
      vars = { '--kb-cols': 'minmax(0, 1fr)', '--kb-rows': `minmax(0, 1fr) minmax(0, ${led}px)`, '--kb-lc': '1', '--kb-lr': '2' };
    } else {
      want = 'side';
      const ringW = Math.round(clamp(H * 1.16, W * 0.5, W * 0.66));
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
