// The content checker must fire on each defect it claims to catch, on fixtures that isolate the
// defect, so "did not run" can never read as "passed". Bound: fixtures, not the real chapter; the real
// chapter is what `npm run check` reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDocument, parseHtml, findAll, textOf } from '../tools/check-content.js';

const GLOSSARY = { cell: { term: 'Cell', def: 'The unit of life.' }, gene: { term: 'Gene', def: 'A stretch of DNA.' } };
const KINDS = ['pond', 'cell3d'];

function page({ figures = '', body = '', glossary = '<tb-glossary></tb-glossary>' } = {}) {
  return `<!doctype html><html><body><main data-chapter="1"><h1>Title</h1>
<section id="a"><h2>A</h2><p>A <tb-term ref="cell">cell</tb-term> and a <tb-term ref="gene">gene</tb-term>. See Figure 1.1.</p>${figures}${body}</section>
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
