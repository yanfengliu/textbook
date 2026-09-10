// <tb-term ref="homeostasis">homeostasis</tb-term>
//
// A glossary term in the prose. Renders as a button with a dotted underline; hover, focus, tap, Enter
// or Space opens a definition popover, Escape or clicking elsewhere closes it. The definition comes from
// the chapter's glossary (registered on window.__textbook.glossary by the page), and the popover links
// to the entry in the end-of-chapter glossary (#term-<ref>).
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

export class TbTerm extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const ref = this.getAttribute('ref');
    const text = this.textContent;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-expanded', 'false');
    this.replaceChildren(button);
    this.button = button;
    this.ref = ref;
    // Hover opens a popover that closes when the pointer leaves; a click pins it open until Escape or a
    // click elsewhere. A click while the hover popover is showing must pin, not close: the mouse arrives
    // before the click, so "toggle" would close what hover had just opened.
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.pop && !this.hoverOnly) this.close();
      else this.open();
    });
    button.addEventListener('mouseenter', () => this.open({ hover: true }));
    this.addEventListener('mouseleave', () => {
      if (this.hoverOnly) this.close();
    });
    button.addEventListener('focus', () => this.open({ hover: true }));
    button.addEventListener('blur', () => {
      if (this.hoverOnly) this.close();
    });
  }

  entry() {
    const e = textbook.glossary[this.ref];
    if (!e) return { term: this.ref, def: `No glossary entry for "${this.ref}" — the chapter's glossary.js should define it.` };
    return e;
  }

  open({ hover = false } = {}) {
    if (this.pop) {
      if (!hover) this.hoverOnly = false;
      return;
    }
    closeOpen();
    const { term, def } = this.entry();
    const pop = document.createElement('span');
    pop.className = 'tb-term__pop';
    pop.setAttribute('role', 'tooltip');
    pop.id = `pop-${this.ref}-${Math.random().toString(36).slice(2, 7)}`;
    pop.innerHTML = `<b>${term}</b>${def}<a href="#term-${this.ref}">In the glossary →</a>`;
    this.append(pop);
    this.pop = pop;
    this.hoverOnly = hover;
    this.button.setAttribute('aria-expanded', 'true');
    this.button.setAttribute('aria-describedby', pop.id);
    openTerm = this;
    // Keep the popover on screen.
    const r = pop.getBoundingClientRect();
    if (r.right > innerWidth - 8) pop.classList.add('is-right');
  }

  close() {
    if (!this.pop) return;
    this.pop.remove();
    this.pop = null;
    this.hoverOnly = false;
    this.button.setAttribute('aria-expanded', 'false');
    this.button.removeAttribute('aria-describedby');
    if (openTerm === this) openTerm = null;
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
customElements.define('tb-glossary', TbGlossary);
