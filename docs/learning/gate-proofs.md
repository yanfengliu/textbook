# Gate proofs

A gate counts only once it has been made to go red by reintroducing the defect it claims to catch. This file records the mutation, the exact failure it produced, and the bound the gate carries in its own header. Newest first.

Auditing a gate means reaching what was measured at the time, never the sentence the gate carries about itself: a gate and its claim can be wrong together and look exactly like a gate that is right.

Every entry names the tree its numbers were taken on. The entries below were all taken on the uncommitted foundation tree of 2026-09-08, before the first commit, so they name files rather than revisions; the first commit carries the same files.

## sitting: a reader can finish a sitting, and the page does not claim more than the record supports (`tools/sitting.js`)

- Claim (in the tool's own header): from a clean record the Today page offers a calibration sitting,
  every question is reachable and answerable with Tab and Enter alone, each answer is recorded with its
  objective, its format and the option chosen, the sitting reaches an end, and no per-objective label
  overstates what the record supports. Bound: the path, not the pedagogy; it answers by taking the
  first option, so it cannot tell a good question from a bad one, and it only exercises a first sitting
  from empty.
- **The defect it was built for, found by looking at a screenshot rather than by any gate (2026-09-10).**
  After one right answer the end-of-sitting summary said **Learned well** beside six objectives. The
  store disagreed: `mastery('why-no-definition')` returned `learnedWell: false, evidence: 1,
  formats: ['mcq'], stability: 1.2`, and `summary().learnedWell` was empty while `inProgress` held it.
  The surfaces were labelling the scheduler's `review` state, which only means a card is past its
  learning steps, with the word reserved for the store's much stricter verdict: high recall, about a
  week of stability, a recent success, and success in two different formats.
- It lived in the gap between two modules that were each correct about themselves, which is why no unit
  test on either side could have caught it, and why this gate drives the page rather than the API.
- Fix: `review` is labelled **Holding**; **Learned well** is shown only where `mastery.learnedWell` is
  true, in the per-objective label and in the section summary, which had the same conflation in its
  count. The threshold is reachable and not cheap: one right answer gives `false`, seven right answers
  spaced over forty days across two formats gives `true` at a stability of 20.6 days.
- Mutation: `review: { word: 'Holding' }` put back to `'Learned well'`. Failure:
  `light/desktop: 6 objective(s) are labelled "Learned well" after one sitting, but the record says
  none of its 6 qualifies (labels shown: Not started, Learned well)`, exit 1, both widths. Restored,
  4 of 4 sittings `ok` with 6 answered, 6 recorded and 6 carrying the chosen option.
- **A false red of the gate's own, worth recording.** Its first version matched `/learned well/i`
  against the whole page text, which fires on the standing summary's perfectly honest sentence
  "0 ideas are learned well". A gate that reads prose cannot tell a claim from a count; it now reads
  the per-objective labels, which is where a claim about one idea is actually made.
- What it does not prove: that the questions are any good, that the queue chose well, or anything about
  a record with history behind it. `out/sitting/` is written for a person to look at.

## scheduler and store: the study system's arithmetic (`test/scheduler.test.js`, `test/store.test.js`)

Taken on the integrated tree of 2026-09-10, 42 new tests inside a suite of 99. The scheduler is a pure
function of a card and an outcome, so its tests assert the properties the design names rather than the
constants, which are free to move. Ten mutations, each applied to the stated file, the suite run, and
the tree restored before the next.

| mutation | site | what went red |
|---|---|---|
| right answers allowed to shrink an interval | `PARAMS.minGrowth.right` below 1 | `minGrowth.right must be at least 1` |
| `review()` mutates the card it is given | the update path | `review(..., right) changed the card it was given` |
| a lapse costs nothing | `lapseFactor: 1.0` | `stability 9.030271 -> 9.030271` |
| recall does not decay | `retrievability` ignores elapsed time | 3 tests |
| nothing is ever blocked by a prerequisite | the block test in `store.js` | 4 tests |
| one format counts as mastery | the `learnedWell` format rule | `but one format is the question learned, not the idea` |
| a corrupt saved record is rethrown | the `localStorage` read | 2 tests |
| the new-objective cap removed | `queue()` | `eight are open; the sitting must take 3, not 8` |
| the server gains a field the store never sends | `progressEventProblems` | `the server would refuse an event the store made: {...}` |

**One of those mutations did not go red the first time, and that is the entry worth reading.** The
new-objective cap was asserted inside a test whose prerequisite graph never had more than three open
objectives at once, so the assertion held whether the cap worked or not: it was vacuous, and it had
been green. A second test with an eight-root graph was added, and the mutation then failed it. A gate
written over a fixture that cannot reach the bound proves nothing about the bound, and it looks exactly
like a gate that does.

The scheduler sweep runs 64 seeded histories of 24 answers through `mulberry32`, and asserts it saw
more than 800 successes and more than 200 failures before it believes its own result, so "the sweep did
not run" cannot come back as "the sweep passed". A red run reproduces from its seed.

Bound: the arithmetic and the record, never the teaching. Nothing here knows whether an objective is
worth having, whether a question is any good, or whether the reader actually understands something.

## the published subpath: every page, as GitHub Pages serves it (`tools/subpath.js`)

- Claim (in the tool's own header): the tree the Pages workflow publishes, built from the same single
  exclusion list, serves every page under `/textbook/` at two widths in both themes with no console
  error, page error, failed request, same-origin 4xx, request escaping the subpath, figure not ready,
  or horizontal overflow.
- Mutation, by the worker who wrote it, before it was trusted: one `href="/src/styles/tokens.css"`
  injected into a copy. Failure: exit 1, naming `a root-only path: it would 404 under /textbook/`.
- Red run, the real one (2026-09-10): adding the Today page to its list turned four of twenty loads
  red with `pageerror: (safe(...) || []).some is not a function`. The study surfaces treated
  `store.cards()`, which is keyed by objective id, as an array, at three call sites. Two had already
  been reported by another worker and fixed; the subpath gate found the third, because it was the only
  gate that loaded the new page. Restored and fixed: 20 of 20 clean.
- A privacy failure this gate had, and no longer has: it mirrored the local working tree, so it copied
  `progress/`, the reader's own study record, into its temp mirror and screenshotted a tree that CI
  would never build. `progress` is now in `tools/pages-exclude.txt`, which both the workflow and this
  tool read, so the two cannot drift.
- What it does not prove: anything about GitHub's own serving, which no local server has. HTTPS, the
  trailing-slash redirect, the 404 page and CDN propagation are only observable after a push.

## drive: the helix pick step was green without ever picking anything (`tools/drive.js`)

- **A second false green, found by a worker rather than by a gate (2026-09-10).** The `dna3d` `click-a-rung` step asserted `d.selected !== undefined`. The figure reports `selected` as `pinned`, which is `null` and never `undefined` when nothing is picked, so the assertion held whether the click hit a base pair or empty paper. It also clicked one point, the centre of the stage, and the helix is a narrow column in a 16:9 frame: a worker probing a 6x8 grid across the whole stage found clicks that picked nothing at all. The step had therefore proved nothing for as long as it had been green, and it was green in every run recorded above.
- Found by the item-bank worker while checking that its figure tasks were reachable, which is the second time on this repository that a real defect in a gate came from someone using the thing the gate watches rather than from the gate.
- Fix: the step now asserts nothing is selected before it starts, sweeps twenty-seven points down the helix column until something is picked, and requires an integer base-pair index in range plus a card that names it.
- Mutation, after the fix: `const hit = pickAt(...)` in `src/figures/dna3d.js` replaced by `const hit = undefined`. Failure: `FAIL dna3d click-a-rung: no click anywhere down the helix selected a base pair; tried 27 points (476,54 438,54 514,54 476,107 438,107 514,107…)`, exit 1, with the other four steps still `ok`. Restored, 5 of 5 `ok`. The same mutation under the old assertion would have passed.
- What it still does not prove: that the right rung was picked for the pixel clicked. It proves a rung can be picked, is in range, and is named.

## sweep3d: every 3D figure renders a frame from every angle (`tools/sweep3d.js`)

- Claim (in the tool's own header): for each WebGL kind, at twelve light views plus a near, a far and a dark view, the bare canvas (every HTML overlay hidden) is neither near-black, flat, nor blank. Bound: an absent frame, not a wrong one.
- **A false green first (2026-09-10).** The first version measured the whole stage. With `renderer.render(scene, camera)` in `src/figures/cell3d.js` replaced by `renderer.clear()`, all 30 frames stayed `ok` and the run exited 0: fifteen `.fig-label` boxes and three toolbar buttons over the paper background vary enough in luminance (spread above 6, no colour over 97%) to pass as a rendered frame. The gate was measuring the overlays, and would have reported a dead renderer as fine for as long as the labels existed.
- Fix: the tool adds a `.sweep-bare` class that hides labels, toolbar, chips, cards and the placeholder, screenshots the stage a second time, and measures that bare frame; the labelled frame is still written beside it (`<kind>-<theme>-NN.png` and `-bare.png`) for a person to look at.
- Mutation, same as above, after the fix, `SWEEP_VIEWS=1`: `FAIL cell3d light theta=0.00 phi=0.45 d=38.0 / luminance spread 3.97 is under 6: the frame is flat / one colour fills 98.4% of the frame, over the 97% allowed: the frame is blank`, and the same for the other four cell views and the dark view; `FAIL: 6 problem(s) across 12 frames`, exit 1. The six helix frames stayed `ok`, as they should. Restored, `sweep3d: 12 frames rendered`, exit 0; the full run is 30 frames.
- What it does not prove: a frame with the wrong content. The thirty labelled frames were opened one by one at native resolution on 2026-09-10 and are described in `docs/work/0_foundation-chapter-1/plan.md`.

## handshake: the gates wait for every figure (`src/shell.js`, proved through `tools/shot.js`)

- Claim: under `?eager=1`, `window.__textbook.state` turns `ready` only after every `<tb-figure>` on the page has registered and reached `ready` or `error`.
- Red run, the real one (2026-09-09): with the shell mounting before the figure element was defined, the handshake resolved with no figures registered, and `npm run shot` reported `figure fig-cell (cell3d) is in state "loading"` and the same for `fig-dna` in all six chapter loads, `FAIL: 6 of 18 page loads had problems`, while the seven fast figures were `ready`. After the shell began counting the `<tb-figure>` elements in the DOM against the registry, `ok ch01 ... (9 figures ready)` for all six.
- What it does not prove: a figure that never calls `onReady` still fails only at the frame's 30 s timeout, as `error`, which the shot gate reports.

## drive: every figure's own controls do what the figure reports (`tools/drive.js`)

- Claim (in the tool's own header): for each kind, the recipe's steps performed with a real mouse and keyboard on the figure's buttons, range inputs and focusable stage leave `describe()` in the state each step asserts, with no page error. Bound: one viewport, the light theme, the steps listed, and `describe()`'s account rather than the pixels.
- Mutation (2026-09-10): `setMode(next)` in `src/figures/energy.js` changed to ignore `next` and always set `'both'`. Failure: `FAIL energy energy-mode: mode is {... "mode":"both" ...}` and the same for `matter-mode`, `FAIL: 2 problem(s) over 3 steps`, exit 1. Restored, 3 of 3 steps `ok`.
- Red runs before that, on the real tree: the first full run failed three steps for the recipe's own assumptions (an "Alive" button locator that also matched "Not alive"; labels assumed off when both 3D figures start with them on; the cold-plunge ambient asserted after the thirty-second plunge had ended), and none for a figure defect. Each recipe now names the state change it expects.
- What it does not prove: that the drawing matches the state. A figure that reports `cut: true` and draws no cut passes; `out/drive/` is for a person.

## flow: the reader controls work through real input (`tools/flow.js`)

- Claim (in the tool's own header): on the chapter page, real clicks, key presses and a drag drive the checks, the sort, a glossary popover, the theme toggle and the phone drawer to the states asserted, with no page error. Bound: one desktop and one phone viewport, light theme first, the shipped components.
- Mutation (2026-09-10): the line `o.disabled = true;` removed from `src/components/check.js`. Failure: `FAIL check-wrong-answer: options were not disabled after answering`, exit 1. Restored, 7 of 7 steps `ok`.
- Red run before that, on the real tree: `term-popover: no popover opened`, because hover had opened the popover and the click toggled it shut; a real defect in the input path that no unit test of the component could reach. Fixed in `term.js` (a click pins a hover popover instead of closing it).
- What it does not prove: the figures' own controls (that is `drive`) and anything about how the result looks.

## registry: a figure cannot exist without the frame knowing it, and the frame cannot promise a figure that does not exist (`test/registry.test.js`)

- Claim (in the test's own header): every kind in `src/figures/registry.js` has a module on disk exporting `meta` and `mount` and naming its kind, and every `.js` module under `src/figures/` is registered. Bound: file existence and a text match; the modules are not imported because they import `three` by its bare specifier.
- Mutation 1: an unregistered `src/figures/ghost.js` exporting `meta` and `mount`. Failure: `src/figures/ghost.js exports a figure but the registry has no kind "ghost"`, 2 of 2 tests failing (the first because the three worker modules did not yet exist on this tree).
- Mutation 2: `src/figures/pond.js` moved away. Failure: `pond: C:\...\src\figures\pond.js does not exist`, 1 of 2 failing. Restored, `pass 2` once every worker module was in place.
- What it does not prove: that a module honours the contract at runtime. `npm run shot` under `?eager=1` is what proves a figure reaches `ready`.

## palette: the CSS tokens and the JS palette are one table (`test/palette.test.js`)

- Claim (in the test's own header): the thirteen paper, ink and accent tokens in `src/styles/tokens.css` equal `LIGHT` in the `:root` block and `DARK` in both dark blocks, and the two dark blocks equal each other. Bound: those thirteen; the soft tints and shadows are CSS-only.
- Mutation: `--leaf` in the light block changed from `#2f7d4f` to `#2f7d50`, one unit in the blue channel. Failure: `the light tokens in tokens.css equal LIGHT in palette.js` with `+ leaf: '#2f7d50' / - leaf: '#2f7d4f'`, 1 of 5 failing. Restored, `pass 5`.
- What it does not prove: that a figure uses the palette. A figure with a hard-coded hex passes this test; the visual review is the check for that.

## shot: every page loads clean and lays out (`tools/shot.js`)

- Claim (in the tool's own header): a page passes when it reaches the handshake with no console error, uncaught page error, failed request, figure in the error state, or horizontal overflow, at three widths in both themes with every figure mounted and the clock pinned. Bound: three viewports, two themes, `t=0`, one renderer; it says nothing about the pixels.
- Red run 1, the real one: on the tree with the chapter written and eight figure modules not yet on disk, `FAIL ch01 phone light (1105 ms)` followed by eight `requestfailed: .../src/figures/<kind>.js (net::ERR_ABORTED)` lines and their `console.error` partners, then the same for each of the other five chapter loads; `FAIL: 6 of 18 page loads had problems`. The twelve library and book loads were `ok`.
- Red run 2, mutation: a `<div style="width:2000px;height:2px">` inserted at the top of the library's `<main>`, `SHOT_PAGES=library SHOT_VIEWPORTS=phone SHOT_THEMES=light`. Failure: `FAIL library phone light (478 ms) / the document overflows horizontally: scrollWidth 2038 > viewport 390`, exit 1. Restored, `ok`.
- What it does not prove: a figure that renders the wrong thing without throwing passes. `out/shots/` is written for a person to look at, and `docs/work/0_foundation-chapter-1/plan.md` records which frames were looked at.

## check: the authored chapter is complete and consistent (`tools/check-content.js`, `test/check-content.test.js`)

- Claim (in the tool's own header): registered kinds, unique ids, captions and alts on every figure, every term in the glossary and every glossary entry used, one correct answer per check, bins and reasons on every sort item, heading order, every figure cited in the prose and every citation real, resolvable hrefs, no leftover TODO. Bound: the authored HTML through a small tokenizer, never the rendered DOM.
- Red runs, fixtures: `test/check-content.test.js` makes the checker fire on eleven isolated defects (duplicate id, unregistered kind, missing caption, short alt, uncited figure, citation of a missing figure, unknown term, unused glossary entry, two correct answers, no correct answer, missing explanation, item naming a missing bin, item with no reason, second h1, loose h2, skipped heading level, TODO, broken href, broken fragment href), and passes a well-formed fixture. 11 tests, all green on the current tree.
- Red run, the real one: the first run over the written chapter reported `Figure 1.1 ... is never mentioned in the prose` and the same for 1.3, 1.6, 1.7 and 1.8, plus eight `<h2> ... is not the direct child of a <section id>` lines on the library and book pages; 13 problems across 3 pages. The five citations were added to the prose, and the heading rule was scoped to chapter pages (`main[data-chapter]`), which is the only place the shell numbers sections. Then `check: 3 page(s) pass`.
- What it does not prove: biology. A wrong sentence with the right markup passes; the read-only review is the check for that.
