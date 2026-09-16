// The organelle colours chapter 3 needs that `ORGANELLES` in palette.js does not yet carry, derived from
// the ones it does carry so that nothing here is a new invented hex. Every entry is `mix()` of two
// existing palette colours, so a change to the palette moves these with it.
//
// This file is a staging post, not a second palette. The integration owner is adding these ids to
// `ORGANELLES` centrally (see the chapter brief, "Palette additions this chapter needs"); when they land
// there, the figures import `ORGANELLE_BY_ID` for them and this file goes. Until then the four chapter-3
// figures that need them (symbiont, cytoskeleton, cilium, plantcell3d) share this one table, so the
// reader still learns one colour per structure.
//
// The values these recipes produce, for the record:
//   chloroplast #498c48 · thylakoid #3a6437 · wall #e2cc8f · middleLamella #de9e6a · vacuole #7298c4
//   tonoplast #597290 · plasmodesma #dd7650 · microtubule #5a8184 · actin #b2755b
//   intermediateFilament #827682 · motor #5f478b
import { ORGANELLE_BY_ID, LIGHT, mix } from '../../palette.js';

const O = ORGANELLE_BY_ID;

const chloroplast = mix(LIGHT.leaf, O.peroxisome.color, 0.35);
const wall = mix(LIGHT.gold, O.cytoplasm.color, 0.6);
const vacuole = mix(O.smoothER.color, O.chromatin.color, 0.45);

// Same shape as an ORGANELLES entry: { id, name, color, role }, so the labels and the click cards read
// from one place and the table can be pasted into palette.js unchanged.
export const EXTRA_ORGANELLES = Object.freeze([
  {
    id: 'wall',
    name: 'Cell wall',
    color: wall,
    role: 'Cellulose microfibrils in a sugar matrix, laid down outside the membrane. It resists turgor pressure and holds the plant up.',
  },
  {
    id: 'middleLamella',
    name: 'Middle lamella',
    color: mix(wall, LIGHT.coral, 0.45),
    role: 'A layer of pectin glueing one cell wall to the next — the same substance that sets jam.',
  },
  {
    id: 'vacuole',
    name: 'Central vacuole',
    color: vacuole,
    role: 'One large store of water and solutes. It fills the cell cheaply, generates turgor, and does a lysosome’s digesting.',
  },
  {
    id: 'tonoplast',
    name: 'Tonoplast',
    color: mix(vacuole, LIGHT.ink, 0.3),
    role: 'The vacuole’s own membrane, with the pumps that drive solutes in and water after them.',
  },
  {
    id: 'chloroplast',
    name: 'Chloroplast',
    color: chloroplast,
    role: 'Captures light and builds sugar from carbon dioxide. It has two membranes, its own circular DNA and bacterial ribosomes.',
  },
  {
    id: 'thylakoid',
    name: 'Thylakoid',
    color: mix(chloroplast, LIGHT.ink, 0.35),
    role: 'Flattened discs stacked into grana, holding the chlorophyll and the machinery that captures light.',
  },
  {
    id: 'plasmodesma',
    name: 'Plasmodesma',
    color: mix(O.membrane.color, LIGHT.coral, 0.75),
    role: 'A channel through the wall lined with plasma membrane, joining the cytoplasm of one cell to the next.',
  },
  {
    id: 'microtubule',
    name: 'Microtubule',
    color: mix(O.cytoskeleton.color, LIGHT.water, 0.5),
    role: 'A hollow tube 25 nm across, built from thirteen rows of tubulin. It resists compression and carries motor traffic.',
  },
  {
    id: 'actin',
    name: 'Actin filament',
    color: mix(O.cytoskeleton.color, LIGHT.coral, 0.5),
    role: 'Two twisted strands of actin, 7 nm across. It bears tension, and myosin walks along it.',
  },
  {
    id: 'intermediateFilament',
    name: 'Intermediate filament',
    color: mix(O.cytoskeleton.color, LIGHT.violet, 0.25),
    role: 'A rope of coiled proteins 8–12 nm across. It bears tension and has no polarity, so no motor walks on it.',
  },
  {
    id: 'motor',
    name: 'Motor protein',
    color: mix(LIGHT.violet, LIGHT.ink, 0.15),
    role: 'Turns the energy in ATP into steps along a filament, always in one direction.',
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
