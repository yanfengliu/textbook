// Chapter 3 glossary. Every <tb-term ref="..."> in index.html names a key here, and every key here is
// used in the chapter at least once (npm run check enforces both). `def` may hold inline HTML.
// Terms chapter 1 already introduced (cell, organelle, prokaryote, eukaryote, nucleus) are not repeated
// here; endosymbiosis is, because chapter 3 argues the evidence for it and the popover should work.
export const GLOSSARY = {
  // ---- 3.1 Seeing the cell ----
  magnification: { term: 'Magnification', def: 'How much larger an image is than the object it is made from. Past the resolution limit of the instrument, extra magnification enlarges the blur and adds no detail.' },
  resolution: { term: 'Resolution', def: 'The smallest gap between two points at which they still appear as two points rather than one. It is set by physics, not by how many lenses are stacked up.' },
  'numerical-aperture': { term: 'Numerical aperture (NA)', def: 'A measure of the cone of light an objective lens gathers. The resolution of a light microscope is roughly the wavelength divided by twice the numerical aperture; the best oil-immersion lenses reach about 1.4.' },
  fluorescence: { term: 'Fluorescence microscopy', def: 'Microscopy in which a dye absorbs light of one colour and emits light of a longer one, and only the emitted light is imaged. The resolution is no better than any light microscope, but everything unlabelled goes black.' },
  gfp: { term: 'Green fluorescent protein (GFP)', def: 'A naturally fluorescent protein from the jellyfish <em>Aequorea victoria</em>. Its gene can be fused to the gene for almost any protein, so a living cell builds its own label.' },
  tem: { term: 'Transmission electron microscope (TEM)', def: 'An instrument that forms an image from electrons passed through an ultra-thin section. On biological material it resolves structures a couple of nanometres apart, but the specimen must be fixed, dehydrated, stained with heavy metals and held in a vacuum.' },
  sem: { term: 'Scanning electron microscope (SEM)', def: 'An instrument that sweeps a beam of electrons across a metal-coated surface and builds an image from the electrons knocked off it, giving a view of surface shape at lower resolution than a transmission instrument.' },
  'cryo-em': { term: 'Cryo-electron microscopy', def: 'Electron microscopy of specimens frozen so fast that their water becomes glass rather than ice, so no fixative, stain or dehydration is needed and structures are seen close to their working state.' },

  // ---- 3.2 Why cells are small ----
  'sa-v': { term: 'Surface-area-to-volume ratio', def: 'The amount of surface a cell has for each unit of its volume. For a sphere of radius <em>r</em> it is 3/<em>r</em>, so it falls as the cell grows: supply is a surface, demand is a volume.' },
  diffusion: { term: 'Diffusion', def: 'The spreading of a substance from where it is concentrated to where it is not, by the random movement of its molecules. The time it takes grows as the square of the distance, so it is fast across a cell and useless across a body.' },
  microvillus: { term: 'Microvillus', def: 'A finger-like projection of the cell surface, about 1\u00A0µm long and 0.1\u00A0µm wide, cored with actin filaments. A fringe of them multiplies an absorbing cell\'s surface roughly twentyfold without changing its size.' },

  // ---- 3.3 The prokaryotic cell ----
  nucleoid: { term: 'Nucleoid', def: 'The region of a prokaryotic cell where the chromosome sits. It is not a compartment: no membrane separates the DNA from the cytoplasm, so transcription and translation happen together.' },
  plasmid: { term: 'Plasmid', def: 'A small ring of DNA, separate from the chromosome, that copies itself independently and carries genes the cell can live without\u00A0— antibiotic resistance, unusual metabolisms, toxins. It can be passed from cell to cell.' },
  ribosome: { term: 'Ribosome', def: 'The machine that reads messenger RNA and builds protein. Prokaryotes, mitochondria and chloroplasts use the bacterial type; the eukaryotic cytosol uses a slightly larger one, 80S against 70S.' },
  osmosis: { term: 'Osmosis', def: 'The movement of water across a membrane towards the side where dissolved substances are more concentrated\u00A0— towards the saltier side. Chapter\u00A04 gives the mechanism; here it is enough that a cell surrounded by fresher water takes water in and swells.' },
  'cell-wall': { term: 'Cell wall', def: 'A stiff layer outside the plasma membrane that resists the pressure of water entering by osmosis. It is peptidoglycan in bacteria, cellulose in plants, β-⁠glucans and chitin in fungi, and protein or other polymers in archaea.' },
  peptidoglycan: { term: 'Peptidoglycan', def: 'The mesh of sugar chains cross-linked by short peptides that makes a bacterial cell wall\u00A0— effectively one enormous molecule enclosing the cell. Penicillin blocks the cross-linking; lysozyme cuts the sugar backbone.' },
  'gram-stain': { term: 'Gram stain', def: 'A staining procedure that separates bacteria by wall structure. Gram-positive cells have thick peptidoglycan that holds the violet dye through an alcohol wash; gram-negative cells have a thin layer under an outer membrane, lose the dye, and take the pink counterstain.' },
  capsule: { term: 'Capsule', def: 'A layer of polysaccharide secreted outside a bacterial cell wall. It helps the cell stick to surfaces and makes it harder for an immune cell to grip or recognise.' },
  pilus: { term: 'Pilus', def: 'A short protein filament on the surface of a prokaryotic cell, used to attach to surfaces or to other cells. One specialised kind forms the tube through which a plasmid passes from one cell to another.' },
  'bacterial-flagellum': { term: 'Bacterial flagellum', def: 'A stiff helical filament of protein spun by a rotary motor in the plasma membrane, driven by protons flowing into the cell. It is not related to the eukaryotic flagellum, which bends rather than rotates.' },
  archaea: { term: 'Archaea', def: 'One of the three domains of life: prokaryotes whose membrane lipids are ether-linked and branched, whose walls contain no peptidoglycan, and whose machinery for copying DNA and making protein resembles a eukaryote\'s more than a bacterium\'s.' },

  // ---- 3.4 The endomembrane system ----
  endomembrane: { term: 'Endomembrane system', def: 'The connected set of compartments through which material flows in a eukaryotic cell: nuclear envelope, endoplasmic reticulum, Golgi apparatus, lysosomes, vesicles and the plasma membrane. Mitochondria and chloroplasts are not part of it.' },
  'nuclear-envelope': { term: 'Nuclear envelope', def: 'The double membrane around the nucleus, perforated by nuclear pores, whose outer membrane is continuous with the endoplasmic reticulum.' },
  'nuclear-pore': { term: 'Nuclear pore', def: 'A channel through the nuclear envelope, built from about thirty different proteins, roughly 40\u00A0nm wide. Small molecules pass freely; larger ones need a signal and a carrier, so the nucleus controls what goes in and out.' },
  'nuclear-lamina': { term: 'Nuclear lamina', def: 'A mesh of intermediate filaments lining the inner face of the nuclear envelope, which gives the nucleus its shape and anchors the chromosomes.' },
  nucleolus: { term: 'Nucleolus', def: 'A dense region inside the nucleus, not bounded by a membrane, where ribosomal RNA is transcribed and ribosomal subunits are assembled before export.' },
  er: { term: 'Endoplasmic reticulum (ER)', def: 'A network of membrane sacs and tubes enclosing one continuous internal space, spreading from the nuclear envelope through the cytoplasm. In many cells it is more than half of all the membrane the cell owns.' },
  'rough-er': { term: 'Rough endoplasmic reticulum', def: 'Endoplasmic reticulum with ribosomes bound to its cytosolic face, where proteins destined for export, for membranes or for other compartments are made, folded, checked and first given their sugar chains.' },
  'smooth-er': { term: 'Smooth endoplasmic reticulum', def: 'Endoplasmic reticulum without bound ribosomes: tubules that make lipids and steroid hormones, store and release calcium, and in the liver carry the enzymes that modify drugs and poisons.' },
  'signal-peptide': { term: 'Signal peptide', def: 'A short, strongly hydrophobic stretch at the start of a newly made protein that marks it for the endoplasmic reticulum. A cytosolic particle recognises it, pauses translation and docks the ribosome on the ER membrane; an enzyme clips it off once the chain is inside.' },
  golgi: { term: 'Golgi apparatus', def: 'A stack of flattened sacs with a receiving face towards the endoplasmic reticulum and a shipping face towards the plasma membrane. It rebuilds the sugar chains on proteins passing through, and sorts each one into a vesicle addressed to its destination.' },
  vesicle: { term: 'Vesicle', def: 'A small membrane bubble that buds from one compartment and fuses with another, carrying both its contents and a patch of membrane. Vesicles are what makes the endomembrane system a system.' },
  lysosome: { term: 'Lysosome', def: 'A membrane bag of about forty digestive enzymes, held at around pH 5 by a pump in its own membrane. It breaks down what the cell has swallowed and the cell\'s own worn-out parts; the acid requirement means a leak does little harm.' },
  exocytosis: { term: 'Exocytosis', def: 'The fusion of a vesicle with the plasma membrane, which releases its contents outside the cell and adds the vesicle\'s membrane to the cell surface.' },
  endocytosis: { term: 'Endocytosis', def: 'The taking in of material by pinching a piece of plasma membrane inward to form a vesicle. It is how a white blood cell swallows a bacterium.' },

  // ---- 3.5 Mitochondria and chloroplasts ----
  mitochondrion: { term: 'Mitochondrion', def: 'The organelle that makes most of a eukaryotic cell\'s ATP: about 1\u00A0µm wide, wrapped in two membranes, the inner one folded into cristae, with its own DNA and bacterial-type ribosomes in the matrix.' },
  cristae: { term: 'Cristae', def: 'The folds of a mitochondrion\'s inner membrane. They carry the proteins that pass electrons along a chain and make ATP, so the amount of folding sets how much power the mitochondrion can deliver.' },
  'mito-matrix': { term: 'Matrix (mitochondrial)', def: 'The space enclosed by a mitochondrion\'s inner membrane, holding the enzymes of the citric acid cycle together with the organelle\'s own DNA and ribosomes.' },
  chloroplast: { term: 'Chloroplast', def: 'The organelle that captures light and makes sugar: two outer membranes, a separate internal system of thylakoids, and a stroma holding the enzymes of sugar synthesis, the chloroplast\'s DNA, its ribosomes and usually starch grains.' },
  thylakoid: { term: 'Thylakoid', def: 'A flattened membrane disc inside a chloroplast, stacked with others into piles called grana. Its membrane holds the chlorophyll and the machinery that captures light.' },
  stroma: { term: 'Stroma', def: 'The fluid around the thylakoids of a chloroplast, holding the enzymes that build sugar, the chloroplast\'s DNA and its ribosomes.' },
  plastid: { term: 'Plastid', def: 'The family of double-membraned plant organelles that includes the chloroplast, the starch-storing amyloplast and the pigment-filled chromoplast that colours a carrot or a ripe tomato.' },
  endosymbiosis: { term: 'Endosymbiosis', def: 'One cell living inside another. Mitochondria descend from a bacterium related to today\'s alphaproteobacteria, and chloroplasts from a cyanobacterium, taken in by ancestral cells and kept.' },

  // ---- 3.6 The cytoskeleton ----
  cytoskeleton: { term: 'Cytoskeleton', def: 'The network of protein filaments that holds a cell\'s shape, positions its compartments, carries its cargo and divides it. Most of it is built and taken down within minutes, which is what makes it useful.' },
  microfilament: { term: 'Microfilament', def: 'The thinnest cytoskeletal filament, about 7\u00A0nm across: two twisted strands of the protein actin. It bears tension, cores each microvillus, works with myosin in muscle, and forms the ring that pinches a dividing animal cell in two.' },
  'intermediate-filament': { term: 'Intermediate filament', def: 'A rope-like filament 8–\u206012\u00A0nm across, built from any of a family of proteins\u00A0— keratins in skin, lamins in the nuclear lamina, others elsewhere. It has no polarity, carries no motors, and is the most permanent of the three filament types.' },
  microtubule: { term: 'Microtubule', def: 'A hollow tube 25\u00A0nm across, built from thirteen rows of tubulin pairs. It resists compression, serves as the track for motor proteins, forms the mitotic spindle, and is the core of every cilium and eukaryotic flagellum.' },
  tubulin: { term: 'Tubulin', def: 'The protein a microtubule is built from, added as pairs of two slightly different subunits, α and β. The pairs all point the same way, which is what gives a microtubule a plus end and a minus end.' },
  centrosome: { term: 'Centrosome', def: 'The region near the nucleus of an animal cell from which most microtubules radiate, containing a pair of centrioles. Plant cells organise microtubules without one.' },
  centriole: { term: 'Centriole', def: 'A barrel of nine triplets of microtubules. Two sit at right angles in an animal cell\'s centrosome, and a centriole is structurally the same object as the basal body at the foot of a cilium.' },
  'motor-protein': { term: 'Motor protein', def: 'A protein that converts the energy in ATP into steps along a cytoskeletal filament, hauling cargo behind it. Each kind walks in one fixed direction along one kind of filament.' },
  kinesin: { term: 'Kinesin', def: 'A motor protein that walks along a microtubule towards its plus end, which usually means outward from the cell centre, in steps of about 8\u00A0nm at roughly a micrometre a second.' },
  dynein: { term: 'Dynein', def: 'A motor protein that walks along a microtubule towards its minus end, so it carries cargo inward. Rows of dynein arms inside a cilium are what make it bend.' },
  myosin: { term: 'Myosin', def: 'A motor protein that walks along actin filaments. It drives muscle contraction, cytoplasmic streaming in plant cells, and the movement of some vesicles.' },
  cilium: { term: 'Cilium', def: 'A short, hair-like extension of a eukaryotic cell built around a 9+2 axoneme and wrapped in plasma membrane, about 0.25\u00A0µm across. Motile cilia come in hundreds per cell and beat in coordinated waves.' },
  axoneme: { term: 'Axoneme (9+2)', def: 'The microtubule core of a motile cilium or eukaryotic flagellum: nine doublet microtubules in a ring around two single ones, joined by protein links and radial spokes. Non-motile primary cilia have the same ring without the central pair.' },
  'basal-body': { term: 'Basal body', def: 'The structure at the foot of a cilium or flagellum from which it grows: nine triplets of microtubules and no central pair, structurally identical to a centriole.' },
  'primary-cilium': { term: 'Primary cilium', def: 'A single non-motile cilium, with nine doublets and no central pair, carried by almost every cell in the body. It works as an antenna, carrying receptors for several signalling pathways.' },

  // ---- 3.7 The cell surface ----
  cellulose: { term: 'Cellulose', def: 'The β-⁠glucose polymer that makes the fibres of a plant cell wall (Section\u00A02.6). The β linkage flips every second unit, so the chain lies straight instead of coiling, and straight chains hydrogen-bond side by side into microfibrils of great tensile strength. Human gut enzymes are shaped for the α link and cannot cut it.' },
  'middle-lamella': { term: 'Middle lamella', def: 'The pectin-rich layer that glues the walls of neighbouring plant cells together. Pectin is the substance that sets jam.' },
  turgor: { term: 'Turgor', def: 'The pressure inside a walled cell when water has entered by osmosis and the wall pushes back. In a plant cell it is several times the pressure in a car tyre, and it is what holds a non-woody plant up.' },
  ecm: { term: 'Extracellular matrix', def: 'The composite of fibres and gel an animal cell secretes around itself: collagen and other fibres in a water-holding mesh of proteoglycans. It carries mechanical load and also information.' },
  collagen: { term: 'Collagen', def: 'A triple-stranded protein rope, the most abundant protein in the human body and the main tensile fibre of skin, tendon, bone and cartilage.' },
  integrin: { term: 'Integrin', def: 'A receptor spanning the plasma membrane that grips the extracellular matrix on the outside and the actin cytoskeleton on the inside, so force and signals pass in both directions.' },
  'tight-junction': { term: 'Tight junction', def: 'A belt of membrane proteins that runs around a cell and seals its membrane to its neighbour\'s, closing the space between them. It is what makes a sheet of cells a barrier, as in the gut lining and the blood vessels of the brain.' },
  desmosome: { term: 'Desmosome', def: 'A spot fastening between two animal cells that anchors the intermediate filaments of one to those of the other, so mechanical load passes through a tissue instead of tearing it apart.' },
  'gap-junction': { term: 'Gap junction', def: 'A channel about 1.5\u00A0nm wide formed where a ring of six proteins in one cell\'s membrane meets a matching ring in its neighbour\'s, letting ions and small molecules pass directly between the two cytoplasms.' },
  plasmodesma: { term: 'Plasmodesma', def: 'A channel through a plant cell wall, lined with plasma membrane and threaded with a strand of endoplasmic reticulum, making the cytoplasm of neighbouring cells continuous. Plural: plasmodesmata.' },

  // ---- 3.8 Plant cells and animal cells ----
  vacuole: { term: 'Central vacuole', def: 'The large fluid-filled compartment of a mature plant cell, often eighty or ninety per cent of its volume. It generates turgor, stores solutes and pigments, holds digestive enzymes, and lets a cell be large while its cytoplasm stays a thin layer near the surface.' },
  tonoplast: { term: 'Tonoplast', def: 'The membrane around a plant cell\'s central vacuole, which controls what is pumped in and out and therefore how much water the vacuole draws.' },
};
