// Chapter 6's review item bank: the questions the spaced-repetition queue draws on
// (docs/design/adaptive.md). Every item names exactly one objective from objectives.js, and the items
// an objective gets differ in what they demand — say it, explain it, or use it on a case the chapter
// has not worked through — so a reader who has memorised one still has to think about the others.
//
// The `why` on a wrong option is the working part of this file. It says what choosing that option
// reveals about the reader's thinking, so the agent round can turn "wrong three times" into a named
// misconception and teach against it. A distractor that is merely false teaches nothing.
//
// Five ideas in this chapter are the ones readers get wrong, and the distractors are built out of them
// rather than out of plausible-sounding falsehoods.
//
//   A photon is a packet, not a dose. Its energy is fixed by its wavelength, the shorter the more, and
//     it is absorbed whole by one molecule or not at all; brightness, distance and depth change how many
//     photons arrive and never what each carries, and heat cannot stand in for it at any temperature.
//   A leaf's colour is a leftover. Chlorophyll absorbs green least, a leaf still absorbs most of it,
//     and nothing was selected to be green.
//   The light reactions make a gradient, not ATP. The gradient is the intermediate: a leak stops the
//     ATP and speeds the electrons up, and a gradient made by hand makes ATP in the dark.
//   The cycle is a cycle because its acceptor is used up, and its costs — three ATP and two NADPH —
//     are charged per carbon dioxide, not per sugar.
//   Rubisco's mistake is concentrations and chemistry, not a broken enzyme. How often it takes oxygen
//     follows the ratio it sees, and that ratio was harmless in the air the enzyme evolved in.
//
// Others in the same family, each of which a distractor below encodes: that a longer wave carries more
// energy; that excitation warms a molecule in general, or stores energy until it is wanted; that the
// tail or the metal is what colours chlorophyll; that any coloured molecule in a leaf feeds the
// photosystems; that oxygen is what photosystem II is for; that ATP pays for the electrons' climb; that
// NADPH's phosphate is a store of energy; that cyclic flow can make NADPH; that a pump is any big source
// of protons; that a membrane sealed against protons is sealed against oxygen; that a gradient has a
// size but no direction; that the synthase is driven by light; that darkness reverses an enzyme; that a
// leaf moved into sun is waiting on its antenna; that a C4 plant stores carbon overnight; that a CAM
// plant's rubisco works at night; and that C4 is a better C3.
//
// Formats:
//   mcq  — { options: [{ text, correct } | { text, why }] }, exactly one correct.
//   free — { rubric: [...] }, the points a good answer makes.
//
// No `task` items. The owner cut chapter 6 to four figures — pigment-spectra, zscheme, calvin-cycle
// and rubisco-fork — and set it no figure tasks, so every objective's items are questions: 120 in all,
// 77 mcq and 43 free, three per objective and both formats for each. Twenty-two objectives had kept
// their third slot for a task; each now has a third question instead, the `-3` item, which asks for
// something its other two do not: light-not-heat, excited-electron, chloroplast-compartments,
// thylakoid-is-closed, absorption-vs-action, why-leaves-green, antenna-and-protection,
// two-photosystems, water-split, cyclic-flow, thylakoid-gradient, photophosphorylation, acid-bath,
// calvin-phases, not-dark-reactions, oxygenation-arithmetic, rubisco-abundance, atmosphere-changed,
// stomatal-tradeoff, c4-mechanism, cam-mechanism and choose-strategy. No item cites a figure by
// number, because the chapter's figure numbers are changing, and no item needs a figure to answer it.
//
// Option order and length: the correct option is spread across A to D, and each item's options are
// written to comparable lengths, so that neither the position nor the length of an option says which
// one is right. A reader learns a position or a length faster than a mechanism. Measured on this
// revision by counting each option's characters with the markup stripped, a tie counted as neither
// longer nor shorter: the correct option is strictly the longest of its four in 19 of the 77 items, the
// second longest in 20, the third in 20 and strictly the shortest in 18, with no ties; it sits at A, B,
// C and D 19, 19, 20 and 19 times. Nor does the size give it away: where it is the longest it is at
// most 8 per cent longer than the longest wrong option, and where it is the shortest the shortest wrong
// option is at most 10 per cent longer than it. (Before the third questions, 12 of 58 were strictly the
// longest and two more tied for it.) Whoever adds an item keeps all three. The written order is not the
// order a reader sees, because options are shown in a drawn order, so no explanation, option or `why`
// names an option by where it is written; each names it by what it says.
//
// Written against the independent prose review of 2026-09-22 as well as the chapter. No item tests or
// rewards a claim the review corrected. The six-carbon intermediate of carboxylation never leaves the
// enzyme and was caught only by stopping it with acid, so no item says it was never isolated
// (`carboxylation-product`). PEP carboxylase's advantage is what it takes, not how tightly it binds
// (`c4-mechanism`). Three pH units is the isolated-thylakoid figure, so the items that put numbers on
// the gradient set them as a case (`thylakoid-gradient`). Rubisco is not counted among thioredoxin's
// targets (`not-dark-reactions`). Regeneration spends a third of the cycle's ATP (`calvin-ledger`). The
// minutes a leaf takes to reach full speed in sudden sun are rubisco being switched on and then the
// stomata opening, and `i-not-dark-reactions-3` asks exactly that, with the antenna as the distractor;
// the antenna's heat-shedding is slow on the way back into shade, and `i-antenna-and-protection-3` uses
// it in that direction only. No item quotes the antenna's transfer time or calls ferredoxin the chain's
// strongest reductant. The accuracy review of 2026-09-24
// (worktrees/reviews/2026-09-24-ch06-accuracy.md) found every key right; after it, oxygen is the one
// thing the two halves make that leaves the chloroplast before the sugar does
// (`i-division-of-labour-1`, `-3`), and fluorescence comes from chlorophyll's lowest excited state
// whatever colour was absorbed, a blue photon's surplus gone as heat first (Kasha, Discuss. Faraday
// Soc. 9:14, 1950), so no item calls the photon slightly redder or fainter
// (`i-antenna-and-protection-2`, `i-excited-electron-1`, `-2`).
//
// Cases from outside the chapter, and what each was checked against: ultraviolet at 300 nm against
// chapter 2's 350 kJ/mol bond, by the chapter's own 119 600/λ; the polyene series 217, 258 and about
// 450 nm (standard organic-chemistry values); cutting chlorophyll's tail leaving its absorption much as
// it was (chlorophyllide's spectrum); red algae's action peaks near 540 and 565 nm (Haxo and Blinks, J.
// Gen. Physiol. 33:389, 1950); seedlings kept green in dim light and bleached in bright light by a
// carotenoid-synthesis inhibitor (norflurazon in wheat); Hill's oxygen from isolated chloroplasts with
// no carbon dioxide (Nature 139:881, 1937); green sulfur bacteria's single photosystem and sulfide's
// potential of about −0.25 V (−0.24 to −0.27 V by source); paraquat taking electrons at photosystem I;
// Duysens's cytochrome oxidised by one light and reduced by the other (Nature 190:510, 1961); algal
// hydrogen at −0.42 V; the liver's NAD held oxidised and its NADP reduced (Veech, Eggleston and Krebs,
// Biochem. J. 115:609, 1969); a fifteen-subunit c-ring in a cyanobacterium (Pogoryelov et al., EMBO
// Rep. 6:1040, 2005); water vapour diffusing about 1.6 times faster than carbon dioxide in air; the
// high-carbon-dioxide rescue of photorespiratory mutants (Somerville and Ogren, Nature 280:833, 1979);
// C4 leaves holding roughly half the rubisco of C3 leaves at the same nitrogen (Sage, Pearcy and
// Seemann, Plant Physiol. 85:355, 1987); C4 leaves carrying more of the machinery of cyclic flow
// (Takabayashi et al., PNAS 102:16898, 2005); the C4 share of North America's grasses following July
// nights (Teeri and Stowe, Oecologia 23:1, 1976); and the ice plant switching to CAM under drought or
// salt. The 35 °C figures in `i-oxygenation-arithmetic-2` are round values from the temperature
// dependence of the two gases' solubility and of rubisco's specificity, and the item says they are
// illustrative.
//
// The third questions added these: cyanobacteria photosynthesising in hot springs near 70 °C, with RT
// at 343 K about 2.9 kJ/mol; chlorophyll fluorescing brightly in a solvent and weakly in a leaf;
// anthocyanin held in the vacuoles of purple leaves and screening the chloroplasts beneath (Gould, J.
// Biomed. Biotechnol. 2004:314, 2004); green light driving photosynthesis less well per photon than red
// but far from not at all (McCree, Agric. Meteorol. 9:191, 1972); the flash pattern's period of four;
// heterocysts, which lack a working photosystem II, make ATP by cyclic flow and take nitrogenase's
// electrons from sugar their neighbours send (Kumar, Mella-Herrera and Golden, Cold Spring Harb.
// Perspect. Biol. 2:a000315, 2010); the chloroplast ATP synthase kept off in the dark by a disulfide
// that thioredoxin opens in the light, and a thylakoid's gradient running down within seconds once the
// light goes off (Hind and Jagendorf, PNAS 49:715, 1963); the carbon-dioxide-removal transient, RuBP up
// and 3-phosphoglycerate down (Wilson and Calvin, J. Am. Chem. Soc. 77:5948, 1955); induction on moving
// into sun limited first by rubisco's activation and then by the stomata (Taylor and Long, Phil. Trans.
// R. Soc. B 372:20160543, 2017); tobacco whose heat-shedding switches off faster growing about 15 per
// cent more in the field (Kromdijk et al., Science 354:857, 2016); partial pressures falling together
// with altitude, and a gas dissolving in proportion to its own; cyanobacteria pumping bicarbonate into
// the cell and releasing it as carbon dioxide inside carboxysomes (Badger and Price, J. Exp. Bot.
// 54:609, 2003); a cyanobacterial rubisco several times faster and about half as selective as a
// plant's, and the trade-off across species (Savir, Noor, Milo and Tlusty, PNAS 107:3475, 2010); the
// bundle sheath's slow leak as part of what the C4 pump costs (von Caemmerer and Furbank, Photosynth.
// Res. 77:191, 2003); and C4 photosynthesis arising more than sixty times, the oldest origins in
// grasses about thirty million years ago as carbon dioxide fell (Sage, Christin and Edwards, J. Exp.
// Bot. 62:3155, 2011; Christin et al., Curr. Biol. 18:37, 2008). The 2 grams of rubisco a square metre
// in `i-rubisco-abundance-3` and the two units in `i-thylakoid-gradient-3` are set as cases, and each
// item says so.
//
// Typography: super- and subscripts are markup, and a Greek letter hyphenated to a word carries a word
// joiner, β-⁠carotene, as in the prose (docs/design/chapter-recipe.md §7).
//
// `npm run check` enforces: unique ids, a declared objective, at least three items each, exactly one
// correct option with a `why` on every other, an explanation on every item, and a rubric on every free
// response. Its option-position rule landed on main with the drawn option order and is not on this
// branch yet; main's checkChapterData, imported and run over this bank, finds nothing (and does fire on
// a planted "The first option" and "option B"), and a wider net for ordinals and "above" and "below",
// read by hand, found only ordinary prose.

export const ITEMS = [
  // ============================================================================
  // 6.1 Everything here is running on sunlight
  // ============================================================================

  {
    id: 'i-photon-energy-1',
    objective: 'photon-energy',
    kind: 'mcq',
    question: 'Four kinds of light: infrared at 1000\u00A0nm, red at 680\u00A0nm, violet at 400\u00A0nm and ultraviolet at 300\u00A0nm. For which of them does a mole of photons carry more energy than it takes to break a mole of carbon–carbon bonds, about 350\u00A0kilojoules?',
    options: [
      { text: 'Infrared at 1000\u00A0nm, because infrared is the light that heats things, and heating is what breaks bonds.',
        why: 'Mixes up what a beam does in bulk with what one photon carries. Infrared warms skin because a great many of its photons are absorbed and their energy is shared out as heat; each one carries the least of the four, 119 600 ÷ 1000 or about 120\u00A0kilojoules per mole, far short of a bond.' },
      { text: 'Red at 680\u00A0nm, because chlorophyll depends on red light, and photosynthesis must break the leaf\'s chemical bonds in order to rebuild them as sugar.',
        why: 'Assumes photosynthesis works by light breaking bonds. It works by moving one electron from one orbital to another, which takes far less: 176\u00A0kilojoules per mole, about half a carbon–carbon bond. Nothing in the light reactions needs a bond broken by light.' },
      { text: 'Ultraviolet at 300\u00A0nm: 119 600 ÷ 300 is about 400\u00A0kilojoules per mole, more than a carbon–carbon bond, and none of the others comes near.', correct: true },
      { text: 'Violet at 400\u00A0nm, the most energetic colour the eye can see, because the edge of the visible is where light becomes strong enough to break bonds.',
        why: 'Right direction, wrong size. Violet carries the most of any visible colour, but 119 600 ÷ 400 is 299, short of 350. No colour the eye can see carries a bond-breaking photon.' },
    ],
    explain: 'The energy in a mole of photons is 119 600 divided by the wavelength in nanometres, so it rises as the wavelength falls: about 120 at 1000\u00A0nm, 176 at 680, 299 at 400, about 400 at 300. Only the ultraviolet clears the 350 of a carbon–carbon bond, which is part of why ultraviolet can damage molecules that visible light passes through or merely excites. The infrared that feels hottest on the skin carries the least per photon of the four.',
  },
  {
    id: 'i-photon-energy-2',
    objective: 'photon-energy',
    kind: 'mcq',
    question: 'In clear seawater the red end of sunlight is absorbed within the first few metres, and twenty metres down the light that is left is mostly blue-green, at about 480\u00A0nm. Work out what a mole of those photons is worth. Is it more or less than a mole of the red photons, at 680\u00A0nm, that chlorophyll absorbs at the surface?',
    options: [
      { text: 'Less: light that has come through twenty metres of water has lost energy on the way, so every photon that arrives carries less than it did at the surface.',
        why: 'Treats a photon like a ball slowing down in water. A photon is absorbed whole or passes on unchanged, so the water removes photons\u00A0— the light gets dimmer\u00A0— and every photon that arrives still carries what its wavelength says: 119 600 ÷ 480 at any depth.' },
      { text: 'More: about 250\u00A0kilojoules against 176. The water took photons away, not energy from the ones left, and the shorter wave carries more.', correct: true },
      { text: 'The same, about 176: every photon of visible light carries the same energy, and its colour only decides which of the pigments will catch it.',
        why: 'Reads colour as a label rather than a quantity. A photon\'s colour and its energy are one number read two ways, which is why the chapter\'s table runs from 299 at the violet end to 171 in the far red.' },
      { text: 'More for each photon, but less for a mole of them, because far fewer blue-green photons reach that depth than red ones fall on the surface.',
        why: 'Mixes up what a mole of photons is worth with how many arrive. A mole is a fixed number of photons, so its worth is one photon\'s worth times that number; how dim the light is changes how long a mole takes to arrive, not what it delivers.' },
    ],
    explain: '119 600 ÷ 480 is about 249\u00A0kilojoules per mole of photons, some 40\u00A0per\u00A0cent more than the red. Which end carries more never changes\u00A0— the shorter the wavelength, the more each photon carries\u00A0— and depth, distance and dimness change only how many photons there are.',
  },
  {
    id: 'i-photon-energy-3',
    objective: 'photon-energy',
    kind: 'free',
    question: 'A grower can buy a 100-watt lamp that gives blue light at 450\u00A0nm or a 100-watt lamp that gives red light at 650\u00A0nm. Work out what a mole of photons from each is worth, and say which end of the spectrum carries more and why. Then say what is wrong with calling the blue lamp the more powerful of the two.',
    rubric: [
      'a mole of photons is worth 119 600 divided by the wavelength in nanometres, in kilojoules: about 266 at 450\u00A0nm and about 184 at 650\u00A0nm',
      'the blue end carries more, because a photon\'s energy goes as one over its wavelength: the shorter the wave, the more each photon carries',
      'each blue photon carries about 1.45 times what a red one does',
      'both lamps put out the same 100\u00A0joules each second, so the red lamp must be sending out about 1.45 times as many photons each second to deliver it',
      '"more powerful" mixes up the energy of one photon with the power of a lamp: power is photons per second times the energy of each, and here it is the same by definition',
      'a pigment absorbs photons one at a time, whole or not at all, so for a leaf the number of photons arriving each second is the measure that matters\u00A0— which is why lamps for growing plants are rated by the photons they deliver rather than by their watts',
    ],
    explain: 'A photon\'s colour and its energy are the same fact, and the direction never changes: violet carries the most per photon, far red the least. What that does not tell you is how much light a lamp gives. Power is photons per second times the energy of each, so two lamps of equal wattage trade one against the other, and the one with the weaker photons simply sends more of them.',
  },

  {
    id: 'i-light-not-heat-1',
    objective: 'light-not-heat',
    kind: 'mcq',
    question: 'A leaf is kept in the dark and warmed from 25\u00A0°C to 45\u00A0°C. In total, its molecules gain far more energy than a few seconds of sunlight would deliver, yet not one chlorophyll gives an electron away. Why not?',
    options: [
      { text: 'Heat and light are different kinds of energy, and only light energy can ever be turned into chemical energy, however hot the leaf is made.',
        why: 'Treats forms of energy as separate currencies that cannot be exchanged. Heat can do work perfectly well given a difference in temperature\u00A0— every engine runs on one. What is wrong with this heat is how it arrives: shared out, and at the leaf\'s own temperature.' },
      { text: '45\u00A0°C is simply not hot enough; at a few hundred degrees the heat would push electrons across the gap as readily as the light does in the sun.',
        why: 'Thinks the shortfall is one of amount. The thermal energy at 45\u00A0°C is about 2.6\u00A0kilojoules per mole against a gap of 176; matching the gap takes over twenty thousand kelvin, and long before that every other bond in the leaf would have broken, because heat does not choose which electron it lands on.' },
      { text: 'Chlorophyll is built to respond only to light, so the heat added to the leaf in the dark never reaches the chlorophyll molecules at all.',
        why: 'Chlorophyll warms like everything else in the leaf\u00A0— its bonds vibrate faster. The heat reaches it; what heat cannot do is arrive as one lump big enough to lift one electron across the gap.' },
      { text: 'Heat is shared over every bond, a little each, so no electron gets a lump the size of the gap; a photon gives its all to one electron.', correct: true },
    ],
    explain: 'A mole of red photons carries 176\u00A0kilojoules, about seventy times the leaf\'s thermal energy at 25\u00A0°C, and each photon delivers all of its share to one electron in one event. Warming the leaf does the opposite: it adds a little energy to every bond and molecule and speeds up every reaction indiscriminately. There is a third difference, and it answers Section\u00A05.1 directly: sunlight comes from a surface at about 5800\u00A0kelvin, so a sunlit leaf does have a temperature difference to work across, and a heater gives it none.',
  },
  {
    id: 'i-light-not-heat-2',
    objective: 'light-not-heat',
    kind: 'free',
    question: 'Name the two things a photon does that warming a cell does not, and use them to explain why light can drive chemistry in a leaf although heat at one temperature cannot. Then give the third difference, and say which rule of Section\u00A05.1 it answers.',
    rubric: [
      'a photon is absorbed whole or not at all: its energy arrives in one place, in one lump, in one event, and half a photon never does half the job',
      'that lump goes into a single electron in a single molecule, moving it into an orbital where it is held less tightly, and leaves everything else as it was',
      'warming does the opposite: it puts a little energy into every bond and molecule and speeds up every reaction indiscriminately, including the ones the leaf needs not to happen',
      'what matters is the form, not the amount: to give molecules 176\u00A0kilojoules per mole of thermal energy each, a leaf would have to be heated past twenty thousand kelvin, and the energy would still arrive shared out',
      'Section\u00A05.1\'s rule is that heat at one temperature can do no work, and a cell is at one temperature',
      'sunlight is radiation from a surface at about 5800\u00A0kelvin arriving at a leaf at about 300, so a sunlit leaf does have a hot reservoir to work across',
    ],
    explain: 'The ratio\u00A0— a red photon is worth about seventy times the thermal energy in a leaf\u00A0— is the number people remember, and it is not the reason. A hot enough object could supply the same energy per mole and still be useless, because it would supply it to everything at once. What makes light able to do chemistry is that it arrives whole and lands on one electron, and that it comes from something far hotter than the leaf.',
  },
  {
    id: 'i-light-not-heat-3',
    objective: 'light-not-heat',
    kind: 'mcq',
    question: 'Cyanobacteria photosynthesise in hot springs at 70\u00A0°C, where the thermal energy is about 2.9\u00A0kilojoules per mole, against 2.4 in a pond at 15\u00A0°C. Does the heat of the spring do part of the work of lifting chlorophyll\'s electrons, so that these cells need fewer photons for each oxygen than a pond alga does?',
    options: [
      { text: 'Yes: a hot molecule is already part of the way up, so a photon need only finish the lift, and some of the electrons can make the climb on heat alone.',
        why: 'Treats heat and light as doses that add. Heat can lend a few kilojoules at the red edge, but never the bulk of the 176: each electron still needs a photon of about that size at each photosystem, so the count per oxygen is unchanged.' },
      { text: 'Yes: heat speeds up every reaction, so the whole chain runs faster at 70\u00A0°C and each photon is made to do more of the work.',
        why: 'Confuses a rate with a supply of energy. Warmth speeds reactions that can already go, up to the point where proteins fail, but it does not make a photon worth more: each electron lifted still needs a photon of its own.' },
      { text: 'No: 2.9\u00A0kilojoules is a sixtieth of the gap, so each electron still needs its own photon at each photosystem: eight per oxygen, as in the pond.', correct: true },
      { text: 'No: at 70\u00A0°C the heat is already breaking chlorophyll\'s bonds, so the cells must spend their light on repairing the damage.',
        why: 'Overrates what heat does to one molecule. A carbon–carbon bond takes about 350\u00A0kilojoules per mole to break and the spring supplies 2.9, over a hundred times less; what fails first in heat is the folding of proteins, held by far weaker bonds, and these cells build proteins that hold.' },
    ],
    explain: 'A red photon is a lump: 176\u00A0kilojoules per mole, all of it delivered to one electron in one event. The spring\'s heat is about 2.9\u00A0kilojoules per mole, shared out as jostling over every bond, and a sixtieth of the gap spread over a whole cell lifts no electron. So the photon count is set by the electrons, not the temperature: four electrons per oxygen, each lifted twice, at least eight photons in the spring as in the pond. The heat changes how fast the enzymes run, and what proteins have to be built to survive it, not what the light has to supply.',
  },

  {
    id: 'i-excited-electron-1',
    objective: 'excited-electron',
    kind: 'mcq',
    question: 'A chlorophyll molecule in the dark will not reduce anything. A trillionth of a second after absorbing a red photon, the same molecule is one of the more powerful reducing agents in biology. What has changed inside it?',
    options: [
      { text: 'One electron has moved into an orbital further out, where the nuclei hold it less tightly, so it takes far less to pull that electron away.', correct: true },
      { text: 'The whole molecule has become hotter, and a hotter molecule holds all of its electrons less tightly than a cold one does.',
        why: 'The vague picture of "energised" the section warns against: excitation as a general warming. Nothing else in the molecule has changed. One electron has been moved, and the effect is entirely about how tightly that one is now held.' },
      { text: 'The photon\'s energy has been stored in one of the ring\'s chemical bonds, and breaking that bond is what then sets the excited electron free.',
        why: 'Carries the idea of energy stored in bonds into a place where no bond is involved. No bond is made or broken by the absorption; an electron changes orbital, and the energy is in where it now sits.' },
      { text: 'The photon has brought an extra electron into the molecule with it, and the molecule gives the spare one away to the first acceptor it meets.',
        why: 'Treats light as a carrier of charge. A photon carries energy and no charge, so the molecule has exactly the electrons it had; what differs is where one of them is sitting.' },
    ],
    explain: 'Absorbing a photon moves one electron from its usual orbital into one further out, where the molecule\'s nuclei hold it less tightly. That is all "excited" means. The molecule has moved a long way up Section\u00A05.8\'s ladder of how readily something gives an electron away, because an electron held loosely is one an acceptor can take. The state lasts a few billionths of a second, which makes it a deadline rather than a store: the electron has to be caught on the way back down, or the energy leaves as heat or as a redder photon.',
  },
  {
    id: 'i-excited-electron-2',
    objective: 'excited-electron',
    kind: 'free',
    question: 'Say what happens inside a molecule when it absorbs a photon, using Section\u00A02.1\'s picture of electrons at different distances from the nucleus. Explain why the same molecule then gives an electron away more readily than it did before, and why its excited state is better thought of as a deadline than as a store of energy.',
    rubric: [
      'an electron\'s distance from the nuclei is an energy: an electron further out is held less tightly, and moving between two levels costs exactly the difference (Section\u00A02.1)',
      'absorbing a photon moves one electron from a lower orbital into a higher one, further out\u00A0— and only if the photon\'s energy matches the gap between the two',
      'nothing else changes: no bond is made or broken, no charge is added, and the molecule has not been warmed in general',
      'an electron held less tightly takes less to remove, so the molecule has moved up the ladder of how readily something gives an electron away: a chlorophyll that reduces nothing in the dark is, excited, one of the more powerful reducing agents in biology',
      'the excited state lasts a few billionths of a second, and unless the electron or the excitation is passed on in that time the molecule falls back and the energy leaves as heat or as a redder photon',
      'so what absorption creates is a brief chance to hand an electron on, and the light reactions are built to take it',
    ],
    explain: 'The sentence to get right is that nothing has been "energised" in general. One electron has been put somewhere it will not stay, and everything the light reactions do is the business of catching it on the way back down.',
  },
  {
    id: 'i-excited-electron-3',
    objective: 'excited-electron',
    kind: 'mcq',
    question: 'Chlorophyll extracted into a solvent and lit glows a deep red. The same amount of chlorophyll in a healthy leaf, lit in the same way, gives off only a small fraction as much red light. What does the difference show about an excited chlorophyll?',
    options: [
      { text: 'With no acceptor near, the loosened electron soon falls back and much of the energy leaves as light; in a leaf most excitations are caught first.', correct: true },
      { text: 'A leaf\'s chlorophyll stores the energy of every photon it absorbs until the Calvin cycle calls for it, so none is left over to come back out as light.',
        why: 'Treats the excited state as a store. It lasts a few billionths of a second, far too short to wait for anything; what keeps a leaf dark is that the excitation is handed on inside that time, not that it is kept.' },
      { text: 'Extraction breaks chlorophyll\'s ring, and a damaged molecule gives its energy off as light instead of using it for chemistry.',
        why: 'Reads the glow as a sign of damage. Extracted chlorophyll is intact, which is why its absorption is measured that way, and an intact molecule excited with no acceptor nearby does exactly this: the electron falls back and, often, a photon comes out.' },
      { text: 'The glow is heat: the lit solution warms up, and warm things glow red, while a leaf gives its heat to the air around it and stays too cool to glow.',
        why: 'Takes the glow for the glow of a hot object, which needs several hundred degrees; the solution stays at room temperature. Each red photon is one excited electron falling back, which is why the glow stops the moment the lamp does.' },
    ],
    explain: 'Absorbing a photon moves one electron into an orbital further out, and it will not stay there: within a few billionths of a second it falls back unless it, or the excitation, is passed on. In a solvent nothing is close enough to pass it to, so much of the energy comes back out as fluorescence, a photon redder than the one absorbed. In a leaf the antenna hands the excitation on to a reaction centre, which gives the electron away, and only a small fraction escapes as light. The glow of the extract is the excited state\'s deadline, missed.',
  },

  {
    id: 'i-photosynthesis-equation-1',
    objective: 'photosynthesis-equation',
    kind: 'mcq',
    question: 'What are the sign and the size of the free energy change for 6 CO<sub>2</sub> + 6 H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub>, and what does that sign oblige a plant to do?',
    options: [
      { text: 'About −2870\u00A0kilojoules per mole of glucose: the reaction releases energy, and that release is how a plant gets its energy from making sugar.',
        why: 'Takes Section\u00A05.8\'s number without reversing the arrow. −2870 is the fall from glucose and oxygen to carbon dioxide and water; photosynthesis runs the other way and carries the opposite sign. A plant gets its energy by breaking sugar down, as every cell does.' },
      { text: 'About +2870\u00A0kilojoules per mole of glucose: it cannot run by itself, so something outside it must supply at least that\u00A0— the light.', correct: true },
      { text: 'About +2870\u00A0kilojoules per mole of glucose, which means it will run by itself once an enzyme has lowered the activation energy enough.',
        why: 'Confuses how fast with which way. An enzyme lowers the barrier in both directions by the same amount and cannot change the sign of ΔG, so a reaction with a positive ΔG needs energy supplied, however good the catalyst.' },
      { text: 'About zero overall, because the energy a plant stores in sugar is given back when the sugar is used, so the two cancel out.',
        why: 'True of the round trip and not of this reaction. Making the sugar and burning it are two reactions, and this one, taken alone, climbs 2870\u00A0kilojoules per mole; the climb has to be paid for when it happens, not balanced later.' },
    ],
    explain: 'Photosynthesis is Section\u00A05.8\'s oxidation of glucose with the arrow reversed, so its ΔG is the same size with the opposite sign: about +2870\u00A0kilojoules per mole. Section\u00A05.2 is categorical about a positive ΔG: the reaction does not happen by itself, and something has to supply the difference. The light is what pays, and everything else in the chapter is how it pays.',
  },
  {
    id: 'i-photosynthesis-equation-2',
    objective: 'photosynthesis-equation',
    kind: 'mcq',
    question: 'A bacterium living at a hydrothermal vent on the deep-sea floor builds sugar out of carbon dioxide in complete darkness. What must it be doing in place of photosynthesis?',
    options: [
      { text: 'Nothing extra: in the great heat around a vent, building sugar out of carbon dioxide becomes downhill and so runs by itself.',
        why: 'Heat cannot pay for an uphill reaction. Warmth speeds reactions in both directions and leaves the sign of ΔG where it was, so building sugar from carbon dioxide is as far uphill beside a vent as in a leaf.' },
      { text: 'Using the vent\'s own heat as its energy source, since the water pouring out of a vent is so much hotter than the dark sea around it.',
        why: 'A vent is hotter than the water around it, and an engine could in principle run across that difference; but a cell is a few micrometres across and all at one temperature, so it has no difference to work across. What vent bacteria spend is the vent\'s chemistry.' },
      { text: 'Letting the enormous pressure of the deep sea supply the energy, squeezing the carbon dioxide and water there together into sugar.',
        why: 'Pressure is not something a cell can spend: the water presses equally on every side of it and moves nothing along. Building sugar is uphill wherever it happens, and something has to pay; at a vent, it is chemistry.' },
      { text: 'Oxidising an inorganic chemical from the vent, such as hydrogen sulfide, and spending the energy released: chemistry pays where light would.', correct: true },
    ],
    explain: 'The sign of ΔG belongs to the reaction, not to the place. Building sugar out of carbon dioxide is uphill in a vent as in a leaf\u00A0— for a plant, taking its electrons from water, about 2870\u00A0kilojoules per mole of glucose\u00A0— and something outside the reaction must pay. Most autotrophs pay with light; a minority, at vents, in deep rock and in the nitrogen cycle, pay by oxidising an inorganic chemical, and owe the sun nothing.',
  },
  {
    id: 'i-photosynthesis-equation-3',
    objective: 'photosynthesis-equation',
    kind: 'free',
    question: 'Write the overall equation of photosynthesis in its usual form. Give the sign and the size of its free energy change, say where that number comes from, and say what the sign obliges a plant to supply. Then say why the number is so large, in terms of where the electrons end up.',
    rubric: [
      '6 CO<sub>2</sub> + 6 H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub>',
      'ΔG is about +2870\u00A0kilojoules per mole of glucose: Section\u00A05.8\'s −2870 for oxidising glucose, with the arrow and so the sign reversed',
      'a positive ΔG means the reaction does not run by itself, however long it waits and whatever enzymes are present',
      'so the plant must supply at least 2870\u00A0kilojoules per mole of glucose from outside the reaction; the light is what pays',
      'the size comes from electronegativity: the reaction pulls electrons away from oxygen, which holds them hardest of the common elements, and puts them on carbon, which holds them loosely',
      'a fuel is a fuel because its carbons are bonded mostly to hydrogen with the whole fall to oxygen still ahead of them, and photosynthesis is that fall taken backwards',
    ],
    explain: 'The chapter\'s whole logic is in the second and fourth points: the sign says the reaction must be paid for, and the light is the payment. Everything after Section\u00A06.1 is mechanism.',
  },

  {
    id: 'i-oxygen-source-1',
    objective: 'oxygen-source',
    kind: 'mcq',
    question: 'In 1941 algae were grown in water whose oxygen was the heavy isotope <sup>18</sup>O, with ordinary carbon dioxide, and the label came out in the oxygen gas they released. What had the older idea\u00A0— that a plant splits carbon dioxide and releases its oxygen\u00A0— predicted for this experiment?',
    options: [
      { text: 'The same result, since the label was in the water either way; the experiment could not tell the two ideas apart, which is why it was criticised.',
        why: 'Knows the result was criticised but not what for. The two ideas predict opposite things, which is what makes the experiment worth doing. The criticism was that carbon dioxide and water swap oxygen atoms in solution, so the label could have reached the carbon dioxide before the plant touched it\u00A0— a doubt about the method, since settled by better-controlled repeats.' },
      { text: 'Labelled oxygen gas as well, but less of it, since on the older idea the plant would still take a little of its oxygen from the water too.',
        why: 'Splits the difference between the two ideas, as if each contributed some. The older idea put all of the released oxygen on the carbon dioxide, so it predicted none of the water\'s label in the gas; a compromise is a third hypothesis, and the measurement did not need one.' },
      { text: 'Unlabelled oxygen gas, with the water\'s <sup>18</sup>O going into the sugar instead; finding the label in the gas ruled the older idea out.', correct: true },
      { text: 'No oxygen gas at all, since on the older idea water is never split and so no oxygen could be released from it.',
        why: 'Both ideas have the plant giving off oxygen; they disagree only about which molecule it comes from. That is what makes a label the right tool: it tells apart two sources of the same gas.' },
    ],
    explain: 'On the older idea the gas came from carbon dioxide, so labelling the water should have left the gas unlabelled and put the <sup>18</sup>O into the sugar and the cell\'s other products. The label came out in the gas; labelling the carbon dioxide instead did not. The objection\u00A0— that carbon dioxide and water exchange oxygen atoms in solution\u00A0— was a fair one, and the conclusion has survived every better-controlled repetition since.',
  },
  {
    id: 'i-oxygen-source-2',
    objective: 'oxygen-source',
    kind: 'mcq',
    question: 'In 1937, four years before the isotope experiment, Robert Hill lit chloroplasts isolated from leaves in a solution of an iron salt that takes up electrons. They gave off oxygen, although no carbon dioxide was present and none was fixed. What does that observation, on its own, say about where the oxygen comes from?',
    options: [
      { text: 'That it cannot be coming from carbon dioxide, since there was none to split; the water, which was there, is the only candidate left.', correct: true },
      { text: 'That the iron salt supplied the oxygen, since apart from the chloroplasts and the water it was the only thing in the flask.',
        why: 'Mistakes the electron acceptor for the source. Making oxygen gas means taking electrons away from something; the iron salt is the thing receiving them, so it is being reduced and cannot be what the oxygen came from.' },
      { text: 'Nothing: chloroplasts taken out of a leaf are damaged, and a damaged chloroplast cannot be expected to behave as it would inside a leaf.',
        why: 'Dismisses the evidence rather than reading it. Damage can stop an experiment from doing something; it cannot make oxygen appear from a source that is not there. Separating the two halves of photosynthesis this way is, if anything, the result\'s strength.' },
      { text: 'That the light released oxygen already dissolved in and around the chloroplasts, rather than making any new oxygen at all.',
        why: 'A store would run out, and it would not need anything to take electrons. The chloroplasts gave off oxygen only while there was an acceptor present\u00A0— no acceptor, no oxygen\u00A0— so the gas was being made, as electrons were taken from something.' },
    ],
    explain: 'No carbon dioxide, no carbon fixed, and oxygen anyway: whatever the gas came from, it was not carbon dioxide. Hill\'s experiment also separated the two halves of photosynthesis for the first time\u00A0— the light could take electrons from water and hand them to any acceptor that would take them, without the carbon reactions running at all\u00A0— and it pointed the same way as van Niel\'s argument, years before the heavy-oxygen label settled it.',
  },
  {
    id: 'i-oxygen-source-3',
    objective: 'oxygen-source',
    kind: 'free',
    question: 'Say which reactant the oxygen a plant releases comes from. Give van Niel\'s argument from sulfur bacteria, describe the 1941 experiment that tested it and what the older idea predicted, and say why the result was criticised and why it stands.',
    rubric: [
      'the oxygen comes from water, not from carbon dioxide',
      'van Niel\'s purple sulfur bacteria photosynthesise with hydrogen sulfide where a plant uses water, and deposit sulfur instead of giving off oxygen',
      'if both are the same chemistry, the general form is "take hydrogen from something and use it to reduce carbon dioxide", and the leftover is whatever the hydrogen came from: sulfur for the bacteria, so oxygen from water for a plant',
      'in 1941 algae were grown with water labelled with the heavy isotope <sup>18</sup>O; the label came out in the oxygen gas, and labelling the carbon dioxide instead did not',
      'if the plant split carbon dioxide, labelling the water would have left the gas unlabelled',
      'it was criticised because carbon dioxide and water exchange oxygen atoms in solution, so the label could move before the plant touched it; better-controlled repetitions have all found the same',
      'so the honest equation has twelve waters in and six out: 6 CO<sub>2</sub> + 12 H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> + 6 H<sub>2</sub>O',
    ],
    explain: 'The order is the point: van Niel\'s argument made a prediction, the label tested it, and the objection to the test was a real one that later work answered. Water is both the source of the electrons and a product of the reaction that uses them, which is why the honest equation has water on both sides.',
  },

  // ============================================================================
  // 6.2 A compartment inside a compartment
  // ============================================================================

  {
    id: 'i-chloroplast-compartments-1',
    objective: 'chloroplast-compartments',
    kind: 'mcq',
    question: 'Counting from the outside in, which list gives a chloroplast\'s three membranes, each with the watery space inside it?',
    options: [
      { text: 'Outer envelope, around the intermembrane space; inner envelope, around the stroma; and the thylakoid membrane, folded out of the inner envelope so that its inside opens into the intermembrane space.',
        why: 'Draws the chloroplast as a mitochondrion, whose cristae are folds of the inner membrane. The thylakoids are a third membrane system suspended in the stroma and not joined to the envelope at all, which is exactly why their inside can be a separate compartment.' },
      { text: 'Outer envelope, around the thin intermembrane space; inner envelope, around the stroma; and the thylakoid membrane, suspended in the stroma, around one connected lumen.', correct: true },
      { text: 'Outer envelope, around the intermembrane space; inner envelope, around the lumen; and the thylakoid membrane, around the stroma held inside each of its flattened sacs.',
        why: 'Swaps the two names that matter most. The stroma is the fluid around the thylakoids; the lumen is the space inside them. Section\u00A06.5 puts protons into the lumen and ATP into the stroma, so reading the two the wrong way round turns the whole machine inside out.' },
      { text: 'Outer envelope, around the intermembrane space; inner envelope, around the stroma; and the thylakoid membrane, around several hundred separate lumens, one sealed inside each sac.',
        why: 'Reads what a cross-section shows. A slice through a granum looks like a pile of separate discs, but the stacks are joined by unstacked sheets, and as far as anyone has traced it the lumen of a whole chloroplast is one connected space.' },
    ],
    explain: 'Three membranes, three watery spaces: the outer envelope and the intermembrane space; the inner envelope and the stroma; and, suspended in the stroma and not joined to the envelope, the thylakoid membrane around the lumen. The thylakoids are stacked into grana and the grana joined by unstacked sheets, so the lumen they enclose is one connected volume\u00A0— which is what lets Section\u00A06.5 charge it as a single compartment.',
  },
  {
    id: 'i-chloroplast-compartments-2',
    objective: 'chloroplast-compartments',
    kind: 'free',
    question: 'Name a chloroplast\'s three membranes and the three watery spaces they separate, from the outside in. Say which of the spaces is one connected volume, and why a slice through a granum suggests the opposite.',
    rubric: [
      'the outer and inner envelope membranes, with the thin intermembrane space between them',
      'inside the inner membrane, the stroma: the fluid holding the Calvin cycle\'s enzymes, the chloroplast\'s DNA and ribosomes, and grains of starch',
      'suspended in the stroma and not joined to the envelope, the thylakoid membrane, whose inside is the lumen',
      'the thylakoids are flattened sacs stacked into grana, and the grana are joined to one another by unstacked sheets',
      'so the lumen of the whole chloroplast is one connected volume, not hundreds of separate bubbles',
      'a slice through a granum shows what look like separate discs; only following the membrane in three dimensions shows that the sacs connect',
    ],
    explain: 'The count is not bookkeeping. A single sealed lumen is what lets one proton gradient be charged across a whole chloroplast: protons released in the stacks, where photosystem\u00a0II sits, reach the ATP synthase out on the unstacked sheets through the same connected space.',
  },
  {
    id: 'i-chloroplast-compartments-3',
    objective: 'chloroplast-compartments',
    kind: 'mcq',
    question: 'Water is split on the lumen side of photosystem\u00a0II. An oxygen molecule made there leaves the chloroplast for the cytosol around it. Which spaces does it pass through on the way, and how many membranes does it cross?',
    options: [
      { text: 'The stroma and then the intermembrane space: two membranes, the inner and the outer envelope, since the inside of a thylakoid is part of the stroma.',
        why: 'Treats the thylakoid as a sheet lying in the stroma rather than a sealed sac. The lumen is a space of its own, closed off by the thylakoid membrane, which is what lets it hold protons the stroma does not have.' },
      { text: 'The intermembrane space only: one membrane, the outer envelope\'s, since the thylakoids are folds of the inner envelope and open into the space between the two.',
        why: 'Draws the chloroplast as a mitochondrion whose inner membrane folds inwards. The thylakoids are a third membrane system, suspended in the stroma and joined to neither envelope, so the lumen opens into nothing.' },
      { text: 'None: the thylakoid is a sealed compartment, so oxygen made inside it is trapped in the lumen and never reaches the rest of the cell.',
        why: 'Takes "sealed" to mean sealed against everything. A bilayer holds back ions such as protons, but small uncharged molecules such as oxygen cross it freely (Section\u00A04.3), which is how every oxygen molecule a leaf releases got out.' },
      { text: 'Lumen, then stroma, then intermembrane space: three membranes\u00A0— the thylakoid\'s, the inner envelope\'s and the outer envelope\'s.', correct: true },
    ],
    explain: 'The oxygen is made in the lumen, inside the thylakoid membrane. From there it crosses that membrane into the stroma, the inner envelope into the thin intermembrane space, and the outer envelope into the cytosol: three membranes, and a space between each pair. Being small and uncharged, it crosses each bilayer without help, which is why the seal that holds the lumen\'s protons does not hold its oxygen.',
  },

  {
    id: 'i-thylakoid-is-closed-1',
    objective: 'thylakoid-is-closed',
    kind: 'mcq',
    question: 'A mild detergent punches small holes in thylakoid membranes without harming any protein in them. The thylakoids are then lit in a solution containing NADP<sup>+</sup>, ADP and phosphate. What happens?',
    options: [
      { text: 'Nothing at all: the light reactions need an intact membrane in order to work, so the electrons stop moving and no oxygen, NADPH or ATP is made.',
        why: 'Thinks the seal is needed by the machinery. Every protein in the chain is still in place, and none of them needs a closed compartment to pass an electron on. The chapter\'s open sheet would run every reaction of Section\u00A06.4 and produce no ATP: the seal is the store, not the machine.' },
      { text: 'ATP is still made, only more slowly, because protons can now reach ATP synthase from both sides of the membrane at once.',
        why: 'Thinks protons arriving at the synthase are what drive it. It is driven by a difference across the membrane, and a hole lets the difference vanish; protons at the same concentration on both sides turn nothing, in either direction.' },
      { text: 'Electrons still flow from water to NADP<sup>+</sup>, at least as fast as before, making oxygen and NADPH\u00A0— but no ATP, since the protons leak straight back.', correct: true },
      { text: 'The electrons stop moving, because the protons leaking out of the lumen raise its pH, and at a higher pH the photosystems switch off.',
        why: 'Gets the effect on the chain backwards. A gradient pushes back against the chain that builds it; a leak removes the back-pressure, so electrons flow faster, not slower\u00A0— the pattern Section\u00A06.5 gives for a molecule that carries protons across the membrane.' },
    ],
    explain: 'The gradient is the only link between the electron chain and ATP synthase, and a gradient needs a closed compartment to be held in. Punch holes in the membrane and the chain runs on\u00A0— faster, with nothing pushing back\u00A0— making oxygen and NADPH as before, while the protons it pumps leak back through the holes instead of through the synthase, and the energy leaves as heat.',
  },
  {
    id: 'i-thylakoid-is-closed-2',
    objective: 'thylakoid-is-closed',
    kind: 'free',
    question: 'Section\u00A06.2 says "the seal is the store". Explain what that means, using Section\u00A04.1\'s reason a bilayer closes into a bag and Section\u00A04.7\'s reason a difference across a membrane is worth something. Then say what a sheet of thylakoid membrane carrying every protein of the light reactions, but open rather than sealed, would and would not produce.',
    rubric: [
      'Section\u00A04.1: an exposed edge is the one thing a bilayer cannot tolerate, so a sheet seals itself into a closed bag\u00A0— which is what lets a thylakoid have an inside at all',
      'Section\u00A04.7: a difference held across a membrane is stored energy, because work went into making it and can be had back by letting it run down',
      'the light reactions bank what they capture as a difference in proton concentration between the lumen and the stroma',
      'the lumen can hold protons at a concentration the stroma does not have only because it is closed',
      'the open sheet would still pass electrons from water to NADP<sup>+</sup>, release oxygen and make NADPH',
      'it would make no ATP, because there would be nowhere for protons to build up, and ATP synthase is driven only by a difference across the membrane',
    ],
    explain: 'The two earlier sections were written for other membranes, and here they combine into one sentence: a bilayer can be a bag, and a bag can hold a difference. Put those together and the thylakoid stops being a shape and becomes a machine.',
  },
  {
    id: 'i-thylakoid-is-closed-3',
    objective: 'thylakoid-is-closed',
    kind: 'free',
    question: 'Isolated thylakoids are lit for a minute with an electron acceptor but no ADP present, so no ATP can be made. The light is switched off, and a few seconds later ADP and phosphate are added, still in the dark. Predict whether any ATP is made, and explain why. Then say what a longer wait before adding the ADP would do, and how the result would differ for thylakoids whose membranes had been made slightly leaky.',
    rubric: [
      'yes: some ATP is made in the dark, although the light has gone',
      'in the light, protons were pumped into the lumen, and because the thylakoid is a sealed sac they stayed there, leaving the lumen more acidic than the outside',
      'with no ADP the synthase could not spend the difference, so it was held: the seal is the store',
      'when ADP and phosphate arrive, protons fall back through the synthase, which makes ATP until the difference is spent',
      'the longer the wait, the less ATP, because even a sealed membrane lets protons back slowly and the difference runs down on its own',
      'a leakier membrane loses the difference faster, so the same wait yields less ATP, and a membrane leaky enough yields none: an open sheet can store nothing',
    ],
    explain: 'The light charges the lumen; the dark shows how long the charge is kept. Nothing in the flask remembers the light except a difference in proton concentration held by a closed membrane, and the ATP made in the dark is that difference being spent. How long it lasts is set by how tight the membrane is\u00A0— which is why a thylakoid has to be sealed, and why a leak stops the ATP without stopping the light reactions.',
  },

  {
    id: 'i-division-of-labour-1',
    objective: 'division-of-labour',
    kind: 'mcq',
    question: 'Which pair crosses from the thylakoid membrane to the stroma while a chloroplast is working, and what goes back the other way?',
    options: [
      { text: 'Oxygen and sugar go to the stroma; carbon dioxide and water come back to the membrane in exchange.',
        why: 'Maps the overall equation onto the two halves. Oxygen leaves the chloroplast as waste, and sugar is made in the stroma; what the membrane hands the stroma is energy and electrons, packed as ATP and NADPH.' },
      { text: 'Loose electrons and protons go to the stroma; the stroma sends water back to be split again.',
        why: 'Electrons and protons do not travel loose through the stroma: the electrons travel on NADPH, and the proton gradient stays across the membrane. Water is split on the lumen side and is not sent anywhere by the stroma.' },
      { text: 'ATP and NADPH go to the stroma, and the spent carriers wait there until night, when they return to be recharged.',
        why: 'Imagines the two halves taking turns. ATP and NADPH do not keep, so they are made and spent continuously, and the spent forms return as fast as the fresh ones leave\u00A0— one reason the two halves are only a few tens of nanometres apart.' },
      { text: 'ATP and NADPH go to the stroma; ADP and phosphate and NADP<sup>+</sup> come back to be charged again.', correct: true },
    ],
    explain: 'The light reactions on the membrane make ATP and NADPH; the carbon reactions in the stroma spend them; the spent forms go back. Nothing else needs to move, and nothing the two halves make leaves the chloroplast\u00A0— except the oxygen, which is waste\u00A0— until there is sugar to export.',
  },
  {
    id: 'i-division-of-labour-2',
    objective: 'division-of-labour',
    kind: 'mcq',
    question: 'Why are the light reactions on the thylakoid membrane and the carbon reactions in the stroma, rather than the other way round?',
    options: [
      { text: 'Pigments must be anchored in a membrane and protons held in a sealed space; the carbon reactions are soluble enzymes, and the stroma has room for them.', correct: true },
      { text: 'The membrane is where the light is, while the stacks shade the stroma, so only reactions that need no light can run there.',
        why: 'Reads "dark reactions" as reactions happening in the dark part of the organelle. A chloroplast is a few micrometres across and lit all through; the membrane holds the light reactions because pigments must be anchored and protons stored, not because it is better lit.' },
      { text: 'The carbon reactions must be kept well away from the membrane, because the oxygen released there would attack and destroy the sugar being built.',
        why: 'Oxygen crosses every membrane freely and fills the whole chloroplast, which is why rubisco meets it in Section\u00A06.7. The two halves are placed by what each needs, not kept apart for safety.' },
      { text: 'The arrangement is only an accident of history, inherited from the cyanobacterium that the chloroplast came from, and it could as well have been reversed.',
        why: 'Right that it is inherited, wrong that it is arbitrary. Reversed, the pigments would have nothing to hold them in place and the protons nowhere to be stored.' },
    ],
    explain: 'The division of labour follows from what each half is. The light reactions are pigments and electron carriers that must be held in order, and a gradient that must be held across something sealed: that is a membrane. The carbon reactions are soluble enzymes in bulk, beside the chloroplast\'s own ribosomes: that is the stroma.',
  },
  {
    id: 'i-division-of-labour-3',
    objective: 'division-of-labour',
    kind: 'free',
    question: 'Say which half of photosynthesis happens on the thylakoid membrane and which in the stroma, and why each is where it is. Name what crosses from the membrane to the stroma, what comes back, and what does not need to move at all.',
    rubric: [
      'the light reactions are on the thylakoid membrane: that is where the pigments are anchored and where a proton gradient can be held',
      'the carbon reactions\u00A0— the Calvin cycle\u00A0— are in the stroma, where there is room and where the soluble enzymes and the chloroplast\'s own ribosomes are',
      'ATP and NADPH cross from the membrane to the stroma',
      'the spent forms, ADP with phosphate and NADP<sup>+</sup>, go back to be charged again',
      'neither ATP nor NADPH keeps, so they are made and spent continuously, a few tens of nanometres apart',
      'nothing else needs to move, and nothing the two halves make leaves the chloroplast\u00A0— except the oxygen, which is waste\u00A0— until there is sugar to export',
    ],
    explain: 'Stated this way the two halves look like two departments; they are closer to the two ends of one belt. The membrane cannot keep making NADPH unless NADP<sup>+</sup> comes back, and the stroma cannot keep fixing carbon unless ATP and NADPH keep arriving.',
  },

  {
    id: 'i-leaf-gas-exchange-1',
    objective: 'leaf-gas-exchange',
    kind: 'mcq',
    question: 'Which is the route a carbon dioxide molecule takes from the air outside a leaf to the stroma of a chloroplast in a mesophyll cell?',
    options: [
      { text: 'Straight through the leaf\'s waxy skin, which carbon dioxide crosses by simple diffusion because it is a small, uncharged molecule, much like oxygen is.',
        why: 'Applies Section\u00A04.3\'s rule for a lipid bilayer to the leaf\'s waxy skin, which is not a bilayer but a thick layer built to keep water in, and it stops gases as well. Almost nothing crosses it, which is why a leaf needs pores.' },
      { text: 'Dissolved in the water drawn up from the roots, which carries it along the veins to every cell in the leaf.',
        why: 'The root route is how a leaf gets its water and minerals; the carbon a plant is built from comes almost entirely from the air, through its leaves. Carbon dioxide carried in water over a leaf\'s distances would also be far too slow.' },
      { text: 'Through an open stoma, then as a gas through the air spaces between the mesophyll cells, dissolving only at a wet cell surface beside the chloroplast.', correct: true },
      { text: 'Through an open stoma, and then dissolved in the watery sap that fills the inside of the leaf, diffusing through that liquid until it reaches each cell.',
        why: 'Fills the leaf with water. The mesophyll is loosely packed with air spaces, so carbon dioxide travels as a gas almost all the way; by Section\u00A03.2\'s square law, diffusing dissolved across half a leaf, about 150\u00A0µm, would take thousands of times longer than the micrometre or two it actually crosses in water.' },
    ],
    explain: 'A leaf is thin, full of air spaces and wet inside, and each of those is part of the route. The carbon dioxide comes in through a stoma, travels as a gas through the air spaces to within a micrometre or two of every chloroplast, dissolves at a wet cell surface, and crosses a wall, the membranes and the stroma. Diffusion time grows as the square of the distance, so the dissolved part of the trip has to be as short as possible.',
  },
  {
    id: 'i-leaf-gas-exchange-2',
    objective: 'leaf-gas-exchange',
    kind: 'mcq',
    question: 'On a warm, dry afternoon a sunflower leaf with its stomata open loses water vapour hundreds of times faster than it takes in carbon dioxide. Why so lopsided?',
    options: [
      { text: 'Water molecules are smaller and lighter than carbon dioxide molecules, so they slip through the same open pores many times faster.',
        why: 'Water vapour does diffuse a little faster than carbon dioxide\u00A0— about one and a half times\u00A0— but that cannot make hundreds. The pore is the same for both, so the difference between the two flows has to come from the difference between what drives them.' },
      { text: 'The same pores let one gas out and the other in, and the difference driving water out\u00A0— saturated inside, dry outside\u00A0— dwarfs carbon dioxide\'s.', correct: true },
      { text: 'The leaf is actively pumping water out to cool itself in the afternoon heat, and lets carbon dioxide in only when the pumping pauses.',
        why: 'Nothing pumps it. Water vapour leaves by diffusion, down the difference between a wet interior and drier air, whenever the pore is open. The leaf is cooled by the loss, but it is not spending energy to lose water.' },
      { text: 'Most of the water is used up inside the leaf by photosynthesis itself, while carbon dioxide is used only slowly, so much less of it needs to come in.',
        why: 'Photosynthesis consumes a tiny fraction of the water a plant moves\u00A0— a molecule or two for every carbon fixed, against hundreds lost as vapour through the pores. Almost all of it goes straight out.' },
    ],
    explain: 'Section\u00A04.3\'s rule for a flow across a barrier\u00A0— the difference times the area, divided by the thickness\u00A0— applies to both gases in the same pore. The area and the thickness are shared, so the ratio of the two flows is roughly the ratio of the two differences: inside the leaf the air is saturated with water vapour and outside it rarely is, while carbon dioxide is 0.042\u00A0per\u00A0cent of the air and the leaf can draw it down only so far. The pore cannot tell the two gases apart, which is why a plant loses of the order of five hundred grams of water for every gram of dry matter it makes.',
  },
  {
    id: 'i-leaf-gas-exchange-3',
    objective: 'leaf-gas-exchange',
    kind: 'free',
    question: 'Trace a carbon dioxide molecule from the air outside a leaf to the stroma of one of its chloroplasts, saying where it travels as a gas and where dissolved, and why the leaf is built that way. Then say what the leaf loses by opening the route, and why it cannot avoid losing it.',
    rubric: [
      'it enters through an open stoma, a pore made by two guard cells, because the waxy skin elsewhere lets almost nothing through',
      'it travels as a gas through the air spaces between the loosely packed mesophyll cells, getting within a micrometre or two of every chloroplast',
      'it dissolves only at the end, at a cell\'s wet surface, and crosses the wall and the membranes into the stroma',
      'the leaf is thin and full of air spaces because of Section\u00A03.2\'s square law: diffusion time grows as the square of the distance, so the slow, dissolved part of the trip must be as short as possible',
      'the inner surfaces must be wet for the gas to dissolve at them, so the air inside the leaf is saturated with water vapour',
      'whenever the pore is open, water vapour leaves by the same route, down a far larger difference than carbon dioxide comes in by: transpiration, of the order of five hundred grams of water for every gram of dry matter',
      'the pore cannot let one gas in and keep the other back',
    ],
    explain: 'The trace and the loss are the same fact seen from two ends. Everything that makes the route good for carbon dioxide\u00A0— an open pore, a wet interior, air spaces running right through\u00A0— makes it good for water vapour too, and water vapour has far the steeper slope to run down.',
  },

  // ============================================================================
  // 6.3 Green is the part a leaf uses least
  // ============================================================================

  {
    id: 'i-chlorophyll-structure-1',
    objective: 'chlorophyll-structure',
    kind: 'mcq',
    question: 'Suppose a chemist cuts the hydrocarbon tail off a chlorophyll molecule and leaves everything else as it was. What does the tailless molecule keep, and what does it lose?',
    options: [
      { text: 'It loses its colour, because the long hydrocarbon tail is the part of the molecule that actually absorbs the red and blue light.',
        why: 'Gives the light-absorbing job to the most conspicuous part. The tail is a saturated hydrocarbon with no alternating bonds, and like most molecules in a cell it absorbs no visible light; the colour belongs to the ring.' },
      { text: 'It loses its magnesium ion, which the tail holds at the centre of the molecule by wrapping round the ring.',
        why: 'The magnesium is gripped by the four nitrogen atoms of the ring itself. The tail trails off to one side and holds nothing but the molecule\'s place in the membrane.' },
      { text: 'Nothing that matters, since the tail does no chemistry: the molecule will go on catching light and working in the leaf exactly as before.',
        why: 'Reads "does no chemistry" as "does nothing". The tail\'s job is physical: it is Section\u00A04.1\'s hydrophobic anchor, holding the molecule in the oily middle of the thylakoid membrane with its ring at the surface, rather than drifting in the stroma where it would be useless.' },
      { text: 'It keeps its colour, since the ring of alternating bonds is untouched, but it loses its anchor in the oily middle of the membrane.', correct: true },
    ],
    explain: 'The ring and the tail do separate jobs, and cutting one away shows it. The colour is the ring\'s run of alternating single and double bonds, which the tail has no part in, so the tailless molecule still absorbs red and blue light much as before. What it has lost is twenty carbons of hydrocarbon\u00A0— the hydrophobic anchor that holds chlorophyll in the membrane with the ring at the surface.',
  },
  {
    id: 'i-chlorophyll-structure-2',
    objective: 'chlorophyll-structure',
    kind: 'mcq',
    question: 'Which describes the metal ion at the centre of a chlorophyll molecule, and what holds it there?',
    options: [
      { text: 'A magnesium ion, gripped at the centre of the flat ring by four nitrogen atoms\u00A0— as haem holds its iron, with a different metal.', correct: true },
      { text: 'A magnesium ion at the far end of the long hydrocarbon tail, where its charge anchors the whole molecule firmly in the thylakoid membrane.',
        why: 'Gives the metal the tail\'s job. The anchoring is done by twenty carbons of hydrocarbon, which is Section\u00A04.1\'s hydrophobic effect; a charged ion is the last thing that would sit comfortably in the oily middle of a membrane.' },
      { text: 'A magnesium ion loosely bound at the edge of the ring, and released into the stroma whenever the light comes on and the ring is excited.',
        why: 'Borrows the magnesium of Section\u00A06.6, where free magnesium ions move from the lumen into the stroma when the light comes on. That is a different pool entirely; chlorophyll\'s own magnesium stays gripped at the centre of its ring.' },
      { text: 'An iron ion, held by the ring\'s four nitrogen atoms exactly as it is in haem, since the two rings belong to the same chemical family.',
        why: 'Takes a shared ring for a shared metal. The ring family is the same and the metal is not: haem holds iron, chlorophyll magnesium, and the chapter reads the shared ring as a sign of how old these molecules are.' },
    ],
    explain: 'A flat ring, a magnesium ion held at its centre by four nitrogen atoms, and a long hydrocarbon tail. The same family of ring, with a different metal in the middle, is the haem that carries oxygen in blood and the cytochromes that pass electrons in every cell, which is one of the better hints that these molecules are very old.',
  },
  {
    id: 'i-chlorophyll-structure-3',
    objective: 'chlorophyll-structure',
    kind: 'free',
    question: 'Describe a chlorophyll molecule\'s three parts\u00A0— the ring, the magnesium ion and the tail\u00A0— and say where each sits when the molecule is in a thylakoid membrane. Say what the ring and the tail are each for, and what the ring\'s resemblance to haem suggests.',
    rubric: [
      'a flat ring, around which runs an alternating sequence of single and double bonds',
      'the alternating bonds are the part that absorbs light',
      'a magnesium ion held at the centre of the ring by four nitrogen atoms',
      'a hydrocarbon tail twenty carbons long, which does no chemistry: it is a hydrophobic anchor',
      'in the membrane the tail sits in the oily core and the ring at the surface, so the molecule is held in place rather than drifting in the stroma, where it would be useless',
      'the same family of ring, with a different metal at its centre, is the haem of blood and the cytochromes of every cell\u00A0— a hint that these molecules are very old',
    ],
    explain: 'The ring catches light because of its bonds, and the tail holds the ring where the light reactions are because of Section\u00A04.1\'s hydrophobic effect. Section\u00A06.3 adds that two molecules of chlorophyll a, identical in every part, absorb at 680 and 700\u00A0nm and behave quite differently in the two reaction centres, because of the protein holding each one.',
  },

  {
    id: 'i-why-pigments-absorb-1',
    objective: 'why-pigments-absorb',
    kind: 'mcq',
    question: 'Chains of alternating single and double carbon–carbon bonds absorb light at longer wavelengths the longer they are: two double bonds absorb at 217\u00A0nm, three at 258\u00A0nm, and eleven\u00A0— β-\u2060carotene, the pigment of carrots\u00A0— at about 450\u00A0nm, in the blue. What explains the trend?',
    options: [
      { text: 'A longer chain holds more electrons, so it has more energy to take in, and it can absorb more energetic, longer-wavelength light.',
        why: 'Gets the direction backwards: the longer chains absorb less energetic light, not more, since 450\u00A0nm carries less than 217. What matters is the size of one step for one electron, not how many electrons there are.' },
      { text: 'Electrons spread along the whole run, and the more room they have the smaller the step: so the longer the run, the smaller the gap and the longer the wavelength.', correct: true },
      { text: 'A longer chain is a bigger target for light, so it catches photons over a wider range of colours than a short one, reaching into the visible.',
        why: 'Confuses how likely a molecule is to catch a photon with which photons it can catch. A molecule absorbs only a photon whose energy matches a gap it has; a bigger molecule with the same gap would absorb the same colour more strongly, not a different one.' },
      { text: 'Each double bond absorbs a little ultraviolet on its own, and eleven of them together add up to enough absorption to stretch into the visible, where one would not.',
        why: 'Treats the bonds as separate absorbers whose effects add. They are not separate\u00A0— the electrons are shared along the whole run\u00A0— and more absorbers of the same kind would absorb more strongly at the same wavelength, never at a longer one.' },
    ],
    explain: 'In an ordinary bond a shared pair belongs to two atoms and the step to the next level is large, so only an ultraviolet photon can cross it\u00A0— which is why most of a cell is colourless. In a long alternating run the electrons spread along the whole system, and the more room they have the smaller the step becomes. Two double bonds absorb in the far ultraviolet; eleven bring the gap down to the size of a blue photon, and β-\u2060carotene, absorbing blue, looks orange. Chlorophyll\'s ring is the same trick, closed into a ring.',
  },
  {
    id: 'i-why-pigments-absorb-2',
    objective: 'why-pigments-absorb',
    kind: 'mcq',
    question: 'Glucose is colourless and chlorophyll is green. What is the difference between them that decides it?',
    options: [
      { text: 'Glucose absorbs every visible colour equally, and a substance that absorbs all the colours to the same degree looks colourless to the eye.',
        why: 'Absorbing every visible colour strongly makes a thing black, and weakly makes it grey. Colourless means absorbing almost none of the visible at all, which is the case for glucose.' },
      { text: 'Glucose has no metal ion at its centre, and it is the magnesium held at the heart of chlorophyll\'s ring that gives chlorophyll its colour.',
        why: 'Gives the colour to the metal. In chlorophyll the light is absorbed by the ring\'s long run of alternating bonds; the magnesium sits at the centre of that ring, but the colour belongs to the bonds.' },
      { text: 'Glucose\'s bonds are ordinary ones, with gaps only ultraviolet can span; chlorophyll\'s alternating bonds bring its gap into the visible.', correct: true },
      { text: 'Glucose is too small a molecule to absorb any visible light at all; only a molecule as big as chlorophyll is large enough to catch a photon.',
        why: 'Size is not what decides it: what decides it is whether electrons are spread over a long run of alternating bonds. Most of a cell\'s large molecules\u00A0— proteins, starch, DNA\u00A0— are as colourless as glucose, because their bonds are ordinary ones.' },
    ],
    explain: 'The colour a pigment absorbs is the size of the gap its electrons must cross, measured in energy. Ordinary bonds have gaps only an ultraviolet photon can span, so glucose lets all visible light through. Chlorophyll\'s ring of alternating bonds has gaps small enough for red and blue photons, and absorbs only weakly across the green, which is why green is what gets past it.',
  },
  {
    id: 'i-why-pigments-absorb-3',
    objective: 'why-pigments-absorb',
    kind: 'free',
    question: 'Explain why a ring of alternating single and double bonds absorbs visible light when almost nothing else in a cell does. Work out the size of the gap, in kilojoules per mole, that chlorophyll a\'s red absorption at 662\u00A0nm corresponds to, and say what would happen to the colour a pigment absorbs if its gap were larger.',
    rubric: [
      'an electron\'s distance from the nuclei is an energy, and moving between two levels costs exactly the difference (Section\u00A02.1)',
      'in an ordinary bond the shared pair belongs to two atoms and the step up is large, so only an ultraviolet photon can cross it, and most molecules in a cell are colourless',
      'in a long alternating run the electrons are not confined to one pair but spread over the whole system, and the more room they have the smaller the step, until a visible photon fits it',
      'a photon is absorbed only if its energy matches a gap, so the colour a pigment absorbs is the size of its gap, measured in energy',
      'at 662\u00A0nm the gap is 119 600 ÷ 662, about 181\u00A0kilojoules per mole',
      'a larger gap needs a more energetic photon, so the pigment would absorb at a shorter wavelength, towards the blue; a large enough gap puts the absorption in the ultraviolet and the molecule is colourless',
    ],
    explain: 'Chlorophyll is green for the same kind of reason a carbon–carbon bond is 350\u00A0kilojoules per mole: it is a number about electrons, and it happens to fall where it falls.',
  },

  {
    id: 'i-absorption-vs-action-1',
    objective: 'absorption-vs-action',
    kind: 'mcq',
    question: 'Some red algae have an action spectrum for photosynthesis with strong peaks between about 540 and 570\u00A0nm, in the green, where chlorophyll a absorbs very little. What is the best reading of that?',
    options: [
      { text: 'The algae\'s chlorophyll a absorbs green light after all, and the measurement made on chlorophyll in a solvent was wrong.',
        why: 'Knows that chlorophyll held in a membrane absorbs a little differently from chlorophyll in a solvent\u00A0— its peaks move by tens of nanometres\u00A0— but no shift of that size turns chlorophyll\'s deepest trough into its strongest peak. A peak where chlorophyll has none means a different absorber.' },
      { text: 'Green light is absorbed by the seawater around the algae and warms it, and the warmth speeds up their photosynthesis.',
        why: 'Brings heat back in by another door. Warming changes the rate of every reaction a little and could not produce peaks at particular wavelengths; and an action spectrum is built by changing only the wavelength, with everything else held the same.' },
      { text: 'An action spectrum records the light an organism sends back towards the eye, so a green peak simply means that the algae reflect a lot of green light.',
        why: 'Confuses an action spectrum with how a thing looks. An action spectrum measures what each wavelength makes the organism do\u00A0— here, how much oxygen it releases. A peak means that light drives photosynthesis, which it can only do if something absorbs it.' },
      { text: 'Another pigment catches the green and passes the energy to the photosystems: where action outruns chlorophyll\'s absorption, something else is absorbing.', correct: true },
    ],
    explain: 'Absorption is measured on a pigment, action on the living thing. Where the action spectrum rises above anything chlorophyll a can account for, another pigment is absorbing and passing the energy on\u00A0— the same gap-between-two-curves argument that first revealed the accessory pigments. It is also why these algae are red: their extra pigment absorbs the green that a plant\'s chlorophyll lets through, and what reaches the eye is what is left.',
  },
  {
    id: 'i-absorption-vs-action-2',
    objective: 'absorption-vs-action',
    kind: 'free',
    question: 'Say how an absorption spectrum and an action spectrum are each measured, and what each can and cannot tell you. Then interpret two mismatches between them: an alga whose action spectrum stays high at 500\u00A0nm, where its chlorophyll a barely absorbs; and a plant whose action spectrum falls away beyond 680\u00A0nm, although its chlorophyll still absorbs there.',
    rubric: [
      'an absorption spectrum is measured on the pigment, usually extracted into a solvent: how strongly it absorbs at each wavelength',
      'on its own it says nothing about whether the absorbed light drives anything',
      'an action spectrum is measured on the living organism: how well each wavelength drives the process\u00A0— for photosynthesis, usually how much oxygen is released, as Engelmann\'s bacteria measured it',
      'where the two match, the pigment is the one doing the work: Engelmann\'s action spectrum had the shape of chlorophyll\'s absorption',
      'action higher than chlorophyll a\'s absorption means another pigment is catching light there and passing the energy on\u00A0— an accessory pigment, such as a carotenoid in the blue-green',
      'absorption without matching action means light is caught but not used well: beyond 680\u00A0nm this is Emerson\'s red drop, one of the two measurements that showed there are two photosystems',
    ],
    explain: 'Neither curve means much alone. The absorption spectrum says what could be caught; the action spectrum says what was used; and the places they disagree are where the discoveries were\u00A0— the accessory pigments on one side, the second photosystem on the other.',
  },
  {
    id: 'i-absorption-vs-action-3',
    objective: 'absorption-vs-action',
    kind: 'mcq',
    question: 'A purple-leaved variety of basil holds anthocyanin, a pigment that absorbs green light strongly, dissolved in the vacuoles of its outer cells. Its leaves absorb more of the green than a green variety\'s do. Compared with the green variety, what would you expect its action spectrum to do in the green?',
    options: [
      { text: 'Rise in step with the absorption, since any light a leaf absorbs is light that it can use to drive photosynthesis.',
        why: 'Treats absorption and action as one curve. The gap between them is the point of measuring both: light drives photosynthesis only if its energy reaches a reaction centre, and absorbed light that never gets there counts on one curve and not the other.' },
      { text: 'Rise no higher, and probably fall: the anthocyanin catches green but cannot pass the energy to a photosystem, and it shades the chloroplasts beneath.', correct: true },
      { text: 'Rise, because anthocyanin is an accessory pigment like the carotenoids, passing whatever it catches on to chlorophyll.',
        why: 'Counts every coloured molecule in a leaf as part of the antenna. An accessory pigment hands its excitation on by resonance, which works only between molecules a few nanometres apart in the same membrane; anthocyanin is dissolved in the vacuole, nowhere near a thylakoid.' },
      { text: 'Stay exactly as it is in the green variety, because an action spectrum is measured on chlorophyll alone and ignores the leaf\'s other pigments.',
        why: 'Mixes up the two measurements. An absorption spectrum can be taken on a pigment alone; an action spectrum is always taken on the living leaf, as the oxygen it releases at each wavelength, so everything in the leaf, anthocyanin included, is in it.' },
    ],
    explain: 'An absorption spectrum says what a leaf catches; an action spectrum says what it uses. Anthocyanin sits in the vacuole, far from any thylakoid, so the green it catches is lost as heat and never reaches a reaction centre; and by catching it in the outer cells it takes green away from the chloroplasts beneath. The purple leaf absorbs more and does no more with it: absorption without action, for a reason that has nothing to do with the photosystems.',
  },

  {
    id: 'i-why-leaves-green-1',
    objective: 'why-leaves-green',
    kind: 'mcq',
    question: 'Chlorophyll extracted into a test tube lets much of the green light that reaches it pass straight through. Yet a whole leaf absorbs about three-quarters of the green that falls on it. How?',
    options: [
      { text: 'Light is scattered between the leaf\'s cells and air spaces, so each photon passes the pigments many times: even the green is mostly caught.', correct: true },
      { text: 'A leaf holds a green-absorbing pigment that is lost when chlorophyll is extracted, and this extra pigment is what catches the green.',
        why: 'Reaches for an extra pigment, which is the right instinct for a gap in an action spectrum and the wrong one here. A leaf\'s carotenoids absorb from about 400 to 500\u00A0nm, short of the green; the leaf catches more green because the same chlorophyll gets many more chances at each photon.' },
      { text: 'Chlorophyll bound in the leaf\'s membranes changes its shape and absorbs green light strongly, which it cannot do in a solvent.',
        why: 'The membrane does shift chlorophyll\'s peaks, by tens of nanometres, but it does not turn the green trough into a peak: green is still the band chlorophyll absorbs least, in a leaf as in a solvent.' },
      { text: 'The water inside the leaf absorbs the green light itself, which is why so little of the green that goes in comes out again.',
        why: 'Water barely absorbs visible light over the thickness of a leaf\u00A0— it is clear over far greater depths than a fraction of a millimetre\u00A0— so a leaf\'s water cannot account for three-quarters of the green.' },
    ],
    explain: 'A leaf is not a mirror and not a filter; it is a maze of wet walls and air spaces. Light bounces between them and passes the chlorophyll many times, and that lengthened path lets the leaf absorb about three-quarters of the green, against over nine-tenths of the blue and the red. What reaches the eye is the modest remainder, and it is green because green is where absorption is weakest\u00A0— a leftover, not a purpose.',
  },
  {
    id: 'i-why-leaves-green-2',
    objective: 'why-leaves-green',
    kind: 'free',
    question: 'Explain why a leaf looks green, in three steps: what a pigment\'s colour is, which band chlorophyll absorbs least, and what happens to green light inside a leaf. Then say what is wrong with "chlorophyll absorbs green" and with "a leaf reflects the green", and why an answer that begins "plants are green in order to" has the wrong shape.',
    rubric: [
      'a pigment\'s colour is the part of the light it fails to absorb\u00A0— what gets past it and reaches an eye',
      'chlorophyll absorbs blue and red strongly and has a deep trough across the green: green is the band it absorbs least',
      'so "chlorophyll absorbs green" is backwards',
      'a leaf is not a mirror: light entering it is scattered between cells and air spaces and passes the pigments many times, so a leaf absorbs about three-quarters of the green falling on it',
      'so "a leaf reflects the green" is wrong too: most of the green is caught, and what escapes is a modest remainder, green because that is where absorption is weakest',
      'the colour is a leftover, not a purpose: selection acted on what chlorophyll does with blue and red photons, and nothing was paid to catch the green that escapes',
      'why chlorophyll\'s gap falls where it does is still an open question',
    ],
    explain: 'The two wrong answers fail in different ways. "Chlorophyll absorbs green" reverses what a pigment\'s colour is. "A leaf reflects the green" has the definition right and the leaf wrong: it treats the leaf as a filter that lets the green straight out, when the leaf is a trap that catches most of it.',
  },
  {
    id: 'i-why-leaves-green-3',
    objective: 'why-leaves-green',
    kind: 'mcq',
    question: 'A grower lines a greenhouse with film that lets through only green light, reasoning that plants are green, so green must be the light that suits them. What will the plants do?',
    options: [
      { text: 'Grow faster than they would in white light of the same brightness, since chlorophyll is green because green is the light it absorbs and uses best.',
        why: 'Reverses what a pigment\'s colour is. Chlorophyll looks green because green is the band it absorbs least; the colour is the light that got away, not the light it uses.' },
      { text: 'Stop growing altogether, since a leaf reflects all of the green light that reaches it and absorbs none of it.',
        why: 'Treats the leaf as a mirror for green. A leaf absorbs about three-quarters of the green that falls on it, because light is scattered inside it and passes the chlorophyll many times, and green light drives photosynthesis\u00A0— less well per photon than red, but far from not at all.' },
      { text: 'Grow as well as in white light, because a leaf\'s colour has nothing to do with which light it can use.',
        why: 'Separates colour from absorption, when colour is absorption read backwards: the band a leaf looks is the band it catches least well. That was exactly the information the grower needed, and it points the other way.' },
      { text: 'Grow, but more slowly: the film shuts out the red and blue that chlorophyll absorbs best and lets in the band it absorbs least.', correct: true },
    ],
    explain: 'A leaf is green because green is what chlorophyll absorbs least, so a green film passes the one band the leaf is worst at and blocks the two it is best at. The plants will still grow\u00A0— a leaf catches about three-quarters of the green reaching it, because light is scattered inside and passes the pigments many times\u00A0— but more slowly than under clear glass. The grower\'s mistake is the shape of the reasoning: a leaf\'s colour is a leftover, the light not used, and nothing chose it.',
  },

  {
    id: 'i-antenna-and-protection-1',
    objective: 'antenna-and-protection',
    kind: 'mcq',
    question: 'A herbicide stops plants making carotenoids. Seedlings treated with it and grown in very dim light come up green; the same seedlings grown in bright light come up white. Why white?',
    options: [
      { text: 'Carotenoids are the raw material from which chlorophyll is built, so without them a growing seedling has nothing to make its chlorophyll from at all.',
        why: 'The seedlings in dim light are green, so they are making chlorophyll perfectly well. What the bright-light seedlings cannot do is keep it: it is destroyed faster than it is made.' },
      { text: 'Without carotenoids the leaves can no longer absorb blue-green light, and a leaf that lets blue-green through looks white.',
        why: 'A leaf that absorbed less blue-green would look more blue-green, not white. White means that almost no visible light is being absorbed at all\u00A0— which means the chlorophyll itself has gone.' },
      { text: 'Overloaded centres leave chlorophylls holding their energy, and with nothing to quench them, reactive oxygen forms and destroys the chlorophyll.', correct: true },
      { text: 'Bright light bleaches any pigment left out in it, the way sunlight fades a curtain, and the herbicide does nothing more than slow the seedlings\' growth.',
        why: 'Untreated seedlings stand in the same bright light and stay green. The difference is the carotenoids: they stand between an antenna catching more than the centres can use and its own destruction.' },
    ],
    explain: 'Four things can happen to an excited chlorophyll: pass the excitation on, hand its electron to an acceptor\u00A0— the one photosynthesis needs, and only a reaction centre can do it\u00A0— fluoresce, or fall back and release the energy as heat. When the centres are all busy and the light keeps coming, excitations have nowhere to go; a chlorophyll that holds its energy long enough can settle into a longer-lived state that hands it to oxygen, making a form of oxygen that attacks everything nearby. Carotenoids quench both. Take them away and bright light destroys the pigment catching it, while dim light, which never overloads the centres, does not.',
  },
  {
    id: 'i-antenna-and-protection-2',
    objective: 'antenna-and-protection',
    kind: 'free',
    question: 'A photosystem has a few hundred pigments and one reaction centre. Explain what the antenna is for, using how often a chlorophyll is struck by a photon and how often a reaction centre can work. Name the four things that can happen to an excited chlorophyll, say which one photosynthesis needs and which pigment can do it, and say what carotenoids do when the light outruns the chemistry.',
    rubric: [
      'even in full sunlight a single chlorophyll absorbs a photon only a few times a second\u00A0— ten at the most\u00A0— while a supplied reaction centre can work hundreds of times a second',
      'one pigment per centre would leave the centre idle almost all the time; a few hundred antenna pigments funnel excitations to it and keep it busy',
      'the antenna passes excitation inwards by resonance\u00A0— an excited state handed to a neighbour, with no electron moving\u00A0— and it reaches the centre well inside the excited state\'s deadline of a few billionths of a second',
      'the four exits: pass the excitation to a neighbour; hand the electron to an acceptor; fluoresce, giving off a photon at the red end of chlorophyll\'s spectrum whatever colour was absorbed, since a blue photon\'s surplus has already gone as heat; or fall back and release the energy as heat',
      'photosynthesis is the second, and only a reaction centre can do it',
      'when the centres are all busy, excited chlorophylls hold their energy, and some settle into a longer-lived state that can hand it to oxygen, making a reactive form that attacks the membrane',
      'carotenoids quench that longer-lived chlorophyll before it reaches oxygen, and the reactive oxygen if it forms anyway',
    ],
    explain: 'Emerson and Arnold\'s flashes give the size of the funnel: one oxygen per flash for about every 2500 chlorophylls, and eight photochemical events per oxygen, makes a few hundred pigments per centre\u00A0— which is what the structures later showed. The protection is the other face of the same design: a funnel that keeps a centre busy in dim light is a funnel that overfills it in bright light.',
  },
  {
    id: 'i-antenna-and-protection-3',
    objective: 'antenna-and-protection',
    kind: 'free',
    question: 'In bright light a leaf switches part of its antenna over to shedding energy as heat. The switch comes on within a minute of bright light but takes several minutes to go off again once the light drops. In 2016 tobacco plants were engineered to switch it off faster, and in field trials they grew about 15\u00A0per\u00A0cent more. Say which of the four exits of an excited chlorophyll the switch favours, why a leaf in full sun needs it, and what the leaf\'s carotenoids would face without it. Then explain why switching it off faster should pay in a field where clouds come and go.',
    rubric: [
      'the switch favours the heat exit: excitations the centres cannot use are shed as heat on purpose, instead of being handed to a reaction centre, the exit photosynthesis needs',
      'in full sun the antenna catches more than the reaction centres can process, and excitations with nowhere to go linger; a lingering chlorophyll can hand its energy to oxygen, making a reactive form that attacks the membrane',
      'without the switch far more excitations would linger, and the carotenoids would have far more of those chlorophylls and that reactive oxygen to quench, with the pigments themselves at risk',
      'the cost of the switch is light thrown away: while it is on, energy the centres could have used goes as heat',
      'when a cloud passes the light falls at once but the switch takes minutes to go off, so the leaf spends those minutes in dim light still shedding energy it now needs',
      'switching off faster shortens those minutes, and over a day of passing clouds they add up: a faster valve, not a bigger antenna or a better enzyme, gave the extra growth',
    ],
    explain: 'The heat exit is protection bought with light. In steady full sun it costs little, because the centres could not have used the extra; its cost comes on the way down, when a leaf that has just been shaded goes on shedding as heat the photons it now needs. The engineered plants had no bigger antenna and no better enzyme. They closed the valve sooner, and wasted less of the light they caught.',
  },

  // ============================================================================
  // 6.4 Two pushes, and water pays for both
  // ============================================================================

  {
    id: 'i-two-photosystems-1',
    objective: 'two-photosystems',
    kind: 'mcq',
    question: 'Green sulfur bacteria photosynthesise with a single photosystem. They take their electrons from hydrogen sulfide, which holds them at about −0.25\u00A0volts, and deliver them to NAD<sup>+</sup> at −0.32\u00A0volts. Why can they manage with one photosystem where a plant needs two?',
    options: [
      { text: 'Bacteria are simpler organisms than plants, and they never evolved the second photosystem that plants and their ancestors gained much later on.',
        why: 'Treats the second photosystem as an advance that simpler organisms lack. How many photosystems an organism needs is set by the job: cyanobacteria, which are bacteria too, have two, because they take their electrons from water.' },
      { text: 'Sulfide holds its electrons loosely, so their climb is under a tenth of a volt and one photon covers it easily; water\'s climb is 1.14\u00A0volts.', correct: true },
      { text: 'They release no oxygen, and releasing oxygen is the second photosystem\'s job, so they have no use for one.',
        why: 'Treats oxygen as what photosystem\u00a0II is for. Oxygen is what is left when electrons are taken from water, a waste product and not a purpose. What makes water need a second photosystem is how tightly it holds its electrons; take them from sulfide instead and the leftover is sulfur and the climb is small.' },
      { text: 'Their photosystem absorbs at a longer wavelength than a plant\'s does, and longer-wavelength photons carry enough energy for the whole climb at once.',
        why: 'Has the photon arithmetic backwards: a longer wavelength carries less energy per photon, not more. These bacteria manage with one photosystem in spite of weaker photons, because the climb they need is so small.' },
    ],
    explain: 'A single reaction centre would have to be, in the dark, a stronger oxidant than whatever it takes electrons from, and once excited, a stronger reductant than whatever it gives them to. From water at +0.82\u00A0volts to NADP<sup>+</sup> at −0.32 that span is 1.14\u00A0volts, against about 1.8 in a 680\u00A0nm photon\u00A0— little margin once every step\'s losses are paid, and no organism that splits water does it with one photosystem. From sulfide to NAD<sup>+</sup> the span is less than a tenth of a volt, and one photon covers it with room to spare.',
  },
  {
    id: 'i-two-photosystems-2',
    objective: 'two-photosystems',
    kind: 'free',
    question: 'Explain what a single photosystem would have to be able to do to move electrons from water to NADP<sup>+</sup> on its own, using the potentials of the two and the energy of a 680\u00A0nm photon, and why two are used instead. Then describe the red drop and the enhancement effect, and say why each points to two photosystems.',
    rubric: [
      'in the dark it would have to be a stronger oxidant than +0.82\u00A0volts, to pull electrons off water',
      'once excited it would have to be a stronger reductant than −0.32\u00A0volts, to give them to NADP<sup>+</sup>: a span of 1.14\u00A0volts',
      'a 680\u00A0nm photon is 176\u00A0kilojoules per mole, about 1.8\u00A0volts for one electron\u00A0— enough on paper, but leaving little margin once every step of the chain has wasted some',
      'two smaller climbs with a downhill run between them give each photosystem a comfortable margin, and the downhill run is where protons are moved',
      'the red drop: beyond about 680\u00A0nm the efficiency of photosynthesis falls sharply although chlorophyll still absorbs there\u00A0— odd if there were one machine',
      'the enhancement effect: 700\u00A0nm and 650\u00A0nm light given together drive a higher rate than the two given separately and added, which is only possible if there are two things to drive, with different preferences, both of which have to run',
    ],
    explain: 'Two beams can help each other only if each drives something the other cannot. One machine lit in two colours would simply add; two machines in series, each supplying the other, can do better together than the sum\u00A0— and lighting only one of them jams the path within a few electrons.',
  },
  {
    id: 'i-two-photosystems-3',
    objective: 'two-photosystems',
    kind: 'mcq',
    question: 'Emerson\'s red drop and enhancement effect both showed that there are two photosystems. Suppose a plant had two photosystems in series as usual, but with identical absorption spectra, both absorbing well out to 700\u00A0nm. Which of the two effects would still be seen?',
    options: [
      { text: 'Both, since the red drop and the enhancement effect each measure how many photosystems a plant has, whatever the colours they absorb.',
        why: 'Takes the two effects for counters of photosystems. Each works only because far-red light drives one photosystem much more than the other; give the two the same colours and every beam drives both in step, and the evidence vanishes although the photosystems do not.' },
      { text: 'Neither: both depend on far-red light driving one photosystem far more than the other, and here every colour drives both in step.', correct: true },
      { text: 'The enhancement effect but not the red drop, since two photosystems in series always do better with two beams than with one.',
        why: 'Forgets why two beams help. They help only when each supplies the photosystem the other beam neglects; with identical spectra, 650\u00A0nm and 700\u00A0nm light each drive both photosystems equally already, so adding them adds and no more.' },
      { text: 'Neither, because two photosystems absorbing the same colours would compete for the same photons, and the plant could not photosynthesise at all.',
        why: 'Pictures the two photosystems fighting over one supply. Each has its own antenna catching its own photons, and sharing a colour only means one light drives both evenly, which is what a chain of two needs. The plant would photosynthesise well; only the evidence for two would be gone.' },
    ],
    explain: 'Emerson\'s measurements read the two photosystems through their colours. The red drop appears because light beyond about 680\u00A0nm reaches photosystem\u00a0I far better than photosystem\u00a0II, so it starves the first half of the chain; the enhancement appears because a second beam supplies the half the first one neglects. Both follow from the two absorbing differently. Give them the same spectrum and the plant works as well as ever while the evidence for two disappears: an experiment of this kind detects a difference, not a count.',
  },

  {
    id: 'i-electron-path-1',
    objective: 'electron-path',
    kind: 'mcq',
    question: 'The herbicide paraquat takes electrons from the chain on the stromal side of photosystem\u00a0I, before they reach NADP<sup>+</sup>, and passes them to oxygen, making a reactive form of it that wrecks the membrane. In a lit, sprayed leaf, how much of the electron path is still running?',
    options: [
      { text: 'None of it: with its final exit taken over, the whole chain backs up as far as photosystem\u00a0II, and the splitting of water comes to a stop.',
        why: 'Treats a diversion as a dam. Paraquat is an acceptor, not a plug: it takes electrons away as fast as the chain delivers them, so everything before it keeps running.' },
      { text: 'Everything except the splitting of water, because it is photosystem\u00a0I, not photosystem\u00a0II, that takes the electrons from water in the first place.',
        why: 'Swaps the photosystems\' places. Photosystem\u00a0II, with P680 and the manganese cluster, takes electrons from water; photosystem\u00a0I, with P700, comes second and hands them on towards ferredoxin.' },
      { text: 'Everything except the cytochrome complex, which is bypassed because paraquat takes electrons straight from plastoquinone.',
        why: 'Puts paraquat at the wrong point on the path. Plastoquinone and the cytochrome complex come before photosystem\u00a0I, and paraquat acts after it, on the stromal side; the carriers before it are untouched.' },
      { text: 'All of it up to NADP<sup>+</sup>: water is still split, and electrons still pass plastoquinone, the cytochrome complex, plastocyanin and P700.', correct: true },
    ],
    explain: 'The path in order: water, through the manganese cluster, to P680; the first push, by light; plastoquinone; the cytochrome complex; plastocyanin; P700; the second push; ferredoxin; and NADP<sup>+</sup>, reduced by ferredoxin–NADP<sup>+</sup> reductase. Paraquat intercepts after the second push, so everything before it runs\u00A0— and runs straight into oxygen, which is how the herbicide kills: the reactive oxygen it makes destroys the membrane the chain sits in.',
  },
  {
    id: 'i-electron-path-2',
    objective: 'electron-path',
    kind: 'mcq',
    question: 'An electron\'s path from water to NADPH is drawn against redox potential. At which points does the electron move uphill, to a more reducing position, and what moves it there?',
    options: [
      { text: 'At the two reaction centres, P680 and P700, where an absorbed photon lifts it far up the scale; everywhere else it runs downhill.', correct: true },
      { text: 'At the cytochrome complex and at ferredoxin, where proteins pump the electron up the scale using the energy of the proton gradient.',
        why: 'Mixes up the two currents. The cytochrome complex pumps protons, not electrons, and it pays for that with the electron\'s fall between the photosystems; nothing in the chain uses the proton gradient to lift an electron.' },
      { text: 'All the way from water to NADP<sup>+</sup>, in many small steps, each step paid for with one of the ATP the chloroplast has made.',
        why: 'Treats ATP as the fuel of the light reactions, when it is their product. The electron climbs only where light lifts it, and the ATP is made afterwards, from the proton gradient the downhill run charges.' },
      { text: 'At the manganese cluster and at the NADP<sup>+</sup> reductase, the two ends of the chain, where the electron enters and leaves.',
        why: 'The ends are where electrons are taken and delivered, and at neither is anything lifted: the manganese cluster hands its electrons to the oxidised P680, which holds them more tightly still. The two climbs are where the light is absorbed.' },
    ],
    explain: 'The Z scheme has two climbs with a descent between them. Light lifts the electron at P680 and again at P700; between them it falls through plastoquinone, the cytochrome complex and plastocyanin, and the cytochrome complex spends part of that fall moving protons into the lumen. After P700 it runs down again, through ferredoxin, to NADP<sup>+</sup>.',
  },
  {
    id: 'i-electron-path-3',
    objective: 'electron-path',
    kind: 'free',
    question: 'Trace one electron from a water molecule to NADPH, naming every carrier in order and the two points where light pushes it uphill. Then say which carriers would end up full of electrons and which empty in two leaves: one lit only with far-red light that drives photosystem\u00a0I alone, and one given a poison that stops plastocyanin working.',
    rubric: [
      'water → manganese cluster → P680 → (light, the first push) → plastoquinone → cytochrome <i>b</i><sub>6</sub><i>f</i> → plastocyanin → P700 → (light, the second push) → ferredoxin → ferredoxin–NADP<sup>+</sup> reductase → NADPH',
      'the two uphill points are the reaction centres, P680 and P700, where an absorbed photon lifts the electron; everywhere else it runs downhill',
      'with far-red light driving photosystem\u00a0I alone, it drains the carriers before it\u00A0— plastocyanin, the cytochrome complex, plastoquinone\u00A0— which end up empty, and P700 waits oxidised with nothing to refill it',
      'only a few electrons reach ferredoxin and NADP<sup>+</sup> before the flow stops',
      'with plastocyanin stopped, electrons from photosystem\u00a0II pile up behind the block: plastoquinone and the cytochrome complex fill, and photosystem\u00a0II soon has nowhere to send its electrons, so water splitting stalls',
      'beyond the block photosystem\u00a0I has no electrons to give, so ferredoxin and NADP<sup>+</sup> stay empty',
      'the rule in both cases: carriers between a working photosystem and a block further along the path fill up; carriers a working photosystem draws on, with nothing refilling them, run empty',
    ],
    explain: 'This is how the order was first shown. In 1961 Louis Duysens found that light driving one photosystem oxidised a cytochrome between them and light driving the other reduced it again\u00A0— which only makes sense if the cytochrome sits between two photosystems working in series.',
  },

  {
    id: 'i-water-split-1',
    objective: 'water-split',
    kind: 'mcq',
    question: 'P680<sup>+</sup>, the hole photosystem\u00a0II leaves behind, holds electrons at about +1.2\u00A0volts, the strongest oxidant known in biology. Suppose a change in its surrounding protein left it holding them only at +0.45\u00A0volts, as P700<sup>+</sup> does. What would happen to the splitting of water?',
    options: [
      { text: 'It would go on, but more slowly, since a weaker oxidant pulls on water\'s electrons with less force than the strong one did, and so takes longer.',
        why: 'Treats a potential as a strength that sets a speed. It sets a direction: from water at +0.82 to an oxidant at +0.45 is downhill the wrong way, so the reaction would not go at all, however long it waited\u00A0— Section\u00A05.2\'s rule, in volts.' },
      { text: 'Nothing would change, because it is the manganese cluster, not P680, that takes the electrons from water.',
        why: 'The cluster is the counter and the catalyst, but each of its steps is driven by P680<sup>+</sup> taking an electron from it. Hitched to a weak oxidant, the cluster would keep its electrons for ever.' },
      { text: 'It would stop: water holds its electrons at +0.82\u00A0volts, and an oxidant that holds them less tightly than water does cannot take them.', correct: true },
      { text: 'Oxygen would still be released, but one molecule for every eight photons absorbed at photosystem\u00a0II, instead of one for every four of them.',
        why: 'Mixes up the two halves of the question. The count of four is set by the chemistry\u00A0— two waters give up four electrons\u00A0— while the potential decides whether the reaction goes at all, not how many photons each oxygen costs.' },
    ],
    explain: 'An electron moves of its own accord only from a looser hold to a tighter one. To take electrons from water, P680<sup>+</sup> must hold them more tightly than water does\u00A0— its potential must be more positive than +0.82\u00A0— and at about +1.2 it is, with the margin every step needs. That hole is the point of the whole photosystem: its useful product is not the electron that left but the oxidant left behind.',
  },
  {
    id: 'i-water-split-2',
    objective: 'water-split',
    kind: 'free',
    question: 'Splitting water is a four-electron reaction, and a photon removes one electron at a time. Explain how the oxygen-evolving complex deals with that mismatch and where the protons go. Then describe the flash experiment that let Joliot and Kok watch it count, and say why the first burst of oxygen comes on the third flash.',
    rubric: [
      '2 H<sub>2</sub>O → O<sub>2</sub> + 4 H<sup>+</sup> + 4 e<sup>−</sup>: four electrons must be taken before one oxygen molecule can form',
      'each photon at photosystem\u00a0II removes one electron: P680 is excited and passes its electron on, and P680<sup>+</sup> takes an electron back from the cluster',
      'the cluster\u00A0— four manganese ions and a calcium ion on the lumen side of photosystem\u00a0II\u00A0— holds its oxidation state between hits, becoming more oxidised with each',
      'only when four have accumulated does it take four electrons from two waters at once and release one oxygen molecule\u00A0— never a quarter of one per photon',
      'the four protons are released into the lumen, the first of the three things that make it acidic',
      'dark-adapted chloroplasts given single brief flashes release almost no oxygen on the first two, a burst on the third, and further bursts on the seventh and eleventh, blurring as the population drifts out of step',
      'the first burst comes on the third flash rather than the fourth because in the dark most clusters rest one step along',
    ],
    explain: 'The cluster is a counter, and the flash experiment reads the counter out directly. A reader who expects a quarter of an oxygen after every flash has pictured the reaction as divisible, and the period of four is the evidence that it is not.',
  },
  {
    id: 'i-water-split-3',
    objective: 'water-split',
    kind: 'mcq',
    question: 'Dark-adapted chloroplasts release their first burst of oxygen on the third of a series of single flashes. Suppose a treatment left every oxygen-evolving complex fully reset in the dark, holding no stored charge at all, and the flashes were repeated. When would oxygen come out?',
    options: [
      { text: 'On the fourth flash, then the eighth and the twelfth: starting from rest, each cluster needs four hits per oxygen.', correct: true },
      { text: 'On every flash, a quarter of a burst each time, since each flash removes one of the four electrons an oxygen needs.',
        why: 'Pictures the reaction as divisible. Oxygen cannot be released a quarter of a molecule at a time; the cluster stores each hit and releases a whole molecule only when four have accumulated, which is why the yield comes in bursts at all.' },
      { text: 'On the third flash, as before, because the third is set by the chemistry of water and does not depend on where the clusters start.',
        why: 'Has learned the number and not the reason for it. The burst comes on the third flash because most clusters rest one step along in the dark; start them from nothing and four hits are needed, so the burst moves to the fourth.' },
      { text: 'On the fourth flash, and then on every flash after it, since a cluster that has filled once stays filled and releases oxygen each time it is hit.',
        why: 'Forgets that releasing the oxygen empties the counter. Once four charges have gone into taking electrons from two waters, the cluster is back at rest and needs four more: the bursts repeat every fourth flash.' },
    ],
    explain: 'The cluster is a counter that fills by one with each photon at photosystem\u00a0II and releases a whole oxygen molecule, taking four electrons from two waters, only when it holds four. In the dark most clusters rest one step along, so three flashes fill them and the first burst comes on the third. Clusters reset to nothing need four, and the period stays four because every release empties the counter: fourth, eighth, twelfth, blurring as the clusters fall out of step.',
  },

  {
    id: 'i-zscheme-arithmetic-1',
    objective: 'zscheme-arithmetic',
    kind: 'mcq',
    question: 'Some green algae can pass electrons from ferredoxin to an enzyme that makes hydrogen gas, at about −0.42\u00A0volts. For two electrons taken from water (+0.82\u00A0volts) all the way to hydrogen, what does the climb cost per mole, and what fraction is that of the energy in the four moles of 680\u00A0nm photons that pushed them?',
    options: [
      { text: 'About 120\u00A0kilojoules\u00A0— 96.5 × 1.24\u00A0— which is about a sixth of the 704\u00A0kilojoules that the four moles of 680\u00A0nm photons carried.',
        why: 'Counts one electron. 96.5\u00A0kilojoules per volt is for a mole of electrons, and a molecule of hydrogen takes two, so the cost doubles.' },
      { text: 'About 240\u00A0kilojoules\u00A0— 2 × 96.5 × 1.24\u00A0— which is about a third of the 704\u00A0kilojoules in four moles of 680\u00A0nm photons.', correct: true },
      { text: 'About 160\u00A0kilojoules\u00A0— 2 × 96.5 × 0.82\u00A0— since the electrons start out at water\'s +0.82\u00A0volts and are lifted from there.',
        why: 'Uses one end of the climb as if it were the whole of it. What the electrons are lifted through is the difference between where they start and where they finish: +0.82 to −0.42, which is 1.24\u00A0volts.' },
      { text: 'About 240\u00A0kilojoules, which is more than a mole of red photons carries, so visible light could never pay for the climb.',
        why: 'Compares the cost of two electrons with one mole of photons. Each electron is pushed twice, once at each photosystem, so two electrons take four photons: 704\u00A0kilojoules to pay for about 240.' },
    ],
    explain: 'The cost of lifting electrons is the number of electrons times 96.5\u00A0kilojoules per volt times the span. Water to hydrogen is 1.24\u00A0volts, so two electrons cost about 240\u00A0kilojoules per mole\u00A0— a little more than the 220 to NADPH, because the destination is a tenth of a volt further up. Two photons per electron, one at each photosystem, supply 4 × 176 = 704, so about a third of the light ends up in the hydrogen; part of the rest is stored in the proton gradient the downhill run charges, and the remainder is lost as heat.',
  },
  {
    id: 'i-zscheme-arithmetic-2',
    objective: 'zscheme-arithmetic',
    kind: 'mcq',
    question: 'Pushing two electrons from water up to NADPH costs about 220\u00A0kilojoules per mole, and Section\u00A05.8 found that letting the two electrons on an NADH fall to oxygen releases about 220 as well. Why the same number?',
    options: [
      { text: 'Coincidence: the two numbers come from different reactions, in different organelles, measured by different methods, and happen to agree to the nearest ten.',
        why: 'Misses that the energy between two states depends only on the two states. Both journeys run between the same two couples, so the agreement is forced, not lucky.' },
      { text: 'A chloroplast is a perfect machine, so it captures exactly the energy that a mitochondrion releases, no more and no less.',
        why: 'Confuses the cost of the climb with what paid for it. The 220 is what the electrons are lifted through; the photons that lifted them supplied about 700, so the chloroplast is nowhere near perfect.' },
      { text: 'The same enzymes do both jobs, running forwards in the mitochondrion and backwards in the chloroplast, so the energy must match.',
        why: 'The two chains are built from different proteins in different organelles, and Section\u00A05.8\'s rule is that a pathway and its reverse are never simply the same steps run backwards. What the two share is their ends.' },
      { text: 'It is one journey run both ways: NADH and NADPH hold electrons at the same −0.32\u00A0volts, and water at +0.82, so the span is 1.14\u00A0volts either way.', correct: true },
    ],
    explain: 'The energy between two states depends only on the states, not on the route. Water and oxygen are one end, at +0.82\u00A0volts; NADH and NADPH, which differ only by a phosphate that carries no energy, are the other, at −0.32. Two electrons across 1.14\u00A0volts is about 220\u00A0kilojoules per mole whichever way they go: released on the way down in a mitochondrion, paid for by light on the way up in a chloroplast.',
  },
  {
    id: 'i-zscheme-arithmetic-3',
    objective: 'zscheme-arithmetic',
    kind: 'free',
    question: 'Use the potentials in Section\u00A06.4\'s table to work out what it costs to push two electrons from water up to NADPH. Compare it with what the photons supplied, first for red light at 680\u00A0nm and then for blue light at 450\u00A0nm, and say why a leaf in blue light makes no more NADPH for each photon it absorbs than a leaf in red.',
    rubric: [
      'water holds its electrons at +0.82\u00A0volts and NADP<sup>+</sup> at −0.32: a climb of 1.14\u00A0volts',
      'each volt costs 96.5\u00A0kilojoules per mole of electrons, so two electrons cost 2 × 96.5 × 1.14, about 220\u00A0kilojoules per mole\u00A0— Section\u00A05.8\'s fall from NADH to oxygen, run backwards',
      'each electron is pushed twice, once at each photosystem, so two electrons take four photons',
      'four moles of 680\u00A0nm photons supply 4 × 176 = 704\u00A0kilojoules, so about 31\u00A0per\u00A0cent ends up in the NADPH',
      'four moles of 450\u00A0nm photons supply 4 × 266, about 1060\u00A0kilojoules, so only about 21\u00A0per\u00A0cent does',
      'the cost is set by the potentials, not by the light: a blue photon carries more than a push needs, but it is absorbed whole by one molecule and moves one electron, so its surplus cannot pay for a second',
      'the rest of what the photons supply is not all wasted: part is stored in the proton gradient that the downhill run between the photosystems charges, and part is lost as heat',
    ],
    explain: 'The ledger is set by where the electrons start and finish, and the light only has to be enough to push each electron across its half. Blue light is more than enough and red is enough; neither makes more NADPH per photon, because the unit of work is one photon, one electron.',
  },

  {
    id: 'i-nadph-role-1',
    objective: 'nadph-role',
    kind: 'mcq',
    question: 'NADP<sup>+</sup> is NAD<sup>+</sup> with one extra phosphate group, on the ribose at the far end from where the electrons are carried. What does that phosphate do?',
    options: [
      { text: 'It holds no energy and does no chemistry: it is a label, so building enzymes use NADPH and fuel-dismantling ones NAD<sup>+</sup>.', correct: true },
      { text: 'It stores extra energy in its bond to the ribose, so NADPH can hand more energy than NADH does to whatever is being built.',
        why: 'Carries over the idea that a phosphate is a store of energy, which Section\u00A05.3 took apart for ATP. NADPH and NADH hold their electrons at the same potential, so a pair delivered by either carries the same energy.' },
      { text: 'It makes NADPH a stronger reductant than NADH, which is why only NADPH is strong enough to reduce carbon compounds in the Calvin cycle.',
        why: 'Both carriers hold electrons at about −0.32\u00A0volts. What differs is not how hard they push the electrons but which pool they belong to, and so which enzymes will take them.' },
      { text: 'It lets NADPH cross the chloroplast\'s membranes and reach the rest of the cell, which the unmarked NADH is unable to do.',
        why: 'Gives the phosphate a job at a membrane. The phosphate is read by the enzymes that use the carrier, not by the membranes around it, and NADPH made in the stroma is spent in the stroma.' },
    ],
    explain: 'The phosphate is a label, and a label is enough. Enzymes that take electrons off fuel use the unphosphorylated pool; enzymes that put electrons into things being built use the phosphorylated one. The light reactions fill the second, and the Calvin cycle draws on it.',
  },
  {
    id: 'i-nadph-role-2',
    objective: 'nadph-role',
    kind: 'mcq',
    question: 'In the cytoplasm of a liver cell, most of the NAD is held as NAD<sup>+</sup>, ready to accept electrons, while most of the NADP is held as NADPH, ready to give them. Why does keeping the two pools the opposite way round suit the cell?',
    options: [
      { text: 'It does not: the cell would do better to let electrons flow between the pools until both were held at the same ratio.',
        why: 'Evening the pools out would leave both half-ready for everything. Section\u00A05.2\'s point applies: it is a difference held away from equilibrium that makes a reaction go, and here each pool is held where its job needs it.' },
      { text: 'It shows that the liver is building more than it is breaking down, and the two ratios will swap over when it turns to taking fuel apart instead.',
        why: 'Imagines one account switched between two uses minute by minute\u00A0— the arrangement the two pools exist to avoid. Both ratios hold at once, in the same cytoplasm, because both jobs are running at once.' },
      { text: 'An oxidised NAD<sup>+</sup> pool stands ready to take electrons from fuel, and a reduced NADPH pool to give them to what is being built: both jobs run at once.', correct: true },
      { text: 'NADH is simply being used up faster than NADPH, because the liver\'s respiration runs faster than its building does.',
        why: 'Reads a held ratio as the leftover of two rates. Measured in fed and in starved animals, the liver\'s ratios stay of the same order: the cell keeps each pool where its job needs it.' },
    ],
    explain: 'Two pools carrying the same electrons at the same potential sound like duplication until you ask what each must be ready to do. One must accept electrons from fuel, so it is kept mostly oxidised; the other must give them to things being built, so it is kept mostly reduced. With a single pool the cell would have to choose, minute by minute, between taking things apart and building them.',
  },
  {
    id: 'i-nadph-role-3',
    objective: 'nadph-role',
    kind: 'free',
    question: 'Say how NADPH differs from NADH and which kind of enzyme uses each. Then explain what a cell gains by keeping two pools of carriers that hold electrons at the same potential, and what it would have to do if it had only one.',
    rubric: [
      'NADP<sup>+</sup> is NAD<sup>+</sup> with one extra phosphate group on the ribose at the far end from where the electrons are carried',
      'the phosphate holds no energy and takes no part in the chemistry; both carriers hold electrons at about −0.32\u00A0volts',
      'it is a label read by proteins: enzymes that take electrons off fuel use NAD<sup>+</sup>, and enzymes that put electrons into things being built use NADPH',
      'in a chloroplast the light reactions fill the NADPH pool and the Calvin cycle spends it, reducing 3-\u2060phosphoglycerate',
      'two pools let a cell hold one mostly oxidised, ready to accept electrons, and the other mostly reduced, ready to give them, at the same time',
      'with one pool it would have to choose, minute by minute, between taking things apart and building them',
    ],
    explain: 'The whole design rests on a phosphate that does nothing chemically. That is the point of it: a mark that changes which enzymes will accept a carrier, without changing what the carrier carries.',
  },

  {
    id: 'i-cyclic-flow-1',
    objective: 'cyclic-flow',
    kind: 'mcq',
    question: 'A mutant plant\'s photosystem\u00a0II does not work at all, but its photosystem\u00a0I, cytochrome complex and ATP synthase are normal. In the light, running only cyclic flow round photosystem\u00a0I, which of these can it still do?',
    options: [
      { text: 'Make NADPH but no ATP, since photosystem\u00a0I, which still works normally, is the one photosystem that reduces NADP<sup>+</sup> to NADPH.',
        why: 'Photosystem\u00a0I does hand electrons towards NADP<sup>+</sup> in linear flow, but those electrons came from water through photosystem\u00a0II. With no source, every electron photosystem\u00a0I sends to NADP<sup>+</sup> is one it never gets back, and within a few turns it has none left to send.' },
      { text: 'Make ATP, but neither NADPH nor oxygen: it cannot feed the Calvin cycle\'s reduction step, so it cannot build sugar by itself.', correct: true },
      { text: 'Make ATP and release oxygen, but make no NADPH at all, since in cyclic flow the electrons never travel on as far as NADP<sup>+</sup>.',
        why: 'Oxygen comes only from splitting water, which only photosystem\u00a0II does. In cyclic flow no electron is taken from water, so none is released.' },
      { text: 'Nothing at all, because building a proton gradient needs the protons that are released when water is split.',
        why: 'Water is one of three sources of lumen protons, and not the one that matters here: the cytochrome complex is the only real pump in the chain, and cyclic flow sends every electron through it.' },
    ],
    explain: 'Cyclic flow sends ferredoxin\'s electron back to the cytochrome complex, then to plastocyanin and to P700 again. The cytochrome complex still pumps protons, so ATP is made. No electron reaches NADP<sup>+</sup>, so there is no NADPH; no electron is taken from water, so there is no oxygen. Photosystem\u00a0I running on its own is an ATP machine: it can top up a chloroplast\'s ATP, but it cannot supply the electrons the Calvin cycle\'s reduction needs.',
  },
  {
    id: 'i-cyclic-flow-2',
    objective: 'cyclic-flow',
    kind: 'free',
    question: 'Say what happens to an electron in cyclic electron flow, what the loop produces and what it does not. Name the two things it therefore cannot be used for, and say what it is used for instead.',
    rubric: [
      'at ferredoxin the electron is sent back to the cytochrome complex instead of on to NADP<sup>+</sup>, then to plastocyanin and to P700 again: photosystem\u00a0I running on its own',
      'the cytochrome complex still pumps protons, so a gradient is built and ATP is made',
      'no electron reaches NADP<sup>+</sup>, so no NADPH is made',
      'no electron is taken from water, so no water is consumed and no oxygen appears',
      'so it cannot supply reducing power: it cannot provide the NADPH the Calvin cycle spends in its reduction phase',
      'and it cannot bring new electrons into the chain, so it can never stand in for linear flow from water',
      'what it is for is ATP: the Calvin cycle needs more ATP for each NADPH than linear flow supplies, and a plant adjusts how much cyclic flow runs to make up the difference',
    ],
    explain: 'What cyclic flow does not produce is as instructive as what it does. It shows that the ATP half of the light reactions depends only on protons being pumped and the NADPH half only on electrons being delivered, and that the two can be run in different proportions.',
  },
  {
    id: 'i-cyclic-flow-3',
    objective: 'cyclic-flow',
    kind: 'mcq',
    question: 'Some filamentous cyanobacteria fix nitrogen in special cells called heterocysts. Nitrogenase, the enzyme that does it, needs a great deal of ATP and a supply of electrons, and oxygen destroys it. Heterocysts have no working photosystem\u00a0II but keep photosystem\u00a0I, and they take in sugar from the cells on either side. Suppose a heterocyst, still lit, is cut off from its neighbours. What happens to its nitrogen fixation?',
    options: [
      { text: 'It carries on: cyclic flow round photosystem\u00a0I supplies both the ATP and the electrons nitrogenase needs, so the neighbours are not needed.',
        why: 'Asks cyclic flow for reducing power. The loop returns every electron to P700, so it can make ATP indefinitely but has no electrons to spare; any it gave to nitrogenase would never come back, and it would run dry within a few turns.' },
      { text: 'It carries on: photosystem\u00a0I takes electrons from water in place of the missing photosystem\u00a0II, and nitrogenase is fed from them.',
        why: 'Gives photosystem\u00a0I a job only photosystem\u00a0II can do. P700<sup>+</sup> holds electrons at about +0.45\u00A0volts and water holds them at +0.82: an oxidant weaker than water cannot take its electrons, at any speed.' },
      { text: 'It soon stops: cyclic flow still makes ATP but brings in no electrons, and the electrons nitrogenase used came from the sugar its neighbours sent.', correct: true },
      { text: 'It stops, because the heterocyst has no ATP left: without photosystem\u00a0II to feed it, photosystem\u00a0I on its own makes none at all.',
        why: 'Thinks ATP needs the whole chain. Cyclic flow sends electrons round photosystem\u00a0I and through the cytochrome complex, which pumps protons, so the gradient and the ATP go on; what the heterocyst loses is its only source of electrons.' },
    ],
    explain: 'A heterocyst keeps the half of the light reactions it needs and drops the half that would kill its enzyme. Without photosystem\u00a0II no water is split, so no oxygen is made inside; photosystem\u00a0I, in cyclic flow, pumps protons through the cytochrome complex and makes ATP. What cyclic flow cannot do is supply electrons, because every one returns to P700, so a heterocyst takes nitrogenase\'s electrons from sugar its neighbours send in. Cut it off and the ATP goes on while the nitrogen fixation stops: the loop was never a source of electrons.',
  },

  // ============================================================================
  // 6.5 Chapter 4's battery, charged by light
  // ============================================================================

  {
    id: 'i-proton-sources-1',
    objective: 'proton-sources',
    kind: 'mcq',
    question: 'Three things make the thylakoid lumen acidic relative to the stroma, and only one of them is a pump. Which is it, and why do the other two not count as pumping?',
    options: [
      { text: 'The oxygen-evolving complex, since it releases four protons into the lumen for every oxygen molecule it makes\u00A0— more than any other single source provides.',
        why: 'Takes "pump" to mean "big source". A pump carries something from one side of a membrane to the other; the protons from water are made on the lumen side and cross nothing.' },
      { text: 'ATP synthase, since protons are carried through it from one side of the thylakoid membrane to the other as it turns.',
        why: 'Protons do pass through the synthase\u00A0— but downhill, from the lumen back to the stroma, spending the gradient. A pump moves them uphill, into the lumen, and charges it.' },
      { text: 'The NADP<sup>+</sup> reductase, since removing protons from the stroma is the same thing as pumping them into the lumen.',
        why: 'It does the same job for the difference, since what drives the synthase is the difference between the two sides\u00A0— but no proton crosses the membrane. That is what makes it a consumer and not a pump.' },
      { text: 'Plastoquinone with the cytochrome complex, which carry protons from the stroma to the lumen; the other two act on one side of the membrane only.', correct: true },
    ],
    explain: 'Water is split on the lumen face of photosystem\u00a0II, releasing four protons into the lumen for each oxygen; plastoquinone picks up protons from the stroma and the cytochrome complex releases them in the lumen, about two for every electron; and reducing NADP<sup>+</sup> takes one proton from the stroma for each NADPH. All three push the same way, which is what matters: the lumen becomes acidic with respect to the stroma.',
  },
  {
    id: 'i-proton-sources-2',
    objective: 'proton-sources',
    kind: 'mcq',
    question: 'For each oxygen molecule that linear electron flow releases\u00A0— four electrons moved from water to NADP<sup>+</sup>\u00A0— how many protons does each source contribute to the difference across the thylakoid membrane, and on which side?',
    options: [
      { text: 'Splitting water releases 4 into the lumen; plastoquinone and the cytochrome complex carry about 8 across from the stroma; making two NADPH takes 2 from the stroma.', correct: true },
      { text: 'Splitting water releases 4 into the stroma; the cytochrome complex carries about 8 from the lumen into the stroma; making the two NADPH takes 2 out of the lumen.',
        why: 'Turns the whole gradient round. The manganese cluster sits on the lumen side of photosystem\u00a0II and the pump carries protons into the lumen, which is why the lumen, not the stroma, becomes acidic, and why ATP synthase\'s knob faces the stroma.' },
      { text: 'Splitting water releases 4 into the lumen; the cytochrome complex carries about 4, one per electron; making the two NADPH adds 2 to the lumen.',
        why: 'Undercounts the pump and puts NADPH on the wrong side. The cytochrome complex moves about two protons per electron, by sending part of the flow round a second time; and NADP<sup>+</sup> is reduced on the stromal face, taking its proton from the stroma.' },
      { text: 'All 14 are carried across the membrane by the cytochrome complex; splitting water and reducing NADP<sup>+</sup> only hand protons to it.',
        why: 'Sends every proton through the one pump. Two of the three sources act on one side only: water\'s protons are made in the lumen and NADP<sup>+</sup>\'s are taken from the stroma, and neither crosses the membrane at all.' },
    ],
    explain: 'Per oxygen: four electrons; four protons from the water, released straight into the lumen; about eight carried across by plastoquinone and the cytochrome complex; and two taken out of the stroma to make two NADPH. Fourteen in all\u00A0— twelve added to the lumen and two missing from the stroma\u00A0— and every one of them widens the same difference.',
  },
  {
    id: 'i-proton-sources-3',
    objective: 'proton-sources',
    kind: 'free',
    question: 'Name the three things that make the thylakoid lumen acidic relative to the stroma. For each, say where it happens, which side of the membrane it acts on, and whether it carries a proton across. Then say why a source that only takes protons out of the stroma still counts.',
    rubric: [
      'splitting water, at the lumen face of photosystem\u00a0II: four protons released into the lumen for each oxygen, made on that side and not carried across',
      'plastoquinone and the cytochrome <i>b</i><sub>6</sub><i>f</i> complex: protons taken from the stroma and released into the lumen, about two per electron\u00A0— the only real pump in the chain',
      'reducing NADP<sup>+</sup>, at the stromal face of photosystem\u00a0I: one proton taken out of the stroma for each NADPH, used up on that side',
      'all three push the same way: the lumen becomes acidic with respect to the stroma',
      'what drives ATP synthase is the difference between the two sides, so taking a proton out of the stroma does the same job as adding one to the lumen',
    ],
    explain: 'Only one of the three is a pump, but all three count, because the synthase feels only the difference between the sides. Section\u00A06.6 then counts them\u00A0— twelve protons into the lumen for every two NADPH, the stromal one conventionally left out\u00A0— and finds the ATP coming up short.',
  },

  {
    id: 'i-thylakoid-gradient-1',
    objective: 'thylakoid-gradient',
    kind: 'mcq',
    question: 'Isolated thylakoids at 35\u00A0°C are lit until the inside of the sacs is at pH 5.5, while the solution around them is at pH 8. What is each mole of protons that falls back across the membrane worth?',
    options: [
      { text: 'About 2.3\u00A0kilojoules: a difference of 2.5 pH units means 2.5 times as many protons inside as outside.',
        why: 'The misreading Section\u00A06.5 warns about. A pH unit is a factor of ten, so 2.5 units is a ratio of about 316, not 2.5; read as 2.5, the energy comes out about six times too small.' },
      { text: 'About 800\u00A0kilojoules: the ratio is about 316, and RT times the ratio is what a mole of protons is worth.',
        why: 'Leaves out the logarithm. A gradient\'s worth grows with the logarithm of the ratio, not with the ratio itself, which is why each further factor of ten adds the same 5.9\u00A0kilojoules rather than multiplying the total.' },
      { text: 'About 15\u00A0kilojoules: 2.5 factors of ten at RT ln 10, about 5.9\u00A0kilojoules per mole at 35\u00A0°C.', correct: true },
      { text: 'Almost nothing: with no voltage across the membrane, a difference in pH on its own can do no useful work on the synthase.',
        why: 'Section\u00A04.7\'s two terms are two ways of storing the same kind of energy, and either can drive the synthase on its own. In a thylakoid the pH term is almost all of it.' },
    ],
    explain: 'Each factor of ten between the two sides is worth RT ln 10: 5.7\u00A0kilojoules per mole at 25\u00A0°C, 5.9 at 35\u00A0°C. From pH 8 to pH 5.5 is 2.5 factors of ten\u00A0— a ratio of about 316\u00A0— so each mole of protons falling back is worth about 2.5 × 5.9, close to 15\u00A0kilojoules. The voltage term adds almost nothing here, because magnesium and chloride ions cross the membrane and cancel the charge as it builds.',
  },
  {
    id: 'i-thylakoid-gradient-2',
    objective: 'thylakoid-gradient',
    kind: 'free',
    question: 'A thylakoid\'s proton-motive force is almost entirely a difference in pH, while much of a mitochondrion\'s is voltage. Explain why the two differ. Work out what a difference of two pH units is worth per mole of protons on a cold morning at 5\u00A0°C, and predict what would happen to the split between pH and voltage if the thylakoid membrane stopped letting magnesium and chloride ions through.',
    rubric: [
      'a gradient of a charged particle has two terms, one for concentration and one for voltage, and Section\u00A04.7 said the voltage term is often as large as the concentration term',
      'as protons pile up in the lumen, charge would build with them, but the thylakoid membrane lets magnesium and chloride ions through, and their movement cancels the charge almost as fast as it appears',
      'so a thylakoid carries its force almost entirely as a pH difference; a mitochondrion\'s inner membrane does not allow that ion movement, and much of its force is voltage',
      'each factor of ten in concentration is worth RT ln 10, which goes with the absolute temperature: 5.7\u00A0kilojoules per mole at 298\u00A0K, so about 5.3 at 278\u00A0K',
      'two pH units is a hundredfold, so each mole of protons falling back is worth about 2 × 5.3, a little under 11\u00A0kilojoules',
      'with the counter-ions blocked, voltage would build as the protons were pumped, and the same force would be carried more as voltage and less as a pH difference',
      'what decides the split is the membrane\'s permeability to other ions (Section\u00A04.3), not anything about the protons themselves',
    ],
    explain: 'Same mechanism, two different splits, and what decides between them is a membrane\'s permeability, not its chemistry. Temperature enters a gradient\'s worth directly, through RT, which is why a leaf\'s numbers are not the body-temperature numbers of Chapter\u00A05.',
  },
  {
    id: 'i-thylakoid-gradient-3',
    objective: 'thylakoid-gradient',
    kind: 'mcq',
    question: 'Suppose a leaf\'s thylakoids hold a pH difference of two units at 25\u00A0°C, with no voltage across the membrane. Spinach\'s synthase makes three ATP for every fourteen protons, and making an ATP in the stroma costs about 50\u00A0kilojoules per mole. Is the gradient enough to make ATP?',
    options: [
      { text: 'No: a mole of protons falling two units releases about 11\u00A0kilojoules, far short of the 50 an ATP costs, so something else must make up the rest.',
        why: 'Charges one proton for each ATP. The synthase takes several protons for each ATP it releases\u00A0— fourteen per turn of the ring, three ATP per turn\u00A0— so what has to pay for an ATP is about 4.7 protons, not one.' },
      { text: 'Yes, many times over: two units is a hundredfold difference, and a hundredfold is worth a hundred times RT, about 250\u00A0kilojoules per mole of protons.',
        why: 'Multiplies by the ratio instead of its logarithm. Each factor of ten is worth the same RT ln 10, 5.7\u00A0kilojoules at 25\u00A0°C, so a hundredfold is worth twice that, not a hundred times RT.' },
      { text: 'That depends on how many protons the lumen holds, not on the pH difference: a bigger lumen would pay more for each ATP.',
        why: 'Mixes up how much a store holds with what each unit of it is worth. A bigger lumen at the same pH holds more protons and can make more ATP before it runs down, but each mole of protons is worth the same, set by the ratio across the membrane and the temperature.' },
      { text: 'Just: 2 × 5.7 is about 11.4\u00A0kilojoules per mole of protons, and 4.7 of them per ATP make about 53, a little more than the 50 needed.', correct: true },
    ],
    explain: 'Each factor of ten across the membrane is worth RT ln 10, 5.7\u00A0kilojoules per mole at 25\u00A0°C, so two units are worth about 11.4. The synthase\'s price is set by its ring: fourteen protons a turn for three ATP, about 4.7 protons each, so each ATP is paid about 4.7 × 11.4, roughly 53\u00A0kilojoules, against the 50 it costs. On this reckoning two units is enough with little to spare, where the three units of isolated thylakoids in strong light would pay about 80.',
  },

  {
    id: 'i-photophosphorylation-1',
    objective: 'photophosphorylation',
    kind: 'mcq',
    question: 'How does ATP synthase turn protons falling from the lumen into ATP?',
    options: [
      { text: 'Each proton reacts with ADP and phosphate when it reaches the knob of the enzyme, and the energy released by that reaction is what joins them.',
        why: 'Makes the proton a reactant. The protons pass through the ring and out into the stroma unchanged; what they contribute is rotation, and the joining happens at the knob, driven by mechanical force.' },
      { text: 'Protons return only through a ring in the membrane, turning it; the ring turns a shaft that squeezes the knob\'s three sites, each releasing an ATP.', correct: true },
      { text: 'The protons carry electrons with them to the knob, and there the electrons reduce ADP and phosphate to ATP.',
        why: 'Mixes up the two currents. Electrons travel down the chain and end on NADPH; protons are what cross the synthase. Joining a phosphate to ADP is a phosphorylation, not a reduction, and no electron is involved.' },
      { text: 'The falling protons heat the knob as they pass through the enzyme, and that heat supplies the energy needed to join the ADP and the phosphate.',
        why: 'Section\u00A05.4\'s rule: heat released nearby pays for nothing, because a cell is all at one temperature. The coupling here is mechanical, through the turning ring and shaft.' },
    ],
    explain: 'Protons falling from the lumen can get back to the stroma only through the ring in the synthase\'s oily core, and getting through turns it. The turning ring turns a shaft; the shaft runs up into the knob and distorts its three catalytic sites in turn, and each site, as it is squeezed, releases the ATP it has assembled. The ring\'s size sets the exchange rate: fourteen subunits and three ATP a turn in spinach, so about 4.7 protons per ATP.',
  },
  {
    id: 'i-photophosphorylation-2',
    objective: 'photophosphorylation',
    kind: 'free',
    question: 'Explain how ATP synthase turns falling protons into ATP, and what sets how many protons each ATP costs. Say which side of the thylakoid membrane the ATP appears on and why that is the side that matters. A cyanobacterium\'s synthase has a ring of fifteen subunits and, like every such synthase, makes three ATP per turn: how many protons does each of its ATP cost?',
    rubric: [
      'protons in the lumen can get back to the stroma only through the ring of subunits in the synthase\'s oily core, and getting through turns it',
      'the turning ring turns a shaft that runs up into the knob and distorts its three catalytic sites in turn, and each site, squeezed, releases the ATP it has assembled: chemistry done by mechanical force',
      'the ring\'s size sets the exchange rate: spinach\'s fourteen subunits and three ATP a turn make about 4.7 protons per ATP',
      'fifteen subunits and three ATP a turn make five protons per ATP',
      'the knob faces the stroma, so the ATP appears in the stroma, where the Calvin cycle spends it',
      'built the other way round, the enzyme would make ATP inside a sealed sac with nothing in it to spend ATP on, and a charged molecule like ATP cannot simply diffuse back out through the bilayer',
      'the gradient is the shared intermediate: the chain that charges it and the synthase that spends it never touch',
    ],
    explain: 'The orientation is the whole of the delivery system, and the ring is the whole of the price list. Neither needs any chemistry the book has not already given: a pump run backwards, as Section\u00A04.7 predicted could happen, facing the side where its product is wanted.',
  },
  {
    id: 'i-photophosphorylation-3',
    objective: 'photophosphorylation',
    kind: 'mcq',
    question: 'At night a chloroplast\'s stroma still holds ATP, some of it brought in from the rest of the cell. Its ATP synthase carries a switch that keeps it off in the dark. Without that switch, what would the synthase do overnight?',
    options: [
      { text: 'Run backwards: split the stroma\'s ATP and use the energy to push protons from the stroma into the lumen, wasting the ATP.', correct: true },
      { text: 'Nothing: the synthase is driven by the light, and with no light shining there is nothing to turn its ring in either direction.',
        why: 'Takes the synthase for a light-driven machine. Nothing in it absorbs light; it runs whichever way is downhill, and with the gradient gone and ATP in the stroma, downhill is ATP split and protons pumped into the lumen.' },
      { text: 'Go on making ATP through the night, from the protons stored in the lumen during the day.',
        why: 'Treats the gradient as a store that lasts. The lumen\'s extra protons leak away within seconds of the light going off; there is nothing left by midnight to make ATP from, and a synthase free to run would soon be running the other way.' },
      { text: 'Pump protons out of the lumen into the stroma, emptying the lumen faster than it would empty on its own.',
        why: 'Gets the direction of a pump run backwards the wrong way round. Making ATP, protons fall from the lumen to the stroma; run in reverse, the machine spends ATP to push them uphill, from the stroma into the lumen.' },
    ],
    explain: 'ATP synthase is a pump that can run either way, and which way it runs is set by which way is downhill. By day the gradient is steep enough that protons falling through the ring make ATP. In the dark the gradient is gone within seconds while the stroma still holds ATP, so downhill is the other way: the synthase would split ATP and push protons into the lumen, spending the night\'s supply for nothing. The switch that prevents it is a disulfide bridge that thioredoxin opens in the light, the same kind of switch Section\u00A06.6 describes on several of the Calvin cycle\'s enzymes.',
  },

  {
    id: 'i-acid-bath-1',
    objective: 'acid-bath',
    kind: 'mcq',
    question: 'Jagendorf and Uribe\'s acid bath is repeated with one change: a small amount of an uncoupler\u00A0— a molecule that carries protons across the membrane\u00A0— is added to the pH 8 buffer with the ADP and phosphate. Still in the dark, what happens to the yield of ATP?',
    options: [
      { text: 'It rises, because the uncoupler speeds up the movement of protons across the membrane, and moving protons is what makes ATP.',
        why: 'Counts protons crossing, not protons crossing through the synthase. Every proton that takes the uncoupler\'s route turns no ring; the gradient empties faster and makes less ATP.' },
      { text: 'It is unchanged, because an uncoupler acts on electron transport, and in the dark there is no electron transport going on at all for it to act on.',
        why: 'Puts the uncoupler in the chain. It acts on the membrane\u00A0— it carries protons across it\u00A0— which is exactly why it works as well on a gradient made by hand in the dark as on one made by light.' },
      { text: 'It is unchanged, because the gradient was made by hand, and an uncoupler can only affect a gradient that has been made by the light reactions.',
        why: 'A gradient does not remember how it was made. The acid bath\'s whole point was that a gradient made by hand is, to the synthase and to anything else that lets protons across, the same as one made by light.' },
      { text: 'It falls towards nothing: the uncoupler gives the lumen\'s protons a way out round the synthase, so the gradient runs down without making ATP.', correct: true },
    ],
    explain: 'The acid bath makes a gradient of four pH units by hand\u00A0— soak at pH 4 in the dark, tip into pH 8 with ADP and phosphate\u00A0— and the thylakoids make ATP for the few seconds it lasts. An uncoupler, a small acid that crosses the membrane with or without its proton, opens a second route that bypasses the synthase, so the gradient collapses sooner and little or no ATP is made. It is the same claim tested from the other side: if the gradient is the intermediate, making it without electrons makes ATP, and emptying it without the synthase makes none.',
  },
  {
    id: 'i-acid-bath-2',
    objective: 'acid-bath',
    kind: 'free',
    question: 'Describe Jagendorf and Uribe\'s acid-bath experiment of 1966\u00A0— what was done, in what order, and what was absent\u00A0— and say which explanation of photophosphorylation it ruled out. Then predict what a molecule that carries protons across the thylakoid membrane would do to the yield of ATP, and why.',
    rubric: [
      'isolated thylakoids were soaked in a buffer at pH 4, in the dark, until the inside had come to pH 4 as well',
      'they were then tipped into a buffer at pH 8 containing ADP and phosphate, still in the dark: for a few seconds the lumen was at 4 and the outside at 8, a difference of four units made by hand',
      'in those seconds they made ATP\u00A0— with no light, no electron transport, and so no chance for a phosphorylated intermediate to have been made',
      'it ruled out the explanation almost everyone then held, that a phosphorylated intermediate links electron transport to ATP; the gradient alone was enough, as Mitchell had claimed',
      'a molecule that carries protons across the membrane gives them a way back that bypasses the synthase, so the gradient runs down without turning the ring',
      'the yield falls towards nothing, whether the gradient was made by light or by hand\u00A0— the same claim tested from the other side',
    ],
    explain: 'What makes the experiment is what it left out. Everyone looking for an intermediate needed one to have been made, and nothing in the flask could have made it; all that was supplied was a difference in proton concentration, and ATP followed.',
  },
  {
    id: 'i-acid-bath-3',
    objective: 'acid-bath',
    kind: 'mcq',
    question: 'Jagendorf and Uribe\'s acid bath is run the other way round: thylakoids are soaked at pH 8 in the dark, then tipped into a buffer at pH 4 containing ADP and phosphate, still in the dark. What happens?',
    options: [
      { text: 'They make as much ATP as in the original experiment, since the difference across the membrane is four pH units either way.',
        why: 'Treats a gradient as having a size but no direction. The synthase makes ATP only when protons fall from the lumen side to the stroma side; this difference points the other way and would drive the machine in reverse, towards splitting ATP.' },
      { text: 'No ATP: the protons now pile up outside, and falling inwards they would drive the synthase backwards.', correct: true },
      { text: 'More ATP than in the original, since the protons are now outside, next to the knob where the ATP is made.',
        why: 'Makes the proton a reactant that has to reach the knob. Protons drive the synthase by falling through its ring from the lumen side, turning it; standing beside the knob they do nothing, and falling the wrong way they turn it backwards.' },
      { text: 'ATP made inside the thylakoids, since the synthase now works the other way round, and none made outside, where the ADP is.',
        why: 'Supposes that reversing the gradient turns the enzyme round. The knob faces the stroma side whatever the gradient does; a reversed gradient turns the ring the other way, which splits ATP rather than making it anywhere.' },
    ],
    explain: 'The acid bath works because the lumen is made more acidic than the outside, so protons fall outwards through the synthase and turn it the way that makes ATP. Reverse the soak and the outside is the acidic side: protons would fall inwards, turning the ring the way that splits ATP, and with only ADP and phosphate to hand nothing is made. A gradient has a direction as well as a size, and the enzyme\'s orientation, knob on the stroma side, decides which direction pays.',
  },

  // ============================================================================
  // 6.6 Building a sugar out of air
  // ============================================================================

  {
    id: 'i-co2-is-stable-1',
    objective: 'co2-is-stable',
    kind: 'mcq',
    question: 'Methane and carbon dioxide are both small one-carbon gases, and neither reacts with anything much at room temperature. Carbon dioxide has two separate problems as a starting point for sugar. Which of them does methane share?',
    options: [
      { text: 'Only the unreactivity: methane is as slow to start, but its carbon is bonded to hydrogen, as reduced as carbon gets\u00A0— a fuel, not a spent one.', correct: true },
      { text: 'Both, because any molecule that will not react at room temperature is, for that very reason, low in energy and fully oxidised.',
        why: 'Runs together the two problems this section separates. Unreactive is a statement about a barrier; oxidised is a statement about where the electrons sit. Methane has a high barrier and a long way to fall, which is why it can sit in a gas main for years and still burn.' },
      { text: 'Only the oxidation: methane is fully oxidised too, since its carbon carries four bonds, exactly as the carbon in a carbon dioxide molecule does.',
        why: 'Counts the bonds instead of asking what they go to. Every carbon has four bonds; how oxidised it is depends on how many go to oxygen, which pulls electrons away, and how many to hydrogen, which does not.' },
      { text: 'Neither: methane reacts readily with the oxygen in air, which is why it burns so easily and is used as a fuel.',
        why: 'Methane burns fiercely once lit, but it needs the match: mixed with air at room temperature it does nothing, because its barrier is high. How much a reaction releases once over the barrier is a separate question from how hard the barrier is to climb.' },
    ],
    explain: 'Carbon dioxide is fully oxidised\u00A0— both bonds to oxygen, its electrons at the bottom of Section\u00A05.8\'s ladder\u00A0— so making sugar from it means pushing electrons back up, which is what NADPH is for. It is also stable: small, symmetrical and unreactive, with a high activation energy, so even with reducing power to hand nothing happens. Methane has the second problem and not the first.',
  },
  {
    id: 'i-co2-is-stable-2',
    objective: 'co2-is-stable',
    kind: 'mcq',
    question: 'Why does a chloroplast not simply hand NADPH\'s electrons to carbon dioxide directly?',
    options: [
      { text: 'Carbon dioxide must first be split into carbon and oxygen by the light, and only the bare carbon atom can take electrons from NADPH.',
        why: 'The idea the heavy-oxygen label disposed of, carried into the carbon reactions. Carbon dioxide is never split: it is attached whole, and its oxygen atoms end up in the sugar and in the water the reaction makes.' },
      { text: 'Carbon dioxide is a gas and NADPH is dissolved in the stroma, so the two are kept apart and never actually meet.',
        why: 'Carbon dioxide dissolves at the leaf\'s wet surfaces and reaches the stroma in solution, so they meet all the time. When they meet, nothing happens, because carbon dioxide is too unreactive to take the electrons.' },
      { text: 'It is too unreactive to take them, however much NADPH is to hand; so it is first attached to RuBP, a reactive molecule, and the product is reduced.', correct: true },
      { text: 'Handing the electrons to carbon dioxide directly would release far too much energy in a single step, and the release would damage the chloroplast.',
        why: 'Has the energy running the wrong way. Reducing carbon dioxide costs energy\u00A0— it is the climb of Section\u00A06.1\u00A0— and releases none; the release comes when the product is oxidised again, in Chapter\u00A07.' },
    ],
    explain: 'The two problems have two separate answers. The unreactivity is answered by not reducing carbon dioxide at all: rubisco attaches it to RuBP, a five-carbon sugar held in a reactive form, and it is the product of that attachment, 3-\u2060phosphoglycerate, that is reduced. The oxidation is answered by NADPH, which supplies the electrons in the reduction phase, after an ATP has attached a phosphate to make the molecule readier to take them.',
  },
  {
    id: 'i-co2-is-stable-3',
    objective: 'co2-is-stable',
    kind: 'free',
    question: 'Carbon dioxide has two separate problems as a raw material, and they are usually run together. Name them, say which of Section\u00A05.8\'s and Section\u00A05.5\'s ideas each one is, and say what the Calvin cycle does about each before any electron reaches carbon.',
    rubric: [
      'it is fully oxidised: both of its bonds go to oxygen, which pulls hardest on shared electrons, so its electrons are at the bottom of Section\u00A05.8\'s ladder',
      'turning it into sugar means pushing those electrons back up: a cost in free energy, paid with NADPH carrying electrons that light lifted',
      'it is also stable: small, symmetrical and unreactive, with a high activation energy (Section\u00A05.5), so even with reducing power to hand nothing happens',
      'the two are different obstacles: one is how far the electrons must be lifted, the other how hard the molecule is to get started',
      'the second is answered by attaching carbon dioxide to something already reactive\u00A0— RuBP, held by rubisco in an electron-rich form\u00A0— rather than reducing it directly',
      'the first is answered afterwards: the product, 3-\u2060phosphoglycerate, is phosphorylated with ATP and then reduced with NADPH to G3P',
    ],
    explain: 'A reader who runs the two together will expect a strong enough reductant to be enough, and will not see why rubisco exists. Pulling them apart is what makes the first step of the Calvin cycle make sense: it answers a question about rate, asked before the question about energy.',
  },

  {
    id: 'i-calvin-phases-1',
    objective: 'calvin-phases',
    kind: 'mcq',
    question: 'A chemist designs a "Calvin line": carbon dioxide is attached to RuBP and the products are reduced to G3P exactly as in the cycle, but none of the G3P is used to rebuild RuBP. Started with a fixed amount of RuBP, what happens?',
    options: [
      { text: 'It runs faster than the cycle, since the ATP that regeneration would have spent is saved and can all go to the reduction step instead.',
        why: 'Treats regeneration as overhead. Without it the line has nothing left to attach carbon dioxide to after one round, and the ATP it saves is saved by doing nothing.' },
      { text: 'It fixes as much carbon dioxide as it had RuBP and then stops: the acceptor is used up by the reaction it makes possible.', correct: true },
      { text: 'It runs indefinitely, since rubisco is an enzyme, and enzymes are not used up by the reactions that they catalyse, however many turns.',
        why: 'Right that rubisco is not used up, wrong about what is. The enzyme survives each reaction; the RuBP does not\u00A0— it becomes part of the product\u00A0— and an enzyme with no acceptor fixes nothing.' },
      { text: 'It makes more sugar for every carbon dioxide it fixes, since all six of the G3P it makes can be exported instead of only one of them.',
        why: 'Forgets where the carbon in those G3P came from. Five of every six carry carbon that came in as RuBP, not as new carbon dioxide; exporting them exports the acceptor, which is why the line stops.' },
    ],
    explain: 'Carboxylation attaches carbon dioxide to RuBP and yields 3-\u2060phosphoglycerate; reduction turns that into G3P, spending ATP and NADPH; regeneration rebuilds RuBP from five of every six G3P, spending three more ATP for every three carbon dioxides. The cycle exists because the acceptor is consumed by the reaction it enables: a small pool going round indefinitely handles an unlimited amount of carbon, which is Section\u00A05.8\'s reason for listing cyclic pathways separately.',
  },
  {
    id: 'i-calvin-phases-2',
    objective: 'calvin-phases',
    kind: 'free',
    question: 'Name the Calvin cycle\'s three phases in order. For each, say what happens to the carbon\u00A0— counting carbons for three carbon dioxides at once\u00A0— and what the phase spends. Then explain why it has to be a cycle rather than a line.',
    rubric: [
      'carboxylation: three RuBP take three carbon dioxides and become six 3-\u2060phosphoglycerate\u00A0— fifteen carbons plus three makes eighteen, six threes; no ATP, no NADPH',
      'reduction: each 3-\u2060phosphoglycerate is phosphorylated with an ATP and then reduced with an NADPH to G3P\u00A0— six of each; this is where the electrons from water reach carbon',
      'regeneration: five of the six G3P, fifteen carbons, are shuffled through three- to seven-carbon intermediates back into three RuBP, for three more ATP',
      'the sixth G3P leaves: three carbons out for three carbon dioxides in, though the atoms themselves are shuffled between the sugar that leaves and the acceptor that is rebuilt',
      'the acceptor is used up by the reaction it makes possible: fixing carbon without rebuilding RuBP would fix as much as there was RuBP and then stop',
      'rebuilding it turns a stock into a rate: a small pool goes round indefinitely and handles an unlimited amount of carbon',
    ],
    explain: 'Doing the books for three carbon dioxides rather than one is the trick that keeps every molecule whole. With one, the sixth of a G3P that leaves each turn confuses everybody; with three, one whole G3P leaves and the carbon balances at every step.',
  },
  {
    id: 'i-calvin-phases-3',
    objective: 'calvin-phases',
    kind: 'mcq',
    question: 'Algae fixing carbon in bright light are suddenly given air with no carbon dioxide, while the light stays on. Within a minute, what happens to the amounts of RuBP and of 3-\u2060phosphoglycerate in their chloroplasts?',
    options: [
      { text: 'Both fall, since the cycle has stopped taking in carbon, and every one of its intermediates runs down together.',
        why: 'Treats the cycle as one machine that stops as a whole. Only carboxylation needs carbon dioxide; reduction and regeneration still have the light\'s ATP and NADPH and run on until their own inputs are used up, which empties one pool into the other.' },
      { text: 'RuBP falls and 3-\u2060phosphoglycerate rises, because the phases after carboxylation run short of ATP and NADPH.',
        why: 'Assumes any stop in the cycle looks like darkness. In the dark, reduction and regeneration stop for want of ATP and NADPH while carboxylation runs on; here the light is on, and it is carboxylation that has lost its substrate.' },
      { text: 'Neither changes, since without carbon dioxide no step of the cycle can move, and its intermediates stay where they were.',
        why: 'Supposes every phase needs carbon dioxide. Only rubisco takes it; the phases after it run on the carbon already in the cycle for as long as that lasts.' },
      { text: 'RuBP rises and 3-\u2060phosphoglycerate falls: carboxylation has stopped, while reduction and regeneration run on and rebuild RuBP.', correct: true },
    ],
    explain: 'The phases can be told apart by stopping one. Carboxylation is the only step that takes carbon dioxide: it uses RuBP and makes 3-\u2060phosphoglycerate. Take the carbon dioxide away with the light still on and that step stops, while reduction goes on turning 3-\u2060phosphoglycerate into G3P and regeneration goes on building RuBP from it. So 3-\u2060phosphoglycerate is drained and RuBP piles up: the mirror image of switching the light off, which stops the phases that spend ATP and NADPH and leaves carboxylation running. Calvin\'s group used the two transients together to show that RuBP is the acceptor.',
  },

  {
    id: 'i-carboxylation-product-1',
    objective: 'carboxylation-product',
    kind: 'mcq',
    question: 'Calvin\'s group fed algae carbon dioxide labelled with <sup>14</sup>C and killed them in hot methanol after a few seconds. Essentially all the label was in one compound. Which, and why was it a surprise that it had three carbons?',
    options: [
      { text: 'Glucose, the six-carbon sugar, since glucose is what photosynthesis makes, and so it is the compound that the label was expected to reach first of all.',
        why: 'Expects the end product first. Glucose is many steps and many turns away; after a few seconds only the first stable product has had time to be labelled, and the longer the interval, the more compounds carry the label.' },
      { text: 'RuBP, the five-carbon acceptor, since the incoming carbon dioxide is attached straight onto it and stays there.',
        why: 'Mixes up the acceptor and the product. Attaching carbon dioxide to RuBP turns it into something else; labelled carbon reaches RuBP only after the regeneration phase has brought it round again, which takes much longer.' },
      { text: 'A six-carbon compound, which Calvin\'s group isolated from the algae and could then watch splitting into two three-carbon molecules over the next few minutes.',
        why: 'The six-carbon compound never leaves the enzyme, so it was never among the labelled compounds Calvin\'s group separated. Catching it took stopping the working enzyme with acid a few thousandths of a second after it started, decades later.' },
      { text: '3-\u2060phosphoglycerate. Five carbons plus one predicted a six, but the enzyme cuts the six-carbon compound in two before it can leave: a three comes out.', correct: true },
    ],
    explain: 'Five plus one makes six, and the obvious prediction was a six-carbon product. What the label found was 3-\u2060phosphoglycerate, and the reason is the enzyme: the six-carbon compound is held in the active site and cut in two within a few thousandths of a second, so what leaves\u00A0— and what a labelling experiment sees first\u00A0— is two three-carbon molecules. The first stable product has three carbons, which is why most plants are called C<sub>3</sub> plants.',
  },
  {
    id: 'i-carboxylation-product-2',
    objective: 'carboxylation-product',
    kind: 'mcq',
    question: 'Most plants are called C<sub>3</sub> plants. What is the three?',
    options: [
      { text: 'The carbons in the first stable product, 3-\u2060phosphoglycerate: rubisco\'s six-carbon compound is cut in two before it leaves.', correct: true },
      { text: 'The three ATP that the Calvin cycle spends in fixing each carbon dioxide, one more than the two NADPH that it spends alongside.',
        why: 'A true number in the wrong place. The cycle does spend three ATP per carbon dioxide, but the name was given for the first product, and a C<sub>4</sub> plant, which spends five, runs the same cycle.' },
      { text: 'The number of carbons in RuBP, the acceptor molecule to which rubisco attaches each of the incoming molecules of carbon dioxide.',
        why: 'RuBP has five carbons, not three. Five plus one makes six, cut in two; the three is what comes out, not what goes in.' },
      { text: 'The Calvin cycle\'s three phases\u00A0— carboxylation, reduction and regeneration\u00A0— which every such plant runs through in turn, in that order.',
        why: 'Every plant that runs the cycle has those three phases, C<sub>4</sub> and CAM plants included, so they could not tell the groups apart. The name records which molecule the carbon first turns up in.' },
    ],
    explain: 'The name is a record of Calvin\'s result. In most plants carbon dioxide first appears in a three-carbon acid, 3-\u2060phosphoglycerate, because rubisco does the fixing directly; in a C<sub>4</sub> plant it first appears in a four-carbon acid, because PEP carboxylase fixes it first.',
  },
  {
    id: 'i-carboxylation-product-3',
    objective: 'carboxylation-product',
    kind: 'free',
    question: 'Say what rubisco attaches carbon dioxide to, name the first stable product of photosynthesis, and explain why it has three carbons rather than six. How was it found, and what does the name C<sub>3</sub> plant record?',
    rubric: [
      'rubisco attaches carbon dioxide to RuBP, a five-carbon sugar with a phosphate at each end',
      'five plus one makes six, but the six-carbon compound never leaves the enzyme: within a few thousandths of a second the active site cuts it into two three-carbon molecules',
      'the first stable product is 3-\u2060phosphoglycerate, two of them for each carbon dioxide fixed',
      'Calvin, Benson and Bassham fed algae carbon labelled with <sup>14</sup>C, killed them in hot methanol after measured intervals and separated the labelled compounds: at a few seconds there was essentially one, 3-\u2060phosphoglycerate',
      'the six-carbon compound never appeared among their labelled compounds, because it never leaves the enzyme',
      'most plants are called C<sub>3</sub> plants after that three-carbon first product',
    ],
    explain: 'The six-carbon compound is real: it was caught decades later by stopping the enzyme with acid a few thousandths of a second into the reaction, and on its own it takes about an hour to break down. What is fast is what rubisco does to it, and that is why the first thing out of the active site, and the first thing a labelling experiment sees, has three carbons.',
  },

  {
    id: 'i-calvin-ledger-1',
    objective: 'calvin-ledger',
    kind: 'mcq',
    question: 'A leaf exports sucrose, a twelve-carbon sugar built from four G3P. How much ATP and NADPH does the Calvin cycle spend to supply the carbon for one sucrose?',
    options: [
      { text: '18 ATP and 12 NADPH, the same as for one glucose, since sucrose is simply a sugar as well.',
        why: 'Treats the cost as a price per sugar. The cycle charges per carbon dioxide\u00A0— three ATP and two NADPH\u00A0— and glucose\'s eighteen and twelve are six carbons\' worth. Sucrose has twelve.' },
      { text: '36 ATP and 36 NADPH: the cycle spends one NADPH alongside every ATP that it uses.',
        why: 'Assumes the two are spent in pairs. The reduction step does spend one of each per 3-\u2060phosphoglycerate, but regeneration spends a further ATP per carbon dioxide and no NADPH, which is why the cycle wants three ATP for every two NADPH.' },
      { text: '36 ATP and 24 NADPH: three ATP and two NADPH for each of twelve carbon dioxides.', correct: true },
      { text: '4 ATP and 4 NADPH: one of each to reduce each of the four G3P that go into the sucrose.',
        why: 'Counts only the steps that make the four G3P that leave, as though the rest of the cycle ran for nothing. Each G3P that leaves carries the cost of three turns\u00A0— nine ATP and six NADPH\u00A0— because the other five G3P made in those turns go back to rebuild the acceptor.' },
    ],
    explain: 'The cycle\'s costs are per carbon dioxide, every time: three ATP and two NADPH. A three-carbon G3P out costs nine and six; a six-carbon glucose, eighteen and twelve; a twelve-carbon sucrose, thirty-six and twenty-four. The ATP is spent in two phases\u00A0— two per carbon dioxide in reduction, one in regeneration\u00A0— and the NADPH only in reduction.',
  },
  {
    id: 'i-calvin-ledger-2',
    objective: 'calvin-ledger',
    kind: 'mcq',
    question: 'A chloroplast\'s stroma has plenty of NADPH, but its supply of ATP is cut to almost nothing. Which of the Calvin cycle\'s phases can still run?',
    options: [
      { text: 'Carboxylation and reduction, since reduction runs on the NADPH that is plentiful; only regeneration, the phase that spends ATP, has to stop.',
        why: 'Forgets the first half of the reduction step: each 3-\u2060phosphoglycerate is phosphorylated with an ATP before it can be reduced with an NADPH. Two of the cycle\'s three ATP per carbon dioxide are spent in reduction.' },
      { text: 'Only carboxylation, which spends neither: reduction needs an ATP before each NADPH, regeneration needs ATP too, and the acceptor runs out.', correct: true },
      { text: 'All three, only more slowly, since NADPH can stand in for ATP wherever the cycle runs short of ATP.',
        why: 'Treats the two carriers as one currency. NADPH carries electrons and ATP carries a phosphate group, and an enzyme that needs one cannot use the other.' },
      { text: 'None of them: rubisco needs an ATP to attach each carbon dioxide, so the very first phase stops at once.',
        why: 'Rubisco needs neither ATP nor NADPH, which is why, with the ATP cut off, carboxylation goes on consuming the acceptor until there is none left.' },
    ],
    explain: 'Carboxylation spends nothing; reduction spends two ATP and two NADPH per carbon dioxide, the ATP first; regeneration spends one ATP and no NADPH. So a cycle short of ATP stalls in two phases at once, and carboxylation keeps turning RuBP into 3-\u2060phosphoglycerate that nothing can take further, until the acceptor is gone.',
  },
  {
    id: 'i-calvin-ledger-3',
    objective: 'calvin-ledger',
    kind: 'free',
    question: 'A C<sub>3</sub> leaf fixes 60 carbon dioxide molecules. Work out how much ATP and NADPH its Calvin cycle spends, how much of each goes to each phase, and how many G3P leave. Then use Section\u00A06.6\'s values\u00A0— about 50\u00A0kilojoules per ATP and 220 per NADPH\u00A0— to say how close the spending comes to the minimum the sugar needs.',
    rubric: [
      'per carbon dioxide the cycle spends three ATP and two NADPH, so sixty carbon dioxides cost 180 ATP and 120 NADPH',
      'carboxylation spends nothing: rubisco needs neither ATP nor NADPH',
      'reduction spends two ATP and two NADPH per carbon dioxide: 120 ATP and all 120 NADPH',
      'regeneration spends one ATP per carbon dioxide and no NADPH: 60 ATP, a third of the total',
      'twenty G3P leave, one for every three carbon dioxides\u00A0— carbon enough for ten glucose',
      'at about 50\u00A0kilojoules per ATP and 220 per NADPH the spending comes to about 9000 + 26 400 = 35 400\u00A0kilojoules, against a minimum of 10 × 2870 = 28 700: roughly four-fifths efficient',
      'an estimate of the size of the answer rather than a measurement, since the values inside a stroma are not the standard ones',
    ],
    explain: 'The ledger is linear in carbon, so every answer is the cost per carbon dioxide times the count. The efficiency is the same whether you count one G3P or sixty carbon dioxides, because the cycle does not get cheaper in bulk.',
  },

  {
    id: 'i-not-dark-reactions-1',
    objective: 'not-dark-reactions',
    kind: 'mcq',
    question: 'Isolated chloroplasts are kept in the dark, and ATP and NADPH are added to their stroma at the levels the light would produce. What happens to carbon fixation, and why?',
    options: [
      { text: 'It runs at the full daytime rate, since supplying ATP and NADPH is the only thing the light ever does for the enzymes that are waiting in the stroma.',
        why: 'The belief the old name encodes. The light does supply the cycle, and it also turns it on; without the light-driven changes in the stroma, supplying ATP and NADPH by hand does not wake the enzymes.' },
      { text: 'It runs backwards and breaks sugar down, because an enzyme reverses the direction of its reaction in the dark.',
        why: 'Nothing about darkness reverses an enzyme: the direction is set by ΔG. What darkness does is switch the cycle\'s enzymes off, so the flow slows to almost nothing either way.' },
      { text: 'It stops altogether, because the chloroplast breaks down its rubisco every night and has to build all of it again from scratch each morning when the light returns.',
        why: 'Confuses switching off with throwing away. The same enzyme molecules are switched off at night and on again in the morning, by changes that reverse\u00A0— the pH, the magnesium, a disulfide bridge\u00A0— far more cheaply than rebuilding a third of the leaf\'s protein every day.' },
      { text: 'It stays very slow: in the dark the stroma is near pH 7, short of magnesium, its thioredoxin oxidised, so the light-switched enzymes stay off.', correct: true },
    ],
    explain: 'The old name is wrong twice: the cycle does not run in the dark, and it does not merely stop when the ATP and NADPH run out\u00A0— it is switched off. When the light comes on, protons leaving the stroma raise its pH from about 7 to about 8, magnesium moves in, and ferredoxin reduces thioredoxin, which switches several of the cycle\'s enzymes on by opening a disulfide bridge; rubisco, for its part, needs the higher pH and the magnesium. Take the light away and all of it reverses.',
  },
  {
    id: 'i-not-dark-reactions-2',
    objective: 'not-dark-reactions',
    kind: 'free',
    question: 'The Calvin cycle used to be called the dark reactions. Give the two reasons the name is wrong. Then name the changes the light makes in the stroma that switch the cycle\'s enzymes on, say which of Section\u00A05.6\'s and Section\u00A05.7\'s ideas each is, and say what happens when the light goes off.',
    rubric: [
      'the cycle does not run in the dark: it runs in the light, alongside the reactions that supply it',
      'and it does not merely stop when ATP and NADPH run out: it is actively switched off in the dark and on in the light',
      'protons pumped from the stroma into the lumen raise the stromal pH from about 7 to about 8',
      'magnesium ions move from the lumen into the stroma to balance the charge those protons took with them',
      'several of the cycle\'s enzymes, rubisco among them, work far better at pH 8 with magnesium present than at pH 7 without\u00A0— Section\u00A05.6\'s argument about an enzyme\'s conditions, applied to a whole compartment',
      'ferredoxin reduces thioredoxin, which reduces a regulatory disulfide bridge on several of the cycle\'s enzymes and switches them on\u00A0— Section\u00A05.7\'s covalent modification, with a disulfide in place of a phosphate',
      'in the dark thioredoxin is re-oxidised, the pH and the magnesium fall back, and the enzymes go off again',
    ],
    explain: 'Two switches, set by the same light: the stroma\'s conditions, which rubisco depends on, and thioredoxin, which acts on other enzymes of the cycle. The light does not only feed the cycle; it turns it on.',
  },
  {
    id: 'i-not-dark-reactions-3',
    objective: 'not-dark-reactions',
    kind: 'mcq',
    question: 'A leaf that has spent an hour in deep shade is moved into full sun. Within a minute or two its electron transport has sped up to match the new light, but its carbon fixation takes ten minutes and more to approach its new rate. What mainly holds the carbon side back in those minutes?',
    options: [
      { text: 'The antenna, still detuned from its hour in the shade, sheds most of the new light as heat, and the leaf must wait until it retunes.',
        why: 'Puts the lag on the wrong side, and backwards. An antenna detunes in bright light, not in shade, and the question says the light reactions are up within a minute or two; what is slow here is the carbon side, which has to be switched on.' },
      { text: 'The chloroplast has to build new rubisco for the brighter light, and making that much protein takes minutes.',
        why: 'Confuses switching on with building. The same rubisco molecules were there in the shade, only partly active; making enough new enzyme to matter would take days, not minutes.' },
      { text: 'Rubisco has to be switched on, and in the stroma\'s new conditions that takes several minutes; the stomata take longer still.', correct: true },
      { text: 'Nothing holds it back: the cycle simply runs as fast as ATP and NADPH arrive, and it takes ten minutes for enough of them to build up.',
        why: 'The belief the old name encodes: that the cycle is a passive consumer running on whatever the light reactions deliver. The ATP and NADPH are arriving within a minute or two; the cycle is not merely fed by the light but switched on by it, and that takes time.' },
    ],
    explain: 'Moving into sun is where the old name fails most visibly. The light reactions respond within a minute or two, so ATP and NADPH are soon there; the cycle still lags, because the light has to switch it on. Rubisco, only partly active in the shade, takes several minutes to be fully activated in the stroma\'s new conditions, and that is the main limit early on; after it come the stomata, which take ten minutes to an hour to open fully. Nothing is built and nothing is detuned. An enzyme is being turned on.',
  },

  {
    id: 'i-atp-nadph-balance-1',
    objective: 'atp-nadph-balance',
    kind: 'mcq',
    question: 'A C<sub>4</sub> plant spends five ATP for each carbon dioxide it fixes\u00A0— the Calvin cycle\'s three and two more for its pump\u00A0— and still two NADPH. Compared with a C<sub>3</sub> plant, how much cyclic electron flow would you expect it to need?',
    options: [
      { text: 'Much more: it needs 2.5 ATP per NADPH rather than 1.5, and linear flow gives about 1.3, so far more ATP must come from cyclic flow.', correct: true },
      { text: 'None: the two extra ATP are made by the pump itself, as the four-carbon acid gives up its carbon dioxide.',
        why: 'Reverses the pump\'s books. Rebuilding PEP from the three-carbon remainder is where the two ATP are spent, not where they are made; the pump is a cost, like every pump in Section\u00A04.6.' },
      { text: 'Less: concentrating carbon dioxide cuts its photorespiration, so its Calvin cycle needs less ATP for each carbon dioxide that it fixes.',
        why: 'Right that a C<sub>4</sub> plant saves the ATP photorespiration would have cost; wrong that the saving shrinks the cycle\'s own ledger. Three ATP and two NADPH per carbon dioxide is fixed by the cycle\'s chemistry, and the pump\'s two ATP come on top.' },
      { text: 'About the same: how much cyclic flow runs is set by how bright the light is, not by what the stroma needs.',
        why: 'Section\u00A06.6 says the opposite: a plant adjusts how much cyclic flow runs according to what it needs, which is how it meets a ratio that linear flow cannot supply by itself.' },
    ],
    explain: 'The Calvin cycle wants three ATP for every two NADPH. Linear flow, per two NADPH, puts about twelve protons into the lumen, which buy about 2.6 ATP at 4.7 protons each: short of three. A C<sub>4</sub> plant wants five ATP per two NADPH, so its shortfall is far larger, and cyclic flow\u00A0— pumping protons and making ATP without touching NADP<sup>+</sup>\u00A0— has to make up much more of it. C<sub>4</sub> leaves are found to carry more of the machinery for cyclic flow than C<sub>3</sub> leaves do.',
  },
  {
    id: 'i-atp-nadph-balance-2',
    objective: 'atp-nadph-balance',
    kind: 'mcq',
    question: 'Suppose a chloroplast\'s ATP synthase had a ring of twelve subunits instead of fourteen, still making three ATP per turn. Could linear electron flow alone then supply the Calvin cycle\'s ratio of ATP to NADPH?',
    options: [
      { text: 'No: the cycle\'s ratio has nothing at all to do with the synthase, so linear flow would fall short exactly as it did before.',
        why: 'The ring\'s size sets the exchange rate of protons for ATP. At fourteen subunits the twelve protons linear flow moves per two NADPH buy about 2.6 ATP; at twelve they buy three.' },
      { text: 'No: a smaller ring makes fewer ATP for every turn it takes, so the shortfall that linear flow leaves would only get worse than it is.',
        why: 'Every such synthase makes three ATP per turn, because the knob has three catalytic sites. What the ring\'s size changes is how many protons a turn costs, and a smaller ring makes each ATP cheaper.' },
      { text: 'Yes, just: twelve protons for every two NADPH, at four protons per ATP, make exactly three ATP\u00A0— the cycle\'s three to two.', correct: true },
      { text: 'Yes, with plenty to spare, since a smaller ring turns faster and so makes more ATP from the very same number of protons as before.',
        why: 'Confuses how fast the ring turns with how many protons each turn costs. Speed sets how fast ATP is made; at four protons per ATP, twelve protons buy exactly three, with nothing to spare.' },
    ],
    explain: 'Per two NADPH, linear flow splits two waters and puts about twelve protons into the lumen\u00A0— four from the water, about eight from the cytochrome complex. How much ATP those buy depends on the ring: twelve divided by 4.7 is about 2.6 at fourteen subunits, and twelve divided by four is exactly three at twelve. The shortfall that cyclic flow makes up is set, in part, by the size of a ring of proteins.',
  },
  {
    id: 'i-atp-nadph-balance-3',
    objective: 'atp-nadph-balance',
    kind: 'free',
    question: 'Show, with the chapter\'s numbers, why linear electron flow on its own cannot supply the Calvin cycle\'s ratio of ATP to NADPH: for two waters split, count the electrons, the NADPH, the protons put into the lumen and the ATP they buy, and compare. Say what makes up the difference, and how. Then redo the count supposing the cytochrome complex moved one proton per electron instead of two, and say what that would do to the plant\'s need for it.',
    rubric: [
      'the cycle spends nine ATP for every six NADPH: three to two',
      'two waters split give four electrons, one oxygen molecule and two NADPH',
      'they put about twelve protons into the lumen: four from the water and about eight from the cytochrome complex, at two per electron',
      'at about 4.7 protons per ATP (fourteen subunits, three ATP a turn) twelve protons buy about 2.6 ATP where three were wanted: a modest, real shortfall',
      'cyclic electron flow makes up the difference: photosystem\u00a0I going round on its own pumps protons through the cytochrome complex and makes ATP without making NADPH, and a plant adjusts how much of it runs',
      'at one proton per electron the count would be eight protons and about 1.7 ATP per two NADPH, a much larger shortfall',
      'more cyclic flow would be needed, and each electron sent round it would buy only half as much ATP, since it too is pumped by the cytochrome complex',
    ],
    explain: 'The conclusion is firmer than the arithmetic. Every number in the count is a separate measurement that is still argued over\u00A0— including how often the cytochrome complex sends electrons round a second time\u00A0— and the proton taken from the stroma for each NADPH is conventionally left out, which would make the balance a little less unfavourable. But a shortfall, and a second route to make it up, survive every version of the sum.',
  },

  // ============================================================================
  // 6.7 One active site, two gases
  // ============================================================================

  {
    id: 'i-rubisco-two-substrates-1',
    objective: 'rubisco-two-substrates',
    kind: 'mcq',
    question: 'Why can rubisco\'s active site take an oxygen molecule in place of a carbon dioxide?',
    options: [
      { text: 'Oxygen is a competitive inhibitor that happens to fit the site, and the enzyme does nothing at all with it except wait until it drifts back out of the site.',
        why: 'Oxygen does compete for the site, as a competitive inhibitor would, but it is not just a blocker: the enzyme reacts with it, attaching it to RuBP and making 2-\u2060phosphoglycolate. That is why the mistake costs carbon and not only time.' },
      { text: 'To make carbon dioxide react, it holds RuBP in an electron-rich form that attacks it\u00A0— and that form attacks oxygen too; little tells the two apart.', correct: true },
      { text: 'Rubisco evolved to use both of the gases, and the reaction with oxygen is a second job that the plant needs the enzyme to go on doing in the light as well.',
        why: 'Treats the oxygen reaction as a purpose. It arose in air with no free oxygen, where there was nothing for selection to favour or disfavour, and it is a consequence of the chemistry of making carbon dioxide react, not a function.' },
      { text: 'In a warm leaf the enzyme is partly damaged, and a loosened, misshapen active site lets the wrong gas slip in.',
        why: 'Treats the mistake as a fault in a broken enzyme. A fresh, perfectly folded rubisco takes oxygen at the rate the chemistry sets; warmth makes it do so more often by lowering its preference and the dissolved ratio, not by damaging it.' },
    ],
    explain: 'Carbon dioxide is inert, so rubisco holds its acceptor in a rearranged, strongly electron-rich form that will attack even a molecule that unreactive\u00A0— and a form reactive enough for that will attack oxygen as well. The pocket can do little to keep oxygen out, because the two gases are alike in exactly the ways a binding site reads. The enzyme discriminates, by about a hundredfold, but imperfectly, and the discrimination costs it speed.',
  },
  {
    id: 'i-rubisco-two-substrates-2',
    objective: 'rubisco-two-substrates',
    kind: 'mcq',
    question: 'A binding pocket tells molecules apart by what it can grip. Why does rubisco\'s pocket find carbon dioxide and oxygen so hard to tell apart?',
    options: [
      { text: 'They are the same size and the same shape, so the two fit the pocket, and sit in it, in exactly the same way.',
        why: 'They differ in shape\u00A0— carbon dioxide is three atoms in a line, oxygen two\u00A0— and a pocket can use that. The trouble is that shape is nearly all it has to go on, because neither molecule offers a charge or a hydrogen to grip.' },
      { text: 'Both contain oxygen atoms, and rubisco\'s pocket is built to recognise oxygen atoms wherever it meets them.',
        why: 'A pocket does not read elements; it reads charge, shape and what can form a hydrogen bond. Plenty of molecules that contain oxygen, water among them, are ignored by it.' },
      { text: 'Oxygen is so much more plentiful than carbon dioxide that it swamps the pocket, however well the pocket can tell the two apart.',
        why: 'Abundance sets how often the mistake happens\u00A0— the first lines of Section\u00A06.7\'s table\u00A0— but not why the pocket finds the two hard to tell apart. Even at equal concentrations rubisco would take one oxygen for about every hundred carbon dioxides; a pocket that could read a real difference would take none.' },
      { text: 'They offer almost nothing different to grip: both small, both uncharged, neither with a hydrogen to bond, neither with a strong dipole.', correct: true },
    ],
    explain: 'A binding site distinguishes molecules by charge, by shape and by the hydrogen bonds it can make. Carbon dioxide and oxygen offer almost nothing on any of those: small, uncharged, no hydrogen, no strong dipole. That is the resemblance the enzyme has to discriminate against, and it is why PEP carboxylase, which takes the charged bicarbonate instead, has no such trouble.',
  },
  {
    id: 'i-rubisco-two-substrates-3',
    objective: 'rubisco-two-substrates',
    kind: 'free',
    question: 'Explain how one active site can take either carbon dioxide or oxygen: say what rubisco does to RuBP to make carbon dioxide react, why that also lets oxygen react, and what the two gases have in common that makes them hard for a pocket to tell apart. Say what each reaction produces.',
    rubric: [
      'carbon dioxide is inert, so to make it react rubisco holds RuBP in a rearranged, strongly electron-rich form that will attack even a molecule that unreactive',
      'a form reactive enough to attack carbon dioxide is reactive enough to attack oxygen',
      'the two gases are alike in the ways a binding site finds hardest to read: both small, both uncharged, neither with a hydrogen to bond to, neither with a strong dipole',
      'the enzyme does discriminate\u00A0— it favours carbon dioxide about a hundredfold\u00A0— but imperfectly, and the discrimination costs it speed',
      'carboxylation gives two 3-\u2060phosphoglycerate',
      'oxygenation gives one 3-\u2060phosphoglycerate and one 2-\u2060phosphoglycolate: two carbons, no use to the cycle, and an inhibitor of enzymes the cycle needs',
    ],
    explain: 'The problem is in two places at once: in the chemistry, because an acceptor reactive enough cannot be choosy about what it attacks, and in the binding, because the pocket has almost nothing to go on. Either alone would be manageable; together they are why the mistake happens at all.',
  },

  {
    id: 'i-oxygenation-arithmetic-1',
    objective: 'oxygenation-arithmetic',
    kind: 'mcq',
    question: 'Suppose the air\'s carbon dioxide doubled, to 0.084\u00A0per\u00A0cent, with oxygen still at 21\u00A0per\u00A0cent. Before the leaf\'s own interior is taken into account\u00A0— in water at 25\u00A0°C, with the enzyme preferring carbon dioxide about a hundredfold\u00A0— roughly how often would rubisco take an oxygen?',
    options: [
      { text: 'About once for every ten carbon dioxides: 250 to 1 in air, 10 to 1 dissolved, and a hundredfold preference leaves ten carboxylations per oxygenation.', correct: true },
      { text: 'Never: at twice today\'s carbon dioxide the active site would be occupied by carbon dioxide all of the time, leaving no room for oxygen.',
        why: 'Two substrates competing for one site share it in proportion to their concentrations and the enzyme\'s preference, however busy the site is. More carbon dioxide shifts the share; it does not close the site to oxygen.' },
      { text: 'About once for every five, just as now, since the enzyme\'s preference for carbon dioxide has not changed at all.',
        why: 'The preference is one term of three. Doubling the carbon dioxide halves the ratio the enzyme is choosing from, and so halves how often it chooses wrong.' },
      { text: 'Oxygen would still win, about 2.5 to 1: the air holds 250 oxygens for every carbon dioxide, and a hundredfold preference only brings that down to 2.5.',
        why: 'Skips the step that changes the answer most. The enzyme meets dissolved gases, not air, and carbon dioxide is about twenty-five times more soluble than oxygen. Leave that out and even today\'s air would give five oxygenations for every carboxylation, which no plant could survive.' },
    ],
    explain: 'Section\u00A06.7\'s steps with a new first line: air, 250 to 1; dissolved, divided by about 25, 10 to 1; after a hundredfold preference, ten carboxylations for every oxygenation\u00A0— half as many mistakes as today\'s five to one. Inside a working leaf the internal carbon dioxide would still sit below the air\'s, so the real ratio would be lower than ten, but still about twice today\'s.',
  },
  {
    id: 'i-oxygenation-arithmetic-2',
    objective: 'oxygenation-arithmetic',
    kind: 'free',
    question: 'Work through Section\u00A06.7\'s steps for a leaf on a hot, dry afternoon. The air is today\'s; at the leaf\'s 35\u00A0°C, suppose the dissolved ratio of oxygen to carbon dioxide is about 22 to 1 and the enzyme\'s preference has fallen to about 65-fold; and with its stomata nearly shut, the leaf\'s internal carbon dioxide is a third of what it would be in equilibrium with the air. Roughly how often does rubisco take an oxygen? Say what the heat and the shut stomata each did to the answer, and why.',
    rubric: [
      'in the air, oxygen outnumbers carbon dioxide about 500 to 1',
      'dissolved, carbon dioxide\'s greater solubility brings that to about 20 to 1 at 25\u00A0°C; at 35\u00A0°C carbon dioxide has lost solubility faster than oxygen, so it is about 22 to 1',
      'with the internal carbon dioxide cut to a third, the ratio at the enzyme is about 66 to 1',
      'a 65-fold preference against 66 to 1 leaves roughly one oxygenation for every carboxylation\u00A0— against about one in every three or four turns on a mild day',
      'the heat acted twice: it shifted the dissolved ratio against carbon dioxide, and it lowered the enzyme\'s own preference',
      'the heat is also why the stomata were shut: a hot plant has to close them more of the time to keep its water',
      'the shut stomata acted on the last step: rubisco went on drawing the internal carbon dioxide down while the light reactions went on adding oxygen',
    ],
    explain: 'Each step multiplies, so modest changes compound: a tenth lost on solubility, a third on the enzyme\'s preference and nearly half on the internal supply together turn about one mistake in four turns into about one in two. The 35\u00A0°C values are illustrative round numbers of the size measured; what matters is which step each change acts on.',
  },
  {
    id: 'i-oxygenation-arithmetic-3',
    objective: 'oxygenation-arithmetic',
    kind: 'mcq',
    question: 'High on a mountain the air is thinner: at 4000\u00A0metres both oxygen and carbon dioxide are at about 60\u00A0per\u00A0cent of their sea-level pressures, still in the same proportion to each other. For rubisco in water at 25\u00A0°C in equilibrium with that air, how does the share of its turns that take oxygen compare with sea level?',
    options: [
      { text: 'It rises, because thinner air carries less carbon dioxide, so rubisco finds carbon dioxide harder to come by and takes the oxygen around it instead.',
        why: 'Looks at one gas and forgets the other. Oxygen has fallen by the same factor, and rubisco\'s choice is set by the ratio of the two at its active site, not by either one alone.' },
      { text: 'About the same: both dissolved gases fall by the same factor, so the ratio the enzyme chooses between, and its preference, are unchanged.', correct: true },
      { text: 'It falls, because thinner air carries less oxygen, so there is less of it about to compete with the carbon dioxide.',
        why: 'The mirror of looking only at carbon dioxide. Less oxygen and less carbon dioxide in the same proportion leave the competition where it was.' },
      { text: 'It falls to almost nothing, since oxygen, the less soluble gas, all but stops dissolving at low pressure while carbon dioxide does not.',
        why: 'Makes solubility a threshold. Each gas dissolves in proportion to its own pressure at every pressure, so both fall to about 60\u00A0per\u00A0cent of their sea-level amounts and the ratio between them holds.' },
    ],
    explain: 'Rubisco\'s error rate is a ratio problem: how many oxygens it meets for each carbon dioxide, set against how strongly it prefers carbon dioxide. Each gas dissolves in proportion to its own pressure, so thinning the air thins both alike; at the same temperature the dissolved ratio stays about 20 to 1 and the hundredfold preference is unchanged, so rubisco still takes about one oxygen for every five carbon dioxides, as at sea level. What the mountain changes is how fast the enzyme can work, with less of both gases about\u00A0— and a mountain is usually cold, which on its own would tip the balance towards carbon dioxide.',
  },

  {
    id: 'i-photorespiration-route-1',
    objective: 'photorespiration-route',
    kind: 'mcq',
    question: 'A mutant of the plant Arabidopsis grows normally in air enriched to about one per cent carbon dioxide, but moved into ordinary air its leaves yellow within days and it dies. The defect is in a single enzyme. Where is it most likely to be?',
    options: [
      { text: 'In rubisco itself, which cannot fix carbon at the low carbon dioxide concentration of ordinary air, and so leaves the plant starving to death in it.',
        why: 'A plant with a broken rubisco could fix no carbon at any concentration, enriched or not. The clue is that the mutant is fine exactly where oxygenation is suppressed.' },
      { text: 'In the light reactions, which need extra carbon dioxide around the leaf in order to run at their full rate.',
        why: 'The light reactions take nothing from carbon dioxide; a defect there would leave the plant just as sick in enriched air. Look for what enriched air switches off.' },
      { text: 'In the salvage route for 2-\u2060phosphoglycolate: in enriched air rubisco rarely takes oxygen, so the route idles; in ordinary air the product piles up.', correct: true },
      { text: 'In the regeneration phase of the Calvin cycle, which needs extra carbon dioxide in order to rebuild RuBP fast enough to keep the whole cycle turning over.',
        why: 'Regeneration rebuilds RuBP from G3P and uses no carbon dioxide at all; a plant with a broken regeneration phase would stall in any air.' },
    ],
    explain: 'Fine in enriched air and dying in ordinary air is the fingerprint of photorespiration. At about one per cent carbon dioxide the ratio rubisco sees is so far in carbon dioxide\'s favour that oxygenation almost stops, and a broken salvage route costs nothing. In ordinary air rubisco takes oxygen about once in every three or four turns, and 2-\u2060phosphoglycolate that cannot be salvaged piles up and inhibits the cycle\'s own enzymes. Mutants found by screening for exactly this, from 1979 on, confirmed the salvage route one step at a time.',
  },
  {
    id: 'i-photorespiration-route-2',
    objective: 'photorespiration-route',
    kind: 'mcq',
    question: 'Four oxygenations make four molecules of 2-\u2060phosphoglycolate, eight carbons in all. Once the salvage route has done its work, how much of that carbon is back in the Calvin cycle, and what has been lost?',
    options: [
      { text: 'All eight carbons come back into the cycle, since recovering every carbon is what the salvage route exists to do.',
        why: 'The route recovers three carbons in four, not all of them: every time two two-carbon molecules are joined into one three-carbon one, a carbon leaves as carbon dioxide.' },
      { text: 'Six come back, as two 3-\u2060phosphoglycerate; two leave as carbon dioxide in the mitochondrion, with two ammonia to be recaptured.', correct: true },
      { text: 'Four come back: each two-carbon molecule loses one of its two carbons somewhere along the way through the three organelles of the route.',
        why: 'The carbon is lost when two two-carbon molecules become one three-carbon molecule, which is one carbon in four, not one in two.' },
      { text: 'None of it: two-carbon molecules are too small to be of use, and the salvage route simply breaks them down.',
        why: 'Doing nothing would lose all four carbons of each pair and leave an inhibitor behind. The route exists to avoid that: it recovers three carbons in four, at a cost.' },
    ],
    explain: 'The route takes the phosphate off in the chloroplast; passes the glycolate through a peroxisome, where a step that hands hydrogen to oxygen makes hydrogen peroxide and a catalase destroys it; and on to a mitochondrion, where two two-carbon molecules become one three-carbon molecule, releasing one carbon dioxide and one ammonia. One 3-\u2060phosphoglycerate comes back for each pair. Eight carbons in, six back, two lost, and both the ammonia and the lost carbon have to be recaptured.',
  },
  {
    id: 'i-photorespiration-route-3',
    objective: 'photorespiration-route',
    kind: 'free',
    question: 'Follow a pair of 2-\u2060phosphoglycolate molecules through the salvage route, naming the three organelles in order and what happens in each. Say what the plant gets back and what it loses on the way. Then predict what would pile up in a plant whose mitochondria could not do their step, and what air it would need to survive.',
    rubric: [
      'in the chloroplast the phosphate is taken off 2-\u2060phosphoglycolate, leaving glycolate',
      'the glycolate crosses into a peroxisome, where one step hands hydrogen straight to oxygen and makes hydrogen peroxide, which a catalase in the same compartment destroys',
      'the product goes on to a mitochondrion, where two two-carbon molecules are combined into one three-carbon molecule, releasing one carbon as carbon dioxide and one nitrogen as ammonia',
      'both have to be recaptured, costing more ATP and reducing power, and the released carbon has to be fixed again from scratch',
      'several steps later one 3-\u2060phosphoglycerate comes back to the chloroplast: three carbons recovered of the four that entered',
      'with the mitochondrial step blocked, the two-carbon compound arriving from the peroxisome would pile up, no carbon dioxide or ammonia would be released there, and none of the carbon would come back',
      'the plant would survive only in air enriched with carbon dioxide, where rubisco rarely takes oxygen and little enters the route',
    ],
    explain: 'The route is expensive, but it is not a failure: it recovers three carbons in four, where doing nothing would lose all four and leave an inhibitor behind. Cut it anywhere and the plant is only as healthy as its air is rich in carbon dioxide.',
  },

  {
    id: 'i-rubisco-abundance-1',
    objective: 'rubisco-abundance',
    kind: 'mcq',
    question: 'A C<sub>4</sub> leaf fixes carbon as fast as a C<sub>3</sub> leaf while holding much less rubisco\u00A0— around half as much, measured at the same leaf nitrogen. How can it manage with less?',
    options: [
      { text: 'Its PEP carboxylase does most of the fixing for it, so its rubisco is left with only a small share of the plant\'s carbon to handle each day.',
        why: 'PEP carboxylase fixes carbon only to carry it: the four-carbon acid gives its carbon dioxide back in the bundle sheath, and every carbon that ends up in sugar still goes through rubisco. What changes is how hard each rubisco molecule can work.' },
      { text: 'Its leaves run hotter than a C<sub>3</sub> leaf\'s, and a hotter enzyme turns over faster, so fewer of its molecules are needed for the same rate.',
        why: 'Heat does speed rubisco a little, and speeds its mistakes more. A C<sub>4</sub> leaf beside a C<sub>3</sub> leaf in the same sun is at much the same temperature; the difference is what the enzyme is sitting in.' },
      { text: 'It takes carbon dioxide in overnight and releases it by day, so that its rubisco can run at full speed all the way from dawn to dusk.',
        why: 'That is CAM, which separates the two steps in time. A C<sub>4</sub> plant separates them in space, between two kinds of cell, and does both in daylight.' },
      { text: 'Its rubisco sits in about ten times the air\'s carbon dioxide, so each molecule works nearer its maximum and seldom wastes a turn.', correct: true },
    ],
    explain: 'Section\u00A05.6\'s maximum rate is the amount of enzyme times how fast each molecule cycles. A C<sub>3</sub> plant, whose rubisco turns about three times a second at best, runs far below that in a leaf and wastes a quarter of its turns on oxygen, gets its rate by building an enormous amount. A C<sub>4</sub> plant works the other side of the same sum: by concentrating carbon dioxide around the enzyme it gets more carbon out of each molecule, and can build fewer.',
  },
  {
    id: 'i-rubisco-abundance-2',
    objective: 'rubisco-abundance',
    kind: 'free',
    question: 'State how much rubisco there is in a C<sub>3</sub> leaf and in the world. Then use Section\u00A05.6\'s definition of a maximum rate to explain how a plant gets a useful rate out of an enzyme that turns over about three times a second, and why the abundance is evidence that rubisco has a problem rather than evidence that it is a bad enzyme.',
    rubric: [
      'in a C<sub>3</sub> leaf rubisco is commonly a third to a half of all the soluble protein, with a comparable share of the leaf\'s invested nitrogen',
      'worldwide about 0.7\u00A0gigatonnes, roughly ninety kilograms for every person alive\u00A0— more than of any other protein',
      'rubisco turns over about three carbon dioxides a second when saturated, near the bottom of the range, and far less than that averaged over a season in the field',
      'a maximum rate is the amount of enzyme times how fast each molecule cycles: a plant cannot raise the second, so it raises the first',
      'the enormous amount is the compensation: ninety kilograms per person is what three turns a second costs',
      'a plant managing comfortably would not spend a third to a half of its leaf protein on one slow enzyme, so the abundance measures the size of the problem',
      'slowness, confusion and abundance are one fact: telling the two gases apart costs speed, and speed lost is made up in quantity',
    ],
    explain: 'Three facts usually presented as a paradox\u00A0— slow, error-prone, everywhere\u00A0— become one fact once the maximum rate is written down. The abundance is not a success in spite of a bad enzyme; it is the price of the chemistry the enzyme is stuck with.',
  },
  {
    id: 'i-rubisco-abundance-3',
    objective: 'rubisco-abundance',
    kind: 'free',
    question: 'Suppose a square metre of wheat leaf holds 2\u00A0grams of rubisco. A rubisco molecule weighs about 550 000\u00A0grams per mole and carries eight active sites, and each site, saturated with carbon dioxide, turns over about three times a second. Work out the most carbon dioxide that square metre could fix each second. The leaf in full sun actually fixes about 25\u00A0micromoles per square metre per second: account for the gap, and say what it tells you about why a leaf holds so much rubisco.',
    rubric: [
      '2 ÷ 550 000 is about 3.6\u00A0micromoles of rubisco molecules, and eight sites each make about 29\u00A0micromoles of active sites',
      'at three turns a second each, the most that square metre could fix is about 87\u00A0micromoles of carbon dioxide a second',
      'the leaf fixes 25, under a third of that: its rubisco works far below its maximum',
      'the carbon dioxide inside a leaf, no more than the air supplies and drawn down further by the enzyme itself, is well below what saturates rubisco',
      'oxygen takes some of the turns, and each of those fixes no carbon and costs some back through the salvage route',
      'not every site is switched on at any one moment, which lowers the rate again',
      'a plant cannot raise the rate of each molecule, so it raises the number of molecules: that is why rubisco is a third to a half of a C<sub>3</sub> leaf\'s soluble protein',
    ],
    explain: 'The arithmetic turns "a slow enzyme" into a number a leaf has to live with. Even a generous leafful of rubisco, working flat out, could fix only a few times what the leaf manages, and in the air a leaf actually has, the enzyme runs at under a third of that, short of carbon dioxide and losing turns to oxygen. The only lever a C<sub>3</sub> plant has is quantity, and it pulls it hard.',
  },

  {
    id: 'i-atmosphere-changed-1',
    objective: 'atmosphere-changed',
    kind: 'mcq',
    question: 'A student says: "Rubisco proves evolution makes bad designs\u00A0— three billion years, and it still cannot tell carbon dioxide from oxygen." What is the best reply?',
    options: [
      { text: 'It arose in air with no free oxygen, so there was nothing to confuse; the oxygen came later, from photosynthesis, and speed and selectivity seem to trade off.', correct: true },
      { text: 'Rubisco is perfectly selective; its oxygen reaction is a separate activity, carried out on purpose, that plants need for photorespiration.',
        why: 'Rescues the enzyme by denying the problem. The oxygen reaction is the same active site making a mistake it cannot avoid, and its cost to a C<sub>3</sub> plant is large and measured: a fifth to a third of the carbon it could have fixed.' },
      { text: 'Given three billion years, selection must by now have made rubisco as good as any enzyme could be, so it cannot really be called a bad design at all.',
        why: 'Replaces one wrong idea with its mirror image. Selection is not an engineer that reaches the best design; it acts on the variation that arises, in the conditions of the moment, and it cannot push a property past a limit the chemistry sets\u00A0— which is what the speed-against-selectivity pattern suggests.' },
      { text: 'The student is right: plants would long ago have replaced rubisco with something better if any better enzyme had ever been available to them.',
        why: 'Treats the absence of a replacement as proof that one would be better. No rubisco has been found that is both fast and selective, in any organism compared, and the plants that did something about the problem, in Section\u00A06.8, kept the enzyme and changed the air around it.' },
    ],
    explain: 'Carbon fixation of this kind is on the order of three billion years old, and it arose in air rich in carbon dioxide with essentially no free oxygen: nothing to confuse, and no selection on telling the two apart. The oxygen came later, from the cyanobacteria of Section\u00A03.5 splitting water, and selection acts through the environment of the moment, never the one to come. Since then, comparing rubiscos across organisms, the best discriminators are the slowest\u00A0— a trade-off whose strength is argued over, but which suggests there may be no better version to reach.',
  },
  {
    id: 'i-atmosphere-changed-2',
    objective: 'atmosphere-changed',
    kind: 'free',
    question: 'Give Section\u00A06.7\'s first two answers to why rubisco\'s confusion has not been fixed. Explain why an atmosphere that changed, rather than a fault in the enzyme, is the cause, using Darwin\'s argument as Section\u00A01.7 states it; say what comparing many organisms\' rubiscos shows; and say how firm each answer is.',
    rubric: [
      'carbon fixation by rubisco is very old\u00A0— on the order of three billion years\u00A0— and arose in air with a great deal of carbon dioxide and essentially no free oxygen',
      'in that air there was nothing to confuse, so no selection at all on telling the two gases apart',
      'the oxygen came later, put there over a couple of billion years by cyanobacteria splitting water\u00A0— the ancestors of the chloroplast',
      'selection favours inherited traits that suit the environment organisms live in now, never one their descendants will face, so it could not improve a property that was costing nothing',
      'comparing rubiscos across organisms, the best discriminators are the slowest and the fastest discriminate worst',
      'if that trade-off is a real constraint of the chemistry, no version is both fast and selective, and each organism sits somewhere on the same curve, placed by its conditions',
      'the first answer is firm; how tight the trade-off is has been reopened by recent work, so there is evidence of a constraint and argument about its strength',
    ],
    explain: 'The first answer is a statement about history and the second about chemistry, and together they turn a supposed design fault into a consequence. Rubisco\'s problem was created by its own success: the oxygen it confuses was put into the air by the photosynthesis it makes possible.',
  },
  {
    id: 'i-atmosphere-changed-3',
    objective: 'atmosphere-changed',
    kind: 'mcq',
    question: 'Cyanobacteria pump bicarbonate into the cell and release it as carbon dioxide inside small protein shells, carboxysomes, where their rubisco works. Their rubisco turns over several times faster than a wheat plant\'s but tells the two gases apart only about half as well. How does that fit Section\u00A06.7\'s account of why rubisco has not been improved?',
    options: [
      { text: 'It shows that cyanobacteria still have a primitive rubisco, which the plants that came later have since improved on by natural selection.',
        why: 'Reads evolution as a ladder with plants at the top. Cyanobacteria have been evolving as long as plants have, and the chloroplast\'s rubisco came from a cyanobacterium in the first place; the two enzymes differ because they work in different conditions, not because one lineage is further on.' },
      { text: 'It shows selectivity is not worth having, and that plants could grow faster simply by swapping the cyanobacterial enzyme in for their own.',
        why: 'Forgets the shell. The fast enzyme gets away with poor selectivity because it works in concentrated carbon dioxide; put into a leaf, which has only the air\'s carbon dioxide, it would take oxygen about twice as often as the plant\'s own.' },
      { text: 'Where carbon dioxide is concentrated, oxygen seldom competes, so speed pays and care does not: it sits at the trade-off\'s fast end.', correct: true },
      { text: 'It shows the trade-off is false, since an enzyme can be fast in one organism and slow in another although the chemistry of the two is the same.',
        why: 'Reads the variation as evidence against the constraint, when it is the constraint\'s pattern: across organisms the fast enzymes tend to be the poor discriminators and the good discriminators slow. A fast, unselective rubisco inside a shell of carbon dioxide is what the trade-off, if it holds, predicts.' },
    ],
    explain: 'Section\u00A06.7\'s second answer is a trade-off: across organisms, the rubiscos that tell the two gases apart best tend to be the slowest, though how tight the trade-off is has been reopened. Inside a carboxysome, full of concentrated carbon dioxide, oxygen seldom gets a turn, so discrimination buys little and speed buys a great deal, and the cyanobacterial enzyme sits at the fast, careless end of the curve. A plant\'s rubisco, facing the air\'s carbon dioxide, sits further towards the careful, slow end. Neither is primitive or improved: each is placed by what it faces, as selection acting on present conditions would place it.',
  },

  // ============================================================================
  // 6.8 Two answers to the same problem
  // ============================================================================

  {
    id: 'i-stomatal-tradeoff-1',
    objective: 'stomatal-tradeoff',
    kind: 'mcq',
    question: 'A tomato plant in a greenhouse goes unwatered on a hot, bright day, and by noon its stomata are nearly shut. What happens to the gases inside its leaves, and what does that do to rubisco?',
    options: [
      { text: 'Both carbon dioxide and oxygen fall, because with the pores shut no gas of any kind can get in, so rubisco slows down evenly all round.',
        why: 'Forgets that oxygen is made inside the leaf. With the pores shut, the light reactions go on adding oxygen that cannot leave, so it rises while carbon dioxide falls.' },
      { text: 'Neither changes, because shutting the pores stops the exchange of gases in both directions, so rubisco simply carries on as before.',
        why: 'Treats the leaf as a sealed jar in which nothing is happening. Inside, rubisco goes on using carbon dioxide and the light reactions go on making oxygen, so closing the door lets both concentrations drift, in opposite directions.' },
      { text: 'Carbon dioxide falls as rubisco uses it and oxygen rises as the light reactions make it, so rubisco takes oxygen more often.', correct: true },
      { text: 'Carbon dioxide rises, because the leaf\'s own respiration keeps adding it and none of it can escape, so rubisco speeds up instead.',
        why: 'Respiration does release carbon dioxide inside the leaf, but in bright light rubisco fixes it far faster than respiration makes it, so the internal concentration falls.' },
    ],
    explain: 'The problem a leaf cannot avoid is that one pore admits carbon dioxide and loses water. Shutting it saves the water and does worse than merely starve the leaf: rubisco keeps drawing the carbon dioxide down while the light reactions keep adding oxygen, and falling carbon dioxide with rising oxygen is exactly what makes rubisco take the wrong gas. The defence against drying is the action that causes photorespiration.',
  },
  {
    id: 'i-stomatal-tradeoff-2',
    objective: 'stomatal-tradeoff',
    kind: 'free',
    question: 'State the problem a leaf cannot avoid. Say what closing its stomata does to the carbon dioxide and the oxygen inside it and why each moves the way it does, and what those two changes do to rubisco. Then give the three separate routes by which heat makes all of it worse.',
    rubric: [
      'a leaf must open its stomata to take in carbon dioxide, and the same pores lose water far faster than carbon dioxide comes in; it cannot have one without the other',
      'closing them saves water but cuts off the supply of carbon dioxide',
      'inside, rubisco goes on using carbon dioxide, so its concentration falls',
      'the light reactions go on splitting water and making oxygen, which can no longer leave, so its concentration rises',
      'falling carbon dioxide and rising oxygen are exactly the conditions that make rubisco take the wrong gas: the defence against drying causes photorespiration',
      'heat makes it worse three ways: a hot plant must close its stomata more of the time; as water warms, carbon dioxide becomes less soluble in it faster than oxygen does; and rubisco\'s own preference for carbon dioxide falls as it warms',
    ],
    explain: 'This is why the problem is a problem and not merely a cost: the leaf\'s only defence against one danger walks it into the other, and hot, dry places tighten both at once.',
  },
  {
    id: 'i-stomatal-tradeoff-3',
    objective: 'stomatal-tradeoff',
    kind: 'mcq',
    question: 'Most plants close their stomata every night, and closing them at a hot noon makes rubisco take oxygen far more often. Why does closing them at night not do the same?',
    options: [
      { text: 'In the dark rubisco is off and no oxygen is being made, so nothing draws carbon dioxide down or builds oxygen up behind the shut pores.', correct: true },
      { text: 'Rubisco takes oxygen only when the leaf is warm, above about 30\u00A0°C, and the night air is too cool for that to happen.',
        why: 'Makes heat a switch rather than a multiplier. Heat makes rubisco\'s mistake commoner, but it happens at any temperature in the light, if less often in the cool. What stops it at night is that rubisco is not working at all.' },
      { text: 'It does the same, which is why a plant gives off carbon dioxide all through the night, photorespiring in the dark.',
        why: 'Takes the plant\'s night-time loss of carbon for photorespiration. What a plant gives off at night comes from its mitochondria\'s ordinary respiration; photorespiration needs rubisco taking oxygen, and in the dark rubisco is switched off.' },
      { text: 'At night the leaf\'s own respiration uses up the oxygen trapped behind the shut pores, leaving none there for rubisco to take.',
        why: 'Underrates how much oxygen there is. Air holds about five hundred oxygens for every carbon dioxide, and even through nearly shut pores the little a leaf respires is replaced with hardly any fall inside; besides, in the dark rubisco takes neither gas.' },
    ],
    explain: 'Shut pores cause photorespiration only because of what goes on behind them in the light: rubisco keeps using carbon dioxide and the light reactions keep adding oxygen, so the ratio inside slides towards oxygen. In the dark neither happens\u00A0— the Calvin cycle\'s enzymes are switched off and no water is being split\u00A0— so shut pores leave the gases inside much as they were, apart from the carbon dioxide respiration adds. The trade-off is a daytime problem, and it bites hardest at a hot noon, when the light is strongest and water dearest.',
  },

  {
    id: 'i-c4-mechanism-1',
    objective: 'c4-mechanism',
    kind: 'mcq',
    question: 'In a C<sub>4</sub> leaf, where does each enzyme sit, and what travels between them?',
    options: [
      { text: 'Rubisco sits in the mesophyll and fixes carbon dioxide first; PEP carboxylase, in the bundle sheath, fixes whatever rubisco missed.',
        why: 'Swaps the two enzymes\' places and their order. PEP carboxylase fixes carbon first, in the mesophyll, and rubisco is kept in the bundle sheath and nowhere else, which is the whole geometry of the mechanism.' },
      { text: 'PEP carboxylase fixes bicarbonate in the mesophyll into a four-carbon acid, which moves into the bundle sheath and frees carbon dioxide beside rubisco.', correct: true },
      { text: 'Both enzymes sit together in every mesophyll cell, and the four-carbon acid is stored in the vacuole until the following day.',
        why: 'Describes CAM, which separates the two steps in time. A C<sub>4</sub> plant separates them in space, between two kinds of cell, and hands the acid from one to the other within seconds.' },
      { text: 'PEP carboxylase in the mesophyll fixes bicarbonate, and the carbon dioxide it collects drifts to rubisco as a gas through the air spaces between the cells.',
        why: 'Gas in the air spaces would go wherever its concentration was lowest, including back out of the leaf. Carrying the carbon as a four-carbon acid, through plasmodesmata into cells whose walls leak slowly, is what lets it be concentrated.' },
    ],
    explain: 'PEP carboxylase in the mesophyll takes bicarbonate and makes a four-carbon acid. The acid travels through the plasmodesmata of Section\u00A03.7 into a bundle-sheath cell around the vein, where it is decarboxylated right beside rubisco, and the bundle-sheath walls leak slowly enough for carbon dioxide to build to something like ten times the air\'s concentration. The three-carbon remainder returns to the mesophyll and is made back into PEP, at two ATP for every carbon dioxide delivered.',
  },
  {
    id: 'i-c4-mechanism-2',
    objective: 'c4-mechanism',
    kind: 'free',
    question: 'Explain how a C<sub>4</sub> plant concentrates carbon dioxide around rubisco. Name the enzyme that fixes carbon first and what it actually takes, say why it cannot make rubisco\'s mistake, trace the carbon from the mesophyll to the bundle sheath and back, and say what the arrangement costs.',
    rubric: [
      'PEP carboxylase, in the mesophyll, attaches carbon to phosphoenolpyruvate, making a four-carbon acid',
      'it does not take carbon dioxide at all but bicarbonate, the charged ion that carbon dioxide becomes in water',
      'oxygen resembles bicarbonate in nothing\u00A0— bicarbonate is charged and oxygen is not\u00A0— so the enzyme has no confusion to make',
      'the four-carbon acid moves through plasmodesmata into the bundle-sheath cells around the vein, where it is decarboxylated, releasing carbon dioxide beside rubisco, which is kept there and nowhere else',
      'the bundle-sheath walls leak slowly, so carbon dioxide builds to something like ten times the air\'s concentration, and oxygenation almost stops',
      'the three-carbon remainder returns to the mesophyll and is made back into PEP: two extra ATP for every carbon dioxide delivered, five per carbon instead of three\u00A0— two-thirds more',
      'it is a pump: ATP spent to concentrate a substrate, as Section\u00A04.6\'s pump spends ATP to concentrate an ion',
    ],
    explain: 'The whole mechanism rests on the choice of substrate. Rubisco\'s difficulty is two small, uncharged molecules a pocket cannot tell apart; PEP carboxylase sidesteps it by taking a charged ion instead, and the concentrating that follows lets rubisco, downstream, work where its own mistake is rare.',
  },
  {
    id: 'i-c4-mechanism-3',
    objective: 'c4-mechanism',
    kind: 'mcq',
    question: 'Suppose a C<sub>4</sub> plant\'s bundle-sheath cells had walls as leaky to carbon dioxide as those of its mesophyll cells. What would happen?',
    options: [
      { text: 'Nothing much: the carbon arrives in the bundle sheath as a four-carbon acid, so whatever its walls are like, the same amount of carbon reaches rubisco there.',
        why: 'Thinks delivery alone does the concentrating. The acid brings carbon in, but it is released there as carbon dioxide, a small uncharged gas that leaves by any route open to it; the slow-leaking wall is what lets it build up.' },
      { text: 'More carbon would be fixed, since carbon dioxide from the air spaces could now reach rubisco directly as well as through the acid.',
        why: 'Gets the direction of the leak wrong. The bundle sheath holds carbon dioxide at about ten times the air\'s concentration, so through a leaky wall it flows out, down its gradient, not in.' },
      { text: 'Nothing would be lost, since the PEP carboxylase in the neighbouring mesophyll cells would catch any carbon dioxide leaking out and fix it for good.',
        why: 'Forgets what PEP carboxylase\'s fixing is for. It only carries carbon: whatever it recaptures has to be delivered again, and each delivery costs the pump another two ATP, so catching a leak means paying twice for the same carbon.' },
      { text: 'Much of the released carbon dioxide would leak out, so the pump\'s ATP would buy carbon that escapes, and rubisco would take oxygen more often.', correct: true },
    ],
    explain: 'A C<sub>4</sub> leaf concentrates carbon dioxide the way a pump concentrates an ion: it spends ATP to move carbon in, and it needs a barrier to keep it there. The four-carbon acid delivers carbon to the bundle sheath, but it is released there as carbon dioxide, which leaves by any route open to it; the bundle-sheath wall leaks slowly, so the gas builds to something like ten times the air\'s concentration. Make the wall leaky and the gas flows back out nearly as fast as it is delivered: the two extra ATP per carbon buy less and less, rubisco sees less of a concentration, and oxygenation returns. Some leak is unavoidable even in a real C<sub>4</sub> leaf, and it is part of what the pump costs.',
  },

  {
    id: 'i-cam-mechanism-1',
    objective: 'cam-mechanism',
    kind: 'mcq',
    question: 'Leaves of the common ice plant, well watered, are no more acid at dawn than at dusk. After two weeks of drought or salty water, they are much more acid at dawn than at dusk. What has happened?',
    options: [
      { text: 'The plant is beginning to die of drought, and the extra acid comes from its tissues breaking down as they dry out.',
        why: 'Reads the acid as damage. It builds up overnight and is used up the next day, over and over, which is a cycle and not a breakdown; and the plant is taking in carbon while its leaves sour.' },
      { text: 'It has switched to C<sub>4</sub>, fixing carbon in one kind of cell and handing it as an acid to another kind of cell.',
        why: 'A C<sub>4</sub> plant does not store acid overnight: its four-carbon acid is made and spent within seconds, in daylight, handed from cell to cell. A swing in acidity between dawn and dusk is the signature of a separation in time.' },
      { text: 'Its stomata now stay shut both day and night, and the acid is carbon dioxide from the plant\'s own respiration that has been trapped inside.',
        why: 'A plant that never opened its stomata could take in no carbon at all. The acid that builds up overnight is mostly carbon from the air, taken in while the stomata are open in the cool of the night.' },
      { text: 'It has switched to CAM: its stomata open at night, the carbon waits as acid in its vacuoles, and by day the acid is spent behind shut stomata.', correct: true },
    ],
    explain: 'CAM separates the two steps in time. The stomata open at night, when the water lost per carbon gained is a fraction of the noon figure; PEP carboxylase takes the carbon in as bicarbonate and makes a four-carbon acid, which is pumped into the vacuole; by day the stomata shut, the acid comes back out and is decarboxylated, and rubisco works behind a closed door. A plant that switches to it when water runs short, and back when water returns, is showing that CAM is a response to a problem.',
  },
  {
    id: 'i-cam-mechanism-2',
    objective: 'cam-mechanism',
    kind: 'free',
    question: 'Explain how a CAM plant separates the two steps of carbon fixation in time. Say when its stomata open and why then, which enzyme takes the carbon in and in what form, where the night\'s carbon is kept and as what, what happens to it the next day, and what limits how much the plant can fix.',
    rubric: [
      'the stomata open at night, when the air is cool and damp and the water lost per carbon gained is a fraction of what it would be at noon',
      'PEP carboxylase takes the carbon in as bicarbonate and makes a four-carbon acid, as in a C<sub>4</sub> plant',
      'the acid is pumped into the vacuole and held there until morning, so the plant is measurably sour at dawn and not at dusk',
      'by day the stomata are shut; the acid comes back out and is decarboxylated, and rubisco works on the released carbon dioxide behind a closed door, at a concentration at which oxygen is no competition',
      'the same two steps as C<sub>4</sub>, separated in time instead of in space',
      'the vacuole is the night\'s ration: the plant cannot fix more carbon in a day than it could store as acid in a night',
      'which is why CAM plants grow slowly and why so many of them are succulent\u00A0— a big vacuole is the point',
    ],
    explain: 'CAM buys its water economy with a ceiling. Its stomata are open only when losing water is cheap, and everything it fixes by day it had to fit into its vacuoles the night before.',
  },
  {
    id: 'i-cam-mechanism-3',
    objective: 'cam-mechanism',
    kind: 'mcq',
    question: 'A cactus is kept in air with no carbon dioxide during the nights only. By day it has ordinary air, and its stomata stay shut by day as usual. What happens to it?',
    options: [
      { text: 'It fixes carbon as usual by day, because the Calvin cycle runs in the light, and the light has not changed.',
        why: 'Remembers that the cycle needs light and forgets that it also needs carbon. By day the cactus\'s stomata are shut, so the only carbon its rubisco can work on is what the night\'s acid releases.' },
      { text: 'Its stems turn acid overnight just the same, since the acid a CAM plant stores away is made from its own sugar, not from the carbon of the air.',
        why: 'Misses what the acid is. PEP carboxylase adds carbon from the air, taken in as bicarbonate, to a molecule the plant supplies; the acid is the night\'s carbon, and without carbon dioxide at night far less of it forms.' },
      { text: 'It gains almost no carbon: little acid builds up overnight, and by day, behind shut stomata, rubisco has only that store to work on.', correct: true },
      { text: 'It gains carbon as usual: at night its rubisco can fix the carbon dioxide the plant\'s own respiration releases.',
        why: 'Puts rubisco to work at night, when in a CAM plant it is PEP carboxylase that takes the carbon in and rubisco works by day. And carbon the plant respires was the plant\'s already: fixing it again recovers a loss but gains nothing.' },
    ],
    explain: 'CAM separates the two steps in time, so the day depends on the night. At night the stomata open and PEP carboxylase takes the air\'s carbon in as bicarbonate, making a four-carbon acid that is stored in the vacuole; by day the stomata shut and the acid gives up its carbon dioxide to rubisco. Take away the night\'s carbon dioxide and the vacuole stays nearly empty\u00A0— only the plant\'s own respiration adds to it, which recovers carbon rather than gaining any\u00A0— and the next day the Calvin cycle has light, ATP and NADPH and almost nothing to fix.',
  },

  {
    id: 'i-choose-strategy-1',
    objective: 'choose-strategy',
    kind: 'mcq',
    question: 'Across the grasslands of North America, the share of grass species that are C<sub>4</sub> falls steadily from south to north, and it follows the warmth of summer nights more closely than it follows rainfall or sunshine. Which explanation fits best?',
    options: [
      { text: 'C<sub>4</sub>\'s two extra ATP per carbon buy most where photorespiration costs most, in the heat; where summers are cool, C<sub>3</sub>, spending nothing extra, wins.', correct: true },
      { text: 'C<sub>4</sub> grasses need much more water than C<sub>3</sub> grasses do, so they are held back wherever the summer rain falls short of what they need.',
        why: 'Has the water accounts backwards: a C<sub>4</sub> plant loses roughly half as much water per gram of dry matter as a C<sub>3</sub> plant, 250–\u2060300\u00A0grams against 500–\u2060600. And rainfall was the weaker predictor of the two.' },
      { text: 'C<sub>4</sub> is simply the more advanced design and is still spreading north, and given enough time it will replace the C<sub>3</sub> grasses everywhere that they now grow.',
        why: 'The chapter\'s caution about its own table: the last row is not a ranking. C<sub>3</sub> is not a failed C<sub>4</sub>; under cool conditions doing nothing extra is the better answer, which is why most plants do it.' },
      { text: 'C<sub>4</sub> grasses need far more sunlight than C<sub>3</sub> grasses do, and the northern summers have less of it to give, with their lower sun.',
        why: 'Light matters to how much either kind can fix, but it was temperature the share followed most closely. What C<sub>4</sub> buys is protection from photorespiration, and photorespiration is driven by heat.' },
    ],
    explain: 'Whether two extra ATP per carbon are worth paying depends on what photorespiration would otherwise cost, and that rises with temperature: heat shuts stomata, shifts the dissolved ratio against carbon dioxide and lowers rubisco\'s preference. Where summers are warm, C<sub>4</sub> grasses win; where they are cool, the plain design wins. A survey of North America\'s grasses in the 1970s found the C<sub>4</sub> share followed summer night temperatures most closely of all.',
  },
  {
    id: 'i-choose-strategy-2',
    objective: 'choose-strategy',
    kind: 'free',
    question: 'For each of three places\u00A0— an upland pasture in Scotland, with cool, damp, cloudy summers; a savanna in East Africa, hot and bright with a long dry season; and a rocky desert in Arizona, with very hot days, cold nights and rare rain\u00A0— predict which of C<sub>3</sub>, C<sub>4</sub> and CAM will do best. Justify each prediction by what the strategy costs in ATP and in water, and what it buys.',
    rubric: [
      'C<sub>3</sub>: no extra ATP\u00A0— three per carbon dioxide\u00A0— and the most water, roughly 500–\u2060600\u00A0grams per gram of dry matter; it wins where photorespiration is slight, cool, damp and dim: the Scottish pasture',
      'C<sub>4</sub>: two extra ATP per carbon dioxide, five in all, two-thirds more than C<sub>3</sub>; roughly half the water, 250–\u2060300\u00A0grams per gram; it wins where heat and bright light would make photorespiration expensive: the savanna',
      'CAM: about two extra ATP per carbon and the least water, roughly 50–\u2060150\u00A0grams per gram, because its stomata open only in the cool of the night; it wins where water is scarcest: the desert',
      'CAM\'s ceiling is its vacuole, so it grows slowly, and it loses to C<sub>4</sub> wherever there is water enough to open by day',
      'the ranking is not fixed: each strategy wins in its own climate, and C<sub>3</sub> is not a failed C<sub>4</sub>',
      'the water figures are the least reliable numbers in the chapter: sources disagree by a factor of two or three',
    ],
    explain: 'Each strategy pays in one currency to save another. C<sub>3</sub> pays in carbon, lost to photorespiration; C<sub>4</sub> in ATP; CAM in growth, capped by its vacuole. The climate decides which currency is cheapest.',
  },
  {
    id: 'i-choose-strategy-3',
    objective: 'choose-strategy',
    kind: 'mcq',
    question: 'C<sub>4</sub> photosynthesis has arisen independently more than sixty times, in grasses, sedges and several other families. The oldest of these origins are about thirty million years old, from a time when the air\'s carbon dioxide had fallen far below its earlier levels. Why would falling carbon dioxide favour C<sub>4</sub>?',
    options: [
      { text: 'Less carbon dioxide against the same oxygen made rubisco err more in every C<sub>3</sub> leaf, most in the heat, so C<sub>4</sub>\'s two extra ATP bought more.', correct: true },
      { text: 'C<sub>4</sub> is a better design than C<sub>3</sub>, and one so hard to invent that it took most of the long history of land plants to appear at all.',
        why: 'Treats C<sub>4</sub> as an advance that took time to reach. Something invented more than sixty separate times is not hard to invent; it spread when conditions made it pay, and where they still do not, in cool, damp places, C<sub>3</sub> wins today.' },
      { text: 'Rubisco stops working at low carbon dioxide, so plants needed PEP carboxylase to take the fixing over from it.',
        why: 'Gives PEP carboxylase rubisco\'s job. In a C<sub>4</sub> plant every carbon that ends up in sugar still passes through rubisco; PEP carboxylase only carries the carbon to it and concentrates it there.' },
      { text: 'Falling carbon dioxide cooled the Earth, and C<sub>4</sub> plants, with their extra machinery, do best where the climate is cool.',
        why: 'Has the climate backwards. C<sub>4</sub> wins in heat, where photorespiration is costly; cooling on its own would favour C<sub>3</sub>. What favoured C<sub>4</sub> was the ratio the enzyme saw, which shifted towards oxygen as carbon dioxide fell.' },
    ],
    explain: 'Whether two extra ATP per carbon are worth paying depends on how often rubisco errs, and that depends on the ratio of oxygen to carbon dioxide at the enzyme. For much of the history of land plants the air held far more carbon dioxide than it does now, rubisco\'s mistake was rarer, and a pump would have been ATP spent for little. As carbon dioxide fell, the mistake grew commoner in every C<sub>3</sub> leaf, most of all in hot, bright, dry places, and a carbon pump began to pay there, so often that it evolved over and over, in family after family. Nothing about C<sub>4</sub> is harder than C<sub>3</sub>; the air changed what each costs.',
  },

  {
    id: 'i-diagnose-photosynthesis-1',
    objective: 'diagnose-photosynthesis',
    kind: 'mcq',
    question: 'A mutant plant has paler leaves than the normal plant. In dim light it photosynthesises far more slowly than the normal plant; in full sunlight it keeps up. Which part of photosynthesis is affected?',
    options: [
      { text: 'Moving the electrons: a slower chain of carriers between the two photosystems holds back the rate of the whole process at every light level.',
        why: 'A slower chain would show where electrons arrive fastest\u00A0— in full sun\u00A0— and hardly at all in dim light, where the chain has capacity to spare. This mutant shows the opposite pattern.' },
      { text: 'The carbon reactions: a paler leaf has less rubisco in it, so it has less enzyme to fix carbon dioxide with.',
        why: 'Rubisco is colourless, so a leaf\'s colour says nothing about it; and a shortage of the cycle\'s enzymes would limit the rate in bright light, when the cycle is the bottleneck, not in dim light, when it is idling.' },
      { text: 'Catching the light: fewer pigments feed each centre, so the centres idle when photons are scarce, while in full sun a small antenna is enough.', correct: true },
      { text: 'Holding the gradient: in dim light too few protons are pumped to build a gradient that can drive ATP synthase at all.',
        why: 'Normal plants build a working gradient in the same dim light; what differs in the mutant is how many photons reach its reaction centres, which is the antenna\'s job\u00A0— and its paler leaves say its antenna is smaller.' },
    ],
    explain: 'The antenna exists because a single chlorophyll is struck only a few times a second while a reaction centre can work hundreds of times a second. Cut the antenna and, in dim light, each centre waits for photons; in full sun there are photons to spare and a small antenna still keeps the centre busy. A defect further along\u00A0— in the chain, the gradient or the stroma\u00A0— shows the opposite pattern: invisible in dim light, where those parts idle, and limiting in bright light.',
  },
  {
    id: 'i-diagnose-photosynthesis-2',
    objective: 'diagnose-photosynthesis',
    kind: 'mcq',
    question: 'A leaf in bright light is suddenly given air with no carbon dioxide in it. Within a minute, NADPH builds up in its stroma and the flow of electrons along its chain slows, though nothing has been done to its pigments or its membranes. Which part of photosynthesis was affected first?',
    options: [
      { text: 'Moving the electrons, since it is the flow of electrons along the chain between the photosystems that was measured to slow down.',
        why: 'Names the symptom as the cause. The chain slowed, but nothing was done to it: it slowed because NADP<sup>+</sup>, its final acceptor, ran short when the cycle stopped spending NADPH. Look for the part whose supply changed.' },
      { text: 'The carbon reactions: without carbon dioxide the cycle stops spending NADPH, NADP<sup>+</sup> runs short, and the chain slows with nowhere to send electrons.', correct: true },
      { text: 'Catching the light, since the leaf can no longer make use of all the light its pigments go on absorbing.',
        why: 'The leaf absorbs as much light as ever; what changed is what happens after the light is caught. Catching the light is the diagnosis when absorption, or delivery to the reaction centres, changes.' },
      { text: 'Holding the gradient, since ATP synthase stops turning as soon as the ATP it makes is no longer being used, and the gradient then backs up.',
        why: 'The gradient does build up as the cycle stops spending ATP, and slows the chain further\u00A0— but that is a consequence too. Nothing about the membrane changed; the first thing that changed was the carbon dioxide.' },
    ],
    explain: 'Look for the first thing that changed, not the first symptom. Take the carbon dioxide away and the stroma stops spending NADPH and ATP; NADP<sup>+</sup> and ADP run short; the chain, with nowhere to deliver its electrons, slows; and the unspent gradient builds and slows it further. Every part that feeds the stroma backs up and looks affected, but only one was touched.',
  },
  {
    id: 'i-diagnose-photosynthesis-3',
    objective: 'diagnose-photosynthesis',
    kind: 'free',
    question: 'A plant\'s photosynthesis has fallen. For each of the four parts\u00A0— catching the light, moving the electrons, holding the gradient, and the carbon reactions in the stroma\u00A0— describe an observation that would point to that part and not to the others, and say why it points there.',
    rubric: [
      'catching the light: a deficit that is large in dim light and vanishes in full sun, or light that a pigment absorbs but that drives nothing\u00A0— the reaction centres are short of excitations, not of anything downstream',
      'moving the electrons: carriers on one side of a point full and on the other side empty, with oxygen and NADPH stopping together; a block just after photosystem\u00a0II also makes fluorescence rise, because the excitations have nowhere to go',
      'holding the gradient: electron flow speeding up while ATP falls and the pH difference collapses\u00A0— the pattern of a leak, with NADPH still made while the ATP stops',
      'the carbon reactions: a change that follows the carbon dioxide or oxygen around the leaf\u00A0— rescued by enriched carbon dioxide, worse on a hot day\u00A0— or an intermediate of the cycle piling up while the acceptor drains',
      'the general rule: look for the first thing that changed, not the first symptom; parts that feed a stopped part back up, and parts that depend on it run empty',
      'and check the light: a defect in catching light costs most when light is scarce, a defect in the capacity of the chain or the cycle costs most when light is plentiful',
    ],
    explain: 'Every part of photosynthesis is joined to every other, so a fault anywhere eventually shows everywhere. What tells them apart is the pattern: which carriers fill and which empty, which way the electron rate moves, and whether the fault follows the light, the membrane or the air.',
  },
];
