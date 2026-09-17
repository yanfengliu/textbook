# 2026-09-17 — which words are the book's, and why the gate was not enough

Round: [docs/work/5_provenance-mark](../../work/5_provenance-mark/plan.md). Commits `6a8fd7d` and `4baf736`.

## What was believed, and proved false

**That marking a quotation was the same as showing it was one.** The book had recorded which run is 資治通鑑's since the two-script round — `lang="zh-Hant"` on every 原文 block and every quotation, with `test/lexicon.test.js` proving each marked run is a verbatim corpus quotation — and the round before this one had treated that as the answer to *"I can't tell what is original text and what is interpretation."* It was half the answer. `lang` is invisible, and a quotation in 背景 was Traditional and otherwise identical to the sentence around it. The fix was a token (`--zj-quoted-size`) that `docs/design/tongjian.md` had specified and `tongjian/zj.css` had **declared and used by nothing** since the prototype: the design was written down and never built, and nothing measured the gap.

**That a rule an author remembers is a rule.** Twenty-one runs of 通鑑's own words were being printed as the book's own sentences. They were not found by reading the pages; they were found by inverting the existing check — *is this 「…」 run a substring of `corpus.js`?* — which is one line and which nobody had written, although `test/lexicon.test.js`'s own header had said for a day that a quotation the book does not mark is invisible to it.

**That the first version of the new gate was sound. It was not.** Its own mutation proof found one hole (the key check matched `zj-key-removed`, because `-` is a word boundary, so that arm was **green** on the mutation it was written for), and a read-only review found three more: the figure scan read only single-quoted literals, its module list shrank silently when a file was renamed, and — the one that matters — the round had shipped a mark that was true to the corpus and false to the note beside it. All four are in [gate-proofs.md](../../learning/gate-proofs.md), including the green arm.

## The defect the review caught, because it is the one to remember

Chapter 2's 異文 note reads 「不可」二字不见于底本，是整理者依十二行本等本子补入的. The round had added `lang="zh-Hant"` to 「不可」 in it — marking a textual criticism, and a reading the received text does not carry, as 通鑑's own words, while the key on the contents page says 繁体字都是《资治通鉴》自己的话. The gate passed it, because `corpusText.includes('不可')` is true: the two characters occur inside two unrelated corpus 句. **A substring test cannot tell a citation from a coincidence**, and no test can read what a note means. The mark is gone and `[data-note="textual"]` notes are exempt from the requirement — their marks are held by `test/lexicon.test.js`, the weaker check, which the header and the design of record both now say.

## Numbers that moved

- **Marked runs in the prose: 48 → 46.** Two left, and both are the review's finding: 「不可」's mark was removed, and the exempted 異文 note takes 「既已委質為臣」 out of the scan with it. The gate's diagnostic prints both numbers, and they agree because the marked runs and the prose quotations are now the same set — that agreement is the claim, not a check.
- **A marked run inside a margin note: 12.4 px → 13 px at a 390 px viewport.** `font-size: max(var(--zj-quoted-size), 0.8125rem)`. The reviewer's push-back was that the mark was dimming *and* shrinking the book's smallest prose at once; the floor is the fix, and it changes nothing at desktop, where 0.95 em of a 16 px note is 15.2 px.

## What a later session should not have to rediscover

- **A shared working tree makes the standing docs hard to commit honestly.** This round ran in a tree carrying another session's uncommitted work, including +735 lines in `docs/learning/gate-proofs.md`, +203 in `defect-register.md` and +6 in `docs/devlog/summary.md`. Appending to those files and running `git add` would have committed a stranger's half-finished round under this round's message. The three were staged **hunk by hunk through the index** — build the blob as `git show HEAD:<path>` plus this round's insertion, write it with `git hash-object -w --path <path> --stdin` through a `cmd /c` redirect (**not** a PowerShell pipe: the pipe re-encodes the text and the first attempt committed a whole file of mojibake with a BOM), then `git update-index --cacheinfo`. The working tree keeps both rounds' text; the commit carries one. The other session's files were never touched and are still uncommitted, as they were.
- **The remote `test` gate was already red on `main`.** `npm run shot` fails on three `biology/ch03` loads with `<rect> attribute width/height: A negative value is not valid` — the same failure the previous commit's run had, nine hours earlier, on a different three loads. The remote `pages` deploy is green. Read the job log (`gh api repos/…/actions/jobs/<id>/logs`) rather than assuming a red run is about the thing just pushed: this one was not.
