// Every interactive figure kind, its module, and what the frame needs to know before loading it.
// A figure module exports `meta` and `mount(root, ctx)`; see docs/design/textbook.md, "The figure contract".
// `aspect` shapes the stage; `narrowAspect`, where given, replaces it below 800px for a figure that can
// fill any shape (canvas and 3D), so a phone gets a taller stage instead of a letterbox.
// The frame (components/figure.js) imports the module lazily by `url`, so a kind listed here costs nothing
// until a reader scrolls near it.

export const FIGURES = Object.freeze({
  pond: { url: new URL('./pond.js', import.meta.url).href, title: 'A drop of pond water', needsWebGL: false, aspect: 21 / 9, narrowAspect: 16 / 10 },
  homeostasis: { url: new URL('./homeostasis.js', import.meta.url).href, title: 'Holding a body temperature', needsWebGL: false, aspect: 16 / 10, narrowAspect: 4 / 3 },
  levels: { url: new URL('./levels.js', import.meta.url).href, title: 'Levels of organisation', needsWebGL: false, aspect: 16 / 10 },
  scale: { url: new URL('./scale.js', import.meta.url).href, title: 'How small is a cell?', needsWebGL: false, aspect: 16 / 7 },
  cell3d: { url: new URL('./cell3d.js', import.meta.url).href, title: 'An animal cell', needsWebGL: true, aspect: 16 / 10, narrowAspect: 1 },
  dna3d: { url: new URL('./dna3d.js', import.meta.url).href, title: 'The double helix', needsWebGL: true, aspect: 16 / 9, narrowAspect: 3 / 4 },
  energy: { url: new URL('./energy.js', import.meta.url).href, title: 'Energy flows, matter cycles', needsWebGL: false, aspect: 16 / 9 },
  tree: { url: new URL('./tree.js', import.meta.url).href, title: 'The tree of life', needsWebGL: false, aspect: 16 / 10 },
  pasteur: { url: new URL('./pasteur.js', import.meta.url).href, title: 'Pasteur\'s swan-neck flasks', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 3 },

  // Chapter 2, The chemistry of life
  soup: { url: new URL('./soup.js', import.meta.url).href, title: 'What a drop is made of', needsWebGL: false, aspect: 21 / 9, narrowAspect: 4 / 5 },
  bondlab: { url: new URL('./bondlab.js', import.meta.url).href, title: 'Two atoms and a meter', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  water3d: { url: new URL('./water3d.js', import.meta.url).href, title: 'One molecule and the four it holds', needsWebGL: true, aspect: 16 / 10, narrowAspect: 1 },
  waterprops: { url: new URL('./waterprops.js', import.meta.url).href, title: 'Four properties, one cause', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  phlab: { url: new URL('./phlab.js', import.meta.url).href, title: 'Add acid to water, and to blood', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  carbonkit: { url: new URL('./carbonkit.js', import.meta.url).href, title: 'Build a skeleton', needsWebGL: false, aspect: 16 / 10, narrowAspect: 4 / 5 },
  polymer: { url: new URL('./polymer.js', import.meta.url).href, title: 'One reaction, and its reverse', needsWebGL: false, aspect: 16 / 7, narrowAspect: 4 / 3 },
  foldlab: { url: new URL('./foldlab.js', import.meta.url).href, title: 'Write a sequence, fold it', needsWebGL: false, aspect: 16 / 10, narrowAspect: 4 / 5 },

  // Chapter 3, Cells
  microscopes: { url: new URL('./microscopes.js', import.meta.url).href, title: 'Four instruments, one specimen', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  'surface-volume': { url: new URL('./surface-volume.js', import.meta.url).href, title: 'Why cells are small', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  prokaryote: { url: new URL('./prokaryote.js', import.meta.url).href, title: 'A prokaryotic cell', needsWebGL: false, aspect: 16 / 10, narrowAspect: 4 / 5 },
  secretion: { url: new URL('./secretion.js', import.meta.url).href, title: 'One protein, ribosome to outside', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  symbiont: { url: new URL('./symbiont.js', import.meta.url).href, title: 'The evidence for endosymbiosis', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  cytoskeleton: { url: new URL('./cytoskeleton.js', import.meta.url).href, title: 'Motors on tracks', needsWebGL: false, aspect: 16 / 7, narrowAspect: 3 / 4 },
  cilium: { url: new URL('./cilium.js', import.meta.url).href, title: 'The 9+2 axoneme', needsWebGL: true, aspect: 16 / 10, narrowAspect: 1 },
  plantcell3d: { url: new URL('./plantcell3d.js', import.meta.url).href, title: 'A plant cell', needsWebGL: true, aspect: 16 / 10, narrowAspect: 1 },

  // Chapter 4, Membranes and transport. Registered from the chapter's brief
  // (biology/ch04-membranes-and-transport/FIGURES.md, the table at its head) before the modules exist, so
  // that eight figure workers can start at once without eight edits to this one file, and so that
  // `npm run figure -- <kind>`, `npm run drive` and `tools/check-content.js` have something to address —
  // the order the second book's three kinds below were added in, for the same reason.
  //
  // While a module is missing, `npm run unit` is red on the first registered kind that has no file
  // (`test/registry.test.js`, "every registered kind has a module exporting meta and mount"). That red is
  // true and is the point of the test: the frame may not promise a figure that does not exist. It reports
  // ONE kind at a time, because the assertion throws inside the loop, so it is not a count of what is
  // left. The gate goes green when the eighth module lands, and no commit that touches code can be made
  // until it does.
  //
  // `aspect` and `narrowAspect` are the brief's, not invented here. Three of these carry a real second
  // composition for a phone rather than a scaled-down first one — `permeability` (a nine-item species
  // list, three sliders and a log flux bar cannot share a 390 px stage), `transport-lab` (a curve bending
  // over is unreadable in a 90 px column, so the three lanes stack and the graph moves below them) and
  // `gradient-battery` (the bars, voltmeter and energy panel move into one column under the cell, and the
  // trace that shows the delay after the pump is blocked keeps full width). The other five shrink
  // honestly, and each says in the brief what it re-stacks.
  bilayer: { url: new URL('./bilayer.js', import.meta.url).href, title: 'Let go, and watch a membrane happen', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  membrane3d: { url: new URL('./membrane3d.js', import.meta.url).href, title: 'A patch of membrane, turned over and set running', needsWebGL: true, aspect: 16 / 10, narrowAspect: 1 },
  permeability: { url: new URL('./permeability.js', import.meta.url).href, title: 'One species at a time, against a bare bilayer', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  osmometer: { url: new URL('./osmometer.js', import.meta.url).href, title: 'The same two solutions, three times over', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  'transport-lab': { url: new URL('./transport-lab.js', import.meta.url).href, title: 'Two designs, one graph', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  pump: { url: new URL('./pump.js', import.meta.url).href, title: 'One cycle at a time, and what it costs', needsWebGL: false, aspect: 16 / 10, narrowAspect: 4 / 5 },
  'gradient-battery': { url: new URL('./gradient-battery.js', import.meta.url).href, title: 'The battery charged, and spent', needsWebGL: false, aspect: 16 / 10, narrowAspect: 3 / 4 },
  'bulk-transport': { url: new URL('./bulk-transport.js', import.meta.url).href, title: 'Four ways to move what will not fit', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },

  // Chapter 5, Energy and metabolism. Registered from the chapter's brief
  // (biology/ch05-energy-and-metabolism/FIGURES.md, the table at its head) before the modules exist, for
  // the reason chapter 4's block above gives: eight figure workers start at once instead of eight edits
  // landing on this one file, and `npm run figure -- <kind>`, `npm run drive` and tools/check-content.js
  // have something to address while they write. `test/registry.test.js` is red until the eighth module
  // lands, and it names ONE missing kind at a time because the assertion throws inside its loop.
  //
  // The titles are the brief's own headline phrases, word for word, because a title here is the figure's
  // `aria-label` and the text of its placeholder before the module loads — it is a name a screen reader
  // reads aloud, not a caption.
  //
  // `aspect` and `narrowAspect` are the brief's. Five carry a real second composition for a phone rather
  // than a scaled-down first one — `free-energy`, `activation-barrier`, `enzyme-kinetics`,
  // `feedback-pathway` and `metabolic-map` — and each of the five draws a graph or a many-node map beside
  // a scene, which is the shape that never survives a 390 px stage. The other three shrink honestly and
  // say in the brief what they re-stack. `atp3d` is the chapter's only WebGL figure and so
  // `npm run sweep3d`'s only chapter-5 entry.
  'entropy-ledger': { url: new URL('./entropy-ledger.js', import.meta.url).href, title: 'Order costs, and the bill is visible', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  'free-energy': { url: new URL('./free-energy.js', import.meta.url).href, title: 'Which way does it go, and why that is not fixed', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  atp3d: { url: new URL('./atp3d.js', import.meta.url).href, title: 'The molecule, split and accounted for', needsWebGL: true, aspect: 16 / 10, narrowAspect: 1 },
  'coupling-bench': { url: new URL('./coupling-bench.js', import.meta.url).href, title: 'Couple it, or merely put it nearby', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  'activation-barrier': { url: new URL('./activation-barrier.js', import.meta.url).href, title: 'The barrier moves; the two ends do not', needsWebGL: false, aspect: 16 / 9, narrowAspect: 4 / 5 },
  'enzyme-kinetics': { url: new URL('./enzyme-kinetics.js', import.meta.url).href, title: 'Sweep it yourself, then try to beat the inhibitor', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  'feedback-pathway': { url: new URL('./feedback-pathway.js', import.meta.url).href, title: 'A loop, and what happens when you cut it', needsWebGL: false, aspect: 16 / 10, narrowAspect: 3 / 4 },
  'metabolic-map': { url: new URL('./metabolic-map.js', import.meta.url).href, title: 'The hourglass, and the ladder under it', needsWebGL: false, aspect: 16 / 10, narrowAspect: 4 / 5 },

  // Chapter 6, Photosynthesis, in figure order. Each `aspect` and `narrowAspect` is the brief's
  // (biology/ch06-photosynthesis/FIGURES.md, the table at its head). The four were written in parallel and
  // registered apart to keep their branches off one another's lines; the landing put them back together.
  //
  // Figure 6.1. The title is the brief's headline. Below 800 px it carries a real second composition, one
  // chart at a time with the other drawn faintly behind it.
  'pigment-spectra': { url: new URL('./pigment-spectra.js', import.meta.url).href, title: 'What is absorbed, and what it drives', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  // Figure 6.2. The title is the brief's headline. Below 800 px it carries a real second composition, the
  // two climbs stacked.
  zscheme: { url: new URL('./zscheme.js', import.meta.url).href, title: 'Fire the photons yourself', needsWebGL: false, aspect: 16 / 10, narrowAspect: 3 / 4 },
  // Figure 6.3. A ring is the one shape that wants a square, so on a phone the stage is square and the
  // ledger goes beneath the ring as rows.
  'calvin-cycle': { url: new URL('./calvin-cycle.js', import.meta.url).href, title: 'The cycle with its books open', needsWebGL: false, aspect: 16 / 10, narrowAspect: 1 },
  // Figure 6.4. It carries a genuine second composition, because a site drawn beside a four-row table does
  // not survive a 390 px stage.
  'rubisco-fork': { url: new URL('./rubisco-fork.js', import.meta.url).href, title: 'One site, two gases, four steps of arithmetic', needsWebGL: false, aspect: 16 / 9, narrowAspect: 3 / 4 },
  // Figure 7.4. Below a 720 px stage the drawing turns a quarter into one tall column, at 2 / 3 rather
  // than the brief's 4 / 5 so the pool's carriers stay discs with a letter on them (see the module header).
  fermentation: { url: new URL('./fermentation.js', import.meta.url).href, title: 'What actually runs out', needsWebGL: false, aspect: 16 / 9, narrowAspect: 2 / 3 },

  // 《资治通鉴》 卷一 周纪一 — the second book. Its figures are about a text and a history, not a
  // specimen: where the three states sat and when, what a character becomes when it joins another, and
  // which year the book chose to begin at. Each was added here by the integration owner from the
  // figure worker's brief so that `npm run figure -- <kind>` and `npm run drive` have something to
  // address while the modules were being written.
  //
  // `narrowAspect` is 2/3 for all three, measured rather than guessed: at a 342 px stage (what a 390 px
  // viewport gives the frame in the lab) the old values left zj-timeline 456 px for 484–501 px of content
  // and zj-words 428 px for 477–577 px, so both clipped. At 2/3 each is 513 px and the content is 511 px,
  // in both themes and with the system Han fallback rather than the book's webfont. One value for all
  // three also means a reader meets one shape three times.
  'zj-split': { url: new URL('./zj-split.js', import.meta.url).href, title: '三家分晋：从灭智到命侯', needsWebGL: false, aspect: 16 / 10, narrowAspect: 2 / 3 },
  'zj-timeline': { url: new URL('./zj-timeline.js', import.meta.url).href, title: '周纪一的年表', needsWebGL: false, aspect: 16 / 9, narrowAspect: 2 / 3 },
  'zj-words': { url: new URL('./zj-words.js', import.meta.url).href, title: '字与词', needsWebGL: false, aspect: 16 / 10, narrowAspect: 2 / 3 },
});

export const KINDS = Object.freeze(Object.keys(FIGURES));

export function figureInfo(kind) {
  const info = FIGURES[kind];
  if (!info) {
    throw new Error(`unknown figure kind "${kind}"; registered kinds are ${KINDS.join(', ')} (src/figures/registry.js)`);
  }
  return info;
}
