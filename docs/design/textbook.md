# Textbook — design of record

Status: **prototype**. Chapter 1 of the biology book exists; every other chapter is an outline. Decisions marked **[owner]** came from the owner's request and are not open for an agent to reverse without asking.

## The pitch

A textbook that reads like a beautifully set book and behaves like a laboratory. The prose is the spine. Every figure is either an authored illustration, a diagram that moves to explain itself, a small simulation the reader can push on, or a 3D model the reader can turn over in their hands. Nothing is a stock image, and nothing needs a build step to run.

## What the owner asked for **[owner]**

Web-based, interactive, biology first, with beautiful type, illustrations, 3D models, and animations. The first chapter is the prototype that proves the shape of every later one.

## Shape of the site

```text
index.html                         # the library: every book
biology/index.html                 # the book: units and chapters
biology/ch01-what-is-life/         # one chapter: its page, and the data beside it
  index.html
  glossary.js                      # the terms it introduces
  objectives.js                    # the claims a reader should be able to make, and their prerequisites
  items.js                         # the review item bank the study queue draws on
src/                               # shared code: shell, components, figures, styles
  shell.js                         # header, chapter navigation, progress, theme
  palette.js                       # the colour tokens as JS, for canvas and WebGL
  components/                      # custom elements the prose is written with
  figures/                         # one module per interactive figure, plus the registry
  styles/                          # tokens, typography, layout, components
tools/                             # the gates and the dev server
test/                              # node --test over the pure modules and the checkers
```

One HTML page per chapter, hand-authored. There is no router and no client-side content loading: a chapter is a document, so it deep-links, prints, and works with the browser's own find and reader modes. The shared chrome is mounted by `src/shell.js` from a `<tb-shell>` element so no chapter repeats it.

No bundler, no transpiler, no framework. ES modules load straight from source; Three.js loads from a pinned CDN copy through an import map (`three`, `three/addons/`, version 0.185.1, the version `../scenes` has proven in this fleet). This is the fleet's habit and it keeps the repository a set of files anyone can read.

Later books get a sibling folder (`chemistry/`, `physics/`) and reuse everything in `src/`.

## Typography

Type is the first thing the owner asked for, so it gets the first budget.

| Role | Family | Why |
|---|---|---|
| Display: chapter titles, section headings, pull numbers | **Fraunces** (variable: optical size, weight, softness) | An old-style soft serif with real optical sizes, so a 64px title and a 24px heading are drawn differently rather than scaled. |
| Text: body, captions' prose | **Newsreader** (variable: optical size, weight) | A text serif designed for long reading on screens, with an optical-size axis so small captions stay open. |
| Interface: navigation, labels inside figures, controls, tables of data | **Inter** (variable) | A neutral sans that stays legible at 11px inside a diagram and carries tabular figures. |
| Greek and symbols: α, ₂, →, ⇌ | **Libertinus Serif**; **Noto Sans Math** behind Inter | Subsets that draw what the three families are not served with, at Newsreader's x-height and stroke, measured on the rendered page. See below. |

Loaded from Google Fonts with `display=swap`, restricted to the axes and weights used, and every role has a fallback stack (`Iowan Old Style`, `Palatino`, `Georgia`; `system-ui`) so the page is readable before and without the webfonts. Vendoring the files was considered and deferred: the three families total more than the fleet's 256 KiB blob ceiling per weight set, and a runtime font request is the same class of dependency as the Three.js CDN the page already has.

Measure and rhythm: body text is 1.2rem (19.2px at the default root) on a 1.55 line height, in a column of at most 66 characters. Headings and figures sit on a 0.4rem baseline grid. The chapter opener carries a drop cap; section labels use small caps with letter spacing at one tracking (0.14em) across the whole book, so every rubric reads as one voice; numerals in prose are old-style (`font-variant-numeric: oldstyle-nums`) and in tables tabular and lining.

Hanging punctuation is stated, not requested. `hanging-punctuation: first last` stays on the body for Safari, but Chromium — the browser the gates use and most readers have — ignores it, so a displayed quotation hangs its opening mark with a negative `text-indent` and a figure's number hangs with `padding-left` plus a negative `text-indent`. A book's optical left edge is not something to leave to a property one engine implements.

Italics come from the face that has them. Fraunces is requested with the axes `opsz,wght,SOFT,WONK` and no `ital`, so `font-style: italic` on the display face is a browser-synthesised slant, and `document.fonts.check('italic 400 24px Fraunces')` answers `true` for it — the check counts a synthesised face as available, which is how the blockquote went a whole pass in faux italic. Newsreader is requested with `ital` and its italic is drawn. Anything italic in this book is therefore set in Newsreader, including displayed quotations and the `<em>` inside a question.

Greek and symbols come from faces chosen for them. Google serves Newsreader and Fraunces with no Greek block, no arrows and no sub- or superscript figures beyond ¹²³, and Inter without its own arrows, superiors and ◀▶, so every α, ₂, → and ⇌ in the book was drawn by whatever the reader's machine offered — Palatino Linotype, Segoe UI Symbol and Cambria Math on Windows, a different set on every other platform — measured per glyph with `CSS.getPlatformFontsForNode`. The stacks in `tokens.css` name Libertinus Serif after Newsreader and Fraunces, for the Greek, the sub- and superscripts, the arrows and ⇌, and Noto Sans Math after Inter for the ⇌ Inter lacks. A relation Libertinus lacks falls to the machine's serif; none is used in the book today, and the page-wide census that proved no system-font glyph remains is the check to re-run when one is. Libertinus was chosen by measurement rather than by eye: at six device pixels per CSS pixel on the rendered chapter 2, its α stands 52 px against Newsreader's a and o at 51, and its side strokes are 9 and 8 px against o's 9 and 9, so the Greek sits in the line rather than on it. STIX Two Text, the first choice, is a tenth taller (ο 56 px against o 51) and reads as a large α; `font-size-adjust: ex-height from-font` cures the height but thins every fallback glyph, ⇌ and the superscript minus included, by the same tenth; and eleven more Greek-carrying serifs on Google Fonts were measured the same way, the variable ones at 300 and 350 as well, and none of them matched on both counts. Libertinus is served static, so the heads request 400 and 600 only and a bold Greek letter is the 600 that Newsreader's bold is; the book sets no Greek at 500 today, and a term or heading that did would get the 400. Every page head requests the Greek as Google's `greek` subset and the symbols as one `text=` subset shared by all heads, so a page fetches only the files a glyph on it needs — measured cold on 2026-09-16: 15 KB for the Greek and 8 KB for the serif symbols on chapter 2, 10 KB for Inter's arrows and triangles on any page whose figures use them, 8 KB for Noto Sans Math where an Inter label carries ⇌, and 2.4 KB more gzipped stylesheet on every page, over the 0.45–0.47 MB the three families cost before. A `<span lang="el">` convention was rejected because it depends on authors remembering.

The type scale is modular at 1.2 from 0.75rem to 4.3rem, held in `src/styles/tokens.css`, and every size in the site is one of its steps. The top step, `--text-6xl`, exists for one job: the title on a chapter's (or the library's, or a book's) opening page, which is the largest thing in the book and needs to be bigger than a section heading by more than one step.

## Colour

Warm paper, not white; near-black ink, not black. Light and dark themes are two sets of the same tokens, chosen by the system preference and overridable with the toggle in the header, remembered per browser.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--paper` | `#faf7f1` | `#15171a` | page background |
| `--ink` | `#1d1a17` | `#e9e4da` | text |
| `--ink-soft` | `#5c554d` | `#a39d93` | captions, secondary text |
| `--rule` | `#e3ddd2` | `#2c3036` | hairlines |
| `--leaf` | `#2f7d4f` | `#5fb37f` | primary accent: links, section numbers, live states |
| `--water` | `#2a7f8f` | `#5cb5c4` | secondary accent |
| `--coral` | `#d9663d` | `#ef8a63` | warm accent: attention, membranes |
| `--violet` | `#6b4fa0` | `#a58ad8` | DNA, information |
| `--gold` | `#c9a227` | `#e0bc4a` | highlights, marks |

Every diagram, canvas, and 3D material takes its colour from these tokens through `src/palette.js`, so a figure and the prose around it are always the same picture. The organelle colours used by both the 2D diagrams and the 3D cell are one table (`ORGANELLES` in `palette.js`), so the reader learns one colour per organelle across the whole chapter. The element colours the molecular figures share are likewise one table, `ELEMENTS` in `src/figures/lib/chem-atoms.js`, naming a palette token per element; every helper that draws an atom derives its colours from it, and `test/element-table.test.js` fails when a second table appears or when either drifts from the chapter's stated colour table.

A chapter that needs colours the book has not used yet adds **roles built from the tokens, never a new hue**: the structures chapter 3 draws are `EXTRA_ORGANELLES` in `src/figures/lib/cell3-colours.js`, and the membrane seen close up — the sheet's own parts, the three protein roles that move things across it, and the sugar they carry — is `MEMBRANE` in `palette.js`, shared by chapters 4, 5 and 7. Every colour in both is a `mix()` of two colours the book already has, so the palette moves them with it, and each entry names the token a symbol written on the fill must take, which is whichever of `paper` and `ink` holds AA against it. Ions are the case where colour is deliberately not the difference: every ion takes `leaf` and is told from the next by the symbol written on it and by its ionic radius, both of which `ELEMENTS` carries. None of these derived colours is written into `tokens.css`; the stylesheet and `palette.js` hold one table between them, the paper, the ink and the five accents, and a derived colour copied into CSS would be a second copy that no test compares.

Two more colours are derived in CSS and are deliberately not in `palette.js`, because nothing draws with them: `--leaf-text`, `--water-text` and `--coral-text` (the accents pushed towards the ink so they hold AA at 12px), and `--rule-head`, the structural rule that opens a chapter, a question, a sorting activity, a column of bins and the end matter. `--rule-head` is `--ink` on paper; on the dark paper a 2px line of `--ink` is the brightest thing on the screen, so there it is mixed 68% back towards the paper to read with the weight a black rule has on white.

Contrast holds at WCAG AA for text in both themes, and the palette was chosen so the five accents remain distinguishable under the common forms of colour-vision deficiency; no figure encodes meaning in colour alone.

## Layout

Three regions on a wide screen: a sticky chapter navigation rail on the left, the text column in the centre, and a margin on the right for asides and figure notes. Below 1400px the margin folds into the text column as inset notes; below 800px the rail becomes a drawer behind a button and the page is a single column.

Figures come in three widths, chosen by an attribute: `text` (the measure), `wide` (breaks out to 1100px), and `bleed` (edge to edge). A reading-progress bar sits under the header, and the rail marks the section in view.

**One spread, one set of edges.** At 1400px and above, the text column's right edge plus the gutter plus the margin column is the *spread*: every wide figure, every margin note and the chapter opener's head rule end on that one line. Below 1400px the spread is whatever the rail leaves, and the same three things still share it. `tools/devices.js` holds the text column and the wide figures to one left and one right edge each; the rest is held by using one expression for the spread's width wherever it is needed.

## Furniture

The prose's furniture — the checks, the sorting activity, the key ideas, the property list, the glossary, what comes next, the chapter opener — is set with **rules, space, indentation and changes of face**, never with boxes. There is one drawn rectangle in the book, `.tb-figure__stage`, and a reader learns that it means *an instrument, with something live inside it*: a figure, its own controls, a 3D scene. The popover a glossary term opens is the one other framed thing, because it floats over the page and has to declare its own extent.

This is the rule that was missing when every piece of furniture was a rounded rectangle with a hairline: a bordered card holding four bordered rows each holding an outlined circle read as an application's form, not as a question in a textbook, and a box makes its own emptiness visible in a way a rule does not.

The rule covers the study page (`today/`, set by `src/styles/learning.css`) as well as the chapters; it was brought there on 2026-09-16, five days after the chapters, when a review found it still holding the shape described above. Its objects: the page opens the way the library, a book and a chapter open, with the 2px head rule, "Today" hanging under it and the title at the top of the scale. Where you stand, the sitting and that sitting are three blocks of furniture, each opened by a 1px `--rule-head` and a label in the book's one small-caps voice, with the sitting's name and the question's count ("1 of 6 · explain · multiple choice") as the two ends of one running line. A question in a sitting is the chapter's `<tb-check>` object — the question a step above the prose, the letters hanging, a hairline between answers, tint plus letter plus mark on the verdict — and a figure task's goal is set the same. The per-objective marks are a glyph and a word, never a chip; the summary lists are ruled, one objective to a line; the list of chapters a sitting draws from is a ruled list. The controls are the sorting activity's one hairline box — square, tracked capitals, the paper showing through — with the primary control told by `--rule-head` on its edge and the ink's weight, not by a fill, and the three ways to mark a written answer sharing one divided box. Two things on the page are drawn: the figure stage a figure task mounts, which is the one rectangle, and the field a written answer is typed into, which keeps a square hairline because it is an instrument with the reader's own words inside it.

The structural vocabulary, in order of weight:

| Mark | Means | Where |
|---|---|---|
| 2px `--rule-head` | a major division opens here | the chapter opener's head rule (which crosses the whole spread), the sorting activity, the end matter, what comes next |
| 1px `--rule-head` | a block of furniture opens here | a check, a bin's column head |
| 1px `--rule-strong` | a quiet division | a key idea's two rules, a margin note, a contents list |
| 1px `--rule` | one row from the next | a check's options, a glossary entry, a table row, a property |
| a tint (`--leaf-soft`, `--coral-soft`) | a state, always with a mark beside it | a right or wrong answer, a bin under a drag |

## Components

The prose is written in semantic HTML plus a small vocabulary of custom elements, each in `src/components/`.

| Element | What it does |
|---|---|
| `<tb-shell>` | Mounts the header, the navigation rail from the page's own headings, the progress bar, and the theme toggle. |
| `<tb-figure kind="cell3d" id="fig-cell" width="wide">` | The frame every interactive figure lives in: numbers itself, carries the `<figcaption>`, mounts its module lazily when near the viewport, and exposes its state to the gates. |
| `<tb-term ref="homeostasis">` | A glossary term: a dotted underline, a definition on hover or tap, and a link into the chapter glossary. |
| `<tb-aside>` | A margin note. |
| `<tb-key>` | A key-idea callout. |
| `<tb-check>` | A single multiple-choice question with an explanation that appears after answering, right or wrong. Set as a question on an exam paper: a rule, the question a step above the prose, the letters hanging to the left of the answers, a hairline between one answer and the next. |
| `<tb-sort>` | A sorting activity: items are placed into bins by drag, or by keyboard and tap, and each placement is explained. The tray is a ruled list one measure wide, one thing to a line with its three choices in a single hairline control at the right; the bins are three ruled columns across the spread, which show their extent with a dashed foot only while something is still waiting to be placed. |

Every interactive element is keyboard-operable and announces its result through a live region. Nothing depends on hover alone, and no verdict is carried by colour alone: a right answer takes a tint, a coloured letter and a ✓, a wrong one a tint, a coloured letter and a ✗.

**The opening page.** The library, a book and a chapter open the same way: a 2px head rule, a line of tracked capitals hanging under its left end, a sinkage, then the title at the top of the scale and alone. On a chapter, the right end of that line carries the chapter number; at 1400px and above the rule crosses the whole spread and the number leaves the line to become a folio in the margin column, set in the display face with its own baseline on the title's and right-aligned to the rule's far end. That is what fills the corner the opener used to leave empty, and the number is positioned rather than placed in the flow, because `tools/devices.js` holds `.tb-opener > h1` to the same left and right edge as every paragraph in the chapter.

**The glossary** is a two-column table of terms — the term hanging in its own column, every definition starting on one edge, a hairline opening each entry — so thirty-one entries can be scanned down rather than read through. Below 800px the term goes back above its definition.

**A figure's number hangs.** "Figure 1.2" sits on the figure's own left edge and the caption forms a block beside it, so a four-line caption is a block of text rather than a paragraph with a label stuck on the front. Below 800px the hang is a sixth of the screen, so the number goes back on the line.

**A displayed equation** is `<p class="tb-equation">`, the only class a chapter puts on a paragraph: centred in the measure, in the text face with lining figures because a formula is table-like, no indent, `--space-6` above and below rather than the paragraph gap so it reads as displayed, its sub- and superscripts on a fixed shift so the line box does not grow, and `white-space: nowrap` with its own horizontal scroll so a long equation moves inside its box on a phone instead of pushing the page sideways. The ⇌ is Libertinus Serif's, through the stack described under Typography.

## The figure contract

A figure is a module in `src/figures/<kind>.js` registered in `src/figures/registry.js`:

```js
export const meta = { kind: 'cell3d', title: 'An animal cell', needsWebGL: true, aspect: 16 / 10 };
export function mount(root, ctx) {
  // build into root (an empty <div> sized by the frame)
  // ctx = { palette, theme, reducedMotion, pinnedTime, onReady, onError }
  return {
    destroy() {},              // release everything: listeners, rAF, WebGL resources
    setTime(seconds) {},       // pin every animation clock, for deterministic gates
    describe() { return {}; }, // a small JSON of what the gates should know: draw calls, current view, states
    setVisible(bool) {},       // pause and resume the figure's own loop as it leaves and enters the viewport
    setTheme(theme, palette) {}, // optional: repaint in place; without it the frame remounts on a theme change
    setView(view) {},          // 3D only: { theta, phi, distance } for the camera sweep gate
  };
}
```

**A new 2D figure builds that object with `bench()` from `src/figures/lib/bench.js` rather than by hand.** The bench is a function called inside `mount` that returns exactly the object above; the frame is unchanged and knows nothing about it. It owns the wrapper, the grid of measured panes, the narrow switch, the `ResizeObserver` and the redraw after `document.fonts.ready`, every control and its accessible name, the live region, the clamped SVG primitives, the readout's typographic register, the seeded generator and the handle — about a fifth of a figure, and the fifth that a checklist currently has to hold. It adds one field to `describe()`, `layout`, and spreads it last the way the frame spreads its four. Its chrome's CSS lives once in `src/styles/components.css` under *The figure bench*, not in a string per figure, so a design change is one edit rather than thirty-six. What it deliberately cannot do is draw a pill, a bordered box or a progress bar, or render a primary action as a fill. [figure-bench.md](figure-bench.md) is the design of record and the measurements behind it; `test/bench.test.js` holds the lint; `tools/figure-diff.js` is what makes migrating an already-accepted figure safe.

The registry (`src/figures/registry.js`) holds each kind's `url`, `title`, `needsWebGL`, `aspect`, and for a figure that can fill any shape (canvas, 3D) a `narrowAspect` the frame uses below 800px, so a phone gets a taller stage rather than a letterboxed strip.

The frame calls `mount` when the figure comes within 600px of the viewport, or immediately for every figure when the page URL carries `?eager=1`. It sets `data-state` to `loading`, `ready`, or `error` on the element and records every figure in `window.__textbook.figures[id]`, which is the handshake the gates wait on. `?t=<seconds>` pins every figure's clock through `setTime`, so a figure's state and drawing are the same every run. A screenshot's bytes are not: `tools/shot.js`'s header says why, and what the frames are for.

An ambient animation runs only while its figure is on screen and pauses otherwise. Under `prefers-reduced-motion` a figure still works, but nothing moves unless the reader moves it: autorotation stops, transitions become cuts, and simulations advance by the reader's input.

Every figure has a text alternative: the `<figcaption>` says what the figure shows, and `data-alt` on the frame carries a one-paragraph description of what a sighted reader would learn by interacting.

## 3D conventions

Three.js through the import map, one renderer per figure, device pixel ratio capped at 2, rendering only while on screen and only when something changed or an animation is running. Units are micrometres for cells and nanometres for molecules, and the camera's default view is stated in the module so the gates can return to it. Materials are physically based under one three-light rig per figure; every mesh has a `name`; procedural geometry computes its normals. Labels are HTML positioned from projected 3D anchors, so they stay crisp and selectable. A cross-section is a clipping plane, animated, never a second model. `destroy()` disposes geometries, materials, and the renderer.

## Motion

Motion explains or it does not happen. A transition in the interface is at most 400ms; a diagram animation has a reason the caption can state; an ambient animation is slow and never draws the eye off the text. Every clock is pinnable by `setTime`, so the gates see the same figure state and drawing every run, though not the same screenshot bytes (`tools/shot.js`'s header).

## Writing the content

A chapter's prose is the deliverable and reads as a book, not a slideshow. Sections are `<section id="1-2">` with an `<h2>`; numbering is automatic. Every term the chapter introduces is a `<tb-term>` and has a glossary entry in the chapter's `glossary.js`, which also renders the end-of-chapter glossary. Every figure is referred to in the prose by number. A chapter ends with key ideas, a glossary, five checks, and a look ahead to the next chapter.

Biology is stated as the field states it: current, sourced from standard undergraduate texts, and careful about hedges, so "all known life" rather than "all life" where that is what is known.

## Adaptive study

The book tracks what a reader has learned and what they are struggling with, and reorganises practice around it. That has its own design of record: [adaptive.md](adaptive.md). In brief, mastery is tracked per learning objective rather than per chapter, a pure scheduler in the browser decides what is due, and the agent's rounds do the part arithmetic cannot: diagnosing a misconception and writing against it. The prose is never hidden, locked or gated by it.

## Gates

The gates are the fleet's evidence, and each states its own bound in its header; `npm test` (`tools/test.js`) runs ten of them as separate processes, cheapest first, with no pipe anywhere, and stops at the first red one, naming it, and each is also runnable alone. `npm run unit` is `node --test` over `test/*.test.js`: the content checker on fixtures, the palette's two copies, the one element table, the registry against the modules on disk, the page list against the chapters on disk, the scheduler and the store, the trimming helper the gates share, and the homeostasis model. `npm run check` reads every page's authored HTML and the study data beside it — unique ids, a caption and a registered kind on every figure, every term resolving and every glossary entry used, one correct answer and an explanation per check, every figure cited in the prose, headings in order, no `TODO`, every question naming an objective the chapter declares, prerequisites that resolve without a cycle, at least three items per objective, and every figure task's `expect` read by the grader's own parser. `npm run shot` loads every page in headless chromium at phone, tablet and desktop widths in both themes with every figure mounted eagerly and the clock pinned, fails on any console error, page error, failed request, figure in the `error` state, horizontal overflow, or a figure caption whose word is not in the page's script, and writes `out/shots/` for a person to look at. `npm run flow` drives the reader controls on the chapter page through real mouse, keyboard and drag input (checks, sort, glossary popover, theme toggle, phone drawer) and asserts what they produce. `npm run drive` drives every figure's own controls in the lab the same way, one recipe per kind, asserting what `describe()` reports; a kind with no recipe fails, and so does one whose own `describe()` uses a name the frame owns, or one the frame holds no handle for. `npm run sitting` completes a study sitting on Today with the keyboard alone, from a cleared record, and requires that it reach its end summary, that the summary label each objective it names, and that no label claim more than the record supports. `npm run narrow` mounts every figure at a 390 px stage in both themes and fails one that draws nothing or loses its controls. `npm run devices` emulates nine devices with the input each one actually has, re-runs the two shapes either side of the drawer breakpoint on WebKit and Firefox, and fails a suite that finds none of its subject on a page that must have it. `npm run sweep3d` renders every 3D figure from fourteen views and one dark view and fails a bare canvas (overlays hidden) that is blank, black or flat. `npm run subpath` rebuilds the tree GitHub Pages publishes and loads every page under `/textbook/`. A trimming variable (`SHOT_PAGES`, `DRIVE_KINDS` and the rest) that names nothing that exists stops a gate rather than emptying it. Outside the chain: `npm run perf`, a diagnostic and not a gate because it measures the machine it runs on, and `npm run audit`, the dependency audit, re-run on any dependency change.

## Performance budget

A chapter's own JavaScript, excluding Three.js, stays under 250 KB. A chapter page with both 3D figures mounted renders at 60 frames a second on a laptop GPU; on a machine with no GPU the page still reads, because every figure has a static fallback.

## The biology book

Units and chapters, in the order they will be written. Chapter 1 exists; the rest are titles that fix the scope.

- **Unit I — The nature of life**: 1 What is life? · 2 The chemistry of life · 3 Cells · 4 Membranes and transport · 5 Energy and metabolism · 6 Photosynthesis · 7 Cellular respiration
- **Unit II — Information**: 8 DNA · 9 From genes to proteins · 10 The cell cycle and mitosis · 11 Meiosis and inheritance · 12 Gene regulation · 13 Biotechnology
- **Unit III — Evolution**: 14 Darwin and natural selection · 15 Population genetics · 16 Speciation · 17 The history and tree of life
- **Unit IV — Diversity**: 18 Bacteria and archaea · 19 Protists · 20 Fungi · 21 Plants · 22 Animals
- **Unit V — Form and function**: 23 Plant structure · 24 Animal structure and homeostasis · 25 Nervous systems · 26 Circulation and gas exchange · 27 Immunity · 28 Reproduction and development
- **Unit VI — Ecology**: 29 Populations · 30 Communities · 31 Ecosystems · 32 The biosphere and conservation

## Chapter 1 — What is life?

The prototype chapter, chosen because it touches every theme the book returns to and gives every kind of figure a job.

| § | Section | Figure | Kind |
|---|---|---|---|
| — | Opener | A drop of pond water: drifting cells, dividing now and then | generative canvas |
| 1.1 | The question biology asks | "Is it alive?" sorting activity | `<tb-sort>` |
| 1.2 | What all living things share | Homeostasis: a body-temperature loop the reader can perturb | simulation, canvas + SVG |
| 1.3 | Life is organised in levels | Levels of organisation, atom to biosphere, scrubbable | authored SVG sequence |
| 1.3 | | How small is a cell? A logarithmic scale with a draggable lens | interactive SVG |
| 1.4 | The cell is the unit of life | An animal cell: orbit, click an organelle, cut it open | Three.js |
| 1.5 | Life runs on information | The double helix | Three.js |
| 1.6 | Energy flows and matter cycles | Energy through an ecosystem | authored SVG |
| 1.7 | Evolution explains the pattern | The tree of life: three domains | authored SVG |
| 1.8 | How biologists know | Pasteur's swan-neck flasks | animated SVG |

## Decisions and their alternatives

- **Hand-authored HTML over Markdown.** Markdown would need a build step and would fight the custom elements; the chapter is a document with a little vocabulary, and writing it as one keeps the typographic control the owner asked for.
- **Custom elements over a framework.** The interactives are few and self-contained; a framework would cost a build step and a dependency for no shape the elements do not already give.
- **Google Fonts over vendored fonts.** See Typography. Revisit if the site is ever taken offline.
- **Procedural 3D over downloaded models.** Everything is authored in code and coloured from the palette; a downloaded model would be a binary blob the fleet's rules keep out of Git and a style the rest of the chapter does not share.
- **One page per chapter over a single-page app.** Documents deep-link, print, and are findable; the interactives mount lazily so a long chapter costs nothing until the reader reaches it.
