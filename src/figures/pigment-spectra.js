// What is absorbed, and what it drives. Figure 6.1, §6.3 of the photosynthesis chapter.
//
// THE EXPERIMENT. Three absorption curves — chlorophyll a, chlorophyll b and the carotenoids, measured on
// the pigment in a solvent — over a wavelength axis drawn as the visible spectrum, and beneath them an
// action spectrum the reader builds by hand: a filament of green alga is lit at the wavelength the slider
// stands on, bacteria that swim towards oxygen crowd round it in proportion to what it makes, and one
// point is plotted for each wavelength measured. **The action chart starts empty**, because the reader is
// Engelmann: sweeping the whole range takes about a dozen presses. With chlorophyll a alone shown, the
// points run visibly broader than the absorption they are compared with — oxygen is made at 470 and at
// 640 nm, where chlorophyll a barely absorbs — and showing chlorophyll b and the carotenoids closes the
// gap. That discrepancy is how the accessory pigments were found (§6.3, the margin note), and it cannot
// be had from a figure that draws both curves finished.
//
// THE SECOND QUESTION, why a leaf is green. The sample is a leaf's worth of the same three pigments:
// extracted and spread flat over the leaf's own area, or left in the leaf. The two numbers beside the
// swatch are the fraction of the light each absorbs at the chosen wavelength; the strip under the
// spectrum is what gets through the chosen sample at every wavelength; and the swatch is the colour of
// daylight once it has got through. At 550 nm the extract absorbs about a third and the leaf about
// three-quarters — the leaf's scattering fills the green trough most of the way in — and what escapes is
// still green, because green is where the absorption is weakest. §6.3: "A leaf's colour is a leftover,
// not a choice."
//
// THE ARITHMETIC. Each pigment is a molar absorption spectrum ε(λ) in diethyl ether, built as a sum of
// Gaussian bands fitted to the published spectra (PhotochemCAD; Strain, Thomas & Katz 1963) at the
// wavelengths a reader can check against the prose: chlorophyll a peaks at 428.5 and 662 nm (§6.3: "about
// 430" and "about 662"), chlorophyll b at 453.5 and 642.5 nm ("about 453 and 642"), and the carotenoids — a
// lutein-like mixture, three bands at 423, 446 and 475 nm — absorb only from 400 to about 510 ("from about
// 400 to 500"). ε at the peaks: 114,900 and 94,100; 152,500 and 59,000; 140,500 L mol⁻¹ cm⁻¹.
//   The pigment content is a leaf's: 500 µmol of chlorophyll per square metre at a to b of three (375 and
//   125), and 110 µmol of carotenoids, a carotenoid-to-chlorophyll ratio of 0.22. Absorbance is then
//   A(λ) = Σ ε·n, with n in mol per cm², the extract spread flat over the leaf's own area.
//   Extracted: absorbed = 1 − 10^−A. At 550 nm that is 0.346. §6.3 quotes no number for it, so it is the
//   figure's own, and it sits inside the 0.33 to 0.36 FIGURES.md worked from the same spectra.
//   Whole leaf: absorbed = (1 − r)(1 − 10^(−βA)). r = 0.07 is the light a leaf's surface reflects at
//   every wavelength, which is why a leaf never absorbs everything; β = 3.86 is how many times longer a
//   photon's path is inside the leaf than straight through the same pigment, from bouncing between cells
//   and air spaces. β is the one number fitted, and it is fitted to §6.3's "roughly three-quarters of the
//   green" at 550 nm; blue and red then come out at 0.93, the prose's "something over nine-tenths",
//   without being asked to.
//   The alga's action: the oxygen a thin filament makes at each wavelength is taken as proportional to
//   the light its pigments absorb, every absorbed photon counted alike, so the action spectrum is the sum
//   of the three absorbances scaled to its own highest point. That is the idealisation the argument
//   needs — the gap closes when the pigments that fill it are shown — and a real alga meets it only
//   approximately: its carotenoids pass on somewhat less than everything they catch, and its pigments,
//   held by proteins, sit tens of nanometres from where a solvent puts them (§6.3). Both are left out so
//   that the one thing compared is which pigments are counted.
//
// THE COLOURS. Chlorophyll is `chloroplast` from src/figures/lib/cell3-colours.js, unchanged: the organelle
// in Figure 3.8 is green because of this pigment, so the pigment takes the organelle's green rather than
// becoming a second green beside it — and Figure 6.2 draws its reaction centres in the same value. It is
// lighter than `thylakoid` by construction (thylakoid is it taken 35% into the ink): dE76 20.1 from
// thylakoid and 18.5 from `enzyme`, both over the 17.8 that MEMBRANE's comment in src/palette.js sets for
// two things in one frame. As a curve it clears 3:1 against the paper in both themes (3.83 light, 4.39
// dark), and its words are the same green taken 30% into the ink, 5.9:1 and 6.4:1. Chlorophyll b, which
// differs by one functional group and is yellower in a test tube, is that green taken half way to
// `--gold-text`; the carotenoids are `--coral`, with `--coral-text` for their words. Colour is never the
// only difference: the three curves are solid, dashed and dotted, and the key names them in place.
//   The spectrum, the strip of what gets through and the swatch are `spectrumColour` in src/palette.js,
//   the book's one colour that is a measurement, approved for this figure alone.
//   Light is not a colour anywhere else here: a photon on its way to the filament is a travelling mark in
//   inkSoft with its wavelength written beside it, and its wave is drawn longer the redder it is.
//
// THE ACTION CHART'S OUTLINE is the pigments shown on the oxygen's own scale: what the alga would make if
// they were all it had. It therefore sits under the points everywhere, touching them only where the
// pigments shown are the only ones absorbing, and the room between the two is the work of the pigments
// not shown. An outline scaled to its own peak instead stood ABOVE the oxygen at 662 nm with
// chlorophyll a alone, which read as the opposite of the argument.
//
// TWO COMPOSITIONS.
//   wide   — the two charts stacked on the left, sharing one wavelength axis drawn as the spectrum; the
//            filament and its bacteria top right; the swatch and its two numbers bottom right.
//   narrow — below 800 px, one chart at a time, chosen by Absorption / Action, with the other drawn
//            faintly behind it so the comparison survives, and the three curve toggles become one
//            three-state stepper — chlorophyll a, then a and b, then all three — which is the order the
//            argument is made in. The swatch and its two numbers keep the same labels. Below 800 px is two
//            stages in this book, so the panes follow the stage's shape: a phone's (390 by 520) stacks
//            the chart, the filament and the swatch; a small laptop's (656 by 369, the chapter column at a
//            1024 px window) keeps the wide arrangement with one chart in its left column.
//
// THE KEYS are placed by search, not by position: see key() below.
//
// WHAT IS NOT HERE. The brief's second scene — a few hundred antenna pigments round one reaction centre,
// the four exits, the queue and the carotenoids' protection — is not built. It is a second simulation
// with a toolbar of its own, and this figure is the spectra, the extract against the leaf, and the
// swatch, built to the bench's bar rather than two scenes built short of it. The objective it would have
// taught, `antenna-and-protection`, and the sentences in §6.3 and the caption that point to it, are the
// chapter's to settle.
//
// describe() is documented at the foot of this file.
import { C, el, clamp } from './lib/svg.js';
import { bench, EM_ADVANCE } from './lib/bench.js';
import { spectrumColour, LIGHT } from '../palette.js';
import { colourOf } from './lib/cell3-colours.js';

export const meta = { kind: 'pigment-spectra', title: 'What is absorbed, and what it drives', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 };

// ---------------------------------------------------------------- the spectra

const gauss = (x, centre, sigma) => Math.exp(-0.5 * ((x - centre) / sigma) ** 2);
// A molar absorption spectrum as a sum of bands: [centre nm, width nm, ε at the centre].
const spectrum = (bands) => (nm) => bands.reduce((sum, [c, s, e]) => sum + e * gauss(nm, c, s), 0);

const EPSILON = {
  'chl-a': spectrum([
    [431, 8.4, 86000], [419, 10, 30000], [404, 14, 36000], [383, 24, 28000], [440, 7, 2500], [465, 14, 3500],
    [662, 7.2, 78000], [671, 11, 9000], [651, 12, 12000], [615, 10, 9000], [630, 18, 6000], [580, 11, 5500],
    [535, 13, 2200], [555, 70, 1700],
  ]),
  'chl-b': spectrum([
    [452, 9.2, 116000], [468, 11, 66000], [435, 11, 30000], [415, 16, 30000], [390, 22, 20000],
    [643, 7.8, 50000], [652, 10, 2500], [630, 14, 11000], [596, 13, 7000], [570, 26, 3800], [550, 14, 1700],
    [505, 40, 2500],
  ]),
  carotenoid: spectrum([
    [423, 8.5, 60000], [446, 9.5, 94000], [475, 10, 100000], [452, 26, 44000], [405, 15, 25000],
  ]),
};
// µmol per square metre of leaf: 500 of chlorophyll at a to b of three, and a carotenoid-to-chlorophyll
// ratio of 0.22.
const CONTENT = { 'chl-a': 375, 'chl-b': 125, carotenoid: 110 };
// ε [L mol⁻¹ cm⁻¹] × n [µmol m⁻²] × 10⁻⁶ mol/µmol × 10⁻⁴ m²/cm² × 10³ cm³/L.
const UNIT = 1e-7;
const SURFACE = 0.07; // reflected at a leaf's surface, at every wavelength
const PATH = 3.86; // how much longer a photon's path is inside a leaf than straight through; fitted at 550 nm

const IDS = ['chl-a', 'chl-b', 'carotenoid'];
const LO = 400;
const HI = 700;
const TABLE_LO = 380;
const TABLE_HI = 780;

// Every absorbance the figure draws, at every nanometre, computed once.
const TABLE = Object.fromEntries(IDS.map((id) => {
  const row = new Float64Array(TABLE_HI - TABLE_LO + 1);
  for (let nm = TABLE_LO; nm <= TABLE_HI; nm += 1) row[nm - TABLE_LO] = EPSILON[id](nm) * CONTENT[id] * UNIT;
  return [id, row];
}));
const absorbanceOf = (id, nm) => {
  const f = clamp(nm, TABLE_LO, TABLE_HI) - TABLE_LO;
  const i = Math.min(TABLE_HI - TABLE_LO - 1, Math.floor(f));
  return TABLE[id][i] + (TABLE[id][i + 1] - TABLE[id][i]) * (f - i);
};
const sumOf = (ids, nm) => ids.reduce((s, id) => s + absorbanceOf(id, nm), 0);
const peakOf = (ids) => {
  let top = 0;
  for (let nm = LO; nm <= HI; nm += 1) top = Math.max(top, sumOf(ids, nm));
  return top;
};
const CHL_A_PEAK = peakOf(['chl-a']);
const ACTION_PEAK = peakOf(IDS);

// The sample: a leaf's worth of all three pigments, whichever curves the chart is showing.
const absorbed = (sample, nm) => {
  const a = sumOf(IDS, nm);
  return sample === 'leaf' ? (1 - SURFACE) * (1 - 10 ** (-PATH * a)) : 1 - 10 ** -a;
};
const transmitted = (sample, nm) => {
  const a = sumOf(IDS, nm);
  return sample === 'leaf' ? (1 - SURFACE) * 10 ** (-PATH * a) : 10 ** -a;
};
const actionAt = (nm) => sumOf(IDS, nm) / ACTION_PEAK;

// The spectrum a nanometre at a time, and the colour of what gets through each sample. The name is read
// off the colour rather than written beside each sample, so it cannot say green over a swatch that is not.
const RAINBOW = Array.from({ length: TABLE_HI - TABLE_LO + 1 }, (_, i) => spectrumColour(TABLE_LO + i));
const SWATCH = {
  extracted: spectrumColour((nm) => transmitted('extracted', nm)),
  leaf: spectrumColour((nm) => transmitted('leaf', nm)),
};
const linear = (hex) => [1, 3, 5].map((i) => {
  const c = parseInt(hex.slice(i, i + 2), 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});
function colourName(hex) {
  const [r, g, bl] = linear(hex);
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((0.4124 * r + 0.3576 * g + 0.1805 * bl) / 0.95047);
  const Y = f(0.2126 * r + 0.7152 * g + 0.0722 * bl);
  const Z = f((0.0193 * r + 0.1192 * g + 0.9505 * bl) / 1.08883);
  const L = 116 * Y - 16;
  const a = 500 * (X - Y);
  const bb = 200 * (Y - Z);
  const chroma = Math.hypot(a, bb);
  const hue = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  if (L < 8) return 'black';
  if (chroma < 12) return L > 90 ? 'white' : L < 40 ? 'dark grey' : 'grey';
  const word = hue < 50 || hue >= 345 ? 'red' : hue < 75 ? 'orange' : hue < 97 ? 'amber' : hue < 110 ? 'yellow'
    : hue < 131 ? 'yellow-green' : hue < 162 ? 'green' : hue < 205 ? 'blue-green' : hue < 300 ? 'blue'
      : hue < 322 ? 'violet' : 'purple';
  return L < 45 ? `dark ${word}` : L > 88 ? `pale ${word}` : word;
}
const SWATCH_NAME = { extracted: colourName(SWATCH.extracted), leaf: colourName(SWATCH.leaf) };
// A colour of the spectrum dimmed, in linear light, to the fraction of it that gets through.
function dimmed(hex, fraction) {
  const out = linear(hex).map((c) => {
    const v = c * clamp(fraction, 0, 1);
    return Math.round(clamp(v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055, 0, 1) * 255);
  });
  return `rgb(${out.join(', ')})`;
}

// ---------------------------------------------------------------- colours and words

const CHLOROPHYLL = colourOf('chloroplast');
const WALL = colourOf('wall');
const TOWARD_INK = (colour, pct) => `color-mix(in srgb, ${colour} ${pct}%, var(--ink))`;
const CHL_B = `color-mix(in srgb, ${CHLOROPHYLL} 50%, var(--gold-text))`;
const PIGMENT = {
  'chl-a': { name: 'chlorophyll a', stroke: CHLOROPHYLL, text: TOWARD_INK(CHLOROPHYLL, 70), dash: null },
  'chl-b': { name: 'chlorophyll b', stroke: CHL_B, text: TOWARD_INK(CHL_B, 80), dash: '7 3.5' },
  carotenoid: { name: 'carotenoids', stroke: C.coral, text: C.coralText, dash: '0.1 3.8' },
};
// The strips are light itself and do not move with the theme; below 480 nm both are all but black in
// either sample, so the words on them are the light paper, fixed, at about 19:1.
const ON_STRIP = LIGHT.paper;

const CHARTS = [
  { id: 'absorption', label: 'Absorption', aria: 'Absorption, the pigments measured in a solvent' },
  { id: 'action', label: 'Action', aria: 'Action, the oxygen the living alga makes' },
];
const STEPS = [['chl-a'], ['chl-a', 'chl-b'], ['chl-a', 'chl-b', 'carotenoid']];

const f2 = (v) => v.toFixed(2);
const widthOf = (str, size) => String(str).length * EM_ADVANCE * size;
// Figures are wider than the average letter the bench's estimate is taken over, and a tick label is
// all figures: Inter's tabular digits are 0.62 em.
const figuresWidth = (str, size) => String(str).length * 0.62 * size;
// A colour name as it is set: with a true hyphen, because the readout sets its values with tabular
// figures and Inter's tabular hyphen-minus is a figure's width, which opened "yellow-green" into three
// pieces. describe() keeps the plain hyphen-minus a goal can type.
const shownName = (name) => name.replace('-', '‐');
// The small-caps register the bench's titles are set in: capitals, tracked a tenth of an em.
const capsWidth = (str, size) => String(str).length * 0.74 * size;
const shownWords = (ids) => {
  if (!ids.length) return 'no pigment';
  if (ids.length === 3) return 'all three';
  if (ids.length === 1) return PIGMENT[ids[0]].name;
  if (ids.includes('chl-a') && ids.includes('chl-b')) return 'chlorophyll a and b';
  return ids.map((id) => PIGMENT[id].name).join(' and ');
};

// ---------------------------------------------------------------- style

const NARROW_W = 800;
const NARROW_H = 400;

const CSS = `
.tb-pigment-spectra .ps-tick { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-pigment-spectra .ps-here { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
.tb-pigment-spectra .ps-base { stroke: var(--rule-strong); }
.tb-pigment-spectra .ps-grid { stroke: var(--rule); }
.tb-pigment-spectra .ps-note { fill: var(--ink-faint); }
.tb-pigment-spectra .ps-light { fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
`;

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    kind: meta.kind,
    css: CSS,
    narrowBelow: { width: NARROW_W, height: NARROW_H },
    seed: 61,
  });
  const n1 = (v) => b.num(v, 1);

  // ---- state ----
  let wavelength = 550;
  let shown = ['chl-a'];
  let sample = 'extracted';
  let points = []; // { nm, o2 }, sorted by nm, one per wavelength measured
  let lit = null; // the wavelength the filament was last lit at, or null while it is dark
  let view = 'absorption'; // which chart a phone shows
  let syncing = false;

  // The bacteria, as fractions of the pane, drawn once from the seeded generator so a frame is the same
  // frame every run. `rank` decides which of them join the crowd: as the oxygen rises the crowd takes
  // the lowest ranks first, so a brighter measurement adds bacteria to it rather than reshuffling them.
  const BACTERIA = Array.from({ length: 110 }, () => ({
    rank: b.random(), along: b.random(), side: b.random() < 0.5 ? -1 : 1, near: b.random(),
    x: b.random(), y: b.random(), tilt: b.random() * 2 - 1, turn: b.random() * Math.PI,
  }));

  // ---- the panes ----
  const chart = b.pane('chart', {
    as: 'svg',
    focus: true,
    aria: 'Absorption spectra of chlorophyll a, chlorophyll b and the carotenoids over the visible spectrum, and beneath them the oxygen the alga makes at each wavelength measured. Left and right arrows move the wavelength by 5 nm, Page Up and Page Down by 25, Home and End go to 400 and 700 nm, and Enter measures here.',
  });
  const alga = b.pane('alga', { as: 'svg' });
  const swatch = b.pane('swatch', { as: 'svg' });

  // The narrow composition has two shapes, because "below 800 px" is two different stages in this book: a
  // phone's, 390 by 520, and a small laptop's, where the chapter's wide column gives the figure 656 by
  // 369 — narrower than the threshold and still wider than it is tall. Stacking three panes in that one
  // made a 57 px strip of filament and a table whose values stood 600 px from their labels. So the
  // narrow template is read off the stage's own shape each time the bench lays it out: a portrait stage
  // stacks the panes, a landscape one keeps the wide arrangement with one chart in its left column. Both
  // show one chart at a time; that is what "narrow" means here, and it is the bench's one threshold.
  const portrait = () => {
    const r = root.getBoundingClientRect();
    return r.height >= r.width * 0.9;
  };
  const WIDE_GRID = {
    columns: 'minmax(0, 60fr) minmax(0, 40fr)',
    rows: 'minmax(0, 57fr) minmax(0, 43fr)',
    at: { chart: [1, '1 / 3'], alga: [2, 1], swatch: [2, 2] },
  };
  const TALL_GRID = {
    columns: 'minmax(0, 1fr)',
    rows: 'minmax(0, 55fr) minmax(0, 20fr) minmax(0, 25fr)',
    at: { chart: [1, 1], alga: [1, 2], swatch: [1, 3] },
  };
  b.compose({
    wide: { ...WIDE_GRID, columnGap: 'var(--space-4)' },
    narrow: {
      get columns() { return portrait() ? TALL_GRID.columns : WIDE_GRID.columns; },
      get rows() { return portrait() ? TALL_GRID.rows : WIDE_GRID.rows; },
      get at() { return portrait() ? TALL_GRID.at : WIDE_GRID.at; },
    },
  });

  // ---- the controls ----
  //
  // What to show, what to measure, what to measure it on, and starting again: four groups. At a phone's
  // width the three toggles give way to one stepper and the chart choice appears, because only one
  // chart fits.
  const toggles = {};
  const pressShown = (id, on) => {
    if (syncing) return;
    shown = IDS.filter((x) => (x === id ? on : shown.includes(x)));
    syncControls();
    after();
  };
  toggles['chl-a'] = b.toggle('Chlorophyll a', (on) => pressShown('chl-a', on), { pressed: true, only: 'wide', aria: 'Chlorophyll a, show or hide its absorption curve' });
  toggles['chl-b'] = b.toggle('Chlorophyll b', (on) => pressShown('chl-b', on), { only: 'wide', aria: 'Chlorophyll b, show or hide its absorption curve' });
  toggles.carotenoid = b.toggle('Carotenoids', (on) => pressShown('carotenoid', on), { only: 'wide', aria: 'Carotenoids, show or hide their absorption curve' });
  const pigments = b.stepper('Pigments', {
    min: 1, max: 3, step: 1, value: 1, short: 'Show', only: 'narrow',
    format: (v, o) => (o.narrow ? ['a only', 'a and b', 'all three'] : ['chlorophyll a', 'a and b', 'all three'])[v - 1],
    onInput: (v) => { if (syncing) return; shown = [...STEPS[v - 1]]; syncControls(); after(); },
  });
  const chartChoice = b.choice('Chart', CHARTS, (id) => { view = id; after(); }, { value: 'absorption', segmented: true, only: 'narrow' });
  b.divide();
  const slider = b.slider('Wavelength', {
    min: LO, max: HI, step: 5, value: wavelength, short: 'λ',
    format: (v) => `${v} nm`,
    onInput: (v) => { if (syncing) return; wavelength = v; after(); },
  });
  b.action('Measure here', () => measure(), { primary: true, aria: 'Measure here, light the filament at this wavelength and plot the oxygen it makes' });
  b.divide();
  // The sample is one toggle rather than a pair, because the experiment opens on the extract and the
  // question is what changes in a whole leaf. It is also the difference between one row of controls and
  // two at a desktop width: at the chapter's 989 px stage a pair of buttons here put Reset alone on a
  // second row, 54 px of stage spent on one word. The readout names both samples in every state.
  const leafToggle = b.toggle('Whole leaf', (on) => { sample = on ? 'leaf' : 'extracted'; after(); }, { aria: 'Whole leaf, put the same pigment inside a leaf, which scatters the light, instead of extracting it' });
  b.divide();
  b.action('Reset', () => reset(), { aria: 'Reset, clear the points and put the bench back as it opened' });

  const setWavelength = (nm) => {
    wavelength = clamp(Math.round(nm / 5) * 5, LO, HI);
    syncing = true;
    slider.set(wavelength);
    syncing = false;
    after();
  };
  b.keys({
    ArrowLeft: () => setWavelength(wavelength - 5),
    ArrowDown: () => setWavelength(wavelength - 5),
    ArrowRight: () => setWavelength(wavelength + 5),
    ArrowUp: () => setWavelength(wavelength + 5),
    PageDown: () => setWavelength(wavelength - 25),
    PageUp: () => setWavelength(wavelength + 25),
    Home: () => setWavelength(LO),
    End: () => setWavelength(HI),
    Enter: () => measure(),
    ' ': () => measure(),
  });

  // ---- reader actions ----
  function after() {
    b.redraw();
    b.announce();
  }
  // The toggles and the stepper are two views of one list, and whichever the reader used, the other is
  // set to agree without either firing. A list the stepper cannot say — carotenoids alone, say, chosen
  // on a desktop — leaves the stepper where it was until the reader moves it.
  function syncControls() {
    syncing = true;
    for (const id of IDS) toggles[id].set(shown.includes(id), { quiet: true });
    const step = STEPS.findIndex((s) => s.length === shown.length && s.every((id) => shown.includes(id)));
    if (step >= 0 && pigments.value !== step + 1) pigments.set(step + 1);
    syncing = false;
  }
  function measure() {
    const o2 = actionAt(wavelength);
    points = points.filter((p) => p.nm !== wavelength).concat({ nm: wavelength, o2 }).sort((p, q) => p.nm - q.nm);
    lit = wavelength;
    after();
  }
  function reset() {
    wavelength = 550;
    shown = ['chl-a'];
    sample = 'extracted';
    points = [];
    lit = null;
    view = 'absorption';
    syncing = true;
    slider.set(550);
    leafToggle.set(false, { quiet: true });
    chartChoice.set('absorption', { quiet: true });
    syncing = false;
    syncControls();
    after();
  }
  b.onLayout(() => syncControls());

  // ---- what describe() reports ----
  // The pigments shown, on the oxygen's own scale: what the alga would make if they were all it had.
  const shownAbsorbance = (nm) => sumOf(shown, nm) / ACTION_PEAK;
  function state() {
    return {
      scene: 'spectrum',
      curvesShown: [...shown],
      wavelengthNm: wavelength,
      actionPoints: points.length,
      actionAt: Number(actionAt(wavelength).toFixed(3)),
      absorbanceAt: Number(shownAbsorbance(wavelength).toFixed(3)),
      sample,
      absorbedFraction: Number(absorbed(sample, wavelength).toFixed(3)),
      transmittedName: SWATCH_NAME[sample],
      t: 0,
      playing: false,
    };
  }
  b.onDescribe(state);
  b.onAnnounce((d) => {
    const other = sample === 'leaf' ? 'extracted' : 'leaf';
    const here = points.find((p) => p.nm === wavelength);
    return `${d.wavelengthNm} nm. ${sample === 'leaf' ? 'A whole leaf' : 'The extracted pigment'} absorbs ${f2(d.absorbedFraction)} of the light here, and ${other === 'leaf' ? 'a whole leaf' : 'the extracted pigment'} ${f2(absorbed(other, wavelength))}; what gets through looks ${d.transmittedName}. ${here ? `Oxygen here: ${f2(here.o2)} of the most.` : 'No oxygen measured at this wavelength yet.'} ${d.actionPoints} ${d.actionPoints === 1 ? 'point' : 'points'} plotted, ${shownWords(shown)} shown.`;
  });

  // ---------------------------------------------------------------- type

  // One scale of type for the whole stage, read off the stage's width, so the three panes agree. The
  // floors are the book's: nothing under 8.4 px, which is 25 device pixels on a phone and, on the one
  // stage where the figure is small at a device ratio of one — a 1024 px laptop, 656 px of stage — is
  // still the size `enzyme-kinetics` sets its tick figures at.
  let S = null;
  const measureType = () => {
    const stageW = root.getBoundingClientRect().width || chart.box.w;
    S = {
      title: clamp(stageW * 0.0096, 8.6, 9.6),
      axis: clamp(stageW * 0.0096, 8.4, 9.6),
      key: clamp(stageW * 0.0104, 9, 10.4),
    };
  };

  // ---------------------------------------------------------------- the charts

  function curvePath(fn, X, Y) {
    let d = '';
    for (let nm = LO; nm <= HI; nm += 1) d += `${nm === LO ? 'M' : 'L'}${n1(X(nm))} ${n1(Y(fn(nm)))}`;
    return d;
  }

  // A key set as a short column of type at the top of a chart, placed where nothing drawn reaches it.
  // Where that is depends on the state — which curves are shown, where the points are, where the marker
  // stands — so it is not a place but a search: every position along the top, nearest the green trough
  // first (486 nm, where every curve is lowest), is tested against the marker and against each thing
  // actually drawn under it, sampled every two pixels across the key's width. The first that clears all
  // of them wins. At a phone's width with the marker in the trough nothing may clear, and then the key
  // takes the trough anyway and its words, which carry a paper halo, stand in front of the marker.
  // `under` is what is drawn: functions from wavelength to the chart's own value.
  function key(rows, { X, Y, top, markerX, padL, pw, under }) {
    const size = S.key;
    const rowH = size + 4.5;
    const mark = 17;
    const wide = Math.max(...rows.map((r) => widthOf(r.text, size) + (r.mark ? mark + 5 : 0)));
    const bottom = top + rows.length * rowH + 4;
    const nmAt = (x) => LO + ((x - padL) / pw) * (HI - LO);
    const clear = (x) => {
      if (markerX >= x - 8 && markerX <= x + wide + 8) return false;
      for (let px = x - 3; px <= x + wide + 3; px += 2) {
        const nm = nmAt(px);
        if (under.some((f) => Y(f(nm)) < bottom + 3)) return false;
      }
      return true;
    };
    const home = X(486);
    const room = [];
    for (let x = padL + 6; x + wide <= padL + pw; x += 3) room.push(x);
    room.sort((p, q) => Math.abs(p - home) - Math.abs(q - home));
    const x = room.find(clear) ?? clamp(home, padL + 6, padL + pw - wide);
    rows.forEach((r, i) => {
      const y = top + rowH * i + size;
      const my = y - size * 0.34;
      if (r.mark === 'line') {
        chart.line(x, my, x + mark, my, { stroke: r.stroke, 'stroke-width': 2.1, 'stroke-dasharray': r.dash ?? undefined, 'stroke-linecap': 'round' });
      } else if (r.mark === 'hill') {
        chart.path(`M${n1(x)} ${n1(my + 3.6)}Q${n1(x + mark / 2)} ${n1(my - 7)} ${n1(x + mark)} ${n1(my + 3.6)}Z`, { fill: C.paper3, stroke: C.ruleStrong, 'stroke-width': 1 });
      } else if (r.mark === 'dot') {
        chart.line(x + 1, my, x + mark - 1, my, { stroke: C.ink, 'stroke-width': 1.3 });
        chart.circle(x + mark / 2, my, 3, { fill: C.ink, stroke: C.paper, 'stroke-width': 1 });
      } else if (r.mark === 'ring') {
        chart.line(x + 1, my, x + mark - 1, my, { stroke: C.faint, 'stroke-width': 1, 'stroke-dasharray': '3 2.5' });
        chart.circle(x + mark / 2, my, 2.4, { fill: C.paper, stroke: C.soft, 'stroke-width': 1.1 });
      }
      chart.label(r.mark ? x + mark + 5 : x, y, r.text, { size, anchor: 'start', fill: r.colour ?? C.soft, halo: 3, 'font-weight': 500 });
    });
  }

  // The two strips under the absorption chart: the spectrum itself, which is the wavelength axis, and
  // what of it gets through the sample. Each is one rectangle filled by a gradient with a stop every
  // 5 nm, in the one colour in the book that is a measurement.
  function strips({ X, y, h1, h2 }) {
    const ids = { sun: b.uid('sun'), through: b.uid('through') };
    const stops = (colourAt) => {
      const out = [];
      for (let nm = LO; nm <= HI; nm += 5) out.push(el('stop', { offset: n1(((nm - LO) / (HI - LO)) * 100) + '%', 'stop-color': colourAt(nm) }));
      return out;
    };
    chart.add(el('defs', {}, [
      el('linearGradient', { id: ids.sun, x1: '0', x2: '1', y1: '0', y2: '0' }, stops((nm) => RAINBOW[nm - TABLE_LO])),
      el('linearGradient', { id: ids.through, x1: '0', x2: '1', y1: '0', y2: '0' }, stops((nm) => dimmed(RAINBOW[nm - TABLE_LO], transmitted(sample, nm)))),
    ]));
    const x0 = X(LO);
    const wx = X(HI) - x0;
    chart.rect(x0, y, wx, h1, { fill: `url(#${ids.sun})` });
    chart.rect(x0, y + h1 + 2, wx, h2, { fill: `url(#${ids.through})` });
    const size1 = Math.min(S.axis - 0.4, h1 - 2);
    const size2 = Math.min(S.axis - 0.4, h2 - 3.5);
    chart.text(x0 + 4, y + h1 / 2 + size1 * 0.36, 'daylight', { 'font-size': n1(size1), style: `fill:${ON_STRIP}`, 'font-weight': 500 });
    chart.text(x0 + 4, y + h1 + 2 + h2 / 2 + size2 * 0.36, sample === 'leaf' ? 'through the leaf' : 'through the extract', { 'font-size': n1(size2), style: `fill:${ON_STRIP}`, 'font-weight': 500 });
    // Two carets, pointing at the wavelength the slider stands on from above and below.
    const x = X(wavelength);
    const s = 4;
    const bottom = y + h1 + 2 + h2;
    chart.path(`M${n1(x - s)} ${n1(y - s - 1.5)}L${n1(x + s)} ${n1(y - s - 1.5)}L${n1(x)} ${n1(y - 1)}Z`, { fill: C.ink });
    chart.path(`M${n1(x - s)} ${n1(bottom + s + 1.5)}L${n1(x + s)} ${n1(bottom + s + 1.5)}L${n1(x)} ${n1(bottom + 1)}Z`, { fill: C.ink });
  }

  // The tick row under the strips. The wavelength the slider stands on is set in the ink at the weight of
  // a value, with its unit, and a tick label that would touch it is not set.
  function ticks({ X, y, every }) {
    const size = S.axis;
    const here = `${wavelength} nm`;
    const hw = figuresWidth(here, size);
    const hereLeft = clamp(X(wavelength) - hw / 2, X(LO), X(HI) - hw);
    for (let nm = LO; nm <= HI; nm += every) {
      const x = X(nm);
      const tw = figuresWidth(String(nm), size);
      const left = nm === LO ? x : nm === HI ? x - tw : x - tw / 2;
      if (left + tw + 9 > hereLeft && left - 9 < hereLeft + hw) continue;
      chart.text(x, y + size + 5, String(nm), { anchor: nm === LO ? 'start' : nm === HI ? 'end' : 'middle', class: 'ps-tick', 'font-size': n1(size) });
    }
    chart.text(hereLeft + hw / 2, y + size + 5, here, { anchor: 'middle', class: 'ps-here', 'font-size': n1(size) });
  }

  // The y axis of a chart: a baseline, a hairline at a half, and the three values at the left.
  function frame({ padL, pw, Y }) {
    chart.line(padL, Y(0.5), padL + pw, Y(0.5), { class: 'ps-grid' });
    chart.line(padL, Y(0), padL + pw, Y(0), { class: 'ps-base' });
    for (const [v, label] of [[0, '0'], [0.5, '0.5'], [1, '1']]) {
      chart.text(padL - 4, Y(v) + S.axis * 0.35, label, { anchor: 'end', class: 'ps-tick', 'font-size': n1(S.axis) });
    }
  }

  // A chart's title in the small-caps register on the left, and a note on the right if it fits beside it.
  function heading(text, note, { padL, pw, y }) {
    chart.text(padL, y, text, { class: 'tb-rt-title', 'font-size': n1(S.title) });
    const room = pw - capsWidth(text, S.title) - 14;
    if (note && room > 40) chart.text(padL + pw, y, note, { anchor: 'end', class: 'ps-note', fit: [S.title, 7.8], width: room });
  }

  function absorption({ X, top, height, padL, pw, markerX, faintAction }) {
    const Y = (v) => top + height - (clamp(v, 0, 1.08) / 1.08) * height;
    heading(b.narrow ? 'Absorption, on the pigment' : 'Absorption, measured on the pigment', 'relative to chlorophyll a’s peak', { padL, pw, y: top - 9 });
    frame({ top, height, padL, pw, Y });
    if (faintAction && points.length) {
      // Behind the curves, on a phone: the oxygen measured so far, faint, so the comparison survives
      // the one-chart-at-a-time composition.
      if (points.length > 1) chart.path(points.map((p, i) => `${i ? 'L' : 'M'}${n1(X(p.nm))} ${n1(Y(p.o2))}`).join(''), { fill: 'none', stroke: C.faint, 'stroke-width': 1, 'stroke-dasharray': '3 2.5' });
      for (const p of points) chart.circle(X(p.nm), Y(p.o2), 2.4, { fill: C.paper, stroke: C.soft, 'stroke-width': 1.1 });
    }
    chart.line(markerX, top, markerX, top + height, { stroke: C.ink, 'stroke-width': 1, opacity: 0.5 });
    for (const id of IDS) {
      if (!shown.includes(id)) continue;
      const p = PIGMENT[id];
      chart.path(curvePath((nm) => absorbanceOf(id, nm) / CHL_A_PEAK, X, Y), {
        fill: 'none', stroke: p.stroke, 'stroke-width': 2.1, 'stroke-dasharray': p.dash ?? undefined,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      });
    }
    for (const id of IDS) {
      if (shown.includes(id)) chart.circle(markerX, Y(absorbanceOf(id, wavelength) / CHL_A_PEAK), 3.2, { fill: PIGMENT[id].stroke, stroke: C.paper, 'stroke-width': 1.3 });
    }
    const rows = shown.map((id) => ({ mark: 'line', stroke: PIGMENT[id].stroke, dash: PIGMENT[id].dash, text: PIGMENT[id].name, colour: PIGMENT[id].text }));
    if (!rows.length) rows.push({ text: 'no pigment shown' });
    if (faintAction && points.length) rows.push({ mark: 'ring', text: `oxygen, ${points.length} ${points.length === 1 ? 'point' : 'points'}` });
    const under = shown.map((id) => (nm) => absorbanceOf(id, nm) / CHL_A_PEAK);
    if (faintAction) under.push(pointsAt);
    key(rows, { X, Y, top: top + 1, markerX, padL, pw, under });
  }

  // The reader's points as a line, for the key to stay clear of: between two points the segment joining
  // them, a few nanometres either side of the ends the mark itself, and a little over its height so the
  // ring round the latest one is kept clear too.
  function pointsAt(nm) {
    if (!points.length || nm < points[0].nm - 4 || nm > points[points.length - 1].nm + 4) return 0;
    const i = points.findIndex((p) => p.nm >= nm);
    if (i <= 0) return (i === 0 ? points[0].o2 : points[points.length - 1].o2) + 0.06;
    const [p, q] = [points[i - 1], points[i]];
    return p.o2 + ((nm - p.nm) / (q.nm - p.nm)) * (q.o2 - p.o2) + 0.06;
  }

  function action({ X, top, height, padL, pw, markerX }) {
    const Y = (v) => top + height - (clamp(v, 0, 1.08) / 1.08) * height;
    heading(b.narrow ? 'Action, on the living alga' : 'Action, measured on the living alga', 'the most oxygen = 1', { padL, pw, y: top - 9 });
    frame({ top, height, padL, pw, Y });
    // What the pigments shown would make on their own, on the same scale as the oxygen: the absorption
    // the points are to be compared with. Under the points everywhere, because every pigment the alga has
    // makes oxygen; the room between the two is what the pigments not shown are doing.
    if (shown.length) {
      const d = `${curvePath(shownAbsorbance, X, Y)}L${n1(X(HI))} ${n1(Y(0))}L${n1(X(LO))} ${n1(Y(0))}Z`;
      chart.path(d, { fill: C.paper3, stroke: C.ruleStrong, 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    }
    chart.line(markerX, top, markerX, top + height, { stroke: C.ink, 'stroke-width': 1, opacity: 0.5 });
    if (points.length > 1) {
      chart.path(points.map((p, i) => `${i ? 'L' : 'M'}${n1(X(p.nm))} ${n1(Y(p.o2))}`).join(''), { fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-linejoin': 'round' });
    }
    for (const p of points) {
      chart.circle(X(p.nm), Y(p.o2), 3.3, { fill: C.ink, stroke: C.paper, 'stroke-width': 1.2 });
      if (p.nm === lit) chart.circle(X(p.nm), Y(p.o2), 6.6, { fill: 'none', stroke: C.ink, 'stroke-width': 1.1 });
    }
    const rows = [
      shown.length ? { mark: 'hill', text: `predicted from ${shownWords(shown)}` } : { text: 'no pigment shown' },
      { mark: 'dot', text: points.length ? `oxygen measured, ${points.length} ${points.length === 1 ? 'point' : 'points'}` : 'oxygen measured: none yet', colour: C.ink },
    ];
    key(rows, { X, Y, top: top + 1, markerX, padL, pw, under: shown.length ? [shownAbsorbance, pointsAt] : [pointsAt] });
  }

  function drawChart() {
    const { w, h } = chart.clear().box;
    const narrow = b.narrow;
    const padL = narrow ? 20 : 24;
    const padR = 4;
    const pw = Math.max(60, w - padL - padR);
    const X = (nm) => padL + ((clamp(nm, LO, HI) - LO) / (HI - LO)) * pw;
    const titleH = S.title + 12;
    const h1 = narrow ? 10 : 11;
    const h2 = narrow ? 13 : 14;
    const tickH = S.axis + 7;
    const stripBlock = 8 + h1 + 2 + h2 + 5 + tickH;
    const markerX = X(wavelength);
    const foot = 9; // the lowest mark stands clear of the pane's own edge, and so of the toolbar

    if (!narrow) {
      const gap = 16;
      const free = Math.max(80, h - (titleH + stripBlock + gap + titleH + foot));
      const aH = free * 0.56;
      const bH = free - aH;
      absorption({ X, top: titleH, height: aH, padL, pw, markerX, faintAction: false });
      const sy = titleH + aH + 8;
      strips({ X, y: sy, h1, h2 });
      ticks({ X, y: sy + h1 + 2 + h2 + 5, every: 50 });
      action({ X, top: sy + h1 + 2 + h2 + 5 + tickH + gap + titleH, height: bH, padL, pw, markerX });
    } else {
      const plotH = Math.max(50, h - titleH - stripBlock - foot);
      if (view === 'action') action({ X, top: titleH, height: plotH, padL, pw, markerX });
      else absorption({ X, top: titleH, height: plotH, padL, pw, markerX, faintAction: true });
      const sy = titleH + plotH + 8;
      strips({ X, y: sy, h1, h2 });
      ticks({ X, y: sy + h1 + 2 + h2 + 5, every: 100 });
    }
    chart.focusMark();
  }

  // ---------------------------------------------------------------- the filament

  // One cell's chloroplast: a band wound round the cell, split where it passes behind so the far half
  // can be drawn fainter than the near one.
  function helix(x0, length, cy, amp) {
    const runs = { near: [], far: [] };
    let run = null;
    let side = null;
    const steps = 30;
    const turns = 1.5;
    for (let k = 0; k <= steps; k += 1) {
      const t = k / steps;
      const phase = t * turns * 2 * Math.PI;
      const pt = [x0 + t * length, cy + Math.sin(phase) * amp];
      const now = Math.cos(phase) >= 0 ? 'near' : 'far';
      if (now !== side) {
        if (run) runs[side].push([...run, pt]);
        run = [pt];
        side = now;
      } else run.push(pt);
    }
    if (run) runs[side].push(run);
    const d = (list) => list.filter((r) => r.length > 1).map((r) => r.map(([x, y], i) => `${i ? 'L' : 'M'}${n1(x)} ${n1(y)}`).join('')).join('');
    return { near: d(runs.near), far: d(runs.far) };
  }

  function drawAlga() {
    const { w, h } = alga.clear().box;
    // A pane tall enough for a title and a line of type under the filament gets both; a phone's strip
    // keeps only what the light is doing, in its top corner.
    const roomy = h >= 110;
    const titleH = roomy ? S.title + 9 : S.title + 3;
    if (roomy) alga.text(0, S.title, 'The living alga', { class: 'tb-rt-title', 'font-size': n1(S.title) });
    const o2 = lit === null ? 0 : actionAt(lit);
    alga.text(w, S.title, lit === null ? 'in the dark' : `lit at ${lit} nm`, { anchor: 'end', class: lit === null ? 'ps-note' : 'ps-light', 'font-size': n1(S.title) });
    const footH = roomy ? S.title + 8 : 0;
    if (roomy) {
      const made = o2 < 0.005 ? 'oxygen made: almost none' : `oxygen made: ${f2(o2)} of the most`;
      alga.text(w, h - 3, lit === null ? 'press Measure here to light it' : made, { anchor: 'end', class: lit === null ? 'ps-note' : 'ps-light', fit: [S.title, 7.8], width: w });
    }
    const narrow = !roomy;

    // The filament: a chain of cells, each with a chloroplast wound round it.
    const bodyTop = titleH;
    const bodyBottom = h - footH - 4;
    const cellH = clamp((bodyBottom - bodyTop) * (narrow ? 0.24 : 0.14), 11, 24);
    const cy = bodyTop + (bodyBottom - bodyTop) * (narrow ? 0.52 : 0.5);
    const x0 = 4;
    const x1 = w - 4;
    const n = clamp(Math.round((x1 - x0) / (cellH * 2.7)), 3, 9);
    const L = (x1 - x0) / n;
    const crowdBand = clamp(cellH * 1.1, 9, 24);
    const lightTop = bodyTop + 2;
    const lightBottom = cy - cellH / 2 - crowdBand - 4;
    const showLight = lit !== null && lightBottom - lightTop > 16;

    // The bacteria first, so the filament is drawn over any that touch it. In the dark they are spread
    // through the water; lit, a share of them in proportion to the oxygen gather at the filament.
    const count = Math.round(clamp((w * (bodyBottom - bodyTop)) / 1150, 24, BACTERIA.length));
    const crowd = lit === null ? 0 : 0.05 + 0.9 * o2;
    const rodL = narrow ? 4.2 : 5.2;
    const top = showLight ? lightBottom + 3 : bodyTop + 3;
    for (let i = 0; i < count; i += 1) {
      const bac = BACTERIA[i];
      let x;
      let y;
      let angle;
      if (bac.rank < crowd) {
        x = x0 + 5 + bac.along * (x1 - x0 - 10);
        y = cy + bac.side * (cellH / 2 + 3.5 + bac.near ** 1.5 * crowdBand);
        angle = Math.PI / 2 + bac.tilt * 0.5;
      } else {
        x = 5 + bac.x * (w - 10);
        y = top + bac.y * Math.max(0, bodyBottom - 4 - top);
        if (Math.abs(y - cy) < cellH / 2 + 6) y = cy + (y < cy ? -1 : 1) * (cellH / 2 + 6 + Math.abs(bac.tilt) * 6);
        angle = bac.turn;
      }
      const dx = (Math.cos(angle) * rodL) / 2;
      const dy = (Math.sin(angle) * rodL) / 2;
      alga.line(x - dx, y - dy, x + dx, y + dy, { stroke: C.faint, 'stroke-width': narrow ? 2.4 : 2.8, 'stroke-linecap': 'round' });
    }

    for (let i = 0; i < n; i += 1) {
      const cx = x0 + i * L;
      alga.rect(cx + 0.8, cy - cellH / 2, L - 1.6, cellH, {
        rx: cellH * 0.32, ry: cellH * 0.32,
        fill: `color-mix(in srgb, ${CHLOROPHYLL} 14%, var(--paper))`,
        stroke: `color-mix(in srgb, ${WALL} 55%, var(--ink-soft))`, 'stroke-width': 1.3,
      });
      const band = helix(cx + 3.5, L - 7, cy, cellH * 0.3);
      if (band.far) alga.path(band.far, { fill: 'none', stroke: CHLOROPHYLL, 'stroke-width': n1(cellH * 0.12), opacity: 0.4, 'stroke-linecap': 'round' });
      if (band.near) alga.path(band.near, { fill: 'none', stroke: CHLOROPHYLL, 'stroke-width': n1(cellH * 0.19), 'stroke-linecap': 'round' });
    }

    // The light, as photons on their way down: a wave, drawn longer the redder it is, and an arrowhead.
    if (showLight) {
      const many = clamp(Math.round((x1 - x0) / 44), 3, 9);
      const period = 3 + (lit - 380) * 0.016; // 400 nm, 3.3 px; 700 nm, 8.1 px
      const len = Math.min(lightBottom - lightTop, 36);
      for (let i = 0; i < many; i += 1) {
        const x = x0 + ((i + 0.5) / many) * (x1 - x0);
        const yEnd = lightBottom;
        const yStart = yEnd - len;
        let d = `M${n1(x)} ${n1(yStart)}`;
        for (let y = yStart + 1; y <= yEnd - 4; y += 1) d += `L${n1(x + Math.sin(((y - yStart) / period) * 2 * Math.PI) * 1.9)} ${n1(y)}`;
        alga.path(d, { fill: 'none', stroke: C.soft, 'stroke-width': 1.2, 'stroke-linecap': 'round' });
        alga.path(`M${n1(x - 3)} ${n1(yEnd - 4.5)}L${n1(x + 3)} ${n1(yEnd - 4.5)}L${n1(x)} ${n1(yEnd)}Z`, { fill: C.soft });
      }
    }
  }

  // ---------------------------------------------------------------- the swatch and its two numbers

  function drawSwatch() {
    const { w, h } = swatch.clear().box;
    const narrow = b.narrow;
    const r = clamp(Math.min(h * (narrow ? 0.34 : 0.24), w * 0.12), 14, 38);
    // A table's values belong near their labels: past about 330 px the rows stop reading as rows, so on
    // a pane wider than the unit needs — a tablet held upright gives this one 750 — the disc and its
    // table keep their measure and stand together in the middle of it.
    const gap = narrow ? 16 : 20;
    const measure = Math.min(w - 2 * r - 2 - gap, 330);
    const left = Math.max(0, (w - (2 * r + 2 + gap + measure)) / 2);
    const discX = left + r + 2;
    const tx = discX + r + gap;
    const size = clamp(S.key + 1.2, 9.6, 11.2);
    const table = { title: `Absorbed at ${wavelength} nm`, x: tx, width: Math.max(80, measure), size, titleSize: S.title, minRow: 13, maxRow: 27 };
    const build = (t, level) => {
      const pick = (id, label, value) => (sample === id ? t.sum(label, value) : t.row(label, value));
      pick('extracted', 'Extracted', f2(absorbed('extracted', wavelength)));
      pick('leaf', 'Whole leaf', f2(absorbed('leaf', wavelength)));
      t.rule();
      t.row('Gets through', shownName(SWATCH_NAME[sample]));
      if (level < 1) t.note(sentence());
    };
    // Set at its fullest the table may be shorter than a tall pane — a tablet held upright — and then the
    // unit stands in the middle of the pane rather than at its top over an empty band. Measured on a
    // table that is built and never drawn.
    const whole = swatch.readout({ ...table, y: 0 });
    build(whole, 0);
    const room = h - 9;
    const top = Math.max(0, (room - whole.height(27)) / 2);
    swatch.readout({ ...table, y: top }).fit(room - 2 * top, build, { levels: 2 });
    // The swatch stands beside the three rows it answers, centred on them rather than on the pane, which
    // is read off the rows as drawn: their height is solved by the table to fill the pane.
    const rows = [...swatch.node.querySelectorAll('.tb-rt-key')].map((t) => Number(t.getAttribute('y')));
    const middle = rows.length ? (rows[0] - size * 0.9 + rows[rows.length - 1] + size * 0.4) / 2 : h / 2;
    swatch.circle(discX, clamp(middle, r + 3, h - r - 3), r, { fill: SWATCH[sample], stroke: C.ruleStrong, 'stroke-width': 1 });
  }

  // What the two numbers mean, chosen by the numbers themselves rather than by a band of wavelengths, so
  // that no sentence can stand beside a value it contradicts. Read at every 5 nm in both samples.
  function sentence() {
    const ext = absorbed('extracted', wavelength);
    const mine = absorbed(sample, wavelength);
    if (ext >= 0.9) return 'Almost all of it is caught, extracted or not: this is the band the pigments work in.';
    if (wavelength > 660) {
      return mine >= 0.75
        ? 'Past chlorophyll’s red peak the extract thins out, but the leaf’s scattering still catches most of it.'
        : 'Past chlorophyll’s red peak the absorption falls away fast, and by 700 nm little is caught.';
    }
    if (ext < 0.5 && wavelength >= 495 && wavelength <= 600) {
      return sample === 'extracted'
        ? 'Spread flat, the pigment lets most of this through: green is the band it absorbs least.'
        : 'Bounced about inside the leaf, the same pigment catches most of the green. What escapes is the leaf’s colour.';
    }
    return 'Where the pigment is weak, scattering counts most: the leaf catches more of this than the extract does.';
  }

  // ---------------------------------------------------------------- drawing

  b.onDraw(() => {
    measureType();
    drawChart();
    drawAlga();
    drawSwatch();
  });

  syncControls();

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   scene             'spectrum' — the only scene built; see WHAT IS NOT HERE above
  //   curvesShown       which absorption curves are drawn, in the order chl-a, chl-b, carotenoid
  //   wavelengthNm      where the wavelength slider stands, 400 to 700 in steps of 5
  //   actionPoints      how many wavelengths the reader has measured; 0 at mount and after Reset
  //   actionAt          the oxygen the alga makes at this wavelength, 0 to 1 of its most, whether or not
  //                     it has been measured here
  //   absorbanceAt      the absorbance of the pigments shown, at this wavelength, 0 to 1 of their own
  //                     peak — the outline the action chart sets the points against. With all three
  //                     shown it equals actionAt at every wavelength; with chlorophyll a alone it is
  //                     far below it at 470 and 640 nm, which is the gap
  //   sample            'extracted' | 'leaf'
  //   absorbedFraction  the fraction of the light the chosen sample absorbs at this wavelength: 0.346
  //                     extracted and 0.750 in the leaf, at 550 nm
  //   transmittedName   the colour of daylight after the chosen sample, as a word read off the swatch
  //   t, playing        0 and false: nothing in this scene runs on a clock
  // Nothing here becomes true on its own: every field moves only when the reader moves a control.
  return b.handle();
}
