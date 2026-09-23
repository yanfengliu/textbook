# Review: implementation — `npm run shot`'s reproducibility and the theme flash

## Target

The implementation of the round that asked why `npm run shot` does not reproduce its own frames, handed back uncommitted for review on 2026-09-23 from the worktree `C:\Users\38909\Documents\worktrees\textbook-shot-repro`, branch `shot-repro`.

- **Base:** `5e9c981` ("Land chapters 4 and 5, and the week's gate work behind them"), which was `main` and `origin/main` while the review ran. `main` moved afterwards, at 11:23 PDT, to `f7cb330`, another session's audit record: 8 files under `docs/work/`, none of them in this diff.
- **Reviewed revision:** the working tree on that base, with the new files marked intent-to-add so that a diff against the base covers them: 28 paths, 859 insertions and 15 deletions. Its digest, taken as `git diff main | sha256sum` while `main` was `5e9c981`, is `8b523910bfd088a12882dfee2d1ed38e78bab8e7941c5c15e526e0fa958ae4a9` (quoted below by its first 16 characters, `8b523910bfd088a1`).
- **Preserved patch:** `out/review-runs/review.diff` in the worktree, 152,560 bytes, byte-identical to that `git diff main` and with the same sha256. It was ignored evidence, and it went with the worktree when the worktree was removed after the landing. The landing commit carries these changes together with the repairs below, so it is not the reviewed revision itself.
- **Scope:** everything in the diff. That is the theme block (`src/theme-early.js`, the 13 pages, the import in `src/shell.js`); its two checks (`test/theme-early.test.js`, `tools/lib/shell-pages.js`, `tools/theme.js`, wired into `tools/test.js` and `package.json`); the settle wait and the reproducibility statement in `tools/shot.js`; and the documents (`AGENTS.md`, `docs/design/chapter-recipe.md`, `docs/learning/gate-proofs.md`, `docs/learning/defect-register.md`, the devlog).

## Reviewers and coverage

- **A fresh read-only subagent (Claude, general-purpose).** It was given only the diff and the brief (`out/review-runs/prompt.md`), with no context from the implementation. It ran `node --test` on `test/theme-early.test.js`, `test/standing-docs.test.js` and `test/trim.test.js`, and no browser gate, as the brief asked. Afterwards the coordinator checked that it had changed nothing: the diff digest was unchanged, and `git diff main --stat` was identical to the snapshot taken before the review.
- **Claude CLI (`claude -p`): abstained.** `Failed to authenticate: OAuth session expired and could not be refreshed`, exit 1.
- **Codex CLI 0.148.0: abstained, twice.** The first run, on the configured model, failed with `The 'gpt-6-astra' model requires a newer version of Codex. Please upgrade to the latest app or CLI and try again.` (HTTP 400). The second, with an explicit `-m gpt-5.6-sol` fallback, failed with `You've hit your usage limit. Visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at Sep 26th, 2026 4:29 PM.`, exit 1.
- **No cross-model coverage was obtained.** The one report is from the same model family that wrote the change.

## Reports

### Fresh read-only subagent (Claude, general-purpose)

The report as the reviewer wrote it, unchanged:

**Review of `shot-repro` (uncommitted, against `5e9c981`; diff sha256 `8b523910bfd088a1`)**

No blockers. Three findings should be fixed before landing (R1 to R3), and four are nits (R4 to R7). I modified nothing: the worktree still shows the same 28 changed paths and the diff digest is unchanged.

**R1 — should-fix — `docs/design/textbook.md:160` and `:172`; `tools/lib/browser.js:25-30`**
- **What is wrong:** The change removes "a screenshot is the same frame every run" from `AGENTS.md:138`, but the design of record still says it in nearly the same words:
  - `:160` says "`?t=<seconds>` pins every figure's clock through `setTime`, so a screenshot is the same frame every run".
  - `:172` says "so the gates see the same frame every run".
  - `tools/lib/browser.js:25-30` still justifies the SwiftShader default, which is 1.94x slower, as keeping "the promise that a screenshot is the same frame every run". The new `AGENTS.md` withdraws that promise, and this round measured it false for `npm run shot` on that same CPU rasterizer (61 of 72 frames identical).
- **Failing scenario:**
  - A session deciding whether it can hash `out/shots/` reads the design of record and draws the inference the owner asked about. `AGENTS.md` now says the opposite.
  - The next person weighing the GPU speed-up reads a rationale that rests on a promise the invariant no longer makes.
- **Fix:**
  - Reword `:160` and `:172` the way `AGENTS.md:138` now reads: pinning makes a figure's state and drawing the same every run, but not the screenshot's bytes; point to `tools/shot.js`'s header.
  - Rest the `browser.js` rationale on its own measurement (sweep3d: 180/180 identical on the CPU, 119/180 on the GPU), not on the invariant. That is a comment edit and leaves the handshake wait untouched.
  - `docs/design/` is on the high-risk list, so this should ride this review rather than a later one.

**R2 — should-fix — `AGENTS.md:138`**
- **What is wrong:** A standing rule now carries status: "`soup` is a known breach…".
  - The mechanism is right: `src/figures/soup.js:734` takes `topPad` from `readout.offsetHeight`, and `:750` rebuilds the world only when the height changes by more than 2%.
  - But the breach appears nowhere in `docs/learning/defect-register.md`, which is the repository's standing list of what the gates cannot see, and no gate covers it.
  - The six figures that break this same invariant under Play are recorded in the register (2026-09-17) and printed by `tools/pinned.js`. None of them is named in `AGENTS.md`.
- **Failing scenario:**
  - Another session owns `soup`'s fix. It lands the fix without touching `AGENTS.md`, which it has no reason to edit and which needs independent review.
  - From then on, the file every session reads first says `soup` breaches the invariant, and nothing checks that sentence.
  - The next session that sees a chapter 2 phone frame differ files it under "the known breach" instead of investigating it.
- **Fix:**
  - Keep the rule ("Nor may a figure's frame depend on when a webfont arrived") and drop the `soup` clause, or replace it with a pointer to the register.
  - Record `soup` in the register: the mechanism, 475 against 474 molecules, who owns the fix, and "no gate".

**R3 — should-fix — `tools/lib/shell-pages.js:56-62`, used at `:95`**
- **What is wrong:** `resolveFrom` returns null for any value that does not start with `/`, `./` or `../`.
  - That is correct for an `import` specifier, where a bare name goes through the import map.
  - `shellChain` also applies it to `<script src>` values, where `src="lab.js"` is an ordinary relative URL. The root page already writes relative URLs this way: `href="src/styles/tokens.css"`.
  - The test's second derivation does not cover pages outside `PAGES`. Its text search looks only for `src/shell.js` or `src/components/index.js` in the page's own HTML.
- **Failing scenario:**
  - `lab/index.html` becomes `<script type="module" src="lab.js">`, and `lab/lab.js` keeps today's `import '../src/components/index.js'`.
  - `shellChain` then returns null, so `shellPages()` drops the lab. The `PAGES` check passes, because the lab is not in `PAGES`. The text search passes, because the HTML no longer names either module.
  - A lab page with no block passes `npm run unit`, and `npm run theme` passes too, printing "every page that loads the shell" over 12 pages.
  - This contradicts `AGENTS.md`'s new claim that "a new page is found without anyone listing it". No page does this today.
- **Fix:**
  - Resolve `src` values as URLs relative to the page, for example `new URL(src, 'http://x/' + pageFile)`, and keep the bare-specifier rule for import specifiers only.
  - Add this case to `test/theme-early.test.js`.

**R4 — nit — `tools/theme.js:101` and `:120`; `docs/learning/gate-proofs.md:152`**
- **What is wrong:** The verdict reads `data-theme` at only two moments:
  - the old value at the first change after `<body>` is inserted;
  - the value at the handshake.

  Every later record is dropped once `settled` is set. The proof's "does not prove" line, "anything between `<body>` … and the handshake other than this one attribute", reads as though the attribute is held across that whole interval.
- **Failing scenario:** A shell edit does `delete dataset.theme`, awaits an import, then re-applies the stored theme. The page shows the system theme in between, which is the flash again. Both instants match, so the gate passes.
- **Fix:** Fail when any post-`<body>` record has an old value other than the expected theme; the records are already collected. Alternatively, reword the bound to "two instants".

**R5 — nit — `docs/learning/defect-register.md:758`**
- **What is wrong:**
  - The root cause cites `src/shell.js` "(`5e9c981`, lines 212–213)". The stored-theme branch, which is the path a reader without `?theme=` actually hits, is line 214.
  - `index.html:62`, `biology/index.html:34` and `tongjian/index.html:81` name no tree. They are right on `5e9c981` but two lines off once this lands: `index.html:62` becomes `.book__body { padding: 0; }`.
- **Failing scenario:** A reader following these citations on `main` after landing finds an unrelated CSS rule, and never sees the branch that caused the reader's defect.
- **Fix:** Cite "lines 212–214", and name `5e9c981` for the three HTML citations or cite them by selector.

**R6 — nit — `docs/learning/defect-register.md:754` against `:765`**
- **What is wrong:** The same fade is "about 150 ms" in the symptom paragraph and "over 240 ms" in the table row, and each figure recurs in other files. 240 ms is the declared `--dur`; about 150 ms is what the recording showed.
- **Failing scenario:** Someone checking the entry against a recording finds one of the two numbers wrong and cannot tell which one the entry meant.
- **Fix:** State both once: a 240 ms transition, of which about 150 ms was visible.

**R7 — nit — `tools/shot.js:83-84`; `docs/devlog/summary.md:3`; the new `shot` entry in `gate-proofs.md`**
- **What is wrong:** "61 of 72" is set against "51 of 84" as before and after. But 84 frames is 14 pages and 72 is 12, and no file names the two extra pages. The local rule on stated measures requires the population to be named.
- **Failing scenario:** A reader credits the whole drop from 33 differing frames to 11 to the block and the settle wait, when part of it is population.
- **Fix:** Name the frozen tree's 14 pages, or restate the "before" numbers over the 12 pages both trees share.

**Checked and found sound, answering the brief's direct questions:**
- **Block against shell:** The head block resolves the theme exactly as the shell does for every input I could construct: an unknown, repeated or empty `?theme=`; an empty or unknown stored value; `getItem` throwing; the storage accessor throwing. It cannot throw outside its `try`.
- **Shell diff and the event:** The `src/shell.js` diff is only the import and the comment swap. `tb-theme-change` still fires at the same point, and its only listeners attach later (`figure.js` on connect, `flow.js` after a click).
- **Discovery today:** It finds all 13 published HTML files, `lab/` included, and skips excluded trees.
- **`tools/theme.js`:**
  - The verdict depends only on the order of mutation records, not on timing.
  - `THEME_PAGES` goes through `trim()`, so a value naming nothing stops the run.
- **The "7 fetch(es) failed" line:** It is harmless, not a hole.
  - Errors are read before `context.close()`, and a request that fails while the page is open is handed back to the browser and reaches `requestfailed`.
  - What that counter records here is in-flight fetches from lazily mounted figures (there is no `?eager=1`), aborted when each context closes.
- **The settle wait:** It is bounded at 120 animation frames and does not touch `openPage` or the handshake. It needs no "started" guard, because `getAnimations()` updates style first.
  - The order is right: audits, then settle, then screenshot, then font census. The colour-hook audit can itself start transitions, so the wait belongs after it.
  - The 400 ms ceiling holds: I found no longer duration, no SMIL and no shadow roots.
- **Standing records:** Every new `##` entry has an index line whose anchor resolves. `test/standing-docs.test.js` is green, I checked the slugs by hand, and its bound (index and entries agree; placement and accuracy are not checked) is met.
- **Proof provenance:** Every digest the proofs name matches the files as they stand, including the delete arm's `776ff309…` (the `main` page with CRLF endings). The drift arms' reported columns, 155 and 24, match what the code computes.
- **Tests run:** `node --test` on `theme-early`, `standing-docs` and `trim` all pass.

**Not checked:** I ran no browser gate, per the brief, so page behaviour was judged from the code. For the coordinator: this round has no `docs/work/` folder to hold this review, and the devlog's "Code reviewer comments: None yet" will be out of date once it lands.

### Focused re-review of the fix round (the same subagent)

The same reviewer then read the fix round's delta. Its report was relayed by the coordinator and is not reproduced here. Its verdict was **"Ready to land"**: R1 to R7 resolved, and two optional nits, F1 and F2 below.

## Findings and disposition

The IDs are the reviewer's own. The coordinator accepted all seven. Every repair was made in the same worktree, still uncommitted, and the fix round's delta is `out/review-runs/fixround.diff`, a diff from the reviewed revision to the repaired one.

| ID | Finding | Disposition and reason | Repair or follow-up |
|---|---|---|---|
| R1 | The design of record, `docs/design/textbook.md:160` and `:172`, still promised a screenshot that is the same frame every run. `tools/lib/browser.js` still rested its CPU-rasterizer default on that promise. | Accepted. `AGENTS.md` had withdrawn the promise, and this round measured it false. | Both sentences in `textbook.md` now say that pinning makes a figure's state and drawing the same every run, not a screenshot's bytes, and point at `tools/shot.js`'s header. `browser.js`'s comment now rests the default on the sweep's own measurement (on the CPU, 180 of 180 frames identical; on the GPU, 119 of 180 with a 1–2/255 jitter), and says that measurement is not a promise about every gate's frames. The coordinator lifted the brief's ban on `browser.js` for this comment block only. Only comment lines changed: every other line of the file, the handshake wait included, is identical to `5e9c981`. |
| R2 | `AGENTS.md`'s invariant carried status, "`soup` is a known breach". The breach was nowhere in the defect register, and no gate covers it. | Accepted. A standing rule should not carry status that another session's fix would make false without anyone editing `AGENTS.md`. | The rule stays ("Nor may a figure's frame depend on when a webfont arrived"), and the `soup` clause became a pointer to the register. The register has a new entry for `soup`: 475 water molecules against 474, 3 loads of 3 each, on the 2026-09-17 freeze, whose `soup.js` is byte-identical to `5e9c981`'s. It gives the mechanism (`soup.js:734` and `:750`, and the `document.fonts.ready` handler at `:1614`, which redraws but does not rebuild) and the owner: the textbook session, queued for its next worker on chapter 2's figures, with the fix shape "rebuild on `document.fonts.ready`, as `scale.js` does". It says "no gate yet". The entry has its index row and a "By area" line. `soup.js` was not touched. |
| R3 | `tools/lib/shell-pages.js` resolved a page's `<script src>` by the import-specifier rule, so a relative `src="lab.js"` was dropped as a bare specifier. Neither of the test's second derivations covers such a page. | Accepted. | A `src` is now resolved as a URL relative to the page; import specifiers keep the bare-specifier rule. `test/theme-early.test.js` holds the reviewer's case as a fixture (`test/fixtures/shell-pages/`), beside a page whose script reaches nothing. Before the fix it was red, `it returned null`; after it, green, with the real tree's 13 pages unchanged. The verbatim failure is in `docs/learning/gate-proofs.md`. |
| R4 | `tools/theme.js` read `data-theme` at two instants only, so a shell that deleted the attribute and re-applied it after an await passed. | Accepted. | The probe keeps the old value of every change after `<body>`, and the verdict fails any that is not the page's theme. Every clean line prints how many changes it saw. On the reviewer's mutation (`delete document.documentElement.dataset.theme; await new Promise((resolve) => setTimeout(resolve, 50));` in `src/shell.js`, `THEME_PAGES=library`), the gate as reviewed exited 0 and the fixed gate exits 1 on 4 of 7 loads; the verbatim failure is in `docs/learning/gate-proofs.md`. The gate's header, the `npm run theme` bullet in `AGENTS.md`, the gate-proofs entry's bound and the register's table row now describe the interval. |
| R5 | The register cited `src/shell.js` lines 212–213, where the branch a reader without `?theme=` takes is line 214. It also cited three HTML lines by number with no tree. | Accepted. | The citation is now lines 212–214, naming 214 as the stored-choice branch. The three HTML citations are by selector, with their line numbers on `5e9c981`. |
| R6 | The fade was "about 150 ms" in the register's symptom and "over 240 ms" in its table. | Accepted. | Both numbers are stated once. It is a 240 ms transition (`--dur`), of which about 150 ms was visible in the recording: in the 7 loads that faded, the heading was more than 8/255 off its colour until 137 to 157 ms after the page's first frame. The table row carries no number now, and the other files use the declared 240 ms. |
| R7 | "61 of 72" was set against "51 of 84" as before and after, without naming the two populations. | Accepted. | The coordinator's recount was checked from the baseline's own per-run hashes (`out/review-runs/r7-baseline-12.log`). Over the 12 pages both trees carry: before, 39 of 72 byte-identical, 33 differing, 27 / 24 / 27 per pair; after, 61 of 72, 11 differing, 8 / 8 / 8. Chapters 6 and 7 contributed none of the 33. This is now stated, with the 12 pages named, in `tools/shot.js`'s header, the devlog summary and detailed section, and the gate-proofs entry. |
| F1 | From the re-review, optional: `tools/theme.js`'s interval failure says the page "was styled in another theme", which is not true of a synchronous remove-then-set; it should be worded as a condition. | **Deferred.** The owner asked to reduce scope and finish; the reviewer's verdict was "Ready to land" with this optional. | Not fixed. Open for the next change to `tools/theme.js`; the rule itself stays as it is. |
| F2 | From the re-review, optional: in `tools/lib/shell-pages.js`, `decodeURIComponent(url.pathname)` sits outside the `try`, so a malformed `%` in a `src` throws an error naming neither the page nor the `src`. | **Deferred**, for the same reason. | Not fixed. Open for the next change to `tools/lib/shell-pages.js`, with a test that feeds a malformed `%`. |

The report's closing notes were also acted on. This file is the `docs/work/` home it said the round lacked, agreed with the session that owns round 2, which adds the pointer to round 2's `plan.md`. The detailed devlog's "Code reviewer comments" now summarise this review.

## Verification

Checked before any repair: the working tree's `git diff main` was byte-identical to `out/review-runs/review.diff`, so the repairs start from exactly the reviewed revision.

Run on the repaired tree, each with its log under `out/review-runs/` in the worktree:

- `npm run unit`: `tests 222`, `pass 222`, `fail 0`, one test more than before the repairs (the R3 fixture). `npm run check`: `check: 12 page(s) pass`.
- **R3:** `node --test test/theme-early.test.js` with the fixture and the walker as reviewed was red, 4 of 5 passing, with the failure quoted in `docs/learning/gate-proofs.md`. With the fix it was 5 of 5, and the fixture's chain was `lab/index.html -> lab/lab.js -> src/components/index.js -> src/shell.js`.
- **R4:** on the reviewer's mutation, the reviewed gate gave exit 0 and `theme: 7 load(s) clean`, and the fixed gate gave exit 1 and `FAIL: 4 of 7 load(s) had problems`. `src/shell.js` and the tree were restored to their recorded hashes.
- **The full `npm run theme`,** on the final check files: `theme: 91 load(s) clean, 7 situation(s) on each of 13 page(s)`, exit 0, 31 s.
- **The four page arms of the earlier proofs, re-run on the final check files:** the same verdicts as before. The unit test was red on all four; the browser gate was red on `delete`, `drift` and `unguarded` and green on `late`, which is its recorded bound. Every page was restored to its recorded sha256.
- **One trimmed `npm run shot`** (`SHOT_PAGES=library SHOT_THEMES=dark`): 3 loads clean, and all three frames byte-identical to the acceptance run's. Against the reviewed revision, `git diff` limited to the pages, the CSS, the figures, the components, `src/shell.js` and `src/theme-early.js` is empty. Nothing a frame is drawn from changed, so the three-run acceptance measurement was not repeated.

- **The full `npm test` chain,** once, on `f7cb330` plus the repaired change set (`git diff origin/main | sha256sum` = `96e75b73ab7a3fd8…`): 13 of 13 steps, `PASS`, `EXIT=0 seconds=1739` (`out/landing/test-full.log`).

Not run: any cross-model review (see above). F1 and F2 were not applied, so no check was needed for them.

## Round outcome

No blockers. The reviewer made seven findings (three should-fix, R1 to R3, and four nits, R4 to R7). All seven were accepted and repaired, and the focused re-review found the repairs ready to land. Its two optional nits, F1 and F2, are deferred and remain open. No finding was rejected. Coverage was one reviewer from the same model family as the author, because both CLI reviewers abstained. The change set landed on `main` in the commit that carries this record, after the full chain passed 13 of 13.
