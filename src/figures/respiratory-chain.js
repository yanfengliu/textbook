// Figure 7.3, `respiratory-chain`: the fall, in four steps.
//
// The inner mitochondrial membrane drawn edge-on as a staircase beside a vertical axis of reduction
// potential, so the drawing is also the graph: every carrier sits at the height its own potential puts it
// at, each complex stands in one riser of the stair, and a pair of electrons is seen falling from rung to
// rung. The matrix is below and to the left of the stair, the intermembrane space above and to the right,
// so the charges a complex moves cross its riser from left to right. The reader delivers pairs from NADH
// (at complex I) or from the Krebs cycle's FADH₂ (at complex II, which is the cycle's own enzyme), blocks a
// complex with its inhibitor, takes the oxygen away, or moves the bottom rung to another acceptor — and the
// row for ATP made here stays at 0 through all of it, because the chain makes none.
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
//     machinery, not any one organism's chain (§7.7). Nitrate reductase hangs from the quinone's rung, and
//     complex II runs backwards as fumarate reductase, because those are the parts that do it in E. coli.
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
//   - Changing the acceptor starts a fresh experiment: the flow and the counters clear.
//
// CHANGES FROM THE BRIEF (FIGURES.md, as first written), each for the review of 2026-09-24:
//   - protonsPumped is chargesMoved, with chargesPerPair and chargesAreCeiling beside it, because §7.4 now
//     prices the gradient in charges (4, 2 and 4) and not in protons released (4, 4 and 2).
//   - Nitrate 8 → at most 7, fumarate 4 → at most 3 (finding 9).
//   - The gradient reads 0 until a pair has passed, rather than opening charged.
//   - The stage is 16 / 10, not 21 / 9, and the membrane is a staircase rather than a flat band: a flat band
//     cannot put every carrier at its own potential, which is what the brief asks the drawing to do.
//
// TWO COMPOSITIONS, chosen by the pane's shape rather than by a flag: landscape (16 / 10) with the readout
// in a column at the right; portrait (below 800 px, 2 / 3) with the stair in the upper part and the readout
// under it, where the same stair at the same potentials stands in a narrower frame. The toolbar's short
// labels come in below a 600 px stage. Every label is measured and placed against every mark, line and
// label already placed, as in zscheme; in the lab a label nothing clears is thrown as a defect.
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

// In the stepper's order, which is the order of yield: §7.7's table, top to bottom.
const ACCEPTORS = Object.freeze([
  { id: 'oxygen', E: 0.82, mark: 'O_{2}', label: 'O_{2} → H_{2}O', plain: 'O₂', word: 'oxygen', product: 'H_{2}O' },
  { id: 'nitrate', E: 0.42, mark: 'NO_{3}^{−}', label: 'NO_{3}^{−} → NO_{2}^{−}', plain: 'NO₃⁻', word: 'nitrate', product: 'NO_{2}^{−}' },
  { id: 'fumarate', E: 0.03, mark: 'fumarate', label: 'fumarate → succinate', plain: 'fumarate', word: 'fumarate', product: 'succinate' },
  { id: 'sulfate', E: -0.22, mark: 'SO_{4}^{2−}', label: 'SO_{4}^{2−}', plain: 'SO₄²⁻', word: 'sulfate', product: null },
  { id: 'carbon-dioxide', E: -0.24, mark: 'CO_{2}', label: 'CO_{2}', plain: 'CO₂', word: 'carbon dioxide', product: null },
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
const STAGGER = 0.08;
const T_FX = 1.0;
const T_GRAD = 1.6;
const ease = (f) => f * f * (3 - 2 * f);

// No-break spaces: a sentence must not break inside "complex III", "0.82 V" or "19.3 kJ/mol".
const NB = ' ';
const VMIN = -0.46;
const VMAX = 0.92;
const TICKS = [-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];
const sv = (v) => (v > 0 ? `+${v.toFixed(2)}` : v < 0 ? `−${Math.abs(v).toFixed(2)}` : '0.00');
const si = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));

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
.tb-respiratory-chain .rc-cap { fill: var(--ink-faint); }
.tb-respiratory-chain .rc-name { fill: var(--ink); font-weight: 600; }
.tb-respiratory-chain .rc-soft { fill: var(--ink-soft); }
.tb-respiratory-chain .rc-region { fill: var(--ink-faint); font-style: italic; }
.tb-respiratory-chain .rc-grid { stroke: var(--rule); stroke-width: 0.6; }
.tb-respiratory-chain .rc-spine { stroke: var(--rule-strong); stroke-width: 1; }
.tb-respiratory-chain .rc-path { stroke: var(--ink-soft); stroke-width: 1.3; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.tb-respiratory-chain .rc-path.is-off { stroke: var(--rule-strong); stroke-width: 1.1; stroke-dasharray: 3 3.5; }
.tb-respiratory-chain .rc-leader { stroke: var(--rule-strong); stroke-width: 0.8; }
.tb-respiratory-chain .rc-axisval { fill: var(--ink-soft); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-respiratory-chain .rc-charge { fill: var(--leaf-text); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-respiratory-chain .rc-block { fill: var(--coral-text); font-weight: 600; }
.tb-respiratory-chain .rc-idle { fill: var(--paper-2); stroke: var(--rule-strong); stroke-width: 1; stroke-dasharray: 3 2.5; }
.tb-respiratory-chain .rc-idle-num { fill: var(--ink-faint); font-weight: 700; }
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
  let completed = 0; // pairs through a route that moves a charge or more, since the last clear
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
      const m = { from: 'src', to: 'out', t0: t, t1: t + d(T_HOP * 1.4) };
      moves.push(m);
      // 19 and 15 kJ/mol pay for no charge, so nothing is counted towards the gradient.
      return true;
    }
    const m = { from: donor === 'nadh' ? 'src' : 'src2', to: entry, t0: t, t1: t + d(donor === 'nadh' ? T_HOP * 1.3 : T_APPEAR) };
    moves.push(m);
    ready[entry].push(m.t1);
    held[entry] = 1;
    settle(t);
    return true;
  }

  // The selected donor's whole route is open: a pair from it would reach the acceptor.
  function routeOpen(dn) {
    const a = acc();
    const entry = entryOf(dn);
    if (entry === 'out') return true;
    if (entry !== 'I' && entry !== 'II') return false;
    if (entry === 'II' && block().at === 'II') return false;
    const route = routeOf(a);
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
    aria: 'The electron transport chain drawn against reduction potential: NADH at −0.32 volts at the top, complex I, ubiquinone, complex III, cytochrome c and complex IV down a staircase membrane to oxygen at +0.82, with complex II entering at +0.03, and a table of what a pair releases and moves. Press N or F to choose NADH or the cycle\'s FADH2, D or Enter to deliver a pair, B to block the next complex, O to take the oxygen away or give it back, A to change the acceptor, Space to run or pause, and Home to reset.',
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
  b.divide();
  const BLOCK_WIDE = ['none', 'rotenone at I', 'malonate at II', 'antimycin A at III', 'cyanide at IV'];
  const BLOCK_SAY = ['nothing blocked', 'rotenone, blocking complex I', 'malonate, blocking complex II', 'antimycin A, blocking complex III', 'cyanide, blocking complex IV'];
  const blockCtl = b.stepper('Block', {
    min: 0, max: 4, step: 1, value: 0,
    format: (v, { narrow }) => (narrow ? (BLOCKS[v]?.by ?? 'none') : BLOCK_WIDE[v]),
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
  b.divide();
  const runCtl = b.run({ primary: false, aria: 'Run, let the pairs move', onChange: () => draw() });
  b.action('Reset', () => resetAll(), { aria: 'Reset, the chain idle with oxygen present and nothing blocked' });
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
  const fxEnd = (f) => (f.kind === 'charges' ? f.at + (f.n - 1) * STAGGER + T_CHARGE + 0.45 : f.at + T_FX);
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
    const x = crossoverAt();
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
      crossoverAt: x,
      refused,
      t: Number(now().toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  b.onAnnounce((s) => {
    const a = ACCEPTORS.find((x) => x.id === s.acceptor);
    const who = s.donor === 'nadh' ? 'NADH' : 'FADH2 from the cycle';
    const count = s.chargesAreCeiling
      ? `at most ${s.chargesPerPair} charges a pair, a ceiling`
      : `${s.chargesMoved} charges moved`;
    const block2 = s.blockedBy ? ` ${s.blockedBy} blocks complex ${s.blockedAt}.` : '';
    const noO2 = s.acceptor === 'oxygen' && !s.oxygenPresent ? ' No oxygen.' : '';
    const cross = s.crossoverAt ? ` Crossover at ${nameOf(s.crossoverAt, a)}.` : '';
    const no = s.refused ? ` The last pair was refused: ${refusalWords(s.refused)}.` : '';
    return `${who} to ${a.word}: ${s.pairsDelivered} ${s.pairsDelivered === 1 ? 'pair' : 'pairs'} delivered, ${count}. Gradient ${s.gradientPH} pH units and ${s.gradientMv} millivolts. ATP made here 0.${block2}${noO2}${cross}${no}`;
  });
  function refusalWords(r) {
    if (r === 'blocked-entry') return 'malonate holds the cycle at succinate, so no FADH2 is made';
    if (r === 'backed-up') return 'the chain is backed up to the door';
    if (r === 'no-fall') return 'FADH2 and fumarate sit at the same potential';
    return 'the acceptor sits above FADH2, uphill';
  }

  // ---- the sentence under the table ----
  const entryName = () => (donor === 'nadh' ? `complex${NB}I` : `complex${NB}II`);
  const cname = (s) => nameOf(s, acc()).replace(' ', NB);
  function status(level) {
    const a = acc();
    const per = chargesFor(donor, a);
    const kj = kjOf(fallOf(donor, a));
    const bl = block();
    const x = crossoverAt();
    const short = level >= 2;
    if (refused === 'no-fall') {
      return short ? 'No fall: FADH₂ and fumarate are level.' : `The cycle's FADH₂ sits at +0.03${NB}V, level with fumarate: no fall, so no pair goes.`;
    }
    if (refused === 'uphill') {
      return short ? `Uphill: ${a.word} sits above FADH₂.` : `The cycle's FADH₂ sits at +0.03${NB}V, below ${a.word} at ${sv(a.E)}${NB}V, and electrons do not run uphill, so no pair goes.`;
    }
    if (refused === 'blocked-entry') {
      return short ? 'Malonate: no FADH₂ is made.' : `Malonate sits in complex${NB}II's succinate site, so the cycle makes no FADH₂ and no pair enters. Everything below complex${NB}II stays oxidised.`;
    }
    const full = refused === 'backed-up' ? ` A new pair has nowhere to go.` : '';
    if (x) {
      if (a.id === 'oxygen' && !oxygenOn && bl.at !== 'IV') {
        return short ? 'No oxygen: backed up from the bottom.' : `No oxygen: complex${NB}IV cannot hand its pair on, so the chain backs up from the bottom and the gradient runs down.${full}`;
      }
      const by = bl.by ? `${bl.by[0].toUpperCase()}${bl.by.slice(1)}` : 'The block';
      return short
        ? `Crossover at ${cname(x)}.`
        : `${by} stops ${cname(x)}: the carriers above it are reduced and those below oxidised, so the crossover is at ${cname(x)}, and the gradient runs down.${full}`;
    }
    if (a.id === 'sulfate' || a.id === 'carbon-dioxide') {
      if (donor === 'nadh') {
        return short
          ? `${kj}${NB}kJ/mol: less than one charge.`
          : `${kj}${NB}kJ/mol from NADH is not quite one charge's worth (19.3${NB}kJ/mol). These organisms take their electrons from fuels other than NADH, mostly hydrogen, and move only a few ions per reaction.`;
      }
    }
    const idle = pairs.nadh + pairs.fadh2 === 0;
    if (a.id === 'oxygen') {
      if (idle) return short ? 'Deliver a pair.' : 'Nothing delivered yet. Deliver a pair, and count the charges it moves across the membrane.';
      if (!oxygenOn) return short ? 'No oxygen.' : `No oxygen: complex${NB}IV has nothing to hand its pair to.`;
      const malonate = bl.at === 'II' && donor === 'nadh' ? `Malonate blocks complex${NB}II, and NADH's pairs never pass through it: ` : '';
      if (donor === 'nadh') {
        return short ? '10 charges a pair, and no ATP.' : `${malonate}${malonate ? '4 + 2 + 4 = 10 charges a pair, as before' : 'From NADH, 4 + 2 + 4 = 10 charges a pair'}, and no ATP. The chain's product is the gradient.`;
      }
      return short ? '6 charges a pair, and no ATP.' : `From FADH₂ the pair enters at complex${NB}II, past complex${NB}I: 2 + 4 = 6 charges a pair, and no ATP.`;
    }
    const unused = bl.at && !inPlay(a).includes(bl.at) ? ` ${bl.by[0].toUpperCase()}${bl.by.slice(1)} blocks complex${NB}${bl.at}, which this route does not use.` : '';
    const ceiling = `${kj}${NB}kJ/mol pays for at most ${per} ${per === 1 ? 'charge' : 'charges'} at 200${NB}mV (19.3${NB}kJ/mol each): a ceiling, not any organism's count.`;
    if (a.id === 'nitrate') {
      if (short) return `At most ${per} charges: a ceiling.`;
      return `${ceiling}${donor === 'nadh' ? ` E.${NB}coli's own nitrate chain moves about${NB}6.` : ''}${unused}`;
    }
    // fumarate, from NADH (FADH₂ was refused above)
    if (short) return `Menaquinone; at most ${per} charges.`;
    return `Menaquinone (−0.07${NB}V) stands in for ubiquinone, which sits just below fumarate. ${ceiling}${unused}`;
  }
  const SAME_KIND = 'The mitochondrial chain with its bottom rung moved: the same kind of machinery, not any one organism\'s chain.';

  // ---------------------------------------------------------------- the drawing's clock-side state

  const MODEL = (s) => (held[s] ? 1 : 0);
  // How many pairs a station is DRAWN holding at time t: the model, less those still on their way to it,
  // plus those that have not yet left it.
  function shown(station, t) {
    let n = MODEL(station);
    for (const m of moves) {
      if (m.to === station && m.t1 > t) n -= 1;
      if (m.from === station && m.t0 > t) n += 1;
    }
    return clamp(n, 0, 1);
  }
  const chargesShown = (t) => charges - fx.filter((f) => f.kind === 'charges' && f.at > t).reduce((s, f) => s + f.n, 0);

  // ---------------------------------------------------------------- geometry
  //
  // Everything the stair draws is decided here, once per pane size, acceptor and block, and both the
  // drawing and the label placement read it, so a label is placed against exactly what is drawn.
  let BH = 9; // half the membrane's thickness
  let CW = 30; // a complex's width
  let CW2 = 25;
  let AH = 8; // half complex I's matrix arm
  let DOT = 2.7;
  let RQ = 5.5;
  let RC = 7;
  let RN = 6.5;
  let RA = 5.2;
  let H2 = 22;
  function applyScale(k, pw) {
    BH = 9 * k;
    CW = Math.min(30 * k, Math.max(20, pw * 0.085));
    CW2 = CW * 0.84;
    AH = Math.min(8 * k, CW * 0.3);
    DOT = 2.7 * k;
    RQ = 5.5 * k;
    RC = 7 * k;
    RN = 6.5 * k;
    RA = 5.2 * k;
    H2 = 22 * k;
  }

  let geo = null;
  function geometry(w, hh) {
    const key = `${w}|${hh}|${fontsKey()}|${accIdx}|${blockIdx}|${b.narrow ? 'n' : 'w'}`;
    if (geo?.key === key) {
      applyScale(geo.k, geo.pw);
      return geo;
    }
    const g = frame(w, hh);
    g.key = key;
    placeLabels(g);
    geo = g;
    return g;
  }

  function frame(w, hh) {
    const portrait = hh > w * 0.92;
    const g = { w, h: hh, portrait };
    if (portrait) {
      const RH = clamp(Math.round(hh * 0.4), 168, 260);
      g.read = { x: 0, y: hh - RH, w, h: RH };
      g.dw = w;
      g.dh = hh - RH - 12;
    } else {
      const RW = clamp(Math.round(w * 0.34), 172, 330);
      g.read = { x: w - RW, y: 0, w: RW, h: hh };
      g.dw = w - RW - 18;
      g.dh = hh;
    }
    const k = clamp(Math.min(g.dw / 430, g.dh / 330), 1, 1.3);
    g.k = k;
    g.size = 10.4 * k;
    g.small = 9.4 * k;
    g.tick = 9.2 * k;
    g.axisX = Math.ceil(Math.max(textWidth('−0.4', g.tick), textWidth('+0.8', g.tick))) + 5;
    g.left = g.axisX + 16;
    g.right = g.dw - 4;
    g.pw = Math.max(160, g.right - g.left);
    applyScale(k, g.pw);
    g.capSize = 9.4 * k;
    g.top = Math.round(g.capSize + 13);
    g.bottom = g.dh - 8;
    const yOf = (v) => g.top + ((v - VMIN) / (VMAX - VMIN)) * (g.bottom - g.top);
    const px = (f) => g.left + f * g.pw;
    g.yOf = yOf;
    const a = acc();
    const Eq = a.id === 'fumarate' ? E.mq : E.uq;
    g.Eq = Eq;
    const x = { N: px(0.06), I: px(0.29), II: px(0.385), Q: px(0.46), Nar: px(0.535), III: px(0.62), c: px(0.715), IV: px(0.81) };
    const y = { N: yOf(E.nadh), Q: yOf(Eq), FAD: yOf(E.fad), C: yOf(E.c), O2: yOf(E.o2), NO3: yOf(E.no3), acc: yOf(a.E) };
    g.x = x;
    g.y = y;
    // The stair: riser I from the top of the pane, the quinone's tread, riser III, cytochrome c's tread
    // (c sits on its upper face), riser IV, and a last tread out to the edge.
    const y3 = y.C + RC + BH + 1.5;
    const y4 = yOf(0.7);
    g.y3 = y3;
    g.y4 = y4;
    g.band = [
      { x: x.I, y: -2 }, { x: x.I, y: y.Q }, { x: x.III, y: y.Q }, { x: x.III, y: y3 },
      { x: x.IV, y: y3 }, { x: x.IV, y: y4 }, { x: g.dw + 2, y: y4 },
    ];
    g.faceIms = offsetLine(g.band, BH);
    g.faceMat = offsetLine(g.band, -BH);
    g.headR = BH * 0.34;
    g.heads = [...beads(g.faceIms, g.headR * 2.35), ...beads(g.faceMat, g.headR * 2.35)];
    // The complexes, as boxes. Complex I is an L: its membrane arm in riser I, its matrix arm out to NADH.
    g.body = {
      Iarm: { x0: x.N + RN + 5 * k, y0: y.N - AH, x1: x.I, y1: y.N + AH },
      I: { x0: x.I - CW / 2, y0: y.N - AH - 3 * k, x1: x.I + CW / 2, y1: y.Q - 3 },
      II: { x0: x.II - CW2 / 2, y0: y.Q - BH + 1, x1: x.II + CW2 / 2, y1: y.FAD + H2 },
      III: { x0: x.III - CW / 2, y0: y.Q - 4 * k, x1: x.III + CW / 2, y1: y.C + 3 * k },
      IV: { x0: x.IV - CW / 2, y0: y.C - 5 * k, x1: x.IV + CW / 2, y1: yOf(0.86) },
    };
    if (a.id === 'nitrate') g.body.Nar = { x0: x.Nar - CW2 / 2, y0: y.Q - BH + 1, x1: x.Nar + CW2 / 2, y1: y.NO3 + 5 * k };
    // Where a held pair sits, and where each hop runs.
    let out;
    if (a.id === 'oxygen') out = { x: x.IV - CW / 2 - RA - 6 * k, y: y.O2 };
    else if (a.id === 'nitrate') out = { x: x.Nar - CW2 / 2 - RA - 5 * k, y: y.NO3 };
    else if (a.id === 'fumarate') out = { x: x.II + CW2 / 2 + RA + 5 * k, y: y.FAD };
    else out = { x: x.N, y: y.acc };
    g.seat = {
      src: { x: x.N, y: y.N },
      src2: { x: x.II, y: y.FAD + H2 * 0.72 },
      I: { x: x.I, y: lerp(y.N, y.Q, 0.62) },
      II: { x: x.II, y: y.FAD },
      Q: { x: x.Q, y: y.Q },
      Nar: { x: x.Nar, y: lerp(y.Q, y.NO3, 0.55) },
      III: { x: x.III, y: lerp(y.Q, y.C, 0.5) },
      c: { x: x.c, y: y.C },
      IV: { x: x.IV, y: lerp(y.C, y.O2, 0.5) },
      out,
    };
    const s = g.seat;
    const tip = g.body.Iarm.x0 + 2;
    g.wires = {
      'src>I': [s.src, { x: tip, y: y.N }, { x: x.I, y: y.N }, s.I],
      'src2>II': [s.src2, s.II],
      'src>out': [s.src, s.out],
      'I>Q': [s.I, { x: x.I, y: y.Q }, s.Q],
      'II>Q': [s.II, { x: x.II, y: y.Q }, s.Q],
      'Q>III': [s.Q, { x: x.III, y: y.Q }, s.III],
      'III>c': [s.III, { x: x.III, y: y.C }, s.c],
      'c>IV': [s.c, { x: x.IV, y: y.C }, s.IV],
      'IV>out': [s.IV, { x: x.IV, y: y.O2 }, s.out],
      'Q>Nar': [s.Q, { x: x.Nar, y: y.Q }, s.Nar],
      'Nar>out': [s.Nar, { x: x.Nar, y: y.NO3 }, s.out],
      'Q>II': [s.Q, { x: x.II, y: y.Q }, s.II],
      'II>out': [s.II, s.out],
    };
    // The hops drawn as the path, for the route this acceptor opens.
    const route = routeOf(a);
    g.hops = [];
    if (a.id === 'sulfate' || a.id === 'carbon-dioxide') g.hops.push({ id: 'src>out', donor: 'nadh' });
    else {
      g.hops.push({ id: 'src>I', donor: 'nadh' });
      if (a.id !== 'fumarate') g.hops.push({ id: 'src2>II', donor: 'fadh2' });
      for (const [from, to] of Object.entries(route)) g.hops.push({ id: `${from}>${to}`, donor: from === 'II' && a.id !== 'fumarate' ? 'fadh2' : from === 'I' ? 'nadh' : null });
    }
    // Where the charges cross, with oxygen: through each pumping complex's riser, left to right.
    const span = (y0, y1, n) => Array.from({ length: n }, (_, i) => lerp(y0, y1, n === 1 ? 0.5 : i / (n - 1)));
    g.cross = {
      I: { x: x.I, ys: span(g.body.I.y0 + 5 * k, y.Q - BH - 6 * k, 4) },
      III: { x: x.III, ys: span(y.Q + BH + 4 * k, y3 - BH - 4 * k, 2) },
      IV: { x: x.IV, ys: span(y3 + BH + 5 * k, y4 - BH - 5 * k, 4) },
    };
    g.crossReach = BH + 9 * k;
    // The fall: from the donor's rung to the acceptor's, on the axis.
    g.bracket = { x: g.axisX + 8, y0: yOf(donorE(donor)), y1: y.acc };
    // The block's mark: a bar across the wire the inhibitor stops.
    const bl = block();
    g.blockBar = null;
    if (bl.at === 'I') g.blockBar = { x: x.I, y: lerp(s.I.y, y.Q, 0.55), w: CW * 0.8 };
    else if (bl.at === 'II') g.blockBar = { x: x.II, y: lerp(y.FAD, s.src2.y, 0.55), w: CW2 * 0.8 };
    else if (bl.at === 'III') g.blockBar = { x: x.III, y: lerp(s.III.y, y.C, 0.55), w: CW * 0.8 };
    else if (bl.at === 'IV') g.blockBar = { x: x.IV, y: lerp(s.IV.y, y.O2, 0.5), w: CW * 0.8 };
    // The legend, bottom left.
    const ls = g.small;
    const legendW = 3 * DOT * 2 + 6 + textWidth('a pair of electrons', ls) + 14 + textWidth('+', ls, 700) + 5 + textWidth('a charge moved across', ls);
    g.legend = { x: g.left, y: g.bottom - 1, size: ls, w: legendW };
    if (legendW > s.out.x - g.left - 20 && a.id === 'oxygen' && g.bottom - y.O2 < ls * 2.2) g.legend = null;
    // The axis caption, trimmed to the room left of riser I.
    const room = x.I - BH - 6;
    g.caption = ['Reduction potential, V', 'Potential, V', 'E, V'].find((c) => textWidth(c, g.capSize) <= room) ?? 'V';
    return g;
  }

  // A rectilinear line moved sideways by `off`: to its left, walking along it, for a positive offset.
  // Each corner takes the sum of its two segments' unit normals, which for a right angle is the mitre.
  function offsetLine(pts, off) {
    const nrm = (p, q) => ({ x: Math.sign(q.y - p.y), y: -Math.sign(q.x - p.x) });
    return pts.map((p, i) => {
      const n0 = i > 0 ? nrm(pts[i - 1], p) : { x: 0, y: 0 };
      const n1 = i < pts.length - 1 ? nrm(p, pts[i + 1]) : { x: 0, y: 0 };
      return { x: p.x + (n0.x + n1.x) * off, y: p.y + (n0.y + n1.y) * off };
    });
  }
  // Points every `gap` along a polyline.
  function beads(pts, gap) {
    const out = [];
    let carry = gap / 2;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const c = pts[i];
      const len = Math.hypot(c.x - a.x, c.y - a.y);
      let u = carry;
      while (u <= len) {
        out.push({ x: a.x + ((c.x - a.x) * u) / len, y: a.y + ((c.y - a.y) * u) / len });
        u += gap;
      }
      carry = u - len;
    }
    return out;
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
  // rings further out with a leader line back; the first position whose box clears every line, mark, zone
  // and label already placed, and stays inside the drawing, is taken. The box is the WIDEST the label can
  // be in this state, so nothing a run does can make it collide later.
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

  function obstaclesOf(g) {
    const rects = [];
    const segs = [];
    const a = acc();
    for (let i = 1; i < g.band.length; i += 1) segs.push({ a: g.band[i - 1], b: g.band[i], pad: BH + 1.5 });
    for (const hp of g.hops) {
      const pts = g.wires[hp.id];
      for (let i = 1; i < pts.length; i += 1) segs.push({ a: pts[i - 1], b: pts[i], pad: 2.2 });
    }
    for (const [id, r] of Object.entries(g.body)) if (id !== 'Nar' || a.id === 'nitrate') rects.push(grow(r, 1.5));
    const disc = (p, r) => ({ x0: p.x - r - 2, y0: p.y - r - 2, x1: p.x + r + 2, y1: p.y + r + 2 });
    rects.push(disc(g.seat.src, RN), disc(g.seat.Q, RQ), disc(g.seat.c, RC), disc(g.seat.out, RA + 2));
    if (a.id === 'oxygen') {
      for (const cr of Object.values(g.cross)) {
        rects.push({ x0: cr.x - g.crossReach - 4, y0: Math.min(...cr.ys) - g.size * 0.8, x1: cr.x + g.crossReach + 4, y1: Math.max(...cr.ys) + 3 });
      }
    }
    // The axis, its ticks and the caption.
    rects.push({ x0: 0, y0: g.top - 8, x1: g.axisX + 1, y1: g.bottom + 5 });
    rects.push({ x0: 0, y0: 0, x1: textWidth(g.caption, g.capSize) + 3, y1: g.capSize + 4 });
    segs.push({ a: { x: g.bracket.x, y: g.bracket.y0 }, b: { x: g.bracket.x, y: g.bracket.y1 }, pad: 3 });
    if (g.blockBar) rects.push({ x0: g.blockBar.x - g.blockBar.w / 2 - 2, y0: g.blockBar.y - 3, x1: g.blockBar.x + g.blockBar.w / 2 + 2, y1: g.blockBar.y + 3 });
    if (g.legend) rects.push({ x0: g.legend.x - 2, y0: g.legend.y - g.legend.size - 2, x1: g.legend.x + g.legend.w + 2, y1: g.legend.y + 4 });
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

  function placeLabels(g) {
    const { rects, segs } = obstaclesOf(g);
    const placed = [];
    const bounds = { x0: 1, y0: 1, x1: g.dw - 1, y1: g.dh - 1 };
    const a = acc();
    const s = g.seat;
    const size = g.size;
    const items = [];
    const add = (key, src, mark, hw, hh, { cls = 'rc-name', sz = size, weight = 600, widest = src, prefer = null, cands = null, optional = false } = {}) => {
      items.push({ key, src, mark, hw, hh, cls, size: sz, weight, widest, prefer, cands, optional });
    };
    const inBand = BH + 3;
    add('nadh', 'NADH', s.src, RN, RN, { prefer: 'up' });
    const accSrc = a.id === 'oxygen' && !oxygenOn ? `no ${a.mark}` : a.label;
    add('acc', a.label, s.out, RA + 1, RA + 1, { widest: a.id === 'oxygen' ? a.label : a.label, prefer: a.id === 'sulfate' || a.id === 'carbon-dioxide' ? 'down' : 'left' });
    add('q', a.id === 'fumarate' ? 'menaquinone' : 'ubiquinone', s.Q, RQ, inBand, { prefer: 'up' });
    add('c', 'cytochrome ~c~', s.c, RC, RC, { prefer: 'up' });
    add('fadh2', 'FADH_{2}', s.II, CW2 / 2, 4, { prefer: 'left' });
    if (a.id === 'nitrate') add('nar', 'nitrate reductase', { x: g.x.Nar, y: (g.body.Nar.y0 + g.body.Nar.y1) / 2 }, CW2 / 2, (g.body.Nar.y1 - g.body.Nar.y0) / 2, { cls: 'rc-soft', weight: 500, sz: g.small, prefer: 'right', optional: true });
    if (g.blockBar) {
      const bl = block();
      add('block', bl.by, { x: g.blockBar.x, y: g.blockBar.y }, g.blockBar.w / 2, 3, { cls: 'rc-block', prefer: 'right' });
    }
    add('bracket', `${b.num(Math.abs(fallOf(donor, a)), 2)}${NB}V`, { x: g.bracket.x, y: (g.bracket.y0 + g.bracket.y1) / 2 }, 2, Math.max(6, Math.abs(g.bracket.y1 - g.bracket.y0) / 2 - 4), { cls: 'rc-axisval', sz: g.small, prefer: 'right' });
    add('bracketSub', `${si(kjOf(fallOf(donor, a)))}${NB}kJ/mol`, { x: g.bracket.x, y: (g.bracket.y0 + g.bracket.y1) / 2 }, 2, 6, {
      cls: 'rc-cap', sz: g.small * 0.96, weight: 400, optional: true,
      cands: (out) => (out.bracket ? [{ x: out.bracket.box.x0 + 1.5, y: out.bracket.box.y1 + g.small * 1.08, anchor: 'start', far: 0 }] : []),
    });
    if (a.id === 'oxygen') {
      for (const st of ['I', 'III', 'IV']) {
        const cr = g.cross[st];
        const y0 = Math.min(...cr.ys);
        const y1 = Math.max(...cr.ys);
        add(`n${st}`, `+${CHARGES_AT[st]}`, { x: cr.x, y: (y0 + y1) / 2 }, g.crossReach + 4, (y1 - y0) / 2 + 2, { cls: 'rc-charge', prefer: 'right', optional: true });
      }
    }
    // The two compartments, named where there is room.
    add('matrix', 'matrix', { x: g.x.N, y: g.yOf(0.5) }, 2, 2, {
      cls: 'rc-region', weight: 400, sz: g.small, optional: true,
      cands: () => [0.5, 0.36, 0.62, 0.22, 0.72].flatMap((v) => [0.02, 0.1, 0.2].map((f) => ({ x: g.left + f * g.pw, y: g.yOf(v), anchor: 'start', far: 0 }))),
    });
    add('ims', 'intermembrane space', { x: g.x.III, y: g.yOf(-0.3) }, 2, 2, {
      cls: 'rc-region', weight: 400, sz: g.small, optional: true,
      cands: () => [-0.34, -0.26, -0.18, -0.4].flatMap((v) => [{ x: g.right - 2, y: g.yOf(v), anchor: 'end', far: 0 }, { x: g.x.I + BH + 8, y: g.yOf(v), anchor: 'start', far: 0 }]),
    });
    const out = {};
    for (const it of items) {
      let chosen = null;
      let first = null;
      for (const shrink of [1, 0.92, 0.85]) {
        const sz = it.size * shrink;
        const w = textWidth(it.widest, sz, it.weight);
        const asc = sz * 0.92;
        const desc = sz * 0.34;
        let cands = it.cands ? it.cands(out) : [0, 13, 26].flatMap((far) => ring(it.mark, it.hw, it.hh, sz, far));
        if (it.prefer === 'up') cands = [...cands.filter((c) => c.y < it.mark.y && !c.far), ...cands];
        if (it.prefer === 'down') cands = [...cands.filter((c) => c.y > it.mark.y && !c.far), ...cands];
        if (it.prefer === 'right') cands = [...cands.filter((c) => c.anchor === 'start' && Math.abs(c.y - it.mark.y) < sz && !c.far), ...cands];
        if (it.prefer === 'left') cands = [...cands.filter((c) => c.anchor === 'end' && Math.abs(c.y - it.mark.y) < sz && !c.far), ...cands];
        if (!first && cands.length) {
          const c = cands[0];
          const x0 = c.anchor === 'end' ? c.x - w : c.anchor === 'middle' ? c.x - w / 2 : c.x;
          first = { ...c, size: sz, box: { x0, y0: c.y - asc, x1: x0 + w, y1: c.y + desc }, leader: null, collided: true };
        }
        for (const c of cands) {
          const x0 = c.anchor === 'end' ? c.x - w : c.anchor === 'middle' ? c.x - w / 2 : c.x;
          const box = { x0: x0 - 1.5, y0: c.y - asc, x1: x0 + w + 1.5, y1: c.y + desc };
          if (box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.y0 < bounds.y0 || box.y1 > bounds.y1) continue;
          const clear = { x0: box.x0 - 6, y0: box.y0 - 2, x1: box.x1 + 6, y1: box.y1 + 2 };
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
          chosen = { ...c, size: sz, box, leader };
          break;
        }
        if (chosen) break;
      }
      if (!chosen && (it.optional || !first)) continue;
      if (!chosen) chosen = first;
      placed.push(chosen.box);
      if (chosen.leader) segs.push({ a: chosen.leader.a, b: chosen.leader.b, pad: 1.5 });
      out[it.key] = { ...it, ...chosen };
    }
    if (out.acc) out.acc.live = accSrc;
    g.labels = out;
    g.collisions = Object.values(out).filter((l) => l.collided).map((l) => l.key);
    // The gradient's signs, along both faces of the membrane, wherever nothing else stands.
    const keep = (p) => !Object.values(g.body).some((r) => boxHit(grow(r, 4), { x0: p.x - 4, y0: p.y - 6, x1: p.x + 4, y1: p.y + 3 }))
      && !placed.some((r) => boxHit(r, { x0: p.x - 5, y0: p.y - 7, x1: p.x + 5, y1: p.y + 4 }))
      && !rects.some((r) => boxHit(r, { x0: p.x - 3, y0: p.y - 5, x1: p.x + 3, y1: p.y + 2 }))
      && p.x > g.left && p.x < g.right && p.y > g.top && p.y < g.dh - 4;
    const gap = 26 * g.k;
    g.signs = [
      ...beads(offsetLine(g.band, BH + 7 * g.k), gap).filter(keep).map((p) => ({ ...p, sign: '+' })),
      ...beads(offsetLine(g.band, -(BH + 7 * g.k)), gap).filter(keep).map((p) => ({ ...p, sign: '−' })),
    ];
  }

  // ---------------------------------------------------------------- drawing

  function richLabel(x, y, src, { size, anchor = 'start', cls = null, weight = null, fill = null, halo = 2.6, haloColour = C.paper, opacity = null } = {}) {
    const t = pane.text(x, y, '', {
      anchor,
      class: cls ?? undefined,
      'font-size': b.num(size, 2),
      'font-weight': weight ?? undefined,
      style: fill ? `fill:${fill}` : undefined,
      opacity: opacity === null ? undefined : b.num(opacity, 3),
      ...(halo ? { stroke: haloColour, 'stroke-width': `${halo}px`, 'stroke-linejoin': 'round', 'paint-order': 'stroke' } : {}),
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

  const electron = (x, y, opacity = null) => pane.circle(x, y, DOT, {
    fill: C.ink, stroke: C.paper, 'stroke-width': 1.2, ...(opacity === null ? {} : { opacity: b.num(opacity, 3) }),
  });
  const pairAt = (p) => {
    electron(p.x - DOT * 1.2, p.y);
    electron(p.x + DOT * 1.2, p.y);
  };

  function drawAxes(g) {
    for (const v of TICKS) {
      const y = g.yOf(v);
      pane.line(g.axisX + 3, y, g.right, y, { class: 'rc-grid' });
      const label = v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;
      pane.text(g.axisX - 4, y + g.tick * 0.35, label, { anchor: 'end', class: 'rc-tick', 'font-size': b.num(g.tick, 1) });
    }
    pane.line(g.axisX, g.top - 4, g.axisX, g.bottom + 2, { class: 'rc-spine' });
    pane.text(0, g.capSize + 1, g.caption, { class: 'rc-cap', 'font-size': b.num(g.capSize, 1) });
    const { x, y0, y1 } = g.bracket;
    const downhill = y1 > y0 + 0.5;
    const attrs = downhill ? { stroke: C.ink, 'stroke-width': 1.1 } : { stroke: C.coralText, 'stroke-width': 1.1, 'stroke-dasharray': '2.5 2' };
    pane.line(x, y0, x, y1, attrs);
    pane.line(x - 3, y0, x + 3, y0, attrs);
    pane.line(x - 3, y1, x + 3, y1, attrs);
  }

  function drawBand(g) {
    const poly = [...g.faceIms, ...[...g.faceMat].reverse()];
    pane.path(`${dOf(poly)} Z`, { fill: TAIL_FILL });
    for (const p of g.heads) pane.circle(p.x, p.y, g.headR, { fill: HEAD_FILL });
  }

  function drawSigns(g, level) {
    if (level < 0.02) return;
    for (const p of g.signs) {
      pane.text(p.x, p.y + g.small * 0.34, p.sign, {
        anchor: 'middle', 'font-size': b.num(g.small * 1.05, 1), 'font-weight': 700,
        style: `fill:${p.sign === '+' ? C.leafText : C.waterText}`, opacity: b.num(level, 3),
      });
    }
  }

  function drawWires(g) {
    for (const hp of g.hops) {
      const pts = g.wires[hp.id];
      const off = hp.donor && hp.donor !== donor;
      pane.path(dOf(pts), { class: `rc-path${off ? ' is-off' : ''}` });
      // A chevron at the middle of the longest run says which way the pairs go.
      let best = null;
      for (let i = 1; i < pts.length; i += 1) {
        const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (!best || len > best.len) best = { a: pts[i - 1], c: pts[i], len };
      }
      if (best && best.len > 30) {
        const mid = { x: (best.a.x + best.c.x) / 2, y: (best.a.y + best.c.y) / 2 };
        arrowHead(toward(mid, best.c, 3), toward(mid, best.a, 3), 4.6, `rc-path${off ? ' is-off' : ''}`);
      }
    }
  }

  function drawBodies(g) {
    const a = acc();
    const used = new Set(inPlay(a));
    const box = (r, attrs) => pane.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, { rx: b.num(4 * g.k, 1), ...attrs });
    const num = (x, y, str, fill, halo, idle) => pane.text(x, y + g.size * 0.38, str, {
      anchor: 'middle', 'font-size': b.num(g.size * 1.05, 1), 'font-weight': 700,
      ...(idle ? { class: 'rc-idle-num' } : { style: `fill:${fill}`, stroke: halo, 'stroke-width': '2.4px', 'stroke-linejoin': 'round', 'paint-order': 'stroke' }),
    });
    const draw1 = (id, parts, fill, ink, label, mid) => {
      const idle = !used.has(id);
      for (const r of parts) box(r, idle ? { class: 'rc-idle' } : { fill });
      num(mid.x, mid.y, label, ink, fill, idle);
    };
    const B = g.body;
    draw1('I', [B.Iarm, B.I], PUMP.color, PUMP.symbolColor, 'I', { x: g.x.I, y: (B.I.y0 + B.I.y1) / 2 });
    draw1('II', [B.II], ENZ.color, ENZ.symbolColor, 'II', { x: g.x.II, y: (g.y.FAD + B.II.y1) / 2 + 2 * g.k });
    if (B.Nar) draw1('Nar', [B.Nar], ENZ.color, ENZ.symbolColor, 'N', { x: g.x.Nar, y: lerp(g.y.Q, g.y.NO3, 0.28) });
    draw1('III', [B.III], PUMP.color, PUMP.symbolColor, 'III', { x: g.x.III, y: lerp(B.III.y0, B.III.y1, 0.28) });
    draw1('IV', [B.IV], PUMP.color, PUMP.symbolColor, 'IV', { x: g.x.IV, y: lerp(B.IV.y0, B.IV.y1, 0.22) });
    // The cycle's FAD, a rung across complex II.
    const fadIdle = a.id === 'sulfate' || a.id === 'carbon-dioxide';
    pane.line(B.II.x0 + 2, g.y.FAD, B.II.x1 - 2, g.y.FAD, { stroke: fadIdle ? C.ruleStrong : ENZ.symbolColor, 'stroke-width': 1.4 });
  }

  function drawCarriers(g, t) {
    const a = acc();
    const used = new Set(inPlay(a));
    const s = g.seat;
    // NADH, the donor, and the mobile carriers: pale when oxidised, full when they hold a pair.
    pane.circle(s.src.x, s.src.y, RN, { fill: LOADED, stroke: C.ink, 'stroke-width': 0.8, opacity: donor === 'nadh' ? undefined : 0.55 });
    for (const [id, r] of [['Q', RQ], ['c', RC]]) {
      if (!used.has(id)) {
        pane.circle(s[id].x, s[id].y, r, { class: 'rc-idle' });
        continue;
      }
      const full = shown(id, t) > 0;
      pane.circle(s[id].x, s[id].y, r, { fill: full ? LOADED : CARRIER, stroke: C.ink, 'stroke-width': 0.8 });
    }
    // The acceptor, and the product a pair makes of it.
    const noO2 = a.id === 'oxygen' && !oxygenOn;
    pane.circle(s.out.x, s.out.y, RA, noO2
      ? { fill: C.paper, stroke: C.coralText, 'stroke-width': 1.2, 'stroke-dasharray': '2 1.8' }
      : { fill: C.paper, stroke: C.ink, 'stroke-width': 1.2 });
    if (g.blockBar) {
      const { x, y, w } = g.blockBar;
      pane.line(x - w / 2, y, x + w / 2, y, { stroke: C.coralText, 'stroke-width': 3, 'stroke-linecap': 'round' });
    }
  }

  function drawLabels(g) {
    for (const l of Object.values(g.labels)) {
      if (l.leader) pane.line(l.leader.a.x, l.leader.a.y, l.leader.b.x, l.leader.b.y, { class: 'rc-leader' });
      const src = l.live ?? l.src;
      const noO2 = l.key === 'acc' && acc().id === 'oxygen' && !oxygenOn;
      richLabel(l.x, l.y, src, { size: l.size, anchor: l.anchor, cls: noO2 ? 'rc-block' : l.cls, weight: l.weight });
    }
    if (g.legend) {
      const lg = g.legend;
      let x = lg.x;
      electron(x + DOT, lg.y - lg.size * 0.33);
      electron(x + DOT * 3.4, lg.y - lg.size * 0.33);
      x += DOT * 6 + 6;
      pane.text(x, lg.y, 'a pair of electrons', { class: 'rc-cap', 'font-size': b.num(lg.size, 1) });
      x += textWidth('a pair of electrons', lg.size) + 14;
      pane.text(x, lg.y, '+', { class: 'rc-charge', 'font-size': b.num(lg.size, 1) });
      x += textWidth('+', lg.size, 700) + 5;
      pane.text(x, lg.y, 'a charge moved across', { class: 'rc-cap', 'font-size': b.num(lg.size, 1) });
    }
  }

  function drawDynamic(g, t) {
    const s = g.seat;
    // Pairs at rest.
    for (const st of ['I', 'II', 'Q', 'Nar', 'III', 'c', 'IV']) if (shown(st, t) > 0) pairAt(s[st]);
    if (instant()) return;
    // Pairs on the move.
    for (const m of moves) {
      if (!(t >= m.t0 && t < m.t1) || m.t1 <= m.t0) continue;
      const pts = g.wires[`${m.from}>${m.to}`];
      if (!pts) throw new Error(`respiratory-chain: no wire from ${m.from} to ${m.to} under ${acc().id}.`);
      const f = ease((t - m.t0) / (m.t1 - m.t0));
      const lag = (DOT * 2.6) / Math.max(1, lengthOf(pts));
      const appear = m.from === 'src2' ? clamp((t - m.t0) / Math.max(0.01, m.t1 - m.t0) * 2, 0, 1) : null;
      const p1 = along(pts, f);
      const p2 = along(pts, Math.max(0, f - lag));
      electron(p1.x, p1.y, appear);
      electron(p2.x, p2.y, appear);
    }
    // Charges crossing, and the product appearing.
    for (const f of fx) {
      if (f.kind === 'charges') {
        const cr = g.cross[f.station];
        for (let i = 0; i < f.n; i += 1) {
          const p = (t - f.at - i * STAGGER) / T_CHARGE;
          if (p < 0 || p > 1.75) continue;
          const u = ease(clamp(p, 0, 1));
          const fade = p <= 1 ? 1 : 1 - (p - 1) / 0.75;
          const x = cr.x - g.crossReach + 2 * g.crossReach * u;
          pane.text(x, cr.ys[i % cr.ys.length] + g.size * 0.36, '+', {
            anchor: 'middle', class: 'rc-charge', 'font-size': b.num(g.size * 1.15, 1), opacity: b.num(fade, 3),
            stroke: C.paper, 'stroke-width': '2.4px', 'stroke-linejoin': 'round', 'paint-order': 'stroke',
          });
        }
      } else if (f.kind === 'product') {
        const p = (t - f.at) / T_FX;
        if (p < 0 || p >= 1) continue;
        const a = acc();
        const fade = 1 - p * p;
        richLabel(s.out.x, s.out.y + RA + g.size * 1.1 + 4 * ease(p), a.product, { size: g.small, anchor: 'middle', weight: 600, fill: C.waterText, opacity: fade });
      }
    }
  }

  // ---------------------------------------------------------------- the readout

  function drawReadout(g, t) {
    const R = g.read;
    const a = acc();
    const size = clamp(R.w * 0.034, 9.6, 11.2);
    const level = gradShown(t);
    const col = (dn) => {
      const fall = fallOf(dn, a);
      return { fall: sv(fall).replace('+', ''), kj: si(kjOf(fall)), n: String(chargesFor(dn, a)), pairs: String(pairs[dn]) };
    };
    const cn = col('nadh');
    const cf = col('fadh2');
    const build1 = (r, lv) => {
      r.row('Fall, V', [cn.fall, cf.fall]);
      r.row('Released, kJ/mol', [cn.kj, cf.kj]);
      r.row(a.id === 'oxygen' ? 'Charges moved' : 'Charges, at most', [cn.n, cf.n]);
      if (lv < 2) r.row('Pairs delivered', [cn.pairs, cf.pairs]);
    };
    const jammed = Boolean(crossoverAt()) || Boolean(refused) || (a.id === 'oxygen' && !oxygenOn);
    const build2 = (r, lv) => {
      if (a.id === 'oxygen' && lv < 1) r.row('Charges moved in all', String(chargesShown(t)));
      r.row('pH difference', `${(PH_DIFF * level).toFixed(2)} units`);
      r.row('Membrane potential', `${Math.round(PSI_MV * level)} mV`);
      r.sum('ATP made here', '0');
      r.note(status(lv), jammed ? { accent: C.coralText } : {});
      if (lv < 1 && a.id !== 'oxygen') r.note(SAME_KIND);
    };
    const title1 = `Per pair, to ${a.word}`;
    const opts = { x: R.x, width: R.w, size, minRow: 13, maxRow: 22 };
    const gap = 10;
    for (let lv = 0; lv < 3; lv += 1) {
      const m1 = pane.readout({ ...opts, y: R.y, title: title1, columns: ['NADH', 'FADH₂'] });
      build1(m1, lv);
      const m2 = pane.readout({ ...opts, y: R.y, title: lv < 2 ? 'Across the membrane' : null });
      build2(m2, lv);
      const need = (rowH) => m1.height(rowH) + gap + m2.height(rowH);
      if (lv < 2 && need(opts.minRow) > R.h) continue;
      let lo = opts.minRow;
      let hi = opts.maxRow;
      for (let i = 0; i < 30; i += 1) {
        const mid = (lo + hi) / 2;
        if (need(mid) <= R.h) lo = mid;
        else hi = mid;
      }
      const r1 = pane.readout({ ...opts, y: R.y, title: title1, columns: ['NADH', 'FADH₂'] });
      build1(r1, lv);
      const y2 = r1.draw(lo, R.h) + gap;
      const r2 = pane.readout({ ...opts, y: y2, title: lv < 2 ? 'Across the membrane' : null });
      build2(r2, lv);
      r2.draw(lo, R.y + R.h - y2);
      return lv;
    }
    return 2;
  }

  // ---------------------------------------------------------------- drawing

  function drawAll() {
    const { w, h: hh } = pane.clear().box;
    const g = geometry(w, hh);
    // In the lab, and once the book's face has arrived, a label that nothing clears is a defect in this
    // file, and the gates that drive the lab should say so.
    if (g.collisions.length && fontsKey() === 'loaded' && typeof location !== 'undefined' && location.pathname.includes('/lab/')) {
      throw new Error(`respiratory-chain: at a ${w}×${hh} pane (${g.portrait ? 'portrait' : 'landscape'}, acceptor ${acc().id}, block ${block().at ?? 'none'}) no position clears the label(s) ${g.collisions.join(', ')}; every candidate overlaps a line, a mark or another label.`);
    }
    const t = now();
    drawAxes(g);
    drawBand(g);
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
  //                       kJ/mol ÷ 19.3 rounded down: 7, 3, 0 and 0 from NADH, 3 from FADH₂ to nitrate
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
