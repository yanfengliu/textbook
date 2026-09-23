// Chapter 8 glossary. Every <tb-term ref="..."> in index.html names a key here and every key here is
// used in the chapter (npm run check enforces both); each is marked once, at its first use, which no
// check enforces. `def` may hold inline HTML.
//
// Terms chapters 1 to 7 already introduced are not repeated, and the chapter uses their words rather
// than paraphrasing them: DNA, base pair, gene, genome, nucleus, nucleic acid, nucleotide, polymer,
// monomer, dehydration synthesis, hydrolysis, isomer, functional group, amino acid, protein,
// polysaccharide, hydrogen bond, covalent bond, ion, isotope, enzyme, active site, induced fit,
// substrate, ATP, ADP, free energy, energy coupling, NAD⁺, capsule, nucleoid, plasmid, ribosome,
// archaea, prokaryote, eukaryote, mitochondrion, chloroplast, endosymbiosis, electron transport chain,
// photon, natural selection, hypothesis, theory and control.
//
// Two of those carry more weight here than a plain word usually does, and each is glossed in line at
// its first use rather than given a second entry: `isotope` (§8.1, "atoms of one element with different
// numbers of neutrons"), because both the Hershey–Chase and the Meselson–Stahl experiments turn on it,
// and `tautomer`'s parent idea, the structural isomer of §2.5, which §8.2 names in the same sentence.
// `chromosome` is defined here although chapters 1 and 3 used the word, because neither gave it an
// entry and §8.1's argument starts from what a chromosome is made of.
//
// Words the prose leans on once and glosses in the sentence, so they carry no entry: intron and
// pseudogene (§8.8, Chapter 9 owns the first), centromere (§8.6, Chapter 10 owns it), homologous
// recombination (§8.5, Chapter 11 owns it), fibroblast, thymidine, Lynch syndrome and xeroderma
// pigmentosum.
export const GLOSSARY = {
  // ---- 8.1 The genes were in the duller molecule ----
  chromosome: { term: 'Chromosome', def: 'A single long molecule of DNA together with the proteins that package it. A human cell has 46, in two sets; a bacterium usually has one, and it is a circle. Genes were known to lie on chromosomes decades before anyone knew which of their two components the genes were made of.' },
  transformation: { term: 'Transformation', def: 'A heritable change in a bacterium caused by DNA it takes up from its surroundings. Griffith discovered it in 1928, when dead virulent pneumococci turned live harmless ones virulent; Avery, MacLeod and McCarty showed in 1944 that the substance responsible was DNA.' },
  bacteriophage: { term: 'Bacteriophage', def: 'A virus that infects bacteria, often called simply a phage. The T2 phage Hershey and Chase used is a protein coat around one molecule of DNA; it injects the DNA into the cell and leaves the coat outside.' },

  // ---- 8.2 The helix was measured before it was built ----
  'x-ray-diffraction': { term: 'X-ray diffraction', def: 'The scattering of X-rays by a structure that repeats regularly, into a pattern of spots and arcs whose positions give the spacings of the repeats: the wider a spacing, the nearer the centre its spots fall. No lens can focus X-rays, so the result is a pattern to be measured and interpreted, not an image.' },
  'chargaff-rules': { term: 'Chargaff\'s rules', def: 'The observations, made by Erwin Chargaff around 1950, that in the DNA of any one organism there is as much adenine as thymine and as much guanine as cytosine, while the proportion of the two pairs differs from one species to another.' },
  tautomer: { term: 'Tautomer', def: 'One of two forms of a molecule that differ only in where one hydrogen atom sits and that turn into each other readily: a mobile kind of structural isomer. Each base of DNA spends almost all its time in one form, and only in that form do the pairs fit.' },
  purine: { term: 'Purine', def: 'A base built on two fused rings: adenine or guanine. In the double helix a purine always pairs with a pyrimidine.' },
  pyrimidine: { term: 'Pyrimidine', def: 'A base built on a single ring: cytosine, thymine or uracil. Two pyrimidines side by side are too narrow to span the helix, which is one reason a pyrimidine always pairs with a purine.' },
  'strand-ends': { term: '5′ and 3′ ends', def: 'The two chemically different ends of a strand of nucleic acid, named after carbons of the sugar: the 5′ end\'s last sugar carries a phosphate on its fifth carbon, and the 3′ end\'s a hydroxyl group on its third. A polymerase can add a nucleotide only at a 3′ end.' },
  antiparallel: { term: 'Antiparallel', def: 'Running side by side in opposite directions. The two strands of a double helix are antiparallel: where one runs from its 5′ end to its 3′ end, its partner runs from 3′ to 5′.' },
  groove: { term: 'Major and minor grooves', def: 'The two spiral grooves of unequal width that run along a double helix, because the two sugars of each base pair are attached on the same side of it. The edges of the bases lie exposed in both, so a protein can read the sequence without opening the helix.' },

  // ---- 8.3 The structure says how it is copied ----
  template: { term: 'Template', def: 'A strand whose sequence dictates, base by base and by the pairing rule, the sequence of a new strand made against it.' },
  'semiconservative-replication': { term: 'Semiconservative replication', def: 'Copying in which the two strands of the parent helix separate and each serves as a template, so that each new double helix is one old strand and one new. Meselson and Stahl showed in 1958 that DNA is copied this way.' },
  'density-gradient-centrifugation': { term: 'Density-gradient centrifugation', def: 'Separating molecules by density, by spinning them for many hours in a solution — of caesium chloride, for DNA — until its density rises smoothly from top to bottom. Each molecule settles where the solution\'s density matches its own, and molecules of one density gather in one band.' },

  // ---- 8.4 Copying runs one way, and the strands do not ----
  'dna-polymerase': { term: 'DNA polymerase', def: 'An enzyme that makes DNA by adding nucleotides one at a time to the 3′ end of a primer, each chosen to pair with the base opposite in a template strand. It cannot start a strand, and it cannot add to a 5′ end.' },
  primer: { term: 'Primer', def: 'A short stretch of nucleic acid paired to a template and ending in a free 3′ hydroxyl group, which a DNA polymerase can extend. In a cell every new strand of DNA begins on a primer of RNA about ten nucleotides long.' },
  dntp: { term: 'Deoxynucleoside triphosphate (dNTP)', def: 'A DNA nucleotide carrying a chain of three phosphates, the form in which a polymerase takes up its building blocks. When one is added to a strand its outer two phosphates leave as pyrophosphate, and that pays for the new bond.' },
  pyrophosphate: { term: 'Pyrophosphate', def: 'Two phosphate groups joined together, written PP<sub>i</sub>. It is released every time a nucleotide is added to DNA or RNA, and an enzyme splits it into two phosphates at once, which is what makes each addition one-way.' },
  'phosphodiester-bond': { term: 'Phosphodiester bond', def: 'The link in the backbone of DNA and RNA: a phosphate joined to the 3′ carbon of one sugar and the 5′ carbon of the next.' },
  'origin-of-replication': { term: 'Origin of replication', def: 'A place on a chromosome where copying begins: the helix is opened there and two replication forks set off in opposite directions. A bacterial chromosome has one; a human cell uses tens of thousands.' },
  'replication-fork': { term: 'Replication fork', def: 'The Y-shaped region where the parent helix is being opened and both of its strands copied. It moves along the DNA as copying goes on, and two leave every origin, travelling in opposite directions.' },
  helicase: { term: 'Helicase', def: 'A motor protein that uses ATP to separate the two strands of a helix at a replication fork, breaking the hydrogen bonds between the pairs a few at a time.' },
  supercoiling: { term: 'Supercoiling', def: 'The coiling of a double helix on itself, as an over-twisted rope coils, when it is wound more tightly or more loosely than it would lie on its own. Unwinding DNA at a fork overwinds the DNA ahead of it.' },
  topoisomerase: { term: 'Topoisomerase', def: 'An enzyme that relieves the twisting in DNA by cutting one or both strands, letting the DNA rotate or pass through the gap, and sealing the cut again. It is how a cell unwinds a helix without spinning the molecule.' },
  'leading-strand': { term: 'Leading strand', def: 'The new strand at a replication fork whose 3′ end points towards the fork, so that it is extended continuously as the fork advances.' },
  'okazaki-fragment': { term: 'Okazaki fragment', def: 'One of the short pieces in which the lagging strand is made, each begun on its own RNA primer: about a thousand to two thousand nucleotides long in bacteria, and a hundred to two hundred in eukaryotes.' },
  'lagging-strand': { term: 'Lagging strand', def: 'The new strand at a replication fork whose 3′ end points away from the fork. Because a polymerase can only extend a 3′ end, it has to be made backwards in short fragments, each started near the fork as more template is exposed and joined to the last afterwards.' },
  primase: { term: 'Primase', def: 'The enzyme that makes the short RNA primers on which new DNA strands are begun. Unlike a DNA polymerase it can start a chain from nothing, but it cannot check what it has made.' },
  'dna-ligase': { term: 'DNA ligase', def: 'The enzyme that seals a nick in the backbone of DNA by making the one missing phosphodiester bond. It joins the Okazaki fragments of a lagging strand into one continuous strand.' },

  // ---- 8.5 The archive is kept by checking it ----
  proofreading: { term: 'Proofreading', def: 'The removal by a DNA polymerase of a nucleotide it has just added wrongly, at a second active site that cuts nucleotides off the 3′ end of a strand. It makes copying about a hundred times more accurate, and it is possible only because strands grow at their 3′ end.' },
  'mismatch-repair': { term: 'Mismatch repair', def: 'The system that finds wrongly paired bases left behind after copying, removes a stretch of the new strand containing the error and rebuilds it. It tells the new strand from the old by marks the old one carries or the new one lacks.' },
  deamination: { term: 'Deamination', def: 'The loss of an amino group. Cytosine loses its amino group spontaneously hundreds of times a day in every human cell and becomes uracil, which pairs with adenine instead of guanine.' },
  'pyrimidine-dimer': { term: 'Pyrimidine dimer', def: 'Two neighbouring pyrimidines on one strand, usually thymines, joined by new covalent bonds after one of them absorbs an ultraviolet photon. The dimer kinks the helix and stops a polymerase until it is cut out.' },
  'base-excision-repair': { term: 'Base excision repair', def: 'Repair of one damaged or wrong base: an enzyme that recognises it cuts it from its sugar, the empty site is removed, and the one-nucleotide gap is filled by pairing against the other strand.' },
  'nucleotide-excision-repair': { term: 'Nucleotide excision repair', def: 'Repair of damage that distorts the helix, such as a pyrimidine dimer: the damaged strand is cut on both sides of the lesion, and a stretch of about thirty nucleotides is removed and rebuilt from the other strand. People who lack it have xeroderma pigmentosum.' },
  'double-strand-break': { term: 'Double-strand break', def: 'A break through both backbones of a double helix at nearly the same place, leaving no intact partner strand to repair from. It is mended either by joining the ends directly, which can lose a few letters, or by copying the missing sequence from the matching molecule made at replication.' },
  mutation: { term: 'Mutation', def: 'A heritable change in the sequence of DNA. Mutations come from copying errors that escaped every check and from damage repaired wrongly or not at all; most are harmless, some are harmful, and a few are the new variation on which natural selection works.' },

  // ---- 8.6 Two metres, wound on spools ----
  histone: { term: 'Histone', def: 'One of a small family of proteins, rich in the positively charged amino acids lysine and arginine, on which the DNA of eukaryotes is wound. They bind the negatively charged backbone and so can package any sequence, and they are among the most unchanging proteins known.' },
  nucleosome: { term: 'Nucleosome', def: 'The basic unit of packing in a eukaryotic chromosome: 147 base pairs of DNA wound about one and two-thirds times around a core of eight histones, joined to the next by a stretch of linker DNA.' },
  chromatin: { term: 'Chromatin', def: 'DNA together with the proteins that package it, as it is found in a nucleus. The word was coined in the nineteenth century for the part of a nucleus that took up dye.' },
  heterochromatin: { term: 'Heterochromatin', def: 'Chromatin that stays tightly packed and darkly staining through most of a cell\'s life. It holds few of the genes being read and much repeated sequence, around the centromeres especially.' },
  euchromatin: { term: 'Euchromatin', def: 'Chromatin that is loosely packed between divisions, where most of the genes being read are found.' },

  // ---- 8.7 A linear chromosome cannot copy its own ends ----
  'end-replication-problem': { term: 'End-replication problem', def: 'The inability of the ordinary copying machinery to finish the lagging strand at the very end of a linear DNA molecule, because the gap left by the last primer has nothing beyond it to be extended from. Each copy is a little shorter than its template.' },
  telomere: { term: 'Telomere', def: 'The end of a linear chromosome: a short sequence — TTAGGG in humans — repeated more than a thousand times, with the proteins bound to it that stop the end being treated as a break. The repeats carry no genes, and they are what is shortened a little at each division, in place of anything that matters.' },
  'hayflick-limit': { term: 'Hayflick limit', def: 'The number of times a normal cell can divide before it stops for good — about fifty for human fibroblasts from fetal tissue grown in a dish, and fewer for cells from adults — largely because its telomeres have become too short.' },
  telomerase: { term: 'Telomerase', def: 'An enzyme that lengthens telomeres by adding repeats to a chromosome\'s 3′ end, copying them from a template in a molecule of RNA it carries. It is active in the cells that give rise to eggs and sperm, in some stem cells and in most cancers, and scarce in most other human cells.' },
  'reverse-transcriptase': { term: 'Reverse transcriptase', def: 'An enzyme that makes DNA using RNA as its template, the reverse of the usual direction of copying. Telomerase contains one, as do HIV and the retrotransposons that make up much of the human genome.' },

  // ---- 8.8 Most of a genome is not genes ----
  'transposable-element': { term: 'Transposable element', def: 'A stretch of DNA that can move, or copy itself, to a new place in a genome, either by being cut out and pasted in elsewhere or by being copied into RNA and back into DNA. Nearly half the human genome is made of them, almost all long since broken.' },
  retrotransposon: { term: 'Retrotransposon', def: 'A transposable element that copies itself through RNA: it is copied into RNA, a reverse transcriptase copies the RNA back into DNA, and the new copy is inserted elsewhere while the original stays put. LINE-1 and Alu, together more than a quarter of the human genome, are retrotransposons.' },
  'c-value-paradox': { term: 'C-value paradox', def: 'The observation that the amount of DNA in a genome bears little relation to how complex the organism is. Most of the difference lies in transposable elements and other repeats, not in genes.' },
  'junk-dna': { term: 'Junk DNA', def: 'A name, in use by the 1960s and made famous in 1972, for DNA that has no function. It is a claim about a particular sequence that can be tested, chiefly by asking whether changes to it are weeded out by natural selection, and not a settled label for everything that does not code for protein.' },
};
