// Chapter 2's learning objectives: the claims a reader should be able to make when they have finished
// it. Same contract as chapter 1 (docs/design/adaptive.md): mastery is tracked per objective, every
// question names the objective it tests, and the prerequisite graph is what lets the study queue work
// on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// Four objectives name a chapter-1 objective as a prerequisite: `cell-scale` (molecular-scale),
// `homeostasis` (blood-ph), `order-costs-energy` (condensation-hydrolysis) and `dna-structure`
// (nucleotide-parts). register() keys records by chapter and resolves prerequisites across every
// chapter a page has registered, and docs/design/chapter-recipe.md says a chapter may name objectives
// from earlier chapters.

export const OBJECTIVES = [
  // ---- 2.1 What everything is made of ----
  {
    id: 'element-identity',
    statement: 'Explain why the number of protons fixes which element an atom is, and say what changing the neutrons or the electrons does instead.',
    prereqs: [],
    teaches: { sections: ['atoms'], figures: [] },
    level: 'explain',
  },
  {
    id: 'elements-of-life',
    statement: 'Name the four elements that make up about 96\u00A0per\u00A0cent of a body by mass, and say what the main remaining elements and ions are doing.',
    prereqs: [],
    teaches: { sections: ['atoms'], figures: [] },
    level: 'recall',
  },
  {
    id: 'molecular-scale',
    statement: 'Place a water molecule, a sugar, a protein and a cell on one scale, and say roughly how far water outnumbers everything else inside a cell.',
    prereqs: ['cell-scale'],
    teaches: { sections: ['atoms', 'water'], figures: ['fig-soup'] },
    level: 'apply',
  },
  {
    id: 'valence-bonds',
    statement: 'Use the electrons in an atom\'s outer shell to predict how many covalent bonds it forms.',
    prereqs: ['element-identity'],
    teaches: { sections: ['atoms'], figures: ['fig-bondlab'] },
    level: 'apply',
  },
  {
    id: 'ion-formation',
    statement: 'Explain how an atom becomes an ion, predict the charge a given atom will take, and name a job an ion does in a body.',
    prereqs: ['valence-bonds'],
    teaches: { sections: ['atoms'], figures: ['fig-bondlab'] },
    level: 'apply',
  },

  // ---- 2.2 Atoms stick together ----
  {
    id: 'bond-types',
    statement: 'Distinguish covalent, ionic and hydrogen bonds and van der Waals forces by what holds each one together.',
    prereqs: ['valence-bonds'],
    teaches: { sections: ['bonds'], figures: ['fig-bondlab'] },
    level: 'explain',
  },
  {
    id: 'bond-strengths',
    statement: 'Rank the bond types by the energy needed to break them, and compare each with the thermal energy available at body temperature.',
    prereqs: ['bond-types'],
    teaches: { sections: ['bonds'], figures: ['fig-bondlab'] },
    level: 'recall',
  },
  {
    id: 'polar-bonds',
    statement: 'Use electronegativity to predict whether a given bond is nonpolar, polar or ionic, and where the partial charges sit.',
    prereqs: ['bond-types'],
    teaches: { sections: ['bonds'], figures: ['fig-bondlab'] },
    level: 'apply',
  },
  {
    id: 'weak-bonds-matter',
    statement: 'Explain why the bonds that break easily are the ones that do most of biology\'s work, and how many weak bonds together give a binding its specificity.',
    prereqs: ['bond-strengths'],
    teaches: { sections: ['bonds'], figures: ['fig-bondlab'] },
    level: 'explain',
  },

  // ---- 2.3 Water ----
  {
    id: 'water-shape',
    statement: 'Describe water\'s shape and charge distribution, and explain why a bent molecule is polar where a straight one like carbon dioxide is not.',
    prereqs: ['polar-bonds'],
    teaches: { sections: ['water'], figures: ['fig-water3d'] },
    level: 'explain',
  },
  {
    id: 'water-hbonds',
    statement: 'Explain how one water molecule hydrogen-bonds to as many as four neighbours, and say how long such a bond lasts in liquid water.',
    prereqs: ['water-shape', 'bond-types'],
    teaches: { sections: ['water'], figures: ['fig-water3d'] },
    level: 'explain',
  },
  {
    id: 'cohesion-tension',
    statement: 'Explain cohesion, adhesion and surface tension in terms of hydrogen bonds, and use them to account for water reaching the top of a tall tree.',
    prereqs: ['water-hbonds'],
    teaches: { sections: ['water'], figures: ['fig-waterprops'] },
    level: 'apply',
  },
  {
    id: 'specific-heat',
    statement: 'Explain why water\'s temperature changes slowly for the energy put in, and what that does for an organism and for a coastline.',
    prereqs: ['water-hbonds'],
    teaches: { sections: ['water'], figures: ['fig-waterprops'] },
    level: 'explain',
  },
  {
    id: 'evaporative-cooling',
    statement: 'Explain why evaporation cools what is left behind, and why evaporating water costs so much energy.',
    prereqs: ['specific-heat'],
    teaches: { sections: ['water'], figures: ['fig-waterprops'] },
    level: 'explain',
  },
  {
    id: 'ice-floats',
    statement: 'Explain why ice is less dense than liquid water, and predict what would happen in a lake if it were not.',
    prereqs: ['water-hbonds'],
    teaches: { sections: ['water'], figures: ['fig-waterprops', 'fig-water3d'] },
    level: 'apply',
  },
  {
    id: 'water-solvent',
    statement: 'Predict from its structure whether a substance will dissolve in water, and describe how water surrounds an ion or a sugar.',
    prereqs: ['water-shape', 'polar-bonds'],
    teaches: { sections: ['water'], figures: ['fig-soup'] },
    level: 'apply',
  },
  {
    id: 'hydrophobic-effect',
    statement: 'Explain why nonpolar molecules cluster together in water, and say which substance is doing the pushing.',
    prereqs: ['water-solvent'],
    teaches: { sections: ['water'], figures: [] },
    level: 'explain',
  },

  // ---- 2.4 Acids, bases and pH ----
  {
    id: 'ph-scale',
    statement: 'Convert between hydrogen ion concentration and pH, say what one unit of difference means, and tell an acid from a base by what it does.',
    prereqs: ['water-hbonds'],
    teaches: { sections: ['ph'], figures: ['fig-phlab'] },
    level: 'apply',
  },
  {
    id: 'buffers',
    statement: 'Explain how a pair of a weak acid and its base holds a pH steady, and say what happens when the buffer\'s capacity is used up.',
    prereqs: ['ph-scale'],
    teaches: { sections: ['ph'], figures: ['fig-phlab'] },
    level: 'explain',
  },
  {
    id: 'blood-ph',
    statement: 'State the range blood pH is held in, name the buffer pair that does most of it, and say what the lungs and kidneys contribute.',
    prereqs: ['buffers', 'homeostasis'],
    teaches: { sections: ['ph'], figures: ['fig-phlab'] },
    level: 'apply',
  },

  // ---- 2.5 Carbon builds the skeletons ----
  {
    id: 'carbon-versatility',
    statement: 'Explain what four bonds let carbon do that atoms making one, two or three bonds cannot, and why a hydrocarbon is hydrophobic.',
    prereqs: ['valence-bonds', 'polar-bonds'],
    teaches: { sections: ['carbon'], figures: ['fig-carbonkit'] },
    level: 'explain',
  },
  {
    id: 'isomers',
    statement: 'Explain how two molecules with the same formula can behave differently, and distinguish structural, cis-trans and mirror-image isomers.',
    prereqs: ['carbon-versatility'],
    teaches: { sections: ['carbon'], figures: ['fig-carbonkit'] },
    level: 'explain',
  },
  {
    id: 'functional-groups',
    statement: 'Identify the seven common functional groups and predict what each one does to a molecule\'s solubility, charge and reactivity.',
    prereqs: ['carbon-versatility', 'polar-bonds'],
    teaches: { sections: ['carbon'], figures: ['fig-carbonkit'] },
    level: 'apply',
  },

  // ---- 2.6 Four kinds of large molecule ----
  {
    id: 'condensation-hydrolysis',
    statement: 'Explain what dehydration synthesis and hydrolysis do to a polymer, count the waters exchanged for a given chain, and say which direction costs energy.',
    prereqs: ['functional-groups', 'order-costs-energy'],
    teaches: { sections: ['macromolecules'], figures: ['fig-polymer'] },
    level: 'apply',
  },
  {
    id: 'four-classes',
    statement: 'Name the four classes of large biological molecule, give the monomer of each that has one, and say what each class is for.',
    prereqs: ['condensation-hydrolysis'],
    teaches: { sections: ['macromolecules'], figures: [] },
    level: 'recall',
  },
  {
    id: 'carbohydrate-linkage',
    statement: 'Explain why starch feeds a human and cellulose does not, given that both are chains of glucose.',
    prereqs: ['four-classes'],
    teaches: { sections: ['macromolecules'], figures: ['fig-polymer'] },
    level: 'apply',
  },
  {
    id: 'lipids-not-polymers',
    statement: 'Explain why lipids are grouped by a behaviour rather than by a shared monomer, and say what makes a fat saturated and why that makes it solid.',
    prereqs: ['four-classes'],
    teaches: { sections: ['macromolecules'], figures: ['fig-polymer'] },
    level: 'explain',
  },
  {
    id: 'phospholipid-bilayer',
    statement: 'Predict what phospholipids do when they are put in water, and explain what drives them into a bilayer.',
    prereqs: ['lipids-not-polymers', 'hydrophobic-effect'],
    teaches: { sections: ['macromolecules'], figures: [] },
    level: 'apply',
  },

  // ---- 2.7 Proteins: sequence, shape, job ----
  {
    id: 'amino-acid-structure',
    statement: 'Describe the parts an amino acid always has, say which part varies, and give the kinds of side chain and what each kind does.',
    prereqs: ['functional-groups'],
    teaches: { sections: ['proteins'], figures: ['fig-foldlab'] },
    level: 'recall',
  },
  {
    id: 'peptide-bond',
    statement: 'Explain how a peptide bond forms, and say what the backbone of a polypeptide is made of and why it has a direction.',
    prereqs: ['amino-acid-structure', 'condensation-hydrolysis'],
    teaches: { sections: ['proteins'], figures: ['fig-polymer'] },
    level: 'explain',
  },
  {
    id: 'protein-levels',
    statement: 'Name the four levels of protein structure and say which bonds or forces hold each one together.',
    prereqs: ['peptide-bond', 'weak-bonds-matter'],
    teaches: { sections: ['proteins'], figures: ['fig-foldlab'] },
    level: 'explain',
  },
  {
    id: 'sequence-determines-fold',
    statement: 'Explain why changing one amino acid can change what a protein does, using a case the chapter has not worked through.',
    prereqs: ['protein-levels', 'hydrophobic-effect'],
    teaches: { sections: ['proteins'], figures: ['fig-foldlab'] },
    level: 'apply',
  },
  {
    id: 'denaturation',
    statement: 'Predict what heat or a change in pH does to a protein, say which bonds break and which survive, and explain why the change is often permanent.',
    // ph-scale, not blood-ph: a reader who fumbles this needs the pH scale and what charge does to a
    // side chain, not the renal handling of bicarbonate that blood-ph is about. The queue's job is to
    // work on the missing foundation, and blood-ph sits alongside this objective rather than under it.
    prereqs: ['protein-levels', 'ph-scale'],
    teaches: { sections: ['proteins'], figures: ['fig-foldlab'] },
    level: 'apply',
  },

  // ---- 2.8 Nucleic acids carry the instructions ----
  {
    id: 'nucleotide-parts',
    statement: 'Name the three parts of a nucleotide, say how nucleotides are joined into a chain, and explain why the chain has a direction.',
    prereqs: ['condensation-hydrolysis', 'dna-structure'],
    teaches: { sections: ['nucleic-acids'], figures: [] },
    level: 'recall',
  },
  {
    id: 'dna-vs-rna',
    statement: 'State how DNA and RNA differ in sugar, bases and strandedness, and explain why a guanine-cytosine pair takes more heat to separate than an adenine-thymine one.',
    prereqs: ['nucleotide-parts', 'weak-bonds-matter'],
    teaches: { sections: ['nucleic-acids'], figures: [] },
    level: 'explain',
  },
];
