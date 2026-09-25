// Figure 8.2, `meselson-stahl`: the three schemes, on a switch.
//
// WHAT IT SHOWS. A culture grown on heavy nitrogen, ¹⁵N, and moved to light, ¹⁴N. On the left, sixteen
// molecules of the generation shown and the molecules they were copied from, generation by generation,
// each strand drawn thick if it was made with ¹⁵N and thin if it was made with ¹⁴N: twice the weight, the
// same ink, and named in the key, because an isotope is the same element told apart by weight. Sixteen at
// every generation, so the last column is always the population the tube is spun from and the pane is as
// full at generation 0 as at generation 4. In the middle, the centrifuge tube the DNA of the
// generation shown settles in, a caesium chloride gradient least dense at the top, with each band drawn as
// the dark line an ultraviolet photograph shows on the tube's pale ground, darker the more of the DNA is in
// it. On the right, a table of the bands, and under it, as far as the room allows, what each of the three
// schemes predicts at the same generation and what the chosen scheme predicts at every generation. A switch
// chooses the scheme; the molecules, the tube and the table follow it. With the 1958 data shown, an
// arrowhead beside the tube marks each band that was photographed, and the table adds a column for them. It
// opens at generation 0, semiconservative, with the data hidden: one heavy band.
//
// THE COPYING. Each molecule is two strands of sixteen pieces, each piece ¹⁵N or ¹⁴N, and a generation copies
// every molecule once:
//   - Semiconservative: the strands part and each is the template for a new ¹⁴N partner. [A, B] gives
//     [A, new] and [new, B].
//   - Conservative: the parent stays whole and a wholly new molecule is made beside it. [A, B] gives [A, B]
//     and [new, new].
//   - Dispersive, Delbrück's scheme: every strand of both daughters is a patchwork. In round r (1 to 4),
//     piece i of strand A goes to the daughter numbered by bit r − 1 of i and piece i of strand B to the
//     other daughter, and every piece a daughter did not get is new. Each old piece still faces a new one,
//     and every strand at generation g carries exactly (1/2)^g of the old nitrogen. Four rounds of halving
//     are why there are sixteen pieces.
//
// THE DENSITIES are the 1958 paper's two numbers (Meselson and Stahl, PNAS 44:671) and nothing more precise:
// light DNA at 1.710 g/cm³, and fully ¹⁵N DNA 0.014 denser, at 1.724. A molecule bands at 1.710 + 0.014 ×
// its share of ¹⁵N, so hybrid DNA sits halfway, at 1.717, and dispersive DNA at generation g sits at
// 1.710 + 0.014 × (1/2)^g, one band moving towards light. A band is named by that share: all ¹⁵N is heavy,
// none is light, half is hybrid, and anything else is intermediate. So dispersive DNA at generation 1, every
// molecule half ¹⁵N, makes a hybrid band, as the chapter's table says it does.
//
// HEAT parts the strands, and a single strand bands at its own, higher density. The figure puts a ¹⁴N strand
// at 1.725, a ¹⁵N strand 0.015 above it at 1.740, and a patchwork strand between them by its share of ¹⁵N.
// The 0.015 between the two is the brief's, from the paper's own heating experiment. The 1.725 is this
// figure's choice, stated here because it is one: it is the one number the brief leaves open, and it keeps
// every strand band denser than every molecule's. So heated hybrid DNA gives two bands in equal amounts,
// 0.015 apart; heated dispersive DNA gives one intermediate band; and heated conservative DNA at generation
// 1 also gives heavy and light strands in equal amounts. The heat test tells the dispersive scheme from the
// other two, and it cannot tell the conservative scheme from the semiconservative one.
//
// THE 1958 DATA are the bands at whole generations, with the shares idealised to the halvings the
// photographs agree with: all heavy at 0, all hybrid at 1, half hybrid and half light at 2, a quarter hybrid
// at 3 and an eighth at 4. The paper sampled at fractional generations and read its shares off densitometer
// traces, so these are the values its photographs show at whole generations, not its readings. The heated
// data are for generation 1 only, the hybrid DNA the paper heated: light and heavy strands, half each.
//
// matchesData compares the prediction's bands with the photograph's at the generation shown: the same names,
// densities and shares. ruledOut lists the schemes whose prediction fails at any generation from 1 to the
// one shown. It is computed from the generation and never set by a button: [] at 0, conservative from 1,
// and dispersive as well from 2. Heat changes neither. It is a second test, and the table says what it shows.
//
// The narrow composition (below 800 px), on a stage two wide by three tall. Beside the tube on a phone the
// tree of descendants would fall below legibility, so the tube keeps its full height on the left, the
// molecules of the generation shown stand to its right in a single column (one of each kind, with its
// count), and the table runs beneath both. The scheme switch becomes a stepper that says the same words.

import { C, clamp, el } from './lib/svg.js';
import { bench } from './lib/bench.js';

export const meta = { kind: 'meselson-stahl', title: 'The three schemes, on a switch', needsWebGL: false, aspect: 16 / 9, narrowAspect: 2 / 3 };

const NARROW_W = 800;
const TOL = 1e-9;
const SCHEMES = ['semiconservative', 'conservative', 'dispersive'];
const MAX_GEN = 4;
const SEG = 16;
const LEAVES = 16;
const DUPLEX = Object.freeze({ light: 1.71, heavy: 1.724 });
const STRAND = Object.freeze({ light: 1.725, step: 0.015 });
const RHO_TOP = 1.7;
const RHO_BOTTOM = 1.75;
const W_LIGHT = 1.6;
const W_HEAVY = 3.2;
const OPEN = Object.freeze({ scheme: 'semiconservative', generation: 0, dataShown: false, heated: false });

// ---------------------------------------------------------------- the model

const heavyStrand = () => new Array(SEG).fill(1);
const lightStrand = () => new Array(SEG).fill(0);
const shareOf = (strand) => strand.reduce((n, v) => n + v, 0) / SEG;
const duplexShare = (m) => (shareOf(m[0]) + shareOf(m[1])) / 2;

// Generation k is a list of 2^k molecules, each [strand, strand], each strand SEG pieces of 1 (¹⁵N) or 0.
function lineage(scheme, g) {
  const gens = [[[heavyStrand(), heavyStrand()]]];
  for (let r = 1; r <= g; r += 1) {
    const bit = r - 1;
    const keep = (s, k) => s.map((v, i) => (((i >> bit) & 1) === k ? v : 0));
    const next = [];
    for (const [a, c] of gens[r - 1]) {
      if (scheme === 'semiconservative') next.push([a, lightStrand()], [lightStrand(), c]);
      else if (scheme === 'conservative') next.push([a, c], [lightStrand(), lightStrand()]);
      else next.push([keep(a, 0), keep(c, 1)], [keep(a, 1), keep(c, 0)]);
    }
    gens.push(next);
  }
  return gens;
}

function nameOf(share, single) {
  if (share === 1) return 'heavy';
  if (share === 0) return 'light';
  if (!single && share === 0.5) return 'hybrid';
  return 'intermediate';
}
const densityOf = (share, single) => (single ? STRAND.light + STRAND.step * share : DUPLEX.light + (DUPLEX.heavy - DUPLEX.light) * share);
const band = (share, fraction, single) => ({ name: nameOf(share, single), density: densityOf(share, single), fraction, share });

// One band per share of ¹⁵N, lightest first, which is the tube's order from the top.
function bandsOf(shares, single) {
  const count = new Map();
  for (const s of shares) count.set(s, (count.get(s) || 0) + 1);
  return [...count.keys()].sort((x, y) => x - y).map((s) => band(s, count.get(s) / shares.length, single));
}

function predict(scheme, g) {
  const gens = lineage(scheme, g);
  const mols = gens[g];
  return {
    gens,
    bands: bandsOf(mols.map(duplexShare), false),
    strands: bandsOf(mols.flatMap((m) => [shareOf(m[0]), shareOf(m[1])]), true),
  };
}

const PREDICTED = Object.freeze(Object.fromEntries(SCHEMES.map((s) => [s, Array.from({ length: MAX_GEN + 1 }, (_, g) => predict(s, g))])));

const OBSERVED = Object.freeze([
  [band(1, 1, false)],
  [band(0.5, 1, false)],
  [band(0, 1 / 2, false), band(0.5, 1 / 2, false)],
  [band(0, 3 / 4, false), band(0.5, 1 / 4, false)],
  [band(0, 7 / 8, false), band(0.5, 1 / 8, false)],
]);
const OBSERVED_HEATED = Object.freeze({ 1: [band(0, 1 / 2, true), band(1, 1 / 2, true)] });

const sameBands = (p, q) => p.length === q.length
  && p.every((x, i) => x.name === q[i].name && Math.abs(x.density - q[i].density) < TOL && Math.abs(x.fraction - q[i].fraction) < TOL);

// The generation at which each scheme's prediction first parts from the photograph, or null.
const FIRST_FAIL = Object.freeze(Object.fromEntries(SCHEMES.map((s) => {
  for (let g = 1; g <= MAX_GEN; g += 1) if (!sameBands(PREDICTED[s][g].bands, OBSERVED[g])) return [s, g];
  return [s, null];
})));
const ruledOutAt = (g) => SCHEMES.filter((s) => FIRST_FAIL[s] !== null && FIRST_FAIL[s] <= g);

// Predicted and observed bands side by side, one entry per density, lightest first.
function union(pred, obs) {
  const out = pred.map((x) => ({ density: x.density, name: x.name, p: x, o: null }));
  for (const o of obs || []) {
    const hit = out.find((u) => Math.abs(u.density - o.density) < TOL);
    if (hit) hit.o = o;
    else out.push({ density: o.density, name: o.name, p: null, o });
  }
  return out.sort((x, y) => x.density - y.density);
}

// ---------------------------------------------------------------- words

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const n2 = (v) => Number(v).toFixed(2);
// Three decimals, half up: dispersive DNA at generation 2 is 1.7135 and shows as 1.714.
const dens3 = (x) => (Math.round(x * 1000 + 1e-7) / 1000).toFixed(3);
function fracText(f) {
  if (Math.abs(f - 1) < TOL) return 'all';
  let n = Math.round(f * 16);
  let d = 16;
  while (n > 0 && n % 2 === 0 && d > 1) {
    n /= 2;
    d /= 2;
  }
  return `${n}/${d}`;
}
const FRACTION_WORDS = { 1: 'all', 0.5: 'half', 0.25: 'a quarter', 0.75: 'three-quarters', 0.125: 'an eighth', 0.875: 'seven-eighths', 0.0625: 'a sixteenth', 0.9375: 'fifteen-sixteenths' };
const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four'];
function joinAnd(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}
const bandWord = (n) => `${COUNT_WORDS[n] ?? n} band${n === 1 ? '' : 's'}`;
const namesOf = (bands) => joinAnd(bands.map((x) => x.name));
const bandList = (bands) => bands.map((x) => (Math.abs(x.fraction - 1) < TOL ? x.name : `${x.name} ${fracText(x.fraction)}`)).join(', ');
const spoken = (bands) => joinAnd(bands.map((x) => `${x.name} at ${dens3(x.density)}, ${FRACTION_WORDS[x.fraction] ?? fracText(x.fraction)}`));

// ---------------------------------------------------------------- superscripts

// ¹⁵N and ¹⁴N are drawn as raised digits rather than as the superscript characters, which the book's
// interface face may not carry: a missing glyph would fall back to another font in the middle of a label.
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUP_RUN = /([⁰¹²³⁴-⁹]+)/;
function setSuperscripts(svg) {
  for (const t of svg.querySelectorAll('text')) {
    const s = t.textContent;
    if (!SUP_RUN.test(s)) continue;
    const fs = parseFloat(t.getAttribute('font-size')) || 10;
    const rise = +(fs * 0.36).toFixed(2);
    t.textContent = '';
    let up = false;
    for (const part of s.split(SUP_RUN)) {
      if (!part) continue;
      const isSup = SUP_RUN.test(part);
      t.append(el('tspan', {
        text: isSup ? [...part].map((ch) => SUP_DIGITS.indexOf(ch)).join('') : part,
        'font-size': isSup ? +(fs * 0.68).toFixed(2) : null,
        dy: isSup && !up ? -rise : !isSup && up ? rise : null,
      }));
      up = isSup;
    }
  }
}

// ---------------------------------------------------------------- drawing: a molecule

// One strand, piece by piece: a ¹⁵N piece at twice the weight of a ¹⁴N one, runs of one kind drawn as one line.
function strandLine(p, x0, x1, y, segs, colour) {
  const dx = (x1 - x0) / SEG;
  let i = 0;
  while (i < SEG) {
    let j = i;
    while (j < SEG && segs[j] === segs[i]) j += 1;
    p.line(x0 + i * dx, y, x0 + j * dx, y, { stroke: colour, 'stroke-width': segs[i] ? W_HEAVY : W_LIGHT });
    i = j;
  }
}

// A double helix drawn flat, as the 1958 paper drew its subunits: two strands with the base pairs between
// them as hairlines. Parted by heat, the strands stand further apart, a little out of register, with nothing
// between them.
function drawMolecule(p, cx, cy, len, sep, m, { colour = C.ink, parted = false, gap = sep } = {}) {
  const x0 = cx - len / 2;
  const x1 = cx + len / 2;
  if (parted) {
    strandLine(p, x0 - 2, x1 - 2, cy - gap / 2, m[0], colour);
    strandLine(p, x0 + 2, x1 + 2, cy + gap / 2, m[1], colour);
    return;
  }
  const half = sep / 2;
  const inner = half - W_HEAVY / 2 - 0.8;
  if (inner > 0.8) {
    const n = Math.max(4, Math.round(len / 7));
    for (let k = 0; k < n; k += 1) {
      const x = x0 + ((k + 0.5) / n) * len;
      p.line(x, cy - inner, x, cy + inner, { stroke: C.rule, 'stroke-width': 1 });
    }
  }
  strandLine(p, x0, x1, cy - half, m[0], colour);
  strandLine(p, x0, x1, cy + half, m[1], colour);
}

// Labels down one side, pushed apart where their bands are close, and kept inside [lo, hi].
function spread(items, gap, lo, hi) {
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.at = it.y;
  for (let pass = 0; pass < 40; pass += 1) {
    let moved = false;
    for (let i = 1; i < items.length; i += 1) {
      const over = items[i - 1].at + gap - items[i].at;
      if (over > 0.01) {
        items[i - 1].at -= over / 2;
        items[i].at += over / 2;
        moved = true;
      }
    }
    for (const it of items) it.at = clamp(it.at, lo, hi);
    if (!moved) break;
  }
}

// ---------------------------------------------------------------- styles

const CSS = (sel) => `
${sel} .ms-num { font-variant-numeric: lining-nums tabular-nums; }
${sel} .ms-gen .tb-val { min-width: 1.1rem; text-align: center; }
${sel}.is-narrow .ms-scheme .tb-val { min-width: 7.6rem; text-align: center; }
${sel}.is-narrow .ms-seg { display: none; }
`;

const SCHEME_ARIA = {
  semiconservative: 'each new molecule keeps one old strand',
  conservative: 'the old molecule stays whole beside a wholly new one',
  dispersive: 'every strand a patchwork of old pieces and new',
};
const MOL_ARIA = 'Sixteen molecules of the generation shown and the molecules they were copied from, back to the culture grown on nitrogen-15, each strand drawn thick if it was made with nitrogen-15 and thin if with nitrogen-14. The left and right arrows step the generation, S changes the scheme, D shows the 1958 data, H heats the DNA and Home resets.';

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 802 });

  // ---- state ----
  let scheme = OPEN.scheme;
  let gen = OPEN.generation;
  let dataShown = OPEN.dataShown;
  let heated = OPEN.heated;
  let syncing = false;

  // ---- panes: the keyboard's first, so it is the stage's first focusable thing ----
  const mol = b.pane('molecules', { as: 'svg', focus: true, aria: MOL_ARIA });
  const tube = b.pane('tube', { as: 'svg', aria: 'The centrifuge tube' });
  const table = b.pane('table', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 41fr) minmax(0, 20fr) minmax(0, 39fr)',
      rows: 'minmax(0, 1fr)',
      at: { molecules: [1, 1], tube: [2, 1], table: [3, 1] },
    },
    narrow: {
      columns: 'minmax(0, 56fr) minmax(0, 44fr)',
      rows: 'minmax(0, 54fr) minmax(0, 46fr)',
      rowGap: 'var(--space-1)',
      at: { tube: [1, 1], molecules: [2, 1], table: ['1 / 3', 2] },
    },
  });

  // ---- controls: the scheme, then the generation, then what to show and do ----
  const schemeCtl = b.choice('Scheme', SCHEMES.map((s) => ({ id: s, label: cap(s), aria: `${cap(s)}, ${SCHEME_ARIA[s]}` })), (id) => {
    if (syncing) return;
    setScheme(id);
  }, { segmented: true, value: OPEN.scheme, only: 'wide' });
  schemeCtl.strip.classList.add('ms-seg');
  // At a phone's width three segments would take a row each; one stepper takes one, and says the same words.
  const schemeStep = b.stepper('Scheme', {
    min: 0, max: SCHEMES.length - 1, step: 1, value: SCHEMES.indexOf(OPEN.scheme), only: 'narrow',
    steps: { down: { glyph: '‹', name: 'previous scheme' }, up: { glyph: '›', name: 'next scheme' } },
    format: (v) => cap(SCHEMES[clamp(Math.round(v), 0, SCHEMES.length - 1)]),
    valueText: (v) => cap(SCHEMES[clamp(Math.round(v), 0, SCHEMES.length - 1)]),
    onInput: (v) => {
      if (syncing) return;
      setScheme(SCHEMES[clamp(Math.round(v), 0, SCHEMES.length - 1)]);
    },
  });
  schemeStep.node.classList.add('ms-scheme');
  b.divide();
  const genCtl = b.stepper('Generation', {
    min: 0, max: MAX_GEN, step: 1, value: OPEN.generation,
    format: (v) => String(Math.round(v)),
    valueText: (v) => `generation ${Math.round(v)}`,
    onInput: (v) => {
      gen = clamp(Math.round(v), 0, MAX_GEN);
      if (syncing) return;
      afterChange();
    },
  });
  genCtl.node.classList.add('ms-gen');
  b.divide();
  const dataCtl = b.toggle('Show the 1958 data', (on) => {
    dataShown = on;
    if (syncing) return;
    afterChange();
  }, { pressed: OPEN.dataShown, aria: 'Show the 1958 data, the bands Meselson and Stahl photographed' });
  const heatCtl = b.toggle('Heat', (on) => {
    heated = on;
    if (syncing) return;
    afterChange();
  }, { pressed: OPEN.heated, aria: 'Heat, part the two strands of every molecule in this generation' });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the figure back as it opened' });

  function afterChange() {
    b.redraw();
    b.announce();
  }

  function setScheme(id) {
    scheme = id;
    syncing = true;
    schemeCtl.set(id, { quiet: true });
    schemeStep.set(SCHEMES.indexOf(id));
    syncing = false;
    afterChange();
  }

  function resetAll() {
    syncing = true;
    scheme = OPEN.scheme;
    gen = OPEN.generation;
    dataShown = OPEN.dataShown;
    heated = OPEN.heated;
    schemeCtl.set(scheme, { quiet: true });
    schemeStep.set(SCHEMES.indexOf(scheme));
    genCtl.set(gen);
    dataCtl.set(dataShown, { quiet: true });
    heatCtl.set(heated, { quiet: true });
    syncing = false;
    b.restart();
    b.announce();
  }

  const stepGen = (dir) => genCtl.set(clamp(gen + dir, 0, MAX_GEN));
  const nextScheme = () => setScheme(SCHEMES[(SCHEMES.indexOf(scheme) + 1) % SCHEMES.length]);

  b.keys({
    ArrowRight: () => stepGen(1),
    ArrowUp: () => stepGen(1),
    ArrowLeft: () => stepGen(-1),
    ArrowDown: () => stepGen(-1),
    0: () => genCtl.set(0),
    1: () => genCtl.set(1),
    2: () => genCtl.set(2),
    3: () => genCtl.set(3),
    4: () => genCtl.set(4),
    s: nextScheme,
    S: nextScheme,
    d: () => dataCtl.toggle(),
    D: () => dataCtl.toggle(),
    h: () => heatCtl.toggle(),
    H: () => heatCtl.toggle(),
    Home: () => resetAll(),
  });

  // Nothing here runs on its own: the clock is only the frame's, and every change is the reader's.
  b.clock({ step: 1 / 60, advance: () => {}, restart: () => {} });

  // ---- what describe() reports ----
  const pub = (bands) => bands.map((x) => ({ name: x.name, densityGcm3: Number(x.density.toFixed(7)), fraction: Number(x.fraction.toFixed(7)) }));

  b.onDescribe(() => {
    const pr = PREDICTED[scheme][gen];
    const obsHeated = OBSERVED_HEATED[gen] ?? null;
    return {
      scheme,
      generation: gen,
      bands: pub(pr.bands),
      bandCount: pr.bands.length,
      dataShown,
      observedBands: pub(OBSERVED[gen]),
      matchesData: sameBands(pr.bands, OBSERVED[gen]),
      ruledOut: ruledOutAt(gen),
      heated,
      strandBands: heated ? pub(pr.strands) : [],
      observedStrandBands: heated && obsHeated ? pub(obsHeated) : [],
      strandsMatchData: heated && obsHeated ? sameBands(pr.strands, obsHeated) : null,
      t: Number(b.time.toFixed(3)),
    };
  });

  b.onAnnounce((d) => {
    const pr = PREDICTED[d.scheme][d.generation];
    const parts = [`${cap(d.scheme)}, generation ${d.generation}: ${bandWord(pr.bands.length)}, ${spoken(pr.bands)}.`];
    // Each prediction is followed by what 1958 found for it, so that "this" can only mean the bands: said
    // after the heated strands, it told a listener that the dispersive scheme's one heated band was found.
    if (d.dataShown) parts.push(d.matchesData ? 'This is what was photographed in 1958.' : `The 1958 photograph shows ${bandWord(OBSERVED[d.generation].length)}, ${spoken(OBSERVED[d.generation])}.`);
    if (d.heated) {
      parts.push(`Heated, the strands make ${bandWord(pr.strands.length)}, ${spoken(pr.strands)}.`);
      const obsHeated = OBSERVED_HEATED[d.generation];
      if (d.dataShown && obsHeated) parts.push(d.strandsMatchData ? 'The 1958 heated DNA gave the same.' : `The 1958 heated DNA gave ${bandWord(obsHeated.length)}, ${spoken(obsHeated)}, so heat rules this scheme out.`);
    }
    if (d.dataShown) parts.push(`Ruled out by the bands so far: ${d.ruledOut.length ? joinAnd(d.ruledOut) : 'none'}.`);
    return parts.join(' ');
  });

  // ---------------------------------------------------------------- drawing: the descendants, wide

  function drawTree() {
    const p = mol;
    const { w, h: hh } = p.box;
    const gens = PREDICTED[scheme][gen].gens;
    // Sixteen molecules of the generation shown, always, and the ones they were copied from: at
    // generation g they are the descendants of 16 / 2^g molecules of the heavy culture, each lineage the
    // same, so the last column is the population and the columns before it are its history.
    const founders = LEAVES / 2 ** gen;
    const cols = gen + 1;
    // The pane holds the keyboard, so its corners carry the focus brackets: nothing is drawn there.
    const M = 8;
    const top = 40;
    const bottom = hh - 32;
    const colW = (w - 2 * M) / cols;
    const len = clamp(colW * 0.62, 30, 200);
    const pitch = Math.max(4, (bottom - top) / LEAVES);
    const sep = clamp(pitch * 0.34, 5, 13);
    const xAt = (k) => M + (k + 0.5) * colW;
    const yAt = (k, j) => top + (j + 0.5) * 2 ** (gen - k) * pitch;
    const molAt = (k, j) => gens[k][j % 2 ** k];

    for (let k = 0; k <= gen; k += 1) {
      const now = k === gen;
      const colour = now ? C.ink : C.soft;
      const head = { anchor: 'middle', fill: colour, 'font-weight': 600, class: 'ms-num' };
      if (!p.text(xAt(k), 16, `Generation ${k}`, { ...head, fit: [10.5, 9], width: colW - 6 })) p.text(xAt(k), 16, String(k), { ...head, 'font-size': 10.5 });
      const medium = k === 0 ? 'grown on ¹⁵N' : 'on ¹⁴N';
      const sub = { anchor: 'middle', fill: C.soft, fit: [9.5, 8.5], width: colW - 6 };
      if (!(now && heated && p.text(xAt(k), 30, `${medium}, heated`, sub))) {
        if (now && heated) p.text(xAt(k), 30, 'heated', { anchor: 'middle', fill: C.soft, 'font-size': 9.5 });
        else p.text(xAt(k), 30, medium, sub);
      }
    }

    for (let k = 0; k < gen; k += 1) {
      for (let j = 0; j < founders * 2 ** k; j += 1) {
        const x1 = xAt(k) + len / 2 + 4;
        const x2 = xAt(k + 1) - len / 2 - 4;
        const xm = (x1 + x2) / 2;
        p.path(`M${n2(x1)} ${n2(yAt(k, j))} H${n2(xm)} M${n2(x2)} ${n2(yAt(k + 1, 2 * j))} H${n2(xm)} V${n2(yAt(k + 1, 2 * j + 1))} H${n2(x2)}`, {
          fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1,
        });
      }
    }
    for (let k = 0; k <= gen; k += 1) {
      const now = k === gen;
      for (let j = 0; j < founders * 2 ** k; j += 1) {
        drawMolecule(p, xAt(k), yAt(k, j), len, sep, molAt(k, j), {
          colour: now ? C.ink : C.soft,
          parted: now && heated,
          gap: Math.min(pitch * 0.5, sep * 2.4),
        });
      }
    }

    const ky = hh - 12;
    p.line(M, ky - 3.5, M + 22, ky - 3.5, { stroke: C.ink, 'stroke-width': W_HEAVY });
    p.text(M + 28, ky, '¹⁵N strand', { 'font-size': 10, fill: C.soft });
    p.line(M + 91, ky - 3.5, M + 113, ky - 3.5, { stroke: C.ink, 'stroke-width': W_LIGHT });
    p.text(M + 119, ky, '¹⁴N strand', { 'font-size': 10, fill: C.soft });
    const whole = { anchor: 'end', fit: [10, 8.5], width: w - 2 * M - 180, fill: C.soft, class: 'ms-num' };
    if (!p.text(w - M, ky, gen === 0 ? `${LEAVES} molecules of the culture` : `${LEAVES} molecules and those they came from`, whole)) {
      p.text(w - M, ky, `${LEAVES} molecules`, whole);
    }
  }

  // ---------------------------------------------------------------- drawing: the generation shown, narrow

  function drawGroups() {
    const p = mol;
    const { w, h: hh } = p.box;
    // The same sixteen molecules the wide tree ends in, one drawn for each kind, with how many there are.
    const founders = LEAVES / 2 ** gen;
    const mols = PREDICTED[scheme][gen].gens[gen];
    const items = heated ? mols.flatMap((m) => [m[0], m[1]]) : mols;
    const shareFn = heated ? shareOf : duplexShare;
    const byShare = new Map();
    for (const it of items) {
      const s = shareFn(it);
      if (!byShare.has(s)) byShare.set(s, { share: s, count: 0, sample: it });
      byShare.get(s).count += founders;
    }
    const groups = [...byShare.values()].sort((x, y) => x.share - y.share);

    const n = items.length * founders;
    // Clear of the focus brackets in the pane's corners, as in the wide tree.
    const M = 8;
    p.text(M, 16, heated ? `${n} strands` : `${n} molecules`, { 'font-size': 11, 'font-weight': 600, fill: C.ink, class: 'ms-num' });
    p.text(M, 30, heated ? 'parted by heat' : gen === 0 ? 'grown on ¹⁵N' : `generation ${gen}, on ¹⁴N`, { fit: [9.5, 8.5], width: w - M, fill: C.soft, class: 'ms-num' });

    const top = 40;
    const bottom = hh - 38;
    const slot = Math.min(64, (bottom - top) / groups.length);
    const y0 = top + ((bottom - top) - slot * groups.length) / 2;
    const gx = M + 30;
    const len = clamp(w - gx - M, 40, 110);
    groups.forEach((g, i) => {
      const cy = y0 + (i + 0.4) * slot;
      p.text(M, cy + 4, `×${g.count}`, { 'font-size': 10.5, 'font-weight': 600, fill: C.ink, class: 'ms-num' });
      if (heated) strandLine(p, gx, gx + len, cy, g.sample, C.ink);
      else drawMolecule(p, gx + len / 2, cy, len, 11, g.sample, { colour: C.ink });
      p.text(gx, cy + (heated ? 15 : 20), nameOf(g.share, heated), { fit: [9.5, 8.5], width: w - gx, fill: C.soft });
    });

    const ky = hh - 22;
    p.line(M, ky - 3.5, M + 18, ky - 3.5, { stroke: C.ink, 'stroke-width': W_HEAVY });
    p.text(M + 24, ky, '¹⁵N strand', { fit: [9.5, 8.5], width: w - M - 24, fill: C.soft });
    p.line(M, ky + 10.5, M + 18, ky + 10.5, { stroke: C.ink, 'stroke-width': W_LIGHT });
    p.text(M + 24, ky + 14, '¹⁴N strand', { fit: [9.5, 8.5], width: w - M - 24, fill: C.soft });
  }

  // ---------------------------------------------------------------- drawing: the tube

  function drawTube() {
    const p = tube;
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const pr = PREDICTED[scheme][gen];
    const shown = heated ? pr.strands : pr.bands;
    const obs = dataShown ? (heated ? OBSERVED_HEATED[gen] ?? null : OBSERVED[gen]) : null;

    p.text(0, 13, heated ? `Generation ${gen}, heated` : `Generation ${gen}`, { fit: [11, 9], width: w, fill: C.ink, 'font-weight': 600, class: 'ms-num' });
    p.text(0, 28, 'Density, g/cm³', { fit: [9.5, 8.5], width: w, fill: C.soft });

    const scaleR = 25;
    const tickA = scaleR + 3;
    const tickB = scaleR + 8;
    const tubeW = narrow ? 32 : 40;
    const xl = tickB + 10;
    const xr = xl + tubeW;
    const labelX = xr + 13;
    const yRim = 38;
    const yBot = hh - 6 - (dataShown ? 24 : 0);
    const r = tubeW / 2;
    const gTop = yRim + 14;
    const gBot = Math.max(gTop + 40, yBot - r - 10);
    const yOf = (rho) => gTop + ((rho - RHO_TOP) / (RHO_BOTTOM - RHO_TOP)) * (gBot - gTop);

    for (let k = 0; k <= 10; k += 1) {
      const rho = RHO_TOP + k * 0.005;
      const y = yOf(rho);
      const major = k % 2 === 0;
      p.line(major ? tickA : tickA + 2.5, y, tickB, y, { stroke: C.soft, 'stroke-width': 1 });
      if (major) p.text(scaleR, y + 3.3, rho.toFixed(2), { anchor: 'end', 'font-size': 9.5, fill: C.soft, class: 'ms-num' });
    }

    const outline = `M${n2(xl)} ${n2(yRim)} V${n2(yBot - r)} A${n2(r)} ${n2(r)} 0 0 0 ${n2(xr)} ${n2(yBot - r)} V${n2(yRim)}`;
    p.path(`${outline} Z`, { fill: C.paper3, stroke: 'none' });
    // Each band as an ultraviolet photograph shows one: a dark line with a soft edge, darker the more DNA.
    for (const bd of shown) {
      const y = yOf(bd.density);
      const a = 0.3 + 0.65 * bd.fraction;
      p.rect(xl + 1.5, y - 4.5, tubeW - 3, 9, { fill: C.ink, 'fill-opacity': (a * 0.2).toFixed(3) });
      p.rect(xl + 1.5, y - 1.75, tubeW - 3, 3.5, { fill: C.ink, 'fill-opacity': a.toFixed(3) });
    }
    p.path(outline, { fill: 'none', stroke: C.soft, 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    p.line(xl - 4, yRim, xl, yRim, { stroke: C.soft, 'stroke-width': 1.2 });
    p.line(xr, yRim, xr + 4, yRim, { stroke: C.soft, 'stroke-width': 1.2 });

    // A photographed band is marked on the side its label is on: on the other, the mark would run into
    // the tick of the same density.
    const arrow = (x, y, dir) => p.path(`M${n2(x)} ${n2(y - 3.6)} L${n2(x + dir * 6)} ${n2(y)} L${n2(x)} ${n2(y + 3.6)} Z`, { fill: C.ink });
    for (const o of obs ?? []) arrow(xr + 8, yOf(o.density), -1);

    const labels = shown.map((bd) => ({ y: yOf(bd.density), text: bd.name, colour: C.ink, weight: 600 }));
    for (const o of obs ?? []) {
      if (!shown.some((bd) => Math.abs(bd.density - o.density) < TOL)) labels.push({ y: yOf(o.density), text: o.name, colour: C.soft, weight: 500 });
    }
    spread(labels, 12.5, gTop - 6, gBot + 6);
    for (const lb of labels) {
      if (Math.abs(lb.at - lb.y) > 0.6) p.line(xr + 9, lb.y, labelX - 2, lb.at, { stroke: C.ruleStrong, 'stroke-width': 1 });
      p.text(labelX, lb.at + 3.6, lb.text, { fit: [10.5, 9], width: w - labelX, fill: lb.colour, 'font-weight': lb.weight });
    }

    if (dataShown) {
      const ly = hh - 8;
      arrow(6, ly - 3.5, -1);
      p.text(12, ly, obs ? 'photographed in 1958' : 'heated in 1958: generation 1', { fit: [9.5, 8.5], width: w - 12, fill: C.soft });
    }

    const what = `${bandWord(shown.length)}, ${spoken(shown)}`;
    const seen = obs ? ` The 1958 photograph shows ${bandWord(obs.length)}, ${spoken(obs)}.` : '';
    p.node.setAttribute('aria-label', `The centrifuge tube at generation ${gen}${heated ? ', heated' : ''}, densities in grams per cubic centimetre: ${what}.${seen}`);
  }

  // ---------------------------------------------------------------- drawing: the table

  function drawTable() {
    const p = table;
    const { w, h: hh } = p.box;
    const narrow = b.narrow;
    const pr = PREDICTED[scheme][gen];
    const obs = OBSERVED[gen];
    const obsHeated = OBSERVED_HEATED[gen] ?? null;
    const ruled = ruledOutAt(gen);
    const size = narrow ? 10 : 10.6;
    const titleSize = narrow ? 9 : 9.4;
    // The 1958 column, only while some row it would stand beside was measured: heated, only generation 1
    // was, and a table cut down to the strands elsewhere would carry an empty column.
    const with1958 = (level) => dataShown && (!heated || Boolean(obsHeated) || level < 1);
    const columnsAt = (level) => (with1958(level) ? ['Density', 'Share', '1958'] : ['Density', 'Share']);
    const title = `${cap(scheme)}, generation ${gen}`;

    const rows = (r, pred, observed, single, col) => {
      for (const u of union(pred, observed)) {
        const vals = [dens3(u.density), u.p ? fracText(u.p.fraction) : '—'];
        if (col) vals.push(observed ? (u.o ? fracText(u.o.fraction) : '—') : '');
        const bad = Boolean(observed) && !(u.p && u.o && Math.abs(u.p.fraction - u.o.fraction) < TOL);
        r.row(single ? `${cap(u.name)} strands` : cap(u.name), vals, bad ? { accent: C.coralText } : {});
      }
    };
    const note = (r, n) => {
      if (n) r.note(n.text, n.accent ? { accent: n.accent } : {});
    };
    const duplexNote = () => {
      if (!dataShown) return { text: 'Show the 1958 data to compare this prediction with the photographs.' };
      if (gen === 0) return { text: 'All three schemes predict this one heavy band, and it is the band photographed.', accent: C.ink };
      if (sameBands(pr.bands, obs)) return { text: `This is what was photographed at generation ${gen}.`, accent: C.ink };
      return { text: `${cap(scheme)} copying predicts ${bandWord(pr.bands.length)}, ${namesOf(pr.bands)}; the photograph shows ${COUNT_WORDS[obs.length]}, ${namesOf(obs)}.`, accent: C.coralText };
    };
    const ruledNote = () => ({
      text: `Ruled out by the bands so far: ${ruled.length ? joinAnd(ruled.map((s) => `${s} at generation ${FIRST_FAIL[s]}`)) : 'none'}.`,
      accent: C.ink,
    });
    // Narrow, two of these sentences have a phone's wording, a line shorter at a 360 px stage, so that a
    // 360 px phone gives up no more of the heated table than a 390 px one: without them it lost the bands
    // before heating at generation 1, and the dispersive scheme's sentence on what heat does.
    const heatNote = () => {
      if (gen === 0) return { text: 'Heat parts each molecule into its two strands. All are ¹⁵N, and a single strand bands denser than the molecule it came from.' };
      if (scheme === 'dispersive') return { text: 'Heat parts the strands, but each is a patchwork of ¹⁵N and ¹⁴N pieces, so all of them band together.' };
      if (narrow) return { text: 'Heat parts the strands: ¹⁵N strands band at 1.740, ¹⁴N at 1.725.' };
      return { text: 'Heat parts the strands, and each bands by its own nitrogen: ¹⁵N strands at 1.740, ¹⁴N strands at 1.725.' };
    };
    const heatDataNote = () => {
      if (!dataShown) return null;
      if (!obsHeated) return { text: 'The 1958 heating experiment used the hybrid DNA of generation 1: step there to compare.' };
      if (sameBands(pr.strands, obsHeated)) {
        return scheme === 'conservative'
          ? { text: 'The 1958 heated DNA gave these two bands too, so heat cannot tell conservative copying from semiconservative.', accent: C.ink }
          : { text: 'In 1958 the heated hybrid DNA gave these two bands, in equal amounts.', accent: C.ink };
      }
      // Reached only by the dispersive scheme at generation 1: heated data exist only there, and the other
      // two schemes predict the two bands the data show. `ruledOut` stays the bands' verdict, and says so.
      if (narrow) return { text: 'The 1958 heated hybrid DNA gave two bands, light and heavy, not one: each strand is wholly ¹⁵N or wholly ¹⁴N. Heat rules dispersive copying out at generation 1, a generation before the bands do.', accent: C.coralText };
      return { text: 'The 1958 heated DNA gave two bands, light and heavy, where dispersive copying predicts one: the hybrid band is made of a wholly heavy part and a wholly light one, not two patchworks. Heat rules the dispersive scheme out at generation 1, a generation before the bands alone do.', accent: C.coralText };
    };

    // The table of this generation's bands. Level 0 is everything. Heated, 1 gives up the bands before
    // heating, 2 the schemes ruled out (heat changes none of them), and 3 the sentence on what heat does,
    // which is the last thing to go because it is the reason the strands band where they do.
    const build = (r, level) => {
      const col = with1958(level);
      if (heated) {
        r.head('Heated: single strands');
        rows(r, pr.strands, dataShown ? obsHeated : null, true, col);
        if (level < 3) note(r, heatNote());
        note(r, heatDataNote());
        if (level < 1) {
          r.head('Before heating');
          rows(r, pr.bands, dataShown ? obs : null, false, col);
          note(r, duplexNote());
        } else if (!dataShown) note(r, duplexNote());
        if (dataShown && level < 2) note(r, ruledNote());
      } else {
        rows(r, pr.bands, dataShown ? obs : null, false, col);
        note(r, duplexNote());
        if (dataShown) note(r, ruledNote());
      }
      r.rule();
    };
    // Under it, what each scheme predicts at this generation, so the switch can be read at a glance; and
    // what this scheme predicts at every generation, so the stepper can. The row being shown is in ink and
    // the others soft; coral is a prediction the photograph contradicts, once the data are shown.
    const heatedTag = heated ? ', heated' : '';
    const EXTRAS = {
      schemes: {
        title: `Each scheme${heatedTag}, generation ${gen}`,
        build: (r) => {
          const obsX = heated ? obsHeated : obs;
          for (const s of SCHEMES) {
            const bands = heated ? PREDICTED[s][gen].strands : PREDICTED[s][gen].bands;
            const bad = dataShown && obsX && !sameBands(bands, obsX);
            r.row(cap(s), bandList(bands), { accent: bad ? C.coralText : s === scheme ? undefined : C.soft });
          }
          if (dataShown && obsX) r.row('Photographed, 1958', bandList(obsX));
        },
      },
      history: {
        title: `${cap(scheme)}${heatedTag}, every generation`,
        build: (r) => {
          for (let g = 0; g <= MAX_GEN; g += 1) {
            const bands = heated ? PREDICTED[scheme][g].strands : PREDICTED[scheme][g].bands;
            const obsX = heated ? OBSERVED_HEATED[g] ?? null : OBSERVED[g];
            const bad = dataShown && obsX && !sameBands(bands, obsX);
            r.row(`Generation ${g}`, bandList(bands), { accent: bad ? C.coralText : g === gen ? undefined : C.soft });
          }
        },
      },
    };
    // Each plan gives up one more thing than the one before it, the summaries first.
    const PLANS = [
      { extras: ['schemes', 'history'], level: 0 },
      { extras: ['schemes'], level: 0 },
      { extras: [], level: 0 },
      { extras: [], level: 1 },
      { extras: [], level: 2 },
      { extras: [], level: 3 },
    ];
    const TOP = 2;
    const H = hh - TOP - 3;
    const GAP = 18;
    p.clear();
    for (let i = 0; i < PLANS.length; i += 1) {
      const plan = PLANS[i];
      const parts = [
        (y) => {
          const r = p.readout({ title, columns: columnsAt(plan.level), x: 0, y, width: w, size, titleSize });
          build(r, plan.level);
          return r;
        },
        ...plan.extras.map((k) => (y) => {
          const r = p.readout({ title: EXTRAS[k].title, columns: null, x: 0, y, width: w, size, titleSize });
          EXTRAS[k].build(r);
          return r;
        }),
      ];
      const total = (rh) => parts.reduce((s, make) => s + make(0).height(rh), 0) + GAP * (parts.length - 1);
      // A summary is only worth its room at a row height that still reads as a table rather than a list.
      const least = plan.extras.length ? (narrow ? 17 : 19) : 14;
      if (i < PLANS.length - 1 && total(least) > H) continue;
      if (parts.length === 1) {
        parts[0](TOP).fill(H);
        return;
      }
      // One row height for all of them, the largest that fills the column, so they read as one table.
      let lo = least;
      let hi = 26;
      for (let k = 0; k < 30; k += 1) {
        const mid = (lo + hi) / 2;
        if (total(mid) <= H) lo = mid;
        else hi = mid;
      }
      let y = TOP;
      for (const make of parts) y = make(y).draw(lo, TOP + H - y) + GAP;
      return;
    }
  }

  // ---------------------------------------------------------------- drawing

  b.onDraw(() => {
    mol.clear();
    tube.clear();
    if (b.narrow) drawGroups();
    else drawTree();
    drawTube();
    drawTable();
    mol.focusMark();
    for (const p of [mol, tube, table]) setSuperscripts(p.node);
  });

  // describe() reports, on top of the frame's id/kind/number/state and the bench's `layout`:
  //   scheme               'semiconservative' | 'conservative' | 'dispersive'
  //   generation           0 to 4, generations on ¹⁴N
  //   bands                [{ name, densityGcm3, fraction }], the molecules' bands the scheme predicts, lightest
  //                        first; name is 'heavy' | 'hybrid' | 'light' | 'intermediate'; fraction is the share
  //                        of the DNA; densities exact, to seven decimals
  //   bandCount            bands.length
  //   dataShown            whether the 1958 bands are laid over the prediction
  //   observedBands        the 1958 bands at this generation, the same shape, whether or not they are shown
  //   matchesData          bands equal observedBands: the same names, densities and fractions
  //   ruledOut             the schemes whose prediction fails at any generation from 1 to this one:
  //                        [] at 0, ['conservative'] at 1, ['conservative', 'dispersive'] from 2
  //   heated               whether Heat has parted the strands
  //   strandBands          when heated, the single strands' bands, the same shape; [] otherwise
  //   observedStrandBands  when heated at generation 1, the 1958 heated bands; [] otherwise
  //   strandsMatchData     when heated at generation 1, strandBands equal observedStrandBands; null otherwise
  //   t                   the clock, seconds, three decimals; nothing in the figure moves with it
  // Reset puts every one of them back where it opened.
  return b.handle();
}
