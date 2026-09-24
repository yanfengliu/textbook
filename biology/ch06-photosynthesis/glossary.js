// Chapter 6 glossary. Every <tb-term ref="..."> in index.html names a key here, and every key here is
// used in the chapter at least once (npm run check enforces both). `def` may hold inline HTML.
//
// Terms chapters 1 to 5 already introduced are not repeated: producer, consumer, organelle, mitochondrion,
// cristae, plastid, vacuole, tonoplast, plasmodesma, cellulose, vesicle, ribosome, covalent bond,
// electronegativity, polar, ion, mole, hydrogen bond, hydrophobic, functional group, polysaccharide,
// monosaccharide, protein, denaturation, nucleotide, pH, buffer, osmosis, diffusion, concentration
// gradient, electrochemical gradient, membrane potential, proton pump, amphipathic, active transport,
// free energy, exergonic, endergonic, ATP, ADP, energy coupling, phosphorylation, enzyme, catalyst,
// activation energy, transition state, active site, substrate, cofactor, coenzyme, maximum rate,
// Michaelis constant, turnover number, competitive inhibition, allostery, metabolic pathway, catabolism,
// anabolism, oxidation, reduction, redox reaction, electron carrier, NAD⁺, FAD.
//
// Three are repeated on purpose, each for the reason chapter 4 gave when it repeated `osmosis` and
// chapter 5 gave when it repeated `enzyme` and `ATP`: this is the chapter where the word does its work
// and the popover has to be there when it is asked.
//
//   chloroplast — §3.5 defined it as a structure and a piece of evidence for endosymbiosis. Here it is a
//     factory with two halves, so the entry is rewritten around what happens in each of its spaces.
//   thylakoid   — §3.5 named the discs. Here the point is that they are sealed and share one lumen,
//     which is the whole reason §6.5 works, so the entry says that instead.
//   stroma      — §3.5 said it holds "the enzymes that build sugar". This chapter names them.
//
// Two entries are headed by a name rather than by the symbol the prose sets, because a term is shown as
// text in the glossary list and in every popover (src/components/term.js escapes it) and markup in it
// would be printed as written: `nadp` is "Nicotinamide adenine dinucleotide phosphate", as chapter 5's
// `nad` is headed by its full name, and `cytochrome-b6f` is "Cytochrome complex", the prose's own
// short name for it. Each definition says how the symbol is written, with its markup, where it renders.
//
// Peroxisome has been used three times in this book — in §3.8's figure, in §5.8's sort activity, and now
// in §6.7's salvage route — and defined nowhere, so it is defined here.
export const GLOSSARY = {
  // ---- 6.1 Everything here is running on sunlight ----
  photosynthesis: { term: 'Photosynthesis', def: 'The use of light energy to build carbon compounds from carbon dioxide. In plants, algae and cyanobacteria the electrons come from water, which is why the by-product is oxygen; other bacteria take them from hydrogen sulfide or iron instead, and give off no oxygen at all.' },
  photon: { term: 'Photon', def: 'The smallest possible amount of light of a given colour. A molecule absorbs a whole photon or none of it, and the energy in one is fixed by its wavelength: short-wavelength blue photons carry more than long-wavelength red ones.' },
  autotroph: { term: 'Autotroph', def: 'An organism that builds its own carbon compounds from carbon dioxide, using light or the oxidation of an inorganic chemical as its energy source. Chapter 1 called them producers; this is the same set of organisms named by their chemistry.' },
  heterotroph: { term: 'Heterotroph', def: 'An organism that gets its carbon by eating compounds another organism has already built. Every animal and fungus is one, and so are most bacteria.' },
  'excited-state': { term: 'Excited state', def: 'A molecule with one of its electrons in a higher orbital, put there by an absorbed photon. It lasts a few billionths of a second and gives that electron away far more readily than the unexcited molecule would. In chlorophyll it holds a red photon\'s worth of energy whatever colour was absorbed: a blue photon\'s surplus is shed as heat within a picosecond.' },
  'carbon-fixation': { term: 'Carbon fixation', def: 'The attachment of carbon dioxide to an organic molecule, turning inorganic carbon into part of a compound a cell can work on. It is the step that puts carbon into the living world, and almost all of it is done by one enzyme.' },

  // ---- 6.2 A compartment inside a compartment ----
  chloroplast: { term: 'Chloroplast', def: 'The organelle of photosynthesis: two envelope membranes around a fluid stroma, and suspended in that stroma a third membrane system, the thylakoids. The light reactions happen on the thylakoid membrane and the carbon reactions in the stroma, and each half is useless without the other.' },
  thylakoid: { term: 'Thylakoid', def: 'The flattened, sealed sac whose membrane carries the photosystems. Its interior is separate from the stroma and, within one chloroplast, is largely one connected space — which is what lets the light reactions charge a single gradient across the whole system.' },
  granum: { term: 'Granum', def: 'A stack of thylakoids, seen under the electron microscope as a pile of discs; the plural is grana. Stacking packs more membrane, and so more photosystems, into the same volume — the same argument the cristae of Section 3.5 make.' },
  lumen: { term: 'Thylakoid lumen', def: 'The space inside the thylakoid sacs. Protons are put into it and it becomes acidic; it is one of the three watery compartments a chloroplast keeps apart, and the only one this chapter asks the reader to count protons in.' },
  stroma: { term: 'Stroma', def: 'The fluid filling a chloroplast outside the thylakoids. It holds the Calvin cycle\'s enzymes, the chloroplast\'s own DNA and ribosomes, and usually grains of starch; and it is where the ATP and the NADPH made on the thylakoid membrane are delivered.' },
  mesophyll: { term: 'Mesophyll', def: 'The layers of chloroplast-filled cells in the middle of a leaf, between the upper and lower skin. The cells are loosely packed, with air spaces between them, so that carbon dioxide can reach the wet surface of every one.' },
  stoma: { term: 'Stoma', def: 'An adjustable pore in a leaf\'s surface, made by two guard cells that bow apart to open it; the plural is stomata. Carbon dioxide comes in through it and water vapour goes out through it, and the plant cannot have one without the other.' },
  transpiration: { term: 'Transpiration', def: 'The loss of water vapour from a plant, almost all of it through open stomata. It is the price of admitting carbon dioxide, and it is the cost that Section 6.8\'s two adaptations are built to reduce.' },

  // ---- 6.3 Green is the part a leaf uses least ----
  pigment: { term: 'Pigment', def: 'A molecule that absorbs some visible wavelengths and not others. Its colour is what it fails to absorb — the light that passes through or bounces off it and reaches an eye.' },
  chlorophyll: { term: 'Chlorophyll', def: 'The green pigment that does the photochemistry: a flat ring of alternating bonds with a magnesium ion held at its centre, and a long hydrocarbon tail that anchors it in the thylakoid membrane. It absorbs strongly in the blue and the red and weakly in the green.' },
  'accessory-pigment': { term: 'Accessory pigment', def: 'A pigment that absorbs light chlorophyll a absorbs poorly and passes the energy on to it. Chlorophyll b and the carotenoids are the common ones in a plant; algae have others, which is why they are not all green.' },
  carotenoid: { term: 'Carotenoid', def: 'An orange or yellow accessory pigment that absorbs blue and blue-green light. It has a second job that matters more: it quenches an excited chlorophyll that has been left too long with nowhere to send its energy, and so keeps the membrane from being destroyed by its own light.' },
  'absorption-spectrum': { term: 'Absorption spectrum', def: 'A plot of how strongly a pigment absorbs each wavelength. It is measured on the pigment, usually extracted into a solvent, and it says nothing on its own about whether the absorbed light drives anything.' },
  'action-spectrum': { term: 'Action spectrum', def: 'A plot of how well each wavelength drives a process — for photosynthesis, usually how much oxygen it produces. It is measured on the living thing, and comparing it with an absorption spectrum is how a pigment is shown to be the one doing the work.' },
  photosystem: { term: 'Photosystem', def: 'A reaction centre with its antenna: a few hundred pigment molecules that absorb light and pass the energy inwards, and at the middle a pair of chlorophylls that does something no other pigment in the set does — gives an electron away.' },
  antenna: { term: 'Antenna', def: 'The pigments of a photosystem that only collect. They hand the energy on from one molecule to the next by resonance, not by passing electrons, and their purpose is to keep the reaction centre supplied, since a single chlorophyll is struck far too rarely to keep one busy.' },
  'reaction-centre': { term: 'Reaction centre', def: 'The pair of chlorophylls at the heart of a photosystem, together with the acceptor that takes the electron from them. It is the only place in the whole assembly where energy stops being an excited state and becomes a separated charge.' },

  // ---- 6.4 Two pushes, and water pays for both ----
  'light-reactions': { term: 'Light reactions', def: 'The half of photosynthesis that happens on the thylakoid membrane: light is absorbed, water is split, electrons are driven to NADP<sup>+</sup>, protons are moved into the lumen, and ATP and NADPH are handed to the stroma.' },
  'z-scheme': { term: 'Z scheme', def: 'The path of an electron from water to NADPH, drawn against how tightly each carrier holds it. Two light-driven climbs separated by a downhill run gives the zigzag the name describes, and the downhill run is where the protons are moved.' },
  'oxygen-evolving-complex': { term: 'Oxygen-evolving complex', def: 'The cluster of four manganese ions and one calcium ion on the lumen side of photosystem II that takes electrons from water. It holds its count, giving up one oxygen molecule only after four separate photons have removed four electrons.' },
  plastoquinone: { term: 'Plastoquinone', def: 'A small, oily, mobile carrier that takes two electrons and two protons from photosystem II and diffuses within the membrane to the cytochrome complex. Taking protons from one side of the membrane and releasing them on the other is how it moves charge across.' },
  'cytochrome-b6f': { term: 'Cytochrome complex', def: 'The complex between the two photosystems, written cytochrome <i>b</i><sub>6</sub><i>f</i> after two of the cytochromes it contains. It accepts electrons from plastoquinone and passes them to plastocyanin, and in doing so it pumps protons from the stroma into the lumen: the only proton pump in the chain.' },
  plastocyanin: { term: 'Plastocyanin', def: 'A small copper-containing protein that carries one electron at a time along the lumen face of the membrane, from the cytochrome complex to photosystem I.' },
  ferredoxin: { term: 'Ferredoxin', def: 'A small iron–sulfur protein on the stromal side that takes the electron from photosystem I. It is the most strongly reducing of the mobile carriers in the chain, and what it does with the electron is the fork where the two kinds of electron flow separate.' },
  nadp: { term: 'Nicotinamide adenine dinucleotide phosphate', def: 'NAD<sup>+</sup> with one extra phosphate group, written NADP<sup>+</sup> in the form ready to take electrons and reduced to NADPH by the light reactions. The phosphate carries no energy; it is a label, and it lets a cell keep a reduced pool for building things separate from the pool it fills by taking things apart.' },
  'linear-electron-flow': { term: 'Linear electron flow', def: 'The straight-through path: water to photosystem II, on to photosystem I, on to NADP<sup>+</sup>. It produces NADPH, ATP and oxygen, and it consumes a water molecule for every two electrons.' },
  'cyclic-electron-flow': { term: 'Cyclic electron flow', def: 'The short circuit: the electron leaving photosystem I is sent back to the cytochrome complex instead of to NADP<sup>+</sup>. Protons are still pumped, so ATP is still made, but no NADPH is made and no water is split, so no oxygen appears.' },

  // ---- 6.5 Chapter 4's battery, charged by light ----
  chemiosmosis: { term: 'Chemiosmosis', def: 'Making ATP by letting protons fall back across a membrane they were pumped across. The gradient is the shared intermediate between the two halves: one machine charges it, another spends it, and neither touches the other.' },
  'proton-motive-force': { term: 'Proton-motive force', def: 'What a proton gradient across a membrane is worth, counting both the difference in concentration and the difference in voltage. In a thylakoid almost all of it is the concentration term; in a mitochondrion much of it is the voltage.' },
  'atp-synthase': { term: 'ATP synthase', def: 'The enzyme that makes ATP from the proton-motive force. Protons turn a ring of subunits in the membrane, the rotation drives a stalk through the knob on the other side, and the knob releases ATP as it turns — a pump run in reverse, exactly as Section 4.7 predicted could happen.' },
  photophosphorylation: { term: 'Photophosphorylation', def: 'Making ATP with energy that came from light. In practice it always means chemiosmosis, because light\'s energy reaches ATP synthase only as a proton gradient.' },
  uncoupler: { term: 'Uncoupler', def: 'A molecule that carries protons across a membrane, letting the gradient leak away without passing through ATP synthase. It separates the two halves of chemiosmosis: electron transport speeds up, the gradient collapses, ATP output stops, and the energy leaves as heat.' },

  // ---- 6.6 Building a sugar out of air ----
  'calvin-cycle': { term: 'Calvin cycle', def: 'The stroma\'s three-phase cycle: carbon dioxide is attached to a five-carbon acceptor, the product is reduced using ATP and NADPH, and most of what is made goes back to rebuilding the acceptor. One sugar leaves for every three turns.' },
  rubisco: { term: 'Rubisco', def: 'Ribulose bisphosphate carboxylase/oxygenase, the enzyme that attaches carbon dioxide to the acceptor. It is slow, it confuses carbon dioxide with oxygen, and there is more of it on Earth than of any other protein — three facts that belong together.' },
  rubp: { term: 'RuBP (ribulose bisphosphate)', def: 'The five-carbon sugar with a phosphate at each end that carbon dioxide is attached to. It is the cycle\'s acceptor, and five of every six sugars the cycle makes go back into rebuilding it.' },
  g3p: { term: 'G3P (glyceraldehyde 3-phosphate)', def: 'The three-carbon sugar the cycle produces. Five of every six made go back into rebuilding the acceptor; the sixth leaves, and pairs of them become the glucose, sucrose and starch a plant actually uses.' },
  'photosynthate': { term: 'Photosynthate', def: 'What a leaf exports: in most plants, sucrose, made in the cytosol from the sugar the Calvin cycle produced and carried away to roots, fruit and growing tips. What is not exported by nightfall is stored in the stroma as starch.' },

  // ---- 6.7 One active site, two gases ----
  photorespiration: { term: 'Photorespiration', def: 'What follows when rubisco attaches oxygen to the acceptor instead of carbon dioxide. The two-carbon product is useless and has to be salvaged through a route crossing three organelles, at a cost in ATP and with the loss of one carbon in four.' },
  peroxisome: { term: 'Peroxisome', def: 'A small single-membraned compartment holding enzymes that hand hydrogen to oxygen, making hydrogen peroxide, and a catalase that destroys the peroxide again. It handles reactions a cell would rather not have loose in the cytosol; in a leaf it holds the middle of the salvage route.' },

  // ---- 6.8 Two answers to the same problem ----
  'c3-plant': { term: 'C3 plant', def: 'A plant in which the first stable product of carbon fixation is a three-carbon acid, because rubisco does the fixing directly. Most plants are C<sub>3</sub>, including nearly every tree in a temperate forest, wheat, rice and every plant so far in this chapter.' },
  'c4-plant': { term: 'C4 plant', def: 'A plant that fixes carbon dioxide first into a four-carbon acid in one cell, then releases it again around rubisco in another. The arrangement costs two extra ATP for every carbon dioxide delivered and buys a concentration rubisco cannot confuse.' },
  cam: { term: 'CAM', def: 'Crassulacean acid metabolism: the same two steps as a C<sub>4</sub> plant, separated by time instead of by distance. The stomata open at night to take carbon dioxide in and close by day, and the carbon waits in the vacuole as an acid.' },
  'pep-carboxylase': { term: 'PEP carboxylase', def: 'The enzyme that does the first fixation in a C<sub>4</sub> or CAM plant. It takes bicarbonate rather than carbon dioxide, which is why oxygen cannot be mistaken for its substrate; and bicarbonate is about ten times as plentiful in the cell as dissolved carbon dioxide, so the enzyme keeps working at levels at which rubisco slows badly.' },
  'bundle-sheath': { term: 'Bundle sheath', def: 'The ring of cells around a leaf vein. In a C<sub>4</sub> plant they are large, thick-walled, packed with chloroplasts and connected to the surrounding mesophyll — an arrangement called Kranz anatomy, from the German for wreath — and they are where rubisco is kept.' },
};
