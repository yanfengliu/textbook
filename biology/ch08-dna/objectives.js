// Chapter 8's learning objectives: the claims a reader should be able to make when they have finished
// it. Same contract as chapters 1 to 7 (docs/design/adaptive.md): mastery is tracked per objective,
// every question names the objective it tests, and the prerequisite graph is what lets the study queue
// work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// This chapter opens Unit II, and its foundation is in the two sections that promised it: §1.5 said life
// runs on information and gave the pairing rule, and §2.8 built the nucleotide, the backbone with a
// direction, and the rung of weak bonds. Most of the graph's external weight rests there. The rest comes
// from where the chemistry of copying and keeping DNA reaches back: chapter 3 for the cells it happens
// in and the instruments it was seen with, chapter 5 for the enzymes and the energy, chapter 6 for the
// ultraviolet photon, chapter 7 for the reactive oxygen. Fifty-five edges name thirty-two objectives of
// chapters 1 to 7.
//
// Chapter 4 contributes no edge, and that is a finding rather than an omission. The one place this
// chapter touches a membrane is a phage injecting its DNA (§8.1), and a reader who cannot predict where
// Hershey and Chase's labels went is missing what the labels mark, not why DNA cannot cross a bilayer by
// itself. An edge to `ion-barrier` would send that reader to the wrong section.
//
// For each external edge, what a reader who failed the objective is missing:
//
// From chapter 1, which made the promises:
//   `dna-structure`        — the helix itself, which §8.2 derives from a photograph and §8.4 has to unwind;
//                            a reader who cannot picture it cannot read Franklin's measurements as a shape
//   `complementarity`      — the pairing rule; Chargaff's ratios (§8.2), templates (§8.3), mismatch repair
//                            and excision repair (§8.5) are all that rule put to work
//   `gene-genome`          — the sizes: 3.1 billion pairs, 46 chromosomes, 4.6 million in E. coli; every
//                            piece of arithmetic in §8.4, §8.5, §8.6 and §8.8 starts from them
//   `cell-scale`           — how big a cell is, which §8.6's packing problem is measured against
//   `controlled-experiment`— Griffith's four injections are three controls and one test (§8.1)
//   `testing-not-proving`  — §8.1's two experiments, §8.3's elimination and §8.8's argument over function
//                            are all about what a result rules out rather than what it proves
//   `natural-selection`    — why broken transposable elements accumulate and harmful insertions do not,
//                            and what "conserved" means as a test of function (§8.8)
//
// From chapter 2, which built the molecule:
//   `nucleotide-parts`     — phosphate in every nucleotide and nitrogen in every base (§8.1, §8.3), and the
//                            direction of the chain that §8.2 names as 5′ and 3′
//   `dna-vs-rna`           — two hydrogen bonds against three (§8.2); why a primer made of RNA can be told
//                            from DNA (§8.4); uracil for thymine (§8.5); the RNA template of telomerase (§8.7)
//   `four-classes`         — protein and nucleic acid as two of four classes, with twenty monomers against
//                            four, which is why protein was the favoured candidate (§8.1)
//   `amino-acid-structure` — twenty side chains, and the positively charged ones that let a histone bind
//                            any DNA (§8.6)
//   `functional-groups`    — the sulfhydryl that puts sulfur in protein and not in DNA (§8.1); the amino
//                            group a cytosine loses and the methyl group that makes uracil thymine (§8.5)
//   `element-identity`     — what an isotope is: the same element, told apart by its neutrons, which both
//                            Hershey and Chase (§8.1) and Meselson and Stahl (§8.3) depend on
//   `isomers`              — the tautomers of §8.2 are structural isomers, and the wrong one breaks the pairing
//   `condensation-hydrolysis` — the backbone bond is a condensation's bond made by another route (§8.4)
//   `weak-bonds-matter`    — a helicase breaks the rungs a few at a time (§8.4), and a polymerase judges a
//                            pair by more than its hydrogen bonds because those differ so little (§8.5)
//   `bond-types`           — histones hold DNA by ionic attraction, charge against charge (§8.6)
//
// From chapter 3, where the cells and the instruments are:
//   `prokaryote-parts`     — the capsule, which is the whole difference between Griffith's two strains
//   `abbe-limit`           — why X-rays, and why a wavelength decides what can be measured (§8.2)
//   `em-tradeoff`          — the 30 nm fibre is a question about what preparing a sample for an electron
//                            microscope does to it (§8.6)
//   `nucleoid-plasmid`     — the bacterial chromosome is a circle in a nucleoid, which is the comparison
//                            §8.6 makes and the reason §8.7's problem does not arise in a bacterium
//   `bacteria-archaea`     — §3.3 said archaea's information machinery, histones included, resembles ours
//   `organelle-genomes`    — mitochondrial DNA has no histones (§8.6)
//
// From chapter 5, which set up the enzymes and the energy:
//   `active-site`          — Avery's argument rests on each enzyme handling its own substrate (§8.1), and a
//                            polymerase's choice of nucleotide is induced fit around a pair (§8.5)
//   `drugs-as-inhibitors`  — a chain terminator is taken for a substrate and stops the enzyme's product (§8.4)
//   `coupling-principle`   — two reactions added, the second paying for the first (§8.4)
//   `concentrations-decide`— removing pyrophosphate is what pulls each addition forward (§8.4)
//   `spontaneous-not-fast` — DNA's decay in water is downhill and slow, and six billion targets make slow
//                            into thousands of times a day (§8.5)
//   `pathway-blocked`      — reading a disease from the missing enzyme, which the repair sort asks for (§8.5)
//
// From chapter 6, for the photon:
//   `why-pigments-absorb`  — the bases' small rings absorb in the ultraviolet, near 260 nm (§8.3, §8.5)
//   `photon-energy`        — an ultraviolet photon carries enough to drive a reaction in the base (§8.5)
//
// From chapter 7, for the oxygen:
//   `oxygen-is-the-acceptor` — §7.4 is where electrons leaking from the chain make superoxide, the source of
//                              the oxidative damage in §8.5's table
//
// Four figures, at the reduced scope chapter 6 shipped with (docs/policies/local-rules.md, "The usage
// allowance is the budget"): `fig-helix-lab` (§8.2), `fig-meselson-stahl` (§8.3), `fig-fork` (§8.4) and
// `fig-telomere` (§8.7). The four cut were `fig-genetic-material` (§8.1), `fig-fidelity` (§8.5),
// `fig-nucleosome` (§8.6) and `fig-genome` (§8.8); the twenty-two objectives they taught name no figure
// (`figures: []`), and each is taught by its section's prose and tables. FIGURES.md says what each
// cut figure's section carries now.
//
// Inside the chapter the graph runs in the order the prose argues — the evidence, the structure, copying,
// the chemistry, the checking, the packing, the ends and the contents — and no edge points forward in
// the text. Two reach back across sections, and each is a claim about what the later idea is built on:
// `why-5-to-3` (§8.5) rests on `pyrophosphate-pull` (§8.4), because §8.4 states the one-way rule and
// §8.5 explains it; and `telomerase` (§8.7) rests on `excision-repair` (§8.5), because a telomere is
// what stops an end being treated as the double-strand break that objective describes.
export const OBJECTIVES = [
  // ---- 8.1 The genes were in the duller molecule ----
  {
    id: 'protein-was-favoured',
    statement: 'Explain why most biologists before the 1940s expected genes to be made of protein, and say what was believed about DNA that made it seem unable to carry them.',
    prereqs: ['four-classes', 'amino-acid-structure', 'nucleotide-parts'],
    teaches: { sections: ['evidence'], figures: [] },
    level: 'explain',
  },
  {
    id: 'transformation',
    statement: 'Describe Griffith\'s experiment with two forms of pneumococcus, and say what transformation showed about heredity and what it left unexplained.',
    prereqs: ['controlled-experiment', 'prokaryote-parts'],
    teaches: { sections: ['evidence'], figures: [] },
    level: 'explain',
  },
  {
    id: 'avery-enzymes',
    statement: 'Predict what an enzyme that destroys protein, RNA or DNA does to the activity of a transforming extract, and explain why the pattern of results points at DNA.',
    prereqs: ['transformation', 'active-site'],
    teaches: { sections: ['evidence'], figures: [] },
    level: 'apply',
  },
  {
    id: 'hershey-chase',
    statement: 'Say which radioactive isotope labels a bacteriophage\'s protein and which its DNA, and why; and predict where each label ends up after infected cells are blended and spun.',
    prereqs: ['element-identity', 'functional-groups', 'nucleotide-parts'],
    teaches: { sections: ['evidence'], figures: [] },
    level: 'apply',
  },
  {
    id: 'evidence-weighed',
    statement: 'Explain what doubt each of the two decisive experiments left open, and why the two together were stronger than either alone.',
    prereqs: ['avery-enzymes', 'hershey-chase', 'testing-not-proving'],
    teaches: { sections: ['evidence'], figures: [] },
    level: 'explain',
  },

  // ---- 8.2 The helix was measured before it was built ----
  {
    id: 'chargaff-rules',
    // Two sections: the variation between species is told in §8.1, where it answers the tetranucleotide
    // hypothesis, and the equalities in §8.2, where the pairing explains them.
    statement: 'Use Chargaff\'s rules to work out the base composition of a double-stranded DNA from the share of one base, and say what the variation between species ruled out.',
    prereqs: ['complementarity', 'protein-was-favoured'],
    teaches: { sections: ['evidence', 'structure'], figures: ['fig-helix-lab'] },
    level: 'apply',
  },
  {
    id: 'diffraction-reading',
    statement: 'Say what an X-ray diffraction pattern of DNA fibres measures, and read from Franklin\'s photograph that the molecule is a helix, how wide it is, how far it rises in one turn and how far apart its bases are stacked.',
    prereqs: ['abbe-limit', 'dna-structure'],
    teaches: { sections: ['structure'], figures: ['fig-helix-lab'] },
    level: 'explain',
  },
  {
    id: 'antiparallel',
    statement: 'Say what the 5′ and 3′ ends of a strand are, explain what it means that the two strands of the helix are antiparallel, and say which measurement required it.',
    prereqs: ['nucleotide-parts', 'diffraction-reading'],
    teaches: { sections: ['structure'], figures: ['fig-helix-lab'] },
    level: 'explain',
  },
  {
    id: 'pairing-geometry',
    statement: 'Explain why only adenine–thymine and guanine–cytosine pairs fit inside the helix, using the sizes of purines and pyrimidines, their hydrogen bonds and the forms the bases take.',
    prereqs: ['chargaff-rules', 'dna-vs-rna', 'isomers'],
    teaches: { sections: ['structure'], figures: ['fig-helix-lab'] },
    level: 'explain',
  },
  {
    id: 'franklin-contribution',
    statement: 'Say which features of the double-helix model were measured in Rosalind Franklin\'s laboratory, how the measurements reached Watson and Crick, and what the two of them added.',
    prereqs: ['diffraction-reading', 'antiparallel', 'pairing-geometry'],
    teaches: { sections: ['structure'], figures: ['fig-helix-lab'] },
    level: 'explain',
  },

  // ---- 8.3 The structure says how it is copied ----
  {
    id: 'template-principle',
    statement: 'Explain why the structure of DNA suggested how it is copied, and say what it means for each strand to be a template.',
    prereqs: ['complementarity', 'pairing-geometry'],
    teaches: { sections: ['copying'], figures: ['fig-meselson-stahl'] },
    level: 'explain',
  },
  {
    id: 'three-models',
    statement: 'Describe the semiconservative, conservative and dispersive schemes of copying by what each predicts about old and new strands after one round of copying and after two.',
    prereqs: ['template-principle'],
    teaches: { sections: ['copying'], figures: ['fig-meselson-stahl'] },
    level: 'explain',
  },
  {
    id: 'density-labelling',
    statement: 'Explain how growing bacteria on heavy nitrogen made old DNA distinguishable from new, and how density-gradient centrifugation separates molecules that differ only in their isotopes.',
    prereqs: ['element-identity', 'nucleotide-parts'],
    teaches: { sections: ['copying'], figures: ['fig-meselson-stahl'] },
    level: 'explain',
  },
  {
    id: 'meselson-stahl-result',
    statement: 'Predict the bands a density gradient shows after each generation under each scheme, and say which observation ruled out each alternative.',
    prereqs: ['three-models', 'density-labelling', 'testing-not-proving'],
    teaches: { sections: ['copying'], figures: ['fig-meselson-stahl'] },
    level: 'apply',
  },

  // ---- 8.4 Copying runs one way, and the strands do not ----
  {
    id: 'polymerase-requirements',
    statement: 'Name what DNA polymerase needs to add a nucleotide to a strand — a template, a primer ending in a free 3′ hydroxyl, and the four nucleoside triphosphates — and predict what a nucleotide lacking the 3′ hydroxyl does to a growing strand.',
    prereqs: ['antiparallel', 'template-principle', 'drugs-as-inhibitors'],
    teaches: { sections: ['fork'], figures: ['fig-fork'] },
    level: 'apply',
  },
  {
    id: 'pyrophosphate-pull',
    statement: 'Explain where the energy to join a nucleotide to a strand comes from, and why splitting the pyrophosphate that is released makes the addition one-way.',
    prereqs: ['polymerase-requirements', 'condensation-hydrolysis', 'coupling-principle', 'concentrations-decide'],
    teaches: { sections: ['fork'], figures: ['fig-fork'] },
    level: 'explain',
  },
  {
    id: 'primer-needed',
    statement: 'Explain why every new strand has to begin on a primer, say what makes the primer and what it is made of, and say what becomes of it afterwards.',
    prereqs: ['polymerase-requirements', 'dna-vs-rna'],
    teaches: { sections: ['fork'], figures: ['fig-fork'] },
    level: 'explain',
  },
  {
    id: 'lagging-strand',
    statement: 'Explain why one new strand at a fork is made continuously and the other in short fragments, deriving it from the two facts that force it, and describe the experiment that found the fragments.',
    prereqs: ['antiparallel', 'polymerase-requirements', 'primer-needed'],
    teaches: { sections: ['fork'], figures: ['fig-fork'] },
    level: 'explain',
  },
  {
    id: 'fork-machinery',
    statement: 'Name the proteins at a replication fork — helicase, single-strand binding protein, topoisomerase, primase, polymerase and ligase — say what each does, and explain why the helix ahead of the fork has to be cut.',
    prereqs: ['lagging-strand', 'dna-structure', 'weak-bonds-matter'],
    teaches: { sections: ['fork'], figures: ['fig-fork'] },
    level: 'recall',
  },
  {
    id: 'origins-arithmetic',
    statement: 'Work out how long one pair of forks would take to copy a chromosome of a given length at a given speed, and use the answer to explain why a bacterium manages with one origin while a human cell uses tens of thousands.',
    prereqs: ['fork-machinery', 'gene-genome'],
    teaches: { sections: ['fork'], figures: ['fig-fork'] },
    level: 'apply',
  },

  // ---- 8.5 The archive is kept by checking it ----
  {
    id: 'base-selection',
    statement: 'Explain how a polymerase picks the right nucleotide far more reliably than the hydrogen bonds of a pair alone could, from the shape its active site closes around.',
    prereqs: ['active-site', 'pairing-geometry', 'weak-bonds-matter'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'explain',
  },
  {
    id: 'proofreading',
    statement: 'Explain how a polymerase removes a nucleotide it has just added wrongly, and say roughly how much that improves the error rate.',
    prereqs: ['base-selection', 'polymerase-requirements'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'explain',
  },
  {
    id: 'mismatch-repair',
    statement: 'Explain how a wrong pair left behind by the polymerase is found after copying, and how the repair system tells which strand is the new one.',
    prereqs: ['proofreading', 'complementarity'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'explain',
  },
  {
    id: 'one-in-a-billion',
    statement: 'Combine the error rates of the three checks into one, say what the overall rate is a rate per, and work out how many new errors one copying of a genome of a given size leaves in each daughter cell.',
    prereqs: ['base-selection', 'proofreading', 'mismatch-repair', 'gene-genome'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'apply',
  },
  {
    id: 'why-5-to-3',
    statement: 'Explain why every DNA polymerase grows a strand at its 3′ end, what would become of proofreading if a strand grew at the other end, and why the primers are made of RNA.',
    prereqs: ['proofreading', 'pyrophosphate-pull'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'explain',
  },
  {
    id: 'dna-damage',
    statement: 'Name the commonest kinds of damage DNA suffers in a living cell — lost bases, deaminated bases, oxidised bases, ultraviolet dimers and breaks through both strands — say roughly how often the kinds that do not depend on sunlight happen in one human cell, and say where each kind comes from.',
    prereqs: ['spontaneous-not-fast', 'why-pigments-absorb', 'photon-energy', 'oxygen-is-the-acceptor'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'recall',
  },
  {
    id: 'excision-repair',
    statement: 'Explain how a damaged stretch of one strand is cut out and rebuilt from the other, distinguish repairing one base from repairing damage that distorts the helix, and say why a break through both strands cannot be mended that way.',
    prereqs: ['dna-damage', 'complementarity'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'explain',
  },
  {
    id: 'thymine-not-uracil',
    statement: 'Explain why DNA carries thymine rather than uracil, using what happens when a cytosine loses its amino group, and say why methylated cytosines are places where mutations are unusually common.',
    prereqs: ['dna-vs-rna', 'functional-groups', 'excision-repair'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'explain',
  },
  {
    id: 'repair-choice',
    // The sort at the end of §8.5 asks for exactly this, which is why it is one objective and one section,
    // as chapter 7's `diagnose-respiration` is.
    statement: 'Decide which system deals with a given mistake or piece of damage — proofreading, mismatch repair, base excision repair, nucleotide excision repair or double-strand break repair — and predict what a person who lacks it suffers.',
    prereqs: ['proofreading', 'mismatch-repair', 'excision-repair', 'pathway-blocked'],
    teaches: { sections: ['fidelity'], figures: [] },
    level: 'apply',
  },

  // ---- 8.6 Two metres, wound on spools ----
  {
    id: 'packing-problem',
    statement: 'Work out how long the DNA of one human cell would be if it were stretched out, and compare it with the nucleus that holds it and with a bacterium\'s DNA in its cell.',
    prereqs: ['gene-genome', 'diffraction-reading', 'cell-scale'],
    teaches: { sections: ['packing'], figures: [] },
    level: 'apply',
  },
  {
    id: 'nucleosome',
    statement: 'Describe a nucleosome — the eight histones, the length of DNA wound round them and the linker between — and explain why histones can bind any DNA whatever its sequence.',
    prereqs: ['packing-problem', 'amino-acid-structure', 'bond-types'],
    teaches: { sections: ['packing'], figures: [] },
    level: 'explain',
  },
  {
    id: 'packing-levels',
    statement: 'Put the levels of packing in order from the double helix to a chromosome at division, say which are established and which are still argued over, and say which kind of chromatin holds most of the genes being read and what happens to nucleosomes when the DNA is copied.',
    prereqs: ['nucleosome', 'em-tradeoff'],
    teaches: { sections: ['packing'], figures: [] },
    level: 'explain',
  },
  {
    id: 'packing-compared',
    statement: 'Compare how a bacterium, an archaeon, a human nucleus and a mitochondrion package their DNA, and say what the comparison suggests about where histones came from.',
    prereqs: ['nucleosome', 'nucleoid-plasmid', 'bacteria-archaea', 'organelle-genomes'],
    teaches: { sections: ['packing'], figures: [] },
    level: 'explain',
  },

  // ---- 8.7 A linear chromosome cannot copy its own ends ----
  {
    id: 'end-replication-problem',
    statement: 'Explain why the lagging strand at the very end of a linear chromosome cannot be finished, and why a circular chromosome has no such problem.',
    prereqs: ['lagging-strand', 'primer-needed', 'nucleoid-plasmid'],
    teaches: { sections: ['telomeres'], figures: ['fig-telomere'] },
    level: 'explain',
  },
  {
    id: 'telomerase',
    statement: 'Describe what a telomere is made of and what it protects a chromosome end from, and explain how telomerase lengthens it using a template it carries.',
    prereqs: ['end-replication-problem', 'excision-repair', 'template-principle', 'dna-vs-rna'],
    teaches: { sections: ['telomeres'], figures: ['fig-telomere'] },
    level: 'explain',
  },
  {
    id: 'divisions-counted',
    statement: 'Predict how many times a cell can divide from its telomere length, the loss at each division and the length at which it stops, and explain what a cancer cell has to do to escape the limit.',
    prereqs: ['telomerase', 'end-replication-problem'],
    teaches: { sections: ['telomeres'], figures: ['fig-telomere'] },
    level: 'apply',
  },

  // ---- 8.8 Most of a genome is not genes ----
  {
    id: 'genome-composition',
    statement: 'Say roughly what fraction of the human genome codes for protein, and name the main kinds of sequence that make up the rest.',
    prereqs: ['gene-genome'],
    teaches: { sections: ['genome'], figures: [] },
    level: 'recall',
  },
  {
    id: 'transposable-elements',
    statement: 'Explain how a transposable element spreads through a genome, and why most of the copies in the human genome are broken remains that can no longer move.',
    prereqs: ['genome-composition', 'natural-selection', 'telomerase'],
    teaches: { sections: ['genome'], figures: [] },
    level: 'explain',
  },
  {
    id: 'c-value-paradox',
    statement: 'Explain why the amount of DNA in a genome does not follow the complexity of the organism, and use two genomes of very different size to say where the difference lies.',
    prereqs: ['transposable-elements', 'gene-genome'],
    teaches: { sections: ['genome'], figures: [] },
    level: 'apply',
  },
  {
    id: 'junk-dna-debate',
    statement: 'Explain why "codes for protein", "conserved by selection" and "biochemically active" give very different answers to how much of the genome is functional, and say what the word "junk" does and does not claim.',
    prereqs: ['genome-composition', 'natural-selection', 'testing-not-proving'],
    teaches: { sections: ['genome'], figures: [] },
    level: 'explain',
  },
];
