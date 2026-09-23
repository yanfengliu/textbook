# Chapter 2 — figure brief

Eight figures, in the order they appear in `index.html`. The figure number is fixed by that order, and the prose cites every one of them by number, so the order must not change without editing the prose.

| # | Kind | Id | Section | WebGL | `aspect` | `narrowAspect` |
|---|---|---|---|---|---|---|
| 2.1 | `soup` | `fig-soup` | opener, cited in 2.1 | no | 21 / 9 | 4 / 3 |
| 2.2 | `bondlab` | `fig-bondlab` | 2.2 bonds | no | 16 / 9 | 3 / 4 |
| 2.3 | `water3d` | `fig-water3d` | 2.3 water | **yes** | 16 / 10 | 1 |
| 2.4 | `waterprops` | `fig-waterprops` | 2.3 water | no | 16 / 9 | 4 / 5 |
| 2.5 | `phlab` | `fig-phlab` | 2.4 pH | no | 16 / 9 | 3 / 4 |
| 2.6 | `carbonkit` | `fig-carbonkit` | 2.5 carbon | no | 16 / 10 | 4 / 5 |
| 2.7 | `polymer` | `fig-polymer` | 2.6 macromolecules | no | 16 / 7 | 4 / 3 |
| 2.8 | `foldlab` | `fig-foldlab` | 2.7 proteins | no | 16 / 10 | 4 / 5 |

None of these ids collides with chapter 1 (pond, homeostasis, levels, scale, cell3d, dna3d, energy, tree, pasteur) or with the ids chapter 3 is currently using (microscopes, surface-volume, prokaryote, secretion, symbiont, cytoskeleton, cilium, plantcell3d).

## Conventions that hold across all eight

The chapter draws atoms in five figures, so they should agree, the way chapter 1's organelle colours do. All from `ctx.palette`; no new hex anywhere.

| Thing | Colour |
|---|---|
| Carbon | `inkSoft` |
| Hydrogen | `paper3` fill with a `ruleStrong` outline |
| Oxygen | `coral`, the disc drawn at its text value |
| Nitrogen | `water`, the disc drawn at its text value |
| Phosphorus | `violet` (the book's information colour, and phosphate is DNA's backbone) |
| Sulfur | `gold`, the disc drawn at its text value |
| Na, K, Ca, Cl, Mg and other ions | `leaf`, the disc drawn at its text value, always with the symbol written on them |
| Covalent bond | solid `ink` |
| Hydrogen bond | dashed `inkFaint` |
| Ionic attraction | dotted `gold` |

"The disc drawn at its text value" means the element keeps its hue and its token — an oxygen is the coral one — but the disc is filled with `--coral-text` rather than `--coral`, because the symbol written on it is `paper` and a `paper` symbol on the bare accent is 3.32:1 in the light theme, under WCAG AA's 4.5:1. It is 2.26:1 on `gold` and 4.33:1 on `water`, and no palette token clears the bare accent in both themes, because the disc and the symbol both move with the theme and in the same direction. The `-text` values move with the paper instead, so one label reads on both: 5.34, 5.25, 5.23 and 5.66 in the light theme and 8.84, 11.54, 8.30 and 7.80 in the dark. The recipe is `deepen` in `src/figures/lib/chem-atoms.js`, the four percentages are `--*-text` in `src/styles/tokens.css` and `TEXT_MIX` in `src/palette.js`, and `test/element-table.test.js` measures every element's symbol on its own disc in both themes.

Charge is never colour alone: a partial charge is a δ+ / δ− glyph, a full charge a + / −. Sizes in the molecular figures are to scale within a figure, and the scale is stated on the stage (a bar in nanometres or picometres).

Every figure is a pure function of its clock and the reader's actions: a seeded generator, never `Math.random`, and `setTime(t)` reproduces a frame exactly. Every control is reachable by keyboard, and under `prefers-reduced-motion` nothing moves until the reader moves it. `describe()` returns the fields listed below and always includes `layout: 'wide' | 'narrow'`.

---

## 2.1 · `soup` — What a drop is made of

**What it shows.** A window about 12 nm across into the liquid of Chapter 1's pond drop, with every molecule at the same scale: several hundred bent water molecules in seeded thermal motion, a few Na⁺ and Cl⁻ ions each carrying a hydration shell, one ring of glucose, and one small protein tumbling. Short dashed links flicker between water molecules wherever a hydrogen bond exists, appearing and vanishing as the molecules move. The point is proportion and impermanence: water overwhelms everything else, and nothing weak stays bonded.

**What the reader does.** A temperature slider from −20 °C to 120 °C sets the speed of the motion and the mean lifetime of a hydrogen bond; below 0 °C the molecules settle into the open hexagonal ice lattice and the links stop flickering, above 100 °C they fly apart and the links go. A pause/play button and the spacebar stop the clock. A hydrogen-bond toggle hides the links so the reader can see how crowded the water alone is. Clicking any molecule pins a card with its name, formula and width in nanometres. A by-count / by-mass switch changes the composition readout from "about 99 molecules in every 100 are water" to "about 70 per cent of the mass". Those two numbers are the cell's, not this thin slice's: the window holds a few hundred water molecules because it is one slice of a cell that holds on the order of ten thousand for every protein, and the readout should say so rather than counting what happens to be on screen.

**Objectives it teaches.** `molecular-scale`, `water-solvent`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `t` | number | clock, seconds |
| `playing` | boolean | |
| `tempC` | number | slider position |
| `phase` | `'ice' \| 'liquid' \| 'steam'` | |
| `showBonds` | boolean | hydrogen-bond links drawn |
| `bonds` | number | hydrogen bonds present this frame |
| `bondsPerWater` | number | mean per water molecule, 2 dp (≈ 4 in ice, ≈ 3.5 in liquid at 25 °C) |
| `meanBondLifePs` | number | mean lifetime at this temperature, picoseconds |
| `counts` | `{ water, sodium, chloride, glucose, protein }` integers | molecules drawn in the window |
| `waterFractionByCount` | number | 0–1, the cell's value the readout shows (≈ 0.99), not the window's |
| `waterFractionByMass` | number | 0–1, likewise (≈ 0.70) |
| `countMode` | `'count' \| 'mass'` | which readout is shown |
| `selected` | string \| null | id of the pinned molecule |
| `windowNm` | number | width of the view in nanometres |

**Why it is a mechanism.** The reader sets a temperature and watches the hydrogen-bond lifetime and count change with it; freezing and boiling are the same slider, not three pictures.

---

## 2.2 · `bondlab` — Two atoms and a meter

**What it shows.** A bench holding two atoms. Beside each is its outer shell drawn as dots, with how many electrons it has and how many it is short. The bench works out what the pair does when it is brought together — share (covalent, single, double or triple), transfer (ionic), or nothing when both shells are full — and a force meter measures what it takes to separate them.

**What the reader does.** Two element pickers (H, C, N, O, Na, Cl, and a pre-made water-to-water pair for the hydrogen bond). Dragging either atom away from the other, with the mouse or with the arrow keys once the bench is focused, stretches the bond: the meter rises, an energy bar fills against a fixed reference line at 2.6 kJ/mol (thermal energy at 37 °C), and the bond snaps when the reader has supplied enough. A **water** switch floods the bench: the same ionic pair now separates for a few kJ/mol while the covalent pair is untouched, and the freed ions take on hydration shells. A reset returns the pair.

**Objectives it teaches.** `valence-bonds`, `ion-formation`, `bond-types`, `bond-strengths`, `polar-bonds`, `weak-bonds-matter`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `left`, `right` | string | element symbols, or `'H2O'` for the water pair |
| `leftValence`, `rightValence` | number | outer-shell electrons |
| `leftNeeds`, `rightNeeds` | number | electrons short of a full shell |
| `bond` | `'covalent' \| 'covalent-polar' \| 'ionic' \| 'hydrogen' \| 'none'` | |
| `bondOrder` | number | 1, 2, 3, or 0 |
| `deltaEN` | number | electronegativity difference, 2 dp |
| `partialCharges` | `{ left: number \| null, right: number \| null }` | in units of e; null when nonpolar |
| `medium` | `'air' \| 'water'` | |
| `separationPm` | number | current separation, picometres |
| `energyKjMol` | number | energy to separate from here, in this medium, 1 dp |
| `thermalKjMol` | number | 2.6, the reference line |
| `broken` | boolean | the reader has pulled it apart |
| `hydrationShell` | number | water molecules bound to each freed ion, 0 in air |

**Why it is a mechanism.** The water switch changes nothing about the two atoms and changes the answer completely, which is the one thing a bond-strength table cannot say.

---

## 2.3 · `water3d` — One molecule and the four it can hold

**What it shows.** A single water molecule in three dimensions at its real geometry: 104.5° between the bonds, 0.096 nm from oxygen to hydrogen, the oxygen shaded to its δ− and each hydrogen to δ+, with the two lone pairs indicated. Around it, four neighbours held at the corners of a tetrahedron by dashed hydrogen bonds. The whole thing can be turned over.

**What the reader does.** Drag or arrow-key to orbit, `+`/`−` to zoom (the frame's usual 3D controls). Dragging a **neighbour** stretches its hydrogen bond until it snaps, and the bond count drops; release it and it is recaptured. A temperature control runs from −20 °C to 120 °C: at the cold end the five molecules lock into the ice lattice, each holding exactly four neighbours at a *greater* spacing than the liquid's, and the figure reports the density relative to liquid water; in the middle the bonds make and break and the mean settles near three and a half; at the hot end the neighbours leave altogether. A label toggle names the parts.

**Objectives it teaches.** `water-shape`, `water-hbonds`, `ice-floats`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `view` | `{ theta, phi, distance }` numbers | required by the contract; `distance` non-zero |
| `angleDeg` | number | 104.5 |
| `bondLengthNm` | number | 0.096 |
| `tempC` | number | |
| `phase` | `'ice' \| 'liquid' \| 'steam'` | |
| `neighbours` | number | neighbour molecules present |
| `bondsHeld` | number | hydrogen bonds intact on the central molecule right now |
| `meanBonds` | number | mean over the last second of simulated time, 2 dp |
| `latticeLocked` | boolean | true in the ice state |
| `spacingNm` | number | mean centre-to-centre distance to neighbours |
| `densityRel` | number | density relative to liquid water at 25 °C (ice ≈ 0.92) |
| `dragging` | boolean | a neighbour is being pulled |
| `labels` | boolean | |
| `t` | number | |
| `drawCalls` | number | for the perf diagnostic |

**Why it is a mechanism.** Cooling it visibly pushes the molecules *apart*, so the reader sees why ice floats instead of being told.

---

## 2.4 · `waterprops` — Four properties, one cause

**What it shows.** A bench of four small demonstrations, one at a time, that share a single control: the strength of the hydrogen bond, from zero to the real value. **Tension** — a needle resting on a surface whose molecules pull sideways and inward, with the surface tension in mN/m. **Heat** — two vessels under identical heaters, water and a comparison (iron, ethanol), with a live temperature trace and the joules added. **Evaporation** — a dish whose fastest molecules escape, with the mean speed of those left behind and the dish's temperature falling. **Ice** — a tank cooling from 20 °C, molecules crowding closer until 4 °C and then locking into the open lattice, with a density-against-temperature curve tracing the turn and a block that floats or sinks.

**What the reader does.** Four buttons choose the panel. One slider, always visible, sets hydrogen-bond strength and applies to every panel: turn it down and the needle sinks, the water trace climbs as steeply as the iron one, the evaporating dish stops cooling, and the solid goes to the bottom. Each panel has a run/reset of its own.

**Objectives it teaches.** `cohesion-tension`, `specific-heat`, `evaporative-cooling`, `ice-floats`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `panel` | `'tension' \| 'heat' \| 'evaporation' \| 'ice'` | |
| `hbondStrength` | number | 0–1; 1 is real water |
| `t` | number | |
| `playing` | boolean | |
| `tension` | `{ surfaceTensionMNm: number, needleFloats: boolean }` | ≈ 72 at strength 1 |
| `heat` | `{ joulesAdded: number, waterC: number, comparisonC: number, comparison: 'iron' \| 'ethanol' }` | |
| `evaporation` | `{ escaped: number, meanSpeedRel: number, dishC: number }` | `meanSpeedRel` relative to the start |
| `ice` | `{ tempC: number, densityGcm3: number, latticeFormed: boolean, solidFloats: boolean, densestAtC: number }` | `densestAtC` ≈ 4 at strength 1 |

**Why it is a mechanism.** One slider governs four apparently unrelated demonstrations, which is the claim the section makes and cannot otherwise show.

---

## 2.5 · `phlab` — Add acid to water, and to blood

**What it shows.** Three beakers side by side: pure water, a bicarbonate buffer, and blood plasma. Each has a pH readout, and a shared chart plots pH against the acid or base added, so the curves diverge and then, when the buffer is spent, converge again. A magnified inset of the chosen beaker shows the ions: bicarbonate taking up an added hydrogen ion and becoming carbonic acid, carbon dioxide leaving.

**What the reader does.** Add acid or base a drop at a time with buttons, or hold the arrow keys to pour. Choose which beaker the inset follows. A reset empties the chart. Keep pouring and the buffer runs out: the flat part of the curve ends, the plasma leaves the 7.35–7.45 band, and the figure says so. A band marking 7.35–7.45 is drawn on the chart throughout.

**Objectives it teaches.** `ph-scale`, `buffers`, `blood-ph`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `beaker` | `'water' \| 'buffer' \| 'plasma'` | the one the inset follows |
| `ph` | `{ water: number, buffer: number, plasma: number }` | 2 dp |
| `reagent` | `'acid' \| 'base'` | |
| `dropsAdded` | number | |
| `mmolAdded` | number | mmol of H⁺ (positive) or OH⁻ (negative) per litre |
| `speciesMmol` | `{ co2: number, h2co3: number, hco3: number }` | the buffer's populations |
| `bufferRemaining` | number | 0–1, capacity left |
| `exhausted` | boolean | the buffered curve now falls as steeply as water's |
| `inRange` | boolean | plasma still inside 7.35–7.45 |
| `curve` | array of `{ mmol, water, buffer, plasma }` | the points plotted so far |

**Why it is a mechanism.** The reader supplies the acid, so the flat stretch and its end are something they caused rather than a shape on a printed graph.

---

## 2.6 · `carbonkit` — Build a skeleton, hang groups on it

**What it shows.** A molecule-building bench. Carbons are added, branched, closed into a ring, or joined by a double or triple bond; hydrogens fill every remaining bond automatically, so no carbon is ever drawn with the wrong number and the formula is always right. A tray holds the seven functional groups of the chapter's table. A readout gives the formula, whether the molecule is polar, what charge it carries at cell pH, and how soluble that makes it.

**What the reader does.** Click a carbon to grow the chain from it; a second click on the same carbon starts a branch. Buttons close a ring, and cycle a selected bond through single, double and triple. Drag a group from the tray onto any carbon, or select a carbon and press its number. Delete removes the selected atom or group. When a build matches a molecule the book uses, the bench names it (methane, ethanol, acetic acid, glycine, glucose, a fatty acid tail, benzene) and, where one exists, names a molecule with the same formula and a different arrangement, so the reader can build an isomer pair on purpose.

**Objectives it teaches.** `carbon-versatility`, `isomers`, `functional-groups`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `formula` | string | e.g. `'C2H6O'` |
| `carbons` | number | |
| `rings` | number | |
| `branchPoints` | number | carbons with three or four carbon neighbours |
| `doubleBonds`, `tripleBonds` | number | |
| `freeBonds` | number | unfilled bonds before hydrogens are added; 0 for a finished molecule |
| `groups` | array of `'hydroxyl' \| 'carbonyl' \| 'carboxyl' \| 'amino' \| 'sulfhydryl' \| 'phosphate' \| 'methyl'` | in the order attached |
| `polar` | boolean | |
| `chargeAtCellPh` | `'negative' \| 'positive' \| 'neutral' \| 'zwitterion'` | |
| `solubility` | `'high' \| 'moderate' \| 'low'` | |
| `match` | string \| null | the named molecule this build is |
| `isomerOf` | string \| null | a different molecule with the same formula |
| `valid` | boolean | every carbon has exactly four bonds |

**Why it is a mechanism.** The valence rule is enforced rather than stated: the reader cannot draw a carbon with five bonds, and watching hydrogens appear and disappear as groups go on is where "four bonds" stops being a number to remember.

---

## 2.7 · `polymer` — One reaction, and its reverse

**What it shows.** Two monomers on a bench, with the atoms that will move picked out. Run forwards and a hydroxyl leaves one partner, a hydrogen leaves the other, the two combine into a water molecule that drifts away, and the new bond forms. Run backwards and a water molecule arrives, splits across the bond, and puts the pieces back. A counter tracks chain length and waters exchanged; an energy bar shows which direction is downhill.

**What the reader does.** Step forwards and backwards one atom at a time, or play the reaction at a chosen speed; the reader can stop it half way, with the water half-formed. A family switch changes the partners without changing the reaction: two glucoses joining by a glycosidic bond, two amino acids by a peptide bond, or glycerol taking on three fatty acids by ester bonds. An **add monomer** button extends the chain so the reader can check that *n* units cost *n* − 1 waters. In the sugar family a toggle between α- and β-glucose shows the linkage flipping every second unit over, which is the starch-and-cellulose point of §2.6.

**Objectives it teaches.** `condensation-hydrolysis`, `carbohydrate-linkage`, `lipids-not-polymers`, `peptide-bond`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `family` | `'sugar' \| 'peptide' \| 'fat'` | |
| `bondName` | `'glycosidic' \| 'peptide' \| 'ester'` | |
| `direction` | `'condensation' \| 'hydrolysis' \| 'idle'` | |
| `step` | number | position within the current reaction, 0 at the start |
| `units` | number | monomers in the chain (for a fat: fatty acids attached, 0–3) |
| `bonds` | number | bonds formed |
| `watersReleased`, `watersConsumed` | number | running totals |
| `donates` | `{ hydroxylFrom: string, hydrogenFrom: string }` | which partner gave which atom, by name |
| `energyDirection` | `'uphill' \| 'downhill'` | for the direction currently running |
| `sugarForm` | `'alpha' \| 'beta' \| null` | sugar family only |
| `chainShape` | `'coiled' \| 'straight' \| null` | what the linkage produces, sugar family only |
| `playing` | boolean | |
| `t` | number | |

**Why it is a mechanism.** Running it backwards is the whole idea: digestion and growth are one reaction with a direction, and the reader supplies the direction.

---

## 2.8 · `foldlab` — Write a sequence, fold it, break it

**What it shows.** A short protein chain on a two-dimensional lattice, surrounded by water. The reader writes the sequence; the simulation searches, by seeded Monte Carlo, for the arrangement that buries the most hydrophobic residues away from the water. The only rule it obeys is the hydrophobic effect of §2.3, and a compact shape with a greasy core comes out of it. Readouts give the buried fraction, the favourable contacts and whether repeated runs from different starts reach the same fold.

**What the reader does.** Click any residue to cycle it through hydrophobic, polar, positively charged and negatively charged; a length control adds or removes residues (16 to 36). **Fold** runs the search, visibly, and can be re-run from a new start to test whether the sequence determines the fold. A temperature control shakes the fold apart and, brought back down, lets it re-form — except that above a threshold the unfolded chains tangle and the figure reports `aggregated` rather than refolding, which is the egg-white case. A pH control flips the charges on the acidic and basic residues, so the ionic contacts holding the fold break without any heat at all. A levels overlay labels primary (the sequence strip), secondary (runs the model scores as helix-like or sheet-like), tertiary (the whole fold) and, with a second chain added, quaternary.

**Objectives it teaches.** `amino-acid-structure`, `protein-levels`, `sequence-determines-fold`, `denaturation`.

**`describe()`**

| field | type | meaning |
|---|---|---|
| `sequence` | string | one character per residue from `H`, `P`, `+`, `-` |
| `length` | number | |
| `state` | `'unfolded' \| 'folding' \| 'folded' \| 'denatured' \| 'aggregated'` | |
| `steps` | number | search steps taken |
| `energy` | number | the model's score; lower is better folded |
| `contacts` | number | favourable hydrophobic contacts |
| `buriedFraction` | number | 0–1, hydrophobic residues with no face on the water |
| `coords` | array of `[x, y]` integers | the chain on the lattice, so a task can check the shape |
| `sameFoldFromDifferentStarts` | number | of the last 5 runs, how many reached this fold |
| `tempC` | number | |
| `ph` | number | |
| `chains` | number | 1, or 2 when the quaternary demonstration is on |
| `helixResidues`, `sheetResidues` | number | residues in each scored secondary motif |
| `levelsShown` | array of `'primary' \| 'secondary' \| 'tertiary' \| 'quaternary'` | overlays on |

**Why it is a mechanism.** Nothing about the fold is drawn in advance: the reader writes a sequence and a rule produces a shape, which is the claim of §2.7 made into something they can falsify by changing one residue.

---

## Notes for whoever registers these

- `fig-soup` is the opener hero and sits inside `<header class="tb-opener">`, so it is mounted first and is the widest thing on the page. Its narrow composition should drop the protein and shrink the window rather than scaling everything down past legibility.
- `bondlab`, `phlab`, `carbonkit` and `foldlab` are the four the reader manipulates rather than scrubs; none of them has a meaningful "play" state, so `setTime` on them should pin only the ambient motion and any running search.
- `water3d` is the chapter's only WebGL figure and so the only one `npm run sweep3d` covers. Its default view should show the bend clearly, which means looking down on the plane of the molecule at a slight angle rather than edge-on.
- `polymer` at 16 / 7 is the one that will be tightest on a phone; its narrow composition should stack the two monomers vertically rather than shrinking them.
