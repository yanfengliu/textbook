// Every kind the registry names must have a module on disk that exports the contract's two names, and
// every module under src/figures/ that exports mount must be registered, so a figure cannot exist
// without the frame knowing it. Bound: file existence and a text match on the two exports; the modules
// are not imported (they import `three` by its bare specifier, which Node cannot resolve) — except for
// the syntax check below, which parses them without running them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

test('every figure module parses', () => {
  // The defect this exists for, found 2026-09-12 while mounting a figure on a new chapter: two modules
  // carried a syntax error and the whole suite was green — 116 of 116 — because every check above reads a
  // module's TEXT and none of them parses it. The frame is the first thing that parses it, at runtime, in
  // a browser, and it reports the failure as `figure is in state "error": its module did not load`, which
  // `npm run shot` sees and the unit gate cannot.
  //
  // Both instances were the same mistake and both were inside a CSS template literal: a backtick used to
  // quote an identifier in a COMMENT, which closed the template and left the identifier as code.
  //   zj-split: "...content-sized here: `fr` rows in a short body..."   -> SyntaxError: Unexpected identifier 'fr'
  //   zj-words: "...on the label. `color` is set here because..."        -> SyntaxError: Unexpected identifier 'color'
  // So the check is a parse rather than a pattern: a lint for one quoting habit would not have caught the
  // second instance, and a parse catches the whole class.
  //
  // `node --check` parses without resolving imports, which is why it works on a module that imports
  // `three` by a bare specifier Node cannot resolve. Bound: syntax only. It says nothing about whether a
  // module runs, mounts, or draws anything — that is `npm run drive`, `narrow` and `sweep3d`.
  const modules = readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => fileURLToPath(new URL(f, `file:///${dir.replace(/\\/g, '/')}/`)));
  assert.ok(modules.length > 0, 'no figure modules were found, so this test checked nothing');
  const broken = [];
  for (const file of modules) {
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (err) {
      const message = String(err.stderr || err.message).split('\n').slice(0, 3).join(' ').trim();
      broken.push(`${file.slice(dir.length)}: ${message}`);
    }
  }
  assert.deepEqual(broken, [], `${broken.length} figure module(s) do not parse, so the frame will show an error box where a figure should be:\n  ${broken.join('\n  ')}`);
});

test('every figure module on disk is registered', () => {
  const modules = readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'registry.js');
  for (const f of modules) {
    const kind = f.replace(/\.js$/, '');
    assert.ok(KINDS.includes(kind), `src/figures/${f} exports a figure but the registry has no kind "${kind}"`);
  }
});
