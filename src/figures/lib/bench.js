// The figure bench: the scaffolding every 2D figure in this book has been writing by hand.
//
// `docs/design/figure-bench.md` is the design of record and the measurements behind it. In one line:
// about a quarter of a figure module is not the figure. It is a wrapper, a grid of measured panes, a
// narrow switch, a ResizeObserver, a fonts-ready redraw, a toolbar of buttons in groups with a divider
// and a primary mark, a visually-hidden live region, a clamped set of SVG primitives, a text fitter, a
// seeded generator and a handle for the frame. Thirty-six modules wrote that separately; twelve of them
// carry the byte-identical primary-action rule, eleven the byte-identical divider, eleven the
// byte-identical live-region style, and six define `mulberry32`.
//
// WHAT THIS IS NOT. It is not a framework and it is not configuration. It is a function you call inside
// `mount`, which returns the object `src/components/figure.js` already expects. The frame is unchanged.
// There is no build step, no dependency, and no spec object: a spec grows a key per figure until it is
// the framework `AGENTS.md` forbids. If the bench cannot do something, the figure drops through to raw
// drawing for that one thing — `pane.add()` is the door — and the extension is proposed for the NEXT
// chapter, because this file belongs to the integration owner and is finished before the figure workers
// start. That is the whole reason `mulberry32` is in six places: a shared file a worker may extend
// mid-chapter is a serialisation point, and four figure workers run in parallel.
//
// WHAT IT REFUSES TO DO, and this is the point of it. `src/figures/lib/cell-common.js`'s `panelCss`
// ships `.cl-mini`, a pill with a filled pressed state, and `.cl-bar`, a rounded progress bar. Both were
// right in September; both are now forbidden by `docs/design/figures-template.md`'s own header, and
// three figures still draw them. A shared component that outlives its design spreads the defect and
// makes it look sanctioned. So:
//   - The readout is a REGION the figure fills with rows, not a surface it styles. `readout()` emits
//     `<text>` and `<line>` and nothing else. There is no path from `r.row()` to a border, a radius, a
//     fill behind text, or a bar. It cannot be made into a pill because it cannot draw a rectangle.
//   - The primary action is a FLAG, not a class the figure invents, and the bench renders it as
//     `--rule-head` on the edge and the ink's weight. The figure does not write that rule, so it cannot
//     render it as a fill.
//   - `test/bench.test.js` fails a module that imports this file and then writes `border-radius` or
//     `border:` in its own CSS, defines `mulberry32`, constructs a `ResizeObserver`, or reaches
//     `el('rect'|'circle'|'line'|'ellipse')` directly instead of through a pane.
//
// WHAT THE FIGURE STILL OWNS: its subject. `meta`, the body of `describe()`, its own marks' CSS, what is
// drawn in a pane, what its narrow composition IS, which controls exist and what they do, the sentence
// the live region speaks, the rows' labels and values, the arithmetic that produces the numbers, and its
// own arithmetic about its own drawing — `phlab`'s `beakerHeight()` asks the beakers how tall they need
// to be, which looks like layout and is a statement about what a beaker is. No general mechanism reaches
// that, and one that tried would be offering a shape that fits one figure.
//
// WHERE THE CHROME'S CSS LIVES: `src/styles/components.css`, under `/* The figure bench */`, not in a
// string here. One stylesheet for the whole page rather than one `<style>` per mounted figure, and one
// place to change when the design changes. `test/bench.test.js` fails a class this file emits that that
// stylesheet does not declare, so the two cannot drift apart in silence.
//
// WHAT IT DOES NOT SERVE: the six WebGL figures keep `lib/three-common.js` for the scene, the rig, the
// orbit and `setView`, and take only the chrome (`pane(name, { as: 'canvas' })` hands over a canvas and
// gets out of the way). The three 資治通鑑 figures should take nothing: their text fitting is an advance
// estimate measured on Inter over mixed-case Latin, and for Han the advance is 1 em and the constraint
// is characters per line.
import { el, h, text as svgText, C, uid } from './svg.js';
// The one seeded generator, not a seventh copy of it. `lib/chem-atoms.js` is where it has lived since
// chapter 2 and `lib/mol-draw.js` re-exports it from there rather than restating it; this does the same.
// No figure may call Math.random: a screenshot at t must be the same frame every run.
import { mulberry32 } from './chem-atoms.js';

// ---------------------------------------------------------------- pure helpers, testable without a DOM

// Inter's average advance is about 0.52 em over mixed-case text, which is close enough to choose a size
// that fits a box without a measurement pass per label. Six figures wrote this number out separately.
// Returns 0 when even `min` would overrun, so a label that cannot be set at its floor is not set at all
// rather than set over its neighbour.
export const EM_ADVANCE = 0.53;
export function fitSize(str, maxWidth, max, min) {
  const size = Math.min(max, maxWidth / (String(str).length * EM_ADVANCE));
  return size >= min ? size : 0;
}

// A number with a fixed number of decimals, as a string, for a label or an attribute the figure wants
// rounded. The bench's own primitives do NOT apply it: rounding a coordinate to a tenth moves an edge by
// up to 0.05 px and changes its antialiasing, which is a pixel difference the figure did not ask for and
// `tools/figure-diff.js` would rightly report. Where a figure rounds, it rounds; the bench passes the
// number through exactly as `el()` would.
export const fmt = (v, dp = 1) => Number(v).toFixed(dp);

// A sentence broken into the lines a column of `width` can hold at `size`, by the same advance estimate
// `fitSize` uses. Eight of chapter 5's figures wrote this out — four called it `noteLines` and four
// `wrapLines`, and the only difference between them was the floor under the characters per line — because
// `readout().note()` drew one <text> and a sentence longer than the column ran off the right of the
// stage. `note()` now wraps by itself; this stays exported for the other use, which is a sentence drawn
// outside a readout (`atp3d`'s ladder verdict sits under the rungs, not in a table).
export function wrapText(str, width, size) {
  const per = Math.max(8, Math.floor(width / (size * EM_ADVANCE)));
  const lines = [];
  let line = '';
  for (const word of String(str).split(' ')) {
    if (line && line.length + 1 + word.length > per) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

// A dimension that may reach an SVG attribute. Negative is the chapter-3 defect that reached main and
// logged console errors on the live site; NaN is the same defect failing silently, because the browser
// ignores an unparseable attribute and draws nothing. Both are caught where the number is computed.
export function safeDim(value, what, strict) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    const msg = `${what} was ${value === undefined ? 'undefined' : String(value)}; an SVG width, height, radius or length must be a finite number of at least 0. Clamp it where it is computed, not here.`;
    if (strict) throw new Error(msg);
    return 0;
  }
  return n;
}

// A coordinate, which may legitimately be negative but may not be NaN.
export function safeCoord(value, what, strict) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    const msg = `${what} was ${value === undefined ? 'undefined' : String(value)}; an SVG coordinate must be a finite number.`;
    if (strict) throw new Error(msg);
    return 0;
  }
  return n;
}

// The fixed-step replay a pinned clock needs. `setTime(t)` must land on exactly the same model state
// every run, so time is consumed in whole steps and a backwards jump restarts from zero rather than
// unwinding — which is what `prokaryote` and `osmometer` already do by hand. Pure, so it is unit-tested
// without a browser: given the same `from`, `to` and `step` it calls `advance` the same number of times.
export function replay({ from, to, step, advance, restart, maxSteps = 200000 }) {
  let at = from;
  if (to < from) {
    restart();
    at = 0;
  }
  let n = 0;
  // A strict `while (at + step <= to)` drops a step to floating-point drift after a few thousand of
  // them; the epsilon is a thousandth of a step, far below anything a model can notice.
  const eps = step / 1000;
  while (at + step <= to + eps) {
    if (n >= maxSteps) {
      throw new Error(`replay from ${from} to ${to} at step ${step} needs more than ${maxSteps} steps; a clock that far ahead means setTime was given a time the model cannot reach, or the step is wrong`);
    }
    advance(step);
    at += step;
    n += 1;
  }
  return { at, steps: n };
}

// ---------------------------------------------------------------- the class names the bench emits
//
// Listed once, exported, and read by test/bench.test.js against components.css, so a class this file
// writes that the stylesheet does not declare is a failure rather than an unstyled element nobody sees.
// `tb-live` is deliberately absent: the live region is visually hidden by nine inline properties, so
// that a figure cannot lose a screen reader's only channel by forgetting a stylesheet. `tb-pane-<name>`
// is absent too, because it is a hook for a figure's own CSS and carries no bench rule, and so is
// `tb-gl` below, which is a marker for a gate rather than a style hook.
export const BENCH_CLASSES = Object.freeze([
  'tb-bench', 'tb-pane', 'tb-toolbar', 'tb-group', 'tb-sep', 'tb-slider', 'tb-val',
  'tb-stepper', 'tb-step', 'tb-seg',
  'tb-rt-title', 'tb-rt-head', 'tb-rt-key', 'tb-rt-val', 'tb-rt-note',
  'tb-focus', 'tb-long', 'tb-short',
]);

// The one pane `npm run sweep3d` measures, marked so that the gate can hide every other one.
//
// That gate's whole claim rests on measuring the BARE CANVAS: the first version measured the whole
// stage and a figure whose render had been replaced by a clear still passed, because fifteen labels and
// three buttons vary enough to look like a frame (proved 2026-09-10, docs/learning/gate-proofs.md). It
// hides overlays by class — `.fig-label`, `.fig-toolbar`, `.fig-chip`, `.fig-card` — and a bench PANE is
// none of those, so `atp3d`'s six-row ledger, which fills a third of its stage, was being measured as if
// it were the render. A vanished renderer would have left a table's worth of luminance variety behind
// and the gate would have called it a frame.
//
// The marker is on the CANVAS and not on the chrome, so the gate hides what it does not recognise
// rather than measuring it: a pane added to a WebGL figure later is bare-hidden by default, and a figure
// that forgets to declare its canvas fails loudly with a blank frame instead of passing quietly.
// It carries no rule in components.css and is not in BENCH_CLASSES: the rule that acts on it lives in
// tools/sweep3d.js, and test/bench.test.js reads that file so the two names cannot part company.
export const BENCH_GL_CLASS = 'tb-gl';

// The one field the bench adds to describe(). The frame owns id, kind, number and state and spreads
// them last; this is spread last too, for the same reason, and `tools/drive.js` fails a figure that
// reports it itself rather than letting it be dropped in silence.
export const BENCH_DESCRIBE_FIELD = 'layout';

// ---------------------------------------------------------------- the bench

/**
 * @param {HTMLElement} root the element `mount` was given
 * @param {object} ctx the frame's context: palette, theme, reducedMotion, pinnedTime, onReady, onError
 * @param {object} options
 * @param {string} options.kind the figure's kind, which becomes the wrapper class `tb-<kind>`
 * @param {string} [options.scope] the wrapper class, if it is not the kind
 * @param {string|function} [options.css] this figure's OWN marks' CSS; a function is given the scope selector
 * @param {{width?: number, height?: number}} [options.narrowBelow] the stage size this figure re-composes below
 * @param {number} [options.seed] the seed for b.random(); there is no other generator
 */
export function bench(root, ctx, {
  kind,
  scope = kind,
  css = '',
  narrowBelow = null,
  seed = 1,
} = {}) {
  if (!kind) throw new Error('bench() needs the figure\'s kind, which becomes its wrapper class and its name in every failure message. Pass kind: meta.kind.');
  if (!root || typeof root.append !== 'function') throw new Error(`bench() for "${kind}" was given ${root === undefined ? 'no root element' : String(root)} to mount into; mount(root, ctx) passes its first argument straight through.`);

  // In the lab a bad dimension throws, so the gate that drives the figure goes red naming it; on the
  // site it draws nothing, because a reader should not lose the page to one bad rectangle. Every figure
  // gate (`drive`, `narrow`, `sweep3d`, `legible`, `perf`) runs the lab, so strict is the gates' mode.
  const strict = typeof location !== 'undefined' && location.pathname.includes('/lab/');

  const ns = uid(`tb-${kind}`);
  const selector = `.tb-${scope}`;
  let destroyed = false;
  let ready = false;
  let narrow = null;
  let padPx = 0;
  let visible = true;
  let rng = mulberry32(seed);

  const wrap = h('div', { class: `tb-bench tb-${scope}` });
  const figureCss = typeof css === 'function' ? css(selector) : css;
  if (figureCss) wrap.append(h('style', { text: figureCss }));

  // ---- panes -------------------------------------------------------------------------------------
  const panes = new Map();
  let focusPane = null;

  function paneBox(node) {
    const r = node.getBoundingClientRect();
    return { w: Math.max(40, Math.round(r.width)), h: Math.max(30, Math.round(r.height)) };
  }

  function makePane(name, { as = 'svg', focus = false, aria = null, gl = false } = {}) {
    if (panes.has(name)) throw new Error(`${kind}: two panes are both called "${name}". A pane's name is how compose() places it and how a failure names it, so they must differ.`);
    if (gl && as !== 'canvas') throw new Error(`${kind}: pane "${name}" says gl: true and as: '${as}'. gl marks the one surface npm run sweep3d measures, and a WebGL render needs a canvas to reach; on an SVG pane the mark would hide the whole figure from the gate's bare frame.`);
    const box = { w: 0, h: 0 };
    let node;
    if (as === 'canvas') {
      node = h('canvas', aria ? { role: 'img', 'aria-label': aria, tabindex: focus ? '0' : null } : { 'aria-hidden': 'true' });
    } else {
      node = el('svg', aria
        ? { role: 'img', 'aria-label': aria, ...(focus ? { tabindex: '0' } : {}) }
        : { 'aria-hidden': 'true', ...(focus ? { tabindex: '0' } : {}) });
    }
    const box_el = h('div', { class: `tb-pane tb-pane-${name}${gl ? ` ${BENCH_GL_CLASS}` : ''}` }, [node]);
    const where = (what) => `${kind}/${name}: ${what}`;

    const pane = {
      name,
      node,
      el: box_el,
      gl,
      get box() { return box; },
      measure() {
        const b = paneBox(box_el);
        box.w = b.w;
        box.h = b.h;
        return box;
      },
      // Empties the pane and sets its viewBox to the measured pixel box, so a 10.5 px label is 10.5
      // device pixels at any stage size. Twenty-six figures wrote this line.
      clear() {
        if (as !== 'canvas') {
          node.setAttribute('viewBox', `0 0 ${box.w} ${box.h}`);
          node.replaceChildren();
        }
        return pane;
      },
      add(child) {
        if (child) node.append(child);
        return child;
      },
      group(attrs = {}) {
        const g = el('g', attrs);
        node.append(g);
        return g;
      },
      // ---- the clamped primitives. These are the ONLY way to a dimension attribute in a figure built
      // on the bench, and test/bench.test.js fails a module that reaches el('rect') itself.
      rect(x, y, w, hgt, attrs = {}, parent = node) {
        const r = el('rect', {
          x: safeCoord(x, where('rect x'), strict), y: safeCoord(y, where('rect y'), strict),
          width: safeDim(w, where('rect width'), strict), height: safeDim(hgt, where('rect height'), strict),
          ...attrs,
        });
        parent.append(r);
        return r;
      },
      circle(cx, cy, r, attrs = {}, parent = node) {
        const c = el('circle', {
          cx: safeCoord(cx, where('circle cx'), strict), cy: safeCoord(cy, where('circle cy'), strict),
          r: safeDim(r, where('circle r'), strict), ...attrs,
        });
        parent.append(c);
        return c;
      },
      ellipse(cx, cy, rx, ry, attrs = {}, parent = node) {
        const e = el('ellipse', {
          cx: safeCoord(cx, where('ellipse cx'), strict), cy: safeCoord(cy, where('ellipse cy'), strict),
          rx: safeDim(rx, where('ellipse rx'), strict), ry: safeDim(ry, where('ellipse ry'), strict), ...attrs,
        });
        parent.append(e);
        return e;
      },
      line(x1, y1, x2, y2, attrs = {}, parent = node) {
        const l = el('line', {
          x1: safeCoord(x1, where('line x1'), strict), y1: safeCoord(y1, where('line y1'), strict),
          x2: safeCoord(x2, where('line x2'), strict), y2: safeCoord(y2, where('line y2'), strict), ...attrs,
        });
        parent.append(l);
        return l;
      },
      // A path's numbers are already in its `d`, so the guard is on the string: one NaN in it and the
      // browser ignores the whole path and draws nothing, silently, which is the same defect as a
      // negative width wearing a different coat.
      path(d, attrs = {}, parent = node) {
        if (typeof d !== 'string' || d.includes('NaN') || d.includes('undefined')) {
          const msg = where(`a path's d is ${typeof d === 'string' ? `"${d.slice(0, 80)}"` : String(d)}; a coordinate in it did not come out as a number, so the browser would ignore the whole path and draw nothing`);
          if (strict) throw new Error(msg);
          return null;
        }
        const p = el('path', { d, ...attrs });
        parent.append(p);
        return p;
      },
      // Text at (x, y). `fit: [max, min]` with `width` sizes it to the box it has to fit and returns
      // null rather than drawing a label that overruns — two of the four label collisions chapter 3
      // shipped were exactly this.
      text(x, y, str, { fit = null, width = null, anchor = null, parent = node, ...attrs } = {}) {
        if (fit) {
          if (width == null) throw new Error(where('text({ fit }) also needs width: the box the label has to fit in. Without it there is nothing to fit to.'));
          const size = fitSize(str, width, fit[0], fit[1]);
          if (!size) return null;
          attrs['font-size'] = fmt(size);
        }
        const t = svgText(safeCoord(x, where('text x'), strict), safeCoord(y, where('text y'), strict), String(str), { anchor, ...attrs });
        parent.append(t);
        return t;
      },
      // The paper-haloed label eleven figures hand-roll: type that has to stand over a drawing carries
      // its own ground with it rather than sitting in a bordered chip.
      label(x, y, str, { size = 10.5, anchor = 'middle', fill = C.ink, halo = 3, parent = node, ...attrs } = {}) {
        return pane.text(x, y, str, {
          anchor, parent, 'font-size': fmt(size), 'font-weight': 600,
          style: `fill:${fill}`, stroke: C.paper, 'stroke-width': `${halo}px`,
          'stroke-linejoin': 'round', 'paint-order': 'stroke', ...attrs,
        });
      },
      // Four corner brackets, shown only on :focus-visible. A ring round the pane reads as a card drawn
      // round the artwork, which is what a book does not do.
      focusMark({ inset = 3, colour = C.water } = {}) {
        const w = box.w;
        const hgt = box.h;
        const len = Math.max(9, Math.min(20, w * 0.06, hgt * 0.16));
        const a = inset;
        const x1 = w - inset;
        const y1 = hgt - inset;
        return pane.path([
          `M${a} ${fmt(a + len)} L${a} ${a} L${fmt(a + len)} ${a}`,
          `M${fmt(x1 - len)} ${a} L${fmt(x1)} ${a} L${fmt(x1)} ${fmt(a + len)}`,
          `M${fmt(x1)} ${fmt(y1 - len)} L${fmt(x1)} ${fmt(y1)} L${fmt(x1 - len)} ${fmt(y1)}`,
          `M${fmt(a + len)} ${fmt(y1)} L${a} ${fmt(y1)} L${a} ${fmt(y1 - len)}`,
        ].join(' '), { class: 'tb-focus', fill: 'none', stroke: colour, 'stroke-width': 2.2, 'stroke-linecap': 'square' });
      },
      readout(opts) { return makeReadout(pane, opts); },
      trace(opts) { return drawTrace(pane, opts); },
    };
    if (focus) {
      if (focusPane) throw new Error(`${kind}: panes "${focusPane.name}" and "${name}" both ask for the keyboard. One pane holds it, so a recipe and a reader both know where the arrow keys go.`);
      focusPane = pane;
    }
    panes.set(name, pane);
    wrap.append(box_el);
    return pane;
  }

  // ---- the two compositions ----------------------------------------------------------------------
  let layouts = null;
  function compose(spec) {
    if (!spec || !spec.wide) throw new Error(`${kind}: compose() needs at least a wide layout: { wide: { columns, rows, at } }.`);
    for (const [which, l] of Object.entries(spec)) {
      if (!l.columns || !l.rows || !l.at) throw new Error(`${kind}: the ${which} layout needs columns, rows and at; it has ${Object.keys(l).join(', ') || 'nothing'}.`);
      for (const name of Object.keys(l.at)) {
        if (!panes.has(name)) throw new Error(`${kind}: the ${which} layout places a pane called "${name}" and no pane by that name was made. The panes are: ${[...panes.keys()].join(', ') || 'none'}.`);
      }
      for (const name of panes.keys()) {
        if (!(name in l.at)) throw new Error(`${kind}: the ${which} layout does not place the pane "${name}". A pane with no grid cell lands wherever the grid's auto-placement puts it, which is a decision nobody made.`);
      }
    }
    // The failure mode that nearly shipped five figures with no gate over their second layout: a figure
    // that declares narrowBelow, and so re-composes, but gives only one template.
    if (narrowBelow && !spec.narrow) {
      throw new Error(`${kind}: it declares narrowBelow (${JSON.stringify(narrowBelow)}) and gives no narrow layout, so below that size it would re-use the wide grid at phone width. Give compose() a narrow template, or drop narrowBelow.`);
    }
    if (!narrowBelow && spec.narrow) {
      throw new Error(`${kind}: it gives a narrow layout and no narrowBelow, so nothing would ever switch to it. Say the stage size this figure re-composes below.`);
    }
    layouts = spec;
    return spec;
  }

  function applyComposition() {
    const l = (narrow && layouts.narrow) || layouts.wide;
    wrap.style.gridTemplateColumns = l.columns;
    wrap.style.gridTemplateRows = l.rows;
    wrap.style.columnGap = l.columnGap ?? 'var(--space-3)';
    wrap.style.rowGap = l.rowGap ?? 'var(--space-2)';
    for (const [name, at] of Object.entries(l.at)) {
      const pane = panes.get(name);
      pane.el.style.gridColumn = String(at[0]);
      pane.el.style.gridRow = String(at[1]);
    }
  }

  // ---- controls ----------------------------------------------------------------------------------
  //
  // Every control is made here, which is what makes four things true by construction rather than by a
  // checklist: one accessible name at every width (36 drive recipes address controls by it, and
  // `surface-volume` shipped phone labels that were different words), keyboard operability, a primary
  // that is an edge and a weight rather than a fill, and grouping, because b.divide() is the only way to
  // get space in the toolbar.
  const toolbar = h('div', { class: 'fig-toolbar fig-ui tb-toolbar' });
  const live = h('span', { class: 'fig-chip fig-ui tb-live', 'aria-live': 'polite', role: 'status' });
  const groups = [];
  let group = null;
  let pendingRule = false;
  const controls = [];

  function currentGroup() {
    if (!group) {
      group = { node: h('div', { class: 'tb-group' }), rule: null, members: [] };
      // The rule belongs to the group it OPENS, not to the toolbar. On the toolbar it outlived its
      // group: a figure that hides a whole group's controls — for this scene, or at this width — left a
      // rule standing on its own, and three of chapter 5's figures carried the same `tidyDividers()` to
      // sweep them up afterwards, which had to be remembered after every change to the toolbar and again
      // after b.handle(). Inside the group, the rule is hidden with it and nothing has to remember.
      if (pendingRule) {
        group.rule = h('span', { class: 'tb-sep', 'aria-hidden': 'true' });
        group.node.append(group.rule);
        pendingRule = false;
      }
      toolbar.append(group.node);
      groups.push(group);
    }
    return group;
  }

  function divide() {
    if (!groups.length && !group) throw new Error(`${kind}: divide() before any control, so it would open the toolbar with a rule and nothing to its left.`);
    pendingRule = true;
    group = null;
  }

  // Every control passes through here, so the bench knows which group it is in and at which width it
  // belongs. `only` is 'narrow' or 'wide': the bench shows and hides it, and the figure does not touch
  // its display. `feedback-pathway`'s pane switch is meaningless at desktop width, where both panes are
  // already on the stage, and before this it was hidden by a function the figure called from onDraw with
  // `b.narrow` read by hand — so the only way to drive it was to change the viewport.
  function register(node, { only = null, long = null, name = null, into = null } = {}) {
    const g = currentGroup();
    (into ?? g.node).append(node);
    g.members.push(node);
    controls.push({ node, only, long, name });
    if (only) applyOnly();
    return node;
  }

  function applyOnly() {
    if (narrow === null) return;
    for (const c of controls) {
      if (!c.only) continue;
      const want = (c.only === 'narrow') === narrow ? '' : 'none';
      if (c.node.style.display !== want) c.node.style.display = want;
    }
  }

  // A group whose controls are all hidden is not a group, it is a gap — and with a rule in it, a rule
  // standing on its own. Whichever group is the first one still showing carries no rule, so a figure
  // whose opening group is narrow-only does not open its toolbar with a rule either.
  function refreshGroups() {
    let seen = false;
    let changed = false;
    for (const g of groups) {
      const any = g.members.some((n) => n.style.display !== 'none');
      const want = any ? '' : 'none';
      if (g.node.style.display !== want) {
        g.node.style.display = want;
        changed = true;
      }
      if (g.rule) {
        g.wantsRule = any && seen;
        const ruleWant = g.wantsRule ? '' : 'none';
        if (g.rule.style.display !== ruleWant) {
          g.rule.style.display = ruleWant;
          changed = true;
        }
      }
      if (any) seen = true;
    }
    if (changed) trimRules();
    return changed;
  }

  // A rule is drawn only between two groups that share a line. Which groups share a line is a
  // MEASUREMENT — the toolbar wraps, and where it wraps depends on the width, the labels and which
  // controls this scene is showing — so no figure can declare it. Two things follow, and both are worth
  // having: a rule never hangs at the left margin of a wrapped line, where it separates nothing because
  // the line break already did; and a rule that would be the thing pushing its group onto a new line is
  // dropped instead, which bought `enzyme-kinetics` a whole toolbar row back at desktop width.
  //
  // One pass, one decision per rule, taken left to right: showing a rule can only move the groups AFTER
  // it, so a decision already taken is never invalidated by a later one. An earlier version hid a rule
  // whenever its group began a line and re-swept until nothing moved, which oscillated — hiding the rule
  // pulled the group up, which made the rule wanted again, which pushed it back down — and stopped at
  // whichever phase the pass limit happened to land on.
  function trimRules() {
    let prevTop = null;
    for (const g of groups) {
      if (g.node.style.display === 'none') continue;
      if (g.rule && g.wantsRule) {
        g.rule.style.display = '';
        if (prevTop === null || g.node.offsetTop !== prevTop) g.rule.style.display = 'none';
      }
      prevTop = g.node.offsetTop;
    }
  }

  // Two spans, one hidden by CSS at each width, and an aria-label that is always the long label. The
  // accessible name therefore cannot change with the stage width, which is the defect that forced four
  // chapter-3 goals to be reworded.
  // Always two spans, even when the short label is the long one: one shape for every control, so a
  // figure cannot acquire a second label by accident and the CSS has one case to cover.
  function labelSpans(long, short) {
    return [h('span', { class: 'tb-long', text: long }), h('span', { class: 'tb-short', text: short ?? long })];
  }

  function makeButton(long, { short = null, aria = null, primary = false, pressed = null, onClick = null, className = '', only = null, into = null } = {}) {
    const name = aria || long;
    if (!name) throw new Error(`${kind}: a control with no label and no aria: a button a recipe cannot name and a reader cannot hear.`);
    if (aria && !aria.startsWith(long)) {
      throw new Error(`${kind}: the control labelled "${long}" has the accessible name "${aria}", which does not begin with the words on it. A recipe finds a control by what it says, so the name starts with the label and then adds what it does.`);
    }
    const node = h('button', {
      class: `fig-btn${className ? ` ${className}` : ''}`, type: 'button', 'aria-label': name,
      ...(primary ? { 'data-primary': '' } : {}),
      ...(pressed === null ? {} : { 'aria-pressed': String(pressed) }),
    }, labelSpans(long, short));
    if (onClick) node.addEventListener('click', onClick);
    register(node, { only, long, name, into });
    return node;
  }

  function action(long, onClick, opts = {}) {
    return makeButton(long, { ...opts, onClick });
  }

  // One button that is on or off, and the bench keeps its aria-pressed. `choice` has done that since the
  // start; a lone toggle did not, so ten controls across chapter 5 wrote `setAttribute('aria-pressed',
  // …)` by hand after every change — and a control whose state is the figure's to remember is one
  // forgotten line away from saying nothing to a screen reader. `on` is the truth; `set` and `toggle`
  // move it.
  function toggle(long, onChange, { pressed = false, ...opts } = {}) {
    let on = Boolean(pressed);
    let node = null;
    const api = {
      get on() { return on; },
      set(next, { quiet = false } = {}) {
        on = Boolean(next);
        node.setAttribute('aria-pressed', String(on));
        if (!quiet) onChange?.(on);
      },
      toggle() { api.set(!on); },
    };
    node = makeButton(long, { ...opts, pressed: on, onClick: () => api.toggle() });
    api.node = node;
    return api;
  }

  // A group of toggles, exactly one of them on — or, with `value: null`, none of them, for a control that
  // opens on nothing chosen. Returns the handle a keyboard map wants: next, prev, set.
  //
  // `segmented: true` sets them as one strip rather than as separate controls: at a phone's width the
  // segments share their edges and the gaps between them go, which is (n − 1) × about six pixels of a
  // 390 px toolbar bought back per group, and reads as one control rather than as three that happen to
  // be adjacent. At desktop width the wrapper is `display: contents` and the buttons are exactly where
  // they were.
  function choice(what, items, onPick, { primary = false, value: initial, segmented = false, only = null } = {}) {
    if (!Array.isArray(items) || items.length < 2) throw new Error(`${kind}: choice("${what}") needs at least two items to choose between; it was given ${Array.isArray(items) ? items.length : typeof items}.`);
    if (initial !== undefined && initial !== null && !items.some((i) => i.id === initial)) {
      throw new Error(`${kind}: choice("${what}") opens on "${initial}", which is not one of ${items.map((i) => i.id).join(', ')}.`);
    }
    let value = initial === undefined ? items[0].id : initial;
    let strip = null;
    if (segmented) {
      strip = h('div', { class: 'tb-seg' });
      currentGroup().node.append(strip);
    }
    const nodes = items.map((item) => makeButton(item.label, {
      short: item.short, aria: item.aria, primary, only, into: strip,
      pressed: item.id === value,
      onClick: () => api.set(item.id),
    }));
    const at = () => items.findIndex((i) => i.id === value);
    const api = {
      get value() { return value; },
      set(id, { quiet = false } = {}) {
        if (id !== null && !items.some((i) => i.id === id)) {
          throw new Error(`${kind}: choice("${what}") was asked for "${id}", which is not one of ${items.map((i) => i.id).join(', ')}.`);
        }
        value = id;
        nodes.forEach((n, i) => n.setAttribute('aria-pressed', String(items[i].id === value)));
        if (!quiet) onPick?.(value);
      },
      next() { api.set(items[value === null ? 0 : (at() + 1) % items.length].id); },
      prev() { api.set(items[value === null ? items.length - 1 : (at() - 1 + items.length) % items.length].id); },
      nodes,
      strip,
    };
    return api;
  }

  // A slider. `short` is its label at a phone's width, the way a button's is: the accessible name stays
  // the long one, so a recipe and a reader hear the same word at every width. It is here because five
  // sliders whose labels are words take five rows of a 390 px toolbar — measured on `free-energy`, where
  // the toolbar was 38% of the stage — and two of them fit on one row as soon as the label is short.
  //
  // `format(v, { narrow })` is given the width, which is what makes `narrowUnit` reachable from a
  // formatted value: the two spans are written together, one for each width, and the CSS chooses. Before
  // this, `format` could only read `b.narrow` at the moment the value was set, so both spans came out
  // the same and the figure had to re-set every slider when the stage crossed its threshold.
  function slider(labelText, { min, max, step = 1, value, unit = '', narrowUnit = null, format = null, onInput = null, short = null, only = null, stepper = false }) {
    // A `format` owns the whole value, so a `unit` beside one was being dropped in silence — three
    // sliders in chapter 5 asked for "mmol/L" and "mM" and printed neither. Now it is a refusal, and a
    // format that wants the unit takes the width it is setting and writes it itself.
    if (format && (unit || narrowUnit)) {
      throw new Error(`${kind}: the slider "${labelText}" was given both format and ${unit ? `unit "${unit}"` : `narrowUnit "${narrowUnit}"`}. format writes the whole value, so the unit would never appear. Either drop the unit, or write it inside format, which is given the width: format(v, { narrow }).`);
    }
    const input = h('input', { class: 'fig-range', type: 'range', min, max, step, value, 'aria-label': labelText });
    const unitFor = (isNarrow) => (isNarrow ? (narrowUnit ?? unit) : unit);
    const show = (v, isNarrow) => (format ? format(v, { narrow: isNarrow }) : `${v}${unitFor(isNarrow) ? ` ${unitFor(isNarrow)}` : ''}`);
    const values = (v) => labelSpans(show(v, false), show(v, true));
    const out = h('span', { class: 'tb-val' }, values(value));
    const bump = (dir) => {
      if (dir > 0) input.stepUp();
      else input.stepDown();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const stepBtn = (dir, glyph, word) => h('button', {
      class: 'fig-btn tb-step', type: 'button', 'aria-label': `${labelText}, step ${word}`, text: glyph,
    });
    const parts = [...labelSpans(labelText, short), input, out];
    if (stepper) {
      const down = stepBtn(-1, '−', 'down');
      const up = stepBtn(1, '+', 'up');
      down.addEventListener('click', () => bump(-1));
      up.addEventListener('click', () => bump(1));
      // After BOTH label spans, so the reading order at a phone's width is label, down, value, up —
      // index 1 would put the step button between the long label and the short one, and the short one is
      // the visible one there, which reads "− Row none +".
      parts.splice(2, 0, down);
      parts.push(up);
    }
    // A stepper's container is a div and a plain slider's is a label, and the difference is only that a
    // button inside a <label> asks the browser to decide whether the label's activation behaviour still
    // forwards to the control. The accessible name is the input's own aria-label either way.
    const node = h(stepper ? 'div' : 'label', { class: `tb-slider fig-ui${stepper ? ' tb-stepper' : ''}` }, parts);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      out.replaceChildren(...values(v));
      onInput?.(v);
    });
    register(node, { only, long: labelText, name: labelText });
    return {
      node, input,
      get value() { return Number(input.value); },
      set(v) { input.value = String(v); out.replaceChildren(...values(v)); onInput?.(Number(v)); },
    };
  }

  // A slider whose narrow form is a stepper. The range stays — it is the control a recipe addresses
  // (`getByRole('slider', { name: 'Row' })`, and three recipes reach for `input[type=range]` by index),
  // it is what a mouse and a keyboard want at desktop width, and it is the accessible control at both.
  // What changes at a phone's width is how it is OPERATED: a 4.4rem track carrying twenty-one stops is
  // about three pixels a stop, which no finger can place, so the track gives way to a pair of step
  // buttons. Use it for a short list or a few dozen stops; a slider with two hundred is still a slider.
  function stepper(labelText, opts = {}) {
    return slider(labelText, { ...opts, stepper: true });
  }

  // The Run/Pause control. One button that says what pressing it will do; `b.playing` is the truth.
  let playing = false;
  let runBtn = null;
  function run({ primary = true, runLabel = 'Run', pauseLabel = 'Pause', aria = null, onChange = null } = {}) {
    const api = {
      get playing() { return playing; },
      set(next) {
        playing = Boolean(next);
        runBtn.replaceChildren(...labelSpans(playing ? pauseLabel : runLabel));
        runBtn.setAttribute('aria-label', playing ? pauseLabel : (aria || runLabel));
        onChange?.(playing);
        if (playing) startLoop();
      },
      toggle() { api.set(!playing); },
    };
    runBtn = makeButton(runLabel, { primary, aria, onClick: () => api.toggle() });
    return api;
  }

  // ---- the keyboard ------------------------------------------------------------------------------
  let keyHandler = null;
  function keys(map) {
    if (!focusPane) throw new Error(`${kind}: keys() with no pane holding the keyboard. Give one pane { focus: true } so there is something to press keys on.`);
    keyHandler = (e) => {
      const fn = map[e.key];
      if (!fn) return;
      e.preventDefault();
      fn(e);
    };
    focusPane.node.addEventListener('keydown', keyHandler);
  }

  // ---- the live region ---------------------------------------------------------------------------
  //
  // Visually hidden the same nine ways eleven figures wrote out by hand. It only has to reach a screen
  // reader; the drawing carries the numbers on the stage.
  Object.assign(live.style, {
    position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0',
    border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap',
  });

  let announceFn = null;
  function announce(message) {
    if (message !== undefined) {
      live.textContent = message;
      return;
    }
    if (!announceFn) return;
    const said = announceFn(describeOwn());
    if (said !== undefined && said !== null) live.textContent = String(said);
  }

  // ---- the clock ---------------------------------------------------------------------------------
  let clockSpec = null;
  let modelTime = 0;
  let raf = 0;
  let lastFrame = 0;

  function clock(spec) {
    if (!spec || typeof spec.advance !== 'function') throw new Error(`${kind}: clock() needs { step, advance }, where advance(dt) is one step of the model.`);
    if (!(spec.step > 0)) throw new Error(`${kind}: clock() was given step ${spec.step}; a fixed step must be a positive number of seconds, e.g. 1 / 60.`);
    clockSpec = { restart: () => {}, running: () => playing, ...spec };
    return clockSpec;
  }

  function startLoop() {
    if (raf || !clockSpec || destroyed) return;
    // Nothing advances on its own while the clock is pinned: that is what makes a screenshot at t the
    // same frame every run. Nothing advances under reduced motion either, until the reader moves it.
    if (ctx.pinnedTime !== null && ctx.pinnedTime !== undefined) return;
    lastFrame = 0;
    const tick = (now) => {
      raf = 0;
      if (destroyed || !clockSpec) return;
      if (!visible || !clockSpec.running()) return;
      const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      if (dt > 0) {
        replay({ from: modelTime, to: modelTime + dt, step: clockSpec.step, advance: clockSpec.advance, restart: () => { modelTime = 0; clockSpec.restart(); } });
        modelTime += Math.floor((dt + clockSpec.step / 1000) / clockSpec.step) * clockSpec.step;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function restart() {
    modelTime = 0;
    rng = mulberry32(seed);
    clockSpec?.restart();
    draw();
  }

  // ---- drawing and layout ------------------------------------------------------------------------
  let drawFn = null;
  let describeFn = null;
  let layoutFn = null;

  function remeasure() {
    for (const pane of panes.values()) pane.measure();
  }

  function draw() {
    if (destroyed || !layouts) return;
    // Before the panes are measured, not after: a group that has just been emptied or filled changes the
    // toolbar's height, and the toolbar's height is the panes' bottom padding.
    refreshGroups();
    remeasure();
    drawFn?.();
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const was = narrow;
    if (narrowBelow) {
      const want = (narrowBelow.width ? w < narrowBelow.width : false) || (narrowBelow.height ? hgt < narrowBelow.height : false);
      if (want !== narrow) {
        narrow = want;
        wrap.classList.toggle('is-narrow', narrow);
      }
    } else if (narrow === null) narrow = false;
    // The width has been decided, so the controls that belong to one of them can be settled, and the
    // figure can be told once rather than comparing `b.narrow` against a flag of its own inside onDraw.
    applyOnly();
    if (narrow !== was) layoutFn?.(narrow);
    // The width changed, so where the toolbar wraps may have changed with it, whatever the groups are
    // doing. refreshGroups() only settles the rules when it moved something.
    if (!refreshGroups()) trimRules();
    applyComposition();
    // The toolbar's own measured height becomes the grid's bottom padding, so nothing can be drawn
    // under it. Two of chapter 3's four label collisions were exactly this.
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 20;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--tb-pad', `${pad}px`);
    }
    return true;
  }

  // Setting a CSS variable does not change the stage, so the observer never sees it and there is no
  // loop; the panes are measured again afterwards, which is what forces the new layout. `phlab` carries
  // a four-line comment about exactly this, and it is the part of the wiring that is easy to get wrong
  // and invisible when you do.
  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    draw();
    if (!ready) {
      ready = true;
      announce();
      ctx.onReady?.();
    }
  }

  const observer = new ResizeObserver(onResize);

  // ---- the readout -------------------------------------------------------------------------------
  //
  // A region, not a helper the figure may decline, and it cannot be made into application chrome: it
  // emits `<text>` and `<line>`. A title in the small-caps register over a rule, label/value rows on
  // hairlines, optional subheads, and a rule at the foot. Figures right-aligned, lining and tabular, so
  // a column of them lines up on the decimal the way a printed table does.
  //
  // The caller does not choose the row height. `fill()` solves for the height that makes the rows fill
  // the box, which is how a table is made to fill its column instead of stopping half way down it —
  // "a panel half empty" is the shared flaw that sent all sixteen of chapters 2 and 3 back for a design
  // pass.
  function makeReadout(pane, { title = null, columns = null, x = 0, y = 0, width = null, size = 10.6, titleSize = 9.4, headSize = 9, minRow = 14, maxRow = 30 } = {}) {
    const rows = [];
    const w = width ?? pane.box.w - x;
    const api = {
      head(label) { rows.push({ kind: 'head', label }); return api; },
      row(label, values, opts = {}) { rows.push({ kind: 'row', label, values: [].concat(values), opts }); return api; },
      sum(label, values, opts = {}) { rows.push({ kind: 'row', label, values: [].concat(values), opts: { ...opts, strong: true } }); return api; },
      rule() { rows.push({ kind: 'rule' }); return api; },
      // A sentence, wrapped to the column it is in. It used to be one <text>, so a sentence longer than
      // the column ran off the right of the stage — and all eight of chapter 5's figures carried the
      // same ten-line breaker to cut it up first. The lines are measured and drawn exactly as separately
      // added notes were, so a figure that stops breaking its own sentences draws the same pixels.
      note(label, opts = {}) { rows.push({ kind: 'note', label, opts }); return api; },
      // The lines one note comes out as at this column width.
      lines(r) { return wrapText(r.label, w, r.opts.size ?? size - 0.6); },
      // How tall those rows come out at that row height. Pure, given the rows.
      height(rowH) {
        let hh = title ? titleSize + 4.5 : 0;
        if (columns) hh += headSize + 4.5;
        let first = true;
        for (const r of rows) {
          if (r.kind === 'head') hh += (first ? 0 : rowH * 0.52) + headSize + 4.5;
          else if (r.kind === 'note') hh += api.lines(r).length * (rowH * 0.34 + (r.opts.size ?? size - 0.6) + 3);
          else if (r.kind === 'rule') hh += 2;
          else hh += rowH;
          first = false;
        }
        return hh;
      },
      // Solve for the row height that fills `into`, then draw. Returns where the table ends.
      fill(into = pane.box.h - y, { rowH = null } = {}) {
        let chosen = rowH;
        if (chosen == null) {
          let lo = minRow;
          let hi = maxRow;
          for (let i = 0; i < 40; i += 1) {
            const mid = (lo + hi) / 2;
            if (api.height(mid) < into) lo = mid;
            else hi = mid;
          }
          // `lo`, not the midpoint between them: `lo` is the largest row height MEASURED to fit and the
          // midpoint is a hair above it. That hair is invisible — it is a forty-bit fraction of a pixel —
          // but `draw` now refuses to paint below the box, so the last row of a table solved to fit
          // exactly was being dropped by it. free-energy lost the sentence under its table to this.
          chosen = lo;
        }
        return api.draw(chosen, into);
      },
      // Build the table, measure it, and if it would not fit build it again shorter. `build(r, level)`
      // adds the rows for that level, 0 being the fullest; the first level that fits at `minRow` is
      // drawn, and if none does the tersest is drawn anyway (and clipped by `draw` rather than painted
      // over the toolbar). All eight of chapter 5's figures wrote this loop, three of them in a longhand
      // that built a fresh readout per attempt.
      fit(into, build, { levels = 3 } = {}) {
        if (typeof build !== 'function') throw new Error(`${kind}: readout().fit() needs a function that adds the rows, called as build(r, level) with level 0 the fullest. It was given ${typeof build}.`);
        if (!(levels >= 1)) throw new Error(`${kind}: readout().fit() was asked for ${levels} levels; there has to be at least one, which is the table with nothing given up.`);
        for (let level = 0; level < levels; level += 1) {
          rows.length = 0;
          build(api, level);
          if (level === levels - 1 || api.height(minRow) <= into) {
            return { level, bottom: api.fill(into), dropped: api.dropped };
          }
        }
        return null; // unreachable: the last level always draws
      },
      draw(rowH = 18, limit = pane.box.h - y) {
        const hair = (yy, colour, sw = 1) => pane.line(x, yy, x + w, yy, { stroke: colour, 'stroke-width': sw });
        const cols = columns ? columns.length : 1;
        // Values are right-aligned to the right edge of their column, the way a printed table sets a
        // column of figures. One value column fills the row; several split the half the labels leave.
        const colRight = (i) => (cols === 1 ? x + w : x + w - (cols - 1 - i) * ((w * 0.5) / cols));
        // Nothing is drawn below this line. A pane's <svg> overflows visibly, so a table with more rows
        // than the pane is tall used to paint over the toolbar — the last two rows under the buttons,
        // which is what all eight of chapter 5's figures worked around by adding prose only while the
        // table still fitted. The pane's own box is the right bound: the bench keeps the toolbar's
        // measured height as the grid's bottom padding, so a readout that stays inside its pane cannot
        // reach the controls.
        // A hundredth of a pixel of slack, so that a row whose arithmetic lands exactly on the box's
        // edge is drawn rather than dropped by the last bit of a floating-point division.
        const floor = y + limit + 0.01;
        let cy = y;
        let dropped = false;
        const roomFor = (hgt) => cy + hgt <= floor;
        if (title) {
          pane.text(x, cy + titleSize, title, { class: 'tb-rt-title', 'font-size': fmt(titleSize) });
          cy += titleSize + 4.5;
          hair(cy, C.ruleStrong);
        }
        if (columns) {
          columns.forEach((c, i) => pane.text(colRight(i), cy + headSize + 1, c, { anchor: 'end', class: 'tb-rt-head', 'font-size': fmt(headSize) }));
          cy += headSize + 4.5;
          hair(cy, C.ruleStrong);
        }
        let first = true;
        outer:
        for (const r of rows) {
          if (r.kind === 'head') {
            const lead = first ? 0 : rowH * 0.52;
            if (!roomFor(lead + headSize + 4.5)) { dropped = true; break; }
            cy += lead;
            pane.text(x, cy + headSize + 1, r.label, { class: 'tb-rt-head', 'font-size': fmt(headSize) });
            cy += headSize + 4.5;
            hair(cy, C.ruleStrong);
          } else if (r.kind === 'rule') {
            if (!roomFor(2)) { dropped = true; break; }
            hair(cy + 1, C.ruleStrong);
            cy += 2;
          } else if (r.kind === 'note') {
            const nsz = r.opts.size ?? size - 0.6;
            for (const line of api.lines(r)) {
              if (!roomFor(rowH * 0.34 + nsz + 3)) { dropped = true; break outer; }
              cy += rowH * 0.34;
              pane.text(x, cy + nsz, line, {
                class: r.opts.accent ? undefined : 'tb-rt-note', 'font-size': fmt(nsz),
                // An accent goes on as an inline style, never as a fill attribute: a presentation
                // attribute loses to any class rule, which is how phlab's three beaker readings once
                // came out identical black while the code asked for three colours.
                style: r.opts.accent ? `fill:${r.opts.accent}` : undefined,
                'font-weight': r.opts.accent ? 600 : undefined,
              });
              cy += nsz + 3;
            }
          } else {
            if (!roomFor(rowH)) { dropped = true; break; }
            const base = cy + rowH * 0.7;
            pane.text(x, base, r.label, { class: 'tb-rt-key', 'font-size': fmt(size) });
            r.values.forEach((v, i) => pane.text(colRight(i), base, String(v), {
              anchor: 'end', class: 'tb-rt-val', 'font-size': fmt(size),
              style: r.opts.accent ? `fill:${r.opts.accent}` : undefined,
              'font-weight': r.opts.strong ? 700 : undefined,
            }));
            if (r.opts.arrow) pane.text(x + w * 0.5, base, r.opts.arrow, { anchor: 'middle', class: 'tb-rt-note', 'font-size': fmt(size) });
            cy += rowH;
            hair(cy - 0.5, C.rule);
          }
          first = false;
        }
        if (!first) hair(cy - 0.5, C.ruleStrong);
        api.dropped = dropped;
        return cy;
      },
      // Set by draw(): true when a row would have fallen below the pane and was left out. A figure that
      // wants to give something up before that happens uses fit() above.
      dropped: false,
    };
    return api;
  }

  // Two series over a moving window: the sparkline `osmometer`, `transport-lab` and `gradient-battery`
  // each wrote separately. Axes are the data's own range, because the point is the shape.
  function drawTrace(pane, { series, data, window: win = 24, x = 0, y = 0, width = null, height = null, label = null }) {
    const w = width ?? pane.box.w - x;
    const hgt = height ?? 60;
    if (!Array.isArray(series) || !series.length) throw new Error(`${kind}: trace() needs at least one series, as [[key, colour], …].`);
    const rows = data.slice(-win);
    pane.line(x, y + hgt, x + w, y + hgt, { stroke: C.rule });
    if (label) pane.text(x, y - 2, label, { class: 'tb-rt-note', 'font-size': 9.4 });
    if (rows.length < 2) return { points: rows.length };
    for (const [key, colour] of series) {
      let lo = Infinity;
      let hi = -Infinity;
      for (const r of rows) {
        lo = Math.min(lo, r[key]);
        hi = Math.max(hi, r[key]);
      }
      const span = hi - lo || 1;
      let d = '';
      rows.forEach((r, i) => {
        const px = x + (i / (rows.length - 1)) * w;
        const py = y + hgt - ((r[key] - lo) / span) * hgt;
        d += `${i ? 'L' : 'M'}${fmt(px)} ${fmt(py)}`;
      });
      pane.path(d, { fill: 'none', stroke: colour, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    }
    return { points: rows.length };
  }

  // ---- describe and the handle -------------------------------------------------------------------
  function describeOwn() {
    return describeFn ? describeFn() : {};
  }

  function handle(extra = {}) {
    if (!layouts) throw new Error(`${kind}: handle() before compose(). The bench has panes and no grid to put them in, so nothing would be measured.`);
    if (!drawFn) throw new Error(`${kind}: handle() before onDraw(). The bench would mount an empty stage and report ready.`);
    wrap.append(toolbar, live);
    root.append(wrap);
    observer.observe(root);
    observer.observe(toolbar);
    const fontsReady = document.fonts?.ready;
    // Twenty-four figures do this and twelve do not, and the twelve are measuring text in a fallback
    // face: the webfont arrives after the first layout and every fitted label is then wrong.
    if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) draw(); });
    onResize();

    return {
      destroy() {
        destroyed = true;
        stopLoop();
        observer.disconnect();
        if (keyHandler && focusPane) focusPane.node.removeEventListener('keydown', keyHandler);
        root.replaceChildren();
      },
      setTime(t) {
        if (destroyed || !ready) return;
        if (clockSpec) {
          const to = Number(t) || 0;
          replay({ from: modelTime, to, step: clockSpec.step, advance: clockSpec.advance, restart: () => { modelTime = 0; clockSpec.restart(); } });
          modelTime = to;
        }
        draw();
      },
      setVisible(v) {
        visible = Boolean(v);
        if (!visible) stopLoop();
        else if (playing) startLoop();
      },
      setTheme() {
        if (!destroyed && ready) draw();
      },
      // The frame spreads its four identity fields last and always wins; the bench spreads its one last
      // for the same reason. Winning silently is not enough on its own, though — the figure's value
      // would be dropped without a word, which is the defect the frame's own rule exists for. So the
      // bench REFUSES instead, here, where it can still tell the two apart. `tools/drive.js` cannot:
      // by the time it reads describe() the two objects are one, and `layout` is legitimately there.
      describe() {
        const own = describeOwn();
        if (own && Object.hasOwn(own, BENCH_DESCRIBE_FIELD)) {
          throw new Error(`${kind}: describe() reports "${BENCH_DESCRIBE_FIELD}", which the bench owns and spreads last — the figure's own value would be dropped without a word. Rename the figure's field, the way foldlab reports foldState rather than the frame's own "state".`);
        }
        return { ...own, [BENCH_DESCRIBE_FIELD]: narrow ? 'narrow' : 'wide' };
      },
      ...extra,
      // Not part of the figure contract: a marker so a gate can tell that this handle came off the
      // bench, and which name the bench put on describe(). It is spread AFTER `extra` so a figure
      // cannot quietly claim to be something it is not.
      benchField: BENCH_DESCRIBE_FIELD,
    };
  }

  // ---- the object the figure talks to -------------------------------------------------------------
  const b = {
    kind,
    scope: selector,
    wrap,
    ns,
    ctx,
    get narrow() { return narrow; },
    get playing() { return playing; },
    get time() { return modelTime; },
    random: () => rng(),
    fit: fitSize,
    num: fmt,
    uid: (prefix) => `${ns}-${prefix}`,
    setVar(name, value) { wrap.style.setProperty(name, value); },
    // For the one case the bench does not own: a figure that sizes a grid row from its own drawing sets
    // the variable that row is written in and then asks for the panes to be measured again. `phlab`
    // asks the beakers how tall they need to be so the window below can have the rest.
    remeasure,
    pane: makePane,
    compose,
    divide,
    action,
    toggle,
    choice,
    slider,
    stepper,
    run,
    keys,
    clock,
    restart,
    announce,
    onDraw(fn) { drawFn = fn; },
    onDescribe(fn) { describeFn = fn; },
    onAnnounce(fn) { announceFn = fn; },
    // Called with the new value of `narrow` each time the stage crosses this figure's own threshold, and
    // once at the first layout. It is the hook two figures were doing without: they kept a `lastNarrow`
    // of their own, compared it inside onDraw, and acted on the change there — which meant the work
    // happened after the panes had already been measured for the new width.
    onLayout(fn) { layoutFn = fn; },
    redraw: draw,
    handle,
  };
  return b;
}
