// Chapter 5's review item bank: the questions the spaced-repetition queue draws on
// (docs/design/adaptive.md). Every item names exactly one objective from objectives.js, and every one of
// the chapter's thirty-nine objectives has three items that differ in what they demand — say it, use it
// on a case the chapter has not worked through, or drive the figure and read what it reports — so a
// reader who has memorised one still has to think about the others.
//
// The `why` on a wrong option is the working part of this file. It says what choosing that option
// reveals about the reader's thinking, so the agent round can turn "wrong three times" into a named
// misconception and teach against it. A distractor that is merely false teaches nothing.
//
// Four ideas in this chapter are the ones readers get wrong, and the distractors are built out of them
// rather than out of plausible-sounding falsehoods.
//
//   Spontaneous does not mean fast. "Exergonic" says which way, never how soon, and a reader who has
//     not got this reads a slow reaction as an unfavourable one and a catalysed one as a downhill one.
//   A phosphate bond is not a "high-energy bond". Breaking any covalent bond costs — a carbon–carbon
//     bond about 350 kJ/mol — and everything that pays for ATP's 30.5 happens to the PRODUCTS.
//   An enzyme changes the rate and never the equilibrium. It multiplies both directions by the same
//     factor, because the transition state is the same arrangement whichever side you climb from.
//   Equilibrium is death. A cell keeps a reaction running by never letting it get there, which is why
//     ΔG = 0 is a corpse and a steady state is not an equilibrium reached slowly.
//
// Others in the same family, each of which a distractor below encodes: that energy is a substance a
// mitochondrion produces; that heat released nearby can pay for something; that a cell stores energy as
// ATP; that adding substrate can rescue any inhibitor; that an optimum is a temperature an enzyme
// likes; that "reduction" means losing something; that an allosteric inhibitor blocks the active site;
// and that a set point has to be a number written somewhere.
//
// The form of an option must not say which is right. As first written, the correct option was the longest
// of the four in all 44 multiple-choice items, which a reader learns inside one sitting. On 2026-09-23 the
// option TEXT was rewritten — never the order, because a reader's record stores the authored letter — so
// that the correct option is the longest in 11 of the 44 and the shortest in 11, counted as rendered
// characters with markup stripped, and so that no connective (because, since) or mark (colon, semicolon,
// dash) is much commoner in right answers than in wrong ones. When an option is edited, keep it that way:
// lengthen a distractor with the reasoning that makes it tempting, and do not pad the answer.
//
// Formats:
//   mcq  — { options: [{ text, correct } | { text, why }] }, exactly one correct.
//   task — { figure, goal, expect }, graded against that figure's own describe().
//   free — { rubric: [...] }, the points a good answer makes.
//
// Bound: every item is answerable from this chapter alone, and every `expect` below names a state that
// was reached by driving the real figure's own controls in the lab (`/lab/?kind=<kind>&eager=1`, through
// the harness shape in tools/drive.js) and reading describe() — never written from the field list or
// from the brief. Each was then re-run against a fresh snapshot and checked three ways: false at mount,
// false after the figure has idled on ITS OWN clock, and true only after the real controls. The idle arm
// is measured on the figure's clock and not on wall time, because these figures advance inside a
// per-frame budget and a fixed sleep would assert how busy the machine is. Four of the eight open
// running — `entropy-ledger`, `activation-barrier`, `enzyme-kinetics` and `feedback-pathway` — and in
// each of those the load-bearing clause is one only the reader can reach: `efficiency === 1`,
// `mode === sealed`, `transitionShown`, `enzymePresent`, `offered`, `preset`, `plotted`, `subunits`,
// `productAddedMM`, `loopIntact === false`. Nothing below rests on a number a clock moves by itself.
//
// Figure facts that shape what a task may ask, each declared by that figure's author:
//
//   `activation-barrier`'s temperature moves the equilibrium ratio, correctly, because the ratio is
//     measured against RT — at 55 °C it reads 81.3 where at 37 °C it reads 105.0. So the item that holds
//     the enzyme against the ratio (`i-enzyme-not-equilibrium-1`) never touches the temperature slider,
//     and the item that does touch it (`i-why-not-heat-1`) makes no claim about the ratio.
//   `enzyme-kinetics` models the temperature fall in the two parts §5.6 gives it: a reversible unfolding
//     that the slider sweeps both ways, and, once `Keep the damage` is pressed, a permanent loss that
//     accumulates with every second spent hot and that cooling does not undo.
//     `i-enzyme-conditions-1` was driven with that toggle both off and on and its `expect` holds either
//     way, which is why its goal leaves the toggle alone. An item that wants a loss nothing gives back at
//     all still has the figure's irreversible inhibitor, where `i-drugs-as-inhibitors-1` puts it.
//   `atp3d`'s five ledger lines are an apportionment of the measured −30.5, not five measurements. The
//     items ask about the total and about the SIGN of a line — the bond row is positive, the four that
//     pay are negative — and never about a line's value as though it had been weighed.
//   `feedback-pathway` opens in balance by construction, its pools computed by running the model at
//     mount, so "it is steady" is not something the reader caused and no expect below says it is.
//
// What the narrow composition drops, so that no goal quotes something a phone does not draw. Measured at
// 390 px on each figure, including after switching every pane and opening every collapsed group:
//   `free-energy`       drops the trace and the two per-term sub-tables; keeps the five-row free-energy
//                       table (Standard ΔG°′, Concentration term, True ΔG, Verdict, Equilibrium ratio).
//   `activation-barrier` drops the "speed-up ×N · ratio now N" line, so no goal names the speed-up or the
//                       current ratio; the four-row rate table and the landscape's own numbers stay.
//   `enzyme-kinetics`   puts the temperature and pH sliders behind **Conditions** and the named cases
//                       behind **Cases**, so the two goals that need them say to open the group if it is
//                       not already open — which it is at desktop width. It also drops the Turnover row.
//                       At 390 px the two groups are mutually exclusive: opening one closes the other, so
//                       no goal may ask for a slider behind Conditions and a named case in one breath.
//                       Each goal below needs only one of them, and both say to open theirs.
//   `feedback-pathway`  puts the enzyme close-up and the covalent switch behind a **Pathway / Enzyme**
//                       pane switch, so the kinase goal says to change pane if the screen shows one at a
//                       time; First enzyme, Isoleucine and Steepness stay on the pathway pane.
//   `metabolic-map`     drops the Fuel and Steps-to-the-waist rows; keeps Piling up, Drained away, Steps
//                       that differ, Captured fraction and The whole fall.
//   `atp3d`             shortens the ledger's row labels, so `i-not-high-energy-bond-1` finds its row by
//                       the +34.0 the figure prints at both widths rather than by a row heading.
// Several buttons shorten at 390 px (Seal the boundary → Seal, Keep the product removed → Keep removed,
// Add enzyme → Add, Start from product → Product, and `enzyme-kinetics`'s three inhibitors, Competitive →
// Compet., Non-competitive → Non-comp., Irreversible → Irrev.). Each is a prefix or a plain contraction of
// the wide label and the accessible name is the full one at both widths, so a goal quoting the wide label
// still finds the control; the one that is not a prefix says both words.
//
// A `goal` is set with setAttribute and is therefore TEXT: markup in one would show as markup. So the
// super- and subscripts everywhere else in this file are markup, as the book's typographic rule asks, and
// the two goals that must name a control called "Na⁺ outside" or "NAD⁺" carry the precomposed character
// instead — quoting the label the reader sees is the stronger rule, and both pages' font subsets already
// request ⁺. Do not "fix" those two into <sup>, and do not put markup in any other goal.
//
// `npm run check` enforces: unique ids, a declared objective, at least three items each, exactly one
// correct option with a `why` on every other, an explanation on every item, a figure the chapter has on
// every task, an expect the grader's parser can evaluate, and a rubric on every free response.

export const ITEMS = [
  // ============================================================================
  // 5.1 Order costs, and something else pays
  // ============================================================================

  {
    id: 'i-energy-forms-1',
    objective: 'energy-forms',
    kind: 'mcq',
    question: 'A molecule of glucose is said to hold chemical energy. Which of the two kinds of energy is that, and where in the molecule is it held?',
    options: [
      { text: 'Potential energy, held in how the atoms and electrons are arranged, and released when the arrangement becomes more stable.', correct: true },
      { text: 'Kinetic energy: the atoms in a glucose molecule are vibrating and rotating all the time, and a warmer molecule has more of it.',
        why: 'Notices something true and files it in the wrong place. The vibration is real and it is the molecule\'s thermal energy; the chemical energy is what stays when you take the movement away, and it is in how the atoms are put together.' },
      { text: 'Neither: chemical energy is a third kind, stored in the molecule as a substance and released when the molecule is broken.',
        why: 'The substance picture, which is why "energy" is so often talked about as if it were a fuel you could weigh. Every form named in this book is kinetic or potential wearing a particular coat, and nothing is stored in a molecule the way petrol is stored in a tank.' },
      { text: 'Potential energy, held inside the chemical bonds themselves, so that breaking the bonds is what lets it out.',
        why: 'Half right and it is the half that causes the trouble later. The energy is in the arrangement, and breaking a bond always costs rather than releases — Section 5.3 spends a section on exactly this.' },
    ],
    explain: 'Kinetic energy is the energy of motion, and heat is its most important biological case: a warm object is one whose molecules move faster. Potential energy is energy held by position or arrangement. Chemical energy is potential energy held in how a molecule\'s atoms and electrons are arranged, and a chemical reaction is that arrangement changing to a more stable one, with the difference released.',
  },
  {
    id: 'i-energy-forms-2',
    objective: 'energy-forms',
    kind: 'mcq',
    question: 'Four things in a laboratory: a cup of hot tea, a jar of petrol, a stretched spring, and a sodium gradient across a vesicle membrane. Which one holds its energy as kinetic energy?',
    options: [
      { text: 'The tea, since heat is the random motion of molecules and a hot cup\'s molecules move faster than a cold one\'s.', correct: true },
      { text: 'The petrol: it is a liquid, and the molecules of any liquid are free to wander about and tumble past one another.',
        why: 'Confuses being able to move with holding energy as movement. Cold petrol\'s molecules move too; what makes petrol useful is the arrangement of its atoms, which is potential energy, and it is just as useful cold.' },
      { text: 'The spring, since the energy it holds will come straight out as movement the moment the spring is let go.',
        why: 'Reads potential energy by what it will become rather than by what it is. Anything with potential energy can be turned into motion — that is what makes it useful — and while it is held it is not motion.' },
      { text: 'The gradient: its ions are diffusing across the membrane the whole time, and ions on the move are kinetic energy.',
        why: 'Right that the ions move, wrong about where the energy sits. Section 4.3\'s point again: at a gradient the ions cross both ways all the time, and what is held is the difference in concentration, which is an arrangement.' },
    ],
    explain: 'Three of the four are arrangements: atoms in petrol, coils in a spring, ions kept apart from where they would go. Only the tea holds its energy as motion. That matters for the rest of the chapter, because heat is the one form a cell cannot spend — a cell is all at one temperature, and getting work out of heat needs a difference.',
  },
  {
    id: 'i-energy-forms-3',
    objective: 'energy-forms',
    kind: 'free',
    question: 'Say what energy is, and what it is not. Name the two kinds it comes in, give a biological case of each, and say which one chemical energy is and where a molecule holds it.',
    rubric: [
      'energy is the capacity to cause change — to move something, heat something, or rearrange atoms into a different pattern',
      'it is not a substance, not a fluid and not a fuel: it is a quantity that stays the same as it changes form',
      'kinetic energy is the energy of motion, and the important biological case is heat, which is nothing but the random motion of molecules',
      'potential energy is energy held by position or arrangement: a weight on a shelf, a charge held apart from its opposite, an ion held at a concentration a membrane will not let it keep',
      'chemical energy is potential energy held in the arrangement of atoms and electrons in a molecule',
      'it is released when that arrangement changes to a more stable one, which is all a chemical reaction is',
    ],
    explain: 'The word is used so loosely in ordinary speech that it has almost stopped meaning anything, and the looseness costs a reader this chapter. Everything that follows — why a reaction goes, what ATP is worth, why heat cannot be spent — depends on energy being a quantity in a balance sheet rather than a stuff in a container.',
  },

  {
    id: 'i-first-law-1',
    objective: 'first-law',
    kind: 'mcq',
    question: '"Mitochondria are the powerhouse of the cell: they produce the energy the cell needs." What is wrong with that sentence?',
    options: [
      { text: 'Nothing alive produces energy. A mitochondrion takes energy in one form and hands it on in another, and the books balance exactly.', correct: true },
      { text: 'Nothing is wrong with it, except that it leaves out the chloroplasts, which produce energy from sunlight in the same way.',
        why: 'Accepts the production picture and only quarrels about which organelle. A chloroplast does not make energy either; it captures light that was already there and puts it into an arrangement of atoms.' },
      { text: 'It is wrong: mitochondria store the cell\'s energy rather than producing it, and hand it out as it is needed.',
        why: 'Swaps one wrong verb for another. A mitochondrion holds almost nothing: the ATP it makes is spent within about a minute, and what a cell stores is fuel and gradients.' },
      { text: 'It is wrong because the energy comes from the sun, so the sun produces it and the mitochondrion only passes it on.',
        why: 'Pushes the production one step back rather than dropping it. The sun does not make energy either; it converts nuclear binding energy into light. The first law has no exceptions anywhere, including in stars.' },
    ],
    explain: 'The first law is that energy is conserved: it can be converted and moved, and it cannot be made or destroyed. A mitochondrion and a power station are the same kind of machine in this respect — each takes energy in one form and hands it on in another. An organism that spends more in a day than it takes in makes the difference up out of itself, which is what losing weight is.',
  },
  {
    id: 'i-first-law-2',
    objective: 'first-law',
    kind: 'mcq',
    question: 'An adult takes in about 8,400 kilojoules a day and their weight does not change. Where do the 8,400 kilojoules go?',
    options: [
      { text: 'All 8,400 leave again, almost all of it as heat, at a little under 100 joules every second, like a hundred-watt heater.', correct: true },
      { text: 'Most of it is used up in doing the body\'s work — breathing, pumping blood, moving about — and whatever is left over leaves as heat.',
        why: 'Treats "used up" as a destination, which the first law forbids. Doing work does not consume energy; it moves it, and every one of those transfers ends with the energy as heat in the surroundings. There is no third place for it to be.' },
      { text: 'Most of it is stored as fat and glycogen, and a steady weight only means the store is large enough not to change measurably.',
        why: 'A steady weight is exactly the statement that nothing net is being stored. A store you keep adding to without its mass changing is not a store.' },
      { text: 'Most of it goes into building and maintaining the order of the body\'s cells and tissues, which is why it does not come out again.',
        why: 'The most interesting wrong answer, and it confuses the first law with the second. Building order does cost, and an adult who is not growing is replacing what falls apart, so the order account balances too — the energy that paid for the building has still left, as heat.' },
    ],
    explain: '2,000 kilocalories is about 8,400 kilojoules; divide by the 86,400 seconds in a day and you get a little under 100 joules a second. It is why a full lecture theatre grows warm and why the arithmetic of a spacecraft has to include the people in it. Every step a cell takes is a little inefficient, and the inefficiency leaves as random molecular motion which spreads out and does not come back.',
  },
  {
    id: 'i-first-law-3',
    objective: 'first-law',
    kind: 'free',
    question: 'State the first law of thermodynamics, and explain what it means for an organism. Why can nothing alive make energy, and what is an organism actually doing when we say it is "producing energy"?',
    rubric: [
      'energy is conserved: it can be converted from one form to another and moved from one place to another, and it cannot be created or destroyed',
      'so no organism, organ or organelle produces energy — a mitochondrion and a power station both take energy in one form and hand it on in another',
      'what a cell does is convert: the arrangement of atoms in a fuel becomes the arrangement of atoms in ATP, and a gradient, and heat',
      'an organism must therefore keep taking energy in, because everything it converts eventually leaves as heat',
      'the books balance exactly: an organism spending more in a day than it takes in makes up the difference out of itself, which is what losing weight is',
      'the first law says nothing about which way a change goes — that is the second law\'s job, and it is why conservation alone cannot explain anything a cell does',
    ],
    explain: 'The last point is the one worth carrying. Both laws are true of every transaction, and they answer different questions. Energy being conserved tells you the books balance; it does not tell you that a smashed egg will not reassemble. For that you need the second law, which is the next objective.',
  },

  {
    id: 'i-entropy-1',
    objective: 'entropy',
    kind: 'task',
    figure: 'fig-entropy',
    goal: 'Push the Efficiency slider all the way to 100 per cent and let the compartment go on running. Watch the three entropy rows: Inside the compartment, Created outside, and Total.',
    question: 'The compartment is now perfectly efficient — every transaction that can reach the chain does. The inside bar still falls and the total still climbs. Why can no setting of that slider make the total fall?',
    expect: 'efficiency === 1 and entropyOutside > 40 and totalEverFell === false',
    explain: 'Efficiency decides how much of each transaction ends up in the chain rather than leaving as heat, so pushing it to 1 removes the waste. It does not remove the bill, because assembling the chain is itself an ordering: putting a monomer in a particular place cuts down the number of arrangements available, and the surroundings have to be paid more than that in order for it to happen at all. The figure will let you try every control it has, and the total row reads "no" throughout.',
  },
  {
    id: 'i-entropy-2',
    objective: 'entropy',
    kind: 'mcq',
    question: 'A new deck of cards is in factory order. Shuffle it and it comes out untidy; shuffle it again and it does not come back. Which statement says why?',
    options: [
      { text: 'One arrangement counts as factory order and an unimaginable number count as untidy, so almost every order a shuffle can reach is untidy.', correct: true },
      { text: 'Nature prefers disorder to order, and every shuffle gives that preference another chance to act on the deck.',
        why: 'Turns a counting argument into a force, which is the commonest way entropy is misunderstood. Nothing prefers anything. Each particular untidy order is exactly as likely as factory order; there are simply far more of them.' },
      { text: 'Once the deck has been shuffled the ordered arrangement is forbidden: entropy is not allowed to decrease.',
        why: 'Reads the second law as a prohibition on a single event rather than as a statement about overwhelming odds. Nothing forbids a shuffle coming out in order. You would just be waiting a very long time.' },
      { text: 'Shuffling puts energy into the deck, and energy put into anything always disorders it — which is why the order never comes back.',
        why: 'Attaches entropy to energy input. You can order the deck by hand using energy too; what decides the direction is how many arrangements look the same from outside, not how much work went in.' },
    ],
    explain: 'Entropy measures how many different arrangements of a system\'s parts would look the same from outside. A change happens of its own accord when it leads to a state there are more ways of being in. That is the whole of it, and it is why "disorder" is a useful gloss and a misleading one: it sounds like a quality of the arrangement rather than a count of them.',
  },
  {
    id: 'i-entropy-3',
    objective: 'entropy',
    kind: 'free',
    question: 'Say what entropy actually measures, rather than what it is usually glossed as. Then explain, using the deck of cards or a case of your own, why a change that happens by itself leaves the universe with more entropy than it had before.',
    rubric: [
      'entropy measures how many different arrangements of a system\'s parts would look the same from outside',
      '"disorder" is close enough to be useful and loose enough to mislead, because it sounds like a property of one arrangement rather than a count of many',
      'a change happens of its own accord when it leads to a state there are more ways of being in',
      'nothing forbids the unlikely change — a shuffle can come out in factory order — it is simply that overwhelmingly more of the available arrangements are untidy ones',
      'the second law says every transfer or conversion of energy leaves the universe with more entropy than before',
      'heat spreading out is the commonest such change, and it is the one a cell keeps making',
    ],
    explain: 'The counting definition is worth the effort because it is the one that survives contact with a cell. "Disorder increases" makes a growing bacterium look like a violation; "there are more arrangements available to the whole system afterwards" does not, and points straight at where to look — the surroundings.',
  },

  {
    id: 'i-second-law-life-1',
    objective: 'second-law-life',
    kind: 'task',
    figure: 'fig-entropy',
    goal: 'Press Seal the boundary and keep watching. Food stops arriving; the chain stops growing, holds for a while, and then begins to come apart. Watch the Inside the compartment row climb back while the Total goes on rising.',
    question: 'Nothing was taken out of the compartment when you sealed it. All you did was stop anything crossing the boundary. Why is that enough to take the order apart?',
    expect: 'mode === sealed and decaying === true and sealedSeconds > 2 and totalEverFell === false',
    explain: 'The second law constrains an isolated system, and sealing the boundary is what makes this one isolated. While it was open it could lower its own entropy by raising its surroundings\' entropy more; sealed, it has no surroundings to charge, so the only changes left to it are the ones that raise its own. The chain comes apart because there are vastly more ways for those monomers to be loose than joined. Notice what never happens on the total row, in this state or any other.',
  },
  {
    id: 'i-second-law-life-2',
    objective: 'second-law-life',
    kind: 'mcq',
    question: 'A bacterium, a drop of nutrient broth and some air are sealed in a small glass ampoule and left on a bench. What does the second law say will happen?',
    options: [
      { text: 'It grows, lowering its own entropy by raising the ampoule\'s more, then stops when the broth runs out, and comes apart. The total rises throughout.', correct: true },
      { text: 'It stops growing at once: nothing inside a sealed system can lower its entropy, and the ampoule is sealed.',
        why: 'Applies the law to the wrong system. The bacterium is still an open system — the ampoule is what is isolated — so the cell can go on ordering itself as long as there is broth to charge the rest of the ampoule for it.' },
      { text: 'It goes on growing indefinitely, since the ampoule holds its own food and air, and the second law governs heat engines and gases rather than living things.',
        why: 'The exemption idea, which was argued seriously in the nineteenth century and has no basis. There is no loophole for life; there is an open boundary, and sealing it closes the account.' },
      { text: 'It grows until the energy in the broth has been used up and destroyed, and then it stops, with no energy left to grow on.',
        why: 'The first law again. Energy is not destroyed by being used, and the ampoule holds exactly as much joule for joule at the end as at the start. What has changed is that it is now heat and small disordered molecules, which is the form nothing can spend.' },
    ],
    explain: 'The ampoule is the honest version of Figure 5.1\'s seal control. Nothing is removed and no rule changes; the boundary simply stops carrying anything. Every organism that has ever lived has been a local, sustained, very large decrease in entropy, and every one of them was paid for by an increase somewhere else that was larger.',
  },
  {
    id: 'i-second-law-life-3',
    objective: 'second-law-life',
    kind: 'free',
    question: 'A growing cell is a large, sustained decrease in entropy. Explain why that does not break the second law. Name what the cell exports, in what form, and say why that export can never be spent again by anything inside the cell.',
    rubric: [
      'the second law constrains an isolated system, and no cell is one: a cell is an open system, with matter and energy crossing its boundary continuously',
      'it lowers its own entropy by raising its surroundings\' entropy by more, so the total goes up — there is no exemption and no loophole',
      'what it exports is heat, mostly, along with small disordered molecules; every step a cell takes is a little inefficient and the inefficiency leaves as random molecular motion',
      'heat cannot be spent again inside a cell because getting work out of heat needs a temperature difference, and a cell is at one temperature throughout to a fraction of a degree',
      'a hot spot a few nanometres across would even out in less time than any chemistry takes, so there is no difference to work with',
      'that is why energy passes through the living world once while matter cycles: a carbon atom is not degraded by being eaten, and energy is degraded at every transfer',
      'and it is where the rule of a tenth comes from — not a biological constant but thermodynamic tax paid at every step, which is why food chains are short',
    ],
    explain: 'The last two points are the ones the chapter is built to reach. Chapter 1 drew two arrows through an ecosystem, gold for energy and green for matter, and said they behaved differently without saying why. This is why: matter is the same atoms rearranged, and energy is degraded a little at every hand-over until none of it is worth anything to anybody.',
  },

  // ============================================================================
  // 5.2 What decides which way a reaction goes
  // ============================================================================

  {
    id: 'i-free-energy-1',
    objective: 'free-energy',
    kind: 'task',
    figure: 'fig-free-energy',
    goal: 'Leave the Reactant and Product sliders exactly where they are. Drag the Heat term up to +40 kJ/mol and read the Verdict row.',
    question: 'You changed the chemistry and nothing else, and the verdict went from exergonic to endergonic. What does that word now tell you about the reaction, and what does it not tell you?',
    expect: 'verdict === endergonic and deltaHKj >= 20 and deltaGKj > 0 and reactantMM === 10 and productMM === 1',
    explain: 'With the heat term at +40 the standard value is +52.4, the concentration term is still −5.9, and the true ΔG is +46.5: positive, so the reaction does not run by itself and the reverse one does instead. That is the whole of what a positive ΔG says. It does not say the reaction is impossible — Section 5.4 makes exactly this sort of reaction go by coupling it — and a negative value, as the figure opened with, would not have said the reaction was fast.',
  },
  {
    id: 'i-free-energy-2',
    objective: 'free-energy',
    kind: 'mcq',
    question: 'A reaction in a sealed test tube has reached ΔG = 0. A chemist adds a trace of radioactively labelled reactant and watches. What does she see?',
    options: [
      { text: 'The label spreads into the product and some comes back, while the amounts never change, because both conversions run at equal rates.', correct: true },
      { text: 'Nothing: at ΔG = 0 the reaction has come to a stop, so the label stays in the reactant exactly where it was put.',
        why: 'Equilibrium read as a stop, which is the same misconception Section 4.3 met at a membrane where molecules go on crossing after net movement has ceased. It is a balance of two flows, not an absence of them, and this experiment is how you tell the difference.' },
      { text: 'The label turns up in the product and stays there, because the forward reaction is the one that happened, and by now it has finished.',
        why: 'Keeps a one-way reaction and explains the unchanging amounts by the reaction being finished. If it were finished the tube would hold no reactant, and it holds plenty.' },
      { text: 'The label stays put: ΔG = 0 means the reaction gives out no heat, and without heat there is nothing to drive it.',
        why: 'Reads ΔG as the heat term. ΔG is ΔH − TΔS, and a reaction at equilibrium may be giving out a great deal of heat in one direction and taking the same amount back in the other.' },
    ],
    explain: 'Free energy is the part of a system\'s energy available to do work. Negative ΔG and the reaction runs by itself; positive and the reverse runs instead; zero and the two directions are running at the same rate, so nothing further changes. That third case is worth stating carefully, because "at equilibrium" and "stopped" look identical from outside and are not the same thing at all.',
  },
  {
    id: 'i-free-energy-3',
    objective: 'free-energy',
    kind: 'free',
    question: 'Define free energy, and say what a negative, a positive and a zero value of ΔG each mean for a reaction. Then explain why a quantity measured in a beaker can tell you what the entropy of the whole universe is about to do.',
    rubric: [
      'free energy, G, is the part of a system\'s energy available to do work at constant temperature and pressure; what matters is never G but the change in it over a reaction',
      'ΔG negative: the reaction runs by itself and is exergonic',
      'ΔG positive: it does not run by itself, and the reverse reaction runs instead, so the forward one is endergonic',
      'ΔG zero: the reaction is at equilibrium — both directions running equally fast, so nothing further changes',
      'ΔG = ΔH − TΔS, and every term is measurable in the beaker: the heat given out or taken in, the temperature, and the entropy change of the system',
      'the heat term divided by the temperature is precisely the entropy the surroundings gain, so the sign of ΔG reports on the universe without anyone having to account for it',
      'that is why Gibbs\'s quantity is usable at all: applying the second law directly would mean adding up the entropy of everything before and after every reaction',
    ],
    explain: 'The second law is exactly right and almost useless to work with. Free energy is the trick that makes it practical, and the trick is entirely in that sixth point: the heat a reaction dumps into its surroundings is the surroundings\' entropy change, so a system-only quantity carries the universe\'s verdict.',
  },

  {
    id: 'i-enthalpy-entropy-1',
    objective: 'enthalpy-entropy',
    kind: 'task',
    figure: 'fig-free-energy',
    goal: 'Press Hydrophobic effect. Read the heat term, the entropy term, and which of the two the figure says is carrying the reaction.',
    question: 'The heat term is positive: this reaction takes heat in. It runs anyway. Which term is paying for it, and — since the tails becoming more ordered cannot be the answer — what exactly is gaining arrangements?',
    expect: 'entropyDriven === true and deltaHKj > 0 and deltaGStandardKj < 0 and carryingTerm === entropy',
    explain: 'The preset sets ΔH to +8 and the entropy term to about +28, so ΔG°′ is −19.9 and the reaction runs although it takes heat in. What gains arrangements is the water. Around each isolated hydrocarbon tail the water molecules are caged into a restricted arrangement; gathering the tails together releases those molecules into the general disorder of the liquid, where there are far more arrangements available to them. The tails themselves become more ordered, not less, and they are not attracted to one another at all.',
  },
  {
    id: 'i-enthalpy-entropy-2',
    objective: 'enthalpy-entropy',
    kind: 'mcq',
    question: 'Dissolving ammonium nitrate in water makes the beaker cold — the process takes heat in — and it happens readily all the same. Which explains it?',
    options: [
      { text: 'The entropy term wins, since ions spread through a liquid have so many more arrangements than a crystal that TΔS outweighs ΔH.', correct: true },
      { text: 'ΔH must really be negative, since only a change that gives out heat can run by itself; the beaker feels cold for some other reason.',
        why: 'Refuses the case rather than explaining it, which is what a reader does when they believe every reaction that runs must give out heat. An endothermic process that happens by itself is ordinary, and this is one.' },
      { text: 'The water catalyses the dissolving, and a catalyst can make a process go that would otherwise be endergonic.',
        why: 'Two errors that often travel together. Nothing here is catalysed, and a catalyst could not help if it were: Section 5.5 is categorical that a catalyst changes the rate and never whether a change is permitted.' },
      { text: 'It is driven by energy stored in the water itself, which is released as the water molecules crowd round and pull the crystal apart.',
        why: 'Invents a source. Breaking the crystal apart costs energy — that is why the beaker goes cold — and the accounting has to end somewhere other than an unnamed reservoir.' },
    ],
    explain: 'ΔG = ΔH − TΔS, and either term can carry a reaction. Many of a cell\'s downhill reactions run because they give out heat; some run against the heat term because they disorder the world enough. The hydrophobic effect of Section 2.3 is the case this chapter cares about, and it is why a membrane assembles: a positive ΔS in the water, not an attraction between the lipids.',
  },
  {
    id: 'i-enthalpy-entropy-3',
    objective: 'enthalpy-entropy',
    kind: 'free',
    question: 'Write down the equation that gives ΔG from the heat term, the entropy term and the temperature, and say how you would use it to predict the sign of ΔG. Then give a case in which a change that takes heat in happens anyway, and say what carries it.',
    rubric: [
      'ΔG = ΔH − TΔS: the heat term minus the absolute temperature times the entropy change of the system',
      'ΔH negative (heat given out) pushes ΔG negative; ΔS positive (more arrangements) pushes ΔG negative, and the more so the higher the temperature',
      'when the two terms pull the same way the sign is fixed; when they oppose, the temperature decides, because only the entropy term carries a T in front of it',
      'a case where heat goes in and the change still runs: the hydrophobic effect — hydrocarbon tails clustering together, or a membrane assembling',
      'what wins is the water: the molecules caged around each isolated tail are released into the general disorder of the liquid, where far more arrangements are available to them',
      'the tails themselves become more ordered, not less, and there is no attraction between them to speak of',
      'so a membrane assembles because of a positive ΔS in the water, which is the mechanism Section 4.1 rests on',
    ],
    explain: 'The third point is the one to keep. Because only the entropy term is multiplied by temperature, an entropy-driven reaction has a temperature below which it will not go and above which it will — which is a thing you can find on Figure 5.2 by moving one slider, and is why the figure prints a flip temperature at all.',
  },

  {
    id: 'i-spontaneous-not-fast-1',
    objective: 'spontaneous-not-fast',
    kind: 'mcq',
    question: 'A spoonful of sugar sits in a bowl in the air for a year and is still sugar. Glucose and oxygen together have a ΔG of about −2,870 kilojoules per mole. Which statement is right?',
    options: [
      { text: 'It is strongly exergonic and so permitted, but the activation energy stops it, and ΔG says nothing about how fast.', correct: true },
      { text: 'ΔG must be positive at room temperature, since the sugar is not reacting, and only turns negative once the sugar is heated.',
        why: 'Makes the thermodynamics follow the observation, which is the exact confusion the word "spontaneous" causes. Heating a spoonful of sugar does not change its ΔG appreciably; it gets some molecules over the barrier.' },
      { text: 'Sugar and oxygen simply do not react with each other under any conditions, so the −2,870 is only a theoretical figure.',
        why: 'Denies the reaction rather than its rate. Set light to the sugar and it burns to carbon dioxide and water, releasing every one of those 2,870 kilojoules — and your own cells do the same reaction at 37 °C.' },
      { text: 'The reaction needs a catalyst, and a reaction that needs a catalyst stays endergonic until it gets one.',
        why: 'Makes catalysis part of the thermodynamics. An enzyme changes only the route; the ΔG of sugar plus oxygen is the same in a bowl, in a flame and in a mitochondrion.' },
    ],
    explain: '"Spontaneous" in ordinary English means "happening soon" and in thermodynamics means only "not requiring a continuing input of work". The two are unrelated, and the word has done enormous damage. Diamond is thermodynamically unstable with respect to graphite, and diamonds do not turn grey.',
  },
  {
    id: 'i-spontaneous-not-fast-2',
    objective: 'spontaneous-not-fast',
    kind: 'mcq',
    question: 'A drug decomposes in water with ΔG°′ = −80 kilojoules per mole, and the manufacturer\'s tablets are still 99 per cent pure after three years on a shelf. What follows?',
    options: [
      { text: 'The decomposition is permitted but its barrier is high: the shelf life is a fact about the rate, not about ΔG.', correct: true },
      { text: 'The coating must be holding the tablet away from equilibrium, the way a cell holds its ATP far from equilibrium with ADP.',
        why: 'Borrows the right idea for the wrong case. A cell holds a reaction from equilibrium by spending continuously to keep the concentrations wrong; nothing is being spent on a tablet in a box, and the ΔG quoted already allows for the conditions.' },
      { text: 'ΔG must be close to zero inside a dry tablet, because there is so little water in it for the hydrolysis to use.',
        why: 'A real effect turned into the whole explanation. Dryness genuinely slows a hydrolysis, and it does not touch the ΔG the question quotes; the answer that survives whether the tablet is bone dry or damp is the barrier.' },
      { text: 'A catalyst added to the tablets would make the decomposition less favourable, and so preserve them even longer.',
        why: 'Gets the direction of a catalyst\'s effect backwards and its nature wrong at the same time. A catalyst cannot change ΔG at all, and what it would do here is destroy the tablets faster.' },
    ],
    explain: 'This is the pharmaceutical version of the sugar bowl, and it is how shelf lives are actually set: measure the rate, not the free energy. The gap between "permitted" and "happening" is where the whole of kinetics lives, and in a cell it is where the whole of enzymology lives.',
  },
  {
    id: 'i-spontaneous-not-fast-3',
    objective: 'spontaneous-not-fast',
    kind: 'free',
    question: 'Explain why a reaction with a large negative ΔG can sit unchanged for years. Then explain why that gap between what is permitted and what happens is the condition for there being any such thing as a cell, rather than an inconvenience a cell has to work around.',
    rubric: [
      '"spontaneous" means only that a reaction does not need a continuing input of work; it says which way, never how fast',
      'getting from reactants to products means passing through a transition state that is worse than either end, and the free energy needed to reach it is the activation energy',
      'only molecules far out in the tail of the energy distribution have that much at the moment of collision, so a high barrier means almost nothing gets over',
      'sugar in a bowl is exergonic by about 2,870 kilojoules a mole and lasts for years; diamond is unstable with respect to graphite and does not turn grey',
      'if every reaction with a negative ΔG went as soon as it could, a cell would be a puff of carbon dioxide: everything in it is combustible and it is surrounded by oxygen',
      'so the barrier is what makes controlled chemistry possible — exergonic reactions mostly wait until something lets them',
      'free energy says what is permitted; enzymes decide what actually occurs, and changing which enzymes are present changes what the cell is',
    ],
    explain: 'The fifth and sixth points are the ones that turn a piece of physical chemistry into a fact about life. A cell is a bag of fuel in an oxidising atmosphere, and the only reason it is not on fire is that almost nothing in it can reach its own transition state unassisted.',
  },

  {
    id: 'i-concentrations-decide-1',
    objective: 'concentrations-decide',
    kind: 'task',
    figure: 'fig-free-energy',
    goal: 'Leave the Heat term and the Entropy term exactly where they are. Push the Product slider to the top and the Reactant slider to the bottom, then read the Verdict, the Standard ΔG°′ row and the Equilibrium ratio row.',
    question: 'The verdict has flipped from exergonic to endergonic, and the standard value and the equilibrium ratio have not moved at all. What did you change, and what does that say about how much of "which way a reaction goes" is chemistry?',
    expect: 'verdict === endergonic and concentrationTermKj > 0 and deltaHKj === -20 and deltaGStandardKj < 0',
    explain: 'The standard value is still −7.6 and the balance ratio is still 19.0, because you touched no atom of the chemistry. What changed is the concentration term: with the product at 100 millimoles per litre and the reactant at 0.01, the ratio is ten thousand to one and the term is +23.8, which more than cancels the standard value and leaves ΔG at +16.2. The ratio moved five decades, from one product per ten reactants to ten thousand per one, and at 5.9 kilojoules per mole a decade that is about thirty — far more than the 7.6 the chemistry had in hand.',
  },
  {
    id: 'i-concentrations-decide-2',
    objective: 'concentrations-decide',
    kind: 'mcq',
    question: 'A step in the middle of a pathway has a standard free energy change of +7 kilojoules per mole. Measured in a working cell it runs forwards, briskly, all day. How?',
    options: [
      { text: 'The next enzyme removes the product before it can build up, keeping the ratio low enough that the true ΔG stays negative.', correct: true },
      { text: 'Its enzyme makes the reaction exergonic, which is what an enzyme is for, and the +7 is the value measured without the enzyme.',
        why: 'The single commonest thing readers believe an enzyme does. It changes the rate and nothing else; a step with a positive true ΔG will not go however good its catalyst is.' },
      { text: 'ATP is hydrolysed close by, and the heat it gives off supplies the extra seven kilojoules the step needs to go forwards.',
        why: 'The proximity picture that Section 5.4 exists to take away. Heat at one temperature can do no work, and unless the two reactions share a chemical intermediate they do not add.' },
      { text: 'The tabulated +7 must be wrong, since a reaction that runs forwards briskly all day cannot have a positive value.',
        why: 'Confuses the standard value with the real one. The +7 is measured with everything at one mole per litre, a condition no cell is in for any substance at all, and it is perfectly compatible with a negative ΔG in a cell.' },
    ],
    explain: 'This is why metabolism is arranged in pathways. A step whose standard value is slightly positive runs perfectly well in the middle of a sequence, because the step after it removes the product. A pathway is not a queue of separate reactions; it is one reaction pulling the next. And the pull needed here is small: at 5.9 kilojoules per mole for each tenfold ratio, holding the product a little over one decade below the reactant cancels the +7.',
  },
  {
    id: 'i-concentrations-decide-3',
    objective: 'concentrations-decide',
    kind: 'free',
    question: 'Write down the relation between the true ΔG and the standard ΔG°′, and explain what each part of it does. What is RT at body temperature, what is a tenfold ratio of products to reactants worth, and why can the answer the standard value gives be the wrong one for a cell?',
    rubric: [
      'ΔG = ΔG°′ + RT ln([products] / [reactants])',
      'ΔG°′ is a fixed property of the reaction, measured with every reactant and product at one mole per litre — a condition no cell is in for anything',
      'the second term is how far the actual mixture is from its equilibrium point, and it can be larger than the standard value',
      'RT at body temperature is 2.6 kilojoules per mole — the same 2.6 Section 2.2 used for the thermal jostling available at 37 °C, because it is the same quantity',
      'a natural logarithm turns each tenfold change in the ratio into 2.3 of those, so every factor of ten between products and reactants is worth 5.9 kilojoules per mole',
      'divided by the charge on a mole of ions that same number is the 61.5 millivolts per decade Section 4.7 used for a resting potential: the same constant in electrical clothes',
      'so a cell can make an unfavourable reaction run by holding the product concentration low, and the cheapest way to do that is to have another enzyme waiting to take it away',
    ],
    explain: 'The 5.9 is worth memorising, because it comes back twice more in this chapter: it is a tenfold concentration ratio here, a tenfold rate in Section 5.5 when the same arithmetic is applied to a barrier, and a tenfold ion ratio in chapter 4 when it is divided by the Faraday constant. One constant, three costumes.',
  },

  {
    id: 'i-equilibrium-is-death-1',
    objective: 'equilibrium-is-death',
    kind: 'task',
    figure: 'fig-free-energy',
    goal: 'Push the Product slider to the bottom, press Keep the product removed (it reads Keep removed on a narrow screen), then press Run. Watch the True ΔG row and the counter of how long it has stayed negative.',
    question: 'Left alone this reaction drifts to equilibrium and ΔG reaches zero. With the product taken away as fast as it is made, ΔG stays where it is indefinitely. Which of those two is a living cell, and what is the other one?',
    expect: 'productRemoved === true and secondsNegative > 4 and atEquilibrium === false and deltaGKj < 0',
    explain: 'The switch is doing what the next enzyme in a pathway does: removing the product before it can build up. The concentration term never climbs, ΔG never approaches zero, and the reaction runs for as long as you are willing to watch — a steady state, with concentrations holding still because matter is flowing through them. Turn the switch off and it settles within seconds. A cell at equilibrium has every gradient flat, every ratio at its equilibrium value and ΔG zero everywhere, and there is by definition no work left in it. That is a precise description of a corpse.',
  },
  {
    id: 'i-equilibrium-is-death-2',
    objective: 'equilibrium-is-death',
    kind: 'mcq',
    question: 'A candle flame keeps the same shape for an hour. A sealed flask of a sugar and its isomer, left with the enzyme that interconverts them, also stops changing. Both look still. What is the difference?',
    options: [
      { text: 'The flame is a steady state, held still by fuel flowing through it, while the flask is at equilibrium, with ΔG zero and no work left.', correct: true },
      { text: 'There is no real difference between them: a steady state is only an equilibrium that is taking a long time to arrive.',
        why: 'The confusion this objective exists to remove, and it sounds reasonable because both look motionless. A steady state is not on its way to equilibrium; it is held away from it, and it costs something continuously to hold.' },
      { text: 'The flame is at equilibrium too, since its shape is not changing, and the flask is a steady state because molecules are still interconverting.',
        why: 'Exactly inverted, and it is worth seeing why: "things are still happening" is true of both, so it cannot be the test. The test is whether anything is crossing the boundary.' },
      { text: 'The flame has a positive ΔG that its own heat keeps up, and the reaction in the flask has a negative one.',
        why: 'Attaches the distinction to a sign rather than to a flow. The reactions in a flame are strongly exergonic; what makes it a steady state is that fuel keeps arriving and products keep leaving.' },
    ],
    explain: 'The flask is Figure 5.5\'s closing case and the sort activity\'s: a fixed ratio that more enzyme does not shift. The flame is the cell. What a living cell maintains is concentrations that hold still because matter is flowing through them, which is chapter 1\'s homeostasis seen as a chemistry — held still, not at rest.',
  },
  {
    id: 'i-equilibrium-is-death-3',
    objective: 'equilibrium-is-death',
    kind: 'free',
    question: 'Explain why "equilibrium is death" is a literal statement about a cell rather than a metaphor. Then say what a cell actually does to keep a reaction running once its products have begun to build up, and name two ways it does it.',
    rubric: [
      'at equilibrium ΔG is zero everywhere, every gradient is flat and every ratio is at its equilibrium value',
      'so there is by definition no work left in the system: nothing can be moved, built, pumped or transported',
      'that is a precise description of a corpse, and reaching it is what dying consists of — it is not an analogy',
      'what a living cell maintains instead is a steady state: concentrations holding still because matter is flowing through at a constant rate, which is chapter 1\'s homeostasis seen as chemistry',
      'to keep a reaction running the cell keeps the ratio of products to reactants away from its equilibrium value',
      'one way: remove the product — have the next enzyme of the pathway take it away, which is why metabolism is arranged in pathways rather than as separate reactions',
      'the other: keep the reactant supplied, from the fuel coming in, so the concentration term never climbs',
      'both cost something continuously, which is why a cell has to keep eating and why it dies quite quickly when it stops',
    ],
    explain: 'A candle flame keeps its shape by the same means and goes out for the same reason. The cost of being a steady state is that it is a state you have to keep buying, and everything from here to the end of the unit is about what a cell buys it with.',
  },

  // ============================================================================
  // 5.3 The cell spends one molecule
  // ============================================================================

  {
    id: 'i-atp-structure-1',
    objective: 'atp-structure',
    kind: 'task',
    figure: 'fig-atp',
    goal: 'Turn the molecule with a drag so you can see the chain of three phosphates, then press Hydrolyse and watch what leaves and what is left behind.',
    question: 'Water attacked the outermost phosphate. Name the two things the molecule has become, and say which part of what remains is the nucleotide chapter 2 described.',
    expect: 'hydrolysed === true and scene === molecule',
    explain: 'ATP is a nucleotide — adenine joined to the sugar ribose — with a chain of three phosphate groups attached to the sugar instead of the single phosphate a nucleotide in RNA carries. Taking the outer one off with water gives ADP, which still has two, and a free inorganic phosphate ion, written P<sub>i</sub>. The molecule that stores the genetic information and the molecule that pays for everything are built from the same kit, which is one of the better pieces of evidence that both are very old.',
  },
  {
    id: 'i-atp-structure-2',
    objective: 'atp-structure',
    kind: 'mcq',
    question: 'Which describes the structure of ATP?',
    options: [
      { text: 'Adenine joined to ribose, with a chain of three phosphate groups attached to the sugar.', correct: true },
      { text: 'Adenine joined to deoxyribose, with a chain of three phosphate groups attached to the sugar.',
        why: 'Swaps the sugar for DNA\'s. ATP carries ribose; the deoxy version is what a nucleotide in DNA has, and it is a different molecule with a different job.' },
      { text: 'Adenine with its three phosphate groups attached directly to the base, and a ribose on the other side.',
        why: 'Puts the phosphates on the wrong part. All three hang off the sugar in a chain, one after another, which is why they are crowded together and repelling — the crowding is the whole reason the molecule is useful.' },
      { text: 'A small protein carrying three phosphate groups, which it hands out one at a time as needed.',
        why: 'Reads "does a job in the cell" as "is a protein". ATP is a small organic molecule of about 507 grams per mole, and there is nothing exotic about it at all.' },
    ],
    explain: 'Structurally it is ordinary, which is part of the point. A bacterium in a hot spring, an oak, a jellyfish and the cell reading this sentence all use the same molecule, and have done since before the three domains separated. There is a second version of the reaction, used where more pull is needed, in which two phosphates come off together as a linked pair which is then itself split; that releases rather more and is how a cell builds DNA and RNA.',
  },
  {
    id: 'i-atp-structure-3',
    objective: 'atp-structure',
    kind: 'free',
    question: 'Name the three parts of an ATP molecule and say how they are joined. Write the reaction a cell actually uses, name both products, and say how much it releases under standard conditions.',
    rubric: [
      'adenine, a nitrogenous base',
      'ribose, a five-carbon sugar, joined to the adenine',
      'a chain of three phosphate groups, attached to the sugar one after another',
      'so ATP is a nucleotide — Section 2.8\'s three parts — with two extra phosphates on the chain',
      'the reaction is the removal of the outermost phosphate by water: ATP + H<sub>2</sub>O ⇌ ADP + P<sub>i</sub>',
      'ADP is adenosine diphosphate, what is left with two phosphates; P<sub>i</sub> is a free inorganic phosphate ion',
      'under standard conditions this releases 30.5 kilojoules per mole — and inside a cell it is worth considerably more, which is the next objective',
    ],
    explain: 'Getting the parts and the reaction down cold is worth doing, because the next three objectives are all arguments about this one equation: why it releases anything, why the phrase "high-energy bond" is wrong about it, and why the number in a cell is nearer 50 than 30.5.',
  },

  {
    id: 'i-atp-why-energy-1',
    objective: 'atp-why-energy',
    kind: 'task',
    figure: 'fig-atp',
    goal: 'Press Hydrolyse, then press Repulsion and Hydration to put both overlays over the split molecule.',
    question: 'The repulsion overlay shows the three charges pushing on one another before the split, and the hydration overlay shows water closing around both products afterwards. Both of those are about the products or about what the products are relieved of. Name a third and a fourth thing that got better, and say what all four have in common.',
    expect: 'hydrolysed === true and repulsionShown === true and hydrationShown === true',
    explain: 'Four things are better about ADP and free phosphate than about ATP, and not one of them is a property of the bond that broke. The three phosphate groups each carry a negative charge within a few tenths of a nanometre of each other, so the molecule is under electrostatic strain and splitting one off relieves it. The freed phosphate ion spreads its charge evenly over four equivalent oxygens. The water holds the two products better than it held ATP. And there are now two molecules where there was one, which is an entropy gain. ATP is not a compressed spring; it is a molecule whose products are more comfortable than it is.',
  },
  {
    id: 'i-atp-why-energy-2',
    objective: 'atp-why-energy',
    kind: 'mcq',
    question: 'A chemist makes an analogue of ATP in which the three phosphates are held out on a rigid arm, far enough apart that they no longer repel one another. Everything else about the molecule is unchanged. What happens to the free energy released when it is hydrolysed?',
    options: [
      { text: 'It falls, but not to nothing, because only the relief of the crowded charges is gone and the other three things still pay.', correct: true },
      { text: 'Nothing changes: the bond being broken is the same bond, and that bond is where the energy comes from.',
        why: 'The bond picture in its purest form, and the reason this item exists. If the energy came out of the bond, changing everything around the bond would not matter. It does matter, which is the evidence that it does not.' },
      { text: 'It rises, because pulling the phosphates apart has strained the molecule, and strain is energy stored up waiting for release.',
        why: 'Keeps the spring picture and relocates it. The question says the arm is rigid and the charges no longer repel, so the crowding has been removed rather than increased; and in any case the released energy is a comparison between reactant and products, not a store inside either.' },
      { text: 'It falls to zero, since the repulsion between the crowded charges is the whole of what makes ATP an energy carrier at all.',
        why: 'Promotes one of four contributions into the whole account. Relief of repulsion is one of the four things that pay for the reaction; the spread of charge over four oxygens, the water holding the products better, and the extra molecule are all still there.' },
    ],
    explain: 'The test of a mechanism is whether you can predict what happens when you take one piece out. Free energy comes out of a reaction when the bonds made in the products, taken together with everything else that changes, are better than the bonds broken in the reactants. Remove one of the things that got better and the reaction releases less — which is a prediction the bond picture cannot make.',
  },
  {
    id: 'i-atp-why-energy-3',
    objective: 'atp-why-energy',
    kind: 'free',
    question: 'Explain why hydrolysing ATP releases free energy. Give four reasons, and make sure every one of them is about the products rather than about the bond that broke.',
    rubric: [
      'the three phosphate groups each carry a negative charge and are strung together within a few tenths of a nanometre of one another; like charges repel, so the molecule is under electrostatic strain and splitting one off relieves it',
      'the free phosphate ion that leaves spreads its charge evenly over four equivalent oxygens — an arrangement with more ways of being itself than it had while attached, and a real and substantial stabilisation',
      'the water around the two products holds them better than it held ATP, in the way Section 2.3 described water closing around a dissolved ion',
      'there are now two molecules where there was one, which is an entropy gain of the kind Section 5.1 described',
      'none of the four is a property of the bond that broke: breaking that bond cost energy, as breaking any bond does',
      'so the free energy is the balance over everything that changed — ATP is not a compressed spring, it is a molecule whose products are more comfortable than it is',
    ],
    explain: 'The discipline of keeping every reason on the products\' side is what makes the next objective easy. Once you have four things that are better about ADP and phosphate, the question "what was stored in the bond" stops having anywhere to live.',
  },

  {
    id: 'i-not-high-energy-bond-1',
    objective: 'not-high-energy-bond',
    kind: 'task',
    figure: 'fig-atp',
    goal: 'Move the Row slider along the ledger to the first line — the one that reads +34.0 — and read the note the figure prints beside it.',
    question: 'That line is positive when every other line in the ledger is negative. What is it measuring, and what does its sign say about the idea that energy is stored inside the bond?',
    expect: 'ledgerRow === bond and bondBreakingKj > 0 and ledgerTotalKj < -30 and ledgerOpen === true',
    explain: 'The +34.0 is what breaking the bond to the outer phosphate costs, on the figure\'s own apportionment of the measured −30.5 — the five lines are an account of where the total comes from and not five separate measurements, and the figure says so. A cost, not a yield: it is the only positive line in the account, and the four lines below it — relief of the crowded charges, the freed phosphate spreading its charge, water holding both products better, two molecules where there was one — are what pay for it, with 30.5 left over. That is why the ledger totals a negative number while its first line is positive, and it is exactly the shape of the argument the phrase "high-energy bond" gets backwards.',
  },
  {
    id: 'i-not-high-energy-bond-2',
    objective: 'not-high-energy-bond',
    kind: 'mcq',
    question: 'Which is the strongest evidence that no energy is stored inside ATP\'s outer phosphate bond, waiting to be let out by breaking it?',
    options: [
      { text: 'Breaking any covalent bond costs energy, so nothing is got by breaking one; the 30.5 is a balance over everything that changes.', correct: true },
      { text: 'The bond joining one phosphate to the next is weaker than other covalent bonds, so much less energy is needed to break it.',
        why: 'A belief a reader can genuinely hold, and it is false about the chemistry: that bond is an ordinary covalent bond of ordinary strength. Nothing about ATP is unusually fragile. What is unusual is how much better off its products are.' },
      { text: 'The squiggle chemists use to draw that bond is only a notation, and a line on a page cannot store any energy.',
        why: 'Argues from the symbol rather than from the chemistry. Fritz Lipmann\'s squiggle stood for a real claim about a real quantity in 1941; what is wrong with it is where it puts the quantity, not that it is drawn.' },
      { text: 'The energy is stored in the molecule as a whole, spread across all its bonds, rather than in any one of them.',
        why: 'The closest of the four, and it is still a store. Nothing is stored anywhere waiting to be released: free energy is the difference between two states, and it only exists once you name both of them.' },
    ],
    explain: 'Section 2.2 puts a carbon–carbon bond at about 350 kilojoules per mole to break, and nothing is ever got by breaking one on its own. A reaction releases free energy when the bonds made in the products, taken together with everything else that changes, are better than the bonds broken in the reactants. The energy comes out of the comparison, not out of a bond. Some textbooks now use "phosphoryl transfer potential" instead — a measure of how readily a compound will hand its phosphate to something else — which puts the emphasis on the transfer and on what is waiting at the other end.',
  },
  {
    id: 'i-not-high-energy-bond-3',
    objective: 'not-high-energy-bond',
    kind: 'free',
    question: 'Say what is wrong with calling ATP\'s outer phosphate bond a "high-energy bond", and state what breaking any covalent bond actually costs. Section 2.5\'s table of functional groups used a version of the phrase — was it wrong to?',
    rubric: [
      'the phrase invites a picture of energy stored inside a bond like air in a tyre, waiting to be let out by breaking it',
      'breaking a bond always costs energy and making one always releases it; that is not a rule about phosphates, it is what a bond is',
      'a carbon–carbon bond takes about 350 kilojoules per mole to break and an oxygen–hydrogen bond about 460, and nothing is ever got by breaking one on its own',
      'a reaction releases free energy when the bonds made in the products, taken with everything else that changes, are better than the bonds broken in the reactants — the energy is in the comparison',
      'the phrase was coined by Fritz Lipmann in 1941 and is often drawn as a squiggle',
      'Section 2.5\'s table said a phosphate\'s bonds to further phosphates carry energy the cell can spend, which is serviceable as shorthand and wrong as an account of what happens',
      'a better phrase is "phosphoryl transfer potential": how readily a compound will hand its phosphate group to something else, which puts the emphasis on the transfer and on what is waiting at the other end',
    ],
    explain: 'The sixth point is worth being honest about rather than pretending the earlier chapter was simply wrong. Shorthand that gets a reader to the right prediction is useful until the moment it blocks the next idea, and this one blocks Section 5.4: if energy comes out of a bond, coupling looks like delivering a parcel, and coupling is not that.',
  },

  {
    id: 'i-atp-cellular-value-1',
    objective: 'atp-cellular-value',
    kind: 'task',
    figure: 'fig-atp',
    goal: 'Push all three concentration sliders — ATP, ADP and Pᵢ — up to 1,000 millimoles per litre, which is one mole per litre each. Then compare the ΔG the figure prints with the ledger total above it.',
    question: 'At those settings the two numbers are the same. What condition have you just put the molecule in, and why is the value a cell sees quite different?',
    expect: 'atpMM === 1000 and adpMM === 1000 and phosphateMM === 1000 and deltaGKj > -31.5 and deltaGKj < -29.5',
    explain: 'One mole per litre of everything is what "standard" means, and at that point the concentration term is zero and the true value is the table\'s −30.5. A cell holds them nowhere near that and nowhere near each other: about 5 millimoles per litre of ATP, a tenth as much ADP, and about 5 millimoles per litre of phosphate. That ratio is 5 × 10<sup>−4</sup>, its natural logarithm is −7.6, and multiplied by RT\'s 2.6 kilojoules per mole it is −19.6 — so ΔG is −30.5 − 19.6, about −50. Move the sliders back and watch it return.',
  },
  {
    id: 'i-atp-cellular-value-2',
    objective: 'atp-cellular-value',
    kind: 'mcq',
    question: 'A cell holds ATP at about 5 millimoles per litre, ADP at about 0.5, and phosphate at about 5. RT at body temperature is 2.6 kilojoules per mole, and the standard free energy change for hydrolysis is −30.5. What is a mole of ATP worth in that cell?',
    options: [
      { text: 'About −50 kilojoules per mole: the concentration term, RT ln(5 × 10<sup>−4</sup>), is −19.6, added to −30.5.', correct: true },
      { text: 'About −30.5 kilojoules per mole, since that is what the hydrolysis of ATP releases wherever it happens.',
        why: 'Treats the standard value as the value. It is a fixed property of the reaction measured at one mole per litre throughout, which is a condition no cell is in for any substance at all.' },
      { text: 'About −10.9 kilojoules per mole: the concentration term is added to the standard value, so −30.5 + 19.6.',
        why: 'The arithmetic is right and the sign of the term is wrong, which is the commonest slip in this calculation. Products far below reactants make the logarithm negative, which pushes ΔG further down, not up — the reaction has more room to run, not less.' },
      { text: 'It cannot be worked out from these figures alone: you would also need the enthalpy change for the hydrolysis.',
        why: 'Reaches for ΔH because the equation ΔG = ΔH − TΔS is the other one in the section. The enthalpy is already inside the −30.5; what the concentrations add is a separate term, and nothing else is needed.' },
    ],
    explain: 'The extra twenty kilojoules is not chemistry. It is the cell holding its ATP some two thousandfold further from equilibrium than the standard state — a little over three of Section 5.2\'s decades — and paying continuously to keep it there. A cell\'s ATP is worth more than the table says for exactly the reason a charged battery is worth more than a flat one.',
  },
  {
    id: 'i-atp-cellular-value-3',
    objective: 'atp-cellular-value',
    kind: 'free',
    question: 'Work out what a mole of ATP is worth inside a cell, showing where each number comes from. Then say why the answer is larger than the standard figure, and what the cell has to do to keep it that way.',
    rubric: [
      'start from ΔG = ΔG°′ + RT ln([products] / [reactants]), with ΔG°′ = −30.5 kilojoules per mole',
      'a cell holds roughly 5 mmol/L ATP, about a tenth as much ADP (0.5 mmol/L), and about 5 mmol/L phosphate',
      'the ratio is (0.0005 × 0.005) ÷ 0.005 = 5 × 10<sup>−4</sup>',
      'its natural logarithm is −7.6, and RT at 37 °C is 2.6 kilojoules per mole, so the concentration term is −19.6',
      'ΔG = −30.5 − 19.6 ≈ −50 kilojoules per mole, which is the figure Section 4.7 used and this section promised to justify',
      'the extra twenty kilojoules is not chemistry: it is the cell holding ATP about two thousandfold further from equilibrium than the standard state, a little over three decades',
      'and it costs continuously to hold it there — a charged battery is worth more than a flat one, and keeping it charged is what catabolism is for',
    ],
    explain: 'Notice which way the concentration term points and why. A cell keeps its ATP high and its ADP low, so products sit far below reactants, so the logarithm is negative, so the reaction has further to fall. Every pump and every motor in chapter 4 was quietly drawing on that twenty kilojoules.',
  },

  {
    id: 'i-currency-not-store-1',
    objective: 'currency-not-store',
    kind: 'mcq',
    question: 'A 70 kg adult holds about 60 grams of ATP at any moment, and makes and spends something like 85 kilograms of it in a day. What follows?',
    options: [
      { text: 'The pool turns over about 1,400 times a day, roughly once a minute, so ATP is change in the pocket, not money in the bank.', correct: true },
      { text: 'The body makes 85 kilograms of ATP a day, far more than it needs at once; it stores most of the surplus as fat.',
        why: 'Reads "made" as "accumulated". Nothing is accumulating: the 60 grams is a steady-state pool, and the 85 kilograms is the same few grams of adenine being phosphorylated and dephosphorylated over and over.' },
      { text: 'Most of the 85 kilograms is recycled without ever being spent, so the body\'s true consumption of ATP is much lower.',
        why: 'Half-sees the recycling and then discounts the spending. Every one of those moles was spent — that is what made it ADP — and every one was remade. The recycling is the mechanism of the spending, not an alternative to it.' },
      { text: 'The 60 grams is roughly a day\'s supply, held ready and drawn down as the day goes on.',
        why: 'Out by a factor of about 1,400, and it is the error the word "store" causes. At 50 kilojoules a mole, 60 grams is a little over 5 kilojoules, against 8,400 a day: a minute\'s worth, not a day\'s.' },
    ],
    explain: 'The arithmetic: 25 litres of cell water at 5 millimoles per litre is about an eighth of a mole; a mole of ATP weighs 507 grams, so the whole body\'s stock is around 60 grams. The 8,400 kilojoules a day at 50 kilojoules a mole is about 170 moles, some 85 kilograms — more than its owner weighs. Treat those as orders of magnitude rather than measurements; the shape of the answer is not in doubt.',
  },
  {
    id: 'i-currency-not-store-2',
    objective: 'currency-not-store',
    kind: 'mcq',
    question: 'Cyanide stops cells making ATP. It kills in minutes. A person who stops eating altogether survives for weeks. Why the difference?',
    options: [
      { text: 'A cell holds a minute\'s worth of ATP, and starving leaves weeks of fuel to make more from while cyanide stops the making.', correct: true },
      { text: 'Cyanide destroys the ATP that is already in the cell as well as stopping more being made, which is why it works so much faster.',
        why: 'Gives the poison a second action it does not have. It blocks the making; the spending goes on exactly as before, and the pool is gone within a minute because the pool was never more than a minute deep.' },
      { text: 'A cell\'s store of ATP would last for hours without topping up, so cyanide must kill by some faster route of its own.',
        why: 'Keeps the store picture and invents a mechanism to rescue it. The arithmetic is the whole explanation: about 60 grams held against 85 kilograms spent in a day.' },
      { text: 'It kills because the fuel that can no longer be oxidised builds up inside the cells until it poisons them from within.',
        why: 'Looks for the damage upstream instead of downstream. What kills is everything that needs paying for stopping at once — pumps first, which is why nerve and heart cells go first.' },
    ],
    explain: 'This is the practical form of "currency, not store". A cell does not store energy as ATP; it stores it as fuel and as the gradients of Section 4.7, and holds about a minute\'s worth of small change. That is why a poison which stops ATP being made kills in minutes rather than days, and why there is nothing to fall back on when it does.',
  },
  {
    id: 'i-currency-not-store-3',
    objective: 'currency-not-store',
    kind: 'free',
    question: 'Explain why ATP is called a currency rather than a store, using the size of a cell\'s ATP pool against what it spends in a day. Then say where a cell does keep its energy, and predict what happens when a cell\'s ATP supply stops.',
    rubric: [
      'a cell holds ATP at about 5 mmol/L; the 25 litres of cell water in a 70 kg adult make about an eighth of a mole, and a mole weighs 507 grams — so about 60 grams in the whole body',
      'against that, 8,400 kilojoules a day at about 50 kilojoules a mole is roughly 170 moles, some 85 kilograms made and spent in a day',
      'so the pool turns over about 1,400 times a day: once a minute, and much faster in a working muscle',
      'these are orders of magnitude rather than measurements — not every joule passes through ATP, and the concentrations vary between tissues — but the shape of the answer is not in doubt',
      'a cell stores energy as fuel, in glycogen and fat, and as the gradients of Section 4.7; ATP is what it converts those into at the moment of spending',
      'so a cell has no reserve: when ATP production stops, what is left is about a minute\'s worth',
      'which is why a poison that stops ATP being made kills in minutes rather than days, and why the cells that fail first are the ones spending most — nerve and heart',
    ],
    explain: 'Muscle keeps the one real exception, and it is tiny and one rung up the ladder: creatine phosphate, which does nothing except re-phosphorylate ADP as fast as it is produced, and carries a sprinter through the first few seconds before anything slower has started.',
  },

  // ============================================================================
  // 5.4 Nothing is paid for with heat
  // ============================================================================

  {
    id: 'i-coupling-principle-1',
    objective: 'coupling-principle',
    kind: 'task',
    figure: 'fig-coupling',
    goal: 'Leave the bench uncoupled, as it opens, and press Step three times. Then read the three tallies: Jobs done, Source spent and Heat shed.',
    question: 'Three ATP were spent and the job has not moved at all. Where did the free energy go, and why is the job no nearer being done than before you started?',
    expect: 'coupled === false and sourceSpent === 3 and jobsDone === 0 and heatKj > 90',
    explain: 'Three ATP at 30.5 kilojoules a mole is 91.5, and every kilojoule of it is on the heat row. This is the answer nearly everybody gives to "how does a cell pay for an uphill reaction" — hydrolyse some ATP nearby and the energy released drives it — and it is wrong in an instructive way. Energy released into the general surroundings becomes heat, and Section 5.1 established that heat inside a cell, all at one temperature, can do no work whatever. Two reactions in the same drop of cytoplasm are no help to one another.',
  },
  {
    id: 'i-coupling-principle-2',
    objective: 'coupling-principle',
    kind: 'mcq',
    question: 'A cell needs to run a reaction that is endergonic by 38 kilojoules per mole. One ATP is worth about −50 in a cell. Which is true?',
    options: [
      { text: 'Coupled through a shared intermediate, the pair sums to −12 and runs; uncoupled, the ATP is spent and nothing moves.', correct: true },
      { text: 'It cannot be made to run at all: a reaction with a positive ΔG does not go, whatever else is happening.',
        why: 'Takes Section 5.2\'s rule and forgets that coupling makes two reactions into one. The rule is about the reaction; once there is a shared intermediate there is only one reaction, and it is the sum that has to be negative.' },
      { text: 'Two ATP are needed for each run of the reaction, since 38 is more than the 30.5 kilojoules that a mole of ATP releases.',
        why: 'Uses the standard value where the cellular one belongs. In a cell ATP is worth about 50, not 30.5, and 50 against 38 is comfortable — this is exactly the twenty kilojoules Section 5.3 worked out.' },
      { text: 'One ATP is enough as long as it is hydrolysed close enough to the reaction for the heat to reach it.',
        why: 'The proximity picture, in the version that sounds most careful. Distance is not what matters and heat is not the mechanism; what matters is whether the product of one reaction is the reactant of the other.' },
    ],
    explain: 'Only coupled reactions have free energy changes that add, and only the sum has to be negative. That is the whole arithmetic of paying for things in a cell, and it is why Section 5.3 spent a page working out that a cell\'s ATP is worth 50 rather than 30.5: the margin decides what is affordable.',
  },
  {
    id: 'i-coupling-principle-3',
    objective: 'coupling-principle',
    kind: 'free',
    question: 'A cell does three quite different kinds of work. Name them, give a case of each, and explain what has to be true before the free energy of ATP hydrolysis can be added to the free energy of the job.',
    rubric: [
      'chemical work: making a bond that would not form on its own — joining glutamate to ammonia to give glutamine, which costs 14.2 kilojoules per mole',
      'transport work: moving something against its gradient — the sodium–potassium pump of Section 4.6',
      'mechanical work: moving a structure — kinesin taking an 8 nm step along a microtubule for each ATP it splits',
      'for the free energy changes to add, the two reactions must share a chemical intermediate: the product of the first is the reactant of the second, so they are not two reactions but two steps of one',
      'only then does the sum matter, and only the sum has to be negative',
      'free energy released nearby is no help: it becomes heat, and heat at one temperature can do no work',
      'one currency covers all three kinds of work, which is why a cell needs only one',
    ],
    explain: 'A beaker of ATP and a beaker of glutamate, mixed, will hydrolyse the ATP and leave the glutamate exactly as it was, a little warmer. That is the experiment the coupling bench performs with its switch off, and the readout that climbs is the heat one.',
  },

  {
    id: 'i-shared-intermediate-1',
    objective: 'shared-intermediate',
    kind: 'task',
    figure: 'fig-coupling',
    goal: 'With glutamine as the job and ATP as the source, press Couple. Read the name the figure gives the intermediate, and the sum printed beside it.',
    question: 'Nothing about either reaction changed when you pressed that switch, and yet the job now gets done. What appeared, and why does its appearance let the two free energy changes be added?',
    expect: 'coupled === true and intermediate ~ glutamyl and proceeds === true and sumKj < 0',
    explain: 'The intermediate is glutamyl phosphate, and glutamine synthetase never lets it leave the enzyme. The reaction the enzyme appears to do — glutamate plus ammonia to glutamine — is not the reaction it does: it phosphorylates the glutamate first, making a compound partway up Figure 5.3\'s ladder and therefore much readier to react, and then lets that fall. The +14.2 the amide bond costs and the −30.5 the ATP releases add to −16.3, comfortably downhill. The cell did not add energy to anything; it made an unstable intermediate and let it fall.',
  },
  {
    id: 'i-shared-intermediate-2',
    objective: 'shared-intermediate',
    kind: 'mcq',
    question: 'A bacterium turns acetate into acetyl-CoA in two enzyme-catalysed steps: acetate + ATP → acetyl phosphate + ADP, then acetyl phosphate + CoA → acetyl-CoA + P<sub>i</sub>. Which molecule is the shared intermediate, and how would you know?',
    options: [
      { text: 'Acetyl phosphate, because it is made in the first step and then used up in the second.', correct: true },
      { text: 'ATP: it supplies the free energy for the whole thing, and coupling means sharing that free energy.',
        why: 'Names the source rather than the link. ATP appears in the first step only; a shared intermediate has to appear as a product on one line and a reactant on the next, and ATP does not.' },
      { text: 'ADP, since it is produced in the first step and then used again by the cell to make more ATP.',
        why: 'Follows the currency out of the reaction and back into the cell. That does happen, elsewhere; within this pair ADP is a product of step one and appears nowhere in step two.' },
      { text: 'Acetyl-CoA, because it is what the whole two-step process is for and the reason both steps happen.',
        why: 'Confuses the point of the reaction with the mechanism of the coupling. The final product is what the sum produces; it cannot be the link between the two steps, because nothing comes after it here.' },
    ],
    explain: 'The test is mechanical and always the same: find the molecule that is a product on one line and a reactant on the next, which is what makes the two steps one reaction whose free energy changes add. Acetyl phosphate is on Figure 5.3\'s ladder at about −43 kilojoules per mole, a rung above ATP — which is the other half of the story, since a compound above ATP can hand its phosphate to ADP, and acetate has been raised to a rung from which it can fall onto CoA.',
  },
  {
    id: 'i-shared-intermediate-3',
    objective: 'shared-intermediate',
    kind: 'free',
    question: 'Explain why coupling requires a shared chemical intermediate rather than free energy released nearby. Why is a protein always involved, and what would you see in a tube where ATP and an endergonic reaction were merely present together?',
    rubric: [
      'free energy released into the surroundings becomes heat, and a cell is all at one temperature, so that heat can do no work whatever',
      'getting work out of heat requires a temperature difference, and a hot spot a few nanometres across would even out in less time than any chemistry takes',
      'two reactions are coupled when they share a chemical intermediate — the product of the first is the reactant of the second — so they are two steps of one reaction rather than two reactions',
      'only then do their free energy changes add, and only the sum has to be negative',
      'a protein is needed because something must hold both reactants in the same place and pass the intermediate from one step to the next before it can wander off',
      'in a tube with no coupling the ATP is hydrolysed at the same rate as ever, the other reaction does not move, and the mixture gets slightly warmer',
      'the worked case: glutamine synthetase makes glutamyl phosphate, which never leaves the enzyme, and the sum of its two steps is the reaction the cell wanted',
    ],
    explain: 'The fifth point is why "coupling" is a fact about molecules rather than an accounting convenience. An intermediate that escaped into the cytosol would be hydrolysed by water like anything else, and the free energy would arrive as heat after all — which is why enzymes that do this hold on to it.',
  },

  {
    id: 'i-phosphorylation-work-1',
    objective: 'phosphorylation-work',
    kind: 'task',
    figure: 'fig-coupling',
    goal: 'Choose Motor step as the job and ATP as the source, then press Couple. Read what the figure calls the intermediate.',
    question: 'In the pump the phosphate comes off ATP and goes onto the protein. Here it does not go anywhere: the intermediate is the nucleotide in the motor\'s own site. Is this still coupling, and what makes it so?',
    expect: 'job === motor-step and source === atp and coupled === true and intermediate ~ nucleotide and proceeds === true',
    explain: 'It is coupling, because the requirement was never that a phosphate be handed over — it was that the two changes be steps of one reaction. A motor protein binds ATP in its own site and splits it there, and the sequence of shapes that binding, splitting and releasing put the protein through is what produces the step. The movement is not driven by the chemistry from a distance; it is part of the chemistry, and the two cannot be separated even in principle. The job costs 24.1 and ATP gives 30.5, so the pair runs with 6.4 to spare.',
  },
  {
    id: 'i-phosphorylation-work-2',
    objective: 'phosphorylation-work',
    kind: 'mcq',
    question: 'Section 4.6 described the sodium–potassium pump taking a phosphate from ATP onto itself, and switching between its two shapes as that phosphate goes on and comes off. Read with Section 5.4 in hand, what does that mean about the relationship between the pump and the ATP\'s reaction?',
    options: [
      { text: 'The phosphorylated pump is the shared intermediate: the pump is part of the ATP\'s own reaction, not a user of its energy.', correct: true },
      { text: 'The ATP hydrolyses and releases its energy nearby, and the pump collects that energy and uses it to change shape.',
        why: 'The collecting picture, and it is what almost every reader arrives with. There is nothing to collect: released energy is heat, and heat does no work here. The pump does not receive energy, it receives a phosphate.' },
      { text: 'The phosphate is only a signal telling the pump when to change shape; the energy for the transport comes from somewhere else.',
        why: 'Borrows Section 5.7\'s covalent switch, where phosphorylation genuinely is a signal, and applies it to a case where the phosphorylation is the payment. Both exist; what tells them apart is whether the transfer is what drives the change.' },
      { text: 'The pump is a catalyst for ATP hydrolysis like any other enzyme, and the transport of ions happens as a side effect.',
        why: 'Half true and it drops the half that matters. The pump does catalyse the hydrolysis, and the transport is not a side effect: uncouple them and the hydrolysis slows right down, because the protein cannot complete its cycle.' },
    ],
    explain: 'Almost everything ATP does, it does by putting its outer phosphate somewhere. Onto a substrate and the substrate becomes reactive: that is chemical work. Onto a transport protein and the protein changes shape: that is transport work. Into a motor\'s own site, where it is split without being handed on: that is mechanical work. Three kinds of work, one currency, and in every case the machine is inside the reaction rather than beside it.',
  },
  {
    id: 'i-phosphorylation-work-3',
    objective: 'phosphorylation-work',
    kind: 'free',
    question: 'Explain how transferring a phosphate group gets something done, using the sodium–potassium pump and a motor protein as your two cases. Say in each what the shared intermediate is, and why the two cases look different while obeying the same principle.',
    rubric: [
      'phosphorylation is transferring a phosphate group from ATP onto something else — a substrate, a transport protein, a target protein',
      'the receiving molecule either becomes less stable and therefore readier to react, or changes shape and so changes what it does',
      'the pump: it takes the phosphate from ATP onto itself, and the attachment and removal of that phosphate switch it between its two shapes',
      'so the phosphorylated protein is the shared intermediate, and the pump is part of the ATP\'s own reaction rather than a machine driven by it',
      'the motor: kinesin binds ATP in its own site and splits it there, taking one 8 nm step along a microtubule per molecule',
      'here the phosphate is not handed on, and the intermediate is the nucleotide bound in the motor — it is the sequence of shapes that binding, splitting and releasing put the protein through that produces the step',
      'the principle is unchanged in both: the movement is not driven by the chemistry from a distance, it is part of the chemistry, and the two cannot be separated even in principle',
    ],
    explain: 'The reason to hold both cases is that the first makes coupling look like a hand-over and the second shows it is not. What is required is that the two changes be steps of one reaction. Handing the phosphate on is one way to arrange that; keeping it in your own site and going through a cycle of shapes is another.',
  },

  {
    id: 'i-pump-efficiency-1',
    objective: 'pump-efficiency',
    kind: 'task',
    figure: 'fig-coupling',
    goal: 'Switch to the Pump scene. Push the Na⁺ outside slider up to 220 millimoles per litre and the Na⁺ inside slider down to 1, and watch the Margin row and the direction the pump is running.',
    question: 'The pump has started making ATP instead of spending it, and nothing about the machine was altered. What decided the direction, and what does that tell you about how close the ordinary pump is to its limit?',
    expect: 'scene === pump and direction === reversed and marginKj > 0 and naOutsideMM === 220',
    explain: 'At chapter 4\'s own values a cycle must supply about 44 kilojoules per mole — 44.4 in Section 5.4\'s table, which rounds row by row, and 44.3 on the figure, which does not — against an ATP worth about 50. The Margin row reads −5.8, so the pump runs forwards using roughly nine-tenths of what it is given. Steepening the sodium gradient raises the cost until it passes 50, the margin turns positive, and the machine runs the other way. When two sides of a coupled reaction are within a few kilojoules of each other, which way it goes is decided by the conditions and not by the machinery. Chapter 7 is built entirely on a machine run in that reversed direction.',
  },
  {
    id: 'i-pump-efficiency-2',
    objective: 'pump-efficiency',
    kind: 'mcq',
    question: 'One turn of the sodium–potassium pump moves three sodium ions out, costing 39.6 kilojoules per mole, and two potassium ions in, costing only 4.8 — although potassium\'s gradient is the steeper of the two, 140 inside against 4 outside. Why is the potassium row so cheap?',
    options: [
      { text: 'The inside is negative, so the voltage helps each potassium ion in and pays back about three-quarters of its concentration cost.', correct: true },
      { text: 'Potassium\'s gradient is shallower than sodium\'s, so less work is needed to move each potassium ion against it.',
        why: 'A guess at the arithmetic that the numbers contradict. Potassium is 140 against 4, a thirty-five-fold difference; sodium is 145 against 12, about twelvefold. The steeper gradient is the cheap one, which is the whole puzzle.' },
      { text: 'Only two ions move instead of three, and two-thirds of 39.6 is about 26; the difference from 4.8 is rounding.',
        why: 'Accounts for the number of ions and ignores the charge. Two-thirds of 39.6 would be 26.4, and the row reads 4.8: the missing 21 is the membrane voltage, which is the point of the row.' },
      { text: 'Potassium leaks back out through open channels all the time, so the pump does not have to work as hard to bring it back in.',
        why: 'Brings in a real process from the wrong part of chapter 4. The leak is what makes the resting potential and it happens after the pumping; it does not reduce what a pump cycle costs.' },
    ],
    explain: 'Each ion is paid for twice over, once against its concentration and once against the voltage, and for potassium the two pull opposite ways: moving a positive charge into a negative interior is helped. Per mole of ion, the concentration term is +9.2 and the voltage term is −6.8, so two potassium ions together cost about a third of what one sodium ion does.',
  },
  {
    id: 'i-pump-efficiency-3',
    objective: 'pump-efficiency',
    kind: 'free',
    question: 'Work out what one turn of the sodium–potassium pump has to supply, using chapter 4\'s gradients and resting potential, and compare it with what an ATP is worth in a cell. What does the comparison say about the machine?',
    rubric: [
      'chapter 4\'s values: sodium 145 mmol/L outside and 12 inside, potassium 140 inside and 4 outside, resting potential about 70 millivolts with the inside negative',
      'one turn moves three sodium ions out and two potassium ions in, both uphill, and each ion is paid for twice — once against its concentration and once against the voltage',
      'three sodium out: about +6.4 per mole against concentration and +6.8 against voltage, so about +39.6 for the row',
      'two potassium in: about +9.2 against concentration and −6.8 against voltage, because moving a positive charge into a negative interior is helped — about +4.8 for the row',
      'the cycle must therefore supply about +44.4 kilojoules per mole',
      'one ATP at cellular concentrations is worth about −50, so the pump uses about nine-tenths of what it is given — a remarkable figure for any machine',
      'and the two totals are close enough that steepening the gradients in the laboratory makes the margin positive and the pump runs backwards, synthesising ATP',
    ],
    explain: 'The last point is why this arithmetic is worth doing rather than quoting. A machine working within a few kilojoules of its limit has its direction set by the conditions rather than by its design, and that is not a defect — it is the property chapter 7 is built on, in the folded inner membrane of Section 3.5.',
  },

  // ============================================================================
  // 5.5 An enzyme changes the route, not the destination
  // ============================================================================

  {
    id: 'i-activation-energy-1',
    objective: 'activation-energy',
    kind: 'task',
    figure: 'fig-enzyme',
    goal: 'Leave the enzyme off the bench, as the figure opens. Press Show the transition state, and read the height of the climb against the ΔG printed beside the two ends.',
    question: 'The reaction runs downhill by 12 kilojoules per mole and has to climb 68 to get there. At 37 °C the average molecule carries about 2.6. What does that arithmetic say about how many collisions get over?',
    expect: 'transitionShown === true and enzymePresent === false and activationKj === 68 and deltaGKj === -12',
    explain: 'The transition state is the worst moment of the journey: bonds half broken and half formed, charges where no charge wants to be, atoms pushed together that repel. The free energy needed to reach it from the reactants is the activation energy, and only a molecule that happens to have that much at the instant of collision gets over — everything else bounces off unchanged. Against 2.6 kilojoules per mole of thermal jostling, a 68 kilojoule barrier is climbed only by molecules far out in the tail of the distribution, which is why the converted tally on this bench barely moves.',
  },
  {
    id: 'i-activation-energy-2',
    objective: 'activation-energy',
    kind: 'mcq',
    question: 'At 37 °C the average molecule carries about 2.6 kilojoules per mole of thermal energy. A reaction has a barrier of 68. What does that comparison tell you?',
    options: [
      { text: 'Only rare molecules far out in the tail of the distribution get over, so the rate depends steeply on the barrier\'s height.', correct: true },
      { text: 'No molecule can ever get over, since 2.6 is so much less than 68 that no collision could make up the difference.',
        why: 'Treats the average as a ceiling. Molecular energies are spread over a wide distribution and are being redistributed by collisions billions of times a second, so a few always have far more than the average — which is why a reaction with a high barrier is slow rather than impossible.' },
      { text: '68 kilojoules per mole would have to be supplied from outside, by ATP or some other source, before the reaction could start.',
        why: 'Reads the barrier as a debt to be paid rather than a hurdle to be cleared. Nothing is supplied: the energy comes from the molecules\' own thermal motion, and it is returned on the way down.' },
      { text: 'ΔG for the reaction must be at least +68: that is how much it takes to get from the reactants to the top.',
        why: 'Confuses the height of the barrier with the difference between the two ends. The barrier is the route; ΔG is the destination, and this reaction is exergonic by 12 while having a 68 kilojoule climb in front of it.' },
    ],
    explain: 'How far out in the tail a molecule has to be decides everything. The relationship is exponential: at body temperature every 5.9 kilojoules per mole taken off the barrier multiplies the rate by ten. The 5.9 is the same number as Section 5.2\'s tenfold concentration ratio, because it is the same RT and the same logarithm. It is worth keeping: it turns "the enzyme speeds this up a hundred million million million times" into "the enzyme took about a hundred kilojoules off the barrier", which is a quantity you can reason about.',
  },
  {
    id: 'i-activation-energy-3',
    objective: 'activation-energy',
    kind: 'free',
    question: 'Explain what an activation energy is and what a transition state is. Then explain why a reaction with a negative ΔG can wait years for one, using an example.',
    rubric: [
      'getting from reactants to products is not a slide but a climb followed by a descent',
      'along the way there is an arrangement worse than either end — bonds half broken and half formed, charges where no charge wants to be, atoms pushed together that repel',
      'that worst moment is the transition state; it is too short-lived to isolate',
      'the free energy needed to reach it from the reactants is the activation energy',
      'only a molecule with that much energy at the instant of collision gets over; everything else bounces off unchanged',
      'at 37 °C the average molecule carries about 2.6 kilojoules per mole, so a barrier of 50 or 100 is cleared only by molecules far out in the tail',
      'the relationship is exponential: every 5.9 kilojoules per mole off the barrier multiplies the rate by ten at body temperature',
      'so ΔG and the barrier are independent — sugar in air is exergonic by 2,870 kilojoules a mole and lasts for years',
    ],
    explain: 'The last point is the one to be able to say without hesitating. ΔG is about the two ends and the barrier is about the route between them, and nothing about either constrains the other. Almost every confusion in this chapter comes from letting one stand in for the other.',
  },

  {
    id: 'i-enzyme-lowers-barrier-1',
    objective: 'enzyme-lowers-barrier',
    kind: 'task',
    figure: 'fig-enzyme',
    goal: 'Press Add enzyme. Read the two barrier heights on the landscape before and after, and watch where its two ends are before and after.',
    question: 'The barrier fell by about 17.8 kilojoules per mole in both directions, and the Forward rate row went from about 0.035 a second to about 33 — a thousandfold. Check that 17.8 against Section 5.5\'s conversion of 5.9 kilojoules per mole per tenfold: does it come out?',
    expect: 'enzymePresent === true and activationKj < 51 and speedUp > 900',
    explain: 'It does: 17.8 divided by 5.9 is three, and three decades is a thousandfold, which is what the speed-up reads. The forward barrier goes from 68 to 50.2 and the reverse from 80 to 62.2 — the same 17.8 off both, because the transition state is the same arrangement whichever side you climb from. What has not moved is either end of the landscape: ΔG is still −12 and the balance ratio is still 105.0.',
  },
  {
    id: 'i-enzyme-lowers-barrier-2',
    objective: 'enzyme-lowers-barrier',
    kind: 'mcq',
    question: 'One step in making a nucleotide has a half-life of about 78 million years in water, and a matter of milliseconds with its enzyme — a speed-up of the order of 10<sup>17</sup>. Roughly how much has the enzyme taken off the barrier, and by what means?',
    options: [
      { text: 'About 100 kilojoules per mole, seventeen decades at 5.9 each, by binding the transition state more tightly than the substrate.', correct: true },
      { text: 'About 100 kilojoules per mole, which the enzyme supplies to each substrate molecule out of the free energy the reaction itself releases.',
        why: 'Gets the quantity right and invents a delivery. An enzyme supplies nothing; it offers a different route, and the energy to climb the smaller barrier still comes from the molecules\' own thermal motion.' },
      { text: 'All of it: the enzyme lowers the barrier all the way to zero, which is why the reaction becomes practically instant.',
        why: 'Reads a very large speed-up as an infinite one. Milliseconds is not instant, and a barrier of zero would mean every collision succeeded — which would also mean the reverse reaction had no barrier, and the products would come apart as fast as they formed.' },
      { text: 'None of it: the enzyme breaks the bonds itself and assembles the product directly, so no barrier is left for the substrate to climb.',
        why: 'Makes the enzyme a machine tool rather than a catalyst. An enzyme is not consumed and does not appear in the overall equation; if it broke the bonds itself it would be a reactant.' },
    ],
    explain: 'About 100 kilojoules per mole is less than a third of a carbon–carbon bond. The enzyme has not done anything violent; it has found a way round. Linus Pauling put the underlying idea most clearly in the 1940s: whatever an enzyme does chemically, the effect is to stabilise the worst moment of the journey, and stabilising the top of a barrier is the same thing as lowering it.',
  },
  {
    id: 'i-enzyme-lowers-barrier-3',
    objective: 'enzyme-lowers-barrier',
    kind: 'free',
    question: 'Explain how an enzyme speeds a reaction. Name what it does to the transition state, and give at least two of the concrete ways it does it.',
    rubric: [
      'it offers a completely different route between the same two places, through a different and much lower transition state',
      'the one idea underneath all the others, put most clearly by Pauling: an enzyme binds the transition state more tightly than it binds the substrate, and stabilising the top of a barrier is the same thing as lowering it',
      'proximity and orientation: two substrates that would have to find each other by luck are held next to each other the right way round, which is most of what a collision has to achieve',
      'strain: the site bends the substrate towards the shape of the transition state',
      'a microenvironment the bulk solution cannot supply — water excluded, a local charge presented, an effective pH quite different from the cytosol\'s',
      'its own chemistry: side chains lend a proton and take it back, or form a brief covalent bond, splitting one difficult step into two easy ones',
      'many enzymes need a cofactor — a zinc, iron or magnesium ion in the site — to do chemistry the twenty side chains cannot; an organic one that binds loosely and leaves carrying something is a coenzyme, and most coenzymes are made from vitamins',
    ],
    explain: 'Any two of the concrete mechanisms will do, but the second point is the one that organises them. They are not a list of tricks: each is a way of making the transition state a better place to be than it would otherwise have been, which is the only thing that can lower a barrier.',
  },

  {
    id: 'i-enzyme-not-equilibrium-1',
    objective: 'enzyme-not-equilibrium',
    kind: 'task',
    figure: 'fig-enzyme',
    goal: 'Press Add enzyme, leave the Temperature slider alone at 37 °C, then press Start from product to empty the pot and refill it with pure product. Let it run, and watch the Balance ratio row — the number a run from pure reactant also ends at.',
    question: 'You started this run from the opposite end and the enzyme is still on the bench. The reaction is now going backwards. Where is it heading, and why is that the one thing the enzyme cannot touch?',
    expect: 'enzymePresent === true and startedFrom === product and reverted > 0 and equilibriumRatio > 104 and equilibriumRatio < 106',
    explain: 'It heads for a balance ratio of 105.0, which is where a run from pure reactant ends up as well. The enzyme lowers the barrier by the same amount in both directions — the transition state is the same arrangement whichever side you approach it from — so both rates rise by the same factor and the ratio at which they balance is untouched. Leave the temperature alone while you do this: the balance ratio is measured against RT and genuinely does move with temperature, which would confuse the one comparison this task is making.',
  },
  {
    id: 'i-enzyme-not-equilibrium-2',
    objective: 'enzyme-not-equilibrium',
    kind: 'mcq',
    question: 'Why must an enzyme speed the reverse reaction by exactly the same factor as the forward one?',
    options: [
      { text: 'There is one transition state for both directions, so lowering it lowers both barriers by the same amount.', correct: true },
      { text: 'Because the enzyme is not used up by either reaction, so it is free to catalyse both directions equally often.',
        why: 'True about the enzyme and not an answer to the question. Being available to both directions would not stop it favouring one of them; what stops it is that there is only one hilltop and both routes go over it.' },
      { text: 'Because the enzyme leaves ΔG unchanged, and the rate of a reaction in each direction follows its ΔG.',
        why: 'Gets the argument the wrong way round, and the second half is the error the whole section exists to remove. Rates do not follow ΔG at all — that is what "spontaneous does not mean fast" means. ΔG being unchanged is a consequence here, not the reason.' },
      { text: 'It does not have to: many enzymes are directional and favour one way, which is how a cell drives a pathway forwards.',
        why: 'A reasonable-sounding generalisation from a true observation: pathways do run one way. What makes them do so is the concentrations — the next enzyme removing the product — and never the catalyst\'s preference, because a catalyst that had one would be a perpetual motion machine.' },
    ],
    explain: 'An enzyme changes when you arrive, never where. It does not change ΔG, it does not change the position of equilibrium, and it therefore cannot make an endergonic reaction happen; one that could would be a perpetual motion machine, and a cell that needs an uphill reaction must couple it as Section 5.4 showed.',
  },
  {
    id: 'i-enzyme-not-equilibrium-3',
    objective: 'enzyme-not-equilibrium',
    kind: 'free',
    question: 'An exergonic reaction settles at equilibrium with ten times as much product as reactant. Its enzyme is added. Say what happens to the rate, to ΔG and to the position of equilibrium, and explain why an enzyme cannot make an endergonic reaction go.',
    rubric: [
      'the rate rises, in both directions, by the same factor: equilibrium is reached sooner',
      'ΔG does not change: the reactants and products are the same molecules at the same energies, and only the route between them has altered',
      'the position of equilibrium does not change either — the ratio stays at ten to one',
      'the reason both rates rise equally is that the transition state is the same arrangement whichever side you approach it from, so the barrier falls by the same amount in both directions',
      'an enzyme therefore cannot make an endergonic reaction happen: one that could would be a perpetual motion machine, since you could run the reaction uphill and let it fall back for ever',
      'a cell that needs an uphill reaction must couple it to an exergonic one through a shared intermediate, as Section 5.4 showed',
      'and an enzyme is not used up and does not appear in the overall equation: it changes when you arrive, never where',
    ],
    explain: 'The sharpest test of all this is on the chapter\'s own sorting activity: a sealed flask of a sugar and its isomer settles at a fixed ratio, and adding ten times as much enzyme does not change the ratio. More catalyst gets you there faster and leaves the destination exactly where it was.',
  },

  {
    id: 'i-active-site-1',
    objective: 'active-site',
    kind: 'task',
    figure: 'fig-enzyme',
    goal: 'Press Add enzyme, then press Offer the substrate and watch what the site does as it takes it.',
    question: 'The site closed around the molecule rather than simply admitting it. What is that closing called, and what can an enzyme do because of it that a rigid pocket could not?',
    expect: 'enzymePresent === true and offered === substrate and accepted === true and siteClosed === true',
    explain: 'That is induced fit, Daniel Koshland\'s 1958 correction to Emil Fischer\'s lock and key of 1894. A rigid site could select a molecule and could not strain it; a site that closes around its substrate grips the molecule and bends it towards the shape of the transition state. More glove than lock. Offer the same site a wrongly shaped molecule and it refuses, because the substrate is held by many weak interactions acting at once and a dozen weak contacts only all fit if the shape is right.',
  },
  {
    id: 'i-active-site-2',
    objective: 'active-site',
    kind: 'mcq',
    question: 'An enzyme converts D-glucose readily and will not touch L-glucose, its mirror image — a molecule with exactly the same bonds, the same atoms and the same energy. What explains the difference?',
    options: [
      { text: 'A dozen weak contacts hold the sugar in the site, and its mirror image, which cannot be superimposed on it, cannot make them all.', correct: true },
      { text: 'L-glucose has a higher activation energy for the same reaction, so the enzyme converts it far too slowly to notice.',
        why: 'Invents a difference between two molecules that have none. Mirror images have identical bonds and identical energies; everything that distinguishes them is about fitting into something that is itself handed, which is what a folded protein is.' },
      { text: 'The enzyme binds both sugars equally well but converts only D-glucose, because D is the more stable of the two.',
        why: 'Two errors that support each other. The two are equally stable, and the observation is that L-glucose is not handled at all — which is a binding result, not a conversion one.' },
      { text: 'The site is a rigid pocket cut to the exact shape of D-glucose, like a lock to its key, so nothing else can get into it.',
        why: 'The lock and key, which is genuinely the first picture anyone had and is not quite right. A rigid site could not strain the substrate towards the transition state, which is one of the main things an enzyme does; Koshland\'s induced fit is the correction.' },
    ],
    explain: 'Where both the binding and the fussiness come from is the same place: many weak interactions of the kind Section 2.2 described, acting together. Each one is far too weak to hold anything on its own, and a dozen of them only all land if the molecule presented is the right shape — which is why enzymes are as selective as they are without needing anything like a lock.',
  },
  {
    id: 'i-active-site-3',
    objective: 'active-site',
    kind: 'free',
    question: 'Describe an active site — what it is made of and how it is formed. Then explain from induced fit why an enzyme handles one substrate and not its near neighbours.',
    rubric: [
      'an active site is a pocket, usually small, on the surface of the enzyme, where the substrate binds and the chemistry happens',
      'it is formed by the folding of the chain rather than by a run of neighbouring residues, so side chains from distant parts of the sequence come together to line it',
      'Section 2.7\'s tertiary structure is what makes an active site, which is why a single substitution far from the site can still ruin it',
      'the substrate is held by many of the weak interactions of Section 2.2 acting at once — hydrogen bonds, charge attractions, hydrophobic contacts',
      'that is where both the binding and the fussiness come from: a dozen weak contacts only all fit if the shape is right',
      'induced fit: the site closes around the substrate as it binds, more glove than lock, which is Koshland\'s 1958 correction to Fischer\'s lock and key of 1894',
      'so an enzyme can be selective and still distort what it has selected, straining the substrate towards the shape of the transition state — which a rigid site could not do',
    ],
    explain: 'The third point is the one with consequences beyond this chapter. Because the site is made by the fold and not by the sequence around it, a mutation anywhere in the protein can destroy the site without being anywhere near it — which is most of what a genetic disease of an enzyme turns out to be.',
  },

  {
    id: 'i-why-not-heat-1',
    objective: 'why-not-heat',
    kind: 'task',
    figure: 'fig-enzyme',
    goal: 'Press Add enzyme and let the reaction run fast for a moment. Then push the Temperature slider up to 55 °C and keep watching the barrier on the landscape and the Forward rate row.',
    question: 'Heating it did speed the reaction, for a few seconds. Then the barrier sprang back almost to where it was without any enzyme at all. What happened to the enzyme, and what does that say about heat as a way of speeding a cell up?',
    expect: 'temperatureC === 55 and denatured === true and activationKj > 64 and speedUp < 5',
    explain: 'At 55 °C the enzymes on the bench unfold, which is Section 2.7\'s denaturation, and an unfolded enzyme has no active site: the barrier returns towards its bare 68 and the speed-up collapses from about a thousand to about four. A living body has far less room than the bench: by the measurement Section 2.7 reports, the least stable proteins of liver and muscle begin to come apart at, or barely above, body temperature, so the range available is a few degrees. Watch what does not change while all this happens — ΔG stays at −12 throughout, because destroying the catalyst cannot alter the two ends any more than adding it could.',
  },
  {
    id: 'i-why-not-heat-2',
    objective: 'why-not-heat',
    kind: 'mcq',
    question: 'A bioengineer proposes speeding up a slow step in a cultured human cell by running the incubator at 47 °C instead of 37. What is wrong with the plan?',
    options: [
      { text: 'Two things: the least stable proteins begin to unfold within a degree or two of 37 °C, and heat speeds every reaction, wanted or not.', correct: true },
      { text: 'Nothing is wrong in principle: the rate roughly doubles for each 10 °C; thermophilic bacteria run their chemistry far hotter than that.',
        why: 'Notices the rate rule and stops there. Thermophiles do live hot, and they do it with proteins that fold stably at those temperatures, not by heating ordinary ones — which is the difference the plan skips over.' },
      { text: 'It would not work at all: temperature cannot change the rate of a reaction, because the barrier is fixed by the chemistry.',
        why: 'Overcorrects into a false statement. Temperature changes rates a great deal — it is what puts molecules over the barrier — and the enzyme\'s own rate curve rises with it until the protein gives way.' },
      { text: 'It would change ΔG for the step, so the cell would end up making different products from the ones it makes at 37 °C.',
        why: 'Attributes to heat the one thing it does not do here. Temperature does appear in ΔG = ΔH − TΔS and does shift equilibria, but the reason the plan fails is the protein and the indiscriminacy, and no new products appear.' },
    ],
    explain: 'The first reason is Section 2.7\'s measurement: in liver and muscle the least stable proteins begin to come apart at, or barely above, body temperature, and 47 °C is far past that. The second is the deeper one. What a cell buys with catalysis is not speed but choice. An enzyme speeds one reaction out of the thousands chemically available and leaves the rest alone, so a cell\'s metabolism is not what its chemistry could do but the small subset it has provided an enzyme for. Heat has no such selectivity, and a cell full of combustible molecules in oxygen has a great many reactions it needs not to happen.',
  },
  {
    id: 'i-why-not-heat-3',
    objective: 'why-not-heat',
    kind: 'free',
    question: 'A cell could speed its reactions up by getting hotter and does not. Give two reasons. Then say what a cell gets from catalysis besides speed, and why that is the more important of the two.',
    rubric: [
      'the rate of a typical reaction roughly doubles for each 10 °C, so heating would work in principle',
      'first reason: the least stable proteins begin to come apart at, or barely above, body temperature — Section 2.7\'s denaturation, measured in liver and muscle — so the range available is only a few degrees',
      'second and more fundamental: heat is indiscriminate, speeding every reaction in the cell including all the ones the cell needs not to happen',
      'a cell is full of combustible molecules and is surrounded by oxygen, so there are a great many such reactions',
      'an enzyme, by contrast, speeds one reaction out of the thousands chemically available and leaves the rest alone',
      'so what a cell buys with catalysis is not speed but choice: its metabolism is not what its chemistry could do, but the small subset it has provided an enzyme for',
      'and changing which enzymes are present changes what the cell is — which is how one genome makes a liver cell and a neuron',
    ],
    explain: 'The last point is where this chapter meets chapter 8. If metabolism is the set of reactions a cell has enzymes for, then controlling which enzymes exist is controlling what the cell does, and that control is exercised on the DNA.',
  },

  // ============================================================================
  // 5.6 How fast, and what slows it down
  // ============================================================================

  {
    id: 'i-rate-vs-substrate-1',
    objective: 'rate-vs-substrate',
    kind: 'task',
    figure: 'fig-kinetics',
    goal: 'Sweep the Substrate slider up in steps — try about 2, 5, 10, 20, 30 and then the top — pausing at each so a point is plotted. Watch the lane fill up as the curve bends over.',
    question: 'By the top of the range almost nine sites in ten are busy at any instant and the rate has stopped climbing. Adding more substrate does nothing. What is the enzyme short of, and what is it not short of?',
    expect: 'plotted >= 6 and substrateMM > 35 and occupancy > 0.85 and inhibitor === none',
    explain: 'It is short of free sites and it is not short of substrate. There are a fixed number of active sites, each occupied for a fixed time per customer, so once nearly all of them are busy nearly all of the time more substrate cannot help: every extra molecule simply waits. That is what a ceiling is, and the marker on the graph is the maximum rate. Chapter 4 drew this same curve for a glucose carrier in a red cell membrane and said it was an enzyme\'s curve for the same reason — a site, a cycle and a ceiling.',
  },
  {
    id: 'i-rate-vs-substrate-2',
    objective: 'rate-vs-substrate',
    kind: 'mcq',
    question: 'Rate is plotted against substrate concentration for a fixed amount of enzyme. The curve rises steeply, bends over and flattens. Why does it flatten?',
    options: [
      { text: 'The sites are nearly all busy, because their number is fixed and each is tied up for a set time per molecule.', correct: true },
      { text: 'At high concentrations the substrate is being used up faster than it arrives, so the enzyme begins to run short of it.',
        why: 'Reads the flattening as a shortage of the thing being added, which is the opposite of what the axis says. Each point is measured at a fixed substrate concentration, and the flat part is where substrate is in greatest excess.' },
      { text: 'Product builds up faster when there is more substrate, and the accumulated product inhibits the enzyme and holds the rate down.',
        why: 'Reaches for a real phenomenon — product inhibition exists — to explain something that needs nothing beyond counting sites. An initial-rate measurement is made before product has accumulated, and the curve flattens all the same.' },
      { text: 'Very high substrate concentrations begin to denature the enzyme, so some of it stops working as more substrate is added.',
        why: 'Borrows the mechanism from the temperature curve. Substrate does not unfold anything; if it did, the rate would fall rather than level off, which is exactly how the temperature curve differs from this one.' },
    ],
    explain: 'Once nearly all the sites are occupied nearly all of the time, more substrate has nowhere to go. The maximum rate is what the enzyme achieves when every active site is occupied at all times, so it depends on how much enzyme is present and how fast each molecule cycles — double the enzyme and you double it. The Michaelis constant is the substrate concentration at which the rate is half the maximum, and its useful property is that it does not depend on how much enzyme there is at all.',
  },
  {
    id: 'i-rate-vs-substrate-3',
    objective: 'rate-vs-substrate',
    kind: 'free',
    question: 'Explain how to read a rate-against-substrate curve. Say what the maximum rate and the Michaelis constant each mean, which of them depends on how much enzyme is present, and why chapter 4\'s glucose carrier gave a curve of exactly this shape.',
    rubric: [
      'fix the amount of enzyme, raise the substrate concentration step by step, and plot how fast product appears; the curve rises steeply, bends over and flattens',
      'the maximum rate is the ceiling: what the enzyme achieves when every active site is occupied at all times',
      'it depends on how much enzyme is present and on how fast each molecule cycles, so doubling the enzyme doubles it',
      'the Michaelis constant is the substrate concentration at which the rate is half the maximum',
      'it does not depend on how much enzyme is present: it is a property of the enzyme itself, and roughly says how low a concentration the enzyme can work at',
      'the qualification on "roughly" is real, because it also depends on how fast the enzyme works once bound',
      'the curve flattens because there are a fixed number of binding sites, each occupied for a fixed time per customer',
      'a carrier gives the same curve for the same reason — a site, a cycle and a ceiling — which is why Section 4.5\'s glucose carrier saturates and a channel does not',
      'the turnover number is the third figure: how many molecules one enzyme converts per second when saturated, from a few to a million',
    ],
    explain: 'Michaelis and Menten gave these two constants their form in 1913, from work done in Berlin the year before. Maud Menten was Canadian, one of the first women in Canada to take a medical degree, and could not get a research post at home; the paper they wrote together is among the most cited in biochemistry.',
  },

  {
    id: 'i-km-tuning-1',
    objective: 'km-tuning',
    kind: 'task',
    figure: 'fig-kinetics',
    goal: 'Open Cases if the named enzymes are not already showing, and load Glucokinase. Then set the Substrate slider to 5 millimoles per litre, which is blood glucose, and read the Michaelis constant and how much of the lane is busy.',
    question: 'The liver\'s enzyme has a Michaelis constant of 10 and is meeting 5, so only a third of its sites are busy. Most cells use hexokinase instead, whose constant is a tenth of a millimole, and the same 5 saturates it completely. Which of the two can tell whether its owner has eaten?',
    expect: 'preset === glucokinase and km === 10 and substrateMM === 5 and occupancy < 0.5',
    explain: 'Glucokinase can. Its constant sits above the blood concentration, so it is never saturated and its rate rises and falls with the blood — which is exactly what a liver needs, since its job is to act on how much sugar has arrived. Hexokinase, at a tenth of a millimole against blood glucose\'s five, is saturated at all times and works flat out whether its owner has eaten or not, which is what you want of a cell that must keep going regardless. Same reaction, same substrate, two enzymes tuned to two different questions.',
  },
  {
    id: 'i-km-tuning-2',
    objective: 'km-tuning',
    kind: 'mcq',
    question: 'An enzyme in a nerve terminal clears a transmitter whose concentration in the synaptic cleft swings between about 0.1 and 100 micromoles per litre. The enzyme\'s Michaelis constant is 200 micromoles per litre. Does its rate track the transmitter concentration, or ignore it?',
    options: [
      { text: 'It tracks it, since the whole range is below the constant and the enzyme is far from saturated throughout it.', correct: true },
      { text: 'It ignores it: a constant above the whole range means the enzyme is saturated everywhere in that range and works flat out.',
        why: 'Has the relationship inverted, and it is the commonest slip with this quantity. Saturation happens when the substrate is far ABOVE the constant; a substrate far below it leaves most sites empty most of the time.' },
      { text: 'It tracks the transmitter above 200 micromoles per litre and ignores it at the concentrations below that.',
        why: 'Right that the constant marks the change in behaviour, wrong about which side is which. Below the constant the rate is roughly proportional to substrate; above it the curve is flattening and the enzyme stops noticing.' },
      { text: 'Neither can be said: the Michaelis constant tells you nothing about this unless you also know the enzyme\'s maximum rate.',
        why: 'Refuses a question the constant is for. The maximum rate tells you how fast it can go; the constant against the working concentration tells you whether the rate follows the substrate, and that is a separate question with its own answer.' },
    ],
    explain: 'The rule is one comparison: put the Michaelis constant beside the concentration the enzyme actually meets. Well below it, the enzyme is a reporter and its rate tracks its substrate, rising and falling roughly in proportion to how much is there. Well above it, the enzyme is saturated and works flat out regardless. Hexokinase and glucokinase are the same pair of designs as Section 4.5\'s two glucose carriers, for the same reason, and it is not a coincidence: a carrier and an enzyme are the same kind of machine.',
  },
  {
    id: 'i-km-tuning-3',
    objective: 'km-tuning',
    kind: 'free',
    question: 'Blood glucose is held near 5 millimoles per litre. Hexokinase has a Michaelis constant around 0.1 and glucokinase around 10. Explain what each enzyme\'s rate does as blood glucose rises and falls, and why a liver has the second kind and most cells the first.',
    rubric: [
      'the comparison that matters is the Michaelis constant against the concentration the enzyme normally meets',
      'hexokinase at 0.1 against blood glucose\'s 5 is saturated at all times, so it works flat out whether its owner has eaten or not',
      'that is what you want of a cell that must keep going regardless — it takes its first step on glucose at full rate in a fasting person',
      'glucokinase at 10 is above the blood concentration, so it is never saturated and its rate rises and falls with the blood',
      'so the liver can act on how much sugar has arrived, storing it after a meal and leaving it alone when there is little',
      'this is the same pair of designs, for the same reason, as the two glucose carriers Section 4.5 compared',
      'and it is not a coincidence: a carrier and an enzyme are the same kind of machine, with a site, a cycle and a ceiling',
    ],
    explain: 'A low Michaelis constant is often glossed as "high affinity", which is close enough to be useful and worth hedging: the constant also depends on how fast the enzyme works once bound, so it is a statement about the working concentration range rather than purely about binding.',
  },

  {
    id: 'i-enzyme-conditions-1',
    objective: 'enzyme-conditions',
    kind: 'task',
    figure: 'fig-kinetics',
    goal: 'Open Conditions if the temperature and pH sliders are not already showing, then raise the Temperature slider step by step to 55 °C, watching the Rate now row the whole way up rather than only at the end.',
    question: 'On the way up the rate climbed gently. Somewhere past the enzyme\'s limit it did not bend over — it fell off a cliff, to almost nothing. Two different things are happening on the two sides of that peak. What are they?',
    expect: 'temperatureC === 55 and denatured === true and rate < 1',
    explain: 'The rise is the gentle exponential of molecules clearing a barrier: warmer means more of them out in the tail of the distribution, and the rate roughly doubles per 10 °C. The fall is something else entirely — it is the loss of enzyme, as the protein unfolds and its active site with it. Part of that unfolding is an equilibrium and cooling folds it straight back; the rest is permanent and accumulates with every second spent hot, which is the part Keep the damage leaves behind. So the curve is not a bell, and an enzyme\'s optimum is not a temperature it likes. It is the point at which losing enzyme begins to outrun speeding it.',
  },
  {
    id: 'i-enzyme-conditions-2',
    objective: 'enzyme-conditions',
    kind: 'mcq',
    question: 'A plot of an enzyme\'s rate against temperature rises gently to a peak and then falls very sharply. Why is it not the symmetrical bell it is often drawn as?',
    options: [
      { text: 'Two different processes: a gentle rise as molecules clear the barrier, and a fast fall as the enzyme unfolds.', correct: true },
      { text: 'It is a bell really, with the optimum at its centre; the sharpness of the fall is an artefact of how the axes are drawn.',
        why: 'Keeps the shape and blames the plot. The asymmetry is real and mechanistic, and a reader who smooths it away loses the only thing the curve has to teach: an optimum is a crossing point, not a preference.' },
      { text: 'Past the optimum the substrate is used up faster than it can be replaced, so the rate measured in the tube falls away.',
        why: 'Explains the fall by the substrate rather than by the enzyme. Rates are measured at fixed substrate; and if depletion were the cause, cooling the tube would bring the rate back in full, which after a real denaturation it does not — cooling folds back only the part that was an equilibrium. Figure 5.6 is that test: press Keep the damage, take the temperature past the limit and bring it back, and the ceiling stays down.' },
      { text: 'The optimum is the temperature the enzyme evolved to like, and it works less and less well the further it is taken from it.',
        why: 'The teleological reading, and it is the one most readers carry away from a textbook bell curve. Nothing about an enzyme prefers a temperature; below the optimum it is not unhappy, only slow.' },
    ],
    explain: 'The rise is the exponential of molecules clearing the barrier; the fall is the loss of enzyme, and it is fast. So the optimum is where losing enzyme begins to outrun speeding it. pH does something related but distinct. The side chains lining an active site must carry the right charge for the chemistry to work, and pH decides whether they do; far from the optimum the protein denatures as well. So the optimum sits where the enzyme works: pepsin near pH 2 in the stomach, a lysosome\'s enzymes near pH 5 — which is why Section 4.6\'s proton pump is in a lysosome\'s membrane at all — and most enzymes of the cytosol near neutral.',
  },
  {
    id: 'i-enzyme-conditions-3',
    objective: 'enzyme-conditions',
    kind: 'free',
    question: 'Predict what raising the temperature and changing the pH each do to an enzyme\'s rate. Explain why the temperature curve rises gently and falls sharply, and why a lysosomal enzyme has a different pH optimum from a cytosolic one.',
    rubric: [
      'temperature raises the rate, roughly doubling it per 10 °C, until the enzyme starts to unfold; past that the rate falls off a cliff',
      'the rise is the gentle exponential of molecules clearing a barrier — more of them out in the tail of the distribution',
      'the fall is the loss of enzyme as the protein unfolds, and that loss has two parts running on different clocks',
      'one part is an equilibrium that cooling folds straight back; the other is permanent and accumulates with every second spent hot, so how far the rate has fallen depends on how long it was held there',
      'so the curve is not a bell, and the optimum is not a temperature the enzyme likes: it is the point at which losing enzyme begins to outrun speeding it',
      'pH acts differently: the side chains lining an active site must carry the right charge for the chemistry to work, and pH decides whether they do',
      'far from the optimum the protein denatures as well, so both mechanisms are in play at the extremes',
      'the optimum sits where the enzyme works — pepsin near pH 2 in the stomach, a lysosome\'s enzymes near pH 5, most cytosolic enzymes near neutral',
      'which is why Section 4.6\'s proton pump sits in a lysosome\'s membrane: the compartment\'s pH is part of the enzyme\'s working conditions',
    ],
    explain: 'The lysosomal case is worth holding because it doubles as a safety argument, and Section 5.7 makes it again: an enzyme whose optimum is pH 5 is largely switched off if it leaks into a cytosol at pH 7. Compartmentation is a regulation mechanism as well as an architecture.',
  },

  {
    id: 'i-inhibition-types-1',
    objective: 'inhibition-types',
    kind: 'task',
    figure: 'fig-kinetics',
    goal: 'Press Non-competitive to add that inhibitor, and read the Maximum rate and the Michaelis constant against the uninhibited curve drawn beside it.',
    question: 'The ceiling has come down and the half-way concentration has not moved. Flooding this lane with substrate would not rescue it, and flooding a lane with a competitive inhibitor in it would. Why the difference?',
    expect: 'inhibitor === noncompetitive and apparentKm === 6 and apparentVmax < 200 and relievedBySubstrate === false',
    explain: 'A non-competitive inhibitor binds somewhere other than the active site and changes the enzyme\'s shape, so the site works badly or not at all. Adding substrate does nothing, because the substrate is not what it is competing with: some fraction of the enzyme is simply out of service however much substrate arrives, and that is why the ceiling falls. A competitive inhibitor is in a race for the site, and more substrate wins the race — so its ceiling is unaltered and only the concentration needed to reach half of it goes up.',
  },
  {
    id: 'i-inhibition-types-2',
    objective: 'inhibition-types',
    kind: 'mcq',
    question: 'Why does a competitive inhibitor make the Michaelis constant appear to rise while leaving the maximum rate exactly where it was?',
    options: [
      { text: 'It is a race for the site: half-filling the sites takes more substrate, but enough substrate wins every one of them back.', correct: true },
      { text: 'It binds the enzyme permanently and lowers its affinity for the substrate from then on, without reducing its speed.',
        why: 'Makes a reversible inhibitor an irreversible one. If it bound permanently the enzyme molecules holding it would be out of service, the ceiling would fall, and the pattern would be the one an irreversible inhibitor gives.' },
      { text: 'It lowers the number of working enzyme molecules, and with fewer enzymes at work the Michaelis constant is bound to be higher.',
        why: 'Two errors at once. Removing enzyme lowers the ceiling rather than raising the constant, and the constant is the one quantity that does not depend on how much enzyme is present at all.' },
      { text: 'The ceiling is unchanged because the inhibitor is gradually used up as the reaction proceeds, leaving the enzyme free again.',
        why: 'Explains the right observation by a mechanism that would also predict the inhibition wearing off. A competitive inhibitor is not converted — that is what makes it an inhibitor rather than a substrate — and it is still there at the end.' },
    ],
    explain: 'More substrate is needed to get half the sites filled, so the half-way concentration goes up; but with enough substrate every site ends up a substrate\'s, so the ceiling is untouched. The diagnostic experiment is a single question: add more substrate and see whether it helps. Only an inhibitor competing for the same site can be outcompeted, so a maximum rate that is eventually reached means competitive, and a maximum rate that falls means the inhibitor is not competing with the substrate for anything.',
  },
  {
    id: 'i-inhibition-types-3',
    objective: 'inhibition-types',
    kind: 'free',
    question: 'Distinguish competitive, non-competitive and irreversible inhibition. For each, say where the inhibitor binds, whether more substrate helps, and what happens to the maximum rate and to the Michaelis constant.',
    rubric: [
      'competitive: binds the active site itself, in place of the substrate, because it resembles the substrate closely enough to occupy the site and not closely enough to be converted',
      'more substrate wins the race, so the maximum rate is unchanged and the Michaelis constant appears to rise',
      'non-competitive: binds somewhere else on the enzyme and changes its shape, so the active site works badly or not at all',
      'more substrate does not help, because the substrate is not what it is competing with; the maximum rate falls and the Michaelis constant is unchanged',
      'irreversible: forms a covalent bond, usually in the active site, and that enzyme molecule is finished — the cell recovers only by making more',
      'more substrate cannot help either; the maximum rate falls and the Michaelis constant is unchanged, because the survivors behave normally',
      'the diagnostic experiment for all three is one question: add more substrate and see whether it helps',
      'a non-competitive inhibitor and an allosteric inhibitor are the same mechanism; the only difference is whether the cell meant it',
    ],
    explain: 'The last point is worth carrying into Section 5.7. Nothing about the molecular event distinguishes a poison that binds away from the active site from the cell\'s own end product doing the same thing to the first enzyme of its pathway. The difference is entirely in whether the arrangement is one evolution built.',
  },

  {
    id: 'i-drugs-as-inhibitors-1',
    objective: 'drugs-as-inhibitors',
    kind: 'task',
    figure: 'fig-kinetics',
    goal: 'Open Cases if the named cases are not already showing, load Penicillin, and press Run. Watch the ceiling marker on the graph come down as enzyme molecules are finished off.',
    question: 'This inhibitor is taking enzyme molecules out of the lane permanently, and the ceiling is coming down with them. If the drug were washed out of the culture now, what would the bacterium have to do to get its rate back?',
    expect: 'preset === penicillin and inhibitor === irreversible and enzymesDestroyed >= 1 and relievedBySubstrate === false',
    explain: 'Nothing comes back. An irreversible inhibitor forms a covalent bond and that enzyme molecule is finished, so taking the drug away does not restore what it has already destroyed and no amount of substrate revives a finished enzyme — press No inhibitor afterwards and the ceiling does not go back up. The cell recovers only by making more. Penicillin does this to the enzyme that cross-links the peptidoglycan wall, and Section 3.3 has already drawn the consequence: an established wall is not being cross-linked, so nothing is being inhibited, and only a bacterium that tries to grow builds a defective wall and bursts by the osmosis of Section 4.4.',
  },
  {
    id: 'i-drugs-as-inhibitors-2',
    objective: 'drugs-as-inhibitors',
    kind: 'mcq',
    question: 'Four poisonings arrive in one night. Which one could in principle be relieved by flooding the patient with the enzyme\'s natural substrate?',
    options: [
      { text: 'Methanol: ethanol given in excess takes the enzyme\'s site from it, so the methanol is excreted unchanged.', correct: true },
      { text: 'A nerve agent, which has bonded covalently to the enzyme that clears transmitter from a synapse after a signal.',
        why: 'Asks substrate to undo a covalent bond. Those enzyme molecules are finished, and adding transmitter to a synapse that already cannot clear it would make matters worse rather than better.' },
      { text: 'Aspirin taken in excess, which has acetylated the enzyme that makes prostaglandins in the platelets and elsewhere.',
        why: 'Picks a drug that works by exactly the mechanism substrate cannot touch. One dose affects a platelet for its whole life precisely because the modification is permanent and a platelet cannot make more enzyme.' },
      { text: 'A poison that binds to the enzyme away from its active site and bends it out of shape, so the site works badly.',
        why: 'The non-competitive case, and it is the clearest test of whether the rule has been understood as a rule about competition. The substrate is not competing with this inhibitor for anything, so more of it changes nothing.' },
    ],
    explain: 'Only an inhibitor in the active site can be outcompeted, which makes "does more substrate help" both the laboratory\'s diagnostic and the clinic\'s treatment plan. Ethanol for methanol poisoning is the textbook case and it is genuinely done: ethanol keeps the enzyme occupied that would otherwise take the first step in turning methanol into the formic acid that blinds and kills.',
  },
  {
    id: 'i-drugs-as-inhibitors-3',
    objective: 'drugs-as-inhibitors',
    kind: 'free',
    question: 'An enzyme is the easiest thing in a cell to attack and the most specific target available. Choose two of the drugs or poisons this chapter names, explain how each works as an inhibitor, and say whether more substrate would relieve it.',
    rubric: [
      'a statin is a competitive inhibitor of the enzyme that sets how fast a liver cell makes its own cholesterol, so more substrate would in principle relieve it',
      'and the rest of a statin\'s story is Section 4.8\'s: a liver cell short of cholesterol puts more LDL receptors into its membrane and takes more out of the blood, so the drug lowers blood cholesterol by inhibiting an enzyme that never touches the blood',
      'penicillin is irreversible: it bonds covalently to the enzyme that cross-links the peptidoglycan wall of Section 3.3, and no amount of substrate helps',
      'it kills only growing bacteria, because an established wall is not being cross-linked — a cell that tries to grow builds a defective wall and bursts by the osmosis of Section 4.4',
      'ethanol is a competitive inhibitor used deliberately in methanol poisoning, occupying the enzyme that would turn methanol into formic acid so that the methanol is excreted unchanged',
      'aspirin acetylates the enzyme that makes prostaglandins, irreversibly, which is why one dose affects a platelet for its whole life',
      'the nerve agents bond covalently to the enzyme that clears the transmitter from a synapse, and the victim\'s nerves cannot stop firing',
      'the general rule: only an inhibitor competing for the active site can be outcompeted with more substrate',
    ],
    explain: 'The great majority of drugs and very nearly all poisons are enzyme inhibitors, and the reason is in the question: an enzyme is a small pocket with a shape, present in one pathway and not the others, and hitting it stops one process rather than everything. Two of the eight points above are the same mechanism used in opposite directions — ethanol as an antidote, a statin as a treatment.',
  },

  // ============================================================================
  // 5.7 A pathway that knows when to stop
  // ============================================================================

  {
    id: 'i-allostery-1',
    objective: 'allostery',
    kind: 'task',
    figure: 'fig-feedback',
    goal: 'Push the Add product slider up to 2 millimoles per litre — isoleucine poured in from outside, none of which the pathway made — and watch the First enzyme reading.',
    question: 'The first enzyme has gone from about seven-tenths of full activity to almost nothing, and the molecule that did it binds nowhere near where threonine binds. What has the enzyme been told, and how?',
    expect: 'productAddedMM >= 1.5 and firstEnzymeActivity < 0.2 and loopIntact === true and knockedOut === null',
    explain: 'It has been told that isoleucine is plentiful, by a molecule that is not its business at all. The enzyme has two conformations, one in which the active site is well formed and one in which it is not, and it flickers between them; isoleucine binds preferentially to the inactive shape and shifts the balance. Nothing has been blocked and nothing about threonine has changed. Notice that the product was added rather than made — which is the cleanest demonstration that the signal is the molecule itself and not a measurement of anything.',
  },
  {
    id: 'i-allostery-2',
    objective: 'allostery',
    kind: 'mcq',
    question: 'An allosteric activator and an allosteric inhibitor both bind at a site that is not the active site. What actually distinguishes them?',
    options: [
      { text: 'Which of the enzyme\'s two shapes each prefers to bind: preferring the active shape makes an activator, the inactive one an inhibitor.', correct: true },
      { text: 'An inhibitor ends up blocking the active site, and an activator holds the site open so that the substrate can get in.',
        why: 'Puts the inhibitor back in the active site, which is the one thing allostery is defined as not doing. A molecule that blocked the site would be a competitive inhibitor and would be beaten by more substrate; an allosteric one is not.' },
      { text: 'An activator supplies the energy the reaction needs to go faster, and an inhibitor takes some of that energy away.',
        why: 'Treats regulation as a matter of fuelling. Allosteric molecules do not pay for anything — the reaction\'s own ΔG is unchanged — they change how hard the enzyme works at a reaction that was already going to go.' },
      { text: 'An activator resembles the substrate closely enough to help it bind, and an inhibitor looks nothing like the substrate at all.',
        why: 'Imports the competitive inhibitor\'s defining property. An allosteric ligand usually looks nothing like the substrate, which is the point: it lets a pathway be controlled by a molecule that has no business in the reaction being controlled.' },
    ],
    explain: 'The word means "other shape", and that is the mechanism. The protein flickers between an active and an inactive conformation, and a molecule that binds one of them preferentially shifts the balance towards it. Nothing about the substrate has changed and nothing has been blocked. The enzyme has been told something by a molecule that is not its business, and has changed its mind about how hard to work. Jacques Monod, who set the two-state model out with Wyman and Changeux in 1965, called allostery "the second secret of life" — the first being the genetic code.',
  },
  {
    id: 'i-allostery-3',
    objective: 'allostery',
    kind: 'free',
    question: 'Explain how a molecule binding away from the active site can change what an enzyme does. Distinguish an allosteric activator from an allosteric inhibitor, and say what the difference is between an allosteric inhibitor and a non-competitive one.',
    rubric: [
      'allostery is the control of a protein by something binding at a site that is not the active site; the word means "other shape"',
      'the protein has two conformations, one in which the active site is well formed and one in which it is not, and it flickers between them',
      'a molecule that binds preferentially to one of the two shifts the balance towards it',
      'bind to the inactive shape and you are an allosteric inhibitor; bind to the active shape and you are an allosteric activator',
      'nothing about the substrate has changed and nothing has been blocked — this is not competition for the site',
      'a non-competitive inhibitor works by exactly this mechanism, binding elsewhere and changing the enzyme\'s shape',
      'the only difference between a non-competitive inhibitor and an allosteric one is whether the cell meant it',
    ],
    explain: 'The last point is not a throwaway. It says that regulation did not require any new chemistry: the vulnerability that lets a poison bend an enzyme out of shape is the same property that lets a pathway switch itself off, and evolution has simply put a useful ligand where the poison would have gone.',
  },

  {
    id: 'i-cooperativity-1',
    objective: 'cooperativity',
    kind: 'task',
    figure: 'fig-feedback',
    goal: 'Press One subunit to rebuild the first enzyme with a single subunit instead of four, and read the Steepness figure.',
    question: 'The steepness has fallen from about 4 to about 1, and the curve has stopped being an S. What did the other three subunits do for the enzyme, and what does a cell gain from it?',
    expect: 'subunits === 1 and curveShape === hyperbolic and steepness < 1.1 and halfSaturationMM === 0.6',
    explain: 'With four subunits changing shape together, the first substrate to bind makes the next one easier — cooperativity — and the rate curve is no longer a curve that bends over gently but an S. The practical consequence is worth dwelling on: over a narrow range of concentration an allosteric enzyme goes from almost off to almost fully on, where an ordinary enzyme ramps gradually across a hundredfold range. A cell that wants a decision rather than a dial builds one of these. Notice what the subunit count did not move: the half-saturating concentration is 0.6 either way.',
  },
  {
    id: 'i-cooperativity-2',
    objective: 'cooperativity',
    kind: 'mcq',
    question: 'Haemoglobin is not an enzyme, but it has four subunits that change shape together and an S-shaped binding curve. Why does that shape matter for what it does?',
    options: [
      { text: 'Because an S swings from nearly empty to nearly full over a narrow range, letting a small fall in pressure from lung to muscle unload most of it.', correct: true },
      { text: 'Because four subunits carry four oxygen molecules between them, so each protein delivers four times as much oxygen as one subunit could.',
        why: 'Counts the cargo and misses the mechanism. Four independent binding sites would carry the same four molecules and would give an ordinary bending curve, which is exactly the comparison Figure 5.7 lets you make.' },
      { text: 'Because an S-shaped curve has a higher maximum, so more oxygen is carried at every pressure than a bending curve allows.',
        why: 'Reads the S as a raised ceiling. It is not: the two curves reach the same saturation, and what differs is how sharply the middle of the range is crossed.' },
      { text: 'Because cooperativity lowers the concentration at which it is half saturated, so it binds oxygen more readily everywhere.',
        why: 'Would make haemoglobin worse at its job, and Figure 5.7 shows it is not what happens: the half-saturating concentration does not move with the subunit count. Binding oxygen more readily everywhere would mean holding on to it in the muscle.' },
    ],
    explain: 'That is how haemoglobin can be nearly saturated in the lungs and give up most of its oxygen in a working muscle, over a difference in pressure that would barely move a protein without cooperative subunits. The reason a switch is worth having is that most of what a cell decides is a yes or a no. An ordinary enzyme\'s rate rises gradually across a hundredfold range of substrate, which is useful when you want a dial; a cooperative one crosses from off to on within a factor of two or three, which is what you want when the answer is "now" or "not yet".',
  },
  {
    id: 'i-cooperativity-3',
    objective: 'cooperativity',
    kind: 'free',
    question: 'Explain why an enzyme built from several subunits gives an S-shaped rate curve rather than one that bends over gently. Say what a cell gains from a curve of that shape, and give a case.',
    rubric: [
      'most allosteric enzymes are built from several subunits, and the subunits change shape together',
      'so the first substrate to bind makes the next one easier — that is cooperativity',
      'the result is that the rate curve of Section 5.6 is no longer a hyperbola bending over gently but an S',
      'over a narrow range of concentration the enzyme goes from almost off to almost fully on',
      'an ordinary enzyme would ramp gradually across a hundredfold range of substrate',
      'so a cell that wants a decision rather than a dial builds a cooperative enzyme',
      'haemoglobin is the case: not an enzyme, but the same principle, and it is why blood can be nearly saturated in the lungs and give up most of its oxygen in a working muscle over a small difference in pressure',
      'what cooperativity does not change is the half-saturating concentration: it moves the steepness at the half point and leaves the half point where it was',
    ],
    explain: 'The last point is the one Figure 5.7 is built to let you check, and it is the same discipline as Section 5.5\'s: find the quantity the change does not move, because that is usually where the mechanism is. More enzyme moves the ceiling and not the half-way point; more subunits move the steepness and not the half-way point.',
  },

  {
    id: 'i-feedback-inhibition-1',
    objective: 'feedback-inhibition',
    kind: 'task',
    figure: 'fig-feedback',
    goal: 'Press Break the loop, which mutates the allosteric site so that isoleucine no longer binds there, and keep watching the isoleucine bar and the First enzyme reading.',
    question: 'The first enzyme has gone to full activity and stayed there, and the product is piling up with nothing using it. The mutation is in a site that has nothing to do with the reaction the enzyme catalyses. Why is that enough to make the whole pathway run away?',
    expect: 'loopIntact === false and runaway === true and productMM > 2',
    explain: 'Because the allosteric site was the whole of the control. In feedback inhibition the end product of a pathway is an allosteric inhibitor of the enzyme catalysing the pathway\'s first committed step; when isoleucine is plentiful the pathway stops, and when the cell has used it up the inhibition lifts and the pathway starts again. Nothing counts anything, nothing measures anything, and there is no controller — the product is its own signal. Mutate the site it binds to and the pathway runs regardless of how much isoleucine is present. That is not only a thought experiment: feedback-resistant mutants of exactly this kind are how industrial amino acids are made.',
  },
  {
    id: 'i-feedback-inhibition-2',
    objective: 'feedback-inhibition',
    kind: 'mcq',
    question: 'A bacterium makes isoleucine from threonine in five enzyme-catalysed steps, and the isoleucine inhibits the first of the five. Why the first, and why specifically the first step that commits anything to this pathway?',
    options: [
      { text: 'Stopping the first step wastes nothing on unused intermediates, and the committed one spares pathways that share earlier steps.', correct: true },
      { text: 'The first enzyme is the slowest step in the pathway, so controlling it controls the rate of the whole sequence.',
        why: 'A real principle from the wrong drawer. The committed step is often rate-limiting and that is not why the product acts there; what decides it is waste, and a scheme that throttled the slowest step in the middle would still pile up everything before it.' },
      { text: 'The end product can only reach the first enzyme: the four later ones are buried out of its reach deep within the pathway.',
        why: 'Invents a physical barrier. All five enzymes are in the same cytosol and the isoleucine reaches all of them; what distinguishes the first is that it has an allosteric site shaped to hold isoleucine and the others do not.' },
      { text: 'Inhibiting the last step instead would stop the product forming just as well, so it comes to the same thing.',
        why: 'True about the product and blind to the cost, which is exactly what this design is about. Both schemes stop isoleucine appearing; only one of them avoids spending five reactions\' worth of material and ATP on intermediates nobody will use.' },
    ],
    explain: 'Inhibit the last enzyme and the four intermediates before it pile up, each having cost something to make and each now useless; inhibit the first and nothing at all is spent. "Committed" matters because an earlier step that fed several pathways would starve all of them at once. This is chapter 1\'s negative feedback, exactly, with molecules in place of nerves. The regulated quantity is the isoleucine concentration, the sensor is the allosteric site — which reads that concentration by the simple expedient of being bound some of the time — and the effector is the enzyme\'s own activity. The response opposes the change, which is what makes the loop negative and the state steady.',
  },
  {
    id: 'i-feedback-inhibition-3',
    objective: 'feedback-inhibition',
    kind: 'free',
    question: 'Explain feedback inhibition, using the five steps from threonine to isoleucine. Say why the end product acts on the first committed step rather than on any other, and predict what is seen when the loop is broken.',
    rubric: [
      'the end product of a pathway is an allosteric inhibitor of the enzyme catalysing the pathway\'s first committed step',
      'isoleucine binds the first of the five enzymes, at a site that has nothing to do with threonine, and switches it off',
      'when isoleucine is plentiful the pathway stops; when the cell has used it up the inhibition lifts and the pathway starts again',
      'nothing counts anything and there is no controller: the product is its own signal',
      'why the first: inhibit the last of five and the four intermediates before it pile up, each having cost something and each now useless — inhibit the first and nothing is spent',
      'why committed: the intermediate produced by that step has nowhere else to go, so inhibiting an earlier step that fed several pathways would starve all of them at once',
      'break the loop — mutate the allosteric site so the product no longer binds — and the pathway runs flat out regardless of how much product is present, pouring out an amino acid the cell has no use for',
      'which is Section 1.2\'s opened loop with molecules, and is how industrial amino acids are made: feedback-resistant mutants pouring out lysine at a rate no wild organism would tolerate',
    ],
    explain: 'The industrial case is the honest test of the prediction. If breaking the loop really does what the model says, somebody should be able to make money out of it, and somebody does — the bacteria in those fermenters have had their loops deliberately cut.',
  },

  {
    id: 'i-kinase-switch-1',
    objective: 'kinase-switch',
    kind: 'task',
    figure: 'fig-feedback',
    goal: 'Switch to the Enzyme pane if your screen shows one pane at a time. Press Kinase and wait until the phosphate is on the enzyme; then press Kinase again to switch the kinase off, and leave both enzymes off while you watch how long the switch holds.',
    question: 'The kinase is no longer running and the phosphate has stayed on. The figure counts the seconds it has held. What would it take to get the phosphate off again, and why does a cell need that second enzyme at all?',
    expect: 'phosphorylated === true and atpSpent >= 1 and kinaseOn === false and switchHeldSeconds > 0.5',
    explain: 'It takes a phosphatase, and the reason a cell needs one is that a switch which can only be thrown once is not a switch. A kinase transfers a phosphate group from ATP onto a particular residue of a target protein — the ATP counter went up by one when you threw it — and a phosphatase takes it off again. The phosphate is bulky and carries two negative charges, so attaching one reshapes the protein around it and switches the protein on or off. It is Section 5.4\'s phosphorylation used as a signal rather than as a payment, and it is the commonest switch in biology: the human genome carries the instructions for more than five hundred different protein kinases.',
  },
  {
    id: 'i-kinase-switch-2',
    objective: 'kinase-switch',
    kind: 'mcq',
    question: 'Every phosphorylation switch in a cell needs a phosphatase as well as a kinase. Why?',
    options: [
      { text: 'Without a phosphatase the phosphate stays on, so the switch could be thrown once and then never be reset.', correct: true },
      { text: 'To recover the phosphate group afterwards, which would otherwise be lost to the cell each time the switch was thrown.',
        why: 'Treats the phosphatase as housekeeping. Phosphate is abundant in a cell — about 5 millimoles per litre — and recovering one group is worth nothing; what is worth something is being able to undo the signal.' },
      { text: 'To stop the kinase phosphorylating the same protein over and over again and running down the cell\'s supply of ATP.',
        why: 'Imagines a runaway that cannot happen: a protein already carrying a phosphate on that residue cannot be phosphorylated there again, so the kinase stops of its own accord. The cost is one ATP per switch thrown, not a leak.' },
      { text: 'The phosphate falls off by itself anyway after a while, and the phosphatase is only there to make that happen sooner.',
        why: 'Would make the switch a timer rather than a switch. If the state decayed on its own the cell could not hold a decision, and holding one until something says otherwise is the whole point of a covalent modification.' },
    ],
    explain: 'A switch that can only be thrown once is not a switch, and the phosphate does not come off on its own at any useful rate: without a phosphatase the protein would stay in whichever state it was first put. Covalent modification is the second of the four control mechanisms and works on a timescale of seconds to minutes, against allostery\'s instant. Attaching a bulky group with two negative charges reshapes the protein around it, so the same trick that pays for transport in Section 5.4 here carries information instead.',
  },
  {
    id: 'i-kinase-switch-3',
    objective: 'kinase-switch',
    kind: 'free',
    question: 'Explain how attaching a phosphate group switches a protein on or off. Say where the phosphate comes from, what it does to the protein, what takes it off again, and how this differs from the phosphorylation of Section 5.4.',
    rubric: [
      'a kinase transfers a phosphate group from ATP onto a particular residue of a target protein',
      'a phosphate is bulky and carries two negative charges, so attaching one reshapes the protein around it',
      'the new shape switches the protein on or off, which is a conformational change like allostery\'s but produced by a covalent modification rather than by something binding',
      'a phosphatase takes the phosphate off again, and it is needed as much as the kinase: a switch that can only be thrown once is not a switch',
      'the state holds until the phosphatase acts, so the cell can make a decision and keep it — which is why this control works on seconds to minutes rather than instantly',
      'in Section 5.4 the phosphate was the payment: the phosphorylated pump was the shared intermediate and the transfer was what got the work done',
      'here the phosphate is a signal: the ATP is still spent, one per switch thrown, but what it buys is information rather than transport',
      'it is the commonest switch in biology — the human genome carries the instructions for more than five hundred different protein kinases',
    ],
    explain: 'The sixth and seventh points are the distinction worth being able to make on demand, because the molecular event is identical and only the purpose differs. The same transfer that drags three sodium ions across a membrane in one protein tells another protein to start working, and nothing in the chemistry says which is which.',
  },

  {
    id: 'i-pathway-homeostasis-1',
    objective: 'pathway-homeostasis',
    kind: 'task',
    figure: 'fig-feedback',
    goal: 'Push the Demand slider up to 2.5 millimoles per litre a second — the cell is now consuming isoleucine much faster — and watch the First enzyme reading and the isoleucine bar together.',
    question: 'You did not touch the first enzyme, and it has come back on. Which quantity changed to make that happen, and which two parts of chapter 1\'s feedback loop is this one enzyme playing?',
    expect: 'demand === 2.5 and firstEnzymeActivity > 0.8 and loopIntact === true and runaway === false',
    explain: 'The isoleucine fell, because it is being consumed faster than before, and the inhibition lifted with it — the first enzyme\'s activity tracks the product concentration inversely, and neither you nor anything else had to measure anything. Map it onto Section 1.2 term by term: the regulated quantity is the isoleucine concentration, the sensor is the allosteric site, the effector is the enzyme\'s own activity, and the response opposes the change. That is what makes the loop negative and the state steady.',
  },
  {
    id: 'i-pathway-homeostasis-2',
    objective: 'pathway-homeostasis',
    kind: 'mcq',
    question: 'Section 1.2\'s feedback loop has four parts: a regulated quantity, a sensor, a set point and an effector. In a feedback-inhibited pathway three of them are easy to point at. What plays the set point?',
    options: [
      { text: 'How tightly the allosteric site holds isoleucine: no number is stored, and a tighter site settles the pathway at a lower level.', correct: true },
      { text: 'The concentration of threonine, the starting material, because the supply is what fixes how much isoleucine the pathway can ever make.',
        why: 'Confuses the supply with the target. Raise the threonine and the pathway does not settle at a higher isoleucine; the loop closes at the same place, faster.' },
      { text: 'The first enzyme\'s Michaelis constant for threonine, which decides how strongly the enzyme responds to its substrate.',
        why: 'Picks the enzyme\'s other binding site. The Michaelis constant is about the substrate and decides how the enzyme responds to threonine; the set point is about the product, and the two sites are independent.' },
      { text: 'A gene whose sequence records, as a number the cell reads, the concentration of isoleucine it is aiming at.',
        why: 'Looks for the number somewhere, which is the assumption this objective exists to remove. Evolution does write the set point into the DNA, but as the shape of a binding site rather than as a value anything reads.' },
    ],
    explain: 'The set point is the part of Section 1.2\'s loop with no obvious counterpart, and the answer is elegant: evolution sets a set point by adjusting a binding site. There is no target concentration stored anywhere and nothing compares a measurement against one; the loop settles where the binding strength puts it, which is a thermostat with no dial and no thermometer.',
  },
  {
    id: 'i-pathway-homeostasis-3',
    objective: 'pathway-homeostasis',
    kind: 'free',
    question: 'Map a feedback-inhibited amino acid pathway onto chapter 1\'s homeostatic loop. Identify the regulated quantity, the sensor, the set point and the effector, and say what plays each part.',
    rubric: [
      'the regulated quantity is the concentration of the end product — isoleucine',
      'the sensor is the allosteric site on the first enzyme, which reads that concentration by the simple expedient of being bound some of the time',
      'the effector is the enzyme\'s own activity: the pathway runs slower when the site is occupied',
      'the response opposes the change, which is what makes the loop negative and the resulting state steady rather than static',
      'the set point has no obvious counterpart, and the answer is that there is no number written anywhere',
      'the set point simply is how tightly the allosteric site holds its ligand: an enzyme that binds isoleucine more tightly settles at a lower concentration of it',
      'so evolution sets a set point by adjusting a binding site, not by storing a target value',
      'and what the loop maintains is a steady state, held by continuous flow, rather than an equilibrium — which is Section 5.2\'s distinction in a different costume',
    ],
    explain: 'This is chapter 1\'s slogan cashed out. Section 1.2 described homeostasis with nerves and effectors and a set point, and promised the chemistry would come later; this is the chemistry, and it turns out the most mysterious of the four parts is the strength of a binding site.',
  },

  // ============================================================================
  // 5.8 Metabolism has a shape
  // ============================================================================

  {
    id: 'i-catabolism-anabolism-1',
    objective: 'catabolism-anabolism',
    kind: 'task',
    figure: 'fig-metabolism',
    goal: 'On the map, press Anabolic to follow the route back out from the waist instead of the route down to it, and read the Steps that differ row.',
    question: 'Between the same two compounds, some steps of the two routes are not shared. Why can they not be, and what does that difference make possible that a single reversible route would not?',
    expect: 'direction === anabolic and stepsThatDiffer > 0 and scene === map and fuel === glucose',
    explain: 'A step that runs strongly downhill one way runs strongly uphill the other, and both routes have to be downhill to work, so at least one step of each must differ and use its own enzyme. That is not an inefficiency but the thing that makes separate control possible: because the two routes have different enzymes at their committed steps, a cell can switch one off without switching the other on, and a signal can be pointed at breakdown or at synthesis rather than at both.',
  },
  {
    id: 'i-catabolism-anabolism-2',
    objective: 'catabolism-anabolism',
    kind: 'mcq',
    question: 'Between the same two compounds, a cell\'s breakdown route and its building route are never simply each other reversed. What is the reason?',
    options: [
      { text: 'Both routes must run downhill, and a strongly downhill step is strongly uphill in reverse, so some steps must differ.', correct: true },
      { text: 'Enzymes work in one direction only, so the reverse of every step has to be catalysed by a separate enzyme of its own.',
        why: 'The most tempting answer and it contradicts Section 5.5 flatly. An enzyme speeds both directions by the same factor and has no preferred one. What differs between the two routes is which reactions they use, not which way their enzymes will go.' },
      { text: 'Running both routes through the same steps at the same time would waste ATP, so the cell keeps them apart.',
        why: 'Names a real hazard — a futile cycle — and offers it as the cause rather than as a thing the arrangement has to manage. Separate enzymes are what create the risk of a futile cycle, not what avoid it; what avoids it is regulating the two committed steps oppositely.' },
      { text: 'The anabolic route is in fact the catabolic one run backwards, only more slowly because it is going uphill all the way.',
        why: 'Denies the premise, and the prediction it makes is testable and false: if it were true, an inhibitor of a catabolic enzyme would block synthesis too, and for the steps that differ it does not.' },
    ],
    explain: 'At least one step of each route must differ from the other and use its own enzyme, because a route with an uphill step in it does not run. Catabolism takes large molecules apart, releases free energy, and is where ATP is made; anabolism builds large molecules from small ones, requires free energy, and is where ATP is spent. Section 2.6\'s two reactions are the chemistry of the distinction — hydrolysis is catabolic and condensation anabolic — and its rule that joining n monomers releases n − 1 waters is an anabolic ledger.',
  },
  {
    id: 'i-catabolism-anabolism-3',
    objective: 'catabolism-anabolism',
    kind: 'free',
    question: 'Distinguish catabolism from anabolism by the sign of ΔG and by what each does to ATP. Then explain why the two routes between the same compounds are never simply each other reversed, and what a cell gains from that.',
    rubric: [
      'catabolism takes large molecules apart, releases free energy — ΔG negative overall — and is where ATP is made; digestion and respiration are catabolic',
      'anabolism builds large molecules from small ones, requires free energy overall, and is where ATP is spent, along with reduced electron carriers',
      'Section 2.6\'s chemistry is the distinction: hydrolysis is catabolic and condensation anabolic',
      'a step that runs strongly downhill one way runs strongly uphill the other, and both routes have to be downhill to work',
      'so at least one step of each route must differ from the other and use its own enzyme',
      'that is not an inefficiency: because the two routes have different enzymes at their committed steps, a cell can switch one off without switching the other on',
      'so a signal can be pointed at breakdown or at synthesis rather than at both, which a single reversible route could never allow',
    ],
    explain: 'It is worth noticing what this argument does not rest on. It says nothing about enzymes being one-way — they are not — and everything about free energy. Two routes made of the same reactions could not both be downhill, and a route that is not downhill does not run.',
  },

  {
    id: 'i-redox-basics-1',
    objective: 'redox-basics',
    kind: 'task',
    figure: 'fig-metabolism',
    goal: 'Press Electrons to open the ladder, leave the carrier on NAD⁺, and press Load a pair to take two electrons off the fuel onto it.',
    question: 'The carrier has become NADH and the fuel has lost a pair of electrons. Which of the two has been oxidised and which reduced, and why can neither have happened without the other?',
    expect: 'scene === electrons and carrier === nad and carrierLoaded >= 1',
    explain: 'The fuel was oxidised, because oxidation is the loss of electrons; NAD<sup>+</sup> was reduced, because reduction is the gain of them. They never happen apart, since electrons lost by one thing are gained by another, and the pair is one event called a redox reaction. Notice where the carrier sits on the ladder: above oxygen and below the fuel\'s carbons, which is why it can take electrons from the one and pass them to the other.',
  },
  {
    id: 'i-redox-basics-2',
    objective: 'redox-basics',
    kind: 'mcq',
    question: 'In the liver, lactate arriving from a working muscle loses two hydrogen atoms and NAD<sup>+</sup> becomes NADH. What has been oxidised and what reduced?',
    options: [
      { text: 'Lactate has been oxidised, losing electrons with its hydrogen, and NAD<sup>+</sup> reduced by gaining them.', correct: true },
      { text: 'Lactate has been reduced, since it has lost something, and a reduction is a loss; the NAD<sup>+</sup> has been oxidised.',
        why: 'Takes the word at face value, which is exactly what it does not deserve. "Reduction" refers to the loss of mass when a metal ore is smelted, not to anything being reduced in the ordinary sense, and it means the GAIN of electrons.' },
      { text: 'Both have been oxidised: hydrogen has left the lactate, and hydrogen is also what the NADH has taken on.',
        why: 'Would make a redox reaction possible without anything being reduced, which the definition forbids: electrons lost by one thing are gained by another, and the two halves of the event are inseparable.' },
      { text: 'Neither, since no oxygen takes part in this reaction and oxidation means reacting with oxygen.',
        why: 'Reads "oxidation" as "reaction with oxygen", which is where the name came from and is not what it means. Oxidation is the loss of electrons, whoever takes them, and most oxidations in a cell hand them to a carrier rather than to oxygen.' },
    ],
    explain: 'In biology the electrons usually travel as part of hydrogen atoms — an electron and a proton together — so a molecule that loses hydrogen has been oxidised and one that gains hydrogen has been reduced. That is a useful rule of thumb for reading any equation in the next two chapters, where almost every step is written that way. The step in the question is one a working muscle runs the other way, turning pyruvate into lactate to get its NAD<sup>+</sup> back; the liver takes the lactate and reverses it.',
  },
  {
    id: 'i-redox-basics-3',
    objective: 'redox-basics',
    kind: 'free',
    question: 'Define oxidation and reduction, and explain why the two never happen apart. Then say how to spot each in an equation written with hydrogen atoms rather than with electrons, and why the word "reduction" is unhelpful.',
    rubric: [
      'oxidation is the loss of electrons by a molecule, atom or ion; reduction is the gain of them',
      'they never happen apart, since electrons lost by one thing are gained by another: the pair is one event, a redox reaction',
      'so whatever is oxidised has reduced something else, and naming only one half of the event is always incomplete',
      'in biology the electrons usually travel as part of hydrogen atoms — an electron and a proton together',
      'so a molecule that loses hydrogen has been oxidised, and one that gains hydrogen has been reduced',
      'the word "reduction" is unhelpful because it refers to the loss of mass when a metal ore is smelted, not to anything being reduced in the ordinary sense',
      'and "oxidation" is unhelpful in the same way: it names oxygen, which is the commonest final destination for the electrons but is not required for an oxidation at all',
    ],
    explain: 'Both names are historical accidents that have outlived their explanations, and the cost is real: readers who reason from the words rather than from the definitions get the direction backwards about half the time. The hydrogen rule of thumb is the practical fix, and it works for almost every equation in the next two chapters.',
  },

  {
    id: 'i-why-electrons-fall-1',
    objective: 'why-electrons-fall',
    kind: 'mcq',
    question: 'Why does moving an electron from a carbon–hydrogen bond onto oxygen release energy?',
    options: [
      { text: 'Oxygen holds shared electrons much more tightly than carbon or hydrogen do, and the energy released is the difference.', correct: true },
      { text: 'Oxygen is a gas, and reactions that take a gas out of the air and lock it into a compound release energy.',
        why: 'Attaches the energy to a state of matter. Oxygen dissolved in water does the same job and releases the same amount; what matters is how hard the atom pulls on electrons, which Section 2.2 ranked and which has nothing to do with being a gas.' },
      { text: 'The electron speeds up as it falls towards the oxygen, and the kinetic energy it picks up on the way is what is released.',
        why: 'Takes "falls" literally. It is a metaphor for moving to a more stable place; nothing is accelerating through space, and the energy comes out as the new arrangement is more stable than the old one.' },
      { text: 'Oxygen breaks the bonds holding the fuel together, and breaking those bonds is what releases the energy.',
        why: 'Section 5.3\'s misconception in a new setting, which is why it is worth meeting twice. Breaking bonds costs; what pays here is the bonds that form, to an atom that holds the electrons much more tightly than the old one did.' },
    ],
    explain: 'Section 2.2 ranked the elements by how hard they pull on shared electrons, with oxygen pulling hardest of all the common ones and carbon and hydrogen well down the list. Letting an electron move from the one to the other is letting it fall towards the atom that wants it most, and the energy released is the difference. That is the entire reason a fuel is a fuel.',
  },
  {
    id: 'i-why-electrons-fall-2',
    objective: 'why-electrons-fall',
    kind: 'mcq',
    question: 'Ethanol and acetic acid have the same two carbons. In ethanol one carbon carries three hydrogens and the other two hydrogens and an oxygen; in acetic acid one carbon carries three hydrogens and the other carries two oxygens. Which yields more energy per carbon when burnt, and why?',
    options: [
      { text: 'Ethanol, because more of its carbons\' bonds are to hydrogen, so its electrons have further to fall.', correct: true },
      { text: 'Acetic acid: it already contains more oxygen, and oxygen is what supplies the energy when a fuel burns.',
        why: 'Treats oxygen as a fuel rather than as a destination. Oxygen already bonded to a carbon is energy already released; a molecule that arrives with more of it has less left to give, not more.' },
      { text: 'They yield the same, since both end as carbon dioxide and water, and it is the products that decide the energy.',
        why: 'Correctly notes that both end in the same place and forgets that free energy is a difference between two places. Same destination, different starting heights, different fall.' },
      { text: 'Acetic acid, because it is an acid, and acids are more reactive than alcohols and give up more energy.',
        why: 'Reasons from a label rather than from the bonds. Reactivity is about the barrier and about what an acid does to a proton; neither has anything to say about how much energy a full oxidation releases.' },
    ],
    explain: 'This is the ethanol-and-vinegar version of the chapter\'s fat-against-carbohydrate comparison. A fat yields about 37 kilojoules a gram against a carbohydrate\'s 17 because a fat\'s carbons are bonded almost entirely to hydrogen and have the whole fall ahead of them, while many of a sugar\'s carbons are already bonded to oxygen and are partway down. Counting how much oxygen a fuel arrives with is a rough but reliable way to rank fuels.',
  },
  {
    id: 'i-why-electrons-fall-3',
    objective: 'why-electrons-fall',
    kind: 'free',
    question: 'Explain from electronegativity why moving electrons towards oxygen releases energy. Then use the same idea to say why a fat yields about 37 kilojoules a gram and a carbohydrate about 17.',
    rubric: [
      'Section 2.2 ranked the elements by how hard they pull on shared electrons: oxygen pulls hardest of the common ones, and carbon and hydrogen are well down the list',
      'an electron shared between carbon and hydrogen is held loosely; the same electron on oxygen is held tightly',
      'letting it move from the one to the other is letting it fall towards the atom that wants it most, and the energy released is the difference',
      'that is the entire reason a fuel is a fuel: a fuel is a molecule whose electrons are a long way from oxygen',
      'a fat\'s carbons are bonded almost entirely to hydrogen, so they have the whole fall ahead of them',
      'many of a sugar\'s carbons are already bonded to oxygen and are partway down, so less is left to release',
      'hence about 37 kilojoules a gram against about 17 — the <i>further to fall</i> that Section 2.6 named before it could explain',
    ],
    explain: 'The rule of thumb that falls out of this is worth having: the more oxygen a fuel arrives with, the less it has left to give. It ranks fats above sugars, sugars above organic acids, and explains why a molecule that is already mostly carbon dioxide is worth nothing at all.',
  },

  {
    id: 'i-electron-carriers-1',
    objective: 'electron-carriers',
    kind: 'task',
    figure: 'fig-metabolism',
    goal: 'Press Electrons and read the Captured fraction: the ladder opens on One drop, the whole fall released at once. Then press In stages to take the same fall in parcels the size of one ATP, read the Captured fraction again, and check that the whole fall has not changed.',
    question: 'The same 220 kilojoules per mole, dropped two different ways, and the captured fraction more than doubles. Nothing about the electrons or the destination changed. What did?',
    expect: 'scene === electrons and dropMode === stepwise and capturedFraction > 0.5 and fallKj > 219 and fallKj < 221',
    explain: 'What changed is how many coupled steps the fall was divided into. One coupled step can pay for one ATP, so dropping the whole 220 at once captures at most one ATP\'s worth — about 50 — and the other 170 leaves as heat, a captured fraction of 0.23. Taking the same fall in parcels comparable with what one ATP is worth lets each parcel pay for one, and the fraction rises to about 0.57. That is why metabolism is long: the length is not evolutionary clutter, it is the mechanism.',
  },
  {
    id: 'i-electron-carriers-2',
    objective: 'electron-carriers',
    kind: 'mcq',
    question: 'A cell holds very little NAD<sup>+</sup> and recycles it constantly. What happens when every carrier in the pool is loaded and nothing is unloading them?',
    options: [
      { text: 'Oxidation stops, because with no empty carrier to take electrons, catabolism halts until the NADH is spent.', correct: true },
      { text: 'The cell makes more NAD<sup>+</sup> to meet the demand, so the fuel can go on being oxidised as before.',
        why: 'Solves the problem by enlarging the pool, which is not what a cell does. The pool is small and stays small — that is what "a cell holds very little of it and recycles it constantly" means — and the answer to a full pool is always to spend the loaded carriers, never to make more of them.' },
      { text: 'The NADH accumulates as a store of energy, to be drawn on later, which is what a carrier is there for.',
        why: 'Reads a carrier as a store, the same error Section 5.3 corrected about ATP. A carrier is neither a fuel nor a store: a cell holds very little of it and recycles it constantly, exactly as it does ATP.' },
      { text: 'The electrons pass straight from the fuel to oxygen without a carrier, so nothing stops.',
        why: 'Removes the constraint by removing the carrier. The point of handing electrons to a carrier is that the reaction that strips them and the reaction that spends them happen in different places and at different times; without a carrier there is no route from the one to the other.' },
    ],
    explain: 'That constraint decides a good deal of what happens in the next two chapters. A cell whose carriers are all loaded cannot oxidise anything further, which is why fermentation exists at all: it is a way of unloading NADH when the usual route to oxygen is unavailable, and it makes no ATP of its own.',
  },
  {
    id: 'i-electron-carriers-3',
    objective: 'electron-carriers',
    kind: 'free',
    question: 'Explain what NAD<sup>+</sup> and FAD do between one reaction and another. Then explain why taking a fuel apart in two dozen small steps captures more of its energy than burning it in one, using the numbers this chapter gives.',
    rubric: [
      'an electron carrier picks up electrons from one reaction and delivers them to another, then goes back for more',
      'NAD<sup>+</sup> is the principal one of catabolism — two nucleotides joined tail to tail — and accepts two electrons and a proton to become NADH',
      'FAD is the other common one, built round riboflavin, vitamin B<sub>2</sub>, and takes two of each to become FADH<sub>2</sub>',
      'a carrier is neither a fuel nor a store: a cell holds very little of each and recycles it constantly, exactly as it does ATP',
      'a cell whose carriers are all loaded cannot oxidise anything further until something unloads them',
      'burning glucose releases ΔG°′ = −2,870 kilojoules per mole in one go, as heat, and Section 5.1 explains why a cell could not use a joule of it',
      'a cell instead takes glucose apart in some two dozen enzyme-catalysed steps, arranged so that the steps releasing a useful amount release a parcel comparable with the 50 kilojoules one ATP is worth, and can be coupled to making one',
      'letting the two electrons on one NADH fall the whole way to oxygen releases about 220 kilojoules per mole — more than four ATP\'s worth in a single drop, which is precisely why no cell drops them in one go',
      'release 2,870 at once and none of it is caught; release it in parcels of thirty or fifty and most of it can be, which is why metabolism is long',
    ],
    explain: 'The 220 against 50 is the arithmetic worth remembering, because it is the whole argument in one line: 220 divided by 50 is about 4.4, so one NADH dropped in a single coupled step wastes more than three ATP\'s worth. What takes that fall in stages is chapter 7\'s subject.',
  },

  {
    id: 'i-pathway-blocked-1',
    objective: 'pathway-blocked',
    kind: 'task',
    figure: 'fig-metabolism',
    goal: 'On the map, move the Knock out slider to the second enzyme on the route from glucose. Read the Piling up row and the Drained away row.',
    question: 'One compound is climbing and three have disappeared, and the gap in the route is between them. Which side of a missing enzyme accumulates, and why is the answer to that the same reasoning Section 3.4 used on the secretory route?',
    expect: 'accumulating === "Glucose 6-phosphate" and drainedAway.length >= 3 and scene === map',
    explain: 'The intermediate immediately before the missing enzyme accumulates, because it is still being made and is no longer being consumed; everything after it disappears, because nothing is making it any more. Both facts are diagnostic, and both are the pulse-chase reasoning of Section 3.4 with a small molecule in place of a cargo protein: block one step of a route and the traffic piles up on the upstream side of the block. Here glucose 6-phosphate climbs and pyruvate, acetyl-CoA and citrate drain away.',
  },
  {
    id: 'i-pathway-blocked-2',
    objective: 'pathway-blocked',
    kind: 'mcq',
    question: 'In galactosaemia the enzyme that converts galactose 1-phosphate to glucose 1-phosphate is missing. What would you expect to find in the patient, and what treatment does the shape of the pathway suggest?',
    options: [
      { text: 'Galactose 1-phosphate piles up and glucose 1-phosphate from this route drains away; the treatment is a diet low in galactose.', correct: true },
      { text: 'Glucose 1-phosphate accumulates: the reaction cannot go forward, so its product builds up behind the block.',
        why: 'Has the sides the wrong way round, which is the commonest slip in this reasoning. What piles up is what is still being made and no longer being consumed, and that is always the compound before the gap.' },
      { text: 'Everything on both sides of the missing step accumulates, since the whole pathway has stopped moving.',
        why: 'Treats a block as a freeze. The compounds after the gap are still being consumed by whatever uses them and are no longer being replaced, so they drain away — which is the half of the observation that says which step is missing.' },
      { text: 'The cell detects the missing enzyme and makes more of it, so nothing changes until the capacity to do so is exhausted.',
        why: 'Assumes the fault is a shortage. In an inherited metabolic disease the gene is faulty, so making more of it produces more faulty enzyme; there is nothing to compensate with.' },
    ],
    explain: 'Galactose is the substrate feeding the block, so cutting it out of the diet stops the pile-up at its source. That is what most inherited metabolic diseases are, read straight off the shape of a pathway. In phenylketonuria the enzyme converting phenylalanine to tyrosine is missing, phenylalanine accumulates to concentrations that damage a developing brain, and the treatment is a diet low in the substrate — which is why every newborn in most countries is tested for it.',
  },
  {
    id: 'i-pathway-blocked-3',
    objective: 'pathway-blocked',
    kind: 'free',
    question: 'One enzyme of a linear pathway is missing. Say what happens on each side of the gap and why, and explain how a doctor reads an inherited metabolic disease the same way. Give an example.',
    rubric: [
      'the intermediate immediately before the missing enzyme accumulates, because it is still being made and is no longer being consumed',
      'everything after it disappears, because nothing is producing it any more and whatever uses it goes on using it',
      'both facts are diagnostic: together they say which step is missing, and either alone would leave several candidates',
      'this is the reasoning Section 3.4 used on the secretory route, where blocking one step stranded the cargo in a different compartment each time — here the cargo is a small molecule',
      'phenylketonuria: the enzyme converting phenylalanine to tyrosine is missing, so phenylalanine accumulates to concentrations that damage a developing brain',
      'the treatment follows from the shape of the pathway: a diet low in the substrate',
      'and because the reading is so direct, every newborn in most countries is tested for it',
    ],
    explain: 'The fourth point is the one worth carrying across chapters. A route through compartments and a route through a pathway behave the same way when you break a step, because both are sequences in which the product of one stage is the input of the next — and the same experiment identifies the broken stage in each.',
  },

  {
    id: 'i-diagnose-reaction-1',
    objective: 'diagnose-reaction',
    kind: 'task',
    figure: 'fig-free-energy',
    goal: 'Press Run and let the mixture drift until the verdict reads equilibrium. Then keep watching the two crossing counters, forward and back.',
    question: 'ΔG has reached zero and the concentrations have stopped changing, and both counters are still climbing. Which of the chapter\'s four cases is this, and what one observation would distinguish it from a reaction that is merely slow?',
    expect: 'atEquilibrium === true and crossingsForward > 40 and crossingsBack > 20',
    explain: 'This is equilibrium: ΔG zero, both directions running equally fast, nothing further changing. What distinguishes it from a reaction waiting on an enzyme is that a slow reaction has not got here — its concentrations are nowhere near their equilibrium ratio and adding a catalyst would move them, where adding a catalyst here changes nothing but the speed at which the ratio is maintained. The counters are the honest part of the display: equilibrium is a balance of two flows, not a stop, which is the same point Section 4.3 made about a membrane.',
  },
  {
    id: 'i-diagnose-reaction-2',
    objective: 'diagnose-reaction',
    kind: 'mcq',
    question: 'In a cell extract, compound A turns into B only while ATP is present, and a phosphorylated form of A can be detected while the reaction runs. Which of the chapter\'s four cases is this?',
    options: [
      { text: 'It runs only because it is coupled, and the phosphorylated A is the intermediate the two reactions share.', correct: true },
      { text: 'It is exergonic and waiting on an enzyme, and the ATP is what switches that enzyme on so the reaction can go.',
        why: 'Reaches for Section 5.7\'s kinase switch, which is a real mechanism and predicts something different: an activated enzyme would go on working after the ATP was used up, and this reaction stops.' },
      { text: 'It runs by itself, and the ATP requirement is only a coincidence of the way the cell extract was prepared.',
        why: 'Discards the one observation that decides the case. A reaction that ran by itself would not stop when the ATP did, and the phosphorylated intermediate would have nothing to be.' },
      { text: 'It has reached equilibrium, and that is why it comes to a stop as soon as the ATP in the extract runs out.',
        why: 'Explains a stop by the wrong stop. At equilibrium the two directions are still running and the concentrations would have settled at a fixed ratio; here the reaction halts wherever it happens to be when the ATP goes.' },
    ],
    explain: 'The detectable phosphorylated intermediate is the whole of the evidence, and it is what Section 5.4 says to look for: coupling means a shared chemical intermediate, so if two reactions are coupled there is a molecule that is the product of one and the reactant of the other, and often it can be caught. Without it, ATP being consumed alongside a reaction proves nothing — in an uncoupled tube exactly that happens and the job does not get done.',
  },
  {
    id: 'i-diagnose-reaction-3',
    objective: 'diagnose-reaction',
    kind: 'free',
    question: 'Four things a reaction can be doing: running by itself, running only because it is coupled, exergonic but waiting on an enzyme, or at equilibrium. State what is true of ΔG in each case, and give one observation that would tell each apart from the others.',
    rubric: [
      'runs by itself: ΔG is negative under the actual conditions and nothing is being spent — a red cell swelling in pure water is an example, and the gradient was paid for elsewhere',
      'runs only because it is coupled: the reaction\'s own ΔG is positive, and it goes because a shared chemical intermediate joins it to one whose ΔG is more negative, so the sum is negative',
      'the observation that identifies coupling is the shared intermediate — a phosphorylated form of the substrate or of the enzyme, detectable while the reaction runs',
      'exergonic but waiting on an enzyme: ΔG is negative, often strongly, and the reaction is slow because of the activation energy — sugar in a bowl, or hydrogen peroxide before it meets catalase',
      'the observation that identifies it is that adding a catalyst speeds it up enormously without changing the products or how much energy is released',
      'at equilibrium: ΔG is zero, the concentrations have stopped changing, and both directions are running at equal rates',
      'the observation that identifies equilibrium is that labelled molecules show both conversions still happening, and that adding more enzyme changes how fast the ratio is reached and not what the ratio is',
      'the confusion to guard against is reading a slow reaction as an unfavourable one, which is the commonest error in the chapter',
    ],
    explain: 'The four cases are the chapter compressed, and the diagnostic in each is a different one. Is anything being spent? Is there an intermediate? Does a catalyst change it? Are both directions still running? Those four questions, asked of any observation, place it.',
  },
];
