# Chapter 4 — figure brief

Eight figures, in the order they appear in `index.html`. The figure number is fixed by that order and the prose cites every one of them by number, so the order does not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 4.1 | `bilayer` | `fig-bilayer` | opener, cited in 4.1 | no | 16 / 9 | 4 / 5 |
| 4.2 | `membrane3d` | `fig-membrane` | 4.2 | **yes** | 16 / 10 | 1 |
| 4.3 | `permeability` | `fig-permeability` | 4.3 | no | 16 / 9 | 4 / 5 |
| 4.4 | `osmometer` | `fig-osmosis` | 4.4 | no | 16 / 9 | 4 / 5 |
| 4.5 | `transport-lab` | `fig-transport` | 4.5 | no | 16 / 9 | 3 / 4 |
| 4.6 | `pump` | `fig-pump` | 4.6 | no | 16 / 10 | 4 / 5 |
| 4.7 | `gradient-battery` | `fig-gradients` | 4.7 | no | 16 / 10 | 3 / 4 |
| 4.8 | `bulk-transport` | `fig-bulk` | 4.8 | no | 16 / 9 | 4 / 5 |

Kind ids and figure ids are clear of every other chapter's, checked against `src/figures/registry.js` at `f5bd0e9`: `pond`, `homeostasis`, `levels`, `scale`, `cell3d`, `dna3d`, `energy`, `tree`, `pasteur`; `soup`, `bondlab`, `water3d`, `waterprops`, `phlab`, `carbonkit`, `polymer`, `foldlab`; `microscopes`, `surface-volume`, `prokaryote`, `secretion`, `symbiont`, `cytoskeleton`, `cilium`, `plantcell3d`; `zj-split`, `zj-timeline`, `zj-words`.

**One WebGL figure, deliberately.** The membrane itself is worth turning over, because the thing to be understood is a three-dimensional arrangement with two distinguishable faces. The other seven subjects are rates, gradients, cycles and journeys, which a composed 2D view states better than a perspective one; putting a second into 3D would be decoration.

## Palette additions this chapter needs (whoever registers these)

Eight figures draw the same dozen things, and the reader should learn one colour per thing across the chapter and into Chapters 5 and 7, which will use the same ions. These want adding once, centrally, rather than being invented per figure:

`lipidHead` and `lipidTail` (derived from the existing `membrane` colour, so the sheet reads as the plasma membrane of Figure 1.5 seen close up), `cholesterol`, `sugarChain`; three protein roles that never change colour between figures — `channel`, `carrier`, `pump`; and `sodium`, `potassium`, `chloride`, `proton`, `calcium`, `glucose`.

`membrane` (`#e8a58a`), `cytoplasm`, `vesicle`, `lysosome`, `golgi`, `roughER`, `smoothER`, `nucleus`, `ribosome`, `cytoskeleton` and `mitochondrion` already exist in `ORGANELLES` and must be reused unchanged.

## What every figure here owes

Nothing in this section is answered by a gate unless the line names one. The gates prove that a figure mounts, reports what it claims and survives being pressed; every judgement below is a person's, made at the artefact's own resolution, in both themes, at the widths a reader uses.

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

- **It may not report `id`, `kind`, `number` or `state`.** The frame owns those four and spreads them last, so a figure using one would lose its own value without a word. `npm run drive` fails it. `foldlab` reports `foldState`; `plantcell3d` reports `turgorState`. No field in this brief uses any of the four, and none may be added.
- Report the numbers in the units the prose uses, so a task's goal and the readout agree.
- Every field an item can name must be reachable through the reader's own controls, and **must not become true on its own as the clock runs** — otherwise the only load-bearing clause in the expectation is the one proving the reader acted.

### A figure's words are prose

A sentence inside a figure module is read by the same reader and is corrected when the chapter is. `symbiont.js` carried a claim about mitochondrial division machinery for days after the prose had dropped it as wrong.

---

## 4.1 · `bilayer` — Let go, and watch a membrane happen

**What it shows.** A tank of water into which the reader tips a chosen amphipathic molecule and then stops interfering. Each molecule moves under a seeded random walk with one rule: a tail in contact with water carries a penalty, a head in contact with water does not. Out of that rule alone, and with no target arrangement anywhere in the code, two-tailed phospholipids find a flat bilayer, single-tailed detergents find micelles, a pure hydrocarbon finds one droplet, and cholesterol wedges among phospholipid tails. It opens dispersed and unrun, so the first thing the reader does is release it.

The readout is the physics, not the picture: the fraction of tail surface hidden from water, the length of exposed edge, and the thickness of the sheet in nanometres, against a scale bar, so the 7 nm of the prose is measured on screen rather than asserted.

**It must be honest about what it is.** The module header states that this is a two-dimensional energy-minimising toy at a scale of nanometres, not a molecular dynamics simulation, and that the only term in it is tail exposure. The claim the figure makes is that one rule is enough; a figure that quietly helped the lipids into line would be making a different claim, and its header would be the only place the difference showed.

**What the reader does.**
- **Molecule** buttons: phospholipid (two tails), detergent (one tail, bulky head), hydrocarbon (no head), cholesterol, and a mixture of phospholipid and cholesterol.
- **Release**, **pause**, **reset with a new seed**, and **step** for a reader who wants to watch one rearrangement.
- **Needle**: punctures the sheet, which then reseals. The exposed-edge readout spikes and falls, and that trace is the whole argument about why a membrane heals.
- **Curl**: a flat sheet left running closes into a vesicle because the edge is what costs; this control does not force the closure, it removes the constraint that was holding the sheet flat.
- **Temperature** slider, which changes how far the random walk overcomes the penalty. High enough and nothing assembles at all.

**Objectives it teaches.** `amphipathic`, `bilayer-selfassembly`, `bilayer-properties`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `molecule` | string | `'phospholipid' \| 'detergent' \| 'hydrocarbon' \| 'cholesterol' \| 'mixed'` |
| `count` | number | molecules in the tank |
| `assembly` | string | `'dispersed' \| 'micelle' \| 'bilayer' \| 'vesicle' \| 'droplet'` — classified from the geometry, never set by the button |
| `tailsBuried` | number | 0–1, the fraction of tail surface not touching water |
| `edgeLengthNm` | number | exposed bilayer edge; 0 for a closed vesicle |
| `thicknessNm` | number | measured across the sheet; about 7 for a phospholipid bilayer |
| `sealed` | boolean | no exposed edge anywhere |
| `punctured` | boolean | true from the needle until the hole closes |
| `healSeconds` | number \| null | how long the last puncture took to close; null until one is made |
| `temperatureC` | number | |
| `seed` | number | so a run can be reproduced |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The arrangement is an output: the same rule gives a bilayer, a micelle or a droplet depending only on the molecule, and the reader can make a hole and watch it close or raise the temperature until nothing forms.

**Narrow composition.** Shrinks honestly. The tank is square-ish at 4 / 5, the molecule buttons wrap to two rows, and the three readout rows stack beneath — `assembly` first, since it is the one a task will name.

---

## 4.2 · `membrane3d` — A patch of membrane, turned over and set running

**What it shows.** Something under a square micrometre of plasma membrane in three dimensions, at a scale where individual lipids are visible: two leaflets of phospholipid with tails meeting in the middle, cholesterol wedged between them, transmembrane proteins as helices and as barrels, peripheral proteins resting on one face, branched sugar chains standing on the outer face only, and filaments of cytoskeleton tethering some proteins from below. It opens fluid, at body temperature, from a view that shows both faces at once — the default is stated in the module header.

**What the reader does.**
- **Orbit** by drag or arrow keys, zoom with + and −, as in `cell3d`. `setView({ theta, phi, distance })` for the sweep gate.
- **Run time.** Lipids shuffle sideways constantly; a counter of leaflet crossings sits beside the swap counter and stays at zero through any normal run, which is the comparison §4.2 is making. A **force a flip-flop** button exists and says what it cost.
- **Track a molecule**: click a lipid or a protein and its path is drawn behind it, with distance travelled and elapsed time. A lipid covers about 2 µm in a second; a protein far less; a tethered protein none.
- **Temperature** slider, taking the sheet from fluid to a stiff ordered gel, with the transition drawn as it happens. **Cholesterol** and **unsaturation** sliders both move the temperature at which that transition occurs, and cholesterol moves it in opposite senses at the two ends of the range — which is the buffering claim, made testable rather than asserted.
- **Bleach**: switch off the label on a disc of the surface and watch the fluorescence recover as unbleached molecules wander in. A recovery curve is drawn live, a diffusion coefficient is fitted from it, and the fraction that never recovers is reported. That immobile fraction is the tethered proteins, and the reader can see which ones they are.
- **Cutaway** toggle, and labels on click for each component.

**Objectives it teaches.** `mosaic-components`, `membrane-fluidity`, `fluidity-determinants`, `measuring-fluidity`, `membrane-proteins`, `membrane-asymmetry`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `view` | object | `{ theta, phi, distance }`, distance non-zero |
| `drawCalls`, `triangles` | number | |
| `cut` | boolean | |
| `temperatureC` | number | |
| `cholesterolFraction` | number | 0–1 of lipid molecules |
| `unsaturatedFraction` | number | 0–1 of tails |
| `phase` | string | `'fluid' \| 'transition' \| 'gel'` |
| `transitionC` | number | the temperature at which this composition sets |
| `lateralSwaps` | number | since reset |
| `flipFlops` | number | 0 unless forced |
| `tracked` | string \| null | `'lipid' \| 'protein' \| 'tethered-protein'` |
| `trackedDistanceUm` | number | how far the tracked molecule has gone |
| `diffusionUm2PerS` | number | fitted from the recovery curve; about 1 for a lipid in a fluid membrane |
| `bleached` | boolean | |
| `recoveryFraction` | number | 0–1 |
| `immobileFraction` | number | 0–1 |
| `outerSugars`, `innerSugars` | number | sugar chains on each face; `innerSugars` is 0 and must stay 0 in every state |

**Why it is a mechanism.** The diffusion coefficient the prose quotes is not printed on the figure; it is fitted from an experiment the reader performs, and the immobile fraction — the awkward half of the Frye–Edidin result — falls out of the same measurement.

**Narrow composition.** Shrinks honestly at `narrowAspect: 1`, as `cell3d` and `water3d` do. The recovery curve is the one element that cannot shrink: below 800 px it is drawn under the stage at full width rather than inset over the membrane, and the three composition sliders collapse to one row of steppers.

---

## 4.3 · `permeability` — One species at a time, against a bare bilayer

**What it shows.** A bilayer edge-on with water on both sides and a stream of one chosen species arriving at it. Almost every arrival bounces; the rare crossing is drawn. The crossing probability comes from the species' permeability coefficient, so twelve orders of magnitude are experienced as waiting rather than read as a number: oxygen streams through and a sodium ion is refused thousands of times over while the reader watches. A logarithmic flux bar, marked in decades, is what makes the span legible in one view.

**What the reader does.**
- **Species**: oxygen, carbon dioxide, water, urea, glycerol, glucose, sodium, potassium, chloride. Selecting one shows its permeability coefficient and, in one line, what stands in its way — nothing, polarity, size, or a charge with its hydration shell.
- The charged species are drawn **with their shell of water**, stripped at the mouth of the core and immediately reformed when the ion is turned back. That drawing is the explanation and must not be decorative.
- **Concentration** sliders for each side and a **voltage** slider for the membrane potential. For a charged species the readout gives the concentration term and the electrical term separately as well as the net direction, so the reader can set up a chloride ion pulled one way by each.
- **Equilibrium**: run until the concentrations equalise and watch crossings continue in both directions at equal rates, with both counters visibly still climbing. This is the figure's answer to "does diffusion stop", and it is the only way to make that point without a sentence.
- **Add a channel** for the current species: the crossing rate jumps by orders of magnitude and the bar moves several decades. This is the hand-off to Figure 4.5.
- **Barrier thickness** and **area** controls, so Fick's law is a thing the reader changes rather than a formula they are shown.

**Objectives it teaches.** `permeability-rules`, `ion-barrier`, `passive-transport`, `flux-factors`, `electrochemical-gradient`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `species` | string | one of the nine |
| `permeabilityCmPerS` | number | order of magnitude, matching the table in §4.3 |
| `barrier` | string | `'none' \| 'polarity' \| 'size' \| 'charge'` |
| `hydrationShell` | boolean | drawn for the ionic species |
| `insideMM`, `outsideMM` | number | |
| `voltageMv` | number | inside relative to outside |
| `chemicalDrive`, `electricalDrive` | number | signed, in the same units, so they can be compared |
| `netDirection` | string | `'in' \| 'out' \| 'none'` |
| `crossingsIn`, `crossingsOut` | number | since reset; equal and both still rising at equilibrium |
| `rejections` | number | arrivals that bounced |
| `equilibrated` | boolean | |
| `channelPresent` | boolean | |
| `thicknessNm`, `areaUm2` | number | the two Fick terms |
| `fluxPerSecond` | number | what the bar shows |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The rejection counter is the figure. A reader who has watched a sodium ion turned away four thousand times has learned something the number 10⁻¹² cm s⁻¹ cannot teach.

**Narrow composition.** Second composition. The species list becomes a scrolling row of chips above the membrane; the two concentration sliders and the voltage slider stack under it; and the log flux bar turns vertical down the right-hand side, where the decade marks stay legible. The Fick controls (thickness, area) are dropped below 800 px rather than shrunk, and the readout says so, because three sliders and a nine-item list cannot share a 390 px stage without the type going under nine device pixels.

---

## 4.4 · `osmometer` — The same two solutions, three times over

**What it shows.** Three scenes over one pair of solutions the reader sets once. In **osmometer** mode, a U-tube divided by a membrane that passes water and stops solute: water crosses, the level rises on the concentrated side, and a piston can be pressed down on that side until the flow stops — which measures the osmotic pressure by hand. In **animal cell** mode the same solutions surround a red blood cell. In **plant cell** mode they surround a walled cell. The panel that matters is identical in all three: solute potential, pressure potential and their sum for each side, with an arrow between them that always points from higher water potential to lower.

**What the reader does.**
- **Solute** sliders for each side in mmol/L, and a **particle count** toggle between a sugar (one particle) and a salt (two), so the osmolarity point is made by a control rather than by a sentence.
- **Scene** switch: osmometer / animal cell / plant cell. The solutions carry over, which is the comparison.
- **Piston** in osmometer mode, with the applied pressure in MPa and a verdict line when the flow stops.
- **Run** and **pause**, with a trace plotting cell volume and pressure potential against time.
- In cell mode the outcome is named and drawn: swollen, lysed, normal, crenated for the animal cell; turgid, flaccid, plasmolysed for the walled one. The wall keeps its outline through plasmolysis, which is the whole difference between the two scenes.
- **A urea option** among the solutes, which crosses the membrane. Set iso-osmotic urea and the cell still bursts, and the panel says why: iso-osmotic is not isotonic. This is the one control that catches a misconception rather than illustrating a fact, and it should be findable rather than hidden.

**Objectives it teaches.** `osmosis-mechanism`, `water-potential`, `tonicity-animal`, `tonicity-walled`, `osmoregulation`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'osmometer' \| 'animal-cell' \| 'plant-cell'` |
| `soluteInsideMM`, `soluteOutsideMM` | number | |
| `soluteKind` | string | `'sugar' \| 'salt' \| 'urea'` |
| `permeantSolute` | boolean | true for urea |
| `osmolarityInside`, `osmolarityOutside` | number | mOsm/L, counting particles |
| `psiSoluteInside`, `psiSoluteOutside` | number | MPa, negative |
| `psiPressureInside` | number | MPa; rises in a walled cell, stays near 0 otherwise |
| `psiInside`, `psiOutside` | number | MPa, the two sums |
| `tonicity` | string | `'hypotonic' \| 'isotonic' \| 'hypertonic'`, of the outside with respect to the cell |
| `netWaterFlow` | string | `'in' \| 'out' \| 'none'` |
| `volumeFraction` | number | relative to the resting cell |
| `outcome` | string | `'swollen' \| 'lysed' \| 'normal' \| 'crenated' \| 'turgid' \| 'flaccid' \| 'plasmolysed'` |
| `pistonMPa` | number | osmometer only |
| `osmoticPressureMPa` | number | the pressure that stops the flow |
| `equilibrated` | boolean | |
| `t` | number | clock, seconds, three decimals |

**Why it is a mechanism.** The pressure potential is not asserted: it is a number the reader watches climb in the walled cell until it stops the water arriving, and the same quantity can be measured directly with a piston in the scene next door.

**Narrow composition.** Shrinks honestly. The potential panel is already a four-row typographic table and stacks under the vessel; the trace is dropped below 800 px in favour of the live numbers, because a two-series plot at 390 px puts its axis labels under nine device pixels.

---

## 4.5 · `transport-lab` — Two designs, one graph

**What it shows.** Two scenes sharing one instrument. In **carrier** mode, three lanes of the same membrane run side by side while the reader raises the outside concentration: a bare bilayer where almost nothing crosses; a lane of GLUT1 carriers, each visibly binding a glucose, changing shape, releasing it and cycling; and a live graph of flux against concentration, drawing a straight line for simple diffusion and a curve that bends over to a ceiling for the carrier. In **channel** mode, a potassium channel in cross-section with its selectivity filter: the reader fires potassium or sodium at it and watches the water shells stripped at the mouth, potassium finding the carbonyl oxygens waiting and passing, sodium turned back.

**What the reader does.**
- **Concentration** slider, which drives every lane at once and plots a point on the graph as it moves. Sweeping it is how the two curves get drawn, so the graph starts empty.
- **Number of carriers** slider, which moves the ceiling without moving the concentration at which the curve is half way up. That separation is the lesson: saturation is about how many doors there are, not how fast each one is.
- A marker on the graph at the half-maximum concentration and a second at blood glucose, about 5 mmol/L, so §4.5's GLUT1 paragraph can be read off the figure.
- **Scene** switch, preserving whatever has been set.
- Channel mode: **fire potassium**, **fire sodium**, with a tally of passes and rejections for each, and a **show the filter** overlay drawing the carbonyl oxygens against the positions the ion's water molecules occupied.
- **Gate** control in channel mode: closed, opened by voltage, opened by a ligand binding, opened by stretching the membrane. Each is drawn as its own cause rather than as three labels on one switch.

**Objectives it teaches.** `facilitated-diffusion`, `channel-vs-carrier`, `channel-selectivity`, `carrier-saturation`, `aquaporin`, `identify-mechanism`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'carrier' \| 'channel'` |
| `concentrationMM` | number | outside |
| `simpleFlux`, `carrierFlux` | number | molecules per second per unit area, same units for both |
| `vmax` | number | the carrier lane's ceiling |
| `halfMaxMM` | number | the concentration at half of `vmax`; 1–2 for GLUT1, and independent of `carriers` |
| `carriers` | number | transporters installed |
| `saturationFraction` | number | 0–1, how close the carrier lane is to its ceiling |
| `plotted` | number | points on the graph so far; 0 means the reader has swept nothing |
| `ion` | string \| null | channel scene: `'potassium' \| 'sodium'` |
| `gate` | string | `'closed' \| 'voltage' \| 'ligand' \| 'stretch'` |
| `gateOpen` | boolean | |
| `passes`, `rejects` | object | `{ potassium, sodium }` counts |
| `selectivityRatio` | number | passes per arrival, potassium over sodium |
| `filterShown` | boolean | |
| `t` | number | clock, seconds, three decimals |

**Why it is a mechanism.** The saturating curve is drawn by the reader's own slider, from a lane in which individual carriers are visibly busy or idle, so the ceiling is something they watch happen rather than a shape they are shown.

**Narrow composition.** Second composition. The three lanes stack as three short strips and the graph moves below them at full width, because a curve bending over is unreadable in a column 90 px wide. The half-maximum and blood-glucose markers stay on the graph at both widths, and both keep the same labels as at desktop, because item goals quote them.

---

## 4.6 · `pump` — One cycle at a time, and what it costs

**What it shows.** The sodium–potassium pump in a patch of plasma membrane, drawn large, cytosol below and extracellular fluid above. The cycle runs in six stages and the protein's two shapes are genuinely two shapes, with the binding sites facing in and then out and fitting sodium and then potassium. Around it, four bars give the sodium and potassium concentrations on each side, and a ledger counts cycles, ATP spent, ions moved and net charge carried out. It opens stopped at stage 0, so the reader steps it rather than watching it.

**What the reader does.**
- **Step** with the arrow keys or a button, one stage at a time, with a line naming what has just happened and why the protein changed its mind about what it wanted to hold. **Run** at an adjustable rate.
- **ATP** slider from full to none. The pump slows and then stalls mid-cycle, and the stalled stage is named rather than the pump simply stopping.
- **Ouabain** toggle, which jams it from the outside only, with a line saying this is the foxglove drug at a dose.
- **Watch it fail**: with the pump stopped, the gradient bars decay at the speed the membrane leaks — over simulated minutes, not seconds — and a modelled cell volume begins to rise. This is §4.6's volume argument and it has to be slow enough to be believed.
- **Leakiness** slider, so the reader can see that the pump's workload is set by how fast the gradients run down.
- A **cost** panel: ATP per second at the current rate, and what share of a cell's budget that is.

**Objectives it teaches.** `active-transport`, `pump-cycle`, `pump-consequences`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `stage` | number | integer 0–5 |
| `stageName` | string | `'na-binding' \| 'phosphorylated' \| 'na-released' \| 'k-binding' \| 'dephosphorylated' \| 'k-released'` |
| `facing` | string | `'in' \| 'out'` — which way the binding sites point |
| `phosphorylated` | boolean | |
| `naInsideMM`, `naOutsideMM` | number | |
| `kInsideMM`, `kOutsideMM` | number | |
| `cycles` | number | completed |
| `atpSpent` | number | equal to `cycles` while nothing is blocked |
| `naMoved`, `kMoved` | number | signed; out is positive for sodium |
| `chargePerCycle` | number | +1 out — the electrogenic claim, reported rather than asserted |
| `atp` | number | 0–1 |
| `blocked` | string \| null | `'ouabain' \| 'no-atp'` |
| `stalled` | boolean | |
| `leakiness` | number | 0–1 |
| `cellVolumeFraction` | number | 1.0 while the pump keeps up |
| `running` | boolean | |
| `t` | number | clock, seconds, three decimals |

**Why it is a mechanism.** The two-affinity trick is the content, and the reader can stop at each of the six stages and read which way the sites face and what they will now hold. Stopping the pump does not stop the figure — it starts the slow failure that is the section's argument.

**Narrow composition.** Shrinks honestly. The four concentration bars move from flanking the membrane to a single stacked group beneath it, keeping inside and outside adjacent for each ion so the comparison survives; the ledger and the cost panel become one typographic table.

---

## 4.7 · `gradient-battery` — The battery charged, and spent

**What it shows.** Two scenes. The main one is a cell from the lining of the small intestine, gut lumen above, capillary below, with a tight junction sealing the two faces apart: a sodium–glucose symporter on the apical face taking two sodium ions in with each glucose, and the sodium–potassium pump and a glucose carrier on the basolateral face. Bars track sodium inside and out and glucose in the lumen, the cell and the blood, with a ratio readout showing glucose concentrated above the lumen. A voltmeter reads the membrane potential. The second scene is a heart muscle cell with a sodium–calcium antiporter, where digoxin closes the story from §4.6.

**What the reader does.**
- **Run** the arrangement and watch glucose accumulate against its gradient while the sodium gradient holds.
- **Block the pump.** The voltmeter barely moves for minutes; then the sodium gradient decays and glucose transport fails with it. The delay is the point of the scene and must be visible on the trace, so the trace is not optional here.
- **Block the potassium leak channels.** The potential collapses at once. Running these two blockers in turn is the fastest way to learn that the potential is the leak's and the gradient is the pump's.
- **External potassium** slider, with the predicted equilibrium potential drawn beside the measured one: 61.5 mV per tenfold change at body temperature, and the reader can check it.
- **Block the symporter**; and **remove the tight junction**, which lets the accumulated glucose leak back around the outside of the cell — the §3.7 tie, made as a consequence rather than a remark.
- **Energy panel**: the work released by one mole of sodium entering, split into its concentration term and its electrical term, against the work from one mole of ATP. The reader changes the gradient and watches the two figures approach.
- **Scene** switch to the heart cell: run the antiporter, apply **digoxin**, and watch internal sodium rise, calcium expulsion slow and the contraction strengthen.

**Objectives it teaches.** `membrane-potential`, `gradient-energy`, `secondary-active`, `gut-glucose`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'gut-cell' \| 'heart-cell'` |
| `pumpRunning` | boolean | |
| `leakChannelsOpen` | boolean | |
| `naInsideMM`, `naOutsideMM` | number | |
| `kInsideMM`, `kOutsideMM` | number | |
| `potentialMv` | number | measured, inside relative to outside |
| `nernstKMv` | number | predicted for potassium from the current concentrations |
| `glucoseLumenMM`, `glucoseCellMM`, `glucoseBloodMM` | number | |
| `glucoseRatio` | number | cell ÷ lumen; above 1 is the whole claim |
| `symporterActive` | boolean | |
| `tightJunction` | boolean | |
| `naEnergyKjPerMol` | number | total work from one mole of sodium entering |
| `naChemicalKj`, `naElectricalKj` | number | the two terms separately |
| `atpKjPerMol` | number | about 50 under cellular conditions |
| `blocked` | string[] | subset of `['pump','leak','symporter','tight-junction','digoxin']` |
| `calciumInsideNm` | number | heart scene |
| `contractionStrength` | number | heart scene, relative to untreated |
| `t` | number | clock, seconds, three decimals |

**Why it is a mechanism.** Two blockers with visibly different time courses settle the question the prose makes a point of: the potential is potassium leaking, the gradient is the pump's, and the second takes minutes to notice the first.

**Narrow composition.** Second composition. The cell stays upright — lumen above, blood below is already a tall arrangement — and the bars, the voltmeter and the energy panel move into one column beneath it rather than flanking it. The trace, which is what shows the delay after the pump is blocked, keeps full width; the energy panel collapses to two rows, total and ATP, with the two terms available on press.

---

## 4.8 · `bulk-transport` — Four ways to move what will not fit

**What it shows.** A stretch of cell surface with cytoplasm below, where four processes can be run and combined: phagocytosis of a bacterium, indiscriminate pinocytosis, receptor-mediated endocytosis of LDL particles, and exocytosis of a secretory vesicle. A ledger along one edge tracks the cell's surface area as vesicles arrive and depart, and a marked patch of membrane can be followed out and back.

**What the reader does.**
- **Phagocytosis**: release a bacterium, watch actin push arms of membrane around it, and follow the vesicle to a lysosome.
- **Pinocytosis**: a rate slider, from off to the observed rate of a macrophage, which is fast enough to move the ledger within a minute of watching.
- **Receptor-mediated endocytosis**: LDL particles bind receptors, receptors gather into a dimple, clathrin assembles underneath, the pit pinches off. A **break the receptor** switch leaves LDL piling up outside while almost none is taken in — familial hypercholesterolaemia in one control — and a **receptor count** slider, which is what a statin changes.
- **Exocytosis**: bring a secretory vesicle up and fuse it.
- **Follow a patch**: mark a piece of membrane on the inside of a vesicle and watch it become the outer face of the cell, sugars and all, and come back in the same way round.
- **Balance**: run secretion and drinking at different rates and watch the area ledger drift, with a line naming what would happen to the cell. Setting them equal brings the ledger back to flat.

**Objectives it teaches.** `bulk-transport`, `receptor-endocytosis`, `membrane-budget`, `identify-mechanism`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `processes` | string[] | subset of `['phagocytosis','pinocytosis','receptor-mediated','exocytosis']`, those currently running |
| `stageName` | string \| null | the stage of the process in the foreground |
| `receptorsWorking` | boolean | |
| `receptorCount` | number | what a statin raises |
| `ldlBound`, `ldlInternalised`, `ldlOutside` | number | |
| `vesiclesIn`, `vesiclesOut` | number | since reset |
| `membraneAreaUm2` | number | the running surface area |
| `areaBalance` | number | net change since reset; 0 when the two flows match |
| `pinocytosisRate` | number | vesicles per second |
| `markedPatchFace` | string \| null | `'vesicle-lumen' \| 'cell-exterior' \| 'endosome-lumen'` — never `'cytosol'` |
| `sugarsFacing` | string | `'exterior'` or `'lumen'`; a run that ever reports `'cytosol'` is a defect |
| `digested` | number | particles delivered to a lysosome |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The area ledger turns an arithmetic claim into something the reader can break, and the marked patch makes §4.2's asymmetry a consequence of the geometry rather than an assertion about sorting.

**Narrow composition.** Shrinks honestly. The four process controls become a two-by-two group under the stage and the ledger runs along the bottom rather than the side, where its one number and its net line stay legible.

---

## Notes for whoever registers these

- **`narrowAspect` for all eight**, values in the table above. Three carry a genuine second composition — `permeability`, `transport-lab` and `gradient-battery` — each for the reason stated in its block. The other five shrink honestly and say what they re-stack.
- **One WebGL figure**, `membrane3d`, so it is `npm run sweep3d`'s only chapter-4 entry. Its default view shows both faces of the sheet at once and is stated in the module header.
- **Every kind needs a recipe in `tools/drive.js` or `npm run drive` fails**, so the recipes can be written from this brief before the modules exist. The fields worth asserting after driving are the computed ones, not the ones a button sets: `assembly` and `sealed` (4.1), `diffusionUm2PerS` and `immobileFraction` (4.2), `rejections` and `equilibrated` (4.3), `psiPressureInside` and `outcome` (4.4), `halfMaxMM` and `selectivityRatio` (4.5), `chargePerCycle` and `cellVolumeFraction` (4.6), `glucoseRatio` and `nernstKMv` (4.7), `areaBalance` (4.8).
- **Add `biology/ch04-membranes-and-transport/FIGURES.md` to `tools/pages-exclude.txt`**, or this brief deploys to the live site, as chapters 2 and 3 did before anyone noticed.
- **If one has to be cut**, `bulk-transport` is the one Section 4.8 survives without, though `receptor-endocytosis` and `membrane-budget` would then have no figure to set a task against. `permeability` and `osmometer` cannot be cut: between them they carry nine objectives and the debt this chapter owes Chapter 3. Do not split `transport-lab` into two figures — the carrier curve and the channel filter are the two halves of one claim, that a protein makes transport fast and choosy without making it active.
