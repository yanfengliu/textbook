// <tb-task id="t-hom-1" objective="feedback-opened" figure="fig-homeostasis"
//          goal="Turn the feedback off, run a race, and predict what the core temperature does."
//          expect="core > 37.6 and feedback === false">
//   <p class="explain">With the loop open nothing opposes the heat the muscles make, so the core climbs.</p>
// </tb-task>
//
// The figure task: the question format this repository can do that a flashcard cannot. The task mounts
// the named figure in its own <tb-figure> frame, states a goal, lets the reader drive the figure's real
// controls, and grades by reading that figure's own describe() against `expect`. Nothing is simulated
// and nothing is re-implemented: the figure the reader drives is the figure the chapter uses.
//
// Attributes
//   objective  the objective id this task tests (objectives.js)
//   figure     the chapter figure id the task is set on (fig-homeostasis), for the record and for kind
//   kind       optional: the registered figure kind to mount. Resolved, in order, from this attribute,
//              from a <tb-figure id="<figure>"> already on the page, then from "fig-<kind>".
//   goal       one sentence saying what to do and what to predict
//   expect     the grading expression, grammar below
//   data-alt   optional: the text alternative for the mounted figure
//
// ---------------------------------------------------------------------------------------------
// The `expect` grammar
// ---------------------------------------------------------------------------------------------
// A tiny comparison language over the figure's describe() object. There is no eval, no function call
// and no arithmetic: an expression can only read named fields and compare them against literals, so a
// bad `expect` can misgrade but can never run page script.
//
//   expect     = or
//   or         = and { "or" and }
//   and        = unary { "and" unary }
//   unary      = "not" unary | "(" or ")" | comparison
//   comparison = path [ op literal ]          -- a bare path is a truthiness test
//   path       = name { "." name | "[" digits "]" }
//   op         = "==" | "===" | "!=" | "!==" | ">" | ">=" | "<" | "<=" | "~"
//   literal    = number | "true" | "false" | "null" | 'quoted' | "quoted" | bare-word
//   number     = [ "-" ] digits [ "." digits ] [ ("e" | "E") [ "+" | "-" ] digits ]
//
// A number reads the way an author writes it for a figure that spans ten orders of magnitude: `2e-7`
// as well as `0.0000002`. The first grammar stopped at the decimal point, and chapter 1's
// `lensMetres < 2e-7` was read as the number 2 followed by the word "e-7" — an error the page
// reported as a console.warn at mount, which no gate reads, so the task was broken from the day it
// was written until `npm run check` started parsing every expect (expectProblems, below).
//
// "not" binds tighter than "and", which binds tighter than "or"; parentheses override both.
// "==" and "===" mean the same thing here, and so do "!=" and "!==": values of the same type are
// compared with ===, values of different types by their text, so `mode == hot`, `feedback === false`
// and `setPoint == 39` all read naturally. "~" means "contains": on a string it is a case-insensitive
// substring, on a list it is true when any element, or any own value of an element, contains the text,
// so `events ~ race` asks whether the reader ever ran a race.
//
// Fields are read from <tb-figure>.describe(), which is the figure module's own describe() plus
// id, kind, number and state. `events.length >= 2` works because .length is an ordinary field.
//
// A path the figure does not report, or a comparison that cannot be made (`>` against a word), is an
// authoring error, not a wrong answer: the task says so, in the reader's view, and grades nothing. The
// same is true when the figure cannot mount at all — no WebGL, a module that failed — so a reader on a
// machine that cannot run the figure is never marked wrong for it. The second of those needs no figure
// to find: `npm run check` runs every task item's expect through expectProblems() below, so an author
// learns it from the gate and not a reader from the page.
//
// An expectation describes a MOMENT, not a resting state. Several of the bank's tasks name a transient
// — an effector while an episode runs, a temperature at the peak of a fever — and a simulation that is
// still running has left that moment by the time the reader reaches the button. So the expression is
// evaluated every SAMPLE_MS while the task is open as well as at the moment the reader checks, and the
// answer is right if it held at any of them. The readback then says which moment it is quoting.

import { KINDS } from '../figures/registry.js';

// How often a live figure is asked whether the expectation holds. 8 Hz: fast enough for a transient a
// reader could see, cheap enough that describe() on the heaviest figure costs nothing measurable.
const SAMPLE_MS = 125;

// ---------- the optional learning modules ----------
// The adaptive study system is optional to every component that reports to it: a page without it still
// reads and still answers, it simply records nothing. Loaded once, cached, and never retried.
let learningPromise = null;

export function learning() {
  if (!learningPromise) {
    learningPromise = Promise.all([
      import('../learning/store.js'),
      import('../learning/objectives.js'),
    ]).then(([s, o]) => ({ store: s.store, ...o })).catch((err) => {
      console.warn(`the study record is not available (${err.message}); answers on this page are not recorded`);
      return null;
    });
  }
  return learningPromise;
}

// Record one event, never throwing into the caller: a broken record must not break a question.
export async function record(event) {
  const l = await learning();
  try {
    l?.store?.record?.(event);
  } catch (err) {
    console.warn(`recording ${event.item ?? event.objective} failed: ${err.message}`);
  }
}

// ---------- the expect language ----------

export class ExpectError extends Error {}

const TOKEN = /\s*(?:(===|!==|==|!=|<=|>=|<|>|~)|([()])|'([^']*)'|"([^"]*)"|(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)|([A-Za-z_$][\w$-]*(?:\.[A-Za-z_$][\w$-]*|\[\d+\])*))/y;
const KEYWORDS = new Set(['and', 'or', 'not']);
const CONSTANTS = { true: true, false: false, null: null };

function tokenize(src) {
  const out = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < src.length) {
    const at = TOKEN.lastIndex;
    const m = TOKEN.exec(src);
    if (!m) {
      if (!src.slice(at).trim()) break;
      throw new ExpectError(`"${src}" has something at character ${at + 1} this grammar does not read: "${src.slice(at).trim().slice(0, 12)}"`);
    }
    if (m[1]) out.push({ type: 'op', value: m[1] });
    else if (m[2]) out.push({ type: m[2] });
    else if (m[3] !== undefined) out.push({ type: 'value', value: m[3] });
    else if (m[4] !== undefined) out.push({ type: 'value', value: m[4] });
    else if (m[5] !== undefined) out.push({ type: 'value', value: Number(m[5]) });
    else {
      const word = m[6];
      if (KEYWORDS.has(word)) out.push({ type: 'kw', value: word });
      else if (word in CONSTANTS) out.push({ type: 'value', value: CONSTANTS[word] });
      else out.push({ type: 'word', value: word });
    }
  }
  return out;
}

export function parseExpect(src) {
  if (!src || !String(src).trim()) throw new ExpectError('an expect expression is empty; it must say what the figure should report, such as "core > 37.6 and feedback === false"');
  const tokens = tokenize(String(src));
  let i = 0;
  const peek = () => tokens[i];
  const eat = () => tokens[i++];

  function parseOr() {
    let node = parseAnd();
    while (peek()?.type === 'kw' && peek().value === 'or') {
      eat();
      node = { t: 'or', a: node, b: parseAnd() };
    }
    return node;
  }

  function parseAnd() {
    let node = parseUnary();
    while (peek()?.type === 'kw' && peek().value === 'and') {
      eat();
      node = { t: 'and', a: node, b: parseUnary() };
    }
    return node;
  }

  function parseUnary() {
    const tok = peek();
    if (!tok) throw new ExpectError(`"${src}" ends where a field name was expected`);
    if (tok.type === 'kw' && tok.value === 'not') {
      eat();
      return { t: 'not', a: parseUnary() };
    }
    if (tok.type === '(') {
      eat();
      const inner = parseOr();
      if (peek()?.type !== ')') throw new ExpectError(`"${src}" opens a bracket it never closes`);
      eat();
      return inner;
    }
    if (tok.type !== 'word') throw new ExpectError(`"${src}" expected a field name and found ${describeToken(tok)}`);
    eat();
    const path = tok.value;
    const op = peek();
    if (op?.type !== 'op') return { t: 'truthy', path };
    eat();
    const rhs = peek();
    if (!rhs || (rhs.type !== 'value' && rhs.type !== 'word')) {
      const found = rhs ? `${describeToken(rhs)}` : 'nothing';
      throw new ExpectError(`"${src}" has "${path} ${op.value}" followed by ${found}; it needs a number, a word, true, false or null`);
    }
    eat();
    return { t: 'cmp', path, op: op.value, value: rhs.value };
  }

  const ast = parseOr();
  if (i < tokens.length) throw new ExpectError(`"${src}" has trailing ${describeToken(tokens[i])}; join clauses with "and" or "or"`);
  return ast;
}

function describeToken(tok) {
  if (!tok) return 'nothing';
  if (tok.type === 'op') return `the operator "${tok.value}"`;
  if (tok.type === '(' || tok.type === ')') return `"${tok.type}"`;
  return `"${tok.value}"`;
}

function pathParts(path) {
  const parts = [];
  const re = /([A-Za-z_$][\w$-]*)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(path))) parts.push(m[1] ?? m[2]);
  return parts;
}

function show(value) {
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `a list of ${value.length}`;
  if (value === null) return 'null';
  if (typeof value === 'object') return 'an object';
  return String(value);
}

function containsText(value, needle) {
  const want = String(needle).toLowerCase();
  if (value && typeof value === 'object') return Object.values(value).some((v) => String(v).toLowerCase().includes(want));
  return String(value).toLowerCase().includes(want);
}

export function evalExpect(node, facts) {
  switch (node.t) {
    case 'or': return evalExpect(node.a, facts) || evalExpect(node.b, facts);
    case 'and': return evalExpect(node.a, facts) && evalExpect(node.b, facts);
    case 'not': return !evalExpect(node.a, facts);
    case 'truthy': return Boolean(read(node.path, facts));
    case 'cmp': return compare(read(node.path, facts), node.op, node.value, node.path);
    default: throw new ExpectError(`unknown expression node "${node.t}"`);
  }
}

function read(path, facts) {
  let cur = facts;
  for (const part of pathParts(path)) {
    if (cur === null || cur === undefined || typeof cur !== 'object') {
      throw new ExpectError(`this figure does not report "${path}" (it has no "${part}"); it reports ${Object.keys(facts).join(', ')}`);
    }
    cur = cur[part];
    if (cur === undefined) {
      throw new ExpectError(`this figure does not report "${path}"; it reports ${Object.keys(facts).join(', ')}`);
    }
  }
  return cur;
}

function compare(actual, op, expected, path) {
  if (op === '~') {
    if (Array.isArray(actual)) return actual.some((e) => containsText(e, expected));
    if (typeof actual === 'string') return containsText(actual, expected);
    throw new ExpectError(`"${path} ~ ${show(expected)}" needs text or a list, and ${path} is ${show(actual)}`);
  }
  if (op === '>' || op === '>=' || op === '<' || op === '<=') {
    const a = Number(actual);
    if (!Number.isFinite(a)) throw new ExpectError(`"${path} ${op} ${show(expected)}" needs a number, and ${path} is ${show(actual)}`);
    const b = literalFor(op, expected, path);
    return op === '>' ? a > b : op === '>=' ? a >= b : op === '<' ? a < b : a <= b;
  }
  const same = typeof actual === typeof expected ? actual === expected : String(actual) === String(expected);
  return op === '!=' || op === '!==' ? !same : same;
}

// The one fact about a comparison that no figure state can change: a numeric operator needs a number
// on its right. The grammar's right-hand side is a literal and never a second path, so a bare word
// there is text — right for `panel === heat` and `events ~ race`, impossible for `>`. compare() throws
// this at grade time and expectProblems() asks it before any grade, through this one function, so the
// check and the grader cannot disagree.
function literalFor(op, expected, path) {
  if (op !== '>' && op !== '>=' && op !== '<' && op !== '<=') return expected;
  const b = Number(expected);
  if (!Number.isFinite(b)) throw new ExpectError(`"${path} ${op} ${show(expected)}" compares against ${show(expected)}, which is not a number`);
  return b;
}

// Everything wrong with an expect that is wrong before any figure reports anything: the grammar does
// not read it, or a clause compares in a way no describe() could ever satisfy. `npm run check` runs
// every task item's expect through this so the failure lands in the tree and not in a sitting:
// chapter 2's bank shipped `heat.comparisonC > heat.waterC`, which parses, and then threw on every
// grade, for ever, because the right-hand side is a literal and there is no second path. Returns one
// sentence per problem — the grader's own message, plus what the author would have to write — and an
// empty list when the grader could evaluate it against some figure.
// Bound: what can be known without the figure. A path the figure does not report, or `~` on a field
// that turns out to be a number, is found only by grading against that figure's describe().
export function expectProblems(src) {
  let ast;
  try {
    ast = parseExpect(src);
  } catch (err) {
    if (err instanceof ExpectError) return [err.message];
    throw err;
  }
  const problems = [];
  const visit = (n) => {
    if (n.t === 'cmp') {
      try {
        literalFor(n.op, n.value, n.path);
      } catch (err) {
        if (!(err instanceof ExpectError)) throw err;
        problems.push(`${err.message}; the right-hand side of "${n.op}" must be a number such as 40, because an expect compares a field against a literal and never against another field`);
      }
    }
    if (n.a) visit(n.a);
    if (n.b) visit(n.b);
  };
  visit(ast);
  return problems;
}

// ---------- the element ----------

let taskCounter = 0;

// The element needs a document. The expect language above does not, and `npm run check` imports this
// module under Node to run every task item's expect through the grader's own parser, because only the
// grader can say what the grader can evaluate. So the base class is whatever HTMLElement the host has —
// a stand-in under Node — and the element is registered only where there is a registry to put it in.
// In a browser nothing here differs.
const HostElement = globalThis.HTMLElement ?? class {};

export class TbTask extends HostElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    if (!this.id) this.id = `tb-task-${++taskCounter}`;
    this.objective = this.getAttribute('objective') || null;
    this.figureRef = this.getAttribute('figure') || null;
    this.state = 'unanswered';
    this.facts = null;

    const goal = this.getAttribute('goal');
    const explain = this.querySelector('.explain');
    const label = document.createElement('p');
    label.className = 'tb-task__label';
    label.textContent = 'Figure task';
    const goalEl = document.createElement('p');
    goalEl.className = 'tb-task__goal';
    goalEl.textContent = goal || '';
    const live = document.createElement('div');
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    this.live = live;

    const problem = this.authoringProblem(goal);
    if (problem) {
      this.state = 'broken';
      this.replaceChildren(label, goalEl, note('tb-task__broken', problem), live);
      console.warn(`<tb-task id="${this.id}">: ${problem}`);
      return;
    }

    const fig = document.createElement('tb-figure');
    fig.setAttribute('kind', this.kind);
    fig.id = `${this.id}-figure`;
    fig.dataset.alt = this.getAttribute('data-alt') || `${goal} Drive the figure with its own controls, then check.`;
    this.figureEl = fig;

    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'tb-task__check';
    check.textContent = 'Check the figure';
    check.disabled = true;
    check.addEventListener('click', () => this.grade());
    this.checkButton = check;

    const hint = document.createElement('p');
    hint.className = 'tb-task__hint';
    hint.textContent = 'Loading the figure…';
    this.hint = hint;

    const foot = document.createElement('div');
    foot.className = 'tb-task__foot';
    foot.append(check, hint);
    this.foot = foot;

    if (explain) explain.hidden = true;
    this.explain = explain;
    this.verdictSlot = document.createElement('div');
    this.verdictSlot.className = 'tb-task__result';

    this.replaceChildren(label, goalEl, fig, foot, this.verdictSlot, explain || '', live);
    // The frame labels its <figure> "Figure N: title" from its position in the document, which on a
    // chapter page is a number the prose never uses. The task's own goal is the honest label.
    fig.querySelector('figure')?.setAttribute('aria-label', `Task figure: ${goal}`);

    this.watchFigure();
  }

  disconnectedCallback() {
    this.figureWatch?.disconnect();
    this.stopSampling();
  }

  // Everything an author can get wrong, said once, before a reader ever sees the task.
  authoringProblem(goal) {
    if (!goal) return 'this task has no goal="…", so it does not say what to do.';
    if (!this.objective) return 'this task names no objective="…"; take one from the chapter\'s objectives.js.';
    if (!this.figureRef && !this.getAttribute('kind')) return 'this task names no figure="…" to set itself on.';
    this.kind = this.resolveKind();
    if (!this.kind) {
      return `figure="${this.figureRef}" does not name a figure on this page and is not one of the registered kinds (${KINDS.join(', ')}); add kind="<kind>".`;
    }
    try {
      this.ast = parseExpect(this.getAttribute('expect'));
    } catch (err) {
      return `its expect is not readable — ${err.message}`;
    }
    return null;
  }

  resolveKind() {
    const explicit = this.getAttribute('kind');
    if (explicit) return KINDS.includes(explicit) ? explicit : null;
    const ref = this.figureRef;
    const onPage = ref && document.getElementById(ref);
    const declared = onPage?.tagName === 'TB-FIGURE' ? onPage.getAttribute('kind') : null;
    if (declared && KINDS.includes(declared)) return declared;
    const stripped = ref?.replace(/^fig-/, '');
    return stripped && KINDS.includes(stripped) ? stripped : null;
  }

  // The frame reports loading, ready or error on data-state. Ready arms the check; error skips the
  // task honestly rather than grading a figure that is not there.
  watchFigure() {
    const settle = () => {
      const state = this.figureEl.dataset.state;
      if (state === 'ready' && this.state === 'unanswered') {
        this.checkButton.disabled = false;
        this.hint.textContent = 'Use the figure’s own controls, then check.';
        this.shownAt = performance.now();
        this.startSampling();
      } else if (state === 'error') {
        this.skip(window.__textbook?.figures?.[this.figureEl.id]?.error || 'the figure did not load');
      }
    };
    this.figureWatch = new MutationObserver(settle);
    this.figureWatch.observe(this.figureEl, { attributes: true, attributeFilter: ['data-state'] });
    settle();
  }

  // Watch for the expectation becoming true while the reader drives the figure, so a task that names
  // a transient is not failed by the delay between seeing it and pressing the button.
  startSampling() {
    if (this.sampleTimer) return;
    const tick = () => {
      this.sampleTimer = 0;
      if (this.state !== 'unanswered' || !this.isConnected) return;
      try {
        const facts = this.figureEl.describe();
        if (evalExpect(this.ast, facts)) {
          this.met = true;
          this.metFacts = facts;
        }
      } catch {
        // A broken expression is reported once, when the reader checks — not eight times a second.
      }
      this.sampleTimer = setTimeout(tick, SAMPLE_MS);
    };
    tick();
  }

  stopSampling() {
    if (this.sampleTimer) clearTimeout(this.sampleTimer);
    this.sampleTimer = 0;
  }

  skip(reason) {
    if (this.state !== 'unanswered') return;
    this.state = 'skipped';
    this.stopSampling();
    this.figureWatch?.disconnect();
    this.setAttribute('data-answered', 'skipped');
    this.checkButton.remove();
    this.hint.remove();
    // The frame's own box above already names the module and the failure; saying it twice on screen
    // is noise. A reader who cannot see that box still hears the reason through the live region.
    const text = 'This task needs the figure above, and it could not run here. It is skipped, not marked wrong.';
    this.verdictSlot.replaceChildren(note('tb-task__skipped', text));
    this.live.textContent = `${text} ${reason}`;
    this.dispatchEvent(new CustomEvent('tb-answer', {
      bubbles: true,
      detail: { item: this.id, objective: this.objective, kind: 'task', outcome: 'skipped', recorded: false },
    }));
  }

  grade() {
    if (this.state !== 'unanswered') return;
    let facts;
    try {
      facts = this.figureEl.describe();
    } catch (err) {
      this.broken(`the figure threw while describing itself: ${err.message}`);
      return;
    }
    let right;
    try {
      right = evalExpect(this.ast, facts);
    } catch (err) {
      this.broken(err.message);
      return;
    }
    this.stopSampling();
    // It held while they were working, even if the simulation has since moved on.
    const transient = !right && this.met;
    if (transient) {
      right = true;
      facts = this.metFacts;
    }
    this.facts = facts;
    this.state = right ? 'right' : 'wrong';
    this.setAttribute('data-answered', this.state);
    this.checkButton.disabled = true;
    this.hint.remove();
    const verdict = document.createElement('p');
    verdict.className = `tb-task__verdict ${right ? 'ok' : 'no'}`;
    verdict.textContent = right ? 'That is it.' : 'Not what the figure shows.';
    const read = document.createElement('p');
    read.className = 'tb-task__reading';
    read.textContent = transient
      ? `While you were working the figure reported ${this.readingOf(facts)}.`
      : `The figure reports ${this.readingOf(facts)}.`;
    this.verdictSlot.replaceChildren(verdict, read);
    if (this.explain) this.explain.hidden = false;
    const ms = this.shownAt ? Math.round(performance.now() - this.shownAt) : null;
    this.live.textContent = `${verdict.textContent} ${read.textContent} ${this.explain ? this.explain.textContent : ''}`;
    const detail = { item: this.id, objective: this.objective, kind: 'task', outcome: right ? 'right' : 'wrong', chose: null, ms, recorded: true };
    record({
      objective: this.objective,
      item: this.id,
      kind: 'task',
      outcome: detail.outcome,
      chose: null,
      ms,
      confidence: null,
      source: this.closest('tb-sitting') ? 'today' : 'chapter',
    });
    this.dispatchEvent(new CustomEvent('tb-answer', { bubbles: true, detail }));
  }

  // What the reader left the figure at, in the fields the task actually asked about.
  readingOf(facts) {
    const seen = new Set();
    const walk = (n) => {
      if (n.t === 'cmp' || n.t === 'truthy') seen.add(n.path);
      if (n.a) walk(n.a);
      if (n.b) walk(n.b);
    };
    walk(this.ast);
    const parts = [];
    for (const path of seen) {
      try {
        parts.push(`${path} = ${show(read(path, facts))}`);
      } catch {
        parts.push(`${path} = (not reported)`);
      }
    }
    return parts.join(', ');
  }

  broken(message) {
    this.state = 'broken';
    this.stopSampling();
    this.setAttribute('data-answered', 'broken');
    this.checkButton.disabled = true;
    const text = `This task could not be graded: ${message}. Nothing has been recorded.`;
    this.verdictSlot.replaceChildren(note('tb-task__broken', text));
    this.live.textContent = text;
    console.warn(`<tb-task id="${this.id}">: ${message}`);
    this.dispatchEvent(new CustomEvent('tb-answer', {
      bubbles: true,
      detail: { item: this.id, objective: this.objective, kind: 'task', outcome: 'broken', recorded: false },
    }));
  }

  describe() {
    return {
      id: this.id,
      objective: this.objective,
      kind: 'task',
      figure: this.figureRef,
      figureKind: this.kind ?? null,
      expect: this.getAttribute('expect'),
      state: this.state,
      met: Boolean(this.met),
      facts: this.facts,
    };
  }
}

function note(className, text) {
  const p = document.createElement('p');
  p.className = className;
  p.textContent = text;
  return p;
}

if (globalThis.customElements) customElements.define('tb-task', TbTask);
