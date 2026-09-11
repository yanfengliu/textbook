// checkChapterData holds the adaptive study system's two data files (docs/design/adaptive.md): the
// objective graph and the review item bank. It must fire on each defect class it claims to catch, on
// fixtures that isolate the defect, so "did not run" can never read as "passed".
//
// Bound: structure and cross-references only. It cannot judge whether a question is any good, whether
// a distractor encodes a real misconception, or whether an objective is worth having. Those are the
// agent's rounds and the owner's reading. Nothing here touches the real chapter; `npm run check` does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkChapterData, checkDocument } from '../tools/check-content.js';

const OBJ = (over = {}) => ({
  id: 'a',
  statement: 'Do a thing the reader can be asked to do.',
  prereqs: [],
  teaches: { sections: ['s1'], figures: [] },
  level: 'recall',
  ...over,
});

const MCQ = (over = {}) => ({
  id: 'i-a-1',
  objective: 'a',
  kind: 'mcq',
  options: [{ text: 'right', correct: true }, { text: 'wrong', why: 'reveals a confusion' }],
  explain: 'because',
  ...over,
});

const three = (objective) => [1, 2, 3].map((n) => MCQ({ id: `i-${objective}-${n}`, objective }));
const CTX = { sections: ['s1', 's2'], figures: ['fig-x'] };

test('a well-formed objective graph and item bank pass', () => {
  assert.deepEqual(checkChapterData({ objectives: [OBJ()], items: three('a'), ...CTX }), []);
});

test('no objectives at all is not a failure: a chapter may not have adopted them yet', () => {
  assert.deepEqual(checkChapterData({ objectives: [], items: [], ...CTX }), []);
});

test('a duplicate id, an unknown level, and an empty statement each fail', () => {
  let f = checkChapterData({ objectives: [OBJ(), OBJ()], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('"a" is used twice')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ({ level: 'know' })], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('level "know"')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ({ statement: 'short' })], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('needs a statement')), f.join('\n'));
});

test('an unresolvable prerequisite fails', () => {
  const f = checkChapterData({ objectives: [OBJ({ prereqs: ['ghost'] })], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('requires "ghost"')), f.join('\n'));
});

test('a cycle in the prerequisites fails, because the queue would hunt for a foundation forever', () => {
  const cyc = [OBJ({ id: 'a', prereqs: ['b'] }), OBJ({ id: 'b', prereqs: ['a'] })];
  const f = checkChapterData({ objectives: cyc, items: [...three('a'), ...three('b')], ...CTX });
  assert.ok(f.some((x) => x.includes('cycle')), f.join('\n'));
});

test('a longer cycle fails too, not just a pair', () => {
  const cyc = [OBJ({ id: 'a', prereqs: ['b'] }), OBJ({ id: 'b', prereqs: ['c'] }), OBJ({ id: 'c', prereqs: ['a'] })];
  const f = checkChapterData({ objectives: cyc, items: [...three('a'), ...three('b'), ...three('c')], ...CTX });
  assert.ok(f.some((x) => x.includes('cycle')), f.join('\n'));
});

test('a diamond in the prerequisites is fine: two objectives may share a foundation', () => {
  const dag = [
    OBJ({ id: 'base' }),
    OBJ({ id: 'a', prereqs: ['base'] }),
    OBJ({ id: 'b', prereqs: ['base'] }),
    OBJ({ id: 'top', prereqs: ['a', 'b'] }),
  ];
  const items = ['base', 'a', 'b', 'top'].flatMap(three);
  assert.deepEqual(checkChapterData({ objectives: dag, items, ...CTX }), []);
});

test('an objective taught by a section or a figure the chapter does not have fails', () => {
  let f = checkChapterData({ objectives: [OBJ({ teaches: { sections: ['nope'], figures: [] } })], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('section "nope"')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ({ teaches: { sections: ['s1'], figures: ['fig-nope'] } })], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('figure "fig-nope"')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ({ teaches: { sections: [], figures: [] } })], items: three('a'), ...CTX });
  assert.ok(f.some((x) => x.includes('names no section')), f.join('\n'));
});

test('an item testing an objective the chapter does not declare fails', () => {
  const f = checkChapterData({ objectives: [OBJ()], items: [...three('a'), MCQ({ id: 'i-z', objective: 'z' })], ...CTX });
  assert.ok(f.some((x) => x.includes('objective "z", which this chapter does not declare')), f.join('\n'));
});

test('fewer than three items for an objective fails: one item gets memorised', () => {
  const f = checkChapterData({ objectives: [OBJ()], items: [MCQ(), MCQ({ id: 'i-a-2' })], ...CTX });
  assert.ok(f.some((x) => x.includes('has 2 item(s)')), f.join('\n'));
});

test('a duplicate item id fails', () => {
  const f = checkChapterData({ objectives: [OBJ()], items: [MCQ(), MCQ(), MCQ({ id: 'i-a-3' })], ...CTX });
  assert.ok(f.some((x) => x.includes('item id "i-a-1" is used twice')), f.join('\n'));
});

test('a distractor with no "why" fails: that field is what makes a wrong answer diagnostic', () => {
  const bare = MCQ({ id: 'i-a-3', options: [{ text: 'right', correct: true }, { text: 'wrong' }] });
  const f = checkChapterData({ objectives: [OBJ()], items: [MCQ(), MCQ({ id: 'i-a-2' }), bare], ...CTX });
  assert.ok(f.some((x) => x.includes('distractor with no "why"')), f.join('\n'));
});

test('no explanation, two correct answers, or none, each fail', () => {
  const bad = (over) => [MCQ(), MCQ({ id: 'i-a-2' }), MCQ({ id: 'i-a-3', ...over })];
  let f = checkChapterData({ objectives: [OBJ()], items: bad({ explain: '' }), ...CTX });
  assert.ok(f.some((x) => x.includes('no explanation')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ()], items: bad({ options: [{ text: 'a', correct: true }, { text: 'b', correct: true }] }), ...CTX });
  assert.ok(f.some((x) => x.includes('has 2 correct options')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ()], items: bad({ options: [{ text: 'a', why: 'w' }, { text: 'b', why: 'w' }] }), ...CTX });
  assert.ok(f.some((x) => x.includes('has 0 correct options')), f.join('\n'));
});

test('a task with no figure, an unknown figure, or nothing to grade against, each fail', () => {
  const task = (over) => [MCQ(), MCQ({ id: 'i-a-2' }), { id: 'i-a-3', objective: 'a', kind: 'task', figure: 'fig-x', expect: 'x === 1', explain: 'e', ...over }];
  assert.deepEqual(checkChapterData({ objectives: [OBJ()], items: task({}), ...CTX }), []);
  let f = checkChapterData({ objectives: [OBJ()], items: task({ figure: undefined }), ...CTX });
  assert.ok(f.some((x) => x.includes('task with no figure')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ()], items: task({ figure: 'fig-ghost' }), ...CTX });
  assert.ok(f.some((x) => x.includes('"fig-ghost"')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ()], items: task({ expect: undefined }), ...CTX });
  assert.ok(f.some((x) => x.includes('no "expect"')), f.join('\n'));
});

test('a free-response item with no rubric fails, and an unknown kind fails', () => {
  const withThird = (third) => [MCQ(), MCQ({ id: 'i-a-2' }), third];
  let f = checkChapterData({ objectives: [OBJ()], items: withThird({ id: 'i-a-3', objective: 'a', kind: 'free', question: 'q', explain: 'e' }), ...CTX });
  assert.ok(f.some((x) => x.includes('no rubric')), f.join('\n'));
  f = checkChapterData({ objectives: [OBJ()], items: withThird({ id: 'i-a-3', objective: 'a', kind: 'essay', explain: 'e' }), ...CTX });
  assert.ok(f.some((x) => x.includes('kind "essay"')), f.join('\n'));
});

// The other half of the contract lives in the markup: a question in the prose must say which
// objective it tests, or the answer cannot be recorded against anything.
const GLOSSARY = { cell: { term: 'Cell', def: 'The unit of life.' } };
const KINDS = ['pond'];
const FIGURE = '<tb-figure kind="pond" id="fig-pond" data-alt="A drop of pond water full of drifting single-celled organisms, some of which divide."><figcaption>Pond.</figcaption></tb-figure>';
const docWith = (body) => `<!doctype html><html><body><main data-chapter="1"><h1>T</h1>
<section id="s1"><h2>A</h2><p>A <tb-term ref="cell">cell</tb-term>. See Figure 1.1.</p>${FIGURE}${body}</section></main></body></html>`;
const QUESTION = '<tb-check id="qx"><p class="question">Q?</p><ul class="options"><li data-correct>a</li><li>b</li></ul><p class="explain">why</p></tb-check>';

test('a question naming no objective fails, an unknown one fails, and a real one passes', () => {
  const objectives = [OBJ()];
  let f = checkDocument(docWith(QUESTION), { glossary: GLOSSARY, kinds: KINDS, objectives });
  assert.ok(f.some((x) => x.includes('names no objective')), f.join('\n'));
  f = checkDocument(docWith(QUESTION.replace('id="qx"', 'id="qx" objective="ghost"')), { glossary: GLOSSARY, kinds: KINDS, objectives });
  assert.ok(f.some((x) => x.includes('objective "ghost"')), f.join('\n'));
  f = checkDocument(docWith(QUESTION.replace('id="qx"', 'id="qx" objective="a"')), { glossary: GLOSSARY, kinds: KINDS, objectives });
  assert.deepEqual(f, []);
});

test('with no objectives declared, an untagged question is not a failure', () => {
  assert.deepEqual(checkDocument(docWith(QUESTION), { glossary: GLOSSARY, kinds: KINDS, objectives: [] }), []);
});
