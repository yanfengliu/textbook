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
//   textbook.lexicon.chapter                    the chapter id it was registered for
//   textbook.lexicon.lookup(key, kind, at?)     the entry, normalised; null when there is none
//   textbook.lexicon.card(key, kind, at?)       { className, html } for the popover, or null
//
// `kind` is 'char' for a single character and 'word' for a 词; it only breaks a tie when a key exists
// in both layers, which the two-layer design makes possible and unusual. The optional third argument is
// the occurrence the card is about: the element the reader pressed, which `src/components/term.js`
// passes, or the id of a use the caller has already chosen (`'shi4-messenger'`), which is how a caller
// that knows the sense — the 字与词 figure, whose rows name the use a word needs — asks for it without
// keeping its own copy of the entry. A string is never an element, so one argument carries both.
//
// What the card shows, and where each field comes from (docs/design/tongjian.md, "What the card
// shows"): the reading and the 词性 from the shown SENSE, the gloss and the note from the sense this
// passage takes (the occurrence's own citation when the entry has one for that sentence, otherwise the
// sense chars.js binds), the 通鉴 examples from that sense — or the gap stated, never invented — and
// 「在这一章」 computed from the chapter's own 原文: the clause each occurrence stands in, at most three
// of them, because the length of that list is the one thing on the card an entry does not bound.
//
// The reading is the shown sense's own. `entry.pinyin` is a default, and printing it over a sense that
// reads otherwise is the card contradicting itself in one popover — 「使 shǐ」 above a gloss of 「出使。」
// whose note says 「读 shì」. A 多音字 declares a `reading` per use for exactly this, and the head prints
// the one the shown use declares.
//
// The 词性 is the shown sense's own, for the same reason one field over. 「相 xiàng」 over a gloss of
// 「辅佐之臣；国相」 labelled 副 is the same contradiction: 副 belongs to 互相, the sense the card is NOT
// showing. A use declares `pos` where its own sense needs one — a character can genuinely be two parts
// of speech in one volume (see tongjian/README.md) — and the card prints it, falling back to the
// entry's `pos` only where the use declares none, which is where the two genuinely agree. An unbound
// card claims no class at all: with no sense shown, the entry's class is a claim about a sense nobody
// picked, exactly as its `pinyin` would be.
//
// The sense is the OCCURRENCE's, not the chapter's. A chapter that prints a 多音字 in both readings
// binds one use, so the other occurrences would be shown the wrong reading; the entry's own examples
// are the authority that can tell them apart, because an example IS the attestation. See `citedUse`.

import { textbook } from '../../src/shell.js';

let store = null;

/**
 * Which occurrence the card is being built for, and why the card needs to know.
 *
 * `chars.js` binds ONE use per character per chapter, and a chapter that prints a 多音字 in both
 * readings cannot say which reading a given occurrence takes: 「使使者致萬家之邑於智伯」 prints 使
 * twice, once 派遣 shǐ and once 使者 shì, and the chapter's single binding speaks for both. What can
 * tell them apart is the entry's own example, because an example IS the attestation — the entry that
 * files 「簡子使尹鐸為晉陽」 under 派遣 shǐ has said which sense that sentence takes. So the card
 * resolves the occurrence, not the chapter, and that needs to know which one the reader pressed.
 *
 * That is the element `src/components/term.js` hands in: `TbChar.content()` calls
 * `registry.card(this.key, 'char', this)`. The element is also what carries an occurrence's own
 * `use="…"`, which is the one thing the chapter's 字表 cannot express — 「況君相乎」 needs xiàng 国相
 * while 「相親」 in the same chapter is xiāng 互相 — and `occurrenceUse` below reads it before anything
 * else, because it is the most specific statement the data can make about an occurrence.
 *
 * This used to be read off the page instead, by a capture-phase listener that recorded the last press,
 * because `term.js` handed over a key and a kind and nothing else. The listener is gone: it recorded a
 * press that a card built for another occurrence could inherit, and the gate that drives the components
 * with an element (`test/lexicon.test.js`) holds the coupling that replaced it.
 */
function pressedIn(occurrence) {
  return occurrence && typeof occurrence.closest === 'function' ? occurrence : null;
}

/** The use id an occurrence declares, or ''. A caller may also hand one in as the third argument. */
function declaredUseOf(occurrence) {
  if (typeof occurrence === 'string') return occurrence;
  const el = pressedIn(occurrence);
  return (el && typeof el.getAttribute === 'function' ? el.getAttribute('use') : '') || '';
}

/** Escape the four characters that would break out of text or an attribute. */
function esc(value) {
  return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** One character is a 字; anything longer is a 词. The layers are keyed that way. */
function layerFor(key, kind) {
  if (kind === 'char') return ['lexicon', 'words'];
  if (kind === 'word') return ['words', 'lexicon'];
  return key.length === 1 ? ['lexicon', 'words'] : ['words', 'lexicon'];
}

/**
 * Every sentence of the chapter's own 原文, in reading order, split on the corpus's own line.
 *
 * **Read the source cell, never the row.** A pair holds the 原文 and its 譯文 in one `<li class="zj-pair">`,
 * so reading the row's textContent hands the card the book's own translation and the card then shows it
 * under 在這一章 as though 司馬光 had written it. The cell is the same reading `test/corpus.test.js` takes
 * from the markup, for the same reason.
 */
function sourceSentences() {
  return [...document.querySelectorAll('.zj-src .zj-pair__src')]
    .map((cell) => cell.textContent.trim())
    .filter(Boolean);
}

/** The chapter's 原文 as a list, built once: the card can open on any of ~600 characters. */
let sentenceCache = null;

function sentences() {
  if (!sentenceCache) sentenceCache = sourceSentences();
  return sentenceCache;
}

/**
 * `{ sentence, at }` for the pressed character — the 句 it stands in and its offset in that 句 — or
 * null when the press was not inside a 原文 cell at all (the 字詞 list prints a glyph with no sentence,
 * and a 詞 card is looked up by its own key).
 *
 * **Read the cell, never the row**, for the same reason `sourceSentences` does. `at` is the offset of
 * the pressed element's own text, taken by adding up the text of the cell's preceding children: every
 * character of the 原文 is wrapped in its own `<tb-char>`, every wrapper is a direct child of the cell,
 * and a press on the button inside one arrives with that wrapper as its nearest `tb-char`.
 *
 * Bound: a wrapper nested deeper than a direct child would give the offset of the child that holds it,
 * which is still inside the same clause, so the citation match below can only be narrowed, never
 * turned into a match on a different part of the sentence.
 */
function occurrenceOf(el, key) {
  const cell = el?.closest?.('.zj-src .zj-pair__src');
  if (!cell) return null;
  const sentence = cell.textContent ?? '';
  let at = -1;
  let n = 0;
  for (const node of cell.childNodes ?? []) {
    if (node === el || (typeof node.contains === 'function' && node.contains(el))) { at = n; break; }
    n += (node.textContent ?? '').length;
  }
  if (at < 0) return null;
  return { sentence, at: sentence.startsWith(key, at) ? at : sentence.indexOf(key) };
}

// Two characters in one chapter can share every sentence a third of the way down, so the 在这一章 list is
// the one part of the card whose length is not bounded by the entry. Measured on chapter 2 before this:
// 智 produced seven lines and the list alone was 281 px of a 468 px card, and 子 appeared in six
// sentences of up to eighty characters for 2,731 px. The card is also narrower than the phone's — the
// shared popover clamps it to the term's own width, 299 px in a 1440 px column — so a line here is about
// eleven characters.
//
// A quotation in that list needs only enough of the sentence to place the character, so the list carries
// the clause the character stands in — the text between the punctuation marks around it — with an
// ellipsis where the clause was cut out of a longer sentence. The 通鉴用例 above it keeps its whole
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

// The card's 在这一章 section is bounded on both axes: at most three clauses of at most CLAUSE_MAX
// characters, and at most three of the 词 the chapter links to it. `chars.js` may name six (智 names 智宣子,
// 智果, 智伯, 智襄子, 智国, 智氏), and a card that lists all six plus three clauses is 400 px of list on
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
 * The use the entry's own examples cite for this occurrence, or null when they do not say.
 *
 * An example is the attestation: the entry that files 「簡子使尹鐸為晉陽」 under 派遣 shǐ has said which
 * sense that sentence takes, and that is the only authority in the data that can tell one occurrence of
 * a 多音字 from another. A citation pins an occurrence when all three of these hold, and each is a way
 * the data declines to answer rather than a way for the card to guess:
 *
 *   - the example is a span of this very 句, found at a known offset;
 *   - the occurrence lies INSIDE that span, so the example is an attestation of this occurrence and not
 *     merely of a sentence the character also appears in;
 *   - the example prints the character exactly once. 「使使者致萬家之邑於智伯」 holds 使 twice, once
 *     派遣 and once 使者, so it does not say which of them it attests, and a card that picked one would
 *     be inventing the distinction the citation fails to draw.
 *
 * Two citations that disagree about the reading leave the occurrence unresolved as well: the entry
 * speaks with two voices there, and the card does not pick a favourite between them.
 *
 * Bound: only the occurrences an example happens to cover can be resolved this way. On these three
 * pages that is 34 of the 82 clicks on a character with two readings (out/cardreading/polyphonic.mjs);
 * the rest fall back to the sense `chars.js` binds, and `test/lexicon.test.js` prints how many.
 */
function citedUse(uses, key, sentence, at) {
  if (!sentence || at < 0) return null;
  const hits = [];
  for (const use of uses) {
    for (const ex of use.examples ?? []) {
      if (!ex.text) continue;
      const p = sentence.indexOf(ex.text);
      if (p < 0 || at < p || at >= p + ex.text.length) continue;
      if (ex.text.split(key).length - 1 !== 1) continue;
      hits.push(use);
      break;
    }
  }
  if (!hits.length) return null;
  const readings = new Set(hits.map((u) => u.reading ?? ''));
  return readings.size > 1 ? null : hits[0];
}

/**
 * The sense this occurrence takes, and everything that follows from it.
 *
 * A character carries every sense it has in 通鉴. Which one this occurrence takes is settled in this
 * order, and the order is the point: the entry's own example for this very sentence first, because it
 * is evidence about this occurrence; then the sense `chars.js` binds for the chapter, which is the
 * chapter's declared reading of the character; then the entry's only sense, when there is no choice to
 * make. When none of the three answers and the entry has several senses, the card has no sense to show
 * — see `unbound` in `cardHtml` for what it prints instead of inventing one.
 */
function normalise(key, kind, occurrence) {
  if (!store) return null;
  const [first, second] = layerFor(key, kind);
  const entry = store[first][key] ?? store[second][key];
  if (!entry) return null;
  const declared = store.chars[key] ?? {};
  const uses = Array.isArray(entry.uses) ? entry.uses : [];
  const named = declaredUseOf(occurrence);
  const where = occurrenceOf(pressedIn(occurrence), key);
  const cited = citedUse(uses, key, where ? where.sentence : '', where ? where.at : -1);
  const bound = (declared.use && uses.find((u) => u.id === declared.use)) || null;
  const occurrenceUse = (named && uses.find((u) => u.id === named)) || null;
  // The occurrence's own statement first: it names THIS occurrence, where a citation names the 句 and
  // the chapter's 字表 names the chapter. A use id that no use carries is not a claim, so it is dropped
  // rather than honoured — the data said something the entry does not support.
  const use = occurrenceUse ?? cited ?? bound ?? (uses.length === 1 ? uses[0] : null);
  // Nothing to show and more than one sense to choose from: the entry's first sense is the entry's, not
  // this sentence's, and presenting it as this sentence's is the defect this whole file is answering.
  const unbound = !use && uses.length > 1;
  const clauses = hereLines(key, declared);
  const linked = Array.isArray(declared.word) ? declared.word : [];
  const readings = Array.isArray(entry.readings) ? entry.readings : [];
  // The reading is the SHOWN sense's own, and `entry.pinyin` is only its default. A 多音字 declares a
  // `reading` per use for exactly this reason: printing the entry's pinyin over a sense that reads
  // otherwise is the card contradicting itself in one popover, 「使 shǐ」 above a gloss of 「出使。」
  // whose own note says 「读 shì」.
  const single = use ? (use.reading ?? entry.pinyin ?? '') : (uses.length <= 1 ? (entry.pinyin ?? '') : '');
  // And the 词性 is the shown sense's own, by the same rule and for the same reason: the entry's `pos`
  // is its dominant sense's class, so printing it over another sense's gloss is the same contradiction
  // one field over (相 「辅佐之臣；国相」 labelled 副). The fallback stands only where the use declares
  // no class of its own — the case where the two agree — and an unbound card claims none, because with
  // no sense chosen the entry's class is a claim about a sense nobody picked.
  const cls = use ? (use.pos ?? entry.pos ?? '') : (uses.length <= 1 ? (entry.pos ?? '') : '');
  return {
    key,
    layer: store[first][key] ? first : second,
    glyph: key,
    pinyin: single || readings.join(' / ') || (entry.pinyin ?? ''),
    others: single ? readings.filter((r) => r !== single) : [],
    variants: Array.isArray(entry.variants) ? entry.variants : [],
    pos: cls,
    gloss: (use ? use.gloss : entry.gloss) ?? '',
    note: (use ? use.note : entry.note) ?? entry.note ?? '',
    examples: (use ? use.examples : entry.examples) ?? [],
    senses: unbound ? uses.map((u) => u.gloss) : [],
    unbound,
    clauses,
    words: linked,
  };
}

/**
 * The card, as the popover's inner HTML.
 *
 * Two scripts, one card, and `lang` is what says which run is which. The book's own voice — its gloss,
 * its note, and the card's labels (通鉴用例, 在这一章, 又读, 异体, 本章字词) — is Simplified, because the
 * reader reads the book in Simplified. What the card PRINTS OF 通鑑 is not: the glyph above the card is
 * the character as the page prints it, a 通鑑用例 is a quotation of the received text, and the clauses
 * under 在这一章 are cut from the page's own 原文. Those runs carry `lang="zh-Hant"` so a screen reader
 * changes voice for them, which is the whole reason the attribute exists here.
 * (Owner's instruction, 2026-09-18: the original text may stay Traditional; the textbook and especially
 * the translation must be Simplified.)
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
  if (entry.others.length) {
    extras.push(`<span class="zj-card__reading">又读 ${esc(entry.others.join('、'))}</span>`);
  }
  if (entry.variants.length) {
    extras.push(`<span class="zj-card__reading">异体 ${esc(entry.variants.join('、'))}</span>`);
  }
  // One row, not one row each: two half-empty lines cost 34 px of a card that has to fit a phone.
  if (extras.length) parts.push(`<span class="zj-card__readings">${extras.join('')}</span>`);

  if (entry.unbound) {
    // A character with several senses and nothing bound to THIS occurrence. `uses[0]` is the entry's
    // first sense, not this sentence's, and printing it as the meaning of the place the reader clicked
    // is a claim the data has not made: 文 in 「巧文辯慧則賢」 opened 「人名。周文王」, 智 in 「智不能周」
    // opened 「智氏，晋国大夫的家族」. The card states the gap and puts the senses where the gloss goes,
    // one line each, so the reader can see what the choice would have been.
    parts.push('<span class="zj-card__gloss">此处义项未定。</span>');
    parts.push(`<span class="zj-card__note">本章这个字有 ${entry.senses.length} 个义项，字表没有为这一处绑定其中的一个，卡片也就不替它选：</span>`);
    parts.push('<span class="zj-card__sec">本章义项</span>');
    const senses = entry.senses.map((gloss) => '<span class="zj-card__ex">'
      + `<span class="zj-card__ex-text">${esc(gloss)}</span></span>`);
    parts.push(`<span class="zj-card__exs">${senses.join('')}</span>`);
  } else {
    parts.push(`<span class="zj-card__gloss">${esc(entry.gloss)}</span>`);
    if (entry.note) parts.push(`<span class="zj-card__note">${esc(entry.note)}</span>`);

    // The 通鉴用例 section stands only when there is a quotation to stand under it. A use with none says
    // nothing here, and the sentence that used to stand in its place — 「他处用例尚未检得。」 — is gone:
    // it is a note about the state of the book's own research, printed where the reader is being told what
    // a word means, and it reads as a draft shipped by accident. A card that says nothing about other uses
    // is honest; one that announces the search is still running is not. Where the gap has a reason the
    // reader needs, the use's own note carries it (「本卷只此一见。」); 306 uses have no example and every
    // one of them has such a note, which `test/corpus.test.js` holds.
    if (entry.examples.length) {
      parts.push('<span class="zj-card__sec">通鉴用例</span>');
      // They share one flowing block rather than stacking: on the card's own 299 px two short quotations
      // fit on one line side by side, and a card that has to fit under a character cannot afford a line
      // break between two lines of eight characters.
      const quoted = entry.examples.map((ex) => '<span class="zj-card__ex">'
        + `<span class="zj-card__ex-text" lang="zh-Hant">${esc(ex.text)}</span>`
        + (ex.at ? `<span class="zj-card__ex-at">${esc(ex.at)}</span>` : '')
        + '</span>');
      parts.push(`<span class="zj-card__exs">${quoted.join('')}</span>`);
    }
  }

  if (entry.clauses.length || entry.words.length) {
    parts.push('<span class="zj-card__sec">在这一章</span>');
    const items = entry.clauses.map((s) => `<li lang="zh-Hant">${esc(s)}</li>`);
    // The label is the book's word, the term is 通鑑's, so they do not share a script.
    for (const w of entry.words.slice(0, HERE_WORDS_MAX)) items.push(`<li><span class="zj-card__here-word">词</span><span lang="zh-Hant">${esc(w)}</span></li>`);
    parts.push(`<ul class="zj-card__here">${items.join('')}</ul>`);
  }

  // The way back into the chapter. This used to point at `../#zj-<char>`, an index on the book's
  // contents page that nothing builds — so every card carried a link to an anchor that does not exist,
  // which `npm run check` cannot see (it verifies that an id in the same document is present, and a
  // cross-document fragment is invisible to it). Until the book has a real 字词索引, the link goes to
  // the chapter's own 字词 section, which does exist: it is one of the six frozen section ids.
  parts.push('<a class="zj-card__index" href="#notes">本章字词 →</a>');
  return parts.join('');
}

/** A character the lexicon has not reached yet: the card still opens, and says what is missing. */
function missingHtml(key) {
  return '<span class="zj-card__head" lang="zh-Hant">'
    + `<b class="zj-card__glyph">${esc(key)}</b>`
    + '</span>'
    + '<span class="zj-card__gloss">字词库尚未收录此字。</span>';
}

/**
 * Register one chapter's lexicon. Called by the page before `src/components/index.js` is imported, so
 * every <tb-char> on it finds the store the moment it upgrades.
 *
 * Nothing is installed on the document here. The card is built for the occurrence the component passes
 * it, so this book no longer listens for clicks to find out which one that was, and a page that never
 * registers a lexicon behaves exactly as it did.
 */
export function registerLexicon({ lexicon = {}, words = {}, chars = {}, chapter = '' } = {}) {
  store = { lexicon, words, chars, chapter };
  const registry = {
    chapter,
    lookup: (key, kind, occurrence) => normalise(key, kind, occurrence),
    card: (key, kind, occurrence) => {
      const entry = normalise(key, kind, occurrence);
      if (!entry) return { className: 'zj-card', html: missingHtml(key) };
      return { className: 'zj-card', html: cardHtml(entry) };
    },
  };
  textbook.lexicon = registry;
  return registry;
}

/** The store, for tests and for a page that wants to build a list from it. */
export function lexiconStore() {
  return store;
}
