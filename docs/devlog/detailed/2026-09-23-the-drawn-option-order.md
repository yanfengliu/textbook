# Devlog — 2026-09-22 to 2026-09-23

Two sessions on branch `choice-order`, off `main` at `5e9c981`. The first, on the evening of 2026-09-22, drew Today's option order and gated it, then stopped at a usage limit before committing. The second, on 2026-09-23, found what that session had left, shuffled the chapter checks too, and landed both as `c5d676c` plus the commit that records the proofs. The shape of the two days: every place that relied on the written order of a question's options, found one at a time.

## The check half was dropped on purpose, and the notes left behind said it was done

**Timestamp:** 2026-09-23 09:20–09:40

**Action:** Read the worktree before the notes. `src/components/check.js` was unchanged, and the header of the new `src/components/choice-order.js` said why: seven check explanations name options by where they are written, so a drawn order would point those sentences at the wrong options. The first session had shuffled the checks, measured them, and put them back. Its unused commit message and its red-proof runner still described the shuffled version, including a `checkKey()` that no longer existed and an arm for it.

**Result:** The seven were biology chapter 4's q2, chapter 5's q1 to q5 and 通鑑 chapter 3's q-bianjie. The owners of chapters 4 and 5 were rewording those pages, so this branch reworded q-bianjie only, and added a rule to `npm run check` that fails the wording anywhere it can see it. Then the checks were shuffled for good.

**Reasoning:** The tree's headers were right and the notes were wrong, because the notes were written first and never updated. A worker picking up a half-finished branch reads the code and its headers before the handoff.

**Validation:** Before the change, the rule flags exactly the seven explanations and nothing else across 36 checks and 233 bank items. After the rewording, it flags the six on pages other workers own. Recorded in `docs/learning/gate-proofs.md`, *check: no multiple-choice question names an option by where it is written*.

**Notes:** The chapter 6, 7 and 8 pages on the branches under way when this landed use the same phrasings. Run over those branches read-only, the rule flags all fifteen of their check explanations, five a chapter, and none of the items in the chapter 6 and 7 banks. Each will fail `npm run check` once it meets this rule, and each needs the same rewording. Chapter 5's q4 also says "The last is wrong", which the rule cannot see, and so do chapter 7's q3 and chapter 8's q1, q3 and q5.

## A seed that leaves out the page passes the distribution bound

**Timestamp:** 2026-09-23 09:40–09:56

**Action:** Every chapter numbers its checks q1 to q5, so a check's order is seeded by its id and its page: the last two folders of the page's address, so the site at the root and under `/textbook/` draw the same order. The test was given two claims beyond the chi-square bound. Every page drawn again under `/textbook/` must show the same orders, and one eight-option check with the same id on two chapter pages must show two different orders.

**Result:** With the page left out of the seed, every chapter's q1 shares one order, and the chi-square over the 36 checks is 4.22 against a bar of 21.108. The distribution bound alone passes it. Only the two-page claim fails.

**Reasoning:** A distribution test sees where the correct option lands, not whether two questions share a draw. With the page left out, the correct options still land spread out, because each chapter wrote its answers in different places.

**Validation:** Five arms on `src/components/check.js`, each red, each failing only the checks test. The written order scores 32.00.

## `npm run flow` pressed chapter 1's options by position, and it cannot see a wrong `data-correct`

**Timestamp:** 2026-09-23 09:30–10:15

**Action:** The brief said flow already picked check options by `data-correct`. That held for the 通鑑 steps and not for the two biology steps, which pressed `nth(0)` on q1 and `nth(1)` on q2. Both now press by `data-correct`.

**Result:** With the old keyboard press put back, flow fails: `Enter on the correct option gave data-answered="wrong"`, because chapter 1's q2 now shows a wrong option second. With `data-correct` set by position in the component instead, flow passes all 42 steps. The component decides right and wrong from the same attribute flow presses by.

**Validation:** The unit test's claim that `data-correct` sits on the button showing the correct option's text is the only check of that attribute. `AGENTS.md`'s flow line says so.

## An answered check in `out/flow/` shows its marks on plain paper

**Timestamp:** 2026-09-23 10:02–10:08

**Action:** Looked at `out/flow/01` and `02`. The ✗ and ✓ were on the right options, and neither row had its tint.

**Result:** The screenshot is taken the instant after the press, while the tint is still in its CSS `transition`, and a hover can linger on the row that was clicked. A probe that moved the pointer off and waited 1.5 s read the settled `background-color` of every option on chapter 1's q1 and q2 and on 通鑑 q-bianjie, in both themes at 1440 and 390 px. The pressed distractor, the correct option and the rest were each the colour the stylesheet gives them.

**Reasoning:** Not a defect in the page. A later session reading those two frames would think it was.

**Notes:** Today's `.tb-opt` rows have no side padding, and their focus ring is drawn 2 px inside the row, so the ring covers the first stroke of the letter on the focused option (visible in `out/shots/today-desktop-light.png`). No stylesheet changed here and the order does not affect it; it is left for another change.

## Two numbers the first session wrote down, checked again

**Timestamp:** 2026-09-23 09:50

**Action:** Re-measured the length tell before repeating it. The correct option is the longest in 220 of 233 items, 216 of them strictly. Picking the longest option scores 93.2% with ties broken at random, and 94.4% if every tie counts as right. The first session's 93% is the first of these; the first commit's message says "about 94%", which is the second.

**Notes:** In Git Bash, `grep -c $'\r$'` reported every line of the two new LF files as ending in CR. `git ls-files --eol` and `tr -cd '\r' | wc -c` showed the truth: the tracked files are CRLF in the working tree, the two new files are LF, and every blob in the index is LF. The proofs hash working-tree bytes and name the commit, so they can be checked either way.
