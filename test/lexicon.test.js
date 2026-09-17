// What this file proves, and what it cannot.
//
// It proves that `tongjian/lexicon.js` covers every character of the corpus and that every
// entry is complete enough for a card to render: a pinyin carrying a tone, a part of speech,
// at least one use with an id, a gloss and a note, and an `examples` array that is present
// whether or not it holds anything. It proves the same for `tongjian/words.js`, that a word's
// card-facing gloss and its first use cannot drift apart, and that the 多音字 the corpus
// genuinely reads two ways declare both readings.
//
// It also proves what the CARD SHOWS, by running the real builder under a DOM stub: that the head
// prints the reading of the sense below it and not the entry's default, that it prints that sense's
// own part of speech and not the entry's, that an occurrence of a 多音字 takes the reading the
// entry's own example pins for that very 句, that an occurrence may declare its own use when no
// example can, that a character with several senses and nothing bound to the occurrence is offered
// no sense at all — and no part of speech either — and that the element the reader pressed is what
// tells the card which occurrence it is for. That half exists because the check it replaced read the
// data and not the render: it asserted a bound use existed and declared a reading, while the card
// went on printing `entry.pinyin` over it, so 「使 shǐ」 sat above a gloss of 「出使。」 whose own
// note says 「读 shì」 (out/verify/VERIFICATION.md §1).
//
// The part-of-speech half has the same shape and the same cause. `pos` is one value per entry, so a
// card showing a use of another class printed the entry's: 相 shown with 「辅佐之臣；国相」 labelled
// 副 (the entry's 副 belongs to 互相), 難 with 灾难 labelled 形, 將 with 率领 labelled 副, 文 with
// 文饰 labelled 专名. A use therefore declares `pos` where its own sense needs one, and the card
// prints it; the entry's is the fallback for the uses that agree with it and for `words.js`.
//
// Its gate is deliberately NOT the renderer reading its own data back: the sweep is anchored on the
// classes the GLOSSES name in their own words — 「名，在下位的人；臣下」, 「名词用法：强者；强敌」,
// 「终于；到底（副词）」 — which is prose written by the drafters, not a field this round added. A use
// whose gloss or note names a class must either agree with its entry's or declare that class, and the
// card must print it. Bound, stated rather than hidden: only the uses whose prose names a class are
// checked this way (44 name one in the gloss's first two characters, 15 more in words), so a use
// whose class is wrong but unnamed is still invisible here; the hand-checked rows below are the rest
// of the evidence, and they are a table, not a sweep.
//
// What it cannot prove: that a gloss is *right*, or that a sense list is complete. A wrong gloss is
// a well-formed entry, and this file would pass it. `test/corpus.test.js` proves the quotations are
// real; neither file reads a dictionary. The glosses were drafted by a model and checked against the
// passage and the fetched 胡三省 音注 — see tongjian/README.md for what that check covered and where
// it stopped.
//
// Denominator: the coverage check is keyed on the corpus characters, and it asserts that it
// found some and compared all of them, so an empty lexicon fails instead of passing quietly.
// The 多音字 table asserts that every row was checked, and each rendered-card check prints how many
// occurrences it read, because `0 checked` is a run that proved nothing.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CORPUS } from '../tongjian/corpus.js';
import { LEXICON } from '../tongjian/lexicon.js';
import { WORDS } from '../tongjian/words.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const TONGJIAN = path.join(root, 'tongjian');

const HAN = /[\u3400-\u4dbf\u4e00-\u9fff]|[\u{20000}-\u{2a6df}]/u;
const PUNCTUATION = '、。：，？；！《》「」『』';
const TONE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]|\d/;
const LATIN = /[A-Za-z]/;
const POS = ['名', '动', '形', '副', '介', '连', '助', '代', '数', '量', '语气', '专名'];

const corpusSentences = CORPUS.flatMap(e => e.text);
const corpusText = corpusSentences.join('\n');

/** Every character of the 原文 that is not punctuation: the set the pages wrap in <tb-char>. */
const corpusChars = new Map();
for (const sentence of corpusSentences) {
  for (const ch of sentence) {
    if (!HAN.test(ch)) {
      assert.ok(PUNCTUATION.includes(ch), `corpus holds a character that is neither Han nor a known punctuation mark: 「${ch}」`);
      continue;
    }
    if (!corpusChars.has(ch)) corpusChars.set(ch, []);
    if (!corpusChars.get(ch).includes(sentence)) corpusChars.get(ch).push(sentence);
  }
}

test('every character of the 原文 has a lexicon entry', t => {
  const missing = [];
  let covered = 0;
  for (const [ch, sentences] of corpusChars) {
    if (LEXICON[ch]) { covered++; continue; }
    missing.push(`「${ch}」 (U+${ch.codePointAt(0).toString(16).toUpperCase()}) in 「${sentences[0].slice(0, 30)}${sentences[0].length > 30 ? '…' : ''}」`);
  }
  t.diagnostic(`coverage: ${covered} of ${corpusChars.size} corpus characters have a LEXICON entry; LEXICON holds ${Object.keys(LEXICON).length} entries`);
  assert.ok(corpusChars.size > 0, 'the corpus has no characters — nothing was checked');
  assert.equal(missing.length, 0, `${missing.length} character(s) of the 原文 have no entry, so a reader clicking them gets nothing:\n      ${missing.join('\n      ')}`);
  assert.equal(covered, corpusChars.size, 'coverage did not reach every corpus character');
});

test('every lexicon entry is complete', t => {
  let entries = 0, uses = 0, examples = 0, readings = 0;
  for (const [ch, e] of Object.entries(LEXICON)) {
    const where = `LEXICON['${ch}']`;
    entries++;
    assert.equal([...ch].length, 1, `${where}: a 字 entry must be keyed by exactly one character`);
    assert.ok(HAN.test(ch), `${where}: the key is not a Han character`);
    assert.ok(typeof e.pinyin === 'string' && e.pinyin.trim(), `${where}: pinyin is missing`);
    assert.ok(TONE.test(e.pinyin), `${where}: pinyin carries no tone mark or tone number: ${JSON.stringify(e.pinyin)}`);
    assert.ok(!LATIN.test(e.pinyin.replace(/[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/gi, '')), `${where}: pinyin holds stray letters: ${JSON.stringify(e.pinyin)}`);
    assert.ok(typeof e.pos === 'string' && e.pos.trim(), `${where}: pos is missing`);
    assert.ok(POS.includes(e.pos), `${where}: pos 「${e.pos}」 is not one of ${POS.join(' ')}`);
    if (e.readings !== undefined) {
      readings++;
      assert.ok(Array.isArray(e.readings) && e.readings.length >= 2, `${where}: readings must be an array of two or more readings`);
      for (const r of e.readings) assert.ok(TONE.test(String(r)), `${where}: reading 「${r}」 carries no tone`);
    }
    assert.ok(Array.isArray(e.uses) && e.uses.length > 0, `${where}: uses must be a non-empty array — an entry with no sense is not an entry`);
    const ids = new Set();
    for (const u of e.uses) {
      uses++;
      assert.ok(typeof u.id === 'string' && u.id.trim(), `${where}: a use has no id`);
      assert.ok(!ids.has(u.id), `${where}: use id 「${u.id}」 is used twice`);
      ids.add(u.id);
      assert.ok(typeof u.gloss === 'string' && u.gloss.trim(), `${where} use ${u.id}: gloss is empty`);
      assert.ok(typeof u.note === 'string' && u.note.trim(), `${where} use ${u.id}: note is empty`);
      assert.ok(Array.isArray(u.examples), `${where} use ${u.id}: examples must be present as an array`);
      examples += u.examples.length;
    }
  }
  t.diagnostic(`lexicon: ${entries} entries, ${uses} uses, ${examples} examples, ${readings} entries declaring readings`);
  assert.ok(entries > 0, 'LEXICON is empty — checked zero entries');
  assert.ok(uses > 0, 'LEXICON declares zero uses');
});

test('a 多音字 the corpus reads two ways declares both readings', t => {
  // Each row is a character the corpus uses with two readings, with the two quotations that
  // force them. The 反切 are 胡三省's own, fetched from 資治通鑒 (胡三省音注)/卷001.
  const table = [
    { ch: '為', readings: ['wéi', 'wèi'], a: '以瑤為後', b: '豫讓欲為之報仇', why: 'wéi 做／作為；wèi 替、給' },
    { ch: '分', readings: ['fēn', 'fèn'], a: '三家分智氏之田', b: '禮莫大於分', why: '胡注「分，扶問翻」' },
    { ch: '勝', readings: ['shèng', 'shēng'], a: '約勝趙而三分其地', b: '力不能勝', why: '胡注「勝，音升」' },
    { ch: '見', readings: ['jiàn', 'xiàn'], a: '臣見其視臣端而趨疾', b: '不見是圖', why: '胡注「見，賢遍翻，發見也」' },
    { ch: '相', readings: ['xiāng', 'xiàng'], a: '以相親之兵待輕敵之人', b: '況君相乎', why: '胡注「相，息亮翻」' },
    { ch: '惡', readings: ['è', 'wù'], a: '小人挾才以為惡', b: '亦叔父之所惡也', why: '胡注「惡，烏路翻」' },
  ];
  let checked = 0;
  for (const row of table) {
    checked++;
    assert.ok(corpusText.includes(row.a), `the evidence for ${row.ch} is not in the corpus: 「${row.a}」`);
    assert.ok(corpusText.includes(row.b), `the evidence for ${row.ch} is not in the corpus: 「${row.b}」`);
    const e = LEXICON[row.ch];
    assert.ok(e, `LEXICON['${row.ch}'] is missing, so its two readings cannot be declared`);
    assert.ok(Array.isArray(e.readings), `LEXICON['${row.ch}'] is read two ways in this volume (${row.why}) but declares no readings — one pinyin on a 多音字 is a wrong reading for one of its uses`);
    for (const r of row.readings) {
      assert.ok(e.readings.includes(r), `LEXICON['${row.ch}'] declares readings ${JSON.stringify(e.readings)}, missing 「${r}」`);
    }
  }
  t.diagnostic(`多音字: ${checked} characters checked against quotations that force both readings`);
  assert.ok(checked > 0, 'the 多音字 table is empty — nothing was checked');
});

test('a 多音字 says, per sense, which reading the card must show', t => {
  // The card shows one pinyin and one sense. `pinyin` is the entry's default and `uses[0]` is
  // the fallback when a chapter binds nothing, so a 多音字 whose uses span two readings cannot
  // be expressed by the entry alone — the reader clicking 夫 in 「夫才與德異」 was shown the
  // 大夫 sense of fū while the page's own table printed fú. Every use of a character this
  // volume reads two ways therefore declares its own `reading`, and no declared reading may be
  // one no use takes.
  let entries = 0, uses = 0;
  for (const [ch, e] of Object.entries(LEXICON)) {
    if (!Array.isArray(e.readings) || e.readings.length < 2) continue;
    entries++;
    const claimed = new Set();
    for (const u of e.uses) {
      uses++;
      assert.ok(typeof u.reading === 'string' && u.reading.length,
        `LEXICON['${ch}'] use ${u.id}: the entry is read two ways (${e.readings.join(' ')}), so the use must declare which reading the card shows — pinyin 「${e.pinyin}」 is only the default`);
      assert.ok(TONE.test(u.reading), `LEXICON['${ch}'] use ${u.id}: reading 「${u.reading}」 carries no tone`);
      assert.ok(e.readings.includes(u.reading),
        `LEXICON['${ch}'] use ${u.id}: reading 「${u.reading}」 is not among the entry's readings (${e.readings.join(' ')})`);
      claimed.add(u.reading);
    }
    for (const r of e.readings) {
      assert.ok(claimed.has(r),
        `LEXICON['${ch}'] declares the reading 「${r}」 and no use takes it — a reading the card can never show is a claim the data does not support`);
    }
  }
  t.diagnostic(`per-use readings: ${entries} 多音字 entries, ${uses} uses declaring the reading they take`);
  assert.ok(entries > 0, 'no entry declares two readings, so this check read nothing');
});

// ── What the card shows, executed ────────────────────────────────────────────────────────────────
//
// Everything above reads the data. This half runs the real builder — `registerLexicon` and
// `textbook.lexicon.card`, the two calls `src/components/term.js` makes — under a DOM stub, and asserts
// on the HTML a reader sees. It is here because the gate it replaces could not see the render: the
// check asserted that a bound use EXISTS and declares a reading, and the card went on printing
// `entry.pinyin` over it, so 「使 shǐ」 sat above a gloss of 「出使。」 whose own note says 「读 shì」
// (out/verify/VERIFICATION.md §1). A gate that reads the data cannot see what the data is rendered as.
//
// Bound, stated because it is narrower than it looks. The occurrence sweep can only check the
// occurrences the entry's own examples pin — an example IS the attestation, and where the data has none
// for a 句 the card falls back to the sense `chars.js` binds for the chapter, which no check here can
// call wrong. Every test prints how many occurrences it read, so a sweep that compared nothing fails
// rather than passes. A `0` denominator is a run that checked nothing.

let harness = null;

/** The DOM stub, the real builder, and the click listener `registerLexicon` installs. */
function cardHarness() {
  if (!harness) {
    harness = (async () => {
      globalThis.location = { search: '', pathname: '/tongjian/ch02-zhi-bo-zhi-wang/', href: 'http://localhost/tongjian/ch02-zhi-bo-zhi-wang/' };
      globalThis.window = globalThis;
      globalThis.HTMLElement = class {};
      globalThis.customElements = { define: () => {}, get: () => undefined, whenDefined: () => Promise.resolve() };
      globalThis.matchMedia = () => ({ matches: false, addEventListener: () => {} });
      const clicks = [];
      globalThis.document = {
        documentElement: { lang: 'zh-Hans' },
        addEventListener: (type, fn, capture) => clicks.push({ type, fn, capture }),
        querySelector: () => null,
        querySelectorAll: () => [],
      };
      const { registerLexicon } = await import('../tongjian/data/card.js');
      const { textbook } = await import('../src/shell.js');
      return { registerLexicon, textbook, clicks };
    })();
  }
  return harness;
}

const CHARS_CACHE = new Map();
async function chapterChars(dir) {
  if (!CHARS_CACHE.has(dir)) {
    const file = path.join(TONGJIAN, dir, 'chars.js');
    const mod = fs.existsSync(file) ? await import(pathToFileURL(file).href) : {};
    CHARS_CACHE.set(dir, mod.CHARS || {});
  }
  return CHARS_CACHE.get(dir);
}

/** Register one chapter's lexicon and hand back the page, its 字表, and the builder. */
async function chapterCard(dir) {
  const { registerLexicon, textbook, clicks } = await cardHarness();
  const CHARS = await chapterChars(dir);
  const page = path.join(TONGJIAN, dir, 'index.html');
  const html = fs.readFileSync(page, 'utf8');
  registerLexicon({ lexicon: LEXICON, words: WORDS, chars: CHARS, chapter: `tongjian/${dir}` });
  return { CHARS, html, clicks, card: (key, kind, occurrence) => textbook.lexicon.card(key, kind, occurrence) };
}

/** Every bare <tb-char> a page prints in its 原文, with the 句 it stands in and its offset there. */
function pageOccurrences(html) {
  const out = [];
  for (const cell of html.matchAll(/<span class="zj-pair__src"[^>]*>([\s\S]*?)<span class="zj-pair__tr"/g)) {
    let sentence = '';
    const found = [];
    for (const tok of cell[1].matchAll(/<tb-char\b[^>]*>([^<]+)<\/tb-char>|<[^>]*>|[^<]+/g)) {
      if (tok[1] !== undefined) {
        // An occurrence may name its own use — the one thing the chapter's 字表, which holds one use
        // per character, cannot say. Read off the page's markup, so the tests below resolve the same
        // occurrence the browser does.
        const use = /\buse="([^"]*)"/.exec(tok[0])?.[1] ?? null;
        found.push({ key: tok[1], at: sentence.length, use });
        sentence += tok[1];
      } else if (!tok[0].startsWith('<')) sentence += tok[0];
    }
    for (const f of found) out.push({ ...f, sentence });
  }
  return out;
}

/**
 * The <tb-char> a reader pressed: an element inside a 原文 cell, which is what `term.js` hands the card
 * by way of the page. Built here rather than in a browser because the resolution is arithmetic on the
 * cell's text, and the frames `tools/zj-look.js --open-card` writes are what check the real DOM.
 */
function pressed(sentence, at, use = null) {
  const el = { textContent: sentence[at], closest: () => cell, getAttribute: (name) => (name === 'use' ? use : null) };
  const cell = {
    textContent: sentence,
    childNodes: [{ textContent: sentence.slice(0, at) }, el, { textContent: sentence.slice(at + 1) }],
  };
  return el;
}

/** A card built for no occurrence at all: the 字詞 list's own glyph, which has no 句. */
const NO_OCCURRENCE = { closest: () => null };

/** Every <tb-term> a page prints in its 原文: the 詞 the reader can press, with its key and its 句. */
function pageTerms(html) {
  const out = [];
  for (const cell of html.matchAll(/<span class="zj-pair__src"[^>]*>([\s\S]*?)<span class="zj-pair__tr"/g)) {
    let sentence = '';
    const found = [];
    for (const tok of cell[1].matchAll(/<tb-(term|char)\b([^>]*)>([^<]*)<\/tb-\1>|<[^>]*>|[^<]+/g)) {
      if (tok[3] !== undefined) {
        if (tok[1] === 'term') {
          found.push({
            key: /\bword="([^"]*)"/.exec(tok[2])?.[1] ?? tok[3],
            at: sentence.length,
            text: tok[3],
            ref: /\bref="([^"]*)"/.exec(tok[2])?.[1] ?? null,
            use: /\buse="([^"]*)"/.exec(tok[2])?.[1] ?? null,
          });
        }
        sentence += tok[3];
      } else if (!tok[0].startsWith('<')) sentence += tok[0];
    }
    for (const f of found) out.push({ ...f, sentence });
  }
  return out;
}

const cardField = (html, cls) => {
  const m = new RegExp(`<span class="zj-card__${cls}"[^>]*>([\\s\\S]*?)</span>`).exec(html);
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null;
};
const cardGlyph = (html) => /<b class="zj-card__glyph">([^<]*)<\/b>/.exec(html)?.[1] ?? null;
const cardPinyin = (html) => /<span class="zj-card__pinyin">([^<]*)<\/span>/.exec(html)?.[1] ?? null;
const cardPos = (html) => /<span class="zj-card__pos">([^<]*)<\/span>/.exec(html)?.[1] ?? null;
const cardGloss = (html) => /<span class="zj-card__gloss">([^<]*)<\/span>/.exec(html)?.[1] ?? null;
const cardSenses = (html) => [...html.matchAll(/<span class="zj-card__ex-text">([^<]*)<\/span>/g)].map((m) => m[1]);

const usesOf = (key) => (LEXICON[key] || WORDS[key])?.uses ?? [];

/**
 * The classes a use names in its own prose, or an empty set.
 *
 * This is the anchor the part-of-speech gate hangs on, and it is deliberately not the `pos` field: a
 * check that compared `pos` against `pos` would prove only that the data agrees with itself. Two
 * shapes are read, both of them the drafters' own words:
 *
 *   - the gloss OPENS with the class, as 「名，在下位的人；臣下」 or 「动、形，混乱；溃乱」 — 44 uses;
 *   - the gloss or the note names it in words — 「名词用法：强者；强敌」, 「（副词）」,
 *     「名词活用为动词」 — 16 more.
 *
 * A NEGATED mention is not a claim: 能's note reads 「本卷无「能力」的名词用法。」, which names a class
 * only to deny that this volume uses it. Skipping it is the whole reason that guard is here, and it is
 * the one false positive the extractor produced over the 924 uses.
 */
const NAMED_CLASS = [
  [/(名词用法|名词性结构|（名词）|名词[：:])/, '名'],
  [/(形容词用法|（形容词）|形容词[：:])/, '形'],
  [/(副词用法|（副词）|副词[：:])/, '副'],
  // 「名词活用为动词」 names the class the character TAKES, which is the verb, not the noun it is
  // borrowed from: 肘 「用胳膊肘碰」 and 翼 「从两侧夹击」 are both 动 in their uses.
  [/名词活用为动词/, '动'],
];
function namedClass(gloss, note) {
  const out = new Set();
  const opening = new RegExp(`^(${POS.join('|')})(?:、(${POS.join('|')}))?[，,]`).exec(gloss ?? '');
  if (opening) for (const c of [opening[1], opening[2]]) if (c) out.add(c);
  for (const [re, cls] of NAMED_CLASS) {
    for (const text of [gloss ?? '', note ?? '']) {
      const m = re.exec(text);
      // 「本卷无「能力」的名词用法」 denies the use, and it says so nine characters before the phrase
      // the pattern matches; the twelve before it are the window that tells a claim from a denial.
      if (m && !/[无未非]/.test(text.slice(Math.max(0, m.index - 12), m.index))) out.add(cls);
    }
  }
  return out;
}

/** Every lexicon use whose own prose names the class it takes: the gate's denominator and its rows. */
function usesNamingAClass() {
  const rows = [];
  for (const [key, entry] of Object.entries(LEXICON)) {
    for (const use of entry.uses ?? []) {
      const named = namedClass(use.gloss, use.note);
      if (named.size) rows.push({ key, entry, use, named: [...named] });
    }
  }
  return rows;
}

/**
 * The bare <tb-char> the page prints for `key` inside `fragment`, at its own offset in the 句.
 *
 * Found in the page's own markup rather than computed from the lexicon, so a row can only pass if the
 * page really wraps that character at that place: the reader can click it, and its offset is the
 * occurrence the card is built for.
 */
function occurrenceOf(page, key, fragment) {
  const at = (sentence) => sentence.indexOf(fragment) + fragment.indexOf(key);
  return pageOccurrences(page).find((o) => o.key === key && o.sentence.includes(fragment) && o.at === at(o.sentence)) ?? null;
}
/** The use an entry's own example pins for the character at `at` in `sentence`, or null. */
function pinnedUse(key, sentence, at) {
  const hits = [];
  for (const u of usesOf(key)) {
    for (const ex of u.examples ?? []) {
      if (!ex.text) continue;
      const p = sentence.indexOf(ex.text);
      if (p < 0 || at < p || at >= p + ex.text.length) continue;
      if (ex.text.split(key).length - 1 !== 1) continue;
      hits.push(u);
      break;
    }
  }
  const readings = new Set(hits.map((u) => u.reading ?? ''));
  return hits.length && readings.size === 1 ? hits[0] : null;
}

async function chapterPages() {
  const dirs = fs.existsSync(TONGJIAN)
    ? fs.readdirSync(TONGJIAN, { withFileTypes: true }).filter((d) => d.isDirectory() && /^ch\d/.test(d.name)).map((d) => d.name).sort()
    : [];
  return dirs.filter((dir) => fs.existsSync(path.join(TONGJIAN, dir, 'index.html')));
}

test('the card head prints the reading of the use it is showing, not the entry default', async t => {
  // The eight the verifier executed through this same builder (out/verify/VERIFICATION.md §1). Before
  // the fix each of these heads printed `entry.pinyin` while the gloss and note below it were the bound
  // use's — 「使 shǐ」 over 「出使。」, whose own note says 「读 shì」.
  const rows = [
    ['ch02-zhi-bo-zhi-wang', '使', 'shǐ'], ['ch02-zhi-bo-zhi-wang', '難', 'nàn'],
    ['ch02-zhi-bo-zhi-wang', '長', 'zhǎng'], ['ch02-zhi-bo-zhi-wang', '識', 'zhì'],
    ['ch02-zhi-bo-zhi-wang', '夫', 'fú'],
    ['ch03-cai-de-lun', '分', 'fèn'], ['ch03-cai-de-lun', '先', 'xiàn'],
    // Two of the verifier's eight rows no longer differ from the entry's default, because the chapter's
    // binding was moved to the reading its own text takes most often: 相 -> 互相 xiāng, 使 -> 派遣 shǐ
    // (see the notes in ch02/chars.js). They are here because they are the rows the verifier executed.
    ['ch02-zhi-bo-zhi-wang', '相', 'xiāng'],
  ];
  let checked = 0;
  let distinguishable = 0;
  for (const [dir, key, expected] of rows) {
    const { card } = await chapterCard(dir);
    const html = card(key, 'char', NO_OCCURRENCE).html;
    checked++;
    if (expected !== LEXICON[key].pinyin) distinguishable++;
    assert.equal(cardGlyph(html), key, `${dir}: the card for 「${key}」 does not open on the character asked for`);
    assert.equal(cardPinyin(html), expected,
      `${dir}: the card head for 「${key}」 reads 「${cardPinyin(html)}」; the sense it shows is ${JSON.stringify(cardGloss(html))}, which reads ${expected}`);
    assert.equal(cardField(html, 'readings'), `又读 ${(LEXICON[key].readings ?? []).filter((r) => r !== expected).join('、')}`,
      `${dir}: 「${key}」 prints the wrong 又读 row beside a head of 「${expected}」`);
  }
  t.diagnostic(`headline readings: ${rows.length} card(s) the verifier executed, rendered and read back; ${distinguishable} of them read something other than the entry's own pinyin`);
  assert.equal(checked, rows.length, 'a row was skipped');
  assert.ok(distinguishable > 0,
    'every row in this table expects the entry\'s own pinyin, so reverting the renderer would leave it green — the table cannot see the defect it was written for');

  // The rule itself, over every binding on every page: whatever sense the card shows, the head is that
  // sense's own reading. Read from chars.js and lexicon.js, compared against the rendered HTML, so the
  // two sides cannot agree by construction.
  let bindings = 0;
  for (const dir of await chapterPages()) {
    const { CHARS, card } = await chapterCard(dir);
    for (const [key, binding] of Object.entries(CHARS)) {
      if (!binding.use) continue;
      const entry = LEXICON[key] || WORDS[key];
      const use = entry && (entry.uses ?? []).find((u) => u.id === binding.use);
      assert.ok(use, `${dir}: chars.js binds ${key} -> ${binding.use}, which no entry carries`);
      if (!use.reading) continue;
      bindings++;
      const html = card(key, 'char', NO_OCCURRENCE).html;
      assert.equal(cardPinyin(html), use.reading,
        `${dir}: chars.js binds ${key} -> ${use.id} (${use.reading}), and the card head reads 「${cardPinyin(html)}」`);
    }
  }
  t.diagnostic(`headline readings: ${bindings} chapter binding(s) whose use declares a reading, checked against the rendered head`);
  assert.ok(bindings > 0, 'no chapter binds a use that declares a reading, so the rule above was never exercised');
});

test('the card prints the part of speech of the use it is showing, not the entry\'s', async t => {
  // The defect, as the frames show it (out/cardclass/frames/): 相 shown with 「辅佐之臣；国相」 labelled
  // 副, 難 with 灾难 labelled 形, 將 with 率领 labelled 副, 文 with 文饰 labelled 专名. Each head printed
  // `entry.pos`, and the entry's class belongs to the sense the card is NOT showing — the same shape as
  // the reading defect one field over, and fixed the same way: the shown use declares `pos`, and the
  // card prints it, falling back to the entry's only where the use does not.
  //
  // Three halves. The first two are anchored on the uses' own PROSE — the class a gloss or note names in
  // words — so they cannot pass by the data agreeing with itself; the third sweeps the pages, so an
  // occurrence that resolves to a class the card does not print is caught where the reader meets it.
  const rows = usesNamingAClass();

  // ── 1. The data: a use whose prose names a class declares it, or agrees with its entry. ──────────
  let agreeing = 0, declared = 0, undeclared = 0, firstUndeclared = '';
  for (const { key, entry, use, named } of rows) {
    // A use that names two classes — 「动、形，混乱；溃乱」 — agrees with its entry when the entry's
    // class is one of them; the entry's class is the dominant sense's, and this use is both.
    if (named.includes(entry.pos)) { agreeing++; continue; }
    if (!use.pos) {
      undeclared++;
      firstUndeclared ||= `${key}/${use.id} (gloss 「${use.gloss}」 names ${named.join('/')}; entry.pos is ${entry.pos})`;
      t.diagnostic(`${key}/${use.id}: gloss 「${use.gloss}」 names ${named.join('/')}; entry.pos is ${entry.pos}`);
      continue;
    }
    declared++;
    assert.ok(named.includes(use.pos),
      `LEXICON['${key}'] use ${use.id} declares pos 「${use.pos}」 while its own prose names ${named.join('/')} — the card would print a class neither the gloss nor the entry claims`);
    assert.equal(use.pos, use.pos.trim(), `LEXICON['${key}'] use ${use.id}: pos carries stray space`);
  }
  t.diagnostic(`part of speech: ${rows.length} use(s) whose own prose names a class — ${agreeing} agree with their entry, ${declared} declare one, ${undeclared} left undeclared`);
  assert.ok(rows.length > 0, 'no use names its class in its own words, so the extractor read nothing — it must not go quietly empty');
  assert.equal(undeclared, 0,
    `${undeclared} use(s) name a class their entry does not have and declare none, so the card prints the entry's class over another sense's gloss. The first is ${firstUndeclared}`);
  assert.ok(declared > 0, 'every use that names a class agrees with its entry, so reverting the per-use field would leave this green');

  // ── 2. The renderer, over those very uses: the card prints the class the prose names. ────────────
  const { registerLexicon, textbook } = await cardHarness();
  let rendered = 0, moved = 0;
  for (const { key, entry, use, named } of rows) {
    registerLexicon({ lexicon: LEXICON, words: WORDS, chars: { [key]: { use: use.id } }, chapter: 'tongjian/none' });
    const html = textbook.lexicon.card(key, 'char', NO_OCCURRENCE).html;
    rendered++;
    assert.equal(cardGloss(html), use.gloss,
      `LEXICON['${key}'] bound to ${use.id} shows the gloss ${JSON.stringify(cardGloss(html))}, so this row did not render the use it read`);
    if (entry.pos !== named[0]) moved++;
    assert.ok(named.includes(cardPos(html)),
      `LEXICON['${key}'] use ${use.id} names its class as ${named.join('/')} and the card prints 「${cardPos(html)}」 over the gloss ${JSON.stringify(use.gloss)}`);
  }
  t.diagnostic(`part of speech: ${rendered} card(s) rendered for a use whose prose names its class, ${moved} of them against an entry whose class differs`);
  assert.equal(rendered, rows.length, 'a row was skipped');
  assert.ok(moved > 0, 'no rendered use names a class its entry does not have, so this half cannot see the defect it was written for');

  // The hand-checked rows: the four in the defect report and the ones the frames show beside them. A
  // table, not a sweep — its bound is that it proves seven cards, and the sweeps above are the class.
  const handRows = [
    ['ch02-zhi-bo-zhi-wang', '相', '恥人之君相', '名', '辅佐之臣；国相'],
    ['ch02-zhi-bo-zhi-wang', '相', '況君相乎', '名', '辅佐之臣；国相'],
    ['ch02-zhi-bo-zhi-wang', '難', '難必至矣', '名', '灾难；祸患。'],
    ['ch02-zhi-bo-zhi-wang', '將', '襄子將卒犯其前', '动', '率领。'],
    ['ch02-zhi-bo-zhi-wang', '文', '巧文辯慧則賢', '动', '文饰；文采。'],
    ['ch03-cai-de-lun', '智', '智不能周', '名', '智慧；智谋。'],
    ['ch02-zhi-bo-zhi-wang', '章', '武子啟章', '专名', '人名用字：任章、启章'],
    ['ch02-zhi-bo-zhi-wang', '立', '則禍立至矣', '副', '立；即刻'],
  ];
  let handChecked = 0, handDiffering = 0;
  for (const [dir, key, fragment, expected, gloss] of handRows) {
    const { html: page, card } = await chapterCard(dir);
    const o = occurrenceOf(page, key, fragment);
    assert.ok(o, `${dir}: the page prints no bare 「${key}」 at the 「${key}」 of 「${fragment}」, so this row checked nothing`);
    handChecked++;
    const html = card(key, 'char', pressed(o.sentence, o.at, o.use)).html;
    assert.equal(cardGloss(html), gloss, `${dir}: 「${key}」 in 「${fragment}」 — the card shows ${JSON.stringify(cardGloss(html))}`);
    if (expected !== LEXICON[key].pos) handDiffering++;
    assert.equal(cardPos(html), expected,
      `${dir}: 「${key}」 in 「${fragment}」 shows the gloss ${JSON.stringify(gloss)}, whose class is ${expected}; the card prints 「${cardPos(html)}」`);
  }
  t.diagnostic(`part of speech: ${handChecked} hand-checked card(s), ${handDiffering} of them showing a class the entry does not carry`);
  assert.equal(handChecked, handRows.length, 'a hand-checked row was skipped');
  assert.ok(handDiffering > 0, 'every hand-checked row expects the entry\'s own class, so the table cannot see the defect it was written for');

  // ── 3. The pages: every occurrence's card prints the class of the use it shows. ──────────────────
  // Bound, stated because it is narrower than it looks: the expected class is computed from the page's
  // own markup, the entry's examples and chars.js — not from the card — but it IS the same precedence
  // the builder applies, so this half proves the renderer honours that order over 1,405 real presses.
  // What it cannot see: an occurrence whose class is wrong in the DATA, because it reads the data's own
  // answer. The two halves above are what hold that line.
  let swept = 0, unboundOccurrences = 0, fromOccurrence = 0;
  for (const dir of await chapterPages()) {
    const { CHARS, html: page, card } = await chapterCard(dir);
    for (const o of pageOccurrences(page)) {
      const entry = LEXICON[o.key];
      if (!entry) continue;
      const named = o.use ? usesOf(o.key).find((u) => u.id === o.use) : null;
      const pin = named ? null : pinnedUse(o.key, o.sentence, o.at);
      const bound = CHARS[o.key]?.use ? usesOf(o.key).find((u) => u.id === CHARS[o.key].use) : null;
      const shown = named ?? pin ?? bound ?? (usesOf(o.key).length === 1 ? usesOf(o.key)[0] : null);
      const html = card(o.key, 'char', pressed(o.sentence, o.at, o.use)).html;
      swept++;
      if (!shown) { unboundOccurrences++; continue; }
      if (named) fromOccurrence++;
      const expected = shown.pos ?? entry.pos;
      assert.equal(cardPos(html), expected,
        `${dir}: 「${o.key}」 in 「${o.sentence.slice(0, 30)}…」 shows ${shown.id}, whose class is ${expected}; the card prints 「${cardPos(html)}」`);
    }
  }
  t.diagnostic(`part of speech: ${swept} occurrence(s) swept over ${(await chapterPages()).length} page(s), ${fromOccurrence} of them bound by the occurrence's own use attribute, ${unboundOccurrences} with no sense to show a class for`);
  assert.ok(swept > 0, 'no occurrence on any page was swept, so this half compared nothing');
  assert.ok(fromOccurrence > 0, 'no occurrence on any page declares its own use, so the route that binds one was never exercised');
});

test('the card shows the reading the entry\'s own example pins for the occurrence clicked', async t => {
  // The eight 多音字 the verifier proved (out/verify/VERIFICATION.md §2), each named the way its finding
  // names it: a fragment of the 句, and the reading that 句 takes. The fragment is located in the page's
  // own 原文, and the card is built for that character at that offset — the reader's own click.
  const rows = [
    ['ch02-zhi-bo-zhi-wang', '將', '襄子將卒犯其前', 'jiàng'],
    ['ch02-zhi-bo-zhi-wang', '為', '智伯之臣豫讓欲為之報仇', 'wèi'],
    ['ch02-zhi-bo-zhi-wang', '長', '智氏之命必不長矣', 'cháng'],
    ['ch02-zhi-bo-zhi-wang', '識', '其友識之', 'shí'],
    ['ch02-zhi-bo-zhi-wang', '使', '簡子使尹鐸為晉陽', 'shǐ'],
    ['ch02-zhi-bo-zhi-wang', '難', '不亦難乎', 'nán'],
    ['ch02-zhi-bo-zhi-wang', '見', '不見是圖', 'xiàn'],
    ['ch03-cai-de-lun', '勝', '力不能勝', 'shēng'],
  ];
  let checked = 0;
  for (const [dir, key, fragment, expected] of rows) {
    const { html: page, card } = await chapterCard(dir);
    const o = occurrenceOf(page, key, fragment);
    assert.ok(o, `${dir}: the page prints no bare 「${key}」 at the 「${key}」 of 「${fragment}」, so this row checked nothing`);
    checked++;
    const html = card(key, 'char', pressed(o.sentence, o.at)).html;
    assert.equal(cardPinyin(html), expected,
      `${dir}: 「${key}」 in 「${fragment}」 reads ${expected}; the card shows 「${cardPinyin(html)}」 with the gloss ${JSON.stringify(cardGloss(html))}`);
  }
  t.diagnostic(`occurrence readings: ${rows.length} proved row(s), ${checked} click(s) rendered and read back`);
  assert.equal(checked, rows.length, 'a row was skipped');

  // The class, swept: every occurrence on every page that the entry's own example pins must show that
  // reading. Bound: the occurrences an example pins — where the data has no example for the 句, the card
  // falls back to the chapter's binding, and nothing here can call that reading wrong. The sweep prints
  // both numbers, so a run that resolved nothing is visible as one.
  let swept = 0, fallbacks = 0, moved = 0;
  for (const dir of await chapterPages()) {
    const { CHARS, html: page, card } = await chapterCard(dir);
    for (const o of pageOccurrences(page)) {
      if (!LEXICON[o.key]) continue;
      const pin = pinnedUse(o.key, o.sentence, o.at);
      if (!pin || !pin.reading) { fallbacks++; continue; }
      swept++;
      const shown = cardPinyin(card(o.key, 'char', pressed(o.sentence, o.at)).html);
      assert.equal(shown, pin.reading,
        `${dir}: 「${o.key}」 stands in 「${o.sentence.slice(0, 30)}…」, which ${pin.id} attests as ${pin.reading}; the card shows 「${shown}」`);
      const binding = CHARS[o.key]?.use;
      const bound = binding && usesOf(o.key).find((u) => u.id === binding);
      if (bound && bound.reading && bound.reading !== pin.reading) moved++;
    }
  }
  t.diagnostic(`occurrence readings: ${swept} occurrence(s) pinned by an example and checked, ${fallbacks} left to the chapter's binding, ${moved} where the occurrence overrides that binding`);
  assert.ok(swept > 0, 'no occurrence on any page is pinned by an example, so the sweep compared nothing');
  assert.ok(moved > 0,
    'the card never left a chapter binding behind, which is what it did before this fix — the sweep is reading the binding, not the occurrence');
});

test('a character with several senses and nothing bound to this occurrence is not given one', async t => {
  // The five the verifier executed (out/verify/VERIFICATION.md §3). Each opened `uses[0]`: 文 in 「巧文辯
  // 慧則賢」 opened 「人名。周文王」, 章 in 「武子啟章」 opened 「典章；制度」, 襄 in 「非襄主意」 opened
  // 「周襄王」, 智 in 「智不能周」 opened 「智氏，晋国大夫的家族」, 立 opened the adverb 「立；即刻」 while
  // seven of chapter 2's eight are the verb.
  const rows = [
    ['ch02-zhi-bo-zhi-wang', '文', '巧文辯慧則賢', '文饰；文采。'],
    ['ch02-zhi-bo-zhi-wang', '章', '武子啟章', '人名用字：任章、启章'],
    ['ch02-zhi-bo-zhi-wang', '襄', '非襄主意', '人名。赵襄子，名无恤，赵简子之子，赵氏宗主。'],
    ['ch02-zhi-bo-zhi-wang', '立', '則禍立至矣', '立；即刻'],
    ['ch03-cai-de-lun', '智', '智不能周', '智慧；智谋。'],
  ];
  let checked = 0;
  for (const [dir, key, fragment, expected] of rows) {
    const { html: page, card } = await chapterCard(dir);
    const o = occurrenceOf(page, key, fragment);
    assert.ok(o, `${dir}: the page prints no bare 「${key}」 at the 「${key}」 of 「${fragment}」, so this row checked nothing`);
    checked++;
    assert.equal(cardGloss(card(key, 'char', pressed(o.sentence, o.at)).html), expected,
      `${dir}: 「${key}」 in 「${fragment}」 is ${expected}`);
  }
  t.diagnostic(`senses: ${rows.length} proved row(s), ${checked} click(s) rendered and read back`);
  assert.equal(checked, rows.length, 'a row was skipped');

  // The class, swept: an occurrence with nothing bound to it and more than one sense to choose from must
  // not be handed the entry's first sense. The card says so and lists the senses instead.
  const UNBOUND = '此处义项未定。';
  let unbound = 0, bound = 0, characters = new Set();
  for (const dir of await chapterPages()) {
    const { CHARS, html: page, card } = await chapterCard(dir);
    for (const o of pageOccurrences(page)) {
      const entry = LEXICON[o.key];
      if (!entry || (entry.uses ?? []).length < 2) continue;
      const use = CHARS[o.key]?.use;
      if (use && (entry.uses ?? []).some((u) => u.id === use)) { bound++; continue; }
      if (pinnedUse(o.key, o.sentence, o.at)) { bound++; continue; }
      unbound++;
      characters.add(o.key);
      const html = card(o.key, 'char', pressed(o.sentence, o.at)).html;
      const gloss = cardGloss(html);
      assert.equal(gloss, UNBOUND,
        `${dir}: 「${o.key}」 in 「${o.sentence.slice(0, 24)}…」 has no bound sense, and the card gives it one: ${JSON.stringify(gloss)}`);
      assert.notEqual(gloss, entry.uses[0].gloss,
        `${dir}: 「${o.key}」 opened the entry's first sense, which is the defect this check exists for`);
      assert.deepEqual(cardSenses(html), entry.uses.map((u) => u.gloss),
        `${dir}: the unbound card for 「${o.key}」 does not list the senses the entry carries`);
      assert.ok(!/又读/.test(cardField(html, 'readings') ?? ''),
        `${dir}: the unbound card for 「${o.key}」 still claims a second reading beside no chosen one: ${JSON.stringify(cardField(html, 'readings'))}`);
    }
  }
  t.diagnostic(`senses: ${unbound} unbound occurrence(s) over ${characters.size} character(s) checked, ${bound} left with a sense they were given`);
  assert.ok(unbound > 0, 'no occurrence on any page is unbound, so this sweep compared nothing');
});

test('a 多音字 with nothing bound to the occurrence shows both readings and claims neither', async t => {
  // The rule for the fallback reading: `entry.pinyin` may stand in only when the entry has one reading to
  // give. A 多音字 with nothing bound and nothing pinned prints both, and no 又读 row, because there is no
  // chosen reading for the other one to be an alternative to.
  //
  // Bound, and it is why this test does not read the pages: every 多音字 on the three pages is bound or
  // pinned, so this path is UNREACHABLE from today's data and a page sweep would compare nothing. The
  // builder is driven instead with an empty 字表 — the same call the page makes, with a chapter that binds
  // nothing — over every entry in the lexicon that declares two readings.
  const { registerLexicon, textbook } = await cardHarness();
  let checked = 0;
  for (const [key, entry] of Object.entries(LEXICON)) {
    if (!Array.isArray(entry.readings) || entry.readings.length < 2) continue;
    registerLexicon({ lexicon: LEXICON, words: WORDS, chars: {}, chapter: 'tongjian/none' });
    const html = textbook.lexicon.card(key, 'char', NO_OCCURRENCE).html;
    checked++;
    assert.equal(cardPinyin(html), entry.readings.join(' / '),
      `LEXICON['${key}'] has no binding to go on, and the head claims 「${cardPinyin(html)}」 — one reading is a claim about an occurrence nobody chose`);
    assert.ok(!/又读/.test(cardField(html, 'readings') ?? ''),
      `LEXICON['${key}'] claims no single reading, so a 又读 row cannot stand beside its head: ${JSON.stringify(cardField(html, 'readings'))}`);
    assert.equal(cardGloss(html), '此处义项未定。', `LEXICON['${key}'] is given a sense it was not bound to`);
  }
  t.diagnostic(`fallback reading: ${checked} two-reading entr(ies) driven with an empty 字表 — unreachable from the pages, where every 多音字 is bound or pinned`);
  assert.ok(checked > 0, 'the lexicon declares no two-reading entry, so this rule was never exercised');
});

test('the component hands the card the element the reader pressed', async t => {
  // What this replaced: `registerLexicon` installed a capture-phase click listener that recorded the last
  // press, because `term.js` handed the card a key and a kind and nothing else, so the card had to read
  // the occurrence off the page. It read the wrong one the moment a click did not reach the listener —
  // and a card built with no occurrence at all could only speak for the chapter. The element is now the
  // third argument, so the card is built for the occurrence the reader actually pressed.
  //
  // This drives the REAL `TbChar.content()` and `TbTerm.content()` — the components' own methods, under
  // the same DOM stub as the rest of this half — with the element a press would hand them. Bound, stated
  // rather than hidden: the element is built here rather than by a browser, so this proves the call sites
  // pass the occurrence and the builder resolves it; the frames (out/cardclass/frames/) are what prove a
  // real click on the real page opens the card those two lines produce.
  const dir = 'ch02-zhi-bo-zhi-wang';
  const { clicks, card, html: page } = await chapterCard(dir);
  const { TbChar, TbTerm } = await import('../src/components/term.js');
  // The workaround's signature was a CAPTURE-phase listener, because it had to record the press before the
  // button's own handler built the card. `src/components/term.js` registers a bubble-phase click listener
  // of its own to close an open popover, which is a different path and is not what this counts.
  assert.equal(clicks.filter((c) => c.type === 'click' && c.capture).length, 0,
    'registerLexicon installed a capture-phase press listener, so the page and the card can disagree about which occurrence was pressed');

  // 使 「使使者致萬家之邑於智伯」 — the page's second 使 is 使者 shì, and the entry's own example for it
  // prints 使 twice, so no citation can tell the two apart. The chapter binds 派遣 shǐ. Only the element
  // the reader pressed can say which one this is.
  const shi = occurrenceOf(page, '使', '使者致萬家之邑於智伯');
  assert.ok(shi, 'the page no longer prints 「使使者致萬家之邑於智伯」, so this path checked nothing');
  const shiEl = Object.assign(Object.create(TbChar.prototype), pressed(shi.sentence, shi.at, shi.use), { key: '使' });
  const shiCard = shiEl.content();
  assert.equal(cardPinyin(shiCard.html), 'shì',
    `TbChar.content() for the second 使 of 「${shi.sentence}」 opened 「${cardPinyin(shiCard.html)}」; that occurrence is 使者 shì`);
  assert.equal(cardGloss(shiCard.html), '使者。', 'the second 使 of 「使使者致萬家之邑於智伯」 is 使者');
  assert.equal(cardPos(shiCard.html), '名', '使者 is a noun, and the entry\'s class belongs to 派遣');

  // 桓子 — a 詞 with two senses, whose card can only choose between them from the sentence the reader is
  // in: 「弟桓子嘉逐浣而自立」 is 趙桓子, 「又求地於魏桓子」 is 魏桓子. Driven through TbTerm.content().
  const huan = pageTerms(page).find((o) => o.key === '桓子' && o.sentence.includes('弟桓子嘉逐浣而自立'));
  const huanEl = Object.assign(Object.create(TbTerm.prototype), {
    key: '桓子',
    getAttribute: (name) => (name === 'word' ? '桓子' : name === 'ref' ? '趙桓子' : null),
    textContent: '桓子',
    closest: () => null,
  });
  // A `word` lookup does not need the 原文 cell; the occurrence is what tells the two 桓子 apart, and the
  // sentence is read from the page the same way the builder reads it.
  huanEl.closest = () => ({
    textContent: huan ? huan.sentence : '',
    childNodes: huan ? [{ textContent: huan.sentence.slice(0, huan.at) }, huanEl, { textContent: huan.sentence.slice(huan.at + 2) }] : [],
  });
  assert.ok(huan, 'the page no longer prints 「弟桓子嘉逐浣而自立」, so the 詞 half of this path checked nothing');
  const huanCard = huanEl.content();
  assert.equal(cardGloss(huanCard.html), '赵桓子，赵襄子之弟。',
    `TbTerm.content() for 桓子 in 「弟桓子嘉逐浣而自立」 opened ${JSON.stringify(cardGloss(huanCard.html))}; that sentence is about 趙桓子`);

  // The other 桓子, where NO example pins the 句: 「魏斯者，桓子之孫也，是為文侯。」 is an example of
  // neither sense, so the citation cannot choose and the occurrence declares huan2zi3-wei in its own
  // `use`. The sentence settles it — 魏斯 is 魏桓子's grandson — and the glossary anchor beside it has to
  // name the same man: this occurrence carried ref="趙桓子" until it was corrected, which told a reader
  // following the link that the founder of 魏 was 趙's.
  const wei = pageTerms(page).find((o) => o.key === '桓子' && o.sentence.includes('魏斯者'));
  assert.ok(wei, 'the page no longer prints 「魏斯者，桓子之孫也」, so the 詞 use-attribute half checked nothing');
  assert.equal(wei.ref, '魏桓子',
    `the 桓子 of 「${wei.sentence}」 points at the glossary entry ${JSON.stringify(wei.ref)}; 魏斯 is 魏桓子's grandson`);
  assert.ok(wei.use, `the 桓子 of 「${wei.sentence}」 declares no use, so its card lists both senses and claims neither`);
  const weiEl = Object.assign(Object.create(TbTerm.prototype), {
    key: '桓子',
    getAttribute: (name) => (name === 'word' ? '桓子' : name === 'ref' ? wei.ref : name === 'use' ? wei.use : null),
    textContent: '桓子',
    closest: () => ({
      textContent: wei.sentence,
      childNodes: [{ textContent: wei.sentence.slice(0, wei.at) }, weiEl, { textContent: wei.sentence.slice(wei.at + 2) }],
    }),
  });
  const weiCard = weiEl.content();
  assert.equal(cardGloss(weiCard.html), '魏桓子的省称。',
    `TbTerm.content() for 桓子 in 「${wei.sentence}」 opened ${JSON.stringify(cardGloss(weiCard.html))}; that sentence is about 魏桓子`);

  // And the card asked with no occurrence at all cannot know: it falls back to the chapter's own binding.
  const blind = card('使', 'char').html;
  assert.equal(cardPinyin(blind), 'shǐ',
    `with no occurrence the card should fall back to the chapter's binding 派遣 shǐ; it shows 「${cardPinyin(blind)}」`);

  // The third argument's other shape: a use id, for a caller that has already decided which sense it
  // wants and has no element to point at. The 字与词 figure needs exactly this — its rows name the use a
  // word takes (夫 inside 大夫 is fu1-dafu, not the chapter's fu2-initial) — and without it the figure
  // keeps its own copy of six senses, which is a second source of truth for the book's own wording.
  const chosen = card('夫', 'char', 'fu1-dafu').html;
  assert.equal(cardGloss(chosen), '与「大」合成「大夫」，官名。',
    `card(key, kind, 'fu1-dafu') opened ${JSON.stringify(cardGloss(chosen))}; a use id passed as the third argument must name the sense`);
  assert.equal(cardPinyin(chosen), 'fū', 'the use named by id declares fū, and the head must read it');
  // A use id no entry carries is not a claim: it is dropped, and the chapter binding stands as before.
  assert.equal(cardGloss(card('夫', 'char', 'no-such-use').html), cardGloss(card('夫', 'char').html),
    'a use id that names nothing changed the card, so the builder honours ids it cannot resolve');
  t.diagnostic('occurrence path: 3 component method(s) driven with a pressed element (使 by its own use, the 詞 桓子 by the entry\'s citation and the 詞 桓子 by its own use), 1 card with no occurrence as the control, and 1 use named by id');
});


test('every word entry is complete and its card-facing gloss cannot drift from its first use', t => {
  let words = 0, withUses = 0;
  for (const [w, e] of Object.entries(WORDS)) {
    const where = `WORDS['${w}']`;
    words++;
    assert.ok([...w].length >= 2, `${where}: a 詞 entry must be two or more characters`);
    assert.ok(typeof e.pinyin === 'string' && TONE.test(e.pinyin), `${where}: pinyin must carry a tone mark or number, got ${JSON.stringify(e.pinyin)}`);
    assert.ok(typeof e.pos === 'string' && e.pos.trim(), `${where}: pos is missing`);
    assert.ok(typeof e.gloss === 'string' && e.gloss.trim(), `${where}: gloss is empty — the card has nothing to show`);
    assert.ok(typeof e.note === 'string' && e.note.trim(), `${where}: note is empty`);
    assert.ok(Array.isArray(e.examples), `${where}: examples must be present as an array`);
    if (e.uses !== undefined) {
      withUses++;
      assert.ok(Array.isArray(e.uses) && e.uses.length > 0, `${where}: uses, when present, must be non-empty`);
      for (const u of e.uses) {
        assert.ok(typeof u.id === 'string' && u.id.trim(), `${where}: a use has no id`);
        assert.ok(typeof u.gloss === 'string' && u.gloss.trim(), `${where} use ${u.id}: gloss is empty`);
        assert.ok(typeof u.note === 'string' && u.note.trim(), `${where} use ${u.id}: note is empty`);
        assert.ok(Array.isArray(u.examples), `${where} use ${u.id}: examples must be present as an array`);
      }
      assert.ok(e.uses.some(u => u.gloss === e.gloss),
        `${where}: the card-facing gloss 「${e.gloss}」 is not any use's gloss (${e.uses.map(u => u.gloss).join(' / ')}) — the card would show a sense the entry does not carry`);
      const cardUse = e.uses.find(u => u.gloss === e.gloss);
      assert.deepEqual(cardUse.examples, e.examples,
        `${where}: the card-facing examples and the use they come from have drifted apart`);
    }
  }
  t.diagnostic(`words: ${words} entries, ${withUses} carrying a use list as well as the card-facing gloss`);
  assert.ok(words > 0, 'WORDS is empty — checked zero entries');
});

test('every <tb-char> on a chapter page resolves to an entry', t => {
  const chapters = fs.existsSync(TONGJIAN)
    ? fs.readdirSync(TONGJIAN, { withFileTypes: true }).filter(d => d.isDirectory() && /^ch\d/.test(d.name)).map(d => d.name).sort()
    : [];
  const pages = chapters.map(dir => path.join(TONGJIAN, dir, 'index.html')).filter(f => fs.existsSync(f));
  let chars = 0, unresolved = 0;
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<tb-char\b[^>]*>([^<]*)<\/tb-char>/g)) {
      const key = m[1].trim();
      if (!key) continue;
      chars++;
      if (!LEXICON[key]) { unresolved++; t.diagnostic(`${path.relative(root, file)}: <tb-char>${key}</tb-char> has no LEXICON entry`); }
    }
  }
  t.diagnostic(`chapter pages discovered: ${pages.length}; <tb-char> elements read: ${chars}`);
  if (!pages.length) t.diagnostic('bound: no tongjian/chNN-*/index.html exists yet, so this check read nothing. It is live for every page that lands, and the corpus-wide coverage check above is what holds the line meanwhile.');
  assert.equal(unresolved, 0, `${unresolved} <tb-char> element(s) on a chapter page point at a character with no entry`);
});

test('the 原文 and its quotations are Traditional, and everything else is Simplified', t => {
  // The owner's instruction, after reading the published book twice (2026-09-18):
  //   「我是说这本书一律用简体中文」 … then 「If the original text is in traditional chinese character that
  //   is fine. I just need the rest of the textbook and especially the translation to be in simplified
  //   chinese.」
  // So the book sets two scripts, and which is which is a rule rather than a habit:
  //
  //   | 原文 — every sentence inside <ol class="zj-src">                     | Traditional |
  //   | every quotation of 通鑑: a card's 通鑑用例, a quotation in prose, a figure's quote | Traditional |
  //   | everything else: 譯文, 背景, 思考, headings, captions, the citation line, gloss, note, labels | Simplified |
  //
  // The rule had already been reversed twice in one session before this, which is exactly why it is a
  // check and not a paragraph: a later edit pastes a sentence out of a Traditional edition into 背景, or
  // "tidies" the 原文 into Simplified, and nothing else here notices.
  //
  // Claim, in two halves:
  //   1. Outside the regions that ARE 通鑑's text, no character exists only in the Traditional script.
  //   2. The regions that are 通鑑's text are the received text: each page's 原文 block equals its corpus
  //      entry character for character, and every run marked lang="zh-Hant" is a verbatim quotation from
  //      that corpus (or the volume head's 起訖 line, which the 年表 quotes and the corpus does not carry).
  //
  // What it proves: script, and that a marked quotation is real. What it cannot see, stated rather than
  // hidden: a character BOTH scripts print but use differently — 著 for 着, 沈 for 沉, 干 for 乾 — because
  // those are not on the Traditional-only list; and a quotation the book does not mark (no 「」, not a
  // `quote` field, no lang attribute), which no mechanical rule can tell from the book's own sentence. It
  // says nothing about whether the 原文 is the right text — test/corpus.test.js holds that — and nothing
  // about a gloss being right.
  //
  // The character set is test/fixtures/traditional-only.txt, OpenCC's TSCharacters.txt reduced to the
  // characters whose Simplified form differs, checked in rather than fetched, so this needs no network.
  // Held out, each for a stated reason: the corpus's `work` field (the catalogued title); `variants`
  // (the glyph a fetched witness prints — the field's whole content is "this other form exists"); and the
  // two characters 絺 and 乾, which are Simplified or irreplaceable in their own right and are recorded
  // in tongjian/README.md.
  const artifact = path.join(here, 'fixtures', 'traditional-only.txt');
  assert.ok(fs.existsSync(artifact), `${path.relative(root, artifact)} is missing, so the script rule cannot be checked at all`);
  const traditional = new Map();
  for (const line of fs.readFileSync(artifact, 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [from, to] = line.split(/\t+/);
    assert.ok(from && to, `a line of ${path.relative(root, artifact)} is not "traditional<TAB>simplified": ${JSON.stringify(line)}`);
    assert.notEqual(from, to, `${path.relative(root, artifact)} lists 「${from}」 as Traditional-only, but the table maps it to itself — a character both scripts print is a false positive here`);
    traditional.set(from.trim(), to.trim());
  }
  assert.ok(traditional.size > 1000,
    `the character set holds ${traditional.size} entries, which is not a Traditional→Simplified table — a truncated artifact must not read as a clean book`);

  const corpusText = CORPUS.map(e => e.text.join('\n')).join('\n');
  // 通鑑's own words this corpus does not cover, named here because the corpus is one year of one 卷 and
  // the 年表 prints two lines from outside it: the volume head's 起訖 line, and the 前376 entry that ends
  // 晉. A new quotation from another year has to be added to this list by hand — that is this half of the
  // check's stated bound, and it is why the list is here rather than folded into the corpus.
  const OUTSIDE_CORPUS = [
    '起著雍攝提格，盡玄黓困敦，凡三十五年',
    '魏、韓、趙共廢晉靖公為家人而分其地。',
    '著雍攝提格',
    '玄黓困敦',
  ];
  const isQuotation = (s) => s.length >= 2 && (corpusText.includes(s) || OUTSIDE_CORPUS.includes(s));

  const chapters = fs.existsSync(TONGJIAN)
    ? fs.readdirSync(TONGJIAN, { withFileTypes: true }).filter(d => d.isDirectory() && /^ch\d/.test(d.name)).map(d => d.name).sort()
    : [];
  const pages = chapters.map(dir => path.join(TONGJIAN, dir, 'index.html')).filter(f => fs.existsSync(f));
  const files = [
    path.join(TONGJIAN, 'index.html'),
    ...chapters.flatMap(dir => ['index.html', 'glossary.js', 'chars.js'].map(f => path.join(TONGJIAN, dir, f))),
    path.join(TONGJIAN, 'corpus.js'),
    path.join(TONGJIAN, 'lexicon.js'),
    path.join(TONGJIAN, 'words.js'),
    path.join(TONGJIAN, 'data', 'card.js'),
    path.join(root, 'src', 'figures', 'zj-split.js'),
    path.join(root, 'src', 'figures', 'zj-timeline.js'),
    path.join(root, 'src', 'figures', 'zj-words.js'),
    path.join(root, 'src', 'figures', 'registry.js'),
  ].filter(f => fs.existsSync(f));

  // ── Half 1: everything outside the 通鑑 regions is Simplified. ────────────────────────────────────
  // The regions are blanked before the scan. Blanking can only MISS a defect, never invent one, so each
  // rule below is written wide rather than narrow: a 「…」 run in a data file is blanked whether or not it
  // is a quotation, because the book has no way for a checker to tell.
  const SKIP = new Set(['絺', '乾']);
  const blank = (text, rel) => {
    let out = text;
    // A comment is not what a reader sees. The corpus header's own comment quotes the received readings
    // on purpose (生民之類, 藍臺, 田恆之於齊) and a note saying which reading was taken has to be able to
    // name it. Blanking can only make this check miss, never invent, so comments go.
    out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
    out = out.replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
    out = out.replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length));
    out = out.replace(/work: '[^']*'/g, (m) => ' '.repeat(m.length));
    // The corpus's own record — the 卷 it covers, its section names, the punctuation it follows and the
    // collation note that says which reading was taken — is the transcription's apparatus. No page prints
    // it (the reader sees the `text` arrays and the chapters' own prose), and it has to be able to quote a
    // witness in the witness's own script: 「底本作「藍臺」…」 is a comparison of two printed forms, not
    // the book's prose about them. tongjian/README.md holds the same record in English.
    out = out.replace(/^\s*(?:juan|section|punctuation|note): '[^']*',?$/gm, (m) => ' '.repeat(m.length));
    out = out.replace(/variants: \[[^\]]*\]/g, (m) => ' '.repeat(m.length));
    out = out.replace(/「[^「」]*」/g, (m) => ' '.repeat(m.length));
    // The two lines from outside the corpus are 通鑑's own words wherever they appear, including bare in
    // a figure's sentence (「起著雍攝提格…」 and the 歲陰歲陽 names inside it).
    for (const quote of OUTSIDE_CORPUS) out = out.split(quote).join(' '.repeat(quote.length));
    out = out.replace(/text: \[[\s\S]*?\n    \],/g, (m) => ' '.repeat(m.length)); // corpus `text:` arrays
    out = out.replace(/examples: \[[^\]]*\],?/g, (m) => ' '.repeat(m.length));  // every quotation a card prints
    // The key of a lexicon, word, glossary or per-chapter entry — the identifier a page prints and looks
    // up by, so it is the received form rather than the book's prose about it.
    out = out.replace(/^(\s*)'([^']*)':/gm, (m, ws, key) => `${ws}${' '.repeat(key.length + 2)}:`);
    out = out.replace(/\bword: \[[^\]]*\]/g, (m) => ' '.repeat(m.length));     // chars.js word bindings
    out = out.replace(/\bterm: '[^']*'/g, (m) => ' '.repeat(m.length));        // a glossary entry's own key
    if (/index\.html$/.test(rel)) {
      out = out.replace(/<ol class="zj-src"[\s\S]*?<\/ol>/g, (m) => ' '.repeat(m.length));
      out = out.replace(/<[a-z-]+[^>]*\blang="zh-Hant"[^>]*>[\s\S]*?<\/[a-z-]+>/g, (m) => ' '.repeat(m.length));
      out = out.replace(/<tb-(?:char|term)\b[^>]*>[^<]*<\/tb-(?:char|term)>/g, (m) => ' '.repeat(m.length));
      out = out.replace(/\b(?:ref|word)="[^"]*"/g, (m) => ' '.repeat(m.length));
      // The 字詞 tables print the character itself in their glyph column: that glyph is the 原文's
      // character (and the key its card is looked up by), not the book's prose about it.
      out = out.replace(/<span class="zj-lex__glyph">[^<]*<\/span>/g, (m) => ' '.repeat(m.length));
    } else {
      // A module: a literal that is a lexicon key or a corpus quotation is 通鑑's text.
      out = out.replace(/'([^'\\\n]*)'/g, (whole, body) => {
        if (!body) return whole;
        if (LEXICON[body] !== undefined || WORDS[body] !== undefined || isQuotation(body)) return ' '.repeat(whole.length);
        return whole;
      });
    }
    return out;
  };

  const offenders = [];
  let scanned = 0;
  for (const file of files) {
    const rel = path.relative(root, file);
    const text = blank(fs.readFileSync(file, 'utf8'), rel);
    text.split('\n').forEach((line, i) => {
      for (const ch of line) {
        if (SKIP.has(ch)) continue;
        if (!traditional.has(ch)) { scanned++; continue; }
        offenders.push(`${rel}:${i + 1}: 「${ch}」 is Traditional-only (Simplified: 「${traditional.get(ch)}」), outside any 原文 or quotation — a reader sees it in: 「${line.trim().slice(0, 90)}」`);
      }
    });
  }

  // ── Half 2: the 原文 and its marked quotations are the received text. ─────────────────────────────
  const byId = new Map(CORPUS.map(e => [e.id, e]));
  const stripTags = (s) => s.replace(/<br\s*\/?>(?!\n)/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, '');
  let blocks = 0, marked = 0;
  for (const file of pages) {
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<ol class="zj-src"([^>]*)>([\s\S]*?)<\/ol>/g)) {
      blocks++;
      assert.ok(/\blang="zh-Hant"/.test(m[1]),
        `${rel}: a 原文 block does not carry lang="zh-Hant", so a screen reader reads the received text with the modern voice`);
      const id = /\bdata-corpus="([^"]+)"/.exec(m[1])?.[1];
      assert.ok(id && byId.has(id), `${rel}: a 原文 block names no corpus entry (data-corpus="${id}")`);
      // The 原文 is read from the source cell, not the whole `<li>`: a pair holds the 原文 and its 譯文 in
      // one row, and reading the row would compare the book's own translation against the received text.
      // Everything before the 譯文 cell's opening tag is the original — see the same reading in
      // test/corpus.test.js for why a non-greedy `</span>` truncates at the first cinnabar full stop.
      const printed = [...m[2].matchAll(/<li class="zj-pair">([\s\S]*?)<span class="zj-pair__tr"/g)].map(li => stripTags(li[1])).join('\n');
      assert.ok(printed, `${rel}: the 原文 block for "${id}" holds no <li class="zj-pair">, so this compared nothing`);
      assert.equal(printed, byId.get(id).text.join('\n'),
        `${rel}: the printed 原文 is not CORPUS['${id}'] — either the 原文 was converted away from the received text, or it was edited`);
    }
    // Every run the book marks as 通鑑's text must be a verbatim quotation of it.
    for (const m of html.matchAll(/<([a-z-]+)[^>]*\blang="zh-Hant"[^>]*>([\s\S]*?)<\/\1>/g)) {
      if (/class="zj-src"/.test(m[0])) continue; // the 原文 blocks are compared above
      const text = stripTags(m[2]);
      if (!text) continue;
      marked++;
      assert.ok(isQuotation(text),
        `${rel}: a run marked lang="zh-Hant" is not a quotation of the received text, so the mark is a claim the corpus does not support: 「${text.slice(0, 60)}」`);
    }
  }
  // The figures print 通鑑 too, and their `quote` fields are data rather than markup.
  let figureQuotes = 0;
  for (const name of ['zj-split.js', 'zj-timeline.js', 'zj-words.js']) {
    const rel = path.join('src', 'figures', name);
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    for (const m of src.matchAll(/\bquote: '([^']*)'/g)) {
      if (!m[1]) continue; // a row of the 年表 with no 通鑑 sentence of its own
      figureQuotes++;
      assert.ok(isQuotation(m[1]),
        `${rel}: a \`quote\` field is not a verbatim 通鑑 quotation: 「${m[1].slice(0, 60)}」`);
    }
  }

  t.diagnostic(`script: ${files.length} file(s) scanned, ${scanned} Simplified-layer character(s) checked, ${offenders.length} Traditional-only outside the 原文; `
    + `${blocks} 原文 block(s) and ${marked} marked quotation(s) compared against the corpus, ${figureQuotes} figure \`quote\` field(s); `
    + `${traditional.size} characters in ${path.relative(root, artifact)}; held out: corpus \`work\`, \`variants\`, and the character(s) ${[...SKIP].join(' ')}`);
  assert.ok(files.length > 0, 'no file a reader sees was found, so nothing was checked — the file list must not go quietly empty');
  assert.ok(scanned > 0, 'zero characters were checked, so this run proves nothing');
  assert.ok(blocks > 0, 'no 原文 block was found, so the Traditional half of the rule was never exercised');
  assert.ok(marked > 0, 'no run marked lang="zh-Hant" was found, so no quotation was checked');
  assert.equal(offenders.length, 0,
    `${offenders.length} Traditional-only character(s) outside the 原文 or a quotation. The owner's rule is that the 原文 and its `
    + `quotations stay Traditional and everything else is Simplified; tongjian/README.md holds the conversion record.\n      ${offenders.slice(0, 20).join('\n      ')}`);
});
