# 6 — the quality of the provenance mark

Status: **round 1 of 6** of goal `goal-08d2791b-cb69-400a-9ae2-9bdbb86da3dd`. Branch `provenance-quality` off `main` at `3d3be2c`, in the worktree `C:\Users\38909\Documents\github\textbook-wt-provenance` (clean; `node_modules` junctioned to the main checkout).

## Why this round exists

The mark landed in `6a8fd7d..3d3be2c` and was reported as done. The owner asked whether it was supreme quality. **It was not**, and the gaps are specific: the book's own visual acceptance ("1x, 2x and 3x, at 390 px and 1440 px, in both themes") had never been performed — five desktop-light frames were looked at, out of 24 the gates wrote; nothing measures prose, so "perfectly clear" was asserted rather than shown; the key is only on the contents page; the rule is weakest inside figures, inside textual notes, and for a quotation the book does not wrap in 「」; and the class the owner actually hit — a page making a false claim about its own provenance — is still ungated.

## What the acceptance found, by looking

Frames this round: `out/inspect-acc1/` (chapter 2's 背景 paragraph carrying the inline quotation, phone, dark), `out/inspect-acc2/` (chapter 2's margin note carrying 「損其戶數」, phone, light), `out/inspect-acc3/` (chapter 3's 註 carrying 「才有餘而德不足」, phone, dark), plus round 5's six desktop frames. Only the phone and dark shapes are new here; they are the ones the missing acceptance would have covered.

1. **The inline case is right.** In chapter 2's 背景 at 390 px in the dark theme the quotation of 「魏、韓、趙共廢晉靖公為家人而分其地。」 is visibly a step down in both size and ink against the book's own sentence. The mark works where the prose is at body weight.
2. **Inside a margin note the mark is a size step and nothing else.** `src/styles/layout.css:337-345` sets `.tb-margin-note` to `color: var(--ink-soft)` at `font-size: var(--text-base)`, and **neither media query re-sizes it** — a note is 1 rem at every viewport. The rule sets a marked run to `--ink-soft`, which is the note's own colour, so the only signal is 0.95em of 16px = **15.2px against 16px**. In `out/inspect-acc2/` and `out/inspect-acc3/` it is very hard to see, and this is the book's quietest prose — the place a reader most needs to know the words are not the book's. **Confirmed at 3x on a phone** (the acceptance round's own frame, `out/provaccept/zoom-note-phone-light-3x.png`, 1170x786 device pixels): 「損其戶數」 is Traditional where the note is Simplified, and its size is very slightly smaller — but the *only* signal a reader reliably gets is the script difference, which is exactly what the mark exists not to depend on. A reader who reads both scripts fluently has no mark at all in a note.
3. **The floor I added never binds, and the comment justifying it is false.** `tongjian/zj.css` says *"at 390 px the floor holds it at 13 px where 0.95em alone would give 12.4"*. A note is 1 rem at 390 px too, so 0.95em is 15.2px and 13px is never reached. That is a dead clause carrying an untrue measurement, in a stylesheet whose own rule is that every value carries its reason.
4. **A textual note loses its own signal.** `[data-note="textual"]` is painted `--zj-note-textual` (青) to say *this note is about the text*; the marked run inside one is repainted `--ink-soft` by the same selector, so the note's own statement is broken for the one run it is about. Chapter 2's 異文 note carries such a run (「既已委質為臣」).

So the mark is right in body prose and close to absent in the two quietest places on the page. That is the finding the acceptance existed to produce, and it could not have come from reading the CSS alone — it came from opening a frame at 390 px.

## The acceptance frame the round rests on

`out/inspect-leadacc/tongjian-ch02-phone-dark-3x-00-history-p-nth-of-type-8.png` and `…-01-history-aside-nth-of-type-1.png` — the lead's own frames, 390 px, dark theme, **3x**, taken through the `--scale` option this round added to `npm run inspect`. `…-01` holds **both cases in one image**, which is the whole argument:

- **The margin note** (top of the frame): 「損其戶數」 against the note's own 「是故意把户口报少」 — Traditional, and otherwise the same type. The note is `--ink-soft`, the mark is `--ink-soft`, so there is **no ink difference**; the only signal left is 0.95em of 16 px = **0.8 px**, and at 3x it is not a mark a reader can be told about.
- **The body paragraph** (below it): 「魏、韓、趙共廢晉靖公為家人而分其地。」 against the book's own sentence — a step down in **size and ink both**, unmistakable in the same frame.

So the device works where the surrounding prose is at full ink and disappears where it is not. That is finding 2 measured against finding 1 in one image, and it is what round 3 has to fix.

The body-prose half of the acceptance is now covered at 390 px and 1440 px, light and dark, 1x/2x/3x; the note half at 390 px light 1x/2x/3x and dark 3x; the figures at 390 px light 1x; the key at 1440 dark and 390 light, 1x/2x/3x (W2's set). What is still unlooked-at is thin: the 思考 section's marked run inside a question and inside a correct-answer option at 3x, and the desktop 3x note. Both are on round 4's list rather than assumed.

## Inside a figure, checked and found right (with one thing to know)

`out/inspect-acc5/` (figure 2.1 at 390 px) and `out/inspect-acc6/` (figure 1.1 at 390 px). Inside a figure the rule is not the CSS step — `tb-figure` is excluded from it, deliberately, because each figure styles its own stage. **It holds by two other devices, both visible at phone width**: the quotation is the only Traditional text in the panel, and it carries its citation on its own line — `《资治通鉴》卷一 · 系于前403年条内追叙` — which is the strongest provenance statement on any page. The figure's own sentences are Simplified.

One thing a reader of the narrow composition should know: `src/figures/zj-timeline.js:316` hides the legend at the strip tier (`[data-dense="1"]` at line 268 does the same), so at 390 px the statement that the 周纪年 and the 卷首岁名 are 通鑑's own text and that the 西元 and the 干支 were added later is **not** in the figure. It is not lost: the caption under the figure says the same thing in the same words (`图 2.1 周纪一的年表：通鉴书周之纪年，卷首以岁阴岁阳纪年，西元与干支为后人所加`), and the frame shows it. Recorded rather than fixed, because the caption is the figure's own answer and it is present.

## What is running in this round

- **W1** — `test/control-chars.test.js` asserts that `.git/` holds files; in a git worktree `.git` is a *file*, so **`npm run unit` cannot pass from a worktree at all**, while the fleet canon makes a worktree the default. That is why every session works in the shared tree, where one session's uncommitted edits mask another's results. W1 makes the check correct in both shapes without weakening it.
- **W2** — no instrument here can produce 2x or 3x frames of prose, so `tools/inspect.js` gains `--scale`, and then the acceptance set is captured and **measured** at 1x/2x/3x, 390 and 1440 px, both themes, for four subjects: the inline quotation, the margin-note run, a figure's quote block, and the key.
- **W3** — `tools/flow.js` is hardcoded to `biology/ch01`, so no gate presses anything on a `tongjian` page. W3 gives it the second book, because the round-5 change edited markup inside `<tb-check>` and `<tb-sort>` and nothing drove it.

## Round outcomes so far

**The review is in and it changed the round.** `reviews/2026-09-17-typographic-review.md` — five defects (three of which nobody knew about), each with a measured number: the mark **does not reach five runs at all** because `src/components/check.js` rebuilds `<tb-check>` options as buttons and the rule's container whitelist matches no ancestor (measured `matched=0`, 17 px, full ink); the `max()` floor's only live firing makes the mark a step **up** on ch03's citation line (13 px against 11.52 px) and its justifying measurement is false; a `data-note="textual"` run is repainted out of the note's 青; `tb-check .explain` and the contents-page dek have the same already-quiet-container defect as the margin note; and everything above that is about *paint* is invisible to `test/provenance.test.js`, which reads markup. Its recommended whole-class check — on the rendered page, every `[lang="zh-Hant"]` inside `.tb-text` outside the excluded regions must be matched by the rule and differ from its parent — is objective item (2) and goes in this round.

**The worktree's unit suite is green for the first time** — 160/160, verified by the lead, with `.git` handled as a file in `control-chars` and 44 entries / 44 index links in `standing-docs`.

**`standing-docs` paid for itself on its first run, and it has a consequence.** It found the `legible` entry's missing index line (born in `0806283`, three commits old, in the committed tree), which W5 then added. It also reports what the **main tree** looks like right now: **16 gate-proofs entries and 2 defect-register entries carry no index line** — the other session's in-flight additions, plus main's own copy of the `legible` omission. So **the moment this round merges, `npm run unit` in the shared tree goes red** until those lines exist. That is the gate doing its job on someone else's uncommitted work, and it must be reported clearly rather than mistaken for breakage: the worktree is green, the shared tree is red for entries that were never indexed.

**`flow` went red on its first run too**, on one page: `sort-place-by-drag [tongjian/ch02]` — the dragged card does not land in the bin it was dropped on, while ch03's same step passes. W3 has been asked to establish by measurement whether that is the step's own sequencing (it runs after the button step on the same load) or a real product defect, and told not to soften the assertion to get green.

**W5's own first proof attempt was a no-op that read as a pass** — the mutation pattern contained `[...]`, a character class in the regular expression it built, which is the same trap that dropped this round's original index line. It caught it by hashing the artifact before and after every arm. Worth keeping: the gate that exists because of that trap found the trap twice.

## Drafted for the next round

- Give a 通鑑 quotation inside a margin note a treatment that works there — the note is already the soft ink, so the direction available is full ink — and stop repainting a textual note's run out of the note's own colour.
- Delete the 13 px floor with its false comment, or restate it honestly and give it a case that binds.
- Put the independent typographic review on W2's measured frames, and let its verdict decide whether 15.2/16 px is a mark at all.
- Land the round: merge to main, push, and record the proof in `docs/learning/gate-proofs.md` (staged hunk by hunk — the three standing docs are dirty in the main checkout with another session's round).
