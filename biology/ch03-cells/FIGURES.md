# Chapter 3 — figure brief

Eight figures, in document order, so figure *N* below is "Figure 3.*N*" in the prose and the *N*th `<tb-figure>` on the page. Two need WebGL. Six are things the reader manipulates; the other two are scrubbable but still take a reader-set condition that changes the outcome.

Every one follows the contract in `docs/design/textbook.md`: `meta`, `mount(root, ctx)` returning `{ destroy, setTime, describe, setVisible, setTheme }`, plus `setView` for the two 3D ones. Colours come from `ctx.palette` and `ORGANELLES`; no new hex anywhere; seeded generator, never `Math.random`.

## Palette additions this chapter needs (integration owner)

`src/palette.js`'s `ORGANELLES` covers the animal cell only. Figures 3, 5, 6, 7 and 8 need entries that do not exist yet, and they must be added once, centrally, rather than invented per figure so that the reader learns one colour per structure:

`wall` (cellulose cell wall), `middleLamella`, `vacuole`, `tonoplast`, `chloroplast`, `thylakoid`, `plasmodesma`, `nucleoid`, `plasmid`, `capsule`, `pilus`, `flagellum`, `microtubule`, `actin`, `intermediateFilament`, `motor`.

`mitochondrion`, `roughER`, `smoothER`, `golgi`, `lysosome`, `ribosome`, `vesicle`, `nucleus`, `nucleolus`, `chromatin`, `peroxisome`, `membrane`, `cytoplasm`, `centrosome` already exist and must be reused unchanged — the reader learned them from Figure 1.5.

---

## 1. `microscopes` — Four instruments, one specimen

**Kind id:** `microscopes` · **needsWebGL:** false · **aspect:** 16 / 9 · **narrowAspect:** 4 / 5

**What it shows.** One authored patch of cultured cells, drawn once at full detail and then re-rendered through whichever instrument the reader has selected: the naked eye (a pink smear), a light microscope (outlines, nuclei, mitochondria as specks, everything below the limit blurred away), a fluorescence microscope (black field, only the selected labels glowing), a transmission electron microscope (greyscale, membranes as paired lines, ribosomes, cristae), and a scanning electron microscope (the same cells in surface relief). The blur is computed from Abbe's limit for the current wavelength and numerical aperture, not drawn by hand, so the picture and the arithmetic cannot disagree. Two test mitochondria sit at a reader-set separation and merge into a single blob the moment that separation drops below the limit.

**What the reader does.**
- **Instrument** buttons: eye / light / fluorescence / TEM / SEM. Switching changes the render, the readout, and whether the specimen is alive.
- **Wavelength** slider (400–700 nm) and **numerical aperture** slider (0.1–1.4), live for the two light modes. Both move `limitNm` and therefore the blur.
- **Separation** slider for the two test mitochondria (50–800 nm). A verdict line says "resolved" or "one blur", and the reader can find the crossover by hand.
- **Channels**: in fluorescence mode, toggle each label on and off (mitochondria, microtubules, nucleus), so the reader sees that contrast, not resolution, is what changed.
- A **live/fixed** indicator that goes red for the two electron modes, with one line saying why.

**Teaches:** `magnification-resolution`, `abbe-limit`, `fluorescence-what`, `em-tradeoff`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `instrument` | string | `'eye' \| 'light' \| 'fluorescence' \| 'tem' \| 'sem'` |
| `wavelengthNm` | number | integer; the slider value |
| `na` | number | two decimals |
| `limitNm` | number | integer; `wavelengthNm / (2 * na)` for light modes, the fixed instrument limit otherwise |
| `separationNm` | number | integer; the gap between the two test mitochondria |
| `resolved` | boolean | `separationNm >= limitNm` |
| `channels` | string[] | fluorescence only, subset of `['mitochondria','microtubules','nucleus']` |
| `livingSpecimen` | boolean | false for `tem` and `sem` |
| `smallestVisibleNm` | number | the finest structure the current instrument shows |

**Why it is a mechanism.** The reader changes the two terms of Abbe's equation and watches two objects merge and separate; the limit is a consequence they produce, not a number in a caption.

---

## 2. `surface-volume` — Grow a cell until it starves

**Kind id:** `surface-volume` · **needsWebGL:** false · **aspect:** 16 / 9 · **narrowAspect:** 4 / 5

**What it shows.** One cell the reader grows from 1 µm to 1 mm across, with three readouts moving together: surface area and volume as numbers and as two bars that diverge; the surface-area-to-volume ratio collapsing as 3/*r*; and a diffusion clock timing how long a small molecule takes to reach the centre, rising as *r*². A supply-and-demand bar runs green while the surface can meet the volume's demand and red when it cannot.

**What the reader does.**
- **Size** slider (and arrow keys), 1 µm to 1 mm on a log scale. Everything updates continuously.
- **Shape** buttons — sphere, flattened disc, long thin cylinder, sphere with microvilli — each holding the *volume* fixed so the reader sees surface bought back without growth. The readout shows the ratio beside the ratio the same volume would have as a sphere.
- **Run the clock**: a molecule released at the surface diffuses inward at the pinned rate, so the wait is felt, not just stated.
- Optional **overlay** marking where a bacterium, an animal cell, an ostrich yolk and a millimetre-wide ball sit on the size axis.

**Teaches:** `sav-arithmetic`, `why-cells-small`, `diffusion-time`, `sav-adaptations`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `shape` | string | `'sphere' \| 'disc' \| 'cylinder' \| 'microvilli'` |
| `radiusUm` | number | three significant figures |
| `surfaceAreaUm2` | number | three significant figures |
| `volumeUm3` | number | three significant figures |
| `ratioPerUm` | number | `surfaceAreaUm2 / volumeUm3`, three significant figures |
| `sphereRatioPerUm` | number | the ratio the same volume would have as a sphere — the shape gain is `ratioPerUm / sphereRatioPerUm` |
| `diffusionSeconds` | number | *x*²/2*D* to the centre, *D* = 1000 µm² s⁻¹ (state *D* in the module header) |
| `supplyDemand` | number | supply ÷ demand; 1.0 is just adequate |
| `verdict` | string | `'comfortable' \| 'marginal' \| 'starving'` |

**Why it is a mechanism.** Two independent physical limits are computed from the reader's own slider, and the shape buttons let them beat one of the limits without changing the variable the other depends on.

---

## 3. `prokaryote` — A bacterial envelope, and what breaks it

**Kind id:** `prokaryote` · **needsWebGL:** false · **aspect:** 16 / 10 · **narrowAspect:** 4 / 5

**What it shows.** A prokaryotic cell in cutaway — nucleoid, plasmids, ribosomes, plasma membrane, wall — with a switchable envelope: gram-positive (thick peptidoglycan), gram-negative (thin peptidoglycan under an outer membrane with lipopolysaccharide), archaeal (S-layer, ether-linked membrane, no peptidoglycan). The envelope is drawn to scale in layer thickness, so gram-positive and gram-negative look as different as they are.

**What the reader does.**
- **Envelope** buttons: gram-positive / gram-negative / archaeal. The layer stack redraws and the readout names the layers outside in.
- **Run the gram stain**: crystal violet floods in, the alcohol wash runs, and the dye either stays (purple) or washes out and is replaced by the counterstain (pink). This is an animation the reader triggers, not an ambient one.
- **Osmotic challenge**: a slider for the solute concentration outside (0 to 2× the cytoplasm). At low solute the cell swells; with the wall intact it stops, without it bursts.
- **Attack the wall**: penicillin (blocks cross-linking; only kills while the cell is growing — a growth toggle makes that visible), lysozyme (cuts the backbone immediately), or remove the wall outright. Combined with the osmosis slider, this is the section's argument.
- **Appendages** toggles: capsule, flagella, pili. With flagella on, the cell swims and the rotary motor turns; the readout gives its speed and reversals. Archaeal mode swaps the flagellum for an archaellum and says what differs.
- Click any part for its name and job.

**Teaches:** `prokaryote-parts`, `nucleoid-plasmid`, `wall-osmosis`, `gram-difference`, `bacteria-archaea`, `two-flagella`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `organism` | string | `'bacterium' \| 'archaeon'` |
| `envelope` | string | `'gram-positive' \| 'gram-negative' \| 'archaeal'` |
| `wallLayers` | string[] | outside in, e.g. `['capsule','outer membrane','peptidoglycan','plasma membrane']` |
| `peptidoglycanNm` | number | 0 for archaeal |
| `stain` | string \| null | `'purple' \| 'pink' \| 'none'`; null before the stain is run |
| `externalSolute` | number | relative to the cytoplasm; 1.0 is isotonic |
| `wallIntact` | boolean | |
| `treatment` | string \| null | `'penicillin' \| 'lysozyme' \| 'removed'` |
| `growing` | boolean | penicillin only bites when true |
| `fate` | string | `'intact' \| 'swollen' \| 'lysed' \| 'plasmolysed'` |
| `appendages` | string[] | subset of `['capsule','flagella','pili']` |
| `motility` | string | `'none' \| 'run' \| 'tumble'` |
| `selected` | string \| null | id of the clicked part |

**Why it is a mechanism.** The wall is not labelled, it is tested: the reader removes it and dilutes the medium, and the cell bursts. Penicillin only works on a growing cell, which the reader discovers by toggling growth.

---

## 4. `secretion` — One protein, ribosome to outside

**Kind id:** `secretion` · **needsWebGL:** false · **aspect:** 16 / 9 · **narrowAspect:** 3 / 4

**What it shows.** A cutaway of the endomembrane system — nuclear envelope, rough ER, smooth ER, Golgi stack with cis and trans faces, secretory vesicles, plasma membrane, and a lysosome off to one side — with one cargo protein travelling through it in eight stages. A panel says where the protein is and what has been done to it so far (signal cleaved, core sugars added, sugars remodelled, sorted, released).

**What the reader does.**
- **Scrub** the journey with a slider, or **step** it stage by stage with buttons and the arrow keys. Stepping is the primary control; the scrubber is for looking around.
- **Block a step**: four toggles — remove the signal peptide, stop vesicles leaving the ER, disable the Golgi's mannose-6-phosphate tag, block fusion at the plasma membrane. Each strands the cargo in a different place, and the panel names where and why. Blocks combine.
- **Follow the membrane**: an overlay that colours the vesicle membrane so the reader can see the ER lumen face become the outside face.
- A **pulse-chase** mode that shows the same route as Palade saw it: a band of label appearing over the ER, then the Golgi, then granules, with a clock.

**Teaches:** `endomembrane-members`, `er-golgi-jobs`, `signal-sorting`, `secretory-route`, `lysosome-function`, `pathway-lesion`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `stage` | number | integer 0–7 |
| `stageName` | string | `'cytosol' \| 'signal-recognised' \| 'translocating' \| 'folding' \| 'er-to-golgi' \| 'golgi-processing' \| 'sorting' \| 'released'` |
| `compartment` | string | `'cytosol' \| 'er-lumen' \| 'transport-vesicle' \| 'golgi' \| 'secretory-vesicle' \| 'outside' \| 'lysosome'` |
| `modifications` | string[] | in the order applied |
| `blocks` | string[] | subset of `['signal','er-exit','golgi-tag','fusion']` |
| `stranded` | boolean | true when a block has stopped the cargo |
| `destination` | string | where it ends up given the current blocks |
| `mode` | string | `'journey' \| 'pulse-chase'` |
| `t` | number | seconds on the pinned clock, three decimals |
| `playing` | boolean | |

**Why it is a mechanism.** The reader breaks a step and reads off the consequence, which is the same inference Palade made from a pulse-chase. The lesions are the lesson, not the animation.

---

## 5. `symbiont` — The evidence for endosymbiosis

**Kind id:** `symbiont` · **needsWebGL:** false · **aspect:** 16 / 9 · **narrowAspect:** 4 / 5

**What it shows.** A mitochondrion and a chloroplast side by side, each of which opens to show outer and inner membranes, cristae or thylakoid stacks, matrix or stroma, a loop of circular DNA and a scatter of bacterial-type ribosomes. Beside them, a list of seven observations and two hypothesis columns: **endosymbiosis** and **inward folding of the host's own membrane**.

**What the reader does.**
- **Select an observation** (two membranes; circular DNA with no histones; bacterial-type ribosomes; antibiotics act on them; division by fission; gene sequences match alphaproteobacteria and cyanobacteria; almost all their genes now sit in the nucleus). The structure highlights the part that shows it, and both hypothesis columns light up as *supports*, *contradicts* or *does not distinguish*.
- **Open / close** either organelle, and switch which one is in front.
- A running **tally**: how many of the tested observations actually discriminate between the two hypotheses. The double membrane scoring as "does not distinguish" is the point of the figure.
- **Reset** clears the tally so the exercise can be done again.

**Teaches:** `organelle-architecture`, `organelle-genomes`, `endosymbiosis-evidence`, `gene-transfer`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `organelle` | string | `'mitochondrion' \| 'chloroplast'` — the one in front |
| `open` | boolean | cut open or not |
| `observation` | string \| null | id of the selected observation, e.g. `'double-membrane'`, `'circular-dna'`, `'bacterial-ribosomes'`, `'antibiotics'`, `'fission'`, `'sequence-match'`, `'genes-in-nucleus'` |
| `verdict` | object | `{ endosymbiosis: 'supports'\|'contradicts'\|'neutral', infolding: 'supports'\|'contradicts'\|'neutral' }` for the selected observation |
| `discriminates` | boolean | true when the two columns differ |
| `tested` | string[] | observation ids selected so far, in order |
| `discriminatingCount` | number | how many of `tested` discriminate |
| `highlighted` | string \| null | the structure highlighted for the current observation |

**Why it is a mechanism.** It is a piece of reasoning the reader performs, not a labelled organelle: the figure grades observations against two rival hypotheses and makes the non-discriminating one visible.

---

## 6. `cytoskeleton` — Motors on tracks

**Kind id:** `cytoskeleton` · **needsWebGL:** false · **aspect:** 16 / 7 · **narrowAspect:** 3 / 4 (the filament runs vertically on a narrow stage)

**What it shows.** A stretch of cytoplasm containing a microtubule and an actin filament drawn at their true relative diameters (25 nm and 7 nm), both marked with plus and minus ends, with a bundle of intermediate filaments crossing behind them for scale and contrast. A cargo vesicle is hauled along by whichever motor the reader has chosen, stepping hand over hand.

**What the reader does.**
- **Filament**: microtubule or actin. **Motor**: kinesin, dynein or myosin. Incompatible pairs (kinesin on actin) are refused with one line saying why, which is itself the lesson.
- The motor walks: direction, step size, speed and steps taken all shown live. Kinesin goes to the plus end, dynein to the minus end, myosin along actin only.
- **ATP** slider from full to none: the motor slows and then stalls, and the cargo stops rather than drifting home.
- **Drugs**: nocodazole (depolymerises the microtubule), taxol (freezes it), latrunculin (breaks the actin filament). When the track goes, the cargo is stranded.
- **Race diffusion**: an optional second cargo that moves only by diffusion, so the reader can see at what distance the motor starts to win.

**Teaches:** `filament-types`, `filament-jobs`, `motor-direction`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `filament` | string | `'microtubule' \| 'actin'` |
| `filamentDiameterNm` | number | 25 or 7 |
| `motor` | string \| null | `'kinesin' \| 'dynein' \| 'myosin'` |
| `compatible` | boolean | false for a motor that cannot walk on the chosen filament |
| `direction` | string | `'plus' \| 'minus' \| 'none'` |
| `stepNm` | number | 8 for kinesin and dynein; 36 for myosin V |
| `steps` | number | integer, since the last reset |
| `positionNm` | number | cargo position along the track |
| `speedNmPerS` | number | |
| `atp` | number | 0–1 |
| `drug` | string \| null | `'nocodazole' \| 'taxol' \| 'latrunculin'` |
| `trackIntact` | boolean | |
| `stalled` | boolean | |
| `diffusionRace` | boolean | |

**Why it is a mechanism.** Direction is not asserted; the reader picks a motor and watches which way the cargo goes, and removing ATP or the track shows what the motor was actually doing.

---

## 7. `cilium` — The 9+2 axoneme, turned over and set beating

**Kind id:** `cilium` · **needsWebGL:** true · **aspect:** 16 / 10 · **narrowAspect:** 1

**What it shows.** A cilium in 3D: nine outer doublet microtubules in a ring around two central singlets, with radial spokes to the central pair, nexin links between neighbouring doublets, and rows of dynein arms projecting from each doublet toward the next. The reader turns it from a face-on cross-section to a view along the shaft, and slides the section plane down to the basal body, where the pattern becomes nine triplets with no central pair.

**What the reader does.**
- **Orbit** by drag or arrow keys, zoom with + and −, as in `cell3d`. `setView({ theta, phi, distance })` for the sweep gate; default view stated in the module.
- **Section** slider running from the tip to the basal body. The cross-section redraws and the readout names the region and the arrangement.
- **Mode**: motile (9+2) or primary (9+0, non-motile). Switching removes the central pair and the dynein arms and changes what the figure will do when told to beat.
- **Beat**: start and stop, with a frequency slider (1–20 Hz). Dynein arms on one side of the ring engage in sequence; the doublets try to slide; the nexin links convert sliding into a bend; the bend travels base to tip. The readout names which doublets are active and whether the stroke is effective or recovery.
- **Remove the dynein arms**: the cilium goes limp, which is primary ciliary dyskinesia in one control.
- **Show sliding**: a diagnostic overlay that releases the nexin links so the doublets slide past each other instead of bending — the experiment that established the mechanism.

**Teaches:** `axoneme-structure`, `cilium-bending`, `two-flagella`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `mode` | string | `'motile' \| 'primary'` |
| `arrangement` | string | `'9+2' \| '9+0' \| '9 triplets'` — follows the section position |
| `sectionUm` | number | distance from the basal body along the shaft |
| `region` | string | `'basal-body' \| 'transition' \| 'shaft'` |
| `centralPair` | boolean | |
| `doublets` | number | 9 |
| `dyneinArms` | boolean | |
| `nexinLinks` | boolean | false in the sliding overlay |
| `beating` | boolean | |
| `beatHz` | number | |
| `phase` | number | 0–1 |
| `activeDoublets` | number[] | 1–9 |
| `stroke` | string | `'effective' \| 'recovery' \| 'none'` |
| `bendAmplitudeUm` | number | 0 when the arms are removed |
| `view` | object | `{ theta, phi, distance }`, distance non-zero |
| `drawCalls`, `triangles` | number | |

**Why it is a mechanism.** Sliding becomes bending only because something holds the doublets together, and the reader can release that link and watch the bend fail to form.

---

## 8. `plantcell3d` — A plant cell against the animal cell

**Kind id:** `plantcell3d` · **needsWebGL:** true · **aspect:** 16 / 10 · **narrowAspect:** 1

**What it shows.** A plant cell about 60 µm across, box-shaped, cut by a cellulose wall with a middle lamella shared with its neighbour: a large central vacuole filling most of the interior and squeezing the cytoplasm into a thin layer, lens-shaped chloroplasts with visible thylakoid stacks, mitochondria, a nucleus pressed against the wall, rough and smooth ER, a Golgi stack, peroxisomes, and plasmodesmata threading through the wall into the cell next door. Organelle colours are the same ones the reader learned from Figure 1.5.

**What the reader does.**
- **Orbit, zoom, cut open**, and click a structure for its name and job — the same vocabulary of controls as `cell3d`, deliberately, so the comparison is the only new thing.
- **Turgor** slider from fully turgid to flaccid to plasmolysed: water leaves, the vacuole shrinks, and the living contents pull away from the wall while the wall keeps its shape. The readout gives the vacuole's share of the volume and the thickness of the cytoplasmic layer, which is the Section 3.2 payoff.
- **Compare**: put the Chapter 1 animal cell beside it at the same scale, with a panel listing what is present in one and not the other. It should reuse `cell3d`'s geometry rather than redrawing it if that is practical; if not, a simplified animal cell at true relative size is acceptable, and say so in the module header.
- **Follow a plasmodesma**: zoom to one and see the plasma membrane lining it and the strand of ER through the middle.

**Teaches:** `plant-animal-differences`, `vacuole-role`, `plasmodesmata`.

**`describe()` reports:**
| field | type | notes |
|---|---|---|
| `view` | object | `{ theta, phi, distance }`, distance non-zero |
| `drawCalls`, `triangles` | number | |
| `cut` | boolean | |
| `turgor` | number | 0–1 |
| `state` | string | `'turgid' \| 'flaccid' \| 'plasmolysed'` |
| `vacuoleFraction` | number | vacuole ÷ cell volume |
| `cytoplasmThicknessUm` | number | how far the working cytoplasm is from the surface |
| `selected` | string \| null | structure id, using `ORGANELLES` ids where they exist |
| `structures` | number | distinct structure types present |
| `comparison` | boolean | animal cell shown alongside |
| `plasmodesmata` | number | count drawn through the wall |

**Why it is a mechanism.** The turgor control turns the vacuole from a labelled blob into the thing that holds a plant up, and the readout ties its size back to the surface-area argument of Section 3.2.

---

## Notes for the integration owner

- **Kind ids are clear of chapter 2.** That chapter is using `soup`, `bondlab`, `water3d`, `waterprops`, `phlab`, `carbonkit`, `polymer`, `foldlab`; none collide with the eight here, nor with chapter 1's nine.
- **Two WebGL figures** (`cilium`, `plantcell3d`) need `sweep3d` entries, and all eight need a recipe in `tools/drive.js` or `npm run drive` fails.
- **Add `biology/ch03-cells/index.html` to `PAGES` in `tools/lib/browser.js`** before running `npm run shot`.
- **Second compositions** are needed on a narrow stage for `cytoskeleton` (the filament turns vertical) and `secretion` (the journey stacks); the other six shrink honestly.
- **If one figure has to be cut**, merge `cilium` into `cytoskeleton` as a second scene rather than dropping it: the 9+2 arrangement is named in three objectives and in one of the end-of-chapter checks. `symbiont` is the next most droppable, and Section 3.5 survives without it, though `endosymbiosis-evidence` then has no figure to set a task against.
