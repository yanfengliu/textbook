// Chapter 7's learning objectives: the claims a reader should be able to make when they have finished
// it. Same contract as chapters 1 to 6 (docs/design/adaptive.md): mastery is tracked per objective,
// every question names the objective it tests, and the prerequisite graph is what lets the study queue
// work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// Four of the eight figures this chapter was planned with were cut on 2026-09-24, as chapter 6's were,
// and the chapter is reviewed with questions rather than figure tasks: respiration-tour (§7.1),
// atp-synthase (§7.5), yield-ledger (§7.6) and uncoupler-bench (§7.8). The objectives those four taught
// are unchanged and are still taught by their sections; they now name no figure (`figures: []`), which
// is what npm run check accepts: it requires every objective to name a section, and every figure an
// objective does name to exist (tools/check-content.js, checkChapterData). The rest name only figures
// that are still on the page: fig-glycolysis (7.1), fig-krebs (7.2), fig-chain (7.3), fig-fermentation
// (7.4). Three objectives moved onto fig-chain rather than to nothing, because its brief carries a field
// that grades them: `proton-motive-force` (it reports the gradient as a pH difference and as a voltage),
// `diagnose-respiration` (its inhibitors and its oxygen switch are two of the sort's four bins), and
// `anaerobic-respiration` (its acceptor control, added on the review's finding 17).
//
// This chapter is where the unit's debts are paid, so the graph reaches out further than any other in the
// book: fifty-one edges name thirty-eight objectives of chapters 1 to 6. Chapter 1 promised that energy
// flows while matter cycles; chapter 2 built the bonds and the electronegativity; chapter 3 said a
// mitochondrion was once a bacterium and folded its inner membrane for a reason; chapter 4 charged a
// gradient and said chapter 7 would spend it; chapter 5 set up redox, the carriers and ATP and
// deliberately did not spend them; chapter 6 tells the first half of electron transport and chemiosmosis,
// and this chapter tells the mitochondrial half rather than telling either twice.
//
// For each external edge, what a reader who failed the objective is missing:
//
// From chapter 1, because this is the mechanism under two of its sections:
//   `three-domains`        — §7.2's argument is that some version of glycolysis is in all three of them,
//                            which says nothing to a reader who does not know there are three or how far
//                            apart they are
//   `hypothesis-vs-theory` — §7.5 is the chapter's one piece of history told as method: Mitchell proposed
//                            something that could have been shown false, and a reader who cannot tell a
//                            hypothesis from a settled theory cannot see what was at stake
//   `homeostasis`          — §7.8's brown fat is a heat source under thermal control, which is §1.2's loop
//   `feedback-direction`   — and predicting when that effector fires is §1.2's question exactly
//
// From chapter 2, because every claim here is a claim about bonds, electrons and protons:
//   `functional-groups`       — the acetyl group rides on a sulfur atom in §7.3, and what a thioester is
//                               worth is the reason the link reaction is irreversible
//   `condensation-hydrolysis` — a fat or a protein is taken apart into monomers before any of §7.3's
//                               pathways can have it, which is §2.6's reaction
//   `ph-scale`                — §7.5's proton-motive force is partly a pH difference, and a reader who
//                               cannot read a pH difference as a concentration ratio cannot price it;
//                               §7.7 needs it again to say what "lactic acid" is at blood pH
//
// From chapter 3, because the chapter happens inside an organelle that chapter described:
//   `organelle-architecture`  — §7.1 puts each stage in a compartment, and the compartments are §3.5's
//   `sav-arithmetic`          — why the inner membrane is folded at all (§7.1) is §3.2's ratio
//   `endosymbiosis-evidence`  — §7.2's point that glycolysis is outside the mitochondrion is only
//                               interesting to a reader who knows the mitochondrion arrived later
//   `motor-direction`         — §7.5's synthase is a rotary motor, and §3.6 is where a protein first moved
//
// From chapter 4, which charged the battery this chapter spends:
//   `membrane-proteins`        — the chain is four integral complexes and two mobile carriers (§7.4)
//   `proton-pump`              — §4.6 named the machine and said chapter 7 would be built on one (§7.4)
//   `electrochemical-gradient` — the proton-motive force is one of these, with two terms (§7.5)
//   `membrane-potential`       — and most of it is the voltage term, which §4.7 is about (§7.5)
//   `gradient-energy`          — §4.7 worked out what one ion falling is worth; §7.5 does it for a proton
//   `ion-barrier`              — why a proton cannot simply come back through the lipid (§7.5), and why
//                                NADH made in the cytosol cannot get into the matrix (§7.6)
//   `bilayer-properties`       — a bilayer seals itself, which is why an intact vesicle is the normal case
//                                and a torn one is the experiment (§7.5)
//   `pump-cycle`               — the synthase is that cycle run backwards, and §4.6 is where the two
//                                shapes and the phosphate first appear (§7.5)
//
// From chapter 5, which set up everything this chapter spends:
//   `catabolism-anabolism`  — respiration is the catabolic half, and §7.7's Cori cycle is the other one
//   `redox-basics`          — every stage is a redox reaction and nothing here is readable without it
//   `why-electrons-fall`    — the whole chapter is one fall, and §7.4 measures it
//   `electron-carriers`     — the carriers are §5.8's, and §7.1's argument is §5.8's made concrete
//   `second-law-life`       — why the heat a flame gives is useless (§7.1) and where the rest goes (§7.6)
//   `atp-structure`         — what is being made (§7.2)
//   `shared-intermediate`   — §7.2 has one and §7.5 deliberately has none, which is the surprise
//   `not-high-energy-bond`  — §7.2's substrate-level phosphorylation is where that correction bites
//   `feedback-inhibition`   — §7.2's committed step, and §7.8's respiratory control
//   `pathway-blocked`       — §7.3's drained intermediate is §5.8's missing enzyme from the other side
//   `pump-efficiency`       — §5.4 found the pump working at nine-tenths; §7.5 finds the synthase
//                             reversible for the same reason
//   `concentrations-decide` — which way the synthase runs is decided by a ratio, not by the machine
//   `atp-cellular-value`    — §7.6's efficiency sum needs what an ATP is actually worth
//   `inhibition-types`      — §7.8's poisons are §5.6's three kinds, on named targets
//
// From chapter 6, which owns the first telling of electron transport and chemiosmosis:
//   `electron-path`        — §6.4 traces an electron along a chain in a membrane; §7.4 traces the other
//                            one, and does not re-teach what a chain is
//   `atmosphere-changed`   — §7.4's terminal acceptor was put into the air by §6.7's enzyme failing to
//                            tell two gases apart; a reader who has not got that reads oxygen as given
//   `thylakoid-gradient`   — §6.5 prices a proton gradient that is almost all pH; §7.5's is mostly
//                            voltage, and the contrast is the point
//   `photophosphorylation` — §6.5 says ATP synthase makes ATP from a gradient; §7.5 says how the rotor
//                            does it, and cites §6.5 rather than repeating it
//   `acid-bath`            — §6.5 has Jagendorf and Uribe making ATP with no chain at all; §7.5's
//                            evidence section rests on that experiment and on Racker and Stoeckenius
export const OBJECTIVES = [
  // ---- 7.1 Respiration is not burning ----
  {
    id: 'respiration-definition',
    statement: 'Say what cellular respiration is, distinguish it from breathing, and give the overall equation for the oxidation of glucose together with the free energy it releases.',
    prereqs: ['catabolism-anabolism', 'redox-basics'],
    teaches: { sections: ['burning'], figures: [] },
    level: 'recall',
  },
  {
    id: 'respiration-vs-combustion',
    statement: 'Explain why burning glucose and respiring it have the same equation and the same free energy change, and say what a cell gets from its version that a flame cannot give it.',
    prereqs: ['respiration-definition', 'second-law-life', 'electron-carriers'],
    teaches: { sections: ['burning'], figures: [] },
    level: 'explain',
  },
  {
    id: 'four-stages',
    statement: 'Name the four stages of respiration in order and say which compartment of a cell each one happens in.',
    prereqs: ['respiration-definition', 'organelle-architecture'],
    teaches: { sections: ['burning'], figures: [] },
    level: 'recall',
  },
  {
    id: 'cristae-area',
    statement: 'Explain why a mitochondrion\'s inner membrane is folded, and predict how the folding differs between a heart muscle cell and a liver cell.',
    prereqs: ['four-stages', 'sav-arithmetic'],
    teaches: { sections: ['burning'], figures: [] },
    level: 'explain',
  },

  // ---- 7.2 A very old pathway runs in the cytosol ----
  {
    id: 'glycolysis-ledger',
    statement: 'State what one molecule of glucose costs and yields in glycolysis: the ATP spent, the ATP made, the reduced carriers and the two three-carbon products.',
    prereqs: ['four-stages', 'atp-structure'],
    teaches: { sections: ['glycolysis'], figures: ['fig-glycolysis'] },
    level: 'recall',
  },
  {
    id: 'substrate-level-phosphorylation',
    statement: 'Explain how glycolysis makes ATP with no membrane and no gradient anywhere in sight, naming the intermediate the phosphate is taken from.',
    prereqs: ['glycolysis-ledger', 'shared-intermediate', 'not-high-energy-bond'],
    teaches: { sections: ['glycolysis'], figures: ['fig-glycolysis'] },
    level: 'explain',
  },
  {
    id: 'glycolysis-committed-step',
    statement: 'Identify the step that commits a glucose molecule to being broken down, say what switches its enzyme off, and predict what a cell with plenty of ATP does with the pathway.',
    prereqs: ['glycolysis-ledger', 'feedback-inhibition'],
    teaches: { sections: ['glycolysis'], figures: ['fig-glycolysis'] },
    level: 'apply',
  },
  {
    id: 'glycolysis-universal',
    statement: 'Explain what follows from glycolysis, in one version or another, sitting in the cytosol of all three domains and needing no oxygen and no organelle.',
    prereqs: ['glycolysis-ledger', 'three-domains', 'endosymbiosis-evidence'],
    teaches: { sections: ['glycolysis'], figures: ['fig-glycolysis'] },
    level: 'explain',
  },

  // ---- 7.3 A cycle that takes carbon apart ----
  {
    id: 'link-reaction',
    statement: 'Say what happens to pyruvate as it enters the matrix: what is removed, what is attached and what is reduced.',
    prereqs: ['glycolysis-ledger', 'redox-basics', 'functional-groups'],
    teaches: { sections: ['krebs'], figures: ['fig-krebs'] },
    level: 'recall',
  },
  {
    id: 'krebs-carbon-accounting',
    statement: 'Account for the six carbons of a glucose molecule as a count, saying at which steps carbon leaves and in what form, and explain why the carbons that leave on a turn of the Krebs cycle are not the two that have just arrived.',
    prereqs: ['link-reaction', 'four-stages'],
    teaches: { sections: ['krebs'], figures: ['fig-krebs'] },
    level: 'apply',
  },
  {
    id: 'krebs-is-a-cycle',
    statement: 'Explain why the pathway is a cycle rather than a line, name what is regenerated on every turn, and say why a very small amount of it can process an unlimited amount of fuel.',
    prereqs: ['krebs-carbon-accounting', 'catabolism-anabolism'],
    teaches: { sections: ['krebs'], figures: ['fig-krebs'] },
    level: 'explain',
  },
  {
    id: 'krebs-output',
    statement: 'State what one turn of the cycle yields in reduced carriers and in ATP, and what one glucose molecule yields from the two turns it pays for.',
    prereqs: ['krebs-is-a-cycle', 'electron-carriers'],
    teaches: { sections: ['krebs'], figures: ['fig-krebs'] },
    level: 'recall',
  },
  {
    id: 'krebs-amphibolic',
    statement: 'Predict what happens to the cycle when one of its intermediates is drawn off to build something else, and say what a cell has to do to keep it turning.',
    prereqs: ['krebs-is-a-cycle', 'pathway-blocked'],
    teaches: { sections: ['krebs'], figures: ['fig-krebs'] },
    level: 'apply',
  },
  {
    id: 'other-fuels',
    statement: 'Say where a fatty acid and an amino acid join these pathways, and use how reduced their carbons are to explain why a fat yields more per gram than a sugar.',
    prereqs: ['krebs-carbon-accounting', 'why-electrons-fall', 'condensation-hydrolysis'],
    teaches: { sections: ['krebs'], figures: ['fig-krebs'] },
    level: 'apply',
  },

  // ---- 7.4 The chain makes a gradient, not ATP ----
  {
    id: 'chain-components',
    statement: 'Name what the electron transport chain is made of, and say which of its carriers are fixed in the inner membrane and which move about within it.',
    prereqs: ['four-stages', 'membrane-proteins'],
    teaches: { sections: ['chain'], figures: ['fig-chain'] },
    level: 'recall',
  },
  {
    id: 'redox-ladder',
    statement: 'Use two carriers\' standard reduction potentials to say which way electrons move between them and how much free energy the step releases.',
    prereqs: ['why-electrons-fall', 'electron-path'],
    teaches: { sections: ['chain'], figures: ['fig-chain'] },
    level: 'apply',
  },
  {
    id: 'chain-pumps-protons',
    statement: 'Explain what the chain does with the energy of each fall, and say what is wrong with the sentence "the electron transport chain makes ATP".',
    prereqs: ['redox-ladder', 'chain-components', 'proton-pump'],
    teaches: { sections: ['chain'], figures: ['fig-chain'] },
    level: 'explain',
  },
  {
    id: 'oxygen-is-the-acceptor',
    statement: 'Say what oxygen does at the end of the chain, explain why everything upstream stops without it, and say why oxygen is not what the chain is for.',
    prereqs: ['chain-pumps-protons', 'redox-ladder', 'atmosphere-changed'],
    teaches: { sections: ['chain'], figures: ['fig-chain'] },
    level: 'explain',
  },
  {
    id: 'fadh2-enters-lower',
    statement: 'Explain why a pair of electrons from FADH₂ drives fewer protons across the membrane than a pair from NADH, and say where it joins the chain.',
    prereqs: ['redox-ladder', 'chain-pumps-protons', 'electron-carriers'],
    teaches: { sections: ['chain'], figures: ['fig-chain'] },
    level: 'apply',
  },

  // ---- 7.5 The gradient turns a motor ----
  {
    id: 'proton-motive-force',
    statement: 'Say what the proton-motive force is, name its two parts, and say which of the two carries most of it across a mitochondrion\'s inner membrane.',
    prereqs: ['chain-pumps-protons', 'electrochemical-gradient', 'membrane-potential', 'ph-scale', 'thylakoid-gradient'],
    teaches: { sections: ['chemiosmosis'], figures: ['fig-chain'] },
    level: 'explain',
  },
  {
    id: 'chemiosmosis-principle',
    statement: 'Explain how a gradient made by one set of proteins is spent by another with no chemical intermediate passing between them, and say what carries the energy instead.',
    prereqs: ['proton-motive-force', 'shared-intermediate', 'gradient-energy'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'explain',
  },
  {
    id: 'sealed-compartment',
    statement: 'Explain why chemiosmosis needs an unbroken membrane, and predict what a torn one does to ATP production while the chain runs as fast as it ever did.',
    prereqs: ['chemiosmosis-principle', 'ion-barrier', 'bilayer-properties'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'explain',
  },
  {
    id: 'synthase-is-a-motor',
    statement: 'Describe ATP synthase as a rotary machine: what the protons turn, what the turning does to the three catalytic sites, and how many ATP one full rotation makes.',
    prereqs: ['chemiosmosis-principle', 'pump-cycle', 'motor-direction', 'photophosphorylation'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'explain',
  },
  {
    id: 'synthase-reversible',
    statement: 'Predict which way ATP synthase runs from the proton-motive force and the ratio of ATP to ADP, and say what a cell whose gradient has collapsed does with the ATP it has left.',
    prereqs: ['synthase-is-a-motor', 'pump-efficiency', 'concentrations-decide'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'apply',
  },
  {
    id: 'chemiosmosis-evidence',
    statement: 'State what observation would have shown the chemiosmotic hypothesis to be false, and describe an experiment that made a gradient with no chain at all and got ATP out of it.',
    prereqs: ['chemiosmosis-principle', 'hypothesis-vs-theory', 'acid-bath'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'explain',
  },

  // ---- 7.6 The number is a range, and here is why ----
  {
    id: 'yield-arithmetic',
    statement: 'Add up the ATP one glucose molecule yields, taking each term from the stage that produced it and each carrier at its measured value.',
    prereqs: ['krebs-output', 'glycolysis-ledger', 'chemiosmosis-principle'],
    teaches: { sections: ['yield'], figures: [] },
    level: 'apply',
  },
  {
    id: 'p-o-ratio',
    statement: 'Explain why about two and a half ATP are made per NADH rather than three, from the protons the chain pumps and the protons the synthase and the transporters need.',
    prereqs: ['yield-arithmetic', 'synthase-is-a-motor', 'chain-pumps-protons'],
    teaches: { sections: ['yield'], figures: [] },
    level: 'explain',
  },
  {
    id: 'shuttle-cost',
    statement: 'Explain why the two NADH made in the cytosol can be worth less than the eight made in the matrix, and say which shuttle a fast skeletal muscle uses and which a liver uses.',
    prereqs: ['p-o-ratio', 'ion-barrier', 'four-stages'],
    teaches: { sections: ['yield'], figures: [] },
    level: 'apply',
  },
  {
    id: 'why-not-38',
    statement: 'Say which assumptions produce the textbook figure of thirty-eight ATP per glucose, and which of those assumptions are false.',
    prereqs: ['p-o-ratio', 'shuttle-cost'],
    teaches: { sections: ['yield'], figures: [] },
    level: 'explain',
  },
  {
    id: 'respiration-efficiency',
    statement: 'Work out what fraction of glucose\'s free energy a cell captures as ATP, and say what becomes of the rest.',
    prereqs: ['yield-arithmetic', 'atp-cellular-value', 'second-law-life'],
    teaches: { sections: ['yield'], figures: [] },
    level: 'apply',
  },

  // ---- 7.7 When nothing is there to take the electrons ----
  {
    id: 'carrier-pool-limit',
    statement: 'Explain why glycolysis stops within seconds of the chain stopping, naming exactly what has run out.',
    prereqs: ['electron-carriers', 'chain-pumps-protons', 'glycolysis-ledger'],
    teaches: { sections: ['anaerobic'], figures: ['fig-fermentation'] },
    level: 'explain',
  },
  {
    id: 'fermentation-purpose',
    statement: 'Say what fermentation is for, and explain what is wrong with describing it as a way of producing energy.',
    prereqs: ['carrier-pool-limit', 'glycolysis-ledger', 'redox-basics'],
    teaches: { sections: ['anaerobic'], figures: ['fig-fermentation'] },
    level: 'explain',
  },
  {
    id: 'two-fermentations',
    statement: 'Say what a muscle cell and a yeast cell each do with pyruvate when the chain cannot take their electrons, and name what each one produces.',
    prereqs: ['fermentation-purpose', 'link-reaction'],
    teaches: { sections: ['anaerobic'], figures: ['fig-fermentation'] },
    level: 'recall',
  },
  {
    id: 'lactate-facts',
    statement: 'Say what becomes of lactate after hard exercise, and explain why it is not what makes a muscle ache two days later.',
    prereqs: ['two-fermentations', 'carrier-pool-limit', 'catabolism-anabolism', 'ph-scale'],
    teaches: { sections: ['anaerobic'], figures: ['fig-fermentation'] },
    level: 'apply',
  },
  {
    id: 'anaerobic-respiration',
    statement: 'Distinguish anaerobic respiration from fermentation by what accepts the electrons at the end, and predict from an acceptor\'s reduction potential how much less it yields.',
    prereqs: ['redox-ladder', 'oxygen-is-the-acceptor', 'fermentation-purpose'],
    teaches: { sections: ['anaerobic'], figures: ['fig-fermentation', 'fig-chain'] },
    level: 'apply',
  },

  // ---- 7.8 Block it, or let it leak ----
  {
    id: 'blocking-the-chain',
    statement: 'Predict which carriers go reduced and which go oxidised when a named inhibitor blocks one point in the chain, and say why everything downstream of the fuel stops.',
    prereqs: ['chain-components', 'redox-ladder', 'inhibition-types'],
    teaches: { sections: ['poisons'], figures: ['fig-chain'] },
    level: 'apply',
  },
  {
    id: 'uncoupling',
    statement: 'Predict what an uncoupler does to oxygen consumption, to ATP production and to a body\'s temperature, and explain why the three move in those directions.',
    prereqs: ['chemiosmosis-principle', 'proton-motive-force', 'sealed-compartment'],
    teaches: { sections: ['poisons'], figures: [] },
    level: 'apply',
  },
  {
    id: 'respiratory-control',
    statement: 'Explain why blocking ATP synthase also stops the chain, and say what that shows about how the two machines are joined.',
    prereqs: ['chain-pumps-protons', 'chemiosmosis-principle', 'feedback-inhibition'],
    teaches: { sections: ['poisons'], figures: [] },
    level: 'explain',
  },
  {
    id: 'uncoupling-on-purpose',
    statement: 'Explain how brown fat warms a newborn, and say what an animal gains from a mitochondrion built to make no ATP at all.',
    prereqs: ['uncoupling', 'homeostasis', 'feedback-direction'],
    teaches: { sections: ['poisons'], figures: [] },
    level: 'apply',
  },
  {
    id: 'diagnose-respiration',
    // One section, not four, for the reason chapters 4 and 5 gave for `identify-mechanism` and
    // `diagnose-reaction`: the sort activity that asks for exactly this comparison sits at the end of
    // §7.8, and so does the paragraph that puts the four failures side by side. Naming every section the
    // individual ideas are taught in would list this objective four times in the reader's section headers
    // and claim each of those sections teaches the comparison. The prerequisites are what send a reader
    // who fails it back to what they are actually missing.
    prereqs: ['blocking-the-chain', 'uncoupling', 'respiratory-control', 'carrier-pool-limit'],
    statement: 'Decide from a measurement or a symptom which part of respiration has been interfered with: the chain blocked, the membrane leaking, the synthase stopped, or the carriers with nowhere to unload.',
    teaches: { sections: ['poisons'], figures: ['fig-chain'] },
    level: 'apply',
  },
];
