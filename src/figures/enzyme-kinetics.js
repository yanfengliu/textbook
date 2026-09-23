// Sweep it yourself, then try to beat the inhibitor. A lane of enzyme molecules and a graph the reader
// draws. In the lane each enzyme visibly binds, converts and releases, and the proportion busy at any
// instant rises towards one as the substrate goes up. On the graph a point is plotted for each
// concentration the reader visits, **so the curve is built by sweeping and the graph starts empty**.
//
// THE EXPERIMENT, and why the graph is not drawn for the reader. Sweep with no inhibitor and a curve
// appears; choose an inhibitor and sweep again, and the second curve is drawn beside the first, so what
// has happened to the ceiling and to the half-way concentration is read off rather than asserted. A
// reader who picks an inhibitor with nothing swept yet is told to sweep the plain enzyme first, because
// a single curve compares with nothing. Changing a constant — the amount of enzyme, the temperature, the
// pH, the case — clears the sweeps, because it is then a different experiment.
//
// THE ARITHMETIC is §5.6's own, and the three inhibitors are its table:
//   rate = Vmax · S / (Km + S)
//   competitive     Km appears to rise by (1 + I/Ki); Vmax is untouched, so more substrate wins it back
//   non-competitive Vmax falls by (1 + I/Ki); Km is untouched, and more substrate does not help
//   irreversible    each molecule hit is finished, so Vmax falls with the count of survivors; the cell
//                   recovers only by making more, which here is the enzyme slider
// `relievedBySubstrate` is computed by evaluating both curves at a low reference where an inhibitor
// bites and at a high one where the ceiling is all that is left. An inhibitor that costs something down
// there and nothing up here is one more substrate wins back. It is never set by the inhibitor button, so
// "can you beat it with more substrate" is an experiment with an answer rather than a label — and the
// comparison gets the irreversible case right too, because a curve with dead enzyme in it never comes
// back to the plain ceiling however much substrate arrives.
//
// TEMPERATURE AND pH. The rate roughly doubles per 10 °C — the gentle exponential of molecules clearing
// a barrier — and past about 44 °C the enzyme unfolds. The resulting curve is therefore visibly
// asymmetric, and that asymmetry is the thing to notice: an enzyme's optimum is not a temperature it
// likes but the point where losing enzyme outruns speeding it. pH moves the rate as a bell about the
// optimum, because the side chains lining the site must carry the right charge.
//
// **THE TWO PARTS OF THE FALL**, which is §5.6's own distinction and not a simplification. Past the
// optimum an enzyme loses activity two ways, on two different clocks. Some fraction of it is unfolded at
// that temperature at any instant and folds straight back when the bench is cooled: that is `folded(T)`,
// it is an equilibrium, and it is what lets the slider be swept in both directions — the only way to see
// the shape of the curve, which is this figure's subject. The rest is permanent, because a chain left
// unfolded tangles and never folds again: that is `heatKilled`, it accumulates while the bench is hot at
// a rate set by how much is unfolded at the time, and it never falls. The permanent part is **off until
// the reader presses Keep the damage**, so the shape can still be traversed, and once it is on the lane
// keeps its crossed-out squiggles through a cooling and the ceiling does not come back up.
//
// Before that button existed the figure modelled the whole fall as reversible while §5.6 said the loss
// was largely irreversible, and a reader who slid the temperature back and watched the rate return met
// the contradiction with no word anywhere acknowledging it. §5.5's `activation-barrier` models the
// permanent part alone and has no equilibrium at all, so between them the two figures are the two halves
// of §5.6's sentence rather than two answers to it.
//
// THE TOOLBAR, which is nineteen controls and a 390 px bar, and the arithmetic that settles it. Measured
// in `out/ekcrowd/`, at a 390 px viewport: the bar has 301.6 px to spend, a row costs 34 px, and the
// stage is 456 px tall — so a row is 7% of the figure, and the panes get whatever the toolbar does not.
// Temperature and pH sit behind a **Conditions** control and the six named cases behind a **Cases**
// control; the readout prints the temperature, the pH and the case in every state, so what a closed
// control holds is never unknown.
//
// That was not enough on its own. With **both** open and an inhibitor chosen — a state a reader reaches
// by pressing two buttons — the toolbar came to TEN rows and 320 px, seven tenths of the stage, and the
// graph was drawn over the readout (`out/lab/ek-crowd-*.png`). Three things take it to six rows and
// 196 px in that same state, and none of them hides anything the reader could not reach before:
//   - **one panel at a time at a phone's width.** Opening Conditions closes Cases and the other way
//     about. It costs the reader the temperature slider and the named cases being on screen together;
//     the case that is loaded and the temperature it is at are both printed in the readout throughout,
//     and either panel is one press away. At desktop width both are open at once and nothing changed.
//   - **short labels on the four inhibitors** (`Compet.`, `Non-comp.`, `Irrev.`), which is the difference
//     between 333 px of segments, which wrap to two rows, and 251 px, which do not. The accessible name
//     is the whole sentence at both widths, so what a reader hears and what an item's goal names are
//     unchanged.
//   - **the concentration slider grouped with the temperature and the pH** rather than with the four
//     buttons that choose the inhibitor, which lets it share a line with the two disclosure buttons
//     instead of stranding 175 px of a row of its own. The reasoning is beside the slider.
// What is left is the floor for this figure, not a number that was aimed at: greedy packing of the same
// controls into 301.6 px lines cannot do better than six in either open state.
//
// Two compositions. This figure carries a genuine second one, for the reason `transport-lab` has one:
//   wide   — lane top left, the readout under it, the graph filling a tall right column;
//   narrow — the lane becomes one short strip across the top, the graph takes the full width beneath it,
//            and the readout sits under that. The two markers keep their desktop labels at both widths.
//
// describe() is documented at the foot of this file.
import { C, clamp } from './lib/svg.js';
import { metabolismPart } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = { kind: 'enzyme-kinetics', title: 'Sweep it yourself, then try to beat the inhibitor', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 };

// ---------------------------------------------------------------- the model

const S_MAX = 40; // mmol/L, the top of the substrate slider and the right edge of the graph
const ENZ_PER_UNIT = 4; // enzyme molecules drawn per unit of enzyme, so the lane can be counted
const BLOOD_GLUCOSE = 5; // mmol/L, §5.6's marker
const KI = { competitive: 0.15, noncompetitive: 0.2, irreversible: 0.3 }; // mmol/L
const KILL_PER_MM = 0.55; // enzyme molecules a second, per mmol/L of an irreversible inhibitor
const MELT_C = 44;
const PH_WIDTH = 1.15;
// The permanent half of the fall: the three-state model, N ⇌ U → I. Only the unfolded fraction is
// vulnerable, so the rate carries `1 - folded(T)`; and destroying it is itself a chemical step with its
// own temperature dependence, so it carries an Arrhenius term of its own. Both factors are needed. With
// the vulnerable fraction alone, the whole temperature range is spanned by `folded`'s 578-fold swing
// between 37 °C and 55 °C, which made the loss at BODY temperature five per cent a minute — two orders
// of magnitude too fast for a real enzyme, and a lane that quietly emptied while a reader was doing the
// inhibitor experiments with the button still pressed. The second factor widens the same swing to about
// seven thousand, which is what the pair of half-lives below is:
//   37 °C  about two hours, so nothing happens at body temperature and nothing drifts under the reader
//   41 °C  about two minutes — the figure's own optimum, where a measured optimum really does depend on
//          how long the assay ran, which is why an enzyme's optimum is a crossing point and not a constant
//   44 °C  nine seconds   48 °C  three seconds   55 °C  one second
const HEAT_LOSS_PER_SECOND = 0.15;
const INACT_Q10 = 4; // how much faster the destroying step goes per 10 °C, measured against MELT_C

// The `line` names the case in one sentence. Each is kept under about seventy characters, because the
// bench's readout sets a note as one line and a longer one wraps to two rows the table has no room for.
const CASES = {
  plain: { km: 6, kcat: 60, phOpt: 7, line: 'a plain enzyme, with round constants and no named case' },
  hexokinase: { km: 0.1, kcat: 120, phOpt: 7, line: 'hexokinase: Km 0.1 mmol/L, so it is saturated at all times' },
  glucokinase: { km: 10, kcat: 150, phOpt: 7, line: 'glucokinase, in the liver: Km 10, above blood glucose' },
  statin: { km: 6, kcat: 60, phOpt: 7, inhibitor: 'competitive', inhibitorMM: 0.3, line: 'a statin, competitive on the enzyme that makes cholesterol' },
  ethanol: { km: 6, kcat: 60, phOpt: 7, inhibitor: 'competitive', inhibitorMM: 0.9, line: 'ethanol against methanol: they compete for the same enzyme' },
  penicillin: { km: 6, kcat: 60, phOpt: 7, inhibitor: 'irreversible', inhibitorMM: 0.5, line: 'penicillin: a covalent bond, and that molecule is finished' },
};

const PRESETS = [
  { id: 'plain', label: 'Plain enzyme', short: 'Plain', aria: 'Plain enzyme, round constants and no named case' },
  { id: 'hexokinase', label: 'Hexokinase', aria: 'Hexokinase, the low-Km enzyme most cells use on glucose' },
  { id: 'glucokinase', label: 'Glucokinase', aria: 'Glucokinase, the liver\'s high-Km version' },
  { id: 'statin', label: 'Statin', aria: 'Statin, a competitive inhibitor of cholesterol synthesis' },
  { id: 'ethanol', label: 'Ethanol', aria: 'Ethanol, competing with methanol for the same enzyme' },
  { id: 'penicillin', label: 'Penicillin', aria: 'Penicillin, an irreversible inhibitor of wall cross-linking' },
];

// The short labels are the phone's, and they are abbreviations of the same words rather than different
// ones: the accessible name stays the whole sentence at both widths, so a reader hearing the control and
// an item goal naming it still meet "Non-competitive". Measured at a 390 px stage, where the toolbar has
// 301.6 px to spend and a segment costs 26.6 px of chrome plus about 5.5 px a character: the four long
// labels come to 333 px and wrap to two rows, the four short ones to 251 px and fit one.
const INHIBITORS = [
  { id: 'none', label: 'No inhibitor', short: 'None', aria: 'No inhibitor, the plain curve' },
  { id: 'competitive', label: 'Competitive', short: 'Compet.', aria: 'Competitive, a molecule that takes the active site in place of the substrate' },
  { id: 'noncompetitive', label: 'Non-competitive', short: 'Non-comp.', aria: 'Non-competitive, a molecule that binds elsewhere and bends the enzyme' },
  { id: 'irreversible', label: 'Irreversible', short: 'Irrev.', aria: 'Irreversible, a molecule that bonds covalently and finishes that enzyme' },
];
const SERIES_COLOUR = { none: C.ink, competitive: C.water, noncompetitive: C.violet, irreversible: C.coral };

const ENZYME = metabolismPart('enzyme');

const showRate = (v) => (v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1) : v.toFixed(2));
// An axis is a column of figures and reads as one, so all six ticks take the same shape: whole numbers
// where the top of the axis is past ten, one decimal below it. `showRate`'s per-value rule gave a column
// reading 268, 215, 161, 107, 53.7, 0.00, which is five formats down one edge.
const showAxis = (v, top) => (top >= 10 ? Math.round(v).toString() : v.toFixed(1));
const showMM = (v) => (v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3));

// ---------------------------------------------------------------- style

const NARROW_W = 800;
const NARROW_H = 400;

const CSS = `
.tb-enzyme-kinetics .ek-axis { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-enzyme-kinetics .ek-grid { stroke: var(--rule); }
.tb-enzyme-kinetics .ek-frame { stroke: var(--rule-strong); fill: none; }
.tb-enzyme-kinetics .ek-marker { stroke: var(--rule-strong); stroke-width: 1.2; stroke-dasharray: 4 3; }
.tb-enzyme-kinetics .ek-note { fill: var(--ink-faint); }
.tb-enzyme-kinetics .ek-dead { stroke: var(--coral); stroke-width: 1.8; stroke-linecap: round; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W, height: NARROW_H },
    seed: 56,
  });
  const fit = b.fit;
  const n1 = (v) => b.num(v, 1);

  // ---- state ----
  let preset = 'plain';
  let substrateMM = 1;
  let enzymeMolecules = 4; // the lane's own count; the enzyme slider sets it directly
  let inhibitor = 'none';
  let inhibitorMM = 0;
  let temperatureC = 37;
  let ph = 7;
  let destroyed = 0; // enzyme molecules finished by an irreversible inhibitor; never falls
  let heatDamage = false; // whether the permanent half of the temperature fall is switched on
  let heatKilled = 0; // fraction of the lane unfolded past recovery; never falls while the figure runs
  let sweeps = { none: [], competitive: [], noncompetitive: [], irreversible: [] };
  let conditionsOpen = true;
  let casesOpen = true;
  let syncing = false;
  // ---- the controls, declared here and assigned where the toolbar wants them ----
  //
  // **`if (x)` on a binding declared later does not skip, it throws**, and `x?.set()` does not save it
  // either: optional chaining tests for null and undefined, and a `const` or `let` further down this
  // function is in neither state — it is in its temporal dead zone, and touching it is a ReferenceError.
  // `restartModel` reads all nine of these, and it reads them through guards that LOOK like they have
  // handled the case. They had not. Every one of these was a `const` beside its `b.slider` or `b.choice`
  // call further down, so any path that reached `restartModel` before those lines ran would have thrown
  // during mount and put the frame in its error state — an error box where the figure should be. They
  // are `let`s initialised to null here so that the guard below is the guard it reads as.
  let sSlider = null;
  let eSlider = null;
  let iSlider = null;
  let tSlider = null;
  let phSlider = null;
  let inhibitorCtl = null;
  let presetCtl = null;
  let condBtn = null;
  let casesBtn = null;
  let keepBtn = null;

  const caseOf = () => CASES[preset];
  const km = () => caseOf().km;
  // How much of the enzyme is folded AT THIS INSTANT at this temperature. It is an equilibrium and not a
  // history: cooling the bench puts it straight back, which is the half of the fall a sweep can traverse.
  const folded = (tC) => 1 / (1 + Math.exp((tC - MELT_C) / 1.1));
  const tempFactor = () => 2 ** ((temperatureC - 37) / 10) * folded(temperatureC);
  const phFactor = () => Math.exp(-((ph - caseOf().phOpt) ** 2) / (2 * PH_WIDTH ** 2));
  const kcat = () => caseOf().kcat * tempFactor() * phFactor();
  const alive = () => Math.max(0, enzymeMolecules - destroyed);
  // A molecule lost to heat is gone from the ceiling exactly as a molecule the reader never added is, so
  // the survivors' fraction multiplies the ceiling and leaves `kcat` — what one working molecule does —
  // alone. With Keep the damage never pressed, `heatKilled` is 0 and this is the expression it was.
  const vmax = () => caseOf().kcat * tempFactor() * phFactor() * enzymeMolecules * (1 - heatKilled);
  const denatured = () => folded(temperatureC) < 0.5 || phFactor() < 0.25;

  // The two constants under the current inhibitor, which is §5.6's table made into arithmetic.
  function apparent() {
    const i = inhibitorMM;
    if (inhibitor === 'competitive') return { vmax: vmax(), km: km() * (1 + i / KI.competitive) };
    if (inhibitor === 'noncompetitive') return { vmax: vmax() / (1 + i / KI.noncompetitive), km: km() };
    if (inhibitor === 'irreversible') return { vmax: (vmax() * alive()) / Math.max(1e-9, enzymeMolecules), km: km() };
    return { vmax: vmax(), km: km() };
  }
  const rateAt = (s, a) => (a.vmax * s) / (a.km + s);
  const plainAt = (s) => (vmax() * s) / (km() + s);

  // Computed, never set by the button: evaluate both curves at the top of the slider and compare.
  const relievedBySubstrate = () => {
    if (inhibitor === 'none' || inhibitorMM === 0) return false;
    const a = apparent();
    const lo = Math.max(km(), 0.01) * 0.5;
    const hi = Math.max(km(), a.km) * 1000;
    const bites = plainAt(lo) > 0 && rateAt(lo, a) < plainAt(lo) * 0.95;
    const goneAtHigh = plainAt(hi) > 0 && rateAt(hi, a) > plainAt(hi) * 0.98;
    return bites && goneAtHigh;
  };

  function restartModel() {
    preset = 'plain';
    substrateMM = 1;
    enzymeMolecules = 4;
    inhibitor = 'none';
    inhibitorMM = 0;
    temperatureC = 37;
    ph = 7;
    destroyed = 0;
    heatDamage = false;
    heatKilled = 0;
    sweeps = { none: [], competitive: [], noncompetitive: [], irreversible: [] };
    if (presetCtl) presetCtl.set('plain', { quiet: true });
    if (inhibitorCtl) inhibitorCtl.set('none', { quiet: true });
    if (keepBtn) keepBtn.set(false, { quiet: true });
    syncing = true;
    sSlider?.set(4);
    eSlider?.set(4);
    iSlider?.set(0);
    tSlider?.set(37);
    phSlider?.set(14);
    syncing = false;
    applyConditionsVisibility();
  }

  // ---- panes ----
  const lane = b.pane('lane', {
    as: 'svg',
    focus: true,
    aria: 'A lane of enzyme molecules, each of which binds a substrate, converts it and releases it. Left and right arrows sweep the substrate concentration, which plots the graph below; Home resets the bench.',
  });
  const graph = b.pane('graph', { as: 'svg' });
  const readout = b.pane('readout', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 46fr) minmax(0, 54fr)',
      rows: 'minmax(0, 40fr) minmax(0, 60fr)',
      at: { lane: [1, 1], readout: [1, 2], graph: [2, '1 / 3'] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 18fr) minmax(0, 42fr) minmax(0, 40fr)',
      at: { lane: [1, 1], graph: [1, 2], readout: [1, 3] },
    },
  });

  // ---- controls ----
  //
  // Fourteen buttons and five sliders came to seven toolbar rows at 390 px and the readout was drawn
  // under them. Four things cut that: the named cases go behind a **Cases** control that expands, the
  // way the conditions do, and at a phone's width only one of the two is open at a time; every slider's
  // value drops its UNIT at narrow and its label takes the short form, which is what `format(v, {
  // narrow })` and `short` are for; the four inhibitors take short labels for the same reason; and the
  // enzyme, which is twelve stops, becomes a stepper at that width because twelve stops on a 4.4rem
  // track is four pixels each. Nothing is hidden by any of it: the readout prints the temperature, the
  // pH and the case in every state, and the accessible name of every control is the same word at both
  // widths. THE TOOLBAR at the head of this file holds the measurements.
  const suffix = (o, u) => (o.narrow ? '' : ` ${u}`);
  sSlider = b.slider('Substrate', {
    min: 0, max: S_MAX * 4, step: 1, value: 4, short: 'S',
    format: (v, o) => `${showMM(v / 4)}${suffix(o, 'mmol/L')}`,
    onInput: (v) => { if (syncing) return; substrateMM = v / 4; plotHere(); after(); },
  });
  eSlider = b.stepper('Amount of enzyme', {
    min: 1, max: 12, step: 1, value: 4, short: 'E',
    format: (v, o) => `${(v / ENZ_PER_UNIT).toFixed(2)}${suffix(o, 'units')}`,
    onInput: (v) => { if (syncing) return; enzymeMolecules = v; destroyed = Math.min(destroyed, v); clearSweeps(); after(); },
  });
  b.divide();
  inhibitorCtl = b.choice('Inhibitor', INHIBITORS, (id) => {
    inhibitor = id;
    if (id === 'none') inhibitorMM = 0;
    else if (inhibitorMM === 0) { inhibitorMM = 0.4; syncing = true; iSlider.set(8); syncing = false; }
    sweeps[id] = [];
    applyConditionsVisibility();
    after();
  }, { value: 'none', segmented: true });
  b.divide();
  // HOW MUCH inhibitor stands with the temperature and the pH, not with the four buttons that choose
  // WHICH one, and that placement is a measurement rather than a taste. A group is one flex item: a
  // group that overruns the line takes the whole line and the next group starts below it however much
  // room is left. Sitting with the buttons, this slider made the inhibitor's group 383 px of a 301.6 px
  // bar, so it wrapped, took two rows, and left 175 px of the second one empty — and the two disclosure
  // buttons that would have fitted in that space were pushed onto a row of their own. Here, the same
  // controls pack as `[the four inhibitors]` and `[how much · Conditions · Cases]`, 270.9 px of 301.6,
  // which is a row less in every state a reader can reach and two less in the worst one. It reads
  // straight as well: these three sliders are the conditions the bench is run at, and the six named
  // cases in the next group are what sets all of them at once.
  iSlider = b.slider('Inhibitor', {
    min: 0, max: 40, step: 1, value: 0, short: 'I',
    format: (v, o) => `${(v / 20).toFixed(2)}${suffix(o, 'mmol/L')}`,
    onInput: (v) => { if (syncing) return; inhibitorMM = v / 20; sweeps[inhibitor] = []; after(); },
  });
  // Opening one panel closes the other AT A PHONE'S WIDTH ONLY, which is the whole of this figure's
  // answer to nineteen controls on a 390 px stage. See THE TOOLBAR above for the arithmetic; at desktop
  // width both are open at once and neither press touches the other.
  const openOnly = (which) => {
    if (!b.narrow) return;
    if (which === 'conditions') casesOpen = false;
    else conditionsOpen = false;
  };
  condBtn = b.toggle('Conditions', (on) => { conditionsOpen = on; if (on) openOnly('conditions'); applyConditionsVisibility(); draw(); }, {
    aria: 'Conditions, show or hide the temperature and pH sliders',
    pressed: true,
  });
  tSlider = b.slider('Temperature', {
    min: 10, max: 60, step: 1, value: 37, unit: '°C', short: 'T',
    onInput: (v) => { if (syncing) return; temperatureC = v; clearSweeps(); after(); },
  });
  // The permanent half of the fall, next to the slider it belongs to. Pressing it again stops the loss
  // and gives nothing back, exactly as pressing No inhibitor does not undo the irreversible one: only
  // Reset clears `heatKilled`. A button that returned the enzyme would be the contradiction again.
  keepBtn = b.toggle('Keep the damage', (on) => { heatDamage = on; after(); }, {
    short: 'Keep',
    aria: 'Keep the damage, so the enzyme that unfolds while the bench is hot stays unfolded when it is cooled',
  });
  phSlider = b.slider('pH', {
    min: 2, max: 20, step: 1, value: 14,
    format: (v) => (v / 2).toFixed(1),
    onInput: (v) => { if (syncing) return; ph = v / 2; clearSweeps(); after(); },
  });
  // The Cases BUTTON sits in the conditions group and the six named enzymes it opens in the next one.
  // The two disclosures are then one control pair a phone can put on one line, and the six cases are a
  // block that hides without leaving their button stranded on a row of its own — which is a row, and at
  // 390 px a row is 34 px of a 456 px stage.
  casesBtn = b.toggle('Cases', (on) => { casesOpen = on; if (on) openOnly('cases'); applyConditionsVisibility(); draw(); }, {
    aria: 'Cases, show or hide the named enzymes and drugs',
    pressed: true,
  });
  b.divide();
  presetCtl = b.choice('Case', PRESETS, (id) => loadCase(id), { value: 'plain', segmented: true });
  b.divide();
  const runCtl = b.run({ aria: 'Run, let the lane work and the irreversible inhibitor bite', onChange: () => { draw(); b.announce(); } });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the bench back as it opened' });

  b.keys({
    ArrowRight: () => nudge(4),
    ArrowUp: () => nudge(4),
    ArrowLeft: () => nudge(-4),
    ArrowDown: () => nudge(-4),
    ' ': () => runCtl.toggle(),
    Enter: () => runCtl.toggle(),
    Home: () => resetAll(),
  });

  // ---- reader actions ----
  function after() {
    draw();
    b.announce();
  }
  function nudge(by) {
    sSlider.set(clamp(sSlider.value + by, 0, S_MAX * 4));
  }
  function clearSweeps() {
    sweeps = { none: [], competitive: [], noncompetitive: [], irreversible: [] };
  }
  // A point for each concentration the reader visits. Rounded to a twentieth of a mmol/L so that a
  // sweep back and forth over the same ground does not stack a hundred discs on one place.
  function plotHere() {
    const s = Math.round(substrateMM * 20) / 20;
    const series = sweeps[inhibitor];
    if (series.some((p) => p.s === s)) return;
    series.push({ s, v: rateAt(s, apparent()) });
    series.sort((a, c) => a.s - c.s);
    if (series.length > 400) series.shift();
  }
  function loadCase(id) {
    preset = id;
    const c = CASES[id];
    inhibitor = c.inhibitor ?? 'none';
    inhibitorMM = c.inhibitorMM ?? 0;
    destroyed = 0;
    // A named case is a fresh bench, which is why `destroyed` goes back here, and heat has to go back
    // with it for the same reason: loading Hexokinase onto a lane that is a quarter burnt is not the
    // hexokinase experiment. It is not the button giving enzyme back — that one still never does.
    heatKilled = 0;
    clearSweeps();
    inhibitorCtl.set(inhibitor, { quiet: true });
    syncing = true;
    iSlider.set(Math.round(inhibitorMM * 20));
    syncing = false;
    applyConditionsVisibility();
    after();
  }
  // The inhibitor's own slider is there only when there is an inhibitor to set a concentration of; the
  // temperature and pH sliders only when Conditions is open; the six named cases only when Cases is.
  // All three are hidden by the figure rather than by the bench, which has no disclosure of its own, and
  // the readout prints the temperature, the pH and the case in every state, so nothing is lost with them.
  function applyConditionsVisibility() {
    // `restartModel` calls this, so it can be reached before the toolbar is built. Nothing to show or
    // hide then, and the call at the foot of mount does the first real pass.
    if (!condBtn) return;
    condBtn.set(conditionsOpen, { quiet: true });
    casesBtn.set(casesOpen, { quiet: true });
    const show = (node, on) => { node.style.display = on ? '' : 'none'; };
    show(iSlider.node, inhibitor !== 'none');
    show(tSlider.node, conditionsOpen);
    show(keepBtn.node, conditionsOpen);
    show(phSlider.node, conditionsOpen);
    for (const node of presetCtl.nodes) show(node, casesOpen);
  }
  function resetAll() {
    runCtl.set(!ctx.reducedMotion);
    b.restart(); // which calls restartModel()
    b.announce();
  }

  // ---- the clock: the lane's cycle, and the irreversible inhibitor eating the enzyme ----
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    advance: (dt) => {
      if (inhibitor === 'irreversible' && inhibitorMM > 0) {
        destroyed = Math.min(enzymeMolecules, destroyed + KILL_PER_MM * inhibitorMM * alive() * dt);
      }
      // The permanent half of the temperature fall. It proceeds FROM the unfolded state, so its rate is
      // set by how much is unfolded at this temperature right now, which is why nothing happens on a cool
      // bench and why the loss is fast past the optimum rather than at a threshold. It never falls.
      if (heatDamage && heatKilled < 1) {
        const k = HEAT_LOSS_PER_SECOND * (1 - folded(temperatureC)) * INACT_Q10 ** ((temperatureC - MELT_C) / 10);
        heatKilled = Math.min(1, heatKilled + k * (1 - heatKilled) * dt);
      }
    },
  });

  // ---- what describe() reports ----
  function state() {
    const a = apparent();
    return {
      substrateMM: Number(substrateMM.toFixed(3)),
      rate: Number(rateAt(substrateMM, a).toFixed(2)),
      enzymeUnits: Number((enzymeMolecules / ENZ_PER_UNIT).toFixed(2)),
      vmax: Number(vmax().toFixed(2)),
      km: km(),
      apparentVmax: Number(a.vmax.toFixed(2)),
      apparentKm: Number(a.km.toFixed(3)),
      occupancy: Number((substrateMM / (a.km + substrateMM)).toFixed(3)),
      plotted: sweeps[inhibitor].length,
      inhibitor,
      inhibitorMM: Number(inhibitorMM.toFixed(2)),
      relievedBySubstrate: relievedBySubstrate(),
      enzymesDestroyed: Number(destroyed.toFixed(2)),
      temperatureC,
      ph,
      denatured: denatured(),
      heatDamage,
      enzymesLostToHeat: Number((heatKilled * enzymeMolecules).toFixed(2)),
      turnoverPerSecond: Number(kcat().toFixed(2)),
      preset: preset === 'plain' ? null : preset,
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // The sentence the readout prints, read aloud in every state its parts can take: each inhibitor at
  // zero and at a concentration, denatured by heat and by pH, and with nothing swept yet.
  function situation() {
    if (denatured()) {
      return folded(temperatureC) < 0.5
        ? 'unfolded: past about 44 °C, losing enzyme outruns speeding it up.'
        : 'at this pH the side chains no longer carry the right charge.';
    }
    // Cooled, over a lane that did not all come back. It pre-empts the inhibitor sentences on purpose:
    // with enzyme permanently gone, the ceiling an inhibited curve is compared against has itself moved,
    // and saying "the curve every other one is compared against" over crossed-out squiggles is the lie
    // this figure was changed to stop telling.
    if (heatKilled > 0.02) return 'cooled, and the enzyme that unfolded has not come back: this ceiling is lower for good.';
    if (inhibitor === 'none') {
      return sweeps.none.length < 3
        ? 'sweep the substrate: the curve is plotted point by point.'
        : 'no inhibitor: the curve every other one is compared against.';
    }
    if (inhibitorMM === 0) return 'an inhibitor with none of it in the pot; give it a concentration.';
    if (!sweeps.none.length) return 'sweep the plain enzyme first, to have something to compare with.';
    return relievedBySubstrate()
      ? 'more substrate wins the site back: the ceiling is where it was.'
      : 'more substrate does not help: the ceiling itself has come down.';
  }
  b.onAnnounce((d) => `Substrate ${showMM(d.substrateMM)} mmol per litre, rate ${showRate(d.rate)} a second, ${Math.round(d.occupancy * 100)} per cent of sites busy. Ceiling ${showRate(d.apparentVmax)}, half way at ${showMM(d.apparentKm)} mmol per litre. ${d.plotted} points swept. ${situation()}`);

  // ---------------------------------------------------------------- the lane

  function drawLane() {
    const { w, h } = lane.clear().box;
    const titleSize = clamp(w * 0.022, 8.6, 10);
    lane.text(0, titleSize, 'The lane', { class: 'tb-rt-title', 'font-size': b.num(titleSize, 1) });
    const busyWord = `${Math.round((substrateMM / (apparent().km + substrateMM)) * 100)}% busy`;
    lane.text(w, titleSize, busyWord, { anchor: 'end', class: 'ek-note', fit: [titleSize, 7.6], width: w * 0.4 });
    lane.line(0, titleSize + 4, w, titleSize + 4, { stroke: C.ruleStrong });
    const top = titleSize + 8;
    const band = Math.max(18, h - top - 2);
    const n = enzymeMolecules;
    // Twelve enzymes in one row of a 440 px pane gives each 36 px, and at that size a bound substrate is
    // two pixels across and the notch is invisible. So the lane wraps: about seventy pixels a molecule,
    // and as many rows as that needs. The enzymes stand at the foot of the band and the free substrate
    // fills the room above them — at low substrate the lane is nearly empty and the sites are idle,
    // which is the lesson and not a half-empty panel, because the number of molecules IS the concentration.
    const perRow = Math.max(3, Math.min(n, Math.floor(w / 70)));
    const rowCount = Math.ceil(n / perRow);
    const cw = w / perRow;
    const rowH = (band * 0.62) / rowCount;
    const R0 = Math.max(5, Math.min(cw * 0.34, rowH * 0.42));
    const firstRowY = top + band - rowH * (rowCount - 0.5);
    drawFreeSubstrate(w, top, Math.max(10, firstRowY - R0 - top - 2));

    const a = apparent();
    const occ = substrateMM / (a.km + substrateMM);
    const dead = Math.floor(destroyed);
    // Lost to heat for good. They take the far end of the lane, where the irreversible inhibitor's dead
    // take the near end, so the two counts never claim the same molecule.
    const heatDead = Math.max(0, Math.min(Math.round(heatKilled * n), n - dead));
    // Who is blocked by a reversible inhibitor: the competitive one is visibly flushed out as the
    // substrate rises, which is the difference the reader is meant to see in the lane and not only read.
    const blockFrac = inhibitor === 'competitive'
      ? ((inhibitorMM / KI.competitive) / (1 + inhibitorMM / KI.competitive)) * (1 / (1 + substrateMM / km()))
      : inhibitor === 'noncompetitive'
        ? (inhibitorMM / KI.noncompetitive) / (1 + inhibitorMM / KI.noncompetitive)
        : 0;
    const working = Math.max(0, n - dead - heatDead);
    const blocked = Math.round(blockFrac * working);
    const busy = Math.round(occ * Math.max(0, working - blocked));

    for (let i = 0; i < n; i += 1) {
      const cx = cw * ((i % perRow) + 0.5);
      const cy = firstRowY + Math.floor(i / perRow) * rowH;
      // A permanently lost molecule is drawn unfolded AND crossed at every temperature, so cooling the
      // bench redraws its neighbours as lobes and leaves these exactly as they were. That difference is
      // the whole of what Keep the damage buys, and it has to survive the cooling to be seen.
      if (i >= n - heatDead) { drawUnfolded(cx, cy, R0, true); continue; }
      if (denatured()) { drawUnfolded(cx, cy, R0); continue; }
      const isDead = i < dead;
      const isBlocked = !isDead && i >= dead && i < dead + blocked;
      const isBusy = !isDead && !isBlocked && i < dead + blocked + busy;
      drawEnzyme(cx, cy, R0, { isDead, isBlocked, isBusy, i });
    }
    lane.focusMark();
  }

  // A pale lobe with a NOTCH bitten out of its crown. The first draft put a paper circle of 0.42 R at
  // 0.42 R above the centre, which cut a hole through the middle of the body and made every enzyme a
  // Pac-Man; the pocket now sits over the crown so only its lower arc reaches into the lobe.
  function drawEnzyme(cx, cy, R0, { isDead, isBlocked, isBusy, i }) {
    const bent = isBlocked && inhibitor === 'noncompetitive';
    const ry = bent ? R0 * 0.62 : R0 * 0.84;
    lane.ellipse(cx, cy, bent ? R0 * 1.12 : R0, ry, { fill: ENZYME.color, opacity: isDead ? 0.45 : 1 });
    const closed = isBusy || isBlocked;
    const pocket = R0 * (closed ? 0.18 : 0.24);
    const py = cy - ry + pocket * 0.5;
    lane.circle(cx, py, pocket, { fill: C.paper });
    const mr = Math.max(1.4, pocket * 0.66);
    if (isDead) {
      lane.circle(cx, py, mr, { fill: C.coral });
      lane.line(cx - R0 * 0.72, cy - ry * 0.62, cx + R0 * 0.72, cy + ry * 0.62, { class: 'ek-dead' });
      return;
    }
    if (isBlocked && inhibitor === 'competitive') { lane.circle(cx, py, mr, { fill: C.coral }); return; }
    if (bent) { lane.circle(cx + R0 * 0.98, cy + ry * 0.5, mr, { fill: C.coral }); return; }
    if (isBusy) {
      // Where in its cycle this one is: bound, converting, or letting go. The phase is the model clock's,
      // so a pinned frame is the same frame every run.
      const phase = (b.time * 0.9 + i * 0.37) % 1;
      lane.circle(cx, py, mr, { fill: phase > 0.66 ? C.leaf : C.water });
      if (phase > 0.86) lane.circle(cx + R0 * 1.2, py - pocket, mr * 0.85, { fill: C.leaf, opacity: 0.6 });
    }
  }

  // The free substrate above the lane. Positions are seeded once, so the field is the same every run and
  // a pinned frame is the same frame; how many are shown is the concentration, read straight off the
  // slider, so an empty lane at 1 mmol/L is the figure saying there is almost nothing about.
  const SUBSTRATE_FIELD = Array.from({ length: 30 }, () => ({ x: b.random(), y: b.random() }));
  function drawFreeSubstrate(w, top, room) {
    const n = clamp(Math.round((substrateMM / S_MAX) * SUBSTRATE_FIELD.length), 0, SUBSTRATE_FIELD.length);
    const r = clamp(room * 0.08, 2.4, 5);
    for (let i = 0; i < n; i += 1) {
      const p = SUBSTRATE_FIELD[i];
      lane.circle(clamp(p.x * w, r + 1, w - r - 1), top + r + 1 + p.y * Math.max(1, room - r * 2 - 2), r, { fill: C.water, stroke: C.paper, 'stroke-width': 0.9 });
    }
  }

  function drawUnfolded(cx, cy, R0, lost = false) {
    let d = `M${b.num(cx - R0, 1)} ${b.num(cy, 1)}`;
    for (let i = 1; i <= 9; i += 1) d += ` L${b.num(cx - R0 + (2 * R0 * i) / 9, 1)} ${b.num(cy + Math.sin(i * 1.8) * R0 * 0.5, 1)}`;
    lane.path(d, { fill: 'none', stroke: ENZYME.color, 'stroke-width': Math.max(2, R0 * 0.24), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(lost ? { opacity: 0.45 } : {}) });
    // The same cross the irreversible inhibitor puts through a finished molecule, because it means the
    // same thing: this one is not coming back and the cell recovers only by making more.
    if (lost) lane.line(cx - R0 * 0.82, cy - R0 * 0.5, cx + R0 * 0.82, cy + R0 * 0.5, { class: 'ek-dead' });
  }

  // ---------------------------------------------------------------- the graph the reader draws

  function drawGraph() {
    const { w, h } = graph.clear().box;
    const tight = w < 330;
    const padL = tight ? 34 : 44;
    const padR = tight ? 10 : 16;
    // A SHORT pane, which is what a phone has once a disclosure is open: the toolbar is then 196 px of a
    // 456 px stage and the graph's own row is 87 px. The margins above and below the plot come in, because
    // `phh` has a 40 px floor under it and 24 + 40 + 30 is 94 px of drawing in an 87 px box — the axis
    // caption was landing in the gap below the pane. At 18 and 26 the plot is 43 px and everything it
    // carries is inside its own pane again. Above 110 px nothing moves: the default phone state and every
    // desktop width draw exactly the pixels they did.
    const short = h < 110;
    const padT = short ? 18 : 24;
    const padB = short ? 26 : (tight ? 28 : 32);
    const pw = Math.max(40, w - padL - padR);
    const phh = Math.max(40, h - padT - padB);
    const a = apparent();
    // The y axis is the plain enzyme's ceiling, so an inhibitor that lowers the ceiling is seen to lower
    // it rather than being re-scaled back to the top of the frame.
    const yTop = Math.max(1, Math.max(vmax(), a.vmax) * 1.12);
    const X = (s) => padL + (clamp(s, 0, S_MAX) / S_MAX) * pw;
    const Y = (v) => padT + phh - (clamp(v, 0, yTop) / yTop) * phh;

    // Two axis rules and four gridlines, the way a printed chart is set. No frame: the figure stage is
    // the only drawn rectangle in the book, and that holds inside it.
    graph.line(padL, padT, padL, padT + phh, { class: 'ek-frame' });
    graph.line(padL, padT + phh, padL + pw, padT + phh, { class: 'ek-frame' });
    const axSize = tight ? 8.6 : 9.6;
    // Gridlines, each with the rate it stands for: without them the ceiling marker is a line at an
    // unknown height and "the ceiling came down" is a shape rather than a measurement. Two intervals on
    // a phone rather than five, because six figures down a 90 px axis are 15 px apart and touch.
    const ticks = phh < 130 ? 2 : 5;
    for (let i = 0; i <= ticks; i += 1) {
      const y = padT + (phh * i) / ticks;
      if (i > 0 && i < ticks) graph.line(padL, y, padL + pw, y, { class: 'ek-grid' });
      graph.text(padL - 5, y + axSize * 0.36, showAxis((yTop * (ticks - i)) / ticks, yTop), { anchor: 'end', class: 'ek-axis', fit: [axSize, 7.4], width: padL - 7 });
    }
    for (let s = 0; s <= S_MAX; s += 10) {
      graph.line(X(s), padT + phh, X(s), padT + phh + 4, { stroke: C.ruleStrong });
      graph.text(X(s), padT + phh + (short ? 11 : 14), String(s), { anchor: 'middle', class: 'ek-axis', 'font-size': b.num(axSize, 1) });
    }
    graph.text(padL + pw, padT + phh + (short ? 22 : tight ? 26 : 28), 'substrate, mmol/L', { anchor: 'end', class: 'ek-note', fit: [axSize, 7.6], width: pw });
    graph.text(0, padT - 8, 'rate, molecules a second', { class: 'tb-rt-title', fit: [9.8, 8], width: w * 0.62 });
    // How many points the reader has plotted belongs on the graph they are plotting them on, not in the
    // table: it buys back a row there, and a phone's table has none to spare.
    const swept = sweeps[inhibitor].length;
    graph.text(w, padT - 8, `${swept} points swept`, { anchor: 'end', class: 'ek-note', fit: [9.8, 7.8], width: w * 0.36 });

    // The two markers: the ceiling and the concentration at half of it. They keep these words at every
    // width, because the separation between them is the lesson and an item's goal quotes them.
    const ceilY = Y(a.vmax);
    graph.line(padL, ceilY, padL + pw, ceilY, { class: 'ek-marker' });
    // Is the plain enzyme's own ceiling drawn as well? Both words then stand at the same end of the
    // plot, so where each one sits relative to its own line is what decides whether they collide.
    const plainCeilY = Y(vmax());
    const plainCeilShown = inhibitor !== 'none' && inhibitorMM > 0 && Math.abs(a.vmax - vmax()) > vmax() * 0.02;
    // The plain ceiling can only be labelled BELOW its line: the y axis is scaled to it, so that line is
    // always about a tenth of the way down the plot, and above it are the title and the swept count.
    // So how far apart the two lines are decides which side "ceiling" takes.
    //   far apart, or no plain ceiling drawn — the rule this figure has always had: above its own line,
    //     and below it only when the ceiling is so near the top that the word would land against the
    //     topmost figure on the y axis and the swept count. Desktop is always this case.
    //   close together — "ceiling" goes below its line as well, so the two words are the LINES' own
    //     separation apart instead of facing each other across it, each offset into the gap. On a phone
    //     with a disclosure open the plot is 43 px and a non-competitive inhibitor puts the lines 26 px
    //     apart; facing, that left 8 px between two 9 px words, and they overlapped
    //     (`out/ekcrowd/mid4-crowd-light.png`). Below, they are 26 px apart.
    // `drop` is how far a word clears its own line, and it comes in with the plot so that a word below a
    // line on a 43 px plot does not land on the axis. Both words use it, so they cannot drift apart.
    const ceilGap = plainCeilShown ? ceilY - plainCeilY : Infinity;
    const drop = short ? 9 : 13;
    const ceilBelow = ceilGap < 22 + drop ? ceilY + drop <= padT + phh - 2 : ceilY < padT + 20;
    graph.label(padL + pw - 4, ceilBelow ? ceilY + drop : ceilY - 5, 'ceiling', { size: tight ? 9 : 10, anchor: 'end', fill: C.soft, halo: 3 });
    const halfX = X(a.km);
    if (a.km <= S_MAX) {
      graph.line(halfX, padT, halfX, padT + phh, { class: 'ek-marker' });
      graph.label(halfX + 4, padT + 11, 'half way', { size: tight ? 9 : 10, anchor: 'start', fill: C.soft, halo: 3 });
    }
    // Where the plain enzyme's two markers were, faint, whenever an inhibitor has moved one of them. The
    // table gives the inhibited figures; without the pair beside them "the ceiling came down" and "only
    // the half-way point moved" are claims rather than something read off the frame.
    if (inhibitor !== 'none' && inhibitorMM > 0) {
      if (plainCeilShown) {
        graph.line(padL, plainCeilY, padL + pw, plainCeilY, { class: 'ek-marker', opacity: 0.55 });
        // The line always; the word only when the two lines are far enough apart to carry two words. A
        // ceiling 3% down is over the 2% that earns a line and is under a pixel from it on a 43 px plot,
        // so the word would be set on top of "ceiling" — and the bench's own rule for a label that
        // cannot be set at its size is not to set it (`fitSize` returns 0 rather than overrunning).
        // What is lost is a word, not the comparison: the faint line is still there to read the fall off.
        if (ceilGap >= 12) graph.label(padL + pw - 4, plainCeilY + drop, 'plain ceiling', { size: tight ? 8.6 : 9.6, anchor: 'end', fill: C.faint, halo: 3 });
      }
      if (Math.abs(a.km - km()) > km() * 0.02 && km() <= S_MAX) {
        const x0 = X(km());
        graph.line(x0, padT, x0, padT + phh, { class: 'ek-marker', opacity: 0.55 });
        graph.label(x0 + 4, padT + phh - 6, 'plain half way', { size: tight ? 8.6 : 9.6, anchor: 'start', fill: C.faint, halo: 3 });
      }
    }
    if (preset === 'hexokinase' || preset === 'glucokinase') {
      const gx = X(BLOOD_GLUCOSE);
      graph.line(gx, padT, gx, padT + phh, { stroke: C.leaf, 'stroke-width': 1.4, 'stroke-dasharray': '2 3' });
      graph.label(gx + 4, padT + phh - 6, 'blood glucose', { size: tight ? 8.8 : 9.8, anchor: 'start', fill: C.leaf, halo: 3 });
    }

    // The reader's sweeps. The current one is drawn with its points; any other one already swept stays
    // as a paler line, which is what makes "beside the uninhibited one" a comparison and not a caption.
    for (const key of Object.keys(sweeps)) {
      if (key === inhibitor || sweeps[key].length < 2) continue;
      drawSeries(sweeps[key], X, Y, SERIES_COLOUR[key], false);
    }
    drawSeries(sweeps[inhibitor], X, Y, SERIES_COLOUR[inhibitor], true);

    // Where the reader is standing on the slider, so the lane and the graph are one experiment.
    const here = rateAt(substrateMM, a);
    graph.line(X(substrateMM), padT, X(substrateMM), padT + phh, { stroke: C.ruleStrong, 'stroke-width': 1 });
    graph.circle(X(substrateMM), Y(here), tight ? 3.6 : 4.6, { fill: SERIES_COLOUR[inhibitor], stroke: C.paper, 'stroke-width': 1.6 });

    if (!sweeps[inhibitor].length && phh > 70) {
      graph.text(padL + pw / 2, padT + phh / 2, 'sweep the substrate and the curve appears', {
        anchor: 'middle', fill: C.faint, fit: [11, 8.2], width: pw - 12,
      });
    }
  }

  function drawSeries(points, X, Y, colour, current) {
    if (!points.length) return;
    if (points.length > 1) {
      let d = '';
      points.forEach((p, i) => { d += `${i ? 'L' : 'M'}${b.num(X(p.s), 1)} ${b.num(Y(p.v), 1)}`; });
      graph.path(d, { fill: 'none', stroke: colour, 'stroke-width': current ? 2.2 : 1.4, opacity: current ? 1 : 0.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    }
    if (!current) return;
    for (const p of points) graph.circle(X(p.s), Y(p.v), 2.4, { fill: colour });
  }

  // ---------------------------------------------------------------- the readout

  // `r.fit` builds the table, measures it, and builds it again shorter if it would not fit. Deciding
  // instead from `b.narrow` is a guess about the toolbar's height, and with nineteen controls the guess
  // was wrong: at 390 px the last lines were drawn under them. What a short pane gives up, in order: the
  // turnover number and the line naming the case (the Cases control names it too), then the sentence.
  // The Conditions row is never dropped, because the temperature and the pH are behind a control and
  // this is where they are printed; how many points have been swept is on the graph itself rather than
  // here, which is a row a phone's table gets back.
  const MIN_ROW = 14;
  function drawReadout() {
    const { w, h } = readout.clear().box;
    const a = apparent();
    const size = clamp(w * 0.028, 9.6, 11.6);
    readout.readout({ title: 'Kinetics', width: w, size, minRow: MIN_ROW, maxRow: 27 })
      .fit(h, (r, level) => {
        r.row('Rate now', `${showRate(rateAt(substrateMM, a))} /s`);
        r.row('Maximum rate', `${showRate(a.vmax)} /s`);
        r.row('Michaelis constant', `${showMM(a.km)} mmol/L`);
        if (level < 1) r.row('Turnover', `${showRate(kcat())} /s`);
        r.row('Conditions', `${temperatureC} °C · pH ${n1(ph)}`);
        // Shown from the moment Keep the damage is pressed rather than from the first molecule lost, so
        // the reader sees the counter start at nothing and watch it climb. It is never there for a reader
        // who has not asked for it, which is what keeps the phone's table within its rows.
        if (heatDamage) r.row('Lost to heat', `${(heatKilled * enzymeMolecules).toFixed(1)} of ${enzymeMolecules}`);
        if (inhibitor === 'irreversible') r.row('Enzymes destroyed', `${destroyed.toFixed(1)} of ${enzymeMolecules}`);
        r.rule();
        if (level < 1) r.note(CASES[preset].line);
        if (level < 2) r.note(situation());
      });
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }
  // The conditions sliders and the named cases open at desktop width and close on a phone, where
  // nineteen controls would put the panes under the toolbar. The reader's own choice stands until the
  // stage crosses the threshold, which is the only thing that re-decides it — and the bench says when
  // that happens, so the figure no longer keeps a flag of its own and compares it inside onDraw. Each
  // slider's value no longer has to be re-set either: both spans are written when the value is set, one
  // for each width, and the CSS chooses.
  b.onLayout((narrow) => {
    conditionsOpen = !narrow;
    casesOpen = !narrow;
    applyConditionsVisibility();
  });
  b.onDraw(() => {
    drawLane();
    drawGraph();
    drawReadout();
  });

  applyConditionsVisibility();
  runCtl.set(!ctx.reducedMotion);

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   substrateMM        mmol/L, where the substrate slider stands
  //   rate               molecules a second at that concentration, under the current inhibitor
  //   enzymeUnits        how much enzyme is present; the lane draws four molecules per unit
  //   vmax, km           with no inhibitor. `km` does not move with `enzymeUnits`, which is the lesson
  //   apparentVmax, apparentKm  under the current inhibitor, from §5.6's own table
  //   occupancy          0 to 1, sites busy at this instant
  //   plotted            points on the graph in the current series; 0 means nothing has been swept
  //   inhibitor          'none' | 'competitive' | 'noncompetitive' | 'irreversible'
  //   inhibitorMM        mmol/L
  //   relievedBySubstrate  computed by comparing the two curves at the top of the substrate slider,
  //                      never set by the button
  //   enzymesDestroyed   molecules finished by an irreversible inhibitor; it never falls while that
  //                      inhibitor is in the pot, and only Reset or a new case clears it
  //   temperatureC, ph   the two conditions, printed by the readout whether the sliders are open or not
  //   denatured          unfolded by heat, or stopped by a pH far from the optimum. It is the REVERSIBLE
  //                      half and a pure function of the two sliders, so cooling clears it
  //   heatDamage         whether Keep the damage is pressed, so the permanent half is accumulating
  //   enzymesLostToHeat  molecules unfolded past recovery. Like `enzymesDestroyed` it never falls while
  //                      the figure runs: releasing the button stops the loss and returns nothing, and
  //                      only Reset clears it. `vmax` falls with it, so the ceiling does not come back
  //   turnoverPerSecond  per enzyme molecule when saturated, at the current temperature and pH
  //   preset             the named case, or null for the plain enzyme
  //   t, playing         the clock, and whether it is running
  // Nothing is cumulative across Reset: the sweeps, the destroyed count and every constant go back, so
  // describe() after Reset equals describe() at mount.
  return b.handle();
}
