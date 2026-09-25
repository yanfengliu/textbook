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

## 2026-09-24 — an answered option lost its tint under the pointer, and flow reads the class, not the paint

Once a page check was answered, a hover rule set every option's background to none and outranked the verdict tints, so the right answer lost its green and a wrong choice its coral wherever the pointer rested, and after a click that is on the option pressed. `npm run flow` presses a wrong option with a real mouse on every chapter, so the pointer sat on the defect every run; it then asserts `.is-wrong`, `.is-correct`, the verdict text and the disabled options, and never the background those classes paint.
Measured: with a real mouse on chapter 1's first two checks at 390 and 1440 px in both themes, the hovered right answer and the hovered wrong choice each read a transparent background before the fix and their tint after (`6478436`, merged in `276f58a`).
Gate, owed: in `npm run flow`'s wrong-answer steps, with the pointer left on the pressed option and then moved onto the revealed right answer, each hovered option's computed background is its verdict tint (`--coral-soft`, `--leaf-soft`), not transparent.

## 2026-09-24 — a line-break defect lives at every width, and a frame shows one

A mark glued to a glossary term's end began a line on its own, because a line may break after the term's `<button>`. The gates frame the prose at three widths, and a stranded mark overflows nothing and throws nothing, so they passed it; a person saw one in a 390 px frame of chapter 8.
Measured (defect register, the entry of 2026-09-24): of the 218 marks glued to a term in chapters 1–8, 4 stranded at 390 px and 172 at some width from 320 to 1440 px. The probe did not count a no-break space as glue, and 12 of the 14 terms written `</tb-term>&nbsp;—` stranded too, none at 390 px; chapter 8's two did so at 52 and 41 of the 1,121 widths. `test/term-hold.test.js` holds the fix's markup and stylesheet rules, and it cannot see a line break, so it does not retire this lesson.
Gate, owed: a width sweep of every page's prose that fails when a term's glued run, a mark, a plural's "s" or a no-break space and what it glues on, begins a line. The scratch probe that measured it, `strand.mjs`, laid each page out at every width from 320 to 1440 px and took about 45 seconds a page in one theme on this machine; it is not in the repository.
