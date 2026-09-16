// The content checker must fire on each defect it claims to catch, on fixtures that isolate the
// defect, so "did not run" can never read as "passed". Bound: fixtures, not the real chapter; the real
// chapter is what `npm run check` reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDocument, checkChapterData, checkStudySources, parseHtml, findAll, textOf } from '../tools/check-content.js';
import { parseExpect, evalExpect } from '../src/components/task.js';

const GLOSSARY = { cell: { term: 'Cell', def: 'The unit of life.' }, gene: { term: 'Gene', def: 'A stretch of DNA.' } };
const KINDS = ['pond', 'cell3d'];

function page({ figures = '', body = '', glossary = '<tb-glossary></tb-glossary>', lang = 'en', cite = 'Figure 1.1' } = {}) {
  return `<!doctype html><html lang="${lang}"><body><main data-chapter="1"><h1>Title</h1>
<section id="a"><h2>A</h2><p>A <tb-term ref="cell">cell</tb-term> and a <tb-term ref="gene">gene</tb-term>. See ${cite}.</p>${figures}${body}</section>
<section id="g"><h2>Glossary</h2>${glossary}</section></main></body></html>`;
}

const GOOD_FIGURE = '<tb-figure kind="pond" id="fig-pond" data-alt="A drop of pond water full of drifting single-celled organisms, some of which divide."><figcaption>Pond.</figcaption></tb-figure>';

test('a well-formed page passes', () => {
  assert.deepEqual(checkDocument(page({ figures: GOOD_FIGURE }), { glossary: GLOSSARY, kinds: KINDS }), []);
});

test('a duplicate id fails and names the id', () => {
  const html = page({ figures: GOOD_FIGURE, body: '<p id="a">dup</p>' });
  const fails = checkDocument(html, { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('id "a" is used twice')), fails.join('\n'));
});

test('an unregistered figure kind fails', () => {
  const html = page({ figures: GOOD_FIGURE.replace('kind="pond"', 'kind="nope"') });
  const fails = checkDocument(html, { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('kind="nope"') && f.includes('not a registered kind')), fails.join('\n'));
});

test('a figure without a caption or a short alt fails', () => {
  const noCaption = GOOD_FIGURE.replace('<figcaption>Pond.</figcaption>', '');
  let fails = checkDocument(page({ figures: noCaption }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('has no <figcaption>')), fails.join('\n'));
  const shortAlt = GOOD_FIGURE.replace(/data-alt="[^"]*"/, 'data-alt="Pond."');
  fails = checkDocument(page({ figures: shortAlt }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('data-alt of at least 40 characters')), fails.join('\n'));
});

test('a figure never mentioned in the prose fails, and a mention of a missing figure fails', () => {
  const two = GOOD_FIGURE + GOOD_FIGURE.replace('fig-pond', 'fig-2');
  let fails = checkDocument(page({ figures: two }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('Figure 1.2') && f.includes('never mentioned')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<p>See Figure 1.7.</p>' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('mentions Figure 1.7')), fails.join('\n'));
});

test('the figure-citation word follows the page language, so a Chinese chapter can cite 圖 1.1', () => {
  // The rule was the literal `Figure`, so on a page whose prose is Chinese every figure failed as
  // "never mentioned in the prose" — and it could not be fixed from the page side without writing the
  // English word into Chinese prose. Found 2026-09-12 while adding the 資治通鑑 book. The word now comes
  // from the page's own `<html lang>`, defaulting to English.
  //
  // The first assertion is the one that matters: it is the shape of the original defect, and it must
  // still fail. A rule that merely stopped firing would pass the second assertion and check nothing.
  let fails = checkDocument(page({ figures: GOOD_FIGURE, lang: 'zh-Hans', cite: 'Figure 1.1' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('never mentioned in the prose')),
    `a Chinese page citing the English word "Figure" must still fail; got: ${JSON.stringify(fails)}`);

  fails = checkDocument(page({ figures: GOOD_FIGURE, lang: 'zh-Hans', cite: '圖 1.1' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.deepEqual(fails, [], `a Chinese page citing 圖 1.1 must pass; got: ${JSON.stringify(fails)}`);

  // No space is required after the token: `text-autospace` supplies it in Chinese setting, so a chapter
  // may write 圖1.1 and must not be failed for it.
  fails = checkDocument(page({ figures: GOOD_FIGURE, lang: 'zh', cite: '圖1.1' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.deepEqual(fails, [], `圖1.1 with no space must pass; got: ${JSON.stringify(fails)}`);

  // An unknown language keeps the English word rather than being silently exempted from the rule.
  fails = checkDocument(page({ figures: GOOD_FIGURE, lang: 'fr', cite: '圖 1.1' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('never mentioned in the prose')),
    `a language with no token declared must keep the English one and still fail; got: ${JSON.stringify(fails)}`);

  // And an English page is untouched.
  assert.deepEqual(checkDocument(page({ figures: GOOD_FIGURE }), { glossary: GLOSSARY, kinds: KINDS }), []);
});

test('a term with no glossary entry fails, and an unused glossary entry fails', () => {
  let fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<p><tb-term ref="virus">virus</tb-term></p>' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('ref="virus"') && f.includes('no glossary entry')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE }), { glossary: { ...GLOSSARY, extra: { term: 'Extra', def: 'x' } }, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('"extra" is never used')), fails.join('\n'));
});

test('a check with two correct answers, or none, or no explanation fails', () => {
  const check = (opts, explain = '<p class="explain">Why.</p>') => `<tb-check id="q"><p class="question">Q?</p><ul class="options">${opts}</ul>${explain}</tb-check>`;
  let fails = checkDocument(page({ figures: GOOD_FIGURE, body: check('<li data-correct>a</li><li data-correct>b</li>') }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('exactly one data-correct') && f.includes('has 2')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: check('<li>a</li><li>b</li>') }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('has 0')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: check('<li data-correct>a</li><li>b</li>', '') }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('has no .explain')), fails.join('\n'));
  assert.deepEqual(checkDocument(page({ figures: GOOD_FIGURE, body: check('<li data-correct>a</li><li>b</li>') }), { glossary: GLOSSARY, kinds: KINDS }), []);
});

test('a sort item naming a bin that does not exist, or without a why, fails', () => {
  const sort = (items) => `<tb-sort id="s"><ul class="bins"><li data-bin="x">X</li><li data-bin="y">Y</li></ul><ul class="items">${items}</ul></tb-sort>`;
  let fails = checkDocument(page({ figures: GOOD_FIGURE, body: sort('<li data-bin="z" data-why="w">thing</li><li data-bin="x" data-why="w">two</li>') }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('names bin "z"')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: sort('<li data-bin="x">thing</li><li data-bin="y" data-why="w">two</li>') }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('has no data-why')), fails.join('\n'));
});

test('heading structure: a second h1, an h2 outside a section, a skipped level', () => {
  let fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<h1>Again</h1>' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('exactly one <h1>')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<div><h2>Loose</h2></div>' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('not the direct child of a <section id>')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<h4>Deep</h4>' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('skips from h2 to h4')), fails.join('\n'));
});

test('a TODO left in the page fails, and a broken href fails', () => {
  let fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<p>TODO write this</p>' }), { glossary: GLOSSARY, kinds: KINDS });
  assert.ok(fails.some((f) => f.includes('"TODO"')), fails.join('\n'));
  fails = checkDocument(page({ figures: GOOD_FIGURE, body: '<a href="missing.html">x</a><a href="#nowhere">y</a>' }), { glossary: GLOSSARY, kinds: KINDS, resolveHref: () => false });
  assert.ok(fails.some((f) => f.includes('"missing.html"')), fails.join('\n'));
  assert.ok(fails.some((f) => f.includes('"#nowhere"')), fails.join('\n'));
});

test('the tokenizer nests custom elements and keeps text', () => {
  const doc = parseHtml('<section id="s"><h2>T</h2><tb-figure kind="pond"><figcaption>Cap <em>x</em></figcaption></tb-figure><script>if (a < b) {}</script></section>');
  const fig = findAll(doc, (n) => n.tag === 'tb-figure')[0];
  assert.equal(findAll(fig, (n) => n.tag === 'figcaption').length, 1);
  assert.equal(textOf(findAll(fig, (n) => n.tag === 'figcaption')[0]), 'Cap x');
  assert.equal(findAll(doc, (n) => n.tag === 'script').length, 1);
});

// ---- a figure task's expect must be one the grader can evaluate (found 2026-09-11 in chapter 2) ----
// The grammar's right-hand side is a literal, never a second path, so `heat.comparisonC > heat.waterC`
// parses and then throws on every grade. These fixtures go through checkChapterData so what is tested
// is the checker's use of the grader's parser, not a re-statement of the grammar here.
const OBJ = { id: 'a', statement: 'Do a thing the reader can be asked to do.', prereqs: [], teaches: { sections: ['s1'], figures: [] }, level: 'recall' };
const MCQ = (id) => ({ id, objective: 'a', kind: 'mcq', options: [{ text: 'right', correct: true }, { text: 'wrong', why: 'reveals a confusion' }], explain: 'because' });
const bankWithTask = (expect) => [MCQ('i-a-1'), MCQ('i-a-2'), { id: 'i-a-3', objective: 'a', kind: 'task', figure: 'fig-x', expect, explain: 'e' }];
const checkTask = (expect) => checkChapterData({ objectives: [OBJ], items: bankWithTask(expect), sections: ['s1'], figures: ['fig-x'], file: 'ch/objectives.js', itemsFile: 'ch/items.js' });

test('a task comparing a field against another field fails, naming the bank, the item, the clause and what the right side must be', () => {
  const f = checkTask('heat.comparisonC > 40 and heat.comparisonC > heat.waterC');
  assert.equal(f.length, 1, f.join('\n'));
  assert.ok(f[0].startsWith('ch/items.js: item "i-a-3"'), f[0]);
  assert.ok(f[0].includes('compares against "heat.waterC", which is not a number'), f[0]);
  assert.ok(f[0].includes('the right-hand side of ">" must be a number'), f[0]);
});

test('a numeric comparison against quoted text fails, wherever the clause sits in the expression', () => {
  let f = checkTask("core < 'hot'");
  assert.ok(f.some((x) => x.includes('compares against "hot", which is not a number')), f.join('\n'));
  f = checkTask('not (a === 1 or b >= up)');
  assert.ok(f.some((x) => x.includes('compares against "up"') && x.includes('">="')), f.join('\n'));
  f = checkTask('x > 1 and y <= two and z < three');
  assert.equal(f.length, 2, f.join('\n'));
});

test('a numeric comparison against an empty string, null or a boolean fails: Number() reads them as 0, 0 and 1, and the grader must not', () => {
  // Found by review (2026-09-16): `x > ""`, `x > null` and `x > true` came back clean from
  // expectProblems and graded as `> 0`, `> 0` and `> 1`, because "not a number" was implemented as
  // "not Number()-coercible". The literal must be a number the tokenizer read.
  for (const [src, what] of [['x > ""', 'an empty string'], ["x >= ' '", '" "'], ['x > null', 'null'], ['x > true', 'true'], ['x < false', 'false']]) {
    const f = checkTask(src);
    assert.equal(f.length, 1, `${src}: ${f.join('\n')}`);
    assert.ok(f[0].includes(`compares against ${what}, which is not a number`), `${src}: ${f[0]}`);
  }
  // The grader refuses the same clause at grade time, through the same literalFor(): a task that
  // slipped past the check would tell the reader rather than grade `> 0` in silence.
  assert.throws(() => evalExpect(parseExpect('x > ""'), { x: 5 }), /compares against an empty string, which is not a number/);
  assert.throws(() => evalExpect(parseExpect('x > null'), { x: 5 }), /compares against null, which is not a number/);
  // Zero, a negative and an exponent are numbers and pass; equality against any literal still does.
  assert.deepEqual(checkTask('x > 0 and y <= -1 and z >= 0.5 and w < 1e3 and v === "" and u == null and t != true'), []);
  assert.equal(evalExpect(parseExpect('x > 0'), { x: 5 }), true);
});

test('an expect the grammar cannot read fails with the parser\'s own message', () => {
  let f = checkTask('core >');
  assert.ok(f.some((x) => x.includes('item "i-a-3"') && x.includes('followed by nothing')), f.join('\n'));
  f = checkTask('core > 37 && feedback');
  assert.ok(f.some((x) => x.includes('this grammar does not read')), f.join('\n'));
  f = checkTask('(core > 37');
  assert.ok(f.some((x) => x.includes('never closes')), f.join('\n'));
});

test('every form the grammar allows passes: words under equality and ~, truthiness, numbers under the order operators', () => {
  assert.deepEqual(checkTask('panel === heat and isomerOf ~ ether and not dragging and (x > 40 or y <= -1.5) and z != null and w == true and events.length >= 2'), []);
});

test('a number in scientific notation is a number: chapter 1 shipped `lensMetres < 2e-7` and the grammar read it as 2 and the word "e-7"', () => {
  // The real defect the first run of this check found (2026-09-15). The number token stopped at the
  // decimal point, so this parsed as a trailing word and the task mounted as broken for every reader.
  assert.deepEqual(checkTask("nearest === 'influenza' and lensMetres < 2e-7"), []);
  assert.deepEqual(checkTask('x < 1E+3 and y > -2.5e-3 and z >= 10e2'), []);
  // A stray letter after a number is still a word, and still an error the parser names.
  const f = checkTask('x < 2ee');
  assert.ok(f.some((m) => m.includes('has trailing "ee"')), f.join('\n'));
});

// ---- every item bank is listed on the study page (found 2026-09-11: chapter 2's 105 items were not) ----
const BANKS = [
  { dir: 'biology/ch01-what-is-life', key: 'biology/ch01', number: '1', title: 'What is life?', items: 99 },
  { dir: 'biology/ch02-chemistry-of-life', key: 'biology/ch02', number: '2', title: 'The chemistry of life', items: 105 },
];
const CH1 = '<a class="tb-source" href="../biology/ch01-what-is-life/" data-key="biology/ch01">1 · What is life?</a>';
const CH2 = '<a class="tb-source" href="../biology/ch02-chemistry-of-life/" data-key="biology/ch02">2 · The chemistry of life</a>';
const today = (sources) => `<!doctype html><html><body><main><h1>Today</h1>\n<tb-sitting size="10">\n${sources}\n</tb-sitting></main></body></html>`;

test('a chapter with an item bank that the study page does not list fails, naming the chapter, the file and the exact element', () => {
  const f = checkStudySources({ html: today(CH1), banks: BANKS });
  assert.equal(f.length, 1, f.join('\n'));
  assert.ok(f[0].includes('biology/ch02-chemistry-of-life/items.js exists (105 items)'), f[0]);
  assert.ok(f[0].includes('today/index.html'), f[0]);
  assert.ok(f[0].includes(CH2), f[0]);
});

test('the study page listing every bank passes, in either order', () => {
  assert.deepEqual(checkStudySources({ html: today(CH1 + '\n' + CH2), banks: BANKS }), []);
  assert.deepEqual(checkStudySources({ html: today(CH2 + '\n' + CH1), banks: BANKS }), []);
});

test('a source with the wrong data-key fails naming the chapter id the store expects, and a missing one fails', () => {
  let f = checkStudySources({ html: today(CH1 + CH2.replace('data-key="biology/ch02"', 'data-key="biology/ch2"')), banks: BANKS });
  assert.ok(f.some((x) => x.includes('data-key="biology/ch2"') && x.includes('chapter id is "biology/ch02"') && x.includes(CH2)), f.join('\n'));
  f = checkStudySources({ html: today(CH1 + CH2.replace(' data-key="biology/ch02"', '')), banks: BANKS });
  assert.ok(f.some((x) => x.includes('has no data-key')), f.join('\n'));
});

test('two sources sharing a key fail: register() would keep only one of them', () => {
  const f = checkStudySources({ html: today(CH1 + CH2.replace('biology/ch02"', 'biology/ch01"')), banks: BANKS });
  assert.ok(f.some((x) => x.includes('two sources share data-key="biology/ch01"')), f.join('\n'));
});

test('given no bank at all, or a page with no <tb-sitting>, the check fails rather than passing over nothing', () => {
  let f = checkStudySources({ html: today(CH1), banks: [] });
  assert.ok(f.some((x) => x.includes('nothing to check')), f.join('\n'));
  f = checkStudySources({ html: '<!doctype html><html><body><main><h1>Today</h1></main></body></html>', banks: BANKS });
  assert.ok(f.some((x) => x.includes('no <tb-sitting>')), f.join('\n'));
});
