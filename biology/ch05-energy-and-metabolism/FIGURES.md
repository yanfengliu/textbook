# Chapter 5 — figure brief

Eight figures, in the order they appear in `index.html`. The figure number is fixed by that order and the prose cites every one of them by number, so the order does not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 5.1 | `entropy-ledger` | `fig-entropy` | opener, cited in 5.1 | no | 16 / 9 | 4 / 5 |
| 5.2 | `free-energy` | `fig-free-energy` | 5.2 | no | 16 / 9 | 3 / 4 |
| 5.3 | `atp3d` | `fig-atp` | 5.3 | **yes** | 16 / 10 | 1 |
| 5.4 | `coupling-bench` | `fig-coupling` | 5.4 | no | 16 / 9 | 4 / 5 |
| 5.5 | `activation-barrier` | `fig-enzyme` | 5.5 | no | 16 / 9 | 4 / 5 |
| 5.6 | `enzyme-kinetics` | `fig-kinetics` | 5.6 | no | 16 / 9 | 3 / 4 |
| 5.7 | `feedback-pathway` | `fig-feedback` | 5.7 | no | 16 / 10 | 3 / 4 |
| 5.8 | `metabolic-map` | `fig-metabolism` | 5.8 | no | 16 / 10 | 4 / 5 |

Kind ids and figure ids are clear of every other chapter's, checked against `src/figures/registry.js` on 2026-09-16: `pond`, `homeostasis`, `levels`, `scale`, `cell3d`, `dna3d`, `energy`, `tree`, `pasteur`; `soup`, `bondlab`, `water3d`, `waterprops`, `phlab`, `carbonkit`, `polymer`, `foldlab`; `microscopes`, `surface-volume`, `prokaryote`, `secretion`, `symbiont`, `cytoskeleton`, `cilium`, `plantcell3d`; `bilayer`, `membrane3d`, `permeability`, `osmometer`, `transport-lab`, `pump`, `gradient-battery`, `bulk-transport`; `zj-split`, `zj-timeline`, `zj-words`. Note in particular that `energy` is chapter 1's kind and `fig-energy` is chapter 1's id (Figure 1.7), which is why the thermodynamics figure here is `entropy-ledger` / `fig-entropy` and not the obvious name.

**One WebGL figure, deliberately, and it is the same argument chapter 4 made.** ATP is a molecule whose shape is the point: three charged phosphates strung in a row, repelling each other, at a distance the reader should be able to see. The other seven subjects are ledgers, curves, cycles and maps, which a composed 2D view states better than a perspective one, and a second figure in 3D would be decoration.

## Palette additions this chapter needs (whoever registers these)

Read the long comment above `MEMBRANE` in `src/palette.js` before adding anything. It records that chapter 4's brief asked for thirteen colours and that eight were added; that every one of them is a `mix()` of colours the book already has, with **no new hue**; that a further accent would break the separation the existing five hold under the common colour-vision deficiencies; and that the ions are deliberately not in that table, because chapter 2 fixed one colour for every ion — `leaf`, with the symbol written on it — in `ELEMENTS` and `atomColours` in `src/figures/lib/chem-atoms.js`.

So this brief asks for **three things, in six values**, all derivable by `mix()` and all of which recur across chapters 5, 6 and 7:

- `atp` and `adp` — one hue at two values, charged and spent, because every figure in this chapter that draws the currency draws both and the whole point is that they are the same molecule in two conditions. `pump` (`mix(violet, ink, 0.4)`) is already the colour of a protein spending ATP, so the currency should not be violet.
- `phosphate` — the group that is transferred. It is the thing the reader has to follow from ATP onto a substrate in 5.4 and onto a protein in 5.7, so it has to be legible as a small mark on top of another fill, which means it needs a `label` token measured for contrast the way the `MEMBRANE` entries are.
- `electronCarrier` and `electronCarrierLoaded` — again one hue at two values, empty and reduced, for NAD⁺ and NADH in 5.8. Chapters 6 and 7 both need these, and they must not read as the currency: a reader who confuses an ATP with an NADH has lost the argument of §5.8.

Reused unchanged, and a figure here may not invent its own version of any of them: `glucose` (the fuel and the substrate), `carrier` and `pump` and `channel` (the transport proteins of 5.4's pump scene), `lipidHead` and `lipidTail` (any membrane drawn edge-on), `mitochondrion`, `lysosome` and `vesicle` from `ORGANELLES`, and the ions from the element table. **An enzyme is not a carrier and must not be given the carrier's violet**; if the registrar judges that six additions is too many, the one to cut is `phosphate` (drawn instead as a small disc in the ion palette with P written on it) and the one that cannot be cut is the enzyme's own value, because 5.5, 5.6 and 5.7 draw an enzyme beside a substrate, a product and an inhibitor in the same frame.

Heat is **not** a colour. It is the chapter's one quantity that has no thing to be the colour of, and 5.1 and 5.4 both report it: draw it as motion and set it as type, in `inkSoft`, as the readouts are set.

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

- **It may not report `id`, `kind`, `number` or `state`.** The frame owns those four and spreads them last, so a figure using one would lose its own value without a word. `npm run drive` fails it. `foldlab` reports `foldState`; `plantcell3d` reports `turgorState`. No field in this brief uses any of the four, and none may be added — which is why 5.1 reports `mode` and 5.5 reports `startedFrom` rather than either being called a state.
- Report the numbers in the units the prose uses, so a task's goal and the readout agree. In this chapter that means kilojoules per mole for every energy, millimoles per litre for every concentration, and degrees Celsius for every temperature.
- Every field an item can name must be reachable through the reader's own controls, and **must not become true on its own as the clock runs** — otherwise the only load-bearing clause in the expectation is the one proving the reader acted.

### A figure's words are prose

A sentence inside a figure module is read by the same reader and is corrected when the chapter is. `symbiont.js` carried a claim about mitochondrial division machinery for days after the prose had dropped it as wrong. **Three sentences in this chapter are ones the whole chapter turns on, and a figure that contradicts any of them is wrong however good it looks**: that breaking a bond always costs energy, that an enzyme changes no equilibrium, and that heat released nearby does no work.

---

## 5.1 · `entropy-ledger` — Order costs, and the bill is visible

**What it shows.** A compartment of cytoplasm with a boundary the reader can seal, and a ledger beside it. Food molecules cross in; inside, a polymer chain is assembled monomer by monomer; heat and small waste molecules leave. Three bars: the entropy inside the compartment, which falls as the chain grows; the entropy created outside it, which rises; and the sum, which never falls in any state the reader can reach. It opens open, supplied, and running slowly, with a short chain already built, because the first thing a reader should do is seal it.

**It must be honest about what it is.** The module header states that the entropy figures are in arbitrary units on one consistent scale, not joules per kelvin, and that the model is a bookkeeping toy: each transaction moves a fixed quantum into the chain and a larger one into the surroundings, with the split set by the efficiency control. The claim the figure makes is that the total cannot be made to fall, and a figure that quietly floored the total rather than computing it would be making no claim at all.

**What the reader does.**
- **Supply** slider, from nothing to plentiful, which sets how fast food arrives.
- **Efficiency** slider, 0 to 1: how much of each transaction ends up in the chain rather than leaving as heat. The interesting thing is that pushing it to 1 still does not make the total fall, because assembling the chain is itself an ordering, and the readout says so.
- **Seal the boundary.** Supply stops; the chain stops growing, holds for a while, and then comes apart, with the inside bar climbing back and the total still rising. This is the one control that shows what "open system" means.
- **Temperature** slider, which changes how fast everything happens and how much heat each transaction sheds.
- **Run**, **pause**, **reset**.
- **Heat readout**, set as type and not as a colour: joules shed per second, and the running total.

**Objectives it teaches.** `energy-forms`, `first-law`, `entropy`, `second-law-life`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `mode` | string | `'open' \| 'sealed'` |
| `supplyRate` | number | food molecules arriving per second |
| `efficiency` | number | 0–1, the fraction of a transaction reaching the chain |
| `temperatureC` | number | |
| `chainLength` | number | monomers assembled, and the visible measure of order |
| `entropyInside` | number | arbitrary units; falls as the chain grows |
| `entropyOutside` | number | same units |
| `entropyTotal` | number | the sum |
| `totalEverFell` | boolean | false in every state; a run reporting true is a defect, not a setting |
| `heatShed` | number | running total, same units as the prose quotes |
| `sealedSeconds` | number | how long the boundary has been closed; 0 while open |
| `decaying` | boolean | the sealed compartment has begun to lose its chain |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader is invited to break the second law and cannot: every control that should help — more supply, perfect efficiency, a different temperature — moves the two bars and never the sum, and sealing the boundary turns the whole thing off. The claim is falsifiable on the stage.

**Narrow composition.** Shrinks honestly. The compartment keeps the upper two-thirds at 4 / 5, the three bars become three stacked rows beneath it with their numbers right-aligned in tabular figures, and the supply and efficiency sliders become steppers on one row. Nothing is dropped: the whole figure is three numbers and a picture.

---

## 5.2 · `free-energy` — Which way does it go, and why that is not fixed

**What it shows.** A reaction as a tilting landscape, with the reactants on one side and the products on the other, and a live readout of where ΔG stands. Two independent halves feed it. The first is the chemistry: the reader sets the heat term and the entropy term and the temperature, and reads ΔH, TΔS and their difference. The second is the conditions: the reader sets the concentrations of reactant and product, and reads the standard value, the concentration term and the true ΔG as their sum. It opens at a mildly exergonic reaction, unrun, with both readouts showing.

**What the reader does.**
- **Heat term** and **entropy term** sliders, either of which can be positive or negative, and a **temperature** slider. A line names which term is carrying the reaction, and a readout gives the temperature at which the sign of ΔG flips, or says there is none.
- **A preset for the hydrophobic effect** — heat term slightly positive, entropy term strongly positive — because §5.2 uses it as the case where a change that takes heat in still runs, and a reader should be able to get there without guessing two slider positions.
- **Concentration** sliders for reactant and product, in mmol/L, with the concentration term computed as RT ln of the ratio and printed beside the standard value. Setting the product high enough reverses a reaction without any change to its chemistry, which is the section's point.
- **Run** and **pause**. Running drifts the concentrations towards equilibrium, ΔG approaches zero, and at equilibrium **both crossing counters keep climbing at equal rates** — the figure's answer to "does the reaction stop", made the way `permeability` makes it.
- **Keep the product removed**, the cell switch: the product is taken away as fast as it is made, ΔG stays negative indefinitely, and a timer reports how long it has stayed negative. Turning it off lets the reaction settle, and the trace shows the two behaviours side by side.

**Objectives it teaches.** `free-energy`, `enthalpy-entropy`, `spontaneous-not-fast`, `concentrations-decide`, `equilibrium-is-death`, `diagnose-reaction`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `deltaHKj` | number | the heat term, kJ/mol |
| `deltaSKjPerK` | number | the entropy term, kJ/mol per kelvin |
| `temperatureC` | number | |
| `deltaGStandardKj` | number | ΔH − TΔS at the current temperature |
| `entropyDriven` | boolean | ΔH positive and ΔG negative — the hydrophobic-effect case |
| `flipTemperatureC` | number \| null | where the sign of ΔG changes; null when it never does |
| `reactantMM`, `productMM` | number | |
| `concentrationTermKj` | number | RT ln(product ÷ reactant) |
| `deltaGKj` | number | the true value: the standard value plus the concentration term |
| `verdict` | string | `'exergonic' \| 'endergonic' \| 'equilibrium'`, computed from `deltaGKj` |
| `equilibriumRatio` | number | the product-to-reactant ratio at which ΔG reaches zero |
| `crossingsForward`, `crossingsBack` | number | since reset; equal and both still rising at equilibrium |
| `atEquilibrium` | boolean | |
| `productRemoved` | boolean | the cell switch |
| `secondsNegative` | number | how long ΔG has been negative without interruption |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The same reaction can be made to run forwards, stop, and run backwards without one atom of its chemistry changing, by the reader moving two concentration sliders. That is §5.2's whole claim and no static figure can make it.

**Narrow composition.** Second composition. At 3 / 4 the landscape takes the top, the two readouts stack under it as one typographic table of five rows — standard value, concentration term, true ΔG, verdict, equilibrium ratio — and the four sliders become two rows of steppers. The trace is dropped below 800 px in favour of the live numbers and the `secondsNegative` counter, because a two-series plot at 390 px puts its axis labels under nine device pixels. Both readout tables keep their desktop labels, because item goals quote them.

---

## 5.3 · `atp3d` — The molecule, split and accounted for

**What it shows.** One ATP molecule in three dimensions, large enough that the three phosphates are separately visible: adenine, ribose and the chain, with the negative charges drawn and a repulsion overlay showing how hard they push on each other. Hydrolysing it detaches the outer phosphate; the remaining chain visibly relaxes; the freed ion's charge is drawn spread over its four equivalent oxygens; and shells of water close around both products. Beside it is a ledger, set as a typographic table, of what breaking the bond cost and what each of the four things that pay for it contributed, with a total. It opens intact, at a default view that shows the whole chain end-on to the reader — stated in the module header — in a cell's concentrations rather than the standard state.

**What the reader does.**
- **Orbit** by drag or arrow keys, zoom with + and −, as in `cell3d` and `membrane3d`. `setView({ theta, phi, distance })` for the sweep gate.
- **Hydrolyse**, and **rejoin**, so the cycle can be run either way. Rejoining prints what it costs, which is the same number with the sign reversed and is worth seeing.
- **Show the repulsion** and **show the hydration**, two overlays that are the two hardest parts of the account to believe.
- **The ledger**: open it and each row is drawn on the molecule as it is selected. Selecting the bond alone prints a line saying that breaking it costs energy and returns none, which is the misconception §5.3 exists to remove — and it must read as an explanation, not as an error message.
- **Concentration** sliders for ATP, ADP and phosphate, which move the true ΔG away from the standard −30.5 and print both. Setting all three to one mole per litre brings them together, which is a good way to learn what "standard" means.
- **Scene switch to the ladder**: eight phosphate-carrying compounds ranked vertically by what their hydrolysis releases, with ATP in the middle. The reader picks a donor and a target and the figure says whether the transfer can happen and by how much, so §5.3's "takes from above, gives below" is a thing the reader tries rather than a sentence.

**Objectives it teaches.** `atp-structure`, `atp-why-energy`, `not-high-energy-bond`, `atp-cellular-value`, `currency-not-store`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `view` | object | `{ theta, phi, distance }`, distance non-zero |
| `drawCalls`, `triangles` | number | |
| `scene` | string | `'molecule' \| 'ladder'` |
| `hydrolysed` | boolean | |
| `repulsionShown`, `hydrationShown` | boolean | |
| `ledgerOpen` | boolean | |
| `ledgerRow` | string \| null | the row currently selected; `'bond'` is the one that prints the correction |
| `bondBreakingKj` | number | positive — what breaking the bond cost |
| `repulsionReliefKj`, `resonanceKj`, `hydrationKj`, `entropyKj` | number | negative — what paid for it |
| `ledgerTotalKj` | number | the sum; about −30.5 and must agree with `deltaGStandardKj` |
| `atpMM`, `adpMM`, `phosphateMM` | number | |
| `deltaGStandardKj` | number | −30.5, fixed |
| `deltaGKj` | number | at the current concentrations; about −50 at the opening values |
| `donor`, `target` | string \| null | ladder scene |
| `rungKj` | number | what the selected donor releases on hydrolysis |
| `transferPossible` | boolean | ladder scene; computed from the two rungs, never set by the buttons |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The ledger has to add up, and it adds up out of four contributions the reader can switch on one at a time — so "why does this release energy" is answered by parts that can be removed and put back, rather than by a phrase. And the reader can watch the same molecule be worth 30 or 50 kilojoules a mole depending only on where the sliders are.

**Narrow composition.** Shrinks honestly at `narrowAspect: 1`, as `cell3d`, `water3d` and `membrane3d` do. The ledger cannot shrink and does not try: below 800 px it moves under the stage at full width as a six-row table rather than being inset over the molecule, and the three concentration sliders collapse to one row of steppers. The ladder scene re-orients from a tall ladder with labels to the right into a tall ladder with labels beneath each rung, because eight labels beside eight rungs at 390 px collide.

---

## 5.4 · `coupling-bench` — Couple it, or merely put it nearby

**What it shows.** A bench with an uphill job on one side, a source of free energy on the other, and between them a switch that decides whether the two are genuinely joined. Coupled, the shared intermediate is drawn and named as it forms and is consumed, the two free energy changes are set out in a column with their sum, and the job gets done. Uncoupled, the source is consumed at the same rate, nothing moves, and a heat readout climbs with everything that was spent. It opens uncoupled, with a job chosen and nothing running, so that the reader's first act produces the failure the section warns about.

**What the reader does.**
- **Job**: join glutamate to ammonia (+14.2 kJ/mol), push three sodium ions out of a cell, take one step along a microtubule, or join two monomers into a chain. Each shows what it needs.
- **Source**: ATP, creatine phosphate, a sodium gradient, or none.
- **Couple / uncouple**, which is the figure. When coupled, the intermediate is named — glutamyl phosphate, the phosphorylated pump, the nucleotide bound in the motor — and drawn forming and being consumed. When uncoupled, no intermediate ever forms, and the readout says so rather than simply showing nothing.
- **Run** and **step**, with a tally of jobs done, source spent, and heat produced.
- **Scene switch to the pump**, which works chapter 4's numbers as a ledger: sliders for the four concentrations and the membrane voltage, the cost of three sodium out and two potassium in computed term by term, and the margin against what one ATP is worth drawn as a bar. Push the gradients steeper and the margin goes negative and the pump reverses and starts making ATP, which is §5.4's closing claim and Chapter 7's opening one.

**Objectives it teaches.** `coupling-principle`, `shared-intermediate`, `phosphorylation-work`, `pump-efficiency`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'bench' \| 'pump'` |
| `job` | string | `'glutamine' \| 'sodium' \| 'motor-step' \| 'polymer'` |
| `jobKj` | number | positive, what the job needs |
| `source` | string | `'atp' \| 'creatine-phosphate' \| 'sodium-gradient' \| 'none'` |
| `sourceKj` | number | negative, what the source releases |
| `coupled` | boolean | |
| `intermediate` | string \| null | named only while coupled; null whenever `coupled` is false |
| `sumKj` | number | `jobKj + sourceKj` |
| `proceeds` | boolean | computed: coupled and the sum negative |
| `jobsDone`, `sourceSpent` | number | since reset |
| `heatKj` | number | what the uncoupled transactions produced |
| `naInsideMM`, `naOutsideMM`, `kInsideMM`, `kOutsideMM` | number | pump scene |
| `potentialMv` | number | inside relative to outside, pump scene |
| `naCostKj`, `kCostKj` | number | per cycle, split further into the chemical and electrical terms on the stage |
| `cycleCostKj` | number | the total a cycle must supply; about 44 at chapter 4's values |
| `atpValueKj` | number | about −50 at cellular concentrations |
| `marginKj` | number | `atpValueKj + cycleCostKj`; positive means the pump has nothing left |
| `direction` | string | `'pumping' \| 'stalled' \| 'reversed'`, computed from `marginKj` |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** One switch separates the right answer from the wrong one that almost every reader arrives with, and the same ATP is spent either way — so the difference between coupling and proximity is something the reader watches rather than something they are told.

**Narrow composition.** Shrinks honestly, re-stacking rather than dropping. At 4 / 5 the job moves above and the source below, with the intermediate and the sum between them where the eye already is; the three-row free-energy column stays as it is, since it is already a typographic table. The pump scene keeps the membrane horizontal and moves the five sliders into one scrolling row beneath it, and the margin bar keeps full width because it is the scene's verdict.

---

## 5.5 · `activation-barrier` — The barrier moves; the two ends do not

**What it shows.** One reaction drawn twice over and kept in step: a free energy landscape with reactants, a barrier and products, and a molecular scene in which substrate molecules arrive, bind, are converted and leave. Beside them, a short table of the forward rate, the reverse rate, ΔG and the ratio at which the two rates balance. It opens without enzyme, running slowly, from pure reactant.

**What the reader does.**
- **Add enzyme / remove enzyme.** The barrier falls and rises; the two ends of the landscape do not move, and ΔG is printed beside them so that a reader can watch it fail to change. Both rates rise by the same factor and the balance ratio does not move — three claims, all visible at once, and the section's whole argument.
- **Run from pure product** instead of pure reactant, and arrive at the same ratio. This is the cheapest possible demonstration that a catalyst has no preferred direction, and it is the reason the figure keeps a `startedFrom` field.
- **Temperature** slider: the rate rises, and past the enzyme's limit the enzymes in the molecular scene unfold, the barrier springs back and the rate collapses. The asymmetry of the curve — gentle up, sharp down — is the thing to notice.
- **Offer the site something**: the substrate, a wrongly shaped molecule, or an inhibitor. The site closes around what it accepts (induced fit, drawn as a closing rather than as a caption) and refuses the rest.
- **Show the transition state**, drawn and labelled at the top of the climb, with the enzyme's grip on it drawn tighter than its grip on the substrate — which is the one idea under all the others.

**Objectives it teaches.** `activation-energy`, `enzyme-lowers-barrier`, `enzyme-not-equilibrium`, `active-site`, `why-not-heat`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `enzymePresent` | boolean | |
| `activationKj` | number | the forward barrier |
| `activationReverseKj` | number | the reverse barrier; falls by the same amount when enzyme is added |
| `deltaGKj` | number | must be identical with and without enzyme, in every state |
| `equilibriumRatio` | number | must be identical with and without enzyme, in every state |
| `forwardPerSecond`, `reversePerSecond` | number | |
| `speedUp` | number | the current forward rate ÷ the rate with no enzyme |
| `startedFrom` | string | `'reactant' \| 'product'` |
| `ratioNow` | number | product ÷ reactant at this moment |
| `converted`, `reverted` | number | conversions each way since reset |
| `temperatureC` | number | |
| `denatured` | boolean | |
| `offered` | string | `'none' \| 'substrate' \| 'wrong-shape' \| 'inhibitor'` |
| `accepted` | boolean | whether the site took what was offered |
| `siteClosed` | boolean | induced fit has happened |
| `transitionShown` | boolean | |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** Two fields — `deltaGKj` and `equilibriumRatio` — are ones the reader tries to move and cannot, and that failure is the lesson. Running the same reaction from the other end and landing on the same ratio is a result the reader produces, not one they are shown.

**Narrow composition.** Second composition. Below 800 px the landscape takes the upper half of a 4 / 5 stage at full width and the molecular scene the lower half, rather than sitting side by side; the four-row rate table moves beneath both as one group; and the temperature slider and the offer buttons become two rows with the offer buttons first, since they are what the narrow reader is most likely to press. The labels on the landscape — reactants, transition state, products — are the ones an item may quote and keep their desktop wording at both widths.

---

## 5.6 · `enzyme-kinetics` — Sweep it yourself, then try to beat the inhibitor

**What it shows.** A lane of enzyme molecules and a graph that the reader draws. In the lane, each enzyme visibly binds, converts and releases, and the proportion busy at any instant rises towards one as the substrate goes up. On the graph, a point is plotted for each concentration the reader visits, so the curve is built by sweeping and the graph starts empty. Markers show the ceiling and the concentration at half of it. It opens at low substrate, with no inhibitor and nothing plotted.

**What the reader does.**
- **Substrate** slider, which drives the lane and plots the graph. Sweeping it is the experiment.
- **Amount of enzyme** slider, which moves the ceiling and leaves the half-way concentration exactly where it was. That separation is the lesson and both markers stay on the graph at every width so it can be read off.
- **Inhibitor**: none, competitive, non-competitive, irreversible, each with a concentration of its own. The competitive one is drawn entering the active site and is visibly flushed out as substrate rises; the non-competitive one binds elsewhere and bends the enzyme; the irreversible one stays attached and removes that molecule from the lane permanently, with a count of how many are gone. Each inhibited curve is drawn beside the uninhibited one, so what has happened to the ceiling and to the half-way point is read rather than asserted.
- **Temperature** and **pH** sliders, which move the whole curve and, past their limits, unfold the enzymes in the lane. The temperature curve must be visibly asymmetric.
- **Presets**, which are where the chapter's cases live: hexokinase and glucokinase against a marker at blood glucose; a statin; ethanol against methanol; penicillin. Each loads the constants and names the case in one line.

**Objectives it teaches.** `rate-vs-substrate`, `km-tuning`, `enzyme-conditions`, `inhibition-types`, `drugs-as-inhibitors`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `substrateMM` | number | |
| `rate` | number | molecules per second, same units throughout |
| `enzymeUnits` | number | how much enzyme is present |
| `vmax`, `km` | number | with no inhibitor; `km` does not move with `enzymeUnits` |
| `apparentVmax`, `apparentKm` | number | under the current inhibitor |
| `occupancy` | number | 0–1, sites busy at this instant |
| `plotted` | number | points on the graph; 0 means the reader has swept nothing |
| `inhibitor` | string | `'none' \| 'competitive' \| 'noncompetitive' \| 'irreversible'` |
| `inhibitorMM` | number | |
| `relievedBySubstrate` | boolean | computed by comparing the two curves at high substrate, never set by the button |
| `enzymesDestroyed` | number | irreversible only; never falls |
| `temperatureC`, `ph` | number | |
| `denatured` | boolean | |
| `turnoverPerSecond` | number | per enzyme molecule when saturated |
| `preset` | string \| null | `'hexokinase' \| 'glucokinase' \| 'statin' \| 'ethanol-methanol' \| 'penicillin'` |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader draws the curve by sweeping a slider over a lane in which individual enzymes are visibly busy or idle, so saturation is watched rather than shown; and `relievedBySubstrate` is a verdict the figure computes from the two curves, so "can you beat it with more substrate" is an experiment the reader runs.

**Narrow composition.** Second composition, for the reason `transport-lab` has one: a curve bending over is unreadable in a 90 px column. At 3 / 4 the lane becomes one short strip across the top, the graph takes the full width beneath it, and the inhibitor buttons and the substrate slider sit below that in two groups. The two markers keep their desktop labels. The temperature and pH sliders move behind a single **conditions** control that expands, because six sliders cannot share a 390 px stage without the type going under nine device pixels — and the readout says they are there rather than hiding them.

---

## 5.7 · `feedback-pathway` — A loop, and what happens when you cut it

**What it shows.** Five enzyme-catalysed steps from threonine to isoleucine, each with its own enzyme and its own bar for the intermediate, and the end product connected back to the first enzyme by an inhibition loop drawn as a loop. Beside the pathway, a close-up of that first enzyme showing its two shapes, its allosteric site, and the product binding and unbinding. It opens running, in balance, with a moderate demand — the state the reader has to disturb to learn anything.

**What the reader does.**
- **Demand** slider: how fast the cell consumes isoleucine. Raise it and the first enzyme comes back on; drop it and the pathway throttles itself. The first enzyme's activity tracks the product concentration inversely, and both are readable at once.
- **Break the loop**, by mutating the allosteric site so the product no longer binds. The pathway runs flat out and pours out a product nothing is using — §1.2's opened loop, with molecules.
- **Knock out any one of the five enzymes.** The intermediate before it accumulates; everything past it drains away. Which bar climbs is the answer to §5.8's `pathway-blocked`, and the figure must not name the answer before the reader has watched it happen.
- **Add product from outside**, which shuts the pathway down although the cell made none of it — the cleanest demonstration that the signal is the molecule and not a measurement.
- **Subunits: one or four**, which switches the first enzyme's rate curve between the ordinary bending curve and the S-shaped one, drawn together for comparison, with the steepness reported.
- **Covalent panel**: a kinase attaches a phosphate to an enzyme and a phosphatase removes it, with the ATP counted and the switch holding its state until the phosphatase acts. Switching the phosphatase off and watching the switch stick is the point of having both.

**Objectives it teaches.** `allostery`, `cooperativity`, `feedback-inhibition`, `kinase-switch`, `pathway-homeostasis`, and `pathway-blocked` jointly with 5.8.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `intermediatesMM` | number[] | one per intermediate, in pathway order |
| `productMM` | number | |
| `demand` | number | product consumed per second |
| `firstEnzymeActivity` | number | 0–1 |
| `loopIntact` | boolean | |
| `productAddedMM` | number | added from outside, not made |
| `knockedOut` | number \| null | which enzyme, 1–5 |
| `accumulatingAt` | number \| null | which intermediate is piling up; read off the bars, never set by the knockout button |
| `runaway` | boolean | product rising with no ceiling; reachable only with the loop broken |
| `subunits` | number | 1 or 4 |
| `curveShape` | string | `'hyperbolic' \| 'sigmoid'` |
| `halfSaturationMM` | number | |
| `steepness` | number | slope at the half point; about 1 for one subunit and well above it for four |
| `phosphorylated` | boolean | covalent panel |
| `kinaseOn`, `phosphataseOn` | boolean | |
| `atpSpent` | number | |
| `switchHeldSeconds` | number | how long `phosphorylated` has held without the kinase running |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The loop can be cut three different ways — mutate the site, remove an enzyme, add product from outside — and each produces a different and predictable failure, so the reader tests what the loop is for instead of reading a caption about homeostasis.

**Narrow composition.** Second composition. Five steps in a row at 390 px gives each about seventy pixels, so below 800 px the pathway runs **vertically** down a 3 / 4 stage with each intermediate's bar to the right of its step, which is also the reading order. The enzyme close-up and the rate curve move to a second pane the reader switches to with a control that carries the same word at both widths, and the covalent panel becomes three rows of type. Nothing is dropped; the two panes exist because both are needed and neither survives being a third of a phone.

---

## 5.8 · `metabolic-map` — The hourglass, and the ladder under it

**What it shows.** Two scenes. The **map** draws metabolism as an hourglass: many fuels entering, funnelling into a narrow waist of a few shared intermediates, and many products built outwards from that waist, with catabolic and anabolic routes drawn in opposite directions and their committed steps marked. The **electrons** scene is a vertical ladder of electron affinity, with the carbons of a fuel near the top and oxygen at the bottom, and a carrier that the reader loads and discharges. It opens on the map, with one fuel chosen and nothing knocked out.

**What the reader does.**
- **Fuel**: glucose, a fatty acid, an amino acid. The chosen one's route is traced down to the waist and the shared intermediates it reaches are named.
- **Overlay**: matter, which follows the carbon atoms, or energy, which shades each step by what it releases. Two views of one map, and the difference between them is Chapter 1's two arrows.
- **Knock out an enzyme.** The intermediate before it accumulates; what lies past it drains away; and the readout reports both, which is the phenylketonuria reasoning of §5.8 and the pulse-chase reasoning of §3.4 in one control.
- **Direction**: follow the catabolic route or the anabolic one between the same two compounds, and see that they are not the same route — the steps that differ are marked, and that is what makes separate regulation possible.
- In the **electrons** scene: **take a pair of electrons off the fuel onto a carrier** (NAD⁺ becoming NADH, or FAD becoming FADH₂), then **let them fall**. A **one drop** control releases the whole fall at once and the readout shows nearly all of it leaving as heat with at most one ATP's worth captured; a **in stages** control takes the same fall in parcels the size of one ATP and the captured fraction rises sharply. Same fall, same total, two very different ledgers.
- **Carrier pool**, deliberately small: load it without spending it and oxidation stops, with a line saying why. That constraint is what Chapters 6 and 7 are about and it should be met here first.

**Objectives it teaches.** `catabolism-anabolism`, `redox-basics`, `why-electrons-fall`, `electron-carriers`, `pathway-blocked`, and `diagnose-reaction` jointly with 5.2 and 5.5.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'map' \| 'electrons'` |
| `overlay` | string | `'matter' \| 'energy'` |
| `fuel` | string | `'glucose' \| 'fatty-acid' \| 'amino-acid'` |
| `route` | string[] | the intermediates the chosen fuel passes through, in order |
| `waistCompounds` | number | how many shared intermediates the routes funnel into |
| `direction` | string | `'catabolic' \| 'anabolic'` |
| `stepsThatDiffer` | number | steps where the two directions use different enzymes; never 0 |
| `knockedOut` | string \| null | the enzyme removed |
| `accumulating` | string \| null | the intermediate piling up before the gap; computed, not set |
| `drainedAway` | string[] | what has disappeared past it |
| `carrier` | string | `'nad' \| 'fad'` |
| `carrierLoaded`, `carrierPool` | number | reduced carriers, and the whole pool |
| `poolFull` | boolean | oxidation has stopped for want of an empty carrier |
| `dropMode` | string | `'one-step' \| 'stepwise'` |
| `fallKj` | number | the whole fall; about 220 for NADH to oxygen |
| `capturedKj`, `heatKj` | number | the two halves of the ledger; they sum to `fallKj` |
| `atpMade` | number | |
| `capturedFraction` | number | 0–1 |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The same 220 kilojoules is dropped twice, once in one go and once in stages, and the reader watches the captured fraction change without the fall changing — which is the answer to "why is metabolism so long" and cannot be asserted convincingly in a caption.

**Narrow composition.** Second composition. An hourglass with many routes is unreadable at 390 px, so below 800 px the map becomes a single vertical funnel showing **one fuel at a time**, with the other routes indicated as counted branches rather than drawn, and a control that adds one branch at a time on request. The waist stays labelled at both widths. The electrons scene needs no re-composition beyond re-stacking — a vertical ladder is already a tall arrangement — but its two-column ledger becomes four rows of type, and the `capturedFraction` keeps the same label at both widths because an item goal quotes it.

---

## Notes for whoever registers these

- **`narrowAspect` for all eight**, values in the table above. **Five carry a genuine second composition** — `free-energy`, `activation-barrier`, `enzyme-kinetics`, `feedback-pathway` and `metabolic-map` — each for the reason stated in its block, and each of those five is a figure that draws a graph or a many-node map beside a scene, which is the shape that never survives a phone. The other three shrink honestly and say what they re-stack.
- **One WebGL figure**, `atp3d`, so it is `npm run sweep3d`'s only chapter-5 entry. Its default view shows the whole phosphate chain end-on, so that the three charges are seen as three, and it is stated in the module header.
- **Every kind needs a recipe in `tools/drive.js` or `npm run drive` fails**, so the recipes can be written from this brief before the modules exist. The fields worth asserting after driving are the computed ones, never the ones a button sets: `entropyTotal` and `totalEverFell` (5.1), `deltaGKj` and `verdict` and `flipTemperatureC` (5.2), `ledgerTotalKj` and `transferPossible` (5.3), `sumKj` and `proceeds` and `direction` (5.4), `equilibriumRatio` and `speedUp` and `activationReverseKj` (5.5), `apparentKm` and `relievedBySubstrate` (5.6), `accumulatingAt` and `runaway` and `steepness` (5.7), `accumulating` and `capturedFraction` and `poolFull` (5.8).
- **`tools/pages-exclude.txt` needs no new line, and adding one would be a mistake.** Chapter 4's brief told its registrar to add a path; that instruction is now obsolete. The list holds `**/*.md`, which is a class and not an instance, and `tools/pages-exclude.js` compiles `**/` so that it may match zero segments — so `biology/ch05-energy-and-metabolism/FIGURES.md` is already excluded from the published tree without anybody naming it. Confirm rather than assume: `node tools/pages-exclude.js` prints this file among the paths it trims.
- **Three invariants a reviewer should check by hand**, because no gate can: `totalEverFell` is false in every reachable state of 5.1; `deltaGKj` and `equilibriumRatio` are byte-identical with and without enzyme in 5.5; and `intermediate` is null whenever `coupled` is false in 5.4. Each is the figure's whole claim reduced to one field, and each would look perfectly healthy if it were quietly wrong.
- **If one has to be cut**, `entropy-ledger` is the one §5.1 survives without, at the cost of the chapter losing its hero and of four objectives losing their figure; the section's argument is carried by the prose better than any other section's is. **`atp3d` and `coupling-bench` cannot be cut**: between them they carry nine objectives, the correction to "high-energy bond", and the debt this chapter owes Chapter 4. Do not split `metabolic-map` into two figures — the hourglass and the redox ladder are the two halves of one claim, that metabolism is long because the fall has to be taken in parcels the size of one ATP.
- **Chapters 6 and 7 will want three of these back.** `atp3d`'s ladder, `coupling-bench`'s pump scene run in reverse, and `metabolic-map`'s carrier pool are each the opening move of a later chapter. Build them so that a later chapter can mount them with a different preset rather than needing its own copy, and say in each module header which later chapter is expected to ask.
