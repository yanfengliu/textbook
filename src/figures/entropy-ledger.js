// Order costs, and the bill is visible. A compartment of cytoplasm with a boundary the reader can seal,
// and a ledger beside it. Food crosses in, a polymer chain is assembled monomer by monomer, and heat and
// small waste molecules leave. Three bars: the entropy inside the compartment, which falls as the chain
// grows; the entropy created outside it, which rises; and the sum, which never falls in any state the
// reader can reach. The reader is invited to break the second law and cannot.
//
// WHAT THIS IS HONEST ABOUT, because a figure that quietly floored the total would be making no claim.
//
// 1. **The entropy figures are in arbitrary units on one consistent scale, not joules per kelvin.** They
//    are comparable with each other and with nothing else. The model is a bookkeeping toy: each
//    transaction moves a fixed quantum into the chain and a larger one into the surroundings, and the
//    split is set by the efficiency control.
// 2. **The total is COMPUTED, never clamped.** `entropyTotal` is `entropyInside + entropyOutside`, and
//    `totalEverFell` is set by comparing this step's total with the last one. Nothing anywhere floors
//    it. That it is false in every reachable state is a result of the arithmetic below and not a
//    setting, which is what makes the claim falsifiable on the stage.
// 3. **Why the total cannot be made to fall, in one line.** A transaction raises the surroundings by
//    S_DISPERSAL (one food molecule taken apart into small waste that wanders off) plus whatever the
//    heat contributes, and lowers the inside by at most ORDER_MAX (one monomer strung onto the chain).
//    S_DISPERSAL is 1.35 and ORDER_MAX is 1.0, so even at efficiency 1 — no heat beyond the floor,
//    everything else reaching the chain — the dispersal term alone outweighs the ordering. That is the
//    section's answer to the reader who pushes efficiency to 1 expecting to win: assembling the chain is
//    itself an ordering, and the food had to be taken apart to pay for it.
// 4. **Heat is not a colour**, per the chapter brief: it is drawn as motion leaving the boundary and set
//    as type in the readout, in joules and joules a second as §5.1 quotes them. One transaction sheds
//    one joule at efficiency 0, so a compartment at full supply sheds about twenty joules a second.
//    §5.1's hundred joules a second is a whole person; this is a compartment, and the scale says so.
// 5. **The three bars share one scale**, so the surroundings' bar running away from the compartment's is
//    a thing seen rather than asserted. The zero line moves with the data, as a chart's domain does.
//    After a long run the inside bar is a sliver beside the outside one, which is §5.1's point, and the
//    exact figures stand beside the bars in tabular numerals.
//
// Two compositions, chosen by the bench from one threshold. The figure shrinks honestly rather than
// dropping anything — it is three numbers and a picture:
//   wide   — compartment in a tall left column, the three bars upright over a zero line at the top
//            right, the ledger table under them;
//   narrow — compartment across the top, the three bars as three stacked rows with their numbers
//            right-aligned in tabular figures, and the ledger table beneath.
// The bars pane chooses upright or stacked from its own shape, not from the narrow flag, so a tablet at
// an awkward width gets whichever actually fits.
//
// Colour: the food molecules and the monomers of the chain are the same colour, because they are the
// same molecules — `glucose` from the one membrane table. What changes is the arrangement, which is the
// whole of what entropy measures. Waste is drawn in the neutral paper and rules; heat has no colour.
//
// describe() is documented at the foot of this file.
import { C, tint, clamp, smooth } from './lib/svg.js';
import { membranePart } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = { kind: 'entropy-ledger', title: 'Order costs, and the bill is visible', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

// ---------------------------------------------------------------- the model

const T_REF_K = 310.15; // 37 °C, the temperature the whole chapter is written at
const KELVIN = 273.15;

const ORDER_MAX = 1.0; // entropy units the inside loses per monomer, at efficiency 1
const S_DISPERSAL = 1.35; // entropy units the surroundings gain per food molecule taken apart
const HEAT_J = 1.0; // joules one transaction sheds at efficiency 0
const BASE_LOSS = 0.12; // no transfer is free: this fraction leaves as heat even at efficiency 1
const DECAY_HEAT_J = 0.22; // a monomer coming apart in a sealed compartment still warms the surroundings

const CHAIN_MAX = 26;
const CHAIN_AT_START = 6;
const HOLD_SECONDS = 4; // how long a sealed compartment holds its chain before it starts to come apart
const DECAY_PER_SECOND = 0.9;
const HEAT_AVERAGE_S = 0.5; // the window the heat rate is averaged over, because transactions are discrete

const OPEN = { supply: 4, efficiency: 0.6, temperatureC: 37 };

// How fast everything happens: chemistry roughly doubles per 10 °C, which is §5.6's own rule of thumb.
const rateFactor = (tC) => 2 ** ((tC - 37) / 10);
// A warmer compartment sheds more heat per transaction, and the same joule buys less disorder in warmer
// surroundings, which is why the two factors point opposite ways.
const heatFactor = (tC) => 1 + (tC - 37) / 110;

// One transaction's books, in one place, so the invariant above can be read off rather than traced.
function transaction(efficiency, temperatureC, building) {
  const heatJ = HEAT_J * (BASE_LOSS + (1 - efficiency) * (1 - BASE_LOSS)) * heatFactor(temperatureC);
  const dInside = building ? -efficiency * ORDER_MAX : 0;
  const dOutside = S_DISPERSAL + (heatJ * T_REF_K) / (temperatureC + KELVIN);
  return { heatJ, dInside, dOutside };
}

const GLUCOSE = membranePart('glucose');

// ---------------------------------------------------------------- style

const NARROW_W = 620;
const NARROW_H = 360;

const CSS = `
.tb-entropy-ledger .en-wall { fill: none; stroke: var(--rule-strong); stroke-width: 2.2; stroke-linejoin: round; }
.tb-entropy-ledger .en-wall.is-sealed { stroke: var(--ink); stroke-width: 3; }
/* paper-3, not paper-2: on the dark page paper-2 is four values off the paper and the compartment's
   interior was indistinguishable from the surroundings it is supposed to be separated from. */
.tb-entropy-ledger .en-inside { fill: color-mix(in srgb, var(--paper-3) 78%, var(--paper)); }
.tb-entropy-ledger .en-note { fill: var(--ink-faint); }
.tb-entropy-ledger .en-heat { fill: none; stroke: var(--ink-faint); stroke-width: 1.3; stroke-linecap: round; }
.tb-entropy-ledger .en-bond { stroke: var(--ink-soft); stroke-width: 1.6; stroke-linecap: round; }
.tb-entropy-ledger .en-bar-key { fill: var(--ink-soft); }
.tb-entropy-ledger .en-bar-val { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-entropy-ledger .en-zero { stroke: var(--rule-strong); stroke-width: 1; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W, height: NARROW_H },
    seed: 20260917,
  });
  const fit = b.fit;
  const n1 = (v) => b.num(v, 1);

  // ---- state ----
  let mode = 'open';
  let supplyRate = OPEN.supply;
  let efficiency = OPEN.efficiency;
  let temperatureC = OPEN.temperatureC;

  // Each built monomer remembers what it took out of the inside, so that when a sealed compartment loses
  // it the books get exactly that back — and not a number picked to look tidy.
  let chain = [];
  let entropyInside = 0;
  let entropyOutside = 0;
  let totalEverFell = false;
  let lastTotal = 0;
  let heatShed = 0;
  let heatRate = 0;
  let sealedSeconds = 0;
  let decaying = false;
  let arrivals = 0; // fractional food molecules waiting to become a transaction
  let decayDue = 0;

  function seedOpeningState() {
    chain = [];
    entropyInside = 0;
    entropyOutside = 0;
    heatShed = 0;
    for (let i = 0; i < CHAIN_AT_START; i += 1) {
      const tx = transaction(OPEN.efficiency, OPEN.temperatureC, true);
      chain.push(-tx.dInside);
      entropyInside += tx.dInside;
      entropyOutside += tx.dOutside;
      heatShed += tx.heatJ;
    }
    heatRate = 0;
    totalEverFell = false;
    lastTotal = entropyInside + entropyOutside;
    sealedSeconds = 0;
    decaying = false;
    arrivals = 0;
    decayDue = 0;
  }

  // The model reset the clock uses: the six opening monomers are already in the ledger, so the books are
  // consistent from the first frame rather than starting at a zero the picture contradicts.
  function restartModel() {
    if (boundary) boundary.set('open', { quiet: true });
    mode = 'open';
    seedOpeningState();
  }
  seedOpeningState();

  const total = () => entropyInside + entropyOutside;
  const chainFull = () => chain.length >= CHAIN_MAX;

  // ---- panes ----
  const cell = b.pane('cell', {
    as: 'svg',
    focus: true,
    aria: 'A compartment of cytoplasm building a polymer chain out of food that crosses its boundary, with heat and waste leaving. Press S to seal the boundary or open it again, Space to run or pause, and Home to reset.',
  });
  const bars = b.pane('bars', { as: 'svg' });
  const ledger = b.pane('ledger', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 53fr) minmax(0, 47fr)',
      rows: 'minmax(0, 54fr) minmax(0, 46fr)',
      at: { cell: [1, '1 / 3'], bars: [2, 1], ledger: [2, 2] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 41fr) minmax(0, 24fr) minmax(0, 35fr)',
      at: { cell: [1, 1], bars: [1, 2], ledger: [1, 3] },
    },
  });

  // ---- controls: what to change, then what the boundary is, then the clock ----
  // Twenty-one stops on a 4.4rem track is three pixels a stop, which is a control a finger cannot place,
  // so the supply is a stepper at a phone's width and a slider at a desktop's. The other two keep their
  // tracks — fifty-one and twenty-one stops are a sweep, not a count — and take a short label instead.
  const supplySlider = b.stepper('Supply', {
    min: 0, max: 20, step: 1, value: supplyRate,
    format: (v) => (v === 0 ? 'none' : `${v}/s`),
    onInput: (v) => { supplyRate = v; draw(); b.announce(); },
  });
  const effSlider = b.slider('Efficiency', {
    min: 0, max: 100, step: 5, value: Math.round(efficiency * 100), short: 'Eff',
    format: (v) => `${v}%`,
    onInput: (v) => { efficiency = v / 100; draw(); b.announce(); },
  });
  const tempSlider = b.slider('Temperature', {
    min: 5, max: 55, step: 1, value: temperatureC,
    unit: '°C', short: 'T',
    onInput: (v) => { temperatureC = v; draw(); b.announce(); },
  });
  b.divide();
  // Two buttons rather than one that changes its word: which state the boundary is in is then told by
  // the pressed edge, and a recipe or an item can name "Seal the boundary" and find it in every state.
  const boundary = b.choice('Boundary', [
    { id: 'open', label: 'Open the boundary', short: 'Open', aria: 'Open the boundary, let food reach the compartment again' },
    { id: 'sealed', label: 'Seal the boundary', short: 'Seal', aria: 'Seal the boundary, cut the compartment off from its surroundings' },
  ], (id) => setBoundary(id), { value: 'open' });
  b.divide();
  const runCtl = b.run({
    aria: 'Run, let the compartment work',
    onChange: (on) => { if (!on) heatRate = 0; draw(); b.announce(); },
  });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the compartment back as it opened' });

  b.keys({
    ' ': () => runCtl.toggle(),
    Enter: () => runCtl.toggle(),
    s: () => boundary.set(mode === 'sealed' ? 'open' : 'sealed'),
    S: () => boundary.set(mode === 'sealed' ? 'open' : 'sealed'),
    Home: () => resetAll(),
  });

  // ---- reader actions ----
  function setBoundary(id) {
    mode = id;
    sealedSeconds = 0;
    decaying = false;
    arrivals = 0;
    decayDue = 0;
    draw();
    b.announce();
  }

  function resetAll() {
    supplySlider.set(OPEN.supply);
    effSlider.set(Math.round(OPEN.efficiency * 100));
    tempSlider.set(OPEN.temperatureC);
    runCtl.set(!ctx.reducedMotion);
    b.restart(); // which calls restartModel(), putting the boundary back to open
    b.announce();
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    advance: (dt) => {
      const heatBefore = heatShed;
      if (mode === 'open') {
        arrivals += supplyRate * rateFactor(temperatureC) * dt;
        let guard = 0;
        while (arrivals >= 1 && guard < 400) {
          arrivals -= 1;
          guard += 1;
          runTransaction();
        }
      } else {
        sealedSeconds += dt;
        if (sealedSeconds >= HOLD_SECONDS && chain.length > 0) {
          decaying = true;
          decayDue += DECAY_PER_SECOND * rateFactor(temperatureC) * dt;
          let guard = 0;
          while (decayDue >= 1 && chain.length > 0 && guard < 60) {
            decayDue -= 1;
            guard += 1;
            loseMonomer();
          }
        }
        if (!chain.length) decaying = false;
      }
      // What is leaving, per second. Transactions are discrete, so the raw per-step figure is a spike
      // between zeroes and the readout flickered between "0.0 J/s" and a number twenty times too big.
      // This is a half-second running average of it, which is what "joules a second" means to a reader.
      const instant = dt > 0 ? (heatShed - heatBefore) / dt : 0;
      heatRate += (instant - heatRate) * Math.min(1, dt / HEAT_AVERAGE_S);
      // The claim, checked rather than assumed. Nothing above or below floors the total.
      const now = total();
      if (now < lastTotal - 1e-9) totalEverFell = true;
      lastTotal = now;
    },
  });

  function runTransaction() {
    const building = !chainFull();
    const tx = transaction(efficiency, temperatureC, building);
    if (building) chain.push(-tx.dInside);
    entropyInside += tx.dInside;
    entropyOutside += tx.dOutside;
    heatShed += tx.heatJ;
  }

  function loseMonomer() {
    const order = chain.pop() ?? 0;
    // Exactly what that monomer took out of the inside comes back, and the bond it gave up warms the
    // surroundings a little: the inside bar climbs and the total still rises.
    entropyInside += order;
    entropyOutside += (DECAY_HEAT_J * T_REF_K) / (temperatureC + KELVIN);
    heatShed += DECAY_HEAT_J;
  }

  // ---- what describe() reports ----
  function state() {
    return {
      mode,
      supplyRate,
      efficiency: Number(efficiency.toFixed(2)),
      temperatureC,
      chainLength: chain.length,
      entropyInside: Number(entropyInside.toFixed(2)),
      entropyOutside: Number(entropyOutside.toFixed(2)),
      entropyTotal: Number(total().toFixed(2)),
      totalEverFell,
      heatShed: Number(heatShed.toFixed(1)),
      heatPerSecond: Number((b.playing ? heatRate : 0).toFixed(1)),
      sealedSeconds: Number((mode === 'sealed' ? sealedSeconds : 0).toFixed(2)),
      decaying,
      chainFull: chainFull(),
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // The sentence a screen reader gets, and the same sentence the readout prints. Every state its parts
  // can take was read out loud: sealed and holding, sealed and coming apart, sealed and empty, open with
  // no supply, open and full, open at perfect efficiency, and paused in any of them.
  function situation() {
    if (mode === 'sealed') {
      if (!chain.length) return 'sealed, and the chain is gone; nothing arrives to rebuild it.';
      if (decaying) return 'sealed: the chain is coming apart and the total still rises.';
      return `sealed for ${n1(sealedSeconds)} s: nothing arrives, and the chain holds.`;
    }
    if (supplyRate === 0) return 'open, but no food is arriving, so nothing is being built.';
    if (chainFull()) return 'the chain is full: the compartment pays only to hold it.';
    if (efficiency >= 0.995) return 'perfect efficiency: the food taken apart still outweighs it.';
    return 'each monomer costs the surroundings more than it saves inside.';
  }
  b.onAnnounce((d) => `${d.playing ? 'Running' : 'Paused'}, ${situation()} Inside ${n1(d.entropyInside)}, outside ${n1(d.entropyOutside)}, total ${n1(d.entropyTotal)}. ${n1(d.heatShed)} joules shed in all.`);

  // ---------------------------------------------------------------- the compartment

  // A blob, not a rectangle: the stage is the only drawn rectangle in the book, and this is a cell. The
  // wobble is drawn once from the seeded generator, so the outline is the same shape every frame.
  const WOBBLE = Array.from({ length: 16 }, () => b.random() * 2 - 1);

  function wallPath(cx, cy, rx, ry) {
    const pts = [];
    for (let i = 0; i < WOBBLE.length; i += 1) {
      const a = (i / WOBBLE.length) * Math.PI * 2;
      const k = 1 + WOBBLE[i] * 0.055;
      pts.push([Number((cx + Math.cos(a) * rx * k).toFixed(1)), Number((cy + Math.sin(a) * ry * k).toFixed(1))]);
    }
    return smooth(pts, { closed: true, tension: 5.6 });
  }

  // Where the waste that has left is drawn: a fixed field of seeded positions in the surroundings, of
  // which the first `n` are shown. Seeded once, so the field is the same every run and a frame at t is
  // the same frame; growing, because the surroundings getting more disordered is the thing to see.
  const WASTE_FIELD = Array.from({ length: 64 }, () => ({ a: b.random(), r: b.random(), s: b.random() }));
  const FOOD_LANES = Array.from({ length: 7 }, () => b.random() * 2 - 1);

  function drawCell() {
    const { w, h } = cell.clear().box;
    const pad = clamp(w * 0.03, 10, 22);
    const headroom = clamp(h * 0.09, 14, 24);
    const cx = w * 0.52;
    const cy = headroom + (h - headroom) * 0.5;
    const rx = Math.max(24, Math.min(w * 0.3, (w - pad * 2) * 0.34));
    const ry = Math.max(20, Math.min((h - headroom - pad) * 0.45, rx * 0.88));

    const capSize = clamp(w * 0.024, 9, 11.4);
    cell.text(0, capSize, 'Surroundings', { class: 'tb-rt-title', 'font-size': b.num(capSize, 1) });
    cell.line(0, capSize + 4, w, capSize + 4, { stroke: C.ruleStrong });

    // The surroundings first, so everything else stands on them. One waste disc per two units of the
    // entropy created outside, up to the field's size, and then a figure saying how many more.
    const wasteR = clamp(rx * 0.05, 1.8, 4);
    const wasteN = clamp(Math.floor(entropyOutside / 2), 0, WASTE_FIELD.length);
    for (let i = 0; i < wasteN; i += 1) {
      const p = WASTE_FIELD[i];
      const a = p.a * Math.PI * 2;
      const reach = 1.18 + p.r * 1.5;
      const x = clamp(cx + Math.cos(a) * rx * reach, wasteR + 1, w - wasteR - 1);
      const y = clamp(cy + Math.sin(a) * ry * reach * 0.92, capSize + 8 + wasteR, h - wasteR - 2);
      cell.circle(x, y, wasteR * (0.7 + p.s * 0.6), { fill: C.paper3, stroke: C.ruleStrong, 'stroke-width': 0.9 });
    }

    const d = wallPath(cx, cy, rx, ry);
    cell.path(d, { class: 'en-inside' });
    drawHeat(cx, cy, rx, ry);

    // Food arriving: a standing stream on the left, spaced by a phase the model clock drives, so a
    // pinned frame still shows the stream rather than an empty margin. It stops when the boundary is
    // sealed or nothing is being supplied, which is what those two states mean.
    const crossR = clamp(rx * 0.09, 3, 7);
    if (mode === 'open' && supplyRate > 0) {
      // The stream starts inside the stage, not off the left of it: `cx - 1.85 rx` is negative on a
      // phone, and a molecule drawn off the stage is not a molecule.
      const x0 = Math.max(crossR + 2, cx - rx * 1.85);
      for (let i = 0; i < FOOD_LANES.length; i += 1) {
        const p = (b.time * 0.35 * rateFactor(temperatureC) + i / FOOD_LANES.length) % 1;
        const x = x0 + (cx - rx * 0.35 - x0) * p;
        const y = cy + FOOD_LANES[i] * ry * 0.72;
        cell.circle(x, y, crossR, { fill: GLUCOSE.color, stroke: C.paper, 'stroke-width': 1, opacity: b.num(0.4 + 0.6 * p, 2) });
      }
    }

    cell.path(d, { class: `en-wall${mode === 'sealed' ? ' is-sealed' : ''}`, 'stroke-dasharray': mode === 'sealed' ? null : `${b.num(Math.max(6, rx * 0.22), 1)} ${b.num(Math.max(5, rx * 0.16), 1)}` });

    drawChain(cx, cy, rx, ry);

    // The two gates, named. The right-hand name is set over the surroundings above the blob rather than
    // beside it, because the margin there is narrower than the words and they were dropped entirely.
    const inWord = mode === 'sealed' ? 'nothing enters' : 'food in';
    const inSize = fit(inWord, Math.max(10, cx - rx - 6), 10.4, 8.2);
    if (inSize) cell.text(1, cy + 3.4, inWord, { class: 'en-note', 'font-size': b.num(inSize, 1) });
    const outWord = mode === 'sealed' ? 'nothing leaves' : 'heat and waste out';
    cell.label(w - 5, capSize + 20, outWord, { size: 10.4, anchor: 'end', fill: C.faint, halo: 3, fit: [10.4, 8.2], width: w * 0.6 });

    // The compartment's own name sits inside it, above the chain, where nothing else is drawn.
    const nameSize = clamp(rx * 0.115, 9.5, 13);
    if (fit('The compartment', rx * 1.8, nameSize, 9)) {
      cell.label(cx, cy - ry * 0.6, 'The compartment', { size: nameSize, fill: C.ink });
    }
    const note = mode === 'sealed' ? 'boundary sealed' : supplyRate === 0 ? 'open · no supply' : `open · ${supplyRate} food/s`;
    const noteSize = fit(note, rx * 1.7, 10, 8.4);
    if (noteSize) cell.label(cx, cy - ry * 0.6 + nameSize + 2.5, note, { size: noteSize, fill: C.soft, halo: 2.6 });

    cell.focusMark();
  }

  // Heat as motion: six arcs stepping outward on a loop driven by the model clock, so a pinned frame is
  // the same frame every run. A sealed compartment still sheds a little while its chain comes apart.
  // Drawn whenever the compartment is transacting at all — not from the measured rate, which is zero on
  // a pinned frame and would take the arcs off every screenshot the gates keep.
  function drawHeat(cx, cy, rx, ry) {
    if (!((mode === 'open' && supplyRate > 0) || (mode === 'sealed' && decaying))) return;
    const n = 6;
    for (let i = 0; i < n; i += 1) {
      const phase = (b.time * 0.55 + i / n) % 1;
      const a = (i / n) * Math.PI * 2 + 0.4;
      const reach = 1 + phase * 0.42;
      const x = cx + Math.cos(a) * rx * reach;
      const y = cy + Math.sin(a) * ry * reach;
      const s = clamp(rx * 0.12, 3, 9);
      cell.path(
        `M${b.num(x - s, 1)} ${b.num(y, 1)} q${b.num(s * 0.5, 1)} ${b.num(-s * 0.55, 1)} ${b.num(s, 1)} 0 q${b.num(s * 0.5, 1)} ${b.num(s * 0.55, 1)} ${b.num(s, 1)} 0`,
        { class: 'en-heat', opacity: b.num(clamp(0.75 - phase * 0.7, 0.05, 0.75), 2) },
      );
    }
  }

  // The chain: monomers on a gentle arc inside the compartment, strung together. Its length IS the
  // visible measure of order, so it is drawn as an arrangement and never as a bar.
  function drawChain(cx, cy, rx, ry) {
    if (!chain.length) {
      const s = fit('nothing left to hold', rx * 1.7, 10.6, 8.6);
      if (s) cell.label(cx, cy + ry * 0.14, 'nothing left to hold', { size: s, fill: C.soft, halo: 2.6 });
      return;
    }
    const rows = chain.length > 13 ? 2 : 1;
    const perRow = Math.ceil(chain.length / rows);
    const spanX = rx * 1.4;
    const step = perRow > 1 ? spanX / (perRow - 1) : 0;
    const r = clamp(Math.min(perRow > 1 ? step * 0.46 : spanX * 0.2, ry * 0.22), 2.6, 11);
    const rowGap = Math.max(r * 2.6, ry * 0.3);
    const y0 = cy + ry * 0.2 - ((rows - 1) * rowGap) / 2;
    let prev = null;
    for (let i = 0; i < chain.length; i += 1) {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = cx - spanX / 2 + (perRow > 1 ? col * step : spanX / 2);
      const y = y0 + row * rowGap + Math.sin(col * 0.9) * r * 0.5;
      if (prev && col !== 0) cell.line(prev[0], prev[1], x, y, { class: 'en-bond' });
      prev = [x, y];
      cell.circle(x, y, r, { fill: GLUCOSE.color, stroke: C.paper, 'stroke-width': Math.min(1.2, r * 0.3) });
    }
  }

  // ---------------------------------------------------------------- the three bars
  //
  // One scale for all three, which is the whole point: the outside bar has to be seen running away from
  // the inside one. `share` puts the zero line where the data needs it, so the pixels per unit are
  // identical above and below it.

  const barRows = () => [
    { key: 'Inside the compartment', short: 'Inside', value: entropyInside, colour: C.water },
    { key: 'Created outside', short: 'Outside', value: entropyOutside, colour: C.coral },
    { key: 'Total', short: 'Total', value: total(), colour: C.ink, strong: true },
  ];

  function scaleOf(rows, budget) {
    const up = Math.max(0, ...rows.map((r) => r.value));
    const down = Math.max(0, ...rows.map((r) => -r.value));
    const span = Math.max(up + down, 1e-6);
    const downShare = clamp(down / span, 0.1, 0.45);
    const zero = budget * (1 - downShare);
    const k = Math.min(zero / Math.max(up, 1e-6), (budget - zero) / Math.max(down, 1e-6));
    return { zero, k: Number.isFinite(k) && k > 0 ? k : 0 };
  }

  const barFill = (r) => (r.strong ? C.ink : tint(r.colour, 72));

  function drawBars() {
    const { w, h } = bars.clear().box;
    const rows = barRows();
    const titleSize = clamp(w * 0.024, 8.8, 10.2);
    bars.text(0, titleSize, 'Entropy, arbitrary units', { class: 'tb-rt-title', 'font-size': b.num(titleSize, 1) });
    const top = titleSize + 7;
    bars.line(0, top - 3, w, top - 3, { stroke: C.ruleStrong });
    if (h - top >= w * 0.46) drawBarsUpright(w, h, top, rows);
    else drawBarsStacked(w, h, top, rows);
  }

  function drawBarsUpright(w, h, top, rows) {
    const keySize = clamp(w * 0.03, 8.6, 10.6);
    const valSize = clamp(w * 0.036, 10, 13.4);
    // 0.92 of the band with the slack above it, so the tallest bar has headroom under the rule instead
    // of running into it, which is what filling the band exactly did.
    const plotH = Math.max(24, h - top - (keySize + valSize + 11));
    const { zero, k } = scaleOf(rows, plotH * 0.92);
    const zeroY = top + plotH * 0.08 + zero;
    const colW = w / rows.length;
    const barW = clamp(colW * 0.44, 8, 54);
    bars.line(0, zeroY, w, zeroY, { class: 'en-zero' });
    rows.forEach((r, i) => {
      const cx = colW * (i + 0.5);
      const len = clamp(Math.abs(r.value) * k, 0, plotH);
      const y = r.value < 0 ? zeroY : zeroY - len;
      bars.rect(cx - barW / 2, y, barW, Math.max(1.2, len), { fill: barFill(r), opacity: r.strong ? 0.86 : 1 });
      const label = fit(r.key, colW - 6, keySize, 8.4) ? r.key : r.short;
      bars.text(cx, h - valSize - 5, label, { anchor: 'middle', class: 'en-bar-key', fit: [keySize, 7.4], width: colW - 4 });
      bars.text(cx, h - 3, n1(r.value), { anchor: 'middle', class: 'en-bar-val', 'font-size': b.num(valSize, 1) });
    });
  }

  function drawBarsStacked(w, h, top, rows) {
    const rowH = Math.max(15, (h - top - 2) / rows.length);
    const keySize = clamp(rowH * 0.42, 8.4, 11);
    const valSize = clamp(rowH * 0.46, 9.4, 12.4);
    // Label column, bar column, then the figure right-aligned in tabular numerals, as a ledger sets it.
    const keyW = Math.min(w * 0.4, 128);
    const valW = Math.min(w * 0.2, 62);
    const barSpan = Math.max(16, w - keyW - valW - 14);
    const { zero, k } = scaleOf(rows, barSpan);
    const zeroX = keyW + 7 + (barSpan - zero); // `zero` is measured from the far end, as it is upright
    rows.forEach((r, i) => {
      const cy = top + rowH * (i + 0.5);
      bars.text(0, cy + keySize * 0.36, r.key, { class: 'en-bar-key', fit: [keySize, 7.4], width: keyW - 4 });
      const len = clamp(Math.abs(r.value) * k, 0, barSpan);
      const bh = Math.max(4, rowH * 0.42);
      bars.rect(r.value < 0 ? zeroX - len : zeroX, cy - bh / 2, Math.max(1.2, len), bh, { fill: barFill(r), opacity: r.strong ? 0.86 : 1 });
      bars.text(w, cy + valSize * 0.36, n1(r.value), { anchor: 'end', class: 'en-bar-val', 'font-size': b.num(valSize, 1) });
    });
    bars.line(zeroX, top, zeroX, top + rowH * rows.length, { class: 'en-zero' });
  }

  // ---------------------------------------------------------------- the ledger table

  // The table is BUILT, MEASURED and, if it would not fit, built again shorter — which is `r.fit`, and
  // deciding instead from `b.narrow` is a guess about the toolbar's height that was wrong: at 390 px the
  // last rows of this table were drawn under the controls. What a short pane gives up, in order: the
  // instantaneous rate (the running total is the figure §5.1 quotes) and the boundary row (the
  // compartment says "open · 4 food/s" or "boundary sealed" on its own face), then the sentence. The bars
  // beside it carry the three entropy figures at every width.
  const MIN_ROW = 14;
  function drawLedger() {
    const { w, h } = ledger.clear().box;
    const size = clamp(w * 0.026, 9.6, 11.4);
    ledger.readout({ title: 'The bill', width: w, size, minRow: MIN_ROW, maxRow: 26 })
      .fit(h, (r, level) => {
        if (level < 1) r.row('Heat shedding', b.playing ? `${n1(heatRate)} J/s` : '—');
        r.row('Heat shed in all', `${n1(heatShed)} J`);
        r.row('Chain', `${chain.length} monomer${chain.length === 1 ? '' : 's'}`);
        if (level < 1) r.row('Boundary', mode === 'sealed' ? `sealed ${n1(sealedSeconds)} s` : 'open');
        r.rule();
        r.sum('The total has ever fallen', totalEverFell ? 'yes — a defect' : 'no', totalEverFell ? { accent: C.coral } : {});
        if (level < 2) r.note(situation());
      });
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }

  b.onDraw(() => {
    drawCell();
    drawBars();
    drawLedger();
  });

  runCtl.set(!ctx.reducedMotion);

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   mode             'open' or 'sealed'
  //   supplyRate       food molecules arriving per second, before the temperature factor
  //   efficiency       0 to 1, the fraction of a transaction reaching the chain
  //   temperatureC     degrees Celsius
  //   chainLength      monomers assembled, and the visible measure of order
  //   entropyInside    arbitrary units, negative: it falls as the chain grows
  //   entropyOutside   the same units, positive
  //   entropyTotal     the sum, computed and never clamped
  //   totalEverFell    false in every reachable state; true is a defect, not a setting
  //   heatShed         joules shed since reset, running total
  //   heatPerSecond    joules a second leaving right now, averaged over half a second because
  //                    transactions are discrete; 0 while paused, because nothing is leaving
  //   sealedSeconds    how long the boundary has been closed; 0 while open
  //   decaying         the sealed compartment has begun to lose its chain
  //   chainFull        the chain is at its length and the compartment is paying only to hold it
  //   t, playing       the clock, and whether it is running
  // Nothing here is cumulative across Reset: describe() after Reset equals describe() at mount, including
  // heatShed and the two entropy figures, which go back to the six opening monomers' books.
  return b.handle();
}
