// <tb-figure kind="cell3d" id="fig-cell" width="wide" data-alt="...">
//   <figcaption>What the figure shows.</figcaption>
// </tb-figure>
//
// The frame every interactive figure lives in. It numbers itself in document order, keeps the caption,
// sizes a stage by the kind's aspect ratio, and mounts the figure module when the frame comes within
// 600px of the viewport (or at once for every figure when the URL carries ?eager=1). It exposes the
// figure to the gates through window.__textbook.figures[id] and data-state on the element.
//
// Query parameters the gates use: ?eager=1 mounts everything now; ?t=<seconds> pins every clock through
// setTime after ready; ?reduce=1 behaves as if prefers-reduced-motion were set.

import { figureInfo } from '../figures/registry.js';
import { resolvePalette, currentTheme } from '../palette.js';
import { textbook } from '../shell.js';

const params = new URLSearchParams(location.search);
const EAGER = params.get('eager') === '1';
const PINNED_TIME = params.has('t') ? Number(params.get('t')) : null;
const FORCE_REDUCE = params.get('reduce') === '1';
const READY_TIMEOUT_MS = 30_000;

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');

function reducedMotion() {
  return FORCE_REDUCE || reduceQuery.matches;
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

let observer = null;
function nearViewport(el, cb) {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          observer.unobserve(e.target);
          e.target.__nearCb?.();
        }
      }
    }, { rootMargin: '600px 0px' });
  }
  el.__nearCb = cb;
  observer.observe(el);
}

let visibility = null;
function watchVisibility(el, cb) {
  if (!visibility) {
    visibility = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.__visCb?.(e.isIntersecting);
    }, { threshold: 0.05 });
  }
  el.__visCb = cb;
  visibility.observe(el);
}

let figureCounter = 0;

export class TbFigure extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const kind = this.getAttribute('kind');
    const id = this.id || `fig-${++figureCounter}`;
    this.id = id;
    let info;
    try {
      info = figureInfo(kind);
    } catch (err) {
      // Build a real stage first. The error box is position:absolute inset:0, so without a positioned
      // ancestor it lays itself over the viewport instead of over the figure, and a page with several
      // unregistered kinds renders as a blank sheet.
      this.dataset.state = 'error';
      this.dataset.width = this.getAttribute('width') || 'text';
      const figure = document.createElement('figure');
      const stage = document.createElement('div');
      stage.className = 'tb-figure__stage';
      stage.style.setProperty('--fig-aspect', '16 / 10');
      const box = document.createElement('div');
      box.className = 'tb-figure__error';
      box.textContent = err.message;
      stage.append(box);
      figure.append(stage);
      const caption = this.querySelector('figcaption');
      if (caption) figure.append(caption);
      this.replaceChildren(figure);
      textbook.registerFigure(id, { kind, state: 'error', error: err.message });
      return;
    }
    this.info = info;
    this.kind = kind;
    this.dataset.width = this.getAttribute('width') || 'text';
    this.dataset.state = 'idle';

    const chapter = document.querySelector('main[data-chapter]')?.dataset.chapter;
    const index = Array.from(document.querySelectorAll('tb-figure')).indexOf(this) + 1;
    this.number = chapter ? `${chapter}.${index}` : `${index}`;

    const caption = this.querySelector('figcaption');
    const fallback = this.querySelector('[data-fallback]');
    const figure = document.createElement('figure');
    figure.setAttribute('aria-label', `Figure ${this.number}: ${info.title}`);
    const stage = document.createElement('div');
    stage.className = 'tb-figure__stage';
    stage.style.setProperty('--fig-aspect', String(info.aspect));
    stage.style.setProperty('--fig-aspect-narrow', String(info.narrowAspect ?? info.aspect));
    const mount = document.createElement('div');
    mount.className = 'tb-figure__mount';
    // A group, not an image: the mount holds the figure's buttons, sliders and focusable canvas, and
    // role="img" would hide them from a screen reader. The alt text stays as the group's label.
    mount.setAttribute('role', 'group');
    mount.setAttribute('aria-label', this.dataset.alt || info.title);
    const placeholder = document.createElement('div');
    placeholder.className = 'tb-figure__placeholder';
    placeholder.textContent = fallback ? '' : info.title;
    if (fallback) placeholder.append(fallback);
    stage.append(mount, placeholder);
    figure.append(stage);
    if (caption) {
      const num = document.createElement('span');
      num.className = 'fig-num';
      num.textContent = `Figure ${this.number}`;
      caption.prepend(num);
      figure.append(caption);
    }
    this.replaceChildren(figure);
    this.stage = stage;
    this.mountEl = mount;
    this.placeholder = placeholder;

    textbook.registerFigure(id, { kind, state: 'idle', number: this.number });

    if (info.needsWebGL && !hasWebGL()) {
      this.fail(new Error(`${info.title} needs WebGL and this browser has none; the caption describes what it shows`));
      return;
    }
    if (EAGER) this.load();
    else nearViewport(this, () => this.load());
    watchVisibility(this, (visible) => this.handle?.setVisible?.(visible));
    this.onTheme = () => this.retheme();
    document.addEventListener('tb-theme-change', this.onTheme);
  }

  disconnectedCallback() {
    document.removeEventListener('tb-theme-change', this.onTheme);
    this.handle?.destroy?.();
    this.handle = null;
  }

  setState(state, extra = {}) {
    this.dataset.state = state;
    textbook.updateFigure(this.id, { state, ...extra });
  }

  fail(err) {
    console.error(`figure ${this.id} (${this.kind}) failed:`, err);
    this.setState('error', { error: String(err?.message || err) });
    const box = document.createElement('div');
    box.className = 'tb-figure__error';
    box.textContent = `This figure could not load: ${err?.message || err}`;
    this.stage.append(box);
  }

  async load() {
    if (this.loading) return;
    this.loading = true;
    this.setState('loading');
    let mod;
    try {
      mod = await import(this.info.url);
    } catch (err) {
      this.fail(new Error(`its module ${this.info.url} did not load (${err.message})`));
      return;
    }
    this.mod = mod;
    this.start();
  }

  start() {
    const theme = currentTheme();
    const ctx = {
      palette: resolvePalette(theme),
      theme,
      reducedMotion: reducedMotion(),
      pinnedTime: PINNED_TIME,
      onReady: () => this.ready(),
      onError: (err) => this.fail(err),
    };
    const timer = setTimeout(() => {
      if (this.dataset.state === 'loading') this.fail(new Error(`it did not report ready within ${READY_TIMEOUT_MS / 1000} s`));
    }, READY_TIMEOUT_MS);
    this.readyTimer = timer;
    this.readyPending = false;
    try {
      this.handle = this.mod.mount(this.mountEl, ctx) || {};
      textbook.updateFigure(this.id, { handle: this.handle });
    } catch (err) {
      clearTimeout(timer);
      this.fail(err);
      return;
    }
    // A figure that calls onReady synchronously inside mount() did so before the handle existed;
    // finish becoming ready now that it does, so setTime and describe reach a real handle.
    if (this.readyPending) this.ready();
  }

  ready() {
    if (!this.handle) {
      this.readyPending = true;
      return;
    }
    clearTimeout(this.readyTimer);
    if (PINNED_TIME !== null) {
      try {
        this.handle?.setTime?.(PINNED_TIME);
      } catch (err) {
        this.fail(new Error(`setTime(${PINNED_TIME}) threw: ${err.message}`));
        return;
      }
    }
    this.setState('ready', { handle: this.handle });
    // The placeholder fades out for a reader; under the gates' eager or pinned mode it goes at once,
    // so a screenshot never catches the title mid-fade over the figure.
    if (this.placeholder) {
      if (EAGER || PINNED_TIME !== null || reducedMotion()) this.placeholder.remove();
      else setTimeout(() => this.placeholder?.remove(), 450);
    }
  }

  retheme() {
    if (!this.mod || !this.handle) return;
    const theme = currentTheme();
    const palette = resolvePalette(theme);
    if (typeof this.handle.setTheme === 'function') {
      this.handle.setTheme(theme, palette);
      return;
    }
    this.handle.destroy?.();
    this.handle = null;
    this.mountEl.replaceChildren();
    this.setState('loading');
    this.start();
  }

  // For the gates and the lab: a JSON description of the figure's current state.
  describe() {
    return { id: this.id, kind: this.kind, number: this.number, state: this.dataset.state, ...(this.handle?.describe?.() || {}) };
  }
}

customElements.define('tb-figure', TbFigure);
