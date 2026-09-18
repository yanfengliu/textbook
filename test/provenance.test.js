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
//   1. **No 「…」 quotation of 通鑑 in a page's prose goes unmarked.** Every run the book brackets with
//      「」 whose text is verbatim 通鑑 (a substring of the corpus, or one of the two lines the corpus
//      does not carry) is inside an element carrying `lang="zh-Hant"`. Without this, the mark is whatever
//      an author remembered.
//   2. **No run of 通鑑's own words long enough to be a quotation is printed bare either.** A run the
//      book neither brackets nor marks was invisible to check 1, whose predicate is the book's own
//      brackets, and — where it is Simplified or script-identical — to `test/lexicon.test.js`'s script
//      check too, so a reader met a clause of the received text printed as the book's own sentence. That
//      is the hole the owner's "make it clear what came from the book" instruction left open, and the
//      predicate here is a length floor measured rather than chosen: see "The floor, and how it was
//      measured" below.
//   3. **A figure declares which of its fields are 通鑑's words**, and the declaration is exact in both
//      directions: a field holding a 通鑑 sentence must be declared, and a declared field must hold one.
//      A figure prints 通鑑 outside the page's markup, so no page-side scan can see it. The scan reads
//      every literal form — `'…'`, `"…"` and `` `…` `` — because a gate that reads one quoting style is a
//      gate an author can walk around without meaning to.
//   4. **The figures' quotation elements take the mark too**, by requiring each module the REGISTRY
//      registers to set `lang: 'zh-Hant'` where it builds them — the reader's screen reader needs it and
//      so does the stylesheet. The module list comes from `src/figures/registry.js`, so renaming or
//      dropping a file makes this run fail rather than cover less.
//   5. **The key is on the book's contents page**, in an element with a stable class, so that the mark
//      means something to a reader who does not read the script difference at sight.
//
// The floor, and how it was measured. Check 2 fires on a bare, unmarked run of **6 or more Han
// characters** that is verbatim 通鑑. The number is the width of a measured gap, not a taste.
// `out/provenance-bare/probe.mjs` (scratch, taken 2026-09-20 on the three shipped chapters) read every
// maximal corpus run in the pages' prose — 639 of them, 55 already marked and 73 inside 「」 — and grouped
// the 566 that were neither by Han-character count. **4 and below is the population this check is not
// about**: 14 runs at 4, 35 at 3, 264 at 2 — 智伯, 大夫, 卿大夫, 智宣子, 魏桓子, 晋阳, a chapter title,
// and the four class names the chapter teaches (才德全尽 / 德胜才 / 才德兼亡 / 才胜德). Those are the
// book's own vocabulary used as its own subject, and a check that fired on them is noise an author learns
// to ignore. **6 and above is where every run in the three chapters is a clause of the received text.**
// The five that stood there are named in `docs/learning/gate-proofs.md`; all five were fixed by
// bracketing and marking them (Traditional, verbatim). **5 is the band the floor is set above**: it holds
// two runs, 康子生武子 and 章，武子生虔，, both from chapter 2's own sentence narrating the 世系
// (「韩康子生武子启章，武子生虔，就是景侯」) rather than a citation. They are named here rather than
// silently missed, and they are what the floor costs.
//
// What it cannot see, stated rather than hidden:
//
//   - **A one-character quotation.** `isTongjianText` requires two characters, because a single Han
//     character in 「」 is far more often the book naming a word it is about (「命」, 「恒」, 「版」) than
//     quoting 通鑑, and no mechanical rule here can tell those apart. Check 2's floor is the same bound
//     one band higher: any bare run under 6 Han characters is outside both. The same bound is stated in
//     `test/lexicon.test.js`.
//   - **A Simplified rendering of a 通鑑 clause**, which is the class check 2 misses by construction and
//     the reason it has a floor rather than a switch. Every character of 才德全尽 is Simplified where the
//     corpus prints 才德全盡, so no substring test can see it; the same holds for 挟才以为善 and for the
//     世系 clause above. Check 2 reads only the characters the corpus and the page share. The class was
//     found by the same probe and fixed by hand on 2026-09-20 — chapter 3's sort card now prints its
//     received-text clauses Traditional and marked — and a page that adds another one will not be caught
//     here.
//
//     **Folding the script away instead of narrowing the floor was tried and measured, and it does not
//     work.** `out/provenance-bare/probe2.mjs` folds both sides through the same
//     `test/fixtures/traditional-only.txt` table before comparing, which is what makes 决 match 決, and
//     then reads the pages as they stood before this round's fixes: at a floor of 6 Han characters it
//     fires on **12** runs, of which **6 are the book's own Simplified voice** — 尽灭智氏之族 and
//     魏、韩、赵共废晋 in chapter 1, the 世系 sentence and 相亲之兵待轻敌之人，智氏 in chapter 2,
//     才胜德谓之小人。 and 才有余而德不足， in chapter 3 — against the 5 the round fixed. **No floor
//     separates the two classes**: at 7 the book's own 世系 sentence and its explanation still fire at 12
//     and 11 Han, and they are still the two longest runs of all at a floor of 10. The reason is not
//     tuning but what the fold erases. The book's line between its own words and 通鑑's **is** the script:
//     the design defines a quotation as verbatim *character for character*, and verbatim is what makes a
//     run Traditional. Fold 決 to 决 and 乾 to 干 and the book's own narration of the story is the same
//     string as the received text, so a predicate on that string measures the book's voice, not its
//     citations. The table also folds many Traditional forms onto one Simplified form — 乾→干, 後→后 —
//     so a folded match can be between two characters that were never the same text.
//   - **A run inside the book's apparatus rather than its prose.** `proseOf` blanks `data-alt`,
//     `data-why`, `aria-label` and `data-note` before the scan, so a 通鑑 clause inside a sort card's
//     `data-why` — rendered once the item is placed — is outside check 2 as well as check 1. That is the
//     same blanking that keeps a figure's own description from being read as prose, and it is why the
//     floor's population was measured with the same blanking in place.
//   - **A quotation with one character changed**, or one re-punctuated until it is no longer a substring:
//     it stops being 通鑑 and this file has nothing to say about it. `test/corpus.test.js` and the
//     script check hold the marked runs the other way round (a marked run must BE a quotation), so the
//     two directions together are what make an unmarked quotation hard to hide.
//   - **A textual note, which is the one place on a page where a quotation is not a citation.** An
//     `<aside data-note="textual">` discusses the TEXT — a witness reads otherwise, the 底本 lacks these
//     two characters, the editor supplied them from another edition — so a 「…」 run inside one may be a
//     reading the received text does not carry. 「不可」 in chapter 2's 異文 note is exactly that: the
//     corpus prints it because the edition this book follows prints it, and the note's own words say it
//     is absent from the 底本. Marking it as 通鑑's own words would contradict the note beside it, so
//     these notes are skipped by the requirement and their marked runs are held by `test/lexicon.test.js`
//     instead. A quotation in a textual note therefore gets the weaker of the two checks, which is the
//     honest arrangement and is stated rather than left to be discovered.
//   - **Whether the mark RENDERS as something a reader notices.** This file reads the markup and the
//     data, not the pixels; `zj.css` carries the rule and the run's screenshots are the evidence for it.
//   - **Whether a quotation of another work is attributed.** 史記, 戰國策, 胡三省注 and 韋昭注 are
//     named in the sentence that quotes them, which is a fact about prose and not about an attribute.
//
// Denominator: the run asserts that it found 原文 blocks, marked runs and quotation runs, and prints
// how many of each it read, so a scan that finds nothing cannot pass as one that found everything. Check
// 2 prints the corpus runs it read, how many of them were marked, how many sat inside 「」 and how many
// were bare, so a clean run says which of the three it compared.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORPUS } from '../tongjian/corpus.js';
import { FIGURES as REGISTRY } from '../src/figures/registry.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const TONGJIAN = path.join(root, 'tongjian');

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

// The two sources a bare run is looked up in, and the predicate check 2 searches with. `isTongjianText`
// needs a length guard because `''` is a substring of everything; the search below asks a different
// question — how far a run can be extended before it stops being 通鑑 — so it starts at 2 and the guard
// is that start.
const QUOTE_SOURCES = [corpusText, ...OUTSIDE_CORPUS];
const isQ = (s) => QUOTE_SOURCES.some(src => src.includes(s));

/** How long a bare run may be before this check stops measuring. Longer than the longest corpus 句. */
const MAX_QUOTE = 96;
/** The floor. Its measurement is in the header, under "The floor, and how it was measured". */
const BARE_FLOOR = 6;

/**
 * The longest run at `from` that is a verbatim quotation, or 0 if there is none.
 *
 * A binary search, because "is a prefix of this text in the corpus" can only fall as the prefix grows:
 * a prefix of a quotation is a quotation of the same source. So the first length that fails is the
 * boundary, and the search is over lengths rather than over the corpus.
 */
function longestQuotation(text, from) {
  const max = Math.min(MAX_QUOTE, text.length - from);
  let lo = 2;
  let hi = max;
  let best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (isQ(text.slice(from, from + mid))) { best = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return best;
}

/**
 * The prose as one flat string, with each character's offset in the html it came from.
 *
 * The offsets matter twice: `markerDepth` is asked at them for the mark, and a failure message names the
 * line the run is on. Tags contribute no character, so a run the markup splits across a `<span>` is one
 * run here — which is the point, since the mark is what splits it.
 */
function flattenProse(html) {
  const raw = [];
  let text = '';
  let i = 0;
  let m;
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g;
  while ((m = re.exec(html))) {
    for (let k = i; k < m.index; k++) { text += html[k]; raw.push(k); }
    i = re.lastIndex;
  }
  for (let k = i; k < html.length; k++) { text += html[k]; raw.push(k); }
  return { text, raw };
}

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
    // A textual note — 異文, 異說, 底本 — discusses the TEXT, so a 「…」 run inside one may be a reading
    // the received text does not carry; 「不可」 in chapter 2 is absent from the 底本 and the note says so.
    // Blanked before the attribute blanking below removes the hook it is selected by. The header states
    // what this costs: a quotation in a textual note is held by test/lexicon.test.js, the weaker check.
    .replace(/<aside\b[^>]*\bdata-note="textual"[^>]*>[\s\S]*?<\/aside>/g, m => ' '.repeat(m.length))
    // The figure apparatus — alt text, sort explanations, a note's own label — is the book's prose
    // ABOUT the figure. It is blanked by NAME, because the first quoted string in a tag is usually
    // another attribute's value and blanking that one would leave the apparatus in the scan.
    //
    // Blanked to the same LENGTH rather than to `name=""`. A shorter replacement moves every offset after
    // it, and check 2 reports the line a bare run is on by counting newlines up to that offset — so the
    // failure would name the wrong line, and the wrong line is a failure message that cannot be acted on.
    .replace(/\b(data-alt|data-why|aria-label|data-note)="([^"]*)"/g, (m, name, body) => `${name}="${' '.repeat(body.length)}"`);
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

test('a run of 通鑑\'s own words long enough to be a quotation carries the mark, bracketed or not', t => {
  // The sibling check above is bounded by the book's own brackets, and the bound is not a detail: a
  // 「」-less quotation is invisible to it, and where the run is Simplified or happens to be identical in
  // both scripts it is invisible to `test/lexicon.test.js`'s script check too. So this check reads the
  // page's prose for verbatim corpus text wherever it stands, and asks whether the mark is on it.
  //
  // The predicate is a length floor and not a switch, and the floor's measurement is in the file header.
  // In one line: names, offices, places and the terms the chapters teach are 4 Han characters or fewer
  // (measured: the longest is 才德兼亡 at 4), every run at 6 or more is a clause of the received text, and
  // 5 is the band between them, named there rather than hidden.
  const pages = chapterPages();
  assert.ok(pages.length > 0, 'no chapter page was found, so nothing was checked — the page list must not go quietly empty');

  const offenders = [];
  let read = 0;
  let markedRuns = 0;
  let bracketedRuns = 0;
  let shortBareRuns = 0;

  for (const file of pages) {
    const rel = path.relative(root, file);
    const original = fs.readFileSync(file, 'utf8');
    const html = proseOf(original);
    const depthAt = markerDepth(html);
    const { text, raw } = flattenProse(html);
    const brackets = [...text.matchAll(/「[^「」]*」/g)].map(m => [m.index, m.index + m[0].length]);

    // Every maximal corpus run in this page's prose, found by extending each position as far as the
    // corpus allows and then dropping a run that another run contains. The sort is by start, longest
    // first, so the sweep below keeps the outermost run at each place.
    const intervals = [];
    for (let i = 0; i < text.length; i++) {
      const len = longestQuotation(text, i);
      if (len >= 2) intervals.push([i, i + len]);
    }
    intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    let reach = -1;
    for (const [a, b] of intervals) {
      if (b <= reach) continue;
      reach = b;
      const run = text.slice(a, b);
      const han = [...run].filter(ch => HAN.test(ch)).length;
      if (han < 2) continue;
      read++;
      // Every Han character of the run, not just its first: a run can begin inside the mark and leave it.
      let marked = false;
      for (let k = a; k < b; k++) if (HAN.test(text[k]) && depthAt(raw[k]) > 0) marked = true;
      if (marked) { markedRuns++; continue; }
      if (brackets.some(([x, y]) => a >= x && b <= y)) { bracketedRuns++; continue; }
      if (han < BARE_FLOOR) { shortBareRuns++; continue; }
      const line = original.slice(0, raw[a]).split('\n').length;
      offenders.push(`${rel}:${line}: 「${run}」 is 通鑑's own text, verbatim in tongjian/corpus.js, and is printed bare — no `
        + `「」 and no lang="zh-Hant" — so a reader reads it as the book's own sentence`);
    }
  }

  t.diagnostic(`bare runs: ${pages.length} chapter page(s), ${read} maximal 通鑑 run(s) read in the prose — `
    + `${markedRuns} marked, ${bracketedRuns} inside 「」 and unmarked (check 1's population), ${shortBareRuns} bare and under `
    + `${BARE_FLOOR} Han characters (the floor's population); ${offenders.length} bare and at or above it`);
  assert.ok(read > 0, 'no run of 通鑑\'s own words was found in any page\'s prose, so this run compared nothing');
  assert.ok(markedRuns > 0, 'no marked run was found, so the scan is not reading the pages it claims to');
  assert.equal(offenders.length, 0,
    `${offenders.length} run(s) of 通鑑's own words are printed in the book's prose with neither the 「」 that would mark them as `
    + `a citation nor the lang="zh-Hant" that says whose they are. Either bracket and mark the run in the Traditional script, `
    + `exactly as tongjian/corpus.js prints it, or say it in the book's own words. See docs/design/tongjian.md, "Which words `
    + `are the book's".\n      ${offenders.slice(0, 20).join('\n      ')}`);
});

test('a figure declares which of its fields are 通鑑\'s words, and the declaration is exact both ways', t => {
  // The module list comes from the registry, not from a list written here. It used to be three hardcoded
  // names filtered by `existsSync` with a `> 0` floor, and a review reproduced the hole by renaming
  // `zj-words.js`: the run reported `2 module(s)` and passed, while this file's own header claimed each of
  // the three was checked. A gate whose subject list can shrink without a word is a gate that covers less
  // the day someone renames a file.
  const kinds = Object.keys(REGISTRY).filter(k => k.startsWith('zj-'));
  assert.ok(kinds.length > 0, 'the registry holds no zj-* kind, so nothing was checked — the second book\'s figures are registered under that prefix');
  const modules = kinds.map((kind) => {
    const url = REGISTRY[kind].url;
    assert.ok(typeof url === 'string' && url.startsWith('file:'), `registry kind "${kind}" names no module file, so its quotation declaration cannot be read`);
    return { kind, file: fileURLToPath(url) };
  });

  let declared = 0;
  let quotations = 0;
  for (const { kind, file } of modules) {
    const rel = path.relative(root, file);
    assert.ok(fs.existsSync(file), `registry kind "${kind}" points at ${rel}, which is not on disk`);
    const src = fs.readFileSync(file, 'utf8');
    const fields = /export const QUOTED_FIELDS = \[([^\]]*)\]/.exec(src);
    assert.ok(fields, `${rel}: exports no QUOTED_FIELDS, so a checker cannot tell which of its fields are 通鑑's words rather than the figure's own`);
    const names = new Set(fields[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean));
    assert.ok(names.size > 0, `${rel}: QUOTED_FIELDS is empty, so no field of it is checked`);
    declared += names.size;

    // Every `name: <literal>` in the module, in all three quoting styles. A review planted a whole 句 in a
    // double-quoted undeclared field and the single-quote-only scan stayed green, which made this half of
    // the gate one an author could walk around without meaning to.
    const literals = new Map();
    for (const m of src.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*(['"`])((?:\\.|(?!\2)[^\\])*?)\2/gs)) {
      if (!literals.has(m[1])) literals.set(m[1], []);
      literals.get(m[1]).push(m[3]);
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

  t.diagnostic(`figures: ${modules.length} registry kind(s) — ${kinds.join(', ')} — ${declared} declared field(s), ${quotations} 通鑑 quotation(s) in figure data`);
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
