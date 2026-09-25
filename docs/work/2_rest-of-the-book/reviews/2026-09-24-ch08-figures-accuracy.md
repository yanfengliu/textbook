# Chapter 8 figures: accuracy review, 2026-09-24

Reviewer: figacc-ch08, read-only. No tracked file was changed.

- **Figures reviewed**: 8.1 `src/figures/helix-lab.js`, 8.2 `src/figures/meselson-stahl.js`, 8.3 `src/figures/replication-fork.js` and 8.4 `src/figures/chromosome-end.js`. The modules and `tools/drive.js` were read at origin/land-4 a099212. They are unchanged at origin/land-4 e2a87f7, which only added chapter 7 work, and origin/ch08 has not changed them.
- **Prose compared**: the prose, captions and alt text at origin/ch08 69bafc2, which includes fix-ch08-acc's 98d5046 and 0169b7d. The brief compared is `biology/ch08-dna/FIGURES.md` at the same revision. Line numbers for `index.html` and `FIGURES.md` are at 69bafc2. They hold at b542ea1, which reached origin/ch08 during the review: it changes only spaces and line-break marks, keeps every line in place, and leaves `FIGURES.md` alone.
- **Reference**: OpenStax Biology 2e, chapter 14. Where a figure uses a number OpenStax does not give, the primary source is named in the finding.
- **Method**: each figure was driven through its own controls on the lab page, at 1100–1200 px and at 390 px, in headless Chromium. At each state I read `describe()` and the text on the stage, and I read the module source for its numbers. The prose review's finding 1 and its "Notes kept for the figure pass" were checked against the built figures.

## Verdict

**Not ready to ship as built. Ship after the two errors, F1 and F5, are fixed.** Each changes what a figure does, and each contradicts the current prose and the brief:
- **F1** (8.1): the rare form never produces the mispair the prose describes.
- **F5** (8.3): under "Strands run the same way", the figure says the lagging strand is continuous.

The three weak findings should go in the same pass. F11 is something the brief requires and the build left out: the stage never says why the cell stops with three-quarters of its telomere left. Two of the eight small findings change behaviour too: F6 corrects a count, and F12 changes a control's range. The rest change only words. F10 and F13 are in the alt text, which the prose owner writes.

Counts: 13 findings, 2 errors, 3 weak, 8 small.

| Figure | Error | Weak | Small |
|---|---|---|---|
| 8.1 `helix-lab` | F1 | F2 | F3 |
| 8.2 `meselson-stahl` | | F4 | |
| 8.3 `replication-fork` | F5 | | F6, F7, F8, F9, F10 |
| 8.4 `chromosome-end` | | F11 | F12, F13 |

Severity scale:
- **error**: false, or contradicts the prose or brief in a way a reader will act on.
- **weak**: true only on a reading the stage does not give, or misleading to a first-year reader.
- **small**: imprecise, or a disclosed simplification that should be visible on the stage.

---

## 8.1 The helix and its pairs (`helix-lab.js`)

### F1. Error, changes behaviour: the rare form is given to both bases at once, so the mispair it exists to show never forms

**Location**: `helix-lab.js:282–306` (`pairState`: `edgeOf(L, rare)` and `edgeOf(R, rare)`), header line 53 ("Every G and T on the stage takes it at once, which is the simplification"), drawing at 1275 and 1331. State: The pairs, Rare form, G·T or T·G.

**What is wrong**: With the rare form on, G·T and T·G give `pairFits: false`, `whyNot: 'no-hydrogen-bonds'` and `hydrogenBonds: 0` (probed). A rare guanine (O6-H donor, N1 acceptor, N2-H donor) is set against a rare thymine (O4-H donor, N3 acceptor, O2 acceptor), and the two meet donor to donor at the first site. So the figure says a base in its rare form pairs with nothing. The current prose says it pairs with the wrong partner:
- Prose, line 126: "A base caught in its rare form at the moment it is copied can pair with the wrong partner instead, thymine with guanine".
- Alt text, line 106: "a base drawn in its rare form refuses its usual partner and pairs with the wrong one instead, a rare thymine with guanine".
- Brief, line 116: "the usual partner no longer pairs, and the wrong one does — a rare thymine presents cytosine's pattern … and pairs with guanine, and a rare guanine pairs with thymine".

The chemistry agrees with the prose. A tautomeric shift is an event in one base at a time. Enol guanine pairs with keto thymine, and enol thymine with keto guanine, each with three hydrogen bonds at the Watson–Crick width. Sources: Watson & Crick 1953, *Nature* 171:964, on the rare tautomer as a cause of mutation; Topal & Fresco 1976, *Nature* 263:285, for the tautomeric mispairs; OpenStax Biology 2e §14.6 on mismatches and mutation. The module's own edge tables give three bonds with no clash when only one base is rare: rare G [D, A, D] against usual T [A, D, A], and usual G [A, D, D] against rare T [D, A, A].

**Fix**:
1. `pairState`, lines 288–289 and 304. Replace the two `edgeOf` lines with:
   ```js
   const rareL = rare && (L === 'G' || L === 'T');
   const rareR = rare && !rareL && (R === 'G' || R === 'T');
   const eL = edgeOf(L, rareL);
   const eR = edgeOf(R, rareR);
   ```
   Make line 304 `else if ((rareL || rareR) && WATSON_CRICK.has(L + R)) whyNot = 'rare-tautomer';`. Return `rareL`, `rareR` and `mispair: (rareL || rareR) && whyNot === null` with the other fields. Only one base is ever rare: the left one if it is G or T, otherwise the right one.
2. Drawing:
   - Line 1275: change to `edgeOf(sd.base, sd.key === 'left' ? ps.rareL : ps.rareR)`.
   - Line 1331: change to `((sd.key === 'left' ? ps.rareL : ps.rareR) && EXO_RARE[sd.base]) || EXO[sd.base]`.
   - Any other `ps.rare` in the drawing that marks a base as rare (a label or a highlight) changes the same way.
3. `pairVerdict`, `case null`. When `ps.mispair`, return one of these instead of "It fits.":
   - Rare G: "In its rare form guanine carries the hydrogen of N1 on O6 instead, and now pairs with thymine: three hydrogen bonds at the right width, with the wrong partner. A guanine copied in this form gets a thymine across from it where a cytosine belongs."
   - Rare T: "In its rare form thymine carries the hydrogen of N3 on O4 instead, which gives it cytosine's pattern, and now pairs with guanine: three hydrogen bonds at the right width, with the wrong partner. A thymine copied in this form gets a guanine across from it where an adenine belongs."

   The existing `'rare-tautomer'` texts stay: they pick G or T correctly under the one-base rule. When the rare form is on and neither base is G or T (A·C, for example), put "Neither base here is guanine or thymine, so both are drawn in their usual forms." before the usual verdict.
4. Add pair stays off for a mispair, so the built duplex, and `chargaffHolds`, stay as the brief has them. At lines 575 and 1581 use `!(ps.fits && !ps.mispair && built.length < MAX_PAIRS)`; at 1581, `ps` is `currentPair()`.
5. Words:
   - The Rare form aria (line 533) becomes "Rare form, one guanine or thymine as the old drawings showed it: the left base if it is one, otherwise the right".
   - Header line 53: replace the "every G and T at once" sentence with the one-base rule and the reason for it.
6. `describe()`:
   - A rare-form mispair has `pairFits: true`, `whyNot: null` and `hydrogenBonds: 3`.
   - Add a `mispair` boolean to the field list at 1600–1615.
   - In `tools/drive.js`, the rare step (4311–4332) and the keys step (4362) stay valid, because G·C and A·T are still refused.
   - Add one step to the recipe: rare form on, G·T and then T·G; expect `pairFits === true && hydrogenBonds === 3 && mispair === true`, and Add pair disabled.

### F2. Weak: "Hydrogen bonds: none" for pairs that do form hydrogen bonds in a real helix

**Location**: `helix-lab.js:300` (`bonds = widthOk && !clashes.length ? links.length : 0`). The table rows are at 1543 and 1552 (`ps.bonds ? String(ps.bonds) : 'none'`). States: G·T and T·G in the usual form, A·C, and every purine·purine and pyrimidine·pyrimidine pair.

**What is wrong**: For usual G·T the table says "Hydrogen bonds: none". G·T is the commonest mismatch a polymerase makes. It sits in the helix as a wobble pair with two hydrogen bonds, G shifted towards the minor groove and T towards the major groove (Brown et al. 1985, *Nature* 315:604). Purine·purine and pyrimidine·pyrimidine mismatches also pair, with two bonds, in distorted shapes.

The prose depends on wrong pairs being held in the helix. Line 124 says only A·T and G·C bond "without distorting the helix". Line 228 has mismatch repair find "the slight distortion a wrong pair makes". The verdict sentence already says the right thing: "these two cannot make their hydrogen bonds without pulling the pair out of shape". Only the count "none" overstates it.

**Fix**:
- Rows 1543 and 1552: `ps.bonds ? String(ps.bonds) : ps.widthOk ? 'none in this shape' : 'none at this width'`. The second form is for two purines or two pyrimidines. An A·G pair set edge to edge can make two hydrogen bonds, but only at its own, wider width.
- In the `describe()` comment at 1606, add to `hydrogenBonds`: "counted only for a pair in the Watson–Crick shape at the helix's width; real mismatches make two, in a shifted shape (the G·T wobble) or a wider, distorted one".
- No recipe changes.

### F3. Small: the two widths on the drawing do not say where they are measured

**Location**:
- Wide: `helix-lab.js:1420` (`this pair: ${wText} nm`) and 1433 (`'backbones 2 nm apart'`).
- Narrow: 1438 (`this pair: ${wText} nm; every pair: 1.1 nm`).

**What is wrong**: The brief (line 116) asks the stage to say that the 2 nm is measured at the phosphates, and to name the C1′ atoms. Its reason: "so that no reader takes a pair drawn about half as wide as the gap for a pair that does not fit". The current alt text (line 106) says "two backbones held 2 nm apart, the width of the helix at its phosphates". The table names C1′ (1542 and 1551), but the drawing does not. On the drawing, "backbones 2 nm apart" beside "this pair: 1.1 nm" is exactly the puzzle the brief describes.

**Fix**:
- Line 1433: `'backbones 2 nm apart, at the phosphates'`.
- Line 1420: `` `this pair, C1′ to C1′: ${wText} nm` ``.
- Line 1438 (narrow, which already shrinks to fit): `` `C1′ to C1′: this pair ${wText} nm, every pair 1.1 nm` ``.

---

## 8.2 Meselson and Stahl (`meselson-stahl.js`)

### F4. Weak: at generation 1, heated and with the data on, the stage rules the dispersive scheme out in coral, while its own next line says only conservative is ruled out

**Location**:
- `meselson-stahl.js:672–675` (`ruledNote`).
- 681–690 (`heatDataNote`).
- 445 (the announcement).

State: Dispersive, generation 1, Show the 1958 data, Heat.

**What is wrong**: In that state the stage says, in coral, "The 1958 heated DNA gave two bands, light and heavy, where this predicts one." The next line says "Ruled out so far: conservative at generation 1." A reader is told that the data contradict the dispersive prediction, and then that the dispersive scheme has not been ruled out. The second line is the verdict of the bands alone (`FIRST_FAIL`, from the duplex bands), and the stage never says so.

The science:
- Meselson & Stahl (1958, *PNAS* 44:671) heated the generation-1 hybrid DNA. It gave two bands of equal size, about 0.015 g/cm³ apart, one at the density of the ¹⁵N subunits and one at the ¹⁴N subunits.
- Dispersive copying predicts one intermediate band. So heat at generation 1 does separate the dispersive scheme, and it is the only scheme heat separates. The brief says so (line 160): "the heat test separates the dispersive scheme from the other two".
- The brief's invariant keeps `ruledOut` as the bands' verdict (line 288; q3). That is right, but the stage has to say it is the bands' verdict.

**Fix**: change only words. `describe().ruledOut` and every recipe stay as they are.
- `ruledNote` (673): `` `Ruled out by the bands so far: ${…}.` ``
- The announcement (445): `` `Ruled out by the bands so far: ${…}.` ``
- `heatDataNote`, the mismatch branch (689). It is reached only by the dispersive scheme at generation 1, because heated data exist only there. It becomes: "The 1958 heated DNA gave two bands, light and heavy, where dispersive copying predicts one: the hybrid band is made of a wholly heavy part and a wholly light one, not two patchworks. Heat rules the dispersive scheme out at generation 1, a generation before the bands alone do." Keep the coral.
- Optional, for the prose owner, `index.html` line 167:
  - Caption: "By the bands alone, one generation is enough to rule out one of the rivals; the other survives until the second."
  - Hint: "…and see what the hybrid band is made of, and which rival that rules out."

---

## 8.3 The replication fork (`replication-fork.js`)

### F5. Error, changes behaviour: under "Strands run the same way", the figure computes and says that the lagging strand is continuous

**Location**:
- `replication-fork.js:169` (`laggingIsContinuous = (rule) => !(antiparallel(rule) && addsOnlyAtThreePrime(rule))`).
- 632 (`describe`).
- 660–664 (`ruleWords`).
- 1144 (the labels "made continuously too" / "also continuous").
- Header lines 11–13 and 66–71.
- `describe` comments at 1468 and 1473.

State: Strands run the same way.

**What is wrong**: In that state the figure reports `laggingContinuous: true` (probed). It labels the second new strand "made continuously too", and its only sentence is "Hypothetical: the two strands run the same way, so both new strands grow at a 3′ end towards the fork, each from one primer." Nothing on the stage mentions the other fork.

Replication from an origin is bidirectional (OpenStax Biology 2e §14.4). With both strands running the same way and a polymerase that adds only at a 3′ end, both new strands grow towards one of the two forks and away from the other. At the other fork, both would be made in fragments. The fragments move; they do not go.

The current prose, alt text and brief all require the figure to say so:
- Prose, line 192: "at the fork leaving the same origin in the other direction both would have to be made in pieces".
- Alt text, line 194: "the drawing says that at the fork leaving the origin the other way both would have to be made in fragments: the fragments move, and do not go".
- Caption: "Make the strands run the same way and they only move, to the fork leaving the origin the other way".
- Brief:
  - `laggingContinuous` is "false under *Strands run the same way*, which moves the fragments to the other fork rather than removing them" (invariants, line 288).
  - `strandsInFragments` is "[1, 1] under 'as-they-are', [0, 2] under 'same-direction', [0, 0] under 'either-end'".
  - "If the stage draws one fork it says so, and says what the other fork would do."

The builder built against the brief as it stood before fix-ch08-acc. The figure now contradicts all four of the texts above.

**Fix**:
1. Line 169: `const laggingIsContinuous = (rule) => !addsOnlyAtThreePrime(rule);`. After it, add:
   ```js
   // [this fork, the fork leaving the origin the other way]
   const strandsInFragments = (rule) => (!addsOnlyAtThreePrime(rule) ? [0, 0] : antiparallel(rule) ? [1, 1] : [0, 2]);
   ```
   In `state()` (near 632), add `strandsInFragments: strandsInFragments(rule)`. `fragmentsStarted` stays per the fork drawn, which is 0 under both hypothetical rules.
2. `ruleWords` (661), same-direction: "Hypothetical: the two strands run the same way. At this fork both new strands grow at a 3′ end towards it, each from one primer. At the fork leaving the origin the other way, not drawn, both would grow away from their fork and be made in fragments: the fragments move there, and do not go."
3. `ruleWords` (662), either-end: add at the end "…, and so at every fork: no fragments anywhere."
4. Line 1144, the label on the second new strand: `rule === 'same-direction' ? (narrow ? 'continuous here' : 'continuous at this fork only') : (narrow ? 'also continuous' : 'made continuously too')`.
5. Optional, and it serves the alt text's "the drawing says": a label at the origin, on the faint side, reading "← other fork: both new strands in fragments", under same-direction only. The faint strands to the left of the origin can stay continuous. They stand for DNA that fork has finished and ligase has sealed.
6. Header and comments:
   - Lines 11–13: "…change the end a polymerase can add to and the fragments disappear; make the strands run the same way and they move to the other fork."
   - Lines 66–71: "Under either, `fragmentsStarted` at the fork drawn is 0; `laggingContinuous` is true only under 'either-end'; `strandsInFragments` is [1, 1], [0, 2] and [0, 0] under the three rules."
   - Lines 1468 and 1473: make the same change, and add `strandsInFragments`.
7. `tools/drive.js`:
   - Step `either-hypothetical-rule-makes-the-lagging-strand-continuous` (4655–4670). Under same-direction, expect `laggingContinuous === false` and `strandsInFragments` equal to `[0, 2]`, with `fragmentsStarted === 0` still. Under either-end, expect `laggingContinuous === true` and `[0, 0]`. Rename the step, for example to `the-hypothetical-rules-move-or-remove-the-fragments`.
   - The keys step (4678): expect `r.laggingContinuous === false` under same-direction.

### F6. Small: the pyrophosphate count is one too high for every primer

**Location**: `replication-fork.js:392–411` (`forkCounts`): `ppi += s.end + …` for each strand and `ppi += g.q - g.end` for each fragment. Header lines 39–41. `describe` comment at 1476.

**What is wrong**: The count includes the first nucleotide of every RNA primer. Primase starts a primer from two nucleoside triphosphates, and the first keeps its 5′ triphosphate. No pyrophosphate is released for it, because nothing is added to it. The module relies on that same fact at lines 51–58 to explain why ligase cannot seal a nick beside an unremoved primer. A primer of 10 nt releases 9 PPi. The figure counts 10 at every primer laid, so the opening shows 1490 where the count is 1488: 1470 DNA and 9 RNA on the leading strand, and 9 in the first fragment's primer.

**Fix**:
- In `forkCounts`, subtract one for every primer laid: `ppi += s.end - 1 + …` for each strand that has a primer, and `ppi += g.q - g.end - 1` for each fragment.
- Header line 39: "one per nucleotide joined to a chain: a primer's first nucleotide releases none".
- In `tools/drive.js`, lines 4537 and 4736 change from 1490 to 1488, and the comment at 4535 is corrected the same way. The recipe's other pyrophosphate checks (4546, 4558, 4621, 4638 and 4653) are comparisons, and they stay valid.

### F7. Small: the whole-chromosome scene's eight hours comes from the firing schedule, and the stage does not say so

**Location**: `replication-fork.js:682–686` (`chromosomeWords`), header lines 83 and 182. State: Whole chromosome, Human chromosome 1, All origins.

**What is wrong**: The table shows 249 million bp, 1,606 origins, 50 nt/s and "Finished at 8.0 h". A reader who does the arithmetic the prose teaches (line 204) gets a different answer:
- 249 million bp over 1,606 origins is about 155 kb between origins.
- Two forks at 50 nt/s copy that in about 26 min.
- The widest gap in the module's origin layout, about 264 kb, takes about 44 min.

The eight hours is the time over which the module spreads the firing (`S_PHASE_MIN = 480`), and the forks do not need it. The prose puts it right: "fired at different times through those eight hours". The stage's words ("fired at different times through the eight hours") are true, but beside the numbers they invite the wrong division.

**Fix**: add to the `origins === 'all'` sentence (685): "Fired all at once, these forks would finish in under an hour; the eight hours is how long the firing is spread over."

### F8. Small: after a chain terminator on the leading strand, the drawn fork runs on and leaves a long single-stranded template, and the stage does not say this is the model's

**Location**: `replication-fork.js:675` (`forkWords`, the leading-terminator branch). Header lines 55–58 already disclose it. State: Add a chain terminator, then run about 3 s.

**What is wrong**: The stage says "A chain terminator has stopped the leading strand: nothing can be added after it." That is true. Meanwhile the drawing keeps the fork opening at full speed, with about 3,000 nt of bare template behind it. A real fork's helicase and polymerase are coupled. The fork slows, and it can start the strand again beyond the block on a new primer. The header says so, but the reader cannot see the header.

**Fix**: append to that branch's sentence: "In this drawing the fork keeps opening; a real fork slows, and may start the strand again beyond the block on a new primer."

### F9. Small: primers are drawn about ten times longer than scale, and the stage does not say so

**Location**: `replication-fork.js:856` (`primerPx = Math.max(PRIMER_NT * G.s, narrow ? 10 : 12)`). Header lines 30–31 disclose it.

**What is wrong**: At the fork's scale, 3,600 nt across about 480 px at 1100 px (0.13 px/nt), a 10-nt primer is 1–2 px. It is drawn 12 px, and 10 px on a phone, which is about 9–11 times too long. That makes a primer look about a tenth of an Okazaki fragment, where it is a hundredth to a two-hundredth (§8.4: 10 nt against 1,000–2,000 nt). The disclosure is in the header only.

**Fix**: in `forkWords` (677), the opening sentence (`fk.tau === 0`) becomes "The fork is just leaving its origin, with one primer on each template. Drawn four times slower than life, and the primers, 10 nucleotides each, drawn about ten times too long to see." If the label budget allows, "RNA primer" at 1149 and 1152 can instead read "RNA primer (not to scale)".

### F10. Small: the alt text describes "two switches"; the figure has one three-way rule control

**Location**: `index.html:194`, the alt text of 8.3; the prose owner's text. The control is `replication-fork.js:161–165` (`RULES`), one segmented control with three settings.

**What is wrong**: The alt text says "Two switches, each marked as hypothetical, change the rules the chemistry sets." The figure has one control, and two of its three settings are hypothetical, so the two cannot be combined. A screen-reader user looking for two switches will not find them.

**Fix**: in the alt text, "One control, with two settings each marked as hypothetical, changes the rules the chemistry sets."

---

## 8.4 The chromosome end (`chromosome-end.js`)

### F11. Weak: at the stop, the stage never says why a cell stops with three-quarters of its telomere left, and "Switch telomerase on and it goes on" suggests the enzyme restarts a stopped cell

**Location**:
- `chromosome-end.js:423` (`noteWords`, the `st.senescent` branch): the table's sentence.
- 266 (`stoppedWords`): announced when a stopped cell is asked to divide or run.
- 1029: the overview's label `` `the cell stops at ${nt(THRESHOLD_BP)} bp` ``.

State: Linear, telomerase off, divided or run to 50 divisions (7,500 bp).

**What is wrong**: At the stop the stage says "The telomere is down to 7,500 bp, the length this model stops at: the cell stops dividing, after 50 divisions. Switch telomerase on and it goes on." The drawn label reads "THE CELL HAS STOPPED DIVIDING" (probed at 1200 px and 390 px). Nothing on the stage says why the cell stops with 7,500 of its 10,000 pairs.
- The brief requires it (line 246): "the stage must also say why a cell stops with so much left: it is the shortest of its telomeres, not the average one, that stop it (§8.7). Otherwise the stop looks arbitrary."
- The alt text (line 329) tells a screen-reader user that the figure says so: "until the cell stops dividing with about three-quarters of it still left, because what stops a real cell is the shortest of its telomeres, not the average one".
- The prose says it at line 323, and the module's header at lines 24–28, where no reader sees it.
- The science: the figure counts the average end. A cell stops when its shortest telomeres fall too short to protect their ends (Hemann et al. 2001, *Cell* 107:67; Zou et al. 2004, *Mol. Biol. Cell* 15:3709).

"Switch telomerase on and it goes on" is a second problem. Switching the enzyme on at the stop re-does the last division with the enzyme there (header lines 61–63), which removes the stop. That is a fair model control, but the words tell a first-year reader that telomerase restarts a cell that has stopped. The work behind the prose's "giving such cells the enzyme … lets them divide far beyond the limit" (line 323) gave telomerase to cells before they reached their limit (Bodnar et al. 1998, *Science* 279:349).

**Fix**: words only. No `describe()` field or recipe changes.
- Line 423 becomes:
  ```js
  `The cell stops here, after ${st.divisions} ${plural(st.divisions, 'division')}, at this model’s limit. A real cell stops when its shortest telomeres, not the average shown here, get too short.`
  ```
  It is 153 characters at the default. The module's longest sentence, at 431, is 160, and the header says every sentence fits down to a 360 px phone. The worker should still look at 360 and 390 px, because the module leaves out a sentence that cannot fit whole.
- Line 266, which is announced and has no length limit:
  ```js
  `The cell has stopped dividing at ${nt(telomereNow())} base pairs, this model’s limit; a real cell stops when its shortest telomeres, not the average, get too short. Reset, or switch telomerase on to run this division again with the enzyme there.`
  ```
- Line 1029: `` `this model’s limit: ${nt(THRESHOLD_BP)} bp` `` in place of `` `the cell stops at ${nt(THRESHOLD_BP)} bp` ``. It is drawn at wide sizes only.

### F12. Small: the loss control's lowest settings give a tail shorter than the range the prose states

**Location**: `chromosome-end.js:121` (`LOSS`, `min: 25`) with `overhangOf = (loss) => 2 * loss` (142). Header lines 17–21. The drawn "tail, N nt" label and the table's Tail row. State: Loss per division at 25, 30 or 35 bp.

**What is wrong**: The tail is drawn at twice the loss, for the two-copy reason in the header, which is sound (see the rulings below). So at 25, 30 and 35 bp the stage shows a tail of 50, 60 and 70 nt (probed at 25: `overhangNt: 50`, "Tail 50 nt", "tail, 50 nt"). The prose (line 321) says the tail is "roughly 75 to 300 nucleotides long". The brief lists that range among the numbers a figure may not contradict (line 289). The sources are Wright et al. 1997 (*Genes Dev.* 11:2801) and Makarov et al. 1997 (*Cell* 88:657). The header discloses the gap, but the stage does not.

**Fix**: this changes the control's range.
- Line 121: `const LOSS = Object.freeze({ min: 40, max: 100, step: 5, open: 50 });`. The tail then runs from 80 to 200 nt, inside 75–300 at every setting. The default stays at 50.
- Header:
  - Line 17: "25–100 on the control" becomes "40–100 on the control".
  - Lines 20–21: replace "so the control's lowest settings, 25 to 35 bp, give tails of 50 to 70 nt, under the measured range" with "and the control starts at 40 so that the tail never falls below the measured 75".
- Line 1274 (the `describe()` comment): "the setting, 40–100".
- `tools/drive.js`, step `the-loss-control-sets-the-tail`:
  - Lines 4818–4820: fill, wait for and expect 40 in place of 25.
  - Line 4822: expect `f.overhangNt === 80 && f.lostLastDivisionBp === 40 && f.telomereBp === 9960 && f.divisionsLeft === 62`, with the message "at 40 bp the division on show should be re-done from an 80-nt tail".
- `tools/drive.js`, step `a-circle-has-no-end-to-lose`: line 4827 expects `d.lossPerDivisionBp === 40`, and line 4836 expects `lin.overhangNt === 80`.
- Brief, `FIGURES.md` line 251: "**Loss per division**, from 40 to 100 base pairs, opening at 50."

### F13. Small: the alt text and the brief say the new chromosome end is shorter; the figure shows two new ends, and only one is shorter

**Location**:
- `index.html:329`: the alt text of 8.4, which the prose owner writes.
- `FIGURES.md` line 244: the brief.

The figure is right: `chromosome-end.js` header lines 33–46, and the table's sentence at 431.

**What is wrong**: The alt text says the last primer leaves "a gap at the end that nothing can fill, so that the new chromosome end is shorter by a counted number of base pairs". The figure draws both copies, after Lingner, Cooper & Cech (1995, *Science* 269:1533):
- The copy with the gap that cannot be filled, made by the lagging strand, loses nothing its parent had once it is trimmed to leave a tail.
- The copy made by the leading strand is a whole tail shorter.

The stage says so: "Trimmed to leave a tail, one copy is 100 bp shorter and the other is not: 50 bp an end, on average." So the alt text tells a screen-reader user that the copy with the gap is the shorter one, which is the opposite of what the drawing labels. The brief's "the new chromosome is shorter by a counted number of base pairs" is the one-end account, which the builder was right to leave.

The alt text's first words, "The last few thousand base pairs of a linear chromosome, drawn with its telomere repeats as a run of short marks", are also inexact. The stage draws the whole telomere small, as a band across the top. It enlarges only the last few hundred base pairs, and that is where the marks are.

**Fix**:
- Alt text, first sentence: "The end of a linear chromosome: its whole telomere drawn small across the top, and its last few hundred base pairs enlarged, with the repeats as a run of short marks and the single-stranded tail at the tip."
- Alt text, second sentence, which becomes two: "Stepping through one round of copying shows the fork reaching the end, the last lagging-strand fragment started on a primer at the very tip and, once the primers are removed, a gap at the end that nothing can fill. Both new ends are then trimmed to leave a tail: the one made by the leading strand is a tail's length shorter, the other has lost nothing, and the telomere, counted as the average end, is shorter by a counted number of base pairs."
- Brief, line 244: replace "the end is trimmed to restore the overhang, and the new chromosome is shorter by a counted number of base pairs" with "both new ends are trimmed to restore the overhang, and the one made by the leading strand is a tail's length shorter than its parent, the other no shorter, so the average end is shorter by a counted number of base pairs".
- Optional, for the prose owner: the key-ideas box (line 333) says "so each copy is a little shorter than its template". "so the strand made there is a little shorter than its template" says the same without contradicting the figure's other copy.

---

## Checked and found right

**8.1**
- The pattern is a calculation from the model, and the stage says so ("Pattern: calculated"; the marks are Franklin's). It never imitates Photograph 51.
- The physics is right:
  - layer lines at *l*/*P*;
  - the Bessel selection *l* = *n* + *mN* with *N* kept whole by the stepped rise;
  - amplitude *J*<sub>*n*</sub>(2π*rR*);
  - the meridional arc at 1/*h*;
  - the two-strand factor 4 cos²(π*lf*): at 3/8, of the first nine layer lines only the fourth vanishes, and at 1/2 every odd one does.
- The offset control runs from 1/4 to 1/2. That excludes 1/8, which also silences the fourth row alone. The header's chemical argument for 3/8 over 1/8 (the sugars of a pair are about 130° apart round the axis) is right. The hint "at one offset … and no other" holds over the control's range.
- Franklin's values match Franklin & Gosling 1953 (*Nature* 171:740): pitch 3.4 nm, rise 0.34 nm, width about 2 nm, fourth layer line missing. The `matchesPhotograph` tolerances are reasonable.
- Pair widths:
  - C1′ to C1′ is computed at 1.07 and 1.08 nm and shown as 1.1. Structural tables give about 1.05 nm, which also rounds to 1.1.
  - Purine·purine pairs come out at 1.2–1.3 nm (too wide) and pyrimidine·pyrimidine at 0.9 nm (too narrow).
- A·T makes 2 hydrogen bonds and G·C 3. The rare-form edges are right: G is O6-H, N1, N2-H and T is O4-H, N3, O2. The refusals of rare G·C and rare A·T, donor to donor, are right.
- The parallel verdict, a sugar on the major-groove side, is right within the model. Parallel-stranded DNA with reverse Watson–Crick pairs exists for special sequences and is rightly not offered.
- `chargaffHolds` follows from Add pair taking only fitting pairs. Keep it that way under F1.

**8.2**
- Densities: light 1.710, heavy 1.724 and hybrid 1.717 are the paper's 1.71 plus 0.014, placed as the brief says. Single strands at 1.725 and 1.740 fit the paper: denatured DNA bands about 0.015 denser, and its two heated bands were 0.015 apart.
- Every band count and share at generations 0–4 is right for all three schemes:
  - semiconservative: hybrid, then hybrid and light in shares ½, ¼, ⅛ against the rest;
  - conservative: heavy ½<sup>*g*</sup> and light the rest;
  - dispersive: one band at 1.710 + 0.014 × ½<sup>*g*</sup>.
- `ruledOut` is [] at 0, conservative from 1, and dispersive as well from 2, as the brief's invariant and question q3 require.
- Heat is right:
  - conservative and semiconservative give the same two strand bands at every generation;
  - dispersive gives one band;
  - the 1958 heated data are shown at generation 1 only, as in the paper.
- The idealised 1958 bands are declared in the header. The tube and the narrow composition were checked at 390 px.

**8.3**
- Under "As they are", `laggingContinuous` is false in every state probed: each enzyme removed in turn, the chain terminator, and the stall.
- Each removal gives its own failure:
  - no helicase: the fork does not move;
  - no topoisomerase: the twist builds to a stall at 100 turns, a declared model threshold;
  - no primase: no new fragment starts;
  - no ligase: nicks accumulate;
  - no primer removal: the primers stay, and the nick beside each cannot be sealed because of the primer's 5′ triphosphate. That chemistry is right.
- Polymerase I removes the RNA ahead of itself. E. coli ligase spends NAD⁺ and releases no pyrophosphate, so none is counted.
- Speeds and sizes:
  - fork 1000 nt/s, drawn four times slower, and the table's Time is the fork's own time;
  - fragments 1,000–2,000 nt; primers 10 nt;
  - one turn of twist per 10 bp opened.
- Whole chromosomes:
  - E. coli: 4.6 Mbp, two forks, 2,300 s = 38.3 min.
  - Human chromosome 1, one origin: 249 Mbp at two forks of 50 nt/s, 2.49 million s = 28.8 days.
  - All origins: 1,606, finishing at 8.0 h (see F7).
- The 5′ and 3′ labels are right at every strand end under all three rules.

**8.4**
- The numbers match the header's sources and the prose:
  - it opens at 10,000 bp (the mean in newborns' blood cells is 9.5 kb, Factor-Litvak et al. 2016);
  - it loses 50 bp an end at each division by default (Levy et al. 1992, *J. Mol. Biol.* 225:951);
  - it stops after 50 divisions at the defaults (Hayflick 1965, *Exp. Cell Res.* 37:614);
  - the threshold is declared as a model value in the header, and on the stage at the stop.
- The count, probed: 9,950 bp after one division and 7,500 after fifty, with `divisionsLeft` falling from 50 to 0. The run stops itself there. A stopped cell does not divide again, which the drive recipe checks (`tools/drive.js:4773`).
- The copying phase agrees with prose line 319:
  - the leading strand runs off the end with its template;
  - the last lagging-strand fragment starts on a primer at the tip;
  - every gap but the last is filled from the fragment beyond it, on the fork's side;
  - the last gap has nothing beyond it.
- The two copies are drawn right. The lagging copy's new strand ends short and is trimmed back to leave the tail. The leading copy's new strand ends blunt, and its old strand is trimmed back to leave the tail. Every 5′ and 3′ label is at the right end.
- Primers are 10 nt, drawn to scale. Fragments are 100–200 nt, the eukaryotic length the prose gives.
- The letters:
  - The tail is the G-rich strand running 5′ to 3′ to the tip.
  - At rest the C-rich strand ends 3′-…AATCCCAATC-5′, that is, in ATC at its 5′ end (Sfeir et al. 2005, *Mol. Cell* 18:131).
  - Telomerase's template, 3′-CAAUCCCAAUC-5′, pairs its 3′ CAAUC with the tail's last five, GTTAG, and templates GGTTAG. Every pair drawn at the stop with telomerase on was checked letter by letter, and each is a Watson–Crick pair.
- Telomerase:
  - it adds 100 nt to the short copy, which is 16 whole repeats and part of another;
  - primase lays a primer on the new stretch, polymerase fills in the partner strand, and the primer is removed;
  - the length holds at 7,550 bp, `repeatsAdded` goes 16 and then 33, and Divisions left reads "no limit".
- The circle: the two forks meet. Each last gap is filled from the other fork's leading strand, whose 3′ end points into it. No tail is left and nothing is lost (probed: 11 divisions at 10,000 bp, `gapAtEnd` false).
- The brief's invariant holds: `gapAtEnd` is never true on a circle or with telomerase on.
- At 390 px the two copies, their labels, the table and every sentence show.

---

## Rulings on the builders' doubts

**8.1 `helix-lab`**
- *Is the calculated pattern presented honestly as not Photograph 51?* Yes. The stage says "Pattern: calculated", and the marks are Franklin's measured positions.
- *G–T is scored 0 hydrogen bonds, where a wobble pair makes 2.* The count is right only for the Watson–Crick shape the figure draws, and the stage must say so: F2.
- *Is the G–G shape approximate?* Yes. The figure sets both purines edge to edge, both in their usual orientation on the sugar. Real purine·purine mismatches do sit in a helix, with two hydrogen bonds. Either they are wider than a right pair and bulge the backbones, or one base is turned over on its sugar (G·G, with one G syn). "Too wide" is right for the shape drawn, and F2 covers the count. No other change.
- *Franklin's values rounded to 3.4 nm, 0.34 nm and 1 nm.* Right: 34 Å a turn, 3.4 Å a base and a radius of about 10 Å (Franklin & Gosling 1953).
- *`chargaffHolds` is always true.* Right, because only a fitting pair can be added. Keep it so under F1: Add pair stays off for a rare-form mispair.
- *The rare form and parallel strands as options.* Keep both. The rare form must apply to one base, not every G and T at once: F1. The parallel verdict is right within the model.

**8.2 `meselson-stahl`**
- *1.710, 1.724 and 1.717, and the dispersive band at 1.710 + 0.014 × ½<sup>*g*</sup>.* Right.
- *A single-strand light density of 1.725.* An acceptable choice. It keeps the paper's 0.015 between the heated bands, and denatured DNA does band about that much denser than native DNA.
- *Heated dispersive strands at 1.725 + 0.015 × ½<sup>*g*</sup>.* Right, not only extrapolated. Density is linear in the share of ¹⁵N, which is how the paper reads its bands, and at generation *g* every dispersive strand is ½<sup>*g*</sup> heavy.
- *The 1958 shares at generations 3 and 4 are idealised.* Acceptable, and declared in the header.
- *Heated data only at generation 1.* Right, as in the paper.
- *1.7325 shown as 1.733.* Acceptable. The third decimal is finer than the method resolves, and either rounding is fine.
- *Does heating at generation 1 rule out only the dispersive scheme?* Yes. The stage must say that `ruledOut` is the verdict of the bands alone: F4.

**8.3 `replication-fork`**
- *The made-up rules (prose finding 1).* F5 says exactly what the figure must compute, draw and say.
- *The eight hours comes from a made-up firing schedule.* Acceptable as a model choice scaled to the prose. F7 adds one sentence so that the table's numbers do not invite the wrong division.
- *A blocked leading strand lets the fork keep opening.* Acceptable with the words in F8.
- *The stall at 100 turns and the topoisomerase rate are model values.* Acceptable. Both are declared in the header, and the stage claims no real number for either. With topoisomerase working, the twist holds near 10 turns.
- *Drawn at a quarter of real speed; primers not to scale.* The speed is said on the stage, and the table's Time is the fork's own. The primers need the words in F9.

**8.4 `chromosome-end`**
- *The two-copy model.* Keep it. It is right (Lingner, Cooper & Cech 1995), and a loss of half the tail at each division agrees with Huffman et al. (2000, *J. Biol. Chem.* 275:19719), who found that telomeres shorten in proportion to their tails. The alt text and the brief should follow the figure: F13. The tail under 75 nt at 25–35 bp is F12.
- *Senescence triggers on the average end at 7,500 bp.* Acceptable as a declared model value, if the stage says what stops a real cell: F11.
- *Telomerase switched on mid-division re-does the division on show.* Acceptable as a model control. F11 replaces the words that suggest a stopped cell restarts.
- *`gapAtEnd` is false with telomerase on.* Right by the brief's definition (line 267). With telomerase on, the drawing still shows the lagging copy's last-primer gap as a faint ghost. That is true: telomerase does not fill that gap, it lengthens the other copy. The gap's label is rightly withdrawn. Optional: the `describe()` comment at 1278 could read "a gap at the end that leaves the chromosome shorter", so that no one takes the ghost for a contradiction.
- *The C-rich strand ends in ATC at its 5′ end.* Right (Sfeir et al. 2005).

Primary sources named in this report that are not in OpenStax were cited from memory of the papers, not re-read in this session. Every number a fix depends on is also in OpenStax, the chapter's prose, its brief, or the module's own header.
