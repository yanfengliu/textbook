// Add acid to water, and to blood. Three beakers on one bench — pure water, a bicarbonate buffer and
// blood plasma — one titration chart they share, and a magnified window into whichever beaker the
// reader has chosen. The reader adds acid or base a drop at a time; the three curves separate at once
// and the buffered ones run flat until their capacity is gone, after which they fall too.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — beakers and the window in a left column, the chart filling a taller right column;
//   narrow — beakers, chart and window stacked, the window at half the token scale so its molecules
//            stay the size they say they are instead of being scaled down with the stage.
// Both panes are authored in the stage's own device pixels (the viewBox is the measured pixel box), so
// a 10.5 px label is 10.5 device pixels at any stage size.
//
// THE CHEMISTRY. The bench is at 37 °C, because the section is about blood and 7.40 is a 37 °C number.
// At 37 °C water's ion product is 10^-13.62, so pure water on this bench reads pH 6.81, not 7.00, and
// the stage says so — it is the chapter's own margin note made visible rather than an error.
//   water   pure water: the exact strong-acid/strong-base curve, [H+] = (c + sqrt(c^2 + 4Kw)) / 2.
//   buffer  a closed bicarbonate buffer: 24 mmol/L HCO3- with 1.2 mmol/L dissolved CO2, total carbon
//           conserved, apparent pKa1' 6.1. Its flat stretch is around pH 6.1 and it is spent when the
//           bicarbonate is gone, at about 24 mmol/L of acid.
//   plasma  the same bicarbonate pair held open by the lungs (dissolved CO2 pinned at 1.2 mmol/L) plus
//           the non-bicarbonate buffers of plasma — protein and phosphate — lumped into one weak acid,
//           20 mmol/L at pKa 7.1. An open system is far the stronger of the two, which is why plasma's
//           curve is the flattest here and why it still leaves the 7.35-7.45 band after about 3 mmol/L.
// Every pH is solved by bisection on the buffer-base balance, which is monotonic in pH, so the curves
// are exact rather than a Henderson-Hasselbalch approximation that would break where it matters most.
//
// The figure has no clock of its own: every frame is a function of the drops the reader has added, so
// setTime only redraws. describe() is documented at the bottom of this file.
import { el, h, text, C, tint, uid, clamp } from './lib/svg.js';
import { atom, bond, round, readoutCss, focusMark, INK } from './lib/mol-draw.js';

export const meta = { kind: 'phlab', title: 'Add acid to water, and to blood', needsWebGL: false, aspect: 16 / 9 };

// ---------------------------------------------------------------- the model

const TEMP_C = 37;
const PKW = 13.62; // water's ion product at 37 °C
const KW = 10 ** -PKW;
const NEUTRAL_PH = PKW / 2; // 6.81
const KA1 = 10 ** -6.1; // apparent first dissociation of dissolved CO2, 37 °C, plasma ionic strength
const HCO3_0 = 24; // mmol/L
const CO2_0 = 1.2; // mmol/L
const CT = HCO3_0 + CO2_0; // total carbon in the closed buffer
const KA_PROT = 10 ** -7.1; // the lumped non-bicarbonate buffer of plasma
const PROT_TOT = 20; // mmol/L
const CO2_H2CO3 = 400; // dissolved CO2 outnumbers true carbonic acid about 400 to 1

const DROP = 1; // mmol/L of H+ or OH- per drop
const MAX_DROPS = 80;
const BAND = [7.35, 7.45];

const mM = (molar) => molar * 1000;

// Buffer base in mmol/L: everything in the beaker that can still take up a hydrogen ion, minus the
// hydrogen ions already loose. Adding A mmol/L of strong acid lowers it by exactly A. Monotonic in pH.
function bbWater(pH) {
  const H = 10 ** -pH;
  return mM(KW / H) - mM(H);
}
function bbBuffer(pH) {
  const H = 10 ** -pH;
  return (CT * KA1) / (KA1 + H) + mM(KW / H) - mM(H);
}
function bbPlasma(pH) {
  const H = 10 ** -pH;
  return (CO2_0 * KA1) / H + (PROT_TOT * KA_PROT) / (KA_PROT + H) + mM(KW / H) - mM(H);
}

const BB0 = { water: bbWater(NEUTRAL_PH), buffer: bbBuffer(7.4), plasma: bbPlasma(7.4) };
const BB = { water: bbWater, buffer: bbBuffer, plasma: bbPlasma };

// Bisection, 60 halvings of [-2, 16]: the answer is good to about 1e-16 of a pH unit, which is far
// past the 2 dp the figure shows, and the function is monotonic so there is nothing to miss.
function solvePh(fn, target) {
  let lo = -2;
  let hi = 16;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// pH of one beaker after A mmol/L of strong acid (A > 0) or strong base (A < 0).
function phOf(kind, A) {
  return solvePh(BB[kind], BB0[kind] - A);
}

// What the bicarbonate buffer beaker is made of at this point in the titration.
function bufferSpecies(A) {
  const pH = phOf('buffer', A);
  const H = 10 ** -pH;
  const hco3 = (CT * KA1) / (KA1 + H);
  const co2 = CT - hco3;
  return { pH, hco3, co2, h2co3: co2 / CO2_H2CO3 };
}
function plasmaSpecies(A) {
  const pH = phOf('plasma', A);
  const H = 10 ** -pH;
  return { pH, hco3: (CO2_0 * KA1) / H, co2: CO2_0, h2co3: CO2_0 / CO2_H2CO3 };
}

// `colour` draws the curve, the liquid line and the bracket, where a large area of the accent is what
// is wanted; `ink` sets the reading under the glass, where the same accent at thirteen point would fall
// short of AA on the paper. tokens.css carries the pushed-towards-ink pair for exactly this.
const BEAKERS = [
  { id: 'water', name: 'Pure water', short: 'Water', note: `neutral ${NEUTRAL_PH.toFixed(2)} at ${TEMP_C} °C`, colour: C.ink, ink: C.ink },
  { id: 'buffer', name: 'Bicarbonate buffer', short: 'Buffer', note: '24 mmol/L HCO₃⁻, closed', colour: C.water, ink: INK.water },
  { id: 'plasma', name: 'Blood plasma', short: 'Plasma', note: 'HCO₃⁻ + protein, open', colour: C.coral, ink: INK.coral },
];
const BEAKER_BY_ID = Object.fromEntries(BEAKERS.map((b) => [b.id, b]));

// ---------------------------------------------------------------- style

const NARROW_W = 620;
const NARROW_H = 330;

const CSS = `${readoutCss('.tb-phlab')}
.tb-phlab { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  /* fr, not per cent: 42% + 58% + a column gap is wider than the box, so the chart pane hung over the
     right edge of the stage and the stage cut the end off the legend and the last tick label. */
  grid-template-columns: minmax(0, 42fr) minmax(0, 58fr);
  grid-template-rows: var(--ph-beaker-h, 47%) minmax(0, 1fr);
  padding: 0.35rem 0.45rem var(--ph-pad, 3rem); column-gap: var(--space-3); row-gap: var(--space-2);
  font-family: var(--font-ui); }
.tb-phlab .ph-pane { position: relative; min-width: 0; min-height: 0; }
.tb-phlab .ph-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-phlab .ph-beakers { grid-column: 1; grid-row: 1; }
.tb-phlab .ph-inset { grid-column: 1; grid-row: 2; }
.tb-phlab .ph-chart { grid-column: 2; grid-row: 1 / 3; }
.tb-phlab svg text { font-family: var(--font-ui); }
.tb-phlab .ph-glass { fill: none; stroke: var(--rule-strong); stroke-width: 1.6; stroke-linejoin: round; }
.tb-phlab .ph-hit { fill: transparent; cursor: pointer; }
.tb-phlab .ph-name { fill: var(--ink); font-weight: 600; }
.tb-phlab .ph-note { fill: var(--ink-faint); }
.tb-phlab .ph-read { font-weight: 700; font-variant-numeric: lining-nums tabular-nums; }
.tb-phlab .ph-axis { fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.tb-phlab .ph-title { fill: var(--ink-soft); font-weight: 600; }
.tb-phlab .ph-eq { fill: var(--ink-soft); }
.tb-phlab .ph-species { fill: var(--ink); font-weight: 600; }
.tb-phlab .ph-amount { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
/* The one warning the bench prints stands inside the glass, over the liquid, so it carries the paper
   with it rather than a bordered chip of its own. */
.tb-phlab .ph-warn { font-weight: 600; stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round;
  paint-order: stroke; }
/* Two groups on one rule: what goes into the beakers, then which beaker the window opens into. */
.tb-phlab .fig-toolbar { justify-content: flex-start; }
.tb-phlab .ph-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-phlab .ph-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
.tb-phlab .ph-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-phlab .ph-short { display: none; }
/* The window carries molecules, so it is given the room to draw two rows of them; the chart and the
   beakers give it up, because at 25fr the counters landed on the equation under them. */
.tb-phlab.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 28fr) minmax(0, 34fr) minmax(0, 38fr); }
.tb-phlab.is-narrow .ph-beakers { grid-column: 1; grid-row: 1; }
.tb-phlab.is-narrow .ph-chart { grid-column: 1; grid-row: 2; }
.tb-phlab.is-narrow .ph-inset { grid-column: 1; grid-row: 3; }
.tb-phlab.is-narrow .ph-long { display: none; }
.tb-phlab.is-narrow .ph-short { display: inline; }
.tb-phlab.is-narrow .fig-toolbar, .tb-phlab.is-narrow .ph-group { gap: 0.3rem; }
.tb-phlab.is-narrow .ph-sep { display: none; }
.tb-phlab.is-narrow .fig-btn { padding: 0.28rem 0.5rem; }
`;

// ---------------------------------------------------------------- drawing helpers

const fmt = (v, dp = 2) => v.toFixed(dp);

// Inter's average advance is about 0.52 em over mixed-case text, which is close enough to choose a size
// that fits a box without a measurement pass per label. Returns 0 when even `min` would overrun.
function fitSize(str, maxWidth, max, min) {
  const size = Math.min(max, maxWidth / (str.length * 0.53));
  return size >= min ? size : 0;
}

// The liquid reads like an indicator: warm towards acid, cool towards alkali, and colourless across a
// band around 7 so that water at 6.81 and plasma at 7.40 both read as "neither", which they are.
function liquidColour(pH) {
  const d = pH - 7;
  const k = clamp((Math.abs(d) - 0.55) / 4.5, 0, 1);
  if (k <= 0) return tint(C.water, 13);
  return tint(d < 0 ? C.coral : C.violet, 15 + k * 48);
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const ns = uid('ph');
  let destroyed = false;
  let narrow = null;
  let padPx = 0;

  // ---- state: the whole figure is a function of these three ----
  let drops = []; // +DROP for a drop of acid, -DROP for a drop of base
  let reagent = 'acid';
  let beaker = 'buffer';
  let curve = [point(0)];

  function point(mmol) {
    return { mmol: round(mmol, 2), water: round(phOf('water', mmol), 2), buffer: round(phOf('buffer', mmol), 2), plasma: round(phOf('plasma', mmol), 2) };
  }
  const mmolAdded = () => curve[curve.length - 1].mmol;

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-phlab' });
  wrap.append(h('style', { text: CSS }));
  const beakerSvg = el('svg', { tabindex: '0', role: 'img', 'aria-label': 'Three beakers: pure water, a bicarbonate buffer and blood plasma, each with its pH. Right arrow adds a drop of the current reagent, left arrow takes one back, Home empties them.' });
  const chartSvg = el('svg', { 'aria-hidden': 'true' });
  const insetSvg = el('svg', { 'aria-hidden': 'true' });
  const beakerPane = h('div', { class: 'ph-pane ph-beakers' }, [beakerSvg]);
  const chartPane = h('div', { class: 'ph-pane ph-chart' }, [chartSvg]);
  const insetPane = h('div', { class: 'ph-pane ph-inset' }, [insetSvg]);

  const twoLabels = (long, short) => [h('span', { class: 'ph-long', text: long }), h('span', { class: 'ph-short', text: short })];
  const button = (long, short, aria, onClick, attrs = {}) => {
    const node = h('button', { class: 'fig-btn', type: 'button', 'aria-label': aria, ...attrs }, twoLabels(long, short));
    node.addEventListener('click', onClick);
    return node;
  };

  // Every accessible name begins with the button's own long label, so it does not change with the stage
  // width and a recipe can find the control by the words on it.
  const btnAcid = button('Add acid', 'Acid', 'Add acid, one drop of strong acid', () => addDrop('acid'), { class: 'fig-btn ph-primary' });
  const btnBase = button('Add base', 'Base', 'Add base, one drop of strong base', () => addDrop('base'));
  const btnReset = button('Reset', 'Reset', 'Reset, empty the beakers and clear the chart', () => reset());
  const beakerBtns = BEAKERS.map((b) => button(`Inside: ${b.short.toLowerCase()}`, b.short, `Inside: ${b.short.toLowerCase()}, show what is in the ${b.name.toLowerCase()} beaker`, () => select(b.id), { 'aria-pressed': String(b.id === beaker) }));
  const live = h('span', { class: 'fig-chip fig-ui', 'aria-live': 'polite', role: 'status' }, twoLabels('', ''));
  const group = (kids) => h('div', { class: 'ph-group' }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnAcid, btnBase, btnReset]),
    h('span', { class: 'ph-sep', 'aria-hidden': 'true' }),
    group(beakerBtns),
  ]);

  wrap.append(beakerPane, chartPane, insetPane, toolbar, live);
  // The live chip only has to reach a screen reader; the beakers carry the numbers on the stage.
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });
  root.append(wrap);

  // ---- reader actions ----
  function addDrop(which) {
    reagent = which;
    if (drops.length >= MAX_DROPS) {
      announce(`the bench holds ${MAX_DROPS} drops and is full; press Reset to start again`);
      return;
    }
    const d = which === 'acid' ? DROP : -DROP;
    drops.push(d);
    curve.push(point(mmolAdded() + d));
    draw();
    announce();
  }
  function undoDrop() {
    if (!drops.length) return;
    drops.pop();
    curve.pop();
    draw();
    announce();
  }
  function reset() {
    drops = [];
    curve = [point(0)];
    draw();
    announce();
  }
  function select(id) {
    beaker = id;
    for (let i = 0; i < BEAKERS.length; i += 1) beakerBtns[i].setAttribute('aria-pressed', String(BEAKERS[i].id === beaker));
    draw();
  }
  function announce(msg) {
    const d = state();
    live.textContent = msg || `${d.dropsAdded} drops, ${d.mmolAdded > 0 ? `${fmt(d.mmolAdded, 1)} mmol/L acid` : d.mmolAdded < 0 ? `${fmt(-d.mmolAdded, 1)} mmol/L base` : 'nothing added'}. Water ${fmt(d.ph.water)}, buffer ${fmt(d.ph.buffer)}, plasma ${fmt(d.ph.plasma)}${d.inRange ? '' : ', plasma outside 7.35 to 7.45'}.`;
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      addDrop(reagent);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      undoDrop();
    } else if (e.key === 'Home') {
      e.preventDefault();
      reset();
    } else if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      addDrop('acid');
    } else if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      addDrop('base');
    }
  };
  beakerSvg.addEventListener('keydown', onKey);

  // ---- derived state, and what describe() reports ----
  function state() {
    const A = mmolAdded();
    const ph = { water: round(phOf('water', A), 2), buffer: round(phOf('buffer', A), 2), plasma: round(phOf('plasma', A), 2) };
    const sp = bufferSpecies(A);
    // Capacity left in the bicarbonate buffer beaker, against the reagent now being poured: bicarbonate
    // is what takes up acid, dissolved CO2 is what supplies hydrogen ions to a base. The base side is
    // the smaller by twenty to one, which is the asymmetry the beaker actually has.
    const remaining = reagent === 'acid' ? sp.hco3 / HCO3_0 : sp.co2 / CO2_0;
    const bufferRemaining = round(clamp(remaining, 0, 1), 3);
    return {
      beaker,
      ph,
      reagent,
      dropsAdded: drops.length,
      mmolAdded: round(A, 2),
      speciesMmol: { co2: round(sp.co2, 3), h2co3: round(sp.h2co3, 4), hco3: round(sp.hco3, 3) },
      bufferRemaining,
      exhausted: bufferRemaining <= 0.1,
      inRange: ph.plasma >= BAND[0] && ph.plasma <= BAND[1],
      curve: curve.map((p) => ({ ...p })),
      tempC: TEMP_C,
      layout: narrow ? 'narrow' : 'wide',
    };
  }

  // ---------------------------------------------------------------- the beakers

  function drawBeakers(w, hgt) {
    beakerSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    beakerSvg.replaceChildren();
    const A = mmolAdded();
    const n = BEAKERS.length;
    const gap = Math.max(6, w * 0.025);
    const cw = (w - gap * (n - 1) - 4) / n;
    // Every size is chosen from the column it has to fit in, and a label that cannot be drawn at its
    // floor is not drawn at all rather than drawn over its neighbour. The name is the exception: a
    // beaker with no name at all is three glasses and three numbers, which is what a tablet got at the
    // widths between the narrow switch and about 780 px, so where the full name cannot fit the short
    // one — Water, Buffer, Plasma — is set instead, and only then nothing.
    const { nameSize, useShort } = beakerNameSize(cw);
    const noteSize = fitSize(BEAKERS[1].note, cw - 4, 10.2, 8.8);
    const readSize = clamp(Math.min(cw * 0.22, hgt * 0.17), 13, 22);
    const showNote = noteSize > 0 && hgt > 112;
    // The glass, its two labels and its reading are one specimen and are set as one: anchored to the
    // foot of the pane, with whatever height is left over showing as a margin ABOVE the names. Anchored
    // the other way the names sat at the top of the pane and the slack opened as a gap between them and
    // the glass, which reads as two blocks that have come apart.
    const headH = (nameSize || 10) + 3 + (showNote ? noteSize + 3 : 0) + 12;
    const bodyBot = hgt - readSize - 9;
    const bh = Math.max(24, bodyBot - headH);

    BEAKERS.forEach((b, i) => {
      const x = 2 + i * (cw + gap);
      const cx = x + cw / 2;
      const pH = phOf(b.id, A);
      const g = el('g');

      // The glass: a straight-sided beaker, wider than it is tall where the column allows, so it reads
      // as a beaker and not a test tube, with the liquid a little below the lip.
      const gw = Math.min(cw * 0.86, bh * 1.15);
      const gh = Math.min(bh, gw * 1.45);
      const gx = cx - gw / 2;
      const gy = bodyBot - gh;
      const noteY = gy - 12;
      const nameY = noteY - (showNote ? noteSize + 3 : 0);
      if (nameSize) g.append(text(cx, nameY, useShort ? b.short : b.name, { anchor: 'middle', class: 'ph-name', 'font-size': fmt(nameSize, 1) }));
      if (showNote) g.append(text(cx, noteY, b.note, { anchor: 'middle', class: 'ph-note', 'font-size': fmt(noteSize, 1) }));
      const r = Math.min(7, gw * 0.12);
      const level = gy + gh * 0.16;
      g.append(el('path', {
        d: `M${fmt(gx, 1)} ${fmt(gy, 1)} L${fmt(gx, 1)} ${fmt(gy + gh - r, 1)} Q${fmt(gx, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + r, 1)} ${fmt(gy + gh, 1)} L${fmt(gx + gw - r, 1)} ${fmt(gy + gh, 1)} Q${fmt(gx + gw, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + gw, 1)} ${fmt(gy + gh - r, 1)} L${fmt(gx + gw, 1)} ${fmt(gy, 1)}`,
        class: 'ph-glass',
      }));
      const clipId = `${ns}-clip-${b.id}`;
      const defs = el('defs', {}, [el('clipPath', { id: clipId }, [el('path', {
        d: `M${fmt(gx, 1)} ${fmt(level, 1)} L${fmt(gx, 1)} ${fmt(gy + gh - r, 1)} Q${fmt(gx, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + r, 1)} ${fmt(gy + gh, 1)} L${fmt(gx + gw - r, 1)} ${fmt(gy + gh, 1)} Q${fmt(gx + gw, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + gw, 1)} ${fmt(gy + gh - r, 1)} L${fmt(gx + gw, 1)} ${fmt(level, 1)} Z`,
      })])]);
      g.append(defs);
      g.append(el('rect', { x: fmt(gx, 1), y: fmt(level, 1), width: fmt(gw, 1), height: fmt(gy + gh - level, 1), fill: liquidColour(pH), 'clip-path': `url(#${clipId})` }));
      g.append(el('line', { x1: fmt(gx, 1), y1: fmt(level, 1), x2: fmt(gx + gw, 1), y2: fmt(level, 1), stroke: b.colour, 'stroke-width': 2 }));

      // The selected beaker is the one the window below opens into: a bracket under it, not colour alone.
      if (b.id === beaker) {
        g.append(el('rect', { x: fmt(gx - 5, 1), y: fmt(gy - 4, 1), width: fmt(gw + 10, 1), height: fmt(gh + 8, 1), rx: 8, fill: 'none', stroke: b.colour, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }));
      }

      // The reading, under the glass and clear of the chart's legend in the pane below. The colour goes
      // on as an inline style: as a fill attribute the class rule beat it, and the three readings all
      // came out the same black while the code asked for three colours.
      g.append(text(cx, hgt - 6, fmt(pH), { anchor: 'middle', class: 'ph-read', 'font-size': fmt(readSize, 1), style: `fill:${b.ink}` }));
      // The plasma beaker says when it has left the band it is supposed to hold. Inside the glass,
      // carrying the paper with it rather than sitting in a bordered chip: the space under the glass
      // belongs to the reading, and at a phone's column width the two would sit on top of each other.
      if (b.id === 'plasma' && !(pH >= BAND[0] && pH <= BAND[1])) {
        const msg = 'outside 7.35–7.45';
        const s = fitSize(msg, gw - 4, 10.4, 8.6);
        if (s) g.append(text(cx, gy + gh - 8, msg, { anchor: 'middle', class: 'ph-warn', 'font-size': fmt(s, 1), style: `fill:${INK.coral}` }));
      }
      const hit = el('rect', { x: fmt(x, 1), y: 0, width: fmt(cw, 1), height: fmt(hgt, 1), class: 'ph-hit' });
      hit.addEventListener('click', () => select(b.id));
      g.append(hit, el('title', { text: `${b.name}: pH ${fmt(pH)}` }));
      beakerSvg.append(g);
    });
    beakerSvg.append(focusMark(w, hgt));
  }

  // ---------------------------------------------------------------- the chart

  function drawChart(w, hgt) {
    chartSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    chartSvg.replaceChildren();
    const tight = w < 300;
    const padL = tight ? 24 : 30;
    const padR = tight ? 8 : 12;
    const padT = 34;
    const padB = 32;
    const pw = Math.max(40, w - padL - padR);
    const phh = Math.max(40, hgt - padT - padB);

    // Domains: wide enough to read from the first drop, and extended by what the reader has poured.
    let lo = 0;
    let hi = 0;
    let yLo = 4;
    let yHi = 10;
    for (const p of curve) {
      lo = Math.min(lo, p.mmol);
      hi = Math.max(hi, p.mmol);
      yLo = Math.min(yLo, Math.floor(Math.min(p.water, p.buffer, p.plasma)));
      yHi = Math.max(yHi, Math.ceil(Math.max(p.water, p.buffer, p.plasma)));
    }
    const step = 5;
    const x0 = Math.min(-2, Math.floor(lo / step) * step);
    const x1 = Math.max(10, Math.ceil(hi / step) * step);
    const X = (m) => padL + ((m - x0) / (x1 - x0)) * pw;
    const Y = (p) => padT + ((yHi - p) / (yHi - yLo)) * phh;

    const plot = el('g');
    plot.append(el('rect', { x: fmt(padL, 1), y: fmt(padT, 1), width: fmt(pw, 1), height: fmt(phh, 1), fill: C.paper, stroke: C.rule }));

    // the blood band, drawn throughout
    const by0 = Y(BAND[1]);
    const by1 = Y(BAND[0]);
    plot.append(el('rect', { x: fmt(padL, 1), y: fmt(by0, 1), width: fmt(pw, 1), height: fmt(Math.max(1.6, by1 - by0), 1), fill: tint(C.leaf, 26) }));
    if (phh > 110) plot.append(text(padL + pw - 4, by0 - 3, 'blood, 7.35–7.45', { anchor: 'end', style: `fill:${INK.leaf}`, 'font-size': 9.8, 'font-weight': 600 }));

    // grid and the pH axis; every other unit when a short plot would crowd the labels
    const yStep = yHi - yLo > 8 || phh < 150 ? 2 : 1;
    for (let p = Math.ceil(yLo / yStep) * yStep; p <= yHi; p += yStep) {
      const y = Y(p);
      plot.append(el('line', { x1: fmt(padL, 1), y1: fmt(y, 1), x2: fmt(padL + pw, 1), y2: fmt(y, 1), stroke: C.rule }));
      plot.append(text(padL - 5, y + 3.4, String(p), { anchor: 'end', class: 'ph-axis', 'font-size': 10 }));
    }
    // the zero line, where nothing has been added yet
    plot.append(el('line', { x1: fmt(X(0), 1), y1: fmt(padT, 1), x2: fmt(X(0), 1), y2: fmt(padT + phh, 1), stroke: C.ruleStrong, 'stroke-dasharray': '3 3' }));
    const xStep = x1 - x0 > 45 ? 20 : x1 - x0 > 22 ? 10 : 5;
    for (let m = Math.ceil(x0 / xStep) * xStep; m <= x1; m += xStep) {
      const x = X(m);
      plot.append(el('line', { x1: fmt(x, 1), y1: fmt(padT + phh, 1), x2: fmt(x, 1), y2: fmt(padT + phh + 4, 1), stroke: C.ruleStrong }));
      plot.append(text(x, padT + phh + 14, String(m), { anchor: 'middle', class: 'ph-axis', 'font-size': 10 }));
    }

    // the three curves
    for (const b of BEAKERS) {
      let d = '';
      for (let i = 0; i < curve.length; i += 1) d += `${i ? 'L' : 'M'}${fmt(X(curve[i].mmol), 1)} ${fmt(Y(curve[i][b.id]), 1)}`;
      plot.append(el('path', { d, fill: 'none', stroke: b.colour, 'stroke-width': b.id === beaker ? 2.8 : 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: b.id === beaker ? 1 : 0.72 }));
      const last = curve[curve.length - 1];
      plot.append(el('circle', { cx: fmt(X(last.mmol), 1), cy: fmt(Y(last[b.id]), 1), r: b.id === beaker ? 4 : 3, fill: b.colour, stroke: C.paper, 'stroke-width': 1.4 }));
    }

    if (curve.length === 1 && phh > 90) {
      plot.append(text(padL + pw / 2, padT + phh / 2, 'add a drop and the three curves start here', { anchor: 'middle', fill: C.faint, 'font-size': 11 }));
    }
    chartSvg.append(plot);
    // The legend always fits; the title yields to it when the pane is too narrow for both.
    if (w > 430) chartSvg.append(text(1, 11, `pH against acid added, ${TEMP_C} °C`, { class: 'ph-title', 'font-size': 11 }));
    chartSvg.append(text(padL + pw - 2, padT + phh + 28, tight ? 'mmol/L H⁺' : 'mmol/L of H⁺ added · negative is OH⁻', { anchor: 'end', fill: C.faint, 'font-size': 9.6 }));

    // A legend on the title line, where no curve ever reaches.
    if (w > 250) {
      const lg = el('g');
      let lx = w - 6;
      for (let i = BEAKERS.length - 1; i >= 0; i -= 1) {
        const b = BEAKERS[i];
        // 0.62 em, not 0.53: these are capitalised words in Inter and at 0.53 the last of them ('Plasma')
        // ran off the right edge of the stage and was cut.
        const tw = b.short.length * 6.2;
        lx -= tw;
        lg.append(text(lx, 11, b.short, { fill: C.soft, 'font-size': 10 }));
        lx -= 17;
        lg.append(el('line', { x1: fmt(lx, 1), y1: 7.6, x2: fmt(lx + 13, 1), y2: 7.6, stroke: b.colour, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
        lx -= 11;
      }
      chartSvg.append(lg);
    }
  }

  // ---------------------------------------------------------------- the magnified window

  // The window shows the populations that matter as two or three labelled fields, so the reader watches
  // one turn into the other rather than counting mixed dots. A drawn molecule stands for TOKEN mmol/L,
  // which the window says out loud, because the true proportions cannot be drawn: at pH 7 there is one
  // loose hydrogen ion per twenty-five million waters.
  function population(A) {
    if (beaker === 'water') {
      const acid = Math.max(0, A);
      const base = Math.max(0, -A);
      const groups = base > acid
        ? [{ kind: 'OH', symbol: 'OH⁻', gloss: 'left loose', mmol: base, empty: 'no base added yet' }]
        : [{ kind: 'H', symbol: 'H⁺', gloss: 'left loose, because nothing takes it up', mmol: acid, empty: 'no acid added yet' }];
      return { groups, arrow: null, note: 'nothing here takes an added H⁺ up, so every drop stays loose' };
    }
    const sp = beaker === 'plasma' ? plasmaSpecies(A) : bufferSpecies(A);
    const groups = [
      { kind: 'HCO3', symbol: 'HCO₃⁻', gloss: 'takes H⁺ up', mmol: sp.hco3, empty: 'spent — none left', spent: true },
      { kind: 'CO2', symbol: 'CO₂ + H₂O', gloss: 'what it becomes', mmol: sp.co2, empty: 'none yet' },
    ];
    if (beaker === 'plasma') {
      // 'none yet', like the field before it: 'none breathed out yet' is a hundred pixels at the
      // smallest size it may be set in, and the third field of a phone's window is ninety wide.
      groups.push({ kind: 'CO2gone', symbol: 'CO₂ ↑', gloss: 'breathed out', mmol: Math.max(0, A), empty: 'none yet' });
      return { groups, arrow: '+ H⁺ →', note: 'the lungs carry the CO₂ away, so the pair is not used up as fast' };
    }
    return { groups, arrow: '+ H⁺ →', note: 'closed: the CO₂ stays, and the bicarbonate runs out' };
  }

  const TOKEN_DRAW = {
    HCO3: { label: 'HCO₃⁻', build: (s) => moleculeHCO3(s, false) },
    H2CO3: { label: 'H₂CO₃', build: (s) => moleculeHCO3(s, true) },
    CO2: { label: 'CO₂', build: (s) => moleculeCO2(s, false) },
    CO2gone: { label: 'CO₂ ↑', build: (s) => moleculeCO2(s, true) },
    H: { label: 'H⁺', build: (s) => moleculeH(s, '+') },
    OH: { label: 'OH⁻', build: (s) => moleculeOH(s) },
  };

  function moleculeHCO3(s, acidForm) {
    const g = el('g');
    const r = 3.4 * s;
    const L = 7.6 * s;
    g.append(bond(0, 0, 0, -L, 2, { width: 1.1 * s }));
    g.append(bond(0, 0, -L * 0.92, L * 0.5, 1, { width: 1.1 * s }));
    g.append(bond(0, 0, L * 0.92, L * 0.5, 1, { width: 1.1 * s }));
    g.append(bond(L * 0.92, L * 0.5, L * 1.7, L * 1.05, 1, { width: 1.1 * s }));
    g.append(atom(0, -L, 'O', r, { label: s > 1.05 }));
    g.append(atom(-L * 0.92, L * 0.5, 'O', r, { label: s > 1.05, charge: acidForm ? null : '−' }));
    g.append(atom(L * 0.92, L * 0.5, 'O', r, { label: s > 1.05 }));
    g.append(atom(L * 1.7, L * 1.05, 'H', r * 0.72, { label: false }));
    if (acidForm) g.append(atom(-L * 1.7, L * 1.05, 'H', r * 0.72, { label: false }));
    g.append(atom(0, 0, 'C', r * 1.08, { label: s > 1.05 }));
    return g;
  }
  function moleculeCO2(s, leaving) {
    const g = el('g');
    const r = 3.4 * s;
    const L = 8 * s;
    g.append(bond(-L, 0, 0, 0, 2, { width: 1.1 * s }));
    g.append(bond(0, 0, L, 0, 2, { width: 1.1 * s }));
    g.append(atom(-L, 0, 'O', r, { label: s > 1.05 }));
    g.append(atom(L, 0, 'O', r, { label: s > 1.05 }));
    g.append(atom(0, 0, 'C', r * 1.08, { label: s > 1.05 }));
    if (leaving) {
      g.setAttribute('opacity', '0.55');
      g.append(el('path', { d: `M0 ${fmt(-r * 2.2, 1)} L0 ${fmt(-r * 4.6, 1)} M${fmt(-r * 0.8, 1)} ${fmt(-r * 3.6, 1)} L0 ${fmt(-r * 4.8, 1)} L${fmt(r * 0.8, 1)} ${fmt(-r * 3.6, 1)}`, stroke: C.faint, 'stroke-width': 1.2 * s, fill: 'none', 'stroke-linecap': 'round' }));
    }
    return g;
  }
  function moleculeH(s, charge) {
    const g = el('g');
    g.append(atom(0, 0, 'H', 4 * s, { charge }));
    return g;
  }
  function moleculeOH(s) {
    const g = el('g');
    const r = 3.6 * s;
    const L = 7.4 * s;
    g.append(bond(0, 0, L, 0, 1, { width: 1.1 * s }));
    g.append(atom(0, 0, 'O', r, { label: s > 1.05, charge: '−' }));
    g.append(atom(L, 0, 'H', r * 0.74, { label: false }));
    return g;
  }

  // THE WINDOW is set as a page, not as a card of cards. It used to be a rounded box holding two more
  // rounded boxes, and when the acid had spent the bicarbonate the left box was an empty rectangle with
  // the word "none" floating in the middle of it, which reads as something broken rather than as the
  // finding it is. Now: a heading over a rule, two or three fields divided by white space and the arrow
  // that already says which way the reaction runs, and the equilibrium on its own line under a rule at
  // the foot with room around it. The molecules are laid out on a regular grid, reading left to right,
  // because their job is to be counted against the figure printed above them.
  // The bench is sized from the beakers down: the three glasses are as big as their column allows, the
  // pane above the window asks for exactly that, and the window takes everything that is left. Sized the
  // other way round — each a fixed share of the stage — the glasses stopped growing at the width of
  // their column and the rest of their pane opened as a gap over their heads, while the window held two
  // rows of molecules in a panel deep enough for six.
  const REF_MMOL = 26; // the largest population the window has to be able to draw: the buffer's total carbon
  const TOKEN_LADDER = [1, 2, 4, 5, 10, 20];

  // The name's size for a column this wide, and whether it is the short name that fits. Shared by the
  // drawing and by the height the beakers ask for, so the two cannot disagree.
  function beakerNameSize(cw) {
    const full = fitSize(BEAKERS[1].name, cw - 4, 12.5, 9.6);
    if (full) return { nameSize: full, useShort: false };
    return { nameSize: fitSize(BEAKERS[2].short, cw - 4, 12.5, 9.6), useShort: true };
  }

  function beakerHeight(w) {
    const n = BEAKERS.length;
    const gap = Math.max(6, w * 0.025);
    const cw = (w - gap * (n - 1) - 4) / n;
    const { nameSize } = beakerNameSize(cw);
    const noteSize = fitSize(BEAKERS[1].note, cw - 4, 10.2, 8.8);
    const readSize = clamp(cw * 0.22, 13, 22);
    return (nameSize || 10) + 3 + (noteSize > 0 ? noteSize + 3 : 0) + 12 + cw * 0.86 * 1.45 + readSize + 9;
  }

  function drawInset(w, hgt) {
    insetSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    insetSvg.replaceChildren();
    const A = mmolAdded();
    const b = BEAKER_BY_ID[beaker];
    const scale = narrow ? 0.85 : 1.3;
    const titleSize = clamp(w * 0.022, 8.8, 9.8);
    const eqSize = clamp(w * 0.026, 10, 11.4);
    const noteSize = 9.8;
    // 32 units, not 30: a drawn bicarbonate spans about 29 at this scale, so at 30 the last counter in a
    // row ran into the '+ H⁺ →' standing in the gap to the next field.
    const cellW = 32 * scale;
    const cellH = 25 * scale;
    const { groups, arrow, note } = population(A);

    const title = `Inside the ${b.name.toLowerCase()}`;
    insetSvg.append(text(0, titleSize, title, { class: 'mol-rt-title', 'font-size': fmt(titleSize, 1) }));
    // What the title leaves of the line: capitals letterspaced a tenth of an em run about 0.74 em each.
    const titleRoom = w - title.length * titleSize * 0.74 - 12;
    const headY = titleSize + 5;
    insetSvg.append(el('line', { x1: 0, y1: fmt(headY, 1), x2: fmt(w, 1), y2: fmt(headY, 1), stroke: C.ruleStrong }));

    // the foot: the equilibrium this window is a picture of, then what this beaker does about it
    const footTop = hgt - (eqSize + noteSize + 12);
    insetSvg.append(el('line', { x1: 0, y1: fmt(footTop, 1), x2: fmt(w, 1), y2: fmt(footTop, 1), stroke: C.rule }));
    const eq = beaker === 'water' ? 'H₂O ⇌ H⁺ + OH⁻' : 'HCO₃⁻ + H⁺ ⇌ H₂CO₃ ⇌ CO₂ + H₂O';
    insetSvg.append(text(0, footTop + eqSize + 6, eq, { class: 'ph-eq', 'font-size': fmt(eqSize, 1) }));
    insetSvg.append(text(0, hgt - 3, note, { class: 'ph-note', 'font-size': noteSize }));

    const fieldTop = headY + 9;
    const fieldBot = footTop - 8;
    // The gap between fields carries the reaction arrow. On a pane wide enough it is one line,
    // '+ H⁺ →', in a gap sized for it; on a tight pane — a phone, or a tablet's narrow column — the
    // gap is 28 px and the arrow is set as two short lines, what is added over the arrow it drives.
    // It was a 10 px gap with the one-line arrow centred on it, so the '→' sat under the first CO₂
    // counter and '24.0 mmol/L' ran straight into 'CO₂ + H₂O' on the heading line above.
    const tight = w <= 330;
    const arrowW = arrow ? (tight ? 28 : clamp(w * 0.12, 44, 60)) : 10;
    const gw = (w - arrowW * (groups.length - 1)) / groups.length;
    const nameSize = clamp(gw * 0.08, 10, 12.4);
    // On a phone the field heading is the species and its figure and nothing else: the gloss under it
    // costs a whole row of counters, and the counters are what a magnified window is for.
    const glossSize = narrow ? 0 : 9.8;
    // The species and its figure share a line where the field is wide enough for both; in the plasma
    // window's three fields it is not, and "CO₂ + H₂O" ran straight into "1.2 mmol/L" at every width.
    // Then the figure takes the line under the species, in every field alike so the counters start on
    // one line across the window. Inter at this weight runs about 0.6 em a character.
    const est = (s, size) => s.length * size * 0.6;
    const twoLine = groups.some((grp) => est(grp.symbol, nameSize) + est(`${grp.mmol.toFixed(1)} mmol/L`, nameSize - 0.6) + 8 > gw);
    const amountDy = twoLine ? nameSize + 1 : 0;
    const top = fieldTop + nameSize + amountDy + glossSize + (narrow ? 6 : 12);
    // The counters have the whole field: the gap beside it is sized for the arrow it carries.
    const usable = gw;
    const cols = Math.max(1, Math.floor(usable / cellW));
    // Never more rows than fit above the foot. Rounded up to one, the single row was drawn straddling
    // the equilibrium line under it on a 390 px phone.
    const rows = Math.max(0, Math.floor((fieldBot - top) / cellH));
    // The scale is chosen from the room this window actually has: the finest of the ladder at which the
    // largest population the beaker can hold still fits the field. So a two-field window counts in twos
    // and a three-field one in fours, each says which it is doing, and neither leaves a field that is
    // three quarters empty because a number chosen for the other one was too coarse.
    const tokenMmol = TOKEN_LADDER.find((t) => Math.ceil(REF_MMOL / t) <= cols * Math.max(1, rows)) ?? 20;

    // The scale, at the right of the title line, in the room the title leaves: the long form where it
    // fits, the short form where only that does, and nothing where neither would — it was measured
    // against half the pane, and at the widths where the title is more than half the pane the two
    // overprinted ("BUFFERe drawn per 10 mmol/L").
    const scaleNotes = [`one drawn per ${tokenMmol} mmol/L`, `1 per ${tokenMmol} mmol/L`];
    const scaleNote = scaleNotes.find((s) => fitSize(s, titleRoom, 9.4, 8.4));
    if (scaleNote) insetSvg.append(text(w, titleSize, scaleNote, { anchor: 'end', class: 'ph-note', 'font-size': 9.4 }));

    groups.forEach((grp, gi) => {
      const gx = gi * (gw + arrowW);
      const g = el('g');
      // The species and how much of it there is: on one line, the way a table sets a label and a figure,
      // or the figure under the species where the line is too short for both.
      g.append(text(gx, fieldTop + nameSize, grp.symbol, { class: 'ph-species', 'font-size': fmt(nameSize, 1) }));
      g.append(text(twoLine ? gx : gx + gw, fieldTop + nameSize + amountDy, `${grp.mmol.toFixed(1)} mmol/L`, { anchor: twoLine ? 'start' : 'end', class: 'ph-amount', 'font-size': fmt(nameSize - 0.6, 1) }));
      if (glossSize) g.append(text(gx, fieldTop + nameSize + amountDy + glossSize + 4, grp.gloss, { class: 'ph-note', 'font-size': fmt(Math.max(8.6, fitSize(grp.gloss, gw, glossSize, 8.6)), 1) }));

      // A population that exists is always drawn at least once: the figure above carries the real
      // number, and 'none' next to 1.2 mmol/L would be a lie about the chemistry rather than about the
      // drawing.
      const n = grp.mmol > 0.05 ? Math.max(1, Math.round(grp.mmol / tokenMmol)) : 0;
      const shown = Math.min(n, cols * rows);
      const stepX = usable / cols;
      // Laid out on the grid, not jittered: these are counters against a stated scale, and a reader who
      // wants to check the figure above has to be able to count them.
      for (let i = 0; i < shown; i += 1) {
        const x = gx + stepX * ((i % cols) + 0.5);
        const y = top + cellH * (Math.floor(i / cols) + 0.5);
        const node = TOKEN_DRAW[grp.kind].build(scale);
        node.setAttribute('transform', `translate(${fmt(x, 1)} ${fmt(y, 1)})`);
        g.append(node);
      }
      if (n > shown) g.append(text(gx + gw, fieldBot, `+ ${n - shown} more`, { anchor: 'end', class: 'ph-note', 'font-size': 9.4 }));
      // An empty field states what the emptiness IS — spent, or not started — where the counters would
      // have begun, rather than the word "none" adrift in the middle of a blank box.
      if (!n) {
        const s = Math.max(9, fitSize(grp.empty, gw, 10.4, 9));
        g.append(text(gx, top + s * 0.4, grp.empty, {
          'font-size': fmt(s, 1), 'font-weight': grp.spent ? 600 : undefined,
          class: grp.spent ? undefined : 'ph-note', style: grp.spent ? `fill:${INK.coral}` : undefined,
        }));
      }
      insetSvg.append(g);
      // The arrow sits with the counters, not with the figures: on the heading line it ran straight into
      // '24.0 mmol/L' on one side and 'CO₂ + H₂O' on the other and the three read as one sentence.
      if (arrow && gi < groups.length - 1) {
        const ax = gx + gw + arrowW / 2;
        const ay = top + cellH * 0.5;
        const arrowText = (str, y, size) => insetSvg.append(text(ax, y, str, { anchor: 'middle', fill: C.soft, 'font-size': size, 'font-weight': 600 }));
        if (!tight) arrowText(gi === 0 ? arrow : '→', ay + 4, 10.6);
        else if (gi === 0) {
          arrowText(arrow.replace(/\s*→$/, ''), ay - 1, 9.6);
          arrowText('→', ay + 10, 9.6);
        } else arrowText('→', ay + 4, 9.6);
      }
    });
  }

  // ---------------------------------------------------------------- layout and drawing

  let ready = false;
  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }

  let beakerPx = 0;
  function draw() {
    // The beakers ask for the height they need and the window takes the rest of the column. Setting the
    // row height does not change the stage, so the ResizeObserver never sees it and there is no loop;
    // the panes are measured again after it is set, which is what forces the new layout.
    if (!narrow) {
      const want = Math.round(beakerHeight(paneBox(beakerPane)[0]));
      if (want !== beakerPx) {
        beakerPx = want;
        wrap.style.setProperty('--ph-beaker-h', `${want}px`);
      }
    }
    const [bw, bh] = paneBox(beakerPane);
    const [cw, ch] = paneBox(chartPane);
    const [iw, ih] = paneBox(insetPane);
    drawBeakers(bw, bh);
    drawChart(cw, ch);
    drawInset(iw, ih);
  }

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
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 20;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--ph-pad', `${pad}px`);
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
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) draw(); });
  onResize();

  return {
    destroy() {
      destroyed = true;
      observer.disconnect();
      beakerSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    // No clock: the bench is a function of the drops added, so pinning time only redraws.
    setTime() {
      if (!destroyed && ready) draw();
    },
    setVisible() {},
    setTheme() {
      if (!destroyed && ready) draw();
    },
    describe() {
      return state();
    },
  };
}
