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
  pasteur: { url: new URL('./pasteur.js', import.meta.url).href, title: 'Pasteur\'s swan-neck flasks', needsWebGL: false, aspect: 16 / 9 },
});

export const KINDS = Object.freeze(Object.keys(FIGURES));

export function figureInfo(kind) {
  const info = FIGURES[kind];
  if (!info) {
    throw new Error(`unknown figure kind "${kind}"; registered kinds are ${KINDS.join(', ')} (src/figures/registry.js)`);
  }
  return info;
}
