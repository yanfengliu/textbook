# Lessons (queue)

Read at session start. A lesson is prose only until it is a gate: each entry names the gate that will retire it (a test, a check in a tool, a lint rule, a fixed command) and is deleted in the commit landing that gate, once the gate has been made to go red by reintroducing the defect. The proof of each retirement lives in `gate-proofs.md`.

An entry that can name no gate is not a lesson: repo-only knowledge goes to `docs/policies/local-rules.md`, fleet-wide knowledge is staged in `../../../fleet/canon-candidates.md`, and the rest is dropped.

Entry shape: date, claim, evidence (measurement, commit, or test id), the gate that retires it.

## 2026-09-19 — a check that audits the marks that exist cannot see a mark that was never made

Two years in chapter 2's 背景 were plain text while the years beside them were gold, so nothing failed and nothing was missing: the paragraphs already carried `data-date`, and the hook check asks whether a mark that exists still paints and whether the page still carries the marks it did.
Measured before the fix: chapter 2 held 7 `.zj-yr` marks and 10 year-shaped tokens not marked — seven inside the timeline figure, two years in prose (前493, 前476), and one phrase, 「之前五十年」 (`out/review-round/years.txt`). The shipped page holds 12 `.zj-yr` and 0 with no `[data-date]` ancestor (`out/rerun/years.txt`), and the two marks landed in `e400821`.
Gate, owed: a year-marking check — every year-shaped token inside a prose paragraph of a `tongjian` chapter sits in a `.zj-yr` under a `[data-date]` ancestor. `out/rerun/years.mjs` is the probe it would be folded out of, and the rule holds on the shipped tree with no exception to carve out: every year token that is not gold on chapters 1 and 2 is inside a figure, not in a paragraph.

## 2026-09-24 — a figure must read well in the smallest wide box

The frame gives a figure its narrow box only below an 800 px window (`src/styles/components.css:505`), but the rail beside the text leaves the stage far narrower than the window: 480 px at 800, 656 px at 1024. A figure that picks its own composition by its stage width can then get a wide, flat box too small for either of its compositions. No gate asserts anything there: `shot` frames 1024 px for a person to look at, and `narrow` measures a figure's layout only at a 390 px stage.
Measured: the chapter 7 figures review found 7.2 and 7.4 unreadable from an 800 to about an 1150 px window (findings 17 and 23 of `2026-09-24-ch07-figures-accuracy.md`). The wide-band probe then found the class across the book: 11 of the 48 figures in chapters 1–7 break somewhere from 800 to 1150 px, and two of them, `surface-volume` and `prokaryote`, did not load at 800 px because a radius went negative (`docs/work/2_rest-of-the-book/reviews/2026-09-25-wide-band-probe.md`, run on `f1ae404`).
Gate, owed: a sweep of every figure at an 800–860 px window that holds what `npm run narrow` holds at 390 px: the figure reaches `ready`, draws a frame, keeps a control pressable, and no pane lands on another pane or a control. The probe's `probe-band.mjs` is what it would be folded out of.
