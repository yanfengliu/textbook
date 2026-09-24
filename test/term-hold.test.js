// npm run unit: a mark written against a term's end is wrapped with the term, once.
//
// Why it exists: a term's button is an atomic inline, and a line may break after one even before a
// comma, so `…a <tb-term>pyrimidine dimer</tb-term>, which…` could begin a line with the comma alone. On
// 2026-09-24, 4 of the 218 terms followed by a mark in chapters 1–8 did so at a 390 px phone, and 6 more at
// 320 px. `<tb-term>` now wraps itself and the run glued to its end in a `<tb-term-hold>`, and
// src/styles/components.css sets that wrapper `white-space: nowrap` and puts a zero-width space after it
// (src/components/term.js, `holdAfter`).
//
// Claim:
//   1. `heldRun` holds closing, final, other and dash punctuation, and a word the label runs on into (a
//      plural's `s`, a `’s`). It holds nothing a space, an opening mark or a Han character begins.
//   2. `holdAfter` splits the text node after the element at that length and wraps the element and the
//      held run in one `<tb-term-hold>`, in place. Everything after the run stays where it was, and an
//      element with no run after it is left alone.
//   3. A built `<tb-term>` does this once. Wrapping moves the element, and a move runs
//      `connectedCallback` again; the second run must not wrap it again.
//   4. The wrapper is the element src/styles/components.css sets `white-space: nowrap`, and not a span. The
//      tag is read from what `holdAfter` builds, so renaming it on one side alone fails here.
//   5. The wrapper's `::after` prints one zero-width space and sets `white-space: normal`. Without it,
//      Chromium sends a held pair down a line early wherever a paragraph sets `hyphens: auto`. The space is
//      written as the character itself, which no one sees in the source, so an edit that empties the
//      string or drops the rule fails here rather than nowhere.
//
// Bound: this runs under a stand-in DOM written below, in Node. It proves the element's own splitting and
// wrapping, and that the stylesheet's text has the rules; it proves nothing about lines, or about a rule
// elsewhere that outweighs this one. That the wrapper keeps the mark on the term's line is a claim about
// layout engines. It was measured with a probe when this landed (0 stranded marks at 320 and 390 px, and
// at every width from 320 to 1440 px, in chapters 1–8), and no gate re-measures it. The stand-in runs
// `connectedCallback` on every insertion into the document, a move included, and runs it when the DOM
// method that inserted returns, not in the middle of it, as `[CEReactions]` does in a browser. Run in the
// middle, a callback that wraps again would find nothing after the element yet, and pass.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ---------- a stand-in document ----------

class FakeNode {
  constructor() {
    this.parentNode = null;
  }

  get nextSibling() {
    const p = this.parentNode;
    return p ? (p.childNodes[p.childNodes.indexOf(this) + 1] ?? null) : null;
  }

  remove() {
    const p = this.parentNode;
    if (!p) return;
    p.childNodes.splice(p.childNodes.indexOf(this), 1);
    this.parentNode = null;
  }

  /** Whether the node is in the document: whether its root is the stand-in's `<body>`. */
  get isConnected() {
    let n = this;
    while (n.parentNode) n = n.parentNode;
    return n === BODY;
  }

  /**
   * Insert `node` into `parent` at `index`. When that puts it in the document, queue `connectedCallback`
   * for it and for everything inside it that has one, in tree order, as a browser does on an insertion or
   * a move. The queue runs when the DOM method this is part of returns (`reacting`).
   */
  static insert(parent, index, node) {
    const n = typeof node === 'string' ? new FakeText(node) : node;
    n.remove();
    parent.childNodes.splice(index, 0, n);
    n.parentNode = parent;
    if (parent.isConnected) queueConnected(n);
  }

  before(node) {
    reacting(() => {
      const p = this.parentNode;
      FakeNode.insert(p, p.childNodes.indexOf(this), node);
    });
  }
}

class FakeText extends FakeNode {
  constructor(data) {
    super();
    this.nodeType = 3;
    this.data = String(data);
  }

  get textContent() {
    return this.data;
  }

  splitText(offset) {
    const rest = new FakeText(this.data.slice(offset));
    this.data = this.data.slice(0, offset);
    const p = this.parentNode;
    if (p) reacting(() => FakeNode.insert(p, p.childNodes.indexOf(this) + 1, rest));
    return rest;
  }
}

class FakeElement extends FakeNode {
  constructor(tag = 'tb-term') {
    super();
    this.nodeType = 1;
    this.localName = tag;
    this.className = '';
    this.childNodes = [];
    this.attributes = new Map();
  }

  append(...nodes) {
    reacting(() => {
      for (const node of nodes) FakeNode.insert(this, this.childNodes.length, node);
    });
  }

  replaceChildren(...nodes) {
    reacting(() => {
      for (const node of [...this.childNodes]) node.remove();
      this.append(...nodes);
    });
  }

  get textContent() {
    return this.childNodes.map((n) => n.textContent).join('');
  }

  set textContent(value) {
    this.replaceChildren(String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener() {}
}

// The custom element reaction stack: one queue per DOM method in progress, run as that method returns.
const reactionStack = [];

function reacting(work) {
  reactionStack.push([]);
  work();
  for (const el of reactionStack.pop()) el.connectedCallback();
}

function queueConnected(node) {
  if (typeof node.connectedCallback === 'function') reactionStack.at(-1).push(node);
  for (const child of node.childNodes ?? []) queueConnected(child);
}

const BODY = new FakeElement('body');

// Installed before term.js is imported, because it defines custom elements and listens on the document
// at module scope; src/shell.js, which it imports, reads `location` there too.
globalThis.window = globalThis;
globalThis.location = { search: '', pathname: '/', href: 'http://localhost/' };
globalThis.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 };
globalThis.HTMLElement = FakeElement;
globalThis.customElements = { define: () => {}, get: () => undefined, whenDefined: () => Promise.resolve() };
globalThis.matchMedia = () => ({ matches: false, addEventListener: () => {} });
globalThis.document = {
  documentElement: new FakeElement('html'),
  body: BODY,
  createElement: (tag) => new FakeElement(tag),
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
};

const { TbTerm, heldRun, holdAfter } = await import('../src/components/term.js');

/**
 * A `<p>` of `before`, one element whose text is `label`, and `after` (null for nothing), built outside
 * the document as the parser builds it before the element is upgraded: the element, and the `<p>`.
 */
function paragraph(before, label, after, make = () => new FakeElement('span')) {
  const p = new FakeElement('p');
  const el = make();
  el.append(label);
  p.append(before, el, ...(after === null ? [] : [after]));
  return { p, el };
}

/** A node as a string: text as it is, an element as `[tag.class: children]`. */
function shape(node) {
  if (node.nodeType === 3) return JSON.stringify(node.data);
  const name = node.className ? `${node.localName}.${node.className}` : node.localName;
  return `[${name}: ${node.childNodes.map(shape).join(' ')}]`;
}

/** A string with every character outside printable ASCII written as its code point, for a message. */
const visible = (s) => s.replace(/[^\x20-\x7e]/gu, (c) => `\\u{${c.codePointAt(0).toString(16).toUpperCase()}}`);

/** components.css with its comments taken out. */
const stylesheet = () => readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// ---------- 1. what a run holds ----------

test('heldRun holds the marks and the word glued to a label, and nothing a new word begins', () => {
  const cases = [
    // [what follows the element, the label's last character, how many code units stay with it]
    [', and the', 'r', 1],
    ['.', 'r', 1],
    [': half of each', 'n', 1],
    ['; the', 'n', 1],
    [').', 's', 2],
    ['s, which', 'e', 2],
    ['’s role', 'l', 2],
    ["'s role", 'l', 2],
    ['—the', 'n', 1],
    ['-dependent', 'P', 1],
    ['2, then', 'C', 2],
    [' and', 'r', 0],
    ['(the', 'r', 0],
    ['“quoted”', 'r', 0],
    ['', 'r', 0],
    ['s', undefined, 0],
    // 資治通鑑: a closing mark stays; a Han character is where a line may begin.
    ['，', '侯', 1],
    ['》，', '記', 2],
    ['。', '侯', 1],
    ['是諸侯', '夫', 0],
    ['、君子', '人', 1],
  ];
  for (const [text, last, want] of cases) {
    assert.equal(heldRun(text, last), want, `heldRun(${JSON.stringify(text)}, ${JSON.stringify(last)}) should hold ${want}`);
  }
  // A character outside the basic plane is one character and two code units, and is counted as two.
  assert.equal(heldRun('𝑠.', 'x'), 3, 'a supplementary-plane letter after a Latin label is held whole, with the mark after it');
});

// ---------- 2. the wrapping ----------

test('holdAfter wraps the element and its run in one <tb-term-hold>, in place, and leaves the rest', () => {
  const { p, el } = paragraph('Both are an instance of ', 'pyrimidine dimer', ', which forms');
  const hold = holdAfter(el);
  assert.ok(hold, 'a comma after the element was not held');
  assert.equal(shape(p), '[p: "Both are an instance of " [tb-term-hold: [span: "pyrimidine dimer"] ","] " which forms"]');
  assert.equal(hold.parentNode, p);
  assert.equal(el.parentNode, hold);
});

test('holdAfter takes a run that is the whole text node without splitting it', () => {
  const { p } = paragraph('the last word is ', 'homeostasis', '.');
  holdAfter(p.childNodes[1]);
  assert.equal(shape(p), '[p: "the last word is " [tb-term-hold: [span: "homeostasis"] "."]]');
});

test('holdAfter leaves an element alone when nothing is glued to its end', () => {
  const cases = [
    ['a space after it', paragraph('a ', 'cell', ' and a gene')],
    ['nothing after it', paragraph('a ', 'cell', null)],
    ['an element after it', paragraph('a ', 'cell', new FakeElement('sup'))],
    ['a Han character after it', paragraph('', '大夫', '是諸侯')],
  ];
  for (const [what, { p, el }] of cases) {
    const before = shape(p);
    assert.equal(holdAfter(el), null, `with ${what}, holdAfter wrapped something`);
    assert.equal(shape(p), before, `with ${what}, holdAfter changed the paragraph`);
  }
});

// ---------- 3. the element does it once ----------

test('a built <tb-term> holds its comma once, though the move runs connectedCallback again', () => {
  let runs = 0;
  class CountedTerm extends TbTerm {
    connectedCallback() {
      runs += 1;
      super.connectedCallback();
    }
  }
  const { p, el } = paragraph('Both are an instance of ', 'pyrimidine dimer', ', which forms', () => {
    const t = new CountedTerm();
    t.setAttribute('ref', 'pyrimidine-dimer');
    return t;
  });
  assert.equal(runs, 0, 'the element was built before its paragraph was in the document');
  BODY.append(p);
  // Once for the build, and once more for the move into the wrapper, which the second run must leave alone.
  assert.equal(runs, 2, `connectedCallback ran ${runs} time(s), where the build and the move are 2`);
  assert.equal(shape(p), '[p: "Both are an instance of " [tb-term-hold: [tb-term: [button: "pyrimidine dimer"]] ","] " which forms"]');
  assert.equal(el.button?.localName, 'button', 'the term has no button');
  assert.equal(el.button.getAttribute('aria-expanded'), 'false');
});

// ---------- 4. the stylesheet holds what the element builds ----------

test('the stylesheet sets the wrapper holdAfter builds white-space: nowrap', () => {
  const { el } = paragraph('an instance of ', 'pyrimidine dimer', ', which');
  const tag = holdAfter(el).localName;
  assert.notEqual(tag, 'span', 'the wrapper is a span, which `.tb-props li span` in components.css makes a block');
  const rule = new RegExp(`(?:^|[},])\\s*${tag}\\s*\\{([^}]*)\\}`, 'm').exec(stylesheet());
  assert.ok(rule, `components.css has no rule for <${tag}>, the element holdAfter wraps a term and its mark in`);
  assert.match(rule[1], /white-space:\s*nowrap/, `the <${tag}> rule in components.css does not set white-space: nowrap, so a line may still break between a term and its mark`);
});

// ---------- 5. the space after the pair ----------

test('the stylesheet puts one zero-width space after the wrapper, which wraps as the paragraph does', () => {
  const { el } = paragraph('an instance of ', 'pyrimidine dimer', ', which');
  const tag = holdAfter(el).localName;
  const want = ['"\u200B"', '"\u200B" / ""'];
  const shown = (list) => (list.length ? list.map(visible).join(', then ') : 'nothing');
  const rule = new RegExp(`(?:^|[},])\\s*${tag}::after\\s*\\{([^}]*)\\}`, 'm').exec(stylesheet());
  assert.ok(rule, `components.css has no rule for ${tag}::after. Without the zero-width space it prints, Chromium sends a held term and its mark down a line early wherever a paragraph sets hyphens: auto. The rule prints ${shown(want)} and sets white-space: normal.`);
  const got = [...rule[1].matchAll(/content\s*:\s*([^;]+)/g)].map((m) => m[1].trim());
  assert.deepEqual(got, want, `${tag}::after in components.css prints ${shown(got)}, where it should print ${shown(want)}: one zero-width space (U+200B) written as the character itself, then the same with empty alternative text, which is what was measured. The escape \\200B has a Latin letter, which test/strings.test.js takes for an English word.`);
  assert.match(rule[1], /white-space:\s*normal/, `${tag}::after in components.css does not set white-space: normal. Inheriting the pair's nowrap, its space made no difference to Chromium.`);
});
