// Chapter 7's review item bank: the questions the spaced-repetition queue draws on
// (docs/design/adaptive.md). Every item names exactly one objective from objectives.js, and each of the
// chapter's forty objectives has at least three. None is a `task`: the chapter ships with four of its
// eight figures and no figure tasks (see below), so every item is written, and none needs a figure.
// The items for one objective differ in what they demand — say it, work it on a case the chapter never
// mentions, or set it out in writing — so a reader who has memorised one still has to think about the
// others.
//
// The `why` on a wrong option is the working part of this file. It says what choosing that option
// reveals about the reader's thinking, so the agent round can turn "wrong three times" into a named
// misconception and teach against it. A distractor that is merely false teaches nothing.
//
// Six ideas in this chapter are the ones readers arrive with, and the distractors are built out of them
// rather than out of plausible-sounding falsehoods:
//
//   "The electron transport chain makes ATP." It makes a gradient: none of its complexes makes ATP, and
//     the ATP is made by a separate machine that spends what the chain built.
//   "The oxygen you breathe in comes out as the carbon dioxide you breathe out." As much carbon as the
//     glucose brought in has left as carbon dioxide by the time its electrons reach oxygen, though not
//     the same atoms; the oxygen goes into water, at complex IV, in a place the carbon never reaches.
//   "Fermentation produces energy without oxygen." It regenerates NAD+. The two ATP are glycolysis's,
//     and in the lactate and alcohol fermentations the fermentation step itself makes none.
//   "Without oxygen, the ATP runs out." What runs out first, within seconds, is NAD+: the carrier pool is
//     a fraction of a millimole per litre against about five of ATP.
//   "A glucose yields 38 ATP." About 30 to 32, because the protons per ATP do not divide evenly into
//     the protons per carrier, and the cytosolic pair is worth what its shuttle makes it worth.
//   "Lactic acid is what makes a muscle ache two days later." Lactate is a fuel, cleared within an hour
//     or so; the ache is damage and inflammation, worst after contractions that make little lactate.
//
// Others in the same family, each of which a distractor below encodes: that every stage of respiration
// pays its way in ATP; that respiration is burning slowed down by enzymes; that oxygen is what the chain
// is for; that only a chain can build a proton gradient; that a blocked chain and a leaking membrane
// look alike on an oxygen trace; that anaerobic means fermenting; that a shuttle is a fare paid to carry
// NADH across a membrane; that a regenerated intermediate is a kind of enzyme; that a bigger
// mitochondrion would do the work of a more folded one; and that more fuel can refill a drained cycle.
//
// Formats:
//   mcq  — { options: [{ text, correct } | { text, why }] }, exactly one correct.
//   task — { figure, goal, expect }, graded against that figure's own describe(). None; see below.
//   free — { rubric: [...] }, the points a good answer makes.
// This file holds 120 items: 77 multiple choices and 43 free responses.
//
// Position and length. The correct option is not always first and not usually the longest, because an
// authored order is what a reader sees on any surface that does not shuffle, and a reader who has learnt
// "pick A" or "pick the longest" should do no better here than chance. Measured on this file as written,
// option text with its markup stripped: the correct option is A in 19, B in 19, C in 19 and D in 20 of
// the 77 multiple choices; it is strictly the longest in 18 (23%) and strictly the shortest in 18 (23%);
// and on average it is 1.7 characters longer than the options beside it. A distractor that grows or a
// correct option that shrinks moves these numbers, so re-measure after editing an option.
//
// Bound: every item is answerable from this chapter and the sections it cites. Where a question needs a
// number the chapter does not give, the question gives it, and it was checked against the source named:
//   pyruvate/lactate −0.19 V and oxaloacetate/malate −0.17 V (i-redox-ladder-1, -2): the standard
//     tables of biochemical reduction potentials, which give −0.185 and −0.166.
//   trimethylamine oxide/trimethylamine +0.13 V (i-anaerobic-respiration-1): Bueno, Pinedo & Cava,
//     Front. Microbiol. 11:739 (2020), Table 1.
//   stearate's eighteen carbons (i-other-fuels-1) is its formula; the rest of that item is the chapter's
//     own palmitate arithmetic applied to it.
// Ten cases the chapter never mentions rest on a fact from outside it, each checked:
//   hummingbird flight muscle's mitochondria (i-cristae-area-2): Suarez et al., PNAS 88:4870 (1991).
//   a fermenting bacterium's ATP synthase run as a pump (i-synthase-reversible-1): Kobayashi, J. Biol.
//     Chem. 260:72 (1985).
//   sodium-driven ATP synthases (i-chemiosmosis-principle-2): Dimroth, Biochim. Biophys. Acta 1318:11
//     (1997); Meier et al., Science 308:659 (2005).
//   mice without brown fat's uncoupling protein (i-uncoupling-on-purpose-1): Enerbäck et al., Nature
//     387:90 (1997).
//   Luft's patient (i-diagnose-respiration-1): Luft et al., J. Clin. Invest. 41:1776 (1962).
//   Spirulina's fifteen-subunit ring (i-synthase-is-a-motor-3): Pogoryelov et al., EMBO Rep. 6:1040
//     (2005).
//   an alkaliphile's reversed pH difference and small force (i-proton-motive-force-3): Sturr, Guffanti
//     & Krulwich, J. Bacteriol. 176:3111 (1994).
//   dinitrophenol's hyperthermia, treated above all by cooling (i-uncoupling-3): Grundlingh et al.,
//     J. Med. Toxicol. 7:205 (2011).
//   blood lactate cleared faster by light exercise than by rest (i-lactate-facts-3): Belcastro & Bonen,
//     J. Appl. Physiol. 39:932 (1975).
//   brown fat's mitochondria, rich in chain and uncoupling protein and poor in synthase
//     (i-uncoupling-on-purpose-3): Cannon & Nedergaard, Physiol. Rev. 84:277 (2004).
// Other third items take a laboratory case whose facts the question itself states — arsenate at
// glycolysis's sixth step, ascorbate with TMPD at cytochrome c, a glycogen unit's phosphate, an 18O
// tracer, hexokinase as an ADP source — each standard in biochemistry texts, not checked against one
// named paper.
//
// Where the chapter's wording goes further than the chemistry, the items stay inside what is true either
// way. These lines say what the bank does, not what the prose should say:
//   The carbon accounting balances by number. The two CO2 a turn releases come from the oxaloacetate and
//     the acetyl carbons leave on later turns (§7.3's margin note), so no item says that a glucose's own
//     atoms are all gone after two turns.
//   Glycolysis is in all three domains only as "some version of it": one hot-spring archaeon swaps
//     several enzymes, another opens its glucose by another route and joins only in the lower half, so
//     no item claims the same intermediates in every organism or dates the pathway before the last
//     common ancestor.
//   The cycle's FADH2 hands its pair in at complex II, and a shuttle's electrons reach the chain at
//     ubiquinone, so no item says that every FADH2 enters at complex II. Cytosolic NADH "can be worth
//     less" than matrix NADH: how much less depends on its shuttle.
//   Protons per ATP are always said with their place — about 2.7 at the synthase itself, about 3.7 for an
//     ATP delivered to the cytosol — and no item quotes the synthase's margin as a percentage.
//   A bacterial flagellum's rotary motor is a different machine from ATP synthase, and no item says
//     otherwise. Carboxylating pyruvate is a way to top the cycle up, not the only reason the reaction
//     exists; a fed body burns its surplus protein every day; and it is a fatty acid, not a whole fat,
//     that an animal cannot turn into sugar. A thylakoid's force is "mostly" pH, not all of it.
//   A yeast's fermentation gives two CO2 and two ethanol per glucose: two of the six carbons leave as
//     gas and four stay in the ethanol. The two shuttles are named for
//     heart, liver, fast skeletal muscle and insect flight muscle only: which one the brain relies on is
//     disputed, and McKenna et al., Biochem. Pharmacol. 71:399 (2006), put malate–aspartate first.
//
// The chapter ships at reduced scope: four figures (glycolysis, krebs, respiratory-chain, fermentation)
// and no figure tasks. The twenty-two objectives that once kept their third item for a task have a
// written third item instead, `i-<objective>-3`. No item cites a figure by number, and none needs one of
// the four figures that were cut (respiration-tour, atp-synthase, yield-ledger, uncoupler-bench). A task
// pass that comes later adds tasks beside these items; it does not replace them.
//
// Markup: super- and subscripts are <sup> and <sub>, as the book's typographic rule asks, and
// β-oxidation carries a word joiner after its hyphen (U+2060, written \u2060 in the strings), so no line
// can end on a lone "β-". The chemists' high-energy intermediate is written X∼P with U+223C, the
// relation the page's font subset carries, and not with a keyboard tilde.
//
// `npm run check` enforces: unique ids, a declared objective, at least three items each, exactly one
// correct option with a `why` on every other, an explanation on every item, a figure the chapter has on
// every task, an expect the grader's parser can evaluate, and a rubric on every free response.

export const ITEMS = [
  // ============================================================================
  // 7.1 Respiration is not burning
  // ============================================================================

  {
    id: 'i-respiration-definition-1',
    objective: 'respiration-definition',
    kind: 'mcq',
    question: 'An oak tree has no lungs and moves no air in or out of itself. Which statement about it is correct?',
    options: [
      { text: 'It photosynthesises instead of respiring, which is why a leaf in sunshine gives out oxygen and takes in carbon dioxide rather than the other way round.',
        why: 'Reads the leaf\'s net gas exchange as the whole story. In sunshine, photosynthesis takes carbon dioxide in faster than respiration gives it out, so the respiration is hidden, not absent\u00a0— and the roots, which never photosynthesise, respire all the time.' },
      { text: 'It respires only at night, when it can no longer photosynthesise and has to live on the sugar its leaves made during the day.',
        why: 'Pictures respiration and photosynthesis as two shifts worked by one machine. They run in different organelles and do not take turns: a leaf respires in the light as well, and the dark only makes it visible, because nothing is masking it.' },
      { text: 'It respires in every living cell, day and night, oxidising sugar and capturing part of the energy as ATP; it does not breathe.', correct: true },
      { text: 'It breathes through the pores in its leaves, and for a plant that exchange of gases through the pores is what respiration means.',
        why: 'Takes respiration to mean gas exchange, which is the physiologist\'s everyday sense and not the biochemist\'s. The pores let gases in and out, as lungs do for an animal; respiration is what the cells then do with the sugar and the oxygen.' },
    ],
    explain: 'Cellular respiration is the controlled oxidation of a fuel inside a cell, in many small enzyme-catalysed steps, with part of the free energy released captured as ATP. Breathing is an animal\'s plumbing for getting oxygen in and carbon dioxide out. A tree does without the plumbing and respires anyway, as does a yeast in a vat with air in it, and every cell of a person who is fast asleep.',
  },
  {
    id: 'i-respiration-definition-2',
    objective: 'respiration-definition',
    kind: 'mcq',
    question: 'Which of these is the overall equation for respiring glucose, with the standard free energy change the chapter gives for it?',
    options: [
      { text: 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> → 6 CO<sub>2</sub> + 6 H<sub>2</sub>O, with ΔG°′ of about −2870 kilojoules per mole, negative because the reaction releases it.', correct: true },
      { text: 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> → 6 CO<sub>2</sub> + 6 H<sub>2</sub>O, with ΔG°′ of about +2870 kilojoules per mole, positive because the reaction gives that much energy out.',
        why: 'Reads the sign from the reader\'s side of the ledger. ΔG is the change in the system\'s own free energy, so a reaction that releases 2870 has lost it and the sign is negative; a positive ΔG would be a reaction that needs 2870 put in, which is photosynthesis.' },
      { text: 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> → 6 CO<sub>2</sub> + 6 H<sub>2</sub>O, with ΔG°′ of about −2803 kilojoules per mole, the figure a calorimeter gives when glucose is burnt.',
        why: 'Takes the heat a calorimeter measures for the free energy. The 2803 is the heat given out; the free energy available is about 2870, and the difference is the entropy term, because the reaction turns seven molecules into twelve. The two numbers are close and they are not the same quantity.' },
      { text: '6 CO<sub>2</sub> + 6 H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub>, with ΔG°′ of about −2870 kilojoules per mole, respiration and photosynthesis being the one reaction.',
        why: 'Has written photosynthesis. The two are the same reaction run in opposite directions, which is exactly why they cannot both release 2870: one releases it, and the other has to be paid it, by light.' },
    ],
    explain: 'Glucose and six oxygens go to six carbon dioxides and six waters, and ΔG°′ is about −2870 kilojoules per mole. The number is the same whether the glucose is respired or burnt, because free energy depends only on where a reaction starts and where it finishes. The margin note\'s 2803 is a different quantity, the heat a calorimeter reads, and it is a little smaller because the reaction also increases the number of molecules and the entropy term pays the difference.',
  },
  {
    id: 'i-respiration-definition-3',
    objective: 'respiration-definition',
    kind: 'free',
    question: 'Say what cellular respiration is and how it differs from breathing. Write the overall equation for the oxidation of glucose, give its standard free energy change, and say what the sign of that change means.',
    rubric: [
      'cellular respiration is the controlled oxidation of a fuel molecule inside a cell, in many small enzyme-catalysed steps, with part of the free energy released captured as ATP',
      'breathing is an animal\'s plumbing: moving air in and out so that oxygen reaches the blood and carbon dioxide leaves it',
      'the two are different things: a tree respires and does not breathe; a yeast respires in a vat that has air in it, and ferments once a sealed one runs out of oxygen; and every cell of a body respires whether its owner is asleep or sprinting',
      'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> → 6 CO<sub>2</sub> + 6 H<sub>2</sub>O',
      'ΔG°′ is about −2870 kilojoules per mole',
      'the sign is negative because the reacting system loses that free energy: the reaction releases it, and would need it paid in to run the other way',
    ],
    explain: 'The word does double duty, and the confusion is worth avoiding from the start: a physiologist\'s "respiration rate" is breaths per minute, and a biochemist\'s is something happening on a membrane 7 nm thick. This chapter is about the second, and it happens in a tree, a yeast and a sleeping person exactly as it does in a sprinter.',
  },

  {
    id: 'i-respiration-vs-combustion-1',
    objective: 'respiration-vs-combustion',
    kind: 'mcq',
    question: 'A popular book says that a cell "burns glucose slowly". Which judgement of that phrase is right?',
    options: [
      { text: 'Right: respiration is the combustion reaction held back by enzymes, so it goes slowly enough for the heat it gives out to be caught and turned into ATP.',
        why: 'Pictures enzymes as a brake on a fire. Enzymes speed reactions up, and what differs is not the speed but the route; and heat, however slowly it arrives, can do no work in a cell that is at one temperature throughout.' },
      { text: 'Wrong, because a cell releases less free energy from its glucose than a flame does: the part that ends up in ATP stays in the cell.',
        why: 'Counts the ATP as energy that was never released. It was released from the glucose\u00a0— that is where the ATP\'s share came from\u00a0— and the 2870 is the same on both routes. What differs is how much of what is released ends up in ATP rather than as heat.' },
      { text: 'Wrong, because burning is an oxidation and respiration is not: in a cell the fuel hands its electrons to NAD<sup>+</sup>, and never reacts with oxygen at all.',
        why: 'Takes oxidation to mean reaction with oxygen. Handing electrons to NAD<sup>+</sup> oxidises the fuel just as surely, and the electrons do reach oxygen in the end, at the bottom of the chain: the cell has simply put carriers between the fuel and the oxygen.' },
      { text: 'Right about the books and wrong about the route: the reactants, products and free energy change are those of burning, but a cell takes the fall in two dozen steps.', correct: true },
    ],
    explain: 'Free energy depends on where a reaction starts and where it finishes, not on how it gets there, so a flame and a cell have the same 2870 kilojoules per mole to work with. The difference is the route. A flame takes the whole fall at once, at over a thousand degrees, and everything leaves as heat and light, which a cell could not use. A cell takes it in steps at 37 °C, arranged so that each useful step releases a parcel comparable with what one ATP is worth, and so can be coupled to making one.',
  },
  {
    id: 'i-respiration-vs-combustion-2',
    objective: 'respiration-vs-combustion',
    kind: 'free',
    question: 'Explain why burning glucose and respiring it have the same equation and the same free energy change. Then say what a cell gets from its route that a flame cannot give it, and why the flame\'s heat would be no use to a cell.',
    rubric: [
      'both start from glucose and oxygen and finish at carbon dioxide and water, so the equation is the same',
      'free energy depends only on where a reaction starts and where it finishes, not on the route taken, so both release about 2870 kilojoules per mole',
      'a flame takes the whole fall at once, at over a thousand degrees, and every joule leaves as heat and light',
      'heat can do work only across a temperature difference, and a cell is at one temperature throughout, so the flame\'s heat is worth nothing to it (Section\u00a05.1)',
      'a cell takes the same fall in some two dozen enzyme-catalysed steps at 37 °C',
      'the steps are arranged so that each useful one releases a parcel comparable with what one ATP is worth, and so can be coupled to making one',
      'the cell gets captured free energy\u00a0— about a third of the total, at standard prices\u00a0— where the flame captures none',
    ],
    explain: 'The comparison is the chapter\'s whole argument in miniature: nothing in the books differs, and everything in the route does. Notice that the low temperature is a consequence of taking the fall in small steps, not the reason anything is captured. What makes capture possible is the size of each step, matched to the size of the thing being made.',
  },
  {
    id: 'i-respiration-vs-combustion-3',
    objective: 'respiration-vs-combustion',
    kind: 'mcq',
    question: 'Suppose a chemist found a catalyst that made glucose react with oxygen in water at 37 °C, all in one step, at the rate a cell respires it. Would a cell do better to use it than to respire?',
    options: [
      { text: 'Yes: at 37 °C nothing is too hot for the cell, and the heat released inside it could then be used to make ATP.',
        why: 'Takes the temperature to be what is wrong with a flame. It is not: heat can do work only across a temperature difference, and a cell is at one temperature throughout, so the warmth of a one-step reaction at 37 °C pays for no more ATP than a flame\'s heat does.' },
      { text: 'No: one step lets all 2870 kilojoules go at once, as heat; only a fall taken in ATP-sized parcels can be coupled.', correct: true },
      { text: 'Yes: a catalyst lowers the free energy change, so less of the glucose\'s energy would be lost and more would be left for ATP.',
        why: 'Gives the catalyst a say over ΔG. A catalyst lowers the barrier and changes only the rate; the free energy change is fixed by where the reaction starts and finishes, and it is 2870 kilojoules by any route.' },
      { text: 'No: one step would release more free energy than the cell\'s two dozen steps do, far more than a cell could survive at once.',
        why: 'Makes the amount depend on the route. Free energy depends only on the start and the finish, so one step and two dozen release the same 2870; what differs is whether any of it arrives in a form that can do work.' },
    ],
    explain: 'Slowness and coolness were never what made respiration useful. What matters is that the fall is broken into parcels, each comparable with what an ATP is worth, and each handed to an enzyme that couples it to making one. A one-step reaction at 37 °C is a flame without the flame\'s temperature: the same 2870 kilojoules, all of it heat, and none of it captured.',
  },

  {
    id: 'i-four-stages-1',
    objective: 'four-stages',
    kind: 'mcq',
    question: 'Which list gives the four stages of respiration in order, each with the part of a eukaryotic cell it happens in?',
    options: [
      { text: 'Glycolysis in the mitochondrial matrix; the link reaction on the outer membrane; the Krebs cycle in the matrix; oxidative phosphorylation on the inner membrane.',
        why: 'Puts all of respiration inside the mitochondrion, which is the commonest picture of it and wrong at the first step. Glycolysis runs in the cytosol and needs no organelle at all; the mitochondrion is handed pyruvate.' },
      { text: 'Glycolysis in the cytosol; the link reaction in the matrix; the Krebs cycle in the matrix; oxidative phosphorylation on the inner mitochondrial membrane.', correct: true },
      { text: 'Glycolysis in the cytosol; the link reaction in the cytosol, on the way in; the Krebs cycle on the inner membrane; oxidative phosphorylation in the matrix.',
        why: 'Reads "link" as a place between two compartments, and swaps the last two. Pyruvate is carried into the matrix and taken apart there; the cycle is in the matrix, and the chain and the synthase sit in the inner membrane, the only boundary that can hold a gradient.' },
      { text: 'Glycolysis in the cytosol; the Krebs cycle in the matrix; the link reaction in the matrix; oxidative phosphorylation in the intermembrane space.',
        why: 'Has most of the places and the wrong order. The link reaction makes the acetyl-CoA the cycle runs on, so it comes first; and the intermembrane space is the compartment the chain pumps protons into, not where the chain sits.' },
    ],
    explain: 'Glycolysis splits glucose in the cytosol; pyruvate is carried into the matrix, where the link reaction and the Krebs cycle take the carbon apart; and the carriers they have loaded are unloaded on the inner membrane, which holds the chain and the synthase. Knowing which stage a claim is about is most of the battle in this subject, which is why the chapter puts the table first.',
  },
  {
    id: 'i-four-stages-2',
    objective: 'four-stages',
    kind: 'free',
    question: 'Name the four stages of respiration in order, say where each happens in a eukaryotic cell and what it hands on to the next, and say where the same four happen in a bacterium, which has no mitochondrion.',
    rubric: [
      'glycolysis, in the cytosol: splits glucose into two pyruvate, making 2 ATP and 2 NADH on the way, and hands on the pyruvate',
      'the link reaction, in the mitochondrial matrix: turns each pyruvate into acetyl-CoA, releasing CO<sub>2</sub> and loading NADH, and hands on the acetyl-CoA',
      'the Krebs cycle, in the matrix: takes the acetyl groups apart to carbon dioxide and hands on loaded carriers, NADH and FADH<sub>2</sub>',
      'oxidative phosphorylation, on the inner mitochondrial membrane: the chain unloads the carriers to oxygen, and the synthase makes nearly all the ATP',
      'the first three take the carbon apart and make four ATP between them; the fourth touches no carbon and makes nearly all of it',
      'a bacterium runs the same four stages: glycolysis and the cycle in its cytosol, the chain and the synthase in its plasma membrane',
    ],
    explain: 'The bacterium is the useful check. It shows that the mitochondrion is not what makes respiration possible: it is where a eukaryote keeps machinery its ancestor acquired ready-made, and the inner membrane holds the gradient because it was once the bacterium\'s own.',
  },
  {
    id: 'i-four-stages-3',
    objective: 'four-stages',
    kind: 'mcq',
    question: 'A researcher breaks liver cells open, spins out their mitochondria and keeps them intact in a buffer with oxygen, ADP and phosphate. Given glucose, they use almost no oxygen; given pyruvate, they respire briskly. Why?',
    options: [
      { text: 'Glucose is too large to pass the outer membrane\'s pores; once inside the matrix, glycolysis would run there normally.',
        why: 'Puts glycolysis inside the mitochondrion, which is the commonest wrong picture of respiration. The outer membrane passes anything up to about 5000 daltons, glucose easily; what is missing is glycolysis\'s enzymes, which were in the cytosol the researcher threw away.' },
      { text: 'The link reaction is what splits glucose in two, and it happens on the outer membrane, which breaking the cells damaged.',
        why: 'Gives the splitting of glucose to the wrong stage and the wrong place. Glycolysis splits glucose, in the cytosol; the link reaction takes pyruvate, in the matrix, and removes one carbon from it.' },
      { text: 'Glycolysis runs in the cytosol, which was thrown away; a mitochondrion takes up pyruvate, not glucose.', correct: true },
      { text: 'The Krebs cycle has to spend two ATP on each glucose before it earns anything, and isolated mitochondria have none to spend.',
        why: 'Moves glycolysis\'s investment into the cycle. The two ATP spent before any are earned belong to glycolysis\'s first half, in the cytosol; the cycle spends none, and here it has nothing to turn because nothing is making acetyl groups from the glucose.' },
    ],
    explain: 'The four stages are in two places, and the division is sharp: glycolysis in the cytosol, the link reaction and the cycle in the matrix, the chain and the synthase on the inner membrane. A mitochondrion is handed pyruvate and never sees a glucose, which is why a preparation of mitochondria has to be fed pyruvate, or something further down, to show that it works.',
  },

  {
    id: 'i-cristae-area-1',
    objective: 'cristae-area',
    kind: 'mcq',
    question: 'Why is a mitochondrion\'s inner membrane thrown into folds rather than stretched smooth inside the outer one?',
    options: [
      { text: 'The folds hold the enzymes of the Krebs cycle, so the more deeply the membrane is folded, the more room there is inside for the whole cycle to run.',
        why: 'Puts the cycle on the membrane. The cycle\'s enzymes float in the matrix, all but one; what sits in the folds is the chain and the synthase, which is why folding is what adds power.' },
      { text: 'The fourth stage runs on membrane and what feeds it fills a volume; area grows as a square and volume as a cube, so folding adds membrane.', correct: true },
      { text: 'Folding the membrane increases the volume of the matrix, so a mitochondrion that is folded harder has more space in which to take its fuel apart.',
        why: 'Confuses area with volume. Folding a membrane adds surface without enclosing any more space; if anything, a heart mitochondrion\'s cristae are so dense that its matrix is nearly squeezed out.' },
      { text: 'A mitochondrion that needed more power could simply grow larger, and the folds are there to stiffen the membrane at the size it has.',
        why: 'Misses Section\u00a03.2\'s arithmetic. A larger mitochondrion gains volume faster than surface, so it would have less membrane for each molecule of fuel it holds; folding is the one way to add area without adding volume.' },
    ],
    explain: 'Section\u00a03.2\'s ratio, in a new place. The chain and the synthase sit in a membrane, and the area of that membrane limits how fast a mitochondrion can make ATP, so a cell that needs more ATP per unit of its own volume folds the membrane harder. Some of the folding is made by the machinery itself: ATP synthases sit in long double rows along the ridges of each crista, and the shape of the pair bends the membrane where it sits.',
  },
  {
    id: 'i-cristae-area-2',
    objective: 'cristae-area',
    kind: 'mcq',
    question: 'A hummingbird\'s flight muscle works flat out whenever the bird is in the air; a cell in its fat stores holds fuel and does little else. Predict how their mitochondria differ.',
    options: [
      { text: 'Hardly at all: every mitochondrion descends from the same ancestral bacterium, so the two cells differ only in how many mitochondria they happen to have.',
        why: 'Treats a shared ancestry as a fixed design. Mitochondria are built to the job: the chapter\'s heart and liver cells both have them, and one set is folded far harder than the other.' },
      { text: 'The fat cell\'s are the more deeply folded, because fat is much the richer fuel, and a cell holding more of it has more to burn.',
        why: 'Reasons from the fuel\'s energy per gram rather than from the cell\'s demand for ATP. What sets the folding is how much ATP the cell must make per unit of its own volume, and a store of fuel sitting still needs very little.' },
      { text: 'The flight muscle\'s are simply larger than the fat cell\'s, since a bigger mitochondrion carries more inner membrane to make ATP with.',
        why: 'Scales the organelle up instead of folding it, which is the move Section\u00a03.2 rules out: a bigger mitochondrion gains volume faster than surface, so it has less membrane for each unit of fuel, not more.' },
      { text: 'The flight muscle cell is packed with mitochondria whose cristae are so dense the matrix is nearly squeezed out; the fat cell has few, loosely folded.', correct: true },
    ],
    explain: 'The chapter\'s heart and liver, pushed to an extreme. In hummingbird flight muscle the mitochondria fill about a third of each fibre, and their inner membranes are packed more densely than in the mammalian muscles measured, because the muscle\'s ATP demand per unit of volume is among the highest there is. Those who measured them reckon it is close to the most a mitochondrion could hold. The folding follows the demand, not the fuel.',
  },
  {
    id: 'i-cristae-area-3',
    objective: 'cristae-area',
    kind: 'free',
    question: 'Explain why a mitochondrion\'s inner membrane is folded, using the arithmetic of surface and volume. Then predict how the folding differs between a heart muscle cell and a liver cell, and say why.',
    rubric: [
      'the fourth stage\u00a0— the chain and the synthase\u00a0— happens on the inner membrane, a surface',
      'everything that feeds it happens in a volume, the matrix',
      'surface grows as the square of a length and volume as the cube (Section\u00a03.2), so a bigger mitochondrion would have less membrane for its contents, not more',
      'folding adds membrane without adding volume, so a cell needing more ATP per unit of its own volume folds the membrane harder',
      'a heart muscle cell must never stop, and is packed with mitochondria whose cristae are so dense the matrix is nearly squeezed out',
      'a liver cell does a great deal of chemistry but comparatively little mechanical work, and has a thousand or two mitochondria, much more loosely folded',
      'part of the folding is made by the machinery itself: pairs of ATP synthases sit in rows along the ridges and bend the membrane',
    ],
    explain: 'The prediction is about ATP demand per unit of volume, not about how much fuel a cell handles. A liver cell processes a great deal of material; a heart cell turns a great deal of it into mechanical work, without a pause, and that is the job that needs the membrane.',
  },

  // ============================================================================
  // 7.2 The oldest pathway runs in the cytosol
  // ============================================================================

  {
    id: 'i-glycolysis-ledger-1',
    objective: 'glycolysis-ledger',
    kind: 'mcq',
    question: 'Per molecule of glucose, what does glycolysis spend, and what does it make?',
    options: [
      { text: 'It spends 2 ATP and makes 4, for 2 net; it reduces 2 NAD<sup>+</sup>; and it leaves 2 pyruvate holding all six carbons.', correct: true },
      { text: 'It spends no ATP and makes 2; it reduces 2 NAD<sup>+</sup>; and it releases 2 CO<sub>2</sub>, leaving two pyruvate of two carbons each.',
        why: 'Knows the net figure and not the ledger behind it, and puts the loss of carbon in the wrong stage. Glycolysis spends two ATP before it earns four, and it keeps every carbon: the first CO<sub>2</sub> leaves at the link reaction.' },
      { text: 'It spends 2 ATP and makes 2, so it only breaks even; its one real gain is the pair of NADH it hands on to the chain.',
        why: 'Counts the second half once. The glucose splits at step four into two three-carbon fragments and everything after that happens twice, so the second half earns four ATP, not two.' },
      { text: 'It spends 2 ATP and makes 4 on each three-carbon fragment, so 6 net per glucose; it reduces 4 NAD<sup>+</sup>; and it leaves 2 pyruvate.',
        why: 'Doubles what is already doubled. Four ATP is the second half\'s earning for the whole glucose, two from each fragment, and there is one NADH per fragment, so two per glucose.' },
    ],
    explain: 'Learn it as two halves. The first spends: one ATP to phosphorylate the glucose and a second to phosphorylate it again. The molecule splits, and the second half runs twice, once on each fragment, each time oxidising the fragment once and handing two phosphates to ADP. Two spent, four made, two NADH, two pyruvate\u00a0— and at the standard 30.5 kilojoules an ATP, the two net are about 61 of the 2870 a glucose is worth, some two per cent.',
  },
  {
    id: 'i-glycolysis-ledger-2',
    objective: 'glycolysis-ledger',
    kind: 'free',
    question: 'Set out glycolysis\'s ledger for one glucose as two halves: what the first half spends and on what, where the molecule splits, what the second half earns, and why the second half\'s earnings count twice. End with the net totals and the fraction of glucose\'s free energy they amount to.',
    rubric: [
      'the first half spends two ATP: one to put a phosphate on the glucose, and a second, at the third step, to put on another',
      'the six-carbon molecule then splits into two three-carbon fragments, each carrying a phosphate',
      'the second half runs twice, once on each fragment',
      'in it each fragment is oxidised once, reducing one NAD<sup>+</sup>, and gives up two phosphate groups to ADP',
      'so four ATP are made where two were spent: per glucose, two ATP net, two NADH and two pyruvate',
      'the two pyruvate still hold all six carbons and most of the fuel value',
      'two ATP at the standard 30.5 kilojoules is about 61 of glucose\'s 2870, about two per cent: glycolysis is where the sugar is opened, not where the energy is',
    ],
    explain: 'The per-glucose and per-fragment ledgers are the commonest slip in this section, and the way to keep them apart is to remember where the split is. Before it there is one molecule; after it there are two, and every number from then on is counted twice.',
  },
  {
    id: 'i-glycolysis-ledger-3',
    objective: 'glycolysis-ledger',
    kind: 'mcq',
    question: 'A muscle breaking down its glycogen gets most of its glucose units already carrying a phosphate, as glucose 6-\u2060phosphate, without spending ATP to put it there. What does glycolysis now net for each of those units?',
    options: [
      { text: '3 ATP and 2 NADH: only the investment at the third step is paid, and the second half still earns four.', correct: true },
      { text: '2 ATP and 2 NADH, as always: the net is a fixed property of the pathway, whatever form the sugar arrives in.',
        why: 'Learns the net as a number rather than as a ledger. Two net is four earned less two spent; a unit that arrives with its first phosphate already on skips the first payment, and the ledger comes out one better.' },
      { text: '4 ATP and 2 NADH: with the phosphate already on, the whole of the first half\'s spending is skipped.',
        why: 'Skips both payments for the price of one. The sugar arrives with one phosphate; the second, at the third step, is still paid for with an ATP, because the committed step still has to make a molecule that splits into two phosphorylated halves.' },
      { text: '6 ATP and 4 NADH: each of the two three-carbon fragments earns four ATP and reduces two NAD<sup>+</sup>.',
        why: 'Counts per fragment what is true per glucose. Each fragment earns two ATP and reduces one NAD<sup>+</sup>; it is the pair of them, from one glucose, that earns four and reduces two.' },
    ],
    explain: 'The ledger is two payments and four receipts. Glycogen\'s chains are taken apart by adding phosphate across their bonds rather than water, so most units come off already tagged, as glucose 1-\u2060phosphate that is then rearranged to glucose 6-\u2060phosphate, and the first payment is never made. (The one unit in about ten that sits at a branch point is cut off with water, as plain glucose, and pays like any other.) The phosphofructokinase step still spends one ATP, and the second half, run twice, still earns four and reduces two NAD<sup>+</sup>. So a unit that comes off glycogen already tagged nets three ATP where a glucose from the blood nets two.',
  },

  {
    id: 'i-substrate-level-phosphorylation-1',
    objective: 'substrate-level-phosphorylation',
    kind: 'mcq',
    question: 'At glycolysis\'s seventh step an enzyme hands a phosphate group from 1,3-\u2060bisphosphoglycerate to ADP, making an ATP. Where did the free energy for that ATP come from?',
    options: [
      { text: 'From the high-energy bond between the phosphate and the three-carbon sugar, which releases its energy as the enzyme breaks it and moves the phosphate across.',
        why: 'Section\u00a05.3\'s misconception in its natural habitat. Breaking a bond always costs; what makes the transfer downhill is that the products are more stable than the reactants, and what made 1,3-\u2060bisphosphoglycerate a good donor in the first place was the oxidation that came before it.' },
      { text: 'From the proton gradient across the cell membrane, which drives this step of glycolysis just as it drives the synthase in a mitochondrion.',
        why: 'Assumes all ATP is made by a gradient because most of it is. This step happens in the cytosol, on a soluble enzyme, with no membrane anywhere in sight; that is exactly what makes it substrate-level phosphorylation.' },
      { text: 'From oxidising the sugar at the sixth step: that enzyme attached a phosphate from solution, making a compound above ATP on the ladder, so its phosphate goes downhill to ADP.', correct: true },
      { text: 'From the two ATP spent in the first half of the pathway, which the second half pays back with interest by handing their phosphates on to ADP.',
        why: 'Reads the pathway as a loan repaid. The two invested ATP bought a trapped, splittable molecule, and their energy was spent, not stored; the phosphate moved at this step came in from solution at the sixth step, and what paid for it was the oxidation.' },
    ],
    explain: 'This is Section\u00a05.4\'s shared intermediate, made visible. At the sixth step the fragment is oxidised\u00a0— a pair of electrons goes to NAD<sup>+</sup>\u00a0— and in the same reaction, on the same enzyme, a phosphate from solution is attached; the product sits above ATP on the ladder, so the seventh step\'s enzyme can hand that phosphate to ADP. The energy came from the oxidation. The phosphate was the means of carrying it from the reaction that released it to the ADP that needed it.',
  },
  {
    id: 'i-substrate-level-phosphorylation-2',
    objective: 'substrate-level-phosphorylation',
    kind: 'free',
    question: 'Explain how glycolysis makes ATP with no membrane and no gradient anywhere in sight. Name the two compounds it takes the phosphate from, say why each can give it to ADP, and say what actually paid for the ATP.',
    rubric: [
      'at the sixth step a three-carbon fragment is oxidised, a pair of electrons going to NAD<sup>+</sup>, and in the same reaction, on the same enzyme, a phosphate ion from solution is attached to it',
      'the product, 1,3-\u2060bisphosphoglycerate, sits above ATP on Section\u00a05.3\'s ladder, so the next enzyme can hand that phosphate straight to ADP',
      'three steps later the same trick is played with phosphoenolpyruvate, at the top of Section\u00a05.3\'s table at −61.9 kilojoules per mole',
      'moving a phosphate group straight from a substrate onto ADP, with no membrane and no gradient, is substrate-level phosphorylation',
      'what paid was oxidising the sugar, not the phosphate: no energy is stored in the bond that breaks',
      'it is Section\u00a05.4\'s shared intermediate: the enzyme that oxidises the sugar and the enzyme that makes the ATP are joined by a molecule they both hold',
      'it is the only way the first three stages make any ATP: two per glucose in glycolysis, net, and two in the Krebs cycle',
    ],
    explain: 'Glucose 6-\u2060phosphate is the useful contrast. It is also a phosphorylated sugar, and at −13.8 it sits well below ATP, so it could never give its phosphate back to ADP. Whether a phosphate can be handed on depends on where its compound sits on the ladder, which is why the oxidation that lifts 1,3-\u2060bisphosphoglycerate above ATP is the step that matters.',
  },
  {
    id: 'i-substrate-level-phosphorylation-3',
    objective: 'substrate-level-phosphorylation',
    kind: 'mcq',
    question: 'Arsenate is so like phosphate that glycolysis\'s sixth-step enzyme attaches it in phosphate\'s place, but the product falls apart in water at once, to 3-\u2060phosphoglycerate, before the seventh-step enzyme can use it. In a cell whose sixth step used arsenate every time, what would glycolysis net?',
    options: [
      { text: 'Two ATP as usual, since the energy came from oxidising the sugar, and the sugar is still oxidised.',
        why: 'Right about where the energy comes from, and misses how it is carried. Oxidising the sugar releases it, but it reaches ADP only through the phosphorylated product; when that product falls apart in water, the energy it held leaves as heat.' },
      { text: 'Nothing, since glycolysis stops at the sixth step: a sugar cannot be oxidised there without a phosphate to attach.',
        why: 'Supposes the phosphate powers the oxidation. The oxidation is the part that releases free energy, and it runs with arsenate; the phosphate is only the means of carrying that energy on to ADP, and arsenate carries it nowhere.' },
      { text: 'Nothing from either step that makes ATP, since both hand on phosphates that the sixth step attached.',
        why: 'Traces both of glycolysis\'s ATP-making phosphates back to the sixth step. The phosphate that phosphoenolpyruvate hands on was put on by ATP in the first half, and 3-\u2060phosphoglycerate still carries it, so the last step makes its two ATP as usual.' },
      { text: 'No ATP net: NADH is still made and the last step still makes two ATP, but the seventh step\'s two are lost and the two spent are not repaid.', correct: true },
    ],
    explain: 'Arsenate does to glycolysis what a hole in a membrane does to the chain: the oxidation runs, the energy is released, and nothing carries it to ADP. The sixth step\'s product is Section\u00a05.4\'s shared intermediate, and it is what makes the seventh step\'s ATP possible; replace it with one that falls apart in water and the free energy of the oxidation leaves as heat. The pathway still turns glucose into pyruvate and NAD<sup>+</sup> into NADH, and nets no ATP at all.',
  },

  {
    id: 'i-glycolysis-committed-step-1',
    objective: 'glycolysis-committed-step',
    kind: 'mcq',
    question: 'A resting muscle cell, its ATP high and its AMP low, takes up glucose after a meal. What happens to most of that glucose?',
    options: [
      { text: 'It runs straight through glycolysis, because a pathway runs whenever its substrate is present, and the ATP it makes is set aside for later.',
        why: 'Treats a pathway as a slope that anything put at the top rolls down. The committed step reads the cell\'s energy state and closes when ATP is plentiful, which is the whole point of putting a control there.' },
      { text: 'It is never taken in at all, because ATP switches off hexokinase, the enzyme of the first step, where glycolysis commits a sugar.',
        why: 'Takes the first step for the committed one. Glucose 6-\u2060phosphate still has several places to go, glycogen among them, so the step that commits is the third, the second phosphorylation, whose product has nowhere else to go.' },
      { text: 'It goes through glycolysis faster than usual, because ATP is phosphofructokinase\'s substrate, and more substrate makes an enzyme work faster.',
        why: 'Sees ATP at the active site and misses its second site. ATP is both the enzyme\'s substrate and its allosteric inhibitor, and at high ATP the inhibitory site wins: the thing the pathway makes is the thing that switches it off.' },
      { text: 'Hexokinase traps it as glucose 6-\u2060phosphate, but ATP holds phosphofructokinase in its inactive shape, so it is stored as glycogen instead.', correct: true },
    ],
    explain: 'Phosphofructokinase catalyses the committed step\u00a0— the third, and the second phosphorylation\u00a0— and it is allosteric in Section\u00a05.7\'s sense: ATP binds a regulatory site of its own and holds the enzyme in its inactive shape, and AMP and ADP bind an activating site of their own and turn it back to its active shape. Citrate, from the cycle downstream, inhibits it too. So a cell with plenty of ATP still phosphorylates the glucose it takes in, which traps it, and parks it as glycogen rather than breaking it down.',
  },
  {
    id: 'i-glycolysis-committed-step-2',
    objective: 'glycolysis-committed-step',
    kind: 'free',
    question: 'Identify the step that commits a glucose molecule to being broken down, and explain why it is not the first step. Say what switches its enzyme off and what switches it back on, and predict what a cell with plenty of ATP does with the pathway.',
    rubric: [
      'the committed step is the third, the second phosphorylation, catalysed by phosphofructokinase',
      'it is not the first, because glucose 6-\u2060phosphate can still go into glycogen or into several other pathways; the third step\'s product has nowhere else to go',
      'the enzyme is allosteric: ATP is both its substrate, at the active site, and its inhibitor, at a second, regulatory site',
      'plenty of ATP holds it in its inactive shape; AMP and ADP bind an activating site of their own and turn it back to its active shape',
      'citrate, the first intermediate of the Krebs cycle, inhibits it too: a message from downstream that the matrix already has more fuel than it can process',
      'the pathway\'s product is what switches it off, and the quantity regulated is the cell\'s own energy state: Section\u00a05.7\'s feedback loop',
      'so a cell with plenty of ATP slows glycolysis at this step and sends its glucose 6-\u2060phosphate elsewhere, into glycogen',
    ],
    explain: 'Section\u00a05.7 said that the end product acts at the first committed step and not anywhere else, and here is why: a control at the first step would also stop glycogen being made, and a control after the commitment would leave intermediates piling up with nowhere to go. The third step is the last place the cell can still change its mind.',
  },
  {
    id: 'i-glycolysis-committed-step-3',
    objective: 'glycolysis-committed-step',
    kind: 'mcq',
    question: 'A mutant phosphofructokinase has lost the inhibitory site where ATP binds as a regulator, and keeps its active site intact. In a resting muscle cell full of ATP after a meal, what does the mutant enzyme do to the cell\'s glucose?',
    options: [
      { text: 'Nothing new: the committed step is hexokinase\'s, and that enzyme still stops glucose coming in when ATP is high.',
        why: 'Puts the commitment at the first step. Glucose 6-\u2060phosphate can still go into glycogen; it is the third step, the one this mutant has lost control of, whose product has nowhere else to go.' },
      { text: 'Sends it down glycolysis anyway: nothing holds the enzyme inactive, so glucose meant for glycogen is broken down.', correct: true },
      { text: 'Stops it being broken down at all, since without the inhibitory site the enzyme can no longer bind ATP, its substrate.',
        why: 'Merges the two sites. ATP binds the active site as substrate and a separate site as inhibitor; the mutant has lost only the second, so it still uses ATP and no longer hears it.' },
      { text: 'Slows glycolysis, since AMP can no longer bind to switch the enzyme on, so it is stuck in its inactive shape.',
        why: 'Takes the enzyme\'s resting state to be off, needing AMP to turn it on. What holds it off is ATP at its inhibitory site; with that site gone nothing holds it off, and AMP, whose own site is intact, has nothing left to undo.' },
    ],
    explain: 'A feedback loop needs the product to reach the control, and this mutant has cut the wire. With ATP unable to bind the inhibitory site, phosphofructokinase works as fast as its substrate allows whatever the cell\'s energy state, and the glucose 6-\u2060phosphate that a full cell would have sent into glycogen goes on to pyruvate instead. It is Section\u00a05.7\'s loop with the sensor taken out.',
  },

  {
    id: 'i-glycolysis-universal-1',
    objective: 'glycolysis-universal',
    kind: 'mcq',
    question: 'Some version of glycolysis runs in the cytosol of organisms in all three domains of life, with the same last steps to pyruvate in every one, and it needs neither oxygen nor any organelle. What does that most reasonably suggest?',
    options: [
      { text: 'That it is where cells make most of their ATP, and that this is why no organism anywhere has managed to do without it for very long.',
        why: 'Reads universal as productive. Glycolysis makes two ATP of the thirty or so a glucose yields with oxygen; what its being everywhere tells you is how long it has been around, not how much it makes.' },
      { text: 'That it is older than the mitochondrion, could have run before the air held any oxygen, and sits in the cytosol for that reason.', correct: true },
      { text: 'That it sits in the cytosol only because the mitochondrion had no room left inside for it, which is also why it has to come first.',
        why: 'Explains its place by the architecture, which the chapter says is exactly backwards. Cells were running glycolysis before any mitochondrion existed; the mitochondrion arrived later, as a bacterium, into a cell that already had it.' },
      { text: 'That it is a recent addition, put in front of the mitochondrion to prepare the fuel that the mitochondrion then burns.',
        why: 'Reads the order of the stages as the order in which they evolved, the wrong way round. Glycolysis needs nothing the mitochondrion provides, and cells with no mitochondria at all run it; the mitochondrion is the later arrival.' },
    ],
    explain: 'Put the facts side by side. Organisms in every domain run some version of it; it needs no oxygen, which photosynthesis later put into the air; it needs no compartment; and Section\u00a03.5\'s evidence says the mitochondrion arrived later, as a bacterium taken in by a cell that already existed. In the archaea some steps are done by unrelated enzymes, and in some the top half takes another route altogether, so the argument rests on the lower half every domain shares and on where it runs, not on identical machinery. Its being in the cytosol is not an inconvenience of the architecture. It is a record of the order in which the pieces arrived.',
  },
  {
    id: 'i-glycolysis-universal-2',
    objective: 'glycolysis-universal',
    kind: 'mcq',
    question: 'A mature human red blood cell has no nucleus and no mitochondria, and it spends its life carrying oxygen. Which part of respiration can it still run, and how does it get the ATP it needs?',
    options: [
      { text: 'Only glycolysis, in its cytosol: two ATP per glucose, with its NAD<sup>+</sup> regenerated by turning pyruvate into lactate.', correct: true },
      { text: 'All four stages, drawing on a little of the oxygen it carries, since a cell that is full of oxygen can hardly be short of it.',
        why: 'Confuses carrying oxygen with using it. Without mitochondria there is no link reaction, no cycle and no chain, so there is nothing to hand electrons to oxygen; having it and using it are different things, as cyanide shows from the other direction.' },
      { text: 'None, so it lives only as long as the ATP it was made with lasts, which is why red cells are replaced so often.',
        why: 'Assumes that all ATP comes from mitochondria. Glycolysis needs no organelle, so any cell that keeps its cytosol can run it\u00a0— and a cell\'s ATP is spent and remade about once a minute, so no cell could live on a store.' },
      { text: 'The Krebs cycle, in its cytosol, since the cycle\'s enzymes are soluble proteins and need no membrane to work in.',
        why: 'Right that the cycle\'s enzymes are soluble and wrong about where they are: in a eukaryote they are in the matrix, and a cell that has lost its mitochondria has lost them too. The one pathway a cell cannot lose this way is the one that was never inside the mitochondrion.' },
    ],
    explain: 'The red cell is glycolysis\'s independence of every organelle, made into a body part. It makes its ATP the way a yeast in a sealed vat makes it, from glycolysis alone, and it regenerates NAD<sup>+</sup> the way a sprinting muscle does, by reducing pyruvate to lactate, which the heart and the liver later take up. Section\u00a07.7 has that half of the story.',
  },
  {
    id: 'i-glycolysis-universal-3',
    objective: 'glycolysis-universal',
    kind: 'free',
    question: 'Explain what follows from some version of glycolysis sitting in the cytosol of all three domains and needing no oxygen and no organelle. Make the argument a step at a time, saying which fact supports which part of the conclusion, and say one thing it does not show.',
    rubric: [
      'some version of glycolysis runs in the cytosol of organisms in all three of Section\u00a01.7\'s domains, with the same last steps to pyruvate in every one',
      'it needs no oxygen: nothing in it takes up oxygen, so it could have run before photosynthesis put any into the air',
      'it needs no compartment and no membrane, so it asks nothing of any organelle',
      'the mitochondrion arrived later, as a bacterium taken into a cell that already existed (Section\u00a03.5)',
      'so the pathway is older than the mitochondrion, and its place in the cytosol records the order in which things arrived rather than being an inconvenience of the architecture',
      'a bacterium runs it in its cytosol too, with no mitochondrion anywhere, which is what the argument expects',
      'what it does not show is that glycolysis is where the ATP comes from: it makes two of the thirty or so a glucose yields with oxygen',
    ],
    explain: 'The argument is about order, and every step of it is a fact about what glycolysis does not need. Being run by every kind of cell and needing nothing any cell added later is what an old pathway looks like. In the archaea some steps are done by unrelated enzymes, and in some the top half takes another route altogether, so the argument rests on the lower half every domain shares and on where it runs, not on identical machinery in every cell.',
  },

  // ============================================================================
  // 7.3 A cycle that takes carbon apart
  // ============================================================================

  {
    id: 'i-link-reaction-1',
    objective: 'link-reaction',
    kind: 'mcq',
    question: 'Pyruvate is carried into the matrix, where it meets one of the largest enzyme assemblies in the cell. What does the link reaction do to it?',
    options: [
      { text: 'Adds oxygen from the air to one of its carbons, which leaves as carbon dioxide, and passes the two carbons that remain straight into the Krebs cycle.',
        why: 'Makes the breathed oxygen the source of the carbon dioxide, which is the picture most people start with. The oxygen in this CO<sub>2</sub> was already in the pyruvate; the oxygen you breathe is not used until the very end of the chain, and it goes into water.' },
      { text: 'Phosphorylates it and makes one ATP by the substrate-level route, since each of the stages of respiration makes a little ATP on the way.',
        why: 'Assumes every stage pays its way in ATP. The link reaction makes none; it makes a loaded carrier and a reactive acetyl group, and respiration is a long dismantling that makes almost no ATP followed by one membrane that makes nearly all of it.' },
      { text: 'Removes one carbon as CO<sub>2</sub>, takes a pair of electrons off what remains onto NAD<sup>+</sup>, and attaches the two carbons left to coenzyme A through a sulfur atom.', correct: true },
      { text: 'Splits off one carbon as CO<sub>2</sub> with no oxidation at all, and leaves every oxidation to the Krebs cycle, which is where the carriers are loaded.',
        why: 'Knows the carbon arithmetic and misses the carrier. Removing the carbon and loading NAD<sup>+</sup> happen together on the same assembly, which is why the link reaction makes two NADH per glucose; a decarboxylation with no oxidation is what a yeast does when it ferments.' },
    ],
    explain: 'Three things at once: a decarboxylation, an oxidation and an attachment. The two carbons left ride on coenzyme A through a sulfur atom, as a thioester, and per glucose it all happens twice: two carbons gone for good, two more NADH, and what remains of the sugar is two acetyl groups on two carriers.',
  },
  {
    id: 'i-link-reaction-2',
    objective: 'link-reaction',
    kind: 'mcq',
    question: 'The acetyl group of acetyl-CoA is held on coenzyme A through a sulfur atom rather than an oxygen. What does that buy?',
    options: [
      { text: 'A high-energy bond between the acetyl group and the sulfur, which stores the energy of the link reaction until the Krebs cycle breaks it and lets it out.',
        why: 'The high-energy-bond picture Section\u00a05.3 dismantled, in a new coat. The chapter is careful to say that what makes the acetyl group reactive is not a special bond but a rung: the thioester\'s place on the ladder, set by how stable its products are.' },
      { text: 'A grip tighter than an oxygen could manage, so that the carrier holds its acetyl group securely all the way to the cycle and loses none of it on the way.',
        why: 'Has the carrier\'s purpose upside down. A carrier that held its cargo tightly would be no use for handing it on; the thioester is worth having because it sits high on the ladder, so giving the acetyl group away is downhill.' },
      { text: 'A carrier that dissolves in the inner membrane, so that the acetyl group can be delivered straight to the electron transport chain.',
        why: 'Confuses coenzyme A with ubiquinone. Acetyl-CoA stays in the matrix and hands its acetyl group to oxaloacetate; the carrier with a tail that keeps it in the bilayer belongs to the chain, not to the cycle.' },
      { text: 'A thioester, whose hydrolysis releases about 31 kilojoules per mole, very nearly ATP\'s rung, so the acetyl group is reactive enough to hand on.', correct: true },
    ],
    explain: 'Section\u00a02.5\'s sulfhydryl group, doing the one job it is uniquely good at. A thioester sits at almost the same height on Section\u00a05.3\'s ladder as ATP, so the acetyl group can be transferred onto oxaloacetate in the next step without any further investment. Its place on the ladder, not anything special about the bond, is what makes it reactive.',
  },
  {
    id: 'i-link-reaction-3',
    objective: 'link-reaction',
    kind: 'free',
    question: 'Say what happens to one pyruvate in the link reaction\u00a0— what is removed, what is attached and what is reduced\u00a0— then what that comes to per glucose, and what follows from the reaction being effectively irreversible.',
    rubric: [
      'one carbon is removed as carbon dioxide: a decarboxylation',
      'a pair of electrons is taken off what remains onto NAD<sup>+</sup>: an oxidation, which makes NADH',
      'the two carbons left are attached to coenzyme A through a sulfur atom, as a thioester, making acetyl-CoA',
      'all three happen at once, on one large enzyme assembly in the matrix',
      'per glucose it happens twice: two carbons leave as CO<sub>2</sub>, two NADH are made, and two acetyl groups remain',
      'the reaction is effectively irreversible, so acetyl-CoA cannot be turned back into pyruvate',
      'a fatty acid arrives at this pathway as acetyl-CoA, and the link reaction is a one-way door; the cycle then gives off as carbon dioxide as many carbons as each acetyl group brings in, so no oxaloacetate is left over to make sugar from; together these are why an animal cannot turn a fatty acid into sugar (plants and many bacteria bypass those two losses with the glyoxylate cycle, and animals lack it)',
    ],
    explain: 'The last point is one a reader can check against their own body, with one refinement: it is the fatty acids of a fat that go through the one-way door. The glycerol part joins glycolysis partway down and can be built back into glucose, which is why a fat is not wholly lost to a liver that needs sugar.',
  },

  {
    id: 'i-krebs-carbon-accounting-1',
    objective: 'krebs-carbon-accounting',
    kind: 'mcq',
    question: 'The heart takes up lactate from the blood and oxidises it completely. Account for the three carbons of one lactate molecule: where does each leave, and as what?',
    options: [
      { text: 'One leaves at the link reaction and two in the cycle, for the acetyl group that joins it: all three as carbon dioxide.', correct: true },
      { text: 'One leaves as CO<sub>2</sub> when lactate is turned back into pyruvate, one more at the link reaction, and the last one in the Krebs cycle.',
        why: 'Treats every oxidation as a decarboxylation. Turning lactate back into pyruvate takes two hydrogens off and loads an NADH, but it removes no carbon: pyruvate has three carbons, exactly as lactate does.' },
      { text: 'All three leave in the Krebs cycle, since the link reaction only attaches coenzyme A and removes no carbon from the pyruvate.',
        why: 'Forgets the link reaction\'s decarboxylation, which takes the first carbon off every pyruvate before anything reaches the cycle; only two carbons ride into the cycle on acetyl-CoA.' },
      { text: 'One leaves as CO<sub>2</sub> at the link reaction, and the other two leave in the water made at the end of the chain, where the oxygen is used.',
        why: 'Sends carbon down the chain. The chain handles electrons and touches no carbon at all; its water is made from the oxygen you breathed and the electrons the carbon gave up, and every carbon leaves as CO<sub>2</sub>.' },
    ],
    explain: 'Lactate is turned back into pyruvate\u00a0— an oxidation that reloads an NADH, with all three carbons kept\u00a0— and from there it goes the way glucose\'s pyruvate goes: one carbon off at the link reaction, and two CO<sub>2</sub> from the cycle for the acetyl group that joins it. As with glucose, the two the cycle releases on that turn are not the acetyl group\'s own atoms, which leave on later turns; the accounting balances by number.',
  },
  {
    id: 'i-krebs-carbon-accounting-2',
    objective: 'krebs-carbon-accounting',
    kind: 'free',
    question: 'Account for all six carbon atoms of one glucose molecule: at which step each leaves, and in what form. Then say where the oxygen you breathed in ends up, and why the carbon accounting balances by number rather than atom by atom.',
    rubric: [
      'glycolysis keeps all six, three in each pyruvate',
      'the link reaction takes one off each pyruvate as CO<sub>2</sub>: two gone',
      'each turn of the Krebs cycle releases two CO<sub>2</sub> in its two decarboxylations, and a glucose pays for two turns: four more',
      'six out of six, every one as carbon dioxide, on its way out through the lungs',
      'the oxygen breathed in takes no part in any of this: it is reduced to water at the very end of the chain, in a place the carbon never reaches',
      'the two CO<sub>2</sub> released on a turn come from the oxaloacetate, not from the acetyl group that has just joined it; the acetyl carbons leave on later turns',
      'so the cycle releases as many carbons as each acetyl group brings in, and the count of six is exact as a count, while the four carbons that entered the cycle leave a turn or more later',
    ],
    explain: 'The count is the clearest thing in the chapter and worth having cold. The atom-by-atom version is the margin note\'s, and following a labelled carbon round the cycle shows it: two turns release four carbons, and the four that leave are not, as it happens, the four that arrived.',
  },
  {
    id: 'i-krebs-carbon-accounting-3',
    objective: 'krebs-carbon-accounting',
    kind: 'mcq',
    question: 'Palmitate, a sixteen-carbon fatty acid, is taken apart by β-⁠oxidation into eight acetyl-CoA, which are burnt in the Krebs cycle. Account for its sixteen carbons: where do they leave, and as what?',
    options: [
      { text: 'Eight at the link reaction, one from each acetyl group, and the other eight in the Krebs cycle, all as CO<sub>2</sub>.',
        why: 'Sends every fuel through the link reaction because glucose goes that way. The link reaction takes a carbon off pyruvate; a fatty acid is cut straight into acetyl-CoA, which enters the cycle without passing through it.' },
      { text: 'Seven at the seven cuts of β-⁠oxidation and the other nine in the Krebs cycle, all of them as CO<sub>2</sub>.',
        why: 'Reads each cut as a decarboxylation. A cut of β-⁠oxidation removes two carbons as acetyl-CoA and loads carriers; it releases no carbon dioxide, so every carbon is still aboard when it reaches the cycle.' },
      { text: 'All sixteen in the Krebs cycle, as CO<sub>2</sub>: eight turns, two out on each; no carbon leaves in β-⁠oxidation.', correct: true },
      { text: 'Half as CO<sub>2</sub> in the Krebs cycle, and half in the water made at complex\u00a0IV, since a fat\'s carbons carry hydrogen, not oxygen.',
        why: 'Lets carbon leave in water, which has none. How reduced a fat\'s carbons are decides how much energy they release, not where they go; every carbon of every fuel leaves as carbon dioxide, and the water is made from the oxygen breathed in, with the electrons and protons the fuel gave up.' },
    ],
    explain: 'A fatty acid meets respiration at the cycle and nowhere earlier, so the link reaction, which removes the first two of glucose\'s carbons to leave, has nothing to do with it. β-⁠oxidation only cuts the chain into two-carbon pieces and loads carriers. Eight acetyl groups pay for eight turns, and each turn releases two CO<sub>2</sub>, so the count is sixteen out of sixteen\u00a0— exact as a count, although, as with glucose, the carbons released on a turn come from the oxaloacetate and a given acetyl group\'s own atoms leave on later turns.',
  },

  {
    id: 'i-krebs-is-a-cycle-1',
    objective: 'krebs-is-a-cycle',
    kind: 'mcq',
    question: 'A mitochondrion holds only a trace of oxaloacetate, far less than the acetyl-CoA that passes through it in an hour. Why is that trace enough?',
    options: [
      { text: 'Because oxaloacetate is one of the cycle\'s enzymes, and an enzyme is never used up by the reaction it catalyses, however many times it acts.',
        why: 'Confuses a regenerated intermediate with a catalyst. Oxaloacetate is consumed at the start of every turn\u00a0— it becomes part of citrate\u00a0— and remade at the end; it is a carrier in Section\u00a05.8\'s sense, which is not the same thing as an enzyme.' },
      { text: 'Because each turn uses one oxaloacetate to take in an acetyl group and remakes one at the end, so the same small pool goes round.', correct: true },
      { text: 'Because each acetyl group is built into a new oxaloacetate as it goes round, so the supply of it grows as fast as the fuel arrives.',
        why: 'Has the cycle making its starting compound out of the fuel. The acetyl group\'s two carbons are balanced by two CO<sub>2</sub>, so a turn ends with exactly the oxaloacetate it began with, and no more.' },
      { text: 'Because only the first turn needs any oxaloacetate; once citrate has been made, the cycle keeps itself going on its own citrate.',
        why: 'Pictures the cycle as needing a starter and then running by itself. Every single turn begins by joining an acetyl group to an oxaloacetate, and without one the acetyl group has nothing to join.' },
    ],
    explain: 'Section\u00a05.8\'s point about cyclic pathways, in the case it was pointing at: a cycle regenerates its own starting material every turn, so a small amount of it processes an unlimited amount of fuel. The economy is the one that runs ATP and NAD<sup>+</sup>\u00a0— not a store but a carrier, held in tiny amounts and recycled continuously.',
  },
  {
    id: 'i-krebs-is-a-cycle-2',
    objective: 'krebs-is-a-cycle',
    kind: 'mcq',
    question: 'No step of the Krebs cycle uses oxygen. Yet in a cell whose oxygen runs out, the cycle stops within seconds. What has it run out of?',
    options: [
      { text: 'Acetyl-CoA, because the link reaction needs oxygen to take the carbon off pyruvate, and without it nothing at all reaches the cycle to be burnt.',
        why: 'Moves the oxygen requirement one step upstream. The link reaction uses no oxygen either; it stops for the same reason as the cycle, because it too loads an NAD<sup>+</sup> and the chain has stopped emptying them.' },
      { text: 'ATP, since the cycle needs ATP to turn, and with the chain stopped the synthase is no longer making any for it.',
        why: 'Assumes the cycle runs on ATP. It spends none\u00a0— it makes one a turn\u00a0— and the cell\'s ATP pool is far larger than its carrier pool, so the carriers run out long before the ATP does.' },
      { text: 'NAD<sup>+</sup> and FAD. The cycle regenerates oxaloacetate, not its carriers: only the chain empties those, and the chain has stopped.', correct: true },
      { text: 'Oxaloacetate, because the cycle\'s last step, which remakes it, needs oxygen, and without that step the cycle cannot close.',
        why: 'Right that the last step stalls and wrong about why. That step remakes oxaloacetate by loading an NAD<sup>+</sup>, so it stops when the NAD<sup>+</sup> runs out; the shortage is the carrier, and the oxaloacetate runs short only as a consequence.' },
    ],
    explain: 'The cycle regenerates its own starting compound and nothing else. Four of its steps load a carrier\u00a0— three NAD<sup>+</sup> and one FAD\u00a0— and a carrier can be loaded again only after the chain has emptied it, so the cycle is exactly as independent of oxygen as its carriers are. It uses none, and it stops within seconds without it.',
  },
  {
    id: 'i-krebs-is-a-cycle-3',
    objective: 'krebs-is-a-cycle',
    kind: 'free',
    question: 'Explain why the Krebs cycle is a cycle rather than a line, name what it regenerates on every turn, and say why a very small amount of it can process an unlimited amount of fuel. Compare it with how a cell handles ATP and NAD<sup>+</sup>, and say what the cycle does not regenerate.',
    rubric: [
      'a line would need a continuous supply of its starting material',
      'each turn begins by joining the two-carbon acetyl group to the four-carbon oxaloacetate, making six-carbon citrate',
      'two carbons leave as CO<sub>2</sub>, and four more steps turn the four-carbon remainder back into oxaloacetate, ready for the next acetyl group',
      'so oxaloacetate is consumed and remade on every turn, and a trace of it, far less than the acetyl-CoA passing through in an hour, is enough',
      'this is Section\u00a05.8\'s point about cyclic pathways: a compound regenerated every turn processes an unlimited amount of material',
      'it is the same economy as ATP and NAD<sup>+</sup>: not a store but a carrier, held in tiny amounts and recycled continuously',
      'the carriers the cycle loads are not regenerated by the cycle: they depend on the chain, which is why the cycle stops when the oxygen does',
    ],
    explain: 'The economy has a price, which is the next thing the section shows: a pathway that runs on a trace of a compound it regenerates is stopped by anything that takes that compound away.',
  },

  {
    id: 'i-krebs-output-1',
    objective: 'krebs-output',
    kind: 'mcq',
    question: 'What does one turn of the Krebs cycle yield?',
    options: [
      { text: '6 NADH, 2 FADH<sub>2</sub> and 2 ATP, with 4 CO<sub>2</sub> released as the acetyl carbons are taken off.',
        why: 'Gives the yield per glucose as the yield per turn. A glucose pays for two turns, one for each of its acetyl groups, so these are one turn\'s figures doubled.' },
      { text: '4 NADH, 1 FADH<sub>2</sub> and 1 ATP, with 3 CO<sub>2</sub> released, one of them as the pyruvate enters.',
        why: 'Folds the link reaction into the cycle. One NADH and one CO<sub>2</sub> of these come from turning pyruvate into acetyl-CoA, which happens before the cycle begins; the cycle itself releases two carbons and loads three NAD<sup>+</sup>.' },
      { text: '3 NADH, 1 FADH<sub>2</sub> and 1 ATP, with 2 CO<sub>2</sub> released in its two decarboxylations.', correct: true },
      { text: '3 NADH, 1 FADH<sub>2</sub> and about 10 ATP, since the cycle cashes in its own carriers as it goes round.',
        why: 'Adds in what the carriers will later be worth, as though the cycle cashed them itself. The cycle makes one ATP directly, by the substrate-level route; its carriers are converted only when the chain unloads them on the inner membrane.' },
    ],
    explain: 'Two decarboxylations each reduce an NAD<sup>+</sup>; of the four steps back to oxaloacetate, one makes an ATP by substrate-level phosphorylation, one reduces FAD, one adds water and the last reduces a third NAD<sup>+</sup>. Three NADH, one FADH<sub>2</sub>, one ATP and two CO<sub>2</sub> a turn\u00a0— and nearly all of the cycle\'s value is in the carriers.',
  },
  {
    id: 'i-krebs-output-2',
    objective: 'krebs-output',
    kind: 'mcq',
    question: 'A molecule of palmitate is taken apart into eight acetyl-CoA. What do the turns of the Krebs cycle that those eight pay for yield, in carriers and in ATP made directly?',
    options: [
      { text: '24 NADH, 8 FADH<sub>2</sub> and 8 ATP: one turn for each acetyl group, at three NADH, one FADH<sub>2</sub> and one ATP a turn.', correct: true },
      { text: '48 NADH, 16 FADH<sub>2</sub> and 16 ATP, since the cycle turns twice for every acetyl group it takes in.',
        why: 'Carries "two turns per glucose" over as "two turns per acetyl group". A glucose makes two acetyl groups and each pays for one turn; eight acetyl groups pay for eight.' },
      { text: '16 NADH, 8 FADH<sub>2</sub> and 8 ATP, since the two decarboxylations are the only steps in a turn that reduce NAD<sup>+</sup>.',
        why: 'Counts only the NAD<sup>+</sup> reduced alongside the two decarboxylations, and forgets the third, at the step that remakes oxaloacetate.' },
      { text: '24 NADH and 8 FADH<sub>2</sub> but no ATP at all, since the chapter\'s point is that only the membrane makes any ATP.',
        why: 'Overcorrects the chapter\'s point. The chain makes no ATP and the synthase makes nearly all of it, but one step of the cycle makes one directly, by substrate-level phosphorylation, as glycolysis does.' },
    ],
    explain: 'Three NADH, one FADH<sub>2</sub> and one ATP a turn, and one turn for each acetyl group: eight turns give 24, 8 and 8. Add the seven NADH and seven FADH<sub>2</sub> of β-\u2060oxidation\'s seven cuts, take off the two ATP it cost to attach palmitate to coenzyme A, convert at 2.5 and 1.5, and you have the chapter\'s 106.',
  },
  {
    id: 'i-krebs-output-3',
    objective: 'krebs-output',
    kind: 'free',
    question: 'State what one turn of the Krebs cycle yields in reduced carriers and in ATP, and where in the turn each is made. Then say what one glucose molecule yields from the two turns it pays for, and why the cycle\'s own ATP is the least of what it produces.',
    rubric: [
      'per turn: 3 NADH, 1 FADH<sub>2</sub> and 1 ATP, with 2 CO<sub>2</sub> released',
      'two of the NADH come from the two decarboxylations, which take the molecule from six carbons to four',
      'of the four steps back to oxaloacetate, one makes an ATP by substrate-level phosphorylation, one reduces FAD to FADH<sub>2</sub>, one adds water and the last reduces a third NAD<sup>+</sup>',
      'a glucose makes two acetyl groups, so it pays for two turns: 6 NADH, 2 FADH<sub>2</sub>, 2 ATP and 4 CO<sub>2</sub>',
      'the cycle\'s own ATP is two per glucose; its carriers are worth about eighteen more once the chain has unloaded them (6 × 2.5 + 2 × 1.5)',
      'so the cycle, like the stages before it, makes almost no ATP itself: its product is loaded carriers',
    ],
    explain: 'That is the shape of the whole chapter in one stage: taking the carbon apart makes carriers, and the ATP comes later, from a membrane that touches no carbon at all.',
  },

  {
    id: 'i-krebs-amphibolic-1',
    objective: 'krebs-amphibolic',
    kind: 'mcq',
    question: 'A lymphocyte dividing fast during an infection needs a great deal of new DNA, and some of the building blocks of its bases are made from aspartate, which is made from the cycle\'s oxaloacetate. What happens to its Krebs cycle, and what must the cell do?',
    options: [
      { text: 'Nothing changes, because the cycle regenerates its own oxaloacetate on every turn, however much of it is drawn away in between the turns.',
        why: 'Overextends the cycle\'s economy. It regenerates oxaloacetate only if every carbon that went round comes back round; an intermediate drawn off to build something takes its carbon skeleton with it, and the oxaloacetate it would have become is lost.' },
      { text: 'The intermediate just before oxaloacetate piles up, and the whole cycle backs up behind it, just as it would behind a missing enzyme.',
        why: 'Runs Section\u00a05.8\'s blocked-pathway reasoning from the wrong side. There, an enzyme is missing and the compound before the gap accumulates; here nothing is missing, an intermediate is removed, and what happens is that everything downstream of it starves.' },
      { text: 'Nothing that more fuel cannot mend: the cell feeds its cycle extra acetyl-CoA to make up for all the carbon being drawn off.',
        why: 'Tops the cycle up with fuel, which cannot refill it. Each acetyl group needs an oxaloacetate to join, and its two carbons are balanced by two CO<sub>2</sub>, so acetyl-CoA adds nothing to the pool; the shortage is oxaloacetate, and only something that makes oxaloacetate can cure it.' },
      { text: 'The cycle stalls as oxaloacetate is drawn off; the cell must add new four-carbon compound, such as oxaloacetate made from pyruvate.', correct: true },
    ],
    explain: 'A pathway that feeds building as well as burning is amphibolic, and the cost of being both is immediate: draw an intermediate off and the cycle stops turning, because the oxaloacetate it would have regenerated has gone somewhere else. So a building cell has to top the cycle up with fresh four-carbon skeletons. Carboxylating pyruvate straight to oxaloacetate is the route the chapter names, and in the liver the same reaction is also the first step of making glucose.',
  },
  {
    id: 'i-krebs-amphibolic-2',
    objective: 'krebs-amphibolic',
    kind: 'free',
    question: 'Explain what it means for the Krebs cycle to be amphibolic, why drawing off one of its intermediates stops it, and how a building cell keeps it turning. Then use the same reasoning to say why a body short of carbohydrate makes ketone bodies from fat.',
    rubric: [
      'amphibolic: the cycle runs in both economies at once, taking fuel apart and supplying intermediates for building',
      'its intermediates are starting materials: the five-carbon one for glutamate, oxaloacetate for aspartate, another for haem, and citrate exported to the cytosol to build fat',
      'draw one off and the cycle stops turning, because the oxaloacetate it would have regenerated has gone elsewhere, and each acetyl group needs an oxaloacetate to join',
      'this is Section\u00a05.8\'s blocked-pathway reasoning from the other side: an intermediate removed, and everything downstream of it starves',
      'a building cell tops the cycle up by carboxylating pyruvate straight to oxaloacetate',
      'fat can be burnt only as fast as the cycle accepts acetyl groups, which depends on oxaloacetate, and in practice that comes from carbohydrate',
      'short of carbohydrate, acetyl-CoA accumulates faster than the cycle can take it, and the liver condenses the excess into ketone bodies, which other tissues, the brain among them, can burn',
    ],
    explain: '"Fat burns in the flame of carbohydrate" is the old phrase for the last point, and the chapter\'s verdict on it is exact: wrong as chemistry, since no carbohydrate is burnt to light anything, and right as bookkeeping, since without it the cycle cannot take the acetyl groups a fat delivers.',
  },
  {
    id: 'i-krebs-amphibolic-3',
    objective: 'krebs-amphibolic',
    kind: 'mcq',
    question: 'Four cells each run a Krebs cycle. In which must pyruvate carboxylase, or some other way of making new four-carbon compound, be working hardest to keep the cycle turning?',
    options: [
      { text: 'A heart muscle cell working flat out, burning acetyl-CoA as fast as it can, with nothing drawn off for building.',
        why: 'Confuses turning fast with running down. A cycle that loses nothing regenerates its oxaloacetate on every turn however fast it goes; speed uses up acetyl groups, not oxaloacetate.' },
      { text: 'A resting muscle cell whose cycle is barely turning, since an idle cycle slowly loses its oxaloacetate.',
        why: 'Pictures oxaloacetate as something that wears out with time. It leaves the cycle only when something takes it or an earlier intermediate away; a cycle that idles keeps its stock.' },
      { text: 'A cell whose cycle has stalled because its NADH is piling up faster than the chain can take it.',
        why: 'Reads every stalled cycle as short of oxaloacetate. This one is short of NAD<sup>+</sup>, and new four-carbon compound would have nothing to be oxidised by; what it needs is for the chain to empty its NADH.' },
      { text: 'A liver cell after a meal, sending citrate out to the cytosol to build fat: each citrate takes a four-carbon skeleton away.', correct: true },
    ],
    explain: 'A cycle runs down only when carbon is drawn off it, never because it turns fast or slowly. The liver cell building fat exports citrate, and each citrate that leaves takes with it the oxaloacetate that made it, so the cycle\'s stock shrinks by one for every citrate sent out. Acetyl-CoA cannot put it back, since each turn takes in two carbons and releases two; only a reaction that makes new four-carbon compound can, and carboxylating pyruvate is the one the chapter names\u00a0— also, in the liver, the first step of making new glucose.',
  },

  {
    id: 'i-other-fuels-1',
    objective: 'other-fuels',
    kind: 'mcq',
    question: 'Stearate is a saturated fatty acid of eighteen carbons. Taking it apart by β-\u2060oxidation, as the chapter takes apart sixteen-carbon palmitate, how many cuts are made, and what do they yield?',
    options: [
      { text: '9 cuts, giving 9 acetyl-CoA, 9 NADH and 9 FADH<sub>2</sub>: one cut, and one carrier of each kind, for every acetyl group.',
        why: 'Counts one cut per acetyl group. The last cut splits a four-carbon piece into two acetyl groups at once, so a chain of eighteen carbons gives nine acetyl-CoA from eight cuts, as palmitate\'s sixteen give eight from seven.' },
      { text: '8 cuts, giving 9 acetyl-CoA, 8 NADH and 8 FADH<sub>2</sub>, because the last cut leaves two acetyl groups at once.', correct: true },
      { text: '18 cuts, giving 18 acetyl-CoA, 18 NADH and 18 FADH<sub>2</sub>: one cut and one acetyl group for each carbon of the chain.',
        why: 'Forgets that each cut takes two carbons. An acetyl group is a two-carbon unit, which is why β-\u2060oxidation takes a chain apart two carbons at a time.' },
      { text: '8 cuts, giving 9 acetyl-CoA and 8 ATP made directly at the cuts, with no carriers loaded until the cycle.',
        why: 'Imagines each cut paying out ATP, as a step of glycolysis does. β-\u2060oxidation makes no ATP at all, and costs two to start; what each cut makes is one NADH and one FADH<sub>2</sub>, which are converted only at the chain.' },
    ],
    explain: 'Eighteen carbons make nine two-carbon acetyl groups, and because the last cut produces two at once, nine acetyl groups need eight cuts, each yielding one NADH and one FADH<sub>2</sub>. By the chapter\'s own accounting that is nine turns of the cycle at 10 ATP each, eight NADH at 2.5 and eight FADH<sub>2</sub> at 1.5, less the 2 ATP of attaching it to coenzyme A: about 120 ATP.',
  },
  {
    id: 'i-other-fuels-2',
    objective: 'other-fuels',
    kind: 'mcq',
    question: 'After a meal rich in protein, a liver cell burns some glutamate. The chapter says that the cycle\'s five-carbon intermediate is what glutamate is made from. Where does glutamate\'s carbon skeleton join respiration when it is burnt, and what happens to its nitrogen?',
    options: [
      { text: 'Its nitrogen goes first, as ammonia the liver makes into urea; the five-carbon skeleton enters the cycle at the five-carbon intermediate.', correct: true },
      { text: 'It is first turned into acetyl-CoA, as every fuel is, and so it joins the cycle at its very first step, bringing all its nitrogen in with it.',
        why: 'Takes "the cycle is where every fuel arrives" to mean every fuel arrives as acetyl-CoA. Amino acids enter at several points\u00a0— as pyruvate, as acetyl-CoA or as one of the cycle\'s own intermediates\u00a0— and none of them brings its nitrogen: the nitrogen goes first.' },
      { text: 'It is first made into glucose, since a body burns sugar and fat for energy but not amino acids, and so it joins at glycolysis.',
        why: 'Assumes an amino acid has to become sugar before a cell will burn it. A carbon skeleton joins wherever its shape fits, and the protein in a meal beyond what the body is building is burnt that same day, because there is nowhere to store it.' },
      { text: 'It cannot be burnt at all, because a molecule carrying nitrogen has to be excreted whole, and glutamate carries nitrogen.',
        why: 'Treats the nitrogen as spoiling the whole molecule. Only the amino group is a problem\u00a0— ammonia is toxic, so the liver turns it into urea\u00a0— and once it is off, what remains is an ordinary carbon skeleton, as burnable as any other.' },
    ],
    explain: 'An amino acid\'s entry point is set by its carbon skeleton, and the routes that build amino acids from the cycle\'s intermediates, run the other way, are the routes they come back in by: glutamate at the five-carbon intermediate, aspartate at oxaloacetate. In each case the nitrogen goes first, as ammonia, which the liver converts to urea. There is no store for protein, so what a meal supplies beyond what is being built is burnt this way every day.',
  },
  {
    id: 'i-other-fuels-3',
    objective: 'other-fuels',
    kind: 'free',
    question: 'Say where the parts of a fat join respiration\'s pathways, and use palmitate\'s ledger to show that a fat yields more ATP per gram than glucose does. Check the answer against a calorimeter, and say why the two methods agree.',
    rubric: [
      'a triglyceride is first hydrolysed, Section\u00a02.6\'s reaction, into glycerol and three fatty acids',
      'the glycerol joins glycolysis partway down',
      'each fatty acid is fed into β-\u2060oxidation, which cuts two carbons off at a time; every cut yields one acetyl-CoA, one NADH and one FADH<sub>2</sub>, and the acetyl groups enter the Krebs cycle',
      'palmitate, sixteen carbons, takes seven cuts and gives eight acetyl-CoA, seven NADH and seven FADH<sub>2</sub>, after costing two ATP to attach it to coenzyme A',
      'with the eight turns of the cycle those acetyl groups pay for, the molecule is worth about 106 ATP against glucose\'s 32',
      'per gram: palmitate weighs 256 grams a mole, so 0.41 moles of ATP per gram; glucose weighs 180, so 0.18; a ratio of 2.3',
      'a calorimeter puts fat at about 37 kilojoules a gram against carbohydrate\'s 17, a ratio of 2.2, so the two methods agree to within the rounding',
      'they agree because a fat\'s carbons are bonded almost entirely to hydrogen and have the whole fall to oxygen ahead of them, while many of a sugar\'s carbons already carry an oxygen and are partway down',
    ],
    explain: 'Per molecule, 106 against 32 overstates the difference, because a palmitate is a bigger molecule; per gram is the fair measure, and it still comes out more than twice as much. The entry point is where the count starts; the reason the count is larger is how far each carbon\'s electrons have to fall.',
  },

  // ============================================================================
  // 7.4 The chain makes a gradient, not ATP
  // ============================================================================

  {
    id: 'i-chain-components-1',
    objective: 'chain-components',
    kind: 'mcq',
    question: 'The electron transport chain is four large complexes and two small carriers. Which description of where they are is right?',
    options: [
      { text: 'All six float in the matrix among the Krebs cycle\'s enzymes, and pass electrons along whenever they happen to meet.',
        why: 'Puts the chain where the carriers are loaded rather than where they are unloaded. The chain has to sit in a membrane, because its product is a gradient across one; the complexes are integral proteins that span the bilayer and go nowhere.' },
      { text: 'The complexes drift through the membrane and bump into one another, while ubiquinone and cytochrome\u00a0c are fixed links bolted between them.',
        why: 'Has the fixed and the mobile the wrong way round. The complexes are large and stay put; it is because the complexes have no direct path for electrons between them that the two small carriers have to move.' },
      { text: 'Cytochrome c diffuses within the oily middle of the bilayer, and ubiquinone moves along the membrane\'s outer face in the water.',
        why: 'Swaps the two carriers\' homes. Ubiquinone is the one with the long hydrocarbon tail, which keeps it dissolved in the middle of the bilayer; cytochrome\u00a0c is a small water-soluble protein sitting loosely on the outer face.' },
      { text: 'The four complexes span the inner membrane and stay put; ubiquinone diffuses within the bilayer, cytochrome\u00a0c along its outer face.', correct: true },
    ],
    explain: 'Section\u00a03.2\'s diffusion argument, in a membrane. Complexes\u00a0I to IV are integral membrane proteins in Section\u00a04.2\'s sense and do not move far; between them, over nanometres, two carriers in Section\u00a05.8\'s sense do the moving\u00a0— ubiquinone inside the bilayer, cytochrome\u00a0c along its outer face.',
  },
  {
    id: 'i-chain-components-2',
    objective: 'chain-components',
    kind: 'mcq',
    question: 'Complex\u00a0II of the chain is also an enzyme of an earlier stage of respiration. Which?',
    options: [
      { text: 'The enzyme of glycolysis\'s sixth step, which oxidises a three-carbon fragment in the cytosol and reduces an NAD<sup>+</sup>.',
        why: 'Right step number, wrong pathway. Glycolysis\'s sixth step is in the cytosol and loads NAD<sup>+</sup>; complex\u00a0II is the Krebs cycle\'s sixth step, in the membrane, and loads FAD, which is exactly why its electrons join the chain directly.' },
      { text: 'The link reaction\'s enzyme assembly, which hands the electrons it takes from pyruvate straight into the chain.',
        why: 'Reaches for the stage that sits between the others. The link reaction\'s assembly is in the matrix and loads NAD<sup>+</sup>, whose electrons enter at complex\u00a0I; the only enzyme of the earlier stages built into the membrane is the cycle\'s FAD step.' },
      { text: 'Succinate dehydrogenase, the Krebs cycle\'s sixth step, which reduces FAD and is built into the membrane.', correct: true },
      { text: 'An ATP synthase that makes ATP from FADH<sub>2</sub>\'s electrons, which is why a pair from FADH<sub>2</sub> is worth less than one from NADH.',
        why: 'Gives a complex of the chain an ATP-making site, which none of them has\u00a0— and complex\u00a0II does not even pump. FADH<sub>2</sub> is worth less because its electrons enter below complex\u00a0I and skip its protons, not because something makes ATP from it.' },
    ],
    explain: 'An old friend. Succinate dehydrogenase takes a pair of electrons off succinate onto FAD, and because it is built into the inner membrane it hands them straight into the chain at ubiquinone instead of onto a carrier that has to find one. Its own fall is only about two kilojoules per mole, far less than the nineteen it costs to move one proton, so it pumps none.',
  },
  {
    id: 'i-chain-components-3',
    objective: 'chain-components',
    kind: 'free',
    question: 'Name what the electron transport chain is made of. Say which parts are fixed in the inner membrane and which move, how each mobile carrier stays where it works, and why the chain needs mobile carriers at all.',
    rubric: [
      'four large complexes, I to IV: integral membrane proteins, spanning the bilayer and going nowhere',
      'complex\u00a0I is a right-angled assembly of some forty-five proteins in a mammal; complex\u00a0IV carries copper as well as iron',
      'complex\u00a0II is the Krebs cycle\'s own succinate dehydrogenase, the one cycle enzyme built into the membrane',
      'two mobile carriers: ubiquinone, a small molecule whose long hydrocarbon tail keeps it dissolved in the bilayer, where it diffuses sideways',
      'and cytochrome\u00a0c, a small protein that sits loosely on the outer face of the inner membrane and skates along it',
      'the complexes have no direct path for electrons between them, even where they cluster together, so the mobile carriers ferry them\u00a0— carriers in Section\u00a05.8\'s sense, working over nanometres rather than between reactions',
    ],
    explain: 'The division is the one Section\u00a03.2 would predict: large things stay put and small things move, and over the few nanometres between two complexes a small carrier diffusing at random is fast enough.',
  },

  {
    id: 'i-redox-ladder-1',
    objective: 'redox-ladder',
    kind: 'mcq',
    question: 'In a working muscle, lactate dehydrogenase moves a pair of electrons between NADH and pyruvate. NAD<sup>+</sup>/NADH has E°′ = −0.32 V and pyruvate/lactate has E°′ = −0.19 V. Which way do the electrons go by themselves, and what is ΔG°′ per mole of pairs?',
    options: [
      { text: 'From lactate to NAD<sup>+</sup>, since electrons fall towards the more negative potential; ΔG°′ is about −25 kilojoules per mole.',
        why: 'Reads the ladder upside down. Electrons move by themselves from a low value to a high one\u00a0— from −0.32 towards −0.19 here\u00a0— which is why oxygen, at +0.82, is the bottom of the fall and not the top.' },
      { text: 'From NADH to pyruvate, towards the higher potential: ΔG°′ = −2 × 96.5 × 0.13, about −25 kilojoules per mole.', correct: true },
      { text: 'From NADH to pyruvate, releasing about 98 kilojoules per mole, which is 2 × 96.5 × (0.32 + 0.19).',
        why: 'Adds the two potentials\' sizes instead of taking their difference. Two values that are both negative and close together make a small step, not a large one: ΔE°′ is −0.19 minus −0.32, which is 0.13 V.' },
      { text: 'From NADH to pyruvate, releasing about 12.5 kilojoules per mole, which is 96.5 × 0.13.',
        why: 'Moves one electron where the reaction moves two. ΔG°′ = −<i>n</i>FΔE°′ with <i>n</i> = 2 for a pair, as every step of the chain\'s table is counted.' },
    ],
    explain: 'A small, downhill step: about a ninth of the fall from NADH to oxygen. It is the step a muscle uses to empty its carriers when the chain cannot take them, which is why so little of the fuel\'s value goes with it. The electrons have dropped 0.13 V of a possible 1.14, and the lactate still holds nearly all of the rest.',
  },
  {
    id: 'i-redox-ladder-2',
    objective: 'redox-ladder',
    kind: 'mcq',
    question: 'In the last step of the Krebs cycle, malate gives a pair of electrons to NAD<sup>+</sup> and becomes oxaloacetate. Oxaloacetate/malate has E°′ = −0.17 V and NAD<sup>+</sup>/NADH has −0.32 V. What does the ladder say about this step?',
    options: [
      { text: 'It is uphill: the electrons would have to climb 0.15 V, so ΔG°′ is about +29 kilojoules per mole, and the reverse is downhill.', correct: true },
      { text: 'It is downhill by about 29 kilojoules per mole, because every step of a pathway that releases energy must release some of it.',
        why: 'Assumes each step of a downhill pathway is downhill. A pathway\'s overall ΔG is negative; a single step can be uphill under standard conditions and still run in a cell, where the concentrations decide.' },
      { text: 'It cannot be worked out from these numbers, since malate is not one of the chain\'s carriers, and the ladder ranks the chain\'s carriers and nothing else.',
        why: 'Thinks reduction potentials belong to the chain. Any pair that gives and takes electrons has one\u00a0— the cycle\'s intermediates, pyruvate and lactate, nitrate and nitrite\u00a0— and the same arithmetic prices every transfer between them.' },
      { text: 'It is downhill by about 95 kilojoules per mole, which is 2 × 96.5 × (0.32 + 0.17).',
        why: 'Adds the two potentials\' sizes instead of taking their difference, and so gets both the size and the sign wrong. ΔE°′ from malate to NAD<sup>+</sup> is −0.32 minus −0.17, which is −0.15 V: a climb.' },
    ],
    explain: 'The ladder prices any pair, and this one comes out uphill: ΔE°′ = −0.32 − (−0.17) = −0.15 V, so ΔG°′ = −2 × 96.5 × (−0.15), about +29. The step runs in the matrix anyway, because the next enzyme takes each oxaloacetate the moment it appears and keeps it scarce: Section\u00a05.2\'s rule that the concentrations, and not the standard value, decide which way a reaction goes.',
  },
  {
    id: 'i-redox-ladder-3',
    objective: 'redox-ladder',
    kind: 'free',
    question: 'Explain how two standard reduction potentials tell you which way electrons move between two carriers and how much free energy the step releases. Then use the chapter\'s values to check that the chain\'s steps add up to the whole fall from NADH to oxygen, and say why complex\u00a0II pumps nothing.',
    rubric: [
      'E°′ says, in volts, how strongly a substance pulls electrons towards itself, measured at pH 7 against a hydrogen standard',
      'electrons move by themselves from a lower value to a higher one\u00a0— Section\u00a05.8\'s electronegativity argument, measured',
      'the free energy released is ΔG°′ = −<i>n</i>FΔE°′, with <i>n</i> the number of electrons, two for a pair, and F = 96.5 kilojoules per volt per mole',
      'NAD<sup>+</sup>/NADH at −0.32 V to oxygen at +0.82 V is 1.14 V: 2 × 96.5 × 1.14, about 220 kilojoules per mole',
      'complex\u00a0I releases about 70, complex\u00a0III about 41 and complex\u00a0IV about 110: 70 + 41 + 110 = 221, the extra kilojoule being rounding',
      'complex\u00a0II falls only from +0.03 to +0.04 V, about 2 kilojoules per mole',
      'moving one proton across the membrane costs about 19 kilojoules per mole, so complex\u00a0II could not pump one even if it were built to',
    ],
    explain: 'The arithmetic is the same whichever pair it is given, which is what makes the ladder useful: a chain, a fermentation and an anaerobic acceptor are all priced by one subtraction and one multiplication.',
  },

  {
    id: 'i-chain-pumps-protons-1',
    objective: 'chain-pumps-protons',
    kind: 'mcq',
    question: 'A researcher builds sealed lipid vesicles containing complexes\u00a0I, III and IV, with ubiquinone and cytochrome\u00a0c but no ATP synthase, and supplies NADH, oxygen, ADP and phosphate. What will she find?',
    options: [
      { text: 'ATP appearing as electrons pass along the chain, each of the pumping complexes phosphorylating ADP as its electrons fall.',
        why: 'The commonest form of the error: pumping read as phosphorylating. None of the complexes can join ADP to phosphate, and with no synthase in the vesicle nothing in it can make ATP, however fast the chain runs.' },
      { text: 'Electrons flowing to oxygen, but no protons moving, because a proton pump needs ATP to drive it and the vesicle has none.',
        why: 'Carries over Section\u00a04.6\'s pump, which was driven by ATP. These pumps are driven by electrons falling, which is why the chain can build a gradient in a vesicle that holds no ATP at all.' },
      { text: 'Nothing happening at all, because the chain works only with a synthase attached to it, the two being parts of one machine.',
        why: 'Pictures the chain and the synthase as one machine with a chemical link between them, which is what the whole field assumed before 1961. They are separate proteins that share nothing but the membrane and the gradient across it.' },
      { text: 'Electrons flowing to oxygen and protons pumped into a gradient across the membrane; no ATP, and pumping that slows as it steepens.', correct: true },
    ],
    explain: 'The chain\'s product is a gradient, and this vesicle shows it with the synthase taken out of the argument: protons pile up on one side, no ATP appears, and the pumps stall against the gradient they have built, because a pump can only push so hard. Add a synthase and the protons have a way back that makes ATP; add a leak and they have one that makes heat.',
  },
  {
    id: 'i-chain-pumps-protons-2',
    objective: 'chain-pumps-protons',
    kind: 'free',
    question: 'Explain what the electron transport chain does with the energy of each fall, with the numbers, and say exactly what is wrong with the sentence "the electron transport chain makes ATP".',
    rubric: [
      'each of complexes\u00a0I, III and IV spends the energy of its own fall moving protons from the matrix out into the intermembrane space',
      'against their concentration and against the charge that piles up as they go',
      'four at I, four at III and two at IV: ten protons for a pair of electrons from NADH; complex\u00a0II pumps none',
      'the pumps are driven by electrons falling, not by ATP as Section\u00a04.6\'s pump was',
      'moving a proton against about 200 mV costs about 19 kilojoules per mole, so ten cost 193 of the 220 the fall released: the chain keeps very nearly nine-tenths',
      'none of the four complexes has a site that joins ADP to phosphate: not one molecule of ATP is made by any of them',
      'the chain\'s product is a gradient, and the ATP is made by a separate machine, ATP synthase, which spends it',
      'the sentence folds oxidative phosphorylation, which is the chain and the synthase together, into the chain alone',
    ],
    explain: 'The correction matters beyond this section. If the chain made the ATP itself, a torn membrane would not stop the ATP and neither would an uncoupler, and Section\u00a07.8 is built on the fact that both do.',
  },
  {
    id: 'i-chain-pumps-protons-3',
    objective: 'chain-pumps-protons',
    kind: 'free',
    question: 'A bacterium such as <i>E.\u00a0coli</i> has no mitochondria, and its electron transport chain and ATP synthase sit in its plasma membrane. Say which way its chain pumps protons and on which side of the membrane the ATP is made. Then explain why its ATP counts as oxidative phosphorylation although no complex of its chain makes any.',
    rubric: [
      'the chain pumps protons out of the cytosol, across the plasma membrane, to the outside',
      'the cytosol plays the part of the matrix: it is the side the protons are pumped from and the side the synthase\'s head faces',
      'the ATP is made in the cytosol, by the synthase, as the protons flow back in through it',
      'none of the chain\'s complexes makes ATP: what the pumping complexes do with the energy of their fall is move protons, and the chain\'s product is a gradient',
      'oxidative phosphorylation is the chain and the synthase together, joined only by the gradient; the phosphorylation is the synthase\'s part',
      'a mitochondrion\'s inner membrane descends from a bacterium\'s plasma membrane, which is why the matrix and a bacterium\'s cytosol are the same side of it',
    ],
    explain: 'Finding the matrix in a bacterium tests whether the geometry has been understood or memorised. The side the protons are pumped from and the side the ATP is made on are the same side in both, because the synthase makes ATP where the protons arrive; a bacterium\'s cytosol is that side, as the matrix is in a mitochondrion whose inner membrane was once a bacterium\'s own.',
  },

  {
    id: 'i-oxygen-is-the-acceptor-1',
    objective: 'oxygen-is-the-acceptor',
    kind: 'mcq',
    question: 'Which statement about oxygen\'s part in respiration is right?',
    options: [
      { text: 'It ends up in the carbon dioxide you breathe out, which is why the oxygen you breathe in and the carbon dioxide you breathe out match.',
        why: 'The commonest picture, and wrong. As much carbon as a glucose brings in has left as CO<sub>2</sub> by the time its electrons reach oxygen, though not the same atoms; the oxygen goes into water, at complex\u00a0IV, in a place the carbon never reaches.' },
      { text: 'It takes the electrons at the chain\'s bottom and leaves as water; a chain can end on any acceptor low enough, and oxygen is the lowest a cell meets.', correct: true },
      { text: 'It is what the chain is for: respiration exists to turn oxygen into water, and the ATP is made along the way as a benefit.',
        why: 'Reads the destination as the purpose. The chain exists to take a fall in steps and pump protons with it; oxygen is the best sink available, and chains that end on nitrate or sulfate do the same job with less.' },
      { text: 'It is used by the Krebs cycle to release carbon dioxide, which is why the cycle stops as soon as the oxygen runs out.',
        why: 'Right that the cycle stops and wrong about why. No step of the cycle uses oxygen; it stops because its carriers cannot be unloaded once the chain has nowhere to put the electrons.' },
    ],
    explain: 'Oxygen sits at +0.82 V, lower on the ladder than anything else a cell is likely to meet, and the whole 220-kilojoule fall exists because it is there. That makes it the best sink, not the purpose: the chain\'s product is a gradient, and chains that end on other acceptors make one too, with less. Section\u00a06.7 says where the oxygen came from\u00a0— somebody else\'s photosynthesis.',
  },
  {
    id: 'i-oxygen-is-the-acceptor-2',
    objective: 'oxygen-is-the-acceptor',
    kind: 'free',
    question: 'Say what oxygen does at the end of the chain, and trace why everything upstream stops without it, as far back as glycolysis in a cell that cannot ferment. Then say why oxygen is not what the chain is for, and where it came from.',
    rubric: [
      'oxygen is the terminal electron acceptor: it takes the electrons at the bottom of the chain and leaves as water',
      'complex\u00a0IV needs four electrons and four protons to turn one O<sub>2</sub> into two waters, and holds the oxygen between an iron and a copper atom until all four have arrived',
      'without oxygen, complex\u00a0IV has nowhere to put its electrons and stops; cytochrome\u00a0c stays reduced, so complex\u00a0III stops; ubiquinone stays reduced, so complex\u00a0I stops',
      'in an animal cell, complex\u00a0I is the only thing that can empty the matrix\'s NADH in any quantity, and the shuttles that empty the cytosol\'s hand their electrons to the same stopped chain, so NADH can no longer be emptied',
      'the Krebs cycle and the link reaction stop for want of NAD<sup>+</sup>, and within seconds so does glycolysis, unless the cell ferments',
      'oxygen is not what the chain is for: it is the best sink available, at +0.82 V, and the 220-kilojoule fall exists because it is there',
      'it is the waste product of somebody else\'s photosynthesis (Section\u00a06.7), and before there was any in the air no organism could respire this way',
    ],
    explain: 'The order of the backing-up is worth knowing by heart, because Section\u00a07.7 and Section\u00a07.8 both run it: every carrier above the missing acceptor fills, and each stage that loads a carrier stops as soon as it has no empty one to load\u00a0— glycolysis included, unless a fermentation empties its carriers, though it never touches the chain.',
  },
  {
    id: 'i-oxygen-is-the-acceptor-3',
    objective: 'oxygen-is-the-acceptor',
    kind: 'mcq',
    question: 'A volunteer breathes, for a few minutes, air whose oxygen is made of the heavy isotope <sup>18</sup>O. Where does the heavy oxygen turn up first in her body?',
    options: [
      { text: 'In water, made at complex\u00a0IV, which joins her body water; none of it goes straight into the carbon dioxide her cycles are releasing.', correct: true },
      { text: 'In the carbon dioxide she breathes out, within a minute, since the oxygen breathed in is what the carbon leaves the body with.',
        why: 'The picture most people start with, and wrong. As much carbon as the fuel brought in has left as CO<sub>2</sub> by the time its electrons reach oxygen, though not the same atoms, and that carbon dioxide\'s oxygen came from the fuel and from water; the oxygen breathed in is reduced at the end of the chain, in a place the carbon never reaches.' },
      { text: 'In the carbon dioxide, but only once the Krebs cycle has turned, since the cycle adds the oxygen to each carbon it releases.',
        why: 'Has the cycle use oxygen. No step of the Krebs cycle takes up O<sub>2</sub>; the cycle stops without oxygen only because the chain can no longer empty its NADH.' },
      { text: 'Nowhere, since the oxygen only carries electrons away and is breathed back out unchanged once they have been passed on.',
        why: 'Pictures oxygen as a carrier that is reused, like NAD<sup>+</sup>. It is the end of the line: each O<sub>2</sub> takes four electrons and four protons and becomes two molecules of water, and does not come back.' },
    ],
    explain: 'The oxygen in the carbon dioxide you breathe out came from the fuel and from water taken up in the cycle; the oxygen you breathe in is used once, at complex\u00a0IV, where four electrons and four protons turn each O<sub>2</sub> into two waters. Soon a little of the label does reach her breath by a side route, because carbon dioxide dissolved in body water swaps oxygen atoms with it, fast, through carbonic anhydrase; but it is a trace, diluted into all her body water, which is why the question asks where it turns up first.',
  },

  {
    id: 'i-fadh2-enters-lower-1',
    objective: 'fadh2-enters-lower',
    kind: 'mcq',
    question: 'Imagine a mutant complex\u00a0I that still passes electrons from NADH to ubiquinone but pumps no protons. How many protons would a pair of electrons from NADH now drive across the membrane, and how would NADH compare with FADH<sub>2</sub>?',
    options: [
      { text: 'Still ten, because NADH is simply the better carrier, and the difference between the two lies in the carriers themselves, not in the chain.',
        why: 'Puts the difference in the carrier. FADH<sub>2</sub> is worth less not because it is a worse carrier but because its electrons join the chain lower down and skip complex\u00a0I\'s pumping; take that pumping away and the difference goes with it.' },
      { text: 'Six for NADH and two for FADH<sub>2</sub>, since complex\u00a0I\'s four protons would now be lost from both pairs alike.',
        why: 'Sends FADH<sub>2</sub>\'s electrons through complex\u00a0I, which they never enter. The cycle\'s FADH<sub>2</sub> hands its pair in at complex\u00a0II, below it, so a broken complex\u00a0I costs FADH<sub>2</sub> nothing.' },
      { text: 'Six, the same as a pair from FADH<sub>2</sub>: with complex\u00a0I pumping nothing, both pairs are pumped only by complexes\u00a0III and IV.', correct: true },
      { text: 'None, since without complex\u00a0I pumping first no gradient can start, and the complexes below it have nothing to add to.',
        why: 'Treats the first pump as the one the others depend on. Each pump works with the energy of its own fall, independently; electrons from succinate drive six protons through III and IV with complex\u00a0I nowhere in their path.' },
    ],
    explain: 'The difference between the two carriers is a difference of entry point. A pair from NADH passes three pumping complexes\u00a0— four protons at I, four at III, two at IV\u00a0— and a pair from the cycle\'s FADH<sub>2</sub> joins at complex\u00a0II, below I, and passes only two of them. Take away complex\u00a0I\'s pumping and the two routes pump the same six, and the seventy or so kilojoules NADH releases at complex\u00a0I leave as heat.',
  },
  {
    id: 'i-fadh2-enters-lower-2',
    objective: 'fadh2-enters-lower',
    kind: 'free',
    question: 'Explain why a pair of electrons from FADH<sub>2</sub> drives fewer protons across the inner membrane than a pair from NADH. Say where it joins the chain, how much free energy each route releases, and what that makes an FADH<sub>2</sub> worth compared with an NADH.',
    rubric: [
      'the Krebs cycle\'s FADH<sub>2</sub> hands its pair in at complex\u00a0II, which passes it to ubiquinone: below complex\u00a0I',
      'so it bypasses the first of the three proton-pumping steps, complex\u00a0I\'s four protons',
      'complex\u00a0II pumps none itself: its fall is about two kilojoules per mole, and moving a proton costs about nineteen',
      'the pair drives six protons, four at complex\u00a0III and two at complex\u00a0IV, instead of ten',
      'it releases about 150 kilojoules of free energy on the way down, instead of 220',
      'an FADH<sub>2</sub> is worth roughly three-fifths of an NADH: six protons against ten, about 1.5 ATP against 2.5',
      'the reason is not that the carrier is worse but that it joins the chain lower down',
    ],
    explain: 'The same arithmetic prices any pair that reaches the chain at ubiquinone rather than at complex\u00a0I, whatever carried it there\u00a0— which is why the electrons of the glycerol 3-\u2060phosphate shuttle, handed to an FAD on the membrane\'s outer face, are worth 1.5 as well.',
  },
  {
    id: 'i-fadh2-enters-lower-3',
    objective: 'fadh2-enters-lower',
    kind: 'mcq',
    question: 'In the laboratory, ascorbate with a dye called TMPD hands its electrons straight to cytochrome\u00a0c. How many protons does a pair of electrons from it drive across the inner membrane, and what does that show about FADH<sub>2</sub>?',
    options: [
      { text: 'Ten, since every pair that reaches oxygen releases the same 220 kilojoules, whatever carried it to the chain.',
        why: 'Takes the fall to be fixed by the bottom alone. It is the difference between where the pair starts and oxygen, and a pair handed in at cytochrome\u00a0c starts much further down the ladder, at about +0.25 volts rather than NADH\'s −0.32.' },
      { text: 'Six, the same as FADH<sub>2</sub>, since any pair that skips complex\u00a0I drives six protons, however far down it joins.',
        why: 'Learns two entry points as two fixed prices. What a pair drives is the pumping steps below its entry; the cycle\'s FADH<sub>2</sub> passes III and IV, and a pair handed in at cytochrome\u00a0c passes IV alone.' },
      { text: 'Four, since complex\u00a0IV takes four protons for each oxygen, the same number as complex\u00a0I pumps for each pair.',
        why: 'Counts the protons that go into water as protons pumped. Complex\u00a0IV takes four from the matrix to make two waters from each O<sub>2</sub>, and separately pumps two across the membrane for each pair of electrons.' },
      { text: 'Two, pumped at complex\u00a0IV alone: the lower a pair joins the chain, the fewer pumping steps it passes.', correct: true },
    ],
    explain: 'The price of a pair of electrons is set by the pumping complexes below the point where it enters. From NADH it passes I, III and IV and drives ten protons; from the cycle\'s FADH<sub>2</sub>, handed in at complex\u00a0II, it passes III and IV and drives six; handed in at cytochrome\u00a0c, it passes IV alone and drives two. The carrier matters only because it decides where the pair gets on. Protons pumped are not the whole price, though. Complex\u00a0IV also moves the pair\'s two electrons inwards to meet two protons from the matrix, so it moves four charges for the pair, as complex\u00a0I does. A pair handed in at cytochrome\u00a0c makes about one ATP, not the half of one that two protons out of NADH\'s ten would suggest.',
  },

  // ============================================================================
  // 7.5 The gradient turns a motor
  // ============================================================================

  {
    id: 'i-proton-motive-force-1',
    objective: 'proton-motive-force',
    kind: 'mcq',
    question: 'Across a working mitochondrion\'s inner membrane, the matrix is about 0.75 of a pH unit more alkaline than the intermembrane space and about 150 mV negative with respect to it. Which statement about the proton-motive force is right?',
    options: [
      { text: 'About 200 mV: about 46 from the pH difference and 150 from the charge, both pushing protons inwards, so three-quarters is charge.', correct: true },
      { text: 'About 46 mV, because protons move down their concentration gradient, and a difference of 0.75 of a pH unit is the whole of that gradient.',
        why: 'Counts only the concentration term. A proton carries a charge as well, so its gradient is electrochemical\u00a0— Section\u00a04.3\'s two terms\u00a0— and here the charge term is the larger by far.' },
      { text: 'About 104 mV, since the two parts pull in opposite directions, so the pH part has to be taken off the charge part.',
        why: 'Gives the two terms opposite signs. The intermembrane space is both more acidic and more positive than the matrix, so both push a proton the same way, back into the matrix, and they add.' },
      { text: 'Mostly the pH difference, as in a chloroplast\'s thylakoid, since it is protons, not charges, that the chain is pumping.',
        why: 'Carries the thylakoid\'s split over to the mitochondrion, and forgets that every proton pumped carries a charge. A thylakoid lets other ions cross and cancel much of its charge, so its force is mostly pH; the inner mitochondrial membrane does not, and there the charge carries about three-quarters.' },
    ],
    explain: 'Section\u00a02.4 made a pH difference into a concentration ratio, and Section\u00a04.7 made the ratio into millivolts: 61.5 mV for each tenfold difference at body temperature, so 0.75 of a pH unit is about 46 mV. Pumping positive charge out leaves the matrix some 150 mV negative, a stronger potential than a resting nerve cell carries. Together they come to roughly 200 mV, and a mole of protons falling through it returns about 19 kilojoules.',
  },
  {
    id: 'i-proton-motive-force-2',
    objective: 'proton-motive-force',
    kind: 'free',
    question: 'Say what the proton-motive force is and name its two parts. Work out each part for a mitochondrion with a pH difference of 0.75 and a membrane potential of 150 mV, say which carries most of the force, and say why a thylakoid\'s force is split the other way.',
    rubric: [
      'the proton-motive force is the energy in a proton gradient across a membrane, written as a voltage',
      'it has two parts because a proton carries both a concentration and a charge: it is Section\u00a04.3\'s electrochemical gradient',
      'the concentration part is a pH difference, which is a concentration ratio (Section\u00a02.4); at body temperature 61.5 mV for each tenfold difference, so 0.75 of a pH unit is about 46 mV',
      'the charge part: pumping positive charge out leaves the matrix about 150 mV negative with respect to the outside',
      'the two add to roughly 200 mV, of which about three-quarters is charge',
      'a mole of protons falling through 200 mV returns 96.5 × 0.2, about 19 kilojoules',
      'a thylakoid\'s force is mostly pH, because its membrane lets other ions cross and cancel the charge as the protons build it (Section\u00a06.5)',
    ],
    explain: 'Same principle, same units, opposite split. The force is one quantity with two terms, not two mechanisms, and which term dominates depends only on whether the membrane lets other ions cancel the charge.',
  },
  {
    id: 'i-proton-motive-force-3',
    objective: 'proton-motive-force',
    kind: 'mcq',
    question: 'An alkaliphilic bacterium lives at pH 10.5 and keeps its cytosol near pH 8.3, with its inside about 180 mV negative. Taking 61.5 mV for each pH unit, about how large is its proton-motive force, and which way does each part push protons?',
    options: [
      { text: 'About 315 mV: 180 from the charge and 135 from the pH difference, added, since the two parts always add up.',
        why: 'Adds the sizes and forgets the directions. The two parts add as signed quantities; here the outside is the more alkaline side, so the pH difference pushes protons out while the charge pulls them in.' },
      { text: 'About 45 mV, inwards: the charge pulls protons in with 180 mV, and the pH difference pushes them out with 135.', correct: true },
      { text: 'About 135 mV, from the pH difference alone, since the proton-motive force is a pH gradient and the charge is a separate thing.',
        why: 'Takes the force to be its pH term. A proton carries a charge as well as a concentration, so the membrane potential is part of the same force, and in a mitochondrion it is most of it.' },
      { text: 'None: with the outside more alkaline than the inside, protons have no reason to come in, so the cell can make no ATP.',
        why: 'Reads the force from the concentrations alone. The charge still pulls protons in, and it is larger than the pH push outwards, so a small force remains, and the cell lives on it.' },
    ],
    explain: 'The proton-motive force is one quantity with two terms, and each term has a sign. In a mitochondrion both push protons into the matrix and they add to about 200 mV. Here the pH term is turned round, 2.2 units against the inflow, about 135 mV, and the charge has to overcome it before anything is left: about 45 mV, under a quarter of a mitochondrion\'s. Such a bacterium makes its ATP on a small force.',
  },

  {
    id: 'i-chemiosmosis-principle-1',
    objective: 'chemiosmosis-principle',
    kind: 'mcq',
    question: 'Section\u00a05.4 said that two reactions are coupled only through a shared chemical intermediate. The chain and the synthase share none. Why does chemiosmosis not break the rule?',
    options: [
      { text: 'It does break it: chemiosmosis shows that heat released right beside the synthase can drive it after all.',
        why: 'Rescues the new case by giving up the old principle. Heat at one temperature can do no work anywhere, beside the synthase or not; what passes between the chain and the synthase is a gradient, which is not heat.' },
      { text: 'It does not, because the proton is the shared intermediate after all: each one is made by the chain, carried across the membrane, and then used up by the synthase.',
        why: 'Makes a proton the X∼P everyone was looking for. A single proton carries no free energy of its own, and none is made or used up; what holds the energy is the difference across the membrane, which is why a torn membrane loses it with every proton still there.' },
      { text: 'It does not, because the rule was only ever meant for reactions in solution, and a membrane is allowed to break it.',
        why: 'Exempts membranes instead of explaining them. One principle covers both cases: something that holds free energy in a directed form has to pass from one process to the other, and a shared molecule and a held gradient are two ways of doing that.' },
      { text: 'Because the rule forbids paying with heat released into the surroundings; a held gradient, like a shared intermediate, keeps free energy in a directed form.', correct: true },
    ],
    explain: 'Section\u00a05.4\'s rule was a case of something more general. What it forbade was paying for a reaction with energy released into the surroundings, because in a cell that is heat, and heat at one temperature does nothing. A shared intermediate is one way of keeping the energy out of the surroundings; a gradient across a membrane, which Section\u00a04.7 showed to be a real store of free energy, is another. The gradient is not a molecule and it is not heat, and Mitchell\'s achievement was seeing that those are not the only two options.',
  },
  {
    id: 'i-chemiosmosis-principle-2',
    objective: 'chemiosmosis-principle',
    kind: 'mcq',
    question: 'A few bacteria have an ATP synthase whose ring binds sodium ions instead of protons. If such a bacterium makes its ATP by the chemiosmotic principle, what must be true of it?',
    options: [
      { text: 'Nothing can be: chemiosmosis is defined by protons, so a synthase that turns on sodium must be making ATP some other way.',
        why: 'Takes the example for the principle. What chemiosmosis needs is an ion gradient held across a sealed membrane between the machine that makes it and the machine that spends it; which ion carries the charge is a detail of the machinery.' },
      { text: 'Something in its membrane must pump sodium out, and the synthase spends that sodium gradient as the ions fall back in.', correct: true },
      { text: 'Its sodium pump and its synthase must be joined by a carrier molecule that ferries each sodium ion from the one to the other.',
        why: 'Puts a shared intermediate back between the two machines, which is the X∼P idea in a new form. Nothing passes between them but the gradient: any pump that raises it and any synthase that lets it fall will do.' },
      { text: 'It must pump sodium into the cell, since a synthase makes its ATP as ions pass out of the cell through it.',
        why: 'Has the gradient the wrong way round. A synthase makes ATP from ions falling down their gradient through it\u00a0— into the cell here, as protons fall into a bacterium or into the matrix\u00a0— so the pump must push them out.' },
    ],
    explain: 'Chemiosmosis is the principle that an ion gradient across a sealed membrane can carry energy from one machine to another with nothing chemical passing between them. Protons are the usual ion, and the sodium-driven synthases turn the same kind of rotor on sodium instead. It is Racker and Stoeckenius\'s point from another direction: the synthase does not care what built the gradient, only that it is there.',
  },
  {
    id: 'i-chemiosmosis-principle-3',
    objective: 'chemiosmosis-principle',
    kind: 'free',
    question: 'Explain how a gradient made by one set of proteins is spent by another with no chemical intermediate passing between them. Say what carries the energy instead, why the search for an intermediate failed, and why this does not contradict Section\u00a05.4.',
    rubric: [
      'the chain pumps protons across the inner membrane; the gradient is where the energy is held; a separate enzyme, ATP synthase, makes ATP by letting the protons fall back',
      'nothing chemical passes between the two halves: what carries the energy is the proton gradient, the proton-motive force',
      'laboratories hunted for a high-energy intermediate, written X∼P, reasoning that because substrate-level phosphorylation works through a shared intermediate the chain\'s phosphorylation must too',
      'nobody isolated it because it does not exist: Mitchell proposed in 1961 that there was none to find',
      'Section\u00a05.4 forbade paying with energy released into the surroundings, which in a cell is heat',
      'the general principle is that what passes between coupled processes must still hold free energy in a directed form, never heat; a shared intermediate is one such form, and a gradient across a membrane is another (Section\u00a04.7)',
      'a gradient is neither a molecule nor heat, and seeing that those are not the only two options was Mitchell\'s real achievement',
    ],
    explain: 'The same statement covers the acid-bath and light-driven experiments and the sodium-driven synthases of a few bacteria: whatever raises an ion gradient across a sealed membrane can be spent by whatever lets it fall.',
  },

  {
    id: 'i-sealed-compartment-1',
    objective: 'sealed-compartment',
    kind: 'mcq',
    question: 'Mitochondria are prepared roughly, and most of their inner membranes are torn open into sheets, though every protein in them still works. Given NADH, oxygen, ADP and phosphate, the chain runs at least as fast as ever. What happens to ATP production, and why?',
    options: [
      { text: 'It carries on as normal, since the chain and the synthase still sit side by side in the same membrane and can go on working together.',
        why: 'Assumes the two machines only have to be near each other. Nothing passes between them but the gradient, and a membrane with holes in it holds none, however close together the proteins sit.' },
      { text: 'It rises, since the protons pumped out now flow back faster through the tears and turn the synthase faster as they go.',
        why: 'Has the protons returning through the synthase. The tears are a second way back that bypasses it entirely, and protons take whichever way is open; a flow through a hole turns nothing.' },
      { text: 'It almost stops: a torn membrane cannot hold a gradient, so the protons the chain pumps come straight back through the tears, turning nothing.', correct: true },
      { text: 'It roughly halves, since half of the protons come back through the synthase and the other half come back through the tears.',
        why: 'Pictures the tear as a side channel that takes a share. A hole in a bilayer is a far easier way back than any protein, so the gradient does not divide between two routes: it collapses, and nothing is left to drive the synthase at all.' },
    ],
    explain: 'This was the chemiosmotic prediction the field\'s own frustrations had been confirming all along: mitochondria had to be prepared gently, or they made no ATP. A chemical intermediate in solution would not care whether the vesicle it was in had a hole; a gradient cannot survive one.',
  },
  {
    id: 'i-sealed-compartment-2',
    objective: 'sealed-compartment',
    kind: 'mcq',
    question: 'Protons pumped into the intermembrane space stay there long enough for the synthase to spend them. What stops them simply leaking back?',
    options: [
      { text: 'The inner membrane: a proton is an ion, and a bare lipid bilayer will not let a charged particle through.', correct: true },
      { text: 'The outer membrane, which closes the intermembrane space off from the cytosol and keeps the pumped protons in.',
        why: 'Gives the outer membrane a job it cannot do. It is studded with wide pores that pass anything up to about 5000 daltons, so the intermembrane space is chemically very nearly the cytosol; the inner membrane is the only boundary that can hold a gradient.' },
      { text: 'Their size: a proton is too large to squeeze between the lipid molecules of a bilayer.',
        why: 'Reaches for size, when a proton is the smallest ion there is. What keeps it out of a bilayer is its charge\u00a0— Section\u00a04.3\'s rule that the oily middle of a membrane will not take an ion.' },
      { text: 'The synthase itself, which holds on to each proton in its ring until the moment that proton can be used.',
        why: 'Mistakes the synthase for a store. It is a way through, not a cage: a proton binds a ring subunit only for the length of one ride through the membrane, and the gradient is held by the bilayer around the machine.' },
    ],
    explain: 'Two facts from Chapter\u00a04 do the work. A proton is an ion, which Section\u00a04.3\'s rules say a bare bilayer will not pass, so the gradient can be held at all; and a bilayer closes itself (Section\u00a04.1), so a sealed compartment is the normal case. The inner membrane is also unusually tight\u00a0— about three-quarters protein by mass, and letting almost nothing through without a transporter\u00a0— which is why it, and not the outer membrane, holds the gradient.',
  },
  {
    id: 'i-sealed-compartment-3',
    objective: 'sealed-compartment',
    kind: 'free',
    question: 'Explain why chemiosmosis needs an unbroken membrane, and name the two facts from Chapter\u00a04 that make an unbroken membrane possible. Predict what a torn one does to ATP production while the chain runs as fast as it ever did, and say why a chemical-intermediate hypothesis made no such prediction.',
    rubric: [
      'the energy is held as a gradient across the membrane, and nothing chemical passes between the chain and the synthase',
      'a torn membrane cannot hold a gradient, so no ATP is made, however fast the chain runs and however much ADP is available',
      'a proton is an ion, and a bare bilayer will not pass one (Section\u00a04.3): that is what makes the gradient holdable at all',
      'a bilayer closes itself (Section\u00a04.1), so an intact vesicle is the normal case and a torn one is an experiment that has to be arranged',
      'a high-energy intermediate in solution would not care whether its vesicle had a hole, so that hypothesis predicted nothing of the kind',
      'which is why mitochondria have to be prepared gently, and why the field\'s own experimental frustrations were evidence all along',
    ],
    explain: 'A prediction that the rival cannot make is the useful kind. Section\u00a07.8\'s uncoupler is a finer tool: instead of tearing the membrane, it puts in a hole with legs, and the chain speeds up while the ATP stops. The rival could explain that trace too, by having the uncoupler break its intermediate down; what it could not explain was why every classical uncoupler turned out to be a weak acid that carries protons across a bare lipid membrane.',
  },

  {
    id: 'i-synthase-is-a-motor-1',
    objective: 'synthase-is-a-motor',
    kind: 'mcq',
    question: 'In Boyer\'s binding change mechanism, the turning shaft forces each of ATP synthase\'s three catalytic sites through three shapes. Where is the energy of the falling protons actually spent?',
    options: [
      { text: 'On joining ADP to phosphate, since making that bond is the uphill part of making an ATP.',
        why: 'Assumes the enzyme works as the reaction does in solution. On the enzyme, ATP forms and re-splits in the tight site with almost no free energy change at all\u00a0— Boyer\'s isotope-exchange result, and the reason the mechanism surprised everyone.' },
      { text: 'On letting the finished ATP go; joining ADP and phosphate in the tight site is very nearly free.', correct: true },
      { text: 'On turning the head, which spins round with the ring and grinds the ADP against the phosphate until they join.',
        why: 'Has the wrong part turning. The head is held still by an external stalk; what turns is the ring and the bent shaft inside the head, and it is the shaft\'s asymmetry that changes the shape of each site as it passes.' },
      { text: 'On pushing the protons through the membrane, which uses up most of it before any can reach the head.',
        why: 'Has the protons being pushed rather than falling. They move down the gradient and deliver energy as they go; the ring turns because they can get on only at one side and off only at the other.' },
    ],
    explain: 'Each site cycles from a shape that binds ADP and phosphate loosely, to one that grips them and lets them join, to one that opens and releases the ATP. The surprise is where the work goes: forming ATP in the tight site costs almost nothing, and what the falling protons pay for is opening the site to let the product out. Walker\'s 1994 structure caught the three sites in three different shapes in a single crystal.',
  },
  {
    id: 'i-synthase-is-a-motor-2',
    objective: 'synthase-is-a-motor',
    kind: 'free',
    question: 'Describe ATP synthase as a rotary machine: its parts, how a proton makes the ring turn and why only one way, what the turning shaft does to the three catalytic sites, and how many ATP one rotation makes, at what cost in protons, in a mammal.',
    rubric: [
      'a ring of identical subunits sits in the membrane beside a fixed subunit carrying two half-channels that do not meet',
      'a proton enters the outer half-channel from the intermembrane space, binds one subunit of the ring, rides round with it for almost a full turn, and leaves by the inner half-channel into the matrix',
      'because protons can get on only at one side and off only at the other, the ring can turn only one way',
      'a bent, asymmetric shaft attached to the ring turns inside a head of three pairs of subunits, which is held still by an external stalk',
      'the shaft forces each of the three catalytic sites through three shapes: binding ADP and phosphate loosely, gripping them so that they join, and opening to release the ATP',
      'the energy is spent on releasing the ATP, not on making it',
      'three sites, so three ATP per rotation; the ring sets the protons per rotation, eight in a mammal, so about 2.7 protons for each ATP at the synthase itself, before the cost of getting it out of the matrix',
      'the evidence: Walker\'s 1994 structure, with the three sites in three different shapes in one crystal, and Noji\'s 1997 film of an actin filament turning on the shaft',
    ],
    explain: 'Section\u00a03.6\'s kinesin walked along a track; this machine turns on the spot, and the size of its ring is its gear ratio. A bigger ring takes more protons a turn for the same three ATP, which suits a membrane that can raise only a weaker force.',
  },
  {
    id: 'i-synthase-is-a-motor-3',
    objective: 'synthase-is-a-motor',
    kind: 'mcq',
    question: 'The ATP synthase of <i>Spirulina</i>, a cyanobacterium, has a ring of fifteen subunits in its membrane part, where a mammal\'s has eight. How many ATP does one full rotation make, and about how many protons does each ATP cost at the synthase?',
    options: [
      { text: 'Fifteen ATP, one for each subunit of the ring, since each proton that turns the ring along a step makes one ATP.',
        why: 'Puts the catalysis in the ring. The ring is the rotor the protons turn; the ATP is made in the head, which has three catalytic sites whatever the ring has.' },
      { text: 'Six ATP, since the head is made of three pairs of subunits and each pair holds two catalytic sites.',
        why: 'Counts every subunit of the head as a site. The head has three pairs, and one member of each pair is catalytic, so a rotation drives three sites through their three shapes and makes three ATP.' },
      { text: 'Three ATP, one from each catalytic site in the head, so fifteen protons buy three and each ATP costs five.', correct: true },
      { text: 'Five ATP, one for every three protons, since each ATP costs three protons whatever the size of the ring.',
        why: 'Treats protons per ATP as fixed. It is a gear ratio, the ring\'s subunits divided by the head\'s three sites, which is why a mammal pays about 2.7 and a chloroplast about 4.7.' },
    ],
    explain: 'The head sets the ATP per rotation and the ring sets the protons, so the protons per ATP are the ring\'s subunits divided by three: eight in a mammal gives 2.7, fourteen in a chloroplast 4.7, and fifteen gives five. A bigger ring is a lower gear: more protons for each ATP, and more leverage from each.',
  },

  {
    id: 'i-synthase-reversible-1',
    objective: 'synthase-reversible',
    kind: 'mcq',
    question: 'A bacterium living with no oxygen and no other terminal acceptor makes all its ATP by glycolysis and fermentation. Yet it keeps a proton gradient across its membrane, which it needs to hold its internal pH and to drive the transporters that bring its food in. Where does the gradient come from?',
    options: [
      { text: 'It cannot have one: a proton gradient needs an electron transport chain, and with no acceptor there is none running.',
        why: 'Treats the chain as the only thing that can build a gradient. ATP synthase is an ATP-driven proton pump named for the direction we care about, and with ATP in hand and no gradient pushing it, it runs as a pump.' },
      { text: 'It is left over from the last time the bacterium had oxygen, since a gradient, once built, lasts until it is used.',
        why: 'Treats a gradient as a store that keeps. Every membrane leaks a little and the transporters spend it; a gradient that nothing is maintaining runs down.' },
      { text: 'Fermentation builds it, pumping protons out across the membrane as it regenerates the NAD<sup>+</sup>.',
        why: 'Gives fermentation a membrane it does not have. Its reactions are soluble enzymes in the cytosol, handing electrons from NADH to an organic molecule; nothing in them carries a proton across anything.' },
      { text: 'Its ATP synthase runs backwards, spending glycolytic ATP to pump protons out.', correct: true },
    ],
    explain: 'Which way the synthase runs is decided by the conditions, not by the machine. With a strong gradient and ADP to phosphorylate, it makes ATP; with no gradient and ATP to spare, it hydrolyses ATP and pumps. A fermenting bacterium uses the second direction on purpose, which is Section\u00a04.7\'s pump driven as a generator, read from the other end.',
  },
  {
    id: 'i-synthase-reversible-2',
    objective: 'synthase-reversible',
    kind: 'free',
    question: 'Predict which way ATP synthase runs from the proton-motive force and the ratio of ATP to ADP, and explain why its direction is set by those rather than by the machine. Then say what a cell whose gradient has collapsed does with the ATP it has left, and why cells carry a protein to stop it.',
    rubric: [
      'ATP synthase is an ATP-driven proton pump, and we name it for the direction we care about',
      'if the protons falling through it release more than an ATP is worth at the cell\'s ATP-to-ADP ratio, it makes ATP; if less, it runs the other way',
      'so a strong force and a low ATP-to-ADP ratio favour synthesis, and a weak force or a high ratio first stall it and then reverse it',
      'the machine runs close to its balance point, so a modest fall in the force is enough to turn it round: Section\u00a05.4\'s rule that when the two sides are close, the conditions decide',
      'Section\u00a04.7\'s pump, driven hard enough backwards, becomes a generator; this is the same statement read from the other end',
      'collapse the gradient\u00a0— stop the oxygen, block the chain\u00a0— and it reverses, hydrolysing ATP as fast as it can to pump protons back out',
      'so a cell starved of oxygen loses its ATP faster than it would if the synthase simply stopped',
      'cells carry a small protein whose job is to clamp the machine when this happens, which is one reason a heart muscle cell can survive a few minutes without blood',
    ],
    explain: 'Reversibility is not a defect of the design; it is what a machine working close to its balance point looks like. The price is that a failing gradient drains the cell\'s ATP instead of merely failing to make more, and the clamp is the cell\'s answer to that price.',
  },
  {
    id: 'i-synthase-reversible-3',
    objective: 'synthase-reversible',
    kind: 'mcq',
    question: 'Isolated mitochondria are given cyanide, and a dye shows their membrane potential collapse. ATP is then added, and the potential comes back, though the chain is still blocked. What restored it, and what would oligomycin, which jams the synthase\'s proton channel, do next?',
    options: [
      { text: 'The synthase, run backwards on the ATP to pump protons out; oligomycin would jam it, and the potential would fall again.', correct: true },
      { text: 'The chain, now driven by ATP rather than by electrons, as Section\u00a04.6\'s pump was; oligomycin would change nothing.',
        why: 'Has the chain\'s pumps run on ATP. They are driven by electrons falling, which cyanide has stopped; no complex of the chain can spend ATP, and the only thing in the membrane that can spend it on protons is the synthase.' },
      { text: 'The synthase, run backwards on the ATP; oligomycin would change nothing, since it stops the synthase only when it makes ATP.',
        why: 'Gives the machine two paths, one for each direction. It is one machine with one channel, and the protons pumped out go through the channel they come in by, so jamming it stops both directions.' },
      { text: 'The cyanide coming off complex\u00a0IV, since the ATP gives the complex the energy to throw off its inhibitor.',
        why: 'Pictures ATP as a general-purpose push that can undo an inhibitor. Cyanide binds complex\u00a0IV\'s iron and no amount of fuel or energy relieves it; the chain stays blocked, and what the dye shows is a different machine at work.' },
    ],
    explain: 'ATP synthase is an ATP-driven proton pump named for the direction we usually care about. With the chain stopped and ATP plentiful, the balance tips and it runs backwards, spending ATP to rebuild the gradient\u00a0— the same reversal that drains a cell starved of oxygen. Oligomycin blocks the one channel both directions use, which is how an experimenter shows that the restored potential was the synthase\'s doing.',
  },

  {
    id: 'i-chemiosmosis-evidence-1',
    objective: 'chemiosmosis-evidence',
    kind: 'mcq',
    question: 'Mitchell\'s hypothesis could have been shown to be false. Which observation would have done it?',
    options: [
      { text: 'Mitochondria making ATP only while oxygen was present and the chain was running at full speed.',
        why: 'Picks an observation both hypotheses predict. Chemiosmosis and the chemical-intermediate idea both expect ATP only while the chain runs, so it cannot tell them apart; a test is an observation one of them forbids.' },
      { text: 'The chain and the synthase turning out to be separate proteins, sitting apart in the membrane.',
        why: 'Reads a prediction of the hypothesis as a threat to it. Chemiosmosis needs two separate machines joined only by a gradient; finding them separate is what it expects.' },
      { text: 'ATP made with no closed membrane, or an isolated X∼P that could phosphorylate ADP.', correct: true },
      { text: 'A decade of laboratories trying, and failing, to isolate the high-energy intermediate from the chain.',
        why: 'Has the evidence pointing the wrong way. The failure counted against the rival, not against Mitchell\u00a0— and on its own it proved little, since something missing may only be hard to find. A falsification is a positive observation the hypothesis forbids.' },
    ],
    explain: 'Section\u00a01.8\'s question: what would show this to be false? A torn preparation making ATP would have, because a gradient cannot survive a hole; so would an isolated X∼P that could phosphorylate ADP. Neither has ever been produced\u00a0— and a light-driven proton pump from an archaean, put into a vesicle with a mitochondrial synthase and nothing else, makes ATP.',
  },
  {
    id: 'i-chemiosmosis-evidence-2',
    objective: 'chemiosmosis-evidence',
    kind: 'mcq',
    question: 'Vesicles containing mitochondrial ATP synthase and nothing else are soaked at pH 5 until the inside is at pH 5, then moved, in the dark, into a buffer at pH 8 holding ADP and phosphate. What does chemiosmosis predict?',
    options: [
      { text: 'A burst of ATP as protons fall out through the synthase, stopping once the inside has come up to pH 8.', correct: true },
      { text: 'No ATP, since no electrons are moving, and the energy for ATP has to come from the chain\'s own chemistry.',
        why: 'Keeps the chain as the source, which is the chemical-intermediate picture. The chain is only the pump that happens to be there; the synthase spends a gradient, whoever made it.' },
      { text: 'ATP made steadily for as long as the vesicles stay in the pH 8 buffer, with their ADP and phosphate to hand.',
        why: 'Treats the gradient as a supply rather than a store. Each proton that falls out shrinks the difference and nothing refills it, so the synthesis stops once the inside and the outside have met.' },
      { text: 'No ATP, since a pH difference with no voltage behind it is far too weak to turn the synthase.',
        why: 'Takes the mitochondrion\'s split for a requirement. Three pH units is about 185 mV at body temperature, nearly the whole of a mitochondrion\'s force, and a thylakoid runs its synthase on a force that is mostly pH.' },
    ],
    explain: 'Jagendorf and Uribe did the same thing with thylakoids (Section\u00a06.5), and Racker and Stoeckenius made the gradient with a light-driven pump instead. Either way the synthase cannot tell where its gradient came from, which is the whole of Mitchell\'s claim: the energy is in the gradient, and nothing chemical has to pass from the chain.',
  },
  {
    id: 'i-chemiosmosis-evidence-3',
    objective: 'chemiosmosis-evidence',
    kind: 'free',
    question: 'State what observation would have shown the chemiosmotic hypothesis to be false. Then describe an experiment that made a proton gradient with no chain at all and got ATP out of it, and say why its result is so hard to explain any other way.',
    rubric: [
      'the question that decides a hypothesis (Section\u00a01.8) is what would show it to be false',
      'an intermediate isolated from the chain that could phosphorylate ADP would have; so would ATP synthesis by a preparation with no closed membrane; neither has ever been produced',
      'Racker and Stoeckenius, 1974: artificial lipid vesicles containing two proteins and nothing else, mitochondrial ATP synthase and bacteriorhodopsin, a light-driven proton pump from a salt-loving archaean',
      'no chain, no Krebs cycle, no mitochondrion, no oxygen: they shone light on the vesicles and got ATP',
      'the pump has no connection to respiration whatever, so the only thing it can have given the synthase is a gradient',
      'the companion experiment, Section\u00a06.5\'s: chloroplast membranes soaked in acid and moved into alkali made ATP in the dark, with no light and no electron transport',
      'Mitchell had his Nobel prize in 1978',
    ],
    explain: 'An experiment that removes every candidate for the intermediate and still gets the product is the strongest kind there is. A light-driven pump from an archaean and a bath of acid have nothing else in common with a mitochondrion, and both gave the synthase what it needed: a gradient is the only thing they share.',
  },

  // ============================================================================
  // 7.6 The number is a range, and here is why
  // ============================================================================

  {
    id: 'i-yield-arithmetic-1',
    objective: 'yield-arithmetic',
    kind: 'mcq',
    question: 'The heart takes up a lactate from the blood, turns it back into pyruvate and oxidises it completely; the heart uses the malate–aspartate shuttle. At the chapter\'s measured values, about how many ATP does the lactate yield?',
    options: [
      { text: 'About 12.5: the four NADH and the FADH<sub>2</sub> of the link reaction and the cycle, plus the cycle\'s own ATP.',
        why: 'Misses the carrier at the first step. Turning lactate back into pyruvate is an oxidation that loads an NADH\u00a0— the same one the muscle spent making the lactate\u00a0— and in a heart its electrons reach the matrix at almost the full 2.5.' },
      { text: 'About 15: five NADH at 2.5, one FADH<sub>2</sub> at 1.5 and one ATP made directly.', correct: true },
      { text: 'About 16, half of glucose\'s 32, since a lactate carries exactly half of a glucose\'s carbon.',
        why: 'Halves the whole glucose ledger, including the part the muscle has already had. Glycolysis\'s two ATP were made in the muscle that produced the lactate; what a lactate brings the heart is the rest, one ATP short of half.' },
      { text: 'About 18: five NADH at 3 each, one FADH<sub>2</sub> at 2, and one ATP made directly by the cycle.',
        why: 'Uses the round numbers behind the old 38. The measured values are about 2.5 and 1.5, because the protons per ATP, counting the one spent moving it out of the matrix, do not divide evenly into the protons per carrier.' },
    ],
    explain: 'Do it by stages, as for glucose. Lactate to pyruvate loads an NADH, which the heart\'s shuttle delivers to the matrix at almost full value; the link reaction loads another; one turn of the cycle loads three NADH and one FADH<sub>2</sub> and makes one ATP. Five times 2.5, plus 1.5, plus 1, is 15\u00a0— and two lactates\' 30, plus the two ATP the muscle took from glycolysis, is the 32 a whole glucose gives a heart.',
  },
  {
    id: 'i-yield-arithmetic-2',
    objective: 'yield-arithmetic',
    kind: 'mcq',
    question: 'Of the 32 ATP a liver cell gets from one glucose, which part is certain\u00a0— a whole number that does not depend on the tissue, the rate or the state of the membrane?',
    options: [
      { text: 'The 28 from oxidative phosphorylation, since the chain\'s chemistry is fixed and every NADH pumps exactly ten protons.',
        why: 'Takes a fixed proton count for a fixed ATP count. Ten protons per NADH is fixed, but they buy a fractional number of ATP, and in a living cell the leak, which varies with the tissue and with how much ATP is being spent, takes a share; so the 28 is not a certainty.' },
      { text: 'The 20 from the eight NADH made in the matrix, since those need no shuttle and so are converted without any loss.',
        why: 'Right that no shuttle touches them, wrong that nothing else does. Their 2.5 each is a ratio of proton counts, not a whole number, and in a living cell the leak takes a share of it too.' },
      { text: 'None of it: every term in the sum varies from cell to cell, so the 32 is only ever an average.',
        why: 'Overcorrects. The four ATP made by handing a phosphate straight from a substrate to ADP are a chemical equation\'s whole numbers, and they are the same in every cell; only the conversion of carriers is a range.' },
      { text: 'The 4 made directly by substrate-level phosphorylation; the rest converts carriers, at fractional ratios the leak lowers.', correct: true },
    ],
    explain: 'The four direct ATP are certain, and they are the only certain part. The rest needs two numbers\u00a0— what each carrier is worth and which shuttle carries the cytosolic pair\u00a0— and neither is a whole number or the same everywhere. That is why the honest answer is a range, 30 to 32, and not a number.',
  },
  {
    id: 'i-yield-arithmetic-3',
    objective: 'yield-arithmetic',
    kind: 'free',
    question: 'Add up the ATP one glucose yields in a liver cell, taking each term from the stage that produced it and each carrier at its measured value. Then redo the sum for a fast skeletal muscle cell, and say which single term changes and why.',
    rubric: [
      'made directly, by substrate-level phosphorylation: 2 in glycolysis and 2 in the Krebs cycle, 4 in all',
      'NADH: 2 from glycolysis in the cytosol, 2 from the link reaction and 6 from the cycle in the matrix, 10 in all',
      'FADH<sub>2</sub>: 2, from the cycle',
      'measured values: about 2.5 ATP per NADH and about 1.5 per FADH<sub>2</sub>',
      'liver, with the malate–aspartate shuttle: 4 + 8 × 2.5 + 2 × 2.5 + 2 × 1.5 = 4 + 20 + 5 + 3 = 32',
      'fast skeletal muscle, with the glycerol 3-\u2060phosphate shuttle, counts the two cytosolic NADH at 1.5, since their electrons enter at ubiquinone: 4 + 20 + 3 + 3 = 30',
      'only the four made directly are certain; every other term converts a carrier, at a ratio that is not a whole number and that a living cell\'s leak lowers',
    ],
    explain: 'About 30 to 32, then, and a reader asked for one number should give the range and say which tissue. Every term in the sum was derived earlier in the chapter, which is what makes it the best exercise in it.',
  },

  {
    id: 'i-p-o-ratio-1',
    objective: 'p-o-ratio',
    kind: 'mcq',
    question: 'Careful measurement puts the yield at about 2.5 ATP per NADH, not a whole number. Why not a whole number?',
    options: [
      { text: 'Because an NADH delivers two and a half electrons on average, some molecules giving two and some giving three.',
        why: 'Looks for the fraction in the electrons. NADH always carries exactly two; the fraction comes in later, where protons are turned into ATP.' },
      { text: 'Because the synthase makes two and a half ATP a rotation, one of its three sites working only half the time.',
        why: 'Puts the fraction in the synthase\'s output. Each rotation makes three ATP, one per site; the fraction enters because a rotation takes eight protons, and eight is not a multiple of three.' },
      { text: 'Because the protons do not divide evenly: ten go out per NADH, and each ATP delivered to the cytosol takes about 3.7 back.', correct: true },
      { text: 'Because the measurement is not yet good enough, and the true value is the 3 that the older textbooks gave.',
        why: 'Assumes nature deals in whole numbers and the measurement is off. Nothing makes a whole number likely: the protons per NADH and per ATP do not divide evenly, and 3 was read off early measurements by people who expected a whole number.' },
    ],
    explain: 'Ten protons per NADH; 8 ÷ 3, about 2.7, per ATP at the synthase itself; about one more for carrying the ATP out and the phosphate in, 3.7 in all; and 10 ÷ 3.7 is about 2.7. Careful measurement, corrected for leak, gives about 2.5, close to that: the fraction is in the proton counts. A living cell gets somewhat less again, because some protons leak back, most when it is spending little ATP.',
  },
  {
    id: 'i-p-o-ratio-2',
    objective: 'p-o-ratio',
    kind: 'mcq',
    question: 'Imagine a mitochondrion with a mammal\'s chain, ten protons per NADH, but a synthase ring of ten subunits like yeast\'s, with delivering each ATP to the cytosol still costing about one proton. Before any leak, about how many ATP per NADH would its machinery give?',
    options: [
      { text: 'About 2.3: each delivered ATP costs 10 ÷ 3 + 1, about 4.3 protons, and 10 ÷ 4.3 is about 2.3.', correct: true },
      { text: 'About 3: ten protons turn a ten-subunit ring exactly once, and one turn of the ring makes three ATP.',
        why: 'Forgets the delivery charge. One turn of the ring does make three ATP from ten protons, but each of them still has to be carried out of the matrix at about a proton apiece, and that is paid from the same ten.' },
      { text: 'About 3.7: a bigger ring gives more leverage, so the same ten protons make more ATP than they would in a mammal.',
        why: 'Reads "leverage" as more output per proton. A bigger ring takes more protons a turn for the same three ATP, so each ATP costs more protons, not fewer: it is the gear that suits a weaker force.' },
      { text: 'About 2.7, the same as a mammal\'s, since the ATP per NADH is set by the chain and not by the synthase.',
        why: 'Leaves the synthase out of the ratio. The chain sets the protons per NADH; the ring and the transport set the protons per ATP, and the yield is the one divided by the other.' },
    ],
    explain: 'The yield per NADH is one count divided by another: protons per NADH, set by the chain, over protons per delivered ATP, set by the ring and the transport. A ring of eight gives a mammal about 2.7 before the leak; ten would give about 2.3; fourteen, a chloroplast\'s, about 1.8. That is the sense in which the chapter calls the gear ratio tuned to the force.',
  },
  {
    id: 'i-p-o-ratio-3',
    objective: 'p-o-ratio',
    kind: 'free',
    question: 'Explain, from the protons the chain pumps and the protons the synthase and the transporters need, why about two and a half ATP are made per NADH rather than three. Say why it is not a whole number, and why a living cell gets somewhat less than the machinery predicts.',
    rubric: [
      'a pair of electrons from NADH drives ten protons out',
      'a mammalian synthase has a ring of eight subunits and makes three ATP per revolution, so at the synthase itself each ATP costs about 2.7 protons',
      'but the ATP is made in the matrix and needed in the cytosol: the transporter swapping matrix ATP for cytosolic ADP carries a net charge out, and the phosphate that replaces it comes in with a proton',
      'between them that costs about one more proton, so an ATP delivered to the cytosol costs about 3.7',
      'ten protons should therefore give 10 ÷ 3.7, about 2.7 ATP',
      'measured by Hinkle and others, corrected for leak, the value is about 2.5, and 1.5 for FADH<sub>2</sub>, close to the machinery\'s 2.7 and 1.6',
      'it is not a whole number because ten protons out and 3.7 back per ATP do not divide evenly; a living cell gets less again because some protons leak back, and the leak takes its largest share when the cell spends little ATP and the gradient stands high, so what a cell gets differs between tissues and with how hard it is working',
    ],
    explain: 'Keep the two proton prices apart: about 2.7 per ATP at the synthase, and about 3.7 per ATP delivered to where it is used. The first is a gear ratio; the second is the one that sets what an NADH is worth to the cell.',
  },

  {
    id: 'i-shuttle-cost-1',
    objective: 'shuttle-cost',
    kind: 'mcq',
    question: 'The two NADH that glycolysis makes in the cytosol are worth about 2.5 ATP each in a liver cell, but only about 1.5 in a fast fibre of a leg muscle. Why?',
    options: [
      { text: 'The muscle has to carry its NADH across the inner membrane by active transport, and that transport costs one ATP for each NADH.',
        why: 'Reads the shuttle\'s cost as a fare paid to move the molecule. NADH never crosses at all\u00a0— only its electrons do\u00a0— and the cost is the pumping step those electrons skip, not a charge for the journey.' },
      { text: 'Different shuttles: the liver\'s puts the electrons onto a matrix NAD<sup>+</sup>, the muscle\'s onto an FAD whose electrons enter below complex\u00a0I.', correct: true },
      { text: 'The muscle ferments its cytosolic NADH to lactate, so those electrons never reach the chain, and the 1.5 is what little is left.',
        why: 'Half-true of a muscle at full stretch, which does pour out lactate; but the 1.5 is the value of the electrons the shuttle does carry into the chain, and it is lower because they arrive below complex\u00a0I.' },
      { text: 'The muscle\'s mitochondria leak more protons than the liver\'s, so every NADH a muscle makes is worth less than a liver\'s.',
        why: 'Blames the membrane. The eight NADH made in the matrix are counted at 2.5 in both tissues; only the cytosolic pair differs, and it differs because of where its electrons enter the chain.' },
    ],
    explain: 'NADH is large and carries two negative charges, so by Section\u00a04.3\'s rules it cannot cross the inner membrane, and there is no transporter for it; its electrons cross instead. The malate–aspartate shuttle, in heart and liver, puts them onto a matrix NAD<sup>+</sup>, at almost full value. The glycerol 3-\u2060phosphate shuttle, in fast skeletal muscle, puts them onto an FAD on the membrane\'s outer face, from which they reach the chain at ubiquinone and are worth 1.5.',
  },
  {
    id: 'i-shuttle-cost-2',
    objective: 'shuttle-cost',
    kind: 'free',
    question: 'Explain why the two NADH made in the cytosol can be worth less than the eight made in the matrix. Name the two shuttles, say which tissues use each, and say what each one costs and what it buys.',
    rubric: [
      'the two NADH from glycolysis are made in the cytosol; NADH is large and carries two negative charges, so by Section\u00a04.3\'s rules it cannot cross the inner membrane, and there is no transporter for it',
      'what crosses instead are its electrons, carried by one of two electron shuttles',
      'the malate–aspartate shuttle, used by heart and liver, reduces a compound in the cytosol, carries it in and re-oxidises it inside, so the electrons arrive on a matrix NAD<sup>+</sup> and are worth almost the full 2.5',
      'it is driven one way, into the matrix, because the aspartate leaving is swapped for glutamate and a proton; that proton is its only cost',
      'the glycerol 3-\u2060phosphate shuttle, used by fast skeletal muscle and insect flight muscle, hands the electrons to an FAD on the outer face of the inner membrane; they enter the chain at ubiquinone, below complex\u00a0I, and are worth 1.5',
      'so it costs about one ATP per NADH, and what it buys is a route that does not depend on the matrix\'s own carriers: it hands the electrons straight to ubiquinone, however loaded the matrix is',
      'which is why a liver cell gets about 32 ATP from a glucose and a fast skeletal muscle cell 30',
    ],
    explain: 'Whether the cytosolic pair is worth less depends on the shuttle. Carried by malate and aspartate, it is worth almost what a matrix pair is worth: the shuttle spends one proton of the ten. Carried by glycerol 3-\u2060phosphate, it is worth what an FADH<sub>2</sub> is worth, and a fast muscle that needs its cytosolic NADH emptied however loaded its matrix is pays that price willingly.',
  },
  {
    id: 'i-shuttle-cost-3',
    objective: 'shuttle-cost',
    kind: 'mcq',
    question: 'Imagine a muscle cell that carries its cytosolic NADH\'s electrons into its mitochondria by the glycerol 3-\u2060phosphate shuttle alone, given a drug that blocks the shuttle\'s enzyme on the inner membrane. Working hard, with plenty of oxygen, what happens?',
    options: [
      { text: 'Nothing much: NADH simply crosses the inner membrane on its own and, arriving in the matrix, is worth the full 2.5.',
        why: 'Lets NADH cross the membrane. It is large and carries two negative charges, and there is no transporter for it; only its electrons ever cross, and only by a shuttle.' },
      { text: 'Its glucose yields more, 32 ATP instead of 30, since the NADH no longer pays the shuttle\'s fee for the journey.',
        why: 'Reads the shuttle as a fare charged for carrying NADH, so that removing it saves the fare. The shuttle is the only road in; without it the cytosolic electrons do not reach the chain at any price.' },
      { text: 'Its matrix NADH piles up, and the Krebs cycle stops for want of NAD<sup>+</sup>, although the chain is still working.',
        why: 'Treats the cytosol and the matrix as one pool of carriers. The membrane keeps them apart, which is the whole reason a shuttle is needed; the matrix NADH is emptied by complex\u00a0I as before.' },
      { text: 'Its cytosolic NADH cannot be emptied, so to keep glycolysis running it reduces more pyruvate to lactate, oxygen or no oxygen.', correct: true },
    ],
    explain: 'Cytosolic NADH has two ways back to NAD<sup>+</sup>: a shuttle that takes its electrons into the mitochondrion, or lactate dehydrogenase. Block the only shuttle and the second is all that is left, so the cell ferments with oxygen all around it. It is also why cytosolic NADH can be worth less than matrix NADH: it is worth whatever its route in makes it, almost 2.5 by malate and aspartate, 1.5 by glycerol 3-\u2060phosphate, and nothing through the chain at all if there is no route.',
  },

  {
    id: 'i-why-not-38-1',
    objective: 'why-not-38',
    kind: 'mcq',
    question: 'Older textbooks gave 38 ATP per glucose for heart and liver and 36 for skeletal muscle. Keeping their assumptions\u00a0— 3 ATP per NADH, 2 per FADH<sub>2</sub>, nothing charged for transport\u00a0— where does the 36 come from?',
    options: [
      { text: 'From the cost of carrying glycolysis\'s two NADH into the matrix, one ATP each, which muscle pays and the heart was taken not to.',
        why: 'Reads the shuttle as a fare for moving NADH. NADH never crosses; its electrons are handed to an FAD and join the chain at ubiquinone, below complex\u00a0I. The arithmetic comes out the same, two fewer, but the cause is where the electrons enter, not a charge for the journey.' },
      { text: 'From counting glycolysis\'s net two ATP for muscle but its gross four for the heart and the liver.',
        why: 'Supposes the 38 counted glycolysis before its investment. Both old figures use the net two; they differ only in what the two cytosolic NADH were taken to be worth.' },
      { text: 'From muscle mitochondria leaking more protons than heart mitochondria, so that each of a muscle\'s carriers was worth a little less.',
        why: 'Puts the leak into a sum that never counted it. The old figures used whole numbers and no leak anywhere; the two ATP between 38 and 36 were a statement about the shuttle, not about the membrane.' },
      { text: 'From the shuttle: muscle\'s two NADH from glycolysis were counted at FADH<sub>2</sub>\'s 2, not 3.', correct: true },
    ],
    explain: 'Under the old assumptions 38 = 10 × 3 + 2 × 2 + 4. Muscle\'s glycerol 3-\u2060phosphate shuttle brings the cytosolic pair in at ubiquinone, so they were counted at FADH<sub>2</sub>\'s 2: 8 × 3 + 2 × 2 + 2 × 2 + 4 = 36. The modern range, 30 to 32, differs by the same shuttle; the other six ATP of the gap are the round numbers and the transport that was never charged.',
  },
  {
    id: 'i-why-not-38-2',
    objective: 'why-not-38',
    kind: 'free',
    question: 'Say which assumptions produce the textbook figure of thirty-eight ATP per glucose, which of them are false, and why. Then say why the honest answer is a range and not a number.',
    rubric: [
      '38 = 10 NADH × 3 + 2 FADH<sub>2</sub> × 2 + 4 made directly',
      'it assumes 3 ATP per NADH, where the measured value is about 2.5',
      'it assumes 2 per FADH<sub>2</sub>, where the measured value is about 1.5',
      'it charges nothing for transport, where carrying each ATP out of the matrix and the phosphate in costs about one proton',
      'all three are wrong in the same direction; the round numbers came from early, difficult measurements read as whole numbers, before anyone could count protons',
      'it also counts glycolysis\'s two cytosolic NADH at full value, which is near enough right only where the malate–aspartate shuttle carries them',
      'the conversions are ratios of proton counts, not whole numbers, a living cell\'s leak lowers them further, and the shuttle differs between tissues, so the honest answer is about 30 to 32, with the tissue named',
    ],
    explain: 'The figure lasted forty years not because anyone measured it directly but because it was a clean sum of rounded numbers. The honest sum has decimals in it, and the decimals are where the biology is.',
  },
  {
    id: 'i-why-not-38-3',
    objective: 'why-not-38',
    kind: 'mcq',
    question: 'A student drops the old round numbers and counts from the machinery instead: ten protons per NADH, six per FADH<sub>2</sub>, 2.7 protons per ATP at the synthase, and nothing else. She gets about 46 ATP per glucose, more than 38. What has she left out?',
    options: [
      { text: 'Nothing: the machinery sets the yield, and the 30 to 32 that are measured are low only because experiments lose ATP.',
        why: 'Treats the gap between machinery and measurement as experimental error. The count she used is incomplete, not the measurement: it leaves out the proton each delivered ATP costs, and in a living cell some protons also leak back without turning the synthase.' },
      { text: 'The proton spent carrying each ATP out and its phosphate in, and the protons that leak back without making any.', correct: true },
      { text: 'The two ATP that glycolysis spends at the start, which a count of what the machinery makes leaves out.',
        why: 'Counts glycolysis\'s investment twice. The four ATP made directly are already net\u00a0— two from glycolysis after its two were spent, and two from the cycle\u00a0— so nothing is missing there.' },
      { text: 'The shuttle, which halves the value of every NADH that has to cross a membrane before its electrons reach the chain.',
        why: 'Charges all ten NADH for a crossing only two make. The eight from the link reaction and the cycle are made in the matrix; only glycolysis\'s pair are outside it, and the costlier shuttle makes each of those worth 1.5, not half.' },
    ],
    explain: 'Her sum is 10 × 10 ÷ 2.7 + 2 × 6 ÷ 2.7 + 4, about 37 + 4.5 + 4. It repeats the old figure\'s third mistake in a new form: an ATP delivered to the cytosol costs about 3.7 protons, not 2.7. Put that back and the conversions fall to about 2.7 and 1.6, and her total to about 34; the measured 2.5 and 1.5, a little lower again, give the chapter\'s 30 to 32. Counting from the machinery is right; counting only part of it is how a sum comes out too high.',
  },

  {
    id: 'i-respiration-efficiency-1',
    objective: 'respiration-efficiency',
    kind: 'mcq',
    question: 'A fast fibre of a leg muscle gets about 30 ATP from a glucose. Taking an ATP at the standard 30.5 kilojoules per mole, what fraction of glucose\'s 2870 kilojoules does it capture?',
    options: [
      { text: 'About 52\u00a0per\u00a0cent: 30 × 50 = 1500 kilojoules out of 2870, pricing each ATP at what it is worth inside a cell.',
        why: 'Uses the cell\'s price of an ATP when the question asks for the standard one. That figure is fair too, since at the cell\'s concentrations the fuel is worth about the same, but it answers a different question.' },
      { text: 'About 40\u00a0per\u00a0cent: 38 × 30.5 = 1159 kilojoules out of 2870.',
        why: 'Uses the old 38, which rests on three assumptions that are each wrong in the same direction; an efficiency worked from it inherits all three.' },
      { text: 'About 32\u00a0per\u00a0cent: 30 × 30.5 = 915 kilojoules out of 2870.', correct: true },
      { text: 'About 68\u00a0per\u00a0cent: what is left of the 2870 once the heat has been taken away.',
        why: 'Swaps the captured part and the lost part. At standard prices about a third is captured as ATP, and the two-thirds is what leaves as heat.' },
    ],
    explain: 'Thirty ATP at 30.5 is 915 kilojoules, about 32\u00a0per\u00a0cent of 2870; the chapter\'s 34\u00a0per\u00a0cent is the liver\'s 32 ATP. Both figures are standard-state, so the comparison is fair, and either way a cell does better than a petrol engine, which manages about a quarter.',
  },
  {
    id: 'i-respiration-efficiency-2',
    objective: 'respiration-efficiency',
    kind: 'mcq',
    question: 'At standard prices, about two-thirds of glucose\'s free energy is not captured as ATP. What becomes of it?',
    options: [
      { text: 'It leaves as heat, part of the hundred watts a resting adult gives off, and that is no design fault: every transfer must shed some.', correct: true },
      { text: 'It is stored as fat for later use, since energy can never be destroyed and so has to be kept somewhere in the body.',
        why: 'Confuses fuel not yet burnt with energy already released. Fat is what a body makes from fuel it has not burnt; the free energy released by burning glucose cannot be put back into a fat, and what is not captured leaves as heat.' },
      { text: 'It stays in the proton gradient as a reserve that the cell can draw on when its fuel runs out.',
        why: 'Mistakes the gradient for a store. It is spent as fast as it is made, and a cell starved of oxygen loses it within moments, and its ATP with it as the synthase runs backwards.' },
      { text: 'It is lost because the enzymes are imperfect, a waste that natural selection will go on reducing with time, until none is left.',
        why: 'Treats the loss as a flaw to be engineered away. Section\u00a05.1 established that every transfer must shed some energy as heat; evolution can narrow the loss, and has\u00a0— a cell beats a petrol engine\u00a0— but never to nothing.' },
    ],
    explain: 'The rest\u00a0— two-thirds at standard prices, under half at the cell\'s own\u00a0— is simply the price, and it is part of the heat you are making now. That is also why the heat can be put to use: Section\u00a07.8 is about an animal that chooses to pay almost all of it, on purpose, to keep warm.',
  },
  {
    id: 'i-respiration-efficiency-3',
    objective: 'respiration-efficiency',
    kind: 'free',
    question: 'Work out what fraction of glucose\'s free energy a liver cell captures as ATP. Say which prices you may use, and why, compare the answer with a petrol engine, and say what becomes of the rest.',
    rubric: [
      '32 ATP × 30.5 kilojoules per mole = 976 kilojoules',
      'out of the 2870 a mole of glucose releases: about 34\u00a0per\u00a0cent',
      'either pair of prices will do, so long as the fuel is priced the same way: the standard 30.5 against the standard 2870, or the cell\'s 50 against the fuel at the cell\'s own concentrations, about 2850',
      'the standard pair gives about 34\u00a0per\u00a0cent and the cell\'s own pair about 56; what is not fair is to mix them',
      'either way a cell does better than a petrol engine, which manages about a quarter',
      'the rest leaves as heat\u00a0— two-thirds at standard prices, under half at the cell\'s\u00a0— and a resting adult is a hundred-watt heater (Section\u00a05.1)',
      'that heat is not a design fault: every transfer must shed some, and a machine that shed none would be a perpetual motion machine',
    ],
    explain: 'The mixing error is worth recognising wherever it turns up: an efficiency is a ratio of two prices, and it means something only if both are priced under the same conditions.',
  },

  // ============================================================================
  // 7.7 When nothing is there to take the electrons
  // ============================================================================

  {
    id: 'i-carrier-pool-limit-1',
    objective: 'carrier-pool-limit',
    kind: 'mcq',
    question: 'A muscle cell poisoned with cyanide has plenty of glucose, ADP and phosphate, and no way to ferment. Within seconds its glycolysis stops. What has run out?',
    options: [
      { text: 'ATP. With the chain stopped, the cell spends its ATP within seconds, and glycolysis needs ATP for its first and third steps.',
        why: 'The obvious answer and the wrong one. A cell holds about five millimoles per litre of ATP against a fraction of a millimole of NAD, so the carriers are full long before the ATP is spent\u00a0— and a cell with no NAD<sup>+</sup> cannot even make the two ATP glycolysis would give it.' },
      { text: 'Oxygen, since glycolysis\'s enzymes need oxygen to oxidise the sugar at the sixth step, and cyanide keeps it from them.',
        why: 'Takes oxidation to mean reaction with oxygen. The sixth step hands its electrons to NAD<sup>+</sup>, never to oxygen, and cyanide has not removed any oxygen: it is still there, unused, at complex\u00a0IV.' },
      { text: 'Pyruvate\'s way out: with the link reaction stopped, pyruvate builds up and switches the committed step off by feedback.',
        why: 'Invents a feedback the pathway does not have. Phosphofructokinase reads ATP, AMP and citrate, and pyruvate piling up does not switch it off; what stops glycolysis is the empty NAD<sup>+</sup> its sixth step needs.' },
      { text: 'NAD<sup>+</sup>: with the chain stopped the small pool all turns into NADH, and glycolysis\'s sixth step has nothing to hand its electrons to.', correct: true },
    ],
    explain: 'Trace it. Complex\u00a0IV cannot hand on its electrons, so cytochrome\u00a0c stays reduced and complex\u00a0III stops; ubiquinone stays reduced and complex\u00a0I stops; and, in an animal cell, complex\u00a0I is the only thing that can empty the matrix\'s NADH in any quantity, and the shuttles that empty the cytosol\'s hand their electrons to the same stopped chain. The pool is small, a fraction of a millimole per litre, and glycolysis at a working muscle\'s rate fills it with NADH in seconds. Then the sixth step stops for want of an empty carrier, and so does everything.',
  },
  {
    id: 'i-carrier-pool-limit-2',
    objective: 'carrier-pool-limit',
    kind: 'free',
    question: 'Explain why, in a cell that cannot ferment, glycolysis stops within seconds of the chain stopping. Trace the backing-up from complex\u00a0IV to glycolysis, compare the size of the carrier pool with that of the ATP pool, and name exactly what has run out.',
    rubric: [
      'with no oxygen, complex\u00a0IV has nowhere to put its electrons, so it stops; cytochrome\u00a0c stays reduced, so complex\u00a0III stops; ubiquinone stays reduced, so complex\u00a0I stops',
      'in an animal cell, complex\u00a0I is the only thing that can empty the matrix\'s NADH in any quantity, and the shuttles that empty the cytosol\'s hand their electrons to the same stopped chain, so NADH can no longer be emptied',
      'a cell holds very little of the carrier and recycles it constantly: the pool is a fraction of a millimole per litre, against about five millimoles per litre of ATP',
      'glycolysis at a working muscle\'s rate would turn the whole pool into NADH in a matter of seconds',
      'glycolysis\'s sixth step needs an empty NAD<sup>+</sup> to hand its electrons to',
      'so what runs out first is NAD<sup>+</sup>, not ATP: a cell with no NAD<sup>+</sup> cannot make even the two ATP that do not need oxygen',
      'unless something else takes the electrons\u00a0— which is what fermentation is for',
    ],
    explain: 'The obvious answer, ATP, is a symptom and not the cause. What fails first is the thing there is least of, and a cell keeps far less NAD than ATP\u00a0— which is why fermentation, a way of emptying NADH, keeps a cell going when nothing else can.',
  },
  {
    id: 'i-carrier-pool-limit-3',
    objective: 'carrier-pool-limit',
    kind: 'mcq',
    question: 'Suppose a muscle fibre holds 0.4 millimoles per litre of NAD<sup>+</sup> and runs glycolysis fast enough to make 2 millimoles per litre of ATP each second, net. If its chain and its fermentation were both stopped at once, about how long would glycolysis keep going?',
    options: [
      { text: 'About two and a half seconds, until the fibre\'s 5 millimoles per litre of ATP are spent at 2 each second.',
        why: 'Looks for the limit in the ATP pool. Glycolysis is making ATP, not spending the pool; what it spends is NAD<sup>+</sup>, one for every ATP it nets, and that pool is a small fraction of the ATP one.' },
      { text: 'About a tenth of a second, since each glucose reduces four NAD<sup>+</sup> for the four ATP its second half makes.',
        why: 'Pairs every ATP made with an NADH. The second half makes four ATP per glucose but reduces only two NAD<sup>+</sup>, one at each fragment\'s sixth step, so one NAD<sup>+</sup> is used for each ATP netted, not two.' },
      { text: 'About a fifth of a second: each ATP netted turns one NAD<sup>+</sup> into NADH, and nothing turns it back.', correct: true },
      { text: 'Indefinitely, since a carrier is recycled rather than used up, so the same small pool can serve for as long as there is glucose.',
        why: 'Remembers that carriers are recycled and forgets what recycles them. NAD<sup>+</sup> comes back only when something takes NADH\'s electrons; with the chain and fermentation both stopped, each one is used once.' },
    ],
    explain: 'Glycolysis nets two ATP and reduces two NAD<sup>+</sup> for each glucose, so at 2 millimoles per litre of ATP a second it reduces 2 of NAD<sup>+</sup> a second, and a pool of 0.4 lasts a fifth of a second. The numbers are illustrative, and the order of magnitude is the point: the carrier pool is small beside the ATP pool, so it is NAD<sup>+</sup>, not ATP, that runs out first.',
  },

  {
    id: 'i-fermentation-purpose-1',
    objective: 'fermentation-purpose',
    kind: 'mcq',
    question: 'A website says that fermentation, the kind a muscle or a yeast does, is "a way for cells to produce energy without oxygen". What is wrong with that description?',
    options: [
      { text: 'Nothing is wrong: fermentation makes two ATP per glucose without any oxygen, which is how a yeast in a sealed vat survives.',
        why: 'Gives fermentation the credit for glycolysis\'s ATP. Those two are made by substrate-level phosphorylation in glycolysis, and would be made with or without a fermentation if something else regenerated the NAD<sup>+</sup>.' },
      { text: 'The fermentation step makes no ATP: it regenerates NAD<sup>+</sup> so that glycolysis, which makes the two ATP, can keep going.', correct: true },
      { text: 'Only its scale is wrong: fermentation does produce energy, but far less than respiration does, two ATP against about thirty.',
        why: 'Accepts that the fermentation step makes ATP and doubts only the amount. The step that is fermentation makes none; the two come from the glycolysis it keeps going, and the thirty from a chain the fermenting cell is not running.' },
      { text: 'Only its wording is wrong: energy is never produced, only converted, so it ought to say "release" instead.',
        why: 'Catches a real slip and misses the real error. Energy is indeed never produced, and Chapter\u00a05 would say so; but "a way to release energy without oxygen" would be just as wrong, because the fermentation step releases almost nothing and captures none of it.' },
    ],
    explain: 'Fermentation is any pathway that regenerates NAD<sup>+</sup> by handing the electrons of NADH to an organic molecule the cell has made itself, so that glycolysis can go on running with no chain. That is its entire purpose. The step throws the electrons onto a molecule that is then discarded still holding most of its fuel value: a cell ferments the way a sailor bails, not to go anywhere but to keep going at all.',
  },
  {
    id: 'i-fermentation-purpose-2',
    objective: 'fermentation-purpose',
    kind: 'free',
    question: 'Say what fermentation is for, and explain what is wrong with describing fermentation in a muscle or a yeast as a way of producing energy. Account for the ATP such a cell gets, and say what the fermentation step does with the fuel\'s value.',
    rubric: [
      'fermentation is any pathway that regenerates NAD<sup>+</sup> by handing the electrons of NADH to an organic molecule the cell has made itself',
      'its purpose is to let glycolysis keep running with no chain and nothing arriving from outside',
      'in the lactate and alcohol fermentations the fermentation step itself produces no ATP; some bacterial fermentations squeeze out another ATP or so after glycolysis, none anything like respiration\'s',
      'the two ATP a fermenting muscle or yeast gets per glucose are glycolysis\'s, made by substrate-level phosphorylation, and would be made anyway if something else regenerated the NAD<sup>+</sup>',
      'the step is a straight loss: it throws electrons onto a molecule that is discarded still holding most of the fuel value it started with',
      'two ATP per glucose, against about 30 by a mammal\'s respiration',
      'a cell ferments the way a sailor bails: not to go anywhere, but to keep going at all',
    ],
    explain: 'The confusion is an attribution error, and a natural one: fermenting and making two ATP without oxygen always happen together. But the two ATP belong to glycolysis, and the fermentation step is only what lets glycolysis keep making them.',
  },
  {
    id: 'i-fermentation-purpose-3',
    objective: 'fermentation-purpose',
    kind: 'free',
    question: 'Yeast respiring a dilute sugar solution in air is sealed off from the air. It goes on growing, more slowly, and its sugar consumption rises several times over. Explain why, with numbers: say where its ATP now comes from, what the fermentation step contributes, and what becomes of most of the sugar\'s value. (A respiring baker\'s yeast gets perhaps 16 to 20 ATP per glucose, not a mammal\'s 30: its chain has no complex\u00a0I, and its synthase ring has ten subunits.)',
    rubric: [
      'without oxygen, the yeast\'s ATP comes from glycolysis alone: two per glucose, made by substrate-level phosphorylation',
      'with oxygen it got several times as many per glucose (a mammal\'s mitochondria give about 30; baker\'s yeast, whose chain has no complex\u00a0I, fewer, perhaps 16 to 20), so to make ATP at the same rate it must run several times as much glucose through glycolysis, about eight to ten times as much',
      'the fermentation step makes no ATP: it decarboxylates pyruvate and reduces the product to ethanol, which regenerates the NAD<sup>+</sup>',
      'its purpose is to let glycolysis keep running with nothing else to take its electrons',
      'per glucose, two carbons leave as CO<sub>2</sub> and four end up in two ethanol, which still hold most of the sugar\'s free energy',
      'so the extra sugar is not a sign that fermentation is a poor way of making energy but that the yeast\'s fermentation step makes none: the yield is glycolysis\'s, and the rest of the fuel is thrown away',
    ],
    explain: 'Pasteur noticed that yeast uses sugar far faster without air than with it, and the reason is the chapter\'s central point about fermentation. The two ATP a fermenting yeast gets per glucose are glycolysis\'s; the fermentation step exists only to free NAD<sup>+</sup>, and it discards two ethanol molecules that still hold most of the fuel. A cell that gets two ATP where it had several times as many has to put several times as much glucose through to keep going.',
  },

  {
    id: 'i-two-fermentations-1',
    objective: 'two-fermentations',
    kind: 'mcq',
    question: 'When the chain cannot take their electrons, a muscle cell and a yeast cell each do something with their pyruvate. What does each do, and what does each produce?',
    options: [
      { text: 'The muscle makes lactate and carbon dioxide from each pyruvate; the yeast makes ethanol and gives off no gas at all.',
        why: 'Swaps the gas. Lactate keeps all three of pyruvate\'s carbons, which is why the muscle can later turn it back into pyruvate; the bubbles belong to the yeast, whose route takes a carbon off.' },
      { text: 'Both make lactate first; the yeast then goes one step further and turns its lactate into ethanol and carbon dioxide.',
        why: 'Reads the two routes as one route of different lengths. The yeast never makes lactate: it takes a carbon off pyruvate directly, as carbon dioxide, and reduces what is left.' },
      { text: 'The muscle reduces pyruvate to lactate; the yeast removes a carbon as CO<sub>2</sub> and reduces the rest to ethanol.', correct: true },
      { text: 'The muscle makes lactate; the yeast oxidises pyruvate to acetyl-CoA, releasing CO<sub>2</sub>, and then turns the acetyl-CoA into ethanol.',
        why: 'Mistakes the yeast\'s decarboxylation for the link reaction. It removes the same carbon but loads no carrier and attaches nothing; were it an oxidation it would make NADH, the opposite of what a fermentation needs.' },
    ],
    explain: 'Both routes do the one thing fermentation is for\u00a0— they take the electrons of NADH and free the NAD<sup>+</sup>\u00a0— and they differ in what they do to the carbon. Lactate dehydrogenase reduces pyruvate directly, three carbons in and three out. A yeast first removes a carbon, as CO<sub>2</sub>, with no oxidation and no carrier, and then reduces acetaldehyde to ethanol, which is the step that frees the NAD<sup>+</sup>.',
  },
  {
    id: 'i-two-fermentations-2',
    objective: 'two-fermentations',
    kind: 'mcq',
    question: 'The bacteria that turn milk into yoghurt ferment its sugar to lactate and nothing else. Does a pot of yoghurt fill with gas as it sets, as bread dough does?',
    options: [
      { text: 'Yes, since every fermentation gives off carbon dioxide, and the bubbles are how fermenting is recognised.',
        why: 'Takes bubbles as the mark of fermentation because the familiar ones, in bread and beer, are a yeast\'s. Only the yeast\'s route removes a carbon as CO<sub>2</sub>; lactate fermentation keeps all three.' },
      { text: 'Yes: the bacteria make ethanol and carbon dioxide first, as a yeast does, and then turn the ethanol into lactate.',
        why: 'Joins the two routes end to end. They are alternatives that both start from pyruvate, not stages of one route: lactate is made from pyruvate in a single step, and ethanol is not turned into it.' },
      { text: 'No, because the bacteria are respiring the sugar with oxygen from the air rather than fermenting it.',
        why: 'Reads no gas as no fermentation, when respiring releases more CO<sub>2</sub> than any fermentation: six for every glucose. A pot with no bubbles is a pot from which no carbon is leaving.' },
      { text: 'No. Reducing pyruvate to lactate keeps all three of its carbons, so no CO<sub>2</sub> leaves; the milk sours instead.', correct: true },
    ],
    explain: 'The yeast\'s route has a decarboxylation in it and the muscle\'s does not. That one difference is why bread rises and yoghurt does not, and why a muscle can later turn its lactate back into pyruvate and burn it: nothing has been lost from the molecule.',
  },
  {
    id: 'i-two-fermentations-3',
    objective: 'two-fermentations',
    kind: 'free',
    question: 'Say what a muscle cell and a yeast cell each do with pyruvate when the chain cannot take their electrons, name what each produces, and say what each can later do with its product, and why the two differ.',
    rubric: [
      'a muscle cell uses one step: lactate dehydrogenase reduces pyruvate to lactate, using up one NADH and freeing one NAD<sup>+</sup>',
      'three carbons in, three out: nothing is lost as gas, and the reaction is readily reversible',
      'a yeast uses two: pyruvate is decarboxylated to acetaldehyde, releasing CO<sub>2</sub>, with no oxidation and no carrier attached',
      'then acetaldehyde is reduced to ethanol, which is the step that frees the NAD<sup>+</sup>',
      'per glucose a yeast makes two carbon dioxides and two ethanols; the gas is lost, and the ethanol cannot be turned back into pyruvate, though the yeast can respire it later, once the sugar is gone and if there is oxygen; most brewing strains stop at 12 to 15\u00a0per\u00a0cent alcohol',
      'the muscle\'s lactate can be turned back into pyruvate and oxidised when the oxygen returns, or sent to the heart or the liver; the yeast has nowhere to send its product, and can only use it again itself, later',
      'bread keeps the gas and bakes off the alcohol; beer keeps the alcohol',
    ],
    explain: 'Lactate is what a cell makes when somebody else will clear it up; ethanol is what it makes when it will have to clear it up itself. A muscle is part of a body with a liver, a bloodstream and a heart, and a yeast in a barrel has nowhere to send anything.',
  },

  {
    id: 'i-lactate-facts-1',
    objective: 'lactate-facts',
    kind: 'mcq',
    question: 'Two runners cover the same distance on the same day. One runs a long way uphill, which drives her blood lactate high; the other runs down a long hill, which makes comparatively little. Two days later, which is likely to be sorer, and why?',
    options: [
      { text: 'The downhill runner: the ache is fibre damage and the inflammation that repairs it, worst when a muscle lengthens under load.', correct: true },
      { text: 'The uphill runner, since more lactic acid built up in her muscles, and it takes a couple of days to clear.',
        why: 'The folklore, and the chapter\'s point is that it is simply false. Blood lactate is back near its resting value within an hour or so, sooner with gentle exercise, long before the soreness begins, and the contractions that cause the most soreness make comparatively little lactate.' },
      { text: 'Both equally, since they did the same amount of work over the same distance on the same day.',
        why: 'Treats soreness as proportional to effort. It depends on the kind of contraction: a muscle lengthening under load, as in walking downhill or lowering a weight, is damaged far more than one shortening, whatever the distance.' },
      { text: 'The uphill runner, because her lactate made the muscle acid, and the acid went on damaging the fibres for days afterwards.',
        why: 'Blames the lactate for the acid, and the acid for the ache. At blood pH the acid is almost entirely ionised, and on one influential, though disputed, account a hard-working muscle\'s protons come mostly from ATP being split faster than it is remade; making lactate consumes a proton rather than releasing one.' },
    ],
    explain: 'Delayed onset muscle soreness begins several hours after exercise, peaks at one to three days, and is worst after lengthening contractions, which produce comparatively little lactate. By the time it arrives, the extra lactate has long since been burnt by the heart, slow fibres and brain, or rebuilt into glucose by the liver.',
  },
  {
    id: 'i-lactate-facts-2',
    objective: 'lactate-facts',
    kind: 'free',
    question: 'Say what becomes of the lactate a muscle makes during hard exercise, and what the Cori cycle costs and achieves. Then explain why lactate is not what makes a muscle ache two days later, and why "lactic acid" is already a small misdescription.',
    rubric: [
      'lactate is a fuel, not a waste product',
      'some is oxidised in the same fibre once the demand falls',
      'some passes into the blood and is taken up and burnt by the heart, by slow muscle fibres and by the brain',
      'some goes to the liver, which rebuilds it into glucose and sends it back: the Cori cycle',
      'the Cori cycle costs the liver six ATP to return the glucose the muscle got two from; that is not waste but a body moving the bill to the organ that has the oxygen to pay it',
      'blood lactate is back near its resting value within an hour or so of stopping, sooner with gentle exercise',
      'the ache two days later, delayed onset muscle soreness, begins hours after exercise, peaks at one to three days, is worst after lengthening contractions that make little lactate, and is caused by microscopic damage and the inflammation that repairs it',
      'at blood pH the acid is almost entirely ionised, so what is present is lactate, an anion; and on one influential, though disputed, account the protons that make a hard-working muscle acid come mostly from ATP being split faster than it is remade',
    ],
    explain: 'Lactate is a bill a muscle sends to an organ that has the oxygen to pay it, and the body pays within an hour or so. Whatever is aching two days later is something else: damage done by a muscle lengthening under load, and the repair that follows.',
  },
  {
    id: 'i-lactate-facts-3',
    objective: 'lactate-facts',
    kind: 'mcq',
    question: 'After a 400-metre race, a runner\'s blood lactate is high. Which recovery brings it down fastest, and why?',
    options: [
      { text: 'Gentle jogging: the heart and the slow fibres, working steadily, take lactate up from the blood and burn it as their fuel.', correct: true },
      { text: 'Lying still, so that no more lactic acid is made while the liver, the only place lactate can go, turns it back into glucose.',
        why: 'Treats lactate as a waste that only the liver can deal with. The liver takes some and rebuilds glucose from it, but much is burnt as fuel by the heart and slow muscle fibres, and working them gently burns more.' },
      { text: 'Gentle jogging, because the movement squeezes the lactic acid out of the muscles into the blood, to be passed in the urine.',
        why: 'Right choice, wrong reason: lactate is not excreted as a waste. The kidney loses very little of it; it is burnt, or rebuilt into glucose, and exercise speeds the burning.' },
      { text: 'Neither makes much difference: the lactate stays in the muscles for a day or two, which is why they are sore afterwards.',
        why: 'The folklore the chapter takes apart. Blood lactate is back near its resting value within an hour or so of stopping, sooner with gentle exercise; the soreness two days later is damage and inflammation.' },
    ],
    explain: 'Lactate is a fuel, and the quickest way to clear a fuel from the blood is to give something a reason to burn it. Gentle exercise, below the intensity that makes lactate, raises the demand of the heart and the slow fibres, and they take it up; lying still leaves more of the work to the liver and to resting tissue. Either way the extra lactate is gone within an hour or so, long before any soreness arrives.',
  },

  {
    id: 'i-anaerobic-respiration-1',
    objective: 'anaerobic-respiration',
    kind: 'mcq',
    question: 'Some marine bacteria end their chain on trimethylamine oxide, TMAO (E°′ = +0.13 V), reducing it to the trimethylamine that makes old fish smell. About how much free energy does a pair of electrons from NADH (−0.32 V) release on the way down, and where does that rank?',
    options: [
      { text: 'About 37 kilojoules per mole, which is 2 × 96.5 × (0.32 − 0.13): less even than fumarate gives.',
        why: 'Subtracts the sizes of the two potentials when their signs differ. The step runs from −0.32 through zero to +0.13, which is 0.45 V in all, not 0.19.' },
      { text: 'About 87 kilojoules per mole, 2 × 96.5 × 0.45: between what nitrate and fumarate give.', correct: true },
      { text: 'About 220 kilojoules per mole, the same as with oxygen, since the chain, the gradient and the synthase are the same machinery.',
        why: 'Gives the yield to the machinery instead of to the fall. The kind of machinery is the same; the energy is the size of the drop from NADH to whatever sits at the bottom, and TMAO sits well above oxygen.' },
      { text: 'None: with no oxygen at the bottom the chain cannot run, so a bacterium living like this must be fermenting.',
        why: 'Takes anaerobic to mean fermenting. A chain runs on any acceptor that sits below its donor, which is exactly what anaerobic respiration is, and it is how <i>E.\u00a0coli</i> goes on respiring on nitrate and fumarate once the oxygen is gone.' },
    ],
    explain: 'Each figure in the chapter\'s table is the acceptor\'s potential minus NADH\'s −0.32, multiplied by 2 × 96.5, and TMAO is priced the same way: 0.45 V, about 87 kilojoules a pair. That puts it between nitrate\'s 143 and fumarate\'s 68, and a bacterium that can use several acceptors takes the best rung available.',
  },
  {
    id: 'i-anaerobic-respiration-2',
    objective: 'anaerobic-respiration',
    kind: 'mcq',
    question: 'A bacterium in waterlogged soil, with no oxygen, runs its electron transport chain onto nitrate. A yeast in a sealed vat turns its pyruvate into ethanol. Which statement is right?',
    options: [
      { text: 'Both are fermenting, since neither of them is using any oxygen to take its electrons.',
        why: 'Lets the word "anaerobic" do the sorting. Without oxygen says what is missing, not what is happening: the bacterium has a chain, a gradient and a synthase working, with a different rung at the bottom.' },
      { text: 'Both are respiring, since both are oxidising a fuel and handing the electrons on to something else.',
        why: 'Right that both pass electrons on, and wrong that this makes a respiration. The yeast hands them to acetaldehyde, a molecule it made itself, in a soluble reaction that pumps nothing and makes no ATP; respiration means a chain and a gradient.' },
      { text: 'The bacterium respires, its chain ending on nitrate instead of oxygen; the yeast ferments, with no chain at all.', correct: true },
      { text: 'The bacterium is fermenting its nitrate, and the yeast is respiring, since it gives off carbon dioxide as respiration does.',
        why: 'Sorts by the product rather than by the machinery. The yeast\'s carbon dioxide comes from a decarboxylation with no oxidation and no chain behind it, and the bacterium\'s nitrate is an acceptor at the bottom of a real chain.' },
    ],
    explain: 'The distinction is what takes the electrons at the end. In anaerobic respiration it is something other than oxygen at the bottom of a real chain, with a gradient and a synthase, and from a given donor the yield is set by how far down it sits. In fermentation it is an organic molecule the cell made itself, reduced in one soluble step, with no chain at all and, in a yeast, no ATP from the step.',
  },
  {
    id: 'i-anaerobic-respiration-3',
    objective: 'anaerobic-respiration',
    kind: 'free',
    question: 'Distinguish anaerobic respiration from fermentation by what accepts the electrons at the end. Then use the chapter\'s table to say how much less than oxygen each alternative acceptor yields, and why, and name what the organisms living on them do to the world around them.',
    rubric: [
      'anaerobic respiration is respiration in the full sense\u00a0— a chain, a proton gradient, a synthase, chemiosmosis\u00a0— with something other than oxygen at the bottom',
      'fermentation has no chain: it regenerates NAD<sup>+</sup> by handing electrons to an organic molecule the cell made itself, and, in the lactate and alcohol fermentations, makes no ATP of its own',
      'the yield is the size of the fall, so an acceptor that sits higher up gives less: from one NADH, oxygen (+0.82 V) 220 kilojoules, nitrate (+0.42) 143, fumarate (+0.03) 68, sulfate (−0.22) 19 and carbon dioxide (−0.24) 15',
      'each is the acceptor\'s potential minus NADH\'s −0.32, times 2 × 96.5: the same arithmetic as the chain\'s table',
      'sulfate reducers make the rotten-egg smell and the black iron sulfide of marsh mud',
      'methanogens in rumens, rice paddies and landfills get about 15 kilojoules a pair on the table\'s pricing from NADH; most take their electrons from hydrogen instead, which gives about twice that, and their methane is the second most important greenhouse gas',
      'denitrifiers return nitrogen from the soil to the air',
      'a bacterium such as <i>E.\u00a0coli</i> uses the best rung available: oxygen while there is any, then nitrate, then fumarate',
    ],
    explain: 'The kind of machinery is the same, the bottom rung moves, and from the same donor the yield is the size of the fall. That is why the consequences are planetary rather than cellular: organisms that get only a few tens of kilojoules a pair have to turn over a great deal of their acceptor to live at all.',
  },

  // ============================================================================
  // 7.8 Block it, or let it leak
  // ============================================================================

  {
    id: 'i-blocking-the-chain-1',
    objective: 'blocking-the-chain',
    kind: 'mcq',
    question: 'Mitochondria respiring on an NADH-linked fuel are given rotenone, which blocks complex\u00a0I, and their oxygen consumption stops. Succinate is then added. What happens?',
    options: [
      { text: 'Oxygen consumption resumes: succinate\'s electrons enter at complex\u00a0II, below the block, and reach oxygen with six protons pumped a pair.', correct: true },
      { text: 'Nothing: a chain blocked at any one point is blocked at every point, so no fuel added now can restart it.',
        why: 'Right that a chain backs up behind a block, wrong about what lies below it. Everything downstream of rotenone is idle, not broken, and electrons that enter below the block have a clear run to oxygen.' },
      { text: 'Oxygen consumption resumes at the full NADH rate, with ten protons pumped for every pair of electrons, just as before.',
        why: 'Has the bypass restoring everything. Succinate\'s electrons never pass through complex\u00a0I, so they miss its four protons: the chain runs again, at the six-proton rate that belongs to the lower entry point.' },
      { text: 'Succinate displaces rotenone from complex\u00a0I, since adding more substrate always reverses the effect of an inhibitor on its enzyme.',
        why: 'Applies competitive inhibition where it does not belong. Succinate is not complex\u00a0I\'s substrate at all, and of the chapter\'s six inhibitors two are competitive, malonate with succinate and carbon monoxide with oxygen; no amount of fuel relieves rotenone.' },
    ],
    explain: 'Rotenone backs up everything above complex\u00a0I and starves everything below it, but "below" is only idle. Feed electrons in underneath the block and they have ubiquinone, complex\u00a0III and complex\u00a0IV to fall through, so the oxygen trace starts again. It is the same fact as malonate failing to stop respiration on an NADH-linked fuel that does not need the whole cycle, such as glutamate with malate, seen from the other side: the chain has two entrances, and a block above one does not close the other.',
  },
  {
    id: 'i-blocking-the-chain-2',
    objective: 'blocking-the-chain',
    kind: 'free',
    question: 'Cyanide is added to respiring mitochondria. Predict which carriers become reduced and which stay oxidised, and where the crossover point lies. Explain why everything downstream of the fuel stops although only complex\u00a0IV has been touched, and why malonate, by contrast, leaves respiration on glutamate and malate running.',
    rubric: [
      'cyanide binds complex\u00a0IV\'s iron, so complex\u00a0IV can no longer hand its electrons to oxygen',
      'everything above the block fills with electrons it cannot pass on: NADH, complex\u00a0I, ubiquinone, complex\u00a0III and cytochrome\u00a0c all go reduced',
      'with the block at the very bottom there is almost nothing below it left to go oxidised, and the crossover lies between complex\u00a0IV and oxygen, which names complex\u00a0IV as the site',
      'a chain is a chain: blocked anywhere, it backs up everything above and starves everything below, so electron flow and pumping stop throughout and the oxygen trace goes flat',
      'NADH can no longer be emptied, so the Krebs cycle stops for want of NAD<sup>+</sup>, and in a whole cell that cannot ferment, so does glycolysis',
      'cyanide is not competitive: no amount of fuel or oxygen relieves it, and an antidote has to take the cyanide away',
      'malonate blocks complex\u00a0II, competitively, but electrons from NADH enter at complex\u00a0I and never pass through complex\u00a0II, so respiration on a fuel that makes NADH without going round the whole cycle, such as glutamate with malate, carries on; on pyruvate it stops too, more slowly, as the cycle halts at succinate',
    ],
    explain: 'This is how the order of the chain was found. A spectrophotometer reads which carriers hold electrons while the machine runs, an inhibitor puts a sharp boundary between reduced and oxidised, and moving the block moves the boundary. Put the boundaries in order and you have the order of the chain, read from outside a membrane nobody could see into.',
  },
  {
    id: 'i-blocking-the-chain-3',
    objective: 'blocking-the-chain',
    kind: 'mcq',
    question: 'Mitochondria respiring on an NADH-linked fuel are given antimycin A, which blocks complex\u00a0III, and their oxygen consumption stops. Succinate is then added. What happens?',
    options: [
      { text: 'Oxygen consumption resumes, since succinate\'s electrons bypass complex\u00a0I, as they do when rotenone is the blocker.',
        why: 'Carries the rotenone case over without checking where the block is. Succinate\'s electrons join at ubiquinone, which is below complex\u00a0I but above complex\u00a0III, so this block is in their path too.' },
      { text: 'Oxygen consumption resumes at a lower rate, with two protons pumped for each pair, since succinate enters below complex\u00a0III.',
        why: 'Places complex\u00a0II below complex\u00a0III. Succinate\'s electrons reach ubiquinone, and ubiquinol hands them only to complex\u00a0III; nothing succinate makes can get past a block there.' },
      { text: 'Oxygen consumption resumes, once the extra ubiquinol carries electrons past complex\u00a0III straight to cytochrome\u00a0c.',
        why: 'Lets one mobile carrier hand to the other. Ubiquinol diffuses in the bilayer and gives its electrons to complex\u00a0III, and cytochrome\u00a0c takes them only from complex\u00a0III; with that complex blocked the two carriers never meet.' },
      { text: 'Nothing restarts: succinate\'s electrons join the chain at ubiquinone, above the block, and back up behind it with the rest.', correct: true },
    ],
    explain: 'Whether a second fuel rescues a blocked chain depends only on whether it enters below the block. Rotenone stops complex\u00a0I, and succinate, entering at ubiquinone, gets under it; antimycin stops complex\u00a0III, and ubiquinone is above that, so succinate adds its electrons to the pile. NADH, complex\u00a0I and ubiquinone stay reduced, and cytochrome\u00a0c and complex\u00a0IV go oxidised: the crossover names complex\u00a0III.',
  },

  {
    id: 'i-uncoupling-1',
    objective: 'uncoupling',
    kind: 'mcq',
    question: 'A slimming product sold online contains a small, lipid-soluble weak acid that carries protons across membranes. Predict what a large dose does to a person\'s oxygen consumption, to the ATP they get from each gram of fuel, and to their body temperature.',
    options: [
      { text: 'Oxygen consumption falls, because the mitochondria have been poisoned and stop using oxygen at all.',
        why: 'Describes a blocker. A substance that carries protons back leaves the chain untouched and removes what it was pushing against, so the chain speeds up; on an oxygen trace it goes steeper, the opposite of a poison on the chain.' },
      { text: 'Oxygen consumption rises, the ATP from each gram stays the same, and the heat comes from extra fat that the drug burns directly.',
        why: 'Gives the drug the burning. It burns nothing; it lets protons back without turning the synthase, so each gram of fuel yields less ATP, and the body burns more fuel to meet the same demand.' },
      { text: 'Body temperature falls, because the body is now making less ATP and so spending less energy on everything.',
        why: 'Pictures heat as a by-product of making ATP, so that less ATP means less heat. The fuel is burnt faster than ever, and the free energy that no longer goes into ATP comes out as heat, which is exactly why these drugs kill by overheating.' },
      { text: 'Oxygen consumption rises, the ATP from each gram falls, and body temperature rises, as the energy that would have made ATP leaves as heat.', correct: true },
    ],
    explain: 'This is dinitrophenol\'s story, and its lesson is structural: the slimming effect and the lethal one are the same effect. An uncoupler lets protons back without work, so the chain runs as fast as its slowest enzyme allows, the ATP made from each unit of fuel falls, more fuel is burnt, and all of the 220 kilojoules each NADH releases comes out as heat. There is no safe dose, because the only limit is how fast the body can lose heat.',
  },
  {
    id: 'i-uncoupling-2',
    objective: 'uncoupling',
    kind: 'free',
    question: 'Predict what an uncoupler does to oxygen consumption, to ATP production and to body temperature, and explain why the three move in those directions. Say how chemiosmosis explains the first of them, and what about the uncouplers themselves the chemical-intermediate hypothesis could not explain. Then say why there is no safe dose of dinitrophenol.',
    rubric: [
      'an uncoupler carries protons across the inner membrane on its own, bypassing the synthase; dinitrophenol is a weak acid that dissolves in the bilayer both with its proton and without it',
      'oxygen consumption rises (in isolated mitochondria given enough uncoupler, to its maximum): the chain is pumping against a smaller gradient, or none, so it runs faster, up to as fast as its slowest enzyme allows',
      'ATP synthesis falls (in isolated mitochondria given enough uncoupler, to nothing), because the protons return without turning the synthase',
      'body temperature rises: the energy that would have made ATP, all of the 220 kilojoules each NADH releases, comes out as heat',
      'and a body that gets less ATP from each unit of fuel burns more fuel to meet the same demand',
      'the chemical-intermediate hypothesis could accommodate it, by supposing the uncoupler broke X∼P down, but not the fact that every classical uncoupler, however different in structure, is a weak acid that carries protons across a bare lipid membrane, which is what chemiosmosis requires',
      'there is no safe dose because the slimming effect and the lethal one are the same effect: the only limit is how fast the body can lose heat',
    ],
    explain: 'On an oxygen trace, a blocker and an uncoupler are opposites: one makes it flat and the other makes it steeper, while both stop the ATP. A gradient between the chain and the synthase explains both simply, and the uncouplers\' own chemistry says it is the gradient they attack.',
  },
  {
    id: 'i-uncoupling-3',
    objective: 'uncoupling',
    kind: 'mcq',
    question: 'A young man who has taken dinitrophenol to lose weight arrives at hospital with a temperature of 41 °C. A drug that brings down the fever of an infection, by lowering the brain\'s set point, does little for him. Why?',
    options: [
      { text: 'His fever is his set point raised by the poison, as in an infection, so the drug should work and only needs a higher dose.',
        why: 'Reads every high temperature as a fever. In an infection the set point is raised and the body makes heat to reach it; here the set point is normal and the body is already trying to shed heat it cannot stop making.' },
      { text: 'His heat is not a raised set point: his mitochondria turn fuel into heat whatever his set point is, so he must be cooled.', correct: true },
      { text: 'His mitochondria have stopped, and a body making no ATP cannot respond to any medicine at all.',
        why: 'Takes an uncoupler for a blocker. His chains are running flat out and burning fuel faster than ever; it is ATP making that has fallen, and the energy is coming out as heat.' },
      { text: 'His heat comes from the extra ATP he is splitting as he shivers, and a fever drug does nothing to the muscles.',
        why: 'Puts the heat in ATP being spent. The energy never reaches ATP: it is released as the protons return through the uncoupler, as heat, in every cell that respires.' },
    ],
    explain: 'A fever drug works by lowering the set point that an infection has raised, so that the body stops making heat to reach it. Dinitrophenol raises no set point. It short-circuits the gradient in every mitochondrion, the chains run flat out, and the energy that would have made ATP comes out as heat whatever the thermostat says; the body is already sweating to get rid of it. There is no antidote; treatment is supportive and above all rapid cooling, and the danger is the one the chapter names: the only limit is how fast heat can be taken off a body.',
  },

  {
    id: 'i-respiratory-control-1',
    objective: 'respiratory-control',
    kind: 'mcq',
    question: 'Oligomycin binds only ATP synthase\'s proton channel. Added to a suspension of mitochondria respiring with plenty of ADP, it makes their oxygen consumption fall, although nothing has touched the chain. Why?',
    options: [
      { text: 'Oligomycin also binds complex\u00a0IV, and that second target, not the synthase at all, is what slows the oxygen consumption down.',
        why: 'Explains a surprising result by inventing a second target. Oligomycin binds the synthase and nothing in the chain; the slowing is the chain answering its own gradient, which is what makes the result evidence.' },
      { text: 'With the synthase jammed, protons stop coming back, the gradient steepens until the pumps stall, and electron flow slows.', correct: true },
      { text: 'The chain and the synthase are parts of one complex, so jamming the one part jams the other along with it.',
        why: 'Joins the two machines physically, which is the assumption chemiosmosis replaced. They are separate proteins, coupled only by the gradient between them\u00a0— and an uncoupler added now sets the chain racing again, which is hard to square with a physical link.' },
      { text: 'The mitochondria sense that they are no longer making ATP and switch the chain off to save their fuel.',
        why: 'Looks for a sensor and a signal where there are none. What slows the chain is the physical back-pressure of a gradient nothing is spending; there is nothing to sense and nothing to switch.' },
    ],
    explain: 'That is respiratory control. Add ADP to a suspension that has run out of it and consumption rises; let the ADP be used up and it falls again. A mitochondrion burns fuel at the rate its cell spends ATP, and not faster, because the synthase is the protons\' only way back: when it stops turning, the gradient steepens and the pumps stall against it. Section\u00a05.7\'s feedback loop, with the gradient itself as the messenger.',
  },
  {
    id: 'i-respiratory-control-2',
    objective: 'respiratory-control',
    kind: 'free',
    question: 'Explain why blocking ATP synthase also stops the chain although nothing has touched the chain, and why adding ADP to a suspension of mitochondria makes them consume oxygen faster. Say what these show about how the two machines are joined, and what an uncoupler added after the oligomycin would do.',
    rubric: [
      'with the synthase blocked, protons stop coming back through it',
      'the gradient steepens until the pumps can no longer push protons against it\u00a0— a pump can only push so hard\u00a0— and electron flow and oxygen consumption slow',
      'adding ADP gives the synthase something to phosphorylate, so protons flow back through it, the gradient eases and the chain speeds up; when the ADP is used up it slows again',
      'this is respiratory control: a mitochondrion burns fuel at the rate its cell spends ATP, and not faster',
      'there is no signal and no sensor: the gradient itself carries the message, which is Section\u00a05.7\'s feedback loop',
      'the two machines are joined only by the gradient, not by any chemical or physical link',
      'an uncoupler added after the oligomycin gives the protons another way back, so the chain runs flat out again while no ATP is made\u00a0— which a gradient between the two machines explains simply',
    ],
    explain: 'Respiratory control is why a mitochondrion never burns fuel faster than its cell spends ATP, and it needs no sensor to do it. It is also exactly the coupling that brown fat cuts on purpose.',
  },
  {
    id: 'i-respiratory-control-3',
    objective: 'respiratory-control',
    kind: 'mcq',
    question: 'Isolated mitochondria with fuel, phosphate and a little ATP respire slowly. Glucose and hexokinase are added, and the hexokinase turns ATP back into ADP as fast as the mitochondria make it. Oxygen consumption rises and stays high. Why?',
    options: [
      { text: 'Glucose is a fuel, and the mitochondria take it in and burn it directly, faster than the fuel they had.',
        why: 'Hands the mitochondrion glucose. It cannot use it: glycolysis is in the cytosol, which is not in the flask, and the glucose here only receives phosphates from ATP.' },
      { text: 'Hexokinase phosphorylates the chain\'s complexes and so switches them on, as an enzyme switches on a pathway.',
        why: 'Looks for a signal. There is none: nothing is done to the chain at all, and the only thing hexokinase changes is how much ADP there is for the synthase.' },
      { text: 'With ADP always there, protons keep flowing back through the synthase, so the pumps do not stall.', correct: true },
      { text: 'Removing ATP lifts its inhibition of the chain at a regulatory site, as ATP inhibits phosphofructokinase.',
        why: 'Borrows the committed step\'s loop for the chain. Complex\u00a0IV does bind ATP, but the brake this experiment releases is chiefly the gradient, which eases only when the synthase has ADP to use.' },
    ],
    explain: 'Respiratory control needs no messenger. The chain slows when the gradient is too steep to pump against, and the gradient is spent only as fast as the synthase has ADP to phosphorylate. Hexokinase is an ADP-making machine: it keeps the synthase supplied, the protons keep returning, and the chain runs at the rate the ATP is being used\u00a0— which is what a working cell does with its own ATP-splitting enzymes in place of the hexokinase.',
  },

  {
    id: 'i-uncoupling-on-purpose-1',
    objective: 'uncoupling-on-purpose',
    kind: 'mcq',
    question: 'Mice bred to lack the uncoupling protein of brown fat are moved from a warm room to a cold one. Predict what happens to them.',
    options: [
      { text: 'They keep warm as well as ordinary mice, since their brown fat still burns fat, and burning fat always gives off heat.',
        why: 'Treats burning as something that happens regardless of demand. In coupled mitochondria the chain runs only as fast as the synthase lets protons back, so without a leak brown fat burns fuel at the rate its own cells spend ATP, which is not much.' },
      { text: 'They keep warmer than ordinary mice, since their mitochondria now make ATP from the fuel, and ATP is where all body heat comes from in the end.',
        why: 'Makes ATP the source of the heat. Some heat is released when ATP is spent, but a coupled mitochondrion makes only as much ATP as its cell uses; the point of the leak is to burn fuel regardless and let the whole fall out as heat.' },
      { text: 'They struggle to keep warm: their brown fat stays coupled, so respiratory control holds its chain to the rate ATP is spent, and little heat is made.', correct: true },
      { text: 'They keep warm because, with the leak closed, the proton gradient grows larger, and a larger gradient gives off more heat.',
        why: 'Pictures the gradient as a heater. A gradient held across a sealed membrane gives off nothing; it is protons falling back without work that make heat, and closing the leak stops exactly that.' },
    ],
    explain: 'This is what happened when the experiment was done: mice lacking the protein could not hold their body temperature in the cold. The uncoupling protein is a controlled leak, opened by the fatty acids released when the tissue is told it is cold, and it is the leak, not the fuel, that turns brown fat into a heater.',
  },
  {
    id: 'i-uncoupling-on-purpose-2',
    objective: 'uncoupling-on-purpose',
    kind: 'free',
    question: 'Explain how brown fat warms a newborn, and say what an animal gains from a mitochondrion built to make almost no ATP. Relate the mechanism to Section\u00a01.2\'s feedback loop, and say why a newborn needs it more than an adult does.',
    rubric: [
      'brown fat carries an uncoupling protein in the inner membrane of its mitochondria: a controlled proton leak',
      'it is opened by the fatty acids released when the tissue is told it is cold',
      'with the leak open the mitochondria run the Krebs cycle and the chain at full speed and make almost no ATP, and all 220 kilojoules per NADH become heat, in the right place',
      'without the leak, respiratory control would hold the chain to the rate the cell spends ATP, and little heat would be made',
      'a newborn cannot shiver effectively and has a great deal of surface for its volume (Section\u00a03.2), so it loses heat fast and needs a heater that does not depend on muscle',
      'hibernators need it too, to rewarm themselves from a few degrees above freezing',
      'it is Section\u00a01.2\'s negative feedback loop with a new effector: core temperature is the regulated quantity, the response is a hole in a membrane, and it opposes the change',
      'what the animal gains is heat on demand, made where it is needed: the same short circuit that makes dinitrophenol lethal, under control',
    ],
    explain: 'Brown fat does deliberately what dinitrophenol does indiscriminately. The difference is control: the leak opens when the tissue is told it is cold and closes when it is not, so the heat is made where it is wanted, when it is wanted.',
  },
  {
    id: 'i-uncoupling-on-purpose-3',
    objective: 'uncoupling-on-purpose',
    kind: 'free',
    question: 'Brown fat mitochondria are packed with the chain and the uncoupling protein, but carry comparatively little ATP synthase. Explain why that suits the tissue\'s job, what happens to the fuel\'s energy when the tissue is switched on, and why an animal does not simply warm itself by making ATP and splitting it.',
    rubric: [
      'the tissue\'s product is heat, and heat is made when protons return across the inner membrane without doing work',
      'the uncoupling protein, opened by the fatty acids released when the tissue is told it is cold, gives the protons a way back that bypasses the synthase',
      'with the leak open the chain is not held back by respiratory control and runs at full speed, so the amount of chain sets how much heat the tissue can make',
      'the gradient is being short-circuited, so a great deal of synthase would have little to spend: it would be machinery for a product the tissue does not make',
      'all 220 kilojoules per NADH become heat, in the right place, rather than only the part left over after ATP is made',
      'making ATP and splitting it for heat would tie the heat to respiratory control: the chain could run only as fast as something split the ATP, which is what shivering muscle does',
      'the leak makes heat directly, on demand and without muscle, which is why a newborn that cannot shiver effectively depends on it',
    ],
    explain: 'Brown fat is built on the fact that a gradient can be spent as heat instead of ATP. Its chain sets how fast it can make heat, and its uncoupling protein decides when; synthase would only compete with the leak for protons the tissue means to waste. Shivering makes heat from ATP too, but only as fast as muscles can split it, and a newborn\'s cannot do that well; the leak skips the ATP altogether.',
  },

  {
    id: 'i-diagnose-respiration-1',
    objective: 'diagnose-respiration',
    kind: 'mcq',
    question: 'A patient has a metabolic rate far above normal while her thyroid is normal, cannot bear heat, and sweats heavily. Mitochondria taken from her muscle consume oxygen fast whether or not ADP is added. Which part of respiration is at fault?',
    options: [
      { text: 'The membrane is leaking: protons get back without the synthase, so the chain runs fast with or without ADP.', correct: true },
      { text: 'The chain is blocked, so her cells cannot use the oxygen that reaches them, however much of it her blood brings.',
        why: 'Hears "a disease of mitochondria" and reaches for a chain that cannot use its oxygen. A blocked chain consumes almost none, and its trace goes flat; these mitochondria are consuming it fast, and heat and a high metabolic rate are what a chain running against nothing produces.' },
      { text: 'The synthase is stopped, so her mitochondria cannot turn the gradient they build into any ATP.',
        why: 'Assumes a mitochondrion in trouble must have a broken synthase, and forgets what that would do to the oxygen. A stopped synthase lowers oxygen consumption, because the gradient steepens and stalls the pumps; consumption stays high only when the protons have another way back.' },
      { text: 'The carriers have nowhere to unload, because her oxygen supply is too small for what her body needs.',
        why: 'Reads a high demand for oxygen as a shortage of it. With nowhere to unload, the carriers would fill and consumption would fall; here oxygen is being used as fast as it can be, which is the opposite.' },
    ],
    explain: 'This is the first mitochondrial disease ever described, by Rolf Luft in 1962: a woman with a hypermetabolism nobody could trace to her thyroid, whose muscle mitochondria had lost respiratory control. Oxygen consumption that ADP cannot raise, because it is already high, points at a leak: the uncoupler\'s signature, from inside a patient.',
  },
  {
    id: 'i-diagnose-respiration-2',
    objective: 'diagnose-respiration',
    kind: 'mcq',
    question: 'A new drug lowers the oxygen consumption of isolated mitochondria. Adding ADP does not raise it again, but adding dinitrophenol raises it to the maximum. Which part of respiration did the drug interfere with?',
    options: [
      { text: 'The chain: oxygen consumption fell, and a fall in oxygen consumption means the electrons have stopped moving.',
        why: 'Takes every fall in oxygen consumption for a blocked chain. A blocked chain cannot be restarted by an uncoupler, because the electrons still have nowhere to go; this one ran at full speed as soon as the protons had a way back.' },
      { text: 'The membrane: the drug made it leak, which is why the uncoupler made so large a difference.',
        why: 'Has a leak lowering oxygen consumption. A leaky membrane runs the chain faster, not slower, and an uncoupler added to it would change little; this preparation started slow.' },
      { text: 'The carriers: the drug stopped any oxygen reaching them, so they had nowhere at all to unload their electrons.',
        why: 'Treats every stalled chain as a chain starved of oxygen. With no oxygen the chain cannot run however the protons get back, so dinitrophenol would have done nothing; that it brought the trace to its maximum says the oxygen was there all along.' },
      { text: 'The synthase: the chain is intact, since giving the protons another way back set it running at full speed.', correct: true },
    ],
    explain: 'The uncoupler is the test that separates the two ways a trace can go flat. A chain block leaves the electrons nowhere to go, and nothing done to the membrane restarts it; a synthase block leaves the chain intact but stalled against its own gradient, and an uncoupler, by letting the protons back, sets it running flat out. A drug that blocked the transporter bringing ADP into the matrix would read the same way, since it too leaves the synthase with nothing to do.',
  },
  {
    id: 'i-diagnose-respiration-3',
    objective: 'diagnose-respiration',
    kind: 'free',
    question: 'Four things can stop a mitochondrion making ATP: the chain blocked, the membrane leaking, the synthase stopped, or the carriers with nowhere to unload. For each, say what happens to oxygen consumption and to ATP production, and name the one addition to a suspension of mitochondria that tells a blocked chain from a stopped synthase.',
    rubric: [
      'chain blocked (rotenone, antimycin A, cyanide): oxygen consumption stops and the trace goes flat; no gradient and no ATP; the carriers above the block go reduced and those below it oxidised',
      'membrane leaking (an uncoupler, or brown fat\'s protein): oxygen consumption rises to its maximum and ATP falls to almost nothing, the energy leaving as heat',
      'synthase stopped (oligomycin): oxygen consumption falls although the chain is untouched, because the gradient steepens and stalls the pumps; no ATP, and adding ADP does not help',
      'carriers with nowhere to unload (no oxygen): the chain stops from the bottom, NADH rises within seconds, and glycolysis stalls for want of NAD<sup>+</sup> unless a fermentation takes the electrons',
      'the addition that tells a blocked chain from a stopped synthase is an uncoupler: it restarts a trace stopped at the synthase, and cannot restart one stopped by a blocked chain',
      'a gradient between the two machines explains both halves of that result simply',
    ],
    explain: 'Two measurements do most of the sorting: which way the oxygen trace moves, and whether the ATP follows it. The uncoupler is the third, and it is the one that separates the two flat traces.',
  },
];
