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
import { LIGHT, DARK } from '../src/palette.js';
import { ELEMENTS, atomColours } from '../src/figures/lib/chem-atoms.js';
import { ELEMENT_CSS, element, cssOf } from '../src/figures/lib/mol-draw.js';

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
    assert.equal(css.symbol, e.symbol, `${sym}: mol-draw's symbol differs from chem-atoms'`);
    assert.equal(css.fill, cssVar(e.token), `${sym}: mol-draw fills with ${css.fill}, chem-atoms declares token ${e.token}`);
    assert.equal(css.stroke, cssVar(e.outline), `${sym}: mol-draw outlines with ${css.stroke}, chem-atoms declares outline ${e.outline}`);
    assert.equal(css.label, cssVar(e.label), `${sym}: mol-draw writes the symbol in ${css.label}, chem-atoms declares label ${e.label}`);
    assert.equal(element(sym), css, `element("${sym}") does not return the derived record`);
    // The palette-side accessor reads the same record, so a canvas figure and an SVG figure agree.
    assert.deepEqual(atomColours(LIGHT, sym), { fill: LIGHT[e.token], stroke: LIGHT[e.outline], label: LIGHT[e.label] }, `atomColours(LIGHT, "${sym}") disagrees with the record`);
  }
  assert.throws(() => element('Xx'), /chem-atoms/, 'an unknown element must fail naming the one table');
  assert.throws(() => cssOf('notAToken'), /no CSS token/, 'an unknown token must fail rather than draw nothing');
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
