# Adaptive study: tracking mastery and reorganising practice

Status: complete
Owner: Integration owner (textbook session, 2026-09-10)
Created: 2026-09-10
Updated: 2026-09-10

## Problem and outcome

The owner wants the book to know what they have learned well and what they are struggling with, to organise the content and the quizzes around that, and to have the agent review their progress in rounds.

Outcome: a reader studies from a **Today** page whose queue is chosen from their own history; every question is tied to a learning objective rather than a chapter; the chapter annotates itself with what is shaky without ever hiding prose; a local command reports what the record says; and an agent round reads that report, diagnoses the misconceptions behind it, writes new questions and explanations against them, and lands the result as a reviewable commit.

The design and its reasoning are in [docs/design/adaptive.md](../../design/adaptive.md), which is the design of record for this feature.

## Scope

Included:

- The objective model: 33 objectives for chapter 1 with a prerequisite graph, and every in-prose question tagged with the objective it tests.
- A review item bank of about 99 items, three per objective, mixing multiple choice, figure tasks and free response, with a stated misconception behind every distractor.
- The learning core: an append-only event log, browser-local persistence plus a local dev-server endpoint, a pure FSRS-style scheduler, and the mastery model with its flags.
- The surfaces: a Today page with a cold-start calibration, a `<tb-task>` figure-question type, and quiet mastery markers on the chapter.
- The instruments and gates: `npm run review`, extensions to `npm run check` for the objective graph and the item bank, and unit tests for the scheduler, the store and the new checks.
- The agent round: a repo command, a note format, and the rule for when a round is worth running.

Excluded, deliberately:

- Any cloud service, account, or cross-device sync. The record is local; `progress/` is git-ignored, and export and import are how a phone's history reaches the agent.
- Unattended scheduling. The fleet's standing rule is that nothing here runs unattended, so the round is a command; turning it into a scheduled task is a separate decision for the owner.
- Objectives for chapters 2 onward, which do not exist yet.
- Any change that hides, locks or gates prose. Stated as a non-goal in the design because it is the tempting wrong turn.

## Approach

Three layers that stay separate: evidence in the browser, a pure scheduler that needs no agent, and an agent round that does only what arithmetic cannot. The design document argues why conflating the last two is the mistake.

Delegation: six workers in parallel on disjoint files, against contracts fixed before they started. Learning core (the API and the scheduler), study surfaces (Today, `<tb-task>`, markers), item bank, figure polish, style polish, and Pages deployment. The integration owner wrote the objective graph, tagged the chapter, extended the content gate, and integrates.

## Acceptance criteria

- [x] `docs/design/adaptive.md` states the layering, the data model, the flags, the cadence rule, and the non-goals, and `docs/design/textbook.md` points at it.
- [x] Chapter 1 declares 33 objectives with a valid prerequisite graph, and every in-prose question and the sort activity name the objective they test.
- [x] The item bank has 99 items, three per objective (49 multiple choice, 23 figure tasks, 27 free response), 147 distractors each carrying the misconception it encodes, every figure task verified against a field the figure really reports. At least three items per objective, every distractor carries the misconception it encodes, and every figure task grades against a field the figure really reports.
- [x] `npm run check` fails on: an unknown or missing objective on a question, an unresolvable prerequisite, a cycle, an objective taught by a section or figure that does not exist, fewer than three items for an objective, a distractor with no reason, and a task with nothing to grade against. Each proved red in `test/chapter-data.test.js`.
- [x] The scheduler is pure and deterministic, and its tests assert the properties rather than the constants.
- [x] A reader can complete a sitting on the Today page with the keyboard alone, in both themes, at 390 and 1440 px, and the events reach both localStorage and `progress/<learner>.jsonl` when the dev server is running.
- [x] With no history, the first visit offers a calibration rather than a queue of everything.
- [x] `npm run review` reports state, flags and the distractor histogram, and calls no model.
- [x] The chapter annotates itself with mastery, and no prose is ever hidden or locked.
- [x] `npm test` is green on the final tree, and the new gates have recorded red runs in `docs/learning/gate-proofs.md`.
- [x] The site is published on GitHub Pages and the published chapter works, with the study system degrading to localStorage where there is no server.
- [x] Devlog written; the work is merged to main and pushed.

## Implementation steps

- [x] Design of record, and this plan.
- [x] Objective graph for chapter 1; chapter questions tagged; `progress/` ignored; npm scripts registered.
- [x] Content gate extended for the objective graph and the item bank, with 17 red-proof tests.
- [x] Learning core: scheduler, store, objectives registry, the dev-server endpoint, `npm run review`.
- [x] Surfaces: Today page, `<tb-task>`, mastery markers, `learning.css`.
- [x] Item bank: about 99 items across the 33 objectives.
- [x] Figure polish: phone layouts for the four SVG figures, and the five open defects from round 0.
- [x] Style polish: rhythm, type detail, dark mode, contrast, print.
- [x] GitHub Pages: workflow, subpath correctness, enablement.
- [x] The agent round: the repo command and the note format are in place. The first round note waits on the owner having a record to read, which is correct: a round with nothing to read produces a confident note about noise.
- [x] Integration: mount everything, run the gates, look at the frames, fix, re-run.
- [ ] Independent review of the integrated change; disposition; re-check.  **Not obtained this round.** The six workers reviewed each other's seams in practice and found four real defects that way, and every gate has a recorded red run, but no separate read-only review of the combined change was run. Stated rather than implied.
- [x] AGENTS.md gates and invariants updated; devlog; commit; push; verify the deployment.

## Outcome

Done, 2026-09-10, except the independent review noted above.

`npm test` is green on all eight steps on the final tree: 83 unit tests, 4 pages checked, 24 page loads, 7 reader flows, 38 figure-control steps, 4 keyboard-only sittings, 30 sweep frames, 20 subpath loads under `/textbook/`. `npm audit` reports 0 vulnerabilities.

Verified by the integration owner against the integrated tree rather than from worker summaries: a whole sitting driven with the keyboard in both themes at two widths, the mastery threshold probed directly against the store, the Today page and the chapter at phone and desktop in both themes, the four rebuilt phone figure layouts, and the published tree served under its real subpath.

Four integration defects were found and fixed during this round, each in the seam between two modules that were individually correct, and each is recorded with a gate in `docs/learning/gate-proofs.md`: the keyed card map read as an array at three call sites, the page claiming "Learned well" where the store said otherwise, the helix pick step that had never proved anything, and the subpath gate mirroring the reader's private record.

A second round of integration followed the last two handoffs: the figure worker rebuilt five phone layouts and reported that none of them was covered by any gate, so `npm run narrow` was written and proved red; the sweep's blank-frame bound was widened off a one-pixel layout dependency it had been sitting on; and the Today link's due count, which had no style at all and rendered as "Today3", was made a proper mark.

Left as known: the cut-open cell still raycasts its clipped-away membrane, so a click at most points selects a surface the reader cannot see; the drive harness hovers at absolute coordinates and is now scrolled into view first, which removes the class but not the dependence on layout; a three-column table of prose at 390px is readable but tall; and the library page's disabled book card sits at about 3.3:1, exempt under WCAG as an inactive component but the one piece of text that would fail if it became active.
