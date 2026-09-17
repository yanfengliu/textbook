# Defect register

Every defect the owner reports is recorded here and gated, never only fixed. The entry stays after it becomes a gate: this is the standing list of what the gates could not see, which is where the next defect comes from.

## 2026-09-10 — four defects on a real phone and a desktop, none of which any gate could see

The owner read the published site on a phone and reported, in their words: *"Sidebar on mobile doesn't work"*, *"the light dark toggle is not quite at the top right corner"*, *"the glossary tooltip goes off screen on mobile"*, and, on the desktop version, *"I don't like the inconsistent widths among elements (text, animation, quiz cards, etc)"*. They added the diagnosis that mattered most: *"You need to dynamically check for the phone screen layout."*

**They were right about the cause, and it was one cause.** Every gate here set a narrow **viewport** on a desktop browser. A 390 px Chromium window has a mouse, hover, and `pointer: fine`. A phone has touch, no hover, `pointer: coarse`, a different user agent and a device pixel ratio of 2 or 3. `npm run shot` and `npm run narrow` both looked at 390 px and both passed, because neither was looking at a phone. Three of the four defects lived in that gap, and the fourth lived in a dimension no gate measured at all.

### The four

| Symptom as reported | Root cause | Now checked by |
|---|---|---|
| The sidebar does not work | The drawer opened, but nothing dismissed it except the button that opened it. No scrim, so no target to tap and no sign the page was waiting; tapping the article did nothing; the page behind kept scrolling, so a swipe meant for the contents moved the article; focus stayed in the article. | `npm run devices` opens the drawer with the device's own input and requires a scrim covering the viewport, a locked page behind it, focus inside it, dismissal by a tap outside, and a link that closes it and leaves the page scrollable again. |
| The theme toggle is not quite in the corner | Only the breadcrumb had `flex-grow`, and the breadcrumb is `display: none` below 800 px. So on a phone nothing pushed the right-hand controls right: they packed from the left and the toggle landed wherever the book's title happened to end, 35 px short, moving with the length of the title. | The toggle pins itself with `margin-left: auto`. The gate requires the rightmost header control to sit within 4 px of the header's own right padding; it previously allowed 40 px and passed at 35. |
| The glossary tooltip goes off screen | The popover handled only the right edge, by flipping its anchor to `right: 0` of its term. A term in the middle of a phone line is less than the popover's own width from *both* edges, so the flip pushed it off the **left** instead: 10 px off at term 15 of 31 on a 390 px screen. Flipping cannot fit a box wider than the space on either side of its anchor. | The popover is clamped into the viewport along its own axis, and capped at `calc(100vw - 16px)`. The gate now opens **every** term, not the first and last: the defect was in the middle, and a gate that samples the ends cannot see the middle. |
| Inconsistent widths on desktop | Three causes at once. The chapter opener sits outside `.tb-text`, so its children resolved against the whole grid track and the title ran 38 px past the prose. The hero figure inside it computed its "wide" breakout from that same wider parent and landed 38 px past every other wide figure. And `--measure` was `66ch`, which resolves against **each element's own font**, so a small-caps label in Inter at 12 px and body prose in Newsreader at 19.2 px ended 88 px apart. Five distinct right edges on one page. | The opener is clamped to the measure, and the measure is one fixed length (43.6 rem, which is 66 characters of the body face). The gate requires the text column to share one left and one right edge, and the wide figures to share another. Two edges now, where there were five. |

### What changed about how this is checked

`npm run devices` is new and is the answer to the owner's instruction. It emulates **devices**, not widths: small phone, phone, Android phone, phone landscape, tablet portrait and landscape, small laptop, desktop, and wide desktop, with touch where the device has touch and a mouse where it does not, and it presses controls with the input the device actually has. WebKit and Firefox are installed alongside Chromium, and the three engines were checked by hand during this investigation; the standing gate runs Chromium, and widening it to all three is the obvious next step.

The gate caught a fifth thing on its first full run that nobody had reported: the breadcrumb links were 46 by 17 px, under the WCAG 2.2 minimum target size of 24. That is what a gate is for.

### The lesson underneath all four

Three of these were invisible because the instrument resembled the thing it was standing in for closely enough to be trusted. A 390 px desktop window looks exactly like a phone in a screenshot. It is not one, and the difference is precisely where the defects were. The fourth was invisible because no gate measured alignment at all: every gate asked whether something was broken, and none asked whether the page was *coherent*.

## 2026-09-11 — the furniture had no vocabulary, so every element reached for a box

The owner, after reading the published site, set a standing bar rather than reporting a single defect: *"The textbooks should have the best typography and visual design. If anything is less than supreme quality then don't even bother."* It is recorded as a rule in [../policies/local-rules.md](../policies/local-rules.md). What it named is in this register because it is a defect the gates could not see, which is what this file is for.

A 2x audit of the rendered chapter found the specific instances:

| Symptom | Root cause | Now checked by |
|---|---|---|
| The chapter opener was stacked, not composed: a pale grey numeral floating above the title with no relationship to it, gaps on no common baseline, and an empty margin column leaving a void at the right | The opener had no typographic structure at all. It was three elements in a column, each sized independently. | The design of record now carries a Furniture section with the rule hierarchy. The opener is a head rule, a running head hanging under its left end, a sinkage, and the title, with the chapter number as a folio whose baseline sits on the title's. |
| That numeral was drawn in `--rule-strong`, a hairline colour used as display type, measuring **1.57:1** — the only text on the site below AA | Nothing measured contrast. Every gate checked structure. | A contrast sweep over every computed colour on the page, compositing through transparent ancestors **and through ancestor `opacity`**, which is how the library's "In preparation" text was sitting at 2.46:1 unnoticed. 78 colours over three pages, 0 below AA. |
| `tb-check` read as a web form: a bordered card holding bordered rows holding grey letter circles, three levels of rounded rectangle, rows 860 px wide for 200 px of text, and letters that read as disabled | The furniture had no stated vocabulary, so each element reached for a box independently. | **One drawn rectangle in the book: the figure stage.** A box means an instrument with something live inside it; everything else is set with rules, space, indentation and changes of face. The glossary popover is the single exception, because it floats and must declare its own extent. Written into `docs/design/textbook.md`. |

### What the redesign then broke, and what caught it

Two overflows, both found by `npm run devices` within hours of that gate being widened to nine devices, three engines and every discovered chapter:

- The new segmented sort control was `flex-wrap: nowrap` in a track that could not shrink. Chapter 2's bin labels make it 444 px, and it ran 79 px off a phone. **The designer had only ever opened chapter 1.** The gate had just started covering chapters it could not previously see.
- Chapter 3's five-column table ran 29 px off a phone. The redesign's wider heading tracking made it worse but did not cause it; the table needed 376 px in a 350 px column before anyone touched it. Below 800 px a table now scrolls inside itself, because a page that scrolls sideways loses its left margin on every line and a table that scrolls loses nothing.

### Two things that were quietly false before anyone looked

- **The blockquote's italic was a browser-synthesised slant.** Fraunces is requested with no `ital` axis, so there was no italic to use. `document.fonts.check('italic 400 24px Fraunces')` answers `true` for a synthesised face, which is exactly why it survived; `Array.from(document.fonts)` lists what is really loaded and shows only the upright. Italics now come from the face that has them.
- **A CSS comment claimed the opening quotation mark hung.** `hanging-punctuation: first last` is not supported in Chromium and was doing nothing. The comment was a claim about the code, not a measurement of the page.

## 2026-09-12 — a browser crash dialog read as the gate misbehaving

The owner, twice while a gate run was in flight, with a screenshot: *"Why you keep creating this error"* — a modal `chrome-headless-shell.exe - Application Error` window reading *"The exception Breakpoint / A breakpoint has been reached. (0x80000003)"*.

**What it is.** Not a page error and not a test failure. `0x80000003` is Chromium's internal breakpoint: the browser process hit a fatal condition, raised a Windows modal, and is waiting for a click. It is raised by the browser, so it **outlives the Node process that started it** — which is why closing the terminal, letting the command finish, or killing the gate does not remove it, and why it appeared to keep coming back.

**What was measured, rather than assumed.** Three plain launches — Playwright's defaults, the repo's own `--enable-unsafe-swiftshader --ignore-gpu-blocklist`, and a quiet variant — each rendered `資治通鑑` and closed cleanly, with `tasklist` showing no leftover `chrome-headless-shell.exe` (`out/probe-browser/report.json`). So the dialog is not raised by *starting* a browser and not by page content; it comes from a crash inside one, and the one browser run this session had made was `node tools/shot.js`, whose chromium died on exit after both pages had already reported `ok`.

**Why no gate could see it.** A crash dialog is outside the browser: a headless page cannot observe the window its own process raised, and every gate here reports on the page, not on the desktop. This is a defect class the suite had no instrument for at all.

| Symptom as reported | Root cause | Now checked by |
|---|---|---|
| A modal chromium crash dialog on the desktop during a gate run, and no way to stop it | Chromium raises a modal window for an internal breakpoint, and the window is owned by the browser process rather than the gate, so it survives the gate | `tools/zj-quiet-browser.cjs`, preloaded through `NODE_OPTIONS=--require`, adds `--noerrdialogs --disable-crash-reporter --disable-features=Crashpad` to every launch and appends them to the gate's own flags rather than replacing them. `test/browser-quiet.test.js` launches a real browser and reads its command line back through `Browser.getBrowserCommandLine`, requiring all three flags on the running process. |

**The gap that remains, stated.** A dialog cannot be observed from inside a headless browser, so the gate proves the launch arguments and not the absence of a window. That half is environment. What is now structural is that no launch this repository makes is *able* to ask Chromium for an error dialog, and that the check reads the live process rather than the wrapper's own text — a first version of it read the file as a string and would have passed on flags sitting in a comment, and a second version iterated the wrapper's own constant, so deleting a flag would have passed the launch test too. Both were fixed before the gate was accepted; the mutation that proves it is in [gate-proofs.md](gate-proofs.md).

## 2026-09-12 — the page list only worked while the site had one book

Found before the second book's first page existed, by a read-only probe read against `discoverBooks()` rather than by a failing run. Recorded here because it is the class of defect the register is for: a gate that would have gone red for the right reason and read as the wrong one.

`tools/lib/browser.js` built a chapter's page id from the chapter number alone — `ch${m[1]}` — with no book component. With one book that is unique. With two it is not: `biology/ch01` and `tongjian/ch01` are both `ch01`.

| Symptom | Root cause | Now checked by |
|---|---|---|
| The second book's chapter 1 would have made `test/pages.test.js` fail on `two pages share an id: library, biology, ch01, ch02, ch03, tongjian, ch01, today` — reading as "the new book broke the page list" rather than "the page list only ever supported one book" | The page id omitted the book. The uniqueness assertion that caught it was already there and only fires once the collision exists, so the defect was invisible exactly as long as nothing new was added | Chapter page ids are book-qualified (`biology/ch01`), and `test/pages.test.js` asserts the id's *shape* — that it starts with its book's id, that a page carries it, and that the page's path matches — rather than only uniqueness, which after the fix is true by construction. Proved red by restoring `ch${m[1]}`: `chapter /biology/ch01-what-is-life/ has page id "ch01", which does not name the book "biology"` |

The same collision made three instruments ambiguous without failing: `SHOT_PAGES=ch01`, `DEVICE_PAGES=ch01` and `tools/inspect.js --page ch01` each address every page whose id matches, so a trimmed run would have measured two books' chapter 1 and reported it as one. `tools/devices.js`'s `CROSS_PAGES` named `ch01` for the same reason and now names `biology/ch01`.

The study system had already chosen the qualified shape — `tools/check-content.js` keys a chapter as `<book>/chNN` and the reader's record is filed under it — so this is the page list being brought into line with a decision the rest of the repository had already made.

## 2026-09-12 — a tap is a hover and a click, and the hover got there first

Found by `npm run devices`, which had been reporting it intermittently for a while as `tapping a glossary term opened no definition` on several phone and tablet devices but not others. The message could not say which term, so it read as flakiness rather than as a defect with a cause.

A probe over all 172 terms on chapter 2 at a 390 px touch viewport reproduced it exactly: **one term, `三版`, tapped onto a button and produced no card.** Instrumenting the component gave the trace `open({hover:true}) → close() → open({hover:true}) → close()`, and the raw event stream gave the reason.

| Symptom | Root cause | Now checked by |
|---|---|---|
| One glossary term in 172 opens nothing when tapped on a phone; on other devices the last term fails, differently each run | **A tap is a hover and a click in one gesture, and the component treated it as both.** Touch sends `mouseenter`, then `mouseleave` and `blur` as the finger lifts, and only then `click`. The leave closed the hover card before the click could pin it, the click then found no card and re-opened in hover mode, and the matching blur closed that too — so nothing was left on screen. By the time the click arrived the button was no longer under the point either: the raw stream shows `mousedown` and `click` delivered to the surrounding `<li>`, not to the button | `src/components/term.js` attaches hover-to-open **only where a hover exists** — `matchMedia('(pointer: coarse)')` is the browser's own statement that the primary pointer cannot hover — so on a touch device the card's path is the click alone, one event with nothing to race. Measured after: **0 of 172 terms fail**, where one did before |

**Two more defects surfaced while fixing it, both in the same component and both real.**

- **The toggle read the wrong flag on touch.** `hoverOnly` is never true on a coarse pointer, so a second tap took the *pin* branch and re-pinned an already-open card: a reader could not dismiss a card by tapping it again. The toggle now reads a `pinned` flag set when a card is deliberately opened.
- **Crossing the card cleared the pin on a mouse.** Leaving a term closes its hover card; the pointer then crosses the open card on its way back to the term, the button's `mouseenter` fires, and the old code set `hoverOnly = hover` — clearing the pin — so the second click re-pinned instead of closing. A hover no longer downgrades a pin.

**Why no gate saw the class.** `npm run devices` opens **every** glossary term and reports the ones that fail, which is exactly the coverage this needed — but its message named neither the term nor the cause, so an intermittent one-in-172 failure read as noise. The measurement that settled it was a probe that walked every term in document order and printed each one's opened state beside the element under the tap point. `tools/zj-probe-terms`-style walks are now the instrument for this class: **a gate that says "something did not open" is a report, not a diagnosis.**

**The regression risk this created, and how it is covered.** `src/components/term.js` is shared with the biology book, whose readers use a mouse, so a fix for touch can break the book that already ships. A probe now walks all four ways in — hover opens and leaving closes, a click pins, a second click closes, Escape closes, a tap opens and a second tap closes — on both pointer kinds, over both books. 10 of 10 paths green. That probe is task-run evidence under the ignored `out/`; it is named here because whoever next changes this component needs to run it.

## 2026-09-12 — two figure modules could not load, and the unit suite was green

Found while mounting chapter 1's figure on a new book, by the worker doing the mounting, who reported it instead of editing a file that was not theirs — which is the behaviour this register exists to be worth.

Two modules under `src/figures/` carried a syntax error, and **`npm run unit` reported 117 of 117 passing** while both were dead.

| Symptom | Root cause | Now checked by |
|---|---|---|
| Chapter 1's new 圖 1.1 rendered as the frame's error box: `its module did not load (Unexpected identifier 'fr')`. Chapter 2 and 3 were unaffected | A backtick used to quote an identifier **inside a CSS template literal comment** closed the template and left the identifier as code. `zj-split.js`: `content-sized here: \`fr\` rows in a short body`. `zj-words.js`: `on the label. \`color\` is set here because` | `test/registry.test.js` gains **"every figure module parses"**, which runs `node --check` over every module in `src/figures/`. Proved red by putting `` `fr` `` back (`1 figure module(s) do not parse, so the frame will show an error box where a figure should be`), then restored |

**Why the suite was green over two dead modules.** `test/registry.test.js`'s own header says it never imports the modules — they import `three` by a bare specifier Node cannot resolve — so every check it made read a module's **text**: does it export `meta`, does it export `mount`, does `meta` name its kind. All true, in a file that could not execute. The first thing that parses a figure module is the frame, at runtime, in a browser, and it reports the failure as a figure in `error`.

**The check is a parse rather than a lint, deliberately.** A rule forbidding backticks in a CSS comment would have caught the first instance and not the second, which used a different identifier in a different module. `node --check` catches the class — any syntax error — and costs about a second for the whole directory. Its bound is in its header: syntax only, and it says nothing about whether a module mounts or draws, which is `npm run drive`, `narrow` and `sweep3d`.

## 2026-09-19 — reading it twice found ten defects in the second book, and a cosmetic property was hiding a click

The published 資治通鑑 was read by the owner and by two reader-proxies — a role this repository did not have before this round — and one defect was worked out by the round and handed to the worker who fixed it. Ten came out of it. The gates had seen one, as a symptom with no cause; one turned out to have been fixed by `4c4acb8` before it was reported; and six were things no gate was asking about at all.

| Symptom as it was seen | Root cause | Now checked by |
|---|---|---|
| The owner: *"fix top left corner bar icon on mobile. It doesn't do anything. Possibly the same problem on desktop too."* The control is the header's contents button, `.tb-navtoggle`, the first control in the header. | **The button was too small to hit, and it had been fixed before the report.** At 320 px the header is crowded enough that the two icon buttons were **shrinking to 19 px** on the flex line, against a 24 px minimum target — measured and stated in the comment `4c4acb8` left in `src/styles/layout.css` beside the fix (`flex: 0 0 auto`, 2.1 rem square). **Re-measured on 2026-09-19 for this entry: the button is 34 by 34 px at 320, 360, 390 and 430 px on both books, and a touch tap opens the drawer on every one of the eight loads** (`out/defectdoc/probe-navtoggle-shapes.js`), and the **published** site behaves the same at 390 px on both books (`out/zj-scratch/probe-published-toggle.js`: `expanded=true is-open=true scrim=true`, 6 links on the 通鑑 chapter, 11 on the biology one). So the report is best explained by the 19 px target that `4c4acb8` fixed, and **which build the owner was reading is not in the record** — he may equally have been reading a stale deployment, and nothing here proves which. The desktop half is the design rather than a defect: above 800 px the rail is a standing column and the button is `display: none`. | The drawer's behaviour, by the device's own input: `npm run devices` presses the toggle below 800 px and requires the drawer on screen, `aria-expanded="true"`, links in it, a scrim, a locked page, focus inside, and dismissal by outside tap and by link — so a dead tap on a phone at those widths is red there. `npm run flow`'s `phone-drawer` step presses it too, on the biology book. **The half that was uncovered is the target's size and its corner**: `npm run devices` fails a header control under 24 px on its smallest side, which the 19 px button was, so the fix is now held by that check; the corner was covered on the right only, and the leftmost control's corner is added in this round's working tree (`tools/devices.js:263-268`). |
| The owner: *"You are not taking advantage of the full width the page, especially on desktop."* | Not a preference: the reading column was 43.6rem, a fixed **698 px at every width**, so the wider the window the smaller the share of it the book used — measured 55% of 1280, 48% of 1440, **36% of 1920** and 27% of 2560 (`out/width/before.txt`). | A ladder of `@media (min-width: …)` rungs from 1100 px in `tongjian/zj.css`, with the 原文's character grid stepping with it: 848 px/66% at 1280, 838 px/58% at 1440, 1014 px/53% at 1920, and 17 → 24 characters of 原文 on a line (`out/width/after.txt`). **This was not gated at all**: `tools/devices.js` holds the text column to one pair of edges, which the 698 px column satisfied as well. New in this round's working tree: `tools/devices.js:441-496` requires that on a `tongjian` chapter the reading column (`.tb-text`) **and** the 原文/譯文 block (`.zj-src`) each hold at least half of a 1280–1920 px viewport, and fails if a page of that book has no `.zj-src`, or no row carrying both registers, rather than measuring nothing. Measured there as 66.3% at 1280, 58.2% at 1440 and 52.8% at 1920; the old fixed column was 48.4% at 1440 and 36.3% at 1920. The floor is 50% and not the number measured, so a rung may be retuned without turning the gate red. Above 1920 px the band excludes it on purpose, because the measure is capped at 63.4rem by design and the share falls there by design too. |
| The owner: *"If the original text is in traditional chinese character that is fine. I just need the rest of the textbook and especially the translation to be in simplified chinese."* | A request rather than a defect, and worth saying so: the book had been read once and converted to Simplified whole, 原文 included; the correction is that the received text keeps its script and everything the book writes about it does not. | `test/lexicon.test.js` *the 原文 and its quotations are Traditional, and everything else is Simplified*, proved red in **both** directions — a Traditional character in the prose, and one character of the 原文 converted away (`docs/learning/gate-proofs.md`). |
| A reader-proxy: cards firing over the paragraph being read, the pointer never having clicked. | Hover-to-open had been given to `<tb-char>` on the reasoning that a character is the same kind of thing as a glossary term. It is not, at scale: **1,291 of them on chapter 2 in a 37,000-pixel column**, so the pointer became a trigger. A character now opens on click; a term keeps its hover. | **Nothing.** No gate here moves a pointer across text and asserts that nothing appears. `npm run flow` drives clicks, keys and a drag; `npm run devices` clicks terms; the hover paths in `drive` belong to 3D figures. |
| A reader-proxy: a card left open, off screen, swallowing the next tap on whatever character it covered. | The card had no dismissal except Escape and a click outside it. | The card closes on the reader's own gestures — `wheel`, `touchmove`, or a scrolling key. **Nothing**, and the part worth keeping is the first attempt: listening for `scroll` closed a hover-opened card on the biology book that nobody had scrolled, because a programmatic `scrollIntoView` and a settling layout both fire it, and a distance guard does not help when the scroll is real. The listener is on gestures because a page that scrolls itself is not a reader scrolling. |
| `npm run devices`: *"tapping a glossary term opened no definition"*, on chapter 2 at three wide viewports and not on the touch devices. | **A cosmetic property, and a click landed somewhere else.** `tb-term` was `display: inline`, and appending the card's `<span>` into it gives the CJK line breaker a break opportunity **inside the term**: the justified 原文 re-broke, 獻子 (term 163 of 172) moved +318.3 px and up a line, the press landed on the sibling `<span class="zj-pair__src">` and the release on the button, and Chromium dispatches `click` on their nearest common ancestor — so the term's own handler never ran and the document's outside-click handler closed the card. The same measurement shows the card flickering at about 10 Hz with **no input at all** for as long as a pointer rested there. `display: inline-block` makes the term atomic to the line breaker; 0 of 1,625 glyphs move (`out/vanishing/diagnosis.md`, `proposed-fix.md`). | The gate that reported it, which is also the gate that cannot diagnose it: it asks whether a card is on screen 90 ms after a press, so *"everything vanished"* is the whole message. **No gate yet** for the class — "opening a card moves the text" — whose cheap check is written up in `proposed-fix.md`: record every term's rect before a press and fail if any of them moved while a card was open. |
| An independent text review: the card for 夫 in 「夫才與德異」 showed `fū` and the 大夫 sense, where the sentence needs `fú`. The same class hit 使 and 難, and chapter 2's own 字詞 table printed `nàn` while the card printed `nán`. | **The data shape could not express the truth.** A `use` carried a gloss, a note and examples, and no reading, so a per-sense reading had nowhere to live; and the gate that existed checked which readings an entry *declared*, never which one the card *showed*. | `test/lexicon.test.js` gained two: *a 多音字 says, per sense, which reading the card must show* (42 uses across 15 entries declare one, and no entry may declare a reading no use takes) and *every 多音字 a chapter prints is bound to the use whose reading that page prints* (13 chapter-side bindings). These are the first checks here that ask what the card **shows** rather than what the file **declares**, and they found 13 reader-visible errors that 114 tests and four browser gates had passed over. **Not yet in `gate-proofs.md`** — the mutations are in the ignored `out/tongjian-w2/mutation-*.txt`. |
| `npm run shot`, twice: a caption reading 圖 3.1 on a page whose `lang` is `zh-Hans`, and a figure whose `aria-label` opened with `Figure`. | Both read a word from the page's **base** language: keyed on `zh` alone, every Chinese page got the Traditional 圖, and the label was a literal English word. | `npm run shot` reads the `.fig-num` text and the figure's `aria-label` on every page, at three widths in both themes, and fails a word that is not the one the page's script writes (`tools/shot.js:33-37, 74-78`). The commit that fixed them says the gate caught both, and the check is what would catch them again — but **no red proof of this check is recorded in `gate-proofs.md`**, and one is being produced. The fix keys the word on the **full** tag (`zh-Hans` / `zh-Hant`) with the base language as a fallback. |
| A reader-proxy: `Right.`, `Not quite.`, `Yes.`, `Not one of them —`. | The components that address the reader carried their words as literals. Each now has a per-language table, merged over by whatever the page publishes as `textbook.strings`. | **`npm run flow` is the wrong gate to name**: it asserts the four English literals on the **biology** page, which is the other book — it is evidence the English book still reads as it did, not a check on this one. No gate reads a verdict string on a Chinese page. `All sorted.` is a stylesheet string in `src/styles/components.css`, so it is **still English in shared code**; it is replaced for this book alone, at the end of `tongjian/zj.css`, and proved in a browser by `out/colour2/probe-claims.mjs`. `content: "Key idea"` (`components.css`), `content: "Chapter "` and `content: "Chapter"` (`layout.css`) remain, and no check reads a `content:` string at all. |
| A reader-proxy: *"72 entries, 5,863px tall, in one unbroken column, with no grouping, index or jump. I read about 20 of 72 and scrolled the rest."* — and the round worked out why the list had no order and handed the fix to the file's owner. | `localeCompare` on Han head-words returns ICU's radical-and-stroke order — measured from each chapter's own `glossary.js`, chapter 2's 72 entries come out 三版, 不如, 尹鐸, 二心, 人臣, 代成君, 任章, 伯魯 … 飲器, 驂乘, 魏斯, 魏桓子 — which is not pinyin and not anything a reader can predict. **The defect was never that the list was long (5,863 px); it was that it had no order in it.** | An index of the list's first characters: one link per contiguous run, with a count where a character leads several entries, so 智⁶ says six entries are about one family. Built only where the head-words are Han and the order is therefore not one a reader can scan — decided from the head-words themselves, so the biology book's Latin list renders exactly as it always has (0 of its 31 head-words begin with a Han character). Measured on the data: chapter 2 is 59 distinct first characters and 59 runs, chapter 3 is 30 and 30, chapter 1 is 2 and 2, and **no character's entries are split across runs** in any chapter. **Nothing**: no gate reads the glossary's length, its order, or whether a reader can navigate it. |

### What this round changed about how this is checked

A **reader-proxy** — a worker whose only job is to read the book the way its reader does and say what happened — is now a role this repository has, and it is where six of these ten came from. That is the same finding as 2026-09-10, one step further on: the instrument that resembles the reader is not the reader, and the checks were all asking whether something was broken rather than whether the page could be read. The tenth came the other way round: a measurement taken for one defect exposed a property of the data (the collation's order for Han) that nobody had looked at, and the round handed it to the worker who owned the file.

Two gates gained a check for a defect that no gate could see, and both are in the working tree rather than in a commit:

- **The left corner.** The corner check pinned the rightmost header control only, and the owner's report is about the leftmost one.
- **The width.** Nothing measured how much of a wide screen the book uses, which is why a fixed 698 px column could ship as "consistent widths on desktop" — the 2026-09-10 entry fixed five right edges into two, and a fixed column satisfies that perfectly.

Both are named here as checks **added**, not as checks **proved**, and a gate counts here only once it has been made to go red by reintroducing the defect. Both have been proved since, and the proof is the `devices` entry of [gate-proofs.md](gate-proofs.md), dated 2026-09-19 — the file this entry first said still ended at 2026-09-16. It is three mutations. **The left corner:** `margin-left: 90px` on the first rendered header control, which fails on every shape tried and leaves the right-corner check green — a check for one corner cannot see the other, which is why this one exists. **The width:** the pre-fix 43.6rem measure put back, which fails at both wide shapes and reproduces the owner's own 36.3% at 1920 px, to the tenth of a point `out/width/before.txt` recorded. **No subject at all:** every header control hidden, which fails naming the selector instead of measuring nothing, so neither check can come back green by finding no element. **Still owed to that file:** the `圖`/`图` caption check `npm run shot` makes, which the commit `0482dde` says caught both caption defects above and for which no mutation was ever recorded; and the two `test/lexicon.test.js` checks for the 多音字 reading, which were proved red when they were written in `out/tongjian-w2/mutation-polyphone-one-reading.txt` and `mutation-polyphone-use-without-reading.txt`, files ignored by Git and therefore not proofs this repository keeps.

The line that cost the most to learn is in three of the stories above: `display: inline` on a term looked like a typographic decision, and it was what decided where a reader's click landed; a character's hover looked like a convenience, and at 1,291 of them it was a page fighting its reader; and a list's sort order looked like a detail, and it was the difference between a browsing surface and a wall. When something on the page is wrong, the cause can be a property that has nothing to do with the symptom.

## 2026-09-16 — the library page showed Chinese in a font it never loaded, and the machine hid it

Found by a new check being folded into `npm run shot`, on its first run, before it had been asked to find anything.

The library page lists both books. The second book's card is written in Chinese; the page loads only the Latin stack (Fraunces, Newsreader, Inter, Libertinus Serif, Noto Sans Math). So every Han character on the front door of the site fell out of the stack: **67 glyphs across the card's title, its description, its eyebrow and the 鑑 in its inline SVG cover**, at both 390 and 1440 px.

| Symptom | Root cause | Now checked by |
|---|---|---|
| Nothing visible on this machine | This machine has Noto Sans SC installed, so the fallback landed on a reasonable face and the page looked designed. A reader without it gets whatever their system picks, or tofu. | `npm run shot` asks CDP `CSS.getPlatformFontsForNode` after load and fails on any element drawn by a face the page did not load (`isCustomFont: false`). |

**The lesson is the one this repo keeps relearning in new clothes.** The instrument was the developer's own machine, and it resembled a reader's closely enough to be trusted. It is the same shape as the 390 px desktop window that stood in for a phone (2026-09-10), and the same shape as the stale screenshot that nearly produced a defect report against a redesign that was correct (2026-09-15).

Two further findings from the same run, recorded because they are the standing list of what the gates could not see:

- **`tongjian/ch02-zhi-bo-zhi-wang/index.html` draws eight glyphs in SimSun.** Noto Serif SC and Noto Sans SC both load and draw over 1400 glyphs there; a handful of characters are not covered and fall through to a system face. That book belongs to another session; the exact code points are in `docs/work/2_rest-of-the-book/plan.md` for whoever picks it up.
- **`lab/index.html` draws its debug dump in Consolas.** Accepted: it is a developer surface and `monospace` is the right family. `npm run shot` does not visit the lab, so the gate's bound excludes it, and the gate's header says so.

**Resolved 2026-09-16, and one thing the fix taught.** A `text=` subset link on its own changed nothing: a browser reaches only for a family some `font-family` stack names, and every stack in `src/styles/tokens.css` is Latin. The page had to redefine its three font tokens locally as well. A link without a stack is a request the browser never makes, and the page looks exactly as it did — a fix that reports success identically to a no-op, which is why the census was re-run rather than trusted.

**The other book's chapter fixed itself, independently.** The six characters were 蜹, 蠆, 藺, 鼃, 驂 and 讒; that session added a subset link covering eighteen, a superset, without knowing this gate existed, and the gate then confirmed it green. An independent fix and an independent check agreeing is the strongest evidence either is right, and it is worth more than either alone.

**Why a character subset is still the right fix.** The library page's Han is served by a `text=` subset naming the exact characters, which is normally the fragile choice — the next new character falls back silently. It is safe here only because the check above turns that silence into a red gate. A hand-maintained list is acceptable when a gate watches it and not otherwise.

## 2026-09-16 — a figure handed the browser a negative width, and the gate that could prove it was not the obvious one

Found by the first full timed chain run on `f5bd0e9`, in three gates at once: `shot` at three page-loads, `devices` at two, `subpath` at one. It was on main, pushed, and logging console errors on the live site.

`src/figures/cytoskeleton.js` drew its tubulin lattice as `width: ((s1 - s0) * k - 0.7)`. The `0.7` is a hairline gap in **pixels**; `(s1 - s0)` is a dimer span in **nanometres**, and `k` converts. The guard above it, `if (s1 - s0 < 1.2) continue`, is in nanometres and so cannot see the gap at all. The row stagger leaves a 1.8 nm remnant at the end of one row in five, and at a tablet the figure takes its narrow composition with `k = 0.36`, which makes that remnant 0.65 px and the drawn width `-0.1`.

| Symptom | Root cause | Now checked by |
|---|---|---|
| `<rect> attribute width: A negative value is not valid. ("-0.1")` at tablet, and a transient `-0.5`/`-0.6` pair at desktop | A gap in pixels subtracted from a span in nanometres, with the only guard expressed in the other unit. The desktop pair came from the mount-time paint, before the ResizeObserver had measured the stage, so it was a frame immediately replaced — which is why desktop was flaky between runs and tablet was not. | `npm run shot`'s `auditFigureGeometry`, which reads the settled DOM of every figure on every page at three widths and fails on a geometric attribute that is negative or not a number. |

**Why the phone escaped, measured rather than reasoned**: its track is 425 px for 400 nm, so `k = 0.86` and the same remnant is 1.55 px, leaving 0.85 px after the gap. Minimum rect width by width: phone 0.90, tablet −0.10, desktop 1.00.

### The lesson, which is about where a check can live

The obvious homes for this check were `npm run drive` and `npm run narrow`, because both mount **every** figure. Neither would have worked: `drive` mounts at one stage size (1000×640) and `narrow` at one (390), and at neither does the scale fall low enough to invert the span. Reintroducing the defect leaves both green, **so a red proof attempted there would have been fake** — a gate carrying a true-sounding claim it cannot support, which is the failure this register exists to catch. `shot` is the only gate that mounts figures at more than one width, and the defect is width-dependent, so that is the only place the claim is honest.

A check that mounts every case at one size cannot prove a defect that depends on size, however complete its coverage looks in the other dimension.

### Two things found while proving it

- **The second mutation produced no console error at all.** Setting a stroke width to `NaN` is silently ignored by the browser, so the console check that caught the original defect could not have caught its sibling. That is the class the new check covers and the reason it is worth its cost.
- **A scripted mutation was a partial no-op that passed its own guard**, because the patterns were CRLF and the file was LF. It was caught by reading the artefact rather than the tool's report, which is the standing rule about a tool reporting a no-op identically to a success.
- **The check's first version was a false positive**, failing chapter 1's homeostasis figure on `<marker orient="auto-start-reverse">`. A new check is a claim like any other and was wrong before it was right.

## 2026-09-16 — rare characters in the 原文 were drawn by the reader's machine, and the page had loaded the right fonts

Found by the font census folded into `npm run shot` the day it was written, on the book the library page's own entry above had already flagged: that entry's run listed `tongjian/ch02-zhi-bo-zhi-wang/index.html` drawing eight glyphs in SimSun while Noto Serif SC and Noto Sans SC drew the rest of the page, and deferred the code points to whoever picked them up. This is that finding worked out and closed.

**What a reader meets.** The 原文 is set in the book's own Song face, and a handful of rare characters in it are set in whatever the reader's machine happens to have — SimSun here, something else on another machine, nothing at all on a third. It is worst exactly where this book is strongest: 蜹、蟻、蜂、蠆, 藺, 鼃, 驂乘, 讒臣 are words a reader came for, and one of them is the only glyph on the line in another face. **On a machine that happens to have a suitable font the page looks almost right, and on one that does not there is tofu in the middle of a classical Chinese sentence** — in a book whose text is the point, and in a way a reader is unlikely to report and unable to work around.

| Symptom | Root cause | Now checked by |
|---|---|---|
| Characters the book prints — in the 原文, in the 字詞 list and in a card's 通鑑用例 — drawn by a face the page never loaded: SimSun on this machine, tofu on a machine without one | The pages' Google Fonts link carries no `text=` parameter, so each family arrives as `unicode-range` slices, and **21 of the 1,937 code points the book uses fall outside every slice**. A browser draws a code point no loaded slice covers with the next face in the stack that has it — the reader's own — and says nothing. The page had loaded the right two families, which is why nothing looked wrong | `npm run shot`'s font census: every text node and every `::before`/`::after` string is grouped by its computed stack, weight, style and numeric variant, a probe span per group carries that group's code points to CDP `CSS.getPlatformFontsForNode`, and a code point drawn by a face the page did not load through `@font-face` fails the gate, narrowed down and named. Chapter 2's census reads `1644 glyph(s) over 1644 code point(s) in 14 stack(s): Noto Serif SC ExtraLight:1438 Noto Sans SC Thin:206` after the fix (`out/rerun/shot-ch02-after.log`) |

**A page can load a face and still not cover a character.** That is the whole of this defect: the two families were loaded and they drew the page, and the code points they did not cover went to the reader's machine without a word to the page, the console or any gate.

### The investigation, and why the arithmetic could be trusted

The census named six code points on chapter 2 — 蜹 U+8739, 蠆 U+8806, 藺 U+85FA, 鼃 U+9F03, 驂 U+9A42, 讒 U+8B92 — and the question was whether there were others the gate had not drawn. Counting every code point the book holds rather than the ones a load happens to render: the corpus has **7** of its 653 distinct non-ASCII code points outside every slice, the data (`lexicon.js`, `words.js`, the three `glossary.js`, the three `chars.js` and `corpus.js`) has **21** of 1,845, and the four pages' markup has **6** of 1,281 (`out/glyphs/probe-corpus.txt`). The population over corpus, data and the four pages is **1,937** code points — the number the fix was sized against (`out/glyphs/verify-links.txt`); that sweep's own union of the parts prints 1,934 (`out/glyphs/probe-corpus.txt`), and the two files agree exactly on the **21** code points that fall outside every slice. Over the same population after the fix, **3** remain uncovered (`out/glyphs/verify-links.txt`).

**The range arithmetic was checked against the instrument before a fix was written against it**: 61 code points measured with the gate's own census through `CSS.getPlatformFontsForNode` — all 21 the ranges called uncovered and 40 they called covered — with **0 disagreements** (`out/glyphs/probe-corpus.txt`). The two independent readings agreeing on every control is what made it safe to size a `text=` list from arithmetic rather than from one chapter's screenshots.

**It was looked at as well as measured.** `out/glyphs/probe-look.txt` renders one sentence of chapter 2 twice, with the subset blocked and with it loaded, and reads the census of all 59 of the sentence's characters each time: 蜹 and 蠆 change from SimSun to the loaded face across the pair, while the characters either side of them do not move. The frames beside it (`out/glyphs/simsun-*.png`, `out/glyphs/loaded-*.png`, same clip at 3×) are what a reader was seeing — three of the sentence and one of the 字詞 list's rare head-word — and they are the reason the fix is a font request rather than a change to the text.

### The fix, and what it costs

**A second request for the same two families, naming characters.** `text=` with 18 of the 21: the six that were red on chapter 2, 紂 U+7D02, and eleven witness forms a card prints (䖍 䘮 僃 恱 摶 甞 矦 筈 聦 踈 鞶) (`out/glyphs/probe-fix.txt`). **紂 failed no run of the gate, and the reason is the check's bound rather than luck**: it stands only inside a card's 通鑑用例, and the census does not press controls — so it was in the list because a reader who opens one of those cards meets the same fallback, and the gate would have gone on saying nothing about it.

Cost and reach were measured before the pages were touched: **13,236 B** for a page that draws one of the 18, **0 B** for the list when nothing on screen draws those characters, **18 of 18 covered** at weights 400, 500 and 700 in both stacks, and the same 18 on all four `tongjian/` pages, identical on each (`out/glyphs/probe-fix.txt`, `out/glyphs/verify-links.txt`). The four-page run the fix was accepted on ended `shot: 24 page loads clean`, exit 0 — four pages, three viewports, two themes — and the clean runs in the ignored `out/rerun/` are `shot-ch02-after.log` (chapter 2, desktop light) and `shot-phone.log` (`shot: 4 page loads clean`, chapters 2 and 3 at phone width in both themes).

### Three forms it cannot cover, excluded on purpose

𠆸 U+201B8, 𥳑 U+25CD1 and 𣳘 U+23CD8 are astral-plane forms — CJK Extension B — and no webfont the page can load draws them. Nine families were asked (Noto Serif SC and TC, Noto Sans SC and TC, Noto Serif HK and Noto Sans HK, LXGW WenKai TC and Mono TC, and Noto Sans Symbols 2): every one answers HTTP 200 with a `unicode-range` that claims all three, and the census reads SimSun-ExtB for all three on every one of the nine (`out/glyphs/probe-astral.txt`). They are deliberately outside the list, they fall back to the machine's own SimSun-ExtB, and a machine without that meets tofu. It is the same shape already recorded for 絺's astral-plane Simplified form 𫄨 (U+2B128).

### The bound, stated rather than hidden

The census proves **which face drew a character, and nothing past that.** It cannot see text drawn into a canvas or through WebGL, a character that appears only after a control is pressed, or `lab/`, which this gate does not visit. It judges code points apart, so a combining sequence is split. It asks whether a face was loaded, never whether the right loaded face was picked, whether the glyph is well drawn, or whether the size and weight are the intended ones. 紂 is in the fix because of the second blind spot: a gate that cannot press a control was silent about a character it had no way to draw.

### The fragility, stated rather than hidden

**The 18-character `text=` list is hand-maintained, and nothing on the page says when it has gone stale.** A rare character added to the corpus tomorrow is drawn by the reader's machine until somebody adds it to the list, exactly as before, and looks almost right on a machine with a face for it. The census is what turns that silence into a red gate naming the code point, which is the whole of the safety — the same trade the library page's entry already argued for a hand-maintained character list, and it holds only while the gate runs. **This is the fragility the biology pages' own `text=` list has** (the `⇌⇀↽→…` request on every one of them, and the library page's Han list), with the same single guard.

## 2026-09-16 — a finished chapter told readers the next one did not exist, three times

The owner read the published site and found chapter 1 announcing that chapter 2 was in preparation while chapter 2 sat finished on disk. It was fixed. It then happened to chapter 2 about chapter 3, and was fixed. It has now happened to chapter 3 about chapter 4.

| Symptom | Root cause | Now checked by |
|---|---|---|
| The card closing a chapter links to `../` and its description says the next chapter is in preparation, while that chapter is written | `npm run check` has a rule that every `href` resolves to something. `href="../"` resolves perfectly: it is the book's contents page. The link is not broken, it is **wrong**, and nothing in the authored page carries the fact that would reveal it. | `tools/check-content.js` now reads every `chNN-` directory in the book and hands each page its lowest-numbered sibling above. When that sibling exists and the page carries a closing card, it checks the link, the chapter number announced, and six phrases that call a chapter unwritten. |

**Why it took three occurrences to gate.** Each time it was one line, and one line is faster to fix than to think about. The fact needed to catch it is not in the file being checked — it is in the tree beside it — so every rule that reads only the document was structurally blind. The rule works because it compares the page against the filesystem, which is the same move that fixed the page list nobody was visiting and the publish list that was a roll-call of two files.

**A detail worth keeping**: the rule takes the lowest-numbered chapter above the page, not the number plus one, so a gap in numbering turns the rule off for nobody. And two of its six fixtures exist to stop it over-firing: the newest chapter, whose card correctly points at `../` because the next chapter does not exist, must pass; and the second book's chapters, which carry no closing card at all, must not be failed for lacking one.

## 2026-09-19 — `npm run devices` went red on a shape that is not slow, and could not say which phase had stalled

**The symptom, as it was recorded.** On the book's contents page — `tongjian/index.html`, page id `tongjian` — at the `phone-landscape` shape (750×342, deviceScaleFactor 3), `npm run devices` failed with `page.screenshot: Timeout 120000ms exceeded`, **in both arms of a full-matrix comparison**, and re-ran green on a quiet machine. That is the report this entry is written from. Nobody has seen the failure since, including the session that wrote this entry: the original text was read, not observed.

**Four attempts over two sessions failed to reproduce it.** The trimmed tuple the gate itself names (`DEVICE_PAGES=tongjian DEVICE_ONLY=phone-landscape DEVICE_THEMES=light`) came back `all clean` in 7.3 s on a machine already at 100% CPU with 30+ node and 30+ chromium processes. A previous session's three attempts sit in `out/devices-repro{1,2,3}/report.json` and are also clean, one of them at this exact shape and page. This session added 68 full gate-path loads at the failing shape — 44 under the two other sessions' load and 24 with 64 burner threads held for seven minutes on a 32-thread machine — with zero failures, and no single capture over 3.35 s. **The defect is recorded as observed and not reproduced; the root cause is unknown.**

**What the instrument actually is, which is the finding.** `page.screenshot` is not one wait. In Playwright 1.61.1 it is three, under a single `progress.race`: `screenshotPage` asks the page for its scroll offset and runs an all-frames prepare evaluate (`coreBundle.js:20857` screenshotPage, `:20912` `_preparePageForScreenshot`), **waits for `document.fonts.ready` in the utility world (`:20916`)**, and only then sends the CDP capture (`:44556`, `Page.snapshotRect`). All three reject with the same words, so `page.screenshot: Timeout 120000ms exceeded` names the API call and never the wait — and the gate compounded it: one `page.setDefaultTimeout(120_000)` at `tools/devices.js:391` covered the navigation, the ready handshake, the font wait, all six suites and the capture, so a red run could not say which of those had stalled. The reported attribution to the screenshot was therefore never established: it could have been the font wait or the handshake.

| Symptom as recorded | Root cause | Now checked by |
|---|---|---|
| `page.screenshot: Timeout 120000ms exceeded` on `tongjian` at 750×342, in both arms, green on a re-run | Not established. Bounded: the capture is not a slow shape. Median capture cost is 42–63 ms per megapixel at every shape from aspect 0.59 to 7.20, so the wide-and-short viewport does nothing special; the 750×342 @3 surface is 2.31 MP and its median capture is the *best* of the 2.3 MP group. What moved under load was `page.goto` (2 s → 20 s), `newPage` and the whole load (1.2 s → 24.1 s) — the network and renderer-start phases, not the capture | Every phase of a load now carries its own budget and its name: navigation 120 s, ready handshake 120 s, font wait 30 s, each suite group 60 s, capture 45 s. A budget that fires prints the phase, the budget, how long it had run, the shape and page, and what would satisfy it |

**The bounds, all measured on this tree (`out/devtime/README.md` holds the probe reports).** Capture at the failing shape over 68 rounds: min 68 ms, median 107–185 ms, worst **3348 ms** — 36× under the 120 s budget the gate had. The 5.18 MP desktop shape peaked at 620 ms, so a 2.3× larger surface was 5× faster at its worst, which is what refutes the shape as the cause. Under 64 burner threads on 32 cores, 24 of 24 loads completed with the same capture distribution (min/median/max 110/161/3093 ms) while `goto` went 2 → 20 s. **CPU contention belongs to the network and renderer-start phases, not to the capture**, and no measurement here produces a capture anywhere near two minutes.

**The change, and why it is diagnosability rather than a relaxation.** `tools/devices.js` now declares four budgets — `NETWORK_BUDGET_MS` 120 s, `SUITE_BUDGET_MS` 60 s, `FONTS_BUDGET_MS` 30 s, `CAPTURE_BUDGET_MS` 45 s — and `runPhase` bounds each phase by its own and names it on failure. **Not one of them is looser than the flat 120 s it replaced**, and the capture's 45 s is 13.4× the worst capture ever measured here. The font wait, which is the one wait whose old attribution was provably wrong, is now asked for by name before the screenshot rather than discovered inside it.

**It was proved red, by mutation, twice.** Forcing the capture budget to 1 ms (`CAPTURE_BUDGET_MS = 1`, one line, reverted) on the shipped code produced `FAIL … page.screenshot: Timeout 1ms exceeded. — thrown while this load was in the capture (…)` on the gate's own tuple (`out/devtime/red-proof.log`, `out/devices-red/report.json`, log written 2026-09-16 21:53). Every run of the proof happened before the change was committed, so no committed revision ever carried the mutation. Restored, the same tuple is green — `ok chromium phone-landscape tongjian … all clean`, exit 0, 34.4 s — with 32 burner threads at 100% CPU on a 24C/32T machine and 69 chrome+node processes running, the other sessions' gates among them (`out/devtime/green-proof.log`). A third mutation, `FONTS_BUDGET_MS = 1`, did **not** go red: the utility-world font wait resolved inside the 6 ms the timer took to fire, which is itself a measurement — the wait this gate was silently exposed to costs single-digit milliseconds on this page.

**The new message caught its own author twice inside twenty minutes, which is the best evidence for it.** The first version handed the budget to each Playwright call through a helper; `page.evaluate` takes no options in this version, and its argument slot returned `Too many arguments. If you need to pass more than 1 argument to the function wrap them in an object.` The second version renamed a helper at its definition and not at one call site, and the run said `budgetedOptions is not defined`. Both arrived **with the phase named** — "thrown while this load was in the header and sideways-scroll phase" and "thrown while this load was in the ready handshake" — where before the change the first would have been a bare Playwright string and the second could have been attributed to the capture. The helper layer was then deleted for the smaller mechanism: one `runPhase` with a timer, no options plumbing. A diagnosability change that immediately diagnosed its own author is doing what it claims.

**What is not known, and the next person should not assume it away.**

- **What actually stalled, and why.** No capture of any shape on this machine has been made to exceed 3.35 s, so no measurement here explains two minutes.
- **Whether the shape had anything to do with it.** It is refuted as a *cost*: the failing shape is the fastest of its surface group and the widest-shortest viewport is the slowest. If the original red was real, the shape is not why.
- **Whether the machine's state at the time is recoverable.** A cold page cache, a slow font CDN and a wedged GPU process are indistinguishable in the gate's log, and the old message could not tell them apart either.
- **Whether this intermittent is one defect or several.** The same gate has an older, separate intermittent recorded above (`tapping a glossary term opened no definition`), and the two have never been seen together.

**A candidate mechanism now exists, and it is a candidate, not a cause.** `tools/zj-quiet-browser.cjs` exists to suppress chromium's `0x80000003` crash dialog — the modal recorded in this file on 2026-09-12 — and a modal window raised by the browser process is exactly the mechanism that would hold a screenshot call until a budget fires and then be reported as a screenshot timeout. Nothing in the gate path sets the `NODE_OPTIONS` preload that engages that suppression when `npm test` runs, which is a separate finding owned by another worker and recorded separately; if it holds, it is a candidate explanation for the hang this entry could not reproduce, and settling it needs a run that observes the dialog, not another reading of this file.


Scratch fragment for `docs/learning/defect-register.md`, written 2026-09-16 by the worker that measured both
findings. `out/` is ignored, so this commits nothing; a follow-up appends it. Shape follows the register's
existing entries: symptom, root cause, what is measured rather than assumed, and what now checks it.

Both findings are the same class, which is why they are one fragment: **a guarantee this repository believed
it had and did not.** In one case nothing read which rasterizer drew a frame; in the other nothing loaded the
mechanism that suppresses a crash dialog, and the file that carried the claim named an environment variable
that no script ever set.

---

## 2026-09-16 — no gate said which rasterizer drew the frame, and the gate's frames depend on it

**Symptom.** A scratch probe read the WebGL renderer out of a chromium launched exactly as the gates launch
one and got `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)` —
a CPU rasterizer, on a machine carrying an **RTX 4090**. The whole suite was rendering 3D frames in software
and no gate's output said so, because no gate read the renderer string at all. A green `sweep3d` reporting
ninety rendered frames was equally consistent with either rasterizer.

**What was measured rather than argued** (all under ignored `out/gpu/`, nine gate arms, `renderer.json`,
`arm*.log`, `perkind-*.json`, `compare-*.txt`):

| Question | Answer |
|---|---|
| Can this chromium reach the GPU? | **Yes, with one flag.** `--use-angle=d3d11` alone produces `ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)`. Neither headful nor `--headless=new` is needed, and `--use-gl=angle` is redundant. The mechanism is that `--enable-unsafe-swiftshader` is what **pins** the software fallback: without it ANGLE takes the default backend and reaches the device. So `GPU_ARGS` in `tools/lib/browser.js` was already correct, and the `gpu = false` default was the only thing keeping the CPU path. |
| What is the GPU worth? | `npm run sweep3d` medians **101.1 s → 52.1 s (1.94×)** over nine arms, `ok=90 fail=0` in every one. The four GPU arms sat inside 10% (48.4/48.5/52.1/53.7 s) while the CPU arms ranged 61.1–155.4 s, so the faster condition is the stable one and the spread is CPU-side contention, not a confound in the comparison. Per kind, raster 757.4 → 160.5 ms and frame total 1643.2 → 922.9 ms. |
| Do the frames match? | **No, and they are not supposed to.** Two CPU runs: 180/180 byte-identical, max Δ 0. Two GPU runs: 119/180 identical, 61 differing by max Δ 1–2. CPU against GPU on the settled figures (`cell3d`, `dna3d`, `water3d`): mean \|Δluma\| 0.12–0.66, `>8 delta` under 1% on 11 of 12 pairs, worst row `cell3d-light-03-bare` at 0.66 / 1.35% / max Δ 86. Inspected at full size with an 8×-amplified difference (`diff-*.png`): composition, geometry, camera, colours, labels and counts identical, the difference tracing each silhouette — the MSAA signature, matching `antialias: true` at `src/figures/lib/three-common.js:58`. |
| Where does the frame time actually go? | **Readback, not raster.** 762.4 of 922.9 ms per frame on the GPU, 885.8 of 1643.2 ms on the CPU — the screenshot barely moved between them, and it is the same ~180 ms whether a view changed or not. The raster gain cannot move the gate much, and the real lever is the readback nobody has looked at. |

**Decision: the default does not change, and the reason is byte-reproducibility.** 1.94× was declined because
the CPU path produces 180/180 identical frames and the GPU path does not. "Every frame is a pure function of
its clock and the reader's actions" is exactly the promise that a screenshot is the same frame every run, and
a 1–2/255 jitter is a real price against that promise. The speed stays reachable per tool through the
existing `PERF_GPU` / `SHOT_GPU` / `SWEEP_GPU`, so nothing is lost to a developer who wants the fast loop.
Two weaker reasons were offered during the round and are recorded here as **not** the basis: "the gate-level
effect is swamped by contention" (false — the arms resolve it, and the CPU column is the noisy one) and "CI
has no GPU" (true, but it is an argument about where the flags run, not about whether the trade is good).

**Now checked by.** `tools/lib/browser.js` prints one line per launch naming the rasterizer, its vendor, and
the flags chromium was really started with, read back from the running browser's own argv through CDP. It is
**report-only**: SwiftShader is not a failure, because CI has no GPU and a check naming a device would be red
there for being correct. It fails only when no renderer string can be read at all, since then the instrument
is broken and silence would read as agreement. Both failure branches were proved to fire: no WebGL context
(`--disable-webgl`) and a context reporting no renderer (prototype-stubbed `getParameter`), each producing
`cannot read the WebGL renderer, so this run cannot say which rasterizer drew its frames` —
`out/gpu/renderer-red.mjs`, 2 of 2 branches, 0 unexpected reds. That proof took three attempts, and the first
two are worth recording: `addInitScript` overriding `HTMLCanvasElement.prototype.getContext` **never took**
(the native function was still there afterwards), so the "red proof" was passing by measuring the healthy
browser twice, and the second attempt stubbed one context instance while the probe made its own canvas.

---

## 2026-09-16 — the crash-dialog mitigation was inert in every run, and its own comment named the reason

**Symptom.** `tools/zj-quiet-browser.cjs` exists to keep chromium's `0x80000003` modal crash dialog off the
desktop (the 2026-09-12 entry below). It was never loaded. `test/browser-quiet.test.js` asserted its flag
list and merge function and was green, so the repository read as covered.

**Root cause, in the repository's own words.** The wrapper's header said it was applied "through
`NODE_OPTIONS=--require=./tools/zj-quiet-browser.cjs`, which applies before any ESM import" — and **nothing in
this repository set `NODE_OPTIONS`.** Every script was a plain `node tools/<gate>.js`, `tools/test.js` spawned
gates with `spawnSync(process.execPath, args, { stdio: 'inherit' })` and no `env`, and no workflow set it. The
unit test's own header named the limit honestly and then deferred the effect to a probe: "this half cannot see
a patch that silently fails to apply. It proves the intent, the flag list, and the merge function. The probe
proves the effect" (`test/browser-quiet.test.js:20-21`) — and the probe, `tools/zj-quiet-browser-probe.js`, is
"run deliberately" and applied the patch by hand at line 31, so it passed whether or not anything was wired.
So the limitation was documented for the test and the effect was deferred to a check the gates never run.

**Measured.** `node out/gpu/preload-engaged.mjs`, same machine, same tree: with no `NODE_OPTIONS` the process's
own `execArgv` carries no preload, no `__zjQuiet` marker is on any of the three browser types, and the running
chromium's command line is **52 arguments with all three flags absent** — `--noerrdialogs`,
`--disable-crash-reporter`, `--disable-features=Crashpad` missing. Through an npm script after the fix: the
preload is in `execArgv`, all three types are marked, and the command line is 55 arguments **with all three
present**.

**Fix.** The wrapper stays the only place the flags are written; the wiring is what makes it load.
`package.json` gives every browser-launching script `node --require ./tools/zj-quiet-browser.cjs` (18 of 19;
`audit` is `npm`, and the check asserts that exemption rather than assuming it), and `tools/test.js`'s spawner
prepends the same `--require` to each gate it runs so the whole chain inherits it. Adding the flags to
`launch()` instead was rejected on purpose: one preload covers every launch in the process — including
`tools/devices.js`'s WebKit and Firefox arms, which do not go through `tools/lib/browser.js` — and two
mechanisms merging one flag list drift apart. `.cjs` is spelled out because the package is `"type": "module"`
and `--require ./tools/zj-quiet-browser` fails with MODULE_NOT_FOUND on Node 24 (measured). `npm run unit` is
still 175 pass / 0 fail, because the wrapper's `require('playwright')` is inside a `try`/`catch`.

**Now checked by.** Two things, and the second is the one that covers the class:
1. Every launch line now prints `preload engaged|absent` and the argv chromium really received, filtered to
   the flags that matter. A run whose line carries `noerrdialogs disable-crash-reporter
   disable-features=Crashpad` is positive evidence the preload engaged; their absence is equally visible. No
   probe is needed to tell the two apart, in any gate, on any run. Proved in a real gate log: wired
   `preload engaged … args as launched (8 of 56) … noerrdialogs disable-crash-reporter
   disable-features=Crashpad`, unwired `preload absent … (5 of 53)` with none of the three.
2. `out/gpu/wiring-check.mjs` derives which scripts need the preload (a target that imports playwright,
   directly or through `lib/browser.js`) and fails any that does not carry it. Green on the tree: 18 of 18
   browser-launching scripts wired. Red when the wiring is removed: **13 problems** with every script
   stripped, and **1 problem** when only `sweep3d` is unwired — naming the script, the file it launches, and
   the flag to add. Its first version mis-parsed `--require=./tools/zj-quiet-browser.cjs` as the *target* of
   seven scripts and accused them of being unwired; the fix drops flag words before choosing the target, and
   that mistake is recorded because a check that cannot parse what it judges reports on itself. **Owed to
   gate-proofs.md:** promoting this from a scratch probe into `test/browser-quiet.test.js`, where it would be
   seen by `npm run unit`, with its own mutation proof.

**Still owed, stated rather than implied.** `tools/zj-quiet-browser.cjs:40-44`'s `catch` covers an
unresolvable playwright so that a plain Node run still works — correct — but it means **"the patch ran and
could not resolve playwright" and "the patch never ran" produce the same log line.** The new argv read
narrows it: `__zjQuiet` on the chromium type proves the patch ran *and* found playwright, and genuinely
present quiet flags prove the merge reached the browser. What it cannot distinguish is the middle case, where
the preload loaded but resolved nothing. Closing that needs the wrapper to record a marker *before* its
`require`, which was not done here.

---

## Pointer, and a candidate not a cause

The crash-dialog defect itself (the modal window, `0x80000003`, why it outlives the Node process, and why no
gate can observe it) is the **2026-09-12 entry, "a browser crash dialog read as the gate misbehaving"** —
`docs/learning/defect-register.md` line 54. That entry's own row says the mitigation is "preloaded through
`NODE_OPTIONS=--require`", which is the sentence this fragment corrects: the mechanism was designed, tested in
isolation, and never connected. The two entries should be read together, and this one does not replace it.

**Is the wiring gap the cause of the unreproduced `devices` hang? A candidate, explicitly not a cause.**
Nobody has reproduced that hang, and the two are consistent in shape: a gate that runs chromium with the
dialog suppression inert could sit until a 120 s timeout and then be reported as a screenshot timeout, which
is what a modal window would look like from inside the gate. But **no measurement here connects them** — all
nine of this round's arms ran to completion with the mitigation unwired, and no dialog appeared, so
"unwired" is not sufficient on its own to produce the hang. What would settle it: the next time it is
reproduced, capture (a) the launch line from the gate log, which now says whether the preload engaged, and
(b) `tasklist` for a `chrome-headless-shell.exe` with a modal window. If the hang recurs *with* the line
reading `preload engaged`, the wiring is eliminated and the cause is inside chromium. If it recurs with
`absent`, look first at whether the preload was bypassed — a gate run through a path that does not honour
`--require`, or a spawner that does not inherit it. Until one of those is observed, this stays a candidate.

---

## What could not be established

- **Whether the other gates' verdicts survive under the GPU rasterizer.** Only `sweep3d` was authorised and
  run: four GPU arms, 90/90 frames, zero errors, and its limits sit far from any marginal value. `shot`,
  `narrow`, `drive` and `devices` were never run under `--use-angle=d3d11`. `npm test` is ten steps and stops
  at the first red one, so a single marginal measurement going red under a different rasterizer would cost
  more time than the 49 s the change saves.
- **The CPU baseline on a quiet machine.** Every arm ran at 90–100% CPU load with another session's chromium
  processes on the box. The GPU arms' tight clustering and the CPU arms' 2.5× spread make the direction
  certain, but no CPU arm isolates the renderer from contention, so 101.1 s is a median under load and not a
  clean baseline.
- **Whether the mid-run commit changed anything measured.** HEAD advanced `fcae416` → `0865e896` during the
  round and `git status` grew from 13 to 14 modified files. All six figure modules and both gate files
  (`tools/sweep3d.js`, `tools/lib/browser.js`) hash identically at start and end, and
  `git log fcae416..HEAD -- <those files>` is empty, so the A/B variable held still even though the
  repository did not.
- **`npm run devices`, one arm, end to end.** Attempted once as
  `DEVICE_PAGES=tongjian DEVICE_ONLY=phone-landscape DEVICE_THEMES=light npm run devices` and it exited 1 in
  0.7 s on a **`SyntaxError: Unexpected token ')'` at `tools/devices.js:742`**, an uncommitted in-flight edit
  by another session (`git show HEAD:tools/devices.js` parses clean, exit 0). So the preload wiring is proved
  under `sweep3d` and by `wiring-check.mjs`'s 18-of-18, and **not** under `devices`. The step was yielded to
  the worker that owns that file rather than worked around.
- **A `devices` wall time, and any trimmed-gate timings taken during the round** (12.4 s for a
  `SWEEP_KINDS=water3d` run) — measured at 94–100% load with three gates on the box, so they are recorded
  here as load-affected and are not evidence about the change.
- **Whether `--enable-automation` on every launch alters gate behaviour.** It is added because
  `Browser.getBrowserCommandLine` refuses to answer without it, and it is the only way to read the real argv.
  `sweep3d` is green with it (90/90, twice), and no other gate has been run since it was added.
