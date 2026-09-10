// The page shell: header, reading progress, the chapter rail built from the page's own sections,
// theme, and the handshake the gates wait on (window.__textbook).
//
// Handshake: window.__textbook.state is 'loading' until the shell has mounted and, under ?eager=1,
// every figure has reached ready or error. window.__textbook.whenReady() resolves then.
// window.__textbook.figures maps figure id -> { kind, state, number, error?, handle? }.

const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

const params = new URLSearchParams(location.search);
const EAGER = params.get('eager') === '1';

class Textbook {
  constructor() {
    this.state = 'loading';
    this.figures = {};
    this.glossary = {};
    this.eager = EAGER;
    this._resolveReady = null;
    this._ready = new Promise((resolve) => { this._resolveReady = resolve; });
    this._shellMounted = false;
  }

  whenReady() {
    return this._ready;
  }

  registerFigure(id, entry) {
    this.figures[id] = { ...(this.figures[id] || {}), ...entry };
    this._check();
  }

  updateFigure(id, patch) {
    this.figures[id] = { ...(this.figures[id] || {}), ...patch };
    this._check();
  }

  registerGlossary(entries) {
    for (const [ref, entry] of Object.entries(entries)) this.glossary[ref] = entry;
  }

  describeFigures() {
    const out = {};
    for (const el of document.querySelectorAll('tb-figure')) out[el.id] = el.describe ? el.describe() : { state: el.dataset.state };
    return out;
  }

  _shellReady() {
    this._shellMounted = true;
    this._check();
  }

  _check() {
    if (this.state === 'ready' || !this._shellMounted) return;
    if (EAGER) {
      // Every <tb-figure> on the page must have registered (the shell mounts before the figure element
      // is defined, so for a moment the DOM holds figures the registry has not seen) and then settled.
      const inDom = document.querySelectorAll('tb-figure').length;
      if (Object.keys(this.figures).length < inDom) return;
      const pending = Object.values(this.figures).filter((f) => f.state !== 'ready' && f.state !== 'error');
      if (pending.length) return;
    }
    this.state = 'ready';
    this._resolveReady();
  }
}

export const textbook = new Textbook();
window.__textbook = textbook;

// ---------- theme ----------
const THEME_KEY = 'tb-theme';

function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function applyTheme(theme, { persist = true } = {}) {
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
  if (persist) {
    try {
      if (theme) localStorage.setItem(THEME_KEY, theme);
      else localStorage.removeItem(THEME_KEY);
    } catch {
      // Storage may be unavailable; the theme still applies for this page.
    }
  }
  document.dispatchEvent(new CustomEvent('tb-theme-change', { detail: { theme: effectiveTheme() } }));
}

export function effectiveTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit) return explicit;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ?theme=dark|light on the URL wins for that page load (the gates use it) and is not remembered.
const urlTheme = params.get('theme');
if (urlTheme === 'dark' || urlTheme === 'light') applyTheme(urlTheme, { persist: false });
else if (storedTheme()) applyTheme(storedTheme(), { persist: false });

// ---------- the shell element ----------
class TbShell extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const book = this.getAttribute('book') || 'Textbook';
    const bookHref = this.getAttribute('book-href') || '../';
    const libraryHref = this.getAttribute('library-href') || '../../';
    const chapterLabel = this.getAttribute('chapter') || '';
    const main = document.querySelector('main');
    const chapterNumber = main?.dataset.chapter;

    // Header
    const header = document.createElement('header');
    header.className = 'tb-header';
    header.innerHTML = `
      <button class="tb-iconbtn tb-navtoggle" type="button" aria-label="Open chapter contents" aria-expanded="false">${MENU}</button>
      <a class="tb-header__book" href="${bookHref}">${book}</a>
      <div class="tb-header__crumb">${this.hasAttribute('no-crumb') ? '' : `<a href="${libraryHref}">Library</a>${chapterLabel ? `<span class="tb-header__sep">/</span><span>${chapterLabel}</span>` : ''}`}</div>
      <button class="tb-iconbtn tb-themetoggle" type="button" aria-label="Switch to dark theme"></button>
    `;
    const progress = document.createElement('div');
    progress.className = 'tb-progress';
    progress.innerHTML = '<div class="tb-progress__bar"></div>';
    this.replaceChildren(header, progress);

    // Theme toggle
    const toggle = header.querySelector('.tb-themetoggle');
    const paint = () => {
      const dark = effectiveTheme() === 'dark';
      toggle.innerHTML = dark ? SUN : MOON;
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    paint();
    toggle.addEventListener('click', () => {
      applyTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
      paint();
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!document.documentElement.dataset.theme) document.dispatchEvent(new CustomEvent('tb-theme-change', { detail: { theme: effectiveTheme() } }));
      paint();
    });

    // Section numbering and the rail
    if (main && chapterNumber) {
      const sections = Array.from(main.querySelectorAll(':scope > section[id], :scope > .tb-text > section[id]'));
      let n = 0;
      const rail = document.querySelector('.tb-rail');
      const list = document.createElement('ol');
      for (const section of sections) {
        const h2 = section.querySelector(':scope > h2');
        if (!h2) continue;
        const numbered = !section.hasAttribute('data-unnumbered');
        let label = '';
        if (numbered) {
          n += 1;
          label = `${chapterNumber}.${n}`;
          const span = document.createElement('span');
          span.className = 'n';
          span.textContent = label;
          h2.prepend(span);
          section.dataset.number = label;
        }
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${section.id}"><span class="n">${label}</span><span>${h2.textContent.replace(label, '').trim()}</span></a>`;
        const subs = Array.from(section.querySelectorAll(':scope > h3[id], :scope > * > h3[id]'));
        if (subs.length) {
          const sub = document.createElement('ol');
          for (const h3 of subs) sub.innerHTML += `<li><a href="#${h3.id}"><span>${h3.textContent}</span></a></li>`;
          li.append(sub);
        }
        list.append(li);
        section.__railItem = li;
      }
      if (rail) {
        const title = document.createElement('p');
        title.className = 'tb-rail__title';
        title.textContent = 'In this chapter';
        rail.replaceChildren(title, list);
        // Mark the section in view
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              for (const li of list.querySelectorAll('li.is-current')) li.classList.remove('is-current');
              e.target.__railItem?.classList.add('is-current');
            }
          }
        }, { rootMargin: '-20% 0px -70% 0px' });
        for (const s of sections) io.observe(s);
        // Mobile drawer
        const navToggle = header.querySelector('.tb-navtoggle');
        navToggle.addEventListener('click', () => {
          const open = rail.classList.toggle('is-open');
          navToggle.setAttribute('aria-expanded', String(open));
        });
        rail.addEventListener('click', (e) => {
          if (e.target.closest('a')) {
            rail.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }

    // Reading progress
    const bar = progress.querySelector('.tb-progress__bar');
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      bar.style.width = max > 0 ? `${Math.min(100, (doc.scrollTop / max) * 100)}%` : '0%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    textbook._shellReady();
  }
}

customElements.define('tb-shell', TbShell);

// Pages without a <tb-shell> (the lab) still need the handshake to resolve.
if (!document.querySelector('tb-shell')) {
  queueMicrotask(() => {
    if (!document.querySelector('tb-shell')) textbook._shellReady();
  });
}
