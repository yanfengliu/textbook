// What this file proves, and what it cannot.
//
// It proves that `tongjian/lexicon.js` covers every character of the corpus and that every
// entry is complete enough for a card to render: a pinyin carrying a tone, a part of speech,
// at least one use with an id, a gloss and a note, and an `examples` array that is present
// whether or not it holds anything. It proves the same for `tongjian/words.js`, that a word's
// card-facing gloss and its first use cannot drift apart, and that the 多音字 the corpus
// genuinely reads two ways declare both readings.
//
// What it cannot prove: that a gloss is *right*, that a pinyin is the reading the sentence
// requires, or that a sense list is complete. A wrong gloss is a well-formed entry, and this
// file would pass it. `test/corpus.test.js` proves the quotations are real; neither file
// reads a dictionary. The glosses were drafted by a model and checked against the passage and
// the fetched 胡三省 音注 — see tongjian/README.md for what that check covered and where it
// stopped.
//
// Denominator: the coverage check is keyed on the corpus characters, and it asserts that it
// found some and compared all of them, so an empty lexicon fails instead of passing quietly.
// The 多音字 table asserts that every row was checked.

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

const usesOf = entry => (Array.isArray(entry.uses) ? entry.uses : []);

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

test('every 多音字 a chapter prints is bound to the use whose reading that page prints', async t => {
  // What the card shows is the bound use's reading; what the page's own 字詞 table prints is the
  // chapter's ruling. Where the entry is polyphonic the chapter must bind a use, or the card
  // silently falls back to `uses[0]` and shows a reading nobody chose.
  const chapters = fs.existsSync(TONGJIAN)
    ? fs.readdirSync(TONGJIAN, { withFileTypes: true }).filter(d => d.isDirectory() && /^ch\d/.test(d.name)).map(d => d.name).sort()
    : [];
  const unbound = [];
  let rendered = 0, bound = 0;
  for (const dir of chapters) {
    const page = path.join(TONGJIAN, dir, 'index.html');
    const charsFile = path.join(TONGJIAN, dir, 'chars.js');
    if (!fs.existsSync(page)) continue;
    const CHARS = fs.existsSync(charsFile)
      ? (await import(pathToFileURL(charsFile).href + '?t=' + Date.now())).CHARS || {}
      : {};
    const html = fs.readFileSync(page, 'utf8');
    const seen = new Set();
    for (const m of html.matchAll(/<tb-(?:char|term)\b[^>]*>([^<]*)<\/tb-(?:char|term)>/g)) {
      const key = m[1].trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const entry = LEXICON[key] || WORDS[key];
      if (!entry || !Array.isArray(entry.readings) || entry.readings.length < 2) continue;
      rendered++;
      const binding = CHARS[key];
      const use = binding && binding.use ? (entry.uses || []).find(u => u.id === binding.use) : null;
      if (!use) {
        unbound.push(`${dir}: <tb-…>${key}</tb-…> falls back to uses[0] and shows ${entry.pinyin} 「${(entry.uses[0] || {}).gloss || ''}」 — bind it in ${dir}/chars.js`);
        continue;
      }
      if (!use.reading) { unbound.push(`${dir}: ${key} binds ${binding.use}, which declares no reading`); continue; }
      bound++;
    }
  }
  t.diagnostic(`bindings: ${rendered} 多音字 rendered on pages, ${bound} bound to a use that declares its reading, ${unbound.length} falling back`);
  assert.equal(unbound.length, 0,
    `${unbound.length} 多音字 on a chapter page would show a reading nobody chose:\n      ${unbound.join('\n      ')}`);
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
      const printed = [...m[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(li => stripTags(li[1])).join('\n');
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
