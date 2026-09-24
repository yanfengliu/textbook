// One site, two gases, four steps of arithmetic. A single rubisco active site holds its five-carbon
// acceptor while carbon dioxide and oxygen jostle in the solution above it; each turn the site takes one
// of them, and the two outcomes leave by different roads — a carboxylation as two three-carbon molecules
// to the Calvin cycle, an oxygenation as one three-carbon molecule to the cycle and one two-carbon
// molecule to the salvage. Beside it, §6.7's four-step table, recomputed on every change, with the step
// the reader's last control entered marked. A second scene follows the two-carbon molecule through the
// three organelles of the salvage and keeps the ledger. It is a mechanism because the reader moves three
// sliders and watches which LINE of the arithmetic each one moves, and because the Archaean setting
// turns the mistake off without touching the enzyme.
//
// THE ARITHMETIC, §6.7's own four steps. O is the air's oxygen and Ca its carbon dioxide, both in ppm.
//   1  In the air                   O : Ca                        21 % against 420 ppm is 500 : 1
//   2  Dissolved                    (O : Ca) / S(T)               S(25 °C) = 25, so 20 : 1
//   3  After rubisco's preference   P(T) / step 2                  P(25 °C) = 100, so 5 : 1 for CO₂
//   4  Inside a working leaf        step 3 × Ci / Ca              Ci/Ca = 0.6 half open, so 3 : 1
// S(T) is how much more soluble carbon dioxide is than oxygen. It falls as water warms, with a slope of
// 700 K in 1/T: the difference between the two gases' Henry's-law temperature coefficients, 2400 K for
// carbon dioxide and 1700 K for oxygen (Sander, Atmos. Chem. Phys. 15:4399, 2015). From 25 to 35 °C it
// goes from 25 to 23.2, "carbon dioxide becomes less soluble in it faster than oxygen does" (§6.8).
// P(T) is the enzyme's own preference, the specificity factor with the solubility taken out. Its slope,
// 3850 K, is Bernacchi et al.'s temperature response of the compensation point (Plant Cell Environ.
// 24:253, 2001; 37.83 kJ/mol) less the solubility's 5.8 kJ/mol, so the two terms together reproduce the
// measured whole-leaf response and neither is double-counted. From 25 to 35 °C it falls from 100 to 66.
// Ci is the leaf's internal carbon dioxide: Γ + (Ca − Γ) × open / (open + 0.4), where Γ is the
// compensation point, the Ci at which a carboxylation's carbon is exactly undone by the salvage of two
// oxygenations (step 4 = ½). It is 42 ppm at 25 °C, which is what leaves measure. The 0.4 puts Ci at 60 %
// of the air's with the pore half open, which is §6.7's "well below the air's"; wide open it is 74 %.
// The pore runs from 5 % because a fully shut pore in Archaean air, where Γ is zero, would leave the
// site with nothing to take, and a control that ends in a site with no substrate is not a lesson.
//
// NET CARBON GAIN, as the brief defines it: against the same leaf with no oxygenation at all, so the
// same number of turns all of them carboxylations. A carboxylation fixes one carbon; an oxygenation fixes
// none and the salvage then releases half a carbon (one in four from each pair of glycolates, §6.7). So
// per turn, with r carboxylations per oxygenation, the gain is (r − ½)/(r + 1): 62.5 % at r = 3, and 0 at
// the compensation point. It is also Farquhar's light-limited ratio (Ci − Γ)/(Ci + 2Γ) at the same Ci.
// §6.7's "a fifth to a third" is a whole day's cost, cooler hours included; this is the midday rate.
//
// THE TURNS. The site runs at rubisco's top speed, three turns a second (§6.7: "about three carbon
// dioxides a second when it is saturated"), so what the reader watches is the real pace. Each turn is a
// draw from the seeded generator with the odds step 4 gives, steered gently back towards the expected
// count (a running debt, weight 0.3) so that the counted ratio settles within a few dozen turns rather
// than a few hundred; the order stays random. The count starts again whenever the odds change, so it is
// always a test of the table as it now stands. With no oxygen in the air the odds of an oxygenation are
// zero and no draw can make one: `oxygenations` stays at 0 for as long as `era` is 'archaean'.
//
// THE ABUNDANCE. A site turns three times a second and no faster, so a leaf's rate is how much rubisco it
// has built times that (§6.7, reading §5.6's definition of a maximum rate). "Carbon fixed, whole leaf" is
// that product against a typical leaf — 40 % of its protein as rubisco, today's air, 25 °C, the pore half
// open — so a reader who takes the compensation away watches the leaf's carbon go with it.
//
// THE SALVAGE, §6.7's route, counted for two glycolates because the mitochondrion's step takes two:
// in the chloroplast the phosphate comes off; in the peroxisome the glycolate hands hydrogen to oxygen,
// making peroxide that a catalase destroys, and picks up a nitrogen; in the mitochondrion two become one
// three-carbon molecule, releasing one carbon as carbon dioxide and one nitrogen as ammonia; back through
// the peroxisome the nitrogen is handed on; back in the chloroplast one ATP makes 3-phosphoglycerate and
// a second recaptures the ammonia (with reducing power as well). Four carbons in, three back, one lost,
// two ATP.
//
// Two compositions. Wide: the site on the left, the table on the right. Narrow, below an 800 px stage:
// the site across the top and the four rows under it with the moved row marked, the three condition
// sliders becoming steppers on one row. The salvage route stays a horizontal run at both widths — the
// narrow route pane is wider than it is tall (about 340 × 240), and stacking three organelles in 240 px
// would give each about 70. `workingRatio`, `netGainPercent` and the four rows keep their labels at both.
//
// describe() is documented at the foot of this file.
import { C, clamp, lerp, easeInOut, smooth, tint, el, h } from './lib/svg.js';
import { bench } from './lib/bench.js';
import { element } from './lib/mol-draw.js';
import { hash2 } from './lib/chem-atoms.js';
import { metabolismPart, ORGANELLE_BY_ID } from '../palette.js';
import { organelle } from './lib/cell3-colours.js';

export const meta = { kind: 'rubisco-fork', title: 'One site, two gases, four steps of arithmetic', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 };

// ---------------------------------------------------------------- the model

const KELVIN = 273.15;
const T_REF = 298.15;
const O2_TODAY = 21; // % of the air
const CO2_TODAY = 420; // ppm, §6.7's 0.042 %
// "A great deal of carbon dioxide and essentially no free oxygen" (§6.7). 10 000 ppm is about 25 times
// today's and sits inside the palaeosol estimates for the late Archaean (roughly 10 to 50 times the
// pre-industrial 280 ppm); the figure's claim does not rest on it, because with no oxygen the site has
// nothing to confuse at any carbon dioxide at all.
const CO2_ARCHAEAN = 10000;
const SOLUBILITY_25 = 25; // carbon dioxide against oxygen, §6.7's "roughly 25 times more soluble"
const SOLUBILITY_SLOPE = 700; // K, see the header
const PREFERENCE_25 = 100; // §6.7's "about a hundredfold"
const PREFERENCE_SLOPE = 3850; // K, see the header
const PORE_HALF = 0.4; // the pore's supply against the site's demand; Ci/Ca = 0.6 half open
const TURNOVER = 3; // per second, saturated
const TYPICAL_SHARE = 40; // % of leaf protein, inside §6.7's "a third to a half"
const DEBT_WEIGHT = 0.3;

// The air's carbon dioxide, on rungs a reader can name: pre-industrial 280, today's 420, and on up to the
// Archaean's 10 000. Roughly logarithmic, which is how the table responds to it.
const CO2_RUNGS = [100, 120, 140, 160, 180, 200, 230, 250, 280, 310, 350, 380, 420, 460, 500, 560, 630, 700, 800, 900, 1000, 1200, 1400, 1700, 2000, 2500, 3000, 4000, 5000, 6500, 8000, 10000];
const rungOf = (ppm) => {
  let best = 0;
  CO2_RUNGS.forEach((v, i) => { if (Math.abs(v - ppm) < Math.abs(CO2_RUNGS[best] - ppm)) best = i; });
  return best;
};

const OPEN = { co2: CO2_TODAY, o2: O2_TODAY, tempC: 25, pore: 50, share: TYPICAL_SHARE };

export function odds({ co2, o2, tempC, pore }) {
  const T = tempC + KELVIN;
  const sol = SOLUBILITY_25 * Math.exp(SOLUBILITY_SLOPE * (1 / T - 1 / T_REF));
  const pref = PREFERENCE_25 * Math.exp(PREFERENCE_SLOPE * (1 / T - 1 / T_REF));
  const o2ppm = o2 * 1e4;
  const open = pore / 100;
  const airRatio = o2ppm / co2;
  const dissolvedRatio = airRatio / sol;
  const hasO2 = o2ppm > 0;
  const siteRatio = hasO2 ? pref / dissolvedRatio : Infinity;
  const gamma = hasO2 ? Math.min(co2, (0.5 * o2ppm) / (pref * sol)) : 0;
  const ci = gamma + (co2 - gamma) * (open / (open + PORE_HALF));
  const working = hasO2 ? (pref * sol * ci) / o2ppm : Infinity;
  const insideRatio = hasO2 ? o2ppm / (sol * ci) : 0; // oxygen to carbon dioxide, dissolved round the site
  const netGain = hasO2 ? (100 * (working - 0.5)) / (working + 1) : 100;
  return { sol, pref, airRatio, dissolvedRatio, siteRatio, gamma, ci, ciShare: ci / co2, working, insideRatio, netGain, hasO2 };
}

const TYPICAL_NET = odds({ co2: CO2_TODAY, o2: O2_TODAY, tempC: 25, pore: 50 }).netGain;

// ---------------------------------------------------------------- words and numbers

const THIN = ' ';
const grouped = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
function ratioText(x) {
  if (!Number.isFinite(x)) return '—';
  if (x >= 1000) return grouped(x);
  if (x >= 100) return String(Math.round(x));
  if (x >= 1) return x.toFixed(1);
  return x.toFixed(2);
}
const ppmText = (v) => grouped(v);
const pct1 = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));

// The four rows' labels, the same at both widths, because an item's goal quotes them.
const ROW = ['In the air', 'Dissolved', 'After rubisco’s preference', 'Inside a working leaf'];
const rowLabel = (i, tempC) => (i === 1 ? `Dissolved, at ${tempC} °C` : ROW[i]);

// The salvage's five stops, in order, and what happens at each. `id` is what describe() reports.
const STOPS = [
  { id: 'chloroplast', place: 'chloroplast', say: 'In the chloroplast the phosphate is taken off 2-phosphoglycolate, leaving glycolate.' },
  { id: 'peroxisome', place: 'peroxisome', say: 'In the peroxisome the glycolate hands hydrogen straight to oxygen and makes peroxide, which a catalase destroys at once; it picks up a nitrogen.' },
  { id: 'mitochondrion', place: 'mitochondrion', say: 'In the mitochondrion two of the two-carbon molecules become one three-carbon one: a carbon leaves as carbon dioxide, a nitrogen as ammonia.' },
  { id: 'peroxisome-back', place: 'peroxisome', say: 'Back through the peroxisome, the three-carbon molecule hands its nitrogen on.' },
  { id: 'chloroplast-back', place: 'chloroplast', say: 'Back in the chloroplast one ATP makes it 3-phosphoglycerate for the cycle, and a second, with reducing power, recaptures the ammonia.' },
];
const DWELL = 1.6; // s at each stop while running
const LEG = 1.4; // s between stops
const SALVAGE_END = (STOPS.length - 1) * (DWELL + LEG) + DWELL;

// What the followed molecule is, as carbons, whether it still carries its phosphate, and its nitrogen.
const CARGO = [
  { carbons: 2, phosphate: true, nitrogen: false, name: '2-phosphoglycolate' },
  { carbons: 2, phosphate: false, nitrogen: false, name: 'glycolate' },
  { carbons: 2, phosphate: false, nitrogen: true, name: 'glycine' },
  { carbons: 3, phosphate: false, nitrogen: true, name: 'serine' },
  { carbons: 3, phosphate: false, nitrogen: false, name: 'glycerate' },
  { carbons: 3, phosphate: true, nitrogen: false, name: '3-phosphoglycerate' },
];

// ---------------------------------------------------------------- style

const NARROW_W = 800;

const CSS = `
.tb-rubisco-fork .rf-num { font-variant-numeric: lining-nums tabular-nums; }
.tb-rubisco-fork .rf-cap { letter-spacing: 0.09em; text-transform: uppercase; font-weight: 600; }
.tb-rubisco-fork .rf-lane { fill: none; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.tb-rubisco-fork .rf-route { fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
`;

// A subscript is a smaller figure on a lowered baseline, as the prose's <sub> is: 0.7 of the size and a
// fifth of the parent's size down (src/styles/typography.css and .tb-equation). The strings in this file
// carry the Unicode subscript digits for convenience, and every <text> a pane holds is rewritten into
// tspans after it is drawn, so no subscript glyph from a fallback face ever reaches the page.
const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
const SUB_RUN = /([₀-₉]+)/;
function setSubscripts(svg) {
  for (const t of svg.querySelectorAll('text')) {
    const s = t.textContent;
    if (!SUB_RUN.test(s)) continue;
    const fs = parseFloat(t.getAttribute('font-size')) || 10;
    const drop = +(fs * 0.2).toFixed(2);
    t.textContent = '';
    let low = false;
    for (const part of s.split(SUB_RUN)) {
      if (!part) continue;
      const isSub = SUB_RUN.test(part);
      const span = el('tspan', {
        text: isSub ? [...part].map((c) => SUB_DIGITS.indexOf(c)).join('') : part,
        'font-size': isSub ? +(fs * 0.7).toFixed(2) : null,
        dy: isSub && !low ? drop : !isSub && low ? -drop : null,
      });
      low = isSub;
      t.append(span);
    }
  }
}

// ---------------------------------------------------------------- geometry helpers

// A dense polyline through points (Catmull-Rom, the same curve svg.js's smooth() draws), walked by
// length, so a product travels a lane at an even speed and stops exactly at its end.
function spline(points, perSeg = 14) {
  const n = points.length;
  const at = (i) => points[clamp(i, 0, n - 1)];
  const out = [points[0]];
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 1; k <= perSeg; k += 1) {
      const t = k / perSeg;
      const u = 1 - t;
      out.push([
        u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
        u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
      ]);
    }
  }
  const len = [0];
  for (let i = 1; i < out.length; i += 1) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, len, total: len[len.length - 1] };
}
function along(path, s) {
  const d = clamp(s, 0, 1) * path.total;
  let i = 1;
  while (i < path.len.length - 1 && path.len[i] < d) i += 1;
  const a = path.pts[i - 1];
  const bpt = path.pts[i];
  const seg = path.len[i] - path.len[i - 1] || 1;
  const f = (d - path.len[i - 1]) / seg;
  return [lerp(a[0], bpt[0], f), lerp(a[1], bpt[1], f), Math.atan2(bpt[1] - a[1], bpt[0] - a[0])];
}
const dOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
// The length along a path of the sample nearest a point: where a stop sits on the salvage route.
function sAt(path, x, y) {
  let best = 0;
  let bestD = Infinity;
  path.pts.forEach((p, i) => {
    const d = Math.hypot(p[0] - x, p[1] - y);
    if (d < bestD) { bestD = d; best = i; }
  });
  return path.len[best] / path.total;
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W },
    seed: 604,
  });

  const ENZYME = metabolismPart('enzyme');
  const ATP = metabolismPart('atp');
  const CHLORO = organelle('chloroplast');
  const THYLAKOID = organelle('thylakoid');
  const PEROX = ORGANELLE_BY_ID.peroxisome;
  const MITO = ORGANELLE_BY_ID.mitochondrion;

  // ---- state ----
  let scene = 'site';
  let airCo2 = OPEN.co2;
  let airO2 = OPEN.o2;
  let tempC = OPEN.tempC;
  let pore = OPEN.pore;
  let share = OPEN.share;
  let moved = []; // which of the four steps the last condition change entered at
  let carboxylations = 0;
  let oxygenations = 0;
  let debt = 0;
  let turns = []; // recent turns: { t0, gas, still }
  let tau = 0; // seconds the model has run since the last reset
  let nextTurnAt = 0;
  let salvageStarted = false;
  let salvageTau = 0;
  let syncing = false;

  const era = () => (airO2 > 0 ? 'today' : 'archaean');
  const model = () => odds({ co2: airCo2, o2: airO2, tempC, pore });

  // ---- panes ----
  const site = b.pane('site', {
    as: 'svg',
    focus: true,
    aria: 'One rubisco active site holding its five-carbon acceptor, with oxygen and carbon dioxide dissolved above it and two roads out: to the Calvin cycle and to the salvage. Space runs or pauses the turns, Enter takes one turn or the next step of the salvage, E switches between today’s air and the Archaean’s, S switches between the site and the salvage, and Home resets.',
  });
  const table = b.pane('table', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 58fr) minmax(0, 42fr)',
      rows: 'minmax(0, 1fr)',
      at: { site: [1, 1], table: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 62fr) minmax(0, 38fr)',
      at: { site: [1, 1], table: [1, 2] },
    },
  });

  // ---- controls: the three conditions and the leaf, the past, the clock, and what to show ----
  //
  // At a phone's width the four become steppers in two rows of two. The brief asked for the three
  // conditions on one row; measured at a 342 px stage they need 379 px (125, 108 and 136 with their gaps)
  // against a 304 px toolbar line, so two rows is the honest packing, and the fourth fills the second.
  const co2Ctl = b.stepper('Carbon dioxide', {
    min: 0, max: CO2_RUNGS.length - 1, step: 1, value: rungOf(OPEN.co2), short: 'CO₂',
    format: (i, o) => `${ppmText(CO2_RUNGS[clamp(Math.round(i), 0, CO2_RUNGS.length - 1)])}${o.narrow ? '' : ' ppm'}`,
    onInput: (i) => { if (syncing) return; airCo2 = CO2_RUNGS[i]; conditionsChanged([0]); },
  });
  const tempCtl = b.stepper('Temperature', {
    min: 10, max: 40, step: 1, value: OPEN.tempC, short: 'T',
    format: (v, o) => (o.narrow ? `${v}°` : `${v} °C`),
    onInput: (v) => { if (syncing) return; tempC = v; conditionsChanged([1, 2]); },
  });
  const poreCtl = b.stepper('Pore', {
    min: 5, max: 100, step: 5, value: OPEN.pore,
    format: (v, o) => (o.narrow ? `${v} %` : `${v} % open`),
    onInput: (v) => { if (syncing) return; pore = v; conditionsChanged([3]); },
  });
  const shareCtl = b.stepper('Rubisco', {
    min: 5, max: 60, step: 5, value: OPEN.share,
    format: (v, o) => (o.narrow ? `${v} %` : `${v} % of protein`),
    onInput: (v) => { if (syncing) return; share = v; afterChange(); },
  });
  b.divide();
  const archaeanCtl = b.toggle('Archaean air', (on) => setEra(on ? 'archaean' : 'today'), {
    short: 'Archaean',
    aria: 'Archaean air, no free oxygen and far more carbon dioxide',
  });
  b.divide();
  const turnBtn = b.action('Take a turn', () => takeTurn(), { short: 'Turn', aria: 'Take a turn, let the site take one gas' });
  const stepBtn = b.action('Next step', () => nextStep(), { short: 'Step', aria: 'Next step, move the two-carbon molecule on' });
  const runCtl = b.run({ aria: 'Run, turn at rubisco’s own speed', onChange: (on) => onRun(on) });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the figure back as it opened' });
  b.divide();
  const sceneCtl = b.choice('Scene', [
    { id: 'site', label: 'Active site', short: 'Site' },
    { id: 'salvage', label: 'Salvage route', short: 'Salvage' },
  ], (id) => setScene(id), { segmented: true });

  // CO₂ as the prose sets it, with a real subscript: the short label is a formula, and the accessible name
  // stays the words.
  co2Ctl.node.querySelector('.tb-short')?.replaceChildren('CO', h('sub', { text: '2' }));

  b.keys({
    ' ': () => runCtl.toggle(),
    Enter: () => (scene === 'site' ? takeTurn() : nextStep()),
    e: () => archaeanCtl.toggle(),
    E: () => archaeanCtl.toggle(),
    s: () => sceneCtl.next(),
    S: () => sceneCtl.next(),
    Home: () => resetAll(),
  });

  const siteOnly = [co2Ctl.node, tempCtl.node, poreCtl.node, shareCtl.node, archaeanCtl.node, turnBtn];
  function applySceneControls() {
    for (const n of siteOnly) n.style.display = scene === 'site' ? '' : 'none';
    stepBtn.style.display = scene === 'salvage' ? '' : 'none';
  }
  applySceneControls();

  // ---- reader actions ----
  function afterChange() {
    b.redraw();
    b.announce();
  }

  // A new set of odds: the count starts again, so it is always a test of the table as it stands.
  function conditionsChanged(steps) {
    moved = steps;
    carboxylations = 0;
    oxygenations = 0;
    debt = 0;
    turns = [];
    nextTurnAt = tau;
    afterChange();
  }

  function syncControls() {
    syncing = true;
    co2Ctl.set(rungOf(airCo2));
    tempCtl.set(tempC);
    poreCtl.set(pore);
    shareCtl.set(share);
    syncing = false;
  }

  function setEra(which) {
    if (which === 'archaean') {
      airO2 = 0;
      airCo2 = CO2_ARCHAEAN;
    } else {
      airO2 = O2_TODAY;
      airCo2 = CO2_TODAY;
    }
    if (archaeanCtl.on !== (which === 'archaean')) archaeanCtl.set(which === 'archaean', { quiet: true });
    syncControls();
    conditionsChanged([0]);
  }

  function setScene(id) {
    if (scene === id) return;
    if (b.playing) runCtl.set(false);
    scene = id;
    if (scene === 'salvage' && !salvageStarted) {
      salvageStarted = true;
      salvageTau = 0;
    }
    applySceneControls();
    afterChange();
  }

  function onRun(on) {
    if (on) {
      if (scene === 'site') {
        turns = turns.filter((t) => !t.still);
        nextTurnAt = tau;
      } else if (salvageTau >= SALVAGE_END - 1e-6) {
        salvageTau = 0;
      }
    }
    b.redraw();
    b.announce();
  }

  // One turn: the site takes one gas. The odds are step 4's; the debt keeps the count honest to them.
  function oneTurn(t0, still) {
    const m = model();
    const q = m.hasO2 ? 1 / (m.working + 1) : 0;
    const p = q > 0 ? clamp(q + DEBT_WEIGHT * debt, 0, 1) : 0;
    const gas = b.random() < p ? 'O2' : 'CO2';
    debt += q - (gas === 'O2' ? 1 : 0);
    if (gas === 'O2') oxygenations += 1;
    else carboxylations += 1;
    turns.push({ t0, gas, still });
    if (turns.length > 8) turns.shift();
  }

  function takeTurn() {
    if (scene !== 'site') return;
    if (b.playing) runCtl.set(false);
    turns = turns.filter((t) => !t.still);
    oneTurn(tau, true);
    afterChange();
  }

  function nextStep() {
    if (scene !== 'salvage') return;
    if (b.playing) runCtl.set(false);
    const k = salvageStop(salvageTau).stop;
    salvageTau = k >= STOPS.length - 1 ? 0 : (k + 1) * (DWELL + LEG);
    afterChange();
  }

  function resetAll() {
    if (b.playing) runCtl.set(false);
    b.restart(); // which calls restartModel()
    b.announce();
  }

  function restartModel() {
    airCo2 = OPEN.co2;
    airO2 = OPEN.o2;
    tempC = OPEN.tempC;
    pore = OPEN.pore;
    share = OPEN.share;
    moved = [];
    carboxylations = 0;
    oxygenations = 0;
    debt = 0;
    turns = [];
    tau = 0;
    nextTurnAt = 0;
    salvageStarted = false;
    salvageTau = 0;
    scene = 'site';
    sceneCtl.set('site', { quiet: true });
    archaeanCtl.set(false, { quiet: true });
    applySceneControls();
    syncControls();
  }

  function salvageStop(t) {
    const period = DWELL + LEG;
    const k = Math.min(STOPS.length - 1, Math.floor(t / period + 1e-9));
    const within = t - k * period;
    if (k === STOPS.length - 1 || within < DWELL) return { stop: k, moving: false, legU: 0 };
    return { stop: k, moving: true, legU: (within - DWELL) / LEG };
  }

  // ---- the clock ----
  const TURN_PERIOD = 1 / TURNOVER;
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    running: () => b.playing,
    advance: (dt) => {
      if (!b.playing) return;
      tau += dt;
      if (scene === 'site') {
        while (tau + 1e-9 >= nextTurnAt) {
          oneTurn(nextTurnAt, false);
          nextTurnAt += TURN_PERIOD;
        }
      } else {
        salvageTau = Math.min(SALVAGE_END, salvageTau + dt);
        if (salvageTau >= SALVAGE_END - 1e-9) runCtl.set(false);
      }
    },
  });

  // ---- what describe() reports ----
  function ledger() {
    const k = salvageStarted ? salvageStop(salvageTau).stop : -1;
    return {
      stop: k,
      carbonLost: k >= 2 ? 1 : 0,
      carbonRecovered: k >= 4 ? 3 : 0,
      nitrogenReleased: k >= 2 ? 1 : 0,
      atpSpent: k >= 4 ? 2 : 0,
    };
  }

  function state() {
    const m = model();
    const l = ledger();
    return {
      scene,
      era: era(),
      airCo2Ppm: airCo2,
      airO2Percent: airO2,
      temperatureC: tempC,
      stomaOpen: pore / 100,
      internalCo2Ppm: Number(m.ci.toFixed(1)),
      airRatio: Number(m.airRatio.toFixed(2)),
      dissolvedRatio: Number(m.dissolvedRatio.toFixed(3)),
      preference: Number(m.pref.toFixed(2)),
      workingRatio: Number.isFinite(m.working) ? Number(m.working.toFixed(3)) : Infinity,
      carboxylations,
      oxygenations,
      turnoverPerSecond: TURNOVER,
      rubiscoFractionOfProtein: share / 100,
      salvageStep: l.stop >= 0 ? STOPS[l.stop].id : null,
      carbonRecovered: l.carbonRecovered,
      carbonLost: l.carbonLost,
      atpSpentOnSalvage: l.atpSpent,
      netGainPercent: Number(m.netGain.toFixed(1)),
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  const leafRate = (m) => (share / TYPICAL_SHARE) * (m.netGain / TYPICAL_NET) * 100;

  function countSentence() {
    const n = carboxylations + oxygenations;
    if (!n) return 'No turns taken yet.';
    const c = `${carboxylations} carboxylation${carboxylations === 1 ? '' : 's'}`;
    const o = `${oxygenations} oxygenation${oxygenations === 1 ? '' : 's'}`;
    return `${c} and ${o} since the odds last changed.`;
  }
  b.onAnnounce(() => {
    const m = model();
    if (scene === 'salvage') {
      const l = ledger();
      const stop = STOPS[Math.max(0, l.stop)];
      return `${stop.say} Carbon recovered ${l.carbonRecovered} of 4, carbon lost ${l.carbonLost}, ATP spent ${l.atpSpent}.`;
    }
    if (!m.hasO2) {
      return `Archaean air, with no free oxygen and ${ppmText(airCo2)} parts per million of carbon dioxide: every turn is a carboxylation. ${countSentence()}`;
    }
    return `In the air oxygen outnumbers carbon dioxide ${ratioText(m.airRatio)} to 1, and ${ratioText(m.dissolvedRatio)} to 1 dissolved at ${tempC} degrees. Rubisco’s preference makes that ${ratioText(m.siteRatio)} carboxylations for each oxygenation, and ${ratioText(m.working)} inside a working leaf with the pore ${pore} per cent open. Net carbon gain ${pct1(m.netGain)} per cent. ${countSentence()}`;
  });

  // ---------------------------------------------------------------- drawing the atoms

  // One atom, coloured from the one element table with its symbol written on it.
  function atom(pane, x, y, sym, r, parent) {
    const e = element(sym);
    pane.circle(x, y, r, { fill: e.fill, stroke: e.stroke, 'stroke-width': +(r * 0.14).toFixed(2) }, parent);
    if (r >= 4.4) {
      const fs = r * 1.28;
      pane.text(x, y + fs * 0.35, e.symbol, { anchor: 'middle', fill: e.label, 'font-size': +fs.toFixed(2), 'font-weight': 600, parent });
    }
  }

  // A gas molecule: O₂ is two oxygens, CO₂ an oxygen either side of a carbon. Space-filling, so the
  // atoms touch and no bond is drawn; the symbols stay clear of the overlap at 1.6 r.
  function gas(pane, x, y, kind, r, theta, parent) {
    const dx = Math.cos(theta) * r * 1.6;
    const dy = Math.sin(theta) * r * 1.6;
    if (kind === 'O2') {
      atom(pane, x - dx / 2, y - dy / 2, 'O', r, parent);
      atom(pane, x + dx / 2, y + dy / 2, 'O', r, parent);
    } else {
      atom(pane, x - dx, y - dy, 'O', r, parent);
      atom(pane, x + dx, y + dy, 'O', r, parent);
      atom(pane, x, y, 'C', r, parent);
    }
  }

  // A chain of atoms, left to right, each bonded to the next: the acceptor is P C C C C C P,
  // 3-phosphoglycerate C C C P and 2-phosphoglycolate P C C. `ring` marks one atom — the carbon that came
  // from the air — with a dotted circle.
  function molecule(pane, x, y, syms, r, { ring = -1, parent } = {}) {
    const sp = r * 1.72;
    const x0 = x - ((syms.length - 1) * sp) / 2;
    for (let i = 1; i < syms.length; i += 1) {
      pane.line(x0 + (i - 1) * sp + r * 0.9, y, x0 + i * sp - r * 0.9, y, { stroke: C.soft, 'stroke-width': 1.2 }, parent);
    }
    syms.forEach((s, i) => atom(pane, x0 + i * sp, y, s, r, parent));
    if (ring >= 0) pane.circle(x0 + ring * sp, y, r + 2.2, { fill: 'none', stroke: C.ink, 'stroke-width': 1.1, 'stroke-dasharray': '2 2' }, parent);
  }
  const chainLength = (n, r) => (n - 1) * r * 1.72 + 2 * r;
  const ACCEPTOR = ['P', 'C', 'C', 'C', 'C', 'C', 'P'];
  const PGA_RIGHT = ['C', 'C', 'C', 'P'];
  const PGA_LEFT = ['P', 'C', 'C', 'C'];
  const GLYCOLATE_P = ['P', 'C', 'C'];

  // ---------------------------------------------------------------- the site

  function siteLayout(w, hgt) {
    const r = clamp(Math.min(w * 0.0135, hgt * 0.021), 4.6, 7.6);
    const rr = r * 1.04;
    const sp = rr * 1.72;
    const capH = clamp(hgt * 0.08, 18, 28);
    const chainL = 6 * sp + 2 * rr;
    const pw = chainL + rr * 2.4;
    const pd = rr * 4.3;
    const cx = w / 2;
    const y0 = Math.round(capH + (hgt - capH) * (hgt < 260 ? 0.53 : 0.46));
    const bodyW = Math.min(w * 0.52, Math.max(pw + rr * 9, w * 0.44));
    const floorY = y0 + pd;
    const rubY = floorY - rr * 1.3;
    const gasY = rubY - rr * 1.75; // a gas held on the acceptor's second carbon
    const laneY = y0 - rr * 2.5; // the road out, over the lips
    const bandTop = capH + 2;
    const bandBottom = y0 - rr * 5;
    const bodyBottom = hgt - 3;
    const colW = (w - bodyW) / 2 - 10;
    const c2x = cx - sp; // the acceptor's second carbon, where a gas attacks
    return { r, rr, sp, capH, chainL, pw, pd, cx, y0, bodyW, floorY, rubY, gasY, laneY, bandTop, bandBottom, bodyBottom, colW, c2x };
  }

  // The tallies' type, bottom up from the pane's foot, so the products parked above them never meet them.
  function endType(w, hgt) {
    const small = w < 420;
    const numSize = small ? 15 : 21;
    const wordSize = small ? 9.4 : 10.6;
    const whereSize = small ? 8.6 : 9.6;
    const yWhere = hgt - 4;
    const yWord = yWhere - whereSize * 1.45;
    const yNum = yWord - wordSize * 1.3;
    return { small, numSize, wordSize, whereSize, yWhere, yWord, yNum, top: yNum - numSize * 0.78 };
  }

  // The enzyme: a globular body with a cleft at its crown, drawn through points and smoothed. The cleft is
  // where the site is, so it is deep enough to hold the acceptor below the rim and the gas above it.
  function enzymeShape(G) {
    const { cx, y0, pw, bodyW, bodyBottom, rr, floorY } = G;
    const lip = rr * 3;
    const H = bodyBottom - y0;
    const at = (x, y) => [+x.toFixed(1), +y.toFixed(1)];
    const pocket = [
      at(cx - pw / 2 + rr * 0.1, y0 + rr * 0.9),
      at(cx - pw / 2 + rr * 0.5, floorY - rr * 1.2),
      at(cx - pw / 2 + rr * 2.2, floorY),
      at(cx + pw / 2 - rr * 2.2, floorY),
      at(cx + pw / 2 - rr * 0.5, floorY - rr * 1.2),
      at(cx + pw / 2 - rr * 0.1, y0 + rr * 0.9),
    ];
    const outline = [
      at(cx - pw / 2 - lip * 1.7, y0 + rr * 2.2),
      at(cx - pw / 2 - lip * 0.55, y0),
      ...pocket,
      at(cx + pw / 2 + lip * 0.55, y0),
      at(cx + pw / 2 + lip * 1.7, y0 + rr * 2.2),
      at(cx + bodyW / 2 - rr * 0.6, y0 + H * 0.22),
      at(cx + bodyW / 2, y0 + H * 0.5),
      at(cx + bodyW * 0.45, y0 + H * 0.8),
      at(cx + bodyW * 0.27, bodyBottom),
      at(cx - bodyW * 0.05, bodyBottom - rr * 0.3),
      at(cx - bodyW * 0.3, bodyBottom),
      at(cx - bodyW * 0.46, y0 + H * 0.78),
      at(cx - bodyW / 2, y0 + H * 0.48),
      at(cx - bodyW / 2 + rr * 0.6, y0 + H * 0.2),
    ];
    // The cleft's own floor, closed across its mouth: shaded, so the acceptor reads as lying IN the
    // enzyme and not on it.
    const mouth = [at(cx - pw / 2 - lip * 0.2, y0 + rr * 0.3), ...pocket, at(cx + pw / 2 + lip * 0.2, y0 + rr * 0.3)];
    return { body: smooth(outline, { closed: true, tension: 6 }), cleft: smooth(mouth, { closed: true, tension: 6 }) };
  }

  // The roads a product leaves by: up out of the pocket, over the lip, and down the enzyme's flank to the
  // paper where the road is named. A carboxylation's two products travel the right road as a pair, one
  // above the other, so "two three-carbon molecules" is what the reader sees go.
  function lanes(G, w, hgt) {
    const { cx, rubY, laneY, bodyW, rr, sp } = G;
    const E = endType(w, hgt);
    const endY = E.top - rr * 3.4;
    const xR = cx + bodyW / 2 + (w - (cx + bodyW / 2)) * 0.5;
    const xL = cx - bodyW / 2 - (cx - bodyW / 2) * 0.5;
    const leftStart = cx - 2 * sp; // the middle of P C C, the acceptor's left end
    const rightStart = cx + 1.5 * sp; // the middle of C C C P, its right end
    const edgeR = cx + bodyW / 2 + rr * 1.6;
    const edgeL = cx - bodyW / 2 - rr * 1.6;
    const right = spline([[rightStart, rubY], [rightStart + sp * 0.6, laneY], [edgeR, laneY + rr * 1.2], [xR, endY]]);
    const left = spline([[leftStart, rubY], [leftStart - sp * 0.6, laneY], [edgeL, laneY + rr * 1.2], [xL, endY]]);
    return { right, left, endY, xR, xL, leftStart, rightStart };
  }

  // The solution: a staggered grid of molecules, each bobbing and turning inside its own cell so no two
  // ever touch (cell 5.3 r + 3 against a molecule 5.2 r long and a drift of a quarter r). Which cells hold
  // carbon dioxide is decided by rank, so the count follows the dissolved ratio exactly as it moves.
  function solution(G, w, m) {
    const { r, bandTop, bandBottom, cx, c2x } = G;
    const s = r * 5.3 + 3;
    const rows = Math.max(1, Math.floor((bandBottom - bandTop) / s));
    const cols = Math.max(2, Math.floor(w / s));
    const padX = (w - cols * s) / 2;
    const padY = (bandBottom - bandTop - rows * s) / 2;
    const cells = [];
    for (let j = 0; j < rows; j += 1) {
      const stagger = j % 2 ? s / 2 : 0;
      const n = j % 2 ? cols - 1 : cols;
      for (let i = 0; i < n; i += 1) {
        const x = padX + stagger + s * (i + 0.5);
        const y = bandTop + padY + s * (j + 0.5);
        // Keep clear the column a gas drops through into the pocket.
        if (j === rows - 1 && Math.abs(x - c2x) < s * 0.75) continue;
        cells.push({ x, y, k: j * 64 + i });
      }
    }
    // Rank: the first cell to turn carbon dioxide is the one nearest a point up and right of the pocket,
    // so the lone molecule of the opening state is where the eye already is; the rest by a fixed hash.
    const focusX = cx + s * 1.5;
    const focusY = bandTop + (bandBottom - bandTop) * 0.55;
    const ranked = cells.map((c) => ({ ...c, rank: hash2(c.k, 17) })).sort((a, bb) => a.rank - bb.rank);
    let lead = 0;
    ranked.forEach((c, i) => {
      if (Math.hypot(c.x - focusX, c.y - focusY) < Math.hypot(ranked[lead].x - focusX, ranked[lead].y - focusY)) lead = i;
    });
    ranked.unshift(ranked.splice(lead, 1)[0]);
    const n = ranked.length;
    const fCo2 = m.hasO2 ? 1 / (1 + m.insideRatio) : 1;
    let co2 = Math.round(n * fCo2);
    if (fCo2 > 0) co2 = Math.max(1, co2);
    if (fCo2 < 1) co2 = Math.min(n - 1, co2);
    ranked.forEach((c, i) => { c.kind = i < co2 ? 'CO2' : 'O2'; });
    return { cells: ranked, s, co2, n };
  }

  function drawSolution(G, w, m) {
    const { r } = G;
    const sol = solution(G, w, m);
    const drift = r * 0.25;
    for (const c of sol.cells) {
      const a = hash2(c.k, 3) * Math.PI * 2;
      const bb = hash2(c.k, 5) * Math.PI * 2;
      const spin = (hash2(c.k, 7) - 0.5) * 1.6;
      const x = c.x + drift * Math.sin(tau * (0.9 + hash2(c.k, 11)) + a);
      const y = c.y + drift * Math.cos(tau * (0.8 + hash2(c.k, 13)) + bb);
      const theta = hash2(c.k, 19) * Math.PI + tau * spin;
      gas(site, x, y, c.kind, r, theta);
    }
    return sol;
  }

  function drawSite() {
    const { w, h: hgt } = site.clear().box;
    const m = model();
    const G = siteLayout(w, hgt);
    const L = lanes(G, w, hgt);
    const { r, rr, sp, cx, capH, rubY, gasY, chainL } = G;
    const small = w < 420;

    // The caption: what the site is sitting in, as a ratio. The drawing below can only approximate it.
    const capSize = small ? 9.4 : 10.6;
    const cap = m.hasO2
      ? `Dissolved round the site: ${m.insideRatio >= 10 ? Math.round(m.insideRatio) : ratioText(m.insideRatio)} O₂ for each CO₂`
      : `Dissolved round the site: CO₂ alone, no free oxygen`;
    site.text(4, capH - 8, cap, { class: 'rf-num', fill: C.soft, 'font-size': capSize, fit: [capSize, 8.2], width: w - 8 });

    drawSolution(G, w, m);

    // The two roads, drawn under everything that travels on them.
    const road = (path, colour, dash) => site.path(dOf(path.pts), { class: 'rf-lane', stroke: colour, 'stroke-dasharray': dash || null, opacity: 0.9 });
    road(L.left, m.hasO2 ? C.coralText : C.ruleStrong, m.hasO2 ? '1 4' : '1 5');
    road(L.right, C.soft, '1 4');
    arrowHead(L.left, m.hasO2 ? C.coralText : C.ruleStrong);
    arrowHead(L.right, C.soft);

    // The enzyme, and the acceptor in its pocket.
    const shape = enzymeShape(G);
    site.path(shape.body, { fill: ENZYME.color, stroke: ENZYME.symbolColor, 'stroke-width': 1, 'stroke-opacity': 0.35 });
    // The cleft is the enzyme's own surface in shadow: its fill, darkened by its own symbol colour, which
    // is fixed, so the recess reads the same on both papers.
    site.path(shape.cleft, { fill: ENZYME.color, stroke: 'none' });
    site.path(shape.cleft, { fill: ENZYME.symbolColor, 'fill-opacity': 0.16, stroke: 'none' });

    // Which turns are in flight, and where. A turn's gas drops in over the first tenth of a second, joins
    // the acceptor, and the two halves leave; the pocket is empty for a moment and then refilled.
    const ARRIVE = 0.1;
    const JOIN = 0.16;
    const REFILL = 0.3;
    const FLY = 0.92;
    let acceptorShown = 1;
    for (const t of turns) {
      if (t.still) continue;
      const u = tau - t.t0;
      if (u >= ARRIVE && u < REFILL) acceptorShown = Math.min(acceptorShown, u < JOIN + 0.04 ? 0 : (u - JOIN - 0.04) / (REFILL - JOIN - 0.04));
    }
    const held = (kind, parent) => {
      // A gas on the acceptor's second carbon, bonded to it: the moment the enzyme has hold of both.
      site.line(G.c2x, rubY - rr * 0.9, G.c2x, gasY + r * 0.9, { stroke: C.soft, 'stroke-width': 1.2 }, parent);
      gas(site, G.c2x, gasY, kind, r, 0, parent);
    };
    if (acceptorShown > 0) {
      const g = site.group({ opacity: +acceptorShown.toFixed(3) });
      molecule(site, cx, rubY, ACCEPTOR, rr, { parent: g });
    }

    const last = turns[turns.length - 1];
    const pr = rr * 0.92; // a product's atoms
    const pair = rr * 1.25; // half the gap between the two products of a carboxylation
    for (const t of turns) {
      if (t.still && t !== last) continue;
      const u = t.still ? FLY + 1 : tau - t.t0;
      if (!t.still && u >= FLY) continue;
      if (!t.still && u < ARRIVE) {
        const p = easeInOut(u / ARRIVE);
        const g = site.group({ opacity: +clamp(u / 0.03, 0, 1).toFixed(3) });
        gas(site, G.c2x, lerp(G.bandBottom + r, gasY, p), t.gas, r, 0, g);
        continue;
      }
      if (!t.still && u < JOIN) {
        molecule(site, cx, rubY, ACCEPTOR, rr);
        held(t.gas);
        continue;
      }
      // The two halves leave. The right half is always 3-phosphoglycerate, always to the cycle. The left
      // half is where the fork is: after a carboxylation it carries the new carbon and is a second
      // 3-phosphoglycerate, beside the first; after an oxygenation it is 2-phosphoglycolate, to the
      // salvage. Over the first stretch each half closes on its place in the formation it travels in.
      const s = t.still ? 1 : easeInOut(clamp((u - JOIN) / (FLY - JOIN), 0, 1));
      const fade = t.still ? 1 : 1 - clamp((s - 0.86) / 0.14, 0, 1);
      const g = site.group({ opacity: +fade.toFixed(3) });
      const gather = clamp(s / 0.18, 0, 1);
      const carb = t.gas === 'CO2';
      const [rx, ry] = along(L.right, s);
      molecule(site, rx, ry + (carb ? pair * gather : 0), PGA_RIGHT, pr, { parent: g });
      if (carb) {
        molecule(site, lerp(L.leftStart, rx, gather), lerp(rubY, ry - pair, gather), PGA_LEFT, pr, { ring: 3, parent: g });
      } else {
        const [lx, ly] = along(L.left, s);
        molecule(site, lx, ly, GLYCOLATE_P, pr, { parent: g });
      }
    }

    // Words on the enzyme are in its own symbol colour, which is fixed and clears 4.5:1 on its fill in
    // both themes; the page's ink would invert on a dark page and vanish.
    const note = small ? 8.6 : 10;
    const nameSize = small ? 10.4 : 13;
    const acceptor = small ? 'RuBP, the acceptor' : 'RuBP, the five-carbon acceptor';
    site.text(cx, G.floorY + note * 1.6, acceptor, { anchor: 'middle', fill: ENZYME.symbolColor, 'font-size': note, fit: [note, 7.4], width: G.pw + rr * 3 });
    const bodyMidY = G.floorY + note * 1.6 + (G.bodyBottom - G.floorY - note * 1.6) * 0.46;
    site.text(cx, bodyMidY, 'rubisco', { anchor: 'middle', class: 'rf-cap', fill: ENZYME.symbolColor, 'font-size': nameSize });
    let lastLine = null;
    if (last && last.still) lastLine = last.gas === 'CO2' ? 'last turn took CO₂' : 'last turn took O₂';
    else if (carboxylations + oxygenations && small) lastLine = countedLine(true);
    if (lastLine) site.text(cx, bodyMidY + note * 1.9, lastLine, { anchor: 'middle', class: 'rf-num', fill: ENZYME.symbolColor, 'font-size': note, 'font-weight': 600, fit: [note, 7.4], width: G.bodyW * 0.7 });

    drawRoadEnds(G, L, w, hgt, m);
    site.focusMark();
  }

  function arrowHead(path, colour) {
    const n = path.pts.length;
    const [x, y] = path.pts[n - 1];
    const [px, py] = path.pts[n - 3];
    const a = Math.atan2(y - py, x - px);
    const s = 5.5;
    const p1 = [x - s * Math.cos(a - 0.45), y - s * Math.sin(a - 0.45)];
    const p2 = [x - s * Math.cos(a + 0.45), y - s * Math.sin(a + 0.45)];
    site.path(`M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`, { class: 'rf-lane', stroke: colour });
  }

  function countedLine(short) {
    if (!oxygenations) return short ? `counted ${carboxylations} : 0` : `${carboxylations} : 0`;
    const r = carboxylations / oxygenations;
    return short ? `counted ${ratioText(r)} : 1` : `${carboxylations} : ${oxygenations}, or ${ratioText(r)} : 1`;
  }

  // Each road's name and its tally, in the paper either side of the enzyme, in the road's own colour.
  // Each road's tally, centred under the end of its road, in the road's own colour.
  function drawRoadEnds(G, L, w, hgt, m) {
    const E = endType(w, hgt);
    const colW = Math.max(40, Math.min(G.colW * 2 - 8, (w - G.bodyW) / 2 - 6));
    const oColour = m.hasO2 ? C.coralText : C.faint;
    const block = (x, n, word, where, colour) => {
      site.text(x, E.yNum, String(n), { anchor: 'middle', class: 'rf-num', fill: colour, 'font-size': E.numSize, 'font-weight': 650 });
      site.text(x, E.yWord, word, { anchor: 'middle', fill: colour, 'font-size': E.wordSize, 'font-weight': 600, fit: [E.wordSize, 7.6], width: colW });
      site.text(x, E.yWhere, where, { anchor: 'middle', fill: C.faint, 'font-size': E.whereSize, fit: [E.whereSize, 7.2], width: colW });
    };
    const small = w < 420;
    block(L.xL, oxygenations, 'oxygenations', !m.hasO2 ? 'nothing to salvage' : small ? 'to the salvage' : '2-phosphoglycolate, to the salvage', oColour);
    block(L.xR, carboxylations, 'carboxylations', small ? 'to the Calvin cycle' : '3-phosphoglycerate, to the cycle', C.ink);
  }

  // ---------------------------------------------------------------- the table

  function drawTable() {
    const { w, h: hgt } = table.clear().box;
    const m = model();
    const size = clamp(w * 0.03, 9.6, 11.4);
    const gutter = 12;
    const markColour = C.waterText;
    const isMoved = (i) => moved.includes(i);
    const accent = (i) => (isMoved(i) ? markColour : undefined);
    const vals = [
      m.hasO2 ? `${ratioText(m.airRatio)} : 1` : 'no oxygen',
      m.hasO2 ? `${ratioText(m.dissolvedRatio)} : 1` : 'no oxygen',
      m.hasO2 ? `${ratioText(m.siteRatio)} : 1` : 'every turn',
      m.hasO2 ? `${ratioText(m.working)} : 1` : 'every turn',
    ];
    const notes = [
      m.hasO2 ? `${airO2} % oxygen against ${ppmText(airCo2)} ppm CO₂` : `no free oxygen, and ${ppmText(airCo2)} ppm CO₂`,
      `CO₂ ${m.sol.toFixed(1)} times as soluble as O₂ at ${tempC} °C`,
      `rubisco favours CO₂ ${Math.round(m.pref)}-fold at ${tempC} °C`,
      `inside, ${Math.round(m.ci)} ppm: ${Math.round(m.ciShare * 100)} % of the air’s, the pore ${pore} % open`,
    ];
    const counted = carboxylations + oxygenations ? countedLine(false) : 'no turns yet';
    const rate = leafRate(m);
    const rd = table.readout({ title: 'The odds, in four steps', x: gutter, width: w - gutter, size, minRow: 14, maxRow: 27 });
    // Each step is set as a derivation: its reason in small type, then its result, closed by the row's
    // hairline. Set the other way round the reason sat under the rule and read as the next step's.
    rd.fit(hgt, (r, level) => {
      const withNotes = level === 0;
      const withHeads = level <= 1;
      if (withHeads) r.head('Oxygen to carbon dioxide');
      for (let i = 0; i < 4; i += 1) {
        if (i === 2 && withHeads) r.head('Carboxylations to oxygenations');
        if (withNotes) r.note(notes[i], { accent: accent(i) });
        r.row(rowLabel(i, tempC), vals[i], { accent: accent(i) });
      }
      r.rule();
      if (level <= 1) r.row('Counted at this site', counted);
      if (withNotes) r.note('against the same leaf with no oxygenation at all');
      r.row('Net carbon gain', `${pct1(m.netGain)} %`);
      if (withNotes) r.note(`rubisco ${share} % of its protein, each site at 3 turns a second`);
      r.row('Carbon fixed, whole leaf', `${Math.round(rate)} % of a typical leaf`);
    }, { levels: 3 });
    // The step the reader's last change entered at, marked in the gutter as well as in its colour.
    for (const t of table.node.querySelectorAll('text.tb-rt-key')) {
      const i = [0, 1, 2, 3].find((k) => t.textContent === rowLabel(k, tempC));
      if (i === undefined || !isMoved(i)) continue;
      const y = Number(t.getAttribute('y')) - size * 0.36;
      table.path(`M1 ${(y - 4).toFixed(1)} L6.5 ${y.toFixed(1)} L1 ${(y + 4).toFixed(1)} Z`, { fill: markColour });
    }
  }

  // ---------------------------------------------------------------- the salvage

  function salvageLayout(w, hgt) {
    const small = w < 420;
    const top = small ? 14 : 22;
    const yc = top + (hgt - top) * 0.52;
    const span = hgt - top;
    const chl = { cx: w * 0.19, rx: w * 0.16, ry: Math.min(span * 0.4, w * 0.2) };
    const per = { cx: w * 0.5, r: Math.min(w * 0.085, span * 0.2) };
    const mit = { cx: w * 0.8, hw: w * 0.14, hh: Math.min(span * 0.3, w * 0.13) };
    const up = yc - Math.min(chl.ry * 0.46, per.r * 0.55 + span * 0.05);
    const down = yc + (yc - up);
    const stops = [
      [chl.cx + chl.rx * 0.3, up],
      [per.cx, yc - per.r * 0.5],
      [mit.cx + mit.hw * 0.25, yc],
      [per.cx, yc + per.r * 0.5],
      [chl.cx + chl.rx * 0.3, down],
    ];
    const route = spline([
      stops[0],
      [lerp(stops[0][0], per.cx, 0.5), up],
      stops[1],
      [lerp(per.cx, mit.cx, 0.5), up],
      [mit.cx - mit.hw * 0.35, yc - mit.hh * 0.45],
      stops[2],
      [mit.cx - mit.hw * 0.35, yc + mit.hh * 0.45],
      [lerp(per.cx, mit.cx, 0.5), down],
      stops[3],
      [lerp(stops[4][0], per.cx, 0.5), down],
      stops[4],
    ], 12);
    const at = stops.map(([x, y]) => sAt(route, x, y));
    return { small, top, yc, chl, per, mit, stops, route, at };
  }

  function drawSalvage() {
    const { w, h: hgt } = site.clear().box;
    const S = salvageLayout(w, hgt);
    const { small, yc, chl, per, mit } = S;
    const pos = salvageStop(salvageTau);
    const k = pos.stop;
    const nameSize = small ? 9 : 10.6;
    const markSize = small ? 8.4 : 9.8;

    // The three compartments, each in its own colour from the organelle tables, as a tint of the paper so
    // that ink reads on it in both themes.
    site.ellipse(chl.cx, yc, chl.rx, chl.ry, { fill: tint(CHLORO.color, 16), stroke: CHLORO.color, 'stroke-width': 1.6 });
    site.ellipse(chl.cx, yc, chl.rx - 4, chl.ry - 4, { fill: 'none', stroke: CHLORO.color, 'stroke-width': 0.9 });
    for (const [gx, gy] of [[-0.45, 0.02], [-0.12, 0.02]]) {
      for (let i = 0; i < 4; i += 1) {
        const x = chl.cx + gx * chl.rx;
        const y = yc + gy * chl.ry + (i - 1.5) * (small ? 3.2 : 4.4);
        site.line(x - chl.rx * 0.11, y, x + chl.rx * 0.11, y, { stroke: THYLAKOID.color, 'stroke-width': small ? 2 : 2.8, 'stroke-linecap': 'round' });
      }
    }
    site.circle(per.cx, yc, per.r, { fill: tint(PEROX.color, 20), stroke: PEROX.color, 'stroke-width': 1.5 });
    const capsule = (cx, cy, hw, hh) => {
      const rr = Math.min(hh, hw);
      return `M${(cx - hw + rr).toFixed(1)} ${(cy - hh).toFixed(1)} L${(cx + hw - rr).toFixed(1)} ${(cy - hh).toFixed(1)} A${rr.toFixed(1)} ${hh.toFixed(1)} 0 0 1 ${(cx + hw - rr).toFixed(1)} ${(cy + hh).toFixed(1)} L${(cx - hw + rr).toFixed(1)} ${(cy + hh).toFixed(1)} A${rr.toFixed(1)} ${hh.toFixed(1)} 0 0 1 ${(cx - hw + rr).toFixed(1)} ${(cy - hh).toFixed(1)} Z`;
    };
    site.path(capsule(mit.cx, yc, mit.hw, mit.hh), { fill: tint(MITO.color, 16), stroke: MITO.color, 'stroke-width': 1.6 });
    // Cristae: the inner membrane's folds, along the bottom of the capsule where the route does not run.
    const folds = 5;
    for (let i = 0; i < folds; i += 1) {
      const x = mit.cx - mit.hw * 0.62 + (i * mit.hw * 1.24) / (folds - 1);
      const y1 = yc + mit.hh * 0.94;
      const y2 = yc + mit.hh * (i % 2 ? 0.66 : 0.72);
      site.line(x, y1, x, y2, { stroke: MITO.color, 'stroke-width': 1, 'stroke-linecap': 'round' });
    }

    // Names, above each compartment.
    const nameY = (y) => y - (small ? 5 : 8);
    site.text(chl.cx, nameY(yc - chl.ry), 'chloroplast', { anchor: 'middle', fill: C.soft, 'font-size': nameSize, 'font-weight': 600 });
    site.text(per.cx, nameY(yc - per.r), 'peroxisome', { anchor: 'middle', fill: C.soft, 'font-size': nameSize, 'font-weight': 600 });
    site.text(mit.cx, nameY(yc - mit.hh), 'mitochondrion', { anchor: 'middle', fill: C.soft, 'font-size': nameSize, 'font-weight': 600 });

    // The route: travelled solid, still to come dotted.
    const at = S.at;
    const sNow = pos.moving ? lerp(at[k], at[k + 1], easeInOut(pos.legU)) : at[k];
    const cut = Math.max(1, S.route.len.findIndex((d) => d >= sNow * S.route.total));
    const done = S.route.pts.slice(0, cut + 1);
    const ahead = S.route.pts.slice(cut);
    if (ahead.length > 1) site.path(dOf(ahead), { class: 'rf-route', stroke: C.ruleStrong, 'stroke-dasharray': '1 5' });
    if (done.length > 1) site.path(dOf(done), { class: 'rf-route', stroke: C.soft });
    const n = S.route.pts.length;
    const [ex, ey] = S.route.pts[n - 1];
    const [px, py] = S.route.pts[n - 4];
    const ang = Math.atan2(ey - py, ex - px);
    site.path(`M${(ex - 6 * Math.cos(ang - 0.45)).toFixed(1)} ${(ey - 6 * Math.sin(ang - 0.45)).toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${(ex - 6 * Math.cos(ang + 0.45)).toFixed(1)} ${(ey - 6 * Math.sin(ang + 0.45)).toFixed(1)}`, { class: 'rf-route', stroke: k >= 4 ? C.soft : C.ruleStrong });

    // What each stop did, once the molecule has been there.
    const r = clamp(Math.min(w * 0.011, hgt * 0.02), 4.5, 6.4);
    const label = (x, y, str, opts = {}) => site.label(x, y, str, { size: markSize, anchor: 'middle', fill: C.ink, halo: 3, ...opts });
    {
      atom(site, S.stops[0][0] - r * 3.2, S.stops[0][1] + r * 2.6, 'P', r);
      label(S.stops[0][0] - r * 3.2, S.stops[0][1] + r * 2.6 + r + markSize + 2, 'phosphate off');
    }
    if (k >= 1) {
      label(per.cx, yc + (small ? 1 : 2), 'H₂O₂ made,', { size: markSize * 0.95 });
      label(per.cx, yc + markSize + (small ? 2 : 4), 'then destroyed', { size: markSize * 0.95, fill: C.soft });
    }
    if (k >= 2) {
      const ox = mit.cx + mit.hw * 0.6;
      gas(site, ox, yc - mit.hh - r * 2.4, 'CO2', r, 0);
      label(ox, yc - mit.hh - r * 2.4 - r - 4, 'CO₂: a carbon lost', { anchor: 'end', size: markSize, fill: C.coralText });
      atom(site, mit.cx + mit.hw + r * 2.2, yc + mit.hh * 0.2, 'N', r);
      label(mit.cx + mit.hw + r * 2.2, yc + mit.hh * 0.2 + r + markSize + 3, 'NH₃', { size: markSize });
    }
    if (k >= 3) label(per.cx, yc + per.r + markSize + 6, 'nitrogen handed on', { size: markSize, fill: C.soft });
    if (k >= 4) {
      const ax = chl.cx - chl.rx * 0.34;
      const ay = S.stops[4][1] - (small ? 1 : 2);
      const ar = small ? 8 : 10.5;
      for (const [i, dx] of [[0, -ar * 1.15], [1, ar * 1.15]]) {
        site.circle(ax + dx, ay, ar, { fill: ATP.color, stroke: 'none' });
        site.text(ax + dx, ay + ar * 0.3, 'ATP', { anchor: 'middle', fill: ATP.symbolColor, 'font-size': +(ar * 0.78).toFixed(2), 'font-weight': 700, 'data-i': i });
      }
      label(ax, ay + ar + markSize + 4, 'two ATP spent', { size: markSize });
    }

    // The molecule itself, where it is now.
    const [mx, my] = along(S.route, sNow);
    // What it is now: what the last stop it reached made of it.
    const cargo = CARGO[Math.min(CARGO.length - 1, k + 1)];
    const cr = r * 1.05;
    const syms = [];
    if (cargo.phosphate && k < 4) syms.push('P');
    for (let i = 0; i < cargo.carbons; i += 1) syms.push('C');
    if (cargo.nitrogen) syms.push('N');
    if (cargo.phosphate && k >= 4) syms.push('P');
    const len = chainLength(syms.length, cr);
    const bx = clamp(mx, len / 2 + 2, w - len / 2 - 2);
    molecule(site, bx, my, syms, cr);
    const nameAbove = my < yc;
    site.label(bx, nameAbove ? my - cr - 6 : my + cr + markSize + 5, cargo.name, { size: markSize, anchor: 'middle', fill: C.ink, halo: 3 });
    site.focusMark();
  }

  function drawLedger() {
    const { w, h: hgt } = table.clear().box;
    const l = ledger();
    const size = clamp(w * 0.03, 9.6, 11.4);
    const k = Math.max(0, l.stop);
    const rd = table.readout({ title: 'The salvage, for two glycolates', x: 12, width: w - 12, size, minRow: 14, maxRow: 27 });
    rd.fit(hgt, (r, level) => {
      r.row('Carbon in, as two glycolates', '4');
      r.row('Carbon lost, as CO₂', String(l.carbonLost), { accent: l.carbonLost ? C.coralText : undefined });
      r.row('Carbon recovered', String(l.carbonRecovered));
      r.row('Nitrogen released, as NH₃', l.nitrogenReleased ? (k >= 4 ? '1, recaptured' : '1') : '0');
      r.row('ATP spent', String(l.atpSpent));
      if (level < 2) {
        r.rule();
        r.note(STOPS[k].say);
      }
      if (level < 1 && k >= 4) r.note('Three carbons in four come back. Doing nothing would lose all four and leave an inhibitor behind.');
    }, { levels: 3 });
  }

  // ---------------------------------------------------------------- drawing

  b.onDraw(() => {
    if (scene === 'site') {
      drawSite();
      drawTable();
    } else {
      drawSalvage();
      drawLedger();
    }
    setSubscripts(site.node);
    setSubscripts(table.node);
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   scene               'site' | 'salvage'
  //   era                 'today' | 'archaean': whether the air holds free oxygen
  //   airCo2Ppm           the air's carbon dioxide, ppm, on the slider's rungs (420 today)
  //   airO2Percent        21 today, 0 in the Archaean
  //   temperatureC        the leaf's temperature, °C
  //   stomaOpen           how far the pore is open, 0.05–1
  //   internalCo2Ppm      the leaf's internal carbon dioxide, from the air, the pore and Γ (see the header)
  //   airRatio            oxygen to carbon dioxide in the air, about 500 today
  //   dissolvedRatio      oxygen to carbon dioxide dissolved at the air's composition, about 20 at 25 °C
  //   preference          the enzyme's own, 100 at 25 °C, falling as it warms
  //   workingRatio        carboxylations per oxygenation inside the leaf, 3 as it opens; Infinity with no
  //                       oxygen in the air
  //   carboxylations, oxygenations  counted since the odds last changed; oxygenations stays 0 in the
  //                       Archaean
  //   turnoverPerSecond   3, rubisco's top speed, which is the pace the turns run at
  //   rubiscoFractionOfProtein  0.05–0.6, set by the reader; 0.4 as it opens
  //   salvageStep         null until the salvage is opened, then 'chloroplast' | 'peroxisome' |
  //                       'mitochondrion' | 'peroxisome-back' | 'chloroplast-back': the last stop reached
  //   carbonRecovered, carbonLost, atpSpentOnSalvage  the ledger for two glycolates: 3, 1 and 2 at the end
  //   netGainPercent      (r − ½)/(r + 1) as a percentage, against the same leaf with no oxygenation
  //   t, playing          the clock in seconds, and whether it is running
  // Reset puts every one of them back where it opened.
  return b.handle();
}
