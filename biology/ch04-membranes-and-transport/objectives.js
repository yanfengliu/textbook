// Chapter 4's learning objectives: the claims a reader should be able to make when they have finished
// it. Same contract as chapters 1 to 3 (docs/design/adaptive.md): mastery is tracked per objective,
// every question names the objective it tests, and the prerequisite graph is what lets the study queue
// work on a missing foundation instead of drilling the thing built on top of it.
//
// `statement` is written as something the reader does, because that is what a question can test.
// `level` is recall (say it), explain (say why), or apply (use it on a case they have not seen).
// `teaches` points back at the prose and the figures, so a wrong answer leads somewhere.
//
// This chapter is the one that sits on top of the two before it, so a third of its prerequisites reach
// out of the chapter. register() keys objectives by chapter and resolves them across the book.
//
// From chapter 2, because the membrane is chapter 2's chemistry with a shape:
//   `phospholipid-bilayer`  — §4.1 is the mechanism behind chapter 2's "what phospholipids do in water"
//   `hydrophobic-effect`    — the one force that builds the bilayer (§4.1) and buries a helix in it (§4.2)
//   `lipids-not-polymers`   — saturated against unsaturated tails, which is what sets fluidity (§4.2)
//   `protein-levels`        — a transmembrane helix is a fold with its greasy side out (§4.2)
//   `polar-bonds`           — what makes a molecule polar is what decides whether it crosses (§4.3)
//   `water-solvent`         — the hydration shell an ion would have to abandon (§4.3), and what it is
//                             for a solute to be dissolved at all, which is what osmosis counts (§4.4)
//   `ion-formation`         — an ion has a charge, so it feels the voltage as well as the gradient (§4.3)
//   `weak-bonds-matter`     — a carrier binds its cargo the way an enzyme binds a substrate, which is
//                             why it has a finite number of sites and therefore saturates (§4.5)
//   `ph-scale`              — a proton pump moves pH, and six units is a millionfold (§4.6)
//
// From chapter 3, because chapter 3 borrowed from this chapter three times and lends back here:
//   `em-tradeoff`           — freeze-fracture is an electron-microscope preparation (§4.1)
//   `fluorescence-what`     — Frye and Edidin's labels, and bleaching a spot, are fluorescence (§4.2)
//   `secretory-route`       — why a vesicle's lumen face becomes the cell's outer face (§4.2, §4.8)
//   `diffusion-time`        — §4.3 applies chapter 3's diffusion to a barrier instead of to cytoplasm
//   `why-cells-small`       — the same surface-and-distance argument, at the scale of a lung (§4.3)
//   `wall-osmosis`          — chapter 3's walled cell, now with the mechanism under it (§4.4)
//   `vacuole-role`          — chapter 3's vacuole pumping solutes so that water follows (§4.4)
//   `endomembrane-members`  — bulk transport is traffic within the system chapter 3 named (§4.8)
//   `lysosome-function`     — where a phagosome and an endocytosed LDL particle end up (§4.8)
//
// From chapter 1: `order-costs-energy` (active transport is that sentence made concrete, §4.6) and
// `homeostasis` (an animal survives osmosis by holding its outside fluid steady, §4.4).

export const OBJECTIVES = [
  // ---- 4.1 Why a membrane builds itself ----
  {
    id: 'amphipathic',
    statement: 'Identify the water-loving and water-avoiding parts of a phospholipid, and say which way each faces in a membrane.',
    prereqs: ['phospholipid-bilayer'],
    teaches: { sections: ['bilayer'], figures: ['fig-bilayer'] },
    level: 'recall',
  },
  {
    id: 'bilayer-selfassembly',
    statement: 'Predict which arrangement — a bilayer sheet, a micelle or an oil droplet — a given lipid will take in water, and say what drives it there.',
    prereqs: ['amphipathic', 'hydrophobic-effect'],
    teaches: { sections: ['bilayer'], figures: ['fig-bilayer'] },
    level: 'apply',
  },
  {
    id: 'bilayer-properties',
    statement: 'Explain why a bilayer closes into a bag and seals its own punctures, given that an exposed edge is what it cannot tolerate.',
    prereqs: ['bilayer-selfassembly'],
    teaches: { sections: ['bilayer'], figures: ['fig-bilayer'] },
    level: 'explain',
  },
  {
    id: 'membrane-evidence',
    statement: 'Say what the Gorter and Grendel monolayer measurement showed and what freeze-fracture added, and explain which model of the membrane freeze-fracture ruled out.',
    prereqs: ['bilayer-properties', 'em-tradeoff'],
    teaches: { sections: ['bilayer'], figures: [] },
    level: 'explain',
  },

  // ---- 4.2 A mosaic that flows ----
  {
    id: 'mosaic-components',
    statement: 'Name what a membrane contains besides phospholipid — proteins, cholesterol and surface carbohydrate — and say where in the sheet each one sits.',
    prereqs: ['bilayer-properties'],
    teaches: { sections: ['mosaic'], figures: ['fig-membrane'] },
    level: 'recall',
  },
  {
    id: 'membrane-fluidity',
    statement: 'Explain what is fluid about a fluid mosaic: what moves easily, how fast, and what almost never happens.',
    prereqs: ['mosaic-components'],
    teaches: { sections: ['mosaic'], figures: ['fig-membrane'] },
    level: 'explain',
  },
  {
    id: 'fluidity-determinants',
    statement: 'Predict what unsaturated tails, temperature and cholesterol each do to a membrane\'s fluidity, and say how an organism uses that.',
    prereqs: ['membrane-fluidity', 'lipids-not-polymers'],
    teaches: { sections: ['mosaic'], figures: ['fig-membrane'] },
    level: 'apply',
  },
  {
    id: 'measuring-fluidity',
    statement: 'Describe how membrane fluidity is measured, by cell fusion and by bleaching a spot and timing its recovery, and read what a partial recovery means.',
    prereqs: ['membrane-fluidity', 'fluorescence-what'],
    teaches: { sections: ['mosaic'], figures: ['fig-membrane'] },
    level: 'apply',
  },
  {
    id: 'membrane-proteins',
    statement: 'Distinguish integral from peripheral membrane proteins, and explain why the stretch of a protein inside the bilayer is hydrophobic while the rest is not.',
    prereqs: ['mosaic-components', 'protein-levels'],
    teaches: { sections: ['mosaic'], figures: ['fig-membrane'] },
    level: 'explain',
  },
  {
    id: 'membrane-asymmetry',
    statement: 'Explain why the two faces of a membrane differ and stay different, and say why the sugars of the glycocalyx can only be on the outside.',
    prereqs: ['membrane-fluidity', 'secretory-route'],
    // Figure 4.8 as well as 4.2: its Follow a patch control is where a reader watches a vesicle's lumen
    // face become the cell's outer face, and `i-membrane-asymmetry-2` is set in it.
    teaches: { sections: ['mosaic'], figures: ['fig-membrane', 'fig-bulk'] },
    level: 'explain',
  },

  // ---- 4.3 What crosses on its own ----
  {
    id: 'permeability-rules',
    statement: 'Rank oxygen, water, urea and a sodium ion by how readily each crosses a bare bilayer, and justify the order from their chemistry.',
    prereqs: ['bilayer-properties', 'polar-bonds'],
    teaches: { sections: ['crossing'], figures: ['fig-permeability'] },
    level: 'apply',
  },
  {
    id: 'ion-barrier',
    statement: 'Explain why an ion is the hardest thing to get across a bilayer although it is small, in terms of its hydration shell and the oily core.',
    prereqs: ['permeability-rules', 'water-solvent'],
    teaches: { sections: ['crossing'], figures: ['fig-permeability'] },
    level: 'explain',
  },
  {
    id: 'passive-transport',
    statement: 'Explain why diffusion is a statistical consequence rather than a force, why it costs the cell nothing, and why molecules keep crossing after net movement has stopped.',
    prereqs: ['permeability-rules', 'diffusion-time'],
    teaches: { sections: ['crossing'], figures: ['fig-permeability'] },
    level: 'explain',
  },
  {
    id: 'flux-factors',
    statement: 'Predict how the rate of diffusion across a membrane changes with the concentration difference, the area and the thickness of the barrier, and use it to account for the shape of a gas-exchange surface.',
    prereqs: ['passive-transport', 'why-cells-small'],
    teaches: { sections: ['crossing'], figures: ['fig-permeability'] },
    level: 'apply',
  },
  {
    id: 'electrochemical-gradient',
    statement: 'Work out which way an ion will move when its concentration gradient and the voltage across the membrane pull in different directions.',
    prereqs: ['passive-transport', 'ion-formation'],
    teaches: { sections: ['crossing'], figures: ['fig-permeability'] },
    level: 'apply',
  },

  // ---- 4.4 Water follows the solute ----
  {
    id: 'osmosis-mechanism',
    statement: 'Explain why water crosses a membrane into a solution when nothing attracts it, and say why adding a solute lowers the tendency of water to leave.',
    prereqs: ['passive-transport', 'water-solvent'],
    teaches: { sections: ['osmosis'], figures: ['fig-osmosis'] },
    level: 'explain',
  },
  {
    id: 'water-potential',
    statement: 'Use water potential — the solute term plus the pressure term — to predict which way water moves between two compartments, and say what pressure would stop it.',
    prereqs: ['osmosis-mechanism'],
    teaches: { sections: ['osmosis'], figures: ['fig-osmosis'] },
    level: 'apply',
  },
  {
    id: 'tonicity-animal',
    statement: 'Predict what happens to an animal cell in a hypotonic, isotonic or hypertonic solution, and explain why tonicity depends on the cell and not on the solution alone.',
    prereqs: ['water-potential'],
    teaches: { sections: ['osmosis'], figures: ['fig-osmosis'] },
    level: 'apply',
  },
  {
    id: 'tonicity-walled',
    statement: 'Predict what happens to a walled cell in the same three solutions, and explain in terms of pressure potential why turgor stops the water arriving and what plasmolysis is.',
    prereqs: ['tonicity-animal', 'wall-osmosis', 'vacuole-role'],
    teaches: { sections: ['osmosis'], figures: ['fig-osmosis'] },
    level: 'apply',
  },
  {
    id: 'osmoregulation',
    statement: 'Explain the three ways of living with osmosis — a wall, continuous bailing, and holding the surrounding fluid isotonic — and say which organisms use which.',
    // One prerequisite per strategy that has an objective of its own: the wall is `tonicity-walled`,
    // holding the fluid isotonic is `tonicity-animal` and `homeostasis`. Bailing has no objective; it is
    // §4.4's margin note and Chapter 1's paramecia.
    prereqs: ['tonicity-animal', 'tonicity-walled', 'homeostasis'],
    teaches: { sections: ['osmosis'], figures: ['fig-osmosis'] },
    level: 'explain',
  },

  // ---- 4.5 Doors, and why a door saturates ----
  {
    id: 'facilitated-diffusion',
    statement: 'Explain why transport through a protein can still be passive, and say what does and does not change when a channel or carrier is added to a membrane.',
    prereqs: ['passive-transport', 'ion-barrier'],
    teaches: { sections: ['channels'], figures: ['fig-transport'] },
    level: 'explain',
  },
  {
    id: 'channel-vs-carrier',
    statement: 'Distinguish a channel from a carrier by mechanism and by rate, name the three things that open a gated channel, and choose which design a given job needs.',
    prereqs: ['facilitated-diffusion'],
    teaches: { sections: ['channels'], figures: ['fig-transport'] },
    level: 'apply',
  },
  {
    id: 'channel-selectivity',
    statement: 'Explain how a potassium channel passes potassium and refuses the smaller sodium ion, using what each ion must do with the water around it.',
    prereqs: ['channel-vs-carrier', 'ion-barrier'],
    teaches: { sections: ['channels'], figures: ['fig-transport'] },
    level: 'explain',
  },
  {
    id: 'carrier-saturation',
    statement: 'Explain why transport through a carrier saturates and simple diffusion does not, and read two rate curves to say which is which.',
    prereqs: ['channel-vs-carrier', 'weak-bonds-matter'],
    teaches: { sections: ['channels'], figures: ['fig-transport'] },
    level: 'apply',
  },
  {
    id: 'aquaporin',
    statement: 'Explain what aquaporins do to a membrane\'s water permeability, and say where a cell needs them and how their number is used as a control.',
    prereqs: ['osmosis-mechanism', 'channel-vs-carrier'],
    // Figure 4.3, not 4.5. Figure 4.5's channel scene is a potassium selectivity filter and has no
    // aquaporin in it, so it could teach nothing here and no task item could be written against it.
    // Figure 4.3 has water among its nine species and a channel that can be dropped in for whichever
    // one is selected: pick water, drop the channel in, and the coefficient climbs from 10⁻³ cm/s to
    // the gas ceiling, which is the whole of this objective's first clause done as a measurement. The
    // second and third clauses — where a cell needs them, and the kidney's regulation by the number of
    // doors — are §4.5's prose, which `sections` already names.
    teaches: { sections: ['channels'], figures: ['fig-permeability'] },
    level: 'explain',
  },

  // ---- 4.6 Pumping uphill ----
  {
    id: 'active-transport',
    statement: 'Distinguish active from passive transport by the direction of the gradient and by where the energy comes from.',
    prereqs: ['electrochemical-gradient', 'order-costs-energy'],
    teaches: { sections: ['active'], figures: ['fig-pump'] },
    level: 'explain',
  },
  {
    id: 'pump-cycle',
    statement: 'Trace the sodium–potassium pump\'s cycle, and state what it moves, in which direction, and at what cost per cycle.',
    prereqs: ['active-transport', 'channel-vs-carrier'],
    teaches: { sections: ['active'], figures: ['fig-pump'] },
    level: 'explain',
  },
  {
    id: 'pump-consequences',
    statement: 'Explain what the sodium–potassium pump is for — the gradients it holds, the cell volume it defends, and the share of a cell\'s energy it takes — and predict what happens when it is blocked.',
    prereqs: ['pump-cycle', 'tonicity-animal'],
    teaches: { sections: ['active'], figures: ['fig-pump'] },
    level: 'explain',
  },
  {
    id: 'proton-pump',
    statement: 'Explain what a proton pump does to the pH on either side of a membrane, and give a case from a lysosome, a plant cell and a stomach.',
    prereqs: ['active-transport', 'ph-scale'],
    teaches: { sections: ['active'], figures: [] },
    level: 'apply',
  },

  // ---- 4.7 A gradient is a battery ----
  {
    id: 'membrane-potential',
    statement: 'Explain where a resting membrane potential comes from, say what the pump does and does not contribute, and predict what raising the potassium outside does to it.',
    prereqs: ['electrochemical-gradient', 'pump-cycle'],
    teaches: { sections: ['gradients'], figures: ['fig-gradients'] },
    level: 'apply',
  },
  {
    id: 'gradient-energy',
    statement: 'Explain in what sense a gradient across a membrane stores energy, and compare what admitting a sodium ion is worth with what hydrolysing an ATP is worth.',
    prereqs: ['active-transport', 'electrochemical-gradient'],
    teaches: { sections: ['gradients'], figures: ['fig-gradients'] },
    level: 'explain',
  },
  {
    id: 'secondary-active',
    statement: 'Explain what makes a transport secondary active, identify what supplies the energy, and distinguish symport from antiport.',
    prereqs: ['gradient-energy'],
    teaches: { sections: ['gradients'], figures: ['fig-gradients'] },
    level: 'explain',
  },
  {
    id: 'gut-glucose',
    statement: 'Trace glucose from the gut lumen into the blood, naming the transporter at each face of the cell and what powers it, and predict what blocking each one does.',
    prereqs: ['secondary-active', 'channel-vs-carrier'],
    teaches: { sections: ['gradients'], figures: ['fig-gradients'] },
    level: 'apply',
  },

  // ---- 4.8 Too big to cross ----
  {
    id: 'bulk-transport',
    statement: 'Say why some cargo needs a vesicle rather than a transporter, and distinguish phagocytosis, pinocytosis and receptor-mediated endocytosis by what decides the cargo.',
    prereqs: ['bilayer-properties', 'endomembrane-members'],
    teaches: { sections: ['bulk'], figures: ['fig-bulk'] },
    level: 'recall',
  },
  {
    id: 'receptor-endocytosis',
    statement: 'Explain how receptor-mediated endocytosis concentrates one chosen cargo, and predict what a faulty receptor does, using cholesterol uptake as the case.',
    prereqs: ['bulk-transport', 'lysosome-function'],
    teaches: { sections: ['bulk'], figures: ['fig-bulk'] },
    level: 'apply',
  },
  {
    id: 'membrane-budget',
    statement: 'Explain why endocytosis and exocytosis must balance, and say what happens to a patch of membrane, and to the sugars on it, as it goes out and comes back.',
    prereqs: ['bulk-transport', 'membrane-asymmetry'],
    teaches: { sections: ['bulk'], figures: ['fig-bulk'] },
    level: 'explain',
  },
  {
    id: 'identify-mechanism',
    statement: 'Decide from an observation which transport mechanism is at work, using the direction of the gradient, whether a ceiling appears, and whether stopping the energy supply stops it.',
    prereqs: ['secondary-active', 'facilitated-diffusion', 'bulk-transport'],
    // One section, not four. The sort activity that asks for exactly this lives in §4.8, and so does
    // the paragraph that puts the four mechanisms side by side; naming every section the individual
    // mechanisms are taught in would list this objective four times in the reader's section headers
    // and claim each of those sections teaches the comparison. The prerequisites are what send a
    // reader who fails it back to the section they are actually missing.
    teaches: { sections: ['bulk'], figures: ['fig-transport', 'fig-bulk'] },
    level: 'apply',
  },
];
