// One metabolism table. `METABOLISM` in src/palette.js is the colour every chapter-5, -6 and -7 figure
// reads for the currency, the enzyme and the two electron carriers, through `metabolismPart(id)`. This
// file is that table's claims as checks: the ids unique and the book's own, every colour a `mix()` of
// colours the book already has rather than a new hue, every `symbolColor` clearing WCAG AA against the
// fill it is written on, nothing derived copied into src/styles/tokens.css or into a figure, and the two
// values chapter 5's brief asked for and did not get — `adp` and `phosphate` — still refused, with
// `metabolismPart` saying where their colour actually comes from.
//
// It also holds the one claim MEMBRANE's table cannot make, which is why this table exists in a second
// shape rather than as eight more MEMBRANE rows. MEMBRANE carries `label: 'ink'` — a palette TOKEN name —
// while its fills are fixed hexes that do not move with the theme, so a figure resolving that label
// through `ctx.palette` draws a near-white symbol on a near-white fill in the dark theme, and
// test/membrane-table.test.js can only measure it in the light theme and says so in its own header. Here
// the symbol is a fixed colour taken from LIGHT, so both sides of every measurement are fixed and the
// ratio holds in BOTH themes. The check that keeps it that way is "no field in this table holds a palette
// token name": write MEMBRANE's shape here and this file goes red, which is the only thing standing
// between the next chapter and the same defect.
//
// Bound: text, exports and arithmetic — never pixels, and never the reader's eye.
//   * The colour-vision separations recorded above the table (dE76 under simulated protanopia,
//     deuteranopia and tritanopia) are NOT re-measured here, as they are not in the membrane test. What is
//     held is the precondition they rest on: every colour is derived from the palette those separations
//     were measured over, so a new hue cannot arrive without this file going red and the measurement
//     having to be redone.
//   * "A metabolism colour of its own" under src/figures/ is one of the four exported hexes written as a
//     literal, or a module exporting a METABOLISM table. A figure that invents a fifth from some other hex
//     is not seen; the one-table rule can only catch a copy of what exists.
//   * The misuse check is textual: `palette[...symbolColor]` and `[<anything>.symbolColor]` under
//     src/figures/. A figure that copies the hex into a variable first and indexes with that is not seen.
//   * The derivation check reads the source text of the array literal and resolves `LIGHT.<token>`,
//     `DARK.<token>`, `ORGANELLE_BY_ID.<id>.color`, a nested `mix(...)`, and any module-level `const`
//     bound to one of those. A colour written in some other form is not silently allowed: it fails here
//     asking for the form to be added, because a form this file cannot resolve is a form it cannot prove
//     is derived.
// The mixing arithmetic is re-implemented below rather than imported from palette.js, so that this is not
// the module agreeing with itself: a change to `mix()` moves the exported colours away from the values
// this file computes and it goes red.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIGHT, DARK, ORGANELLES, ORGANELLE_BY_ID, MEMBRANE, METABOLISM, METABOLISM_BY_ID, metabolismPart } from '../src/palette.js';
import { EXTRA_ORGANELLES, EXTRA_BY_ID } from '../src/figures/lib/cell3-colours.js';

const paletteSrc = readFileSync(new URL('../src/palette.js', import.meta.url), 'utf8');
const tokensCss = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const figuresDir = fileURLToPath(new URL('../src/figures/', import.meta.url));

// The symbol is written on the fill in one of the book's two neutrals; a third would be a hue on a hue.
const SYMBOL_COLOURS = { ink: LIGHT.ink, paper: LIGHT.paper };
const AA = 4.5;
// What the brief asked for and did not get, and where each one's colour actually comes from. Refusing a
// colour is a decision, so undoing it means deleting a line here as well as adding an entry there.
const REFUSED = {
  adp: /metabolismPart\('atp'\)|third phosphate/,
  phosphate: /ELEMENTS\.P|phosphorus/,
};

// ---- the arithmetic, re-stated ----------------------------------------------------------------------
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
// The book's stated path: channels to 0..1, interpolate, back to 0..255, round. Written out here rather
// than imported, so a change to mix() moves the exported colours away from these and this file goes red.
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
  const head = 'export const METABOLISM = Object.freeze([';
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
  throw new Error('the METABOLISM array literal in src/palette.js never closes');
}

const block = tableSource();

// Every module-level `const NAME = <expression>;` in palette.js, so a colour written through a local
// shorthand (`currency`, `shuttle`) resolves to the palette expression it stands for.
function consts() {
  const out = {};
  for (const m of stripComments(paletteSrc).matchAll(/^const\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/gm)) out[m[1]] = m[2].trim();
  return out;
}

// Split a `mix(...)` argument list on its top-level commas, so a nested mix survives.
function args(text) {
  const out = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') depth -= 1;
    else if (text[i] === ',' && depth === 0) { out.push(text.slice(last, i)); last = i + 1; }
  }
  out.push(text.slice(last));
  return out.map((s) => s.trim());
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
  m = /^mix\(([\s\S]*)\)$/.exec(text);
  if (m) {
    const parts = args(m[1]);
    if (parts.length !== 3) return null;
    const from = resolveColourSource(parts[0], locals, seen);
    const to = resolveColourSource(parts[1], locals, seen);
    const amount = Number(parts[2]);
    if (!from || !to || !Number.isFinite(amount)) return null;
    return blend(from, to, amount);
  }
  if (locals[text] !== undefined && !seen.has(text)) return resolveColourSource(locals[text], locals, new Set([...seen, text]));
  return null;
}

// ---- the checks -------------------------------------------------------------------------------------

test('every metabolism part is one thing: a unique id the book has not already coloured, with a name, a role and a colour of its own', () => {
  assert.ok(METABOLISM.length >= 4, `METABOLISM has ${METABOLISM.length} entr${METABOLISM.length === 1 ? 'y' : 'ies'}; chapter 5's brief asked for six values and four were added, and a table this size means the rules below compared almost nothing`);
  const ids = METABOLISM.map((p) => p.id);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(twice, [], `METABOLISM lists ${twice.join(', ')} twice; METABOLISM_BY_ID keeps the last of the pair, so the first entry's colour is written and never read`);

  const colours = METABOLISM.map((p) => p.color.toLowerCase());
  const shared = colours.filter((c, i) => colours.indexOf(c) !== i);
  assert.deepEqual(shared, [], `two metabolism parts hold ${shared.join(', ')}; the reader learns one colour per thing, so two things holding one value teaches them the two are the same`);

  for (const p of METABOLISM) {
    assert.match(p.id, /^[a-z][A-Za-z0-9]*$/, `${JSON.stringify(p.id)} is not a camelCase id, and metabolismPart() is keyed by it`);
    assert.ok(!(p.id in ORGANELLE_BY_ID), `METABOLISM colours "${p.id}" ${p.color} and ORGANELLES (src/palette.js) already colours it ${ORGANELLE_BY_ID[p.id]?.color}; one thing must not hold two values, so read ORGANELLE_BY_ID.${p.id} and delete this entry`);
    assert.ok(!(p.id in EXTRA_BY_ID), `METABOLISM colours "${p.id}" ${p.color} and chapter 3's table (src/figures/lib/cell3-colours.js) already colours it ${EXTRA_BY_ID[p.id]?.color}; one thing must not hold two values, so read organelle("${p.id}") and delete this entry`);
    assert.ok(!MEMBRANE.some((m) => m.id === p.id), `METABOLISM colours "${p.id}" and MEMBRANE (src/palette.js) already colours it; read membranePart("${p.id}") and delete this entry`);
    assert.match(p.color, /^#[0-9a-f]{6}$/, `${p.id} has colour ${JSON.stringify(p.color)}; a metabolism colour is six lower-case hex digits, which is what mix() returns`);
    assert.ok(typeof p.name === 'string' && p.name.length > 0, `${p.id} needs a name; it is what a label and a click card show the reader`);
    assert.ok(typeof p.role === 'string' && p.role.length > 20, `${p.id} needs a role sentence saying what the part is, and why it holds this colour; it has ${JSON.stringify(p.role)}`);
    assert.equal(METABOLISM_BY_ID[p.id], p, `METABOLISM_BY_ID.${p.id} is not the table's record`);
    assert.equal(metabolismPart(p.id), p, `metabolismPart("${p.id}") is not the table's record`);
  }

  // A colour a metabolism part shares with a structure or a membrane part would tell the reader the two
  // are one thing, in the very chapters (5 to 7) that put them in the same figure.
  const elsewhere = [
    ...ORGANELLES.map((o) => ({ ...o, table: 'ORGANELLES (src/palette.js)' })),
    ...EXTRA_ORGANELLES.map((o) => ({ ...o, table: 'EXTRA_ORGANELLES (src/figures/lib/cell3-colours.js)' })),
    ...MEMBRANE.map((o) => ({ ...o, table: 'MEMBRANE (src/palette.js)' })),
  ];
  for (const p of METABOLISM) {
    const clash = elsewhere.find((o) => o.color.toLowerCase() === p.color.toLowerCase());
    assert.ok(!clash, `METABOLISM's "${p.id}" and ${clash?.table}'s "${clash?.id}" are both ${p.color}; a reader meeting them in one figure reads them as one thing, so move one of the two`);
  }

  assert.throws(
    () => metabolismPart('notAMetabolismPart'),
    (err) => /METABOLISM/.test(err.message) && /src\/palette\.js/.test(err.message) && METABOLISM.every((p) => err.message.includes(p.id)),
    'metabolismPart() given an unknown id must throw naming the table, the file and every id it does have, rather than returning undefined for a figure to draw with',
  );
});

test('the two values the brief asked for and did not get are still refused, and say where their colour comes from', () => {
  // Chapter 5's brief asked for six values; `phosphate` was refused because chapter 2 had already fixed
  // phosphorus, and `adp` because the currency's slot is forced and has no room for a second value. Both
  // reasons are written above the table. A later chapter that wants one of them has to delete a line here
  // as well, which is the point: a refusal nobody can see is one that gets made again.
  for (const [id, mustSay] of Object.entries(REFUSED)) {
    assert.ok(!(id in METABOLISM_BY_ID), `METABOLISM now has an entry for "${id}", which chapter 5 refused for a reason written above the table in src/palette.js. Adding it is a decision: make it there, and delete "${id}" from REFUSED here with the reason`);
    let thrown = null;
    assert.throws(() => metabolismPart(id), (err) => { thrown = err; return true; }, `metabolismPart("${id}") must throw: it is a colour the book deliberately does not have, and returning undefined hands a figure an undefined fill`);
    assert.match(thrown.message, mustSay, `metabolismPart("${id}") throws "${thrown.message}", which does not say where the colour actually comes from. An error message names what happened, which input caused it, and what would satisfy it`);
    assert.ok(thrown.message.includes(id), `metabolismPart("${id}") throws without naming the id it was given`);
  }
});

test('every metabolism colour is a mix of colours the book already has, so no new hue can arrive unmeasured', (t) => {
  // The colour-vision separations in palette.js's comment were measured over the five accents. A hex
  // written here by hand is a hue nobody measured, and the comment's guarantee would be silently false.
  const hexes = [...block.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hexes, [], `the METABOLISM literal in src/palette.js carries the hex literal(s) ${hexes.join(', ')}. Every colour there is a mix() of colours the book already has, so that the palette moves it and so that the separations recorded above the table still hold; a hand-written hex is a hue that was never measured against the others`);

  const locals = consts();
  const entries = [...block.matchAll(/id:\s*'([^']+)'[\s\S]*?color:\s*([^\n]+?),\s*$/gm)];
  assert.equal(entries.length, METABOLISM.length, `read ${entries.length} colour expression(s) from the METABOLISM literal and the table exports ${METABOLISM.length} entr${METABOLISM.length === 1 ? 'y' : 'ies'}; the literal's shape has changed and this check is reading the wrong thing`);

  for (const [, id, expr] of entries) {
    const part = METABOLISM_BY_ID[id];
    assert.ok(part, `the literal declares id "${id}" and METABOLISM exports no such entry`);
    const computed = resolveColourSource(expr.trim(), locals);
    assert.ok(computed, `${id}'s colour is \`${expr.trim()}\`, which this check cannot resolve to a colour the book already has. It reads LIGHT.<token>, DARK.<token>, ORGANELLE_BY_ID.<id>.color, a nested mix(a, b, t) and a module-level const bound to one of those; add the form here if it is a palette colour, and do not write a hex`);
    assert.equal(part.color, computed, `${id} is exported as ${part.color} and \`${expr.trim()}\` works out to ${computed}; the colour a figure draws is no longer the one the table's own arithmetic states`);
    t.diagnostic(`${id}: ${expr.trim()} = ${computed}`);
  }
});

test('no field in this table holds a palette token name, so the symbol on a fill can never be resolved through the theme', () => {
  // This is the defect the table's second shape exists to prevent. MEMBRANE above carries `label: 'ink'`,
  // a TOKEN name, over a fill that is a fixed hex; resolved through ctx.palette in the dark theme that
  // writes #e9e4da on a mid-tone fill. Every field here holds a value, never the name of one, so the
  // misuse has nothing to reach for. Widening this is a decision and it is made on this line.
  const tokens = new Set([...Object.keys(LIGHT), ...Object.keys(DARK)]);
  const offenders = [];
  let firstToken = '';
  for (const m of block.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*'([^']*)'/g)) {
    if (!tokens.has(m[2])) continue;
    if (!offenders.length) firstToken = m[2];
    offenders.push(`${m[1]}: '${m[2]}'`);
  }
  assert.deepEqual(
    offenders,
    [],
    `the METABOLISM literal carries ${offenders.join(', ')}, and "${firstToken}" is a palette token NAME. MEMBRANE's \`label: 'ink'\` is exactly this, over fills that are fixed hexes, and a figure resolving it through ctx.palette draws a near-white symbol on a near-white fill in the dark theme. A field here holds the colour itself — \`symbolColor: LIGHT.ink\` — so that both sides of the measurement are fixed and the ratio holds in both themes`,
  );
  // And the value is what the source says it is, not a string that happens to look like a colour.
  for (const p of METABOLISM) {
    assert.ok(!tokens.has(p.symbolColor), `${p.id}'s symbolColor is "${p.symbolColor}", the name of a palette token; it must be the colour itself`);
    assert.match(p.symbolColor, /^#[0-9a-f]{6}$/, `${p.id}'s symbolColor is ${JSON.stringify(p.symbolColor)}; it is a colour, six lower-case hex digits`);
  }
  const written = [...block.matchAll(/id:\s*'([^']+)'[\s\S]*?symbolColor:\s*([^\n]+?),\s*$/gm)];
  assert.equal(written.length, METABOLISM.length, `read ${written.length} symbolColor expression(s) and the table exports ${METABOLISM.length}; the literal's shape has changed and this check is reading the wrong thing`);
  for (const [, id, expr] of written) {
    assert.match(expr.trim(), /^LIGHT\.(ink|paper)$/, `${id}'s symbolColor is \`${expr.trim()}\`; it is written as LIGHT.ink or LIGHT.paper — a value from the light table, fixed like the fill it sits on — so that the ratio measured for it holds in both themes`);
  }
});

test('every symbolColor clears WCAG AA against its own fill, in both themes, because both sides are fixed', (t) => {
  // The chapter-5 figures write a symbol on the fill: ATP on the currency, NADH on a carrier, an enzyme's
  // name on the enzyme. `symbolColor` is the colour that symbol takes. Unlike MEMBRANE's `label`, both it
  // and the fill are fixed hexes, so this single measurement is the measurement in both themes — there is
  // no second, theme-dependent value to check, and that is the claim.
  const worst = [];
  for (const p of METABOLISM) {
    const name = Object.keys(SYMBOL_COLOURS).find((k) => SYMBOL_COLOURS[k] === p.symbolColor);
    assert.ok(name, `${p.id} writes its symbol in ${p.symbolColor}, which is neither LIGHT.ink (${LIGHT.ink}) nor LIGHT.paper (${LIGHT.paper}) — the book's two neutrals. A third would put a hue on a hue. Widening this is a decision, so widen SYMBOL_COLOURS here with it`);
    const ratio = contrast(p.symbolColor, p.color);
    const other = Object.keys(SYMBOL_COLOURS).find((k) => k !== name);
    t.diagnostic(`${p.id} ${p.color}: ${name} ${ratio.toFixed(2)}:1, ${other} ${contrast(SYMBOL_COLOURS[other], p.color).toFixed(2)}:1`);
    worst.push(ratio);
    assert.ok(
      ratio >= AA,
      `${p.id}: a symbol in ${name} (${p.symbolColor}) on its own fill ${p.color} is ${ratio.toFixed(2)}:1, under WCAG AA's ${AA}:1. The other neutral, ${other} (${SYMBOL_COLOURS[other]}), gives ${contrast(SYMBOL_COLOURS[other], p.color).toFixed(2)}:1 — take whichever clears, and if neither does, the fill has to move`,
    );
  }
  assert.equal(worst.length, METABOLISM.length, `measured ${worst.length} symbol(s) against ${METABOLISM.length} fill(s)`);
  t.diagnostic(`${worst.length} symbol(s) measured, worst ${Math.min(...worst).toFixed(2)}:1 against a floor of ${AA}:1`);
});

test('nothing derived from the table is written out a second time, in tokens.css or in a figure, and no figure resolves symbolColor through a palette', () => {
  // src/styles/tokens.css and src/palette.js hold one table between them — the papers, the inks and the
  // five accents — and test/palette.test.js fails when those drift. A derived colour copied in there as a
  // variable would be a second copy no test compares, which is how drift starts.
  for (const p of METABOLISM) {
    assert.ok(!new RegExp(p.color, 'i').test(tokensCss), `src/styles/tokens.css carries ${p.color}, which is METABOLISM's "${p.id}". Nothing derived belongs there: the two files hold one table between them and test/palette.test.js compares only that table, so this copy is one nothing checks. A figure sets a metabolism colour from JavaScript, through metabolismPart("${p.id}")`);
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
    for (const p of METABOLISM) if (new RegExp(p.color, 'i').test(m.src)) copies.push(`${m.path} writes ${p.color}, which is METABOLISM's "${p.id}"`);
    if (/export\s+const\s+METABOLISM(_BY_ID)?\b/.test(m.src)) copies.push(`${m.path} exports a METABOLISM table of its own`);
  }
  assert.deepEqual(
    copies,
    [],
    `a metabolism colour is written a second time under src/figures/:\n  ${copies.join('\n  ')}\nChapters 2 and 3 each grew a second colour table this way and the two disagreed. Import { metabolismPart } from '../palette.js' and read the colour through it`,
  );

  // The misuse this table is shaped to prevent, checked where it would be written.
  const resolved = [];
  for (const m of modules) {
    if (/palette\s*\[[^\]]*symbolColor/.test(m.src)) resolved.push(`${m.path} indexes a palette with a symbolColor`);
    if (/\[\s*[A-Za-z_$][\w$.]*\.symbolColor\s*\]/.test(m.src)) resolved.push(`${m.path} uses a symbolColor as a key`);
  }
  assert.deepEqual(
    resolved,
    [],
    `${resolved.join('; ')}. \`symbolColor\` is already a colour — that is why it is not called \`label\` — so indexing a palette with it yields undefined and the symbol is drawn in whatever the canvas or the DOM falls back to. Use it directly as the fill`,
  );
});
