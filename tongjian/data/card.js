// The lexicon store this book's <tb-char> and rich <tb-term> read from, and the card's markup.
//
// The direction of the dependency is one way and stays that way: `src/components/term.js` knows only
// that a page MAY leave a registry on the shared handshake object (`textbook.lexicon`), and asks it for
// a card by key. `src/` never imports anything under `tongjian/`, so the components keep working on a
// page that has no lexicon at all, and this book can change its card without touching the biology book.
//
// The registry is registered by the page, once, before the components upgrade:
//
//   registerLexicon({ lexicon: LEXICON, words: WORDS, chars: CHARS, chapter: 'tongjian/ch01' })
//
// and the interface it publishes is:
//
//   textbook.lexicon.chapter            the chapter id it was registered for
//   textbook.lexicon.lookup(key, kind)  the entry, normalised; null when there is none
//   textbook.lexicon.card(key, kind)    { className, html } for the popover, or null
//
// `kind` is 'char' for a single character and 'word' for a 詞; it only breaks a tie when a key exists
// in both layers, which the two-layer design makes possible and unusual.
//
// What the card shows, and where each field comes from (docs/design/tongjian.md, "What the card
// shows"): the reading and the 詞性 from the entry, the gloss and the note from the sense this passage
// takes (chars.js names it; with no line there the entry's first sense is the common case), the 通鑑
// examples from that sense — or the gap stated, never invented — and 「在這一章」 computed from the
// chapter's own 原文: the clause each occurrence stands in, at most three of them, because the length of
// that list is the one thing on the card an entry does not bound.

import { textbook } from '../../src/shell.js';

let store = null;

/** Escape the four characters that would break out of text or an attribute. */
function esc(value) {
  return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** One character is a 字; anything longer is a 詞. The layers are keyed that way. */
function layerFor(key, kind) {
  if (kind === 'char') return ['lexicon', 'words'];
  if (kind === 'word') return ['words', 'lexicon'];
  return key.length === 1 ? ['lexicon', 'words'] : ['words', 'lexicon'];
}

/** Every sentence of the chapter's own 原文, in reading order, split on the corpus's own line. */
function sourceSentences() {
  return [...document.querySelectorAll('.zj-src li')].map((li) => li.textContent.trim()).filter(Boolean);
}

/** The chapter's 原文 as a list, built once: the card can open on any of ~600 characters. */
let sentenceCache = null;

function sentences() {
  if (!sentenceCache) sentenceCache = sourceSentences();
  return sentenceCache;
}

// Two characters in one chapter can share every sentence a third of the way down, so the 在這一章 list is
// the one part of the card whose length is not bounded by the entry. Measured on chapter 2 before this:
// 智 produced seven lines and the list alone was 281 px of a 468 px card, and 子 appeared in six
// sentences of up to eighty characters for 2,731 px. The card is also narrower than the phone's — the
// shared popover clamps it to the term's own width, 299 px in a 1440 px column — so a line here is about
// eleven characters.
//
// A quotation in that list needs only enough of the sentence to place the character, so the list carries
// the clause the character stands in — the text between the punctuation marks around it — with an
// ellipsis where the clause was cut out of a longer sentence. The 通鑑用例 above it keeps its whole
// sentence: that one is the attestation, and this one is a pointer.
const CLAUSE_MAX = 20;
const PUNCT = '，。、；：？！「」『』〈〉《》（）';

function clauseAround(sentence, key) {
  const at = sentence.indexOf(key);
  if (at < 0) return sentence;
  let start = 0;
  let end = sentence.length;
  for (let i = at - 1; i >= 0; i -= 1) if (PUNCT.includes(sentence[i])) { start = i + 1; break; }
  for (let i = at + key.length; i < sentence.length; i += 1) if (PUNCT.includes(sentence[i])) { end = i; break; }
  let clause = sentence.slice(start, end).trim();
  let cutStart = start > 0;
  let cutEnd = end < sentence.length;
  if (clause.length > CLAUSE_MAX) {
    // Keep the character in the window and mark the side that lost text.
    const rel = at - start;
    const head = Math.max(0, rel - Math.floor((CLAUSE_MAX - key.length) / 2));
    cutStart = cutStart || head > 0;
    cutEnd = true;
    clause = clause.slice(head, head + CLAUSE_MAX);
  }
  return `${cutStart ? '…' : ''}${clause}${cutEnd ? '…' : ''}`;
}

// The card's 在這一章 section is bounded on both axes: at most three clauses of at most CLAUSE_MAX
// characters, and at most three of the 詞 the chapter links to it. `chars.js` may name six (智 names 智宣子,
// 智果, 智伯, 智襄子, 智國, 智氏), and a card that lists all six plus three clauses is 400 px of list on
// a card that has to fit under a character. Three places is a pointer; seven is a corpus dump.
const HERE_MAX = 3;
const HERE_WORDS_MAX = 3;
const HERE_BUDGET = 3 * CLAUSE_MAX;

/** Where else this chapter uses it: the clause each occurrence stands in, at most HERE_MAX of them. */
function hereLines(key, declared) {
  const out = [];
  let spent = 0;
  for (const sentence of sentences()) {
    if (!sentence.includes(key)) continue;
    const line = clauseAround(sentence, key);
    if (out.includes(line)) continue;
    if (out.length && spent + line.length > HERE_BUDGET) break;
    out.push(line);
    spent += line.length;
    if (out.length >= HERE_MAX) break;
  }
  if (out.length) return out;
  // A chapter that writes the sentences out itself (chars.js `in`) is taken at its word, capped the same.
  return Array.isArray(declared.in) ? declared.in.slice(0, HERE_MAX) : [];
}

/**
 * The sense this chapter takes, and everything that follows from it. A character carries every sense
 * it has in 通鑑; `chars.js` says which one is on this page, and a character with no line there takes
 * the entry's first sense, which is the common case.
 */
function normalise(key, kind) {
  if (!store) return null;
  const [first, second] = layerFor(key, kind);
  const entry = store[first][key] ?? store[second][key];
  if (!entry) return null;
  const declared = store.chars[key] ?? {};
  const uses = Array.isArray(entry.uses) ? entry.uses : [];
  const use = (declared.use && uses.find((u) => u.id === declared.use)) || uses[0] || null;
  const clauses = hereLines(key, declared);
  const linked = Array.isArray(declared.word) ? declared.word : [];
  return {
    key,
    layer: store[first][key] ? first : second,
    glyph: key,
    pinyin: entry.pinyin ?? '',
    readings: Array.isArray(entry.readings) ? entry.readings : [],
    variants: Array.isArray(entry.variants) ? entry.variants : [],
    pos: entry.pos ?? (use ? use.pos : '') ?? '',
    gloss: (use ? use.gloss : entry.gloss) ?? '',
    note: (use ? use.note : entry.note) ?? entry.note ?? '',
    examples: (use ? use.examples : entry.examples) ?? [],
    clauses,
    words: linked,
  };
}

/**
 * The card, as the popover's inner HTML.
 *
 * `lang` on the quotes. The card prints two scripts on purpose (docs/design/tongjian.md, "Language, and
 * which script belongs where"): the gloss and the note are commentary about the text and are Simplified,
 * while a 通鑑用例 and the 在這一章 clauses are quotations of the 原文 and are Traditional. `lang` is what a
 * screen reader picks its voice from, so every run of quoted text says which script it is in. The head
 * carries it too — the glyph above it is the character, in the script the book prints the text in.
 */
function cardHtml(entry) {
  const parts = [];
  parts.push(
    '<span class="zj-card__head" lang="zh-Hant">'
    + `<b class="zj-card__glyph">${esc(entry.glyph)}</b>`
    + (entry.pinyin ? `<span class="zj-card__pinyin">${esc(entry.pinyin)}</span>` : '')
    + (entry.pos ? `<span class="zj-card__pos">${esc(entry.pos)}</span>` : '')
    + '</span>',
  );
  const extras = [];
  if (entry.readings.length > 1) {
    extras.push(`<span class="zj-card__reading">又讀 ${esc(entry.readings.filter((r) => r !== entry.pinyin).join('、'))}</span>`);
  }
  if (entry.variants.length) {
    extras.push(`<span class="zj-card__reading">異體 ${esc(entry.variants.join('、'))}</span>`);
  }
  // One row, not one row each: two half-empty lines cost 34 px of a card that has to fit a phone.
  if (extras.length) parts.push(`<span class="zj-card__readings">${extras.join('')}</span>`);
  parts.push(`<span class="zj-card__gloss">${esc(entry.gloss)}</span>`);
  if (entry.note) parts.push(`<span class="zj-card__note">${esc(entry.note)}</span>`);

  parts.push('<span class="zj-card__sec">通鑑用例</span>');
  if (entry.examples.length) {
    // They share one flowing block rather than stacking: on the card's own 299 px two short quotations
    // fit on one line side by side, and a card that has to fit under a character cannot afford a line
    // break between two lines of eight characters.
    const quoted = entry.examples.map((ex) => '<span class="zj-card__ex">'
      + `<span class="zj-card__ex-text" lang="zh-Hant">${esc(ex.text)}</span>`
      + (ex.at ? `<span class="zj-card__ex-at">${esc(ex.at)}</span>` : '')
      + '</span>');
    parts.push(`<span class="zj-card__exs">${quoted.join('')}</span>`);
  } else {
    // A gap stated rather than filled: an entry with no attested second use says so, and no example is
    // invented to fill the space (docs/design/tongjian.md, "The corpus").
    parts.push('<span class="zj-card__gap">他處用例尚未檢得。</span>');
  }

  if (entry.clauses.length || entry.words.length) {
    parts.push('<span class="zj-card__sec">在這一章</span>');
    const items = entry.clauses.map((s) => `<li lang="zh-Hant">${esc(s)}</li>`);
    for (const w of entry.words.slice(0, HERE_WORDS_MAX)) items.push(`<li><span class="zj-card__here-word">詞</span>${esc(w)}</li>`);
    parts.push(`<ul class="zj-card__here">${items.join('')}</ul>`);
  }

  // The way back into the chapter. This used to point at `../#zj-<char>`, an index on the book's
  // contents page that nothing builds — so every card carried a link to an anchor that does not exist,
  // which `npm run check` cannot see (it verifies that an id in the same document is present, and a
  // cross-document fragment is invisible to it). Until the book has a real 字詞索引, the link goes to
  // the chapter's own 字詞 section, which does exist: it is one of the six frozen section ids.
  parts.push('<a class="zj-card__index" href="#notes">本章字詞 →</a>');
  return parts.join('');
}

/** A character the lexicon has not reached yet: the card still opens, and says what is missing. */
function missingHtml(key) {
  return '<span class="zj-card__head" lang="zh-Hant">'
    + `<b class="zj-card__glyph">${esc(key)}</b>`
    + '</span>'
    + '<span class="zj-card__gloss">字詞庫尚未收錄此字。</span>';
}

// Where the book prints the 原文 and its quotations, so the page can say which script each run is in.
// `lang` is a global HTML attribute and not a stylesheet's business: `zj.css` cannot set it, and the
// chapter pages this book's own worker owns are not this file's to edit. The book's voice is Simplified
// (`<html lang="zh-Hans">`), and these are the runs that are not — the 原文 itself, the reference copy of
// it beside the 譯文, and the two quotations the card prints.
const TRADITIONAL = '.zj-src, .zj-trans__src, .zj-card__ex-text, .zj-card__here li';

function declareScripts() {
  for (const el of document.querySelectorAll(TRADITIONAL)) {
    if (!el.hasAttribute('lang')) el.setAttribute('lang', 'zh-Hant');
  }
}

/**
 * Register one chapter's lexicon. Called by the page before `src/components/index.js` is imported, so
 * every <tb-char> on it finds the store the moment it upgrades.
 */
export function registerLexicon({ lexicon = {}, words = {}, chars = {}, chapter = '' } = {}) {
  store = { lexicon, words, chars, chapter };
  const registry = {
    chapter,
    lookup: (key, kind) => normalise(key, kind),
    card: (key, kind) => {
      const entry = normalise(key, kind);
      if (!entry) return { className: 'zj-card', html: missingHtml(key) };
      return { className: 'zj-card', html: cardHtml(entry) };
    },
  };
  textbook.lexicon = registry;
  declareScripts();
  return registry;
}

/** The store, for tests and for a page that wants to build a list from it. */
export function lexiconStore() {
  return store;
}
