# Project audit of 2026-09-23: bottleneck, completion, cost, blind spots, approach

Status: complete
Owner: The textbook coordinator of 2026-09-23 (integration owner); filed by its round-recorder worker
Created: 2026-09-23
Updated: 2026-09-23

Complete. This was a read-only audit of the book and of how it is being made. Six workers read the repository at base revision `5e9c981`, every branch and worktree, the project's session transcripts, the CI and Pages record and the live site, and no product file changed. The only changes the round made are this folder and three entries added to `docs/work/registry.json` (see Approach, "Allocation"). The coordinator's answers are under Outcome, and the six handoffs are filed verbatim in `reviews/`.

Decisions: the owner read the summary on 2026-09-23 and replied, in their words: "All reasonable. Make it known to the agents and persist this in docs." That accepted the recommendations in synthesis 5. Of the decisions that were pending here, one was not decided: whether to buy more usage, which stays the owner's own lever. The direction is written in `docs/policies/local-rules.md`, section "The usage allowance is the budget: the owner's direction of 2026-09-23", whose points are cited below, and `AGENTS.md`'s "What this is" names it in one paragraph. Where each decision landed:

- The figure cap, about four bespoke interactive figures a chapter with authored static SVG elsewhere, and the recipe rules it overrides: point 3. `docs/design/chapter-recipe.md` and `docs/design/figures-template.md` now say it in place of "six to nine figures" and "no static diagram".
- The compaction threshold near 250k tokens and a fresh coordinator for each round: point 2. The threshold, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` set to `25` in `.claude/settings.json`, lands on its own from branch `autocompact-setting` once the book's coordinator session has stopped. The section says why, and gives the documentation it rests on.
- Trimming `AGENTS.md` to its rules: point 9. The body of its Gates section moved word for word to `docs/policies/gates.md`, and `AGENTS.md` went from 58,591 to 36,493 bytes.
- Running one textbook session at a time: point 7.
- Whether to buy more usage: not decided. Point 1 records that extra usage is the owner's lever, not an agent's.
- Whether to park the Chinese edition: parked, point 8.
- The rest of synthesis 5 is points 1 and 4–6: the budget of about 40M weighted tokens a chapter, the accuracy review before a chapter ships, the study loop first when study work resumes, and the verification target, with `npm test` as the commit gate until a core gate exists.

The same day, the owner told the book's coordinator: "Reduce scope and stop at your current chapter's completion". That is chapter 6 only, then a stop. The round's plan records it (`docs/work/2_rest-of-the-book/plan.md`, "Where this round stands"), and point 10 points there. It overrides synthesis 5's one-week test, which wanted chapters 6–7 on main. Chapter 6 gets point 4's accuracy review before it lands. The chapter 4–5 reviews this audit found owed (F7, F28) stay open, and starting them waits on the owner.

Nothing else is open under this folder. Fixes for things the audit found — the answer order (`choice-order`) and chapter 5's errors (`fix-ch05`) — were another session's work, landed on main in `407827c`, and are not tracked here.

## Problem and outcome

On 2026-09-23 the owner asked the coordinator five questions: "What is the bottleneck? How complete is it compared to the full book? What is taking up tokens and time? Are we blind to anything? Is there a much better approach?"

The outcome wanted: an answer to each question that names the evidence it rests on and says which parts were measured, read or inferred; an independent check of the first answers before the synthesis relies on them; and the round kept in the repository on main, because the owner archives threads and anything outside main is lost (`AGENTS.md`: keep planning documents and every authored review round in a permanent `docs/work/<id>_<theme>/` folder).

## Scope

Included: the `textbook` repository at `5e9c981` and its whole Git history; every branch, worktree and stash as they stood during the round; the project's Claude Code session transcripts on this machine (125 of them, snapshot 2026-09-23 16:54Z); the GitHub Actions record of `ci.yml` and `pages.yml`; one full local run of `npm test` in a worker's own worktree; and the live site at https://yanfengliu.github.io/textbook/.

Excluded: any change to a product file, gate, test, tool or design document; fixing anything the audit found; the reader's study record, which does not exist yet (`progress/` holds 0 files in every checkout); and browser storage on the owner's own devices, which cannot be seen from this machine.

Another session's workers were working in the linked worktrees under `C:\Users\38909\Documents\worktrees\` and on the branches `fix-ch04`, `fix-ch05`, `choice-order`, `sort-layout`, `shot-repro`, `atp-ladder`, `ch06-07`, `items-ch06`, `items-ch07` and `ch08-dna` during the round. This round read them and changed none of them.

Ownership: the coordinator owns this plan, the synthesis, and the dispositions in each review file. Each worker owns its own report. The round-recorder worker filed the reports verbatim, wrote the sections the review format adds around them from the reports and the synthesis, added the registry entries, and landed the folder. It added nothing of its own to the findings except the labelled recorder's note under Outcome.

## Approach

Six read-only workers, all starting from base revision `5e9c981` (main and origin/main when the round began), each answered part of the question:

- `completion-audit` (round 0), on how complete the book is. It counted what is built against what is planned — chapters, words, figures, objectives, review items, glossary terms — on main and on every branch, worktree and the scratchpad; dated each landing from Git; projected the rest; and read the study system against its design.
- `cost-audit` (round 1), on where tokens and time go. It read 125 session transcripts (2 top-level sessions and 123 subagents, with the auditing session excluded and 6 subagents still running at the snapshot), weighted tokens by API price ratios, and split them by step, by agent class and by cause. It also timed tool calls and usage-limit lockouts.
- `gate-clock` (round 2), on what the gates cost in time. It ran all twelve steps of `npm test` on `5e9c981` in its own worktree (2026-09-23 16:42–17:22 UTC, Node v24.18.1, 32 logical CPUs) and read the CI and Pages history with `gh`.
- `blind-spots` (round 3), on what nothing checks. It read the gates, the defect register, the lessons and gate-proofs files, the review record and the process state (snapshot 10:03), and ranked the gaps by their consequence to the reader.
- `fresh-reader` (round 4), on what a reader meets. It read the live site on a Pixel 7 profile and at 1440×900, used figures through their own controls, measured cold and throttled loads, and judged 15 of the book's claims from its own knowledge.
- `approach-critic` (round 5), on whether there is a much better approach. It stated the goal from what it read, checked claims in rounds 0–3 with inline node, grep and gh, and recommended a change of approach.

The coordinator then wrote the synthesis under Outcome, with the critic's corrections applied.

Filing. Each handoff is one review round, `reviews/<round>_integration.md`, numbered 0–5 in the order the coordinator listed them. The numbers are a filing order, not a sequence of re-reviews; round 5 is the one that checked other rounds. `integration` is the nearest of the schema's five stages, because each worker read the integrated product at `5e9c981` and what surrounds it, not a plan, a design or a single change. The report text is verbatim, and the schema's other sections are added around it. Finding IDs run F0–F52 across the six files, and a finding that more than one round discusses keeps the ID it got first.

Allocation. `../fleet/scripts/work-docs.mjs` refused on 2026-09-23 (run from the fleet checkout, Node v24.18.1). `check` and `create --theme project-audit` both stopped with `Unexpected directory/file …\docs\work\5_provenance-mark; every unit folder must match one registry allocation.`, and `create` wrote nothing: the witness `.git/work-docs-state.json` still recorded only id 0, and the main checkout stayed clean. The checker is fail-fast, so that message names only the first problem, which is that `registry.json` listed 0–4 while folders 5 and 6 exist. Behind it, the tree predates the schema: `docs/policies/local-rules.md` ("The work-doc migration") measured 0 of the 9 older review files carrying the required sections, which is the refusal the 2026-09-19 devlog records. So this round took the next consecutive id, 7, after checking that no local branch, origin branch or worktree holds a folder 7. On the coordinator's instruction, it also added entries for 5, 6 and 7 to `registry.json` in the file's existing shape. That hand-edit is what `../fleet/docs/work-docs.md` and the local rule say not to do; it was done because the allocator cannot allocate on this tree until the migration round runs. The witness file was left as it was; it is still a prefix of the registry. After the edit the checker stops one step later, at the oldest unit: `…\docs\work\0_foundation-chapter-1/reviews/handoffs.md needs reviews/<round>_<plan|design|implementation|integration|legacy>.md.` The checker also compares every registry version in the history of all refs, so a checkout whose `registry.json` still lists only 0–4 will now be refused on that ground as well, until it takes main. That is the checker's guard against reusing an id.

Raw evidence. The workers' probes, logs and screenshots lived in the session scratchpad, `C:\Users\38909\AppData\Local\Temp\claude\C--Users-38909-Documents-github-textbook\df92f056-d26f-4e40-8f3d-bbc2ec013229\scratchpad\`, in the subfolders `completion-audit`, `cost-audit`, `gate-clock`, `blind-spots` and `fresh-reader`; the critic kept nothing there. None of it was promoted into Git: it is task-run evidence under the canon's rule, and it goes when the scratchpad does. The numbers in this folder are the workers' reports of that evidence, and the recorder re-ran none of them.

## Acceptance criteria

These were written after the fact, from the owner's question and the round's brief; the round had no separate list of acceptance criteria.

- Each of the five questions has an answer that names its evidence and tags it as measured, read or inferred. Met: Outcome, parts 1–5, and the reports in `reviews/`.
- The first four handoffs are checked by a worker that did not write them, and its corrections are applied before the synthesis relies on them. Met: round 5; the corrections are listed under Outcome.
- No product file changes. Met: the only files this round touched are this folder and `docs/work/registry.json`.
- `npm run unit` and `npm run check` pass on the recording tree. Met: see "Checks on this record" under Outcome.
- The round is on main and pushed, and no worktree or branch is left behind. Met when the commit that adds this folder is on origin/main and the recorder's worktree and branch are removed; the recorder's handoff to the coordinator reports both.

## Implementation steps

- Dispatch six read-only workers at `5e9c981` — coordinator. Done.
- Check claims in the first four handoffs — `approach-critic`. Done (round 5).
- Write the synthesis and choose what to put to the owner — coordinator. Done (Outcome).
- File the round here, add the registry entries, run `npm run unit` and `npm run check`, and land the folder on main — round-recorder worker. Done.

## Outcome

The coordinator's synthesis follows as it wrote it. Its part numbers are its own, and the review files cite them as "synthesis 1" to "synthesis 5" and "synthesis 4(a)" to "synthesis 4(g)".

**1. The bottleneck is the weekly usage allowance.** Limit lockouts were about 71–75% of the elapsed time since 2026-09-08: two weekly lockouts of 114 h and 133 h and four 5-hour ones. At the 2026-09-23 burn rate, a week's allowance buys about 8 hours of full-width work. Within that allowance, a chapter costs about 70M weighted tokens (estimate): figures cost about 5.2M each at eight a chapter, and context re-reading is 66% of all tokens. Gate wall time (36 min) is not the bottleneck; the clock is idle three-quarters of the time.

**2. Completion.** Biology: 5 of 32 planned chapters on main (16%), about 19% counting pushed branches — chapters 6–7's prose and partial item banks, chapter 8's prose — with 0 of their 24 briefed figures built. On main: 41 figures, 179 objectives, 537 review items. The observed pace of about 2.5 chapters a week puts the remaining 27 at 8–12 weeks (mid-December 2026) on the same budget. 資治通鑑: the prototype's declared 3 chapters are done; its own contents page lists 6; the 294 卷 are out of scope by design. Biology's Chinese edition: 0 of its 7 stages. Study system: built, never used — 0 recorded answers, 0 study rounds, and no export button to get a phone's record to the agent.

**3. Tokens and time.** At least 600M weighted tokens over 125 transcripts (a floor: 19 commits on 09-17 have no transcript). Cache re-reads are 66% (the average call re-reads 315k tokens; subagents never compact; the coordinator ran at about 530k a call). By step, verification is 52% (probe scripts 20%, gate runs 11%, screenshots 10%) against 15% for writing product. By agent class: figures 38%, prose and items 21%, site code 9%, gates and tools 13%, coordinator 11%. Agents killed by limits used 19%; re-dispatches 13%. AGENTS.md, about 20k tokens and doubled since 09-10, loads into 119 of 124 agents (5%). Time: the full local gate chain is 36 min (devices 26%, drive 24%, legible 18%) under 72–100% machine load from other sessions; every Bash call waits a median 9.2 s before it runs, about 10% of agent-hours.

**4. Blind spots, worst first.** (a) Nothing checks the biology is true: chapters 4–5 (52% of published prose) went live with their independent review owed, every independent read so far found must-fix errors, and a reader-proxy's sample flagged 7 of 15 claims (worst: §4.7's resting potential "between 20 and 200 mV" for an animal cell, and §5.3 explaining phosphate's charge spread as entropy) — unverified against sources. (b) The study record can be gamed: all 233 review-bank multiple-choice items put the correct option first (220 are also the longest option), and `npm run sitting` answers "the first option offered", so the gate has only ever recorded right answers; the fix is on unmerged `choice-order`. The 25 in-chapter checks lean the other way (18 B, 7 C). (c) CI has been red for 43 runs since 2026-09-11 and nothing noticed: 39 of the last 40 failed at shot on biology/ch03's negative `<rect>` (-0.5/-0.6) on Linux, the latest at drive (bilayer at 90 °C); CI cannot finish in 30 minutes even when green, installs only chromium while devices needs WebKit and Firefox, and pages.yml deploys every push regardless. (d) Figures can report a state they do not draw: bilayer's readout says "Bilayer · Tails inward, heads on both faces" over jumbled clumps (drive asserts describe(), not pixels); figure-task feedback shows raw variable names ("entropyOutside = 161.23, totalEverFell = false"). (e) The study loop cannot run: no export button; Today takes 15.9 s to its first question on a throttled phone because it loads each chapter's objectives, items and whole page in series; the end summary reports 163 ideas blocked after six answers. (f) Reader-visible: 11 figures never contrast-measured (legible's DEFERRED), the front page still says only chapter 1 is ready, a dead "Open chapter contents" button on phones, figure 1.4 traps vertical swipes, 通鑑's 今日 opens the biology study page, 通鑑's 初 translation contradicts its word card. (g) Process: pushed branches and worktrees hold unmerged work (chapters 6–8 prose, two banks, fixes); the devlog stops at 2026-09-19 and is not newest-first; no work folder since 2026-09-17; the coordinator's live status is not in the repo.

**5. A much better approach (the critic's recommendation, which the coordinator adopts as its advice).** Budget each chapter at about 40M weighted tokens, half of today's ~70M, paid for by cuts no reader sees: compact context near 250k instead of ~970k, start a fresh coordinator each round, cut AGENTS.md to its rules and move the long Gates section into a looked-up doc, never leave a large-context agent idle past the 5-minute cache, and run one textbook session at a time; and cap bespoke interactive figures at about four a chapter, each justified by what handling it teaches that prose cannot, with authored static SVG elsewhere. Spend about 5% of the saving on what the reader lacks: an accuracy review of each chapter against the matching OpenStax Biology 2e section before it ships, and a study loop that can run (merge choice-order; an export button on Today), after which the study rounds choose revision work. Restructure verification: a ~3-minute core on each commit, the full chain when a chapter lands, and a CI that fits and blocks the deploy — extrapolated to 32 chapters the full chain would take about 2.8 h per code commit. What it gives up: about half the bespoke figures and figure tasks, and the recipe's six-to-nine-figure and no-static-diagram rules — the owner's call. One-week test: chapters 6–7 on main with 8 or fewer figures between them, a review note and green CI, for 80M weighted or less; average context under ~150k a call; the weekly allowance lasting at least 11 working hours instead of ~7.8; at least 20 of the owner's own answers in progress/ and a first study-round note.

**Decisions pending with the owner:** the figure cap and the recipe rule it overrides; the compaction threshold and a fresh coordinator per round (harness settings); trimming AGENTS.md (high-risk per AGENTS.md, needs review); one textbook session at a time; whether to buy more usage; whether to park the Chinese edition.

**Corrections the critic made to the first four handoffs:** "every multiple-choice answer is A" holds for the 233 review-bank items, not the 25 in-chapter checks; "all 43 CI runs failed on the ch03 rect" is wrong (one failed the content check) while "39 of the last 40" holds; the lockout share is nearer 71% and the token total is a floor, because 19 commits on 09-17 have no transcript; the six-day figure stall is about one working day once lockouts are removed.

### Recorder's note

This is a labelled addition by the recorder, not part of the synthesis. Synthesis 4(a) says the reader-proxy "flagged 7 of 15 claims". The fresh-reader's report (round 4, F46) flags 8 claims and judges 7 correct, 15 in all; its first flagged item joins two claims, from §1.5 and §1.7, under one reason. The synthesis is left as the coordinator wrote it.

### Review files

- `reviews/0_integration.md` — `completion-audit`: how much of the book exists, and at what pace (F0–F9).
- `reviews/1_integration.md` — `cost-audit`: where the tokens and the hours went (F10–F21).
- `reviews/2_integration.md` — `gate-clock`: the local gate chain's clock, and the CI and Pages record (F22–F27).
- `reviews/3_integration.md` — `blind-spots`: what no gate or review sees, ranked by consequence to the reader (F28–F35).
- `reviews/4_integration.md` — `fresh-reader`: the live book read on a phone profile and a desktop (F36–F47).
- `reviews/5_integration.md` — `approach-critic`: the recommendation, and its checks of rounds 0–3 (F48–F52).

### Checks on this record

These ran in the recording worktree (`C:\Users\38909\Documents\worktrees\textbook-audit-record`, branch `audit-record`, based on `5e9c981`) on Node v24.18.1, after the last edit to any file here:

- `npm ci`: 2 packages added, 0 vulnerabilities.
- `npm run unit`: 217 of 217 tests pass. `test/control-chars.test.js` read 229 source files, the new ones among them, and found no C0 control character. `test/standing-docs.test.js` checks only the two standing records in `docs/learning/`, which this round did not touch.
- `npm run check`: 12 pages pass. It does not read `docs/`, so all this shows is that the round changed nothing the check reads.
- The fleet's own validator, run on this folder alone by a scratch script (`validateRegistry`, then `validatePlan` and `validateUnitFiles` from `../fleet/scripts/lib/work-docs-format.mjs`): the registry of 0–7 is valid, and the plan and the six review files pass. The tree-level `check` cannot vouch for this folder, because it stops at unit 0 first (Approach, "Allocation").
- Every file in this folder, and the registry, is UTF-8 with LF line endings, a final LF and no C0 control byte.
- The recorder compared the special characters in each Reports section — dashes, minus signs, ellipses, arrows, Han punctuation — with the handoff text in its brief, and every count matched. That catches a mangled character, not a mistyped word.
- No other gate ran. The change touches no product file, so the browser gates have nothing of it to see.

### Limitations

- The token total is a floor and the lockout share an estimate; the critic's corrections above say why.
- The accuracy flags in synthesis 4(a) are a reader-proxy's judgement from its own knowledge. Nobody checked them against a source in this round.
- The branches and worktrees moved during the round. Only the commits the reports name are pinned, and `2376226`, which round 3 calls unpushed, was on `origin/fix-ch05` by the time this record was written.
- The gate times are upper bounds, taken on a machine 72–100% busy with other sessions, and CI has never reached steps 6–12, so there is no remote time or verdict for them.
- Browser storage on the owner's devices was not visible, so "never used" means never used in any record this machine can see.
- This record had no independent review. It files reports that were already written, and it changes no product file, gate or design document.
