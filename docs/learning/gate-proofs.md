# Gate proofs

A gate counts only once it has been made to go red by reintroducing the defect it claims to catch. This file records the mutation, the exact failure it produced, and the bound the gate carries in its own header. Newest first.

Auditing a gate means reaching what was measured at the time, never the sentence the gate carries about itself: a gate and its claim can be wrong together and look exactly like a gate that is right.

Every entry names the tree its numbers were taken on. The entries below were all taken on the uncommitted foundation tree of 2026-09-08, before the first commit, so they name files rather than revisions; the first commit carries the same files.

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
