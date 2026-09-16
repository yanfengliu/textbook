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
