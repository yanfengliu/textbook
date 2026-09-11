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

Loaded from Google Fonts with `display=swap`, restricted to the axes and weights used, and every role has a fallback stack (`Iowan Old Style`, `Palatino`, `Georgia`; `system-ui`) so the page is readable before and without the webfonts. Vendoring the files was considered and deferred: the three families total more than the fleet's 256 KiB blob ceiling per weight set, and a runtime font request is the same class of dependency as the Three.js CDN the page already has.

Measure and rhythm: body text is 1.2rem (19.2px at the default root) on a 1.55 line height, in a column of at most 66 characters. Headings and figures sit on a 0.4rem baseline grid. The chapter opener carries a drop cap; section labels use small caps with letter spacing; numerals in prose are old-style (`font-variant-numeric: oldstyle-nums`) and in tables tabular and lining. Hanging punctuation and optical margin alignment are turned on where the browser supports them and ignored where it does not.

The type scale is modular at 1.2 from 0.8rem to 3.6rem, held in `src/styles/tokens.css`, and every size in the site is one of its steps.

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

Every diagram, canvas, and 3D material takes its colour from these tokens through `src/palette.js`, so a figure and the prose around it are always the same picture. The organelle colours used by both the 2D diagrams and the 3D cell are one table (`ORGANELLES` in `palette.js`), so the reader learns one colour per organelle across the whole chapter.

Contrast holds at WCAG AA for text in both themes, and the palette was chosen so the five accents remain distinguishable under the common forms of colour-vision deficiency; no figure encodes meaning in colour alone.

## Layout

Three regions on a wide screen: a sticky chapter navigation rail on the left, the text column in the centre, and a margin on the right for asides and figure notes. Below 1200px the margin folds into the text column as inset notes; below 800px the rail becomes a drawer behind a button and the page is a single column.

Figures come in three widths, chosen by an attribute: `text` (the measure), `wide` (breaks out to 1100px), and `bleed` (edge to edge). A reading-progress bar sits under the header, and the rail marks the section in view.

## Components

The prose is written in semantic HTML plus a small vocabulary of custom elements, each in `src/components/`.

| Element | What it does |
|---|---|
| `<tb-shell>` | Mounts the header, the navigation rail from the page's own headings, the progress bar, and the theme toggle. |
| `<tb-figure kind="cell3d" id="fig-cell" width="wide">` | The frame every interactive figure lives in: numbers itself, carries the `<figcaption>`, mounts its module lazily when near the viewport, and exposes its state to the gates. |
| `<tb-term ref="homeostasis">` | A glossary term: a dotted underline, a definition on hover or tap, and a link into the chapter glossary. |
| `<tb-aside>` | A margin note. |
| `<tb-key>` | A key-idea callout. |
| `<tb-check>` | A single multiple-choice question with an explanation that appears after answering, right or wrong. |
| `<tb-sort>` | A sorting activity: items are placed into bins by drag, or by keyboard and tap, and each placement is explained. |

Every interactive element is keyboard-operable and announces its result through a live region. Nothing depends on hover alone.

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

The registry (`src/figures/registry.js`) holds each kind's `url`, `title`, `needsWebGL`, `aspect`, and for a figure that can fill any shape (canvas, 3D) a `narrowAspect` the frame uses below 800px, so a phone gets a taller stage rather than a letterboxed strip.

The frame calls `mount` when the figure comes within 600px of the viewport, or immediately for every figure when the page URL carries `?eager=1`. It sets `data-state` to `loading`, `ready`, or `error` on the element and records every figure in `window.__textbook.figures[id]`, which is the handshake the gates wait on. `?t=<seconds>` pins every figure's clock through `setTime`, so a screenshot is the same frame every run.

An ambient animation runs only while its figure is on screen and pauses otherwise. Under `prefers-reduced-motion` a figure still works, but nothing moves unless the reader moves it: autorotation stops, transitions become cuts, and simulations advance by the reader's input.

Every figure has a text alternative: the `<figcaption>` says what the figure shows, and `data-alt` on the frame carries a one-paragraph description of what a sighted reader would learn by interacting.

## 3D conventions

Three.js through the import map, one renderer per figure, device pixel ratio capped at 2, rendering only while on screen and only when something changed or an animation is running. Units are micrometres for cells and nanometres for molecules, and the camera's default view is stated in the module so the gates can return to it. Materials are physically based under one three-light rig per figure; every mesh has a `name`; procedural geometry computes its normals. Labels are HTML positioned from projected 3D anchors, so they stay crisp and selectable. A cross-section is a clipping plane, animated, never a second model. `destroy()` disposes geometries, materials, and the renderer.

## Motion

Motion explains or it does not happen. A transition in the interface is at most 400ms; a diagram animation has a reason the caption can state; an ambient animation is slow and never draws the eye off the text. Every clock is pinnable by `setTime`, so the gates see the same frame every run.

## Writing the content

A chapter's prose is the deliverable and reads as a book, not a slideshow. Sections are `<section id="1-2">` with an `<h2>`; numbering is automatic. Every term the chapter introduces is a `<tb-term>` and has a glossary entry in the chapter's `glossary.js`, which also renders the end-of-chapter glossary. Every figure is referred to in the prose by number. A chapter ends with key ideas, a glossary, five checks, and a look ahead to the next chapter.

Biology is stated as the field states it: current, sourced from standard undergraduate texts, and careful about hedges, so "all known life" rather than "all life" where that is what is known.

## Adaptive study

The book tracks what a reader has learned and what they are struggling with, and reorganises practice around it. That has its own design of record: [adaptive.md](adaptive.md). In brief, mastery is tracked per learning objective rather than per chapter, a pure scheduler in the browser decides what is due, and the agent's rounds do the part arithmetic cannot: diagnosing a misconception and writing against it. The prose is never hidden, locked or gated by it.

## Gates

The gates are the fleet's evidence, and each states its own bound in its header. `npm test` chains them; each is also runnable alone.

- `npm run check` — static checks over every chapter page: unique ids, every figure has a caption and a registered kind, every term resolves and every glossary entry is used, every check has one correct answer and an explanation, every figure is cited in the prose, headings are in order, no `TODO`.
- `npm run shot` — loads every page in headless chromium at phone, tablet and desktop widths in both themes with every figure mounted eagerly and the clock pinned, fails on any console error, page error, failed request, or figure in the `error` state, and writes `out/shots/` for a person to look at.
- `npm run flow` — drives the reader controls on the chapter page through real mouse, keyboard and drag input (checks, sort, glossary popover, theme toggle, phone drawer) and asserts what they produce.
- `npm run drive` — drives every figure's own controls in the lab the same way, one recipe per kind, asserting what `describe()` reports; a kind with no recipe fails.
- `npm run sweep3d` — for every 3D figure, renders a sweep of camera angles and distances and fails when the bare canvas (overlays hidden) is blank, black, or flat.
- `npm test` — `node --test` over `test/*.test.js`, then the five above.
- `npm run perf` — frame time and draw calls with every figure mounted; a diagnostic, not a gate, because it measures the machine it runs on.
- `npm run audit` — the dependency audit, re-run on any dependency change.

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
