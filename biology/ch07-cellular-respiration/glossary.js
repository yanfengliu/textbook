// Chapter 7 glossary. Every <tb-term ref="..."> in index.html names a key here, and every key here is
// used in the chapter at least once (npm run check enforces both). `def` may hold inline HTML.
//
// Terms chapters 1 to 6 already introduced are not repeated, and the chapter uses their words rather
// than paraphrasing them: metabolism, mitochondrion, cristae, matrix, ribosome, endosymbiosis,
// covalent bond, electronegativity, functional group, hydrolysis, denaturation, pH, buffer, lipid
// bilayer, membrane potential, electrochemical gradient, concentration gradient, active transport,
// primary and secondary active transport, proton pump, symport, antiport, carrier protein, ATP, ADP,
// free energy, exergonic, endergonic, energy coupling, phosphorylation, enzyme, active site,
// activation energy, competitive and irreversible inhibition, allostery, feedback inhibition, kinase,
// metabolic pathway, catabolism, anabolism, oxidation, reduction, redox reaction, electron carrier,
// NAD⁺ and FAD.
//
// Four are defined here although chapter 6 also defines them, and the division was agreed with chapter 6
// rather than guessed. Chapter 6 owns the first telling of an electron transport chain in a membrane
// (§6.4), and of chemiosmosis and an uncoupler (§6.5). What is defined here and nowhere else is the
// mitochondrial vocabulary: the intermembrane space, the respiratory complexes and their two mobile
// carriers. The four that overlap are `chemiosmosis`, `proton-motive-force`, `atp-synthase` and
// `uncoupler`. They are here because a reader arriving at §7.5 or §7.8 must be able to ask the popover
// what the word means without leaving the chapter: the same principle chapter 4 applied to `osmosis`
// and chapter 5 to `enzyme` and `atp`. This chapter's `proton-motive-force` is written with the voltage
// term that dominates across an inner membrane, which in a thylakoid it does not.
export const GLOSSARY = {
  // ---- 7.1 Respiration is not burning ----
  'cellular-respiration': { term: 'Cellular respiration', def: 'The controlled oxidation of a fuel molecule inside a cell, in many enzyme-catalysed steps, capturing part of the free energy released as ATP. It has nothing directly to do with breathing, which is how an animal gets the oxygen to it and the carbon dioxide away.' },
  'intermembrane-space': { term: 'Intermembrane space', def: 'The gap between a mitochondrion\'s two membranes. The outer membrane is full of wide pores, so this space is chemically close to the cytosol; the inner membrane is not, which is what makes the space useful as one side of a gradient.' },

  // ---- 7.2 A very old pathway runs in the cytosol ----
  glycolysis: { term: 'Glycolysis', def: 'The ten-step pathway that splits one glucose into two molecules of pyruvate in the cytosol, spending two ATP and recovering four, and reducing two NAD<sup>+</sup>. It needs no oxygen, no membrane and no organelle, and some version of it runs in every domain of life: the last steps to pyruvate the same everywhere, the top built in more than one way.' },
  pyruvate: { term: 'Pyruvate', def: 'The three-carbon compound glycolysis ends at, and the junction where a cell decides what happens next: into the mitochondrion when the chain can take its electrons, into a fermentation when it cannot, or when glycolysis outruns it.' },
  'substrate-level-phosphorylation': { term: 'Substrate-level phosphorylation', def: 'Making ATP by moving a phosphate group directly from a substrate onto ADP, with no membrane and no gradient involved. It is how glycolysis and one step of the Krebs cycle make their ATP, and it accounts for a small fraction of a cell\'s total.' },

  // ---- 7.3 A cycle that takes carbon apart ----
  'link-reaction': { term: 'Link reaction', def: 'The step between glycolysis and the Krebs cycle, carried out by a large enzyme complex in the mitochondrial matrix: pyruvate loses a carbon as carbon dioxide, the remaining two carbons are attached to coenzyme A, and NAD<sup>+</sup> is reduced. It is effectively irreversible, and with the cycle\'s own carbon balance that is why an animal cannot turn a fatty acid back into sugar.' },
  decarboxylation: { term: 'Decarboxylation', def: 'The removal of a carbon atom from a molecule as carbon dioxide. Six of them take a glucose skeleton apart: for each of its two pyruvates, one in the link reaction and two in a turn of the Krebs cycle.' },
  'acetyl-coa': { term: 'Acetyl coenzyme A', def: 'A two-carbon acetyl group carried on coenzyme A, joined through a sulfur atom. It is the compound that carbohydrates, fats and many amino acids all funnel into, and the form in which most fuel enters the Krebs cycle.' },
  'krebs-cycle': { term: 'Krebs cycle', def: 'The eight-step cycle in the mitochondrial matrix that accepts the two carbons of an acetyl group, releases two carbons as carbon dioxide — not, as it happens, the two that just arrived — and strips off four pairs of electrons onto carriers, regenerating its own starting compound every turn. Section 3.5 called it the citric acid cycle; it is also the tricarboxylic acid or TCA cycle, and the three names are one cycle.' },
  oxaloacetate: { term: 'Oxaloacetate', def: 'The four-carbon compound the Krebs cycle starts from and regenerates. It is consumed at the start of every turn and remade at the end, so a cell needs only a trace of it — and the cycle stops if that trace is drawn off.' },
  amphibolic: { term: 'Amphibolic', def: 'Of a pathway: running in both economies at once, taking molecules apart for energy and supplying intermediates for building. The Krebs cycle is the clearest case, which is why draining it for biosynthesis stops it turning.' },
  'beta-oxidation': { term: 'β-⁠oxidation', def: 'The pathway that takes a fatty acid apart two carbons at a time, producing one acetyl-CoA, one NADH and one FADH<sub>2</sub> per cut. It is how a fat reaches the Krebs cycle, and the NADH and FADH<sub>2</sub> each cut makes are where a fat\'s more reduced carbons pay out.' },

  // ---- 7.4 The chain makes a gradient, not ATP ----
  'electron-transport-chain': { term: 'Electron transport chain', def: 'A series of carriers in a membrane, each with a greater pull on electrons than the last, so that a pair of electrons entering at the top falls step by step to the bottom. In a mitochondrion it is four complexes and two mobile carriers, and the energy of every fall large enough to pay for it is spent pumping protons.' },
  'reduction-potential': { term: 'Standard reduction potential (E°′)', def: 'A measure, in volts, of how strongly a substance pulls electrons towards itself, defined against hydrogen and quoted at pH 7. Electrons move by themselves from a lower value to a higher one, and the free energy released is the difference multiplied by the charge moved.' },
  ubiquinone: { term: 'Ubiquinone', def: 'A small lipid-soluble carrier, also called coenzyme Q, that shuttles electrons within the inner membrane rather than along its surface. Its long hydrocarbon tail keeps it in the bilayer, which is how complexes with no direct electron path between them exchange electrons.' },
  cytochrome: { term: 'Cytochrome', def: 'A protein carrying an iron atom in a haem group, which holds an electron by switching between iron(III) and iron(II). Several sit in the chain, each with a slightly different pull on electrons, and one of them — cytochrome c — is a small mobile protein on the outer face of the inner membrane.' },
  'terminal-electron-acceptor': { term: 'Terminal electron acceptor', def: 'Whatever takes the electrons at the bottom of a chain and leaves the system. For aerobic respiration it is oxygen, which becomes water; other organisms end their chains on nitrate, sulfate or carbon dioxide instead, and from the same donor get less because those sit higher up.' },

  // ---- 7.5 The gradient turns a motor ----
  'proton-motive-force': { term: 'Proton-motive force', def: 'The energy stored in a proton gradient across a membrane, written as a voltage. It has two parts: the difference in proton concentration, which is a pH difference, and the difference in charge. Across a mitochondrion\'s inner membrane it is about 200 mV, most of it charge.' },
  chemiosmosis: { term: 'Chemiosmosis', def: 'Making ATP by letting protons fall back across a membrane down a gradient that something else built. The two halves share no chemical intermediate at all: what passes between them is the gradient, which is why the membrane has to be intact for either half to be any use.' },
  'atp-synthase': { term: 'ATP synthase', def: 'The rotary machine that makes most of a cell\'s ATP. Protons falling through a channel in the membrane turn a ring of subunits and the shaft attached to it; the shaft\'s rotation forces three catalytic sites in turn through the shapes that bind ADP and phosphate, join them, and release ATP.' },
  'oxidative-phosphorylation': { term: 'Oxidative phosphorylation', def: 'The making of ATP that is driven, through a proton gradient, by electrons falling to oxygen. It is the chain and the synthase taken together, and it accounts for something like nine-tenths of the ATP an aerobic cell makes.' },

  // ---- 7.6 The number is a range, and here is why ----
  'electron-shuttle': { term: 'Electron shuttle', def: 'A pair of reactions that moves the electrons of a cytosolic NADH into the matrix without moving the NADH itself, which cannot cross the inner membrane. Which shuttle a tissue uses decides whether those electrons enter the chain at the top or partway down.' },

  // ---- 7.7 When nothing is there to take the electrons ----
  fermentation: { term: 'Fermentation', def: 'Any pathway that regenerates NAD<sup>+</sup> by handing electrons to an organic molecule the cell made itself, so that glycolysis can keep running with no chain and no outside acceptor. In the lactate and alcohol fermentations it yields no ATP of its own: the two from glycolysis are the whole of the return.' },
  lactate: { term: 'Lactate', def: 'The three-carbon product of the fermentation a muscle uses, made by reducing pyruvate. At blood pH the acid is almost entirely ionised, so what is present is the lactate anion. It is a fuel, not a waste product, and is taken up and oxidised by the heart and other muscle or rebuilt into glucose by the liver.' },
  'cori-cycle': { term: 'Cori cycle', def: 'The round trip in which a muscle sends lactate to the liver, the liver rebuilds it into glucose, and the glucose returns. It costs the liver more ATP than the muscle gained, which is the point: the body moves the bill to the organ that has oxygen.' },
  'anaerobic-respiration': { term: 'Anaerobic respiration', def: 'Respiration with a chain, a gradient and a synthase, ending on something other than oxygen — nitrate, sulfate, iron(III) or carbon dioxide. It is not fermentation: the machinery is of the same kind as in aerobic respiration, though rarely the same complexes, and from the same donor the yield is lower because the acceptor sits higher on the ladder.' },

  // ---- 7.8 Block it, or let it leak ----
  'crossover-point': { term: 'Crossover point', def: 'The place in a chain where an inhibitor has acted, found by measuring which carriers become more reduced and which become more oxidised. Everything above the block fills with electrons that cannot move on; everything below it empties. It is how the order of the chain was worked out.' },
  uncoupler: { term: 'Uncoupler', def: 'A substance that lets protons back across the inner membrane without passing through ATP synthase, so the chain runs faster than ever and little or no ATP is made. Nearly all of the energy leaves as heat, which is what makes uncoupling drugs lethal as slimming aids, and an uncoupling protein useful to a hibernating animal.' },
  'uncoupling-protein': { term: 'Uncoupling protein', def: 'A protein in the inner membrane of brown fat mitochondria that provides a controlled proton leak. It turns the gradient straight into heat on demand, and it is how most newborn mammals warm themselves without shivering.' },
  'respiratory-control': { term: 'Respiratory control', def: 'The observation that mitochondria consume oxygen only as fast as ADP arrives to be phosphorylated. Nothing signals between the chain and the synthase; the gradient itself carries the message, because a synthase that is not turning leaves the gradient steep enough to stall the pumps.' },
};
