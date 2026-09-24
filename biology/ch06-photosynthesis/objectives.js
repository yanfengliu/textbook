// Chapter 6's learning objectives: the claims a reader should be able to make when they have finished
// it. Same contract as chapters 1 to 5 (docs/design/adaptive.md): mastery is tracked per objective,
// every question names the objective it tests, and the prerequisite graph is what lets the study queue
// work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// Four figures, not eight. The owner cut photon-lab, chloroplast3d, proton-ledger and carbon-concentrator
// on 2026-09-23, and the chapter is reviewed with questions rather than figure tasks. The objectives those
// four taught are unchanged and are still taught by their sections; they now name no figure
// (`figures: []`), which is what npm run check accepts: it requires every objective to name a section,
// and every figure an objective does name to exist (tools/check-content.js, checkChapterData). Chapter 1
// has ten objectives of this shape. The rest name only figures that are still on the page:
// fig-pigments (6.1), fig-zscheme (6.2), fig-calvin (6.3), fig-rubisco (6.4).
//
// Figure 6.1 was then built without its second scene, the antenna and the four exits (its module's
// header, "WHAT IS NOT HERE"): it draws the three absorption curves, the action spectrum and the leaf. So
// `chlorophyll-structure` and `antenna-and-protection`, which named it for that scene, name no figure
// either, and §6.3's prose is what teaches them.
//
// This is the chapter where the energy enters. Chapter 5 built the whole machinery of free energy,
// coupling, catalysis and redox and then deliberately spent none of it; chapter 4 built a membrane and
// called a gradient a battery; chapter 3 built the compartment; chapter 2 built the bonds and the
// electronegativity. So a great many prerequisites reach out of the chapter — forty-two edges naming
// thirty-three objectives of chapters 1 to 5. For each one, what a reader who failed the objective is
// missing:
//
// From chapter 1, because this chapter is the mechanism under §1.6 and the test of §1.8's method:
//   `controlled-experiment` — four of this chapter's claims are settled by one experiment each (the
//                             ¹⁸O label, Engelmann's prism, Emerson's enhancement, the acid bath), and a
//                             reader who cannot say what a control rules out cannot read any of them
//   `organelle-function`    — the photorespiratory salvage runs through a peroxisome and a mitochondrion
//                             (§6.7); a reader who cannot say what either organelle does loses the route
//   `adaptation-explained`  — §6.7 asks why selection has not fixed rubisco, which is a question about
//                             what selection can and cannot do, not about rubisco
//   `endosymbiosis`         — §6.7's atmosphere was changed by the cyanobacteria that became the
//                             chloroplast, so the enzyme's problem was created by its own ancestors
//
// From chapter 2, because a photon acts on a bond and the whole chapter is about where electrons sit:
//   `bond-strengths`  — §6.1 measures a photon against the 2.5 kJ/mol of thermal jostling at 25 °C and the
//                       350 kJ/mol of a carbon–carbon bond; without those two numbers the comparison
//                       that makes light different from heat has nothing to stand on
//   `ph-scale`        — §6.5 works a gradient of three pH units, and a reader who reads that as "three
//                       times" rather than "a thousandfold" gets the ratio wrong by two and a half orders
//                       of magnitude and the energy by a factor of six
//   `nucleotide-parts`— NADPH is NADH with one more phosphate on it (§6.4)
//
// From chapter 3, because a chloroplast is an architecture before it is a chemistry:
//   `organelle-architecture` — §3.5 already named the thylakoid, the stroma and the grana; §6.2 uses
//                              those words rather than re-teaching them
//   `diffusion-time`         — why a leaf is thin and why carbon dioxide has to be brought to the
//                              chloroplast rather than waiting for it (§6.2)
//   `pathway-lesion`         — the salvage route is a pathway through compartments, read the same way
//                              §3.4 read the secretory one (§6.7)
//   `plasmodesmata`          — a C4 leaf hands a four-carbon acid from one cell to the next through
//                              them, and the whole mechanism depends on that connection (§6.8)
//   `vacuole-role`           — a CAM plant keeps the night's carbon in the vacuole, which is §3.8's
//                              compartment doing a job §3.8 did not list (§6.8)
//
// From chapter 4, because the light reactions are a membrane spending a gradient:
//   `bilayer-properties`  — §4.1's point that a bilayer closes into a bag is why a thylakoid can hold a
//                           gradient at all; an open sheet would hold nothing (§6.2)
//   `gradient-energy`     — §4.7 is the section this chapter cashes: §6.2 needs a gradient to be worth
//                           something, §6.5 works out what this one is worth
//   `flux-factors`        — a leaf's shape is the gas-exchange surface of §4.3, argued the same way (§6.2)
//   `amphipathic`         — chlorophyll's tail is a hydrocarbon and its head is not, which is why it sits
//                           where it sits (§6.3)
//   `proton-pump`         — §4.6's proton pump is one of the three things charging this gradient (§6.5)
//   `pump-cycle`          — ATP synthase is a pump run backwards, which §4.7 and §5.4 both promised and
//                           neither showed (§6.5)
//
// From chapter 5, which built all of this and spent none of it:
//   `second-law-life`     — §5.1's rule that heat at one temperature can do no work is the rule §6.1 has
//                           to show light escaping, and a reader who has not got it cannot see why
//   `redox-basics`        — every electron in this chapter is going somewhere (§6.1, §6.4)
//   `why-electrons-fall`  — §6.1, §6.4 and §6.6 are all that objective run backwards: this chapter
//                           pushes electrons UP the ladder §5.8 let them fall down
//   `free-energy`         — the sign of ΔG is the whole of why photosynthesis needs an energy source
//                           (§6.1) and of what the two photosystems are paying for (§6.4)
//   `activation-energy`   — carbon dioxide is stable as well as oxidised, and those are two different
//                           obstacles (§6.6)
//   `concentrations-decide` — §5.2's RT ln term is the arithmetic §6.5 does on a pH difference
//   `shared-intermediate` — the gradient is the intermediate between the light reactions and the ATP,
//                           which is what makes this coupling and not proximity (§6.5)
//   `electron-carriers`   — §5.8 charged NAD⁺ and said chapters 6 and 7 would spend it; §6.4 is where
//                           the phosphorylated version arrives
//   `catabolism-anabolism`— the Calvin cycle is anabolism, and §5.8's rule that the two directions are
//                           never each other reversed is why it does not look like chapter 7 backwards
//   `atp-cellular-value`  — §6.6 counts ATP, and a reader who thinks an ATP is worth 30.5 kJ/mol rather
//                           than about 50 gets the cost of a sugar wrong by a third
//   `enzyme-conditions`   — §6.6's stroma changes its pH and its magnesium in the light, and that is
//                           §5.6's temperature-and-pH argument applied to a compartment
//   `active-site`         — rubisco's problem is one site and two substrates (§6.7)
//   `rate-vs-substrate`   — rubisco is slow, so a plant compensates with the other term in the maximum
//                           rate, which is how much enzyme there is (§6.7)
//   `inhibition-types`    — oxygen and carbon dioxide compete for one site, which is competitive
//                           kinetics with two substrates rather than a substrate and a drug (§6.7)
//   `coupling-principle`  — a C4 plant spends two extra ATP per carbon dioxide delivered, and whether
//                           that is worth it is an addition (§6.8)
export const OBJECTIVES = [
  // ---- 6.1 Everything here is running on sunlight ----
  {
    id: 'photon-energy',
    statement: 'Work out the energy in a mole of photons of a given wavelength, and say which end of the visible spectrum carries more of it.',
    prereqs: ['bond-strengths'],
    teaches: { sections: ['sunlight'], figures: [] },
    level: 'apply',
  },
  {
    id: 'light-not-heat',
    statement: 'Explain why light can drive chemistry although heat at one temperature cannot, naming the two things a photon does that warming a cell does not.',
    prereqs: ['photon-energy', 'second-law-life'],
    teaches: { sections: ['sunlight'], figures: [] },
    level: 'explain',
  },
  {
    id: 'excited-electron',
    statement: 'Say what happens inside a molecule when it absorbs a photon, and explain why an excited molecule gives an electron away more readily than it did before.',
    prereqs: ['photon-energy', 'redox-basics'],
    teaches: { sections: ['sunlight'], figures: [] },
    level: 'explain',
  },
  {
    id: 'photosynthesis-equation',
    statement: 'Write the overall equation of photosynthesis, give the sign and the size of its free energy change, and say what that sign obliges a plant to supply.',
    prereqs: ['free-energy', 'why-electrons-fall'],
    teaches: { sections: ['sunlight'], figures: [] },
    level: 'recall',
  },
  {
    id: 'oxygen-source',
    statement: 'State which of the two reactants the released oxygen comes from, and describe the experiment that settled it and what the alternative would have predicted.',
    prereqs: ['photosynthesis-equation', 'controlled-experiment'],
    teaches: { sections: ['sunlight'], figures: [] },
    level: 'explain',
  },

  // ---- 6.2 A compartment inside a compartment ----
  {
    id: 'chloroplast-compartments',
    statement: 'Name a chloroplast\'s three membranes and the three watery spaces they separate, and say which of the spaces is one connected volume.',
    prereqs: ['organelle-architecture'],
    teaches: { sections: ['chloroplast'], figures: [] },
    level: 'recall',
  },
  {
    id: 'thylakoid-is-closed',
    statement: 'Explain why the thylakoid has to be a sealed compartment, and predict what a leak in it would do to the light reactions.',
    prereqs: ['chloroplast-compartments', 'bilayer-properties', 'gradient-energy'],
    teaches: { sections: ['chloroplast', 'chemiosmosis'], figures: [] },
    level: 'explain',
  },
  {
    id: 'division-of-labour',
    statement: 'Say which half of photosynthesis happens on the thylakoid membrane and which in the stroma, and name what crosses from the membrane to the stroma and what comes back.',
    prereqs: ['chloroplast-compartments'],
    teaches: { sections: ['chloroplast'], figures: [] },
    level: 'recall',
  },
  {
    id: 'leaf-gas-exchange',
    statement: 'Trace carbon dioxide from the air to a chloroplast, and name what a leaf loses in exchange for opening the route.',
    prereqs: ['flux-factors', 'diffusion-time'],
    teaches: { sections: ['chloroplast'], figures: [] },
    level: 'explain',
  },

  // ---- 6.3 Green is the part a leaf uses least ----
  {
    id: 'chlorophyll-structure',
    statement: 'Describe a chlorophyll molecule — the ring, the magnesium ion at its centre and the long tail — and say what each part is for.',
    prereqs: ['chloroplast-compartments', 'amphipathic'],
    teaches: { sections: ['pigments'], figures: [] },
    level: 'recall',
  },
  {
    id: 'why-pigments-absorb',
    statement: 'Explain why a ring of alternating bonds absorbs visible light when most molecules in a cell do not, and relate the colour absorbed to the gap the electron crosses.',
    prereqs: ['chlorophyll-structure', 'excited-electron'],
    teaches: { sections: ['pigments'], figures: ['fig-pigments'] },
    level: 'explain',
  },
  {
    id: 'absorption-vs-action',
    statement: 'Distinguish an absorption spectrum from an action spectrum, say how each is measured, and explain what it means when the two do not match.',
    prereqs: ['why-pigments-absorb', 'controlled-experiment'],
    teaches: { sections: ['pigments'], figures: ['fig-pigments'] },
    level: 'apply',
  },
  {
    id: 'why-leaves-green',
    statement: 'Explain why a leaf looks green, and say what is wrong both with "chlorophyll absorbs green" and with "a leaf reflects the green".',
    prereqs: ['why-pigments-absorb'],
    teaches: { sections: ['pigments'], figures: ['fig-pigments'] },
    level: 'explain',
  },
  {
    id: 'antenna-and-protection',
    statement: 'Explain what an antenna of several hundred pigments is for, name the four things that can happen to an excited chlorophyll, and say which one photosynthesis needs and what carotenoids do about the others.',
    prereqs: ['excited-electron', 'why-pigments-absorb'],
    teaches: { sections: ['pigments'], figures: [] },
    level: 'explain',
  },

  // ---- 6.4 Two pushes, and water pays for both ----
  {
    id: 'two-photosystems',
    statement: 'Explain what each photosystem would have to be able to do if there were only one, and describe the two measurements — the red drop and the enhancement effect — that showed there were two.',
    prereqs: ['excited-electron', 'controlled-experiment'],
    teaches: { sections: ['lightreactions'], figures: ['fig-zscheme'] },
    level: 'explain',
  },
  {
    id: 'electron-path',
    statement: 'Trace one electron from water to NADPH, naming the carriers in order and the two places light pushes it uphill.',
    prereqs: ['two-photosystems', 'redox-basics'],
    teaches: { sections: ['lightreactions'], figures: ['fig-zscheme'] },
    level: 'apply',
  },
  {
    id: 'water-split',
    statement: 'Say what has to be true of P680 for it to take electrons from water, and describe how the manganese cluster releases one oxygen molecule for every four photons rather than one for every photon.',
    prereqs: ['electron-path', 'why-electrons-fall'],
    teaches: { sections: ['lightreactions'], figures: ['fig-zscheme'] },
    level: 'explain',
  },
  {
    id: 'zscheme-arithmetic',
    statement: 'Use the redox potentials to work out what pushing two electrons from water up to NADPH costs, and compare it with what the photons that did it supplied.',
    prereqs: ['electron-path', 'photon-energy', 'free-energy'],
    teaches: { sections: ['lightreactions'], figures: ['fig-zscheme'] },
    level: 'apply',
  },
  {
    id: 'nadph-role',
    statement: 'Say how NADPH differs from NADH and what each is used for, and explain what a cell gains by keeping two pools that carry the same electrons.',
    prereqs: ['electron-carriers', 'nucleotide-parts'],
    teaches: { sections: ['lightreactions'], figures: ['fig-zscheme'] },
    level: 'explain',
  },
  {
    id: 'cyclic-flow',
    statement: 'Say what cyclic electron flow around photosystem\u00a0I produces and what it does not produce, naming the two products of the straight-through path that it never makes.',
    prereqs: ['electron-path', 'nadph-role'],
    teaches: { sections: ['lightreactions'], figures: ['fig-zscheme'] },
    level: 'explain',
  },

  // ---- 6.5 Chapter 4's battery, charged by light ----
  {
    id: 'proton-sources',
    statement: 'Name the three things that make the thylakoid lumen acidic relative to the stroma, and say which side of the membrane each one acts on.',
    prereqs: ['electron-path', 'proton-pump'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'explain',
  },
  {
    id: 'thylakoid-gradient',
    statement: 'Work out what the thylakoid\'s pH difference is worth for each mole of protons that falls back, and explain why almost none of the force here is voltage when in a mitochondrion much of it is.',
    prereqs: ['proton-sources', 'gradient-energy', 'ph-scale', 'concentrations-decide'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'apply',
  },
  {
    id: 'photophosphorylation',
    statement: 'Explain how ATP synthase turns falling protons into ATP, and say which side of the membrane the ATP appears on and why that is the side that matters.',
    prereqs: ['thylakoid-gradient', 'pump-cycle', 'shared-intermediate'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'explain',
  },
  {
    id: 'acid-bath',
    statement: 'Describe the acid-bath experiment, say which explanation of photophosphorylation it ruled out, and predict what a molecule that carries protons across the membrane would do to the yield.',
    prereqs: ['photophosphorylation', 'controlled-experiment'],
    teaches: { sections: ['chemiosmosis'], figures: [] },
    level: 'apply',
  },

  // ---- 6.6 Building a sugar out of air ----
  {
    id: 'co2-is-stable',
    statement: 'Give the two separate reasons carbon dioxide is hard to work with, and say what has to be done to it before it can be reduced.',
    prereqs: ['why-electrons-fall', 'activation-energy'],
    teaches: { sections: ['calvin'], figures: ['fig-calvin'] },
    level: 'explain',
  },
  {
    id: 'calvin-phases',
    statement: 'Name the Calvin cycle\'s three phases, say what each does to the carbon, and explain why the arrangement has to be a cycle rather than a line.',
    prereqs: ['co2-is-stable', 'catabolism-anabolism'],
    teaches: { sections: ['calvin'], figures: ['fig-calvin'] },
    level: 'explain',
  },
  {
    id: 'carboxylation-product',
    statement: 'Say what rubisco attaches carbon dioxide to, name the first stable product, and explain why that product has three carbons rather than six.',
    prereqs: ['calvin-phases'],
    teaches: { sections: ['calvin'], figures: ['fig-calvin'] },
    level: 'recall',
  },
  {
    id: 'calvin-ledger',
    statement: 'Count the ATP and the NADPH the cycle spends per carbon dioxide fixed and per sugar built, and say which phase spends which.',
    prereqs: ['calvin-phases', 'atp-cellular-value'],
    teaches: { sections: ['calvin'], figures: ['fig-calvin'] },
    level: 'apply',
  },
  {
    id: 'not-dark-reactions',
    statement: 'Explain why calling this half of photosynthesis the dark reactions is wrong, naming two ways light switches the stroma\'s enzymes on.',
    prereqs: ['calvin-phases', 'enzyme-conditions'],
    teaches: { sections: ['calvin'], figures: ['fig-calvin'] },
    level: 'explain',
  },
  {
    id: 'atp-nadph-balance',
    statement: 'Say why the ratio of ATP to NADPH the Calvin cycle needs is not the ratio the straight-through path supplies, and name what makes up the difference.',
    prereqs: ['calvin-ledger', 'cyclic-flow'],
    teaches: { sections: ['calvin'], figures: ['fig-calvin', 'fig-zscheme'] },
    level: 'apply',
  },

  // ---- 6.7 One active site, two gases ----
  {
    id: 'rubisco-two-substrates',
    statement: 'Explain how one active site can take either carbon dioxide or oxygen, and say what the two gases have in common that the enzyme has to discriminate against.',
    prereqs: ['active-site', 'carboxylation-product'],
    teaches: { sections: ['rubisco'], figures: ['fig-rubisco'] },
    level: 'explain',
  },
  {
    id: 'oxygenation-arithmetic',
    statement: 'Work out roughly how often rubisco takes an oxygen instead of a carbon dioxide, from how much of each is dissolved around it and how strongly the enzyme prefers one, and say what heat and a closed leaf each do to the answer.',
    prereqs: ['rubisco-two-substrates', 'rate-vs-substrate', 'inhibition-types'],
    teaches: { sections: ['rubisco'], figures: ['fig-rubisco'] },
    level: 'apply',
  },
  {
    id: 'photorespiration-route',
    statement: 'Follow the salvage of the two-carbon product through three organelles, and say what the plant gets back and what it loses on the way.',
    prereqs: ['oxygenation-arithmetic', 'organelle-function', 'pathway-lesion'],
    teaches: { sections: ['rubisco'], figures: ['fig-rubisco'] },
    level: 'apply',
  },
  {
    id: 'rubisco-abundance',
    statement: 'State how much rubisco a leaf and the world contain, and explain how a plant gets a useful rate out of an enzyme that turns over a few times a second.',
    prereqs: ['oxygenation-arithmetic', 'rate-vs-substrate'],
    teaches: { sections: ['rubisco'], figures: ['fig-rubisco'] },
    level: 'explain',
  },
  {
    id: 'atmosphere-changed',
    statement: 'Explain why rubisco\'s confusion is a consequence of an atmosphere that changed rather than a fault in the enzyme, and name the evidence and the constraint that between them keep it from being improved away.',
    prereqs: ['rubisco-two-substrates', 'oxygen-source', 'adaptation-explained', 'endosymbiosis'],
    teaches: { sections: ['rubisco'], figures: ['fig-rubisco'] },
    level: 'explain',
  },

  // ---- 6.8 Two answers to the same problem ----
  {
    id: 'stomatal-tradeoff',
    statement: 'State the problem a leaf cannot avoid, and say what closing the pore does to the two gases inside and therefore to rubisco.',
    prereqs: ['leaf-gas-exchange', 'oxygenation-arithmetic'],
    teaches: { sections: ['c4cam'], figures: ['fig-rubisco'] },
    level: 'explain',
  },
  {
    id: 'c4-mechanism',
    statement: 'Explain how a C4 plant concentrates carbon dioxide around rubisco, naming the enzyme that fixes it first, what that enzyme actually takes, and why it cannot make rubisco\'s mistake.',
    prereqs: ['stomatal-tradeoff', 'rubisco-two-substrates', 'plasmodesmata'],
    teaches: { sections: ['c4cam'], figures: [] },
    level: 'explain',
  },
  {
    id: 'cam-mechanism',
    statement: 'Explain how a CAM plant solves the same problem by separating the two steps in time rather than in space, and say where it keeps the night\'s carbon and what limits how much it can keep.',
    prereqs: ['stomatal-tradeoff', 'vacuole-role'],
    teaches: { sections: ['c4cam'], figures: [] },
    level: 'explain',
  },
  {
    id: 'choose-strategy',
    statement: 'Predict from a climate which of the three strategies will do best, and say what each costs in ATP and in water.',
    prereqs: ['c4-mechanism', 'cam-mechanism', 'coupling-principle'],
    teaches: { sections: ['c4cam'], figures: [] },
    level: 'apply',
  },
  {
    id: 'diagnose-photosynthesis',
    // One section, not five, for the reason chapters 4 and 5 gave for `identify-mechanism` and
    // `diagnose-reaction`: the sort activity that asks for exactly this lives at the end of §6.8, and so
    // does the paragraph that puts the four cases side by side. Naming every section the individual
    // ideas are taught in would list this objective five times in the reader's section headers and claim
    // each of those sections teaches the comparison. The prerequisites are what send a reader who fails
    // it back to what they are missing.
    prereqs: ['electron-path', 'photophosphorylation', 'calvin-ledger', 'oxygenation-arithmetic'],
    statement: 'Decide from an observation which part of photosynthesis is affected: catching the light, moving the electrons, holding the gradient, or the carbon reactions in the stroma.',
    teaches: { sections: ['c4cam'], figures: ['fig-zscheme', 'fig-calvin'] },
    level: 'apply',
  },
];
