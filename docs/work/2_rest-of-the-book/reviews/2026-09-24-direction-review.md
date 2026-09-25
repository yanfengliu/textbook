# Review — the owner's direction of 2026-09-24 in AGENTS.md and local-rules.md

Reviewer: a fresh read-only subagent, spawned by the `land-4` worker on 2026-09-24 with a fixed brief. Both files are on the locally high-risk list. The external review lanes were down (see Review under Open in [plan.md](../plan.md)), so this is the independent review, and it is one agent, not a panel. It edited nothing.

Target: the uncommitted diff of `AGENTS.md` and `docs/policies/local-rules.md` on `land-4` at `1932848`, saved before review as `diff.patch`, sha256 `18ceecc88afbd2b14fe4cbe48e0036e59d9aa2db233c535ab8bb7c47421a4b0e`. The reviewer confirmed it was byte-identical to the live `git diff`. The diff replaces point 10, "Stop after chapter 6", with "Publish what is written, and start nothing new", after the owner's answer of 2026-09-24: *"If chapters are written then of course publish them."*

Read beyond the diff: `local-rules.md` lines 1–90, `AGENTS.md` lines 1–20, 69 and 76, the top section of this round's `plan.md` (lines 1–141 only), three lines of `docs/work/7_project-audit/plan.md`, and chapters 6–8's `index.html` for their figure counts.

## Verdict

**Changes needed:** one must-fix, two should-fixes, seven nits.

| Criterion | Result |
|---|---|
| 1. `AGENTS.md`:13 and point 10 agree, and read as standing rules | pass |
| 2. Every claim and date is true | fail on one claim (finding 1). The quote matches; the dates of chapter 7's prose (`9e2b95a`, 2026-09-22), chapter 8's (`1f38955`, 2026-09-22) and chapter 6's landing (`5775bda`, 2026-09-23) are right; no `biology/ch09` or later exists on any ref; chapters 7 and 8 each have 4 figures |
| 3. The heading and its anchor are unchanged, and every link to it resolves | pass |
| 4. `AGENTS.md` changes only line 13, outside the canon block (lines 15–69) | pass |
| 5. No other live document still states the old stop | pass, except `local-rules.md`:62 (finding 2) |
| 6. The wording follows R25 | mostly pass; the nits below |

## Findings and what was done

| # | Severity | Where | Finding | Done |
|---|---|---|---|---|
| 1 | must-fix | `local-rules.md`:72 | "where chapters 7 and 8 stand, is recorded at the top of plan.md" was false: the plan's live section still said they "stay unpublished" and "Nothing is dispatched", with both chapters "held" and the status "complete" | Applied the way the reviewer preferred: the plan's live section was updated for chapters 7 and 8 in `1d82922`, the commit before this one, so the sentence is true at the commit that makes it |
| 2 | should-fix | `local-rules.md`:62 | "Point 10 overrides synthesis 5's one-week test, which wanted chapters 6–7 on main" was true only of the old stop | Applied, in the reviewer's words: "Point 10 as first given overrode … Its 2026-09-24 amendment publishes chapter 7 too." |
| 3 | should-fix | `local-rules.md`:72 | "The coordinator set their scope" can read as the owner's scope | Applied: "set the two chapters' scope" |
| 4 | nit | `local-rules.md`:72 and :45 | "The answer covers written chapters only" gives the coordinator's reading as the owner's words; :45's "as they amended it" has the same slant | Applied at :72 in the reviewer's words. At :45 the sentence is now two: the owner's answer lifted the stop for the chapters already written, and the coordinator set their scope. That wording is the worker's, not the reviewer's |
| 5 | nit | `local-rules.md`:72 | one sentence carried two ideas | Split, as the reviewer wrote it |
| 6 | nit | `AGENTS.md`:13 | "they are published" reads as already live | Applied: "they ship" |
| 7 | nit | `AGENTS.md`:13 | "and no other new work" had no verb | Applied: "and other new work waits", matching point 10 |
| 8 | nit | `local-rules.md`:67 | "all new work except publishing chapters 7 and 8" counts publishing as new work | Applied: "like all other new work (point 10)" |
| 9 | nit | `local-rules.md`:10 | "with nothing started after them" was unclear and left out other new work | Applied: "chapters 7 and 8 published, and nothing new started" |
| 10 | nit | `local-rules.md`:56 | "no new gates" is now a standing local rule, and line 3 says a local rule may make a canon rule stricter, never weaker; R17 wants a check for each class of defect the owner reports | **Not applied; left for the coordinator and the owner.** "No new gates" was the owner's own scope for chapter 6 (plan.md, and the open note on chapter 5's NAD⁺ card, which has no gate "under the owner's 'no new gates'"). Whether it yields to R17 is their decision, not a wording fix |

Nothing was re-reviewed after the fixes. Findings 2 to 9 use the reviewer's suggested text, except finding 4 at :45. That sentence and the plan's new live section (finding 1) are the worker's wording, and no one has reviewed them.

Later on 2026-09-24 the coordinator decided finding 10: a local rule may not weaken the canon (R13). Point 10 now makes a defect the owner reports an exception to "no new gates", so the check for its class that R17 requires still lands, and the point's evidence says why. That change is a commit of its own. The final landing's independent review covers it, and no one has reviewed it before then.
