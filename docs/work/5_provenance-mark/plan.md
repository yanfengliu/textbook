# 5 — which words are 通鑑's, and saying so on the page

Status: **done and merged to main** — commits `6a8fd7d` and `4baf736`, pushed 2026-09-17. The remote `pages` deploy is green; the remote `test` gate is red on a defect this round did not touch (below).

## What the owner asked for

He read the published second book and asked why a 通鑑 sentence, 「魏、韓、趙共廢晉靖公為家人而分其地。」, appeared in a 背景 section — quoted in the 年表 — when it is not in the 原文 section. The answer is that 原文 is a **selection** of three passages of 卷001 and the rest of the 卷 is quoted as context. He took the answer and asked for the general thing rather than the instance: *"Just make it perfectly clear what came from the book what didn't it, everywhere."*

## What the round found, and what it did

Two defects under one complaint, and a third that only turned up while fixing them.

1. **The mark was invisible.** `lang="zh-Hant"` had recorded which run is 資治通鑑's since the two-script round, and `test/lexicon.test.js` proved every marked run was a corpus quotation — but an attribute is invisible. A quotation in 背景 was Traditional and otherwise identical to the sentence around it. The design of record had already specified the treatment (*"same face, 0.95 em, `--ink-soft`"*) and `--zj-quoted-size` had been declared for it since the prototype and **used by nothing**.
2. **The rule held only where an author had remembered it.** Twenty-one runs of 通鑑's own words were printed as the book's own sentences, found by inverting the existing check (is this 「…」 run a corpus substring?) rather than by reading.
3. **A sentence about provenance contradicted the page.** Chapter 2's 背景 said of the 前376 entry 「只转述，不引原文」 four lines above figure 2.1, which quotes it with its citation. Fixed, and **the class is still ungated**: no check compares what a chapter says about its own selections with what the chapter prints. That is stated in the defect-register entry rather than implied.

Landed as: the quotation setting in `tongjian/zj.css`; the twenty-one marks; the rewritten sentence; the key on the contents page; `QUOTED_FIELDS` on the three figures with `lang` on the elements they build; and `test/provenance.test.js`.

## Acceptance, and who looked at it

- **A person looked at the frames**, which is the acceptance the design of record asks for. Before/after frames of chapter 2's 背景 (`out/inspect-prov-before/`, `out/inspect-prov-after/`: the quotation is visibly a step down and softer while the sentence around it is unchanged), the contents page's key (`out/inspect-prov-key/`), chapter 2's 原文 (`out/inspect-prov-src/`: **unaffected**, full size and full ink), figure 2.1 (`out/inspect-prov-fig/`), and a margin note carrying the mark (`out/inspect-prov-note2/`: 「損其戶數」 in the note beside the 前376 paragraph). The frames are ignored by Git and are not kept; the commit is the change.
- **`npm run unit`** 210/210 on the staged revision and again after the review fixes.
- **`npm run check`** ok on all four `tongjian/` pages. **It is red on `biology/ch06` and `biology/ch07`**, which are *untracked* directories in the shared tree — another session's in-progress round — and this round touched nothing there.
- **`npm run shot`** clean on the four tongjian pages at three viewports and both themes, 24 loads, twice (before and after the review fixes).
- **`npm run drive`** 10 steps over the three figures; **`npm run narrow`** green at 390 px; **`npm run subpath`** 16 loads clean under `/textbook/` for the four tongjian pages.
- **`npm run devices`** (`DEVICE_PAGES=tongjian/ch01,tongjian/ch02,tongjian/ch03`) 18 loads over the six chromium device shapes, all clean, and the 50% reading-column floor **exercised** on the six desktop and desktop-wide loads (58.2% at 1440 px, 52.8% at 1920 px). This is the gate a changed inline `font-size` could have moved — a marked run is smaller than the sentence around it, so a line can re-break — and the column edges held. *Not exercised in this run*: the phasing on other engines, because `DEVICE_PAGES` selected chromium only, and the run says so.
- **`npm run pinned`** (`PINNED_KINDS=zj-split,zj-timeline,zj-words`, `PINNED_SHARDS=1`): 3 kinds, 38 mounts, 38 presses, 41 untouched windows of 12 animation frames each, PASS. The three figures hold still, which is the invariant the round's added `lang` attributes and data field must not disturb.
- **`npm run flow`** 7 steps passed. It drives `biology/ch01` and nothing of this book's, so it is evidence that the shared components still work in this tree and **not** evidence about the change; it is recorded as the former.
- **Two gates do not apply, said rather than left out.** `npm run sweep3d` renders WebGL figures and all three `zj-*` kinds are `needsWebGL: false`; `npm run sitting` drives the Today page's study sitting, and this book ships no `objectives.js`, no `items.js` and no `<tb-source>` line, so no sitting on this book exists to complete.
- **`npm run legible`** compares **0 runs** for these three figures — they are in its `DEFERRED` list — so it is not a result. Stated here because a green line that measured nothing reads like one that measured something.

## The remote gate, read rather than assumed

`pages` succeeded. `test` **failed**, and it was already failing on `main` at `0806283` before this round's push: the same step (`npm run shot`), the same cause — `<rect> attribute width/height: A negative value is not valid` on biology figures — and the same class of page (`biology/ch03`, three loads this time, `phone light` nine hours earlier). Every `tongjian` load is `ok` in both runs. Nothing was done about it: it is another session's defect on an area this round did not touch, and the register already carries the negative-width class.

## Review

An independent, read-only review ran against the working tree before the first commit and is kept in `reviews/2026-09-17-provenance-review.md`. It found one defect in the pages and three in the gate, all four closed in `4baf736`; the defect it found in the pages was **introduced by this round minutes earlier**, which is the part worth keeping.

## What a later session should know

- **A quotation in an `<aside data-note="textual">` is the one place the page's mark is not required**, because those notes discuss the text and a run inside one may be a reading the received text does not carry. Their marks are held by `test/lexicon.test.js` instead — the weaker check. Both the test header and the design of record say so.
- **The gate's page predicate is the book's own 「」 brackets.** A 通鑑 quotation set bare in the prose is not seen. That is in the header.
- **The gate's figure predicate is identity with a whole 句**, not a substring, because a figure's fields are short labels as well as sentences. A field holding a fragment of a 句 is not seen.
- **This round was written in a shared working tree** that carried another session's uncommitted work. The two standing docs it had to append to (`docs/devlog/summary.md`, `docs/learning/gate-proofs.md`, `docs/learning/defect-register.md`) were staged **hunk by hunk through the index** — `git hash-object -w --path … < file` plus `git update-index --cacheinfo` — so the commits carry this round's additions and none of the other session's. Nothing of theirs was touched, and their work is still uncommitted in the tree, as it was.
