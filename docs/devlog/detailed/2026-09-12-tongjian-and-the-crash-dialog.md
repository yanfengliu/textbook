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

---

# 2026-09-19 — the published book read back, by its owner and by two reader-proxies

2026-09-19. Ten defects, six of them found by a person reading rather than by a check, and two checks that were not gates when this was written — both were proved red afterwards, in the `devices` entry of `docs/learning/gate-proofs.md`. What a later session would trip over.

**The dates in this range are not to be trusted.** This entry is dated 2026-09-19 while the machine clock says 2026-09-16, because the log already runs ahead of the clock: an earlier entry in this same session — the publication line, `2026-09-18` — was dated by guess rather than read, and this entry followed the file rather than the clock. Nothing was re-dated, deliberately: the churn across four files is worth less than this sentence. Treat any date in this devlog between 2026-09-12 and 2026-09-19 as a label for a round and not as a day, and read the commits' own timestamps when the day matters.

## The reader-proxy is now a role, and it is where most of this came from

A worker whose only job is to read the book the way its reader does — click the 原文, finish a sort, answer a question, scroll the 字詞 list — and report what happened, with no mandate to fix anything. Six of the ten defects came from that, and none of the six was reachable by the gates as they stood: two are pointer behaviour (`narrow`, `devices` and `shot` all set a *viewport*, and a narrow viewport on a desktop browser still has a mouse and `pointer: fine`), one is a list a reader had to scroll 5,863 px of, and one is a verdict sentence the gate that does assert verdict sentences asserts on the **other book**.

The three sentences to keep, in the readers' own words, because each one is a defect statement no measure produced:

- *"Moving the mouse across 原文 characters with no clicks opened 14 cards in 14 cursor positions… Chapter 2 has 1,291 clickable characters. My mouse brushed text on the way to the scrollbar and cards fired over the paragraph I was reading. The phone was the better read."*
- *"72 entries, 5,863px tall, in one unbroken column, with no grouping, index or jump. I read about 20 of 72 and scrolled the rest. The sentence that actually unlocked chapter 2 is buried in the back half of it."*
- the owner's own: *"fix top left corner bar icon on mobile. It doesn't do anything. Possibly the same problem on desktop too."*

## The defect worth the whole round: a layout property decided where a click landed

`npm run devices` was failing one check on chapter 2 at three wide viewports — *"tapping a glossary term opened no definition"* — and it failed on every run, without ever being diagnosable: a gate that presses and reads can only report that a card is not there.

**What was believed first, and disproved.** The first three explanations were all about events: the `blur` handler closing the card, the document's outside-click listener firing on the next press, and `matchMedia('(pointer: coarse)')` resolving differently in the gate than in a probe. All three were measured and all three were false. The trace (`out/vanishing/diagnosis.md`) shows the closes have stacks naming `term.js:92` (`mouseleave`) and `term.js:32` (outside click), and the raw stream shows `mousedown` delivered to the `<span class="zj-pair__src">` while `mouseup` was delivered to the button.

**What it was.** `tb-term` was `display: inline`. Appending the card's `<span>` into it gives the CJK line breaker a second element box, and therefore a break opportunity **inside the term**: the justified 原文 re-broke, and 獻子 — term 163 of 172 — moved +318.3 px and one line up, out from under the pointer that opened it. Chromium dispatches `click` on the nearest common ancestor of the press and the release, so the term's own handler never ran and the document handler closed the card. The control table is the part to remember: an absolutely positioned 0×0 span, a static 0×0 span, the card's real box — all of them move it; a `display: none` span and an empty text node do not; and the same box appended to the paragraph or to the next `<tb-char>` does not. **It is not the card's position, size or content. It is any second element box inside the inline term.**

The same measurement produced a second symptom nobody had reported: with one mouse move and no further input, the card opens, the line re-breaks, the word leaves the pointer, the card closes, the line re-breaks back — about ten times a second, for as long as the pointer rests there (`1 0 1 1 0 1 1 0 0 1 0 0` sampled every 100 ms).

**Why only three devices.** The three failing loads are exactly the three whose `kind` is `mouse`; on the six touch devices `TbPopover.connectedCallback` never attaches the hover path at all, because `(pointer: coarse)` matches. A defect that needs a hover and a justified CJK line cannot appear on a device without hover — and every gate that presses a term presses it on a touch device or with a click, so the hover path was outside all of them.

**The fix, and its cost, measured.** `display: inline-block` on `.zj tb-char` and `.zj tb-term`, so the term is atomic to the line breaker. All three chapters, every glyph: 0 moved, worst 0 px, document height unchanged (ch02 1,291 glyphs, 23,901 px). Only the element's own box changes, from the inline font box to the button's line box — which is the box `top: 100%` should have been measuring against all along. Alternatives rejected with reasons in `proposed-fix.md`: moving the card to a fixed layer on `<body>` (fixes the class for both books but rewrites the shared placement and the biology hover), and `inline-block` in the shared sheet (a two-word biology term could no longer wrap).

**The general shape, for the next person.** A click that lands on the wrong element is usually diagnosed as an event problem. Here the cause was a `display` value that looks like a typographic choice, acting on a line breaker that acts on hit-testing. The instrument that found it was a **control table** — hold everything constant and append one thing at a time — not a fix.

## Two checks that were not yet gates when this was written

The canon is explicit that a gate counts only once it has been made to go red by reintroducing the defect. Two checks written this round had not been:

- **The leftmost header control sits in its corner** (`tools/devices.js`): `leftmost.left − header.headerLeft` against the header's own `padding-left`, 4 px of tolerance. The existing corner check measured the **rightmost** control only, which is why the owner's report — about the top-left one — had no gate behind it. This is a check on where the control sits, **not** on what a press on it does.
- **The reading column uses a wide screen** (`tools/devices.js:441-496`): the reading column (`.tb-text`) **and** the 原文/譯文 block (`.zj-src`) must each hold at least half of a 1280–1920 px viewport on a `tongjian` chapter, and a page of that book with no `.zj-src`, or with no row carrying both registers, fails rather than having nothing to measure. Measured there as 66.3% at 1280, 58.2% at 1440 and 52.8% at 1920; the old fixed 698 px column was 48.4% at 1440 and 36.3% at 1920. The band excludes widths above 1920 deliberately, because the measure is capped at 63.4rem on purpose and the share falls there by design. The floor is 50% and not 52.8% so that a rung may be retuned without the gate going red for a design change.

**Both were proved red afterwards**, on 2026-09-19, by the three mutations in the `devices` entry of [gate-proofs.md](../../learning/gate-proofs.md): the leftmost control pushed out of its corner, which left the right-corner check green; the pre-fix 43.6rem measure put back, which reproduces the owner's 36.3% at 1920 px; and a header holding no control at all, which fails naming the selector rather than measuring nothing.

## What the owner asked for, including the one that turned out to work

- **The width.** *"You are not taking advantage of the full width the page, especially on desktop."* Measured as a defect rather than a preference: 698 px at 1280, 1440, 1920 and 2560 — 55%, 48%, 36%, 27%. The ladder and its measurements are in `restructure.md`; the accepted cost was **believed then** to be 43.1 Han characters a line at 1920 px against a comfortable band of 28–36 and a practical ceiling of 40, with the lever named if it ever reads long. It was re-measured twice, and the lever was not pulled. The first re-measurement read the shipped rungs at 1920 px as **52–56 characters a line on chapter 2** (`out/widthgate/probe-prose.mjs`, which counts every non-space glyph). Counted for Han alone and with the cap not binding, the same lines hold **45 characters** (`out/remeasure/probe-cap-control.mjs`, its uncapped arm). The second was taken after the retune and gives **36 Han characters a line on chapter 1 and 35 on chapters 2 and 3, with the worst line 38, identical at 1280, 1440, 1600, 1920 and 2560 px** (`out/remeasure/probe-prose-han.mjs`). What was done instead of pulling the lever was a cap on the line: `--prose-measure: 50rem` in §6b of `tongjian/zj.css`, which leaves the reading column and the 原文/譯文 pair untouched at 848 / 838.4 / 998.4 / 1014.4 px.
- **The scripts.** A request rather than a defect, and said so in the register: the book had been converted to Simplified whole, the owner asked for the received text to keep its script, and the rule that landed is the split, gated both ways.
- **The contents button.** *"fix top left corner bar icon on mobile. It doesn't do anything."* **Re-measured for the register and it works**: on the working tree and on the published site, a touch tap on `.tb-navtoggle` opens the drawer at 320, 360, 390 and 430 px on both books — button 34×34 px, `expanded=true`, drawer on screen, scrim shown, page locked (`out/defectdoc/probe-navtoggle-shapes.js`, `out/zj-scratch/probe-published-toggle.js`). The explanation the record does support is the target's **size**: at 320 px the header was crowded enough that the two icon buttons shrank to **19 px** against a 24 px minimum, which `4c4acb8` fixed with `flex: 0 0 auto` and a 2.1 rem square (`src/styles/layout.css`), and `4c4acb8` is also the last commit to touch `src/shell.js`. **Which build the owner was reading is not in the record** — a stale deployment explains the report just as well, and nothing here proves which. What was genuinely uncovered is the corner: the check pinned the **rightmost** control only, and the leftmost one's corner is added in this round's working tree. Where a control sits and whether a press on it works are two different questions, and the second is covered by the drawer suite.

## The 字詞 list had no order a reader could scan

`localeCompare` on Han head-words returns ICU's radical-and-stroke order — chapter 2's 72 entries come out 三版, 不如, 二心, 人臣, 代成君 … 飲器, 驂乘, 魏斯, 魏桓子 — which is not pinyin and not anything a reader can predict. So the one browsable surface in the book was a 5,863 px column with no way in, and the reader's report says what that costs: *"I read about 20 of 72 and scrolled the rest."*

The list now carries an index of its first characters: one link per contiguous run, with a count where a character leads more than one entry, because 智⁶ is six entries about one family and that is the question a reader has. Chapter 2 has 59 distinct first characters for its 72 entries, so the index is two lines at a desktop measure against a 5,263 px list.

**What is deliberately not there is a heading per run**, and the measurement is the reason: 59 headings into a list averaging 1.2 entries per run would be 1,534 px of type repeating the first character of the head-word under it, and chapter 3 would get 30 headings for 30 runs. The index carries the structure; the entries stay a list. The index is built only where the head-words are Han, decided from the head-words themselves rather than from the book, so the biology book's Latin list renders exactly as it always has — 0 of its 31 head-words begin with a Han character.

**Checked against the data, not against the component's comment:** re-deriving the list's order from each chapter's `glossary.js` gives chapter 1: 2 entries/2 runs, chapter 2: 72 entries, 59 distinct first characters, 59 runs, chapter 3: 31 entries/30 runs, **0 characters split across runs** in any chapter, and the only runs of more than one are 智⁶, 趙⁶, 無², 輔² and 魏² — which is exactly the shape the index is for (`out/defectdoc/check-index-order.mjs`). The component's own comment lists the order as 三版, 不如, 二心, 人臣 — the measured order is 三版, 不如, **尹鐸**, 二心, 人臣, 代成君, 任章, 伯魯 — so the comment names the right register and a slightly different run of neighbours. Anyone reading the order out of that comment should re-derive it.

## The colour system, and a rule that failed silently

The owner said the colours were fine and there should probably be more of them. Round two of the colour work is in the working tree, and its evidence is `out/colour2/handoff.md`, which is git-ignored — so the numbers live in the register's round and in `docs/design/tongjian.md` now.

Nine marks: the date gold, the 青 on a textual-criticism note, and the four houses 魏/趙/韓/智 spent through the glossary's `data-state` hook. Contrast measured against all three paper surfaces in both themes, 60 pairs, all matching. The two numbers that changed: the date colour at **6.56:1 light and 10.54:1 dark** (where `--gold` itself is **2.26:1** on paper and so could not be spent), and the two deliberate non-spends — `--gold` itself, and the shared `--ink-faint` at 4.29:1 on the third surface.

**The rule that matched its element and did not paint it.** `.zj [data-state="wei"]` is (0,2,0); chapter 1's 字 glyphs are `.zj .zj-lex__glyph { color: var(--ink) }`, also (0,2,0), stated 90 lines later — so the later rule won on source order. `el.matches('.zj [data-state="wei"]')` was `true` while the computed colour was ink. That is a shape of failure **no screenshot can tell from "the rule is not there"**, and the fix is one more unit of specificity, `[data-state="wei"][data-state]`, and deliberately not the lexicon class: naming the class would have fixed the one element in front of it and gone on losing to the next one.

The worker's own judgement, recorded as theirs and not as a defect: the 智 grey is the weakest of the nine and a reader will not name it as a colour — it is the "quiet" the design intends, and the alternative would spend a hue on a mood.

## Two things that look like facts and are not

- **`npm run flow` does not visit this book.** It addresses `/biology/ch01-what-is-life/` as a literal, so its `phone-drawer` step proves the drawer on the biology book and nothing about 資治通鑑. It is evidence that the shared components still behave for the English book, which is what a change to `term.js` needs — not coverage of this one.
- **The English strings are a shared-code problem, and only one of them is papered over.** `All sorted.` is a `content:` string in `src/styles/components.css`; this round replaced it **for this book alone** with a scoped rule at the end of `tongjian/zj.css` (`content: "都归好了。"`, proved in a browser by `out/colour2/probe-claims.mjs`). `content: "Key idea"`, `content: "Chapter "` and `content: "Chapter"` are still English in the shared sheets, and no check in this repository reads a `content:` string at all.
