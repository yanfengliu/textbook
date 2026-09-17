// What this file proves, and what it cannot.
//
// The owner, reading the published book: *"Just make it perfectly clear what came from the book what
// didn't it, everywhere."* The book sets 資治通鑑's own words in the Traditional script and its own
// voice in Simplified, and tongjian/README.md states that rule; `test/lexicon.test.js` holds the script
// side of it. But a rule a reader cannot see is not clarity, and a quotation the page does not MARK is
// invisible to every check — the script test says so in its own header. So the mark is the claim:
//
//   | `<... lang="zh-Hant">…</...>` | 資治通鑑's own words: the 原文, or a quotation of it anywhere |
//   | a figure's declared `QUOTED_FIELDS` | the same, in a figure's data rather than its markup |
//   | everything else | the book's own voice |
//
// This file proves, on the pages as shipped:
//
//   1. **No quotation of 通鑑 goes unmarked.** Every 「…」 run in a page's prose whose text is verbatim
//      通鑑 (a substring of the corpus, or one of the four lines the corpus does not carry) is inside an
//      element carrying `lang="zh-Hant"`. Without this, the mark is whatever an author remembered.
//   2. **A figure declares which of its fields are 通鑑's words**, and the declaration is exact in both
//      directions: a field holding a 通鑑 sentence must be declared, and a declared field must hold one.
//      A figure prints 通鑑 outside the page's markup, so no page-side scan can see it.
//   3. **The figures' quotation elements take the mark too**, by requiring each module to set
//      `lang: 'zh-Hant'` where it builds them — the reader's screen reader needs it and so does the
//      stylesheet.
//   4. **The key is on the book's contents page**, in an element with a stable class, so that the mark
//      means something to a reader who does not read the script difference at sight.
//
// What it cannot see, stated rather than hidden:
//
//   - **A one-character quotation.** `isTongjianText` requires two characters, because a single Han
//     character in 「」 is far more often the book naming a word it is about (「命」, 「恒」, 「版」) than
//     quoting 通鑑, and no mechanical rule here can tell those apart. Single-character quotations are
//     therefore outside this check's bound; the same bound is stated in `test/lexicon.test.js`.
//   - **A quotation with one character changed**, or one re-punctuated until it is no longer a substring:
//     it stops being 通鑑 and this file has nothing to say about it. `test/corpus.test.js` and the
//     script check hold the marked runs the other way round (a marked run must BE a quotation), so the
//     two directions together are what make an unmarked quotation hard to hide.
//   - **Whether the mark RENDERS as something a reader notices.** This file reads the markup and the
//     data, not the pixels; `zj.css` carries the rule and the run's screenshots are the evidence for it.
//   - **Whether a quotation of another work is attributed.** 史記, 戰國策, 胡三省注 and 韋昭注 are
//     named in the sentence that quotes them, which is a fact about prose and not about an attribute.
//
// Denominator: the run asserts that it found 原文 blocks, marked runs and quotation runs, and prints
// how many of each it read, so a scan that finds nothing cannot pass as one that found everything.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORPUS } from '../tongjian/corpus.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const TONGJIAN = path.join(root, 'tongjian');
const FIGURES = path.join(root, 'src', 'figures');

const HAN = /[\u3400-\u4dbf\u4e00-\u9fff]|[\u{20000}-\u{2a6df}]/u;
const VOID = new Set(['br', 'hr', 'img', 'meta', 'link', 'input', 'source', 'col', 'area', 'base', 'wbr']);

// 通鑑's own words that this corpus does not carry. The corpus is one year of one 卷, and the 年表 and
// the book's prose print two lines from outside it. This list is kept in step with the same list in
// `test/lexicon.test.js` by hand, and a new quotation from another year has to be added to both — that is
// this check's stated bound, and it is why the list is here rather than folded into the corpus.
//
// It is twice as short as the other file's on purpose. That list also carries the two bare 歲陰歲陽
// names (著雍攝提格, 玄黓困敦), because those are Traditional-only characters the SCRIPT check has to
// account for wherever they appear. Here the question is different — is this run a quotation of 通鑑 or
// the book's use of a year's name — and a year's name in a date line or a 年表 column is a name. The
// page-side scan would otherwise demand a mark on a date, and the figure declaration would have to claim
// `frame` and `season` for it.
const OUTSIDE_CORPUS = [
  '起著雍攝提格，盡玄黓困敦，凡三十五年',
  '魏、韓、趙共廢晉靖公為家人而分其地。',
];

const corpusText = CORPUS.map(e => e.text.join('\n')).join('\n');
const corpusSentences = new Set(CORPUS.flatMap(e => e.text));
/** Is this run of text verbatim 資治通鑑 — a substring of the corpus, or one of the lines named above? */
const isTongjianText = (s) => s.length >= 2 && (corpusText.includes(s) || OUTSIDE_CORPUS.includes(s));

/**
 * Is this WHOLE field a 句 of 通鑑? The figure side asks a narrower question than the page side, and it
 * has to: prose quotes fragments (「唯輔果在」, 「保障」), so a substring is the right predicate there,
 * but a figure's fields are short labels as well as sentences, and `courtNote: '天子之命'` is a label the
 * figure wrote that happens to occur inside a 句 of the 禮論. Identity with a whole 句 is what separates
 * the two: '遂殺智伯，盡滅智氏之族。' is the book's sentence, '天子之命' is the figure's phrase.
 * The bound this leaves: a figure field holding a FRAGMENT of a 句 is not seen here, and a fragment in
 * the book's prose is — which is where a fragment is quoted.
 */
const isTongjianSentence = (s) => corpusSentences.has(s) || OUTSIDE_CORPUS.includes(s);

/** The pages of the book, discovered from disk so a new chapter is covered the day it lands. */
function chapterPages() {
  if (!fs.existsSync(TONGJIAN)) return [];
  return fs.readdirSync(TONGJIAN, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^ch\d/.test(d.name))
    .map(d => path.join(TONGJIAN, d.name, 'index.html'))
    .filter(f => fs.existsSync(f))
    .sort();
}

/**
 * The 通鑑-marker depth at any offset of a page: greater than zero means the character there sits
 * inside an element carrying `lang="zh-Hant"`. Built by walking the tags in order and keeping a stack,
 * so a run split across a `<span>` is read as marked if the span is marked and the run is inside it.
 */
function markerDepth(html) {
  const stack = [];
  const cuts = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) {
          if (stack[i].marked) depth--;
          stack.splice(i, 1);
          break;
        }
      }
    } else if (m[4] !== '/' && !VOID.has(name)) {
      const marked = /\blang="zh-Hant"/.test(m[3]);
      stack.push({ name, marked });
      if (marked) depth++;
    }
    cuts.push([re.lastIndex, depth]);
  }
  return (pos) => {
    let lo = 0;
    let hi = cuts.length - 1;
    let best = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cuts[mid][0] <= pos) { best = cuts[mid][1]; lo = mid + 1; } else hi = mid - 1;
    }
    return best;
  };
}

/**
 * What a reader reads: comments, scripts and attribute values are not text on the page, and the 原文
 * blocks are the primary object rather than a quotation — `test/lexicon.test.js` compares those
 * character for character against the corpus and `test/corpus.test.js` holds the page that reads them.
 */
function proseOf(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length))
    // A <meta> is read by a search engine and a link preview, not by the reader on the page, and no
    // lang marker can reach inside one attribute value. Excluded, with the bound stated in the header.
    .replace(/<meta\b[^>]*>/gi, m => ' '.repeat(m.length))
    .replace(/<script[\s\S]*?<\/script>/gi, m => ' '.repeat(m.length))
    .replace(/<ol class="zj-src"[\s\S]*?<\/ol>/g, m => ' '.repeat(m.length))
    // The figure apparatus — alt text, sort explanations, a note's own label — is the book's prose
    // ABOUT the figure. It is blanked by NAME, because the first quoted string in a tag is usually
    // another attribute's value and blanking that one would leave the apparatus in the scan.
    .replace(/\b(data-alt|data-why|aria-label|data-note)="[^"]*"/g, '$1=""');
}

test('every quotation of 通鑑 in the book\'s prose carries the mark that says so', t => {
  const pages = chapterPages();
  assert.ok(pages.length > 0, 'no chapter page was found, so nothing was checked — the page list must not go quietly empty');

  const offenders = [];
  let blocks = 0;
  let markedRuns = 0;
  let checkedRuns = 0;

  for (const file of pages) {
    const rel = path.relative(root, file);
    const raw = fs.readFileSync(file, 'utf8');
    const html = proseOf(raw);
    const depthAt = markerDepth(html);

    blocks += [...raw.matchAll(/<ol class="zj-src"/g)].length;
    markedRuns += [...html.matchAll(/\blang="zh-Hant"/g)].length;

    for (const m of html.matchAll(/「([^「」]*)」/g)) {
      const inner = m[1];
      const plain = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
      if (!isTongjianText(plain)) continue;
      checkedRuns++;
      // Every Han character of the run, not just its first: a run can begin inside the mark and leave it.
      const start = m.index + 1;
      const unmarked = [];
      for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (!HAN.test(ch)) continue;
        if (depthAt(start + i) === 0) unmarked.push(ch);
      }
      if (unmarked.length) {
        offenders.push(`${rel}: 「${plain}」 is 通鑑's own text and is not marked lang="zh-Hant" — a reader cannot tell it from the book's own sentence (unmarked: ${unmarked.slice(0, 12).join('')})`);
      }
    }
  }

  t.diagnostic(`provenance: ${pages.length} chapter page(s), ${blocks} 原文 block(s) left to test/corpus.test.js, `
    + `${markedRuns} marked run(s), ${checkedRuns} 通鑑 quotation(s) in prose checked; ${offenders.length} unmarked`);
  assert.ok(checkedRuns > 0, 'no quotation of 通鑑 was found in any page\'s prose, so this run compared nothing');
  assert.equal(offenders.length, 0,
    `${offenders.length} quotation(s) of 通鑑 are printed as if the book had written them. A run of 通鑑's words in the `
    + `book's own prose must carry lang="zh-Hant" — that attribute is what the stylesheet marks it with and what a screen `
    + `reader reads it with. See docs/design/tongjian.md, "Which words are the book's".\n      ${offenders.slice(0, 20).join('\n      ')}`);
});

test('a figure declares which of its fields are 通鑑\'s words, and the declaration is exact both ways', t => {
  const modules = ['zj-split.js', 'zj-timeline.js', 'zj-words.js']
    .map(name => path.join(FIGURES, name))
    .filter(f => fs.existsSync(f));
  assert.ok(modules.length > 0, 'no figure module was found, so nothing was checked');

  let declared = 0;
  let quotations = 0;
  for (const file of modules) {
    const rel = path.relative(root, file);
    const src = fs.readFileSync(file, 'utf8');
    const fields = /export const QUOTED_FIELDS = \[([^\]]*)\]/.exec(src);
    assert.ok(fields, `${rel}: exports no QUOTED_FIELDS, so a checker cannot tell which of its fields are 通鑑's words rather than the figure's own`);
    const names = new Set(fields[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean));
    assert.ok(names.size > 0, `${rel}: QUOTED_FIELDS is empty, so no field of it is checked`);
    declared += names.size;

    // Every `name: '…'` in the module, wherever it stands — zj-words' 句 are written one to a line
    // inside a single-line object, and a line-anchored pattern would read none of them.
    const literals = new Map();
    for (const m of src.matchAll(/([A-Za-z_$][\w$]*):\s*'([^']*)'/g)) {
      if (!literals.has(m[1])) literals.set(m[1], []);
      literals.get(m[1]).push(m[2]);
    }
    for (const [name, values] of literals) {
      const quoted = values.filter(v => isTongjianSentence(v));
      if (quoted.length) quotations += quoted.length;
      if (names.has(name)) {
        if (!quoted.length) {
          t.diagnostic(`${rel}: QUOTED_FIELDS names \`${name}\`, whose value(s) are not 通鑑's text — allowed only if the field also carries one`);
        }
      } else if (quoted.length) {
        assert.fail(`${rel}: \`${name}\` holds 通鑑's own words (「${quoted[0].slice(0, 40)}」) but is not named in QUOTED_FIELDS, so the figure prints 通鑑 without the book saying it is 通鑑`);
      }
    }
    for (const name of names) {
      assert.ok(literals.has(name),
        `${rel}: QUOTED_FIELDS names \`${name}\`, which no row of the figure defines — a declaration nothing carries is a claim the data does not support`);
    }
    assert.ok(/lang:\s*'zh-Hant'/.test(src),
      `${rel}: the element it prints 通鑑 into does not set lang="zh-Hant", so the quotation is unmarked for the stylesheet and for a screen reader`);
  }

  t.diagnostic(`figures: ${modules.length} module(s), ${declared} declared field(s), ${quotations} 通鑑 quotation(s) in figure data`);
  assert.ok(quotations > 0, 'no figure field was found holding 通鑑\'s words, so the declaration was never exercised');
});

test('the book\'s contents page states the key to the mark', t => {
  const page = path.join(TONGJIAN, 'index.html');
  assert.ok(fs.existsSync(page), `${path.relative(root, page)} is missing, so the key has nowhere to live`);
  const html = fs.readFileSync(page, 'utf8');
  // The class is matched as a TOKEN, not as a substring. `\bzj-key\b` reads `class="zj-key-removed"` as a
  // match, because `-` is a word boundary — so the first version of this check stayed green when the key's
  // class was renamed, and the mutation proof (gate-proofs.md, "the key") is what found it.
  let text = null;
  for (const m of html.matchAll(/<p[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/p>/g)) {
    if (m[1].split(/\s+/).includes('zj-key')) { text = m[2].replace(/<[^>]+>/g, '').trim(); break; }
  }
  assert.notEqual(text, null, 'tongjian/index.html carries no <p class="… zj-key …">, so a reader is never told what the mark means');
  assert.ok(text.length >= 12, `the key is too short to say anything: 「${text}」`);
  assert.ok(/繁体|繁體/.test(text) && /简体|簡體/.test(text),
    `the key does not name both scripts, which is the distinction it exists to state: 「${text}」`);
  t.diagnostic(`key: ${text.length} character(s) on the contents page`);
});
