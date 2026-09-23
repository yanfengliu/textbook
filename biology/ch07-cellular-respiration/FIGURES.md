# Chapter 7 — figure brief

Eight figures, in the order they appear in `index.html`. The figure number is fixed by that order and the prose cites every one of them by number, so the order does not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 7.1 | `respiration-tour` | `fig-respiration` | opener, cited in 7.1 | no | 16 / 9 | 4 / 5 |
| 7.2 | `glycolysis` | `fig-glycolysis` | 7.2 | no | 21 / 9 | 3 / 4 |
| 7.3 | `krebs` | `fig-krebs` | 7.3 | no | 16 / 10 | 4 / 5 |
| 7.4 | `respiratory-chain` | `fig-chain` | 7.4 | no | 21 / 9 | 4 / 5 |
| 7.5 | `atp-synthase` | `fig-synthase` | 7.5 | **yes** | 16 / 10 | 1 |
| 7.6 | `yield-ledger` | `fig-yield` | 7.6 | no | 16 / 9 | 3 / 4 |
| 7.7 | `fermentation` | `fig-fermentation` | 7.7 | no | 16 / 9 | 4 / 5 |
| 7.8 | `uncoupler-bench` | `fig-uncoupling` | 7.8 | no | 16 / 9 | 3 / 4 |

Kind ids and figure ids are clear of every other chapter's, checked against `src/figures/registry.js` on 2026-09-17 and against chapter 6's own list, supplied by its author the same day: chapter 6 is `photon-lab`, `chloroplast3d`, `pigment-spectra`, `zscheme`, `proton-ledger`, `calvin-cycle`, `rubisco-fork`, `carbon-concentrator`, none of which collides with the eight above. Two names here were chosen deliberately against the obvious one. `glycolysis` is a kind and also a glossary key and also this chapter's §7.2 `<section id>`; those three namespaces do not meet, and `npm run check` holds that every `id` in the document is unique, which the figure id `fig-glycolysis` satisfies. And the chain figure is `respiratory-chain` rather than `electron-chain`, because chapter 6 draws the other one and a bare `electron-chain` would have to be fought over later.

**One WebGL figure, deliberately, and for the same reason chapters 4 and 5 each had one.** ATP synthase is a rotary motor: the rotor turns inside a fixed head, the shaft is bent and off-centre, and the three catalytic sites are at 120 degrees to one another. Every one of those facts is about arrangement in space, and a reader who cannot turn the thing over has to take the geometry on trust. The other seven subjects are ledgers, lines, rings, traces and maps, which a composed 2D view states better than a perspective one.

## Palette: this chapter asks for nothing new

Read the long comment above `METABOLISM` in `src/palette.js` before adding anything, and then do not add anything. Chapter 5's brief asked for six values and the measurement that answered it fixed four — `atp`, `enzyme`, `electronCarrier`, `electronCarrierLoaded` — and refused two, `adp` and `phosphate`, with a reason in each case that `metabolismPart()` now throws back at you by name. Chapter 7 draws the same substances under load and needs no colour the book has not got:

- **ATP and ADP** are `metabolismPart('atp')`, ADP being the same disc with its third phosphate gone. Do not ask for an `adp` colour; the error message explains why, and the sweep that produced it is in the file.
- **A transferred phosphate group** is a phosphorus atom with its oxygens — `ELEMENTS.P` in `src/figures/lib/chem-atoms.js`, violet with P written on it in `paper`. Figures 7.2 and 7.5 both move one, and they move the same mark.
- **NAD⁺ and NADH, FAD and FADH₂** are `electronCarrier` and `electronCarrierLoaded`. The pair is the one pair in the table meant to read as related, measured at 13.4 apart, and §7.4's whole argument is that the difference between them is what the chain is unloading. Do not draw a loaded carrier as the currency: `atp` against `electronCarrierLoaded` is 43.3 apart precisely so a reader cannot confuse an ATP with an NADH, and §7.6's sum is meaningless to anyone who does.
- **A respiratory complex is a pump**, `membranePart('pump')`, because that is exactly what it is; and so is ATP synthase, which is a pump named for the direction we care about (§7.5). Complex II, which pumps nothing, is drawn as `enzyme` instead, and that difference is a claim the figure is making.
- **The membrane** is `lipidHead` and `lipidTail`; **the organelle** is `mitochondrion` from `ORGANELLES`; **glucose and the sugar intermediates** are `glucose` from `MEMBRANE`; **oxygen, iron and the ions** come from the element table.

Two quantities in this chapter have nothing to be the colour of, and both are set as type rather than given a hue. **Heat** is `inkSoft`, as §5.1 and §5.4 set it. **A proton** is a hydrogen ion and takes `ELEMENTS.H`, but a *gradient* of them is not a colour at all: it is a number in millivolts and a count on two sides of a line, and a figure that shades the intermembrane space to show "more protons" has drawn a fog where it should have drawn a readout.

## What every figure here owes

Nothing in this section is answered by a gate unless the line names one. The gates prove that a figure mounts, reports what it claims and survives being pressed; every judgement below is a person's, made at the artefact's own resolution, in both themes, at the widths a reader uses.

**A 2D figure is built on `src/figures/lib/bench.js`.** It is not a framework: it is a function called inside `mount` that returns the object the frame already expects. What that means for the block you write below is that four of the lines in this section stop being yours to remember and become the bench's to enforce — the readout cannot be a pill, a chip, a bordered box or a progress bar because `readout()` emits only `<text>` and `<line>`; the primary action is `primary: true` and the bench renders it as `--rule-head` on the edge and the ink's weight, never as a fill; a control's narrow label is a second span and its accessible name is the long label at every width, by construction; and a negative or `NaN` dimension throws in the lab instead of reaching the DOM, because `pane.rect` and its siblings are the only way to a dimension attribute. `test/bench.test.js` fails a bench figure that defines `mulberry32`, makes its own `ResizeObserver`, writes `border-radius` or `border:` in its own CSS, or calls `el('rect'|'circle'|'line'|'ellipse')` directly.

Everything else in this section is still yours, and the honest list of what the bench does **not** reach is in [figure-bench.md](../../docs/design/figure-bench.md): whether a composition is *good*, whether a label collides at one slider value and not another, whether an assembled sentence is grammatical in every state, and whether the type is legible at 390 px. The bench is finished before the chapter's figure workers start and none of them may extend it — if it cannot do something, drop through to `pane.add()` for that one thing and propose the extension for the next chapter. The WebGL figures keep `lib/three-common.js` for the scene and take only the chrome.

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

- **It may not report `id`, `kind`, `number` or `state`.** The frame owns those four and spreads them last, so a figure using one would lose its own value without a word. `npm run drive` fails it. `foldlab` reports `foldState`; `plantcell3d` reports `turgorState`. No field in this brief uses any of the four, and none may be added — which is why 7.1 reports `stage` and `scene`, 7.5 reports `direction`, and 7.8 reports `verdict`, rather than any of them being called a state.
- Report the numbers in the units the prose uses, so a task's goal and the readout agree. In this chapter that means kilojoules per mole for every energy, volts for every reduction potential, millivolts for every membrane force, millimoles per litre for every concentration, and whole counts for protons, ATP and carbons.
- Every field an item can name must be reachable through the reader's own controls, and **must not become true on its own as the clock runs** — otherwise the only load-bearing clause in the expectation is the one proving the reader acted.

### A figure's words are prose

A sentence inside a figure module is read by the same reader and is corrected when the chapter is. `symbiont.js` carried a claim about mitochondrial division machinery for days after the prose had dropped it as wrong. **Five sentences in this chapter are ones the whole chapter turns on, and a figure that contradicts any of them is wrong however good it looks**: that the electron transport chain makes no ATP; that oxygen is what takes the electrons at the end and not what the chain is for; that fermentation yields no ATP of its own; that the ATP per glucose is a range of about 30 to 32 and not 38; and that lactate is a fuel and is not what makes a muscle ache two days later.

---

## 7.1 · `respiration-tour` — One glucose, taken apart in four places

**What it shows.** A cell in section, with its cytosol and one mitochondrion opened far enough to show the outer membrane, the intermembrane space, the folded inner membrane and the matrix. One glucose molecule is followed through all four stages. Three things are tracked at once and each has its own mark: the six carbons, which leave as carbon dioxide and are counted out; the electrons, which go onto carriers and then along the inner membrane; and the ATP, which is counted and marked by the stage that made it. It opens paused, at the start of glycolysis, with every counter at zero — because the first thing a reader should do is run it and notice how long the ATP counter stays small.

**The second scene is the argument.** A steel calorimeter beside the cell, with the same glucose and the same oxygen in it. Igniting it gives the same equation, the same free energy, a thermometer that climbs past a thousand degrees, and an ATP counter that never leaves zero. The two scenes share one ledger, so the free energy released reads the same in both and only the disposal differs.

**What the reader does.**
- **Run**, **pause**, **step to the next stage**, **reset**. Stepping is the point: a reader who stops after the link reaction should see four carbons still in the cell and two ATP on the board.
- **Speed**, three settings. The default is slow enough that a carbon can be followed by eye.
- **Burn it instead**, which switches to the calorimeter and back. Both scenes keep their counters, so the comparison survives switching.
- **Show what is tracked**: carbon, electrons, or ATP. All three at once is legible at desktop and is not at 390 px, which is what the narrow composition is for.
- **Heat readout**, set as type and not as a colour: kilojoules released so far, and the fraction captured.

**Objectives it teaches.** `respiration-definition`, `respiration-vs-combustion`, `four-stages`, `cristae-area`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'cell' \| 'calorimeter'` |
| `stage` | string | `'glycolysis' \| 'link' \| 'krebs' \| 'oxphos' \| 'done'`; `'none'` in the calorimeter |
| `compartment` | string | where the current stage is happening: `'cytosol' \| 'matrix' \| 'inner-membrane'` |
| `tracking` | string | `'carbon' \| 'electrons' \| 'atp'` |
| `carbonsReleased` | number | 0 to 6; 2 after the link reaction, 6 after two turns |
| `carriersLoaded` | number | NADH plus FADH₂ currently reduced |
| `nadhMade`, `fadh2Made` | number | running totals |
| `protonsPumped` | number | 0 until the fourth stage, and that zero is a claim |
| `atpByStage` | object | `{ glycolysis, krebs, oxphos }`, whole numbers |
| `atpTotal` | number | the sum |
| `heatKj` | number | released and not captured, kJ per mole of glucose |
| `capturedFraction` | number | 0–1; 0 in the calorimeter in every state |
| `temperatureC` | number | 37 in the cell whatever happens; hundreds in the calorimeter |
| `speed` | string | `'slow' \| 'normal' \| 'fast'` |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader can stop the run at any stage and read three counters that disagree with the story most readers arrive with: the carbon is all gone before the ATP starts, and the calorimeter's thermometer is the only thing in the figure that moves when the same reaction is allowed to go at once. The claim that the two routes have the same free energy is on the stage as one number shared between two scenes, and a reader can check it rather than being told it.

**Narrow composition.** Second composition. The cell and the calorimeter cannot sit side by side at 390 px, so below 800 px only one scene is drawn at a time and **Burn it instead** becomes the switch between them rather than a comparison control; the shared ledger is what carries the comparison, and it keeps both columns. The mitochondrion moves from beside the cytosol to below it, the three trackings stop being simultaneous — `tracking` selects one and the other two are counted rather than drawn — and the stage counters become four rows of type under the stage. Nothing is dropped: every field above is still reachable.

---

## 7.2 · `glycolysis` — Ten steps, two halves

**What it shows.** The ten steps as a line the reader walks, left to right, with the molecule drawn at each step: its carbon count, its phosphate groups, and the enzyme's name beneath. At step four the six-carbon molecule splits and the line becomes two lanes that run in step, which is the visual fact that makes the ledger come out right. Running tallies sit under the line — ATP spent, ATP made, net ATP, NADH, pyruvate — and the net figure is deliberately negative for the first four steps. It opens at step 0 with nothing spent, paused.

**What the reader does.**
- **Step forward**, **step back**, **run**, **reset**. Stepping back is not decoration: the whole point of the two halves is that the net figure goes down before it goes up, and a reader should be able to walk over that boundary in both directions.
- **Ledger per glucose** or **per fragment**, which is the commonest arithmetic slip in the section and is worth being able to switch.
- **The committed step's controls**: an ATP slider and an AMP slider in millimoles per litre, and a citrate slider. Raising ATP closes the committed step and the line stops there with a readout saying which control closed it; raising AMP opens it again. This is §5.7's feedback loop with the reader's hand on it.
- **Knock out an enzyme**, any of the ten. The intermediate before the gap accumulates and everything past it drains away, both reported.
- **Name the phosphate donor**: the two ATP-making steps each print the compound the phosphate came from and where that compound sits on §5.3's ladder, because §7.2's argument is that the sugar paid and not the phosphate.

**Objectives it teaches.** `glycolysis-ledger`, `substrate-level-phosphorylation`, `glycolysis-committed-step`, `glycolysis-universal`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `step` | number | 0 to 10 |
| `phase` | string | `'investment' \| 'payoff'` |
| `carbonsPerMolecule` | number | 6 before the split, 3 after |
| `moleculesInFlight` | number | 1 before the split, 2 after |
| `atpSpent`, `atpMade` | number | |
| `atpNet` | number | negative until step 7; a run that never goes negative is a defect |
| `nadhMade`, `pyruvateMade` | number | |
| `ledgerPer` | string | `'glucose' \| 'fragment'` |
| `committedStepOpen` | boolean | computed from the three sliders, never set by a button |
| `closedBy` | string \| null | `'atp' \| 'citrate' \| null` — which control shut it |
| `atpMM`, `ampMM`, `citrateMM` | number | |
| `knockedOut` | string \| null | the enzyme removed |
| `accumulating` | string \| null | the intermediate piling up; computed |
| `drainedAway` | string[] | what has disappeared past the gap |
| `donorForStep` | string \| null | the compound the current step took its phosphate from |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** `atpNet` goes negative and comes back, in front of the reader, which is the thing a static diagram of ten arrows cannot make anybody feel. And the committed step is a real switch: raise the ATP slider and the line stops, which is a feedback loop the reader closes with their own hand rather than reads about.

**Narrow composition.** Second composition. Ten steps in a row at 390 px gives each step 39 px, which puts the enzyme names under nine device pixels. Below 800 px the line turns through 90 degrees into a vertical ladder and shows **one phase at a time** — five steps, with the other phase collapsed to a single summary row that says what it cost or earned — and the split becomes two columns within the ladder rather than two lanes across it. The tallies move to a five-row table beneath, right-aligned in tabular figures. The three sliders become steppers on one row and keep their desktop labels, because item goals quote them.

---

## 7.3 · `krebs` — The carbon, and where it goes

**What it shows.** The cycle as a ring of eight positions, with the carbon count written on every intermediate, the link reaction feeding in from outside the ring, and the two decarboxylations and four oxidations marked where they happen. The ring is the drawing and it fills the pane; the tallies are typography to one side. It opens with the link reaction done and one acetyl group waiting, paused at the joining step.

**The labelled carbon is the reason this figure exists.** The reader can label either of the acetyl group's two carbons, or any one of oxaloacetate's four, and follow it round for three turns. The readout names where the label is and which turn it finally left on, and for an acetyl carbon the answer is never the first — which is the fact §7.3's margin note is about, and the one a reader will not believe from a sentence.

**What the reader does.**
- **Run**, **step**, **reset**, and a **turn counter** that keeps going past the second turn, because the labelled carbon needs three.
- **Label a carbon**: six choices, and a readout naming the labelled position and, once it has gone, the turn it left on.
- **Drain an intermediate** to a named biosynthetic route — the five-carbon one to glutamate, oxaloacetate to aspartate, citrate out for fat. Oxaloacetate runs down and the cycle slows and stops, with the readout saying what it is short of. **Top up** carboxylates pyruvate and restarts it.
- **Fuel**: glucose, a sixteen-carbon fatty acid, or an amino acid. Each traces its own entry point into the ring, and the fatty acid's is drawn as repeated two-carbon cuts with the carriers each cut produces.
- **Tallies**, per turn and cumulative: carbons in, carbons out, NADH, FADH₂, ATP.

**Objectives it teaches.** `link-reaction`, `krebs-carbon-accounting`, `krebs-is-a-cycle`, `krebs-output`, `krebs-amphibolic`, `other-fuels`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `turn` | number | 0 before the first joining step |
| `position` | string | which of the eight intermediates the cycle is at |
| `carbonsHere` | number | the current intermediate's carbon count, 4, 5 or 6 |
| `carbonsIn`, `carbonsOut` | number | cumulative; equal at the end of every turn |
| `nadhPerTurn`, `fadh2PerTurn`, `atpPerTurn` | number | 3, 1 and 1 in every state; a run reporting otherwise is a defect |
| `nadhTotal`, `fadh2Total`, `atpTotal` | number | cumulative |
| `labelledCarbon` | string \| null | `'acetyl-1' \| 'acetyl-2' \| 'oxaloacetate-1'…`; null when none |
| `labelPosition` | string \| null | where the label currently sits |
| `labelReleasedOnTurn` | number \| null | the turn the labelled carbon left on; never 1 for an acetyl carbon |
| `oxaloacetateLevel` | number | arbitrary units on one scale, stated in the module header |
| `drainedTo` | string \| null | the biosynthetic route taking an intermediate |
| `stalled` | boolean | the cycle has stopped for want of oxaloacetate; computed |
| `toppedUp` | boolean | |
| `fuel` | string | `'glucose' \| 'fatty-acid' \| 'amino-acid'` |
| `entryPoint` | string | the intermediate the chosen fuel joins at |
| `atpPerGram` | number | for the chosen fuel, so §7.3's cross-check is on the stage |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** Label an acetyl carbon and it does not come out on the first turn, however many times the reader runs it. That is a fact about a cycle that a ring-with-arrows diagram not only fails to show but actively suggests the opposite of, and it took the subject twenty years to settle.

**Narrow composition.** Second composition. A ring with eight labelled nodes at 390 px puts every label either inside the ring, where they collide, or outside it, where they leave the stage. Below 800 px the ring keeps its shape and its carbon counts but **the intermediate names move into a numbered list beneath**, with the position the cycle is at marked in both; the two decarboxylations and the four oxidations stay marked on the ring, because they are the argument. The fuel entry points become one line of type naming the entry rather than three drawn routes. The tallies re-stack to five rows.

---

## 7.4 · `respiratory-chain` — The fall, in four steps

**What it shows.** The inner membrane drawn edge-on across the width of the stage, matrix below and intermembrane space above, with the four complexes in it, ubiquinone diffusing within the bilayer and cytochrome c skating along the outer face. A vertical axis of reduction potential runs down the left, from −0.4 V at the top to +0.9 V at the bottom, and **every carrier is placed on the membrane at the height its own potential puts it at** — so the drawing is also the graph, and a pair of electrons is seen falling from rung to rung rather than travelling sideways. Protons cross where a complex pumps them, and are counted. It opens with the chain idle, oxygen present, nothing blocked.

**What the reader does.**
- **Deliver a pair from NADH** (at complex I) or **from FADH₂** (at complex II), and run. The two donors are the figure's central comparison: the second enters four rungs lower and drives four fewer protons, and both counters are on screen at once.
- **Block a complex**: rotenone at I, malonate at II, antimycin A at III, cyanide at IV, each named with its target. The carriers above the block fill and the ones below empty, drawn and reported, with the crossover named. **Malonate is the exception and the figure must model it correctly**: electrons from NADH enter at complex I and never pass through complex II, so with `donor: 'nadh'` a block at II changes nothing — `protonsPumped` keeps rising and `crossoverAt` stays null. It backs the chain up only with `donor: 'fadh2'`. A figure that flattens the trace for malonate on an NADH donor contradicts §7.8's own paragraph about it, which is there because that is the mistake.
- **Remove the oxygen**, which backs the whole chain up from the bottom in the same way and is the state §7.7 opens in.
- **Readouts**, as a typographic table: protons pumped, potential drop in volts, free energy released in kJ per mole, the gradient as a pH difference and as a voltage, and an **ATP counter that stays at zero in every reachable state**.

**Objectives it teaches.** `chain-components`, `redox-ladder`, `chain-pumps-protons`, `oxygen-is-the-acceptor`, `fadh2-enters-lower`, and `blocking-the-chain` jointly with 7.8.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `donor` | string | `'nadh' \| 'fadh2'` |
| `pairsDelivered` | number | since reset |
| `protonsPumped` | number | 10 per pair from NADH, 6 from FADH₂ |
| `potentialDropV` | number | 1.14 for the NADH route, 0.79 for the other |
| `energyReleasedKj` | number | per mole of pairs; about 220 and about 150 |
| `atpMadeHere` | number | **0 in every reachable state.** A run reporting anything else is a defect, not a setting |
| `gradientPH` | number | matrix minus intermembrane space |
| `gradientMv` | number | the voltage term |
| `oxygenPresent` | boolean | |
| `blockedAt` | string \| null | `'I' \| 'II' \| 'III' \| 'IV' \| null` |
| `blockedBy` | string \| null | the substance's name, as the prose spells it |
| `reducedCarriers` | string[] | computed from the block, never listed by the button |
| `oxidisedCarriers` | string[] | the complement |
| `crossoverAt` | string \| null | where reduced turns to oxidised |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** `atpMadeHere` never moves, and the reader is given every control that might be expected to move it. That is the section's whole claim made falsifiable on the stage. Second to it: the crossover experiment is run rather than described, so the reader works out the order of a chain from the outside, which is what the people who first did it had to do.

**Narrow composition.** Second composition. A membrane stretched across a 21 / 9 stage becomes a 390 px strip with four complexes at 90 px each, which puts the complex names and the potential axis both under nine device pixels. Below 800 px **the whole figure rotates**: the potential axis becomes the vertical spine, the four complexes stack down it at their own potentials, and the membrane is drawn as two vertical rules either side of them with the protons crossing left to right. The mobile carriers stay drawn, because the fixed-versus-mobile distinction is an objective. The readout becomes six rows of type beneath, and the `atpMadeHere` row is never dropped at any width.

---

## 7.5 · `atp-synthase` — The rotor, the shaft and the three sites

**What it shows.** ATP synthase in a patch of inner membrane, in three dimensions, large enough that the ring of subunits reads as a ring and the three catalytic sites read as three. Protons are drawn entering the outer half-channel from the intermembrane space, binding to one subunit of the ring, riding round with it, and leaving by the inner half-channel into the matrix. The bent shaft turns with the ring inside the three-fold head, and **each of the three sites is drawn and labelled in whichever of its three shapes it is currently in**, with ADP and phosphate binding, joining, and the ATP being released. It opens intact and stalled, at a default view stated in the module header: the membrane edge-on and the rotor's axis vertical, so that the ring and the head are both seen as what they are.

**What the reader does.**
- **Orbit** by drag or arrow keys, zoom with + and −, as in `cell3d` and `membrane3d`. `setView({ theta, phi, distance })` for the sweep gate.
- **The force, in its two parts**: a pH-difference slider and a membrane-voltage slider, with a readout that adds them into one figure in millivolts and prints both terms, because §7.5's claim is that one of the two carries three-quarters of it.
- **The ATP-to-ADP ratio**, which is the other half of what decides the direction.
- **Run**, **pause**, **step one third of a turn**, which is one ATP.
- **Ring size**: 8, 10 or 14 subunits, and the protons-per-ATP readout moves with it. A line names which organism each is, and the 14 names Section 6.5.
- **Watch one site**: a control that follows a single catalytic site round, so the three shapes are seen as three stages of one cycle rather than three different things.

**Objectives it teaches.** `proton-motive-force`, `chemiosmosis-principle`, `sealed-compartment`, `synthase-is-a-motor`, `synthase-reversible`, `chemiosmosis-evidence`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `view` | object | `{ theta, phi, distance }`, distance non-zero |
| `drawCalls`, `triangles` | number | |
| `deltaPH` | number | matrix minus intermembrane space |
| `membraneMv` | number | the charge term |
| `pmfMv` | number | the two added; about 200 at the opening values |
| `chargeFraction` | number | 0–1, the share of the force that is charge; about 0.75 |
| `cSubunits` | number | 8, 10 or 14 |
| `protonsPerAtp` | number | `cSubunits ÷ 3`, computed and not tabulated |
| `revolutions` | number | since reset, to one decimal |
| `atpMade`, `protonsUsed` | number | |
| `siteShapes` | string[] | three entries, each `'loose' \| 'tight' \| 'open'`; never all the same |
| `watchedSite` | number \| null | 0, 1 or 2 |
| `atpRatio` | number | ATP to ADP |
| `direction` | string | `'synthesis' \| 'stalled' \| 'hydrolysis'`, computed from `pmfMv` and `atpRatio` and never set by a button |
| `membraneIntact` | boolean | |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader lowers the force until the machine stalls and then further until it runs backwards, spending the ATP it had been making — which is §5.4's claim about a coupled machine near its limit, §4.7's pump run as a generator, and §7.5's reversibility, all as one slider. And the gear ratio is arithmetic the reader performs: change the ring from eight to fourteen and `protonsPerAtp` moves, because it is computed from the ring and not looked up.

**Narrow composition.** Shrinks honestly at `narrowAspect: 1`, as `cell3d`, `water3d`, `membrane3d` and `atp3d` do. What does not shrink is the readout: below 800 px it moves under the stage at full width as a seven-row table rather than being inset over the molecule, and the two force sliders collapse to one row of steppers that keep their desktop labels. The three site labels are drawn on the model at desktop and become a three-row table at 390 px, because three labels on a rotating object at that size collide with each other at some angles and with the toolbar at others.

---

## 7.6 · `yield-ledger` — Build the number yourself

**What it shows.** A ledger the reader assembles rather than reads. Four rows across the top for the four stages, each carrying what it made directly and what carriers it produced. Beneath them the conversion is done in the open, with every assumption as a control rather than a constant. A total sits at the foot, and beside it a band marking the honest range of 30 to 32, so that a reader can see when their assumptions have taken them outside it. It opens at the measured values with the malate–aspartate shuttle and transport charged, reading 32.

**What the reader does.**
- **ATP per NADH** and **ATP per FADH₂**, each stepping between the measured value and the old round one — 2.5 or 3, 1.5 or 2.
- **Shuttle**: malate–aspartate or glycerol 3-phosphate, with a line naming a tissue that uses each and what the choice costs.
- **Charge for transport**, on or off, with a line saying what is being charged for: the ATP going out, the phosphate coming in.
- **Fuel**: glucose, a sixteen-carbon fatty acid, or an amino acid, with totals per molecule, per carbon and per gram. The per-gram figure is the one §7.3's cross-check uses.
- **Count in protons instead**, which redoes the same sum in protons rather than in ATP, so the two ways of counting can be compared and the reader can see which step the conversion happens at.
- **A marker that lights when the assumptions are exactly the ones producing 38**, and names all three of them. It is not a preset button: a reader has to arrive at it, which is the difference between being shown the error and making it.

**Objectives it teaches.** `yield-arithmetic`, `p-o-ratio`, `shuttle-cost`, `why-not-38`, `respiration-efficiency`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `fuel` | string | `'glucose' \| 'fatty-acid' \| 'amino-acid'` |
| `atpPerNadh`, `atpPerFadh2` | number | |
| `shuttle` | string | `'malate-aspartate' \| 'glycerol-phosphate'` |
| `transportCharged` | boolean | |
| `nadhMatrix`, `nadhCytosol`, `fadh2Count` | number | the three carrier populations, counted separately because the shuttle only touches one |
| `atpDirect` | number | 4 for glucose in every state |
| `atpFromCarriers` | number | computed |
| `atpTotal` | number | the sum |
| `inHonestRange` | boolean | 30 to 32 inclusive; computed from `atpTotal`, not from the controls |
| `matchesTextbook38` | boolean | |
| `assumptionsFor38` | string[] | the three, named; empty unless `matchesTextbook38` |
| `efficiencyPercent` | number | against 2870 kJ/mol, at the standard 30.5 per ATP |
| `heatKj` | number | the remainder |
| `atpPerGram` | number | |
| `countingIn` | string | `'atp' \| 'protons'` |
| `protonsPerGlucose` | number \| null | null while counting in ATP |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader makes 38 appear and then has to take it apart, which is a different experience from being told it is wrong. Every term in the sum is a control, so "the number is a range" stops being a hedge and becomes something the figure demonstrates: three moves, each of them defensible-sounding, and the total walks from 30 to 38.

**Narrow composition.** Second composition. A four-column ledger with a control row under each column is a table at desktop and a mess at 390 px. Below 800 px it becomes **one column of labelled rows** — stage rows first, then a hairline, then the assumption rows, then a hairline, then the total — with the numbers right-aligned in tabular figures and the range band drawn as a marked span on the total row rather than as a band beside it. The controls become steppers interleaved with the rows they change, which is the only arrangement at that width where a reader can tell which control moved which number. The fuel selector keeps its desktop labels.

---

## 7.7 · `fermentation` — What actually runs out

**What it shows.** A cell with its NAD pool drawn between glycolysis and the chain as a small closed loop, and — this is the composition decision — **the pool is drawn as a count of discs, empty and loaded, and not as a bar**, because the argument of §7.7 is that the pool is small and countable and a bar says nothing about how small. Glycolysis is on the left, the chain on the right, the pool between them. It opens aerobic and running steadily, with the pool mostly empty, because the reader's first act should be to take the oxygen away.

**What the reader does.**
- **Oxygen**, on or off. Off, the chain stops, the pool fills within a few seconds of figure time, and glycolysis stalls — with a readout naming what has run out, which is the sentence the section exists for.
- **Fermentation route**: none, lactate (one enzyme), or ethanol (two, with carbon dioxide released). Switching one on restarts glycolysis, and **the ATP-per-glucose readout does not move**, which is the figure's central claim.
- **Demand**, a slider setting how fast the cell is spending ATP, so a reader can find the rate at which fermentation cannot keep up.
- **Muscle** and **yeast** presets, which set the route, the demand and what happens to the product.
- **Restore the oxygen** after a lactate run, and the clearance is timed: some oxidised where it stands, some sent to the liver, with a ledger showing the liver spending six ATP to rebuild the glucose the muscle got two from.

**Objectives it teaches.** `carrier-pool-limit`, `fermentation-purpose`, `two-fermentations`, `lactate-facts`, and `anaerobic-respiration` jointly with 7.4.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `oxygen` | boolean | |
| `route` | string | `'none' \| 'lactate' \| 'ethanol'` |
| `preset` | string \| null | `'muscle' \| 'yeast' \| null` |
| `nadPoolTotal` | number | the whole pool, a small whole number |
| `nadhLoaded` | number | how much of it is reduced |
| `poolFull` | boolean | computed; glycolysis has stopped for want of an empty carrier |
| `ranOutOf` | string \| null | what stopped it; `'nad'` and never `'atp'` |
| `glycolysisRate` | number | arbitrary units on one scale, stated in the module header |
| `secondsStalled` | number | figure time since glycolysis stopped |
| `atpPerGlucose` | number | 2 without oxygen, about 30 with |
| `atpFromFermentationStep` | number | **0 in every reachable state.** A run reporting otherwise is a defect |
| `lactateMM`, `ethanolPercent` | number | |
| `co2Released` | number | ethanol route only |
| `demand` | number | |
| `clearedSeconds` | number \| null | how long the lactate took to clear after oxygen returned |
| `lactateOxidised`, `lactateToLiver` | number | the two fates |
| `liverAtpSpent` | number | 6 per glucose rebuilt |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader takes the oxygen away expecting the ATP to fail and watches the carriers fail first — and then switches on a fermentation and watches glycolysis restart with the ATP figure unchanged. Both halves are counters the reader put into that state, and both contradict the sentence most readers arrive with.

**Narrow composition.** Shrinks honestly. Glycolysis, the pool and the chain stack into one column at 4 / 5 with the pool in the middle, which is the same arrangement rotated and loses nothing. The Cori-cycle ledger, which is a two-column comparison at desktop, becomes four rows of type. The pool's discs stay discs at every width — that is the composition and it is the reason the aspect is what it is.

---

## 7.8 · `uncoupler-bench` — Two ways to stop it, on one trace

**What it shows.** An oxygen-electrode trace, drawn live, beneath a suspension of mitochondria — the instrument Chance and Williams used, and the only figure in the chapter that is a recording rather than a scene. The trace is oxygen remaining against time, so respiration is its slope. Beside it, as a typographic table: the proton gradient, the ATP production rate, the heat production rate, and the respiratory control ratio with the two slopes it was taken from printed under it, because §5.7's rule is that an exemption prints its own measurement. It opens with fuel added and no ADP, so the trace is nearly flat and the reader's first addition does something.

**What the reader does.**
- **Add, in any order**: fuel, ADP, oligomycin, an uncoupler, cyanide. Each is named and each does something different to the slope, and the order matters — an uncoupler added after oligomycin restarts the trace, which is the classic demonstration and the thing no chemical-intermediate story can account for.
- **The list of additions so far**, printed in order, so a reader can reproduce the experiment and say what they did.
- **Second scene: a brown fat cell.** The same uncoupling, done deliberately by a protein in the membrane. A **cold** control turns it on; the mitochondria run flat out, the ATP readout stays near zero, and a body-temperature readout rises. The protein's channel can be opened and closed so the two states are comparable.
- **Reset the chamber**, which clears the additions and the trace.

**Objectives it teaches.** `blocking-the-chain` (jointly with 7.4), `uncoupling`, `respiratory-control`, `uncoupling-on-purpose`, `diagnose-respiration`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `scene` | string | `'chamber' \| 'brown-fat'` |
| `added` | string[] | in the order added |
| `oxygenRemaining` | number | per cent of the chamber's starting oxygen |
| `oxygenRateNmolPerMin` | number | the current slope |
| `atpRateNmolPerMin` | number | |
| `heatRateKjPerMin` | number | |
| `gradientMv` | number | |
| `controlRatio` | number \| null | the ratio of the two slopes; null until both have been measured |
| `ratioFromSlopes` | number[] \| null | the two slopes it was computed from, printed with it |
| `verdict` | string | one of `'coupled and respiring'`, `'coupled, waiting for ADP'`, `'uncoupled'`, `'synthase blocked'`, `'chain blocked'`; computed from the additions and the rates, never set by a button |
| `cold` | boolean | brown-fat scene |
| `leakOpen` | boolean | brown-fat scene |
| `bodyTemperatureC` | number | brown-fat scene |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** An uncoupler makes the trace *steeper* and the ATP go to nothing, and a blocker makes it flat. Those two are opposite in a way that is obvious on one instrument and invisible in any diagram, and between them they are the evidence chemiosmosis rests on. The reader performs the discrimination rather than being told its outcome.

**Narrow composition.** Second composition. The trace and the readout table cannot share a 390 px width. Below 800 px **the trace keeps the full width** and the table moves beneath it as six rows, because a slope read at half width is not a slope; the tray of substances becomes a single row of steppers above the trace, and the list of additions becomes a line of type rather than a column. The brown-fat scene re-stacks — cell above, readouts below — and loses nothing.

---

## Notes for whoever registers these

- **`narrowAspect` for all eight**, values in the table at the head of this brief. **Six carry a genuine second composition** — `respiration-tour`, `glycolysis`, `krebs`, `respiratory-chain`, `yield-ledger` and `uncoupler-bench` — each for the reason stated in its own block. That is one more than chapter 5 needed, and the reason is the subject: five of this chapter's eight figures are a scene beside a graph, a ledger or a long line, which is the shape that never survives a 390 px stage. The other two, `atp-synthase` and `fermentation`, shrink honestly and each says what it re-stacks.
- **One WebGL figure**, `atp-synthase`, so it is `npm run sweep3d`'s only chapter-7 entry. Its default view is the membrane edge-on with the rotor's axis vertical, stated in the module header, so that the ring reads as a ring and the three-fold head as three.
- **Every kind needs a recipe in `tools/drive.js` or `npm run drive` fails**, so the recipes can be written from this brief before the modules exist. The fields worth asserting after driving are the **computed** ones and never the ones a button sets: `carbonsReleased` and `capturedFraction` and `temperatureC` (7.1), `atpNet` and `committedStepOpen` and `closedBy` (7.2), `labelReleasedOnTurn` and `stalled` and `carbonsOut` (7.3), `atpMadeHere` and `crossoverAt` and `protonsPumped` (7.4), `direction` and `protonsPerAtp` and `siteShapes` (7.5), `atpTotal` and `inHonestRange` and `assumptionsFor38` (7.6), `ranOutOf` and `poolFull` and `atpFromFermentationStep` (7.7), `verdict` and `controlRatio` (7.8).
- **`tools/pages-exclude.txt` needs no new line, and adding one would be a mistake.** The list holds `**/*.md`, which is a class and not an instance, and `tools/pages-exclude.js` compiles `**/` so that it may match zero segments, so `biology/ch07-cellular-respiration/FIGURES.md` is already excluded from the published tree without anybody naming it. Confirm rather than assume: `node tools/pages-exclude.js` prints this file among the paths it trims.
- **Four invariants a reviewer must check by hand, because no gate can.** Each is the figure's whole claim reduced to one field, and each would look perfectly healthy if it were quietly wrong. `atpMadeHere` is 0 in every reachable state of 7.4, including with the oxygen removed and with every complex blocked in turn. `atpFromFermentationStep` is 0 in every reachable state of 7.7, on both routes and at every demand. `nadhPerTurn` is 3 and `fadh2PerTurn` is 1 in every reachable state of 7.3, including while the cycle is stalled. And `labelReleasedOnTurn` is never 1 for either acetyl carbon in 7.3 — which is the hardest of the four to get right and the one most likely to be quietly wrong, because the obvious implementation releases whichever carbons the decarboxylation steps happen to point at.
- **Three numbers a figure may not invent**, because the prose derives them and a figure disagreeing with the prose is the defect the brief's last section is about: 10 protons per NADH and 6 per FADH₂ (7.1, 7.4, 7.6); 2.5 ATP per NADH and 1.5 per FADH₂ as the *measured* values, with 3 and 2 available only as the reader's own wrong assumption (7.6); and 2870 kJ/mol for glucose, shared by 7.1's two scenes so that the comparison is one number and not two.
- **If one has to be cut**, `respiration-tour` is the one §7.1 survives without, at the cost of the chapter losing its hero and of four objectives losing their figure; §7.1 is an orientation section and its argument is carried by the prose and by the four-stage table better than any other section's is. **`respiratory-chain` and `atp-synthase` cannot be cut**: between them they carry eleven objectives, the correction to "the chain makes ATP", and the debt this chapter owes Chapter 4. Do not split `yield-ledger` into a table and a calculator — the whole figure is the argument that the number is a range, and a table of the honest values with a calculator beside it would be two figures each making half a claim.
- **Chapter 6 will not mount `atp-synthase`, and it was asked.** Its author's answer, 2026-09-17: §6.5's claim is about where the protons come from and what the gradient is worth, not about how the rotor works, so it draws the thylakoid in cross-section as a ledger with the synthase as one more path through the membrane and a turn counter, and a 3D rotary motor there would be a second figure answering a question that section does not ask. Chapter 6's prose states the chloroplast ring at fourteen against the mitochondrial eight and cites Figure 7.5 as where the rotor is actually turned. So **keep the `cSubunits` control and keep 14 among its values**, even though no chapter-7 sentence needs the chloroplast figure: it is what makes chapter 6's cross-reference land. This paragraph is here so that the next reader does not re-open a question that has been answered.
- **Chapter 8 will want two of these back.** `yield-ledger`'s fuel switch and `krebs`'s biosynthetic drains are both the opening move of a chapter about what a cell builds and what decides it. Build them so that a later chapter can mount them with a different preset rather than needing its own copy, and say in each module header which later chapter is expected to ask — the convention chapter 5's brief established and chapter 6 has already used.
