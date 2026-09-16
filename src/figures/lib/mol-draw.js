// Shared drawing for the chapter-2 molecular figures (phlab, carbonkit, polymer, foldlab, and anything
// later that draws atoms). One element-colour table, one seeded generator, one way to draw an atom, a
// bond, a hydrogen bond and a scale bar, so the five molecular figures of the chapter agree with each
// other the way chapter 1's organelle colours do.
//
// The colours are the table in biology/ch02-chemistry-of-life/FIGURES.md and they are CSS expressions
// from lib/svg.js, never hex, so every atom follows the theme with no code of its own.
//
// Nothing here keeps state. Everything is a pure function of its arguments, which is what lets the
// figures above be pure functions of their clock and the reader's actions.

import { el, text, C, tint } from './svg.js';

// ---------------------------------------------------------------- the seeded generator

// mulberry32: 32 bits of state, good enough for jitter and for a Monte Carlo search, and identical on
// every machine. No figure in this chapter may call Math.random, because a screenshot at t must be the
// same frame every run and foldlab's whole claim is that one sequence folds one way.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A stable 32-bit hash of a string, for deriving a seed from a sequence.
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// ---------------------------------------------------------------- the element table

// `covalentPm` is the covalent radius in picometres (Cordero et al. 2008, rounded), so a figure that
// says it is to scale can be. `fill`/`stroke` are the chapter's colour table.
export const ELEMENTS = Object.freeze({
  C: { symbol: 'C', name: 'carbon', fill: C.soft, stroke: C.soft, label: C.paper, covalentPm: 76 },
  H: { symbol: 'H', name: 'hydrogen', fill: C.paper3, stroke: C.ruleStrong, label: C.soft, covalentPm: 31 },
  O: { symbol: 'O', name: 'oxygen', fill: C.coral, stroke: C.coral, label: C.paper, covalentPm: 66 },
  N: { symbol: 'N', name: 'nitrogen', fill: C.water, stroke: C.water, label: C.paper, covalentPm: 71 },
  P: { symbol: 'P', name: 'phosphorus', fill: C.violet, stroke: C.violet, label: C.paper, covalentPm: 107 },
  S: { symbol: 'S', name: 'sulfur', fill: C.gold, stroke: C.gold, label: C.paper, covalentPm: 105 },
  // Na, K, Ca, Cl and Mg share one colour and are told apart by the symbol written on them, which is
  // the rule in FIGURES.md: charge and identity are never colour alone.
  Na: { symbol: 'Na', name: 'sodium', fill: C.leaf, stroke: C.leaf, label: C.paper, covalentPm: 166, ion: true },
  K: { symbol: 'K', name: 'potassium', fill: C.leaf, stroke: C.leaf, label: C.paper, covalentPm: 203, ion: true },
  Ca: { symbol: 'Ca', name: 'calcium', fill: C.leaf, stroke: C.leaf, label: C.paper, covalentPm: 176, ion: true },
  Cl: { symbol: 'Cl', name: 'chlorine', fill: C.leaf, stroke: C.leaf, label: C.paper, covalentPm: 102, ion: true },
  Mg: { symbol: 'Mg', name: 'magnesium', fill: C.leaf, stroke: C.leaf, label: C.paper, covalentPm: 141, ion: true },
});

export function element(sym) {
  const e = ELEMENTS[sym];
  if (!e) throw new Error(`no colour for element "${sym}"; the table in lib/mol-draw.js holds ${Object.keys(ELEMENTS).join(', ')}`);
  return e;
}

// The C–C single bond, the length every molecular drawing in this chapter is scaled against.
export const CC_BOND_PM = 154;

// ---------------------------------------------------------------- atoms and bonds

// One atom: a filled disc with its symbol on it, and optionally a charge glyph at the upper right.
// `r` is in drawing units. `charge` is a string ('+', '−', 'δ+', 'δ−', '2−') or null; never colour alone.
export function atom(x, y, sym, r, { charge = null, label = true, fontScale = 1, className = '', title = null, faded = false } = {}) {
  const e = element(sym);
  const g = el('g', { class: `mol-atom ${className}`.trim(), 'data-element': sym });
  if (faded) g.setAttribute('opacity', '0.35');
  g.append(el('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: r.toFixed(2), fill: e.fill, stroke: e.stroke, 'stroke-width': (r * 0.14).toFixed(2) }));
  if (label && r >= 4.4) {
    const fs = r * (e.symbol.length > 1 ? 1.08 : 1.28) * fontScale;
    g.append(text(x.toFixed(2), (y + fs * 0.35).toFixed(2), e.symbol, { anchor: 'middle', fill: e.label, 'font-size': fs.toFixed(2), 'font-weight': 600, class: 'mol-sym' }));
  }
  if (charge) {
    const fs = Math.max(8, r * 0.95);
    g.append(text((x + r * 0.92).toFixed(2), (y - r * 0.72).toFixed(2), charge, { anchor: 'middle', fill: C.ink, 'font-size': fs.toFixed(2), 'font-weight': 700, class: 'mol-charge' }));
  }
  if (title) g.append(el('title', { text: title }));
  return g;
}

// A covalent bond: solid ink, one line for a single bond, two for a double, three for a triple.
export function bond(x1, y1, x2, y2, order = 1, { width = 2.4, colour = C.ink, gap = null, className = '' } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const sep = gap ?? width * 1.5;
  const g = el('g', { class: `mol-bond ${className}`.trim() });
  const offsets = order === 2 ? [-sep / 2, sep / 2] : order === 3 ? [-sep, 0, sep] : [0];
  for (const o of offsets) {
    g.append(el('line', {
      x1: (x1 + nx * o).toFixed(2), y1: (y1 + ny * o).toFixed(2),
      x2: (x2 + nx * o).toFixed(2), y2: (y2 + ny * o).toFixed(2),
      stroke: colour, 'stroke-width': width.toFixed(2), 'stroke-linecap': 'round',
    }));
  }
  return g;
}

// A hydrogen bond: dashed, faint. The dash is the signal, so it stays dashed under reduced motion; only
// the flicker in time goes.
export function hydrogenBond(x1, y1, x2, y2, { width = 1.6, dash = '4 3.5', opacity = 1 } = {}) {
  return el('line', {
    x1: x1.toFixed(2), y1: y1.toFixed(2), x2: x2.toFixed(2), y2: y2.toFixed(2),
    stroke: C.faint, 'stroke-width': width.toFixed(2), 'stroke-dasharray': dash, 'stroke-linecap': 'round',
    opacity: opacity.toFixed(3), class: 'mol-hbond',
  });
}

// An ionic attraction: dotted gold.
export function ionicBond(x1, y1, x2, y2, { width = 2, opacity = 1 } = {}) {
  return el('line', {
    x1: x1.toFixed(2), y1: y1.toFixed(2), x2: x2.toFixed(2), y2: y2.toFixed(2),
    stroke: C.gold, 'stroke-width': width.toFixed(2), 'stroke-dasharray': `0.1 ${(width * 2.1).toFixed(2)}`,
    'stroke-linecap': 'round', opacity: opacity.toFixed(3), class: 'mol-ionic',
  });
}

// The scale bar every molecular figure states: a rule of `lengthUnits` drawing units labelled with the
// distance it stands for.
export function scaleBar(x, y, lengthUnits, label, { fontSize = 10.5, colour = C.faint } = {}) {
  const g = el('g', { class: 'mol-scale', 'aria-hidden': 'true' });
  const tick = fontSize * 0.42;
  g.append(el('path', {
    d: `M${x.toFixed(1)} ${(y - tick).toFixed(1)} L${x.toFixed(1)} ${(y + tick).toFixed(1)} M${x.toFixed(1)} ${y.toFixed(1)} L${(x + lengthUnits).toFixed(1)} ${y.toFixed(1)} M${(x + lengthUnits).toFixed(1)} ${(y - tick).toFixed(1)} L${(x + lengthUnits).toFixed(1)} ${(y + tick).toFixed(1)}`,
    stroke: colour, 'stroke-width': 1.1, fill: 'none',
  }));
  g.append(text((x + lengthUnits / 2).toFixed(1), (y - tick - fontSize * 0.45).toFixed(1), label, { anchor: 'middle', fill: colour, 'font-size': fontSize.toFixed(1) }));
  return g;
}

// ---------------------------------------------------------------- accents that carry small text
//
// The figure accents are tuned for large areas of colour sitting against each other. At the sizes a
// readout is set in they fall short of WCAG AA on the paper — tokens.css says so, and carries
// --leaf-text, --water-text and --coral-text for exactly this. Violet and gold have no token of their
// own, so they are derived here the same way those three are: mixed towards --ink, which flips with the
// theme, so the one expression darkens on paper and lightens on the dark paper.
// Measured on --paper: violet 5.6 light / 8.4 dark, gold 4.6 light / 11.5 dark.
export const INK = Object.freeze({
  leaf: 'var(--leaf-text)',
  water: 'var(--water-text)',
  coral: 'var(--coral-text)',
  violet: tint(C.violet, 86, C.ink),
  gold: tint(C.gold, 62, C.ink),
});

// ---------------------------------------------------------------- the shared readout
//
// The four benches of this chapter are four instruments on one page, so they print one readout: a
// reference table, not a dashboard. A title in the small-caps register over a rule, label/value rows
// on hairlines, optional subheads that group the rows, and a rule at the foot. No pills, no chips, no
// bordered boxes, no bars with text on them; figures right-aligned, lining and tabular, so a column of
// them lines up on the decimal the way a printed table does.
//
// The caller owns the vertical budget: it passes the row height it wants, which is how a table is made
// to fill the column it sits in rather than stopping half way down it.
//
// Scoped to the figure's own wrapper class, because a figure's styles are its own: pass '.tb-foldlab'.
export const readoutCss = (scope) => `
${scope} .mol-rt-title { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
${scope} .mol-rt-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
${scope} .mol-rt-key { fill: var(--ink-soft); }
${scope} .mol-rt-val { fill: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
${scope} .mol-rt-note { fill: var(--ink-faint); }
${scope} .mol-focus { opacity: 0; }
${scope} svg:focus-visible { outline: none; }
${scope} svg:focus-visible .mol-focus { opacity: 1; }
`;

// A row is ['label', 'value'] or ['label', 'value', { accent }]; { head } starts a group; { note } is a
// line of prose across the table. Returns the y the table ends at, so the caller can set what follows.
// An accent goes on as an inline style, never as a fill attribute: a presentation attribute loses to
// any class rule, so `fill: colour` beside `class: 'x-val'` is silently the class's colour. That is how
// phlab's three beaker readings came out identical black while the code asked for three colours.
export function readoutTable(parent, rows, {
  x = 0, y = 0, width = 200, rowH = 18, size = 10.6, title = null,
  titleSize = 9.4, headSize = 9, footRule = true,
} = {}) {
  const rule = (yy, colour, w = 1) => parent.append(el('line', {
    x1: x.toFixed(1), y1: yy.toFixed(1), x2: (x + width).toFixed(1), y2: yy.toFixed(1),
    stroke: colour, 'stroke-width': w,
  }));
  let cy = y;
  if (title) {
    parent.append(text(x, cy + titleSize, title, { class: 'mol-rt-title', 'font-size': titleSize.toFixed(1) }));
    cy += titleSize + 4.5;
    rule(cy, C.ruleStrong);
  }
  let first = true;
  let footDone = false;
  for (const row of rows) {
    if (!row) continue;
    if (row.head) {
      if (!first) cy += rowH * 0.52;
      parent.append(text(x, cy + headSize + 1, row.head, { class: 'mol-rt-head', 'font-size': headSize.toFixed(1) }));
      cy += headSize + 4.5;
      rule(cy, C.ruleStrong);
      first = false;
      continue;
    }
    if (row.note) {
      // A note is a gloss on the table, so the table closes above it rather than round it.
      if (footRule && !footDone && !first) {
        rule(cy - 0.5, C.ruleStrong);
        footDone = true;
      }
      const ns = row.size ?? size - 0.6;
      cy += rowH * 0.34;
      parent.append(text(x, cy + ns, row.note, {
        class: row.colour ? undefined : 'mol-rt-note', 'font-size': ns.toFixed(1),
        style: row.colour ? `fill:${row.colour}` : undefined, 'font-weight': row.colour ? 600 : undefined,
      }));
      cy += ns + 3;
      first = false;
      continue;
    }
    const [k, v, o = {}] = row;
    const base = cy + rowH * 0.7;
    parent.append(text(x, base, k, { class: 'mol-rt-key', 'font-size': size.toFixed(1) }));
    parent.append(text(x + width, base, v, {
      anchor: 'end', class: 'mol-rt-val', 'font-size': size.toFixed(1),
      style: o.accent ? `fill:${o.accent}` : undefined,
    }));
    cy += rowH;
    rule(cy - 0.5, C.rule);
    first = false;
  }
  if (footRule && !footDone && !first) rule(cy - 0.5, C.ruleStrong);
  return cy;
}

// How tall readoutTable will draw those rows at that row height, so a caller can solve for the row
// height that fills its column instead of guessing one and leaving the bottom half empty.
export function readoutHeight(rows, { rowH = 18, size = 10.6, title = null, titleSize = 9.4, headSize = 9 } = {}) {
  let h = title ? titleSize + 4.5 : 0;
  let first = true;
  for (const row of rows) {
    if (!row) continue;
    if (row.head) {
      if (!first) h += rowH * 0.52;
      h += headSize + 4.5;
    } else if (row.note) {
      h += rowH * 0.34 + (row.size ?? size - 0.6) + 3;
    } else h += rowH;
    first = false;
  }
  return h;
}

// Solve for the row height that makes those rows fill `height`, within what a row may be: under about
// 14 px the hairlines crowd the figures, over about 30 px the label and its value stop reading as one
// row. Returns the row height and the slack left over, which the caller spends as margin rather than
// as a hole at the bottom of the column.
export function fitRows(rows, height, opts = {}, min = 14, max = 30) {
  let lo = min;
  let hi = max;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (readoutHeight(rows, { ...opts, rowH: mid }) < height) lo = mid;
    else hi = mid;
  }
  const rowH = (lo + hi) / 2;
  return { rowH, slack: Math.max(0, height - readoutHeight(rows, { ...opts, rowH })) };
}

// ---------------------------------------------------------------- the keyboard focus mark
//
// Four corner brackets rather than a ring round the pane. A 2 px accent rectangle with a radius on it
// reads as a card drawn round the artwork — which is what a book does not do — and it is on screen in
// every driven screenshot because the recipe focuses the pane. Brackets say "this region has the
// keyboard" and cannot be mistaken for a frame. Hidden until :focus-visible by readoutCss.
export function focusMark(w, h, { inset = 3, colour = C.water } = {}) {
  const len = Math.max(9, Math.min(20, w * 0.06, h * 0.16));
  const a = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const d = [
    `M${a} ${(a + len).toFixed(1)} L${a} ${a} L${(a + len).toFixed(1)} ${a}`,
    `M${(x1 - len).toFixed(1)} ${a} L${x1.toFixed(1)} ${a} L${x1.toFixed(1)} ${(a + len).toFixed(1)}`,
    `M${x1.toFixed(1)} ${(y1 - len).toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)} L${(x1 - len).toFixed(1)} ${y1.toFixed(1)}`,
    `M${(a + len).toFixed(1)} ${y1.toFixed(1)} L${a} ${y1.toFixed(1)} L${a} ${(y1 - len).toFixed(1)}`,
  ].join(' ');
  return el('path', { d, class: 'mol-focus', fill: 'none', stroke: colour, 'stroke-width': 2.2, 'stroke-linecap': 'square' });
}

// ---------------------------------------------------------------- small shared formatting

// A number with a fixed number of decimals, as a number rather than a string, for describe().
export const round = (v, dp = 2) => Number(Number(v).toFixed(dp));

// Thousands grouped with a thin space, which is what a table of figures uses: a comma in a column of
// tabular figures puts a mark where the eye wants a gap. 220000 becomes 220 000.
export const grouped = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Subscript digits, for formulae written into SVG text where <tspan baseline-shift> is fiddly.
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
export const subscript = (n) => String(n).split('').map((d) => SUB[d] ?? d).join('');

// Superscript, for charges: 2− becomes a raised 2 and a minus.
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻' };
export const superscript = (s) => String(s).split('').map((d) => SUP[d] ?? d).join('');

// 'C6H12O6' written with real subscripts, for display.
export function prettyFormula(formula) {
  return formula.replace(/([A-Z][a-z]?)(\d*)/g, (_, sym, n) => sym + (n ? subscript(n) : ''));
}
