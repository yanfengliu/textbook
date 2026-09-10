# 2026-09-08 to 2026-09-10 — foundation and chapter 1

The repo went from a README to a fleet member with a design of record, a site foundation, chapter 1 of the biology book with nine interactive figures, and seven gates. What a later session could trip over is below; the status is in `docs/work/0_foundation-chapter-1/plan.md`.

## Believed and proved false

- **The 3D sweep gate was green on a figure that rendered nothing.** The first version measured the whole stage, and when the cell's `renderer.render` was replaced by `renderer.clear()` the gate still passed: fifteen HTML labels and three buttons vary enough in luminance to look like a frame. The measure now hides every overlay (`.sweep-bare`) and reads the bare canvas; the mutation then went red. A gate built over the wrong pixels reports on the wrong pixels just as confidently. Proof in `docs/learning/gate-proofs.md`.
- **The eager handshake resolved before any figure had registered.** `window.__textbook.state` became `ready` when the shell mounted, and the shell is defined before the figure element, so for a moment the registry held no figures and "no pending figures" was true. Fast figures hid it; the two 3D figures were then read as `loading` by the shot gate in every one of six chapter loads. The handshake now waits until every `<tb-figure>` on the page has registered and settled.
- **A figure that reports ready inside `mount()` reached `ready()` before its handle existed**, so `?t=` never reached `setTime` and `describe()` had nothing to call. Both 3D figures happened to pin from `ctx.pinnedTime`, so the gates were unaffected and the contract as written was not what the frame did. The frame now defers `ready()` until `mount()` has returned. Found by the 3D worker, not by any gate.
- **Hovering a glossary term and then clicking it closed the popover.** The mouse arrives before the click, hover had already opened the popover, and click toggled it shut. Found by the first run of the flow gate, which is the reason the gate exists: the components' methods were fine, the input path was not.
- **`node --test test/` on Node 24.18 runs one bogus test named `test` and fails it**, so the unit script would have been red forever. The script globs `test/*.test.js`; a bare `node --test` with no pattern also picks up `tools/test.js` and runs the whole chain.
- **The flow gate's phone-drawer step slept a fixed 500 ms for a 400 ms slide** and, on the final run, measured the drawer 2.7 px short of closed and went red on a tree that was fine. The step now polls the drawer's box until it settles, with a 4 s deadline; a fixed sleep is a bound the gate did not state.
- **A long heredoc through the Bash tool fails to parse** somewhere past about 10 KB, with `unexpected EOF while looking for matching quote`, while a short one with the same quotes works; long files are written with the Write tool.

## What a reviewer or worker caught that the author missed

- The read-only prose review (`docs/work/0_foundation-chapter-1/reviews/review-1.md`): six wrong statements the author had read past. "200 nm, the wavelength of visible light" (it is half of it, and the limit is the light microscope's, not every lens's); the human genome's 3.1 billion base pairs "on 46 chromosomes" (that is the haploid set on 23; a cell carries two); the scale card's "hundred trillion cells" against the prose's 37 trillion; the levels alt naming an oxygen molecule where the figure draws water; the cell card counting label anchors as organelles; and a caption crediting both endosymbioses with making eukaryotes when the second made plants. Also `role="img"` on the figure mount, which would have hidden every figure's controls from a screen reader.
- The 3D worker: the ready-before-handle ordering above, and that `figure-shot` printed no cause for a figure in the error state (it now prints the figure's error and the page errors).
- The SVG and simulation workers, independently: the placeholder's 400 ms fade ghosting the title through pinned lab shots (the placeholder is now removed at once under eager or pinned mode), and the Node 24 test-runner trap.
- The drive gate's first run: three failures, two of them the recipe's assumptions ("Alive" matching "Not alive" as a substring, labels assumed off when they start on) and one timing (asserting the ambient after the plunge had ended). The gate went red for the wrong reasons before it went red for the right ones; each recipe now asserts a state change it can name.

## Numbers

- Gates on the final tree: 24 unit tests; 3 pages, 18 page loads clean; 7 flow steps; 38 drive steps over 9 figures; 30 sweep frames.
- Figures: cell 17 draw calls and 124,060 triangles; helix 4 draw calls and 44,768 triangles; pond 1.3–1.4 ms per frame; homeostasis 0.2–0.7 ms per frame steady state. `perf` on the owner's GPU with all nine figures running: vsync-locked at 16.7 ms median and p95.
- Chapter: 8 numbered sections, 9 figures, 31 glossary entries, 9 sort items, 5 checks.

## Process

- Three figure workers ran in parallel on disjoint files against the contract in the design doc, with a lab page and a screenshot tool as their instrument. The host process exited twice during the work (2026-09-08 and 2026-09-09); the workers' files survived, fresh workers finished from them, and a lost read-only reviewer was replaced by a fresh one. The scratchpad directory is shared between concurrent workers: two overwrote each other's scratch scripts and renamed.
- The workers' scratch control-driving scripts were promoted into `tools/drive.js`, one recipe per kind, and the reader-control driver into `tools/flow.js`; both are gates now.
- Phone width: the 3D cell's fifteen labels covered a 340 px stage and the 16:7 ruler shrank to about 150 px tall. The frame now takes a `narrowAspect` from the registry for figures that can fill any shape (pond, homeostasis, cell, helix), and the cell starts with labels off on a stage narrower than 600 px. The SVG figures still shrink their text on a phone; that is a known limit, recorded in the plan.
