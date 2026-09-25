# Chapter 7 figures: accuracy review (figacc-ch07, 2026-09-24)

## Verdict

**None of the four figures teaches an error: none of the 23 findings is a false claim a reader would learn. Two findings block reading instead. From an 800 px to about an 1150 px window, 7.2's ring (finding 17) and 7.4's NAD pool (finding 23) cannot be read, and the window includes the 1024 px the shot gate uses. The cause is a seam: the frame gives a figure its tall narrow box only below an 800 px viewport, while these two modules re-compose by stage width. Fix both before the chapter ships, which needs the coordinator's decision on the frame, together with the other six weak findings. The fifteen small ones are cheap and should go in the same pass.**

Counts: 23 findings, 0 errors, 8 weak, 15 small. 7.1: 2 (1 weak, 1 small). 7.2: 6 (1 weak, 5 small). 7.3: 7 (3 weak, 4 small). 7.4: 8 (3 weak, 5 small).

Seven findings change what a figure does or draws, not only what it says:
- 3: 7.3's sulfate ceiling becomes 1, with its drive assertion.
- 4: 7.3 shows "uphill" instead of a negative energy released.
- 6: 7.3's complex II is drawn into the membrane.
- 10: 7.4's "+28 ATP" moves off "Chain" to the mitochondrion.
- 17: 7.2's composition and box between 800 and 1150 px.
- 18: 7.2's glycolysis arrow is drawn with its products.
- 23: 7.4's box between 800 and 1090 px.

Where the fixes go:
- `src/figures/krebs.js`: 17, 18, 19 and 20.
- `src/figures/respiratory-chain.js`: 3, 4, 5, 6 and 7.
- `src/figures/fermentation.js`: 10, 12, 13 and 14, and 23 if the frame stays as it is.
- `src/styles/components.css` and `src/components/figure.js`: 17 and 23, if the frame route is chosen.
- `tools/drive.js`: 3.
- A gate that shoots an 860 px viewport: 17 and 23.
- The chapter page: 1, 2, 8, 11, 15 and 21.
- FIGURES.md: 9, 16 and 22.
- `src/figures/glycolysis.js` and items.js need nothing.

Heads reviewed: 7.1 `glycolysis` at origin/fig-ch07-a 924381b, 7.2 `krebs` at origin/fig-ch07-d 6a30a4c, 7.3 `respiratory-chain` at origin/fig-ch07-b c3485b9 and 7.4 `fermentation` at origin/fig-ch07-c 6bec50f. The prose, FIGURES.md and items.js were read from origin/ch07 bc523ab, never from a figure branch.

Method:
- Each head was checked out in a detached worktree, and its drive recipe was run: glycolysis 13 steps, krebs 10, respiratory-chain 13 and fermentation 10, all green.
- The states a reader reaches were then driven through the figure's own buttons and steppers on the chapter page, with real waits, and I looked at the frames that settle each question.
- Widths shot: 7.1 and 7.3 at 390 and 1024 px. 7.4 at 390 px and at the drive's 952 px stage. 7.2 at 390, 1024 (also at twice the density) and 1440 px.
- While checking 7.2, I measured krebs's stage and ring at thirteen widths from 640 to 1280 px, shot all four figures at 860 px, and shot 7.4 at 1024 px.

References: OpenStax Biology 2e ch. 7; Berg, *Biochemistry* 9e and Lehninger 7e where a figure uses numbers OpenStax does not give; the prose review's saved sources.

Severity: **error** is a false claim a reader would learn; **weak** is true in part, or misleading as shown; **small** is wording, consistency or a record that has drifted.

## Findings

### 7.1 `glycolysis` (924381b)

**1. Weak. The committed step's levels are invented, and the stage shows them as a sharp switch in mM.**

Where: `src/figures/glycolysis.js:148–151` (K_ATP 3.8, K_AMP 0.1, K_CIT 1, REST 3 / 0.1 / 0.2), `:380–382` (the ATP, AMP and citrate steppers, in mM), `:551–566` (the status sentences). State: ATP stepped from 3 to 7 mM at 390 px.

What is wrong: the module header calls the constants illustrative, but nothing the reader sees says so. The stage prints ATP 6 mM as open and 7 mM as shut ("ATP has shut the committed step: phosphofructokinase holds its inactive shape"), so a reader can take away "PFK shuts at about 7 mM ATP". The real enzyme is turned down along a sigmoid curve, not at a threshold, and in a cell ATP itself changes little while AMP changes many-fold (Berg 9e §16.2; Lehninger 7e §15.3). The prose's own picture, "plenty of ATP holds the enzyme in its inactive shape" (index.html:129), fits a switch, so the drawing need not change; the numbers need to be labelled. The stage opens at 3 mM ATP where §7.7 quotes 5 mM from §5.3 (index.html:340); 5 mM is open on the figure too, so the two do not conflict.

Fix (chapter page, index.html:132, the caption's hint): "Raise the ATP slider and the committed step closes. Raise AMP and it opens again. The levels are illustrative: the real enzyme is turned down by degrees, not shut at one level."

**2. Small. The citing sentence promises an ADP control the figure does not have.**

Where: index.html:129, last sentence. "Those controls" are ATP, AMP and ADP, and citrate. The figure has ATP, AMP and citrate.

Fix (chapter page, index.html:129): "Figure 7.1 lets the pathway be walked a step at a time, and lets ATP, AMP and citrate each be pushed."

### 7.3 `respiratory-chain` (c3485b9)

**3. Weak; changes what the figure does. Sulfate's ceiling is 0 only because 19.3 is rounded to 19 before it is divided by 19.3.**

Where: `src/figures/respiratory-chain.js:133–139` (`kjOf` rounds, then `chargesFor` divides), `:719–723` (the sulfate and carbon dioxide sentences); `tools/drive.js:3994`; FIGURES.md:225–228 and :239. State: acceptor sulfate, donor NADH.

What is wrong: with the chapter's own potentials, NADH (−0.32 V) to sulfate (−0.22 V) is a 0.10 V fall, and 2 × 96.5 × 0.10 = 19.3 kJ/mol: exactly one charge's price at 200 mV. The module rounds that to 19 first, so the ceiling comes out 0 and the stage says "19 kJ/mol from NADH is not quite one charge's worth (19.3 kJ/mol)", short form "less than one charge". The measured potential, −0.217 V for sulfate to HS⁻ (Thauer, Jungermann and Decker 1977, *Bacteriol. Rev.* 41:100), gives 19.9 kJ/mol, a little more than one. So "not quite one" is an artefact of rounding, and it tells a reader that NADH's pair cannot pay for a single charge when it can pay for one. This overturns one cell of the prose review's finding 9 (its ceilings 10, 7, 3, 0, 0 become 10, 7, 3, 1, 0); the rest of that finding stands.

Fix (module): compute the ceiling from the unrounded energy. In `chargesFor`: `const kj = 2 * FARADAY * fallOf(dn, a); if (kj <= 0) return 0; return Math.min(OXYGEN_COUNT[dn], Math.floor(kj / PER_CHARGE + 1e-9));`. Every other ceiling is unchanged (from NADH: nitrate 7, fumarate 3, carbon dioxide 0; from FADH₂: nitrate 3, the rest 0), and the "Released" cell keeps its rounded 19. Split the sentence at `:719–723` by acceptor:
- Sulfate, long: "19 kJ/mol from NADH (19.3 before rounding) pays for one charge at 200 mV exactly, with nothing left over to drive it. These organisms take their electrons from fuels other than NADH, mostly hydrogen, and move only a few ions per reaction." Short: "19 kJ/mol: one charge, no more."
- Carbon dioxide, long: "15 kJ/mol from NADH is less than one charge's worth (19.3 kJ/mol). These organisms take their electrons from fuels other than NADH, mostly hydrogen, and move only a few ions per reaction." Short: unchanged.

Fix (`tools/drive.js:3994`): `[3, 'sulfate', -0.22, 19, 1, 'ubiquinone'],`.

Fix (FIGURES.md): see finding 9.

**4. Weak; changes what the figure shows. Uphill steps are printed as negative energy "released".**

Where: `src/figures/respiratory-chain.js:1508–1511` (`col()`), rows at `:1516–1518`. States: acceptor sulfate or carbon dioxide, with either donor chosen.

What is wrong: the FADH₂ column prints "Fall, V −0.25" and "Released, kJ/mol −48" under sulfate, and −0.27 and −52 under carbon dioxide, even while NADH is the donor. A negative amount "released" is a step that needs energy, not one that gives it. And a reader fresh from §7.4's table, where ΔG°′ is negative for energy released (−70, −41, −110), can read "−48" as 48 released. The sentence says the step is uphill only when FADH₂ is the chosen donor.

Fix (module, `col()`): when the fall is below zero, show "uphill" in the Fall cell and "—" in the Released and Charges cells: `if (fall < 0) return { fall: 'uphill', kj: '—', n: '—', pairs: String(pairs[dn]) };`. `describe()` is unchanged. Add 'uphill' to the fit test at `:791`, which samples '1.14'.

**5. Small. "Could not hand it a pair" is too strong for a 0.01 V step.**

Where: `src/figures/respiratory-chain.js:742`. State: acceptor fumarate.

What is wrong: ubiquinol (+0.045 V) to fumarate (+0.031 V) is uphill by about 0.01 V, about 3 kJ/mol a pair, and mammalian complex II does run it backwards when oxygen is short (Spinelli et al. 2021, *Science* 374:1227). Menaquinone is used because at −0.07 V its pair falls to fumarate, not because ubiquinol cannot reach it at all.

Fix (module): "Menaquinone (−0.07 V) stands in for ubiquinone (+0.04 V), which sits just past fumarate (+0.03 V), so its pair would have to go slightly uphill. ${ceiling}${unusedBlock}"

**6. Small; changes the drawing. Complex II is drawn outside the membrane.**

Where: `src/figures/respiratory-chain.js:879–886` (`B.II` ends at `mL`, the bilayer's matrix face; the comment says it "stands out of the membrane on the matrix side").

What is wrong: the prose says complex II is "the only enzyme of the cycle that is not floating in the matrix but built into the membrane" (index.html:220). The figure draws its body wholly in the matrix, touching the bilayer, so it reads as a matrix enzyme. Real complex II has two membrane subunits, which hold its ubiquinone site inside the bilayer (Sun et al. 2005, *Cell* 121:1043; Berg 9e §18.3).

Fix (module): extend `B.II` into the bilayer's matrix half (`x1: (mL + mR) / 2`), keep its catalytic head in the matrix, check that the wire from II still meets ubiquinone, and update the comment.

**7. Small. The FADH₂ sentence speaks for every FADH₂.**

Where: `src/figures/respiratory-chain.js:733`; the donor's short label at `:512` is "FADH₂".

What is wrong: the prose is careful that only the cycle's FADH₂ enters at complex II; β-oxidation's and the shuttle's enter "through doors of their own, at the same level" (index.html:232). The sentence "From FADH₂ the pair enters at complex II" drops that.

Fix (module): "From the cycle's FADH₂ the pair enters at complex II, bypassing complex I: 2 + 4 = 6 charges a pair, and no ATP."

**8. Weak. The page tells the reader to count protons; the figure counts charges.**

Where: index.html:232 (last sentence), :234 (data-alt), :235 (caption), :377 (the sentence citing the last control).

What is wrong: the figure counts charges moved across the membrane, 4, 2 and 4 at complexes I, III and IV, which is what the gradient is charged with (the prose review's finding 9). §7.4's table counts protons pumped, 4, 0, 4 and 2. The totals agree, 10 and 6, but a reader told to "count the protons" sees complex III's 2 against the table's 4, and complex IV's 4 against its 2. The data-alt is also out of date: it describes the matrix below and the intermembrane space above (the figure now has the matrix on the left), readouts of "protons pumped" that no longer exist, and "the protons pumped shrink" under other acceptors.

Fix (chapter page):
- :232: "…Figure 7.3 lets both be delivered and the charges counted."
- :235, caption (hint unchanged): "The fall, in the four steps a mitochondrion takes it in. Deliver a pair from NADH and count the charges it moves across the membrane, then deliver one from FADH<sub>2</sub> and count again — the second enters lower and moves four fewer. Then block a complex and watch the carriers above it fill while the ones below empty."
- :234, data-alt: the builder's proposed text, with "complex II on its matrix face" changed to "complex II set into its matrix side" (finding 6): "The inner mitochondrial membrane runs down the middle of the drawing, the matrix on its left and the intermembrane space on its right, with complexes I, III and IV spanning it, complex II set into its matrix side, ubiquinone within it and cytochrome c on its outer face. The height is reduction potential, on an axis down the left side, and every carrier sits at its own value, so a pair of electrons is seen falling from NADH at −0.32 volts to oxygen at +0.82. Complexes I, III and IV carry 4, 2 and 4 charges across as a pair passes: 10 a pair from NADH, which enters at complex I, and 6 from FADH2, which enters at complex II. One table gives, for each donor, the fall in volts, the free energy released, the charges moved and the pairs delivered; a second gives the charges moved in all, the gradient as a pH difference and as a membrane potential, and ATP made here, which stays at zero whatever is done, because nothing here makes any. Any complex can be blocked with its named inhibitor — rotenone, malonate, antimycin A or cyanide — and the carriers above the block are drawn holding electrons while those below empty, with a sentence naming where the crossover lies. Taking the oxygen away backs the whole chain up in the same way from the bottom, and a last control puts nitrate, fumarate, sulfate or carbon dioxide at the bottom in its place: the fall shortens, and the table gives the most charges it could pay for at 19.3 kilojoules each, a ceiling rather than any organism's count."
- :377: "The last control on Figure 7.3 makes the same substitution, and the ceiling on the charges the fall could move drops with the rung."

**9. Small. FIGURES.md's 7.3 brief describes the old figure.**

Where: FIGURES.md:9, :212, :220–228, :239.

What is wrong: the index row gives aspect 21 / 9 and narrow 4 / 5 (the module has 16 / 10 and 2 / 3). The brief puts the matrix below. The acceptor table and the describe table name `protonsPumped`. The table has no FADH₂ row, and its sulfate row is 0 (finding 3).

Fix (FIGURES.md):
- :9: aspect 16 / 10, narrowAspect 2 / 3.
- :212: "The inner membrane drawn edge-on down the middle of the stage, the matrix on its left and the intermembrane space on its right, with reduction potential as height, …".
- :220–226: the column becomes "`chargesPerPair`, a ceiling"; sulfate's row reads "| sulfate | −0.22 | 19 | 1 | at most 1: 2 × 96.5 × 0.10 = 19.3, one charge's price exactly, before the 19 is rounded; the measured −0.217 V gives 19.9 |"; carbon dioxide's why becomes "15 ÷ 19.3 is less than one". Add a line under the table: "From FADH₂ (+0.03 V): oxygen 6 (the chain's own count), nitrate 3 (75 ÷ 19.3), fumarate 0 (no fall), sulfate and carbon dioxide 0 (uphill; the stage shows 'uphill', finding 4)."
- :228: "The two zeros are the hard case" becomes "Carbon dioxide's zero and sulfate's one are the hard cases", and "pays for less than one proton" becomes "pays for less than one charge (carbon dioxide) or exactly one (sulfate)".
- :239: replace `protonsPumped` with the fields the module reports, `chargesMoved`, `chargesPerPair` and `chargesAreCeiling`, and the ceilings with "7, 3, 1 and 0 from NADH; 3, 0, 0 and 0 from FADH₂".

### 7.4 `fermentation` (6bec50f)

**10. Weak; changes the drawing. "+28 ATP" is drawn under "Chain".**

Where: `src/figures/fermentation.js:684–689` (wide), `:810–817` (narrow). Every state; for example the opening at 1024 px, and the muscle preset at 390 px.

What is wrong: the capsule reads "Mitochondrion", then "Chain" over "O₂ → H₂O", then "+28 ATP per glucose" under them; at 390 px the three sit side by side in one row. Both read as "the chain makes 28 ATP a glucose". Two sections earlier the chapter says the reverse: "The chain makes no ATP. Its product is a gradient" (index.html:460), and Figure 7.3's ATP counter stays at zero (its hint: "The ATP counter on this figure never moves. That is the point of it."). The 28 is the mitochondrion's: the synthase's, plus the cycle's two.

Fix (module): give the number to the mitochondrion, not the chain. Wide: draw "+28 ATP" and "per glucose" directly under the "Mitochondrion" title and above "Chain" (move `:688–689` up). Narrow: put them in the capsule's left cell under "Mitochondrion" (`:810`), and leave "Chain" and "O₂ → H₂O" alone in the middle. If the layout cannot move, change the second line to "per glucose, by the mitochondrion" in both compositions.

**11. Weak. The caption says "the ATP figure stays exactly where it was", and the first ATP rate on the stage jumps.**

Where: index.html:355 (caption). States: oxygen off with no route (stalled), then Lactate.

What is wrong: the stall shows "Made 0.0 ATP/s" in coral and "Per glucose 2 ATP". Pressing Lactate takes "Made" to 4.0 ATP/s at once, because glycolysis restarts. The caption means the per-glucose figure, but "the ATP figure" can as well be "Made", the number that visibly moves. A reader who watches that one sees ATP rise the moment fermentation starts: the belief the figure exists to undo. The stage's own sentence is exact ("ATP per glucose is still 2: the lactate step makes none"), and so is the data-alt ("the ATP-per-glucose readout stays at two").

Fix (chapter page, :355; hint unchanged): "Take the oxygen away and watch what actually runs out. It is not ATP. Then switch on a fermentation and watch glycolysis restart — while ATP per glucose stays at two, because the fermentation step makes none."

**12. Small. The counts and rates are in the figure's own units, and nothing says so.**

Where: `src/figures/fermentation.js:349–350` (the demand stepper, "ATP/s", "4 ATP a second"), `:903–911` (Spent, Made, Glycolysis in glucose/s), `:257` (the "short" sentence's "12 ATP a second"), `:609–611` (the ring's "N empty NAD⁺ of 12").

What is wrong: in the model one disc is 0.04 mmol/L of carrier (module header), and every rate is in discs' worth a second of figure time. Read as printed, "Spent 4 ATP/s", "Glycolysis 0.13 glucose/s" and "12 empty NAD⁺" say that a cell holds twelve carrier molecules and spends four ATP a second. A real cell holds hundreds of millions of carriers. The discs are the brief's deliberate picture of a small pool (FIGURES.md, 7.4), and that works; the units printed beside them are what mislead. Printing the model's 0.04 mmol/L would not help: at that scale the sprinting fibre's 10 a second is 0.4 mmol/L a second, several times slower than the "about two seconds' worth of ATP" §7.7 gives a fibre at full effort (index.html:358, against 5 mmol/L). So the rates are illustrative, not scaled, and the stage should say that rather than print a scale.

Fix (module): one note in `buildA`, after the Glycolysis row, at levels 0 and 1: "Each disc stands for millions of carriers or more, and each ATP or glucose in the rates for as many molecules."

**13. Small. The 50 : 30 : 20 split of the cleared lactate is printed as if measured.**

Where: `src/figures/fermentation.js:124` (FATES), `:930–936` (the clearance table), `:283–284` (the notes). State: muscle preset, demand stepped down to 5, lactate cleared (390 px).

What is wrong: the three fates are printed to two decimals in a fixed ratio. The module header calls the split illustrative; the stage does not, and the prose gives no split ("some … some … some", index.html:360).

Fix (module): CLEAR_NOTE: "In a body the extra lactate is gone within an hour or so of stopping, sooner with gentle exercise. The split between the three is illustrative, and the figure's clock runs far faster." CLEAR_NOTE_SHORT: "In a body it clears within an hour or so, sooner with gentle exercise. The split is illustrative; this clock is far faster."

**14. Small. One press from the opening pairs an ethanol-fermenting cell with a muscle fibre's yield.**

Where: `src/figures/fermentation.js:153` (`orgOf`), `:277–280` (`tissueNote`). State: from the opening (oxygen on, demand 4), press Ethanol.

What is wrong: the title becomes "A cell that can ferment to ethanol", and the table shows "Per glucose 30 ATP" with "With oxygen, about 30 in fast skeletal muscle and 32 in heart and liver." Nothing false is said, since the note names whose 30 it is, but the pairing invites "a yeast gets 30 with oxygen", which the yeast preset's 16 to 20 exists to prevent (prose review, finding 33). The builder's handoff lists this among its simplifications.

Fix (module, `tissueNote`): with no preset and the route at ethanol, level 0–1: "With oxygen, about 30 for a mitochondrion like a fast muscle fibre's; brewer's yeast, whose chain has no complex I, gets 16 to 20." Level 2 and up: "With oxygen, about 30 here; 16 to 20 in yeast."

**15. Small. The data-alt counts two fates of lactate, and ties the clearance to restoring the oxygen.**

Where: index.html:354 (data-alt, last sentence).

What is wrong: the figure counts three fates (oxidised in the fibre; burnt by the heart, slow fibres and brain; sent to the liver), and the data-alt names two, which is how FIGURES.md says the ledger must not read. Under the muscle preset the oxygen is on all along, and the lactate clears when the demand falls to 7 or below; "Restoring the oxygen" describes only the anoxic run.

Fix (chapter page, replacing the data-alt's last sentence): "Once there is oxygen and the demand is low enough for the chain to keep up, the lactate is cleared over a timed run, with counters for how much has been oxidised in the fibre, how much burnt by the heart, slow fibres and brain, and how much sent to the liver, and a ledger shows the liver spending six ATP to rebuild one glucose from two lactate against the two the muscle gained."

**16. Small. FIGURES.md's 7.4 brief describes an older figure.**

Where: FIGURES.md:10, :271, :294, :301; also :7 (7.1's row).

Fix (FIGURES.md):
- :10: narrowAspect 2 / 3, as the module has it (its header gives the reason). :7: 7.1's aspect is 16 / 9, not 21 / 9.
- :271: "some oxidised where it stands, some sent to the liver" becomes "some oxidised where it stands, some burnt by the heart, slow fibres and brain, and some sent to the liver"; the sentence "Those are two of the fates §7.7 names, not the only two — … — so the ledger must not read as if there were two" becomes "Those are the three fates §7.7 names; the split between them is illustrative, and the stage says so."
- :294: "| `lactateOxidised`, `lactateOxidisedElsewhere`, `lactateToLiver` | number | the three fates the ledger counts, mmol/L, in an illustrative 50 : 30 : 20 split |".
- :301: "one column at 2 / 3" in place of "4 / 5".

### 7.2 `krebs` (6a30a4c)

**17. Weak; changes what the figure does. From an 800 px to about an 1150 px window the ring cannot be read, and that window includes the 1024 px the shot gate uses.**

Where: `src/figures/krebs.js:428` (`NARROW_W = 600`, the stage width it re-composes below), `:465–475` (the two compositions) and `:813–821` (the room kept round the ring). The cause is shared with 7.4 (finding 23): `src/styles/components.css:505` gives a stage its narrowAspect only when the viewport is below 800 px. State: the step-3 state (acetyl C2 labelled, three steps taken), light theme. The stage was measured on one page resized in place, and shot at 860, 1024, 1180 and 1280 px.

What is wrong: every chapter figure is `width="wide"`, and below 1400 px a wide figure is the viewport less the rail (layout.css:363–367). So the stage is 480 px wide at an 800 px viewport and 656 px at 1024, and the frame keeps it at 16 / 10. The measured stage and ring radius:
- 800–900 px viewport: a 480×300 to 580×363 stage. The module takes its narrow composition, because the stage is under 600, but that composition was built for a 2 / 3 stage. The ring is 26–31 px in radius. At 860 the eight carbon counts sit on the ring as one cluster. The name key runs through the FADH₂ and NADH tokens, the ATP token overlaps "The label", and there are no centre words.
- 960–1100 px: a 632×395 to 732×458 stage, the wide composition, and a ring of 44–94 px. At 1024 the ring is 56 px. "TURN 1" sits on citrate's carbons, and the step-3 sentence runs across the carbon counts, the step numbers and the ATP token.
- 1180 px (an 812×508 stage): 134 px, and it reads clean. At 1280 px (912×570) it is 180 px.

Nothing the reader is told is false. But in that window the figure's argument cannot be read: the counts, the two CO₂ steps and which carbon leaves. The builder's handoff lists frames at 952, 1052 and 720 px and at phone widths, and says nothing about this window.

Fix. The coordinator chooses, because the second part touches the frame:
- `src/figures/krebs.js:428`: `NARROW_W = 800`, as FIGURES.md:206 already says, so the wide composition never gets a stage narrower than 800 px. It reads clean at 812.
- The narrow composition must then get a tall box wherever it is used. Book-wide (preferred; the frame is locally high-risk, so review it): the frame gives a figure its narrowAspect whenever its stage is below the figure's own narrow width, not only below an 800 px viewport. For example, it reads a `narrowBelow` width from `meta` beside `narrowAspect`, and decides on width alone so the new height cannot flip the choice. At 860 px the stage becomes 540×810, and at 1024 px 656×984. Module-only, if the frame stays: krebs's narrow composition must also read in a 16 / 10 box from 480 to 800 px wide, which it does not now.
- Gate: shoot one viewport in the window (860 px) in `npm run shot` or `npm run narrow`. Nothing shoots it now, and nobody looked at the 1024 px shot closely enough to catch this.
- Acceptance: at 800, 860, 960, 1024 and 1100 px, in the step-3 state, the centre words, counts, step numbers and tokens do not overlap.

**18. Small; changes the drawing. The glucose route draws nothing coming off glycolysis.**

Where: `src/figures/krebs.js:1296` (`{ arrow: 'glycolysis', products: [] }`) and `:1297–1298`. The route's one-line form, which stages up to at least 912 px show instead of the drawing, is at `:1407–1411`: 'Glucose → 2 pyruvate → 2 acetyl-CoA, with 2 CO_2 and 2 NADH'. State: glucose, drawn at 1440 px and as the line at 1024, 1180 and 1280 px.

What is wrong: the link reaction is drawn with its CO₂ and NADH. Glycolysis is drawn with nothing, though it makes 2 ATP and 2 NADH per glucose, and the fuel block's "about 32" counts them (OpenStax 7.2 and 7.3 give both stages' products). In the line, "with 2 CO₂ and 2 NADH" reads as the whole route's products. The drawing also takes "2 pyruvate" to a single acetyl-CoA with one CO₂ and one NADH.

Fix (`src/figures/krebs.js`):
- `:1296`: give the glycolysis arrow its ATP and NADH tokens, as the link reaction has its CO₂ and NADH.
- `:1297–1298`: label the drawn acetyl-CoA "2 acetyl-CoA" (or mark both arrows "per glucose"), so two pyruvate do not become one of each.
- `:1407–1411`: "Glucose → 2 pyruvate, with 2 ATP and 2 NADH → 2 acetyl-CoA, with 2 CO₂ and 2 NADH".

**19. Small. The books count only the acetyl groups' carbon in and the CO₂ out, and their rows just say "Carbons".**

Where: `src/figures/krebs.js:1489–1490` ('Carbons in', 'Carbons out'). States: drain for aspartate, run to the stall (turn 3, with 6 in, 6 out and oxaloacetate at 13 % of its trace); the top-up; the amino-acid fuel.

What is wrong: with a drain on, carbon leaves the ring for biosynthesis. Yet at turn 3 the books still balance, 6 in and 6 out, while oxaloacetate falls to 13 %. The top-up makes oxaloacetate from pyruvate and CO₂, and glutamate's five carbons enter at α-ketoglutarate; neither is counted. The builder's rule, acetyl carbon in and CO₂ out, is a sound accounting, and it is the one the prose uses for a turn. But the row names claim all carbon.

Fix (`src/figures/krebs.js:1489–1490`): "Carbons in as acetyl" and "Carbons out as CO₂". Or, when a drain, the top-up or the amino-acid fuel is on, put a note under the books: "The books count the acetyl groups' carbon and the CO₂; the drain, the top-up and glutamate move carbon they do not count."

**20. Small. "About 20.5" ATP per glutamate is more exact than its own bookkeeping.**

Where: `src/figures/krebs.js:1560` (`about ${y.total}`), fed by the amino-acid entry in FUELS at `:193–210` (outside the ring: NADH 4, FADH₂ 1, ATP −1). State: amino acid, 1440 px.

What is wrong: the arithmetic is right at 2.5 ATP per NADH and 1.5 per FADH₂. That is 7 NADH and 2 FADH₂, with no net ATP once 2 ATP for half of urea's cost are taken off, so 20.5. But crediting the fumarate the urea cycle returns (half an NADH per nitrogen) gives 21.75, which is Lehninger's bookkeeping, and other texts differ again with their P/O ratios. The glucose and palmitate rows, "about 32" and "about 106", are textbook figures. The glutamate row is the figure's own estimate, shown with a decimal.

Fix (`src/figures/krebs.js:1560`): `about ${Math.round(y.total)}`, which shows "about 21" for glutamate, a figure that covers both accountings. Glucose and palmitate are unchanged, and the per-gram row stays 0.14 mol.

**21. Small. The data-alt says "any one intermediate" and "for three turns".**

Where: index.html:178 (origin/ch07), the data-alt. The builder's handoff flagged both, rightly.

What is wrong: the drains take three intermediates (citrate for fat, α-ketoglutarate for glutamate, oxaloacetate for aspartate), not any one. And a label can be followed for as many turns as the reader steps, not only three.

Fix (chapter page, index.html:178):
- "and follow it round for three turns, watching when it starts to leave" becomes "and follow it round, turn by turn, watching when it starts to leave".
- "A drain control removes any one intermediate to a biosynthetic route" becomes "A drain control removes one of three intermediates — citrate, the five-carbon intermediate or oxaloacetate — to a biosynthetic route".

**22. Small. FIGURES.md's 7.2 brief has drifted from the module.**

Where: FIGURES.md:8 (the table row), :206 (the narrow composition) and the `describe()` table in 7.2's block (:179 onward).

Fix (FIGURES.md):
- :8: narrowAspect 2 / 3, as the module has it, not 4 / 5.
- :206: "Below 800 px" stays true once finding 17's first fix lands. If it does not, it becomes 600, as the module has it.
- The `describe()` table gains the 17 fields the module reports that the table lacks: `carbonsOut`, `thisTurn`, `fadh2PerTurn`, `atpPerTurn`, `fadh2Total`, `atpTotal`, `labelReleasedThisTurn`, `labelDrained`, `labelDrainedInto`, `joinRate`, `drainedFrom`, `shortOf`, `fuelMolecule`, `acetylPerFuel`, `atpPerFuel`, `cutsDone` and `refused`. The module's closing comment (krebs.js:1660–1699) gives each one's meaning.

### 7.4 `fermentation` (6bec50f), found while checking 7.2's widths

**23. Weak; changes what the figure does. From an 800 px to about a 1090 px window the NAD pool is drawn over the mitochondrion.**

Where: `src/figures/fermentation.js:113` (`NARROW_W = 720`) and `:317`. The shared cause is `src/styles/components.css:505` (finding 17). State: the opening state, light, at 860 px (a 540×304 stage) and 1024 px (656×370).

What is wrong: the module takes its narrow composition below a 720 px stage: glycolysis, the pool and the chain stacked in one column, built for a 2 / 3 stage. But between 800 px and about 1090 px of viewport, the frame gives it a 16 / 9 box. There the pool's discs are drawn across the mitochondrion bar, over "Chain", "O₂ → H₂O" and "by a shuttle", and a carrier's arrow crosses the key's "loaded NADH". At 1024 px, the width the shot gate uses, the pool's ring sits on the bar. The pool is the figure's argument (index.html:340), so in that window the figure cannot be read. The first pass shot 7.4 at 390 px and at the drive's 952 px stage, and missed this.

Fix: finding 17's frame route. That gives the column its tall box at these widths: 540×810 at 860 px and 656×984 at 1024 px. If the frame stays, `src/figures/fermentation.js` must keep the pool clear of the bar in a 16 / 9 box from 480 to 720 px wide. One way is to keep the wide composition down to a 480 px stage, if it reads there; that was not checked. Acceptance: at 860 and 1024 px the pool, the bar and their words do not overlap.

## Checked and found right

Here "finding n" is this report's. "Prose review finding n" is the 2026-09-22 prose review's (`docs/work/2_rest-of-the-book/reviews/2026-09-22-ch06-ch07-prose.md`).

**7.1 `glycolysis`.**
- The ladder: PEP −61.9, creatine phosphate −43.0, ATP −30.5 and glucose 6-phosphate −13.8 kJ/mol are §5.3's values, and the drive checks each against that table. 1,3-bisphosphoglycerate at about −49, with its dagger ("Not on Section 5.3's table"), is right (Berg −49.4, Lehninger −49.3). Leaving out glucose 1-phosphate is fine: the heading says the rungs come from §5.3, and no step uses it.
- The donor named at each step: ATP at steps 1 and 3, inorganic phosphate at step 6 (the dehydrogenase takes Pi, not ATP), 1,3-bisphosphoglycerate at step 7, PEP at step 10.
- Step 8's "The remaining phosphate moves from carbon 3 to carbon 2" is right as the net change and matches OpenStax 7.2. Nothing says it is the same phosphate group, so the enzyme's 2,3-bisphosphoglycerate route need not be mentioned.
- The prose review's finding 17: AMP is never drawn at ATP's site; no binding site is drawn at all, and the sentences speak of the enzyme's inactive shape. Citrate strengthens ATP's inhibition and AMP relieves it, as in Berg and Lehninger.
- The ledger: net −1 after step 1, −2 after step 3, 0 after step 7, +2 after step 10, with 2 NADH and 2 pyruvate; per fragment, halves. The triose phosphate isomerase knock-out nets 0 ATP, 1 NADH and 1 pyruvate a glucose. Aldolase cuts between carbons 3 and 4, and the carbons and phosphates keep their places through the split.
- "All three domains share only steps 8–10" matches the prose.

**7.2 `krebs`.**
- The label's schedule is computed from the chemistry, not scripted, and it matches the prose review's line 773:
  - the carbonyl carbon (acetyl C1) leaves whole on turn 2;
  - the methyl carbon (acetyl C2) leaves none on turns 1 and 2, then ½, ¼ and ⅛ on turns 3, 4 and 5;
  - oxaloacetate's C1 and C4 leave on turn 1, its C3 on turn 2, and its C2 goes like the methyl carbon.
- The mapping behind the schedule is right (Berg, Lehninger):
  - citrate synthase puts oxaloacetate's C1 on the central carbon's carboxyl;
  - aconitase moves the hydroxyl onto the oxaloacetate-derived arm;
  - isocitrate dehydrogenase removes that carboxyl, and α-ketoglutarate dehydrogenase removes oxaloacetate's C4;
  - succinate shares a label between its two ends.
- No label or sentence says the arriving carbons leave on the turn they arrive. Step 3's "and not one of the two that just arrived" rightly says the opposite.
- The eight steps' words and counts:
  - 6, 6, 5, 4, 4, 4, 4 and 4 carbons;
  - CO₂ and NADH at steps 3 and 4, one ATP at step 5 (where succinate's two alike ends share a label), FADH₂ at step 6 and NADH at step 8;
  - "two carbons in this turn, and two out".
- Per turn: 3 NADH, 1 FADH₂, 1 ATP and 2 CO₂, as in OpenStax 7.3.
- The drains and the top-up:
  - fat draws from citrate, glutamate from α-ketoglutarate and aspartate from oxaloacetate;
  - a label drained with citrate is reported as "exported citrate", which is right: ATP-citrate lyase splits exported citrate in the cytosol into acetyl-CoA for fat and oxaloacetate;
  - the stall reads "short of oxaloacetate for the acetyl group to join";
  - the top-up is pyruvate carboxylation;
  - a label under a drain (27/32 drained, 3/32 released, 1/16 left) agrees with the model's shares.
- The fuels:
  - glucose gives about 32 ATP with the malate–aspartate shuttle ("heart, liver and brain", as index.html:307 and §7.6's table have it), 0.18 mol a gram;
  - palmitate takes seven cuts, each 1 NADH and 1 FADH₂, gives 8 acetyl-CoA, costs 2 ATP to activate, and gives about 106, 0.41 mol a gram;
  - glutamate enters at α-ketoglutarate, and its spare oxaloacetate returns as acetyl-CoA by way of pyruvate, losing a CO₂ (PEP carboxykinase, then pyruvate kinase, with no net ATP). That is 0.14 mol a gram; finding 20 is only about its rounding.
- The strip's "cut n of 7" counts the cuts behind the acetyl group now waiting. So "cut 2 of 7" during turn 1 is right, and turn 8 takes the last cut's second acetyl-CoA.
- The handoff's other points:
  - leaving the top-up's carbon out of "Carbons in" is a sound rule once the rows say so (finding 19);
  - the names α-ketoglutarate, isocitrate and succinyl-CoA are right, and OpenStax's Figure 7.12 names all eight intermediates. They sit beside the chapter's "the five-carbon intermediate" (index.html:188) without conflict, and the page may name it there if the author wants;
  - narrowAspect 2 / 3 is right where the frame applies it, and the 390 px frames read clean. Finding 17 is about where the frame does not apply it.
- index.html:176, the caption and hint at :179, the margin note at :173 (the schedule) and the fuels at :182–188 all match the figure.

**7.3 `respiratory-chain`.**
- The potentials (NADH −0.32, the cycle's FAD +0.03, ubiquinone +0.04, menaquinone −0.07, cytochrome c +0.25, nitrate +0.42, oxygen +0.82 V) match the prose's tables.
- 4, 2 and 4 charges at complexes I, III and IV; 10 a pair from NADH and 6 from the cycle's FADH₂; 19.3 kJ/mol a charge at 200 mV. The ceilings are floor(kJ ÷ 19.3), capped at the oxygen count, and FADH₂'s row applies that rule (6, 3, 0, then uphill twice) instead of copying NADH's.
- The gradient: 0.75 pH units and 150 mV, about 200 mV in all, as §7.5 (index.html:250).
- The crossover sentences for rotenone, antimycin A, cyanide and no oxygen: carriers above the block reduced, those below oxidised, the crossover at the blocked complex, and the gradient running down. Malonate leaves NADH's pairs running and refuses the cycle's FADH₂. No label says "any NADH-linked fuel" (prose review finding 20). index.html:405's "Figure 7.3 runs that experiment" is true.
- Nitrate's "a real nitrate chain in a bacterium moves about 6"; the sulfate and carbon dioxide sentences take prose review finding 8's words; "the same kind of machinery, not any one organism's chain" (prose review finding 8).
- ATP made here is 0 in every state. Complex I's +4 staying drawn under FADH₂ is acceptable, since the table and the sentence say 6.

**7.4 `fermentation`.**
- Glycolysis as steps 1–5 (−2 ATP), step 6 loading the carrier, steps 7–10 (+4 ATP), per glucose.
- The pool: twelve discs, 0.48 mmol/L in the model, "a fraction of a millimole per litre" (index.html:340), filling in about three seconds of figure time.
- The stall is "A cell that cannot ferment" (prose review finding 10), and its sentence names NAD⁺, not ATP, and says glycolysis "cannot make even its two ATP". index.html:352's citation is true.
- Lactate: one enzyme, lactate dehydrogenase. Ethanol: carbon dioxide leaves at the first enzyme, and acetaldehyde takes the electrons at the second. "No ATP from this step" and "from these steps" are scoped to the routes drawn (prose review finding 6), and the counter for the fermentation step read 0 in every state driven.
- ATP per glucose: 2 without oxygen; about 30 with, named as fast skeletal muscle's beside 32 for heart and liver (prose review finding 42); 16 to 20 under the yeast preset, "whose chain has no complex I" (prose review finding 33). The mitochondrion's +28 and +14 to 18 agree with them.
- The ethanol note: per glucose two carbons leave as carbon dioxide for good and four stay in ethanol, which a yeast with oxygen respires once the sugar is gone (prose review finding 7). Ethanol by volume, mmol/L × 46.07 ÷ 789 ÷ 10, is right.
- The muscle preset opens at lactate, with oxygen, at a sprint's demand (prose review finding 10), and "buying rate with yield" matches index.html:358.
- The clearance: "within an hour or so of stopping, sooner with gentle exercise" (prose review finding 30), of the extra lactate, not every trace, and gentle exercise clears it faster in the model too.
- The Cori ledger: muscle −1 glucose, +2 lactate, +2 ATP; liver +1 glucose, −2 lactate, −6 ATP (4 ATP and 2 GTP; Berg 9e §16.4).
- The Crabtree effect drawn as overflow from a small chain is a standard account of yeast's short-term Crabtree effect, the stage sentence is true as worded, and the module header names what it leaves out.
- "By a shuttle": the carriers stop at the mitochondrion's outer edge, so nothing shows NADH crossing the inner membrane, which index.html:304 says it cannot.
- The builder's page notes were checked against origin/ch07: :348, :352, :360, :362 and items.js:1791 are already fixed there. Only the data-alt (finding 15) and FIGURES.md (finding 16) remain.

**All four.**
- Every sentence citing a figure was checked against it: index.html:129 (finding 2), :176 and :179 (true), :232 and :377 (finding 8), and :352 and :405 (true).
- 7.1 and 7.3 read clean at 860 px, inside the window of findings 17 and 23, as they do at 1024 px. Both re-compose by stage width too (below 700 and 600 px), but their narrow compositions fit the wide box.
- No stage sentence repeats a prose sentence the review corrected (checked against the prose review's findings 6, 7, 8, 10, 17, 20, 30, 33 and 42).
- Units match the prose (V, mV, pH units, kJ/mol, mmol/L, mol ATP a gram), except 7.4's rates (finding 12).
- items.js has no figure tasks, so no item grades a figure field.

## Could not verify

- Whether malonate inhibits fumarate reductase, which 7.3 implies when malonate is chosen with fumarate at the bottom. It is plausible, since malonate is a dicarboxylate like succinate and fumarate, but I found no source. No change is proposed.
- Whether figures in chapters 1–6 break in the 800–1150 px window of findings 17 and 23. Every figure there is `width="wide"` too, and several re-compose by stage width (for example `atp3d` below 700 px and `calvin-cycle` below 600). None was checked, because they are outside this review. The frame fix in finding 17 would change their boxes in that window, so each would need a look there.

