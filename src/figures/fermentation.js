// Figure 7.4, "What actually runs out": fermentation as a way of getting NAD⁺ back, not of making ATP.
//
// WHAT IT SHOWS (biology/ch07-cellular-respiration/FIGURES.md, 7.4, serving §7.7 `anaerobic`). A cell's
// NAD pool, twelve carriers drawn as discs on a ring, sits between the three things that load and empty
// it: glycolysis's sixth step, which loads a carrier with each pair of electrons it takes; the chain in
// the mitochondrion, which empties them while there is oxygen; and a fermentation route, which empties
// them onto pyruvate or acetaldehyde. It opens aerobic and running with the pool mostly empty. Take the
// oxygen away with no route and the pool fills in about three seconds of figure time, glycolysis stops,
// and the readout names what ran out: NAD⁺, not ATP. Switch on a route and glycolysis restarts, while ATP
// per glucose stays at 2 and the counter for ATP made by the fermentation step itself stays at 0.
//
// WHERE THE ACCURACY REVIEW OVERRIDES THE BRIEF (the chapter-7 accuracy review of 2026-09-24: its note on
// 7.4 and findings 6, 7, 10, 30, 33 and 42).
//   - The stall is a cell with no fermentation route, and its title says so: "A cell that cannot
//     ferment". A muscle is never shown stalling, because a muscle's cytosol always holds lactate
//     dehydrogenase (finding 10).
//   - The muscle preset opens with the route already at lactate, with oxygen, at a sprint's demand.
//   - "About 30 with oxygen" is labelled as fast skeletal muscle's, beside 32 for heart and liver (finding
//     42). Under the yeast preset it is 16 to 20, because yeast's chain has no complex I (finding 33).
//   - No word on the stage says fermentation in general makes no ATP: the claim is scoped to the step
//     drawn, "no ATP from this step", because some bacterial fermentations do make one later (finding 6).
//   - The ethanol is not called lost: two carbons leave as CO₂ for good, and a yeast with oxygen respires
//     the ethanol once the sugar is gone (finding 7).
//   - The clearance note names "within an hour or so" of stopping, sooner with gentle exercise, and what
//     goes is the EXTRA lactate, since blood always holds some (finding 30).
//   - Lactate has three fates here, not two: oxidised where it was made, oxidised in the heart, slow
//     fibres and brain, and carried to the liver for the Cori cycle (the review's note on the ledger).
//
// THE MODEL. One unit throughout: a carrier's worth of electrons, which is one NADH, one pyruvate and one
// ATP of glycolysis's net two. So glycolysis's rate in carriers a second is also its net ATP a second, and
// half of it is glucose a second — `glycolysisRate` is glucose a second of figure time.
//   - The pool is 12 carriers; L of them are loaded (continuous; the ring draws floor(L)). At 0.04 mmol/L
//     a carrier the pool is 0.48 mmol/L, "a fraction of a millimole per litre" as §7.7 says.
//   - The chain empties min(kC·L, chainMax) carriers a second while there is oxygen, saturating at L_C =
//     2.25 loaded. Each carrier it empties is a pyruvate oxidised too, worth (yield − 2) / 2 ATP beyond
//     glycolysis's: 14 in fast skeletal muscle, whose shuttle makes it 30 per glucose, and 8 in yeast (18,
//     the middle of 16 to 20). chainMax is 0.5 for the cell and 0.25 for yeast, so the cell's chain alone
//     can meet 7.5 ATP a second and the yeast's 2.25.
//   - Glycolysis wants whatever the chain's ATP leaves of the demand, up to 12 ATP a second. It loads a
//     carrier for each ATP, and while every carrier is loaded it can go no faster than they are emptied.
//   - A route empties K_F·L carriers a second with no oxygen; with oxygen it takes only the excess over
//     L_C, which is the overflow a fast fibre (or a yeast on plentiful sugar) sends to lactate or ethanol
//     with oxygen present. Each carrier it empties makes one lactate, or one ethanol and one CO₂, at 0.04
//     mmol/L, and FERMENT_STEP_ATP of ATP, which is 0 for both routes. The drive recipe checks both
//     readouts against that, and is proved red by setting a route's entry to 1.
//   - ATP per glucose is the pyruvate-weighted mean: 2 + (yield − 2) × the share going to the chain.
//   - Lactate clears only while the chain has room to spare (oxygen, no fermenting, chain below its
//     maximum), exponentially, with a half-time of 2.5 s of figure time at rest that halves at a middling
//     demand: gentle exercise clears it faster than rest does. What clears is split 50 : 30 : 20 between
//     oxidised where it was made, oxidised in the heart, slow fibres and brain, and sent to the liver; the
//     split is illustrative, not measured. The liver spends 6 ATP rebuilding each glucose from two lactate.
//
// WHAT IT LEAVES OUT, and why.
//   - The shuttle that carries glycolysis's electrons into the mitochondrion is a label on the lanes, "by
//     a shuttle"; its cost is inside the 30. The matrix's own NAD pool and the Krebs cycle are not drawn.
//   - Respiratory control: the chain runs as fast as the loaded carriers let it, not as ADP lets it. With
//     it, a pool filled by a stall stays full once the oxygen returns, which teaches nothing true.
//   - The Crabtree effect is drawn as overflow, the yeast's small chain spilling its excess to ethanol. The
//     real switch is glucose repressing respiration; the figure has no sugar variable.
//   - Figure time is compressed: the pool fills in seconds, as §7.7 says, but lactate clears in seconds
//     too, where a body takes an hour or so. The readout says so beside the timer. Lactate stops at 30
//     mmol/L, about the most a working muscle holds.
//   - Ethanol by volume is mmol/L × 46.07 g/mol ÷ 789 g/L, to show how far a few seconds are from a brew.
//
// THE TWO COMPOSITIONS. Wide: glycolysis a column on the left, the pool's ring in the middle, the
// mitochondrion a capsule on the right, the fermentation row under the ring, the readout beside it all.
// Narrow, below a 720 px stage: the same drawing turned a quarter, glycolysis a row along the top, the
// chain a capsule along the bottom, the fermentation route down the right, and the readout under it.
// 720 and not the book's usual 800 because a wide figure's stage is at least 723 px wherever the stage is
// 16 : 9 (every viewport of 800 px and up) and tall below that; an 800 threshold would put the tall
// composition into a 16 : 9 stage on an iPad or a phone held sideways.
// narrowAspect is 9 / 16, not the brief's 4 / 5: the ring's discs must stay discs with a letter on them
// (radius 9 px at least, so the ring at least 45 px) and still leave the four stations room, and a 342 px
// stage at 4 / 5 left the drawing about 180 px after a three-row toolbar and the readout. 9 / 16 is the
// wide stage turned, as the drawing is.
//
// describe() reports, beyond the frame's and the bench's fields:
//   oxygen, route ('none' | 'lactate' | 'ethanol'), preset ('muscle' | 'yeast' | null), demand (ATP/s)
//   nadPoolTotal (12), nadhLoaded, nadEmpty       whole carriers, as the ring draws them
//   poolFull, ranOutOf ('nad' | null)             every carrier loaded; what then limits glycolysis
//   glycolysisRate                                glucose a second of figure time
//   secondsStalled                                figure time since glycolysis stopped for want of NAD⁺
//   atpMadePerSecond, keepingUp                   ATP made, capped at the demand; whether it meets it
//   atpPerGlucose, yieldTissue                    the pyruvate-weighted yield, and whose 30 (or 16 to 20)
//   atpFromFermentationStep                       ATP made by the fermentation step itself: always 0
//   fermenting, chainRunning                      whether each is emptying carriers now
//   lactateMM                                     the EXTRA lactate this cell has made, mmol/L
//   ethanolMM, ethanolPercent                     ethanol made, mmol/L and per cent by volume
//   co2Released, carbonsInEthanol                 per glucose on the ethanol route: 2 and 4; else 0
//   clearing, clearingSeconds, clearedSeconds     the clearance timer (clearedSeconds null until cleared)
//   lactateOxidised, lactateOxidisedElsewhere, lactateToLiver   the three fates of what cleared, mmol/L
//   liverAtpSpent                                 6, per glucose the liver rebuilds
//   situation                                     which sentence the readout is showing
//   t, playing                                    the clock
import { C, clamp, tint, polar } from './lib/svg.js';
import { bench } from './lib/bench.js';
import { metabolismPart, ORGANELLE_BY_ID } from '../palette.js';

export const meta = {
  kind: 'fermentation',
  title: 'What actually runs out',
  needsWebGL: false,
  aspect: 16 / 9,
  narrowAspect: 9 / 16,
};

// ---------------------------------------------------------------- the model

const NARROW_W = 720;
const STEP = 1 / 60;
const POOL = 12;
const MM_PER_CARRIER = 0.04;
const GLYCOLYSIS_MAX = 12;
const L_C = 2.25;
const K_F = 2.3;
const LACTATE_CAP = 30;
const CLEAR_HALF_REST = 2.5;
const CLEARED_BELOW = 0.05;
const ETHANOL_PERCENT_PER_MM = 46.07 / 789 / 10;
const FATES = Object.freeze({ here: 0.5, elsewhere: 0.3, liver: 0.2 });
// ATP made by each route's own step, per carrier emptied. Zero for both routes the figure draws, and the
// value the drive recipe's red proof breaks.
const FERMENT_STEP_ATP = Object.freeze({ none: 0, lactate: 0, ethanol: 0 });
const LIVER_ATP_PER_GLUCOSE = 6;
const DEMAND = Object.freeze({ min: 1, max: 16 });
const L_OPEN = 1.2; // the steady state at the opening demand of 4
const EPS = 1e-9;
const LANE_GAP = 27; // px between two carriers on a lane: three of the dashes' 9
const PHASE_WRAP = 540; // a whole number of dashes and of lane gaps, so the wrap is invisible

function organism(id, yieldAtp, chainMax, tissue, mitoAtp) {
  const pairAtp = yieldAtp / 2;
  return Object.freeze({ id, yieldAtp, chainMax, tissue, mitoAtp, perPair: pairAtp - 1, aMax: chainMax * pairAtp, kC: chainMax / L_C });
}

const ORG = Object.freeze({
  cell: organism('cell', 30, 0.5, 'fast skeletal muscle', '+28'),
  yeast: organism('yeast', 18, 0.25, 'yeast', '+14 to 18'),
});

const OPEN = Object.freeze({ oxygen: true, route: 'none', preset: null, demand: 4 });
const PRESETS = Object.freeze({
  // A fast fibre at a sprint: oxygen present, lactate dehydrogenase already working (finding 10).
  muscle: Object.freeze({ oxygen: true, route: 'lactate', demand: 10 }),
  // Brewer's yeast sealed off from the air.
  yeast: Object.freeze({ oxygen: false, route: 'ethanol', demand: 3 }),
});

const orgOf = (s) => (s.preset === 'yeast' ? ORG.yeast : ORG.cell);

// The rates at this instant, in carriers a second.
function flows(s) {
  const o = orgOf(s);
  const L = s.L;
  const chain = s.oxygen ? Math.min(o.kC * L, o.chainMax) : 0;
  const ferm = s.route === 'none' ? 0 : K_F * Math.max(0, L - (s.oxygen ? L_C : 0));
  const want = clamp(s.demand - chain * o.perPair, 0, GLYCOLYSIS_MAX);
  const full = L >= POOL - EPS;
  const load = full ? Math.min(want, chain + ferm) : want;
  const supply = load + chain * o.perPair + ferm * FERMENT_STEP_ATP[s.route];
  return { o, chain, ferm, want, full, load, supply, made: Math.min(supply, s.demand), keepingUp: supply >= s.demand - 1e-6 };
}

const loadedCount = (s) => Math.min(POOL, Math.floor(s.L + 1e-9));
const stalledNow = (f) => f.full && f.load < EPS && f.want > EPS;
const clearingNow = (s, f) => s.lactate > 0 && s.oxygen && f.ferm <= 1e-6 && f.chain < f.o.chainMax - EPS;

// Rest clears lactate; a middling demand clears it twice as fast; near the chain's limit it is back to
// the resting rate, and at the limit it stops (clearingNow).
function halfTime(demand, o) {
  const x = clamp((demand - 1) / Math.max(1e-6, o.aMax - 1), 0, 1);
  return CLEAR_HALF_REST / (1 + 4 * x * (1 - x));
}

function perGlucose(s, f) {
  const out = f.chain + f.ferm;
  const share = out > EPS ? f.chain / out : (s.oxygen ? 1 : 0);
  return 2 + (f.o.yieldAtp - 2) * share + 2 * FERMENT_STEP_ATP[s.route] * (1 - share);
}

// How fast the marks on a path move, in px a second, for a rate in carriers a second.
const speed = (rate) => (rate > 1e-6 ? 10 + 18 * Math.sqrt(rate) : 0);

function restartModel(s) {
  s.L = L_OPEN;
  s.stalledFor = 0;
  s.lactate = 0;
  s.ethanol = 0;
  s.fermStepAtp = 0;
  s.clearingFor = 0;
  s.clearedAt = null;
  s.fates = { here: 0, elsewhere: 0, liver: 0 };
  s.phase = { gly: 0, chain: 0, ferm: 0, ring: 0 };
}

function stepModel(s, dt) {
  const f = flows(s);
  s.L = Math.max(0, s.L - (f.chain + f.ferm) * dt);
  const room = POOL - s.L;
  const inc = f.want * dt;
  let loaded;
  if (inc >= room) {
    loaded = room;
    s.L = POOL;
  } else {
    loaded = inc;
    s.L += inc;
  }
  s.stalledFor = f.full && loaded < EPS && f.want > EPS ? s.stalledFor + dt : 0;
  const made = f.ferm * dt * MM_PER_CARRIER;
  if (s.route === 'lactate') s.lactate = Math.min(LACTATE_CAP, s.lactate + made);
  else if (s.route === 'ethanol') s.ethanol += made;
  s.fermStepAtp += f.ferm * dt * FERMENT_STEP_ATP[s.route];
  if (s.route === 'lactate' && f.ferm > 1e-6) {
    s.clearedAt = null;
    s.clearingFor = 0;
  } else if (clearingNow(s, f)) {
    s.clearingFor += dt;
    let gone = s.lactate * (1 - 0.5 ** (dt / halfTime(s.demand, f.o)));
    s.lactate -= gone;
    if (s.lactate < CLEARED_BELOW) {
      gone += s.lactate;
      s.lactate = 0;
      s.clearedAt = s.clearingFor;
    }
    s.fates.here += gone * FATES.here;
    s.fates.elsewhere += gone * FATES.elsewhere;
    s.fates.liver += gone * FATES.liver;
  }
  const adv = (key, rate) => { s.phase[key] = (s.phase[key] + speed(rate) * dt) % PHASE_WRAP; };
  adv('gly', f.load);
  adv('chain', f.chain);
  adv('ferm', f.ferm);
  adv('ring', (f.load + f.chain + f.ferm) / 2);
}

// ---------------------------------------------------------------- the words

function titleOf(s) {
  if (s.preset === 'muscle') return 'Fast skeletal muscle fibre';
  if (s.preset === 'yeast') return 'Brewer\'s yeast';
  if (s.route === 'lactate') return 'A cell that can ferment to lactate';
  if (s.route === 'ethanol') return 'A cell that can ferment to ethanol';
  return 'A cell that cannot ferment';
}

// The one sentence the readout carries, and the key the live region listens to.
function situation(s, f) {
  const who = s.preset === 'muscle' ? 'fibre' : 'cell';
  if (!s.oxygen) {
    if (stalledNow(f)) return { key: 'stalled', warn: true, text: 'Stalled. What has run out is NAD⁺, not ATP: step 6 has no empty carrier to hand its electrons to, so glycolysis cannot make even its two ATP. A cell that cannot ferment stops here.' };
    if (s.route === 'none') return { key: 'filling', warn: false, text: 'No oxygen, so the chain has stopped and nothing empties the NADH. Every glucose through glycolysis loads two more carriers.' };
    if (!f.keepingUp) return { key: 'short', warn: true, text: `No oxygen, and glycolysis is at its fastest, ${GLYCOLYSIS_MAX} ATP a second, which is less than the demand. Fermentation keeps it running; it cannot make it faster.` };
    return { key: 'fermenting', warn: false, text: s.route === 'lactate'
      ? 'No oxygen, but the lactate step empties the NADH, so glycolysis keeps running. ATP per glucose is still 2: the lactate step makes none.'
      : 'No oxygen, but the ethanol steps empty the NADH, so glycolysis keeps running. ATP per glucose is still 2: those steps make none.' };
  }
  if (f.ferm > 1e-6) {
    if (s.preset === 'yeast') return { key: 'overflow', warn: false, text: 'With sugar plentiful the yeast ferments even with oxygen present: its chain is small, and the NADH it cannot take goes to ethanol.' };
    return { key: 'overflow', warn: false, text: `Glycolysis is outrunning the chain, so the NADH the chain cannot take goes to ${s.route}, with oxygen present. The ${who} is buying rate with yield.` };
  }
  if (s.route === 'none' && f.full) return { key: 'throttled', warn: !f.keepingUp, text: 'Every carrier is loaded and the chain empties them only so fast, so glycolysis runs at the chain\'s pace. With no fermentation there is no faster way.' };
  if (s.route === 'none' && f.chain >= f.o.chainMax - EPS && f.want > f.chain + 1e-6) return { key: 'rising', warn: false, text: 'NADH is piling up: glycolysis is loading carriers faster than the chain can empty them.' };
  if (f.want <= EPS) return { key: 'backlog', warn: false, text: 'The chain is working through NADH that piled up, and for now that alone meets the demand, so glycolysis waits.' };
  if (s.lactate > 0) {
    if (clearingNow(s, f)) return { key: 'clearing', warn: false, text: `The chain has room to spare, so the lactate goes back to pyruvate and is oxidised: in this ${who}, in the heart, slow fibres and brain, or made back into glucose by the liver.` };
    return { key: 'waiting', warn: false, text: `The lactate clears once the chain has room to spare: bring the demand to ${Math.floor(f.o.aMax - 1e-9)} or less.` };
  }
  if (s.clearedAt !== null) return { key: 'cleared', warn: false, text: `The extra lactate is gone, cleared in ${s.clearedAt.toFixed(1)} s of figure time.` };
  return { key: 'aerobic', warn: false, text: 'With oxygen, the chain keeps the pool mostly empty. Take the oxygen away.' };
}

function tissueNote(o, level) {
  if (o.id === 'yeast') return level < 2 ? 'With oxygen, 16 to 20 in yeast, whose chain has no complex I.' : 'With oxygen, 16 to 20 in yeast.';
  return level < 2 ? 'With oxygen, about 30 in fast skeletal muscle and 32 in heart and liver.' : 'With oxygen, about 30 in fast skeletal muscle.';
}

const ETHANOL_NOTE = 'Two carbons leave as CO₂ for good. The ethanol keeps the other four, and a yeast with oxygen respires it once the sugar is gone.';
const CLEAR_NOTE = 'In a body the extra lactate is gone within an hour or so of stopping, sooner with gentle exercise. The figure\'s clock runs far faster.';

const wholeOr = (v, dp) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(dp));
const round = (v, dp) => Number(v.toFixed(dp));
const f2 = (v) => v.toFixed(2);

// ---------------------------------------------------------------- styles and colours

const CSS = (sel) => `
${sel} .fe-num { font-variant-numeric: lining-nums tabular-nums; }
${sel} .fe-demand .tb-val { min-width: 4.4rem; }
`;

const EMPTY = metabolismPart('electronCarrier');
const LOADED = metabolismPart('electronCarrierLoaded');
const ENZ = metabolismPart('enzyme');
const MITO = ORGANELLE_BY_ID.mitochondrion.color;

const CELL_ARIA = 'A cell\'s NAD pool, twelve carriers on a ring, each drawn empty or loaded, between glycolysis, the chain in a mitochondrion and a fermentation route. O takes the oxygen away or gives it back; N, L and E choose no fermentation, lactate or ethanol; the arrow keys change the demand; M and Y load the muscle and yeast presets; Space runs or pauses; Home resets.';

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 704 });

  const m = { ...OPEN };
  restartModel(m);
  let syncing = false;
  let quietDraw = false;
  let spokenKey = null;

  // ---- panes: the drawing first, so it is the stage's first focusable thing ----
  const cell = b.pane('cell', { as: 'svg', focus: true, aria: CELL_ARIA });
  const paneR = b.pane('readout', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 60fr) minmax(0, 40fr)',
      rows: 'minmax(0, 1fr)',
      at: { cell: [1, 1], readout: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 64fr) minmax(0, 36fr)',
      rowGap: 'var(--space-1)',
      at: { cell: [1, 1], readout: [1, 2] },
    },
  });

  // ---- controls: oxygen and demand, the route, the presets, then the clock ----
  const oxyCtl = b.toggle('Oxygen', (on) => {
    m.oxygen = on;
    if (!syncing) afterChange();
  }, { pressed: OPEN.oxygen, primary: true, aria: 'Oxygen, on or off: off stops the chain' });
  const demandCtl = b.stepper('Demand', {
    min: DEMAND.min, max: DEMAND.max, step: 1, value: OPEN.demand, unit: 'ATP/s',
    valueText: (v) => `${v} ATP a second`,
    onInput: (v) => {
      m.demand = clamp(Math.round(v), DEMAND.min, DEMAND.max);
      if (!syncing) afterChange();
    },
  });
  demandCtl.node.classList.add('fe-demand');
  b.divide();
  const routeCtl = b.choice('Fermentation route', [
    { id: 'none', label: 'No fermentation', aria: 'No fermentation, a cell with no way to empty NADH but the chain' },
    { id: 'lactate', label: 'Lactate', aria: 'Lactate, one step: pyruvate takes the electrons and becomes lactate' },
    { id: 'ethanol', label: 'Ethanol', aria: 'Ethanol, two steps: carbon dioxide leaves, and acetaldehyde takes the electrons and becomes ethanol' },
  ], (id) => {
    const changed = id !== m.route;
    m.route = id;
    if (syncing) return;
    // A preset IS its route, so choosing another route leaves the preset.
    if (changed && m.preset) {
      m.preset = null;
      presetCtl.set(null, { quiet: true });
    }
    afterChange();
  }, { segmented: true, value: OPEN.route });
  b.divide();
  const presetCtl = b.choice('Preset', [
    { id: 'muscle', label: 'Muscle', aria: 'Muscle, a fast skeletal muscle fibre at a sprint: lactate, with oxygen' },
    { id: 'yeast', label: 'Yeast', aria: 'Yeast, brewer\'s yeast sealed off from the air: ethanol, without oxygen' },
  ], (id) => applyPreset(id), { value: OPEN.preset });
  b.divide();
  const runCtl = b.run({ primary: false, aria: 'Run, start the clock' });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the cell back as it opened' });

  function afterChange() {
    quietDraw = true;
    b.redraw();
    quietDraw = false;
    b.announce();
  }

  function applyPreset(id) {
    if (!id) return;
    const p = PRESETS[id];
    syncing = true;
    m.preset = id;
    m.oxygen = p.oxygen;
    m.route = p.route;
    m.demand = p.demand;
    oxyCtl.set(p.oxygen, { quiet: true });
    routeCtl.set(p.route, { quiet: true });
    demandCtl.set(p.demand);
    syncing = false;
    quietDraw = true;
    b.restart();
    quietDraw = false;
    b.announce();
  }

  function resetAll() {
    syncing = true;
    Object.assign(m, OPEN);
    oxyCtl.set(OPEN.oxygen, { quiet: true });
    routeCtl.set(OPEN.route, { quiet: true });
    presetCtl.set(OPEN.preset, { quiet: true });
    demandCtl.set(OPEN.demand);
    syncing = false;
    runCtl.set(!ctx.reducedMotion);
    quietDraw = true;
    b.restart();
    quietDraw = false;
    b.announce();
  }

  const bumpDemand = (d) => demandCtl.set(clamp(m.demand + d, DEMAND.min, DEMAND.max));
  b.keys({
    o: () => oxyCtl.toggle(),
    O: () => oxyCtl.toggle(),
    n: () => routeCtl.set('none'),
    N: () => routeCtl.set('none'),
    l: () => routeCtl.set('lactate'),
    L: () => routeCtl.set('lactate'),
    e: () => routeCtl.set('ethanol'),
    E: () => routeCtl.set('ethanol'),
    ArrowUp: () => bumpDemand(1),
    ArrowRight: () => bumpDemand(1),
    ArrowDown: () => bumpDemand(-1),
    ArrowLeft: () => bumpDemand(-1),
    m: () => presetCtl.set('muscle'),
    M: () => presetCtl.set('muscle'),
    y: () => presetCtl.set('yeast'),
    Y: () => presetCtl.set('yeast'),
    ' ': () => runCtl.toggle(),
    Enter: () => runCtl.toggle(),
    Home: () => resetAll(),
  });

  b.clock({ step: STEP, advance: (dt) => stepModel(m, dt), restart: () => restartModel(m) });
  // It opens running, as the brief says, unless the reader has asked for less motion.
  runCtl.set(!ctx.reducedMotion);

  // ---- what describe() reports ----
  b.onDescribe(() => {
    const f = flows(m);
    const nLoaded = loadedCount(m);
    return {
      oxygen: m.oxygen,
      route: m.route,
      preset: m.preset,
      demand: m.demand,
      nadPoolTotal: POOL,
      nadhLoaded: nLoaded,
      nadEmpty: POOL - nLoaded,
      poolFull: f.full,
      ranOutOf: f.full ? 'nad' : null,
      glycolysisRate: round(f.load / 2, 3),
      secondsStalled: round(m.stalledFor, 2),
      atpMadePerSecond: round(f.made, 2),
      keepingUp: f.keepingUp,
      atpPerGlucose: round(perGlucose(m, f), 1),
      yieldTissue: f.o.tissue,
      atpFromFermentationStep: round(m.fermStepAtp, 3),
      fermenting: f.ferm > 1e-6,
      chainRunning: f.chain > 1e-6,
      lactateMM: round(m.lactate, 3),
      ethanolMM: round(m.ethanol, 3),
      ethanolPercent: round(m.ethanol * ETHANOL_PERCENT_PER_MM, 4),
      co2Released: m.route === 'ethanol' ? 2 : 0,
      carbonsInEthanol: m.route === 'ethanol' ? 4 : 0,
      clearing: clearingNow(m, f),
      clearingSeconds: round(m.clearingFor, 2),
      clearedSeconds: m.clearedAt === null ? null : round(m.clearedAt, 2),
      lactateOxidised: round(m.fates.here, 3),
      lactateOxidisedElsewhere: round(m.fates.elsewhere, 3),
      lactateToLiver: round(m.fates.liver, 3),
      liverAtpSpent: LIVER_ATP_PER_GLUCOSE,
      situation: situation(m, f).key,
      t: round(b.time, 3),
      playing: b.playing,
    };
  });

  b.onAnnounce(() => {
    const s = situation(m, flows(m));
    spokenKey = s.key;
    return `${titleOf(m)}, ${m.oxygen ? 'with' : 'without'} oxygen, spending ${m.demand} ATP a second. ${s.text}`;
  });

  // ---------------------------------------------------------------- drawing helpers

  // Text in the drawing: every label carries its own fill, because SVG text with none is black.
  function say(p, x, y, str, o = {}) {
    return p.text(x, y, str, {
      anchor: o.anchor ?? null,
      fit: o.fit ?? null,
      width: o.width ?? null,
      'font-size': o.fit ? undefined : f2(o.size ?? 10),
      'font-weight': o.weight ?? undefined,
      class: o.num ? 'fe-num' : undefined,
      style: `fill:${o.fill ?? C.ink}`,
    });
  }

  // A straight arrow. Active, it is the flow's colour with its dashes moving; idle, a still rule.
  function arrow(p, x1, y1, x2, y2, { colour = C.soft, active = true, phase = 0, width = 1.6, head = 5.5, dashed = true } = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (!(len > head + 2)) return;
    const ux = dx / len;
    const uy = dy / len;
    const bx = x2 - ux * head;
    const by = y2 - uy * head;
    const stroke = active ? colour : C.ruleStrong;
    const dash = active && dashed ? { 'stroke-dasharray': '5 4', 'stroke-dashoffset': f2(-(phase % 9)) } : {};
    p.line(x1, y1, bx, by, { stroke, 'stroke-width': width, ...dash });
    const nx = -uy * head * 0.6;
    const ny = ux * head * 0.6;
    p.path(`M${f2(x2)} ${f2(y2)} L${f2(bx + nx)} ${f2(by + ny)} L${f2(bx - nx)} ${f2(by - ny)} Z`, { fill: stroke });
  }

  // A bent arrow, for the pyruvate that goes on to the mitochondrion.
  function road(p, pts, { colour, active, phase, width = 1.6, head = 5.5 }) {
    const n = pts.length;
    const [xa, ya] = pts[n - 2];
    const [xb, yb] = pts[n - 1];
    const len = Math.hypot(xb - xa, yb - ya);
    if (!(len > head + 2)) return;
    const ux = (xb - xa) / len;
    const uy = (yb - ya) / len;
    const bx = xb - ux * head;
    const by = yb - uy * head;
    const stroke = active ? colour : C.ruleStrong;
    const d = `${pts.slice(0, -1).map(([x, y], i) => `${i ? 'L' : 'M'}${f2(x)} ${f2(y)}`).join(' ')} L${f2(bx)} ${f2(by)}`;
    p.path(d, {
      fill: 'none', stroke, 'stroke-width': width, 'stroke-linejoin': 'round',
      ...(active ? { 'stroke-dasharray': '5 4', 'stroke-dashoffset': f2(-(phase % 9)) } : {}),
    });
    const nx = -uy * head * 0.6;
    const ny = ux * head * 0.6;
    p.path(`M${f2(xb)} ${f2(yb)} L${f2(bx + nx)} ${f2(by + ny)} L${f2(bx - nx)} ${f2(by - ny)} Z`, { fill: stroke });
  }

  // A carrier: empty is the pale fill ringed in the loaded colour; loaded is solid, with an H on it.
  function disc(p, x, y, r, loaded, letter = true) {
    p.circle(x, y, r, loaded
      ? { fill: LOADED.color, stroke: C.paper2, 'stroke-width': 1 }
      : { fill: EMPTY.color, stroke: LOADED.color, 'stroke-width': f2(Math.max(0.8, r * 0.1)) });
    if (!loaded || !letter) return;
    const size = b.fit('H', r * 1.9, r * 1.02, 6.5);
    if (size) p.text(x, y + size * 0.36, 'H', { anchor: 'middle', 'font-size': f2(size), 'font-weight': 700, style: `fill:${LOADED.symbolColor}` });
  }

  // One way along a lane between the ring and a station: a thin arrow, and while it runs, carriers on it.
  function lane(p, x1, y1, x2, y2, { loaded, active, phase, mr }) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (!(len > 10)) return;
    arrow(p, x1, y1, x2, y2, { colour: C.soft, active, dashed: false, width: 1.1, head: 4.5 });
    if (!active) return;
    const ux = dx / len;
    const uy = dy / len;
    for (let d = phase % LANE_GAP; d < len - 4.5 - mr; d += LANE_GAP) {
      if (d < mr + 1) continue;
      disc(p, x1 + ux * d, y1 + uy * d, mr, loaded, false);
    }
  }

  // A pair of lanes, one each way, `gap` px either side of the line from a to b. `toB` is what travels
  // from a to b; the other lane carries the other form back.
  function lanes(p, ax, ay, bx, by, { toB, active, phase, mr, gap = 6 }) {
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = (-(by - ay) / len) * gap;
    const ny = ((bx - ax) / len) * gap;
    lane(p, ax - nx, ay - ny, bx - nx, by - ny, { loaded: toB === 'loaded', active, phase, mr });
    lane(p, bx + nx, by + ny, ax + nx, ay + ny, { loaded: toB !== 'loaded', active, phase, mr });
  }

  function enzyme(p, x, y, rx, ry, { warn = false } = {}) {
    p.ellipse(x, y, rx, ry, { fill: ENZ.color, ...(warn ? { stroke: C.coral, 'stroke-width': 2 } : {}) });
  }

  // The pool: twelve carriers on a ring, loaded ones from the west going clockwise, and the count of
  // empty ones in the middle, because an empty one is what step 6 needs.
  function ring(p, cx, cy, R, r, f) {
    const nLoaded = loadedCount(m);
    const any = f.load + f.chain + f.ferm > 1e-6;
    p.circle(cx, cy, R, {
      fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.2,
      ...(any ? { 'stroke-dasharray': '3 6', 'stroke-dashoffset': f2(-(m.phase.ring % 9)) } : {}),
    });
    for (let i = 0; i < POOL; i += 1) {
      const [x, y] = polar(cx, cy, R, 270 + 30 * i);
      disc(p, x, y, r, i < nLoaded);
    }
    const nEmpty = POOL - nLoaded;
    const big = clamp(R * 0.36, 15, 40);
    const small = clamp(R * 0.13, 8.5, 11);
    const base = cy - big * 0.08;
    say(p, cx, base, String(nEmpty), { size: big, weight: 700, anchor: 'middle', num: true, fill: nEmpty === 0 ? C.coralText : C.ink });
    say(p, cx, base + small + 5, 'empty NAD⁺', { size: small, anchor: 'middle', fill: C.soft });
    say(p, cx, base + 2 * small + 8, `of ${POOL}`, { size: small, anchor: 'middle', fill: C.soft });
  }

  function legendItem(p, x, y, loaded, words, size, dr) {
    disc(p, x + dr, y - size * 0.34, dr, loaded);
    say(p, x + 2 * dr + 4, y, words, { size, fill: C.soft });
    return x + 2 * dr + 4 + words.length * 0.53 * size;
  }

  // ---------------------------------------------------------------- drawing: wide

  function drawWide(p, f) {
    const { w, h } = p.box;
    const o = f.o;
    const k = clamp(Math.min(w / 560, h / 470), 0.8, 1.25);
    const t = clamp(k, 0.92, 1.12);
    const stalled = stalledNow(f);

    say(p, 12, 19, titleOf(m), { fit: [12.5 * t, 9.5], width: w * 0.62, weight: 600 });

    const gx = 20 + 20 * k;
    const mW = clamp(w * 0.19, 88, 150);
    const mx1 = w - 12;
    const mx0 = mx1 - mW;
    const mcx = (mx0 + mx1) / 2;
    const TOPR = 66;
    const BELOW = 46 + 47 + 12;
    const Rr = Math.max(45, Math.min((h - TOPR - BELOW) / 2, (mx0 - gx - 22 - 92) / 2, h * 0.27));
    const slack = Math.max(0, h - TOPR - BELOW - 2 * Rr);
    const ringTop = TOPR + slack * 0.3;
    const cx = (gx + 22 + mx0) / 2;
    const cy = ringTop + Rr;
    const yp = cy + Rr + 46 + slack * 0.4;
    const yb = yp + 47 + slack * 0.2;
    const r = clamp(Rr * 0.16, 9, 24);
    const R = Rr - r;
    const mr = clamp(r * 0.55, 4, 7);
    const sRx = 20 * t;
    const sRy = 11 * t;

    // ---- the pool, its legend above it ----
    say(p, cx, ringTop - 27, 'The NAD pool', { size: 10.5 * t, weight: 700, anchor: 'middle' });
    const ls = 9.5 * t;
    const dr = clamp(r * 0.6, 6.5, 8);
    const wide1 = 2 * dr + 4 + 'empty NAD⁺'.length * 0.53 * ls;
    const wide2 = 2 * dr + 4 + 'loaded NADH'.length * 0.53 * ls;
    const lx = cx - (wide1 + 14 + wide2) / 2;
    legendItem(p, lx, ringTop - 9, false, 'empty NAD⁺', ls, dr);
    legendItem(p, lx + wide1 + 14, ringTop - 9, true, 'loaded NADH', ls, dr);
    ring(p, cx, cy, R, r, f);

    // ---- glycolysis, a column on the left ----
    const glyActive = f.load > 1e-6;
    say(p, gx, ringTop - 8, 'Glucose', { size: 10.5 * t, weight: 700, anchor: 'middle' });
    arrow(p, gx, ringTop - 2, gx, cy - sRy - 3, { colour: C.goldText, active: glyActive, phase: m.phase.gly });
    const up = (ringTop + cy - sRy) / 2;
    say(p, gx + 9, up - 2, 'steps 1–5', { size: 9 * t, fill: C.soft });
    say(p, gx + 9, up + 10 * t, '−2 ATP', { size: 9 * t, weight: 600 });
    enzyme(p, gx, cy, sRx, sRy, { warn: stalled });
    say(p, gx, cy + 3.2 * t, 'step 6', { size: 9 * t, weight: 700, anchor: 'middle', fill: ENZ.symbolColor });
    if (stalled) say(p, gx + sRx + 5, cy + 22 * t, 'stopped', { size: 9.5 * t, weight: 700, fill: C.coralText });
    arrow(p, gx, cy + sRy + 3, gx, yp - 12 * t, { colour: C.goldText, active: glyActive, phase: m.phase.gly });
    const down = (cy + sRy + yp - 12 * t) / 2;
    say(p, gx + 9, down + 4, 'steps 7–10', { size: 9 * t, fill: C.soft });
    say(p, gx + 9, down + 4 + 12 * t, '+4 ATP', { size: 9 * t, weight: 600 });
    say(p, gx, yp + 4 * t, 'Pyruvate', { size: 10.5 * t, weight: 700, anchor: 'middle' });
    // Step 6 takes an empty carrier and hands back a loaded one.
    lanes(p, cx - Rr - 3, cy, gx + sRx + 3, cy, { toB: 'empty', active: glyActive, phase: m.phase.gly, mr });

    // ---- the mitochondrion, a capsule on the right ----
    const my0 = ringTop - 6;
    const my1 = yb - 22;
    p.rect(mx0, my0, mW, my1 - my0, { rx: f2(mW / 2), fill: tint(MITO, 14, 'var(--paper-2)'), stroke: MITO, 'stroke-width': 1.6 });
    say(p, mcx, my0 + mW * 0.3 + 4, 'Mitochondrion', { fit: [10.5 * t, 8], width: mW * 0.84, anchor: 'middle', weight: 600 });
    say(p, mcx, cy - 3, 'Chain', { size: 11 * t, weight: 700, anchor: 'middle' });
    say(p, mcx, cy + 11 * t, m.oxygen ? 'O₂ → H₂O' : 'stopped', { size: 9.5 * t, anchor: 'middle', fill: m.oxygen ? C.soft : C.coralText, weight: m.oxygen ? null : 700 });
    const idle = f.chain <= 1e-6;
    say(p, mcx, cy + 40 * t, `${o.mitoAtp} ATP`, { fit: [11 * t, 8], width: mW * 0.84, anchor: 'middle', weight: 700, num: true, fill: idle ? C.soft : C.ink });
    say(p, mcx, cy + 53 * t, 'per glucose', { size: 9 * t, anchor: 'middle', fill: C.soft });
    let side = 0;
    for (let y = cy + 70 * t; y < my1 - mW * 0.45; y += 13) {
      const len = mW * 0.42;
      const xa = side ? mx1 - 2 : mx0 + 2;
      p.line(xa, y, side ? xa - len : xa + len, y, { stroke: tint(MITO, 45, 'var(--paper-2)'), 'stroke-width': 2.4, 'stroke-linecap': 'round' });
      side = 1 - side;
    }
    arrow(p, mcx, 26, mcx, my0 - 1, { colour: C.water, active: !idle, phase: m.phase.chain });
    say(p, mcx - 8, 40, m.oxygen ? 'O₂' : 'no O₂', { size: 10.5 * t, weight: 700, anchor: 'end', fill: m.oxygen ? C.waterText : C.coralText });
    // The chain takes loaded carriers and hands back empty ones, through a shuttle across the membrane.
    const eA = cx + Rr + 3;
    const eB = mx0 - 3;
    lanes(p, eA, cy, eB, cy, { toB: 'loaded', active: !idle, phase: m.phase.chain, mr });
    say(p, (eA + eB) / 2, cy + 21 * t, 'by a shuttle', { fit: [9 * t, 7.5], width: eB - eA - 4, anchor: 'middle', fill: C.soft });
    // Pyruvate the chain can take goes on into the mitochondrion.
    road(p, [[gx, yp + 10 * t], [gx, yb], [mcx, yb], [mcx, my1 + 1]], { colour: C.goldText, active: !idle, phase: m.phase.chain });

    // ---- the fermentation route, under the pool ----
    const fermActive = f.ferm > 1e-6;
    const ex = 16 * t;
    const ey = 10 * t;
    const px0 = gx + 27 * t;
    if (m.route === 'none') {
      say(p, cx, yp + 4, 'no fermentation', { size: 9.5 * t, anchor: 'middle', fill: C.soft });
      return;
    }
    const product = m.route === 'lactate' ? 'Lactate' : 'Ethanol';
    if (m.route === 'lactate') {
      arrow(p, px0, yp, cx - ex - 3, yp, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
    } else {
      const n1 = px0 + 34 * t;
      arrow(p, px0, yp, n1 - 12 * t - 3, yp, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
      enzyme(p, n1, yp, 12 * t, 8 * t);
      arrow(p, n1, yp + 8 * t + 3, n1, yp + 27 * t, { colour: C.soft, active: fermActive, phase: m.phase.ferm });
      say(p, n1 + 6, yp + 31 * t, 'CO₂', { size: 10 * t, weight: 700, fill: C.soft });
      const a0 = n1 + 12 * t + 3;
      const a1 = cx - ex - 3;
      arrow(p, a0, yp, a1, yp, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
      say(p, (a0 + a1) / 2, yp - 6, 'acetaldehyde', { fit: [9 * t, 7], width: a1 - a0 - 8, anchor: 'middle', fill: C.soft });
    }
    enzyme(p, cx, yp, ex, ey);
    arrow(p, cx + ex + 3, yp, cx + ex + 30 * t, yp, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
    say(p, cx + ex + 34 * t, yp + 4 * t, product, { size: 10.5 * t, weight: 700 });
    if (m.route === 'lactate') say(p, cx, yp + ey + 13 * t, 'lactate dehydrogenase', { size: 9 * t, anchor: 'middle', fill: C.soft });
    say(p, cx, yp + ey + (m.route === 'lactate' ? 25 : 13) * t, m.route === 'lactate' ? 'no ATP from this step' : 'no ATP from these steps', { size: 9 * t, anchor: 'middle', fill: C.soft });
    // The route takes loaded carriers from the pool and hands back empty ones.
    lanes(p, cx, cy + Rr + 3, cx, yp - ey - 3, { toB: 'loaded', active: fermActive, phase: m.phase.ferm, mr });
  }

  // ---------------------------------------------------------------- drawing: narrow

  function drawNarrow(p, f) {
    const { w, h } = p.box;
    const o = f.o;
    const k = clamp(Math.min(w / 342, h / 300), 0.85, 1.8);
    const t = clamp(k, 0.95, 1.3);
    const stalled = stalledNow(f);

    say(p, 10, 16 * t, titleOf(m), { fit: [11.5 * t, 9], width: w - 20, weight: 600 });

    const yg = 46 * k;
    const sx = w * 0.47;
    const xe = w - 50 * k;
    const ex = 16 * t;
    const ey = 10 * t;
    const sRx = 20 * t;
    const sRy = 11 * t;
    const capH = 44 * k;
    const yc1 = h - 8;
    const yc0 = yc1 - capH;
    const xc0 = 30 * k;
    const xc1 = w - 26 * k;
    const laneN = 28 * k;
    const laneS = 28 * k;
    const top = yg + sRy + 3 + laneN;
    const Rr = Math.max(45, Math.min((yc0 - laneS - top) / 2, sx - 92 * t, xe - ex - 40 * k - sx));
    const slack = Math.max(0, yc0 - laneS - top - 2 * Rr);
    const ringTop = top + slack * 0.5;
    const cx = sx;
    const cy = ringTop + Rr;
    const r = clamp(Rr * 0.16, 9, 24);
    const R = Rr - r;
    const mr = clamp(r * 0.55, 4, 7);

    // ---- glycolysis, a row along the top ----
    const glyActive = f.load > 1e-6;
    const gSize = 10.5 * t;
    say(p, 8, yg + 4 * t, 'Glucose', { size: gSize, weight: 700 });
    const a1 = 8 + 'Glucose'.length * 0.53 * gSize + 5;
    const a1e = sx - sRx - 3;
    arrow(p, a1, yg, a1e, yg, { colour: C.goldText, active: glyActive, phase: m.phase.gly });
    say(p, (a1 + a1e) / 2, yg - 7 * t, 'steps 1–5', { size: 9 * t, anchor: 'middle', fill: C.soft });
    say(p, (a1 + a1e) / 2, yg + 15 * t, '−2 ATP', { size: 9 * t, anchor: 'middle', weight: 600 });
    enzyme(p, sx, yg, sRx, sRy, { warn: stalled });
    say(p, sx, yg + 3.2 * t, 'step 6', { size: 9 * t, weight: 700, anchor: 'middle', fill: ENZ.symbolColor });
    const pw = 'Pyruvate'.length * 0.53 * gSize;
    const a2 = sx + sRx + 3;
    const a2e = xe - pw / 2 - 4;
    arrow(p, a2, yg, a2e, yg, { colour: C.goldText, active: glyActive, phase: m.phase.gly });
    say(p, (a2 + a2e) / 2, yg - 7 * t, 'steps 7–10', { size: 9 * t, anchor: 'middle', fill: C.soft });
    say(p, (a2 + a2e) / 2, yg + 15 * t, '+4 ATP', { size: 9 * t, anchor: 'middle', weight: 600 });
    say(p, xe, yg + 4 * t, 'Pyruvate', { size: gSize, weight: 700, anchor: 'middle' });
    if (stalled) say(p, sx - 12, yg + sRy + 17 * t, 'stopped', { size: 9.5 * t, weight: 700, anchor: 'end', fill: C.coralText });
    lanes(p, cx, ringTop - 3, sx, yg + sRy + 3, { toB: 'empty', active: glyActive, phase: m.phase.gly, mr });

    // ---- the pool, its legend to the west ----
    ring(p, cx, cy, R, r, f);
    const lsz = 9 * t;
    const dr = clamp(r * 0.6, 6.5, 8);
    say(p, 8, ringTop + 14 * t, 'The NAD pool', { size: 10 * t, weight: 700 });
    legendItem(p, 8, ringTop + 32 * t, false, 'empty NAD⁺', lsz, dr);
    legendItem(p, 8, ringTop + 49 * t, true, 'loaded NADH', lsz, dr);

    // ---- the mitochondrion, a capsule along the bottom ----
    const idle = f.chain <= 1e-6;
    p.rect(xc0, yc0, xc1 - xc0, capH, { rx: f2(capH / 2), fill: tint(MITO, 14, 'var(--paper-2)'), stroke: MITO, 'stroke-width': 1.6 });
    const lA = xc0 + capH * 0.45;
    const lB = cx - 26 * t;
    say(p, (lA + lB) / 2, yc0 + capH / 2 + 3.5 * t, 'Mitochondrion', { fit: [10 * t, 7.5], width: lB - lA, anchor: 'middle', weight: 600 });
    const cRow = yc0 + capH * 0.44;
    say(p, cx, cRow, 'Chain', { size: 10.5 * t, weight: 700, anchor: 'middle' });
    say(p, cx, cRow + 12 * t, m.oxygen ? 'O₂ → H₂O' : 'stopped', { size: 9 * t, anchor: 'middle', fill: m.oxygen ? C.soft : C.coralText, weight: m.oxygen ? null : 700 });
    const rA = cx + 30 * t;
    const rB = xc1 - capH * 0.45;
    say(p, (rA + rB) / 2, cRow, `${o.mitoAtp} ATP`, { fit: [10.5 * t, 7.5], width: rB - rA, anchor: 'middle', weight: 700, num: true, fill: idle ? C.soft : C.ink });
    say(p, (rA + rB) / 2, cRow + 12 * t, 'per glucose', { size: 9 * t, anchor: 'middle', fill: C.soft });
    const ox = xc0 + capH * 0.75;
    arrow(p, ox, yc0 - 24 * k, ox, yc0 - 1, { colour: C.water, active: !idle, phase: m.phase.chain });
    say(p, ox - 7, yc0 - 9, m.oxygen ? 'O₂' : 'no O₂', { size: 10 * t, weight: 700, anchor: 'end', fill: m.oxygen ? C.waterText : C.coralText });
    lanes(p, cx, cy + Rr + 3, cx, yc0 - 3, { toB: 'loaded', active: !idle, phase: m.phase.chain, mr });
    say(p, cx + 13, (cy + Rr + yc0) / 2 + 3.5, 'by a shuttle', { size: 9 * t, fill: C.soft });
    const roadX = w - 10 * k;
    road(p, [[xe + pw / 2 + 4, yg], [roadX, yg], [roadX, yc0 + capH / 2], [xc1 + 1, yc0 + capH / 2]], { colour: C.goldText, active: !idle, phase: m.phase.chain });

    // ---- the fermentation route, down the right ----
    const fermActive = f.ferm > 1e-6;
    const labelEnd = w - 18 * k;
    if (m.route === 'none') {
      say(p, labelEnd, cy + 4, 'no fermentation', { size: 9 * t, anchor: 'end', fill: C.soft });
      return;
    }
    const product = m.route === 'lactate' ? 'Lactate' : 'Ethanol';
    if (m.route === 'lactate') {
      arrow(p, xe, yg + 9 * t, xe, cy - ey - 3, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
    } else {
      const y1 = yg + (cy - yg) * 0.42;
      arrow(p, xe, yg + 9 * t, xe, y1 - 8 * t - 3, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
      enzyme(p, xe, y1, 12 * t, 8 * t);
      arrow(p, xe - 12 * t - 3, y1, xe - 12 * t - 26 * k, y1, { colour: C.soft, active: fermActive, phase: m.phase.ferm });
      say(p, xe - 12 * t - 29 * k, y1 + 3.5 * t, 'CO₂', { size: 10 * t, weight: 700, anchor: 'end', fill: C.soft });
      arrow(p, xe, y1 + 8 * t + 3, xe, cy - ey - 3, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
      const ya = (y1 + cy) / 2 + 3;
      const dy = Math.abs(ya - cy);
      const ringEdge = cx + (dy < Rr ? Math.sqrt(Rr * Rr - dy * dy) : 0);
      say(p, xe - 8, ya, 'acetaldehyde', { fit: [9 * t, 7], width: xe - 8 - ringEdge - 6, anchor: 'end', fill: C.soft });
    }
    enzyme(p, xe, cy, ex, ey);
    arrow(p, xe, cy + ey + 3, xe, cy + ey + 20 * k, { colour: C.goldText, active: fermActive, phase: m.phase.ferm });
    say(p, xe, cy + ey + 32 * k, product, { size: gSize, weight: 700, anchor: 'middle' });
    if (m.route === 'lactate') say(p, labelEnd, cy + ey + 45 * k, 'lactate dehydrogenase', { size: 9 * t, anchor: 'end', fill: C.soft });
    say(p, labelEnd, cy + ey + (m.route === 'lactate' ? 57 : 45) * k, m.route === 'lactate' ? 'no ATP from this step' : 'no ATP from these steps', { size: 9 * t, anchor: 'end', fill: C.soft });
    lanes(p, cx + Rr + 3, cy, xe - ex - 3, cy, { toB: 'loaded', active: fermActive, phase: m.phase.ferm, mr });
  }

  // ---------------------------------------------------------------- the readout

  // What the readout gives up when it is short of room, fullest first. Level 1 drops the two rows the
  // drawing already shows (the empty count and glycolysis's rate); level 2 shortens the tissue note.
  const PLANS = [
    { level: 0, extras: ['clear', 'cori'] },
    { level: 1, extras: ['clear', 'cori'] },
    { level: 2, extras: ['clear', 'cori'] },
    { level: 1, extras: ['clear'] },
    { level: 2, extras: ['clear'] },
    { level: 2, extras: [] },
  ];

  function drawReadout(f) {
    const p = paneR;
    p.clear();
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const size = narrow ? 10 : 10.6;
    const noteSize = size - 1.2;
    const TOP = 2;
    const H = hh - TOP - 3;
    const GAP = narrow ? 10 : 16;
    const nEmpty = POOL - loadedCount(m);
    const sit = situation(m, f);
    const cleared = m.fates.here + m.fates.elsewhere + m.fates.liver;
    const shown = {
      clear: m.clearedAt !== null || clearingNow(m, f) || cleared > 0,
      cori: m.route === 'lactate' || m.lactate > 0 || cleared > 0,
    };

    const buildA = (r, level) => {
      r.row('Spent', `${m.demand} ATP/s`);
      r.row('Made', `${f.made.toFixed(1)} ATP/s`, f.keepingUp ? {} : { accent: C.coralText });
      r.row('Per glucose', `${wholeOr(perGlucose(m, f), 1)} ATP`, { strong: true });
      r.note(tissueNote(f.o, level), { size: noteSize });
      r.row('From the fermentation step', `${m.fermStepAtp === 0 ? '0' : m.fermStepAtp.toFixed(2)} ATP`, { strong: true });
      if (level === 0) {
        r.row('Empty NAD⁺', `${nEmpty} of ${POOL}`, nEmpty === 0 ? { accent: C.coralText } : {});
        let gly = `${(f.load / 2).toFixed(2)} glucose/s`;
        if (stalledNow(f)) gly = 'stopped';
        else if (f.want <= EPS) gly = 'waiting';
        r.row('Glycolysis', gly, stalledNow(f) ? { accent: C.coralText } : {});
      }
      if (m.route === 'lactate' || m.lactate > 0) r.row('Extra lactate', `${m.lactate.toFixed(2)} mmol/L`);
      if (m.route === 'ethanol' || m.ethanol > 0) {
        r.row('Ethanol', `${m.ethanol.toFixed(2)} mmol/L`);
        if (level === 0) r.row('Ethanol by volume', `${(m.ethanol * ETHANOL_PERCENT_PER_MM).toFixed(3)}%`);
      }
      r.note(sit.text, sit.warn ? { accent: C.coralText } : {});
      if (m.route === 'ethanol' && level < 2) r.note(ETHANOL_NOTE, { size: noteSize });
    };

    const EXTRAS = {
      clear: {
        title: 'Clearing the lactate',
        columns: null,
        build: (r) => {
          r.row(m.clearedAt !== null ? 'Cleared in' : 'Clearing for', `${(m.clearedAt ?? m.clearingFor).toFixed(1)} s`);
          r.row('Oxidised where it was made', `${m.fates.here.toFixed(2)} mmol/L`);
          r.row('Heart, slow fibres, brain', `${m.fates.elsewhere.toFixed(2)} mmol/L`);
          r.row('To the liver', `${m.fates.liver.toFixed(2)} mmol/L`);
          r.note(CLEAR_NOTE, { size: noteSize });
        },
      },
      cori: {
        title: 'The Cori cycle, per glucose',
        columns: narrow ? null : ['Muscle', 'Liver'],
        build: (r) => {
          if (narrow) {
            r.row('Muscle', '1 glucose → 2 lactate');
            r.row('Muscle gains', '2 ATP');
            r.row('Liver', '2 lactate → 1 glucose');
            r.row('Liver spends', `${LIVER_ATP_PER_GLUCOSE} ATP`, { strong: true });
          } else {
            r.row('Glucose', ['−1', '+1']);
            r.row('Lactate', ['+2', '−2']);
            r.row('ATP', ['+2', `−${LIVER_ATP_PER_GLUCOSE}`], { strong: true });
          }
        },
      },
    };

    const seen = new Set();
    const plans = [];
    for (const plan of PLANS) {
      const extras = plan.extras.filter((key) => shown[key]);
      const id = `${plan.level}:${extras.join(',')}`;
      if (seen.has(id)) continue;
      seen.add(id);
      plans.push({ level: plan.level, extras });
    }
    for (let i = 0; i < plans.length; i += 1) {
      const plan = plans[i];
      const parts = [
        (y) => {
          const r = p.readout({ title: 'ATP and the NAD pool', x: 0, y, width: w, size });
          buildA(r, plan.level);
          return r;
        },
        ...plan.extras.map((key) => (y) => {
          const r = p.readout({ title: EXTRAS[key].title, columns: EXTRAS[key].columns, x: 0, y, width: w, size });
          EXTRAS[key].build(r);
          return r;
        }),
      ];
      const total = (rh) => parts.reduce((s, make) => s + make(0).height(rh), 0) + GAP * (parts.length - 1);
      const least = narrow ? 15 : 16;
      if (i < plans.length - 1 && total(least) > H) continue;
      let lo = least;
      let hi = narrow ? 22 : 26;
      for (let n = 0; n < 30; n += 1) {
        const mid = (lo + hi) / 2;
        if (total(mid) <= H) lo = mid;
        else hi = mid;
      }
      let y = TOP;
      for (const make of parts) y = make(y).draw(lo, TOP + H - y) + GAP;
      return;
    }
  }

  // ---------------------------------------------------------------- the frame

  b.onDraw(() => {
    const f = flows(m);
    cell.clear();
    if (b.narrow) drawNarrow(cell, f);
    else drawWide(cell, f);
    cell.focusMark();
    drawReadout(f);
    // A change the clock made, not the reader, is spoken too: the stall, and the lactate clearing.
    if (!quietDraw && spokenKey !== null && situation(m, f).key !== spokenKey) b.announce();
  });

  return b.handle();
}
