// A loop, and what happens when you cut it.
//
// WHAT IS ON THE STAGE. Five enzyme-catalysed steps from threonine to isoleucine — the textbook case
// §5.7 works through — each with its own enzyme and its own bar for the pool standing before it, and the
// end product joined back to the first enzyme by an inhibition loop drawn as a loop. Beside the pathway
// is a close-up of that first enzyme: its two shapes, its allosteric site, the product binding and
// unbinding, and its rate curve drawn against the ordinary one-subunit curve for comparison. Under that
// is the covalent panel, where a kinase puts a phosphate on an enzyme and a phosphatase takes it off,
// with the ATP counted and the switch holding its state until the phosphatase acts.
//
// It opens RUNNING and IN BALANCE at a moderate demand — the state the reader has to disturb to learn
// anything — and the pools are seeded at the balance the model itself settles to (BALANCED below is
// computed by running the model forward at mount, not by a guess typed into a table), so the first frame
// is the steady state rather than a transient.
//
// THE LOOP CAN BE CUT THREE WAYS AND EACH FAILS DIFFERENTLY, which is §5.7's claim and this figure's
// reason to exist:
//   mutate the allosteric site   the product no longer binds, the first enzyme runs flat out, and the
//                                cell pours out an amino acid nothing is using — `runaway`;
//   knock out any one enzyme     the pool before it climbs and everything past it drains away, and WHICH
//                                pool climbs is read off the bars (`accumulatingAt` is computed from the
//                                pools, never set by the control);
//   add product from outside     the pathway shuts down although the cell made none of it, which is the
//                                cleanest demonstration that the signal is the molecule and not a
//                                measurement.
//
// THE MODEL, stated rather than implied, and it is a bookkeeping model of a regulated pathway rather
// than a kinetic model of threonine deaminase. Concentrations are millimoles per litre and rates are
// millimoles per litre per second, which are the units the prose uses.
//   supply      the cell makes threonine at SUPPLY, falling to nothing as threonine accumulates, and
//               threonine also drains away at LEAK_THR, because an amino acid has other fates;
//   each step   v_k = VMAX · x^n / (K^n + x^n) on the pool standing before it, with n = 1 for steps 2–5
//               and n = `subunits` for step 1, which is where cooperativity lives;
//   the loop    step 1 is multiplied by 1 / (1 + (product / K_I)^NI). NI is FIXED at 2 and does not move
//               with `subunits`: the allosteric site's own cooperativity is one thing and the substrate
//               curve's is another, and tying them together put five delay stages behind a Hill
//               exponent of four, which is a Goodwin oscillator. The first constants here did exactly
//               that and the pathway cycled instead of balancing;
//   drains      every intermediate leaks at LEAK_INT, so a blocked pool settles instead of growing
//               without bound and its bar is not a lie; and the product is poured out of the cell above
//               SPILL, which is what §5.7's feedback-resistant fermenter strains do.
// The constants are chosen so that the balance sits in the middle of the sliders' range, the product's
// swing over the last thirty seconds of a two-hundred-second run is zero to four decimals, and all
// three failures are reachable.
//
// WHAT THE SUBUNIT COUNT DOES AND DOES NOT DO, drawn so that both can be read at once: it changes the
// SHAPE of the first enzyme's rate curve and the steepness at the half point, and it leaves the
// half-saturating concentration exactly where it was. `steepness` is measured off the drawn curve (the
// Hill slope at the half point, from the curve's own points) rather than reported back from the
// exponent that produced it.
//
// COMPOSITION. Three panes. Wide: the pathway across the top, the first enzyme and its curve beneath it
// on the left, the ledger on the right. Narrow (below 700 px of stage width): the pathway runs
// VERTICALLY — five steps in a row give each about seventy pixels on a phone — with each pool's bar to
// the right of its step, which is also the reading order; the enzyme close-up, the rate curve and the
// covalent rows move to a second pane the reader switches to with the `Pathway` / `Enzyme` control,
// which appears only at that width because at desktop width both panes are already on the stage; and the
// ledger keeps a full-width row underneath. Nothing is dropped.
//
// WHAT THE BENCH COULD NOT DO, recorded rather than worked around. (1) `readout.note()` draws one <text>
// and does not wrap, so the sentences are broken into lines here against the pane's own width. (2) There
// is no stepper, so `Knock out` and `Add product` are sliders at both widths rather than steppers on a
// phone. (3) A control that exists only at one width has to be hidden by the figure; the bench has no
// notion of a narrow-only control, which is why `Pathway` / `Enzyme` is driven by a recipe step that
// changes the viewport.
import { C, tint, clamp, smooth, polar } from './lib/svg.js';
import { atom, INK, round } from './lib/mol-draw.js';
import { metabolismPart, membranePart } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = {
  kind: 'feedback-pathway',
  title: 'A loop, and what happens when you cut it',
  needsWebGL: false,
  aspect: 16 / 10,
  narrowAspect: 3 / 4,
};

// ---------------------------------------------------------------- the model

// The five steps of §5.7's case, with the enzyme that catalyses each and the pool standing before it.
const STEPS = [
  { enzyme: 'Threonine deaminase', short: 'E1', pool: 'Threonine', poolShort: 'Thr', committed: true },
  { enzyme: 'Acetohydroxy acid synthase', short: 'E2', pool: '2-oxobutanoate', poolShort: '2-OB' },
  { enzyme: 'Reductoisomerase', short: 'E3', pool: 'Acetohydroxybutanoate', poolShort: 'AHB' },
  { enzyme: 'Dihydroxy-acid dehydratase', short: 'E4', pool: 'Dihydroxymethylvalerate', poolShort: 'DHMV' },
  { enzyme: 'Transaminase', short: 'E5', pool: 'Oxo-methylvalerate', poolShort: 'OMV' },
];
const PRODUCT = { pool: 'Isoleucine', poolShort: 'Ile' };

const SUPPLY = 3.0; // mmol/L per second of threonine the cell can make at most
const THR_CAP = 1.0; // mmol/L; the cell slows its own threonine supply as threonine accumulates
const LEAK_THR = 0.4; // per second; threonine has other fates — protein, for one
const VMAX1 = 2.6; // mmol/L per second, the first enzyme at full activity and saturating substrate
const VMAXD = 4.2; // mmol/L per second, steps 2 to 5
const KM = 1.4; // mmol/L, steps 2 to 5
const K1 = 0.6; // mmol/L, the first enzyme's half-saturating substrate
const KI = 0.8; // mmol/L of product at which the first enzyme is half switched off
const NI = 2; // the allosteric site's own cooperativity, and it does NOT move with `subunits` — see below
const LEAK_INT = 0.2; // per second; an intermediate also drains away, so a blocked pool is bounded
const SPILL = 3.0; // mmol/L above which the cell pours the product out — §5.7's fermenter
const SPILL_RATE = 1.0;
const RUNAWAY_MM = 1.2; // product above this, with the loop cut, is the pathway pouring out
const SWITCH_SECONDS = 0.45; // how long a kinase or a phosphatase takes to throw the switch

const hill = (x, k, n) => {
  const a = Math.max(0, x) ** n;
  return a / (k ** n + a);
};

// One step of the pathway, given the whole state. Pure, so the balance below can be found by running it.
function advanceModel(m, dt, s) {
  const product = Math.max(0, m.pools[5]) + s.productAddedMM;
  const activity = s.loopIntact ? 1 / (1 + (product / KI) ** NI) : 1;
  const supply = SUPPLY * (1 - hill(m.pools[0], THR_CAP, 2));
  const v = [];
  for (let k = 0; k < 5; k += 1) {
    if (s.knockedOut === k + 1) { v.push(0); continue; }
    const x = m.pools[k];
    v.push(k === 0 ? VMAX1 * activity * hill(x, K1, s.subunits) : VMAXD * hill(x, KM, 1));
  }
  // Nothing may be taken out of a pool faster than the pool holds: a negative concentration is a
  // negative bar, and a negative bar is the chapter-3 defect that reached the live site.
  for (let k = 0; k < 5; k += 1) v[k] = Math.min(v[k], m.pools[k] / dt + (k === 0 ? supply : 0));
  const consumed = Math.min(s.demand, m.pools[5] / dt);
  const spilled = Math.max(0, m.pools[5] - SPILL) * SPILL_RATE;
  m.pools[0] = Math.max(0, m.pools[0] + (supply - v[0] - LEAK_THR * m.pools[0]) * dt);
  for (let k = 1; k < 5; k += 1) m.pools[k] = Math.max(0, m.pools[k] + (v[k - 1] - v[k] - LEAK_INT * m.pools[k]) * dt);
  m.pools[5] = Math.max(0, m.pools[5] + (v[4] - consumed - spilled) * dt);
  m.activity = activity;
  m.flux = v[4];
  m.spilled = spilled;
  return m;
}

const DEFAULTS = { demand: 1.0, loopIntact: true, knockedOut: null, productAddedMM: 0, subunits: 4 };

// The balance the model settles to at the opening settings, found by running it rather than typed in.
// Two hundred seconds at a sixtieth is well past the slowest pool's approach, and the product's swing
// over the last thirty seconds of that run is zero to four decimal places: this model settles rather
// than cycling, which an earlier set of constants did not — five delay stages and a Hill exponent of
// four in the loop is a Goodwin oscillator, and a figure that opens "in balance" must not be one.
const BALANCED = (() => {
  const m = { pools: [0.8, 0.3, 0.3, 0.3, 0.3, 0.4], activity: 1, flux: 0 };
  for (let i = 0; i < 200 * 60; i += 1) advanceModel(m, 1 / 60, DEFAULTS);
  return m.pools.map((p) => round(p, 4));
})();

// The Hill slope of the first enzyme's rate curve at its half point, measured off the curve this figure
// draws rather than read back from the exponent that produced it: d ln(v / (vmax - v)) / d ln x at K1.
function measuredSteepness(n) {
  const at = (x) => hill(x, K1, n);
  const lo = K1 * 0.9;
  const hi = K1 * 1.1;
  const f = (x) => Math.log(at(x) / (1 - at(x)));
  return (f(hi) - f(lo)) / (Math.log(hi) - Math.log(lo));
}

// The scale every bar is drawn against, quantised so it does not shuffle from frame to frame while the
// pathway is merely running, and grown when one pool piles up — which is what makes "that one is huge"
// legible instead of clipping every bar at a fixed ceiling.
function barScale(pools) {
  const top = Math.max(...pools);
  return Math.max(1.2, Math.ceil((top * 1.08) / 0.4) * 0.4);
}

// ---------------------------------------------------------------- style

const NARROW_W = 700;

const CSS = `
.tb-feedback-pathway .fp-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.09em; }
.tb-feedback-pathway .fp-name { fill: var(--ink); font-weight: 600; }
.tb-feedback-pathway .fp-note { fill: var(--ink-faint); }
.tb-feedback-pathway .fp-num { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-feedback-pathway .fp-axis { fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.tb-feedback-pathway .fp-sym { font-weight: 700; }
`;

const ENZYME = metabolismPart('enzyme');
const ATP = metabolismPart('atp');
const GLUCOSE = membranePart('glucose');

const n1 = (v) => Number(v).toFixed(1);
const n2 = (v) => Number(v).toFixed(2);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 20260917 });
  const fit = b.fit;

  const START = { ...DEFAULTS, pane: 'pathway', kinaseOn: false, phosphataseOn: false };
  let s = { ...START };
  let m = { pools: [...BALANCED], activity: 1, flux: 0 };
  let phosphorylated = false;
  let atpSpent = 0;
  let switchHeldSeconds = 0;
  let switchProgress = 0;

  const productTotal = () => m.pools[5] + s.productAddedMM;
  // Read off the bars, never set by the knockout control: the pool that is both well above its
  // neighbours and above the level a running pathway holds.
  function accumulatingAt() {
    let best = null;
    let bestValue = 1.3; // a pool has to be well above a working pathway's level to count as piling up
    for (let k = 0; k < 5; k += 1) {
      const next = k < 4 ? m.pools[k + 1] : m.pools[5];
      if (m.pools[k] > bestValue && m.pools[k] > next * 2.5) {
        best = k + 1;
        bestValue = m.pools[k];
      }
    }
    return best;
  }
  const runaway = () => !s.loopIntact && m.pools[5] > RUNAWAY_MM;

  // ---- panes ----
  const pathway = b.pane('pathway', {
    as: 'svg',
    focus: true,
    aria: 'Five enzyme-catalysed steps from threonine to isoleucine, with a bar for each pool and an inhibition loop from the product back to the first enzyme. Press Space to run, L to break or mend the loop, Home to reset.',
  });
  const enzyme = b.pane('enzyme', { as: 'svg' });
  const ledger = b.pane('ledger', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 57fr) minmax(0, 43fr)',
      rows: 'minmax(0, 54fr) minmax(0, 46fr)',
      at: { pathway: ['1 / 3', 1], enzyme: [1, 2], ledger: [2, 2] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      // The pathway and the enzyme share one cell; the control below chooses which is displayed, and the
      // other is taken out of the flow rather than drawn small.
      rows: 'minmax(0, 73fr) minmax(0, 27fr)',
      at: { pathway: [1, 1], enzyme: [1, 1], ledger: [1, 2] },
    },
  });

  // ---- controls ----
  const pickPane = b.choice('Show', [
    { id: 'pathway', label: 'Pathway', aria: 'Pathway, the five steps and the loop' },
    { id: 'enzyme', label: 'Enzyme', aria: 'Enzyme, the first enzyme close up with its rate curve' },
    // `only: 'narrow'`: at desktop width both panes are on the stage, so a switch between them would
    // choose between two things the reader can already see. The bench shows and hides it with the width,
    // so this file no longer reads `b.narrow` to decide.
  ], (id) => { s.pane = id; applyPanes(); draw(); b.announce(); }, { value: START.pane, only: 'narrow', segmented: true });
  b.divide();

  // No `unit` beside a `format`: the format owns the whole value, and a unit passed with it was silently
  // dropped — the readout beside this prints the units, and the bench now refuses the pair outright.
  const demandSlider = b.slider('Demand', {
    min: 0, max: 2.5, step: 0.1, value: START.demand,
    format: (v) => `${Number(v).toFixed(1)}`,
    onInput: (v) => { s.demand = v; draw(); b.announce(); },
  });
  const knockSlider = b.stepper('Knock out', {
    min: 0, max: 5, step: 1, value: 0,
    format: (v) => (Number(v) === 0 ? 'none' : `E${v}`),
    onInput: (v) => { s.knockedOut = Number(v) === 0 ? null : Number(v); draw(); b.announce(); },
  });
  const addSlider = b.slider('Add product', {
    min: 0, max: 2, step: 0.1, value: START.productAddedMM, short: 'Add',
    format: (v) => `${Number(v).toFixed(1)}`,
    onInput: (v) => { s.productAddedMM = v; draw(); b.announce(); },
  });
  b.divide();

  const btnLoop = b.toggle('Break the loop', (on) => {
    s.loopIntact = !on;
    draw();
    b.announce();
  }, { short: 'Break loop', aria: 'Break the loop, mutate the allosteric site so the product no longer binds', pressed: false });

  const pickSubunits = b.choice('Subunits', [
    { id: 1, label: 'One subunit', short: 'One', aria: 'One subunit, the ordinary bending rate curve' },
    { id: 4, label: 'Four subunits', short: 'Four', aria: 'Four subunits, the S-shaped cooperative rate curve' },
  ], (id) => { s.subunits = id; draw(); b.announce(); }, { value: START.subunits, segmented: true });
  b.divide();

  const btnKinase = b.toggle('Kinase', (on) => {
    s.kinaseOn = on;
    draw();
    b.announce();
  }, { aria: 'Kinase, put a phosphate from ATP onto the enzyme', pressed: false });
  const btnPhosphatase = b.toggle('Phosphatase', (on) => {
    s.phosphataseOn = on;
    draw();
    b.announce();
  }, { short: 'P-atase', aria: 'Phosphatase, take the phosphate off again', pressed: false });
  b.divide();

  const runCtl = b.run({ primary: true, onChange: () => { draw(); b.announce(); } });
  b.action('Reset', () => reset(), { aria: 'Reset, put the pathway back in balance and clear the tallies' });

  b.keys({
    ' ': () => runCtl.toggle(),
    l: () => btnLoop.toggle(),
    L: () => btnLoop.toggle(),
    Home: () => reset(),
  });

  // Which pane is on the stage. The switch itself is narrow-only and the bench hides it at desktop
  // width, where both panes are already there.
  function applyPanes() {
    const narrow = b.narrow;
    pathway.el.style.display = !narrow || s.pane === 'pathway' ? '' : 'none';
    enzyme.el.style.display = !narrow || s.pane === 'enzyme' ? '' : 'none';
  }

  function reset() {
    s = { ...START };
    m = { pools: [...BALANCED], activity: 1, flux: 0 };
    phosphorylated = false;
    atpSpent = 0;
    switchHeldSeconds = 0;
    switchProgress = 0;
    pickPane.set(START.pane, { quiet: true });
    pickSubunits.set(START.subunits, { quiet: true });
    btnLoop.set(false, { quiet: true });
    btnKinase.set(false, { quiet: true });
    btnPhosphatase.set(false, { quiet: true });
    demandSlider.set(START.demand);
    knockSlider.set(0);
    addSlider.set(START.productAddedMM);
    runCtl.set(true); // it opens running, so Reset leaves it running
    applyPanes();
    b.restart();
    draw();
    b.announce();
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    advance(dt) {
      advanceModel(m, dt, s);
      // The covalent switch. Both on is a real thing and not a mistake: the pair becomes a futile cycle
      // that spends ATP and holds the switch half on, which is why the ATP count is kept.
      if (s.kinaseOn && !phosphorylated) {
        switchProgress += dt / SWITCH_SECONDS;
        if (switchProgress >= 1) { phosphorylated = true; atpSpent += 1; switchProgress = 0; }
      } else if (s.phosphataseOn && phosphorylated) {
        switchProgress += dt / SWITCH_SECONDS;
        if (switchProgress >= 1) { phosphorylated = false; switchProgress = 0; }
      } else switchProgress = 0;
      switchHeldSeconds = phosphorylated && !s.kinaseOn ? switchHeldSeconds + dt : 0;
    },
    restart() {
      m = { pools: [...BALANCED], activity: 1, flux: 0 };
      phosphorylated = false;
      atpSpent = 0;
      switchHeldSeconds = 0;
      switchProgress = 0;
    },
  });

  // ---- what describe() reports ----
  function state() {
    const n = s.subunits;
    return {
      intermediatesMM: m.pools.slice(0, 5).map((p) => round(p, 3)),
      productMM: round(m.pools[5], 3),
      demand: round(s.demand, 2),
      firstEnzymeActivity: round(s.loopIntact ? 1 / (1 + (productTotal() / KI) ** NI) : 1, 3),
      loopIntact: s.loopIntact,
      productAddedMM: round(s.productAddedMM, 2),
      knockedOut: s.knockedOut,
      accumulatingAt: accumulatingAt(),
      runaway: runaway(),
      subunits: n,
      curveShape: n === 1 ? 'hyperbolic' : 'sigmoid',
      halfSaturationMM: K1,
      steepness: round(measuredSteepness(n), 2),
      phosphorylated,
      kinaseOn: s.kinaseOn,
      phosphataseOn: s.phosphataseOn,
      atpSpent,
      switchHeldSeconds: round(switchHeldSeconds, 2),
      pane: s.pane,
      t: round(b.time, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);
  b.onAnnounce((d) => {
    const acc = d.accumulatingAt ? `${STEPS[d.accumulatingAt - 1].pool} is piling up.` : 'No pool is piling up.';
    return `Isoleucine ${n2(d.productMM)} millimoles per litre, demand ${n1(d.demand)}. The first enzyme is at ${Math.round(d.firstEnzymeActivity * 100)} per cent. ${d.loopIntact ? 'The loop is intact.' : 'The loop is cut.'} ${d.knockedOut ? `Enzyme ${d.knockedOut} is knocked out. ` : ''}${acc}${d.runaway ? ' The pathway is running away.' : ''}`;
  });

  // ---------------------------------------------------------------- the pathway pane

  function drawPathway() {
    const { w, h: hgt } = pathway.clear().box;
    const narrow = b.narrow;
    const acc = accumulatingAt();
    const activity = state().firstEnzymeActivity;
    if (narrow) drawPathwayDown(w, hgt, acc, activity);
    else drawPathwayAcross(w, hgt, acc, activity);
    pathway.focusMark();
  }

  // Wide: five steps left to right, the pools as bars standing on a baseline, the loop arcing back
  // underneath from the product to the first enzyme.
  function drawPathwayAcross(w, hgt, acc, activity) {
    const pad = 6;
    const loopBand = clamp(hgt * 0.26, 42, 76);
    const base = hgt - loopBand;
    const barTop = pad + 12;
    const barH = Math.max(20, base - barTop - 16);
    const scaleMax = barScale(m.pools);
    const cols = 6;
    const colW = (w - pad * 2) / cols;
    const er = clamp(Math.min(colW * 0.2, loopBand * 0.3), 8, 18);
    const nameSize = clamp(colW * 0.115, 8.2, 10.4);
    const numSize = clamp(colW * 0.12, 8.4, 11);

    const centre = (i) => pad + colW * (i + 0.5);
    // Every bar: the pool before its enzyme, and the product at the end.
    for (let i = 0; i < 6; i += 1) {
      const value = m.pools[i];
      const x = centre(i);
      const bw = Math.max(10, colW * 0.34);
      const h = clamp((value / scaleMax) * barH, 0, barH);
      const isProduct = i === 5;
      const piling = acc === i + 1;
      pathway.rect(x - bw / 2, base - h - 14, bw, h, {
        fill: piling ? tint(C.coral, 62) : isProduct ? tint(INK.leaf, 52) : tint(C.water, 34),
      });
      pathway.line(x - bw / 2, base - 14, x + bw / 2, base - 14, { stroke: C.ruleStrong });
      pathway.text(x, base - h - 18, n2(value), { anchor: 'middle', class: 'fp-num', 'font-size': n1(numSize) });
      const label = (isProduct ? PRODUCT : STEPS[i]).poolShort;
      const size = fit(label, colW - 4, nameSize, 7.6);
      if (size) pathway.text(x, base - 3, label, { anchor: 'middle', class: 'fp-note', 'font-size': n1(size) });
    }
    // The enzymes sit on the baseline between the bars, each one taking from the pool on its left.
    for (let i = 0; i < 5; i += 1) {
      const x = pad + colW * (i + 1);
      const out = s.knockedOut === i + 1;
      drawEnzymeGlyph(pathway, x, base + er + 3, er, out ? 0 : i === 0 ? activity : 1, out, STEPS[i].short, nameSize);
      const arrowY = base + er + 3;
      if (!out) {
        pathway.path(`M${n1(x - er * 1.9)} ${n1(arrowY)} L${n1(x - er * 1.15)} ${n1(arrowY)} M${n1(x + er * 1.15)} ${n1(arrowY)} L${n1(x + er * 1.9)} ${n1(arrowY)} M${n1(x + er * 1.55)} ${n1(arrowY - 3)} L${n1(x + er * 1.9)} ${n1(arrowY)} L${n1(x + er * 1.55)} ${n1(arrowY + 3)}`, {
          fill: 'none', stroke: C.ink, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        });
      }
    }
    // The loop: from the product bar back to the first enzyme, ending in a blunt bar (inhibition), or
    // drawn cut with a gap when the allosteric site has been mutated.
    const y0 = base + er * 2 + 8;
    const yb = Math.min(hgt - 4, y0 + loopBand * 0.34);
    const xFrom = centre(5);
    const xTo = pad + colW;
    drawLoop(pathway, xFrom, xTo, y0, yb, s.loopIntact, activity, nameSize);
  }

  // Narrow: the pathway runs down the pane with each pool's bar to the right of its step, which is also
  // the reading order. Five steps in a row at 390 px would give each about seventy pixels.
  function drawPathwayDown(w, hgt, acc, activity) {
    const pad = 4;
    const loopW = clamp(w * 0.13, 26, 52);
    const left = pad + loopW;
    const scaleMax = barScale(m.pools);
    const rows = 6;
    const rowH = (hgt - pad * 2) / rows;
    const er = clamp(Math.min(rowH * 0.34, w * 0.05), 7, 15);
    const size = clamp(rowH * 0.28, 8.2, 10.4);
    const barX = left + er * 2 + 6;
    const barW = Math.max(20, w - pad - barX - 42);

    for (let i = 0; i < 6; i += 1) {
      const cy = pad + rowH * (i + 0.5);
      const isProduct = i === 5;
      const value = m.pools[i];
      const piling = acc === i + 1;
      const len = clamp((value / scaleMax) * barW, 0, barW);
      const bh = Math.max(7, rowH * 0.34);
      pathway.rect(barX, cy - bh / 2, len, bh, {
        fill: piling ? tint(C.coral, 62) : isProduct ? tint(INK.leaf, 52) : tint(C.water, 34),
      });
      pathway.line(barX, cy - bh / 2 - 1, barX, cy + bh / 2 + 1, { stroke: C.ruleStrong });
      pathway.text(w - pad, cy + size * 0.35, n2(value), { anchor: 'end', class: 'fp-num', 'font-size': n1(size) });
      const label = (isProduct ? PRODUCT : STEPS[i]).poolShort;
      if (!isProduct) {
        const out = s.knockedOut === i + 1;
        drawEnzymeGlyph(pathway, left + er, cy, er, out ? 0 : i === 0 ? activity : 1, out, STEPS[i].short, size);
      }
      // The pool's name stands over the left end of its own bar, where there is always room: measured
      // against the gap beside the enzyme glyph it was four pixels wide, so no label was drawn at all.
      const lab = fit(label, barW * 0.6, size, 7.6);
      if (lab) pathway.text(barX + 1, cy - bh / 2 - 2.5, label, { class: 'fp-note', 'font-size': n1(lab) });
    }
    // The loop runs down the left margin, from the product row back to the first enzyme's row.
    const yFrom = pad + rowH * 5.5;
    const yTo = pad + rowH * 0.5;
    drawLoopVertical(pathway, pad + loopW * 0.35, yFrom, yTo, left + er - er * 1.1, s.loopIntact, activity, size);
  }

  // The first enzyme's glyph: a blob whose active site opens with its activity, with the subunits drawn
  // as the lobes they are. A knocked-out enzyme is drawn as an outline with nothing in it.
  function drawEnzymeGlyph(pane, cx, cy, r, activity, out, label, size) {
    const g = pane.group();
    const lobes = 6;
    const pts = [];
    for (let i = 0; i < lobes * 4; i += 1) {
      const deg = (i / (lobes * 4)) * 360;
      // The site is the dip at the top; it closes as the activity falls.
      const site = Math.exp(-((((deg + 180) % 360 - 180) / 26) ** 2));
      const rr = r * (1 + 0.07 * Math.cos((deg * Math.PI * lobes) / 180) - site * 0.34 * activity);
      pts.push(polar(cx, cy, rr, deg));
    }
    pane.path(smooth(pts, { closed: true, tension: 5 }), {
      fill: out ? 'none' : ENZYME.color,
      stroke: out ? C.ruleStrong : C.paper,
      'stroke-width': out ? 1.6 : Math.max(0.7, r * 0.08),
      'stroke-dasharray': out ? '4 3' : null,
    }, g);
    const fs = fit(label, r * 1.7, r * 0.95, 6.2);
    if (fs) {
      pane.text(cx, cy + fs * 0.35, label, {
        anchor: 'middle', class: 'fp-sym', 'font-size': n1(fs),
        style: `fill:${out ? C.faint : ENZYME.symbolColor}`, parent: g,
      });
    }
    void size;
    return g;
  }

  // What the loop is doing right now, read in every state the strength can take.
  const loopWords = (strong) => (strong > 0.55
    ? 'the product is switching the first enzyme down'
    : strong > 0.25
      ? 'the product is holding the first enzyme back'
      : 'little product: the first enzyme is nearly free');

  // The inhibition loop, drawn as a loop: out of the product, back along under the pathway, and ending
  // in a blunt bar against the first enzyme. Cut, it is drawn broken with the break named.
  function drawLoop(pane, xFrom, xTo, y0, yb, intact, activity, size) {
    const mid = (xFrom + xTo) / 2;
    const strong = intact ? 1 - activity : 0;
    const colour = intact ? (strong > 0.45 ? INK.coral : C.soft) : C.ruleStrong;
    if (intact) {
      pane.path(`M${n1(xFrom)} ${n1(y0 - 6)} L${n1(xFrom)} ${n1(yb)} L${n1(xTo)} ${n1(yb)} L${n1(xTo)} ${n1(y0 - 2)}`, {
        fill: 'none', stroke: colour, 'stroke-width': 1.4 + strong * 1.8, 'stroke-linejoin': 'round',
      });
      pane.line(xTo - 6, y0 - 2, xTo + 6, y0 - 2, { stroke: colour, 'stroke-width': 1.6 + strong * 1.8 });
      const words = loopWords(strong);
      const fs = fit(words, Math.abs(xFrom - xTo) - 16, size, 7.8);
      if (fs) pane.label(mid, yb - 5, words, { size: fs, fill: C.soft });
    } else {
      pane.path(`M${n1(xFrom)} ${n1(y0 - 6)} L${n1(xFrom)} ${n1(yb)} L${n1(mid + 18)} ${n1(yb)}`, {
        fill: 'none', stroke: colour, 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'stroke-dasharray': '5 4',
      });
      pane.path(`M${n1(mid - 18)} ${n1(yb)} L${n1(xTo)} ${n1(yb)} L${n1(xTo)} ${n1(y0 - 2)}`, {
        fill: 'none', stroke: colour, 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'stroke-dasharray': '5 4',
      });
      const words = 'the site is mutated: the product no longer binds';
      const fs = fit(words, Math.abs(xFrom - xTo) - 16, size, 7.8);
      if (fs) pane.label(mid, yb - 5, words, { size: fs, fill: INK.coral });
    }
  }

  function drawLoopVertical(pane, x, yFrom, yTo, xTo, intact, activity, size) {
    const strong = intact ? 1 - activity : 0;
    const colour = intact ? (strong > 0.45 ? INK.coral : C.soft) : C.ruleStrong;
    const mid = (yFrom + yTo) / 2;
    if (intact) {
      pane.path(`M${n1(xTo + 6)} ${n1(yFrom)} L${n1(x)} ${n1(yFrom)} L${n1(x)} ${n1(yTo)} L${n1(xTo)} ${n1(yTo)}`, {
        fill: 'none', stroke: colour, 'stroke-width': 1.4 + strong * 1.8, 'stroke-linejoin': 'round',
      });
      pane.line(xTo, yTo - 5, xTo, yTo + 5, { stroke: colour, 'stroke-width': 1.6 + strong * 1.8 });
    } else {
      pane.path(`M${n1(xTo + 6)} ${n1(yFrom)} L${n1(x)} ${n1(yFrom)} L${n1(x)} ${n1(mid + 12)}`, {
        fill: 'none', stroke: colour, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'stroke-linejoin': 'round',
      });
      pane.path(`M${n1(x)} ${n1(mid - 12)} L${n1(x)} ${n1(yTo)} L${n1(xTo)} ${n1(yTo)}`, {
        fill: 'none', stroke: colour, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'stroke-linejoin': 'round',
      });
    }
    void size;
  }

  // ---------------------------------------------------------------- the enzyme pane

  function drawEnzymePane() {
    const { w, h: hgt } = enzyme.clear().box;
    const narrow = b.narrow;
    const activity = state().firstEnzymeActivity;
    const covH = clamp(hgt * (narrow ? 0.3 : 0.34), 52, 96);
    const topH = hgt - covH;
    if (narrow) {
      const closeH = topH * 0.44;
      drawCloseUp({ x: 2, y: 2, w: w - 4, h: closeH - 4 }, activity);
      drawRateCurve({ x: 2, y: closeH, w: w - 4, h: topH - closeH - 4 });
    } else {
      const closeW = Math.min(w * 0.42, topH * 1.25);
      drawCloseUp({ x: 2, y: 2, w: closeW, h: topH - 4 }, activity);
      drawRateCurve({ x: closeW + 8, y: 2, w: w - closeW - 12, h: topH - 6 });
    }
    drawCovalent({ x: 2, y: hgt - covH, w: w - 4, h: covH - 2 });
  }

  // The first enzyme close up: the body with its active site, the allosteric site beneath, and the
  // product bound there when it is switched down. Induced fit is drawn as a closing, not captioned.
  function drawCloseUp(box, activity) {
    const cx = box.x + box.w * 0.5;
    const cy = box.y + box.h * 0.52;
    const r = clamp(Math.min(box.w * 0.3, box.h * 0.32), 16, 56);
    const size = clamp(Math.min(box.w * 0.05, box.h * 0.085), 8.2, 10.4);
    const head = fit('THE FIRST ENZYME', box.w - 4, 9.4, 8);
    if (head) enzyme.text(box.x, box.y + head, 'THE FIRST ENZYME', { class: 'fp-head', 'font-size': n1(head) });

    // The body. Four subunits are drawn as four lobes that move together; one subunit as one body.
    const lobes = s.subunits === 4 ? 4 : 1;
    const pts = [];
    for (let i = 0; i < 64; i += 1) {
      const deg = (i / 64) * 360;
      const site = Math.exp(-((((deg + 180) % 360 - 180) / 22) ** 2));
      const allo = Math.exp(-(((deg % 360 - 180) / 20) ** 2));
      const rr = r * (1 + (lobes > 1 ? 0.1 * Math.cos((deg * Math.PI * lobes) / 180) : 0)
        - site * 0.36 * activity - allo * 0.2 * (1 - activity));
      pts.push(polar(cx, cy, rr, deg));
    }
    enzyme.path(smooth(pts, { closed: true, tension: 5 }), { fill: ENZYME.color, stroke: C.paper, 'stroke-width': Math.max(0.8, r * 0.05) });

    // The substrate sits at the mouth of the open site; when the site has closed it waits outside. It
    // never sits INSIDE the body: at high activity it did, and its label then lay across the enzyme.
    const sr = Math.max(4, r * 0.22);
    const sy = cy - r * (activity > 0.35 ? 1.02 : 1.5);
    enzyme.circle(cx, sy, sr, { fill: GLUCOSE.color, stroke: C.paper, 'stroke-width': 1.2 });
    enzyme.label(cx + sr + 4, sy - 2, 'threonine', { size, anchor: 'start', fill: C.soft });

    // The allosteric site and what is in it. The line at the foot of the pane is set first in the
    // budget: the ligand's label is kept clear of it, because unbound the ligand sits lower and the two
    // ran into each other at exactly the activity the figure opens at.
    const words = activity > 0.5 ? 'the site is open: the enzyme is working' : activity > 0.15 ? 'the site is closing: the enzyme is slowing' : 'the site is shut: the enzyme is switched off';
    const fs = fit(words, box.w - 4, size, 7.8);
    const footY = box.y + box.h - 2;
    const bound = 1 - activity;
    const ay = Math.min(cy + r * (bound > 0.25 ? 0.95 : 1.3), footY - (fs || size) - size * 1.4);
    enzyme.circle(cx, ay, Math.max(3.5, r * 0.19), { fill: bound > 0.25 ? INK.leaf : tint(INK.leaf, 40), stroke: C.paper, 'stroke-width': 1.2 });
    enzyme.label(cx + r * 0.19 + 4, ay + 3, bound > 0.25 ? 'isoleucine, bound' : 'isoleucine, free', { size, anchor: 'start', fill: C.soft });
    if (fs) enzyme.text(box.x, footY, words, { class: 'fp-note', 'font-size': n1(fs) });
  }

  // The rate curve: both shapes drawn together, the current one solid, so the difference the subunits
  // make is read rather than asserted. The half-saturating concentration is marked, and it does not move.
  function drawRateCurve(box) {
    const padL = 26;
    const padB = 20;
    const padT = 16;
    const pw = Math.max(30, box.w - padL - 6);
    const ph = Math.max(24, box.h - padB - padT);
    const x0 = box.x + padL;
    const y0 = box.y + padT;
    const size = clamp(Math.min(box.w * 0.035, box.h * 0.08), 8.2, 9.8);
    const xMax = K1 * 4;
    const X = (v) => x0 + (v / xMax) * pw;
    const Y = (v) => y0 + (1 - v) * ph;

    enzyme.line(x0, y0 + ph, x0 + pw, y0 + ph, { stroke: C.ruleStrong });
    enzyme.line(x0, y0, x0, y0 + ph, { stroke: C.ruleStrong });
    const head = fit('RATE AGAINST THRESHOLD SUBSTRATE', box.w, 9.2, 8);
    enzyme.text(box.x, box.y + 9, 'RATE AGAINST SUBSTRATE', { class: 'fp-head', 'font-size': n1(head ? 9.2 : 8) });

    for (const n of [1, 4]) {
      const here = n === s.subunits;
      let d = '';
      for (let i = 0; i <= 48; i += 1) {
        const x = (i / 48) * xMax;
        d += `${i ? 'L' : 'M'}${n1(X(x))} ${n1(Y(hill(x, K1, n)))}`;
      }
      enzyme.path(d, {
        fill: 'none', stroke: here ? INK.water : C.ruleStrong, 'stroke-width': here ? 2.4 : 1.4,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': here ? null : '4 3',
      });
    }
    // The half point: the one thing the subunit count leaves alone.
    enzyme.line(X(K1), y0 + ph, X(K1), Y(0.5), { stroke: C.rule, 'stroke-dasharray': '3 3' });
    enzyme.line(x0, Y(0.5), X(K1), Y(0.5), { stroke: C.rule, 'stroke-dasharray': '3 3' });
    enzyme.text(x0 - 4, Y(0.5) + 3.2, 'half', { anchor: 'end', class: 'fp-axis', 'font-size': n1(size) });
    const lab = fit(`${n1(K1)} mmol/L`, pw * 0.5, size, 7.8);
    if (lab) enzyme.text(X(K1) + 3, y0 + ph + size + 3, `${n1(K1)} mmol/L`, { class: 'fp-axis', 'font-size': n1(lab) });
    // Where the enzyme actually is now.
    const nowX = clamp(m.pools[0], 0, xMax);
    enzyme.circle(X(nowX), Y(hill(nowX, K1, s.subunits)), 3.4, { fill: INK.water, stroke: C.paper, 'stroke-width': 1.4 });
    const shape = s.subunits === 1 ? 'one subunit: it bends over' : 'four subunits: it is an S';
    const fs = fit(shape, pw, size, 7.8);
    if (fs) enzyme.text(x0 + 2, y0 + 10, shape, { class: 'fp-note', 'font-size': n1(fs) });
  }

  // The covalent panel: three rows of type, because a kinase and a phosphatase are a state and a count
  // rather than a picture. The switch holding while neither is running is the reason both exist.
  function drawCovalent(box) {
    const size = clamp(Math.min(box.w * 0.028, box.h * 0.2), 8.4, 10.6);
    enzyme.line(box.x, box.y, box.x + box.w, box.y, { stroke: C.ruleStrong });
    const head = fit('COVALENT SWITCH', box.w - 4, 9.2, 8);
    if (head) enzyme.text(box.x, box.y + head + 4, 'COVALENT SWITCH', { class: 'fp-head', 'font-size': n1(head) });
    const rows = [
      ['Kinase, phosphatase', `${s.kinaseOn ? 'on' : 'off'} · ${s.phosphataseOn ? 'on' : 'off'}`],
      ['Enzyme', phosphorylated ? 'phosphorylated' : 'unphosphorylated'],
      [switchHeldSeconds > 0 ? 'Held with no kinase' : 'ATP spent', switchHeldSeconds > 0 ? `${n1(switchHeldSeconds)} s` : String(atpSpent)],
    ];
    const top = box.y + (head || 8) + 10;
    const pitch = Math.max(size + 3, (box.h - (top - box.y) - 2) / rows.length);
    rows.forEach(([k, v], i) => {
      const y = top + pitch * (i + 0.72);
      enzyme.text(box.x, y, k, { class: 'fp-note', 'font-size': n1(size) });
      enzyme.text(box.x + box.w, y, v, { anchor: 'end', class: 'fp-num', 'font-size': n1(size) });
      enzyme.line(box.x, y + 2.5, box.x + box.w, y + 2.5, { stroke: C.rule });
    });
    // The phosphate itself, on the enzyme or off it, so the state is not type alone. It is the violet P
    // chapter 2 fixed for phosphorus, because a transferred phosphate is a phosphorus atom with its
    // oxygens and it may not have a second colour of its own.
    const pr = Math.min(8, Math.max(4.5, size * 0.85));
    const cy = box.y + (head || 8) + 8 + pr;
    const ex = box.x + box.w * 0.52;
    enzyme.circle(ex, cy, pr * 1.5, { fill: ENZYME.color, stroke: C.paper, 'stroke-width': 1 });
    enzyme.add(atom(phosphorylated ? ex + pr * 1.4 : ex + pr * 3.6, cy - pr * 0.9, 'P', pr, { label: pr >= 4.4 }));
    if (s.kinaseOn || s.phosphataseOn) {
      enzyme.circle(ex + pr * 3.6, cy - pr * 2.6, pr * 0.62, { fill: ATP.color, stroke: C.paper, 'stroke-width': 0.8 });
    }
  }

  // ---------------------------------------------------------------- the ledger

  function drawLedger() {
    const { w, h: hgt } = ledger.clear().box;
    const narrow = b.narrow;
    const d = state();
    const pad = narrow ? 2 : 6;
    const width = Math.max(40, w - pad * 2);
    const size = narrow ? 10.2 : 10.6;
    const minRow = narrow ? 13 : 14;
    const r = ledger.readout({ title: narrow ? null : 'THE PATHWAY', x: pad, width, size, minRow });
    // The readout wraps a sentence to its column and draws nothing below the pane's own box, so a table
    // with more rows than the pane is tall is clipped there rather than painted over the toolbar.
    // The whole pane, not two pixels short of it: the readout now clips at the box it is given, and the
    // pane's own bottom edge is one pixel above the toolbar (measured at 390 px), so those two pixels of
    // old safety margin were two pixels of table thrown away — atp3d lost the Total row to them.
    const room = Math.max(30, hgt);
    const note = (sentence) => r.note(sentence);

    r.row('First enzyme', `${Math.round(d.firstEnzymeActivity * 100)} %`);
    r.row('Isoleucine', `${n2(d.productMM)} mmol/L`);
    if (!narrow) {
      r.row('Demand', `${n1(d.demand)} mmol/L per s`);
      note(loopSentence(d, false));
      r.head('THE FIRST ENZYME');
      r.row('Half-saturating substrate', `${n1(K1)} mmol/L`);
      r.row('Steepness at the half point', n2(d.steepness));
      r.row('Curve', d.curveShape);
      note(blockSentence(d, false));
    } else {
      // One note at this width, and it is whichever of the two has something to say: a pool piling up
      // or an enzyme just removed outranks the loop's own state, because it is what the reader did.
      r.row('Steepness', n2(d.steepness));
      note(d.accumulatingAt || d.knockedOut ? blockSentence(d, true) : loopSentence(d, true));
    }
    r.fill(room);
  }

  // Read in every state its parts can take: intact and idling, intact and throttled, cut, or fed from
  // outside. None of the four may describe a state the figure is not in.
  function loopSentence(d, narrow) {
    if (!d.loopIntact) {
      if (d.runaway) {
        return narrow
          ? 'The site is mutated: isoleucine is pouring out, unused.'
          : 'The site is mutated, so the product never binds and the pathway is pouring out isoleucine nothing is using.';
      }
      return narrow
        ? 'The site is mutated: nothing will throttle the first enzyme.'
        : 'The site is mutated, so the product cannot bind and nothing will throttle the first enzyme.';
    }
    if (d.productAddedMM > 0 && d.firstEnzymeActivity < 0.5) {
      return narrow
        ? 'Product added from outside is switching the pathway off.'
        : 'Product added from outside is switching the pathway off, although the cell has made none of it.';
    }
    if (d.firstEnzymeActivity < 0.3) {
      return narrow
        ? 'Isoleucine is plentiful: the pathway has throttled itself.'
        : 'Isoleucine is plentiful, so the first enzyme is switched down and the pathway has throttled itself.';
    }
    if (d.firstEnzymeActivity > 0.75) {
      return narrow
        ? 'Isoleucine is going out faster than it is made: the first enzyme is back on.'
        : 'Isoleucine is being used faster than it is made, so the inhibition has lifted and the first enzyme is back on.';
    }
    return narrow
      ? 'In balance: the first enzyme runs as hard as the demand.'
      : 'The pathway is in balance: the first enzyme runs exactly as hard as the demand for isoleucine.';
  }

  // Read in every state its parts can take: a pool piling up (whatever caused it), an enzyme just
  // removed and the bars not yet moved, or nothing blocked at all.
  function blockSentence(d, narrow) {
    if (d.accumulatingAt) {
      const pool = STEPS[d.accumulatingAt - 1].pool;
      if (d.knockedOut) {
        return narrow
          ? `${pool} is piling up; everything past enzyme ${d.knockedOut} is draining away.`
          : `Enzyme ${d.knockedOut} is gone, so ${pool.toLowerCase()} is piling up in front of the gap and everything past it is draining away.`;
      }
      return narrow
        ? `${pool} is piling up: nothing downstream is taking it.`
        : `${pool} is piling up, because the first enzyme is switched down and nothing downstream is taking it.`;
    }
    if (d.knockedOut) return `Enzyme ${d.knockedOut} has just been removed; watch which bar climbs.`;
    return narrow
      ? `Four subunits give a Hill slope of ${n2(d.steepness)}; one gives about 1.`
      : 'The subunit count moves the steepness at the half point and leaves the half-saturating concentration exactly where it was.';
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }

  b.onDraw(() => {
    applyPanes();
    if (!b.narrow || s.pane === 'pathway') drawPathway();
    if (!b.narrow || s.pane === 'enzyme') drawEnzymePane();
    drawLedger();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   intermediatesMM   the five pools standing before the five enzymes, in pathway order, mmol/L
  //   productMM         isoleucine the pathway has made, mmol/L
  //   demand            mmol/L per second the cell is consuming
  //   firstEnzymeActivity  0 to 1, the allosteric factor on step 1
  //   loopIntact        false once the allosteric site is mutated
  //   productAddedMM    product put in from outside, which the cell did not make
  //   knockedOut        1 to 5, or null
  //   accumulatingAt    which pool is piling up, read off the pools; never set by the knockout control
  //   runaway           product above its ceiling with the loop cut; unreachable while the loop is intact
  //   subunits          1 or 4
  //   curveShape        'hyperbolic' or 'sigmoid'
  //   halfSaturationMM  the substrate at half the maximum rate; it does not move with the subunit count
  //   steepness         the Hill slope MEASURED off the drawn curve at the half point
  //   phosphorylated, kinaseOn, phosphataseOn, atpSpent, switchHeldSeconds   the covalent panel
  //   pane              which pane the narrow layout is showing
  //   t                 the clock, seconds, three decimals; cumulative, and Reset puts it back to 0
  //   playing           whether it is running; it opens running, and Reset leaves it running
  const handle = b.handle();
  runCtl.set(true); // it opens running, in balance, at a moderate demand
  return handle;
}
