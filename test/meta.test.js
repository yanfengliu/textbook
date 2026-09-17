// What this file proves, and what it cannot.
//
// It proves that no `content=` attribute in the authored markup of a page the gates visit holds a
// tag-looking sequence — a `<` followed by an ASCII letter or `/`, which is the only way the content
// checker's tokenizer opens a tag (`<([a-zA-Z][\w-]*)` and `</([a-zA-Z][\w-]*)` in tools/check-content.js).
//
// Why that is a defect and not a style rule: an attribute value ends at its closing quote. A tag written
// inside one does not disappear — that quote closes the ATTRIBUTE instead, the rest of the value is
// re-read as if the author had typed it after the tag, and it arrives in the document as text and as
// further attributes. `tongjian/ch03-cai-de-lun/index.html` carried
// `content="…臣光曰「<span lang="zh-Hant">智伯之亡也，才勝德也</span>」。…"`, and the parser gave the
// reader a stray line above the book's own opening line, a description truncated to `…「<span lang=`,
// and the page's own `<script type="module">` moved out of `<head>` into `<body>`. `npm run check`
// passed the page, because a checker reading the authored text sees a well-formed string; only a parser
// sees this damage. The fix removed the two tags and kept the sentence, which is plain text.
//
// The class is "a `content=` attribute holds markup", not "this one attribute": every page and every
// `content=` attribute on it is read, and the failure names the page, the line, the tag, the attribute's
// value and the sequence in it.
//
// Bound, stated because a green run here proves less than it looks:
//   - The files it reads are the pages `tools/lib/browser.js` discovers, on disk, as text: the library
//     (`index.html`), each book's landing page, every `<book>/chNN-*/index.html`, and Today. `lab/` is
//     not in that list and is not read here either, and a page shape the tokenizer never matches is
//     invisible to this file for the same reason it is invisible to `npm run check`.
//   - Nothing here renders, and a `content=` value assembled at runtime — a template literal, a string
//     built from data, `setAttribute('content', …)` — cannot be seen by a file-reading gate at all. A
//     tag built that way is this check's stated blind spot, and no header comment can close it: `npm run
//     shot` is the instrument for the damage once it happens, because it loads every page in chromium
//     and fails on the console error a script moved out of `<head>` raises.
//   - It says nothing about what a description should SAY, and nothing about its script. A Traditional
//     quotation inside 「」 in a `content=` attribute is read by no gate: `test/lexicon.test.js` blanks
//     every 「」 run before it looks for a Traditional-only character, and `test/strings.test.js` reads
//     the attributes a reader is *told* (`aria-label`, `title`, `alt`, …), which `content=` is not. Only
//     the shape of the value is checked here.
//   - A page with no `content=` attribute is evidence of nothing, so the page count and the attribute
//     count are asserted non-zero and reported, and the rule is exercised on a fixture built from the
//     defect and on two values that must not fire, so "did not run" cannot read as "passed".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHtml, findAll } from '../tools/check-content.js';
import { PAGES } from '../tools/lib/browser.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

// The character list, taken from the tokenizer this file reads pages with rather than invented beside
// it: a tag opens on `<` + an ASCII letter and closes on `<` + `/`, so those two are what has to be
// looked for after every `<`. `&lt;` is text, does not match, and is the escape a value that wants a
// literal `<` has to use.
const TAG_LOOKING = /<[A-Za-z/]/;

/** Where a page in the gates' list lives on disk. Every page is a directory with an index.html. */
const fileOf = (page) => path.join(root, page.path.replace(/^\//, ''), 'index.html');

/** Every `content=` attribute one page's markup holds, as the content checker's tokenizer reads it. */
function contentAttributes(html) {
  const found = [];
  findAll(parseHtml(html), (n) => n.attrs && n.attrs.content !== undefined)
    .forEach((n) => found.push({ tag: n.tag, line: n.line, value: n.attrs.content }));
  return found;
}

/** The `content=` attributes of one page that hold markup, with where in the value it starts. */
function markupInContent(html) {
  const out = [];
  for (const attr of contentAttributes(html)) {
    const m = TAG_LOOKING.exec(attr.value);
    if (m) out.push({ ...attr, at: m.index });
  }
  return out;
}

test('no authored page writes markup into a content= attribute', (t) => {
  const pages = PAGES.map((p) => ({ id: p.id, path: p.path, file: fileOf(p) }));
  assert.ok(pages.length > 0, 'the gates name no page at all, so this test read nothing');
  const missing = pages.filter((p) => !fs.existsSync(p.file));
  assert.equal(missing.length, 0,
    `${missing.length} page(s) in the gates' list have no file on disk, so this test cannot read them: ${missing.map((p) => `${p.id} → ${rel(p.file)}`).join(', ')}`);

  let attributes = 0;
  const offenders = [];
  for (const page of pages) {
    const read = contentAttributes(fs.readFileSync(page.file, 'utf8'));
    attributes += read.length;
    for (const attr of read) {
      const m = TAG_LOOKING.exec(attr.value);
      if (m) offenders.push({ ...attr, at: m.index, page });
    }
  }
  t.diagnostic(`pages: ${pages.length} read (${pages.map((p) => p.id).join(', ')}); content= attributes checked: ${attributes}; holding a tag-looking sequence: ${offenders.length}`);
  assert.ok(attributes > 0,
    `${pages.length} page(s) were read and not one content= attribute was found in any of them — either every page lost its <meta name="description"> or this extraction has stopped working, and a scan that found nothing must not read as a clean book`);
  assert.equal(offenders.length, 0,
    `${offenders.length} content= attribute(s) hold markup where the parser reads plain text. An attribute value ends at its closing quote, so the tag does not stay inside it: it closes the attribute early, and every character after it lands in the page as ordinary text and as further attributes — which is how the ch03 description put a stray line above the book's own opening line and moved its <script> into <body>. Write the value as plain text; if a literal less-than sign is meant, escape it as &lt;, which is text and not a tag. A meta description is plain text, so a <span lang="zh-Hant"> marking a quotation Traditional cannot live in one — keep the 「…」 run and drop the tags.\n  ${offenders.map((o) => `${rel(o.page.file)}:${o.line} — <${o.tag} content="…"> holds 「${o.value.slice(o.at, o.at + 16)}」; the value reads 「${o.value.length > 72 ? `${o.value.slice(0, 72)}…` : o.value}」`).join('\n  ')}`);
});

test('the rule fires on the defect, and only on it', () => {
  // The rule is proved on a fixture built from the defect, because a rule over the real tree that reads
  // nothing passes and looks identical to a clean book. The fixture is a page, not a string: it goes
  // through the same `parseHtml` reading the corpus test uses.
  const page = (content) =>
    `<!doctype html><html lang="zh-Hans"><head><meta name="description" content="${content}"><script type="module">import './x.js';</script></head><body><a href="#main">跳到正文</a></body></html>`;

  const defect = markupInContent(page('《资治通鉴》卷一 周纪一：臣光曰「<span lang="zh-Hant">智伯之亡也，才勝德也</span>」。原文逐字可点。'));
  assert.equal(defect.length, 1,
    `the fixture's one defective content= attribute was read as ${defect.length} offender(s); this file's extraction has stopped seeing the sequence the defect is made of, and would pass over the real page too`);
  assert.ok(defect[0].value.endsWith('<span lang='),
    `the tokenizer read the defective value as ${JSON.stringify(defect[0].value)}; the defect is that the tag's own quote closes the ATTRIBUTE, so the value has to end at that quote — if this changed, the reading below the assertion changed with it`);
  assert.ok(TAG_LOOKING.test(defect[0].value),
    `the fixture's value ${JSON.stringify(defect[0].value)} did not match ${TAG_LOOKING}, which is the rule this file exists for`);

  // And the other direction, so a rule that fires on everything cannot pass for a rule that fires on
  // markup: a plain value, and a `<` written as an escape, are text and must be left alone.
  for (const [what, value] of [
    ['a viewport, which every page carries', 'width=device-width, initial-scale=1'],
    ['a description that prints a tag as text', 'how to write a &lt;span&gt; inside an attribute'],
  ]) {
    assert.deepEqual(markupInContent(page(value)), [],
      `${what} was failed: ${JSON.stringify(value)} is an attribute value and not markup, so this rule must not fire on it`);
  }
});
