# Review 1 — chapter 1 biology, prose and figure consistency

Reviewer: an independent read-only Claude subagent, spawned by the integration owner on 2026-09-10 with no edit capability and a fixed brief (accuracy at first-year level against Campbell and OpenStax, consistency between prose, captions, alt text, glossary and what the figures draw or compute, the checks, the sort, the writing, the text alternatives). A first reviewer with the same brief was lost when the host process exited on 2026-09-09 and left no report. The codex lane in `../fleet/docs/skills/multi-cli-review.md` was not used for this round: the review target is prose and figure data rather than code, and the two-CLI mechanics add nothing to that question.

Target: the uncommitted integrated tree of 2026-09-10 (every figure landed, gates green), the state captured by the first commit less the fixes below.

## Verdict

Accept with fixes. Six statements wrong as written, all one-line; the rest polish. Coverage the reviewer confirmed correct: the seven properties, the homeostasis loop and the model's numbers, all twelve levels and their sizes, all seventeen scale sizes and the three instrument limits, the cell-theory dates, the organelle table against the palette roles, the DNA geometry and the genome numbers, the 10% rule, Darwin and Wallace, the tree cards, Redi and the swan-neck logic, all five checks, all nine sort items, British spelling.

## Findings and disposition

Every finding was accepted and applied in the same session; the numbers are the reviewer's.

| # | Severity | Finding | Applied fix |
|---|---|---|---|
| 1 | MUST | "200 nanometres, the wavelength of visible light" | "half the wavelength of visible light … with an ordinary light microscope" |
| 2 | MUST | 3.1 billion bp and 20,000 genes "on 46 chromosomes" | "on 23 chromosomes, and every cell of yours carries two sets, 46 in all" |
| 3 | MUST | scale card "a hundred trillion cells" against the prose's 37 trillion | card now "some 37 trillion cells" |
| 4 | MUST | levels alt "an oxygen molecule" where the figure draws water | "a water molecule" |
| 5 | MUST | cell card "N in this model" counted label anchors (Golgi "2", rough ER "20") | count shown only for mitochondria, lysosomes, peroxisomes, vesicles and the ribosome line |
| 6 | MUST | tree caption "two partnerships that made eukaryotes" | "the first made eukaryotes, the second made plants" |
| 7 | SHOULD | "the inside of the cell had to wait for the electron microscope, in the 1930s" | fine structure; invented 1930s, turned on cells 1940s |
| 8 | SHOULD | ribosome card "by the million in every cell" | "tens of thousands in a bacterium, millions in one of your cells" |
| 9 | SHOULD | caption claims feedback-off drifts "the same disturbance", but a fever with feedback off does nothing | caption and alt now say a plunge or a race drifts, and a fever cannot start |
| 10 | SHOULD | model speed unstated | "runs far faster than a body does" added |
| 11 | SHOULD | "both partners are still there in your cells and in every leaf" | mitochondrion in your cells, chloroplast in every leaf |
| 12 | SHOULD | "archaean" against the figure's "archaeon" | "archaeon" |
| 13 | SHOULD | prose returns carbon by breathing; figure only through soil | caption names both routes |
| 14 | SHOULD | "colours match the figure" but the table has no colours | sentence cut to the figure's colours staying the same |
| 15 | SHOULD | "In 1859" | "Between 1859 and 1861" |
| 16 | SHOULD | pond "200 times magnification", "0.5 mm across", "circular" against drawn sizes | caption and alt say "not to scale"; chip now "pond water · not to scale" |
| 17 | SHOULD | candle "does not maintain itself" | "regulates nothing about itself" |
| 18 | SHOULD | borderline list omits the red blood cell the sort includes | added |
| 19 | SHOULD | chloroplast card omits red algae | added |
| 20 | SHOULD | animals' nearest relatives ordered fungi first | choanoflagellates first |
| 21 | SHOULD | "deepest branches are the three domains" against a two-way deepest split | reworded to the split and the three groups |
| 22 | SHOULD | glossary theory "never contradicted by a careful test" | "has survived every careful test so far" |
| 23 | SHOULD | glossary endosymbiosis "ancestral eukaryotic cell" | "ancestral cells" |
| 24 | SHOULD | four writing spots | all four reworded; Figure 1.9 stays cited |
| 25 | SHOULD | "every tick" against minor ticks; alt lists 15 of 17 markers | "every labelled tick"; frog's egg and paramecium added |
| 26 | SHOULD | 1000 × 20 µm is 2 cm, a thumbnail | "thumbnail" in prose and card |
| 27 | SHOULD | "leaving a flask unboiled" when Boil boils both | "the flasks" |
| 28 | SHOULD | "a mule cannot have offspring" | "sterile, with vanishingly rare exceptions" |
| 29 | SHOULD | "toward" in a British-spelled chapter (6 in the prose, 1 in the glossary) | "towards" |
| 30 | SHOULD | frame's `role="img"` on the mount hides the figure's controls from screen readers | `role="group"` with the same label |

## What the round changed about the gates

Nothing: none of the thirty findings is a class a static check could hold, and the content checker's rules were confirmed as they stand. The review is recorded here as the check for the prose, which `docs/learning/gate-proofs.md` names as the bound of `npm run check`.

## Re-check after the fixes

`npm run check`: 3 pages pass, 9 figures, 31 glossary entries. `npm run unit`: 24 of 24. The full chain was re-run on the fixed tree before the commit; the result is in `plan.md`.
