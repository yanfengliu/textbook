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
  soup: { url: new URL('./soup.js', import.meta.url).href, title: 'What a drop is made of', needsWebGL: false, aspect: 21 / 9, narrowAspect: 4 / 3 },
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
