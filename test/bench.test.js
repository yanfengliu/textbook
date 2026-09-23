// The figure bench: its pure parts, and the lint that keeps a figure from climbing back out of it.
//
// `src/figures/lib/bench.js` exists because about a quarter of every figure module was scaffolding, and
// because a shared component that outlives its design is worse than none — `lib/cell-common.js`'s
// `panelCss` still ships a pill and a rounded progress bar that the figure brief now forbids, and three
// figures still draw them. So this file makes two claims.
//
// **The pure parts do what they say.** `fitSize` returns 0 rather than an unreadable size, `safeDim` and
// `safeCoord` refuse a negative or NaN dimension at the point it is computed, and `replay` consumes time
// in whole steps and restarts from zero when time moves backwards — which is what makes `setTime(t)` the
// same frame every run.
//
// **A figure on the bench cannot quietly leave it.** A module that imports the bench may not define a
// seventh `mulberry32`, construct its own `ResizeObserver`, draw a border or a radius in its own CSS, or
// reach `el('rect'|'circle'|'line'|'ellipse')` past the clamped primitives. And the classes the bench
// writes must be the classes `src/styles/components.css` declares, in both directions, so the chrome and
// its stylesheet cannot drift apart in silence.
//
// Bound: **text and exports, never pixels.** It reads modules as source and can be fooled by a string, a
// computed property name or a helper in another file — `lib/mol-draw.js`'s `bond()` reaches `el('line')`
// and this cannot see it, which is correct, because the bench does not own chapter 2's molecules. It
// says nothing about whether a bench figure looks right; that is `tools/figure-diff.js`, `npm run
// narrow`, and a person at `out/narrow/`. The lint is scoped to modules that IMPORT the bench, so the
// thirty-five figures that have not migrated do not go red; that scoping is also its weakness, because a
// figure that never imports the bench is never checked by it.
//
// The red proofs for every check in this file are in docs/learning/gate-proofs.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fitSize, safeDim, safeCoord, replay, wrapText, BENCH_CLASSES, BENCH_DESCRIBE_FIELD, BENCH_GL_CLASS, EM_ADVANCE } from '../src/figures/lib/bench.js';

const figuresDir = fileURLToPath(new URL('../src/figures/', import.meta.url));
const benchPath = fileURLToPath(new URL('../src/figures/lib/bench.js', import.meta.url));
const componentsCss = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');
const benchSrc = readFileSync(benchPath, 'utf8');
const sweepSrc = readFileSync(new URL('../tools/sweep3d.js', import.meta.url), 'utf8');

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.js')) out.push(p);
  }
  return out;
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');

const modules = walk(figuresDir).map((p) => ({
  path: relative(figuresDir, p).replace(/\\/g, '/'),
  raw: readFileSync(p, 'utf8'),
  src: stripComments(readFileSync(p, 'utf8')),
}));

// Only the modules that have actually migrated. A figure that has not is not in breach of a contract it
// never signed; the thirty-five of those are migrated opportunistically, one at a time, each with a
// `tools/figure-diff.js` manifest (docs/design/figure-bench.md, step 4).
const onBench = modules.filter((m) => m.path !== 'lib/bench.js' && /from\s+['"][./]*(?:lib\/)?bench\.js['"]/.test(m.src));

// ---------------------------------------------------------------- the pure parts

test('fitSize returns 0 rather than a size below the floor, so an overrunning label is not drawn at all', () => {
  // Room for about 19 characters at 10 px: 200 / (10 * 0.53).
  assert.equal(fitSize('short', 200, 12, 9), 12, 'a label with room to spare gets the maximum size');
  const tight = fitSize('a rather long label indeed', 120, 12, 9);
  assert.equal(tight, 0, `120 px cannot hold 26 characters at 9 px (it needs ${Math.round(26 * 9 * EM_ADVANCE)}), so it must not be drawn`);
  // 60 / (12 * 0.53) is 9.43: too tight for the ceiling, well clear of the floor.
  const middling = fitSize('twelve chars', 60, 12, 5);
  assert.ok(middling > 5 && middling < 12, `a label that fits between the floor and the ceiling is set between them, got ${middling}`);
  assert.ok(Math.abs(middling - 60 / (12 * EM_ADVANCE)) < 1e-9, 'and it is the width divided by the estimated advance, not a rounded guess');
  // The estimate itself, stated once so a change to it is a change to this line too.
  assert.equal(EM_ADVANCE, 0.53);
});

test('safeDim refuses a negative or NaN dimension, and says which number it was', () => {
  assert.equal(safeDim(12.5, 'rect width', false), 12.5);
  assert.equal(safeDim(0, 'rect width', false), 0, 'zero is a legal dimension');
  // On the site it draws nothing rather than losing the page.
  assert.equal(safeDim(-0.1, 'rect width', false), 0);
  assert.equal(safeDim(NaN, 'rect width', false), 0);
  assert.equal(safeDim(undefined, 'rect width', false), 0);
  // In the lab it throws, so the gate goes red naming the figure and the attribute.
  assert.throws(() => safeDim(-0.1, 'phlab/beakers: rect width', true), /phlab\/beakers: rect width was -0\.1/);
  assert.throws(() => safeDim(NaN, 'phlab/chart: rect height', true), /phlab\/chart: rect height was NaN/);
  assert.throws(() => safeDim(undefined, 'phlab/inset: circle r', true), /circle r was undefined/);
});

test('safeCoord allows a negative coordinate and refuses a NaN one', () => {
  assert.equal(safeCoord(-40, 'line x1', false), -40, 'a coordinate may legitimately be negative');
  assert.equal(safeCoord(NaN, 'line x1', false), 0);
  assert.throws(() => safeCoord(NaN, 'osmometer/scene: text x', true), /osmometer\/scene: text x was NaN/);
  assert.doesNotThrow(() => safeCoord(-40, 'line x1', true));
});

test('replay consumes time in whole steps and restarts from zero when time moves backwards', () => {
  const calls = [];
  let restarts = 0;
  const advance = (dt) => calls.push(dt);
  const restart = () => { restarts += 1; };

  // Forwards: whole steps only, and the leftover is not advanced.
  calls.length = 0;
  let r = replay({ from: 0, to: 1, step: 1 / 60, advance, restart });
  assert.equal(calls.length, 60, 'one second at 1/60 is sixty steps');
  assert.equal(restarts, 0);
  assert.ok(Math.abs(r.at - 1) < 1e-9);

  // The same destination reached in two calls takes the same number of steps as one: this is what makes
  // a frame at t the same frame however the clock got there.
  calls.length = 0;
  replay({ from: 0, to: 0.5, step: 1 / 60, advance, restart });
  const half = calls.length;
  replay({ from: 0.5, to: 1, step: 1 / 60, advance, restart });
  assert.equal(calls.length, 60, `two halves must total sixty steps, got ${half} + ${calls.length - half}`);

  // Backwards: restart, then replay the whole way from zero. Unwinding would need the model to be
  // reversible, which none of them is.
  calls.length = 0;
  restarts = 0;
  r = replay({ from: 5, to: 2, step: 0.1, advance, restart });
  assert.equal(restarts, 1, 'moving time backwards restarts the model');
  assert.equal(calls.length, 20, 'and then replays from zero to the new time');
  assert.ok(Math.abs(r.at - 2) < 1e-9);

  // A time the model cannot reach is a failure with a number in it, not a frozen tab.
  assert.throws(
    () => replay({ from: 0, to: 1e6, step: 1 / 60, advance: () => {}, restart, maxSteps: 1000 }),
    /needs more than 1000 steps/,
  );
});

test('replay does not lose a step to floating-point drift over a long run', () => {
  let n = 0;
  // 1/60 is not exact in binary; a strict comparison drops a step every few thousand.
  replay({ from: 0, to: 600, step: 1 / 60, advance: () => { n += 1; }, restart: () => {} });
  assert.equal(n, 36000, `ten minutes at 1/60 is 36000 steps, got ${n}`);
});

// ---------------------------------------------------------------- the chrome and its stylesheet

test('every class the bench styles is declared in components.css', () => {
  const missing = BENCH_CLASSES.filter((c) => !new RegExp(`\\.${c}[\\s,{:>]`).test(componentsCss));
  assert.deepEqual(missing, [], `these classes are written by src/figures/lib/bench.js and have no rule in src/styles/components.css, so the elements carrying them are unstyled: ${missing.join(', ')}`);
});

test('every tb- class the bench writes is one it says it styles', () => {
  // The other direction, so BENCH_CLASSES cannot go stale while the bench grows a class. Read from the
  // class attributes bench.js actually writes, not from the export, or this would only prove that the
  // list agrees with itself.
  const written = new Set();
  for (const m of stripComments(benchSrc).matchAll(/class: `([^`]*)`|class: '([^']*)'/g)) {
    for (const cls of (m[1] ?? m[2]).split(/\s+|\$\{[^}]*\}/)) {
      if (cls.startsWith('tb-')) written.add(cls);
    }
  }
  // `tb-live` carries no rule on purpose — the live region is hidden by nine inline properties so a
  // figure cannot lose a screen reader's only channel by forgetting a stylesheet — and a token ending in
  // a dash is the literal half of an interpolated name (`tb-${scope}`, `tb-pane-${name}`), which is a
  // hook for a figure's own CSS and carries no bench rule. Both say so in bench.js beside BENCH_CLASSES.
  // `tb-gl` is exempt for a third reason: it is a marker for a gate, not a style hook, and the rule that
  // acts on it is in tools/sweep3d.js. The test below reads that file, so it is checked, not unchecked.
  const exempt = new Set(['tb-live', BENCH_GL_CLASS]);
  const unlisted = [...written].filter((c) => !c.endsWith('-') && !BENCH_CLASSES.includes(c) && !exempt.has(c));
  assert.deepEqual(unlisted, [], `bench.js writes ${unlisted.join(', ')} and BENCH_CLASSES does not list it, so nothing checks that components.css declares it`);
  assert.ok(written.size >= 8, `the scan found only ${written.size} class attributes in bench.js, which means the pattern stopped matching and this check compared nothing`);
});

test('the sweep measures the WebGL canvas alone: its bare frame hides every bench pane that is not it', () => {
  // npm run sweep3d's whole claim rests on measuring the render and not the chrome around it, and a
  // bench figure's chrome is drawn in PANES — which are not labels, toolbars, chips or cards, so the
  // gate's hidden-selector list did not reach them. atp3d's ledger fills a third of its stage; a render
  // replaced by a clear would have left a table's worth of luminance variety behind and passed.
  // This is the seam: bench.js writes the marker, tools/sweep3d.js reads it, and nothing else holds the
  // two names together — components.css declares no rule for it, on purpose.
  assert.match(
    stripComments(benchSrc),
    /\$\{gl \? ` \$\{BENCH_GL_CLASS\}` : ''\}/,
    'src/figures/lib/bench.js no longer writes BENCH_GL_CLASS into a pane\'s class attribute, so every pane looks alike to the sweep and it cannot tell the render from the chrome',
  );
  const rule = `.tb-bench .tb-pane:not(.${BENCH_GL_CLASS})`;
  assert.ok(
    sweepSrc.includes(rule),
    `tools/sweep3d.js does not hide "${rule}" in its bare frame, so a bench figure's panes — atp3d's ledger is a six-row table over a third of the stage — are measured as if they were the render. bench.js calls the marker "${BENCH_GL_CLASS}" (BENCH_GL_CLASS); the gate must hide every pane without it.`,
  );
  // And the gate must actually USE the list it declares, rather than declaring one and injecting another.
  assert.match(
    sweepSrc,
    /addStyleTag\(\{\s*content:\s*`\$\{BARE_SELECTORS\.join\(', '\)\}/,
    'tools/sweep3d.js declares BARE_SELECTORS and injects some other string, so what it hides is not what this test just read',
  );
});

test('wrapText breaks a sentence to the column, and eight figures no longer each carry a copy', () => {
  const size = 10;
  // 200 px at 10 px type is about 37 characters: 200 / (10 * 0.53).
  const lines = wrapText('the margin is negative, so one ATP still covers a cycle and the pump runs forwards', 200, size);
  assert.ok(lines.length > 1, 'a sentence longer than the column has to come back as more than one line');
  const per = Math.floor(200 / (size * EM_ADVANCE));
  for (const line of lines) assert.ok(line.length <= per, `"${line}" is ${line.length} characters and the column holds ${per}`);
  assert.equal(lines.join(' '), 'the margin is negative, so one ATP still covers a cycle and the pump runs forwards', 'no word may be lost or duplicated in the breaking');
  assert.deepEqual(wrapText('short', 200, size), ['short']);
  // A word longer than the column is still drawn, on a line of its own, rather than dropped.
  assert.deepEqual(wrapText('antidisestablishmentarianism', 30, size), ['antidisestablishmentarianism']);
});

test('the primary-action rule sits above :hover in components.css, because the order is load-bearing', () => {
  const primary = componentsCss.indexOf('.fig-btn[data-primary]');
  const hover = componentsCss.indexOf('.fig-btn:hover');
  assert.ok(primary > 0, 'components.css declares no .fig-btn[data-primary] rule, so a bench figure has no primary mark at all');
  assert.ok(hover > 0, 'components.css declares no .fig-btn:hover rule');
  assert.ok(primary < hover, 'the primary rule moved below :hover, which changes the hovered appearance of every primary action in the book: both are (0,3,0), so the later one wins');
});

test('the pressed state of a figure control is told by its edge and its ink, never by a fill', () => {
  // The brief: "The primary action looks primary, told by --rule-head on its edge and the ink's weight,
  // never by a fill" (docs/design/figures-template.md). The same holds for a control that is ON: a
  // filled pill is application chrome, and it is what `lib/cell-common.js`'s .cl-mini still draws.
  const block = /\.fig-btn\[aria-pressed="true"\]\s*\{([^}]*)\}/.exec(componentsCss);
  assert.ok(block, 'components.css no longer declares .fig-btn[aria-pressed="true"] at all, so a pressed control says nothing');
  const background = /background:\s*([^;]+);/.exec(block[1])?.[1]?.trim();
  assert.ok(
    !background || background === 'var(--paper)',
    `a pressed figure control is filled with ${background}. It must be told by its edge and the weight of its ink: the only background it may set is var(--paper), which is the paper it stands on.`,
  );
  assert.match(block[1], /border-color:\s*var\(--rule-head\)/, 'a pressed control must take the head rule on its edge, which is what tells it apart from one that is off');
});

// ---------------------------------------------------------------- the lint over migrated figures

test('the lint has a subject', () => {
  // A lint scoped to "modules that import the bench" quietly checks nothing when none do. That is the
  // shape docs/policies/local-rules.md records: a check must fail when its subject is missing.
  assert.ok(onBench.length > 0, `no module under src/figures/ imports lib/bench.js, so every check below compared nothing. If the bench was removed, remove this file with it; if a figure was meant to be on it, it is not.`);
});

test('a figure on the bench does not define a second seeded generator', () => {
  for (const m of onBench) {
    assert.ok(
      !/(function\s+mulberry32|mulberry32\s*=\s*(function|\())/.test(m.src),
      `${m.path} defines mulberry32 and is on the bench, which supplies b.random() from the one definition in lib/chem-atoms.js. Six copies of this function are why the bench exists.`,
    );
  }
});

test('a figure on the bench does not construct its own ResizeObserver', () => {
  for (const m of onBench) {
    assert.ok(
      !/new\s+ResizeObserver/.test(m.src),
      `${m.path} constructs a ResizeObserver and is on the bench, which already observes the stage and the toolbar, redraws after document.fonts.ready, and guards against the callback re-entering itself. Two observers on one stage is two layouts racing.`,
    );
  }
});

test('a figure on the bench reaches SVG geometry through a pane, never through el() directly', () => {
  for (const m of onBench) {
    const bad = [...m.src.matchAll(/\bel\(\s*['"](rect|circle|line|ellipse)['"]/g)].map((x) => x[1]);
    assert.deepEqual(
      [...new Set(bad)], [],
      `${m.path} calls el('${[...new Set(bad)].join("'), el('")}') directly. A pane's rect/circle/line/ellipse clamp the dimension where it is computed; el() does not, and a <rect width="-0.1"> reached main, was pushed, and logged console errors on the live site.`,
    );
  }
});

test('a figure on the bench draws no border and no radius in its own CSS', () => {
  for (const m of onBench) {
    // The CSS a figure injects lives in a template literal; read those rather than the whole module, so
    // a JS property called `border` is not mistaken for a rule.
    const css = [...m.raw.matchAll(/`([^`]*\{[^`]*\}[^`]*)`/g)].map((x) => x[1]).join('\n');
    for (const forbidden of ['border-radius', 'border:']) {
      assert.ok(
        !css.includes(forbidden),
        `${m.path}'s own CSS declares "${forbidden}". The figure stage is the only drawn rectangle in the book (docs/design/figures-template.md): no pills, no chips, no bordered boxes, no rounded rectangles. The one bordered thing left is the stage.`,
      );
    }
  }
});

test('a figure on the bench does not report the field the bench owns', () => {
  for (const m of onBench) {
    // The frame owns id, kind, number and state and spreads them last; the bench spreads `layout` last
    // for the same reason. A figure that reported it would lose its own value without a word, which is
    // why tools/drive.js fails it rather than letting the bench win quietly.
    assert.ok(
      !new RegExp(`\\n\\s*${BENCH_DESCRIBE_FIELD}\\s*:`).test(m.src),
      `${m.path} reports "${BENCH_DESCRIBE_FIELD}" in an object of its own, which the bench owns and spreads last. Rename the figure's field.`,
    );
  }
});
