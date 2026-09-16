# Gate proofs

A gate counts only once it has been made to go red by reintroducing the defect it claims to catch. This file records the mutation, the exact failure it produced, and the bound the gate carries in its own header. Newest first.

Auditing a gate means reaching what was measured at the time, never the sentence the gate carries about itself: a gate and its claim can be wrong together and look exactly like a gate that is right.

Every entry names the tree its numbers were taken on. The entries below were all taken on the uncommitted foundation tree of 2026-09-08, before the first commit, so they name files rather than revisions; the first commit carries the same files.

## browser-quiet: the flags that keep chromium's crash dialog off the desktop (`test/browser-quiet.test.js`)

- **The gap, reported by the owner (2026-09-12).** A modal `chrome-headless-shell.exe - Application Error` window, *"The exception Breakpoint (0x80000003)"*, appeared on the desktop while a gate run was in flight. It is raised by the browser process, so it outlives the gate and blocks the desktop. No gate could see it: it is outside the browser. Full investigation in [defect-register.md](defect-register.md).
- Claim (in the test's own header): the wrapper declares the flags that suppress the dialog, it applies them by appending to a launch's own flags rather than replacing them, and it patches a browser *type* so every `chromium.launch()` in the process is covered. Bound: text and argument handling of one module. It cannot observe a dialog, and it deliberately does not launch a browser.
- Mutation: `--noerrdialogs` deleted from `QUIET_ARGS` in `tools/zj-quiet-browser.cjs`. Failure, **both tests green before the mutation and both red after**:
  - `AssertionError [ERR_ASSERTION]: the wrapper's flags and this test's expectation disagree; change both deliberately and update the defect register entry`
  - and against a launched browser, in the probe: `AssertionError: the browser was started without --noerrdialogs: the dialog can come back`
  Restored, 3 of 3 pass.
- **Three unsound versions were written before a sound one, which is the reason this entry exists.** (1) Reading `tools/zj-quiet-browser.cjs` as a string: passes with the flags in a comment, and passes while the patch fails to apply. (2) Iterating the wrapper's own `QUIET_ARGS`: deleting a flag would pass the one test that launches a browser. (3) The launch assertion living inside `test/`: `npm test`'s FIRST step is the unit suite, chosen because it is the cheapest and needs nothing but Node, and a test that launches a browser makes that step depend on a downloaded chromium and on a session able to open a named pipe. Measured the same day in a session that could not: every such launch dies with `browserType.launch: spawn EPERM`, which reads as a repository defect. The launch assertion now lives in `tools/zj-quiet-browser-probe.js`, which is run deliberately; the unit test checks the flag list, the merge function, and that `patch()` reaches all three browser types through a fake, with no browser.
- Two facts that cost an attempt each, now comments in the files: `Browser.getBrowserCommandLine` needs a **browser-level** CDP session and is unreachable from a page session, and Chromium refuses to answer it unless `--enable-automation` is on its command line.

## pages: a chapter's page id names its book (`test/pages.test.js`)

- **The defect, found by a read-only probe before the second book's first page existed (2026-09-12).** `tools/lib/browser.js` built a chapter's page id from the chapter number alone, so a second book's chapter 1 collided with the first book's. `test/pages.test.js`'s uniqueness assertion would have caught it — but only once the colliding page was on disk, so a correct new chapter would have turned an unrelated gate red and the failure would have read as "the new book broke the page list". `SHOT_PAGES=ch01`, `DEVICE_PAGES=ch01` and `tools/inspect.js --page ch01` were ambiguous in the same way. Detail in [defect-register.md](defect-register.md).
- Claim (in the test's own header): a chapter's page id starts with its book's id and is `<book>/chNN`, a page in `PAGES` carries that id, and that page's path is the chapter's path.
- Mutation: `browser.js` restored to `` id: `ch${m[1]}` ``. Failure:
  `AssertionError [ERR_ASSERTION]: chapter /biology/ch01-what-is-life/ has page id "ch01", which does not name the book "biology"; two books then share an id for the same chapter number`. Restored, 6 of 6 pass.
- **Why the assertion is on the id's shape and not on uniqueness alone.** After the fix, uniqueness follows from construction — the book component is a unique directory name — so a test of uniqueness would agree with the code by definition, and dropping the book component again is exactly what it would not catch. The shape assertion fails on that mutation; measured, above.

## registry: every figure module parses (`test/registry.test.js`)

- **The defect, found 2026-09-12 while mounting a figure on a new book.** Two modules under `src/figures/` could not execute at all, and `npm run unit` reported 117 of 117 passing. A backtick used to quote an identifier inside a CSS template-literal comment closed the template and left the identifier as code: `` `fr` `` in `zj-split.js`, `` `color` `` in `zj-words.js`. A chapter's figure rendered as the frame's error box — `its module did not load (Unexpected identifier 'fr')` — while the unit gate was green.
- Claim (in the test's own header): every module in `src/figures/` parses. Bound: **syntax only.** It says nothing about whether a module mounts, draws, or reports anything — `npm run drive`, `narrow` and `sweep3d` are what answer those. It parses rather than lints on purpose: a rule forbidding backticks in a CSS comment would have caught `fr` and missed `color`, which is the same mistake in a different module with a different identifier.
- Mutation: `` `fr` `` restored in `zj-split.js` line 238's comment. Failure:
  `AssertionError [ERR_ASSERTION]: 1 figure module(s) do not parse, so the frame will show an error box where a figure should be:`. Restored, 3 of 3 pass.
- **Why the checks above it could not see this.** `test/registry.test.js` never imported the modules — its header says so, because they import `three` by a bare specifier Node cannot resolve — so every assertion it made read a module's *text*: does it export `meta`, does it export `mount`, does `meta` name its kind. All three were true in a file that could not run. `node --check` parses without resolving imports, which is what made the check possible at all.

## narrow: the figures' phone layouts had no gate at all (`tools/narrow.js`)

- **The gap, reported by the worker who created it (2026-09-10).** Five of the nine figures gained a
  second composition for a narrow stage, because their desktop drawings rendered type at about four
  device pixels on a phone. `tools/drive.js` runs one viewport, 1000x640, and `tools/shot.js` loads the
  phone chapter but only asks whether the page threw. A whole second layout per figure was standing on
  one worker's screenshots and nothing else.
- Claim (in the tool's own header): at a 390 px stage, in both themes, every registered figure reaches
  `ready`, draws a frame that is not blank, flat or near-black, keeps at least one control reachable
  and pressable, and stays ready after it is pressed.
- Mutation: `drawNarrow()` in `src/figures/tree.js` made to return immediately. Failure:
  `FAIL: 1 problem(s) over 0 narrow frame(s): tree light: the figure is in state "error"`, exit 1.
  Restored, 18 of 18 frames `ok` across nine figures. The blank-frame branch of the same `judge()` is
  the one proved in the sweep entry below, where replacing a render with a clear produced
  `one colour fills 98.4% of the frame ... the frame is blank`.
- **Two of its own assertions were unsound and were removed rather than kept.** It first required that
  pressing a control change what the figure reports. That failed on the tree, whose `Domains` button is
  the mode it opens in, and then on the helix, whose `Reset view` at the default view correctly does
  nothing. Idempotent controls are right, not inert, so the claim now stops at "stays ready after it is
  pressed"; what a control does is `drive.js`'s question at desktop width. A gate asserting something
  untrue is worse than a narrower one that is true.
- The other thing it had to learn: the first visible button is not always pressable. Pasteur's `Play`
  is disabled until the broth is boiled. It now takes the first enabled button that is not already
  pressed.
- What it does not prove: legibility, which is the whole reason the narrow layouts exist. It writes
  `out/narrow/` at three times scale precisely so a person can judge that, and the integration owner
  looked at those frames on 2026-09-10.

## sitting: a reader can finish a sitting, and the page does not claim more than the record supports (`tools/sitting.js`)

- Claim (in the tool's own header, as hardened on 2026-09-15): from a clean record the Today page offers a calibration sitting, every question is reachable and answerable with Tab and Enter alone, each answer is recorded with its objective, its format and the option chosen, the sitting reaches an end, that end carries at least one per-objective label, and none of those labels says the word the component reserves for the store's strictest verdict while the record says nothing has earned it. Bound: the path, not the pedagogy; it answers by taking the first option, so it cannot tell a good question from a bad one, and it only exercises a first sitting from empty. The label check reads label elements, never the running prose, and compares in aggregate — nothing in a first sitting's record qualifies, so no label may say it — without pairing each label with the objective it stands beside.
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
- **Hardened (2026-09-15): the check could not tell "no claim" from "no subject".** It matched the literal `/^learned well$/i` against a hard-coded `.tb-mark__word`. Reword the label, set it in Chinese (`docs/design/i18n.md`), or rename the class, and it finds nothing, counts zero and passes having compared nothing — the shape `docs/policies/local-rules.md` records under "A check must fail when its subject is missing". Measured, not inferred: `HEAD:tools/sitting.js` (4c4acb8) run against each of the first three mutations below reported `ok` on all four sittings and `sitting: 4 keyboard-only sittings completed; 16 screenshots in out/sitting/`, exit 0, every time. Now `src/components/mastery.js` exports `LEARNED_WELL_WORD` and `MARK_WORD_CLASS`, the label element takes its class from the export, and the gate reads both from the module. The record side is still `store.mastery()`, which knows nothing about how the page spells anything, so this is not the page agreeing with itself. The gate also builds a marker with `markElement()` and queries it the same way, to tell a page that rendered no label from an export that no longer names the element; asserts the precondition that nothing is learned well after one sitting, so the overstatement check cannot disarm quietly; and prints the label count on every line and in the summary, because `0 label(s)` is the shape of a run that compared nothing.
- Mutations (2026-09-15, on the uncommitted tree on top of 4c4acb8; `src/components/mastery.js` restored to the byte and re-hashed after each). Each fails on all four sittings, exit 1:
  - **The word.** `LEARNED_WELL_WORD` and `STATES.review.word` both set to `'牢牢掌握'`, so every `review` label carries the reserved word in Chinese, which the old regex could not match. The overstatement check: `light/desktop: 6 of 8 per-objective label(s) say "牢牢掌握" after one sitting, the word src/components/mastery.js reserves for store.mastery().learnedWell, but the record says none of its 6 objectives qualifies (labels shown: Not started, 牢牢掌握)`. Every line still reads `8 label(s) read against the record`.
  - **The class.** The element's class set to the literal `'tb-mark__label'`, the export left at `'tb-mark__word'`. The subject check, in its export branch: `no per-objective label was found — 0 elements match .tb-mark__word, the class src/components/mastery.js exports as MARK_WORD_CLASS — and a marker from markElement() matches it 0 times either, so the exported class no longer describes the element the component puts its word in. Nothing was compared against the record. Point MARK_WORD_CLASS at the element that carries the word now, and a passing run finds at least 1 label (8 on the tree this was written against)`. Every line reads `0 label(s) read against the record`.
  - **No labels.** Both `li.append(markElement(…))` calls removed, in "Where you stand" and in the closing list. The subject check, in its page branch — the probe built a marker that matched, so the message names the page and not the export: `the sitting ended with no per-objective label on the page — 0 elements match .tb-mark__word — although markElement() built one here that does match, so the component is intact and the page rendered none. Nothing was compared against the record. A passing run finds a label beside each objective the page names in "Where you stand", "What moved" and "Look at these again" — at least 1, and 8 over the 6 objectives of the tree this was written against; out/sitting/ holds the frames this run saw`.
  - **No word span**, the other way to render no label: `mark.append(glyph, label)` made `mark.append(glyph)`, so `markElement()` builds no word element at all. Fails on the same four lines, but the probe builds 0 too, so it lands in the export branch above and tells the fixer to point `MARK_WORD_CLASS` at an element that no longer exists. Red is right; the diagnosis is the nearest one, not the exact one.
- Clean run, same tree, after the last restore: `ok` on all four sittings, each `6 answered, 6 recorded, 6 with a chosen option, 8 label(s) read against the record`, and `sitting: 4 keyboard-only sittings completed; 32 per-objective label(s) read against the record; 16 screenshots in out/sitting/`. The 8 are two `Not started` beside blocked objectives in "Where you stand" and six `Holding` under "What moved", read off `04-light-desktop-end.png`.
- What it does not prove: that the questions are any good, that the queue chose well, or anything about a record with history behind it. A claim made in a sentence rather than in a label is outside what it sees, and so is a label the page did not render: the thirteen behind "and 13 more." are not in the DOM. The word is matched whole, so a label that appends anything to the reserved word would not be counted; today the detail goes in its own span, so the component cannot build one. `out/sitting/` is written for a person to look at.

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

## drive: a figure cannot shadow the four names the frame owns (`tools/drive.js`)

- Claim (in the tool's own header): for every registered kind, `describe()` on the figure's own handle uses none of `id`, `kind`, `number`, `state`. Bound: the kinds with a recipe, at one viewport, in the light theme; it says nothing about the values those fields hold.
- Why it exists: `src/components/figure.js` built its description as `{ id, kind, number, state, ...handle.describe() }`, so a figure reporting a field of its own called `state` overwrote the frame's. `foldlab` reports whether the protein is folded, and `npm run figure -- foldlab` died with *figure foldlab is in state "folded"* — every gate that asks whether a figure reached `ready` was reading the figure's word for it. The spread order is now reversed, so the frame's four fields win; but winning silently drops the figure's own value without a word, which is why this is a failure rather than a quiet correction.
- Mutation (2026-09-10): `state: 'MUTATION-shadowing-the-frame'` added to the object returned by `describe()` in `src/figures/pond.js`, `DRIVE_KINDS=pond`. Failure: `FAIL pond: describe() uses "state", which the frame owns; rename the figure's own field (foldlab reports foldState)`, exit 1. Reverted, 3 of 3 steps `ok`.
- The detail worth keeping: under the mutation **all three of pond's recipe steps still passed**. No assertion in any recipe could see it, which is the whole reason the check is a separate statement about the shape of `describe()` rather than something a recipe could have caught.
- What it does not prove: that the values are right, or that a figure names its own state sensibly. `foldState` is a convention, not something a gate can check.

## check: a chapter with objectives and no items fails (`tools/check-content.js`)

- Claim (in the tool's own header): every objective has at least three items, and a chapter that declares objectives with no `items.js` at all fails. Bound: the authored files; it says nothing about whether an item is any good.
- Why it exists: the three-items rule was written `if (items.length) { … }`, guarded on the very thing it was checking. A chapter with 35 objectives and no item bank skipped the loop and passed, because zero is not less than three when the loop never runs. Chapters 2 and 3 did exactly that: written, gated green, and invisible to the spaced-repetition queue.
- Red run, the real one (2026-09-10, no mutation needed — the defect was present): `FAIL biology/ch02-chemistry-of-life/index.html (8 figures, 52 glossary entries, 35 objectives)` with `declares 35 objective(s) and has no items.js, so nothing it teaches can ever be reviewed`, and the same for `ch03-cells`; `FAIL: 2 content problem(s) across 6 page(s)`, exit 1. Before the change the same tree reported `check: 6 page(s) pass`.
- What it does not prove: that an item teaches anything. A bank of 105 restatements passes. The `why` on each wrong option is what the daily agent round reads, and only a person reading the bank checks that.

## pages: the gates visit every chapter that exists (`test/pages.test.js`)

- Claim (in the test's own header): `discoverBooks()` in `tools/lib/browser.js` finds exactly the chapters on disk, `PAGES` contains all of them, and no two pages share an id. Bound: the tree as it is now; it proves the pages are *visited*, not that they load.
- Why it exists: the page list was maintained by hand in `tools/lib/browser.js` and again in `tools/subpath.js`, and the book's own contents page a third time. A chapter could be written, pass `npm run check` (which walks the tree itself) and never once be loaded by `shot`, `devices` or `subpath`. Chapters 2 and 3 were in that state. Discovery replaced both lists, and `subpath.js` now derives from the same one.
- The risk discovery introduces, and why this test derives the answer twice: discovery that quietly finds nothing leaves `PAGES` holding the library and Today, and every page gate goes green having checked no chapter. So the test walks the tree a second time, independently of `discoverBooks`, and requires the two to agree — a check built from the same symbol as the thing it checks proves only that the code agrees with itself. It also asserts the walk itself found something, so the test cannot pass by finding nothing twice.
- Mutation (2026-09-10): the chapter pattern in `discoverBooks` changed from `/^ch(\d{2})-/` to `/^chapter(\d{2})-/`, which matches nothing on this tree. Failure, 3 of 5 tests: `discoverBooks() and a plain walk of the tree disagree about which chapters exist`; `/biology/ch01-what-is-life/ exists on disk but no gate visits it; PAGES is ["/","/today/"]`; and `no book was discovered`. That middle message is the point of the whole test — `shot`, `devices` and `subpath` would have run green over two pages. Restored, `pass 5`.
- What it does not prove: that a discovered page loads, lays out or looks right. That is `shot`, `devices` and a person.

## devices: the phone shapes also run on WebKit and Gecko (`tools/devices.js`)

- Claim (in the tool's own header): the shapes either side of the drawer breakpoint are re-run on WebKit and Firefox over the pages that carry every component, and every check the Chromium arm makes, those arms make too. Bound: **two shapes and two pages** on the secondary engines, against the full nine-device matrix on Chromium; and Firefox cannot emulate a mobile device in Playwright (`isMobile` throws), so its phone arm is a narrow viewport with touch and proves layout differences, not input ones.
- Why it exists: emulating an iPhone in Chromium gives you an iPhone's size, input, user agent and pixel ratio, and Blink's layout. A real iPhone runs WebKit, and all four defects the owner reported were found on a real phone. The three engines were checked by hand during that investigation and the standing gate ran Chromium only, which left the closest available stand-in for the owner's own device outside the chain.
- Mutation (2026-09-11): `<div style="width:2000px;height:2px">` inserted at the top of the library's `<main>`, `DEVICE_PAGES=library DEVICE_ENGINES=webkit DEVICE_ONLY=phone`. Failure: `FAIL webkit phone library (1) / the page scrolls sideways: 2038 px of content in a 390 px viewport`, exit 1. Reverted, `ok`.
- Clean run on the real tree: `DEVICE_PAGES=library,ch01 DEVICE_ENGINES=webkit,firefox` — 8 loads, all `ok`. Chapter 1 holds up on all three engines.
- Also fixed while proving this: the tool's own summary line printed `wanted.length`, the configured device list, not what ran, so a WebKit-only run over two shapes announced `across 9 devices`. It now reports the engine-device pairs and pages it actually loaded. A gate that overstates its own coverage is the same failure as a gate that checks nothing, one step later.
- What it does not prove: anything about how it looks, on any engine. `out/devices/` is for that.

## check: a figure task's expect is one the grader can evaluate (`tools/check-content.js`, `expectProblems` in `src/components/task.js`)

- Claim (in the tool's own header): every `task` item's `expect` parses with the grader's own parser and holds no clause that no figure state can satisfy — a numeric operator against a right-hand side that is not a number. Bound: the grammar, not the figure. A path the figure does not report, or `~` against a field that turns out to be a number, is found only by grading against that figure's describe(), which this check never mounts.
- Why it exists: the grammar's right-hand side is a literal, never a second path, so `heat.comparisonC > heat.waterC` parses and then throws on every grade, for ever. Chapter 2's author wrote exactly that; `npm run check` passed it because it only asked that a task named a figure, and the author found it only by re-running all 26 expectations through the real grader against recorded snapshots. The check imports `parseExpect` from `src/components/task.js` rather than carrying a second parser, because the claim is "the grader can evaluate this" and only the grader can make it. `task.js` gained a Node guard for that (`globalThis.HTMLElement ?? class {}`, and `customElements.define` only where a registry exists) and a `literalFor()` that `compare()` and `expectProblems()` share, so the check and the grade cannot drift.
- Mutation (2026-09-15, on the uncommitted tree holding chapters 1–3): `biology/ch02-chemistry-of-life/items.js` line 582, `heat.comparisonC > 40 and heat.waterC < 36` → `heat.comparisonC > heat.waterC`. Failure, exit 1: `FAIL biology/ch02-chemistry-of-life/index.html (8 figures, 53 glossary entries, 35 objectives, 105 items)` / `biology/ch02-chemistry-of-life/items.js: item "i-specific-heat-2" has an expect no figure state can satisfy: "heat.comparisonC > "heat.waterC"" compares against "heat.waterC", which is not a number; the right-hand side of ">" must be a number such as 40, because an expect compares a field against a literal and never against another field`. Restored byte-identical (sha256 `2d5dc7f6bbb062bc…` before and after).
- Red run, the real one, and not a mutation: the first run of the new check over the tree failed **chapter 1**: `FAIL biology/ch01-what-is-life/index.html (9 figures, 31 glossary entries, 33 objectives, 99 items)` / `biology/ch01-what-is-life/items.js: item "i-resolution-limits-2" has an expect no figure state can satisfy: "nearest === 'influenza' and lensMetres < 2e-7" has trailing "e-7"; join clauses with "and" or "or"`. Chapter 1's items had not changed since 10 September. Asked directly, the grader agreed with the check: its number token was `-?\d+(?:\.\d+)?`, so `2e-7` tokenized as the number `2` and the word `e-7`, `parseExpect` threw, and `<tb-task>` had mounted that item as *broken* for every reader since the day it was written — reported as a `console.warn`, which no gate reads. The grader was the side that was wrong about numbers (`Number('2e-7')` is a number, and `scale` reports `lensMetres` across ten orders of magnitude), so the token now reads an exponent: `-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?`. An A/B of the two regexes over all 49 real expectations: 48 token streams identical, one differing, `2 | e-7` become `2e-7`. `evalExpect` on the clause afterwards: influenza at 1.0e-7 m → true, at 3.0e-7 m → false, hair at 1.0e-7 m → false. Then `ok   biology/ch01-what-is-life/index.html (… 33 objectives, 99 items)`.
- Fixtures (`test/check-content.test.js`, 38 tests green): the field-against-field clause, checked to name the bank, the item, the clause and what the right side must be; quoted text under `<`; a clause inside `not (… or …)`; three unreadable expressions carrying the parser's own messages; every allowed form passing; and `lensMetres < 2e-7` passing while `2ee` still fails.
- In a browser, because the Node guard would fail silently there (an undefined element, not an error) and no gate mounts this task: a scratch probe standing in for `npm run sitting` and `npm run drive` opened the real chapter-1 page, found `customElements.get('tb-task')` defined and a `<tb-task>` an `HTMLElement`, appended the item's task on `fig-scale`, and read `state: "unanswered"` at mount where the old grammar gave *broken*. Four presses of the figure's own `Next, smaller thing` button took the lens from the animal cell at 2e-5 m to influenza at 1e-7 m; the task's own Check button graded `right`, and the reader saw `That is it. The figure reports nearest = "influenza", lensMetres = 1e-7.` No page error, console error or failed request. `npm run shot` on chapter 1 and Today and `npm run sitting` (2 sittings, 6 answered each, 16 labels read) were green on the same tree.
- What it does not prove: that an expectation is reachable. `x > 5 and x < 3` parses, evaluates, and no state satisfies it; and a bare word with a dot under `===` (`left === heat.waterC`) grades as text and is wrong for ever without a word. Both are named in the handoff of 2026-09-15 and neither is gated.

## check: every item bank is listed on the study page (`tools/check-content.js`, `checkStudySources`)

- Claim (in the tool's own header): every chapter with an `items.js` is listed on every page that carries a `<tb-sitting>`, as an `<a class="tb-source">` whose href resolves to that chapter and whose `data-key` is the chapter id the store files it under (`<book>/chNN`); no two sources share a key; at least one such page exists; and given no bank at all the check fails rather than passing. Bound: one book and one study page — it asks that this page list every bank on disk. Nothing here loads the page: whether a listed bank then loads is `npm run sitting`'s question.
- Why it exists: the site has no build step, so `today/index.html` names its banks by hand, and it named chapter 1 only. Chapter 2 had 105 items across 35 objectives that no sitting could reach, the page still said "33 ideas in this book have a question waiting", and `npm run sitting` passed having never touched a chapter-2 item. It is the same defect as the page list no gate visited: the banks are now found from disk (an `items.js` beside a chapter page) and the rule is keyed on the bank, which is the thing that makes the listing required.
- Mutation (2026-09-15): the chapter-2 line removed from `today/index.html`. Failure, exit 1: `FAIL today/index.html (0 figures, 0 glossary entries, 2 item bank(s) on disk to list)` / `today/index.html: biology/ch02-chemistry-of-life/items.js exists (105 items) and no tb-source in today/index.html points at it, so no sitting can ask one of them; add inside <tb-sitting>: <a class="tb-source" href="../biology/ch02-chemistry-of-life/" data-key="biology/ch02">2 · The chemistry of life</a>`. Restored byte-identical (sha256 `447f514077a5095f…`).
- Clean run after both restores: `ok   today/index.html (0 figures, 0 glossary entries, 2 item bank(s) on disk to list)`, and the tree's only remaining failure is chapter 3's missing `items.js`, which is expected and is not this check's.
- Fixtures (`test/check-content.test.js`): a bank not listed, checked to name the chapter, the file and the exact element; both listed in either order; a wrong `data-key`; a missing `data-key`; two sources sharing a key; no bank given; a page with no `<tb-sitting>`.
- What it does not prove: that Today loads the bank it lists, that the link text matches the chapter's title (the check prints the title it would use and does not require it), or anything about a second book.
