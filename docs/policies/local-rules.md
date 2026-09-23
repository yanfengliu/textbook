# Local rules (textbook)

These bind alongside the fleet constitution in [AGENTS.md](../../AGENTS.md) and win where they overlap. They may make a canon rule stricter, never weaker.

Unlike the two files under `docs/learning/`, **this one is read.** Ten rules, and the list below is all ten in a line each — enough to know whether a rule applies to what you are doing. Open the section when one does. Each section states the rule first and then what it was learned from, so the first paragraph is the binding part and the rest is the evidence.

| Rule | Applies when |
|---|---|
| [Typography and visual design are the product](#typography-and-visual-design-are-the-product) | always. A chapter that is written, correct, gated and ordinary-looking is **not done** |
| [A check must fail when its subject is missing, and must not depend on being remembered](#a-check-must-fail-when-its-subject-is-missing-and-must-not-depend-on-being-remembered) | you are writing or changing a check, a list of pages, or a census floor |
| [Running the gates in this environment](#running-the-gates-in-this-environment) | a gate goes red, or a command touches UTF-8 prose, or a browser gate runs long |
| [Prove a gate red on a file no running worker owns](#prove-a-gate-red-on-a-file-no-running-worker-owns) | you are about to mutate a file to prove a gate |
| [Line endings on this machine](#line-endings-on-this-machine) | you are asking what a file's line endings are, or whether an edit changed content |
| [A round works in its own worktree, and a number names the tree it came from](#a-round-works-in-its-own-worktree-and-a-number-names-the-tree-it-came-from) | you are starting a round, staging a commit, running an A/B, or allocating a work-doc id |
| [A stated measure names its instrument, its population and its width](#a-stated-measure-names-its-instrument-its-population-and-its-width) | you are about to write a number into a doc, a plan or a comment |
| [A file a tool refuses to read is a defect in the tree](#a-file-a-tool-refuses-to-read-is-a-defect-in-the-tree) | a tool calls a text file binary, or you are writing a control character or a log |
| [Write the assignment so its answer can be checked](#write-the-assignment-so-its-answer-can-be-checked) | you are briefing a worker or a reviewer for a verdict |
| [A wait in a gate must poll the artefact, never the wall clock](#a-wait-in-a-gate-must-poll-the-artefact-never-the-wall-clock) | you are writing a drive recipe or any wait in a gate |

## Typography and visual design are the product

Owner directive, 2026-09-10, in their words: *"The textbooks should have the best typography and visual design. If anything is less than supreme quality then don't even bother."*

This is a standing bar, not a preference, and it outranks throughput. A chapter that is written, correct, gated and ordinary-looking is **not done**. Ship fewer chapters at this bar rather than more below it.

What it means in practice, so it is a rule and not a sentiment:

- **A page is finished when a typographer would not change anything.** Not when it passes the gates. The gates prove nothing about quality: `npm run shot` proves a page loaded, `npm run devices` proves nothing is off screen, and a page can pass every one of them and still be dead on the page. Every gate here says so in its own header.
- **Look at the real thing at real size before calling anything done.** At the artefact's own resolution, in both themes, at the sizes a reader actually uses. A thumbnail, a contact sheet or a scaled-down full-page capture answers "is it there", never "is it right".
- **Defaults are not design.** A browser default, a first guess at a size, a border that exists because a box needed separating: each is a decision not yet made. Name the reason or remove it.
- **Every measurement is deliberate.** Sizes come from the modular scale, space from the baseline grid, colour from the tokens, and the measure from one length. A one-off value needs a stated reason in the same commit.
- **Detail that only shows at 3x still counts.** Optical sizes, the drop cap's baseline, hung punctuation, old-style against lining figures, tracking on small caps, the weight of a hairline in dark mode. These are the difference between a page that reads well and a page that reads like a template.
- **Nothing ships with a known visual defect and a note about it.** Either it is fixed or the thing is not done. "Known limitation" is for what cannot be done, not for what was not done.

The gates protect against regression and cannot produce quality. Quality comes from somebody looking, at full size, and being honest about what they see.

## A check must fail when its subject is missing, and must not depend on being remembered

Found on 2026-09-11, four times in one integration. Every instance was green and checking nothing:

- `tools/check-content.js` required three review items per objective inside `if (items.length) { … }`. A chapter with 35 objectives and **no item bank at all** skipped the loop and passed, because zero is not less than three when the loop never runs.
- The page list the gates visit was maintained by hand in `tools/lib/browser.js` and again in `tools/subpath.js`. Chapters 2 and 3 existed on disk and no page gate had ever loaded them.
- `npm run devices` — written in answer to four defects the owner found on a real phone — was runnable but was not one of the steps `npm test` runs, so it ran only when someone remembered it.
- `src/components/figure.js` spread a figure's own `describe()` **after** the frame's four identity fields, so a figure reporting `state` replaced the frame's. Nothing checked the shape of `describe()` at all, and under the defect every recipe step still passed.

So, in this repo:

- **Key a rule on the thing that makes it required, never on the thing it inspects.** "Every objective has three items" is keyed on objectives. Guarding it on `items` made the empty case — the only case that matters — the case it skipped.
- **A table that already counts its subject enforces the count, not its presence.** `tools/shot.js`'s `HOOK_CENSUS` carried the per-page count of every colour mark and the check asked only that one existed, so a chapter losing three of four marked years passed the check written for exactly that loss. It now fails `found < floor`, and every clean line prints the count it compared (`census date 6/4, …`), so a floor is a number the next reader can check. Re-measure a floor in the same commit as the page it counts, because a floor set earlier passes the very partial loss it was written for: chapter 2's `[data-date]` floor still says 4 while the shipped page carries 6, so two of its six marked years can go silently (`out/censusproof/arm0-baseline.log`).
- **Derive a list from the tree, do not maintain one.** Chapters, figure kinds and pages are discovered. A list a person has to extend is a list that will be wrong the first time someone is in a hurry.
- **Derivation needs its own check, derived a second way.** Discovery that quietly finds nothing is worse than the hand-list it replaced, because the gates stay green over a shrinking site. `test/pages.test.js` walks the tree independently of `discoverBooks()`, requires the two to agree, and asserts its own walk found something — so it cannot pass by finding nothing twice.
- **A gate that is not in `npm test` is not a gate.** If it is worth writing it is worth running every time. If it is too slow to run every time, that is a statement about the gate, to be fixed or argued for in its header.
- **Prove a new check red on the real defect where you can, and by mutation where you cannot.** Both go in `docs/learning/gate-proofs.md` with the exact failing text. A proof written from what the failure *would* say is not a proof.

## Running the gates in this environment

Found 2026-09-12, while adding the second book. Two environment facts that both read as code failures, recorded here because a command's exit status is a claim about the command:

- **`node --test "test/*.test.js"` cannot run under this session's process policy.** The Node test runner spawns one child process per file, the sandbox refuses it, and every file reports `Error: spawn EPERM` — which looks like the whole suite failing at once. `node --test --experimental-test-isolation=none <files>` runs the same tests in one process and passes. Use it, and do not read the EPERM run as a red suite. `npm test`'s first step is therefore unrunnable here as written, which is an environment fact and not a defect in `tools/test.js`.
- **A chromium crash puts a modal dialog on the desktop and leaves it there.** `chrome-headless-shell.exe - Application Error / The exception Breakpoint (0x80000003)` is raised by the browser process, so it outlives the gate, blocks the desktop, and looks like the gate misbehaving. Preload `NODE_OPTIONS=--require=./tools/zj-quiet-browser.cjs` before running a browser gate: it adds `--noerrdialogs --disable-crash-reporter --disable-features=Crashpad` to every launch, appended to the gate's own flags. `test/browser-quiet.test.js` holds that it does, by reading the running browser's own command line.
- **Never read or write UTF-8 prose through PowerShell's text cmdlets on this machine.** Both directions are lossy, and both fail silently. `Get-Content` decodes with the console code page (cp936 here), so a run of Chinese comes back as mojibake and a `Select-String` on it matches nothing — a search that finds nothing and reports it as "no match". A `(Get-Content …) -replace … | Set-Content` round trip is worse: it re-encodes what it decoded, and any byte the code page could not represent becomes U+FFFD, which is not reversible. One worker lost a chapter page this way and had to rewrite it from their own draft. **Use the editor tools for text, or `[System.IO.File]::ReadAllText(…, [Text.Encoding]::UTF8)` when a script genuinely has to touch it.** The corpus test is the backstop for the book's 原文 — it compares each page against the corpus character for character — but it cannot protect a file no test reads.
- **Playwright cannot launch while another session holds the same browsers, and a heavy gate can exceed the foreground timeout.** `npm run devices` over the new book ran past the 600 s foreground limit, so run the long gates as background jobs and read them when they settle.

Both are recorded with their measurements in [../learning/defect-register.md](../learning/defect-register.md).

## Prove a gate red on a file no running worker owns

Found 2026-09-11. Proving the widened device gate meant inserting a 2000 px block into `index.html`, running the gate, and taking it out again. A worker was rewriting that same file at the time. The revert re-read the file, so nothing was lost, but the window between read and write was a real chance to silently discard someone else's work — and the file looked idle because the coordinator had not touched it.

So: before mutating a file to prove a gate, check `git status` and the live assignment list for who owns it. Prefer mutating a file you own, or one in a directory no worker was given. Where the defect can only be reproduced in a worker's file, wait for the handoff — a gate proof is never urgent enough to race a writer.

## Line endings on this machine

`core.autocrlf=true` here, so the index holds LF and working copies are CRLF unless a tool wrote them LF. Two consequences that have each cost a session:

- **Git Bash's `grep`, `cat` and `sed` translate CRLF on read**, so `grep -q $'
' file` reports "no CR" on a CRLF file. The honest instrument for what a file's line endings are is `git ls-files --eol <file>`; the honest instrument for whether an edit changed content is `git diff`, which ignores the CRLF/LF difference under this setting.
- **A script that joins lines with `
` and writes a CRLF file leaves a mixed file.** Read with the same newline handling you write with (`io.open(..., newline='')` in Python preserves whatever is there), or edit through the Edit tool, which preserves the file's own endings. A mixed file is not a commit problem (the index normalises) but it is a diff-noise problem for the next reader and it has made a "did my edit change only the line I meant?" check fail for the wrong reason.

## A round works in its own worktree, and a number names the tree it came from

Found 2026-09-19, with two other sessions editing this tree at the same time. The first version of this section read the constitution's fallback as this repository's policy and said **this repository serialises**; that was wrong. A session or agent doing anything beyond a trivial read works in its own worktree by default, because two sessions in one tree invalidate each other's comparisons, gates, and commits. Finishing a worktree means merging its branch to main and pushing, in the same session, and removing it with `git worktree remove` once merged — a worktree still on disk after its work has landed is a defect to report, not housekeeping to defer. A worktree needs its own `npm ci` before `npm test` can run there, and writes its own `out/`.

The one thing here that genuinely must be serialised is the work-doc ID allocation, not the working tree. `docs/work/registry.json` is a plain JSON file and no allocator lives in this repository; the allocator is `../fleet/scripts/work-docs.mjs`, and it is built for worktrees: it resolves the primary checkout through Git's common directory, takes its lock there and records the allocation there, so a session in a worktree allocates in the primary checkout and two worktrees cannot take the same ID (`../fleet/scripts/test/work-docs.test.mjs`, "actual concurrent linked-worktree calls allocate in primary checkout without duplicate IDs" — a primary and a linked worktree allocating at once came back 0, 1, 2, and the worktree got no `docs/work` of its own). Allocate through it — `node scripts/work-docs.mjs create --repo <this worktree> --theme <theme>` from the fleet checkout — rather than editing the registry by hand.

So, in this repo:

- **One writer per file, and the assignment names the files.** Holding a file against a gate proof is already a rule here: [Prove a gate red on a file no running worker owns](#prove-a-gate-red-on-a-file-no-running-worker-owns).
- **A measurement names the tree it was taken on, and an A/B proves the tree held still.** Bracket a run with the sha256 of every file it depends on and throw the run away if a hash moved. `out/remeasure/probe-prose-han.mjs` brackets all fifteen of its loads with `zj.css`, `tokens.css` and `components.css`, and every load it kept says `same: true`. Where the change can be made in the live DOM rather than in a file, do that, so the two arms differ by the variable alone.
- **A gate that empties its own output directory makes one run's frames unusable as another run's evidence.** `npm run shot` deletes `out/shots/` before the first frame is written, so on 2026-09-16 a second run deleted the 24 acceptance frames of a green run before anybody could look at them, and only the log survived — no exit status showed it. Give the second run a directory of its own (`SHOT_LABEL=<name>` writes `out/shots-<name>/`, the shape `tools/inspect.js --label` already had), and copy out anything a verdict rests on as soon as it exists.
- **Stage paths explicitly, and never `git add -A`.** `e400821` staged its own 35 paths by name and left the other sessions' work unstaged; a run that stages everything commits another session's half-written chapter under this round's message. Read `git status --porcelain` before and after the commit.
- **A repository-wide red gate is not a reading of your own work.** Another session's half-written chapter leaves the shared gates red for everybody: `unit`, `check` and `subpath` were red on `e400821` for that reason, and three of the thirty-six registered figure kinds still have no module on disk (`bulk-transport`, `osmometer`, `permeability`). Record a baseline before starting, run the gate scoped to the pages you own, and have the tool print the scope rather than assert it — `tools/devices.js` says on every line whether the paired book's width floor applied, and names which of the three reasons stopped it when it did not.

### The work-doc migration, which is a round of its own — evidence, not a rule

The allocator refuses today, and the refusal has nothing to do with trees: the tree predates the schema. That was first recorded here as one file's misnamed review, `docs/work/0_foundation-chapter-1/reviews/handoffs.md`; that diagnosis was wrong, and renaming that one file changes the complaint without changing the verdict. What was measured on 2026-09-20: the name pattern and the section template are enforced together, so every review file must carry six nonempty sections — `Target`, `Reviewers and coverage`, `Reports`, `Findings and disposition`, `Verification`, `Round outcome` — and **0 of the 9 review files under `docs/work/` has any of the first two**. Round 2's six reviews are non-conforming in name as well (`<YYYY-MM-DD>-<subject>.md`, where the schema wants `<round>_<kind>.md`), and round 4's `contracts.md` and `restructure.md` sit at the unit root in a shape the schema has no slot for — a frozen interface document and a design record, neither of which is a review. So the migration is roughly ten files over four allocations, each needing a per-file decision, and it is a round of its own with its own owner; a rename while the bytes still fail the template is the same non-fix at nine times the churn. Do not read the scope off the checker's message: it is fail-fast, so it names one file at a time, and the list above came from reading `work-docs-format.mjs` and inspecting every file against it, not from a run that reported all of them.

Two gaps in the tool, both measured. The sanctioned exemption for a historical file is a `legacyFiles` entry in this allocation's `registry.json` — exact bytes, so the record is preserved rather than restyled — but only `importWorkUnit` in `../fleet/scripts/lib/work-docs-store.mjs` can write it, and `work-docs.mjs` exposes only `create`, `check` and `recover`; the only route left is hand-editing the registry, which is the thing this paragraph forbids, so that is a door missing from the schema rather than a window to climb through. And no subcommand has a `--dry-run`.

One thing left open rather than concluded: `.git/work-docs-state.json` in the primary checkout records a single allocation where `registry.json` records five. It is a prefix of the registry, so the witness check passes and nothing is blocked today, but which of the two is right was not determined, and it is worth understanding before the first real allocation through the tool.

## A stated measure names its instrument, its population and its width

Found 2026-09-19. One paragraph of this book's record carried three different line lengths in a single evening, and each was believed downstream: **43.1** characters a line, a figure derived from a column width and an assumed advance on an earlier state of the ladder; **52–56**, which is a count of every non-space glyph where the band is stated in Han characters, the same lines holding **45**; and the measured answer, **36 Han characters on chapter 1 and 35 on chapters 2 and 3** (`out/remeasure/README.md`). The counter was believed because it moved with the thing it claimed to read: 32/31/31 under a 43.6 rem cap, 36/35/35 at the shipped 50 rem, 46/45/44 with the cap removed.

So a number in a design record, a plan or a comment names three things, or it is not a measurement yet:

- the **instrument** that took it, down to which counter in which file — `out/widthgate/probe-prose.mjs` counts every non-space glyph, `out/remeasure/probe-prose-han.mjs` counts Han alone;
- the **population** it was taken over, including what was left out — every full line of every prose paragraph, each paragraph's last line dropped, then that paragraph's median;
- the **width** it was taken at, because a line length is a function of the width, and that five widths agree here is part of the evidence rather than a detail.

This cannot become a gate, and saying so is the point. A comment that names its instrument is still a comment; whether the instrument is the right one for the claim is a question for a person reading it.

**`Measure-Object -Line` counts non-blank lines, and it is the instrument a reader reaches for first.** Found 2026-09-20, when a count in `docs/policies/local-rules.md` was nearly corrected from a true number to a false one: the check `test/control-chars.test.js` is **412 lines**, and `Get-Content <file> | Measure-Object -Line` reports **379**. Both numbers are real and they are different populations — 412 raw newlines, 412 objects from `Measure-Object` without `-Line`, 379 lines with any content on them, because that file holds **33 blank lines**. Nothing in the output says which population was counted, so the wrong number looks exactly as authoritative as the right one, and it is wrong by the blank-line count. The instrument for the number of lines in a file is a raw newline count or `[System.IO.File]::ReadAllLines($path).Count`; reach for `Measure-Object -Line` only when non-blank lines are the thing you mean, and say so when you quote it.

## A file a tool refuses to read is a defect in the tree

Found 2026-09-19. `tools/shot.js` held literal U+0000 and U+001F characters, so the `edit` tool refused the whole file as binary and a worker who had found a real bug in it could not fix it. The characters were doing real work — a NUL joining two fields into one map key, and a character class for invisible characters — and both are now written as `\u0000` and `\u001f` escapes, which mean the same thing (`e400821`).

So a control character in a tracked text file is written as a `\u` escape and never as the raw byte: a raw byte makes every tool that guesses a file's type refuse the file, and the refusal arrives as "binary file" rather than as the defect, so it reads as a problem with the reader. `test/control-chars.test.js` now holds this over every file in the tree with one of nine source extensions, failing with the file, line, column and code point; the check is tracked (`test/control-chars.test.js`, 412 lines, `git ls-files --error-unmatch` resolves it and `git status` shows it clean), so this rule is now the check's rather than prose. The same holds for evidence: a log written as UTF-16 by a shell pipeline reads as binary to the next session's tools, so write logs as UTF-8.

## Write the assignment so its answer can be checked

Found 2026-09-19, the round that gave this repository a **reader-proxy** — a worker whose only job is to read the book the way its reader does ([defect-register.md](../learning/defect-register.md), 2026-09-19). A brief that names a finding and asks whether it is still there tells its reader which answer is wanted, and a reader will supply it.

So an assignment that asks for a verdict:

- names the **artefact** and the **question**, never the expected answer;
- asks for a **measurement at the current revision** rather than agreement with an earlier note, because a report copied forward reads exactly like a report re-taken;
- requires every quoted string to be one the reviewer found in the tree, so the first check on the report is a `grep` and not a judgement;
- names the **instrument** the answer should come from, so "I looked" and "I ran the probe" are different answers; and
- asks for what could not be checked, as a list of its own, which is what stops a thin report from reading as a clean one.

`out/verify/prose-claims-subagent.md` is the shape that works: 30 claims, each with the file it lives in, the fetched source it was checked against and a verdict, 2 of them failed, and four listed as uncheckable with the reason.

## A wait in a gate must poll the artefact, never the wall clock

Every figure in this book runs on a budgeted clock: it advances its own time as frames arrive, so on a loaded machine it arrives later without behaving differently. Measured 2026-09-16, with one other gate running, `bilayer` advanced 5 s of figure time in 13 s of wall time.

So `await page.waitForTimeout(400)` in a drive recipe is not a wait for the figure. It is an assertion about how busy the machine is, and it fails or passes accordingly. A `water3d` step went red once on a run that touched none of its code, for exactly this reason: it read a clock-driven count twice, 400 ms apart, on an unpinned clock.

**Poll the thing you are waiting for.** `until(h, (d) => d.step === 3)` reading `describe()` is a wait for the figure; a sleep is a wait for the computer. The same holds for any check that wants a figure to have idled: compare the clock field the figure reports, not elapsed wall time.

This is the reason `npm run drive` is 230 s and `foldlab` alone is 40 s of it. A recipe that sleeps is slow on a fast machine and wrong on a slow one.

**But a sleep may be doing two jobs, and only one of them is written down.** Replacing it with a poll on the obvious signal silently drops the other. Measured 2026-09-17: `levels`' `arrow-right-on-range` went red the moment its `waitForTimeout` became a poll on `describe()`. The sleep had been waiting both for the figure to report the new level **and** for the figure to write that level into its `<input type=range>`. `describe()` publishes first and the DOM catches up after, so `ArrowRight` pressed the instant `describe()` said `1` incremented a slider still reading `0` and landed back where it started. A poll on `describe()` cannot see this, because `describe()` is already correct.

So: **poll what the next step touches, not only what this step asserts on.** If the next action reads a control, wait for that control to carry the value the figure has reported — `atValue` beside `until` in `tools/drive.js` is the helper. Expect a handful of these each time a sleep is removed; the answer is another poll, never the sleep back.

**And polling for "stopped" without first requiring "started" is not a wait, it is a coin toss.** A press hands its work to the browser; for a frame or two the element has not begun moving, two consecutive reads agree at the position it started from, "stable" is true, and the poll leaves holding exactly what the press was supposed to change. Measured 2026-09-17: replacing the drawer's 650 ms sleeps in `tools/devices.js` with a stability poll produced six `tapping outside the drawer did not close it (x 0)` failures on loads that had passed for as long as that gate had existed, and every one of them read as a product defect. The shape that works is **moved, then stopped**: keep the reading taken before the press, require the element to move away from it, and only then wait for it to settle.

**And "moved" has to be measured against where the thing rests, which means the reading may not be rounded.** `Math.round` on a poll's own reading throws away exactly the information that says "still moving". Measured 2026-09-17 on the drawer in `tools/devices.js`: its ease spends the last ~90 ms of 400 travelling its last ~2 px, so **22 of 400 polls (5.5 %) left one rounded pixel short of rest**. That short reading becomes the next wait's `from`, which disarms the *moved* guard for the only position that matters — and that guard fires on **55 of those 400 polls**. Replaying the same recorded readings with a `from` one pixel short leaves **20 of 200 polls holding an open drawer**: `following a link left the drawer open over the text (x 0)`.

So **a poll compares the artefact's exact value and the messages round, never the other way round**, and the reading a wait is armed with comes from the same reader the poll uses. A third condition is cheap and worth having: two equal readings only mean "stopped" if a rendered frame separated them, so read `document.timeline.currentTime` in the same evaluate and require it to differ.

**How it was found matters as much as what it was.** The failure would not reproduce at the gate — twenty consecutive runs were green. So it was measured one level down, with a probe running the identical sequence 100 times on one page: 400 polls against the 2 a gate run performs. Causation was then proved by replaying the **recorded readings of green runs** with only `from` varied, so nothing else could account for it. When a flake will not reproduce, raise the sample rate at the mechanism rather than running the whole gate again.

**And a figure genuinely in motion cannot be caught still at all.** Where the first three traps are about polling the wrong thing, this one is about there being nothing to poll: `cilium`'s readout is measured against its own running clock, so no wait makes the two agree. The answer is to read both in the same instant, or to pin the clock, not to wait longer.

The same round produced the companion trap, from the worker that made the change: **a threshold a poll leaves at is a different number from the same threshold a sleep happened to overshoot.** A `waitForTimeout(6000)` was landing near a ratio of 1.3; the poll that replaced it left at 1.202, and the step's next assertion demanded a drop of 0.15 from a value whose floor is 1.114. The step was unreachable and the change looked like a product failure.

## A gate's exemption list must print what it measured, not what it was told

`npm run pinned` shipped with a `KNOWN` list of figures whose clocks were expected to move, and one entry was simply wrong: it recorded that `pump`'s Ouabain control stepped the pump cycle on its own. Measured on a fresh mount, with the guard in place and with it removed, only Run ever moved it. The entry came from the gate's **first** version, which pressed a kind's controls in document order on one page — so Run was already running when Ouabain was pressed, and the gate attributed Run's motion to Ouabain.

The entry then sat in the file reading like a fact. Anyone auditing the gate would have found a plausible sentence with no way to tell it from a measurement.

**So an exemption prints the measurement that justifies it, on every run.** Not the reason it was added, and not a sentence someone wrote once: the numbers the gate itself just observed for that entry. An exemption that cannot restate its own evidence is a claim, and a claim in an exemption list is indistinguishable from a finding.

The same round produced the reason this matters twice over: the gate's first version **reported green over the exact defect it was written to catch**, for the same ordering reason. A fixture that ends early, an exemption that was never measured, and a check that agrees with itself are one family.

## A Playwright locator that matches nothing does not fail. It waits.

Measured 2026-09-17. `tools/legible.js` counted a figure's visible buttons once, then addressed each by index. `polymer` **hides** one control rather than removing it (`btnForm.style.display = 'none'` when the family is not sugar), so it shows nine buttons at open and eight after a press. The stale index then matched nothing — and `isEnabled()` on a locator that matches nothing does not throw. It waits, and with no timeout of its own it waits `ACTION_TIMEOUT_MS`, which this repository sets to **180 seconds**, before the surrounding `.catch()` shrugs.

One stale index, one 180-second wait, 185 seconds for the pair. A/B on the same tree: element handles with a 1-second bound gave 5.2 s; the index loop gave 185.0 s. **Both arms reported the same nine states**, which is why the cost never looked like missing work and why "the figure is pinned-clean and still slow" was true and still missed it.

So: **bound every Playwright call that can legitimately match nothing**, and never let `ACTION_TIMEOUT_MS` be the bound for an existence question. A control that is present answers in milliseconds. Prefer element handles taken once over re-resolving by index, because an index is a claim about a list that may have changed underneath you.

The general form, which this file already states about return values: a call that cannot find its subject hands back something the next line uses without complaint. Here that something is time.

## Retest an inherited blocker before repeating it, and check what the repo says about it

The 185-second figure above was **a day stale when it was handed on**, and the fix it described was already in the file. Worse, two documents in this repository disagreed about the same gate by a factor of four — one said 24 minutes, the gate's own header said 4 minutes 7 seconds — and both were being quoted in briefs at the same time.

The canon already says a blocker you inherited is a claim like any other. This adds where to look: **a gate's own header is the closest thing to the truth**, because it is edited by whoever last changed the gate, and a number in a plan or a handoff is a snapshot of a tree that has since moved. When the two disagree, measure, then fix whichever is wrong.

## Demonstrate a gate's bound, do not merely state it

The canon says name the bound in the gate's own header. This repository's practice goes one step further, and the step is cheap.

`test/use-before-declared.test.js` landed on 2026-09-17 finding **zero** real instances across 56 modules — the three it was written for had already been fixed. Its red proof therefore had to come from mutations, and it added a third arm that is worth copying: it reintroduced **the one real instance this repository has actually shipped**, verbatim (`const tw = tween({ … done: () => tweens.delete(tw) })`, `symbiont.js`, 2026-09-16), and recorded that the check stays **green** on it, because that read is inside a closure and the walk is scope-exact.

So the header does not say "it cannot see closures" as an assertion. It says so with an example that is known to have happened here, and the proof file carries the exit code.

**A stated bound is a claim. A demonstrated bound is a measurement.** When you write a gate, find a real defect it does **not** catch and put that in the proof beside the one it does. A future reader deciding whether to trust the gate needs the shape of its blind spot more than the shape of its coverage, and the two look identical from a green run.

The same worker also mutated its own **false-alarm fixture** to prove that fixture was load-bearing, which is the same move pointed at the test rather than the product: a fixture nobody can make fail is not holding anything.

## A figure that opts out of a shared class name is invisible to every gate that keys on it

`membrane3d` **named** its control bar `.m3-bar` instead of `.fig-toolbar` until 2026-09-17. That one difference hid it from two gates in one week:

- `npm run sweep3d` hides overlays by class before measuring the bare canvas, so the figure was **never covered at all** and passed with its renderer replaced by a blank clear — the exact defect that gate was hardened against in 2026-09-10.
- `npm run narrow`, once it began measuring toolbars, read `0 px in 0 rows`, which is indistinguishable from a figure that has no controls.

Neither gate was wrong. Both were asking a reasonable question of a shared vocabulary, and one figure was not speaking it.

**So the fix is the figure, not the gates.** Teaching each check about the exception repairs the checks that exist and leaves the next one broken, and nobody remembers to add an exception to a gate written three months later. The shared names in `components.css` — `.fig-toolbar`, `.fig-btn`, `.tb-figure__stage`, the bench's pane classes — are a contract with every present and future check, and a figure keeps its own look by scoping its styles under its own root class, which is already the convention.

The general shape, which this file states elsewhere about return values and about locators: **a check that cannot find its subject must say so rather than score it.** Both gates now do. But a subject that renames itself will keep finding checks that have not learned to say it yet, so the cheaper discipline is to not rename.

The figure was moved to `.fig-toolbar` on 2026-09-17, keeping its own layout scoped under its root class, and the move changed no pixel: the labelled frames are byte-identical before and after. A sweep of all 44 figures found **no other private toolbar class** — every other figure writes `fig-toolbar` itself, takes it from `lib/three-common.js`'s `createStage`, or takes it from the bench.
