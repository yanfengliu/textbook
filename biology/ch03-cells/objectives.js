// Chapter 3's learning objectives: the claims a reader should be able to make when they have finished
// it. This is the spine of the adaptive study system (docs/design/adaptive.md): mastery is tracked per
// objective, every question names the objective it tests, and the prerequisite graph is what lets the
// queue work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// Six prerequisites name objectives of chapter 1 rather than of this chapter, because chapter 3 is
// built on section 1.4 and does not repeat it: `resolution-limits`, `cell-scale`,
// `prokaryote-eukaryote`, `organelle-function`, `three-domains` and `endosymbiosis`. register() keys
// objectives by chapter, so the study queue resolves them across chapters (see
// docs/design/chapter-recipe.md, "The objectives"). `cell-theory` is not cited directly: it is already
// a prerequisite of `prokaryote-eukaryote` in chapter 1.

export const OBJECTIVES = [
  // ---- 3.1 Seeing the cell ----
  {
    id: 'magnification-resolution',
    statement: 'Distinguish magnification from resolution, and say why extra magnification past an instrument\'s limit adds nothing.',
    prereqs: ['resolution-limits'],
    teaches: { sections: ['seeing'], figures: ['fig-microscopes'] },
    level: 'explain',
  },
  {
    id: 'abbe-limit',
    statement: 'Predict whether a given instrument can resolve two structures a given distance apart, using the wavelength and the numerical aperture.',
    prereqs: ['magnification-resolution'],
    teaches: { sections: ['seeing'], figures: ['fig-microscopes'] },
    level: 'apply',
  },
  {
    id: 'fluorescence-what',
    statement: 'Explain what fluorescence microscopy shows that other light microscopy cannot, and why it does not improve resolution.',
    prereqs: ['magnification-resolution'],
    teaches: { sections: ['seeing'], figures: ['fig-microscopes'] },
    level: 'explain',
  },
  {
    id: 'em-tradeoff',
    statement: 'Say what an electron microscope buys and what it costs, and when a transmission instrument is wanted rather than a scanning one.',
    prereqs: ['magnification-resolution'],
    teaches: { sections: ['seeing'], figures: ['fig-microscopes'] },
    level: 'explain',
  },

  // ---- 3.2 Why cells are small ----
  {
    id: 'sav-arithmetic',
    statement: 'Work out the surface-area-to-volume ratio of a sphere or a cube and say how it changes as the object grows.',
    prereqs: ['cell-scale'],
    teaches: { sections: ['small'], figures: ['fig-sav'] },
    level: 'apply',
  },
  {
    id: 'why-cells-small',
    statement: 'Explain why demand scales with a cell\'s volume while supply scales with its surface, and what that implies about size.',
    prereqs: ['sav-arithmetic'],
    teaches: { sections: ['small'], figures: ['fig-sav'] },
    level: 'explain',
  },
  {
    id: 'diffusion-time',
    statement: 'Use the rule that diffusion time grows as the square of distance to compare how long a molecule takes to cross a cell, a tissue and a body.',
    prereqs: ['sav-arithmetic'],
    teaches: { sections: ['small'], figures: ['fig-sav'] },
    level: 'apply',
  },
  {
    id: 'sav-adaptations',
    statement: 'Explain how a flattened shape, a fringe of microvilli or motor transport lets a cell escape the limit that surface area and diffusion impose.',
    prereqs: ['why-cells-small', 'diffusion-time'],
    teaches: { sections: ['small'], figures: ['fig-sav'] },
    level: 'apply',
  },

  // ---- 3.3 The prokaryotic cell ----
  {
    id: 'prokaryote-parts',
    statement: 'Name the parts of a prokaryotic cell — nucleoid, plasmids, ribosomes, membrane, wall, capsule, pili, flagellum — and say what each is for.',
    prereqs: ['prokaryote-eukaryote'],
    teaches: { sections: ['prokaryote'], figures: ['fig-prokaryote'] },
    level: 'recall',
  },
  {
    id: 'nucleoid-plasmid',
    statement: 'Distinguish the nucleoid from a plasmid, and explain what follows from the DNA having no membrane around it.',
    prereqs: ['prokaryote-parts'],
    teaches: { sections: ['prokaryote'], figures: ['fig-prokaryote'] },
    level: 'explain',
  },
  {
    id: 'wall-osmosis',
    statement: 'Predict what happens to a walled cell and to a wall-less one when the medium around them is diluted, and why penicillin only kills growing bacteria.',
    prereqs: ['prokaryote-parts'],
    teaches: { sections: ['prokaryote'], figures: ['fig-prokaryote'] },
    level: 'apply',
  },
  {
    id: 'gram-difference',
    statement: 'Explain the structural difference between gram-positive and gram-negative envelopes and why the stain comes out as it does.',
    prereqs: ['wall-osmosis'],
    teaches: { sections: ['prokaryote'], figures: ['fig-prokaryote'] },
    level: 'explain',
  },
  {
    id: 'bacteria-archaea',
    statement: 'Compare bacteria and archaea by membrane, wall and information machinery, and say which one eukaryotes resemble in each respect.',
    prereqs: ['prokaryote-parts', 'three-domains'],
    teaches: { sections: ['prokaryote'], figures: ['fig-prokaryote'] },
    level: 'explain',
  },

  // ---- 3.4 The endomembrane system ----
  {
    id: 'endomembrane-members',
    statement: 'Name the compartments of the endomembrane system, and name two organelles that are not part of it.',
    prereqs: ['organelle-function'],
    teaches: { sections: ['endomembrane'], figures: ['fig-secretion'] },
    level: 'recall',
  },
  {
    id: 'er-golgi-jobs',
    statement: 'Say what rough ER, smooth ER and the Golgi apparatus each do, and predict which is abundant in a given specialised cell.',
    prereqs: ['endomembrane-members'],
    teaches: { sections: ['endomembrane'], figures: ['fig-secretion'] },
    level: 'explain',
  },
  {
    id: 'signal-sorting',
    statement: 'Explain how a signal peptide gets a protein into the endoplasmic reticulum, and how a chemical tag gets it to the right destination afterwards.',
    prereqs: ['endomembrane-members'],
    teaches: { sections: ['endomembrane'], figures: ['fig-secretion'] },
    level: 'explain',
  },
  {
    id: 'secretory-route',
    statement: 'Trace a secreted protein from the ribosome to the outside of the cell, naming each compartment and what is done to the protein there.',
    prereqs: ['er-golgi-jobs', 'signal-sorting'],
    teaches: { sections: ['endomembrane'], figures: ['fig-secretion'] },
    level: 'explain',
  },
  {
    id: 'lysosome-function',
    statement: 'Explain what a lysosome digests, why its interior is acidic, and what happens when one of its enzymes is missing.',
    prereqs: ['endomembrane-members'],
    teaches: { sections: ['endomembrane'], figures: ['fig-secretion'] },
    level: 'explain',
  },
  {
    id: 'pathway-lesion',
    statement: 'Predict where cargo accumulates when a named step of the secretory route is blocked, and read a pulse-chase result the same way.',
    prereqs: ['secretory-route'],
    teaches: { sections: ['endomembrane'], figures: ['fig-secretion'] },
    level: 'apply',
  },

  // ---- 3.5 Mitochondria and chloroplasts ----
  {
    id: 'organelle-architecture',
    statement: 'Describe the membranes and internal spaces of a mitochondrion and a chloroplast, and explain why the amount of folding matters.',
    prereqs: ['organelle-function'],
    teaches: { sections: ['symbionts'], figures: ['fig-symbiont'] },
    level: 'explain',
  },
  {
    id: 'organelle-genomes',
    statement: 'State that mitochondria and chloroplasts carry their own DNA and bacterial-type ribosomes, and divide by fission.',
    prereqs: ['organelle-architecture'],
    teaches: { sections: ['symbionts'], figures: ['fig-symbiont'] },
    level: 'recall',
  },
  {
    id: 'endosymbiosis-evidence',
    statement: 'Judge which observations distinguish endosymbiosis from an origin by infolding of the host membrane, and which are consistent with both.',
    prereqs: ['organelle-genomes', 'endosymbiosis'],
    teaches: { sections: ['symbionts'], figures: ['fig-symbiont'] },
    level: 'apply',
  },
  {
    id: 'gene-transfer',
    statement: 'Explain why mitochondria and chloroplasts cannot live on their own, given how few genes their genomes still hold.',
    prereqs: ['organelle-genomes'],
    teaches: { sections: ['symbionts'], figures: ['fig-symbiont'] },
    level: 'explain',
  },

  // ---- 3.6 The cytoskeleton ----
  {
    id: 'filament-types',
    statement: 'Name the three cytoskeletal filament families with their diameters and subunits.',
    prereqs: [],
    teaches: { sections: ['cytoskeleton'], figures: ['fig-cytoskeleton'] },
    level: 'recall',
  },
  {
    id: 'filament-jobs',
    statement: 'Choose which filament family is responsible for a given job in a cell, and justify the choice from its properties.',
    prereqs: ['filament-types'],
    teaches: { sections: ['cytoskeleton'], figures: ['fig-cytoskeleton'] },
    level: 'apply',
  },
  {
    id: 'motor-direction',
    statement: 'Predict which motor protein carries a cargo, along which filament, and in which direction.',
    prereqs: ['filament-types'],
    teaches: { sections: ['cytoskeleton'], figures: ['fig-cytoskeleton'] },
    level: 'apply',
  },
  {
    id: 'axoneme-structure',
    statement: 'Describe the 9+2 axoneme and the 9+0 triplets of the basal body, and say which cilia lack the central pair.',
    prereqs: ['filament-types'],
    teaches: { sections: ['cytoskeleton'], figures: ['fig-cilium'] },
    level: 'recall',
  },
  {
    id: 'cilium-bending',
    statement: 'Explain how dynein sliding one doublet against another produces a bend rather than a slip, and what happens when the dynein arms are missing.',
    prereqs: ['axoneme-structure', 'motor-direction'],
    teaches: { sections: ['cytoskeleton'], figures: ['fig-cilium'] },
    level: 'explain',
  },
  {
    id: 'two-flagella',
    statement: 'Contrast the bacterial flagellum with the eukaryotic one in structure, power source and motion, and say why sharing a name misleads.',
    prereqs: ['axoneme-structure', 'prokaryote-parts'],
    teaches: { sections: ['cytoskeleton'], figures: ['fig-cilium', 'fig-prokaryote'] },
    level: 'explain',
  },

  // ---- 3.7 The cell surface, and outside it ----
  {
    id: 'wall-vs-matrix',
    statement: 'Contrast a plant cell wall with an animal extracellular matrix in composition, mechanics and what each lets its cell do.',
    prereqs: ['wall-osmosis'],
    teaches: { sections: ['surface'], figures: [] },
    level: 'explain',
  },
  {
    id: 'ecm-signalling',
    statement: 'Explain how integrins make the extracellular matrix mechanically and informationally continuous with the cytoskeleton.',
    prereqs: ['wall-vs-matrix'],
    teaches: { sections: ['surface'], figures: [] },
    level: 'explain',
  },
  {
    id: 'junction-types',
    statement: 'Decide which junction — tight, desmosome, gap or plasmodesma — explains a given observation about a tissue.',
    prereqs: ['wall-vs-matrix'],
    teaches: { sections: ['surface'], figures: [] },
    level: 'apply',
  },
  {
    id: 'plasmodesmata',
    statement: 'Explain what plasmodesmata connect and how they differ, structurally and in what passes through them, from gap junctions.',
    prereqs: ['junction-types'],
    teaches: { sections: ['surface', 'plant-animal'], figures: ['fig-plantcell'] },
    level: 'explain',
  },

  // ---- 3.8 Plant cells and animal cells ----
  {
    id: 'plant-animal-differences',
    statement: 'Name what a plant cell has that an animal cell does not, and what an animal cell has that a plant cell does not.',
    prereqs: ['organelle-function'],
    teaches: { sections: ['plant-animal'], figures: ['fig-plantcell'] },
    level: 'recall',
  },
  {
    id: 'vacuole-role',
    statement: 'Explain how the central vacuole generates turgor and lets a plant cell be large while its cytoplasm stays a thin layer.',
    prereqs: ['plant-animal-differences', 'why-cells-small'],
    teaches: { sections: ['plant-animal'], figures: ['fig-plantcell'] },
    level: 'explain',
  },
];
