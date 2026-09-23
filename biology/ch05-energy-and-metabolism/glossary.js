// Chapter 5 glossary. Every <tb-term ref="..."> in index.html names a key here, and every key here is
// used in the chapter at least once (npm run check enforces both). `def` may hold inline HTML.
//
// `term` may not. The glossary list and the popover both set it as text (src/components/term.js escapes
// it on purpose), so a tag in a term is printed as a tag: until 2026-09-23 the page showed
// "Maximum rate (V<sub>max</sub>)", "Michaelis constant (K<sub>m</sub>)" and "NAD<sup>+</sup>" with
// the tags visible. A symbol with a sub- or superscript therefore goes in the def, where markup renders,
// and the heading is the name. That is why the `nad` entry is headed by the full name: a precomposed ⁺
// in the heading was tried and is drawn by Libertinus Serif, visibly smaller and lighter than the bold
// face around it at 3x.
//
// Terms chapters 1 to 4 already introduced are not repeated: metabolism, homeostasis, negative feedback,
// set point, mole, covalent bond, electronegativity, polar, ion, hydrophobic effect, functional group,
// polymer, monomer, dehydration synthesis, hydrolysis, denaturation, nucleotide, protein, amino acid,
// diffusion, mitochondrion, ribosome, lysosome, motor protein, kinesin, active transport, concentration
// gradient, electrochemical gradient, dynamic equilibrium, membrane potential. Two are repeated on
// purpose, each for the reason chapter 4 gave when it repeated `osmosis`: this is the chapter where the
// word does its work and the popover has to be there when it is asked.
//
//   enzyme — chapter 2 named it in one line and said in the entry itself that "Chapter 5 takes up how
//     they work". This is that chapter, so the entry is rewritten around the activation energy.
//   ATP — chapter 4 defined it as far as four of its sections needed and pointed here. This is the
//     definition it pointed at: the parts, the reaction, and what it is actually worth.
//
// NAD⁺ and FAD are defined here although chapters 6 and 7 spend them, on the same principle running the
// other way: §5.8 has to say what a carrier is for the last two chapters of the unit to have something
// to charge and something to drain, and neither of those chapters can introduce it without the redox
// that lives here.
export const GLOSSARY = {
  // ---- 5.1 Order costs, and something else pays ----
  energy: { term: 'Energy', def: 'The capacity to cause change — to move something, heat something, or rearrange atoms. It is not a substance and not a fuel; it is a quantity that stays the same as it changes form.' },
  'kinetic-energy': { term: 'Kinetic energy', def: 'The energy of anything in motion, including the random motion of molecules, which is what heat is. A warm object holds more of it than a cold one of the same kind.' },
  'potential-energy': { term: 'Potential energy', def: 'Energy held by position or arrangement rather than by motion: a weight on a shelf, a charge separated from its opposite, an electron held by an atom that would rather not have it.' },
  'chemical-energy': { term: 'Chemical energy', def: 'The potential energy held in the arrangement of atoms and electrons in a molecule. It is released when the arrangement changes to a more stable one, which is what a chemical reaction is.' },
  'first-law': { term: 'First law of thermodynamics', def: 'Energy is neither created nor destroyed, only converted from one form to another. Nothing alive produces energy; an organism takes it in, changes its form, and passes the same amount on.' },
  'second-law': { term: 'Second law of thermodynamics', def: 'Every transfer or conversion of energy leaves the universe with more entropy than before. It forbids nothing a cell does; it prices it.' },
  entropy: { term: 'Entropy', def: 'A measure of how many different arrangements of a system\'s parts would look the same from outside. A change happens by itself when it leads to a state there are more ways of being in, and heat spreading out is the commonest such change.' },
  'open-system': { term: 'Open system', def: 'A system that exchanges both matter and energy with its surroundings. Every living thing is one, which is why a cell can lower its own entropy while the total goes up.' },

  // ---- 5.2 What decides which way a reaction goes ----
  'free-energy': { term: 'Free energy (G)', def: 'The part of a system\'s energy that is available to do work, in kilojoules per mole. The change in it, ΔG, decides which way a reaction goes: negative and it runs by itself, positive and the reverse does, zero and it is at equilibrium.' },
  exergonic: { term: 'Exergonic', def: 'Of a reaction: one that releases free energy, so ΔG is negative and it runs by itself. It says nothing at all about how fast.' },
  endergonic: { term: 'Endergonic', def: 'Of a reaction: one that takes free energy in, so ΔG is positive and it does not run by itself. A cell makes such a reaction go by coupling it to an exergonic one.' },
  'standard-free-energy': { term: 'Standard free energy change (ΔG°′)', def: 'The free energy change measured with every reactant and product at one mole per litre, at pH 7 and 25 °C. It is a property of the reaction and a useful table entry, and it is a condition no cell is ever in.' },
  'steady-state': { term: 'Steady state', def: 'A condition in which concentrations hold still because matter is flowing through at a constant rate, not because nothing is happening. A candle flame and a living cell are both steady states; an equilibrium is neither.' },

  // ---- 5.3 The cell spends one molecule ----
  atp: { term: 'ATP (adenosine triphosphate)', def: 'The molecule a cell spends when it pays for something: adenine joined to ribose, with a chain of three phosphate groups. Splitting the outer phosphate off gives ADP and free phosphate and releases about 50 kJ per mole under the conditions inside a cell.' },
  adp: { term: 'ADP (adenosine diphosphate)', def: 'What is left of ATP when the outer phosphate has been taken off. Attaching a phosphate to it again is what "making ATP" means, and is what the whole of catabolism is for.' },

  // ---- 5.4 Nothing is paid for with heat ----
  'energy-coupling': { term: 'Energy coupling', def: 'Making an endergonic reaction go by joining it to an exergonic one through a shared chemical intermediate, so that the two are steps of one process and their free energy changes add. Heat released nearby cannot do this.' },
  phosphorylation: { term: 'Phosphorylation', def: 'Transferring a phosphate group from ATP onto something else — a substrate, a transport protein, a target protein. The receiving molecule becomes less stable and therefore readier to react, or changes shape and so changes what it does.' },

  // ---- 5.5 An enzyme changes the route, not the destination ----
  enzyme: { term: 'Enzyme', def: 'A biological catalyst, almost always a protein and occasionally an RNA, that speeds one particular reaction by lowering its activation energy. It is not used up, it does not appear in the overall equation, and it changes no reaction\'s free energy or equilibrium.' },
  catalyst: { term: 'Catalyst', def: 'Anything that speeds a reaction without being consumed by it and without changing where the reaction ends up. It offers a different route between the same two places.' },
  'activation-energy': { term: 'Activation energy', def: 'The free energy a molecule must acquire to reach the transition state, the worst moment of a reaction. It is why an exergonic reaction can sit unchanged for years, and it is the only thing an enzyme changes.' },
  'transition-state': { term: 'Transition state', def: 'The arrangement at the top of the barrier, with bonds part broken and part formed — less stable than either the reactant or the product, and too short-lived to isolate. An enzyme works by binding it more tightly than it binds the substrate.' },
  substrate: { term: 'Substrate', def: 'The molecule an enzyme acts on. It binds in the active site, is turned into the product, and leaves; the enzyme is unchanged and takes the next one.' },
  'active-site': { term: 'Active site', def: 'The pocket on an enzyme where the substrate binds and the chemistry happens, made by the folding of the chain rather than by a run of neighbouring residues. A few side chains lining it do the work.' },
  'induced-fit': { term: 'Induced fit', def: 'The closing of an active site around its substrate as the substrate binds, which grips the molecule and often strains it towards the shape of the transition state. It replaced the older picture of a rigid lock and key.' },
  cofactor: { term: 'Cofactor', def: 'A non-protein helper an enzyme needs in order to work at all. Many are metal ions — zinc, iron, magnesium — held in the active site and doing chemistry the twenty side chains cannot.' },
  coenzyme: { term: 'Coenzyme', def: 'An organic cofactor, usually a small molecule that binds loosely and leaves again carrying something: a chemical group, or a pair of electrons. Most are made from vitamins, which is what a vitamin is for.' },

  // ---- 5.6 How fast, and what slows it down ----
  'maximum-rate': { term: 'Maximum rate', def: 'The rate an enzyme reaches when every active site is occupied all the time, so that adding more substrate cannot help. It is set by how much enzyme there is and how fast each molecule cycles, and is written V<sub>max</sub>.' },
  'michaelis-constant': { term: 'Michaelis constant', def: 'The substrate concentration at which an enzyme works at half its maximum rate, written K<sub>m</sub>. It does not depend on how much enzyme is present, and a low value roughly means the enzyme works well at low concentrations.' },
  'turnover-number': { term: 'Turnover number', def: 'How many substrate molecules one enzyme molecule converts each second when it is saturated. The range across biology is enormous: a few a second at one end, a million at the other.' },
  'competitive-inhibition': { term: 'Competitive inhibition', def: 'Inhibition by a molecule that resembles the substrate and occupies the active site itself. More substrate outcompetes it, so the maximum rate is unchanged and the Michaelis constant appears to rise.' },
  'noncompetitive-inhibition': { term: 'Non-competitive inhibition', def: 'Inhibition by a molecule that binds somewhere other than the active site and changes the enzyme\'s shape. More substrate does not help, because the substrate is not what it is competing with, so the maximum rate falls.' },
  'irreversible-inhibition': { term: 'Irreversible inhibition', def: 'Inhibition in which the inhibitor forms a covalent bond to the enzyme and the enzyme is finished. The cell recovers only by making more. Penicillin, aspirin and the nerve agents all work this way.' },

  // ---- 5.7 A pathway that knows when to stop ----
  allostery: { term: 'Allostery', def: 'The control of a protein by a molecule binding at a site that is not the active site. The protein has two shapes, one active and one not; what binds at the allosteric site shifts the balance between them. The word means "other shape".' },
  cooperativity: { term: 'Cooperativity', def: 'The behaviour of a multi-subunit protein whose subunits change shape together, so that one substrate binding makes the next bind more easily. It turns a gently rising rate curve into an S-shaped one, which behaves like a switch.' },
  'feedback-inhibition': { term: 'Feedback inhibition', def: 'The inhibition of the first committed enzyme of a pathway by the pathway\'s own end product. When the product is plentiful the pathway stops; when it is used up the pathway restarts, and nothing counts anything.' },
  kinase: { term: 'Kinase', def: 'An enzyme that transfers a phosphate group from ATP onto a target. Protein kinases are the commonest switches in a cell; the human genome encodes more than five hundred different ones.' },
  phosphatase: { term: 'Phosphatase', def: 'An enzyme that removes a phosphate group. It is the other half of every phosphorylation switch: without it, a switch could be thrown once and never reset.' },

  // ---- 5.8 Metabolism has a shape ----
  'metabolic-pathway': { term: 'Metabolic pathway', def: 'A sequence of reactions, each catalysed by its own enzyme, in which the product of one step is the substrate of the next. Pathways are linear, branched or cyclic, and the branch points are where regulation sits.' },
  catabolism: { term: 'Catabolism', def: 'The half of metabolism that takes large molecules apart, releasing free energy and capturing some of it as ATP. Digestion and respiration are catabolic.' },
  anabolism: { term: 'Anabolism', def: 'The half of metabolism that builds large molecules from small ones. It takes free energy in and is paid for with ATP and with reduced electron carriers.' },
  oxidation: { term: 'Oxidation', def: 'The loss of electrons by a molecule, atom or ion. In biology the electrons usually leave as part of hydrogen atoms, so a molecule that loses hydrogen has been oxidised.' },
  reduction: { term: 'Reduction', def: 'The gain of electrons, often arriving as hydrogen atoms. The name is old and unhelpful: it refers to the loss of mass when a metal ore is smelted, not to anything being reduced in the ordinary sense.' },
  'redox-reaction': { term: 'Redox reaction', def: 'A reaction in which electrons move from one substance to another. Oxidation and reduction are two halves of one event and never happen apart: whatever is oxidised has reduced something else.' },
  'electron-carrier': { term: 'Electron carrier', def: 'A small molecule that picks up electrons from one reaction and delivers them to another, then goes back for more. A cell keeps very little of each and recycles it constantly, exactly as it does with ATP.' },
  nad: { term: 'Nicotinamide adenine dinucleotide', def: 'The main electron carrier of catabolism, written NAD<sup>+</sup> in the form that is ready to take electrons: two nucleotides joined tail to tail, which accepts two electrons and one proton to become NADH. A pool of NADH is a cell holding electrons it has not yet let fall.' },
  fad: { term: 'FAD', def: 'The other common electron carrier, built around riboflavin — vitamin B<sub>2</sub>. It takes two electrons and two protons to become FADH<sub>2</sub>, and unlike NAD<sup>+</sup> it usually stays bound to the enzyme that uses it.' },
};
