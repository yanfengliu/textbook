// One membrane table. `MEMBRANE` in src/palette.js is the colour every chapter-4, -5 and -7 figure reads
// for the parts of the plasma membrane, through `membranePart(id)`. It was written with its guarantees in
// a comment and nothing holding them: the ids unique and the book's own, every colour a `mix()` of colours
// the book already has rather than a new hue, and every `symbolColor` — the colour a symbol is written in
// ON the fill — clearing WCAG AA against that fill. This file is those four claims as a check, plus four
// the same comment makes: that no field holds a palette token NAME, that no derived colour enters
// src/styles/tokens.css as a second copy, that no two parts hold one value, and that no module under
// src/figures/ carries a membrane colour of its own.
//
// Bound: text, exports and arithmetic — never pixels, and never the reader's eye.
//   * CONTRAST IS ONE MEASUREMENT AND IT COVERS BOTH THEMES, which this file could not say while the
//     field was `label: 'ink'`. The fills are fixed hexes, the same on both papers; the tokens were not,
//     so `lipidHead` (#e39273) carried its `ink` label at 7.11:1 against LIGHT.ink and 1.92:1 against
//     DARK.ink, and every other entry flipped the same way. Since 2026-09-17 the field holds the colour
//     itself, so there is no second value to resolve and no theme left to check. What is still outside
//     this file is whether a FIGURE draws with it: `palette[part.symbolColor]` is undefined rather than
//     wrong, so a figure that tries draws nothing, which the drive, narrow and legibility gates see and
//     a text check does not.
//   * The colour-vision separations the comment records (dE76 under simulated protanopia, deuteranopia
//     and tritanopia) are NOT re-measured here. What is held is the precondition they rest on: that every
//     colour is derived from the palette the separations were measured over, so a new hue cannot arrive
//     without this file going red and the measurement being redone.
//   * "A membrane colour of its own" under src/figures/ is one of the eight exported hexes written as a
//     literal, or a module exporting a MEMBRANE table. A figure that invents a ninth membrane colour from
//     some other hex is not seen; the one-table rule can only catch a copy of what exists.
//   * The derivation check reads the source text of the array literal. It resolves `LIGHT.<token>`,
//     `DARK.<token>`, `ORGANELLE_BY_ID.<id>.color` and any module-level `const` bound to one of those. A
//     colour written in some other form is not silently allowed: it fails here asking for the form to be
//     added, because a form this file cannot resolve is a form it cannot prove is derived.
// The mixing arithmetic is re-implemented below rather than imported from palette.js, so that this is not
// the module agreeing with itself: a change to `mix()` moves the exported colours away from the values
// this file computes and it goes red.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIGHT, DARK, ORGANELLES, ORGANELLE_BY_ID, MEMBRANE, MEMBRANE_BY_ID, membranePart } from '../src/palette.js';
import { EXTRA_ORGANELLES, EXTRA_BY_ID } from '../src/figures/lib/cell3-colours.js';

const paletteSrc = readFileSync(new URL('../src/palette.js', import.meta.url), 'utf8');
const tokensCss = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const figuresDir = fileURLToPath(new URL('../src/figures/', import.meta.url));

// The symbol is written on the fill in one of the book's two neutrals; a third would be a hue on a hue.
// These are names only so a failure can say which neutral the other one is; the table itself holds no
// name, which is what the first contrast test below is about.
const LABEL_NEUTRALS = ['paper', 'ink'];
const AA = 4.5;

// ---- the arithmetic, re-stated ----------------------------------------------------------------------
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
// The book's stated path: channels to 0..1, interpolate, back to 0..255, round. Written out here rather
// than imported, so a change to mix() moves the exported colours away from these and this file goes red.
// The path matters and is not a detail: `lipidHead` lands on 227.5 exactly. Interpolating in 0..255 gives
// 227.5 and rounds to 228 (#e4); the 0..255 -> 0..1 -> 0..255 round trip gives 227.49999999999997 and
// rounds to 227 (#e3), which is the value the table exports. Three more entries sit within half a unit of
// a boundary. A colour here is therefore only as stable as the arithmetic that makes it.
const blend = (a, b, t) => {
  const from = channels(a).map((v) => v / 255);
  const to = channels(b).map((v) => v / 255);
  return `#${from.map((v, i) => Math.round((v + (to[i] - v) * t) * 255).toString(16).padStart(2, '0')).join('')}`;
};

// WCAG 2.x relative luminance and contrast ratio.
const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = channels(hex).map((v) => linear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ---- the array literal, as text ---------------------------------------------------------------------
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');

function tableSource() {
  const head = 'export const MEMBRANE = Object.freeze([';
  const start = paletteSrc.indexOf(head);
  assert.notEqual(start, -1, `src/palette.js no longer declares \`${head}\`, so the text checks below have nothing to read; re-bind them to the table's new shape rather than leaving them green over nothing`);
  let depth = 0;
  for (let i = start + head.length - 1; i < paletteSrc.length; i += 1) {
    if (paletteSrc[i] === '[') depth += 1;
    if (paletteSrc[i] === ']') {
      depth -= 1;
      if (depth === 0) return stripComments(paletteSrc.slice(start, i + 1));
    }
  }
  throw new Error('the MEMBRANE array literal in src/palette.js never closes');
}

const block = tableSource();

// Every module-level `const NAME = <palette expression>;` in palette.js, so a colour written through a
// local shorthand (`MEM`) resolves to the palette value it stands for.
function consts() {
  const out = {};
  for (const m of stripComments(paletteSrc).matchAll(/^const\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/gm)) out[m[1]] = m[2].trim();
  return out;
}

// A colour expression -> the hex it must produce, or null when this file cannot say.
function resolveColourSource(expr, locals, seen = new Set()) {
  const text = expr.trim();
  let m = /^LIGHT\.([A-Za-z0-9]+)$/.exec(text);
  if (m) return LIGHT[m[1]] ?? null;
  m = /^DARK\.([A-Za-z0-9]+)$/.exec(text);
  if (m) return DARK[m[1]] ?? null;
  m = /^ORGANELLE_BY_ID\.([A-Za-z0-9]+)\.color$/.exec(text);
  if (m) return ORGANELLE_BY_ID[m[1]]?.color ?? null;
  if (locals[text] !== undefined && !seen.has(text)) return resolveColourSource(locals[text], locals, new Set([...seen, text]));
  return null;
}

// ---- the checks -------------------------------------------------------------------------------------

test('every membrane part is one thing: a unique id the book has not already coloured, with a name, a role and a colour of its own', () => {
  assert.ok(MEMBRANE.length >= 8, `MEMBRANE has ${MEMBRANE.length} entr${MEMBRANE.length === 1 ? 'y' : 'ies'}; chapter 4's brief settled on eight, and a table this size means the rules below compared almost nothing`);
  const ids = MEMBRANE.map((p) => p.id);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(twice, [], `MEMBRANE lists ${twice.join(', ')} twice; MEMBRANE_BY_ID keeps the last of the pair, so the first entry's colour is written and never read`);

  const colours = MEMBRANE.map((p) => p.color.toLowerCase());
  const shared = colours.filter((c, i) => colours.indexOf(c) !== i);
  assert.deepEqual(shared, [], `two membrane parts hold ${shared.join(', ')}; the reader learns one colour per thing, so two things holding one value teaches them the two are the same`);

  for (const p of MEMBRANE) {
    assert.match(p.id, /^[a-z][A-Za-z0-9]*$/, `${JSON.stringify(p.id)} is not a camelCase id, and membranePart() is keyed by it`);
    assert.ok(!(p.id in ORGANELLE_BY_ID), `MEMBRANE colours "${p.id}" ${p.color} and ORGANELLES (src/palette.js) already colours it ${ORGANELLE_BY_ID[p.id]?.color}; one thing must not hold two values, so read ORGANELLE_BY_ID.${p.id} and delete this entry`);
    assert.ok(!(p.id in EXTRA_BY_ID), `MEMBRANE colours "${p.id}" ${p.color} and chapter 3's table (src/figures/lib/cell3-colours.js) already colours it ${EXTRA_BY_ID[p.id]?.color}; one thing must not hold two values, so read organelle("${p.id}") and delete this entry`);
    assert.match(p.color, /^#[0-9a-f]{6}$/, `${p.id} has colour ${JSON.stringify(p.color)}; a membrane colour is six lower-case hex digits, which is what mix() returns`);
    assert.ok(typeof p.name === 'string' && p.name.length > 0, `${p.id} needs a name; it is what a label and a click card show the reader`);
    assert.ok(typeof p.role === 'string' && p.role.length > 20, `${p.id} needs a role sentence saying what the part does; it has ${JSON.stringify(p.role)}`);
    assert.equal(MEMBRANE_BY_ID[p.id], p, `MEMBRANE_BY_ID.${p.id} is not the table's record`);
    assert.equal(membranePart(p.id), p, `membranePart("${p.id}") is not the table's record`);
  }

  // A colour a membrane part shares with an organelle would tell the reader the two are one thing, across
  // the very chapters (3 and 4) that put them in the same figure.
  const elsewhere = [...ORGANELLES.map((o) => ({ ...o, table: 'ORGANELLES (src/palette.js)' })), ...EXTRA_ORGANELLES.map((o) => ({ ...o, table: 'EXTRA_ORGANELLES (src/figures/lib/cell3-colours.js)' }))];
  for (const p of MEMBRANE) {
    const clash = elsewhere.find((o) => o.color.toLowerCase() === p.color.toLowerCase());
    assert.ok(!clash, `MEMBRANE's "${p.id}" and ${clash?.table}'s "${clash?.id}" are both ${p.color}; a reader meeting them in one figure reads them as one thing, so move one of the two`);
  }

  assert.throws(
    () => membranePart('notAMembranePart'),
    (err) => /MEMBRANE/.test(err.message) && /src\/palette\.js/.test(err.message) && MEMBRANE.every((p) => err.message.includes(p.id)),
    'membranePart() given an unknown id must throw naming the table, the file and every id it does have, rather than returning undefined for a figure to draw with',
  );
});

test('every membrane colour is a mix of colours the book already has, so no new hue can arrive unmeasured', (t) => {
  // The colour-vision separations in palette.js's comment were measured over the five accents. A hex
  // written here by hand is a hue nobody measured, and the comment's guarantee would be silently false.
  const hexes = [...block.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hexes, [], `the MEMBRANE literal in src/palette.js carries the hex literal(s) ${hexes.join(', ')}. Every colour there is a mix() of colours the book already has, so that the palette moves it and so that the colour-vision separations recorded above the table still hold; a hand-written hex is a hue that was never measured against the others`);

  const locals = consts();
  const entries = [...block.matchAll(/id:\s*'([^']+)'[\s\S]*?color:\s*([^\n]+?),\s*$/gm)];
  assert.equal(entries.length, MEMBRANE.length, `read ${entries.length} colour expression(s) from the MEMBRANE literal and the table exports ${MEMBRANE.length} entr${MEMBRANE.length === 1 ? 'y' : 'ies'}; the literal's shape has changed and this check is reading the wrong thing`);

  for (const [, id, expr] of entries) {
    const part = MEMBRANE_BY_ID[id];
    assert.ok(part, `the literal declares id "${id}" and MEMBRANE exports no such entry`);
    const call = /^mix\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([-0-9.]+)\s*\)$/.exec(expr.trim());
    assert.ok(call, `${id}'s colour is \`${expr.trim()}\`; every membrane colour is mix(<a palette colour>, <a palette colour>, <t>), which is what keeps the table free of new hues`);
    const [, a, b, amount] = call;
    const from = resolveColourSource(a, locals);
    const to = resolveColourSource(b, locals);
    assert.ok(from, `${id} mixes from \`${a}\`, which this check cannot resolve to a colour the book already has. It reads LIGHT.<token>, DARK.<token>, ORGANELLE_BY_ID.<id>.color and a module-level const bound to one of those; add the form here if it is a palette colour, and do not write a hex`);
    assert.ok(to, `${id} mixes towards \`${b}\`, which this check cannot resolve to a colour the book already has. It reads LIGHT.<token>, DARK.<token>, ORGANELLE_BY_ID.<id>.color and a module-level const bound to one of those; add the form here if it is a palette colour, and do not write a hex`);
    const computed = blend(from, to, Number(amount));
    assert.equal(part.color, computed, `${id} is exported as ${part.color} and \`${expr.trim()}\` mixes ${from} towards ${to} by ${amount}, which is ${computed}; the colour a figure draws is no longer the one the table's own arithmetic states`);
    t.diagnostic(`${id}: ${from} -> ${to} @ ${amount} = ${computed}`);
  }
});

test('no field in this table holds a palette token name, so the symbol on a fill can never be resolved through the theme', () => {
  // This field was `label: 'ink'` — a palette token NAME — until 2026-09-17, over fills that are fixed
  // hexes. A figure resolving it through `ctx.palette` writes #e9e4da on a mid-tone fill in the dark
  // theme, and the ratio below could then only be claimed for the light theme, which this file's header
  // used to say. Chapter 5's METABOLISM settled the shape and both organelle tables followed: the field
  // holds the COLOUR, `ctx.palette[part.symbolColor]` is undefined by construction, and the misuse has
  // nothing to reach for. Widening this is a decision and it is made on these lines.
  const tokens = new Set([...Object.keys(LIGHT), ...Object.keys(DARK)]);
  const offenders = [];
  for (const m of block.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*'([^']*)'/g)) {
    if (tokens.has(m[2])) offenders.push(`${m[1]}: '${m[2]}'`);
  }
  assert.deepEqual(
    offenders,
    [],
    `the MEMBRANE literal in src/palette.js carries ${offenders.join(', ')}, and "${offenders[0]?.split("'")[1]}" is a palette token NAME. Over a fill that is a fixed hex a token name reads right in one theme and inverts in the other. A field here holds the colour itself — \`symbolColor: LIGHT.ink\` — so that both sides of the measurement are fixed and the ratio holds in both themes`,
  );
  for (const p of MEMBRANE) {
    assert.ok(!tokens.has(p.symbolColor), `${p.id}'s symbolColor is "${p.symbolColor}", the name of a palette token; it must be the colour itself`);
    assert.match(p.symbolColor, /^#[0-9a-f]{6}$/, `${p.id}'s symbolColor is ${JSON.stringify(p.symbolColor)}; it is a colour, six lower-case hex digits`);
  }
  const written = [...block.matchAll(/id:\s*'([^']+)',[\s\S]*?symbolColor:\s*([^,\n]+?)\s*,/g)];
  assert.equal(written.length, MEMBRANE.length, `read ${written.length} symbolColor expression(s) from the MEMBRANE literal and the table exports ${MEMBRANE.length}; every entry states one, and the literal's shape has changed or an entry is missing the field`);
  for (const [, id, expr] of written) {
    assert.match(expr.trim(), /^LIGHT\.(ink|paper)$/, `${id}'s symbolColor is \`${expr.trim()}\`; it is written as LIGHT.ink or LIGHT.paper — a value from the light table, fixed like the fill it sits on — so that the ratio measured for it holds in both themes`);
  }
});

test('every symbolColor clears WCAG AA against its own fill, in both themes, because both sides are fixed', (t) => {
  // The membrane figures write a symbol on the fill — Na⁺ on a channel, ATP on a pump. `symbolColor` is
  // the colour that symbol takes, and the comment above the table says it is the one of LIGHT.paper and
  // LIGHT.ink that holds 4.5:1, "measured rather than guessed". This is the measurement, and because both
  // it and the fill are fixed hexes it is the measurement in BOTH themes — there is no second,
  // theme-dependent value left to check, which is what the old `label: 'ink'` shape could not say.
  const worst = [];
  for (const p of MEMBRANE) {
    const ratio = contrast(p.symbolColor, p.color);
    const other = LABEL_NEUTRALS.find((k) => LIGHT[k] !== p.symbolColor);
    t.diagnostic(`${p.id} ${p.color}: ${p.symbolColor} ${ratio.toFixed(2)}:1, ${other} ${contrast(LIGHT[other], p.color).toFixed(2)}:1`);
    worst.push(ratio);
    assert.ok(
      ratio >= AA,
      `${p.id}: a symbol in ${p.symbolColor} on its own fill ${p.color} is ${ratio.toFixed(2)}:1, under WCAG AA's ${AA}:1. The other neutral, ${other} (${LIGHT[other]}), gives ${contrast(LIGHT[other], p.color).toFixed(2)}:1 — take whichever clears, and if neither does, the fill has to move`,
    );
  }
  assert.equal(worst.length, MEMBRANE.length, `measured ${worst.length} symbolColour(s) against ${MEMBRANE.length} fill(s)`);
  t.diagnostic(`${worst.length} symbolColour(s) measured, worst ${Math.min(...worst).toFixed(2)}:1 against a floor of ${AA}:1`);
});

test('nothing derived from the table is written out a second time, in tokens.css or in a figure', () => {
  // src/styles/tokens.css and src/palette.js hold one table between them — the papers, the inks and the
  // five accents — and test/palette.test.js fails when those drift. A derived colour copied in there as
  // a variable would be a second copy no test compares, which is how drift starts.
  for (const p of MEMBRANE) {
    assert.ok(!new RegExp(p.color, 'i').test(tokensCss), `src/styles/tokens.css carries ${p.color}, which is MEMBRANE's "${p.id}". Nothing derived belongs there: the two files hold one table between them and test/palette.test.js compares only that table, so this copy is one nothing checks. A figure sets a membrane colour from JavaScript, through membranePart("${p.id}")`);
  }

  const walk = (dir, out = []) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (f.endsWith('.js')) out.push(p);
    }
    return out;
  };
  const modules = walk(figuresDir).map((p) => ({ path: relative(figuresDir, p).replace(/\\/g, '/'), src: stripComments(readFileSync(p, 'utf8')) }));
  assert.ok(modules.length > 10, `only ${modules.length} module(s) found under src/figures/, so this checked almost nothing`);

  const copies = [];
  for (const m of modules) {
    for (const p of MEMBRANE) if (new RegExp(p.color, 'i').test(m.src)) copies.push(`${m.path} writes ${p.color}, which is MEMBRANE's "${p.id}"`);
    if (/export\s+const\s+MEMBRANE(_BY_ID)?\b/.test(m.src)) copies.push(`${m.path} exports a MEMBRANE table of its own`);
  }
  assert.deepEqual(
    copies,
    [],
    `a membrane colour is written a second time under src/figures/:\n  ${copies.join('\n  ')}\nChapters 2 and 3 each grew a second colour table this way and the two disagreed. Import { membranePart } from '../palette.js' and read the colour through it`,
  );
});
