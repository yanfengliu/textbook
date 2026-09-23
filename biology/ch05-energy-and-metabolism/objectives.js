// Chapter 5's learning objectives: the claims a reader should be able to make when they have finished
// it. Same contract as chapters 1 to 4 (docs/design/adaptive.md): mastery is tracked per objective,
// every question names the objective it tests, and the prerequisite graph is what lets the study queue
// work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// This chapter is the book's hinge: chapter 1 promised that energy flows while matter cycles, chapter 2
// built the bonds, chapter 3 built the compartments, and chapter 4 spent ATP on every page without once
// saying what it was. So a great many prerequisites reach out of the chapter — thirty-three edges naming
// twenty-seven objectives of chapters 1 to 4. For each one, what a reader who failed the objective is
// missing:
//
// From chapter 1, because this chapter is the mechanism under two of its sections:
//   `order-costs-energy`  — §5.1 is that sentence made into thermodynamics; a reader who cannot say why
//                           an organism must keep taking energy in has nothing for the first law to bite on
//   `energy-vs-matter`    — §5.1 explains WHY energy passes once: it is degraded to heat, and heat at one
//                           temperature can do no work. The claim is chapter 1's; the reason is here
//   `homeostasis`         — §5.2's steady state is homeostasis seen as a chemistry: held still, not at rest
//   `negative-feedback`   — §5.7's feedback inhibition is exactly that loop, with molecules for nerves
//   `feedback-opened`     — §5.7 breaks the loop and the pathway runs away, which is what §1.2 predicted
//   `set-point`           — §5.7's set point is not a number but the strength of a binding site
//
// From chapter 2, because every claim in this chapter is a claim about bonds and electrons:
//   `bond-types`            — chemical energy is held in an arrangement of bonded atoms (§5.1)
//   `bond-strengths`        — the 2.6 kJ/mol of thermal jostling at 37 °C is what a barrier is measured
//                             against (§5.2, §5.5), and 350 kJ/mol is what breaking a bond really costs (§5.3)
//   `hydrophobic-effect`    — the case where a change that takes heat in still runs, because the entropy
//                             term wins (§5.2)
//   `nucleotide-parts`      — ATP is a nucleotide (§5.3), and NAD⁺ is two of them joined (§5.8)
//   `functional-groups`     — the phosphate group, and §2.7's table, which this chapter has to correct (§5.3)
//   `water-solvent`         — one reason ATP's products are more stable is that water surrounds them
//                             better than it surrounded ATP (§5.3)
//   `protein-levels`        — an active site is a pocket made by a tertiary fold (§5.5), and an allosteric
//                             enzyme's two shapes are quaternary (§5.7)
//   `weak-bonds-matter`     — a substrate is held by many weak bonds, which is where specificity comes
//                             from (§5.5)
//   `denaturation`          — why an enzyme has a temperature optimum, and why heating a cell is not an
//                             option (§5.5, §5.6)
//   `ph-scale`              — why an enzyme has a pH optimum (§5.6)
//   `condensation-hydrolysis` — the chemistry of anabolism and catabolism (§5.8)
//   `polar-bonds`           — electronegativity is why an electron falling towards oxygen releases
//                             anything at all (§5.8)
//
// From chapter 3, because a pathway behaves like a route through compartments:
//   `motor-direction`  — mechanical work: kinesin, one ATP per 8 nm step (§5.4)
//   `wall-osmosis`     — why penicillin, an irreversible inhibitor, kills only growing bacteria (§5.6)
//   `pathway-lesion`   — where cargo piles up when one step of a route is blocked is the same reasoning
//                        as where an intermediate piles up when one enzyme is missing (§5.8)
//
// From chapter 4, which spent this chapter's currency for eight sections:
//   `passive-transport`     — §4.3's point that molecules keep crossing after net movement has stopped
//                             is what ΔG = 0 means, and a reader who has not got it reads equilibrium
//                             as a stop rather than as a balance of two flows (§5.2)
//   `pump-consequences`     — the third of a resting cell's ATP that §4.6 names, which §5.3 has to justify
//   `pump-cycle`            — the pump takes the phosphate onto itself: that IS a shared intermediate (§5.4)
//   `gradient-energy`       — §4.7 worked out what one sodium ion is worth; §5.4 finishes the sum (§5.4)
//   `carrier-saturation`    — the enzyme's rate curve is the carrier's curve, for the same reason (§5.6)
//   `receptor-endocytosis`  — why a statin, which inhibits an enzyme, lowers blood cholesterol (§5.6)

export const OBJECTIVES = [
  // ---- 5.1 Order costs, and something else pays ----
  {
    id: 'energy-forms',
    statement: 'Distinguish kinetic from potential energy, and say which of the two chemical energy is and where a molecule holds it.',
    prereqs: ['bond-types'],
    teaches: { sections: ['order'], figures: ['fig-entropy'] },
    level: 'recall',
  },
  {
    id: 'first-law',
    statement: 'State that energy is conserved, and explain why that means an organism cannot make energy but only take it in and convert it.',
    prereqs: ['energy-forms', 'order-costs-energy'],
    teaches: { sections: ['order'], figures: ['fig-entropy'] },
    level: 'explain',
  },
  {
    id: 'entropy',
    statement: 'Say what entropy measures, and explain why a change that happens by itself leaves the universe with more of it.',
    prereqs: ['energy-forms'],
    teaches: { sections: ['order'], figures: ['fig-entropy'] },
    level: 'explain',
  },
  {
    id: 'second-law-life',
    statement: 'Explain why a growing cell does not break the second law, naming what it exports, in what form, and why that export can never be spent again.',
    prereqs: ['entropy', 'first-law', 'energy-vs-matter'],
    teaches: { sections: ['order'], figures: ['fig-entropy'] },
    level: 'explain',
  },

  // ---- 5.2 What decides which way a reaction goes ----
  {
    id: 'free-energy',
    statement: 'Define free energy, and say what a negative, a positive and a zero value of ΔG each mean for a reaction.',
    prereqs: ['entropy', 'first-law'],
    teaches: { sections: ['freeenergy'], figures: ['fig-free-energy'] },
    level: 'explain',
  },
  {
    id: 'enthalpy-entropy',
    statement: 'Predict the sign of ΔG from the heat term, the entropy term and the temperature, and give a case in which a change that takes heat in still happens.',
    prereqs: ['free-energy', 'hydrophobic-effect'],
    teaches: { sections: ['freeenergy'], figures: ['fig-free-energy'] },
    level: 'apply',
  },
  {
    id: 'spontaneous-not-fast',
    statement: 'Explain why a reaction with a large negative ΔG can sit unchanged for years, and why that is what makes a cell possible rather than what stops it working.',
    prereqs: ['free-energy', 'bond-strengths'],
    teaches: { sections: ['freeenergy'], figures: ['fig-free-energy'] },
    level: 'explain',
  },
  {
    id: 'concentrations-decide',
    statement: 'Work out which way a reaction goes from the concentrations of its reactants and products, and say why that answer can differ from the one the standard value gives.',
    prereqs: ['free-energy', 'passive-transport'],
    teaches: { sections: ['freeenergy'], figures: ['fig-free-energy'] },
    level: 'apply',
  },
  {
    id: 'equilibrium-is-death',
    statement: 'Explain why a living cell is a steady state and never an equilibrium, and say what a cell does to keep a reaction running once its products have built up.',
    prereqs: ['concentrations-decide', 'homeostasis'],
    teaches: { sections: ['freeenergy'], figures: ['fig-free-energy'] },
    level: 'explain',
  },

  // ---- 5.3 The cell spends one molecule ----
  {
    id: 'atp-structure',
    statement: 'Name the three parts of an ATP molecule and say what hydrolysing it produces.',
    prereqs: ['nucleotide-parts', 'functional-groups'],
    teaches: { sections: ['atp'], figures: ['fig-atp'] },
    level: 'recall',
  },
  {
    id: 'atp-why-energy',
    statement: 'Explain why hydrolysing ATP releases free energy, giving reasons that are about the products rather than about the bond that broke.',
    prereqs: ['atp-structure', 'free-energy', 'water-solvent'],
    teaches: { sections: ['atp'], figures: ['fig-atp'] },
    level: 'explain',
  },
  {
    id: 'not-high-energy-bond',
    statement: 'Say what is wrong with calling the outer phosphate bond of ATP a "high-energy bond", and state what breaking any covalent bond actually costs.',
    prereqs: ['atp-why-energy', 'bond-strengths'],
    teaches: { sections: ['atp'], figures: ['fig-atp'] },
    level: 'explain',
  },
  {
    id: 'atp-cellular-value',
    statement: 'Work out what a mole of ATP is worth inside a cell from the cell\'s ATP, ADP and phosphate concentrations, and say why the answer is larger than the standard figure.',
    prereqs: ['atp-why-energy', 'concentrations-decide'],
    teaches: { sections: ['atp'], figures: ['fig-atp'] },
    level: 'apply',
  },
  {
    id: 'currency-not-store',
    statement: 'Explain why ATP is a currency and not a store, using the size of a cell\'s ATP pool against the amount it spends in a day, and predict how long a cell lasts when its supply stops.',
    prereqs: ['atp-cellular-value', 'pump-consequences'],
    teaches: { sections: ['atp'], figures: ['fig-atp'] },
    level: 'explain',
  },

  // ---- 5.4 Nothing is paid for with heat ----
  {
    id: 'coupling-principle',
    statement: 'Add the free energy changes of two reactions to say whether the pair runs, and identify chemical, transport and mechanical work in a cell.',
    prereqs: ['free-energy', 'atp-cellular-value'],
    teaches: { sections: ['coupling'], figures: ['fig-coupling'] },
    level: 'apply',
  },
  {
    id: 'shared-intermediate',
    statement: 'Explain why coupling requires a shared chemical intermediate rather than heat released nearby, and pick out the intermediate in a worked case.',
    prereqs: ['coupling-principle', 'not-high-energy-bond'],
    teaches: { sections: ['coupling'], figures: ['fig-coupling'] },
    level: 'explain',
  },
  {
    id: 'phosphorylation-work',
    statement: 'Explain how transferring a phosphate group to a substrate or to a protein gets something done, using the sodium–potassium pump and a motor protein as the two cases.',
    prereqs: ['shared-intermediate', 'pump-cycle', 'motor-direction'],
    teaches: { sections: ['coupling'], figures: ['fig-coupling'] },
    level: 'explain',
  },
  {
    id: 'pump-efficiency',
    statement: 'Work out the free energy one turn of the sodium–potassium pump has to supply from the gradients it moves ions against, and compare it with what an ATP is worth in the cell.',
    prereqs: ['phosphorylation-work', 'gradient-energy'],
    teaches: { sections: ['coupling'], figures: ['fig-coupling'] },
    level: 'apply',
  },

  // ---- 5.5 An enzyme changes the route, not the destination ----
  {
    id: 'activation-energy',
    statement: 'Explain what an activation energy is, what a transition state is, and why a reaction with a negative ΔG can wait years for one.',
    prereqs: ['spontaneous-not-fast', 'bond-strengths'],
    teaches: { sections: ['enzymes'], figures: ['fig-enzyme'] },
    level: 'explain',
  },
  {
    id: 'enzyme-lowers-barrier',
    statement: 'Explain how an enzyme speeds a reaction, naming what it does to the transition state and at least two ways it does it.',
    prereqs: ['activation-energy', 'free-energy'],
    teaches: { sections: ['enzymes'], figures: ['fig-enzyme'] },
    level: 'explain',
  },
  {
    id: 'enzyme-not-equilibrium',
    statement: 'Predict what adding an enzyme does to the rate, to ΔG and to the position of equilibrium, and explain why it must speed both directions by the same factor.',
    prereqs: ['enzyme-lowers-barrier', 'concentrations-decide'],
    teaches: { sections: ['enzymes'], figures: ['fig-enzyme'] },
    level: 'apply',
  },
  {
    id: 'active-site',
    statement: 'Describe an active site, and explain from induced fit why an enzyme handles one substrate and not its near neighbours.',
    prereqs: ['enzyme-lowers-barrier', 'protein-levels', 'weak-bonds-matter'],
    teaches: { sections: ['enzymes'], figures: ['fig-enzyme'] },
    level: 'explain',
  },
  {
    id: 'why-not-heat',
    statement: 'Explain why a cell speeds its reactions with enzymes rather than with heat, and say what a cell gets from catalysis besides speed.',
    prereqs: ['enzyme-lowers-barrier', 'denaturation'],
    teaches: { sections: ['enzymes'], figures: ['fig-enzyme'] },
    level: 'explain',
  },

  // ---- 5.6 How fast, and what slows it down ----
  {
    id: 'rate-vs-substrate',
    statement: 'Read a rate-against-substrate curve, say what the maximum rate and the Michaelis constant each mean, and explain why the curve flattens.',
    prereqs: ['active-site', 'carrier-saturation'],
    teaches: { sections: ['kinetics'], figures: ['fig-kinetics'] },
    level: 'apply',
  },
  {
    id: 'km-tuning',
    statement: 'Use an enzyme\'s Michaelis constant against the concentration it normally meets to predict whether its rate tracks its substrate or ignores it.',
    prereqs: ['rate-vs-substrate'],
    teaches: { sections: ['kinetics'], figures: ['fig-kinetics'] },
    level: 'apply',
  },
  {
    id: 'enzyme-conditions',
    statement: 'Predict what temperature and pH do to an enzyme\'s rate, and explain why the curve rises gently and falls sharply rather than being symmetrical.',
    prereqs: ['rate-vs-substrate', 'denaturation', 'ph-scale'],
    teaches: { sections: ['kinetics'], figures: ['fig-kinetics'] },
    level: 'apply',
  },
  {
    id: 'inhibition-types',
    statement: 'Distinguish competitive, non-competitive and irreversible inhibition by where the inhibitor binds, by what adding more substrate does, and by what each does to the maximum rate and to the Michaelis constant.',
    prereqs: ['rate-vs-substrate'],
    teaches: { sections: ['kinetics'], figures: ['fig-kinetics'] },
    level: 'explain',
  },
  {
    id: 'drugs-as-inhibitors',
    statement: 'Explain how a named drug or poison works as an enzyme inhibitor, and predict whether giving more substrate would relieve it.',
    prereqs: ['inhibition-types', 'wall-osmosis', 'receptor-endocytosis'],
    teaches: { sections: ['kinetics'], figures: ['fig-kinetics'] },
    level: 'apply',
  },

  // ---- 5.7 A pathway that knows when to stop ----
  {
    id: 'allostery',
    statement: 'Explain how a molecule binding away from the active site changes what an enzyme does, and distinguish an allosteric activator from an allosteric inhibitor.',
    prereqs: ['active-site', 'protein-levels'],
    teaches: { sections: ['regulation'], figures: ['fig-feedback'] },
    level: 'explain',
  },
  {
    id: 'cooperativity',
    statement: 'Explain why an enzyme with several subunits gives an S-shaped rather than a bending curve, and say what a cell gains from a curve of that shape.',
    prereqs: ['allostery', 'rate-vs-substrate'],
    teaches: { sections: ['regulation'], figures: ['fig-feedback'] },
    level: 'explain',
  },
  {
    id: 'feedback-inhibition',
    statement: 'Explain feedback inhibition of a pathway, say why the end product acts on the first committed step rather than on any other, and predict what a reader sees when the loop is broken.',
    prereqs: ['allostery', 'negative-feedback', 'feedback-opened'],
    teaches: { sections: ['regulation'], figures: ['fig-feedback'] },
    level: 'apply',
  },
  {
    id: 'kinase-switch',
    statement: 'Explain how attaching a phosphate group switches a protein on or off, and say where that phosphate comes from and what takes it off again.',
    prereqs: ['phosphorylation-work', 'allostery'],
    teaches: { sections: ['regulation'], figures: ['fig-feedback'] },
    level: 'explain',
  },
  {
    id: 'pathway-homeostasis',
    statement: 'Identify the regulated quantity, the sensor, the set point and the effector in a feedback-inhibited pathway, and say what plays each part.',
    prereqs: ['feedback-inhibition', 'homeostasis', 'set-point'],
    teaches: { sections: ['regulation'], figures: ['fig-feedback'] },
    level: 'apply',
  },

  // ---- 5.8 Metabolism has a shape ----
  {
    id: 'catabolism-anabolism',
    statement: 'Distinguish catabolism from anabolism by the sign of ΔG and by what each does to ATP, and explain why the two routes between the same compounds are never simply each other reversed.',
    prereqs: ['coupling-principle', 'condensation-hydrolysis'],
    teaches: { sections: ['pathways'], figures: ['fig-metabolism'] },
    level: 'explain',
  },
  {
    id: 'redox-basics',
    statement: 'Say what is oxidised and what is reduced in a given reaction, whether the change is written as electrons moving or as hydrogen atoms leaving.',
    prereqs: ['polar-bonds', 'catabolism-anabolism'],
    teaches: { sections: ['pathways'], figures: ['fig-metabolism'] },
    level: 'apply',
  },
  {
    id: 'why-electrons-fall',
    statement: 'Explain from electronegativity why moving electrons towards oxygen releases energy, and use it to say why a fat yields more per gram than a carbohydrate.',
    prereqs: ['redox-basics', 'polar-bonds'],
    teaches: { sections: ['pathways'], figures: ['fig-metabolism'] },
    level: 'explain',
  },
  {
    id: 'electron-carriers',
    statement: 'Explain what NAD⁺ and FAD do between one reaction and another, and why taking a fuel apart in many small steps captures more than burning it in one.',
    prereqs: ['redox-basics', 'nucleotide-parts', 'coupling-principle'],
    teaches: { sections: ['pathways'], figures: ['fig-metabolism'] },
    level: 'explain',
  },
  {
    id: 'pathway-blocked',
    statement: 'Predict which intermediate accumulates and which product disappears when one enzyme of a pathway is missing, and read a metabolic disease the same way.',
    prereqs: ['catabolism-anabolism', 'pathway-lesion', 'feedback-inhibition'],
    teaches: { sections: ['pathways'], figures: ['fig-feedback', 'fig-metabolism'] },
    level: 'apply',
  },
  {
    id: 'diagnose-reaction',
    statement: 'Decide from an observation whether a reaction runs by itself, is coupled to one that does, is exergonic but waiting on an enzyme, or has reached equilibrium.',
    // One section, not four, for the reason chapter 4 gave for `identify-mechanism`: the sort activity
    // that asks for exactly this lives at the end of §5.8, and so does the paragraph that puts the four
    // cases side by side. Naming every section the individual ideas are taught in would list this
    // objective four times in the reader's section headers and claim each of those sections teaches the
    // comparison. The prerequisites are what send a reader who fails it back to what they are missing.
    prereqs: ['concentrations-decide', 'coupling-principle', 'activation-energy'],
    teaches: { sections: ['pathways'], figures: ['fig-free-energy', 'fig-enzyme'] },
    level: 'apply',
  },
];
