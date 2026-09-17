# The figure bench — design of record

Status: **proposed**, not built. Nothing in this document exists in the tree; it is a decision to be taken or refused.

## Recommendation

**Build the bench, and do not migrate the thirty-six.** The repetition is real and worth removing, but it is about a fifth of a figure, not nine tenths: measured block by block on `osmometer.js`, a bench absorbs 212 of its 874 lines, and the other 662 are the U-tube, the van 't Hoff arithmetic, the three scenes and the sentences. So the bench pays for itself at four figures and is overwhelmingly right for the 232 that remain, and it pays nothing at all for re-working a figure that is already accepted — because the cost of touching an existing figure is not the edit, it is that no gate in this repository can see composition, so every migrated figure has to be looked at again at 390 px, at 3×, in both themes by a person, and thirty-six of those is roughly five worker-rounds spent to change nothing a reader sees. Build `src/figures/lib/bench.js`, make it mandatory for every new figure from chapter 5 on, migrate exactly one existing figure as the red-proof that the bench can carry a real one (`phlab`, which is the smallest fully-featured member of the largest family), and let the other thirty-five migrate only when they are already open for another reason — with a pixel-identity check, described below, as the gate that makes such a migration safe. The second and larger prize is not lines: it is that five of the ten acceptance criteria in `chapter-recipe.md` §5 are properties of the scaffolding, each currently remembered by each author and re-implemented by hand — twelve byte-identical copies of the primary-action rule, eleven of the live-region style, eleven of the toolbar divider — and a component holds those once, for every figure that ever comes.

## What was measured, and with what

Taken on 2026-09-16 on this working tree (`d778606` plus the uncommitted chapter-4 modules), over the 36 figure modules in `src/figures/` — 37 files, of which `registry.js` is not a figure.

| Number | Value | Instrument, and what was left out |
|---|---|---|
| Figure code | 34,688 lines over 36 modules, mean 964 | `wc -l` over `src/figures/*.js` less `registry.js` |
| Shared helpers | 2,344 lines over 10 files | `wc -l src/figures/lib/*.js` |
| Of the figure code: CSS | 3,654 lines, 10.5% | a line counted as CSS when it is a selector opening a brace or a `property: value;` declaration; a heuristic, so ±a few per file |
| Of the figure code: comment | 4,198 lines, 12.1% | lines beginning `//`, `*` or `/*`; block-comment interiors not starting with `*` are undercounted |
| Of the figure code: blank | 2,125 lines, 6.1% | |
| Own `ResizeObserver` | 32 of 36 | three more (`cell3d`, `dna3d`, `water3d`) get one from `observeSize` in `lib/three-common.js`; `levels` alone has none |
| Branch on a measured size | 34 of 36 | 26 of them by toggling an `is-narrow` class on their wrapper |
| Identical primary-action rule | 12 | `.X-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }`, byte-for-byte in eleven of them, `membrane3d` without the background |
| Identical toolbar divider | 11 | `.X-sep { width: 1px; min-height: 1.45rem; … background: var(--rule-strong); }` |
| Identical live-region style | 11 | the same nine-property `Object.assign(live.style, …)` with `clipPath: 'inset(50%)'` |
| A live region at all | 24 of 36 | |
| `mulberry32` definitions | 6 | `lib/chem-atoms.js`, `lib/cell-common.js`, `lib/cell3-draw.js`, `lib/three-common.js`, `pond.js`, `pasteur.js`; 19 figures import one of them |
| Readout vocabulary | three of them | 12 figures on `readoutCss`/`readoutTable` (`lib/mol-draw.js`), 4 on `panelCss` (`lib/cell-common.js`), 12 with their own |
| The 0.53-em advance estimate | 6 copies | `phlab.fitSize`, `carbonkit.sizeToFit`, and `noteRows` in `bilayer`, `bulk-transport`, `osmometer`, `permeability` |

Two numbers in the brief this document was written from are **not** confirmed here and should not be relied on. "93 % is per-figure" is true as a ratio of bytes and false as a statement about how much of a figure is scaffolding; the block-by-block accounting below puts the scaffolding at 24 % of one representative module. "A worker building four figures takes about three hours, and most of that is scaffolding" is the caller's measurement, not mine — I did not build a figure and have no timing of my own. Everything else above I measured.

## Why `mulberry32` is in six places, and why that reason binds the bench

It is not carelessness, and the answer decides the bench's shape.

A figure worker owns its own files and may not edit a shared one. `docs/work/2_rest-of-the-book/plan.md` says it plainly — *"The only shared files are `src/figures/registry.js`, `tools/drive.js` and the chapter list on `biology/index.html`. The integration owner owns all three, so workers never touch them"* — and `local-rules.md` makes it a rule: one writer per file, and the assignment names the files. Four figure workers run in parallel on one chapter. A shared file any of them may extend is a serialisation point, and this repository has decided, correctly, not to have one.

So each chapter's shared lib was created **by the integration owner, up front, before the figure workers started**, in the same movement as registering the kinds — which is exactly what the registry's own comment describes for chapter 4 and for the second book. `lib/three-common.js` was born with chapter 1; `lib/cell-common.js` and `lib/cell3-draw.js` with chapter 3; `lib/chem-atoms.js` and `lib/mol-draw.js` with chapter 2. Each defined the generator because at the moment it was written it could not edit the previous chapter's lib to import from it: that file belonged to work that was already accepted, and touching it would have put every earlier figure's frames back in front of a person. `pond.js` and `pasteur.js` define it inline because they are chapter 1 and there was no lib yet.

`lib/mol-draw.js` is the exception that proves it: it re-exports the generator from `chem-atoms.js` with a comment saying so, because both were created in the same chapter by the same owner at the same time.

Three consequences for the bench, and they are the whole design:

- **The bench is the integration owner's file, and it is finished before the figure workers start.** A bench a worker has to extend mid-chapter is the serialisation point this repository refuses to have. If the bench cannot do something, the figure drops through to raw drawing for that one thing, and the extension is proposed for the *next* chapter.
- **The bench is one file, not one per chapter.** `lib/mol-draw.js`, `lib/cell-common.js` and `lib/three-common.js` are three answers to the same question given by three chapters, and two of them now disagree about what a readout is. Which leads to:
- **A bench that outlives the design it encoded is worse than no bench.** `panelCss` in `lib/cell-common.js` ships `.cl-mini` — a pill with `border-radius: 999px` and a filled pressed state — and `.cl-bar`, a rounded progress bar. Both were right in September and are now forbidden by the brief's own header ("no pills, no chips, no bordered boxes, no rounded rectangles, no progress bar"). Three figures still draw pills from it. So the bench's chrome has to be the thing that changes when the design changes, and the figures have to be unable to opt out of it, or the next design pass is thirty-six edits again.

## What the bench owns, and what the figure owns

The figure's job is its subject. Everything else is a candidate, and the boundary is drawn where the *criteria* are, not where the lines are.

| The bench owns | The figure owns |
|---|---|
| The object `mount` returns: `destroy`, `setTime`, `setVisible`, `setTheme`, and the `describe` wrapper | `meta`, and the body of `describe()` |
| The wrapper element, its scoped class, and every rule of CSS that is not about this figure's own marks | its own marks' CSS, scoped under the class the bench gives it |
| The panes: a grid, one measured box per pane, a `viewBox` in stage device pixels, a canvas at the capped device ratio | what is drawn in a pane |
| The narrow switch: one measured threshold per figure, the class toggle, the two grid templates | what the narrow composition *is* — which panes it drops, stacks or re-orients |
| `ResizeObserver`, `document.fonts.ready`, the first-layout `onReady`, and the redraw after each | nothing |
| Every control: buttons, toggles, choice groups, sliders, the Run/Pause control, the group dividers, the primary mark, the accessible names, the keyboard | which controls exist, what they are called, and what they do |
| The live region and the wiring that speaks after every action | the sentence it speaks |
| The readout region: title, columns, rows, hairlines, notes wrapped to the column, the row height solved to fill the pane | the rows' labels and values |
| The stage label with a paper halo, and the verdict line | the words on them |
| Clamped geometry: `rect`, `circle`, `line`, `text` that refuse a negative or `NaN` dimension | the arithmetic that produces the numbers |
| The seeded generator, the easing, the smooth path, the number formatting | the seed |
| The frame loop: `requestAnimationFrame`, pause on invisible, a fixed-step clock replayed from zero when time moves backwards | `advance(dt)`, and what a step of the model is |
| A two-series sparkline over a moving window | which two series |

**Where the boundary is defended.** Three of these will look like overreach.

*Why the bench owns the CSS and not just the classes.* Twelve figures declare the same primary-action rule; eleven the same divider; eleven the same live-region style. Each of those is a criterion from `chapter-recipe.md` §5 rendered as a copied declaration, and a copied declaration is a criterion that can drift silently in one file. More sharply: `components.css` today says `.fig-btn[aria-pressed="true"] { background: var(--leaf-text); color: var(--paper); }` — a **fill** — while the brief says the primary action is told "by `--rule-head` on its edge and the ink's weight, never by a fill". The twelve copies exist to fight the shared stylesheet. That is the shared stylesheet being wrong, and one place to fix it.

*Why the bench owns the controls and not just their styling.* `tools/drive.js` presses controls by accessible name and `tools/narrow.js` requires a control to still exist at 390 px. Thirty-six recipes depend on those names. A figure that builds its own `<button>` can, and has, given it a narrow label different from its wide one — the defect that forced four chapter-3 goals to be reworded when `surface-volume`'s phone labels turned out to be "Villi", "Rod", "Disc" and "Clock". If the bench makes the control, one label is the accessible name at every width by construction, and the narrow form is a second span the CSS hides. The same argument covers keyboard operability and the tap-is-a-hover rule.

*Why the bench does not own drawing.* It owns the pane and the primitives that can produce invalid geometry; it does not own composition. A bench that decided where the beakers go would have to know what a beaker is. `phlab` sizes its beaker pane from the beakers down, because sized the other way the glasses stopped growing and the pane opened a gap over their heads — that is a judgement about a specific drawing and no general mechanism reaches it. The bench gives the figure a measured box and gets out of the way.

## The API

One file, `src/figures/lib/bench.js`, exporting one function. It is calls, not configuration: a spec object grows to cover every case and becomes the framework `AGENTS.md` forbids.

```js
import { bench } from './lib/bench.js';

export const meta = { kind: 'osmometer', title: '…', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 };

export function mount(root, ctx) {
  const b = bench(root, ctx, {
    scope: 'osmo',                       // the wrapper class, .tb-osmo; every figure rule is scoped under it
    css: FIGURE_CSS,                     // this figure's own marks only — no grid, no toolbar, no readout
    narrowBelow: { width: 640, height: 340 },   // this figure's threshold, from its own content
    seed: 4021,                          // b.random() is mulberry32(seed); there is no other generator
  });

  // Panes. The bench writes the grid and measures each box; the figure says what the two shapes are.
  const scene = b.pane('scene', { as: 'svg', focus: true, aria: 'One pair of solutions in three scenes…' });
  const side  = b.pane('side',  { as: 'svg' });
  b.compose({
    wide:   { columns: '53fr 47fr', rows: '1fr', at: { scene: [1, 1], side: [2, 1] } },
    narrow: { columns: '1fr', rows: `1fr ${() => sideHeight()}`, at: { scene: [1, 1], side: [1, 2] } },
  });

  // Controls, in groups. The bench draws one rule of them, spaced between groups and not inside one,
  // and the primary mark is a flag, not a class the figure invents.
  const scenes = b.choice('Scene', SCENES, (id) => { scene = id; b.restart(); });
  b.divide();
  const solutes = b.choice('Solute', SOLUTES, setSolute);
  const outside = b.slider('Outside', { min: 0, max: 600, step: 5, value: 150, unit: 'mmol/L',
                                        narrowUnit: 'mM', onInput: (v) => { outsideMM = v; b.restart(); } });
  b.divide();
  const run = b.run({ primary: true });         // says Run, then Pause; b.playing is the truth
  b.action('Reset', reset);
  b.keys({ ' ': run.toggle, ArrowRight: scenes.next, ArrowLeft: scenes.prev, Home: reset });

  // The model's clock. Fixed step, replayed from zero when time moves backwards, so setTime is exact.
  b.clock({ step: 1 / 60, advance: advanceOneStep, restart: restartRun, running: () => b.playing });

  b.onDraw(() => { drawScene(scene); drawPanel(side); });
  b.onDescribe(() => state());                  // the bench adds `layout` and nothing else
  b.onAnnounce((d) => `${SCENE_NAME[d.scene]}. Outside ${d.osmolarityOutside}…`);

  return b.handle();                            // exactly the object the frame expects
}
```

Inside `onDraw`, a pane is the drawing surface and the guard:

```js
scene.clear();                                   // viewBox set to the measured box, children replaced
const { w, h } = scene.box;                      // stage device pixels; a 10.5 px label is 10.5 device px
scene.rect(x, y, width, height, { fill });       // clamped: a negative or NaN dimension throws in the lab
                                                 //   and draws nothing on the site
scene.text(x, y, str, { fit: [11.6, 9.2], anchor: 'middle', class: 'os-row' });  // null if even the floor overruns
scene.label(x, y, 'outside', { size });          // the paper-haloed label eleven figures hand-roll
scene.add(el('path', { d, … }));                 // the escape hatch: anything the bench does not do
```

The readout is a region, not a helper the figure may decline:

```js
const r = side.readout({ title: 'Water potential, MPa', columns: ['Outside', 'Inside'] });
r.row('Solute, Ψs', [signed(a), signed(b)]);
r.rule();
r.sum('Water potential, Ψ', [signed(c), signed(d)], { arrow: c > d ? '→' : '←' });
r.note(sentence(d));                             // wrapped to the column, in the pane's own units
r.fill();                                        // solves the row height so the table fills the pane
side.trace({ series: [['volume', INK.coral], ['pressure', INK.water]], window: 24, data: trace });
```

Three constraints the API keeps, because 36 recipes and four gates depend on them:

- `b.handle()` returns `{ destroy, setTime, describe, setVisible, setTheme }`, plus `setView` when the figure supplies one. `src/components/figure.js` is **unchanged**. The bench lives entirely inside `mount`.
- `b.onDescribe`'s object is returned as-is with one field added, `layout: 'wide' | 'narrow'` — which 17 of the 36 already report under that exact name. The bench spreads **last**, the way the frame does, so a figure cannot silently lose a value; and, the way the frame does, a figure that names a bench-owned field fails a gate rather than winning quietly (see below). The bench adds no other name, and in particular does not add `t` — a figure's clock is the figure's.
- `ctx.pinnedTime` still means what it means. `b.clock` never advances while it is set, and `setTime` replays from zero when time moves backwards, which is what `prokaryote` and `osmometer` already do by hand.

## The worked example: `osmometer.js`

874 lines today. Block by block, with the line ranges, so the accounting can be checked rather than believed.

| Lines | What is there | Bench absorbs | Of |
|---|---|---|---|
| 1–43 | header comment, imports, `meta` | 0 | 43 |
| 45–86 | the model's constants, and `NARROW_W`/`NARROW_H` | 0 | 42 |
| 89–130 | CSS: grid, panes, readout classes, label halo, toolbar groups, divider, primary, slider, the `is-narrow` block | 32 | 42 |
| 132–148 | `fmt`, `noteRows`, `signedMPa` | 16 | 17 |
| 180–234 | wrapper, two SVGs, panes, the `button` factory, the `slider` factory, groups, divider, toolbar, live region and its inline style | 28 | 55 |
| 236–307 | osmolarity, potentials, `advanceOneStep`, `advanceTo` | 0 | 72 |
| 309–399 | reader actions, `setPlaying`, the rAF loop, `onKey` | 28 | 91 |
| 401–455 | `outcomeOf`, `state()`, `announce` | 2 | 55 |
| 457–624 | the U-tube and the two cells | 0 | 168 |
| 626–762 | the potential panel, the sentences, the trace | 40 | 137 |
| 764–827 | `paneBox`, `draw`, `applyLayout`, `onResize`, the observer and fonts wiring | 48 | 64 |
| 829–873 | the returned handle, and the `describe()` comment block | 18 | 45 |
| | **total** | **212** | **874** |

So `osmometer` on the bench is about **660 lines**, a 24 % reduction, and the 662 that remain are the chemistry, the three scenes, the seven outcome words and the eight sentences — which is right, because that is the figure.

The three largest absorptions are worth naming because they are where the criteria live, not where the lines are. The 48 lines of layout wiring are the same 48 in every figure and include the two things that are easy to get wrong and invisible when you do: the guard that stops a `ResizeObserver` callback which sets a CSS variable from re-entering itself (`phlab` has a four-line comment about exactly this), and the redraw after `document.fonts.ready`, which 24 figures do and 12 do not — and the 12 that do not are measuring text in a fallback face. The 40 from the panel are `readoutTable` extended to a second value column plus `drawTrace`, a two-series sparkline over a moving window that `osmometer`, `transport-lab` and `gradient-battery` each wrote separately. The 32 from the CSS are the grid, the toolbar, the divider, the primary mark, the slider and the generic half of the narrow block — every line of which is identical in eleven other files.

**What the reduction is not.** It is not 940 lines becoming 200. A figure in this book is mostly a drawing, and a drawing is code. The honest claim is that a bench removes a quarter of a figure and all of the part that a checklist currently has to hold.

## How it makes the criteria structural

The acceptance list is `chapter-recipe.md` §5. Against each, what the bench actually does.

| Criterion | Bench | Why |
|---|---|---|
| Every panel composed, at every width; no half-empty pane | **easy** | `r.fill()` solves the row height so a table fills its column instead of stopping half way down it, and a pane reports its measured box so nothing is sized by a default. But whether a composition is *good* is a judgement about a drawing, and no mechanism reaches it. `polymer`'s two 30 px hexagons in a dead quadrant would pass every bench check. |
| Every readout set as typography; no pills, chips, bordered boxes, progress bars, letter circles | **enforces** | The readout is a region the figure fills with rows, not a surface it styles. There is no way to reach a border from `r.row()`. The one bordered thing left is the stage. A lint (below) fails a `border-radius` or a `border:` in a figure's own CSS. |
| Control rows grouped by what they do; the primary action reads as primary | **enforces** | `b.divide()` is the only way to get space in the toolbar, so grouping is the only shape available; `primary: true` is a flag the bench renders as `--rule-head` on the edge and the ink's weight, and the figure cannot render it as a fill because it does not write the rule. This also fixes `components.css`'s `.fig-btn[aria-pressed="true"]`, which is a fill today and is what the twelve `.X-primary` copies exist to override. |
| No label collides — with another label, the thing it names, the toolbar, or the stage edge | **author** | This is the honest third. A collision is a state, not a layout: it appears at one slider value and not another. `scene.text({ fit })` returns `null` rather than drawing an overrun label, and the bench reserves the toolbar's measured height as the pane's bottom padding so nothing can be drawn under it — which is two of the four collisions `waterprops`, `plantcell3d`, `prokaryote` and `cilium` had. The other two are a person's. |
| Every assembled sentence grammatical in every state | **author** | Entirely. The bench owns the live region and calls `onAnnounce` after every action; it cannot know that `secretion` stage 7 read "In the outside the cell." |
| A second composition below about nine device pixels, looked at at 390 px, 3×, both themes | **easy, and better instrumented** | One threshold per figure and two grid templates replace 26 hand-rolled switches, and `b.compose` refuses a figure that declares a `narrowAspect` in the registry but gives no narrow template — the failure mode that nearly shipped five figures with no gate over their second layout. Whether the type is legible at 390 px is still a person at `out/narrow/`. |
| No negative or `NaN` geometry at any width | **enforces** | `scene.rect` and its siblings are the only way to a dimension attribute, and they clamp at the point of computation. A lint fails a figure module that calls `el('rect'\|'circle'\|'line'\|'ellipse', …)` directly. This is the chapter-3 defect that reached main and logged console errors on the live site, removed as a class. |
| `describe()` reports nothing named `id`, `kind`, `number`, `state`; every field reachable only by the reader acting | **enforces the first, leaves the second** | The bench applies the frame's own rule to its own one added name, and `npm run drive`'s existing ownership check extends to it. Whether a field becomes true on its own as the clock runs is a property of the model and stays the author's. |
| Any factual sentence in the module matches the chapter | **author** | Entirely. |
| Gates green and the frames looked at | **unchanged** | |

Two of ten enforced structurally, two more enforced with a lint the bench makes possible, three made easier, three left honestly to the author. That is the real shape of the win, and it is worth having: the two it enforces outright — the readout's chrome and the control grouping — are the shared flaw that sent all eight of chapter 2's figures back for a design pass, and negative geometry is the one that reached production.

The repository's own instinct on the rest is right and should not be replaced by a component: `tools/legible.js`, written on 2026-09-16, measures every glyph a figure puts in the DOM against the pixels behind it in both themes, and caught contrast failures in six figures that no component could have prevented, because the fill and the ink were set far apart. Criteria that are about the *rendered result* belong in a gate. Criteria that are about the *vocabulary* belong in the bench.

## What it cannot absorb, and which of the 36 it does not serve

**The six WebGL figures keep `lib/three-common.js` and take only the chrome.** `cell3d`, `dna3d`, `water3d`, `cilium`, `plantcell3d`, `membrane3d`. Their substance is a scene graph, a three-light rig, a damped orbit, HTML labels at projected anchors, clipping-plane sections and `setView` for `npm run sweep3d` — none of which a 2D bench can hold without becoming two benches in one file. They are also already the best-served family, which is the evidence that a bench works: `dna3d` is 401 lines, the smallest module in the repository, because `three-common.js` exists. What they should take is the toolbar and the readout, because `createStage`, `addButton` and `addChip` in `three-common.js` are a fourth control vocabulary and `membrane3d` already imports `readoutCss` from `mol-draw.js` to escape it. So: `three-common.js` keeps the scene and loses its chrome to the bench, and the bench's `pane({ as: 'canvas', gl: true })` hands over a canvas and nothing else.

**The three 資治通鑑 figures should take nothing.** `zj-split`, `zj-timeline`, `zj-words` are 604, 527 and 670 lines, of which 137, 97 and 129 are CSS — the highest CSS fraction in the repository, because they set vertical Han text in three arrangements chosen from the measured stage, with an index of first characters and a card that must not give the CJK line breaker a break opportunity. The bench's text fitting is an advance estimate of 0.53 em a character measured on Inter over mixed-case Latin; it is simply wrong for Han, where the advance is 1 em and the constraint is characters per line, not pixels. They would take the resize plumbing and nothing else, which is about 50 lines each for a coupling between two books. Leave them.

**Four figures gain little, and two of them for a good reason.** `levels` has no `ResizeObserver` at all and one toolbar; `dna3d` has neither. `soup` (1,638), `microscopes` (1,731), `waterprops` (1,368) and `pond` (1,101) are canvas figures whose substance is one large `draw()` — the bench absorbs the same ~200 lines from each, which is 12–15 % rather than 24 %. They are not harmed by the bench; they are just not the argument for it.

**One thing no bench should try to absorb: the figure's own arithmetic about its own drawing.** `phlab`'s `beakerHeight(w)` — which asks the beakers how tall they need to be so the window below can have the rest — is 9 lines that look like layout and are not. They are a statement about what a beaker is. A bench that offered "solve for a pane's height" would be offering a shape that fits one figure.

## Migration plan

Incremental, safe, and stopping early by default.

**Step 0 — the pixel-identity check, before any figure moves.** A migration that is meant to change nothing has to be able to prove it changed nothing, and the gates cannot: `npm run narrow` asks whether a frame is blank, flat or near-black, and `npm run drive` asserts `describe()`, not pixels. So the first thing built is not the bench. It is `tools/figure-diff.js`: run `SHOT_LABEL`-style trimmed `drive`, `narrow` and `sweep3d` for one kind, hash every PNG with `node:crypto`, and compare against a manifest taken before the change. No new dependency — chromium already writes the PNGs and Node already hashes. A migration whose frames are byte-identical in both themes at both widths after every recipe step needs no second look from a person; a migration that moves one pixel is a design change and goes back through acceptance. That distinction is what makes touching thirty-six accepted figures thinkable at all, and without it the honest answer to "migrate them?" is simply no.

**Step 1 — build the bench against nothing.** `src/figures/lib/bench.js` and its CSS in `components.css`, plus `test/bench.test.js` over the pure parts (the fit solver, the clamps, the clock's backwards replay, the `describe` merge). No figure imports it. Every gate stays green because nothing changed. Estimated 840 lines of new shared code, of which about 150 is `readoutTable`, `readoutHeight`, `fitRows` and `focusMark` moved out of `mol-draw.js` rather than written.

**Step 2 — one existing figure, as the red-proof.** `phlab`: 818 lines, in the largest family, with two panes, a chart, a magnified window, a two-group toolbar, a live region, a narrow composition and no clock — so it exercises everything except the loop, and its frames are stable because it has no clock to drift. If the bench cannot carry `phlab` with byte-identical frames, the bench is wrong and this document is refused at a cost of one file. Expected: 818 → about 610.

**Step 3 — the next chapter's figures are built on it, and nothing else moves.** Chapter 5's eight, written on the bench from the start, are the real measurement: whether a figure worker's session is shorter and whether the design pass is smaller. Two chapters of that is the evidence on which the rest of this plan should be re-decided.

**Step 4 — opportunistic only.** A figure migrates when it is already open: a design pass, a defect, a chapter revision. It carries a `figure-diff` manifest, and if the frames move the change is a design change. Nothing is migrated for the sake of migrating. The twelve `readoutCss` figures will drift onto the bench quickly because they are already most of the way there; `soup`, `microscopes` and the three 資治通鑑 figures may never move, and that is the correct outcome, not a loose end.

**What is never done:** a sweep that opens thirty-six modules in one round. Even with byte-identical frames it would put every figure in the repository behind one revision, and the canon's own lesson about aggregate views applies exactly — a green `figure-diff` over thirty-six answers "is there one of each", and the thing that would go wrong is a figure whose frames move for a reason the diff reports in one line among thirty-six.

## The cost, against the saving

**Cost, measured where I can and marked where I cannot.** The bench is about 840 lines to write and about 150 to move; that is a bounded, reviewable change with a unit test and no effect on any figure — call it one worker-round, which is a **guess**, not a measurement. Step 0's `figure-diff` is perhaps 120 lines. Step 2 is one figure re-written and proved identical. Beyond that the incremental cost is zero, because nothing else is touched.

**Saving.** 212 lines per figure is measured on one figure and will vary; 200 is a fair round number and 130 is the pessimistic case (`soup`, `microscopes`). Against 232 remaining figures at 200 that is about 46,000 lines never written — but lines are the weak part of the case and I do not want to rest it there. The strong part is this: every one of chapter 2's eight figures and every one of chapter 3's eight passed every gate on arrival and went back for a design pass, and the shared flaw named in `plan.md` was *"a panel half empty and readouts drawn as application chrome rather than as typography"*. Of those two, the second is exactly what the bench enforces. One design pass avoided per chapter, over twenty-nine chapters, is the return — and against a bench that cost one round to build, that is not a close call.

**What would make this wrong.** If the next chapter's figures on the bench turn out to be the same length and to need the same design pass, the bench has absorbed the lines and not the criteria, and step 3 is where that shows. Two other ways it could go wrong, both with a named early sign: the bench acquires an option per figure — `narrowUnit`, then `narrowLabel`, then `narrowRows` — and becomes the configuration surface this document rejected, which shows up as the first pull request that adds a parameter for one figure; and the bench encodes today's design and outlives it, which is what `panelCss` did and which shows up as the first figure that overrides a bench rule in its own CSS. Both have the same remedy: the lint in the next section, which makes an override visible instead of quiet.

## What changes outside the bench, and why the frame does not

`src/components/figure.js` is **unchanged**. The bench is a function called inside `mount` that returns the object the frame already expects. That matters because the frame is on this repository's high-risk list and a change there needs independent review; this change needs none, because it makes none.

Four things outside it do change, and each is small:

- **`src/styles/components.css`** gains the bench's grid, toolbar, readout and narrow rules, and loses the conflict that made twelve figures override it: `.fig-btn[aria-pressed="true"]` stops being a fill. That override is a visible change to eleven existing figures' pressed states, so it lands in step 1 with its own frames looked at — it is the one part of this plan that touches accepted work, and it is a fix, not a migration.
- **`test/element-table.test.js`'s sibling** — a new `test/bench-lint.test.js`, following the precedent that file already sets by reading every module under `src/figures/` as text: fail a figure that constructs a `ResizeObserver`, defines `mulberry32`, writes `border-radius` or `border:` in its own CSS, or calls `el('rect'|'circle'|'line'|'ellipse', …)` directly. Scoped, at first, to modules that import the bench, so no existing figure goes red.
- **`tools/drive.js`** extends its existing `describe()` ownership check from the frame's four names to the bench's one. Same code, one more name.
- **`docs/design/textbook.md`**'s figure-contract section gains a sentence pointing here, and `figures-template.md` gains a line in "What every figure here owes" saying that a new figure is built on the bench and what that means for its brief.

Everything in this section is a gate or a stylesheet. Nothing is a framework, nothing is a build step, and nothing is a dependency.
