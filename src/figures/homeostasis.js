// Holding a body temperature: the homeostasis figure. Left, an SVG diagram of the negative-feedback
// loop (stimulus, sensor, control centre, effectors, response) that lights up along the path in use;
// right, a canvas chart of the last 120 simulated seconds of core temperature around the set point.
// The numbers come from lib/homeostasis-model.js, run at 10 simulated seconds per real second.
//
// Every frame is a function of the clock t and the recorded reader actions (episodes and feedback
// toggles, each stamped with the simulated second it was pressed at). The model is stepped at a fixed
// 0.1 s and replayed from 0 whenever time moves backwards, so setTime(t) shows the same frame on every
// machine. Under reduced motion the clock does not run on its own: an episode button records its
// event and jumps the clock ahead by 90 s in one cut, and the arrow keys scrub.
import { alpha } from '../palette.js';
import { el, h, text, C, tint, uid } from './lib/svg.js';
import { createModel, eventsFromActions, effectorName, EPISODES } from './lib/homeostasis-model.js';

export const meta = { kind: 'homeostasis', title: 'Holding a body temperature', needsWebGL: false, aspect: 16 / 10 };

const DT = 0.1; // simulated seconds per model step
const WINDOW = 120; // simulated seconds the chart shows
const KEEP = Math.round(WINDOW / DT) + 2; // samples kept for the chart
const SPEED = 10; // simulated seconds per real second
const JUMP = 90; // seconds an episode button advances under reduced motion
const T_MAX = 1e5;
const Y_MIN = 34;
const Y_MAX = 40;

const EPISODE_STYLE = {
  coldPlunge: { colour: 'water', label: 'cold plunge · air at 5 °C' },
  race: { colour: 'coral', label: 'race · running hard' },
  fever: { colour: 'violet', label: 'fever · set point 39 °C' },
};

const index = (t) => Math.floor(t / DT + 1e-9);

// ---------- the model runner: fixed steps, a ring of the last KEEP samples, replay on rewind ----------

function createRunner() {
  const ring = {
    core: new Float64Array(KEEP),
    effector: new Float64Array(KEEP),
    ambient: new Float64Array(KEEP),
    activity: new Float64Array(KEEP),
    setPoint: new Float64Array(KEEP),
    feedback: new Uint8Array(KEEP),
  };
  let model = null;
  let events = [];
  let next = 0;
  let head = -1;
  const k = (i) => i % KEEP;

  function store(i) {
    const j = k(i);
    const s = model.state;
    ring.core[j] = s.core;
    ring.effector[j] = s.effector;
    ring.ambient[j] = s.ambient;
    ring.activity[j] = s.activity;
    ring.setPoint[j] = s.setPoint;
    ring.feedback[j] = s.feedback ? 1 : 0;
  }

  // Apply every event whose time has arrived, so the sample at t carries the inputs in force from t on.
  function apply() {
    while (next < events.length && events[next].at <= model.state.t + 1e-9) {
      model.setInputs(events[next].inputs);
      next += 1;
    }
  }

  function restart() {
    model = createModel();
    next = 0;
    apply();
    head = 0;
    store(0);
  }

  return {
    ring,
    k,
    get head() { return head; },
    setActions(list) {
      events = eventsFromActions(list);
      restart();
    },
    advanceTo(i) {
      if (head < 0 || i < head) restart();
      while (head < i) {
        model.step(DT);
        apply();
        head += 1;
        store(head);
      }
    },
  };
}

// ---------- the diagram ----------

const VW = 440;
const VH = 512;
const BOX_X = 85;
const BOX_W = 300;
const RETURN_X = 42;

const CSS = `
.tb-homeo { position: absolute; inset: 0; display: grid; grid-template-columns: 45% 55%; grid-template-rows: minmax(0, 1fr); padding-bottom: 3.3rem; box-sizing: border-box; font-family: var(--font-ui); }
.tb-homeo .hm-diagram { position: relative; min-width: 0; min-height: 0; padding: 0.5rem 0.1rem 0 0.5rem; box-sizing: border-box; }
.tb-homeo .hm-diagram svg { display: block; width: 100%; height: 100%; overflow: visible; }
/* min-height 0: otherwise the canvas's own pixel height sets the row's minimum and the row outgrows the padded area. */
.tb-homeo .hm-chart { position: relative; min-width: 0; min-height: 0; }
.tb-homeo .hm-chart canvas { display: block; width: 100%; height: 100%; outline: none; }
.tb-homeo .hm-chart canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
.tb-homeo .hm-chips { position: absolute; top: var(--space-3); left: var(--space-3); display: flex; flex-direction: column; align-items: flex-start; gap: 0.3rem; }
.tb-homeo .hm-state { display: inline-flex; align-items: center; gap: 0.45em; color: var(--ink); }
.tb-homeo .hm-state::before { content: ""; width: 0.6em; height: 0.6em; border-radius: 50%; background: var(--hm-dot, var(--ink-faint)); }
.tb-homeo .hm-state[data-mode="hot"] { --hm-dot: var(--coral); }
.tb-homeo .hm-state[data-mode="cold"] { --hm-dot: var(--water); }
.tb-homeo .hm-open { color: var(--coral); border-color: var(--coral); }
.tb-homeo .hm-open[hidden] { display: none; }
.tb-homeo svg text { font-family: var(--font-ui); }
.tb-homeo .hm-title { font-size: 9.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; fill: var(--ink-faint); }
.tb-homeo .hm-body { font-size: 12px; fill: var(--ink); }
.tb-homeo .hm-live { font-size: 12px; fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.tb-homeo .hm-box { fill: var(--paper); stroke: var(--rule-strong); stroke-width: 1.2; }
.tb-homeo .hm-arrow { fill: none; stroke: var(--rule-strong); stroke-width: 1.6; stroke-linejoin: round; }
.tb-homeo .hm-active { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.tb-homeo .hm-loop { font-size: 9.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; fill: var(--ink-faint); }
.tb-homeo .hm-cut { fill: none; stroke: var(--coral); stroke-width: 2; stroke-linecap: round; }
.tb-homeo .hm-cutlabel { font-size: 10px; fill: var(--coral); font-weight: 600; }
.tb-homeo .fig-btn.is-live { border-color: var(--coral); color: var(--coral); }
.tb-homeo .fig-toolbar { justify-content: flex-start; }
.tb-homeo .hm-short { display: none; }
@container (max-width: 640px) {
  .tb-homeo { grid-template-columns: 1fr; padding-bottom: 6rem; }
  .tb-homeo .hm-diagram { display: none; }
  .tb-homeo .hm-chips { left: auto; right: var(--space-3); align-items: flex-end; }
  .tb-homeo .hm-long { display: none; }
  .tb-homeo .hm-short { display: inline; }
  .tb-homeo .fig-btn { padding: 0.3rem 0.55rem; }
}
`;

// A box with a small-caps title and up to three lines of body text. Lines flagged live get the
// secondary colour and are updated each frame.
function box(x, y, w, hgt, title, lines) {
  const g = el('g');
  const rect = el('rect', { x, y, width: w, height: hgt, rx: 8, class: 'hm-box' });
  g.append(rect);
  const cx = x + w / 2;
  g.append(text(cx, y + 17, title, { anchor: 'middle', class: 'hm-title' }));
  const step = lines.length > 2 ? 14.5 : 15;
  const nodes = lines.map((line, i) => {
    const node = text(cx, y + 34 + i * step, line.text, { anchor: 'middle', class: line.live ? 'hm-live' : 'hm-body' });
    g.append(node);
    return node;
  });
  return { g, rect, nodes };
}

function buildDiagram(ns) {
  const svg = el('svg', { viewBox: `0 0 ${VW} ${VH}`, preserveAspectRatio: 'xMidYMin meet', 'aria-hidden': 'true' });
  const defs = el('defs');
  const marker = (id, colour, size) => el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: size, markerHeight: size, orient: 'auto-start-reverse' }, [
    el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: colour }),
  ]);
  // Marker size scales with the stroke, so the lit path (3 wide) gets a smaller marker than the base (1.6).
  defs.append(marker(`${ns}-base`, C.ruleStrong, 7), marker(`${ns}-hot`, C.coral, 5), marker(`${ns}-cold`, C.water, 5));
  svg.append(defs);

  // Rows: stimulus, sensor, control centre, effectors (two), response.
  const rows = { stimulus: [62, 56], sensor: [150, 56], control: [238, 70], effectors: [340, 64], response: [436, 56] };
  const half = (BOX_W - 14) / 2;
  const coldX = BOX_X;
  const hotX = BOX_X + half + 14;
  const mid = BOX_X + BOX_W / 2;
  const coldMid = coldX + half / 2;
  const hotMid = hotX + half / 2;

  const boxes = {
    stimulus: box(BOX_X, rows.stimulus[0], BOX_W, rows.stimulus[1], 'Stimulus', [
      { text: 'the core temperature departs from 37 °C' }, { text: 'now 37.00 °C', live: true },
    ]),
    sensor: box(BOX_X, rows.sensor[0], BOX_W, rows.sensor[1], 'Sensor', [
      { text: 'thermoreceptors in the skin' }, { text: 'and in the hypothalamus' },
    ]),
    control: box(BOX_X, rows.control[0], BOX_W, rows.control[1], 'Control centre', [
      { text: 'the hypothalamus compares the reading' }, { text: 'with its set point' }, { text: 'set point 37 °C · error 0.00', live: true },
    ]),
    cold: box(coldX, rows.effectors[0], half, rows.effectors[1], 'Effectors · cold', [
      { text: 'shivering' }, { text: 'skin vessels narrow' },
    ]),
    hot: box(hotX, rows.effectors[0], half, rows.effectors[1], 'Effectors · hot', [
      { text: 'sweat glands' }, { text: 'skin vessels widen' },
    ]),
    response: box(BOX_X, rows.response[0], BOX_W, rows.response[1], 'Response', [
      { text: 'heat made balances heat lost', live: true }, { text: 'the change is opposed' },
    ]),
  };

  const bottom = (row) => rows[row][0] + rows[row][1];
  const segments = {
    a1: `M${mid} ${bottom('stimulus')} L${mid} ${rows.sensor[0] - 1}`,
    a2: `M${mid} ${bottom('sensor')} L${mid} ${rows.control[0] - 1}`,
    a3c: `M${coldMid} ${bottom('control')} L${coldMid} ${rows.effectors[0] - 1}`,
    a3h: `M${hotMid} ${bottom('control')} L${hotMid} ${rows.effectors[0] - 1}`,
    a4c: `M${coldMid} ${bottom('effectors')} L${coldMid} ${rows.response[0] - 1}`,
    a4h: `M${hotMid} ${bottom('effectors')} L${hotMid} ${rows.response[0] - 1}`,
    a5: `M${BOX_X} ${rows.response[0] + rows.response[1] / 2} L${RETURN_X} ${rows.response[0] + rows.response[1] / 2} L${RETURN_X} ${rows.stimulus[0] + rows.stimulus[1] / 2} L${BOX_X - 1} ${rows.stimulus[0] + rows.stimulus[1] / 2}`,
  };
  const base = el('g');
  for (const d of Object.values(segments)) base.append(el('path', { d, class: 'hm-arrow', 'marker-end': `url(#${ns}-base)` }));
  svg.append(base);

  // The overlay that lights up: one path per segment, coloured and shown by mode.
  const active = {};
  const overlay = el('g');
  for (const [name, d] of Object.entries(segments)) {
    const p = el('path', { d, class: 'hm-active', 'stroke-dasharray': '8 6' });
    p.style.display = 'none';
    overlay.append(p);
    active[name] = p;
  }
  svg.append(overlay);
  for (const b of Object.values(boxes)) svg.append(b.g);

  // The return arrow's label, written up the left margin.
  const loopY = (rows.response[0] + rows.stimulus[0] + rows.stimulus[1]) / 2;
  svg.append(text(RETURN_X - 14, loopY, 'negative feedback', { anchor: 'middle', class: 'hm-loop', transform: `rotate(-90 ${RETURN_X - 14} ${loopY})` }));

  // With feedback off the loop is open: a cut through the control-to-effector arrows.
  const cutY = bottom('control') + 16;
  const cut = el('g');
  for (const x of [coldMid, hotMid]) cut.append(el('path', { d: `M${x - 9} ${cutY + 7} L${x + 9} ${cutY - 7}`, class: 'hm-cut' }));
  cut.append(text(mid, cutY + 4, 'open', { anchor: 'middle', class: 'hm-cutlabel' }));
  cut.style.display = 'none';
  svg.append(cut);

  return { svg, boxes, active, cut, rows };
}

// ---------- the figure ----------

export function mount(root, ctx) {
  const ns = uid('hm');
  const reduced = Boolean(ctx.reducedMotion);
  let palette = ctx.palette;
  let t = ctx.pinnedTime ?? 0;
  let playing = !reduced && ctx.pinnedTime === null;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  let lastFrameMs = 0;
  let actions = [];
  const runner = createRunner();
  runner.setActions(actions);

  // ----- DOM -----
  const wrap = h('div', { class: 'tb-homeo' });
  wrap.append(h('style', { text: CSS }));
  const diagram = buildDiagram(ns);
  const diagramPane = h('div', { class: 'hm-diagram' }, [diagram.svg]);
  const canvas = h('canvas', { tabindex: 0, role: 'img', 'aria-label': 'Core body temperature over the last two simulated minutes, with the set point and the comfort band. Space pauses or plays; the arrow keys step time.' });
  const chartPane = h('div', { class: 'hm-chart' }, [canvas]);
  const stateChip = h('span', { class: 'fig-chip fig-ui hm-state', 'data-mode': 'none', 'aria-live': 'polite', text: 'Resting' });
  const openChip = h('span', { class: 'fig-chip fig-ui hm-open', text: 'loop open: feedback off', hidden: true });
  const chips = h('div', { class: 'hm-chips' }, [stateChip, openChip]);

  // A button with an optional short label for narrow stages; aria-label keeps the full name.
  const button = (label, short, onClick, attrs = {}) => {
    const children = short ? [h('span', { class: 'hm-long', text: label }), h('span', { class: 'hm-short', text: short })] : [label];
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': short ? label : null, ...attrs }, children);
    node.addEventListener('click', onClick);
    return node;
  };
  const btnCold = button('Cold plunge', 'Cold', () => episode('coldPlunge'));
  const btnRace = button('Run a race', 'Race', () => episode('race'));
  const btnFever = button('Fever', null, () => episode('fever'));
  const btnFeedback = button('Feedback on', null, () => toggleFeedback(), { 'aria-pressed': 'true' });
  const btnReset = button('Reset', null, () => reset());
  const btnPlay = button('Pause', null, () => setPlaying(!playing));
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [btnCold, btnRace, btnFever, btnFeedback, btnReset, btnPlay]);

  wrap.append(diagramPane, chartPane, chips, toolbar);
  root.append(wrap);

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('the homeostasis chart needs a 2D canvas context and this browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // ----- sizing -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  function resize() {
    const r = chartPane.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const nextDpr = Math.min(2, window.devicePixelRatio || 1);
    if (w !== cw || hh !== ch || nextDpr !== dpr) {
      cw = w;
      ch = hh;
      dpr = nextDpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(hh * dpr);
    }
    return true;
  }

  // ----- the chart -----
  const { ring, k } = runner;
  const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

  function drawChart() {
    if (!cw) return;
    const p = palette;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    // A narrow stage (phone) gets the core trace alone: no air strip, tighter gutters.
    const narrow = cw < 420;
    const padL = narrow ? 34 : 50;
    const padR = 14;
    const padT = narrow ? 22 : 26;
    const axisH = narrow ? 26 : 30;
    const stripH = narrow ? 0 : 40;
    const gap = narrow ? 0 : 12;
    const mainTop = padT;
    const mainBot = ch - axisH - stripH - gap;
    const stripTop = mainBot + gap;
    const stripBot = ch - axisH;
    const plotW = cw - padL - padR;
    const head = runner.head;
    const tHead = head * DT;
    const t0 = Math.max(0, tHead - WINDOW);
    const X = (s) => padL + ((s - t0) / WINDOW) * plotW;
    const Y = (T) => mainTop + ((Y_MAX - T) / (Y_MAX - Y_MIN)) * (mainBot - mainTop);
    const YA = (T) => stripTop + ((32 - T) / 32) * (stripBot - stripTop);
    const i0 = Math.max(0, head - Math.round(WINDOW / DT));

    // plot backgrounds
    g.fillStyle = p.paper;
    g.fillRect(padL, mainTop, plotW, mainBot - mainTop);
    if (!narrow) g.fillRect(padL, stripTop, plotW, stripBot - stripTop);

    // comfort band: set point ± 0.5, drawn as a ribbon over time
    g.beginPath();
    for (let i = i0; i <= head; i += 1) {
      const x = X(i * DT);
      const y = Y(ring.setPoint[k(i)] + 0.5);
      if (i === i0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    for (let i = head; i >= i0; i -= 1) g.lineTo(X(i * DT), Y(ring.setPoint[k(i)] - 0.5));
    g.closePath();
    g.fillStyle = alpha(p.leaf, 0.11);
    g.fill();

    // horizontal grid, one line per degree
    g.lineWidth = 1;
    g.strokeStyle = p.rule;
    g.font = `11px ${FONT}`;
    g.textBaseline = 'middle';
    g.textAlign = 'right';
    const spNow = ring.setPoint[k(head)];
    for (let T = Y_MIN; T <= Y_MAX; T += 1) {
      const y = Math.round(Y(T)) + 0.5;
      g.beginPath();
      g.moveTo(padL, y);
      g.lineTo(padL + plotW, y);
      g.stroke();
      const isSet = Math.abs(T - spNow) < 0.01;
      if (narrow && !isSet && T % 2 === 1) continue; // every other degree when there is no room
      g.fillStyle = isSet ? p.leaf : p.inkSoft;
      g.font = isSet ? `600 11px ${FONT}` : `11px ${FONT}`;
      g.fillText(String(T), padL - 7, y);
      if (isSet && !narrow) {
        g.font = `9.5px ${FONT}`;
        g.fillText('set point', padL - 7, y + 12);
      }
    }
    // chart title, above the plot
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillStyle = p.inkSoft;
    g.font = `600 11px ${FONT}`;
    g.fillText('Core temperature, °C', padL, mainTop - 9);

    // episode bands, labelled inside the plot along the top
    for (const a of actions) {
      const ep = EPISODES[a.kind];
      if (!ep) continue;
      const s0 = Math.max(a.at, t0);
      const s1 = Math.min(a.at + ep.duration, t0 + WINDOW);
      if (s1 <= s0) continue;
      const st = EPISODE_STYLE[a.kind];
      const colour = p[st.colour];
      g.fillStyle = alpha(colour, 0.09);
      g.fillRect(X(s0), mainTop, X(s1) - X(s0), mainBot - mainTop);
      g.fillStyle = colour;
      g.font = `600 10px ${FONT}`;
      g.fillText(narrow ? st.label.split(' ·')[0] : st.label, X(s0) + 5, mainTop + 14);
    }

    // set point, dashed
    g.setLineDash([5, 4]);
    g.strokeStyle = p.leaf;
    g.lineWidth = 1.5;
    g.beginPath();
    for (let i = i0; i <= head; i += 1) {
      const x = X(i * DT);
      const y = Y(ring.setPoint[k(i)]);
      if (i === i0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.setLineDash([]);

    // core temperature
    g.strokeStyle = p.ink;
    g.lineWidth = 2;
    g.lineJoin = 'round';
    g.beginPath();
    for (let i = i0; i <= head; i += 1) {
      const x = X(i * DT);
      const y = Y(ring.core[k(i)]);
      if (i === i0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    const core = ring.core[k(head)];
    const hx = X(tHead);
    const hy = Y(core);
    g.beginPath();
    g.arc(hx, hy, 4, 0, Math.PI * 2);
    g.fillStyle = p.ink;
    g.fill();
    g.strokeStyle = p.paper;
    g.lineWidth = 1.5;
    g.stroke();
    const label = `${core.toFixed(1)} °C`;
    g.font = `600 12px ${FONT}`;
    const lw = g.measureText(label).width;
    const right = hx + 10 + lw < padL + plotW - 4;
    g.textAlign = right ? 'left' : 'right';
    g.textBaseline = 'middle';
    const ly = core >= spNow ? hy - 13 : hy + 13;
    const lx = right ? hx + 9 : hx - 9;
    g.fillStyle = alpha(p.paper, 0.85);
    g.fillRect(right ? lx - 3 : lx - lw - 3, ly - 8, lw + 6, 16);
    g.fillStyle = p.ink;
    g.fillText(label, lx, ly);

    // ambient strip
    if (!narrow) {
      g.strokeStyle = p.water;
      g.lineWidth = 1.5;
      g.beginPath();
      for (let i = i0; i <= head; i += 1) {
        const x = X(i * DT);
        const y = YA(ring.ambient[k(i)]);
        if (i === i0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      const amb = ring.ambient[k(head)];
      g.fillStyle = p.water;
      g.beginPath();
      g.arc(hx, YA(amb), 2.5, 0, Math.PI * 2);
      g.fill();
      g.font = `10px ${FONT}`;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      g.fillStyle = p.inkSoft;
      g.fillText('air, °C', padL - 7, (stripTop + stripBot) / 2);
      g.font = `600 10px ${FONT}`;
      g.fillStyle = p.water;
      const al = `${amb.toFixed(0)} °C`;
      const alw = g.measureText(al).width;
      const aRight = hx + 8 + alw < padL + plotW - 2;
      g.textAlign = aRight ? 'left' : 'right';
      g.fillText(al, aRight ? hx + 7 : hx - 7, YA(amb) + (amb < 16 ? -8 : 8));
    }

    // time axis
    g.strokeStyle = p.ruleStrong;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(padL, stripBot + 0.5);
    g.lineTo(padL + plotW, stripBot + 0.5);
    g.stroke();
    g.fillStyle = p.inkSoft;
    g.font = `10.5px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'top';
    const tickEvery = narrow ? 40 : 20;
    for (let s = Math.ceil(t0 / tickEvery) * tickEvery; s <= t0 + WINDOW + 1e-9; s += tickEvery) {
      const x = Math.round(X(s)) + 0.5;
      g.beginPath();
      g.moveTo(x, stripBot);
      g.lineTo(x, stripBot + 4);
      g.stroke();
      g.fillText(String(Math.round(s)), x, stripBot + 7);
    }
    g.textAlign = 'right';
    g.fillStyle = p.inkFaint;
    g.fillText(narrow ? 'simulated s' : 'simulated seconds · 10 per real second', padL + plotW, stripBot + 18);
  }

  // ----- the diagram -----
  let shownMode = null;
  let shownOpen = null;
  let shownStrength = -1;
  const setText = (node, str) => {
    if (node.textContent !== str) node.textContent = str;
  };
  const HOT_PATH = ['a1', 'a2', 'a3h', 'a4h', 'a5'];
  const COLD_PATH = ['a1', 'a2', 'a3c', 'a4c', 'a5'];

  function updateDiagram() {
    const j = k(runner.head);
    const core = ring.core[j];
    const sp = ring.setPoint[j];
    const e = ring.effector[j];
    const fb = ring.feedback[j] === 1;
    const err = core - sp;
    const mode = e > 0.05 ? 'hot' : e < -0.05 ? 'cold' : 'none';
    const colour = mode === 'hot' ? C.coral : C.water;
    if (mode !== shownMode) {
      shownMode = mode;
      const on = mode === 'hot' ? HOT_PATH : mode === 'cold' ? COLD_PATH : [];
      for (const [name, path] of Object.entries(diagram.active)) {
        const show = on.includes(name);
        path.style.display = show ? '' : 'none';
        if (show) {
          path.setAttribute('stroke', colour);
          path.setAttribute('marker-end', `url(#${ns}-${mode})`);
          if (reduced) path.removeAttribute('stroke-dasharray');
        }
      }
      // Inline styles, because the .hm-box rule would beat a fill or stroke attribute.
      for (const name of ['stimulus', 'sensor', 'control', 'response']) {
        diagram.boxes[name].rect.style.fill = mode === 'none' ? C.paper : tint(colour, 9);
        diagram.boxes[name].rect.style.stroke = mode === 'none' ? C.ruleStrong : colour;
      }
      diagram.boxes.cold.rect.style.stroke = mode === 'cold' ? C.water : C.ruleStrong;
      diagram.boxes.hot.rect.style.stroke = mode === 'hot' ? C.coral : C.ruleStrong;
      stateChip.dataset.mode = mode;
      shownStrength = -1;
    }
    // The working effector's box fills in proportion to its output.
    const strength = Math.round(Math.abs(e) * 10);
    if (strength !== shownStrength) {
      shownStrength = strength;
      diagram.boxes.hot.rect.style.fill = mode === 'hot' ? tint(C.coral, 10 + strength * 3.5) : C.paper;
      diagram.boxes.cold.rect.style.fill = mode === 'cold' ? tint(C.water, 10 + strength * 3.5) : C.paper;
    }
    if (mode !== 'none' && !reduced) {
      const off = (-((t * 4) % 14)).toFixed(1);
      for (const name of (mode === 'hot' ? HOT_PATH : COLD_PATH)) diagram.active[name].setAttribute('stroke-dashoffset', off);
    }
    if (fb !== shownOpen) {
      shownOpen = fb;
      diagram.cut.style.display = fb ? 'none' : '';
      openChip.hidden = fb;
      btnFeedback.setAttribute('aria-pressed', String(fb));
      btnFeedback.textContent = fb ? 'Feedback on' : 'Feedback off';
    }
    const errR = Math.round(err * 100) / 100;
    const errStr = errR === 0 ? '0.00' : `${errR < 0 ? '−' : '+'}${Math.abs(errR).toFixed(2)}`;
    setText(diagram.boxes.stimulus.nodes[1], `now ${core.toFixed(2)} °C`);
    setText(diagram.boxes.control.nodes[2], `set point ${sp.toFixed(0)} °C · error ${errStr}`);
    setText(diagram.boxes.response.nodes[0], mode === 'hot' ? 'heat lost: sweat evaporates, skin flushes' : mode === 'cold' ? 'heat made: muscles shiver, skin pales' : 'heat made balances heat lost');
    setText(diagram.boxes.response.nodes[1], fb ? 'the change is opposed' : 'with the loop open, nothing opposes it');
    setText(stateChip, effectorName(e));
    // Which episode is running, for the buttons.
    btnCold.classList.toggle('is-live', ring.ambient[j] < 21);
    btnRace.classList.toggle('is-live', ring.activity[j] > 0);
    btnFever.classList.toggle('is-live', sp > 37.5);
  }

  function draw() {
    const start = performance.now();
    runner.advanceTo(index(t));
    drawChart();
    updateDiagram();
    lastFrameMs = performance.now() - start;
  }

  // ----- clock -----
  function frame(now) {
    raf = 0;
    if (destroyed || !playing || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t = Math.min(T_MAX, t + dt * SPEED);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function schedule() {
    if (raf || destroyed || !playing || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function setPlaying(next) {
    playing = next;
    btnPlay.textContent = playing ? 'Pause' : 'Play';
    btnPlay.setAttribute('aria-label', playing ? 'Pause the simulation' : 'Play the simulation');
    if (playing) schedule();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function seek(next) {
    t = Math.min(T_MAX, Math.max(0, Number(next) || 0));
    draw();
  }

  // ----- reader actions -----
  function record(kind, value) {
    const i = index(t);
    const at = Number((i * DT).toFixed(3));
    actions = actions.filter((a) => a.at <= at + 1e-9);
    actions.push(kind === 'feedback' ? { at, kind, value } : { at, kind });
    runner.setActions(actions);
  }

  function episode(kind) {
    record(kind);
    if (reduced) seek(t + JUMP);
    else {
      draw();
      if (!playing && ctx.pinnedTime === null) setPlaying(true);
    }
  }

  function toggleFeedback() {
    const on = ring.feedback[k(runner.head)] === 1;
    record('feedback', !on);
    draw();
  }

  function reset() {
    actions = [];
    runner.setActions(actions);
    seek(0);
  }

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setPlaying(!playing);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seek(t + (e.shiftKey ? 30 : 5));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seek(t - (e.shiftKey ? 30 : 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      seek(0);
    }
  };
  canvas.addEventListener('keydown', onKey);

  // Canvas text drawn before the webfont arrived is redrawn once it has.
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && cw) draw(); });

  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    if (!resize()) return;
    draw();
    if (!ready) {
      ready = true;
      ctx.onReady();
    }
  });
  observer.observe(chartPane);
  setPlaying(playing);
  if (resize()) {
    draw();
    ready = true;
    ctx.onReady();
  }

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      canvas.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      setPlaying(false);
      seek(seconds);
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setTheme(nextTheme, nextPalette) {
      palette = nextPalette;
      drawChart();
    },
    describe() {
      const j = k(runner.head);
      return {
        t: Number(t.toFixed(3)),
        core: Number(ring.core[j].toFixed(3)),
        ambient: ring.ambient[j],
        setPoint: ring.setPoint[j],
        activity: ring.activity[j],
        effector: Number(ring.effector[j].toFixed(3)),
        feedback: ring.feedback[j] === 1,
        mode: shownMode,
        playing,
        events: actions.map((a) => ({ ...a })),
        frameMs: Number(lastFrameMs.toFixed(2)),
      };
    },
  };
}
