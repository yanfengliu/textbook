# 《资治通鉴》 — a second book, read with its own lexicon

Status: **in progress**
Owner: Integration owner (textbook session, 2026-09-12)
Created: 2026-09-12
Updated: 2026-09-12

The design of record is [docs/design/tongjian.md](../../design/tongjian.md). This plan holds status, ownership, and the order of work.

> **Allocation.** `docs/work/registry.json` records allocations 0–3. This is allocation 4, assigned directly because `node scripts/work-docs.mjs` is not present in this repository and the registry is a plain JSON file. The registry is updated in the same commit as this plan.

## Problem and outcome

The owner asked for a new textbook carrying the original Chinese of 资治通鉴 beside a modern Chinese translation, in which clicking any 字 or 词 gives its meaning and examples of its use; a few chapters as a prototype; built so it interferes as little as possible with the other textbooks in this repository; and committed so that only this work lands.

Outcome: a reader opens 通鑑 卷一 周紀一 in three chapters, reads the original set to a character grid, sees a translation beside it sentence for sentence, and clicks any character or word for a card giving its reading, its part of speech, its meaning in that place, every meaning it carries in 通鑑 with an attested quotation, and where else this chapter uses it. Every quotation on the page is verbatim from a fetched, tracked source. The book passes every gate the repository has, and adding it edited six lines of shared code.

## Scope

**Included.** Three chapters of 周紀一 (三家分晋, 智伯之亡, 才德論), a character-and-word lexicon with a card UI, `tongjian/zj.css` as the book's own type system, three figure kinds, an objectives/items study layer, a corpus fixture with verbatim tests, and the six shared-file edits listed in the design.

**Excluded.** Vertical setting (the right second stage, not the first); more chapters than three; a general classical dictionary; Traditional characters as a reader option; translating the shell (the rail title stays English — recorded as a known gap below rather than fixed, because `src/shell.js` is another worker's file and this book does not need to win that argument to ship).

**Dependency.** The corpus is the gate on everything: prose, glosses and examples are written against `tongjian/corpus.js`, and nothing is quoted until it is in the corpus with two fetched sources. The source-recon worker's verified text is the input.

**Ownership boundaries.** Shared files — `src/figures/registry.js`, `tools/drive.js`, `index.html`, `today/index.html` — are edited by the integration owner only, one worker at a time, because `docs/work/2_rest-of-the-book` and `docs/work/3_bilingual` are both live and `today/index.html` is on the bilingual plan's list. `src/components/term.js` is edited by one worker (W1) and by nobody else while that worker holds it. `src/styles/*`, `tools/check-content.js`, `tools/lib/browser.js`, `test/pages.test.js` and `src/shell.js` are **not edited at all**.

**Concurrent work.** Two other rounds have uncommitted work in the tree. Nothing in this round reverts, reformats or commits a file it did not change, and the baseline below distinguishes this work's failures from theirs.

## Baseline before this work

Measured at `4c4acb8` with the other workers' changes in the tree, so that a later red gate can be attributed. The probe and its raw logs are in the ignored `out/probe-baseline/`.

| Check | Baseline | Cause |
|---|---|---|
| `node tools/check-content.js` | **2 failures, pre-existing** | `biology/ch01`: `i-resolution-limits-2` has an `expect` with a trailing `e-7`; `biology/ch03-cells`: 35 objectives and no `items.js`. Both belong to `docs/work/2_rest-of-the-book` and are not this round's to fix. 4 pages pass; 2 problems across 6 pages is the number to compare against. |
| `npm run unit` as written | **cannot run in this session** | `node --test "test/*.test.js"` spawns a child per file and the sandbox refuses it (`spawn EPERM`, every file). Proved environmental by a control: the same trivial test fails through the runner and passes run directly. `node --test --experimental-test-isolation=none "test/*.test.js"` runs the same tests in one process. |
| The unit suite, via that instrument | **102 tests, 101 pass, 1 fail** | The failure is `test/registry.test.js` — `plantcell3d` is registered and its module does not exist. It is committed, not a worker's edit: `registry.js` is unmodified from HEAD and the module is absent from HEAD too, and `docs/devlog/detailed/2026-09-11-gates-that-did-not-run.md` already records `4c4acb8` being committed red with 16 missing modules of which 15 have since landed. **The unit gate was red before this round.** |
| `npm run shot` | passes for `ch01`, after the browser could be launched | |

**Bound on the baseline**: it names what was red before this round started. A red gate at the end that is one of these is not a regression, and this plan says so in advance rather than arguing it after the fact.

## Shared code this round changed, and why it could not be avoided

The design's promise was six lines of shared change. Three more were forced by a defect the baseline probe found before a single page of the book existed:

**`discoverBooks()` gave every book's chapter 1 the page id `ch01`.** With one book that is unique; with two, `biology/ch01` and `tongjian/ch01` collide. `test/pages.test.js`'s uniqueness assertion would have failed the moment the new book's first page existed — so a *correct* new chapter would have turned an unrelated gate red, and it would have read as "the second book broke the page list" rather than "the page list only worked for one book". Three instruments were ambiguous in the same silent way: `SHOT_PAGES=ch01`, `DEVICE_PAGES=ch01` and `npm run inspect --page ch01` each address every page whose id matches, so a trimmed run would have measured two books' chapter 1 and reported it as one.

Fixed the way the rest of the repository had already chosen: a chapter's page id is book-qualified (`biology/ch01`), which is the shape `tools/check-content.js` and the reader's record already use. Files: `tools/lib/browser.js` (the id), `tools/devices.js` (`CROSS_PAGES`), `test/pages.test.js` (an assertion on the id's shape, since after the fix uniqueness is true by construction and a test of it would agree with the code by definition). Proved red by restoring `` `ch${m[1]}` ``. Recorded in [docs/learning/defect-register.md](../../learning/defect-register.md) and [gate-proofs.md](../../learning/gate-proofs.md).

**A chromium crash dialog, reported by the owner during this session.** `chrome-headless-shell.exe - Application Error / The exception Breakpoint (0x80000003)` is raised by the browser process, outlives the gate that started it, and blocks the desktop. Three launches were measured before any theory was written (all clean, so a launch is not the cause), and the fix is three launch flags applied through `NODE_OPTIONS=--require=./tools/zj-quiet-browser.cjs`. Gated by `test/browser-quiet.test.js` — which deliberately does **not** launch a browser, because `npm test`'s first step is the cheapest gate and must not depend on a downloaded chromium; the launch assertion lives in `tools/zj-quiet-browser-probe.js`.

**The figure-citation rule was English-only.** `checkDocument` built `` new RegExp(`Figure\\s+${chapter}\\.(\\d+)`) ``, so on a page whose prose is Chinese every figure failed as "never mentioned in the prose" — a failure that cannot be fixed from the page side without writing the English word into Chinese prose. `docs/design/i18n.md` had already predicted this exact break and scheduled the fix for a later stage; the second book reached it first. Fixed in `tools/check-content.js` by choosing the token from the page's own `<html lang>` (`Figure` / `圖`) with `\s*` rather than `\s+`, defaulting to English so an English page is unaffected. `test/check-content.test.js` gained a case asserting that the Chinese page still **fails** when it cites the English word, and that `圖 1.1` and `圖1.1` pass; proved red by reverting the lookup to the literal.

## Acceptance criteria

- [ ] `node tools/check-content.js` reports no failure attributable to `tongjian/` — and the two pre-existing biology failures are unchanged.
- [ ] Every quotation on every page is verbatim from `tongjian/corpus.js`, proved by `test/corpus.test.js`, and each corpus entry names two fetched sources.
- [ ] Every character of every 原文 opens a card with a reading, a gloss, and an attested 通鑑 example, driven by real mouse, keyboard and touch input at 390 px and 1440 px.
- [ ] `npm run shot`, `narrow`, `drive`, `devices`, `subpath` are green over the three chapters. `flow` and `sitting` are green unless the two pre-existing biology failures block them, and if blocked that is reported, not hidden.
- [ ] Each new gate rule has been made red by reintroducing the defect, recorded in [docs/learning/gate-proofs.md](../../learning/gate-proofs.md).
- [ ] A person has looked at each chapter at 1×, 2× and 3×, at 390 px and 1440 px, in both themes, and said what they saw in this plan's Outcome section.
- [ ] Independent read-only review of (a) the text and its citations against the corpus, and (b) the typography and the card UI, by a reviewer who did not write either.
- [ ] Only this round's files are committed, and the commit is on `main`.

## The two independent reviews, and what they found

Both were run by workers who did none of the writing, were told to be adversarial, and were given only the design and the artefacts. Both are in the ignored `out/review-text/` and `out/review-type/`; what they established is here because the plan is the record that survives.

### Text: the corpus is faithful, and one defect blocked publication

The text reviewer fetched the Wikisource 卷001 itself, resolved its collation apparatus, reduced it to 4,865 characters and LCS-aligned it against the corpus's 3,557. **Match 3,554; exactly five diff runs, four of them departures the corpus declares, plus the declared scope boundary, and no undeclared difference.** All seven chapter 原文 blocks are byte-identical to the entry their `data-corpus` names; all 1,365 examples are verbatim substrings of one corpus 句; no quotation is misattributed to 通鑑; and every one of the README's fourteen self-reported counts recomputed exactly.

It found one defect that blocked publication: **`夫` declared `pinyin: "fū"` with the 大夫 sense first and no chapter bound it, so a reader clicking 夫 in 「夫才與德異」 was shown `fū / 名 / 與「大」合成「大夫」` and then `又讀 fú`** — five occurrences across chapters 2 and 3 read fú. The same class hit 使 and 難, and ch02's own 字詞 table printed nàn while the card printed nán. The root cause was the frozen data shape: a `use` carried no reading, so **a per-sense reading could not be expressed**, and the multi-reading gate checked what was *declared* and never what was *shown*.

Fixed by adding an optional `reading` to a use, declaring it on 42 uses across 15 entries, binding the 13 chapter-side cases its owner's worklist named, and adding the gate the review asked for — the first check in this repository that asks what the card **shows** rather than what the file **declares**. It found 13 reader-visible errors that 114 tests and four browser gates had passed over.

Also fixed: two chapters asserted in their own prose that the quotation was literal (「標點也照抄」, 「一字不改」) while the corpus prints 類/未/臺 against the source and drops a comma; the book's omission of the whole 禮論 was disclosed nowhere; seventeen margin notes sat in the translation list as rows with an empty source cell, breaking the sentence alignment the design makes a contract; and chapter 1 shipped stale authoring comments.

### Typography: not at the bar, and four of the findings were invisible to every gate

The type reviewer produced 168 frames and a blunt verdict. Four S1 defects, all verifiable in a frame:

| Finding | Now |
|---|---|
| The selected chip in `zj-words` was **1.22:1** — a paper-coloured label on a paper-mixed ground, because the figure's `[aria-pressed]` rule reset `background` and not `color` | with the figure worker |
| `zj-words` clipped **122 px** at a 390 px stage and painted across its own caption | with the figure worker |
| `zj-timeline` clipped **53 px** at 390 px | with the figure worker |
| The chapter 3 caption printed **圖 3.1 twice** — the frame injects a number the source also hardcoded | with the chapter worker |

**`npm run narrow` passed both clipped figures**, because its criteria are: reaches ready, draws a frame that is not blank, flat or near-black, and keeps a control pressable. It never asks whether the content **fits its stage**. That is the bound the gate states, and it is now the reason two figures shipped broken while a gate was watching them.

Also found and being fixed: `--ink-faint` carries the smallest type in the book at **4.29:1**; the card clips its bottom 5 px at 1440 px; the 原文 is only **1.042×** the book's own prose, so the design's claim that it is the primary object is not visible; and chapter 1 had no figure.

**One thing the reviewer did that is worth more than the findings.** It caught its own instrument lying: an early reading of 41-character 原文 lines was an artefact of grouping client rects by rounded top, not a page defect, and the reviewer said so in the report rather than shipping the finding. The lines are flush to the column to within 0.05 px.

### A defect neither review was looking for, found by the device gate and diagnosed here

`npm run devices` reported `tapping a glossary term opened no definition` on several devices, intermittently. A probe over all 172 terms on chapter 2 at a 390 px touch viewport reproduced it: **exactly one term, `三版`, tapped to a button and produced no card**, with the trace `open({hover:true}) → close() → open({hover:true}) → close()`. The raw event stream showed why — on a touch device a tap is a hover and a click in one gesture, the synthetic `mouseleave` and `blur` closed the hover card before the `click` could pin it, and by the time the click arrived the button was no longer under the point, so `mousedown` and `click` were delivered to the surrounding `<li>`.

**Hover-to-open is now attached only where a hover exists** — `matchMedia('(pointer: coarse)')` is the browser's own statement that it does not — so a tap is one event with nothing to race. **0 of 172 terms fail now.** Fixing that exposed a second defect in the same component: the toggle read `hoverOnly`, which is never true on a touch device, so a second tap pinned an already-open card instead of closing it; and on the mouse path, crossing the card to reach the button re-opened it in hover mode and cleared the pin. Both are fixed and both are now covered by a probe that walks the four ways in on both pointer kinds — 10 of 10 paths green — because the biology book shares this component and a fix for one book must not break the other.

## Approach

Five workstreams, sequenced by their dependencies:

| # | Workstream | Owner | Delivers | Depends on |
|---|---|---|---|---|
| W1 | **Slice** — the page, the type system, the card | worker | `tongjian/zj.css`, `tongjian/ch01-.../index.html` (partial), `src/components/term.js` with `<tb-char>`, `tongjian/data/card.js` | source recon |
| W2 | **Corpus and lexicon** — 字詞 data | worker | `tongjian/corpus.js`, `tongjian/lexicon.js`, `tongjian/words.js`, `test/corpus.test.js`, `test/lexicon.test.js` | source recon |
| W3 | **Figures** | worker | `src/figures/zj-split.js`, `zj-timeline.js`, `zj-words.js` | W1's CSS contract |
| W4 | **Prose and study layer** | worker | three `index.html` bodies, `glossary.js`, `objectives.js`, `items.js` | W1's skeleton, W2's lexicon keys |
| W5 | **Integration and acceptance** | integration owner | `registry.js`, `tools/drive.js`, `index.html`, `today/index.html`, `tongjian/index.html`, gates, review, commit | all |

W1 goes first and alone on its files, because a skeleton that three workers build against has to be settled before they start. W2 runs beside it. W3 and W4 start when W1 reports its skeleton frozen and W2 reports the lexicon keys stable.

## Implementation steps

| # | Step | State | Owner | Notes |
|---|---|---|---|---|
| 1 | Source recon: verbatim text, dual sources, dating, risk list | **done** | recon worker | `out/tongjian-recon/sources.md`, 534 lines. Independently spot-checked by the integration owner against a primary-source fetch: the transcription, the editorial-bracket readings, the `(紀)`-class markers and the `避諱` note all agree. It also refuted a claim in this design's own draft — the 「通鑑三家注」 tradition does not exist. |
| 2 | Slice: type system, one chapter's skeleton, the card | **done** | W1 | `zj.css`, `card.js`, `term.js`, ch01's skeleton. |
| 3 | Corpus + lexicon + their tests | in progress | W2 | Corpus done (13 entries, 640 distinct characters, 4 witnesses each). Lexicon assembling from eight parallel drafting lanes; W2 reports 0 characters still to write before the merge. |
| 4 | Figures | modules written | W3 | Three kinds, registered; `drive` recipes still owed. |
| 5 | Prose, glossary, objectives, items | in progress | W4 | Ch01 and ch02 pass `npm run check`; ch03 in progress. No objectives and no items by decision. |
| 6 | Integration: registry, drive recipes, library, today | partly done | owner | Registry entries and the library shelf entry are in; `today/index.html` needs no change at all. Drive recipes owed. |
| 7 | Gates + red proofs | in progress | owner | Three gates written and proved red so far: `browser-quiet`, `pages`' book-qualified id, and the checker's language-aware figure token. |
| 8 | Visual acceptance, independent review, commit | started | owner | Frames rendered and inspected; see Outcome. |

## Outcome

**Verified visually so far, by the integration owner looking at rendered frames** (not at a contact sheet — each frame at its own size): chapter 1 at 1440 px 1×/2×/3× in light and dark and at 390 px 3×; chapter 2 at 1440 px 1×. What was seen:

- The Han face resolves to `Noto Serif SC` on `body` and the page sets as Chinese, not as a fallback — confirmed both by eye and by computed style.
- The 原文 sits inline as one line of type: 21.1 px per character at 20 px type with 1.138 px tracking, no box and no break. The character grid holds.
- The 原文/譯文 pairing reads correctly at 1440 px — 原文 in full ink, 譯文 a step down and lighter, sentence against sentence in two columns.
- **The card works and is the best thing in the book.** A real click on 初 opens 初 / chū / 副, 「起初、當初」, a note, 「通鑑用例」 with 「初，智宣子將以瑤為後。」 and its 卷次, 「在這一章」 with this chapter's sentence, and the way back. A 詞 opens its own card the same way (大夫 / dà fū / 名).
- Chapter 2's text is right: 「恐事未遂而謀洩」 (未, the variant the recon recommended), one corpus 句-group per line.

Two defects were found by looking and are with their owners: the card's link renders in browser-default blue rather than a token, and the pinyin's internal space needs checking at 390 px on the longest entry.

**Not yet verified:** `npm run shot`, `narrow`, `devices`, `subpath`, `drive`; the dark-theme frames beyond chapter 1; the 390 px card; and every acceptance criterion that depends on them. The unit suite is 113 tests, 108 passing, all five failures in the lexicon data that W2 is merging.

## Gate state, as each was last run

Recorded here because the numbers are the evidence, and because two of these were run trimmed and a trimmed run proves only its part.

| Gate | How it was run | Result |
|---|---|---|
| `node --test` (unit) | `--experimental-test-isolation=none "test/*.test.js"` | **117 / 117** |
| `node tools/check-content.js` | whole site | all four `tongjian/` pages `ok`; the one failure is `biology/ch03-cells`, pre-existing |
| `npm run shot` | `SHOT_PAGES=tongjian,tongjian/ch01,tongjian/ch02,tongjian/ch03` | **24 page loads clean**, one figure ready on each chapter page |
| `npm run drive` | `DRIVE_KINDS=zj-split,zj-timeline,zj-words` | **10 steps over 3 figures passed** |
| `npm run subpath` | whole published tree | **44 page loads clean under `/textbook/`**, every request inside the subpath |
| `npm run narrow` | new kinds | `zj-split` and `zj-timeline` ok; `zj-words` was red on the data-fetch defect and has not been re-run since |
| `npm run devices` | `DEVICE_PAGES=…` | **red**, 14 problems over 36 loads: the touch popover defect (fixed, needs a re-run) and the figure clipping the type reviewer found |
| Touch popover probe | all 172 terms, chapter 2, 390 × 844 | **0 failures** (was 1) |
| Popover paths | 4 ways in × 2 pointer kinds, both books | **10 / 10** |
| Figure parse | `test/registry.test.js` | all modules parse; proved red by restoring the defect |

**Two gates were never run whole-site by this round**: `flow` and `sitting`. `flow` cannot visit this book at all — it addresses `/biology/ch01-what-is-life/` as a literal — so it proves nothing here either way. `sitting` is the study queue, and this book ships no objectives or items, so it has nothing of this book's to exercise. Both are reported rather than implied.

- **A book directory at the root, not a chapter inside `biology/`.** Discovery is by directory, so this is free, and it keeps every file of this book out of another book's tree.
- **The lexicon is generated once and reviewed, not written per chapter.** Two chapters cannot disagree about a character if a character has one entry.
- **The corpus is a tracked fixture, not a promise in a README.** It is what makes "grounded in sources" a gate rather than a claim: the test can only pass if the quotations are really the book's words.
- **`<tb-char>` in `term.js` rather than a new component.** The popover, its positioning and its collision handling already exist and are already gated; a second implementation would be a second set of the same bugs. `src/` still does not import `tongjian/`: the page leaves a registry on `textbook.lexicon` and the component asks it for a card, falling through to the glossary path on a page that has none.
- **`zj.css` scoped under `.zj` with no `:root` token.** The book needs a different type system and must not give the biology book one. Custom properties inherit, so `html.zj { --font-text: … }` — specificity (0,1,1) — reaches the whole page and beats `:root` without editing `tokens.css`.
- **The study layer is cut.** No `objectives.js`, no `items.js`, no `objective` attributes, no `today/index.html` edit. The owner asked for a reading prototype; the spaced-repetition queue is a separate feature and the Today page is another round's file. Cost: no gate scores this book. Bought: one fewer shared file than the design promised.
- **A chapter prints only 原文 the corpus covers.** The rule the tests enforce: every sentence inside `.zj-src` is a line of a corpus entry, and every character of it has a `LEXICON` entry. It was decided mid-round on a misreading — chapter 2's page carried 1,049 `<tb-char>` elements with no entry, and the first response was to cut the chapter to fit. The measurement then showed the gap was a 14-entry placeholder `lexicon.js`, not a corpus too large to annotate, and the trim was **withdrawn**: the corpus stays at 640 characters and W2's assembled lexicon covers them. What survives is the rule, which is right whether or not it was needed to justify a trim. The general lesson is written up in the devlog: a failing coverage gate names a *symptom* shared by "the data is too big" and "the data is not written yet", and the two have opposite fixes.

## Risks

| Risk | How it is handled |
|---|---|
| A quotation is plausible but not the book's words | corpus test; two sources per entry; review reads the text against the corpus |
| A gloss is confidently wrong | treated as authored content; independent review; no example rather than an invented one |
| Chinese text set in a system font because the webfont failed | the screenshots are looked at, and `shot` fails a failed request |
| The book breaks a biology gate through a shared file | every shared edit listed in the design; the popover the biology book uses was exercised by hand after `term.js` changed (`tools/zj-probe-biology-popover.js`) |
| Another worker's uncommitted work is committed or reverted | explicit `git add` of named paths only; `git status` inspected before and after; no `git add -A` |
| The three-chapter prototype becomes an unfinished book on the shelf | the library entry and the contents page list exactly the three chapters that exist; later chapters are marked 未寫 rather than promised |
| The lexicon cannot reach every character the chapters print | found early by `test/lexicon.test.js` counting them — 626 of 640 uncovered — which is exactly the check the design promised. The first response was to trim chapter 2; the measurement then showed the gap was a 14-entry placeholder file, not a corpus too large to annotate, and the trim was withdrawn. Both numbers are reported rather than assumed. |

## Outcome

Final state pending; the verified-so-far record is above under "Outcome" in the implementation steps.
