// What this file proves, and what it cannot.
//
// It proves that `tongjian/corpus.js` is complete and self-consistent (ids, 卷, sources,
// fetch date, non-empty text, no transcription debris), that every example carried by
// `tongjian/lexicon.js` and `tongjian/words.js` is a verbatim substring of ONE 句 of that
// corpus — an example may not join a 句 to its neighbour, because a joined pair exists
// nowhere in the book and is a composed sentence however verbatim its halves are — that
// every `at` names a 卷 the corpus covers, and that a chapter page's 原文 is the corpus
// entry it says it is quoting.
//
// What it cannot prove: that a gloss, a note or a translation is *right*. A quotation that
// is real can still be glossed wrongly, and this file reads no fetched dictionary. The
// corpus is three sources compared by hand, and the comparison is recorded in the entry's
// `note`; nothing here re-fetches them. It also cannot tell whether the corpus is the
// *best* text — only that it is the text the sources it names actually carry.
//
// Denominator: the corpus-side counts are asserted to be non-zero, so a run that found
// nothing fails instead of passing quietly. The page-side count is reported as a diagnostic
// because no chapter page exists on disk yet; when one lands, every `<ol class="zj-src">`
// on it is compared against the corpus entry its `data-corpus` names, and a 原文 block that
// declares no entry at all is a failure whether or not any comparison happened.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORPUS } from '../tongjian/corpus.js';
import { LEXICON } from '../tongjian/lexicon.js';
import { WORDS } from '../tongjian/words.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const TONGJIAN = path.join(root, 'tongjian');

/** One string per 句, entries separated by a newline: an example may not straddle a 句. */
const corpusText = CORPUS.map(e => e.text.join('\n')).join('\n');
/** The same text with each entry's 句 run together, for reporting how far a page's 原文 got. */
const corpusFlat = CORPUS.map(e => e.text.join('')).join('');

const HAN = /[\u3400-\u4dbf\u4e00-\u9fff]|[\u{20000}-\u{2a6df}]/u;
const PUNCTUATION = '、。：，？；！《》「」『』';
const LATIN = /[A-Za-z]/;
const ASCII_STOP = /[,.]/;
/** Transcription debris: a collation bracket, a stray ASCII bracket, or a wikitext marker. */
const DEBRIS = /[〔〕()<>{}[\]]|\{\{|\}\}|'''|&nbsp;|&#\d+;/;

/** The corpus text closest to a string that is not in it, so the failure shows the difference. */
function closest(text, needle) {
  let best = { score: 0, at: 0 };
  for (let i = 0; i < text.length; i++) {
    let n = 0;
    while (n < needle.length && text[i + n] === needle[n]) n++;
    if (n > best.score) best = { score: n, at: i };
  }
  const context = text.slice(Math.max(0, best.at - 12), best.at + needle.length + 12);
  let differsAt = 0;
  while (differsAt < needle.length && text[best.at + differsAt] === needle[differsAt]) differsAt++;
  const shown = differsAt < needle.length
    ? `first difference at character ${differsAt + 1}: example has 「${needle[differsAt]}」 (U+${needle.codePointAt(differsAt).toString(16).toUpperCase()}), corpus has 「${text[best.at + differsAt] ?? '(end)'}」 (U+${(text.codePointAt(best.at + differsAt) ?? 0).toString(16).toUpperCase()})`
    : 'the example ran past the end of the closest corpus text';
  return `longest match ${best.score}/${needle.length} characters; ${shown}\n      closest corpus text: 「${context}」`;
}

/** Every example in the data files, with the entry and use it belongs to. */
function allExamples() {
  const out = [];
  for (const [ch, e] of Object.entries(LEXICON)) {
    for (const u of e.uses || []) {
      for (const ex of u.examples || []) out.push({ where: `LEXICON['${ch}'] use ${u.id}`, gloss: u.gloss, ex, owner: u });
    }
  }
  for (const [w, e] of Object.entries(WORDS)) {
    for (const ex of e.examples || []) out.push({ where: `WORDS['${w}']`, gloss: e.gloss, ex, owner: e });
  }
  return out;
}

test('every corpus entry is complete, and the corpus declares what it covers', t => {
  const seen = new Set();
  const seenJuan = new Set();
  for (const e of CORPUS) {
    const where = `CORPUS entry ${e.id}`;
    assert.ok(typeof e.id === 'string' && e.id.length, `${where}: id is missing`);
    assert.ok(!seen.has(e.id), `${where}: id is used twice`);
    seen.add(e.id);
    assert.ok(typeof e.work === 'string' && e.work.length, `${where}: work is missing`);
    assert.ok(typeof e.juan === 'string' && e.juan.length, `${where}: juan is missing`);
    assert.ok(typeof e.section === 'string' && e.section.length, `${where}: section is missing`);
    assert.ok(typeof e.url === 'string' && /^https?:\/\/\S+$/.test(e.url), `${where}: url is missing or not a URL`);
    assert.ok(Array.isArray(e.verifiedAgainst) && e.verifiedAgainst.length > 0,
      `${where}: verifiedAgainst must name at least one more fetched source — an entry verified against nothing is the thing this field exists to prevent`);
    for (const u of e.verifiedAgainst) assert.ok(/^https?:\/\/\S+$/.test(u), `${where}: verifiedAgainst holds a non-URL: ${u}`);
    assert.ok(!e.verifiedAgainst.includes(e.url), `${where}: verifiedAgainst repeats url, so it verifies nothing`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(e.fetched), `${where}: fetched must be a YYYY-MM-DD date, got ${JSON.stringify(e.fetched)}`);
    assert.ok(typeof e.punctuation === 'string' && e.punctuation.length, `${where}: punctuation must be a non-empty string naming the collation's punctuation`);
    assert.ok(Array.isArray(e.text) && e.text.length > 0, `${where}: text must be a non-empty array of 句`);
    for (const s of e.text) {
      assert.ok(typeof s === 'string' && s.length, `${where}: a 句 is empty`);
      assert.ok(!DEBRIS.test(s), `${where}: text carries transcription debris — a collation mark, an ASCII bracket or a wikitext marker survived: 「${s}」`);
      assert.ok(!LATIN.test(s), `${where}: text contains a Latin letter: 「${s}」`);
      for (const ch of s) {
        assert.ok(HAN.test(ch) || PUNCTUATION.includes(ch),
          `${where}: character 「${ch}」 (U+${ch.codePointAt(0).toString(16).toUpperCase()}) is neither Han nor one of the corpus's punctuation marks ${PUNCTUATION}`);
      }
    }
    assert.ok(typeof e.note === 'string', `${where}: note must be present (empty string when there is nothing to record)`);
    seenJuan.add(e.juan.split(/\s+/).pop());
  }
  t.diagnostic(`corpus: ${CORPUS.length} entries, ${CORPUS.reduce((n, e) => n + e.text.length, 0)} 句, ${[...corpusFlat].length} characters, 卷 covered: ${[...seenJuan].join(' ')}`);
  assert.ok(CORPUS.length > 0, 'checked zero corpus entries');
  assert.ok(seenJuan.size > 0, 'the corpus covers no 卷');
});

test('every example is a verbatim substring of the corpus', t => {
  const examples = allExamples();
  const coveredJuan = new Set(CORPUS.map(e => e.juan.split(/\s+/).pop()));
  const sections = new Set(CORPUS.map(e => e.section));
  let atOdd = 0;
  for (const { where, ex } of examples) {
    assert.ok(ex && typeof ex.text === 'string' && ex.text.length,
      `${where}: an example has no text — an example is { text, at } and both are required`);
    assert.ok(corpusText.includes(ex.text),
      `${where}: this example is NOT in the corpus, so it is a composed sentence and not a quotation:\n      「${ex.text}」\n      ${closest(corpusText, ex.text)}`);
    assert.ok(!LATIN.test(ex.text), `${where}: example text contains a Latin letter: 「${ex.text}」`);
    assert.ok(!ASCII_STOP.test(ex.text),
      `${where}: example text contains an ASCII comma or full stop, which in a classical Chinese quotation is a transcription accident: 「${ex.text}」`);
    assert.ok(typeof ex.at === 'string' && ex.at.length, `${where}: example has no \`at\` naming its 卷: 「${ex.text}」`);
    const named = ex.at === undefined ? '' : ex.at;
    const resolves = coveredJuan.has(named) || sections.has(named) || CORPUS.some(e => e.id === named);
    assert.ok(resolves,
      `${where}: \`at: '${named}'\` names neither a 卷 the corpus covers (${[...coveredJuan].join(' ')}), a section it holds, nor an entry id: 「${ex.text}」`);
    if (!coveredJuan.has(named)) atOdd++;
  }
  t.diagnostic(`examples: ${examples.length} checked, ${atOdd} naming something finer than a 卷`);
  assert.ok(examples.length > 0, 'checked zero examples — a run that read no quotation has checked nothing');
});

test('every example-bearing use and word entry declares examples as an array, and explains an empty one', t => {
  let holders = 0, empties = 0;
  const checkHolder = (where, holder, note) => {
    holders++;
    assert.ok(Array.isArray(holder.examples), `${where}: examples must be present as an array (an empty array is honest; a missing field is not)`);
    if (holder.examples.length === 0) {
      empties++;
      assert.ok(typeof note === 'string' && note.trim().length > 0,
        `${where}: declares no example, so its note must say why — an unexplained gap reads as coverage`);
    }
  };
  for (const [ch, e] of Object.entries(LEXICON)) for (const u of e.uses || []) checkHolder(`LEXICON['${ch}'] use ${u.id}`, u, u.note);
  for (const [w, e] of Object.entries(WORDS)) checkHolder(`WORDS['${w}']`, e, e.note);
  t.diagnostic(`explained examples: ${holders} uses/words checked, ${empties} with no example and a stated reason`);
  assert.ok(holders > 0, 'checked zero uses — nothing was verified');
});

test('every gloss is a non-empty string in Chinese', t => {
  let glosses = 0;
  const check = (where, gloss) => {
    glosses++;
    assert.ok(typeof gloss === 'string' && gloss.trim().length > 0, `${where}: gloss is empty — the gloss is the one field a card cannot do without`);
    assert.ok(!LATIN.test(gloss), `${where}: gloss contains a Latin letter: 「${gloss}」`);
    assert.ok(!DEBRIS.test(gloss), `${where}: gloss carries a wikitext or collation marker: 「${gloss}」`);
    assert.ok([...gloss].some(c => HAN.test(c)), `${where}: gloss holds no Han character: 「${gloss}」`);
  };
  for (const [ch, e] of Object.entries(LEXICON)) for (const u of e.uses || []) check(`LEXICON['${ch}'] use ${u.id}`, u.gloss);
  for (const [w, e] of Object.entries(WORDS)) check(`WORDS['${w}']`, e.gloss);
  t.diagnostic(`glosses: ${glosses} checked`);
  assert.ok(glosses > 0, 'checked zero glosses');
});

test('no example is the whole 原文 of a chapter the reader could be on', t => {
  // A card shows a 通鑑用例 and then the chapter's own uses under 在這一章. When a chapter's
  // 原文 is a single 句, an example drawn from that sentence is the same sentence printed
  // twice: the reader who clicked 為 in 「初命晉大夫魏斯…」 is shown 「初命晉大夫魏斯…」 as
  // the example of how 通鑑 uses 為. Design rule 5 — an example comes from a different
  // passage than the one the reader is on — is what this holds. It is decidable exactly here,
  // for a one-句 passage; for a long passage the shared lexicon cannot satisfy it for every
  // character, which tongjian/README.md states as a known limit rather than hiding it.
  const chapters = fs.existsSync(TONGJIAN)
    ? fs.readdirSync(TONGJIAN, { withFileTypes: true }).filter(d => d.isDirectory() && /^ch\d/.test(d.name)).map(d => d.name).sort()
    : [];
  const single = [];
  for (const dir of chapters) {
    const file = path.join(TONGJIAN, dir, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const sentences = [];
    for (const list of html.matchAll(/<ol\b[^>]*class="[^"]*zj-src[^"]*"[^>]*>[\s\S]*?<\/ol>/g)) {
      for (const li of list[0].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
        const text = li[1].replace(/<[^>]+>/g, '').replace(/\s+/g, '').trim();
        if (text) sentences.push(text);
      }
    }
    if (sentences.length === 1) single.push({ dir, sentence: sentences[0] });
  }
  const examples = allExamples();
  const offenders = [];
  for (const { where, ex } of examples) {
    for (const { dir, sentence } of single) {
      if (sentence.includes(ex.text)) offenders.push(`${where}: 「${ex.text}」 is the whole of ${dir}'s 原文, so the card would print the sentence the reader is looking at`);
    }
  }
  t.diagnostic(`rule 5: ${examples.length} examples checked against ${single.length} chapter(s) whose 原文 is a single 句${single.length ? ' (' + single.map(s => s.dir).join(' ') + ')' : ''}`);
  assert.ok(chapters.length > 0, 'no chapter page exists, so this check read nothing');
  assert.ok(examples.length > 0, 'checked zero examples');
  assert.equal(offenders.length, 0, `${offenders.length} example(s) quote the reader's own sentence:\n      ${offenders.join('\n      ')}`);
});

test('a chapter page\'s 原文 is the corpus entry it names', t => {
  const chapters = fs.existsSync(TONGJIAN)
    ? fs.readdirSync(TONGJIAN, { withFileTypes: true }).filter(d => d.isDirectory() && /^ch\d/.test(d.name)).map(d => d.name).sort()
    : [];
  const pages = [];
  for (const dir of chapters) {
    const file = path.join(TONGJIAN, dir, 'index.html');
    if (fs.existsSync(file)) pages.push({ dir, file });
  }
  const byId = new Map(CORPUS.map(e => [e.id, e]));
  let compared = 0, blocks = 0;
  for (const { dir, file } of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const sourceSections = [...html.matchAll(/<section id="source"[\s\S]*?<\/section>/g)];
    for (const section of sourceSections) {
      const lists = [...section[0].matchAll(/<ol\b[^>]*>[\s\S]*?<\/ol>/g)];
      assert.ok(lists.length > 0, `${dir}: the #source section holds no <ol class="zj-src">, so it cannot be compared against the corpus`);
      for (const list of lists) {
        blocks++;
        const id = /\bdata-corpus="([^"]+)"/.exec(list[0])?.[1];
        assert.ok(id,
          `${dir}: a 原文 block quotes 通鑑 without saying which corpus entry it is — add data-corpus="<entry id>". Nothing outside the corpus may be printed as 通鑑.`);
        const entry = byId.get(id);
        assert.ok(entry, `${dir}: data-corpus="${id}" names no corpus entry`);
        // **The 原文 is read from the source cell, not from the whole `<li>`.** A pair now holds the 原文
        // and its 譯文 inside one `<li class="zj-pair">`, so reading the `<li>` would compare the book's
        // translation against the received text and fail on a page that is exactly right — which is what
        // happened, on all three chapters, while the pairing was being built.
        //
        // The cell that carries the original is everything up to the 譯文 cell's opening tag. A non-greedy
        // match for `</span>` will NOT do: the source cell holds `<span class="zj-ju">。</span>` of its own
        // for the cinnabar punctuation, so it would stop at the first full stop and truncate the sentence.
        // Both readings were tried against all three pages before this one was taken.
        const items = [...list[0].matchAll(/<li class="zj-pair">([\s\S]*?)<span class="zj-pair__tr"/g)]
          .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (s, n) => String.fromCodePoint(+n)).replace(/\s+/g, '').trim());
        assert.ok(items.length > 0,
          `${dir}: the 原文 block for "${id}" holds no <li class="zj-pair">, so nothing was read from it; the pairing markup changed shape and this reading went with it`);
        const pageText = items.join('\n');
        const entryText = entry.text.join('\n');
        assert.equal(pageText, entryText,
          `${dir}: the printed 原文 differs from CORPUS['${id}']\n      page  : 「${pageText}」\n      corpus: 「${entryText}」\n      ${closest(corpusFlat, pageText.replace(/\n/g, ''))}\n      If the page is right, the corpus is wrong — re-fetch the source before changing either.`);
        compared++;
      }
    }
  }
  t.diagnostic(`chapter pages discovered: ${pages.length}; 原文 blocks compared against the corpus: ${compared} (of ${blocks} blocks seen)`);
  if (pages.length === 0) {
    t.diagnostic('bound: no tongjian/chNN-*/index.html exists yet, so this check compared nothing. It becomes live the moment one lands, and a page whose #source quotes without data-corpus fails above.');
  }
  assert.ok(blocks === compared, 'a 原文 block was seen but not compared');
});
