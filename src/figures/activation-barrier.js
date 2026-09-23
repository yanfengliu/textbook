// The barrier moves; the two ends do not. One reaction drawn twice over and kept in step: a free energy
// landscape with reactants, a barrier and products, and a molecular scene in which substrate molecules
// arrive, bind, are converted and leave. Beside them, a short table of the forward rate, the reverse
// rate, ΔG and the ratio at which the two rates balance.
//
// **THE CLAIM THIS FIGURE EXISTS TO MAKE, and how the code makes it impossible to fake.** §5.5 says an
// enzyme changes the route and not the destination. So:
//   - `DELTA_G` is a module constant. Nothing recomputes it, nothing derived from the enzyme touches it,
//     and the reverse barrier is `activationKj − DELTA_G` — which is what makes both barriers fall by
//     exactly the same amount when the enzyme is added, because they are one subtraction apart.
//   - `equilibriumRatio` is exp(−ΔG/RT). It is a function of the fixed ΔG and the temperature, and of
//     nothing else, so no enzyme control can reach it. Adding enzyme leaves it byte-identical.
//   - The reverse rate constant is the forward one divided by that ratio, so **both rates rise by the
//     same factor** and the ratio at which they balance cannot move. That is not three separate claims
//     kept in step by hand; it is one arrangement of the arithmetic.
//   - Running the same reaction from pure product lands on the same ratio, which is why `startedFrom`
//     exists: it is a result the reader produces rather than one they are shown.
// The temperature does move the balance ratio, and honestly: the ratio is ΔG measured against RT, so a
// warmer bench balances at a smaller ratio with the same ΔG. The table says which of the two controls is
// doing it, because a reader who finds the ratio moving needs to know it was not the enzyme.
//
// THE NUMBERS, all of them §5.5's own conversion — 5.9 kJ/mol off the barrier multiplies the rate by ten
// at body temperature:
//   ΔG               −12 kJ/mol, fixed
//   bare barrier     68 kJ/mol forward, so 80 kJ/mol back
//   the enzyme's cut 3 × RT ln 10 = 17.81 kJ/mol, computed rather than rounded, so the speed-up reads
//                    exactly 1000 at 37 °C. It is three decades and not §5.5's seventeen, because a
//                    figure whose catalysed run finished in a microsecond would show the reader nothing;
//                    the module says so rather than implying the enzyme is a weak one.
//   rates            k = 10⁸ exp(−Ea/RT) per second, which puts the bare reaction at 3.5 × 10⁻⁴ a second
//                    (nothing happens while you watch) and the catalysed one at 0.35 (a few seconds to
//                    settle). Rates are printed as conversions a second out of a pot of a hundred.
//
// Temperature past the enzyme's limit unfolds it, and the loss is irreversible, as §5.6 says: cooling
// the bench again does not fold the enzyme back, and only adding fresh enzyme does. The catalysed route
// runs in parallel with the uncatalysed one, weighted by how much enzyme is still folded, so the barrier
// the landscape draws springs back on its own as the enzyme goes rather than being switched.
//
// Two compositions. This figure carries a genuine second one:
//   wide   — landscape down the left, molecular scene top right, the four-row table under it;
//   narrow — landscape across the upper part of a 4/5 stage, the molecular scene under it, and the table
//            beneath both as one group. The offer buttons come before the temperature slider in the
//            toolbar, because they are what the narrow reader is most likely to press. The landscape's
//            labels — reactants, transition state, products — keep their desktop wording at both widths.
//
// describe() is documented at the foot of this file.
import { C, clamp } from './lib/svg.js';
import { metabolismPart } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = { kind: 'activation-barrier', title: 'The barrier moves; the two ends do not', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

// ---------------------------------------------------------------- the model

const R = 8.314e-3; // kJ/mol·K
const KELVIN = 273.15;
const T_REF_K = 310.15;

const DELTA_G = -12; // kJ/mol. Fixed, and the whole section turns on nothing being able to move it.
const ACT_BARE = 68; // kJ/mol, the uncatalysed forward barrier
const ENZYME_DROP = 3 * R * T_REF_K * Math.LN10; // 17.81 kJ/mol: three of §5.5's 5.9 kJ/mol decades
const PRE = 1e8; // the pre-exponential, per second
const POT = 100; // the pot the rates are quoted out of
const MIN_FRAC = 0.001;

const MELT_C = 44; // where the unfolding curve is half way up
const UNFOLD_MAX = 2.0; // per second, at the top of it
const INHIBITOR_BLOCK = 0.7; // how much of the enzyme a competitive inhibitor takes out while offered

const OPEN = { temperatureC: 37 };

const kAt = (Ea, tK) => PRE * Math.exp(-Ea / (R * tK));
const unfoldRate = (tC) => UNFOLD_MAX / (1 + Math.exp(-(tC - MELT_C) / 0.9));

const ENZYME = metabolismPart('enzyme');

const OFFERS = [
  { id: 'none', label: 'Offer nothing', short: 'Nothing', aria: 'Offer nothing, leave the active site empty' },
  { id: 'substrate', label: 'Offer the substrate', short: 'Substrate', aria: 'Offer the substrate, the molecule this site is for' },
  { id: 'wrong-shape', label: 'Offer a wrong shape', short: 'Wrong shape', aria: 'Offer a wrong shape, a molecule the site cannot hold' },
  { id: 'inhibitor', label: 'Offer an inhibitor', short: 'Inhibitor', aria: 'Offer an inhibitor, a molecule that sits in the site and is not converted' },
];
const OFFER_COLOUR = { substrate: C.water, 'wrong-shape': C.gold, inhibitor: C.coral };

const showRate = (v) => (v >= 10 ? v.toFixed(1) : v >= 0.1 ? v.toFixed(2) : v >= 0.001 ? v.toFixed(4) : v.toExponential(1));
const showTimes = (v) => (v >= 1000 ? `×${Math.round(v / 10) * 10}` : v >= 10 ? `×${Math.round(v)}` : `×${v.toFixed(1)}`);

// ---------------------------------------------------------------- style

const NARROW_W = 800;
const NARROW_H = 400;

const CSS = `
.tb-activation-barrier .ab-floor { fill: color-mix(in srgb, var(--paper-3) 58%, var(--paper)); }
.tb-activation-barrier .ab-curve { fill: none; stroke: var(--ink); stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; }
.tb-activation-barrier .ab-ghost { fill: none; stroke: var(--rule-strong); stroke-width: 1.6; stroke-dasharray: 5 4; }
.tb-activation-barrier .ab-lead { stroke: var(--rule-strong); stroke-width: 1; stroke-dasharray: 3 3; }
.tb-activation-barrier .ab-arrow { stroke: var(--ink-soft); stroke-width: 1.5; fill: none; stroke-linecap: round; }
.tb-activation-barrier .ab-note { fill: var(--ink-faint); }
.tb-activation-barrier .ab-tally { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-activation-barrier .ab-grip { stroke: var(--ink-soft); stroke-width: 1.2; stroke-linecap: round; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W, height: NARROW_H },
    seed: 55,
  });
  const fit = b.fit;
  const n1 = (v) => b.num(v, 1);

  // ---- state ----
  let enzymePresent = false;
  let intact = 1; // how much of the enzyme is still folded; it only falls, and only heat makes it fall
  let temperatureC = OPEN.temperatureC;
  let offered = 'none';
  let transitionShown = false;
  let startedFrom = 'reactant';
  let productFrac = MIN_FRAC;
  let converted = 0;
  let reverted = 0;

  const tempK = () => temperatureC + KELVIN;
  const kBare = () => kAt(ACT_BARE, tempK());
  // The catalysed route runs in PARALLEL with the uncatalysed one, weighted by how much enzyme is still
  // folded and by how much of it an inhibitor has taken out. With no enzyme the sum is kBare exactly, so
  // the barrier the landscape draws returns to 68.00 and not to something near it.
  const catalysedShare = () => (enzymePresent ? intact * (1 - (offered === 'inhibitor' ? INHIBITOR_BLOCK : 0)) : 0);
  const kForward = () => kBare() + catalysedShare() * (kAt(ACT_BARE - ENZYME_DROP, tempK()) - kBare());
  const equilibriumRatio = () => Math.exp(-DELTA_G / (R * tempK()));
  const kReverse = () => kForward() / equilibriumRatio();
  const activationKj = () => -R * tempK() * Math.log(kForward() / PRE);
  const activationReverseKj = () => activationKj() - DELTA_G;
  const speedUp = () => kForward() / kBare();
  const denatured = () => intact < 0.5;
  const ratioNow = () => productFrac / Math.max(MIN_FRAC, 1 - productFrac);

  function restartModel() {
    enzymePresent = false;
    intact = 1;
    temperatureC = OPEN.temperatureC;
    offered = 'none';
    transitionShown = false;
    startedFrom = 'reactant';
    productFrac = MIN_FRAC;
    converted = 0;
    reverted = 0;
    if (enzymeCtl) enzymeCtl.set('none', { quiet: true });
    if (startCtl) startCtl.set('reactant', { quiet: true });
    if (offerCtl) offerCtl.set('none', { quiet: true });
    if (tsBtn) tsBtn.set(false, { quiet: true });
    if (tempSlider) { syncing = true; tempSlider.set(OPEN.temperatureC); syncing = false; }
  }
  let syncing = false;

  // ---- panes ----
  const landscape = b.pane('landscape', {
    as: 'svg',
    focus: true,
    aria: 'A free energy landscape: reactants on the left, a barrier in the middle, products on the right, with the two barrier heights and ΔG marked. Press E to add or remove enzyme, T to show the transition state, Space to run or pause, and Home to reset.',
  });
  const scene = b.pane('scene', { as: 'svg' });
  const rates = b.pane('rates', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 56fr) minmax(0, 44fr)',
      rows: 'minmax(0, 45fr) minmax(0, 55fr)',
      at: { landscape: [1, '1 / 3'], scene: [2, 1], rates: [2, 2] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      // The table gets the largest share: it is four rows and a sentence, and at thirty per cent of what
      // a five-row toolbar leaves it had to give the sentence up. Eleven controls rendered as eleven
      // pills is what costs this figure its stage at 390 px; the bench has no more compact control.
      rows: 'minmax(0, 34fr) minmax(0, 26fr) minmax(0, 40fr)',
      at: { landscape: [1, 1], scene: [1, 2], rates: [1, 3] },
    },
  });

  // ---- controls ----
  const enzymeCtl = b.choice('Enzyme', [
    { id: 'none', label: 'Remove enzyme', short: 'Remove', aria: 'Remove enzyme, take the catalyst off the bench' },
    { id: 'present', label: 'Add enzyme', short: 'Add', aria: 'Add enzyme, put fresh catalyst on the bench' },
  ], (id) => {
    enzymePresent = id === 'present';
    if (enzymePresent) intact = 1; // fresh enzyme: unfolding is not undone, it is replaced
    after();
  }, { value: 'none', segmented: true });
  b.divide();
  const startCtl = b.choice('Start from', [
    { id: 'reactant', label: 'Start from reactant', short: 'Reactant', aria: 'Start from reactant, empty the pot and fill it with reactant' },
    { id: 'product', label: 'Start from product', short: 'Product', aria: 'Start from product, empty the pot and fill it with product' },
  ], (id) => {
    startedFrom = id;
    productFrac = id === 'product' ? 1 - MIN_FRAC : MIN_FRAC;
    converted = 0;
    reverted = 0;
    after();
  }, { value: 'reactant', segmented: true });
  b.divide();
  // Three groups, not five. Each b.divide() costs a whole toolbar row at 390 px, because a group wraps
  // as a unit: eleven buttons in five groups came to six rows and the rate table was drawn under them.
  // So: what is on the bench and which end it starts from; what is offered to the site and what is
  // marked on it; and how it is run. Three groups come to five rows and leave the table its space.
  // Each choice is a segmented strip at that width, which takes the gaps out from between its options
  // and sets them as the one control they are.
  const offerCtl = b.choice('Offer', OFFERS, (id) => { offered = id; after(); }, { value: 'none', segmented: true });
  const tsBtn = b.toggle('Show the transition state', (on) => { transitionShown = on; after(); }, {
    short: 'Transition state',
    aria: 'Show the transition state, mark the worst moment of the climb',
    pressed: false,
  });
  b.divide();
  const tempSlider = b.slider('Temperature', {
    min: 10, max: 60, step: 1, value: temperatureC, unit: '°C', short: 'T',
    onInput: (v) => { if (syncing) return; temperatureC = v; after(); },
  });
  const runCtl = b.run({ aria: 'Run, let the reaction go', onChange: () => { draw(); b.announce(); } });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the bench back as it opened' });

  b.keys({
    ' ': () => runCtl.toggle(),
    Enter: () => runCtl.toggle(),
    e: () => enzymeCtl.set(enzymePresent ? 'none' : 'present'),
    E: () => enzymeCtl.set(enzymePresent ? 'none' : 'present'),
    t: () => tsBtn.toggle(),
    T: () => tsBtn.toggle(),
    Home: () => resetAll(),
  });

  function after() {
    draw();
    b.announce();
  }
  function resetAll() {
    runCtl.set(!ctx.reducedMotion);
    b.restart(); // which calls restartModel()
    b.announce();
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    advance: (dt) => {
      if (enzymePresent && intact > 0) intact = Math.max(0, intact - intact * unfoldRate(temperatureC) * dt);
      const fP = productFrac;
      const fR = 1 - fP;
      const vF = kForward() * fR;
      const vB = kReverse() * fP;
      converted += vF * POT * dt;
      reverted += vB * POT * dt;
      productFrac = clamp(fP + (vF - vB) * dt, MIN_FRAC, 1 - MIN_FRAC);
    },
  });

  // ---- what describe() reports ----
  function state() {
    const fR = 1 - productFrac;
    return {
      enzymePresent,
      activationKj: Number(activationKj().toFixed(2)),
      activationReverseKj: Number(activationReverseKj().toFixed(2)),
      deltaGKj: DELTA_G,
      equilibriumRatio: Number(equilibriumRatio().toPrecision(8)),
      forwardPerSecond: Number((kForward() * fR * POT).toPrecision(5)),
      reversePerSecond: Number((kReverse() * productFrac * POT).toPrecision(5)),
      speedUp: Number(speedUp().toPrecision(6)),
      startedFrom,
      ratioNow: Number(ratioNow().toFixed(3)),
      converted: Math.round(converted),
      reverted: Math.round(reverted),
      temperatureC,
      denatured: denatured(),
      enzymeIntact: Number(intact.toFixed(3)),
      offered,
      accepted: offered === 'substrate',
      siteClosed: offered === 'substrate' && enzymePresent && !denatured(),
      transitionShown,
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // The sentence the table prints and a screen reader hears, read aloud in every state its parts take:
  // with and without enzyme, denatured, each of the four offers, and settled either side of the balance.
  // Kept short on purpose: the bench's readout sets a note as one line, and a sentence that wraps to
  // three rows is three rows the table does not have at 390 px.
  function situation() {
    if (offered === 'wrong-shape') return 'the site will not close on the wrong shape: nothing happens.';
    if (offered === 'inhibitor') return 'the inhibitor blocks, slowing both ways and moving no ratio.';
    if (enzymePresent && denatured()) return 'unfolded: the barrier sprang back. Only fresh enzyme helps.';
    if (enzymePresent && offered === 'substrate') return `induced fit: the site closed, the barrier is down ${n1(ENZYME_DROP)}.`;
    if (enzymePresent) return 'both rates up by the same factor: the ratio has not moved.';
    return `no enzyme: the bare ${ACT_BARE} kJ/mol barrier, and little gets over.`;
  }
  b.onAnnounce((d) => `Barrier ${n1(d.activationKj)} forward, ${n1(d.activationReverseKj)} back. ΔG ${n1(d.deltaGKj)} kJ per mole, unchanged. Balance ratio ${n1(d.equilibriumRatio)}, ratio now ${b.num(d.ratioNow, 2)}. ${situation()}`);

  // ---------------------------------------------------------------- the landscape
  //
  // The energy-to-pixel scale is FIXED, from the constants above, and never fitted to the data. A scale
  // that adjusted itself would move the two ends of the landscape every time the barrier changed, which
  // is the one thing this figure must not do.
  const E_TOP = ACT_BARE + 6;
  const E_BOTTOM = DELTA_G - 6;

  // Energy along the reaction coordinate, in kJ/mol relative to the reactants. The peak is exactly the
  // current barrier, which is what makes the drawn hump and the printed number the same claim.
  function profile(u, Ea) {
    const flat = 0.17;
    if (u <= flat) return 0;
    if (u >= 1 - flat) return DELTA_G;
    const v = (u - flat) / (1 - 2 * flat);
    const s = v * v * (3 - 2 * v);
    return DELTA_G * s + (Ea - DELTA_G * 0.5) * Math.sin(Math.PI * v) ** 2;
  }

  function drawLandscape() {
    const { w, h } = landscape.clear().box;
    const padL = clamp(w * 0.05, 8, 26);
    const padR = clamp(w * 0.2, 46, 96); // room at the right for the ΔG bracket and its figure
    const padT = clamp(h * 0.12, 16, 30);
    const padB = clamp(h * 0.12, 16, 28);
    const plotW = Math.max(40, w - padL - padR);
    const plotH = Math.max(40, h - padT - padB);
    const Y = (e) => padT + ((E_TOP - e) / (E_TOP - E_BOTTOM)) * plotH;
    const X = (u) => padL + u * plotW;

    // What the vertical is, said once, so the two barrier figures beside their arrows need no units of
    // their own — there is no room for them at 390 px and they would be the first thing dropped.
    landscape.text(0, clamp(padT * 0.42, 9, 12), 'free energy, kJ/mol', { class: 'tb-rt-title', fit: [9.8, 8], width: w * 0.6 });

    const Ea = activationKj();
    const yR = Y(0);
    const yP = Y(DELTA_G);
    const peakY = Y(Ea);
    const peakX = X(0.5);

    const points = (EaFor) => {
      let d = '';
      for (let i = 0; i <= 72; i += 1) {
        const u = i / 72;
        d += `${i ? 'L' : 'M'}${b.num(X(u), 1)} ${b.num(Y(profile(u, EaFor)), 1)}`;
      }
      return d;
    };
    const curve = points(Ea);
    landscape.path(`${curve} L${b.num(X(1), 1)} ${b.num(padT + plotH, 1)} L${b.num(padL, 1)} ${b.num(padT + plotH, 1)} Z`, { class: 'ab-floor' });
    // The route the reaction would have to take without the enzyme, kept on the stage as a ghost so the
    // fall is a comparison rather than a memory.
    if (Ea < ACT_BARE - 0.05) landscape.path(points(ACT_BARE), { class: 'ab-ghost' });
    landscape.path(curve, { class: 'ab-curve' });

    // The two ends. These are the labels an item may quote, so they keep their wording at every width.
    const nameSize = clamp(w * 0.027, 9.4, 12.4);
    landscape.label(X(0.085), yR - 9, 'Reactants', { size: nameSize, fill: C.ink });
    landscape.label(X(0.915), yP - 9, 'Products', { size: nameSize, fill: C.ink });

    // ΔG, measured at the right between the two levels. This is the claim: it must not move. The product
    // lead runs back past the reverse arrow, so that arrow has a foot to stand on instead of floating.
    const leadX = padL + plotW + padR * 0.44;
    landscape.line(X(0.085), yR, leadX, yR, { class: 'ab-lead' });
    landscape.line(peakX + plotW * 0.11, yP, leadX, yP, { class: 'ab-lead' });
    const bx = padL + plotW + padR * 0.26;
    doubleArrow(bx, yR, yP);
    const gSize = clamp(w * 0.024, 9, 11.2);
    const labelX = leadX + 3;
    const room = w - labelX - 2;
    // Stacked, and fitted to the room the margin actually leaves rather than to an estimate of it: on
    // one line "ΔG -12.0" needs 50 px, the margin of a 390 px stage has thirty, and the first draft was
    // cut off by the stage. Three short lines fit where one long one does not.
    const midY = (yR + yP) / 2;
    const oneLine = `ΔG ${n1(DELTA_G)}`;
    if (fit(oneLine, room, gSize, 9)) {
      landscape.label(labelX, midY - 1, oneLine, { size: gSize, anchor: 'start', fill: C.ink });
      landscape.text(labelX, midY + gSize + 1, 'kJ/mol', { class: 'ab-note', fit: [gSize - 1, 7.2], width: room });
    } else {
      landscape.label(labelX, midY - gSize * 0.6, 'ΔG', { size: gSize, anchor: 'start', fill: C.ink, fit: [gSize, 7.4], width: room });
      landscape.label(labelX, midY + gSize * 0.55, n1(DELTA_G), { size: gSize, anchor: 'start', fill: C.ink, fit: [gSize, 7.4], width: room });
      landscape.text(labelX, midY + gSize * 1.7, 'kJ/mol', { class: 'ab-note', fit: [gSize - 1, 7.2], width: room });
    }

    // The two barriers, each drawn from its own end up to a dashed lead at the top of the climb. Without
    // that lead the arrowheads stood in mid-air above the hillside, because the curve at the arrow's own
    // x is well below the peak the arrow is measuring.
    landscape.line(X(0.2), peakY, X(0.8), peakY, { class: 'ab-lead' });
    barrier(X(0.29), yR, peakY, `${n1(Ea)}`, 'end', gSize, plotW);
    if (w > 300) barrier(X(0.71), yP, peakY, `${n1(activationReverseKj())}`, 'start', gSize, plotW);

    // The transition state: the worst moment of the journey, marked at the top of the climb.
    if (transitionShown) {
      const tsSize = clamp(w * 0.025, 9, 11.6);
      const room = plotW * 0.5;
      const above = peakY - 10 > padT + tsSize;
      landscape.circle(peakX, peakY, clamp(w * 0.009, 3.2, 5.4), { fill: C.paper, stroke: C.ink, 'stroke-width': 1.8 });
      if (fit('Transition state', room, tsSize, 8.4)) {
        landscape.label(peakX, above ? peakY - 11 : peakY + tsSize + 9, 'Transition state', { size: tsSize, fill: C.ink });
      }
    }

    // Where the mixture stands on the coordinate, so the landscape and the scene are one reaction.
    const mx = X(clamp(0.085 + ratioTo01() * 0.83, 0.02, 0.98));
    const my = Y(profile(clamp(0.085 + ratioTo01() * 0.83, 0, 1), Ea));
    landscape.circle(mx, my, clamp(w * 0.01, 3.6, 6), { fill: C.water, stroke: C.paper, 'stroke-width': 1.5 });

    landscape.focusMark();
  }

  const ratioTo01 = () => clamp(productFrac, 0, 1);

  function doubleArrow(x, y1, y2) {
    const hi = Math.min(y1, y2);
    const lo = Math.max(y1, y2);
    if (lo - hi < 4) return;
    landscape.line(x, hi, x, lo, { class: 'ab-arrow' });
    // Two six-pixel heads need sixteen pixels between them before they stop being one blot; under that
    // the line alone says the same thing, and the figure beside it says how much.
    if (lo - hi < 16) return;
    landscape.path(`M${b.num(x - 3.6, 1)} ${b.num(hi + 6, 1)} L${b.num(x, 1)} ${b.num(hi, 1)} L${b.num(x + 3.6, 1)} ${b.num(hi + 6, 1)}`, { class: 'ab-arrow' });
    landscape.path(`M${b.num(x - 3.6, 1)} ${b.num(lo - 6, 1)} L${b.num(x, 1)} ${b.num(lo, 1)} L${b.num(x + 3.6, 1)} ${b.num(lo - 6, 1)}`, { class: 'ab-arrow' });
  }

  function barrier(x, yFoot, yPeak, label, anchor, size, plotW) {
    if (yFoot - yPeak < 8) return;
    landscape.line(x, yFoot, x, yPeak, { class: 'ab-arrow' });
    landscape.path(`M${b.num(x - 3.4, 1)} ${b.num(yPeak + 6, 1)} L${b.num(x, 1)} ${b.num(yPeak, 1)} L${b.num(x + 3.4, 1)} ${b.num(yPeak + 6, 1)}`, { class: 'ab-arrow' });
    const dx = anchor === 'end' ? -7 : 7;
    if (fit(label, plotW * 0.16, size, 8)) {
      landscape.label(x + dx, (yFoot + yPeak) / 2, label, { size, anchor, fill: C.soft, halo: 3 });
    }
  }

  // ---------------------------------------------------------------- the molecular scene

  function drawScene() {
    const { w, h } = scene.clear().box;
    const titleSize = clamp(w * 0.024, 8.8, 10.2);
    scene.text(0, titleSize, 'On the bench', { class: 'tb-rt-title', 'font-size': b.num(titleSize, 1) });
    scene.line(0, titleSize + 4, w, titleSize + 4, { stroke: C.ruleStrong });
    // The pane's vertical budget, stated once and shared out from the bottom up: the pot, then the line
    // that says what the sites are holding, then whatever is left for the bench itself. Sizing the band
    // as a fraction and the foot as another put the sentence across the pot's molecules at 390 px.
    const top = titleSize + 10;
    const noteSize = clamp(w * 0.023, 8.4, 10);
    const potH = clamp(h * 0.24, 18, 38);
    // From the bottom up, so the three cannot overlap however short the pane gets: the pot has its own
    // strip, the sentence sits on the line above it, and the bench takes whatever is left. Where that
    // leaves the bench too little, the SENTENCE goes rather than being floored into the molecules — a
    // `Math.max` on the band is what put it across them at 390 px, and the table carries it anyway.
    const potTop = h - potH;
    const roomy = potTop - 5 - noteSize - 4 - top >= 18;
    const noteY = roomy ? potTop - 5 : 0;
    const bandH = Math.max(12, (roomy ? noteY - noteSize - 4 : potTop - 4) - top);

    const n = clamp(Math.floor(w / 78), 2, 5);
    const cw = w / n;
    const R0 = Math.max(8, Math.min(cw * 0.3, bandH * 0.34));
    const cy = top + bandH * 0.52;

    for (let i = 0; i < n; i += 1) {
      const cx = cw * (i + 0.5);
      if (enzymePresent && !denatured()) drawEnzyme(cx, cy, R0, i, n);
      else if (enzymePresent) drawUnfolded(cx, cy, R0);
      // Two rows of collisions where the band can hold them, one where it cannot: at a phone's scene
      // height the second row ran into the sentence under the bench.
      else drawBareCollision(cx, cy, R0, i, n, bandH >= 46 ? 2 : 1);
    }
    // What the sites are holding, said in words as well as drawn, so the picture and `offered` can never
    // disagree: with nothing offered the bench is running on its own substrate, which is not an offer.
    const what = !enzymePresent ? 'no enzyme: molecules meet and bounce'
      : denatured() ? 'the enzyme has unfolded'
        : offered === 'none' ? 'running on the bench’s own substrate'
          : offered === 'substrate' ? 'you offered the substrate; the site closed on it'
            : offered === 'wrong-shape' ? 'you offered a wrong shape; the site will not close'
              : 'you offered an inhibitor; it sits there and is not converted';
    if (roomy) scene.text(0, noteY, what, { class: 'ab-note', fit: [noteSize, 7.4], width: w });

    // The pot, under the bench: a line of molecules, product filling in from the left, so the ratio is
    // something to count rather than a number to take on trust.
    drawPot(w, potTop, potH);
  }

  // A pale lobe with a pocket cut into its top. The pocket closes around what the site accepts, which is
  // induced fit drawn as a closing; the contacts are drawn as short ticks, and there are more of them on
  // the transition state than on the substrate, which is the one idea under all the others.
  function drawEnzyme(cx, cy, R0, i, n) {
    // With nothing offered the site runs its own cycle: a substrate arrives, is held, and leaves as
    // product. With something offered, every site holds that instead and the cycle stops, so the picture
    // and `offered` say the same thing.
    const cycling = offered === 'none';
    const phase = (b.time * cycleRate() + i / n) % 1;
    const closed = offered === 'substrate' || (cycling && phase >= 0.25 && phase < 0.7);
    scene.ellipse(cx, cy, R0, R0 * 0.84, { fill: ENZYME.color });
    const py = cy - R0 * 0.42;
    const pocket = closed ? R0 * 0.3 : R0 * 0.42;
    scene.circle(cx, py, pocket, { fill: C.paper });
    if (R0 > 17) scene.text(cx, cy + R0 * 0.52, 'enzyme', { anchor: 'middle', 'font-size': b.num(clamp(R0 * 0.3, 7.6, 9.6), 1), style: `fill:${ENZYME.symbolColor}` });

    const mr = Math.max(1.6, pocket * 0.72);
    if (cycling) {
      if (phase < 0.25) {
        // arriving
        const p = phase / 0.25;
        scene.circle(cx - R0 * (1.9 - p * 1.9), py, mr, { fill: C.water, stroke: C.paper, 'stroke-width': 1, opacity: b.num(0.4 + 0.6 * p, 2) });
      } else if (phase < 0.7) {
        heldMolecule(cx, py, mr, pocket, C.water);
      } else {
        const p = (phase - 0.7) / 0.3;
        scene.circle(cx + R0 * (0.2 + p * 1.7), py, mr, { fill: C.leaf, stroke: C.paper, 'stroke-width': 1, opacity: b.num(1 - p * 0.7, 2) });
      }
      return;
    }
    const colour = OFFER_COLOUR[offered] ?? C.water;
    if (offered === 'wrong-shape') {
      // A triangle, standing off the pocket it cannot enter: the site's fussiness is a shape, not a rule.
      const my = py - pocket - mr - 2;
      scene.path(
        `M${b.num(cx, 1)} ${b.num(my - mr, 1)} L${b.num(cx + mr, 1)} ${b.num(my + mr * 0.8, 1)} L${b.num(cx - mr, 1)} ${b.num(my + mr * 0.8, 1)} Z`,
        { fill: colour, stroke: C.paper, 'stroke-width': 1 },
      );
    } else if (offered === 'inhibitor') {
      scene.circle(cx, py, mr, { fill: colour, stroke: C.paper, 'stroke-width': 1 });
    } else {
      heldMolecule(cx, py, mr, pocket, colour);
    }
  }

  // What is in the site, and how hard it is held. The transition state is drawn strained and gripped at
  // six points where the substrate is gripped at three, which is Pauling's idea and the one under all
  // the others: an enzyme binds the worst moment of the journey more tightly than the molecule it holds.
  function heldMolecule(cx, cy, mr, pocket, colour) {
    if (transitionShown) {
      scene.ellipse(cx, cy, mr * 1.25, mr * 0.68, { fill: colour, stroke: C.paper, 'stroke-width': 1 });
      for (let g = 0; g < 6; g += 1) grip(cx, cy, pocket, (g / 6) * Math.PI * 2);
      return;
    }
    scene.circle(cx, cy, mr, { fill: colour, stroke: C.paper, 'stroke-width': 1 });
    for (let g = 0; g < 3; g += 1) grip(cx, cy, pocket, Math.PI * (0.15 + g * 0.35));
  }

  function grip(cx, cy, r, a) {
    const x0 = cx + Math.cos(a) * r * 0.82;
    const y0 = cy + Math.sin(a) * r * 0.82;
    scene.line(x0, y0, cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3, { class: 'ab-grip' });
  }

  function drawUnfolded(cx, cy, R0) {
    let d = `M${b.num(cx - R0, 1)} ${b.num(cy, 1)}`;
    for (let i = 1; i <= 10; i += 1) {
      const x = cx - R0 + (2 * R0 * i) / 10;
      const y = cy + Math.sin(i * 1.7) * R0 * 0.5;
      d += ` L${b.num(x, 1)} ${b.num(y, 1)}`;
    }
    scene.path(d, { fill: 'none', stroke: ENZYME.color, 'stroke-width': Math.max(2, R0 * 0.22), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  }

  // Without enzyme there is no site at all: molecules meet and bounce apart, which is what a barrier of
  // 68 kJ/mol means at 37 °C. Two rows, because one row of dots in a pane this tall is a half-empty
  // panel, and because a bench of free molecules is what the reader is meant to see.
  function drawBareCollision(cx, cy, R0, i, n, rows = 2) {
    const r = Math.max(3.4, R0 * 0.32);
    for (let row = 0; row < rows; row += 1) {
      const phase = (b.time * 0.35 + i / n + row * 0.5) % 1;
      const sep = R0 * (0.5 + Math.abs(Math.sin(phase * Math.PI)) * 0.85);
      const y = rows === 1 ? cy : cy + (row === 0 ? -R0 * 0.5 : R0 * 0.55);
      scene.circle(cx - sep, y, r, { fill: C.water, stroke: C.paper, 'stroke-width': 1 });
      scene.circle(cx + sep, y, r, { fill: C.water, stroke: C.paper, 'stroke-width': 1 });
      // The bounce: two short marks springing apart, drawn only where the pair is closest.
      if (phase < 0.12 || phase > 0.88) {
        scene.line(cx - sep + r + 2, y, cx - sep + r + 6, y, { class: 'ab-grip' });
        scene.line(cx + sep - r - 2, y, cx + sep - r - 6, y, { class: 'ab-grip' });
      }
    }
  }

  const cycleRate = () => clamp(kForward() * 3, 0.15, 3);

  function drawPot(w, y, h) {
    const n = 24;
    const made = clamp(Math.round(productFrac * n), 0, n);
    const step = w / n;
    const size = clamp(w * 0.023, 8.4, 10);
    const r = clamp(Math.min(step * 0.34, (h - size - 4) * 0.42), 2, 7);
    const cy = y + r + 1;
    for (let i = 0; i < n; i += 1) {
      scene.circle(step * (i + 0.5), cy, r, { fill: i < made ? C.leaf : C.water, stroke: C.paper, 'stroke-width': 0.9 });
    }
    scene.text(0, y + h - 1, `${Math.round(converted)} converted`, { class: 'ab-tally', fit: [size, 7.4], width: w * 0.48 });
    scene.text(w, y + h - 1, `${Math.round(reverted)} back`, { anchor: 'end', class: 'ab-tally', fit: [size, 7.4], width: w * 0.48 });
  }

  // ---------------------------------------------------------------- the four-row table

  // Four rows, always — the chapter brief's own table — and then as much of the two sentences as the
  // pane holds. `r.fit` builds the table, measures it, and builds it again shorter if it would not fit;
  // deciding from `b.narrow` instead is a guess about the toolbar's height, and at 390 px the guess was
  // wrong and the sentences were drawn under the controls. The speed-up line goes first, because the
  // landscape carries both barriers and the pot carries both tallies.
  const MIN_ROW = 13;
  function drawRates() {
    const { w, h } = rates.clear().box;
    const size = clamp(w * 0.028, 9.6, 11.6);
    const fR = 1 - productFrac;
    rates.readout({ title: 'Rates and destination', width: w, size, minRow: MIN_ROW, maxRow: 28 })
      .fit(h, (r, level) => {
        r.row('Forward rate', `${showRate(kForward() * fR * POT)} /s`);
        r.row('Reverse rate', `${showRate(kReverse() * productFrac * POT)} /s`);
        r.row('ΔG', `${n1(DELTA_G)} kJ/mol`);
        r.row('Balance ratio', n1(equilibriumRatio()));
        if (level < 1) r.note(`speed-up ${showTimes(speedUp())} · ratio now ${b.num(ratioNow(), 2)} · started from ${startedFrom === 'product' ? 'product' : 'reactant'}`);
        if (level < 2) r.note(situation());
      });
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }
  b.onDraw(() => {
    drawLandscape();
    drawScene();
    drawRates();
  });

  runCtl.set(!ctx.reducedMotion);

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   enzymePresent        whether there is catalyst on the bench
  //   activationKj         the effective forward barrier, kJ/mol: 68.00 with no enzyme, 50.19 with it,
  //                        and everything between as the enzyme unfolds
  //   activationReverseKj  the reverse barrier — activationKj minus ΔG, so it falls by the same amount
  //   deltaGKj             −12, a module constant: identical with and without enzyme, in every state
  //   equilibriumRatio     exp(−ΔG/RT). No enzyme control reaches it; the temperature slider does, and
  //                        the table says so
  //   forwardPerSecond, reversePerSecond  conversions a second out of a pot of a hundred
  //   speedUp              the forward rate constant ÷ the bare one: 1 with no enzyme, 1000 at 37 °C
  //                        with fresh enzyme, and lower when an inhibitor is in the site
  //   startedFrom          'reactant' or 'product' — which end this run was started from
  //   ratioNow             product ÷ reactant at this moment
  //   converted, reverted  conversions each way since reset, and since either Start-from button
  //   temperatureC         degrees Celsius
  //   denatured            less than half the enzyme is still folded
  //   enzymeIntact         0 to 1, how much is; it only falls, and only heat makes it fall
  //   offered              'none' | 'substrate' | 'wrong-shape' | 'inhibitor'
  //   accepted             the site closed on what was offered and will convert it — true only for the
  //                        substrate. The inhibitor is drawn sitting in the site and refused, because
  //                        what it costs is §5.6's measurement and not this section's
  //   siteClosed           induced fit has happened: accepted, with folded enzyme present
  //   transitionShown      whether the worst moment of the climb is marked
  //   t, playing           the clock, and whether it is running
  // Nothing is cumulative across Reset: the two tallies, the unfolding and the mixture all go back, so
  // describe() after Reset equals describe() at mount.
  return b.handle();
}
