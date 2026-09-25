// Couple it, or merely put it nearby.
//
// WHAT IS ON THE STAGE. Two scenes over one claim.
//
// The BENCH scene is three regions: an uphill job, a source of free energy, and between them the one
// thing that decides whether anything happens — whether the two are joined through a shared
// intermediate or merely standing in the same drop of cytoplasm. Coupled, the intermediate is drawn
// forming and being consumed and the job gets done. Uncoupled, the source is spent at exactly the same
// rate, the job does not move, and the heat readout climbs with everything that was spent. The figure
// opens UNCOUPLED, with a job and a source chosen and nothing running, so the reader's first press
// produces the failure §5.4 warns about.
//
// The PUMP scene works chapter 4's own numbers as a ledger: the four ion concentrations and the membrane
// voltage on sliders, the cost of three sodium out and two potassium in worked term by term, and the
// margin against what one ATP is worth drawn as a bar. Push the gradients steep enough and the margin
// turns positive, the pump reverses and starts making ATP — §5.4's closing claim and chapter 7's opening
// one. CHAPTER 7 IS EXPECTED TO ASK FOR THIS SCENE: it is reached by `scene: 'pump'` alone, so a later
// chapter mounts this kind and presses one control rather than keeping a copy of it.
//
// THE THREE SENTENCES THIS FIGURE MUST NOT CONTRADICT (chapter brief): breaking a bond always costs
// energy; an enzyme changes no equilibrium; heat released nearby does no work. The third is this
// figure's own, and it is why `heatKj` counts only what the UNCOUPLED transactions produced and why the
// heat line says that heat cannot be spent again.
//
// THE NUMBERS, every one of them on the page of §5.3/§5.4 or worked from a figure that is.
//   jobs      glutamate + ammonia -> glutamine   +14.2  (§5.4, the worked case)
//             three Na+ out of a cell            +39.6  (§5.4's table, the sodium row)
//             one 8 nm step along a microtubule  +24.1  (5 pN of load over 8 nm: 5e-12 N x 8e-9 m
//                                                        x 6.022e23 = 2.41e4 J/mol. §3.6's step length,
//                                                        and the stall force measured for kinesin.)
//             join two glucose monomers          +15.5  (maltose hydrolysis is -15.5 kJ/mol, so §2.6's
//                                                        condensation costs the same uphill)
//   sources   ATP -> ADP + Pi                    -30.5  (§5.3, standard state)
//             creatine phosphate                 -43.0  (§5.3's ladder)
//             one Na+ falling in                 -13.2  (§5.4's table: +39.6 for three ions out, so
//                                                        13.2 for one, and a fall in returns it)
//   pump      RT = 2.577 kJ/mol at 37 C; F = 0.096485 kJ/(mol.mV). Chapter 4's values — Na 145 out and
//             12 in, K 140 in and 4 out, -70 mV inside — give +39.5 and +4.8, total +44.3, against the
//             -50.1 an ATP is worth at cellular concentrations (§5.3's own arithmetic: -30.5 + RT ln
//             (5e-4) = -30.5 - 19.6). The prose's table rounds those to +39.6, +4.8, +44.4 and -50.
//
// COMPOSITION. Two panes, and the drawing is the larger of them. Wide: the bench across a left column
// with the ledger beside it. Narrow (below 620 px of stage width or 330 px of height): the three regions
// re-stack — the job above, the source below, the intermediate and the sum between them where the eye
// already is — and the ledger takes a full-width row beneath, where it is already a typographic table
// and needs no second form, though it sheds its two section heads and half its prose to fit. Each
// region's drawing is laid along the region's OWN long axis, so the same drawing reads in a tall narrow
// column at desktop width and in a short wide band on a phone; a drawing with one fixed axis leaves
// the other half of its region empty, which is this chapter's opening composition failure.
//
// WHAT THE BENCH COULD NOT DO, recorded rather than worked around. (1) It has no stepper, so the pump
// scene's five sliders stay sliders on a phone and wrap onto two toolbar rows rather than becoming the
// one row of steppers the brief imagined. (2) `readout.note()` draws one <text> line and does not wrap,
// so the sentences below are broken into lines here, against the pane's own width.
import { C, el, tint, clamp } from './lib/svg.js';
import { atom, INK, round } from './lib/mol-draw.js';
import { signed, hash2 } from './lib/chem-atoms.js';
import { metabolismPart, membranePart, ORGANELLE_BY_ID } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = {
  kind: 'coupling-bench',
  title: 'Couple it, or merely put it nearby',
  needsWebGL: false,
  aspect: 16 / 9,
  narrowAspect: 4 / 5,
};

// ---------------------------------------------------------------- the model

const RT = 2.577; // kJ/mol at 37 C
const F_KJ_PER_MV = 0.096485; // Faraday's constant, kJ per mol per millivolt
const ATP_STANDARD = -30.5;
const ATP_CELLULAR = -50.1; // -30.5 + RT ln(5e-4), which is §5.3's own arithmetic
const TX_SECONDS = 1.6; // one transaction on the bench, at the stage's own pace

const JOBS = [
  {
    id: 'glutamine',
    label: 'Glutamine',
    name: 'Join glutamate to ammonia',
    kj: 14.2,
    intermediate: 'glutamyl phosphate',
    kindOfWork: 'chemical work',
  },
  {
    id: 'sodium',
    label: 'Sodium',
    name: 'Push three Na⁺ out of a cell',
    kj: 39.6,
    intermediate: 'the phosphorylated pump',
    kindOfWork: 'transport work',
  },
  {
    id: 'motor-step',
    label: 'Motor step',
    name: 'Step 8 nm along a microtubule',
    kj: 24.1,
    intermediate: 'the nucleotide in the motor',
    kindOfWork: 'mechanical work',
  },
  {
    id: 'polymer',
    label: 'Chain',
    name: 'Join two monomers into a chain',
    kj: 15.5,
    intermediate: 'the phosphorylated monomer',
    kindOfWork: 'chemical work',
  },
];
const JOB_BY_ID = Object.fromEntries(JOBS.map((j) => [j.id, j]));

const SOURCES = [
  { id: 'atp', label: 'ATP', name: 'ATP', kj: ATP_STANDARD, note: 'the currency, at the standard state' },
  { id: 'creatine-phosphate', label: 'Creatine', name: 'Creatine phosphate', kj: -43.0, note: 'one rung above ATP' },
  { id: 'sodium-gradient', label: 'Gradient', name: 'One Na⁺ falling in', kj: -13.2, note: 'the sodium gradient chapter 4 built' },
  { id: 'none', label: 'None', name: 'Nothing', kj: 0, note: 'no source at all' },
];
const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

const PUMP_KEYS = ['naInsideMM', 'naOutsideMM', 'kInsideMM', 'kOutsideMM', 'potentialMv'];
// Chapter 4's own figures.
const PUMP_DEFAULTS = { naInsideMM: 12, naOutsideMM: 145, kInsideMM: 140, kOutsideMM: 4, potentialMv: -70 };
const STALL_BAND = 1.0; // kJ/mol either side of zero that reads as stalled rather than as a direction

// One cycle of the pump, term by term. Concentration work is RT ln(to ÷ from); electrical work is zF
// times the potential the ion arrives at minus the one it left.
function pumpTerms(s) {
  const naIn = Math.max(0.1, s.naInsideMM);
  const naOut = Math.max(0.1, s.naOutsideMM);
  const kIn = Math.max(0.1, s.kInsideMM);
  const kOut = Math.max(0.1, s.kOutsideMM);
  const naChem = 3 * RT * Math.log(naOut / naIn);
  const naElec = 3 * -F_KJ_PER_MV * s.potentialMv;
  const kChem = 2 * RT * Math.log(kIn / kOut);
  const kElec = 2 * F_KJ_PER_MV * s.potentialMv;
  const naCostKj = naChem + naElec;
  const kCostKj = kChem + kElec;
  return { naChem, naElec, kChem, kElec, naCostKj, kCostKj, cycleCostKj: naCostKj + kCostKj };
}

// ---------------------------------------------------------------- style
//
// This figure's own marks only. The grid, the panes, the toolbar's groups and divider, the primary
// mark, the two-width labels and the readout's register are the bench's and live in components.css.

const NARROW_W = 620;
const NARROW_H = 330;

const CSS = `
.tb-coupling-bench .cb-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.09em; }
.tb-coupling-bench .cb-name { fill: var(--ink); font-weight: 600; }
.tb-coupling-bench .cb-note { fill: var(--ink-faint); }
.tb-coupling-bench .cb-num { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-coupling-bench .cb-sym { font-weight: 700; }
.tb-coupling-bench .cb-axis { fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
`;

const ATP = metabolismPart('atp');
const ENZYME = metabolismPart('enzyme');
const GLUCOSE = membranePart('glucose');
const HEAD = membranePart('lipidHead');
const TAIL = membranePart('lipidTail');
const PUMP = membranePart('pump');
const CARRIER = membranePart('carrier');
const TUBULE = ORGANELLE_BY_ID.cytoskeleton;

const n1 = (v) => Number(v).toFixed(1);

// A subscript is markup, not a precomposed character (docs/design/chapter-recipe.md, the typographic
// pass). The phosphate is written `P_i` in the equations, and `subscript()` rebuilds the <text> it was
// drawn into: the letter after the mark at 0.7 of the size and a fifth of the size down, which is how
// the prose sets <sub> (src/styles/typography.css). The shift is a `dy`, which every engine draws;
// rubisco-fork and respiratory-chain set theirs the same way.
const SUB_MARK = /_(.)/gu;
const unmarked = (str) => String(str).replace(SUB_MARK, '$1');
function subscript(t) {
  const s = t?.textContent ?? '';
  if (!s.includes('_') || t.children.length) return t;
  const size = parseFloat(t.getAttribute('font-size')) || parseFloat(getComputedStyle(t).fontSize) || 10;
  const drop = (size * 0.2).toFixed(2);
  const back = (str) => el('tspan', { dy: `-${drop}`, text: str });
  const parts = [];
  let last = 0;
  let low = false;
  for (const m of s.matchAll(SUB_MARK)) {
    if (m.index > last) {
      parts.push(low ? back(s.slice(last, m.index)) : s.slice(last, m.index));
      low = false;
    }
    parts.push(el('tspan', { dy: low ? null : drop, 'font-size': (size * 0.7).toFixed(2), text: m[1] }));
    low = true;
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(low ? back(s.slice(last)) : s.slice(last));
  t.replaceChildren(...parts);
  return t;
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W, height: NARROW_H },
    seed: 20260917,
  });
  const fit = b.fit;

  // ---- state. Everything drawn is a function of these. ----
  const START = { scene: 'bench', job: 'glutamine', source: 'atp', coupled: false, ...PUMP_DEFAULTS };
  let s = { ...START };
  let jobsDone = 0;
  let sourceSpent = 0;
  let heatKj = 0;
  let phase = 0; // 0..1 through the current transaction

  const job = () => JOB_BY_ID[s.job];
  const source = () => SOURCE_BY_ID[s.source];
  const sumKj = () => round(job().kj + source().kj, 2);
  // Computed, never set by a button: coupled AND a source chosen AND the sum negative.
  const proceeds = () => s.coupled && s.source !== 'none' && sumKj() < 0;
  const intermediate = () => (s.coupled && s.source !== 'none' ? job().intermediate : null);

  // ---- panes ----
  const scene = b.pane('scene', {
    as: 'svg',
    focus: true,
    aria: 'A bench with an uphill job on one side and a source of free energy on the other. Press C to couple or uncouple them, Space to run, Right arrow for one transaction, Home to reset.',
  });
  const ledger = b.pane('ledger', { as: 'svg' });

  // fr rather than per cent, for the reason phlab records: two percentages and a column gap are wider
  // than the box, and the pane then hangs over the edge of the stage.
  b.compose({
    wide: {
      columns: 'minmax(0, 63fr) minmax(0, 37fr)',
      rows: 'minmax(0, 1fr)',
      at: { scene: [1, 1], ledger: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 72fr) minmax(0, 28fr)',
      at: { scene: [1, 1], ledger: [1, 2] },
    },
  });

  // ---- controls: what to show, then what to change, then what to run ----
  const pickScene = b.choice('Scene', [
    { id: 'bench', label: 'Bench', aria: 'Bench, the coupled pair on a bench' },
    { id: 'pump', label: 'Pump', aria: 'Pump, the sodium-potassium pump worked as a ledger' },
  ], (id) => {
    s.scene = id;
    showControls();
    draw();
    b.announce();
  }, { value: START.scene });
  b.divide();

  const pickJob = b.choice('Job', JOBS.map((j) => ({
    id: j.id, label: j.label, aria: `${j.label}, ${j.name.toLowerCase()}`,
  })), (id) => {
    s.job = id;
    phase = 0;
    draw();
    b.announce();
  }, { value: START.job, segmented: true });

  const pickSource = b.choice('Source', SOURCES.map((x) => ({
    id: x.id, label: x.label, aria: `${x.label}, ${x.note}`,
  })), (id) => {
    s.source = id;
    phase = 0;
    draw();
    b.announce();
  }, { value: START.source, segmented: true });

  b.divide();
  const btnCouple = b.toggle('Couple', (on) => {
    s.coupled = on;
    phase = 0;
    draw();
    b.announce();
  }, { aria: 'Couple, join the job and the source through a shared intermediate', pressed: START.coupled });

  const sliders = [
    ['naInsideMM', 'Na⁺ inside', 1, 60, 1, 'mmol/L'],
    ['naOutsideMM', 'Na⁺ outside', 20, 220, 1, 'mmol/L'],
    ['kInsideMM', 'K⁺ inside', 20, 220, 1, 'mmol/L'],
    ['kOutsideMM', 'K⁺ outside', 1, 40, 1, 'mmol/L'],
    ['potentialMv', 'Voltage', -120, 20, 1, 'mV'],
  ].map(([key, label, min, max, step, unit]) => b.slider(label, {
    min, max, step, value: START[key], unit, narrowUnit: unit === 'mmol/L' ? 'mM' : unit,
    onInput: (v) => { s[key] = v; draw(); b.announce(); },
  }));

  b.divide();
  const runCtl = b.run({ primary: true, onChange: () => { draw(); b.announce(); } });
  const btnStep = b.action('Step', () => { transact(); draw(); b.announce(); }, { aria: 'Step, carry out one transaction' });
  b.action('Reset', () => reset(), { aria: 'Reset, put the bench back as it started and clear the tallies' });

  b.keys({
    ' ': () => runCtl.toggle(),
    ArrowRight: () => { transact(); draw(); b.announce(); },
    c: () => btnCouple.toggle(),
    C: () => btnCouple.toggle(),
    Home: () => reset(),
  });

  // The two scenes want different controls, and a toolbar carrying all fourteen at once takes four rows
  // of a phone's stage. A hidden control is not visible, which is what `button:visible` in npm run narrow
  // reads, so nothing is asserted about a control that is not on screen.
  // The rules between the groups look after themselves: the bench puts each one inside the group it
  // opens, so a group whose controls are all hidden takes its rule with it. In the pump scene this
  // figure used to show two rules with nothing between them and swept them up afterwards.
  function showControls() {
    const onBench = s.scene === 'bench';
    // `hidden` is not enough: components.css gives .tb-slider `display: flex`, which beats the user
    // agent's [hidden] rule, so the pump's five sliders stood on the bench scene's toolbar and took two
    // rows of the stage away from the drawing. The inline display is what actually removes them, and it
    // is what `button:visible` and `input:visible` read.
    for (const node of [...pickJob.nodes, ...pickSource.nodes, btnCouple.node, btnStep]) node.style.display = onBench ? '' : 'none';
    for (const sl of sliders) sl.node.style.display = onBench ? 'none' : '';
  }
  showControls();

  // ---- reader actions ----

  // One transaction. Coupled and downhill: the intermediate forms, is consumed, and the job is done.
  // Coupled and not downhill: nothing happens at all, and no source is spent either, because the two
  // steps are one reaction and a reaction whose sum is positive does not run. Uncoupled: the source is
  // spent at exactly the same rate and every kilojoule of it arrives as heat.
  function transact() {
    if (s.scene !== 'bench' || s.source === 'none') return;
    if (s.coupled) {
      if (sumKj() >= 0) return;
      jobsDone += 1;
      sourceSpent += 1;
    } else {
      sourceSpent += 1;
      heatKj = round(heatKj + Math.abs(source().kj), 1);
    }
    phase = 0;
  }

  function reset() {
    s = { ...START };
    jobsDone = 0;
    sourceSpent = 0;
    heatKj = 0;
    phase = 0;
    runCtl.set(false);
    pickScene.set(START.scene, { quiet: true });
    pickJob.set(START.job, { quiet: true });
    pickSource.set(START.source, { quiet: true });
    btnCouple.set(START.coupled, { quiet: true });
    sliders.forEach((sl, i) => sl.set(START[PUMP_KEYS[i]]));
    showControls();
    b.restart(); // the bench's clock back to zero, so describe() after Reset is describe() at mount
    draw();
    b.announce();
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    advance(dt) {
      if (s.scene !== 'bench' || s.source === 'none') return;
      if (s.coupled && sumKj() >= 0) return;
      phase += dt / TX_SECONDS;
      while (phase >= 1) {
        phase -= 1;
        transact();
      }
    },
    restart() { phase = 0; },
  });

  // ---- what describe() reports ----
  function state() {
    const p = pumpTerms(s);
    const marginKj = round(ATP_CELLULAR + p.cycleCostKj, 2);
    return {
      scene: s.scene,
      job: s.job,
      jobKj: round(job().kj, 2),
      source: s.source,
      sourceKj: round(source().kj, 2),
      coupled: s.coupled,
      intermediate: intermediate(),
      sumKj: sumKj(),
      proceeds: proceeds(),
      jobsDone,
      sourceSpent,
      heatKj: round(heatKj, 1),
      naInsideMM: s.naInsideMM,
      naOutsideMM: s.naOutsideMM,
      kInsideMM: s.kInsideMM,
      kOutsideMM: s.kOutsideMM,
      potentialMv: s.potentialMv,
      naCostKj: round(p.naCostKj, 2),
      kCostKj: round(p.kCostKj, 2),
      cycleCostKj: round(p.cycleCostKj, 2),
      atpValueKj: ATP_CELLULAR,
      marginKj,
      direction: marginKj < -STALL_BAND ? 'pumping' : marginKj > STALL_BAND ? 'reversed' : 'stalled',
      t: round(b.time, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);
  b.onAnnounce((d) => (d.scene === 'pump'
    ? `The pump scene. One cycle must supply ${n1(d.cycleCostKj)} kilojoules per mole; one ATP is worth ${n1(d.atpValueKj)}. Margin ${signed(d.marginKj, 1)}, so the pump is ${d.direction}.`
    : `${JOB_BY_ID[d.job].name}, ${signed(d.jobKj, 1)} kilojoules per mole, against ${SOURCE_BY_ID[d.source].name.toLowerCase()} at ${signed(d.sourceKj, 1)}. ${d.coupled ? (d.intermediate ? `Coupled through ${d.intermediate}.` : 'Coupled, with no source to couple to.') : 'Not coupled.'} ${d.jobsDone} job${d.jobsDone === 1 ? '' : 's'} done, ${d.sourceSpent} spent, ${n1(d.heatKj)} kilojoules per mole of heat.`));

  // ---------------------------------------------------------------- drawing helpers

  // A box's own long axis. Every job and every source is drawn along it, so one drawing reads in the
  // tall narrow column a desktop stage gives it and in the short wide band a phone gives it.
  function lane(box) {
    const upright = box.h > box.w * 1.1;
    const len = upright ? box.h : box.w;
    const thick = upright ? box.w : box.h;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    return {
      upright,
      len,
      thick,
      cx,
      cy,
      at: (t, u = 0) => (upright ? [cx + u * thick, cy + t * len] : [cx + t * len, cy + u * thick]),
      r: clamp(Math.min(thick * 0.33, len * 0.17), 6.5, 40),
    };
  }

  // A labelled disc: the one shape this figure draws a molecule as, so a reader learns one mark.
  function disc(x, y, r, fill, symbol, symbolColor, { parent, opacity = null, stroke = null } = {}) {
    const g = parent ?? scene.group();
    if (opacity !== null) g.setAttribute('opacity', String(opacity));
    const rr = Math.max(1, r);
    scene.circle(x, y, rr, { fill, stroke: stroke ?? C.paper, 'stroke-width': Math.max(0.6, rr * 0.09) }, g);
    if (symbol) {
      const size = fit(symbol, rr * 1.9, rr * 0.92, 6.4);
      if (size) {
        scene.text(x, y + size * 0.35, symbol, {
          anchor: 'middle', class: 'cb-sym', 'font-size': n1(size), style: `fill:${symbolColor}`, parent: g,
        });
      }
    }
    return g;
  }

  // A sheet of membrane seen edge-on, drawn the way chapter 4 draws it: two rows of heads with the
  // tails between them. Always horizontal, because what crosses it crosses vertically in both layouts.
  function membraneStrip(x, y, w, thickness, parent) {
    const t = Math.max(4, thickness);
    scene.rect(x, y, Math.max(0, w), t, { fill: TAIL.color }, parent);
    // 0.19 and 2.8, not 0.22 and 2.3: at the thickness the pump scene gives it the head circles ran
    // into one another and the sheet read as one solid band rather than as two rows of heads with the
    // tails between them.
    const r = t * 0.19;
    const step = Math.max(r * 2.8, 6);
    for (let px = x + step / 2; px < x + w - 1; px += step) {
      scene.circle(px, y + r * 0.95, r, { fill: HEAD.color }, parent);
      scene.circle(px, y + t - r * 0.95, r, { fill: HEAD.color }, parent);
    }
  }

  // Heat leaving: motion, and the word set as type in the ledger. Never a colour of its own.
  function heatPlume(x, y, height, along, parent) {
    const hgt = Math.max(6, height);
    for (let i = 0; i < 3; i += 1) {
      const off = (i - 1) * 7;
      const drift = ((along + i * 0.33) % 1) * hgt;
      const top = Math.max(2, hgt - drift);
      let d = `M${n1(x + off)} ${n1(y)}`;
      for (let k = 1; k <= 4; k += 1) {
        const yy = y - (k / 4) * top;
        d += `Q${n1(x + off + (k % 2 ? 4.5 : -4.5))} ${n1(yy + top / 8)} ${n1(x + off)} ${n1(yy)}`;
      }
      scene.path(d, {
        fill: 'none', stroke: C.faint, 'stroke-width': 1.2, 'stroke-linecap': 'round',
        opacity: (0.16 + 0.5 * (1 - drift / hgt)).toFixed(2),
      }, parent);
    }
  }

  const dashed = (x1, y1, x2, y2, on, parent) => scene.path(`M${n1(x1)} ${n1(y1)} L${n1(x2)} ${n1(y2)}`, {
    fill: 'none', stroke: on ? C.ink : C.ruleStrong, 'stroke-width': 1.6, 'stroke-linecap': 'round',
    'stroke-dasharray': on ? null : '4 4',
  }, parent);

  // ---------------------------------------------------------------- the bench scene

  function drawJob(box, done) {
    const g = scene.group();
    const L = lane(box);
    const r = L.r;
    if (s.job === 'glutamine') {
      const [ax, ay] = L.at(-0.33);
      const [bx, by] = L.at(0.33);
      dashed(...L.at(-0.33 + (r * 1.2) / L.len), ...L.at(0.33 - (r * 1.3) / L.len), done, g);
      disc(ax, ay, r, GLUCOSE.color, 'Glu', GLUCOSE.symbolColor, { parent: g });
      const [nx, ny] = L.at(L.upright ? 0 : -0.02, L.upright ? -0.24 : -0.3);
      const [jx, jy] = L.at(L.upright ? 0 : -0.02, 0);
      scene.path(`M${n1(nx)} ${n1(ny)} L${n1(jx)} ${n1(jy)}`, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' }, g);
      g.append(atom(nx, ny, 'N', r * 0.62, { label: r * 0.62 >= 4.4 }));
      if (done) disc(bx, by, r * 1.12, GLUCOSE.color, 'Gln', GLUCOSE.symbolColor, { parent: g });
      else disc(bx, by, r * 1.12, C.paper2, 'Gln', C.faint, { parent: g, stroke: C.ruleStrong });
    } else if (s.job === 'sodium') {
      const mt = clamp(box.h * 0.13, 7, 18);
      const my = box.y + box.h * 0.55;
      membraneStrip(box.x + 2, my, box.w - 4, mt, g);
      for (let i = 0; i < 3; i += 1) {
        const ix = box.x + box.w * (0.28 + i * 0.22);
        const iy = done ? my - r * 1.15 : my + mt + r * 1.15;
        dashed(ix, my + mt + r * 0.5, ix, my - r * 0.5, done, g);
        g.append(atom(ix, iy, 'Na', r * 0.68, { label: r * 0.68 >= 4.4 }));
      }
    } else if (s.job === 'motor-step') {
      const barY = box.y + box.h * 0.62;
      const barH = clamp(box.h * 0.1, 4, 14);
      scene.rect(box.x + 2, barY, Math.max(0, box.w - 4), barH, { fill: TUBULE.color }, g);
      const mx = box.x + box.w * (done ? 0.62 : 0.38);
      disc(mx, barY - r * 0.95, r * 0.85, CARRIER.color, '', CARRIER.symbolColor, { parent: g });
      scene.path(`M${n1(mx - r * 0.5)} ${n1(barY - r * 0.3)} L${n1(mx - r * 0.18)} ${n1(barY)} M${n1(mx + r * 0.5)} ${n1(barY - r * 0.3)} L${n1(mx + r * 0.18)} ${n1(barY)}`, {
        fill: 'none', stroke: CARRIER.color, 'stroke-width': 2.2, 'stroke-linecap': 'round',
      }, g);
      dashed(box.x + box.w * 0.38, barY + barH + r * 0.7, box.x + box.w * 0.62, barY + barH + r * 0.7, done, g);
      const lbl = fit('8 nm', box.w * 0.24, 9.8, 8.6);
      if (lbl) scene.text(box.x + box.w * 0.5, barY + barH + r * 0.7 + lbl + 3, '8 nm', { anchor: 'middle', class: 'cb-axis', 'font-size': n1(lbl), parent: g });
    } else {
      const [ax, ay] = L.at(-0.3);
      const [mx, my2] = L.at(done ? 0 : -0.04);
      const [bx, by] = L.at(done ? 0.3 : 0.32);
      dashed(...L.at(-0.3 + (r * 1.2) / L.len), ...L.at((done ? 0.3 : 0.32) - (r * 1.2) / L.len), done, g);
      for (const [px, py] of [[ax, ay], [mx, my2], [bx, by]]) disc(px, py, r * 0.92, GLUCOSE.color, '', GLUCOSE.symbolColor, { parent: g });
    }
    return g;
  }

  function drawSource(box, spent) {
    const g = scene.group();
    const L = lane(box);
    const r = L.r;
    if (s.source === 'atp' || s.source === 'creatine-phosphate') {
      const isAtp = s.source === 'atp';
      const [cx, cy] = L.at(-0.16);
      const [px, py] = L.at(-0.16 + 0.26 + spent * 0.2, spent * 0.18);
      disc(cx, cy, r * 1.1, isAtp ? ATP.color : C.paper2, isAtp ? (spent > 0.45 ? 'ADP' : 'ATP') : 'Cr', isAtp ? ATP.symbolColor : C.ink, { parent: g, stroke: isAtp ? C.paper : C.ruleStrong });
      const pg = scene.group();
      pg.setAttribute('opacity', (1 - spent * 0.35).toFixed(2));
      pg.append(atom(px, py, 'P', r * 0.6, { label: r * 0.6 >= 4.4 }));
      g.append(pg);
    } else if (s.source === 'sodium-gradient') {
      const mt = clamp(box.h * 0.13, 7, 18);
      const my = box.y + box.h * 0.42;
      membraneStrip(box.x + 2, my, box.w - 4, mt, g);
      for (let i = 0; i < 5; i += 1) {
        const ix = box.x + box.w * (0.14 + i * 0.18);
        g.append(atom(ix, my - r * 0.95, 'Na', r * 0.55, { label: false }));
      }
      dashed(box.x + box.w * 0.5, my - r * 0.4, box.x + box.w * 0.5, my + mt + r * 1.6, true, g);
      g.append(atom(box.x + box.w * 0.5, my + mt + r * (0.85 + spent * 0.9), 'Na', r * 0.68, { label: r * 0.68 >= 4.4 }));
    } else {
      // Nothing chosen. The region says what the three sources are worth rather than standing empty: a
      // panel that is half empty is a composition failure, and the fix is to put what belongs there in it.
      const rows = SOURCES.filter((x) => x.id !== 'none');
      const size = clamp(Math.min(box.w * 0.055, box.h * 0.17), 8.6, 11.4);
      const pitch = Math.min(size * 2.1, box.h / (rows.length + 0.4));
      const top = box.y + box.h / 2 - (rows.length - 1) * pitch * 0.5;
      rows.forEach((row, i) => {
        const ry = top + i * pitch;
        scene.text(box.x + 2, ry, row.name, { class: 'cb-note', 'font-size': n1(size), parent: g });
        scene.text(box.x + box.w - 2, ry, signed(row.kj, 1), { anchor: 'end', class: 'cb-num', 'font-size': n1(size), parent: g });
        scene.line(box.x + 2, ry + size * 0.42, box.x + box.w - 2, ry + size * 0.42, { stroke: C.rule }, g);
      });
    }
    return g;
  }

  // The region between them: the whole figure in one mark. Coupled, one bracket carries the shared
  // intermediate from the source to the job. Uncoupled, two arcs stop short of each other and heat
  // rises from the gap.
  function drawLink(box, along) {
    const g = scene.group();
    const L = lane(box);
    const runs = proceeds();
    const reach = 0.44;
    const nr = clamp(Math.min(L.thick * 0.3, L.len * 0.17), 6, 18);
    const cap = (t, sign) => {
      // A short stroke across the line: the end of a coupling that reaches the other side, or the
      // frayed end of one that does not.
      const [px, py] = L.at(t);
      const [qx, qy] = L.at(t, 0.07 * sign);
      scene.path(`M${n1(px)} ${n1(py)} L${n1(qx)} ${n1(qy)}`, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    };
    if (s.coupled && s.source !== 'none') {
      const [x0, y0] = L.at(reach);
      const [x1, y1] = L.at(-reach);
      scene.path(`M${n1(x0)} ${n1(y0)} L${n1(x1)} ${n1(y1)}`, {
        fill: 'none', stroke: runs ? C.ink : C.ruleStrong, 'stroke-width': 2.4, 'stroke-linecap': 'round',
      }, g);
      cap(reach, 1);
      cap(reach, -1);
      cap(-reach, 1);
      cap(-reach, -1);
      const t = runs ? reach - along * reach * 2 : 0;
      const [nx, ny] = L.at(t);
      disc(nx, ny, nr, ENZYME.color, '', ENZYME.symbolColor, { parent: g, stroke: C.ruleStrong });
    } else {
      const bite = 0.15;
      const [x0, y0] = L.at(reach);
      const [x1, y1] = L.at(-reach);
      const [m0x, m0y] = L.at(bite);
      const [m1x, m1y] = L.at(-bite);
      scene.path(`M${n1(x0)} ${n1(y0)} L${n1(m0x)} ${n1(m0y)}`, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
      scene.path(`M${n1(x1)} ${n1(y1)} L${n1(m1x)} ${n1(m1y)}`, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
      cap(bite, 0.6);
      cap(bite, -0.6);
      cap(-bite, 0.6);
      cap(-bite, -0.6);
      if (s.source !== 'none') {
        const [hx, hy] = L.at(bite * 0.7, L.upright ? 0.24 : 0.34);
        heatPlume(hx, hy, Math.min(52, L.len * 0.24, L.thick * 0.72), along, g);
      }
    }
    return g;
  }

  function drawBenchScene() {
    const { w, h: hgt } = scene.clear().box;
    const along = phase;
    const done = s.coupled && s.source !== 'none' && sumKj() < 0 ? along > 0.55 : false;
    const narrow = b.narrow;
    const headSize = clamp(Math.min(w * 0.021, hgt * 0.034), 8.2, 9.6);
    const nameSize = clamp(Math.min(w * 0.028, hgt * 0.046), 8.8, 12);
    const numSize = clamp(Math.min(w * 0.034, hgt * 0.056), 9.8, 14.5);
    const pad = 4;
    const iw = w - pad * 2;
    const ih = hgt - pad * 2;

    // At desktop width the three regions take a band across the top and the chemistry §5.4 actually
    // sets out takes the band beneath it, because three tall narrow strips leave two thirds of a
    // landscape pane empty and a panel that is half empty is a composition failure. On a phone the
    // regions stack down the whole pane and the equations are dropped: three of them at 380 px would be
    // set below nine device pixels, and the pane is full without them.
    const eqBand = narrow ? 0 : clamp(ih * 0.26, 70, 106);
    const bandH = ih - eqBand;

    // Three regions along the band's long axis: the job, the link, the source.
    const spans = narrow ? [0.36, 0.26, 0.38] : [0.39, 0.22, 0.39];
    const regions = [];
    let run = 0;
    for (const f of spans) {
      regions.push(narrow
        ? { x: pad, y: pad + bandH * run, w: iw, h: bandH * f }
        : { x: pad + iw * run, y: pad, w: iw * f, h: bandH });
      run += f;
    }

    // The head is dropped on a phone, where three of them cost forty pixels the drawings need, and the
    // name and the number share one baseline instead of taking two.
    const headBand = narrow ? 0 : headSize + 7;
    const footBand = narrow ? Math.max(nameSize, numSize) + 6 : nameSize + numSize + 11;
    const boxes = regions.map((r) => ({
      x: r.x + (narrow ? 0 : 1),
      y: r.y + headBand,
      w: r.w - (narrow ? 0 : 2),
      h: Math.max(18, r.h - headBand - footBand),
      outer: r,
    }));

    function regionHead(r, words) {
      if (narrow) return;
      const size = fit(words, r.w - 4, headSize, 8.0);
      if (size) scene.text(r.x, r.y + size, words, { class: 'cb-head', 'font-size': n1(size) });
      scene.line(r.x, r.y + headSize + 3.5, r.x + r.w, r.y + headSize + 3.5, { stroke: C.rule });
    }
    // Name left, number right. On a phone they share one baseline; at desktop width the name takes the
    // line above, because the region is narrow enough for the two to meet in the middle.
    function regionFoot(r, name, number, accent) {
      const numY = r.y + r.h - 2;
      const nameY = narrow ? numY : numY - numSize - 2;
      const room = narrow ? r.w - number.length * numSize * 0.58 - 8 : r.w - 2;
      const size = fit(name, Math.max(24, room), nameSize, 8.4);
      if (size) scene.text(r.x, nameY, name, { class: 'cb-name', 'font-size': n1(size) });
      scene.text(r.x + r.w, numY, number, {
        anchor: 'end', class: 'cb-num', 'font-size': n1(numSize), style: accent ? `fill:${accent}` : undefined,
      });
    }

    regionHead(regions[0], 'THE JOB');
    drawJob(boxes[0], done);
    regionFoot(regions[0], job().name, `${signed(job().kj, 1)} kJ/mol`);

    regionHead(regions[1], s.coupled ? 'COUPLED' : 'NOT COUPLED');
    drawLink(boxes[1], along);
    // Read in every state its parts can take: with no source there is nothing to couple either way.
    const linkName = s.source === 'none'
      ? 'nothing to join'
      : s.coupled ? intermediate() : 'no intermediate forms';
    regionFoot(regions[1], linkName, `${signed(sumKj(), 1)} kJ/mol`, proceeds() ? INK.leaf : C.faint);

    regionHead(regions[2], 'THE SOURCE');
    drawSource(boxes[2], s.source === 'none' ? 0 : along);
    regionFoot(regions[2], source().name, `${signed(source().kj, 1)} kJ/mol`);

    if (eqBand > 0) drawEquations(pad, pad + bandH, iw, eqBand);
    scene.focusMark();
  }

  // What is actually happening, as chemistry. Coupled, it is the two steps of one reaction with the
  // shared intermediate written in both of them — §5.4's own pair of equations. Uncoupled, it is two
  // separate reactions in the same drop, one of which does not run and one of which makes heat, which
  // is the wrong answer stated in the only language that can settle it.
  function drawEquations(x, y, w, hgt) {
    const lines = equationLines();
    const headSize = clamp(w * 0.017, 8.2, 9.4);
    const eqSize = clamp(Math.min(w * 0.021, (hgt - headSize - 16) / (lines.length + 1.1)), 9, 13.2);
    scene.line(x, y + 2, x + w, y + 2, { stroke: C.ruleStrong });
    scene.text(x, y + headSize + 7, s.coupled && s.source !== 'none' ? 'ONE REACTION, IN TWO STEPS' : 'TWO REACTIONS, SIDE BY SIDE', { class: 'cb-head', 'font-size': n1(headSize) });
    let ly = y + headSize + 12;
    for (const line of lines) {
      const size = fit(unmarked(line), w - 4, eqSize, 8.6);
      ly += (size || eqSize) * 1.5;
      if (size) subscript(scene.text(x + 6, ly, line, { class: 'cb-name', 'font-size': n1(size) }));
    }
    const tail = s.source === 'none'
      ? 'Nothing is being spent, and nothing happens.'
      : s.coupled
        ? `${intermediate()} appears in both lines: that is what makes the two free energy changes add.`
        : 'Nothing appears in both lines, so the two changes do not add and the job is no nearer being done.';
    const tailSize = fit(tail, w - 8, Math.min(eqSize - 0.6, 10.4), 8.6);
    if (tailSize) scene.text(x + 6, Math.min(ly + tailSize * 1.7, y + hgt - 2), tail, { class: 'cb-note', 'font-size': n1(tailSize) });
  }

  // The two lines, for this job and this source. `P_i` (set as P<sub>i</sub>) and the arrow are the
  // prose's own notation.
  function equationLines() {
    const j = job();
    const src = source();
    const jobAlone = {
      glutamine: 'glutamate + NH₃ → no reaction',
      sodium: '3 Na⁺ inside → 3 Na⁺ outside: no reaction',
      'motor-step': 'motor → 8 nm along the microtubule: no reaction',
      polymer: 'monomer + monomer → no reaction',
    }[j.id];
    if (s.source === 'none') return [jobAlone, 'nothing is being spent'];
    if (!s.coupled) {
      const alone = {
        atp: 'ATP + H₂O → ADP + P_i + heat',
        'creatine-phosphate': 'creatine phosphate + H₂O → creatine + P_i + heat',
        'sodium-gradient': 'Na⁺ outside → Na⁺ inside + heat',
      }[src.id];
      return [jobAlone, alone];
    }
    if (src.id === 'sodium-gradient') {
      return [
        `Na⁺ outside + ${j.id === 'polymer' ? 'monomer' : 'the load'} → ${j.intermediate}`,
        `${j.intermediate} → Na⁺ inside + the load moved`,
      ];
    }
    const donor = src.id === 'atp' ? 'ATP' : 'creatine phosphate';
    const spent = src.id === 'atp' ? 'ADP' : 'creatine';
    return {
      glutamine: [`glutamate + ${donor} → glutamyl phosphate + ${spent}`, 'glutamyl phosphate + NH₃ → glutamine + P_i'],
      sodium: [`pump + ${donor} → pump–P + ${spent}`, 'pump–P + 3 Na⁺ inside → pump + 3 Na⁺ outside + P_i'],
      'motor-step': [`motor + ${donor} → motor·${donor === 'ATP' ? 'ATP' : 'CrP'}`, `motor·${donor === 'ATP' ? 'ATP' : 'CrP'} → motor 8 nm on + ${spent} + P_i`],
      polymer: [`monomer + ${donor} → monomer–P + ${spent}`, 'monomer–P + monomer → chain + P_i'],
    }[j.id];
  }

  // ---------------------------------------------------------------- the pump scene

  function drawPumpScene() {
    const { w, h: hgt } = scene.clear().box;
    const p = pumpTerms(s);
    const marginKj = ATP_CELLULAR + p.cycleCostKj;
    const pad = 5;
    const barBand = clamp(hgt * 0.22, 44, 74);
    const top = pad + 2;
    const bottom = hgt - barBand;
    const mid = (top + bottom) / 2;
    const mt = clamp((bottom - top) * 0.13, 9, 20);
    const my = mid - mt / 2;
    const ionR = clamp(Math.min(w * 0.021, (bottom - top) * 0.06), 5, 11);
    const labelSize = clamp(Math.min(w * 0.024, hgt * 0.038), 8.6, 10.6);

    membraneStrip(pad, my, w - pad * 2, mt, undefined);

    // The ions, at a density that follows the sliders: double a concentration and twice as many appear.
    // The scatter is a stateless hash of the ion's index, never b.random(), because the generator would
    // advance on every redraw and the frame at t would not be the same frame twice.
    // A left gutter the ions do not enter, because OUTSIDE and INSIDE are set there. Measured against
    // the whole width, the first ion of the top row sat on top of the word OUTSIDE and the first of the
    // bottom row on INSIDE — a collision that appears at one concentration and not another, since the
    // count and the spacing both follow the slider.
    const gutter = Math.max(46, w * 0.09);
    const rowOf = (mm, maxMM, y, sym, key) => {
      const count = clamp(Math.round((mm / maxMM) * 9), 1, 9);
      const from = pad + gutter + ionR;
      const span = Math.max(ionR * 2, w - pad - from - ionR);
      for (let i = 0; i < count; i += 1) {
        const x = from + (span * (i + 0.5)) / count;
        const jitter = (hash2(key, i) - 0.5) * ionR * 1.2;
        scene.add(atom(x, y + jitter, sym, ionR, { label: ionR >= 4.4 }));
      }
    };
    rowOf(s.naOutsideMM, 220, top + ionR * 1.4, 'Na', 11);
    rowOf(s.kOutsideMM, 40, top + ionR * 3.9, 'K', 12);
    rowOf(s.naInsideMM, 220, bottom - ionR * 3.9, 'Na', 13);
    rowOf(s.kInsideMM, 220, bottom - ionR * 1.4, 'K', 14);

    // The pump, straddling the sheet, with three sodium one way and two potassium the other.
    const px = w * 0.5;
    const pw = clamp(w * 0.12, 28, 62);
    scene.rect(px - pw / 2, my - mt * 0.55, pw, mt * 2.1, { fill: PUMP.color }, undefined);
    const psym = fit('ATP', pw * 0.78, mt * 0.95, 6.6);
    if (psym) scene.text(px, my + mt * 0.8 + psym * 0.35, 'ATP', { anchor: 'middle', class: 'cb-sym', 'font-size': n1(psym), style: `fill:${PUMP.symbolColor}` });
    const forwards = marginKj <= 0;
    const arrow = (ax, up) => scene.path(
      up
        ? `M${n1(ax)} ${n1(my + mt * 1.75)} L${n1(ax)} ${n1(my - mt * 0.85)} M${n1(ax - 3)} ${n1(my - mt * 0.2)} L${n1(ax)} ${n1(my - mt * 0.85)} L${n1(ax + 3)} ${n1(my - mt * 0.2)}`
        : `M${n1(ax)} ${n1(my - mt * 0.85)} L${n1(ax)} ${n1(my + mt * 1.75)} M${n1(ax - 3)} ${n1(my + mt * 1.1)} L${n1(ax)} ${n1(my + mt * 1.75)} L${n1(ax + 3)} ${n1(my + mt * 1.1)}`,
      { fill: 'none', stroke: INK.leaf, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    );
    for (let i = 0; i < 3; i += 1) arrow(px - pw * 0.86 + i * pw * 0.26, forwards);
    for (let i = 0; i < 2; i += 1) arrow(px + pw * 0.46 + i * pw * 0.26, !forwards);
    scene.label(px, my - mt * 1.5, forwards ? '3 Na⁺ out, 2 K⁺ in' : '3 Na⁺ in, 2 K⁺ out', { size: labelSize });

    // The voltage, as the charge each face actually carries, with the number at the end of the line.
    const sign = s.potentialMv < 0 ? '−' : '+';
    const marks = clamp(Math.round(Math.abs(s.potentialMv) / 18), 0, 6);
    for (let i = 0; i < marks; i += 1) {
      scene.text(pad + 8 + i * 12, my + mt + labelSize * 1.6, sign, { anchor: 'middle', class: 'cb-axis', 'font-size': n1(labelSize) });
    }
    scene.text(w - pad, my + mt + labelSize * 1.6, `${s.potentialMv} mV inside`, { anchor: 'end', class: 'cb-axis', 'font-size': n1(labelSize) });
    scene.text(pad, top + ionR * 1.6, 'OUTSIDE', { class: 'cb-head', 'font-size': n1(Math.min(labelSize, 9.4)) });
    scene.text(pad, bottom - ionR * 1.2, 'INSIDE', { class: 'cb-head', 'font-size': n1(Math.min(labelSize, 9.4)) });

    // The margin bar: the scene's verdict, and it keeps the full width at every stage size. Zero in the
    // middle; the bar runs left while one ATP still covers a cycle and right when it no longer does.
    const bx = pad;
    const bw = Math.max(20, w - pad * 2);
    const zero = bx + bw / 2;
    const scale = (bw / 2) / 25; // 25 kJ/mol reaches either end
    const by = bottom + barBand * 0.4;
    const bh = clamp(barBand * 0.2, 8, 15);
    const noteSize = Math.min(labelSize, 9.8);
    scene.text(bx, by - 6, forwards ? 'the pump has this much left over' : 'a cycle costs this much more than an ATP', { class: 'cb-note', 'font-size': n1(noteSize) });
    scene.line(zero, by - 3, zero, by + bh + 3, { stroke: C.ruleStrong });
    const len = clamp(Math.abs(marginKj) * scale, 0, bw / 2 - 2);
    scene.rect(marginKj < 0 ? zero - len : zero, by, len, bh, { fill: marginKj < 0 ? tint(INK.leaf, 55) : tint(C.coral, 55) });
    scene.text(bx, by + bh + noteSize + 4, 'margin against one ATP', { class: 'cb-note', 'font-size': n1(noteSize) });
    scene.text(bx + bw, by + bh + noteSize + 4, `${signed(marginKj, 1)} kJ/mol`, { anchor: 'end', class: 'cb-num', 'font-size': n1(Math.min(noteSize + 2.2, 12.6)) });
    scene.focusMark();
  }

  // ---------------------------------------------------------------- the ledger

  function drawLedger() {
    const { w, h: hgt } = ledger.clear().box;
    const narrow = b.narrow;
    const pad = narrow ? 2 : 6;
    const width = Math.max(40, w - pad * 2);
    const size = narrow ? 10.2 : 10.6;
    const minRow = narrow ? 13.5 : 14;
    const r = ledger.readout({
      title: narrow && s.scene !== 'pump' ? null : (s.scene === 'pump' ? 'ONE PUMP CYCLE' : 'THE LEDGER'),
      x: pad,
      width,
      size,
      minRow,
    });
    // The readout wraps a sentence to its column and draws nothing below the pane's own box, so a table
    // with more rows than the pane is tall is clipped there rather than painted over the toolbar.
    // The whole pane, not two pixels short of it: the readout now clips at the box it is given, and the
    // pane's own bottom edge is one pixel above the toolbar (measured at 390 px), so those two pixels of
    // old safety margin were two pixels of table thrown away — atp3d lost the Total row to them.
    const room = Math.max(30, hgt);
    const note = (sentence) => r.note(sentence);
    const kj = (v) => (narrow ? `${signed(v, 1)} kJ/mol` : signed(v, 1));

    if (s.scene === 'pump') {
      const p = pumpTerms(s);
      const marginKj = ATP_CELLULAR + p.cycleCostKj;
      const dir = marginKj < -STALL_BAND ? 'pumping' : marginKj > STALL_BAND ? 'reversed' : 'stalled';
      if (!narrow) {
        r.head('WHAT ONE CYCLE COSTS, kJ/mol');
        r.row('3 Na⁺ out · concentration', kj(p.naChem));
        r.row('3 Na⁺ out · voltage', kj(p.naElec));
        r.row('2 K⁺ in · concentration', kj(p.kChem));
        r.row('2 K⁺ in · voltage', kj(p.kElec));
      } else {
        // The four terms are on the stage beside the membrane at this width; the ledger keeps the two
        // totals and the verdict, which is what the bar underneath is about.
        r.row('3 Na⁺ out', kj(p.naCostKj));
        r.row('2 K⁺ in', kj(p.kCostKj));
      }
      r.sum('The cycle must supply', kj(p.cycleCostKj));
      if (!narrow) r.head('AGAINST ONE ATP');
      r.row('One ATP, cellular', kj(ATP_CELLULAR));
      r.sum('Margin', kj(marginKj), { accent: marginKj < 0 ? INK.leaf : INK.coral });
      note(dir === 'pumping'
        ? (narrow ? 'One ATP still covers a cycle, so the pump runs forwards.' : 'The margin is negative, so one ATP still covers a cycle and the pump runs forwards.')
        : dir === 'stalled'
          ? (narrow ? 'A cycle costs what an ATP is worth: the pump is about to stall.' : 'A cycle costs almost exactly what an ATP is worth, so the pump is on the point of stalling.')
          : (narrow ? 'A cycle costs more than an ATP, so the machine runs backwards.' : 'A cycle now costs more than an ATP is worth, so the machine runs backwards and makes ATP instead.'));
    } else if (narrow) {
      // The free-energy column is already on the stage above, read down the three region feet, so the
      // narrow ledger is what is NOT there: the verdict, and the three tallies.
      note(verdictSentence(true));
      r.row('Jobs done', String(jobsDone));
      r.row('Source spent', String(sourceSpent));
      r.row('Heat shed', `${n1(heatKj)} kJ/mol`);
    } else {
      r.head('FREE ENERGY, kJ/mol');
      r.row('The job', kj(job().kj));
      r.row('The source', kj(source().kj));
      r.sum('Sum', kj(sumKj()), { accent: proceeds() ? INK.leaf : undefined });
      note(verdictSentence(false));
      r.head('SINCE RESET');
      r.row('Jobs done', String(jobsDone));
      r.row('Source spent', String(sourceSpent));
      r.row('Heat shed', `${n1(heatKj)} kJ/mol`);
      note(heatSentence());
    }
    r.fill(room);
  }

  // Read in every state its parts can take: no source, uncoupled, coupled and uphill, coupled and
  // downhill. None of the four may describe a state the figure is not in.
  function verdictSentence(narrow) {
    if (s.source === 'none') {
      return narrow
        ? 'No source chosen: nothing to couple to, nothing spent.'
        : 'No source is chosen, so there is nothing to couple the job to and nothing is spent.';
    }
    if (!s.coupled) {
      return narrow
        ? 'Not coupled: only the source is spent.'
        : 'Not coupled: no intermediate forms, the two changes do not add, and only the source is spent.';
    }
    if (sumKj() >= 0) {
      return narrow
        ? 'Coupled, but the sum is not negative: nothing runs.'
        : `Coupled through ${intermediate()}, but the sum is not negative, so the pair does not run and nothing is spent.`;
    }
    return narrow
      ? 'Coupled: the intermediate forms, so the two changes add.'
      : `Coupled: ${intermediate()} forms and is used up by the second step, so the two changes add and the job gets done.`;
  }

  function heatSentence() {
    if (heatKj <= 0) {
      return s.coupled
        ? 'Nothing has been spent uncoupled yet.'
        : 'Nothing has been spent yet. Run it uncoupled and every kilojoule will arrive here.';
    }
    return 'That is what the uncoupled transactions produced. At one temperature throughout, none of it can be spent again.';
  }

  // ---------------------------------------------------------------- drawing

  function draw() {
    b.redraw();
  }

  b.onDraw(() => {
    if (s.scene === 'pump') drawPumpScene();
    else drawBenchScene();
    drawLedger();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   scene           'bench' or 'pump'
  //   job, jobKj      which uphill job, and what it needs (positive, kJ/mol)
  //   source, sourceKj  which source, and what it releases (negative, kJ/mol)
  //   coupled         the switch this figure is about
  //   intermediate    the shared intermediate's name; NULL whenever coupled is false, always
  //   sumKj           jobKj + sourceKj
  //   proceeds        computed: coupled, a source chosen, and the sum negative
  //   jobsDone        cumulative since Reset
  //   sourceSpent     cumulative since Reset; climbs at the same rate coupled or not
  //   heatKj          cumulative since Reset; what the UNCOUPLED transactions produced
  //   naInsideMM … potentialMv   the pump scene's five sliders
  //   naCostKj, kCostKj, cycleCostKj   per cycle, computed from those five
  //   atpValueKj      -50.1, §5.3's arithmetic at cellular concentrations
  //   marginKj        atpValueKj + cycleCostKj; positive means the pump has nothing left
  //   direction       'pumping' | 'stalled' | 'reversed', computed from marginKj alone
  //   t               the clock, seconds, three decimals; cumulative, and Reset puts it back to 0
  //   playing         whether Run is on
  const handle = b.handle();
  // Again, and this time it can see the toolbar: the bench appends the toolbar to its wrapper inside
  // handle(), so a tidy run before that found nothing at all.
  showControls();
  return handle;
}
