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
const POS = ['名', '動', '形', '副', '介', '連', '助', '代', '數', '量', '語氣', '專名'];

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
