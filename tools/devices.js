// npm run devices: load every page on a matrix of real emulated devices and check the things that
// break between one screen and another.
//
// Claim: on each device a page is loaded on — which devices those are is derived from the page, below —
// the page loads with no console error, page error or failed request;
// the document does not scroll sideways; the header is there, every control in it is fully inside the
// viewport and at least 24 px on its smallest side, and the leftmost and the rightmost control each sit
// on the header's own padding for that side rather than adrift — the LEFT corner and the right corner
// both, because the first version of this check pinned only the right one and a control 90 px in from
// the left edge passed it; on a chapter page the contents drawer is there, reachable and operable by the
// device's own input, closes when a link in it is followed, and is not present on screens wide enough to
// show the rail instead; the drawer has a scrim, locks the page behind it, takes focus, and closes on a
// tap outside; on a chapter page there are glossary terms, and nothing that pops up over the text (a
// glossary definition, a figure's card) hangs off either edge; on a chapter page there is a text column,
// and its blocks share one left and one right edge; and on a chapter of the paired-column book the
// reading column and its 原文/譯文 block each take at least half of a 1280–1920 px viewport.
// Fails naming the device, the page and the measure — and, when a suite finds none of its subject on a
// page that must have it, naming the selector and the page rather than skipping.
//
// Why it exists, and why it is not tools/narrow.js: every other gate here sets a narrow VIEWPORT on a
// desktop browser, which has a mouse, hover, and `pointer: fine`. A phone has touch, no hover and
// `pointer: coarse`, and three defects the owner hit on a real phone were invisible to a 390 px
// desktop window (docs/learning/defect-register.md, 2026-09-10). This gate emulates the device, not
// just its width: touch, user agent, device pixel ratio and all.
//
// Bound: structure and reachability, not beauty. It cannot tell you a layout is ugly, only that a
// control is off screen, too small to hit, overflowing, or unreachable by the input the device has.
// The screenshots in out/devices/ are for the beauty question. The device list is a sample of shapes,
// not of products: it covers small phone, phone, Android phone, phone landscape, tablet portrait,
// tablet landscape, small laptop, desktop and wide desktop — nine — which is where the layout's
// breakpoints actually are. A page is loaded on the ones it needs rather than on all nine: a device is a
// shape here, and the rule that turns a page's own subjects into its load set is below. It presses the
// controls it checks — the contents button, one link in the
// drawer, every glossary term, a tap outside the drawer — and nothing else: no check option, no sort
// control and no figure control, which are tools/flow.js's and tools/drive.js's questions.
// DEVICE_PAGES, DEVICE_ONLY, DEVICE_ENGINES and DEVICE_THEMES trim the run, a trimmed run proves only
// its part, and a value naming nothing stops the run rather than emptying it (tools/lib/trim.js).
//
// The matrix is DERIVED from what each page carries, not run whole. A page is loaded on one device per
// SHAPE it can exercise, and a shape is the layout band the width falls in together with the input the
// page's own controls are pressed with — so a page that carries none of a device's subject is no longer
// loaded on it. `matrixFor` below states the rule and the three things that decide a load; the run prints
// the matrix it derived before it loads anything. Measured 2026-09-19 on this tree: nine shapes over every
// page was 107 loads and 25 minutes of a 36-minute chain, and the derived matrix is 62 loads with the same
// verdicts on every (device, page) pair it kept.
//
// What is NOT derived, deliberately: the themes and the engines. A dark page is a different rendering with
// its own failures, and the two shapes either side of the drawer breakpoint on WebKit and Gecko are where
// the owner's real-phone defects were reproducible. Cutting either would be a relaxation, not a fix.
//
// Where the run writes: out/devices/ unless DEVICE_LABEL names a directory, in which case
// out/devices-<label>/, emptied the same way — the shape tools/inspect.js's --label has, so a second run in
// one tree can be kept beside the first instead of on top of it. This gate, shot, drive, narrow and sweep3d
// all empty their own directory as they start, so two runs of one of them in a shared tree destroy each
// other's evidence; the label is what makes the second run keepable. The run prints the directory it
// emptied. A frame is `<engine>-<device>-<page>-<theme>.png` with the page's book separator flattened to a
// hyphen, so every frame is one file in that directory for one load of the report, and no engine's
// rendering stands in for another's under one name.
//
// What the summary says about scope: the pages it judged, by name, and — when the tree holds pages this run
// did not reach, because DEVICE_PAGES or DEVICE_ENGINES narrowed it — which ones were outside it. A scoped
// green that a reader can mistake for a repository-wide one is the failure that line is for; the session of
// 2026-09-19 had to work it out by hand from the page ids in the output.
//
// Bound, for the derived matrix. Two devices are one shape when they sit in the same layout band and press
// with the same input, and the representative of a shape is its narrowest device, so a defect that lives at
// one width inside a band and not at that width — 390 or 412 px rather than 320, 768 rather than 750 — is
// not seen by this gate. Those widths are not unwatched, only unwatched here: `npm run shot` loads every
// page at 390, 1024 and 1440, `npm run narrow` and `npm run flow` drive a 390 px stage, and
// `DEVICE_ONLY=phone,phone-android,tablet,desktop-wide` puts the old matrix back for one run. What the
// derivation keeps is what makes this gate worth its time: touch against mouse, the drawer below the
// breakpoint against the rail above it, every glossary term on the page, and the paired book's
// reading-column floor at both ends of its band. A book's own stylesheet may add rungs inside a band —
// tongjian/zj.css does, at 380, 900, 1100, 1200, 1480 and 1600 px — and there the class's narrowest device
// is loaded and the wider ones are not, which is the same cost this bound names. The guard beside the band
// table fails by name if the cut points ever stop agreeing with DRAWER_BELOW: that is the one coarsening
// that would silently lose a whole suite, because the drawer and the rail would land in one shape.
//
// Bound, for the corner and width checks added on 2026-09-19. The corner checks measure the controls
// that actually render (a control with no box at all is skipped) and compare against the header's own
// padding with 4 px of tolerance; a header that holds no control is already a failure above them, so a
// corner check with nothing to measure cannot come back green. The width floor belongs to the paired
// book alone — 資治通鑑's chapters, where the 原文 is set against its 譯文 in two columns — and to
// viewports of 1280 to 1920 px, which in the matrix below is `desktop` and `desktop-wide` and nothing
// else: above 1920 the measure is capped at 63.4rem on purpose, so the share of the window falls there
// by design rather than by defect. A biology chapter holds no such pair and is not asked for this: it is
// a fixed 43.6rem, 697.6 px, at 1280, 1440, 1920 and 2560 — 54.5%, 48.4%, 36.3% and 27.3% — which is the
// shape this check was built to catch on 資治通鑑. Whether the biology book should use the width too is a
// design decision nobody has taken, and a floor here would be this gate inventing one.
//
// What a run says about the floor, because a trimmed run is read from its output alone. Every load prints
// the share it measured and says whether the floor was exercised on it; a load the floor does not apply to
// prints `was NOT exercised` and the widths that would exercise it. The run's summary carries the same
// answer for the whole run — how many loads compared the shares, or that none did and which pages and
// widths would have — and it is a report and not a failure: a phone run's floor legitimately has nothing
// to measure, and `DEVICE_ONLY=phone` must not go red for it. What it must never do is let "all clean"
// stand for a run whose floor never ran, which is the shape every gate in this repository is written
// against. A run that loads no page at all fails, because two individually valid trimming variables can
// meet in no load (see the guard at the end of the file).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { devices as playwrightDevices, chromium, webkit, firefox } from 'playwright';
import { startServer } from './serve.js';
import { WEBGL_ARGS, collectErrors, PAGES, BOOKS } from './lib/browser.js';
import { trim, PAGE_HINT } from './lib/trim.js';

// Where this run's evidence goes. `out/devices/` for a single run, unchanged; `out/devices-<label>/` when
// DEVICE_LABEL names one, emptied the same way, so a second run in a shared tree keeps its frames and its
// report.json instead of taking the first run's. Same name rule and same shape as tools/inspect.js's
// `--label`, so the directory is always one of this tool's own.
const LABEL = process.env.DEVICE_LABEL || null;
if (LABEL !== null && !/^[a-z0-9][a-z0-9_-]{0,31}$/.test(LABEL)) {
  console.error(`DEVICE_LABEL="${LABEL}" is not usable as a directory name; use 1 to 32 characters of a-z, 0-9, underscore or hyphen, starting with a letter or digit. What would satisfy this: DEVICE_LABEL=before, which writes out/devices-before/ beside the default out/devices/.`);
  process.exit(2);
}
const OUT = LABEL === null ? 'out/devices' : `out/devices-${LABEL}`;

// Each entry is a shape the layout has to survive. `touch` devices are emulated as phones and tablets
// (touch events, mobile user agent, coarse pointer); the rest are ordinary desktop browsers.
export const DEVICES = [
  { id: 'phone-small', use: { ...playwrightDevices['iPhone SE'] }, kind: 'touch' },
  { id: 'phone', use: { ...playwrightDevices['iPhone 13'] }, kind: 'touch' },
  { id: 'phone-android', use: { ...playwrightDevices['Pixel 7'] }, kind: 'touch' },
  { id: 'phone-landscape', use: { ...playwrightDevices['iPhone 13 landscape'] }, kind: 'touch' },
  { id: 'tablet', use: { ...playwrightDevices['iPad Mini'] }, kind: 'touch' },
  { id: 'tablet-landscape', use: { ...playwrightDevices['iPad Mini landscape'] }, kind: 'touch' },
  { id: 'laptop', use: { viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 }, kind: 'mouse' },
  { id: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, kind: 'mouse' },
  { id: 'desktop-wide', use: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }, kind: 'mouse' },
];

// Below this the chapter's rail becomes a drawer behind a button; at or above it the rail is shown and
// the button is not. One number, matching the breakpoint in src/styles/layout.css.
const DRAWER_BELOW = 800;

// WCAG 2.2 target size (minimum) is 24 by 24 CSS pixels.
const MIN_TARGET = 24;

// How long each phase of a load may take, in one place, because a single inherited number cannot say
// which phase was slow. `page.setDefaultTimeout(120_000)` used to be the only budget on a load: it
// covered the navigation, the handshake, the font wait, every one of the six suites and the capture,
// and the string the run printed for a stall in any of them was Playwright's own
// `page.screenshot: Timeout 120000ms exceeded` — which names the screenshot whether or not the
// screenshot is what stalled. Measured 2026-09-19, on this tree: `page.screenshot` is three waits under
// one `progress.race` (playwright-core coreBundle.js:20857 screenshotPage, :20912 the all-frames
// prepare, :20916 `document.fonts.ready` in the utility world, :44556 the CDP capture), so the font
// wait and the raster capture produce the identical string. The phases also want different sizes: the
// capture is local work whose worst measured value is 3.35 s over 68 rounds, while `goto` is a network
// wait that went from 2 s to 20 s when the machine was oversubscribed with 64 burners on 32 cores.
//
// So each phase gets its own budget and its own message, and NO PHASE'S BUDGET IS LOOSER THAN THE 120 s
// IT HAD BEFORE — every number below is the same or tighter, so this change cannot turn a green load
// red that would have been green, and cannot make a red one take longer to report. The capture's 45 s
// is 13.4 times the worst capture measured on this tree (3348 ms, out/devtime/README.md), and the
// suites' 60 s is 13 times the longest whole `tongjian` load measured (7.3 s, the gate's own tuple).
// A budget tighter than the work needs is a false red, which is why each one carries its own margin
// here rather than one number being halved.
const CAPTURE_BUDGET_MS = 45_000;
const SUITE_BUDGET_MS = 60_000;
const FONTS_BUDGET_MS = 30_000;
const NETWORK_BUDGET_MS = 120_000;

// The marker `runPhase` puts in front of its own message, so the catch below can tell a phase budget
// that fired from any other failure and not wrap the same sentence twice. It is stripped before the
// message is printed, so nothing in the run's output carries it. A plain word rather than an invisible
// one on purpose: a control character in a tracked file made `tools/shot.js` unreadable to the edit
// tool, and `test/control-chars.test.js` fails one (docs/policies/local-rules.md).
const PHASE_TIMEOUT_FLAG = 'phase-budget: ';

// Three engines, not one. Emulating an iPhone in Chromium gives you an iPhone's SIZE and an iPhone's
// INPUT, and Blink's layout — but a real iPhone runs WebKit, and the owner's four defects were found on
// a real phone. So the two shapes either side of the drawer breakpoint are re-run on WebKit and Gecko over
// the two pages that between them carry everything this gate checks, while Chromium carries every shape
// each page needs; `crossOf` below takes that pair from the page's own load set rather than from a list
// here, so it cannot name a shape the derived matrix no longer loads.
// Widening every engine to every device and page would triple a gate that is already the slowest in
// the chain for a thin return: the engines differ in layout and input handling, not in how many screen
// sizes exist.
//
// Firefox cannot emulate a mobile device in Playwright (`isMobile` is unsupported and throws), so its
// phone run is a narrow viewport with touch, and it is the weakest of the three. It is here for layout
// differences, not for input ones, and that is the limit of what it proves.
const ENGINES = [
  { id: 'chromium', launch: () => chromium.launch({ args: WEBGL_ARGS }), full: true },
  { id: 'webkit', launch: () => webkit.launch(), full: false },
  { id: 'firefox', launch: () => firefox.launch(), full: false },
];

// Which pages the two secondary engines run: the library and one chapter, which between them carry
// everything the suites below check — the header, which every page has, and the rail, the glossary terms
// and the text column, which a chapter has. Page ids are book-qualified (see `discoverBooks`), so this
// names one chapter rather than whichever chapter 1 happens to match first. Today is not here: its study
// surfaces are `npm run sitting`'s, on Chromium only, and nothing below presses them. WHICH shapes they run
// is not named here: `crossOf` below takes the two either side of the drawer breakpoint out of each page's
// own derived load set, so a named pair can never fall out of the matrix and leave these engines with
// nothing to load.
const CROSS_PAGES = ['library', 'biology/ch01'];

// The selectors the suites read, in one place, so a rename fails by name below.
const SEL = { header: '.tb-header', rail: '.tb-rail', toggle: '.tb-navtoggle', scrim: '.tb-scrim', term: 'tb-term button', pop: '.tb-term__pop', main: '.tb-main', text: '.tb-text', pair: '.zj-src', row: '.zj-pair', src: '.zj-pair__src', tr: '.zj-pair__tr' };

// Which books set the 原文 against its 譯文 in paired columns, and so make a claim about how much of a
// wide screen that reading column uses. 資治通鑑 alone. Measured 2026-09-19 (out/widthgate/probe-width.mjs):
// a biology chapter has no `.zj-pair` at all, and the library, the two book pages and Today have no
// `.tb-text` either, so a width floor on them would demand something no design decision asks of them.
const PAIRED_BOOKS = ['tongjian'];

// The band the floor above applies to, and how much of the viewport the reading column must hold there.
// The ladder of `@media (min-width: …)` rungs in tongjian/zj.css starts at 1100 px and is fully in force
// by 1280; above 1920 the measure stops at 63.4rem deliberately — that ceiling is what keeps the 譯文 a
// measure of its own instead of a caption column — so past 1920 the share falls by design (1014 px is
// 39.6% of 2560) and this check does not apply. Measured on 2026-09-19, identical on ch01, ch02 and ch03:
//   1280 px -> 848 px, 66.3%      1440 px -> 838 px, 58.2%      1920 px -> 1014 px, 52.8%
// The floor is 50%, which is 2.8 points under the 1920 figure and 16.3 under the 1280 one, and the
// margin is small at the wide end because the quantity is CSS arithmetic rather than a rendering: the
// column is `min(100vw - 37.6rem, 63.4rem)` and 63.4rem is 52.8% of 1920 whatever the fonts do. 50% is
// therefore the statement that the top rung may not fall below 60rem, and the defect this check is for —
// one fixed 43.6rem measure, 698 px, 36.3% at 1920 and 48.4% at 1440 — is 13 points below it.
const WIDE_FROM = 1280;
const WIDE_TO = 1920;
const MIN_WIDE_SHARE = 50;

// Who the floor applies to, and which widths reach it, both DERIVED rather than remembered. A run trimmed
// by DEVICE_ONLY or DEVICE_PAGES can leave the floor with nothing to measure — a phone run is 390 px and
// a biology run has no paired columns — and this file's rule is that a gate which cannot tell "passed"
// from "did not run" reports the second as the first. So a load that does not exercise the floor says so
// on its own line, and the run's summary says whether the floor ran at all and, when it did not, which
// widths and which pages would have made it run. `DEVICES` and `PAGES` are read here rather than listed:
// a device added to the matrix changes what this sentence says without anyone having to remember to.
const widthOf = (device) => device.use.viewport?.width ?? 0;
const isInBand = (device) => widthOf(device) >= WIDE_FROM && widthOf(device) <= WIDE_TO;
const describeDevice = (device) => `${device.id} (${widthOf(device)} px)`;
// The layout's own widths, and the bands between them. Inside one band no rule of the SHARED stylesheets
// changes, so two viewports in one band differ only where a book's own stylesheet says so — the
// approximation the derivation below makes, and the header's bound costs it out. The cut points are read
// off src/styles/: 480 (layout.css:606), 600 (layout.css:597, typography.css:365, components.css:830), 800
// (layout.css:401 and :470 — the drawer, and with it the header's own padding and breadcrumb), 1000
// (layout.css:389, the rail's width) and 1400 (layout.css:318, where the third column appears). Nothing
// there answers `(pointer: …)` or `(hover: …)`, so a page lays out as a function of its width alone: the
// input a device has decides how this gate presses, never how the page renders.
const BREAKPOINTS = [480, 600, 800, 1000, 1400];
// 800 has to be one of them or the derivation is wrong. A band that straddled it would put a device with a
// drawer and a device with a rail in one shape, and a shape keeps its narrowest member — so the rail side
// would lose its load and the toggle-absent check with it, without a word. That is the one coarsening this
// table cannot survive, so the run stops on it by name.
if (!BREAKPOINTS.includes(DRAWER_BELOW)) {
  console.error(`BREAKPOINTS ${BREAKPOINTS.join(', ')} does not include DRAWER_BELOW (${DRAWER_BELOW}), so a band straddles the drawer breakpoint. Such a band holds a device with a drawer and a device with a rail as one shape, and the derivation keeps only the narrower of the two, so the rail side would lose its load and the check that the drawer button is gone above ${DRAWER_BELOW} px with it. What would satisfy this: put ${DRAWER_BELOW} back in BREAKPOINTS in tools/devices.js.`);
  process.exit(1);
}
// How many of them the width has reached. 0 is a small phone; 5 is 1400 px and up.
const bandOf = (device) => BREAKPOINTS.filter((b) => widthOf(device) >= b).length;
const IN_BAND_DEVICES = DEVICES.filter(isInBand);
// The pages the floor can apply to: a chapter of a paired book, which is what `pairedPage` below decides
// per load. `shapeOf` is declared below and hoists.
const FLOOR_PAGES = PAGES.filter((p) => PAIRED_BOOKS.includes(String(p.id).split('/')[0]) && shapeOf(p) === 'chapter').map((p) => p.id);

// What each page must carry, so a suite that finds nothing fails instead of skipping. The header,
// drawer, popover and edge suites were each guarded on their own selector, so a renamed class emptied
// the suite and the load stayed `ok` (review of 2026-09-16, finding 5). The requirement is keyed on the
// page's shape, which is what makes a component required: the shell builds the rail for
// `main[data-chapter]`, and a chapter's recipe puts terms and prose in the text column. The other three
// shapes are stated too, so a page that legitimately lacks a component is on record here rather than
// silently exempt. Every page has the header. A page carrying something this table does not require is
// still checked: the table says what must be there, not what may be.
const EXPECT = {
  chapter: { rail: true, terms: true, column: true },
  book: { rail: false, terms: false, column: false },
  library: { rail: false, terms: false, column: false },
  today: { rail: false, terms: false, column: false },
};
function shapeOf(pageDef) {
  if (pageDef.id === 'library' || pageDef.id === 'today') return pageDef.id;
  return BOOKS.some((b) => b.id === pageDef.id) ? 'book' : 'chapter';
}

// ---------------------------------------------------------------------------------------------------
// The matrix, derived from what each page carries.
//
// A page is loaded on ONE DEVICE PER SHAPE it can exercise, and a shape is a layout band together with an
// input. Three statements decide a load, and each is a fact about the checks above rather than a taste:
//
// 1. ONE DEVICE PER SHAPE, because a second device in the same shape buys a load and no verdict. Two
//    viewports in one band differ by nothing the shared stylesheets say (BREAKPOINTS above), and two
//    devices that press the same way drive every control here the same way, so each measure in this file
//    reads the same number on both. Nine shapes over every page was 107 loads on the tree of 2026-09-19,
//    most of them measuring what the load before them had already measured.
// 2. THE INPUT SEPARATES SHAPES ONLY WHERE SOMETHING IS PRESSED. The drawer button, a link in it, its
//    outside tap and every glossary term are pressed with the device's own input, and the product branches
//    on it: src/components/term.js opens a card on hover only where `(pointer: coarse)` is false, because a
//    tap is a hover and a click in one gesture and the hover used to win (defect register, 2026-09-12). A
//    page whose only subject is the header has nothing to press, and no stylesheet here asks about the
//    pointer, so touch and mouse at one width are one shape for it.
// 3. THE FLOOR TAKES BOTH ENDS OF ITS BAND. A chapter of PAIRED_BOOKS is loaded at the narrowest and the
//    widest device inside WIDE_FROM–WIDE_TO, because the floor is a SHARE of the viewport and the share
//    falls as the window grows: 58.2% at 1440 px and 52.8% at 1920 px against a 50% floor, so the top of
//    the band is the case nearest the edge.
//
// The device that represents a shape is its NARROWEST member, because every horizontal measure here is
// worst at the narrowest width: the header control that shrank under 24 px did it at 320 px (defect
// register, 2026-09-19), and an overflowing sort control and an overflowing table both ran off a phone.
// What this costs is in the header's bound.
const shapeKey = (device, presses) => (presses ? `${bandOf(device)}/${device.kind}` : `${bandOf(device)}`);
const byWidth = (a, b) => widthOf(a) - widthOf(b);

// The devices one page is loaded on, and which kind of page it is in the rule's own words. `presses` is
// whether the page has anything this gate presses — the drawer button and its link, its outside tap, and
// every glossary term — which is EXPECT's rail and terms, the two subjects that take the device's input.
function matrixFor(pageDef) {
  const expect = EXPECT[shapeOf(pageDef)];
  const presses = Boolean(expect.rail || expect.terms);
  const paired = PAIRED_BOOKS.includes(String(pageDef.id).split('/')[0]) && shapeOf(pageDef) === 'chapter';
  const held = new Map();
  for (const device of DEVICES) {
    const key = shapeKey(device, presses);
    const shown = held.get(key);
    if (!shown || widthOf(device) < widthOf(shown)) held.set(key, device);
  }
  const devices = DEVICES.filter((d) => [...held.values()].includes(d));
  if (paired) {
    // The other end of the floor's band. The narrowest device in it already represents the shape, so this
    // adds the widest one and only when it is a different device.
    const widest = DEVICES.filter(isInBand).sort(byWidth).at(-1);
    if (widest && !devices.includes(widest)) devices.push(widest);
  }
  return { kind: !presses ? 'header-only page' : paired ? 'paired-column chapter' : 'chapter', devices: devices.sort(byWidth) };
}

// The two shapes either side of the drawer breakpoint: the narrowest below it and the widest at or above
// it, taken from the page's own load set rather than named. A named pair is a list that can fall out of the
// derived matrix, and a WebKit-only run over a pair that is not in it would load nothing at all — the
// zero-load guard at the end of this file is the backstop for exactly that, and this is what keeps it from
// ever firing on a page that exists.
function crossOf(devices) {
  const below = devices.filter((d) => widthOf(d) < DRAWER_BELOW).sort(byWidth);
  const above = devices.filter((d) => widthOf(d) >= DRAWER_BELOW).sort(byWidth);
  return [below[0], above[above.length - 1]].filter(Boolean);
}

// Firefox rejects isMobile; strip it and keep the viewport, touch and scale factor.
function contextFor(engineId, device) {
  const use = { ...device.use };
  if (engineId === 'firefox') delete use.isMobile;
  return use;
}

const themes = trim('DEVICE_THEMES', ['light', 'dark'], { noun: 'theme', unset: ['light'] });
// DEVICE_ONLY names devices directly and turns the derivation off for the run: it is how a probe asks for a
// shape the matrix spends no load on — DEVICE_ONLY=phone,phone-android,tablet,desktop-wide is the old
// nine-shape matrix by hand — and every name in it still has to exist. Unset it is the empty list, which is
// the whole signal that the derived matrix carries this run, so nothing here reads the variable itself.
const named = trim('DEVICE_ONLY', DEVICES, { idOf: (d) => d.id, noun: 'device', unset: [] });
const pages = trim('DEVICE_PAGES', PAGES, { idOf: (p) => p.id, noun: 'page', hint: PAGE_HINT });
const engines = trim('DEVICE_ENGINES', ENGINES, { idOf: (e) => e.id, noun: 'engine' });
// What a page is loaded on: the devices DEVICE_ONLY named, or the shapes its own subjects need.
const devicesFor = (pageDef) => (named.length ? named : matrixFor(pageDef).devices);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
console.log(`emptied ${OUT}/${LABEL === null ? ' (the default run directory)' : ` — DEVICE_LABEL=${LABEL}, so the default out/devices/ is untouched`}`);

// What this run will load, page shape by page shape, before it loads anything: the derivation's own report,
// so a reader of a trimmed run sees which shapes a page was given and the reason it was given them, rather
// than inferring both from the lines below. A page is missing from these lines only if DEVICE_PAGES or
// DEVICE_ENGINES left it out, and the summary says so in the same words.
{
  const shapeList = (devices) => devices.map((d) => `${d.id} ${widthOf(d)}/${d.kind}`).join(', ');
  if (named.length) console.log(`matrix: DEVICE_ONLY named ${named.length} device(s), so the derived matrix is off for this run and every page is loaded on them: ${shapeList(named)}`);
  const groups = new Map();
  for (const pageDef of pages) {
    const { kind } = matrixFor(pageDef);
    const devices = devicesFor(pageDef);
    const key = `${kind}: ${devices.map((d) => d.id).join(',')}`;
    if (!groups.has(key)) groups.set(key, { kind, devices, pages: [] });
    groups.get(key).pages.push(pageDef.id);
  }
  for (const g of groups.values()) {
    console.log(`matrix: ${g.pages.length} ${g.kind}(s) on ${g.devices.length} of ${DEVICES.length} shape(s) — ${shapeList(g.devices)}: ${g.pages.join(', ')}`);
  }
}

const server = await startServer({ port: 0, quiet: true });
let browser = null;
const problems = [];
const report = [];
let loads = 0;

// Tap on a touch device, click on a mouse one: the point of this gate is to use the input the device
// actually has, because a drawer that opens on click and not on tap is exactly the defect it hunts.
async function press(page, locator, kind) {
  if (kind === 'touch') await locator.tap();
  else await locator.click();
}

try {
  for (const engine of engines) {
    // Chromium loads every shape a page needs; the secondary engines load the two either side of the drawer
    // breakpoint, over the library and one chapter. Both come from the page's own load set, so a page's
    // shapes decide the run rather than a list beside it.
    const enginePages = engine.full ? pages : pages.filter((p) => CROSS_PAGES.includes(p.id));
    const shapesFor = (pageDef) => (engine.full ? devicesFor(pageDef) : crossOf(devicesFor(pageDef)));
    const deviceIds = new Set(enginePages.flatMap((p) => shapesFor(p).map((d) => d.id)));
    const engineDevices = DEVICES.filter((d) => deviceIds.has(d.id));
    if (!engineDevices.length || !enginePages.length) continue;
    browser = await engine.launch();
    try {
    for (const device of engineDevices) {
      for (const theme of themes) {
        const context = await browser.newContext(contextFor(engine.id, device));
        for (const pageDef of enginePages) {
          // The page decides: a device this engine runs for one page is not loaded on a page that carries
          // none of its subject.
          if (!shapesFor(pageDef).some((d) => d.id === device.id)) continue;
          const where = `${engine.id} ${device.id} ${pageDef.id}${themes.length > 1 ? ` ${theme}` : ''}`;
          // The frame's own name. The ENGINE is in it because the secondary engines load the same device and
          // page Chromium does: without it, `phone-small-library-light.png` held whichever engine wrote last,
          // and WebKit's and Gecko's renderings stood in for Blink's under a name that claimed to be both.
          // The page id is book-qualified, so its slash is flattened too: left in,
          // `phone-small-biology/ch01.png` writes into a subdirectory named after a device and a book, which
          // is not what the run's own summary describes. tools/inspect.js flattens it for the same reason.
          const pageName = pageDef.id.replaceAll('/', '-');
          const expect = EXPECT[shapeOf(pageDef)];
          const page = await context.newPage();
          // What this load is, in one phrase, for a budget message to name. Built here rather than from
          // `where` alone because `where` names the theme only when more than one runs.
          const thisLoad = `${engine.id} at ${device.id} (${widthOf(device)} px, ${device.kind}) on ${pageDef.id}${themes.length > 1 ? `, ${theme} theme` : ''}`;
          page.setDefaultTimeout(NETWORK_BUDGET_MS);
          const errors = collectErrors(page);
          const found = [];
          // Which phase of the load is running, so a thrown timeout can name it. Every phase below sets
          // this before its own awaits; `why` is the closing sentence of the message and says what the
          // budget is for, because "what would satisfy this" is the half of an error the reader needs.
          let phase = 'the load';
          let why = `What would satisfy this: the phase must finish inside its budget in tools/devices.js, or the budget must be raised there with the measurement that says so.`;
          // Run one phase of the load, bound it by the budget it is given, and fail naming it. This is the
          // whole mechanism, and it is deliberately one function with no companion: a budget is enforced by
          // the clock below rather than by threading a timeout option through every Playwright call.
          //
          // That is the smaller correct change, and it is smaller because of what the first version cost.
          // Handing the budget to the calls as well needed a helper for options-carrying calls
          // (`goto`, `screenshot`, `locator.count`) and another for argument-carrying ones
          // (`evaluate`, `waitForFunction`), and that layer produced two bugs of its own inside twenty
          // minutes — `Too many arguments` from an argument slot Playwright counts, and a helper renamed
          // at its definition and not everywhere — both caught by this change's own phase message. The
          // page's default timeout is 120 s and stays there as the backstop it always was; the budget a
          // reader cares about is the one in the message, and every phase below carries one.
          //
          // The 5 ms of slack keeps Playwright's own rejection the one that is reported when both fire:
          // its message carries the API call that timed out, which is evidence this one should not throw
          // away. A call that never returns at all lands here instead of hanging the gate. The work
          // promise is caught rather than abandoned, so a budget that fires does not leave an unhandled
          // rejection behind it.
          const runPhase = (budget, work) => {
            let timer = null;
            const started = Date.now();
            const running = Promise.resolve().then(work);
            running.catch(() => {});
            return Promise.race([
              running,
              new Promise((_, fail) => {
                timer = setTimeout(() => fail(new Error(`${PHASE_TIMEOUT_FLAG}the ${phase} did not finish within ${budget} ms (it had run ${Date.now() - started} ms when this was written) in ${thisLoad}; ${why}`)), budget + 5);
              }),
            ]).finally(() => clearTimeout(timer));
          };
          // What the width floor did on this load, in one word for the report and one sentence on the
          // line: 'exercised' means its two shares were compared against MIN_WIDE_SHARE, and anything else
          // says why they were not. A trimmed run whose every load says one of the others is a run whose
          // floor never ran, and the summary below says so rather than letting "all clean" stand for it.
          let floor = 'not reached: the checks above it did not get that far';
          // What each suite actually measured, printed on every line so a load that checked nothing
          // cannot read like one that checked everything.
          const counts = { controls: 0, drawer: false, terms: 0, column: false, prose: 0, wide: 0, share: null, pair: null, width: 'not measured' };
          try {
            // --- the four phases of the load, each under its own budget and each saying its own name ---
            //
            // The order is the order it has always been. What is new is that a stall in any of them is
            // reported as that phase rather than as whatever Playwright call happened to be in flight.
            // The width every measure below is read against: the context's own viewport when it has one,
            // and otherwise the device's declared width.
            const width = page.viewportSize()?.width ?? device.use.viewport?.width ?? 0;
            phase = 'navigation';
            why = `What would satisfy this: ${NETWORK_BUDGET_MS} ms is the budget for the page's load event at ${device.id}, which is a network wait — the fonts come from Google Fonts and the 3D figures from jsdelivr, so it is the budget that legitimately scales with how busy the network is rather than with the machine. It is unchanged from the single default timeout this gate ran under before, so a load that fails here failed before.`;
            await runPhase(NETWORK_BUDGET_MS, () => page.goto(`${server.url}${pageDef.path}?theme=${theme}`, { waitUntil: 'load', timeout: NETWORK_BUDGET_MS }));

            // The handshake (see the header): `window.__textbook.state` becomes 'ready' when the shell
            // has mounted. This is the page's own JavaScript plus, under ?eager=1, every figure — so it is
            // renderer work, and its budget is the network one because it runs while fonts are still
            // arriving.
            phase = 'the ready handshake (`window.__textbook.state` never became "ready")';
            why = `What would satisfy this: the shell must mount and set window.__textbook.state to 'ready' within ${NETWORK_BUDGET_MS} ms. The figure states read at the moment of failure are printed beside this message, so a figure stuck in 'loading' is visible rather than inferred. This budget is unchanged from the single default timeout this gate ran under before.`;
            // `page.waitForFunction` does accept a timeout option, but the budget is enforced by the timer
            // above for every phase alike, so the call sites stay uniform and there is no second mechanism
            // to get wrong.
            await runPhase(NETWORK_BUDGET_MS, () => page.waitForFunction(() => window.__textbook?.state === 'ready', null, { timeout: NETWORK_BUDGET_MS })).catch(async (err) => {
              // The handshake is the one phase whose failure has a second question in it: which figure
              // never reached a state. The read happens here, inside the failure path, so a healthy load
              // pays nothing for it and a page that will not answer the probe still reports the phase.
              const figures = await page.evaluate(() => Object.fromEntries(Object.entries(window.__textbook?.figures ?? {}).map(([k, v]) => [k, v.state]))).catch((probe) => `could not be read: ${probe.message.split('\n')[0]}`);
              // The phase marker is kept at the front of the message: this detail is appended AFTER the
              // sentence runPhase wrote, and the catch below keys the marker on the first characters, so
              // a marker pushed into the middle would make the same message report itself twice.
              const detail = ` Figure states at that moment: ${JSON.stringify(figures)}.`;
              throw err.message.startsWith(PHASE_TIMEOUT_FLAG)
                ? new Error(`${PHASE_TIMEOUT_FLAG}${err.message.slice(PHASE_TIMEOUT_FLAG.length)}${detail}`)
                : new Error(`${err.message}${detail}`);
            });

            // The font wait, hoisted out of the screenshot and given a name. This is the one phase whose
            // old attribution was provably wrong: `page.screenshot` waits for `document.fonts.ready`
            // itself, in the utility world (coreBundle.js:20916), and reports a stall there as a
            // screenshot timeout. Asking for it here means the wait happens where the message can name
            // it. It is normally already resolved — the navigation above cannot finish before the
            // stylesheets do, and this page declares 204 faces — so the budget is small and a stall here
            // is a fact about the page's fonts, not about the capture.
            phase = 'the font wait (`document.fonts.ready` never resolved)';
            why = `What would satisfy this: every font the page asks for must finish loading. This is not the screenshot's budget — the same wait happens inside page.screenshot, which is why a stall there used to be reported as a screenshot timeout — and ${FONTS_BUDGET_MS} ms is roughly 4000 times what this wait has measured (2 to 7 ms) since the navigation cannot complete before the stylesheets do.`;
            await runPhase(FONTS_BUDGET_MS, () => page.evaluate(() => document.fonts?.ready));
            await page.waitForTimeout(300);

            // --- the document must not scroll sideways ---
            // From here to the screenshot, the phases are the suites' own names, each stated before its
            // group so a stall inside one is reported as that group rather than as "the load". They share
            // SUITE_BUDGET_MS because they are the same kind of work on the same settled page — evaluates,
            // locators and presses — and each group's own assertions name which check failed; the budget
            // only has to say which phase of the load the time went.
            phase = 'the header and sideways-scroll phase';
            why = `What would satisfy this: these are DOM reads on an already-loaded page, and ${SUITE_BUDGET_MS} ms is 13 times the longest whole load this gate has measured (7.3 s, the tongjian/phone-landscape tuple). The reads themselves cannot be slow; a budget firing here means the renderer stopped answering, which is the diagnosis this message exists to make possible.`;
            // This one cannot carry its budget through a call option: `page.evaluate` takes the page
            // function and one argument and NOTHING else in Playwright 1.61.1 (types.d.ts:186 —
            // `evaluate<R>(pageFunction, arg?: any)`), so its timeout comes only from the page's own
            // default. `runPhase`'s timer is therefore what bounds this read. Both mutations that taught
            // me so are worth keeping: `undefined` in the argument slot and `{}` in it each return
            // `Too many arguments`, because Playwright counts the arguments it is passed — and the second
            // of those two was caught by this change's own phase message, on the first run after it was
            // written, which is the evidence that the change does what it claims.
            const doc = await runPhase(SUITE_BUDGET_MS, () => page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })));
            if (doc.scrollWidth > doc.clientWidth + 1) found.push(`the page scrolls sideways: ${doc.scrollWidth} px of content in a ${doc.clientWidth} px viewport`);

            // --- the header is there, and every control in it inside the viewport and big enough to hit ---
            const header = await page.evaluate(({ sel, min }) => {
              const out = { found: false, controls: [], headerLeft: null, headerRight: null, headerHeight: null };
              const h = document.querySelector(sel);
              if (!h) return out;
              out.found = true;
              const hr = h.getBoundingClientRect();
              out.headerLeft = Math.round(hr.left);
              out.headerRight = Math.round(innerWidth - hr.right);
              out.headerHeight = Math.round(hr.height);
              out.headerPadLeft = getComputedStyle(h).paddingLeft;
              out.headerPadRight = getComputedStyle(h).paddingRight;
              for (const el of h.querySelectorAll('button, a')) {
                const r = el.getBoundingClientRect();
                if (r.width === 0 && r.height === 0) continue;
                out.controls.push({
                  name: (el.className || el.tagName).toString().split(' ')[0],
                  label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24),
                  left: Math.round(r.left), right: Math.round(r.right),
                  top: Math.round(r.top), bottom: Math.round(r.bottom),
                  w: Math.round(r.width), h: Math.round(r.height),
                  small: Math.min(r.width, r.height) < min,
                  offRight: r.right > innerWidth + 0.5, offLeft: r.left < -0.5,
                  offTop: r.top < -0.5,
                });
              }
              return out;
            }, { sel: SEL.header, min: MIN_TARGET });
            counts.controls = header.controls.length;
            if (!header.found) found.push(`nothing matches ${SEL.header}, so the header suite measured nothing on a page that must have a header`);
            else if (!header.controls.length) found.push(`${SEL.header} holds no button or link, so there is no header control to measure`);
            for (const c of header.controls) {
              if (c.offRight) found.push(`the header control "${c.label || c.name}" runs past the right edge: right ${c.right} in a ${width} px viewport`);
              if (c.offLeft) found.push(`the header control "${c.label || c.name}" runs past the left edge: left ${c.left}`);
              if (c.offTop) found.push(`the header control "${c.label || c.name}" is above the top edge: top ${c.top}`);
              if (c.small) found.push(`the header control "${c.label || c.name}" is ${c.w} by ${c.h}, under the ${MIN_TARGET} px minimum target size`);
            }
            // The rightmost control should sit against the header's own right padding, not adrift.
            const rightmost = header.controls.slice().sort((a, b) => b.right - a.right)[0];
            if (rightmost) {
              const gap = width - rightmost.right;
              // It should sit on the header's own right padding and nowhere else. The first version of
              // this check allowed 40 px, and the toggle sat 35 px short on a phone and passed: the
              // breadcrumb that pushes it right is display:none below 800 px, so nothing pinned it and
              // the gap moved with the length of the book's title.
              const pad = Math.round(parseFloat(header.headerPadRight) || 0);
              if (gap > pad + 4) found.push(`the rightmost header control "${rightmost.label || rightmost.name}" sits ${gap} px from the right edge, where the header's own padding is ${pad} px, so it is adrift rather than in the corner`);
            }
            // And the leftmost control should sit against the header's own left padding, for the same
            // reason and by the same measure. This half was missing: the check above pinned the right
            // corner alone, so a control that had drifted inward from the left corner — the contents
            // button a reader reaches for first on a phone — was measured only for being on screen and
            // big enough, never for being in its corner at all, and 90 px of drift passed. The gap is
            // taken from the header's own left edge rather than from the viewport's, which is the same
            // number while the header is full-bleed (it is, at every device measured) and stays right if
            // it is ever inset. A page whose header holds no control was already failed by the guard
            // above, so `leftmost` being absent can never be the quiet way out of this check.
            const leftmost = header.controls.slice().sort((a, b) => a.left - b.left)[0];
            if (leftmost) {
              const gap = leftmost.left - header.headerLeft;
              const pad = Math.round(parseFloat(header.headerPadLeft) || 0);
              if (gap > pad + 4) found.push(`the leftmost header control "${leftmost.label || leftmost.name}" sits ${gap} px from the left edge, where the header's own padding is ${pad} px, so it is adrift rather than in the corner`);
            }

            // --- the contents drawer, on a chapter page ---
            phase = 'the contents-drawer phase';
            why = `What would satisfy this: the drawer is opened, dismissed by an outside tap and by a link, each with the device's own input, and each waits 650 ms for the animation. ${SUITE_BUDGET_MS} ms bounds the whole interaction rather than each press inside it, and every further call in this group runs on the page's own ${NETWORK_BUDGET_MS} ms default because tightening those is not what this change is for.`;
            const hasRail = await runPhase(SUITE_BUDGET_MS, () => page.locator(SEL.rail).count());
            if (expect.rail && !hasRail) found.push(`nothing matches ${SEL.rail} on this chapter page, so the contents drawer was not checked at all`);
            if (hasRail) {
              counts.drawer = true;
              const toggleVisible = await page.locator(SEL.toggle).isVisible();
              if (width < DRAWER_BELOW && !toggleVisible) {
                found.push(`at ${width} px the contents are a drawer, but its button (${SEL.toggle}) is not visible, so the contents cannot be reached at all`);
              }
              if (width >= DRAWER_BELOW && toggleVisible) {
                found.push(`at ${width} px the rail is shown, so the drawer button should not also be there`);
              }
              if (width < DRAWER_BELOW && toggleVisible) {
                const closed = await page.evaluate((sel) => {
                  const r = document.querySelector(sel.rail).getBoundingClientRect();
                  return { x: Math.round(r.x), w: Math.round(r.width) };
                }, SEL);
                if (closed.x + closed.w > 1) found.push(`the drawer is already on screen before it is opened (x ${closed.x}, width ${closed.w})`);

                await press(page, page.locator(SEL.toggle), device.kind);
                await page.waitForTimeout(650);
                const opened = await page.evaluate((sel) => {
                  const rail = document.querySelector(sel.rail);
                  const r = rail.getBoundingClientRect();
                  const cs = getComputedStyle(rail);
                  // What is actually on top at the drawer's own left edge? If the drawer is behind the
                  // text, a reader taps the article instead of a link and the drawer "does not work".
                  const probe = document.elementFromPoint(Math.max(2, Math.min(r.x + 24, innerWidth - 2)), Math.round(r.y + Math.min(80, r.height / 2)));
                  return {
                    x: Math.round(r.x), w: Math.round(r.width), visibility: cs.visibility, opacity: cs.opacity,
                    expanded: document.querySelector(sel.toggle)?.getAttribute('aria-expanded'),
                    topmost: probe ? `${probe.tagName.toLowerCase()}${probe.className ? `.${String(probe.className).split(' ')[0]}` : ''}` : null,
                    inRail: probe ? Boolean(probe.closest(sel.rail)) : false,
                    links: rail.querySelectorAll('a').length,
                  };
                }, SEL);
                if (opened.x > 1) found.push(`tapping the contents button did not bring the drawer on screen: it is at x ${opened.x}`);
                if (opened.visibility === 'hidden' || opened.opacity === '0') found.push(`the drawer moved on screen but is ${opened.visibility}/${opened.opacity}`);
                if (opened.expanded !== 'true') found.push(`the contents button reports aria-expanded="${opened.expanded}" after being pressed`);
                if (opened.links === 0) found.push('the drawer opened with no links in it');
                if (opened.x <= 1 && !opened.inRail) found.push(`the drawer is on screen but something else is on top of it: a tap at its left edge lands on ${opened.topmost}`);

                // A drawer owes the reader more than opening. These three were all missing, and their
                // absence is what "the sidebar does not work" meant: the reader opens it, changes their
                // mind, taps the article, and nothing happens.
                const dressing = await page.evaluate((sel) => {
                  const scrim = document.querySelector(sel.scrim);
                  const r = scrim && !scrim.hidden ? scrim.getBoundingClientRect() : null;
                  return {
                    scrim: Boolean(r) && Math.round(r.width) >= innerWidth && Math.round(r.height) >= innerHeight,
                    locked: getComputedStyle(document.documentElement).overflow === 'hidden',
                    focusInside: Boolean(document.activeElement?.closest(sel.rail)),
                  };
                }, SEL);
                if (!dressing.scrim) found.push('the drawer opened with nothing over the page behind it, so there is nothing to tap to dismiss it and no sign the page is waiting');
                if (!dressing.locked) found.push('the page behind the open drawer still scrolls, so a swipe meant for the contents moves the article instead');
                if (!dressing.focusInside) found.push('opening the drawer left focus outside it, so a keyboard or screen-reader user is still in the article');

                // Tapping outside must dismiss it. This is the one a reader tries first.
                const outsideX = Math.min(width - 8, Math.round(width * 0.92));
                const outsideY = Math.round(page.viewportSize().height * 0.6);
                if (device.kind === 'touch') await page.touchscreen.tap(outsideX, outsideY);
                else await page.mouse.click(outsideX, outsideY);
                await page.waitForTimeout(650);
                const afterOutside = await page.evaluate((sel) => {
                  const r = document.querySelector(sel.rail).getBoundingClientRect();
                  return { x: Math.round(r.x), w: Math.round(r.width) };
                }, SEL);
                if (afterOutside.x + afterOutside.w > 1) found.push(`tapping outside the drawer did not close it (x ${afterOutside.x}); a reader who changes their mind is stuck with it over the text`);

                // And following a link must close it, go somewhere, and leave the page scrollable.
                await press(page, page.locator(SEL.toggle), device.kind);
                await page.waitForTimeout(650);
                if (opened.links > 0) {
                  const link = page.locator(`${SEL.rail} a`).first();
                  await press(page, link, device.kind);
                  await page.waitForTimeout(650);
                  const closedAgain = await page.evaluate((sel) => {
                    const r = document.querySelector(sel.rail).getBoundingClientRect();
                    return { x: Math.round(r.x), w: Math.round(r.width), hash: location.hash, locked: getComputedStyle(document.documentElement).overflow === 'hidden' };
                  }, SEL);
                  if (closedAgain.x + closedAgain.w > 1) found.push(`following a link left the drawer open over the text (x ${closedAgain.x})`);
                  if (!closedAgain.hash) found.push('following a link in the drawer did not navigate anywhere');
                  if (closedAgain.locked) found.push('the page was left locked after the drawer closed, so nothing scrolls any more');
                }
              }
            }

            // --- anything that pops over the text must stay on screen ---
            phase = 'the glossary-popover phase';
            why = `What would satisfy this: every term on the page is pressed and its popover measured, 90 ms apart, and the count is printed on the load's own line. ${SUITE_BUDGET_MS} ms bounds the whole walk; a failure inside it names the term it was reading, because the loop builds that label for its own messages.`;
            const terms = await runPhase(SUITE_BUDGET_MS, () => page.locator(SEL.term).count());
            counts.terms = terms;
            if (expect.terms && !terms) found.push(`nothing matches ${SEL.term} on this chapter page, so no glossary popover was opened`);
            if (terms) {
              // EVERY term, not a sample. The first version checked only the first and the last, and the
              // definition that hung off the left edge belonged to term 15 of 31: a term in the middle
              // of a line is the one the popover cannot be flipped to fit, because it is wider than the
              // space on either side of it. A gate that samples the ends cannot see the middle. Each
              // message names the term by its place and its text, because "the last" was said of every
              // term but the first.
              for (let which = 0; which < terms; which += 1) {
                const t = page.locator(SEL.term).nth(which);
                const text = ((await t.textContent()) || '').trim().slice(0, 24);
                const label = `term ${which + 1} of ${terms} ("${text}")`;
                await t.scrollIntoViewIfNeeded();
                await press(page, t, device.kind);
                await page.waitForTimeout(90);
                const pop = await page.evaluate((sel) => {
                  const p = document.querySelector(sel);
                  if (!p) return null;
                  const r = p.getBoundingClientRect();
                  return {
                    left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
                    overRight: Math.round(r.right - innerWidth), overLeft: Math.round(-r.left),
                  };
                }, SEL.pop);
                if (!pop) {
                  found.push(`tapping glossary ${label} opened no definition (nothing matches ${SEL.pop})`);
                } else {
                  if (pop.overRight > 1) found.push(`a glossary definition hangs ${pop.overRight} px off the right edge (${label}, width ${pop.width} in a ${width} px viewport)`);
                  if (pop.overLeft > 1) found.push(`a glossary definition hangs ${pop.overLeft} px off the left edge (${label})`);
                }
                // Close it before reaching for the next term: an open definition covers the line below it,
                // and the next tap then waits for a target it can never hit.
                await page.keyboard.press('Escape');
              }
            }

            // --- one column, one set of edges ---
            phase = 'the text-column phase';
            why = `What would satisfy this: two evaluates that read the rendered boxes of the prose and the wide figures, and compare their edges. ${SUITE_BUDGET_MS} ms against reads that measure in single-digit milliseconds.`;
            // The blocks of a chapter should line up. They did not: the opener sat outside the text
            // column so its title ran 38 px past the prose, the hero figure's breakout landed 38 px past
            // every other wide figure, and `--measure: 66ch` resolved against each element's own font,
            // so a small-caps label and body prose ended 88 px apart on the same page.
            const cols = await runPhase(SUITE_BUDGET_MS, () => page.evaluate((sel) => {
              const main = document.querySelector(sel);
              if (!main) return null;
              const round = (n) => Math.round(n);
              const prose = [];
              const wide = [];
              const proseSel = '.tb-text > section > p, .tb-text > section > ul, .tb-text > section > h2, .tb-text > section > tb-key, .tb-opener > h1';
              for (const el of main.querySelectorAll(proseSel)) {
                const r = el.getBoundingClientRect();
                if (r.width < 40) continue;
                prose.push({ what: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0] || ''}`, l: round(r.left), r: round(r.right) });
              }
              for (const el of main.querySelectorAll('[data-width="wide"]')) {
                const r = el.getBoundingClientRect();
                if (r.width < 40) continue;
                wide.push({ what: `${el.tagName.toLowerCase()}#${el.id || ''}`, l: round(r.left), r: round(r.right) });
              }
              return { prose, wide };
            }, SEL.main));
            counts.column = Boolean(cols);
            if (expect.column && !cols) found.push(`nothing matches ${SEL.main} on this chapter page, so the text column's edges were not measured`);
            if (cols) {
              counts.prose = cols.prose.length;
              counts.wide = cols.wide.length;
              if (expect.column && cols.prose.length < 2) found.push(`only ${cols.prose.length} prose block(s) inside ${SEL.main} on this chapter page, so there are no edges to compare`);
              for (const [name, group] of [['the text column', cols.prose], ['the wide figures', cols.wide]]) {
                if (group.length < 2) continue;
                const lefts = [...new Set(group.map((g) => g.l))].sort((a, b) => a - b);
                const rights = [...new Set(group.map((g) => g.r))].sort((a, b) => a - b);
                if (lefts.length > 1) found.push(`${name} does not share one left edge: ${lefts.join(', ')} (${group.filter((g) => g.l !== lefts[0]).slice(0, 3).map((g) => `${g.what} at ${g.l}`).join('; ')})`);
                if (rights.length > 1) found.push(`${name} does not share one right edge: ${rights.join(', ')} (${group.filter((g) => g.r !== rights[0]).slice(0, 3).map((g) => `${g.what} at ${g.r}`).join('; ')})`);
              }
            }

            // --- on a wide screen the book uses the width it has ---
            // The owner, reading this book on a desktop: *"You are not taking advantage of the full width
            // the page, especially on desktop."* Measured, that was a defect: the text column was one
            // fixed 43.6rem measure — 698 px at 1280, at 1440 and at 1920 — so the wider the window, the
            // smaller the share of it the book used, 36% at 1920 with 1222 px dead. The ladder of
            // `@media (min-width: …)` rungs in tongjian/zj.css fixed it and nothing checked it, so a
            // return to one measure would ship unseen.
            //
            // The quantity is the SHARE of the viewport, not the measure in characters. The accepted trade
            // for this book is recorded as 43 Han characters to a line at 1920 px against a comfortable
            // band of 28–36 and a practical ceiling of 40, kept deliberately because one measure must serve
            // every prose block on the page — the edge check above is why prose cannot be capped on its
            // own — and written down in docs/work/4_zizhi-tongjian/restructure.md. A line-length floor here
            // would contradict that decision, and it is the wrong instrument besides: the pair of columns
            // is what a reader sees using the screen or not. (Walking the rendered line boxes of ch02's
            // prose on the shipped ladder gives 52–56 characters at 1920, not 43 — out/widthgate/
            // probe-prose.mjs — so that paragraph's number was taken on an earlier state of the ladder.
            // Whether the measure is now longer than the owner accepted is his question, not this gate's.)
            const pairedPage = PAIRED_BOOKS.includes(String(pageDef.id).split('/')[0]) && shapeOf(pageDef) === 'chapter';
            const inBand = width >= WIDE_FROM && width <= WIDE_TO;
            const geom = await page.evaluate((sel) => {
              // A tenth of a pixel, not a whole one: the share below is a ratio, and rounding 697.6 px to
              // 698 before dividing by 1920 reports 36.4% where the defect it is for is recorded as 36.3%.
              const box = (el) => {
                const r = el.getBoundingClientRect();
                return { w: Math.round(r.width * 10) / 10, l: Math.round(r.left), r: Math.round(r.right) };
              };
              const pair = document.querySelector(sel.pair);
              const text = document.querySelector(sel.text);
              const rows = pair ? [...pair.querySelectorAll(sel.row)] : [];
              return {
                pair: pair ? box(pair) : null,
                text: text ? box(text) : null,
                rows: rows.length,
                cells: rows.filter((r) => r.querySelector(sel.src) && r.querySelector(sel.tr)).length,
              };
            }, SEL);
            const share = (w) => Math.round((w / width) * 1000) / 10;
            if (geom.text) counts.share = share(geom.text.w);
            if (geom.pair) counts.pair = share(geom.pair.w);
            // Every page reports what its reading column measures, whether or not the floor applies to it.
            // "no width floor" over a page that was never measured is the shape of a check that did not
            // run, and the bound this file's header states — that a biology chapter is 36.3% of 1920 and is
            // not judged — is then a number the run printed rather than a number remembered. The floor's
            // own name is spelled out wherever it is mentioned, and so is whether it was exercised on this
            // load: `was NOT exercised` on the line is what tells a reader of a trimmed run that the
            // clean run in front of them never compared a width, which the share alone cannot say.
            const FLOOR = `the ${MIN_WIDE_SHARE}% reading-column floor`;
            const WOULD_REACH = `a ${WIDE_FROM}–${WIDE_TO} px viewport, which in this matrix is ${IN_BAND_DEVICES.map(describeDevice).join(' and ')}`;
            counts.width = !geom.text
              ? `nothing matches ${SEL.text}`
              : geom.pair
                ? `reading column ${counts.share}% and pair ${counts.pair}% of ${width} px`
                : `reading column ${counts.share}% of ${width} px, no paired columns on this page`;
            if (pairedPage) {
              // The pairing is not a wide-screen property: it is there at every width, stacked on a
              // phone, so finding none of it is a failure at every width, not only inside the band.
              if (!geom.pair) {
                found.push(`nothing matches ${SEL.pair} on ${pageDef.id}, a chapter of a book that sets the 原文 against its 譯文 in paired columns, so no pair of columns was measured`);
                counts.width = `nothing matches ${SEL.pair}`;
                floor = 'not reached: no pair of columns to measure';
              } else if (!geom.cells) {
                found.push(`${SEL.pair} holds ${geom.rows} ${SEL.row}(s) and none with both ${SEL.src} and ${SEL.tr}, so there is no pair of columns to measure the width of`);
                counts.width = `${geom.rows} ${SEL.row}(s), no complete pair`;
                floor = 'not reached: no complete pair of columns';
              } else if (!geom.text) {
                found.push(`nothing matches ${SEL.text} on ${pageDef.id}, so the reading column's width was not measured`);
                floor = 'not reached: no reading column to measure';
              } else if (inBand) {
                const floorText = `at least ${MIN_WIDE_SHARE}% of a ${WIDE_FROM}–${WIDE_TO} px viewport`;
                if (counts.share < MIN_WIDE_SHARE) found.push(`the reading column is ${geom.text.w} px of a ${width} px viewport — ${counts.share}%, under the ${floorText} this book is built to use — so the page is not using the width it has`);
                if (counts.pair < MIN_WIDE_SHARE) found.push(`the 原文/譯文 pair of columns is ${geom.pair.w} px of a ${width} px viewport — ${counts.pair}%, under the ${floorText} this book is built to use`);
                floor = 'exercised';
                counts.width += `, and ${FLOOR} applied here`;
              } else {
                floor = `not exercised: this load is ${width} px, outside the ${WIDE_FROM}–${WIDE_TO} px band`;
                counts.width += `, and ${FLOOR} was NOT exercised — it applies to ${WOULD_REACH}, and this load is ${width} px`;
              }
            } else {
              floor = `not exercised: ${pageDef.id} is not a chapter of ${PAIRED_BOOKS.join(', ')}`;
              counts.width += `, and ${FLOOR} was NOT exercised — it belongs to a chapter of ${PAIRED_BOOKS.join(', ')} (${FLOOR_PAGES.join(', ')}), not to this page`;
            }

            // --- the capture, and the one phase whose old message was actively misleading ---
            //
            // This call is a screenshot, a font wait and an all-frames evaluate under one Playwright
            // timeout, so its own failure string says "screenshot" for a stall in any of the three
            // (coreBundle.js:20857 screenshotPage, :20912 the prepare, :20916 `document.fonts.ready`).
            // The font wait is now asked for above, by name; what is left under this budget is the
            // prepare evaluate and the raster capture. The budget is local-sized on purpose: over 68
            // measured rounds at the shape this gate used to fail on, the capture ran 68–3348 ms with a
            // median of 107–185, so 45 s is 13.4 times the worst one ever recorded, while the phases
            // above — which wait on the network and the renderer's start-up — keep the 120 s they had.
            phase = 'the capture (`page.screenshot`: the all-frames prepare evaluate and the raster capture — the font wait is the phase above, not this one)';
            why = `What would satisfy this: the screenshot has to return within ${CAPTURE_BUDGET_MS} ms. Measured on this tree, 68 rounds of this call at 750x342 with deviceScaleFactor 3 took 107-185 ms at the median and 3348 ms at the worst (out/devtime/README.md), so a budget firing here is not a slow render — it is the renderer or the browser process not answering at all, and the shape is not the cause (a 5.18 MP desktop capture measured 620 ms at its worst). Raising this number is not the fix; a run that reaches it has a browser to diagnose.`;
            await runPhase(CAPTURE_BUDGET_MS, () => page.screenshot({ path: `${OUT}/${engine.id}-${device.id}-${pageName}-${theme}.png`, fullPage: false, timeout: CAPTURE_BUDGET_MS }));
          } catch (err) {
            // The load failed, and the message has to say WHERE. Every phase above sets `phase` and `why`,
            // so a Playwright rejection — `page.screenshot: Timeout 45000ms exceeded`, whose own words name
            // the API call rather than the wait inside it — is reported with the phase it happened in
            // wrapped around it. `runPhase`'s own messages already carry both, so they are not wrapped
            // twice. This is the whole point of the change: the failure that started it was recorded as a
            // screenshot timeout, and a screenshot is three waits that report identically
            // (coreBundle.js:20916 the font wait, :20912 the prepare, :44556 the capture).
            const line = err.message.split('\n')[0];
            found.push(line.startsWith(PHASE_TIMEOUT_FLAG) ? line.slice(PHASE_TIMEOUT_FLAG.length) : `${line} — thrown while this load was in ${phase}. ${why}`);
          }
          for (const e of errors) found.push(e);
          loads += 1;
          report.push({ engine: engine.id, device: device.id, page: pageDef.id, theme, floor, counts, problems: found });
          for (const p of found) problems.push(`${where}: ${p}`);
          const measured = [
            `${counts.controls} header control(s)`,
            counts.drawer ? 'the drawer' : 'no drawer',
            `${counts.terms} term(s)`,
            counts.column ? `${counts.prose} prose block(s), ${counts.wide} wide` : 'no text column',
            // The width floor applies to one book in a band of widths; a load outside it says so rather
            // than saying nothing, because `0 width(s)` is the shape of a check that did not run.
            counts.width,
          ].join(', ');
          console.log(`${found.length ? 'FAIL' : 'ok  '} ${where}${found.length ? ` (${found.length})` : ''}: ${measured}`);
          for (const p of found) console.log(`  ${p}`);
          await page.close();
        }
        await context.close();
      }
    }
    } finally {
      await browser.close();
      browser = null;
    }
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

// A run that loaded nothing is `tools/lib/trim.js`'s failure one level up, and that file cannot see it:
// each variable names something that exists, and the two lists still meet in no load at all. `DEVICE_ONLY`
// can only be checked against the device list and `DEVICE_ENGINES` against the engine list, so the empty
// cross-product is invisible from either side. It is not a hypothetical: the secondary engines run the two
// shapes either side of the drawer breakpoint over two pages (CROSS_PAGES above and `crossOf`), so a WebKit
// run over a 資治通鑑 chapter names three valid engines and a valid page and runs neither, printing
// "0 load(s) … all clean".
if (!loads) {
  const engineNames = engines.map((e) => e.id).join(', ');
  const pageNames = pages.map((p) => p.id).join(', ');
  console.error(`
FAIL: this run loaded no page at all, so not one check in this file ran, and "all clean" over zero loads is the shape of a gate that did not run. DEVICE_ENGINES=${engineNames} and DEVICE_PAGES=${pageNames} meet in no load: chromium loads every shape a page needs, and each other engine loads the two shapes either side of the drawer breakpoint over ${CROSS_PAGES.join(' and ')} only (CROSS_PAGES and crossOf in tools/devices.js). What would satisfy this: name an engine and a page that meet, or drop one of the two variables.`);
  process.exit(1);
}

// Report what actually ran, not what was configured. This line used to print `wanted.length` — the
// configured device list, not the run — so a WebKit-only run over two shapes announced "across 9 devices".
// The same overstatement is still available from the derived matrix or from DEVICE_ONLY, so it is computed
// from `report`, which is what ran. A gate that overstates its own coverage is the same failure as a gate
// that checks nothing, one step later.
const ran = new Set(report.map((r) => `${r.engine}/${r.device}`));
const engineIds = [...new Set(report.map((r) => r.engine))].join(", ");
const pageCount = new Set(report.map((r) => r.page)).size;
const ranDevices = [...new Set(report.map((r) => r.device))].map((id) => DEVICES.find((d) => d.id === id)).filter(Boolean);
const coverage = `${loads} load(s) over ${ran.size} engine-device pair(s) (${engineIds}) on ${pageCount} page(s)${named.length ? `, DEVICE_ONLY=${named.map((d) => d.id).join(',')} — the derived matrix is off for this run` : ''}`;

// Which pages this run judged, and which pages of the tree it did not. A run scoped by DEVICE_PAGES proves
// those pages and no others, and a green summary that does not say so reads as a repository-wide verdict:
// the session of 2026-09-19 had a scoped green in front of it and had to work the scope out by hand from
// the page ids in the load lines. So the summary names the pages that were judged and, when the tree holds
// pages this run never loaded, names those and says they were outside it. The engines are the second way to
// fall outside — only Chromium carries every page — and the same sentence carries that too.
const judged = [...new Set(report.map((r) => r.page))];
const outside = PAGES.filter((p) => !judged.includes(p.id)).map((p) => p.id);
const scope = pages.length < PAGES.length
  ? `DEVICE_PAGES selected ${pages.map((p) => p.id).join(', ')}`
  : `DEVICE_ENGINES selected ${engines.map((e) => e.id).join(', ')}, and only ${ENGINES.filter((e) => e.full).map((e) => e.id).join(', ')} loads every page`;
const pagesLine = outside.length
  ? `judged ${judged.length} of the tree's ${PAGES.length} page(s): ${judged.join(', ')}. OUTSIDE THIS RUN, so this is not a repository-wide verdict: ${outside.join(', ')} — ${scope}`
  : `judged every page in the tree (${PAGES.length}): ${judged.join(', ')}`;

// Did the width floor run, and if not, what would have made it run? The per-load line carries the same
// answer for its own page; this line carries it for the run, because a reader of the summary — which is
// what a trimmed run is read for — has only this. The floor is not a failure when it does not apply, so
// this never touches the exit status: it is a report, in the run's own summary, of a check that had
// nothing to measure. Both sentences name the widths, because "wider" is not an instruction.
const floorRan = report.filter((r) => r.floor === 'exercised');
const floorDevices = [...new Set(floorRan.map((r) => describeDevice(DEVICES.find((d) => d.id === r.device) ?? { use: {} })))];
const floorPages = [...new Set(floorRan.map((r) => r.page))];
const floorLine = floorRan.length
  ? `the ${MIN_WIDE_SHARE}% reading-column floor WAS exercised on ${floorRan.length} of ${loads} load(s) — ${floorDevices.join(', ')} over ${floorPages.join(', ')}`
  : `the ${MIN_WIDE_SHARE}% reading-column floor was NOT exercised by this run, and a floor that did not run is not a floor that passed. It applies to ${FLOOR_PAGES.join(', ')} at a ${WIDE_FROM}–${WIDE_TO} px viewport, which in this matrix is ${IN_BAND_DEVICES.map(describeDevice).join(' and ')} — ${
    !pages.some((p) => FLOOR_PAGES.includes(p.id))
      ? `no chapter of ${PAIRED_BOOKS.join(', ')} was in this run (DEVICE_PAGES selected ${pages.map((p) => p.id).join(', ')})`
      : !ranDevices.some(isInBand)
        ? `no device this run loaded is that wide (it loaded ${ranDevices.map((d) => d.id).join(', ') || 'none'}${named.length ? `, because DEVICE_ONLY named ${named.map((d) => d.id).join(', ')}` : ''})`
        : `both were selected, and the engines are why it did not run: only ${ENGINES.filter((e) => e.full).map((e) => e.id).join(', ')} carries the full device matrix, and the others load the two shapes either side of the drawer breakpoint over ${CROSS_PAGES.join('/')} only`
  }`;

if (problems.length) {
  console.error(`
FAIL: ${problems.length} problem(s) over ${coverage}; see ${OUT}/report.json
pages:   ${pagesLine}
floor:   ${floorLine}`);
  process.exit(1);
}
console.log(`
devices: ${coverage}, all clean; screenshots in ${OUT}/
pages:   ${pagesLine}
floor:   ${floorLine}`);
