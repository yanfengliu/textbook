// The structures chapter 3 draws that `ORGANELLES` in src/palette.js does not name yet.
//
// This module exists to be deleted. Every entry below is derived from an existing token with `mix()`,
// never invented, and is meant to move into `ORGANELLES` as one central addition so that a reader
// learns one colour per structure across the whole book. Until it does, this is the single place the
// chapter-3 figures take these colours from, so there is one value per structure and not one per
// figure. When the entries land in `palette.js`, replace `CELL_COLOURS` with `ORGANELLE_BY_ID` lookups
// and delete this file.
//
// Derived from LIGHT, as `ORGANELLES` is: those colours are single hexes used in both themes, and a
// second, theme-dependent table for these would make the wall a different colour on a dark page from
// the one on a light page. Each was checked against both papers.

import { LIGHT, mix, ORGANELLE_BY_ID } from '../../palette.js';

const L = LIGHT;

export const CELL_COLOURS = Object.freeze({
  // Peptidoglycan and the cellulose wall: a straw the gold token carries into the paper, so a wall
  // reads as a fibrous, structural layer rather than as another organelle.
  wall: { id: 'wall', name: 'Cell wall', color: mix(L.gold, L.paper3, 0.5), role: 'A mesh of sugar chains outside the membrane that holds the cell\'s shape and takes the pressure of the water flooding in.' },
  // The dye-holding mesh drawn as a line rather than a fill: the wall pushed back towards the ink.
  wallLine: { id: 'wallLine', name: 'Wall mesh', color: mix(L.gold, L.ink, 0.42), role: 'The cross-linked strands of the wall.' },
  // Lipopolysaccharide, the sugar coat on a gram-negative outer membrane: the membrane's own salmon
  // carried towards gold, because it is a sugar on a membrane.
  lps: { id: 'lps', name: 'Lipopolysaccharide', color: mix(ORGANELLE_BY_ID.membrane.color, L.gold, 0.45), role: 'Sugar chains on the outer face of a gram-negative outer membrane; a barrier to drugs, and what your immune system reads as danger.' },
  // The archaeal S-layer: a protein lattice, so the leaf token taken well into the paper.
  sLayer: { id: 'sLayer', name: 'S-layer', color: mix(L.leaf, L.paper3, 0.45), role: 'A lattice of interlocking protein subunits that many archaea wear instead of a wall.' },
  // A loose polysaccharide slime, drawn translucent: the water token taken far into the paper.
  capsule: { id: 'capsule', name: 'Capsule', color: mix(L.water, L.paper3, 0.62), role: 'A slippery polysaccharide coat that helps a cell stick to surfaces and makes it hard for an immune cell to grip.' },
  // Bacterial DNA stays in the violet family the book uses for information, one step deeper than
  // `chromatin` so a nucleoid does not read as a nucleus.
  nucleoid: { id: 'nucleoid', name: 'Nucleoid', color: mix(L.violet, L.ink, 0.18), role: 'The region where a prokaryote\'s circular chromosome sits, with no membrane around it.' },
  // Plasmids: the same family, lighter, because they are small, separate and dispensable.
  plasmid: { id: 'plasmid', name: 'Plasmid', color: mix(L.violet, L.paper3, 0.45), role: 'A small ring of DNA that copies itself independently and can pass from cell to cell.' },
  // Fine protein hairs, cooler and darker than the cytoskeleton grey so they read against a capsule.
  pilus: { id: 'pilus', name: 'Pilus', color: mix(L.inkSoft, L.water, 0.3), role: 'A short protein filament used to stick to surfaces, and in one specialised form to pass a plasmid to another cell.' },
  // The propeller: the water token taken towards the ink so a helix stays legible against the medium.
  flagellum: { id: 'flagellum', name: 'Flagellum', color: mix(L.water, L.ink, 0.35), role: 'A stiff helical propeller of protein, spun by a rotary motor in the membrane.' },
  // The rotary motor, and every motor protein in the chapter: gold carried towards coral, because it
  // is the one part of these structures that is doing work.
  motor: { id: 'motor', name: 'Motor', color: mix(L.gold, L.coral, 0.4), role: 'The rings of protein in the membrane that turn the filament, driven by protons flowing into the cell.' },
});

export const CELL_COLOUR = Object.freeze(Object.fromEntries(Object.entries(CELL_COLOURS).map(([k, v]) => [k, v.color])));

// One lookup for a clicked part, whichever table names it.
export function partInfo(id) {
  return ORGANELLE_BY_ID[id] || CELL_COLOURS[id] || null;
}
