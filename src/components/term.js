// <tb-term ref="homeostasis">homeostasis</tb-term>
// <tb-char>為</tb-char>  ·  <tb-char for="為">爲</tb-char>
//
// A term or a character in the text. Both render as a button with a popover; hover, focus, tap, Enter
// or Space opens it, Escape or clicking elsewhere closes it.
//
// <tb-term> is the biology book's glossary term. Its definition comes from the chapter's glossary
// (registered on window.__textbook.glossary by the page), and the popover links to the entry in the
// end-of-chapter glossary (#term-<ref>). That behaviour, its DOM and its classes do not change.
//
// <tb-char> is 資治通鑑's character: its key is its own text (exactly one character) or its `for`
// attribute, and it opens the lexicon card. The card is not built here. A page that has a lexicon
// leaves a registry on the shared handshake object — `textbook.lexicon.card(key, kind)`, published by
// `tongjian/data/card.js` — and this file asks it for the popover's contents. A page without one (the
// biology book) never touches that path: `<tb-char>` opens nothing there, and `<tb-term>` renders
// exactly what it always rendered. `src/` therefore knows nothing about any book.
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

// The shared behaviour of anything in the text that opens a popover: the button, the four ways in, the
// one popover at a time, and the placement that keeps it inside the viewport. What differs between the
// two elements is three small things, and each is a method below.
class TbPopover extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const text = this.textContent;
    this.key = this.lookupKey();
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
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
    const canHover = !matchMedia('(pointer: coarse)').matches;
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
    this.append(pop);
    this.pop = pop;
    this.hoverOnly = hover;
    // Whether this card was deliberately opened rather than merely hovered. It is the flag the toggle
    // reads, and it is separate from `hoverOnly` because on a touch device a tap opens a card that is
    // neither: `hoverOnly` is false there, so a toggle keyed on it would pin an already-open card and the
    // second tap would do nothing. Found by walking the touch path after hover-to-open was disabled on
    // coarse pointers (docs/learning/defect-register.md, 2026-09-12).
    this.pinned = !hover;
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
  place() {
    const pop = this.pop;
    if (!pop) return;
    const margin = 8;
    const gap = 8;
    pop.style.left = '0px';
    pop.style.top = '';
    pop.style.maxHeight = '';
    const host = this.getBoundingClientRect();
    const box = pop.getBoundingClientRect();
    let left = 0;
    if (host.left + box.width > innerWidth - margin) left = innerWidth - margin - box.width - host.left;
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
    this.button.setAttribute('aria-expanded', 'false');
    this.button.removeAttribute('aria-describedby');
    if (openTerm === this) openTerm = null;
  }
}

export class TbTerm extends TbPopover {
  /** The glossary reference. A property as well as an attribute, as it always was. */
  get ref() {
    return this.getAttribute('ref');
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
    const card = registry ? registry.card(this.key, 'word') : null;
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
  lookupKey() {
    return this.getAttribute('for') || this.textContent.trim();
  }

  popoverId() {
    return `pop-char-${this.key}-${Math.random().toString(36).slice(2, 7)}`;
  }

  content() {
    const registry = this.lexicon();
    return registry ? registry.card(this.key, 'char') : null;
  }
}

export class TbGlossary extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const entries = Object.entries(textbook.glossary).sort((a, b) => a[1].term.localeCompare(b[1].term));
    const dl = document.createElement('dl');
    for (const [ref, { term, def }] of entries) {
      const dt = document.createElement('dt');
      dt.id = `term-${ref}`;
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.innerHTML = def;
      dl.append(dt, dd);
    }
    this.replaceChildren(dl);
  }
}

customElements.define('tb-term', TbTerm);
customElements.define('tb-char', TbChar);
customElements.define('tb-glossary', TbGlossary);
