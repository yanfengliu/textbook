// <tb-term ref="homeostasis">homeostasis</tb-term>
// <tb-char>為</tb-char>  ·  <tb-char for="為">爲</tb-char>
//
// A term or a character in the text. Both render as a button with a popover; hover, focus, tap, Enter
// or Space opens it, Escape or clicking elsewhere closes it.
//
// <tb-term> is the biology book's glossary term. Its definition comes from the chapter's glossary
// (registered on window.__textbook.glossary by the page), and the popover links to the entry in the
// end-of-chapter glossary (#term-<ref>). That behaviour, its DOM and its classes do not change. Its
// label keeps the sub- and superscripts, italics and bold it was written with (LABEL_TAGS, below).
//
// <tb-char> is 資治通鑑's character: its key is its own text (exactly one character) or its `for`
// attribute, and it opens the lexicon card. The card is not built here. A page that has a lexicon
// leaves a registry on the shared handshake object — `textbook.lexicon.card(key, kind, occurrence)`,
// published by `tongjian/data/card.js` — and this file asks it for the popover's contents, handing over
// the element itself: which occurrence of a character the reader pressed is the one thing the page's
// own 字表 cannot say, and the lexicon card is built for a 句 rather than for a chapter. A page without
// a registry (the biology book) never touches that path: `<tb-char>` opens nothing there, and
// `<tb-term>` opens the glossary card it always opened. `src/` therefore knows nothing about any book.
//
// <tb-glossary> renders every registered entry, alphabetically, as a definition list.

import { textbook } from '../shell.js';

let openTerm = null;

function closeOpen() {
  if (openTerm) {
    openTerm.close();
    openTerm = null;
  }
}

document.addEventListener('click', (e) => {
  if (openTerm && !openTerm.contains(e.target)) closeOpen();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOpen();
});

// Where a card waits while it is measured: far past the page's start edge. A box past the page's end
// edge widens the page, and on a phone that moves the very width the card is clamped to (see `place()`).
// A box past the start edge widens nothing, because a page cannot be scrolled to that side.
const OFF_PAGE = '-100000px';

// The shared behaviour of anything in the text that opens a popover: the button, the four ways in, the
// one popover at a time, and the placement that keeps it inside the viewport. What differs between the
// two elements is a few small things, and each is a method below.
class TbPopover extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    this.key = this.lookupKey();
    const button = document.createElement('button');
    button.type = 'button';
    this.fillLabel(button);
    button.setAttribute('aria-expanded', 'false');
    this.replaceChildren(button);
    this.button = button;
    // Hover opens a popover that closes when the pointer leaves; a click pins it open until Escape or a
    // click elsewhere. A click while the hover popover is showing must pin, not close: the mouse arrives
    // before the click, so "toggle" would close what hover had just opened.
    //
    // **A touch device has no hover, and pretending otherwise broke the tap.** A tap is a hover and a
    // click in one gesture: the browser sends `mouseenter`, then `mouseleave` and `blur` as the finger
    // lifts, and only then a `click` — and on a 390 px phone one term in 172 got its `mousedown` and
    // `click` delivered to the surrounding `<li>` rather than to the button, because the hover popover
    // had opened, moved the line, and left the button no longer under the point. The measured trace was
    // `open({hover:true}) → close() → open({hover:true}) → close()`, nothing in the DOM afterwards, and
    // `npm run devices` reported it as "tapping a glossary term opened no definition".
    //
    // So hover-to-open is attached only where a hover exists. `pointer: coarse` is the browser's own
    // statement that the primary pointer cannot hover, which is exactly the case this is about; a mouse,
    // a trackpad and a stylus that hovers all keep the behaviour they had. The popover's touch path is
    // then the click alone, which is one event with nothing to race.
    //
    // **A character does not open on hover; a glossary term does.** The first version attached hover to
    // both, on the reasoning that a term's hover-to-read is the biology book's behaviour and a character
    // is the same kind of thing. It is not, and the difference is one of scale. An independent reader
    // reported, in their words: *"Moving the mouse across 原文 characters with no clicks opened 14 cards
    // in 14 cursor positions… Chapter 2 has 1,291 clickable characters. My mouse brushed text on the way
    // to the scrollbar and cards fired over the paragraph I was reading. The phone was the better read."*
    // A term is a handful per chapter and a reader may reasonably want its gloss without committing a
    // click; 1,291 of them in a 37,000-pixel column turns the pointer into a trigger, and the page fights
    // the reader. So the hover path is `TbTerm`'s alone, and `TbChar` opens on click.
    //
    // This defect is invisible to every gate in this repository: `narrow` and `devices` set a narrow
    // viewport on a desktop browser, which still has a mouse and `pointer: fine`, and the touch arms have
    // no desktop-hover counterpart. It was found by a person reading.
    const canHover = this.hoverable() && !matchMedia('(pointer: coarse)').matches;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.pop && this.pinned) this.close();
      else this.open();
    });
    if (canHover) {
      button.addEventListener('mouseenter', () => this.open({ hover: true }));
      this.addEventListener('mouseleave', () => {
        if (this.hoverOnly) this.close();
      });
      button.addEventListener('focus', () => this.open({ hover: true }));
      button.addEventListener('blur', () => {
        if (this.hoverOnly) this.close();
      });
    }
  }

  /** Whether a pointer resting on this opens its card. A term does; a single character does not. */
  hoverable() {
    return true;
  }

  /** Put what the reader sees into the button: the element's text. A term keeps some markup too. */
  fillLabel(button) {
    button.textContent = this.textContent;
  }

  /** What the popover is about: a reference for a term, a character or a `for` attribute. */
  lookupKey() {
    return this.textContent;
  }

  /** The registry a lexicon page left on the handshake object, or null. */
  lexicon() {
    return textbook.lexicon ?? null;
  }

  popoverId() {
    return `pop-${this.key}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /** What goes in the popover: { className, html }, or null for no popover at all. */
  content() {
    return null;
  }

  open({ hover = false } = {}) {
    if (this.pop) {
      // Already open. A deliberate open turns a hover into a pin; a hover must NOT turn a pin back into a
      // hover, which is what it used to do: pointer-leave closes the card, the pointer then crosses the
      // card on its way back to the term, the button's `mouseenter` fires, and the pin was cleared — so
      // the second click re-pinned instead of closing and the card could not be dismissed by clicking it.
      // Measured on the mouse path: `mouse: a second click closes` failed while every other path passed.
      if (!hover) {
        this.hoverOnly = false;
        this.pinned = true;
      }
      return;
    }
    const content = this.content();
    if (!content) return;
    closeOpen();
    const pop = document.createElement('span');
    pop.className = content.className ? `tb-term__pop ${content.className}` : 'tb-term__pop';
    pop.setAttribute('role', 'tooltip');
    pop.id = this.popoverId();
    pop.innerHTML = content.html;
    // Created parked, so the card is never on the page at the stylesheet's `left: 0` before `place()`.
    pop.style.left = OFF_PAGE;
    this.append(pop);
    this.pop = pop;
    this.hoverOnly = hover;
    // Whether this card was deliberately opened rather than merely hovered. It is the flag the toggle
    // reads, and it is separate from `hoverOnly` because on a touch device a tap opens a card that is
    // neither: `hoverOnly` is false there, so a toggle keyed on it would pin an already-open card and the
    // second tap would do nothing. Found by walking the touch path after hover-to-open was disabled on
    // coarse pointers (docs/learning/defect-register.md, 2026-09-12).
    this.pinned = !hover;
    // **A card closes when the READER scrolls, and not when the page does.** A card left open while its
    // anchor leaves the viewport hangs off the screen and then swallows the next tap on whatever character
    // it covers, so something must dismiss it.
    //
    // The first version listened for `scroll`, which fires for a programmatic `scrollIntoView` as well —
    // and a page that settles its layout after load fires one too. Measured: a hover-opened glossary term
    // on the biology book was closed by a scroll nobody performed, and on this book a probe that scrolls
    // each term into view before pressing it closed the card it had just opened, at one term in 172,
    // nondeterministically. A distance guard on the event did not fix it, because the scroll was real.
    //
    // So the listener is on the reader's own gestures — a wheel, a finger, or a key that scrolls — which
    // are exactly the moments a reader has deliberately moved the page away from the card. `pointerdown`
    // is deliberately NOT among them: the press that opens the next card would close it.
    const closeOnGesture = () => this.close();
    const SCROLL_KEYS = [' ', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    const onKey = (e) => {
      if (SCROLL_KEYS.includes(e.key)) this.close();
    };
    addEventListener('wheel', closeOnGesture, { once: true, passive: true });
    addEventListener('touchmove', closeOnGesture, { once: true, passive: true });
    addEventListener('keydown', onKey, { once: true });
    this.__closeOnGesture = () => {
      removeEventListener('wheel', closeOnGesture);
      removeEventListener('touchmove', closeOnGesture);
      removeEventListener('keydown', onKey);
    };
    this.button.setAttribute('aria-expanded', 'true');
    this.button.setAttribute('aria-describedby', pop.id);
    openTerm = this;
    this.place();
    // The card is measured in the face it will be drawn in. On a first visit the webfont may swap in
    // after the click, which changes the height of every line in the card; re-placing when the fonts
    // settle keeps it inside the window either way.
    document.fonts?.ready.then(() => {
      if (this.pop) this.place();
    });
  }

  // Keep the popover inside the viewport on both sides. The popover is positioned against the term,
  // which can sit anywhere on a line, and on a phone it is wider than the space on either side of most
  // terms; so it is nudged along its own axis until both edges are in, rather than flipped from one
  // anchor to the other. Flipping cannot help a box wider than both gaps, which is why the first
  // version pushed a mid-line term's definition off the left edge.
  //
  // **On a phone the width to stay inside is the visual viewport's, and the card must never widen the
  // page on its way there.** This used to put the card at `left: 0`, measure it, and clamp it against
  // `innerWidth`. From a term mid-line, `left: 0` runs the card past the right edge. A mobile browser
  // takes that overflow in by growing its layout viewport, and `innerWidth` reports the layout
  // viewport, so the clamp read a width the card had just inflated. Measured under Chromium's mobile
  // emulation at 390 px on 2026-09-23: 33 of chapter 5's 46 cards and 32 of chapter 6's 50 ended off the
  // right edge with the page scrolling sideways. Chapter 5's NAD⁺ card sat at 63–415 px with `innerWidth`
  // at 415, while `visualViewport.width` and the root's `clientWidth` stayed 390. A 390 px desktop window
  // put the same card at 30–382, because a desktop's layout viewport does not grow. `npm run devices`
  // passed it: it measures a card against `innerWidth`, and checks for sideways scroll before any card is
  // open.
  //
  // So the card is parked at OFF_PAGE whenever it is measured, and the clamp reads the visual viewport's
  // width, falling back to the root's `clientWidth`. The vertical room below still reads `innerHeight`,
  // which grew only in proportion to the width (844 to 899 px with the width at 415).
  place() {
    const pop = this.pop;
    if (!pop) return;
    const margin = 8;
    const gap = 8;
    // Parked before anything is read: reading a size forces a layout, and a card still where it was
    // would be laid out there. After the fonts settle the term may have moved, taking the card with it.
    pop.style.left = OFF_PAGE;
    pop.style.top = '';
    pop.style.maxHeight = '';
    const view = window.visualViewport?.width ?? document.documentElement.clientWidth;
    const host = this.getBoundingClientRect();
    const box = pop.getBoundingClientRect();
    let left = 0;
    if (host.left + box.width > view - margin) left = view - margin - box.width - host.left;
    if (host.left + left < margin) left = margin - host.left;
    pop.style.left = `${Math.round(left)}px`;

    // Vertically the popover hangs below its term, and a term low on the screen used to put the foot of
    // the card past the bottom of the window: measured at 390 px, the 為 card ended 80 px below it and
    // the way back into the chapter was in the part nobody could see.
    //
    // Every number here is measured, never derived from the term's box. `top: 100%` resolves against the
    // inline containing block, whose height carries the line's leading — 36 px against the term's own
    // 26 px box at 390 px — so the card lands about ten pixels lower than the term's bottom edge, and a
    // placement computed from `host.bottom` was still 28 px past the window after it had been capped.
    // `box.top` is where the card actually is.
    const lift = (px) => {
      pop.style.top = px ? `calc(100% + ${gap}px - ${Math.round(px)}px)` : '';
    };
    const roomBelow = innerHeight - margin - box.top;
    if (box.height > roomBelow) {
      // Above the term, clear of it: merely sliding the card up would cover the character it belongs
      // to and take the click that pins it.
      const aboveTop = host.top - gap - box.height;
      if (aboveTop >= margin) {
        lift(box.top - aboveTop);
      } else if (roomBelow >= margin * 2) {
        // Neither side holds it. Keep it below and let it take the room there is; zj.css caps it too,
        // so a short window never shows a card taller than itself.
        pop.style.maxHeight = `${Math.round(roomBelow)}px`;
      } else {
        lift(box.top - margin);
        pop.style.maxHeight = `${Math.round(innerHeight - margin * 2)}px`;
      }
    }
  }

  close() {
    if (!this.pop) return;
    this.pop.remove();
    this.pop = null;
    this.hoverOnly = false;
    this.pinned = false;
    // The gesture listeners are `once` and re-armed by the next open, so a card that closes any other way
    // must take them off or a stale one would close the following card the moment a reader scrolls.
    if (this.__closeOnGesture) this.__closeOnGesture();
    this.button.setAttribute('aria-expanded', 'false');
    this.button.removeAttribute('aria-describedby');
    if (openTerm === this) openTerm = null;
  }
}

// What a term's label keeps of the markup it was written with. A super- or subscript in the prose is
// markup, never a precomposed character (docs/design/chapter-recipe.md §7), and a term is a word of the
// prose, so `NAD<sup>+</sup>` has to reach the reader as the NAD⁺ the sentence around it would set. The
// label used to be the element's `textContent`, which set chapter 5's NAD<sup>+</sup> as "NAD+", and
// chapter 6's NADP⁺, C₃ plant, C₄ plant and cytochrome b₆f flat in the same way.
//
// The list is explicit although the content is authored. A tag off it is dropped and what it held is
// copied by the same rule, so its text stays. A kept tag is rebuilt bare, with none of its attributes.
// The button is still named from the text inside it, so its accessible name has not moved: Chrome's
// names for all 96 term buttons of chapters 5 and 6 were the same before and after (2026-09-23).
//
// The popover's heading is a different thing and stays text. It is the glossary entry's `term`, which
// `checkGlossaryTerms` in tools/check-content.js keeps free of tags because every popover sets it as text.
const LABEL_TAGS = new Set(['sub', 'sup', 'i', 'em', 'b', 'strong']);

/** Copy `from`'s children into `into`, keeping LABEL_TAGS as elements and anything else as its text. */
function copyLabel(from, into) {
  for (const node of from.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      into.append(node.data);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (LABEL_TAGS.has(node.localName)) {
        const kept = document.createElement(node.localName);
        copyLabel(node, kept);
        into.append(kept);
      } else {
        copyLabel(node, into);
      }
    }
  }
}

export class TbTerm extends TbPopover {
  /** The glossary reference. A property as well as an attribute, as it always was. */
  get ref() {
    return this.getAttribute('ref');
  }

  /** The label as it was written, less every tag LABEL_TAGS does not name. */
  fillLabel(button) {
    copyLabel(this, button);
  }

  lookupKey() {
    return this.getAttribute('word') || this.getAttribute('ref') || this.textContent;
  }

  popoverId() {
    return `pop-${this.getAttribute('ref')}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Escape text going into the popover's HTML. A glossary `term` is authored data, not markup. */
  esc(value) {
    return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  entry() {
    const ref = this.getAttribute('ref');
    const e = textbook.glossary[ref];
    if (!e) return { term: ref, def: `No glossary entry for "${ref}" — the chapter's glossary.js should define it.` };
    return e;
  }

  /** The rich card when the page's lexicon has this word; the glossary definition otherwise. */
  content() {
    const registry = this.lexicon();
    // The element, not just the key: a 詞 has senses a chapter cannot choose between either — 桓子 is
    // 魏桓子 in one sentence and 趙桓子 in the next — and the card reads the 句 off the element it is
    // given. A registry that ignores the third argument renders exactly what it rendered before.
    const card = registry ? registry.card(this.key, 'word', this) : null;
    if (card) return card;
    const ref = this.getAttribute('ref');
    const { term, def } = this.entry();
    // `term` is escaped and `def` is not: a `def` carries authored inline markup (`<b>`, `<i>`, links) by
    // design, while `term` is a label. When this was rewritten for the rich card the escaping on `term`
    // was dropped, which put an authored string into the popover as HTML.
    return { className: '', html: `<b>${this.esc(term)}</b>${def}<a href="#term-${encodeURIComponent(ref)}">In the glossary →</a>` };
  }
}

export class TbChar extends TbPopover {
  /** A character opens on click, never on hover — see the note in `TbPopover.connectedCallback`. */
  hoverable() {
    return false;
  }

  lookupKey() {
    return this.getAttribute('for') || this.textContent.trim();
  }

  popoverId() {
    return `pop-char-${this.key}-${Math.random().toString(36).slice(2, 7)}`;
  }

  content() {
    const registry = this.lexicon();
    // Hand over the element: the card is built for the occurrence the reader pressed, and the element is
    // also what may carry that occurrence's own `use="…"` — 「況君相乎」 in a chapter whose 字表 binds 相
    // to 互相 xiāng. See the note in `tongjian/data/card.js`.
    return registry ? registry.card(this.key, 'char', this) : null;
  }
}

// One <dl> of an entry each, sorted as it always was. Every word of the list is here, in both
// renderings: the index above it is a way in, never a replacement for a line of it.
function buildList(entries) {
  const dl = document.createElement('dl');
  for (const [ref, entry] of entries) {
    const { term, def } = entry;
    const dt = document.createElement('dt');
    dt.id = `term-${ref}`;
    dt.textContent = term;
    // A glossary entry may declare which house it belongs to, and the book colours it by that house.
    // The hook is here rather than in a chapter's markup because the glossary is the one place the book
    // already knows: 智伯, 智宣子, 魏斯, 赵籍 and 韩虔 are keys in the chapter's own `glossary.js`, so
    // the colour cannot drift from what the page says. 資治通鑑's four houses are the book's cast, and a
    // reader meeting 智 for the first time in a 72-entry list of names has no way to tell the family
    // that was annihilated from the three that divided it except by reading every entry.
    if (entry.state) dt.dataset.state = entry.state;
    const dd = document.createElement('dd');
    dd.innerHTML = def;
    dl.append(dt, dd);
  }
  return dl;
}

/** A Han character. The 字詞 list is made of these, and the biology book's head-words are not. */
const HAN = /\p{Script=Han}/u;

// The two words the index prints — the rubric over it and its accessible name — keyed on the page's own
// `<html lang>` the way FIGURE_WORDS is, with English as the fallback. The element is shared with the
// biology book; what is not shared is a page that asks for an index of Han head-words. 首字 is the same
// word in both Chinese scripts, so the tag's script half does not matter here.
const INDEX_WORDS = { en: 'First character', zh: '首字' };
const INDEX_NAMES = { en: 'Index by first character', zh: '首字索引' };

function indexWords() {
  const lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  const pick = (table) => table[lang] ?? table[lang.split('-')[0]] ?? table.en;
  return { label: pick(INDEX_WORDS), name: pick(INDEX_NAMES) };
}

/**
 * The runs of head-words that begin with the same character: what the index is built from, as
 * `{ initial, ref, n }` — the character, the entry a press lands on, and how many entries share it.
 *
 * **Null when the list has an order a reader can already scan.** The list
 * is sorted by `localeCompare`, and for Latin head-words that is the alphabet: a reader looking for
 * `Homeostasis` scans the h's. For Han head-words the same call returns ICU's radical-and-stroke order,
 * which is not pinyin and not anything a reader can predict — chapter 2's 72 entries come out
 * 三版 不如 二心 人臣 代成君 … 飲器 驂乘 魏斯 魏桓子 — so the list has no visible order at all and
 * needs one built from the head-words themselves. Measured: 72 of 72 head-words in chapter 2 and 31 of
 * 31 in chapter 3 begin with a Han character, and 0 of 31 in the biology book's chapter 1, whose list
 * therefore renders exactly as it always has.
 *
 * A run is contiguous because a character-by-character collation keeps equal first characters
 * together; measured on both chapters, no character's entries are split (out/wordlist/order.mjs). A
 * collation that did split one would give that character two index links, which is a worse index and
 * not a lost entry.
 */
function initialRuns(entries) {
  const runs = [];
  for (const [ref, entry] of entries) {
    const initial = [...String(entry.term ?? '')][0] ?? '';
    if (!HAN.test(initial)) return null;
    const last = runs[runs.length - 1];
    if (last && last.initial === initial) last.n += 1;
    else runs.push({ initial, ref, n: 1 });
  }
  return runs;
}

/**
 * The way into the list: one link per run, named by the character that run begins with.
 *
 * This is the whole fix for the defect a reader reported — *"72 entries, 5,863px tall, in one unbroken
 * column, with no grouping, index or jump. I read about 20 of 72 and scrolled the rest. The sentence
 * that actually unlocked chapter 2 is buried in the back half of it."* Chapter 2 has 59 distinct first
 * characters for its 72 entries, so the index is a run of 59 glyphs — two lines at a desktop measure
 * against a 5,263 px list — and 智, 趙, 韓 and 魏 lead the entries that belong to each house, which the
 * sort keeps together. A count rides on the runs of more than one, because that is where a reader's
 * question is: 智⁶ is six entries about one family, and 智伯, 智襄子 and 智瑤 are three of them.
 *
 * What is deliberately NOT here: a heading per run. Measured by inserting one rubric heading before the
 * first entry of every run (out/wordlist/headings.mjs), chapter 2's 59 runs take its list from 5,263 px
 * to 7,931 px and chapter 3's 30 runs take its from 2,088 px to 3,445 px — headings that repeat the first
 * character of the head-word underneath them. The index carries the structure; the entries stay a list.
 */
function buildIndex(runs) {
  const { label: labelWord, name } = indexWords();
  const nav = document.createElement('nav');
  nav.className = 'tb-gloss__index';
  nav.setAttribute('aria-label', name);
  const label = document.createElement('span');
  label.className = 'tb-gloss__index-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = labelWord;
  nav.append(label);
  for (const { initial, ref, n } of runs) {
    const a = document.createElement('a');
    a.href = `#term-${encodeURIComponent(ref)}`;
    a.textContent = initial;
    if (n > 1) {
      const count = document.createElement('sup');
      count.textContent = String(n);
      a.append(count);
    }
    nav.append(a);
  }
  return nav;
}

/**
 * The number of entries below which a list gets no index, because the list is one screen and there is
 * nothing to jump past. Measured: chapter 2's 72 entries are 8,527 px at a 390 px phone, so a row is
 * 118 px and a 390 × 844 window holds seven of them; eight is the first count that cannot be seen at
 * once. A count rather than a measured height, because the index is built before the list is laid out and
 * a control that appeared and disappeared as the window changed would be worse than one that is either
 * there or not. Chapter 1's own glossary — two entries, 大夫 and 諸侯 — is the case this is for: an index
 * of 大 and 諸 over a list of two is a line of type that saves no scroll.
 */
const INDEX_FLOOR = 8;

export class TbGlossary extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const entries = Object.entries(textbook.glossary).sort((a, b) => a[1].term.localeCompare(b[1].term));
    const runs = entries.length >= INDEX_FLOOR ? initialRuns(entries) : null;
    // The index is additive in the DOM as well as on the page: the list is the same element it always
    // was, and a glossary this is not for gets that element alone.
    this.replaceChildren(...(runs ? [buildIndex(runs), buildList(entries)] : [buildList(entries)]));
  }
}

customElements.define('tb-term', TbTerm);
customElements.define('tb-char', TbChar);
customElements.define('tb-glossary', TbGlossary);
