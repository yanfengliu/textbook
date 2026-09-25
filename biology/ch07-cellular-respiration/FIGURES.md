# Chapter 7 — figure brief

Four figures, in the order they appear in `index.html`. The figure number is fixed by that order and the prose cites every one of them by number, so the order does not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 7.1 | `glycolysis` | `fig-glycolysis` | 7.2 | no | 16 / 9 | 3 / 4 |
| 7.2 | `krebs` | `fig-krebs` | 7.3 | no | 16 / 10 | 4 / 5 |
| 7.3 | `respiratory-chain` | `fig-chain` | 7.4, cited again in 7.7 and 7.8 | no | 16 / 10 | 2 / 3 |
| 7.4 | `fermentation` | `fig-fermentation` | 7.7 | no | 16 / 9 | 2 / 3 |

**Four were cut on 2026-09-24.** The owner finished this chapter at the reduced scope chapter 6 set (`docs/policies/local-rules.md`, "The usage allowance is the budget"): four of its eight planned figures, and questions instead of figure tasks, so no item in `items.js` sets a task on any figure. The four cut, with the numbers they had in the first plan, and what their sections carry now:

- `respiration-tour` (7.1, the opener's hero). §7.1's argument was always carried by its prose and its four-stage table. The flame against the cell is now one sentence of prose, and the opener has no hero figure. Review finding 12, about the hero's calorimeter, went with it.
- `atp-synthase` (7.5, the chapter's only WebGL figure). The first plan said it could not be cut. It could, at a cost worth naming: §7.5's argument that the synthase is a motor rests on Boyer's binding change, Walker's structure and Noji's filament, all three of which the prose tells, but a reader now takes the machine's geometry — the ring, the bent shaft, the three sites at 120 degrees — on trust from the prose rather than turning it over.
- `yield-ledger` (7.6). §7.6 carries the sum in its two tables and the 38 as arithmetic in the prose.
- `uncoupler-bench` (7.8). The oxygen trace is told, not run, as chapter 6 told its uncoupler; the blocking half is Figure 7.3's inhibitor controls, and the sort at the end of §7.8 is where the reader does the diagnosis.

Their briefs are in this file as it was imported, `git show origin/ch06-07:biology/ch07-cellular-respiration/FIGURES.md`, and should be read only as history: they predate the review of 2026-09-22. Twenty objectives named a cut figure. Seventeen now name none, which the checker accepts. `proton-motive-force` names `fig-chain` instead, and `blocking-the-chain` and `diagnose-respiration` keep the `fig-chain` they already named beside the cut one. `anaerobic-respiration` gains `fig-chain` for its new acceptor control (review finding 17). The header of `objectives.js` says the same.

Kind ids and figure ids are clear of every other chapter's, checked against `src/figures/registry.js` on 2026-09-17 and against chapter 6's own list, supplied by its author the same day. Two names here were chosen deliberately against the obvious one. `glycolysis` is a kind and also a glossary key and also this chapter's §7.2 `<section id>`; those three namespaces do not meet, and `npm run check` holds that every `id` in the document is unique, which the figure id `fig-glycolysis` satisfies. And the chain figure is `respiratory-chain` rather than `electron-chain`, because chapter 6 draws the other one and a bare `electron-chain` would have to be fought over later.

No figure here is WebGL, so this chapter adds nothing to `npm run sweep3d`. The four subjects are a line, a ring, a ladder and a count, which a composed 2D view states better than a perspective one.

## Palette: this chapter asks for nothing new

Read the long comment above `METABOLISM` in `src/palette.js` before adding anything, and then do not add anything. Chapter 5's brief asked for six values and the measurement that answered it fixed four — `atp`, `enzyme`, `electronCarrier`, `electronCarrierLoaded` — and refused two, `adp` and `phosphate`, with a reason in each case that `metabolismPart()` now throws back at you by name. Chapter 7 draws the same substances under load and needs no colour the book has not got:

- **ATP and ADP** are `metabolismPart('atp')`, ADP being the same disc with its third phosphate gone. Do not ask for an `adp` colour; the error message explains why, and the sweep that produced it is in the file.
- **A transferred phosphate group** is a phosphorus atom with its oxygens — `ELEMENTS.P` in `src/figures/lib/chem-atoms.js`, violet with P written on it in `paper`. Figure 7.1 moves one, and any later figure that moves one moves the same mark.
- **NAD⁺ and NADH, FAD and FADH₂** are `electronCarrier` and `electronCarrierLoaded`. The pair is the one pair in the table meant to read as related, measured at 13.4 apart, and §7.4's whole argument is that the difference between them is what the chain is unloading. Do not draw a loaded carrier as the currency: `atp` against `electronCarrierLoaded` is 43.3 apart precisely so a reader cannot confuse an ATP with an NADH, and §7.6's sum is meaningless to anyone who does.
- **A respiratory complex is a pump**, `membranePart('pump')`, because that is exactly what it is. Complex II, which pumps nothing, is drawn as `enzyme` instead, and that difference is a claim the figure is making.
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

- **It may not report `id`, `kind`, `number` or `state`.** The frame owns those four and spreads them last, so a figure using one would lose its own value without a word. `npm run drive` fails it. `foldlab` reports `foldState`; `plantcell3d` reports `turgorState`. No field in this brief uses any of the four, and none may be added.
- Report the numbers in the units the prose uses, so a task's goal and the readout agree. In this chapter that means kilojoules per mole for every energy, volts for every reduction potential, millivolts for every membrane force, millimoles per litre for every concentration, and whole counts for protons, ATP and carbons.
- Every field an item can name must be reachable through the reader's own controls, and **must not become true on its own as the clock runs** — otherwise the only load-bearing clause in the expectation is the one proving the reader acted.

### A figure's words are prose

A sentence inside a figure module is read by the same reader and is corrected when the chapter is. `symbiont.js` carried a claim about mitochondrial division machinery for days after the prose had dropped it as wrong. **Five sentences in this chapter are ones the whole chapter turns on, and a figure that contradicts any of them is wrong however good it looks**: that the electron transport chain makes no ATP; that oxygen is what takes the electrons at the end and not what the chain is for; that in the lactate and alcohol fermentations the fermentation step yields no ATP of its own; that the ATP per glucose is a range of about 30 to 32 and not 38; and that lactate is a fuel and is not what makes a muscle ache two days later.

**Six more sentences were corrected by the review of 2026-09-22 and by the item writer's findings of 2026-09-23, and the four figures below must follow them.** A figure that repeats the first draft's version is wrong however good it looks.

- **The carbons that leave on a turn of the Krebs cycle are not the two that just arrived.** By the end of the second turn as much carbon has left as the glucose brought in, which is a count and not a tracking of atoms. The acetyl group's carbonyl carbon leaves entirely on the second turn; its methyl carbon leaves none on the first two, half on the third, and half of what is left on each turn after that, because succinate is symmetrical. The carbon dioxide of the first turn came from oxaloacetate. Figure 7.2 is built on this.
- **1,3-bisphosphoglycerate is not on Section 5.3's table.** It belongs above ATP on that ladder, at about −49 kJ/mol, between creatine phosphate (−43.0) and phosphoenolpyruvate (−61.9). Figure 7.1 says where it belongs, not that the table lists it.
- **Not every organism runs the same ten steps.** A human, a yeast and most bacteria do. *Pyrococcus* spends ADP rather than ATP at its two phosphorylations and skips 1,3-bisphosphoglycerate; *Sulfolobus* opens its glucose by another route and joins only near the bottom. What all three domains share is the last three steps, from 3-phosphoglycerate to pyruvate. Figure 7.1 draws one organism's pathway and must not claim it is everybody's.
- **Only the Krebs cycle's FADH₂ enters at complex II.** The other FAD enzymes hand their electrons to ubiquinone through doors of their own, at the same level and with the same result. Figure 7.3's second donor is the cycle's.
- **A yeast's carbons, per glucose, are two in carbon dioxide and four in ethanol.** Per pyruvate it is one and two. Figure 7.4's ethanol route counts per glucose.
- **The yield is a range of about 30 to 32 ATP per glucose.** A figure that shows one number says which tissue it is.

**More were corrected by the accuracy review of 2026-09-24 against OpenStax (`2026-09-24-ch07-accuracy.md`, filed beside chapter 6's), and the figures follow them too.** Each is written into its figure's block below; this list is the index.
- **7.1:** AMP and ADP bind an activating site of their own on phosphofructokinase; they do not push ATP off its inhibitory site (finding 17).
- **7.3:** the gradient is charged for charges moved, 4, 2 and 4 for complexes I, III and IV, and a fall pays for at most its size ÷ 19.3 kJ. The acceptor control shows that ceiling, 10, 7, 3, 1 and 0 from NADH, named as a ceiling (finding 9; sulfate's 1 is the figure review's finding 3). Anaerobic respiration uses the same *kind* of machinery, and most methanogens and many sulfate reducers take their electrons from hydrogen, not NADH (finding 8). Malonate stops respiration on pyruvate too, so no label says "any NADH-linked fuel" (finding 20).
- **7.4:** a muscle cut off from oxygen makes lactate from the first moment, so the stall belongs to a cell that cannot ferment (finding 10). A yeast respires its own ethanol later, once the sugar is gone and if there is oxygen (finding 7). The step makes no ATP in the lactate and alcohol fermentations, not in every fermentation (finding 6). Lactate clears within an hour or so, sooner with gentle exercise, and goes to more places than two (finding 30). A yeast's respiratory yield is nearer 16 to 20 than 30 (finding 33), and the 30 is fast skeletal muscle's (finding 42).

**The figure review of 2026-09-24 (`2026-09-24-ch07-figures-accuracy.md`) then checked the four built figures against the prose and OpenStax.** Its findings on 7.1, 7.3 and 7.4 are written into those blocks below as "figure review finding n", to keep them apart from the findings above.

---

## 7.1 · `glycolysis` — Ten steps, two halves

**What it shows.** The ten steps as a line the reader walks, left to right, with the molecule drawn at each step: its carbon count, its phosphate groups, and the enzyme's name beneath. At step four the six-carbon molecule splits and the line becomes two lanes that run in step, which is the visual fact that makes the ledger come out right. Running tallies sit under the line — ATP spent, ATP made, net ATP, NADH, pyruvate — and the net figure is deliberately negative for the first four steps. It opens at step 0 with nothing spent, paused.

**What the reader does.**
- **Step forward**, **step back**, **run**, **reset**. Stepping back is not decoration: the whole point of the two halves is that the net figure goes down before it goes up, and a reader should be able to walk over that boundary in both directions.
- **Ledger per glucose** or **per fragment**, which is the commonest arithmetic slip in the section and is worth being able to switch.
- **The committed step's controls**: an ATP slider and an AMP slider in millimoles per litre, and a citrate slider. Raising ATP closes the committed step and the line stops there with a readout saying which control closed it; raising AMP opens it again. AMP does that from an activating site of its own, turning the enzyme back to its active shape, so the stage must not draw AMP pushing ATP off ATP's site (review of 2026-09-24, finding 17). The levels at which it shuts are illustrative, and the figure's note says so: the real enzyme is turned down by degrees, not shut at one level (figure review finding 1). This is §5.7's feedback loop with the reader's hand on it.
- **Knock out an enzyme**, any of the ten. The intermediate before the gap accumulates and everything past it drains away, both reported.
- **Name the phosphate donor**: the two ATP-making steps each print the compound the phosphate came from and that it belongs **above** ATP on §5.3's ladder, because §7.2's argument is that the sugar paid and not the phosphate. Phosphoenolpyruvate is on §5.3's table; 1,3-bisphosphoglycerate is not, and the figure says where it belongs (about −49 kJ/mol, between creatine phosphate and PEP) rather than that the table lists it.

**Objectives it teaches.** `glycolysis-ledger`, `substrate-level-phosphorylation`, `glycolysis-committed-step`, `glycolysis-universal`. No field below grades `glycolysis-universal`: the figure draws one organism's ten steps, and §7.2's point is that other domains build the top half differently. That objective is tested by questions only, and an item writer should not hunt for a `task` (review finding 30).

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

**Wide composition, as built.** The stage is 16 / 9, not the 21 / 9 a row of eleven seems to want: at 21 / 9 a 1280 px window gave the walk 176 px of height and carbons 6 px across, and an 800 px window gave it 81 px, drawn under the toolbar. The stage's shape picks one of three arrangements. The **line**, all eleven stations in a row with the ledger under it in three columns, needs 760 px of drawing and 210 px of height over the ledger. Short of that, the **phase** view shows one phase at a time, six stations, with the other phase collapsed to a column that says what it cost or will earn, and the ledger beside it. An 800 px window is the tightest the wide stage gets, 480 × 270 px, and there the phase view takes its compact form: where a station would be under 46 px wide or its carbons under 7 px across, the station names give way to a two-line caption naming the step just taken and what it made, the enzymes to their numbers, each currency pair to the one token that changes hands, and the other phase's column to the stations, leaving the ledger to say what that phase cost or earned. The third arrangement, the ladder, is the narrow composition. Past a knock-out the arrows are drawn dashed with no heads, on both lanes, or on the upper lane alone when the isomerase is out, and so are their phosphate ticks and currency strokes: nothing changes hands there.

**Narrow composition.** Second composition. Ten steps in a row at 390 px gives each step 39 px, which puts the enzyme names under nine device pixels. Below 800 px of window the frame makes the stage 3 / 4, and the line turns through 90 degrees into a vertical ladder, centred in at most 600 px, that shows **one phase at a time** — five steps, with the other phase collapsed to a single summary row that says what it cost or earned — and the split becomes two columns within the ladder rather than two lanes across it. Where the stage is tall enough for carbons 10 px across, the ladder shows all eleven stations instead. The tallies move to a five-row table beneath, right-aligned in tabular figures. The three sliders become steppers and keep their desktop labels, because item goals quote them, and their unit, because a bare 3 is not a concentration. The three need about 450 px in a row and a 390 px phone's toolbar has 352, so on a phone they wrap to two rows, not the one this brief first asked for.

---

## 7.2 · `krebs` — The carbon, and where it goes

**What it shows.** The cycle as a ring of eight positions, with the carbon count written on every intermediate, the link reaction feeding in from outside the ring, and the two decarboxylations and four oxidations marked where they happen. The ring is the drawing and it fills the pane; the tallies are typography to one side. It opens with the link reaction done and one acetyl group waiting, paused at the joining step.

**The labelled carbon is the reason this figure exists.** The reader can label either of the acetyl group's two carbons, or any one of oxaloacetate's four, and follow it round for as many turns as they like. `acetyl-1` is the carbonyl carbon and `acetyl-2` the methyl; oxaloacetate's carbons are numbered from the carboxyl beside the keto group, so `oxaloacetate-1` and `oxaloacetate-4` are its two carboxyls. The readout names where the label sits, how much of it left on each turn, and how much is still in the cycle. The rule the figure must compute rather than script is this. A carbon that ends a turn as one of succinate's two carboxyls leaves entirely on the next turn; a carbon that ends a turn as one of its two middle carbons is split half and half between the two classes on the next, because succinate is symmetrical and the enzyme after it cannot tell its ends apart. So `acetyl-1` leaves none on the first turn and all of it on the second; `acetyl-2` leaves none on the first two, half on the third, and half of what is left on each turn after that; `oxaloacetate-1` and `oxaloacetate-4` leave on the first turn, because they are the carbon dioxide of that turn; `oxaloacetate-3` leaves on the second, as `acetyl-1` does; and `oxaloacetate-2` follows `acetyl-2`. For an acetyl carbon the answer is never the first turn, which is the fact §7.3's margin note is about, and one a reader will not believe from a sentence. The obvious implementation, which releases whichever carbons the decarboxylation steps happen to point at, gets every one of these wrong.

**What the reader does.**
- **Run**, **step**, **reset**, and a **turn counter** that keeps going past the second turn, because the methyl carbon does not begin to leave until the third and is never entirely gone.
- **Label a carbon**: six choices, and a readout naming where the label sits, the share of it that left on each turn so far, and the share still in the cycle.
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
| `carbonsIn`, `carbonsOut` | number | cumulative counts; equal at the end of every turn, which is a count and not a claim about which atoms left |
| `nadhPerTurn`, `fadh2PerTurn`, `atpPerTurn` | number | 3, 1 and 1 in every state; a run reporting otherwise is a defect |
| `nadhTotal`, `fadh2Total`, `atpTotal` | number | cumulative |
| `labelledCarbon` | string \| null | `'acetyl-1' \| 'acetyl-2' \| 'oxaloacetate-1'…`; null when none |
| `labelPosition` | string \| null | where the label currently sits |
| `labelFirstLeftOnTurn` | number \| null | the first turn on which any of the label left: 2 for `acetyl-1`, 3 for `acetyl-2`, never 1 for either; null until some has |
| `labelReleasedByTurn` | number[] | the share of the original label released on each completed turn, as fractions of 1: `[0, 1]` for `acetyl-1`, `[0, 0, 0.5, 0.25, …]` for `acetyl-2` |
| `labelRemaining` | number | the share of the label still in the cycle, 1 down to 0; never reaches 0 for `acetyl-2` |
| `oxaloacetateLevel` | number | arbitrary units on one scale, stated in the module header |
| `drainedTo` | string \| null | the biosynthetic route taking an intermediate |
| `stalled` | boolean | the cycle has stopped for want of oxaloacetate; computed |
| `toppedUp` | boolean | |
| `fuel` | string | `'glucose' \| 'fatty-acid' \| 'amino-acid'` |
| `entryPoint` | string | the intermediate the chosen fuel joins at |
| `atpPerGram` | number | for the chosen fuel, so §7.3's cross-check is on the stage |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** Label an acetyl carbon and none of it comes out on the first turn, however many times the reader runs it, while the counters say two carbons left. A ring-with-arrows diagram not only fails to show that but suggests the opposite, and through most of the 1940s labelling results like it were read as proof that citrate could not be on the pathway at all (§7.3's margin note, on Ogston).

**Narrow composition.** Second composition. A ring with eight labelled nodes at 390 px puts every label either inside the ring, where they collide, or outside it, where they leave the stage. Below 800 px the ring keeps its shape and its carbon counts but **the intermediate names move into a numbered list beneath**, with the position the cycle is at marked in both; the two decarboxylations and the four oxidations stay marked on the ring, because they are the argument. The fuel entry points become one line of type naming the entry rather than three drawn routes. The tallies re-stack to five rows.

---

## 7.3 · `respiratory-chain` — The fall, in four steps

**What it shows.** The inner membrane drawn edge-on down the middle of the stage, the matrix on its left and the intermembrane space on its right, with reduction potential as height, read off an axis at the left that runs from −0.4 V at the top to +0.9 V at the bottom: the four complexes in the membrane, ubiquinone diffusing within the bilayer and cytochrome c skating along the outer face. **Every carrier is placed at the height its own potential puts it at** — so the drawing is also the graph, and a pair of electrons is seen falling from rung to rung rather than travelling sideways. The charges a complex moves cross the membrane from left to right where it moves them, and are counted. It opens with the chain idle, oxygen present, nothing blocked.

**What the reader does.**
- **Deliver a pair from NADH** (at complex I) or **from the cycle's FADH₂** (at complex II), and run. That FADH₂ is the Krebs cycle's, whose enzyme *is* complex II. §7.4 says the other FAD enzymes, β-oxidation's and the glycerol 3-phosphate shuttle's, hand their electrons to ubiquinone through doors of their own, so the donor's label names the cycle and never says "any FADH₂". The two donors are the figure's central comparison: the second enters four rungs lower and moves four fewer charges, 6 against 10, and both counts are on screen at once.
- **Block a complex**: rotenone at I, malonate at II, antimycin A at III, cyanide at IV, each named with its target. The carriers above the block fill and the ones below empty, drawn and reported, with the crossover named. **Malonate is the exception and the figure must model it correctly**: electrons from NADH enter at complex I and never pass through complex II, so with `donor: 'nadh'` a block at II changes nothing — `chargesMoved` keeps rising and `crossoverAt` stays null. It backs the chain up only with `donor: 'fadh2'`. A figure that flattens the trace for malonate on an NADH donor contradicts §7.8's own paragraph about it, which is there because that is the mistake. The rule holds because the figure feeds NADH straight in. A real mitochondrion on pyruvate stops too, more slowly, because the cycle halts at succinate, so no label may say the chain keeps running on "any NADH-linked fuel" (review of 2026-09-24, finding 20).
- **Remove the oxygen**, which backs the whole chain up from the bottom in the same way and is the state §7.7 opens in.
- **Change the acceptor** (added for review finding 17, so that `anaerobic-respiration` has something to grade): oxygen, nitrate, fumarate, sulfate or carbon dioxide, at the potentials of §7.7's table. The acceptor's rung moves to its own potential on the axis, and `potentialDropV`, `energyReleasedKj` and `chargesPerPair` are recomputed from it; changing the acceptor starts a fresh experiment, so the flow and the counters clear. This is the mitochondrial chain with its bottom rung moved, which is the simplification §7.7 makes in words (the machinery is the same kind, though the complexes differ from one organism to the next); it is not any one organism's chain, and the module header says so. **The rule is a chain-wide ceiling** (review of 2026-09-24, finding 9): the gradient is charged for charges moved, at 19.3 kilojoules each against 200 millivolts, so a fall pays for at most its kilojoules ÷ 19.3 of them, taken before `energyReleasedKj` is rounded and then rounded down, and never more than the chain moves with oxygen for that donor. The first version of this brief had a bypass rule instead — a complex whose output sits below the acceptor's rung is bypassed and the others pump as usual — and it gave nitrate 8 and fumarate 4, which cost 154 and 77 kilojoules against falls of 143 and 68, impossible at the chapter's own price. From NADH the ceiling gives:

  | acceptor | E°′ (V) | `energyReleasedKj` | `chargesPerPair`, a ceiling | why |
  |---|---|---|---|---|
  | oxygen | +0.82 | 220 | 10 | the chain's own count; 220 ÷ 19.3 would allow 11. The one row that is also a real chain's number |
  | nitrate | +0.42 | 143 | 7 | at most 7 (143 ÷ 19.3 = 7.4); *E. coli*'s own nitrate chain moves about 6 |
  | fumarate | +0.03 | 68 | 3 | at most 3 (68 ÷ 19.3 = 3.5). Ubiquinone (+0.045) sits just below fumarate, and the organisms that do this use menaquinone (about −0.07) instead; the figure swaps the quinone's rung when fumarate is chosen and says so |
  | sulfate | −0.22 | 19 | 1 | at most 1: 2 × 96.5 × 0.10 = 19.3, one charge's price exactly, before the 19 is rounded; the measured −0.217 V gives 19.9 |
  | carbon dioxide | −0.24 | 15 | 0 | 15 ÷ 19.3 is less than one |

  From FADH₂ (+0.03 V): oxygen 6 (the chain's own count), nitrate 3 (75 ÷ 19.3), fumarate 0 (no fall), sulfate and carbon dioxide 0 (uphill; the stage shows "uphill", figure review finding 4).

  **The stage names this number as a ceiling**, "at most N", and never as the count of any organism, because none of the organisms that use the other four acceptors runs the mitochondrial chain. Carbon dioxide's zero and sulfate's one are the hard cases. A readout that says only "0 charges" or "1 charge" tells a reader that methanogens and sulfate reducers get next to nothing, and §7.7 gives them 15 and 19 kilojoules a pair, priced from NADH. So for those two the readout says that the fall from NADH pays for less than one charge (carbon dioxide) or exactly one (sulfate) at 200 millivolts (19.3 kilojoules), with nothing left over to drive it, and that these organisms take their electrons from fuels other than NADH, mostly hydrogen, and move only a few ions per reaction (finding 8, whose words these are). The first version said "much smaller gradients made by other machinery", which was wrong: the gradient need not be smaller, and what is small is the number of ions moved per reaction. §7.7 now carries the hydrogen half of that sentence, and the figure review checked the readout against it. `atpMadeHere` stays 0 under every acceptor, and the gradient stays at 0 for NADH's pairs to sulfate and carbon dioxide.
- **Readouts**, as two typographic tables. The first gives, for each donor side by side, the fall in volts, the free energy released in kJ per mole, the charges moved (with oxygen) or "Charges, at most" (with any other acceptor), and the pairs delivered; an uphill step reads "uphill" and "—", never a negative energy released (figure review finding 4). The second gives what the membrane holds: the charges moved in all, the gradient as a pH difference and as a membrane potential, and an **ATP counter that stays at zero in every reachable state**. The gradient eases to its value over 1.6 s, rising as the first charge crosses, and what the stage shows and what `describe()` reports agree at every moment. Where the readout is short of room it gives up a row the stage already shows, never the ATP row or the sentence under the tables. Nothing on the stage prices a complex's protons one by one against its own fall: complex III releases four protons outside but moves only two charges, and four at 19.3 kJ would cost 77 against its 41. A per-complex display shows charges moved (4, 0, 2 and 4 for I to IV) or prices nothing per complex (finding 9).

**Objectives it teaches.** `chain-components`, `redox-ladder`, `chain-pumps-protons`, `oxygen-is-the-acceptor`, `fadh2-enters-lower`, `blocking-the-chain`, `proton-motive-force` (through `gradientPH` and `gradientMv`), `diagnose-respiration` (the sort's blocked-chain and nowhere-to-unload bins), and `anaerobic-respiration` jointly with 7.4 (through the acceptor control). No field below grades `chain-components`, a recall objective about which carriers are fixed and which move; it is tested by questions only (review finding 30).

**`describe()`**

| field | type | meaning |
|---|---|---|
| `donor` | string | `'nadh' \| 'fadh2'` |
| `pairsDelivered` | number | since the last reset or change of acceptor, both donors; `pairsByDonor` splits it, and a refused pair is not counted |
| `chargesMoved` | number \| null | with oxygen, charges moved across the membrane, counted as the stage draws them crossing: 4 as a pair leaves complex I, 2 as it leaves III, 4 as it leaves IV. `null` under the other four acceptors, where the stage shows a ceiling and counts nothing |
| `chargesOnTheirWay` | number \| null | with oxygen, charges the model has moved that the stage has not yet drawn crossing: 0 once the drawing has caught up, and always 0 under a pinned clock. `null` under the other acceptors |
| `chargesPerPair` | number | 10 from NADH and 6 from FADH₂ with oxygen; otherwise the ceiling in the table under the acceptor control: 7, 3, 1 and 0 from NADH; 3, 0, 0 and 0 from FADH₂ |
| `chargesAreCeiling` | boolean | false with oxygen, true for the other four acceptors, which the stage names as a ceiling |
| `potentialDropV` | number | the acceptor's potential minus the donor's: 1.14 for the NADH route and 0.79 for the other, with oxygen; negative where the acceptor sits above FADH₂, which the stage calls uphill |
| `energyReleasedKj` | number | 2 × 96.5 × `potentialDropV`, rounded, per mole of pairs: 220 and 152 with oxygen (the prose's about 150), and from NADH 143, 68, 19 and 15 for the other four, which is §7.7's table |
| `atpMadeHere` | number | **0 in every reachable state.** A run reporting anything else is a defect, not a setting |
| `gradientPH` | number | matrix minus intermembrane space, as the readout shows it at that moment |
| `gradientMv` | number | the voltage term, the same way |
| `gradientHeadingPH`, `gradientHeadingMv` | number | where the gradient is heading: 0.75 and 150 once a pair has gone through by a route that moves a charge, while the donor's route stays open; 0 and 0 otherwise, and always for NADH's pairs to sulfate and carbon dioxide |
| `oxygenPresent` | boolean | true only with oxygen as the acceptor and the Oxygen control on |
| `acceptor` | string | `'oxygen' \| 'nitrate' \| 'fumarate' \| 'sulfate' \| 'carbon-dioxide'`; `'oxygen'` in the opening state |
| `acceptorPotentialV` | number | +0.82, +0.42, +0.03, −0.22, −0.24, as §7.7's table has them |
| `quinone` | string | `'ubiquinone'`, or `'menaquinone'` under fumarate |
| `blockedAt` | string \| null | `'I' \| 'II' \| 'III' \| 'IV' \| null` |
| `blockedBy` | string \| null | the substance's name, as the prose spells it |
| `reducedCarriers` | string[] | computed from the block, never listed by the button |
| `oxidisedCarriers` | string[] | the complement |
| `crossoverAt` | string \| null | where reduced turns to oxidised: the blocked complex, or `'II'` when malonate has refused the cycle's FADH₂; null while the chain runs |
| `refused` | string \| null | why the last Deliver did nothing: `'blocked-entry' \| 'backed-up' \| 'no-fall' \| 'uphill'`, or null |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** `atpMadeHere` never moves, and the reader is given every control that might be expected to move it. That is the section's whole claim made falsifiable on the stage. Second to it: the crossover experiment is run rather than described, so the reader works out the order of a chain from the outside, which is what the people who first did it had to do.

**Narrow composition.** The rotation this brief first asked for below 800 px is the drawing at every width, because a membrane stretched across the stage cannot put every carrier at its own potential: the membrane runs down the stage, the potential axis is the vertical spine, the four complexes stand in the membrane at their own potentials, and the charges cross left to right. The stage is 16 / 10 wide, with the readout in a column at the right, and 2 / 3 on a phone, with the readout beneath: its two tables side by side where their rows fit, and the sentence across both. The toolbar's short labels come in below a 600 px stage. The mobile carriers stay drawn, because the fixed-versus-mobile distinction is an objective. The `atpMadeHere` row is never dropped at any width.

---

## 7.4 · `fermentation` — What actually runs out

**What it shows.** A cell with its NAD pool drawn between glycolysis and the chain as a small closed loop, and — this is the composition decision — **the pool is drawn as a count of discs, empty and loaded, and not as a bar**, because the argument of §7.7 is that the pool is small and countable and a bar says nothing about how small. Glycolysis is on the left, the chain on the right, the pool between them. The mitochondrion's ATP, +28 a glucose (+14 to 18 under the yeast preset), is drawn with its name, never under "Chain", because the chain makes no ATP (figure review finding 10). The counts and rates are in discs' worth a second of figure time, illustrative rather than to scale, and the readout says what a disc and a count stand for (figure review finding 12). It opens aerobic and running steadily, with the pool mostly empty, because the reader's first act should be to take the oxygen away.

**What the reader does.**
- **Oxygen**, on or off. Off, the chain stops, the pool fills within a few seconds of figure time, and glycolysis stalls — with a readout naming what has run out, which is the sentence the section exists for. The stall happens with the route at none, and the stage calls it a cell that cannot ferment, as §7.7 now does. It is not a muscle: a muscle cut off from oxygen makes lactate from the first moment, and what stalls in it is the matrix's side, the Krebs cycle (review of 2026-09-24, finding 10).
- **Fermentation route**: none, lactate (one enzyme), or ethanol (two, with carbon dioxide released). Switching one on restarts glycolysis, and **the ATP-per-glucose readout does not move**, which is the figure's central claim. That the step makes no ATP is true of these two routes; no words on the stage may make it true of every fermentation, because some bacterial ones make another ATP or so after glycolysis (finding 6). With no preset and the route at ethanol, the yield note names the 30 as a mitochondrion's like a fast muscle fibre's and gives yeast's 16 to 20 beside it, so that one press from the opening does not pair an ethanol route with a muscle's yield (figure review finding 14).
- **Demand**, a slider setting how fast the cell is spending ATP, so a reader can find the rate at which fermentation cannot keep up.
- **Muscle** and **yeast** presets, which set the route, the demand and what happens to the product. The muscle preset starts with the route at lactate, never at none (finding 10). The yeast preset must not say its ethanol can never be used again: a yeast respires its own ethanol once the sugar is gone, if there is oxygen then (finding 7).
- **Restore the oxygen** after a lactate run, or lower the demand until the chain keeps up, and the clearance is timed: some oxidised where it stands, some burnt by the heart, slow fibres and brain, and some sent to the liver, with a ledger showing the liver spending six ATP to rebuild the glucose the muscle got two from. Those are the three fates §7.7 names; the split between them is illustrative, and the stage says so (figure review finding 13). If the timer names a real time, it is within an hour or so, sooner with gentle exercise (finding 30).

**Objectives it teaches.** `carrier-pool-limit`, `fermentation-purpose`, `two-fermentations`, `lactate-facts`, and `anaerobic-respiration` jointly with 7.3.

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
| `glycolysisRate` | number | glucose a second of figure time, in discs' worth rather than to scale (figure review finding 12) |
| `secondsStalled` | number | figure time since glycolysis stopped |
| `atpPerGlucose` | number | 2 without oxygen, about 30 with: the fast-skeletal-muscle end of §7.6's range of 30 to 32, and the readout names the tissue (finding 42). Under the yeast preset the 30 is not shown: baker's yeast has no complex I and a ring of ten, and gets nearer 16 to 20 (finding 33) |
| `atpFromFermentationStep` | number | **0 in every reachable state.** A run reporting otherwise is a defect |
| `lactateMM`, `ethanolPercent` | number | |
| `co2Released` | number | ethanol route only. Per glucose, 2 carbons leave as carbon dioxide and 4 stay in two ethanols (§7.7); the first draft's "two and two" is the error to avoid |
| `demand` | number | |
| `clearedSeconds` | number \| null | how long the lactate took to clear after oxygen returned |
| `lactateOxidised`, `lactateOxidisedElsewhere`, `lactateToLiver` | number | the three fates the ledger counts, mmol/L, in an illustrative 50 : 30 : 20 split |
| `liverAtpSpent` | number | 6 per glucose rebuilt |
| `nadEmpty`, `atpMadePerSecond`, `keepingUp`, `yieldTissue`, `fermenting`, `chainRunning`, `ethanolMM`, `carbonsInEthanol`, `clearing`, `clearingSeconds`, `situation`, `readoutClipped` | | also reported; the module header says what each is |
| `t` | number | clock, seconds, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader takes the oxygen away expecting the ATP to fail and watches the carriers fail first — and then switches on a fermentation and watches glycolysis restart with the ATP figure unchanged. Both halves are counters the reader put into that state, and both contradict the sentence most readers arrive with.

**Narrow composition.** Shrinks honestly. Below a 720 px stage the same drawing turns a quarter into one column at 2 / 3: glycolysis a row along the top, the pool's ring in the middle, the chain a capsule along the bottom, the fermentation route down the right, and the readout under it all, which loses nothing. The Cori-cycle ledger, which is a two-column comparison at desktop, becomes four rows of type. The pool's discs stay discs at every width — that is the composition and it is the reason the aspect is what it is. Twelve discs with a letter on each need a radius of about 9 px, and a 342 px stage at 4 / 5 left the drawing about 180 px after the toolbar and the readout, less than the ring and the four stations need; 3 / 4 is still short, and 2 / 3 is the squarest stage that holds them.

---

## Notes for whoever registers these

- **`narrowAspect` for all four**, values in the table at the head of this brief. **Three carry a genuine second composition** — `glycolysis`, `krebs` and `respiratory-chain` — each for the reason stated in its own block. `fermentation` shrinks honestly and says what it re-stacks.
- **No WebGL figure**, so this chapter adds nothing to `npm run sweep3d`.
- **Every kind needs a recipe in `tools/drive.js` or `npm run drive` fails**, so the recipes can be written from this brief before the modules exist. The fields worth asserting after driving are the **computed** ones and never the ones a button sets: `atpNet` and `committedStepOpen` and `closedBy` (7.1); `labelFirstLeftOnTurn` and `labelRemaining` and `stalled` and `carbonsOut` (7.2); `atpMadeHere` and `crossoverAt` and `chargesPerPair` and `energyReleasedKj` under a changed acceptor (7.3); `ranOutOf` and `poolFull` and `atpFromFermentationStep` (7.4).
- **`tools/pages-exclude.txt` needs no new line, and adding one would be a mistake.** The list holds `**/*.md`, which is a class and not an instance, and `tools/pages-exclude.js` compiles `**/` so that it may match zero segments, so `biology/ch07-cellular-respiration/FIGURES.md` is already excluded from the published tree without anybody naming it. Confirm rather than assume: `node tools/pages-exclude.js` prints this file among the paths it trims.
- **Four invariants a reviewer must check by hand, because no gate can.** Each is the figure's whole claim reduced to one field, and each would look perfectly healthy if it were quietly wrong. `atpMadeHere` is 0 in every reachable state of 7.3, with the oxygen removed, with every complex blocked in turn, and under every acceptor. `atpFromFermentationStep` is 0 in every reachable state of 7.4, on both routes and at every demand. `nadhPerTurn` is 3 and `fadh2PerTurn` is 1 in every reachable state of 7.2, including while the cycle is stalled. And in 7.2, `labelReleasedByTurn` for `acetyl-1` is `[0, 1]` and for `acetyl-2` is `[0, 0, 0.5, 0.25, …]` — the hardest of the four to get right and the one most likely to be quietly wrong, because the obvious implementation releases whichever carbons the decarboxylation steps happen to point at.
- **Two numbers a figure may not invent**, because the prose derives them and a figure disagreeing with the prose is the defect the brief's section on prose is about: 10 charges moved per NADH and 6 per FADH₂ with oxygen (7.3); and about 30 to 32 ATP per glucose with oxygen, of which 2 without (7.4), never 36 or 38.
- **Nothing here is shared with chapter 6, and nothing is kept for chapter 8.** Chapter 6 declined to mount `atp-synthase` and then cut its own `proton-ledger`, so it draws no synthase at all, and neither chapter now does. Chapter 6's `FIGURES.md` still says "Chapter 7 owns the rotary motor. Its `atp-synthase` figure takes a `cSubunits` control"; that sentence is now stale and is chapter 6's to correct. The first plan said chapter 8 would want `yield-ledger`'s fuel switch and `krebs`'s drains back; chapter 8 is now DNA, `yield-ledger` is cut and will not come back, and `krebs`'s drains are built with presets so that a later chapter about biosynthesis can mount it rather than copy it, which its module header says.
- **What each figure builder must read before starting**, because the prose moved under these briefs after they were first written: the chapter's §7.2 to §7.8 as they now stand in `index.html`, not as the first draft had them; the paragraphs "A figure's words are prose", the six corrections under it and the 2026-09-24 index after them; and the review of 2026-09-22 (`docs/work/2_rest-of-the-book/reviews/2026-09-22-ch06-ch07-prose.md`), findings 6, 17, 26 and 30. For `glycolysis`, the four sources behind finding 6: Kengen et al., *J. Biol. Chem.* 269:17537 (1994), on *Pyrococcus*'s ADP-dependent kinases; Selig et al., *Arch. Microbiol.* 167:217 (1997), comparing the archaeal Embden–Meyerhof and Entner–Doudoroff routes; Kouril et al., *PLoS ONE* (2017), on *Sulfolobus*'s branched Entner–Doudoroff pathway; and Siebers & Schönheit, *Curr. Opin. Microbiol.* (2005). For `krebs`, the label rule in its own block, which was derived for this brief from the cycle's chemistry and should be checked against any biochemistry text's treatment of the randomisation at succinate before the module is written. For `respiratory-chain`, the acceptor table in its own block, whose ceilings are the one claim here the prose does not make.
