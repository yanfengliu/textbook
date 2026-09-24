// Figure 6.2, `zscheme`: fire the photons yourself.
//
// The electron path of the light reactions drawn against redox potential, and two buttons that each fire
// ONE photon at ONE photosystem. The reader supplies every push, so the two-photosystem argument of §6.4
// is something they do rather than watch: light only photosystem II and the carriers between the two fill
// and jam within four electrons; light only photosystem I and the chain drains after one; light both and
// the electrons run from water to NADP⁺. Fire three at photosystem II and no oxygen appears; the fourth
// releases one molecule and four protons, because the manganese cluster is counting.
//
// THE NUMBERS, §6.4's wherever it gives one:
//   O₂/H₂O +0.82 V, P680 about +1.2, P700 +0.45, ferredoxin −0.42, NADP⁺/NADPH −0.32 (the prose's table).
//   Plastoquinone +0.10 V, the cytochrome complex +0.30 (its Rieske centre, where the electrons from
//   plastoquinol enter it) and plastocyanin +0.37: the measured midpoint potentials, which the prose names
//   without numbers. They only have to sit in the right order down the hill, and they do.
//   An excited reaction centre is drawn one whole photon above its ground state, E* = E − E(photon)/F:
//   P680* at 1.2 − 175.9/96.485 = −0.62 V and P700* at 0.45 − 170.9/96.485 = −1.32 V. Each climb is
//   labelled with that lift, 1.82 V and 1.77 V: the prose's "about 1.8 volts for one electron".
//   A photon of λ nm carries 119 626.6/λ kJ/mol (N_A·h·c), so 680 nm is 175.9, the prose's "176".
//   The climb from water to NADP⁺ is 0.82 − (−0.32) = 1.14 V, and two electrons up it cost
//   2 × 96.485 × 1.14 = 220.0 kJ/mol, which is §5.8's number and must agree with it to the digit.
//   Four photons per two electrons (two at each photosystem) supply 693.6 kJ/mol, so the ledger's best
//   case keeps 31.7% of the light as NADPH; the rest runs downhill, and part of that moves protons.
//
// THE MODEL is discrete and exact, and it is resolved the instant a photon is fired: that is what
// describe() reports. Capacities: plastoquinone takes two electrons (§6.4: "takes two electrons and, with
// them, two protons"); the cytochrome complex, plastocyanin and ferredoxin one each; P680 and P700 hold
// their own electron. A photon at photosystem II is used only if plastoquinone has room, and then P680's
// electron goes to plastoquinone and the hole it leaves is filled from the cluster, whose count advances;
// the fourth releases O₂ and four protons into the lumen. A photon at photosystem I is used only if P700
// holds its electron and ferredoxin is empty. Electrons then run downhill as far as there is room, the
// most downstream vacancy first. Every electron that leaves the cytochrome complex moves two protons into
// the lumen (§6.4: "about two protons for every electron"). On the linear path ferredoxin hands its
// electron to NADP⁺ reductase, which makes one NADPH from every two; on the cyclic path it hands it back
// to the cytochrome complex, ahead of anything plastoquinone is offering, so the loop never deadlocks and
// photosystem I alone keeps an electron going round it.
//
// WHAT RUNS ON THE CLOCK is only the drawing: the photon travelling, the electron lifted and running down
// the carriers, the hole sliding to the cluster, the oxygen leaving. Each of those is scheduled in model
// time when the photon is fired, chained behind whatever the same carrier was still doing, and drawn as a
// pure function of that schedule and the clock. Firing starts the clock; Pause freezes the drawing
// mid-flight. Under reduced motion, and with the clock pinned, every duration is zero and the drawing is
// the settled state, which is what a screenshot at t should show.
//
// THE FLASH TRAIN is Joliot and Kok's experiment: twelve single flashes, one a second, each firing both
// photosystems, at a system reset to the dark. After darkness three clusters in four rest one step along
// (the dark-stable state), so the drawn cluster opens the train at one, not zero, and the first oxygen
// comes on flash 3 — the prose's "a burst comes on the third". The chart is the POPULATION's yield, by
// Kok's model: each flash misses one centre in twenty, so the population drifts out of step and the peaks
// at 3, 7 and 11 blur, exactly as the prose describes, while nothing at all comes on the first two. A
// flash that finds photosystem II closed advances no cluster, so a train run on the cyclic path shows the
// oxygen stopping as the loop fills. The prose does not say why the first burst is on the third flash
// rather than the fourth; the note under the chart does, in one sentence.
//
// TWO COMPOSITIONS. The brief's second composition is built as it asks, below 800 px:
//   wide   — the Z across the left, one potential axis, carrier names placed against the drawing with
//            leader lines where they need them; the three counters, the status and the ledger in a
//            table at the right; the flash train as a chart with its own axes under it.
//   narrow — a Z is a wide shape, so the two climbs are stacked: photosystem II's climb and its downhill
//            run in the upper half, photosystem I's in the lower, both at one scale (the axis is shared,
//            repeated for each half), and the join marked at both ends by the number of the carrier it
//            leads to. Stations are numbered and named in a list beside the lower half. The flash train
//            becomes a strip of twelve marks under the drawing — the brief says eleven, and a strip that
//            stopped on the eleventh could not show that it is a peak. The counters keep their labels,
//            and the table drops its title so the sentence under them always has the room it needs.
//   Type and marks scale with the pane, up to 1.25 wide and 1.35 narrow, so a tablet's stage is not a
//   phone's drawing with more paper round it.
//   Every label is placed by measuring it and trying positions around its mark until one clears every
//   line, mark, label, animation zone and the pane edge; a label that needs to stand off gets a leader.
//   The placement is computed once per pane size, against the widest text each label can ever show
//   ("P700⁺ stalled", "plastoquinone full"), so no state of a run can make one collide.
//
// describe() is documented at the foot of this file.
import { C, el, clamp } from './lib/svg.js';
import { bench, EM_ADVANCE, wrapText } from './lib/bench.js';
import { metabolismPart } from '../palette.js';
import { colourOf } from './lib/cell3-colours.js';

export const meta = { kind: 'zscheme', title: 'Fire the photons yourself', needsWebGL: false, aspect: 16 / 10, narrowAspect: 3 / 4 };

// ---------------------------------------------------------------- the chemistry

const FARADAY = 96.485; // kJ per mole of electrons per volt; §6.4 rounds it to 96.5
const NA_HC = 119626.6; // N_A·h·c in kJ·nm/mol
const KJ_680 = NA_HC / 680; // 175.9
const KJ_700 = NA_HC / 700; // 170.9

const E = Object.freeze({
  water: 0.82,
  p680: 1.2,
  pq: 0.1,
  b6f: 0.3,
  pc: 0.37,
  p700: 0.45,
  fd: -0.42,
  nadp: -0.32,
  p680x: 1.2 - KJ_680 / FARADAY,
  p700x: 0.45 - KJ_700 / FARADAY,
});
const CLIMB_V = Math.round((E.water - E.nadp) * 100) / 100; // 1.14
const CLIMB_KJ = 2 * FARADAY * CLIMB_V; // 219.99
const BEST_KJ = 2 * KJ_680 + 2 * KJ_700; // 693.6

const PQ_CAP = 2;

// Kok's model of the flash train.
// A flash misses one centre in twenty, and none is hit twice: a flash short enough to excite each centre
// once is what the experiment used, and it is what makes the first two flashes give nothing at all, as
// §6.4 says. Measured miss rates run from about 5% to 15%; 5% keeps the peaks at 3, 7 and 11 through a
// twelve-flash train, where a larger one walks the third peak on to flash 12.
const MISS = 0.05;
const DOUBLE = 0;
const DARK_S0 = 0.25; // after darkness a quarter rest at zero and three quarters one step along
const FLASHES = 12;

function kokFlash(pop) {
  const next = [0, 0, 0, 0];
  let o2 = 0;
  for (let s = 0; s < 4; s += 1) {
    const m = pop[s];
    if (!m) continue;
    for (const [k, share] of [[0, MISS], [1, 1 - MISS - DOUBLE], [2, DOUBLE]]) {
      let to = s + k;
      if (to >= 4) {
        o2 += m * share;
        to -= 4;
      }
      next[to] += m * share;
    }
  }
  for (let s = 0; s < 4; s += 1) pop[s] = next[s];
  return o2;
}

// ---------------------------------------------------------------- time

const STEP = 1 / 60;
const T_PHOTON = 0.42;
const T_LIFT = 0.36;
const T_HOP = 0.26;
const T_ARC = 0.52;
const T_HOLE = 0.34;
const T_FX = 1.3;
const T_FULL = 0.5; // the four filled positions stay on the cluster this long before they clear
const FLASH_FIRST = Math.round(0.5 / STEP);
const FLASH_GAP = Math.round(1.0 / STEP);

const ease = (f) => f * f * (3 - 2 * f);
// No-break spaces: SVG collapses a leading space, and a sentence must not break inside "photosystem II",
// "flash 3" or "694 kJ/mol".
const NB = ' ';
const O2_TAIL = `${NB}+ 4${NB}H^{+}`;
const WORD = ['no', 'One', 'Two', 'Three', 'Four'];

// ---------------------------------------------------------------- type set as type
//
// A label here is a small piece of markup, so that NADP⁺, H₂O and cytochrome b₆f are set with real
// super- and subscripts rather than with the Unicode forms, which most faces draw at the wrong size and
// weight: `^{+}` raises, `_{6}` lowers, `~b~` is italic. The shift is a `dy` in pixels rather than
// `baseline-shift`, which Firefox does not implement on SVG text.
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
      if (end < 0) throw new Error(`zscheme: the label "${src}" opens a ${c === '^' ? 'superscript' : 'subscript'} at ${i} and never closes it with "}".`);
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


// ---------------------------------------------------------------- the marks' own CSS

const CSS = `
.tb-zscheme .zs-tick { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-zscheme .zs-cap { fill: var(--ink-faint); }
.tb-zscheme .zs-name { fill: var(--ink); font-weight: 600; }
.tb-zscheme .zs-soft { fill: var(--ink-soft); }
.tb-zscheme .zs-num { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-zscheme .zs-list { fill: var(--ink-soft); }
.tb-zscheme .zs-grid { stroke: var(--rule); stroke-width: 0.6; }
.tb-zscheme .zs-spine { stroke: var(--rule-strong); stroke-width: 1; }
.tb-zscheme .zs-path { stroke: var(--ink-soft); stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.tb-zscheme .zs-path.is-off { stroke: var(--rule-strong); stroke-width: 1.2; stroke-dasharray: 3 3.5; }
.tb-zscheme .zs-climb { stroke: var(--ink-soft); stroke-width: 1.5; stroke-dasharray: 1.5 3.2; stroke-linecap: round; fill: none; }
.tb-zscheme .zs-bar { stroke: var(--ink); stroke-width: 3; }
.tb-zscheme .zs-wave { fill: none; stroke: var(--rule-strong); stroke-width: 1.1; stroke-linecap: round; }
.tb-zscheme .zs-photon { fill: none; stroke: var(--ink-soft); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.tb-zscheme .zs-leader { stroke: var(--rule-strong); stroke-width: 0.8; }
.tb-zscheme .zs-axisval { fill: var(--ink-soft); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-zscheme .zs-bar-chart { fill: var(--coral); }
.tb-zscheme .zs-slot { fill: var(--rule); }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: 800, height: 400 },
    seed: 62,
  });
  const n1 = (v) => b.num(v, 1);
  const RC_FILL = colourOf('chloroplast');
  const NADPH_FILL = metabolismPart('electronCarrierLoaded').color;

  // ---- the model ----
  let path = 'linear';
  let pq = 0;
  let b6f = 0;
  let pc = 0;
  let p700 = 1;
  let fd = 0;
  let fnr = 0; // electrons that have reached NADP⁺ reductase since the reset; every two make one NADPH
  let holes = 0; // oxidising equivalents the cluster has taken since the reset (one to start a dark train)
  let pumped = 0; // electrons that have left the cytochrome complex, two protons each
  let photonsII = 0;
  let photonsI = 0;
  let photonKj = 0;
  let steps = 0;
  let train = null;
  let flashYields = [];
  let flashShownAt = [];
  // ---- the drawing's schedule ----
  let moves = [];
  let photons = [];
  let fx = [];
  let ready = {};

  const now = () => steps * STEP;
  const pinned = () => ctx.pinnedTime !== null && ctx.pinnedTime !== undefined;
  const instant = () => Boolean(ctx.reducedMotion) || pinned();
  const d = (x) => (instant() ? 0 : x);

  const nadph = () => Math.floor(fnr / 2);
  const oxygen = () => Math.floor(holes / 4);
  const protons = () => 4 * oxygen() + 2 * pumped;
  const stored = () => nadph() * CLIMB_KJ;
  const captured = () => (photonKj > 0 ? stored() / photonKj : 0);

  function clearModel({ keepPath }) {
    if (!keepPath) {
      path = 'linear';
      pathCtl?.set('linear', { quiet: true });
    }
    pq = 0;
    b6f = 0;
    pc = 0;
    p700 = 1;
    fd = 0;
    fnr = 0;
    holes = 0;
    pumped = 0;
    photonsII = 0;
    photonsI = 0;
    photonKj = 0;
    train = null;
    flashYields = [];
    flashShownAt = [];
    moves = [];
    photons = [];
    fx = [];
    ready = { p680: [], pq: [], b6f: [], pc: [], p700: [], fd: [] };
  }

  // One electron leaving `from` for `to`, no earlier than `t` and no earlier than it arrived at `from`.
  // The FIFO per carrier is what chains a second photon's motion behind the first's, so the drawing never
  // shows a carrier handing on an electron it has not yet received.
  function hop(from, to, t, dur, kind = 'hop') {
    const queued = ready[from]?.shift();
    const start = Math.max(t, queued ?? -Infinity);
    const move = { from, to, t0: start, t1: start + d(dur), kind };
    moves.push(move);
    ready[to]?.push(move.t1);
    return move;
  }

  // Run the electrons downhill as far as there is room, the most downstream vacancy first.
  function settle(t) {
    for (let guard = 0; guard < 64; guard += 1) {
      if (p700 === 0 && pc > 0) {
        pc -= 1;
        p700 = 1;
        hop('pc', 'p700', t, T_HOP);
      } else if (pc === 0 && b6f > 0) {
        b6f -= 1;
        pc = 1;
        pumped += 1;
        const m = hop('b6f', 'pc', t, T_HOP);
        fx.push({ kind: 'h2', at: m.t0 });
      } else if (path === 'cyclic' && fd > 0 && b6f === 0) {
        fd -= 1;
        b6f = 1;
        hop('fd', 'b6f', t, T_ARC, 'cyclic');
      } else if (pq > 0 && b6f === 0) {
        pq -= 1;
        b6f = 1;
        hop('pq', 'b6f', t, T_HOP);
      } else if (path === 'linear' && fd > 0) {
        fd -= 1;
        fnr += 1;
        const m = hop('fd', 'nadp', t, T_HOP);
        m.slot = fnr % 2 === 1 ? -1 : 1;
        if (fnr % 2 === 0) fx.push({ kind: 'nadph', at: m.t1 });
      } else return;
    }
    throw new Error(`zscheme: the carriers did not settle within 64 transfers (${JSON.stringify({ pq, b6f, pc, p700, fd, path })}); a transfer rule is moving an electron back and forth.`);
  }

  function firePSII() {
    photonsII += 1;
    photonKj += KJ_680;
    const t = now();
    const arrive = t + d(T_PHOTON);
    const open = pq < PQ_CAP;
    photons.push({ ps: 'II', t0: t, t1: arrive, wasted: !open });
    if (!open) return false;
    const lift = hop('p680', 'p680x', arrive, T_LIFT, 'lift');
    moves.push({ from: 'p680x', to: 'pq', t0: lift.t1, t1: lift.t1 + d(T_HOP), kind: 'hop' });
    ready.pq.push(lift.t1 + d(T_HOP));
    pq += 1;
    // The hole P680⁺ is filled from the cluster, which is one step more oxidised for it.
    const refill = { from: 'water', to: 'p680', t0: lift.t0, t1: lift.t0 + d(T_HOLE), kind: 'refill' };
    moves.push(refill);
    ready.p680.push(refill.t1);
    holes += 1;
    if (holes % 4 === 0) fx.push({ kind: 'o2', at: refill.t1 });
    settle(arrive);
    return true;
  }

  function firePSI() {
    photonsI += 1;
    photonKj += KJ_700;
    const t = now();
    const arrive = t + d(T_PHOTON);
    const open = p700 === 1 && fd === 0;
    photons.push({ ps: 'I', t0: t, t1: arrive, wasted: !open });
    if (!open) return false;
    p700 = 0;
    const lift = hop('p700', 'p700x', arrive, T_LIFT, 'lift');
    moves.push({ from: 'p700x', to: 'fd', t0: lift.t1, t1: lift.t1 + d(T_HOP), kind: 'hop' });
    ready.fd.push(lift.t1 + d(T_HOP));
    fd = 1;
    settle(lift.t0);
    return true;
  }

  // Which station the flow has stopped at, from the model: photosystem II can do nothing once
  // plastoquinone is full, and photosystem I nothing once P700 has given its electron and none can come
  // down to refill it (after settling, P700 oxidised means every carrier above it is empty).
  function stall() {
    if (pq >= PQ_CAP) return { at: 'plastoquinone', starved: path === 'linear' ? 'ferredoxin' : null };
    if (p700 === 0) return { at: 'P700', starved: 'plastocyanin' };
    return { at: null, starved: null };
  }

  // ---- panes ----
  const zPane = b.pane('z', {
    as: 'svg',
    focus: true,
    aria: 'The electron path of the light reactions drawn against redox potential, from water through P680, plastoquinone, the cytochrome complex, plastocyanin and P700 to ferredoxin and NADP+. Press 2 to fire a photon at photosystem II, 1 to fire one at photosystem I, F for the flash train, C to switch between linear and cyclic flow, Space to run or pause, and Home to reset.',
  });
  const readPane = b.pane('readout', { as: 'svg' });
  const flashPane = b.pane('flash', { as: 'svg' });
  b.compose({
    wide: {
      columns: 'minmax(0, 62fr) minmax(0, 38fr)',
      rows: 'minmax(0, 57fr) minmax(0, 43fr)',
      at: { z: [1, '1 / span 2'], readout: [2, 1], flash: [2, 2] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 67fr) 2.4rem minmax(0, 33fr)',
      rowGap: 'var(--space-1)',
      at: { z: [1, 1], flash: [1, 2], readout: [1, 3] },
    },
  });

  // A measuring probe for the Z's labels: the placement is only as good as the widths it is given, and
  // the bench's advance estimate is off by a tenth either way on a label as short as "P700".
  const probe = el('svg', { 'aria-hidden': 'true', style: 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none' });
  zPane.el.append(probe);
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
    if (!(w > 0)) {
      w = runsOf(src).reduce((s, r) => s + r.t.length * EM_ADVANCE * size * (r.kind ? 0.7 : 1), 0);
    }
    widths.set(key, w);
    return w;
  }

  // ---- controls: fire, the train, the path, the clock ----
  let handAfterTrain = 0;
  function fire(ps) {
    if (train) train = null; // a hand-fired photon disturbs the experiment, so the train stops there
    handAfterTrain += 1;
    if (ps === 'II') firePSII();
    else firePSI();
    if (!b.playing) runCtl.set(true);
    afterAction();
  }
  b.action('Fire at photosystem II', () => fire('II'), {
    short: 'Fire at II',
    primary: true,
    aria: 'Fire at photosystem II, one photon of 680 nm light',
  });
  b.action('Fire at photosystem I', () => fire('I'), {
    short: 'Fire at I',
    primary: true,
    aria: 'Fire at photosystem I, one photon of 700 nm light',
  });
  b.divide();
  b.action('Flash train', () => startTrain(), { aria: 'Flash train, twelve single flashes at a system reset to the dark' });
  b.divide();
  const pathCtl = b.choice('Path', [
    { id: 'linear', label: 'Linear flow', short: 'Linear', aria: 'Linear flow, ferredoxin hands its electron on to NADP+' },
    { id: 'cyclic', label: 'Cyclic flow', short: 'Cyclic', aria: 'Cyclic flow, ferredoxin sends its electron back to the cytochrome complex' },
  ], (id) => {
    path = id;
    settle(now());
    afterAction();
  }, { segmented: true });
  b.divide();
  const runCtl = b.run({ primary: false, aria: 'Run, let the electrons move', onChange: () => draw() });
  b.action('Reset', () => resetAll(), { aria: 'Reset, back to the dark with nothing fired' });

  b.keys({
    2: () => fire('II'),
    1: () => fire('I'),
    f: () => startTrain(),
    F: () => startTrain(),
    c: () => pathCtl.set(path === 'linear' ? 'cyclic' : 'linear'),
    C: () => pathCtl.set(path === 'linear' ? 'cyclic' : 'linear'),
    ' ': () => runCtl.toggle(),
    Enter: () => runCtl.toggle(),
    Home: () => resetAll(),
  });

  function startTrain() {
    clearModel({ keepPath: true });
    holes = 1; // dark-adapted: three clusters in four rest one step along
    handAfterTrain = 0;
    train = { n: 0, due: steps + FLASH_FIRST, pop: [DARK_S0, 1 - DARK_S0, 0, 0] };
    if (!b.playing) runCtl.set(true);
    afterAction();
  }

  function resetAll() {
    runCtl.set(false);
    b.restart(); // which calls the clock's restart, below
    b.announce();
  }

  function afterAction() {
    draw();
    b.announce();
  }

  // ---- the clock: the flash train, and tidying the schedule ----
  b.clock({
    step: STEP,
    restart: () => {
      steps = 0;
      clearModel({ keepPath: false });
    },
    advance: () => {
      steps += 1;
      if (train && steps >= train.due) {
        const open = pq < PQ_CAP;
        firePSII();
        firePSI();
        const y = open ? kokFlash(train.pop) : 0;
        flashYields.push(Number(y.toFixed(3)));
        flashShownAt.push(now() + d(T_PHOTON + T_HOLE));
        train.n += 1;
        if (train.n >= FLASHES) {
          train = null;
          b.announce();
        } else train.due += FLASH_GAP;
      }
      const t = now();
      if (moves.length && moves.some((m) => m.t1 < t)) moves = moves.filter((m) => m.t1 >= t);
      if (photons.length && photons.some((p) => p.t1 + 0.6 < t)) photons = photons.filter((p) => p.t1 + 0.6 >= t);
      if (fx.length && fx.some((f) => f.at + T_FX < t)) fx = fx.filter((f) => f.at + T_FX >= t);
    },
  });
  clearModel({ keepPath: true });

  // ---- what describe() reports ----
  function state() {
    const s = stall();
    return {
      path,
      photonsAtPsii: photonsII,
      photonsAtPsi: photonsI,
      clusterCount: holes % 4,
      oxygenReleased: oxygen(),
      nadphMade: nadph(),
      protonsToLumen: protons(),
      carrierFill: { plastoquinone: pq / PQ_CAP, cytochromeB6f: b6f, plastocyanin: pc, ferredoxin: fd },
      stalledAt: s.at,
      starvedAt: s.starved,
      flashTrain: Boolean(train),
      flashOxygen: [...flashYields],
      climbVolts: CLIMB_V,
      climbKjPerTwoElectrons: Math.round(CLIMB_KJ),
      photonKjSupplied: Number(photonKj.toFixed(1)),
      capturedFraction: Number(captured().toFixed(3)),
      t: Number(now().toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // What the readout shows at time t: the counters as the DRAWING has them, so that the oxygen is counted
  // when it is seen to leave and the stall is named when the last electron is seen to arrive. describe()
  // and the live region report the model, which is ahead of the drawing by the length of the motion.
  function viewAt(t) {
    const busy = moves.some((m) => m.t1 > t) || photons.some((p) => !p.wasted && p.t1 > t);
    const h = holes - pendingTo('p680', t);
    const o2 = Math.floor(h / 4);
    const through = pumped - moves.filter((m) => m.from === 'b6f' && m.t0 > t).length;
    const made = Math.floor((fnr - pendingTo('nadp', t)) / 2);
    return { holes: h, oxygen: o2, protons: 4 * o2 + 2 * through, nadph: made, stall: busy ? { at: null, starved: null } : stall() };
  }

  // The sentence under the counters, read in every state its parts can take: dark, counting towards an
  // oxygen, stalled at either end, cyclic, the train running and the train done.
  function status(v) {
    const s = v.stall;
    if (train) return `Flash${NB}${train.n} of ${FLASHES}. The oxygen is plotted flash by flash.`;
    if (flashYields.length === FLASHES && handAfterTrain === 0) return trainDone();
    if (s.at === 'plastoquinone') {
      return path === 'cyclic'
        ? `Photosystem${NB}II has stalled: plastoquinone is full, and on the cyclic path no electron leaves the loop to make room.`
        : `Stalled at plastoquinone: it is full, and P700 has no hole to take its electrons. Ferredoxin is starved. Fire at photosystem${NB}I.`;
    }
    if (s.at === 'P700') return `Stalled at P700: it has given its electron away, and plastocyanin is empty. Fire at photosystem${NB}II.`;
    if (photonsII + photonsI === 0 && !flashYields.length) return 'Dark: nothing fired yet. Fire a photon at either photosystem.';
    if (path === 'cyclic') return 'Cyclic flow: each electron comes back round to the cytochrome complex, so protons move and no NADPH or oxygen is made.';
    const need = 4 - (((v.holes % 4) + 4) % 4);
    return `${WORD[need]} more ${need === 1 ? 'photon' : 'photons'} at photosystem${NB}II for the next oxygen.`;
  }

  b.onAnnounce((dsc) => {
    const where = dsc.stalledAt ? ` Stalled at ${dsc.stalledAt}.` : '';
    const trainNote = !dsc.flashTrain && dsc.flashOxygen.length === FLASHES
      ? ` Flash train done: oxygen peaked on flashes ${peaksOf(dsc.flashOxygen).join(', ')}.`
      : '';
    return `${dsc.path === 'cyclic' ? 'Cyclic' : 'Linear'} flow. The manganese cluster holds ${dsc.clusterCount} of 4. Oxygen released ${dsc.oxygenReleased}, NADPH made ${dsc.nadphMade}, protons into the lumen ${dsc.protonsToLumen}.${where}${trainNote}`;
  });

  // After a train, what it showed. On the cyclic path photosystem II fills the loop within four flashes
  // and closes, so the oxygen stops; on the linear path it peaks every fourth flash from the third.
  function trainDone() {
    const last = flashYields.reduce((k, y, i) => (y > 0 ? i + 1 : k), 0);
    if (flashYields.slice(last).length && flashYields[FLASHES - 1] === 0) {
      return last
        ? `Train done: photosystem${NB}II filled the loop and closed, so the oxygen stopped after flash${NB}${last}.`
        : `Train done: photosystem${NB}II was closed, so no oxygen came at all.`;
    }
    const p = peaksOf(flashYields);
    const list = p.length > 1 ? `flashes${NB}${p.slice(0, -1).join(', ')} and${NB}${p[p.length - 1]}` : `flash${NB}${p[0]}`;
    return `Train done: the oxygen peaked on ${list}, blurring as the clusters drift out of step.`;
  }

  function peaksOf(ys) {
    const out = [];
    for (let i = 0; i < ys.length; i += 1) {
      const l = i > 0 ? ys[i - 1] : -1;
      const r = i < ys.length - 1 ? ys[i + 1] : -1;
      if (ys[i] > l && ys[i] > r && ys[i] > 0.05) out.push(i + 1);
    }
    return out;
  }

  // ---------------------------------------------------------------- the drawing's clock-side state

  const MODEL = { p680: () => 1, pq: () => pq, b6f: () => b6f, pc: () => pc, p700: () => p700, fd: () => fd };
  // How many electrons a carrier is DRAWN holding at time t: the model, less those still on their way to
  // it, plus those that have not yet left it.
  function shown(station, t) {
    let n = MODEL[station]();
    for (const m of moves) {
      if (m.to === station && m.t1 > t) n -= 1;
      if (m.from === station && m.t0 > t) n += 1;
    }
    return n;
  }
  const pendingTo = (station, t) => moves.filter((m) => m.to === station && m.t1 > t).length;
  function clusterShown(t) {
    const arrived = holes - pendingTo('p680', t);
    const full = fx.some((f) => f.kind === 'o2' && t >= f.at && t < f.at + d(T_FULL));
    return full ? 4 : ((arrived % 4) + 4) % 4;
  }

  // ---------------------------------------------------------------- geometry
  //
  // Everything the Z draws is decided here, once per pane size and composition, and both the drawing and
  // the label placement read it, so a label is placed against exactly the lines that are drawn.
  // The marks' sizes, scaled with the pane: a tablet's stage is twice a phone's, and type and marks set
  // for 342 px would sit small and far apart in it. The scale stops at 1.25 wide and 1.35 narrow.
  let BAR = 24;
  let RC = 5.4;
  let DOT = 3.3;
  let POS_R = 4.4;
  let POS_GAP = 2.8;
  function applyScale(k) {
    BAR = 24 * k;
    RC = 5.4 * k;
    DOT = 3.3 * k;
    POS_R = 4.4 * k;
    POS_GAP = 2.8 * k;
  }

  let geo = null;
  function geometry(w, h) {
    const key = `${b.narrow ? 'n' : 'w'}|${w}|${h}|${fontsKey()}`;
    if (geo?.key === key) {
      applyScale(geo.k);
      return geo;
    }
    const k = b.narrow ? clamp(Math.min(w / 330, h / 200), 1, 1.35) : clamp(Math.min(w / 560, h / 500), 1, 1.25);
    applyScale(k);
    const g = b.narrow ? narrowFrame(w, h, k) : wideFrame(w, h, k);
    g.k = k;
    g.key = key;
    finishFrame(g);
    placeLabels(g);
    geo = g;
    return g;
  }

  function wideFrame(w, h, k) {
    const tick = 9.6 * k;
    const ax = Math.ceil(Math.max(textWidth('−1.5', tick), textWidth('+1.5', tick))) + 7;
    const top = Math.round(22 + 12 * k);
    const bottom = h - 16;
    const left = ax + 16;
    const right = w - 12;
    const pw = Math.max(120, right - left);
    const yOf = (v) => top + ((v + 1.5) / 3) * (bottom - top);
    const X = (f) => left + f * pw;
    const P = (f, v) => ({ x: X(f), y: yOf(v) });
    return {
      narrow: false, w, h, left, right, pw, X, size: 10.8 * k, small: 9.8 * k,
      st: {
        water: P(0.1, E.water), p680: P(0.2, E.p680), p680x: P(0.2, E.p680x),
        pq: P(0.35, E.pq), b6f: P(0.465, E.b6f), pc: P(0.57, E.pc),
        p700: P(0.665, E.p700), p700x: P(0.665, E.p700x), fd: P(0.81, E.fd), nadp: P(0.945, E.nadp),
      },
      axes: [{ x: ax, top, bottom, yOf, ticks: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], tick }],
      caption: { x: 0, y: Math.round(12 * k), src: 'Redox potential, V · higher up, an electron is held more loosely', size: 9.6 * k },
      bracket: { x: left - 8, y0: yOf(E.water), y1: yOf(E.nadp) },
      waves: [
        { ps: 'II', tail: P(0.2 + 0.085, 1.47), label: `680 nm · ${Math.round(KJ_680)} kJ/mol` },
        { ps: 'I', tail: P(0.665 + 0.085, 1.02), label: `700 nm · ${Math.round(KJ_700)} kJ/mol` },
      ],
      legend: true,
    };
  }

  // Stacked: photosystem II's climb and its run down to plastocyanin in the upper half, photosystem I's
  // climb, ferredoxin and NADP⁺ in the lower, both halves at one scale.
  function narrowFrame(w, h, k) {
    const tick = 9.2 * k;
    const ax = Math.ceil(Math.max(textWidth('−1.5', tick), textWidth('+1.0', tick))) + 6;
    const top = Math.round(6 + 11 * k);
    const gap = 14;
    const bottom = h - 6;
    const half = Math.max(44, (bottom - top - gap) / 2);
    const left = ax + 12;
    const right = w - 6;
    const pw = Math.max(120, right - left);
    const X = (f) => left + f * pw;
    // Each half spans only what its own climb needs, at one scale for both: 2.05 V apiece.
    const UP = [-0.77, 1.28];
    const DN = [-1.45, 0.6];
    const lower = top + half + gap;
    const yU = (v) => top + ((v - UP[0]) / (UP[1] - UP[0])) * half;
    const yL = (v) => lower + ((v - DN[0]) / (DN[1] - DN[0])) * half;
    return {
      narrow: true, w, h, left, right, pw, X, size: 10 * k, small: 9 * k,
      st: {
        water: { x: X(0.1), y: yU(E.water) }, p680: { x: X(0.22), y: yU(E.p680) }, p680x: { x: X(0.22), y: yU(E.p680x) },
        pq: { x: X(0.45), y: yU(E.pq) }, b6f: { x: X(0.63), y: yU(E.b6f) }, pc: { x: X(0.8), y: yU(E.pc) },
        p700: { x: X(0.14), y: yL(E.p700) }, p700x: { x: X(0.14), y: yL(E.p700x) },
        fd: { x: X(0.31), y: yL(E.fd) }, nadp: { x: X(0.47), y: yL(E.nadp) },
      },
      axes: [
        { x: ax, top, bottom: top + half, yOf: yU, ticks: [-0.5, 0, 0.5, 1], tick },
        { x: ax, top: lower, bottom: lower + half, yOf: yL, ticks: [-1, -0.5, 0, 0.5], tick },
      ],
      caption: { x: 0, y: Math.round(11 * k), src: 'Redox potential, V', size: 9.2 * k },
      waves: [
        { ps: 'II', tail: { x: X(0.22 + 0.1), y: yU(1.27) }, label: '680 nm' },
        { ps: 'I', tail: { x: X(0.14 + 0.1), y: yL(0.59) }, label: '700 nm' },
      ],
      exit: { y: yU(E.pc), x1: X(0.93) },
      entry: { y: yL(E.p700), x0: X(0.035) },
      // The list starts as high as the upper half leaves room for — below the cytochrome complex and the
      // two protons that drop from it — so that eight lines are never set tighter than their type.
      list: { x: X(0.63), top: Math.max(yU(0.62), yU(E.b6f) + 18 * k + 9), bottom: lower + half + 4 },
      yU,
      yL,
    };
  }

  // A carrier is a shelf at its potential and its electrons sit on it, rather than on the line itself,
  // where a dot's paper halo would cut the bar in two.
  const SHELF = new Set(['pq', 'b6f', 'pc', 'fd', 'nadp']);
  const NADP_SLOT = DOT + 1.3;
  const shelf = (st, dx = 0) => ({ x: st.x + dx, y: st.y - 1.5 - DOT - 0.9 });
  const barL = (s) => ({ x: s.x - BAR / 2, y: s.y });
  const barR = (s) => ({ x: s.x + BAR / 2, y: s.y });
  const toward = (a, b2, r) => {
    const dx = b2.x - a.x;
    const dy = b2.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: a.x + (dx / len) * r, y: a.y + (dy / len) * r };
  };
  const cubic = (p0, p1, p2, p3, n = 18) => {
    const out = [];
    for (let i = 0; i <= n; i += 1) {
      const t = i / n;
      const u = 1 - t;
      out.push({
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      });
    }
    return out;
  };

  function finishFrame(g) {
    const s = g.st;
    const rowW = 4 * 2 * POS_R + 3 * POS_GAP;
    g.cluster = { x: s.water.x, y: s.water.y, x0: s.water.x - rowW / 2, x1: s.water.x + rowW / 2 };
    const clusterR = { x: g.cluster.x1 + 1, y: s.water.y };
    // The lines of the path, each with where it comes from and goes to, so a token's route is the line.
    g.lines = [
      { id: 'water-p680', pts: [clusterR, toward(s.p680, clusterR, RC + 1.5)] },
      { id: 'climb2', climb: true, pts: [{ x: s.p680.x, y: s.p680.y - RC - 1 }, { x: s.p680x.x, y: s.p680x.y + RC + 1 }] },
      { id: 'p680x-pq', pts: [toward(s.p680x, barL(s.pq), RC + 1.5), barL(s.pq)] },
      { id: 'pq-b6f', pts: [barR(s.pq), barL(s.b6f)] },
      { id: 'b6f-pc', pts: [barR(s.b6f), barL(s.pc)] },
      { id: 'climb1', climb: true, pts: [{ x: s.p700.x, y: s.p700.y - RC - 1 }, { x: s.p700x.x, y: s.p700x.y + RC + 1 }] },
      { id: 'p700x-fd', pts: [toward(s.p700x, barL(s.fd), RC + 1.5), barL(s.fd)] },
      { id: 'fd-nadp', only: 'linear', pts: [barR(s.fd), barL(s.nadp)] },
    ];
    if (!g.narrow) {
      g.lines.push({ id: 'pc-p700', pts: [barR(s.pc), toward(s.p700, barR(s.pc), RC + 1.5)] });
      // The cyclic return: from ferredoxin down and back to the cytochrome complex, arriving from above.
      const start = { x: s.fd.x - 4, y: s.fd.y + 3 };
      const end = { x: barR(s.b6f).x + 1, y: s.b6f.y - 2.5 };
      g.lines.push({
        id: 'cyclic',
        only: 'cyclic',
        arrowEnd: true,
        pts: cubic(start, { x: start.x - g.pw * 0.03, y: start.y + (s.b6f.y - s.fd.y) * 0.95 }, { x: end.x + g.pw * 0.2, y: end.y - (s.b6f.y - s.fd.y) * 0.45 }, end),
      });
    } else {
      // The join, marked at both ends by the number of the station it leads to.
      g.lines.push({ id: 'pc-exit', arrowEnd: true, pts: [barR(s.pc), { x: g.exit.x1, y: g.exit.y }] });
      g.lines.push({ id: 'entry-p700', arrowEnd: true, pts: [{ x: g.entry.x0, y: g.entry.y }, toward(s.p700, { x: g.entry.x0, y: g.entry.y }, RC + 1.5)] });
      // The cyclic return, likewise: a stub leaving ferredoxin for station 4, and one arriving at 4 from 7.
      const fdOut = { x: s.fd.x - 3, y: s.fd.y + 3 };
      const fdTip = { x: s.fd.x - g.pw * 0.07, y: s.fd.y + 20 };
      g.lines.push({ id: 'cyc-out', only: 'cyclic', arrowEnd: true, pts: cubic(fdOut, { x: fdOut.x, y: fdOut.y + 12 }, { x: fdTip.x + 8, y: fdTip.y }, fdTip, 8) });
      const inTail = { x: s.b6f.x + g.pw * 0.06, y: s.b6f.y - 21 };
      const inEnd = { x: barR(s.b6f).x - 2, y: s.b6f.y - 3 };
      g.lines.push({ id: 'cyc-in', only: 'cyclic', arrowEnd: true, pts: cubic(inTail, { x: inTail.x, y: inTail.y + 9 }, { x: inEnd.x + 6, y: inEnd.y - 6 }, inEnd, 8) });
      g.cycOut = fdTip;
      g.cycIn = inTail;
    }
    // Photon sources: a wave from its tail to the reaction centre's lower right.
    for (const wv of g.waves) {
      const rc = wv.ps === 'II' ? s.p680 : s.p700;
      wv.head = toward(rc, wv.tail, RC + 2.5);
    }
    // Where the transient marks move, kept clear of every label.
    const clusterTop = s.water.y - POS_R;
    // Oxygen and its four protons leave the cluster together, as one line rising from it.
    const fxSize = (g.narrow ? 9.6 : 10.6) * g.k;
    g.o2Parts = [textWidth('O_{2}', fxSize, 700), textWidth(O2_TAIL, fxSize - 0.6, 600)];
    const o2Half = (g.o2Parts[0] + g.o2Parts[1]) / 2 + 3;
    const h2Half = textWidth(`2${NB}H^{+}`, fxSize - 0.8, 600) / 2 + 2;
    const fxRise = g.narrow ? 18 : 26;
    g.zones = {
      o2: { x0: g.cluster.x - o2Half, x1: g.cluster.x + o2Half, y0: clusterTop - fxRise - 12, y1: clusterTop - 3 },
      h2: { x0: s.b6f.x + 4 - h2Half - 9, x1: s.b6f.x + 4 + h2Half + 9, y0: s.b6f.y + 4, y1: s.b6f.y + fxRise },
      nadph: { x0: s.nadp.x - 10, x1: s.nadp.x + (g.narrow ? 36 : 40), y0: s.nadp.y - fxRise - 10, y1: s.nadp.y - 4 },
    };
    // Keep every zone inside the pane.
    for (const z of Object.values(g.zones)) {
      z.x0 = clamp(z.x0, 1, g.w - 1);
      z.x1 = clamp(z.x1, 1, g.w - 1);
      z.y0 = clamp(z.y0, 1, g.h - 1);
      z.y1 = clamp(z.y1, 1, g.h - 1);
    }
  }

  // A token's route from one station to the next: the line it travels, and in the narrow composition the
  // two places where it leaves one half and enters the other.
  function route(g, from, to, slot = null) {
    const s = g.st;
    const line = (id) => g.lines.find((l) => l.id === id).pts;
    const centre = (k) => (SHELF.has(k) ? shelf(s[k]) : { x: s[k].x, y: s[k].y });
    switch (`${from}>${to}`) {
      case 'water>p680': return [[{ x: g.cluster.x1, y: s.water.y }, ...line('water-p680').slice(1), centre('p680')]];
      case 'p680>p680x': return [[centre('p680'), centre('p680x')]];
      case 'p680x>pq': return [[centre('p680x'), ...line('p680x-pq'), centre('pq')]];
      case 'pq>b6f': return [[centre('pq'), ...line('pq-b6f'), centre('b6f')]];
      case 'b6f>pc': return [[centre('b6f'), ...line('b6f-pc'), centre('pc')]];
      case 'pc>p700': return g.narrow
        ? [[centre('pc'), ...line('pc-exit')], [...line('entry-p700'), centre('p700')]]
        : [[centre('pc'), ...line('pc-p700'), centre('p700')]];
      case 'p700>p700x': return [[centre('p700'), centre('p700x')]];
      case 'p700x>fd': return [[centre('p700x'), ...line('p700x-fd'), centre('fd')]];
      case 'fd>nadp': return [[centre('fd'), ...line('fd-nadp'), shelf(s.nadp, (slot ?? 0) * NADP_SLOT)]];
      case 'fd>b6f': return g.narrow
        ? [[centre('fd'), ...line('cyc-out')], [...line('cyc-in'), centre('b6f')]]
        : [[centre('fd'), ...line('cyclic'), centre('b6f')]];
      default: throw new Error(`zscheme: no route from ${from} to ${to}.`);
    }
  }

  // The point a fraction f of the way along a route, measured along its visible length; a route in two
  // pieces jumps the gap between them.
  function along(pieces, f) {
    const segs = [];
    let total = 0;
    for (const pts of pieces) {
      for (let i = 1; i < pts.length; i += 1) {
        const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        segs.push({ a: pts[i - 1], b: pts[i], len });
        total += len;
      }
    }
    let want = clamp(f, 0, 1) * total;
    for (const sg of segs) {
      if (want <= sg.len || sg === segs[segs.length - 1]) {
        const u = sg.len ? clamp(want / sg.len, 0, 1) : 1;
        return { x: sg.a.x + (sg.b.x - sg.a.x) * u, y: sg.a.y + (sg.b.y - sg.a.y) * u };
      }
      want -= sg.len;
    }
    return pieces[0][0];
  }

  function wavePoints(tail, head, amp, waves = 3.2, n = 40) {
    const dx = head.x - tail.x;
    const dy = head.y - tail.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const pts = [];
    for (let i = 0; i <= n; i += 1) {
      const u = i / n;
      // The wave dies away over the last sixth, so the arrowhead sits on a straight run.
      const a = amp * Math.sin(u * waves * Math.PI * 2) * (u > 0.84 ? Math.max(0, (1 - u) / 0.16) : 1);
      pts.push({ x: tail.x + dx * u + nx * a, y: tail.y + dy * u + ny * a });
    }
    return pts;
  }
  const dOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${b.num(p.x, 1)} ${b.num(p.y, 1)}`).join(' ');

  // ---------------------------------------------------------------- label placement
  //
  // Every label is measured and then tried at a ring of positions around its mark, near ones first and
  // then two rings further out with a leader line back; the first position whose box clears every line,
  // mark, zone and label already placed, and stays inside the pane, is taken. The box is the WIDEST the
  // label can ever be — its tag included — so nothing a run does can make it collide later.
  const TAGS = { full: 'full', stalled: 'stalled', starved: 'starved' };

  function segHitsBox(a, b2, r, pad) {
    const x0 = r.x0 - pad;
    const y0 = r.y0 - pad;
    const x1 = r.x1 + pad;
    const y1 = r.y1 + pad;
    let t0 = 0;
    let t1 = 1;
    const dx = b2.x - a.x;
    const dy = b2.y - a.y;
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

  function obstaclesOf(g) {
    const rects = [];
    const segs = [];
    const polyline = (pts, pad = 2.2) => {
      for (let i = 1; i < pts.length; i += 1) segs.push({ a: pts[i - 1], b: pts[i], pad });
    };
    for (const l of g.lines) polyline(l.pts, l.climb ? 2.6 : 2.2);
    for (const wv of g.waves) polyline(wavePoints(wv.tail, wv.head, g.narrow ? 2.6 : 3.2), 4.6);
    for (const k of ['pq', 'b6f', 'pc', 'fd', 'nadp']) {
      const s = g.st[k];
      rects.push({ x0: s.x - BAR / 2 - 2, y0: s.y - 2 * DOT - 4.5, x1: s.x + BAR / 2 + 2, y1: s.y + 3 });
    }
    for (const k of ['p680', 'p680x', 'p700', 'p700x']) {
      const s = g.st[k];
      rects.push({ x0: s.x - RC - 2, y0: s.y - RC - 2, x1: s.x + RC + 2, y1: s.y + RC + 2 });
    }
    rects.push({ x0: g.cluster.x0 - 2, y0: g.st.water.y - POS_R - 2, x1: g.cluster.x1 + 2, y1: g.st.water.y + POS_R + 2 });
    for (const z of Object.values(g.zones)) rects.push(z);
    for (const a of g.axes) {
      rects.push({ x0: 0, y0: a.top - 7, x1: a.x + 1, y1: a.bottom + 5 });
      for (const v of a.ticks) segs.push({ a: { x: a.x, y: a.yOf(v) }, b: { x: g.right, y: a.yOf(v) }, pad: -0.5, grid: true });
    }
    const capW = textWidth(g.caption.src, g.caption.size);
    rects.push({ x0: g.caption.x, y0: g.caption.y - g.caption.size, x1: g.caption.x + capW + 2, y1: g.caption.y + 3 });
    if (g.bracket) segs.push({ a: { x: g.bracket.x, y: g.bracket.y0 }, b: { x: g.bracket.x, y: g.bracket.y1 }, pad: 3 });
    if (g.legend) {
      g.legendBox = legendBox(g);
      rects.push(g.legendBox);
    }
    if (g.list) rects.push({ x0: g.list.x - 4, y0: g.list.top - 2, x1: g.w, y1: g.list.bottom + 2 });
    if (g.narrow) {
      // The numbers that mark the join's two ends and the cyclic stubs.
      const nw = textWidth('8', g.size, 700) + 3;
      const numBox = (x, y, anchor) => ({ x0: anchor === 'end' ? x - nw - 1 : x - 1, y0: y - g.size, x1: anchor === 'end' ? x + 1 : x + nw + 1, y1: y + 3 });
      rects.push(numBox(g.exit.x1 + 3, g.exit.y + g.size * 0.36, 'start'));
      rects.push(numBox(g.entry.x0 - 3, g.entry.y + g.size * 0.36, 'end'));
      rects.push(numBox(g.cycOut.x - 3, g.cycOut.y + g.size * 0.36, 'end'));
      rects.push(numBox(g.cycIn.x + 3, g.cycIn.y + g.size * 0.2, 'start'));
    }
    // Gridlines are hairlines a label may sit across; only the lines of the path and the marks count.
    return { rects, segs: segs.filter((sg) => !sg.grid) };
  }

  function legendBox(g) {
    const size = 9.4 * g.k;
    const w = 12 + textWidth('electron', size) + 16 + 12 + textWidth('hole', size);
    const y = g.axes[0].bottom - 2;
    return { x0: g.right - w - 2, y0: y - size - 2, x1: g.right + 1, y1: y + 4, size, y, w };
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
    const bounds = { x0: 1, y0: 1, x1: g.w - 1, y1: g.h - 1 };
    const s = g.st;
    const size = g.size;
    // What each label is, where its mark is, and the widest it will ever be.
    const items = [];
    const add = (key, src, mark, hw, hh, { cls = 'zs-name', sz = size, weight = 600, widest = src, prefer = null, cands = null, optional = false } = {}) => {
      items.push({ key, src, mark, hw, hh, cls, size: sz, weight, widest, prefer, cands, optional });
    };
    // A carrier's mark is its bar and the shelf of electrons over it, as one block.
    const shelfMark = (st) => ({ x: st.x, y: st.y - (DOT + 1.5) });
    const SH = DOT + 3;
    if (!g.narrow) {
      add('bracket', `${b.num(CLIMB_V, 2)} V`, { x: g.bracket.x, y: (g.bracket.y0 + g.bracket.y1) / 2 }, 2, 6, { cls: 'zs-axisval', sz: 9.8 * g.k, prefer: 'right' });
      // What the bracket spans, set under its figure, so that nothing has to be drawn across the plot.
      add('bracketSub', 'water to NADP^{+}', { x: g.bracket.x, y: (g.bracket.y0 + g.bracket.y1) / 2 }, 2, 6, {
        cls: 'zs-cap', sz: 9.4 * g.k, weight: 400, optional: true,
        cands: (placed) => (placed.bracket ? [{ x: placed.bracket.box.x0 + 1.5, y: placed.bracket.box.y1 + 10.5 * g.k, anchor: 'start', far: 0 }] : []),
      });
      add('water', 'H_{2}O', s.water, (g.cluster.x1 - g.cluster.x0) / 2, POS_R, { prefer: 'left' });
      add('cluster', 'Mn_{4}Ca', s.water, (g.cluster.x1 - g.cluster.x0) / 2, POS_R, { cls: 'zs-soft', weight: 500, sz: 9.8 * g.k, prefer: 'down' });
      add('p680', 'P680', s.p680, RC, RC);
      // Each climb is one photon's worth: E(photon) / F volts, the prose's "about 1.8 volts".
      add('liftII', `${b.num(KJ_680 / FARADAY, 2)} V`, { x: s.p680.x, y: (s.p680.y + s.p680x.y) / 2 }, 1.5, 16, { cls: 'zs-axisval', sz: 9.8 * g.k, prefer: 'right' });
      add('liftI', `${b.num(KJ_700 / FARADAY, 2)} V`, { x: s.p700.x, y: (s.p700.y + s.p700x.y) / 2 }, 1.5, 16, { cls: 'zs-axisval', sz: 9.8 * g.k, prefer: 'right' });
      add('p680x', 'P680*', s.p680x, RC, RC, { cls: 'zs-soft', weight: 500 });
      add('p700', 'P700', s.p700, RC, RC, { widest: `P700^{+} ${TAGS.stalled}` });
      add('p700x', 'P700*', s.p700x, RC, RC, { cls: 'zs-soft', weight: 500 });
      add('b6f', 'cytochrome ~b~_{6}~f~', shelfMark(s.b6f), BAR / 2, SH);
      add('pc', 'plastocyanin', shelfMark(s.pc), BAR / 2, SH, { widest: `plastocyanin ${TAGS.starved}` });
      add('pq', 'plastoquinone', shelfMark(s.pq), BAR / 2, SH, { widest: `plastoquinone ${TAGS.full}` });
      add('fd', 'ferredoxin', shelfMark(s.fd), BAR / 2, SH, { widest: `ferredoxin ${TAGS.starved}` });
      add('nadp', 'NADP^{+}', shelfMark(s.nadp), BAR / 2, SH);
      for (const wv of g.waves) add(`wave-${wv.ps}`, wv.label, wv.tail, 3, 3, { cls: 'zs-soft', weight: 500, sz: g.small, prefer: 'down', optional: true });
    } else {
      const num = { cls: 'zs-num', weight: 700, sz: size };
      add('n1', '1', s.water, (g.cluster.x1 - g.cluster.x0) / 2, POS_R, num);
      add('n2', '2', s.p680, RC, RC, num);
      add('n6', '6', s.p700, RC, RC, num);
      add('n4', '4', shelfMark(s.b6f), BAR / 2, SH, num);
      add('n5', '5', shelfMark(s.pc), BAR / 2, SH, num);
      add('n3', '3', shelfMark(s.pq), BAR / 2, SH, num);
      add('n7', '7', shelfMark(s.fd), BAR / 2, SH, num);
      add('n8', '8', shelfMark(s.nadp), BAR / 2, SH, num);
      for (const wv of g.waves) add(`wave-${wv.ps}`, wv.label, wv.tail, 3, 3, { cls: 'zs-soft', weight: 500, sz: g.small, prefer: 'down', optional: true });
    }
    const out = {};
    for (const it of items) {
      // Tried at its own size first, then a tenth and a fifth smaller, before anything is given up: at a
      // small phone's width a label that fits at 90% is better than one that is not there.
      let chosen = null;
      let first = null;
      for (const shrink of [1, 0.9, 0.82]) {
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
          // Two labels closer than this read as one phrase ("1.82 V cytochrome b6f"), so a label keeps a
          // clear margin from every other one, not just a pixel.
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
      // An optional label (a wavelength beside its wave, the bracket's second line) is left out when
      // nothing clears; a station's name never is, and the lab throws instead.
      if (!chosen && (it.optional || !first)) continue;
      if (!chosen) chosen = first;
      placed.push(chosen.box);
      if (chosen.leader) segs.push({ a: chosen.leader.a, b: chosen.leader.b, pad: 1.5 });
      out[it.key] = { ...it, ...chosen };
    }
    g.labels = out;
    g.collisions = Object.values(out).filter((l) => l.collided).map((l) => l.key);
  }

  // ---------------------------------------------------------------- drawing the Z

  function richLabel(pane, x, y, src, { size, anchor = 'start', cls = null, weight = null, fill = null, halo = 2.6, opacity = null, parent } = {}) {
    const t = pane.text(x, y, '', {
      anchor,
      class: cls ?? undefined,
      'font-size': b.num(size, 2),
      'font-weight': weight ?? undefined,
      style: fill ? `fill:${fill}` : undefined,
      opacity: opacity === null ? undefined : b.num(opacity, 3),
      ...(halo ? { stroke: C.paper, 'stroke-width': `${halo}px`, 'stroke-linejoin': 'round', 'paint-order': 'stroke' } : {}),
      ...(parent ? { parent } : {}),
    });
    return fillRuns(t, src, size);
  }

  function arrowHead(pane, tip, from, size, cls) {
    const dx = tip.x - from.x;
    const dy = tip.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const bx = tip.x - ux * size;
    const by = tip.y - uy * size;
    pane.path(`M${b.num(bx - uy * size * 0.55, 1)} ${b.num(by + ux * size * 0.55, 1)} L${b.num(tip.x, 1)} ${b.num(tip.y, 1)} L${b.num(bx + uy * size * 0.55, 1)} ${b.num(by - ux * size * 0.55, 1)}`, { class: cls, fill: 'none' });
  }

  function holeGlyph(pane, x, y, r = POS_R, opacity = null) {
    const o = opacity === null ? {} : { opacity: b.num(opacity, 3) };
    pane.circle(x, y, r, { fill: C.paper, stroke: C.ink, 'stroke-width': 1.2, ...o });
    const a = r * 0.55;
    pane.line(x - a, y, x + a, y, { stroke: C.ink, 'stroke-width': 1.2, ...o });
    pane.line(x, y - a, x, y + a, { stroke: C.ink, 'stroke-width': 1.2, ...o });
  }
  const electron = (pane, x, y, opacity = null) => pane.circle(x, y, DOT, {
    fill: C.ink, stroke: C.paper, 'stroke-width': 1.4, ...(opacity === null ? {} : { opacity: b.num(opacity, 3) }),
  });

  function drawAxes(g) {
    const zp = zPane;
    for (const a of g.axes) {
      for (const v of a.ticks) {
        const y = a.yOf(v);
        // A gridline stops short of the list rather than running under its type.
        const under = g.list && y > g.list.top - 6 && y < g.list.bottom + 4;
        zp.line(a.x + 3, y, under ? g.list.x - 8 : g.right, y, { class: 'zs-grid' });
        const label = v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;
        zp.text(a.x - 4, y + a.tick * 0.35, label, { anchor: 'end', class: 'zs-tick', 'font-size': b.num(a.tick, 1) });
      }
      zp.line(a.x, a.top - 4, a.x, a.bottom + 2, { class: 'zs-spine' });
    }
    zp.text(g.caption.x, g.caption.y, g.caption.src, { class: 'zs-cap', 'font-size': b.num(g.caption.size, 1) });
    if (g.bracket) {
      const { x, y0, y1 } = g.bracket;
      zp.line(x, y0, x, y1, { stroke: C.ink, 'stroke-width': 1.1 });
      zp.line(x - 3, y0, x + 3, y0, { stroke: C.ink, 'stroke-width': 1.1 });
      zp.line(x - 3, y1, x + 3, y1, { stroke: C.ink, 'stroke-width': 1.1 });
    }
  }

  function drawPathLines(g) {
    for (const l of g.lines) {
      const off = l.only && l.only !== path;
      zPane.path(dOf(l.pts), { class: l.climb ? 'zs-climb' : `zs-path${off ? ' is-off' : ''}` });
      const n = l.pts.length;
      if (l.climb) {
        arrowHead(zPane, l.pts[1], l.pts[0], 6.5, 'zs-path');
      } else if (l.arrowEnd) {
        arrowHead(zPane, l.pts[n - 1], l.pts[n - 2], 5.5, `zs-path${off ? ' is-off' : ''}`);
      } else {
        // A chevron at the middle of a run says which way the electrons go down it.
        const a = l.pts[0];
        const c = l.pts[n - 1];
        const len = Math.hypot(c.x - a.x, c.y - a.y);
        if (len > 26) {
          const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
          arrowHead(zPane, toward(mid, c, 3), toward(mid, a, 3), 5, `zs-path${off ? ' is-off' : ''}`);
        }
      }
    }
    if (g.narrow) {
      // The numbers at the join's two ends and at the cyclic stubs.
      const numAt = (x, y, str, anchor, dim = false) => zPane.text(x, y, str, {
        anchor, class: 'zs-num', 'font-size': b.num(g.size, 1),
        ...(dim ? { style: 'fill:var(--ink-faint)' } : {}),
        stroke: C.paper, 'stroke-width': '2.6px', 'stroke-linejoin': 'round', 'paint-order': 'stroke',
      });
      numAt(g.exit.x1 + 3, g.exit.y + g.size * 0.36, '6', 'start');
      numAt(g.entry.x0 - 3, g.entry.y + g.size * 0.36, '5', 'end');
      const cyc = path === 'cyclic';
      numAt(g.cycOut.x - 3, g.cycOut.y + g.size * 0.36, '4', 'end', !cyc);
      numAt(g.cycIn.x + 3, g.cycIn.y + g.size * 0.2, '7', 'start', !cyc);
    }
  }

  function drawStations(g, t) {
    const s = g.st;
    for (const k of ['pq', 'b6f', 'pc', 'fd', 'nadp']) zPane.line(s[k].x - BAR / 2, s[k].y, s[k].x + BAR / 2, s[k].y, { class: 'zs-bar' });
    // The reaction centres: the ground state a disc of chlorophyll, the excited state an open ring.
    for (const k of ['p680', 'p700']) zPane.circle(s[k].x, s[k].y, RC, { fill: RC_FILL });
    for (const k of ['p680x', 'p700x']) zPane.circle(s[k].x, s[k].y, RC, { fill: C.paper, stroke: RC_FILL, 'stroke-width': 1.6 });
    // The cluster's four positions: a hole in each one it has stored.
    const filled = clusterShown(t);
    for (let i = 0; i < 4; i += 1) {
      const x = g.cluster.x0 + POS_R + i * (2 * POS_R + POS_GAP);
      if (i < filled) holeGlyph(zPane, x, s.water.y);
      else zPane.circle(x, s.water.y, POS_R, { fill: C.paper, stroke: C.ruleStrong, 'stroke-width': 1.1 });
    }
    // Photon sources.
    for (const wv of g.waves) {
      const pts = wavePoints(wv.tail, wv.head, g.narrow ? 2.6 : 3.2);
      zPane.path(dOf(pts), { class: 'zs-wave' });
      arrowHead(zPane, pts[pts.length - 1], pts[pts.length - 4], 5, 'zs-wave');
    }
    if (g.legend) {
      const lb = g.legendBox;
      let x = lb.x0 + 2;
      electron(zPane, x + 4, lb.y - lb.size * 0.33);
      zPane.text(x + 11, lb.y, 'electron', { class: 'zs-cap', 'font-size': b.num(lb.size, 1) });
      x += 12 + textWidth('electron', lb.size) + 16;
      holeGlyph(zPane, x + 4, lb.y - lb.size * 0.33, 3.6);
      zPane.text(x + 11, lb.y, 'hole', { class: 'zs-cap', 'font-size': b.num(lb.size, 1) });
    }
  }

  // Labels, with the tag a stalled or starved carrier carries while the drawing shows it so.
  function tags(t) {
    const s = stall();
    const out = {};
    if (s.at === 'plastoquinone' && shown('pq', t) >= PQ_CAP) {
      out.pq = TAGS.full;
      if (s.starved === 'ferredoxin') out.fd = TAGS.starved;
    }
    if (s.at === 'P700' && shown('p700', t) === 0 && !pendingTo('p700', t)) {
      out.p700 = TAGS.stalled;
      out.pc = TAGS.starved;
    }
    return out;
  }
  const TAG_FILL = { full: C.coralText, stalled: C.coralText, starved: C.waterText };

  function drawLabels(g, t) {
    const tg = tags(t);
    for (const l of Object.values(g.labels)) {
      if (l.leader) zPane.line(l.leader.a.x, l.leader.a.y, l.leader.b.x, l.leader.b.y, { class: 'zs-leader' });
      let src = l.src;
      if (l.key === 'p700' && tg.p700) src = 'P700^{+}';
      const node = richLabel(zPane, l.x, l.y, src, { size: l.size, anchor: l.anchor, cls: l.cls, weight: l.weight });
      const tag = tg[l.key];
      if (tag) node.append(el('tspan', { style: `fill:${TAG_FILL[tag]}`, 'font-weight': 600 }, [` ${tag}`]));
    }
    if (g.list) drawList(g, tg);
  }

  const LIST = [
    ['1', 'H_{2}O · Mn_{4}Ca', null],
    ['2', 'P680', null],
    ['3', 'plastoquinone', 'pq'],
    ['4', 'cytochrome ~b~_{6}~f~', null],
    ['5', 'plastocyanin', 'pc'],
    ['6', 'P700', 'p700'],
    ['7', 'ferredoxin', 'fd'],
    ['8', 'NADP^{+}', null],
  ];
  function drawList(g, tg) {
    const { x, top, bottom } = g.list;
    const avail = g.w - x - 2;
    const numW = 11;
    let size = 9.4 * g.k;
    const widest = Math.max(...LIST.map(([, name, key]) => textWidth(`${key === 'p700' ? 'P700^{+}' : name}${key ? ` ${key === 'pq' ? TAGS.full : key === 'p700' ? TAGS.stalled : TAGS.starved}` : ''}`, size)));
    if (widest + numW > avail) size *= (avail - numW) / widest;
    // Eight lines in the height there is, never closer than 1.3 of their own size: the type gives way
    // before the leading does.
    const lineAvail = (bottom - top) / LIST.length;
    size = Math.max(7, Math.min(size, lineAvail / 1.3));
    const lineH = Math.min(size * 1.55, lineAvail);
    LIST.forEach(([n, name, key], i) => {
      const y = top + lineH * (i + 0.72);
      zPane.text(x + numW - 3, y, n, { anchor: 'end', class: 'zs-num', 'font-size': b.num(size, 2) });
      const src = key === 'p700' && tg.p700 ? 'P700^{+}' : name;
      const node = richLabel(zPane, x + numW + 1, y, src, { size, cls: 'zs-list', halo: 0 });
      const tag = key ? tg[key] : null;
      if (tag) node.append(el('tspan', { style: `fill:${TAG_FILL[tag]}`, 'font-weight': 600 }, [` ${tag}`]));
    });
  }

  function drawDynamic(g, t) {
    const s = g.st;
    // Electrons at rest on the carriers.
    for (const k of ['pq', 'b6f', 'pc', 'fd']) {
      const n = clamp(shown(k, t), 0, k === 'pq' ? PQ_CAP : 1);
      for (let i = 0; i < n; i += 1) {
        const at = shelf(s[k], n === 1 ? 0 : (i - 0.5) * (2 * DOT + 2.6));
        electron(zPane, at.x, at.y);
      }
    }
    // The reaction centres: their own electron, or the hole it left.
    for (const k of ['p680', 'p700']) {
      if (shown(k, t) >= 1) electron(zPane, s[k].x, s[k].y);
      else holeGlyph(zPane, s[k].x, s[k].y, RC - 0.6);
    }
    // NADP⁺ reductase's first electron, waiting for its second.
    const arrived = fnr - pendingTo('nadp', t);
    if (arrived % 2 === 1) {
      const at = shelf(s.nadp, -NADP_SLOT);
      electron(zPane, at.x, at.y);
    }

    // Transient marks: oxygen leaving, protons dropping into the lumen, NADPH made.
    if (!instant()) {
      for (const f of fx) {
        const p = (t - f.at) / T_FX;
        if (p < 0 || p >= 1) continue;
        const fade = 1 - p * p;
        const z = g.zones[f.kind];
        const size = (g.narrow ? 9.6 : 10.6) * g.k;
        if (f.kind === 'o2') {
          const y = z.y1 - 3 - (z.y1 - z.y0 - size - 4) * ease(p);
          const x = g.cluster.x - (g.o2Parts[0] + g.o2Parts[1]) / 2;
          richLabel(zPane, x, y, 'O_{2}', { size, weight: 700, fill: C.coralText, opacity: fade });
          richLabel(zPane, x + g.o2Parts[0], y, O2_TAIL, { size: size - 0.6, weight: 600, fill: C.leafText, opacity: fade });
        } else if (f.kind === 'h2') {
          const y = z.y0 + size + (z.y1 - z.y0 - size - 2) * ease(p);
          richLabel(zPane, s.b6f.x + 4, Math.min(y, z.y1 - 2), `2${NB}H^{+}`, { size: size - 0.8, anchor: 'middle', weight: 600, fill: C.leafText, opacity: fade });
        } else if (f.kind === 'nadph') {
          const y = z.y1 - 4 - (z.y1 - z.y0 - 12) * ease(p);
          zPane.circle(s.nadp.x - 3, y - size * 0.34, 4.6, { fill: NADPH_FILL, stroke: C.ink, 'stroke-width': 0.8, opacity: b.num(fade, 3) });
          zPane.text(s.nadp.x + 4, y, 'NADPH', { class: 'zs-name', 'font-size': b.num(size - 0.6, 1), opacity: b.num(fade, 3), stroke: C.paper, 'stroke-width': '2.4px', 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
        }
      }
    }

    // Photons in flight, and a photon at a closed reaction centre fading where it arrived.
    for (const ph of photons) {
      const wv = g.waves.find((w2) => w2.ps === ph.ps);
      if (!wv || ph.t1 <= ph.t0) continue;
      const pts = wavePoints(wv.tail, wv.head, g.narrow ? 2.6 : 3.2);
      if (t >= ph.t0 && t < ph.t1) {
        const f = (t - ph.t0) / (ph.t1 - ph.t0);
        const head = Math.round(f * (pts.length - 1));
        const tail = Math.max(0, head - 11);
        const seg = pts.slice(tail, head + 1);
        if (seg.length > 1) {
          zPane.path(dOf(seg), { class: 'zs-photon' });
          arrowHead(zPane, seg[seg.length - 1], seg[Math.max(0, seg.length - 3)], 5.5, 'zs-photon');
        }
      } else if (ph.wasted && t >= ph.t1 && t < ph.t1 + 0.45) {
        const fade = 1 - (t - ph.t1) / 0.45;
        const seg = pts.slice(pts.length - 8);
        zPane.path(dOf(seg), { class: 'zs-photon', opacity: b.num(fade, 3) });
      }
    }

    // Electrons and holes on the move.
    for (const m of moves) {
      if (!(t >= m.t0 && t < m.t1) || m.t1 <= m.t0) continue;
      const f = ease((t - m.t0) / (m.t1 - m.t0));
      if (m.kind === 'refill') {
        const p = along(route(g, 'water', 'p680'), 1 - f);
        holeGlyph(zPane, p.x, p.y, POS_R);
      } else {
        const p = along(route(g, m.from, m.to, m.slot), f);
        electron(zPane, p.x, p.y);
      }
    }
  }

  function drawZ() {
    const { w, h } = zPane.clear().box;
    const g = geometry(w, h);
    // In the lab, and once the book's own face has arrived (before it the widths are a fallback's), a
    // label that nothing clears is a defect in this file, and the gates that drive the lab should say so.
    if (g.collisions.length && fontsKey() === 'loaded' && typeof location !== 'undefined' && location.pathname.includes('/lab/')) {
      throw new Error(`zscheme: at a ${w}×${h} ${g.narrow ? 'narrow' : 'wide'} pane no position clears the label(s) ${g.collisions.join(', ')}; every candidate overlaps a line, a mark or another label.`);
    }
    const t = now();
    drawAxes(g);
    drawPathLines(g);
    drawStations(g, t);
    drawLabels(g, t);
    drawDynamic(g, t);
    zPane.focusMark();
  }

  // ---------------------------------------------------------------- the readout

  function drawReadout() {
    const { w, h } = readPane.clear().box;
    const size = clamp(w * 0.031, 9.8, 11.4);
    const v = viewAt(now());
    const s = v.stall;
    const kj = (x) => `${n1(x)} kJ/mol`;
    const kept = v.nadph * CLIMB_KJ;
    // At a phone's width the table loses its title, which the three labels do not need, so that the
    // sentence under them always has the room it takes: it is the one that says where the path jammed.
    readPane.readout({ title: b.narrow ? null : 'What the light has made', width: w, size, minRow: 13, maxRow: 24 })
      .fit(h, (r, level) => {
        r.row('NADPH made', String(v.nadph));
        r.row('Oxygen released', String(v.oxygen));
        r.row('Protons into the lumen', String(v.protons));
        r.note(status(v), s.at ? { accent: C.coralText } : {});
        if (level < 2) {
          r.head('Ledger');
          r.row('Lift, water to NADPH', `${b.num(CLIMB_V, 2)} V`);
          if (level < 1) r.row('Two electrons up it', `${Math.round(CLIMB_KJ)} kJ/mol`);
          r.row('Light fired', kj(photonKj));
          r.row('Stored in NADPH', kj(kept));
          r.sum('Captured', `${n1(photonKj > 0 ? (kept / photonKj) * 100 : 0)}%`);
          if (level < 1) r.note(`Four photons per NADPH is the best there is: ${Math.round(BEST_KJ)}${NB}kJ/mol in, ${Math.round(CLIMB_KJ)} kept, ${Math.round((CLIMB_KJ / BEST_KJ) * 100)}%. The rest runs downhill, and part of it moves protons.`);
        }
      }, { levels: 3 });
  }

  // ---------------------------------------------------------------- the flash train

  const FLASH_NOTE = `After darkness three clusters in four rest one step along, so the first oxygen comes on flash${NB}3, not${NB}4. Each flash misses about one cluster in twenty, so the peaks blur.`;
  const Y_MAX = 0.6;

  function drawFlashChart() {
    const { w, h } = flashPane.clear().box;
    const t = now();
    const title = 9.4;
    flashPane.text(0, title + 1, 'Oxygen per flash', { class: 'tb-rt-title', 'font-size': b.num(title, 1) });
    flashPane.line(0, title + 5.5, w, title + 5.5, { stroke: C.ruleStrong });
    const noteSize = 9.8;
    const lines = wrapText(FLASH_NOTE, w, noteSize);
    // A small paragraph's own leading, 1.45, rather than the table's row rhythm: it is a note under a
    // chart, not a row of one.
    const lead = noteSize * 1.45;
    const noteH = lines.length * lead;
    const tick = 9.2;
    const yLab = Math.ceil(textWidth('50%', tick)) + 5;
    const top = title + 16;
    const base = h - noteH - tick - 12;
    const plotH = Math.max(0, base - top);
    const x0 = yLab + 4;
    const slot = Math.max(1, (w - x0) / FLASHES);
    const yOf = (v) => base - (v / Y_MAX) * plotH;
    if (plotH > 24) {
      for (const v of [0.25, 0.5]) {
        flashPane.line(x0, yOf(v), w, yOf(v), { class: 'zs-grid' });
        flashPane.text(yLab, yOf(v) + tick * 0.35, `${Math.round(v * 100)}%`, { anchor: 'end', class: 'zs-tick', 'font-size': b.num(tick, 1) });
      }
    }
    flashPane.line(x0, base, w, base, { stroke: C.ruleStrong });
    const peaks = [3, 7, 11];
    for (let i = 0; i < FLASHES; i += 1) {
      const cx = x0 + slot * (i + 0.5);
      const shownBar = i < flashYields.length && flashShownAt[i] <= t;
      if (shownBar && plotH > 0) {
        const hh = clamp((flashYields[i] / Y_MAX) * plotH, 0, plotH);
        flashPane.rect(cx - slot * 0.28, base - hh, slot * 0.56, hh, { class: 'zs-bar-chart' });
      }
      const isPeak = peaks.includes(i + 1);
      flashPane.text(cx, base + tick + 3, String(i + 1), {
        anchor: 'middle', class: isPeak ? 'zs-axisval' : 'zs-tick', 'font-size': b.num(tick, 1),
      });
    }
    if (!flashYields.length && plotH > 24) {
      const msg = train ? 'the first flash is coming' : 'Press Flash train to fire twelve flashes at a system reset to the dark.';
      flashPane.text(x0 + (w - x0) / 2, top + plotH * 0.5, msg, { anchor: 'middle', class: 'tb-rt-note', fit: [10, 8], width: w - x0 - 8 });
    }
    lines.forEach((line, i) => {
      flashPane.text(0, h - noteH + i * lead + noteSize, line, { class: 'tb-rt-note', 'font-size': b.num(noteSize, 1) });
    });
  }

  // The narrow composition's strip: twelve marks under the drawing, with no axes of their own.
  function drawFlashStrip() {
    const { w, h } = flashPane.clear().box;
    const t = now();
    const title = 8.8;
    // Measured in capitals and given the class's 0.1 em of tracking, because that is how it is set.
    const labelW = textWidth('OXYGEN PER FLASH', title, 600) + 16 * 0.1 * title + 10;
    flashPane.text(0, h * 0.5 + title * 0.36, 'Oxygen per flash', { class: 'tb-rt-title', 'font-size': b.num(title, 1) });
    const x0 = labelW;
    const slot = Math.max(1, (w - x0) / FLASHES);
    const numSize = 8.4;
    const base = h - numSize - 5;
    const tall = Math.max(4, base - 3);
    flashPane.line(x0, base, w, base, { stroke: C.ruleStrong });
    for (let i = 0; i < FLASHES; i += 1) {
      const cx = x0 + slot * (i + 0.5);
      const shownBar = i < flashYields.length && flashShownAt[i] <= t;
      if (shownBar) {
        const hh = clamp((flashYields[i] / Y_MAX) * tall, 0, tall);
        flashPane.rect(cx - slot * 0.22, base - hh, slot * 0.44, hh, { class: 'zs-bar-chart' });
      } else {
        flashPane.rect(cx - slot * 0.22, base - 1.5, slot * 0.44, 1.5, { class: 'zs-slot' });
      }
      if ([3, 7, 11].includes(i + 1)) flashPane.text(cx, h - 2, String(i + 1), { anchor: 'middle', class: 'zs-axisval', 'font-size': b.num(numSize, 1) });
    }
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }
  b.onDraw(() => {
    drawZ();
    drawReadout();
    if (b.narrow) drawFlashStrip();
    else drawFlashChart();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   path                    'linear' | 'cyclic'
  //   photonsAtPsii, photonsAtPsi  photons fired at each photosystem since the reset, by hand or by the
  //                           flash train, including those a closed reaction centre wasted
  //   clusterCount            0–3, the holes the manganese cluster holds; wraps to 0 as oxygen leaves
  //   oxygenReleased          O₂ molecules; 0 until the fourth photon photosystem II could use
  //   nadphMade               one per two electrons that reach NADP⁺; never rises while path is 'cyclic'
  //   protonsToLumen          four per oxygen from water, and two per electron through the cytochrome
  //                           complex; the proton the reductase takes from the stroma is not counted
  //   carrierFill             { plastoquinone, cytochromeB6f, plastocyanin, ferredoxin }, each 0–1
  //   stalledAt               'plastoquinone' when it is full and photosystem II can do nothing, 'P700'
  //                           when P700 has given its electron and nothing can come down to refill it,
  //                           otherwise null; computed from the carriers, never set
  //   starvedAt               its opposite: 'ferredoxin' when stalled at plastoquinone on the linear path
  //                           (null on the cyclic path, where the loop is full rather than anything
  //                           starved), 'plastocyanin' when stalled at P700, otherwise null
  //   flashTrain              true while a train is firing
  //   flashOxygen             the population's oxygen on each flash so far, as a fraction of the
  //                           reaction centres, three decimals; empty until a train is run
  //   climbVolts              1.14, water to NADP⁺
  //   climbKjPerTwoElectrons  220
  //   photonKjSupplied        kJ/mol, the photons fired since the reset, 175.9 at 680 nm and 170.9 at 700
  //   capturedFraction        NADPH's share of that: 220.0 kJ/mol per NADPH over the light fired
  //   t, playing              the clock in seconds, three decimals, and whether it is running
  // Everything goes back to the opening state on Reset, the path included.
  return b.handle();
}
