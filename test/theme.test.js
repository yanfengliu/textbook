// The reader's theme is written to `<html>` (`src/shell.js`: `documentElement.dataset.theme`), and a
// stylesheet can only answer it with a selector that matches that element. `tongjian/zj.css` answers
// with `.zj[data-theme="dark"]` — class and attribute in the same compound — so it matches only an
// element carrying both. On 2026-09-12 all three chapter pages carried the class on `<body>` while the
// attribute landed on `<html>`, so that rule could never match and the reader's chosen dark theme fell
// through to the light tokens: on `tongjian/ch01` with `?theme=dark`, `--ink-faint` computed #79736a at
// 3.83:1 on `--paper` and 3.52:1 on `--paper-2`, under this book's own 4.5:1 bar, where the OS-dark path
// gives #979187 at 5.74 / 5.29:1. The title page (`tongjian/index.html`) already carried the class and
// was right, which is why the defect was invisible to every screenshot gate: they set the theme one way
// (`?theme=`) and the OS another (`colorScheme`), and never crossed the two.
//
// Shape: the structural cause, not the computed values. A unit test has no browser, and the direct
// measurement — a Playwright probe reading the computed tokens in both paths — is `out/theme/measure.mjs`
// (git-ignored, run by hand). What is asserted here is the precondition the cascade needs: every rule in
// the tree that keys on `[data-theme]` and names a class in the same compound requires that class on the
// element the theme is written to, and every page loading such a stylesheet must carry it there. The
// theming element, the class and the requirement are all read from `src/shell.js`, the pages and the
// stylesheets — nothing is hardcoded — so moving the write to `<body>`, renaming the class or restating
// the rule as `:root[data-theme]` moves this check instead of emptying it.
//
// Bound: it cannot evaluate the cascade, only selector reachability. Two things are outside it.
//   1. SHADOWING (a live defect, unfixed, reported not gated). `zj.css`'s two `prefers-color-scheme`
//      blocks declare `--ink-faint` on plain `.zj`, and `.zj` is also on `<body>`; a declaration on the
//      nearer element wins over the one `<html>` carries, so `<body>` still shadows `<html>`'s explicit
//      step. Measured on `tongjian/ch01`: `?theme=dark` on a light OS computes #79736a on the labels
//      (3.12–3.83:1 on the three papers); OS-dark computes #979187 (4.68–5.74:1). The same cause breaks
//      the opposite arm: `?theme=light` on a dark OS computes #878178 against the light papers. Fixing it
//      needs `tongjian/zj.css` (guarded media queries, as `src/styles/tokens.css` already writes its own,
//      plus an explicit step that reaches the `.zj` element the labels inherit from) — a file owned by
//      another worker, so this test asserts the half that is fixed and this header names the half that is
//      not. Run `out/theme/measure.mjs` to see it; do not read this file's green as covering it.
//   2. The scan reads local stylesheets, inline `<style>` blocks, and the CSS that figure modules under
//      `src/` inject (that last one keyed on `:root`, since a module cannot know a page's classes). A
//      remote sheet cannot be read from here and is reported as skipped; `read` and `skipped` print what
//      the scan actually opened, so a scan that read nothing cannot pass as a scan that found nothing
//      wrong.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const NOT_PAGES = new Set(['node_modules', 'src', 'tools', 'test', 'docs', 'out', 'progress', '.git', '.github']);

// ---- the element the theme is written to ------------------------------------------------------------
// Read from the source rather than assumed: if the write moves, every selector requirement below is
// about a different element and this file must say so instead of measuring the old one.
const shell = readFileSync(join(ROOT, 'src/shell.js'), 'utf8');

function themingElement() {
  if (/documentElement\.dataset\.theme\s*=/.test(shell) || /documentElement\.setAttribute\(\s*['"]data-theme/.test(shell)) return 'html';
  if (/document\.body\.dataset\.theme\s*=/.test(shell)) return 'body';
  return null;
}

// ---- pages and their sheets -------------------------------------------------------------------------
function pagesOnDisk(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (NOT_PAGES.has(name) || name.startsWith('.')) continue;
      pagesOnDisk(full, out);
    } else if (name === 'index.html') {
      out.push(full);
    }
  }
  return out;
}

// Comments first: `tongjian/index.html` explains this very class in an HTML comment that contains
// `<html>`, and reading the tag out of that comment reported a page with no class as carrying one —
// the defect this file exists for, arriving through the instrument instead of the page.
const withoutComments = (htmlText) => htmlText.replace(/<!--[\s\S]*?-->/g, ' ');

function sheetsOf(pagePath, htmlText) {
  const sheets = [];
  for (const m of htmlText.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    sheets.push({ name: `${pagePath.slice(ROOT.length)} inline <style>`, css: m[1] });
  }
  for (const m of htmlText.matchAll(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi)) {
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(m[0])?.[1];
    if (!href) continue;
    if (/^[a-z]+:/i.test(href) || href.startsWith('//')) {
      sheets.push({ name: href, css: null, skipped: 'remote' });
      continue;
    }
    const file = resolve(dirname(pagePath), href);
    if (!existsSync(file)) {
      sheets.push({ name: href, css: null, skipped: 'not on disk' });
      continue;
    }
    sheets.push({ name: file.slice(ROOT.length).replace(/\\/g, '/'), css: readFileSync(file, 'utf8') });
  }
  return sheets;
}

// ---- the selectors that key on data-theme -----------------------------------------------------------
const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ');

// Every style rule whose selector mentions `data-theme`, with the at-rules it sits inside. The scan
// tracks brace depth so a declaration value can never be mistaken for a selector, and skips at-rule
// preludes (`@media (…: dark)`) as selectors.
function themeRules(css) {
  const text = strip(css);
  const rules = [];
  const stack = [];
  let buf = '';
  for (const ch of text) {
    if (ch === '{') {
      const head = buf.trim();
      buf = '';
      if (head.startsWith('@')) {
        stack.push({ at: head });
      } else {
        if (head.includes('data-theme')) rules.push({ selector: head, conditions: stack.filter((s) => s.at).map((s) => s.at) });
        stack.push({ block: true });
      }
      continue;
    }
    if (ch === '}') {
      stack.pop();
      buf = '';
      continue;
    }
    if (stack.length && stack[stack.length - 1].block) continue;   // inside declarations
    buf += ch;
  }
  return rules;
}

// Split on a top-level separator, ignoring separators inside (), [] or a quoted string.
function splitTop(text, separators) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let buf = '';
  for (const ch of text) {
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth -= 1;
    if (depth === 0 && separators.test(ch)) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

const dropNegations = (compound) => compound.replace(/:not\([^)]*\)/g, '');

// The classes a compound selector requires on the element that carries `data-theme`.
function requiredClasses(selector) {
  const out = [];
  for (const complex of splitTop(selector, /,/)) {
    for (const compound of splitTop(complex, /[\s>+~]/)) {
      if (!compound.includes('data-theme')) continue;
      for (const m of dropNegations(compound).matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.push(m[1]);
    }
  }
  return out;
}

function classesOnTag(htmlText, element) {
  const tag = new RegExp(`<${element}\\b[^>]*>`, 'i').exec(htmlText)?.[0] ?? '';
  const value = /class\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
  return new Set(value.split(/\s+/).filter(Boolean));
}

// A page's path relative to the repository root, with forward slashes, for messages and for naming the
// book a rule was found on.
const rel = (path) => path.slice(ROOT.length).replace(/\\/g, '/');
const bookOf = (path) => rel(path).split('/')[0] ?? '';
const show = (path) => rel(path);

// ---- the scan ---------------------------------------------------------------------------------------
const element = themingElement();
const pages = pagesOnDisk().map((path) => ({ path, html: withoutComments(readFileSync(path, 'utf8')) }));
const read = [];
const skipped = [];
const requirements = [];
const seenThemeRules = [];

for (const page of pages) {
  for (const sheet of sheetsOf(page.path, page.html)) {
    if (!sheet.css) {
      skipped.push(`${rel(page.path)} → ${sheet.name} (${sheet.skipped})`);
      continue;
    }
    read.push(`${rel(page.path)} → ${sheet.name}`);
    for (const rule of themeRules(sheet.css)) {
      seenThemeRules.push({ page: page.path, sheet: sheet.name, selector: rule.selector });
      for (const cls of requiredClasses(rule.selector)) {
        requirements.push({ page: page.path, sheet: sheet.name, selector: rule.selector, cls });
      }
    }
  }
}

test('src/shell.js still writes the theme to an element this file can find', () => {
  assert.ok(element, 'src/shell.js no longer writes `data-theme` through `documentElement` or `document.body`; this file cannot say which element a `[data-theme]` selector has to match, so it must be re-derived before it can check anything');
});

test('every page reaches the theme rules it loads', () => {
  assert.ok(requirements.length > 0,
    `no page in the tree loads a stylesheet that keys a rule on [data-theme] and a class together, so this check compared nothing. Sheets read: ${read.length}. If the theme is now stated only as :root[data-theme], say so here instead of leaving this test green and empty`);
  const failures = [];
  for (const req of requirements) {
    const page = pages.find((p) => p.path === req.page);
    const classes = classesOnTag(page.html, element);
    if (!classes.has(req.cls)) {
      failures.push(
        `${show(req.page)} loads ${req.sheet}, whose selector \`${req.selector}\` needs class "${req.cls}" on <${element}> — the element src/shell.js writes data-theme to. Its <${element}> tag carries ${classes.size ? `"${[...classes].join(' ')}"` : 'no class'}. ` +
        `The rule can never match this page, so the reader's explicit theme choice falls through to the OS preference and the page shows the other theme's tokens`,
      );
    }
  }
  assert.deepEqual(failures, [], `\n${failures.join('\n')}\n`);
});

test('the scan read the sheets it claims to have read', () => {
  // A scan that found no pages, or read no stylesheet, would pass the check above by comparing nothing.
  assert.ok(pages.length >= 10, `the page walk found ${pages.length} page(s) in the tree; it is meant to find every index.html outside node_modules/, out/ and the tooling`);
  assert.ok(read.length >= 5, `only ${read.length} stylesheet(s) were read (${skipped.length} skipped): ${JSON.stringify(read)}`);
  assert.ok(seenThemeRules.length >= 1, 'no selector anywhere in the tree mentions [data-theme], so nothing reads the attribute the shell writes');
  // The one book that keys rules on a class: `tongjian/zj.css`. Named here only to make a scan that
  // stopped reading early go red rather than quietly shrink.
  const booksSeen = new Set(seenThemeRules.map((r) => bookOf(r.page)));
  assert.ok(booksSeen.has('tongjian'), `no [data-theme] rule was found on any tongjian page; the pages read were ${JSON.stringify([...booksSeen])}`);
});

test('a module that injects CSS keys the theme on :root, never on a class', (t) => {
  // The other half of the same question, asked of the one place a page cannot answer it: a figure
  // module injects its own stylesheet at mount time (`src/figures/*.js`), so it cannot know which
  // classes the page it lands on carries. A rule of its own that needed a class in the same compound as
  // `[data-theme]` would be unreachable on every page that does not happen to carry it — the defect this
  // file is about, moved into a file that no page can fix. Figures key their theme rules on `:root`.
  const modules = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.js')) modules.push(full);
    }
  };
  walk(join(ROOT, 'src'));
  assert.ok(modules.length >= 20, `only ${modules.length} module(s) under src/ were read`);
  const offenders = [];
  let rulesSeen = 0;
  for (const file of modules) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('data-theme')) continue;
    for (const rule of themeRules(text)) {
      rulesSeen += 1;
      for (const cls of requiredClasses(rule.selector)) {
        offenders.push(`${rel(file)} injects a rule keyed on \`${rule.selector}\`, which needs class "${cls}" on the element the theme is written to; no page can guarantee that for a figure`);
      }
    }
  }
  t.diagnostic(`module CSS: ${modules.length} module(s) read, ${rulesSeen} [data-theme] rule(s) found in them`);
  assert.ok(rulesSeen >= 1, `no module under src/ mentions a [data-theme] selector any more, so this check compared nothing (${modules.length} module(s) read)`);
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}\n`);
});

