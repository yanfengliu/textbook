// Every page that loads the shell carries the theme block, verbatim, in its <head>, before its first
// stylesheet — and the block itself resolves the theme the way the shell does and cannot throw.
//
// The defect (docs/learning/defect-register.md, 2026-09-22): src/shell.js applies the reader's stored
// theme, or `?theme=`, while its module evaluates, which is after the whole page has been parsed and
// styled once in the theme the system prefers. A reader whose stored choice differed from their system
// saw one to three frames of the whole page in the other theme and then the titles fade across. The fix
// is THEME_BLOCK in src/theme-early.js, a classic inline script each page carries in its <head>. A page
// cannot import it — it has to run before any module could — so every page holds a copy, and a copy is
// the thing that goes missing on a new page or drifts on an old one. This file is what holds the copies.
//
// Claim:
//   1. Discovery finds the pages that owe the block — every published page whose modules reach
//      src/shell.js (tools/lib/shell-pages.js) — and it is derived a second way here: every page the
//      gates visit (PAGES in tools/lib/browser.js) and every published page whose scripts name the shell's
//      two entry modules must be among them, and there must be at least one. A page that reaches the shell
//      only through its own script, loaded by a relative `src`, is found too; neither derivation can see
//      that case, so a fixture holds it (test/fixtures/shell-pages/).
//   2. Each of those pages carries THEME_BLOCK exactly once, character for character after carriage
//      returns are dropped, outside any comment, inside <head>, and before its first stylesheet (a
//      `<link rel="stylesheet">` or a `<style>`). The failure names each page, says which of those it
//      broke, and prints the block to paste and where it goes — chapters written on other branches meet
//      this message cold, so it explains itself.
//   3. The shell takes the storage key from src/theme-early.js rather than spelling it again.
//   4. The block's own script, run in a bare context, gives `?theme=dark|light` precedence and stores
//      nothing, falls back to the stored choice, sets nothing when there is none, and neither throws nor
//      sets anything when storage throws on read or on access; and it leaves no global behind.
//
// Bound: text and a sandbox. It proves each page carries the block and where; that the block runs before
// <body> exists on the real page, and agrees with what the shell leaves there, is `npm run theme`'s, in a
// browser. Case 4 compares the block with the rules as written above, not with the shell's code; the
// browser gate is what compares the two on real pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { THEME_BLOCK, THEME_KEY } from '../src/theme-early.js';
import { shellPages, shellChain, blankComments, servedPath } from '../tools/lib/shell-pages.js';
import { PAGES } from '../tools/lib/browser.js';
import { publishedFiles } from '../tools/pages-exclude.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFileSync(join(ROOT, file), 'utf8').replace(/\r/g, '');
const lineAt = (text, offset) => text.slice(0, offset).split('\n').length;

// The one explanation every failure below ends with, so a message read cold says what the block is for,
// what to paste and where, and where to change it.
const HOW_TO_FIX = [
  '',
  'What the block is for: src/shell.js applies the reader\'s stored theme (or ?theme=) only after the page has been styled once, so a page without the block shows a reader whose choice differs from their system the whole page in the other theme for a few frames, and then its titles fade across. The block applies the same choice before anything is styled.',
  '',
  'Paste these lines exactly as they are into the page\'s <head>, BEFORE its first stylesheet (<link rel="stylesheet"> or <style>) — every page in the tree carries them on the line after <meta name="viewport" …>:',
  '',
  THEME_BLOCK,
  '',
  'Never edit a page\'s copy. To change the block, change THEME_BLOCK in src/theme-early.js and paste the new text into every page this test names.',
].join('\n');

test('discovery finds the pages that load the shell, and a second derivation agrees', (t) => {
  const pages = shellPages();
  assert.ok(pages.length > 0, 'tools/lib/shell-pages.js found no page that loads src/shell.js, so every check in this file would compare nothing. The walk is broken, not the site.');
  const found = new Set(pages.map((p) => p.path));
  // The gates' own list, derived from the books on disk by a different function.
  const unvisited = PAGES.filter((p) => !found.has(p.path)).map((p) => `${p.id} (${p.path})`);
  assert.deepEqual(unvisited, [], `these pages are visited by the page gates (PAGES in tools/lib/browser.js) but tools/lib/shell-pages.js did not find them loading src/shell.js: ${unvisited.join(', ')}. Either a page stopped loading the shell or the import walk stopped following it.`);
  // A plain text search: any published page whose scripts name the shell or the component bundle.
  const named = publishedFiles()
    .filter((file) => file.endsWith('.html'))
    .filter((file) => /src\/(shell|components\/index)\.js/.test(blankComments(read(file))))
    .filter((file) => !found.has(servedPath(file)));
  assert.deepEqual(named, [], `these published pages name src/shell.js or src/components/index.js in their markup, and the import walk in tools/lib/shell-pages.js did not find them: ${named.join(', ')}`);
  t.diagnostic(`${pages.length} page(s) load the shell: ${pages.map((p) => p.file).join(', ')}`);
});

// Review finding R3 (2026-09-23): the walk read a page's `<script src>` by the import-specifier rule, so
// `src="lab.js"`, an ordinary URL relative to the page, was dropped as a bare specifier, and a page that
// reached the shell only through its own script file was not found. Neither derivation above could see
// it: such a page is not in PAGES, and its markup names neither of the shell's modules. The fixture under
// test/fixtures/shell-pages/ is that page (lab/), beside one whose script reaches nothing (plain/).
const FIXTURE = fileURLToPath(new URL('./fixtures/shell-pages/', import.meta.url));

test("discovery follows a page's <script src> as a URL relative to the page, not as an import specifier", (t) => {
  const chain = shellChain('lab/index.html', FIXTURE);
  assert.deepEqual(chain, ['lab/index.html', 'lab/lab.js', 'src/components/index.js', 'src/shell.js'],
    `tools/lib/shell-pages.js did not follow the fixture page lab/index.html to the shell: it returned ${JSON.stringify(chain)}, where the page loads lab.js by <script type="module" src="lab.js"> and lab.js imports ../src/components/index.js, which imports ../shell.js. A <script src> is a URL resolved against the page, so "lab.js" is lab/lab.js; only an import specifier goes through the import map when it is bare.`);
  const found = shellPages(FIXTURE).map((p) => p.file);
  assert.deepEqual(found, ['lab/index.html'],
    `on the fixture tree, shellPages() found ${JSON.stringify(found)}, where exactly lab/index.html loads the shell; plain/index.html loads its script the same way and reaches nothing, so it owes no block`);
  t.diagnostic(`fixture: ${chain?.join(' -> ')}`);
});

// What is wrong with one page's copy, or null.
function blockProblem(file) {
  const text = read(file);
  const blank = blankComments(text);
  const hits = [];
  for (let at = text.indexOf(THEME_BLOCK); at >= 0; at = text.indexOf(THEME_BLOCK, at + 1)) hits.push(at);
  if (hits.length > 1) return `${file} carries the block ${hits.length} times (lines ${hits.map((at) => lineAt(text, at)).join(', ')}); it needs it once.`;
  if (hits.length === 0) {
    // A copy that has drifted still says where it is: its comment line, or failing that the script that
    // sets the theme's dataset field. Line it up against the block and report the first line that differs.
    const lines = text.split('\n');
    const ours = THEME_BLOCK.split('\n');
    let start = lines.indexOf(ours[0]);
    if (start < 0) {
      const script = lines.findIndex((line) => line.includes('dataset.theme'));
      if (script >= 0) start = script - ours.findIndex((line) => line.startsWith('<script>'));
    }
    if (start < 0) return `${file} does not carry the block at all.`;
    const j = ours.findIndex((line, k) => lines[start + k] !== line);
    if (j < 0) return `${file} carries every line of the block and still not the block itself, which should be impossible; compare the two by hand.`;
    const theirs = lines[start + j] ?? '(the file ends)';
    let col = 0;
    while (col < theirs.length && theirs[col] === ours[j][col]) col += 1;
    return `${file} carries a copy of the block that differs from THEME_BLOCK in src/theme-early.js. Its line ${start + j + 1} parts from the block at column ${col + 1}:\n      page:  …${theirs.slice(Math.max(0, col - 20), col + 40)}…\n      block: …${ours[j].slice(Math.max(0, col - 20), col + 40)}…\n    Replace the page's copy with the block below, whole.`;
  }
  const at = hits[0];
  const scriptAt = at + THEME_BLOCK.indexOf('<script>');
  if (!blank.startsWith('<script>', scriptAt)) return `${file} carries the block on line ${lineAt(text, at)} inside an HTML comment, where its script never runs.`;
  const headEnd = blank.search(/<\/head\s*>|<body\b/i);
  if (headEnd >= 0 && at > headEnd) return `${file} carries the block on line ${lineAt(text, at)}, outside <head> (which ends on line ${lineAt(text, headEnd)}); by then <body> exists and the page has been styled.`;
  const sheet = blank.search(/<link\b[^>]*\brel\s*=\s*["']?[^"'>]*\bstylesheet\b[^>]*>|<style\b/i);
  if (sheet >= 0 && at > sheet) return `${file} carries the block on line ${lineAt(text, at)}, after its first stylesheet on line ${lineAt(text, sheet)}; a script after a stylesheet that is still loading waits for it, so the block has to come first.`;
  return null;
}

test('every page that loads the shell carries the theme block, verbatim, before its first stylesheet', (t) => {
  const pages = shellPages();
  assert.ok(pages.length > 0, 'no page that loads the shell was found, so this compared nothing');
  const problems = pages.map((p) => blockProblem(p.file)).filter(Boolean);
  assert.equal(problems.length, 0, `${problems.length} of ${pages.length} page(s) that load the shell do not carry the theme block as they must:\n\n${problems.map((p) => `  ${p}`).join('\n')}\n${HOW_TO_FIX}`);
  t.diagnostic(`${pages.length} page(s) checked, each carrying the block once, in <head>, before its first stylesheet`);
});

test('the shell stores the theme under the key the block reads, taken from the same module', () => {
  const shell = read('src/shell.js');
  assert.match(shell, /import\s*\{[^}]*\bTHEME_KEY\b[^}]*\}\s*from\s*['"]\.\/theme-early\.js['"]/,
    'src/shell.js no longer imports THEME_KEY from ./theme-early.js, so the key it stores the theme under and the key every page\'s <head> block reads can come apart, and a reader\'s choice would be applied by one and not the other. Import it again rather than spelling the key.');
  for (const quote of ["'", '"', '`']) {
    assert.ok(!shell.includes(`${quote}${THEME_KEY}${quote}`), `src/shell.js spells the storage key ${quote}${THEME_KEY}${quote} itself; it must use THEME_KEY from ./theme-early.js, so the one value cannot be two`);
  }
});

// ---- the block's own logic, in a sandbox ----------------------------------------------------------
//
// `storage`: 'ok' | 'getItem-throws' (a read refused, as a browser blocking site data can) | 'blocked'
// (the `localStorage` accessor itself throws, as it does in a sandboxed frame or under "block all
// cookies").
const SCRIPT = /<script>([\s\S]*?)<\/script>/.exec(THEME_BLOCK)?.[1];

function runBlock({ search = '', stored, storage = 'ok' }) {
  const values = new Map(stored === undefined ? [] : [[THEME_KEY, stored]]);
  const writes = [];
  const dataset = {};
  // How many times the block reached for storage at all: a case about a throwing store must show the
  // throw was reached, or it passes on a sandbox that never threw.
  let touched = 0;
  const sandbox = { location: { search }, URLSearchParams, document: { documentElement: { dataset } } };
  const store = {
    getItem: (key) => {
      touched += 1;
      if (storage === 'getItem-throws') throw new Error('SecurityError: the operation is insecure');
      return values.has(key) ? values.get(key) : null;
    },
    setItem: (key, value) => writes.push(`setItem(${key}, ${value})`),
    removeItem: (key) => writes.push(`removeItem(${key})`),
  };
  if (storage === 'blocked') Object.defineProperty(sandbox, 'localStorage', { enumerable: true, get() { touched += 1; throw new Error('SecurityError: access is denied for this document'); } });
  else sandbox.localStorage = store;
  const before = Object.keys(sandbox).sort();
  vm.createContext(sandbox);
  let thrown = null;
  try {
    vm.runInContext(SCRIPT, sandbox);
  } catch (err) {
    thrown = err;
  }
  const leaked = Object.keys(sandbox).filter((k) => !before.includes(k));
  return { theme: dataset.theme, writes, thrown, leaked, touched };
}

const CASES = [
  { name: 'nothing stored, no ?theme=', search: '', expect: undefined },
  { name: 'stored dark', search: '', stored: 'dark', expect: 'dark' },
  { name: 'stored light', search: '', stored: 'light', expect: 'light' },
  { name: '?theme=dark over a stored light', search: '?theme=dark', stored: 'light', expect: 'dark' },
  { name: '?theme=light over a stored dark', search: '?theme=light', stored: 'dark', expect: 'light' },
  { name: "?theme=dark among the gates' own parameters", search: '?eager=1&t=0&theme=dark', expect: 'dark' },
  { name: "an unknown ?theme= falls through to the stored choice, as the shell's does", search: '?theme=sepia', stored: 'dark', expect: 'dark' },
  { name: 'a stored value the CSS does not know is applied as it is, as the shell applies it', search: '', stored: 'sepia', expect: 'sepia' },
  { name: 'an empty stored value is no choice', search: '', stored: '', expect: undefined },
  { name: 'getItem throws: nothing set, nothing thrown', search: '', stored: 'dark', storage: 'getItem-throws', expect: undefined },
  { name: 'the storage accessor throws: nothing set, nothing thrown', search: '', stored: 'dark', storage: 'blocked', expect: undefined },
  { name: '?theme=dark needs no storage at all', search: '?theme=dark', storage: 'blocked', expect: 'dark' },
];

test("the block's own logic: ?theme= first and never stored, then the stored choice, then nothing, and storage that throws leaves nothing set", (t) => {
  assert.ok(SCRIPT, 'THEME_BLOCK in src/theme-early.js holds no <script>…</script>, so there is nothing to run');
  for (const c of CASES) {
    const r = runBlock(c);
    assert.equal(r.thrown, null, `${c.name}: the block threw ${r.thrown?.message}. A throw in a <head> script aborts it before it applies anything; every storage access has to be inside its try.`);
    assert.equal(r.theme, c.expect, `${c.name}: the block set data-theme to ${JSON.stringify(r.theme)}, where the shell's rule gives ${JSON.stringify(c.expect)}`);
    assert.deepEqual(r.writes, [], `${c.name}: the block wrote to storage (${r.writes.join(', ')}); ?theme= is for one page load and is never remembered, and the stored choice is the toggle's to write`);
    assert.deepEqual(r.leaked, [], `${c.name}: the block left ${r.leaked.join(', ')} on the global object, where a module naming an undeclared ${r.leaked[0]} would find it instead of throwing`);
    // The shell reads storage only when ?theme= has not decided, and so must the block.
    const urlDecides = /[?&]theme=(dark|light)(&|$)/.test(c.search);
    assert.ok(urlDecides ? r.touched === 0 : r.touched > 0, `${c.name}: the block reached for storage ${r.touched} time(s); it must read it exactly when ?theme= has not decided (${urlDecides ? 'here it had' : 'here it had not'})`);
  }
  t.diagnostic(`${CASES.length} case(s) run`);
});
