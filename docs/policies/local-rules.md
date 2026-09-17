# Local rules (textbook)

These bind alongside the fleet constitution in [AGENTS.md](../../AGENTS.md) and win where they overlap. They may make a canon rule stricter, never weaker.

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

- **Git Bash's `grep`, `cat` and `sed` translate CRLF on read**, so `grep -q $'' file` reports "no CR" on a CRLF file. The honest instrument for what a file's line endings are is `git ls-files --eol <file>`; the honest instrument for whether an edit changed content is `git diff`, which ignores the CRLF/LF difference under this setting.
- **A script that joins lines with `
` and writes a CRLF file leaves a mixed file.** Read with the same newline handling you write with (`io.open(..., newline='')` in Python preserves whatever is there), or edit through the Edit tool, which preserves the file's own endings. A mixed file is not a commit problem (the index normalises) but it is a diff-noise problem for the next reader and it has made a "did my edit change only the line I meant?" check fail for the wrong reason.

## One tree, several sessions: serialise the writes, and name the tree a number came from

Found 2026-09-19, with two other sessions editing this tree at the same time. The constitution asks for worktrees "or otherwise serializ[ing] overlapping writes". **This repository serialises.** A round does not get its own tree: `docs/work/registry.json` allocates work inside one tree, and the whole design assumes one shared `src/`, one shared `docs/` and one `npm test`. So, in this repo:

- **One writer per file, and the assignment names the files.** Holding a file against a gate proof is already a rule here: [Prove a gate red on a file no running worker owns](#prove-a-gate-red-on-a-file-no-running-worker-owns).
- **A measurement names the tree it was taken on, and an A/B proves the tree held still.** Bracket a run with the sha256 of every file it depends on and throw the run away if a hash moved. `out/remeasure/probe-prose-han.mjs` brackets all fifteen of its loads with `zj.css`, `tokens.css` and `components.css`, and every load it kept says `same: true`. Where the change can be made in the live DOM rather than in a file, do that, so the two arms differ by the variable alone.
- **A gate that empties its own output directory makes one run's frames unusable as another run's evidence.** `npm run shot` deletes `out/shots/` before the first frame is written, so on 2026-09-16 a second run deleted the 24 acceptance frames of a green run before anybody could look at them, and only the log survived — no exit status showed it. Give the second run a directory of its own (`SHOT_LABEL=<name>` writes `out/shots-<name>/`, the shape `tools/inspect.js --label` already had), and copy out anything a verdict rests on as soon as it exists.
- **Stage paths explicitly, and never `git add -A`.** `e400821` staged its own 35 paths by name and left the other sessions' work unstaged; a run that stages everything commits another session's half-written chapter under this round's message. Read `git status --porcelain` before and after the commit.
- **A repository-wide red gate is not a reading of your own work.** Another session's half-written chapter leaves the shared gates red for everybody: `unit`, `check` and `subpath` were red on `e400821` for that reason, and three of the thirty-six registered figure kinds still have no module on disk (`bulk-transport`, `osmometer`, `permeability`). Record a baseline before starting, run the gate scoped to the pages you own, and have the tool print the scope rather than assert it — `tools/devices.js` says on every line whether the paired book's width floor applied, and names which of the three reasons stopped it when it did not.

## A stated measure names its instrument, its population and its width

Found 2026-09-19. One paragraph of this book's record carried three different line lengths in a single evening, and each was believed downstream: **43.1** characters a line, a figure derived from a column width and an assumed advance on an earlier state of the ladder; **52–56**, which is a count of every non-space glyph where the band is stated in Han characters, the same lines holding **45**; and the measured answer, **36 Han characters on chapter 1 and 35 on chapters 2 and 3** (`out/remeasure/README.md`). The counter was believed because it moved with the thing it claimed to read: 32/31/31 under a 43.6 rem cap, 36/35/35 at the shipped 50 rem, 46/45/44 with the cap removed.

So a number in a design record, a plan or a comment names three things, or it is not a measurement yet:

- the **instrument** that took it, down to which counter in which file — `out/widthgate/probe-prose.mjs` counts every non-space glyph, `out/remeasure/probe-prose-han.mjs` counts Han alone;
- the **population** it was taken over, including what was left out — every full line of every prose paragraph, each paragraph's last line dropped, then that paragraph's median;
- the **width** it was taken at, because a line length is a function of the width, and that five widths agree here is part of the evidence rather than a detail.

This cannot become a gate, and saying so is the point. A comment that names its instrument is still a comment; whether the instrument is the right one for the claim is a question for a person reading it.

## A file a tool refuses to read is a defect in the tree

Found 2026-09-19. `tools/shot.js` held literal U+0000 and U+001F characters, so the `edit` tool refused the whole file as binary and a worker who had found a real bug in it could not fix it. The characters were doing real work — a NUL joining two fields into one map key, and a character class for invisible characters — and both are now written as `\u0000` and `\u001f` escapes, which mean the same thing (`e400821`).

So a control character in a tracked text file is written as a `\u` escape and never as the raw byte: a raw byte makes every tool that guesses a file's type refuse the file, and the refusal arrives as "binary file" rather than as the defect, so it reads as a problem with the reader. `test/control-chars.test.js` now holds this over every file in the tree with one of nine source extensions, failing with the file, line, column and code point; it is untracked work in the tree as this is written, so the rule stands even if that check never lands. The same holds for evidence: a log written as UTF-16 by a shell pipeline reads as binary to the next session's tools, so write logs as UTF-8.

## Write the assignment so its answer can be checked

Found 2026-09-19, the round that gave this repository a **reader-proxy** — a worker whose only job is to read the book the way its reader does ([defect-register.md](../learning/defect-register.md), 2026-09-19). A brief that names a finding and asks whether it is still there tells its reader which answer is wanted, and a reader will supply it.

So an assignment that asks for a verdict:

- names the **artefact** and the **question**, never the expected answer;
- asks for a **measurement at the current revision** rather than agreement with an earlier note, because a report copied forward reads exactly like a report re-taken;
- requires every quoted string to be one the reviewer found in the tree, so the first check on the report is a `grep` and not a judgement;
- names the **instrument** the answer should come from, so "I looked" and "I ran the probe" are different answers; and
- asks for what could not be checked, as a list of its own, which is what stops a thin report from reading as a clean one.

`out/verify/prose-claims-subagent.md` is the shape that works: 30 claims, each with the file it lives in, the fetched source it was checked against and a verdict, 2 of them failed, and four listed as uncheckable with the reason.
