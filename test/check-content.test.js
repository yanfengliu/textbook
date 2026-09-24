// The content checker must fire on each defect it claims to catch, on fixtures that isolate the
// defect, so "did not run" can never read as "passed". Bound: fixtures, not the real chapter; the real
// chapter is what `npm run check` reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDocument, checkChapterData, checkStudySources, checkChapterAvailability, parseHtml, findAll, textOf } from '../tools/check-content.js';
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

// ---- the closing card points at the next chapter once that chapter is on disk ----------------------
// Third time this has been wrong. Chapters 1 and 2 told readers the next chapter was in preparation for
// six days while it sat finished beside them; chapter 3 then pointed at the book page and called chapter
// 4 unwritten while chapter 4 was being written. `href="../"` resolves to a directory that exists, so the
// href rule can never see it: the card has to be checked against the tree.
const CARD = (href, dek, strong = '4 · Membranes and transport') =>
  `<a class="tb-next" href="${href}"><span class="tb-label">Next</span><strong>${strong}</strong><span class="dek">${dek}</span></a>`;
const NEXT = { dir: 'ch04-membranes-and-transport', number: 4, path: 'biology/ch04-membranes-and-transport' };
const DEK = 'What a membrane is made of, and what crosses it.';
const card = (html, nextChapter = NEXT) => checkDocument(page({ figures: GOOD_FIGURE, body: html }), { glossary: GLOSSARY, kinds: KINDS, nextChapter });

test('a card pointing at the book page while the next chapter is on disk fails, naming the directory and the href to write', () => {
  const f = card(CARD('../', DEK));
  assert.equal(f.length, 1, f.join('\n'));
  assert.ok(f[0].includes('does not point at the next chapter'), f[0]);
  assert.ok(f[0].includes('biology/ch04-membranes-and-transport/'), f[0]);
  assert.ok(f[0].includes('write href="../ch04-membranes-and-transport/"'), f[0]);
});

test('a card pointing at the next chapter passes, with or without the trailing slash or the index.html', () => {
  for (const href of ['../ch04-membranes-and-transport/', '../ch04-membranes-and-transport', '../ch04-membranes-and-transport/index.html']) {
    assert.deepEqual(card(CARD(href, DEK)), [], `href="${href}" must pass`);
  }
});

test('a card that still calls the next chapter unwritten fails, however it is pointed', () => {
  // The half the href rule cannot catch: someone repoints the link and leaves the dek behind.
  const f = card(CARD('../ch04-membranes-and-transport/', `${DEK} In preparation; the book page lists every chapter.`));
  assert.equal(f.length, 1, f.join('\n'));
  assert.ok(f[0].includes('"in preparation"') && f[0].includes('is on disk'), f[0]);
  for (const phrase of ['Coming soon.', 'Not yet written.', 'Still being written.']) {
    assert.ok(card(CARD('../ch04-membranes-and-transport/', `${DEK} ${phrase}`)).length === 1, `"${phrase}" must fail`);
  }
});

test('a card announcing a chapter number that is not the one on disk fails', () => {
  const f = card(CARD('../ch04-membranes-and-transport/', DEK, '5 · Energy and metabolism'));
  assert.ok(f.some((x) => x.includes('announces chapter 5') && x.includes('follows this one on disk is 4')), f.join('\n'));
});

test('with no next chapter on disk the rule does not fire: the last chapter\'s card points at the book page and is right to', () => {
  // Chapter 4's own card points at `../` because chapter 5 does not exist, and the href rule would fail a
  // link to a directory that is not there. A rule that failed this would make the last chapter unfixable.
  assert.deepEqual(card(CARD('../', 'Why some reactions run by themselves.', '5 · Energy and metabolism'), null), []);
  assert.deepEqual(card(CARD('../', 'In preparation.', '5 · Energy and metabolism'), null), []);
});

test('a chapter page with no card at all is not failed by this rule', () => {
  // The 資治通鑑 chapters carry no closing card. Requiring one is a decision about that book, not a
  // defect this rule saw, so it says nothing.
  assert.deepEqual(card(''), []);
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

// ---- which chapters a page says can be read, against the chapter directories on disk ----------------
// Five times a page called a finished chapter unwritten: the contents for chapters 2 and 3 (6d854cf),
// chapter 4's closing card, the contents for chapters 4 and 5, then the library page and README.md.
const ON_DISK = [1, 2, 3, 4, 5].map((n) => ({ dir: `ch0${n}-c${n}`, number: n }));
const BOOKS = new Map([['biology', { title: 'The Living World', onDisk: ON_DISK }]]);
const line = (n) => (n <= 5
  ? `<li><a href="ch0${n}-c${n}/"><span class="n">${n}</span><span><span class="title">T${n}</span></span><span class="tag">Read</span></a></li>`
  : `<li><span class="soon"><span class="n">${n}</span><span class="title">T${n}</span><span class="tag">In preparation</span></span></li>`);
const allLines = (n = 32) => Array.from({ length: n }, (_, i) => line(i + 1));
const contents = (lines = allLines(), lang = 'en') =>
  `<!doctype html><html lang="${lang}"><body><main class="book"><h1>The Living World</h1><ol class="chapters">${lines.join('')}</ol></main></body></html>`;
const CONTENTS = contents();
const contentsOf = (dir) => (dir === 'biology' ? CONTENTS : null);
const avail = (html, file = 'biology/index.html') => checkChapterAvailability({ file, html, books: BOOKS, contentsOf });
const shelf = (text) => `<!doctype html><html lang="en"><body><main class="library"><h1>Textbooks</h1><div class="shelf"><a class="book" href="biology/"><div class="book__body"><h2>The Living World</h2><p>${text}</p></div></a></div></main></body></html>`;

test('a contents page that agrees with the disk passes', () => {
  assert.deepEqual(avail(CONTENTS), []);
});

test('a chapter on disk listed as in preparation with no link fails, naming the directory and the line to write', () => {
  const lines = allLines();
  lines[1] = `<li><span class="soon"><span class="n">2</span><span class="title">T2</span><span class="tag">In preparation</span></span></li>`;
  const f = avail(contents(lines));
  assert.equal(f.length, 1, f.join('\n'));
  assert.ok(f[0].includes('chapter 2 (T2) is on disk at biology/ch02-c2/') && f[0].includes('<a href="ch02-c2/">') && f[0].includes('<span class="tag">Read</span>'), f[0]);
});

test('a linked chapter tagged as unwritten, a link to a chapter not on disk, and a link to the wrong directory each fail', () => {
  const lines = allLines();
  lines[2] = lines[2].replace('>Read<', '>In preparation<');
  lines[3] = lines[3].replace('href="ch04-c4/"', 'href="ch05-c5/"');
  lines[6] = '<li><a href="ch07-c7/"><span class="n">7</span><span class="title">T7</span><span class="tag">Read</span></a></li>';
  const f = avail(contents(lines));
  assert.ok(f.some((x) => x.includes('chapter 3 (T3) is on disk and linked, and its tag says "In preparation"; write <span class="tag">Read</span>')), f.join('\n'));
  assert.ok(f.some((x) => x.includes('chapter 4 (T4)\'s line links href="ch05-c5/"') && x.includes('write href="ch04-c4/"')), f.join('\n'));
  assert.ok(f.some((x) => x.includes('chapter 7 (T7)\'s line links href="ch07-c7/", and biology/ has no ch07- directory')), f.join('\n'));
});

test('a chapter on disk with no line, a line with no number, a number listed twice, and a page with no list each fail', () => {
  const lines = allLines();
  lines[4] = '<li><span class="soon"><span class="title">Untitled</span></span></li>';
  lines[7] = line(7);
  let f = avail(contents(lines));
  assert.ok(f.some((x) => x.includes('biology/ch05-c5/ is on disk and the contents list no chapter 5')), f.join('\n'));
  assert.ok(f.some((x) => x.includes('has no <span class="n"> holding its chapter number')), f.join('\n'));
  assert.ok(f.some((x) => x.includes('chapter 7 is listed twice')), f.join('\n'));
  f = avail('<!doctype html><html lang="en"><body><main><h1>The Living World</h1><p>Chapters.</p></main></body></html>');
  assert.ok(f.length === 1 && f[0].includes('no <ol class="chapters">'), f.join('\n'));
});

test('the tag words follow the page language, in either Chinese script, and a language with no words fails', () => {
  const zh = (ready, soon) => contents(allLines(6).map((l) => l.replace('>Read<', `>${ready}<`).replace('>In preparation<', `>${soon}<`)), 'zh-Hans');
  assert.deepEqual(avail(zh('可读', '未写')), []);
  assert.deepEqual(avail(zh('可讀', '未寫')), []);
  assert.equal(avail(zh('Read', '未写')).length, 5);
  const f = avail(contents(undefined, 'fr'));
  assert.ok(f.some((x) => x.includes('lang is "fr"') && x.includes('CONTENTS_TAGS')), f.join('\n'));
});

test('the library page\'s own sentence fails twice: the chapters it names, and the count it says are left', () => {
  const f = avail(shelf('An interactive introduction to biology. Chapter 1, “What is life?”, is ready; thirty-one more are outlined.'), 'index.html');
  assert.equal(f.length, 2, f.join('\n'));
  assert.ok(f[0].includes('says chapter 1 is ready, and nothing else is') && f[0].includes('chapters 1, 2, 3, 4 and 5 on disk'), f[0]);
  assert.ok(f[1].includes('says 31 more chapters are unwritten') && f[1].includes('lists 32 with 5 on disk, so 27 are; write 27'), f[1]);
});

test('a sentence naming exactly the chapters on disk passes, wording with no list has nothing to go stale, and the rest fail', () => {
  for (const ok of [
    'Chapters 1 to 5 are ready; twenty-seven more are outlined.',
    'The first five chapters are ready.',
    'Five of its 32 chapters are written.',
    'Chapter 3 explains cells, and chapters 1 through 5 are published.',
    'It is published a chapter at a time as each is finished, and the book’s contents say which are ready to read.',
  ]) assert.deepEqual(avail(shelf(ok), 'index.html'), [], ok);
  for (const bad of ['Chapters 1 to 4 are ready.', 'Four chapters are ready.', 'Five of its 30 chapters are written.', 'Chapter 5 is in preparation.', 'Chapter 3 explains cells, and chapter 4 is ready.']) {
    assert.ok(avail(shelf(bad), 'index.html').length, `"${bad}" must fail`);
  }
});

test('README.md is read a paragraph at a time, against the book whose title the paragraph names', () => {
  const md = (text) => checkChapterAvailability({ file: 'README.md', markdown: text, books: BOOKS, contentsOf });
  let f = md('# textbook\n\nThe first book is **The Living World**. Chapter 1, *What is life?*, is written: nine figures.\n');
  assert.ok(f.length === 1 && f[0].startsWith('README.md:3: the paragraph about biology says chapter 1 is written, and nothing else is'), f.join('\n'));
  f = md('# textbook\n\nChapter 1 is ready.\n');
  assert.ok(f.length === 1 && f[0].includes('names no book by its title'), f.join('\n'));
  assert.deepEqual(md('The Living World.\n\n```bash\n# chapter 1 is ready\n```\n'), []);
  assert.deepEqual(md('The first book is **The Living World**, published a chapter at a time; its contents page says which chapters are ready.\n'), []);
});

test('a claim on the library page outside any shelf card fails, because it is about no one book', () => {
  const html = shelf('An introduction to biology.').replace('<div class="shelf">', '<p>Chapter 1 is ready.</p><div class="shelf">');
  const f = avail(html, 'index.html');
  assert.ok(f.length === 1 && f[0].includes('says "Chapter 1 is ready" outside every shelf card'), f.join('\n'));
});

// The independent review of this rule found each of the following; each test fails without its fix.
test('a list of chapters is read as the list it names: commas, "and", ranges and the two together', () => {
  assert.deepEqual(avail(shelf('Chapters 1, 2, 3, 4 and 5 are ready.'), 'index.html'), []);
  assert.deepEqual(avail(shelf('Chapters 1–3, 4 and 5 are ready.'), 'index.html'), []);
  let f = avail(shelf('Chapters 1, 2 and 3 are ready.'), 'index.html');
  assert.ok(f.length === 1 && f[0].includes('says chapters 1, 2 and 3 are ready, and nothing else is'), f.join('\n'));
  f = avail(shelf('Chapters 1 to 5 and 7 are ready.'), 'index.html');
  assert.ok(f.length === 1 && f[0].includes('chapters 1, 2, 3, 4, 5 and 7 are ready'), f.join('\n'));
});

test('an entity is read as the character it stands for, so a no-break space or hyphen hides nothing', () => {
  let f = avail(shelf('Chapter&nbsp;1 is ready.'), 'index.html');
  assert.ok(f.length === 1 && f[0].includes('says chapter 1 is ready'), f.join('\n'));
  f = avail(shelf('Chapters 1 to 5 are ready; thirty&#8209;one more are outlined.'), 'index.html');
  assert.ok(f.length === 1 && f[0].includes('says 31 more chapters are unwritten'), f.join('\n'));
});

test('"have been published", "of the book\'s 32", a figure count, and a question in the prose are each read right', () => {
  assert.deepEqual(avail(shelf('Chapters 1 to 5 have been published.'), 'index.html'), []);
  assert.ok(avail(shelf('Chapters 1 to 4 have been published.'), 'index.html').length === 1);
  assert.deepEqual(avail(shelf('Five of the book’s 32 chapters are ready.'), 'index.html'), []);
  assert.deepEqual(avail(shelf('Eight figures; two more are planned.'), 'index.html'), []);
  assert.deepEqual(avail(shelf('What is in chapter 3? The cell is complete.'), 'index.html'), []);
});

test('a line with no link that is not a .soon line fails, and a number span holding something else says what it holds', () => {
  const lines = allLines();
  lines[9] = '<li><span class="n">10</span><span class="title">T10</span><span class="tag">In preparation</span></li>';
  lines[10] = lines[10].replace('<span class="n">11</span>', '<span class="n">11.</span>');
  const f = avail(contents(lines));
  assert.ok(f.some((x) => x.includes('chapter 10 (T10) has no directory in biology/, and its line is neither a link nor a .soon line')), f.join('\n'));
  assert.ok(f.some((x) => x.includes('its <span class="n"> holds "11.", which is not a chapter number')), f.join('\n'));
});

test('a card for a book with nothing on disk can claim no chapter, whether it links or not', () => {
  const card = (open, close, text) => `<!doctype html><html lang="en"><body><main class="library"><h1>Textbooks</h1><div class="shelf">${open}<h2>Matter and change</h2><p>${text}</p>${close}</div></main></body></html>`;
  let f = avail(card('<a class="book" href="chemistry/">', '</a>', 'Chapter 1 is ready.'), 'index.html');
  assert.ok(f.length === 1 && f[0].includes('the shelf card for chemistry says chapter 1 is ready') && f[0].includes('chemistry/ has no chapter directory on disk'), f.join('\n'));
  f = avail(card('<div class="book book--soon">', '</div>', 'Chapter 1 is ready.'), 'index.html');
  assert.ok(f.length === 1 && f[0].includes('with no link to a book directory') && f[0].includes('"Chapter 1 is ready"'), f.join('\n'));
  assert.deepEqual(avail(card('<div class="book book--soon">', '</div>', 'In preparation.'), 'index.html'), []);
});

test('README.md skips code and comments, and a paragraph it cannot place names the titles it could have used', () => {
  const md = (text) => checkChapterAvailability({ file: 'README.md', markdown: text, books: BOOKS, contentsOf });
  assert.deepEqual(md('The Living World.\n\n~~~\nchapter 1 is ready\n~~~\n\n<!-- chapter 1 is ready -->\n\n    chapter 1 is ready\n'), []);
  const f = md('Intro.\n\nChapter 1 is ready.\n');
  assert.ok(f.length === 1 && f[0].startsWith('README.md:3:') && f[0].includes('"The Living World" (biology)'), f.join('\n'));
});

test('a run says how many statements and contents lines it compared, so a run that compared none says so', () => {
  assert.equal(avail(shelf('Chapters 1 to 5 are ready; twenty-seven more are outlined.'), 'index.html').compared.claims, 2);
  assert.equal(avail(shelf('An introduction to biology.'), 'index.html').compared.claims, 0);
  assert.equal(avail(CONTENTS).compared.lines, 32);
});
