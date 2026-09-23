// Four ways to move what will not fit. A stretch of cell surface with the outside above and cytoplasm
// below, where four processes can be run at once: a macrophage swallowing a bacterium, indiscriminate
// drinking, receptor-mediated uptake of LDL, and secretion. A ledger along one edge keeps the cell's
// surface area as vesicles arrive and depart, and a marked patch of membrane can be followed out and
// back to see which way round it comes home.
//
// THE LEDGER IS THE ARGUMENT, so its numbers are real ones. A small animal cell has of the order of
// 1000 µm² of plasma membrane. A 100 nm vesicle carries 4πr² = 0.031 µm² of it; a coated pit's vesicle
// is a little larger at 0.05 µm²; a phagosome round a 1 µm bacterium carries about 4.5 µm². A macrophage
// internalises the equivalent of its whole surface in about half an hour, which is 0.55 µm² a second,
// or eighteen small vesicles a second — far more than can be drawn, so the drawing shows ONE VESICLE IN
// FOUR and the ledger counts them all. The slider says the rate in vesicles per second and the reading
// says what share of the surface that is per minute, so the arithmetic §4.8 makes can be checked here.
//
// WHY THE SUGARS END UP OUTSIDE. The marked patch is not a decoration and not an animation of a rule: the
// patch carries its sugar chains on one named face, that face is never touched, and the face the patch
// presents is worked out from where the patch currently is. A vesicle's lumen becomes the cell's exterior
// when it fuses, and the cell's exterior becomes an endosome's lumen when it is taken back in, so the
// sugars are outside at every moment they are outside and inside a lumen at every moment they are in one.
// `sugarsFacing` never reports 'cytosol' because there is no path in this model that would put it there,
// which is §4.8's point made as a consequence rather than as an assertion.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — the surface filling a left pane with the ledger as a typographic table down the right;
//   narrow — the surface above and the ledger along the bottom, where its one number and its net line
//            stay legible, and the four process controls become a two-by-two group in the toolbar.
//
// Every frame is a function of the clock and the reader's actions: the model advances in fixed steps of
// 1/60 s from a seed, so setTime(t) reproduces a frame exactly. describe() is documented at the bottom.
import { el, h, text, C, tint, uid, clamp } from './lib/svg.js';
import { readoutCss, readoutTable, readoutHeight, fitRows, focusMark, round, mulberry32, INK } from './lib/mol-draw.js';
import { membranePart, ORGANELLE_BY_ID } from '../palette.js';

export const meta = { kind: 'bulk-transport', title: 'Four ways to move what will not fit', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

// ---------------------------------------------------------------- the model

const AREA0 = 1000; // µm² of plasma membrane on a small animal cell
const PINO_AREA = 0.031; // µm² carried by one 100 nm vesicle
const COAT_AREA = 0.05; // µm² carried by one coated vesicle
const PHAGO_AREA = 4.5; // µm² round a 1 µm bacterium
const EXO_AREA = 0.031; // µm² carried by one secretory vesicle: the same 100 nm bubble as a
// pinocytic one, so that matching the two RATES is what brings the ledger flat. Given a larger
// secretory granule the reader would have to match the two AREAS instead, which is true of a real
// cell and is not the arithmetic §4.8 makes.
const DRAWN_PER = 4; // real pinocytic vesicles per drawn one; see the header
const MACROPHAGE_RATE = 18; // vesicles a second: a whole surface in about half an hour
const MAX_EXO_RATE = 18;

// What the figure opens with. The opening state and reset() both read this, so "Reset" and "as it
// mounted" cannot drift apart. They had: Reset cleared the ledger and the traffic and left the four
// process toggles, the receptor count, both rate sliders and a broken LDL receptor exactly as the
// reader had set them, so a reader who had turned drinking up to 18 and broken the receptor pressed
// Reset and went on watching a cell that was still doing both.
const OPENING = { processes: ['receptor-mediated', 'pinocytosis'], receptorsWorking: true, receptorCount: 12, pinoRate: 6, exoRate: 0 };
const STEP = 1 / 60;
const MAX_STEPS_PER_CALL = 3600;

const PHAGO_STAGES = [
  { id: 'approach', name: 'A bacterium touches the surface', seconds: 1.4 },
  { id: 'arms', name: 'Actin pushes arms of membrane round it', seconds: 2.2 },
  { id: 'closed', name: 'The arms have met and fused: a phagosome', seconds: 1.2 },
  { id: 'to-lysosome', name: 'The phagosome meets a lysosome', seconds: 1.6 },
  { id: 'digesting', name: 'Digested, and the membrane is back in the pool', seconds: 1.6 },
];
const RME_STAGES = [
  { id: 'binding', name: 'LDL particles bind their receptors', seconds: 2.0 },
  { id: 'gathering', name: 'The loaded receptors gather into a dimple', seconds: 1.6 },
  { id: 'coating', name: 'Clathrin assembles a basket underneath', seconds: 1.4 },
  { id: 'pinching', name: 'The coated pit pinches off', seconds: 1.2 },
];

const PROCESSES = [
  { id: 'phagocytosis', label: 'Phagocytosis', aria: 'Phagocytosis, swallow a bacterium whole' },
  { id: 'pinocytosis', label: 'Pinocytosis', aria: 'Pinocytosis, drink the fluid outside' },
  { id: 'receptor-mediated', label: 'Receptor-mediated', aria: 'Receptor-mediated endocytosis, take in LDL particles' },
  { id: 'exocytosis', label: 'Exocytosis', aria: 'Exocytosis, bring a secretory vesicle up and fuse it' },
];

const NARROW_W = 640;
const NARROW_H = 340;

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-bulk')}
.tb-bulk { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 71fr) minmax(0, 29fr);
  grid-template-rows: minmax(0, 1fr);
  padding: 0.35rem 0.5rem var(--bk-pad, 3rem); column-gap: var(--space-3); row-gap: var(--space-2);
  font-family: var(--font-ui); }
.tb-bulk .bk-pane { position: relative; min-width: 0; min-height: 0; }
.tb-bulk .bk-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-bulk .bk-scene { grid-column: 1; grid-row: 1; }
.tb-bulk .bk-ledger { grid-column: 2; grid-row: 1; }
.tb-bulk svg text { font-family: var(--font-ui); }
.tb-bulk .bk-label { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.05em;
  stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round; paint-order: stroke; }
.tb-bulk .bk-stage { fill: var(--ink); font-weight: 600; stroke: var(--paper); stroke-width: 3px;
  stroke-linejoin: round; paint-order: stroke; }
.tb-bulk .fig-toolbar { justify-content: flex-start; }
.tb-bulk .bk-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-bulk .bk-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
.tb-bulk .bk-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-bulk .bk-slider { display: flex; align-items: center; gap: var(--space-1); color: var(--ink-soft); }
.tb-bulk .bk-slider input { width: 4.2rem; }
.tb-bulk .bk-slider b { font-weight: 600; font-variant-numeric: lining-nums tabular-nums;
  min-width: 3.6rem; color: var(--ink); }
.tb-bulk.is-narrow { grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) var(--bk-ledger-h, 104px); }
.tb-bulk.is-narrow .bk-scene { grid-column: 1; grid-row: 1; }
.tb-bulk.is-narrow .bk-ledger { grid-column: 1; grid-row: 2; }
.tb-bulk.is-narrow .fig-toolbar { gap: 0.22rem; left: var(--space-2); right: var(--space-2);
  bottom: var(--space-2); }
.tb-bulk.is-narrow .bk-group { gap: 0.22rem; }
.tb-bulk.is-narrow .bk-sep { display: none; }
.tb-bulk.is-narrow .fig-btn { padding: 0.18rem 0.38rem; font-size: 0.68rem; }
.tb-bulk.is-narrow .bk-slider { font-size: 0.68rem; gap: 0.15rem; }
.tb-bulk.is-narrow .bk-slider input { width: 3rem; }
.tb-bulk.is-narrow .bk-slider b { min-width: 3.1rem; }
/* The four processes are a two-by-two group on a phone rather than one long row. */
.tb-bulk.is-narrow .bk-processes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.22rem; }
`;

const fmt = (v, dp = 1) => v.toFixed(dp);

// A sentence broken into note rows that fit the column: readoutTable draws a note on one line and does
// not wrap, so anything longer than the column was cut off at the stage edge. Inter runs about 0.53 em a
// character at this size.
function noteRows(str, width, size) {
  const max = Math.max(10, Math.floor(width / (size * 0.53)));
  const lines = [];
  let cur = '';
  for (const word of str.split(' ')) {
    if (!cur) cur = word;
    else if (`${cur} ${word}`.length <= max) cur = `${cur} ${word}`;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines.map((line) => ({ note: line, size }));
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('bk');
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let ledgerPx = 0;
  let ready = false;

  const HEAD_C = membranePart('lipidHead').color;
  const TAIL_C = membranePart('lipidTail').color;
  const SUGAR_C = membranePart('sugarChain').color;
  const LDL_C = membranePart('cholesterol').color;
  // The two compartments are washes tinted from the CSS tokens, which flip with the theme. Tinted from
  // ORGANELLES.cytoplasm instead — a colour for a drawn organelle, and a fixed light hex — the cytoplasm
  // came out as a pale grey-brown slab across two thirds of the dark theme's stage.
  const LYSO_C = ORGANELLE_BY_ID.lysosome.color;
  const VESICLE_C = ORGANELLE_BY_ID.vesicle.color;

  // ---- state ----
  // A cell is always drinking, so the surface opens with drinking on: the cytoplasm then has traffic
  // in it from the first second, and the ledger starts drifting down, which is the argument §4.8 makes
  // about a macrophage that would otherwise vanish into itself within the hour.
  const running = new Set(OPENING.processes);
  let receptorsWorking = OPENING.receptorsWorking;
  let receptorCount = OPENING.receptorCount;
  let pinoRate = OPENING.pinoRate; // real vesicles per second
  let exoRate = OPENING.exoRate;
  let t = ctx.pinnedTime ?? 0;
  let playing = false;
  let steps = 0;
  let seed = 3;
  let rand = mulberry32(seed);

  let areaIn = 0; // µm² taken in since reset
  let areaOut = 0; // µm² added since reset
  let vesiclesIn = 0;
  let vesiclesOut = 0;
  let digested = 0;
  let ldlOutside = 24;
  let ldlBound = 0;
  let ldlInternalised = 0;

  let phago = { stage: -1, tStage: 0 };
  let rme = { stage: 0, tStage: 0 };
  let pinoAccum = 0;
  let exoAccum = 0;
  let drawn = []; // the vesicles actually on the stage

  // The marked patch: where it is, and which of its two faces carries the sugars. The face is never
  // changed — only where the patch is — and which way the sugars point is read from that.
  let patch = null; // { where: 'secretory' | 'surface' | 'endosome', at: number }

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-bulk' });
  wrap.append(h('style', { text: CSS }));
  const sceneSvg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'A stretch of cell surface with the outside above and cytoplasm below, running phagocytosis, pinocytosis, receptor-mediated endocytosis and exocytosis. Space runs and pauses, F marks a patch of membrane to follow, B breaks the LDL receptor, Home puts every control back where it opened.',
  });
  const ledgerSvg = el('svg', { 'aria-hidden': 'true' });
  const scenePane = h('div', { class: 'bk-pane bk-scene' }, [sceneSvg]);
  const ledgerPane = h('div', { class: 'bk-pane bk-ledger' }, [ledgerSvg]);

  const button = (label, aria, onClick, attrs = {}) => {
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': aria, text: label, ...attrs });
    node.addEventListener('click', onClick);
    return node;
  };

  const procBtns = PROCESSES.map((p) => button(p.label, p.aria, () => toggleProcess(p.id), { 'aria-pressed': String(running.has(p.id)) }));

  const slider = (label, min, max, step, value, unit, onInput, format) => {
    const input = h('input', { type: 'range', class: 'fig-range', min: String(min), max: String(max), step: String(step), value: String(value), 'aria-label': `${label}, ${min} to ${max} ${unit}` });
    const read = h('b', { text: format(value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      read.textContent = format(v);
      onInput(v);
    });
    return { node: h('label', { class: 'bk-slider fig-ui' }, [h('span', { text: label }), input, read]), input, set: (v) => { input.value = String(v); read.textContent = format(v); } };
  };

  const rateFmt = (v) => `${v} /s`;
  const drinkSlider = slider('Drinking', 0, MACROPHAGE_RATE, 1, pinoRate, 'vesicles a second', (v) => { pinoRate = v; if (v > 0) addProcess('pinocytosis'); paint(); announce(); }, rateFmt);
  const secreteSlider = slider('Secreting', 0, MAX_EXO_RATE, 1, exoRate, 'vesicles a second', (v) => { exoRate = v; if (v > 0) addProcess('exocytosis'); paint(); announce(); }, rateFmt);
  const receptorSlider = slider('Receptors', 0, 24, 1, receptorCount, 'receptors', (v) => { receptorCount = v; paint(); announce(); }, (v) => `${v}`);

  const btnBreak = button('Break receptor', 'Break receptor, give the cell a faulty LDL receptor', () => setReceptors(!receptorsWorking), { 'aria-pressed': String(!receptorsWorking) });
  const btnFollow = button('Follow a patch', 'Follow a patch, mark a piece of membrane and watch where it goes', () => markPatch());
  const btnRun = button('Run', 'Run, start the traffic', () => setPlaying(!playing), { class: 'fig-btn bk-primary' });
  const btnReset = button('Reset', 'Reset, put every control back where it opened and clear the ledger', () => reset());

  const group = (kids, cls = 'bk-group') => h('div', { class: cls }, kids);
  const sep = () => h('span', { class: 'bk-sep', 'aria-hidden': 'true' });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group(procBtns, 'bk-group bk-processes'),
    sep(),
    group([btnBreak, receptorSlider.node, drinkSlider.node, secreteSlider.node]),
    sep(),
    group([btnFollow, btnRun, btnReset]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(scenePane, ledgerPane, toolbar, live);
  root.append(wrap);

  // ---------------------------------------------------------------- the traffic

  function addProcess(id) {
    if (running.has(id)) return;
    running.add(id);
    const i = PROCESSES.findIndex((p) => p.id === id);
    if (i >= 0) procBtns[i].setAttribute('aria-pressed', 'true');
  }

  function toggleProcess(id) {
    if (running.has(id)) running.delete(id);
    else running.add(id);
    const i = PROCESSES.findIndex((p) => p.id === id);
    procBtns[i].setAttribute('aria-pressed', String(running.has(id)));
    if (id === 'phagocytosis') phago = { stage: running.has(id) ? 0 : -1, tStage: 0 };
    if (id === 'pinocytosis' && running.has(id) && pinoRate === 0) { pinoRate = 6; drinkSlider.set(6); }
    if (id === 'exocytosis' && running.has(id) && exoRate === 0) { exoRate = 6; secreteSlider.set(6); }
    paint();
    announce();
  }

  function setReceptors(next) {
    receptorsWorking = next;
    // A receptor that has just broken is not still holding a load: without this the coated pit already
    // under way delivered one more consignment, and the figure reported nine LDL particles taken in by
    // a receptor the reader had just switched off.
    if (!next) ldlBound = 0;
    btnBreak.setAttribute('aria-pressed', String(!receptorsWorking));
    paint();
    announce();
  }

  // The patch is marked on a secretory vesicle, which is where a piece of new membrane starts life.
  // The patch is marked on a secretory vesicle of its own, which is then drawn coming up and fusing.
  // Marked on "the next vesicle to be drawn" instead, it waited for the drinking counter to reach a
  // multiple of ten, and the reader who pressed the button saw nothing happen for several seconds.
  function markPatch() {
    patch = { where: 'secretory', at: steps * STEP };
    addProcess('exocytosis');
    drawn = drawn.filter((v) => !v.marked);
    spawn('exo', 0.38, true);
    paint();
    announce();
  }

  function spawn(kind, x, marked = false) {
    drawn.push({ kind, x, phase: 0, marked, seedJitter: rand() });
  }

  function advanceOneStep() {
    const dt = STEP;

    // ---- drinking: a rate, counted in full and drawn one in ten ----
    if (running.has('pinocytosis') && pinoRate > 0) {
      pinoAccum += pinoRate * dt;
      while (pinoAccum >= 1) {
        pinoAccum -= 1;
        vesiclesIn += 1;
        areaIn += PINO_AREA;
        if (vesiclesIn % DRAWN_PER === 0) spawn('pino', 0.08 + rand() * 0.84);
      }
    }
    // ---- secreting ----
    if (running.has('exocytosis') && exoRate > 0) {
      exoAccum += exoRate * dt;
      while (exoAccum >= 1) {
        exoAccum -= 1;
        vesiclesOut += 1;
        areaOut += EXO_AREA;
        if (vesiclesOut % DRAWN_PER === 0) spawn('exo', 0.08 + rand() * 0.84);
      }
    }
    // ---- phagocytosis: one cycle at a time ----
    if (running.has('phagocytosis')) {
      if (phago.stage < 0) phago = { stage: 0, tStage: 0 };
      phago.tStage += dt;
      const st = PHAGO_STAGES[phago.stage];
      if (phago.tStage >= st.seconds) {
        phago.tStage = 0;
        if (st.id === 'closed') { vesiclesIn += 1; areaIn += PHAGO_AREA; }
        if (st.id === 'digesting') { digested += 1; phago.stage = 0; } else phago.stage += 1;
      }
    } else phago = { stage: -1, tStage: 0 };

    // ---- receptor-mediated uptake ----
    if (running.has('receptor-mediated')) {
      rme.tStage += dt;
      const st = RME_STAGES[rme.stage];
      const cargo = receptorsWorking ? Math.min(receptorCount, Math.max(0, Math.round(ldlOutside * 0.4))) : 0;
      if (rme.tStage >= st.seconds) {
        rme.tStage = 0;
        if (st.id === 'binding') ldlBound = Math.min(cargo, ldlOutside);
        if (st.id === 'pinching') {
          vesiclesIn += 1;
          areaIn += COAT_AREA;
          ldlInternalised += ldlBound;
          ldlOutside = Math.max(0, ldlOutside - ldlBound);
          ldlBound = 0;
          if (patch && patch.where === 'surface') patch = { where: 'endosome', at: steps * STEP };
        }
        rme.stage = (rme.stage + 1) % RME_STAGES.length;
      }
      // The bloodstream keeps supplying LDL; a cell that cannot take it in is a cell it piles up around.
      ldlOutside = Math.min(40, ldlOutside + (receptorsWorking ? 1.2 : 2.4) * dt);
    }

    // ---- the drawn vesicles ----
    for (const v of drawn) v.phase += dt / (v.kind === 'exo' ? 1.5 : 1.8);
    const fused = drawn.some((v) => v.kind === 'exo' && v.marked && v.phase >= 1);
    if (fused && patch && patch.where === 'secretory') patch = { where: 'surface', at: steps * STEP };
    drawn = drawn.filter((v) => v.phase < 1.05);
    if (drawn.length > 26) drawn = drawn.slice(drawn.length - 26);

    steps += 1;
  }

  function advanceTo(target, budgetMs = 3000) {
    const next = Math.max(0, Number(target) || 0);
    const want = Math.floor(next / STEP);
    if (want < steps) restart(false);
    const until = performance.now() + budgetMs;
    const limit = Math.min(want, steps + MAX_STEPS_PER_CALL);
    while (steps < limit) {
      advanceOneStep();
      if (performance.now() > until) break;
    }
    t = steps < want ? steps * STEP : next;
  }

  // ---- reader actions ----
  function restart(redraw = true) {
    steps = 0;
    rand = mulberry32(seed);
    t = ctx.pinnedTime ?? 0;
    areaIn = 0;
    areaOut = 0;
    vesiclesIn = 0;
    vesiclesOut = 0;
    digested = 0;
    ldlOutside = 24;
    ldlBound = 0;
    ldlInternalised = 0;
    phago = { stage: running.has('phagocytosis') ? 0 : -1, tStage: 0 };
    rme = { stage: 0, tStage: 0 };
    pinoAccum = 0;
    exoAccum = 0;
    drawn = [];
    patch = null;
    if (redraw) {
      paint();
      announce();
    }
  }

  // Reset means "as it mounted": the four process toggles, the receptor count, both rate sliders and the
  // LDL receptor back to OPENING, and then the ledger and the traffic cleared from there. The seed moves
  // on so pressing it twice gives two different runs of the same cell; `seed` is not a state the figure
  // reports. `restart` is called after the toggles are set because it reads `running` to decide where
  // phagocytosis stands.
  function reset() {
    running.clear();
    for (const id of OPENING.processes) running.add(id);
    for (let i = 0; i < PROCESSES.length; i += 1) procBtns[i].setAttribute('aria-pressed', String(running.has(PROCESSES[i].id)));
    receptorsWorking = OPENING.receptorsWorking;
    btnBreak.setAttribute('aria-pressed', String(!receptorsWorking));
    receptorCount = OPENING.receptorCount;
    receptorSlider.set(receptorCount);
    pinoRate = OPENING.pinoRate;
    drinkSlider.set(pinoRate);
    exoRate = OPENING.exoRate;
    secreteSlider.set(exoRate);
    seed = (seed + 1) % 100000;
    restart(false);
    setPlaying(false);
    paint();
    announce();
  }

  function setPlaying(next) {
    playing = next && ctx.pinnedTime === null;
    btnRun.textContent = playing ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-label', playing ? 'Pause, hold the traffic where it is' : 'Run, start the traffic');
    if (playing) tick();
    else paint();
    announce();
  }

  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  function tick() {
    if (raf || destroyed || !playing || !visible) return;
    lastFrame = 0;
    const frame = (now) => {
      raf = 0;
      if (destroyed || !playing || !visible) return;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : STEP;
      lastFrame = now;
      advanceTo(t + dt, 6);
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); markPatch(); }
    else if (e.key === 'b' || e.key === 'B') { e.preventDefault(); setReceptors(!receptorsWorking); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
  };
  sceneSvg.addEventListener('keydown', onKey);

  // ---- what describe() reports ----

  // Which process is in the foreground, and what stage it has reached. Phagocytosis first, because it is
  // the one a reader is watching when it is on; then the coated pit, which has stages of its own; then
  // the two that are only a rate.
  function foreground() {
    if (running.has('phagocytosis') && phago.stage >= 0) return PHAGO_STAGES[phago.stage].name;
    if (running.has('receptor-mediated')) return RME_STAGES[rme.stage].name;
    if (running.has('exocytosis') && exoRate > 0) return 'Secretory vesicles fusing with the surface';
    if (running.has('pinocytosis') && pinoRate > 0) return 'Drinking, and selecting nothing';
    return null;
  }

  // Which face of the marked patch is presented, worked out from where the patch is. The sugars were put
  // on one face in the lumen of the endoplasmic reticulum and are never moved.
  function patchFace() {
    if (!patch) return null;
    if (patch.where === 'secretory') return 'vesicle-lumen';
    if (patch.where === 'surface') return 'cell-exterior';
    return 'endosome-lumen';
  }

  function state() {
    const areaNow = AREA0 - areaIn + areaOut;
    const face = patchFace();
    return {
      processes: PROCESSES.map((p) => p.id).filter((id) => running.has(id)),
      stageName: foreground(),
      receptorsWorking,
      receptorCount,
      ldlBound: Math.round(ldlBound),
      ldlInternalised: Math.round(ldlInternalised),
      ldlOutside: Math.round(ldlOutside),
      vesiclesIn,
      vesiclesOut,
      membraneAreaUm2: round(areaNow, 2),
      areaBalance: round(areaOut - areaIn, 2),
      pinocytosisRate: pinoRate,
      markedPatchFace: face,
      // A lumen is a lumen and the outside is the outside; the sugars are on the face that is one of
      // those two, always, and there is no state in this model that puts them against the cytosol.
      sugarsFacing: face === 'cell-exterior' ? 'exterior' : 'lumen',
      digested,
      t: round(t, 3),
      playing,
      layout: narrow ? 'narrow' : 'wide',
    };
  }

  function announce() {
    const d = state();
    live.textContent = `${d.processes.length ? d.processes.join(', ') : 'nothing'} running. Surface ${fmt(d.membraneAreaUm2, 1)} square micrometres, net change ${fmt(d.areaBalance, 2)}. ${d.vesiclesIn} vesicles in, ${d.vesiclesOut} out. LDL: ${d.ldlOutside} outside, ${d.ldlInternalised} taken in.${d.stageName ? ` ${d.stageName}.` : ''}`;
  }

  // ---------------------------------------------------------------- the surface, drawn

  const SURFACE_Y = 0.44; // where the membrane sits in the scene

  function drawScene(w, hgt) {
    sceneSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    sceneSvg.replaceChildren();
    const size = clamp(Math.min(w / 520, hgt / 320), 0.72, 1.3);
    const y = hgt * SURFACE_Y;
    const headR = Math.max(2.2, 4.6 * size);
    const memH = headR * 4.2;

    sceneSvg.append(el('rect', { x: 0, y: 0, width: fmt(w, 1), height: fmt(y, 1), fill: tint(C.water, 10) }));
    sceneSvg.append(el('rect', { x: 0, y: fmt(y + memH, 1), width: fmt(w, 1), height: fmt(Math.max(1, hgt - y - memH), 1), fill: tint(C.gold, 10) }));

    // The pit the coated vesicle forms in, and the arms phagocytosis pushes out, are both deformations
    // of the surface, so the surface is one path that knows about them rather than a straight line with
    // shapes laid over it.
    const pitX = w * 0.62;
    const pitDepth = rmeDepth() * memH * 2.1;
    const armX = w * 0.24;
    const armUp = phagoArms() * memH * 3.4;
    // The sheet is three paths and not four hundred nodes: a band of tail along the deformed surface,
    // and a row of heads on each face drawn as a dashed line whose dashes are round and one unit long,
    // which is a circle. Built as a circle and two strokes per lipid it came to four hundred elements a
    // frame, the frame went past fifty milliseconds, and the clock — which advances by at most fifty
    // milliseconds a frame — then ran at half the speed of the reader's own, so a phagosome took twenty
    // seconds to reach a lysosome instead of eight.
    const gap = headR * 2.0;
    const stepX = Math.max(3, gap / 3);
    const line = (off) => {
      let d = '';
      for (let x = 0; x <= w + stepX; x += stepX) {
        const cx = Math.min(w, x);
        const dy = surfaceOffset(cx, pitX, pitDepth, memH) - armOffset(cx, armX, armUp, w);
        d += `${d ? 'L' : 'M'}${fmt(cx, 1)} ${fmt(y + off + dy, 1)}`;
      }
      return d;
    };
    sceneSvg.append(el('path', { d: line(memH / 2), stroke: TAIL_C, 'stroke-width': fmt(Math.max(1, memH - headR * 1.2), 1), fill: 'none' }));
    for (const off of [headR, memH - headR]) {
      sceneSvg.append(el('path', {
        d: line(off), stroke: HEAD_C, 'stroke-width': fmt(headR * 2, 1), fill: 'none',
        'stroke-linecap': 'round', 'stroke-dasharray': `0.1 ${fmt(gap, 1)}`,
      }));
    }

    if (running.has('receptor-mediated')) drawPit(w, hgt, y, memH, pitX, pitDepth, size, headR);
    if (running.has('phagocytosis') && phago.stage >= 0) drawPhago(w, hgt, y, memH, armX, size);
    drawVesicles(w, hgt, y, memH, size);
    if (patch) drawPatch(w, hgt, y, memH, pitX, pitDepth, armX, armUp, size, headR);

    const lab = clamp(10.4 * size, 9.2, 11.6);
    sceneSvg.append(text(6, lab + 2, 'outside', { class: 'bk-label', 'font-size': fmt(lab, 1) }));
    sceneSvg.append(text(6, hgt - 6, 'cytoplasm', { class: 'bk-label', 'font-size': fmt(lab, 1) }));
    const stage = foreground();
    if (stage && w > 260) sceneSvg.append(text(w / 2, hgt - 6, stage, { anchor: 'middle', class: 'bk-stage', 'font-size': fmt(clamp(10.6 * size, 9.4, 11.8), 1) }));
    sceneSvg.append(focusMark(w, hgt));
  }

  // How deep the coated pit has become, 0 to 1.
  function rmeDepth() {
    if (!running.has('receptor-mediated')) return 0;
    const st = RME_STAGES[rme.stage];
    const f = clamp(rme.tStage / st.seconds, 0, 1);
    if (st.id === 'binding') return 0;
    if (st.id === 'gathering') return f * 0.35;
    if (st.id === 'coating') return 0.35 + f * 0.45;
    return 0.8 + f * 0.2;
  }

  // How far the phagocytic arms have risen, 0 to 1.
  function phagoArms() {
    if (phago.stage < 0) return 0;
    const st = PHAGO_STAGES[phago.stage];
    const f = clamp(phago.tStage / st.seconds, 0, 1);
    if (st.id === 'approach') return 0;
    if (st.id === 'arms') return f;
    if (st.id === 'closed') return 1 - f;
    return 0;
  }

  const bump = (x, cx, width) => Math.exp(-(((x - cx) / width) ** 2));
  function surfaceOffset(x, pitX, depth, memH) {
    return depth * bump(x, pitX, memH * 2.8);
  }
  function armOffset(x, armX, up, w) {
    const spread = w * 0.055;
    return up * (bump(x, armX - spread * 1.6, spread) + bump(x, armX + spread * 1.6, spread));
  }

  function drawPit(w, hgt, y, memH, pitX, pitDepth, size, headR) {
    const st = RME_STAGES[rme.stage];
    // The LDL outside, waiting; the ones that have bound sit on their receptors.
    const cargo = Math.round(ldlBound);
    const r = Math.max(2.6, 5 * size);
    const nOut = Math.min(14, Math.round(ldlOutside / 2));
    for (let i = 0; i < nOut; i += 1) {
      const px = w * (0.06 + ((i * 0.37) % 0.88));
      const py = y - memH * 0.6 - ((i * 13) % 5) * 6 * size - 6 * size;
      sceneSvg.append(el('circle', { cx: fmt(px, 1), cy: fmt(py, 1), r: fmt(r, 1), fill: LDL_C, opacity: 0.9 }));
    }
    // The receptors: stalks through the sheet, gathered into the dimple as the pit forms.
    const n = Math.max(0, Math.min(receptorCount, 24));
    for (let i = 0; i < n; i += 1) {
      const spread = 1 - rmeDepth() * 0.72;
      const frac = (i + 0.5) / n;
      const px = pitX + (frac - 0.5) * w * 0.8 * spread;
      const dy = surfaceOffset(px, pitX, pitDepth, memH);
      sceneSvg.append(el('path', {
        d: `M${fmt(px, 1)} ${fmt(y + dy - 4 * size, 1)} L${fmt(px, 1)} ${fmt(y + memH + dy + 3 * size, 1)}`,
        stroke: receptorsWorking ? C.violet : C.faint, 'stroke-width': fmt(Math.max(1.6, 2.6 * size), 1), 'stroke-linecap': 'round',
        'stroke-dasharray': receptorsWorking ? null : `${fmt(2.4 * size, 1)} ${fmt(2.2 * size, 1)}`,
      }));
      if (receptorsWorking && i < cargo) {
        sceneSvg.append(el('circle', { cx: fmt(px, 1), cy: fmt(y + dy - 8 * size, 1), r: fmt(r, 1), fill: LDL_C }));
      }
    }
    // The clathrin basket: short struts under the pit, once it is being coated.
    if (st.id === 'coating' || st.id === 'pinching') {
      const k = 9;
      for (let i = 0; i < k; i += 1) {
        const a = Math.PI * (0.12 + (0.76 * i) / (k - 1));
        const rr = memH * 1.5 + pitDepth * 0.5;
        const x0 = pitX - Math.cos(a) * rr;
        const y0 = y + memH + pitDepth * 0.9 + Math.sin(a) * rr * 0.6;
        const x1 = pitX - Math.cos(a) * (rr + 7 * size);
        const y1 = y + memH + pitDepth * 0.9 + Math.sin(a) * (rr + 7 * size) * 0.6;
        sceneSvg.append(el('path', { d: `M${fmt(x0, 1)} ${fmt(y0, 1)} L${fmt(x1, 1)} ${fmt(y1, 1)}`, stroke: C.soft, 'stroke-width': fmt(Math.max(1.2, 1.8 * size), 1), 'stroke-linecap': 'round' }));
      }
      if (!narrow) sceneSvg.append(text(pitX, y + memH + pitDepth + 26 * size, 'clathrin', { anchor: 'middle', class: 'bk-label', 'font-size': fmt(clamp(9.6 * size, 8.6, 10.4), 1) }));
    }
    void headR;
  }

  function drawPhago(w, hgt, y, memH, armX, size) {
    const st = PHAGO_STAGES[phago.stage];
    const f = clamp(phago.tStage / st.seconds, 0, 1);
    const br = Math.max(11, 24 * size);
    let bx = armX;
    let by = y - memH * 1.4 - br;
    let inside = false;
    if (st.id === 'approach') by = y - memH * 1.4 - br - (1 - f) * hgt * 0.16;
    else if (st.id === 'arms') by = y - memH * 0.5 - br * 0.2;
    else if (st.id === 'closed') { by = y + memH + br * 0.6; inside = true; }
    else if (st.id === 'to-lysosome') { bx = armX + (w * 0.2 - armX + armX) * 0 + f * w * 0.16; by = y + memH + br * 0.6 + f * hgt * 0.24; inside = true; }
    else { bx = armX + w * 0.16; by = y + memH + br * 0.6 + hgt * 0.24; inside = true; }

    if (inside) {
      // The phagosome: a bag of membrane round it.
      sceneSvg.append(el('circle', { cx: fmt(bx, 1), cy: fmt(by, 1), r: fmt(br * 1.42, 1), fill: 'none', stroke: HEAD_C, 'stroke-width': fmt(Math.max(2.4, 4 * size), 1) }));
    }
    // The bacterium: a rod with rounded ends, the colour chapter 3 gives a bacterial envelope.
    const digestFade = st.id === 'digesting' ? 1 - f : 1;
    const g = el('g', { opacity: fmt(clamp(digestFade, 0.12, 1), 2) });
    g.append(el('path', {
      d: `M${fmt(bx - br * 0.55, 1)} ${fmt(by, 1)} L${fmt(bx + br * 0.55, 1)} ${fmt(by, 1)}`,
      stroke: tint(C.leaf, 62), 'stroke-width': fmt(br * 1.1, 1), 'stroke-linecap': 'round',
    }));
    sceneSvg.append(g);

    if (st.id === 'to-lysosome' || st.id === 'digesting') {
      const lx = armX + w * 0.16;
      const ly = y + memH + br * 0.6 + hgt * 0.24;
      sceneSvg.append(el('circle', { cx: fmt(lx + br * 1.9, 1), cy: fmt(ly, 1), r: fmt(br * 0.95, 1), fill: LYSO_C }));
      if (!narrow) sceneSvg.append(text(lx + br * 1.9, ly + br * 1.9, 'lysosome', { anchor: 'middle', class: 'bk-label', 'font-size': fmt(clamp(9.6 * size, 8.6, 10.4), 1) }));
    }
  }

  function drawVesicles(w, hgt, y, memH, size) {
    for (const v of drawn) {
      if (v.marked) continue;
      const r = Math.max(4, (v.kind === 'exo' ? 8 : 7) * size);
      const x = v.x * w;
      const p = clamp(v.phase, 0, 1);
      const depth = hgt * 0.42;
      const yy = v.kind === 'exo' ? y + memH + depth * (1 - p) : y + memH + depth * p;
      const fill = v.kind === 'exo' ? VESICLE_C : tint(C.water, 30);
      sceneSvg.append(el('circle', { cx: fmt(x, 1), cy: fmt(yy, 1), r: fmt(r, 1), fill, stroke: HEAD_C, 'stroke-width': fmt(Math.max(1.8, 2.8 * size), 1), opacity: fmt(v.kind === 'exo' ? 1 - Math.max(0, p - 0.9) * 8 : 1, 2) }));
    }
  }

  // The marked patch, and the sugar chains standing on the one face they were built on. Where the patch
  // is drawn follows where it IS; which way the sugars point follows from that and from nothing else.
  function drawPatch(w, hgt, y, memH, pitX, pitDepth, armX, armUp, size, headR) {
    const where = patch.where;
    const g = el('g');
    const sugar = (x, yy, up) => {
      const len = 7 * size;
      g.append(el('path', {
        d: `M${fmt(x, 1)} ${fmt(yy, 1)} L${fmt(x, 1)} ${fmt(yy - up * len, 1)} M${fmt(x - 3 * size, 1)} ${fmt(yy - up * len, 1)} L${fmt(x + 3 * size, 1)} ${fmt(yy - up * len * 1.5, 1)}`,
        stroke: SUGAR_C, 'stroke-width': fmt(Math.max(1.4, 2 * size), 1), 'stroke-linecap': 'round', fill: 'none',
      }));
    };
    if (where === 'surface') {
      // In the sheet: the marked stretch of membrane, with its sugars standing up into the outside.
      const x0 = w * 0.38;
      const span = Math.max(30, w * 0.13);
      g.append(el('path', {
        d: `M${fmt(x0, 1)} ${fmt(y + memH / 2, 1)} L${fmt(x0 + span, 1)} ${fmt(y + memH / 2, 1)}`,
        stroke: C.ink, 'stroke-width': fmt(memH + 3, 1), 'stroke-linecap': 'butt', opacity: 0.14,
      }));
      for (let i = 0; i < 3; i += 1) sugar(x0 + span * (0.2 + i * 0.3), y + headR * 0.4, 1);
      g.append(text(x0 + span / 2, y - memH * 0.9, 'marked patch', { anchor: 'middle', class: 'bk-label', 'font-size': fmt(clamp(9.6 * size, 8.6, 10.4), 1) }));
    } else {
      // In a vesicle: the same face, now lining the lumen, so the sugars point inwards.
      const rider = drawn.find((v) => v.marked);
      const cx = where === 'secretory' ? w * 0.38 : w * 0.74;
      const cy = where === 'secretory'
        ? y + memH + hgt * 0.42 * (1 - clamp(rider ? rider.phase : 0, 0, 1)) + 24 * size
        : y + memH + hgt * 0.22;
      const r = Math.max(11, 20 * size);
      g.append(el('circle', { cx: fmt(cx, 1), cy: fmt(cy, 1), r: fmt(r, 1), fill: where === 'secretory' ? VESICLE_C : tint(C.water, 30), stroke: C.ink, 'stroke-width': fmt(Math.max(2.4, 3.6 * size), 1) }));
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2 + 0.5;
        const sx = cx + Math.cos(a) * (r - 2 * size);
        const sy = cy + Math.sin(a) * (r - 2 * size);
        const gg = el('g', { transform: `translate(${fmt(sx, 1)} ${fmt(sy, 1)}) rotate(${fmt((a * 180) / Math.PI + 90, 1)})` });
        gg.append(el('path', {
          d: `M0 0 L0 ${fmt(7 * size, 1)} M${fmt(-3 * size, 1)} ${fmt(7 * size, 1)} L${fmt(3 * size, 1)} ${fmt(10 * size, 1)}`,
          stroke: SUGAR_C, 'stroke-width': fmt(Math.max(1.4, 2 * size), 1), 'stroke-linecap': 'round', fill: 'none',
        }));
        g.append(gg);
      }
      // Short, because the long form ran into the lysosome beside it. What the face IS is a row in the
      // ledger, which has room for the words.
      g.append(text(cx, cy + r + 13 * size, 'marked patch', { anchor: 'middle', class: 'bk-label', 'font-size': fmt(clamp(9.6 * size, 8.6, 10.4), 1) }));
    }
    sceneSvg.append(g);
    void pitX; void pitDepth; void armX; void armUp;
  }

  // ---------------------------------------------------------------- the ledger

  function ledgerRows(d, w = 240) {
    const perMinute = d.pinocytosisRate * PINO_AREA * 60;
    const rows = [
      ['Surface area', `${fmt(d.membraneAreaUm2, 1)} µm²`],
      ['Net change', `${d.areaBalance > 0.005 ? '+' : d.areaBalance < -0.005 ? '−' : ''}${fmt(Math.abs(d.areaBalance), 2)} µm²`, { accent: Math.abs(d.areaBalance) > 1 ? INK.coral : undefined }],
      ['Vesicles, in · out', `${d.vesiclesIn} · ${d.vesiclesOut}`],
    ];
    if (!narrow) {
      rows.push({ head: 'LDL' });
      rows.push(['Outside', String(d.ldlOutside)]);
      rows.push(['Taken in', String(d.ldlInternalised)]);
      rows.push({ head: 'Also' });
      rows.push(['Drinking', `${fmt(perMinute, 1)} µm²/min`]);
      rows.push(['Bacteria digested', String(d.digested)]);
      if (d.markedPatchFace) rows.push(['Marked patch', d.markedPatchFace === 'cell-exterior' ? 'on the outside' : 'in a lumen']);
    }
    rows.push(...noteRows(sentence(d), w, 9.6));
    return rows;
  }

  // One sentence about the state the surface is actually in.
  function sentence(d) {
    if (!d.processes.length) return 'Nothing is running. Choose a process.';
    if (!receptorsWorking && d.ldlOutside > 26) return narrow ? 'The receptor is broken; the LDL is piling up outside.' : 'The receptor is broken, so the LDL is piling up outside and almost none is coming in.';
    if (d.markedPatchFace === 'cell-exterior') return 'The face that lined the vesicle is now the face that meets the world, sugars and all.';
    if (d.markedPatchFace === 'endosome-lumen') return 'Back inside, the same way round: that face is a lumen again.';
    if (Math.abs(d.areaBalance) < 0.5 && d.vesiclesIn + d.vesiclesOut > 20) return 'In and out are matched, so the surface is holding steady.';
    if (d.areaBalance < -1) return `The cell is losing surface: ${fmt(Math.abs(d.areaBalance), 1)} µm² gone. Secrete as fast as it drinks and the ledger goes flat.`;
    if (d.areaBalance > 1) return `The cell is gaining surface: ${fmt(d.areaBalance, 1)} µm² added. Drink as fast as it secretes and the ledger goes flat.`;
    return narrow ? 'Every vesicle carries its own area with it.' : 'Every vesicle carries its own area with it, in or out. Watch the ledger.';
  }

  let ledgerKey = '';

  function drawLedger(w, hgt, force = false) {
    const d = state();
    const rows = ledgerRows(d, w);
    // A table of figures changes a few times a second; the surface under it changes sixty times a
    // second. Redrawing both together put forty elements a frame into the document for nothing.
    const key = `${w}x${hgt}|${JSON.stringify(rows)}`;
    if (!force && key === ledgerKey) return;
    ledgerKey = key;
    ledgerSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    ledgerSvg.replaceChildren();
    const opts = { width: w, size: narrow ? 10.2 : 10.6, title: narrow ? null : 'The membrane ledger' };
    const { rowH } = fitRows(rows, hgt, opts, 13, 25);
    readoutTable(ledgerSvg, rows, { ...opts, rowH, x: 0, y: 0 });
  }

  // ---------------------------------------------------------------- layout

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }

  function paint() {
    if (destroyed) return;
    const [sw, sh] = paneBox(scenePane);
    drawScene(sw, sh);
    const [lw, lh] = paneBox(ledgerPane);
    drawLedger(lw, lh);
  }

  const draw = () => {
    ledgerKey = '';
    paint();
  };

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < NARROW_W || hgt < NARROW_H;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    if (narrow) {
      const rows = ledgerRows(state(), Math.max(120, w - 24));
      const want = Math.ceil(readoutHeight(rows, { size: 10.2, rowH: 20 })) + 10;
      if (want !== ledgerPx) {
        ledgerPx = want;
        wrap.style.setProperty('--bk-ledger-h', `${want}px`);
      }
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 20;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--bk-pad', `${pad}px`);
    }
    return true;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    draw();
    if (!ready) {
      ready = true;
      announce();
      ctx.onReady();
    }
  }

  restart(false);
  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) draw(); });
  onResize();
  void ns;

  return {
    destroy() {
      destroyed = true;
      playing = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      sceneSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(next) {
      if (destroyed) return;
      advanceTo(next);
      paint();
    },
    setVisible(v) {
      visible = v !== false;
      if (visible && playing) tick();
    },
    setTheme() {
      if (!destroyed && ready) draw();
    },
    // processes         which of the four are running
    // stageName         the stage the process in the foreground has reached
    // receptorsWorking  false once the LDL receptor has been broken
    // receptorCount     how many are in the sheet — what a statin raises
    // ldlBound, ldlInternalised, ldlOutside
    // vesiclesIn, vesiclesOut   counted in full, not as drawn
    // membraneAreaUm2   the running surface area, from 1000 µm²
    // areaBalance       net change since reset; 0 when the two flows match
    // pinocytosisRate   vesicles a second
    // markedPatchFace   vesicle-lumen | cell-exterior | endosome-lumen, never cytosol
    // sugarsFacing      exterior or lumen, worked out from where the patch is
    // digested          bacteria delivered to a lysosome
    // t                 clock, seconds
    // playing           whether the traffic is running
    // layout            wide | narrow
    describe() {
      return state();
    },
  };
}
