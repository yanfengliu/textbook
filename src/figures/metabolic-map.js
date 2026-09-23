// The hourglass, and the ladder under it.
//
// WHAT IS ON THE STAGE. Two scenes, and they are two halves of one claim rather than two figures: that
// metabolism is an hourglass because a cell can eat anything, and that it is LONG because the fall has
// to be taken in parcels the size of one ATP.
//
// The MAP draws metabolism as an hourglass — many fuels in at the top, a narrow waist of a few shared
// intermediates, many products built outwards below — with the chosen fuel's route traced down to the
// waist and the others indicated. Knock an enzyme out and the compound before the gap piles up while
// everything past it drains away, which is §5.8's phenylketonuria reasoning and §3.4's pulse-chase in
// one control. `accumulating` and `drainedAway` are read off the levels the model is holding, never set
// by the control that caused them.
//
// The ELECTRONS scene is a vertical ladder of standard reduction potential with the fuel's carbons near
// the top and oxygen at the bottom, and a carrier the reader loads and discharges. Drop the pair in one
// go and at most one ATP's worth of the fall can be caught; take the same fall in stages and the
// captured fraction more than doubles. Same fall, same total, two very different ledgers.
//
// CHAPTER 6 AND CHAPTER 7 ARE EXPECTED TO ASK for the carrier pool: it is reached by `scene:
// 'electrons'` alone and every constant below is a named quantity rather than a figure-private one, so a
// later chapter mounts this kind with a different opening scene instead of keeping a copy.
//
// THE NUMBERS.
//   The ladder is standard reduction potentials at pH 7: NAD⁺/NADH −0.32 V, enzyme-bound FAD/FADH₂
//   about −0.22 V, and O₂/H₂O +0.82 V. A two-electron fall of ΔE volts releases 2FΔE, so NADH to oxygen
//   is 2 × 96.485 × 1.14 = 220 kJ/mol, which is the figure §5.8 quotes, and FADH₂ to oxygen is 201.
//   One ATP at cellular concentrations is worth 50.1 kJ/mol (§5.3's own arithmetic), and that is the
//   parcel size the whole argument turns on.
//   IN ONE DROP the fall happens in a single coupled step, and one coupled step can pay for one ATP,
//   so 50.1 of the 220 is caught and the rest leaves as heat: a captured fraction of 0.23.
//   IN STAGES the measured yield of the respiratory chain is about 2.5 ATP per NADH and 1.5 per FADH₂,
//   so 125.3 of the 220 is caught: 0.57. Those two yields are measurements, not a model of the chain —
//   the chain itself is chapter 7's.
//   The energy overlay shades each step of a route by the standard free energy change of the conversion
//   named beside it, rounded to the nearest kilojoule. Where a step lumps several reactions (glycolysis,
//   one turn of β-oxidation) the value is the sum for the lumped conversion and the label says so.
//
// COMPOSITION. Two panes: the drawing, and a ledger that is a typographic table at both widths. Wide:
// the map fills a left column and the ledger takes the right. Narrow (below 640 px of stage width): an
// hourglass with many routes is unreadable at 390 px, so the map becomes a SINGLE VERTICAL FUNNEL
// showing one fuel at a time, with the other routes counted rather than drawn — the `Fuel` control is
// how a reader asks for another branch — and the ledger takes a full-width row beneath. The waist keeps
// its label at both widths, and `capturedFraction` keeps its own, because an item's goal quotes it. The
// electrons scene needs no re-composition beyond re-stacking: a ladder is already a tall arrangement,
// and its two-column ledger becomes rows of type.
//
// WHAT THE BENCH COULD NOT DO, recorded rather than worked around. (1) `readout.note()` draws one <text>
// and does not wrap, so the sentences are broken into lines here against the pane's own width. (2) There
// is no stepper, so `Knock out` is a slider whose maximum is re-set when the fuel changes, because the
// three routes are not the same length.
import { C, tint, clamp } from './lib/svg.js';
import { atom, INK, round } from './lib/mol-draw.js';
import { metabolismPart, membranePart, ORGANELLE_BY_ID } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = {
  kind: 'metabolic-map',
  title: 'The hourglass, and the ladder under it',
  needsWebGL: false,
  aspect: 16 / 10,
  narrowAspect: 4 / 5,
};

// ---------------------------------------------------------------- the map

// Each route is the compounds a fuel passes through, in order, and the enzyme between each pair. The
// last compound of every route is in the waist, which is what makes it an hourglass.
const FUELS = [
  {
    id: 'glucose',
    label: 'Glucose',
    compounds: ['Glucose', 'Glucose 6-phosphate', 'Pyruvate', 'Acetyl-CoA', 'Citrate'],
    steps: [
      { enzyme: 'Hexokinase', short: 'Hexokinase', kj: -16.7, carriers: 0 },
      { enzyme: 'Glycolysis, lumped', short: 'Glycolysis', kj: -80, carriers: 2, lumped: true },
      { enzyme: 'Pyruvate dehydrogenase', short: 'PDH', kj: -33.4, carriers: 1 },
      { enzyme: 'Citrate synthase', short: 'Citrate synthase', kj: -32.2, carriers: 0 },
    ],
    // Catabolism and anabolism between the same two compounds are never each other reversed: three of
    // glycolysis's steps run so far downhill that gluconeogenesis has to bypass each with its own
    // enzyme, and that is what lets a cell switch one off without switching the other on.
    stepsThatDiffer: 3,
    anabolic: 'gluconeogenesis bypasses hexokinase, phosphofructokinase and pyruvate kinase with four enzymes of its own',
    carbons: [6, 6, 3, 2, 6],
  },
  {
    id: 'fatty-acid',
    label: 'Fatty acid',
    compounds: ['Fatty acid', 'Fatty acyl-CoA', 'Acetyl-CoA', 'Citrate'],
    steps: [
      { enzyme: 'Acyl-CoA synthetase', short: 'Acyl-CoA synthetase', kj: -0.8, carriers: 0 },
      { enzyme: 'β-oxidation, one turn', short: 'β-oxidation', kj: -40, carriers: 2, lumped: true },
      { enzyme: 'Citrate synthase', short: 'Citrate synthase', kj: -32.2, carriers: 0 },
    ],
    stepsThatDiffer: 4,
    anabolic: 'fatty acid synthesis uses different enzymes at every step, and does them in the cytosol rather than the mitochondrion',
    carbons: [16, 16, 2, 6],
  },
  {
    id: 'amino-acid',
    label: 'Amino acid',
    compounds: ['Amino acid', '2-oxo acid', 'Acetyl-CoA', 'Citrate'],
    steps: [
      { enzyme: 'Transaminase', short: 'Transaminase', kj: 0, carriers: 0 },
      { enzyme: 'Oxidative decarboxylation', short: 'Decarboxylation', kj: -30, carriers: 1 },
      { enzyme: 'Citrate synthase', short: 'Citrate synthase', kj: -32.2, carriers: 0 },
    ],
    stepsThatDiffer: 2,
    anabolic: 'making the amino acid again needs a carbon skeleton from the waist and a nitrogen, by two enzymes the breakdown never uses',
    carbons: [5, 5, 2, 6],
  },
];
const FUEL_BY_ID = Object.fromEntries(FUELS.map((f) => [f.id, f]));

// The waist: the shared intermediates every route funnels into, and what is built outwards from them.
// Citrate belongs here: every one of the three routes ends on it, and a waist that did not contain the
// compound the routes arrive at was a map contradicting itself — the narrow layout's own check for "did
// this route reach the waist" came out false on all three fuels.
const WAIST = ['Pyruvate', 'Acetyl-CoA', 'Citrate', 'Oxaloacetate', '2-oxoglutarate'];
const PRODUCTS = ['Fatty acids', 'Amino acids', 'Nucleotides', 'Glucose'];

const FLOW = 1.0; // relative flux through an unblocked step
const LEAK = 0.18; // per second; nothing in a cell sits for ever, so a blocked pool settles
const PILE = 1.8; // a compound above this is piling up rather than merely working
const DRAINED = 0.22; // and below this it has drained away

// ---------------------------------------------------------------- the ladder

const F_KJ_PER_V = 96.485 * 2; // two electrons
const O2_VOLTS = 0.82;
const ATP_KJ = 50.1; // one ATP at cellular concentrations, §5.3
const CARRIERS = [
  { id: 'nad', label: 'NAD⁺', loadedLabel: 'NADH', volts: -0.32, stagesAtp: 2.5 },
  { id: 'fad', label: 'FAD', loadedLabel: 'FADH₂', volts: -0.22, stagesAtp: 1.5 },
];
const CARRIER_BY_ID = Object.fromEntries(CARRIERS.map((c) => [c.id, c]));
const POOL = 4; // deliberately small: a cell holds very little of it
const LOAD_SECONDS = 1.1;

const fallKjOf = (id) => round(F_KJ_PER_V * (O2_VOLTS - CARRIER_BY_ID[id].volts), 1);

// ---------------------------------------------------------------- style

const NARROW_W = 640;

const CSS = `
.tb-metabolic-map .mm-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.09em; }
.tb-metabolic-map .mm-name { fill: var(--ink); font-weight: 600; }
.tb-metabolic-map .mm-note { fill: var(--ink-faint); }
/* The halo scale, tree and levels use for a label over a drawing. The fall's summary lines take it: they
   are centred between two voltages and the parcels are drawn as hairlines right across the pane, so where
   the midpoint lands on a hairline the label stands on it — "4 parcels · 75.2 of 200.7 caught" measured
   4.37:1 light and 4.47:1 dark on 2026-09-17. The position is the argument, so the label keeps it and
   takes its own ground instead. */
.tb-metabolic-map .mm-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3px; stroke-linejoin: round; }
.tb-metabolic-map .mm-num { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-metabolic-map .mm-axis { fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.tb-metabolic-map .mm-sym { font-weight: 700; }
`;

const ATP = metabolismPart('atp');
const ENZYME = metabolismPart('enzyme');
const CARRIER_EMPTY = metabolismPart('electronCarrier');
const CARRIER_LOADED = metabolismPart('electronCarrierLoaded');
const GLUCOSE = membranePart('glucose');
const MITO = ORGANELLE_BY_ID.mitochondrion;

const n1 = (v) => Number(v).toFixed(1);
const n2 = (v) => Number(v).toFixed(2);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 20260917 });
  const fit = b.fit;

  const START = {
    scene: 'map', overlay: 'matter', fuel: 'glucose', direction: 'catabolic',
    knockedOutIndex: 0, carrier: 'nad', dropMode: 'one-step',
  };
  let s = { ...START };
  let levels = [];
  let carrierLoaded = 0;
  let atpMade = 0;
  let drops = 0;
  let loadPhase = 0;
  let fallPhase = 0; // 0 when nothing is falling, otherwise 0..1 down the ladder

  const fuel = () => FUEL_BY_ID[s.fuel];
  const knockedOutStep = () => (s.knockedOutIndex > 0 ? fuel().steps[s.knockedOutIndex - 1] : null);
  const resetLevels = () => { levels = fuel().compounds.map(() => 1); };
  resetLevels();

  // A figure that is not running still has to answer the question the reader just asked. Knocking an
  // enzyme out while the clock is paused runs the same flow model forward twelve seconds at once, so
  // the levels are where they would have arrived rather than where they started; while it IS running,
  // the reader watches them get there. Either way `accumulating` is read off the levels.
  function settleLevels(seconds = 12) {
    for (let i = 0; i < seconds * 60; i += 1) advanceLevels(1 / 60);
  }

  // Read off the levels, never set by the knockout control: the compound that is well above a working
  // route's level, and the ones that have drained away past it.
  function accumulating() {
    let best = null;
    let top = PILE;
    levels.forEach((v, i) => { if (v > top) { top = v; best = i; } });
    return best === null ? null : fuel().compounds[best];
  }
  function drainedAway() {
    return fuel().compounds.filter((_, i) => i > 0 && levels[i] < DRAINED);
  }
  const poolFull = () => carrierLoaded >= POOL;

  // A first-order flow down the chosen route: a step that has lost its enzyme passes nothing, so the
  // compound before it climbs until its own slow drain balances what arrives, and everything past it
  // empties. Nothing is clamped by hand; the levels are what they come out as.
  function advanceLevels(dt) {
    const f = fuel();
    const next = [...levels];
    const flux = f.steps.map((_, i) => (s.knockedOutIndex === i + 1 ? 0 : FLOW * Math.min(2.5, levels[i])));
    next[0] = Math.max(0, levels[0] + (FLOW - flux[0] - LEAK * levels[0] * 0.2) * dt);
    for (let i = 1; i < levels.length; i += 1) {
      const out = i < flux.length ? flux[i] : FLOW * Math.min(2.5, levels[i]);
      next[i] = Math.max(0, levels[i] + (flux[i - 1] - out - LEAK * levels[i]) * dt);
    }
    levels = next;
  }

  // ---- panes ----
  const scene = b.pane('scene', {
    as: 'svg',
    focus: true,
    aria: 'A map of metabolism as an hourglass, or a ladder of electron affinity. Press Space to run, F for the next fuel, L to load a carrier, D to let a pair fall, Home to reset.',
  });
  const ledger = b.pane('ledger', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 64fr) minmax(0, 36fr)',
      rows: 'minmax(0, 1fr)',
      at: { scene: [1, 1], ledger: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 70fr) minmax(0, 30fr)',
      at: { scene: [1, 1], ledger: [1, 2] },
    },
  });

  // ---- controls: what to show, then what to change, then what to run ----
  const pickScene = b.choice('Scene', [
    { id: 'map', label: 'Map', aria: 'Map, metabolism drawn as an hourglass' },
    { id: 'electrons', label: 'Electrons', aria: 'Electrons, the ladder of electron affinity' },
  ], (id) => { s.scene = id; showControls(); draw(); b.announce(); }, { value: START.scene, segmented: true });
  b.divide();

  const pickFuel = b.choice('Fuel', FUELS.map((f) => ({ id: f.id, label: f.label, aria: `${f.label}, trace this fuel down to the waist` })), (id) => {
    s.fuel = id;
    // The three routes are not the same length, so the knockout slider's range follows the fuel.
    s.knockedOutIndex = 0;
    knockSlider.input.max = String(FUEL_BY_ID[id].steps.length);
    knockSlider.set(0);
    resetLevels();
    if (!b.playing) settleLevels();
    draw();
    b.announce();
  }, { value: START.fuel, segmented: true });

  const pickOverlay = b.choice('Overlay', [
    { id: 'matter', label: 'Matter', aria: 'Matter, follow the carbon atoms' },
    { id: 'energy', label: 'Energy', aria: 'Energy, shade each step by what it releases' },
  ], (id) => { s.overlay = id; draw(); b.announce(); }, { value: START.overlay, segmented: true });

  const pickDirection = b.choice('Direction', [
    { id: 'catabolic', label: 'Catabolic', aria: 'Catabolic, the route down to the waist' },
    { id: 'anabolic', label: 'Anabolic', aria: 'Anabolic, the route back out, which is not the same route' },
  ], (id) => { s.direction = id; draw(); b.announce(); }, { value: START.direction, segmented: true });

  const knockSlider = b.stepper('Knock out', {
    min: 0, max: FUEL_BY_ID[START.fuel].steps.length, step: 1, value: 0,
    format: (v) => (Number(v) === 0 ? 'none' : fuel().steps[Number(v) - 1].short),
    onInput: (v) => {
      s.knockedOutIndex = Number(v);
      if (Number(v) === 0) resetLevels();
      if (!b.playing) settleLevels();
      draw();
      b.announce();
    },
  });

  b.divide();

  const pickCarrier = b.choice('Carrier', CARRIERS.map((c) => ({ id: c.id, label: c.label, aria: `${c.label}, take the pair onto this carrier` })), (id) => {
    s.carrier = id;
    carrierLoaded = 0;
    draw();
    b.announce();
  }, { value: START.carrier, segmented: true });

  const pickDrop = b.choice('Drop', [
    { id: 'one-step', label: 'One drop', aria: 'One drop, release the whole fall at once' },
    { id: 'stepwise', label: 'In stages', aria: 'In stages, take the same fall in parcels the size of one ATP' },
  ], (id) => { s.dropMode = id; draw(); b.announce(); }, { value: START.dropMode, segmented: true });

  const btnLoad = b.action('Load a pair', () => { loadPair(); draw(); b.announce(); }, { short: 'Load', aria: 'Load a pair, take two electrons off the fuel onto a carrier' });
  const btnFall = b.action('Let them fall', () => { letFall(); draw(); b.announce(); }, { short: 'Let fall', aria: 'Let them fall, drop one loaded carrier to oxygen' });
  b.divide();

  const runCtl = b.run({ primary: true, onChange: () => { draw(); b.announce(); } });
  b.action('Reset', () => reset(), { aria: 'Reset, put the map back as it started and clear the tallies' });

  b.keys({
    ' ': () => runCtl.toggle(),
    f: () => pickFuel.next(),
    F: () => pickFuel.next(),
    l: () => btnLoad.click(),
    L: () => btnLoad.click(),
    d: () => btnFall.click(),
    D: () => btnFall.click(),
    Home: () => reset(),
  });

  // Each scene keeps its own controls; twelve at once would take four rows of a phone's stage, and a
  // hidden control is not visible, which is what `button:visible` in npm run narrow reads. The rules
  // between the groups look after themselves: the bench puts each one inside the group it opens, so a
  // group whose controls are all hidden takes its rule with it.
  function showControls() {
    const onMap = s.scene === 'map';
    for (const node of [...pickFuel.nodes, ...pickOverlay.nodes, ...pickDirection.nodes]) node.style.display = onMap ? '' : 'none';
    knockSlider.node.style.display = onMap ? '' : 'none';
    for (const node of [...pickCarrier.nodes, ...pickDrop.nodes, btnLoad, btnFall]) node.style.display = onMap ? 'none' : '';
  }
  showControls();

  // ---- reader actions ----
  function loadPair() {
    if (s.scene !== 'electrons') return;
    if (poolFull()) return; // a full pool is the constraint, not a failure: the readout says why
    carrierLoaded += 1;
    loadPhase = 0;
  }
  function letFall() {
    if (s.scene !== 'electrons' || carrierLoaded <= 0) return;
    carrierLoaded -= 1;
    drops += 1;
    atpMade = round(atpMade + capturedKj() / ATP_KJ, 2);
    fallPhase = 0.001;
  }

  function reset() {
    s = { ...START };
    carrierLoaded = 0;
    atpMade = 0;
    drops = 0;
    loadPhase = 0;
    fallPhase = 0;
    resetLevels();
    runCtl.set(false);
    pickScene.set(START.scene, { quiet: true });
    pickFuel.set(START.fuel, { quiet: true });
    pickOverlay.set(START.overlay, { quiet: true });
    pickDirection.set(START.direction, { quiet: true });
    pickCarrier.set(START.carrier, { quiet: true });
    pickDrop.set(START.dropMode, { quiet: true });
    knockSlider.input.max = String(FUEL_BY_ID[START.fuel].steps.length);
    knockSlider.set(0);
    showControls();
    b.restart();
    draw();
    b.announce();
  }

  // ---- the ledger's own arithmetic ----
  const fallKj = () => fallKjOf(s.carrier);
  // One coupled step can pay for one ATP, so a single drop catches one ATP's worth however far it falls.
  // Taken in stages, the chain's MEASURED yield is 2.5 ATP per NADH and 1.5 per FADH₂.
  function capturedKj() {
    const whole = fallKj();
    if (s.dropMode === 'one-step') return round(Math.min(ATP_KJ, whole), 1);
    return round(Math.min(whole, CARRIER_BY_ID[s.carrier].stagesAtp * ATP_KJ), 1);
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    advance(dt) {
      if (s.scene === 'map') {
        advanceLevels(dt);
      } else {
        // The fuel hands pairs to the carriers until the pool is full, and then oxidation stops.
        loadPhase += dt / LOAD_SECONDS;
        while (loadPhase >= 1) {
          loadPhase -= 1;
          if (!poolFull()) carrierLoaded += 1;
        }
        if (fallPhase > 0) {
          fallPhase += dt * 1.4;
          if (fallPhase >= 1) fallPhase = 0;
        }
      }
    },
    restart() {
      resetLevels();
      carrierLoaded = 0;
      atpMade = 0;
      drops = 0;
      loadPhase = 0;
      fallPhase = 0;
    },
  });

  // ---- what describe() reports ----
  function state() {
    const f = fuel();
    const whole = fallKj();
    const captured = capturedKj();
    return {
      scene: s.scene,
      overlay: s.overlay,
      fuel: s.fuel,
      route: [...f.compounds],
      waistCompounds: WAIST.length,
      direction: s.direction,
      stepsThatDiffer: f.stepsThatDiffer,
      knockedOut: knockedOutStep() ? knockedOutStep().enzyme : null,
      accumulating: accumulating(),
      drainedAway: drainedAway(),
      carrier: s.carrier,
      carrierLoaded,
      carrierPool: POOL,
      poolFull: poolFull(),
      dropMode: s.dropMode,
      fallKj: whole,
      capturedKj: captured,
      heatKj: round(whole - captured, 1),
      atpMade,
      capturedFraction: round(captured / whole, 3),
      t: round(b.time, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);
  b.onAnnounce((d) => (d.scene === 'electrons'
    ? `The ladder. ${CARRIER_BY_ID[d.carrier].loadedLabel} to oxygen is a fall of ${n1(d.fallKj)} kilojoules per mole. ${d.dropMode === 'one-step' ? 'In one drop' : 'In stages'}, ${n1(d.capturedKj)} is captured and ${n1(d.heatKj)} leaves as heat: a captured fraction of ${n2(d.capturedFraction)}. ${d.carrierLoaded} of ${d.carrierPool} carriers are loaded${d.poolFull ? ', and the pool is full, so nothing more can be oxidised' : ''}.`
    : `The map, ${FUEL_BY_ID[d.fuel].label.toLowerCase()} in, ${d.direction}. ${d.knockedOut ? `${d.knockedOut} is knocked out. ` : ''}${d.accumulating ? `${d.accumulating} is piling up.` : 'Nothing is piling up.'}${d.drainedAway.length ? ` ${d.drainedAway.join(', ')} ${d.drainedAway.length === 1 ? 'has' : 'have'} drained away.` : ''}`));

  // ---------------------------------------------------------------- drawing helpers

  function node(x, y, r, fill, symbol, symbolColor, opacity) {
    const g = scene.group();
    if (opacity !== undefined && opacity !== null) g.setAttribute('opacity', String(opacity));
    scene.circle(x, y, Math.max(1, r), { fill, stroke: C.paper, 'stroke-width': Math.max(0.6, r * 0.12) }, g);
    if (symbol) {
      const size = fit(symbol, r * 1.9, r * 0.9, 6.2);
      if (size) scene.text(x, y + size * 0.35, symbol, { anchor: 'middle', class: 'mm-sym', 'font-size': n1(size), style: `fill:${symbolColor}`, parent: g });
    }
    return g;
  }

  // An arrow between two points, broken when its enzyme has been knocked out and marked when the two
  // directions use different enzymes.
  function stepArrow(x1, y1, x2, y2, { out, differs, colour = C.ink, width = 1.6 }) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    if (out) {
      const bite = Math.min(len * 0.22, 9);
      scene.path(`M${n1(x1)} ${n1(y1)} L${n1(x1 + ux * (len / 2 - bite))} ${n1(y1 + uy * (len / 2 - bite))}`, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': width, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round' });
      scene.path(`M${n1(x2)} ${n1(y2)} L${n1(x1 + ux * (len / 2 + bite))} ${n1(y1 + uy * (len / 2 + bite))}`, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': width, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round' });
      return;
    }
    const hx = x2 - ux * 5;
    const hy = y2 - uy * 5;
    scene.path(`M${n1(x1)} ${n1(y1)} L${n1(x2)} ${n1(y2)} M${n1(hx - uy * 3)} ${n1(hy + ux * 3)} L${n1(x2)} ${n1(y2)} L${n1(hx + uy * 3)} ${n1(hy - ux * 3)}`, {
      fill: 'none', stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    });
    if (differs) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      scene.path(`M${n1(mx - uy * 4.5)} ${n1(my + ux * 4.5)} L${n1(mx + uy * 4.5)} ${n1(my - ux * 4.5)}`, { fill: 'none', stroke: INK.coral, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
    }
  }

  // How a step is shaded under the energy overlay: the bigger the release, the stronger the mark.
  const energyTint = (kj) => tint(C.gold, clamp(18 + (Math.abs(kj) / 80) * 62, 14, 82));

  // ---------------------------------------------------------------- the map scene

  function drawMap() {
    const { w, h: hgt } = scene.clear().box;
    if (b.narrow) drawFunnel(w, hgt);
    else drawHourglass(w, hgt);
    scene.focusMark();
  }

  function drawHourglass(w, hgt) {
    const f = fuel();
    const pad = 6;
    const waistH = clamp(hgt * 0.17, 42, 74);
    const waistTop = pad + (hgt - pad * 2 - waistH) * 0.52;
    const waistBot = waistTop + waistH;
    const size = clamp(Math.min(w * 0.019, hgt * 0.026), 8.4, 10.4);
    const r = clamp(Math.min(w * 0.021, hgt * 0.03), 7, 14);
    const anabolic = s.direction === 'anabolic';

    // The waist, with its rules and its name. It keeps its label at both widths. The name sits INSIDE
    // the band: above the rule it ran into the carbon count beside the route's last compound, which is
    // a collision that appears at one fuel and not another.
    scene.line(pad, waistTop, w - pad, waistTop, { stroke: C.ruleStrong });
    scene.line(pad, waistBot, w - pad, waistBot, { stroke: C.ruleStrong });
    scene.text(pad, waistTop + Math.min(size, 9.4) + 3, 'THE WAIST', { class: 'mm-head', 'font-size': n1(Math.min(size, 9.4)) });
    scene.text(w - pad, waistTop + Math.min(size, 9.4) + 3, `${WAIST.length} SHARED INTERMEDIATES`, { anchor: 'end', class: 'mm-head', 'font-size': n1(Math.min(size, 9.4)) });
    WAIST.forEach((name, i) => {
      const x = pad + ((w - pad * 2) * (i + 0.5)) / WAIST.length;
      const inRoute = f.compounds.includes(name);
      const cy = waistTop + waistH * 0.56;
      node(x, cy, r, inRoute ? GLUCOSE.color : tint(C.ruleStrong, 70), '', C.ink, inRoute ? 1 : 0.7);
      const lab = fit(name, (w - pad * 2) / WAIST.length - 6, size, 7.6);
      if (lab) scene.text(x, cy + r + lab + 2, name, { anchor: 'middle', class: inRoute ? 'mm-name' : 'mm-note', 'font-size': n1(lab) });
    });

    // The chosen fuel's route, from the top down to the waist. The other two are drawn as thin lines
    // with their names, because the map is about the shape and only one route is being followed.
    const routeX = w * 0.5;
    const mouthY = pad + size * 2.4;
    const topY = mouthY + 16;
    const steps = f.steps.length;
    const rowH = (waistTop - topY - 10) / steps;
    FUELS.forEach((other, i) => {
      const here = other.id === s.fuel;
      const sx = pad + ((w - pad * 2) * (i + 0.5)) / FUELS.length;
      scene.path(`M${n1(sx)} ${n1(pad + size + 4)} Q${n1(sx)} ${n1(mouthY)} ${n1(routeX)} ${n1(mouthY + 6)}`, {
        fill: 'none', stroke: here ? C.ink : C.ruleStrong, 'stroke-width': here ? 1.8 : 1.3,
        'stroke-dasharray': here ? null : '5 4',
      });
      const lab = fit(other.label, (w - pad * 2) / FUELS.length - 8, size, 7.8);
      if (lab) scene.text(sx, pad + size, other.label, { anchor: 'middle', class: here ? 'mm-name' : 'mm-note', 'font-size': n1(lab) });
    });
    for (let i = 0; i <= steps; i += 1) {
      const y = anabolic ? waistTop - 10 - rowH * i : topY + rowH * i;
      const level = levels[i] ?? 1;
      const piling = level > PILE;
      const drained = i > 0 && level < DRAINED;
      const nr = r * clamp(0.75 + level * 0.3, 0.6, 1.9);
      node(routeX, y, nr, piling ? tint(C.coral, 62) : drained ? tint(C.ruleStrong, 60) : GLUCOSE.color, '', GLUCOSE.symbolColor, drained ? 0.5 : 1);
      const name = f.compounds[i];
      const lab = fit(name, w * 0.34, size, 7.8);
      if (lab) scene.text(routeX + nr + 7, y + lab * 0.35, name, { class: drained ? 'mm-note' : 'mm-name', 'font-size': n1(lab) });
      if (s.overlay === 'matter') {
        scene.text(routeX - nr - 7, y + size * 0.35, `${f.carbons[i]} C`, { anchor: 'end', class: 'mm-axis', 'font-size': n1(Math.min(size, 9.6)) });
      }
      if (i < steps) {
        const st = f.steps[i];
        const y2 = anabolic ? y - rowH : y + rowH;
        const out = s.knockedOutIndex === i + 1;
        const differs = anabolic && i < f.stepsThatDiffer;
        stepArrow(routeX, y + nr + 2, routeX, y2 - r * 0.8 - 2, { out, differs, colour: s.overlay === 'energy' ? INK.gold : C.ink, width: s.overlay === 'energy' ? 2 + clamp(Math.abs(st.kj) / 40, 0.4, 2.4) : 1.6 });
        const words = s.overlay === 'energy' ? `${st.short} · ${st.kj === 0 ? 'about 0' : `${n1(st.kj)}`} kJ/mol` : st.short;
        const sl = fit(words, w * 0.34, size - 0.4, 7.6);
        if (sl) scene.text(routeX - nr - 7, (y + y2) / 2 + sl * 0.35, words, { anchor: 'end', class: 'mm-note', 'font-size': n1(sl) });
      }
    }
    // Many ways in. All three fuels are named across the top and their lines converge on the mouth of
    // the route, which is what makes this an hourglass rather than a column. The convergence is done
    // ABOVE the first compound rather than alongside the route, because the route's own two columns of
    // type — the step names to its left, the compound names to its right — occupy the whole band, and a
    // curve run down through them collides with one label at one fuel and not at another.

    // Out of the waist: the products, fanning outwards from the middle of it.
    const outTop = waistBot + 10;
    const outH = Math.max(24, hgt - pad - outTop);
    const outY = outTop + outH * 0.58;
    PRODUCTS.forEach((name, i) => {
      const x = pad + ((w - pad * 2) * (i + 0.5)) / PRODUCTS.length;
      scene.path(`M${n1(routeX)} ${n1(waistBot + 2)} Q${n1(x)} ${n1(waistBot + outH * 0.24)} ${n1(x)} ${n1(outY - r * 0.9)}`, {
        fill: 'none', stroke: C.soft, 'stroke-width': 1.3, 'stroke-linecap': 'round',
      });
      node(x, outY, r * 0.8, tint(C.leaf, 42), '', C.ink, 1);
      const lab = fit(name, (w - pad * 2) / PRODUCTS.length - 6, size, 7.6);
      if (lab) scene.text(x, outY + r + lab + 2, name, { anchor: 'middle', class: 'mm-note', 'font-size': n1(lab) });
    });
    scene.text(pad, hgt - 2, `${FUELS.length} fuels in · ${PRODUCTS.length} kinds of product out${anabolic ? ` · ${f.stepsThatDiffer} steps use different enzymes this way round` : ''}`, { class: 'mm-note', 'font-size': n1(Math.min(size, 9.6)) });
  }

  // Narrow: one vertical funnel, one fuel at a time. An hourglass with many routes cannot be read in a
  // 390 px column, so the other routes are counted rather than drawn and the Fuel control is how a
  // reader asks for another one.
  function drawFunnel(w, hgt) {
    const f = fuel();
    const pad = 4;
    const size = clamp(Math.min(w * 0.028, hgt * 0.022), 8.4, 10.4);
    const anabolic = s.direction === 'anabolic';
    const rows = f.compounds.length + 2; // the fuels line, the route, and the products line
    const rowH = (hgt - pad * 2) / rows;
    const r = clamp(Math.min(rowH * 0.3, w * 0.035), 7, 14);
    const x = w * 0.3;

    scene.text(pad, pad + size, `${FUELS.length} fuels in · ${PRODUCTS.length} kinds of product out`, { class: 'mm-note', 'font-size': n1(size) });
    const top = pad + rowH;
    for (let i = 0; i < f.compounds.length; i += 1) {
      const y = anabolic ? top + rowH * (f.compounds.length - 1 - i) : top + rowH * i;
      const level = levels[i] ?? 1;
      const piling = level > PILE;
      const drained = i > 0 && level < DRAINED;
      const nr = r * clamp(0.75 + level * 0.3, 0.6, 1.9);
      node(x, y, nr, piling ? tint(C.coral, 62) : drained ? tint(C.ruleStrong, 60) : GLUCOSE.color, '', GLUCOSE.symbolColor, drained ? 0.5 : 1);
      const name = f.compounds[i];
      const lab = fit(name, w - x - nr - 12, size, 7.6);
      if (lab) scene.text(x + nr + 6, y + lab * 0.35, name, { class: drained ? 'mm-note' : 'mm-name', 'font-size': n1(lab) });
      if (s.overlay === 'matter') scene.text(x - nr - 5, y + size * 0.35, `${f.carbons[i]} C`, { anchor: 'end', class: 'mm-axis', 'font-size': n1(Math.min(size, 9.4)) });
      if (i < f.steps.length) {
        const st = f.steps[i];
        const y2 = anabolic ? y - rowH : y + rowH;
        stepArrow(x, y + nr + 2, x, y2 - r * 0.8 - 2, {
          out: s.knockedOutIndex === i + 1, differs: anabolic && i < f.stepsThatDiffer,
          colour: s.overlay === 'energy' ? INK.gold : C.ink,
          width: s.overlay === 'energy' ? 2 + clamp(Math.abs(st.kj) / 40, 0.4, 2.4) : 1.6,
        });
        const words = s.overlay === 'energy' ? `${st.short} ${n1(st.kj)}` : st.short;
        const sl = fit(words, x - 8, size - 0.6, 7.6);
        if (sl) scene.text(x - nr - 5, (y + y2) / 2 + sl * 0.35, words, { anchor: 'end', class: 'mm-note', 'font-size': n1(sl) });
      }
    }
    const waistY = pad + rowH * (rows - 0.5);
    scene.line(pad, waistY - rowH * 0.5, w - pad, waistY - rowH * 0.5, { stroke: C.ruleStrong });
    scene.text(pad, waistY, `THE WAIST · ${WAIST.length} SHARED INTERMEDIATES`, { class: 'mm-head', 'font-size': n1(Math.min(size, 9.2)) });
    const lastIsWaist = WAIST.includes(f.compounds[f.compounds.length - 1]);
    scene.text(w - pad, waistY, lastIsWaist ? `${f.compounds[f.compounds.length - 1]} is one of them` : 'this route stops short of it', {
      anchor: 'end', class: 'mm-note', 'font-size': n1(Math.min(size - 0.8, 8.8)),
    });
  }

  // ---------------------------------------------------------------- the electrons scene

  function drawElectrons() {
    const { w, h: hgt } = scene.clear().box;
    const c = CARRIER_BY_ID[s.carrier];
    const pad = 6;
    const poolBand = clamp(hgt * 0.2, 46, 86);
    const top = pad + 16;
    const bottom = hgt - poolBand;
    const size = clamp(Math.min(w * 0.024, hgt * 0.03), 8.4, 10.6);
    // The rail sits in a narrow left gutter and every rung runs the full width of the pane, the way a
    // table's rules do. Laid out with the rail in the middle, the left third of the pane held one label
    // and nothing else, which is the half-empty panel this chapter's brief opens with.
    const gutter = Math.max(28, size * 3.2);
    const ladderX = pad + gutter;
    const vTop = -0.45;
    const vBot = 0.95;
    const Y = (v) => top + ((v - vTop) / (vBot - vTop)) * (bottom - top);

    scene.text(pad, pad + 9, 'ELECTRON AFFINITY, VOLTS', { class: 'mm-head', 'font-size': n1(Math.min(size, 9.4)) });
    scene.line(ladderX, top, ladderX, bottom, { stroke: C.ruleStrong, 'stroke-width': 2 });
    for (let v = -0.4; v <= 0.9001; v += 0.2) {
      const y = Y(v);
      scene.line(ladderX - 5, y, ladderX + 5, y, { stroke: C.rule });
      scene.text(ladderX - 8, y + size * 0.35, v.toFixed(1), { anchor: 'end', class: 'mm-axis', 'font-size': n1(Math.min(size, 9.6)) });
    }

    // The three rungs that matter: the fuel's carbons, the carrier, and oxygen at the bottom.
    const rungs = [
      { volts: -0.42, name: 'the fuel’s carbons', fill: GLUCOSE.color },
      { volts: c.volts, name: `${c.label} / ${c.loadedLabel}`, fill: carrierLoaded > 0 ? CARRIER_LOADED.color : CARRIER_EMPTY.color },
      { volts: O2_VOLTS, name: 'oxygen / water', fill: MITO.color },
    ];
    const dotX = ladderX + size * 1.6;
    for (const rung of rungs) {
      const y = Y(rung.volts);
      scene.line(ladderX, y, w - pad, y, { stroke: C.ruleStrong });
      node(dotX, y, size * 0.9, rung.fill, '', C.ink, 1);
      const lab = fit(rung.name, w - dotX - size - 10, size, 7.8);
      if (lab) scene.text(dotX + size + 6, y - size * 0.55, rung.name, { class: 'mm-name', 'font-size': n1(lab) });
    }

    // The fall itself, drawn as the parcels it is taken in. One drop is one arrow the whole way; in
    // stages it is drawn as the parcels, each one an ATP's worth of the same fall. It stands in the
    // clear width to the right of the rungs' names, where nothing else is drawn.
    const yFrom = Y(c.volts);
    const yTo = Y(O2_VOLTS);
    const fx = w - pad - size * 16;
    const whole = fallKj();
    const captured = capturedKj();
    if (s.dropMode === 'one-step') {
      stepArrow(fx, yFrom, fx, yTo, { out: false, differs: false, colour: INK.coral, width: 2.4 });
      const words = `one drop · ${n1(captured)} of ${n1(whole)} caught`;
      const sl = fit(words, w - pad - fx - 10, size, 7.8);
      if (sl) scene.text(w - pad, (yFrom + yTo) / 2 + sl * 0.35, words, { anchor: 'end', class: 'mm-note mm-halo', 'font-size': n1(sl) });
    } else {
      // The parcels are the argument, so they are drawn across the whole pane and not only in the
      // arrow's own column: each hairline is one ATP's worth of the same fall, and counting them is
      // what answers "why is metabolism long".
      const parcels = Math.max(1, Math.round(whole / ATP_KJ));
      for (let i = 0; i < parcels; i += 1) {
        const y1 = yFrom + ((yTo - yFrom) * i) / parcels;
        const y2 = yFrom + ((yTo - yFrom) * (i + 1)) / parcels;
        if (i > 0) scene.line(ladderX, y1, w - pad, y1, { stroke: C.rule, 'stroke-dasharray': '4 4' });
        stepArrow(fx, y1 + 1, fx, y2 - 1, { out: false, differs: false, colour: INK.leaf, width: 2.2 });
        const per = fit(`one ATP · ${n1(ATP_KJ)} kJ/mol`, Math.max(40, fx - ladderX - size * 2), size - 0.8, 7.6);
        if (per && i === 0) scene.text(ladderX + size * 1.6, (y1 + y2) / 2 + per * 0.35, `one ATP · ${n1(ATP_KJ)} kJ/mol`, { class: 'mm-note mm-halo', 'font-size': n1(per) });
      }
      const words = `${parcels} parcels · ${n1(captured)} of ${n1(whole)} caught`;
      const sl = fit(words, w - pad - fx - 10, size, 7.8);
      if (sl) scene.text(w - pad, (yFrom + yTo) / 2 + sl * 0.35, words, { anchor: 'end', class: 'mm-note mm-halo', 'font-size': n1(sl) });
    }
    // The falling pair, while a drop is running.
    if (fallPhase > 0) {
      const y = yFrom + (yTo - yFrom) * Math.min(1, fallPhase);
      node(fx, y, size * 0.5, INK.coral, '', C.paper, 1);
    }

    // The pool: small on purpose, and a full one stops the oxidation above it.
    const py = bottom + poolBand * 0.34;
    scene.line(pad, bottom + 6, w - pad, bottom + 6, { stroke: C.ruleStrong });
    scene.text(pad, bottom + 6 + size + 2, `THE CARRIER POOL · ${POOL} IN ALL`, { class: 'mm-head', 'font-size': n1(Math.min(size, 9.2)) });
    const cr = clamp(Math.min((w - pad * 2) / (POOL * 3), poolBand * 0.2), 7, 16);
    for (let i = 0; i < POOL; i += 1) {
      const cx = pad + cr + i * cr * 2.6;
      const loaded = i < carrierLoaded;
      node(cx, py + size + cr, cr, loaded ? CARRIER_LOADED.color : CARRIER_EMPTY.color, loaded ? 'H' : '', loaded ? CARRIER_LOADED.symbolColor : CARRIER_EMPTY.symbolColor, 1);
    }
    const words = poolFull()
      ? 'every carrier is loaded, so nothing more can be oxidised until one is spent'
      : `${carrierLoaded} of ${POOL} loaded · a cell holds very little of it and recycles it constantly`;
    const sl = fit(words, w - pad * 2 - POOL * cr * 2.6 - 10, size - 0.4, 7.8);
    if (sl) scene.text(w - pad, py + size + cr + sl * 0.35, words, { anchor: 'end', class: poolFull() ? 'mm-name' : 'mm-note', 'font-size': n1(sl), style: poolFull() ? `fill:${INK.coral}` : undefined });
    // The ATP made so far, beside the pool, because it is the tally the two modes are compared on.
    scene.text(w - pad, bottom + 6 + size + 2, `${n1(atpMade)} ATP made`, { anchor: 'end', class: 'mm-num', 'font-size': n1(size) });
    scene.focusMark();
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
    const r = ledger.readout({
      title: narrow ? null : (s.scene === 'electrons' ? 'THE FALL' : 'THE MAP'),
      x: pad, width, size, minRow,
    });
    // The readout wraps a sentence to its column and draws nothing below the pane's own box, so a table
    // with more rows than the pane is tall is clipped there rather than painted over the toolbar.
    // The whole pane, not two pixels short of it: the readout now clips at the box it is given, and the
    // pane's own bottom edge is one pixel above the toolbar (measured at 390 px), so those two pixels of
    // old safety margin were two pixels of table thrown away — atp3d lost the Total row to them.
    const room = Math.max(30, hgt);
    const note = (sentence) => r.note(sentence);

    if (s.scene === 'electrons') {
      r.row('The whole fall', `${n1(d.fallKj)} kJ/mol`);
      r.row('Captured', `${n1(d.capturedKj)} kJ/mol`);
      r.row('Lost as heat', `${n1(d.heatKj)} kJ/mol`);
      r.sum('Captured fraction', n2(d.capturedFraction));
      note(fallSentence(d, narrow));
      if (!narrow) r.head('THE CARRIER POOL');
      r.row('Loaded', `${d.carrierLoaded} of ${d.carrierPool}`);
      r.row('ATP made', n1(d.atpMade));
      if (!narrow) note(poolSentence(d));
    } else {
      // On a phone the block comes first: it is what the reader did, and the fuel and the route are on
      // the stage above. At desktop width the table reads in the order the map does.
      if (narrow) {
        r.row('Piling up', d.accumulating ?? 'nothing');
        r.row('Drained away', d.drainedAway.length ? String(d.drainedAway.length) : 'nothing');
        r.row('Steps that differ', String(d.stepsThatDiffer));
        note(d.knockedOut ? blockSentence(d, true) : directionSentence(d, true));
      } else {
        r.row('Fuel', FUEL_BY_ID[d.fuel].label);
        r.row('Steps to the waist', String(FUEL_BY_ID[d.fuel].steps.length));
        r.row('Shared intermediates', String(d.waistCompounds));
        r.row('Steps that differ', String(d.stepsThatDiffer));
        note(directionSentence(d, false));
        r.head('THE BLOCK');
        r.row('Piling up', d.accumulating ?? 'nothing');
        r.row('Drained away', d.drainedAway.length ? String(d.drainedAway.length) : 'nothing');
        note(blockSentence(d));
      }
    }
    r.fill(room);
  }

  function fallSentence(d, narrow) {
    if (d.dropMode === 'one-step') {
      return narrow
        ? `One coupled step pays for one ATP, so ${Math.round((1 - d.capturedFraction) * 100)} per cent leaves as heat.`
        : `Dropped in one go, the whole fall happens in one coupled step, and one coupled step can pay for one ATP: ${Math.round((1 - d.capturedFraction) * 100)} per cent of it leaves as heat.`;
    }
    return narrow
      ? `The same fall in parcels an ATP wide: ${n2(d.capturedFraction)} is caught.`
      : `The same fall, taken in parcels the size of one ATP, catches ${n2(d.capturedFraction)} of it. That is why metabolism is long.`;
  }

  function poolSentence(d) {
    return d.poolFull
      ? 'Every carrier is loaded and nothing has spent one, so oxidation has stopped: the pool, not the fuel, is the limit.'
      : 'A cell holds very little carrier and recycles it constantly. Fill the pool without spending it and the oxidation above it stops.';
  }

  function directionSentence(d, narrow) {
    if (d.direction === 'anabolic') {
      return narrow
        ? `${d.stepsThatDiffer} steps use different enzymes, which is what lets the two be controlled apart.`
        : `${FUEL_BY_ID[d.fuel].anabolic}. The two routes are never each other reversed, and that is what lets a cell switch one off without switching the other on.`;
    }
    return narrow
      ? 'Many fuels in, a few shared intermediates, many products out.'
      : 'Many fuels funnel into a few shared intermediates and many products are built out of them, which is why a cell can eat almost anything with a modest number of enzymes.';
  }

  // Read in every state its parts can take: nothing blocked, an enzyme just removed and the levels not
  // yet moved, or a compound piling up with a list behind it. Compound names keep their capitals, which
  // is why none of this lowercases them.
  function blockSentence(d, narrow = false) {
    if (!d.knockedOut) return 'Nothing is blocked. Knock an enzyme out and watch which compound climbs and what disappears past it.';
    if (!d.accumulating) return `${d.knockedOut} has just been removed; watch which compound climbs.`;
    if (narrow) return `${d.accumulating} is piling up; ${d.drainedAway.length} past it drained away.`;
    return `${d.knockedOut} is gone, so ${d.accumulating} is piling up in front of the gap${d.drainedAway.length ? ` and ${d.drainedAway.join(', ')} past it ${d.drainedAway.length === 1 ? 'has' : 'have'} drained away` : ''}. Both facts are diagnostic.`;
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }

  b.onDraw(() => {
    if (s.scene === 'electrons') drawElectrons();
    else drawMap();
    drawLedger();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   scene            'map' or 'electrons'
  //   overlay          'matter' (follow the carbons) or 'energy' (shade by what each step releases)
  //   fuel             'glucose' | 'fatty-acid' | 'amino-acid'
  //   route            the compounds that fuel passes through, in order
  //   waistCompounds   how many shared intermediates the routes funnel into
  //   direction        'catabolic' or 'anabolic'
  //   stepsThatDiffer  steps where the two directions use different enzymes; never 0
  //   knockedOut       the enzyme removed, by name, or null
  //   accumulating     the compound piling up, READ OFF the levels the flow model holds
  //   drainedAway      what has fallen below a working level past the gap
  //   carrier          'nad' or 'fad'
  //   carrierLoaded, carrierPool, poolFull   the pool, which is small on purpose
  //   dropMode         'one-step' or 'stepwise'
  //   fallKj           the whole fall for this carrier: 220.0 for NADH, 201.0 for FADH₂
  //   capturedKj, heatKj   the two halves of one fall; they sum to fallKj exactly
  //   atpMade          cumulative since Reset, from the drops the reader has run
  //   capturedFraction capturedKj ÷ fallKj
  //   t                the clock, seconds, three decimals; cumulative, and Reset puts it back to 0
  //   playing          whether Run is on
  const handle = b.handle();
  // Again, and this time it can see the toolbar: the bench appends the toolbar to its wrapper inside
  // handle(), so a tidy run before that found nothing and the opening frame carried two dividers with
  // a hidden group between them.
  showControls();
  return handle;
}
