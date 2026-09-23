// Small helpers for the authored-SVG figures: an element factory for SVG and HTML, a text helper,
// palette shortcuts that resolve through the CSS tokens, easing, and a finishable tween.
// Every colour here is a CSS expression (var(), color-mix()), so a figure built from these follows
// the theme with no code of its own.

export const SVG_NS = 'http://www.w3.org/2000/svg';

function setAttrs(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'text') node.textContent = String(value);
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
}

function append(node, children) {
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null || child === false) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
}

// An SVG element: el('circle', { cx: 0, cy: 0, r: 4, fill: C.leaf }).
export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  setAttrs(node, attrs);
  append(node, children);
  return node;
}

// An HTML element, for overlays and controls: h('button', { class: 'fig-btn', type: 'button', text: 'Next' }).
export function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  append(node, children);
  return node;
}

// SVG text at (x, y). Attributes go through as-is; 'anchor' is shorthand for text-anchor.
export function text(x, y, str, attrs = {}) {
  const { anchor, ...rest } = attrs;
  return el('text', { x, y, 'text-anchor': anchor, ...rest, text: str });
}

// Colour tokens as CSS expressions. tint(colour, pct) is the colour mixed into the paper: an opaque
// pale version in the light theme and a deep one in the dark theme.
export const C = Object.freeze({
  ink: 'var(--ink)',
  soft: 'var(--ink-soft)',
  faint: 'var(--ink-faint)',
  rule: 'var(--rule)',
  ruleStrong: 'var(--rule-strong)',
  paper: 'var(--paper)',
  paper2: 'var(--paper-2)',
  paper3: 'var(--paper-3)',
  leaf: 'var(--leaf)',
  water: 'var(--water)',
  coral: 'var(--coral)',
  violet: 'var(--violet)',
  gold: 'var(--gold)',
  // The four accents pushed towards the ink. tokens.css declares them and states the recipe; they are for
  // small type on the paper, and for a solid fill that carries paper-coloured text — an atom's disc with
  // its symbol written on it. The accent itself cannot do that second job: both the fill and the symbol
  // move with the theme and in the same direction, so `--paper` on `--coral` is 3.32:1 light and 7.26:1
  // dark and no token clears 4.5:1 in both. These move WITH the paper, so one choice reads in both.
  leafText: 'var(--leaf-text)',
  waterText: 'var(--water-text)',
  coralText: 'var(--coral-text)',
  goldText: 'var(--gold-text)',
});

export function tint(colour, pct, base = 'var(--paper)') {
  return `color-mix(in srgb, ${colour} ${pct}%, ${base})`;
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
export const easeOut = (t) => 1 - (1 - t) ** 3;

// A smooth path through points (Catmull-Rom turned into cubic Béziers), for organic outlines.
export function smooth(points, { closed = true, tension = 6 } = {}) {
  const n = points.length;
  const at = (i) => points[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  let d = `M${points[0][0]} ${points[0][1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / tension, p1[1] + (p2[1] - p0[1]) / tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) / tension, p2[1] - (p3[1] - p1[1]) / tension];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return closed ? `${d} Z` : d;
}

// Point on a circle, angle in degrees clockwise from 12 o'clock.
export function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// Unique ids for defs (clip paths, markers): two copies of a figure on one page must not share them.
let uidCounter = 0;
export function uid(prefix = 'tb') {
  uidCounter += 1;
  return `${prefix}-${uidCounter.toString(36)}`;
}

// A tween driven by requestAnimationFrame. update(p) gets eased progress in [0, 1]; finish() jumps
// to the end at once (for setTime and reduced motion), cancel() stops without finishing.
export function tween({ duration = 300, ease = easeInOut, update, done, instant = false }) {
  let raf = 0;
  let start = 0;
  let over = false;
  const finish = () => {
    if (over) return;
    over = true;
    cancelAnimationFrame(raf);
    update(1);
    done?.();
  };
  const cancel = () => {
    over = true;
    cancelAnimationFrame(raf);
  };
  if (instant || duration <= 0) {
    finish();
    return { finish, cancel, get running() { return false; } };
  }
  const step = (now) => {
    if (over) return;
    if (!start) start = now;
    const t = Math.min(1, (now - start) / duration);
    update(ease(t));
    if (t >= 1) {
      over = true;
      done?.();
    } else {
      raf = requestAnimationFrame(step);
    }
  };
  update(0);
  raf = requestAnimationFrame(step);
  return { finish, cancel, get running() { return !over; } };
}
