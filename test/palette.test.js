// src/palette.js and src/styles/tokens.css are the same colour table twice, one for scripts and one
// for stylesheets. This test fails when either drifts from the other. Bound: the nine accent and
// paper/ink tokens named in TOKENS; the soft tints and shadows are CSS-only and not compared.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIGHT, DARK, ORGANELLES, BASES, mix, rgb } from '../src/palette.js';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const TOKENS = {
  paper: '--paper', paper2: '--paper-2', paper3: '--paper-3', ink: '--ink', inkSoft: '--ink-soft', inkFaint: '--ink-faint',
  rule: '--rule', ruleStrong: '--rule-strong', leaf: '--leaf', water: '--water', coral: '--coral', violet: '--violet', gold: '--gold',
};

function block(selectorStart) {
  const i = css.indexOf(selectorStart);
  assert.notEqual(i, -1, `tokens.css has no block starting ${selectorStart}`);
  const open = css.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < css.length; j += 1) {
    if (css[j] === '{') depth += 1;
    if (css[j] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open, j);
    }
  }
  throw new Error(`unclosed block at ${selectorStart}`);
}

function values(text) {
  const out = {};
  for (const [key, name] of Object.entries(TOKENS)) {
    const m = text.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
    assert.ok(m, `token ${name} missing from block`);
    out[key] = m[1].toLowerCase();
  }
  return out;
}

test('the light tokens in tokens.css equal LIGHT in palette.js', () => {
  assert.deepEqual(values(block(':root {')), { ...LIGHT });
});

test('the explicit dark tokens equal DARK in palette.js', () => {
  assert.deepEqual(values(block(':root[data-theme="dark"]')), { ...DARK });
});

test('the system-dark block equals the explicit dark block, so the toggle and the OS agree', () => {
  assert.deepEqual(values(block(':root:not([data-theme="light"])')), values(block(':root[data-theme="dark"]')));
});

test('organelles and bases have unique ids and valid hex colours', () => {
  const ids = ORGANELLES.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const o of ORGANELLES) {
    assert.match(o.color, /^#[0-9a-f]{6}$/i, `${o.id} colour ${o.color}`);
    assert.ok(o.role.length > 20, `${o.id} needs a role sentence`);
  }
  for (const [k, b] of Object.entries(BASES)) {
    assert.match(b.color, /^#[0-9a-f]{6}$/i);
    assert.equal(BASES[b.pairsWith].pairsWith, k, `${k} pairs with ${b.pairsWith}, which must pair back`);
  }
});

test('mix and rgb round-trip', () => {
  assert.deepEqual(rgb('#ff0000'), [1, 0, 0]);
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(mix('#2f7d4f', '#2f7d4f', 0.3), '#2f7d4f');
});
