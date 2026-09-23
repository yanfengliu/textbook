// One structure table for chapter 3. src/palette.js's ORGANELLES colours the animal cell; the structures
// chapter 3 adds — the plant cell's, the cytoskeleton's and the prokaryote's — are one table in
// src/figures/lib/cell3-colours.js, every colour a mix() of the palette, read through one lookup,
// organelle(id). Two workers built the chapter's figures in parallel and each wrote a table of its own
// (lib/cell-colours.js for prokaryote, lib/cell3-colours.js for the rest), and the two named `wall` and
// `motor` with different colours. This test fails when a second structure table appears anywhere under
// src/figures/, when an id in the chapter's table is one ORGANELLES already colours, when a colour in it
// is a hex of its own rather than a mix of the palette, when a structure the chapter brief lists is
// missing from it, when two entries give one name two colours beyond the one pair already known, or when
// the prokaryote figure's view of the table stops deriving from it.
//
// It also holds both tables' `symbolColor`, the colour a symbol written ON a fill takes, in the shape
// test/metabolism-table.test.js settled on: no field in either table holds a palette token NAME, every
// stated colour clears WCAG AA against its own fill, and a `null` is allowed only where neither neutral
// clears. A token name over these fills is the trap — the fills are fixed hexes and do not move with the
// theme while `ctx.palette.ink` does, so `palette[o.symbolColor]` would read right on one paper and
// invert on the other. Holding the colour itself leaves nothing to reach for.
//
// Bound: text and exports, never pixels. "A structure table" is three or more object literals in one
// file, comments stripped, each carrying an id, a role and a colour that is not null: prokaryote's three
// uncoloured click-card parts (`color: null`) are not seen, nor are records with no `role`, such as
// cytoskeleton's filaments. The FIGURES.md check reads the backticked ids in the section "Palette
// additions this chapter needs" and asks only that each is in the table and not in ORGANELLES; that brief
// names structures and not colours, so no colour is compared to anything, and whether a mix is the right
// mix is what the drive frames are for. The one pair of entries sharing a name, "Cell wall" (`wall`, the
// cellulose wall; `peptidoglycan`, the bacterial one), is pinned in KNOWN_SHARED_NAMES below, and the
// test goes red when the pair stops sharing the name, so the pin cannot outlive the disagreement. The
// prokaryote figure's ten part names and its two aliases are written here a second time rather than read
// from the module, so that check is not the code agreeing with itself.
//   * The symbolColor rules are text, exports and arithmetic. Nothing is rendered, and no figure writes a
//     symbol on either table's fills yet — the check is what stops the first one that does from guessing,
//     not a measurement of a page. The token-name scan is textual over the two array literals: a token
//     name assembled at runtime, or written into a figure rather than into the table, is not seen.
//   * WCAG's large-text exemption is not applied. A symbol on an organelle is a word or two at label
//     size, so the bar is 4.5:1 and a figure that draws one at 24 px is doing something this does not
//     describe. The contrast arithmetic is re-implemented here rather than imported, so that this is not
//     the module agreeing with itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIGHT, DARK, ORGANELLES, ORGANELLE_BY_ID } from '../src/palette.js';
import { EXTRA_ORGANELLES, EXTRA_BY_ID, organelle, colourOf, CELL_COLOURS, CELL_COLOUR, partInfo } from '../src/figures/lib/cell3-colours.js';

const figuresDir = fileURLToPath(new URL('../src/figures/', import.meta.url));
const figuresMd = readFileSync(new URL('../biology/ch03-cells/FIGURES.md', import.meta.url), 'utf8');
const paletteSrc = readFileSync(new URL('../src/palette.js', import.meta.url), 'utf8');
const extraSrc = readFileSync(new URL('../src/figures/lib/cell3-colours.js', import.meta.url), 'utf8');
const ONE_TABLE = 'lib/cell3-colours.js';
const AA = 4.5;

// WCAG 2.x relative luminance and contrast ratio, written out rather than imported.
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

// What the prokaryote figure calls two of the table's ids, and the ten parts it colours through
// CELL_COLOUR, in the order its own colour map lists them.
const PROKARYOTE_IDS = { wall: 'peptidoglycan', motor: 'flagellarMotor' };
const PROKARYOTE_PARTS = ['wall', 'wallLine', 'lps', 'sLayer', 'capsule', 'nucleoid', 'plasmid', 'pilus', 'flagellum', 'motor'];
// The one name two entries share today, with the ids that share it, in table order.
const KNOWN_SHARED_NAMES = { 'Cell wall': ['wall', 'peptidoglycan'] };

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

// One flat object literal; a record is one that carries an id, a role and a colour that is not null.
const LITERAL = /\{[^{}]*\}/g;
const isRecord = (s) => /\bid:\s*['"]/.test(s) && /\brole:\s*['"`]/.test(s) && /\bcolou?r:\s*(?!null\b)\S/.test(s);
const idOf = (s) => s.match(/\bid:\s*['"]([^'"]+)['"]/)[1];

test('exactly one module under src/figures/ holds a structure table, and it is lib/cell3-colours.js', () => {
  assert.ok(modules.length > 10, `only ${modules.length} module(s) found under src/figures/, so this checked almost nothing`);
  const tables = [];
  for (const m of modules) {
    const ids = [];
    for (const hit of m.src.matchAll(LITERAL)) if (isRecord(hit[0])) ids.push(idOf(hit[0]));
    if (ids.length >= 3) tables.push(`${m.path} (${ids.length} records: ${ids.join(', ')})`);
  }
  const expected = `${ONE_TABLE} (${EXTRA_ORGANELLES.length} records: ${EXTRA_ORGANELLES.map((o) => o.id).join(', ')})`;
  assert.deepEqual(
    tables,
    [expected],
    `${tables.length} structure table(s) under src/figures/ where there must be one, ${ONE_TABLE}:\n  ${tables.join('\n  ')}\nA second table is a second place a structure's colour can drift; add the entry to EXTRA_ORGANELLES in ${ONE_TABLE} and read it through organelle(id)`,
  );
  const exporters = modules.filter((m) => /export\s+const\s+(EXTRA_ORGANELLES|EXTRA_BY_ID|CELL_COLOURS?)\b/.test(m.src)).map((m) => m.path);
  assert.deepEqual(exporters, [ONE_TABLE], `a structure table is exported by ${exporters.join(', ')}; only ${ONE_TABLE} may export one`);
});

test('every id is the chapter\'s own, every colour a mix of the palette, and organelle(id) reads both tables', () => {
  assert.ok(EXTRA_ORGANELLES.length >= 16, `the table has ${EXTRA_ORGANELLES.length} entries; the chapter brief lists sixteen`);
  const ids = EXTRA_ORGANELLES.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length, `an id appears twice in EXTRA_ORGANELLES: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(', ')}`);
  for (const o of EXTRA_ORGANELLES) {
    assert.match(o.id, /^[a-z][A-Za-z0-9]*$/, `${JSON.stringify(o.id)} is not a camelCase id`);
    assert.ok(!(o.id in ORGANELLE_BY_ID), `${o.id}: chapter 3 colours it ${o.color} and ORGANELLES already colours it ${ORGANELLE_BY_ID[o.id]?.color}; a structure the book has coloured keeps that colour, so read ORGANELLE_BY_ID.${o.id} and delete this entry`);
    assert.match(o.color, /^#[0-9a-f]{6}$/, `${o.id} colour ${o.color}`);
    assert.ok(typeof o.name === 'string' && o.name.length > 0, `${o.id} needs a name`);
    assert.ok(typeof o.role === 'string' && o.role.length > 20, `${o.id} needs a role sentence`);
    assert.equal(EXTRA_BY_ID[o.id], o, `EXTRA_BY_ID.${o.id} is not the table's record`);
    assert.equal(organelle(o.id), o, `organelle("${o.id}") is not the table's record`);
    assert.equal(colourOf(o.id), o.color, `colourOf("${o.id}") is not the table's colour`);
  }
  for (const o of ORGANELLES) assert.equal(organelle(o.id), o, `organelle("${o.id}") should be the ORGANELLES record`);
  assert.throws(() => organelle('notAStructure'), /ORGANELLES or EXTRA_ORGANELLES/, 'an unknown id must fail naming both tables');
  // Derived, never invented: the module holds no hex of its own, comments aside.
  const table = modules.find((m) => m.path === ONE_TABLE);
  assert.ok(table, `${ONE_TABLE} is not under src/figures/`);
  const hexes = [...table.src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hexes, [], `${ONE_TABLE} carries the hex literal(s) ${hexes.join(', ')}; every colour there is mix() of two palette colours, so that the palette moves it`);
  // One name, one colour, beyond the pair already known.
  const byName = {};
  for (const o of EXTRA_ORGANELLES) (byName[o.name] ??= []).push(o.id);
  const shared = Object.fromEntries(Object.entries(byName).filter(([, v]) => v.length > 1));
  assert.deepEqual(
    shared,
    KNOWN_SHARED_NAMES,
    `entries sharing a name: ${JSON.stringify(shared)}, against the one pair this test knows, ${JSON.stringify(KNOWN_SHARED_NAMES)}. A name the reader sees in two colours is two colours for one structure: give the second the first's colour, or the name that tells them apart. If the known pair no longer shares its name, delete it from KNOWN_SHARED_NAMES here`,
  );
});

test('every structure the chapter brief lists is in the table, and every one it says to reuse is in ORGANELLES', () => {
  const start = figuresMd.indexOf('## Palette additions this chapter needs');
  assert.notEqual(start, -1, 'biology/ch03-cells/FIGURES.md has no "Palette additions this chapter needs" section, so nothing here could be compared');
  const end = figuresMd.indexOf('\n## ', start + 1);
  const paragraphs = figuresMd.slice(start, end === -1 ? undefined : end).split(/\r?\n\s*\r?\n/);
  // The section is two lists: the ids the chapter adds, then the ORGANELLES ids it "must reuse unchanged".
  const ids = (p) => [...p.matchAll(/`([a-z][A-Za-z0-9]*)`/g)].map((m) => m[1]);
  const reusedPara = paragraphs.find((p) => /already exist/.test(p));
  const addedPara = paragraphs.find((p) => ids(p).length >= 3 && !/already exist/.test(p));
  assert.ok(reusedPara && addedPara, 'FIGURES.md\'s palette section no longer has a list of additions followed by a list of ids that "already exist"; rebind this test to its new shape');
  const added = ids(addedPara);
  const reused = ids(reusedPara);
  assert.ok(added.length >= 10, `read ${added.length} id(s) from FIGURES.md's palette additions; expected the plant cell's, the cytoskeleton's and the prokaryote's`);
  assert.ok(reused.length >= 10, `read ${reused.length} id(s) from FIGURES.md's list of ids to reuse; expected the animal cell's`);
  assert.equal(new Set([...added, ...reused]).size, added.length + reused.length, `FIGURES.md lists an id twice: ${[...added, ...reused].join(', ')}`);
  for (const id of added) {
    assert.ok(id in EXTRA_BY_ID, `FIGURES.md names ${id} among the structures this chapter needs, and ${ONE_TABLE} has no entry for it; the table's ids are ${Object.keys(EXTRA_BY_ID).join(', ')}`);
    assert.ok(!(id in ORGANELLE_BY_ID), `FIGURES.md lists ${id} as an addition and ORGANELLES already has it`);
  }
  for (const id of reused) {
    assert.ok(id in ORGANELLE_BY_ID, `FIGURES.md says ${id} already exists in ORGANELLES and must be reused, and ORGANELLES has no ${id}`);
    assert.ok(!(id in EXTRA_BY_ID), `FIGURES.md says ${id} must be reused from ORGANELLES unchanged, and ${ONE_TABLE} colours it ${EXTRA_BY_ID[id]?.color} anyway`);
  }
});

test('the prokaryote figure\'s view derives from the table under its own two names', () => {
  assert.deepEqual(Object.keys(CELL_COLOUR), PROKARYOTE_PARTS, 'CELL_COLOUR does not name exactly the ten parts prokaryote colours');
  assert.deepEqual(Object.keys(CELL_COLOURS), PROKARYOTE_PARTS, 'CELL_COLOURS does not name exactly the ten parts prokaryote colours');
  for (const k of PROKARYOTE_PARTS) {
    const id = PROKARYOTE_IDS[k] ?? k;
    assert.ok(id in EXTRA_BY_ID, `prokaryote's ${k} is the table's ${id}, and the table has no ${id}`);
    assert.equal(CELL_COLOURS[k], EXTRA_BY_ID[id], `CELL_COLOURS.${k} is not the table's ${id} record`);
    assert.equal(CELL_COLOUR[k], EXTRA_BY_ID[id].color, `CELL_COLOUR.${k} is ${CELL_COLOUR[k]}; the table colours ${id} ${EXTRA_BY_ID[id].color}`);
    assert.equal(partInfo(k), EXTRA_BY_ID[id], `partInfo("${k}") is not the table's ${id} record`);
  }
  // The two aliased ids keep the words the figure's click card shows.
  assert.equal(CELL_COLOURS.wall.name, 'Cell wall', 'prokaryote\'s card calls its wall "Cell wall"');
  assert.equal(CELL_COLOURS.motor.name, 'Motor', 'prokaryote\'s card calls its flagellar motor "Motor"');
  for (const o of ORGANELLES) assert.equal(partInfo(o.id), o, `partInfo("${o.id}") should be the ORGANELLES record`);
  assert.equal(partInfo('periplasm'), null, 'a part with no colour of its own is null, and the figure keeps its own card for it');
});

// ---- symbolColor: the colour a symbol written ON a fill takes -----------------------------------------

// The source text of one array literal, so the checks below read what the file SAYS and not only what it
// exports: `symbolColor: 'ink'` and `symbolColor: LIGHT.ink` export different things but a check that only
// reads the export can be made to pass by either.
function tableSource(src, head, file) {
  const start = src.indexOf(head);
  assert.notEqual(start, -1, `${file} no longer declares \`${head}\`, so the text checks below have nothing to read; re-bind them to the table's new shape rather than leaving them green over nothing`);
  let depth = 0;
  for (let i = start + head.length - 1; i < src.length; i += 1) {
    if (src[i] === '[') depth += 1;
    if (src[i] === ']') {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
    }
  }
  throw new Error(`the array literal after \`${head}\` in ${file} never closes`);
}

const TABLES = [
  { name: 'ORGANELLES', file: 'src/palette.js', table: ORGANELLES, block: tableSource(paletteSrc, 'export const ORGANELLES = Object.freeze([', 'src/palette.js'), lookup: 'ORGANELLE_BY_ID.<id>', colour: 'LIGHT' },
  { name: 'EXTRA_ORGANELLES', file: `src/figures/${ONE_TABLE}`, table: EXTRA_ORGANELLES, block: tableSource(extraSrc, 'export const EXTRA_ORGANELLES = Object.freeze([', `src/figures/${ONE_TABLE}`), lookup: 'organelle("<id>")', colour: 'L' },
];

test('no field in either organelle table holds a palette token name, so a symbol on a fill can never be resolved through the theme', () => {
  // The defect this spelling prevents. Both tables' fills are FIXED hexes — one colour per structure on
  // both papers, which src/figures/lib/cell3-colours.js's own header argues for — while `ctx.palette.ink`
  // is #1d1a17 on a light page and #e9e4da on a dark one. A field holding the NAME 'ink' invites
  // `ctx.palette[o.symbolColor]`, which writes near-white on a mid-tone fill in the dark theme and is the
  // shape of all ten defects the 2026-09-16 legibility census found. A field holding the colour leaves
  // nothing to reach for. MEMBRANE carried `label: 'ink'` until 2026-09-17 and was moved for this reason.
  // Widening this is a decision and it is made on these lines.
  const tokens = new Set([...Object.keys(LIGHT), ...Object.keys(DARK)]);
  for (const { name, file, table, block, colour } of TABLES) {
    const offenders = [];
    for (const m of block.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*'([^']*)'/g)) {
      if (tokens.has(m[2])) offenders.push(`${m[1]}: '${m[2]}'`);
    }
    assert.deepEqual(
      offenders,
      [],
      `the ${name} literal in ${file} carries ${offenders.join(', ')}, and "${offenders[0]?.split("'")[1]}" is a palette token NAME. Over a fill that is a fixed hex a token name reads right in one theme and inverts in the other, because the token moves and the fill does not. A field here holds the colour itself — \`symbolColor: ${colour}.ink\` — so that both sides of the measurement are fixed and the ratio holds in both themes`,
    );
    for (const o of table) {
      if (o.symbolColor === null) continue;
      assert.ok(!tokens.has(o.symbolColor), `${name}'s "${o.id}" has symbolColor "${o.symbolColor}", the name of a palette token; it must be the colour itself`);
      assert.match(o.symbolColor, /^#[0-9a-f]{6}$/, `${name}'s "${o.id}" has symbolColor ${JSON.stringify(o.symbolColor)}; it is a colour, six lower-case hex digits, or null where neither neutral clears`);
    }
    // And the source says so too, so the export cannot be right by accident.
    // `[^,\n]+?` and not "to the end of the line": ORGANELLES writes an entry on one line and
    // EXTRA_ORGANELLES over five, so the value ends at its own comma either way.
    const written = [...block.matchAll(/id:\s*'([^']+)',[\s\S]*?symbolColor:\s*([^,\n]+?)\s*,/g)];
    assert.equal(written.length, table.length, `read ${written.length} symbolColor expression(s) from the ${name} literal and the table exports ${table.length} entr${table.length === 1 ? 'y' : 'ies'}; every entry states one, and the literal's shape has changed or an entry is missing the field`);
    for (const [, id, expr] of written) {
      assert.match(expr.trim(), new RegExp(`^(${colour}\\.(ink|paper)|null)$`), `${name}'s "${id}" has symbolColor \`${expr.trim()}\`; it is written as ${colour}.ink or ${colour}.paper — a value from the light table, fixed like the fill it sits on — or null where neither clears`);
    }
  }
});

test('every symbolColor clears WCAG AA against its own fill, and a null is only where neither neutral does', (t) => {
  // Both the fill and the symbol are fixed hexes, so this one measurement IS the measurement in both
  // themes: there is no second, theme-dependent value to check, and that is the whole claim.
  let measured = 0;
  let nulls = 0;
  for (const { name, table, lookup } of TABLES) {
    for (const o of table) {
      const onPaper = contrast(LIGHT.paper, o.color);
      const onInk = contrast(LIGHT.ink, o.color);
      const best = Math.max(onPaper, onInk);
      const better = onPaper >= onInk ? 'LIGHT.paper' : 'LIGHT.ink';
      t.diagnostic(`${name} ${o.id} ${o.color}: paper ${onPaper.toFixed(2)}:1, ink ${onInk.toFixed(2)}:1 -> ${o.symbolColor === null ? 'null' : o.symbolColor}`);
      if (o.symbolColor === null) {
        nulls += 1;
        assert.ok(
          best < AA,
          `${name}'s "${o.id}" has symbolColor null, meaning neither neutral clears ${AA}:1 on ${o.color} — and ${better} gives ${best.toFixed(2)}:1, which does. A null is for a fill with no answer, not for one nobody measured: state ${better}. If a symbol is never written on this fill, that is still not a reason, because the next figure that writes one reads this field`,
        );
        continue;
      }
      measured += 1;
      const ratio = contrast(o.symbolColor, o.color);
      assert.ok(
        ratio >= AA,
        `${name}'s "${o.id}": a symbol in ${o.symbolColor} on its own fill ${o.color} is ${ratio.toFixed(2)}:1, under WCAG AA's ${AA}:1. The other neutral gives ${(o.symbolColor === LIGHT.paper ? onInk : onPaper).toFixed(2)}:1 — take whichever clears; if neither does, this is null and a symbol drawn through ${lookup} needs its own halo or the fill has to move`,
      );
      // There is deliberately NO second assertion that the stated colour is the BETTER of the two. With
      // this palette it could never go red, and a rule nothing can falsify is not a rule: LIGHT.paper and
      // LIGHT.ink are 15.9:1 apart, and for any fill between them contrast(paper, fill) multiplied by
      // contrast(ink, fill) is exactly that 15.9, so one clearing 4.5:1 forces the other under 3.54:1.
      // "Clears AA" and "is the better neutral" are one claim here, and the assertion above is it. The
      // check that finds the mistake in the other direction — a null on a fill a neutral would have
      // carried — is the branch above, and it was proved red on golgi at 7.16:1.
    }
  }
  const total = ORGANELLES.length + EXTRA_ORGANELLES.length;
  assert.equal(measured + nulls, total, `measured ${measured} symbolColour(s) and ${nulls} null(s) against ${total} fill(s); an entry was skipped`);
  assert.ok(measured >= 25, `only ${measured} entr(y/ies) carry a colour to measure, out of ${total}; a run that compared almost nothing must not read as a run that found nothing`);
  t.diagnostic(`${measured} symbolColour(s) measured against a floor of ${AA}:1, ${nulls} fill(s) where neither neutral clears`);
});
