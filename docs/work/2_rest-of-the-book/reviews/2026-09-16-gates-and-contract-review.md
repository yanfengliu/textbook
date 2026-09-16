# Review — the hardened gates and the figure contract, `4c4acb8..e6daf7a`

Reviewer: an independent read-only agent, spawned 2026-09-16 with a fixed brief and no authority to edit anything under `src/`, `tools/`, `test/`, `biology/`, `today/`, `docs/design/` or `AGENTS.md`. I wrote nothing but this file and two scratch scripts outside the repository (a tokeniser differ and a contrast calculator, both described where their numbers appear). I did not write any of what I am reviewing.

Target: the committed diff from `4c4acb8` to `HEAD` = `e6daf7a` (two commits, both dated 2026-09-15), read between 2026-09-16 and the working tree at that time. The working tree carries uncommitted edits from four running workers; where one touches a file under review (`AGENTS.md`, `docs/design/textbook.md`, `tools/drive.js`, `src/styles/tokens.css`, `today/index.html`) I read both versions and say which I am citing. Line numbers are HEAD's unless marked (wt). One correction to the brief: the `AGENTS.md` Gates and Invariants edits it lists under item 7 are not in that diff — `git diff 4c4acb8..HEAD -- AGENTS.md` is empty, and HEAD's `AGENTS.md` still describes nine steps and 24 tests; the text I checked against the code is a worker's uncommitted edit (finding 8).

Files read in full: `src/components/figure.js`, `src/components/task.js`, `src/components/mastery.js` (the changed lines, the states, the calibration, the closing and `describe()`), `tools/check-content.js`, `tools/sitting.js`, `tools/lib/browser.js`, `tools/subpath.js`, `tools/test.js`, `tools/devices.js`, `tools/drive.js` (header, harness, ownership check, runner), `tools/shot.js` (filters and summary), `tools/narrow.js` (the describe reads), `src/shell.js`, `test/pages.test.js`, `test/check-content.test.js`, `src/styles/tokens.css`, the border, italic and colour-literal lines of `components.css`, `layout.css`, `learning.css` and `typography.css` with their selectors, the Furniture, Typography, Layout, Components, contract and Gates sections of `docs/design/textbook.md`, the Gates and Invariants sections of `AGENTS.md`, `docs/policies/local-rules.md`, `docs/learning/gate-proofs.md`, and the item banks of chapters 1, 2 and (untracked, outside the brief) 3.

Ran: `node --test --experimental-test-isolation=none test/*.test.js` (122 pass, 0 fail, on the working tree); `node tools/check-content.js` (one expected red, below); the two scratch scripts. No browser gate was run, per the brief.

The short version: the hardening is real and the proofs in `gate-proofs.md` hold for the cases they name. What I found is one level up from them, in the shape the round was about — two gates that run nothing and exit 0 when a filter this round's own id change now empties, a gate whose header claims an end it never checks, an ownership check that reads its subject through four `?.` and treats absence as innocence, and the frame writing a Traditional character into every caption of a Simplified page where the script gate cannot see it. None of the ten steps of `npm test` is affected as `npm test` runs them. Every finding names a fix.

## State of the tree (a timestamp, not findings)

`node tools/check-content.js` on the working tree: 10 pages, one red — `today/index.html: biology/ch03-cells/items.js exists (105 items) and no tb-source in today/index.html points at it`. That is the new `checkStudySources` rule firing on an untracked `items.js` a running worker (`items-ch03`) has just written, with the exact element to add. It is the gate doing its job on a chapter mid-flight, not a finding against HEAD.

One unit run showed `test/element-table.test.js` (untracked, another worker's) red on a list that had changed under it; the next run, minutes later, was 122 of 122 green. The tree is moving.

The design doc and `tokens.css` disagree at HEAD versus the working tree about the Greek fallback face (STIX Two Text at HEAD, Libertinus Serif in the tree); they move together in the same uncommitted change, so it is not a drift.

---

## Findings, by consequence

### 1. `tools/devices.js` and `tools/shot.js` run zero loads and exit 0 when a page filter matches nothing, and this round's id change made the old filter values match nothing

`tools/devices.js:82-85`:

```js
const only = process.env.DEVICE_ONLY ? process.env.DEVICE_ONLY.split(',') : null;
const wanted = only ? DEVICES.filter((d) => only.includes(d.id)) : DEVICES;
const pages = process.env.DEVICE_PAGES ? PAGES.filter((p) => process.env.DEVICE_PAGES.split(',').includes(p.id)) : PAGES;
const engines = process.env.DEVICE_ENGINES ? ENGINES.filter((e) => process.env.DEVICE_ENGINES.split(',').includes(e.id)) : ENGINES;
if (!engines.length) throw new Error(`DEVICE_ENGINES matched no engine; ...`);
```

Only the engines filter is guarded. With `pages` or `wanted` empty, every engine hits `if (!engineDevices.length || !enginePages.length) continue;` at :109 before launching a browser, `report` stays empty, `problems` stays empty, and the tool prints `devices: 0 load(s) over 0 engine-device pair(s) () on 0 page(s), all clean` and exits 0. `tools/shot.js:19-20` has the same two filters (`SHOT_VIEWPORTS`, `SHOT_PAGES`), no guard, and ends with `shot: 0 page loads clean` (:75), exit 0.

What makes this live rather than theoretical: `tools/lib/browser.js:92` changed a chapter's id from `ch01` to `biology/ch01`. The proofs in `gate-proofs.md` were taken with the old ids — `DEVICE_PAGES=library,ch01 DEVICE_ENGINES=webkit,firefox — 8 loads` (gate-proofs.md:254), `DEVICE_PAGES=library DEVICE_ONLY=phone` (:253), `SHOT_PAGES=library` (:216). Re-run today, `DEVICE_PAGES=library,ch01` silently drops the chapter, which is the only page with a rail, glossary terms and wide figures, and reports the remaining loads clean; `DEVICE_PAGES=ch01` alone runs nothing and passes. The summary line does print the zero, which is why the devices header can honestly say it reports what ran — but the exit status is the claim the next command reads, and it says green.

`npm test` passes no environment, so the ten-step chain is unaffected. The exposure is every trimmed run used as evidence: a proof, a handoff, a worker's "I ran it on my kind". This is local-rules' "a check must fail when its subject is missing", one level above the checks this round fixed.

Fix: in both tools, when a filter is set and yields an empty list, throw naming the values that matched nothing and the ids that exist, exactly as :86 does for engines. Add a fixture-free proof: `SHOT_PAGES=ch01 node tools/shot.js` must exit non-zero with `matched no page; pages are library, biology, biology/ch01, …`.

Confidence: high. Read from the code, not executed — running either tool deletes `out/devices/` or `out/shots/`, which the four workers in the tree may be using as evidence.

### 2. `src/components/figure.js:76` writes Traditional 圖 into every caption of a Simplified page, and the script gate reads files, so it cannot see it

```js
const FIGURE_WORDS = { en: 'Figure', zh: '圖' };
function figureWord() {
  const lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  return FIGURE_WORDS[lang.split('-')[0]] ?? FIGURE_WORDS.en;
}
```

All three `tongjian` chapters are `<html lang="zh-Hans">`, and their prose cites `图 1.1`, `图 2.1`, `图 3.1` (grepped). The frame keys on the primary subtag, so `zh-Hans` gets 圖, and every rendered caption reads `圖 N.1` above prose that says 图. 圖 is in `test/fixtures/traditional-only.txt`; `test/lexicon.test.js` reads the authored files (`readFileSync` at :179, :241, :402), never the DOM, so the character the owner ruled out three times in one session (gate-proofs.md:11) is on every figure of the second book and no gate can report it. The checker on the same day was updated the other way — `tools/check-content.js:118` sets `FIGURE_TOKENS.zh = '图'` and accepts both — so the two halves of the same 2026-09-12 fix now disagree about which script a `zh` page is in.

The same function's neighbour was left in English: `figure.setAttribute('aria-label', \`Figure ${this.number}: ${info.title}\`)` at :125, so a screen reader on a Chinese page hears an English word before every figure.

`figure.js` is not modified in the working tree, so this is live at HEAD and now.

Fix: key on the script subtag — `zh-hans` → 图, `zh-hant` → 圖, bare `zh` → 图 because the book is Simplified — and use the same word in the `aria-label`. Gate: the lexicon test cannot reach it; `npm run shot` already loads every page and can read every `.fig-num` on a page whose `lang` starts with `zh` and fail any character in the fixture. Prove it red by leaving 圖 in place once.

Confidence: high.

### 3. `tools/sitting.js` never asserts that the sitting ended, and counts labels over the whole document

The header (:6-7) claims "the sitting reaches an end summary; that summary carries at least one per-objective label". The code: the step loop at :83 runs `for (let step = 0; step < 24; step += 1)` and breaks when nothing is left to press; `snap('end')` at :112 is a file name; nothing reads whether the closing summary is showing. The component reports it — `tb-sitting.describe()` returns `finished: !this.closing.hidden` (`src/components/mastery.js:1198`) — and the gate does not ask. The label query at :164 is `document.querySelectorAll(selector)`, document-wide, and the standing section "Where you stand" (mastery.js:517-554) renders `.tb-mark__word` labels before a single question is asked; the proof's 8 labels are 2 standing plus 6 closing (gate-proofs.md:107).

Two consequences. A sitting that grows past 24 steps — each question is an option press plus at least one advance; calibration is 6 today (mastery.js:647) so the bound holds, but it is nowhere stated — stops mid-sitting and passes with `answered > 0`, `advanced > 0` and the standing labels counted. And the "no labels" branch (:187-194) is reachable only when both lists render none: remove the closing list's `li.append(markElement(…))` (mastery.js:1181) alone and the two standing labels keep it green. The proof went red because the mutation removed both calls (gate-proofs.md:105). The overstatement check is still real — a label anywhere carrying the reserved word after a first sitting is wrong wherever it stands — so the gate is not empty; it proves less than its header says, and the header is what the next reader trusts.

Fix: after the loop, read `document.querySelector('tb-sitting').describe().finished` and fail if false, naming the step count; count labels inside the closing section and require at least one there; state the 24-step bound in the header.

Confidence: high.

### 4. `tools/drive.js:1670-1673` reads the figure's own `describe()` through four `?.` and treats a missing handle as nothing shadowed

```js
const own = window.__textbook?.figures?.[figId]?.handle?.describe?.() || {};
return ['id', 'kind', 'number', 'state'].filter((k) => Object.hasOwn(own, k));
```

The handle reaches `__textbook.figures[id]` only because `figure.js:219` and `:244` publish it; the recipes never use it (`h.describe` at :1652 is the element's `describe()`, the frame's). If the frame stops publishing the handle — a reasonable refactor, since it exposes a figure's internals on a global — or a module's `describe` stops being a function, `own` is `{}` for every kind, the check passes for every kind, and every recipe still passes, because the recipes cannot see the shadow either (gate-proofs.md:231). The proof (gate-proofs.md:230) mutated the figure and never the lookup, so the path that returns `{}` has not been exercised. Today the handle is published and the check is live; the finding is that it cannot tell "no field shadowed" from "no figure inspected".

Fix: read `document.getElementById(figId).handle` and fail when it is missing or its `describe` is not a function, with a message distinct from the shadow one; assert the same thing the recipes rely on — that the handle the check inspected is the one the frame mounted.

Confidence: high.

### 5. `tools/devices.js` skips each of its component suites in silence when its selector matches nothing

`:137 if (!h) return out;` (the header suite), `:177-178 hasRail` (the whole drawer suite), `:263-264 terms` (every popover check), `:300-302 cols` null (the edges suite). Each is legitimately conditional on the library, book and Today pages, which have no rail or terms. On a chapter page a renamed `.tb-header`, `.tb-rail`, `tb-term button` or `.tb-main` empties the suite and the load stays `ok`. The devices proof (gate-proofs.md:249-256) covers the sideways-scroll check only; none of the four suites has been made red, and each can go quiet without a word.

Fix: `PAGES` is built from `BOOKS`, so the tool knows which ids are chapters; on a chapter page require the rail, at least one term button and `.tb-main`, and on every page require the header, each failing by name. Print the counts (`31 terms pressed`) on the `ok` line, the way sitting now prints its label count.

Confidence: high.

### 6. `tools/devices.js:284-287` names the wrong term in its message

The loop was widened to every term (:269) and the comment at :265-268 says why: the defect was term 15 of 31. The three messages still say `${which === 0 ? 'the first' : 'the last'}`, so a definition hanging off the edge on term 15 is reported as "last term". Error messages are a product surface. Fix: `term ${which + 1} of ${terms} ("${text}")`.

Confidence: high.

### 7. `expectProblems` implements "not a number" as "not coercible by `Number()`"

`src/components/task.js:268-273`:

```js
function literalFor(op, expected, path) {
  if (op !== '>' && op !== '>=' && op !== '<' && op !== '<=') return expected;
  const b = Number(expected);
  if (!Number.isFinite(b)) throw new ExpectError(...);
```

Measured with the grader's own exports: `x > ""`, `x >= ' '`, `x > null`, `x > true` and `x < false` all return `[]` from `expectProblems(src)` and grade as `> 0`, `> 0`, `> 0`, `> 1`, `< 0`. An author who writes `core > ''` or `lensMetres < null` gets a task that is wrong for ever without a word, which is the class the check was built for (gate-proofs.md:258-266). The fixtures pin `'hot'`, `up`, `two` and `2ee`; none pins an empty string, a boolean or `null`. No bank does this today — all 49 expects of chapters 1 and 2 and the 29 of chapter 3 pass — so this is a gap in the claim, not a live defect.

Fix: the tokenizer already yields a JavaScript number for a numeric literal (`:123`), so `literalFor` can require `typeof expected === 'number'` and name what it got; add `x > ""` and `x > null` to the fixture that must fail.

Confidence: high.

### 8. The documents of record disagree with the code on counts, lists and dates

- The `AGENTS.md` Gates and Invariants text the brief lists as part of this round is not in `4c4acb8..HEAD`: `git diff 4c4acb8..HEAD -- AGENTS.md` is empty. At HEAD, `AGENTS.md:113` says `npm test` runs nine steps, `:114` says `npm run unit` is 24 tests, there is no `npm run devices` line, the sitting line predates the export wording, and the invariant that the frame owns `id`, `kind`, `number` and `state` is absent — while the code at HEAD has ten steps, devices in the chain, the export-driven sitting check and the ownership check. The version I reviewed against the code is a worker's uncommitted edit (wt), and its unit count moved from 88 to 122 between two of my reads, so it is being kept current; `tools/test.js:19` still says 88 in a comment, and at HEAD there are 118 `test(` calls across 11 files. Until that edit lands, main's own account of its gates is the stale one, and under the fleet rule that only merged work counts, item 7's `AGENTS.md` half does not yet exist.
- `AGENTS.md:122` (wt) says the WebKit and Firefox arms run "over the pages that carry every component". `CROSS_PAGES = ['library', 'biology/ch01']` (devices.js:72). `<tb-sitting>`, `<tb-task>`, the mastery marks and the free-response form exist only on `/today/`, which no WebKit or Firefox run ever loads.
- `AGENTS.md:122` (wt) says the gate "presses every control with the input that device actually has". It presses the nav toggle, one rail link, every term button and an outside tap (:193-292). It presses no check option, no sort control and no figure control.
- `tools/devices.js:19-23` (header) lists seven shapes; `DEVICES` has nine — Android phone, phone landscape and wide desktop are missing from the sentence. `AGENTS.md:122` (wt)'s list of nine is right.
- `docs/design/textbook.md:178-190` (Gates) lists five gates plus `node --test` and says `npm test` is "then the five above" (:187); there are ten, and its drive line (:185) lacks the ownership clause `AGENTS.md:119` (wt) carries. `AGENTS.md` is the declared home of what proves the book, but a design of record that names half the gates will be read by someone.
- `docs/learning/gate-proofs.md:11` and `tools/check-content.js:115` date the script conversion "2026-09-18". The commits are dated 2026-09-15 and today is 2026-09-16. The file's preamble asks every entry to name the tree its numbers were taken on; a date after the tree cannot be matched to a revision.

Confidence: high on each; they are counts and greps.

### 9. The Furniture rule is true of the chapter furniture and false of the Today page

`docs/design/textbook.md:94`: "There is one drawn rectangle in the book, `.tb-figure__stage` … The popover a glossary term opens is the one other framed thing." `components.css` meets it: the stage (:24-32) is the box, `.tb-term__pop` (:297-316) the exception, `tb-sort .choose` (:720-728) the one declared control, and everything else in the chapter vocabulary is a rule. But `learning.css` was not part of the redesign (13 lines changed in this diff) and still sets the Today page in the shape the doc says was removed at :96 — "a bordered card holding four bordered rows each holding an outlined circle": `.tb-step` (`learning.css:322-323`, `border: 1px solid var(--rule); border-radius: var(--radius-lg)`), `.tb-opt` (:421-422, bordered rounded rows), `.tb-opt .k` (:461-462, `border-radius: 999px` outlined circle), plus pills at :353-354, :594-608, :732-733, :890-891, :944-945 and cards at :659-661, :869-870. So one multiple-choice question is set two ways in one site: as an exam-paper question in a chapter and as the old card on Today. Not a regression of this diff — a sentence wider than the change it describes, and, under local-rules' typography bar, a page a typographer would change.

Also in the prose vocabulary: `code, kbd` (`typography.css:309-315`) is a bordered box with a 4px radius; no chapter uses `<code>` today, so it is dormant.

Fix: either scope the sentence to chapter pages and say Today is next, or bring `learning.css` to the same rule. The second is the one the bar asks for.

Confidence: high on the CSS; I did not render either page.

### 10. Smaller things, as a list

- `src/styles/layout.css:868-869` sets `background: #fff; color: #000` inside `@media print`, where the block at :816-824 has just redefined the tokens for paper; these two should be `var(--paper)` and `var(--ink)`. The redefinitions themselves are token values, which is the right way to do print.
- `tools/check-content.js:378`'s message hard-codes "because chapters 1 and 2 have one"; there are three now and the number will keep moving. Say "because at least one chapter on disk has one" or count them.
- `tools/sitting.js:39` takes `SITTING_THEMES` as a raw list; `SITTING_THEMES=lgiht` runs the light theme under a wrong label and passes. Same class as finding 1, lower stakes.
- `checkDocument` runs "every glossary entry is used" only when the page has a `<tb-glossary>` (:171), and nothing requires a chapter page to have one; a chapter that dropped its glossary section would pass. Pre-existing, adjacent to the diff, keyed on the element rather than on `main[data-chapter]`.

---

## What I checked and found clean

Stated so the absence of a finding means something.

- **The tokeniser change alters exactly one grade.** A scratch differ (`ab-tokens.mjs`, the two `TOKEN` regexes copied byte for byte from `4c4acb8` and `HEAD`, the parser being unchanged between them) over the 49 task expects of chapters 1 and 2: 48 token streams identical; one differs, `biology/ch01-what-is-life/items.js` `i-resolution-limits-2`, `nearest === 'influenza' and lensMetres < 2e-7`, old `[… "<", 2, word "e-7"]` → new `[… "<", 2e-7]`. `expectProblems` is empty on all 49, and on chapter 3's 29 (untracked, outside the brief, identical on all 29). Grades through `evalExpect` on the new AST: influenza at 1e-7 → true, at 3e-7 → false, hair at 1e-7 → false, as the proof states. `compare()`'s refactor keeps the order of its two checks and their messages. The Node guard (`HostElement`, the `customElements` test) changes nothing in a browser, where both globals exist.
- **`describe()`'s new order breaks no reader.** Every consumer: `src/shell.js:46` (`describeFigures`), `tools/shot.js:42` through `openPage`, `tools/figure-shot.js:44-45`, `tools/narrow.js:123`, `tools/perf.js:41` (draw calls only), `tools/sweep3d.js:80` (`view.distance`), the `drive.js` recipes (own fields only, through the element), `task.js:448` and `:489` (no expect in any bank names `id`, `kind`, `number` or `state` — grepped), `lab/index.html:76-77` (reads `dataset.state` for the state and shows the JSON). None depended on the figure's own `state` winning; `figure-shot` and `narrow` were the two the old order broke for `foldlab`, and the new order fixes them. A static walk over every `describe()` in `src/figures/*.js`, including the six working-tree-modified modules and the `zj-*` modules, finds no own key with one of the four names. `foldlab` reports `foldState` (`foldlab.js:327`).
- **`checkStudySources` cannot pass over nothing.** No `<tb-sitting>` fails (:373-376); no bank fails (:377-380); a page without the element is not asked and the run fails anyway when banks exist and no page carries one (:491-496). `data-key` is what the store files by (`mastery.js:384` reads `a.dataset.key`), the keys match `discoverBooks`'s id shape, and HEAD's `today/index.html` lists ch01 and ch02 with the right hrefs and keys. Observed red on the live tree for ch03, with the exact element to add.
- **`checkChapterData` is keyed on the objectives.** The three-items rule (:343-351) fails a chapter with objectives and no items; an `items.js` that exports nothing named `ITEMS` reaches the same red through the default parameter; `expectProblems` is reached for every `kind: 'task'` with an `expect`; cross-chapter prerequisites resolve against every other chapter's ids (:282-288). The fixtures call the real functions with fixtures rather than restating the grammar.
- **Discovery is derived twice.** `test/pages.test.js` walks the tree without `discoverBooks`, asserts its own walk found something, requires the two to agree, asserts the `<book>/chNN` id shape rather than uniqueness, and excludes `today/` and `lab/` by their having no chapters. `tools/subpath.js:64-67` derives from the same `PAGES` and appends the lab; `isExcluded` (:56-59) matches paths, not first segments.
- **`tools/test.js` is ten steps** in the stated order, `devices` between `narrow` and `sweep3d`; the working-tree `AGENTS.md` list matches, and HEAD's says nine (finding 8).
- **Nine devices, three engines**, `DRAWER_BELOW = 800` equals the `layout.css` breakpoint, and the 1400px margin fold in the doc matches the three `@media (min-width: 1400px)` blocks.
- **The contract.** `figure.js:204-211` builds ctx `{ palette, theme, reducedMotion, pinnedTime, onReady, onError }`, which is the doc's list (`textbook.md:132ff`); `destroy`, `setTime`, `describe`, `setVisible`, `setTheme` (optional, :257) and `setView` are each called where the doc says. `AGENTS.md:132` (wt)'s line omits the optional `setTheme`, which is an omission and not a contradiction.
- **Contrast holds where the tokens are used.** A scratch calculator over the hex values in `tokens.css`, `color-mix(in srgb …)` taken as gamma-encoded interpolation: every token set as a `color:` anywhere in `src/styles` — `ink`, `ink-soft`, `ink-faint`, `leaf-text`, `water-text`, `coral-text`, and `paper` on the three `-text` fills — is at least 4.70:1 on every background it is actually set on, in both themes; the ratios in `tokens.css:33-34`'s own comment agree with mine to 0.02. The only pairs under 4.5 (`ink-faint` 4.29 light and 4.33 dark, `water-text` 4.42 light, all on `--paper-3`) do not occur: `--paper-3` backs only `.tb-iconbtn:hover` (`layout.css:145`), whose text is `--ink` at 13.7 and 11.7. No raw accent (`--leaf`, `--water`, `--coral`, `--violet`, `--gold`) is used as a text colour anywhere in `src/styles`; `--coral` on paper would be 3.32 and `--gold` 2.26, which is why the `-text` variants exist.
- **No synthesised italic in the authored pages.** `em` (`typography.css:121`) is global and `blockquote` (:143-158) states `--font-text`; Fraunces is requested without `ital`, Newsreader with it, Inter without. No `<em>` or `<i>` sits inside any display-face element (h1–h4, `tb-key p`, the glossary `dt`, `.tb-props li b`, `.fig-card h5`, the opener) or in an Inter-set cell: `td` is `--font-text` (:281), only `td.num, th.num` are Inter (:302), and the one `<em>` row in a table (ch02:132) is in plain cells. The seven `<i>` (cis, trans, n) and two `<cite>` in the chapters are all in body prose.
- **Colour literals.** None outside `tokens.css` except the print block (token redefinitions, the right mechanism) and the two lines in finding 10; every `color-mix` derives from a token.
- **British spelling and the one-line-per-paragraph rule** in the changed comments and docs: no violations noticed while reading.

## What I could not check

- **Anything rendered.** No browser, so nothing about pixels: the 圖 caption as a reader sees it, the Today page's boxes beside a chapter's rules, or tap targets as laid out. `tb-term > button` (`components.css:274`) is inline and its hit box is the line box's; `devices.js` measures only header controls (:134-163), so the "tap targets at 24 px" claim is proved for the header and the sort's segmented control (padding arithmetic, :748) and asserted for nothing else.
- **The red proofs, by re-running them.** The brief forbids the browser gates while four workers are in the tree and one expensive gate runs at a time; findings 1, 3, 4 and 5 are read from the code and their fixes should each be proved red the way `gate-proofs.md` records.
- **`npm run unit` as `npm test` runs it.** Under this session's process policy `node --test` spawns nothing (local-rules: "Running the gates in this environment"); I ran the same files in one process, 122 pass.
- **The scheduler and the mastery thresholds.** Not in this diff; `mastery.js` changed only the two exports and the class use. `store.mastery()` was read only as the sitting gate's independent half.
- **The `zj-*` figures' `describe()` at runtime.** Static only; the drive gate is what asks them.

## Verdict

Sound means the change does what it claims and the claim is one the gate can make; sound with fixes means the change is right and something named above should land with it; unsound means it does not do what it claims.

1. **`src/components/figure.js` `describe()` order and the `drive.js` ownership check — sound with fixes.** The spread order is right, the invariant is stated in three places and the mutation went red. The check should fail when it cannot find the handle (finding 4), and the same file writes 圖 onto Simplified pages (finding 2), which is not the brief's question but is in the diff. Confidence: high.
2. **`src/components/task.js` — sound with fixes.** The one runtime change reaches exactly the one item the proof names, and 48 of 49 grades are byte-identical; `expectProblems` and `compare()` share `literalFor` so they cannot disagree. The check's claim is wider than its code by the `Number()` coercions (finding 7). Confidence: high.
3. **`tools/check-content.js` — sound.** Every new rule is keyed on the thing that makes it required, each refuses to pass over nothing, the fixtures exercise the real functions, and the live tree shows it red on the right thing. Confidence: high.
4. **`tools/sitting.js` and `src/components/mastery.js` — sound with fixes.** The subject is read from the component and the record from the store, the probe marker separates the two failure kinds, the precondition is asserted, and the count is printed. The header claims an end and a summary the code never checks (finding 3). Confidence: high.
5. **`tools/lib/browser.js`, `tools/subpath.js`, `test/pages.test.js` — sound.** Derived, derived a second way, non-empty, book-qualified. Its one side effect — the old ids now match nothing in the trimmed runs — is finding 1 and belongs to the tools that filter. Confidence: high.
6. **`tools/test.js` and `tools/devices.js` — sound with fixes.** Devices is in the chain; the nine devices and three engines are as documented. The empty-filter green (finding 1), the silent suites (finding 5) and the mislabelled term (finding 6) should land before the gate is used again as evidence for anything trimmed. Confidence: high.
7. **`docs/design/textbook.md` — sound with fixes; `AGENTS.md` — not on main.** The Furniture, typography and hanging-punctuation sections say what the CSS does for the chapter pages, and the contract matches the frame; its Gates section is stale (finding 8). The `AGENTS.md` half is not in the reviewed diff: HEAD still says nine steps and 24 tests, and the text that matches the code is a worker's uncommitted edit, which I checked and found right except for the "every component" claim. It counts once it is merged. Confidence: high.
8. **`src/styles/**` — sound with fixes for the claims as stated.** One drawn rectangle holds for the chapter furniture and the popover is the stated exception; every text colour clears AA on the backgrounds it is set on, by arithmetic; no italic is asked of a face that has none; no colour literal outside the print block. The Today page is the exception the sentence does not admit (finding 9), and it is the exception a typographer would change. Confidence: high on what can be read, and none on how it looks.
