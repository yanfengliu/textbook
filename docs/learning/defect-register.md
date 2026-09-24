# Defect register

Every defect the owner reports is recorded here and gated, never only fixed. The entry stays after it becomes a gate: this is the standing list of what the gates could not see, which is where the next defect comes from.

## Read one entry, not the file

**None of these entries is a rule you have to obey.** The rules they produced live where rules live: the gate that now covers a defect states its claim in its own header, `AGENTS.md`'s Gates section lists every one, and the standing bars the owner set are in [local-rules.md](../policies/local-rules.md). This file is the *evidence* behind those — what the gates could not see, and what it cost. Come here for one of three reasons and read only what the index sends you to:

- **You are writing an entry.** Copy the shape below. Do not read a neighbour for the form.
- **You are about to claim something is covered.** Find the area in the index and read that entry's "now checked by", including its bound. Four entries here exist because a check was believed to cover something it did not.
- **You are looking for what is still unwatched in an area you are changing** — figure colour, phone input, fonts, the gates' own wiring. The index groups by area at the end.

Entries are **not in date order**: the file was appended to from both ends over several rounds. The index below is in file order and is the reliable lookup.

### The shape of an entry

One `##` per defect, headed `<date> — <the symptom as a sentence>`. Inside:

- **The symptom in the owner's or the reader's own words**, quoted. Their words, not the diagnosis: *"Sidebar on mobile doesn't work"* is the record, and what it turned out to be is the next paragraph.
- **How it was found**, including when that was a probe rather than a failing run.
- **The root cause**, down to the line. Where the cause is a unit error or a wrong assumption, say which.
- **What the gates could see, and why the answer was nothing.** The reason this file exists.
- **Now checked by**, as a `| Symptom | Root cause | Now checked by |` table when there are several, and naming the **class** the new check covers rather than the one instance. A check that is added but not yet proved red says so, and points at [gate-proofs.md](gate-proofs.md) once it is.
- **The lesson underneath**, when several defects share one.

## Index

In file order. Every line is one `##` entry.

| Entry | What the owner or reader saw | Now checked by |
|---|---|---|
| [2026-09-10 — four defects on a real phone and a desktop](#2026-09-10--four-defects-on-a-real-phone-and-a-desktop-none-of-which-any-gate-could-see) | drawer dead, toggle out of its corner, glossary popover off screen, inconsistent widths | `npm run devices` — the gate this entry created |
| [2026-09-11 — the furniture had no vocabulary](#2026-09-11--the-furniture-had-no-vocabulary-so-every-element-reached-for-a-box) | *"If anything is less than supreme quality then don't even bother"* — a standing bar, not one defect | [local-rules.md](../policies/local-rules.md), "Typography and visual design are the product". No gate; a person looks |
| [2026-09-12 — a browser crash dialog read as the gate misbehaving](#2026-09-12--a-browser-crash-dialog-read-as-the-gate-misbehaving) | a modal `0x80000003` window left on the desktop by a gate run | `tools/zj-quiet-browser.cjs` + `test/browser-quiet.test.js` — **but read the 2026-09-16 entry below, which found the mitigation was never loaded** |
| [2026-09-12 — the page list only worked while the site had one book](#2026-09-12--the-page-list-only-worked-while-the-site-had-one-book) | found by probe before the second book existed: `ch01` is not unique across two books | `test/pages.test.js`; page ids are book-qualified |
| [2026-09-12 — a tap is a hover and a click, and the hover got there first](#2026-09-12--a-tap-is-a-hover-and-a-click-and-the-hover-got-there-first) | one glossary term in 172 opened no card on a phone | `npm run devices`. Same area as 2026-09-10 |
| [2026-09-12 — two figure modules could not load, and the unit suite was green](#2026-09-12--two-figure-modules-could-not-load-and-the-unit-suite-was-green) | a figure rendered as the frame's error box while `unit` reported 117 of 117 | `test/registry.test.js` — a real parse, not a text match |
| [2026-09-19 — reading it twice found ten defects in the second book](#2026-09-19--reading-it-twice-found-ten-defects-in-the-second-book-and-a-cosmetic-property-was-hiding-a-click) | ten, six of them from a reader-proxy; `display: inline` decided where a click landed | several; the entry's own table. Created the reader-proxy role |
| [2026-09-16 — the library page showed Chinese in a font it never loaded](#2026-09-16--the-library-page-showed-chinese-in-a-font-it-never-loaded-and-the-machine-hid-it) | found by a new check on its first run, before it was asked to find anything | the font census in `npm run shot` |
| [2026-09-16 — a figure handed the browser a negative width](#2026-09-16--a-figure-handed-the-browser-a-negative-width-and-the-gate-that-could-prove-it-was-not-the-obvious-one) | `<rect width="-0.1">` on main, pushed, logging console errors live: a pixel subtracted from nanometres | `auditFigureGeometry` in `npm run shot` |
| [2026-09-16 — rare characters in the 原文 were drawn by the reader's machine](#2026-09-16--rare-characters-in-the-原文-were-drawn-by-the-readers-machine-and-the-page-had-loaded-the-right-fonts) | the page loaded the right fonts and still fell through, 21 code points of 1,937 | the `text=` subset plus the census. Same check as the entry above it, one day on |
| [2026-09-16 — a finished chapter told readers the next one did not exist, three times](#2026-09-16--a-finished-chapter-told-readers-the-next-one-did-not-exist-three-times) | chapters 1 and 2 said the next was in preparation while it sat finished on disk | `npm run check`'s next-card rule, keyed on the tree rather than the document |
| [2026-09-19 — `npm run devices` went red on a shape that is not slow](#2026-09-19--npm-run-devices-went-red-on-a-shape-that-is-not-slow-and-could-not-say-which-phase-had-stalled) | one shape timed out and the gate blamed the screenshot. **Not reproduced in four attempts** | the gate now names which phase ran out of time. The hang itself is open |
| [2026-09-16 — no gate said which rasterizer drew the frame](#2026-09-16--no-gate-said-which-rasterizer-drew-the-frame-and-the-gates-frames-depend-on-it) | every gate's frames came from a CPU rasterizer on a machine with a GPU | a run says which renderer drew it |
| [2026-09-16 — the crash-dialog mitigation was inert in every run](#2026-09-16--the-crash-dialog-mitigation-was-inert-in-every-run-and-its-own-comment-named-the-reason) | nothing in the repository set `NODE_OPTIONS`, and the test that covered it was green | the preload is wired into every browser gate and a launch says which preload state it is in. **Read with the 2026-09-12 crash-dialog entry, whose claim this one corrects.** Its two closing `###` sections — the pointer, and what could not be established — cover this entry and the rasterizer one together |
| [2026-09-16 — the ink follows the theme, the fills do not](#2026-09-16--the-ink-follows-the-theme-the-fills-do-not-and-no-gate-had-ever-measured-a-figures-own-type) | a voltmeter reading near-white on near-white cytoplasm in the dark theme | the figures' own type is measured. Sixteen modules read a fixed-hex lookup |
| [2026-09-17 — the book could not say which of its words were 通鑑's](#2026-09-17--the-book-could-not-say-which-of-its-words-were-通鑑s) | *"Just make it perfectly clear what came from the book what didn't it, everywhere."* — 21 runs of 通鑑's words printed as the book's own sentences, and one sentence contradicting the figure below it | `test/provenance.test.js` — the mark, the figure declarations and the key. **The claim about the page itself is still ungated** |
| [2026-09-17 — a gate was failing because it was slow](#2026-09-17--a-gate-was-failing-because-it-was-slow-which-is-the-clearest-case-for-the-rule) | found on the frozen baseline: `npm run devices` red, both failures `page.screenshot: Timeout 45000ms exceeded` on the second book's contents page, and no product defect behind either | no new check: the same gate, green once it was fast — 1661.5 s → 379.1 s, 62 of 62 clean. **It is the evidence for the owner's rule that slowness is a defect** |
| [2026-09-17 — two figures started running when something pressed Play, with the clock pinned](#2026-09-17--two-figures-started-running-when-something-pressed-play-with-the-clock-pinned-and-every-gate-that-photographs-them-was-green) | found by probe from a gate-timing anomaly: `secretion` ran 0.983 s of clock and `gradient-battery` a simulated minute, both at `?t=0` | `npm run pinned` — the gate this entry created. **Six more figures still break it and are listed by name in `tools/pinned.js`** |
| [2026-09-17 — a sort choice ran off the smallest phone](#2026-09-17--a-sort-choice-ran-off-the-smallest-phone-and-every-other-gate-was-looking-at-390-px) | found by `npm run devices` the day chapter 5 landed: a 298.8 px sort segment in a 266.8 px column, 5 px of sideways scroll at 320 px | `npm run devices` at `phone-small` — **the repository's only 320 px viewport** |
| [2026-09-17 — a figure's toolbar took ten rows on a phone, two presses from the only state any gate measured](#2026-09-17--a-figures-toolbar-took-ten-rows-on-a-phone-two-presses-from-the-only-state-any-gate-measured) | found by a worker looking at a frame: `enzyme-kinetics` at 390 px, toolbar 320 px of a 456 px stage, readout drawn over the graph, the lane a 40 px sliver | `npm run narrow`, which now opens what a reader can open. **It found `atp3d` on its first full run** |
| [2026-09-17 — twenty-three unreadable labels](#2026-09-17--twenty-three-unreadable-labels-and-the-rule-that-could-not-see-most-of-them) | found by instrumenting `npm run legible`: it reported one problem where there were twenty-three, and `bondlab` skipped 44 of 48 glyph runs in the light theme and 48 of 48 in the dark | `npm run legible`, which now judges a glyph against the worst pixel under its core instead of a colour it could name |
| [2026-09-17 — a press on the scale's lens was dropped while it was still gliding](#2026-09-17--a-press-on-the-scales-lens-was-dropped-while-it-was-still-gliding-and-it-looked-like-a-flaky-gate) | a gate step red 17 runs of 20 — and underneath it, a reader's grab on a gliding lens doing nothing | `npm run drive`'s `scale` recipe, which now starts its own glide and asserts the figure's own verdict on the press. **The class is one figure wide; the entry says so** |
| [2026-09-22 — a reader whose stored theme differs from their system saw the whole page in the other theme first](#2026-09-22--a-reader-whose-stored-theme-differs-from-their-system-saw-the-whole-page-in-the-other-theme-first) | found by measuring why `npm run shot` disagrees with itself: one to three frames of the whole page in the other theme, then the titles fading across — Today on 6 loads of 6 | `npm run theme`, a new step of `npm test`, and `test/theme-early.test.js`; the settle wait in `npm run shot` for the fade |
| [2026-09-22 — `soup` draws 475 water molecules or 474 on a phone, depending on when the fonts arrived](#2026-09-22--soup-draws-475-water-molecules-or-474-on-a-phone-depending-on-when-the-fonts-arrived) | found by probe, holding the font responses: 475 in 3 loads of 3 with the fonts early, 474 in 3 of 3 with them late — a breach of the figure invariant | **no gate yet.** Queued for the textbook session's next worker on chapter 2's figures: rebuild on `document.fonts.ready`, as `scale.js` does |
| [2026-09-23 — at 90 °C the bilayer tank said "Micelles", and a 1024 px page's tank said "Bilayer"](#2026-09-23--at-90-c-the-bilayer-tank-said-micelles-and-a-1024-px-pages-tank-said-bilayer) | GitHub's `npm run drive`: *"micelle at t=8.033, 0.641 buried"*; and after Curl, "two open ends" beside a sealed sheet | `npm run drive` (two `bilayer` steps, walked by Step) and `test/bilayer-model.test.js` |
| [2026-09-23 — the library page said only chapter 1 was ready](#2026-09-23--the-library-page-said-only-chapter-1-was-ready-with-five-chapters-published) | *"Chapter 1, “What is life?”, is ready; thirty-one more are outlined"* on the live front page and in README.md, with five chapters published | `npm run check`'s `checkChapterAvailability`: a book's contents page, the library page's shelf cards and README.md against the chapter directories on disk. **`docs/design/textbook.md` still says it and nothing reads it** |

**By area, for when you are changing something and want what is still unwatched there.**

- **Phone and touch** — 2026-09-10 (four defects), 2026-09-12 (tap is a hover), 2026-09-17 (a sort choice at 320 px). The last one is also the note that only one device in the whole chain is narrower than 390 px.
- **Fonts and script** — 2026-09-16 (library page), 2026-09-16 (rare 原文 characters).
- **A figure's own pixels** — 2026-09-16 (negative width), 2026-09-16 (ink and fills). Both are defects a frame-rendering gate looked straight at and could not see.
- **A figure's clock** — 2026-09-17 (Play under a pinned clock), 2026-09-23 (a verdict read off one sweep of a thermal walk, and a gate that read it at an instant the machine chose). Six figures still break it; `tools/pinned.js` names them and `npm run pinned` prints them every run. Read that entry before assuming a figure's frame is reproducible after a press.
- **A figure's own layout at a phone's width** — 2026-09-17 (a toolbar of ten rows). The one entry whose lesson is about *when* a gate looks rather than *where*: every measurement in the chain was of a figure's opening state.
- **The gates' own wiring** — 2026-09-12 and 2026-09-16 (crash dialog, twice), 2026-09-16 (rasterizer), 2026-09-19 (`devices` phase), 2026-09-12 (two dead modules, green suite), 2026-09-17 (the dropped press: the one entry here whose defect was already turning a gate red, in a disguise that got it retried).
- **A press that arrives while something is moving** — 2026-09-17 (the scale's lens). Read it before assuming a drag recipe covers a figure: it is the only step in `tools/drive.js` that owns its own timing window and asserts the figure's own verdict on a press, and the entry names what that leaves uncovered.
- **Cross-book and cross-chapter facts** — 2026-09-12 (page ids), 2026-09-16 (next-chapter card), 2026-09-23 (the library page and the contents page). All three were invisible to any rule that reads one document.
- **What a reader sees while a page loads** — 2026-09-22 (the theme flash). Every page gate photographs a page after the handshake, so a defect that is over by then is invisible to all of them; `npm run theme` holds one attribute across the interval from `<body>` being inserted to the handshake, and nothing records the frames in between.
- **A figure's frame and when the fonts arrive** — 2026-09-22 (`soup`'s world). **No gate yet.** Every gate replays the fonts from memory after a run's first load, so a figure whose picture depends on when they arrive is seen in one of its states only.

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

### Pointer, and a candidate not a cause

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

### What could not be established — for both 2026-09-16 entries above, the rasterizer one and this one

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

## 2026-09-16 — the ink follows the theme, the fills do not, and no gate had ever measured a figure's own type

A worker building chapter 4 reported a defect in `gradient-battery`: the voltmeter's reading sat on the cytoplasm's fill and went **near-white on near-white in the dark theme**. They fixed that one instance by mixing the fill towards the paper so it follows the theme. The question this round was asked was whether that instance was unique. It was not.

**The cause, in two halves.** `src/palette.js` and `src/figures/lib/cell3-colours.js` hold fills that are fixed hexes — `ORGANELLES`, `EXTRA_ORGANELLES`, `BASES`, and everything derived from them — while the tokens written on them are not: `--ink` is `#1d1a17` on a light page and `#e9e4da` on a dark one. Text in `var(--ink)` over a fixed pale fill is therefore correct in one theme and unreadable in the other. The accents are the same trap from the other side: `--coral` is a mid red on a light page and a **light** salmon on a dark one, so ink over it fails dark (1.95:1) and paper over it fails light (3.32:1), and neither choice is right in both.

**What the gates could see.** Nothing. `npm run shot` asks whether a page threw; `npm run narrow` and `npm run sweep3d` judge whether a frame is blank, flat or near-black, which pale type on a pale fill passes perfectly; `npm run drive` presses real controls but runs the light theme only and asserts `describe()`, not pixels; `npm run devices` measures target sizes and edges. `out/colour2/contrast.mjs` does the WCAG arithmetic but over CSS token declarations in `tongjian/zj.css`, not over what a figure paints.

### What measuring found

Every figure rendered in both themes at a 1000×640 stage, driven through its own controls, with each glyph's colour read off the computed style and the surface under it read off a frame taken with the glyphs made transparent. Eight figures over three published chapters, in both themes:

| Figure | Words | Colours | Ratio | Cause |
|---|---|---|---|---|
| `levels` (ch01) | `104.5°` on the oxygen | `--ink-soft` on `--coral` | **2.07 light, 1.09 dark** | the label asked for `--paper` with a `fill` ATTRIBUTE and `.tb-levels .lv-note` beat it |
| `levels` | `ventricle` | `--ink-soft` on `tint(coral, 74)` | **2.87 light, 1.49 dark** | same |
| `levels` | `atrium` ×2 | `--ink-soft` on `tint(coral, 40)` | 4.35 light, **3.07 dark** | same |
| `levels` | `O` on the water molecule | `--ink` on `--coral` | 4.88 light, **1.95 dark** | `.tb-levels svg text { fill: var(--ink) }` beat `fill: C.paper` |
| `scale` (ch01) | every species name | `--leaf` on `--paper-2` | **4.36 light** | a figure accent spent as type |
| `tree` (ch01) | `mitochondria`, `chloroplasts` | `--water` on `--paper-2` | **4.01 light** | same |
| `homeostasis` (ch01) | five labels and chips | `--coral` on the paper | **3.07–3.29 light** | same |
| `bondlab` (ch02) | `δ+` beside a hydrogen | `--coral` on `--coral` | **1.00, both themes** | the glyph was placed straight up and landed on its own molecule's oxygen |
| `bondlab` | `δ+`, `δ−`, `+` | `--coral` / `--water` on the paper | **2.83–4.33 light** | a figure accent spent as type |
| `phlab` (ch02) | the charge sign on a carbon | `--ink` on `--ink-soft` | **2.36 light** | ink on the carbon disc's own fill |

Two more were measured and are **not** defects, and both are recorded because they cost time: `pasteur`'s pressed-and-disabled buttons read 2.08:1, which is WCAG 1.4.3's own exemption for an inactive control and this book's deliberate dimming; and `prokaryote`'s swimming readout read 1.06:1 because the figure kept running between the measurement's two frames, so one moment's glyphs were being read against another moment's pixels.

### What it is checked by now

`npm run legible` (`tools/legible.js`), step eight of `npm test`. It renders every registered kind in both themes at 1000×640, in its opening state and after each of its own visible enabled buttons has been pressed, and measures each glyph against the pixels actually under it: a magenta frame gives per-pixel glyph coverage, a transparent frame gives the surface, and the computed `fill`/`color` gives the text. WCAG 2.x AA, 4.5:1 or 3:1 for large text, with the rendered size — not the declared one, because a `font-size: 40px` glyph inside one of `levels`'s thumbnails is six device pixels on screen.

Its bound is in its own header, and the two things it cannot see are already live: text a figure paints into a canvas or through WebGL, and a colour pair only a slider or a click on the drawing reaches (`scale`'s ruler tick under the moving lens is one).

### The thing to notice

A mask read off the figure's own frame would have been circular. Text the same colour as the fill under it changes no pixel, so the very defect being looked for would have read as "this text draws nothing" — which is how `bondlab`'s 1.00:1 `δ+` would have been reported as clean. The gate paints the glyphs magenta to find them, and only then reads what is underneath.

## 2026-09-17 — the book could not say which of its words were 通鑑's

The owner, reading the published 資治通鑑, asked why 「魏、韓、趙共廢晉靖公為家人而分其地。」 — a 通鑑 sentence, quoted inside the 年表 in 背景 — was not also in the 原文 section. The answer is that **原文 is a selection**: this edition reads three passages of 卷001 word by word, and other entries of the same 卷 are quoted as context. He took the answer and asked for the general thing rather than the instance: *"Just make it perfectly clear what came from the book what didn't it, everywhere."*

The defect was real and it was two defects under one complaint.

**First: the mark was invisible, and that was the whole point of the complaint.** The book has recorded which run is 通鑑's since the two-script round — `lang="zh-Hant"` on every 原文 block, every quotation in prose, every card's 通鑑用例, every figure's `quote` — and `test/lexicon.test.js` proves every marked run is a verbatim corpus quotation. **An attribute is invisible.** A quotation in 背景 was Traditional and otherwise identical to the sentence around it, so a reader could see the script and not know what it meant; and the design of record had already specified the fix without anyone building it: the type table's row for 原文 quoted inside prose says *"same face, 0.95 em, `--ink-soft` — a quotation inside an argument should read as a quotation"*, and `--zj-quoted-size` had been declared in `tongjian/zj.css` since the prototype and **used by nothing**.

**Second: the rule held only where an author had remembered it.** Twenty-one runs of 通鑑's own words were printed in 背景, 思考 and the 字词 lead as if the book had written them — 「臣光曰」, 「以人事知之」, 「城不浸者三版」, 「三家分智氏之田」, 「智伯之臣」, 「才德兼亡」, 「保障」, 「繭絲」 among them. They were found by inverting the existing check rather than by reading: `corpus.js` already held every passage the book may quote, so *"is this 「…」 run in the corpus?"* is a question a machine can ask of the prose, and the twenty-one fell out of it on the first run.

**What the gates could see, and why the answer was nothing.** The script check reads one direction only — *every marked run must BE a quotation* — and its own header says what that leaves: *"a quotation the book does not mark (no 「」, not a `quote` field, no lang attribute), which no mechanical rule can tell from the book's own sentence."* That sentence was written when the check was written, and it was accurate; nothing acted on it. So 21 reader-visible instances of a class the repository had already named sat in a **published** book, through four browser gates and 209 unit tests, and the gate that could see them was the one that had been told it could not.

**Third, and the one that is not about attributes at all.** Chapter 2's 背景 said of the 前376 entry — the one that ends 晉 — 「不在本书的取材范围之内，所以这里**只转述，不引原文**」. Figure 2.1, four lines below, quotes it with its citation. The page contradicted itself inside one screen, and the false half was the sentence about provenance. It now reads 这一条不列入原文，图 2.1 里引它的原句为证. **The owner found that by reading the book, not by asking a question about it**, which is the reader-proxy finding of 2026-09-19 one step further on: the check was asking whether the quotation was real and never whether the claim about it was true.

| Symptom as the owner saw it | Root cause | Now checked by |
|---|---|---|
| *"Just make it perfectly clear what came from the book what didn't it, everywhere."* A 通鑑 sentence in 背景 that a reader could not tell from the book's own sentence. | The mark (`lang="zh-Hant"`) was in the markup and **rendered as nothing**. The design of record specified the treatment and the token for it existed and was spent nowhere. | `tongjian/zj.css`: `[lang="zh-Hant"]` inside the book's prose is set at `--zj-quoted-size` in `--ink-soft`, excluding `.zj-src`, `.zj-card` and `tb-figure`. Plus the key on `tongjian/index.html` — 繁体字都是《资治通鉴》自己的话，简体字都是本书自己的话 — which `test/provenance.test.js` requires to exist and to name both scripts. **Not a gate's claim that a reader notices**: `npm run shot` is clean on the 24 tongjian loads and the before/after frames were looked at, and `npm run legible` defers the three figures, so **nothing measures that the mark is perceivable**. |
| 21 runs of 通鑑's words printed as the book's own sentences, in a published book. | The rule was held one-way (marked ⇒ real) and applied by hand; no check asked the converse (real ⇒ marked), and `test/lexicon.test.js`'s own header names that hole. | `test/provenance.test.js`: every 「…」 run in a chapter page's prose that is verbatim 通鑑 (a corpus substring, or one of the two lines the corpus does not carry) must sit inside `lang="zh-Hant"`. Bound: a **one-character** quotation is out (「命」「恒」「版」 are the book naming a word, not quoting), and a re-punctuated quotation stops being a corpus substring and is invisible to it. Proved red on the real file; the entry's proof is in [gate-proofs.md](gate-proofs.md). |
| 通鑑 printed by a figure — `quote`, and one step's `aside` carrying 司馬光's own 臣光曰 — where no page-side scan can see it. | A figure builds its quotation in JavaScript from its own data, so `lang` on it was a thing each module happened to do (none of the three did) and there was no declaration a checker could read. | Each `src/figures/zj-*.js` exports `QUOTED_FIELDS`, checked in both directions, and sets `lang: 'zh-Hant'` where it builds the element. Bound: the figure predicate is identity with a **whole 句**, because a figure's fields are short labels as well as sentences — `courtNote: '天子之命'` is a label that happens to occur inside a 句 of the 禮論. A figure field holding a **fragment** of a 句 is therefore not covered. |
| Chapter 2's 背景: 「所以这里只转述，不引原文」, four lines above a figure that quotes the entry. | The sentence was written when the 年表 did not yet quote the 前376 line, and was not revisited when it did. Nothing reads a page's claims about itself. | **Nothing.** The sentence is fixed; no gate compares what a chapter says about its own selections with what the chapter prints. This is the entry's open half and it is named rather than implied. |

**The lesson underneath.** Two of these three are one lesson, and it is `sitting`'s: **a check that reads a fact the page already carries proves the fact is recorded, never that it is shown.** `lang` was recorded, gated, and invisible; the fix was to spend a token that had been declared for exactly this and never used. The third is a different one: a page can hold a true quotation and a false sentence about it at the same time, and no corpus can tell you that, because the corpus is the thing the sentence is wrong about.

## 2026-09-17 — a gate was failing because it was slow, which is the clearest case for the rule

The owner's directive of 2026-09-15: *anything slow on the critical path is a defect to identify and fix, not a cost to schedule around.* This is the cleanest evidence the repository has for it.

`npm run devices` was **red** on the frozen baseline, and its two failures were not product defects. Both were `page.screenshot: Timeout 45000ms exceeded` on the second book's contents page. The gate's own message says that shape is the browser process failing to answer rather than a slow render. **It was failing because it was slow.**

After the round's cuts the same gate runs 1661.5 s → 379.1 s and is **62 of 62 clean**. Nothing about the page changed.

| gate | before | after |
|---|---|---|
| devices | 1661.5 s | 379.1 s |
| drive | 542.9 s | 322.8 s |
| shot | 145.4 s | 95.5 s |
| subpath | 115.6 s | 106.6 s |
| narrow | 95.3 s | 79.7 s |
| sweep3d | 36.8 s | 34.2 s |
| sitting | 20.6 s | 19.8 s |
| flow | 3.7 s | 3.4 s |
| **chain** | **4076 s** | **about 2480 s** |

**What made the difference was not what anyone predicted.** Converting the gate's fixed sleeps to polls bought 6 %. Pinning the figures' clocks bought 6.6×: a chapter page mounts nine animated figures, and every simulated tap waits for its element to hold still across animation frames, so some 1,400 glossary presses were queueing behind a page doing continuous work.

The residual, stated because it is a real cut: animation-induced layout shift is now watched at one device shape rather than nine, with one unpinned load per run kept on the smallest phone as a token, and the run prints which load that was.

**And the thing the round was sent to fix is no longer the biggest thing wrong.** `npm run legible`, added during this same round, is now 58 % of the chain on its own.

## 2026-09-17 — two figures started running when something pressed Play, with the clock pinned, and every gate that photographs them was green

**The symptom, in the words it was reported in.** Not a reader's words: this one arrived as a timing anomaly in a gate. *"Each of its six figure-theme runs takes about 185 seconds against under 10 for the other 66, and those times are deterministic, reproducing within half a second across two full runs hours apart on a frozen tree."* The three figures named were `polymer`, `secretion` and `gradient-battery` — the three with a Run or Play control. The hypothesis attached to it was the right one: `tools/legible.js` loads the lab at `?t=0` and then presses every visible button, including Play, and every Playwright action afterwards waits for its element to hold still across animation frames.

**How it was found.** By probe, before anything was changed. `lab/?kind=<k>&theme=light&eager=1&t=0`, one real click on the figure's own Play or Run control, `describe()` read twice a second apart, through `tools/drive.js`'s own opener and helpers rather than a fresh harness. The numbers, with the clock pinned at `t=0`:

| kind | press | `describe()` after 1.0 s |
|---|---|---|
| `secretion` | Play the journey | `t: 0 → 0.983` |
| `gradient-battery` | Run | `cellMinutes: 0 → 1.02`, `t: 0 → 1.017`, and the whole sodium/glucose/potential model with them |
| `polymer` | Play | **nothing changed** — `playing` stayed `false`, `t` stayed `0` |

So the invariant was broken in two of the three suspects and not in the third, and the 185 s is therefore **not** one cause across all three. `polymer` was already guarded and is still slow; that half of the report was handed back rather than chased here.

**The root cause, down to the line.**

- `src/figures/secretion.js`, `setPlaying(v)`: it guarded `reduced` and nothing else. `playing = Boolean(v)` was reached with the clock pinned, `schedule()` started the loop, and `frame()` — whose own guard is `if (destroyed || !playing || !visible) return;` — added real elapsed time to `t` on every animation frame.
- `src/figures/gradient-battery.js`, `setRunning(on)`: the module read **nothing at all** of `ctx.pinnedTime`; the string did not appear in the file. `running = on` started `kick()`, and `frame()` ran `advance(dt * CELL_SECONDS_PER_WATCHED)` at a simulated minute per watched second.

Both files carried a comment asserting the property they did not have. `gradient-battery`'s `setTime` was headed *"Nothing advances on its own: the cell moves only while Run is on, so pinning the clock redraws"*, and its module header said the same. Both sentences were true only until something pressed Run — which is the shape `gate-proofs.md` opens with, a claim and its subject wrong together and indistinguishable from a claim that is right.

**What the gates could see, and why the answer was nothing.**

- `npm run shot` is the gate that *depends* on this invariant — it photographs every page at `?t=0` and fails on overflow, console errors and figures in `error` — and it **presses nothing**. Every frame it has ever taken of these two figures was still because nothing had started them, not because they could not start.
- `npm run drive` presses every control these figures have, and opens the lab **unpinned**. Several of its recipes assert that a clock *did* move (`polymer play-and-pause` demands `t > 1.5`). Its contract is the opposite one, so it could not have noticed.
- `npm run narrow`, `npm run sweep3d` and `npm run devices` mount figures but do not press a figure's play control; `devices` states in its own header that it presses no figure control at all.
- No unit test covers it: the property is about a module's behaviour under a `ctx` field, and nothing mounted a figure and pressed it.

So the invariant that makes a screenshot reproducible was held by five figures' source code and by no check, and two figures had drifted out of it — one of them (`gradient-battery`) written without ever having been in it.

**Now checked by.**

| Symptom | Root cause | Now checked by |
|---|---|---|
| a figure runs its clock after a press although the page pinned it, so its frame in `out/shots/` depends on what was pressed before it | `setPlaying`/`setRunning` reached the animation loop with no `ctx.pinnedTime` guard | **`npm run pinned` (`tools/pinned.js`), added by this entry** — every kind in the registry, every enabled button pressed once on a freshly mounted pinned figure, failing any figure still advancing after two untouched windows |
| a figure that drifts with the clock pinned and *nothing* pressed | — not observed; checked because it is what `npm run shot` rests on most directly | the same gate's mount check, which is not quarantined for anyone |
| a figure written from now on that never had the guard | `gradient-battery` shipped with no mention of `ctx.pinnedTime` | the same gate needs **no recipe** — a new kind is covered the day it appears in the registry |

The check covers the **class**, not the two instances: it is the whole registry, and it found six more figures breaking the same invariant that this round was not scoped to change — `pond`, `homeostasis`, `pasteur`, `soup`, `waterprops` and `pump`. Those are not skipped. Each is pressed and measured like the rest, listed by name in `tools/pinned.js`'s `KNOWN` and printed by every run, and **the gate fails if one of them stops moving**, so the list cannot rot into a silent exception: whoever fixes one deletes its entry in the same commit. Proved red in [gate-proofs.md](gate-proofs.md).

**Two things the gate's own construction had to be corrected for, and both are the file's recurring shape.**

1. **Its first version reported `secretion` as clean with the defect deliberately put back.** It pressed a kind's buttons in order on one page, so by the time it reached Play the earlier presses had walked the journey to its end; Play started a route that was already over and stopped within a frame. A fixture that ends early, measuring a figure with nothing left to do, reporting green over the exact defect it was written for. Every control is now pressed on a figure that has just mounted.
2. **A single measurement window cannot tell a clock from a transition.** With one window, seven more figures looked broken — `cell3d`, `cilium`, `plantcell3d` (labels easing in), `water3d` (a held molecule easing out), `prokaryote` (a lysis animation), `atp3d` (a camera easing back) and `surface-volume` (a diffusion clock reaching its end). They all stop; a clock never does. The gate gives a figure that moved a second window and fails only what is still moving in it, and prints the settling ones so the distinction is visible rather than assumed.

**The lesson underneath.** *A gate that never exercises the input path cannot see anything living in it.* `npm run shot` is the gate this invariant exists for, it loads the pinned page, and it presses nothing — so for every figure it photographs, "still" and "not yet started" were the same picture, and it reported the second as the first with full confidence. The same sentence covers `AGENTS.md`'s existing rule about harnesses that set state directly. The pair to hold together: the gate that *depends* on a property is very often the one that cannot check it, because checking it means doing the thing the gate was built not to do.

## 2026-09-17 — a sort choice ran off the smallest phone, and every other gate was looking at 390 px

*Appended at the end rather than at the top, the way the entry above it was, because several workers were writing into this file at once on 2026-09-17 and an append cannot collide. Written by a different worker from the one that fixed it: the fix landed while this file was open elsewhere, so the numbers below come from that worker's handoff, and what this worker verified for itself is stated where it differs.*

**The symptom.** No reader reported this one. `npm run devices` found it at `phone-small` — Playwright's iPhone SE, 320 px — the day chapter 5 got its sort figure, and the check that fires is that gate's page-level one (`tools/devices.js`): `the page scrolls sideways: <scrollWidth> px of content in a <clientWidth> px viewport`. What a reader would have had is the whole chapter sliding left and right under a thumb, with a strip of blank paper down the right at every scroll position.

**How it was found.** By the gate, on its first run over a chapter that had never been loaded at 320 px before. Measured by the worker that fixed it: the segment reading **Exergonic, and waiting on an enzyme** came out **298.8 px** inside a **266.8 px** column, putting its right edge at **325.4 px** in a 320 px viewport — 5 px of sideways scroll on the document.

**The root cause, down to the line.** `tb-sort .tb-sort__item .choose button` in `src/styles/components.css` carried `white-space: nowrap`. That button is a flex item of `.choose` (`display: flex; flex-wrap: wrap; max-width: 100%`), and **a flex item's `min-width` computes to `auto`, whose used value is the item's min-content width**. With `nowrap` a run of text has no soft-wrap opportunity at all, so its min-content width is *the whole sentence* — the floor under the segment was the full 298.8 px, and no amount of `max-width: 100%` on the box above it can shrink an item below its own min-width floor. The two shorter choices in the same group shrank; this one could not, so the flex line overflowed its column and the page with it.

Fixed in the same rule with `white-space: normal; min-width: 0`: `normal` gives the text wrap opportunities so its min-content width becomes its longest word, and `min-width: 0` removes the auto floor outright. A segment now wraps only where it did not fit, and where it fits its box is unchanged.

**What the gates could see, and why the answer was nothing until chapter 5 existed.** Two things had to be true in the same load, and until this chapter landed they never were.

- **The label has to be long enough.** The longest sort label in each chapter, counted on this tree: chapter 1 *"It depends"* (10 characters), chapter 2 *"Keeps out of water"* (18), chapter 3 *"Tight junction"* (14), chapter 4 *"Facilitated diffusion"* (21), chapter 5 *"Exergonic, and waiting on an enzyme"* (**35**). Only the last is long enough to overflow, and it is worse than its character count suggests because the segment is uppercased with 0.06em tracking.
- **The viewport has to be 320 px.** Every other page gate in the chain loads at 390 px or wider — `npm run shot` at 390, 1024 and 1440, `npm run subpath` at 390 and 1440, `npm run narrow` at a 390 px stage, `npm run flow` at 1440 and 390. **The only 320 px eye in the repository is `npm run devices`'s `phone-small`.** The shared stylesheet gives a biology chapter's text column 84% of the viewport on a phone, which `npm run devices` prints on every chapter line (verified by this worker on `biology/ch02`: `reading column 84% of 320 px`). That is 268.8 px at 320 and 339 px at 390 — so a 298.8 px segment fits at 390 and cannot fit at 320, and the four gates that load at 390 were all looking straight at a page that was fine.

**Now checked by.**

| Symptom | Root cause | Now checked by |
|---|---|---|
| a sort choice runs off the right edge and puts sideways scroll on a 320 px phone | `white-space: nowrap` on a flex item, whose `min-width: auto` floor is then the whole sentence | `npm run devices`'s sideways-scroll check at `phone-small` (320 px), which is what found it. It covers the **class** *anything that overflows a chapter page at 320 px*, not this one label |
| the same chapter shipping a longer label later, or a new chapter shipping one | the defect needs the longest label **and** the narrowest phone in one load | the same check, and it needs no list: `tools/devices.js` derives its matrix from the tree, so a chapter is loaded at `phone-small` the day its page exists |
| the same `nowrap`-on-a-flex-item trap somewhere that does **not** overflow a 320 px page | the same two lines | **nothing.** The check is a page-level overflow measure; no rule in this repository says anything about `white-space: nowrap` or `min-width: auto`, so a second instance that happens to fit is unwatched. Stated here rather than implied, because this row is the part of the class the new check does not reach |

**The lesson underneath.** *The whole repository has one 320 px eye, and it is one entry in one array.* Four of the six page gates agree on 390 px, so every horizontal defect that only appears below 390 depends on `phone-small` staying in `tools/devices.js`'s device list and on the derivation keeping the narrowest device of each band — which that file already argues for, in those words, because every horizontal measure is worst at the narrowest width. This is the first defect that argument actually caught. The companion half is that a defect can need two independent things at once — a long enough string and a narrow enough screen — so a gate that has had one of them for months proves nothing about the day it first gets both.

## 2026-09-17 — a figure's toolbar took ten rows on a phone, two presses from the only state any gate measured

*Appended at the end, like the two entries above it, because several workers were writing into this file on 2026-09-17. Written by the worker that built the gate, not by the one that fixed the figure: the numbers describing the figure's own state come from that worker's handoff and its `out/lab/ek-crowd-*.png` frames, and everything about what the gates could and could not see was measured by this worker on the tree of 2026-09-17.*

**The symptom, in the words of the worker who saw it.** At 390 px `enzyme-kinetics` reached a state where its toolbar took **ten rows** — 320 px of a 456 px stage, seven tenths of the figure — the readout was drawn over the graph, the axis caption overran, and the lane, which is what the figure is about, was a 40 px sliver. No reader reported it; the figure had not shipped. What a reader would have had is a control panel with a strip of drawing above it, and two pieces of type on top of each other.

**How it was found.** By a worker looking at a rendered frame while building the figure, which is the part worth recording. It was reachable by pressing two buttons — **Conditions**, then **Cases**, with an inhibitor chosen — and every one of the four gates that had ever loaded that figure was green on it.

**The root cause.** Nineteen controls, a 301.6 px bar and nothing bounding how many rows they could take. Two independent disclosures — Conditions holding the temperature and pH sliders, Cases holding six named enzymes — could both be open at a width where either alone fills the bar, and the bench does what it is told: `applyLayout` sets `--tb-pad` to the toolbar's own measured height, so a toolbar that grows eats the grid from below until the panes reach `paneBox`'s 40x30 floor and their contents start overlapping. Nothing in `src/figures/lib/bench.js` says how tall a toolbar may be, and nothing should — what a figure gives up is the figure's decision. What was missing was anybody checking the answer.

**What the gates could see, and why the answer was nothing.** This is the part that matters, because the figure was not unwatched. It was watched six ways.

- **`npm run narrow` is the only gate in the repository that mounts a figure at a 390 px stage**, and it measured the **opening state**: ready, a frame that is not blank, flat or near-black, at least one control present and pressable. It did press one control — the first enabled button not already `aria-pressed` — and asked only that the figure still reported `ready` afterwards. It took no measurement after that press at all. Every defect above lives behind a press, so the gate written for the narrow layouts was looking at the one state in which they are never crowded.
- **`npm run drive`** presses every control a figure has, and runs one viewport, 1000x640. At desktop width both disclosures open at once **by design** and the toolbar fits, so the state it drives is the state that works.
- **`npm run legible`** presses every visible enabled button once, at 1000x640: the wrong width, and the wrong question — it measures the contrast of a glyph against the pixels under it, and a label drawn over another label can have perfect contrast. Its own header already says the narrow compositions are `npm run narrow`'s.
- **`npm run shot`** loads chapter pages at 390 px and presses nothing. Its overflow check is on the **document**; a figure crowding inside its own stage moves no pixel outside it, because `.tb-figure__stage` is `overflow: hidden`.
- **`npm run devices`** presses no figure control at all, and says so in its own header.
- **`npm run pinned`** presses every enabled button on a freshly mounted figure — the closest thing in the chain to this defect's shape — and asks only whether the clock moved, at the lab's own width.
- **No unit test**, because the property is the geometry of a layout in a browser at one width, and nothing mounts a figure outside the page gates.

So the chain had exactly one 390 px eye on a figure's own stage, and that eye was shut after the first frame. `docs/policies/local-rules.md` already names the shape from the other side — a fixture that ends early — and this is the same thing in time rather than in space: a check whose bound is the opening state, reporting confidently on everything after it.

**Now checked by.**

| Symptom | Root cause | Now checked by |
|---|---|---|
| a figure's toolbar swallows the stage at 390 px in a state a reader can reach | nothing bounded the toolbar's height, and the state needed two presses | **`npm run narrow`, extended 2026-09-17**: it presses every visible enabled `aria-pressed` button in the figure's `.fig-toolbar`, once each in DOM order, again if the press hid controls, re-reading the toolbar each round, and measures the opening state and every state a press reaches. The toolbar may not exceed **55%** of the stage's height — the worst share any figure in the book legitimately reaches is `coupling-bench` at 51%, and the defect was 58% with only the mutual exclusion removed and 70% as first seen |
| a pane's drawing lands on another pane's drawing, or on a control | the panes shrank to `paneBox`'s 40x30 floor under a toolbar that kept growing | the same gate, in the same states: the union of each pane's rendered SVG children against every other pane's and against every visible control, with both edges of the intersection over 4 px so a halo'd label is not a collision |
| the same crowding in any **other** figure, now or later | — not one instance but the class | the same check, and it needs no list: it runs over `KINDS`, so a figure is covered the day it is registered. **It found one on its first full run**: `atp3d`'s `ladder` pane is drawn over its `ledger` pane, 245x17 px, in both themes, one press from the opening state — the rungs and the ledger's rows written on top of each other, and a verdict sentence across both |
| the same crowding behind a disclosure that is an **action button** rather than a toggle | the candidate rule is `aria-pressed`, and an action carries none | **nothing.** Demonstrated rather than stated: the same defect, with the two disclosures turned into `b.action` buttons, leaves the gate **green, exit 0** (`gate-proofs.md`, arm B). Stated here rather than implied, because this row is the part of the class the new check does not reach |
| a drawing that runs off the stage instead of onto something | the stage is `overflow: hidden`, so it is clipped and collides with nothing | **nothing.** Also demonstrated: `enzyme-kinetics` with its x-axis captions drawn 300 px right loses its entire x scale and the gate is **green, exit 0** (`gate-proofs.md`, arm C) |

Proved red on the real defect, and both blind spots proved green beside it, in [gate-proofs.md](gate-proofs.md).

**The cost of the fix, recorded because it is a real one.** At a phone's width the two panels are now mutually exclusive: opening Conditions closes Cases and the other way about. **So on a phone a reader can no longer see the temperature and pH sliders and the six named cases at once.** That is a loss, not a tidy-up. What pays for it is that the readout prints the temperature, the pH and the loaded case in every state, so nothing a closed panel holds is unknown, and either panel is one press away; at desktop width both are open together and nothing changed. Six rows instead of ten was bought with that, with short labels on the four inhibitors, and with the concentration slider moved into the conditions group. The figure's own header carries the arithmetic.

**The lesson underneath.** *A gate that measures only the opening state is measuring the one state the reader is in for a second.* It is the sibling of this file's existing lesson about a gate that never exercises the input path: there the gate could not see a defect because it pressed nothing, here it pressed once and then stopped looking. Both are bounds nobody had written down, and both looked exactly like coverage from a green run. The general form: **a check has a bound in time as well as in space, and the state a figure opens in is the least interesting one it has.**

## 2026-09-17 — twenty-three unreadable labels, and the rule that could not see most of them

`npm run legible` reported **one** problem. The honest number was twenty-three, and twenty-two of them were invisible to the rule it was using, not to the eye.

The old rule needed a colour it could name: the commonest 16-level bucket under a glyph had to cover at least 40 % of that glyph's core pixels, or the run was skipped as "varied ground". A radial gradient never offers one, so **`bondlab` skipped 44 of 48 glyph runs in the light theme and 48 of 48 in the dark**, and reported one finding for a figure in which every element symbol was below the bar.

| Symptom | Root cause | Now checked by |
|---|---|---|
| Element symbols unreadable on their own atoms, and the gate green | `sphere()` lays a 62 % white specular over a coloured disc and writes the symbol in `paper`, so the symbol sits on white. The gate could not read a ground that was a gradient. | The rule is an **order statistic**: a glyph's ratio is the one at least 95 % of its core pixels beat, measured against the actual pixel beneath it, rounded up so a single pixel can never fail a label. The 40 % share is demoted from a rule to a printed counter, so the class stays visible instead of hiding in a skip count. |

**Anti-aliasing cannot produce a false failure**, which is what makes the new rule safe: a blended pixel's ratio lies between the two surfaces it blends, so it can never be worse than the worse of them. Every failure stands on a real surface. The rounding was chosen by measurement, not taste: with `floor`, one pixel of fifteen failed a label whose other pixels reached 11.70:1.

**The fix for the gradient class was one change reaching eight findings**, and the obvious version was proved impossible first. Shrinking or softening the highlight cannot work — the symbol reaches about 0.7 of the disc's radius, and the arithmetic says the wash may be at most about 2 % white before `paper` on nitrogen's fill drops under 4.5:1. The highlight had to **stop** rather than soften: it is now masked off the middle of the disc and reads as an upper-left rim. `bondlab`'s "varied ground" count went from 44 and 48 to **zero**.

The other fourteen straddled two grounds, which the 40 % share let through by naming the lighter one — a label lying across a rule, a chart line, or a field of water dots. Those took the paper-ground halo two figures already used, or a move, because **a label that crosses a rule is a composition problem before it is a contrast problem**.

### Two instrument notes worth keeping

- **Magnifying a figure by transforming its live stage corrupts it.** Figures that re-measure their own panes react to the transform; one strip re-rendered into an 8,288-unit viewBox. Clone the stage into an inert overlay instead.
- **`npm run perf` loads chapter 1 only.** With five chapters and 56 figures it can no longer answer "what did this cost", and the frame cost of the mask above is therefore unmeasured and recorded as such.

## 2026-09-17 — a press on the scale's lens was dropped while it was still gliding, and it looked like a flaky gate

*Appended at the end, like the entries above it. Written by the worker that closed the `<tb-sitting>` handshake hole, from the handoff of the worker that found and fixed the defect; the numbers describing the figure come from that worker's probe, and the state of `src/figures/scale.js` and `tools/drive.js` described here was read off the tree of 2026-09-17.*

**The symptom, as it was seen.** A gate step that would not hold still: `DRIVE_KINDS=scale npm run drive`'s `drag-the-lens-left` failed **17 runs of 20** with nothing changed between them, and passed the other three. What a reader has — the part nobody was looking for, and the reason this is an entry rather than a note — is that **pressing the lens while it is still gliding does nothing at all**. The grab is dropped, the lens carries on coasting, and a second press works. The lens glides after every jump, so that window is open after every single use of the figure.

**How it was found.** By chasing a flaky gate step, and that disguise is the part worth recording. Seventeen red runs in twenty read as timing noise in Playwright, in a figure nobody had reported anything about; a step that red gets retried, not read.

**The root cause, down to the line.** `src/figures/scale.js`'s `onDown` called `glide.finish()` **before** asking what had been pressed. `finish()` runs the tween's last update, which calls `setU`, which repaints — and the wide layout's repaint rebuilds the lens's interior with `inner.replaceChildren()`. So a press that landed on the ruler line, a tick or a label *inside* the lens was holding a node that finishing the glide had just thrown away. `lensG.contains(e.target)` then answers **no**, correctly, about a detached node; `down()` returned `null`; the handler returned without `preventDefault()`; the press was gone. The defect was the order of two statements, and the fix is the hit read before the glide is finished.

Measured on both arms, one press each way (`out/scaleprobe/probe2.mjs`):

| when the press arrives | `stillInDocument` | `figureTookIt` |
|---|---|---|
| mid-glide, no settle | `false` | `false` |
| after a 400 ms settle | `true` | `true` |

**What the gates could see, and why the answer was nothing.** The figure was not unwatched, and one gate was even going red at it.

- **`npm run drive` is the only gate that drags this figure**, and it *did* fail — 17 times in 20. But it asserted the **outcome**, `lensMetres` after the drag, and not the figure's own verdict on the press. An outcome a later press also produces cannot tell a dropped press from a slow one, so the red carried no diagnosis and read as flakiness.
- **The step inherited its glide from the step before it** rather than starting one, so how much of the 280 ms window was left when the press arrived depended on how many round trips the previous assertions had spent. That is what made the failure a rate instead of a fact: with the defect in place the step was red only **5 of 10** while it inherited its window, and **10 of 10** once it starts its own.
- **No other gate presses a figure control while anything is animating.** `npm run narrow` presses on an opening frame; `npm run pinned` presses under a pinned clock, where nothing is gliding; `npm run legible` measures pixels rather than pressing for an effect; `npm run shot`, `npm run devices` and `npm run subpath` press no figure control at all.
- **No unit test**, and there could not be one of the usual kind: the property is "a `pointerdown` whose target was detached by a repaint two statements earlier", which needs a real event, a real SVG and a tween actually running.

**Now checked by.**

| Symptom | Root cause | Now checked by |
|---|---|---|
| a press on the lens during its glide is dropped | the hit test ran after a repaint that detached the press's target | **`npm run drive`'s `scale` recipe, hardened 2026-09-17**: the step **starts its own 280 ms glide** immediately before the press, so it owns the window instead of inheriting whatever the previous step left, and it asserts `window.__scaleTookPress === true` — the figure's own `defaultPrevented` on the pointerdown it has just handled — **before** it looks at the outcome. 20 of 20 green with the fix; 10 of 10 red with the defect reintroduced, against 5 of 10 for the same defect while the step inherited its window |
| the same dropped press in any **other** figure | a `pointerdown` handler that reads `e.target` after something has repainted | **nothing beyond `scale`.** The bound the fixing worker gave, written down because it is the half the new check does not reach: `scale.js` is the only one of the 44 figures that both listens for `pointerdown` and reads `e.target`, so the class is confined *today* — but **no other drag recipe in `tools/drive.js` asserts the figure's own verdict on a press**, so a figure that grows a target-based hit test tomorrow is uncovered from the day it is written |

**The lesson underneath.** *A flaky gate step is a defect report wearing the one disguise that makes people retry it instead of reading it.* Underneath that sit two things this file already says from other directions. An assertion on the **outcome** cannot see a dropped **input**, because the outcome is reachable without the input path the defect lives in — the same shape as a harness that assigns state directly and is then blind to the path it skipped. And a step whose timing window is **inherited from its neighbour** has no bound anybody can state, so its failure rate is a property of the step above it: 5 of 10 and 10 of 10 are the same defect, measured through two different windows.

## 2026-09-22 — a reader whose stored theme differs from their system saw the whole page in the other theme first

**The symptom.** No reader reported this one. It came out of the owner's question about `npm run shot`'s frames — that a reader of `AGENTS.md` *"would currently infer that they are"* reproducible — when the dark frames of the three contents pages turned out to differ from run to run inside their titles. What a reader sees was then recorded frame by frame, by a probe that sets the stored theme through the real toggle and records every frame the compositor presents (CDP `Page.startScreencast`), with the system preferring light, dark stored, no query string, at 1440×900, six loads per page, on a frozen copy of the 2026-09-17 tree: **the whole page drawn in the other theme for one to three frames, and then the titles fading to their colour** — a 240 ms transition (`--dur`), of which about 150 ms was visible in the recording: in the 7 loads that faded, the heading was more than 8/255 off its colour until 137 to 157 ms after the page's first frame. It happened on 6 of 6 loads of Today, 5 of 6 of the biology contents page, 4 of 6 of chapter 1, 2 of 6 of the library and 1 of 6 of the tongjian contents page. A reader whose stored choice matches their system sees nothing, which is most readers on most days and every gate on every run.

**How it was found.** By measuring why `npm run shot` does not reproduce itself. Three full runs of the frozen tree left 33 of 84 frames differing, and 9 of the 33 were the dark contents pages at all three widths. Two explanations were already on the record and both were wrong: that the library's difference was rounding bounded at 1/255 (its frames differed by up to 6/255 on the phone and 27/255 on the desktop, and by 90/255 on this round's tree with the block taken out), and that it was the sticky header's blur (the differing box is the heading, at y 975 to 2010 on the phone frame). Timing the page against its own paint showed the titles mid-transition when the shutter opened, and the reader probe then showed the same change happening on screen.

**The root cause.** `src/shell.js` applied `?theme=` or the stored `tb-theme` while its module evaluated (`5e9c981`, lines 212–214; line 214 is the stored-choice branch, the one a reader without a query string takes). A module script runs only after the whole document has been parsed, and by then the browser has styled the markup once — in the theme a page with no `data-theme` has, which is the one the system prefers — and can have painted it. Setting the attribute then switched the whole page, and `transition: color var(--dur) var(--ease)` on `.book h2` in `index.html` and on `.chapters a .title` in `biology/index.html` and `tongjian/index.html` (lines 62, 34 and 81 on `5e9c981`) animated the titles across. The wrong assumption was that a theme set when the shell loads is set before anything is drawn.

**What the gates could see, and why the answer was nothing.** Every page gate passes `?theme=` and photographs after the handshake, when the switch is long over; the fade was only ever seen as `npm run shot` disagreeing with itself, which nothing compares, and which had been written down as rounding. No gate records what is on screen *during* a load, and none sets a stored theme against an emulated system preference.

| Symptom | Root cause | Now checked by |
|---|---|---|
| the whole page in the other theme for one to three frames | the shell applied the reader's theme after the page had been styled once | `THEME_BLOCK` in `src/theme-early.js`, a classic script every page that loads the shell carries in its `<head>` before its first stylesheet. **`npm run theme`**, a new step of `npm test`: on every such page, found by following each page's scripts to the shell, `data-theme` must be the theme the page is drawn in at every moment from `<body>` being inserted to the handshake, and the value the shell leaves, in seven situations including storage that throws. **`test/theme-early.test.js`** in `npm run unit`: every such page carries the block verbatim, once, before its first stylesheet, and the failure prints the block to paste. Both proved red in [gate-proofs.md](gate-proofs.md) |
| the titles fading across, and `npm run shot` photographing them mid-fade | the colour transitions the late switch started | the settle wait in `npm run shot`: the shutter waits for every running transition and animation, and a page still moving after 120 frames fails naming what moves. Proved red in [gate-proofs.md](gate-proofs.md), with the measurement that the frames are still not byte-reproducible and why |

**The lesson underneath.** *Noise in a gate's own output can be a defect a reader sees.* The dark frames differed on every other run for days and were filed as rounding, because nothing compared two runs and the one number quoted (1/255) came from the library's phone frame. What decided it was measuring the difference rather than naming it: its size, its box, and whether it moved with the load on the machine.

## 2026-09-22 — `soup` draws 475 water molecules or 474 on a phone, depending on when the fonts arrived

**The symptom.** No reader reported it, and no reader could tell by looking: chapter 2's opening figure, `soup`, is a different picture on a phone depending on how fast the webfonts come in. A probe loaded `biology/ch02` on `npm run shot`'s own path (`openPage`, `?eager=1&t=0`, 390×844, light) and changed one thing, when the font files arrive. With the fonts in hand before the figure mounted, `describe().counts.water` was **475 in 3 of 3 loads**; with every font response held until `soup` reported ready and then released, it was **474 in 3 of 3**. That was on the 2026-09-17 freeze, whose `src/figures/soup.js` is byte-identical to `5e9c981`'s (carriage returns aside). It breaks the figure invariant in `AGENTS.md`: a figure's frame may not depend on when a webfont arrived.

**How it was found.** By the round that measured why `npm run shot` does not reproduce itself (the entry above), looking for every way a frame could depend on the load rather than the tree. The probe held the font responses through Playwright's routing, on top of the gates' own request cache, and released them when the page's own `window.__textbook.figures` said the figure was ready — no timer.

**The root cause.** On a narrow stage the figure gives its key, the readout, a band of paper above the picture, and sizes that band from the key's height: `src/figures/soup.js:734`, `const wantTop = narrow ? Math.round(readout.offsetHeight) + 10 : 0;`. The key is set in a webfont, so its height changes when that face arrives. The `ResizeObserver` watches the key and re-runs the layout when it does, which recomputes the band — but `:750` rebuilds the world only when the field's height has changed by more than 2% (`Math.abs(world.Hn - fieldH) / world.Hn > 0.02`), and the change the font makes is smaller. So a world built before the fonts keeps its 474 molecules after they arrive, and one built after them has 475. The `document.fonts.ready` handler at `:1614` re-measures the key's wash and redraws, but does not rebuild the world. The wrong assumption was that a change in the key's height after mount is either large enough to rebuild for or small enough not to matter to the picture.

**What the gates could see, and why the answer was nothing.** Every gate loads the fonts over the network only on a run's first request for each URL and replays them from memory after that (`tools/lib/net-cache.js`), so on every load but a run's first the fonts arrive before any figure mounts, and the gates see the 475 world every time. Only a run whose first load is chapter 2 at phone width — a trimmed run — can meet the other one, and then it looks like an unreproducible frame. No gate holds a font response, and `npm run pinned` pins a figure's clock, not its fonts.

**Now checked by: no gate yet.** The fix is the textbook session's, queued for its next worker on chapter 2's figures, in the shape `scale.js` already uses: rebuild on `document.fonts.ready` (`src/figures/scale.js:953` clears the widths it measured and repaints once the fonts are in), so the world is the one the final key height gives, whenever the fonts arrive. A gate for the class would load a figure twice, once with the fonts held and once without, and require the same `describe()`; nothing does that today.

## 2026-09-23 — at 90 °C the bilayer tank said "Micelles", and a 1024 px page's tank said "Bilayer"

**The symptom.** GitHub's run of `npm run drive` failed `bilayer hot-enough-and-nothing-assembles` with *"micelle at t=8.033, 0.641 buried"*, a step this machine passed. The figure's claim, and §4.2's, is that hot enough, nothing assembles; a reader at 90 °C could see the arrangement row say "Micelles", or "Bilayer". Reported with it: once the ends had sealed after Curl, the overlay still said *"the wrap is off: the sheet has two open ends"*, and the side sentence showed an earlier heal time instead of what Curl did.

**How it was found.** The CI failure, and then a measurement rather than a rerun. The figure's own model code, exported into Node, was run for 30 s of clock at every temperature the slider offers (0-90 °C, three seeds) and at the tank shape of every layout a gate or a reader uses (10.4, 12.9, 13.8, 13.9 and 14.4 nm tall), with the verdict read every 0.05 s. The shapes came from a probe of the rendered pane at each layout.

**The root cause.** Two, and a third behind the words.

- The verdict was one sweep's classification of a thermal walk. At 90 °C in the lab's 13.8 nm tank one sweep was a sheet or micelles in 8.8-12.8% of reads over 23 seeds: the tank is crowded enough that jostling alone buries 0.37-0.75 of the tail surface, astride the 0.62 line in `classify()` (`src/figures/bilayer.js`). A formed sheet flickered the other way — "Micelles" in 0.2% of reads at 37 °C and 2.7% at 48 °C, when the spanning sheet briefly split in two — and between 70 and 84 °C the word changed 180-280 times in 30 s of clock. No line on one sweep can separate the cases: a sheet at 65 °C dips to 0.65 and a hot tank reaches 0.75.
- The tank's height follows its pane, and its floor was 0.52 of its width. A chapter page at 1024 px reached the floor: a 10.4 nm tank, where 90 °C was a sheet or micelles in 89% of sweeps. The figure's physics depended on the reader's screen.
- After Curl, the overlay keyed on the wrap alone, and the sentence put the heal time ahead of every Curl sentence. It also described ends when there were none: a sheet that did not reach across the tank has nothing for Curl to open.

**What the gates could see, and why the answer was nothing.** The drive step read the verdict once, at the first poll after the clock passed 8 s — an instant the machine's load chose — so the same figure was green here and red on GitHub. Every browser gate that drives the figure uses the lab's 1000x640 stage, whose tank is 13.8 nm; nothing had run the figure at a 1024 px page's tank. The Curl step asserted numbers and never words, and it pressed Curl on whatever the running walk held, which made it red on 2 of 5 runs of an unchanged recipe on the day of the fix.

**Now checked by.**

| Symptom | Root cause | Now checked by |
|---|---|---|
| "Micelles" or "Bilayer" at 90 °C | a verdict read off one sweep of a thermal walk | the verdict is what the tank has held over the last second, with hysteresis (`SAMPLE_SWEEPS`); `npm run drive`'s `hot-enough-and-nothing-assembles` reads it at 60 instants over 30 s of clock, walked by Step ([proof](gate-proofs.md#drive-at-90-c-the-bilayer-tank-says-dispersed-at-every-one-of-sixty-reads-across-30-s-of-its-own-clock-toolsdrivejs-bilayer-hot-enough-and-nothing-assembles)) |
| "Bilayer" at 90 °C on a 1024 px page | a tank-height floor of 0.52 | the floor is 0.66 (13.2 nm) and a flatter pane is drawn narrower; `test/bilayer-model.test.js` holds 90 °C at the floor ([proof](gate-proofs.md#unit-at-90-c-the-bilayer-tank-stays-dispersed-at-the-flattest-shape-the-figure-draws-testbilayer-modeltestjs)) |
| after Curl, "two open ends" beside a sealed sheet, and a heal time instead of what Curl did | the overlay keyed on the wrap alone; the sentence ordered the heal time first | `npm run drive`'s `curl-takes-the-wrap-away-and-the-sheet-rolls-up` asserts the words, from fresh tanks walked by Step ([proof](gate-proofs.md#drive-after-curl-the-bilayer-reading-says-what-curl-did-and-stops-calling-closed-rims-open-toolsdrivejs-bilayer-curl-takes-the-wrap-away-and-the-sheet-rolls-up)) |

The class is **a word shown to a reader about a simulation, taken at one instant**; a reader reads it over seconds. Still unwatched: the four other molecules (a tank of pure cholesterol at 37 °C is reported as a bilayer, where the figure's own header says cholesterol makes nothing of its own), 85-89 °C, where the verdict changes by design, and the phone layout's words, which were looked at and are not asserted.

## 2026-09-23 — the library page said only chapter 1 was ready, with five chapters published

The front page's card for the biology book read, word for word: *"An interactive introduction to biology. Chapter 1, “What is life?”, is ready; thirty-one more are outlined."* `README.md` said the same: *"Chapter 1, What is life?, is written"*. Chapters 1 to 5 were published and linked from the book's own contents page. It reached this worker from the owner through the coordinator as *"The site says only chapter 1 exists"*.

**How it was found.** The 2026-09-23 project audit (`docs/work/7_project-audit/`, finding F6, `index.html:112` and `README.md:5`), which three of its workers reported and its critic confirmed on the live page. No check was red.

**The root cause.** A sentence that names chapters, written by hand, with no build step to regenerate it. It was true when `7c6f905` wrote it on 2026-09-10 and false from `6d854cf` on 2026-09-15, when chapters 2 and 3 landed. Nothing repoints it when a chapter lands, which is the same cause as the four earlier times this class appeared: the contents page for chapters 2 and 3 (`6d854cf`), chapter 4's closing card, and the contents page again for chapters 4 and 5, fixed inside the `5e9c981` landing.

**What the gates could see, and why the answer was nothing.** The fact to check against is the tree, and the one rule that read the tree (2026-09-16, below) read only the closing card. The href rule sees links, not claims, and the library page's sentence has no link in it. `README.md` is not a page, so no gate read it at all.

| Symptom | Root cause | Now checked by |
|---|---|---|
| The library page's card named chapter 1 as ready and "thirty-one more" as outlined | a sentence naming chapters, true for five days and false for eight | `checkChapterAvailability` in `npm run check`: each shelf card is read against the book its `href` opens, and a list of ready chapters, a count, or "N more are outlined" that the disk contradicts fails. The card now names no chapter, so it has nothing to go stale |
| `README.md` said the same | the same | the same rule, each paragraph read against the book whose title it names |
| The class: a book's contents page listing a chapter on disk as "In preparation" (twice) | a hand-edited list | the rule's contents half: a directory on disk means a link to it and the readable tag, an absent one means no link and the unwritten tag, and every directory has a line. Proved red on the real files and on `6d854cf` in [gate-proofs.md](gate-proofs.md#check-which-chapters-a-page-says-can-be-read-agrees-with-the-chapter-directories-on-disk-toolscheck-contentjs-checkchapteravailability) |

**The lesson underneath.** The 2026-09-16 gate covered the one place the defect had last been seen, and the next occurrence came from a place next to it. This rule reads every place the audit found, and its bound is named in its header: English prose it cannot parse, and nothing under `docs/`. `docs/design/textbook.md` still says only chapter 1 exists (lines 3 and 194), and nothing reads it.
