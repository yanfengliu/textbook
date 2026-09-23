// npm run unit: a multiple-choice question cannot be answered by where its options stand.
//
// Why it exists: every item bank in the biology book was written with the correct option first — 233 of
// 233 multiple-choice items across chapters 1 to 5 — and the Today page drew the options in that order.
// A reader who pressed A every time was right every time, and the record said "right" about answers that
// carried no knowledge, so every word the page then said about that reader claimed more than the record
// could support. Measured 2026-09-22. The chapters' own checks had a milder form of the same tell: their
// correct option was written at B or C in 34 of 36, so pressing B was right 21 times in 36.
//
// Claim, for Today (src/components/mastery.js). Every multiple-choice item in every item bank on disk
// (`<book>/<chapter>/items.js`) is asked four times through the component's own renderStep(), and each
// asking is answered through one of the component's own input paths, so the record the next asking reads
// holds 0, 1, 2 and then 3 earlier answers to that item. Then:
//
//   1. Where the correct option is shown is spread across the positions. For each bank over its four
//      askings, and for each asking over every bank, the position is tested against the uniform
//      distribution with a chi-square goodness-of-fit test, grouped by how many options the items have;
//      a group fails when its statistic passes the upper-tail 1e-4 critical value in CRITICAL below
//      (21.108 for four options). A correct shuffle fails any one of those tests 1 time in 10,000. The
//      defect scores 3 per item — 699 on one asking of the five banks — and a shuffle that could never
//      put the correct option first scores about 78. A group whose expected count per position is under
//      5 is printed and not judged, and at least 90% of the placements must be judged.
//   2. Asking again draws again. Over every item and every pair of consecutive askings, the number of
//      times the correct option is shown where it was shown the time before must lie within 3.89
//      standard deviations (two-sided p = 1e-4) of what independent draws give: the sum of 1/n, with
//      variance the sum of (1/n)(1 - 1/n), for n options. The same order every time scores every pair;
//      an order forced to move scores none, and would tell a reader where the answer is not; both fail.
//   3. The letters follow the screen: the buttons read A, B, C, D from the top, every time.
//   4. Answering by position records the authored letter. The first and third askings of an item are
//      answered at the correct option and the second and fourth at a distractor, each by a click on the
//      button, by the letter printed on it, or by its digit, rotating. The event the store then holds must
//      name the item, carry the right outcome, and have `chose` equal to the bank's own letter for the
//      option whose text was on the pressed button — found by its text in the bank, never through the
//      permutation. Its fields must be exactly the ones an answer carried before options were shuffled.
//      Only the button showing the correct option's text is marked `is-correct`; the pressed button is
//      marked `is-wrong` exactly when it is a distractor; the `why` the page shows is that distractor's
//      own. Every input path must carry at least one right and one wrong answer.
//
// Claim, for the chapters' checks (src/components/check.js). Every <tb-check> on every chapter page on
// disk is built as its page writes it and mounted through the component's own connectedCallback(), one
// page at a time, under the page's own `lang` and address. Every other check is then answered at its
// correct option by a click, and the rest at a distractor. Then:
//
//   5. Where the correct option is shown, over every check on disk, passes the same chi-square bound.
//      The 36 checks on disk on 2026-09-23 score 32.00 on it as written (A 1, B 21, C 13, D 1).
//   6. The letters read A, B, C, D from the top, the buttons show each option once, and `data-correct`
//      is set on exactly the button showing the correct option's text. That attribute is what
//      tools/flow.js presses by.
//   7. The answer follows the option. `data-answered` says "right" exactly when the pressed button
//      showed the correct option's text. Only that button is marked `is-correct`; the pressed button is
//      marked `is-wrong` exactly when it is a distractor; every button is disabled; the explanation is
//      shown, under a verdict of the same kind.
//   8. The order belongs to the page, not to where it is served. Every page is drawn again at its
//      published address — under /textbook/, with index.html, a query and a hash — and every check must
//      show the same order.
//   9. The id is qualified by the page. One eight-option check with the same id on two chapter pages
//      must show two different orders; keyed by the id alone, every chapter's q1 would share one.
//
// Bound, stated rather than hidden:
//
//   - A check is answered once, by a click. Enter on a focused option is `npm run flow`'s, on chapter 1
//     and on every 通鑑 chapter, in a real browser. Whether an explanation names an option by where it
//     is written ("the last option") is not read here: `npm run check` fails that wording.
//   - The check bound pools every check on disk into one test, because a page holds five at most. Over
//     36 checks it catches a tell as strong as the authored order and not a weak one; on those 36 the
//     draw scores 3.78 against 21.108. A check with no id, which is keyed by its number on the page, is
//     not driven, because every check on disk has one.
//   - The document is a stand-in written below: the smallest one the two components' render and answer
//     paths need. It parses no markup — an option's text is kept as the string the bank wrote, or as the
//     text the page wrote with its markup dropped, which is what the text comparisons read — and it
//     dispatches an event only to the element it is fired at. The keyboard path is fired at
//     <tb-sitting>, where the component listens, as the key would bubble to it from the focused button.
//     `npm run sitting` is what answers by Enter and by the printed letter in a real browser, and reads
//     each recorded `chose` back through the bank.
//   - It drives renderStep() and the handlers the component registers, not boot(): which items a sitting
//     picks, and how the banks are fetched, are `npm run sitting`'s. The record is the page's own store,
//     in memory, and the count of earlier answers is read by the component from it, not handed in.
//   - The verdict is not a sample. The banks, the pages and the seeds fix every order, so a re-run
//     changes nothing. A correct shuffle over a new bank crosses one of these bars about 1 time in 1,000
//     across all of them; that reads as a statistic just past its bar, where the defect reads in the
//     hundreds.
//   - It says nothing about what an option's words give away. The correct option is also the longest in
//     220 of the 233 items, and no order can hide that.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { discoverBooks } from '../tools/lib/browser.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

// The letters an answer is recorded with: A for the bank's first option. This is the record's format
// (docs/design/adaptive.md, `chose`), written here rather than read from the component, because it is the
// half of the comparison the component must agree with.
const LETTERS = 'ABCDEFGH';

// Chi-square critical values at an upper-tail probability of 1e-4, by degrees of freedom (options - 1),
// computed from the regularized upper incomplete gamma function and checked against published tables.
const CRITICAL = { 1: 15.137, 2: 18.421, 3: 21.108, 4: 23.513, 5: 25.745, 6: 27.856, 7: 29.877 };
// A two-sided normal bound at p = 1e-4.
const Z = 3.8906;
// A position group is judged only when each position expects at least this many placements.
const MIN_EXPECTED = 5;
const MIN_JUDGED = 0.9;

// The fields a Today answer carried before options were shuffled, including the three the store adds
// (t, learner, session). `tools/serve.js` validates them and `tools/review.js` reads them; a field added
// here is a change to a persistent format, which is not this component's to make.
const EVENT_KEYS = ['chose', 'confidence', 'item', 'kind', 'learner', 'ms', 'objective', 'options', 'outcome', 'session', 'source', 't'];

// ---------- a stand-in document ----------

let doc = null;

class FakeText {
  constructor(data) {
    this.nodeType = 3;
    this.data = String(data);
    this.parentNode = null;
  }

  get textContent() { return this.data; }
}

function detach(node) {
  const parent = node.parentNode;
  if (!parent) return;
  parent.childNodes.splice(parent.childNodes.indexOf(node), 1);
  node.parentNode = null;
}

// One simple selector: a tag, classes and bare attributes. Anything else throws, so a component that
// starts asking for a selector this stand-in cannot read fails here, loudly, instead of matching nothing.
function matchesCompound(el, compound) {
  if (el.nodeType !== 1) return false;
  if (compound === '*') return true;
  const m = /^([a-zA-Z][\w-]*)?((?:\.[\w-]+)*)((?:\[[\w-]+\])*)$/.exec(compound);
  if (!m || !compound) throw new Error(`the stand-in document in test/choice-order.test.js cannot read the selector "${compound}"; teach matchesCompound() the form, or drive this path in a browser gate`);
  if (m[1] && el.tagName !== m[1].toUpperCase()) return false;
  for (const c of m[2].split('.').filter(Boolean)) if (!el.classList.contains(c)) return false;
  for (const a of m[3].match(/[\w-]+/g) ?? []) if (!el.hasAttribute(a)) return false;
  return true;
}

// A selector list of compounds joined only by the child combinator.
function matchesChain(el, selector) {
  const parts = selector.trim().split(/\s*>\s*/);
  let node = el;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (/\s/.test(parts[i])) throw new Error(`the stand-in document in test/choice-order.test.js reads only the child combinator; "${selector}" uses another`);
    if (!node || !matchesCompound(node, parts[i])) return false;
    node = node.parentNode;
  }
  return true;
}

class FakeElement {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this.nodeType = 1;
    this.childNodes = [];
    this.parentNode = null;
    this.attrs = new Map();
    this.dataset = {};
    this.style = {};
    this.listeners = [];
    this.hidden = false;
    this.disabled = false;
  }

  get id() { return this.attrs.get('id') ?? ''; }

  set id(v) { this.attrs.set('id', String(v)); }

  get className() { return this.attrs.get('class') ?? ''; }

  set className(v) { this.attrs.set('class', String(v)); }

  get classList() {
    const names = () => this.className.split(/\s+/).filter(Boolean);
    return {
      add: (...add) => { this.className = [...new Set([...names(), ...add])].join(' '); },
      remove: (...drop) => { this.className = names().filter((c) => !drop.includes(c)).join(' '); },
      contains: (c) => names().includes(c),
    };
  }

  getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }

  setAttribute(k, v) { this.attrs.set(k, String(v)); }

  hasAttribute(k) { return this.attrs.has(k); }

  removeAttribute(k) { this.attrs.delete(k); }

  get attributes() { return [...this.attrs].map(([name, value]) => ({ name, value })); }

  get children() { return this.childNodes.filter((c) => c.nodeType === 1); }

  insertAt(item, at) {
    const node = typeof item === 'string' ? new FakeText(item) : item;
    detach(node);
    node.parentNode = this;
    this.childNodes.splice(Math.min(at, this.childNodes.length), 0, node);
  }

  append(...nodes) { for (const n of nodes) this.insertAt(n, this.childNodes.length); }

  prepend(...nodes) { nodes.forEach((n, i) => this.insertAt(n, i)); }

  replaceChildren(...nodes) {
    for (const c of [...this.childNodes]) detach(c);
    this.append(...nodes);
  }

  remove() { detach(this); }

  replaceWith(...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    const at = parent.childNodes.indexOf(this);
    detach(this);
    nodes.forEach((n, i) => parent.insertAt(n, at + i));
  }

  get textContent() { return this.childNodes.map((c) => c.textContent).join(''); }

  set textContent(v) { this.replaceChildren(...(String(v) ? [String(v)] : [])); }

  // Markup is kept as the string it was given and never parsed: every comparison below is against the
  // string the bank or the page wrote.
  get innerHTML() { return this.childNodes.map((c) => (c.nodeType === 3 ? c.data : c.outerHTML)).join(''); }

  set innerHTML(v) { this.replaceChildren(...(String(v) ? [String(v)] : [])); }

  get outerHTML() {
    const tag = this.tagName.toLowerCase();
    return `<${tag}>${this.innerHTML}</${tag}>`;
  }

  addEventListener(type, fn) { this.listeners.push({ type, fn }); }

  removeEventListener(type, fn) { this.listeners = this.listeners.filter((l) => l.type !== type || l.fn !== fn); }

  // An event reaches only the element it is fired at; see the header.
  fire(type, init = {}) {
    const event = {
      type,
      target: this,
      defaultPrevented: false,
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      ...init,
      preventDefault() { this.defaultPrevented = true; },
    };
    for (const l of this.listeners.filter((x) => x.type === type)) l.fn.call(this, event);
    return event;
  }

  focus() { doc.activeElement = this; }

  blur() { if (doc.activeElement === this) doc.activeElement = doc.body; }

  contains(node) {
    for (let n = node; n; n = n.parentNode) if (n === this) return true;
    return false;
  }

  matches(selector) { return selector.split(',').some((s) => matchesChain(this, s)); }

  closest(selector) {
    for (let n = this; n && n.nodeType === 1; n = n.parentNode) if (n.matches(selector)) return n;
    return null;
  }

  querySelectorAll(selector) {
    const out = [];
    const visit = (node) => {
      for (const c of node.children) {
        if (c.matches(selector)) out.push(c);
        visit(c);
      }
    };
    visit(this);
    return out;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

doc = {
  readyState: 'complete',
  // The page's address. Only the check component reads it (src/components/check.js, pageOf()), and the
  // check test below sets it per page.
  URL: 'http://localhost/',
  documentElement: new FakeElement('html'),
  body: new FakeElement('body'),
  activeElement: null,
  createElement: (tag) => new FakeElement(tag),
  createTextNode: (text) => new FakeText(text),
  querySelector: (selector) => doc.body.querySelector(selector),
  querySelectorAll: (selector) => doc.body.querySelectorAll(selector),
  addEventListener: () => {},
};

// Installed before the components are imported, because they define custom elements at module scope.
// `location` is deliberately left undefined: the store would otherwise try to mirror each answer to a
// dev server (src/learning/store.js, shouldPost()).
globalThis.window = globalThis;
globalThis.document = doc;
globalThis.HTMLElement = FakeElement;
globalThis.customElements = { define: () => {}, get: () => undefined, whenDefined: () => Promise.resolve() };

const { TbSitting } = await import('../src/components/mastery.js');
const { learning } = await import('../src/components/task.js');
const { TbCheck } = await import('../src/components/check.js');
// The pages are read with the content checker's own parser, the one `npm run check` reads them with.
// Imported here rather than at the top, because it imports src/components/task.js, which must not load
// before the stand-in is installed.
const { parseHtml, findAll, textOf } = await import('../tools/check-content.js');

// ---------- what is on disk ----------

// Every chapter of every book, from the one discovery the gates share (tools/lib/browser.js), so a
// chapter or a book added later is covered the moment its index.html exists.
function chapterDirs() {
  return discoverBooks(ROOT).flatMap((b) => b.chapters.map((c) => ({ book: b.id, chapter: c.slug, dir: join(ROOT, b.id, c.slug) })));
}

const optionText = (o) => o.text ?? o.html ?? o.label ?? String(o);

// ---------- the statistics ----------

function chiSquare(counts) {
  const n = counts.reduce((a, b) => a + b, 0);
  const expected = n / counts.length;
  return counts.reduce((s, o) => s + ((o - expected) ** 2) / expected, 0);
}

// placements: [{ n, at }], where `at` is the position the correct option was shown in, of n. Returns
// what was judged, what was not, and every group that failed.
function spread(placements, label) {
  const groups = new Map();
  for (const { n, at } of placements) {
    if (!groups.has(n)) groups.set(n, new Array(n).fill(0));
    groups.get(n)[at] += 1;
  }
  const lines = [];
  const failures = [];
  let judged = 0;
  for (const [n, counts] of [...groups].sort((a, b) => a[0] - b[0])) {
    const total = counts.reduce((a, b) => a + b, 0);
    const critical = CRITICAL[n - 1];
    if (total / n < MIN_EXPECTED || critical === undefined) {
      lines.push(`${label}, ${n} options: ${JSON.stringify(counts)} not judged (${critical === undefined ? `no critical value for ${n - 1} degrees of freedom` : `${(total / n).toFixed(1)} expected per position, under ${MIN_EXPECTED}`})`);
      continue;
    }
    judged += total;
    const x2 = chiSquare(counts);
    lines.push(`${label}, ${n} options: correct option shown at ${JSON.stringify(counts)} by position, chi-square ${x2.toFixed(2)} against ${critical}`);
    if (x2 > critical) {
      failures.push(`${label}: over ${total} question(s) with ${n} options the correct option was shown at positions ${JSON.stringify(counts)} (A first), chi-square ${x2.toFixed(2)} on ${n - 1} degrees of freedom, above the ${critical} a uniform draw stays under 9,999 times in 10,000. A reader choosing by position does better than chance here.`);
    }
  }
  return { lines, failures, judged, total: placements.length };
}

// ---------- Today ----------

test('Today: where the correct option is shown does not give it away, and answering by position records the option', async (t) => {
  const banks = [];
  for (const c of chapterDirs()) {
    const file = join(c.dir, 'items.js');
    if (!existsSync(file)) continue;
    const { ITEMS } = await import(pathToFileURL(file).href);
    const items = (ITEMS ?? []).filter((i) => i.kind === 'mcq');
    banks.push({ key: `${c.book}/${c.chapter}`, items });
  }
  assert.ok(banks.length > 0, `no item bank was found under ${ROOT} (looked for <book>/<chapter>/items.js), so nothing was asked`);
  const all = banks.flatMap((b) => b.items);
  assert.ok(all.length > 0, `the ${banks.length} bank(s) found hold no multiple-choice item, so nothing was asked`);

  // The display order is seeded by the item's id, and the count of earlier answers by the item's id too:
  // two items sharing one id would share one order and one count.
  const owners = new Map();
  for (const b of banks) {
    for (const item of b.items) {
      assert.ok(!owners.has(item.id), `item id "${item.id}" is in both ${owners.get(item.id)} and ${b.key}; the display order and the count of earlier answers are both keyed by it`);
      owners.set(item.id, b.key);
      const texts = item.options.map(optionText);
      assert.equal(new Set(texts).size, texts.length, `item "${item.id}" (${b.key}) has two options with the same text, so which one was shown where cannot be read back`);
    }
  }

  const l = await learning();
  assert.ok(l?.store, 'src/learning/store.js did not load under Node, so there is no record to answer into');
  const store = l.store;
  assert.equal(store.events().length, 0, 'the record was not empty before the first asking, so the counts of earlier answers are not 0, 1, 2 and 3');

  const sitting = new TbSitting();
  sitting.tagName = 'TB-SITTING';
  doc.body.replaceChildren(sitting);
  sitting.build();
  Object.assign(sitting, {
    l,
    sources: [{ href: '../biology/ch01-what-is-life/', url: 'http://localhost/biology/ch01-what-is-life/', key: 'biology/ch01', label: 'chapter 1' }],
    home: new Map(),
    answered: [],
    calibration: false,
  });

  const ASKINGS = 4;
  const PATHS = ['click', 'letter', 'digit'];
  const byBank = new Map(banks.map((b) => [b.key, []]));
  const byAsking = Array.from({ length: ASKINGS }, () => []);
  const outcomes = Object.fromEntries(PATHS.map((p) => [p, { right: 0, wrong: 0 }]));
  let stays = 0;
  let pairs = 0;
  let expectedStays = 0;
  let varianceStays = 0;
  let asked = 0;

  let k = 0;
  for (const bank of banks) {
    for (const item of bank.items) {
      const n = item.options.length;
      let before = null;
      for (let a = 0; a < ASKINGS; a += 1) {
        const where = `item "${item.id}" (${bank.key}), asking ${a + 1} of ${ASKINGS}`;
        sitting.steps = [{ objective: item.objective, reason: null, item }];
        sitting.at = 0;
        sitting.renderStep();
        asked += 1;

        const buttons = sitting.run.querySelectorAll('.tb-opt');
        assert.equal(buttons.length, n, `${where}: ${buttons.length} option button(s) on the page for ${n} options`);
        const letters = buttons.map((b) => b.querySelector('.k')?.textContent);
        assert.deepEqual(letters, [...LETTERS.slice(0, n)], `${where}: the letters read ${letters.join(', ')} from the top; they must follow the screen, A first`);
        // Which authored option each button shows, found by its text in the bank rather than through the
        // permutation.
        const shownText = buttons.map((b) => b.children.filter((c) => !c.classList.contains('k')).map((c) => c.textContent).join(''));
        const authoredAt = shownText.map((text) => item.options.findIndex((o) => optionText(o) === text));
        assert.deepEqual([...authoredAt].sort((x, y) => x - y), item.options.map((_, i) => i), `${where}: the buttons do not show each of the item's options exactly once (bank indexes ${JSON.stringify(authoredAt)})`);
        const correctAt = authoredAt.findIndex((i) => item.options[i].correct);

        byBank.get(bank.key).push({ n, at: correctAt });
        byAsking[a].push({ n, at: correctAt });
        if (before !== null) {
          pairs += 1;
          if (before === correctAt) stays += 1;
          expectedStays += 1 / n;
          varianceStays += (1 / n) * (1 - 1 / n);
        }
        before = correctAt;

        // Answer it: the correct option on the first and third askings, a distractor on the others, by a
        // path that rotates with the item so every path meets both outcomes.
        const path = PATHS[(a + k) % PATHS.length];
        const distractors = authoredAt.map((i, at) => (item.options[i].correct ? -1 : at)).filter((at) => at >= 0);
        const pressed = a % 2 === 0 ? correctAt : distractors[(k + a) % distractors.length];
        const pressedOption = item.options[authoredAt[pressed]];
        const recordedBefore = store.events().length;
        if (path === 'click') {
          buttons[pressed].fire('click');
        } else {
          const key = path === 'letter' ? buttons[pressed].querySelector('.k').textContent.toLowerCase() : String(pressed + 1);
          sitting.fire('keydown', { key, target: doc.activeElement });
        }
        // record() waits on the study modules, which are already loaded: one turn of the event loop lands it.
        await new Promise((resolve) => setImmediate(resolve));

        const events = store.events();
        assert.equal(events.length, recordedBefore + 1, `${where}: pressing position ${pressed + 1} by ${path} recorded ${events.length - recordedBefore} event(s), not 1`);
        const e = events[events.length - 1];
        const right = Boolean(pressedOption.correct);
        assert.equal(e.item, item.id, `${where}: the answer was recorded against item "${e.item}"`);
        assert.equal(e.chose, LETTERS[authoredAt[pressed]], `${where}: the reader pressed the button showing the bank's option ${LETTERS[authoredAt[pressed]]} ("${shownText[pressed].slice(0, 60)}"), at position ${LETTERS[pressed]} on the screen, by ${path}, and the record says chose "${e.chose}". \`chose\` names the option as the bank wrote it, never where it was shown.`);
        assert.equal(e.outcome, right ? 'right' : 'wrong', `${where}: a ${right ? 'correct' : 'wrong'} option was pressed and the record says "${e.outcome}"`);
        assert.deepEqual(Object.keys(e).sort(), EVENT_KEYS, `${where}: the recorded event's fields changed shape: ${JSON.stringify(Object.keys(e).sort())}`);

        const marks = buttons.map((b) => ({ correct: b.classList.contains('is-correct'), wrong: b.classList.contains('is-wrong'), disabled: b.disabled }));
        marks.forEach((m, at) => {
          assert.equal(m.correct, at === correctAt, `${where}: the button at ${LETTERS[at]} ${m.correct ? 'is' : 'is not'} marked is-correct, and the correct option is shown at ${LETTERS[correctAt]}`);
          assert.equal(m.wrong, !right && at === pressed, `${where}: the button at ${LETTERS[at]} ${m.wrong ? 'is' : 'is not'} marked is-wrong after a ${right ? 'right' : 'wrong'} answer at ${LETTERS[pressed]}`);
          assert.ok(m.disabled, `${where}: the button at ${LETTERS[at]} is still enabled after the answer`);
        });
        const why = sitting.run.querySelectorAll('.tb-explain--why').map((w) => w.textContent);
        if (right) assert.deepEqual(why, [], `${where}: a right answer showed a distractor's why: ${JSON.stringify(why)}`);
        else assert.deepEqual(why, [pressedOption.why], `${where}: the reader chose the distractor "${shownText[pressed].slice(0, 60)}" and the page showed ${JSON.stringify(why)} as its why`);
        outcomes[path][right ? 'right' : 'wrong'] += 1;
      }
      k += 1;
    }
  }

  const reports = [
    ...banks.map((b) => spread(byBank.get(b.key), `${b.key}, askings 1 to ${ASKINGS}`)),
    ...byAsking.map((p, a) => spread(p, `asking ${a + 1}, every bank`)),
  ];
  for (const r of reports) for (const line of r.lines) t.diagnostic(line);
  const sd = Math.sqrt(varianceStays);
  const z = sd > 0 ? (stays - expectedStays) / sd : 0;
  t.diagnostic(`asked again: the correct option stayed where it was ${stays} time(s) in ${pairs} (independent draws give ${expectedStays.toFixed(1)}, sd ${sd.toFixed(1)}, z ${z.toFixed(2)} against ±${Z})`);
  t.diagnostic(`answered by position: ${PATHS.map((p) => `${p} ${outcomes[p].right} right and ${outcomes[p].wrong} wrong`).join(', ')}; ${banks.length} bank(s), ${all.length} item(s), ${asked} asking(s)`);

  // Every set-level claim is judged before any is reported, so a failure names all the claims it breaks:
  // an order that ignores the count of earlier answers also fails the per-bank bound, because its four
  // askings of an item are one draw counted four times.
  const problems = reports.flatMap((r) => r.failures);
  for (const r of reports) {
    if (r.judged < MIN_JUDGED * r.total) problems.push(`only ${r.judged} of ${r.total} placements could be judged (${r.lines.join('; ')}); the bound no longer covers the banks, so this test would pass having compared little`);
  }
  if (asked !== all.length * ASKINGS) problems.push(`${asked} askings were made of ${all.length} items at ${ASKINGS} each`);
  if (pairs === 0) problems.push('no item was asked twice, so whether asking again draws again was never measured');
  else if (Math.abs(z) > Z) problems.push(`asked again, the correct option stayed where it was ${stays} time(s) in ${pairs} consecutive askings, ${z.toFixed(2)} standard deviations from the ${expectedStays.toFixed(1)} that independent draws give (bound ±${Z}). ${z > 0 ? 'Too many: the order does not change enough when an item comes round, so a reader who remembers the letter can answer from it.' : 'Too few: the correct option is being moved on purpose, which tells a reader where it is not.'}`);
  for (const p of PATHS) {
    if (!(outcomes[p].right > 0 && outcomes[p].wrong > 0)) problems.push(`the ${p} path carried ${outcomes[p].right} right and ${outcomes[p].wrong} wrong answers; it must carry both for this to have tested it`);
  }
  assert.deepEqual(problems, [], `where Today shows the correct option gives it away:\n  ${problems.join('\n  ')}`);
});

// ---------- the chapters' checks ----------

const hasClass = (node, cls) => (node.attrs?.class || '').split(/\s+/).includes(cls);
// A parsed node's text with its markup dropped and its whitespace collapsed: what a stand-in element
// holds, since the stand-in parses no markup.
const flat = (node) => (node ? textOf(node).replace(/\s+/g, ' ').trim() : '');

// One page's checks as the page writes them, read with the content checker's parser.
function checksOn(file) {
  const tree = parseHtml(readFileSync(file, 'utf8'));
  const html = findAll(tree, (n) => n.tag === 'html')[0];
  const checks = findAll(tree, (n) => n.tag === 'tb-check').map((c) => {
    const list = findAll(c, (n) => hasClass(n, 'options'))[0];
    const options = (list ? list.children.filter((n) => n.tag === 'li') : []).map((li) => ({ text: flat(li), correct: li.attrs['data-correct'] !== undefined }));
    return { id: c.attrs.id ?? '', question: flat(findAll(c, (n) => hasClass(n, 'question'))[0]), options, explain: flat(findAll(c, (n) => hasClass(n, 'explain'))[0]) };
  });
  return { lang: html?.attrs.lang ?? 'en', checks };
}

// Mounts one page's checks in the stand-in at the address `url`, through the component's own
// connectedCallback(), and returns their elements. Every check is on the page before any is built,
// because a check reads its number off the page.
function mountChecks(page, url) {
  doc.URL = url;
  doc.documentElement.setAttribute('lang', page.lang);
  const els = page.checks.map((c) => {
    const el = new TbCheck();
    el.tagName = 'TB-CHECK';
    if (c.id) el.setAttribute('id', c.id);
    const question = doc.createElement('p');
    question.className = 'question';
    question.textContent = c.question;
    const list = doc.createElement('ul');
    list.className = 'options';
    for (const o of c.options) {
      const li = doc.createElement('li');
      if (o.correct) li.setAttribute('data-correct', '');
      li.textContent = o.text;
      list.append(li);
    }
    const explain = doc.createElement('p');
    explain.className = 'explain';
    explain.textContent = c.explain;
    el.append(question, list, explain);
    return el;
  });
  doc.body.replaceChildren(...els);
  for (const el of els) el.connectedCallback();
  return els;
}

// What a mounted check shows: its letters, and which option as written each button carries, found by the
// option's text and never through the permutation.
function shownOn(el, check) {
  const buttons = el.querySelectorAll('.tb-check__opt');
  const letters = buttons.map((b) => b.querySelector('.k')?.textContent);
  const texts = buttons.map((b) => b.children.filter((c) => !c.classList.contains('k')).map((c) => c.textContent).join(''));
  const authoredAt = texts.map((text) => check.options.findIndex((o) => o.text === text));
  return { buttons, letters, texts, authoredAt };
}

test('Chapter checks: where the correct option is shown does not give it away, and every mark follows the option', (t) => {
  const pages = [];
  for (const c of chapterDirs()) {
    const file = join(c.dir, 'index.html');
    if (!existsSync(file)) continue;
    const page = { key: `${c.book}/${c.chapter}`, ...checksOn(file) };
    if (page.checks.length) pages.push(page);
  }
  assert.ok(pages.length > 0, `no chapter page under ${ROOT} carries a <tb-check>, so no check was shown`);
  const total = pages.reduce((sum, p) => sum + p.checks.length, 0);

  const placements = [];
  const orders = new Map();
  const answered = { right: 0, wrong: 0 };
  let k = 0;
  for (const page of pages) {
    for (const c of page.checks) {
      const texts = c.options.map((o) => o.text);
      assert.equal(new Set(texts).size, texts.length, `${page.key} #${c.id}: two options have the same text, so which one was shown where cannot be read back`);
    }
    const els = mountChecks(page, `http://localhost/${page.key}/`);
    els.forEach((el, i) => {
      const c = page.checks[i];
      const where = `${page.key} #${c.id}`;
      const n = c.options.length;
      const { buttons, letters, texts, authoredAt } = shownOn(el, c);
      assert.equal(buttons.length, n, `${where}: ${buttons.length} option button(s) on the page for ${n} options`);
      assert.deepEqual(letters, [...LETTERS.slice(0, n)], `${where}: the letters read ${letters.join(', ')} from the top; they must follow the screen, A first`);
      assert.deepEqual([...authoredAt].sort((x, y) => x - y), c.options.map((_, j) => j), `${where}: the buttons do not show each option exactly once (indexes as written ${JSON.stringify(authoredAt)})`);
      const correctAt = authoredAt.findIndex((j) => c.options[j].correct);
      buttons.forEach((b, at) => {
        assert.equal(b.dataset.correct, at === correctAt ? '1' : '', `${where}: the button at ${LETTERS[at]} has data-correct "${b.dataset.correct}", and the correct option is shown at ${LETTERS[correctAt]}. tools/flow.js presses by this attribute, so it must follow the option.`);
      });
      placements.push({ n, at: correctAt });
      orders.set(where, authoredAt);

      // Answer it by a click: the correct option on every other check, a distractor on the rest.
      const distractors = authoredAt.map((j, at) => (c.options[j].correct ? -1 : at)).filter((at) => at >= 0);
      const pressed = k % 2 === 0 ? correctAt : distractors[Math.floor(k / 2) % distractors.length];
      const right = c.options[authoredAt[pressed]].correct;
      buttons[pressed].fire('click');
      assert.equal(el.getAttribute('data-answered'), right ? 'right' : 'wrong', `${where}: the reader clicked "${texts[pressed].slice(0, 60)}" at ${LETTERS[pressed]}, which is ${right ? 'the correct option' : 'a distractor'}, and the check says data-answered="${el.getAttribute('data-answered')}"`);
      buttons.forEach((b, at) => {
        assert.equal(b.classList.contains('is-correct'), at === correctAt, `${where}: the button at ${LETTERS[at]} ${b.classList.contains('is-correct') ? 'is' : 'is not'} marked is-correct, and the correct option is shown at ${LETTERS[correctAt]}`);
        assert.equal(b.classList.contains('is-wrong'), !right && at === pressed, `${where}: the button at ${LETTERS[at]} ${b.classList.contains('is-wrong') ? 'is' : 'is not'} marked is-wrong after a ${right ? 'right' : 'wrong'} answer at ${LETTERS[pressed]}`);
        assert.ok(b.disabled, `${where}: the button at ${LETTERS[at]} is still enabled after the answer`);
      });
      const explain = el.querySelector('.explain');
      assert.ok(explain && !explain.hidden, `${where}: the explanation is not shown after the answer`);
      const verdict = explain.children[0];
      assert.ok(verdict?.classList.contains('tb-check__verdict') && verdict.classList.contains(right ? 'ok' : 'no'), `${where}: the explanation opens with ${verdict ? `class "${verdict.className}"` : 'nothing'}, not a verdict saying ${right ? 'right' : 'wrong'}`);
      answered[right ? 'right' : 'wrong'] += 1;
      k += 1;
    });
  }

  // 8. The same pages at the address the site is published at.
  const moved = [];
  for (const page of pages) {
    const els = mountChecks(page, `http://localhost/textbook/${page.key}/index.html?theme=dark#${page.checks[0].id}`);
    els.forEach((el, i) => {
      const where = `${page.key} #${page.checks[i].id}`;
      const { authoredAt } = shownOn(el, page.checks[i]);
      if (JSON.stringify(authoredAt) !== JSON.stringify(orders.get(where))) moved.push(`${where} shows ${JSON.stringify(orders.get(where))} at the root and ${JSON.stringify(authoredAt)} under /textbook/`);
    });
  }

  // 9. One check, one id, two pages. Eight options, so two independent draws agree 1 time in 40,320; the
  // pages are named here rather than read from disk, so the verdict does not move when a chapter does.
  const EIGHT = { id: 'q1', question: 'Which?', options: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'].map((text, j) => ({ text, correct: j === 0 })), explain: 'Because.' };
  const orderOn = (key) => shownOn(mountChecks({ lang: 'en', checks: [EIGHT] }, `http://localhost/${key}/`)[0], EIGHT).authoredAt;
  const onFirst = orderOn('biology/ch01-what-is-life');
  const onSecond = orderOn('biology/ch02-chemistry-of-life');

  const report = spread(placements, 'every check on disk');
  for (const line of report.lines) t.diagnostic(line);
  t.diagnostic(`answered by a click: ${answered.right} right and ${answered.wrong} wrong; ${pages.length} page(s), ${total} check(s); ${moved.length} check(s) moved under /textbook/; the eight-option q1 on two pages: ${JSON.stringify(onFirst)} and ${JSON.stringify(onSecond)}`);

  const problems = [...report.failures];
  if (report.judged < MIN_JUDGED * report.total) problems.push(`only ${report.judged} of ${report.total} placements could be judged (${report.lines.join('; ')}); the bound no longer covers the checks, so this test would pass having compared little`);
  if (placements.length !== total) problems.push(`${placements.length} check(s) were shown of the ${total} on disk`);
  if (!(answered.right > 0 && answered.wrong > 0)) problems.push(`the clicks carried ${answered.right} right and ${answered.wrong} wrong answers; they must carry both for this to have tested either`);
  for (const m of moved) problems.push(`the order depends on where the page is served, not on the page: ${m}`);
  if (JSON.stringify(onFirst) === JSON.stringify(onSecond)) problems.push(`one eight-option check with the id "q1" shows the same order, ${JSON.stringify(onFirst)}, on biology/ch01-what-is-life and on biology/ch02-chemistry-of-life: the order is keyed by the id without its page, so every chapter's q1 shares one order`);
  assert.deepEqual(problems, [], `where a chapter check shows its correct option gives it away, or the order is not the page's own:\n  ${problems.join('\n  ')}`);
});
