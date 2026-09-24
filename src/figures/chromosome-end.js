// One round of copying at the tip (Figure 8.4). The last few hundred base pairs of a human chromosome's
// end, drawn to scale with one tick for each TTAGGG repeat, six base pairs to a tick, and the single-
// stranded tail at the tip; above them the whole telomere, drawn small, with what it has lost and the
// length at which the cell stops. One division is stepped through in two phases. COPYING: a fork arrives
// from the chromosome's interior, the leading strand runs off the end with its template, and the lagging
// strand is made in fragments, each started on an RNA primer, the last of them at the very tip. AFTER:
// the primers are removed, every gap but the last is filled by extending the fragment beyond it, on the
// side of the fork, the last stays open because nothing lies beyond it, and the ends are trimmed to
// leave a tail. Telomerase, switched on, extends the short end from the RNA template it carries, and
// primase and polymerase fill in the partner strand. A circle has no end: its two forks meet, and the
// last gap each leaves is filled from the other fork's leading strand.
//
// THE NUMBERS, with their sources (FIGURES.md, 8.4).
//   Repeat       TTAGGG, six base pairs; one tick each in the enlarged view, which is drawn to scale.
//   Start        10,000 bp (START_BP): about ten thousand at birth; the mean in newborns' blood cells is
//                9.5 kb (Factor-Litvak et al. 2016).
//   Loss         50 bp an end at each division by default, 25–100 on the control: fibroblasts growing in
//                a dish lose about 50 (Levy et al. 1992, J Mol Biol).
//   Tail         roughly 75–300 nt in human cells (Wright et al. 1997; Makarov et al. 1997). Here it is
//                TWICE THE LOSS, 100 nt by default, for the reason under TWO COPIES; so the control's
//                lowest settings, 25 to 35 bp, give tails of 50 to 70 nt, under the measured range.
//   Template     telomerase's RNA carries 3′-CAAUCCCAAUC-5′, eleven nucleotides: its 3′ CAAUC pairs with
//                the tail's last five, GTTAG, and the six beyond them template GGTTAG.
//   Threshold    7,500 bp (THRESHOLD_BP). A MODEL VALUE, NOT A MEASUREMENT: it was chosen so that the
//                defaults, 10,000 bp and 50 lost at each division, stop the cell after exactly fifty
//                divisions, Hayflick's figure for fibroblasts from fetal tissue (Hayflick 1965). A real
//                cell stops when its SHORTEST telomeres fall below a critical length (§8.7), not when its
//                average one does, which is the one this figure counts.
//   Fragments    100–200 nt, the length of human Okazaki fragments. Each is drawn from that range by a
//                hash of its number and the division's, so a division is the same division every time.
//   Primers      10 nt, drawn to scale.
//
// TWO COPIES, NOT ONE. The brief's "after" draws one new end, shortened by the gap its last primer left.
// That is not what happens to either copy, so the figure draws both (after Lingner, Cooper and Cech
// 1995). The copy whose template is the strand with its 3′ end at the tip is made by the LAGGING
// strand: its last fragment is primed on the tail's last ten nucleotides, and when that primer is
// removed nothing beyond it can fill the gap, so its new strand ends short of its template. The other
// copy is made by the LEADING strand, which runs off the end of its own template — the strand that was
// already short by the tail — and so ends blunt, a whole tail short of the parent's tip. Both are then
// trimmed to leave a tail again: the first copy loses nothing its parent had, the second a whole tail's
// length. So a division shortens the average end by half the tail, and the tail is drawn at twice the
// loss per division, which makes the two agree: 50 bp an end at the default, from a tail of 100 nt.
// (Human telomeres do shorten in proportion to their tails: Huffman et al. 2000.) The counts follow the
// average end — `telomereBp` falls by the loss at each division and `lostLastDivisionBp` is the loss —
// and the table's sentence says that one copy is a tail shorter and the other is not. The enlarged view
// stays on the parent's tip for the whole division.
//
// TELOMERASE, switched on, works in the 'after' phase once the ends are trimmed. It pairs its template
// with the short copy's tail, adds a repeat, shifts six nucleotides along and adds another, until the
// tail reaches the parent's tip again: twice the loss, in nucleotides, at each division, the last repeat
// partial. Primase then lays a primer on the new stretch, polymerase fills in the partner strand back to
// the old one, and the primer is removed to leave the tail. The length holds, `lostLastDivisionBp` is
// 0, and `repeatsAdded` counts the whole repeats added since the reset, 16 a division at the default.
// The enlarged letters beside the tip show one step of it: the pairing, a repeat added, the shift, and
// the next repeat.
//
// WHAT A SETTING CHANGES. The division on show is computed from the settings as they are, so switching
// telomerase on in the 'after' phase re-does that division's end with the enzyme there — and switching
// it on at the stop removes the stop — and the loss control re-does it the same way. Before and during
// copying, `lostLastDivisionBp` is what the last completed division did. Changing the shape starts again
// from the first division and keeps the settings; Reset puts everything back as it opened.
//
// THE RUN. Run divisions repeats the division, each faster than the last — the first takes 3.2 s of the
// clock and each later one 0.72 of the one before, down to 0.34 s — and stops by itself at the
// threshold. Step and Divide move the model inside the press, and stop a run.
//
// THE CIRCLE. Shape: Circular draws the far side of a circular chromosome, where its two forks meet. Each
// fork's lagging strand ends in a fragment primed near the meeting point, and the gap that primer leaves
// has the other fork's leading strand beyond it, which fills it. Nothing is lost, no tail is left, and
// there is no telomere to count down, so `telomereBp` stays at the length the model started from.
//
// THE NARROW COMPOSITION. Below 800 px the chromosome end runs down the stage, tip at the bottom: the copy
// made by the lagging strand on the left, the one made by the leading strand on the right, and each
// copy's labels to its outside. The whole telomere stays a band across the top, the letters telomerase
// copies sit beside the tip in twelve columns rather than sixteen, and the table becomes two columns of
// rows beneath, with its sentence under them. `narrowAspect` is 9/16 and not the brief's 4/5: see
// NARROW_WHY below.
import { C, clamp, lerp, el } from './lib/svg.js';
import { bench } from './lib/bench.js';
import { hash2 } from './lib/chem-atoms.js';
import { metabolismPart } from '../palette.js';

export const meta = {
  kind: 'chromosome-end',
  title: 'One round of copying at the tip',
  needsWebGL: false,
  aspect: 16 / 9,
  narrowAspect: 9 / 16,
};

// NARROW_WHY: measured at the narrow gate's 342 px stage, the toolbar takes four rows for the seven
// controls, and a 4/5 stage leaves the chromosome end and the table under 250 px between them, which
// fits neither the repeats at a legible spacing nor the table's rows.

const CSS = `
.tb-chromosome-end .ce-num { font-variant-numeric: lining-nums tabular-nums; }
.tb-chromosome-end .ce-caps { letter-spacing: 0.08em; text-transform: uppercase; }
`;

// ---- the numbers ----
const START_BP = 10000;
const THRESHOLD_BP = 7500; // a model value: 10,000 − 50 × 50
const REPEAT_BP = 6;
const LOSS = Object.freeze({ min: 25, max: 100, step: 5, open: 50 });
const PRIMER_NT = 10;
const FRAG_MIN = 100;
const FRAG_MAX = 200;
const PRIME_BEHIND = 30; // nt behind the fork at which primase lays a primer
const POL_CATCH = 2; // a polymerase with template in front of it runs this much faster than the fork
const LEAD_GAP = 12; // nt between the leading strand's 3′ end and the fork
const FORK_SHARE = 0.82; // of the copying phase, the part the fork takes to cross the view
const FRONT_NT = 40; // nt over which the two copies draw apart behind the fork
const FORK_PAST = 50; // nt past the tip the fork's front runs, so the copies part along their whole length
const RNA_TEMPLATE = 'CAAUCCCAAUC'; // 3′ → 5′, as it lies under the DNA's 5′ → 3′
const INTERIOR_BP = 2000; // how much of the rest of the chromosome the whole-telomere band draws
const RUN = Object.freeze({ first: 3.2, decay: 0.72, min: 0.34 });
const PHASE_SHARE = Object.freeze({ before: 0.14, copying: 0.4, after: 0.46 });
// The 'after' phase's beats, as shares of it.
const BEAT = Object.freeze({ removal: [0, 0.3], trim: [0.3, 0.55], telomerase: [0.55, 1] });
const OPEN = Object.freeze({ shape: 'linear', telomerase: false, loss: LOSS.open });
const PHASE_WORDS = Object.freeze({ before: 'Before copying', copying: 'Copying', after: 'After copying' });
const BASE_COLOUR = Object.freeze({ A: C.coral, T: C.gold, U: C.gold, G: C.water, C: C.violet });

const overhangOf = (loss) => 2 * loss;
const fragLen = (j, seed) => FRAG_MIN + (FRAG_MAX - FRAG_MIN) * hash2(j + 1, seed);
const runDur = (k) => Math.max(RUN.min, RUN.first * RUN.decay ** k);
const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const beat = (u, [a, z]) => clamp((u - a) / (z - a), 0, 1);
const nt = (v) => Math.round(v).toLocaleString('en-GB');
const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);

// What a division does to the average end, from the settings as they are.
function outcome(shape, telomerase, loss) {
  if (shape === 'circular') return { lost: 0, added: 0 };
  if (telomerase) return { lost: 0, added: overhangOf(loss) };
  return { lost: loss, added: 0 };
}

// The model: the divisions done, the length the division on show started from, what telomerase has
// added, the phase and how far through it. Pure data, moved only by the presses and the clock.
const freshModel = () => ({ base: 0, T0: START_BP, nt0: 0, lastLost: 0, phase: 'before', u: 1, runDivs: 0 });

// One fork crossing the view, at progress u of the copying phase, in nt along its own direction of
// travel (y). Its lagging strand's primers sit at P[j] (a primer covers [P − 10, P], its 5′ end at P),
// P[0] nearest the end it runs to; fragment j grows from its primer back to P[j + 1]. Its leading strand
// follows it to `leadStop`, where its template ends or the other fork's last primer begins.
function forkAt(f, u) {
  const t = Math.min(1, u / FORK_SHARE);
  const yf = lerp(f.yStart, f.yEnd, t);
  const speed = (f.yEnd - f.yStart) / FORK_SHARE;
  const P = [f.P0];
  for (let j = 0; P[j] > f.yStart - FRAG_MAX && j < 64; j += 1) P.push(P[j] - fragLen(j, f.seed));
  const primedAt = (y) => {
    const uj = (FORK_SHARE * (y + PRIME_BEHIND - f.yStart)) / (f.yEnd - f.yStart);
    return uj <= 0 ? -Infinity : uj;
  };
  // Fast enough that the last fragment, primed last, is finished when the phase ends.
  const rate = Math.max(POL_CATCH * speed, (1.15 * FRAG_MAX) / Math.max(0.05, 1 - primedAt(P[0])));
  const frags = [];
  for (let j = 0; j + 1 < P.length; j += 1) {
    const uj = primedAt(P[j]);
    if (u < uj) continue;
    const e = uj === -Infinity ? P[j + 1] : Math.max(P[j + 1], P[j] - PRIMER_NT - rate * (u - uj));
    frags.push({ j, P: P[j], next: P[j + 1], e, done: e <= P[j + 1] + 1e-9 });
  }
  return { yf, frags, leadEnd: Math.min(yf - LEAD_GAP, f.leadStop), leadMoving: yf - LEAD_GAP < f.leadStop - 0.5 };
}

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: 800 }, seed: 804 });
  const ENZYME = metabolismPart('enzyme');
  const PROTEIN = { fill: ENZYME.color, stroke: ENZYME.symbolColor, 'stroke-width': 1, 'stroke-opacity': 0.35 };

  let shape = OPEN.shape;
  let telomerase = OPEN.telomerase;
  let loss = OPEN.loss;
  let m = freshModel();
  let restarting = false;

  // ---- panes ----
  const endPane = b.pane('end', {
    as: 'svg',
    focus: true,
    aria: 'The end of a linear chromosome, its telomere drawn as TTAGGG repeats with a single-stranded tail at the tip, and above it the whole telomere with its length. One division is stepped through: the fork reaches the end, the leading strand runs off, the last lagging-strand fragment starts on a primer at the tip and leaves a gap nothing can fill, and the ends are trimmed. Telomerase can be switched on to add the repeats back from its RNA template, and the chromosome can be made a circle. Enter steps, D divides, space runs divisions, T switches telomerase, C changes the shape, and Home resets.',
  });
  const table = b.pane('table', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 72fr) minmax(0, 28fr)',
      rows: 'minmax(0, 1fr)',
      at: { end: [1, 1], table: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 69fr) minmax(0, 31fr)',
      at: { end: [1, 1], table: [1, 2] },
    },
  });

  // ---- controls ----
  b.action('Step', () => stepOnce(), { aria: 'Step, move one phase of the division on' });
  b.action('Divide', () => divideOnce(), { primary: true, aria: 'Divide, run one whole division' });
  const runCtl = b.run({
    primary: false,
    runLabel: 'Run divisions',
    aria: 'Run divisions, one after another until the cell stops',
    onChange: (on) => onRun(on),
  });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the figure back as it opened' });
  b.divide();
  const telCtl = b.toggle('Telomerase', (on) => setTelomerase(on), {
    pressed: OPEN.telomerase,
    aria: 'Telomerase, switch the enzyme on or off',
  });
  const lossCtl = b.stepper('Loss per division', {
    min: LOSS.min,
    max: LOSS.max,
    step: LOSS.step,
    value: OPEN.loss,
    short: 'Loss',
    format: (v) => `${v} bp`,
    valueText: (v) => `${v} base pairs at each division`,
    onInput: (v) => setLoss(v),
  });
  b.divide();
  const shapeCtl = b.choice('Shape', [
    { id: 'linear', label: 'Linear', aria: 'Linear, a chromosome with ends' },
    { id: 'circular', label: 'Circular', aria: 'Circular, a chromosome with no ends' },
  ], (id) => setShape(id), { segmented: true, value: OPEN.shape });

  b.keys({
    ' ': () => runCtl.toggle(),
    Enter: () => stepOnce(),
    d: () => divideOnce(),
    D: () => divideOnce(),
    t: () => telCtl.toggle(),
    T: () => telCtl.toggle(),
    c: () => shapeCtl.next(),
    C: () => shapeCtl.next(),
    Home: () => resetAll(),
  });

  // ---- what the model says now ----
  const telomereNow = () => (m.phase === 'after' ? m.T0 - outcome(shape, telomerase, loss).lost : m.T0);
  const senescentNow = () => shape === 'linear' && telomereNow() <= THRESHOLD_BP;
  const stoppedWords = () => `The cell has stopped dividing at ${nt(telomereNow())} base pairs. Switch telomerase on, or reset.`;

  // ---- reader actions ----
  function afterChange() {
    b.redraw();
    b.announce();
  }

  function commit() {
    const out = outcome(shape, telomerase, loss);
    m.base += 1;
    m.T0 -= out.lost;
    m.nt0 += out.added;
    m.lastLost = out.lost;
    m.phase = 'before';
    m.u = 0;
  }

  function stepOnce() {
    if (b.playing) runCtl.set(false);
    if (m.phase === 'before') {
      m.phase = 'copying';
      m.u = 1;
    } else if (m.u < 1) m.u = 1;
    else if (m.phase === 'copying') {
      m.phase = 'after';
      m.u = 1;
    } else if (senescentNow()) {
      b.announce(stoppedWords());
      return;
    } else commit();
    afterChange();
  }

  function divideOnce() {
    if (b.playing) runCtl.set(false);
    if (m.phase === 'after') {
      if (senescentNow()) {
        if (m.u < 1) {
          m.u = 1;
          afterChange();
        } else b.announce(stoppedWords());
        return;
      }
      commit();
    }
    m.phase = 'after';
    m.u = 1;
    afterChange();
  }

  function onRun(on) {
    if (on && senescentNow() && m.phase === 'after' && m.u >= 1) {
      runCtl.set(false);
      b.announce(stoppedWords());
      return;
    }
    if (on) m.runDivs = 0;
    afterChange();
  }

  function setTelomerase(on) {
    telomerase = on;
    afterChange();
  }

  function setLoss(v) {
    if (restarting) return;
    loss = v;
    afterChange();
  }

  function setShape(id) {
    if (shape === id) return;
    shape = id;
    m = freshModel();
    afterChange();
  }

  function resetAll() {
    if (b.playing) runCtl.set(false);
    b.restart(); // which calls restartModel()
    b.announce();
  }

  function restartModel() {
    shape = OPEN.shape;
    telomerase = OPEN.telomerase;
    loss = OPEN.loss;
    m = freshModel();
    restarting = true;
    telCtl.set(OPEN.telomerase, { quiet: true });
    lossCtl.set(OPEN.loss);
    shapeCtl.set(OPEN.shape, { quiet: true });
    restarting = false;
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    running: () => b.playing,
    advance: (dt) => {
      if (!b.playing) return;
      m.u += dt / (runDur(m.runDivs) * PHASE_SHARE[m.phase]);
      if (m.u < 1) return;
      if (m.phase === 'before') {
        m.phase = 'copying';
        m.u = 0;
      } else if (m.phase === 'copying') {
        m.phase = 'after';
        m.u = 0;
      } else if (senescentNow()) {
        m.u = 1;
        runCtl.set(false);
      } else {
        commit();
        m.runDivs += 1;
      }
    },
  });

  // ---- what describe() reports ----
  function state() {
    const out = outcome(shape, telomerase, loss);
    const after = m.phase === 'after';
    const linear = shape === 'linear';
    const T = after ? m.T0 - out.lost : m.T0;
    return {
      phase: m.phase,
      divisions: m.base + (after ? 1 : 0),
      telomereBp: T,
      startBp: START_BP,
      lossPerDivisionBp: loss,
      lostLastDivisionBp: after ? out.lost : m.lastLost,
      gapAtEnd: after && linear && !telomerase,
      overhangNt: linear ? overhangOf(loss) : 0,
      telomerase,
      repeatsAdded: Math.floor((m.nt0 + (after ? out.added : 0)) / REPEAT_BP),
      shape,
      senescent: linear && T <= THRESHOLD_BP,
      divisionsLeft: linear && !telomerase ? Math.max(0, Math.ceil((T - THRESHOLD_BP) / loss)) : null,
      thresholdBp: THRESHOLD_BP,
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // ---- the words ----
  function noteWords(st) {
    const O = overhangOf(loss);
    if (shape === 'circular') {
      if (m.phase === 'before') return 'A circle has no end. Its two forks leave the origin in opposite directions and meet on the far side, drawn here.';
      if (m.phase === 'copying') return 'The two forks meet. Each one’s last lagging-strand fragment is started on a primer near the meeting point.';
      return 'Every gap, the last included, has DNA beyond it: the other fork’s leading strand is extended into it. Nothing is lost.';
    }
    if (st.senescent) return `The telomere is down to ${nt(st.telomereBp)} bp, the length this model stops at: the cell stops dividing, after ${st.divisions} ${plural(st.divisions, 'division')}. Switch telomerase on and it goes on.`;
    if (m.phase === 'before') {
      if (st.divisions === 0) return `Before the first division: ${nt(START_BP)} bp of TTAGGG repeats, and a ${O}-nucleotide tail on the strand whose 3′ end is at the tip.`;
      return `${st.divisions} ${plural(st.divisions, 'division')} done. The next copy starts from ${nt(st.telomereBp)} bp.`;
    }
    if (m.phase === 'copying') return 'The leading strand runs off the end with its template. The last lagging-strand fragment starts on a primer at the very tip.';
    if (telomerase) return `Telomerase adds ${O} nt of repeats back to the short copy from its own RNA template, and primase and polymerase fill in the partner strand. The length holds.`;
    return `The last primer’s gap has nothing beyond it to fill it from. Trimmed to leave a tail, one copy is ${O} bp shorter than its parent and the other is not: ${loss} bp an end, on average.`;
  }

  b.onAnnounce(() => {
    const st = state();
    const phase = PHASE_WORDS[st.phase].toLowerCase();
    if (st.shape === 'circular') {
      return `A circular chromosome, ${phase}. ${st.divisions} ${plural(st.divisions, 'division')}, and nothing lost at any of them. ${noteWords(st)}`;
    }
    const left = st.divisionsLeft === null ? 'no limit to the divisions' : `${st.divisionsLeft} ${plural(st.divisionsLeft, 'division')} left`;
    return `Division ${st.divisions}, ${phase}. Telomere ${nt(st.telomereBp)} base pairs, ${st.lostLastDivisionBp} lost at the last division, ${left}. ${noteWords(st)}`;
  });

  // ---- drawing ----
  b.onDraw(() => {
    endPane.clear();
    table.clear();
    drawEnd();
    drawTable();
  });

  // Labels are placed, not positioned: each asks for the first of its candidate spots that no earlier
  // label, glyph or strand has taken, and a label with nowhere to go is left out. A collision is a
  // state, not a layout, and a run passes through hundreds of states.
  function placer(pane) {
    const { w, h: hgt } = pane.box;
    const boxes = [];
    const hits = (bx) => boxes.some((o) => bx.x0 < o.x1 && bx.x1 > o.x0 && bx.y0 < o.y1 && bx.y1 > o.y0);
    // Estimated, not measured: lower case runs about 0.56 em a character, spaced capitals about 0.74.
    const boxOf = (x, y, str, size, anchor, caps) => {
      const tw = String(str).length * size * (caps ? 0.74 : 0.56);
      const x0 = anchor === 'middle' ? x - tw / 2 : anchor === 'end' ? x - tw : x;
      return { x0: x0 - 2, y0: y - size * 0.8 - 1.5, x1: x0 + tw + 2, y1: y + size * 0.25 + 1.5 };
    };
    return {
      reserve(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
      reservePath(pts, pad = 2) {
        for (let i = 1; i < pts.length; i += 1) {
          const [xa, ya] = pts[i - 1];
          const [xb, yb] = pts[i];
          boxes.push({ x0: Math.min(xa, xb) - pad, y0: Math.min(ya, yb) - pad, x1: Math.max(xa, xb) + pad, y1: Math.max(ya, yb) + pad });
        }
      },
      place(cands, str, { size = 10.5, fill = C.ink, cls = null } = {}) {
        for (const [x, y, anchor] of cands) {
          const bx = boxOf(x, y, str, size, anchor, cls === 'ce-caps');
          if (bx.x0 < 1 || bx.y0 < 1 || bx.x1 > w - 1 || bx.y1 > hgt - 1 || hits(bx)) continue;
          boxes.push(bx);
          pane.label(x, y, str, { size, anchor, fill, ...(cls ? { class: cls } : {}) });
          return bx;
        }
        return null;
      },
    };
  }

  // The frame of the enlarged view. `x` is nt along the chromosome — the tip at 0 and the interior at
  // negative x on a line, the forks' meeting point at 0 on a circle — and `c` runs across it, positive
  // towards the copy made by the lagging strand. Wide, x runs right and c up; narrow, x runs down the
  // stage to the tip at the foot and c runs left, which is the whole of the turn.
  function geom() {
    const { w, h: hgt } = endPane.box;
    const narrow = b.narrow;
    const circ = shape === 'circular';
    const O = overhangOf(loss);
    const ov = narrow
      ? { x0: 8, x1: w - 8, top: 2, h: 50 }
      : { x0: 12, x1: w - 12, top: 4, h: clamp(hgt * 0.19, 62, 86) };
    const tvTop = ov.top + ov.h + (narrow ? 8 : 12);
    const tvBot = hgt - (narrow ? 4 : 6);
    const tvH = Math.max(40, tvBot - tvTop);
    const size = narrow ? 10 : clamp(hgt * 0.028, 10, 11.5);
    const withInset = telomerase && !circ;
    let span;
    if (circ) span = narrow ? 360 : 560;
    else span = narrow ? Math.max(360, 2 * O + 150) : Math.max(560, 2 * O + 280);
    const xMin = circ ? -span / 2 : -span;
    const xMax = circ ? span / 2 : 0;
    let P;
    let aOf;
    let s;
    let sep;
    let g;
    let aLo;
    let aHi;
    if (!narrow) {
      sep = clamp(tvH * 0.21, 34, 70);
      g = clamp(tvH * 0.03, 7, 10);
      const yMid = tvTop + tvH * (withInset ? 0.36 : 0.44);
      P = (a, c) => [a, yMid - c];
      aLo = 10;
      aHi = circ ? w - 10 : w - 46;
    } else {
      sep = clamp(w * 0.14, 34, 50);
      g = 7;
      const xMid = w * 0.4;
      P = (a, c) => [xMid - c, a];
      aLo = tvTop + 4;
      aHi = tvBot - (circ ? 6 : 18);
    }
    s = (aHi - aLo) / span;
    aOf = (x) => aLo + (x - xMin) * s;
    return { w, hgt, narrow, circ, O, ov, tvTop, tvBot, tvH, size, span, xMin, xMax, P, aOf, s, sep, g, aLo, aHi, withInset };
  }

  // Which strands exist, and where, for the division on show: a list of pieces, each on one of the four
  // strand places — the outer and inner strand of each copy — and each of a kind: 'old' (a parent
  // strand), 'dna' (new), 'rna' (a primer) or 'ghost' (trimmed away).
  function scene(G) {
    const pieces = [];
    const add = (copy, role, x0, x1, kind, alpha = 1) => {
      if (x1 - x0 > 1e-6 && alpha > 0.01) pieces.push({ copy, role, x0, x1, kind, alpha });
    };
    // A fork's own coordinate y maps to x the way it travels: +1 towards the tip, −1 away from it.
    const addY = (copy, role, dir, y0, y1, kind, alpha = 1) => (dir > 0 ? add(copy, role, y0, y1, kind, alpha) : add(copy, role, -y1, -y0, kind, alpha));
    const out = { pieces, forks: [], pols: [], marks: {}, sepAt: () => 0 };
    const O = G.O;
    const seed = 804 + m.base * 7;
    const u = m.u;
    const fA = m.phase === 'after' ? beat(u, BEAT.removal) : 0;

    if (!G.circ) {
      const fork = { yStart: G.xMin - 30, yEnd: FORK_PAST, P0: 0, leadStop: -O, seed };
      if (m.phase === 'before') {
        add('up', 'outer', G.xMin, 0, 'old');
        add('lo', 'outer', G.xMin, -O, 'old');
        return out;
      }
      const st = forkAt(fork, m.phase === 'copying' ? u : 1);
      out.sepAt = m.phase === 'copying' ? (x) => G.sep * smooth01((st.yf - x) / FRONT_NT) : () => G.sep;
      add('up', 'outer', G.xMin, 0, 'old');
      if (m.phase === 'copying') {
        add('lo', 'outer', G.xMin, -O, 'old');
        add('lo', 'inner', G.xMin, st.leadEnd, 'dna');
        for (const f of st.frags) {
          add('up', 'inner', Math.max(f.P - PRIMER_NT, f.e), f.P, 'rna');
          add('up', 'inner', f.e, f.P - PRIMER_NT, 'dna');
        }
        // The helicase runs off the end of the duplex and is gone.
        const alpha = 1 - clamp((st.yf + O - 10) / 30, 0, 1);
        if (alpha > 0.02) out.forks.push({ x: st.yf, dir: 1, alpha });
        if (st.leadMoving && st.leadEnd > G.xMin + 4) out.pols.push({ copy: 'lo', x: st.leadEnd });
        const working = st.frags.filter((f) => !f.done).pop();
        if (working && working.e > G.xMin + 4) out.pols.push({ copy: 'up', x: working.e });
        const last = st.frags.find((f) => f.j === 0);
        out.marks = { stLead: st.leadEnd, newest: st.frags.length ? st.frags[st.frags.length - 1] : null, last, frags: st.frags, fork: st.yf };
        return out;
      }
      // After: primers removed, gaps filled from the fragment beyond, the ends trimmed, and telomerase.
      const fB = beat(u, BEAT.trim);
      const fC = telomerase ? beat(u, BEAT.telomerase) : 0;
      const cutUp = lerp(-PRIMER_NT, -O, fB); // the lagging copy's new strand, trimmed back from its 5′ end
      const cutLo = lerp(-O, -2 * O, fB); // the leading copy's old strand, trimmed back from its 5′ end
      const clipUp = (x0, x1, kind, alpha) => add('up', 'inner', x0, Math.min(x1, cutUp), kind, alpha);
      for (const f of st.frags) {
        clipUp(f.next, f.P - PRIMER_NT, 'dna');
        if (f.j === 0) clipUp(f.P - PRIMER_NT, f.P, 'rna', 1 - fA);
        else {
          clipUp(f.P - PRIMER_NT * fA, f.P, 'dna');
          clipUp(f.P - PRIMER_NT, f.P - PRIMER_NT * fA, 'rna');
        }
      }
      add('up', 'inner', cutUp, -PRIMER_NT, 'ghost');
      add('lo', 'outer', G.xMin, cutLo, 'old');
      add('lo', 'outer', cutLo, -O, 'ghost');
      add('lo', 'inner', G.xMin, -O, 'dna');
      const ext = O * clamp(fC / 0.7, 0, 1);
      const telEnd = -O + ext;
      if (fC > 0) {
        add('lo', 'inner', -O, telEnd, 'dna');
        const fp = beat(fC, [0.72, 0.8]);
        const fq = beat(fC, [0.8, 0.95]);
        const fr = beat(fC, [0.95, 1]);
        add('lo', 'outer', -O, -O + PRIMER_NT, 'rna', fp * (1 - fr));
        add('lo', 'outer', -O - O * fq, -O, 'dna');
      }
      out.marks = {
        fA, fB, fC, cutUp, cutLo, telEnd,
        gap: !telomerase && fA > 0.5,
        shorter: !telomerase && fB > 0.5,
        added: fC >= 0.7,
        filled: fC >= 0.95,
      };
      return out;
    }

    // The circle: two forks meeting at x = 0, each one's last primer 4 nt short of the meeting point.
    add('up', 'outer', G.xMin, G.xMax, 'old');
    add('lo', 'outer', G.xMin, G.xMax, 'old');
    if (m.phase === 'before') return out;
    const left = { yStart: G.xMin - 30, yEnd: FORK_PAST, P0: -4, leadStop: 4, seed };
    const right = { yStart: -G.xMax - 30, yEnd: FORK_PAST, P0: -4, leadStop: 4, seed: seed + 5003 };
    const uu = m.phase === 'copying' ? u : 1;
    const sL = forkAt(left, uu);
    const sR = forkAt(right, uu);
    out.sepAt = m.phase === 'copying'
      ? (x) => G.sep * Math.max(smooth01((sL.yf - x) / FRONT_NT), smooth01((x + sR.yf) / FRONT_NT))
      : () => G.sep;
    // Each fork: [its state, direction, the copy its lagging strand is on, the copy its leading strand is on]
    const both = [[sL, 1, 'up', 'lo'], [sR, -1, 'lo', 'up']];
    for (const [st, dir, lagCopy, leadCopy] of both) {
      addY(leadCopy, 'inner', dir, (dir > 0 ? G.xMin : -G.xMax) - 1, st.leadEnd, 'dna');
      for (const f of st.frags) {
        addY(lagCopy, 'inner', dir, f.e, f.P - PRIMER_NT, 'dna');
        if (m.phase === 'copying') addY(lagCopy, 'inner', dir, Math.max(f.P - PRIMER_NT, f.e), f.P, 'rna');
        else {
          // Every gap has DNA beyond it, the last included: the other fork's leading strand.
          addY(lagCopy, 'inner', dir, f.P - PRIMER_NT * fA, f.P, 'dna');
          addY(lagCopy, 'inner', dir, f.P - PRIMER_NT, f.P - PRIMER_NT * fA, 'rna');
        }
      }
      if (m.phase === 'copying') {
        const x = dir * st.yf;
        const alpha = 1 - clamp((st.yf + 12) / 14, 0, 1);
        if (alpha > 0.02) out.forks.push({ x, dir, alpha });
        if (st.leadMoving) out.pols.push({ copy: leadCopy, x: dir * st.leadEnd });
        const working = st.frags.filter((f) => !f.done).pop();
        if (working) out.pols.push({ copy: lagCopy, x: dir * working.e });
      }
    }
    out.marks = { fA, meet: m.phase === 'after' ? fA > 0.5 : uu >= 1, sL, sR };
    return out;
  }

  function drawEnd() {
    const G = geom();
    const p = endPane;
    const lab = placer(p);
    const S = G.size;
    const { P, aOf, narrow } = G;
    const sc = scene(G);
    const sepAt = sc.sepAt;
    const cOf = (copy, role) => {
      if (copy === 'up') return role === 'outer' ? (x) => sepAt(x) / 2 + G.g / 2 : (x) => sepAt(x) / 2 - G.g / 2;
      return role === 'outer' ? (x) => -sepAt(x) / 2 - G.g / 2 : (x) => -sepAt(x) / 2 + G.g / 2;
    };
    const mid = (copy) => (x) => (copy === 'up' ? sepAt(x) / 2 : -sepAt(x) / 2);
    const at = (x, c) => P(aOf(x), c);

    const clipId = b.uid('ce-clip');
    const clip = el('clipPath', { id: clipId });
    p.rect(0, 0, G.w, G.hgt, {}, clip);
    p.add(clip);

    drawOverview(G, lab);

    const ticks = p.group({ 'clip-path': `url(#${clipId})` });
    const dna = p.group({ 'clip-path': `url(#${clipId})` });
    const proteinsUnder = p.group({ 'clip-path': `url(#${clipId})` });
    const strands = p.group({ 'clip-path': `url(#${clipId})` });
    const proteins = p.group({ 'clip-path': `url(#${clipId})` });

    const pts = (x0, x1, cFn, stepPx = 3) => {
      const lo = Math.max(x0, G.xMin - 2);
      const hi = Math.min(x1, G.xMax);
      const out = [];
      if (!(hi > lo)) return out;
      const n = Math.max(1, Math.ceil(((hi - lo) * G.s) / stepPx));
      for (let i = 0; i <= n; i += 1) {
        const x = lo + ((hi - lo) * i) / n;
        out.push(at(x, cFn(x)));
      }
      return out;
    };
    const dOf = (list) => list.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const stroke = (list, attrs, { reserve = true, parent = strands } = {}) => {
      if (list.length < 2) return;
      p.path(dOf(list), { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs }, parent);
      if (reserve) lab.reservePath(list, 3);
    };
    const OLD = { stroke: C.soft, 'stroke-width': narrow ? 1.5 : 1.7 };
    const NEW = { stroke: C.ink, 'stroke-width': narrow ? 2.4 : 2.7 };
    const RNA = { ...NEW, 'stroke-dasharray': '3.2 2.2', 'stroke-linecap': 'butt' };
    const GHOST = { stroke: C.faint, 'stroke-width': 1.5, 'stroke-dasharray': '1 3' };
    const STYLE = { old: OLD, dna: NEW, rna: RNA, ghost: GHOST };

    // ---- the strands: ghosts first, then the old strands, then the new ----
    for (const kind of ['ghost', 'old', 'dna', 'rna']) {
      for (const q of sc.pieces) {
        if (q.kind !== kind) continue;
        const attrs = { ...STYLE[kind], ...(q.alpha < 1 ? { 'stroke-opacity': q.alpha.toFixed(2) } : {}) };
        stroke(pts(q.x0, q.x1, cOf(q.copy, q.role)), attrs, { reserve: kind !== 'ghost' });
      }
    }

    // ---- the repeats: a tick for each TTAGGG, across a duplex or hanging from a single strand ----
    const present = (copy, role, x) => sc.pieces.some((q) => q.copy === copy && q.role === role && q.kind !== 'ghost' && q.alpha > 0.5 && x >= q.x0 - 1e-6 && x <= q.x1 + 1e-6);
    if (!G.circ) {
      let d = '';
      const seg = (x, c0, c1) => {
        const [xa, ya] = at(x, c0);
        const [xb, yb] = at(x, c1);
        d += `M${xa.toFixed(1)} ${ya.toFixed(1)}L${xb.toFixed(1)} ${yb.toFixed(1)}`;
      };
      const half = G.g * 0.55;
      for (let k = 0; ; k += 1) {
        const x = -(REPEAT_BP * k + REPEAT_BP / 2);
        if (x < G.xMin) break;
        const sp = sepAt(x);
        if (sp < 0.6) {
          const up = present('up', 'outer', x);
          const lo = present('lo', 'outer', x);
          if (up && lo) seg(x, G.g / 2, -G.g / 2);
          else if (up) seg(x, G.g / 2, G.g / 2 - half);
        } else if (sp > G.sep - 0.6) {
          for (const copy of ['up', 'lo']) {
            const o = present(copy, 'outer', x);
            const i = present(copy, 'inner', x);
            const co = cOf(copy, 'outer')(x);
            const ci = cOf(copy, 'inner')(x);
            if (o && i) seg(x, co, ci);
            else if (o) seg(x, co, co + Math.sign(ci - co) * half);
            else if (i) seg(x, ci, ci + Math.sign(co - ci) * half);
          }
        }
      }
      if (d) p.path(d, { stroke: C.faint, 'stroke-width': narrow ? 0.9 : 1 }, ticks);
    }

    // ---- the proteins ----
    const glyphs = [];
    const blob = (x, c, ra, rc, parent = proteins, alpha = 1) => {
      const [px, py] = at(x, c);
      const rx = narrow ? rc : ra;
      const ry = narrow ? ra : rc;
      p.ellipse(px, py, rx, ry, { ...PROTEIN, ...(alpha < 1 ? { opacity: alpha.toFixed(2) } : {}) }, parent);
      glyphs.push([px - rx, py - ry, px + rx, py + ry]);
    };
    const ringR = narrow ? 8 : clamp(G.tvH * 0.034, 9, 11);
    const helicases = [];
    for (const f of sc.forks) {
      // A ring of six round the lagging strand's template: the upper copy's for a fork running to the
      // tip, the lower copy's for one running the other way.
      const [x0, y0] = at(f.x, (f.dir > 0 ? 1 : -1) * G.g * 0.25);
      for (let i = 0; i < 6; i += 1) {
        const ang = (i / 6) * Math.PI * 2 + Math.PI / 6;
        p.circle(x0 + ringR * 0.7 * Math.cos(ang), y0 + ringR * 0.7 * Math.sin(ang), ringR * 0.42, { ...PROTEIN, ...(f.alpha < 1 ? { opacity: f.alpha.toFixed(2) } : {}) }, proteins);
      }
      glyphs.push([x0 - ringR - 1, y0 - ringR - 1, x0 + ringR + 1, y0 + ringR + 1]);
      if (f.alpha > 0.6) helicases.push(f);
    }
    const polRa = narrow ? 8 : 10;
    const polRc = narrow ? 6.5 : 8;
    for (const q of sc.pols) blob(q.x, mid(q.copy)(q.x), polRa, polRc);

    // Telomerase at the short copy's 3′ end, with the RNA template it carries paired along the end: its
    // 3′ five with the tail's last five, the six beyond them ahead of it.
    let telAt = null;
    const mk = sc.marks;
    if (!G.circ && m.phase === 'after' && telomerase && mk.fC > 0) {
      const xe = mk.telEnd;
      const cIn = cOf('lo', 'inner')(xe);
      const cOut = cOf('lo', 'outer')(xe);
      const rnaLen = Math.max(11, 16 / G.s);
      blob(xe + rnaLen * 0.1, (cIn + cOut) / 2, Math.max(13, (rnaLen * G.s) / 2 + 6), G.g * 0.5 + 6, proteinsUnder);
      stroke(pts(xe - 5, Math.min(xe + 6, 0), () => cOut), RNA, { parent: proteins });
      if (xe + 6 > 0) {
        // The template's far end, past the tip: drawn straight on from it.
        const [xa, ya] = at(0, cOut);
        const [xb, yb] = at(xe + 6, cOut);
        p.path(`M${xa.toFixed(1)} ${ya.toFixed(1)}L${xb.toFixed(1)} ${yb.toFixed(1)}`, RNA, proteins);
      }
      telAt = { x: xe, c: cOut };
    }

    for (const bx of glyphs) lab.reserve(...bx);

    // ---- marks: the last gap, the dimension of what the short copy lost, the repeats added ----
    const bracket = (x0, x1, c, side, parent = proteins) => {
      // A bracket drawn beside a stretch of strand, its feet towards it.
      const off = 5 * side;
      const foot = 3.5 * side;
      const [ax, ay] = at(x0, c + off + foot);
      const [bx, by] = at(x0, c + off);
      const [cx, cy] = at(x1, c + off);
      const [dx, dy] = at(x1, c + off + foot);
      p.path(`M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}L${cx.toFixed(1)} ${cy.toFixed(1)}L${dx.toFixed(1)} ${dy.toFixed(1)}`, { fill: 'none', stroke: C.ink, 'stroke-width': 1.1 }, parent);
      lab.reserve(Math.min(ax, dx, bx, cx) - 1, Math.min(ay, dy, by, cy) - 1, Math.max(ax, dx, bx, cx) + 1, Math.max(ay, dy, by, cy) + 1);
    };
    const dimension = (x0, x1, c) => {
      const [ax, ay] = at(x0, c);
      const [bx2, by2] = at(x1, c);
      const t = 3.5;
      const tick = (x, y) => (narrow ? `M${(x - t).toFixed(1)} ${y.toFixed(1)}H${(x + t).toFixed(1)}` : `M${x.toFixed(1)} ${(y - t).toFixed(1)}V${(y + t).toFixed(1)}`);
      p.path(`M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx2.toFixed(1)} ${by2.toFixed(1)}${tick(ax, ay)}${tick(bx2, by2)}`, { fill: 'none', stroke: C.ink, 'stroke-width': 1.1 }, proteins);
      lab.reserve(Math.min(ax, bx2) - 4, Math.min(ay, by2) - 4, Math.max(ax, bx2) + 4, Math.max(ay, by2) + 4);
    };

    // The inset of letters, reserved before the labels so they keep clear of it.
    if (!G.circ && m.phase === 'after' && telomerase && mk.fC > 0) drawInset(G, lab, mk.fC, telAt);

    // ---- the labels, most important first ----
    // Candidate spots on one side of a point: `side` +1 is towards the lagging strand's copy (above, or
    // to the left on a phone), −1 towards the leading strand's; `shifts` slide it along the DNA, in px.
    const around = (x, c, side, { offs = [12, 24, 36], shifts = [0, 18, -18, 36, -36, 54, -54] } = {}) => {
      const out = [];
      const [px, py] = at(x, c);
      for (const off of offs) {
        for (const sh of shifts) {
          if (!narrow) out.push([px + sh, side > 0 ? py - off : py + off + S * 0.72, 'middle']);
          else out.push([side > 0 ? px - off : px + off, py + sh + S * 0.35, side > 0 ? 'end' : 'start']);
        }
      }
      return out;
    };
    const place = (cands, str, size = S) => lab.place(cands, str, { size });
    const O = G.O;
    const upOut = cOf('up', 'outer');
    const loOut = cOf('lo', 'outer');
    const upIn = cOf('up', 'inner');
    const loIn = cOf('lo', 'inner');
    const endMark = (x, c, str, side) => {
      // A strand's end, named beyond it: past the tip, or beside it.
      const [px, py] = at(x, c);
      if (!narrow) lab.place([[px + 5, py + 4, 'start'], [px + 4, py + (side > 0 ? -6 : 13), 'start'], [px - 2, py + (side > 0 ? -8 : 16), 'middle']], str, { size: S * 0.95 });
      else lab.place([[px, py + 13, 'middle'], [px + (side > 0 ? -6 : 6), py + 8, side > 0 ? 'end' : 'start'], [px + (side > 0 ? -8 : 8), py + 2, side > 0 ? 'end' : 'start']], str, { size: S * 0.95 });
    };

    if (senescentNow() && m.phase === 'after') {
      const words = narrow ? 'The cell has stopped' : 'The cell has stopped dividing';
      const spots = narrow ? [[G.w - 6, G.tvTop + 12, 'end']] : [[8, G.tvTop + 14, 'start'], [8, G.tvBot - 6, 'start']];
      lab.place(spots, words.toUpperCase(), { size: narrow ? 9 : S * 0.92, cls: 'ce-caps' });
    }

    if (G.circ) {
      drawCircleLabels();
      return;
    }

    if (m.phase === 'before') {
      endMark(0, upOut(0), '3′', 1);
      endMark(-O, loOut(-O), '5′', -1);
      const tailWords = narrow ? `tail, ${O} nt` : `single-stranded tail, ${O} nt`;
      place(around(-O / 2, upOut(-O / 2), 1, { offs: [11, 22, 33], shifts: [0, -20, 20, -40] }), tailWords);
      const xr = G.xMin + (0 - G.xMin) * 0.45;
      place(around(xr, loOut(xr), -1, { offs: [12, 24, 36], shifts: [0, -40, 40, -80] }), narrow ? 'TTAGGG, one tick each' : 'TTAGGG repeats, one tick each');
      place(around(xr, upOut(xr), 1, { offs: [12, 24, 36], shifts: [0, -40, 40, -80] }), narrow ? 'telomere' : 'the telomere, its last few hundred base pairs');
      return;
    }

    if (m.phase === 'copying') {
      for (const f of helicases) place(around(f.x + 8, upOut(f.x + 8), 1, { offs: [14, 26, 38], shifts: [10, 26, -6, 42] }), 'fork');
      const leadX = clamp((G.xMin + mk.stLead) / 2, G.xMin + 40, -O - 20);
      if (mk.stLead > G.xMin + 60) place(around(leadX, loOut(leadX), -1, { offs: [11, 22, 33], shifts: [0, -30, 30, -60] }), 'leading strand');
      const lagFrags = mk.frags.filter((f) => f.e < f.P - PRIMER_NT - 20);
      if (lagFrags.length) {
        const f = lagFrags[Math.max(0, lagFrags.length - 2)];
        const lx = clamp((f.e + f.P) / 2, G.xMin + 30, -20);
        place(around(lx, upOut(lx), 1, { offs: [11, 22, 33], shifts: [0, -30, 30, -60] }), 'lagging strand');
      }
      if (m.u >= 1) {
        endMark(-O, loIn(-O), '3′', -1);
        place(around(-O, loOut(-O) - 2, -1, { offs: [12, 24, 36], shifts: [-10, -40, 20, -70] }), narrow ? 'runs off the end' : 'leading strand runs off the end');
        if (mk.last) place([...around(-5, upIn(-5) - 2, -1, { offs: [11, 22, 33], shifts: [-20, -50, 0, -80] }), ...around(-5, upOut(-5), 1, { offs: [11, 22, 33], shifts: [-30, -60, -90] })], narrow ? 'last primer' : 'last fragment, on a primer at the tip');
        endMark(0, upOut(0), '3′', 1);
      } else if (mk.newest) {
        const f = mk.newest;
        const x = f.P - PRIMER_NT / 2;
        place([...around(x, upIn(x) - 2, -1, { offs: [10, 20, 30], shifts: [0, -14, 14, -28] }), ...around(x, upOut(x), 1, { offs: [11, 22], shifts: [-10, -30, 10] })], 'RNA primer');
      }
      return;
    }

    // After.
    if (mk.gap) {
      bracket(-PRIMER_NT, 0, upIn(-5), -1);
      place([...around(-5, upIn(-5) - 8, -1, { offs: [9, 19, 29], shifts: [-20, -60, -100, 0] }), ...around(-5, upOut(-5), 1, { offs: [12, 24], shifts: [-40, -80] })], narrow ? 'last gap: nothing beyond' : 'last primer’s gap: nothing beyond it to fill it');
    }
    if (mk.shorter) {
      const c = loOut(-O / 2) - 7;
      dimension(-O, 0, c);
      place(around(-O / 2, c - 2, -1, { offs: [11, 22, 33], shifts: [0, -20, -40, 20] }), `${O} bp shorter`);
    }
    if (mk.added) {
      bracket(-O, 0, loOut(-O / 2) - 3, -1);
      const n = Math.floor(O / REPEAT_BP);
      place(around(-O / 2, loOut(-O / 2) - 12, -1, { offs: [11, 22, 33], shifts: [0, -20, -40, 20] }), narrow ? `+${n} repeats` : `${n} repeats added, and a part`);
    }
    if (telAt) place([...around(telAt.x, telAt.c - 6, -1, { offs: [12, 24, 36], shifts: [-30, -60, 0, -90] })], 'telomerase');
    if (mk.filled) place(around(-O * 1.5, loOut(-O * 1.5), -1, { offs: [11, 22, 33], shifts: [0, -20, 20, -40] }), 'filled in');
    if (mk.fB > 0.5) {
      const xt = (mk.cutLo + -O) / 2;
      if (!mk.filled) place(around(xt, loOut(xt), -1, { offs: [11, 22, 33], shifts: [0, -24, 24, -48] }), narrow ? 'trimmed' : 'trimmed to leave a tail');
      const xu = (mk.cutUp - PRIMER_NT) / 2;
      place([...around(xu, upIn(xu) - 2, -1, { offs: [10, 20, 30], shifts: [0, -24, 24, -48] })], 'trimmed');
    }
    const nameX = G.xMin + (0 - G.xMin) * 0.3;
    place(around(nameX, upOut(nameX), 1, { offs: [12, 24, 36], shifts: [0, -40, 40, -80] }), narrow ? 'lagging copy' : 'copied by the lagging strand');
    place(around(nameX, loOut(nameX), -1, { offs: [12, 24, 36], shifts: [0, -40, 40, -80] }), narrow ? 'leading copy' : 'copied by the leading strand');
    endMark(0, upOut(0), '3′', 1);
    endMark(telomerase && mk.fC > 0 ? mk.telEnd : -O, loIn(-O), '3′', -1);
    const tailX = -O / 2;
    place(around(tailX, upOut(tailX), 1, { offs: [11, 22, 33], shifts: [0, -24, 24, -48] }), `tail, ${O} nt`);

    function drawCircleLabels() {
      const aM = at(0, 0);
      if (m.phase === 'before') {
        const [px, py] = aM;
        p.path(narrow ? `M${(px - G.g * 1.6).toFixed(1)} ${py.toFixed(1)}H${(px + G.g * 1.6).toFixed(1)}` : `M${px.toFixed(1)} ${(py - G.g * 1.6).toFixed(1)}V${(py + G.g * 1.6).toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, proteins);
        place(around(0, upOut(0), 1, { offs: [14, 26], shifts: [0] }), narrow ? 'where the forks meet' : 'the far side, where the two forks will meet');
        place(around(G.xMin + 40, loOut(G.xMin + 40), -1, { offs: [12, 24], shifts: [0, 20, 40] }), narrow ? 'from the origin' : 'from the origin, one way round');
        place(around(G.xMax - 40, loOut(G.xMax - 40), -1, { offs: [12, 24], shifts: [0, -20, -40] }), narrow ? 'the other way' : 'from the origin, the other way');
        return;
      }
      for (const f of helicases) place(around(f.x, f.dir > 0 ? upOut(f.x) : loOut(f.x), f.dir > 0 ? 1 : -1, { offs: [14, 26, 38], shifts: [0, -16 * f.dir, 16 * f.dir] }), 'fork');
      if (m.phase === 'copying' && m.u < 1) {
        place(around(G.xMin + 70, loOut(G.xMin + 70), -1, { offs: [11, 22], shifts: [0, 20, 40] }), 'leading');
        place(around(G.xMin + 70, upOut(G.xMin + 70), 1, { offs: [11, 22], shifts: [0, 20, 40] }), 'lagging');
        place(around(G.xMax - 70, upOut(G.xMax - 70), 1, { offs: [11, 22], shifts: [0, -20, -40] }), 'leading');
        place(around(G.xMax - 70, loOut(G.xMax - 70), -1, { offs: [11, 22], shifts: [0, -20, -40] }), 'lagging');
        return;
      }
      const words = m.phase === 'after'
        ? (narrow ? 'filled from the other fork' : 'last gap, filled from the other fork’s leading strand')
        : (narrow ? 'last primer' : 'last primer, just short of the meeting point');
      place([...around(-9, upOut(-9), 1, { offs: [12, 24, 36], shifts: [0, -30, 30, -60, 60] })], words);
      place([...around(9, loOut(9), -1, { offs: [12, 24, 36], shifts: [0, 30, -30, 60, -60] })], words);
      place(around(G.xMin + 60, upOut(G.xMin + 60), 1, { offs: [12, 24], shifts: [0, 20, 40] }), narrow ? 'copy 1' : 'one copy');
      place(around(G.xMin + 60, loOut(G.xMin + 60), -1, { offs: [12, 24], shifts: [0, 20, 40] }), narrow ? 'copy 2' : 'the other copy');
    }
  }

  // The whole telomere, drawn small along the top: the rest of the chromosome, the repeats to their
  // length now, what has been lost as a ghost, the length at which the cell stops, and a bracket on the
  // stretch the view below enlarges. On a circle, the circle, and where its forks meet.
  function drawOverview(G, lab) {
    const p = endPane;
    const { ov, narrow } = G;
    const S = narrow ? 9.6 : clamp(G.size - 0.5, 9.8, 11);
    const yO = ov.top + ov.h * (narrow ? 0.46 : 0.5);
    const tvCorners = () => {
      if (narrow) return null;
      return [[G.aOf(G.xMin), G.tvTop - 2], [G.aOf(G.xMax), G.tvTop - 2]];
    };
    if (G.circ) {
      const r = Math.max(12, ov.h * (narrow ? 0.34 : 0.32));
      const cx = ov.x0 + r + 4;
      const cy = yO;
      p.circle(cx, cy, r + 2, { fill: 'none', stroke: C.soft, 'stroke-width': 1.3 });
      p.circle(cx, cy, r - 2, { fill: 'none', stroke: C.soft, 'stroke-width': 1.3 });
      p.path(`M${cx.toFixed(1)} ${(cy - r - 6).toFixed(1)}V${(cy - r + 5).toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.4 });
      const by = cy + r + 5;
      p.path(`M${(cx - 7).toFixed(1)} ${(by - 2).toFixed(1)}V${by.toFixed(1)}H${(cx + 7).toFixed(1)}V${(by - 2).toFixed(1)}`, { fill: 'none', stroke: C.ink, 'stroke-width': 1.1 });
      lab.reserve(cx - r - 7, cy - r - 7, cx + r + 7, by + 2);
      const corners = tvCorners();
      if (corners) {
        p.path(`M${(cx - 7).toFixed(1)} ${by.toFixed(1)}L${corners[0][0].toFixed(1)} ${corners[0][1].toFixed(1)}M${(cx + 7).toFixed(1)} ${by.toFixed(1)}L${corners[1][0].toFixed(1)} ${corners[1][1].toFixed(1)}`, { stroke: C.faint, 'stroke-width': 0.8, 'stroke-dasharray': '2 3' });
      }
      const tx = cx + r + 14;
      lab.place([[tx, cy - (narrow ? 3 : 5), 'start']], narrow ? 'A circle: no ends to copy' : 'A circular chromosome: no ends to copy', { size: S });
      lab.place([[tx, cy + (narrow ? 11 : 12), 'start']], narrow ? 'enlarged: where the forks meet' : 'enlarged below: the far side, where its two forks meet', { size: S * 0.95 });
      lab.place([[cx, cy - r - 9, 'middle'], [cx + 14, cy - r + 2, 'start']], 'origin', { size: S * 0.92 });
      return;
    }
    const total = INTERIOR_BP + START_BP;
    const k = (ov.x1 - ov.x0) / total;
    const X = (bp) => ov.x0 + bp * k;
    const T = telomereNow();
    const xB = X(INTERIOR_BP);
    const xT = X(INTERIOR_BP + T);
    const xS = X(INTERIOR_BP + START_BP);
    const xTh = X(INTERIOR_BP + THRESHOLD_BP);
    const half = narrow ? 2.4 : 3;
    p.path(`M${ov.x0} ${(yO - half).toFixed(1)}H${xB.toFixed(1)}M${ov.x0} ${(yO + half).toFixed(1)}H${xB.toFixed(1)}`, { stroke: C.soft, 'stroke-width': 1.4, fill: 'none' });
    let hatch = '';
    for (let x = xB + 1.5; x < xT - 0.5; x += narrow ? 2.6 : 3) hatch += `M${x.toFixed(1)} ${(yO - half).toFixed(1)}V${(yO + half).toFixed(1)}`;
    if (hatch) p.path(hatch, { stroke: C.faint, 'stroke-width': 0.8 });
    p.path(`M${xB.toFixed(1)} ${(yO - half).toFixed(1)}H${xT.toFixed(1)}M${xB.toFixed(1)} ${(yO + half).toFixed(1)}H${xT.toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.5, fill: 'none' });
    if (xS - xT > 0.8) p.path(`M${xT.toFixed(1)} ${yO.toFixed(1)}H${xS.toFixed(1)}`, { stroke: C.faint, 'stroke-width': 1.5, 'stroke-dasharray': '1 3' });
    p.path(`M${xTh.toFixed(1)} ${(yO - 10).toFixed(1)}V${(yO + 10).toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.2, 'stroke-dasharray': '3 2' });
    lab.reserve(ov.x0, yO - half - 2, Math.max(xS, xT) + 2, yO + half + 2);
    lab.reserve(xTh - 2, yO - 11, xTh + 2, yO + 11);
    // The stretch enlarged below: the last `span` nt of the end the division started from.
    const xA = X(INTERIOR_BP + m.T0);
    const xZ = Math.min(xA - 6, X(INTERIOR_BP + m.T0 - G.span));
    const by = yO + half + 7;
    p.path(`M${xZ.toFixed(1)} ${(by - 3).toFixed(1)}V${by.toFixed(1)}H${xA.toFixed(1)}V${(by - 3).toFixed(1)}`, { fill: 'none', stroke: C.ink, 'stroke-width': 1.1 });
    lab.reserve(xZ - 1, by - 4, xA + 1, by + 1);
    const corners = tvCorners();
    if (corners) {
      p.path(`M${xZ.toFixed(1)} ${by.toFixed(1)}L${corners[0][0].toFixed(1)} ${corners[0][1].toFixed(1)}M${xA.toFixed(1)} ${by.toFixed(1)}L${corners[1][0].toFixed(1)} ${corners[1][1].toFixed(1)}`, { stroke: C.faint, 'stroke-width': 0.8, 'stroke-dasharray': '2 3' });
    }
    const above = yO - half - 6;
    const below = yO + half + 6 + S * 0.8;
    lab.place([[ov.x0, above, 'start']], narrow ? 'rest of the chromosome' : 'the rest of the chromosome', { size: S * 0.92 });
    lab.place([[(xB + xT) / 2, above, 'middle'], [xB + 6, above, 'start']], narrow ? `telomere, ${nt(T)} bp` : `the telomere, ${nt(T)} bp of repeats`, { size: S });
    lab.place([[xTh, below + 2, 'middle'], [xTh - 4, below + 2, 'end'], [xTh + 4, below + 2, 'start']], `the cell stops at ${nt(THRESHOLD_BP)} bp`, { size: S * 0.92 });
    const lostBp = START_BP - T;
    if (lostBp > 0) lab.place([[(xT + xS) / 2, above, 'middle'], [xS, above, 'end'], [xS, below + 2, 'end']], `lost ${nt(lostBp)} bp`, { size: S * 0.92 });
    if (narrow) lab.place([[xA, below + 2 + S * 1.2, 'end'], [xZ - 4, below + 2, 'end']], 'the tip, enlarged below', { size: S * 0.92 });
  }

  // The letters telomerase copies: the tail's 3′ end over the RNA template it carries, paired, a repeat
  // added, the enzyme shifted six along, and the next repeat added. `phase` is the telomerase beat's
  // share done; the pairs are drawn as pegs in the colours of their bases.
  function drawInset(G, lab, phase, telAt) {
    const p = endPane;
    const narrow = G.narrow;
    const lead = narrow ? 1 : 5;
    const cols = lead + RNA_TEMPLATE.length;
    const S = narrow ? 9.6 : 10.5;
    const cw = narrow ? 8.8 : 10.2;
    const padL = narrow ? 30 : 36;
    const padR = narrow ? 14 : 18;
    const boxW = padL + cols * cw + padR;
    const rowGap = narrow ? 20 : 22;
    let x0;
    let y0;
    if (!narrow) {
      const [, yLo] = G.P(G.aOf(0), -G.sep / 2 - G.g / 2);
      x0 = G.w - 8 - boxW;
      y0 = yLo + 44;
    } else {
      x0 = G.w - 4 - boxW;
      y0 = G.aHi - 66;
    }
    const col = (i) => x0 + padL + (i + 0.5) * cw;
    const yD = y0 + S;
    const yR = yD + rowGap;
    // The tape of the DNA's 3′ end: what was there, and two repeats' worth of what is added to it.
    const init = 'TTAGGGTTAG'.slice(10 - (lead + 5));
    const tape = `${init}GGTTAGGGTTAG`;
    const n1 = Math.min(6, Math.floor((6 * phase) / 0.4 + 1e-9));
    const shift = 6 * smooth01((phase - 0.4) / 0.2);
    const n2 = phase <= 0.6 ? 0 : Math.min(6, Math.floor((6 * (phase - 0.6)) / 0.4 + 1e-9));
    const shown = init.length + n1 + n2;
    const pegs = shift === 0 || shift === 6;
    const pegPath = { D: {}, R: {} };
    for (let i = 0; i < shown; i += 1) {
      const c = i - shift;
      if (c < -0.5) continue;
      const base = tape[i];
      const isNew = i >= init.length;
      p.text(col(c), yD, base, { anchor: 'middle', 'font-size': S.toFixed(1), 'font-weight': isNew ? 700 : 500, style: `fill:${C.ink}`, ...(c < 0 ? { opacity: (c + 1).toFixed(2) } : {}) });
      const j = Math.round(c) - lead;
      if (pegs && j >= 0 && j < RNA_TEMPLATE.length) {
        const r = RNA_TEMPLATE[j];
        const x = col(Math.round(c)).toFixed(1);
        const yMidPeg = (yD + 3 + yR - S * 0.78) / 2;
        (pegPath.D[base] ??= []).push(`M${x} ${(yD + 3).toFixed(1)}V${yMidPeg.toFixed(1)}`);
        (pegPath.R[r] ??= []).push(`M${x} ${yMidPeg.toFixed(1)}V${(yR - S * 0.78).toFixed(1)}`);
      }
    }
    for (const side of ['D', 'R']) {
      for (const [base, ds] of Object.entries(pegPath[side])) p.path(ds.join(''), { stroke: BASE_COLOUR[base], 'stroke-width': 2.4, 'stroke-linecap': 'butt' });
    }
    for (let j = 0; j < RNA_TEMPLATE.length; j += 1) p.text(col(lead + j), yR, RNA_TEMPLATE[j], { anchor: 'middle', 'font-size': S.toFixed(1), 'font-weight': 500, style: `fill:${C.ink}` });
    // The RNA's backbone, dashed as every RNA in the figure is, under its letters.
    p.path(`M${(col(lead) - cw / 2).toFixed(1)} ${(yR + 4).toFixed(1)}H${(col(cols - 1) + cw / 2).toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.6, 'stroke-dasharray': '3.2 2.2' });
    const endS = S * 0.9;
    p.text(x0 + padL - 3, yD, '5′ ···', { anchor: 'end', 'font-size': endS.toFixed(1), style: `fill:${C.ink}` });
    const lastCol = shown - 1 - shift;
    p.text(col(lastCol) + cw * 0.6, yD, '3′', { anchor: 'start', 'font-size': endS.toFixed(1), style: `fill:${C.ink}` });
    p.text(col(lead) - cw * 0.65, yR, '3′', { anchor: 'end', 'font-size': endS.toFixed(1), style: `fill:${C.ink}` });
    p.text(col(cols - 1) + cw * 0.6, yR, '5′', { anchor: 'start', 'font-size': endS.toFixed(1), style: `fill:${C.ink}` });
    const yC1 = yR + S + 6;
    const yC2 = yC1 + S + 2;
    p.text(x0 + padL, yC1, narrow ? 'its RNA template' : 'telomerase’s RNA template', { 'font-size': (S * 0.92).toFixed(1), style: `fill:${C.ink}` });
    p.text(x0 + padL, yC2, narrow ? 'adds a repeat, shifts 6' : 'adds a repeat, shifts six along, adds another', { 'font-size': (S * 0.92).toFixed(1), style: `fill:${C.ink}` });
    lab.reserve(x0 - 2, y0 - 2, x0 + boxW + 2, yC2 + 4);
    // A leader from the enzyme at the tip to its letters.
    if (telAt) {
      const [tx, ty] = G.P(G.aOf(telAt.x), telAt.c);
      const lx = narrow ? x0 - 2 : col(lead + 3);
      const ly = narrow ? yD - S * 0.4 : y0 - 4;
      p.path(`M${tx.toFixed(1)} ${ty.toFixed(1)}L${lx.toFixed(1)} ${ly.toFixed(1)}`, { stroke: C.faint, 'stroke-width': 0.8, 'stroke-dasharray': '2 3' });
    }
  }

  function drawTable() {
    const { w, h: hgt } = table.box;
    const st = state();
    const rows = shape === 'circular'
      ? [
        ['Divisions', String(st.divisions)],
        ['Phase', PHASE_WORDS[st.phase]],
        ['Ends', 'none: a circle'],
        ['Lost last division', '0 bp'],
        ['Divisions left', 'no limit'],
      ]
      : [
        ['Divisions', String(st.divisions)],
        ['Phase', PHASE_WORDS[st.phase]],
        ['Telomere', `${nt(st.telomereBp)} bp`],
        ['Lost last division', `${nt(st.lostLastDivisionBp)} bp`],
        ['Tail', `${st.overhangNt} nt`],
        ['Stops at', `${nt(THRESHOLD_BP)} bp`],
        ['Divisions left', st.divisionsLeft === null ? 'no limit' : String(st.divisionsLeft)],
        ['Repeats added', nt(st.repeatsAdded)],
      ];
    const words = noteWords(st);
    const title = shape === 'circular' ? 'A circular chromosome' : 'At the tip';
    if (!b.narrow) {
      const size = clamp(Math.max(w * 0.04, hgt * 0.033), 9.6, 11.6);
      table.readout({ title, x: 6, width: Math.min(w - 8, 320), size, minRow: 14, maxRow: 26 }).fit(hgt, (t, level) => {
        for (const [k, v] of rows) t.row(k, v);
        if (level < 1) t.note(words, { size: size - 0.6 });
      }, { levels: 2 });
      return;
    }
    // Narrow: the rows in two columns, the sentence under them at full width.
    const size = 10;
    const colW = (w - 14) / 2;
    const noteT = table.readout({ x: 0, width: w, size });
    noteT.note(words, { size: 9.4 });
    const into = Math.max(60, hgt - noteT.height(14) - 2);
    const half = Math.ceil(rows.length / 2);
    const left = table.readout({ title, x: 0, width: colW, size, minRow: 13, maxRow: 20 });
    for (const [k, v] of rows.slice(0, half)) left.row(k, v);
    const bl = left.fill(into);
    const right = table.readout({ title: shape === 'circular' ? 'Its copies' : 'The count', x: colW + 14, width: colW, size, minRow: 13, maxRow: 20 });
    for (const [k, v] of rows.slice(half)) right.row(k, v);
    const br = right.fill(into);
    const noteAt = table.readout({ x: 0, y: Math.max(bl, br) + 2, width: w, size });
    noteAt.note(words, { size: 9.4 });
    noteAt.draw(14, hgt - Math.max(bl, br) - 2);
  }

  // describe() — what the gates and any task read. The frame adds id, kind, number and state; the bench
  // adds layout. The computed fields are the ones worth asserting:
  //   phase               'before' | 'copying' | 'after', within the division on show
  //   divisions           completed; the division on show counts once it reaches 'after'
  //   telomereBp          the average end's telomere now: 10,000 less the loss at each division
  //   startBp             10,000, the length it opens at
  //   lossPerDivisionBp   the setting, 25–100
  //   lostLastDivisionBp  computed: in 'after', what this division took from the average end; before
  //                       and during copying, what the last completed division took. 0 with telomerase
  //                       on or on a circle
  //   gapAtEnd            computed: true in 'after' on a linear chromosome without telomerase
  //   overhangNt          the tail, twice the loss; 0 on a circle
  //   telomerase          the setting
  //   repeatsAdded        whole repeats telomerase has added since the reset
  //   shape               'linear' | 'circular'
  //   senescent           computed: the telomere is at or below 7,500 bp, and the cell has stopped
  //   divisionsLeft       computed from the length, the threshold and the loss; null with telomerase on
  //                       or on a circle
  //   thresholdBp         7,500, the model's stop
  //   t, playing          the clock, in seconds to three decimals, and whether it runs
  return b.handle();
}
