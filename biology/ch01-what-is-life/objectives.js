// Chapter 1's learning objectives: the claims a reader should be able to make when they have
// finished it. This is the spine of the adaptive study system (docs/design/adaptive.md): mastery is
// tracked per objective, every question names the objective it tests, and the prerequisite graph is
// what lets the queue work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// `npm run check` enforces: unique ids, every prereq resolves, no cycles, every section and figure
// named here exists in the chapter, and every objective is tested by at least one item.

export const OBJECTIVES = [
  // ---- 1.1 The question biology asks ----
  {
    id: 'why-no-definition',
    statement: 'Explain why biologists recognise life by a family of shared properties rather than by a single definition.',
    prereqs: [],
    teaches: { sections: ['question'], figures: [] },
    level: 'explain',
  },
  {
    id: 'borderline-cases',
    statement: 'Decide whether a given thing is alive, and name which property of life it has or lacks.',
    prereqs: ['properties-of-life'],
    teaches: { sections: ['question'], figures: ['fig-pond'] },
    level: 'apply',
  },

  // ---- 1.2 What all living things share ----
  {
    id: 'properties-of-life',
    statement: 'Name the seven properties that every known organism shares.',
    prereqs: [],
    teaches: { sections: ['properties'], figures: [] },
    level: 'recall',
  },
  {
    id: 'homeostasis',
    statement: 'Define homeostasis and give an example of a quantity a body holds steady.',
    prereqs: ['properties-of-life'],
    teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
    level: 'explain',
  },
  {
    id: 'set-point',
    statement: 'Explain what a set point is, and what a fever does to it.',
    prereqs: ['homeostasis'],
    teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
    level: 'explain',
  },
  {
    id: 'negative-feedback',
    statement: 'Explain why a loop whose response opposes a change produces a steady state.',
    prereqs: ['homeostasis'],
    teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
    level: 'explain',
  },
  {
    id: 'feedback-direction',
    statement: 'Predict which effectors fire when core temperature leaves its set point, and which way the response pushes it.',
    prereqs: ['negative-feedback', 'set-point'],
    teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
    level: 'apply',
  },
  {
    id: 'feedback-opened',
    statement: 'Predict what a disturbance does to a regulated quantity when the feedback loop is opened.',
    prereqs: ['feedback-direction'],
    teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
    level: 'apply',
  },

  // ---- 1.3 Life is organised in levels ----
  {
    id: 'levels-of-organisation',
    statement: 'Put the levels of organisation in order from atom to biosphere.',
    prereqs: [],
    teaches: { sections: ['levels'], figures: ['fig-levels'] },
    level: 'recall',
  },
  {
    id: 'emergence',
    statement: 'Identify an emergent property and explain why no part has it alone.',
    prereqs: ['levels-of-organisation'],
    teaches: { sections: ['levels'], figures: ['fig-levels'] },
    level: 'apply',
  },
  {
    id: 'cell-scale',
    statement: 'State the size of a typical animal cell and place other structures on a logarithmic scale beside it.',
    prereqs: [],
    teaches: { sections: ['levels'], figures: ['fig-scale'] },
    level: 'apply',
  },
  {
    id: 'resolution-limits',
    statement: 'Say which instrument can resolve a given structure, and why an ordinary light microscope stops near 200 nm.',
    prereqs: ['cell-scale'],
    teaches: { sections: ['levels'], figures: ['fig-scale'] },
    level: 'apply',
  },

  // ---- 1.4 The cell is the unit of life ----
  {
    id: 'cell-theory',
    statement: 'State the three claims of cell theory.',
    prereqs: [],
    teaches: { sections: ['cell'], figures: [] },
    level: 'recall',
  },
  {
    id: 'prokaryote-eukaryote',
    statement: 'Distinguish a prokaryotic cell from a eukaryotic one by structure and by size.',
    prereqs: ['cell-theory'],
    teaches: { sections: ['cell'], figures: ['fig-cell'] },
    level: 'explain',
  },
  {
    id: 'organelle-function',
    statement: 'Name what each major organelle of an animal cell does.',
    prereqs: ['prokaryote-eukaryote'],
    teaches: { sections: ['cell'], figures: ['fig-cell'] },
    level: 'recall',
  },
  {
    id: 'organelle-reasoning',
    statement: 'Predict what a cell could no longer do if a named organelle were missing or broken.',
    prereqs: ['organelle-function'],
    teaches: { sections: ['cell'], figures: ['fig-cell'] },
    level: 'apply',
  },

  // ---- 1.5 Life runs on information ----
  {
    id: 'dna-structure',
    statement: 'Describe the double helix: two backbones, rungs of paired bases, and the rule that pairs them.',
    prereqs: [],
    teaches: { sections: ['information'], figures: ['fig-dna'] },
    level: 'explain',
  },
  {
    id: 'complementarity',
    statement: 'Write the complementary strand for a short sequence, and explain why pairing makes copying and repair possible.',
    prereqs: ['dna-structure'],
    teaches: { sections: ['information'], figures: ['fig-dna'] },
    level: 'apply',
  },
  {
    id: 'gene-genome',
    statement: 'Distinguish a gene from a genome, and give the rough scale of each.',
    prereqs: ['dna-structure'],
    teaches: { sections: ['information'], figures: [] },
    level: 'explain',
  },
  {
    id: 'universal-code',
    statement: 'Explain why the same genetic code in every known organism is evidence of common ancestry.',
    prereqs: ['dna-structure'],
    teaches: { sections: ['information'], figures: [] },
    level: 'explain',
  },

  // ---- 1.6 Energy flows and matter cycles ----
  {
    id: 'order-costs-energy',
    statement: 'Explain why staying ordered obliges an organism to take in energy continuously.',
    prereqs: [],
    teaches: { sections: ['energy'], figures: [] },
    level: 'explain',
  },
  {
    id: 'energy-vs-matter',
    statement: 'Explain why energy passes through an ecosystem once while matter goes round.',
    prereqs: ['order-costs-energy'],
    teaches: { sections: ['energy'], figures: ['fig-energy'] },
    level: 'explain',
  },
  {
    id: 'trophic-roles',
    statement: 'Say what producers, consumers and decomposers each do to energy and to matter.',
    prereqs: ['energy-vs-matter'],
    teaches: { sections: ['energy'], figures: ['fig-energy'] },
    level: 'recall',
  },
  {
    id: 'trophic-efficiency',
    statement: 'Use the rule that about a tenth of the energy passes on to explain why food chains are short.',
    prereqs: ['trophic-roles'],
    teaches: { sections: ['energy'], figures: ['fig-energy'] },
    level: 'apply',
  },

  // ---- 1.7 Evolution explains the pattern ----
  {
    id: 'natural-selection',
    statement: 'State the conditions under which natural selection happens.',
    prereqs: [],
    teaches: { sections: ['evolution'], figures: [] },
    level: 'explain',
  },
  {
    id: 'adaptation-explained',
    statement: 'Explain why natural selection is the process that produces adaptation, and what it does not explain.',
    prereqs: ['natural-selection'],
    teaches: { sections: ['evolution'], figures: [] },
    level: 'apply',
  },
  {
    id: 'three-domains',
    statement: 'Name the three domains of life and say where eukaryotes branch from.',
    prereqs: [],
    teaches: { sections: ['evolution'], figures: ['fig-tree'] },
    level: 'recall',
  },
  {
    id: 'endosymbiosis',
    statement: 'Explain what endosymbiosis is, which organelles came from it, and what evidence still shows it.',
    prereqs: ['three-domains', 'organelle-function'],
    teaches: { sections: ['evolution'], figures: ['fig-tree', 'fig-cell'] },
    level: 'explain',
  },
  {
    id: 'unity-of-life',
    statement: 'Explain what features shared by all known life imply about their ancestry.',
    prereqs: ['three-domains', 'universal-code'],
    teaches: { sections: ['evolution'], figures: ['fig-tree'] },
    level: 'apply',
  },

  // ---- 1.8 How biologists know ----
  {
    id: 'hypothesis-vs-theory',
    statement: 'Distinguish a hypothesis from a theory as science uses those words.',
    prereqs: [],
    teaches: { sections: ['method'], figures: [] },
    level: 'explain',
  },
  {
    id: 'controlled-experiment',
    statement: 'Identify the control in an experiment and say which explanation it rules out.',
    prereqs: [],
    teaches: { sections: ['method'], figures: ['fig-pasteur'] },
    level: 'apply',
  },
  {
    id: 'pasteur-logic',
    statement: 'Explain how the swan neck separated "air reaches the broth" from "microbes reach the broth", and what tilting the flask added.',
    prereqs: ['controlled-experiment'],
    teaches: { sections: ['method'], figures: ['fig-pasteur'] },
    level: 'apply',
  },
  {
    id: 'testing-not-proving',
    statement: 'Explain what it means that science tests a claim rather than proving it.',
    prereqs: ['hypothesis-vs-theory'],
    teaches: { sections: ['method'], figures: [] },
    level: 'explain',
  },
];
