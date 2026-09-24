// The same two solutions, three times over. The reader sets one pair of concentrations and then puts
// them either side of a membrane in a U-tube, round a red blood cell, and round a walled plant cell.
// The panel that matters is identical in all three: the solute potential, the pressure potential and
// their sum for each side, with an arrow between them that always points from higher water potential to
// lower. Nothing else in the figure decides which way the water goes.
//
// THE ARITHMETIC IS THE CHAPTER'S. Solute potential is van 't Hoff: Ψs = −iMRT, with i the particles a
// formula unit gives, M the molarity, R = 8.314×10⁻³ L·MPa/(mol·K) and T = 310.15 K, so this bench is at
// body temperature. That gives −0.75 MPa for blood's 290 mOsm/L, which is the number §4.4 quotes, and
// −0.27 MPa for 0.1 mol/L of sucrose, against the −0.25 the same section quotes at 25 °C. Water moves
// from higher Ψ to lower at a rate proportional to the difference; the osmotic pressure a piston has to
// apply to stop it is the difference in solute potential, which is why the piston reads the number.
//
// THE THREE SCENES DIFFER IN ONE TERM. An animal cell has no wall, so Ψp stays at zero and everything
// arrives as volume; past about one and a half times its resting volume the membrane gives way, which is
// haemolysis. A walled cell can barely change volume, so the same arriving water becomes pressure
// instead: Ψp = E·(V−V₀)/V₀ with E = 4 MPa, a stiff wall, which brings a cell in pure water to about
// 0.7 MPa — the turgor §4.4 quotes, reached with no machinery at all. The U-tube has no cell in it and
// the piston supplies Ψp by hand.
//
// The limbs are drawn compressed, and the figure says so where it matters. A column of solution tall
// enough to balance a third of a megapascal would be thirty metres, because a millimetre of water is
// only about ten pascals; the drawn rise is a tenth of a millimetre to the pixel, so the level moving at
// all is the signal and the piston is the instrument that reads the number.
//
// UREA IS THE ONE CONTROL THAT CATCHES A MISCONCEPTION RATHER THAN SHOWING A FACT. It crosses the
// membrane, so it equalises; once it has, the cell's own solutes are left unbalanced and the cell bursts
// although the two solutions started iso-osmotic. Iso-osmotic is not isotonic, and the panel says which
// of the two it is reporting at every moment.
//
// NOTHING HERE SAYS THE SOLUTE PULLS, ATTRACTS OR HOLDS THE WATER. §4.4 rejects that picture: osmosis is
// the net movement of water, and its reason is the number of ways solute and water can be arranged once
// mixed (E. M. Kramer and D. R. Myers, "Five popular misconceptions about osmosis", Am. J. Phys. 80, 694,
// 2012). Water crosses both ways all the time, so "no flow" is always "no net flow", and every word the
// figure shows names the traffic or the potentials, never a solute doing something to the water.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — the vessel on the left, the potential panel and the trace in a right column;
//   narrow — the vessel above and the potential panel beneath it, and the trace dropped rather than
//            shrunk, because two series and an axis in a 390 px stage put the axis labels under nine
//            device pixels. The panel is already a table and only has to stack.
//
// Every frame is a function of the clock and the reader's actions: the model advances in fixed steps of
// 1/60 s, so setTime(t) reproduces a frame exactly. describe() is documented at the bottom of this file.
import { el, h, text, C, tint, uid, clamp } from './lib/svg.js';
import { readoutCss, readoutTable, readoutHeight, fitRows, focusMark, round, INK } from './lib/mol-draw.js';
import { ORGANELLE_BY_ID } from '../palette.js';

export const meta = { kind: 'osmometer', title: 'The same two solutions, three times over', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

// ---------------------------------------------------------------- the model

const R_MPA = 8.314e-3; // L·MPa per mol per K
const TEMP_K = 310.15; // body temperature, the temperature the chapter's numbers are at
const VAN_T_HOFF = R_MPA * TEMP_K; // MPa per mol/L of particles: 2.579

const SOLUTES = [
  { id: 'sugar', name: 'Sugar', particles: 1, permeant: false, note: 'one particle per molecule' },
  { id: 'salt', name: 'Salt', particles: 2, permeant: false, note: 'two particles: it dissociates' },
  { id: 'urea', name: 'Urea', particles: 1, permeant: true, note: 'one particle, and it crosses' },
];
const SOLUTE_BY_ID = Object.fromEntries(SOLUTES.map((s) => [s.id, s]));

const SCENES = [
  { id: 'osmometer', name: 'Osmometer', aria: 'Osmometer, a U-tube divided by a membrane' },
  { id: 'animal-cell', name: 'Animal cell', aria: 'Animal cell, a red blood cell with no wall' },
  { id: 'plant-cell', name: 'Plant cell', aria: 'Plant cell, with a cellulose wall' },
];

const WALL_E = 4.0; // MPa per unit of relative volume: a stiff cellulose wall
const LYSE_AT = 1.45; // relative volume at which a membrane with no wall gives way
const CRENATE_AT = 0.86;
const PLASMOLYSE_AT = 0.86;
const FLOW_K = 0.55; // relative volume per second per MPa of difference
const UREA_TAU = 4.0; // seconds for urea to equalise across the membrane
const STEP = 1 / 60;
const MAX_STEPS_PER_CALL = 3600;
const TUBE_K = 0.09; // metres of level per second per MPa, for the U-tube's limbs
// Below this difference in water potential nothing is moving worth reporting. It is set at the
// resolution of the piston — the reader can only apply pressure in steps of 0.05 MPa, so the best
// they can do is land within 0.025 of the balance point, and a figure that then said the flow was
// still running would be reporting the size of its own slider rather than the state of the water.
const FLOW_FLOOR = 0.02; // MPa
const MAX_MM = 600;
const MAX_PISTON = 2.0;

// What the figure opens with: a bath of 150 mmol/L of sugar round a cell holding 290, in the U-tube.
// The opening state and reset() both read this, so the two cannot drift apart.
const OPENING = { scene: 'osmometer', soluteKind: 'sugar', outsideMM: 150, insideMM: 290, pistonMPa: 0 };

const NARROW_W = 640;
const NARROW_H = 340;
const DROP_TRACE_W = 800;

const psiSolute = (osmMM) => -(VAN_T_HOFF * osmMM) / 1000;

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-osmo')}
.tb-osmo { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-columns: minmax(0, 53fr) minmax(0, 47fr);
  grid-template-rows: minmax(0, 1fr);
  padding: 0.35rem 0.5rem var(--os-pad, 3rem); column-gap: var(--space-4); row-gap: var(--space-2);
  font-family: var(--font-ui); }
.tb-osmo .os-pane { position: relative; min-width: 0; min-height: 0; }
.tb-osmo .os-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-osmo .os-scene { grid-column: 1; grid-row: 1; }
.tb-osmo .os-side { grid-column: 2; grid-row: 1; }
.tb-osmo svg text { font-family: var(--font-ui); }
.tb-osmo .os-col { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.tb-osmo .os-row { fill: var(--ink-soft); }
.tb-osmo .os-val { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-osmo .os-sum { fill: var(--ink); font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-osmo .os-arrow { fill: var(--ink); font-weight: 700; }
.tb-osmo .os-label { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.05em;
  stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round; paint-order: stroke; }
.tb-osmo .os-verdict { font-weight: 600; stroke: var(--paper); stroke-width: 3px;
  stroke-linejoin: round; paint-order: stroke; }
.tb-osmo .fig-toolbar { justify-content: flex-start; }
.tb-osmo .os-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-osmo .os-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
.tb-osmo .os-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-osmo .os-slider { display: flex; align-items: center; gap: var(--space-1); color: var(--ink-soft); }
.tb-osmo .os-slider input { width: 4.4rem; }
.tb-osmo .os-slider b { font-weight: 600; font-variant-numeric: lining-nums tabular-nums;
  min-width: 4.2rem; color: var(--ink); }
.tb-osmo.is-narrow { grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) var(--os-side-h, 120px); }
.tb-osmo.is-narrow .os-scene { grid-column: 1; grid-row: 1; }
.tb-osmo.is-narrow .os-side { grid-column: 1; grid-row: 2; }
.tb-osmo.is-narrow .fig-toolbar { gap: 0.22rem; left: var(--space-2); right: var(--space-2);
  bottom: var(--space-2); }
.tb-osmo.is-narrow .os-group { gap: 0.22rem; }
.tb-osmo.is-narrow .os-sep { display: none; }
.tb-osmo.is-narrow .fig-btn { padding: 0.18rem 0.38rem; font-size: 0.68rem; }
.tb-osmo.is-narrow .os-slider { font-size: 0.68rem; gap: 0.15rem; }
.tb-osmo.is-narrow .os-slider input { width: 3.2rem; }
.tb-osmo.is-narrow .os-slider b { min-width: 2.7rem; }
`;

const fmt = (v, dp = 2) => v.toFixed(dp);

// A sentence broken into note rows that fit the column: readoutTable draws a note on one line and does
// not wrap, so anything longer than the column was cut off at the stage edge.
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
const signedMPa = (v) => `${v > 0.0005 ? '+' : v < -0.0005 ? '−' : ''}${Math.abs(v).toFixed(2)}`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('os');
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let sidePx = 0;
  let ready = false;

  const MEMBRANE_C = ORGANELLE_BY_ID.membrane.color;
  const CYTO_C = ORGANELLE_BY_ID.cytoplasm.color;

  // ---- state ----
  // OPENING is what the figure mounts with, and reset() reads the same object, so "Reset" and "as it
  // mounted" cannot drift apart. They had: Reset put the piston back and started the run again and left
  // the scene, the solute and both solute sliders where the reader had put them, so a bath walked up to
  // 600 mmol/L survived a Reset and went on being measured while the reader believed they were back at
  // the opening 150.
  let scene = OPENING.scene;
  let soluteKind = OPENING.soluteKind;
  let soluteOutsideMM = OPENING.outsideMM;
  let soluteInsideMM = OPENING.insideMM; // the cell's own impermeant solutes, and the U-tube's right limb
  let pistonMPa = OPENING.pistonMPa;
  let t = ctx.pinnedTime ?? 0;
  let playing = false;
  let steps = 0;
  let volumeFraction = 1;
  let ureaInsideMM = 0;
  let levelMm = 0; // how far the concentrated limb has risen, in millimetres of solution
  let burst = false;
  let trace = [];

  const solute = () => SOLUTE_BY_ID[soluteKind];

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-osmo' });
  wrap.append(h('style', { text: CSS }));
  const sceneSvg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'One pair of solutions in three scenes: a U-tube divided by a membrane, a red blood cell, and a walled plant cell. Space runs and pauses, left and right arrows change the scene, P presses the piston, Home puts every control back where it opened.',
  });
  const sideSvg = el('svg', { 'aria-hidden': 'true' });
  const scenePane = h('div', { class: 'os-pane os-scene' }, [sceneSvg]);
  const sidePane = h('div', { class: 'os-pane os-side' }, [sideSvg]);

  const button = (label, aria, onClick, attrs = {}) => {
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': aria, text: label, ...attrs });
    node.addEventListener('click', onClick);
    return node;
  };

  const sceneBtns = SCENES.map((s) => button(s.name, s.aria, () => setScene(s.id), { 'aria-pressed': String(s.id === scene) }));
  const soluteBtns = SOLUTES.map((s) => button(s.name, `${s.name} outside, ${s.note}`, () => setSolute(s.id), { 'aria-pressed': String(s.id === soluteKind) }));

  const slider = (label, min, max, step, value, unit, onInput, format) => {
    const input = h('input', { type: 'range', class: 'fig-range', min: String(min), max: String(max), step: String(step), value: String(value), 'aria-label': `${label}, ${min} to ${max} ${unit}` });
    const read = h('b', { text: format(value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      read.textContent = format(v);
      onInput(v);
    });
    return { node: h('label', { class: 'os-slider fig-ui' }, [h('span', { text: label }), input, read]), input, set: (v) => { input.value = String(v); read.textContent = format(v); } };
  };

  const mmFmt = (v) => `${Math.round(v)}${narrow ? ' mM' : ' mmol/L'}`;
  const outSlider = slider('Outside', 0, MAX_MM, 5, soluteOutsideMM, 'millimolar', (v) => { soluteOutsideMM = v; restartRun(); }, mmFmt);
  const inSlider = slider('Inside', 0, MAX_MM, 5, soluteInsideMM, 'millimolar', (v) => { soluteInsideMM = v; restartRun(); }, mmFmt);
  const pistonSlider = slider('Piston', 0, MAX_PISTON, 0.05, pistonMPa, 'megapascals', (v) => { pistonMPa = v; paint(); announce(); }, (v) => `${fmt(v, 2)} MPa`);

  const btnRun = button('Run', 'Run, let the water move', () => setPlaying(!playing), { class: 'fig-btn os-primary' });
  const btnReset = button('Reset', 'Reset, put every control back where it opened and start again', () => reset());

  const group = (kids) => h('div', { class: 'os-group' }, kids);
  const sep = () => h('span', { class: 'os-sep', 'aria-hidden': 'true' });
  const pistonGroup = group([pistonSlider.node]);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group(sceneBtns),
    sep(),
    group([...soluteBtns, outSlider.node, inSlider.node]),
    pistonGroup,
    sep(),
    group([btnRun, btnReset]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(scenePane, sidePane, toolbar, live);
  root.append(wrap);

  // ---------------------------------------------------------------- the model

  // The osmolarity of each side now. Inside, the cell's own solutes are concentrated or diluted by the
  // volume it has, and any urea that has crossed is added to them. Outside is a bath: big enough that
  // what leaves it does not change it, which is what a bath means.
  function osmolarity() {
    const s = solute();
    const outside = soluteOutsideMM * s.particles;
    const own = (scene === 'osmometer' ? soluteInsideMM : soluteInsideMM) / Math.max(0.2, volumeFraction);
    return { outside, inside: own + ureaInsideMM, own };
  }

  function potentials() {
    const o = osmolarity();
    const psiSoluteOutside = psiSolute(o.outside);
    const psiSoluteInside = psiSolute(o.inside);
    let psiPressureInside = 0;
    if (scene === 'plant-cell') psiPressureInside = Math.max(0, WALL_E * (volumeFraction - 1));
    else if (scene === 'osmometer') psiPressureInside = pistonMPa;
    return {
      psiSoluteOutside,
      psiSoluteInside,
      psiPressureInside,
      psiOutside: psiSoluteOutside,
      psiInside: psiSoluteInside + psiPressureInside,
      osmolarityOutside: o.outside,
      osmolarityInside: o.inside,
    };
  }

  function advanceOneStep() {
    const s = solute();
    if (s.permeant && scene !== 'osmometer') {
      // Urea crosses, so it equalises. Once it has, the cell's own solutes are left unbalanced.
      ureaInsideMM += ((soluteOutsideMM - ureaInsideMM) / UREA_TAU) * STEP;
    } else if (s.permeant) {
      ureaInsideMM += ((soluteOutsideMM - ureaInsideMM) / UREA_TAU) * STEP;
    }
    const p = potentials();
    const drive = p.psiOutside - p.psiInside; // positive drives water in
    if (scene === 'osmometer') {
      // The concentrated limb rises until the head of solution, or the piston, stops the flow. A
      // millimetre of water is 9.81 Pa, so a metre is not much beside a megapascal — which is why an
      // osmometer's tube has to be tall, and why the piston is the quicker way to the same number.
      levelMm = clamp(levelMm + drive * TUBE_K * STEP * 1000, -400, 400);
    } else if (!burst) {
      volumeFraction = clamp(volumeFraction + drive * FLOW_K * STEP, 0.42, LYSE_AT + 0.02);
      if (scene === 'animal-cell' && volumeFraction >= LYSE_AT) burst = true;
    }
    steps += 1;
    const tt = steps * STEP;
    const last = trace[trace.length - 1];
    // Two series, whichever scene is running: what the water has done, and what pressure has built. In
    // the tube that is the level in the limbs and the piston; in a cell it is the volume and its wall.
    const a = scene === 'osmometer' ? clamp(0.5 + levelMm / 300, 0, 1) : clamp((volumeFraction - 0.5) / 1.1, 0, 1);
    const b = clamp(p.psiPressureInside / 1.2, 0, 1);
    if (!last || tt - last.t >= 0.08) trace.push({ t: tt, a, b });
    while (trace.length > 2 && trace[0].t < tt - 24) trace.shift();
  }

  function advanceTo(target, budgetMs = 3000) {
    const next = Math.max(0, Number(target) || 0);
    const want = Math.floor(next / STEP);
    if (want < steps) restartRun(false);
    const until = performance.now() + budgetMs;
    const limit = Math.min(want, steps + MAX_STEPS_PER_CALL);
    while (steps < limit) {
      advanceOneStep();
      if (performance.now() > until) break;
    }
    t = steps < want ? steps * STEP : next;
  }

  // ---- reader actions ----
  function restartRun(redraw = true) {
    steps = 0;
    t = ctx.pinnedTime ?? 0;
    volumeFraction = 1;
    ureaInsideMM = 0;
    levelMm = 0;
    burst = false;
    trace = [{ t: 0, a: scene === 'osmometer' ? 0.5 : 0.4545, b: 0 }];
    if (redraw) {
      paint();
      announce();
    }
  }

  function setScene(id) {
    if (scene === id) return;
    scene = id;
    for (let i = 0; i < SCENES.length; i += 1) sceneBtns[i].setAttribute('aria-pressed', String(SCENES[i].id === scene));
    pistonGroup.style.display = scene === 'osmometer' ? '' : 'none';
    if (scene !== 'osmometer') pistonMPa = 0;
    restartRun(false);
    // A new scene is a new experiment, so it starts stopped, as the first one did. Left running, the
    // cell had already begun to swell before the reader had looked at it.
    setPlaying(false);
    draw();
    announce();
  }

  function setSolute(id) {
    if (soluteKind === id) return;
    soluteKind = id;
    for (let i = 0; i < SOLUTES.length; i += 1) soluteBtns[i].setAttribute('aria-pressed', String(SOLUTES[i].id === soluteKind));
    restartRun(false);
    setPlaying(false);
    draw();
    announce();
  }

  // Reset means "as it mounted": the scene, the solute, both solute sliders and the piston back to
  // OPENING, and the run started again from there. The scene SWITCH still carries the solutions over —
  // that is the comparison the three scenes exist to make — which is a different control and says so.
  function reset() {
    scene = OPENING.scene;
    soluteKind = OPENING.soluteKind;
    soluteOutsideMM = OPENING.outsideMM;
    soluteInsideMM = OPENING.insideMM;
    pistonMPa = OPENING.pistonMPa;
    for (let i = 0; i < SCENES.length; i += 1) sceneBtns[i].setAttribute('aria-pressed', String(SCENES[i].id === scene));
    for (let i = 0; i < SOLUTES.length; i += 1) soluteBtns[i].setAttribute('aria-pressed', String(SOLUTES[i].id === soluteKind));
    pistonGroup.style.display = scene === 'osmometer' ? '' : 'none';
    outSlider.set(soluteOutsideMM);
    inSlider.set(soluteInsideMM);
    pistonSlider.set(pistonMPa);
    restartRun(false);
    setPlaying(false);
    draw();
    announce();
  }

  function setPlaying(next) {
    playing = next && ctx.pinnedTime === null;
    btnRun.textContent = playing ? 'Pause' : 'Run';
    btnRun.setAttribute('aria-label', playing ? 'Pause, hold the water where it is' : 'Run, let the water move');
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
    const i = SCENES.findIndex((s) => s.id === scene);
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setScene(SCENES[(i + 1) % SCENES.length].id); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setScene(SCENES[(i + SCENES.length - 1) % SCENES.length].id); }
    else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (scene === 'osmometer') {
        pistonMPa = clamp(round(pistonMPa + 0.05, 2), 0, MAX_PISTON);
        pistonSlider.set(pistonMPa);
        paint();
        announce();
      }
    } else if (e.key === 'Home') { e.preventDefault(); reset(); }
  };
  sceneSvg.addEventListener('keydown', onKey);

  // ---- what describe() reports ----
  function outcomeOf(p) {
    if (scene === 'osmometer') return 'normal';
    if (scene === 'animal-cell') {
      if (burst) return 'lysed';
      if (volumeFraction > 1.04) return 'swollen';
      if (volumeFraction < CRENATE_AT) return 'crenated';
      return 'normal';
    }
    if (volumeFraction < PLASMOLYSE_AT) return 'plasmolysed';
    if (p.psiPressureInside > 0.04) return 'turgid';
    return 'flaccid';
  }

  function state() {
    const p = potentials();
    const s = solute();
    const drive = p.psiOutside - p.psiInside;
    // Tonicity is about the cell, not about the solution: what counts is the solute the membrane can
    // stop. Urea cannot be stopped, so a bath of it is iso-osmotic and still hypotonic.
    const effectiveOutside = s.permeant ? 0 : p.osmolarityOutside;
    const impermeantInside = p.osmolarityInside - (s.permeant ? ureaInsideMM : 0);
    const tonicity = effectiveOutside > impermeantInside * 1.02 ? 'hypertonic'
      : effectiveOutside < impermeantInside * 0.98 ? 'hypotonic' : 'isotonic';
    const osmotic = Math.abs(psiSolute(p.osmolarityOutside) - psiSolute(p.osmolarityInside));
    return {
      scene,
      soluteInsideMM: round(soluteInsideMM, 0),
      soluteOutsideMM: round(soluteOutsideMM, 0),
      soluteKind,
      permeantSolute: s.permeant,
      osmolarityInside: round(p.osmolarityInside, 0),
      osmolarityOutside: round(p.osmolarityOutside, 0),
      psiSoluteInside: round(p.psiSoluteInside, 3),
      psiSoluteOutside: round(p.psiSoluteOutside, 3),
      psiPressureInside: round(p.psiPressureInside, 3),
      psiInside: round(p.psiInside, 3),
      psiOutside: round(p.psiOutside, 3),
      tonicity,
      netWaterFlow: drive > FLOW_FLOOR ? 'in' : drive < -FLOW_FLOOR ? 'out' : 'none',
      volumeFraction: round(volumeFraction, 3),
      outcome: outcomeOf(p),
      pistonMPa: round(pistonMPa, 2),
      osmoticPressureMPa: round(osmotic, 3),
      equilibrated: Math.abs(drive) <= FLOW_FLOOR,
      t: round(t, 3),
      playing,
      layout: narrow ? 'narrow' : 'wide',
    };
  }

  // Tonicity is spoken as a relation, because §4.4 says it is one: a bath is hypotonic TO a cell. The
  // U-tube has no cell, so there it is the outside against the inside and no outcome is claimed; and a
  // balance is "no net flow", because water goes on crossing both ways when the potentials match.
  function announce() {
    const d = state();
    const flow = d.netWaterFlow === 'none' ? 'No net flow of water' : `Water moving ${d.netWaterFlow}`;
    const tail = scene === 'osmometer'
      ? `The outside is ${d.tonicity} to the inside.`
      : `The bath is ${d.tonicity} to the cell, and the cell is ${OUTCOME_WORD[d.outcome].split(' — ')[0].toLowerCase()}.`;
    live.textContent = `${SCENES.find((s) => s.id === scene).name}. Outside ${d.osmolarityOutside} milliosmoles per litre, inside ${d.osmolarityInside}. Water potential outside ${signedMPa(d.psiOutside)} megapascals, inside ${signedMPa(d.psiInside)}. ${flow}. ${tail}`;
  }

  // ---------------------------------------------------------------- the scenes

  const OUTCOME_WORD = {
    swollen: 'Swollen', lysed: 'Lysed — the membrane has given way', normal: 'Unchanged',
    crenated: 'Crenated — shrunk and puckered', turgid: 'Turgid', flaccid: 'Flaccid — the wall is slack',
    plasmolysed: 'Plasmolysed — shrunk away from its wall',
  };

  function drawScene(w, hgt) {
    sceneSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    sceneSvg.replaceChildren();
    const d = state();
    if (scene === 'osmometer') drawTube(w, hgt, d);
    else drawCell(w, hgt, d);
    sceneSvg.append(focusMark(w, hgt));
  }

  // A U-tube: two limbs joined at the foot by a channel with the membrane across it. The glass is one
  // stroked path, as a beaker is on the pH bench, so there is no drawn rectangle anywhere.
  function drawTube(w, hgt, d) {
    const size = clamp(Math.min(w / 460, hgt / 300), 0.75, 1.3);
    const limbW = clamp(w * 0.14, 34, 58);
    const pad = Math.max(10, w * 0.07);
    const leftX = pad;
    const rightX = w - pad - limbW;
    const inL = leftX + limbW;
    const inR = rightX;
    const mid = (inL + inR) / 2;
    const topY = hgt * 0.08;
    const footY = hgt * 0.80;
    const chanTop = footY - clamp(hgt * 0.1, 16, 34);
    const base = topY + (chanTop - topY) * 0.34;

    // A rise in one limb is a fall in the other: the water has to come from somewhere.
    const rise = clamp(levelMm * 0.22, -(base - topY - 8), chanTop - base - 10);
    const leftLevel = base + rise / 2;
    const rightLevel = base - rise / 2;

    const liquid = (x, level, colour) => {
      sceneSvg.append(el('rect', { x: fmt(x, 1), y: fmt(level, 1), width: fmt(Math.max(1, limbW), 1), height: fmt(Math.max(1, chanTop - level), 1), fill: colour }));
      sceneSvg.append(el('line', { x1: fmt(x, 1), y1: fmt(level, 1), x2: fmt(x + limbW, 1), y2: fmt(level, 1), stroke: C.ruleStrong, 'stroke-width': 1.6 }));
    };
    liquid(leftX, leftLevel, tint(C.water, 24));
    liquid(rightX, rightLevel, tint(C.violet, 22));
    // The channel at the foot, half of each solution, with the membrane across the middle.
    sceneSvg.append(el('rect', { x: fmt(leftX, 1), y: fmt(chanTop, 1), width: fmt(Math.max(1, mid - leftX), 1), height: fmt(Math.max(1, footY - chanTop), 1), fill: tint(C.water, 24) }));
    sceneSvg.append(el('rect', { x: fmt(mid, 1), y: fmt(chanTop, 1), width: fmt(Math.max(1, rightX + limbW - mid), 1), height: fmt(Math.max(1, footY - chanTop), 1), fill: tint(C.violet, 22) }));

    sceneSvg.append(el('path', {
      d: `M${fmt(leftX, 1)} ${fmt(topY, 1)} L${fmt(leftX, 1)} ${fmt(footY, 1)} L${fmt(rightX + limbW, 1)} ${fmt(footY, 1)} L${fmt(rightX + limbW, 1)} ${fmt(topY, 1)}`
        + ` M${fmt(inL, 1)} ${fmt(topY, 1)} L${fmt(inL, 1)} ${fmt(chanTop, 1)} L${fmt(inR, 1)} ${fmt(chanTop, 1)} L${fmt(inR, 1)} ${fmt(topY, 1)}`,
      fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.8, 'stroke-linejoin': 'round',
    }));
    sceneSvg.append(el('line', {
      x1: fmt(mid, 1), y1: fmt(chanTop + 1.5, 1), x2: fmt(mid, 1), y2: fmt(footY - 1.5, 1),
      stroke: MEMBRANE_C, 'stroke-width': Math.max(3.4, 5.5 * size), 'stroke-dasharray': `${fmt(3.2 * size, 1)} ${fmt(2.4 * size, 1)}`, 'stroke-linecap': 'round',
    }));

    // The piston, on the limb the water is arriving in: a bar resting on the solution with a shaft. What
    // it is applying is named in the reading rather than written over the glass.
    if (pistonMPa > 0) {
      const py = rightLevel - 2;
      sceneSvg.append(el('line', { x1: fmt(rightX + 1, 1), y1: fmt(py, 1), x2: fmt(rightX + limbW - 1, 1), y2: fmt(py, 1), stroke: C.ink, 'stroke-width': Math.max(3.5, 5 * size), 'stroke-linecap': 'round' }));
      sceneSvg.append(el('line', { x1: fmt(rightX + limbW / 2, 1), y1: fmt(Math.max(topY - 10, py - 30 * size), 1), x2: fmt(rightX + limbW / 2, 1), y2: fmt(py, 1), stroke: C.ink, 'stroke-width': Math.max(2, 3 * size) }));
    }

    const lab = clamp(10.4 * size, 9.2, 11.6);
    // Never above the pane: on a short stage `topY - 5` put the two words half off the top of it.
    const labY = Math.max(lab, topY - 5);
    sceneSvg.append(text(leftX + limbW / 2, labY, 'outside', { anchor: 'middle', class: 'os-label', 'font-size': fmt(lab, 1) }));
    sceneSvg.append(text(rightX + limbW / 2, labY, 'inside', { anchor: 'middle', class: 'os-label', 'font-size': fmt(lab, 1) }));
    // Urea crosses this membrane too — the model moves it into the inside limb — so with urea chosen the
    // label names it, rather than saying the membrane stops the solute while the urea is going through.
    const passes = solute().permeant
      ? (narrow ? 'membrane: water and urea only' : 'membrane: water and urea yes, the rest no')
      : (narrow ? 'membrane: water only' : 'membrane: water yes, solute no');
    sceneSvg.append(text(mid, chanTop - 7, passes, { anchor: 'middle', class: 'os-label', 'font-size': fmt(lab * 0.9, 1) }));

    const verdict = d.equilibrated && pistonMPa > 0
      ? (narrow ? `Stopped, at ${fmt(pistonMPa, 2)} MPa.` : `The flow has stopped, with the piston holding ${fmt(pistonMPa, 2)} MPa against it.`)
      : d.netWaterFlow === 'none' ? (narrow ? 'No net flow: the potentials match.' : 'No net flow: the two potentials already match.')
        : narrow ? `Crossing to the ${d.netWaterFlow === 'in' ? 'inside' : 'outside'}; ${fmt(d.osmoticPressureMPa, 2)} MPa stops it.`
          : `Water is crossing to the ${d.netWaterFlow === 'in' ? 'inside' : 'outside'} limb. It takes ${fmt(d.osmoticPressureMPa, 2)} MPa to stop it.`;
    sceneSvg.append(text(mid, hgt - 6, verdict, { anchor: 'middle', class: 'os-verdict', fill: C.ink, 'font-size': fmt(clamp(10 * size, 9, 11), 1) }));
  }

  // A cell in a bath. The animal cell is a disc that changes size and, past its limit, breaks; the walled
  // cell keeps the outline of its wall whatever the contents do, which is the whole difference.
  function drawCell(w, hgt, d) {
    const size = clamp(Math.min(w / 460, hgt / 300), 0.72, 1.35);
    const cx = w / 2;
    const cy = hgt * 0.46;
    const bath = solute().permeant ? tint(C.gold, 13) : tint(C.water, 13);
    sceneSvg.append(el('rect', { x: 0, y: 0, width: fmt(w, 1), height: fmt(hgt, 1), fill: bath }));

    const rest = Math.min(w, hgt) * 0.25;
    const rad = rest * Math.sqrt(clamp(volumeFraction, 0.4, LYSE_AT + 0.05));

    if (scene === 'animal-cell') {
      if (d.outcome === 'crenated') {
        const pts = [];
        const spikes = 13;
        for (let i = 0; i < spikes * 2; i += 1) {
          const a = (i / (spikes * 2)) * Math.PI * 2;
          const rr = rad * (i % 2 === 0 ? 1.0 : 0.82);
          pts.push(`${fmt(cx + Math.cos(a) * rr, 1)} ${fmt(cy + Math.sin(a) * rr, 1)}`);
        }
        sceneSvg.append(el('path', { d: `M${pts.join('L')}Z`, fill: CYTO_C, stroke: MEMBRANE_C, 'stroke-width': Math.max(2, 3.4 * size), 'stroke-linejoin': 'round' }));
      } else if (d.outcome === 'lysed') {
        // A ghost: the membrane torn open, and the haemoglobin gone into the water round it, which is
        // what turns the water red and is how haemolysis is seen.
        for (let i = 0; i < 16; i += 1) {
          const a = (i / 16) * Math.PI * 2 + 0.3;
          const rr = rad * (1.5 + (i % 3) * 0.42);
          sceneSvg.append(el('circle', { cx: fmt(cx + Math.cos(a) * rr, 1), cy: fmt(cy + Math.sin(a) * rr * 0.86, 1), r: fmt(Math.max(2, 4.2 * size), 1), fill: tint(C.coral, 42), opacity: 0.75 }));
        }
        sceneSvg.append(el('path', {
          d: `M${fmt(cx + rad, 1)} ${fmt(cy, 1)} A${fmt(rad, 1)} ${fmt(rad, 1)} 0 1 1 ${fmt(cx + rad * Math.cos(-0.85), 1)} ${fmt(cy + rad * Math.sin(-0.85), 1)}`,
          fill: 'none', stroke: MEMBRANE_C, 'stroke-width': Math.max(2, 3.4 * size), 'stroke-linecap': 'round',
        }));
      } else {
        sceneSvg.append(el('circle', { cx: fmt(cx, 1), cy: fmt(cy, 1), r: fmt(rad, 1), fill: CYTO_C, stroke: MEMBRANE_C, 'stroke-width': Math.max(2, 3.4 * size) }));
        // A red cell is a disc with a dimple, and it rounds up as it fills: the dimple closes as the
        // volume rises, which is the first thing that happens and the easiest to miss.
        const dimple = clamp((1.06 - volumeFraction) * 2.4, 0, 1);
        if (dimple > 0.02) sceneSvg.append(el('ellipse', { cx: fmt(cx, 1), cy: fmt(cy, 1), rx: fmt(rad * 0.42 * dimple, 1), ry: fmt(rad * 0.3 * dimple, 1), fill: tint(C.coral, 22), opacity: fmt(dimple, 2) }));
      }
    } else {
      // The wall keeps its outline through everything, which is why a dead plant cell still has one.
      const wallR = rest * 1.16;
      const wall = el('rect', {
        x: fmt(cx - wallR, 1), y: fmt(cy - wallR * 0.82, 1), width: fmt(wallR * 2, 1), height: fmt(wallR * 1.64, 1),
        rx: fmt(wallR * 0.3, 1), fill: 'none', stroke: MEMBRANE_C, 'stroke-width': Math.max(3, 6 * size), 'stroke-linejoin': 'round',
      });
      const inner = rest * Math.sqrt(clamp(volumeFraction, 0.4, 1.4));
      const gap = Math.max(0, wallR - inner) * 0.9;
      sceneSvg.append(el('rect', {
        x: fmt(cx - wallR + gap + 3, 1), y: fmt(cy - wallR * 0.82 + gap * 0.82 + 3, 1),
        width: fmt(Math.max(4, (wallR - gap - 3) * 2), 1), height: fmt(Math.max(4, (wallR * 0.82 - gap * 0.82 - 3) * 2), 1),
        rx: fmt(Math.max(3, (wallR - gap) * (gap > 3 ? 0.42 : 0.13)), 1), fill: CYTO_C, stroke: MEMBRANE_C, 'stroke-width': Math.max(1.6, 2.4 * size),
      }));
      sceneSvg.append(wall);
      if (d.psiPressureInside > 0.04) {
        // Four arrows pressing outwards: the pressure is the point of this scene and it is invisible.
        const n = 6;
        const len = clamp(9 * size + d.psiPressureInside * 26 * size, 9 * size, 34 * size);
        for (let i = 0; i < n; i += 1) {
          const a = (i / n) * Math.PI * 2 + Math.PI / 6;
          const x0 = cx + Math.cos(a) * inner * 0.42;
          const y0 = cy + Math.sin(a) * inner * 0.42;
          const x1 = x0 + Math.cos(a) * len;
          const y1 = y0 + Math.sin(a) * len;
          const head = 4.4 * size;
          const ax = Math.cos(a + 2.5) * head;
          const ay = Math.sin(a + 2.5) * head;
          const bx = Math.cos(a - 2.5) * head;
          const by = Math.sin(a - 2.5) * head;
          sceneSvg.append(el('path', {
            d: `M${fmt(x0, 1)} ${fmt(y0, 1)} L${fmt(x1, 1)} ${fmt(y1, 1)}`
              + ` M${fmt(x1 + ax, 1)} ${fmt(y1 + ay, 1)} L${fmt(x1, 1)} ${fmt(y1, 1)} L${fmt(x1 + bx, 1)} ${fmt(y1 + by, 1)}`,
            fill: 'none', stroke: INK.water, 'stroke-width': Math.max(1.6, 2.2 * size), 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
          }));
        }
      }
    }

    const lab = clamp(10.4 * size, 9.2, 11.6);
    sceneSvg.append(text(8, lab + 4, solute().permeant ? 'bath: urea, which crosses' : `bath: ${solute().name.toLowerCase()}`, { class: 'os-label', 'font-size': fmt(lab, 1) }));
    const word = OUTCOME_WORD[d.outcome];
    const accent = d.outcome === 'lysed' || d.outcome === 'plasmolysed' ? INK.coral : d.outcome === 'turgid' ? INK.leaf : C.ink;
    sceneSvg.append(text(cx, hgt - 22, word, { anchor: 'middle', class: 'os-verdict', fill: accent, 'font-size': fmt(clamp(12 * size, 10.4, 13.4), 1) }));
    sceneSvg.append(text(cx, hgt - 6, `${Math.round(volumeFraction * 100)}% of its resting volume`, { anchor: 'middle', class: 'os-label', 'font-size': fmt(lab * 0.92, 1) }));
  }

  // ---------------------------------------------------------------- the potential panel
  //
  // Three rows and two columns, set as a table: a head rule under the column names, a hairline under the
  // pressure row because the sum is below it, and the arrow between the two sums, which always points
  // from the higher water potential to the lower. No box, no fill, no bar.
  function drawPanel(w, hgt) {
    sideSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    sideSvg.replaceChildren();
    const d = state();
    const size = narrow ? 10.4 : 11;
    const colGap = 34;
    const labelW = Math.min(narrow ? 108 : 132, w * 0.44);
    const colW = Math.max(40, (w - labelW - colGap) / 2);
    const xOut = labelW + colW;
    const xIn = labelW + colW + colGap + colW;
    const rowH = narrow ? 18 : clamp((hgt * 0.42) / 3, 16, 26);

    let y = size + 2;
    sideSvg.append(text(0, y, 'Water potential, MPa', { class: 'mol-rt-title', 'font-size': 9.4 }));
    sideSvg.append(text(xOut, y, 'Outside', { anchor: 'end', class: 'os-col', 'font-size': 9.2 }));
    sideSvg.append(text(xIn, y, 'Inside', { anchor: 'end', class: 'os-col', 'font-size': 9.2 }));
    y += 5;
    sideSvg.append(el('line', { x1: 0, y1: fmt(y, 1), x2: fmt(w, 1), y2: fmt(y, 1), stroke: C.ruleStrong }));

    const row = (label, a, b, cls) => {
      y += rowH;
      sideSvg.append(text(0, fmt(y - 4, 1), label, { class: 'os-row', 'font-size': fmt(size, 1) }));
      sideSvg.append(text(xOut, fmt(y - 4, 1), a, { anchor: 'end', class: cls, 'font-size': fmt(size, 1) }));
      sideSvg.append(text(xIn, fmt(y - 4, 1), b, { anchor: 'end', class: cls, 'font-size': fmt(size, 1) }));
    };
    row('Solute, Ψs', signedMPa(d.psiSoluteOutside), signedMPa(d.psiSoluteInside), 'os-val');
    sideSvg.append(el('line', { x1: 0, y1: fmt(y + 2, 1), x2: fmt(w, 1), y2: fmt(y + 2, 1), stroke: C.rule }));
    row('Pressure, Ψp', signedMPa(0), signedMPa(d.psiPressureInside), 'os-val');
    sideSvg.append(el('line', { x1: 0, y1: fmt(y + 2, 1), x2: fmt(w, 1), y2: fmt(y + 2, 1), stroke: C.ruleStrong }));
    row('Water potential, Ψ', signedMPa(d.psiOutside), signedMPa(d.psiInside), 'os-sum');

    // The arrow: always from the higher potential to the lower, which is the whole rule of osmosis.
    const toIn = d.psiOutside > d.psiInside + 1e-4;
    const same = Math.abs(d.psiOutside - d.psiInside) <= 1e-4;
    sideSvg.append(text(labelW + colW + colGap / 2, fmt(y - 4, 1), same ? '=' : toIn ? '→' : '←', { anchor: 'middle', class: 'os-arrow', 'font-size': fmt(size + 2, 1) }));
    y += 6;
    sideSvg.append(el('line', { x1: 0, y1: fmt(y, 1), x2: fmt(w, 1), y2: fmt(y, 1), stroke: C.ruleStrong }));

    // The rest of the reading, under the panel.
    const rows = panelRows(d, w);
    const rest = Math.max(30, hgt - y - (narrow ? 6 : 0));
    const traceH = narrow || w < 210 ? 0 : clamp(rest * 0.42, 0, 130);
    const tableH = Math.max(26, rest - traceH - (traceH ? 10 : 0));
    const opts = { width: w, size: narrow ? 10.2 : 10.6 };
    const { rowH: rh } = fitRows(rows, tableH, opts, 13, 24);
    const end = readoutTable(sideSvg, rows, { ...opts, rowH: rh, x: 0, y: y + 6 });
    if (traceH > 46) drawTrace(w, end + 8, hgt - (end + 8));
  }

  // Under the potential panel. On a phone this is two rows and one line of prose: the panel above is
  // what the section is about, and set at its desktop length this table left the vessel a hundred
  // pixels of a four-hundred-pixel stage.
  function panelRows(d, w = 260) {
    const s = solute();
    const rows = [];
    if (!narrow) rows.push(['Osmolarity, mOsm/L', `${d.osmolarityOutside} outside · ${d.osmolarityInside} inside`]);
    if (scene === 'osmometer') {
      // On a phone the osmotic pressure is in the line over the tube and the piston is on its own
      // slider, so neither is repeated here: every row taken out of this table is a row given back to
      // the vessel, which had a hundred pixels of a four-hundred-pixel stage.
      if (!narrow) {
        rows.push(['Osmotic pressure', `${fmt(d.osmoticPressureMPa, 2)} MPa`]);
        rows.push(['Piston', `${fmt(d.pistonMPa, 2)} MPa`]);
        rows.push(['Tonicity of the bath', d.tonicity]);
      }
    } else {
      if (!narrow) rows.push(['Tonicity of the bath', d.tonicity]);
      rows.push(['Outcome', OUTCOME_WORD[d.outcome].split(' — ')[0], { accent: d.outcome === 'lysed' || d.outcome === 'plasmolysed' ? INK.coral : undefined }]);
      if (!narrow) rows.push(['Volume', `${Math.round(d.volumeFraction * 100)}% of resting`]);
    }
    rows.push(...noteRows(narrow ? shortSentence(d, s) : sentence(d, s), w, 9.6));
    return rows;
  }

  // The same finding in fewer words, for a column a phone's width. Each is one line at 390 px: the side
  // panel's height is measured on a resize, not on every change of state, so a second line here would
  // be squeezed rather than given room.
  function shortSentence(d, s) {
    if (s.permeant && scene !== 'osmometer') return d.outcome === 'lysed' ? 'Iso-osmotic is not isotonic.' : 'Urea equalises; the cell’s own solutes cannot.';
    if (scene === 'osmometer') return d.equilibrated && d.pistonMPa > 0 ? 'The piston has stopped the flow.' : 'Water goes to the lower potential.';
    if (scene === 'plant-cell') return d.outcome === 'turgid' ? 'The wall pushes back, and the water stops arriving.' : d.outcome === 'plasmolysed' ? 'The contents have shrunk; the wall has not.' : 'No pressure in the wall: the cell is slack.';
    if (d.outcome === 'lysed') return 'No wall, so nothing turns the water into pressure.';
    if (d.outcome === 'crenated') return 'Water has left, and the surface has puckered.';
    if (d.outcome === 'swollen') return 'Nothing pushes back, so it all becomes volume.';
    if (d.tonicity === 'hypotonic') return 'The bath is hypotonic: the cell gains water.';
    if (d.tonicity === 'hypertonic') return 'The bath is hypertonic: the cell loses water.';
    return 'Neither gaining nor losing: the bath is isotonic.';
  }

  // One sentence, right in every state its parts can take. None of them gives the solute an agency over
  // the water: the urea "stops pulling" became the urea equalising and leaving the cell's own solutes
  // unbalanced, which is §4.4's own account of iso-osmotic urea. A cell at its resting volume is not
  // thereby in an isotonic bath — it is at the start of a run in any bath — so that sentence is keyed on
  // the tonicity, and a turgid cell is only said to have stopped the water once the flow has stopped.
  function sentence(d, s) {
    if (s.permeant && scene !== 'osmometer') {
      if (d.outcome === 'lysed') return 'Iso-osmotic is not isotonic: the urea equalised; the cell’s own solutes could not.';
      return 'Urea crosses and equalises, which leaves the cell’s own solutes unbalanced.';
    }
    if (scene === 'osmometer') {
      if (d.equilibrated && d.pistonMPa > 0) return `The piston has stopped the flow at ${fmt(d.pistonMPa, 2)} MPa, which is this pair’s osmotic pressure.`;
      if (d.netWaterFlow === 'none') return 'The two potentials match, so water crosses both ways equally: no net flow.';
      return `Water goes to the lower potential. Press the piston to ${fmt(d.osmoticPressureMPa, 2)} MPa and the flow stops.`;
    }
    if (scene === 'plant-cell') {
      if (d.outcome === 'turgid') {
        return d.equilibrated
          ? `The wall is pushing back at ${fmt(d.psiPressureInside, 2)} MPa, and that is what stopped the water arriving.`
          : `The wall is pushing back at ${fmt(d.psiPressureInside, 2)} MPa; water arrives until the potentials match.`;
      }
      if (d.outcome === 'plasmolysed') return 'The contents have shrunk away from the wall, which has kept its shape.';
      if (d.tonicity === 'isotonic') return 'No pressure in the wall: the cell is slack. In an isotonic bath, a plant wilts.';
      return 'No pressure in the wall: the cell is slack.';
    }
    if (d.outcome === 'lysed') return 'With no wall there is nothing to convert the arriving water into pressure.';
    if (d.outcome === 'crenated') return 'Water has left, and the surface has puckered rather than the volume holding.';
    if (d.outcome === 'swollen') return 'Nothing is pushing back, so every drop that arrives becomes volume.';
    if (d.tonicity === 'hypotonic') return 'The bath is hypotonic to this cell: it makes the cell gain water.';
    if (d.tonicity === 'hypertonic') return 'The bath is hypertonic to this cell: it makes the cell lose water.';
    return 'Neither gaining nor losing: the bath is isotonic to this cell.';
  }

  // Volume and pressure against time, the two series on one frame with their own scales named. Dropped
  // on a phone, where two axes would not be legible.
  function drawTrace(w, y, hgt) {
    const g = el('g');
    const padT = 14;
    const padB = 12;
    const ph = Math.max(14, hgt - padT - padB);
    const tEnd = Math.max(4, trace.length ? trace[trace.length - 1].t : 4);
    const t0 = Math.max(0, tEnd - 24);
    const X = (tt) => ((tt - t0) / Math.max(1e-3, tEnd - t0)) * w;
    const Y = (v) => y + padT + ph - clamp(v, 0, 1) * ph;
    const names = scene === 'osmometer' ? ['level', 'piston'] : ['volume', 'pressure'];
    g.append(text(0, y + 9, `${names[0][0].toUpperCase()}${names[0].slice(1)} and ${names[1]}, last 24 s`, { class: 'mol-rt-title', 'font-size': 9.2 }));
    g.append(el('line', { x1: 0, y1: fmt(y + padT + ph, 1), x2: fmt(w, 1), y2: fmt(y + padT + ph, 1), stroke: C.ruleStrong }));
    const path = (key, Y, colour, dash) => {
      let dd = '';
      for (const p of trace) dd += `${dd ? 'L' : 'M'}${fmt(X(p.t), 1)} ${fmt(Y(p[key]), 1)}`;
      if (dd) g.append(el('path', { d: dd, fill: 'none', stroke: colour, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'stroke-dasharray': dash }));
    };
    path('a', Y, INK.coral, null);
    path('b', Y, INK.water, '4 3');
    g.append(text(0, y + padT + ph + 10, names[0], { fill: INK.coral, 'font-size': 9.2, 'font-weight': 600 }));
    g.append(text(w, y + padT + ph + 10, names[1], { anchor: 'end', fill: INK.water, 'font-size': 9.2, 'font-weight': 600 }));
    sideSvg.append(g);
  }

  // ---------------------------------------------------------------- layout

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }

  function draw() {
    if (destroyed) return;
    const [sw, sh] = paneBox(scenePane);
    drawScene(sw, sh);
    const [pw, ph] = paneBox(sidePane);
    drawPanel(pw, ph);
  }

  const paint = draw;

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
      const rows = panelRows(state(), Math.max(140, w - 24));
      const want = Math.ceil(22 + 3 * 18 + readoutHeight(rows, { size: 10.2, rowH: 19 })) + 10;
      if (want !== sidePx) {
        sidePx = want;
        wrap.style.setProperty('--os-side-h', `${want}px`);
      }
    }
    void DROP_TRACE_W;
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 20;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--os-pad', `${pad}px`);
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

  pistonGroup.style.display = scene === 'osmometer' ? '' : 'none';
  restartRun(false);
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
    // scene                osmometer | animal-cell | plant-cell
    // soluteInsideMM       the cell's own impermeant solute, or the right limb's
    // soluteOutsideMM      the bath, or the left limb's
    // soluteKind           sugar | salt | urea — the solute in the bath
    // permeantSolute       true for urea, which crosses and so equalises
    // osmolarityInside, osmolarityOutside   mOsm/L, counting particles
    // psiSoluteInside, psiSoluteOutside     MPa, negative
    // psiPressureInside    MPa: the wall's back-pressure, or the piston, and 0 for a cell with no wall
    // psiInside, psiOutside                 MPa, the two sums
    // tonicity             of the bath with respect to the cell, which is not the same as its osmolarity
    // netWaterFlow         in | out | none
    // volumeFraction       relative to the resting cell
    // outcome              swollen | lysed | normal | crenated | turgid | flaccid | plasmolysed
    // pistonMPa            osmometer only
    // osmoticPressureMPa   the pressure that would stop the flow
    // equilibrated         no net flow either way: water still crosses, as much each way
    // t                    clock, seconds
    // playing              whether the water is moving
    // layout               wide | narrow
    describe() {
      return state();
    },
  };
}
