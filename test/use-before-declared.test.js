// A binding read before it exists, and a name that was never declared at all.
//
// Two defects with the same cause and no gate between them until this file. A guard written `if (x)` on
// a binding whose `let` or `const` is BELOW it does not skip when the value is missing: the binding is in
// its temporal dead zone, and reading it throws `ReferenceError: Cannot access 'x' before
// initialization`. The code reads as defended and is a landmine. `x?.set()` is worse, not better —
// optional chaining tests for null and undefined, and a binding in its dead zone is in neither state, so
// the `?.` a reader adds to make the line safe changes nothing about the throw. Both were demonstrated in
// plain node on 2026-09-17; three instances of the first were found in one figure the same day, and a
// reference with no declaration anywhere cost another worker a whole gate run.
//
// Nothing this repository already runs can see the class. `node --check` sees syntax and a dead-zone read
// is syntactically perfect. A page gate reaches such a line only if it runs on load, so anything behind a
// control — which is most of what a figure does — is invisible to `npm run shot`, `npm run narrow` and
// `npm run drive` alike unless that control happens to be in a recipe. So this is a text check over the
// source of every module under `src/figures/` — 56 of them the day it was written, and the run prints
// how many it read rather than trusting that number — and it runs in the unit suite with no browser.
//
// Bound — a green run here proves this and nothing past it:
//
//   - **Two directories, as text.** `src/figures/*.js` and `src/figures/lib/*.js`, read from disk and
//     tokenized here. Nothing under `src/components/`, `src/`, `tools/` or the book pages is read, and
//     nothing is executed, imported or rendered. A defect that arrives through a page's inline script or
//     through data is not in this file's world.
//   - **Closures are not checked, and that is deliberate.** A name used inside a nested function — an
//     arrow, a callback, a method — is not flagged against a declaration outside it, because a function
//     that runs later may legitimately close over a binding declared further down, which is how half of
//     every module is written. The cost is real and worth stating: `symbiont`'s
//     `const tw = tween({ done: () => tweens.delete(tw) })`, which threw on every pinned-clock load on
//     2026-09-16, is in this blind spot and this file does NOT catch it. What it catches is the shape all
//     three of 2026-09-17's instances had — a read in a plain statement or block, in the same function
//     body as the declaration below it.
//   - **Nothing dynamic.** `globalThis['name']`, a property looked up by a computed key, a name that only
//     exists because another module assigned it, `eval`, `new Function`, a name inside a string or a
//     template's text rather than its `${}`: all invisible. This reads what is written.
//   - **The undeclared check is file-wide, not scope-exact.** It reports a name that NOTHING in the
//     module declares — no import, no `const`/`let`/`var`/`function`/`class`, no parameter — and is not in
//     `KNOWN_GLOBALS` below. A name declared in one function and read in another is not reported, because
//     resolving that exactly would cost more false alarms than the class is worth.
//   - **Contextual keywords are surrendered.** A binding actually named `get`, `set`, `of`, `as`, `from`,
//     `async` or `await` is invisible to both checks; the tokenizer treats those words as keywords.
//
// And one thing worth saying plainly, from the worker that asked for this file: it would have caught the
// reference bug and NOT the rate-law bug of the same afternoon, which mattered more. A check that catches
// a cheap class cheaply is worth having and is not worth overstating. This is not a type checker, it is
// not a linter, and a module it passes can still be wrong in every way that matters.
//
// The red proof — the real instance reintroduced, the failure it produced, and the restore — is at the
// end of docs/learning/gate-proofs.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Words the tokenizer will not hand back as a name in use. The contextual ones (`let`, `static`, `get`,
// `set`, `of`, `as`, `from`, `async`, `await`) are here on purpose: treating a real binding of that name
// as a keyword loses a check, and treating the keyword as a binding invents a failure.
const KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
  'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'implements', 'import', 'in',
  'instanceof', 'interface', 'new', 'null', 'package', 'private', 'protected', 'public', 'return',
  'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
  'yield', 'let', 'async', 'await', 'get', 'set', 'of', 'as', 'from',
]);

// A `/` after one of these opens a regular expression; after anything else it divides.
const REGEX_AFTER = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'case', 'new', 'delete', 'void', 'throw', 'do', 'else',
  'yield', 'await',
]);

// The names a figure may read without declaring: the language's own, the browser's, and nothing else.
// A name reported by the second test that belongs here is added here, not silenced at the call site.
const KNOWN_GLOBALS = new Set([
  // language
  'globalThis', 'undefined', 'NaN', 'Infinity', 'Object', 'Array', 'String', 'Number', 'Boolean',
  'Symbol', 'BigInt', 'Math', 'JSON', 'Date', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'WeakRef',
  'Promise', 'Proxy', 'Reflect', 'Function', 'Error', 'TypeError', 'RangeError', 'SyntaxError',
  'ReferenceError', 'EvalError', 'URIError', 'AggregateError', 'parseInt', 'parseFloat', 'isNaN',
  'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'structuredClone',
  'queueMicrotask', 'Intl', 'ArrayBuffer', 'SharedArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array',
  'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
  'Float64Array', 'BigInt64Array', 'BigUint64Array', 'Atomics', 'FinalizationRegistry',
  // browser
  'window', 'self', 'top', 'parent', 'frames', 'document', 'navigator', 'location', 'history', 'screen',
  'devicePixelRatio', 'visualViewport', 'console', 'performance', 'crypto', 'localStorage',
  'sessionStorage', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback',
  'matchMedia', 'getComputedStyle', 'getSelection', 'scrollTo', 'scrollBy', 'alert', 'confirm', 'prompt',
  'fetch', 'Request', 'Response', 'Headers', 'AbortController', 'AbortSignal', 'URL', 'URLSearchParams',
  'Blob', 'File', 'FileReader', 'FormData', 'TextEncoder', 'TextDecoder', 'Worker', 'MessageChannel',
  'BroadcastChannel', 'customElements', 'CSS', 'DOMParser', 'XMLSerializer', 'MutationObserver',
  'ResizeObserver', 'IntersectionObserver', 'PerformanceObserver', 'Image', 'ImageData', 'Path2D',
  'DOMMatrix', 'DOMPoint', 'DOMRect', 'OffscreenCanvas', 'createImageBitmap', 'FontFace',
  'Node', 'NodeFilter', 'Element', 'HTMLElement', 'HTMLCanvasElement', 'HTMLImageElement',
  'HTMLInputElement', 'SVGElement', 'SVGSVGElement', 'ShadowRoot', 'DocumentFragment', 'Range',
  'Event', 'CustomEvent', 'EventTarget', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'TouchEvent',
  'WheelEvent', 'InputEvent', 'FocusEvent', 'DragEvent', 'MediaQueryList',
  'WebGLRenderingContext', 'WebGL2RenderingContext', 'CanvasRenderingContext2D', 'AudioContext',
  'speechSynthesis', 'SpeechSynthesisUtterance', 'process', 'HTMLButtonElement',
]);

const ID_START = /[A-Za-z_$]/;
const ID_PART = /[A-Za-z0-9_$]/;
const PUNCT = [
  '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
  '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=',
  '|=', '^=', '**', '<<', '>>',
];

// Source in, tokens out: { t: 'name' | 'num' | 'str' | 'tmpl' | 'regex' | 'punct', v, line }. Comments
// vanish, string bodies vanish, and a template's literal text vanishes while the code inside its `${}`
// comes through as ordinary tokens — which is the whole reason this is not a regular expression.
function tokenize(src) {
  const toks = [];
  const n = src.length;
  let i = 0;
  let line = 1;
  let depth = 0;          // brace depth
  const tmpl = [];        // brace depth recorded at each open `${`

  const last = () => (toks.length ? toks[toks.length - 1] : null);
  const push = (t, v) => { toks.push({ t, v, line }); };

  const regexAllowed = () => {
    const p = last();
    if (!p) return true;
    if (p.t === 'name') return REGEX_AFTER.has(p.v);
    if (p.t !== 'punct') return false;
    return !(p.v === ')' || p.v === ']' || p.v === '}' || p.v === '++' || p.v === '--');
  };

  // From the character after a backtick or after the `}` that closed a `${`, to the end of that run of
  // literal text. `open` says the run ended at a `${` rather than at the closing backtick.
  const scanTemplate = (start) => {
    let j = start;
    while (j < n) {
      const c = src[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '\n') { line++; j++; continue; }
      if (c === '`') return { i: j + 1, open: false };
      if (c === '$' && src[j + 1] === '{') return { i: j + 2, open: true };
      j++;
    }
    return { i: j, open: false };
  };

  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v' || c === ' ') { i++; continue; }

    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      i += 2;
      continue;
    }

    if (c === '"' || c === "'") {
      const q = c;
      i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') i += 2;
        else { if (src[i] === '\n') line++; i++; }
      }
      i++;
      push('str', q);
      continue;
    }

    if (c === '`') {
      push('tmpl', '`');
      const r = scanTemplate(i + 1);
      i = r.i;
      if (r.open) { tmpl.push(depth); depth++; }
      continue;
    }

    if (c === '/' && regexAllowed()) {
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '\n') break;
        if (d === '[') inClass = true;
        else if (d === ']') inClass = false;
        else if (d === '/' && !inClass) break;
        j++;
      }
      j++;
      while (j < n && ID_PART.test(src[j])) j++;  // flags
      i = j;
      push('regex', '/');
      continue;
    }

    if (ID_START.test(c)) {
      let j = i;
      while (j < n && ID_PART.test(src[j])) j++;
      push('name', src.slice(i, j));
      i = j;
      continue;
    }

    if (c >= '0' && c <= '9') {
      let j = i;
      while (j < n && /[0-9a-fA-FxXoObBeEnn._]/.test(src[j])) {
        if ((src[j] === '+' || src[j] === '-') && !/[eE]/.test(src[j - 1])) break;
        j++;
      }
      push('num', src.slice(i, j));
      i = j;
      continue;
    }

    if (c === '#') { // private field: read it as a name so `this.#x` skips normally
      let j = i + 1;
      while (j < n && ID_PART.test(src[j])) j++;
      push('name', src.slice(i, j));
      i = j;
      continue;
    }

    if (c === '}') {
      if (tmpl.length && depth === tmpl[tmpl.length - 1] + 1) {
        depth--;
        tmpl.pop();
        const r = scanTemplate(i + 1);
        i = r.i;
        if (r.open) { tmpl.push(depth); depth++; }
        continue;
      }
      depth--;
      push('punct', '}');
      i++;
      continue;
    }
    if (c === '{') { depth++; push('punct', '{'); i++; continue; }

    const multi = PUNCT.find((p) => src.startsWith(p, i));
    if (multi) { push('punct', multi); i += multi.length; continue; }
    push('punct', c);
    i++;
  }
  return toks;
}

// The two findings for one module. Everything below works on token indices, so "before" means "earlier in
// the file", which is what a dead-zone read is.
function analyse(src) {
  const toks = tokenize(src);
  const N = toks.length;
  const v = (k) => (k >= 0 && k < N ? toks[k].v : null);
  const isPunct = (k, s) => k >= 0 && k < N && toks[k].t === 'punct' && toks[k].v === s;
  const isWord = (k, s) => k >= 0 && k < N && toks[k].t === 'name' && toks[k].v === s;

  // Bracket matching, once.
  const match = new Int32Array(N).fill(-1);
  const open = [];
  for (let k = 0; k < N; k++) {
    if (toks[k].t !== 'punct') continue;
    const c = toks[k].v;
    if (c === '(' || c === '[' || c === '{') open.push(k);
    else if (c === ')' || c === ']' || c === '}') {
      const o = open.pop();
      if (o !== undefined) { match[o] = k; match[k] = o; }
    }
  }

  // Does the `(` at k open a parameter list rather than a grouping or a condition?
  const isParamList = (k) => {
    const close = match[k];
    if (close < 0) return false;
    const prev = k - 1;
    if (toks[prev] && toks[prev].t === 'name') {
      const w = toks[prev].v;
      if (w === 'if' || w === 'for' || w === 'while' || w === 'switch') return false;
      if (w === 'catch') return true;
      if (w === 'function') return true;
    }
    if (isPunct(close + 1, '=>')) return true;
    if (isWord(prev - 1, 'function')) return true;
    // A method: `name(a, b) {`, `'name'(a) {` or `[computed](a) {` — in an object literal or a class body.
    if (toks[prev] && (toks[prev].t === 'name' || toks[prev].t === 'str' || toks[prev].v === ']') && isPunct(close + 1, '{')) return true;
    return false;
  };

  const isClassBody = (k) => {
    let j = k - 1;
    while (j >= 0 && (toks[j].t === 'name' || isPunct(j, '.'))) j--;
    return isWord(j + 1, 'class') || isWord(j, 'class') || isWord(j, 'extends');
  };

  // What kind of scope a `{` opens. Anything that is plainly not a function body or an object/class body
  // is a block, and a block does NOT stop the dead-zone check.
  const braceKind = (k) => {
    const p = k - 1;
    if (p < 0) return 'block';
    if (toks[p].t === 'punct') {
      if (toks[p].v === '=>') return 'fn';
      if (toks[p].v === ')') return match[p] >= 0 && isParamList(match[p]) ? 'fn' : 'block';
      if (toks[p].v === ';' || toks[p].v === '{' || toks[p].v === '}') return 'block';
      return 'obj';
    }
    const w = toks[p].v;
    if (w === 'else' || w === 'do' || w === 'try' || w === 'finally') return 'block';
    return isClassBody(k) ? 'class' : 'obj';
  };

  // Scopes. `fn` marks a boundary the dead-zone check will not look across; a class body counts as one,
  // because a field initializer runs at construction and not where it is written.
  const scopes = [{ parent: -1, fn: true, obj: false, lets: new Map() }];
  const scopeOf = new Int32Array(N);
  const stack = [0];
  for (let k = 0; k < N; k++) {
    if (isPunct(k, '{')) {
      const kind = braceKind(k);
      scopes.push({
        parent: stack[stack.length - 1],
        fn: kind === 'fn' || kind === 'class',
        obj: kind === 'obj' || kind === 'class',
        lets: new Map(),
      });
      stack.push(scopes.length - 1);
      scopeOf[k] = stack[stack.length - 1];
      continue;
    }
    if (isPunct(k, '}')) {
      if (stack.length > 1) stack.pop();
      scopeOf[k] = stack[stack.length - 1];
      continue;
    }
    scopeOf[k] = stack[stack.length - 1];
  }

  // An arrow whose body is an expression opens no brace, so it gets no scope — mark its extent instead
  // and treat it as a boundary. Without this, `const a = () => b(); const b = …` reads as a dead-zone
  // use, which it is not: nothing has called `a` yet.
  const inArrowExpr = new Uint8Array(N);
  for (let k = 0; k < N; k++) {
    if (!isPunct(k, '=>') || isPunct(k + 1, '{')) continue;
    let d = 0;
    for (let j = k + 1; j < N; j++) {
      const c = toks[j].t === 'punct' ? toks[j].v : '';
      if (c === '(' || c === '[' || c === '{') d++;
      else if (c === ')' || c === ']' || c === '}') { if (d === 0) break; d--; }
      else if (d === 0 && (c === ',' || c === ';')) break;
      inArrowExpr[j] = 1;
    }
  }

  const declName = new Set();   // token indices that ARE a binding name
  const skip = new Set();       // token indices that are neither a binding nor a use
  const fileNames = new Set();  // every name this module declares anywhere
  const declare = (scopeId, name, at, positional) => {
    fileNames.add(name);
    const s = scopes[scopeId];
    const prev = s.lets.get(name);
    if (prev === undefined || at < prev) s.lets.set(name, positional ? at : -1);
    if (!positional) s.lets.set(name, -1);
  };

  // The names a binding form binds, from its opening bracket to its match: a destructuring pattern or a
  // parameter list, which have the same shape. A key (`a` in `{ a: b }`) binds nothing, and a default
  // (`= expr`) is an expression rather than part of the pattern, so it is stepped over and read as
  // ordinary code later.
  const walkBindings = (open, close, onName) => {
    let d = 0;
    for (let j = open; j <= close; j++) {
      const c = toks[j].t === 'punct' ? toks[j].v : '';
      if (c === '{' || c === '[' || c === '(') { d++; continue; }
      if (c === '}' || c === ']' || c === ')') { d--; continue; }
      if (c === '=') {           // a default value: everything to the next comma at this depth is an expression
        let e = d;
        let j2 = j + 1;
        for (; j2 <= close; j2++) {
          const c2 = toks[j2].t === 'punct' ? toks[j2].v : '';
          if (c2 === '{' || c2 === '[' || c2 === '(') e++;
          else if (c2 === '}' || c2 === ']' || c2 === ')') { if (e === d) break; e--; }
          else if (e === d && c2 === ',') break;
        }
        j = j2 - 1;
        continue;
      }
      if (toks[j].t !== 'name' || KEYWORDS.has(toks[j].v)) continue;
      if (isPunct(j - 1, '.')) continue;
      if (isPunct(j + 1, ':')) { skip.add(j); continue; }   // key, not a binding
      onName(j);
    }
  };

  const collectPattern = (k, scopeId, at, positional) => {
    const close = match[k];
    if (close < 0) return k;
    walkBindings(k, close, (j) => {
      declName.add(j);
      declare(scopeId, toks[j].v, at, positional);
    });
    return close;
  };

  // Declarations, in one pass. Nothing here advances past an initializer, so the names inside one are
  // still read as uses below.
  for (let k = 0; k < N; k++) {
    const x = toks[k];
    if (x.t !== 'name') continue;

    if (x.v === 'import' && !isPunct(k + 1, '(') && !isPunct(k + 1, '.')) {
      for (let j = k + 1; j < N; j++) {
        if (toks[j].t === 'str') break;
        if (toks[j].t === 'name' && !KEYWORDS.has(toks[j].v)) { skip.add(j); declare(0, toks[j].v, -1, false); }
        if (isPunct(j, ';')) break;
      }
      continue;
    }
    if (x.v === 'export' && isPunct(k + 1, '{')) {
      const close = match[k + 1];
      for (let j = k + 1; j <= close && close > 0; j++) if (toks[j].t === 'name') skip.add(j);
      continue;
    }
    if (x.v === 'function' || x.v === 'class') {
      let j = k + 1;
      if (isPunct(j, '*')) j++;
      if (toks[j] && toks[j].t === 'name' && !KEYWORDS.has(toks[j].v)) {
        declName.add(j);
        declare(scopeOf[k], toks[j].v, -1, false);
      }
      continue;
    }
    if (x.v === 'const' || x.v === 'let' || x.v === 'var') {
      const positional = x.v !== 'var';
      let j = k + 1;
      while (j < N) {
        if (isPunct(j, '{') || isPunct(j, '[')) {
          j = collectPattern(j, scopeOf[k], k, positional) + 1;
        } else if (toks[j].t === 'name' && !KEYWORDS.has(toks[j].v)) {
          declName.add(j);
          declare(scopeOf[k], toks[j].v, k, positional);
          j++;
        } else break;
        if (isPunct(j, '=')) {                    // step over the initializer to the next binding
          let d = 0;
          for (; j < N; j++) {
            const c = toks[j].t === 'punct' ? toks[j].v : '';
            if (c === '(' || c === '[' || c === '{') d++;
            else if (c === ')' || c === ']' || c === '}') { if (d === 0) break; d--; }
            else if (d === 0 && (c === ',' || c === ';')) break;
            else if (d === 0 && toks[j].t === 'name' && (toks[j].v === 'of' || toks[j].v === 'in')) break;
          }
        }
        if (isPunct(j, ',')) { j++; continue; }
        break;
      }
      continue;
    }
  }
  // Parameters. A parameter is a binding, so it is neither a read nor something a later `const` of the
  // same name can be read "before" — `beads.map((b) => b.y)` above a `for (const b of beads)` is two
  // different `b`s and no defect at all. Where the function has a body in braces the parameters are
  // declared in it, so a name shadowed there stops the walk at the right scope.
  for (let k = 0; k < N; k++) {
    if (!isPunct(k, '(') || !isParamList(k)) continue;
    const close = match[k];
    if (close < 0) continue;
    const bodyScope = isPunct(close + 1, '{') ? scopeOf[close + 1] : -1;
    walkBindings(k, close, (j) => {
      skip.add(j);
      fileNames.add(toks[j].v);
      if (bodyScope >= 0) declare(bodyScope, toks[j].v, -1, false);
    });
  }
  for (let k = 0; k < N; k++) {           // `x => …`, the one parameter that wears no parentheses
    if (isPunct(k, '=>') && toks[k - 1] && toks[k - 1].t === 'name' && !KEYWORDS.has(toks[k - 1].v)) {
      fileNames.add(toks[k - 1].v);
      skip.add(k - 1);
    }
  }

  // A name at key position inside an object literal or a class body is a property, not a read.
  const isKeyPosition = (k) => {
    const before = v(k - 1);
    const after = v(k + 1);
    const opener = before === '{' || before === ',' || before === ';' || before === '}' ||
      before === 'get' || before === 'set' || before === 'static' || before === 'async' || before === '*';
    if (!opener) return false;
    return after === ':' || after === '(' || after === '=' || after === ';' || after === '}';
  };

  const useBefore = [];
  const undeclared = [];
  let uses = 0;                 // identifier reads actually examined, so a run that read nothing says so
  for (let k = 0; k < N; k++) {
    const x = toks[k];
    if (x.t !== 'name' || KEYWORDS.has(x.v)) continue;
    if (declName.has(k) || skip.has(k)) continue;
    if (x.v.startsWith('#')) continue;
    if (isPunct(k - 1, '.') || isPunct(k - 1, '?.')) continue;
    if (isWord(k - 1, 'break') || isWord(k - 1, 'continue')) continue;
    if (scopes[scopeOf[k]].obj && isKeyPosition(k)) continue;
    if (isPunct(k + 1, ':') && scopes[scopeOf[k]].obj) continue;
    // A label on a statement: `outer:` before a loop, as lib/bench.js writes one.
    if (isPunct(k + 1, ':') && (k === 0 || isPunct(k - 1, '{') || isPunct(k - 1, '}') || isPunct(k - 1, ';'))) continue;
    uses += 1;

    let s = scopeOf[k];
    let crossedFn = inArrowExpr[k] === 1;
    let found = false;
    while (s !== -1) {
      const at = scopes[s].lets.get(x.v);
      if (at !== undefined) {
        found = true;
        if (at >= 0 && k < at && !crossedFn) {
          useBefore.push({ name: x.v, line: x.line, declLine: toks[at].line });
        }
        break;
      }
      if (scopes[s].fn) crossedFn = true;
      s = scopes[s].parent;
    }
    if (!found && !fileNames.has(x.v) && !KNOWN_GLOBALS.has(x.v)) {
      undeclared.push({ name: x.v, line: x.line });
    }
  }
  const lets = scopes.reduce((n, s) => n + [...s.lets.values()].filter((at) => at >= 0).length, 0);
  return { useBefore, undeclared, uses, lets };
}

function modulePaths() {
  const dir = fileURLToPath(new URL('../src/figures/', import.meta.url));
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    if (name.endsWith('.js')) out.push(['src/figures/' + name, join(dir, name)]);
  }
  for (const name of readdirSync(join(dir, 'lib')).sort()) {
    if (name.endsWith('.js')) out.push(['src/figures/lib/' + name, join(dir, 'lib', name)]);
  }
  return out;
}

const modules = modulePaths().map(([rel, abs]) => ({ rel, ...analyse(readFileSync(abs, 'utf8')) }));

// A run that read nothing would pass both tests in silence, so each one says what it read first.
const totals = modules.reduce(
  (t, m) => ({ uses: t.uses + m.uses, lets: t.lets + m.lets }),
  { uses: 0, lets: 0 },
);

test('the corpus this file claims to read is on disk and was read', () => {
  assert.ok(modules.length >= 40, `only ${modules.length} module(s) found under src/figures/ — expected every figure and its lib`);
  assert.ok(totals.uses > 10000, `only ${totals.uses} identifier read(s) examined across ${modules.length} modules — the scanner read almost nothing`);
  assert.ok(totals.lets > 2000, `only ${totals.lets} positional let/const binding(s) found — the scanner has nothing to check reads against`);
  console.log(`      read ${modules.length} module(s), ${totals.uses} identifier read(s) against ${totals.lets} let/const binding(s)`);
});

test('no figure module reads a binding before its own let or const', () => {
  const bad = [];
  for (const m of modules) {
    for (const f of m.useBefore) {
      bad.push(
        `${m.rel}:${f.line}  \`${f.name}\` is read here, and its let/const is at line ${f.declLine} of the ` +
        'same function body.\n    This does not read as missing, it throws: ReferenceError: Cannot access ' +
        `'${f.name}' before initialization.\n    A guard \`if (${f.name})\` does not skip it and ` +
        `\`${f.name}?.x\` does not either — optional chaining tests for null and undefined, and a binding ` +
        'in its dead zone is neither.\n    Move the declaration above the first read, or move the read below it.',
      );
    }
  }
  assert.equal(bad.length, 0, `${bad.length} dead-zone read(s) in ${modules.length} figure modules:\n\n${bad.join('\n\n')}`);
});

test('no figure module reads a name that nothing in it declares', () => {
  const bad = [];
  for (const m of modules) {
    for (const f of m.undeclared) {
      bad.push(
        `${m.rel}:${f.line}  \`${f.name}\` is read here and this module declares it nowhere — no import, ` +
        'no const/let/var, no function, no class, no parameter.\n    At runtime that is ReferenceError: ' +
        `${f.name} is not defined.\n    If it is a misspelling of a binding that exists, fix the spelling; ` +
        'if it is a browser or platform global, add it to KNOWN_GLOBALS in test/use-before-declared.test.js.',
      );
    }
  }
  assert.equal(bad.length, 0, `${bad.length} undeclared name(s) in ${modules.length} figure modules:\n\n${bad.join('\n\n')}`);
});

test('the scanner finds the two shapes it claims to find', () => {
  // The gate's own instrument, checked before its measurement is trusted: a fixture carrying one of each
  // defect, and a second carrying the patterns most likely to be mistaken for them.
  const bad = analyse(`
    export function mount(root, ctx) {
      if (keepDamage) return;
      lane?.set(1);
      const keepDamage = ctx.keepDamage;
      const lane = root.lane;
      missingEntirely(root);
    }
  `);
  assert.deepEqual(bad.useBefore.map((f) => f.name), ['keepDamage', 'lane']);
  assert.deepEqual(bad.undeclared.map((f) => f.name), ['missingEntirely']);

  const good = analyse(`
    import { el, tween } from './lib/bench.js';
    const first = () => second();
    const second = () => 1;
    export function mount(root, { palette, width = 10 }) {
      const rows = [1, 2].map((n) => n * SCALE);
      root.addEventListener('click', () => later.set(rows));
      const later = el('g');
      const { a: renamed, b } = palette;
      for (const item of rows) tween(item, renamed, b, width, later);
      return { describe: () => ({ kind: 'x', rows }), destroy() { later.remove(); } };
    }
    const KEY = 'draw';
    class Badge { field = COUNT; static tag = 'badge'; [KEY](a) { return a + COUNT; } }
    const COUNT = 3;
    const SCALE = 2;
    const re = /POS/g;
    const badge = new Badge();
    const text = \`\${SCALE} and \${String(first())}\`;
    export const meta = { kind: 'demo', get title() { return text; }, aspect: 16 / 10, re };
  `);
  assert.deepEqual(good.useBefore, []);
  assert.deepEqual(good.undeclared, []);
});
