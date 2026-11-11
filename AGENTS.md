# AGENTS.md — textbook

## What this is

Web-based interactive textbooks. The first book is biology: chapters of set prose with hand-drawn SVG illustrations, animated diagrams, small simulations, and orbitable 3D models, read in a browser with no build step.

The book also tracks what a reader has learned and what they are struggling with, and reorganises practice around it: mastery per learning objective, a pure scheduler in the browser, and agent rounds that diagnose and write against what the record shows. `docs/design/textbook.md` is the design of record for the book, `docs/design/adaptive.md` for the study system, and `docs/work/` holds the rounds that produced both.

Non-goals: a content management system, accounts or progress sync, server-side rendering, and downloaded or generated raster art. Every illustration is authored SVG, canvas, or procedural 3D, so the repository holds no image pipeline.

Stack: plain HTML, CSS, and ES modules on Node 24 (`.nvmrc`); Three.js pinned through an import map for the 3D figures; Playwright chromium for the gates. Repo-only rules: `docs/policies/local-rules.md`.

**Current direction** (the owner, 2026-09-23 and 2026-09-24). The weekly usage allowance is the budget: about 40M price-weighted tokens a chapter, spent on what a reader sees first. Contexts stay small. A chapter has at most about four bespoke interactive figures, with authored static SVG elsewhere. No chapter ships without an accuracy review against OpenStax Biology 2e. The study loop must run before more study features are built. `npm test` stays the commit gate until a core gate exists. One textbook session runs at a time. The biology book's Chinese edition is parked. Chapters 7 and 8 were already written, so they ship at chapter 6's reduced scope. No chapter after 8 starts, and other new work waits, until the owner asks. The ten points and their evidence are in [docs/policies/local-rules.md](docs/policies/local-rules.md#the-usage-allowance-is-the-budget-the-owners-direction-of-2026-09-23).

<!-- FLEET-CANON:BEGIN sha=fa6416c07600 generated from ../fleet/FLEET.md by `npm run sync-canon` — do not edit inside this block; this repo's own rules go in docs/policies/local-rules.md -->
## Fleet constitution

Shared rules for every repo under `github/`, kept in `../fleet/FLEET.md`; `../fleet/` is fleet's checkout beside this repo's primary checkout. Where a rule gives its reason, use the reason to judge cases the rule does not name; each `[Rn]`'s history is in `../fleet/docs/canon-rationale.md`. This repo's `docs/policies/local-rules.md` may add rules but cannot change these permissions or limits. [R13]

The main agent owns delivery and may implement directly. Use subagents when bounded, independent work or independent judgment materially improves speed or quality; keep small or tightly coupled work with one agent (owner directive, 2026-11-07). [R2, R3]

The designated coordinator reads `../fleet/docs/skills/coordinator.md` before planning and after each compaction, and any agent reads that file's "Delegate" section before delegating. Before these kinds of work, read the matching section of `../fleet/docs/work-rules.md`: standing loops and unattended runs; editing skills, agent instructions or rules; handing off or stopping mid-task.

### Permissions

- Commit, merge to main and push without asking. Force-pushing and rewriting history (they destroy history), and deploying and publishing (they reach other people), need the owner's OK. [R14]
- Ask before a major architecture or product change, a new major dependency, a change to a persistent format or a security boundary, or any other consequential action outside this machine, such as posting or sending something. [R8]
- Change fleet rules (FLEET.md, fleet skills and runbooks, agent memory) or add a rule to a repo's `docs/policies/local-rules.md` only when the owner asks, because the owner sets policy. You may add a proposal with its evidence to `../fleet/canon-candidates.md`, but not edit its entries. [R8]

### Sharing the machine

- Other Claude and Codex sessions may be working in this checkout, and you cannot see them. Do anything beyond a quick read in your own worktree, because two sessions in one tree spoil each other's gates and commits. Never revert, overwrite or delete changes you did not make. When resuming, check which worktrees, branches and files already exist. [R7]
- Done means merged to main and pushed: the owner archives sessions, and work left on a branch is lost. Merge on your branch, get the gates passing there, then move main, because other worktrees build on local main. Judge the merged result itself, not a worker's summary. Then remove your worktree and branch, and report where any unmerged work is. [R14]

### Doing the work

- The repo's gates must pass on the tree that is handed back or reaches main. Unless the repo's own rules ask more of a commit, commit on your own branch at every stopping point and say in the message what was not checked, because a session can end without warning. Docs-only changes need content checks and any gate the repo names for docs, not runtime tests or CI waits. [R14]
- Check the thing that should have changed (the file, the page, the number), not just the exit code or a tool's report: both can pass over a defect. Retest a blocker you inherit before repeating it. Never weaken a test or hide a failure to get green. [R9]
- Look at visual and interactive work rendered at full resolution, through the real controls, from fixed and random views, because passing tests say nothing about pixels. Run it headless unless a visible window is needed. [R16]
- Slowness on the critical path, such as a gate rendering on the CPU of a machine with a GPU, is a defect to fix. [R22]
- After pushing code, follow CI to the end; read a failed job's steps before blaming the code, since a billing limit fails jobs before any step runs. [R15]
- If a fix fails twice for one reason, rethink it. After five real repair attempts at one problem, whatever the approach and counting earlier sessions, stop and report, unless the owner set another limit; for a problem that keeps winning, run the search in `../fleet/docs/skills/hard-problem.md`. Stop when the task's criteria are met; do not invent follow-up work. [R11]
- For substantial or high-risk changes, use independent review when available. High-risk includes persistence and migrations, security and auth, concurrency, money, supply chain, and code changes in another repo. Review the exact revision against the task's criteria, and say so when review was unavailable. Fix the findings that matter and have those fixes checked; note minor ones instead of starting another round. `../fleet/docs/skills/multi-cli-review.md` provides the review mechanics. [R10]
- A defect the owner reports gets a test for its whole class and an entry in `docs/learning/defect-register.md`, because a fix without a check tends to come back. [R17]
- Sessions run long: take new requests in the same session, and never hand off to a new session to shed context. Split work expected to need more than about 200k tokens of context into milestones, each merged to main. [R6]

### Records, sized to the work

- Read `docs/learning/lessons.md` at session start; it lists this repo's known traps, and its header says how to add one. [R18]
- Every change that alters behaviour adds a dated line to `docs/devlog/summary.md` (`../fleet/docs/devlog-template.md`) when it lands, because later sessions orient from its newest entries. Work that spans sessions, has several agents writing, or gets an independent review also keeps its plan and review records in `docs/work/` (`../fleet/docs/work-docs.md`); other work needs none. [R24]
- Raw output (logs, captures, screenshots) stays in ignored folders. Never commit a binary over 512 KiB or any file over 1 MiB; LFS needs the owner's OK. [R23]

### Style and environment

- Plain words; one line per paragraph, no hard wrapping. A report says what changed, how it was checked (including any check skipped or failed) and what is not done. [R25]
- Node 24 is the baseline. Products pin the model IDs they call in their own repo, and nowhere else. Reviewer model pins live only in `../fleet/docs/skills/multi-cli-review.md`. Runtime model calls are allowed and paid for; make per-item calls one-shot, not agent sessions. [R28, R29]
<!-- FLEET-CANON:END -->

## Gates

**Read a gate's entry in [docs/policies/gates.md](docs/policies/gates.md) before changing the gate or relying on it.** That file holds what each gate proves, its bound, its trims and the measurements behind them; this section is the short list.

- **Node 24**, pinned by `.nvmrc` and `engines.node`; run against v24.18.1. A version mismatch is not a code failure, so check it before reading a red gate as one. Playwright's chromium, WebKit and Firefox must be installed once (`npx playwright install chromium webkit firefox`), because `npm run devices` also loads the library and chapter 1 in WebKit and Firefox. The gates need the network: every page fetches the fonts from Google Fonts and the 3D figures fetch the pinned Three.js from jsdelivr, and a failed request is a failure.
- **`npm test` is the gate**, and it passes before any commit that touches code. Until a core gate exists and this file names it, `npm test` stays the commit gate ([the owner's direction of 2026-09-23](docs/policies/local-rules.md#the-usage-allowance-is-the-budget-the-owners-direction-of-2026-09-23), point 6). `tools/test.js` runs thirteen steps as separate processes, cheapest first, with no pipe anywhere, and stops at the first red one, naming it. Each is also runnable alone, and each states its own bound in its file header:
  1. `npm run unit`: the unit tests, `node --test "test/*.test.js"`.
  2. `npm run check`: every page's authored prose and the study data beside it, and which chapters the site says can be read against the chapters on disk.
  3. `npm run theme`: the reader's theme is on the page before first paint.
  4. `npm run shot`: every page at 390, 1024 and 1440 px in both themes, clocks pinned; writes `out/shots/`.
  5. `npm run flow`: the reader controls, through real mouse, keyboard and drag input.
  6. `npm run drive`: every figure's own controls, one recipe per kind; a recipe polls, never sleeps.
  7. `npm run pinned`: no figure moves on its own after a control is worked with its clock pinned.
  8. `npm run sitting`: a study sitting done by keyboard; no label claims more than the record.
  9. `npm run narrow`: every figure at a 390 px stage, and every state a press opens there.
  10. `npm run legible`: the contrast of every figure glyph against the pixels under it.
  11. `npm run devices`: nine emulated devices, each pressed with the input it has.
  12. `npm run sweep3d`: every WebGL figure from fifteen views; writes `out/sweep/`.
  13. `npm run subpath`: the published tree served under `/textbook/`, at two widths in both themes.
- **`npm run audit`** (`npm audit --audit-level=high`) is the dependency-audit gate; re-run it on any dependency change. It sits outside `npm test` because it reaches the registry.
- Every gate is proved red before it counts, and the proof is in `docs/learning/gate-proofs.md`: **read that file's index and the one entry it sends you to, never the file.** A green run proves what the gate's header says and nothing past it. The screenshots the gates write are the check for the pixels, and the person who looks at them says so in the work folder's plan.
- Not gates: `npm run perf` (frame time and draw calls on the machine it runs on), `npm run figure -- <kind>` (one pinned frame of one figure), `npm run inspect <page>` (viewport frames at named elements), `npm run review` (what the reader's study record says, calling no model), `npm run progress:export` and `npm run progress:import` (the record's backup and the way a sitting read on a phone reaches the agent). These are the instruments; a scratch probe names which of them it stands in for.

## Invariants & boundaries

- **A figure that can fill any shape declares a `narrowAspect`, and one whose type would shrink below about nine device pixels on a phone carries a second composition rather than a scaled-down first one.** `npm run narrow` covers that second layout; a figure gaining one without a gate is how five of them nearly shipped unwatched.
- **A figure is a module with the contract in `docs/design/textbook.md`**: `meta`, `mount(root, ctx)` returning `destroy`, `setTime`, `describe`, `setVisible`, and for 3D `setView` with a non-zero `view.distance`. The frame (`src/components/figure.js`) is the only thing that mounts it, and the gates drive it only through that frame and its own controls.
- **The frame owns `id`, `kind`, `number` and `state` in `describe()`; a figure may not report a field with any of those names.** They are spread last so the frame always wins, and `npm run drive` fails a figure that uses one, because winning silently would drop the figure's own value without a word. `foldlab` reports `foldState` for this reason.
- **Every frame is a pure function of its clock and the reader's actions.** `setTime(t)` pins it; nothing advances on its own while `ctx.pinnedTime` is set; no `Math.random` in a figure, only a seeded generator. That makes a figure's state and drawing the same every run; it does not make a gate's screenshot the same bytes every run, which it is not (`tools/shot.js`'s header says why, and what the frames are for). Nor may a figure's frame depend on when a webfont arrived. The figures known to break this invariant are recorded in `docs/learning/defect-register.md`.
- **One colour table.** `src/styles/tokens.css` and `src/palette.js` hold the same values and a test fails when they drift; figures colour from `ctx.palette` or the CSS variables, never from a hex of their own.
- **No build step, no bundler, no framework, no raster images, no downloaded models.** Three.js arrives only through the import map, at the version pinned there. A dependency added to `package.json` is a decision recorded in the design doc.
- **Every path in a page is relative.** The site is published at `https://yanfengliu.github.io/textbook/`, a subpath, so one leading slash breaks it in a way that nothing at the root can see. `npm run subpath` is what catches it.
- **The handshake is the gates' only clock.** `window.__textbook.state` becomes `ready` when the shell has mounted, **every `<tb-sitting>` on the page has booted**, and, under `?eager=1`, every `<tb-figure>` on the page has registered and reached `ready` or `error`. The sitting term is **not** behind `?eager=1`, because `npm run devices` does not pass it and loads Today; on a page with no `<tb-sitting>` it is vacuously true and nothing is built, so every other page becomes ready at the instant it did before. A sitting has booted when its `.tb-standing` section holds anything, which is where both of `TbSitting.boot()`'s exits lead — `paintStanding()` on the good path and `fail()`'s `.tb-unavailable` panel on the bad one — so a sitting that has honestly given up releases the handshake instead of hanging it, and only a boot that neither paints nor fails holds the page in `loading` until the caller's own timeout. `window.__textbook.describeSittings()` reports what the handshake waited for.
- **The study system's three layers stay separate** (`docs/design/adaptive.md`): evidence is recorded in the browser, the scheduler is a pure function of that history and never calls a model, and the agent's round never schedules. A model re-deriving intervals is slower and worse than the arithmetic, and it cannot run while the reader is mid-sitting.
- **Mastery is tracked per objective, never per chapter or per question**, and every question names the objective it tests. An objective whose prerequisites are weak is blocked, not failed, and the queue works on the prerequisite.
- **No word the book shows about a reader may claim more than the record supports.** "Learned well" is the store's verdict — high recall, about a week of stability, a recent success, and success in two formats — and not the scheduler's `review` state, which only means a card is past its learning steps. `npm run sitting` holds this.
- **The prose is never hidden, locked, gated or reordered by the study system.** It annotates and it reorders practice. A reader may always read anything, including the parts they are bad at.
- **The reader's record is theirs and stays local.** `progress/` is git-ignored, nothing leaves the machine, and there are no accounts. What a round commits is its conclusions, not the raw log.
- Locally high-risk, so it gets independent review: the figure contract, the handshake, the scheduler and the mastery thresholds, the content checker's rules, and any change to `AGENTS.md`, `docs/policies/gates.md`, `docs/policies/local-rules.md` or `docs/design/`.

## Conventions

- One HTML page per chapter under `<book>/chNN-<slug>/index.html`, with `glossary.js` (its terms), `objectives.js` (the claims a reader should be able to make, and their prerequisites) and `items.js` (the review bank) beside it. Sections are `<section id>` with an `<h2>`; the shell numbers them. Every term the chapter introduces is a `<tb-term>`; every figure is cited by number in the prose; every question names its objective. No reader sees a question's options in the order they are written — Today and the chapter checks draw the order (`src/components/choice-order.js`) — so an explanation names an option by what it says, never by its letter or its place ("the last option", 「前两个选项」), and `npm run check` fails one that does.
- A study round is `.claude/commands/study-round.md`, run on evidence rather than on a timer, and it leaves a dated note in `docs/study/rounds/`. Nothing in this repo runs unattended.
- British spelling in the prose (organised, colour, metre); SI units with a space (20 µm); old-style figures in text, lining and tabular in tables.
- Figure modules live in `src/figures/<kind>.js`, registered in `src/figures/registry.js`; shared helpers in `src/figures/lib/`. Controls inside a stage use the `.fig-*` classes in `components.css`; figure-private styles are scoped under a unique class inside the figure's root.
- Devlog per canon: `docs/devlog/summary.md`, newest first, with detail in `docs/devlog/detailed/`. Work rounds in `docs/work/<id>_<theme>/`; worker handoffs and reviews in that folder's `reviews/`.
- `README.md` stays reader-facing: what the book is and how to open it. `docs/design/textbook.md` holds the design. `AGENTS.md` holds the rules: what builds the book, and the short list of what proves it. What each gate proves, and its bound, is looked up in `docs/policies/gates.md`; the repo-only rules and the owner's current direction, with their evidence, are in `docs/policies/local-rules.md`.
- **The three standing records are looked up, not read.** `docs/learning/gate-proofs.md`, `docs/learning/defect-register.md` and a round's `docs/work/<id>_<theme>/plan.md` are append-only by design, each already runs to tens or hundreds of kilobytes, and each opens with a statement of the file's shape and an index of every entry, one line each. Read the top, then the entry the index names. Writing a new entry means copying the shape from that header — not reading a neighbour for the form. The live state of a round is the top section of its `plan.md`; everything under it is that round's narrative and is history, not instructions.
