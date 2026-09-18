// npm run flow: drive the chapter's reader-facing controls through real input and assert what they
// produce, with a screenshot after each step in out/flow/.
//
// Claim: real clicks, key presses and a drag drive the shipped components to the states asserted, and
// no console or page error is left behind. On the biology chapter: (1) clicking a wrong option in the
// first check marks it wrong, reveals the correct one and the explanation, and disables the options;
// (2) pressing Enter on a keyboard-focused option in the second check answers it; (3) placing a sort
// card by its button moves it into that bin with a verdict and a reason, and dragging a card onto a
// bin does the same; (4) a glossary term opens its definition on click and closes on Escape; (5) the
// header toggle switches the theme and the figures are told; (6) at phone width the menu button opens
// the contents drawer and a link in it closes it.
//
// The second book is driven too, and every one of its steps is structural. Every `tongjian` chapter on
// disk is loaded and its first `<tb-check>` is answered by a wrong option and, on a fresh load, by
// Enter on the option carrying `data-correct="1"`; its first `<tb-sort>` gets one card placed by the
// bin button the component's own `items` table says is that card's, and another — the first still in the
// tray, which holds only unplaced cards, so a card the button step placed is never the one dragged —
// dragged onto a bin it is not, with both ends of the drag inside the window before the button goes
// down; the first `<tb-term>` opens a popover and Escape closes it; the header toggle flips the
// theme and darkens the paper; and at 390 px the drawer opens and one of its own links closes it. No
// step here reads either book's sentences — this file cannot read Chinese, and a gate keyed on the
// words of the biology page would pass the second book by finding nothing. A page that does not carry
// the subject fails the `subject-present` step naming the selector and the page, and the chapter list
// is discovered from the tree, so a chapter is driven the moment its `index.html` exists.
//
// The second book's provenance is audited on the RENDERED page too. `test/provenance.test.js` proves the
// mark in the markup and says in its own header that it reads the file rather than the page; an
// independent typographic review then measured the rendered page and found the two disagreeing in three
// places the markup check cannot see — five marked runs in chapter 3's `<tb-check>` options printed at
// the body's own size and ink, a run in a `data-note="textual"` 註 repainted out of the note's own colour,
// and a run in `--ink-soft` container prose with no ink step at all. `mark-audit` walks every
// `[lang="zh-Hant"]` run in the reading column and requires each either to be matched by a rule read out
// of `tongjian/zj.css` and to differ from the element it sits in, or to sit in a region that rule
// excludes. It lives here rather than in `npm run shot`, where a rendered-DOM check naturally belongs,
// because `tools/shot.js` is held by another session's uncommitted round and editing it would entangle
// two people's work in one file — and `flow` already loads every `tongjian` chapter through the real page.
//
// Bound: `biology/ch01-what-is-life` exactly as it always was, plus every `tongjian` chapter found on
// disk, at 1440 and 390 px, light theme first and dark only through the toggle on the desktop load. It
// exercises the input path the reader uses (mouse, keyboard, drag) rather than calling the components'
// methods. What it therefore does not cover: only the FIRST check and the FIRST sort of each page are
// driven, so four of chapter 2's five checks and four of chapter 3's are never answered; the sort's
// drag is not exercised at phone width; only the first glossary term is opened, where `npm run devices`
// opens every one; the second book's theme step asserts that the paper darkens, not the biology step's
// fixed dark hex, so a wrong dark colour passes there; and a component whose structure is right and
// whose words are wrong passes on both books. The figures' own controls are `npm run drive`'s.
//
// `mark-audit`'s own bound: one viewport and one theme, 1440 px in the light theme, on the opening state
// of a fresh load, so a mark that is applied only after an interaction is not seen; it compares a run
// against its own `parentElement`, so a run wrapped in an unmarked `<span>` is measured against that span
// rather than against the sentence a reader sees it in; it proves a mark differs from its container, not
// that the difference is large enough to notice; and text drawn into a canvas has no element to measure.
// It also cannot see the one defect it was written after that is a statement about which colour a
// container should keep: a mark that REPAINTS a deliberately coloured container is still a difference.
//
// It reads the rules out of the sheet that carries them rather than restating them here, and the pages it
// visits carry them in two different places: a chapter page's mark rule is in `tongjian/zj.css`, and the
// book's contents page — which links no chapter stylesheet — sets its own in the page's `<style>` block,
// so that is the sheet the audit is handed there. Either way a sheet holding no such rule fails naming the
// sheet rather than auditing nothing, and the contents page is visited because it is the page that
// explains the mark: until this step existed, a later edit dropping its one rule left every gate green.
//
// `phone-figure-citation` is the other rendered-page check, and it is the phone's answer to a different
// defect: at 390 px the second book's figure 2.1 drew 通鑑's sentence with no attribution under it at all
// — the stacked composition set the citation `display: none`, measured before the fix as a 0x0 box, with
// the 12 px type it would have had — so a phone printed the source's words with nothing saying whose they
// were, on the page whose whole subject is where those words come from. The step brings every figure on
// the phone page into view and requires the citation a quotation-bearing figure draws to be there:
// present, not hidden, a non-zero box, and at least `CITATION_MIN_PX` tall in type. Its bounds: it visits
// the second book's 390 px load only, so the desktop and tablet compositions of the same figures are
// `npm run shot`'s and not this step's; it reads `describe().quoted` to decide whether a figure is showing
// 通鑑's own words, so a figure that prints them without publishing that field is never asked for a
// citation — the run-level census in `figure-citation-covered` is what stops a green run that compared
// nothing, by failing a declared kind no page exercised; it presses no control, so a row the reader has to
// select is not measured (the figure opens on 前403年, whose row carries a citation); it proves a box is
// drawn and its type is at least the floor, not that the citation is legible against what is under it,
// which is `npm run legible`'s question where it is asked at all.
//
// And it knows one figure kind, which is a measured gap rather than a choice: the same defect is still in
// the book's other two figures — `zj-split`'s `.zjs-source` is `display: none` at `data-tier="narrow"` and
// `zj-words`'s `.zjw-caption` at `data-tier="narrow"` too, both the citation of a quotation the figure
// still draws — and neither file is this round's, so neither is asserted here. They are also invisible to
// this step for a second reason: a figure is asked for a citation only when its own `describe()` says it
// is showing 通鑑's words, and only `zj-timeline` publishes that field.
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, BOOKS } from './lib/browser.js';

// The second book's chapters are DISCOVERED, never listed, for the reason `tools/lib/browser.js` gives
// for the page list itself: a chapter a person has to add here by hand is a chapter that can be written
// and never once driven. A discovery that quietly finds nothing is worse than the hand-list it replaced,
// because this gate would then stay green over a shrinking site — so finding no chapter is a failure and
// not an empty run.
const SECOND_BOOK = 'tongjian';
const second = BOOKS.find((b) => b.id === SECOND_BOOK);
if (!second?.chapters.length) {
  console.error(`FAIL: tools/lib/browser.js discovered no ${SECOND_BOOK} chapter, so the second book's controls would go undriven; the page list is read off the tree and an empty one is a failure, not a run that passes`);
  process.exit(1);
}

const OUT = 'out/flow';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const failures = [];
let step = 0;
// Which pages this run actually drove, so the summary distinguishes a two-book run from a one-book one.
const driven = [];
// Which of the declared citation-bearing figure kinds the phone loads reached with a quotation on screen,
// counted per load. `figure-citation-covered` fails a kind this map never saw, because a check whose
// subject is gone from every page would otherwise pass by comparing nothing.
const citationExercised = new Map();

// `where` is the page the step ran on. It goes in the printed line, in a failure summary and in the
// screenshot's own name, so a run of several pages can be read frame by frame; it is the last argument
// on purpose, because a step's name is what a reader greps for in this file.
async function check(page, name, fn, where = '') {
  step += 1;
  const slug = where ? `${where.replace(/[^a-z0-9]+/gi, '-')}-` : '';
  const file = `${OUT}/${String(step).padStart(2, '0')}-${slug}${name}.png`;
  const here = where ? ` [${where}]` : '';
  let snapped = false;
  // A step that wants its screenshot mid-way (before it closes what it opened) calls snap().
  const snap = async () => {
    await page.screenshot({ path: file, type: 'png' });
    snapped = true;
  };
  try {
    await fn(snap);
    if (!snapped) await page.screenshot({ path: file, type: 'png' });
    console.log(`ok   ${name}${here} -> ${file}`);
  } catch (err) {
    await page.screenshot({ path: file, type: 'png' }).catch(() => {});
    failures.push(`${name}${here}: ${err.message}`);
    console.log(`FAIL ${name}${here}: ${err.message}`);
  }
}

const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// What the steps below need, as `[root, inside, least]`: the steps drive the FIRST `<tb-check>`, the
// FIRST `<tb-sort>` and the FIRST `<tb-term>` of the page, so the subject that has to be there is the one
// inside those and not a count across the page. Chapter 3 carries five checks, and renaming the options
// list of its first one left a page-wide count of eight options standing while the step that drives that
// check waited out its whole 180 s timeout on a locator that could never match (measured while proving
// this step red). An `inside` of '' counts the root itself.
const DESKTOP_SUBJECT = [
  ['tb-check', '.tb-check__options .tb-check__opt', 2],
  ['tb-check', '.tb-check__opt[data-correct="1"]', 1],
  ['tb-check', '.explain', 1],
  ['tb-sort', '.tb-sort__tray .tb-sort__item', 1],
  ['tb-sort', '.tb-sort__bins .tb-sort__bin', 2],
  ['tb-term', 'button', 1],
  ['.tb-themetoggle', '', 1],
];
const PHONE_SUBJECT = [
  ['.tb-navtoggle', '', 1],
  ['.tb-rail', '', 1],
  ['.tb-rail', 'a[href^="#"]', 1],
];

/** The first `root >> inside` the page does not carry, or '' when it carries all of them. */
async function missingSubject(page, required) {
  for (const [root, inside, least] of required) {
    const scope = page.locator(root).first();
    const found = inside ? await scope.locator(inside).count() : await scope.count();
    if (found < least) return inside ? `${root} >> ${inside}` : root;
  }
  return '';
}

/**
 * The mark's own rules, READ OUT OF the stylesheet that carries them rather than restated here: every
 * top-level rule whose selector sets a `[lang="zh-Hant"]` run, the scope they share, and the regions the
 * first of them excludes. A rule that gains an exclusion, changes a channel or moves its scope moves this
 * audit with it, where a copy of the selector here would stay green over the change. A stylesheet with no
 * such rule fails with a named reason rather than auditing nothing.
 *
 * `css` is the sheet's text and `where` names it in every failure, because the two audited pages carry
 * their rules in different places: a chapter page loads `tongjian/zj.css`, and the contents page links no
 * chapter stylesheet and sets its rule in its own `<style>` block.
 */
function markRules(css, where) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // The outermost rules only: a rule body holds no brace, so `[^{}]+` before one cannot span a
  // declaration, and an at-rule's body (which does hold braces) is skipped rather than misread.
  const rules = [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[1].includes('[lang="zh-Hant"]'))
    .map((m) => ({ selector: m[1].trim().replace(/\s+/g, ' ') }));
  expect(rules.length, `${where} holds no rule with [lang="zh-Hant"] in its selector, so the rendered-mark audit has no rule to read`);
  // The scope is the ancestor chain at the front of the selector, cut where the rule stops describing
  // containers and starts describing the run: at `[lang=`, or at the first `:is(`/`:where(`/`:not(` for a
  // selector that names the containers first. Both shapes are in this stylesheet's history — the
  // whitelist that was the defect read `.zj .tb-text :is(p, li, …) [lang="zh-Hant"]` — and cutting at
  // `[lang=` alone read that one as a selector list and refused to run at all, which is a gate reporting
  // its own parser rather than the page. A scope that is genuinely a list of different ancestors is still
  // refused rather than silently queried as one of them.
  const cut = rules[0].selector.search(/\[lang=|:is\(|:where\(|:not\(/);
  expect(cut > 0, `the first [lang="zh-Hant"] rule's selector "${rules[0].selector}" has no attribute or :is()/:not() to cut its scope at, so the audit cannot query the runs it styles`);
  const scope = rules[0].selector.slice(0, cut);
  expect(/\s$/.test(scope), `the first [lang="zh-Hant"] rule's scope is "${scope.trim()}", which is not an ancestor selector followed by a space, so the audit cannot query the runs it styles`);
  expect(!scope.includes(','), `the first [lang="zh-Hant"] rule's scope is "${scope.trim()}", a selector list, which the audit cannot read the runs out of`);
  // `:not(R)` and `:not(R *)` name the same region; both are kept out of the run list by the rule, so both
  // are regions the audit excuses a run for sitting in.
  const regions = [...new Set([...rules[0].selector.matchAll(/:not\(([^)]*)\)/g)].map((m) => m[1].replace(/\s*\*\s*$/, '').trim()))];
  return { selectors: rules.map((r) => r.selector), scope, regions };
}

/**
 * Every `<style>` block a page carries in its own markup, concatenated: the sheet such a page owns. The
 * contents page links the shared sheets but no chapter stylesheet, so this is where its mark rule lives,
 * and reading it here rather than copying the selector keeps the audit keyed on what the page says.
 */
function inlineStyles(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
}

/**
 * The in-page half of the rendered-mark audit. A run is one `[lang="zh-Hant"]` element in the reading
 * column. It passes when a rule of the stylesheet matches it AND it differs from the element it sits in,
 * or when it sits in a region the stylesheet's own rule excludes. It fails when no rule matches it and it
 * is in no excluded region, when it matches and is identical to its container, and when it matches and
 * differs in size alone — a size step inside a container that is already a size down is the third defect
 * the review measured, and a reader sees no ink step in it.
 *
 * The container is `parentElement`: the mark is a step against the words around it, and the nearest
 * element is the closest thing to "around it" that can be measured without knowing this book's markup.
 */
function auditMarks({ scope, selectors, regions }) {
  const runs = Array.from(document.querySelectorAll(`${scope}[lang="zh-Hant"]`));
  const channels = ['fontSize', 'color', 'fontWeight'];
  const per = selectors.map(() => 0);
  const bad = [];
  let excluded = 0;
  for (const el of runs) {
    const container = el.parentElement;
    const matched = selectors.map((s, i) => (el.matches(s) ? i : -1)).filter((i) => i >= 0);
    for (const i of matched) per[i] += 1;
    const region = regions.find((r) => el.closest(r)) || '';
    const run = getComputedStyle(el);
    const within = container ? getComputedStyle(container) : null;
    const seen = {
      text: (el.textContent || '').slice(0, 30),
      // Three ancestors, because "in <span>" is not enough to find it: the run the review measured sits in
      // a bare `<span>` inside `button.tb-check__opt` inside `div.tb-check__options`, and only the chain
      // says which of the page's many runs this is.
      container: (() => {
        const chain = [];
        for (let n = container; n && chain.length < 3; n = n.parentElement) {
          chain.push(`${n.tagName.toLowerCase()}${n.className ? `.${String(n.className).trim().replace(/\s+/g, '.')}` : ''}`);
        }
        return chain.length ? chain.join(' < ') : '(none)';
      })(),
      run: `${run.fontSize} / ${run.color} / weight ${run.fontWeight}`,
      within: within ? `${within.fontSize} / ${within.color} / weight ${within.fontWeight}` : '(none)',
    };
    if (!matched.length) {
      if (region) { excluded += 1; continue; }
      bad.push({ ...seen, why: `no rule of the stylesheet matches it and it is in no region the mark excludes (looked for ${regions.join(', ')})` });
      continue;
    }
    if (!within) { bad.push({ ...seen, why: 'it has no container element to be a step against' }); continue; }
    const differs = channels.some((c) => run[c] !== within[c]);
    const ink = ['color', 'fontWeight'].some((c) => run[c] !== within[c]);
    if (!differs) bad.push({ ...seen, why: `it matches rule ${matched.join(',')} and yet is identical to its container in size, colour and weight` });
    else if (!ink) bad.push({ ...seen, why: `it matches rule ${matched.join(',')} and differs from its container in size alone, so no ink step reaches the reader` });
  }
  return { n: runs.length, per, excluded, bad };
}

// The attribution each quotation-bearing figure of the second book hangs on its quotation, by kind. A
// figure says in its own `describe()` whether it is showing 通鑑's own words (`quoted`); this table says
// which element carries the citation of that kind. It is a hand-list on purpose — the citation's class is
// a private name inside the figure and cannot be derived from anything outside it — so a kind the table
// does not name that reports a quotation FAILS rather than being skipped, and a declared kind that no
// page exercises fails the census step at the end of the run.
const FIGURE_CITATIONS = { 'zj-timeline': '.zjt-quote-at' };

// The type floor for a citation this check accepts as drawn. AGENTS.md's figure invariant is about nine
// device pixels, and `flow` loads at deviceScaleFactor 1, so 10 CSS px is that floor rounded up: a
// citation rendered at 6 px is hidden with extra steps, which is the shape this step exists to refuse.
const CITATION_MIN_PX = 10;

/**
 * The in-page half of the phone citation check. For every `<tb-figure>` on the page: a figure whose
 * `describe()` reports it is showing 通鑑's own words must have the citation its kind declares PRESENT and
 * DRAWN — not `hidden`, not `display:none` or `visibility:hidden`, a non-zero box, and type at least
 * `minPx` tall. A quoting figure whose kind the table does not name is a failure, not a skip, so the
 * table cannot quietly shrink.
 *
 * One object rather than two parameters, for the reason `auditMarks` above takes one: a Playwright
 * `evaluate` passes exactly one argument, so a two-parameter signature reads `table` as the whole argument
 * and every lookup in it comes back undefined — which is a check reporting "no citation is declared for
 * this kind" on a kind that is declared.
 */
function auditFigureCitations({ table, minPx }) {
  const figures = [];
  const bad = [];
  let quoting = 0;
  for (const el of Array.from(document.querySelectorAll('tb-figure'))) {
    const kind = el.getAttribute('kind') || '';
    const state = el.dataset.state || '';
    const described = typeof el.describe === 'function' ? el.describe() : null;
    const shows = Boolean(described && described.quoted);
    figures.push({ id: el.id, kind, state, quoting: shows });
    if (!shows) continue;
    quoting += 1;
    const selector = table[kind];
    if (!selector) {
      bad.push({ id: el.id, kind, why: `it reports it is showing 通鑑's own words and this check declares no citation element for kind "${kind}", so nothing measured the attribution` });
      continue;
    }
    const cite = el.querySelector(selector);
    if (!cite) {
      bad.push({ id: el.id, kind, why: `the figure carries no "${selector}" element at all, so the quotation it draws has no attribution to draw` });
      continue;
    }
    const cs = getComputedStyle(cite);
    const box = cite.getBoundingClientRect();
    if (cite.hidden || cs.display === 'none' || cs.visibility === 'hidden' || box.width <= 0 || box.height <= 0) {
      bad.push({ id: el.id, kind, why: `its "${selector}" citation is in the markup but not drawn: display ${cs.display}, visibility ${cs.visibility}, box ${box.width.toFixed(1)}x${box.height.toFixed(1)} at ${cs.fontSize}` });
      continue;
    }
    if (!(Number.parseFloat(cs.fontSize) >= minPx)) {
      bad.push({ id: el.id, kind, why: `its "${selector}" citation is drawn at ${cs.fontSize}, under the ${minPx}px floor this check sets, so it is present without being readable` });
    }
  }
  return { figures, quoting, bad };
}

/**
 * Bring every figure on the page into view and wait for its frame to settle, so a phone step can measure
 * what a figure draws. The frame mounts on an IntersectionObserver with a 600 px margin, so a figure
 * below the fold is not merely unmeasured — it is not in the DOM yet. The wait polls the frame's own
 * `data-state` (ready or error) and never the clock; a figure that never settles is a failure the caller's
 * `check` records, with the step's own name on it.
 */
async function mountFigures(page) {
  const figures = page.locator('tb-figure');
  const n = await figures.count();
  for (let i = 0; i < n; i += 1) {
    const one = figures.nth(i);
    const handle = await one.elementHandle();
    if (!handle) continue;
    await one.scrollIntoViewIfNeeded();
    await page.waitForFunction((el) => el.dataset.state === 'ready' || el.dataset.state === 'error', handle, { timeout: 30_000 });
  }
  return n;
}

/**
 * The sort's own verdict, read from the component instead of from a sentence: `describe()` is what
 * `tb-sort` publishes for a gate to read, and `tools/drive.js` asserts against a figure's the same way.
 * A component that publishes none fails here rather than being compared against nothing.
 */
async function describeSort(sort, chapter) {
  const d = await sort.evaluate((el) => (typeof el.describe === 'function' ? el.describe() : null));
  expect(d, `${chapter.path}: the <tb-sort> publishes no describe(), so this step cannot read the verdict it produced`);
  return d;
}

/**
 * Wait for the contents drawer to REACH the state the step asked for, never for a wall-clock interval.
 * The drawer slides over 400 ms, and a loaded machine can leave it three pixels short of closed at
 * 500 ms (seen 2026-09-10), which is why this polls its box against a deadline.
 *
 * The biology phone step below keeps its own inline copy of this poll, deliberately: the second book's
 * coverage is added beside the biology path rather than by rewriting it, so the steps whose red proofs
 * are already recorded stay the ones those proofs were taken on.
 */
async function pollDrawer(page, rail, done, what) {
  const deadline = Date.now() + 4000;
  let box = await rail.boundingBox();
  while (!done(box) && Date.now() < deadline) {
    await page.waitForTimeout(100);
    box = await rail.boundingBox();
  }
  expect(done(box), `${what} (x ${box.x}, width ${box.width}, after 4 s)`);
  return box;
}

// The label every biology step is reported against. The step names are unchanged, so a line still opens
// `FAIL check-wrong-answer`, which is the text `docs/learning/gate-proofs.md` records for this file; what
// is new is the ` [biology/ch01-what-is-life]` tag after it, which is what lets a reader of a two-book run
// say which page each line and each frame in out/flow/ came from.
const BIOLOGY_LABEL = 'biology/ch01-what-is-life';

try {
  // Desktop flows. The figures are mounted lazily here, as a reader would have them.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const errors = collectErrors(page);
  await openPage(page, `${server.url}/biology/ch01-what-is-life/?theme=light`);
  driven.push(BIOLOGY_LABEL);

  await check(page, 'check-wrong-answer', async () => {
    const q = page.locator('#q1');
    await q.scrollIntoViewIfNeeded();
    await q.locator('.tb-check__opt').nth(0).click();
    expect(await q.getAttribute('data-answered') === 'wrong', 'the check did not record a wrong answer');
    expect(await q.locator('.tb-check__opt.is-wrong').count() === 1, 'the chosen option is not marked wrong');
    expect(await q.locator('.tb-check__opt.is-correct').count() === 1, 'the correct option is not revealed');
    expect(await q.locator('.explain').isVisible(), 'the explanation is not shown');
    expect((await q.locator('.tb-check__verdict').textContent()).includes('Not quite'), 'the verdict text is missing');
    expect(await q.locator('.tb-check__opt').nth(2).isDisabled(), 'options were not disabled after answering');
  }, BIOLOGY_LABEL);

  await check(page, 'check-keyboard-answer', async () => {
    const q = page.locator('#q2');
    await q.scrollIntoViewIfNeeded();
    await q.locator('.tb-check__opt').nth(1).focus();
    await page.keyboard.press('Enter');
    expect(await q.getAttribute('data-answered') === 'right', `Enter on the correct option gave data-answered="${await q.getAttribute('data-answered')}"`);
    expect((await q.locator('.tb-check__verdict').textContent()).includes('Right'), 'the verdict text is missing');
  }, BIOLOGY_LABEL);

  await check(page, 'sort-by-button', async () => {
    const sort = page.locator('#alive');
    await sort.scrollIntoViewIfNeeded();
    const card = sort.locator('.tb-sort__tray .tb-sort__item').first();
    const name = await card.locator('.name').textContent();
    await card.getByRole('button', { name: 'Alive', exact: true }).click();
    const placed = sort.locator('.tb-sort__bin[data-bin="alive"] .tb-sort__item');
    expect(await placed.count() === 1, 'the card did not land in the Alive bin');
    expect((await placed.locator('.name').textContent()) === name, 'a different card landed in the bin');
    expect(await placed.locator('.why').count() === 1, 'the reason is not shown');
    expect((await sort.locator('.tb-sort__status').textContent()).includes('1 of 9 sorted'), 'the status line did not update');
  }, BIOLOGY_LABEL);

  await check(page, 'sort-by-drag', async () => {
    const sort = page.locator('#alive');
    const card = sort.locator('.tb-sort__tray .tb-sort__item').first();
    const bin = sort.locator('.tb-sort__bin[data-bin="not"]');
    await card.dragTo(bin);
    expect(await bin.locator('.tb-sort__item').count() === 1, 'the dragged card did not land in the Not alive bin');
    expect((await sort.locator('.tb-sort__status').textContent()).includes('2 of 9 sorted'), 'the status line did not count the drag');
  }, BIOLOGY_LABEL);

  await check(page, 'term-popover', async (snap) => {
    const term = page.locator('tb-term[ref="homeostasis"]').first();
    await term.scrollIntoViewIfNeeded();
    await term.locator('button').click();
    const pop = term.locator('.tb-term__pop');
    expect(await pop.count() === 1, 'no popover opened');
    expect((await pop.textContent()).includes('Homeostasis'), 'the popover does not name the term');
    expect(await term.locator('button').getAttribute('aria-expanded') === 'true', 'aria-expanded is not true');
    await snap();
    await page.keyboard.press('Escape');
    expect(await term.locator('.tb-term__pop').count() === 0, 'Escape did not close the popover');
  }, BIOLOGY_LABEL);

  await check(page, 'theme-toggle', async () => {
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    const told = await page.evaluate(() => new Promise((done) => {
      document.addEventListener('tb-theme-change', (e) => done(e.detail.theme), { once: true });
      document.querySelector('.tb-themetoggle').click();
    }));
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(before === 'light' && after === 'dark', `theme went ${before} -> ${after}`);
    expect(told === 'dark', `figures were told "${told}"`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg === 'rgb(21, 23, 26)', `body background is ${bg}, not the dark paper`);
  }, BIOLOGY_LABEL);
  for (const e of errors) failures.push(`desktop page error: ${e}`);
  await page.close();

  // Phone: the contents drawer.
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  phone.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const phoneErrors = collectErrors(phone);
  await openPage(phone, `${server.url}/biology/ch01-what-is-life/?theme=light`);
  await check(phone, 'phone-drawer', async () => {
    const rail = phone.locator('.tb-rail');
    const box0 = await rail.boundingBox();
    expect(box0.x + box0.width <= 0, `the drawer is not off screen before opening (x ${box0.x}, width ${box0.width})`);
    // The drawer slides over 400 ms; poll its box until it settles rather than sleeping a fixed time,
    // because a loaded machine can leave it 3 px short of closed at 500 ms (seen 2026-09-10).
    const settle = async (done, what) => {
      const deadline = Date.now() + 4000;
      let box = await rail.boundingBox();
      while (!done(box) && Date.now() < deadline) {
        await phone.waitForTimeout(100);
        box = await rail.boundingBox();
      }
      expect(done(box), `${what} (x ${box.x}, width ${box.width}, after 4 s)`);
      return box;
    };
    await phone.locator('.tb-navtoggle').click();
    await settle((b) => Math.abs(b.x) < 0.5, 'the drawer did not open');
    expect(await phone.locator('.tb-navtoggle').getAttribute('aria-expanded') === 'true', 'aria-expanded is not true');
    await rail.locator('a[href="#cell"]').click();
    await settle((b) => b.x + b.width <= 0.5, 'the drawer did not close after following a link');
    const hash = await phone.evaluate(() => location.hash);
    expect(hash === '#cell', `the link did not navigate (hash ${hash})`);
  }, BIOLOGY_LABEL);
  for (const e of phoneErrors) failures.push(`phone page error: ${e}`);
  await phone.close();

  // The second book. Every step below is structural on purpose: the biology steps above key on English
  // words ("Not quite", "Alive", "1 of 9 sorted") and this file cannot read Chinese, so a translated
  // page would satisfy them by finding nothing. These read the components' own attributes, classes and
  // `describe()` and assert nothing about the prose of either book.
  console.log(`flow: driving ${driven.join(', ')} and ${second.chapters.map((c) => c.id).join(', ')}, each at 1440 and 390 px, light theme first`);
  for (const chapter of second.chapters) {
    const where = chapter.id;
    const url = `${server.url}${chapter.path}?theme=light`;
    driven.push(where);

    const chapterPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    chapterPage.setDefaultTimeout(ACTION_TIMEOUT_MS);
    const chapterErrors = collectErrors(chapterPage);
    await openPage(chapterPage, url);

    const missing = await missingSubject(chapterPage, DESKTOP_SUBJECT);
    await check(chapterPage, 'subject-present', async () => {
      expect(!missing, `${chapter.path} is missing "${missing}", and a chapter page of this book must carry it — a page that lacks the subject fails here, naming the selector and the page, rather than passing as a page with nothing to do`);
    }, where);
    if (missing) console.log(`skip ${where}: the steps below did not run, because this page is missing "${missing}"`);

    // The rendered mark, read off the page as the reader receives it: fresh load, light theme, nothing yet
    // answered or placed. It is the one step here that is not about a control — it asks whether the page
    // SHOWS whose words a run is, which is what the whole provenance change rests on.
    if (!missing) await check(chapterPage, 'mark-audit', async () => {
      const spec = markRules(readFileSync('tongjian/zj.css', 'utf8'), 'tongjian/zj.css');
      const verdict = await chapterPage.evaluate(auditMarks, spec);
      expect(verdict.n > 0, `${chapter.path}: the reading column ("${spec.scope.trim()}") carries no [lang="zh-Hant"] run at all, so this audit compared nothing`);
      console.log(`     mark-audit [${where}]: ${verdict.n} run(s); per rule, in stylesheet order ${verdict.per.join('/')}; ${verdict.excluded} in a region the first rule excludes; ${verdict.bad.length} not visibly marked`);
      const first = verdict.bad[0];
      expect(!verdict.bad.length, verdict.bad.length
        ? `${chapter.path}: ${verdict.bad.length} of ${verdict.n} marked run(s) is not visibly marked; first: the run "${first.text}" in <${first.container}> — ${first.why}; run ${first.run}, container ${first.within}`
        : '');
    }, where);

    if (!missing) await check(chapterPage, 'check-answer-wrong', async () => {
      const q = chapterPage.locator('tb-check').first();
      await q.scrollIntoViewIfNeeded();
      const wrong = q.locator('.tb-check__opt:not([data-correct="1"])').first();
      // What was clicked is compared against what is marked, and neither is compared against a word: the
      // page's sentences are its own, the class the reader sees is not.
      const chosen = (await wrong.textContent()).trim();
      await wrong.click();
      expect(await q.getAttribute('data-answered') === 'wrong', `${chapter.path}: clicking a wrong option left data-answered="${await q.getAttribute('data-answered')}"`);
      expect(await q.locator('.tb-check__opt.is-wrong').count() === 1, `${chapter.path}: the chosen option is not marked ".tb-check__opt.is-wrong"`);
      expect(await q.locator('.tb-check__opt.is-correct').count() === 1, `${chapter.path}: the correct option is not revealed with ".tb-check__opt.is-correct"`);
      expect(await q.locator('.explain').isVisible(), `${chapter.path}: the ".explain" explanation is not shown`);
      const verdict = q.locator('.tb-check__verdict');
      expect(await verdict.count() === 1, `${chapter.path}: no ".tb-check__verdict" told the reader the answer was wrong`);
      expect((await verdict.textContent()).trim().length > 0, `${chapter.path}: the ".tb-check__verdict" is empty`);
      expect((await q.locator('.tb-check__opt.is-wrong').textContent()).trim() === chosen, `${chapter.path}: the option marked wrong is not the one that was clicked`);
      const allDisabled = await q.evaluate((el) => Array.from(el.querySelectorAll('.tb-check__opt')).every((b) => b.disabled));
      expect(allDisabled, `${chapter.path}: options were not disabled after answering`);
    }, where);

    // A fresh load before the keyboard step, because the step above answered this page's first check and
    // chapter 1 has only one: the keyboard path needs a check nobody has answered yet, and a reload is
    // the reader's own way back to one.
    if (!missing) await openPage(chapterPage, url);

    if (!missing) await check(chapterPage, 'check-answer-keyboard', async () => {
      const q = chapterPage.locator('tb-check').first();
      await q.scrollIntoViewIfNeeded();
      await q.locator('.tb-check__opt[data-correct="1"]').first().focus();
      await chapterPage.keyboard.press('Enter');
      expect(await q.getAttribute('data-answered') === 'right', `${chapter.path}: Enter on the option carrying data-correct="1" gave data-answered="${await q.getAttribute('data-answered')}"`);
      expect(await q.locator('.tb-check__verdict').count() === 1, `${chapter.path}: the keyboard answer produced no ".tb-check__verdict"`);
      expect(await q.locator('.explain').isVisible(), `${chapter.path}: the keyboard answer did not reveal the ".explain" explanation`);
    }, where);

    if (!missing) await check(chapterPage, 'sort-place-by-button', async () => {
      const sort = chapterPage.locator('tb-sort').first();
      await sort.scrollIntoViewIfNeeded();
      const card = sort.locator('.tb-sort__tray .tb-sort__item').first();
      const cardId = await card.getAttribute('data-id');
      const bins = sort.locator('.tb-sort__bins .tb-sort__bin');
      const binIds = await bins.evaluateAll((els) => els.map((el) => el.dataset.bin));
      // Which bin this card belongs in is no longer in the DOM: the component consumed the authored
      // `data-bin` when it built the tray and holds it in its own items table. Reading it back is what
      // lets this step press the button that is RIGHT for this card, rather than pressing one and
      // asserting only that something moved.
      const target = await sort.evaluate((el, id) => el.items?.find((i) => i.id === id)?.bin ?? null, cardId);
      expect(target, `${chapter.path}: the <tb-sort> holds no bin for the card "${cardId}" in its own items table`);
      const index = binIds.indexOf(target);
      expect(index >= 0, `${chapter.path}: the card's own bin "${target}" is not one of the ".tb-sort__bin" ids ${JSON.stringify(binIds)}`);
      const buttons = card.locator('.choose button');
      const n = await buttons.count();
      expect(n === binIds.length, `${chapter.path}: a ".tb-sort__item" carries ${n} bin button(s) for ${binIds.length} ".tb-sort__bin" bin(s)`);
      const name = (await card.locator('.name').textContent()).trim();
      await buttons.nth(index).click();
      // The card is found by its own `data-id` rather than by counting the bin's children: a bin may
      // already hold another card, and "one card is here" is not the claim — "THIS card is here" is.
      const inBin = bins.nth(index).locator(`.tb-sort__item[data-id="${cardId}"]`);
      expect(await inBin.count() === 1, `${chapter.path}: the card "${cardId}" did not land in the "${target}" bin its own button names`);
      expect((await inBin.locator('.name').textContent()).trim() === name, `${chapter.path}: the "${target}" bin holds "${cardId}" under a different name than the card that was placed`);
      expect(await bins.nth(index).locator('.tb-sort__item').count() === 1, `${chapter.path}: the "${target}" bin holds more than the one card that was placed in it`);
      expect(await inBin.locator('.verdict').count() === 1, `${chapter.path}: the placed card carries no ".verdict"`);
      expect((await inBin.locator('.verdict').textContent()).trim().length > 0, `${chapter.path}: the placement verdict is empty`);
      expect(await inBin.locator('.why').count() === 1, `${chapter.path}: the placed card carries no ".why" reason`);
      expect(await inBin.evaluate((el) => el.classList.contains('is-right')), `${chapter.path}: a card in the bin the component calls its own is not marked ".is-right"`);
      const d = await describeSort(sort, chapter);
      expect(d.placed === 1, `${chapter.path}: the <tb-sort> reports ${d.placed} card(s) placed after one placement`);
      expect(d.right === 1, `${chapter.path}: the <tb-sort> reports ${d.right} right after a card landed in its own bin`);
      expect((await sort.locator('.tb-sort__status').textContent()).trim().length > 0, `${chapter.path}: the ".tb-sort__status" line is empty`);
    }, where);

    if (!missing) await check(chapterPage, 'sort-place-by-drag', async () => {
      const sort = chapterPage.locator('tb-sort').first();
      const card = sort.locator('.tb-sort__tray .tb-sort__item').first();
      const cardId = await card.getAttribute('data-id');
      const binIds = await sort.locator('.tb-sort__bins .tb-sort__bin').evaluateAll((els) => els.map((el) => el.dataset.bin));
      const target = await sort.evaluate((el, id) => el.items?.find((i) => i.id === id)?.bin ?? null, cardId);
      expect(target, `${chapter.path}: the <tb-sort> holds no bin for the card "${cardId}" in its own items table`);
      // Onto a bin the component does NOT call this card's own, so the drag covers the wrong-answer path
      // as well as the drop — which is what the biology step's drag onto "Not alive" does.
      const wrongIndex = binIds.findIndex((b) => b !== target);
      expect(wrongIndex >= 0, `${chapter.path}: the <tb-sort> has no second ".tb-sort__bin" to drag a card onto`);
      const bin = sort.locator('.tb-sort__bins .tb-sort__bin').nth(wrongIndex);
      const before = await describeSort(sort, chapter);
      // Both ends of the drag are put inside the window BEFORE the button goes down. Playwright's
      // `dragTo` scrolls its drop target into view while the button is already held, and on a sort taller
      // than the window that scroll slides the list under the still cursor, so the browser starts the
      // drag on whichever card has just moved into place: measured on chapter 2, whose sort is 934 px in
      // a 900 px window, `dragTo` on the first tray card began a drag on the card BELOW it and left the
      // asked-for card in the tray (out/probe-drag-point.mjs: mousedown on the first card, dragstart on
      // the second). Scrolling the bin in first leaves `dragTo` nothing to scroll.
      await bin.scrollIntoViewIfNeeded();
      const viewport = chapterPage.viewportSize();
      const cardBox = await card.boundingBox();
      const binBox = await bin.boundingBox();
      // A pixel of tolerance: scrolling the bin in puts its edge at the window's edge by construction, so
      // 899.9 against 900 is sub-pixel rounding and says nothing about the page.
      const inWindow = (b) => b.y >= 0 && b.y + b.height <= viewport.height + 1;
      expect(inWindow(cardBox) && inWindow(binBox), `${chapter.path}: a drag needs both the card (y ${cardBox.y}..${cardBox.y + cardBox.height}) and the "${binIds[wrongIndex]}" bin (y ${binBox.y}..${binBox.y + binBox.height}) inside the ${viewport.height} px window before the button goes down, or the browser scrolls mid-drag and starts it on the wrong card`);
      await card.dragTo(bin);
      // Again by the card's own id: the bin this drag targets is often the one the step above filled, and
      // chapter 3's is, so counting the bin's children failed a drop that had worked (`out/probe-drag-ch03.mjs`:
      // the bin read `shengren:2`, describe() reported 2 placed, and the dragged card carried ".is-wrong").
      const inBin = bin.locator(`.tb-sort__item[data-id="${cardId}"]`);
      expect(await inBin.count() === 1, `${chapter.path}: the dragged card "${cardId}" is not in the "${binIds[wrongIndex]}" bin it was dropped on`);
      expect(await inBin.locator('.verdict').count() === 1, `${chapter.path}: the dragged card carries no ".verdict"`);
      expect((await inBin.locator('.verdict').textContent()).trim().length > 0, `${chapter.path}: the drag verdict is empty`);
      expect(await inBin.locator('.why').count() === 1, `${chapter.path}: the dragged card carries no ".why" reason`);
      expect(await inBin.evaluate((el) => el.classList.contains('is-wrong')), `${chapter.path}: a card dragged into a bin the component does not call its own is not marked ".is-wrong"`);
      const after = await describeSort(sort, chapter);
      expect(after.placed === before.placed + 1, `${chapter.path}: the <tb-sort> counted ${after.placed} placed after a drag from ${before.placed}`);
      expect(after.right === before.right, `${chapter.path}: a wrong drag moved the right count from ${before.right} to ${after.right}`);
    }, where);

    if (!missing) await check(chapterPage, 'term-popover', async (snap) => {
      const term = chapterPage.locator('tb-term').first();
      await term.scrollIntoViewIfNeeded();
      const button = term.locator('button');
      await button.click();
      const pop = term.locator('.tb-term__pop');
      expect(await pop.count() === 1, `${chapter.path}: clicking the first <tb-term>'s button opened no ".tb-term__pop"`);
      expect((await pop.textContent()).trim().length > 0, `${chapter.path}: the ".tb-term__pop" is empty`);
      expect(await pop.getAttribute('role') === 'tooltip', `${chapter.path}: the ".tb-term__pop" does not carry role="tooltip"`);
      expect(await button.getAttribute('aria-expanded') === 'true', `${chapter.path}: the term's aria-expanded is not "true" after the click`);
      // The popover is tied to the term that opened it by the button's own aria-describedby, not by
      // reading the card: this book's cards come from a lexicon the file cannot read.
      const described = await button.getAttribute('aria-describedby');
      expect(described && described === await pop.getAttribute('id'), `${chapter.path}: the term's button describes "${described}" but the open ".tb-term__pop" is "${await pop.getAttribute('id')}" — the card on screen is not the one this term opened`);
      await snap();
      await chapterPage.keyboard.press('Escape');
      expect(await term.locator('.tb-term__pop').count() === 0, `${chapter.path}: Escape did not close the ".tb-term__pop"`);
      expect(await button.getAttribute('aria-expanded') === 'false', `${chapter.path}: the term's aria-expanded is not "false" after Escape`);
    }, where);

    if (!missing) await check(chapterPage, 'theme-toggle', async () => {
      const read = () => chapterPage.evaluate(() => ({
        theme: document.documentElement.dataset.theme || '',
        paper: getComputedStyle(document.body).backgroundColor,
      }));
      const before = await read();
      const told = await chapterPage.evaluate(() => new Promise((done) => {
        document.addEventListener('tb-theme-change', (e) => done(e.detail.theme), { once: true });
        document.querySelector('.tb-themetoggle').click();
      }));
      const after = await read();
      expect(before.theme === 'light' && after.theme === 'dark', `${chapter.path}: the theme went ${before.theme} -> ${after.theme}`);
      expect(told === 'dark', `${chapter.path}: the figures were told "${told}"`);
      // What dark looks like is this book's own design decision, so this asserts that the paper DARKENS
      // rather than the biology step's fixed hex. Flipping the attribute and painting nothing fails.
      const luma = (rgb) => { const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) || []).map(Number); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      expect(after.paper !== before.paper, `${chapter.path}: the page background did not change with the theme (${before.paper})`);
      expect(luma(after.paper) < luma(before.paper), `${chapter.path}: the page background did not darken (${before.paper} -> ${after.paper})`);
    }, where);

    for (const e of chapterErrors) failures.push(`${where} desktop page error: ${e}`);
    await chapterPage.close();

    // Phone: the contents drawer, pressed with the input a phone has.
    const chapterPhone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    chapterPhone.setDefaultTimeout(ACTION_TIMEOUT_MS);
    const chapterPhoneErrors = collectErrors(chapterPhone);
    await openPage(chapterPhone, url);

    const phoneMissing = await missingSubject(chapterPhone, PHONE_SUBJECT);
    await check(chapterPhone, 'phone-subject-present', async () => {
      expect(!phoneMissing, `${chapter.path} at 390 px is missing "${phoneMissing}", and a chapter page of this book must carry it — a page that lacks the subject fails here, naming the selector and the page, rather than passing as a page with nothing to do`);
    }, where);
    if (phoneMissing) console.log(`skip ${where} (phone): the step below did not run, because this page is missing "${phoneMissing}"`);

    // The figure's quotation at phone width must carry its attribution where a reader can see it, not
    // merely in the markup. The figures mount on an IntersectionObserver, so they are brought into view
    // first; `describe().quoted` is the figure's own statement that it is showing 通鑑's own words, which
    // is what makes the citation required rather than optional.
    if (!phoneMissing) await check(chapterPhone, 'phone-figure-citation', async () => {
      const mounted = await mountFigures(chapterPhone);
      const verdict = await chapterPhone.evaluate(auditFigureCitations, { table: FIGURE_CITATIONS, minPx: CITATION_MIN_PX });
      const census = verdict.figures.map((f) => `${f.id}:${f.kind}:${f.state}${f.quoting ? ':quoted' : ''}`).join(', ') || '(none)';
      console.log(`     phone-figure-citation [${where}]: ${mounted} figure(s) mounted — ${census}; ${verdict.quoting} showing a quotation; ${verdict.bad.length} without a drawn citation`);
      for (const f of verdict.figures) {
        if (f.quoting && FIGURE_CITATIONS[f.kind]) citationExercised.set(f.kind, (citationExercised.get(f.kind) || 0) + 1);
      }
      const first = verdict.bad[0];
      expect(!verdict.bad.length, verdict.bad.length
        ? `${chapter.path} at 390 px: ${verdict.bad.length} figure(s) showing 通鑑's words do not draw the citation that says whose words they are; first: <${first.id}> (${first.kind}) — ${first.why}`
        : '');
    }, where);

    if (!phoneMissing) await check(chapterPhone, 'phone-drawer', async () => {
      const rail = chapterPhone.locator('.tb-rail');
      const box0 = await rail.boundingBox();
      expect(box0.x + box0.width <= 0, `${chapter.path}: the drawer is not off screen before opening (x ${box0.x}, width ${box0.width})`);
      // The link is the drawer's own first in-page link, not a hash this file knows: what a chapter calls
      // its sections is the chapter's business, and hardcoding one would be a step that finds nothing on
      // the next chapter.
      const link = rail.locator('a[href^="#"]').first();
      const hash = await link.getAttribute('href');
      await chapterPhone.locator('.tb-navtoggle').click();
      await pollDrawer(chapterPhone, rail, (b) => Math.abs(b.x) < 0.5, 'the drawer did not open');
      expect(await chapterPhone.locator('.tb-navtoggle').getAttribute('aria-expanded') === 'true', `${chapter.path}: the menu button's aria-expanded is not "true" with the drawer open`);
      await link.click();
      await pollDrawer(chapterPhone, rail, (b) => b.x + b.width <= 0.5, 'the drawer did not close after following a link');
      const got = await chapterPhone.evaluate(() => location.hash);
      expect(got === hash, `${chapter.path}: the drawer's link did not navigate (hash ${got}, expected its own ${hash})`);
    }, where);

    for (const e of chapterPhoneErrors) failures.push(`${where} phone page error: ${e}`);
    await chapterPhone.close();
  }

  // The book's contents page, which is where the key to the mark lives. It is not a chapter page, so the
  // `mark-audit` above never visited it, and the rule that marks its three chapter-dek quotations — set in
  // the page's own `<style>` block, because this page links no chapter stylesheet — was held by nothing:
  // a later edit dropping it left every gate green, on the page that explains the mark. `test/provenance.test.js`
  // proves the key is there; this proves the page SHOWS what the key explains.
  {
    const where = second.id;
    const contents = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    contents.setDefaultTimeout(ACTION_TIMEOUT_MS);
    const contentsErrors = collectErrors(contents);
    await openPage(contents, `${server.url}${second.path}?theme=light`);
    driven.push(where);

    // About the run rather than about this page, and it runs here because this is the first page after the
    // chapter loop and a `check` needs a page. See `citationExercised`.
    await check(contents, 'figure-citation-covered', async () => {
      const exercised = [...citationExercised.entries()].map(([kind, n]) => `${kind} x${n}`).join(', ') || '(none)';
      console.log(`     figure-citation-covered [${where}]: exercised ${exercised} of ${Object.keys(FIGURE_CITATIONS).length} declared kind(s)`);
      const missing = Object.keys(FIGURE_CITATIONS).filter((kind) => !citationExercised.get(kind));
      expect(!missing.length, `no phone load in this run showed a quotation from ${missing.join(', ')}, so the citation check for ${missing.length === 1 ? 'that kind' : 'those kinds'} never ran — a declared kind no page exercises is a check that cannot fail, which is what it looks like when the figure carrying it is dropped`);
    }, where);

    // The sheet is read and parsed INSIDE the step, not before it: a page whose rule has been dropped makes
    // `markRules` throw, and a throw outside a `check` kills the run with a stack trace and no step line —
    // which is what the red proof for this step found (out/flow-red2.log). A missing rule is a named
    // failure of the step that needed it.
    await check(contents, 'mark-audit', async () => {
      const spec = markRules(inlineStyles(readFileSync('tongjian/index.html', 'utf8')), 'tongjian/index.html <style>');
      const verdict = await contents.evaluate(auditMarks, spec);
      expect(verdict.n > 0, `${second.path}: the audit's own scope ("${spec.scope.trim()}") carries no [lang="zh-Hant"] run at all, so this audit compared nothing`);
      console.log(`     mark-audit [${where}]: ${verdict.n} run(s); per rule, in stylesheet order ${verdict.per.join('/')}; ${verdict.excluded} in a region the first rule excludes; ${verdict.bad.length} not visibly marked`);
      const first = verdict.bad[0];
      expect(!verdict.bad.length, verdict.bad.length
        ? `${second.path}: ${verdict.bad.length} of ${verdict.n} marked run(s) is not visibly marked; first: the run "${first.text}" in <${first.container}> — ${first.why}; run ${first.run}, container ${first.within}`
        : '');
    }, where);

    for (const e of contentsErrors) failures.push(`${where} page error: ${e}`);
    await contents.close();
  }
} finally {
  await browser.close();
  await server.close();
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`flow: ${step} steps passed; pages driven: ${driven.join(', ')}; screenshots in ${OUT}/`);
