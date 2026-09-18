# 2026-09-17 — the mark, and how this round's work had to be landed

Round: [docs/work/6_mark-quality](../../work/6_mark-quality/plan.md). Commits `d7a7912` … `9000533`, plus the round still open in `docs/work/6_mark-quality/`.

## What the round was for

The provenance work landed (`6a8fd7d`…`3d3be2c`) and was reported as done. The owner asked whether it was **supreme quality**, and it was not: the acceptance the design of record requires — a person looking at 1×, 2× and 3×, 390 and 1440 px, both themes — had never been performed (five desktop-light frames had been looked at out of 24 the gates wrote), nothing measured whether the mark is perceivable, and an independent typographic review then found the rendered page disagreeing with the markup in three places nothing could see.

## What was believed, and proved false

**That `lang="zh-Hant"` recording which words are 通鑑's was the same as a reader being able to see it.** The attribute was in the markup and gated; it is invisible on the page. The treatment that fixes it — `--zj-quoted-size` in `--ink-soft` — had been **declared in the stylesheet since the prototype and used by nothing**, and the design of record had specified it all along. A design that is written down and never built, with no check that notices, is the shape of this whole round.

**That the mark worked everywhere it was asked to.** Measured, it did not. Five runs in `<tb-check>` options received **no mark at all** (`matched=0, 17 px, full ink`) because `src/components/check.js` rebuilds each option as a `<button>` and the rule's container whitelist matched no ancestor. A margin note and every `.explain` had an ink step of **exactly 1.00:1** — the same colour to the byte — leaving 0.8 px of size, and those are **17 of the book's 42 marked runs**.

**That the 13 px floor protected the smallest prose.** Its justifying sentence claimed a note is 13 px at 390 px, so the floor held a run at 13 px "where 0.95em alone would give 12.4". A note is 1 rem at 390 px *and* at 1440 px, so 12.4 px occurs nowhere, and the floor's only live effect was to set chapter 3's citation-line run at **13 px against an 11.52 px line — the mark pointing the other way**. That comment was mine, written one commit earlier, and a reviewer who measured rather than read is what removed it.

**That the reviewer's own spec for the quiet containers would work.** Implemented verbatim, it did not: the mark rule is (0,8,2) and the exception rules (0,5,1) and (0,6,0), so the exceptions lost and the 註 run stayed at 15.2 px in its own colour. The worker measured it, excluded those two containers from the mark rule instead, and wrote the number down. **A spec is a hypothesis until it is measured against the cascade.**

**That I had found English text on a Chinese page.** Three frames showed a faint clipped strip under the sticky header that I read as English, where the design record says only two component strings should remain. A DOM walk for text containing two Latin letters found three runs at both shapes — a `display: none` `<style>` block's own CSS text and the word `Enter` in two Chinese hints. The strip is the Chinese skip link with its glyph tops cut by the header. **A person looking at a frame can misread it; the frame is not the last word, the measurement is.**

## What landing this round cost, and the three defects it produced

All of it was written in a **shared working tree** that carries another session's uncommitted round: biology chapters 4–7 as untracked directories, and uncommitted edits to `src/figures/*`, `src/styles/*`, `tools/*`, `AGENTS.md` and several docs. Two consequences had to be handled rather than discovered.

**The gate chain could not run in an isolated tree at all.** `npm run unit` failed in a fresh linked worktree (157/156/1, `.git/ is on disk and holds no file`) because `test/control-chars.test.js` required every ignored name to be a directory of files and a worktree's `.git` is one `gitdir:` line. So every session worked in the shared tree, where one session's uncommitted edits mask another's results — and where a green gate does not mean what it says. That is fixed now, and it is why this round could be done in isolation afterwards.

**Committing to the shared tree means staging hunk by hunk.** Three of the files a round must append to (`docs/devlog/summary.md`, `docs/learning/gate-proofs.md`, `docs/learning/defect-register.md`) are dirty with the other session's work, so `git add` would sweep a stranger's half-finished round into this round's commit. The technique that works: build the blob as `git show HEAD:<path>` plus this round's insertion, write it with `git hash-object -w --path <path> --stdin` **through a `cmd /c` redirect** — not a PowerShell pipe, which re-encodes the text; the first attempt committed a whole file of mojibake with a BOM — then `git update-index --cacheinfo`. The working tree keeps both rounds' text; the commit carries one.

**Three defects of my own, each caught by a different instrument:**

1. **A live mutation left in the shared tree.** `[IO.File]::WriteAllText` resolves a relative path against the **.NET working directory**, which `Push-Location` does not change, so a mutation went into the shared checkout while my "restored byte for byte" check hashed the worktree's copy and reported success. Caught by the before/after sha256 the round's own proof discipline requires. *Use absolute paths with `[IO.File]`, always.*
2. **A file missed in the landing.** `tools/flow.js`, `tongjian/zj.css`, the pages and the design doc were copied to main; `tongjian/README.md` was not, and main was left describing a mark that no longer existed in three places. Caught because the worker's report listed a file my copy list did not. *A landing checklist is the worker's file list, not what you remember copying.*
3. **A file copied mid-write.** The design of record was copied while its author was still editing it, so main carried an earlier text (a heading and a paragraph) and the worker's report's own sha256 is what exposed it. *Compare the landed file's hash against the hash in the handoff before calling the landing done.*

And one more, from the same family, in a worker's hands rather than mine: a proof attempt at the standing-docs gate was a **silent no-op** because the mutation pattern was a regular expression built from `- [a quotation…]`, where `[...]` is a character class — the same trap that had dropped the index line the gate exists for. It was caught only by hashing the artifact before and after. **A mutation that changes nothing reads exactly like a mutation that proves nothing.**

## Numbers that moved

- Marked runs in the prose: **48 → 46** (a mis-marked variant removed, a textual note exempted).
- A marked run inside a margin note: **15.2 px in the note's own colour → 16 px in full ink** — the inversion.
- The same inside `.explain`: **16.15 px soft → 17 px ink**.
- A `<tb-check>` option run: **unmatched at 17 px ink → matched at 16.15 px soft**.
- Chapter 3's citation line: **13 px (a step up on an 11.52 px line) → 11.52 px**.
- The key page's chapter-dek quotations: **identical to their dek, 1.00:1 → full ink against a soft dek**.
- The whole gate chain: **unable to run outside the shared tree → 160 unit tests and `check` 10/10 pages in a clean worktree**; `flow` from 7 steps on one book to **37 across four pages**, including a rendered mark-audit that fails a run the page leaves unmarked.
