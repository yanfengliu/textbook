// One element table. src/figures/lib/chem-atoms.js holds the one record per element that the chapter-2
// molecular figures colour and measure from, and lib/mol-draw.js derives the CSS fill, outline and
// symbol expressions the SVG figures draw with from the token names in that record. Chapter 2's eight
// figures were built by two workers in parallel and each wrote its own table; the values agreed by luck.
// This test fails when a second element table appears anywhere under src/figures/, when mol-draw's
// per-element colours stop resolving to the tokens chem-atoms declares, when the table stops matching
// the colour table in biology/ch02-chemistry-of-life/FIGURES.md that both helpers claim to implement,
// or when a second seeded generator or a Math.random() call appears in a figure.
//
// Bound: text and exports, never pixels. "An element table" is an object literal that keys three or
// more of the eleven element symbols (H C N O P S Na Cl K Ca Mg) to object values in one file, comments
// stripped — a table keyed by element names, or one of bare numbers per element, is not seen. The colour
// check compares strings against tokens.css's variable names and palette.js's keys, so a token that is
// declared but wrong is the palette test's problem, not this one's. The FIGURES.md check reads that
// file's markdown table by the `| Thing | \`token\` |` shape it has today, and reads only the element
// rows: the bond colours in the same table live in function defaults and are not compared. Chapter 3's
// structure table (lib/cell3-colours.js) is keyed by structure, not by element, and is
// test/organelle-table.test.js's. The generator check is bounded to chapter 2's modules (CH2 below):
// chapter 1 and chapter 3 each carry their own copies of mulberry32 (pond, pasteur, lib/cell-common,
// lib/cell3-draw, lib/three-common), and merging those is a separate change. The Math.random check is
// repo-wide.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIGHT, DARK, TEXT_MIX, textOn } from '../src/palette.js';
import { ELEMENTS, atomColours } from '../src/figures/lib/chem-atoms.js';
import { ELEMENT_CSS, element, cssOf } from '../src/figures/lib/mol-draw.js';

// WCAG 2.x relative luminance and contrast ratio, written out here rather than imported, so the colour
// check below is not the palette agreeing with itself.
const rgb255 = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = rgb255(hex).map((v) => linear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const figuresDir = fileURLToPath(new URL('../src/figures/', import.meta.url));
const tokensCss = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const figuresMd = readFileSync(new URL('../biology/ch02-chemistry-of-life/FIGURES.md', import.meta.url), 'utf8');

const SYMBOLS = ['H', 'C', 'N', 'O', 'P', 'S', 'Na', 'Cl', 'K', 'Ca', 'Mg'];
const RECORD = new RegExp(`[{,]\\s*(${SYMBOLS.join('|')})\\s*:\\s*\\{`, 'g');
const ONE_TABLE = 'lib/chem-atoms.js';
// Chapter 2's molecular figures and the three helpers they share.
const CH2 = ['soup.js', 'bondlab.js', 'water3d.js', 'waterprops.js', 'phlab.js', 'carbonkit.js', 'polymer.js', 'foldlab.js', ONE_TABLE, 'lib/mol-draw.js', 'lib/mol-fold.js'];

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.js')) out.push(p);
  }
  return out;
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');

const modules = walk(figuresDir).map((p) => ({
  path: relative(figuresDir, p).replace(/\\/g, '/'),
  src: stripComments(readFileSync(p, 'utf8')),
}));

// inkSoft -> ink-soft, paper3 -> paper-3, ruleStrong -> rule-strong: the rule tokens.css names its
// variables by, written here a second time rather than read from svg.js's C, so that this check does not
// prove only that the code agrees with itself.
const cssVar = (token) => `var(--${token.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase()})`;

test('exactly one module under src/figures/ holds an element table, and it is lib/chem-atoms.js', () => {
  assert.ok(modules.length > 10, `only ${modules.length} module(s) found under src/figures/, so this checked almost nothing`);
  const tables = [];
  for (const m of modules) {
    const found = new Set();
    for (const hit of m.src.matchAll(RECORD)) found.add(hit[1]);
    if (found.size >= 3) tables.push(`${m.path} (keys ${[...found].join(', ')})`);
  }
  assert.deepEqual(
    tables,
    [`${ONE_TABLE} (keys ${Object.keys(ELEMENTS).join(', ')})`],
    `${tables.length} element table(s) under src/figures/ where there must be one, ${ONE_TABLE}:\n  ${tables.join('\n  ')}\nA second table is a second place the chapter's colours can drift; derive from ELEMENTS in ${ONE_TABLE} instead, as lib/mol-draw.js does`,
  );
  const exporters = modules.filter((m) => /export\s+const\s+ELEMENTS\b/.test(m.src)).map((m) => m.path);
  assert.deepEqual(exporters, [ONE_TABLE], `ELEMENTS is exported by ${exporters.join(', ')}; only ${ONE_TABLE} may export an element table`);
});

test('mol-draw derives every element colour from the token chem-atoms declares', () => {
  const symbols = Object.keys(ELEMENTS);
  assert.ok(symbols.length >= 8, `chem-atoms declares ${symbols.length} element(s); the chapter draws at least eight`);
  assert.deepEqual(Object.keys(ELEMENT_CSS), symbols, 'mol-draw does not colour exactly the elements chem-atoms declares');
  const root = tokensCss.slice(tokensCss.indexOf(':root {'), tokensCss.indexOf('}', tokensCss.indexOf(':root {')));
  for (const sym of symbols) {
    const e = ELEMENTS[sym];
    for (const field of ['token', 'outline', 'label']) {
      const token = e[field];
      assert.ok(typeof token === 'string' && token in LIGHT && token in DARK, `${sym}.${field} is ${JSON.stringify(token)}, which is not a key of LIGHT and DARK in src/palette.js`);
      assert.ok(root.includes(`${cssVar(token).slice(4, -1)}:`), `${sym}.${field} names ${token}, and tokens.css declares no ${cssVar(token).slice(4, -1)} in :root`);
    }
    const css = ELEMENT_CSS[sym];
    // `deepen` draws the disc at the token's -text value. The element keeps its hue and its token name —
    // an oxygen is still the coral one and FIGURES.md still says so — but the fill and the outline are
    // `var(--coral-text)` rather than `var(--coral)`, because a `paper` symbol on the accent itself is
    // unreadable in the light theme. The dash form is derived here, not read from svg.js's C.
    const discVar = e.deepen ? `${cssVar(e.token).slice(0, -1)}-text)` : cssVar(e.token);
    const strokeVar = e.deepen ? `${cssVar(e.outline).slice(0, -1)}-text)` : cssVar(e.outline);
    assert.equal(css.symbol, e.symbol, `${sym}: mol-draw's symbol differs from chem-atoms'`);
    assert.equal(css.fill, discVar, `${sym}: mol-draw fills with ${css.fill}, chem-atoms declares token ${e.token}${e.deepen ? ' with deepen' : ''}`);
    assert.equal(css.stroke, strokeVar, `${sym}: mol-draw outlines with ${css.stroke}, chem-atoms declares outline ${e.outline}${e.deepen ? ' with deepen' : ''}`);
    assert.equal(css.label, cssVar(e.label), `${sym}: mol-draw writes the symbol in ${css.label}, chem-atoms declares label ${e.label}`);
    assert.equal(element(sym), css, `element("${sym}") does not return the derived record`);
    // The palette-side accessor reads the same record, so a canvas figure and an SVG figure agree.
    const fill = e.deepen ? textOn(LIGHT, e.token) : LIGHT[e.token];
    const stroke = e.deepen ? textOn(LIGHT, e.outline) : LIGHT[e.outline];
    assert.deepEqual(atomColours(LIGHT, sym), { fill, stroke, label: LIGHT[e.label] }, `atomColours(LIGHT, "${sym}") disagrees with the record`);
  }
  assert.throws(() => element('Xx'), /chem-atoms/, 'an unknown element must fail naming the one table');
  assert.throws(() => cssOf('notAToken'), /no CSS token/, 'an unknown token must fail rather than draw nothing');
  assert.throws(() => cssOf('violet', true), /no deepened CSS token/, 'a deepen on a token with no -text value must fail rather than fall back to the accent and ship the defect it was asked to fix');
});

test('the deepened disc is the same recipe in CSS and in JavaScript, and it is what makes the symbol on it legible', (t) => {
  // The one recipe in two languages: tokens.css declares `--coral-text: color-mix(in srgb, var(--coral)
  // 70%, var(--ink))` for the stylesheets, and TEXT_MIX in src/palette.js holds 0.30 for the canvas and
  // WebGL figures, which cannot write a CSS expression. Nothing compares them but this.
  const root = tokensCss.slice(tokensCss.indexOf(':root {'), tokensCss.indexOf('}', tokensCss.indexOf(':root {')));
  for (const [token, fraction] of Object.entries(TEXT_MIX)) {
    const name = `--${token}-text`;
    const m = new RegExp(`${name}:\\s*color-mix\\(in srgb,\\s*var\\(--${token}\\)\\s*([0-9.]+)%,\\s*var\\(--ink\\)\\)`).exec(root);
    assert.ok(m, `src/palette.js's TEXT_MIX names ${token}, and tokens.css's :root declares no ${name} of the form \`color-mix(in srgb, var(--${token}) <pct>%, var(--ink))\`. The two are one recipe in two languages; add it there, or take ${token} out of TEXT_MIX`);
    assert.equal(
      Number(m[1]), Math.round((1 - fraction) * 1000) / 10,
      `${name} is ${m[1]}% of --${token} in tokens.css and TEXT_MIX.${token} is ${fraction}, which is ${Math.round((1 - fraction) * 1000) / 10}%. An SVG figure would then draw one colour and a canvas figure another, for the same atom on the same page`,
    );
    t.diagnostic(`${name} ${m[1]}% == TEXT_MIX.${token} ${fraction} -> ${textOn(LIGHT, token)} light, ${textOn(DARK, token)} dark`);
  }

  // And the reason the recipe is used at all. This is the measurement the four allowances in
  // tools/legible.js stood in for: every element's symbol on its own disc, in BOTH themes, at the 4.5:1
  // bar a label-sized glyph has to clear. It was 3.32:1 for oxygen, 4.33:1 for nitrogen and 2.26:1 for
  // sulfur in the light theme on published chapter 2 until 2026-09-17. Both ends move with the theme
  // here — unlike ORGANELLES, MEMBRANE and METABOLISM, whose fills are fixed — so both themes are
  // measured and neither is assumed from the other.
  const AA = 4.5;
  const worst = [];
  for (const sym of Object.keys(ELEMENTS)) {
    for (const [theme, palette] of [['light', LIGHT], ['dark', DARK]]) {
      const { fill, label } = atomColours(palette, sym);
      const ratio = contrast(label, fill);
      worst.push({ sym, theme, ratio });
      assert.ok(
        ratio >= AA,
        `${sym}: its symbol in ${label} on its own disc ${fill} is ${ratio.toFixed(2)}:1 in the ${theme} theme, under WCAG AA's ${AA}:1. Both the disc and the symbol are palette tokens here, so both move with the theme and no single label clears a bare accent in both — the disc takes the accent's -text value instead (\`deepen\` in ELEMENTS), which moves WITH the paper. Add \`deepen: true\` to ${sym}, and add a --${ELEMENTS[sym].token}-text to tokens.css and TEXT_MIX if that token has none`,
      );
    }
  }
  assert.equal(worst.length, Object.keys(ELEMENTS).length * 2, `measured ${worst.length} pair(s) against ${Object.keys(ELEMENTS).length} element(s) in two themes; an element or a theme was skipped`);
  const low = worst.reduce((a, b) => (b.ratio < a.ratio ? b : a));
  t.diagnostic(`${worst.length} pair(s) measured, worst ${low.sym} ${low.theme} ${low.ratio.toFixed(2)}:1 against a floor of ${AA}:1`);
});

test('only chem-atoms and mol-draw turn an element token into a colour; every other module goes through the accessors', () => {
  // The one-table rule above catches a second TABLE. It does not catch a second DERIVATION, and on
  // 2026-09-17 there were two. `bondlab` held `const TOKEN = { coral: C.coral, … }` with
  // `fillOf = (sym) => TOKEN[ELEMENTS[sym].token]`, and `soup` held
  // `[['C', p.inkSoft], ['O', p.coral], ['N', p.water], ['S', p.gold]]`. Both read the table faithfully
  // and both were wrong the moment the table gained `deepen`, because a field they did not know about
  // changed what `token` means. Neither is a table by the rule above: one is keyed by token name and the
  // other is a list of pairs.
  //
  // What it cost. bondlab drew every O, N and S on the bare accent — `paper` on coral is 3.32:1, on gold
  // 2.26:1 — and `npm run legible` was green on almost all of them, because `.bl-sym` is weight 700 and a
  // glyph at 18.66 px or more is judged against WCAG's large-text bar of 3:1, which 3.32 clears. One
  // state drew at 18.0 px and failed. The gate was reading a font size, not a colour.
  //
  // So the rule is about the DERIVATION and not the table: `.token` and `.outline` are turned into a
  // colour in exactly two modules, and every figure reads `atomColours()`, `element()` or `cssOf()`.
  // Bound: it is textual, over `src/figures/**`, and it sees an element record's `.token`/`.outline`
  // being read at all outside the two. A module that copies a hex, or that resolves the token through a
  // string it builds at run time, is not seen — this catches the copy of what exists, as the one-table
  // rule does.
  const ALLOWED_TO_DERIVE = [ONE_TABLE, 'lib/mol-draw.js'];
  const readers = [];
  for (const m of modules) {
    if (ALLOWED_TO_DERIVE.includes(m.path)) continue;
    for (const hit of m.src.matchAll(/ELEMENTS\s*(?:\[[^\]]+\]|\.[A-Za-z]+)\s*\.\s*(token|outline)\b/g)) {
      readers.push(`${m.path} reads .${hit[1]} off an element record`);
    }
  }
  assert.deepEqual(
    readers,
    [],
    `an element's colour is derived outside ${ALLOWED_TO_DERIVE.join(' and ')}:\n  ${readers.join('\n  ')}\nA record's \`token\` is not the colour to draw: \`deepen\` says whether the disc takes the token or the token's -text value, and a module that reads \`token\` on its own silently ignores it. Read the colour through atomColours(palette, sym) for canvas and WebGL, or element(sym) / cssOf(token, deep) for SVG, so there is one derivation and the next field added to the table reaches every figure at once`,
  );
  assert.ok(modules.length > 10, `only ${modules.length} module(s) found under src/figures/, so this checked almost nothing`);
});

test('the table is the colour table in biology/ch02-chemistry-of-life/FIGURES.md', () => {
  const start = figuresMd.indexOf('| Thing | Colour |');
  assert.notEqual(start, -1, 'FIGURES.md has no `| Thing | Colour |` table, so nothing here could be compared');
  const rows = [];
  for (const line of figuresMd.slice(start).split('\n').slice(2)) {
    if (!line.startsWith('|')) break;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    rows.push({ thing: cells[0], tokens: [...cells[1].matchAll(/`([A-Za-z0-9]+)`/g)].map((m) => m[1]) });
  }
  assert.ok(rows.length >= 7, `read ${rows.length} row(s) from the FIGURES.md colour table; expected the elements, the ions and the bonds`);
  const ions = rows.find((r) => /\bions\b/.test(r.thing));
  assert.ok(ions, 'FIGURES.md has no ions row');
  const ionSymbols = ions.thing.match(/\b(Na|K|Ca|Cl|Mg)\b/g) ?? [];
  for (const sym of ionSymbols) assert.ok(sym in ELEMENTS, `FIGURES.md colours the ion ${sym} and chem-atoms has no record for it`);
  for (const [sym, e] of Object.entries(ELEMENTS)) {
    if (e.charge != null) {
      assert.ok(ionSymbols.includes(sym), `${sym} carries a charge in chem-atoms and is not in FIGURES.md's ions row (${ions.thing})`);
      assert.equal(e.token, ions.tokens[0], `${sym}: chem-atoms colours the ion ${e.token}, FIGURES.md says ${ions.tokens[0]}`);
      assert.equal(e.outline, ions.tokens[0], `${sym}: an ion's outline is its fill in FIGURES.md, chem-atoms says ${e.outline}`);
      continue;
    }
    const row = rows.find((r) => r.thing.toLowerCase() === e.name.toLowerCase());
    assert.ok(row, `FIGURES.md's colour table has no row for ${e.name} (${sym})`);
    assert.equal(e.token, row.tokens[0], `${sym}: chem-atoms colours ${e.name} ${e.token}, FIGURES.md says ${row.tokens[0]}`);
    assert.equal(e.outline, row.tokens[1] ?? row.tokens[0], `${sym}: chem-atoms outlines ${e.name} ${e.outline}, FIGURES.md says ${row.tokens[1] ?? row.tokens[0]}`);
  }
});

test('chapter 2 defines its seeded generator once, and no figure calls Math.random', () => {
  const ch2 = modules.filter((m) => CH2.includes(m.path));
  assert.equal(ch2.length, CH2.length, `expected ${CH2.length} chapter-2 modules under src/figures/, found ${ch2.map((m) => m.path).join(', ')}`);
  const generators = ch2.filter((m) => /function\s+mulberry32\b/.test(m.src)).map((m) => m.path);
  assert.deepEqual(generators, [ONE_TABLE], `mulberry32 is defined in ${generators.join(', ') || 'no chapter-2 module'}; the one definition is in ${ONE_TABLE}, and every other chapter-2 module imports it`);
  const random = modules.filter((m) => /Math\.random\s*\(/.test(m.src)).map((m) => m.path);
  assert.deepEqual(random, [], `Math.random() is called in ${random.join(', ')}; a figure is a pure function of its clock and the reader's actions, so it draws from mulberry32 with a stated seed`);
});
