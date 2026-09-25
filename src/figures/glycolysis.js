// Ten steps, two halves: Figure 7.1, §7.2.
//
// WHAT IS ON THE STAGE. Glycolysis as a line the reader walks, left to right, one station per
// intermediate and one arrow per step, with the enzyme of each step under its arrow. Every molecule is
// drawn as a chain of carbon discs with a violet phosphate beside each carbon that carries one, so the
// carbon count and the phosphate groups are something the reader sees rather than reads. At step four
// the six-carbon chain is cut and the line becomes two lanes that run in step, which is what makes the
// ledger come out right: the second half happens twice. The currency is drawn where it changes hands —
// ATP to ADP at steps 1 and 3, NAD⁺ to NADH and a phosphate ion from solution at step 6, ADP to ATP at
// steps 7 and 10, once per lane — drawn in outline until the walk has passed it. Under the line (or
// beside it, on a short stage) the ledger: ATP spent, ATP made, net ATP, NADH made and pyruvate made,
// per glucose or per three-carbon fragment; a sentence saying what the last step did; and, on a wide
// stage, four rungs of Section 5.3's ladder and 1,3-bisphosphoglycerate, with the rungs the current
// step's phosphate moves between marked.
//
// THE PATHWAY DRAWN is the one a human, a yeast and most bacteria run, and the figure says so rather
// than letting a reader take it for everybody's. §7.2 and FIGURES.md's corrections: Pyrococcus spends
// ADP rather than ATP at its two phosphorylations and goes straight past 1,3-bisphosphoglycerate
// (Kengen et al., J. Biol. Chem. 269:17537, 1994; Mukund & Adams, J. Biol. Chem. 270:8389, 1995, for the
// ferredoxin-reducing GAPOR); Sulfolobus opens its glucose by the branched Entner–Doudoroff route and
// joins only near the bottom (Selig et al., Arch. Microbiol. 167:217, 1997; Kouril et al., PLoS ONE,
// 2017; Siebers & Schönheit, Curr. Opin. Microbiol. 8:695, 2005). What all three domains share is the
// last three steps, 3-phosphoglycerate to pyruvate, steps 8 to 10 here. No field grades that: the ledger
// carries it as a note where there is room, and the objective is tested by questions (FIGURES.md, review
// finding 30).
//
// THE WALK. One glucose on the line. `ticks` is its position in sixtieths of a second of the figure's
// own clock, TICKS per step, so a station is a whole number of steps and Run moves between them at
// 1.1 s a step. Step forward and Step back jump a whole station and pause Run. Run walks to the end and
// stops; pressed at the end it starts the walk again from glucose. Nothing moves unless Run is on, and
// nothing moves while the clock is pinned (the bench's loop refuses to start).
//
// THE LEDGER is cumulative for the one glucose on the line, never per step, and it follows the walk:
//   atpSpent    steps 1 and 3, once each (they act on the one six-carbon molecule)
//   atpMade     steps 7 and 10, once for each lane that has passed them
//   nadhMade    step 6, once per lane;  pyruvateMade  step 10, once per lane
//   atpNet      atpMade − atpSpent: −1 after steps 1 and 2, −2 after 3 to 6, 0 after 7 to 9, +2 after 10
// Per fragment every figure is halved — a three-carbon fragment's share of one glucose — so the
// investment shows as 0.5 after step 1 and 1 after step 3, and the full walk nets +1. That is the
// arithmetic §7.2 asks a reader to be able to switch; halves are the honest per-fragment count of an
// ATP spent on the whole glucose before it was cut. The counts beside each step on a tall stage are
// halved the same way.
//
// THE COMMITTED STEP. Phosphofructokinase (step 3) is open while
//   I = (ATP / 3.8 mM) × (1 + citrate / 1 mM) / (1 + AMP / 0.1 mM)
// is at most 1, and shut above it. The constants are ILLUSTRATIVE, not the enzyme's measured ones: they
// are chosen so that the figure opens with the step open at a resting cell's levels (ATP 3, AMP 0.1,
// citrate 0.2 mM, I = 0.47), that raising ATP alone shuts it at 7 mM (6 is open), that from there one
// press of AMP (0.2 mM) opens it again, that ATP at 10 mM needs AMP at 0.3, and that citrate alone shuts
// it at 1.6 mM (1.4 is open). The real enzyme's response is graded and cooperative; a switch is the
// figure's simplification of §5.7's loop, in which ATP binds an inhibitory site of its own as well as the
// active site, AMP and ADP bind an activating site of their own and turn the enzyme back to its active
// shape, and citrate inhibits (§7.2 as the accuracy review of 2026-09-24 corrected it, finding 17, which
// replaced "displace"). AMP's term divides I, which is the form either mechanism would give, so the
// arithmetic takes no side; the words do, and nothing on the stage says or draws AMP pushing ATP off its
// site. On the controls' own grids I never equals 1
// (it would need 19 to divide ATP × (5 + 5 × citrate), and neither factor reaches 19), so no setting sits
// on the fence. When it is shut, `closedBy` names whichever of ATP and citrate has risen further from
// its resting level, as a ratio: ATP / 3 against (1 + citrate) / 1.2. AMP never shuts it. A shut step
// stops a glucose that has not yet taken step 3, and Run waits there; a glucose already past it goes on,
// and the ledger says the step is shut behind it.
//
// KNOCK-OUTS. Knocking out enzyme k removes step k. The walker is pulled back to station k − 1 if it was
// past it, and cannot pass it. `accumulating` is the molecule at station k − 1 and `drainedAway` the
// distinct molecules at stations k to 10; both are computed from the knock-out alone and never from where
// the walker is, so neither becomes true on its own as the clock runs. Triose phosphate isomerase (step
// 5) is the exception, because the other half of the cut does not need it: dihydroxyacetone phosphate
// piles up, the glyceraldehyde 3-phosphate lane runs the payoff alone, a glucose nets 0 ATP, 1 NADH and
// 1 pyruvate, and nothing drains away.
//
// THE DONORS. `donorForStep` names where the phosphate the current step adds came from: ATP at steps 1
// and 3, inorganic phosphate from solution at 6, 1,3-bisphosphoglycerate at 7 and phosphoenolpyruvate
// at 10; null at 2, 4, 5, 8 and 9, which add none (8 moves one within the molecule). FIGURES.md asks for
// the two ATP-making steps; the other three are the same question asked of the investment and of step
// 6. The ladder's values are §5.3's table (ch05 index.html): phosphoenolpyruvate −61.9, creatine
// phosphate −43.0, ATP −30.5 and glucose 6-phosphate −13.8 kJ/mol. Glucose 1-phosphate (−20.9) is left
// out, since no step here touches it, and the readout's title says "From". 1,3-Bisphosphoglycerate is
// NOT on that table, and the readout says so at every size with a dagger and a footnote under the rows:
// its ≈ −49 is the standard free energy of hydrolysis of its acyl phosphate, −49.4 kJ/mol (Berg,
// Tymoczko & Stryer's table of phosphoryl-transfer potentials), which §7.2 quotes as about 49 and places
// between creatine phosphate and the top rung.
//
// THE CARBONS are drawn atom for atom. The six-carbon chain has C1 at the top (at the left in the ladder)
// and aldolase cuts it between C3 and C4, so the upper lane takes C1–C3 as dihydroxyacetone phosphate
// and the lower lane C4–C6 as glyceraldehyde 3-phosphate, C1 at the top. The isomerase turns the upper
// lane's molecule end for end — its phosphate-bearing C1 becomes the new molecule's C3 — so from step 5
// the upper lane is drawn C3 at the top and the phosphate stays on the same atom through the step. Step 8
// is drawn as §7.2 and OpenStax describe it, the phosphate moving from carbon 3 to carbon 2; the mutase of
// a human or a yeast does that by way of a phosphate of its own, so nothing here claims that the
// phosphate step 10 hands to ADP is the very one an ATP put on in the first half.
//
// COMPOSITION. Three arrangements, chosen in `arrange()` from the stage's shape, so a pane's own size can
// never flip the choice:
//   line    a wide stage (760 px of drawing, and 210 px of height for it over the ledger): all eleven
//           stations in a row, the ledger under the line in three columns — the tallies, what the step
//           just did, and the ladder rungs
//   phase   a stage too short or too narrow for the line: one phase at a time, six stations, with the
//           other phase collapsed to a column that says what it cost or will earn; the ledger beside it.
//           Where a station would be under 46 px wide or its carbons under 7 px across, the names give
//           way to a two-line caption naming the step just taken and what it made, the enzymes to their
//           numbers, each currency pair to the one token that changes hands, joined to its arrow, and
//           the other phase's column to the stations, leaving the ledger to say what it cost or earned
//           (single tokens are used below 58 px of station, too, where a pair would crowd its neighbour)
//   ladder  a tall stage, which is every phone and a tablet held upright (below 800 px of viewport the
//           registry makes the stage 3/4): the line turned through 90 degrees and centred in at most
//           600 px, one phase at a time with the other as a summary row and the cut as two columns, or,
//           where the stage is tall enough for carbons 10 px across, all eleven stations at once. The
//           tallies go beneath as a five-row table, beside what the step just did
// The stage is 16/9, not the 21/9 a row of eleven seems to want: measured at 21/9, a 1280 px window gave
// the walk 176 px of height and carbons 6 px across, and an 800 px window gave it 81 px, drawn under the
// toolbar. Names that do not fit a station's width are broken where the chemistry breaks them (`tight`),
// not shrunk: the floor is 7.2 px of type, and no enzyme is named by an abbreviation §7.2 never uses. On
// a phone the three committed-step sliders are steppers and keep their desktop labels, because an item's
// goal quotes them, and their unit, because a bare 3 is not a concentration; the three need about 450 px
// in a row and a 390 px phone's toolbar has 352, so they wrap to two rows rather than the one FIGURES.md
// asks for.
//
// MOTION. Run moves the glucose along the arrows: the arrow to the next station fills and the next
// molecule fades in as it does. Step jumps to the next station. Nothing else moves.
//
// WHAT THE BENCH COULD NOT DO, and where the figure drops through. A readout row, a note and a label are
// plain text, and NAD⁺ and Pᵢ need a superscript and a subscript: those strings are written with `^+` and
// `_i`, and `typeset()` rebuilds them as tspans after each draw, so the character is never a Unicode
// superscript the font census would have to find. A step's number is a bold tspan in front of its
// enzyme's name, made with el('tspan'). A readout accents a row's value and never its label, so the two
// ladder rungs in play have their labels recoloured after drawing, found by their words. And the ladder's
// unit, kJ/mol, is a column head the bench sets in capitals, which would print it KJ/MOL; that one text is
// given `text-transform: none` after drawing.
import { C, el, clamp, lerp } from './lib/svg.js';
import { INK, element } from './lib/mol-draw.js';
import { metabolismPart } from '../palette.js';
import { bench, wrapText, fmt } from './lib/bench.js';

export const meta = {
  kind: 'glycolysis',
  title: 'Ten steps, two halves',
  needsWebGL: false,
  aspect: 16 / 9,
  narrowAspect: 3 / 4,
};

// ---------------------------------------------------------------- the pathway

const TICKS = 66; // sixtieths of a second per step under Run
const STEPS = 10;

// The committed step. Illustrative constants: see THE COMMITTED STEP above.
const K_ATP = 3.8;
const K_AMP = 0.1;
const K_CIT = 1;
const REST = Object.freeze({ atp: 3, amp: 0.1, cit: 0.2 });

export function inhibition({ atp, amp, cit }) {
  return ((atp / K_ATP) * (1 + cit / K_CIT)) / (1 + amp / K_AMP);
}

export function closedByOf(env) {
  if (inhibition(env) <= 1) return null;
  return (1 + env.cit) / (1 + REST.cit) > env.atp / REST.atp ? 'citrate' : 'atp';
}

// Every intermediate: its name, its lines at a station's width (`tight` where a station is narrow),
// its carbon count and which carbons carry a phosphate (0 is C1).
const MOL = Object.freeze({
  glucose: { name: 'glucose', lines: ['glucose'], c: 6, p: [] },
  g6p: { name: 'glucose 6-phosphate', lines: ['glucose', '6-phosphate'], c: 6, p: [5] },
  f6p: { name: 'fructose 6-phosphate', lines: ['fructose', '6-phosphate'], c: 6, p: [5] },
  f16bp: { name: 'fructose 1,6-bisphosphate', lines: ['fructose 1,6-', 'bisphosphate'], tight: ['fructose', '1,6-bis-', 'phosphate'], c: 6, p: [0, 5] },
  dhap: { name: 'dihydroxyacetone phosphate', lines: ['dihydroxyacetone', 'phosphate'], tight: ['dihydroxy-', 'acetone', 'phosphate'], c: 3, p: [0] },
  g3p: { name: 'glyceraldehyde 3-phosphate', lines: ['glyceraldehyde', '3-phosphate'], tight: ['glycer-', 'aldehyde', '3-phosphate'], c: 3, p: [2] },
  bpg: { name: '1,3-bisphosphoglycerate', lines: ['1,3-bisphospho-', 'glycerate'], tight: ['1,3-bis-', 'phospho-', 'glycerate'], c: 3, p: [0, 2] },
  pg3: { name: '3-phosphoglycerate', lines: ['3-phospho-', 'glycerate'], c: 3, p: [2] },
  pg2: { name: '2-phosphoglycerate', lines: ['2-phospho-', 'glycerate'], c: 3, p: [1] },
  pep: { name: 'phosphoenolpyruvate', lines: ['phosphoenol-', 'pyruvate'], tight: ['phospho-', 'enol-', 'pyruvate'], c: 3, p: [1] },
  pyruvate: { name: 'pyruvate', lines: ['pyruvate'], c: 3, p: [] },
});

// What sits at each station: one molecule before the cut, then [upper lane, lower lane].
const AT = Object.freeze([
  ['glucose'], ['g6p'], ['f6p'], ['f16bp'],
  ['dhap', 'g3p'], ['g3p', 'g3p'], ['bpg', 'bpg'], ['pg3', 'pg3'], ['pg2', 'pg2'], ['pep', 'pep'], ['pyruvate', 'pyruvate'],
]);

// The enzyme of each step, and its name in lines under its arrow. §7.2 names only hexokinase and
// phosphofructokinase, so every name here is the full one, broken, never an abbreviation.
const ENZ = Object.freeze([
  null,
  { name: 'hexokinase', lines: ['hexokinase'] },
  { name: 'phosphoglucose isomerase', lines: ['phosphoglucose', 'isomerase'], tight: ['phospho-', 'glucose', 'isomerase'] },
  { name: 'phosphofructokinase', lines: ['phospho-', 'fructokinase'] },
  { name: 'aldolase', lines: ['aldolase'] },
  { name: 'triose phosphate isomerase', lines: ['triose', 'phosphate', 'isomerase'] },
  { name: 'glyceraldehyde 3-phosphate dehydrogenase', lines: ['glyceraldehyde', '3-phosphate', 'dehydrogenase'], tight: ['glycer-', 'aldehyde', '3-phosphate', 'dehydrogenase'] },
  { name: 'phosphoglycerate kinase', lines: ['phospho-', 'glycerate kinase'], tight: ['phospho-', 'glycerate', 'kinase'] },
  { name: 'phosphoglycerate mutase', lines: ['phospho-', 'glycerate mutase'], tight: ['phospho-', 'glycerate', 'mutase'] },
  { name: 'enolase', lines: ['enolase'] },
  { name: 'pyruvate kinase', lines: ['pyruvate', 'kinase'] },
]);

const DONOR = Object.freeze({ 1: 'ATP', 3: 'ATP', 6: 'inorganic phosphate', 7: '1,3-bisphosphoglycerate', 10: 'phosphoenolpyruvate' });

// From §5.3's ladder, top down, named and valued as that section's table prints them; the dagger marks
// the one compound that is not on it.
const LADDER = Object.freeze([
  { id: 'pep', label: 'Phosphoenolpyruvate', kj: '−61.9' },
  { id: 'bpg', label: '1,3-Bisphosphoglycerate†', kj: '≈ −49' },
  { id: 'crp', label: 'Creatine phosphate', kj: '−43.0' },
  { id: 'atp', label: 'ATP', kj: '−30.5', strong: true },
  { id: 'g6p', label: 'Glucose 6-phosphate', kj: '−13.8' },
]);
const FOOTNOTE = '† Not on Section\u00a05.3’s table; shown where it belongs.';
// Which rung gives the current step's phosphate, and which rung it lands on.
const LADDER_MARK = Object.freeze({ 1: { from: 'atp', to: 'g6p' }, 3: { from: 'atp' }, 6: { to: 'bpg' }, 7: { from: 'bpg', to: 'atp' }, 10: { from: 'pep', to: 'atp' } });

const CARBON = element('C');
const PHOS = element('P');
const ATP_PART = metabolismPart('atp');
const NAD_PART = metabolismPart('electronCarrier');
const NADH_PART = metabolismPart('electronCarrierLoaded');
const PI_PART = Object.freeze({ color: PHOS.fill, symbolColor: PHOS.label });
// ADP is drawn in the currency's colour: palette.js refuses it a colour of its own.
const CURRENCY = Object.freeze({
  1: { give: ['ATP', ATP_PART], get: ['ADP', ATP_PART] },
  3: { give: ['ATP', ATP_PART], get: ['ADP', ATP_PART] },
  6: { give: ['NAD^+', NAD_PART], get: ['NADH', NADH_PART] },
  7: { give: ['ADP', ATP_PART], get: ['ATP', ATP_PART] },
  10: { give: ['ADP', ATP_PART], get: ['ATP', ATP_PART] },
});

// An estimate of a string's advance, a little wider than the bench's 0.53 em because most of these
// labels are set at 600 or in capitals.
const EM = 0.55;
const widthOf = (str, size, em = EM) => plain(str).length * size * em;
const f2 = (v) => fmt(v, 2);
const round = (v, dp = 3) => Number(Number(v).toFixed(dp));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const count = (v) => (Number.isInteger(v) ? String(v) : fmt(v, 1));
const signed = (v) => (v > 0 ? `+${count(v)}` : v < 0 ? `−${count(-v)}` : '0');
const spoken = (v) => (v > 0 ? `plus ${count(v)}` : v < 0 ? `minus ${count(-v)}` : 'zero');

// ---------------------------------------------------------------- typesetting
//
// `_i` and `^+` in a string become a subscript and a superscript tspan; `plain` strips the marks for
// the live region. The same pair calvin-cycle.js carries.
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

const CSS = (scope) => `
${scope} .gl-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.08em; }
${scope} .gl-head.is-now { fill: var(--ink); }
${scope} .gl-name { fill: var(--ink-soft); }
${scope} .gl-name.is-now { fill: var(--ink); font-weight: 600; }
${scope} .gl-faint { fill: var(--ink-faint); }
${scope} .gl-enz { fill: var(--ink-soft); }
${scope} .gl-enz.is-now { fill: var(--ink); font-weight: 600; }
${scope} .gl-num { font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
${scope} .gl-alert { fill: var(--coral-text); font-weight: 600; }
${scope} .gl-note { fill: var(--ink-soft); }
${scope} .gl-tab { font-variant-numeric: lining-nums tabular-nums; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const NARROW_W = 700;
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 20260924 });

  const env = { atp: REST.atp, amp: REST.amp, cit: REST.cit, per: 'glucose', ko: 0 };
  let ticks = 0; // the walker's position, TICKS per station
  let clockTicks = 0; // how long Run has run, in sixtieths
  // What the last press refused, when it refused: 'end', 'knocked', 'shut' or 'start'.
  let note = null;
  let mode = 'line';
  // Set while one press moves other controls (Reset puts five back; a step pauses Run), so each of them
  // does not draw and speak on its own before the press has.
  let hush = false;

  const isOpen = () => inhibition(env) <= 1;
  const limit = () => (env.ko && env.ko !== 5 ? env.ko - 1 : STEPS);

  // ---- panes ----
  const walk = b.pane('walk', {
    as: 'svg',
    focus: true,
    aria: 'The ten steps of glycolysis as a line, each molecule a chain of carbon atoms with its phosphate groups, the enzyme of each step under its arrow, and the ATP, NAD+ and phosphate each step takes or gives. Press the right arrow to step forward, the left arrow to step back, Space to run, Home to reset, G or F to count the ledger per glucose or per fragment.',
  });
  const ledger = b.pane('ledger', { as: 'svg' });

  // One grid, written in properties `arrange()` sets from the stage's shape; the fallbacks are the line.
  const GRID = {
    columns: 'var(--gl-cols, minmax(0, 1fr))',
    rows: 'var(--gl-rows, minmax(0, 1fr) minmax(0, 120px))',
    at: { walk: [1, 1], ledger: ['var(--gl-lc, 1)', 'var(--gl-lr, 2)'] },
  };
  b.compose({ wide: GRID, narrow: GRID });

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

  // ---- controls: walk it; count it; break it; regulate it ----
  b.action('Step back', () => back(), { short: 'Back', aria: 'Step back, undo the last step' });
  b.action('Step forward', () => forward(), { primary: true, short: 'Forward', aria: 'Step forward, take the next step' });
  const runCtl = b.run({
    primary: false,
    onChange: (on) => {
      if (on && ticks >= limit() * TICKS) ticks = 0;
      note = null;
      changed();
    },
  });
  b.action('Reset', () => reset(), { aria: 'Reset, put the pathway back as it opened' });
  b.divide();

  const pickPer = b.choice('Ledger', [
    { id: 'glucose', label: 'Per glucose', short: 'Glucose', aria: 'Per glucose, count the tallies for one glucose' },
    { id: 'fragment', label: 'Per fragment', short: 'Fragment', aria: 'Per fragment, count the tallies for one three-carbon fragment, half a glucose' },
  ], (id) => {
    env.per = id;
    changed();
  }, { value: 'glucose', segmented: true });
  b.divide();

  const koCtl = b.stepper('Knock out', {
    min: 0, max: STEPS, step: 1, value: 0,
    format: (v, { narrow }) => (Number(v) === 0 ? 'none' : narrow ? String(v) : `step ${v}`),
    valueText: (v) => (v === 0 ? 'none' : `step ${v}, ${ENZ[v].name}`),
    onInput: (v) => {
      env.ko = Math.round(Number(v));
      note = null;
      if (ticks > limit() * TICKS) ticks = limit() * TICKS;
      changed();
    },
  });
  b.divide();

  const level = (label, key, { min, max, step, dp }) => b.stepper(label, {
    min, max, step, value: REST[key],
    format: (v) => `${fmt(v, dp)}\u00a0mM`,
    valueText: (v) => `${fmt(v, dp)} mM`,
    onInput: (v) => {
      env[key] = round(v, 1);
      note = null;
      changed();
    },
  });
  const atpCtl = level('ATP', 'atp', { min: 1, max: 10, step: 1, dp: 0 });
  const ampCtl = level('AMP', 'amp', { min: 0, max: 1, step: 0.1, dp: 1 });
  const citCtl = level('Citrate', 'cit', { min: 0, max: 2, step: 0.2, dp: 1 });

  b.keys({
    ArrowRight: () => forward(),
    ArrowLeft: () => back(),
    ' ': () => runCtl.toggle(),
    Home: () => reset(),
    g: () => pickPer.set('glucose'),
    G: () => pickPer.set('glucose'),
    f: () => pickPer.set('fragment'),
    F: () => pickPer.set('fragment'),
  });

  // ---- reader actions ----
  function forward() {
    if (b.playing) quietly(() => runCtl.set(false));
    note = null;
    const next = Math.floor(ticks / TICKS) + 1;
    if (next > STEPS) note = 'end';
    else if (next > limit()) note = 'knocked';
    else if (!isOpen() && next === 3 && ticks <= 2 * TICKS) note = 'shut';
    else ticks = next * TICKS;
    b.redraw();
    b.announce();
  }

  function back() {
    if (b.playing) quietly(() => runCtl.set(false));
    note = null;
    const prev = Math.ceil(ticks / TICKS) - 1;
    if (prev < 0) note = 'start';
    else ticks = prev * TICKS;
    b.redraw();
    b.announce();
  }

  function reset() {
    quietly(() => {
      runCtl.set(false);
      env.per = 'glucose';
      pickPer.set('glucose', { quiet: true });
      koCtl.set(0);
      atpCtl.set(REST.atp);
      ampCtl.set(REST.amp);
      citCtl.set(REST.cit);
    });
    b.restart();
    b.announce();
  }

  b.clock({
    step: 1 / 60,
    advance() {
      if (!b.playing) return;
      clockTicks += 1;
      const lim = limit() * TICKS;
      const stop = !isOpen() && ticks <= 2 * TICKS ? Math.min(2 * TICKS, lim) : lim;
      if (ticks < stop) ticks += 1;
      if (ticks >= lim) runCtl.set(false);
    },
    restart() {
      ticks = 0;
      clockTicks = 0;
      note = null;
    },
  });

  // ---- the state, read by the drawing, the ledger and describe() ----
  function walkState() {
    const pos = ticks / TICKS;
    const s = Math.floor(ticks / TICKS);
    return { pos, s, frac: pos - s, open: isOpen() };
  }
  // Where a lane has got to. The upper lane stops at dihydroxyacetone phosphate when its isomerase is out.
  function lanePos(st, lane) {
    return lane === 'up' && env.ko === 5 ? Math.min(st.pos, 4) : st.pos;
  }
  const perFactor = () => (env.per === 'fragment' ? 0.5 : 1);
  function ledgerNow() {
    const s = Math.floor(ticks / TICKS);
    const lanes = s >= 4 ? [env.ko === 5 ? Math.min(s, 4) : s, s] : [];
    const spent = Number(s >= 1) + Number(s >= 3);
    const made = lanes.reduce((n, x) => n + Number(x >= 7) + Number(x >= 10), 0);
    const nadh = lanes.reduce((n, x) => n + Number(x >= 6), 0);
    const pyr = lanes.reduce((n, x) => n + Number(x >= 10), 0);
    const k = perFactor();
    return { spent: spent * k, made: made * k, net: (made - spent) * k, nadh: nadh * k, pyr: pyr * k };
  }
  function accumulating() {
    if (!env.ko) return null;
    if (env.ko === 5) return MOL.dhap.name;
    return MOL[AT[env.ko - 1][0]].name;
  }
  function drainedAway() {
    if (!env.ko || env.ko === 5) return [];
    const names = [];
    for (let i = env.ko; i <= STEPS; i += 1) {
      for (const id of AT[i]) if (!names.includes(MOL[id].name)) names.push(MOL[id].name);
    }
    return names;
  }

  function state() {
    const s = Math.floor(ticks / TICKS);
    const L = ledgerNow();
    const open = isOpen();
    return {
      step: s,
      phase: s <= 5 ? 'investment' : 'payoff',
      carbonsPerMolecule: s <= 3 ? 6 : 3,
      moleculesInFlight: s <= 3 ? 1 : 2,
      atpSpent: L.spent,
      atpMade: L.made,
      atpNet: L.net,
      nadhMade: L.nadh,
      pyruvateMade: L.pyr,
      ledgerPer: env.per,
      committedStepOpen: open,
      closedBy: open ? null : closedByOf(env),
      atpMM: round(env.atp, 1),
      ampMM: round(env.amp, 1),
      citrateMM: round(env.cit, 1),
      knockedOut: env.ko ? ENZ[env.ko].name : null,
      accumulating: accumulating(),
      drainedAway: drainedAway(),
      donorForStep: DONOR[s] ?? null,
      t: round(clockTicks / 60, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // ---------------------------------------------------------------- words
  //
  // Every sentence is read in every state its parts can take: per glucose and per fragment, with the
  // isomerase knocked out (one lane in the payoff), and with the committed step shut ahead of or behind
  // the glucose. Numbers come from the ledger, never from a sentence's own arithmetic.

  const lanesText = () => (env.ko === 5 ? 'The one fragment' : 'Each fragment');
  const perWord = () => `per ${env.per}`;

  function nowSentence(short) {
    const s = Math.floor(ticks / TICKS);
    const L = ledgerNow();
    switch (s) {
      case 0: return short ? 'One glucose, nothing spent yet.' : 'One glucose, six carbons, and nothing spent yet.';
      case 1: return short ? 'An ATP spent: glucose 6-phosphate cannot leave the cell.' : 'Hexokinase has spent an ATP to put a phosphate on carbon 6. Charged, glucose 6-phosphate cannot leave the cell.';
      case 2: return short ? 'Glucose rearranged to fructose, spending nothing.' : 'The sugar is rearranged from glucose to fructose, spending nothing.';
      case 3: return short ? 'The second ATP: the committed step.' : 'The second ATP, on carbon 1. This is the committed step: fructose 1,6-bisphosphate has nowhere else to go.';
      case 4: return short ? 'Six carbons cut into two threes.' : 'Aldolase cuts the six carbons into two three-carbon pieces, each carrying a phosphate.';
      case 5:
        if (env.ko === 5) return short ? 'Only one piece goes on.' : 'With its isomerase knocked out, dihydroxyacetone phosphate cannot become glyceraldehyde 3-phosphate, and only one piece goes on.';
        return short ? 'Both pieces are now the same.' : 'Dihydroxyacetone phosphate becomes a second glyceraldehyde 3-phosphate, so both pieces run the second half.';
      case 6: return short ? 'Oxidised, with a phosphate from solution: above ATP now.' : `${lanesText()} is oxidised, reducing an NAD^+, and takes a phosphate ion from solution. 1,3-Bisphosphoglycerate is not on Section\u00a05.3’s table, but its new phosphate belongs above ATP, at about −49 kJ/mol.`;
      case 7: {
        if (short) return 'ATP from 1,3-bisphosphoglycerate, above ATP on the ladder.';
        const even = L.net === 0 ? 'The ATP made now equals the ATP spent.' : `Net ATP is ${signed(L.net)} ${perWord()}.`;
        return `${env.ko === 5 ? 'The one' : 'Each'} 1,3-bisphosphoglycerate hands its new phosphate to ADP. It came from above ATP on Section\u00a05.3’s ladder, and the sugar’s oxidation paid for it. ${even}`;
      }
      case 8: return 'The remaining phosphate moves from carbon 3 to carbon 2.';
      case 9: return short ? 'Water out: phosphoenolpyruvate.' : 'Enolase takes out a water, and phosphoenolpyruvate is the result.';
      default:
        if (short) return 'ATP from phosphoenolpyruvate, the top of the ladder.';
        return `${env.ko === 5 ? 'The one' : 'Each'} phosphoenolpyruvate, at the top of Section\u00a05.3’s table at −61.9\u00a0kJ/mol, hands its phosphate to ADP: the same trick as step 7. Net ATP is ${signed(L.net)} ${perWord()}.`;
    }
  }

  // The committed step's state, or null when there is nothing to say about it.
  function statusSentence(short) {
    const s = Math.floor(ticks / TICKS);
    const by = closedByOf(env);
    if (!by) {
      const moved = env.atp !== REST.atp || env.amp !== REST.amp || env.cit !== REST.cit;
      return moved ? { text: short ? 'The committed step is open.' : 'The committed step is open at these levels.', alert: false } : null;
    }
    const what = by === 'atp' ? 'ATP' : 'citrate';
    if (s >= 3) {
      return { text: short ? `Shut by ${what}, behind this glucose.` : `${cap(what)} has shut the committed step behind this glucose: the next one would stop before step 3.`, alert: true };
    }
    if (short) return { text: `Shut by ${what}: it stops before step 3.`, alert: true };
    if (by === 'atp') return { text: 'ATP has shut the committed step: phosphofructokinase holds its inactive shape, and the line stops before step 3. Raise AMP to open it.', alert: true };
    return { text: 'Citrate has shut the committed step, a message from the next section’s cycle that there is fuel enough. The line stops before step 3.', alert: true };
  }

  function knockSentence(short) {
    if (!env.ko) return null;
    if (env.ko === 5) {
      return short
        ? 'Isomerase out: dihydroxyacetone phosphate piles up.'
        : 'Triose phosphate isomerase is knocked out. Dihydroxyacetone phosphate piles up, and only one of the two pieces runs the second half.';
    }
    const acc = accumulating();
    if (short) return `Step ${env.ko} out: ${acc} piles up.`;
    return `${cap(ENZ[env.ko].name)} is knocked out. ${cap(acc)} piles up before step ${env.ko}, and everything after it drains away.`;
  }

  // What the phase not on show did or will do: its head, and one sentence about it.
  function otherPhase(inv) {
    const k = perFactor();
    if (!inv) return { head: 'INVESTMENT · STEPS 1–5', text: `It cost ${count(2 * k)} ATP ${perWord()} before anything was earned.` };
    const head = 'PAYOFF · STEPS 6–10';
    if (env.ko && env.ko <= 4) return { head, text: `Nothing reaches it while step ${env.ko} is knocked out.` };
    if (!isOpen() && Math.floor(ticks / TICKS) < 3) return { head, text: 'Nothing reaches it while the committed step is shut.' };
    if (env.ko >= 6) return { head, text: `It stops at ${accumulating()}: step ${env.ko} is knocked out.` };
    const lanes = env.ko === 5 ? 1 : 2;
    return { head, text: `${env.ko === 5 ? 'Run by one piece, it' : 'It'} earns ${count(2 * lanes * k)} ATP and ${count(lanes * k)} NADH ${perWord()}.` };
  }

  const NOTE_WORDS = {
    end: 'Pyruvate is the end of the line. ',
    start: 'This is the start of the line. ',
  };
  function noteWords() {
    if (!note) return '';
    if (note === 'knocked') return `Step ${limit() + 1}’s enzyme, ${ENZ[limit() + 1].name}, is knocked out: nothing passes it. `;
    if (note === 'shut') return `Phosphofructokinase is shut by ${closedByOf(env) === 'citrate' ? 'citrate' : 'ATP'}: step 3 cannot be taken. `;
    return NOTE_WORDS[note] ?? '';
  }

  b.onAnnounce((d) => {
    const where = d.step === 0 ? 'Before step 1: one glucose.' : `Step ${d.step}, ${ENZ[d.step].name}.`;
    const books = `Per ${d.ledgerPer}: net ATP ${spoken(d.atpNet)}, ${count(d.atpSpent)} spent and ${count(d.atpMade)} made; NADH ${count(d.nadhMade)}; pyruvate ${count(d.pyruvateMade)}.`;
    const status = statusSentence(true);
    const knock = knockSentence(true);
    return plain(`${noteWords()}${where} ${nowSentence(true)} ${books}${status ? ` ${status.text}` : ''}${knock ? ` ${knock}` : ''}`);
  });

  // ---------------------------------------------------------------- the molecules

  const drainedAt = (i, lane) => {
    if (!env.ko) return false;
    if (env.ko === 5) return lane === 'up' && i >= 5;
    return i >= env.ko;
  };
  const isPile = (i, lane) => {
    if (!env.ko) return false;
    if (env.ko === 5) return lane === 'up' && i === 4;
    return i === env.ko - 1;
  };
  // How a station's molecule on one lane is drawn: 'full', 'entering' (fading in under Run), 'future'
  // (faint, not yet reached) or 'drained' (past a knocked-out step: an outline with nothing in it).
  function lookOf(st, i, lane) {
    if (drainedAt(i, lane)) return 'drained';
    if (isPile(i, lane)) return 'full';
    const p = lanePos(st, lane);
    if (p >= i) return 'full';
    if (p > i - 1) return 'entering';
    return 'future';
  }
  // The state of step k's arrow on one lane.
  function arrowOf(st, k, lane) {
    if (env.ko) {
      if (env.ko === 5) {
        if (lane === 'up' && k >= 5) return { kind: 'dead' };
      } else if (k >= env.ko) return { kind: 'dead' };
    }
    const p = lanePos(st, lane);
    if (p >= k) return { kind: 'reached' };
    if (p > k - 1) return { kind: 'progress', frac: p - (k - 1) };
    return { kind: 'future' };
  }

  // A molecule: its carbons in a chain along `orient` ('v', down the page, or 'h', across it), each
  // phosphate beside its carbon (to the right, or below). `flip` draws the chain end for end. The
  // composite is centred on (cx, cy) whatever it carries, so every station's arrows are the same length.
  function molecule(pane, id, cx, cy, r, { orient = 'v', flip = false, look = 'full', frac = 0, ghosts = null } = {}) {
    const m = MOL[id];
    const sp = 2.3 * r;
    const off = m.p.length ? 1.2825 * r : 0;
    const rP = 1.15 * r;
    const atom = (j, dx, dy) => {
      const t = (flip ? m.c - 1 - j : j) - (m.c - 1) / 2;
      return orient === 'v' ? [cx - off + dx, cy + t * sp + dy] : [cx + t * sp + dx, cy - off + dy];
    };
    const phos = (j, dx, dy) => {
      const [x, y] = atom(j, dx, dy);
      return orient === 'v' ? [x + 1.05 * sp, y] : [x, y + 1.05 * sp];
    };
    const draw = (dx, dy, style, parent, letters) => {
      const bondAttrs = style === 'drained'
        ? { stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '1.6 1.6' }
        : { stroke: C.soft, 'stroke-width': f2(Math.max(0.8, r * 0.46)), 'stroke-linecap': 'round' };
      for (let j = 0; j < m.c - 1; j += 1) {
        const [x1, y1] = atom(j, dx, dy);
        const [x2, y2] = atom(j + 1, dx, dy);
        pane.line(x1, y1, x2, y2, bondAttrs, parent);
      }
      for (const j of m.p) {
        const [x1, y1] = atom(j, dx, dy);
        const [x2, y2] = phos(j, dx, dy);
        pane.line(x1, y1, x2, y2, bondAttrs, parent);
      }
      const edge = f2(Math.max(0.7, r * 0.17));
      for (let j = 0; j < m.c; j += 1) {
        const [x, y] = atom(j, dx, dy);
        pane.circle(x, y, r, style === 'drained'
          ? { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '1.8 1.5' }
          : { fill: CARBON.fill, stroke: 'var(--paper-2)', 'stroke-width': edge }, parent);
      }
      for (const j of m.p) {
        const [x, y] = phos(j, dx, dy);
        pane.circle(x, y, rP, style === 'drained'
          ? { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '1.8 1.5' }
          : { fill: PHOS.fill, stroke: 'var(--paper-2)', 'stroke-width': edge }, parent);
        if (letters && rP >= 5.4) {
          const fs = rP * 1.28;
          pane.text(x, y + fs * 0.36, 'P', { anchor: 'middle', 'font-size': fmt(fs), 'font-weight': 600, style: `fill:${PHOS.label}`, parent });
        }
      }
    };
    if (ghosts) {
      // A pile: two more of the same, behind, a little further on each time.
      for (const n of [2, 1]) {
        const g = pane.group({ opacity: n === 2 ? 0.25 : 0.45 });
        draw(ghosts[0] * 0.8 * r * n, ghosts[1] * 0.8 * r * n, 'full', g, false);
      }
    }
    if (look === 'full') draw(0, 0, 'full', pane.node, true);
    else if (look === 'drained') draw(0, 0, 'drained', pane.node, false);
    else {
      const g = pane.group({ opacity: fmt(look === 'entering' ? lerp(0.32, 1, clamp(frac, 0, 1)) : 0.32, 3) });
      draw(0, 0, 'full', g, false);
    }
  }
  // Which way a pile's copies are pushed: away from whatever is beside the lane, on the line (chains
  // down the page) and on the ladder (chains across it).
  const GHOST_V = { spine: [1, -1], up: [1, 1], low: [1, -1] };
  const GHOST_H = { spine: [1, 1], up: [-1, 1], low: [1, 1] };

  // A chevron's two strokes, its point at (x, y), pointing r(ight), l(eft), d(own) or u(p).
  function chevron(pane, x, y, k, dir, attrs) {
    const w = k * 0.8;
    let d;
    if (dir === 'r') d = `M${f2(x - k)} ${f2(y - w)} L${f2(x)} ${f2(y)} L${f2(x - k)} ${f2(y + w)}`;
    else if (dir === 'l') d = `M${f2(x + k)} ${f2(y - w)} L${f2(x)} ${f2(y)} L${f2(x + k)} ${f2(y + w)}`;
    else if (dir === 'd') d = `M${f2(x - w)} ${f2(y - k)} L${f2(x)} ${f2(y)} L${f2(x + w)} ${f2(y - k)}`;
    else d = `M${f2(x - w)} ${f2(y + k)} L${f2(x)} ${f2(y)} L${f2(x + w)} ${f2(y + k)}`;
    pane.path(d, { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs });
  }

  const A_REACHED = { stroke: C.soft, 'stroke-width': 1.5 };
  const A_FUTURE = { stroke: C.ruleStrong, 'stroke-width': 1.3 };
  const A_DEAD = { stroke: C.ruleStrong, 'stroke-width': 1.2, 'stroke-dasharray': '3 2.6' };
  // The stroke of anything drawn in a lane's state at a step: passed, stranded by a knock-out, or not yet.
  const strokeOf = (kind) => (kind === 'reached' ? A_REACHED : kind === 'dead' ? A_DEAD : A_FUTURE);

  // One arrow along `d`, ending at `end`, drawn in the state of the step on that lane.
  function arrow(pane, d, end, dir, state, head, { noHead = false } = {}) {
    pane.path(d, { fill: 'none', ...strokeOf(state.kind) });
    if (state.kind === 'progress') pane.path(d, { fill: 'none', ...A_REACHED, pathLength: 1, 'stroke-dasharray': `${fmt(state.frac, 3)} 1` });
    if (!noHead && state.kind !== 'dead') chevron(pane, end[0], end[1], head, dir, state.kind === 'reached' ? A_REACHED : A_FUTURE);
  }

  // The phosphate ion's tick into one lane at step 6, drawn as that lane's arrow is: a lane stranded by
  // the isomerase's knock-out never takes one, so its tick is dashed and has no head.
  function piTick(pane, x1, y1, x2, y2, dir, kind) {
    if (Math.hypot(x2 - x1, y2 - y1) < 4) return;
    const a = { ...strokeOf(kind), 'stroke-width': 1 };
    pane.line(x1, y1, x2, y2, a);
    if (kind !== 'dead') chevron(pane, x2, y2, 2.4, dir, a);
  }

  function cross(pane, x, y, k) {
    const a = { stroke: C.coral, 'stroke-width': 1.9, 'stroke-linecap': 'round' };
    pane.line(x - k, y - k, x + k, y + k, a);
    pane.line(x - k, y + k, x + k, y - k, a);
  }

  // A currency token: an ellipse with its name on it, or its outline when it has not changed hands yet.
  function token(pane, x, y, rx, ry, str, part, lit, fs) {
    if (lit) pane.ellipse(x, y, rx, ry, { fill: part.color, stroke: part === ATP_PART ? C.soft : 'none', 'stroke-width': 0.8 });
    else pane.ellipse(x, y, rx, ry, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'stroke-dasharray': '2.2 1.8' });
    pane.text(x, y + fs * 0.36, str, { anchor: 'middle', 'font-size': fmt(fs), 'font-weight': 600, style: `fill:${lit ? part.symbolColor : 'var(--ink-faint)'}` });
  }
  const tokenRx = (strs, fs) => Math.max(...strs.map((s) => widthOf(s, fs, 0.66))) / 2 + 0.5 * fs;

  // ATP to ADP (or back), NAD⁺ to NADH: the pair either side of the arrow's middle, and the curve that
  // dips to the arrow and comes back, as a coupled reaction is drawn.
  function currencyPair(pane, gx, y, rx, ry, c, kind, dir, yArrow, fs) {
    const lit = kind === 'reached';
    const dx = rx + 1.5;
    const xl = gx - dx;
    const xr = gx + dx;
    token(pane, xl, y, rx, ry, c.give[0], c.give[1], lit, fs);
    token(pane, xr, y, rx, ry, c.get[0], c.get[1], lit, fs);
    const y1 = dir === 'down' ? y + ry + 0.5 : y - ry - 0.5;
    const yT = dir === 'down' ? yArrow - 2.2 : yArrow + 2.2;
    const ctl = y1 + (yT - y1) / 0.75;
    const a = { ...strokeOf(kind), 'stroke-width': 1.1 };
    pane.path(`M${f2(xl)} ${f2(y1)} C${f2(xl)} ${f2(ctl)} ${f2(xr)} ${f2(ctl)} ${f2(xr)} ${f2(y1)}`, { fill: 'none', ...a });
    if (kind !== 'dead') chevron(pane, xr, y1, 2.6, dir === 'down' ? 'u' : 'd', a);
  }

  // The one token that changes hands, and a stroke joining it to its arrow: pointing into the arrow for
  // what a step spends, out of it for what a step makes. On a lane a knock-out has stranded the stroke is
  // dashed and has no head, as that lane's arrows are: nothing changes hands there.
  function currencyOne(pane, x, y, rx, ry, str, part, kind, spends, yArrow, fs) {
    token(pane, x, y, rx, ry, str, part, kind === 'reached', fs);
    const down = yArrow > y;
    const y1 = down ? y + ry + 0.8 : y - ry - 0.8;
    const y2 = down ? yArrow - 2.4 : yArrow + 2.4;
    if (Math.abs(y2 - y1) < 4) return;
    const a = { ...strokeOf(kind), 'stroke-width': 1 };
    pane.line(x, y1, x, y2, a);
    if (kind === 'dead') return;
    if (spends) chevron(pane, x, y2, 2.3, down ? 'd' : 'u', a);
    else chevron(pane, x, y1, 2.3, down ? 'u' : 'd', a);
  }

  // The key to the drawing, right-aligned at (xr, y).
  function key(pane, xr, y, fs) {
    const rr = fs * 0.42;
    const wp = widthOf('phosphate', fs, 0.54);
    const wc = widthOf('carbon', fs, 0.54);
    let x = xr - wp;
    pane.text(x, y, 'phosphate', { class: 'gl-faint', 'font-size': fmt(fs) });
    pane.circle(x - rr - 3, y - fs * 0.34, rr, { fill: PHOS.fill });
    x -= 2 * rr + 3 + 10 + wc;
    pane.text(x, y, 'carbon', { class: 'gl-faint', 'font-size': fmt(fs) });
    pane.circle(x - rr - 3, y - fs * 0.34, rr, { fill: CARBON.fill });
  }

  // How an enzyme's label is set: knocked out, dead, the step just taken, passed, or not yet.
  function enzymeClass(st, k) {
    const states = (k <= 3 ? ['spine'] : ['up', 'low']).map((l) => arrowOf(st, k, l).kind);
    if (env.ko === k) return { cls: 'gl-alert', states };
    if (states.every((s) => s === 'dead')) return { cls: 'gl-faint', states };
    if (st.s === k && st.frac === 0) return { cls: 'gl-enz is-now', states };
    return { cls: states.some((s) => s === 'reached') ? 'gl-enz' : 'gl-faint', states };
  }

  // ---------------------------------------------------------------- the line (and one phase of it)

  function nameLinesOf(id, tight) {
    const m = MOL[id];
    return tight && m.tight ? m.tight : m.lines;
  }
  function enzLinesOf(k, tight) {
    const e = ENZ[k];
    return tight && e.tight ? e.tight : e.lines;
  }

  // Every band's height, from the top: the halves' heads, the names, the walker's caret, the upper
  // currency, the chains, the lower currency (and the lower lane's name at the cut), the enzymes, and in
  // the compact form a two-line caption. `compact` drops the names and the enzymes' words.
  function lineGeom(w, hgt, st, compact) {
    const phase = mode === 'phase';
    const inv = st.s <= 5;
    const first = phase && !inv ? 5 : 0;
    const last = phase && inv ? 5 : STEPS;
    // The compact form gives the other phase's column back to the stations: at 480 px of stage a
    // station 38 px wide put NADH's token on the neighbouring chains' phosphates. The ledger beside it
    // still carries what the other phase cost or earned.
    const summary = phase && !compact ? (inv ? 'right' : 'left') : null;
    const padX = 8;
    const sumW = summary ? clamp(w * 0.18, 66, 124) : 0;
    const n = last - first + 1;
    const pitch = Math.max(24, (w - 2 * padX - sumW) / n);
    const x0 = padX + (summary === 'left' ? sumW : 0);
    const X = (i) => x0 + (i - first + 0.5) * pitch;
    const GX = (k) => x0 + (k - first) * pitch;
    const tight = phase;
    const chars = tight ? 12 : 16;
    const fs = compact
      ? clamp(hgt / 18, 7.4, 9)
      : clamp(Math.min((pitch - 4) / (chars * EM), hgt / 19), 7.2, tight ? 10 : 10.4);
    const lh = fs * 1.18;
    const fsHead = clamp(fs * 0.9, 7.2, 9.4);
    const fsTok = Math.max(7, fs * 0.84);
    const tokRy = fsTok * 0.84;
    // Band sizes are taken over the whole pathway, not the stations on show, so the phase view keeps
    // its proportions when it turns from one half to the other.
    let nameN = 0;
    let enzN = 1;
    let lowName = 0;
    if (!compact) {
      for (let i = 0; i <= STEPS; i += 1) nameN = Math.max(nameN, nameLinesOf(AT[i][0], tight).length);
      for (let k = 1; k <= STEPS; k += 1) enzN = Math.max(enzN, enzLinesOf(k, tight).length + (k === 3 ? 1 : 0));
      lowName = nameLinesOf('g3p', tight).length;
    }
    const headH = fsHead + 10;
    const nameH = nameN * lh;
    const caretH = 9;
    const enzH = enzN * lh + 4;
    const capH = compact ? 2 * lh + 6 : 0;
    const rCap = Math.max(2.2, Math.min(10, (0.62 * pitch - 4) / 4.3));
    // A full stage gives the currency a band above and below the chains. The compact form's tokens are
    // single and stand between the stations, so the chains may rise into their band: a token needs only
    // the part of its reach (from its lane's arrow to its far edge) that the chains' own height does not
    // already give it. That is what buys an 800 px window's carbons 7.1 px across rather than 5.8.
    const reach = 9 + 2 * tokRy;
    let tokH;
    let bandD;
    let r;
    if (compact) {
      const avail = hgt - (headH + caretH + 2 + enzH + capH);
      const rInside = avail / 16.95;
      r = clamp(3.3 * rInside >= reach ? rInside : (avail - 2 * reach) / 10.35, 2.2, rCap);
      tokH = Math.max(0, reach - 3.3 * r);
      bandD = tokH + 2;
    } else {
      tokH = 2 * tokRy + 8;
      bandD = Math.max(tokH, lowName * lh + 4);
      r = clamp((hgt - (headH + nameH + caretH + tokH + bandD + enzH)) / 16.95, 2.2, rCap);
    }
    const fixed = headH + nameH + caretH + tokH + bandD + enzH + capH;
    const chainH = 16.95 * r;
    const top = Math.max(0, hgt - fixed - chainH) * 0.5;
    const yA0 = top + headH;
    const yK0 = yA0 + nameH;
    const yB0 = yK0 + caretH;
    const yC0 = yB0 + tokH;
    const yC = yC0 + chainH / 2;
    const sp = 2.3 * r;
    const yD0 = yC0 + chainH;
    const yE0 = yD0 + bandD;
    const halfW = 2.2825 * r;
    // A pair of tokens needs its curve to clear the chains either side of its arrow, and the two pairs
    // at steps 6 and 7 must not meet; below that, one token each.
    const pairRx = tokenRx(['NADH', 'NAD^+'], fsTok);
    const single = compact || pitch < 58 || pitch / 2 - halfW - 2 < pairRx + 1.5;
    // The spine's currency sits beside its own arrow when it fits between the stations; otherwise it
    // goes up with the lanes' in the band above the chains.
    const pairHalf = 2 * tokenRx(['ATP', 'ADP'], fsTok) + 1.5;
    const spineFit = single
      ? pitch - 2 * halfW - 6 >= 2 * tokenRx(['ATP'], fsTok)
      : pitch / 2 - halfW - 3 >= pairHalf;
    return {
      compact, single, first, last, summary, padX, sumW, n, pitch, x0, X, GX, tight, fs, lh, fsHead, fsTok, tokRy,
      nameN, enzN, r, sp, halfW, top,
      yHead: top + fsHead, yNameBase: yA0 + fs + (nameN - 1) * lh, yK0, yB0,
      yTokU: compact ? yC - 2.25 * sp - reach + tokRy : yB0 + tokRy + 1,
      yC0, yC, yU: yC - 2.25 * sp, yL: yC + 2.25 * sp, yD0,
      yTokL: compact ? yC + 2.25 * sp + reach - tokRy : yD0 + tokH - tokRy - 1, yE0,
      yCap0: yE0 + enzH, spineFit,
    };
  }

  function drawLine(w, hgt, st) {
    let g = lineGeom(w, hgt, st, false);
    if (mode === 'phase' && (g.pitch < 46 || g.r < 3.4)) g = lineGeom(w, hgt, st, true);
    const head = clamp(g.r * 1.05, 2.8, 5);

    // ---- the head: the two halves, and the key ----
    const inv = st.s <= 5;
    const yR = g.yHead + 4;
    const areaR = g.x0 + g.n * g.pitch;
    if (mode === 'line') {
      const xp = g.GX(6);
      walk.text(g.x0, g.yHead, 'INVESTMENT · STEPS 1–5', { class: `gl-head${inv ? ' is-now' : ''}`, 'font-size': fmt(g.fsHead) });
      walk.text(xp + 4, g.yHead, 'PAYOFF · STEPS 6–10', { class: `gl-head${inv ? '' : ' is-now'}`, 'font-size': fmt(g.fsHead) });
      walk.line(g.x0, yR, xp - 4, yR, { stroke: inv ? C.ink : C.ruleStrong, 'stroke-width': inv ? 1.2 : 1 });
      walk.line(xp + 4, yR, areaR, yR, { stroke: inv ? C.ruleStrong : C.ink, 'stroke-width': inv ? 1 : 1.2 });
    } else {
      walk.text(g.x0, g.yHead, inv ? 'INVESTMENT · STEPS 1–5' : 'PAYOFF · STEPS 6–10', { class: 'gl-head is-now', 'font-size': fmt(g.fsHead) });
      walk.line(g.x0, yR, areaR, yR, { stroke: C.ruleStrong, 'stroke-width': 1 });
    }
    key(walk, areaR, g.yHead, g.fsHead);

    // ---- arrows, under everything ----
    for (let k = g.first + 1; k <= g.last; k += 1) {
      const xa = g.X(k - 1) + g.halfW + 2;
      const xb = g.X(k) - g.halfW - 2;
      if (k <= 3) {
        arrow(walk, `M${f2(xa)} ${f2(g.yC)} L${f2(xb)} ${f2(g.yC)}`, [xb, g.yC], 'r', arrowOf(st, k, 'spine'), head);
      } else if (k === 4) {
        const xm = (xa + xb) / 2;
        for (const [lane, yT] of [['up', g.yU], ['low', g.yL]]) {
          arrow(walk, `M${f2(xa)} ${f2(g.yC)} C${f2(xm)} ${f2(g.yC)} ${f2(xm)} ${f2(yT)} ${f2(xb)} ${f2(yT)}`, [xb, yT], 'r', arrowOf(st, 4, lane), head);
        }
      } else {
        arrow(walk, `M${f2(xa)} ${f2(g.yU)} L${f2(xb)} ${f2(g.yU)}`, [xb, g.yU], 'r', arrowOf(st, k, 'up'), head);
        // At step 5 the lower lane's glyceraldehyde 3-phosphate only waits for the other one.
        arrow(walk, `M${f2(xa)} ${f2(g.yL)} L${f2(xb)} ${f2(g.yL)}`, [xb, g.yL], 'r', arrowOf(st, k, 'low'), head, { noHead: k === 5 });
      }
    }
    // The shut committed step: a bar across its arrow.
    if (g.first < 3 && g.last >= 3 && !st.open) {
      walk.line(g.GX(3), g.yC - 1.9 * g.r - 2, g.GX(3), g.yC + 1.9 * g.r + 2, { stroke: C.coral, 'stroke-width': 2.4 });
    }
    // A knocked-out step: a cross on each arrow it would have drawn.
    const ko = env.ko;
    if (ko && ko > g.first && ko <= g.last) {
      const k = clamp(g.r * 0.95, 2.6, 5);
      if (ko <= 3) cross(walk, g.GX(ko), g.yC, k);
      else if (ko === 4) {
        cross(walk, g.GX(4), (g.yC + g.yU) / 2, k);
        cross(walk, g.GX(4), (g.yC + g.yL) / 2, k);
      } else if (ko === 5) cross(walk, g.GX(5), g.yU, k);
      else {
        cross(walk, g.GX(ko), g.yU, k);
        cross(walk, g.GX(ko), g.yL, k);
      }
    }

    // ---- the molecules, and their names ----
    for (let i = g.first; i <= g.last; i += 1) {
      const lanes = i <= 3 ? [['spine', g.yC, false]] : [['up', g.yU, i >= 5], ['low', g.yL, false]];
      for (const [lane, y, flip] of lanes) {
        const id = i <= 3 ? AT[i][0] : AT[i][lane === 'up' ? 0 : 1];
        molecule(walk, id, g.X(i), y, g.r, { orient: 'v', flip, look: lookOf(st, i, lane), frac: st.frac, ghosts: isPile(i, lane) ? GHOST_V[lane] : null });
      }
      if (!g.compact) stationName(g, st, i);
    }
    // The walker: a caret over the station it is at, clear of the names' descenders.
    const cx = g.X(st.s);
    walk.path(`M${f2(cx - 3.6)} ${f2(g.yK0 + 2.4)} L${f2(cx + 3.6)} ${f2(g.yK0 + 2.4)} L${f2(cx)} ${f2(g.yK0 + 7.1)} Z`, { fill: C.ink });

    // ---- the currency, once per lane ----
    for (const k of [1, 3, 6, 7, 10]) {
      if (k <= g.first || k > g.last) continue;
      const c = CURRENCY[k];
      const spine = k <= 3;
      const kindOn = (lane) => arrowOf(st, k, lane).kind;
      if (g.single) {
        const [str, part] = spine ? c.give : c.get;
        const rx = tokenRx([str], g.fsTok);
        const one = (y, kind, yArrow) => currencyOne(walk, g.GX(k), y, rx, g.tokRy, str, part, kind, spine, yArrow, g.fsTok);
        if (spine) one(g.spineFit ? g.yU : g.yTokU, kindOn('spine'), g.yC);
        else {
          one(g.yTokU, kindOn('up'), g.yU);
          one(g.yTokL, kindOn('low'), g.yL);
        }
      } else {
        const rx = tokenRx([c.give[0], c.get[0]], g.fsTok);
        const pair = (y, kind, dir, yArrow) => currencyPair(walk, g.GX(k), y, rx, g.tokRy, c, kind, dir, yArrow, g.fsTok);
        if (spine) pair(g.spineFit ? g.yU : g.yTokU, kindOn('spine'), 'down', g.yC);
        else {
          pair(g.yTokU, kindOn('up'), 'down', g.yU);
          pair(g.yTokL, kindOn('low'), 'up', g.yL);
        }
      }
      if (k === 6) {
        // The phosphate ion from solution, between the lanes, one to each lane that takes the step.
        const prx = tokenRx(['P_i'], g.fsTok);
        const x = g.GX(6);
        piTick(walk, x, g.yC - g.tokRy - 1, x, g.yU + 2.5, 'u', kindOn('up'));
        piTick(walk, x, g.yC + g.tokRy + 1, x, g.yL - 2.5, 'd', kindOn('low'));
        token(walk, x, g.yC, prx, g.tokRy, 'P_i', PI_PART, kindOn('up') === 'reached' || kindOn('low') === 'reached', g.fsTok);
      }
    }

    // ---- the enzymes, under their arrows ----
    for (let k = g.first + 1; k <= g.last; k += 1) enzymeLabel(g, st, k);

    if (g.compact) captionLines(g, st);
    if (g.summary) summaryColumn(g, st);
  }

  function nameClass(st, i, lanes) {
    const looks = lanes.map((l) => lookOf(st, i, l));
    const any = looks.some((x) => x === 'full');
    if (any && st.s === i) return 'gl-name is-now';
    return any ? 'gl-name' : 'gl-faint';
  }

  function stationName(g, st, i) {
    const upper = i <= 3 ? ['spine'] : i === 4 ? ['up'] : ['up', 'low'];
    const lines = nameLinesOf(AT[i][0], g.tight);
    const cls = nameClass(st, i, upper);
    lines.forEach((ln, j) => walk.text(g.X(i), g.yNameBase - (lines.length - 1 - j) * g.lh, ln, { anchor: 'middle', class: cls, 'font-size': fmt(g.fs) }));
    if (i === 4) {
      // The lower lane's own name, under its chain.
      const low = nameLinesOf('g3p', g.tight);
      const lowCls = nameClass(st, 4, ['low']);
      low.forEach((ln, j) => walk.text(g.X(4), g.yD0 + g.fs + 1 + j * g.lh, ln, { anchor: 'middle', class: lowCls, 'font-size': fmt(g.fs) }));
    }
  }

  function enzymeLabel(g, st, k) {
    const { cls } = enzymeClass(st, k);
    const x = g.GX(k);
    const y0 = g.yE0 + g.fs + 1;
    if (g.compact) {
      // The caption names the step; under the arrow, only its number.
      walk.text(x, y0, String(k), { anchor: 'middle', class: `${cls} gl-num`, 'font-size': fmt(g.fs) });
      return;
    }
    const lines = enzLinesOf(k, g.tight);
    lines.forEach((ln, j) => {
      const t = walk.text(x, y0 + j * g.lh, j === 0 ? '' : ln, { anchor: 'middle', class: cls, 'font-size': fmt(g.fs) });
      if (j === 0) t.append(el('tspan', { class: 'gl-num', text: String(k) }), ` ${ln}`);
    });
    if (k === 3) {
      const by = closedByOf(env);
      const say = by ? (g.tight ? 'shut' : `shut by ${by === 'atp' ? 'ATP' : 'citrate'}`) : g.tight ? 'committed' : 'committed step';
      walk.text(x, y0 + lines.length * g.lh, say, { anchor: 'middle', class: by ? 'gl-alert' : 'gl-faint', 'font-size': fmt(g.fs) });
    }
  }

  // What the glucose is now, in words, for the compact caption.
  function nowWhat(s) {
    if (s <= 3) return MOL[AT[s][0]].name;
    if (s === 4) return `${MOL.dhap.name} and ${MOL.g3p.name}`;
    const name = MOL[AT[s][1]].name;
    return env.ko === 5 ? `${name}, on one lane only` : `${name}, one on each lane`;
  }

  // The compact form's caption: the step just taken, by number and name, and what is at the station.
  function captionLines(g, st) {
    const y0 = g.yCap0 + g.fs + 3;
    const t = walk.text(g.padX, y0, st.s === 0 ? 'Before step 1' : '', { class: 'gl-name is-now', 'font-size': fmt(g.fs) });
    if (st.s > 0) {
      t.append(el('tspan', { class: 'gl-num', text: String(st.s) }), ` ${ENZ[st.s].name}`);
      if (st.s === 3) {
        const by = closedByOf(env);
        t.append(el('tspan', { class: by ? 'gl-alert' : 'gl-faint', text: by ? ` · shut by ${by === 'atp' ? 'ATP' : 'citrate'}` : ' · committed step' }));
      }
    }
    walk.text(g.padX, y0 + g.lh, `now: ${nowWhat(st.s)}`, { class: 'gl-name', 'font-size': fmt(g.fs) });
  }

  // The phase that is not on show, as a head and one sentence in its own column, the pair centred on the
  // chains beside it so the head never meets the key over the stations.
  function summaryColumn(g, st) {
    const inv = st.s <= 5;
    const right = g.summary === 'right';
    const x = right ? g.x0 + g.n * g.pitch + 12 : g.padX;
    const width = g.sumW - 14;
    const other = otherPhase(inv);
    const head = inv ? ['PAYOFF', 'STEPS 6–10'] : ['INVESTMENT', 'STEPS 1–5'];
    const lines = wrapText(other.text, width, g.fs);
    const headStep = g.fsHead * 1.3;
    const block = g.fsHead + headStep + 6 + lines.length * g.lh;
    const top = g.yC - block / 2;
    head.forEach((ln, j) => walk.text(x, top + g.fsHead + j * headStep, ln, { class: 'gl-head', 'font-size': fmt(g.fsHead) }));
    const rule = right ? g.x0 + g.n * g.pitch + 3 : g.x0 - 3;
    walk.line(rule, g.yC0, rule, g.yD0, { stroke: C.rule, 'stroke-width': 1 });
    const y0 = top + g.fsHead + headStep + 6 + g.fs;
    lines.forEach((ln, j) => walk.text(x, y0 + j * g.lh, ln, { class: 'gl-note', 'font-size': fmt(g.fs) }));
  }

  // ---------------------------------------------------------------- the ladder (a tall stage)
  //
  // The line turned through 90 degrees, in a column at most 600 px wide and centred. Each station is a
  // row, each step a gap between rows with the enzyme and the currency in it. The plan is solved rather
  // than chosen: all eleven stations if their carbons can be 10 px across; otherwise one phase with the
  // other as a summary row, at the largest carbons that fit with roomy gaps, then with tight ones, then
  // without the summary row.

  function drawLadder(w, hgt, st) {
    const inv = st.s <= 5;
    const cw = Math.min(w, 600);
    const ox = Math.max(0, (w - cw) / 2);
    const pad = 6;
    const fs = clamp(cw / 40, 7.4, 11);
    const lh = fs * 1.2;
    const fsHead = clamp(fs * 0.92, 7.2, 9.4);
    const headH = fsHead + 9;
    const subH = fsHead + 12;
    const rMax = Math.max(2.4, Math.min(10, (cw * 0.36) / 16.65));
    const other = otherPhase(inv);
    const sumLines = wrapText(other.text, cw - 2 * pad, fs);
    const sumH = 5 + fsHead + 4 + sumLines.length * lh + 5;
    const stH = (i, r) => Math.max(4.565 * r, (i === 4 ? 2 : 1) * lh + 2);
    const span = (full) => (full ? [0, STEPS] : inv ? [0, 5] : [5, STEPS]);
    const height = (p, r) => {
      const [a, z] = span(p.full);
      let hh = headH + (p.full ? subH : 0) + (p.withSum ? sumH : 0) + (z - a) * p.gap;
      for (let i = a; i <= z; i += 1) hh += stH(i, r);
      return hh;
    };
    const solve = (p) => {
      if (height(p, 2.4) > hgt) return null;
      if (height(p, rMax) <= hgt) return rMax;
      let lo = 2.4;
      let hi = rMax;
      for (let i = 0; i < 30; i += 1) {
        const mid = (lo + hi) / 2;
        if (height(p, mid) <= hgt) lo = mid;
        else hi = mid;
      }
      return lo;
    };
    const roomy = Math.max(fs * 1.4, 11);
    const tightGap = Math.max(fs * 1.05, 9);
    let p = { full: true, gap: roomy, withSum: false };
    let r = solve(p);
    if (r === null || r < Math.min(5, rMax)) {
      const plans = [
        { full: false, gap: roomy, withSum: true },
        { full: false, gap: tightGap, withSum: true },
        { full: false, gap: tightGap, withSum: false },
      ];
      r = null;
      for (const q of plans) {
        p = q;
        r = solve(q);
        if (r !== null) break;
      }
      if (r === null) r = 2.4;
    }
    const [first, last] = span(p.full);
    const spare = Math.max(0, hgt - height(p, r));
    const gapH = p.gap + (spare * 0.8) / (last - first);

    const sp = 2.3 * r;
    const xS = ox + pad + 8.325 * r + 2;
    const xU = xS - (1.75 * sp + r);
    const xL = xS + (1.75 * sp + r);
    const xT = xS + 8.325 * r + 12;
    const xR = ox + cw - pad;
    const halfH = 2.2825 * r;

    // ---- the head: this phase (or the first, over the whole line), and the key ----
    let y = spare * 0.1;
    const headNow = p.full ? inv : true;
    walk.text(ox + pad, y + fsHead, p.full || inv ? 'INVESTMENT · STEPS 1–5' : 'PAYOFF · STEPS 6–10', { class: `gl-head${headNow ? ' is-now' : ''}`, 'font-size': fmt(fsHead) });
    key(walk, xR, y + fsHead, fsHead);
    walk.line(ox + pad, y + fsHead + 4, xR, y + fsHead + 4, { stroke: C.ruleStrong, 'stroke-width': 1 });
    y += headH;

    const summaryRow = (yy) => {
      walk.text(ox + pad, yy + 5 + fsHead, other.head, { class: 'gl-head', 'font-size': fmt(fsHead) });
      const base = yy + 5 + fsHead + 4 + fs;
      sumLines.forEach((ln, j) => walk.text(ox + pad, base + j * lh, ln, { class: 'gl-note', 'font-size': fmt(fs) }));
    };
    if (p.withSum && !inv) {
      summaryRow(y);
      y += sumH;
      walk.line(ox + pad, y - 2, xR, y - 2, { stroke: C.rule, 'stroke-width': 1 });
    }

    // Row positions first, so the arrows can be drawn under the molecules.
    const mid = {};
    const hh = {};
    const gapTop = {};
    const gapMid = {};
    for (let i = first; i <= last; i += 1) {
      const hRow = stH(i, r);
      mid[i] = y + hRow / 2;
      hh[i] = hRow;
      y += hRow;
      if (i < last) {
        const extra = p.full && i === 5 ? subH : 0;
        gapTop[i + 1] = y;
        gapMid[i + 1] = y + extra + gapH / 2;
        y += gapH + extra;
      }
    }
    const head = clamp(r * 1.05, 2.6, 4.6);
    for (let k = first + 1; k <= last; k += 1) {
      const ya = mid[k - 1] + halfH + 1.5;
      const yb = mid[k] - halfH - 1.5;
      if (k <= 3) arrow(walk, `M${f2(xS)} ${f2(ya)} L${f2(xS)} ${f2(yb)}`, [xS, yb], 'd', arrowOf(st, k, 'spine'), head);
      else if (k === 4) {
        const ym = (ya + yb) / 2;
        for (const [lane, xT2] of [['up', xU], ['low', xL]]) {
          arrow(walk, `M${f2(xS)} ${f2(ya)} C${f2(xS)} ${f2(ym)} ${f2(xT2)} ${f2(ym)} ${f2(xT2)} ${f2(yb)}`, [xT2, yb], 'd', arrowOf(st, 4, lane), head);
        }
      } else {
        arrow(walk, `M${f2(xU)} ${f2(ya)} L${f2(xU)} ${f2(yb)}`, [xU, yb], 'd', arrowOf(st, k, 'up'), head);
        arrow(walk, `M${f2(xL)} ${f2(ya)} L${f2(xL)} ${f2(yb)}`, [xL, yb], 'd', arrowOf(st, k, 'low'), head, { noHead: k === 5 });
      }
      if (k === 3 && !st.open) walk.line(xS - 1.9 * r - 2, gapMid[3], xS + 1.9 * r + 2, gapMid[3], { stroke: C.coral, 'stroke-width': 2.4 });
      if (env.ko === k) {
        const c = clamp(r * 0.9, 2.4, 4.4);
        if (k <= 4) cross(walk, xS, gapMid[k], c);
        else if (k === 5) cross(walk, xU, gapMid[k], c);
        else {
          cross(walk, xU, gapMid[k], c);
          cross(walk, xL, gapMid[k], c);
        }
      }
    }

    // The second half's head, in the text column over step 6, when the whole line is on show.
    if (p.full) {
      const yy = gapTop[6] + 4 + fsHead;
      walk.text(xT, yy, 'PAYOFF · STEPS 6–10', { class: `gl-head${inv ? '' : ' is-now'}`, 'font-size': fmt(fsHead) });
      walk.line(xT, yy + 4, xR, yy + 4, { stroke: C.ruleStrong, 'stroke-width': 1 });
    }

    for (let i = first; i <= last; i += 1) {
      const lanes = i <= 3 ? [['spine', xS, false]] : [['up', xU, i >= 5], ['low', xL, false]];
      for (const [lane, x, flip] of lanes) {
        const id = i <= 3 ? AT[i][0] : AT[i][lane === 'up' ? 0 : 1];
        molecule(walk, id, x, mid[i], r, { orient: 'h', flip, look: lookOf(st, i, lane), frac: st.frac, ghosts: isPile(i, lane) ? GHOST_H[lane] : null });
      }
      // Its name in the text column; at the cut, one line for each column, left first.
      if (i === 4) {
        walk.text(xT, mid[4] - lh * 0.5 + fs * 0.35, `left: ${MOL.dhap.name}`, { class: nameClass(st, 4, ['up']), 'font-size': fmt(fs) });
        walk.text(xT, mid[4] + lh * 0.5 + fs * 0.35, `right: ${MOL.g3p.name}`, { class: nameClass(st, 4, ['low']), 'font-size': fmt(fs) });
      } else walk.text(xT, mid[i] + fs * 0.35, MOL[AT[i][0]].name, { class: nameClass(st, i, i <= 3 ? ['spine'] : ['up', 'low']), 'font-size': fmt(fs) });
      if (st.s === i) walk.path(`M${f2(xT - 3)} ${f2(mid[i])} L${f2(xT - 8)} ${f2(mid[i] - 3.4)} L${f2(xT - 8)} ${f2(mid[i] + 3.4)} Z`, { fill: C.ink });
    }

    // ---- each step's enzyme, and what it takes or gives, in the gap it works ----
    const fsTok = Math.max(7, fs * 0.8);
    const tokRy = fsTok * 0.84;
    const k2 = perFactor();
    for (let k = first + 1; k <= last; k += 1) {
      const { cls, states } = enzymeClass(st, k);
      const yy = gapMid[k] + fs * 0.35;
      // The currency first, right-aligned, so the enzyme's name knows how much room it has. The count
      // beside it is this step's share of the ledger, per glucose or per fragment.
      let right = xR;
      const c = CURRENCY[k];
      if (c) {
        const live = states.filter((s) => s !== 'dead').length;
        const done = states.filter((s) => s === 'reached').length;
        const [str, part] = k <= 3 ? c.give : c.get;
        const rx = tokenRx([str], fsTok);
        token(walk, right - rx, gapMid[k], rx, tokRy, str, part, done > 0, fsTok);
        const amount = live === 0 ? '0' : `${k <= 3 ? '−' : '+'}${count(live * k2)}`;
        walk.text(right - 2 * rx - 4, yy, amount, { anchor: 'end', class: `gl-tab ${done ? 'gl-name' : 'gl-faint'}`, 'font-size': fmt(fs) });
        right -= 2 * rx + 4 + widthOf(amount, fs) + 8;
      }
      if (k === 6) {
        // The phosphate ion from solution, between the columns, one to each column that takes the step
        // (`states` is [upper lane, lower lane], the left column and the right).
        const prx = tokenRx(['P_i'], fsTok);
        if (xS - xU - prx - 1 > prx) {
          const y = gapMid[6];
          piTick(walk, xS - prx - 1, y, xU + 2.5, y, 'l', states[0]);
          piTick(walk, xS + prx + 1, y, xL - 2.5, y, 'r', states[1]);
          token(walk, xS, y, prx, tokRy, 'P_i', PI_PART, states.some((s) => s === 'reached'), fsTok);
        }
      }
      const room = right - xT;
      const num = String(k);
      const name = ENZ[k].name;
      let tail = '';
      let tailCls = 'gl-faint';
      if (env.ko === k) tail = ' · knocked out';
      else if (k === 3) {
        const by = closedByOf(env);
        tail = by ? ` · shut by ${by === 'atp' ? 'ATP' : 'citrate'}` : ' · committed step';
        tailCls = by ? 'gl-alert' : 'gl-faint';
      }
      const need = (tl) => widthOf(`${num} ${name}${tl}`, fs);
      if (tail && need(tail) > room) tail = env.ko === k ? ' · out' : closedByOf(env) ? ' · shut' : '';
      if (tail && need(tail) > room) tail = '';
      // A name longer than its room is set smaller, never cut to an abbreviation the text never uses.
      const fsE = need(tail) > room ? Math.max(7.2, (fs * room) / need(tail)) : fs;
      const t = walk.text(xT, yy, '', { class: cls, 'font-size': fmt(fsE) });
      t.append(el('tspan', { class: 'gl-num', text: num }), ` ${name}`);
      if (tail) t.append(el('tspan', { class: tailCls, text: tail }));
    }

    if (p.withSum && inv) {
      const yy = mid[last] + hh[last] / 2 + 3;
      walk.line(ox + pad, yy, xR, yy, { stroke: C.rule, 'stroke-width': 1 });
      summaryRow(yy);
    }
  }

  // ---------------------------------------------------------------- the ledger

  function talliesInto(r) {
    const L = ledgerNow();
    r.row('ATP spent', count(L.spent))
      .row('ATP made', count(L.made))
      .sum('Net ATP', signed(L.net), { accent: L.net < 0 ? INK.coral : undefined })
      .row('NADH made', count(L.nadh))
      .row('Pyruvate made', count(L.pyr));
    return r;
  }
  const nowTitle = () => {
    const s = Math.floor(ticks / TICKS);
    return s === 0 ? 'Now · before step 1' : `Now · after step ${s}`;
  };
  const DOMAINS = 'Drawn as a human, a yeast and most bacteria run it. All three domains share only steps\u00a08–10.';

  // What the step just did first, then the committed step and the knock-out when they have something to
  // say. `short` takes each in its short form; `alertsOnly` leaves out a status that is not a warning.
  function notesInto(r, { short = false, domains = false, alertsOnly = false, size }) {
    r.note(nowSentence(short));
    const status = statusSentence(short);
    if (status && (status.alert || !alertsOnly)) r.note(status.text, { accent: status.alert ? INK.coral : undefined });
    const knock = knockSentence(short);
    if (knock) r.note(knock, { accent: INK.coral });
    if (domains && !status && !knock) r.note(DOMAINS, { size: size - 1.2 });
  }

  // The toolbar starts where the panes end, so every table in the ledger stops this far short of the
  // pane's bottom rather than laying its last rule along the buttons' top edge. `arrange()` gives a
  // ledger that sits under the walk these pixels back; one beside the walk has height to spare.
  const LEDGER_GAP = 6;

  function drawLedger() {
    ledger.clear();
    const { w } = ledger.box;
    const hgt = Math.max(0, ledger.box.h - LEDGER_GAP);
    const title = `Ledger · per ${env.per}`;
    if (mode === 'line') {
      const gut = 22;
      const wA = clamp((w - 2 * gut) * 0.24, 150, 230);
      const wC = clamp((w - 2 * gut) * 0.3, 190, 300);
      const wB = Math.max(120, w - wA - wC - 2 * gut);
      const size = clamp(hgt / 11.5, 9.4, 10.6);
      talliesInto(ledger.readout({ title, x: 0, y: 0, width: wA, size, minRow: 13, maxRow: 24 })).fill(hgt);
      // A column of sentences is not stretched to the pane's height: its lines keep their own leading.
      ledger.readout({ title: nowTitle(), x: wA + gut, y: 0, width: wB, size, minRow: 12, maxRow: 13 }).fit(hgt, (r, lv) => {
        notesInto(r, { short: lv >= 2, domains: lv === 0, size });
      }, { levels: 3 });
      ladderInto(wA + wB + 2 * gut, wC, hgt, size);
    } else if (mode === 'phase') {
      const x = 10;
      const width = w - x;
      const size = clamp(Math.min(width / 21, hgt / 16), 9.2, 10.6);
      // The title is set in spaced capitals at the readout's 9.4 px, about 0.68 em a letter as measured.
      // A column too narrow for all of it drops the word "Ledger", as the ladder's does, in either unit,
      // so the title does not change form when the reader changes the unit.
      const head = widthOf('Ledger · per fragment', 9.4, 0.72) <= width ? title : `Per ${env.per}`;
      ledger.readout({ title: head, x, y: 0, width, size, minRow: 13, maxRow: 17 }).fit(hgt, (r, lv) => {
        talliesInto(r);
        notesInto(r, { short: lv >= 2, domains: lv === 0, alertsOnly: lv >= 3, size });
      }, { levels: 4 });
    } else {
      // Beneath the ladder, in the ladder's own column: the tallies, and beside them what the step did.
      const cw = Math.min(w, 600);
      const ox = Math.max(0, (w - cw) / 2);
      const gut = 16;
      const size = clamp(cw / 36, 9.2, 10.6);
      const wA = clamp((cw - gut) * 0.44, 130, 260);
      talliesInto(ledger.readout({ title: `Per ${env.per}`, x: ox, y: 0, width: wA, size, minRow: 13, maxRow: 22 })).fill(hgt);
      ledger.readout({ title: nowTitle(), x: ox + wA + gut, y: 0, width: cw - wA - gut, size, minRow: 12, maxRow: 13 }).fit(hgt, (r, lv) => {
        notesInto(r, { short: lv >= 1, domains: lv === 0 && cw > 520, alertsOnly: lv >= 2, size });
      }, { levels: 3 });
    }
    typeset(ledger.node);
  }

  // The rungs the current step's phosphate moves between are set in the phosphate's violet, label and
  // value both, and the note under the table says which way it went. The footnote is kept at every size:
  // the dagger is how the table says it does not list 1,3-bisphosphoglycerate.
  function ladderInto(x, width, hgt, size) {
    const s = Math.floor(ticks / TICKS);
    const mark = LADDER_MARK[s] ?? {};
    const lit = new Set([mark.from, mark.to].filter(Boolean));
    const small = size - 1.2;
    ledger.readout({ title: 'From Section 5.3’s ladder', columns: ['kJ/mol'], x, y: 0, width, size, minRow: 13, maxRow: 22 }).fit(hgt, (r, lv) => {
      for (const rung of LADDER) {
        const opts = { accent: lit.has(rung.id) ? INK.violet : undefined };
        if (rung.strong) r.sum(rung.label, rung.kj, opts);
        else r.row(rung.label, rung.kj, opts);
      }
      r.note(FOOTNOTE, { size: small });
      if (lv === 0) r.note(LADDER_NOTE[s] ?? LADDER_REST, { size: small });
    }, { levels: 2 });
    const labels = new Map(LADDER.map((rung) => [rung.label, rung.id]));
    for (const t of ledger.node.querySelectorAll('text.tb-rt-key')) {
      const id = labels.get(t.textContent);
      if (id && lit.has(id)) {
        t.style.fill = INK.violet;
        t.style.fontWeight = '600';
      }
    }
    for (const t of ledger.node.querySelectorAll('text.tb-rt-head')) {
      if (t.textContent === 'kJ/mol') {
        t.style.textTransform = 'none';
        t.style.letterSpacing = '0';
      }
    }
  }
  const LADDER_REST = 'Steps 7 and 10 each hand ADP a phosphate from above ATP.';
  const LADDER_NOTE = {
    1: 'The phosphate runs down from ATP to glucose 6-phosphate: the cell pays for the tag.',
    3: 'ATP pays again; fructose 1,6-bisphosphate is not on the table.',
    6: 'The oxidation has put a phosphate from solution on the sugar, above ATP.',
    7: 'From 1,3-bisphosphoglycerate down to ATP: downhill, so it goes.',
    10: 'From the top of the table down to ATP.',
  };

  // ---------------------------------------------------------------- drawing

  // The stage's shape decides the arrangement, never a pane's size, so the choice cannot flip as the
  // panes it produces are measured. Returns true when it changed the grid.
  let layoutKey = null;
  function arrange() {
    const rect = b.wrap.getBoundingClientRect();
    const bar = b.wrap.querySelector('.tb-toolbar');
    const barH = bar ? bar.getBoundingClientRect().height : 0;
    const W = Math.max(0, rect.width - 14);
    const H = Math.max(0, rect.height - barH - 26);
    let want;
    let rows;
    let cols = 'minmax(0, 1fr)';
    let lc = 1;
    let lr = 2;
    if (H > W * 0.6 || W < 400) {
      want = 'ladder';
      rows = `minmax(0, 1fr) minmax(0, ${Math.round(clamp(H * 0.26, 80, 150)) + LEDGER_GAP}px)`;
    } else {
      const led = Math.round(clamp(H * 0.32, 112, 160)) + LEDGER_GAP;
      if (W >= 760 && H - led - 6 >= 210) {
        want = 'line';
        rows = `minmax(0, 1fr) minmax(0, ${led}px)`;
      } else {
        want = 'phase';
        rows = 'minmax(0, 1fr)';
        cols = W < 600 ? 'minmax(0, 70fr) minmax(0, 30fr)' : 'minmax(0, 66fr) minmax(0, 34fr)';
        lc = 2;
        lr = 1;
      }
    }
    const keyNow = `${want}|${rows}|${cols}`;
    if (keyNow === layoutKey) return false;
    layoutKey = keyNow;
    mode = want;
    b.setVar('--gl-cols', cols);
    b.setVar('--gl-rows', rows);
    b.setVar('--gl-lc', String(lc));
    b.setVar('--gl-lr', String(lr));
    return true;
  }

  function drawWalk() {
    walk.clear();
    const { w, h: hgt } = walk.box;
    const st = walkState();
    if (mode === 'ladder') drawLadder(w, hgt, st);
    else drawLine(w, hgt, st);
    walk.focusMark();
    typeset(walk.node);
  }

  b.onDraw(() => {
    if (arrange()) b.remeasure();
    drawWalk();
    drawLedger();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   step                  0 to 10: the station the glucose is at, whole steps only
  //   phase                 'investment' through step 5, 'payoff' from step 6
  //   carbonsPerMolecule    6 before the cut (steps 0–3), 3 after
  //   moleculesInFlight     1 before the cut, 2 after (still 2 with the isomerase out: one is stuck)
  //   atpSpent, atpMade     cumulative for the glucose on the line, in whole ATP per glucose, or halves
  //                         per fragment; see THE LEDGER
  //   atpNet                atpMade − atpSpent: negative after steps 1 to 6, 0 at 7 to 9, +2 at 10
  //   nadhMade, pyruvateMade   cumulative, per lane that has passed steps 6 and 10
  //   ledgerPer             'glucose' | 'fragment', from the Ledger choice
  //   committedStepOpen     computed from the three sliders (I ≤ 1 above), never set by a button
  //   closedBy              'atp' | 'citrate' | null: which of them shut it; null while open
  //   atpMM, ampMM, citrateMM   the sliders, mM, one decimal
  //   knockedOut            the enzyme removed, by its full name, or null
  //   accumulating          the intermediate before the gap, from the knock-out alone, or null
  //   drainedAway           the intermediates past the gap, from the knock-out alone; [] for none or
  //                         for the isomerase
  //   donorForStep          where the phosphate the current step adds came from, or null: 'ATP' (1, 3),
  //                         'inorganic phosphate' (6), '1,3-bisphosphoglycerate' (7),
  //                         'phosphoenolpyruvate' (10)
  //   t                     how long Run has run, seconds of the figure's clock, three decimals
  //   playing               whether Run is on
  return b.handle();
}
