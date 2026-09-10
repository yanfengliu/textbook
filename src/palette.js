// The colour tokens as JavaScript, for canvas and WebGL figures. The CSS in styles/tokens.css is the
// same table; keep the two in step. `resolvePalette(theme)` is what the figure frame hands every figure.

export const LIGHT = Object.freeze({
  paper: '#faf7f1',
  paper2: '#f3eee4',
  paper3: '#ebe4d6',
  ink: '#1d1a17',
  inkSoft: '#5c554d',
  inkFaint: '#8a8378',
  rule: '#e3ddd2',
  ruleStrong: '#cfc7b8',
  leaf: '#2f7d4f',
  water: '#2a7f8f',
  coral: '#d9663d',
  violet: '#6b4fa0',
  gold: '#c9a227',
});

export const DARK = Object.freeze({
  paper: '#15171a',
  paper2: '#1c1f23',
  paper3: '#24282d',
  ink: '#e9e4da',
  inkSoft: '#a39d93',
  inkFaint: '#746e66',
  rule: '#2c3036',
  ruleStrong: '#3b4048',
  leaf: '#5fb37f',
  water: '#5cb5c4',
  coral: '#ef8a63',
  violet: '#a58ad8',
  gold: '#e0bc4a',
});

// One colour per organelle, shared by the 2D diagrams and the 3D cell so the reader learns one colour
// per structure across the chapter. `role` is the one-line function the labels show.
export const ORGANELLES = Object.freeze([
  { id: 'membrane', name: 'Plasma membrane', color: '#e8a58a', role: 'A double layer of lipids that separates the cell from its surroundings and controls what enters and leaves.' },
  { id: 'cytoplasm', name: 'Cytoplasm', color: '#f2e8d5', role: 'The watery interior where most of the cell\'s chemistry happens.' },
  { id: 'nucleus', name: 'Nucleus', color: '#6b4fa0', role: 'Holds the DNA behind a double membrane; the cell\'s archive and control room.' },
  { id: 'nucleolus', name: 'Nucleolus', color: '#4a3378', role: 'A dense region inside the nucleus where ribosomes are assembled.' },
  { id: 'chromatin', name: 'Chromatin', color: '#8d74c4', role: 'DNA wound around proteins, filling the nucleus.' },
  { id: 'mitochondrion', name: 'Mitochondrion', color: '#d9663d', role: 'Burns sugar with oxygen to make ATP, the cell\'s energy currency.' },
  { id: 'roughER', name: 'Rough endoplasmic reticulum', color: '#2a7f8f', role: 'Membrane sheets studded with ribosomes, where proteins for export are made and folded.' },
  { id: 'smoothER', name: 'Smooth endoplasmic reticulum', color: '#5cb5c4', role: 'Tubules that make lipids and detoxify chemicals.' },
  { id: 'golgi', name: 'Golgi apparatus', color: '#c9a227', role: 'A stack of flattened sacs that sorts, modifies and ships proteins in vesicles.' },
  { id: 'lysosome', name: 'Lysosome', color: '#b04a7a', role: 'A bag of digestive enzymes that recycles worn-out parts.' },
  { id: 'ribosome', name: 'Ribosome', color: '#5c554d', role: 'A molecular machine that reads messenger RNA and builds proteins.' },
  { id: 'cytoskeleton', name: 'Cytoskeleton', color: '#8a8378', role: 'Protein filaments and tubes that give the cell its shape and move things inside it.' },
  { id: 'centrosome', name: 'Centrosome', color: '#2f7d4f', role: 'A pair of centrioles that organises microtubules and the spindle during division.' },
  { id: 'vesicle', name: 'Vesicle', color: '#e0bc4a', role: 'A small membrane bubble that carries cargo between compartments.' },
  { id: 'peroxisome', name: 'Peroxisome', color: '#7aa83a', role: 'Breaks down fatty acids and neutralises hydrogen peroxide.' },
]);

export const ORGANELLE_BY_ID = Object.freeze(Object.fromEntries(ORGANELLES.map((o) => [o.id, o])));

// The four DNA bases. Colours are fixed across the book: A/T are the warm pair, G/C the cool pair.
export const BASES = Object.freeze({
  A: { name: 'Adenine', color: '#d9663d', pairsWith: 'T' },
  T: { name: 'Thymine', color: '#e0bc4a', pairsWith: 'A' },
  G: { name: 'Guanine', color: '#2a7f8f', pairsWith: 'C' },
  C: { name: 'Cytosine', color: '#6b4fa0', pairsWith: 'G' },
});

export function resolvePalette(theme = 'light') {
  return theme === 'dark' ? DARK : LIGHT;
}

// Read the theme the document is showing right now.
export function currentTheme() {
  if (typeof document === 'undefined') return 'light';
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark' || explicit === 'light') return explicit;
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// '#rrggbb' -> [r, g, b] in 0..1, for WebGL and for mixing.
export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// Mix two hex colours; t = 0 gives a, t = 1 gives b.
export function mix(a, b, t) {
  const A = rgb(a);
  const B = rgb(b);
  const c = A.map((v, i) => Math.round((v + (B[i] - v) * t) * 255));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// 'rgba(r, g, b, alpha)' from a hex colour, for canvas fills.
export function alpha(hex, a) {
  const [r, g, b] = rgb(hex).map((v) => Math.round(v * 255));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
