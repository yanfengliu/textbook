# Chapter 8 — figure brief

Four figures, in the order they appear in `index.html`. The figure number is fixed by that order and the prose cites every one of them by number, so the order does not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 8.1 | `helix-lab` | `fig-helix-lab` | 8.2 | no | 16 / 9 | 2 / 3 |
| 8.2 | `meselson-stahl` | `fig-meselson-stahl` | 8.3 | no | 16 / 9 | 2 / 3 |
| 8.3 | `replication-fork` | `fig-fork` | 8.4 | no | 21 / 9 | 9 / 16 |
| 8.4 | `chromosome-end` | `fig-telomere` | 8.7 | no | 16 / 9 | 9 / 16 |

**Four were cut on 2026-09-24**, at the reduced scope chapter 6 shipped with (`docs/policies/local-rules.md`, "The usage allowance is the budget"): four of the eight planned figures, and questions instead of figure tasks, so no item in `items.js` sets a task on any figure. The four kept are the chain the chapter argues along — the structure read off a photograph (8.1), the copying that structure predicts and the experiment that tested it (8.2), the fork that one-way chemistry forces (8.3), and the end that fork cannot finish (8.4). Each is a mechanism a reader has to move to see: a diffraction pattern changing with a helix, bands parting from a prediction one generation at a time, a lagging strand that vanishes from every fork when a polymerase can add at either end but only moves to the other fork when the strands run the same way, and a gap at the tip that nothing can fill. All four are 2D. The four cut, with the numbers they had in the first plan, and what their sections carry now:

- `genetic-material` (8.1, the opener's hero). §8.1 tells Griffith's four injections, Avery's enzyme tests and Hershey and Chase's measured shares in its prose. The opener has no hero figure, as chapter 6's has none.
- `fidelity` (8.5). §8.5 carries the error rate after each check in one table and the damage rates in another, works the rate's denominators in the prose, and ends on the repair sort, which asks for the choice between systems that the figure's damage scene would have shown.
- `nucleosome3d` (8.6, the chapter's only WebGL figure). §8.6 gives the nucleosome's numbers — 147 base pairs, about one and two-thirds turns of a left-handed coil — in the prose, and the reader takes the direction of the wrap on trust.
- `genome-ledger` (8.8). §8.8's two tables carry the human genome's composition and seven genomes' sizes and gene counts, and the prose gives the three answers to how much of it is functional.

Their briefs are in this file as it was imported, `git show 5126afa:biology/ch08-dna/FIGURES.md`, and should be read only as history. Twenty-two objectives were taught by a cut figure, and each now names none (`figures: []`), which the checker accepts; the header of `objectives.js` says which.

Kind ids and figure ids are clear of every other chapter's, checked on 2026-09-22 against `src/figures/registry.js` on `origin/ch06-07` (chapters 1 to 5 registered, and the 資治通鑑 book) and against every `<tb-figure>` in chapters 6 and 7, which were then written but not registered. Two names were chosen against the obvious one. The DNA helix of chapter 1 is `dna3d` with id `fig-dna`, so nothing here is called `dna-anything`, and the §8.2 figure is `helix-lab` — the book's name for a bench the reader builds on, as `bondlab`, `foldlab` and `phlab` are. And `replication-fork` is spelt out in full because chapter 6 has a `rubisco-fork`, which a bare `fork` would sit next to in the registry and mean nothing beside.

**No WebGL figure.** The first plan's one, `nucleosome3d`, was cut with the other three, so `npm run sweep3d` has no chapter-8 entry. `dna3d`, chapter 1's helix, already answers "what does the molecule look like"; nothing in this chapter redraws it.

## Palette: this chapter asks for nothing new

Read the comments above `ORGANELLES`, `MEMBRANE` and `METABOLISM` in `src/palette.js` before adding anything, and then do not add anything. Every mark the four figures need is already in a table.

- **The four bases are `BASES`** — adenine `coral`, thymine `gold`, guanine `water`, cytosine `violet` — as chapter 1's `dna3d` draws them, the warm pair and the cool pair. Every figure that draws a base draws it in that colour with its letter.
- **Uracil has no colour of its own, and must not be given one.** Where a base of an RNA primer or of telomerase's RNA template is drawn (8.3, 8.4), a uracil is drawn in thymine's `gold` with **U** written on it and **without the methyl group** that thymine carries. §8.5's argument is that uracil is thymine less one methyl group; a figure that gives uracil its own hue has coloured the difference instead of drawing it.
- **The backbones are chapter 1's.** A parental strand is `inkSoft` at the weight `dna3d` uses. **A new strand is told from an old one by value and weight, not by a hue**: `ink`, one step heavier. The five accents are already the bases, and a new strand in any of them would claim a base's identity. **An RNA primer** is the new strand's stroke broken into short dashes, with its bases, where they are drawn, carrying U; its label says RNA.
- **In 8.2 a strand's nitrogen is its stroke weight.** A strand made with <sup>15</sup>N is drawn at twice the weight of one made with <sup>14</sup>N, in the same ink, and labelled. Both are nitrogen, which is the point of the experiment: an isotope is the same element, and <sup>15</sup>N is told from <sup>14</sup>N by weight, not by radioactivity. The bands in the tube are ink on the tube's pale ground, as the dark bands of an ultraviolet photograph are.
- **Every protein at a fork or a chromosome end is `metabolismPart('enzyme')`**, the pale fill chapter 5 fixed for a protein that lowers a barrier, with its name in `ink`, told apart by shape and label: helicase, polymerase, primase, ligase, topoisomerase and telomerase, and the single-strand binding protein, which is not an enzyme and is drawn as small beads in `inkFaint` on the strand.

## What every figure here owes

Nothing in this section is answered by a gate unless the line names one. The gates prove that a figure mounts, reports what it claims and survives being pressed; every judgement below is a person's, made at the artefact's own resolution, in both themes, at the widths a reader uses.

**A 2D figure is built on `src/figures/lib/bench.js`.** It is not a framework: it is a function called inside `mount` that returns the object the frame already expects. What that means for the block you write below is that four of the lines in this section stop being yours to remember and become the bench's to enforce — the readout cannot be a pill, a chip, a bordered box or a progress bar because `readout()` emits only `<text>` and `<line>`; the primary action is `primary: true` and the bench renders it as `--rule-head` on the edge and the ink's weight, never as a fill; a control's narrow label is a second span and its accessible name is the long label at every width, by construction; and a negative or `NaN` dimension throws in the lab instead of reaching the DOM, because `pane.rect` and its siblings are the only way to a dimension attribute. `test/bench.test.js` fails a bench figure that defines `mulberry32`, makes its own `ResizeObserver`, writes `border-radius` or `border:` in its own CSS, or calls `el('rect'|'circle'|'line'|'ellipse')` directly.

Everything else in this section is still yours, and the honest list of what the bench does **not** reach is in [figure-bench.md](../../docs/design/figure-bench.md): whether a composition is *good*, whether a label collides at one slider value and not another, whether an assembled sentence is grammatical in every state, and whether the type is legible at 390 px. The bench is finished before the chapter's figure workers start and none of them may extend it — if it cannot do something, drop through to `pane.add()` for that one thing and propose the extension for the next chapter. No figure here is WebGL.

### It is a mechanism

It shows a mechanism the reader changes, not a picture of a noun. A labelled diagram that could have been a static image is a weak figure. Prefer, in rough order: a simulation the reader perturbs, a 3D thing they turn over, a scrubbable sequence, an authored illustration that responds. Each block below says in one line why its figure is a mechanism; if that line is hard to write, the figure is the problem.

### Composition

- **A panel that is half empty is a composition failure, and the fix is to re-compose — never to add filler.** Change the aspect, move the readout, let the drawing fill the pane. `polymer` held two 30 px hexagons in a dead lower-left quadrant and `secretion` was half empty from default paragraph margins; both passed every gate first.
- The drawing is the figure. Controls and readouts serve it and do not compete with it for area.
- Nothing is sized by a browser default. A margin, a size or a gap that exists because nothing set it is a decision not yet made.

### Readouts

- **A readout is a typographic table, not application chrome.** No pills, no chips, no bordered boxes, no rounded rectangles, no progress bar with its caption over the fill, no letter circles, no translucent panels behind text.
- Set it the way the book sets a table: a label in the interface face, the number in tabular figures, a hairline between rows only if rows need separating, and space where a box would have gone.
- **The figure stage is the only drawn rectangle in the book.** Inside it the rule still holds. If a control genuinely must declare its own extent, the sorting activity's single square hairline is the pattern.
- A readout's sentence is read by a person in every state its parts can take. `secretion` stage 7 read "In the outside the cell."
- A readout says what the figure is doing now. `prokaryote` described an intact wall in its envelope paragraph while the line above it said the wall was gone.

### Controls

- Control rows are grouped by what they do — what to show, what to change, what to run — with space between the groups and none inside one.
- **The primary action looks primary**, told by `--rule-head` on its edge and the ink's weight, never by a fill.
- Everything is reachable and operable by keyboard, and nothing depends on hover: a tap is a hover and a click in one gesture, and the hover gets there first (defect register, 2026-09-12).
- A control's narrow label is the same word as its wide label, because an item's goal quotes it. Four chapter-3 goals had to be reworded when `surface-volume`'s phone labels turned out to be "Villi", "Rod", "Disc" and "Clock".

### Labels

- **Every label is placed so that it cannot collide** — with another label, with the line or shape it names, with the toolbar, or with the edge of the stage. At every stage of a run, at every width, in both themes.
- A collision is a state, not a layout: it appears at one slider value and not another. `waterprops` collided at the chart origin, `plantcell3d`'s slider label wrapped and pushed the toolbar over the nucleus labels, `prokaryote` at 390 px overprinted three envelope labels, `cilium` at 390 px clipped its section chip and ran a card under the toolbar.
- A label drawn off the stage is not a label. `plantcell3d` labelled a channel 11 µm outside the frame.

### The narrow composition

- **A figure whose type would fall below about nine device pixels on a phone carries a second composition, not a scaled-down first one.** Nine device pixels is about three CSS pixels on a 3× phone; 7 CSS px is about 21 device px and passes.
- A figure that can fill any shape declares a `narrowAspect` in the registry. Say here what the narrow composition drops, stacks or re-orients.
- `npm run narrow` proves the narrow layout mounts, draws something that is not blank, flat or near-black, and survives a press. It says nothing about legibility, which is why it writes `out/narrow/` at three times scale.
- **Somebody looks at every figure at 390 px, at 3×, in both themes, before it is called done.** Five figures gained a second composition with no gate over any of that code, and chapter 2's eight were first looked at narrow days after they had been accepted at desktop width.

### Geometry

- **No negative and no `NaN` geometry, at any width.** A chapter-3 figure handed the DOM `<rect width="-0.1">` at tablet and desktop but not at phone; it reached main, was pushed, and logged console errors on the live site.
- Clamp every computed width, height, radius and length where it is computed. A `NaN` on an attribute the browser ignores fails silently, so guard the arithmetic rather than waiting for a console error.

### Colour, determinism and the contract — these the gates hold

- Colour comes from `ctx.palette` or the CSS variables, never a new hex (`test/palette.test.js`, and the one element and one organelle table in `test/element-table.test.js` and `test/organelle-table.test.js`).
- No `Math.random`: a seeded generator, so `setTime(t)` reproduces a frame exactly. `test/element-table.test.js` fails any `Math.random()` anywhere under `src/figures/`.
- The module contract — `meta`, `mount(root, ctx)` returning `destroy`, `setTime`, `describe`, `setVisible`, optional `setTheme`, and `setView` for 3D — is in [textbook.md](../../docs/design/textbook.md) and held by `test/registry.test.js`, `npm run drive` and `npm run sweep3d`.
- Under `prefers-reduced-motion` the figure still works and nothing moves until the reader moves it.

### `describe()`

Three things read it: `npm run drive`, `npm run narrow`, and every `task` item in `items.js`. Write it for them.

- **It may not report `id`, `kind`, `number` or `state`.** The frame owns those four and spreads them last, so a figure using one would lose its own value without a word. `npm run drive` fails it. `foldlab` reports `foldState`; `plantcell3d` reports `turgorState`. **Nor may a bench figure report `layout`**, which the bench adds itself (`BENCH_DESCRIBE_FIELD` in `lib/bench.js`). No field in this brief uses any of the five, and none may be added — which is why 8.3 reports `rule` and 8.4 reports `phase`, rather than either being called a state or a mode.
- Report the numbers in the units the prose uses, so a task's goal and the readout agree. In this chapter that means nanometres for every length in a molecule, base pairs for every length of DNA, grams per cubic centimetre for every density, nucleotides per second for every fork speed, minutes for every copying time, and **errors per base pair per round of copying** for every error rate — with any other denominator named in the field, as `errorsPerDaughterCell` is.
- Every field an item can name must be reachable through the reader's own controls, and **must not become true on its own as the clock runs** — otherwise the only load-bearing clause in the expectation is the one proving the reader acted.
- The task grammar (`src/components/task.js`) compares a field with a literal and never with a second field, reads `.length` and `[n]`, and has `~` for "contains" on a string or a list. A list of short words — `ruledOut: ['conservative']` — is therefore gradable as `ruledOut ~ conservative`, and several fields below are lists for that reason.

### A figure's words are prose

A sentence inside a figure module is read by the same reader and is corrected when the chapter is. `symbiont.js` carried a claim about mitochondrial division machinery for days after the prose had dropped it as wrong. **Two sentences in this chapter are ones its figures turn on, and a figure that contradicts either is wrong however good it looks**: that DNA polymerase adds only to a 3′ end; and that the lagging strand follows from that fact and the antiparallel strands, and from nothing else. The second does not mean that changing either fact removes the lagging strand. A polymerase able to add at either end would remove it at every fork; strands running the same way would only move it, to the fork leaving the origin the other way, where both new strands would be made in fragments (§8.4). And one historical sentence, which the chapter spends a section on: **the helix, its dimensions, the outside backbones and the symmetry that makes the chains antiparallel were measured in Franklin's laboratory.** A figure that labels a measurement "Watson and Crick" is wrong.

---

## 8.1 · `helix-lab` — Read the photograph, then build the pairs

**What it shows.** Two scenes, chosen with a control.

**The photograph.** On the left, a helix the reader builds, drawn from the side: one, two or three strands of a given radius and pitch, with a dot at each repeating unit. On the right, in a canvas pane, **the X-ray fibre-diffraction pattern that helix would give**, recalculated as the reader changes it, with hairline marks at the positions measured on Franklin's B-form photograph: the spacing of the layer lines, the heavy meridional arc, the spread that gives the diameter, and a mark at the fourth layer line saying *missing*. It opens on a single strand whose pitch, spacing and radius are all off the B-form values, so the pattern is a cross in the wrong place and the reader's first act is to move it.

The physics, which the worker must get right because the figure's whole claim is that the pattern follows from the helix. Layer lines lie at height *Z* = *l* / *P* for pitch *P*. For a helix of *N* = *P* / *h* units per turn, with *h* the rise per unit, the Bessel orders contributing to layer line *l* are those with *l* = *n* + *mN* for whole *m*, and the amplitude on that line at reciprocal radius *R* goes as *J<sub>n</sub>*(2π*rR*) for helix radius *r* — so the lowest orders give the cross, the order-zero term on layer line *N* gives the meridional arc at 1/*h*, and the arms' slope is set by *r* / *P*. Two strands offset along the axis by a fraction *f* of the pitch multiply layer line *l* by 1 + e<sup>2π*ilf*</sup>, whose square is 4 cos<sup>2</sup>(π*lf*): at *f* = 3/8 that vanishes on the fourth layer line and on no other of the first nine, and at *f* = 1/2 it removes every odd one, which is a different photograph. Restrict *N* to whole numbers (the rise control steps rather than slides) so the selection rule stays exact, and blur by a stated amount for the disorder of a fibre. Say in the module header that the pattern is a calculation from the model, not Photograph 51, which the figure must not reproduce or imitate as a photograph.

**The pairs.** Two backbone rails 2 nm apart, which is the width of the helix measured at its phosphates, and the stage says so. A pair's own width, `pairWidthNm`, is measured between the C1′ atoms of its two sugars, about 1.1 nm across a Watson–Crick pair, and the stage names those atoms too, so that no reader takes a pair drawn about half as wide as the gap for a pair that does not fit. The reader chooses a base for each strand and sees the pair drawn to scale: purine against pyrimidine fits; two purines are too wide and two pyrimidines too narrow; of the purine–pyrimidine pairs only A with T and G with C make their hydrogen bonds, two and three, without distortion. A **tautomer** control redraws guanine or thymine in the rare form the old textbook drawings showed: the usual partner no longer pairs, and the wrong one does — a rare thymine presents cytosine's pattern of hydrogen-bond donors and acceptors and pairs with guanine, and a rare guanine pairs with thymine — which is one way copying goes wrong (§8.2). A **strand direction** control runs the partner strand parallel instead of antiparallel, and the sugars come out on the wrong side of the pair for the backbone. An **Add pair** action builds a short duplex of the pairs that fit, with a running count of A, T, G and C that obeys Chargaff's rules because the pairing does.

**What the reader does.**
- **Scene**: *The photograph* or *The pairs*.
- In the photograph: **Strands** (1, 2, 3), **Pitch**, **Rise per base** (stepped so that bases per turn is a whole number), **Radius**, and **Offset** of the second strand in fractions of a turn; **Show the measurements** overlays Franklin's positions.
- In the pairs: **Left base**, **Right base**, **Tautomer** (*usual*, *rare*), **Strands run** (*antiparallel*, *parallel*), **Add pair**, **Reset**.

**Objectives it teaches.** `chargaff-rules`, `diffraction-reading`, `antiparallel`, `pairing-geometry`, `franklin-contribution`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'photograph' \| 'pairs'` |
| `strands` | number | 1, 2 or 3 |
| `pitchNm`, `riseNm`, `radiusNm` | number | the model's |
| `basesPerTurn` | number | `pitchNm ÷ riseNm`, computed |
| `offsetTurns` | number | the second strand's axial offset, as a fraction of a turn |
| `layerLineSpacingPerNm` | number | 1 ÷ `pitchNm`, computed |
| `meridionalPerNm` | number | 1 ÷ `riseNm`, computed |
| `missingLayerLines` | number[] | the layer lines from 1 to 9 whose strand interference factor falls below 0.05, computed; `[4]` at the B values and never `[4]` for one strand |
| `matchesPhotograph` | boolean | computed: two strands, pitch 3.4 ± 0.1 nm, rise 0.34 ± 0.01 nm, radius 0.9–1.1 nm, and `missingLayerLines` exactly `[4]` |
| `leftBase`, `rightBase` | string | `'A' \| 'T' \| 'G' \| 'C'` |
| `pairType` | string | `'purine-pyrimidine' \| 'purine-purine' \| 'pyrimidine-pyrimidine'`, computed |
| `pairWidthNm` | number | C1′ to C1′, computed from ring geometry the header names with its source; the same, to within the precision the figure shows, for either Watson–Crick pair, which is the claim. About 1.05 nm in standard structural tables (the accuracy review of 2026-09-24, from memory); the built module computes 1.07 and 1.08 from its ring geometry and reports both as 1.1. Not the 2 nm between the rails, which are measured at the phosphates |
| `hydrogenBonds` | number | 0, 2 or 3, computed |
| `pairFits` | boolean | computed from width, bonds, tautomer and strand direction together |
| `whyNot` | string \| null | `'too-wide' \| 'too-narrow' \| 'no-hydrogen-bonds' \| 'rare-tautomer' \| 'sugars-misplaced'`; null when it fits |
| `tautomer` | string | `'usual' \| 'rare'` |
| `strandsRun` | string | `'antiparallel' \| 'parallel'` |
| `pairsBuilt` | number | |
| `countA`, `countT`, `countG`, `countC` | number | in the duplex built |
| `chargaffHolds` | boolean | computed: `countA === countT` and `countG === countC` |
| `t` | number | clock, seconds, three decimals |

**Why it is a mechanism.** The fourth layer line disappears at one offset and no other, in front of the reader who moved the slider there, which turns "the photograph showed two strands" from an assertion into a calculation the reader can check; and in the pairs scene every wrong combination fails for a reason the figure names.

**Narrow composition.** Second composition. A helix beside its pattern at 390 px puts both below legibility. Below 800 px the helix sits above the pattern, both full width, with the measurement marks labelled beside the pattern rather than on it, and the five sliders become steppers keeping their desktop labels. The pairs scene stacks the pair drawing above the duplex strip and the count beneath it.

---
## 8.2 · `meselson-stahl` — The three schemes, on a switch

**What it shows.** A culture moved from heavy nitrogen to light, a centrifuge tube in which the DNA from the current generation settles into bands, drawn as the dark lines of an ultraviolet photograph on the tube's pale ground, and beside the tube the double helices of the population, each strand drawn heavy or light by the stroke-weight rule above. A control chooses the scheme and the molecules and the predicted bands follow it. It opens at generation 0 under the semiconservative scheme with the data hidden, showing one heavy band.

The densities are the 1958 paper's (*PNAS* 44:671): <i>E. coli</i> DNA at about 1.71 g/cm<sup>3</sup> and fully <sup>15</sup>N DNA 0.014 denser. The figure places light DNA at 1.710, heavy at 1.724 and hybrid halfway, which is those two numbers and nothing more precise, and its header says so. Under the dispersive scheme every molecule at generation *g* has the density 1.710 + 0.014 × (1/2)<sup>*g*</sup>, a single band moving towards light. **Heating** separates strands, and single strands band at their own, higher densities: heated hybrid DNA gives two bands in equal amounts, 0.015 g/cm<sup>3</sup> apart, as the paper's own heating experiment did; heated dispersive DNA a single intermediate band — and heated conservative DNA at generation 1 *also* gives heavy and light single strands in equal amounts, so the heat test separates the dispersive scheme from the other two and not the conservative scheme from the semiconservative one. The figure must model that exactly; it is the kind of thing a reader will test.

**What the reader does.**
- **Scheme**: *Semiconservative*, *Conservative*, *Dispersive*.
- **Generation**, stepping 0 to 4.
- **Show the 1958 data**, which lays the bands Meselson and Stahl photographed over the prediction.
- **Heat**, which denatures the DNA of the generation shown.
- **Reset**.

**Objectives it teaches.** `template-principle`, `three-models`, `density-labelling`, `meselson-stahl-result`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scheme` | string | `'semiconservative' \| 'conservative' \| 'dispersive'` |
| `generation` | number | 0 to 4 |
| `bands` | object[] | `{ name, densityGcm3, fraction }` for the prediction shown; `name` is `'heavy' \| 'hybrid' \| 'light' \| 'intermediate'` |
| `bandCount` | number | `bands.length` |
| `dataShown` | boolean | |
| `observedBands` | object[] | the 1958 result at this generation, same shape |
| `matchesData` | boolean | computed: the prediction's bands equal the observed bands at this generation |
| `ruledOut` | string[] | the schemes whose prediction fails at any generation from 1 up to the one shown: `[]` at 0, `['conservative']` at 1, `['conservative', 'dispersive']` from 2 — a property of the generation, computed, never set by a button |
| `heated` | boolean | |
| `strandBands` | object[] | when heated, the single-strand bands, same shape; empty otherwise |

**Why it is a mechanism.** The reader drives each rival to the generation where its prediction parts from the photograph, and sees that one generation is not enough for the dispersive scheme — which is the misreading of this experiment most readers bring to it.

**Narrow composition.** Second composition. Below 800 px the tube keeps its full height on the left of a two-column layout and the molecules stack to its right in a single column, fewer of them drawn; the table of bands moves beneath as rows of type. The narrow stage is 2 / 3, not the 4 / 5 first planned: at 4 / 5 the tube's scale shrank to about 52 px, the toolbar took 23 per cent of the height and the table of bands was cut off (the figure's builder, 2026-09-24). Heated with the 1958 data shown, the whole table would need about 210 to 240 px, where a 360 px phone gives it 183 and a 390 px one 204, so it gives up whole parts in a fixed order and never a line of a sentence: the bands before heating first, then the schemes ruled out, then the sentence on what heat does. Two sentences have a phone's wording a line shorter, so that 360 px gives up the same parts as 390 px, except at the dispersive scheme's generation 1, where 390 px also keeps the schemes ruled out.

---
## 8.3 · `replication-fork` — The fork, with its chemistry left in

**What it shows.** Two scenes.

**The fork**, drawn along the stage's length. Ahead, the parent helix being opened by a helicase, with a topoisomerase working further ahead and the twist that builds up in front of the fork drawn as coiling of the unopened DNA. Behind, the two templates, single-strand binding protein on the one waiting to be copied, and two new strands: the leading strand extended continuously towards the fork, and the lagging strand made backwards in fragments, each begun on a dashed RNA primer near the fork, later replaced with DNA by a second polymerase that cuts the RNA away ahead of itself, and joined by ligase. Each nucleotide added releases a pyrophosphate, counted. It opens with the fork just leaving its origin, one primer on each template, paused.

**The whole chromosome.** A chromosome drawn to scale as a line, its origins marked, forks leaving each origin in both directions at the organism's speed, and a clock. For *E. coli*, one circle, one origin, two forks at about 1000 nucleotides a second, finishing in about forty minutes. For human chromosome 1, 249 million base pairs, either **one origin** or **its real share of the cell's origins**, fired at different times through the eight hours of copying, with forks at the human speed.

**What the reader does.**
- **Run**, **Pause**, **Step**, **Reset**.
- **Remove an enzyme**: *Helicase*, *Topoisomerase*, *Primase*, *Ligase*, *Primer removal*. Each shows its own failure: no unwinding; twist building until the fork stalls; no new fragment started; fragments never joined; primers left in the finished strand.
- **Rules**: *As they are*, *Strands run the same way*, *Polymerase can add at either end*. The last two are marked as hypothetical wherever they appear. Under *Polymerase can add at either end* both new strands are made continuously at every fork. Under *Strands run the same way* the two new strands at the fork travelling one way both grow towards it and are made continuously, but at the fork leaving the same origin in the other direction both point away from it and must be made in fragments: the lagging strand moves, and does not go (§8.4; finding 1 of the accuracy review of 2026-09-24). If the stage draws one fork it says so, and says what the other fork would do; if it draws both, fragments go on being started under that rule. This is the figure's central claim: the lagging strand follows from the two facts, and only a polymerase able to add at either end removes it everywhere.
- **Add a chain terminator** to the nucleotide pool: the next strand that takes one in stops there.
- **Scene**: *Fork* or *Whole chromosome*; in the second, **Organism** (*E. coli*, *Human chromosome 1*) and **Origins** (*One*, *All*).

**Objectives it teaches.** `polymerase-requirements`, `pyrophosphate-pull`, `primer-needed`, `lagging-strand`, `fork-machinery`, `origins-arithmetic`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'fork' \| 'chromosome'` |
| `rule` | string | `'as-they-are' \| 'same-direction' \| 'either-end'` |
| `laggingContinuous` | boolean | computed; true only under `'either-end'`, the one rule under which no new strand at any fork is made in fragments. **False in every reachable state under `'as-they-are'`**, and false under `'same-direction'`, where the fragments have moved to the other fork |
| `strandsInFragments` | number[] | computed from the rule: how many of the two new strands are made in fragments at the fork drawn and at the fork leaving the same origin the other way — `[1, 1]` under `'as-they-are'`, `[0, 2]` under `'same-direction'`, `[0, 0]` under `'either-end'` |
| `removed` | string[] | the enzymes taken away |
| `unwoundNt` | number | how far the fork has opened |
| `leadingLengthNt` | number | |
| `fragmentsStarted` | number | at the fork drawn; 0 under `'either-end'`. Under `'same-direction'` it is 0 only if the fork drawn is the one whose new strands both grow towards it, and then the stage says that the fork leaving the origin the other way starts fragments on both its strands |
| `primersInPlace` | number | RNA primers not yet replaced |
| `nicksUnsealed` | number | |
| `pyrophosphateReleased` | number | one per nucleotide added, computed from the lengths made |
| `twistAheadTurns` | number | turns of overwinding ahead of the fork, about one per ten base pairs opened less those a topoisomerase has removed |
| `forkStalled` | boolean | computed |
| `stalledBecause` | string \| null | `'no-helicase' \| 'twist'`; null while moving |
| `chainTerminated` | boolean | a strand has stopped at a terminator |
| `organism` | string | `'e-coli' \| 'human-chr1'` |
| `origins` | string | `'one' \| 'all'` |
| `originCount` | number | |
| `forkSpeedNtPerS` | number | the organism's, from the prose's sources, stated in the header |
| `copiedPercent` | number | |
| `elapsedMinutes` | number | |
| `finishMinutes` | number | computed from the chromosome length, the origins and the speed |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader changes each fact the lagging strand depends on and watches what follows — with a polymerase that adds at either end the fragments vanish from every fork, and with strands that run the same way they only move to the fork leaving the origin the other way — which is the only way "a consequence of two facts" becomes something shown rather than said; and the one-origin human chromosome takes about a month on the clock the reader is watching.

**Narrow composition.** Second composition. A fork stretched along a 21 / 9 stage becomes a 390 px strip in which every protein label falls under nine device pixels. Below 800 px **the fork turns through 90 degrees**: the parent helix runs down the stage from the top, the fork moves downwards, and the two new strands run beside each other below it, with labels to the side. The readouts become rows of type beneath, and the rules control keeps its desktop labels. The table beneath has 29 per cent of the height above the controls and takes more from the fork only when its sentences need it: a changed rule's sentence with an enzyme's or a terminator's runs to four lines at a 360 px phone, where that share holds three. The whole-chromosome scene keeps a horizontal chromosome at full width, since a line is legible at any width, with the clock and counts beneath.

---
## 8.4 · `chromosome-end` — One round of copying at the tip

**What it shows.** The last few thousand base pairs of a linear chromosome, drawn with its telomere repeats as a run of short ticks, six base pairs to a tick, and its single-stranded 3′ overhang at the tip. Two phases of one division can be stepped through. **Copying**: the fork arrives at the end, the leading strand runs off with its template, and the last lagging-strand fragment is begun on a primer at or near the tip. **After**: the primers are removed, every gap but the last is filled by extending the fragment beyond it, and the last gap stays open, because there is nothing beyond it; both new ends are trimmed to restore the overhang, and the one made by the leading strand is a tail's length shorter than its parent, the other no shorter, so the average end is shorter by a counted number of base pairs. It opens before the first division, paused, at the starting length stated in the header.

The numbers, with their sources, for the header: the repeat is TTAGGG; a telomere is about 10,000 base pairs at birth (mean 9.5 kb in the blood cells of newborns, Factor-Litvak et al. 2016); fibroblasts in a dish lose about 50 base pairs per division (Levy et al. 1992, *J Mol Biol*, from the same group as Harley et al. 1990); the overhang is roughly 75 to 300 nucleotides (Wright et al. 1997; Makarov et al. 1997); and telomerase's RNA carries an 11-nucleotide template, 3′-CAAUCCCAAUC-5′, which is what the figure draws pairing with the overhang. **The threshold at which the cell stops is a model value, not a measurement**: it is set so that the defaults — 10,000 base pairs, 50 lost per division — stop the cell at about fifty divisions, which is Hayflick's figure for fetal fibroblasts (Hayflick 1965), and the header must say that it was chosen that way. With those defaults the cell stops with 7,500 of its 10,000 pairs left, three-quarters of where it began, so the stage must also say why a cell stops with so much left: it is the shortest of its telomeres, not the average one, that stop it (§8.7). Otherwise the stop looks arbitrary.

**What the reader does.**
- **Step** through the two phases of one division; **Divide** (the primary action) runs a whole division; **Run divisions** repeats until the cell stops or the reader pauses.
- **Telomerase**, on or off. On, it is drawn as an enzyme carrying a short dashed RNA template whose bases pair with the overhang; it adds one repeat, shifts, adds another, and primase and polymerase then fill in the partner strand. The length holds.
- **Loss per division**, from 40 to 100 base pairs, opening at 50.
- **Shape**: *Linear* or *Circular*. Circular has no end, and the problem does not arise.
- **Reset**.

**Objectives it teaches.** `end-replication-problem`, `telomerase`, `divisions-counted`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `phase` | string | `'before' \| 'copying' \| 'after'` within the current division |
| `divisions` | number | completed |
| `telomereBp` | number | current length |
| `startBp` | number | the starting length, stated in the header |
| `lossPerDivisionBp` | number | the setting |
| `lostLastDivisionBp` | number | computed from what the last division did; 0 with telomerase on or on a circle |
| `gapAtEnd` | boolean | computed: true in phase `'after'` on a linear chromosome without telomerase |
| `overhangNt` | number | |
| `telomerase` | boolean | |
| `repeatsAdded` | number | by telomerase, since reset |
| `shape` | string | `'linear' \| 'circular'` |
| `senescent` | boolean | computed: the telomere has fallen to the threshold stated in the header; the cell stops dividing |
| `divisionsLeft` | number \| null | computed from the length, the threshold and the loss; null with telomerase on or on a circle |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The gap at the tip is drawn in the one place the lagging strand's own rule forbids filling, and the reader counts the divisions to a stop and then removes the stop with an enzyme that carries its own template.

**Narrow composition.** Second composition. Below 800 px the chromosome end runs down the stage, tip at the bottom, so the repeats keep a legible spacing; the telomerase action is drawn beside the tip, and the readouts become rows of type beneath.

---
## Notes for whoever registers these

- **`narrowAspect` for all four**, values in the table at the head of this brief, and **all four carry a genuine second composition**, each for the reason in its own block: each is a scene beside a readout or a long thing drawn at true proportion (a helix and its pattern, a tube and its molecules, a fork, a chromosome end), which is the shape that never survives a 390 px stage.
- **No WebGL figure**, so `npm run sweep3d` has no chapter-8 entry.
- **Every kind needs a recipe in `tools/drive.js` or `npm run drive` fails**, so the recipes can be written from this brief before the modules exist. The fields worth asserting after driving are the **computed** ones and never the ones a button sets: `missingLayerLines` and `matchesPhotograph` and `pairFits` and `chargaffHolds` (8.1); `ruledOut` and `matchesData` and `strandBands` (8.2); `laggingContinuous` and `forkStalled` and `pyrophosphateReleased` (8.3); `gapAtEnd` and `lostLastDivisionBp` and `senescent` (8.4).
- **`tools/pages-exclude.txt` needs no new line, and adding one would be a mistake.** It holds `**/*.md`, a class and not an instance, so `biology/ch08-dna/FIGURES.md` is excluded from the published tree without anybody naming it. Confirm rather than assume: `node tools/pages-exclude.js` prints this file among the paths it trims.
- **Four invariants a reviewer must check by hand, because no gate can.** Each is a figure's whole claim reduced to one field, and each would look perfectly healthy if it were quietly wrong. `missingLayerLines` is `[4]` at the B-form values in 8.1 and is never `[4]` for a single strand. `ruledOut` in 8.2 does not contain `'dispersive'` at generation 1 — the obvious implementation, which eliminates both rivals as soon as the first band is hybrid, is exactly the misreading the chapter's third check question is written against. `laggingContinuous` is false in every reachable state of 8.3 under the real rules, including with every enzyme removed in turn, and false under *Strands run the same way*, which moves the fragments to the other fork rather than removing them. And `gapAtEnd` is never true on a circle or with telomerase on in 8.4.
- **Numbers a figure may not invent**, because the prose states them and a figure disagreeing with the prose is the defect this brief's section on a figure's words is about: a helix 2 nm wide, 3.4 nm a turn and 0.34 nm a base, with the fourth layer line missing at an offset of three-eighths of a turn (8.1); about 1.71 g/cm<sup>3</sup> for light DNA and 0.014 more for heavy (8.2); the fork speeds, the forty minutes, the eight hours, chromosome 1's 249 million base pairs and the 30,000 to 50,000 origins (8.3); about 50 base pairs lost from each end per division in a dish, an overhang of roughly 75 to 300 nucleotides, and about fifty divisions for cells from fetal tissue (8.4).
- **A later chapter is expected to mount one of these.** Chapter 10's S phase is `replication-fork`'s whole-chromosome scene. Build it so chapter 10 can mount it with a different preset rather than needing its own copy, and say in the module header that chapter 10 is expected to ask — the convention chapter 5's brief established and chapters 6 and 7 used.
