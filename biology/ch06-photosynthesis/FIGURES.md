# Chapter 6 — figure brief

Eight figures, in the order they appear in `index.html`. The figure number is fixed by that order and the prose cites every one of them by number, so the order does not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 6.1 | `photon-lab` | `fig-photon` | opener, cited in 6.1 | no | 16 / 9 | 4 / 5 |
| 6.2 | `chloroplast3d` | `fig-chloroplast` | 6.2 | **yes** | 16 / 10 | 1 |
| 6.3 | `pigment-spectra` | `fig-pigments` | 6.3 | no | 16 / 9 | 3 / 4 |
| 6.4 | `zscheme` | `fig-zscheme` | 6.4 | no | 16 / 10 | 3 / 4 |
| 6.5 | `proton-ledger` | `fig-protons` | 6.5 | no | 16 / 9 | 4 / 5 |
| 6.6 | `calvin-cycle` | `fig-calvin` | 6.6 | no | 16 / 10 | 1 |
| 6.7 | `rubisco-fork` | `fig-rubisco` | 6.7 | no | 16 / 9 | 3 / 4 |
| 6.8 | `carbon-concentrator` | `fig-c4cam` | 6.8 | no | 16 / 10 | 4 / 5 |

Kind ids and figure ids are clear of every other chapter's, checked against `src/figures/registry.js` and against every `id="fig-…"` in `biology/*/index.html` on 2026-09-17. The registry then held forty-four kinds: `pond`, `homeostasis`, `levels`, `scale`, `cell3d`, `dna3d`, `energy`, `tree`, `pasteur`; `soup`, `bondlab`, `water3d`, `waterprops`, `phlab`, `carbonkit`, `polymer`, `foldlab`; `microscopes`, `surface-volume`, `prokaryote`, `secretion`, `symbiont`, `cytoskeleton`, `cilium`, `plantcell3d`; `bilayer`, `membrane3d`, `permeability`, `osmometer`, `transport-lab`, `pump`, `gradient-battery`, `bulk-transport`; `entropy-ledger`, `free-energy`, `atp3d`, `coupling-bench`, `activation-barrier`, `enzyme-kinetics`, `feedback-pathway`, `metabolic-map`; `zj-split`, `zj-timeline`, `zj-words`. Chapter 7 was being written at the same time as this brief and its eight kinds — `respiration-tour`, `glycolysis`, `krebs`, `respiratory-chain`, `atp-synthase`, `yield-ledger`, `fermentation`, `uncoupler-bench` — and its eight figure ids were checked against these and are clear of them.

Two names worth stating the reasoning for. `chloroplast3d` rather than `chloroplast`, because chapter 3 already has `plantcell3d` and the suffix is this book's mark for a figure the reader turns over. And `proton-ledger` rather than anything with *gradient* in it, because `gradient-battery` is §4.7's and a reader landing in the lab should not have to guess which of the two they asked for.

**One WebGL figure, and the argument is specifically about topology.** The claim §6.2 rests on, and which §6.5 then spends, is that the thylakoid is a *third* membrane system suspended inside the second, enclosing a space that is one connected volume across a whole chloroplast. A cross-section cannot show that: a slice through a granum looks like a stack of separate discs, which is the wrong answer, and a diagram asserting the connection is a diagram asking to be believed. Turning the thing over and filling the lumen from one point is the only way a reader can check it. The other seven subjects are spectra, ladders, ledgers, a cycle and a comparison, all of which a composed 2D view states better than a perspective one.

## Palette: what this chapter needs, which is less than it looks

Read the long comment above `MEMBRANE` in `src/palette.js` before adding anything, and then read the one above `METABOLISM`, which ends with an instruction addressed to this chapter: *"Chapters 6 and 7 are unwritten, so their frames were not measured and are not claimed: whoever draws a membrane with an enzyme in it re-measures `enzyme` against `channel` (6.1) first."* Figures 6.5 and 6.8 both draw an enzyme in a membrane. That re-measurement is the registrar's first job and it is not optional.

Almost everything this chapter draws already has a colour, and a figure here may not invent its own version of any of them:

- **The chloroplast and the thylakoid membrane have colours already** — `chloroplast` and `thylakoid` in `src/figures/lib/cell3-colours.js`, made for `plantcell3d` and measured there. Figures 6.2 and 6.5 take them unchanged. Figure 6.2 sits beside Figure 3.8 in a reader's memory and they must not be two different greens.
- **A proton is an ion**, and chapter 2 fixed one colour for every ion — `leaf`, with the symbol written on it, in `ELEMENTS` and `atomColours` in `src/figures/lib/chem-atoms.js`. H<sup>+</sup> takes that. Do not give the chapter's most-drawn particle a colour of its own.
- **NADP<sup>+</sup> and NADPH take `electronCarrier` and `electronCarrierLoaded`** from `METABOLISM`, unchanged, and they are labelled rather than recoloured. §6.4's argument is that the extra phosphate carries no energy and is a label a protein reads; a figure that gave NADPH its own hue would be contradicting the prose in the one place the prose is least intuitive.
- **ATP takes `atp`**; the phosphate it transfers is the violet P of `ELEMENTS`, per the thrown error in `metabolismPart('phosphate')`.
- **Rubisco, PEP carboxylase and ATP synthase take `enzyme`.** An enzyme is not a carrier and never takes the carrier's violet.
- `lipidHead` and `lipidTail` for any membrane drawn edge-on; `glucose` for the sugar that leaves; `peroxisome` from `ORGANELLES` for §6.7's salvage; `mitochondrion` for the third stop on that route.

That leaves **two asks, and one of them is an exception the registrar has to rule on.**

1. **Chlorophyll needs a value distinct from the membrane it sits in.** Figures 6.3 and 6.4 draw hundreds of pigment molecules held in a membrane, and `thylakoid` is already `mix(chloroplast, ink, 0.35)`. One more value on the same hue, lighter, is the whole request; it must clear the book's floor against `thylakoid` and against `enzyme`, both of which share a frame with it in 6.4.
2. **The spectrum in Figure 6.3 is a genuine exception to the one-colour-table rule, and it needs a decision rather than a workaround.** That figure's subject is *which wavelengths are absorbed*, and a wavelength axis drawn in the tokens would be a chart about colour with the colour removed. The same goes for the swatch showing what a leaf transmits, which is the answer to "why is a leaf green" and has to be that green. The proposal is a single function, `spectrumColour(nm)`, living beside the tokens rather than inside the figure, documented as the book's one place where a colour is a measurement and not a choice, and used by nothing else. If the registrar refuses it, say so in the module header and re-compose the figure around a greyscale axis with named bands — but note what is lost, because §6.3's key idea is that a leaf's colour is a leftover, and a reader who cannot see the leftover has been told rather than shown.

Light itself is **not** a colour anywhere else. Like heat in chapter 5 it is drawn as motion and set as type: a photon in 6.1 and 6.4 is a mark travelling and a number in `inkSoft`, not a glow.

## What every figure here owes

Nothing in this section is answered by a gate unless the line names one. The gates prove that a figure mounts, reports what it claims and survives being pressed; every judgement below is a person's, made at the artefact's own resolution, in both themes, at the widths a reader uses.

**A 2D figure is built on `src/figures/lib/bench.js`.** It is not a framework: it is a function called inside `mount` that returns the object the frame already expects. What that means for the block you write below is that four of the lines in this section stop being yours to remember and become the bench's to enforce — the readout cannot be a pill, a chip, a bordered box or a progress bar because `readout()` emits only `<text>` and `<line>`; the primary action is `primary: true` and the bench renders it as `--rule-head` on the edge and the ink's weight, never as a fill; a control's narrow label is a second span and its accessible name is the long label at every width, by construction; and a negative or `NaN` dimension throws in the lab instead of reaching the DOM, because `pane.rect` and its siblings are the only way to a dimension attribute. `test/bench.test.js` fails a bench figure that defines `mulberry32`, makes its own `ResizeObserver`, writes `border-radius` or `border:` in its own CSS, or calls `el('rect'|'circle'|'line'|'ellipse')` directly.

Everything else in this section is still yours, and the honest list of what the bench does **not** reach is in [figure-bench.md](../../docs/design/figure-bench.md): whether a composition is *good*, whether a label collides at one slider value and not another, whether an assembled sentence is grammatical in every state, and whether the type is legible at 390 px. The bench is finished before the chapter's figure workers start and none of them may extend it — if it cannot do something, drop through to `pane.add()` for that one thing and propose the extension for the next chapter. The six WebGL figures keep `lib/three-common.js` for the scene and take only the chrome; the 資治通鑑 figures take nothing, because the bench's text fitting is an advance estimate measured on Inter over mixed-case Latin.

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

- **It may not report `id`, `kind`, `number` or `state`.** The frame owns those four and spreads them last, so a figure using one would lose its own value without a word. `npm run drive` fails it. `foldlab` reports `foldState`; `plantcell3d` reports `turgorState`. No field in this brief uses any of the four, and none may be added — which is why 6.1 reports `source` and `exit`, 6.5 reports `acidBath` and 6.7 reports `era` rather than any of them being called a state.
- Report the numbers in the units the prose uses, so a task's goal and the readout agree. In this chapter that means nanometres for every wavelength, kilojoules per mole for every energy, volts for every redox potential, parts per million for carbon dioxide in air, pH units for the gradient and degrees Celsius for every temperature.
- Every field an item can name must be reachable through the reader's own controls, and **must not become true on its own as the clock runs** — otherwise the only load-bearing clause in the expectation is the one proving the reader acted.

### A figure's words are prose

A sentence inside a figure module is read by the same reader and is corrected when the chapter is. `symbiont.js` carried a claim about mitochondrial division machinery for days after the prose had dropped it as wrong. **Four sentences in this chapter are ones the whole chapter turns on, and a figure that contradicts any of them is wrong however good it looks**: that a photon is absorbed whole or not at all; that chlorophyll absorbs green *least* and a leaf still absorbs most of it; that the proton gradient, and not any molecule, is the intermediate between the light reactions and the ATP; and that rubisco's confusion is a consequence of an atmosphere that changed rather than a fault to be sneered at.

---

## 6.1 · `photon-lab` — What a photon is worth, and what it does

**What it shows.** Two things stacked. Across the top, the visible spectrum as a wavelength axis with a marker on it, and beside it a readout giving the energy of one photon and of a mole of them, with three fixed comparison marks the reader chooses between: the thermal jostling in a leaf at 25 °C (2.5 kJ/mol), a carbon–carbon bond (350), and one ATP inside a cell (50). Below, one pigment molecule with two orbitals drawn and its electron in the lower one. It opens at 680 nm, unfired, with the thermal mark selected, because the first thing a reader should do is fire one photon and the second is read the ratio.

**It must be honest about what it is.** The module header states that the molecule is a cartoon of two orbitals and not a computed one, that the gap is set to 680 nm to match chlorophyll a's red peak, and that the energies are exact — E = 119 626 / λ(nm) kJ/mol, from Planck's constant, the speed of light and Avogadro's number — so a reader who checks the arithmetic against the chapter's table will find it agrees. The claim the figure makes is that absorption is all-or-nothing and that heat cannot substitute, and a figure that quietly absorbed a mismatched photon would be making no claim at all.

**What the reader does.**
- **Wavelength** slider across the visible range, with the marker moving on the spectrum and both energies recomputing.
- **Fire one photon.** If its energy does not match the gap, nothing happens at all and the readout says so in words — not "partially absorbed", which is the misconception. If it matches, the whole photon vanishes and the electron jumps.
- **Compare with** — a three-way control choosing which fixed mark the ratio is taken against.
- **Excited molecule on the ladder.** Once promoted, the molecule is drawn on a vertical scale of how readily it gives an electron away, and it has moved a long way up it. This is the one panel that makes "energised" mean something.
- **Four exits**, offered as four controls once the molecule is excited: **Pass it on**, **Give the electron away**, **Fluoresce**, **Let it go as heat**. Each is drawn, each increments its own counter, and a countdown shows the nanoseconds left before the molecule falls back on its own. Letting the countdown run out counts as heat, and that is correct rather than a failure state.
- **Heat instead**, a switch that replaces the light source with a heater at any temperature the reader sets, up to well past anything a leaf survives. The electron never jumps. A line says why: the energy arrives shared out among every molecule present instead of whole, in one place, in one event.
- **Run**, **pause**, **reset**.

**Objectives it teaches.** `photon-energy`, `light-not-heat`, `excited-electron`, `photosynthesis-equation`, `oxygen-source`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `wavelengthNm` | number | |
| `photonKjPerMole` | number | computed from the wavelength, one decimal |
| `comparedTo` | string | `'thermal' \| 'bond' \| 'atp'` |
| `ratioToComparison` | number | how many times the mark the photon is worth |
| `source` | string | `'light' \| 'heat'` |
| `heaterC` | number | 0 while the source is light |
| `shotsFired`, `shotsAbsorbed` | number | absorbed is never greater than fired |
| `lastShotAbsorbed` | boolean | |
| `electronPromoted` | boolean | |
| `donorStrengthV` | number | where the molecule sits on the give-it-away scale; rises on promotion |
| `exit` | string | `'none' \| 'resonance' \| 'photochemistry' \| 'fluorescence' \| 'heat'` |
| `exitCounts` | object | one count per exit |
| `promotionsByHeat` | number | 0 in every reachable state; a run reporting more is a defect, not a setting |
| `nsRemaining` | number | the excited state's deadline, counting down |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader is invited to do the chemistry with heat and cannot, at any temperature, with any amount of energy — and the figure says why in terms of how the energy arrives rather than how much of it there is. The all-or-nothing rule is equally falsifiable on the stage: fire a mismatched photon and nothing happens.

**Narrow composition.** Shrinks honestly. The spectrum stays full width at the top, because it is an axis and a squeezed axis is unreadable; the molecule and the ladder stack beneath it instead of sitting side by side; the three comparison marks become a three-way stepper rather than three visible rows; and the four exit counters become four rows of type with the numbers right-aligned in tabular figures. Nothing is dropped.

---

## 6.2 · `chloroplast3d` — Three membranes, three spaces, one lumen

**What it shows.** A chloroplast in three dimensions, lens-shaped and about 5 µm long, that the reader turns, zooms and cuts open: outer and inner envelope membranes, stroma with circular DNA, ribosomes and a starch grain, and the thylakoid system as dozens of grana of flattened sacs joined by unstacked sheets. It opens at a three-quarter view with the envelope intact and nothing traced, because the first thing a reader should do is cut it open.

**What the reader does.**
- **Turn, zoom, cut open.** Arrow keys turn it when focused; `+` and `−` zoom; the cutaway removes the near half of the envelope.
- **Trace the lumen.** Colour is injected at one point inside one thylakoid and flows. It reaches the whole granum, then the connecting sheets, then the other grana — and a readout gives the fraction of the total lumen volume reached. **This is the figure's central control** and the one §6.5 depends on: a reader who has watched the colour arrive everywhere knows the compartment is single and sealed without being told.
- **Name a structure** by clicking it.
- **Where the machinery sits** — a labels control marking photosystem II, photosystem I, the cytochrome complex and ATP synthase, which shows them unevenly distributed between stacked and unstacked regions, with a line giving the reason for the synthase.
- **Count the compartments** — a mode reducing the whole thing to three membranes and three watery spaces, each named, each separately highlightable.
- **Leaf scene.** A slice of leaf: waxy skin, loosely packed mesophyll with air spaces, a vein, and two stomata with an **open/close** control. Open, carbon dioxide arrows come in and far more water arrows go out. Closed, the water stops and, over a few seconds of figure time, the internal carbon dioxide falls and the internal oxygen rises while the chloroplasts keep working. A readout gives both rates and both internal concentrations.

**Objectives it teaches.** `chloroplast-compartments`, `thylakoid-is-closed`, `division-of-labour`, `leaf-gas-exchange`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'chloroplast' \| 'leaf'` |
| `azimuthDeg`, `elevationDeg` | number | camera, so a task can require the reader to have turned it |
| `distanceUm` | number | non-zero always; `setView` sets it |
| `cutaway` | boolean | |
| `membranesShown`, `compartmentsShown` | number | 3 and 3 when the counting mode is on |
| `named` | string \| null | the last structure clicked |
| `lumenTraced` | boolean | |
| `lumenFractionReached` | number | 0–1; reaches 1 because the lumen is one volume |
| `granaCount`, `thylakoidsPerGranum` | number | |
| `complexLabels` | boolean | |
| `stomaOpen` | number | 0–1 |
| `internalCo2Ppm`, `internalO2Percent` | number | |
| `waterOutPerCo2In` | number | the ratio §6.2 and §6.8 both turn on |
| `secondsClosed` | number | 0 while open |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** `lumenFractionReached` is a claim the reader tests rather than reads: inject at one point and watch whether the colour gets everywhere. A cross-section could only assert it, and would assert the opposite by accident. The leaf scene is a second mechanism in the same figure — closing the pore moves two gases in opposite directions, which is the problem §6.8 exists to answer, met here before it is named.

**Narrow composition.** WebGL fills whatever shape it is given, so the scene needs no re-composition; the labels do. Below 800 px the structure labels become a single caption line naming whatever is currently selected, rather than leader lines to six things at once, and the compartment counter becomes three rows under the stage. The leaf scene keeps its two stomata and drops the vein detail. `narrowAspect` 1, because a lens-shaped organelle turned three-quarters on wastes a square less than it wastes a 4 / 5.

---

## 6.3 · `pigment-spectra` — What is absorbed, and what it drives

**What it shows.** Two scenes. The **spectrum** scene has absorption curves for chlorophyll a, chlorophyll b and the carotenoids over a wavelength axis drawn as the visible spectrum, and beneath them an action spectrum the reader builds by hand: a filament of green alga, lit at one chosen wavelength, with aerotactic bacteria crowding around it in proportion to the oxygen produced, and a point plotted for each wavelength tried. The **photosystem** scene is a few hundred antenna pigments around one reaction centre. It opens on the spectrum scene with chlorophyll a's curve shown, no action points plotted, and the sample set to extracted pigment — because the first thing a reader should do is plot points until the gap between the two curves appears.

**What the reader does.**
- **Show / hide** each of the three absorption curves.
- **Wavelength** slider, and **Measure here**, which lights the filament, moves the bacteria and plots one action point. Sweeping the whole range is Engelmann's 1882 experiment done by hand and takes about a dozen presses.
- With chlorophyll a alone shown, **the action curve is visibly broader than the absorption curve**, and turning on chlorophyll b and the carotenoids closes the gap. That gap is the figure's argument and it must be legible at 390 px.
- **Sample: extracted / whole leaf.** Switching to the leaf applies internal scattering, and the green trough fills most of the way in; a readout gives the absorbed fraction at the chosen wavelength for both, and a swatch shows the transmitted colour. At 550 nm the numbers should land near 0.4 extracted and near 0.75 in the leaf, which are the figures §6.3 quotes.
- In the **photosystem** scene: a **light** slider setting how fast photons arrive; **which exits are open** (pass it on, use it, fluoresce, heat); **antenna size**; and **carotenoids present**. Each excitation is drawn hopping inwards and ends in one of the open exits, with four counters. Raise the light past what the centre can process and excitations queue; a long-lived excited chlorophyll appears; with carotenoids it is quenched, and without them it damages the membrane and the whole photosystem's rate falls and does not recover.

**Objectives it teaches.** `chlorophyll-structure`, `why-pigments-absorb`, `absorption-vs-action`, `why-leaves-green`, `antenna-and-protection`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'spectrum' \| 'photosystem'` |
| `curvesShown` | string[] | any of `'chl-a'`, `'chl-b'`, `'carotenoid'` |
| `wavelengthNm` | number | |
| `actionPoints` | number | how many the reader has plotted; 0 at mount |
| `actionAt`, `absorbanceAt` | number | 0–1 at the current wavelength |
| `sample` | string | `'extracted' \| 'leaf'` |
| `absorbedFraction` | number | 0–1, and the reason the figure exists |
| `transmittedName` | string | the transmitted colour as a word, not a hex |
| `photonRate` | number | photons per second at the antenna |
| `antennaSize` | number | pigments per reaction centre |
| `exitsOpen` | string[] | |
| `passedOn`, `usedForChemistry`, `fluoresced`, `lostAsHeat` | number | four counters; they sum to the excitations produced |
| `carotenoidsPresent` | boolean | |
| `queuedExcitations`, `damageEvents` | number | |
| `centreRateFraction` | number | 1 until damage, then permanently lower |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader draws the action spectrum themselves, one measurement at a time, and then discovers that it does not fit the curve they were told explains it. That discrepancy is how the accessory pigments were found, and it cannot be had from a figure that draws both curves finished. The photosystem scene is a second mechanism: turn the light up past the chemistry and take the carotenoids away, and the figure breaks in the way a real leaf breaks.

**Narrow composition.** Second composition. Two stacked charts plus a filament plus a scene switch is three things too many at 390 px. Below 800 px the figure shows **one chart at a time** — absorption or action, with the other drawn behind it as a faint outline so the comparison survives — the filament moves under the chart rather than beside it, and the curve toggles become a single three-state stepper. The transmitted swatch and its two numbers stay at both widths and keep the same labels, because an item's goal quotes `absorbedFraction`. The photosystem scene re-stacks only: the antenna is already round.

---

## 6.4 · `zscheme` — Fire the photons yourself

**What it shows.** The electron path drawn on a vertical axis of redox potential, from about +1.5 V at the bottom to about −1.5 V at the top, with water, P680, plastoquinone, the cytochrome complex, plastocyanin, P700, ferredoxin and NADP<sup>+</sup> each at its measured height and joined in order. Beside the manganese cluster, a counter with four positions. It opens dark, with nothing fired, every carrier empty and the counter at zero.

**What the reader does.**
- **Fire a photon at photosystem II** and **fire a photon at photosystem I**, as two separate controls. This is the figure's whole design: the reader supplies each push by hand, so the two-photosystem argument is something they do rather than watch.
- A photon at II lifts P680, the electron runs downhill through the carriers, and the hole left behind is drawn on the manganese cluster with its counter advancing by one. **Only on the fourth does an oxygen molecule leave and four protons drop into the lumen.** A reader who fires three gets no oxygen and a readout saying how many more are needed.
- **Fire only one of the two** and the path stalls within a few electrons, with a readout naming which carrier is saturated and which is starved. That is the enhancement effect on the stage, and it should be the first thing an unguided reader stumbles into.
- **Flash train** — fires single flashes at a dark-adapted system and plots oxygen against flash number, giving the period-of-four pattern with peaks at three, seven and eleven and visible damping.
- **Path: linear / cyclic.** Cyclic sends ferredoxin's electron back to the cytochrome complex. Three counters — NADPH, oxygen, protons moved — show that one keeps moving and two stop.
- **Ledger**, a readout converting the potentials into kilojoules: what the electrons were lifted by, what the photons supplied, and the ratio. Two electrons from water to NADPH should read about 220 kJ/mol, which is §5.8's number and must agree with it to the digit the prose quotes.
- **Run**, **pause**, **reset to dark-adapted**.

**Objectives it teaches.** `two-photosystems`, `electron-path`, `water-split`, `zscheme-arithmetic`, `nadph-role`, `cyclic-flow`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `path` | string | `'linear' \| 'cyclic'` |
| `photonsAtPsii`, `photonsAtPsi` | number | fired by the reader |
| `clusterCount` | number | 0–3, wrapping to 0 as oxygen is released |
| `oxygenReleased` | number | molecules; 0 until the fourth photon at II |
| `nadphMade` | number | 0 in cyclic mode however long it runs |
| `protonsToLumen` | number | |
| `carrierFill` | object | one 0–1 per named carrier |
| `stalledAt` | string \| null | computed, not set: the saturated carrier when only one photosystem is lit |
| `starvedAt` | string \| null | its opposite |
| `flashTrain` | boolean | |
| `flashOxygen` | number[] | oxygen per flash, in order; empty until the train is run |
| `climbVolts` | number | 1.14 from water to NADP⁺ |
| `climbKjPerTwoElectrons` | number | about 220 |
| `photonKjSupplied` | number | |
| `capturedFraction` | number | 0–1 |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** Two claims a reader would otherwise have to take on trust are falsifiable here in one press each. Light one photosystem and the path jams — so the two are not alternatives, they are in series. Fire three photons and no oxygen appears — so the cluster is counting, and the count is a thing rather than a diagram.

**Narrow composition.** Second composition. A Z is a wide shape and there is no honest way to make it a tall one, so below 800 px the two climbs are **stacked rather than side by side**: photosystem II's climb and its downhill run occupy the upper half of a vertical axis, photosystem I's the lower, with the potential axis shared and the join marked. The carrier names move from leader lines to a numbered list beside the axis. The flash-train plot becomes a strip of eleven marks under the axis rather than a chart with its own axes. The three counters keep the same labels at both widths.

---

## 6.5 · `proton-ledger` — Three sources, one compartment, one machine

**What it shows.** A thylakoid membrane in cross-section, lumen below and stroma above, with the three proton sources drawn in place — the manganese cluster releasing protons into the lumen, plastoquinone carrying them across to the cytochrome complex, and NADP<sup>+</sup> reduction taking one from the stroma — and ATP synthase standing in the membrane with its knob on the stromal side. Above them, a ledger set as type. It opens dark, with both sides at pH 7, nothing counted and the synthase still.

**What the reader does.**
- **Light** slider, from dark to full, driving all three sources.
- **The ledger** counts each source separately — protons made in the lumen, protons pumped across, protons taken from the stroma — and gives both pH values, their difference, and what that difference is worth in kJ per mole of protons at the temperature set. At 25 °C and three units it must read about 17, which is the number §6.5 quotes.
- **Temperature** slider, because the worth of the gradient is a function of it and §6.5 makes a point of the difference from chapter 5's 37 °C figure.
- **c subunits: 14 or 8**, changing protons per ATP between about 4.7 and about 2.7. The chloroplast value is the default and the mitochondrial one is there so a reader can ask why they differ; the readout names which organelle each belongs to.
- **Flip the synthase** so its knob faces the lumen. ATP is still made and accumulates in a sealed compartment with nothing in it to spend it, and a readout reports it as unreachable. This is the cheapest way to show that the orientation is the delivery system.
- **Uncoupler**, which opens a second route across the membrane. Three things move at once and all three are on the ledger: the gradient collapses, ATP output goes to zero, and the electron transport rate **rises**. A reader who expects the third to fall has the mechanism backwards, and this control is where they find out.
- **Acid bath**, a three-step control: soak in the dark at pH 4, then jump the outside to pH 8. ATP appears with the light at zero and the electron rate at zero. The readout says both, because the absences are the experiment.
- **Counter-ions**, a switch blocking the magnesium and chloride movement that normally cancels the charge. The voltage term, near zero by default, grows; the pH term shrinks; the total is roughly unchanged. That is the mitochondrion–chloroplast contrast, made by moving one thing.
- **Run**, **pause**, **reset**.

**Objectives it teaches.** `proton-sources`, `thylakoid-gradient`, `photophosphorylation`, `acid-bath`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `lightLevel` | number | 0–1 |
| `fromWater`, `fromCytochrome`, `fromNadp` | number | the three sources, counted separately |
| `lumenPh`, `stromaPh`, `deltaPh` | number | one decimal |
| `temperatureC` | number | |
| `kjPerMoleProtons` | number | computed from `deltaPh` and `temperatureC`, not tabulated |
| `voltageMv` | number | near 0 unless the counter-ions are blocked |
| `counterIonsBlocked` | boolean | |
| `cSubunits` | number | 14 or 8 |
| `protonsPerAtp` | number | computed from `cSubunits` |
| `synthaseFacing` | string | `'stroma' \| 'lumen'` |
| `turns`, `atpMade` | number | |
| `atpReachable` | number | ATP the stroma can actually use; 0 while the synthase is flipped |
| `uncoupler` | boolean | |
| `electronRate` | number | rises when `uncoupler` is true |
| `acidBath` | string | `'off' \| 'soaking' \| 'jumped'` |
| `acidBathAtp` | number | ATP made with `lightLevel` 0 and `electronRate` 0 |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The acid bath is a 1966 experiment the reader can perform: make a gradient by hand, in the dark, with no electron transport, and get ATP. Nothing about that is convincing as an assertion and all of it is convincing as a press. The uncoupler is the same argument inverted, and it moves three readings at once in a pattern no other intervention produces.

**Narrow composition.** Shrinks honestly, with a re-stack. The membrane stays horizontal across the full width — an edge-on membrane is a wide thing and this book has drawn several — and the ledger moves from a column beside it to rows beneath it, right-aligned in tabular figures. The three source counts stay separate at both widths, because the whole point of §6.5's table is that they are three different things. The counter-ion panel becomes a second row rather than a second column.

**Do not build a rotary motor here.** Chapter 7's `atp-synthase` is a 3D figure of the rotor with a `cSubunits` control, and chapter 6 deliberately declined to mount it (agreed with the chapter 7 author, 2026-09-17): §6.5's question is where the protons come from and what the gradient is worth, not how the rotor turns. The synthase in this figure is one more path through the membrane with a turn counter on it. §6.5's prose names the fourteen-subunit ring and sends a reader who wants the rotor to chapter 7.

---

## 6.6 · `calvin-cycle` — The cycle with its books open

**What it shows.** The Calvin cycle as a ring in the stroma, with its three phases marked and every intermediate drawn as a chain of carbon atoms, so that the carbon count is visible rather than asserted. Beside it, a ledger. It opens paused at the start of carboxylation, with three acceptors loaded, nothing labelled, and both supplies full.

**What the reader does.**
- **Step** the cycle one reaction at a time, or **run** it. A carbon counter checks the books at every step and prints the sum: five plus one makes six; the six splits at once into two threes.
- **The six-carbon compound is drawn and immediately split**, with a line stating that it has never been isolated from a working enzyme. A reader who steps slowly enough to catch it should be told why they cannot hold it there.
- **Label one carbon dioxide** and follow that atom round — through 3-phosphoglycerate, through G3P, and into either the exported sugar or the rebuilt acceptor. This is Calvin's <sup>14</sup>C experiment done by hand, and the readout names where the atom is.
- **ATP supply** and **NADPH supply** sliders, independently. Starving either stops a different phase and piles up a different intermediate: with no NADPH the reduction step stalls and 3-phosphoglycerate accumulates while carboxylation carries on, because rubisco needs neither; with no ATP both reduction and regeneration stall and the acceptor pool drains. **This pair of controls is the figure's best half hour** and the reason it is not a diagram.
- **The ledger**, set as type: ATP and NADPH spent by phase and in total, per carbon dioxide and per sugar, converted into kilojoules and compared with the 2870 a glucose needs.
- **Light on / off**, which does three things at once — raises the stroma's pH from 7 to 8, moves magnesium in, and reduces thioredoxin — and switches four named enzymes on. With the light off and both supplies set by hand to full, the cycle still slows almost to nothing. That is §6.6's key idea and it cannot be shown any other way.
- **Export to sucrose / to starch**, with both pools tracked over a day and a night.

**Objectives it teaches.** `co2-is-stable`, `calvin-phases`, `carboxylation-product`, `calvin-ledger`, `not-dark-reactions`, `atp-nadph-balance` jointly with 6.4.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `phase` | string | `'carboxylation' \| 'reduction' \| 'regeneration'` |
| `turns`, `co2Fixed` | number | |
| `carbonsIn`, `carbonsOut` | number | the running balance; equal at the end of every complete turn |
| `sixCarbonIsolated` | boolean | false in every reachable state |
| `labelledAtomAt` | string \| null | null until the reader labels one |
| `atpSpent`, `nadphSpent` | number | |
| `atpByPhase`, `nadphByPhase` | object | keyed by phase; regeneration holds a third of the ATP |
| `g3pExported` | number | |
| `kjSpent`, `kjNeededPerGlucose` | number | the second is 2870 |
| `atpSupply`, `nadphSupply` | number | 0–1, set by the reader |
| `stalledPhase` | string \| null | computed from the supplies, not set |
| `accumulating` | string \| null | the intermediate piling up before the stall |
| `lightOn` | boolean | |
| `stromaPh` | number | 7 dark, 8 lit |
| `magnesiumInStroma`, `thioredoxinReduced` | boolean | |
| `activatedEnzymes` | number | 0–4 |
| `exportTo` | string | `'sucrose' \| 'starch'` |
| `sucrosePool`, `starchPool` | number | |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** Two of the section's claims are demonstrated by taking something away. Starve the cycle of one input and a specific intermediate piles up in a specific phase, which is §3.4's blocked-pathway reasoning applied to a small molecule. Turn the light off while supplying ATP and NADPH by hand and it still stops, which is the whole of why "dark reactions" is the wrong name and is otherwise a sentence a reader has to take on trust.

**Narrow composition.** Shrinks honestly, and `narrowAspect` 1 because a ring is the one shape that wants a square. The ledger moves from beside the ring to beneath it, as rows. The per-phase columns collapse into one column with the phase named on each row. The carbon-count line stays at both widths and keeps its wording, because it is the figure's own check on itself.

---

## 6.7 · `rubisco-fork` — One site, two gases, four steps of arithmetic

**What it shows.** A single rubisco active site holding the five-carbon acceptor, with carbon dioxide and oxygen molecules arriving out of a surrounding solution whose two concentrations the reader controls indirectly. Each arrival is accepted or rejected, and the two acceptances are drawn differently: carboxylation splits into two three-carbon molecules that go to the cycle, oxygenation gives one three-carbon molecule and one two-carbon molecule that goes to the salvage route. Beside the site, the four-step table from §6.7, recomputed live. It opens at today's atmosphere, 25 °C, the pore half open, with no turns taken.

**What the reader does.**
- **Carbon dioxide in the air**, in ppm — and the readout says which step of the table moved.
- **Leaf temperature**, which acts through two terms at once and names both: the solubility of the two gases and the enzyme's own preference.
- **How far the stoma is open**, which sets how far below the air the internal concentration falls.
- **The four-step table** — air ratio, dissolved ratio, after the enzyme's preference, inside a working leaf — recomputed on every change, so a reader can see which of their three sliders moved which line. This is the figure's argument and the reason it is not a pie chart of photorespiration.
- **Take turns**, one at a time or running, with counters for carboxylations and oxygenations and a running ratio that should settle near the table's prediction. A reader who does not trust the table can wait for the counters to agree with it.
- **Atmosphere: today / Archaean.** Stepping back to high carbon dioxide and no free oxygen makes oxygenation disappear entirely. That is the answer to "why was it never fixed", and it is one press.
- **Salvage scene**, following one two-carbon molecule from chloroplast to peroxisome to mitochondrion and back, with the peroxide made and destroyed shown in the peroxisome, the carbon and the nitrogen released marked, and a ledger giving carbon recovered, carbon lost and ATP spent.
- **How much rubisco the leaf has built**, trading leaf protein against rate, with a net carbon gain readout as a percentage of what the same leaf would manage with no oxygenation at all.

**Objectives it teaches.** `rubisco-two-substrates`, `oxygenation-arithmetic`, `photorespiration-route`, `rubisco-abundance`, `atmosphere-changed`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'site' \| 'salvage'` |
| `era` | string | `'today' \| 'archaean'` |
| `airCo2Ppm`, `airO2Percent` | number | |
| `temperatureC`, `stomaOpen` | number | |
| `internalCo2Ppm` | number | computed from the air and the pore |
| `airRatio`, `dissolvedRatio` | number | oxygen to carbon dioxide; about 500 and about 20 today |
| `preference` | number | the enzyme's, about 100 at 25 °C, falling as it warms |
| `workingRatio` | number | carboxylations per oxygenation; about 3 in a real leaf today |
| `carboxylations`, `oxygenations` | number | counted, so the reader can check `workingRatio` |
| `turnoverPerSecond` | number | about 3 |
| `rubiscoFractionOfProtein` | number | 0–1, set by the reader |
| `salvageStep` | string \| null | where the followed molecule is |
| `carbonRecovered`, `carbonLost`, `atpSpentOnSalvage` | number | |
| `netGainPercent` | number | against the same leaf with no oxygenation |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader moves three sliders and watches which *line of the arithmetic* each one changes, so the claim that photorespiration is a consequence of concentrations rather than a defect in the protein is something they derive. And the Archaean setting turns the defect off entirely without touching the enzyme, which is the evolutionary argument reduced to a control.

**Narrow composition.** Second composition. A site drawn beside a four-row table does not survive 390 px. Below 800 px the site takes the upper two-thirds and the table becomes four rows of type beneath it with the changed row marked; the three sliders become a stepper group on one row; and the salvage scene, which is a route through three compartments, re-orients from a horizontal run to a vertical one with the three organelles stacked. `workingRatio`, `netGainPercent` and the four table rows keep the same labels at both widths, because item goals quote them.

---

## 6.8 · `carbon-concentrator` — Three strategies, one climate

**What it shows.** Three leaves in cross-section, side by side — C<sub>3</sub>, C<sub>4</sub> and CAM — under one set of climate controls and one clock, each drawn working in its own way, with three ledgers running beneath them. It opens at a temperate climate at midday with the clock stopped, all three leaves fixing carbon, and C<sub>3</sub> ahead.

**What the reader does.**
- **Climate**: temperature, light, humidity, and the air's carbon dioxide.
- **Clock**, running a day and a night, because CAM cannot be shown without one. Each leaf's stomata open and close on its own schedule.
- **Three ledgers**, set as type: carbon fixed, carbon lost to photorespiration, ATP spent per carbon, water lost per carbon. A **ranking** line names the order, and the reader's job is to make it change — which it does when the climate goes hot, bright and dry.
- **Raise the air's carbon dioxide** and watch the C<sub>4</sub> advantage narrow and then vanish, which is the prediction §6.8 states and is otherwise just a sentence.
- **Give PEP carboxylase carbon dioxide instead of bicarbonate**, which stops it dead, because it is the wrong substrate. One press, and it is the whole answer to why that enzyme cannot make rubisco's mistake.
- **Make the bundle-sheath wall leaky.** The concentrated carbon dioxide drains away and the C<sub>4</sub> leaf becomes an expensive C<sub>3</sub> one, with the ledger showing it paying two ATP for nothing.
- **Vacuole size** for the CAM leaf, with the day's total fixation following it exactly — the cost of the strategy, made visible as a ceiling.

**Objectives it teaches.** `stomatal-tradeoff`, `c4-mechanism`, `cam-mechanism`, `choose-strategy`, and `diagnose-photosynthesis` jointly with 6.4 and 6.6.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `temperatureC`, `lightLevel`, `humidity`, `airCo2Ppm` | number | |
| `hour` | number | 0–24 |
| `focused` | string | `'c3' \| 'c4' \| 'cam'`; which leaf the narrow layout is showing |
| `stomataOpen` | object | one 0–1 per strategy |
| `carbonFixed`, `carbonLostToPhotorespiration` | object | one per strategy |
| `atpPerCarbon`, `waterPerCarbon` | object | one per strategy |
| `ranking` | string[] | best to worst, computed from the ledgers, never set |
| `bundleSheathCo2Ppm` | number | many times the air's until the wall is made leaky |
| `bundleSheathLeaky` | boolean | |
| `pepSubstrate` | string | `'bicarbonate' \| 'co2'` |
| `pepWorking` | boolean | false whenever `pepSubstrate` is `'co2'` |
| `vacuoleCapacity`, `vacuoleFill` | number | |
| `camDayCeiling` | number | the day's fixation limit set by the vacuole |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** `ranking` is computed from three ledgers and changes under the reader's hand, so "which is best" stops being a fact to memorise and becomes a function of a climate — which is the section's whole claim. And two single presses each destroy one of the two mechanisms in a way that names its load-bearing part: the wrong substrate for PEP carboxylase, and a leaky bundle sheath.

**Narrow composition.** Second composition, and the most necessary one in the chapter. Three leaf cross-sections side by side at 390 px would be about 120 px each and illegible. Below 800 px the figure shows **one leaf at a time**, chosen by a three-way control (`focused`), at full width, with the other two reduced to two rows of their own ledger numbers beneath it so the comparison survives. The `ranking` line stays, in the same words, at both widths. The clock becomes a single strip rather than three.

---

## Notes for whoever registers these

- **`narrowAspect` for all eight**, values in the table above. **Four carry a genuine second composition** — `pigment-spectra`, `zscheme`, `rubisco-fork` and `carbon-concentrator` — each for the reason stated in its block, and each of those four draws a chart or a table beside a scene, or repeats a scene three times, which are the two shapes that never survive a phone. The other four shrink honestly and say what they re-stack.
- **One WebGL figure**, `chloroplast3d`, so it is `npm run sweep3d`'s only chapter-6 entry. Its default view is a three-quarter view from slightly above, with the lens seen at an angle rather than edge-on, so that the grana read as stacks and not as lines; state that in the module header and give `view.distance` a non-zero default.
- **Every kind needs a recipe in `tools/drive.js` or `npm run drive` fails**, so the recipes can be written from this brief before the modules exist. The fields worth asserting after driving are the computed ones, never the ones a button sets: `photonKjPerMole` and `lastShotAbsorbed` and `promotionsByHeat` (6.1), `lumenFractionReached` and `waterOutPerCo2In` (6.2), `absorbedFraction` and `actionPoints` and `centreRateFraction` (6.3), `stalledAt` and `oxygenReleased` and `climbKjPerTwoElectrons` (6.4), `kjPerMoleProtons` and `protonsPerAtp` and `atpReachable` and `electronRate` (6.5), `stalledPhase` and `accumulating` and `activatedEnzymes` (6.6), `dissolvedRatio` and `workingRatio` and `netGainPercent` (6.7), `ranking` and `bundleSheathCo2Ppm` and `pepWorking` (6.8).
- **The palette section above is the registrar's, not a figure worker's.** Two decisions have to be made before anyone writes code: the chlorophyll value, and whether `spectrumColour(nm)` is allowed to exist. A figure worker who reaches Figure 6.3 without an answer will invent one, and it will be a hex.
- **`tools/pages-exclude.txt` needs no new line, and adding one would be a mistake.** The list holds `**/*.md`, which is a class and not an instance, and `tools/pages-exclude.js` compiles `**/` so that it may match zero segments — so `biology/ch06-photosynthesis/FIGURES.md` is already excluded from the published tree without anybody naming it. Confirm rather than assume: `node tools/pages-exclude.js` prints this file among the paths it trims.
- **Five invariants a reviewer should check by hand**, because no gate can. `promotionsByHeat` is 0 in every reachable state of 6.1, at any temperature. `lumenFractionReached` reaches 1 in 6.2 — a figure that stopped at one granum would be drawing the wrong organelle. `nadphMade` never increases in 6.4 while `path` is `'cyclic'`, however long it runs. `acidBathAtp` in 6.5 is greater than zero while `lightLevel` and `electronRate` are both zero, which is the only reason that control exists. And `pepWorking` is false whenever `pepSubstrate` is `'co2'` in 6.8. Each is the figure's whole claim reduced to one field, and each would look perfectly healthy if it were quietly wrong.
- **What chapter 7 is expected to ask for, and what it is not.** Its author and this one agreed on 2026-09-17 that chapter 7 owns the rotary motor: its `atp-synthase` figure takes a `cSubunits` control so that chapter 6 *could* mount it at 14, and chapter 6 declined, because §6.5's subject is the ledger and not the rotor. Build `proton-ledger` so that it does not duplicate that figure — a turn counter, not a mechanism — and say so in its module header. Nothing else here is shared: chapter 7's other seven kinds are its own.
- **If one has to be cut**, `photon-lab` is the one §6.1 survives without, at the cost of the chapter losing its hero and of five objectives losing their figure; that section's argument is carried by its table better than any other section's is. **`zscheme` and `rubisco-fork` cannot be cut**: between them they carry eleven objectives, the two-photosystem argument, the water split and the whole of §6.7. Do not split `carbon-concentrator` into a C4 figure and a CAM figure — the point of §6.8 is that they are two answers to one problem, and two figures would make them two topics.
