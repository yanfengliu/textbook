// Which way does it go, and why that is not fixed. One reaction drawn as a tilting landscape, with a
// live account of where ΔG stands, fed by two independent halves: the chemistry (a heat term, an entropy
// term and a temperature) and the conditions (the concentrations of reactant and product). The reader
// can make the same reaction run forwards, stop, and run backwards without one atom of its chemistry
// changing, which is §5.2's whole claim and the thing no static figure can make.
//
// THE ARITHMETIC, all of it §5.2's own:
//   ΔG°′ = ΔH − TΔS                       the standard value at the temperature on the slider
//   ΔG   = ΔG°′ + RT ln([product] / [reactant])
//   R    = 8.314 × 10⁻³ kJ/mol·K, so RT at 37 °C is 2.58 kJ/mol — the same 2.6 §2.2 used for thermal
//          jostling, and a tenfold ratio is RT ln 10 = 5.93 kJ/mol, the 5.9 the prose asks to be kept.
//   The equilibrium ratio is exp(−ΔG°′/RT): the product-to-reactant ratio at which ΔG reaches zero.
//
// WHAT RUNNING DOES. The mixture drifts by first-order kinetics with the two rate constants in the ratio
// the equilibrium demands (k_forward / k_back = K), so it lands on the equilibrium ratio from either
// side. **At equilibrium the two crossing counters keep climbing at equal rates**, drawn as two arrows
// over the landscape with their tallies — the figure's answer to "does the reaction stop", made the way
// `permeability` makes it, and the reason §5.2 can say equilibrium is death rather than rest.
//
// THE CELL SWITCH. With "Keep the product removed" on, the product is taken away as fast as it is made:
// it is held at the concentration it had when the switch went on, ΔG never walks up to zero, and a timer
// reports how long it has stayed negative. That is §5.2's reason metabolism is arranged in pathways.
//
// UNITS ON THE CONTROLS. The entropy slider is in joules per mole per kelvin, because kilojoules would
// put three decimals on a control; `deltaSKjPerK` in describe() is in kJ/mol·K as the chapter quotes it,
// and the readout prints TΔS in kJ/mol, which is the number that decides anything. The concentration
// sliders step in tenths of a decade; while the reaction runs their thumbs snap to the nearest rung and
// the figure beside them is the exact concentration, so the control never disagrees with the table.
//
// Two compositions. This figure carries a genuine second one, for the reason its brief gives: a
// two-series plot at 390 px puts its axis labels under nine device pixels.
//   wide   — landscape and its trace down the left, the two readouts as one table on the right;
//   narrow — landscape across the top of a 3/4 stage, and under it one five-row table: the standard
//            value, the concentration term, the true ΔG, the verdict and the equilibrium ratio. The
//            trace is dropped in favour of those live figures and the seconds-negative counter, and the
//            landscape carries ΔH and TΔS as a line of type under it so nothing is lost with it. Both
//            tables keep their desktop labels, because item goals quote them; what the narrow toolbar
//            drops is the UNIT beside each slider's value, which the table above prints in every state.
//
// describe() is documented at the foot of this file.
import { C, clamp } from './lib/svg.js';
import { bench } from './lib/bench.js';

export const meta = { kind: 'free-energy', title: 'Which way does it go, and why that is not fixed', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 };

// ---------------------------------------------------------------- the model

const R = 8.314e-3; // kJ/mol·K
const KELVIN = 273.15;
const EQ_BAND = 0.2; // kJ/mol: how close to zero counts as equilibrium, stated so a task can quote it
const K_BASE = 0.55; // forward rate constant per second at the reference, so a run settles in seconds

// The concentration ladder: 41 rungs of a tenth of a decade, 0.01 to 100 mmol/L.
const RUNGS = 40;
const rungToMM = (i) => 10 ** (-2 + (i / RUNGS) * 4);
const mmToRung = (mm) => clamp(Math.round(((Math.log10(clamp(mm, 0.01, 100)) + 2) / 4) * RUNGS), 0, RUNGS);

const OPEN = { deltaH: -20, deltaSJ: -40, temperatureC: 37, reactantRung: mmToRung(10), productRung: mmToRung(1) };

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
const superscript = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');

// A ratio that may be 19 or 8 × 10²⁶, set the way a table would set it rather than as 8.1e+26.
function showRatio(x) {
  if (!Number.isFinite(x)) return '—';
  if (x >= 1e4 || (x > 0 && x < 1e-3)) {
    const e = Math.floor(Math.log10(x));
    const m = x / 10 ** e;
    return `${m.toFixed(1)} × 10${superscript(e)}`;
  }
  return x >= 10 ? x.toFixed(1) : x.toFixed(2);
}
const showMM = (mm) => (mm >= 10 ? mm.toFixed(1) : mm >= 1 ? mm.toFixed(2) : mm.toFixed(3));
// A tally that may be 40 or forty million. Past a million it goes to the same exponent form the ratio
// takes, because eight digits of tabular figures at 9 px do not fit the line they share with an arrow.
const showCount = (n) => (n >= 1e6 ? showRatio(n) : String(Math.round(n)));

// ---------------------------------------------------------------- style

const NARROW_W = 800;
const NARROW_H = 380;

const CSS = `
.tb-free-energy .fe-floor { fill: color-mix(in srgb, var(--paper-3) 62%, var(--paper)); }
.tb-free-energy .fe-curve { fill: none; stroke: var(--ink); stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; }
.tb-free-energy .fe-drop { stroke: var(--rule-strong); stroke-width: 1.1; stroke-dasharray: 3 3; }
.tb-free-energy .fe-axis { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-free-energy .fe-tally { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-free-energy .fe-arrow { stroke: var(--ink-soft); stroke-width: 1.6; fill: none; stroke-linecap: round; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W, height: NARROW_H },
    seed: 52,
  });
  const fit = b.fit;
  const n1 = (v) => b.num(v, 1);

  // ---- state ----
  let deltaH = OPEN.deltaH;
  let deltaSJ = OPEN.deltaSJ; // J/mol·K on the control
  let temperatureC = OPEN.temperatureC;
  let reactantMM = rungToMM(OPEN.reactantRung);
  let productMM = rungToMM(OPEN.productRung);
  let productRemoved = false;
  let heldProductMM = productMM;
  let crossingsForward = 0;
  let crossingsBack = 0;
  let secondsNegative = 0;
  let history = [];
  let sampleDue = 0;
  let syncing = false;

  const tempK = () => temperatureC + KELVIN;
  const deltaS = () => deltaSJ / 1000; // kJ/mol·K, the unit describe() reports
  const tDeltaS = () => tempK() * deltaS();
  const deltaGStandard = () => deltaH - tDeltaS();
  const concentrationTerm = () => R * tempK() * Math.log(productMM / reactantMM);
  const deltaG = () => deltaGStandard() + concentrationTerm();
  const equilibriumRatio = () => Math.exp(-deltaGStandard() / (R * tempK()));

  function verdictOf(g) {
    if (g < -EQ_BAND) return 'exergonic';
    if (g > EQ_BAND) return 'endergonic';
    return 'equilibrium';
  }

  // The temperature at which the sign of ΔG°′ changes. It exists only when the two terms pull the same
  // way: with ΔH and ΔS of opposite signs, one of them wins at every positive temperature.
  function flipTemperatureC() {
    const s = deltaS();
    if (Math.abs(s) < 1e-6) return null;
    const k = deltaH / s;
    return k > 0 ? k - KELVIN : null;
  }

  // Which term is carrying the reaction: whichever of ΔH and −TΔS pushes ΔG°′ the way it has actually
  // gone. Null when the two cancel, because then neither is carrying anything.
  function carrier() {
    const g = deltaGStandard();
    if (Math.abs(g) < EQ_BAND) return null;
    const a = deltaH;
    const c = -tDeltaS();
    return g < 0 ? (a < c ? 'heat' : 'entropy') : (a > c ? 'heat' : 'entropy');
  }

  function restartModel() {
    deltaH = OPEN.deltaH;
    deltaSJ = OPEN.deltaSJ;
    temperatureC = OPEN.temperatureC;
    reactantMM = rungToMM(OPEN.reactantRung);
    productMM = rungToMM(OPEN.productRung);
    productRemoved = false;
    heldProductMM = productMM;
    crossingsForward = 0;
    crossingsBack = 0;
    secondsNegative = 0;
    history = [];
    sampleDue = 0;
    if (removeBtn) removeBtn.set(false, { quiet: true });
    syncControls();
  }

  // ---- panes ----
  const landscape = b.pane('landscape', {
    as: 'svg',
    focus: true,
    aria: 'A reaction drawn as a tilting landscape, with the reactants on one side and the products on the other and the two crossing tallies above them. Space runs or pauses the reaction, P keeps the product removed, and Home resets.',
  });
  const readout = b.pane('readout', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 56fr) minmax(0, 44fr)',
      rows: 'minmax(0, 1fr)',
      at: { landscape: [1, 1], readout: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 48fr) minmax(0, 52fr)',
      at: { landscape: [1, 1], readout: [1, 2] },
    },
  });

  // ---- controls: the chemistry, then the conditions, then the switch and the clock ----
  //
  // Five sliders cannot share a 390 px stage while each carries a word for a label and its unit in the
  // value: the toolbar came to five rows of a stage that is 1370 px tall at 3×, which is a third of
  // everything there is. Two things cut that, and both are the bench's: `short` gives each slider the
  // chapter's own symbol at phone width, the accessible name staying the words a recipe addresses; and
  // `format` is told which width it is setting, so the unit can leave the value at narrow and the two
  // spans are written together instead of the figure re-setting all five when the stage crosses over.
  // Nothing is hidden: the table above prints all five with their units at every width.
  const suffix = (o, u) => (o.narrow ? '' : ` ${u}`);
  const hSlider = b.slider('Heat term', {
    min: -80, max: 80, step: 2, value: deltaH, short: 'ΔH',
    format: (v, o) => `${v}${suffix(o, 'kJ/mol')}`,
    onInput: (v) => { if (syncing) return; deltaH = v; afterChange(); },
  });
  const sSlider = b.slider('Entropy term', {
    min: -250, max: 250, step: 5, value: deltaSJ, short: 'ΔS',
    format: (v, o) => `${v}${suffix(o, 'J/mol·K')}`,
    onInput: (v) => { if (syncing) return; deltaSJ = v; afterChange(); },
  });
  const tSlider = b.slider('Temperature', {
    min: 0, max: 80, step: 1, value: temperatureC, unit: '°C', short: 'T',
    onInput: (v) => { if (syncing) return; temperatureC = v; afterChange(); },
  });
  b.divide();
  const rSlider = b.slider('Reactant', {
    min: 0, max: RUNGS, step: 1, value: OPEN.reactantRung, short: 'React',
    format: (i, o) => `${showMM(rungToMM(i))}${suffix(o, 'mmol/L')}`,
    onInput: (i) => { if (syncing) return; reactantMM = rungToMM(i); afterChange(); },
  });
  const pSlider = b.slider('Product', {
    min: 0, max: RUNGS, step: 1, value: OPEN.productRung, short: 'Prod',
    format: (i, o) => `${showMM(rungToMM(i))}${suffix(o, 'mmol/L')}`,
    onInput: (i) => { if (syncing) return; productMM = rungToMM(i); heldProductMM = productMM; afterChange(); },
  });
  b.divide();
  b.action('Hydrophobic effect', () => hydrophobicPreset(), {
    short: 'Hydrophobic',
    aria: 'Hydrophobic effect, load a reaction that takes heat in and runs anyway',
  });
  const removeBtn = b.toggle('Keep the product removed', (on) => {
    productRemoved = on;
    heldProductMM = productMM;
    afterChange();
  }, {
    short: 'Keep removed',
    aria: 'Keep the product removed, take it away as fast as it is made',
    pressed: false,
  });
  b.divide();
  const runCtl = b.run({ aria: 'Run, let the mixture drift towards equilibrium', onChange: () => { draw(); b.announce(); } });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the bench back as it opened' });

  b.keys({
    ' ': () => runCtl.toggle(),
    Enter: () => runCtl.toggle(),
    p: () => removeBtn.toggle(),
    P: () => removeBtn.toggle(),
    Home: () => resetAll(),
  });

  // ---- reader actions ----
  function afterChange() {
    draw();
    b.announce();
  }

  // §5.2 uses the hydrophobic effect as the case where a change that takes heat in still runs, so a
  // reader should be able to get there without guessing two slider positions: heat term slightly
  // positive, entropy term strongly positive.
  function hydrophobicPreset() {
    deltaH = 8;
    deltaSJ = 90;
    temperatureC = 37;
    hSlider.set(8);
    sSlider.set(90);
    tSlider.set(37);
    afterChange();
  }

  function resetAll() {
    runCtl.set(false);
    b.restart(); // which calls restartModel()
    b.announce();
  }

  // The concentration sliders follow the mixture while it runs, so the control never contradicts the
  // table beside it. `syncing` keeps the slider's own handler from writing the rung back into the model
  // and quantising a continuous concentration to a tenth of a decade every frame.
  function syncControls() {
    syncing = true;
    hSlider.set(deltaH);
    sSlider.set(deltaSJ);
    tSlider.set(temperatureC);
    rSlider.set(mmToRung(reactantMM));
    pSlider.set(mmToRung(productMM));
    syncing = false;
    shownR = showMM(reactantMM);
    shownP = showMM(productMM);
  }
  // The exact rung, which may sit between two steps: the range input snaps its thumb to the nearest one,
  // and the value printed beside it is `format(exact)`, the true concentration. Feeding it the rounded
  // rung instead made the control read 0.501 mmol/L while the table beside it read 0.558, which looks
  // like a defect and is one.
  const rungOf = (mm) => ((Math.log10(clamp(mm, 0.01, 100)) + 2) / 4) * RUNGS;
  let shownR = '';
  let shownP = '';
  function syncConcentrations() {
    const r = showMM(reactantMM);
    const p = showMM(productMM);
    if (r === shownR && p === shownP) return;
    syncing = true;
    if (r !== shownR) { rSlider.set(rungOf(reactantMM)); shownR = r; }
    if (p !== shownP) { pSlider.set(rungOf(productMM)); shownP = p; }
    syncing = false;
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    advance: (dt) => {
      const K = equilibriumRatio();
      const kF = K_BASE;
      const kB = K > 0 ? K_BASE / K : K_BASE * 1e6;
      // Both rates are capped: at the far ends of the two chemistry sliders the equilibrium constant is
      // 10³⁰, and an uncapped back rate would put an Infinity on a tally within a few frames.
      const vF = Math.min(kF * reactantMM, 1e6);
      const vB = Math.min(kB * productMM, 1e6);
      crossingsForward += vF * dt * 10;
      crossingsBack += vB * dt * 10;
      reactantMM = clamp(reactantMM + (vB - vF) * dt, 0.01, 1e4);
      productMM = clamp(productMM + (vF - vB) * dt, 0.01, 1e4);
      // The cell switch: the product is taken away as fast as it is made, so it never builds up.
      if (productRemoved) productMM = heldProductMM;
      const g = deltaG();
      secondsNegative = g < 0 ? secondsNegative + dt : 0;
      sampleDue -= dt;
      if (sampleDue <= 0) {
        sampleDue = 0.1;
        history.push({ g, p: productMM });
        if (history.length > 240) history.shift();
      }
      syncConcentrations();
    },
  });

  // ---- what describe() reports ----
  function state() {
    const g = deltaG();
    return {
      deltaHKj: deltaH,
      deltaSKjPerK: Number(deltaS().toFixed(4)),
      temperatureC,
      deltaGStandardKj: Number(deltaGStandard().toFixed(2)),
      entropyDriven: deltaH > 0 && deltaGStandard() < 0,
      flipTemperatureC: flipTemperatureC() === null ? null : Number(flipTemperatureC().toFixed(1)),
      reactantMM: Number(reactantMM.toFixed(3)),
      productMM: Number(productMM.toFixed(3)),
      concentrationTermKj: Number(concentrationTerm().toFixed(2)),
      deltaGKj: Number(g.toFixed(2)),
      verdict: verdictOf(g),
      equilibriumRatio: Number(equilibriumRatio().toPrecision(6)),
      ratioNow: Number((productMM / reactantMM).toFixed(4)),
      crossingsForward: Math.round(crossingsForward),
      crossingsBack: Math.round(crossingsBack),
      atEquilibrium: Math.abs(g) <= EQ_BAND,
      productRemoved,
      secondsNegative: Number(secondsNegative.toFixed(2)),
      carryingTerm: carrier(),
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // The sentence the readout prints and a screen reader hears. Read aloud in every state its parts can
  // take: exergonic, endergonic, at equilibrium, product removed, and each of those paused.
  function situation() {
    const g = deltaG();
    const v = verdictOf(g);
    if (productRemoved) {
      return v === 'endergonic'
        ? 'the product is held there, and ΔG is still positive.'
        : `the product goes as fast as it is made: ${n1(secondsNegative)} s negative.`;
    }
    if (v === 'equilibrium') return 'at equilibrium: ΔG zero, and both tallies still climbing.';
    if (v === 'exergonic') return 'exergonic: it runs this way until the product stops it.';
    return 'endergonic: lower the product, or raise the reactant.';
  }
  b.onAnnounce((d) => `ΔG ${n1(d.deltaGKj)} kJ per mole, ${d.verdict}. Standard ${n1(d.deltaGStandardKj)}, concentration term ${n1(d.concentrationTermKj)}. ${d.crossingsForward} crossings forward, ${d.crossingsBack} back. ${situation()}`);

  // ---------------------------------------------------------------- the landscape

  function drawLandscape() {
    const { w, h } = landscape.clear().box;
    // A tilting landscape is a wide, short drawing: given a tall pane it becomes a thin curve stranded
    // in an empty box, which is what the first draft was. So the band it gets is sized for it, and at
    // desktop width the trace takes the rest of the pane. Below the threshold the trace is dropped and
    // the landscape has the whole pane, because two series at 390 px put their labels under nine device
    // pixels and the live figures say the same thing without them.
    const tallyH = clamp(h * 0.12, 18, 28);
    const padL = clamp(w * 0.05, 10, 30);
    // A right margin for the ΔG bracket. The first draft put it on the slope at mid-span, where its
    // label lay across the curve it was measuring.
    const padR = clamp(w * 0.19, 46, 96);
    const padB = clamp(h * 0.08, 16, 26);
    const top = tallyH + 6;
    const plotW = Math.max(40, w - padL - padR);
    const band = b.narrow ? h - top - padB : clamp(h * 0.44, 96, 230);
    const plotH = Math.max(40, band);
    const traceH = Math.max(0, h - top - plotH - padB - 14);

    drawTallies(w, tallyH);

    // Levels. In SVG a smaller y is higher up, so a negative ΔG has to put the PRODUCT plateau at the
    // larger y: the first draft had the sign the other way and drew every exergonic reaction running
    // uphill. ±40 kJ/mol fills the pane and anything past that is clamped, so the tilt saturates rather
    // than taking a ±160 reaction off the stage; the figure beside it carries the number either way.
    const g = deltaG();
    const scale = (plotH * 0.42) / 40;
    const drop = clamp(-g * scale, -plotH * 0.42, plotH * 0.42);
    const mid = top + plotH * 0.5;
    const yR = mid - drop / 2;
    const yP = mid + drop / 2;
    const flat = plotW * 0.27;
    const xR = padL + flat;
    const xP = padL + plotW - flat;

    // The floor under the curve, so the landscape reads as ground and not as a line graph.
    landscape.path(
      `M${b.num(padL, 1)} ${b.num(yR, 1)} L${b.num(xR, 1)} ${b.num(yR, 1)} C${b.num(xR + plotW * 0.13, 1)} ${b.num(yR, 1)} ${b.num(xP - plotW * 0.13, 1)} ${b.num(yP, 1)} ${b.num(xP, 1)} ${b.num(yP, 1)} L${b.num(padL + plotW, 1)} ${b.num(yP, 1)} L${b.num(padL + plotW, 1)} ${b.num(top + plotH, 1)} L${b.num(padL, 1)} ${b.num(top + plotH, 1)} Z`,
      { class: 'fe-floor' },
    );
    landscape.path(
      `M${b.num(padL, 1)} ${b.num(yR, 1)} L${b.num(xR, 1)} ${b.num(yR, 1)} C${b.num(xR + plotW * 0.13, 1)} ${b.num(yR, 1)} ${b.num(xP - plotW * 0.13, 1)} ${b.num(yP, 1)} ${b.num(xP, 1)} ${b.num(yP, 1)} L${b.num(padL + plotW, 1)} ${b.num(yP, 1)}`,
      { class: 'fe-curve' },
    );

    // The mixture itself, standing on the two plateaus: reactant molecules on the left, product on the
    // right, in the proportions the concentrations have now. Running the reaction walks them across, so
    // the landscape carries the state rather than one marker dot on an otherwise empty ground.
    const frac = clamp(productMM / Math.max(1e-9, productMM + reactantMM), 0, 1);
    const molR = clamp(w * 0.012, 3.4, 6.4);
    const shown = 12;
    const asProduct = clamp(Math.round(frac * shown), 0, shown);
    const stackH = molR * 2 + 1.6 + molR * 1.5;
    const spread = (x0, count, colour, yy) => {
      if (count <= 0) return;
      const span = Math.min(flat * 0.8, count * molR * 2.4);
      const step = count > 1 ? span / (count - 1) : 0;
      for (let i = 0; i < count; i += 1) {
        landscape.circle(x0 - span / 2 + i * step, yy - molR - 1.6 - (i % 2) * molR * 1.5, molR, { fill: colour, stroke: C.paper, 'stroke-width': 1.1 });
      }
    };
    spread(padL + flat * 0.5, shown - asProduct, C.water, yR);
    spread(padL + plotW - flat * 0.5, asProduct, C.leaf, yP);

    // The two ends, named — drawn AFTER the molecules and cleared of the stack they stand on, because
    // set before them the words ended up underneath the discs and "Products" disappeared entirely.
    // One decision for both, taken from the higher of the two plateaus: placed separately, one end read
    // above its line and the other below it, which looks like two different kinds of label.
    const nameSize = clamp(w * 0.028, 9.6, 12.6);
    const above = Math.min(yR, yP) - stackH - 6 > top + nameSize;
    placeEnd(padL + flat * 0.5, yR - stackH, 'Reactants', nameSize, above);
    placeEnd(padL + plotW - flat * 0.5, yP - stackH, 'Products', nameSize, above);

    // ΔG as a measured drop between the two levels, in the margin kept for it, with a dashed lead from
    // each plateau. When the two ends have come together the arrow is dropped and the figure stands
    // alone, because an arrow three pixels long is not a measurement.
    const valSize = clamp(w * 0.026, 9.4, 11.6);
    // A third of the margin for the lead and the bracket, two thirds for the figure. At 0.58 the lead
    // left 33 px, "ΔG -13.5" needs 34 at its floor, and the fitter dropped the number while keeping the
    // "kJ/mol" under it — a unit with nothing to be the unit of.
    const lead = padL + plotW + padR * 0.34;
    landscape.line(xR, yR, lead, yR, { class: 'fe-drop' });
    landscape.line(xP, yP, lead, yP, { class: 'fe-drop' });
    const bx = padL + plotW + padR * 0.18;
    const hi = Math.min(yR, yP);
    const lo = Math.max(yR, yP);
    if (lo - hi >= 16) {
      landscape.line(bx, hi, bx, lo, { class: 'fe-arrow' });
      landscape.path(`M${b.num(bx - 3.6, 1)} ${b.num(hi + 6, 1)} L${b.num(bx, 1)} ${b.num(hi, 1)} L${b.num(bx + 3.6, 1)} ${b.num(hi + 6, 1)}`, { class: 'fe-arrow' });
      landscape.path(`M${b.num(bx - 3.6, 1)} ${b.num(lo - 6, 1)} L${b.num(bx, 1)} ${b.num(lo, 1)} L${b.num(bx + 3.6, 1)} ${b.num(lo - 6, 1)}`, { class: 'fe-arrow' });
    }
    // "-0.0 kJ/mol" is a rounding artefact and reads as a defect, so a ΔG inside the band prints as 0.0.
    const gShown = Math.abs(g) < 0.05 ? '0.0' : n1(g);
    const labelX = lead + 3;
    const room = w - labelX - 2;
    const midY = (hi + lo) / 2;
    // Fitted to the room the margin actually leaves, not to an estimate of it — and stacked on two lines
    // where one will not go, rather than dropped, because the number is the claim.
    const oneLine = `ΔG ${gShown}`;
    if (fit(oneLine, room, valSize, 9)) {
      landscape.label(labelX, midY - 1, oneLine, { size: valSize, anchor: 'start', fill: C.ink });
      landscape.text(labelX, midY + valSize + 1, 'kJ/mol', { class: 'fe-axis', fit: [valSize - 1, 7.4], width: room });
    } else {
      landscape.label(labelX, midY - valSize * 0.6, 'ΔG', { size: valSize, anchor: 'start', fill: C.ink, fit: [valSize, 7.4], width: room });
      landscape.label(labelX, midY + valSize * 0.55, gShown, { size: valSize, anchor: 'start', fill: C.ink, fit: [valSize, 7.4], width: room });
      landscape.text(labelX, midY + valSize * 1.7, 'kJ/mol', { class: 'fe-axis', fit: [valSize - 1, 7.2], width: room });
    }

    // The two terms, as the narrow composition's replacement for the chemistry rows of the table — and
    // useful at every width, because it says which of the two is doing the work.
    const c = carrier();
    const terms = `ΔH ${n1(deltaH)} · TΔS ${n1(tDeltaS())} kJ/mol`;
    const foot = `${terms}${c ? ` · the ${c} term is carrying it` : ' · the two terms cancel'}`;
    const footY = top + plotH + padB * 0.7;
    landscape.text(padL, footY, fit(foot, w - padL - 2, 10.6, 8.6) ? foot : terms, { class: 'fe-axis', fit: [10.6, 8.2], width: w - padL - 2 });

    // The trace, in the band this pane kept for it. Two series at 390 px put their labels under nine
    // device pixels, so below the threshold there is no band and the live figures carry it instead.
    if (traceH > 0) {
      const ty = top + plotH + padB + 13;
      landscape.text(padL, ty - 4, 'ΔG and product, the last 24 seconds', { class: 'tb-rt-note', 'font-size': 9.4, fit: [9.4, 8], width: plotW * 0.7 });
      landscape.text(padL + plotW, ty - 4, 'ΔG · product', { anchor: 'end', class: 'tb-rt-note', 'font-size': 9.4 });
      if (history.length > 1) {
        landscape.trace({
          series: [['g', C.ink], ['p', C.leaf]],
          data: history, window: 240, x: padL, y: ty, width: plotW, height: Math.max(18, h - ty - 6),
        });
      } else {
        landscape.text(padL, ty + 16, 'press Run and it builds here', { class: 'tb-rt-note', 'font-size': 9.4, fit: [9.4, 8], width: plotW });
      }
    }
    landscape.focusMark();
  }

  function curveY(frac, yR, yP, flatFrac) {
    if (frac <= flatFrac) return yR;
    if (frac >= 1 - flatFrac) return yP;
    const u = (frac - flatFrac) / Math.max(1e-6, 1 - 2 * flatFrac);
    const s = u * u * (3 - 2 * u); // the same smoothstep shape the cubic above draws
    return yR + (yP - yR) * s;
  }

  // The name goes above the plateau where there is room over it and under it where there is not, so a
  // reaction pushed to the top of the band still names both of its ends.
  function placeEnd(x, y, word, size, above) {
    landscape.label(x, above ? y - 6 : y + size + 22, word, { size, fill: C.ink, halo: 3 });
  }

  // The two tallies, on their own line at the top of the pane where no part of the landscape reaches.
  // At equilibrium they climb at equal rates, which is the point of drawing them at all.
  function drawTallies(w, tallyH) {
    const size = clamp(w * 0.026, 9.4, 11.6);
    const y = tallyH * 0.58;
    const half = w / 2;
    const arrow = (x0, x1, yy) => {
      landscape.line(x0, yy, x1, yy, { class: 'fe-arrow' });
      const dir = x1 > x0 ? -1 : 1;
      landscape.path(`M${b.num(x1 + dir * 5, 1)} ${b.num(yy - 3.4, 1)} L${b.num(x1, 1)} ${b.num(yy, 1)} L${b.num(x1 + dir * 5, 1)} ${b.num(yy + 3.4, 1)}`, { class: 'fe-arrow' });
    };
    arrow(2, 22, y - size * 0.35);
    landscape.text(26, y, `${showCount(crossingsForward)} forward`, { class: 'fe-tally', fit: [size, 8], width: half - 30 });
    arrow(w - 2, w - 22, y - size * 0.35);
    landscape.text(w - 26, y, `${showCount(crossingsBack)} back`, { anchor: 'end', class: 'fe-tally', fit: [size, 8], width: half - 30 });
    landscape.line(0, tallyH, w, tallyH, { stroke: C.rule });
  }

  // ---------------------------------------------------------------- the readout

  // The table is BUILT, MEASURED and, if it would not fit, built again shorter. `readout()` only
  // collects rows until `fill()` draws them, and `height(rowH)` is pure, so the cost of asking is
  // nothing. Deciding instead from `b.narrow` is a guess about the toolbar's height, and with five
  // sliders the guess was wrong: at 390 px the last lines were drawn under the controls. What a short
  // pane gives up, in order: the chemistry and conditions rows, whose figures the landscape's foot line
  // and the two sliders already carry, and then the flip-temperature line — leaving exactly the five
  // rows the chapter brief asks for at that width, with their desktop labels.
  const MIN_ROW = 13;
  function drawReadout() {
    const { w, h } = readout.clear().box;
    const size = clamp(w * 0.028, 9.6, 11.6);
    const g = deltaG();
    const flip = flipTemperatureC();
    readout.readout({ title: 'Free energy', width: w, size, minRow: MIN_ROW, maxRow: 28 })
      .fit(h, (r, level) => {
        if (level < 1) {
          r.head('Chemistry');
          r.row('Heat term ΔH', `${n1(deltaH)} kJ/mol`);
          r.row('Entropy term TΔS', `${n1(tDeltaS())} kJ/mol`);
          r.head('Conditions');
          r.row('Reactant', `${showMM(reactantMM)} mmol/L`);
          r.row('Product', `${showMM(productMM)} mmol/L`);
        }
        r.row('Standard ΔG°′', `${n1(deltaGStandard())} kJ/mol`);
        r.row('Concentration term', `${n1(concentrationTerm())} kJ/mol`);
        r.rule();
        r.sum('True ΔG', `${n1(g)} kJ/mol`);
        // The -text values, not the figure accents: an accent spent as type is the commonest legibility
        // fault in this book, and the readout's ground is --paper-2. Measured 2026-09-17: --leaf on it is
        // 4.36:1 — the one problem the baseline run reported — against 5.2:1 for --leaf-text; --coral is
        // 4.4:1 there against 4.9:1 for --coral-text. The word keeps its hue and its meaning.
        r.row('Verdict', verdictOf(g), { accent: verdictOf(g) === 'exergonic' ? C.leafText : verdictOf(g) === 'endergonic' ? C.coralText : undefined });
        r.row('Equilibrium ratio', showRatio(equilibriumRatio()));
        if (level < 2) {
          r.note(flip === null
            ? 'the two terms pull the same way, so the sign never flips'
            : `the sign of ΔG°′ flips at ${n1(flip)} °C`);
        }
        r.note(situation());
      });
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }
  b.onDraw(() => {
    drawLandscape();
    drawReadout();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   deltaHKj            the heat term, kJ/mol
  //   deltaSKjPerK        the entropy term, kJ/mol per kelvin (the slider shows J/mol·K)
  //   temperatureC        degrees Celsius
  //   deltaGStandardKj    ΔH − TΔS at that temperature
  //   entropyDriven       ΔH positive and the standard ΔG negative — the hydrophobic-effect case
  //   flipTemperatureC    where the sign of ΔG°′ changes; null when the two terms never let it
  //   reactantMM, productMM  mmol/L, live: they drift while the reaction runs
  //   concentrationTermKj RT ln(product ÷ reactant)
  //   deltaGKj            the true value: the standard value plus the concentration term
  //   verdict             'exergonic' | 'endergonic' | 'equilibrium', computed from deltaGKj with a
  //                       0.2 kJ/mol band around zero
  //   equilibriumRatio    the product-to-reactant ratio at which ΔG reaches zero
  //   ratioNow            product ÷ reactant at this moment
  //   crossingsForward, crossingsBack  since reset; equal and both still rising at equilibrium
  //   atEquilibrium       |ΔG| within the same band
  //   productRemoved      the cell switch
  //   secondsNegative     how long ΔG has been negative without interruption
  //   carryingTerm        'heat' | 'entropy' | null, which term the sign of ΔG°′ is owed to
  //   t, playing          the clock, and whether it is running
  // Nothing is cumulative across Reset: the two tallies, the timer and the trace all go back to nothing,
  // so describe() after Reset equals describe() at mount.
  return b.handle();
}
