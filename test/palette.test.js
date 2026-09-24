// src/palette.js and src/styles/tokens.css are the same colour table twice, one for scripts and one
// for stylesheets. This test fails when either drifts from the other. Bound: the nine accent and
// paper/ink tokens named in TOKENS; the soft tints and shadows are CSS-only and not compared.
//
// It also holds the two conditions `spectrumColour` was approved on (2026-09-23, chapter 6's brief): a
// valid sRGB hex at every whole nanometre from 380 to 750, and exactly one importer, `pigment-spectra`.
// Bound of the second: it reads every .js file under src/ as text for the name, so a module that reached
// the function under another name through a re-export would not be seen — and palette.js re-exports
// nothing, which is why a text match is enough today.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { LIGHT, DARK, ORGANELLES, BASES, mix, rgb, spectrumColour } from '../src/palette.js';

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

test('spectrumColour gives a valid sRGB colour at every nanometre from 380 to 750', () => {
  const bad = [];
  for (let nm = 380; nm <= 750; nm += 1) {
    const c = spectrumColour(nm);
    if (!/^#[0-9a-f]{6}$/.test(c)) bad.push(`${nm} nm -> ${JSON.stringify(c)}`);
  }
  assert.deepEqual(bad, [], `spectrumColour returned something that is not #rrggbb at ${bad.length} wavelength(s): ${bad.slice(0, 5).join(', ')}`);
  // It is a spectrum, not one colour: the three primaries of the eye each own a stretch of it.
  const [r, g, b] = [650, 530, 450].map((nm) => rgb(spectrumColour(nm)));
  assert.ok(r[0] > r[1] && r[0] > r[2], `650 nm should be red, came out ${spectrumColour(650)}`);
  assert.ok(g[1] > g[0] && g[1] > g[2], `530 nm should be green, came out ${spectrumColour(530)}`);
  assert.ok(b[2] > b[0] && b[2] > b[1], `450 nm should be blue, came out ${spectrumColour(450)}`);
});

test('spectrumColour of a sample is white when it passes everything and black when it passes nothing', () => {
  assert.equal(spectrumColour(() => 1), '#ffffff');
  assert.equal(spectrumColour(() => 0), '#000000');
  // A filter passing only 500 to 600 nm lets through green light, which is the leaf's case in one line.
  const band = (nm) => (nm >= 500 && nm <= 600 ? 1 : 0);
  const [red, green, blue] = rgb(spectrumColour(band));
  assert.ok(green > red && green > blue, `a 500–600 nm pass-band should look green, came out ${spectrumColour(band)}`);
  assert.throws(() => spectrumColour(() => 2), /0 to 1/);
  assert.throws(() => spectrumColour(300), /380 to 780/);
});

test('spectrumColour has exactly one importer, pigment-spectra', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const users = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.js') && entry.name !== 'palette.js' && readFileSync(path, 'utf8').includes('spectrumColour')) {
        users.push(relative(root, path).replace(/\\/g, '/'));
      }
    }
  };
  walk(join(root, 'src'));
  assert.deepEqual(users, ['src/figures/pigment-spectra.js'], `spectrumColour is the book's one colour that is a measurement and was approved for Figure 6.1 alone (src/palette.js, the comment above it); it is named in ${users.length ? users.join(', ') : 'no module at all'}`);
});
