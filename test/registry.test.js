// Every kind the registry names must have a module on disk that exports the contract's two names, and
// every module under src/figures/ that exports mount must be registered, so a figure cannot exist
// without the frame knowing it. Bound: file existence and a text match on the two exports; the modules
// are not imported (they import `three` by its bare specifier, which Node cannot resolve).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FIGURES, KINDS } from '../src/figures/registry.js';

const dir = fileURLToPath(new URL('../src/figures/', import.meta.url));

test('every registered kind has a module exporting meta and mount, with a matching kind', () => {
  for (const kind of KINDS) {
    const file = fileURLToPath(FIGURES[kind].url);
    assert.ok(existsSync(file), `${kind}: ${file} does not exist`);
    const src = readFileSync(file, 'utf8');
    assert.match(src, /export\s+(const|let)\s+meta\b/, `${kind}: no exported meta`);
    assert.match(src, /export\s+function\s+mount\b/, `${kind}: no exported mount`);
    assert.ok(src.includes(`'${kind}'`) || src.includes(`"${kind}"`), `${kind}: meta does not name its kind`);
    assert.ok(FIGURES[kind].aspect > 0.5 && FIGURES[kind].aspect < 4, `${kind}: aspect ${FIGURES[kind].aspect} is outside 0.5..4`);
  }
});

test('every figure module on disk is registered', () => {
  const modules = readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'registry.js');
  for (const f of modules) {
    const kind = f.replace(/\.js$/, '');
    assert.ok(KINDS.includes(kind), `src/figures/${f} exports a figure but the registry has no kind "${kind}"`);
  }
});
