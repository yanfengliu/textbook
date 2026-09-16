# A second book, and a crash dialog that read as a broken gate

2026-09-12. What a later session would trip over, in the order the session tripped over it.

## The owner's three instructions, and where each landed

*"Start a new textbook that provides the original chinese version of 资治通鉴 and its modern translation. If I click on any 字 or 词 it should give me the meaning and examples of how it is used. Do a few chapters as prototype."* — the design is [docs/design/tongjian.md](../../design/tongjian.md), the round is [docs/work/4_zizhi-tongjian/plan.md](../../work/4_zizhi-tongjian/plan.md).

*"Do it in a way that minimizes interferences with other ongoing work for other textbooks in this repo. Only commit what you or your subagents changed."* — the book was added as a directory the repository already discovers, and the whole of its shared footprint is six lines: three figure registry entries, three `drive` recipes, one library shelf entry, three `tb-source` lines on `today/`. Nothing under `src/styles/`, `tools/check-content.js`, `tools/lib/browser.js`, `test/pages.test.js` or `src/shell.js` is touched, and this is testable rather than promised: the gates were written for one book and the second one passes them unchanged.

*"Use beautiful typography and UI design. Do not settle for anything that is less than supreme quality."* and *"Make sure your text is grounded in sources."* — both were taken as constraints on the architecture rather than as goals for later. The type system is a section of the design with a reason per value; the grounding is a tracked corpus with tests, because "grounded in sources" that is not checked is a claim, and a claim about classical Chinese is exactly the kind that is confidently wrong.

## The crash dialog, which was the session's real defect

The owner sent a screenshot twice: `chrome-headless-shell.exe - Application Error`, *"The exception Breakpoint (0x80000003)"*, *"Why you keep creating this error"*.

**What it is.** Chromium's internal breakpoint, raised by the browser process, shown as a Windows modal that outlives the Node process which started it. Closing the terminal does not remove it. Killing the gate does not remove it. That is why it looked like it kept coming back.

**What was believed first, and disproved.** The first explanation was going to be "the sandbox blocks the browser". Three launches were measured instead — Playwright defaults, the repository's own `--enable-unsafe-swiftshader --ignore-gpu-blocklist`, and a quiet variant — and all three rendered `資治通鑑`, closed cleanly, and left no `chrome-headless-shell.exe` in `tasklist`. So a launch does not raise it, and the page is not the cause. It comes from a crash inside a browser, and the only browser this session had run was `node tools/shot.js`, whose chromium died on exit after both pages had already reported `ok`. That is in [defect-register.md](../../learning/defect-register.md) as the closest thing to a root cause the evidence supports, and it is written as such rather than as certainty.

**Two unsound gates were written before a sound one.** Worth recording because both are the canon's named failure modes, and both were caught by reading the test rather than by running it:

1. The first version read `tools/zj-quiet-browser.cjs` as a string and asserted it contained the flags. That passes with the flags in a comment, and passes while the patch fails to apply — a check built from the same symbol as the thing it checks.
2. The second iterated the wrapper's own `QUIET_ARGS` constant. Deleting a flag from the wrapper would then still pass the one test that launches a real browser, which is the only test that could have caught the deletion.

The accepted version writes the expected flags out as literals in the test, launches a browser, and reads the running process's own command line through `Browser.getBrowserCommandLine`. Proved red by deleting `--noerrdialogs` from the wrapper: both tests fail, including the behavioural one. It also cost two more corrections that are now comments in the file — `Browser.getBrowserCommandLine` needs a **browser-level** CDP session rather than a page one, and Chromium refuses to answer it without `--enable-automation` on the command line.

## Two environment facts that masquerade as red gates

- `node --test "test/*.test.js"` reports `spawn EPERM` for every file under this session's process policy. The suite is not red; the runner cannot fork. `node --test --experimental-test-isolation=none <files>` runs the same tests and passes.
- `node tools/check-content.js` **is** red before this round starts, twice: `biology/ch01`'s `i-resolution-limits-2` has an `expect` clause with a trailing `e-7`, and `biology/ch03-cells` declares 35 objectives with no `items.js`. Both belong to `docs/work/2_rest-of-the-book`. They are baselined in the plan so a failure at the end of this round is attributed by evidence rather than by argument.

## What was in flight, and what that constrained

Three other things were live in the same tree at the same time: a chapter-2 figure polish pass (its screenshots were appearing under `out/polish-ch02/` while this round started, and CPU was at 81%), the rest-of-the-book round, and the bilingual design. Consequences taken deliberately:

- No browser gate was run by more than one lane. The coordinator runs them once, at the end, and workers were told not to.
- `docs/policies/local-rules.md`, `docs/learning/defect-register.md` and `docs/learning/gate-proofs.md` were all edited by the other rounds; each was re-read immediately before editing after an edit was refused for having a stale read. The refusal is the mechanism working.
- `index.html` and `today/index.html` are on the bilingual plan's list, so this round's edits to them are staged by explicit path and committed without `git add -A`, and nothing else in the working tree is touched.
