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
//   6. **A 通鑑 quotation outside the passage the page reads names the work it came from.** The 原文 is a
//      selection of passages and a figure or a paragraph may quote an entry outside it — figure 2.1
//      quotes the 前376 entry while the 原文 does not — so a quotation that is not a substring of the
//      page's own `<ol class="zj-src" data-corpus="…">` entries must stand in a paragraph that names
//      通鑑. That is the structural half of the defect the owner hit, whose prose half is check 8: the
//      design's answer is to make the citation mandatory at the quotation rather than to let the page
//      assert its own selection in prose four lines above it.
//   7. **A figure row that prints a `quote` carries a non-empty citation.** Every row of the two figures
//      that have one does today — `quoteAt` on `zj-timeline`, `source` on `zj-split` — and nothing
//      required it, so a row added without one printed 通鑑 with the figure's own voice around it.
//   8. **No sentence may say the book excludes a passage while printing that passage.** The exemplar is
//      chapter 2's 背景, which said of the 前376 entry 「不在本书的取材范围之内，所以这里只转述，不引原文」
//      with the entry quoted four lines below in figure 2.1. The sentence now says what the book does; this
//      holds the shape rather than the instance, so a page that prints a 通鑑 sentence in the same sentence
//      that claims to exclude it is red.
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
// Five stood there at that revision — chapter 2's opener dek (智伯之亡也，才胜德也), chapter 2's `q-chici`
// explanation (人馬相食，城降有日), chapter 3's `q-yuren` option (智足以遂其奸), chapter 3's `q-yuren`
// explanation (愚者雖欲為不善，智不能周，力不能勝) and chapter 3's sort item (智不能周，力不能勝) — and all
// five were fixed by bracketing and marking them, Traditional and verbatim. **5 is the band the floor is
// set above**: it holds two runs, 康子生武子 and 章，武子生虔，, both from chapter 2's own sentence narrating
// the 世系 (「韩康子生武子启章，武子生虔，就是景侯」) rather than a citation, and both are what the floor
// costs. One character lower still — a floor of 4 — and the class names the chapter teaches are in range
// (才德兼亡, 才德全尽), which is the noise the floor exists to keep out.
//
// What it cannot see, stated rather than hidden:
//
//   - **Whether a page that DOES name the work names it correctly.** Checks 6 and 8 read whether a source
//     is named, not whether the name is right: 「图 2.1 里引它的原句为证」 is a claim about another element
//     on the page, and only a person comparing the two can hold it. That is the same class as the false
//     sentence this round fixed, and it is the bound of a check that reads whose words are whose without
//     reading whether the words are true.
//   - **A quotation from another work.** 史記, 戰國策, 胡三省注 and 韋昭注 are named in the sentence that
//     quotes them and carry no attribute, which the design record states. Check 6 asks a page that quotes
//     **通鑑** from outside its selection to name the work, so a sentence that names 史記 and quotes 通鑑
//     still fires — deliberately, because the question is which words the reader is being given.
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
//   - **Whether a page that DOES name the work names it correctly.** Check 6 reads whether a source is
//     named, not whether the name is right: 「图 2.1 里引它的原句为证」 is a claim about another element on
//     the page, and only a person comparing the two can hold it. Same class as the false sentence check 8
//     was written for, and the bound of a check that reads whose words are whose without reading whether
//     the words are true.
//   - **Whether a quotation of another work is attributed.** 史記, 戰國策, 胡三省注 and 韋昭注 are
//     named in the sentence that quotes them, which is a fact about prose and not about an attribute.
//
// Denominator: the run asserts that it found 原文 blocks, marked runs and quotation runs, and prints
// how many of each it read, so a scan that finds nothing cannot pass as one that found everything. Check
// 2 prints the corpus runs it read, how many of them were marked, how many sat inside 「」 and how many
// were bare, so a clean run says which of the three it compared. Check 6 prints the marked runs it read
// and how many fell outside the page's own selection; check 7 prints the rows it read, how many print a
// quotation and how many of those cite it, so `0 rows` cannot read as `all rows`; check 8 prints the
// sentences that claim an exclusion and how many of them print a 通鑑 quotation, so a run that read no
// sentence of that shape says so.
//
// **Check 6's predicate is a measured narrowing, not the whole class, and the sharper form was tried
// first.** That form — a paragraph must carry a `.zj-at` rubric, a 卷 number or a 年 — fires on 8 marked
// runs and is wrong on 4 of them: at this revision chapter 2 and chapter 3 each name a
// passage's place in the book's own order (「原书的次序是「初，智宣子將以瑤為後」一路写到「唯輔果在」」) to
// discuss that order rather than to quote it, and chapter 2 adds a four-character cross-reference to the
// three-character title of a section the reader has not reached. The predicate shipped here fires on 13
// runs and on none of them is the paragraph's silence a page that failed to say where its words came
// from, because naming the work is what those 13 do. What it cannot see is stated above: a paragraph
// that names the work and gets the citation wrong.
//
// **Check 6 counts a page's own selection only, so a quotation that is ANOTHER chapter's selection looks
// like a context quotation here.** Every chapter's selection contains 「臣光曰」, so chapter 2's opener, which
// quotes 智伯之亡也，才勝德也 in one breath with naming the ch03 passage it comes from, is counted as
// quoted from elsewhere. It is fixed and not merely counted: at this revision the paragraph names 通鑑.
// The direction that matters is the one that costs nothing, and it is the one this check found the one
// real defect in — chapter 2's opener was quoted with no source in its paragraph at all.
//
// **Check 8 reads a sentence, so a quotation with a 句号 inside it ends the sentence being examined.**
// That is a bound rather than a hole: the page that prints the quotation is read, and the run inside it
// is what carries the mark. The arm that proved this check red was written twice before it fired, both
// times because the claimed defect was in a *different* sentence from the quotation — which is the same
// shape as the defect, and not the defect.
//
// **Check 7's bound is its row parser.** A row is an object written directly in an array, and the parse
// is bracket-aware rather than brace-depth-only because the first version of it — every object at brace
// depth 1 — read `zj-words`'s UI label 「由字成词」 as a row: `h('p', { …, text: '由字成词' })` sits inside
// an `append(…)` whose `)` never opens a brace, so the depth counter loses a level and two stray
// labels became two phantom rows printing 通鑑. Measured on the three modules: 15 objects, 8 of them
// rows printing a quotation, all 8 citing it. A module that stops storing its rows in an array stops
// being read here, and nothing but the printed denominator would say so.

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
/** The corpus by id, so a page's `data-corpus` names the text it reads. */
const byId = new Map(CORPUS.map(e => [e.id, e]));
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

/**
 * Every element of the page that carries the 通鑑 mark, as { start, end } into the same html `proseOf`
 * was given — the offsets matter because the block a run sits in is read from them.
 */
function markedSpans(html) {
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g;
  const stack = [];
  const spans = [];
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) {
          const el = stack.splice(i, 1)[0];
          el.end = m.index;
          if (el.marked) spans.push(el);
          break;
        }
      }
    } else if (m[4] !== '/' && !VOID.has(name)) {
      stack.push({ name, marked: /\blang="zh-Hant"/.test(m[3]), start: re.lastIndex, end: html.length });
    }
  }
  return spans;
}

/** The text of an element, tags stripped — the reader's words and no markup. */
const textOfSpan = (html, span) => html.slice(span.start, span.end).replace(/<[^>]*>/g, '');

/** The block a run must be cited in: the nearest element a citation could stand in. */
const CITING_BLOCK = new Set(['p', 'li', 'aside', 'figcaption', 'td', 'th', 'dd', 'h2', 'h3', 'blockquote']);

/**
 * The block a marked element sits in, as its text before and after that element. `data-alt`, `data-why`,
 * `aria-label` and `data-note` are cut before the question is asked, because a citation written into one
 * of them is not text the reader sees and the scan would be reading the author's note as the page's prose.
 */
function blockAround(html, span) {
  let innerStart = html.length;
  for (const m of html.slice(0, span.start).matchAll(/<([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    if (m[2] === '/') continue;
    if (CITING_BLOCK.has(m[1].toLowerCase())) innerStart = m.index;
  }
  let innerEnd = html.length;
  for (const m of html.slice(span.end).matchAll(/<\/([a-zA-Z][\w-]*)>/g)) {
    if (CITING_BLOCK.has(m[1].toLowerCase())) { innerEnd = span.end + m.index; break; }
  }
  const block = `${html.slice(innerStart, span.start)}${html.slice(span.end, innerEnd)}`;
  return block.replace(/\b(data-alt|data-why|aria-label|data-note)="([^"]*)"/g, '$1=""');
}

/**
 * Does this text name 通鑑? Bracketless mentions count, because the pages write 通鑑 without its 書名號
 * where the sentence already carries one — chapter 2's 異文 note does exactly that. The lookarounds keep
 * a mention of the book inside another word from counting; no such word exists in this book today, and
 * the guard is there so that one does not start counting silently.
 */
const NAMES_WORK = /《\s*(?:资治通鉴|資治通鑑|通鉴|通鑑)\s*》|(?<![\u4e00-\u9fff])通(?:鉴|鑑)(?![\u4e00-\u9fff])/;

// Check 6: a quotation the page does not read must say whose words these are.
test('a 通鑑 quotation from outside the passage the page reads names the work it came from', t => {
  const pages = chapterPages();
  assert.ok(pages.length > 0, 'no chapter page was found, so nothing was checked — the page list must not go quietly empty');

  const offenders = [];
  let markedRuns = 0;
  let inSelection = 0;
  let outOfSelection = 0;
  let namesWork = 0;
  let blankedRuns = 0;

  for (const file of pages) {
    const rel = path.relative(root, file);
    const original = fs.readFileSync(file, 'utf8');
    const html = proseOf(original);
    // The page's own reading, named by the very attribute `test/corpus.test.js` holds: the entries its
    // `<ol class="zj-src">` blocks cite. A run that is a substring of one of these is the passage the
    // page reads, wherever it stands.
    const selection = [...original.matchAll(/<ol class="zj-src"[^>]*data-corpus="([^"]+)"/g)]
      .flatMap(m => (byId.get(m[1]) || { text: [] }).text).join('\n');

    for (const span of markedSpans(html)) {
      const text = textOfSpan(html, span).replace(/\s+/g, '');
      // Blanking an 原文 block removes its text, so those spans are counted rather than silently
      // dropped: a page whose blocks the blanking swallowed must say so.
      if (!text) { blankedRuns++; continue; }
      markedRuns++;
      if (selection.includes(text)) { inSelection++; continue; }
      outOfSelection++;
      if (NAMES_WORK.test(blockAround(html, span))) { namesWork++; continue; }
      // The line the run is on: `proseOf` blanks regions to spaces of the same length and keeps every
      // offset, so the offset into `html` is the offset into `original`.
      const line = original.slice(0, span.start).split('\n').length;
      offenders.push(`${rel}:${line}: 「${text.slice(0, 40)}」 is quoted from outside this page's own 原文 selection and the paragraph it stands in never names 通鑑 — a reader is given 通鑑's words with nothing saying whose they are`);
    }
  }

  t.diagnostic(`citations: ${pages.length} chapter page(s), ${markedRuns} marked run(s) read in the prose `
    + `(${blankedRuns} more inside an 原文 block, which this check does not read), ${inSelection} of them part of the page's own `
    + `selection, ${outOfSelection} quoted from elsewhere and ${namesWork} of those naming the work; ${offenders.length} that do not`);
  assert.ok(markedRuns > 0, 'no marked run was found, so this run compared nothing');
  assert.ok(outOfSelection > 0, 'no marked run quoted from outside its page\'s own selection was found, so the citation requirement was never exercised — either the pages changed or this check stopped reading them');
  assert.equal(offenders.length, 0,
    `${offenders.length} quotation(s) of 通鑑 stand outside the passage the page reads and never say where they came from. `
    + `Name the work at the quotation — 《通鉴》卷一, a .zj-at rubric, or the figure field that carries it — or say the sentence `
    + `in the book's own words. See docs/design/tongjian.md, "Which words are the book's, and which are 通鑑's".\n      ${offenders.slice(0, 20).join('\n      ')}`);
});

/**
 * The object literals a figure module is built from, each as a map from field name to its literals.
 *
 * A row is an object written directly inside an array — `YEARS`, `STEPS`, `LINES` — which is what
 * `[` at depth 1 with `{` at depth 0 means. That is deliberately narrower than "every object at depth
 * 1": a figure's `meta` is not a row, and neither is the `SCOPE` constant, which prints 通鑑 too but
 * belongs to the 卷 rather than to a year and has no year to cite it to. The bound that costs is stated
 * in the file header: a module that stops storing its rows in an array stops being read here, and the
 * denominator printed below is what says so.
 */
function rowObjects(src) {
  const slices = [];
  let brace = 0;
  let bracket = 0;
  let start = -1;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '[') bracket++;
    else if (c === ']') bracket--;
    else if (c === '{') {
      if (brace === 0 && bracket === 1) start = i;
      brace++;
    } else if (c === '}') {
      brace--;
      if (brace === 0 && start >= 0) { slices.push(src.slice(start, i + 1)); start = -1; }
    }
  }
  return slices.map((row) => {
    const fields = new Map();
    for (const m of row.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*(['"`])((?:\\.|(?!\2)[^\\])*?)\2/gs)) {
      if (!fields.has(m[1])) fields.set(m[1], []);
      fields.get(m[1]).push(m[3]);
    }
    return fields;
  });
}

// Check 7: a row that prints a quotation carries the citation for it.
test('a figure row that prints a 通鑑 quotation carries a non-empty citation for it', t => {
  const kinds = Object.keys(REGISTRY).filter(k => k.startsWith('zj-'));
  assert.ok(kinds.length > 0, 'the registry holds no zj-* kind, so nothing was checked');

  const offenders = [];
  let rows = 0;
  let quotedRows = 0;
  let citedRows = 0;
  const perModule = [];

  for (const kind of kinds) {
    const file = fileURLToPath(REGISTRY[kind].url);
    const rel = path.relative(root, file);
    const src = fs.readFileSync(file, 'utf8');
    const declared = /export const QUOTED_FIELDS = \[([^\]]*)\]/.exec(src);
    assert.ok(declared, `${rel}: exports no QUOTED_FIELDS, so a checker cannot tell which of its fields print 通鑑`);
    const printed = declared[1].split(',').map(x => x.trim().replace(/^'|'$/g, '')).filter(Boolean);
    assert.ok(printed.length > 0, `${rel}: QUOTED_FIELDS is empty, so no field of it can print a quotation`);
    let here = 0;
    let hereQuoted = 0;
    for (const fields of rowObjects(src)) {
      here++;
      // A row that prints a quotation: any declared field holding anything at all. `quote: ''` is a year
      // with no quotation to give, and is not the row this check is about.
      const quoted = printed.flatMap(name => (fields.get(name) || []).filter(v => v.trim()).map(v => ({ name, v })));
      if (!quoted.length) continue;
      quotedRows++;
      hereQuoted++;
      // The citation field goes by whatever the figure's own convention calls it: `quoteAt` on
      // zj-timeline, `source` on zj-split and zj-words. A row carrying neither is the defect.
      const cite = [...(fields.get('quoteAt') || []), ...(fields.get('source') || [])].some(c => c.trim());
      if (cite) { citedRows++; continue; }
      offenders.push(`${rel}: \`${quoted[0].name}\` prints 「${quoted[0].v.slice(0, 30)}」 and the row carries no non-empty quoteAt or source, so the figure prints 通鑑 with no citation on it`);
    }
    rows += here;
    perModule.push(`${kind} ${hereQuoted}/${here}`);
  }

  t.diagnostic(`figure citations: ${kinds.length} zj-* module(s) read, ${rows} row(s) seen (printing a quotation / all: ${perModule.join(', ')}), `
    + `${quotedRows} printing a 通鑑 quotation and ${citedRows} of those carrying a non-empty citation; ${offenders.length} without`);
  assert.ok(rows > 0, 'no figure row object was found in any module, so the citation requirement was never exercised');
  assert.ok(citedRows > 0, 'no figure row printing a 通鑑 quotation was found carrying a citation, so this run compared nothing — a check that finds no cited row cannot tell a clean figure from an unread one');
  assert.equal(offenders.length, 0,
    `${offenders.length} figure row(s) print a 通鑑 quotation and say nothing about where it came from. Every row that prints `
    + `one carries the 卷 and the year beside it — quoteAt on zj-timeline, source on zj-split and zj-words.\n      ${offenders.slice(0, 20).join('\n      ')}`);
});

/**
 * The page's sentences, as slices of its html — a slice runs from after the previous 句号 to and
 * including the next one. Split by matching rather than by line, because the markup carries no line
 * breaks and a sentence that a `<span>` begins on one line of the file is one slice here.
 */
function sentencesOf(html) {
  const out = [];
  let start = 0;
  for (let i = 0; i < html.length; i++) {
    if (html[i] !== '。') continue;
    out.push(html.slice(start, i + 1));
    start = i + 1;
  }
  if (start < html.length) out.push(html.slice(start));
  return out;
}

/**
 * A sentence that says a passage is kept out of this book. Shipped as written, because a regex over prose
 * is a claim about wording and the wording is what it reads. The clause is about the BOOK'S OWN reading:
 * chapter 3 says 「不是神宗序里的原文」 of a phrase that is in 胡三省's 注序, which is about where a
 * quotation comes from rather than about whether this page prints it, so it is outside the predicate —
 * and that is the narrowing, measured: see the header.
 */
const CLAIMS_EXCLUDED = /不[^。；\n]{0,12}(?:列入|收入|选入|算(?:作|入)|在)[^。；\n]{0,6}(?:原文|引文|引语)|(?:原文|引文|引语)[^。；\n]{0,8}(?:之外|以外|删去)|只转述|不做?引文/;

// Check 8: a page may not say it excludes a passage while printing that passage.
test('no sentence says the book leaves a passage out while printing that passage', t => {
  const pages = chapterPages();
  assert.ok(pages.length > 0, 'no chapter page was found, so nothing was checked — the page list must not go quietly empty');

  const offenders = [];
  let sentences = 0;
  let claiming = 0;
  let printing = 0;

  for (const file of pages) {
    const rel = path.relative(root, file);
    const html = proseOf(fs.readFileSync(file, 'utf8'));
    for (const sentence of sentencesOf(html)) {
      sentences++;
      if (!CLAIMS_EXCLUDED.test(sentence)) continue;
      claiming++;
      // The same test the rest of the file uses for "whose words are these": marked, verbatim, and long
      // enough that it is the received text rather than the book naming a word it is about.
      const quoted = markedSpans(sentence)
        .map(span => textOfSpan(sentence, span).replace(/\s+/g, ''))
        .filter(text => [...text].filter(ch => HAN.test(ch)).length >= 4 && isTongjianText(text));
      if (!quoted.length) continue;
      printing++;
      offenders.push(`${rel}: the sentence says this book leaves a passage out and prints 通鑑 in the same breath — 「${quoted[0].slice(0, 40)}」`);
    }
  }

  t.diagnostic(`exclusion claims: ${pages.length} chapter page(s), ${sentences} sentence(s) read, ${claiming} claiming the book leaves a `
    + `passage out, ${printing} of those printing a 通鑑 quotation of 4 or more Han characters in the same sentence`);
  assert.ok(sentences > 0, 'no sentence was read at all, so this run compared nothing');
  assert.ok(claiming > 0, 'no sentence claims the book leaves a passage out, so this check never met the shape it is about');
  assert.equal(offenders.length, 0,
    `${offenders.length} sentence(s) say this book leaves a passage out and print that passage. Say what the book does with it — name `
    + `the work and where the words are read — or quote nothing in that sentence. See docs/design/tongjian.md, "Where a quotation comes `
    + `from another work".\n      ${offenders.join('\n      ')}`);
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
