// The colour tokens as JavaScript, for canvas and WebGL figures. The CSS in styles/tokens.css is the
// same table; keep the two in step. `resolvePalette(theme)` is what the figure frame hands every figure.

export const LIGHT = Object.freeze({
  paper: '#faf7f1',
  paper2: '#f3eee4',
  paper3: '#ebe4d6',
  ink: '#1d1a17',
  inkSoft: '#5c554d',
  inkFaint: '#6f6960',
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
  inkFaint: '#908a80',
  rule: '#2c3036',
  ruleStrong: '#3b4048',
  leaf: '#5fb37f',
  water: '#5cb5c4',
  coral: '#ef8a63',
  violet: '#a58ad8',
  gold: '#e0bc4a',
});

// The accents pushed towards the ink, as a fraction: the JavaScript side of tokens.css's --leaf-text,
// --water-text, --coral-text and --gold-text, for the canvas and WebGL figures that cannot write a CSS
// expression. `TEXT_MIX.coral` is 0.30 because --coral-text is `color-mix(… var(--coral) 70%, var(--ink))`.
// The two are one recipe in two languages and test/element-table.test.js fails when they drift.
//
// Two jobs, both in tokens.css's own comment: small text on the paper, and a solid fill carrying
// paper-coloured text. The second is the one that matters here — a disc filled with the accent itself and
// a symbol written on it in `paper` cannot read in both themes, because both ends move with the theme and
// in the same direction, and no palette token clears 4.5:1 on coral, water or gold in both. The -text
// value moves WITH the paper, so `paper` on it clears in both at once.
export const TEXT_MIX = Object.freeze({ leaf: 0.14, water: 0.14, coral: 0.30, gold: 0.45 });

// An accent's -text value against a resolved palette: textOn(LIGHT, 'coral') is #a14f32, which is what
// `var(--coral-text)` computes to on a light page. A token with no -text form is returned as it is.
export function textOn(palette, token) {
  const t = TEXT_MIX[token];
  return t === undefined ? palette[token] : mix(palette[token], palette.ink, t);
}

// One colour per organelle, shared by the 2D diagrams and the 3D cell so the reader learns one colour
// per structure across the chapter. `role` is the one-line function the labels show.
//
// `symbolColor` is the colour a symbol written ON the fill takes: the one of `LIGHT.paper` and `LIGHT.ink`
// that holds WCAG AA (4.5:1) against that fill, measured rather than guessed. It is the COLOUR and never
// the name of a palette token, which is the shape `METABOLISM` below settled on and the one that makes the
// mistake unmakeable. A token name over a fixed fill reads right in one theme and inverts in the other —
// `ctx.palette.ink` is #1d1a17 on a light page and #e9e4da on a dark one, while `golgi` stays #c9a227 —
// and that inversion is the shape of every one of the ten defects the 2026-09-16 legibility census found.
// Here `ctx.palette[o.symbolColor]` is undefined by construction, so there is nothing to reach for, and
// test/organelle-table.test.js fails a token name anywhere in this table.
//
// `symbolColor: null` means NEITHER neutral clears 4.5:1 on that fill, so there is no answer: a symbol
// written there needs its own ground — the halo `scale` and `tree` use — or the fill has to move. It is
// not a gap. The test goes red on a null where a neutral would have worked, and red on a stated colour
// that does not clear, so both mistakes are caught. Five fills are null across the two organelle tables,
// measured: chromatin (paper 3.62, ink 4.48) and roughER (paper 4.33, ink 3.74) here, and chloroplast,
// microtubule and intermediateFilament in chapter 3's (src/figures/lib/cell3-colours.js). Nothing writes
// on any of the five today; the null is what stops the first figure that tries from guessing.
export const ORGANELLES = Object.freeze([
  { id: 'membrane', name: 'Plasma membrane', color: '#e8a58a', symbolColor: LIGHT.ink, role: 'A double layer of lipids that separates the cell from its surroundings and controls what enters and leaves.' },
  { id: 'cytoplasm', name: 'Cytoplasm', color: '#f2e8d5', symbolColor: LIGHT.ink, role: 'The watery interior where most of the cell\'s chemistry happens.' },
  { id: 'nucleus', name: 'Nucleus', color: '#6b4fa0', symbolColor: LIGHT.paper, role: 'Holds the DNA behind a double membrane; the cell\'s archive and control room.' },
  { id: 'nucleolus', name: 'Nucleolus', color: '#4a3378', symbolColor: LIGHT.paper, role: 'A dense region inside the nucleus where ribosomes are assembled.' },
  { id: 'chromatin', name: 'Chromatin', color: '#8d74c4', symbolColor: null, role: 'DNA wound around proteins, filling the nucleus.' },
  { id: 'mitochondrion', name: 'Mitochondrion', color: '#d9663d', symbolColor: LIGHT.ink, role: 'Burns sugar with oxygen to make ATP, the cell\'s energy currency.' },
  { id: 'roughER', name: 'Rough endoplasmic reticulum', color: '#2a7f8f', symbolColor: null, role: 'Membrane sheets studded with ribosomes, where proteins for export are made and folded.' },
  { id: 'smoothER', name: 'Smooth endoplasmic reticulum', color: '#5cb5c4', symbolColor: LIGHT.ink, role: 'Tubules that make lipids and detoxify chemicals.' },
  { id: 'golgi', name: 'Golgi apparatus', color: '#c9a227', symbolColor: LIGHT.ink, role: 'A stack of flattened sacs that sorts, modifies and ships proteins in vesicles.' },
  { id: 'lysosome', name: 'Lysosome', color: '#b04a7a', symbolColor: LIGHT.paper, role: 'A bag of digestive enzymes that recycles worn-out parts.' },
  { id: 'ribosome', name: 'Ribosome', color: '#5c554d', symbolColor: LIGHT.paper, role: 'A molecular machine that reads messenger RNA and builds proteins.' },
  { id: 'cytoskeleton', name: 'Cytoskeleton', color: '#8a8378', symbolColor: LIGHT.ink, role: 'Protein filaments and tubes that give the cell its shape and move things inside it.' },
  { id: 'centrosome', name: 'Centrosome', color: '#2f7d4f', symbolColor: LIGHT.paper, role: 'A pair of centrioles that organises microtubules and the spindle during division.' },
  { id: 'vesicle', name: 'Vesicle', color: '#e0bc4a', symbolColor: LIGHT.ink, role: 'A small membrane bubble that carries cargo between compartments.' },
  { id: 'peroxisome', name: 'Peroxisome', color: '#7aa83a', symbolColor: LIGHT.ink, role: 'Breaks down fatty acids and neutralises hydrogen peroxide.' },
]);

export const ORGANELLE_BY_ID = Object.freeze(Object.fromEntries(ORGANELLES.map((o) => [o.id, o])));

// The membrane seen close up: the parts of the sheet itself, the three protein roles that move things
// across it, and the sugar those proteins carry. Chapters 4, 5 and 7 share this table, so a reader learns
// one colour per thing across all three. Same shape as an ORGANELLES entry — { id, name, color, role } —
// plus `symbolColor`, the colour a symbol written ON the fill takes: the one of `LIGHT.paper` and
// `LIGHT.ink` that holds WCAG AA (4.5:1) against it, measured rather than guessed.
//
// **`symbolColor` is a COLOUR and not a token name**, as it is in ORGANELLES above and METABOLISM below,
// and the spelling is the point. This field was `label: 'ink'` until 2026-09-17: a token NAME over a fill
// that is a fixed hex, so a figure resolving it through `ctx.palette` wrote #e9e4da on a mid-tone fill in
// the dark theme, and test/membrane-table.test.js could measure it in the light theme only and said so in
// its own header. Nothing was ever bitten by it — chapter 4's two figure workers were warned by hand —
// but a warning is not a fix and chapter 6's workers will not have had it. With the colour itself here,
// `ctx.palette[part.symbolColor]` is undefined by construction, every ratio holds in BOTH themes, and the
// test fails any field in this table whose value is a palette token name.
//
// **No new hue.** Every colour here is `mix()` of two colours the book already has, as chapter 3's table
// is (src/figures/lib/cell3-colours.js). The five accents were chosen so they stay apart under the common
// colour-vision deficiencies; a sixth, seventh and eighth would break that and the book's coherence with
// it. Chapter 4's brief asked for thirteen additions and these are the eight that name a thing the reader
// must tell from another thing.
//
// **The ions are not here.** Chapter 2 fixed one colour for every ion — `leaf`, with the symbol written
// on it — in the one element table (`ELEMENTS` and `atomColours` in src/figures/lib/chem-atoms.js), so
// that charge and identity are never colour alone. Chapter 4 keeps that: sodium, potassium, chloride and
// calcium are told apart by their symbols and by their ionic radii, both of which that table already
// carries. A hydrogen ion is an ion and takes the same leaf with H⁺ written on it; `ELEMENTS.H` is
// chapter 2's neutral atom, and its pale disc is not the ion, so a figure wanting `atomColours` to hand
// back an ion form is asking for a change to the one element table. Glucose is here rather than with the
// ions because it is not one: it is the cargo, and it takes the book's sugar gold.
//
// **Nothing here enters src/styles/tokens.css.** The two files hold one table between them — the paper,
// the ink and the five accents — and `test/palette.test.js` fails when that table drifts. A derived
// colour written out a second time as a CSS variable would be a second copy no test compares, which is
// how drift starts; a figure sets these from JavaScript, as chapter 3's do.
//
// Separations were measured with the fills these figures put beside each other — the ions, the organelles
// chapter 4 still draws, and each other — under normal vision and under simulated protanopia,
// deuteranopia and tritanopia. Every pair that has to be told apart inside one figure clears dE76 17.8 in
// the worst of the four — that floor is `sugarChain` against `lipidHead`, the chains against the face
// they stand on — except two that are deliberate and are carried by shape instead: `sugarChain`
// and `glucose` (9.7; a sugar chain is a chain of sugars, drawn as a branched thread against a disc), and
// `lipidTail` against `cytoplasm` (12.3; the oily core is bounded by the heads on both sides). Two more
// are recorded rather than fixed, because the pair never shares a figure: `sugarChain` against
// `mitochondrion` (4.2 under deuteranopia) and `glucose` against `golgi` (4.6 under tritanopia, and the
// Golgi is where sugars are put onto proteins, so one gold for both is not a lie).
const MEM = ORGANELLE_BY_ID.membrane.color;

export const MEMBRANE = Object.freeze([
  {
    id: 'lipidHead',
    name: 'Phospholipid head',
    color: mix(MEM, LIGHT.coral, 0.3),
    symbolColor: LIGHT.ink,
    role: 'The phosphate end of a phospholipid, which sits happily in water. It is the membrane colour of the whole-cell figures, one step stronger, because at this magnification the heads are what the reader sees.',
  },
  {
    id: 'lipidTail',
    name: 'Phospholipid tails',
    color: mix(MEM, LIGHT.paper3, 0.45),
    symbolColor: LIGHT.ink,
    role: 'The two hydrocarbon chains that hide from water. Pale, because the core of the sheet is oil and the heads bound it on both sides.',
  },
  {
    id: 'cholesterol',
    name: 'Cholesterol',
    color: mix(MEM, LIGHT.ink, 0.6),
    symbolColor: LIGHT.paper,
    role: 'A short rigid ring wedged between the tails. The lipid colour taken well into the ink, so that a stiff thing reads as stiff among the pale chains.',
  },
  {
    id: 'sugarChain',
    name: 'Sugar chain',
    color: mix(LIGHT.gold, LIGHT.water, 0.2),
    symbolColor: LIGHT.ink,
    role: 'A branched chain of sugars standing on the outer face, and never on the inner one. Gold is already the book\'s sugar, in the bacterial wall and in the sugar chains on a bacterial outer membrane, and it is cooled a little here so a thread of it stands off the warm sheet it grows from.',
  },
  {
    id: 'channel',
    name: 'Channel',
    color: mix(LIGHT.water, LIGHT.paper3, 0.45),
    symbolColor: LIGHT.ink,
    role: 'A protein with a hole through it that lets one kind of thing past and nothing else. The water token opened towards the paper, because a channel is a hole.',
  },
  {
    id: 'carrier',
    name: 'Carrier',
    color: mix(LIGHT.violet, LIGHT.paper3, 0.12),
    symbolColor: LIGHT.paper,
    role: 'A protein that binds what it moves, changes shape, and lets it go on the other side. Violet is already the book\'s protein that moves something, from the motor that walks a filament.',
  },
  {
    id: 'pump',
    name: 'Pump',
    color: mix(LIGHT.violet, LIGHT.ink, 0.4),
    symbolColor: LIGHT.paper,
    role: 'A carrier that spends ATP to move something the way it would not go on its own. The carrier\'s violet, deepened, because it is the same machinery working under load.',
  },
  {
    id: 'glucose',
    name: 'Glucose',
    color: mix(LIGHT.gold, LIGHT.ink, 0.08),
    symbolColor: LIGHT.ink,
    role: 'The sugar a carrier carries and a gradient concentrates. The gold token, one step off the Golgi\'s, so that two things never hold the same value by accident.',
  },
]);

export const MEMBRANE_BY_ID = Object.freeze(Object.fromEntries(MEMBRANE.map((m) => [m.id, m])));

// One lookup, so a figure never carries a colour of its own. `membranePart(id).symbolColor` is the colour
// of a symbol written on the fill — the colour, ready to draw with, not a token to resolve through the
// theme — and `membranePart(id).color` is the fill.
export function membranePart(id) {
  const def = MEMBRANE_BY_ID[id];
  if (!def) {
    throw new Error(`no membrane part "${id}" in MEMBRANE (src/palette.js); ids are ${Object.keys(MEMBRANE_BY_ID).join(', ')}. An ion is not here: it comes from ELEMENTS in src/figures/lib/chem-atoms.js, leaf with its symbol written on it`);
  }
  return def;
}

// What a cell spends, what spends it, and what carries the electrons. Chapters 5, 6 and 7 share this
// table, as 4, 5 and 7 share MEMBRANE above. Same shape as an ORGANELLES entry — { id, name, color, role }
// — plus `symbolColor`, the colour of a symbol written ON the fill.
//
// **`symbolColor` is a COLOUR and not a token name, and that spelling is the point.** MEMBRANE above
// carried `label: 'ink'`, a token name, while its fills are fixed hexes that do not move with the theme;
// a figure resolving that label through `ctx.palette` writes a near-white symbol on a near-white fill in
// dark mode, and the ratios measured for it therefore held in the light theme only. This table's shape is
// the one that answered it, and on 2026-09-17 MEMBRANE and both organelle tables were moved to it. The
// fills here are fixed hexes for the same reason — one colour per thing on both papers — so the symbol
// on them is a
// fixed hex too, taken from `LIGHT` and measured against the fill it sits on. Both sides of every
// measurement below are then fixed, so **every ratio holds in both themes**, which is what MEMBRANE's
// cannot claim. `ctx.palette[part.symbolColor]` is undefined by construction, and
// test/metabolism-table.test.js fails any field in this table whose value is a palette token name, so the
// shape that caused that defect cannot be written here at all.
//
// **No new hue**, as MEMBRANE and chapter 3's table: every colour is `mix()` of colours the book already
// has. Chapter 5's brief (biology/ch05-energy-and-metabolism/FIGURES.md) asked for six values and these
// are the four that name a thing the reader must tell from another thing. The two refusals are written
// out below, because a refusal a later chapter cannot see is one it will make again.
//
// **`phosphate` is refused.** Chapter 2 fixed one colour for phosphorus — `violet`, with the symbol
// written on it in `paper`, 6.04:1 — in the one element table (`ELEMENTS` in
// src/figures/lib/chem-atoms.js), and a transferred phosphate group is a phosphorus atom with its
// oxygens. A second value for it would give one thing two colours across chapters 2 and 5. The element
// table's `label` is a token, so a P disc follows the theme, which a fixed entry here could not do; the
// chapter brief names this as the first of the six to cut, and this is why.
//
// **`adp` is refused**, and by measurement rather than taste. The currency's slot is forced: swept at a
// twentieth over every mix of two palette colours, inside the 2:1 to 7:1 band against the paper that
// holds all five accents (gold 2.26, violet 6.04), exactly one value clears 14 against the crowd §5.4's
// pump scene puts beside the currency — a membrane, three transport proteins, the ions, a microtubule, a
// motor and the fuel. Fourteen is the level the book already sets two things it puts in one frame,
// `nucleus` against `chromatin`. Others clear it outside that band, but they are a near-black or a wash
// and neither is a colour this book owns. There is no room for a second value of the currency: drained
// towards any of the papers or the rules it lands
// 5.7–10.2 from `glucose`, `sugarChain`, `lipidTail` or `leaf`; taken darker it lands 1.4–5.7 from
// `cholesterol`. So ADP is drawn in the currency's own colour with its third phosphate gone — the violet
// P the reader met in chapter 2 — which is what the molecule is, and it makes a figure show the
// difference rather than colour it. The electron carrier keeps two values for the opposite reason: the
// book gives an electron no colour, so a loaded carrier has nothing to be drawn carrying.
//
// Separations were measured against the fills each of the chapter's eight scenes puts in frame, read off
// the brief's own blocks: dE76 in CIE Lab, under normal vision and under protanopia, deuteranopia and
// tritanopia simulated with Machado, Oliveira & Fernandes (2009) at severity 1.0. The instrument was
// checked by re-measuring the five separations MEMBRANE's comment records; it reproduced all five within
// 0.3 (17.8 → 18.1, 9.7 → 9.8, 12.3 → 12.4, 4.2 → 4.3, 4.6 → 4.7). For scale, what the book already
// accepts for two things a reader must tell apart inside one figure: `carrier` against `pump` 18.2,
// `nucleus` against `chromatin` 14.1, `golgi` against `vesicle` 9.3.
//
// Across all 42 pairs a chapter-5 frame holds, the floor is 11.7 — `enzyme` against `water`, the token
// nitrogen takes, under tritanopia. Then `electronCarrier` against `electronCarrierLoaded` at 13.4, which
// is the one pair meant to read as related, and `atp` against `leaf` at 15.0; everything else clears 17.
// The pair §5.8 turns on, `atp` against `electronCarrierLoaded`, is 43.3. Four are recorded rather than
// fixed, because the pair never shares a figure: `enzyme` against `cytoskeleton` (5.3), `electronCarrier`
// against `channel` (5.4), and `electronCarrierLoaded` against `plasmid` (5.3) and `chromatin` (6.6) —
// the DNA of a nucleus and of a bacterium, which no figure in chapters 5 to 7 draws. Chapters 6 and 7 are
// unwritten, so their frames were not measured and are not claimed: whoever draws a membrane with an
// enzyme in it re-measures `enzyme` against `channel` (6.1) first.
//
// On the dark paper the currency is a dark fill (2.43:1 against it) and reads as a rust disc with a
// near-white ATP on it at 6.90:1, which is the symbol doing the work. A figure drawing it small on the
// dark paper gives it an edge.
const currency = mix(LIGHT.coral, LIGHT.ink, 0.45);
const shuttle = mix(LIGHT.violet, LIGHT.paper3, 0.35);

export const METABOLISM = Object.freeze([
  {
    id: 'atp',
    name: 'ATP',
    color: currency,
    symbolColor: LIGHT.paper,
    role: 'The cell\'s energy currency, drawn as a disc with its name on it. ORGANELLES calls the mitochondrion the thing that burns sugar "to make ATP, the cell\'s energy currency", so the currency takes the mitochondrion\'s coral well into the ink — the move `pump` makes on the carrier\'s violet, because it is the same substance under load. ADP is this colour with its third phosphate gone.',
  },
  {
    id: 'enzyme',
    name: 'Enzyme',
    color: mix(LIGHT.leaf, LIGHT.paper3, 0.25),
    symbolColor: LIGHT.ink,
    role: 'A protein that lowers a barrier and is not consumed. It is the large pale fill a substrate, a product and a phosphate are drawn on, so it is far from all three and light enough to carry ink; an enzyme is not a carrier and never takes the carrier\'s violet.',
  },
  {
    id: 'electronCarrier',
    name: 'Electron carrier, empty',
    color: mix(shuttle, LIGHT.paper3, 0.4),
    symbolColor: LIGHT.ink,
    role: 'NAD⁺ or FAD, with nothing on it. The loaded colour drained towards the paper, because an empty carrier is the same molecule waiting.',
  },
  {
    id: 'electronCarrierLoaded',
    name: 'Electron carrier, reduced',
    color: shuttle,
    symbolColor: LIGHT.ink,
    role: 'NADH or FADH₂, carrying a pair of electrons. Violet is the book\'s nucleotide, from phosphorus to the DNA of a nucleus, and these are dinucleotides; it is opened towards the paper so that a carrier never reads as a protein.',
  },
]);

export const METABOLISM_BY_ID = Object.freeze(Object.fromEntries(METABOLISM.map((m) => [m.id, m])));

// One lookup, so a figure never carries a colour of its own. `metabolismPart(id).color` is the fill and
// `.symbolColor` is already a colour: never hand it to `ctx.palette`.
export function metabolismPart(id) {
  const ids = Object.keys(METABOLISM_BY_ID).join(', ');
  if (id === 'adp') {
    throw new Error(`"adp" has no colour of its own: ADP is drawn in the currency's colour, metabolismPart('atp'), with its third phosphate gone — the violet P of ELEMENTS in src/figures/lib/chem-atoms.js. The reason is measured and is written above METABOLISM in src/palette.js. Ids here are ${ids}`);
  }
  if (id === 'phosphate') {
    throw new Error(`"phosphate" has no colour of its own: a phosphate group is a phosphorus atom with its oxygens, and chapter 2 fixed phosphorus as \`violet\` with P written on it in \`paper\` — ELEMENTS.P in src/figures/lib/chem-atoms.js. Ids here are ${ids}`);
  }
  const def = METABOLISM_BY_ID[id];
  if (!def) {
    throw new Error(`no metabolism part "${id}" in METABOLISM (src/palette.js); ids are ${ids}. A membrane part comes from membranePart(id) in this file; an ion comes from ELEMENTS in src/figures/lib/chem-atoms.js, leaf with its symbol written on it`);
  }
  return def;
}

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
