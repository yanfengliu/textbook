// The tree of life. One trunk from LUCA splits into Bacteria and the archaeal lineage; Eukarya grows
// out of the archaeal lineage and fans into the many single-celled lineages, plants, fungi and
// animals. Two dashed arrows from Bacteria mark the two endosymbioses that made eukaryotes what they
// are: the mitochondrion at the base of Eukarya and the chloroplast at the plants. Hovering, tapping
// or focusing a domain, a branch, LUCA or an arrow highlights it and opens a card of facts; the
// toolbar switches the emphasis between the three domains, the endosymbioses and the eukaryotes.
// Nothing moves on its own; the highlight fades over 240 ms and cuts under reduced motion.
//
// Two drawings, one module. A ResizeObserver on the mount picks the wide arrangement above
// NARROW_MAX px of stage width and the narrow one below it, and rebuilds the SVG on a change. The
// narrow drawing is not the wide one shrunk: it has its own 380-unit viewBox, so text authored at
// 11–17 units lands at 10–15 device pixels on a phone instead of 4. It carries the same lesson with
// less furniture — one icon per prokaryote domain, one-word endosymbiosis labels, no time axis.
// describe() -> { highlighted, mode, layout }.
import { el, h, text, C, tint, uid } from './lib/svg.js';

export const meta = { kind: 'tree', title: 'The tree of life', needsWebGL: false, aspect: 16 / 10 };

// Stage widths below this get the narrow drawing. The wide drawing's smallest labels are 11.5 units
// of 1000, so they fall under nine device pixels once the stage is narrower than about 780 px, while
// the narrow drawing is still comfortable at 680. A phone stage is 342-390 px and the chapter's stage
// at a 1024 px viewport is 656 px, so both take the narrow drawing; 712 px and up take the wide one.
const NARROW_MAX = 680;

const W = 1000;
const H = 625;
const NW = 380;
const NH = 237.5; // 380 / 1.6: the registry owns the 16:10 stage and the viewBox must match it.

const DOMAIN_COLOUR = { bacteria: C.water, archaea: C.coral, eukarya: C.violet };
const goldDark = 'color-mix(in srgb, var(--gold) 70%, var(--ink))';
const leafDark = 'color-mix(in srgb, var(--leaf) 70%, var(--ink))';

// Where the wide tree's joints are, so every branch, dot and label agrees.
const ROOT = [500, 528];
const FORK = [500, 462];
const B_NODE = [220, 235];
const J = [640, 372]; // where Eukarya leaves the archaeal lineage
const A_NODE = [860, 240];
const E_BASE = [555, 290];
const P_NODE = [505, 205]; // the fan of single-celled lineages
const FA_NODE = [635, 235]; // fungi + animals
const TIP_Y = 140;
const ICON_Y = 112;

// The narrow tree's joints. Same topology, less of it: the crown is four eukaryote tips plus one tip
// cluster each for Bacteria and Archaea, and the trunk is short because the toolbar owns the last
// forty units of the box. Both domain branches leave the fork steeply, because a shallow V over this
// little vertical room reads as one arc with a stub hanging off it rather than as a split.
const N_ROOT = [190, 178];
const N_FORK = [190, 152];
const N_B_NODE = [46, 118];
const N_A_NODE = [338, 118];
const N_J = [248, 137]; // where Eukarya leaves the archaeal lineage
const N_E_BASE = [215, 114];
const N_P_NODE = [182, 96];
const N_FA_NODE = [250, 100];
const N_TIP_Y = 76;
const N_ICON_Y = 56;
const N_NAME_Y = 17; // the three domain names
const N_LABEL_Y = 35; // the four eukaryote tip labels
const N_TIP_X = { plants: 126, protists: 180, fungi: 234, animals: 288 };

// ---------- the cards ----------
export const INFO = Object.freeze({
  bacteria: { title: 'Bacteria', facts: [
    ['Cells', 'Prokaryotic: no nucleus, one loop of DNA, a wall of peptidoglycan, about 1–5 µm across.'],
    ['Where', 'Everywhere: soil, oceans, hot springs, ice, your skin and gut.'],
    ['Examples', 'E. coli, cyanobacteria, Streptococcus, the root bacteria that fix nitrogen.'],
    ['Note', 'By count, most of the living cells on Earth.'],
  ] },
  archaea: { title: 'Archaea', facts: [
    ['Cells', 'Prokaryotic like bacteria, but with different membranes, walls and enzymes; their DNA-copying machinery is closer to ours.'],
    ['Where', 'First found in hot springs and salt lakes; since found in soil, the sea, and the guts of cows and people.'],
    ['Examples', 'Methanogens, salt-loving Haloquadratum, heat-loving Sulfolobus.'],
    ['Note', 'No known archaeon causes disease.'],
  ] },
  eukarya: { title: 'Eukarya', facts: [
    ['Cells', 'Eukaryotic: a nucleus and organelles, nearly always including mitochondria; typically 10–100 µm.'],
    ['Where', 'From ocean plankton to forests, deserts and deep rock.'],
    ['Examples', 'Amoebae, algae, yeasts, plants, fungi, animals.'],
    ['Note', 'Arose about two billion years ago from an archaeal lineage that took in a bacterium.'],
  ] },
  protists: { title: 'Single-celled eukaryotes', facts: [
    ['Cells', 'Eukaryotic, one cell each, in dozens of lineages with no common name beyond "protist".'],
    ['Where', 'Water, soil, and inside other organisms.'],
    ['Examples', 'Paramecium, Amoeba, diatoms, Giardia, the malaria parasite.'],
    ['Note', 'Most of the eukaryote tree: plants, fungi and animals are three twigs among many.'],
  ] },
  plants: { title: 'Plants', facts: [
    ['Cells', 'Eukaryotic, with a cellulose wall and chloroplasts that make sugar from light, water and CO₂.'],
    ['Where', 'Land, mostly, from mosses to sequoias; their green algal relatives live in water.'],
    ['Examples', 'Mosses, ferns, grasses, oaks.'],
    ['Note', 'The chloroplast was once a free-living cyanobacterium.'],
  ] },
  fungi: { title: 'Fungi', facts: [
    ['Cells', 'Eukaryotic, with a chitin wall; they digest food outside the body and absorb it.'],
    ['Where', 'Soil, rotting wood, and on and inside other organisms.'],
    ['Examples', 'Yeasts, moulds, mushrooms.'],
    ['Note', 'Closer relatives of animals than of plants.'],
  ] },
  animals: { title: 'Animals', facts: [
    ['Cells', 'Eukaryotic, no cell wall, many cells that specialise into tissues.'],
    ['Where', 'Everywhere from the deep sea to mountain tops.'],
    ['Examples', 'Sponges, insects, frogs, humans.'],
    ['Note', 'Nearest relatives: the single-celled choanoflagellates, then fungi.'],
  ] },
  luca: { title: 'LUCA', facts: [
    ['What', 'The last universal common ancestor: a population of cells, not one cell, from which everything alive descends.'],
    ['When', 'About 3.5–4 billion years ago.'],
    ['Had', 'DNA, the genetic code, ribosomes, ATP and a membrane, because every descendant has them.'],
    ['Note', 'Not the first life: earlier lineages left no descendants.'],
  ] },
  mito: { title: 'Mitochondria', facts: [
    ['What', 'A bacterium taken into a cell of the archaeal lineage about two billion years ago, and kept.'],
    ['Now', 'The organelle that makes most of a eukaryotic cell’s ATP; it still carries a small genome of its own.'],
    ['Evidence', 'Its own DNA and ribosomes, a double membrane, and division by splitting, like a bacterium.'],
  ] },
  chloro: { title: 'Chloroplasts', facts: [
    ['What', 'A photosynthetic cyanobacterium taken in by the ancestor of plants, green algae and red algae, after the mitochondrion.'],
    ['Now', 'The organelle that makes sugar from light, water and CO₂ in every leaf.'],
    ['Evidence', 'Its own DNA and ribosomes, a double membrane, and the same chlorophyll as cyanobacteria.'],
  ] },
});

// Which groups stay bright when a target is highlighted; everything else dims.
const MEMBERS = {
  bacteria: ['bacteria'],
  archaea: ['archaea'],
  eukarya: ['eukarya', 'plants', 'protists', 'fungi', 'animals'],
  plants: ['plants'],
  protists: ['protists'],
  fungi: ['fungi'],
  animals: ['animals'],
  luca: ['luca'],
  mito: ['mito'],
  chloro: ['chloro'],
};

// `short` is what the button shows when the toolbar is narrow; `label` stays its accessible name, so
// a screen reader and tools/drive.js both still hear the full wording.
export const MODES = Object.freeze([
  { id: 'domains', label: 'Three domains', short: 'Domains', bright: null },
  { id: 'endosymbiosis', label: 'Endosymbiosis', short: 'Symbiosis', bright: ['mito', 'chloro'] },
  { id: 'eukaryotes', label: 'Eukaryotes', short: 'Eukaryotes', bright: ['eukarya', 'plants', 'protists', 'fungi', 'animals'] },
]);

// ---------- icons, each about 36 units wide on the origin ----------
function iconRod(g, colour) {
  g.append(el('path', { d: 'M16 0 C22 -5 24 5 30 0 C34 -3 36 2 40 0', stroke: colour, 'stroke-width': 1.3, fill: 'none', opacity: 0.85 }));
  g.append(el('rect', { x: -17, y: -7, width: 34, height: 14, rx: 7, fill: tint(colour, 26), stroke: colour, 'stroke-width': 1.6 }));
  g.append(el('path', { d: 'M-8 -2 C-4 -4 4 -4 8 -2', stroke: colour, 'stroke-width': 1.2, fill: 'none', opacity: 0.7 }));
}
function iconCocci(g, colour) {
  for (const [x, y] of [[-13, 4], [0, -3], [13, 4]]) {
    g.append(el('circle', { cx: x, cy: y, r: 7.5, fill: tint(colour, 26), stroke: colour, 'stroke-width': 1.6 }));
  }
}
function iconSpiral(g, colour) {
  g.append(el('path', { d: 'M-19 0 C-15 -13 -11 13 -7 0 C-3 -13 1 13 5 0 C9 -13 13 13 17 0', stroke: colour, 'stroke-width': 4.2, fill: 'none', 'stroke-linecap': 'round' }));
}
function iconHotSpring(g, colour) {
  g.append(el('ellipse', { cx: 0, cy: 14, rx: 23, ry: 5, fill: tint(colour, 16), stroke: colour, 'stroke-width': 1, opacity: 0.9 }));
  for (const [x, y, r] of [[16, -9, 2.2], [20, -15, 1.7], [23, -20, 1.2]]) g.append(el('circle', { cx: x, cy: y, r, fill: 'none', stroke: colour, 'stroke-width': 1 }));
  g.append(el('path', { d: 'M-12 -2 C-14 -12 -2 -16 4 -12 C12 -14 16 -4 12 2 C14 10 4 14 -2 10 C-10 14 -16 6 -12 -2 Z', fill: tint(colour, 26), stroke: colour, 'stroke-width': 1.6 }));
}
function iconSalt(g, colour) {
  g.append(el('rect', { x: -12, y: -12, width: 24, height: 24, rx: 2.5, fill: tint(colour, 26), stroke: colour, 'stroke-width': 1.6 }));
  for (const [x, y] of [[-6, -5], [2, -6], [-4, 4], [5, 3]]) g.append(el('circle', { cx: x, cy: y, r: 1.8, fill: colour, opacity: 0.6 }));
  g.append(el('path', { d: 'M16 6 L23 2 L27 8 L20 12 Z M20 12 L20 17 L27 13 L27 8 M16 6 L16 11 L20 17', stroke: C.soft, 'stroke-width': 1, fill: 'none', 'stroke-linejoin': 'round' }));
}
function iconMethanogen(g, colour) {
  g.append(el('path', { d: 'M-10 -3 C-11 -11 0 -13 6 -10 C13 -7 13 5 7 9 C1 13 -9 10 -10 3 Z', fill: tint(colour, 26), stroke: colour, 'stroke-width': 1.6 }));
  g.append(el('path', { d: 'M12 -4 C18 -8 20 0 26 -4 M12 0 C18 -2 22 6 28 2 M11 4 C16 8 20 4 26 8', stroke: colour, 'stroke-width': 1.1, fill: 'none', opacity: 0.85, 'stroke-linecap': 'round' }));
}
function iconParamecium(g, colour) {
  const d = 'M-20 1 C-20 -8 -10 -12 0 -11 C10 -10 20 -6 20 1 C20 8 10 12 -1 11 C-11 10 -20 8 -20 1 Z';
  g.append(el('path', { d, fill: 'none', stroke: colour, 'stroke-width': 5, 'stroke-dasharray': '0.9 2.3', opacity: 0.5 }));
  g.append(el('path', { d, fill: tint(colour, 22), stroke: colour, 'stroke-width': 1.5 }));
  g.append(el('path', { d: 'M-12 2 C-6 4 -1 5 4 3', stroke: colour, 'stroke-width': 1, fill: 'none', opacity: 0.7 }));
  g.append(el('ellipse', { cx: 3, cy: -2, rx: 5, ry: 3, fill: colour, opacity: 0.65 }));
}
function iconFern(g) {
  const rib = [[-6, 18], [-4, 8], [0, -2], [6, -11], [13, -18]];
  g.append(el('path', { d: `M${rib[0][0]} ${rib[0][1]} C-6 8 2 -8 ${rib[4][0]} ${rib[4][1]}`, stroke: leafDark, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }));
  const leaflets = [[-5, 12, 9], [-3, 4, 9], [1, -4, 8], [6, -11, 6]];
  for (const [x, y, len] of leaflets) {
    g.append(el('path', { d: `M${x} ${y} C${x - len * 0.6} ${y - len * 0.6} ${x - len} ${y - len * 0.2} ${x - len - 1} ${y + 1}`, stroke: C.leaf, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }));
    g.append(el('path', { d: `M${x} ${y} C${x + len * 0.6} ${y - len * 0.6} ${x + len} ${y - len * 0.2} ${x + len + 1} ${y + 1}`, stroke: C.leaf, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }));
  }
  g.append(el('circle', { cx: 14, cy: -19, r: 2.4, fill: 'none', stroke: leafDark, 'stroke-width': 1.5 }));
}
function iconMushroom(g) {
  g.append(el('rect', { x: 9, y: 2, width: 6, height: 12, rx: 3, fill: tint(C.ink, 8), stroke: C.soft, 'stroke-width': 1.1 }));
  g.append(el('path', { d: 'M3 3 C3 -5 21 -5 21 3 Z', fill: tint(C.gold, 55), stroke: goldDark, 'stroke-width': 1.2 }));
  g.append(el('rect', { x: -10, y: -2, width: 8, height: 18, rx: 3.5, fill: tint(C.ink, 8), stroke: C.soft, 'stroke-width': 1.2 }));
  g.append(el('path', { d: 'M-21 -1 C-21 -15 9 -15 9 -1 Z', fill: tint(C.gold, 60), stroke: goldDark, 'stroke-width': 1.4 }));
  g.append(el('path', { d: 'M-18 -1 L6 -1', stroke: goldDark, 'stroke-width': 1, opacity: 0.6 }));
}
function iconFrog(g) {
  const skin = tint(C.leaf, 72);
  g.append(el('path', { d: 'M-17 6 C-24 4 -25 12 -19 13 L-13 12 M17 6 C24 4 25 12 19 13 L13 12', stroke: leafDark, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('path', { d: 'M-17 6 C-24 4 -25 12 -19 13 L-13 12 M17 6 C24 4 25 12 19 13 L13 12', stroke: skin, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
  g.append(el('path', { d: 'M-16 8 C-18 -4 -8 -10 0 -10 C8 -10 18 -4 16 8 C14 14 -14 14 -16 8 Z', fill: skin, stroke: leafDark, 'stroke-width': 1.6 }));
  g.append(el('ellipse', { cx: 0, cy: 8, rx: 9, ry: 3.5, fill: tint(C.leaf, 20) }));
  g.append(el('path', { d: 'M-6 1 Q0 5 6 1', stroke: leafDark, 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }));
  for (const s of [-1, 1]) {
    g.append(el('circle', { cx: s * 8, cy: -10, r: 5, fill: skin, stroke: leafDark, 'stroke-width': 1.5 }));
    g.append(el('circle', { cx: s * 8, cy: -10, r: 2.4, fill: C.ink }));
    g.append(el('circle', { cx: s * 8 - 1, cy: -11, r: 0.8, fill: C.paper }));
  }
}

// Font sizes are authored in viewBox units. The narrow box is 380 units across a ~342 px stage and the
// wide one 1000 units across a ~950 px stage, so both scales are near 1:1 and the two sets of sizes
// below are the sizes a reader actually gets, in device pixels, on each.
const CSS = `
.tb-tree { position: absolute; inset: 0; font-family: var(--font-ui); }
.tb-tree .tr-stage { position: absolute; inset: 0; }
.tb-tree svg { user-select: none; -webkit-user-select: none; }
.tb-tree svg text { font-family: var(--font-ui); fill: var(--ink); }
.tb-tree .tr-title { font-family: var(--font-display); font-size: 26px; font-weight: 500; letter-spacing: -0.01em; font-variation-settings: "SOFT" 40, "WONK" 0; }
.tb-tree .tr-tip { font-size: 12.5px; font-weight: 500; }
.tb-tree .tr-note { font-size: 11.5px; fill: var(--ink-soft); }
.tb-tree .tr-arrowlabel { font-size: 11.5px; font-weight: 500; fill: var(--water-text); }
.tb-tree .tr-axis { font-size: 10.5px; fill: var(--ink-faint); letter-spacing: 0.08em; text-transform: uppercase; }
.tb-tree .tr-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3.5px; stroke-linejoin: round; }
.tb-tree .tr-group { transition: opacity var(--dur) var(--ease); }
.tb-tree .tr-group.is-dim { opacity: 0.26; }
.tb-tree .tr-group.is-dim-soft { opacity: 0.42; }
.tb-tree.is-cut .tr-group { transition: none; }
.tb-tree .tr-hit { cursor: pointer; outline: none; }
.tb-tree .tr-hit:focus-visible .tr-focus { stroke: var(--leaf); stroke-width: 2; }
.tb-tree .tr-focus { fill: none; stroke: transparent; stroke-dasharray: 4 3; }
.tb-tree .fig-card { top: auto; bottom: calc(var(--space-3) + 2.5rem); left: var(--space-3); max-width: min(22rem, 40%); }
.tb-tree .fig-card[hidden] { display: none; }
.tb-tree .fig-card p { margin-top: 0.25em; }
.tb-tree .fig-card p b { color: var(--ink); font-weight: 600; }

.tb-tree.is-narrow .tr-title { font-size: 17px; }
.tb-tree.is-narrow .tr-tip { font-size: 11.5px; }
.tb-tree.is-narrow .tr-note { font-size: 10.5px; }
.tb-tree.is-narrow .tr-arrowlabel { font-size: 11px; }
.tb-tree.is-narrow .tr-halo { stroke-width: 3px; }
.tb-tree.is-narrow .tr-focus { stroke-dasharray: 3 2.5; }
.tb-tree.is-narrow .tr-hit:focus-visible .tr-focus { stroke-width: 1.5; }
.tb-tree.is-narrow .fig-toolbar {
  left: var(--space-1); right: var(--space-1); bottom: var(--space-1);
  gap: var(--space-1); flex-wrap: nowrap; justify-content: center;
}
/* The drawing scales with the stage and the chrome does not, so a toolbar fixed in rem shrinks to a
   caption beside a 656 px-wide tree. cqw is a share of the stage, which is the figure's container.
   The button height follows from this one length, and the card below stacks on top of it. */
.tb-tree.is-narrow { --tr-btn: clamp(0.66rem, 2.6cqw, 0.95rem); }
.tb-tree.is-narrow .fig-btn {
  padding: 0.28em 0.72em; line-height: 1.2; white-space: nowrap;
  font-size: var(--tr-btn);
}
/* A card floated over a 342 px stage hides the branch it is describing and swallows the next tap, so
   on narrow it is a strip across the bottom: it covers the trunk and LUCA, leaves the three domain
   names and the icons in view, and passes every pointer through to the drawing underneath. */
.tb-tree.is-narrow .fig-card {
  left: var(--space-1); right: var(--space-1); max-width: none;
  /* Clear the toolbar by four pixels, whatever --tr-btn has grown to: 1.2 line + 0.56 em of padding
     + the border. Anything shorter left the LUCA caption sticking out under the card's bottom edge
     like a ghost line. */
  bottom: calc(var(--space-1) + var(--tr-btn) * 1.76 + 6px);
  padding: 0.35rem 0.6rem; border-radius: var(--radius);
  pointer-events: none;
  background: var(--paper);
}
.tb-tree.is-narrow .fig-card h5 { font-size: clamp(var(--text-sm), 3.2cqw, var(--text-base)); }
.tb-tree.is-narrow .fig-card p { font-size: clamp(0.68rem, 2.5cqw, 0.85rem); line-height: 1.3; }
.tb-tree.is-narrow .fig-card p:nth-of-type(n+3) { display: none; }

/* The wide drawing's LUCA caption sits at 89% of the stage height, and the toolbar is sized in CSS
   pixels, so the narrower the stage the further across it reaches: below about 820 px the row of
   buttons was printed over "LUCA, the last universal common ancestor". Stack them in the empty
   bottom-right corner instead. */
@container (max-width: 820px) {
  .tb-tree:not(.is-narrow) .fig-toolbar {
    left: auto; right: var(--space-2); bottom: var(--space-2);
    flex-direction: column; align-items: flex-end; gap: var(--space-1);
  }
  .tb-tree:not(.is-narrow) .fig-btn { padding: 0.2rem 0.55rem; font-size: 0.68rem; }
  .tb-tree:not(.is-narrow) .fig-card { max-width: 52%; bottom: var(--space-2); }
}
`;

export function mount(root, ctx) {
  const ns = uid('tr');
  const wrap = h('div', { class: 'tb-tree' });
  if (ctx.reducedMotion || ctx.pinnedTime !== null) wrap.classList.add('is-cut');
  wrap.append(h('style', { text: CSS }));
  // The drawing is replaced on a layout change; the holder is not, so the pointer and keyboard
  // listeners below are attached once and never go stale.
  const holder = h('div', { class: 'tr-stage' });
  wrap.append(holder);

  // ----- card and toolbar: built once, kept across a rebuild -----
  const cardTitle = h('h5');
  const cardBody = h('div');
  const card = h('div', { class: 'fig-card fig-ui', 'aria-live': 'polite', hidden: true }, [cardTitle, cardBody]);
  wrap.append(card);
  const buttons = MODES.map((m) => h('button', {
    class: 'fig-btn', type: 'button', 'aria-pressed': 'false', 'aria-label': m.label, 'data-mode': m.id, text: m.label,
  }));
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, buttons);
  wrap.append(toolbar);

  // ----- state -----
  let layout = null;
  let mode = 'domains';
  let selected = null; // pinned by click, Enter or Space
  let hovered = null; // transient: pointer over, or keyboard focus
  let groups = {};
  let hits = [];

  // ---------- the drawing helpers, bound to one SVG ----------
  function maker(svg) {
    const made = {};
    function group(id, { hit = true, label } = {}) {
      const g = el('g', { class: `tr-group${hit ? ' tr-hit' : ''}`, 'data-id': id });
      if (hit) {
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', label || INFO[id]?.title || id);
        g.setAttribute('aria-pressed', 'false');
      }
      made[id] = g;
      svg.append(g);
      return g;
    }
    // A branch: the visible stroke plus a wide transparent twin so it is easy to point at.
    function branch(g, d, width, colour, grab = 22) {
      g.append(el('path', { d, stroke: colour, 'stroke-width': width, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      g.append(el('path', { d, stroke: 'transparent', 'stroke-width': Math.max(width + 14, grab), fill: 'none', 'stroke-linecap': 'round' }));
    }
    function dot(g, [x, y], r, colour) {
      g.append(el('circle', { cx: x, cy: y, r, fill: colour }));
    }
    function icon(g, x, y, draw, colour, scale = 1, ox = 0) {
      const holderG = el('g', { transform: `translate(${x} ${y}) scale(${scale}) translate(${ox} 0)` });
      draw(holderG, colour);
      g.append(holderG);
    }
    function title(g, x, y, str, colour, anchor = 'middle') {
      g.append(text(x, y, str, { anchor, class: 'tr-title tr-hitlabel', fill: colour }));
    }
    function focusRing(g, x, y, w, hgt, r = 8) {
      g.append(el('rect', { class: 'tr-focus', x: x - w / 2, y: y - hgt / 2, width: w, height: hgt, rx: r }));
    }
    return { made, group, branch, dot, icon, title, focusRing };
  }

  function arrowDefs(svg, arrowId, axisId, head = 9) {
    const defs = el('defs');
    const marker = el('marker', { id: arrowId, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: head, markerHeight: head, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' });
    marker.append(el('path', { d: 'M0 0.5 L10 5 L0 9.5 Z', fill: C.water }));
    defs.append(marker);
    if (axisId) {
      const axisMarker = el('marker', { id: axisId, viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto', markerUnits: 'userSpaceOnUse' });
      axisMarker.append(el('path', { d: 'M1 8 L5 2 L9 8', fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      defs.append(axisMarker);
    }
    svg.append(defs);
  }

  // ---------- the wide drawing ----------
  function drawWide(svg) {
    const arrowId = `${ns}-arrow`;
    const axisId = `${ns}-axis`;
    arrowDefs(svg, arrowId, axisId);
    const { made, group, branch, dot, icon, title, focusRing } = maker(svg);

    // A faint time axis: the tips are today, the root deep in the past.
    const axis = el('g');
    axis.append(el('path', { d: 'M40 520 L40 150', stroke: C.ruleStrong, 'stroke-width': 1.2, 'marker-end': `url(#${axisId})` }));
    axis.append(text(46, 146, 'today', { class: 'tr-axis' }));
    axis.append(text(0, 0, 'time', { class: 'tr-axis', anchor: 'middle', transform: 'translate(31 335) rotate(-90)' }));
    svg.append(axis);

    // ----- LUCA and the trunk -----
    const luca = group('luca', { label: 'LUCA, the last universal common ancestor' });
    branch(luca, `M${ROOT[0]} ${ROOT[1]} L${FORK[0]} ${FORK[1]}`, 12, C.soft);
    dot(luca, ROOT, 9, C.soft);
    dot(luca, ROOT, 4, C.paper);
    luca.append(text(500, 557, 'LUCA, the last universal common ancestor', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    luca.append(text(500, 573, 'about 3.5–4 billion years ago', { anchor: 'middle', class: 'tr-note' }));
    focusRing(luca, 500, 552, 300, 56);

    // ----- Bacteria -----
    const bac = group('bacteria');
    const bc = DOMAIN_COLOUR.bacteria;
    branch(bac, `M${FORK[0]} ${FORK[1]} C430 430 300 335 ${B_NODE[0]} ${B_NODE[1]}`, 8, bc);
    branch(bac, `M${B_NODE[0]} ${B_NODE[1]} C190 200 130 175 110 ${TIP_Y}`, 3.5, bc);
    branch(bac, `M${B_NODE[0]} ${B_NODE[1]} C215 200 205 170 200 ${TIP_Y}`, 3.5, bc);
    branch(bac, `M${B_NODE[0]} ${B_NODE[1]} C250 205 280 175 290 ${TIP_Y}`, 3.5, bc);
    dot(bac, B_NODE, 5, bc);
    icon(bac, 110, ICON_Y, iconRod, bc);
    icon(bac, 200, ICON_Y, iconCocci, bc);
    icon(bac, 290, ICON_Y, iconSpiral, bc);
    title(bac, 200, 52, 'Bacteria', bc);
    focusRing(bac, 200, 82, 240, 120);

    // ----- Archaea -----
    const arc = group('archaea');
    const ac = DOMAIN_COLOUR.archaea;
    branch(arc, `M${FORK[0]} ${FORK[1]} C556 428 600 400 ${J[0]} ${J[1]}`, 8, ac);
    branch(arc, `M${J[0]} ${J[1]} C720 322 800 282 ${A_NODE[0]} ${A_NODE[1]}`, 8, ac);
    branch(arc, `M${A_NODE[0]} ${A_NODE[1]} C830 205 790 175 770 ${TIP_Y}`, 3.5, ac);
    branch(arc, `M${A_NODE[0]} ${A_NODE[1]} C860 205 856 170 855 ${TIP_Y}`, 3.5, ac);
    branch(arc, `M${A_NODE[0]} ${A_NODE[1]} C890 205 925 175 940 ${TIP_Y}`, 3.5, ac);
    dot(arc, A_NODE, 5, ac);
    icon(arc, 770, ICON_Y, iconHotSpring, ac);
    icon(arc, 855, ICON_Y, iconSalt, ac);
    icon(arc, 940, ICON_Y, iconMethanogen, ac);
    title(arc, 855, 52, 'Archaea', ac);
    focusRing(arc, 855, 82, 230, 120);

    // ----- Eukarya: the stem out of the archaeal lineage, then four branches -----
    const ec = DOMAIN_COLOUR.eukarya;
    const euk = group('eukarya');
    branch(euk, `M${J[0]} ${J[1]} C612 342 580 318 ${E_BASE[0]} ${E_BASE[1]}`, 7, ec);
    dot(euk, E_BASE, 5, ec);
    title(euk, 552, 52, 'Eukarya', ec);
    focusRing(euk, 552, 46, 120, 40);

    const plants = group('plants');
    branch(plants, `M${E_BASE[0]} ${E_BASE[1]} C520 250 450 200 410 ${TIP_Y}`, 5, ec);
    icon(plants, 410, ICON_Y, iconFern, ec);
    plants.append(text(410, 86, 'Plants', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(plants, 410, 108, 70, 80);

    const prot = group('protists', { label: 'Single-celled lineages, many' });
    branch(prot, `M${E_BASE[0]} ${E_BASE[1]} C540 262 520 232 ${P_NODE[0]} ${P_NODE[1]}`, 5, ec);
    for (const [cx, tx] of [[478, 466], [497, 490], [512, 516], [528, 542]]) {
      branch(prot, `M${P_NODE[0]} ${P_NODE[1]} C${cx} 185 ${(cx + tx) / 2} 165 ${tx} ${TIP_Y}`, 2.5, ec);
    }
    dot(prot, P_NODE, 4, ec);
    icon(prot, 505, ICON_Y, iconParamecium, ec);
    prot.append(text(505, 74, 'Single-celled', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    prot.append(text(505, 88, 'lineages (many)', { anchor: 'middle', class: 'tr-note' }));
    focusRing(prot, 505, 106, 96, 84);

    const fungi = group('fungi');
    branch(fungi, `M${E_BASE[0]} ${E_BASE[1]} C590 262 615 250 ${FA_NODE[0]} ${FA_NODE[1]}`, 5, ec);
    branch(fungi, `M${FA_NODE[0]} ${FA_NODE[1]} C625 200 610 170 600 ${TIP_Y}`, 3.5, ec);
    icon(fungi, 600, ICON_Y, iconMushroom, ec);
    fungi.append(text(600, 86, 'Fungi', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(fungi, 600, 108, 70, 80);

    const animals = group('animals');
    branch(animals, `M${FA_NODE[0]} ${FA_NODE[1]} C655 200 680 170 690 ${TIP_Y}`, 3.5, ec);
    dot(animals, FA_NODE, 4, ec);
    icon(animals, 690, ICON_Y, iconFrog, ec);
    animals.append(text(690, 86, 'Animals', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(animals, 690, 108, 76, 80);

    // The junction where Eukarya leaves the archaeal lineage, with its caption.
    const junction = el('g', { class: 'tr-group', 'data-id': 'junction' });
    dot(junction, J, 6, ac);
    dot(junction, J, 2.5, C.paper);
    junction.append(el('path', { d: `M${J[0] + 7} ${J[1] + 6} L664 394`, stroke: C.ruleStrong, 'stroke-width': 1 }));
    junction.append(text(668, 406, 'eukaryotes arose from an archaeal lineage', { class: 'tr-note' }));
    junction.append(text(668, 421, 'that took in a bacterium', { class: 'tr-note' }));
    made.junction = junction;
    svg.append(junction);
    dot(luca, FORK, 7, C.soft);

    // ----- the two endosymbioses: dashed arrows out of Bacteria -----
    const mito = group('mito', { label: 'Mitochondria, from a bacterium' });
    const mitoD = 'M362 372 C440 388 520 372 586 338';
    mito.append(el('path', { d: mitoD, stroke: C.water, 'stroke-width': 2.2, fill: 'none', 'stroke-dasharray': '7 5', 'stroke-linecap': 'round', 'marker-end': `url(#${arrowId})` }));
    mito.append(el('path', { d: mitoD, stroke: 'transparent', 'stroke-width': 22, fill: 'none' }));
    mito.append(text(482, 340, 'mitochondria', { anchor: 'middle', class: 'tr-arrowlabel tr-halo tr-hitlabel' }));
    mito.append(text(482, 354, '(from a bacterium)', { anchor: 'middle', class: 'tr-note tr-halo' }));
    focusRing(mito, 480, 358, 240, 56);

    const chloro = group('chloro', { label: 'Chloroplasts, from a cyanobacterium' });
    const chloroD = 'M270 188 C330 200 400 214 466 212';
    chloro.append(el('path', { d: chloroD, stroke: C.water, 'stroke-width': 2.2, fill: 'none', 'stroke-dasharray': '7 5', 'stroke-linecap': 'round', 'marker-end': `url(#${arrowId})` }));
    chloro.append(el('path', { d: chloroD, stroke: 'transparent', 'stroke-width': 22, fill: 'none' }));
    chloro.append(text(362, 176, 'chloroplasts', { anchor: 'middle', class: 'tr-arrowlabel tr-halo tr-hitlabel' }));
    chloro.append(text(362, 190, '(from a cyanobacterium)', { anchor: 'middle', class: 'tr-note tr-halo' }));
    focusRing(chloro, 368, 194, 220, 52);

    return made;
  }

  // ---------- the narrow drawing ----------
  function drawNarrow(svg) {
    const arrowId = `${ns}-arrow`;
    // A 9-unit head is 8 device pixels in either box, but against these shorter arrows it reads as a
    // blob, so the narrow drawing uses a smaller one.
    arrowDefs(svg, arrowId, null, 7);
    const { made, group, branch, dot, icon, title, focusRing } = maker(svg);
    const grab = 14; // the pointer target around a branch, in the narrow box's units

    // ----- LUCA and the trunk -----
    const luca = group('luca', { label: 'LUCA, the last universal common ancestor' });
    branch(luca, `M${N_ROOT[0]} ${N_ROOT[1]} L${N_FORK[0]} ${N_FORK[1]}`, 7.5, C.soft, grab);
    dot(luca, N_ROOT, 5.5, C.soft);
    dot(luca, N_ROOT, 2.4, C.paper);
    luca.append(text(190, 199, 'LUCA, the last common ancestor', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(luca, 190, 186, 190, 38, 6);

    // ----- Bacteria: one tip cluster, one icon -----
    const bac = group('bacteria');
    const bc = DOMAIN_COLOUR.bacteria;
    branch(bac, `M${N_FORK[0]} ${N_FORK[1]} C176 136 138 126 ${N_B_NODE[0]} ${N_B_NODE[1]}`, 6, bc, grab);
    branch(bac, `M${N_B_NODE[0]} ${N_B_NODE[1]} C34 106 26 92 24 ${N_TIP_Y}`, 2.4, bc, 10);
    branch(bac, `M${N_B_NODE[0]} ${N_B_NODE[1]} C46 106 46 90 46 ${N_TIP_Y - 2}`, 2.4, bc, 10);
    branch(bac, `M${N_B_NODE[0]} ${N_B_NODE[1]} C58 106 66 92 68 ${N_TIP_Y}`, 2.4, bc, 10);
    dot(bac, N_B_NODE, 3.6, bc);
    icon(bac, 46, N_ICON_Y, iconRod, bc, 0.9, -11);
    title(bac, 46, N_NAME_Y, 'Bacteria', bc);
    focusRing(bac, 48, 48, 96, 86, 6);

    // ----- Archaea -----
    const arc = group('archaea');
    const ac = DOMAIN_COLOUR.archaea;
    branch(arc, `M${N_FORK[0]} ${N_FORK[1]} C204 136 226 132 ${N_J[0]} ${N_J[1]}`, 6, ac, grab);
    branch(arc, `M${N_J[0]} ${N_J[1]} C280 132 312 128 ${N_A_NODE[0]} ${N_A_NODE[1]}`, 6, ac, grab);
    branch(arc, `M${N_A_NODE[0]} ${N_A_NODE[1]} C326 106 318 92 316 ${N_TIP_Y}`, 2.4, ac, 10);
    branch(arc, `M${N_A_NODE[0]} ${N_A_NODE[1]} C338 106 338 90 338 ${N_TIP_Y - 2}`, 2.4, ac, 10);
    branch(arc, `M${N_A_NODE[0]} ${N_A_NODE[1]} C350 106 358 92 360 ${N_TIP_Y}`, 2.4, ac, 10);
    dot(arc, N_A_NODE, 3.6, ac);
    icon(arc, 338, N_ICON_Y, iconSalt, ac, 0.85, -7.5);
    title(arc, 336, N_NAME_Y, 'Archaea', ac);
    focusRing(arc, 336, 48, 92, 86, 6);

    // ----- Eukarya -----
    const ec = DOMAIN_COLOUR.eukarya;
    const euk = group('eukarya');
    branch(euk, `M${N_J[0]} ${N_J[1]} C240 128 226 120 ${N_E_BASE[0]} ${N_E_BASE[1]}`, 5.5, ec, grab);
    dot(euk, N_E_BASE, 3.6, ec);
    title(euk, 207, N_NAME_Y, 'Eukarya', ec);
    focusRing(euk, 207, 13, 78, 24, 5);

    const plants = group('plants');
    branch(plants, `M${N_E_BASE[0]} ${N_E_BASE[1]} C198 114 160 102 ${N_TIP_X.plants} ${N_TIP_Y}`, 3.6, ec, 11);
    icon(plants, N_TIP_X.plants, N_ICON_Y, iconFern, ec, 0.7);
    plants.append(text(N_TIP_X.plants, N_LABEL_Y, 'Plants', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(plants, N_TIP_X.plants, 54, 46, 58, 6);

    const prot = group('protists', { label: 'Single-celled lineages, many' });
    branch(prot, `M${N_E_BASE[0]} ${N_E_BASE[1]} C208 108 192 102 ${N_P_NODE[0]} ${N_P_NODE[1]}`, 3.6, ec, 11);
    for (const tx of [164, 174, 186, 196]) {
      branch(prot, `M${N_P_NODE[0]} ${N_P_NODE[1]} C${(N_P_NODE[0] + tx) / 2} 90 ${tx} 86 ${tx} ${N_TIP_Y}`, 1.8, ec, 8);
    }
    dot(prot, N_P_NODE, 3, ec);
    icon(prot, N_TIP_X.protists, N_ICON_Y, iconParamecium, ec, 0.8);
    prot.append(text(N_TIP_X.protists, N_LABEL_Y, 'Protists', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(prot, N_TIP_X.protists, 54, 54, 58, 6);

    const fungi = group('fungi');
    branch(fungi, `M${N_E_BASE[0]} ${N_E_BASE[1]} C228 110 242 108 ${N_FA_NODE[0]} ${N_FA_NODE[1]}`, 3.6, ec, 11);
    branch(fungi, `M${N_FA_NODE[0]} ${N_FA_NODE[1]} C246 90 238 84 ${N_TIP_X.fungi} ${N_TIP_Y}`, 2.4, ec, 10);
    icon(fungi, N_TIP_X.fungi, N_ICON_Y, iconMushroom, ec, 0.8);
    fungi.append(text(N_TIP_X.fungi, N_LABEL_Y, 'Fungi', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(fungi, N_TIP_X.fungi, 54, 44, 58, 6);

    const animals = group('animals');
    branch(animals, `M${N_FA_NODE[0]} ${N_FA_NODE[1]} C262 90 282 84 ${N_TIP_X.animals} ${N_TIP_Y}`, 2.4, ec, 10);
    dot(animals, N_FA_NODE, 3, ec);
    icon(animals, N_TIP_X.animals, N_ICON_Y, iconFrog, ec, 0.8);
    animals.append(text(N_TIP_X.animals, N_LABEL_Y, 'Animals', { anchor: 'middle', class: 'tr-tip tr-hitlabel' }));
    focusRing(animals, N_TIP_X.animals, 54, 50, 58, 6);

    // The junction where Eukarya leaves the archaeal lineage. No caption here: the narrow box has no
    // room for the sentence, and the "Eukaryotes" button plus the Eukarya card carry it instead.
    const junction = el('g', { class: 'tr-group', 'data-id': 'junction' });
    dot(junction, N_J, 4.5, ac);
    dot(junction, N_J, 1.9, C.paper);
    made.junction = junction;
    svg.append(junction);
    dot(luca, N_FORK, 5, C.soft);

    // ----- the two endosymbioses: one word each, because the card carries the rest -----
    const chloro = group('chloro', { label: 'Chloroplasts, from a cyanobacterium' });
    const chloroD = 'M66 82 C86 72 104 69 122 78';
    chloro.append(el('path', { d: chloroD, stroke: C.water, 'stroke-width': 1.9, fill: 'none', 'stroke-dasharray': '5 3.5', 'stroke-linecap': 'round', 'marker-end': `url(#${arrowId})` }));
    chloro.append(el('path', { d: chloroD, stroke: 'transparent', 'stroke-width': 13, fill: 'none' }));
    chloro.append(text(101, 95, 'chloroplasts', { anchor: 'middle', class: 'tr-arrowlabel tr-halo tr-hitlabel' }));
    focusRing(chloro, 100, 88, 80, 30, 5);

    const mito = group('mito', { label: 'Mitochondria, from a bacterium' });
    const mitoD = 'M128 127 C152 132 180 132 206 120';
    mito.append(el('path', { d: mitoD, stroke: C.water, 'stroke-width': 1.9, fill: 'none', 'stroke-dasharray': '5 3.5', 'stroke-linecap': 'round', 'marker-end': `url(#${arrowId})` }));
    mito.append(el('path', { d: mitoD, stroke: 'transparent', 'stroke-width': 13, fill: 'none' }));
    mito.append(text(154, 121, 'mitochondria', { anchor: 'middle', class: 'tr-arrowlabel tr-halo tr-hitlabel' }));
    focusRing(mito, 156, 126, 86, 32, 5);

    return made;
  }

  // ---------- building and painting ----------
  function build(next) {
    layout = next;
    const narrow = next === 'narrow';
    wrap.classList.toggle('is-narrow', narrow);
    const svg = el('svg', {
      class: 'tb-fill',
      viewBox: narrow ? `0 0 ${NW} ${NH}` : `0 0 ${W} ${H}`,
      preserveAspectRatio: 'xMidYMid meet',
    });
    groups = narrow ? drawNarrow(svg) : drawWide(svg);
    hits = Object.values(groups).filter((g) => g.classList.contains('tr-hit'));
    holder.replaceChildren(svg);
    for (let i = 0; i < buttons.length; i += 1) buttons[i].textContent = narrow ? MODES[i].short : MODES[i].label;
    // The rebuild dropped whatever had focus, so only the pinned highlight survives it.
    hovered = null;
    paint();
  }

  function highlighted() {
    return hovered || selected;
  }

  function paint() {
    const target = highlighted();
    const modeSet = MODES.find((m) => m.id === mode).bright;
    const bright = target ? MEMBERS[target] : modeSet;
    for (const [id, g] of Object.entries(groups)) {
      let dim = false;
      if (bright) dim = !bright.includes(id) && !(id === 'junction' && bright.includes('eukarya'));
      g.classList.toggle('is-dim', dim && Boolean(target));
      g.classList.toggle('is-dim-soft', dim && !target);
    }
    for (const g of hits) g.setAttribute('aria-pressed', String(g.dataset.id === selected));
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    if (target) {
      const info = INFO[target];
      cardTitle.textContent = info.title;
      cardBody.replaceChildren(...info.facts.map(([k, v]) => h('p', {}, [h('b', { text: `${k} ` }), v])));
      card.hidden = false;
    } else {
      card.hidden = true;
    }
  }

  const hitOf = (e) => e.target.closest?.('.tr-hit') || null;
  // The keyboard-focused target, if any, is what the pointer falls back to when it leaves.
  const focusedId = () => {
    const g = document.activeElement?.closest?.('.tr-hit');
    return g && holder.contains(g) ? g.dataset.id : null;
  };
  const setHovered = (id) => {
    if (id !== hovered) {
      hovered = id;
      paint();
    }
  };
  const onOver = (e) => setHovered(hitOf(e)?.dataset.id ?? focusedId());
  const onLeave = () => setHovered(focusedId());
  const onClick = (e) => {
    const g = hitOf(e);
    if (!g) {
      if (selected) {
        selected = null;
        paint();
      }
      return;
    }
    selected = selected === g.dataset.id ? null : g.dataset.id;
    hovered = null;
    paint();
  };
  const onFocusIn = (e) => {
    const g = hitOf(e);
    if (g) {
      hovered = g.dataset.id;
      paint();
    }
  };
  const onFocusOut = (e) => {
    const g = hitOf(e);
    if (g && hovered === g.dataset.id) {
      hovered = null;
      paint();
    }
  };
  const onKey = (e) => {
    const g = hitOf(e);
    if (e.key === 'Escape') {
      selected = null;
      hovered = null;
      paint();
      return;
    }
    if (!g) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      selected = selected === g.dataset.id ? null : g.dataset.id;
      paint();
    }
  };
  holder.addEventListener('pointerover', onOver);
  holder.addEventListener('pointerleave', onLeave);
  holder.addEventListener('click', onClick);
  holder.addEventListener('focusin', onFocusIn);
  holder.addEventListener('focusout', onFocusOut);
  wrap.addEventListener('keydown', onKey);
  const onMode = (e) => {
    mode = e.currentTarget.dataset.mode;
    paint();
  };
  for (const b of buttons) b.addEventListener('click', onMode);

  root.append(wrap);
  // Lay out once from the real width, so the first painted frame is already the right drawing; the
  // observer's own first callback then reports the same width and changes nothing.
  const widthOf = () => root.getBoundingClientRect().width || root.clientWidth || W;
  build(widthOf() < NARROW_MAX ? 'narrow' : 'wide');
  const ro = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect?.width ?? widthOf();
    if (!width) return;
    const next = width < NARROW_MAX ? 'narrow' : 'wide';
    if (next !== layout) build(next);
  });
  ro.observe(root);

  let readyRaf = requestAnimationFrame(() => {
    readyRaf = 0;
    ctx.onReady();
  });

  return {
    destroy() {
      cancelAnimationFrame(readyRaf);
      ro.disconnect();
      holder.removeEventListener('pointerover', onOver);
      holder.removeEventListener('pointerleave', onLeave);
      holder.removeEventListener('click', onClick);
      holder.removeEventListener('focusin', onFocusIn);
      holder.removeEventListener('focusout', onFocusOut);
      wrap.removeEventListener('keydown', onKey);
      for (const b of buttons) b.removeEventListener('click', onMode);
      root.replaceChildren();
    },
    setTime() {
      // No clock: the only motion is the CSS fade, which is cut while the clock is pinned.
      wrap.classList.add('is-cut');
    },
    setVisible() {},
    setTheme() {},
    describe() {
      return { highlighted: highlighted(), mode, layout };
    },
  };
}
