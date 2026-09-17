// The words a page prints about itself — a label, a generated `content:`, an `aria-label` — are chrome,
// and on a Chinese page the chrome has to be Chinese, in the page's own script. Two defects came out of
// one round of looking at the rendered 通鑑 book:
//
//   - `src/styles/components.css` printed the English `All sorted.` into an emptied sort tray, on a page
//     whose every other word is Chinese. `tongjian/zj.css` now replaces it for that book.
//   - `tongjian/zj.css` itself printed 「問題」 and 「本章目錄」 on pages whose `lang` is `zh-Hans` and
//     whose prose is Simplified. The book's rule is that only the 原文 and a quotation marked
//     `lang="zh-Hant"` are Traditional. Both are fixed; this file is what keeps them fixed.
//
// `test/lexicon.test.js` is the gate for the script of what a page says, and it is a good one: it reads
// each page's authored markup — visible text and attributes alike — and the data files beside it. What
// it cannot read is a word a *stylesheet* generates and a word a component's word table holds, which is
// why the two defects above survived it. This file is that complement, and it is the whole reason it
// exists: the chrome a page does not author, and the English that can still reach it.
//
// Bound, stated because a green run here proves less than it looks:
//   - The script half reads two things, and only two: the `content:` literals of the stylesheets a
//     Simplified page links, and the attributes a reader can be *told* (`aria-label`, `title`, `alt`,
//     `data-alt`, `placeholder`, the two ARIA description attributes) in that page's own markup — with
//     `test/lexicon.test.js`'s exclusions, so it cannot fire on the received text: the 原文 block, a run
//     marked `lang="zh-Hant"`, the `ref`/`word` lexicon keys, and comments. Two things it still cannot
//     see, and a reader of this header should assume they are unchecked:
//       · a Traditional character that exists only once JavaScript has run, or one in a `::before`
//         whose text comes from a JS string — `src/shell.js` builds the header and the rail title in
//         template literals, and nothing here reads those for script, only for English;
//       · the page's visible authored text. That is `test/lexicon.test.js`'s half and it is the reason
//         「問題」 was found here and not there: one is a stylesheet, the other is markup. A rendered
//         check over every page's chrome against its `lang` is what would cover the rest, and the unit
//         suite must not need a browser (`test/browser-quiet.test.js` says why).
//   - It reads files as text; nothing here renders. A rule that matches an element and then loses to a
//     later rule of equal specificity is invisible to it — the colour worker's `.zj [data-state="wei"]`
//     reported `true` from `el.matches()` while the paint stayed ink — and no assertion below can tell
//     that apart from a rule that is not there. `npm run shot`, `npm run devices` and a person looking
//     at `out/` are what answer the pixels.
//   - The word-table scan reads a `zh:`-keyed block and a one-line `*_WORDS` table, and asserts it found
//     each table it names. A table written another way would be missed; the denominators are what stop
//     that from reading as clean.
//   - One direction of the script rule is checked: a Simplified surface must carry no Traditional-only
//     character. The other needs a Simplified-only character list, and
//     `test/fixtures/traditional-only.txt`'s right-hand column is not one (乾→干, but 干 is a
//     Traditional character in its own right), so a Simplified character on a `zh-Hant` surface is not
//     caught here. `test/lexicon.test.js` has the same limit from the other side.
//   - The last test is a census with a tripwire, not a rule, and it is the one check here that is meant
//     to be EMPTIED. An allow-list rots silently: the strings on it get fixed, nobody deletes the rows,
//     and a year later it reads as a list of things that are still wrong. This one fails the moment a
//     listed string leaves the file it names, and its message says to delete the row rather than to put
//     the string back. It does NOT catch a string added tomorrow, and text alone cannot: to a scanner,
//     `aria-label="Open chapter contents"` and `class="tb-header__crumb"` are the same kind of literal.
//   - Every page on disk is walked independently of `tools/lib/browser.js`, for the reason
//     `test/pages.test.js` gives: discovery that quietly finds nothing compares nothing with nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const NOT_BOOKS = new Set(['node_modules', 'src', 'tools', 'test', 'docs', 'out', '.git', '.github', 'progress']);

// ── the Traditional-only character set ────────────────────────────────────────────────────────────
// The same checked-in artifact `test/lexicon.test.js` uses, so the two gates cannot disagree about
// which characters the rule is about. Read here rather than imported: that file asserts on pages.
function traditionalOnly() {
  const artifact = path.join(here, 'fixtures', 'traditional-only.txt');
  assert.ok(fs.existsSync(artifact), `${rel(artifact)} is missing, so the script rule cannot be checked at all`);
  const table = new Map();
  for (const line of fs.readFileSync(artifact, 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [from, to] = line.split(/\t+/);
    assert.ok(from && to, `a line of ${rel(artifact)} is not "traditional<TAB>simplified": ${JSON.stringify(line)}`);
    table.set(from.trim(), to.trim());
  }
  assert.ok(table.size > 1000,
    `the character set holds ${table.size} entries, which is not a Traditional→Simplified table — a truncated artifact must not read as a clean book`);
  return table;
}

// ── reading stylesheets ───────────────────────────────────────────────────────────────────────────
// Comments are blanked rather than deleted, so a reported line number is the line in the file a person
// will open. Newlines inside the comment survive, which is what keeps the numbers true.
const blankComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

// Every quoted string in a `content:` declaration, with the rule that prints it and the line it is on.
function contentLiterals(file) {
  const css = blankComments(fs.readFileSync(file, 'utf8'));
  const found = [];
  for (const rule of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const selector = rule[1].split(/[{}]/).pop().replace(/\s+/g, ' ').trim();
    for (const decl of rule[2].matchAll(/content\s*:\s*([^;]+)/g)) {
      for (const lit of decl[1].matchAll(/"([^"]*)"|'([^']*)'/g)) {
        const value = lit[1] ?? lit[2];
        if (!value) continue;
        const at = rule.index + rule[1].length + 1 + decl.index + decl[0].indexOf(lit[0]);
        found.push({ file, selector, value, line: css.slice(0, at).split('\n').length });
      }
    }
  }
  return found;
}

// ── reading the pages ─────────────────────────────────────────────────────────────────────────────
// The walk is done here rather than through `tools/lib/browser.js`, for the reason `test/pages.test.js`
// gives: discovery that quietly finds nothing leaves every assertion below comparing nothing with
// nothing, and a second derivation is what makes that visible.
function booksOnDisk() {
  const books = [];
  for (const name of fs.readdirSync(root)) {
    if (name.startsWith('.') || NOT_BOOKS.has(name)) continue;
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const chapters = fs.readdirSync(dir)
      .filter((s) => /^ch\d\d-/.test(s) && fs.existsSync(path.join(dir, s, 'index.html')))
      .sort();
    if (chapters.length) books.push({ name, dir, chapters });
  }
  assert.ok(books.length > 0, 'no book was found on disk at all, so this file cannot prove anything about one');
  return books;
}

// The pages of a book: its own landing page and every chapter. Each carries the language it declares
// and the stylesheets it actually links, resolved to real files.
function pagesOf(book) {
  const pages = [path.join(book.dir, 'index.html'), ...book.chapters.map((c) => path.join(book.dir, c, 'index.html'))]
    .filter((f) => fs.existsSync(f));
  return pages.map((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const lang = (/<html[^>]*\slang="([^"]+)"/i.exec(html)?.[1] || '').toLowerCase();
    const sheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi)]
      .map((m) => path.resolve(path.dirname(file), m[1]))
      .filter((f) => fs.existsSync(f));
    return { file, lang, sheets };
  });
}

const isSimplified = (lang) => lang === 'zh' || lang.startsWith('zh-hans');

// Every page on disk — the library, the study page, each book's landing page and every chapter — found
// by walking the tree rather than by asking the gates' page list, which is the second derivation
// `test/pages.test.js` argues for.
function pagesOnDisk() {
  const pages = [];
  const rootIndex = path.join(root, 'index.html');
  if (fs.existsSync(rootIndex)) pages.push(rootIndex);
  for (const name of fs.readdirSync(root)) {
    if (name.startsWith('.') || NOT_BOOKS.has(name)) continue;
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const index = path.join(dir, 'index.html');
    if (fs.existsSync(index)) pages.push(index);
    for (const sub of fs.readdirSync(dir)) {
      if (!/^ch\d\d-/.test(sub)) continue;
      const page = path.join(dir, sub, 'index.html');
      if (fs.existsSync(page)) pages.push(page);
    }
  }
  return pages.sort();
}

const pageLang = (html) => (/<html[^>]*\slang="([^"]+)"/i.exec(html)?.[1] || '').toLowerCase();

// The attributes a reader can be read aloud, in the page's own markup. The exclusions are
// `test/lexicon.test.js`'s, taken from that file rather than invented here, because the two gates have
// to agree about what the received text is: the 原文 block, any run marked `lang="zh-Hant"`, the
// `ref`/`word`/`data-corpus` lexicon keys (the received form, which is Traditional on purpose), and
// comments. Blanking can only make this miss, never invent.
const HEARD_ATTRS = ['aria-label', 'aria-description', 'aria-roledescription', 'title', 'alt', 'placeholder', 'data-alt'];
function heardAttributes(html) {
  const blank = (m) => ' '.repeat(m.length);
  const text = html
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<ol class="zj-src"[\s\S]*?<\/ol>/g, blank)
    .replace(/<[a-z-]+[^>]*\blang="zh-Hant"[^>]*>[\s\S]*?<\/[a-z-]+>/g, blank)
    .replace(/<tb-(?:char|term)\b[^>]*>[^<]*<\/tb-(?:char|term)>/g, blank)
    .replace(/\b(?:ref|word|data-corpus)="[^"]*"/g, blank);
  const pattern = new RegExp(`\\s(${HEARD_ATTRS.join('|')})="([^"]*)"`, 'g');
  return [...text.matchAll(pattern)].map((m) => ({
    attr: m[1],
    value: m[2],
    line: text.slice(0, m.index).split('\n').length,
  }));
}

// A book is Simplified when its own landing page says so; the chapters are checked to agree, because a
// book split across two scripts would make every assertion below ambiguous.
function simplifiedBooks(books) {
  return books.map((book) => ({ ...book, pages: pagesOf(book) }))
    .filter((book) => book.pages.some((p) => isSimplified(p.lang)));
}

test("a zh-Hans page's own stylesheets print no Traditional-only character", () => {
  const traditional = traditionalOnly();
  const books = simplifiedBooks(booksOnDisk());
  assert.ok(books.length > 0, 'no book declares a Simplified Chinese page, so this test compared nothing');
  let literals = 0;
  const sheets = new Set();
  // One row per site, not one per page that loads it: the same sheet is linked by every chapter, and a
  // message that repeats itself three times reads as three defects.
  const problems = new Map();
  for (const book of books) {
    for (const page of book.pages.filter((p) => isSimplified(p.lang))) {
      for (const sheet of new Set(page.sheets)) {
        sheets.add(sheet);
        for (const { selector, value, line } of contentLiterals(sheet)) {
          literals += 1;
          for (const ch of value) {
            if (!traditional.has(ch)) continue;
            const key = `${rel(sheet)}:${line}:${ch}`;
            const row = problems.get(key) || { sheet, selector, value, line, ch, simplified: traditional.get(ch), pages: [] };
            row.pages.push(page);
            problems.set(key, row);
          }
        }
      }
    }
  }
  assert.ok(sheets.size > 0 && literals > 0,
    `${sheets.size} stylesheet(s) and ${literals} content: literal(s) were read from the Simplified pages — a scan that read nothing must not read as a clean book`);
  assert.equal(problems.size, 0,
    `${problems.size} Traditional-only character(s) in the chrome of a Simplified page. The book's rule is that only the 原文 and a quotation marked lang="zh-Hant" are Traditional; this character is in a stylesheet, which test/lexicon.test.js does not read.\n  ${[...problems.values()].map((p) => `${rel(p.sheet)}:${p.line} prints ${JSON.stringify(p.value)} through "${p.selector}" on lang="${p.pages[0].lang}" (${p.pages.length} page(s)): 「${p.ch}」 is Traditional-only (Simplified: 「${p.simplified}」)`).join('\n  ')}`);
});

test("a zh-Hans page's own attributes carry no Traditional-only character", (t) => {
  const traditional = traditionalOnly();
  const pages = pagesOnDisk().map((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const lang = pageLang(html);
    const attrs = heardAttributes(html);
    const hits = [];
    for (const { attr, value, line } of attrs) {
      for (const ch of value) {
        if (traditional.has(ch)) hits.push({ attr, value, line, ch, simplified: traditional.get(ch) });
      }
    }
    return { file, lang, attrs, hits };
  });
  assert.ok(pages.length > 0, 'no page was found on disk at all, so this test compared nothing');
  const read = pages.reduce((n, p) => n + p.attrs.length, 0);
  assert.ok(read > 0,
    `${pages.length} page(s) were read and not one attribute a reader can be told was found — either every page lost its aria-labels or this extraction has stopped working`);
  const simplified = pages.filter((p) => isSimplified(p.lang));
  assert.ok(simplified.length > 0, 'no page declares a Simplified Chinese surface, so this test compared nothing');
  for (const p of pages) {
    t.diagnostic(`${rel(p.file)} lang="${p.lang || '(none)'}" — ${p.attrs.length} attribute(s) read, ${p.hits.length} Traditional-only character(s)`
      + (isSimplified(p.lang) ? '' : ' (not a Simplified surface: counted, not asserted)'));
  }
  const problems = simplified.flatMap((p) => p.hits.map((h) => ({ ...h, page: p })));
  assert.equal(problems.length, 0,
    `${problems.length} Traditional-only character(s) in an attribute a reader is told, on a page whose lang is Simplified. The rule is that only the 原文 and a run marked lang="zh-Hant" are Traditional; a screen reader on this page reads the modern language and hears the old script.\n  ${problems.map((p) => `${rel(p.page.file)}:${p.line} ${p.attr}=${JSON.stringify(p.value)}: 「${p.ch}」 is Traditional-only (Simplified: 「${p.simplified}」)`).join('\n  ')}`);
});

// ── reading a component's word table ──────────────────────────────────────────────────────────────
// Two shapes exist in `src/components/`: a language-keyed block (`zh: { … }`) and a one-line table
// (`{ en: 'Figure', zh: '图', … }`). Both are read; the tables this file names are asserted to be found.
const stripComments = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .split('\n').map((l) => (/^\s*\/\//.test(l) ? '' : l)).join('\n');

const QUOTED = /"([^"]*)"|'([^']*)'|`([^`]*)`/g;
const literalsIn = (text) => [...text.matchAll(QUOTED)].map((m) => m[1] ?? m[2] ?? m[3]).filter(Boolean);

function wordTables(file) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));
  const lines = src.split('\n');
  const tables = [];
  let enclosing = '';
  let open = null;
  lines.forEach((line, i) => {
    const constName = /^\s*(?:export\s+)?const\s+([A-Za-z_][\w]*)\s*=\s*\{/.exec(line);
    if (constName) enclosing = constName[1];
    if (open) {
      const close = /^(\s*)\}[,]?\s*$/.exec(line);
      if (close && close[1].length === open.indent) {
        // The entries, for the key-for-key comparison below: a line-leading `name:` inside the block.
        // A nested function body's own lines do not look like that (`const summary = …`, `return …`),
        // and anything that does is counted in both languages the same way.
        const entries = lines.slice(open.line + 1, i)
          .map((l) => /^\s*([A-Za-z_][\w]*)\s*:\s*(.*)$/.exec(l))
          .filter(Boolean)
          .map((m) => ({ key: m[1], value: m[2], literals: literalsIn(m[2]) }));
        tables.push({ name: enclosing, key: open.key, file, line: open.line + 1, literals: literalsIn(lines.slice(open.line, i + 1).join('\n')), entries });
        open = null;
      }
      return;
    }
    const opener = /^(\s*)(?:'([\w-]+)'|"([\w-]+)"|([\w-]+))\s*:\s*\{\s*$/.exec(line);
    if (opener) open = { key: (opener[2] || opener[3] || opener[4]).toLowerCase(), indent: opener[1].length, line: i };
    // A one-line table: every `key: 'value'` on the line is an entry keyed by its own language.
    const flat = /^\s*(?:export\s+)?const\s+([A-Za-z_][\w]*)\s*=\s*\{([^}]*)\}\s*;?\s*$/.exec(line);
    if (flat) {
      for (const entry of flat[2].matchAll(/(?:'([\w-]+)'|"([\w-]+)"|([\w-]+))\s*:\s*'([^']*)'/g)) {
        tables.push({ name: flat[1], key: (entry[1] || entry[2] || entry[3]).toLowerCase(), file, line: i + 1, literals: [entry[4]], entries: [] });
      }
    }
  });
  return tables;
}

// Every module that holds a word table a page reads: the components, and the shell, which carries the
// header, the rail title and the accessible names of both header controls.
function wordTableFiles() {
  const dir = path.join(root, 'src', 'components');
  return [
    ...fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort().map((f) => path.join(dir, f)),
    path.join(root, 'src', 'shell.js'),
  ];
}

test('a component word table that serves a zh-Hans page is Simplified', () => {
  const traditional = traditionalOnly();
  const tables = wordTableFiles().flatMap(wordTables);
  // The denominator, named: these are the tables a Chinese page's chrome is read from. A rename has to
  // come through this list deliberately, and a scan that stopped finding them cannot read as clean.
  for (const name of ['CHECK_WORDS', 'SORT_WORDS', 'FIGURE_WORDS', 'SHELL_WORDS']) {
    assert.ok(tables.some((t) => t.name === name),
      `no word table named ${name} was found under src/components/ or src/shell.js, so this test is no longer reading the words a Chinese page prints. If it was renamed, rename it here as well.`);
  }
  const simplified = tables.filter((t) => t.key === 'zh' || t.key === 'zh-hans');
  assert.ok(simplified.length >= 3,
    `${simplified.length} language table(s) keyed zh or zh-hans were found — fewer than the three block tables named above, so these assertions are not reading what they claim`);
  let words = 0;
  const problems = [];
  for (const table of simplified) {
    for (const word of table.literals) {
      words += 1;
      for (const ch of word) {
        if (!traditional.has(ch)) continue;
        problems.push(`${rel(table.file)}:${table.line} — ${table.name}.${table.key} says ${JSON.stringify(word)}: 「${ch}」 is Traditional-only (Simplified: 「${traditional.get(ch)}」)`);
      }
    }
  }
  assert.ok(words > 0, `${simplified.length} table(s) were found and ${words} word(s) read from them — an empty scan must not read as a clean book`);
  assert.equal(problems.length, 0,
    `${problems.length} Traditional-only word(s) in a word table the Simplified pages print from. A zh-Hant page has its own key ('zh-hant' in FIGURE_WORDS) and is not read here; a word in 'zh' or 'zh-hans' is printed on a page whose lang is zh-Hans.\n  ${problems.join('\n  ')}`);
});

test('a word table keeps its two languages in step, key for key', () => {
  // The next-one class for a word table: a word added to `en` and forgotten in `zh`. Nothing renders a
  // missing key as a blank — the lookup spreads the language table and the component reads the English
  // value — so a Chinese page would quietly print the new English word, which is exactly the defect this
  // file exists for. The key set is read from line-leading `name:` inside each block; a table written
  // another way is invisible here, and the named-table assertion above is what stops that reading as
  // clean.
  const tables = wordTableFiles().flatMap(wordTables);
  const paired = [];
  const problems = [];
  for (const name of ['CHECK_WORDS', 'SORT_WORDS', 'SHELL_WORDS']) {
    const en = tables.find((t) => t.name === name && t.key === 'en');
    const zh = tables.find((t) => t.name === name && t.key === 'zh');
    assert.ok(en, `${name} has no en block, so its two languages cannot be compared key for key`);
    assert.ok(zh, `${name} has no zh block, so a Chinese page falls back to its English words with nothing to say so`);
    paired.push(name);
    const enKeys = en.entries.map((e) => e.key);
    const zhKeys = new Set(zh.entries.map((e) => e.key));
    const missing = enKeys.filter((k) => !zhKeys.has(k));
    const extra = [...zhKeys].filter((k) => !enKeys.includes(k));
    if (missing.length) {
      problems.push(`${name}: ${missing.length} key(s) read in en and absent from zh — ${missing.join(', ')}. The lookup merges the language table, so a missing key is not a blank: the page prints the English word. Add the Chinese word to ${name}.zh.`);
    }
    if (extra.length) problems.push(`${name}: ${extra.length} key(s) in zh that en does not have — ${extra.join(', ')}; one of the two is a typo`);
    for (const entry of zh.entries) {
      if (entry.literals.length && !entry.literals.some((v) => v.trim())) problems.push(`${name}.zh.${entry.key} is an empty string, which renders as nothing at all`);
    }
  }
  assert.equal(paired.length, 3, `${paired.length} table(s) were paired (${paired.join(', ')}) — fewer than the three named above`);
  // FIGURE_WORDS is one line rather than two blocks: its languages are the keys of a flat table, and the
  // book already distinguishes the two scripts there. Asserted so a language cannot be dropped from it.
  const figureKeys = new Set(tables.filter((t) => t.name === 'FIGURE_WORDS').map((t) => t.key));
  for (const key of ['en', 'zh', 'zh-hans', 'zh-hant']) {
    if (!figureKeys.has(key)) problems.push(`FIGURE_WORDS has no ${key} entry, so a page declaring lang="${key}" falls through to another script's word for the same figure`);
  }
  assert.equal(problems.length, 0,
    `${problems.length} problem(s) in the word tables' two languages. A missing Chinese word is not a blank line: the lookup merges the table, so the page prints English.\n  ${problems.join('\n  ')}`);
});

// ── the English a shared stylesheet can still print ───────────────────────────────────────────────
// Per literal, with a consumption set. An assertion that only asks whether *some* rule replaces *some*
// selector bounds how many rules a book states, not that each English word is accounted for: two
// literals can share one selector, and a rule for the wrong selector satisfies nothing. So every English
// literal is looked up by its own selector, the rule that answers for it is marked consumed, and at the
// end every override the book states on a shared selector must have been consumed by a literal — an
// overlap that no other ordering makes possible. That last half is what reports an override left behind
// when the shared rule it replaced is gone.
//
// Bound: it reads the shared sheets' `content:` literals and the book's own stylesheet. A word a
// component prints rather than a stylesheet (the shell's header, `check.js`'s label, `sort.js`'s tray
// sentence) is the word tables' half, above; a string a script builds at runtime is nobody's.
test('every English word a shared stylesheet prints is replaced by the book that reaches it', (t) => {
  const styles = path.join(root, 'src', 'styles');
  const sheets = fs.readdirSync(styles).filter((f) => f.endsWith('.css')).sort();
  assert.ok(sheets.length >= 4, `${sheets.length} shared stylesheet(s) found in src/styles/ — the sheets every page links are missing`);
  // Every selector a shared sheet prints through, and the subset that prints a word.
  const sharedSelectors = new Set();
  const english = [];
  for (const sheet of sheets) {
    for (const literal of contentLiterals(path.join(styles, sheet))) {
      sharedSelectors.add(literal.selector);
      if (/[A-Za-z]/.test(literal.value)) english.push(literal);
    }
  }
  assert.ok(sharedSelectors.size > 0, 'no shared stylesheet was read at all, so this test compared nothing');
  assert.ok(english.length > 0,
    'no content: literal with a Latin letter was found in any shared stylesheet, so this test compared nothing; the extraction has stopped working');

  const books = simplifiedBooks(booksOnDisk());
  assert.ok(books.length > 0, 'no book declares a Simplified Chinese page, so no book override was checked');
  const problems = [];
  let overridesSeen = 0;
  for (const book of books) {
    const page = book.pages.find((p) => isSimplified(p.lang));
    const bodyClass = /<body[^>]*\sclass="([^"]+)"/i.exec(fs.readFileSync(page.file, 'utf8'))?.[1]?.trim().split(/\s+/)[0];
    assert.ok(bodyClass,
      `${rel(page.file)} declares lang="${page.lang}" and no class on <body>, so the scope its own stylesheet replaces shared words under cannot be derived. Name the convention here before adding it.`);
    const scope = `.${bodyClass}`;
    const own = [...new Set(book.pages.flatMap((p) => p.sheets).filter((s) => !s.startsWith(styles)))];
    assert.ok(own.length > 0,
      `${book.name} is a Simplified book with no stylesheet of its own — an English word in a shared sheet would have nowhere to be replaced`);
    // This book's rules for the selectors the shared sheets print through: the override set.
    const overrides = new Map();
    for (const rule of own.flatMap((f) => contentLiterals(f))) {
      if (!rule.selector.startsWith(`${scope} `)) continue;
      const rest = rule.selector.slice(scope.length + 1);
      if (sharedSelectors.has(rest)) overrides.set(rest, rule);
    }
    overridesSeen += overrides.size;
    const consumed = new Set();
    for (const word of english) {
      const rule = overrides.get(word.selector);
      if (!rule) {
        problems.push(`${rel(word.file)}:${word.line} prints ${JSON.stringify(word.value)} through "${word.selector}", which a ${book.name} page reaches, and ${own.map(rel).join(', ')} states no rule for that selector. Add:\n      ${scope} ${word.selector} { content: "…"; }`);
        continue;
      }
      if (/[A-Za-z]/.test(rule.value)) {
        // Claimed, so the failure below names the real defect once instead of also reporting the rule as
        // unclaimed: the selector does have a literal behind it, and the word it prints is Latin.
        consumed.add(word.selector);
        problems.push(`${rel(rule.file)}:${rule.line} replaces "${word.selector}" but still prints ${JSON.stringify(rule.value)} — a Latin word on a page whose lang is Simplified, and the shared sheet's ${JSON.stringify(word.value)} is what a reader gets`);
        continue;
      }
      consumed.add(word.selector);
    }
    const unclaimed = [...overrides.keys()].filter((selector) => !consumed.has(selector));
    for (const selector of unclaimed) {
      const rule = overrides.get(selector);
      problems.push(`${rel(rule.file)}:${rule.line} states a rule for "${rule.selector}" and no shared sheet prints a word through "${selector}" any more — either the shared rule changed and this is dead code, or this rule now replaces a symbol with a word`);
    }
    t.diagnostic(`${book.name}: ${english.length} English literal(s) in ${sheets.length} shared sheet(s), ${overrides.size} override rule(s) in ${own.map(rel).join(' + ')}, ${consumed.size} consumed, ${unclaimed.length} unclaimed`);
  }
  assert.ok(overridesSeen > 0,
    `${books.length} Simplified book(s) were read and not one override rule was found on a selector the shared sheets print through — every English word would then be uncovered, so this is the extraction failing, not a clean book`);
  assert.equal(problems.length, 0,
    `${problems.length} problem(s) between the English words a shared stylesheet prints and the rules a Simplified book replaces them with. A stylesheet cannot know the page's language and a page cannot reach a content: literal, so the replacement is one rule in the book's own sheet, and each one is accounted for by a literal.\n  ${problems.join('\n  ')}`);
});

// ── the census ────────────────────────────────────────────────────────────────────────────────────
// The English shared code can still show a Chinese reader, measured rather than guessed, with where each
// one stands. `out/sortstring/probe.mjs census` loaded every Chinese page in chromium at 1440 px and
// walked every visible text node, every aria-label/title/alt/placeholder and every ::before/::after
// computed value; these rows are the ones holding a word rather than romanisation or a control's own
// lettering. `out/sortstring/shell-probe.mjs` is the second instrument, added when the shell's words
// moved into a table: it renders six pages at two widths in both themes and reads each string back, so
// the English pages can be compared arm against arm and the badge's accessible name can be read live.
//
// **Six shell rows left this list when they moved into `SHELL_WORDS`, and they were deleted rather than
// repointed at the table.** A row that follows its string into a word table is an allow-list blessing
// what is left; what guards those six now is the pair of checks above — the `zh` block must be
// Simplified, and it must carry every key the `en` block has. What is left here is the three strings a
// reader meets only on a page that is already broken, kept so they cannot become reachable silently.
//
// The assertion is the opposite way round from an allow-list's usual one: it fails when a row's string
// has LEFT the file it names, not when a new one appears. So a row cannot rot into a claim that is no
// longer true, and the list is emptied as the work lands instead of growing to bless what is left.
const SHARED_ENGLISH = [
  { file: 'src/shell.js', literal: "|| 'Textbook'", state: 'unreachable: every page passes book=, and this is the fallback', what: 'the book name the header would show with no book attribute' },
  { file: 'src/components/term.js', literal: 'No glossary entry for', state: 'reachable only in a state `npm run check` forbids, so only on a broken page', what: 'the lexicon card for a term with no entry' },
  { file: 'src/components/figure.js', literal: 'This figure could not load', state: 'reachable only when a figure module fails, which `npm run shot` fails on', what: "a figure's error box" },
];

test('the English shared code can still show a Chinese reader is exactly this list', () => {
  assert.ok(SHARED_ENGLISH.length > 0, 'the census is empty, so this test compared nothing');
  const missing = [];
  for (const row of SHARED_ENGLISH) {
    const src = fs.readFileSync(path.join(root, row.file), 'utf8');
    if (!src.includes(row.literal)) missing.push(row);
  }
  assert.equal(missing.length, 0,
    `${missing.length} of the ${SHARED_ENGLISH.length} English string(s) this census records are no longer written the way its row says. If one was translated into a word table, delete its row rather than putting the English back — the list is emptied as the work lands. If it moved, point the row at where it went. If it was reworded, say so here.\n  ${missing.map((r) => `${r.file}: ${r.literal} — ${r.what} (${r.state})`).join('\n  ')}`);
});
