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

// The words the shell says on every page of every book, per language, and what a page publishes to
// replace them.
//
// The shell mounts everywhere, so these were the words a reader of 通鑑 met in English on every surface
// the book does not author: `Library` and `Today` in the header of all three chapters, `In this
// chapter` in the section rail, and — the ones no screenshot can show — the accessible names of the
// theme toggle, the contents drawer, and the Today link's due count, which told a screen-reader user
// how much was waiting in English on a page written in Chinese. Same shape as `check.js`, `sort.js`
// and `figure.js`: English is the default, so an English page reads character for character as it did;
// the language is the page's own `<html lang>`; and a page may publish its own words on the handshake,
// merged one key at a time:
//
//   textbook.strings = { shell: { railTitle: '本卷目錄' } };
//
// **Keyed on the full tag first, then on the base language**, as `figure.js` is: a `zh-Hant` book
// writes 本章目錄 where this one writes 本章目录, and keying on `zh` alone would hand it the wrong
// script — the defect `figure.js` records for 圖 and 图. No zh-Hant book exists yet, so one `zh` block
// covers both Chinese surfaces today; the day one ships, its words go in a `'zh-hant'` block rather
// than in a translation of the prose. `Textbook` below stays English on purpose: it is the fallback for
// a page that passes no `book=`, which no page does, so no reader can reach it.
const SHELL_WORDS = {
  en: {
    contents: 'Open chapter contents',
    library: 'Library',
    today: 'Today',
    railTitle: 'In this chapter',
    themeDark: 'Switch to dark theme',
    themeLight: 'Switch to light theme',
    due: (n) => (n === 1 ? '1 objective due' : `${n} objectives due`),
  },
  zh: {
    // 书库 for the site's shelf of books, 今日 for the study page, 待复习 for what is waiting there: the
    // terse rubric register the book's own chrome uses (本章目录, 原文, 字词), not a sentence.
    contents: '打开本章目录',
    library: '书库',
    today: '今日',
    railTitle: '本章目录',
    themeDark: '切换到深色主题',
    themeLight: '切换到浅色主题',
    due: (n) => `${n}条待复习`,
  },
};

function shellWords() {
  const lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  const table = SHELL_WORDS[lang] ?? SHELL_WORDS[lang.split('-')[0]] ?? SHELL_WORDS.en;
  return { ...table, ...(textbook.strings?.shell || {}) };
}
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
    const words = shellWords();
    const book = this.getAttribute('book') || 'Textbook';
    const bookHref = this.getAttribute('book-href') || '../';
    const libraryHref = this.getAttribute('library-href') || '../../';
    const chapterLabel = this.getAttribute('chapter') || '';
    // Today is the study queue (docs/design/adaptive.md). It sits in the header on every page,
    // because the reader arrives wanting either to read or to practise, and the book should not make
    // them navigate to find out which. `aria-current` marks it when it is the page you are on.
    const todayHref = this.getAttribute('today-href') || `${libraryHref}today/`;
    const isToday = this.hasAttribute('is-today');
    const main = document.querySelector('main');
    const chapterNumber = main?.dataset.chapter;

    // Header
    const header = document.createElement('header');
    header.className = 'tb-header';
    header.innerHTML = `
      <button class="tb-iconbtn tb-navtoggle" type="button" aria-label="${words.contents}" aria-expanded="false">${MENU}</button>
      <a class="tb-header__book" href="${bookHref}">${book}</a>
      <div class="tb-header__crumb">${this.hasAttribute('no-crumb') ? '' : `<a href="${libraryHref}">${words.library}</a>${chapterLabel ? `<span class="tb-header__sep">/</span><span>${chapterLabel}</span>` : ''}`}</div>
      <a class="tb-header__today" href="${todayHref}"${isToday ? ' aria-current="page"' : ''}>${words.today}<span class="tb-header__due" hidden></span></a>
      <button class="tb-iconbtn tb-themetoggle" type="button" aria-label="${words.themeDark}"></button>
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
      toggle.setAttribute('aria-label', dark ? words.themeLight : words.themeDark);
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
        title.textContent = words.railTitle;
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
        // The contents drawer, below 800px. It is a drawer rather than a panel, so it owes the reader
        // everything a drawer owes: something to tap outside it, a page that does not scroll away
        // behind it, and focus that goes in and comes back. Without the first two it reads as broken,
        // which is how it was reported (docs/learning/defect-register.md, 2026-09-10).
        const navToggle = header.querySelector('.tb-navtoggle');
        const scrim = document.createElement('div');
        scrim.className = 'tb-scrim';
        scrim.hidden = true;
        document.body.append(scrim);
        let lastFocus = null;

        const setDrawer = (open) => {
          if (open === rail.classList.contains('is-open')) return;
          rail.classList.toggle('is-open', open);
          navToggle.setAttribute('aria-expanded', String(open));
          scrim.hidden = !open;
          // Lock the page behind the drawer. Without this a swipe meant for the contents scrolls the
          // article instead, which is the commonest way a drawer feels broken on a phone.
          document.documentElement.classList.toggle('tb-locked', open);
          if (open) {
            lastFocus = document.activeElement;
            (rail.querySelector('a') || rail).focus({ preventScroll: true });
          } else if (lastFocus && document.contains(lastFocus)) {
            lastFocus.focus({ preventScroll: true });
            lastFocus = null;
          }
        };

        navToggle.addEventListener('click', () => setDrawer(!rail.classList.contains('is-open')));
        scrim.addEventListener('click', () => setDrawer(false));
        rail.addEventListener('click', (e) => {
          if (e.target.closest('a')) setDrawer(false);
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && rail.classList.contains('is-open')) setDrawer(false);
        });
        // A drawer that is open when the screen becomes wide enough for the rail would leave the page
        // locked and a scrim over everything.
        matchMedia('(min-width: 800px)').addEventListener('change', (e) => {
          if (e.matches) setDrawer(false);
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

    // How many objectives are due, on the Today link. Loaded lazily and failing silently on purpose:
    // the shell must render on a page that never loads the study system, before the reader has any
    // history, and on the published site where there is no server. A missing badge is the correct
    // result in all three cases, and none of them is an error worth a console line.
    const due = header.querySelector('.tb-header__due');
    import('./learning/store.js')
      .then(({ store }) => {
        const paintDue = () => {
          const n = store.due(Date.now()).length;
          due.textContent = n ? String(n) : '';
          due.hidden = n === 0;
          due.setAttribute('aria-label', words.due(n));
        };
        paintDue();
        store.onChange(paintDue);
      })
      .catch(() => {});

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
