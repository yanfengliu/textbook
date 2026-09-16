// A trimming variable that names nothing must stop a gate, not empty it (tools/lib/trim.js).
//
// Claim: unset means everything, or what the caller says unset means; a value naming entries that
// exist returns those entries in the list's own order; a value naming anything that does not exist
// throws, naming the variable, the value and every id that does exist; and no gate under tools/ splits
// a trimming variable on its own any more. Bound: the helper with fake lists, and the tools' source
// text for the last claim. That a gate then stops before it launches a browser or empties out/ is
// proved by running one with a bad value (docs/learning/gate-proofs.md, "trim"), not here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trim, PAGE_HINT } from '../tools/lib/trim.js';

const PAGES = [{ id: 'library' }, { id: 'biology/ch01' }, { id: 'today' }];
const idOf = (p) => p.id;
const NAME = 'TRIM_TEST_PAGES';

function withEnv(value, fn) {
  const before = process.env[NAME];
  if (value === undefined) delete process.env[NAME];
  else process.env[NAME] = value;
  try {
    return fn();
  } finally {
    if (before === undefined) delete process.env[NAME];
    else process.env[NAME] = before;
  }
}

test('unset, empty, or nothing but separators means everything, or what the caller says unset means', () => {
  for (const v of [undefined, '', ',', ' , ']) {
    assert.deepEqual(withEnv(v, () => trim(NAME, PAGES, { idOf })), PAGES, JSON.stringify(v));
    assert.deepEqual(withEnv(v, () => trim(NAME, ['light', 'dark'], { unset: ['light'] })), ['light'], JSON.stringify(v));
  }
});

test("names that exist select those entries, in the list's own order, whitespace ignored", () => {
  assert.deepEqual(withEnv('today, library', () => trim(NAME, PAGES, { idOf })).map(idOf), ['library', 'today']);
  assert.deepEqual(withEnv('biology/ch01', () => trim(NAME, PAGES, { idOf })).map(idOf), ['biology/ch01']);
  assert.deepEqual(withEnv('dark', () => trim(NAME, ['light', 'dark'], { unset: ['light'] })), ['dark']);
});

test('a name that exists nowhere throws, naming the variable, the value, the noun and every id that does exist', () => {
  assert.throws(() => withEnv('ch01', () => trim(NAME, PAGES, { idOf, noun: 'page', hint: PAGE_HINT })), (err) => {
    assert.ok(err.message.startsWith(`${NAME}=ch01 names no such page: "ch01"`), err.message);
    assert.ok(err.message.includes('The pages are: library, biology/ch01, today.'), err.message);
    assert.ok(err.message.endsWith(PAGE_HINT), err.message);
    return true;
  });
});

test('one bad name among good ones still throws: the run must not quietly drop it', () => {
  assert.throws(() => withEnv('library,ch01', () => trim(NAME, PAGES, { idOf, noun: 'page' })), /names no such page: "ch01"\./);
});

test('no gate splits a trimming variable itself any more', () => {
  for (const t of ['shot', 'devices', 'narrow', 'drive', 'sweep3d', 'sitting']) {
    const src = readFileSync(new URL(`../tools/${t}.js`, import.meta.url), 'utf8');
    const own = src.match(/process\.env\.[A-Z_]+\.split\(/g) || [];
    assert.deepEqual(own, [], `tools/${t}.js splits a variable itself: ${own.join(', ')}; read it through trim() in tools/lib/trim.js so a value naming nothing fails`);
    assert.ok(/\btrim\(\s*'[A-Z_]+'/.test(src), `tools/${t}.js reads no trimming variable through trim()`);
  }
});
