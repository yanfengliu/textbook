// Figure 7.3, `respiratory-chain`: the fall, in four steps.
//
// The inner mitochondrial membrane turned on its side: it runs down the middle of the drawing with the
// matrix on its left and the intermembrane space on its right, and the height on the page is reduction
// potential, read off the axis at the left. So the drawing is also the graph. NADH docks at the top of
// complex I's arm at −0.32 V, ubiquinone sits in the bilayer at +0.04, cytochrome c on the outer face at
// +0.25, and oxygen takes the pair at the bottom, at +0.82, on the matrix side where the water is made. A
// pair of electrons is seen falling from rung to rung, and the charges a complex moves cross the membrane
// from left to right. The reader delivers pairs from NADH (at complex I) or from the Krebs cycle's FADH₂
// (at complex II, which is the cycle's own enzyme), blocks a complex with its inhibitor, takes the oxygen
// away, or moves the bottom rung to another acceptor. The row for ATP made here stays at 0 through all
// of it, because the chain makes none.
//
// THE NUMBERS, the prose's wherever it gives one (§7.4, §7.5, §7.7):
//   NAD⁺/NADH −0.32 V; the cycle's FAD, at the succinate/fumarate couple, +0.03; ubiquinone +0.04;
//   cytochrome c +0.25; O₂/H₂O +0.82. The other acceptors as §7.7's table has them: nitrate +0.42 (to
//   nitrite), fumarate +0.03, sulfate −0.22, carbon dioxide −0.24. Menaquinone −0.07 (Thauer, Jungermann &
//   Decker 1977, Bacteriol. Rev. 41:100, Table 5, −0.074).
//   Free energy per mole of pairs = 2 × 96.5 × the fall, rounded, as §7.4 prices it: from NADH 220, 143,
//   68, 19 and 15 kJ/mol; from FADH₂ 152 to oxygen (the prose's "about 150") and 75 to nitrate.
//   Charges moved per pair with oxygen, as §7.4 counts them: complex I 4; complex III 2 (it releases four
//   protons outside, but two of them came in on ubiquinol); complex IV 4 (two pumped, and two electrons
//   carried in to meet two protons from the matrix). Ten from NADH and six from FADH₂. Sources: Nicholls &
//   Ferguson, Bioenergetics 4 (2013), ch. 5; Brzezinski & Gennis 2008, J. Bioenerg. Biomembr. 40:521, for
//   complex IV's four charges; Hinkle et al. 1991, Biochemistry 30:3576, for the totals.
//   A charge moved against the chapter's 200 mV costs 96.5 × 0.2 = 19.3 kJ/mol.
//   The gradient when the chain runs: 0.75 pH units and 150 mV (§7.5; 0.75 × 61.5 ≈ 46 mV, about 196 in all).
//
// THE OTHER FOUR ACCEPTORS SHOW A CEILING, NOT A COUNT (accuracy review of 2026-09-24, finding 9). A fall
// of E kJ/mol can pay for at most E ÷ 19.3 charges against 200 mV, rounded down, and never more than the
// chain moves with oxygen for that donor: from NADH 7 to nitrate, 3 to fumarate, 0 to sulfate and 0 to
// carbon dioxide; from FADH₂ 3 to nitrate. The brief's first rule (a complex whose output sits below the
// acceptor is bypassed and the rest pump as usual) gave 8 and 4, which cost 154 and 77 kJ/mol against falls
// of 143 and 68. The stage names the number as a ceiling, "at most", and never as an organism's count,
// because none of the organisms that use these acceptors runs this chain. With oxygen the ceiling would be
// 11 and the count is 10, so the oxygen row is the chain's own count. No per-complex crossing is drawn for
// the other acceptors, and chargesMoved is null under them: there is nothing honest to count.
//   E. coli's own nitrate chain (NDH-1, 4, and the nitrate reductase's redox loop, 2) moves about 6: Unden,
//   Steinmetz & Degreif-Dünnwald 2014, EcoSal Plus 6(1) (H⁺/2e⁻ of 2 to 6 across its chains); Bertero et al.
//   2003, Nat. Struct. Biol. 10:681, for the redox loop; Simon, van Spanning & Richardson 2008, Biochim.
//   Biophys. Acta 1777:1480, on redox loops in general. Its Δp on nitrate or fumarate is only about 20 mV
//   below its aerobic −160 mV (Tran & Unden 1998, Eur. J. Biochem. 251:538), which is why the drawn gradient
//   does not shrink with the acceptor.
//   Sulfate and carbon dioxide from NADH (19 and 15 kJ/mol) pay for less than one charge. The stage says
//   what the review wrote (finding 8): these organisms take their electrons from fuels other than NADH,
//   mostly hydrogen, and move only a few ions per reaction. Schink 1997, Microbiol. Mol. Biol. Rev. 61:262
//   (about 20 kJ/mol per reaction, one ion across the membrane, is the smallest quantum a cell can use);
//   Thauer et al. 2008, Nat. Rev. Microbiol. 6:579 (methanogens on H₂ and CO₂); Pereira et al. 2011, Front.
//   Microbiol. 2:69 (sulfate reducers' electron donors and ion translocation).
//   Fumarate's reducers use menaquinone, whose rung sits above fumarate, because ubiquinone sits just below
//   it; the stage swaps the quinone and says so. Parasitic worms use rhodoquinone, at about the same
//   potential (Tielens & van Hellemond 1998, Biochim. Biophys. Acta 1365:71).
//
// SIMPLIFICATIONS, stated rather than implied:
//   - The other acceptors are the mitochondrial chain with its bottom rung moved: the same kind of
//     machinery, not any one organism's chain (§7.7). Under nitrate a nitrate reductase takes the place of
//     complexes III and IV, and under fumarate fumarate reductase, complex II's close relative, takes the
//     place of complex II; those are the enzymes that do it in E. coli. Under sulfate and carbon dioxide the
//     rung sits above everything the chain has, so its parts are drawn idle.
//   - A complex is drawn as a block spanning the potentials between the carriers on either side of it,
//     which is where its own centres lie; its inner centres are not drawn.
//   - One pair per station. A complex, a quinone or a cytochrome c holds one pair or none, and a pair moves
//     on the moment the next station is empty and its own exit is not blocked, the most downstream first.
//   - Standard potentials throughout, as the prose uses them.
//   - The gradient is a switch: 0.75 pH units and 150 mV once a pair has gone through a route that moves at
//     least one charge, for as long as the chosen donor's route stays open; 0 before and after. It eases
//     over 1.6 s on the stage; describe() reports where it is heading.
//   - Malonate stops the cycle's FADH₂ at its source (the succinate site of complex II), so FADH₂'s pairs are
//     refused and nothing below complex II is reduced. NADH's pairs never pass through complex II, so with
//     NADH fed straight in the chain runs on. A real mitochondrion on pyruvate slows and stops too, because
//     its cycle halts at succinate (§7.8), so no word here says the chain runs on any NADH-linked fuel.
//     Malonate also blocks fumarate reductase, and does so here.
//   - Changing the acceptor starts a fresh experiment: the flow and the counters clear.
//
// CHANGES FROM THE BRIEF (FIGURES.md, as first written), each for the review of 2026-09-24 or for the
// drawing:
//   - protonsPumped is chargesMoved, with chargesPerPair and chargesAreCeiling beside it, because §7.4 now
//     prices the gradient in charges (4, 2 and 4) and not in protons released (4, 4 and 2).
//   - Nitrate 8 → at most 7, fumarate 4 → at most 3 (finding 9).
//   - The gradient reads 0 until a pair has passed, rather than opening charged.
//   - The stage is 16 / 10, not 21 / 9, and the membrane runs down the stage at every width, which is the
//     brief's own narrow composition: a membrane drawn across the stage cannot put every carrier at its own
//     potential, which is what the brief asks the drawing to do.
//
// TWO ARRANGEMENTS of one drawing, chosen by the pane's shape rather than by a flag: landscape with the
// readout in a column at the right, and portrait (the phone's 2 / 3 stage) with the readout beneath, its two
// tables side by side where their rows fit. The toolbar's short labels come in below a 600 px stage. Every label is measured and placed against every
// mark, line and label already placed, as in zscheme; in the lab a label nothing clears is thrown as a
// defect.
//
// describe() is documented at the foot of this file.
import { C, el, h, clamp, lerp } from './lib/svg.js';
import { bench, EM_ADVANCE } from './lib/bench.js';
import { membranePart, metabolismPart } from '../palette.js';

export const meta = { kind: 'respiratory-chain', title: 'The fall, in four steps', needsWebGL: false, aspect: 16 / 10, narrowAspect: 2 / 3 };

// ---------------------------------------------------------------- the chemistry

const FARADAY = 96.5; // kJ per mole of electrons per volt, as §7.4 rounds it
const PMF_MV = 200; // the chapter's proton-motive force
const PER_CHARGE = (FARADAY * PMF_MV) / 1000; // 19.3 kJ/mol a charge
const PH_DIFF = 0.75;
const PSI_MV = 150;

const E = Object.freeze({ nadh: -0.32, fad: 0.03, uq: 0.04, mq: -0.07, c: 0.25, o2: 0.82, no3: 0.42 });

// In the stepper's order, which is the order of yield: §7.7's table, top to bottom. `short` is what a
// label shrinks to when the full one finds no room.
const ACCEPTORS = Object.freeze([
  { id: 'oxygen', E: 0.82, label: 'O_{2} → H_{2}O', short: 'O_{2}', mark: 'O_{2}', plain: 'O₂', word: 'oxygen', product: 'H_{2}O' },
  { id: 'nitrate', E: 0.42, label: 'NO_{3}^{−} → NO_{2}^{−}', short: 'NO_{3}^{−}', mark: 'NO_{3}^{−}', plain: 'NO₃⁻', word: 'nitrate', product: 'NO_{2}^{−}' },
  { id: 'fumarate', E: 0.03, label: 'fumarate → succinate', short: 'fumarate', mark: 'fumarate', plain: 'fumarate', word: 'fumarate', product: 'succinate' },
  { id: 'sulfate', E: -0.22, label: 'SO_{4}^{2−}', short: 'SO_{4}^{2−}', mark: 'SO_{4}^{2−}', plain: 'SO₄²⁻', word: 'sulfate', product: null },
  { id: 'carbon-dioxide', E: -0.24, label: 'CO_{2}', short: 'CO_{2}', mark: 'CO_{2}', plain: 'CO₂', word: 'carbon dioxide', product: null },
]);

const BLOCKS = Object.freeze([
  { at: null, by: null },
  { at: 'I', by: 'rotenone' },
  { at: 'II', by: 'malonate' },
  { at: 'III', by: 'antimycin A' },
  { at: 'IV', by: 'cyanide' },
]);

// Charges across the membrane per pair leaving each complex, with oxygen at the bottom (§7.4).
const CHARGES_AT = Object.freeze({ I: 4, III: 2, IV: 4 });
const OXYGEN_COUNT = Object.freeze({ nadh: 10, fadh2: 6 });

const round2 = (v) => Math.round(v * 100) / 100;
const donorE = (dn) => (dn === 'nadh' ? E.nadh : E.fad);
const fallOf = (dn, a) => round2(a.E - donorE(dn));
const kjOf = (fall) => Math.round(2 * FARADAY * fall);
function chargesFor(dn, a) {
  if (a.id === 'oxygen') return OXYGEN_COUNT[dn];
  const kj = kjOf(fallOf(dn, a));
  if (kj <= 0) return 0;
  return Math.min(OXYGEN_COUNT[dn], Math.floor(kj / PER_CHARGE));
}

// Where a pair goes from each station, by acceptor. Sulfate and carbon dioxide sit above complex I's
// output, so NADH's pair is drawn falling straight to them and no station is used.
function routeOf(a) {
  if (a.id === 'oxygen') return { I: 'Q', II: 'Q', Q: 'III', III: 'c', c: 'IV', IV: 'out' };
  if (a.id === 'nitrate') return { I: 'Q', II: 'Q', Q: 'Nar', Nar: 'out' };
  if (a.id === 'fumarate') return { I: 'Q', Q: 'II', II: 'out' };
  return {};
}
function depthOf(route, s) {
  let n = 0;
  for (let at = s; at !== 'out'; at = route[at]) {
    n += 1;
    if (n > 12 || !route[at]) throw new Error(`respiratory-chain: the route from ${s} never reaches the acceptor (${JSON.stringify(route)}).`);
  }
  return n;
}
// The stations in play under each acceptor, in the order the chain passes them.
function inPlay(a) {
  if (a.id === 'oxygen') return ['I', 'II', 'Q', 'III', 'c', 'IV'];
  if (a.id === 'nitrate') return ['I', 'II', 'Q', 'Nar'];
  if (a.id === 'fumarate') return ['I', 'Q', 'II'];
  return [];
}
function nameOf(s, a) {
  switch (s) {
    case 'I': return 'complex I';
    case 'II': return a.id === 'fumarate' ? 'fumarate reductase' : 'complex II';
    case 'Q': return a.id === 'fumarate' ? 'menaquinone' : 'ubiquinone';
    case 'Nar': return 'nitrate reductase';
    case 'III': return 'complex III';
    case 'c': return 'cytochrome c';
    case 'IV': return 'complex IV';
    default: throw new Error(`respiratory-chain: no station called "${s}".`);
  }
}

// ---------------------------------------------------------------- time

const STEP = 1 / 60;
const T_HOP = 0.36;
const T_APPEAR = 0.3;
const T_GAP = 0.2;
const T_CHARGE = 0.6;
const STAGGER = 0.13;
const T_FX = 1.0;
const T_GRAD = 1.6;
const ease = (f) => f * f * (3 - 2 * f);

// No-break spaces: a sentence must not break inside "complex III", "0.82 V" or "19.3 kJ/mol".
const NB = String.fromCharCode(0xa0);
const VMIN = -0.44;
const VMAX = 0.9;
const TICKS = [-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];
const sv = (v) => (v > 0 ? `+${v.toFixed(2)}` : v < 0 ? `−${Math.abs(v).toFixed(2)}` : '0.00');
const si = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));
const cap = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;

// ---------------------------------------------------------------- type set as type
//
// A label on the stage is a small piece of markup, so that O₂, NO₃⁻ and FADH₂ are set with real super- and
// subscripts: `^{−}` raises, `_{2}` lowers, `~c~` is italic. The shift is a `dy`, which every engine draws.
function runsOf(src) {
  const runs = [];
  let buf = '';
  let italic = false;
  const flush = () => {
    if (buf) runs.push({ t: buf, kind: null, italic });
    buf = '';
  };
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];
    if ((c === '^' || c === '_') && src[i + 1] === '{') {
      const end = src.indexOf('}', i + 2);
      if (end < 0) throw new Error(`respiratory-chain: the label "${src}" opens a ${c === '^' ? 'superscript' : 'subscript'} at ${i} and never closes it with "}".`);
      flush();
      runs.push({ t: src.slice(i + 2, end), kind: c === '^' ? 'sup' : 'sub', italic });
      i = end;
    } else if (c === '~') {
      flush();
      italic = !italic;
    } else buf += c;
  }
  flush();
  return runs;
}

function fillRuns(node, src, size) {
  let shift = 0;
  for (const r of runsOf(src)) {
    const want = r.kind === 'sup' ? -0.38 * size : r.kind === 'sub' ? 0.22 * size : 0;
    const attrs = {};
    if (want !== shift) attrs.dy = (want - shift).toFixed(2);
    if (r.kind) attrs['font-size'] = (size * 0.7).toFixed(2);
    if (r.italic) attrs['font-style'] = 'italic';
    node.append(el('tspan', attrs, [r.t]));
    shift = want;
  }
  return node;
}

// The toolbar's words are HTML, where the Unicode sub- and superscripts would be drawn by the face at its
// own idea of their size. Each run of them is set as <sub> or <sup> instead; the accessible name, which is
// the aria-label, keeps the plain form.
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '−' };
const SCRIPT_RE = /[₀-₉⁰¹²³⁴-⁻]/;
function scriptify(root) {
  if (!root || typeof document === 'undefined') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (SCRIPT_RE.test(n.nodeValue)) hits.push(n);
  for (const n of hits) {
    const frag = document.createDocumentFragment();
    let buf = '';
    let mode = null;
    const flush = () => {
      if (buf) frag.append(mode ? h(mode, { text: buf }) : document.createTextNode(buf));
      buf = '';
    };
    for (const ch of n.nodeValue) {
      const m = SUB.includes(ch) ? 'sub' : Object.hasOwn(SUP, ch) ? 'sup' : null;
      if (m !== mode) {
        flush();
        mode = m;
      }
      buf += m === 'sub' ? String(SUB.indexOf(ch)) : m === 'sup' ? SUP[ch] : ch;
    }
    flush();
    n.replaceWith(frag);
  }
}

// ---------------------------------------------------------------- the marks' own CSS

const CSS = `
.tb-respiratory-chain .rc-tick { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-respiratory-chain .rc-cap { fill: var(--ink-soft); }
.tb-respiratory-chain .rc-name { fill: var(--ink); font-weight: 600; }
.tb-respiratory-chain .rc-soft { fill: var(--ink-soft); }
.tb-respiratory-chain .rc-region { fill: var(--ink-soft); font-style: italic; }
.tb-respiratory-chain .rc-grid { stroke: var(--rule); stroke-width: 0.6; }
.tb-respiratory-chain .rc-spine { stroke: var(--rule-strong); stroke-width: 1; }
.tb-respiratory-chain .rc-path { stroke: var(--ink-soft); stroke-width: 1.3; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.tb-respiratory-chain .rc-path.is-off { stroke: var(--rule-strong); stroke-width: 1.1; stroke-dasharray: 3 3.5; }
.tb-respiratory-chain .rc-leader { stroke: var(--rule-strong); stroke-width: 0.8; }
.tb-respiratory-chain .rc-axisval { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-respiratory-chain .rc-charge { fill: var(--leaf-text); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-respiratory-chain .rc-block { fill: var(--coral-text); font-weight: 600; }
.tb-respiratory-chain .rc-idle { fill: var(--paper-2); stroke: var(--rule-strong); stroke-width: 1; stroke-dasharray: 3 2.5; }
.tb-respiratory-chain .rc-idle-num { fill: var(--ink-soft); font-weight: 700; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: 600 },
    seed: 73,
  });
  const PUMP = membranePart('pump');
  const HEAD_FILL = membranePart('lipidHead').color;
  const TAIL_FILL = membranePart('lipidTail').color;
  const ENZ = metabolismPart('enzyme');
  const CARRIER = metabolismPart('electronCarrier').color;
  const LOADED = metabolismPart('electronCarrierLoaded').color;

  // ---- the model ----
  let donor = 'nadh';
  let accIdx = 0;
  let oxygenOn = true;
  let blockIdx = 0;
  let held = {};
  let pairs = { nadh: 0, fadh2: 0 };
  let charges = 0; // charges moved on the oxygen route since the last clear
  let completed = 0; // pairs that reached the acceptor through the chain since the last clear
  let refused = null;
  let jamEntry = false;
  let steps = 0;
  // ---- the drawing's schedule ----
  let moves = [];
  let fx = [];
  let ready = {};
  let lastDepart = { nadh: -Infinity, fadh2: -Infinity };
  let grad = { from: 0, to: 0, t0: 0 };
  let syncing = false;

  const acc = () => ACCEPTORS[accIdx];
  const block = () => BLOCKS[blockIdx];
  const now = () => steps * STEP;
  const pinned = () => ctx.pinnedTime !== null && ctx.pinnedTime !== undefined;
  const instant = () => Boolean(ctx.reducedMotion) || pinned();
  const d = (x) => (instant() ? 0 : x);

  function clearFlow() {
    held = {};
    pairs = { nadh: 0, fadh2: 0 };
    charges = 0;
    completed = 0;
    refused = null;
    jamEntry = false;
    moves = [];
    fx = [];
    ready = { I: [], II: [], Q: [], Nar: [], III: [], c: [], IV: [] };
    lastDepart = { nadh: -Infinity, fadh2: -Infinity };
  }

  // One pair leaving `from` for `to`, no earlier than `t` and no earlier than it arrived at `from`, so the
  // drawing never shows a station handing on a pair it has not yet received.
  function hop(from, to, t, dur) {
    const queued = ready[from]?.shift();
    const start = Math.max(t, queued ?? -Infinity);
    const move = { from, to, t0: start, t1: start + d(dur) };
    moves.push(move);
    ready[to]?.push(move.t1);
    return move;
  }

  function exitBlocked(s) {
    const a = acc();
    const bl = block();
    if (bl.at === s && (s !== 'II' || a.id === 'fumarate')) return true;
    return s === 'IV' && a.id === 'oxygen' && !oxygenOn;
  }

  // Run the pairs downhill as far as there is room, the most downstream first.
  function settle(t) {
    const a = acc();
    const route = routeOf(a);
    const order = Object.keys(route).sort((x, y) => depthOf(route, x) - depthOf(route, y));
    for (let guard = 0; guard < 64; guard += 1) {
      const s = order.find((st) => held[st] && !exitBlocked(st) && (route[st] === 'out' || !held[route[st]]));
      if (!s) return;
      const next = route[s];
      held[s] = 0;
      const m = hop(s, next, t, T_HOP);
      if (a.id === 'oxygen' && CHARGES_AT[s]) {
        charges += CHARGES_AT[s];
        fx.push({ kind: 'charges', at: m.t0, station: s, n: CHARGES_AT[s] });
      }
      if (next === 'out') {
        completed += 1;
        if (a.product) fx.push({ kind: 'product', at: m.t1 });
      } else held[next] = 1;
    }
    throw new Error(`respiratory-chain: the pairs did not settle within 64 moves (${JSON.stringify({ held, acceptor: a.id, block: block().at, oxygenOn })}); a route is moving a pair back and forth.`);
  }

  function entryOf(dn) {
    const a = acc();
    if (dn === 'nadh') return a.id === 'sulfate' || a.id === 'carbon-dioxide' ? 'out' : 'I';
    if (a.id === 'fumarate') return 'no-fall';
    if (a.E < E.fad) return 'uphill';
    return 'II';
  }

  function deliver() {
    refused = null;
    const entry = entryOf(donor);
    if (entry === 'no-fall' || entry === 'uphill') {
      refused = entry;
      return false;
    }
    if (entry === 'II' && block().at === 'II') {
      refused = 'blocked-entry';
      jamEntry = true;
      return false;
    }
    if (entry !== 'out' && held[entry]) {
      refused = 'backed-up';
      return false;
    }
    jamEntry = false;
    const t = Math.max(now(), lastDepart[donor] + d(T_GAP));
    lastDepart[donor] = t;
    pairs[donor] += 1;
    if (entry === 'out') {
      // 19 and 15 kJ/mol pay for no charge, so nothing is counted towards the gradient.
      moves.push({ from: 'src', to: 'out', t0: t, t1: t + d(T_HOP * 1.4) });
      return true;
    }
    const m = { from: donor === 'nadh' ? 'src' : 'src2', to: entry, t0: t, t1: t + d(donor === 'nadh' ? T_HOP * 1.3 : T_APPEAR) };
    moves.push(m);
    ready[entry].push(m.t1);
    held[entry] = 1;
    settle(t);
    return true;
  }

  // The chosen donor's whole route is open: a pair from it would reach the acceptor.
  function routeOpen(dn) {
    const entry = entryOf(dn);
    if (entry === 'out') return true;
    if (entry !== 'I' && entry !== 'II') return false;
    if (entry === 'II' && block().at === 'II') return false;
    const route = routeOf(acc());
    for (let s = entry, n = 0; s !== 'out' && n < 12; s = route[s], n += 1) if (exitBlocked(s)) return false;
    return true;
  }
  const gradTarget = () => (completed > 0 && routeOpen(donor) && chargesFor(donor, acc()) >= 1 ? 1 : 0);
  function gradShown(t) {
    if (instant()) return grad.to;
    const f = clamp((t - grad.t0) / T_GRAD, 0, 1);
    return grad.from + (grad.to - grad.from) * ease(f);
  }
  function retarget() {
    const to = gradTarget();
    if (to === grad.to) return;
    const t = now();
    grad = { from: gradShown(t), to, t0: t };
  }

  function crossoverAt() {
    const route = routeOf(acc());
    const full = Object.keys(route).filter((s) => held[s]);
    if (full.length) return full.sort((x, y) => depthOf(route, x) - depthOf(route, y))[0];
    return jamEntry ? 'II' : null;
  }

  // ---- panes ----
  const pane = b.pane('chain', {
    as: 'svg',
    focus: true,
    aria: 'The electron transport chain drawn against reduction potential. The inner membrane runs down the middle, the matrix on its left and the intermembrane space on its right, and the height is the potential: NADH at −0.32 volts at the top feeds complex I, then ubiquinone, complex III, cytochrome c and complex IV, down to oxygen at +0.82; complex II enters at +0.03 with the cycle\'s FADH2. Charges cross the membrane from left to right, and a table beside the drawing shows what a pair releases and moves, and that the chain makes no ATP. Press N or F to choose NADH or FADH2, D or Enter to deliver a pair, B to block the next complex, O to take the oxygen away or give it back, A to change the acceptor, Space to run or pause, and Home to reset.',
  });
  b.compose({
    wide: { columns: 'minmax(0, 1fr)', rows: 'minmax(0, 1fr)', at: { chain: [1, 1] } },
    narrow: { columns: 'minmax(0, 1fr)', rows: 'minmax(0, 1fr)', at: { chain: [1, 1] } },
  });

  // A measuring probe for the labels: the placement is only as good as the widths it is given.
  const probe = el('svg', { 'aria-hidden': 'true', style: 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none' });
  pane.el.append(probe);
  const widths = new Map();
  const fontsKey = () => (typeof document !== 'undefined' && document.fonts ? document.fonts.status : 'x');
  function textWidth(src, size, weight = 400) {
    const key = `${fontsKey()}|${size}|${weight}|${src}`;
    if (widths.has(key)) return widths.get(key);
    const t = fillRuns(el('text', { x: 0, y: 0, 'font-size': size, 'font-weight': weight }), src, size);
    probe.append(t);
    let w = 0;
    try {
      w = t.getBBox().width;
    } catch {
      w = 0;
    }
    t.remove();
    if (!(w > 0)) w = runsOf(src).reduce((s, r) => s + r.t.length * EM_ADVANCE * size * (r.kind ? 0.7 : 1), 0);
    widths.set(key, w);
    return w;
  }
  // A readout title's width: set in capitals, weight 600, letter-spaced by a tenth of an em.
  const capsWidth = (str, size) => textWidth(str.toUpperCase(), size, 600) + str.length * size * 0.1;

  // ---- controls ----
  function afterAction() {
    retarget();
    draw();
    b.announce();
  }
  function deliverAct() {
    deliver();
    if (!b.playing) runCtl.set(true);
    afterAction();
  }
  const donorCtl = b.choice('Donor', [
    { id: 'nadh', label: 'NADH', aria: 'NADH, a pair enters at complex I' },
    { id: 'fadh2', label: 'FADH₂ from the cycle', short: 'FADH₂', aria: 'FADH₂ from the cycle, a pair enters at complex II' },
  ], (id) => {
    donor = id;
    refused = null;
    jamEntry = false;
    afterAction();
  }, { segmented: true });
  b.action('Deliver a pair', () => deliverAct(), { short: 'Deliver', primary: true, aria: 'Deliver a pair, from the chosen donor' });
  // Run and Reset stand with Deliver, so that the conditions below (block, oxygen, acceptor) share a row
  // and a longer value in one of them does not push the toolbar onto a third.
  const runCtl = b.run({ primary: false, aria: 'Run, let the pairs move', onChange: () => draw() });
  b.action('Reset', () => resetAll(), { aria: 'Reset, the chain idle with oxygen present and nothing blocked' });
  b.divide();
  // The inhibitor's name alone: the stage marks the complex it stops.
  const BLOCK_SAY = ['nothing blocked', 'rotenone, blocking complex I', 'malonate, blocking complex II', 'antimycin A, blocking complex III', 'cyanide, blocking complex IV'];
  const blockCtl = b.stepper('Block', {
    min: 0, max: 4, step: 1, value: 0,
    format: (v) => BLOCKS[v]?.by ?? 'none',
    valueText: (v) => BLOCK_SAY[v],
    onInput: (v) => {
      if (syncing) return;
      blockIdx = v;
      refused = null;
      jamEntry = false;
      settle(now());
      afterAction();
    },
  });
  const oxyCtl = b.toggle('Oxygen', (on) => {
    refused = null;
    if (on) {
      if (acc().id !== 'oxygen') setAcceptor(0);
      else {
        oxygenOn = true;
        settle(now());
      }
    } else if (acc().id === 'oxygen') oxygenOn = false;
    afterAction();
  }, { pressed: true, aria: 'Oxygen, at the bottom of the chain' });
  const accCtl = b.stepper('Acceptor', {
    min: 0, max: ACCEPTORS.length - 1, step: 1, value: 0,
    format: (v, { narrow }) => (narrow ? ACCEPTORS[v].plain : `${ACCEPTORS[v].plain} ${sv(ACCEPTORS[v].E)} V`),
    valueText: (v) => `${ACCEPTORS[v].word}, ${sv(ACCEPTORS[v].E)} volts`,
    onInput: (v) => {
      scriptify(accCtl?.node);
      if (syncing) return;
      setAcceptor(v);
      afterAction();
    },
  });
  function setAcceptor(i) {
    accIdx = i;
    oxygenOn = ACCEPTORS[i].id === 'oxygen';
    oxyCtl.set(oxygenOn, { quiet: true });
    if (accCtl.value !== i) {
      syncing = true;
      accCtl.set(i);
      syncing = false;
    }
    clearFlow();
  }
  for (const n of donorCtl.nodes) scriptify(n);
  scriptify(accCtl.node);

  b.keys({
    n: () => donorCtl.set('nadh'),
    N: () => donorCtl.set('nadh'),
    f: () => donorCtl.set('fadh2'),
    F: () => donorCtl.set('fadh2'),
    d: () => deliverAct(),
    D: () => deliverAct(),
    Enter: () => deliverAct(),
    b: () => blockCtl.set((blockIdx + 1) % BLOCKS.length),
    B: () => blockCtl.set((blockIdx + 1) % BLOCKS.length),
    o: () => oxyCtl.toggle(),
    O: () => oxyCtl.toggle(),
    a: () => accCtl.set((accIdx + 1) % ACCEPTORS.length),
    A: () => accCtl.set((accIdx + 1) % ACCEPTORS.length),
    ' ': () => runCtl.toggle(),
    Home: () => resetAll(),
  });

  function resetAll() {
    runCtl.set(false);
    b.restart(); // which calls the clock's restart, below
    b.announce();
  }

  // ---- the clock: only the drawing runs on it ----
  b.clock({
    step: STEP,
    restart: () => {
      steps = 0;
      donor = 'nadh';
      donorCtl.set('nadh', { quiet: true });
      blockIdx = 0;
      syncing = true;
      blockCtl.set(0);
      syncing = false;
      setAcceptor(0);
      oxygenOn = true;
      oxyCtl.set(true, { quiet: true });
      grad = { from: 0, to: 0, t0: 0 };
    },
    advance: () => {
      steps += 1;
      const t = now();
      if (moves.length && moves.some((m) => m.t1 < t)) moves = moves.filter((m) => m.t1 >= t);
      if (fx.length && fx.some((f) => fxEnd(f) < t)) fx = fx.filter((f) => fxEnd(f) >= t);
    },
  });
  const fxEnd = (f) => (f.kind === 'charges' ? f.at + (f.n - 1) * STAGGER + T_CHARGE * 1.75 : f.at + T_FX);
  clearFlow();

  // ---- what describe() reports ----
  function carriers() {
    const a = acc();
    const list = inPlay(a);
    return {
      reduced: list.filter((s) => held[s]).map((s) => nameOf(s, a)),
      oxidised: list.filter((s) => !held[s]).map((s) => nameOf(s, a)),
    };
  }
  function state() {
    const a = acc();
    const fall = fallOf(donor, a);
    const on = gradTarget();
    const cs = carriers();
    return {
      donor,
      pairsDelivered: pairs.nadh + pairs.fadh2,
      pairsByDonor: { nadh: pairs.nadh, fadh2: pairs.fadh2 },
      chargesMoved: a.id === 'oxygen' ? charges : null,
      chargesPerPair: chargesFor(donor, a),
      chargesAreCeiling: a.id !== 'oxygen',
      potentialDropV: fall,
      energyReleasedKj: kjOf(fall),
      atpMadeHere: 0,
      gradientPH: on ? PH_DIFF : 0,
      gradientMv: on ? PSI_MV : 0,
      oxygenPresent: a.id === 'oxygen' && oxygenOn,
      acceptor: a.id,
      acceptorPotentialV: a.E,
      quinone: a.id === 'fumarate' ? 'menaquinone' : 'ubiquinone',
      blockedAt: block().at,
      blockedBy: block().by,
      reducedCarriers: cs.reduced,
      oxidisedCarriers: cs.oxidised,
      crossoverAt: crossoverAt(),
      refused,
      t: Number(now().toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  b.onAnnounce((s) => {
    const a = ACCEPTORS.find((x) => x.id === s.acceptor);
    const who = s.donor === 'nadh' ? 'NADH' : 'FADH2 from the cycle';
    const count = s.chargesAreCeiling ? `at most ${s.chargesPerPair} charges a pair, a ceiling` : `${s.chargesMoved} charges moved`;
    const blocked = s.blockedBy ? ` ${cap(s.blockedBy)} blocks complex ${s.blockedAt}.` : '';
    const noO2 = s.acceptor === 'oxygen' && !s.oxygenPresent ? ' No oxygen.' : '';
    const cross = s.crossoverAt ? ` Crossover at ${nameOf(s.crossoverAt, a)}.` : '';
    const no = s.refused ? ` The last pair was refused: ${refusalWords(s.refused)}.` : '';
    return `${who} to ${a.word}: ${s.pairsDelivered} ${s.pairsDelivered === 1 ? 'pair' : 'pairs'} delivered, ${count}. Gradient ${s.gradientPH} pH units and ${s.gradientMv} millivolts. ATP made here 0.${blocked}${noO2}${cross}${no}`;
  });
  function refusalWords(r) {
    if (r === 'blocked-entry') return 'malonate holds the cycle at succinate, so no FADH2 is made';
    if (r === 'backed-up') return 'the chain is backed up to the door';
    if (r === 'no-fall') return 'FADH2 and fumarate sit at the same potential';
    return 'the acceptor sits above FADH2, uphill';
  }

  // ---- the sentence under the table, in every state the controls can make ----
  const cname = (s) => nameOf(s, acc()).replace(' ', NB);
  function status(short) {
    const a = acc();
    const bl = block();
    const per = chargesFor(donor, a);
    const kj = kjOf(fallOf(donor, a));
    const entry = entryOf(donor);
    const x = crossoverAt();
    const unused = bl.at && !inPlay(a).includes(bl.at);
    const unusedBlock = unused ? ` ${cap(bl.by)} blocks complex${NB}${bl.at}, which this route does not use.` : '';
    const unusedShort = unused ? ` ${cap(bl.by)}: no complex${NB}${bl.at} in this chain.` : '';
    // The donor cannot give to this acceptor at all.
    if (entry === 'no-fall') {
      return short ? 'No fall: FADH₂ and fumarate are level.' : `The cycle's FADH₂ sits at +0.03${NB}V, level with fumarate: there is no fall, so no pair goes.`;
    }
    if (entry === 'uphill') {
      return short ? `Uphill: ${a.word} sits above FADH₂.` : `The cycle's FADH₂ sits at +0.03${NB}V and ${a.word} higher up, at ${sv(a.E)}${NB}V: a pair would have to run uphill, so none goes.`;
    }
    if (donor === 'fadh2' && bl.at === 'II') {
      return short ? 'Malonate: no FADH₂ is made.' : `Malonate sits in complex${NB}II's succinate site, so the cycle makes no FADH₂ and no pair enters. Everything below complex${NB}II stays oxidised.`;
    }
    const full = refused === 'backed-up' ? ' A new pair has nowhere to go.' : '';
    if (x) {
      if (routeOpen(donor)) {
        return short ? `${cap(bl.by ?? 'the block')} holds NADH; FADH₂ runs.` : `${cap(bl.by ?? 'the block')} holds NADH's pairs at complex${NB}I, but the cycle's FADH₂ enters below it, at complex${NB}II, and ${a.id === 'oxygen' ? `still moves ${per} charges a pair` : `still pays for at most ${per} ${per === 1 ? 'charge' : 'charges'} a pair`}.`;
      }
      if (bl.at !== x && x === 'IV' && a.id === 'oxygen' && !oxygenOn) {
        return short ? 'No oxygen: backed up from the bottom.' : `No oxygen: complex${NB}IV has nothing to hand its pair to, so the chain backs up from the bottom and the gradient runs down.${full}`;
      }
      const by = bl.at === x ? cap(bl.by) : 'The block';
      return short
        ? `Crossover at ${cname(x)}.`
        : `${by} stops ${cname(x)}: the carriers above it are reduced and those below it oxidised, so the crossover is at ${cname(x)}, and the gradient runs down.${full}`;
    }
    if (a.id === 'sulfate' || a.id === 'carbon-dioxide') {
      return short
        ? `${kj}${NB}kJ/mol: less than one charge.${unusedShort}`
        : `${kj}${NB}kJ/mol from NADH is not quite one charge's worth (19.3${NB}kJ/mol). These organisms take their electrons from fuels other than NADH, mostly hydrogen, and move only a few ions per reaction.${unusedBlock}`;
    }
    const idle = pairs.nadh + pairs.fadh2 === 0;
    const malonate = bl.at === 'II' && donor === 'nadh' && a.id !== 'fumarate' ? `Malonate blocks complex${NB}II, which NADH's pairs never pass through. ` : '';
    if (a.id === 'oxygen') {
      if (!oxygenOn) return short ? 'No oxygen.' : `No oxygen: complex${NB}IV has nothing to hand a pair to.`;
      if (idle) return short ? 'Deliver a pair.' : `${malonate}Nothing delivered yet. Deliver a pair, and count the charges it moves across the membrane.`;
      if (donor === 'nadh') {
        return short ? '10 charges a pair, and no ATP.' : `${malonate}From NADH, 4 + 2 + 4 = 10 charges a pair${malonate ? ', as before' : ''}, and no ATP. The chain's product is the gradient.`;
      }
      return short ? '6 charges a pair, and no ATP.' : `From FADH₂ the pair enters at complex${NB}II, past complex${NB}I: 2 + 4 = 6 charges a pair, and no ATP.`;
    }
    const ceiling = `${kj}${NB}kJ/mol pays for at most ${per} ${per === 1 ? 'charge' : 'charges'} at 200${NB}mV (19.3${NB}kJ/mol each): a ceiling, not any organism's count.`;
    if (a.id === 'nitrate') {
      if (short) return `At most ${per} charges: a ceiling.${unusedShort}`;
      return `${malonate}${ceiling}${donor === 'nadh' ? ' A real nitrate chain in a bacterium moves about 6.' : ''}${unusedBlock}`;
    }
    // fumarate, from NADH (FADH₂ has no fall to it, above)
    if (short) return `Menaquinone; at most ${per} charges.${unusedShort}`;
    return `Menaquinone (−0.07${NB}V) stands in for ubiquinone (+0.04${NB}V), which sits past fumarate (+0.03${NB}V) and could not hand it a pair. ${ceiling}${unusedBlock}`;
  }
  const SAME_KIND = 'The mitochondrial chain with its bottom rung moved: the same kind of machinery, not any one organism\'s chain.';
  // The readout's row names, shared by the tables and by the test of whether they fit side by side.
  const ROW = {
    fall: 'Fall, V', kj: 'Released, kJ/mol', moved: 'Charges moved', most: 'Charges, at most', pairs: 'Pairs delivered',
    all: 'Charges moved in all', ph: 'pH difference', psi: 'Membrane potential', atp: 'ATP made here',
  };

  // ---------------------------------------------------------------- the drawing's clock-side state

  // How many pairs a station is DRAWN holding at time t: the model, less those still on their way to it,
  // plus those that have not yet left it.
  function shown(station, t) {
    let n = held[station] ? 1 : 0;
    for (const m of moves) {
      if (m.to === station && m.t1 > t) n -= 1;
      if (m.from === station && m.t0 > t) n += 1;
    }
    return clamp(n, 0, 1);
  }
  const chargesShown = (t) => charges - fx.filter((f) => f.kind === 'charges' && f.at > t).reduce((s, f) => s + f.n, 0);

  // ---------------------------------------------------------------- geometry
  //
  // Everything the drawing needs is decided here, once per pane size, acceptor, block, donor and oxygen,
  // and both the drawing and the label placement read it, so a label is placed against exactly what is
  // drawn.
  let geo = null;
  function geometry(w, hh) {
    const key = `${w}|${hh}|${fontsKey()}|${accIdx}|${blockIdx}|${donor}|${oxygenOn}`;
    if (geo?.key === key) return geo;
    const g = frame(w, hh);
    g.key = key;
    placeLabels(g);
    geo = g;
    return g;
  }

  // The type size, from `top` down to 9.6 px, at which the readout's two tables fit side by side in
  // columns `cw` wide, or null if none does: each row's name, a gap and its value inside its column, the
  // FADH₂ figures inside their quarter, and the second table's title inside its half. The widest values
  // any state reaches are measured, a three-digit pair count and a four-digit charge count among them,
  // so the layout does not change as the numbers climb.
  const READ_GUTTER = 14;
  function sideSize(cw, top) {
    const gap = 8;
    const fits = (label, value, room, size, weight = 400) => textWidth(label, size, weight) + gap + textWidth(value, size, weight) <= room;
    for (let size = top; size >= 9.6 - 1e-6; size = Math.round((size - 0.2) * 10) / 10) {
      const ok = [[ROW.fall, '1.14'], [ROW.kj, '220'], [ROW.moved, '10'], [ROW.most, '10'], [ROW.pairs, '100']].every(([l, v]) => fits(l, v, 0.75 * cw, size))
        && ['0.79', '152', '−52', '100'].every((v) => textWidth(v, size) + gap <= 0.25 * cw)
        && [[ROW.all, '1000'], [ROW.ph, '0.75 units'], [ROW.psi, '150 mV']].every(([l, v]) => fits(l, v, cw, size))
        && fits(ROW.atp, '0', cw, size, 600)
        && capsWidth('Across the membrane', size * 0.88) <= cw;
      if (ok) return size;
    }
    return null;
  }

  function frame(w, hh) {
    const portrait = hh > w * 0.92;
    const g = { w, h: hh, portrait };
    // Nothing is drawn within M of the pane's edge, where the focus brackets stand. `dw` and `dh` are the
    // drawing's right and bottom limits in pane coordinates, not its size.
    const M = 8;
    g.M = M;
    g.readSide = false;
    if (portrait) {
      // Under the drawing the readout's two tables stand side by side when every row fits its half, at
      // down to 9.6 px type, and stack when not. The readout takes about a third of the height, unless
      // that would leave the drawing under 200 px; then it gives way down to what its tersest level needs,
      // about 100 px side by side and 150 px stacked. A toolbar that wraps to another row takes its height
      // from here. Past that the drawing is what gives way, and it never runs into the table.
      const RW = w - 2 * M;
      const side = sideSize((RW - READ_GUTTER) / 2, clamp(RW * 0.038, 9.6, 10.6));
      g.readSide = side != null;
      g.readSize = side ?? clamp(RW * 0.038, 9.6, 10.6);
      const RH = Math.max(g.readSide ? 100 : 150, Math.min(clamp(Math.round(hh * 0.37), 160, 280), hh - 2 * M - 4 - 200));
      g.read = { x: M, y: hh - M - RH, w: RW, h: RH };
      g.dw = w - M;
      g.dh = hh - M - RH - 12;
      g.memY1 = g.dh + 4;
    } else {
      const RW = clamp(Math.round(w * 0.34), 172, 330);
      g.readSize = clamp(RW * 0.038, 9.6, 12.6);
      g.read = { x: w - M - RW, y: M, w: RW, h: hh - 2 * M };
      g.dw = Math.max(160, w - M - RW - 18);
      g.dh = hh - M;
      g.memY1 = hh;
    }
    const k = clamp(Math.min((g.dw - M) / 430, (g.dh - M) / 330), 1, 1.3);
    g.k = k;
    g.size = 10.4 * k;
    g.small = 9.4 * k;
    g.tick = 9.2 * k;
    g.capSize = 9.4 * k;
    g.axisX = M + Math.ceil(Math.max(textWidth('−0.4', g.tick), textWidth('+0.8', g.tick))) + 5;
    g.left = g.axisX + 16;
    g.right = g.dw - 4;
    g.top = M + Math.round(g.capSize + 13);
    g.bottom = g.dh - 8;
    const pxV = (g.bottom - g.top) / (VMAX - VMIN);
    g.pxV = pxV;
    const yOf = (v) => g.top + (v - VMIN) * pxV;
    g.yOf = yOf;
    // Sizes that follow the potential scale as well as the pane, so that a short pane does not lay a
    // carrier over the complex beside it.
    g.RQ = clamp(pxV * 0.03, 3.4, 5.5 * k);
    g.RC = clamp(pxV * 0.036, 4.2, 7 * k);
    g.RN = clamp(pxV * 0.036, 4.2, 6.5 * k);
    g.RA = clamp(pxV * 0.034, 4, 5.2 * k);
    g.DOT = clamp(pxV * 0.02, 2, 2.7 * k);
    g.GAP = Math.max(2, pxV * 0.012);
    g.AH = clamp(pxV * 0.04, 4.5, 8 * k);
    g.BH = clamp(g.dw * 0.034, 13, 20 * k);
    g.headR = clamp(g.BH * 0.2, 2.6, 3.6 * k);
    // The membrane's centre line: the matrix side needs room for NADH's arm, complex II, the acceptor and an
    // inhibitor's name, the intermembrane side for cytochrome c's name, set past the charges crossing beside
    // it. On a narrow stage the compartment's own name takes its short form rather than squeeze the matrix.
    const imsMin = textWidth('cytochrome ~c~', g.size, 600) + 2 * g.RC + 19 * k;
    g.sx = Math.round(clamp(g.left + 0.56 * (g.right - g.left), g.left + 96, g.right - g.BH - imsMin));
    const mL = g.sx - g.BH;
    const mR = g.sx + g.BH;
    g.mL = mL;
    g.mR = mR;
    g.xN = mL - clamp(0.42 * (mL - g.left), 34, 110 * k);
    g.W2 = clamp(0.2 * (mL - g.left), 24, 36 * k);
    g.cx = mR + g.RC - 1.5;

    const a = acc();
    const Eq = a.id === 'fumarate' ? E.mq : E.uq;
    const y = { N: yOf(E.nadh), Q: yOf(Eq), FAD: yOf(E.fad), C: yOf(E.c), O2: yOf(E.o2), NO3: yOf(E.no3), acc: yOf(a.E) };
    g.y = y;
    const play = new Set(inPlay(a));
    g.play = play;
    const idle = (s) => !play.has(s);

    // The bodies. Complex I is an L, its arm out in the matrix with NADH's site at the tip; complex II
    // stands out of the membrane on the matrix side, where the cycle is.
    const B = {};
    B.Iarm = { x0: g.xN + g.RN + 3 * k, y0: y.N - g.AH, x1: g.sx, y1: y.N + g.AH };
    B.I = { x0: mL, y0: y.N - g.AH - 3 * k, x1: mR, y1: y.Q - g.RQ - g.GAP };
    const h1 = clamp(pxV * 0.045, 6.5, 11 * k);
    const h2 = clamp(pxV * 0.13, 14, 26 * k);
    B.II = { x0: mL - g.W2, y0: y.FAD - h1, x1: mL, y1: y.FAD + h2 };
    const gap2 = Math.max(3, g.RC * 0.5);
    if (a.id === 'oxygen') {
      B.III = { x0: mL, y0: y.Q + g.RQ + g.GAP, x1: mR, y1: y.C - gap2 };
      B.IV = { x0: mL, y0: y.C + gap2, x1: mR, y1: yOf(0.87) };
    }
    if (a.id === 'nitrate') B.Nar = { x0: mL, y0: y.Q + g.RQ + g.GAP, x1: mR, y1: yOf(0.47) };
    for (const [id, r] of Object.entries(B)) {
      if (!(r.x1 - r.x0 > 2 && r.y1 - r.y0 > 2)) throw new Error(`respiratory-chain: ${id} came out ${b.num(r.x1 - r.x0, 1)} × ${b.num(r.y1 - r.y0, 1)} px in a ${w}×${hh} pane; the potential scale (${b.num(pxV, 1)} px a volt) is too short to hold it.`);
    }
    g.body = B;
    g.idleBody = { Iarm: idle('I'), I: idle('I'), II: idle('II'), III: false, IV: false, Nar: false };
    const xII = (B.II.x0 + B.II.x1) / 2;
    g.xII = xII;
    // Each complex's numeral stands at the top of its block (complex II's at the foot, below the FAD), and
    // these are their baselines.
    g.nh = g.size * 1.02 * 0.72;
    g.numY = { I: Math.max(B.Iarm.y1, B.I.y0) + g.nh + 4 * k, II: B.II.y1 - 3 * k };
    if (B.III) {
      g.numY.III = B.III.y0 + g.nh + 3 * k;
      g.numY.IV = B.IV.y0 + g.nh + 4 * k;
    }

    // Where a held pair sits.
    let out;
    if (a.id === 'oxygen') out = { x: mL - 8 * k - g.RA, y: y.O2 };
    else if (a.id === 'nitrate') out = { x: mL - 8 * k - g.RA, y: y.NO3 };
    else if (a.id === 'fumarate') out = { x: B.II.x0 - 7 * k - g.RA, y: y.FAD };
    else out = { x: g.xN, y: y.acc };
    const s = {
      src: { x: g.xN, y: y.N },
      src2: { x: xII, y: y.FAD + h2 * 0.55 },
      I: { x: g.sx, y: Math.min(B.I.y1 - g.DOT - 2.5, Math.max(lerp(y.N, B.I.y1, 0.5), g.numY.I + g.DOT + 4.5)) },
      II: { x: xII, y: y.FAD },
      Q: { x: g.sx, y: y.Q },
      out,
    };
    if (B.III) {
      s.III = { x: g.sx, y: Math.min(B.III.y1 - g.DOT - 2.5, Math.max(lerp(B.III.y0, B.III.y1, 0.7), g.numY.III + g.DOT + 4.5)) };
      s.c = { x: g.cx, y: y.C };
      s.IV = { x: g.sx, y: lerp(B.IV.y0, y.O2, 0.5) };
    }
    if (B.Nar) s.Nar = { x: g.sx, y: lerp(B.Nar.y0, y.NO3, 0.5) };
    g.seat = s;

    // The wires the pairs run along, for the route this acceptor opens.
    const W = {};
    if (a.id === 'sulfate' || a.id === 'carbon-dioxide') W['src>out'] = [s.src, s.out];
    else {
      W['src>I'] = [s.src, { x: g.sx, y: y.N }, s.I];
      W['I>Q'] = [s.I, s.Q];
      if (a.id === 'fumarate') {
        W['Q>II'] = [s.Q, { x: xII, y: y.Q }, s.II];
        W['II>out'] = [s.II, s.out];
      } else {
        W['src2>II'] = [s.src2, s.II];
        W['II>Q'] = [s.II, s.Q];
      }
      if (a.id === 'oxygen') {
        W['Q>III'] = [s.Q, s.III];
        W['III>c'] = [s.III, { x: g.sx, y: y.C }, s.c];
        W['c>IV'] = [s.c, { x: g.sx, y: y.C }, s.IV];
        W['IV>out'] = [s.IV, { x: g.sx, y: y.O2 }, s.out];
      }
      if (a.id === 'nitrate') {
        W['Q>Nar'] = [s.Q, s.Nar];
        W['Nar>out'] = [s.Nar, { x: g.sx, y: y.NO3 }, s.out];
      }
    }
    g.wires = W;
    const usedBy = (id) => (id === 'src>I' || id === 'I>Q' ? 'nadh' : (id === 'src2>II' || id === 'II>Q') ? 'fadh2' : null);
    g.hops = Object.keys(W).map((id) => ({ id, donor: usedBy(id) }));

    // Where the charges cross, with oxygen: through each moving complex, left to right, below its numeral,
    // in as many rows as the block has room for.
    g.cross = {};
    if (a.id === 'oxygen') {
      for (const st of ['I', 'III', 'IV']) {
        const r = B[st];
        const lo = g.numY[st] + g.size * 0.75;
        const hi = (st === 'IV' ? Math.min(r.y1, y.O2) - g.size * 0.15 : r.y1) - g.size * 0.45;
        let ys;
        if (hi < lo) ys = [clamp((lo + hi) / 2, r.y0 + g.size * 0.5, r.y1 - g.size * 0.3)];
        else {
          const rows = clamp(Math.floor((hi - lo) / (g.size * 1.25)) + 1, 1, CHARGES_AT[st]);
          ys = Array.from({ length: rows }, (_, i) => (rows === 1 ? (lo + hi) / 2 : lerp(lo, hi, i / (rows - 1))));
        }
        g.cross[st] = { x0: mL - 9 * k, x1: mR + 9 * k, ys };
      }
    }
    // The fall, on the axis: from the donor's rung to the acceptor's.
    g.bracket = { x: g.axisX + 8, y0: yOf(donorE(donor)), y1: y.acc };
    // The block's mark: a bar across the complex the inhibitor stops, where its pair would leave.
    const bl = block();
    g.blockBar = null;
    if (bl.at === 'I') g.blockBar = { x: g.sx, y: B.I.y1 - 4 * k, w: g.BH * 1.5 };
    else if (bl.at === 'II') g.blockBar = { x: xII, y: y.FAD + h2 * 0.3, w: g.W2 * 0.8 };
    else if (bl.at === 'III' && B.III) g.blockBar = { x: g.sx, y: B.III.y1 - 3 * k, w: g.BH * 1.5 };
    else if (bl.at === 'IV' && B.IV) g.blockBar = { x: g.sx, y: lerp(s.IV.y, y.O2, 0.5), w: g.BH * 1.5 };
    // The axis caption, trimmed to the room left of the membrane.
    const room = mL - 6 - M;
    g.caption = ['Reduction potential, V', 'Potential, V', 'E, V'].find((c) => textWidth(c, g.capSize) <= room) ?? 'V';
    // The bilayer's heads, down both faces.
    const gapH = g.headR * 2.3;
    g.heads = [];
    for (let yy = gapH / 2; yy < g.memY1; yy += gapH) g.heads.push({ x: mL, y: yy }, { x: mR, y: yy });
    return g;
  }

  // The point a fraction f of the way along a polyline, by length.
  function along(pts, f) {
    let total = 0;
    const segs = [];
    for (let i = 1; i < pts.length; i += 1) {
      const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segs.push({ a: pts[i - 1], b: pts[i], len });
      total += len;
    }
    let want = clamp(f, 0, 1) * total;
    for (const sg of segs) {
      if (want <= sg.len || sg === segs[segs.length - 1]) {
        const u = sg.len ? clamp(want / sg.len, 0, 1) : 1;
        return { x: sg.a.x + (sg.b.x - sg.a.x) * u, y: sg.a.y + (sg.b.y - sg.a.y) * u };
      }
      want -= sg.len;
    }
    return pts[0];
  }
  const lengthOf = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0);
  const dOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${b.num(p.x, 1)} ${b.num(p.y, 1)}`).join(' ');
  const toward = (a, c, r) => {
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: a.x + (dx / len) * r, y: a.y + (dy / len) * r };
  };

  // ---------------------------------------------------------------- label placement
  //
  // Every label is measured and tried at a ring of positions around its mark, near ones first and then two
  // rings further out with a leader line back; the first position whose box clears every line, mark and
  // label already placed, and stays inside the drawing, is taken. A label with a shorter form tries it
  // after the full one has failed at every size.
  function segHitsBox(a, c, r, pad) {
    const x0 = r.x0 - pad;
    const y0 = r.y0 - pad;
    const x1 = r.x1 + pad;
    const y1 = r.y1 + pad;
    let t0 = 0;
    let t1 = 1;
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const ps = [-dx, dx, -dy, dy];
    const qs = [a.x - x0, x1 - a.x, a.y - y0, y1 - a.y];
    for (let i = 0; i < 4; i += 1) {
      if (ps[i] === 0) {
        if (qs[i] < 0) return false;
      } else {
        const r2 = qs[i] / ps[i];
        if (ps[i] < 0) {
          if (r2 > t1) return false;
          if (r2 > t0) t0 = r2;
        } else {
          if (r2 < t0) return false;
          if (r2 < t1) t1 = r2;
        }
      }
    }
    return true;
  }
  const boxHit = (a, c) => a.x0 < c.x1 && a.x1 > c.x0 && a.y0 < c.y1 && a.y1 > c.y0;
  const grow = (r, p) => ({ x0: r.x0 - p, y0: r.y0 - p, x1: r.x1 + p, y1: r.y1 + p });
  const disc = (p, r) => ({ x0: p.x - r - 2, y0: p.y - r - 2, x1: p.x + r + 2, y1: p.y + r + 2 });

  function obstaclesOf(g) {
    const rects = [];
    const segs = [];
    // The membrane itself: nothing is written on it.
    rects.push({ x0: g.mL - 1, y0: -10, x1: g.mR + 1, y1: g.memY1 + 10, membrane: true });
    for (const hp of g.hops) {
      const pts = g.wires[hp.id];
      for (let i = 1; i < pts.length; i += 1) segs.push({ a: pts[i - 1], b: pts[i], pad: 2.2 });
    }
    for (const r of Object.values(g.body)) rects.push(grow(r, 1.5));
    rects.push(disc(g.seat.src, g.RN), disc(g.seat.Q, g.RQ), disc(g.seat.out, g.RA + 1));
    if (g.seat.c) rects.push(disc(g.seat.c, g.RC));
    // Where the charges pass: no label, though the gradient's signs may stand there between crossings.
    for (const cr of Object.values(g.cross)) {
      rects.push({ x0: cr.x0 - 4, y0: Math.min(...cr.ys) - g.size * 0.8, x1: cr.x1 + 4, y1: Math.max(...cr.ys) + 3, crossing: true });
    }
    // The axis, its ticks and the caption.
    rects.push({ x0: 0, y0: g.top - 8, x1: g.axisX + 1, y1: g.bottom + 5, axis: true });
    rects.push({ x0: 0, y0: 0, x1: g.M + textWidth(g.caption, g.capSize) + 3, y1: g.M + g.capSize + 4, axis: true });
    segs.push({ a: { x: g.bracket.x, y: g.bracket.y0 }, b: { x: g.bracket.x, y: g.bracket.y1 }, pad: 3 });
    if (g.blockBar) rects.push({ x0: g.blockBar.x - g.blockBar.w / 2 - 2, y0: g.blockBar.y - 3, x1: g.blockBar.x + g.blockBar.w / 2 + 2, y1: g.blockBar.y + 3 });
    return { rects, segs };
  }

  function ring(p, hw, hh, size, far) {
    const gx = hw + 4 + far;
    const gy = hh + 3.5 + far;
    const up = p.y - gy;
    const dn = p.y + gy + size * 0.76;
    const mid = p.y + size * 0.36;
    return [
      { x: p.x + gx, y: mid, anchor: 'start' },
      { x: p.x - gx, y: mid, anchor: 'end' },
      { x: p.x - hw, y: up, anchor: 'start' },
      { x: p.x + hw, y: up, anchor: 'end' },
      { x: p.x - hw, y: dn, anchor: 'start' },
      { x: p.x + hw, y: dn, anchor: 'end' },
      { x: p.x, y: up, anchor: 'middle' },
      { x: p.x, y: dn, anchor: 'middle' },
      { x: p.x, y: up, anchor: 'start' },
      { x: p.x, y: dn, anchor: 'end' },
      { x: p.x, y: up, anchor: 'end' },
      { x: p.x, y: dn, anchor: 'start' },
      { x: p.x + gx, y: up, anchor: 'start' },
      { x: p.x - gx, y: up, anchor: 'end' },
      { x: p.x + gx, y: dn, anchor: 'start' },
      { x: p.x - gx, y: dn, anchor: 'end' },
    ].map((c) => ({ ...c, far }));
  }

  const LEGEND_PAIR = 'a pair of electrons';
  const LEGEND_CHARGE = 'a charge carried across';
  function legendSize(g, sz) {
    const w1 = g.DOT * 5.4 + 6 + textWidth(LEGEND_PAIR, sz);
    const w2 = textWidth('+', sz, 700) + 6 + textWidth(LEGEND_CHARGE, sz);
    const lines = g.cross.I ? 2 : 1;
    return { w: Math.max(w1, lines > 1 ? w2 : 0), h: sz * 1.05 + (lines - 1) * sz * 1.45, lines };
  }

  function placeLabels(g) {
    const { rects, segs } = obstaclesOf(g);
    const placed = [];
    const bounds = { x0: g.M, y0: g.M, x1: g.dw - 1, y1: g.dh - 1 };
    const a = acc();
    const s = g.seat;
    const B = g.body;
    const items = [];
    const add = (key, alts, mark, hw, hh, opts = {}) => {
      items.push({ key, alts: [].concat(alts), mark, hw, hh, cls: 'rc-name', size: g.size, weight: 600, prefer: null, cands: null, optional: false, ...opts });
    };
    add('nadh', 'NADH', s.src, g.RN, g.RN, { prefer: 'up' });
    const noO2 = a.id === 'oxygen' && !oxygenOn;
    add('acc', noO2 ? `no ${a.mark}` : [a.label, a.short], s.out, g.RA + 1, g.RA + 1, { cls: noO2 ? 'rc-block' : 'rc-name', prefer: 'left' });
    const soft = (st) => (g.play.has(st) ? {} : { cls: 'rc-soft', weight: 500 });
    add('q', a.id === 'fumarate' ? 'menaquinone' : 'ubiquinone', s.Q, g.BH, g.RQ, { prefer: 'right', ...soft('Q') });
    if (s.c) add('c', 'cytochrome ~c~', s.c, g.RC, g.RC, { prefer: 'right' });
    const IIbox = { x: g.xII, y: (B.II.y0 + B.II.y1) / 2 };
    if (a.id === 'fumarate') add('frd', ['fumarate reductase', 'reductase'], IIbox, g.W2 / 2, (B.II.y1 - B.II.y0) / 2, { cls: 'rc-soft', weight: 500, size: g.small, prefer: 'down', optional: true });
    else add('fadh2', 'FADH_{2}', IIbox, g.W2 / 2, (B.II.y1 - B.II.y0) / 2, { prefer: 'left', ...soft('II') });
    if (B.Nar) add('nar', ['nitrate reductase', 'reductase'], { x: g.sx, y: (B.Nar.y0 + B.Nar.y1) / 2 }, g.BH, (B.Nar.y1 - B.Nar.y0) / 2, { cls: 'rc-soft', weight: 500, size: g.small, prefer: 'right' });
    // How many charges each complex moves, on the side they arrive at and nowhere else, and level with the
    // complex's own block: beside the next complex down it would be read as that one's count, so where
    // the block is too short to hold it clear of its neighbours' labels it is left out.
    for (const st of Object.keys(g.cross)) {
      const cr = g.cross[st];
      const my = (Math.min(...cr.ys) + Math.max(...cr.ys)) / 2;
      add(`n${st}`, `+${CHARGES_AT[st]}`, { x: g.sx, y: my }, cr.x1 - g.sx + 3, 4, {
        cls: 'rc-charge', optional: true,
        cands: (out, sz) => [0, -0.5, 0.5, -1, 1, -1.5, 1.5, -2, 2]
          .map((j) => my + j * sz * 1.1)
          .filter((cy) => cy >= B[st].y0 + 1 && cy <= B[st].y1 - 1)
          .map((cy) => ({ x: cr.x1 + 7, y: cy + sz * 0.36, anchor: 'start', far: 0 })),
      });
    }
    if (g.blockBar) {
      const bl = block();
      const bar = g.blockBar;
      const hw = bl.at === 'II' ? bar.w / 2 : g.BH;
      // Level with the bar, or a row or two off it when that row is taken, on the side with room first:
      // the intermembrane side for complex I (complex II stands on its matrix side), the matrix side for
      // III and IV, and complex II's own outer side. Then the ring, with a leader.
      const rows = (x, anchor, sz) => [0, 0.5, -0.5, 1, -1, 1.5, -1.5, 2, -2].map((j) => ({ x, y: bar.y + sz * 0.36 + j * sz * 1.15, anchor, far: 0 }));
      const right = (sz) => rows(g.mR + 9 * g.k + 7, 'start', sz);
      const left = (sz) => rows(g.mL - 9 * g.k - 7, 'end', sz);
      add('block', bl.by, { x: bar.x, y: bar.y }, hw, 3, {
        cls: 'rc-block',
        cands: (out, sz) => {
          let near;
          if (bl.at === 'II') near = [...rows(B.II.x0 - 5, 'end', sz), ...(a.id === 'fumarate' ? rows(s.out.x - g.RA - 6, 'end', sz) : [])];
          else if (bl.at === 'I') near = [...right(sz), ...left(sz)];
          else near = [...left(sz), ...right(sz)];
          return [...near, ...[0, 13, 26].flatMap((far) => ring({ x: bar.x, y: bar.y }, hw, 3, sz, far))];
        },
      });
    }
    const mid = { x: g.bracket.x, y: (g.bracket.y0 + g.bracket.y1) / 2 };
    const fall = fallOf(donor, a);
    const bhh = Math.max(6, Math.abs(g.bracket.y1 - g.bracket.y0) / 2 - 4);
    add('bracket', `${fall < 0 ? '−' : ''}${b.num(Math.abs(fall), 2)}${NB}V`, mid, 2, bhh, {
      cls: 'rc-axisval', size: g.small,
      // Beside the bracket, at its middle or wherever along it is free, then around it.
      cands: (out, sz) => [
        ...[0.5, 0.38, 0.62, 0.26, 0.74, 0.14, 0.86].map((f) => ({ x: g.bracket.x + 6, y: lerp(g.bracket.y0, g.bracket.y1, f) + sz * 0.36, anchor: 'start', far: 0 })),
        ...[0, 13, 26].flatMap((far) => ring(mid, 2, bhh, sz, far)),
      ],
    });
    add('bracketSub', `${si(kjOf(fall))}${NB}kJ/mol`, mid, 2, 6, {
      cls: 'rc-cap', size: g.small * 0.96, weight: 400, optional: true,
      // Under the fall's label, or over it: far enough that the two boxes clear the placer's 2 px margin.
      cands: (out, sz) => (out.bracket ? [
        { x: out.bracket.box.x0 + 1.5, y: out.bracket.box.y1 + sz * 0.92 + 3, anchor: 'start', far: 0 },
        { x: out.bracket.box.x0 + 1.5, y: out.bracket.box.y0 - sz * 0.34 - 3, anchor: 'start', far: 0 },
      ] : []),
    });
    // The two compartments, named where there is room.
    add('matrix', 'matrix', s.src, 2, 2, {
      cls: 'rc-region', weight: 400, size: g.small, optional: true, padX: 14,
      cands: () => [
        ...[0.5, 0.62, 0.36, 0.72, 0.2].map((v) => ({ x: g.mL - 9 * g.k - 10, y: g.yOf(v), anchor: 'end', far: 0 })),
        ...[0.5, 0.36, 0.62, 0.2, 0.72, 0.1].flatMap((v) => [0.12, 0.3, 0.02].map((f) => ({ x: g.left + f * (g.mL - g.left), y: g.yOf(v), anchor: 'start', far: 0 }))),
      ],
    });
    add('ims', ['intermembrane space', 'intermembrane'], s.Q, 2, 2, {
      cls: 'rc-region', weight: 400, size: g.small, optional: true, padX: 14,
      cands: () => [-0.36, -0.28, -0.2, 0.62, 0.7, 0.5].flatMap((v) => [{ x: g.right - 2, y: g.yOf(v), anchor: 'end', far: 0 }, { x: g.mR + 10, y: g.yOf(v), anchor: 'start', far: 0 }]),
    });
    // The key to the dots and the crossing charges, in whichever corner is free.
    add('legend', 'legend', s.src, 0, 0, {
      cls: 'rc-cap', size: g.small, weight: 400, optional: true,
      width: (sz) => legendSize(g, sz).w,
      boxAt: (c, w, sz) => ({ x0: c.x - 1.5, y0: c.y - 1.5, x1: c.x + w + 1.5, y1: c.y + legendSize(g, sz).h + 1.5 }),
      cands: (out, sz, w) => {
        const hgt = legendSize(g, sz).h;
        return [
          { x: g.right - w, y: g.bottom - hgt },
          { x: g.mR + 10, y: g.bottom - hgt },
          { x: g.left + 2, y: g.bottom - hgt },
          { x: g.right - w, y: g.top },
          { x: g.left + 2, y: g.yOf(0.5) },
          { x: g.right - w, y: g.yOf(0.45) },
        ].map((c) => ({ ...c, anchor: 'start', far: 0 }));
      },
    });

    const out = {};
    const boxOf = (c, w, sz) => {
      const x0 = c.anchor === 'end' ? c.x - w : c.anchor === 'middle' ? c.x - w / 2 : c.x;
      return { x0: x0 - 1.5, y0: c.y - sz * 0.92, x1: x0 + w + 1.5, y1: c.y + sz * 0.34 };
    };
    // Every label the drawing needs before any it can do without, so an optional one never takes the only
    // place a needed one had.
    for (const it of [...items.filter((i) => !i.optional), ...items.filter((i) => i.optional)]) {
      let chosen = null;
      let first = null;
      search:
      for (const src of it.alts) {
        for (const shrink of [1, 0.92, 0.85]) {
          const sz = it.size * shrink;
          const w = it.width ? it.width(sz) : textWidth(src, sz, it.weight);
          let cands = it.cands ? it.cands(out, sz, w) : [0, 13, 26].flatMap((far) => ring(it.mark, it.hw, it.hh, sz, far));
          const near = (c) => !c.far;
          if (it.prefer === 'up') cands = [...cands.filter((c) => c.y < it.mark.y && near(c)), ...cands];
          if (it.prefer === 'down') cands = [...cands.filter((c) => c.y > it.mark.y && near(c)), ...cands];
          if (it.prefer === 'right') cands = [...cands.filter((c) => c.anchor === 'start' && Math.abs(c.y - it.mark.y) < sz && near(c)), ...cands];
          if (it.prefer === 'left') cands = [...cands.filter((c) => c.anchor === 'end' && Math.abs(c.y - it.mark.y) < sz && near(c)), ...cands];
          for (const c of cands) {
            const box = it.boxAt ? it.boxAt(c, w, sz) : boxOf(c, w, sz);
            if (!first) first = { ...c, src, size: sz, box, leader: null, collided: true };
            if (box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.y0 < bounds.y0 || box.y1 > bounds.y1) continue;
            const px = it.padX ?? 6;
            const clear = { x0: box.x0 - px, y0: box.y0 - 2, x1: box.x1 + px, y1: box.y1 + 2 };
            if (rects.some((r) => boxHit(box, r)) || placed.some((r) => boxHit(clear, r))) continue;
            if (segs.some((sg) => segHitsBox(sg.a, sg.b, box, sg.pad))) continue;
            let leader = null;
            if (c.far) {
              const tx = clamp(it.mark.x, box.x0, box.x1);
              const ty = clamp(it.mark.y, box.y0, box.y1);
              const from = { x: clamp(tx, it.mark.x - it.hw, it.mark.x + it.hw), y: clamp(ty, it.mark.y - it.hh, it.mark.y + it.hh) };
              leader = { a: from, b: { x: tx, y: ty } };
              const hitsLabel = placed.some((r) => segHitsBox(leader.a, leader.b, r, 1));
              const hitsMark = rects.some((r) => segHitsBox(leader.a, leader.b, r, -1) && !(r.x0 <= it.mark.x && r.x1 >= it.mark.x && r.y0 <= it.mark.y && r.y1 >= it.mark.y));
              if (hitsLabel || hitsMark) continue;
            }
            chosen = { ...c, src, size: sz, box, leader };
            break search;
          }
        }
      }
      if (!chosen && (it.optional || !first)) continue;
      if (!chosen) chosen = first;
      placed.push(chosen.box);
      if (chosen.leader) segs.push({ a: chosen.leader.a, b: chosen.leader.b, pad: 1.5 });
      out[it.key] = { ...it, ...chosen };
    }
    g.labels = out;
    g.collisions = Object.values(out).filter((l) => l.collided).map((l) => l.key);
    // The gradient's signs, down both faces of the membrane, wherever nothing else stands.
    // A charge crossing passes over them, with its halo, and that is the one thing allowed to.
    const keep = (p) => !Object.values(g.body).some((r) => boxHit(grow(r, 3), { x0: p.x - 4, y0: p.y - 6, x1: p.x + 4, y1: p.y + 3 }))
      && !placed.some((r) => boxHit(r, { x0: p.x - 6, y0: p.y - 8, x1: p.x + 6, y1: p.y + 7 }))
      && !rects.some((r) => !r.crossing && !r.membrane && boxHit(r, { x0: p.x - 3, y0: p.y - 5, x1: p.x + 3, y1: p.y + 2 }))
      && !segs.some((sg) => segHitsBox(sg.a, sg.b, { x0: p.x - 4, y0: p.y - 5, x1: p.x + 4, y1: p.y + 3 }, 1))
      && p.y > g.top && p.y < g.bottom;
    const gap = 24 * g.k;
    g.signs = [];
    for (let yy = g.top + gap / 2; yy < g.bottom; yy += gap) {
      const plus = { x: g.mR + 7 * g.k, y: yy, sign: '+' };
      const minus = { x: g.mL - 7 * g.k, y: yy, sign: '−' };
      if (keep(plus)) g.signs.push(plus);
      if (keep(minus)) g.signs.push(minus);
    }
  }

  // ---------------------------------------------------------------- drawing

  function richLabel(x, y, src, { size, anchor = 'start', cls = null, weight = null, fill = null, halo = 2.6, opacity = null } = {}) {
    const t = pane.text(x, y, '', {
      anchor,
      class: cls ?? undefined,
      'font-size': b.num(size, 2),
      'font-weight': weight ?? undefined,
      style: fill ? `fill:${fill}` : undefined,
      opacity: opacity === null ? undefined : b.num(opacity, 3),
      ...(halo ? { stroke: C.paper, 'stroke-width': `${halo}px`, 'stroke-linejoin': 'round', 'paint-order': 'stroke' } : {}),
    });
    return fillRuns(t, src, size);
  }

  function arrowHead(tip, from, size, cls) {
    const dx = tip.x - from.x;
    const dy = tip.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const bx = tip.x - ux * size;
    const by = tip.y - uy * size;
    pane.path(`M${b.num(bx - uy * size * 0.55, 1)} ${b.num(by + ux * size * 0.55, 1)} L${b.num(tip.x, 1)} ${b.num(tip.y, 1)} L${b.num(bx + uy * size * 0.55, 1)} ${b.num(by - ux * size * 0.55, 1)}`, { class: cls, fill: 'none' });
  }

  function electron(g, x, y, opacity = null) {
    pane.circle(x, y, g.DOT, { fill: C.ink, stroke: C.paper, 'stroke-width': 1.2, ...(opacity === null ? {} : { opacity: b.num(opacity, 3) }) });
  }
  // A pair held in a complex, on a paper socket so that it reads against the complex's fill.
  function pairAt(g, p) {
    const pw = g.DOT * 4.4 + 4;
    const ph = g.DOT * 2 + 4;
    pane.rect(p.x - pw / 2, p.y - ph / 2, pw, ph, { rx: b.num(ph / 2, 2), fill: C.paper });
    electron(g, p.x - g.DOT * 1.2, p.y);
    electron(g, p.x + g.DOT * 1.2, p.y);
  }

  function drawAxes(g) {
    for (const v of TICKS) {
      const y = g.yOf(v);
      pane.line(g.axisX + 3, y, g.right, y, { class: 'rc-grid' });
      const label = v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;
      pane.text(g.axisX - 4, y + g.tick * 0.35, label, { anchor: 'end', class: 'rc-tick', 'font-size': b.num(g.tick, 1) });
    }
    pane.line(g.axisX, g.top - 4, g.axisX, g.bottom + 2, { class: 'rc-spine' });
    pane.text(g.M, g.M + g.capSize + 1, g.caption, { class: 'rc-tick', 'font-size': b.num(g.capSize, 1) });
    const { x, y0, y1 } = g.bracket;
    const attrs = y1 > y0 + 0.5 ? { stroke: C.ink, 'stroke-width': 1.1 } : { stroke: C.coralText, 'stroke-width': 1.1, 'stroke-dasharray': '2.5 2' };
    pane.line(x, y0, x, y1, attrs);
    pane.line(x - 3, y0, x + 3, y0, attrs);
    pane.line(x - 3, y1, x + 3, y1, attrs);
  }

  function drawMembrane(g) {
    pane.rect(g.mL, 0, g.mR - g.mL, g.memY1, { fill: TAIL_FILL });
    for (const p of g.heads) pane.circle(p.x, p.y, g.headR, { fill: HEAD_FILL });
  }

  function drawSigns(g, level) {
    if (level < 0.02) return;
    for (const p of g.signs) {
      pane.text(p.x, p.y + g.small * 0.34, p.sign, {
        anchor: 'middle', 'font-size': b.num(g.small * 1.05, 1), 'font-weight': 700,
        style: `fill:${p.sign === '+' ? C.leafText : C.waterText}`, opacity: level >= 0.999 ? undefined : b.num(level, 3),
      });
    }
  }

  function drawWires(g) {
    for (const hp of g.hops) {
      const pts = g.wires[hp.id];
      const off = hp.donor && hp.donor !== donor;
      const cls = `rc-path${off ? ' is-off' : ''}`;
      pane.path(dOf(pts), { class: cls });
      // A chevron at the middle of the longest run says which way the pairs go.
      let best = null;
      for (let i = 1; i < pts.length; i += 1) {
        const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (!best || len > best.len) best = { a: pts[i - 1], c: pts[i], len };
      }
      if (best && best.len > 34) {
        const m = { x: (best.a.x + best.c.x) / 2, y: (best.a.y + best.c.y) / 2 };
        arrowHead(toward(m, best.c, 3), toward(m, best.a, 3), 4.6, cls);
      }
    }
  }

  function drawBodies(g) {
    const B = g.body;
    const k = g.k;
    const box = (r, attrs) => pane.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, { rx: b.num(Math.min(4 * k, (r.x1 - r.x0) / 3, (r.y1 - r.y0) / 3), 1), ...attrs });
    const numeral = (x, y, str, part, idle) => pane.text(x, y, str, {
      anchor: 'middle', 'font-size': b.num(g.size * 1.02, 1), 'font-weight': 700,
      ...(idle ? { class: 'rc-idle-num' } : { style: `fill:${part.symbolColor}` }),
    });
    const fillOf = (part, idle) => (idle ? { class: 'rc-idle' } : { fill: part.color });
    // Complex I: the arm first, so the block covers its root.
    const idleI = g.idleBody.I;
    box(B.Iarm, fillOf(PUMP, idleI));
    box(B.I, fillOf(PUMP, idleI));
    numeral(g.sx, g.numY.I, 'I', PUMP, idleI);
    // Complex II, with the cycle's FAD as a rung across it.
    const idleII = g.idleBody.II;
    box(B.II, fillOf(ENZ, idleII));
    pane.line(B.II.x0 + 2, g.y.FAD, B.II.x1 - 2, g.y.FAD, { stroke: idleII ? C.ruleStrong : ENZ.symbolColor, 'stroke-width': 1.4 });
    if (acc().id !== 'fumarate') numeral(g.xII, g.numY.II, 'II', ENZ, idleII);
    if (B.III) {
      box(B.III, fillOf(PUMP, false));
      numeral(g.sx, g.numY.III, 'III', PUMP, false);
      box(B.IV, fillOf(PUMP, false));
      numeral(g.sx, g.numY.IV, 'IV', PUMP, false);
    }
    if (B.Nar) box(B.Nar, fillOf(ENZ, false));
  }

  function drawCarriers(g, t) {
    const a = acc();
    const s = g.seat;
    // NADH, the donor, and the mobile carriers: pale when oxidised, full when they hold a pair.
    pane.circle(s.src.x, s.src.y, g.RN, { fill: LOADED, stroke: C.ink, 'stroke-width': 0.8 });
    if (g.play.has('Q')) pane.circle(s.Q.x, s.Q.y, g.RQ, { fill: shown('Q', t) > 0 ? LOADED : CARRIER, stroke: C.ink, 'stroke-width': 0.8 });
    else pane.circle(s.Q.x, s.Q.y, g.RQ, { class: 'rc-idle' });
    if (s.c) pane.circle(s.c.x, s.c.y, g.RC, { fill: shown('c', t) > 0 ? LOADED : CARRIER, stroke: C.ink, 'stroke-width': 0.8 });
    // The acceptor.
    const noO2 = a.id === 'oxygen' && !oxygenOn;
    pane.circle(s.out.x, s.out.y, g.RA, noO2
      ? { fill: C.paper, stroke: C.coralText, 'stroke-width': 1.2, 'stroke-dasharray': '2 1.8' }
      : { fill: C.paper, stroke: C.ink, 'stroke-width': 1.2 });
    if (g.blockBar) {
      const { x, y, w } = g.blockBar;
      pane.line(x - w / 2, y, x + w / 2, y, { stroke: C.coralText, 'stroke-width': 3, 'stroke-linecap': 'round' });
    }
  }

  function drawLegend(g, l) {
    const sz = l.size;
    const { lines } = legendSize(g, sz);
    const y1 = l.y + sz * 0.92;
    electron(g, l.x + g.DOT, y1 - sz * 0.33);
    electron(g, l.x + g.DOT * 3.4, y1 - sz * 0.33);
    pane.text(l.x + g.DOT * 5.4 + 6, y1, LEGEND_PAIR, { class: 'rc-cap', 'font-size': b.num(sz, 1) });
    if (lines > 1) {
      const y2 = y1 + sz * 1.45;
      pane.text(l.x, y2, '+', { class: 'rc-charge', 'font-size': b.num(sz, 1) });
      pane.text(l.x + textWidth('+', sz, 700) + 6, y2, LEGEND_CHARGE, { class: 'rc-cap', 'font-size': b.num(sz, 1) });
    }
  }

  function drawLabels(g) {
    for (const l of Object.values(g.labels)) {
      if (l.key === 'legend') {
        drawLegend(g, l);
        continue;
      }
      if (l.leader) pane.line(l.leader.a.x, l.leader.a.y, l.leader.b.x, l.leader.b.y, { class: 'rc-leader' });
      richLabel(l.x, l.y, l.src, { size: l.size, anchor: l.anchor, cls: l.cls, weight: l.weight });
    }
  }

  function drawDynamic(g, t) {
    const s = g.seat;
    // Pairs at rest in the complexes. Ubiquinone and cytochrome c show theirs by colour, as NADH does.
    for (const st of ['I', 'II', 'Nar', 'III', 'IV']) if (s[st] && shown(st, t) > 0) pairAt(g, s[st]);
    if (instant()) return;
    // Pairs on the move.
    for (const m of moves) {
      if (!(t >= m.t0 && t < m.t1) || m.t1 <= m.t0) continue;
      const pts = g.wires[`${m.from}>${m.to}`];
      if (!pts) throw new Error(`respiratory-chain: no wire from ${m.from} to ${m.to} under ${acc().id}.`);
      const f = ease((t - m.t0) / (m.t1 - m.t0));
      const lag = (g.DOT * 2.6) / Math.max(1, lengthOf(pts));
      const appear = m.from === 'src2' ? clamp(((t - m.t0) / Math.max(0.01, m.t1 - m.t0)) * 2, 0, 1) : null;
      const p1 = along(pts, f);
      const p2 = along(pts, Math.max(0, f - lag));
      electron(g, p1.x, p1.y, appear);
      electron(g, p2.x, p2.y, appear);
    }
    // Charges crossing, and the product appearing.
    for (const f of fx) {
      if (f.kind === 'charges') {
        const cr = g.cross[f.station];
        if (!cr) continue;
        for (let i = 0; i < f.n; i += 1) {
          const p = (t - f.at - i * STAGGER) / T_CHARGE;
          if (p < 0 || p > 1.75) continue;
          const u = ease(clamp(p, 0, 1));
          const fade = p <= 1 ? 1 : 1 - (p - 1) / 0.75;
          pane.text(lerp(cr.x0, cr.x1, u), cr.ys[i % cr.ys.length] + g.size * 0.36, '+', {
            anchor: 'middle', class: 'rc-charge', 'font-size': b.num(g.size * 1.15, 1), opacity: b.num(fade, 3),
            stroke: C.paper, 'stroke-width': '2.4px', 'stroke-linejoin': 'round', 'paint-order': 'stroke',
          });
        }
      } else if (f.kind === 'product') {
        const p = (t - f.at) / T_FX;
        if (p < 0 || p >= 1) continue;
        const a = acc();
        richLabel(s.out.x, s.out.y + g.RA + g.size * 1.1 + 4 * ease(p), a.product, { size: g.small, anchor: 'middle', weight: 600, fill: C.waterText, opacity: 1 - p * p });
      }
    }
  }

  // ---------------------------------------------------------------- the readout
  //
  // Two tables: what one pair releases and moves, per donor, and what the membrane holds, with the sentence
  // on the state under them. Beside the drawing they stack; under it, on a phone, they stand side by side
  // with the sentence across both when their rows fit (frame() decides), so that the drawing keeps its
  // height. Level 0 is the fullest; each level after gives up the row the stage already shows, and the ATP
  // row and the sentence are never given up.
  function drawReadout(g, t) {
    const R = g.read;
    const a = acc();
    // The table's type grows with its column (frame() chose it), and its rows spread to fill the column's
    // height.
    const size = g.readSize;
    const level = gradShown(t);
    const col = (dn) => {
      const fall = fallOf(dn, a);
      return { fall: sv(fall).replace('+', ''), kj: si(kjOf(fall)), n: String(chargesFor(dn, a)), pairs: String(pairs[dn]) };
    };
    const cn = col('nadh');
    const cf = col('fadh2');
    const build1 = (r, lv) => {
      if (lv < 1) r.row(ROW.fall, [cn.fall, cf.fall]);
      r.row(ROW.kj, [cn.kj, cf.kj]);
      r.row(a.id === 'oxygen' ? ROW.moved : ROW.most, [cn.n, cf.n]);
      if (lv < 2) r.row(ROW.pairs, [cn.pairs, cf.pairs]);
    };
    const entry = entryOf(donor);
    const jammed = Boolean(crossoverAt()) || refused === 'backed-up' || entry === 'no-fall' || entry === 'uphill' || (donor === 'fadh2' && block().at === 'II') || (a.id === 'oxygen' && !oxygenOn);
    const build2 = (r, lv) => {
      if (a.id === 'oxygen' && lv < 2) r.row(ROW.all, String(chargesShown(t)));
      r.row(ROW.ph, `${(PH_DIFF * level).toFixed(2)} units`);
      r.row(ROW.psi, `${Math.round(PSI_MV * level)} mV`);
      r.sum(ROW.atp, '0');
    };
    const build3 = (r, lv) => {
      r.note(status(lv >= 3), jammed ? { accent: C.coralText } : {});
      if (lv < 1 && a.id !== 'oxygen') r.note(SAME_KIND);
    };
    const base = { size, titleSize: size * 0.88, headSize: size * 0.86, minRow: 13, maxRow: 32 };
    const side = g.readSide;
    const gutter = READ_GUTTER;
    const cw = side ? (R.w - gutter) / 2 : R.w;
    // The first table's title names the acceptor, by its formula when the word would run past the column.
    const title1 = [`Per pair, to ${a.word}`, `Per pair, to ${a.plain}`].find((str) => capsWidth(str, base.titleSize) <= cw - 6) ?? `To ${a.plain}`;
    const gap = 10;
    const LEVELS = 4;
    // The sentence keeps a reading leading however far the table rows spread.
    const NOTE_ROW = 13;
    // The three readouts at given tops: the two tables beside each other or stacked, the sentence last.
    const make = (lv, y1, y2, y3) => {
      // Stacked, the tersest level gives up the second title; side by side it costs no height.
      const title2 = side || lv < 3 ? 'Across the membrane' : null;
      const r1 = pane.readout({ ...base, x: R.x, width: cw, y: y1, title: title1, columns: ['NADH', 'FADH₂'] });
      build1(r1, lv);
      const r2 = pane.readout({ ...base, x: side ? R.x + cw + gutter : R.x, width: cw, y: side ? y1 : y2, title: title2 });
      build2(r2, lv);
      const r3 = pane.readout({ ...base, x: R.x, width: R.w, y: y3 });
      build3(r3, lv);
      return { r1, r2, r3 };
    };
    const tables = (m, rowH) => (side ? Math.max(m.r1.height(rowH), m.r2.height(rowH)) : m.r1.height(rowH) + gap + m.r2.height(rowH));
    const need = (m, rowH) => tables(m, rowH) + gap + m.r3.height(NOTE_ROW);
    for (let lv = 0; lv < LEVELS; lv += 1) {
      const m = make(lv, R.y, R.y, R.y);
      if (lv < LEVELS - 1 && need(m, base.minRow) > R.h) continue;
      let lo = base.minRow;
      let hi = base.maxRow;
      for (let i = 0; i < 30; i += 1) {
        const mid = (lo + hi) / 2;
        if (need(m, mid) <= R.h) lo = mid;
        else hi = mid;
      }
      const y2 = R.y + m.r1.height(lo) + gap;
      const y3 = R.y + tables(m, lo) + gap;
      const d = make(lv, R.y, y2, y3);
      // Side by side, the two tables share their top and bottom rules: the shorter spreads its rows to
      // the taller's height. A table's height is its fixed part plus its row count times the row height.
      const H = tables(m, lo);
      const spread = (r) => {
        const fixed = r.height(0);
        const n = r.height(1) - fixed;
        return side && n > 0 ? (H - fixed) / n : lo;
      };
      d.r1.draw(spread(d.r1), R.h);
      d.r2.draw(spread(d.r2), side ? R.h : R.y + R.h - y2);
      d.r3.draw(NOTE_ROW, R.y + R.h - y3);
      return lv;
    }
    return LEVELS - 1;
  }

  // ---------------------------------------------------------------- drawing

  function drawAll() {
    const { w, h: hh } = pane.clear().box;
    const g = geometry(w, hh);
    // In the lab, and once the book's face has arrived, a label that nothing clears is a defect in this
    // file, and the gates that drive the lab should say so.
    if (g.collisions.length && fontsKey() === 'loaded' && typeof location !== 'undefined' && location.pathname.includes('/lab/')) {
      throw new Error(`respiratory-chain: at a ${w}×${hh} pane (${g.portrait ? 'portrait' : 'landscape'}, acceptor ${acc().id}, block ${block().at ?? 'none'}, donor ${donor}) no position clears the label(s) ${g.collisions.join(', ')}; every candidate overlaps a line, a mark or another label.`);
    }
    const t = now();
    drawAxes(g);
    drawMembrane(g);
    drawSigns(g, gradShown(t));
    drawWires(g);
    drawBodies(g);
    drawCarriers(g, t);
    drawLabels(g);
    drawDynamic(g, t);
    drawReadout(g, t);
    pane.focusMark();
  }

  function draw() {
    b.redraw();
  }
  b.onDraw(() => drawAll());

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   donor               'nadh' | 'fadh2', the donor the next pair comes from
  //   pairsDelivered      pairs that entered since the last reset or change of acceptor, both donors;
  //                       pairsByDonor splits it. A refused pair is not counted
  //   chargesMoved        with oxygen, charges moved across the membrane since then: 4 as a pair leaves
  //                       complex I, 2 as it leaves III, 4 as it leaves IV. null under any other acceptor,
  //                       where the stage shows a ceiling and counts nothing
  //   chargesPerPair      10 from NADH and 6 from FADH₂ with oxygen; otherwise the ceiling, the fall's
  //                       kJ/mol ÷ 19.3 rounded down: 7, 3, 0 and 0 from NADH, 3 from FADH₂ to nitrate,
  //                       and 0 where FADH₂ has no fall or an uphill one
  //   chargesAreCeiling   false with oxygen, true for the other four acceptors
  //   potentialDropV      the acceptor's potential minus the donor's, for the chosen donor: 1.14 and 0.79
  //                       with oxygen; negative where the acceptor sits above FADH₂ (uphill)
  //   energyReleasedKj    2 × 96.5 × potentialDropV, rounded: 220, 143, 68, 19, 15 from NADH; 152 from FADH₂
  //   atpMadeHere         0 in every reachable state. Anything else is a defect, not a setting
  //   gradientPH, gradientMv   0.75 and 150 once a pair has gone through a route that moves a charge, while
  //                       the chosen donor's route stays open; 0 and 0 otherwise. Where the stage is heading:
  //                       the drawing eases to it over 1.6 s
  //   oxygenPresent       true only with oxygen as the acceptor and the Oxygen control on
  //   acceptor            'oxygen' | 'nitrate' | 'fumarate' | 'sulfate' | 'carbon-dioxide'
  //   acceptorPotentialV  +0.82, +0.42, +0.03, −0.22, −0.24
  //   quinone             'ubiquinone', or 'menaquinone' under fumarate
  //   blockedAt, blockedBy  'I' | 'II' | 'III' | 'IV' | null, and the inhibitor as the prose spells it
  //   reducedCarriers     the stations in play holding a pair, in chain order, computed from the model
  //   oxidisedCarriers    the stations in play holding none
  //   crossoverAt         the most downstream station holding a pair, which is the blocked one; 'II' when
  //                       malonate has refused the cycle's FADH₂; null while the chain runs
  //   refused             why the last Deliver did nothing: 'blocked-entry' | 'backed-up' | 'no-fall' |
  //                       'uphill', or null
  //   t, playing          the clock in seconds, three decimals, and whether it is running
  // Reset returns to the opening state: NADH, oxygen present, nothing blocked, nothing delivered.
  return b.handle();
}
