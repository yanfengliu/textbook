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
