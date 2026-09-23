// The one table of the structures chapter 3 draws that `ORGANELLES` in src/palette.js does not name:
// the plant cell's wall, vacuole and chloroplast, the cytoskeleton's three filaments and its motors, and
// the prokaryote's envelope, DNA and appendages. Every colour is `mix()` of two palette colours, never a
// hex of its own, so a change to the palette moves these with it. test/organelle-table.test.js fails a
// literal hex here, a second structure table anywhere under src/figures/, and an id that `ORGANELLES`
// already colours, so a chapter cannot give a structure the book has coloured a second colour.
//
// Same shape as an `ORGANELLES` entry, { id, name, color, symbolColor, role }, so labels and click cards
// read from one place. `organelle(id)` and `colourOf(id)` look up both tables. The ids are the ones the
// chapter brief lists (biology/ch03-cells/FIGURES.md, "Palette additions this chapter needs") plus the
// prokaryote's own layers (peptidoglycan, wallLine, lps, sLayer, flagellarMotor).
//
// `symbolColor` is the colour a symbol written ON the fill takes — the one of `LIGHT.paper` and
// `LIGHT.ink` that holds WCAG AA (4.5:1) against it — and it is the COLOUR, never the name of a palette
// token. That spelling is what makes the theme mistake unmakeable: a token name over a fill that does not
// move with the theme reads right on one paper and inverts on the other, which is the shape of every one
// of the ten defects the 2026-09-16 legibility census found. `ctx.palette[o.symbolColor]` is undefined by
// construction, and test/organelle-table.test.js fails a token name anywhere in this table.
//
// `symbolColor: null` means NEITHER neutral clears 4.5:1 on that fill, so a symbol written there needs
// its own ground — the halo `scale` and `tree` use — or the fill has to move. Three are null here,
// measured: chloroplast (paper 3.83, ink 4.23), microtubule (4.00, 4.05) and intermediateFilament
// (4.04, 4.01). Nothing writes on any of the three today. The test goes red on a null where a neutral
// would have worked and red on a stated colour that does not clear, so the null cannot be laziness.
//
// Two workers built this chapter's figures in parallel and each kept a table of its own; this file is
// the two folded into one, every recipe kept as it was. The pair disagreed twice, and both
// disagreements are still visible here rather than settled in silence. The bacterial wall
// (`peptidoglycan`, #dac37f) and the cellulose wall (`wall`, #e2cc8f) are both named "Cell wall" and
// differ by a few steps of straw; giving them one colour recolours one figure, which is the author's
// call and not a merge's. The flagellar motor (`flagellarMotor`, gold towards coral) is a rotary engine
// in the membrane and not the motor protein (`motor`, violet) that walks a filament, so those two stay
// apart. The prokaryote figure's hit-test ids and its describe().selected say `wall` and `motor`, so it
// reads through CELL_COLOUR, CELL_COLOURS and partInfo at the end of this file, which map its two names
// onto the ids here and change nothing else.
//
// Derived from LIGHT, as `ORGANELLES` is: those colours are single hexes used in both themes, and a
// second, theme-dependent table would make the wall a different colour on a dark page from the one on a
// light page. The values these recipes produce, for the record:
//   wall #e2cc8f · middleLamella #de9e6a · vacuole #7298c4 · tonoplast #597290 · chloroplast #498c48
//   thylakoid #3a6437 · plasmodesma #dd7650 · microtubule #5a8184 · actin #b2755b
//   intermediateFilament #827682 · motor #5f478b · peptidoglycan #dac37f · wallLine #816920
//   lps #daa45d · sLayer #84ab8c · capsule #a2bebb · nucleoid #5d4587 · plasmid #a592b8
//   pilus #4d6261 · flagellum #255c65 · flagellarMotor #cf8a30
import { ORGANELLE_BY_ID, LIGHT, mix } from '../../palette.js';

const O = ORGANELLE_BY_ID;
const L = LIGHT;

const chloroplast = mix(L.leaf, O.peroxisome.color, 0.35);
const wall = mix(L.gold, O.cytoplasm.color, 0.6);
const vacuole = mix(O.smoothER.color, O.chromatin.color, 0.45);

export const EXTRA_ORGANELLES = Object.freeze([
  // ----- the plant cell (plantcell3d, symbiont) -----
  {
    id: 'wall',
    name: 'Cell wall',
    color: wall,
    symbolColor: L.ink,
    role: 'Cellulose microfibrils in a sugar matrix, laid down outside the membrane. It resists turgor pressure and holds the plant up.',
  },
  {
    id: 'middleLamella',
    name: 'Middle lamella',
    color: mix(wall, L.coral, 0.45),
    symbolColor: L.ink,
    role: 'A layer of pectin glueing one cell wall to the next — the same substance that sets jam.',
  },
  {
    id: 'vacuole',
    name: 'Central vacuole',
    color: vacuole,
    symbolColor: L.ink,
    role: 'One large store of water and solutes. It fills the cell cheaply, generates turgor, and does a lysosome’s digesting.',
  },
  {
    id: 'tonoplast',
    name: 'Tonoplast',
    color: mix(vacuole, L.ink, 0.3),
    symbolColor: L.paper,
    role: 'The vacuole’s own membrane, with the pumps that drive solutes in and water after them.',
  },
  {
    id: 'chloroplast',
    name: 'Chloroplast',
    color: chloroplast,
    symbolColor: null,
    role: 'Captures light and builds sugar from carbon dioxide. It has two membranes, its own circular DNA and bacterial ribosomes.',
  },
  {
    id: 'thylakoid',
    name: 'Thylakoid',
    color: mix(chloroplast, L.ink, 0.35),
    symbolColor: L.paper,
    role: 'Flattened discs stacked into grana, holding the chlorophyll and the machinery that captures light.',
  },
  {
    id: 'plasmodesma',
    name: 'Plasmodesma',
    color: mix(O.membrane.color, L.coral, 0.75),
    symbolColor: L.ink,
    role: 'A channel through the wall lined with plasma membrane, joining the cytoplasm of one cell to the next.',
  },
  // ----- the cytoskeleton (cytoskeleton, cilium) -----
  {
    id: 'microtubule',
    name: 'Microtubule',
    color: mix(O.cytoskeleton.color, L.water, 0.5),
    symbolColor: null,
    role: 'A hollow tube 25 nm across, built from thirteen rows of tubulin. It resists compression and carries motor traffic.',
  },
  {
    id: 'actin',
    name: 'Actin filament',
    color: mix(O.cytoskeleton.color, L.coral, 0.5),
    symbolColor: L.ink,
    role: 'Two twisted strands of actin, 7 nm across. It bears tension, and myosin walks along it.',
  },
  {
    id: 'intermediateFilament',
    name: 'Intermediate filament',
    color: mix(O.cytoskeleton.color, L.violet, 0.25),
    symbolColor: null,
    role: 'A rope of coiled proteins 8–12 nm across. It bears tension and has no polarity, so no motor walks on it.',
  },
  {
    id: 'motor',
    name: 'Motor protein',
    color: mix(L.violet, L.ink, 0.15),
    symbolColor: L.paper,
    role: 'Turns the energy in ATP into steps along a filament, always in one direction.',
  },
  // ----- the prokaryote (prokaryote) -----
  {
    // Peptidoglycan: a straw the gold token carries into the paper, so a wall reads as a fibrous,
    // structural layer rather than as another organelle.
    id: 'peptidoglycan',
    name: 'Cell wall',
    color: mix(L.gold, L.paper3, 0.5),
    symbolColor: L.ink,
    role: 'A mesh of sugar chains outside the membrane that holds the cell\'s shape and takes the pressure of the water flooding in.',
  },
  {
    // The dye-holding mesh drawn as a line rather than a fill: the wall pushed back towards the ink.
    id: 'wallLine',
    name: 'Wall mesh',
    color: mix(L.gold, L.ink, 0.42),
    symbolColor: L.paper,
    role: 'The cross-linked strands of the wall.',
  },
  {
    // Lipopolysaccharide, the sugar coat on a gram-negative outer membrane: the membrane's own salmon
    // carried towards gold, because it is a sugar on a membrane.
    id: 'lps',
    name: 'Lipopolysaccharide',
    color: mix(O.membrane.color, L.gold, 0.45),
    symbolColor: L.ink,
    role: 'Sugar chains on the outer face of a gram-negative outer membrane; a barrier to drugs, and what your immune system reads as danger.',
  },
  {
    // The archaeal S-layer: a protein lattice, so the leaf token taken well into the paper.
    id: 'sLayer',
    name: 'S-layer',
    color: mix(L.leaf, L.paper3, 0.45),
    symbolColor: L.ink,
    role: 'A lattice of interlocking protein subunits that many archaea wear instead of a wall.',
  },
  {
    // A loose polysaccharide slime, drawn translucent: the water token taken far into the paper.
    id: 'capsule',
    name: 'Capsule',
    color: mix(L.water, L.paper3, 0.62),
    symbolColor: L.ink,
    role: 'A slippery polysaccharide coat that helps a cell stick to surfaces and makes it hard for an immune cell to grip.',
  },
  {
    // Bacterial DNA stays in the violet family the book uses for information, one step deeper than
    // `chromatin` so a nucleoid does not read as a nucleus.
    id: 'nucleoid',
    name: 'Nucleoid',
    color: mix(L.violet, L.ink, 0.18),
    symbolColor: L.paper,
    role: 'The region where a prokaryote\'s circular chromosome sits, with no membrane around it.',
  },
  {
    // Plasmids: the same family, lighter, because they are small, separate and dispensable.
    id: 'plasmid',
    name: 'Plasmid',
    color: mix(L.violet, L.paper3, 0.45),
    symbolColor: L.ink,
    role: 'A small ring of DNA that copies itself independently and can pass from cell to cell.',
  },
  {
    // Fine protein hairs, cooler and darker than the cytoskeleton grey so they read against a capsule.
    id: 'pilus',
    name: 'Pilus',
    color: mix(L.inkSoft, L.water, 0.3),
    symbolColor: L.paper,
    role: 'A short protein filament used to stick to surfaces, and in one specialised form to pass a plasmid to another cell.',
  },
  {
    // The propeller: the water token taken towards the ink so a helix stays legible against the medium.
    id: 'flagellum',
    name: 'Flagellum',
    color: mix(L.water, L.ink, 0.35),
    symbolColor: L.paper,
    role: 'A stiff helical propeller of protein, spun by a rotary motor in the membrane.',
  },
  {
    // The rotary motor: gold carried towards coral, because it is the one part of these structures that
    // is doing work.
    id: 'flagellarMotor',
    name: 'Motor',
    color: mix(L.gold, L.coral, 0.4),
    symbolColor: L.ink,
    role: 'The rings of protein in the membrane that turn the filament, driven by protons flowing into the cell.',
  },
]);

export const EXTRA_BY_ID = Object.freeze(Object.fromEntries(EXTRA_ORGANELLES.map((o) => [o.id, o])));

// One lookup over both tables, so a figure never has to know which of the two an id came from.
export function organelle(id) {
  const def = O[id] || EXTRA_BY_ID[id];
  if (!def) throw new Error(`no organelle "${id}" in ORGANELLES or EXTRA_ORGANELLES; ids are ${[...Object.keys(O), ...Object.keys(EXTRA_BY_ID)].join(', ')}`);
  return def;
}

export const colourOf = (id) => organelle(id).color;

// ----- the prokaryote figure's view -----
// The ten parts it colours, under its own names: its `wall` is the peptidoglycan layer and its `motor`
// the flagellar motor, and both words are hit-test ids its describe() reports, so they stay its words.
const PROKARYOTE_IDS = Object.freeze({ wall: 'peptidoglycan', motor: 'flagellarMotor' });
const PROKARYOTE_PARTS = ['wall', 'wallLine', 'lps', 'sLayer', 'capsule', 'nucleoid', 'plasmid', 'pilus', 'flagellum', 'motor'];

export const CELL_COLOURS = Object.freeze(Object.fromEntries(PROKARYOTE_PARTS.map((k) => [k, EXTRA_BY_ID[PROKARYOTE_IDS[k] ?? k]])));
export const CELL_COLOUR = Object.freeze(Object.fromEntries(PROKARYOTE_PARTS.map((k) => [k, CELL_COLOURS[k].color])));

// One lookup for a clicked part, whichever table names it; null for a part with no colour of its own,
// which the figure then finds in its own list of uncoloured parts.
export function partInfo(id) {
  return O[id] || CELL_COLOURS[id] || null;
}
