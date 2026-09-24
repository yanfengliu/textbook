// Two designs, one graph: a carrier that saturates and a channel that chooses.
//
// SCENE ONE, `carrier`. Two lanes of the same membrane, one above the other, and one graph beside them.
// The upper lane is bare bilayer, where glucose arrives and almost nothing crosses. The lower lane holds
// GLUT1 carriers, each visibly binding a glucose, changing shape, releasing it inside and cycling again,
// and each one either busy or idle at any moment. The graph plots flux against outside concentration and
// starts EMPTY: the reader draws both curves by sweeping the concentration slider, which is the only way
// the straight line and the bend-over are something they did rather than something they were shown. A
// second slider changes how many carriers are installed, which moves the ceiling and leaves the
// concentration at half that ceiling exactly where it was. Points are kept per carrier count, so two
// sweeps at two counts put two curves on one axis, which is the comparison §4.5 is making.
//
// SCENE TWO, `channel`. A potassium channel in cross-section, cytosol below (where potassium is thirty-
// five times more concentrated: 140 mmol/L against 4, which is §4.6's own pair) and extracellular fluid
// above. The reader fires potassium or sodium at it. An
// ion arrives inside its shell of water; the shell is stripped at the mouth of the filter; potassium
// finds the carbonyl oxygens waiting at the spacing its water occupied and passes, and sodium, which is
// SMALLER, finds them out of reach and is turned back. `Show the filter` draws that comparison directly:
// the oxygens against the ghost positions of the ion's own water molecules, from the Shannon ionic radii
// of the one element table and the van der Waals radius of water. The gate opens by voltage, by a ligand
// binding or by the membrane being stretched, and each is drawn as its own cause.
//
// THE MODEL, and what in it is a measurement and what is a stated parameter.
//   Measurements the chapter names, and the figure uses unchanged: GLUT1 is half-saturated at about
//   1.5 mmol/L (§4.5 says 1 to 2), a carrier turns over of the order of a thousand molecules a second
//   (§4.5), blood glucose sits near 5 mmol/L (§4.5), and a potassium channel conducts K⁺ about ten
//   thousand times better than Na⁺ (§4.5). The ionic radii are the one element table's.
//   A stated parameter: the rate at which glucose crosses the BARE lane. It is set so that at blood
//   concentration the carrier lane is about a hundred times faster, which is the order §4.3's table and
//   §4.5's argument put on it. It is a model constant chosen to make the comparison legible on one axis,
//   not a permeability this figure claims to have measured, and the stage says the lane is bare bilayer
//   rather than quoting a coefficient at the reader.
//   The carrier lane is Michaelis–Menten, J = Vmax·C/(Km + C) with Vmax = carriers × turnover, for the
//   reason §4.5 gives: a fixed number of binding sites, each with a cycle to complete.
//
// COMPOSITION. Wide: the two lanes take the left, the graph the right, and neither is a panel with a
// border — the graph has two rules and the lanes have none. Narrow is a real second composition: the
// lanes become two short strips across the top and the graph moves under them at full width, because a
// curve bending over cannot be read in a column ninety pixels wide. The half-maximum and blood-glucose
// markers keep the same words at both widths, because an item's goal quotes them.
//
// COLOUR. `membranePart('carrier')`, `('channel')` and `('glucose')`; the sheet from `('lipidHead')` and
// `('lipidTail')`; the ions from the one element table, told apart by symbol and ionic radius. A symbol
// written on one of the membrane fills takes `membranePart(id).symbolColor`, which is the colour itself
// and not a token to resolve through the theme: those fills are fixed hexes in both themes, so the symbol
// on them is fixed too and the measured ratio holds on either paper.
import { el, h, text, C, tint, clamp, uid } from './lib/svg.js';
import { atom, readoutCss, readoutTable, fitRows, round, grouped, INK, mulberry32 } from './lib/mol-draw.js';
import { ELEMENTS } from './lib/chem-atoms.js';
import { membranePart } from '../palette.js';

export const meta = { kind: 'transport-lab', title: 'Two designs, one graph', needsWebGL: false, aspect: 16 / 9 };

// ---------------------------------------------------------------- the model

const KM = 1.5; // mmol/L, GLUT1's half-maximum: §4.5 gives 1 to 2
const TURNOVER = 1000; // molecules a second for one carrier: §4.5's "of the order of a thousand"
const BLOOD = 5; // mmol/L
const C_MAX = 25; // mmol/L on the slider and the axis
const CARRIERS = { min: 200, max: 2000, step: 100, start: 1400 }; // per square micrometre
// Chosen so the bare lane is about a hundredth of the carrier lane at blood concentration; see the
// header. Molecules a second through a square micrometre, per mmol/L outside.
const BARE_PER_MM = 2400;
const TRUE_SELECTIVITY = 10000; // §4.5's measured figure for a potassium channel

const vmaxOf = (n) => n * TURNOVER;
const carrierFluxOf = (n, c) => vmaxOf(n) * (c / (KM + c));
const bareFluxOf = (c) => BARE_PER_MM * c;

// The radius of the shell of water an ion drags with it: its own ionic radius plus a water molecule.
// Potassium's is what the filter's carbonyl oxygens are spaced to replace; sodium's is 36 pm short, so
// the same fixed oxygens cannot reach it. Both numbers come from the one element table.
const WATER_VDW_PM = 140;
const shellPm = (sym) => ELEMENTS[sym].ionic + WATER_VDW_PM;
const FILTER_PM = shellPm('K');

const FLIGHT_SECONDS = 1.9;
const GATES = [
  { id: 'closed', label: 'Closed', line: 'The gate is shut. Nothing reaches the filter.' },
  { id: 'voltage', label: 'Voltage', line: 'A change in the membrane potential has opened it. This is how a nerve impulse travels.' },
  { id: 'ligand', label: 'Ligand', line: 'A molecule has bound and opened it. This is what happens at a synapse when a nerve releases its transmitter.' },
  { id: 'stretch', label: 'Stretch', line: 'The membrane has been deformed and pulled it open. This is how a hair cell in your ear turns a vibration into a signal.' },
];

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-tlab')}
.tb-tlab { position: absolute; inset: 0; box-sizing: border-box;
  padding: 0.35rem 0.5rem var(--tl-pad, 3rem); font-family: var(--font-ui); }
.tb-tlab .tl-pane { position: absolute; inset: 0.35rem 0.5rem var(--tl-pad, 3rem); }
.tb-tlab .tl-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-tlab svg text { font-family: var(--font-ui); }
.tb-tlab .tl-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; }
.tb-tlab .tl-key { fill: var(--ink-soft); }
.tb-tlab .tl-val { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-tlab .tl-line { fill: var(--ink-soft); }
.tb-tlab .tl-over { font-weight: 600; stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round;
  paint-order: stroke; }
.tb-tlab .fig-toolbar { justify-content: flex-start; }
.tb-tlab .tl-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-tlab .tl-sep { width: 1px; min-height: 1.4rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
/* The primary action is told by the head rule on its edge and the weight of its ink, never by a fill. */
.tb-tlab .tl-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-tlab .tl-slider { display: flex; align-items: center; gap: 0.3rem; font-size: var(--text-xs);
  color: var(--ink-soft); background: color-mix(in srgb, var(--paper) 86%, transparent);
  padding: 0.18rem 0.4rem; }
.tb-tlab .tl-slider input { width: 4.4rem; }
.tb-tlab .tl-slider .tl-v { color: var(--ink); font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums; min-width: 3.4rem; text-align: right; }
.tb-tlab .tl-only-channel, .tb-tlab .tl-only-carrier { display: flex; }
.tb-tlab.is-channel .tl-only-carrier { display: none; }
.tb-tlab.is-carrier .tl-only-channel { display: none; }
/* Eleven controls have to fit a 342 px bar without taking half the stage. At 10.5 px — thirty-one device
   pixels on a 3× phone, well over the nine-pixel floor — they come down from six rows to four, and every
   word is the word the desktop bar uses, because an item's goal quotes it. */
.tb-tlab.is-narrow .fig-toolbar { gap: 0.28rem; }
.tb-tlab.is-narrow .fig-btn { font-size: 10.5px; padding: 0.22rem 0.42rem; }
.tb-tlab.is-narrow .tl-sep { display: none; }
.tb-tlab.is-narrow .tl-slider { font-size: 10.5px; padding: 0.1rem 0.26rem; gap: 0.22rem; }
.tb-tlab.is-narrow .tl-slider input { width: 2.8rem; }
.tb-tlab.is-narrow .tl-slider .tl-v { min-width: 2.7rem; }
/* The sliders go last on a phone, so the five button groups pack into two rows instead of being pushed
   apart by a slider row between them. Six rows of controls became three. */
.tb-tlab.is-narrow .tl-sliders { order: 2; }
`;

// ---------------------------------------------------------------- helpers

const f1 = (v) => v.toFixed(1);
// Three significant figures: the model's arithmetic runs to seven and printing all of them would claim a
// precision the model does not have.
const sig3 = (v) => {
  if (!v) return 0;
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(Math.abs(v))) - 2);
  return Math.round(v / mag) * mag;
};
const ionRadiusPx = (sym, base) => base * (ELEMENTS[sym].ionic / ELEMENTS.K.ionic);

// A sugar ring, so glucose is a shape and not another disc among the ions.
function glucoseMark(cx, cy, r, fill, { faded = false } = {}) {
  let d = '';
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return el('path', { d: `${d} Z`, fill, opacity: faded ? 0.42 : 1 });
}

// Seeded scatter in a unit box, with a minimum separation, so glucose fills a lane evenly and a molecule
// appears and disappears in place as the concentration changes rather than the whole field reshuffling.
function scatter(seed, n) {
  const rng = mulberry32(seed);
  const pts = [];
  let tries = 0;
  while (pts.length < n && tries < 6000) {
    tries += 1;
    const p = [0.03 + rng() * 0.94, 0.08 + rng() * 0.84, rng()];
    if (pts.every((q) => Math.hypot((q[0] - p[0]) * 2.6, q[1] - p[1]) > 0.17)) pts.push(p);
  }
  return pts;
}
const OUT_SCATTER = scatter(7701, 22);
const IN_SCATTER = scatter(7702, 22);
// The channel scene's two fluids, in pairs: even slots carry sodium and odd ones potassium, so the
// thirty-fivefold potassium gradient §4.5 opens with is a crowd and not a sentence.
const CH_OUT_SCATTER = scatter(7703, 18);
const CH_IN_SCATTER = scatter(7704, 18);
const MM_PER_ION = 22;

// `readoutTable` draws a note as one line, so a sentence longer than its column runs off the pane.
function notes(str, width, size) {
  const per = Math.max(10, Math.floor(width / (size * 0.52)));
  const out = [];
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > per && line) { out.push({ note: line }); line = word; } else line = next;
  }
  if (line) out.push({ note: line });
  return out;
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('tl');
  let destroyed = false;
  let narrow = false;
  let padPx = 0;

  const CARRIER_FILL = membranePart('carrier').color;
  const CARRIER_LABEL = membranePart('carrier').symbolColor;
  const CHANNEL_FILL = membranePart('channel').color;
  const CHANNEL_LABEL = membranePart('channel').symbolColor;
  const GLUCOSE_FILL = membranePart('glucose').color;
  const HEAD_FILL = membranePart('lipidHead').color;
  const TAIL_FILL = membranePart('lipidTail').color;

  // ---- state ----
  let scene = 'carrier';
  // It opens at blood glucose, so the lanes are populated and the reader's first move is a sweep. The
  // graph still starts empty: `plotted` is 0 until the slider has been somewhere.
  let concentration = BLOOD;
  let carriers = CARRIERS.start;
  let plotted = []; // { c, carriers, simple, carrier }
  let ion = null;
  let gate = 'closed';
  let filterShown = false;
  const passes = { potassium: 0, sodium: 0 };
  const rejects = { potassium: 0, sodium: 0 };
  let shots = []; // { sym, start, passed }
  let fired = 0;
  const fate = mulberry32(31337);
  let raf = 0;
  let t0 = performance.now() / 1000;
  let pinned = typeof ctx.pinnedTime === 'number' ? ctx.pinnedTime : null;
  const nowT = () => (pinned !== null ? pinned : performance.now() / 1000 - t0);

  const gateOpen = () => gate !== 'closed';
  const saturation = () => concentration / (KM + concentration);
  const arrivals = (sym) => passes[sym] + rejects[sym];
  function selectivityRatio() {
    if (!arrivals('potassium') || !arrivals('sodium')) return 0;
    const k = passes.potassium / arrivals('potassium');
    // Laplace's rule where sodium has passed none, so the figure reports a lower bound that grows with
    // the evidence rather than an infinity or a zero.
    const na = Math.max(passes.sodium / arrivals('sodium'), 0.5 / arrivals('sodium'));
    return k / na;
  }

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-tlab is-carrier' });
  wrap.append(h('style', { text: CSS }));
  const svg = el('svg', {
    tabindex: '0', role: 'img',
    'aria-label': 'A bench comparing a carrier with a channel. Left and right arrows move the outside concentration; K fires a potassium ion and N a sodium ion in the channel scene.',
  });
  const pane = h('div', { class: 'tl-pane' }, [svg]);

  const button = (label, onClick, { pressed = null, primary = false, cls = '' } = {}) => {
    const b = h('button', { class: `fig-btn${primary ? ' tl-primary' : ''}${cls ? ` ${cls}` : ''}`, type: 'button', text: label });
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    return b;
  };
  const slider = (label, opts) => {
    const input = h('input', { class: 'fig-range', type: 'range', min: opts.min, max: opts.max, step: opts.step, value: opts.value, 'aria-label': label });
    const val = h('span', { class: 'tl-v', text: opts.format(opts.value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      val.textContent = opts.format(v);
      opts.onInput(v);
    });
    return { node: h('label', { class: `tl-slider fig-ui${opts.cls ? ` ${opts.cls}` : ''}` }, [document.createTextNode(label), input, val]), input };
  };

  const btnCarrier = button('Carrier', () => setScene('carrier'), { pressed: true });
  const btnChannel = button('Channel', () => setScene('channel'), { pressed: false });
  const sConc = slider('Concentration', {
    min: 0, max: C_MAX * 4, step: 1, value: BLOOD * 4,
    format: (v) => `${(v / 4).toFixed(2)} mmol/L`,
    onInput: (v) => { setConcentration(v / 4); },
  });
  const sCarriers = slider('Carriers', {
    min: CARRIERS.min, max: CARRIERS.max, step: CARRIERS.step, value: CARRIERS.start,
    format: (v) => grouped(v), cls: 'tl-only-carrier',
    onInput: (v) => { carriers = v; draw(); },
  });
  const btnFireK = button('Fire potassium', () => fire('K'), { primary: true, cls: 'tl-only-channel' });
  const btnFireNa = button('Fire sodium', () => fire('Na'), { cls: 'tl-only-channel' });
  const btnFilter = button('Show the filter', () => {
    filterShown = !filterShown;
    btnFilter.setAttribute('aria-pressed', String(filterShown));
    draw();
  }, { pressed: false, cls: 'tl-only-channel' });
  const gateBtns = GATES.map((gdef) => button(gdef.label, () => {
    gate = gdef.id;
    for (let i = 0; i < gateBtns.length; i += 1) gateBtns[i].setAttribute('aria-pressed', String(GATES[i].id === gate));
    draw();
  }, { pressed: gdef.id === gate, cls: 'tl-only-channel' }));
  const btnReset = button('Reset', () => reset());

  const group = (kids, cls = '') => h('div', { class: `tl-group${cls ? ` ${cls}` : ''}` }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnCarrier, btnChannel]),
    h('span', { class: 'tl-sep', 'aria-hidden': 'true' }),
    h('div', { class: 'tl-group tl-sliders' }, [sConc.node, sCarriers.node]),
    group(gateBtns, 'tl-only-channel'),
    h('span', { class: 'tl-sep tl-only-channel', 'aria-hidden': 'true' }),
    group([btnFireK, btnFireNa, btnFilter], 'tl-only-channel'),
    h('span', { class: 'tl-sep', 'aria-hidden': 'true' }),
    group([btnReset]),
  ]);
  const live = h('span', { 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });
  wrap.append(pane, toolbar, live);
  root.append(wrap);

  // ---- reader actions ----
  function setScene(next) {
    scene = next;
    btnCarrier.setAttribute('aria-pressed', String(scene === 'carrier'));
    btnChannel.setAttribute('aria-pressed', String(scene === 'channel'));
    wrap.classList.toggle('is-carrier', scene === 'carrier');
    wrap.classList.toggle('is-channel', scene === 'channel');
    draw();
    announce();
  }

  function setConcentration(c) {
    concentration = c;
    // A point is recorded wherever the reader takes the slider, so sweeping it is what draws the curves.
    const last = plotted[plotted.length - 1];
    if (!last || Math.abs(last.c - c) > 0.05 || last.carriers !== carriers) {
      plotted.push({ c, carriers, simple: bareFluxOf(c), carrier: carrierFluxOf(carriers, c) });
      if (plotted.length > 600) plotted.shift();
    }
    draw();
    announce();
  }

  function fire(sym) {
    fired += 1;
    const roll = fate();
    // Potassium sheds its water and finds the oxygens in the right places, so it nearly always passes;
    // sodium has to give up its water and get nothing back, so it nearly never does. A shut gate turns
    // both back at the mouth, which is a rejection and is counted as one.
    const passed = gateOpen() && (sym === 'K' ? roll < 0.95 : roll < 0.01);
    const name = sym === 'K' ? 'potassium' : 'sodium';
    if (passed) passes[name] += 1; else rejects[name] += 1;
    ion = name;
    shots.push({ sym, start: nowT(), passed });
    if (shots.length > 14) shots.shift();
    kick();
    draw();
    announce();
  }

  // Reset means "as it mounted". It used to clear the graph, the tallies and the concentration and leave
  // the scene, the carrier count, the gate, the filter overlay and the shots-fired count where the
  // reader had put them, so a reader in the channel scene with a stretch-opened gate pressed Reset, got
  // a cleared tally, and went on firing through a gate they had opened several minutes before. The
  // clock goes back too: `t0` is the origin `nowT()` counts from, and nothing else reads it once the
  // shots in flight are gone.
  function reset() {
    plotted = [];
    passes.potassium = 0; passes.sodium = 0;
    rejects.potassium = 0; rejects.sodium = 0;
    shots = [];
    fired = 0;
    ion = null;
    concentration = BLOOD;
    sConc.input.value = String(BLOOD * 4);
    sConc.node.querySelector('.tl-v').textContent = `${BLOOD.toFixed(2)} mmol/L`;
    carriers = CARRIERS.start;
    sCarriers.input.value = String(CARRIERS.start);
    sCarriers.node.querySelector('.tl-v').textContent = grouped(CARRIERS.start);
    gate = 'closed';
    for (let i = 0; i < gateBtns.length; i += 1) gateBtns[i].setAttribute('aria-pressed', String(GATES[i].id === gate));
    filterShown = false;
    btnFilter.setAttribute('aria-pressed', 'false');
    t0 = performance.now() / 1000;
    setScene('carrier'); // draws and announces
  }

  function announce() {
    if (scene === 'carrier') {
      live.textContent = `Carrier scene. ${concentration.toFixed(2)} mmol/L outside. Bare bilayer ${grouped(sig3(bareFluxOf(concentration)))}, carriers ${grouped(sig3(carrierFluxOf(carriers, concentration)))} molecules a second through a square micrometre; the carrier lane is ${Math.round(saturation() * 100)} per cent of the way to its ceiling. ${plotted.length} point${plotted.length === 1 ? '' : 's'} on the graph.`;
    } else {
      const g = GATES.find((x) => x.id === gate);
      live.textContent = `Channel scene. ${g.line} Potassium ${passes.potassium} through, ${rejects.potassium} turned back; sodium ${passes.sodium} through, ${rejects.sodium} turned back.`;
    }
  }

  const onKey = (e) => {
    if (scene === 'channel' && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); fire('K'); }
    else if (scene === 'channel' && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); fire('Na'); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); bump(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); bump(-1); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
  };
  function bump(dir) {
    const v = clamp(Number(sConc.input.value) + dir, 0, C_MAX * 4);
    sConc.input.value = String(v);
    sConc.node.querySelector('.tl-v').textContent = `${(v / 4).toFixed(2)} mmol/L`;
    setConcentration(v / 4);
  }
  svg.addEventListener('keydown', onKey);

  // ---- the animation loop, which runs only while an ion is in flight ----
  function frame() {
    raf = 0;
    if (destroyed) return;
    const t = nowT();
    shots = shots.filter((s) => t - s.start < FLIGHT_SECONDS);
    draw();
    if (shots.length) kick();
  }
  const kick = () => { if (!raf && !destroyed && pinned === null) raf = requestAnimationFrame(frame); };

  // ---------------------------------------------------------------- drawing: shared parts

  // A stretch of bilayer, drawn as heads with tails between them, with a gap left wherever a protein
  // sits. `skip` is a list of [centre, halfWidth] in the lane's own coordinates.
  function bilayer(parent, x0, x1, top, bot, headR, skip = []) {
    const mid = (top + bot) / 2;
    const step = headR * 2.05;
    for (let x = x0 + headR; x < x1; x += step) {
      if (skip.some(([cx, hw]) => Math.abs(x - cx) < hw + headR)) continue;
      for (const [cy, dir] of [[top + headR, 1], [bot - headR, -1]]) {
        parent.append(el('circle', { cx: f1(x), cy: f1(cy), r: f1(headR), fill: HEAD_FILL }));
        for (const dx of [-headR * 0.34, headR * 0.34]) {
          parent.append(el('line', {
            x1: f1(x + dx), y1: f1(cy + dir * headR * 0.7), x2: f1(x + dx), y2: f1(mid - dir * headR * 0.1),
            stroke: TAIL_FILL, 'stroke-width': f1(headR * 0.42), 'stroke-linecap': 'round',
          }));
        }
      }
    }
  }

  // The two-lobed carrier of §4.5, small: a binding site open to one side at a time, never a hole.
  function carrierShape(parent, cx, top, bot, half, open, { fill = CARRIER_FILL } = {}) {
    const mouth = half * 0.72;
    const waist = Math.max(0.9, half * 0.05);
    const mouthTop = waist + (mouth - waist) * Math.max(0, open);
    const mouthBot = waist + (mouth - waist) * Math.max(0, -open);
    const mid = (top + bot) / 2;
    for (const sign of [-1, 1]) {
      const X = (v) => f1(cx + sign * v);
      parent.append(el('path', {
        d: `M${X(mouthTop)} ${f1(top)} L${X(half)} ${f1(top)} L${X(half)} ${f1(bot)} L${X(mouthBot)} ${f1(bot)} L${X(waist)} ${f1(mid)} Z`,
        fill, 'stroke-linejoin': 'round',
      }));
    }
  }

  // ---------------------------------------------------------------- the carrier scene

  // Left column: two lanes of the same membrane, one above the other, and under them the numbers they
  // are producing, as a table. Right column: the graph. The lanes are given the height a strip of
  // membrane wants and no more, and what would have been slack under them is the readout's.
  function drawCarrier(w, hgt) {
    const gap = narrow ? 12 : 16;
    const laneW = narrow ? w : Math.round(w * 0.46);
    const laneH = narrow ? Math.round(hgt * 0.19) : Math.round((hgt - gap * 2) * 0.27);
    const laneX = 0;
    const lanes = [
      { y: narrow ? 12 : 6, title: 'Bare bilayer', flux: bareFluxOf(concentration), carrier: false },
      { y: (narrow ? 12 : 6) + laneH + gap, title: 'Carriers', flux: carrierFluxOf(carriers, concentration), carrier: true },
    ];
    const titleSize = clamp(laneW * 0.024, 8.8, 10.6);
    for (const lane of lanes) {
      const g = el('g');
      const top = lane.y + titleSize + 5;
      const bot = top + laneH - titleSize - 5;
      const memH = Math.max(14, (bot - top) * 0.3);
      const memTop = (top + bot) / 2 - memH / 2;
      const memBot = memTop + memH;
      const headR = clamp(memH * 0.17, 3.2, 7);
      g.append(text(laneX, lane.y + titleSize, lane.title, { class: 'tl-head', 'font-size': f1(titleSize) }));
      g.append(text(laneX + laneW, lane.y + titleSize, `${grouped(sig3(lane.flux))} a second`, { anchor: 'end', class: 'tl-val', 'font-size': f1(titleSize) }));

      const nCarr = lane.carrier ? (narrow ? 4 : 6) : 0;
      const half = lane.carrier ? clamp(Math.min(laneW / (nCarr * 6), memH * 0.36), 6, 14) : 0;
      const skip = [];
      const spots = [];
      for (let i = 0; i < nCarr; i += 1) {
        const cx = laneX + laneW * ((i + 0.5) / nCarr);
        spots.push(cx);
        skip.push([cx, half]);
      }
      bilayer(g, laneX, laneX + laneW, memTop, memBot, headR, skip);

      // Glucose above and below, at a density that follows the concentration outside: one drawn per
      // mmol/L, which the lane says out loud, up to the twenty-two the field holds.
      const gr = clamp(headR * 1.15, 3.6, 7.6);
      const nOut = Math.round(clamp(concentration, 0, 22));
      for (let i = 0; i < nOut; i += 1) {
        const p = OUT_SCATTER[i];
        if (!p) break;
        g.append(glucoseMark(laneX + p[0] * laneW, top + p[1] * Math.max(6, memTop - top - gr), gr, GLUCOSE_FILL));
      }
      // Inside: what has actually crossed, on the same scale as the flux the lane is managing.
      const nIn = Math.round(clamp((lane.flux / (vmaxOf(CARRIERS.max) * 0.8)) * 22, 0, 22));
      for (let i = 0; i < nIn; i += 1) {
        const p = IN_SCATTER[i];
        if (!p) break;
        g.append(glucoseMark(laneX + p[0] * laneW, memBot + gr + p[1] * Math.max(6, bot - memBot - gr * 2), gr, GLUCOSE_FILL));
      }

      // The carriers themselves, each busy or idle: the share that are busy is the saturation.
      if (lane.carrier) {
        const t = nowT();
        const busyShare = saturation();
        spots.forEach((cx, i) => {
          const phase = (t * 0.55 + i * 0.37) % 1;
          const busy = i / nCarr < busyShare;
          // An idle carrier waits with its site open to the outside; a busy one cycles through it.
          const open = busy ? Math.cos(phase * Math.PI * 2) : 1;
          carrierShape(g, cx, memTop - headR * 1.4, memBot + headR * 1.4, half, open);
          if (busy) {
            const mid = (memTop + memBot) / 2;
            const yy = mid - open * (memBot - memTop) * 0.28;
            g.append(glucoseMark(cx, yy, Math.min(gr, half * 0.52), GLUCOSE_FILL));
          }
        });
        // The unit goes here, in the note face, because the lane's own title is set in small capitals
        // and `text-transform: uppercase` turns a µ into a capital Mu that reads as an M.
        g.append(text(laneX, bot + titleSize - 1, `${grouped(carriers)} per µm², ${Math.round(saturation() * 100)} % of them busy · one glucose drawn per mmol/L`, { class: 'mol-rt-note', 'font-size': f1(titleSize - 1) }));
      }
      svg.append(g);
    }

    // --- what the two lanes are producing, as a table under them ---
    const tableY = lanes[1].y + laneH + gap;
    if (!narrow && hgt - tableY > 60) {
      const rows = [
        ['Outside', `${concentration.toFixed(2)} mmol/L`],
        ['Bare bilayer', `${grouped(sig3(bareFluxOf(concentration)))} a second`],
        ['Carriers', `${grouped(sig3(carrierFluxOf(carriers, concentration)))} a second`],
        ['Their ceiling', `${grouped(vmaxOf(carriers))} a second`],
        ['Of the way there', `${Math.round(saturation() * 100)} %`],
        ['Half way up at', `${KM.toFixed(1)} mmol/L`],
        ['Points on the graph', String(plotted.length)],
        { note: 'Molecules a second through a square micrometre.' },
        { note: 'More carriers raise the ceiling, not the half-way point.' },
      ];
      const { rowH } = fitRows(rows, hgt - tableY - 14, { size: 10.2 }, 13, 24);
      readoutTable(svg, rows, { x: laneX, y: tableY, width: laneW, rowH, size: 10.2, title: 'What is crossing' });
    }

    // --- the graph ---
    const gx = narrow ? 0 : laneW + 26;
    const gy = narrow ? lanes[1].y + laneH + 22 : 6;
    const gw = Math.max(70, w - gx);
    const gh = Math.max(70, hgt - gy);
    drawGraph(gx, gy, gw, gh);
  }

  function drawGraph(x, y, w, hgt) {
    const g = el('g');
    const padL = 42;
    const padR = 10;
    const padT = 32;
    const padB = 34;
    const pw = Math.max(30, w - padL - padR);
    const ph = Math.max(30, hgt - padT - padB);
    const X0 = x + padL;
    const Y0 = y + padT;
    // The top of the axis follows the largest ceiling the reader has used, so the shape of a low-carrier
    // sweep is not flattened by a high-carrier one drawn earlier.
    let top = vmaxOf(carriers);
    for (const p of plotted) top = Math.max(top, vmaxOf(p.carriers));
    top = Math.max(top, 1);
    const X = (c) => X0 + (clamp(c, 0, C_MAX) / C_MAX) * pw;
    const Y = (v) => Y0 + (1 - clamp(v / top, 0, 1)) * ph;

    g.append(el('line', { x1: f1(X0), y1: f1(Y0), x2: f1(X0), y2: f1(Y0 + ph), stroke: C.ruleStrong }));
    g.append(el('line', { x1: f1(X0), y1: f1(Y0 + ph), x2: f1(X0 + pw), y2: f1(Y0 + ph), stroke: C.ruleStrong }));
    for (let c = 5; c <= C_MAX; c += 5) {
      g.append(el('line', { x1: f1(X(c)), y1: f1(Y0 + ph), x2: f1(X(c)), y2: f1(Y0 + ph + 4), stroke: C.ruleStrong }));
      g.append(text(X(c), Y0 + ph + 14, String(c), { anchor: 'middle', class: 'mol-rt-note', 'font-size': 9.4 }));
    }
    for (let i = 1; i <= 4; i += 1) {
      const v = (top * i) / 4;
      g.append(el('line', { x1: f1(X0), y1: f1(Y(v)), x2: f1(X0 + pw), y2: f1(Y(v)), stroke: C.rule }));
      g.append(text(X0 - 5, Y(v) + 3.2, grouped(v / 1000), { anchor: 'end', class: 'mol-rt-note', 'font-size': 9.4 }));
    }
    g.append(text(x, y + 10, 'Flux against concentration', { class: 'mol-rt-title', 'font-size': 9.2 }));
    g.append(text(X0 + pw, Y0 + ph + 27, 'mmol/L outside', { anchor: 'end', class: 'mol-rt-note', 'font-size': 9.2 }));
    g.append(text(x, y + 23, 'thousands a second per µm²', { class: 'mol-rt-note', 'font-size': 9.2 }));

    // The two markers, with the same words at both widths because an item's goal quotes them.
    for (const [c, label, colour] of [[KM, 'half way up', INK.violet], [BLOOD, 'blood glucose', INK.leaf]]) {
      g.append(el('line', { x1: f1(X(c)), y1: f1(Y0), x2: f1(X(c)), y2: f1(Y0 + ph), stroke: colour, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
      g.append(text(X(c) + 3, Y0 + (label === 'half way up' ? 10 : 22), label, { 'font-size': 9.2, style: `fill:${colour}`, 'font-weight': 600 }));
    }

    if (!plotted.length) {
      g.append(text(X0 + pw / 2, Y0 + ph * 0.62, 'sweep the concentration and the curves appear', { anchor: 'middle', class: 'mol-rt-note', 'font-size': 10 }));
    } else {
      // One polyline per carrier count, so two sweeps put two ceilings on one axis.
      const byCount = new Map();
      for (const p of plotted) {
        if (!byCount.has(p.carriers)) byCount.set(p.carriers, []);
        byCount.get(p.carriers).push(p);
      }
      for (const [count, pts] of byCount) {
        const sorted = [...pts].sort((a, b) => a.c - b.c);
        let d = '';
        for (let i = 0; i < sorted.length; i += 1) d += `${i ? 'L' : 'M'}${f1(X(sorted[i].c))} ${f1(Y(sorted[i].carrier))}`;
        g.append(el('path', { d, fill: 'none', stroke: CARRIER_FILL, 'stroke-width': count === carriers ? 2.6 : 1.5, opacity: count === carriers ? 1 : 0.6, 'stroke-linejoin': 'round' }));
        let ds = '';
        for (let i = 0; i < sorted.length; i += 1) ds += `${i ? 'L' : 'M'}${f1(X(sorted[i].c))} ${f1(Y(sorted[i].simple))}`;
        g.append(el('path', { d: ds, fill: 'none', stroke: C.ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
      }
    }
    // Where the reader is now, drawn whether or not anything has been swept, so the graph always shows
    // the state the lanes beside it are in.
    g.append(el('line', { x1: f1(X(concentration)), y1: f1(Y0), x2: f1(X(concentration)), y2: f1(Y0 + ph), stroke: C.ruleStrong, 'stroke-width': 1 }));
    g.append(el('circle', { cx: f1(X(concentration)), cy: f1(Y(carrierFluxOf(carriers, concentration))), r: 3.6, fill: CARRIER_FILL, stroke: C.paper, 'stroke-width': 1.3 }));
    g.append(el('circle', { cx: f1(X(concentration)), cy: f1(Y(bareFluxOf(concentration))), r: 3, fill: C.ink, stroke: C.paper, 'stroke-width': 1.3 }));
    // Which line is which, on the title line where no curve reaches.
    const legend = [['carriers', CARRIER_FILL], ['bare bilayer', C.ink]];
    let lx = x + w;
    for (let i = legend.length - 1; i >= 0; i -= 1) {
      const [word, colour] = legend[i];
      lx -= word.length * 5.4;
      g.append(text(lx, y + 10, word, { class: 'mol-rt-note', 'font-size': 9.2 }));
      lx -= 16;
      g.append(el('line', { x1: f1(lx), y1: y + 6.8, x2: f1(lx + 12), y2: y + 6.8, stroke: colour, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
      lx -= 10;
    }
    svg.append(g);
  }

  // ---------------------------------------------------------------- the channel scene

  function drawChannel(w, hgt) {
    const readW = narrow ? w : clamp(w * 0.32, 150, 250);
    const sceneW = narrow ? w : w - readW - 22;
    const sceneH = narrow ? Math.round(hgt * 0.6) : hgt;
    const g = el('g');
    const memH = Math.max(46, sceneH * 0.34);
    const memTop = sceneH * 0.5 - memH / 2;
    const memBot = memTop + memH;
    const headR = clamp(memH * 0.14, 3.6, 8);
    const cx = sceneW * 0.5;
    // The protein is drawn large at every width, because the ions inside it have to carry their symbols
    // and a sodium ion is 0.37 of the filter's own radius. At a tenth of the pane's width both ions hit
    // the symbol floor and came out the same size, which loses the whole argument.
    const poreHalf = clamp(sceneW * 0.17, 40, 76);
    // Scene units per picometre. The filter's carbonyl oxygens sit at exactly the radius a potassium
    // ion's shell of water occupied, so that radius sets the scale and everything else — the bare ions,
    // the shells, the neck of the pore — is drawn against it.
    const pmScale = (poreHalf * 0.26) / FILTER_PM;
    const filterR = FILTER_PM * pmScale;
    const oxR = Math.max(2.8, poreHalf * 0.085);

    bilayer(g, 0, sceneW, memTop, memBot, headR, [[cx, poreHalf]]);

    const top = memTop - headR * 1.6;
    const bot = memBot + headR * 1.6;
    const filterY = top + (bot - top) * 0.3;
    const open = gateOpen();
    // The wall: a wide vestibule open to the cytosol, narrowing to a neck exactly as wide as a hydrated
    // potassium ion, and a gate at the cytosolic mouth that is shut or open.
    for (const sign of [-1, 1]) {
      const X = (v) => f1(cx + sign * v);
      const gateW = open ? poreHalf * 0.5 : poreHalf * 0.04;
      g.append(el('path', {
        d: `M${X(poreHalf)} ${f1(top)} L${X(poreHalf)} ${f1(bot)} L${X(gateW)} ${f1(bot)}`
          + ` L${X(poreHalf * 0.6)} ${f1(filterY + (bot - filterY) * 0.5)}`
          + ` L${X(filterR)} ${f1(filterY + oxR * 3)}`
          + ` L${X(filterR)} ${f1(filterY - oxR * 3)}`
          + ` L${X(poreHalf * 0.5)} ${f1(top)} Z`,
        fill: CHANNEL_FILL, 'stroke-linejoin': 'round',
      }));
    }
    if (poreHalf > 34) {
      // Set on the lipid tails, so it carries the paper with it, as permeability's own channel label does:
      // bare, it measured 3.38:1 light and 1.25:1 dark on the tails (npm run legible, 2026-09-23).
      g.append(text(cx - poreHalf - 6, (memTop + memBot) / 2, 'channel', { anchor: 'end', 'font-size': 9.6, class: 'tl-over', style: `fill:${INK.water}` }));
    }
    void CHANNEL_LABEL;

    // The carbonyl oxygens, on the neck itself: half in the wall and half in the pore, which is where a
    // carbonyl sits and which is what lets a potassium ion trade its water for them.
    for (const dy of [-1, 1]) {
      for (const sign of [-1, 1]) {
        g.append(atom(cx + sign * filterR, filterY + dy * oxR * 1.7, 'O', oxR, { label: false, title: 'A carbonyl oxygen of the selectivity filter' }));
      }
    }

    // The two fluids, so the gradient the channel is spending is visible either side of it. `atom()`
    // draws no symbol under 4.4 units, and an ion with no symbol is identity by colour alone, so the
    // floor is set on SODIUM, the smaller of the two, and both keep their names on a phone.
    const ionR = clamp(Math.min(sceneW * 0.017, sceneH * 0.026), 6.3, 8.4);
    const naS = ionRadiusPx('Na', ionR);
    const kS = ionRadiusPx('K', ionR);
    const sz = clamp(sceneW * 0.024, 8.6, 10.4);
    const fluids = [
      { spots: CH_OUT_SCATTER, y0: sz * 2.2, y1: top - ionR * 2.2, na: 145, k: 4 },
      { spots: CH_IN_SCATTER, y0: bot + ionR * 2.2, y1: sceneH - sz * 3.2, na: 12, k: 140 },
    ];
    for (const fl of fluids) {
      const h0 = Math.max(10, fl.y1 - fl.y0);
      const nNa = Math.round(clamp(fl.na / MM_PER_ION, 0, 9));
      const nK = Math.round(clamp(fl.k / MM_PER_ION, 0, 9));
      // A slot is skipped only where it would land over the protein AND close to the sheet: excluded by
      // x alone, the protein's own width took two thirds of the field and the fluids came out empty.
      const place = (p, sym, rad) => {
        if (!p) return;
        const px = p[0] * sceneW;
        const py = fl.y0 + p[1] * h0;
        const nearSheet = fl === fluids[0] ? p[1] > 0.45 : p[1] < 0.55;
        if (Math.abs(px - cx) < poreHalf * 1.2 && nearSheet) return;
        g.append(atom(px, py, sym, rad, { charge: '+', label: rad >= 4.4 }));
      };
      for (let i = 0; i < nNa; i += 1) place(fl.spots[i * 2], 'Na', naS);
      for (let i = 0; i < nK; i += 1) place(fl.spots[i * 2 + 1], 'K', kS);
    }
    g.append(text(sceneW, sz, `one ion drawn per ${MM_PER_ION} mmol/L`, { anchor: 'end', class: 'mol-rt-note', 'font-size': f1(sz - 0.8) }));

    // Which side is which. The cytosol's line is split in two on a phone, where the one sentence ran off
    // the edge of the stage and through the ions standing in it.
    g.append(text(0, sz, 'Extracellular fluid', { class: 'tl-head', 'font-size': f1(sz) }));
    g.append(text(0, sceneH - (narrow ? sz + 4 : 3), 'Cytosol', { class: 'tl-head', 'font-size': f1(sz) }));
    g.append(text(narrow ? 0 : sceneW, sceneH - 3, 'potassium is thirty-five times more concentrated here', {
      anchor: narrow ? 'start' : 'end', class: 'mol-rt-note', 'font-size': f1(sz - 0.8),
    }));

    // What has opened the gate, drawn as its own cause.
    drawGateCause(g, cx, poreHalf, memTop, memBot, top, bot, sz, sceneW);

    // The ions in flight. Only the last five are drawn: a reader who fires a dozen in a second gets a
    // queue of twelve ions and seventy water molecules on one axis, which is a smear rather than a
    // mechanism. The tally counts every one of them.
    const t = nowT();
    const flying = shots.slice(-5);
    flying.forEach((s, i) => {
      const u = clamp((t - s.start) / FLIGHT_SECONDS, 0, 1);
      drawShot(g, s, u, cx, bot, top, filterY, pmScale, poreHalf, i);
    });

    // The filter overlay: the oxygens against the ghosts of the water this ion was wearing.
    if (filterShown) drawFilterOverlay(g, cx, filterY, pmScale, filterR, oxR, top - 8);

    svg.append(g);

    // The tally, as a typographic table.
    const rx = narrow ? 0 : sceneW + 22;
    const ry = narrow ? sceneH + 6 : 4;
    const rw = narrow ? w : readW;
    const rh = narrow ? Math.max(40, hgt - ry) : hgt - 8;
    drawTally(rx, ry, rw, rh);
  }

  // Each cause is drawn beside the channel and INSIDE the stage: at a phone's width the charge row and
  // its caption both ran off the right edge, and a label drawn off the stage is not a label.
  function drawGateCause(g, cx, poreHalf, memTop, memBot, top, bot, sz, sceneW) {
    const mid = (memTop + memBot) / 2;
    const right = Math.min(cx + poreHalf * 1.35, sceneW - 6);
    if (gate === 'voltage') {
      const n = 4;
      const step = Math.max(10, Math.min(poreHalf * 0.36, (sceneW - right - 4) / n));
      for (let i = 0; i < n; i += 1) {
        const x = right + i * step;
        g.append(text(x, memTop - 5, '+', { anchor: 'middle', 'font-size': f1(sz + 1), style: `fill:${INK.coral}`, 'font-weight': 700 }));
        g.append(text(x, memBot + sz + 3, '−', { anchor: 'middle', 'font-size': f1(sz + 1), style: `fill:${INK.water}`, 'font-weight': 700 }));
      }
      g.append(text(sceneW, memTop - sz - 9, 'a change in the potential', { anchor: 'end', 'font-size': f1(sz - 0.6), class: 'tl-line' }));
    } else if (gate === 'ligand') {
      const lx = right;
      const ly = top + (mid - top) * 0.4;
      g.append(el('circle', { cx: f1(lx), cy: f1(ly), r: f1(Math.max(4, poreHalf * 0.17)), fill: INK.gold }));
      g.append(text(sceneW, f1(ly - poreHalf * 0.3), 'a molecule has bound', { anchor: 'end', 'font-size': f1(sz - 0.6), class: 'tl-line' }));
    } else if (gate === 'stretch') {
      for (const sign of [-1, 1]) {
        const x0 = cx + sign * poreHalf * 1.35;
        const x1 = sign < 0 ? Math.max(6, cx - poreHalf * 2.6) : Math.min(sceneW - 6, cx + poreHalf * 2.6);
        g.append(el('path', {
          d: `M${f1(x0)} ${f1(mid)} L${f1(x1)} ${f1(mid)} M${f1(x1 - sign * 7)} ${f1(mid - 5)} L${f1(x1)} ${f1(mid)} L${f1(x1 - sign * 7)} ${f1(mid + 5)}`,
          stroke: C.soft, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round',
        }));
      }
      g.append(text(cx, bot + sz * 2, 'the membrane is being pulled', { anchor: 'middle', 'font-size': f1(sz - 0.6), class: 'tl-line' }));
    } else {
      g.append(text(cx, bot + sz * 2, 'the gate is shut', { anchor: 'middle', 'font-size': f1(sz - 0.6), class: 'tl-line' }));
    }
  }

  // An ion arrives inside its shell of water, sheds it at the mouth of the filter, and either passes or
  // is turned back. The shell reforms the moment it is refused, which is the explanation and not a
  // decoration: it is what the ion would have to give up and get nothing back for.
  function drawShot(g, s, u, cx, bot, top, filterY, pmScale, poreHalf, slot = 0) {
    const start = bot + poreHalf * 0.9;
    const arrive = filterY + poreHalf * 0.5;
    const exit = top - poreHalf * 0.7;
    // Both drawn against the filter's own scale, with a floor so the symbol is always set: the point
    // of the scene is that sodium is the SMALLER ion and is turned back anyway.
    const r = Math.max(4.6, ELEMENTS[s.sym].ionic * pmScale);
    const shellR = shellPm(s.sym) * pmScale;
    let y;
    let shell;
    if (u < 0.42) {
      const k = u / 0.42;
      y = start + (arrive - start) * k;
      shell = 1;
    } else if (u < 0.58) {
      const k = (u - 0.42) / 0.16;
      y = arrive;
      shell = 1 - k; // the water comes off at the mouth
    } else if (s.passed) {
      const k = (u - 0.58) / 0.42;
      y = arrive + (exit - arrive) * k;
      shell = k > 0.4 ? (k - 0.4) / 0.6 : 0;
    } else {
      const k = (u - 0.58) / 0.42;
      y = arrive + (start - arrive) * k;
      shell = Math.min(1, k * 2.2); // refused, and it takes its water straight back
    }
    // A queue of ions is drawn as a queue: a small lateral offset in the vestibule that closes to nothing
    // at the filter, where the pore is one ion wide.
    const inFilter = u > 0.42 && (s.passed ? u < 0.9 : u < 0.75);
    const lane = inFilter ? 0 : (slot % 3 - 1) * poreHalf * 0.24;
    const px = cx + lane;
    if (shell > 0.02) {
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2 + u * 1.7;
        g.append(atom(px + Math.cos(a) * shellR, y + Math.sin(a) * shellR, 'O', Math.max(2.2, r * 0.5), { label: false }));
      }
    }
    g.append(atom(px, y, s.sym, r, { charge: '+' }));
  }

  function drawFilterOverlay(g, cx, filterY, pmScale, filterR, oxR, noteBase) {
    const sym = ion === 'sodium' ? 'Na' : 'K';
    const shellR = shellPm(sym) * pmScale;
    g.append(el('circle', { cx: f1(cx), cy: f1(filterY), r: f1(shellR), fill: 'none', stroke: C.soft, 'stroke-width': 1.1, 'stroke-dasharray': '3 3' }));
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      g.append(el('circle', { cx: f1(cx + Math.cos(a) * shellR), cy: f1(filterY + Math.sin(a) * shellR), r: f1(Math.max(2.2, oxR * 0.8)), fill: 'none', stroke: C.soft, 'stroke-dasharray': '2 2' }));
    }
    g.append(el('circle', { cx: f1(cx), cy: f1(filterY), r: f1(filterR), fill: 'none', stroke: INK.coral, 'stroke-width': 1.1 }));
    // Above the protein, in the strip of fluid the ion slots leave empty over it, and in two lines so it
    // stays inside that strip. It was set across the filter itself, over the lipid heads and the
    // channel's own wall, where it measured 2.95:1 light and 1.08:1 dark (npm run legible, 2026-09-23).
    // A phone's fluid is too shallow to leave that strip empty — the sentence landed on three sodium
    // ions — so there it is the tally's sentence instead (drawTally).
    if (narrow) return;
    const [first, second] = filterNote();
    g.append(text(cx, noteBase - 12, first, { anchor: 'middle', 'font-size': 9.4, class: 'tl-line' }));
    g.append(text(cx, noteBase, second, { anchor: 'middle', 'font-size': 9.4, class: 'tl-line' }));
  }

  // What the filter overlay shows, in words, as two halves so the wide stage can set it in two lines.
  function filterNote() {
    const sym = ion === 'sodium' ? 'Na' : 'K';
    const gapPm = FILTER_PM - shellPm(sym);
    return [
      `${sym === 'K' ? 'Potassium' : 'Sodium'}’s water sat`,
      gapPm < 6 ? 'exactly where the oxygens are.' : `${Math.round(gapPm)} pm short of the oxygens.`,
    ];
  }

  function drawTally(x, y, w, hgt) {
    const g = el('g');
    const ratio = selectivityRatio();
    const gdef = GATES.find((d) => d.id === gate);
    const size = narrow ? 9.6 : 10.4;
    const ratioWord = ratio > 0 ? (passes.sodium ? `${Math.round(ratio)} ×` : `${Math.round(ratio)} × or better`) : 'nothing fired yet';
    // A phone gets five rows and one sentence; the desktop column gets the same numbers as two tallies
    // and two sentences. Set at the desktop's twelve rows, a phone's column ran two hundred pixels past
    // the foot of the pane and under the toolbar.
    const rows = narrow
      ? [
        ['K⁺ through / back', `${passes.potassium} / ${rejects.potassium}`],
        ['Na⁺ through / back', `${passes.sodium} / ${rejects.sodium}`],
        ['Gate', gdef.label.toLowerCase()],
        ['K⁺ over Na⁺, so far', ratioWord],
        ['Measured, for a real one', `${grouped(TRUE_SELECTIVITY)} ×`],
        ...(filterShown ? notes(filterNote().join(' '), w, size) : []),
        ...notes('Sodium is the smaller ion. It is not blocked; it is priced out.', w, size),
      ]
      : [
        { head: 'Potassium' },
        ['Through', String(passes.potassium)],
        ['Turned back', String(rejects.potassium)],
        { head: 'Sodium' },
        ['Through', String(passes.sodium)],
        ['Turned back', String(rejects.sodium)],
        { head: 'The filter' },
        ['Gate', gdef.label.toLowerCase()],
        ['K⁺ over Na⁺, so far', ratioWord],
        ['Measured, for a real one', `${grouped(TRUE_SELECTIVITY)} ×`],
        ...notes(gdef.line, w, size),
        ...notes('Sodium is the smaller ion. It is not blocked; it is priced out.', w, size),
      ];
    const { rowH, slack } = fitRows(rows, Math.max(50, hgt), { size }, narrow ? 11 : 13, 26);
    readoutTable(g, rows, { x, y: y + Math.min(slack, hgt * 0.15), width: w, rowH, size });
    svg.append(g);
  }

  // ---------------------------------------------------------------- layout

  let ready = false;
  function draw() {
    const r = pane.getBoundingClientRect();
    const w = Math.max(60, Math.round(r.width));
    const hgt = Math.max(60, Math.round(r.height));
    svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    svg.replaceChildren();
    if (scene === 'carrier') drawCarrier(w, hgt); else drawChannel(w, hgt);
    svg.append(focusBrackets(w, hgt));
  }

  function focusBrackets(w, hgt) {
    const len = Math.max(9, Math.min(20, w * 0.06, hgt * 0.16));
    const a = 2;
    const x1 = w - 2;
    const y1 = hgt - 2;
    const d = [
      `M${a} ${f1(a + len)} L${a} ${a} L${f1(a + len)} ${a}`,
      `M${f1(x1 - len)} ${a} L${f1(x1)} ${a} L${f1(x1)} ${f1(a + len)}`,
      `M${f1(x1)} ${f1(y1 - len)} L${f1(x1)} ${f1(y1)} L${f1(x1 - len)} ${f1(y1)}`,
      `M${f1(a + len)} ${f1(y1)} L${a} ${f1(y1)} L${a} ${f1(y1 - len)}`,
    ].join(' ');
    return el('path', { d, class: 'mol-focus', fill: 'none', stroke: C.water, 'stroke-width': 2.2, 'stroke-linecap': 'square' });
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < 660 || hgt < 300;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 18;
    if (pad > 18 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--tl-pad', `${pad}px`);
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

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  document.fonts?.ready.then(() => { if (!destroyed && ready) draw(); });
  onResize();
  void ns;
  void tint;

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      svg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(t) {
      pinned = t;
      t0 = performance.now() / 1000 - t;
      if (!destroyed && ready) draw();
    },
    setVisible(v) {
      if (!v && raf) { cancelAnimationFrame(raf); raf = 0; } else if (v && shots.length) kick();
    },
    setTheme() {
      if (!destroyed && ready) draw();
    },
    describe() {
      return {
        scene,
        concentrationMM: round(concentration, 2),
        simpleFlux: Math.round(bareFluxOf(concentration)),
        carrierFlux: Math.round(carrierFluxOf(carriers, concentration)),
        vmax: vmaxOf(carriers),
        halfMaxMM: KM,
        carriers,
        saturationFraction: round(saturation(), 3),
        plotted: plotted.length,
        ion,
        gate,
        gateOpen: gateOpen(),
        passes: { ...passes },
        rejects: { ...rejects },
        selectivityRatio: round(selectivityRatio(), 1),
        filterShown,
        fired,
        layout: narrow ? 'narrow' : 'wide',
        t: round(nowT(), 3), // the clock, seconds. Reset sends it back to zero and it starts again at
        // once, so it is the one field a post-Reset describe() cannot match a mount describe() on.
      };
    },
  };
}
