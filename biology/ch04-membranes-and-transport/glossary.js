// Chapter 4 glossary. Every <tb-term ref="..."> in index.html names a key here, and every key here is
// used in the chapter at least once (npm run check enforces both). `def` may hold inline HTML.
//
// Terms chapters 1 to 3 already introduced are not repeated: cell, organelle, nucleus, enzyme,
// hydrophobic, hydrophobic effect, hydrogen bond, polar, solute, solvent, pH, lipid, fatty acid,
// steroid, protein, polypeptide, diffusion, vesicle, cell wall, cytoskeleton, tight junction. Five are
// repeated on purpose, and each for the reason chapter 3 gave when it repeated `osmosis`: this is the
// chapter where the word does its work and the popover has to be there when it is asked.
//
//   phospholipid — chapter 2 introduced it as one of the lipids; here it is the material the whole
//     chapter is made of, and the definition is pitched at what a bilayer needs from it.
//   osmosis — chapter 3 defined it as far as it needed ("Chapter 4 gives the mechanism") and this is
//     that mechanism, so the entry is rewritten around water potential.
//   turgor — chapter 3 said what it does for a plant; here it is one term of an equation.
//   endocytosis, exocytosis — chapter 3 met them as the two ends of the secretory route; §4.8 treats
//     them as transport, for cargo no channel or carrier could carry.
//
// ATP is defined here although chapter 5 owns it, on the same principle: four sections of this chapter
// spend it and none of them can explain it, so the entry says what a reader needs and points forward.
export const GLOSSARY = {
  // ---- 4.1 Why a membrane builds itself ----
  phospholipid: { term: 'Phospholipid', def: 'The lipid a membrane is made of: a glycerol backbone carrying two hydrocarbon tails and a phosphate head group. The head is charged and water-soluble, the tails are not, and that split is the whole basis of a membrane.' },
  amphipathic: { term: 'Amphipathic', def: 'Having both a water-loving and a water-avoiding part in the same molecule. An amphipathic molecule can satisfy neither part on its own in water, which is why crowds of them arrange themselves.' },
  'lipid-bilayer': { term: 'Lipid bilayer', def: 'Two sheets of lipid molecules back to back, tails meeting in an oily core three or four nanometres deep and heads facing the water on both sides. The whole sandwich is about 7\u00A0nm thick and forms with no machinery at all.' },
  micelle: { term: 'Micelle', def: 'A small sphere of amphipathic molecules with the tails gathered at the centre. Molecules with one tail and a bulky head\u00A0— detergents, soaps\u00A0— make micelles rather than bilayers, which is how a detergent takes a membrane apart.' },
  liposome: { term: 'Liposome', def: 'A hollow sphere of bilayer enclosing a droplet of water, formed spontaneously when phospholipids are shaken up in water. Used to carry drugs into cells, and the reason a membrane is thought to be one of the easier parts of a first cell to account for.' },
  'freeze-fracture': { term: 'Freeze-fracture', def: 'A preparation in which a frozen specimen is struck with a knife so that it splits along its weakest plane\u00A0— the oily midline of a membrane. It opens the bilayer like a book, and the particles studding the exposed face are the proteins embedded in it.' },

  // ---- 4.2 A mosaic that flows ----
  'fluid-mosaic': { term: 'Fluid mosaic model', def: 'The picture of a membrane proposed by Singer and Nicolson in 1972: a two-dimensional lipid fluid in which proteins float, some spanning the bilayer and most free to drift about in the plane.' },
  'flip-flop': { term: 'Flip-flop', def: 'The movement of a lipid from one leaflet of a bilayer to the other. It requires dragging a charged head through the oily core, so it happens less than once a month for a given molecule\u00A0— against some ten million sideways swaps a second.' },
  'membrane-asymmetry': { term: 'Membrane asymmetry', def: 'The fact that the two faces of a membrane differ, in lipids, in proteins and in sugars, and stay different. Nothing crosses between the leaflets by itself, so a difference once established is kept without effort.' },
  'integral-protein': { term: 'Integral membrane protein', def: 'A protein embedded in the bilayer, usually crossing it, held there because the stretch inside the core is hydrophobic. It can only be removed by dissolving the membrane with detergent.' },
  'peripheral-protein': { term: 'Peripheral membrane protein', def: 'A protein attached to one face of a membrane rather than embedded in it, held by weaker interactions with the lipid heads or with an integral protein, and removable in salt solution.' },
  glycoprotein: { term: 'Glycoprotein', def: 'A protein carrying one or more short branched carbohydrate chains. On the plasma membrane the chains stand on the outer face only, because they were added in the lumen of the endoplasmic reticulum and the Golgi.' },
  glycolipid: { term: 'Glycolipid', def: 'A membrane lipid carrying a carbohydrate chain, found only in the outer leaflet. The ABO blood groups are differences of this kind and of the equivalent chains on glycoproteins.' },
  glycocalyx: { term: 'Glycocalyx', def: 'The coat of carbohydrate chains on the outside of a cell, contributed by glycoproteins and glycolipids. It is what a neighbouring cell or an immune cell reads first.' },

  // ---- 4.3 What crosses on its own ----
  'selective-permeability': { term: 'Selective permeability', def: 'The property of letting some substances through far more readily than others. A lipid bilayer is selectively permeable by chemistry alone: it sorts by charge and polarity, not by size.' },
  'permeability-coefficient': { term: 'Permeability coefficient', def: 'How fast a substance crosses unit area of a membrane for a given concentration difference, in centimetres per second. Across a bare bilayer the values span twelve orders of magnitude, from a gas to an ion.' },
  'simple-diffusion': { term: 'Simple diffusion', def: 'Movement of a substance across a membrane by dissolving into the lipid and out the other side, with no protein involved. The rate rises with the concentration difference and never reaches a ceiling.' },
  'concentration-gradient': { term: 'Concentration gradient', def: 'A difference in the concentration of a substance between two places. It is not a force acting on any molecule; it is the reason more molecules happen to wander one way than the other.' },
  'passive-transport': { term: 'Passive transport', def: 'Any movement across a membrane driven by the gradient alone, costing the cell nothing. It includes simple diffusion, osmosis and facilitated diffusion through a channel or carrier.' },
  'dynamic-equilibrium': { term: 'Dynamic equilibrium', def: 'The state in which molecules continue to cross a membrane in both directions at equal rates, so nothing further changes. Equilibrium is a balance of two large flows, not a stop.' },
  'electrochemical-gradient': { term: 'Electrochemical gradient', def: 'The combined driving force on an ion: its concentration gradient plus the effect of the voltage across the membrane. The two can pull the same way or against each other, and what the ion does depends on the sum.' },

  // ---- 4.4 Water follows the solute ----
  osmosis: { term: 'Osmosis', def: 'The net movement of water across a selectively permeable membrane, from where water potential is higher to where it is lower. It needs no attraction between solute and water: water mixed with a solute can be arranged in far more ways than water and solute kept apart, and the flow runs until dilution, or a pressure on the solution side, cancels that gain.' },
  // A term is printed as plain text (term.js sets the heading with textContent), so a symbol with a
  // subscript lives in the definition, where markup renders. Water potential's plain Ψ moves with them,
  // so the three related headings read alike.
  'water-potential': { term: 'Water potential', def: 'The tendency of water to leave a place, written Ψ and measured in megapascals: the solute potential plus the pressure potential. Pure water at atmospheric pressure is zero, and water always moves from higher water potential to lower.' },
  'solute-potential': { term: 'Solute potential', def: 'The part of water potential contributed by dissolved substances, written Ψ<sub>s</sub>. It is always negative, and roughly proportional to the number of dissolved particles\u00A0— so a salt, which dissociates, lowers it about twice as much as a sugar at the same molarity.' },
  'pressure-potential': { term: 'Pressure potential', def: 'The part of water potential contributed by physical pressure, written Ψ<sub>p</sub>. It is positive in a cell being squeezed by its own wall, zero in a flaccid cell, and negative in water under tension, as in the xylem of a tree.' },
  'osmotic-pressure': { term: 'Osmotic pressure', def: 'The pressure that would have to be applied to a solution to stop water entering it by osmosis. Blood plasma, at about 290\u00A0milliosmoles per litre, comes to roughly 0.75\u00A0MPa\u00A0— some seven and a half atmospheres.' },
  tonicity: { term: 'Tonicity', def: 'What a solution does to the volume of a particular cell. It is not a property of the solution alone: it depends on which of the solutes that cell\'s membrane can stop, which is why a urea solution can be iso-osmotic and still hypotonic.' },
  hypotonic: { term: 'Hypotonic', def: 'Of a solution: one that makes a cell placed in it gain water. An animal cell in a hypotonic solution swells and may burst; a walled cell becomes turgid and stops.' },
  isotonic: { term: 'Isotonic', def: 'Of a solution: one that causes no net movement of water into or out of a cell. Intravenous fluids are isotonic to blood, which is why a drip carries 0.9\u00A0per\u00A0cent saline rather than water.' },
  hypertonic: { term: 'Hypertonic', def: 'Of a solution: one that makes a cell placed in it lose water. An animal cell shrinks and crenates; a walled cell plasmolyses, its living contents pulling away from a wall that keeps its shape.' },
  haemolysis: { term: 'Haemolysis', def: 'The bursting of a red blood cell, releasing its haemoglobin. It is what happens to a cell with no wall in a solution dilute enough that the water arriving outruns what the membrane can contain.' },
  crenation: { term: 'Crenation', def: 'The shrinking and puckering of an animal cell that has lost water to a hypertonic solution, so that its surface is thrown into spikes.' },
  turgor: { term: 'Turgor', def: 'The pressure inside a walled cell, built up as water enters and the wall resists. It is the pressure potential term of the water potential equation, typically 0.6 to 0.8\u00A0MPa in a well-watered plant, and it is what holds up a plant with no wood in it.' },
  plasmolysis: { term: 'Plasmolysis', def: 'The state of a walled cell that has lost so much water that the plasma membrane and the cytoplasm inside it have pulled away from the wall. The wall itself keeps its shape, which is why a dry plant cell still has an outline.' },

  // ---- 4.5 Doors, and why a door saturates ----
  'facilitated-diffusion': { term: 'Facilitated diffusion', def: 'Passive transport through a channel or a carrier. The protein provides a route past the oily core; the gradient still does all the driving, so no energy is spent and the transport stops at equilibrium.' },
  'channel-protein': { term: 'Channel protein', def: 'A membrane protein forming a water-lined hole through which ions or small molecules pass without binding. Because nothing has to change shape, a channel is fast\u00A0— up to a hundred million ions a second.' },
  'gated-channel': { term: 'Gated channel', def: 'A channel that is not permanently open. Voltage-gated channels respond to a change in membrane potential, ligand-gated channels to a molecule binding, and mechanically gated channels to the membrane being deformed.' },
  'carrier-protein': { term: 'Carrier protein', def: 'A membrane protein with a binding site exposed to one side at a time, which takes up its cargo, changes shape, and releases it on the other side. There is never an open passage through it, and it is far slower than a channel.' },
  saturation: { term: 'Saturation', def: 'The levelling off of a transport rate once nearly all the transport proteins are occupied at all times. It is the observation that gives a transport protein away, because simple diffusion has no ceiling.' },
  aquaporin: { term: 'Aquaporin', def: 'A channel protein through which water crosses a membrane in single file, at about three thousand million molecules a second, while ions and even protons are refused. Cells that must move water fast, such as those of the kidney tubule, are full of them.' },

  // ---- 4.6 Pumping uphill ----
  'active-transport': { term: 'Active transport', def: 'Movement of a solute against its electrochemical gradient, which cannot happen by itself and so must be coupled to something that releases energy.' },
  'primary-active-transport': { term: 'Primary active transport', def: 'Active transport in which the energy comes directly from a chemical reaction at the transporter itself, almost always the hydrolysis of ATP. A transporter that does this is a pump.' },
  atp: { term: 'ATP', def: 'The molecule a cell spends when it pays for something. Splitting off one of its phosphate groups releases energy that a protein can be built to use, and the sodium–potassium pump uses it by attaching that phosphate to itself. Chapter\u00A05 gives the chemistry and says where ATP comes from.' },
  'sodium-potassium-pump': { term: 'Sodium–potassium pump', def: 'The pump in the plasma membrane of every animal cell, which moves three sodium ions out and two potassium ions in for each ATP it hydrolyses. It maintains both gradients, defends the cell\'s volume, and takes about a third of a resting cell\'s energy.' },
  'proton-pump': { term: 'Proton pump', def: 'A pump that moves hydrogen ions across a membrane, and so moves pH. One holds a lysosome at about pH 5; another is a plant or fungal cell\'s master pump; another builds the acid in your stomach.' },

  // ---- 4.7 A gradient is a battery ----
  'membrane-potential': { term: 'Membrane potential', def: 'The voltage across a cell membrane, inside negative, between about 20 and 200\u00A0mV depending on the cell. It arises mostly from potassium leaking out down its gradient and leaving unmatched negative charge behind.' },
  electrogenic: { term: 'Electrogenic', def: 'Of a pump: one that moves net charge, and so contributes directly to the membrane potential. The sodium–potassium pump is electrogenic, moving three positive charges out for every two it brings in, but its direct contribution is only a few millivolts.' },
  'secondary-active-transport': { term: 'Secondary active transport', def: 'Transport in which a solute is carried against its gradient by coupling it to an ion falling down its own. No ATP reaches the transporter; the gradient it spends was bought with ATP earlier, by a pump.' },
  symport: { term: 'Symport', def: 'A coupled transporter that carries its ion and its cargo across the membrane in the same direction, such as the sodium–glucose symporter that takes glucose out of the gut.' },
  antiport: { term: 'Antiport', def: 'A coupled transporter that carries its ion and its cargo in opposite directions, such as the sodium–calcium antiporter that expels calcium from a heart muscle cell as sodium enters.' },

  // ---- 4.8 Too big to cross ----
  endocytosis: { term: 'Endocytosis', def: 'Bulk transport into a cell: a patch of plasma membrane buckles inwards around the cargo and pinches off as a vesicle. It is how anything too large for a channel or a carrier gets in.' },
  phagocytosis: { term: 'Phagocytosis', def: 'Endocytosis of a large particle, such as a bacterium, by arms of membrane pushed out around it by actin filaments. The vesicle that results fuses with a lysosome and the contents are digested.' },
  pinocytosis: { term: 'Pinocytosis', def: 'The continuous formation of small vesicles that take in droplets of extracellular fluid and whatever is dissolved in it, with nothing selected. A macrophage takes in the equivalent of its whole surface this way in about half an hour.' },
  'receptor-mediated-endocytosis': { term: 'Receptor-mediated endocytosis', def: 'Selective endocytosis in which receptors bind one particular molecule and then cluster, with their cargo, into a coated pit that pinches off. It concentrates the chosen cargo far above what drinking the fluid would collect.' },
  clathrin: { term: 'Clathrin', def: 'A three-legged protein that assembles into a curved basketwork on the cytoplasmic face of a forming vesicle. The lattice bends the membrane and sets the size of the vesicle.' },
  ldl: { term: 'Low-density lipoprotein (LDL)', def: 'The particle in which cholesterol travels in the blood, being far too hydrophobic to travel alone. Cells take it up by receptor-mediated endocytosis; when the receptor is faulty, LDL accumulates in the blood and arteries fur up early.' },
  exocytosis: { term: 'Exocytosis', def: 'Bulk transport out of a cell: a vesicle is brought to the plasma membrane and the two bilayers are forced to fuse, spilling the contents outside and adding the vesicle\'s membrane to the cell surface.' },
};
