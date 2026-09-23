// Add acid to water, and to blood. Three beakers on one bench — pure water, a bicarbonate buffer and
// blood plasma — one titration chart they share, and a magnified window into whichever beaker the
// reader has chosen. The reader adds acid or base a drop at a time; the three curves separate at once
// and the buffered ones run flat until their capacity is gone, after which they fall too.
//
// This is the first figure on `src/figures/lib/bench.js`, migrated as the red-proof that the bench can
// carry a real one (docs/design/figure-bench.md, step 2). The bench holds the wrapper, the grid of
// measured panes, the narrow switch, the ResizeObserver and fonts-ready wiring, every control, the live
// region, the clamped primitives and the handle. What is left below is the chemistry, the three
// drawings and the sentences — which is the figure. `tools/figure-diff.js` proved the migration
// byte-identical frame by frame; if you change anything here, run it again.
//
// Two compositions, chosen by the bench from one threshold:
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
// it declares no b.clock() and setTime only redraws. describe() is documented at the bottom of this file.
import { el, C, tint, clamp } from './lib/svg.js';
import { atom, bond, round, INK } from './lib/mol-draw.js';
import { bench } from './lib/bench.js';

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
//
// This figure's own marks, and nothing else. The grid, the panes, the toolbar's groups and divider, the
// primary mark, the two-width labels, the readout register and the narrow tightening are the bench's,
// and live once in src/styles/components.css rather than a twelfth time here.

const NARROW_W = 620;
const NARROW_H = 330;

const CSS = `
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
`;

// ---------------------------------------------------------------- drawing helpers

const fmt = (v, dp = 2) => v.toFixed(dp);

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
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    // One threshold, and the bench refuses a figure that declares it and gives no narrow template.
    narrowBelow: { width: NARROW_W, height: NARROW_H },
  });
  // Inter's advance estimate, the text fitter and the clamped primitives all come from the bench now.
  const fitSize = b.fit;

  // ---- state: the whole figure is a function of these three ----
  let drops = []; // +DROP for a drop of acid, -DROP for a drop of base
  let reagent = 'acid';
  let beaker = 'buffer';
  let curve = [point(0)];

  function point(mmol) {
    return { mmol: round(mmol, 2), water: round(phOf('water', mmol), 2), buffer: round(phOf('buffer', mmol), 2), plasma: round(phOf('plasma', mmol), 2) };
  }
  const mmolAdded = () => curve[curve.length - 1].mmol;

  // ---- panes ----
  const beakers = b.pane('beakers', {
    as: 'svg', focus: true,
    aria: 'Three beakers: pure water, a bicarbonate buffer and blood plasma, each with its pH. Right arrow adds a drop of the current reagent, left arrow takes one back, Home empties them.',
  });
  const chart = b.pane('chart', { as: 'svg' });
  const inset = b.pane('inset', { as: 'svg' });

  // fr, not per cent: 42% + 58% + a column gap is wider than the box, so the chart pane hung over the
  // right edge of the stage and the stage cut the end off the legend and the last tick label.
  // The beaker row's height is --ph-beaker-h, set in draw() from the beakers' own arithmetic below.
  // The window carries molecules, so the narrow composition gives it the room to draw two rows of them;
  // the chart and the beakers give it up, because at 25fr the counters landed on the equation under them.
  b.compose({
    wide: {
      columns: 'minmax(0, 42fr) minmax(0, 58fr)',
      rows: 'var(--ph-beaker-h, 47%) minmax(0, 1fr)',
      at: { beakers: [1, 1], inset: [1, 2], chart: [2, '1 / 3'] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 28fr) minmax(0, 34fr) minmax(0, 38fr)',
      at: { beakers: [1, 1], chart: [1, 2], inset: [1, 3] },
    },
  });

  // ---- controls: two groups on one rule — what goes into the beakers, then which beaker the window
  // opens into. Every accessible name begins with the button's own long label, so it does not change
  // with the stage width and a recipe can find the control by the words on it.
  b.action('Add acid', () => addDrop('acid'), { short: 'Acid', aria: 'Add acid, one drop of strong acid', primary: true });
  b.action('Add base', () => addDrop('base'), { short: 'Base', aria: 'Add base, one drop of strong base' });
  b.action('Reset', () => reset(), { short: 'Reset', aria: 'Reset, empty the beakers and clear the chart' });
  b.divide();
  const pick = b.choice('Beaker', BEAKERS.map((k) => ({
    id: k.id,
    label: `Inside: ${k.short.toLowerCase()}`,
    short: k.short,
    aria: `Inside: ${k.short.toLowerCase()}, show what is in the ${k.name.toLowerCase()} beaker`,
  })), (id) => {
    beaker = id;
    draw();
  }, { value: beaker });

  b.keys({
    ArrowRight: () => addDrop(reagent),
    ArrowUp: () => addDrop(reagent),
    ArrowLeft: undoDrop,
    ArrowDown: undoDrop,
    Home: reset,
    a: () => addDrop('acid'),
    A: () => addDrop('acid'),
    b: () => addDrop('base'),
    B: () => addDrop('base'),
  });

  // ---- reader actions ----
  function addDrop(which) {
    reagent = which;
    if (drops.length >= MAX_DROPS) {
      b.announce(`the bench holds ${MAX_DROPS} drops and is full; press Reset to start again`);
      return;
    }
    const d = which === 'acid' ? DROP : -DROP;
    drops.push(d);
    curve.push(point(mmolAdded() + d));
    draw();
    b.announce();
  }
  function undoDrop() {
    if (!drops.length) return;
    drops.pop();
    curve.pop();
    draw();
    b.announce();
  }
  function reset() {
    drops = [];
    curve = [point(0)];
    draw();
    b.announce();
  }

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
    };
  }

  b.onDescribe(state);
  b.onAnnounce((d) => `${d.dropsAdded} drops, ${d.mmolAdded > 0 ? `${fmt(d.mmolAdded, 1)} mmol/L acid` : d.mmolAdded < 0 ? `${fmt(-d.mmolAdded, 1)} mmol/L base` : 'nothing added'}. Water ${fmt(d.ph.water)}, buffer ${fmt(d.ph.buffer)}, plasma ${fmt(d.ph.plasma)}${d.inRange ? '' : ', plasma outside 7.35 to 7.45'}.`);

  // ---------------------------------------------------------------- the beakers

  function drawBeakers() {
    const { w, h: hgt } = beakers.clear().box;
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

    BEAKERS.forEach((k, i) => {
      const x = 2 + i * (cw + gap);
      const cx = x + cw / 2;
      const pH = phOf(k.id, A);
      const g = beakers.group();

      // The glass: a straight-sided beaker, wider than it is tall where the column allows, so it reads
      // as a beaker and not a test tube, with the liquid a little below the lip.
      const gw = Math.min(cw * 0.86, bh * 1.15);
      const gh = Math.min(bh, gw * 1.45);
      const gx = cx - gw / 2;
      const gy = bodyBot - gh;
      const noteY = gy - 12;
      const nameY = noteY - (showNote ? noteSize + 3 : 0);
      if (nameSize) beakers.text(cx, nameY, useShort ? k.short : k.name, { anchor: 'middle', class: 'ph-name', 'font-size': fmt(nameSize, 1), parent: g });
      if (showNote) beakers.text(cx, noteY, k.note, { anchor: 'middle', class: 'ph-note', 'font-size': fmt(noteSize, 1), parent: g });
      const r = Math.min(7, gw * 0.12);
      const level = gy + gh * 0.16;
      beakers.path(
        `M${fmt(gx, 1)} ${fmt(gy, 1)} L${fmt(gx, 1)} ${fmt(gy + gh - r, 1)} Q${fmt(gx, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + r, 1)} ${fmt(gy + gh, 1)} L${fmt(gx + gw - r, 1)} ${fmt(gy + gh, 1)} Q${fmt(gx + gw, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + gw, 1)} ${fmt(gy + gh - r, 1)} L${fmt(gx + gw, 1)} ${fmt(gy, 1)}`,
        { class: 'ph-glass' }, g,
      );
      const clipId = b.uid(`clip-${k.id}`);
      g.append(el('defs', {}, [el('clipPath', { id: clipId }, [el('path', {
        d: `M${fmt(gx, 1)} ${fmt(level, 1)} L${fmt(gx, 1)} ${fmt(gy + gh - r, 1)} Q${fmt(gx, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + r, 1)} ${fmt(gy + gh, 1)} L${fmt(gx + gw - r, 1)} ${fmt(gy + gh, 1)} Q${fmt(gx + gw, 1)} ${fmt(gy + gh, 1)} ${fmt(gx + gw, 1)} ${fmt(gy + gh - r, 1)} L${fmt(gx + gw, 1)} ${fmt(level, 1)} Z`,
      })])]));
      beakers.rect(fmt(gx, 1), fmt(level, 1), fmt(gw, 1), fmt(gy + gh - level, 1), { fill: liquidColour(pH), 'clip-path': `url(#${clipId})` }, g);
      beakers.line(fmt(gx, 1), fmt(level, 1), fmt(gx + gw, 1), fmt(level, 1), { stroke: k.colour, 'stroke-width': 2 }, g);

      // The selected beaker is the one the window below opens into: a bracket under it, not colour alone.
      if (k.id === beaker) {
        beakers.rect(fmt(gx - 5, 1), fmt(gy - 4, 1), fmt(gw + 10, 1), fmt(gh + 8, 1), { rx: 8, fill: 'none', stroke: k.colour, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
      }

      // The reading, under the glass and clear of the chart's legend in the pane below. The colour goes
      // on as an inline style: as a fill attribute the class rule beat it, and the three readings all
      // came out the same black while the code asked for three colours.
      beakers.text(cx, hgt - 6, fmt(pH), { anchor: 'middle', class: 'ph-read', 'font-size': fmt(readSize, 1), style: `fill:${k.ink}`, parent: g });
      // The plasma beaker says when it has left the band it is supposed to hold. Inside the glass,
      // carrying the paper with it rather than sitting in a bordered chip: the space under the glass
      // belongs to the reading, and at a phone's column width the two would sit on top of each other.
      if (k.id === 'plasma' && !(pH >= BAND[0] && pH <= BAND[1])) {
        const msg = 'outside 7.35–7.45';
        const s = fitSize(msg, gw - 4, 10.4, 8.6);
        if (s) beakers.text(cx, gy + gh - 8, msg, { anchor: 'middle', class: 'ph-warn', 'font-size': fmt(s, 1), style: `fill:${INK.coral}`, parent: g });
      }
      const hit = beakers.rect(fmt(x, 1), 0, fmt(cw, 1), fmt(hgt, 1), { class: 'ph-hit' }, g);
      hit.addEventListener('click', () => pick.set(k.id));
      g.append(el('title', { text: `${k.name}: pH ${fmt(pH)}` }));
    });
    beakers.focusMark();
  }

  // ---------------------------------------------------------------- the chart

  function drawChart() {
    const { w, h: hgt } = chart.clear().box;
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
    chart.rect(fmt(padL, 1), fmt(padT, 1), fmt(pw, 1), fmt(phh, 1), { fill: C.paper, stroke: C.rule }, plot);

    // the blood band, drawn throughout
    const by0 = Y(BAND[1]);
    const by1 = Y(BAND[0]);
    chart.rect(fmt(padL, 1), fmt(by0, 1), fmt(pw, 1), fmt(Math.max(1.6, by1 - by0), 1), { fill: tint(C.leaf, 26) }, plot);
    if (phh > 110) chart.text(padL + pw - 4, by0 - 3, 'blood, 7.35–7.45', { anchor: 'end', style: `fill:${INK.leaf}`, 'font-size': 9.8, 'font-weight': 600, parent: plot });

    // grid and the pH axis; every other unit when a short plot would crowd the labels
    const yStep = yHi - yLo > 8 || phh < 150 ? 2 : 1;
    for (let p = Math.ceil(yLo / yStep) * yStep; p <= yHi; p += yStep) {
      const y = Y(p);
      chart.line(fmt(padL, 1), fmt(y, 1), fmt(padL + pw, 1), fmt(y, 1), { stroke: C.rule }, plot);
      chart.text(padL - 5, y + 3.4, String(p), { anchor: 'end', class: 'ph-axis', 'font-size': 10, parent: plot });
    }
    // the zero line, where nothing has been added yet
    chart.line(fmt(X(0), 1), fmt(padT, 1), fmt(X(0), 1), fmt(padT + phh, 1), { stroke: C.ruleStrong, 'stroke-dasharray': '3 3' }, plot);
    const xStep = x1 - x0 > 45 ? 20 : x1 - x0 > 22 ? 10 : 5;
    for (let m = Math.ceil(x0 / xStep) * xStep; m <= x1; m += xStep) {
      const x = X(m);
      chart.line(fmt(x, 1), fmt(padT + phh, 1), fmt(x, 1), fmt(padT + phh + 4, 1), { stroke: C.ruleStrong }, plot);
      chart.text(x, padT + phh + 14, String(m), { anchor: 'middle', class: 'ph-axis', 'font-size': 10, parent: plot });
    }

    // the three curves
    for (const k of BEAKERS) {
      let d = '';
      for (let i = 0; i < curve.length; i += 1) d += `${i ? 'L' : 'M'}${fmt(X(curve[i].mmol), 1)} ${fmt(Y(curve[i][k.id]), 1)}`;
      chart.path(d, { fill: 'none', stroke: k.colour, 'stroke-width': k.id === beaker ? 2.8 : 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: k.id === beaker ? 1 : 0.72 }, plot);
      const last = curve[curve.length - 1];
      chart.circle(fmt(X(last.mmol), 1), fmt(Y(last[k.id]), 1), k.id === beaker ? 4 : 3, { fill: k.colour, stroke: C.paper, 'stroke-width': 1.4 }, plot);
    }

    if (curve.length === 1 && phh > 90) {
      // C.soft and not C.faint: this line is the only type inside the plot, and the plot is banded, so it
      // is the one label here whose ground is not the paper. Measured 2026-09-17: 4.46:1 in the light
      // theme with 29% of its pixels on a band, against 6.0:1 for the soft ink on the same band. The axis
      // labels outside the plot keep C.faint, because nothing is painted under them.
      chart.text(padL + pw / 2, padT + phh / 2, 'add a drop and the three curves start here', { anchor: 'middle', fill: C.soft, 'font-size': 11, parent: plot });
    }
    chart.add(plot);
    // The legend always fits; the title yields to it when the pane is too narrow for both.
    if (w > 430) chart.text(1, 11, `pH against acid added, ${TEMP_C} °C`, { class: 'ph-title', 'font-size': 11 });
    chart.text(padL + pw - 2, padT + phh + 28, tight ? 'mmol/L H⁺' : 'mmol/L of H⁺ added · negative is OH⁻', { anchor: 'end', fill: C.faint, 'font-size': 9.6 });

    // A legend on the title line, where no curve ever reaches.
    if (w > 250) {
      const lg = el('g');
      let lx = w - 6;
      for (let i = BEAKERS.length - 1; i >= 0; i -= 1) {
        const k = BEAKERS[i];
        // 0.62 em, not 0.53: these are capitalised words in Inter and at 0.53 the last of them ('Plasma')
        // ran off the right edge of the stage and was cut.
        const tw = k.short.length * 6.2;
        lx -= tw;
        chart.text(lx, 11, k.short, { fill: C.soft, 'font-size': 10, parent: lg });
        lx -= 17;
        chart.line(fmt(lx, 1), 7.6, fmt(lx + 13, 1), 7.6, { stroke: k.colour, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, lg);
        lx -= 11;
      }
      chart.add(lg);
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

  // This is the figure's own arithmetic about its own drawing, and no bench should try to absorb it: it
  // asks the beakers how tall they need to be so the window below can have the rest. It looks like
  // layout and it is a statement about what a beaker is.
  function beakerHeight(w) {
    const n = BEAKERS.length;
    const gap = Math.max(6, w * 0.025);
    const cw = (w - gap * (n - 1) - 4) / n;
    const { nameSize } = beakerNameSize(cw);
    const noteSize = fitSize(BEAKERS[1].note, cw - 4, 10.2, 8.8);
    const readSize = clamp(cw * 0.22, 13, 22);
    return (nameSize || 10) + 3 + (noteSize > 0 ? noteSize + 3 : 0) + 12 + cw * 0.86 * 1.45 + readSize + 9;
  }

  function drawInset() {
    const { w, h: hgt } = inset.clear().box;
    const A = mmolAdded();
    const k = BEAKER_BY_ID[beaker];
    const scale = b.narrow ? 0.85 : 1.3;
    const titleSize = clamp(w * 0.022, 8.8, 9.8);
    const eqSize = clamp(w * 0.026, 10, 11.4);
    const noteSize = 9.8;
    // 32 units, not 30: a drawn bicarbonate spans about 29 at this scale, so at 30 the last counter in a
    // row ran into the '+ H⁺ →' standing in the gap to the next field.
    const cellW = 32 * scale;
    const cellH = 25 * scale;
    const { groups, arrow, note } = population(A);

    const title = `Inside the ${k.name.toLowerCase()}`;
    inset.text(0, titleSize, title, { class: 'tb-rt-title', 'font-size': fmt(titleSize, 1) });
    // What the title leaves of the line: capitals letterspaced a tenth of an em run about 0.74 em each.
    const titleRoom = w - title.length * titleSize * 0.74 - 12;
    const headY = titleSize + 5;
    inset.line(0, fmt(headY, 1), fmt(w, 1), fmt(headY, 1), { stroke: C.ruleStrong });

    // the foot: the equilibrium this window is a picture of, then what this beaker does about it
    const footTop = hgt - (eqSize + noteSize + 12);
    inset.line(0, fmt(footTop, 1), fmt(w, 1), fmt(footTop, 1), { stroke: C.rule });
    const eq = beaker === 'water' ? 'H₂O ⇌ H⁺ + OH⁻' : 'HCO₃⁻ + H⁺ ⇌ H₂CO₃ ⇌ CO₂ + H₂O';
    inset.text(0, footTop + eqSize + 6, eq, { class: 'ph-eq', 'font-size': fmt(eqSize, 1) });
    inset.text(0, hgt - 3, note, { class: 'ph-note', 'font-size': noteSize });

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
    const glossSize = b.narrow ? 0 : 9.8;
    // The species and its figure share a line where the field is wide enough for both; in the plasma
    // window's three fields it is not, and "CO₂ + H₂O" ran straight into "1.2 mmol/L" at every width.
    // Then the figure takes the line under the species, in every field alike so the counters start on
    // one line across the window. Inter at this weight runs about 0.6 em a character.
    const est = (s, size) => s.length * size * 0.6;
    const twoLine = groups.some((grp) => est(grp.symbol, nameSize) + est(`${grp.mmol.toFixed(1)} mmol/L`, nameSize - 0.6) + 8 > gw);
    const amountDy = twoLine ? nameSize + 1 : 0;
    const top = fieldTop + nameSize + amountDy + glossSize + (b.narrow ? 6 : 12);
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
    if (scaleNote) inset.text(w, titleSize, scaleNote, { anchor: 'end', class: 'ph-note', 'font-size': 9.4 });

    groups.forEach((grp, gi) => {
      const gx = gi * (gw + arrowW);
      const g = inset.group();
      // The species and how much of it there is: on one line, the way a table sets a label and a figure,
      // or the figure under the species where the line is too short for both.
      inset.text(gx, fieldTop + nameSize, grp.symbol, { class: 'ph-species', 'font-size': fmt(nameSize, 1), parent: g });
      inset.text(twoLine ? gx : gx + gw, fieldTop + nameSize + amountDy, `${grp.mmol.toFixed(1)} mmol/L`, { anchor: twoLine ? 'start' : 'end', class: 'ph-amount', 'font-size': fmt(nameSize - 0.6, 1), parent: g });
      if (glossSize) inset.text(gx, fieldTop + nameSize + amountDy + glossSize + 4, grp.gloss, { class: 'ph-note', 'font-size': fmt(Math.max(8.6, fitSize(grp.gloss, gw, glossSize, 8.6)), 1), parent: g });

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
      if (n > shown) inset.text(gx + gw, fieldBot, `+ ${n - shown} more`, { anchor: 'end', class: 'ph-note', 'font-size': 9.4, parent: g });
      // An empty field states what the emptiness IS — spent, or not started — where the counters would
      // have begun, rather than the word "none" adrift in the middle of a blank box.
      if (!n) {
        const s = Math.max(9, fitSize(grp.empty, gw, 10.4, 9));
        inset.text(gx, top + s * 0.4, grp.empty, {
          'font-size': fmt(s, 1), 'font-weight': grp.spent ? 600 : undefined,
          class: grp.spent ? undefined : 'ph-note', style: grp.spent ? `fill:${INK.coral}` : undefined,
          parent: g,
        });
      }
      // The arrow sits with the counters, not with the figures: on the heading line it ran straight into
      // '24.0 mmol/L' on one side and 'CO₂ + H₂O' on the other and the three read as one sentence.
      if (arrow && gi < groups.length - 1) {
        const ax = gx + gw + arrowW / 2;
        const ay = top + cellH * 0.5;
        const arrowText = (str, y, size) => inset.text(ax, y, str, { anchor: 'middle', fill: C.soft, 'font-size': size, 'font-weight': 600 });
        if (!tight) arrowText(gi === 0 ? arrow : '→', ay + 4, 10.6);
        else if (gi === 0) {
          arrowText(arrow.replace(/\s*→$/, ''), ay - 1, 9.6);
          arrowText('→', ay + 10, 9.6);
        } else arrowText('→', ay + 4, 9.6);
      }
    });
  }

  // ---------------------------------------------------------------- drawing

  let beakerPx = 0;
  function draw() {
    b.redraw();
  }

  b.onDraw(() => {
    // The beakers ask for the height they need and the window takes the rest of the column. Setting the
    // row height does not change the stage, so the ResizeObserver never sees it and there is no loop;
    // the panes are measured again after it is set, which is what forces the new layout.
    if (!b.narrow) {
      const want = Math.round(beakerHeight(beakers.box.w));
      if (want !== beakerPx) {
        beakerPx = want;
        b.setVar('--ph-beaker-h', `${want}px`);
        b.remeasure();
      }
    }
    drawBeakers();
    drawChart();
    drawInset();
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   beaker            which beaker the magnified window is open on
  //   ph                the three readings, to 2 dp
  //   reagent           'acid' or 'base' — what the arrow keys will pour next
  //   dropsAdded        how many drops are in, of either kind
  //   mmolAdded         net mmol/L of H+ added; negative means base
  //   speciesMmol       the closed buffer's CO2, H2CO3 and HCO3- populations
  //   bufferRemaining   0 to 1, capacity left against the reagent now being poured
  //   exhausted         true at or below a tenth of that capacity
  //   inRange           whether plasma is still inside 7.35 to 7.45
  //   curve             every point plotted, so a task can check the shape and not just the end
  //   tempC             37, because the neutral point below 7 is the chapter's own margin note
  return b.handle();
}
