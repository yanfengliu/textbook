# Lessons (queue)

Read at session start. A lesson is prose only until it is a gate: each entry names the gate that will retire it (a test, a check in a tool, a lint rule, a fixed command) and is deleted in the commit landing that gate, once the gate has been made to go red by reintroducing the defect. The proof of each retirement lives in `gate-proofs.md`.

An entry that can name no gate is not a lesson: repo-only knowledge goes to `docs/policies/local-rules.md`, fleet-wide knowledge is staged in `../../../fleet/canon-candidates.md`, and the rest is dropped.

Entry shape: date, claim, evidence (measurement, commit, or test id), the gate that retires it.

## 2026-09-19 — a check that audits the marks that exist cannot see a mark that was never made

Two years in chapter 2's 背景 were plain text while the years beside them were gold, so nothing failed and nothing was missing: the paragraphs already carried `data-date`, and the hook check asks whether a mark that exists still paints and whether the page still carries the marks it did.
Measured before the fix: chapter 2 held 7 `.zj-yr` marks and 10 year-shaped tokens not marked — seven inside the timeline figure, two years in prose (前493, 前476), and one phrase, 「之前五十年」 (`out/review-round/years.txt`). The shipped page holds 12 `.zj-yr` and 0 with no `[data-date]` ancestor (`out/rerun/years.txt`), and the two marks landed in `e400821`.
Gate, owed: a year-marking check — every year-shaped token inside a prose paragraph of a `tongjian` chapter sits in a `.zj-yr` under a `[data-date]` ancestor. `out/rerun/years.mjs` is the probe it would be folded out of, and the rule holds on the shipped tree with no exception to carve out: every year token that is not gold on chapters 1 and 2 is inside a figure, not in a paragraph.

## 2026-09-19 — a check that has never been made red is not a gate

`npm run shot`'s font census found the uncovered code points on its first run, and both [defect-register.md](defect-register.md) and the geometry entry of [gate-proofs.md](gate-proofs.md) describe that run.
But no mutation of the census is recorded anywhere, and `out/censusproof/` holds one baseline arm and no red arm beside it (`arm0-baseline.log`; its `ch02-index.html.orig` is byte-identical to the page in the tree, so nothing is left applied). The census is therefore a check and not a gate, and the claim it carries is still open.
The claim: Google Fonts serves a Chinese family as `unicode-range` slices, so 21 of the 1,937 code points this book uses fell outside every slice and the browser drew them from the reader's machine — SimSun here, tofu on a machine without one. A second request naming 18 of them was added, and the 3 astral-plane forms stay out on purpose because no webfont draws them.
Gate, owed: the red proof — a covered code point dropped from a page's `text=` list, or a page pointed at a face that cannot draw a character it prints, reading red on the code point, with the clean load and its denominators printed beside it.
