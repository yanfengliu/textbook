// One reaction, and its reverse. Two partners on a bench with the atoms that will move picked out.
// Run it forwards and a hydroxyl leaves one partner, a hydrogen leaves the other, the two combine into
// a water that drifts away and the new bond forms. Run it backwards and a water arrives, splits across
// the bond and puts the pieces back. The family switch changes the partners — two glucoses by a
// glycosidic bond, two amino acids by a peptide bond, glycerol and fatty acids by ester bonds — without
// changing the reaction, which is the point of the section.
//
// Two compositions, chosen by a ResizeObserver on the mount:
//   wide   — the full structures side by side, the water forming between them, the chain below;
//   narrow — each partner becomes a named block and ONLY the atoms that move are drawn, at a size that
//            can be read. The registered narrowAspect is 4/3, so on a 390 px phone the stage is about
//            342 x 256: landscape, and after the toolbar there is about 170 px of drawing left. The
//            full structures there would render their atom labels near four device pixels, and
//            stacking the two (which the brief suggests) halves the scale again rather than saving it,
//            because height is what is short. So the narrow arrangement keeps the hydroxyl, the
//            hydrogen, the bridge and the water at full size and abbreviates everything else — the
//            reader is watching which atoms leave, and those are the atoms it keeps.
// Both panes are authored in the stage's own device pixels, so a 10 px label is 10 device pixels.
//
// THE STATE is four numbers and nothing else: the family, how many units are joined, which of the four
// stops of the current reaction the reader has reached (0 apart, 1 hydroxyl off, 2 water assembled,
// 3 bond made), and the clock. Everything drawn is a function of those, so setTime(t) reproduces a
// frame exactly and a screenshot is the same frame every run. `pos` eases between stops; setTime and
// reduced motion finish it at once, which is what makes the transition a cut rather than a tween.
//
// THE CHEMISTRY. The hydroxyl always leaves the partner whose carbon ends up in the new bond, and the
// hydrogen always leaves the atom that becomes the bridge, so neither partner loses a whole water of
// its own — the caption's point. Sugar: glucose 1's C1 hydroxyl goes, glucose 2's C4 oxygen keeps its
// place as the bridge. Peptide: the carboxyl of one amino acid gives the hydroxyl, the amino group of
// the next gives a hydrogen, and the bond is C–N. Fat: each fatty acid's carboxyl gives the hydroxyl
// and one of glycerol's three hydroxyls gives a hydrogen, so a fat costs three waters and is not a
// polymer — there is no repeating unit, only three tails on one backbone.
import { el, h, text, C, tint, clamp } from './lib/svg.js';
import { atom, bond, round, CC_BOND_PM, readoutCss, readoutTable, fitRows, focusMark, INK } from './lib/mol-draw.js';

export const meta = { kind: 'polymer', title: 'One reaction, and its reverse', needsWebGL: false, aspect: 16 / 7 };

const STEP_MS = 320; // one stop to the next
const PLAY_MS = 620; // one stop to the next while the reaction is playing
const MAX_UNITS = { sugar: 6, peptide: 6, fat: 3 };
const NARROW_W = 660;
const NARROW_H = 300;

// ---------------------------------------------------------------- the families

const FAMILIES = {
  sugar: {
    id: 'sugar', bondName: 'glycosidic', label: 'Two glucoses', short: 'Sugar', tag: 'glucose',
    a: { name: 'glucose 1', gives: 'the —OH from C1', short: 'gives the —OH' },
    b: { name: 'glucose 2', gives: 'an H from the C4 —OH', short: 'gives an H' },
    donates: { hydroxylFrom: 'glucose 1', hydrogenFrom: 'glucose 2' },
    ohSide: 'a',
    product: 'maltose, then a chain of glucose',
  },
  peptide: {
    id: 'peptide', bondName: 'peptide', label: 'Two amino acids', short: 'Peptide', tag: 'amino acid',
    a: { name: 'glycine', gives: 'the —OH from its carboxyl', short: 'gives the —OH' },
    b: { name: 'alanine', gives: 'an H from its amino group', short: 'gives an H' },
    donates: { hydroxylFrom: 'glycine', hydrogenFrom: 'alanine' },
    ohSide: 'a',
    product: 'a dipeptide, then a polypeptide',
  },
  fat: {
    id: 'fat', bondName: 'ester', label: 'Glycerol + fatty acid', short: 'Fat', tag: 'ester',
    a: { name: 'glycerol', gives: 'an H from one —OH', short: 'gives an H' },
    b: { name: 'fatty acid', gives: 'the —OH from its carboxyl', short: 'gives the —OH' },
    donates: { hydroxylFrom: 'fatty acid', hydrogenFrom: 'glycerol' },
    ohSide: 'b',
    product: 'a triglyceride: three tails, three waters',
  },
};

// ---------------------------------------------------------------- the partners, in local units
//
// Each builder returns { g, oh, h, carbon, bridge, w, hgt }: the drawing, and the world-space anchors
// the reaction needs. `oh` is the hydroxyl that leaves whole (its O and its H), `h` the lone hydrogen
// that leaves, `carbon` the atom the new bond starts from and `bridge` the atom it ends on.
// The two are then placed by the layout, which is the only thing that knows the stage's size.

const R = 40; // glucose ring radius
const A_H = 3.4; // hydrogen radius
const A_C = 5.2; // carbon radius
const A_O = 5.0;

function hexPoint(i) {
  const deg = [-60, 0, 60, 120, 180, -120][i];
  const a = (deg * Math.PI) / 180;
  return [R * Math.cos(a), R * Math.sin(a)];
}

// Glucose as a Haworth ring: ring oxygen at the top right, C1 at the right, C4 at the left, and the
// anomeric hydroxyl drawn below the ring for alpha and above it for beta, which is the only difference
// between starch and cellulose.
// No builder ever draws the atoms that leave: the bench draws those, because their position is a
// function of how far through the reaction the reader is. A builder only says where they start.
function glucose({ role, form }) {
  const g = el('g');
  const ringO = hexPoint(0);
  const c1 = hexPoint(1);
  const c2 = hexPoint(2);
  const c3 = hexPoint(3);
  const c4 = hexPoint(4);
  const c5 = hexPoint(5);
  const ring = [ringO, c1, c2, c3, c4, c5];
  for (let i = 0; i < 6; i += 1) {
    const p = ring[i];
    const q = ring[(i + 1) % 6];
    g.append(bond(p[0], p[1], q[0], q[1], 1, { width: 2.3 }));
  }
  // substituents that never move
  const stub = (from, dx, dy, sym, withH, hDx, hDy) => {
    const x = from[0] + dx;
    const y = from[1] + dy;
    g.append(bond(from[0], from[1], x, y, 1, { width: 1.8 }));
    if (withH) {
      g.append(bond(x, y, x + hDx, y + hDy, 1, { width: 1.6 }));
      g.append(atom(x + hDx, y + hDy, 'H', A_H, { label: false }));
    }
    g.append(atom(x, y, sym, A_O));
  };
  stub(c2, 12, 26, 'O', true, 13, 9);
  stub(c3, -12, 26, 'O', true, -13, 9);
  // the CH2OH arm on C5
  const armC = [c5[0] - 6, c5[1] - 26];
  g.append(bond(c5[0], c5[1], armC[0], armC[1], 1, { width: 1.8 }));
  g.append(bond(armC[0], armC[1], armC[0] + 22, armC[1] - 8, 1, { width: 1.8 }));
  g.append(atom(armC[0] + 22, armC[1] - 8, 'O', A_O));
  g.append(bond(armC[0] + 22, armC[1] - 8, armC[0] + 36, armC[1] - 1, 1, { width: 1.6 }));
  g.append(atom(armC[0] + 36, armC[1] - 1, 'H', A_H, { label: false }));
  g.append(atom(armC[0], armC[1], 'C', A_C));

  // the reaction site
  const anomericDown = form !== 'beta';
  const ohPos = [c1[0] + 26, c1[1] + (anomericDown ? 26 : -26)];
  const ohH = [ohPos[0] + 15, ohPos[1] + (anomericDown ? 8 : -8)];
  const c4o = [c4[0] - 26, c4[1] - 2];
  const c4h = [c4o[0] - 15, c4o[1] + 7];

  let out;
  if (role === 'oh') {
    // this partner gives the whole C1 hydroxyl away
    g.append(bond(c4[0], c4[1], c4o[0], c4o[1], 1, { width: 1.8 }));
    g.append(bond(c4o[0], c4o[1], c4h[0], c4h[1], 1, { width: 1.6 }));
    g.append(atom(c4o[0], c4o[1], 'O', A_O));
    g.append(atom(c4h[0], c4h[1], 'H', A_H, { label: false }));
    out = { carbon: c1, oh: { o: ohPos, h: ohH, from: c1 }, bridge: null, h: null };
  } else {
    // this partner keeps its C4 oxygen as the bridge and gives that oxygen's hydrogen away
    g.append(bond(c1[0], c1[1], ohPos[0], ohPos[1], 1, { width: 1.8 }));
    g.append(bond(ohPos[0], ohPos[1], ohH[0], ohH[1], 1, { width: 1.6 }));
    g.append(atom(ohPos[0], ohPos[1], 'O', A_O));
    g.append(atom(ohH[0], ohH[1], 'H', A_H, { label: false }));
    g.append(bond(c4[0], c4[1], c4o[0], c4o[1], 1, { width: 1.8 }));
    g.append(atom(c4o[0], c4o[1], 'O', A_O));
    out = { carbon: null, oh: null, bridge: c4o, h: { p: c4h, from: c4o } };
  }
  // ring atoms last, so they sit over the bonds
  for (let i = 0; i < 6; i += 1) g.append(atom(ring[i][0], ring[i][1], i === 0 ? 'O' : 'C', i === 0 ? A_O : A_C));
  const num = (p, s, dx, dy) => g.append(text(p[0] + dx, p[1] + dy, s, { anchor: 'middle', class: 'pm-num', 'font-size': 8.6 }));
  num(c1, '1', 8, -8);
  num(c4, '4', -9, -8);
  return { g, ...out, box: [-96, -78, 96, 78] };
}

// An amino acid: amino group at the left, the alpha carbon with its side chain, the carboxyl at the
// right. The side chain is the only thing that differs between the two partners.
function aminoAcid({ role, side }) {
  const g = el('g');
  const n = [-58, 0];
  const ca = [-6, 0];
  const cc = [44, 0];
  const o2 = [44, -34]; // the carbonyl oxygen
  const oh = [92, 18]; // the hydroxyl that can leave
  const ohH = [110, 8];
  const h1 = [-78, -26];
  const h2 = [-78, 26];
  const rGroup = [-6, 40];
  const caH = [-6, -34];

  g.append(bond(n[0], n[1], ca[0], ca[1], 1, { width: 2.2 }));
  g.append(bond(ca[0], ca[1], cc[0], cc[1], 1, { width: 2.2 }));
  g.append(bond(cc[0], cc[1], o2[0], o2[1], 2, { width: 2.2 }));
  g.append(bond(ca[0], ca[1], caH[0], caH[1], 1, { width: 1.6 }));
  g.append(bond(ca[0], ca[1], rGroup[0], rGroup[1], 1, { width: 1.8 }));
  g.append(bond(n[0], n[1], h1[0], h1[1], 1, { width: 1.6 }));

  const out = {};
  if (role === 'oh') {
    g.append(bond(n[0], n[1], h2[0], h2[1], 1, { width: 1.6 }));
    g.append(atom(h2[0], h2[1], 'H', A_H, { label: false }));
    Object.assign(out, { carbon: cc, oh: { o: oh, h: ohH, from: cc }, bridge: null, h: null });
  } else {
    g.append(bond(cc[0], cc[1], oh[0], oh[1], 1, { width: 1.8 }));
    g.append(atom(oh[0], oh[1], 'O', A_O, { charge: null }));
    g.append(bond(oh[0], oh[1], ohH[0], ohH[1], 1, { width: 1.6 }));
    g.append(atom(ohH[0], ohH[1], 'H', A_H, { label: false }));
    Object.assign(out, { carbon: null, oh: null, bridge: n, h: { p: h2, from: n } });
  }
  g.append(atom(o2[0], o2[1], 'O', A_O));
  g.append(atom(caH[0], caH[1], 'H', A_H, { label: false }));
  // 14, not 22: the side chain's name is written ON this disc in --leaf-text, and at 22 that pair is
  // 4.24:1 in the light theme (measured 2026-09-16, npm run legible). Mixed further towards the paper it
  // is 4.73:1, and the ring keeps the full leaf so the disc still reads as a side chain.
  g.append(el('circle', { cx: rGroup[0], cy: rGroup[1], r: 11, fill: tint(C.leaf, 14), stroke: C.leaf, 'stroke-width': 1.4 }));
  g.append(text(rGroup[0], rGroup[1] + 3.6, side, { anchor: 'middle', style: `fill:${INK.leaf}`, 'font-size': 10, 'font-weight': 700 }));
  g.append(atom(cc[0], cc[1], 'C', A_C));
  g.append(atom(ca[0], ca[1], 'C', A_C));
  g.append(atom(n[0], n[1], 'N', A_C));
  g.append(atom(h1[0], h1[1], 'H', A_H, { label: false }));
  return { g, ...out, box: [-120, -50, 124, 58] };
}

// Glycerol: three carbons, three hydroxyls. Which hydroxyl reacts depends on how many tails are on.
function glycerol({ attached }) {
  const g = el('g');
  const cs = [[-34, -38], [-34, 0], [-34, 38]];
  const os = [[8, -38], [8, 0], [8, 38]];
  const hs = [[30, -48], [30, -10], [30, 28]];
  g.append(bond(cs[0][0], cs[0][1], cs[1][0], cs[1][1], 1, { width: 2.2 }));
  g.append(bond(cs[1][0], cs[1][1], cs[2][0], cs[2][1], 1, { width: 2.2 }));
  const free = clamp(attached, 0, 2);
  for (let i = 0; i < 3; i += 1) {
    g.append(bond(cs[i][0], cs[i][1], os[i][0], os[i][1], 1, { width: 1.8 }));
    // the hydroxyl now reacting keeps its hydrogen only in the bench's hands, so it is not drawn here
    if (i >= attached && i !== free) {
      g.append(bond(os[i][0], os[i][1], hs[i][0], hs[i][1], 1, { width: 1.6 }));
      g.append(atom(hs[i][0], hs[i][1], 'H', A_H, { label: false }));
    }
    if (i < attached) {
      // an ester already made: the tail it carries, drawn short
      g.append(bond(os[i][0], os[i][1], os[i][0] + 22, os[i][1] - 7, 1, { width: 2 }));
      g.append(atom(os[i][0] + 22, os[i][1] - 7, 'C', A_C));
    }
    g.append(atom(os[i][0], os[i][1], 'O', A_O));
    g.append(atom(cs[i][0], cs[i][1], 'C', A_C));
    // the hydrogens on the backbone carbons, so the reader can count four bonds
    g.append(bond(cs[i][0], cs[i][1], cs[i][0] - 20, cs[i][1] - 8, 1, { width: 1.5 }));
    g.append(atom(cs[i][0] - 20, cs[i][1] - 8, 'H', A_H, { label: false }));
  }
  return { g, carbon: null, oh: null, bridge: os[free], h: { p: hs[free], from: os[free] }, box: [-70, -62, 46, 62] };
}

// A fatty acid: the carboxyl that reacts at the left, a short saturated tail to the right. The tail is
// drawn short and said to be short; a real one is sixteen or eighteen carbons long.
function fattyAcid() {
  const g = el('g');
  const cc = [-52, 0];
  const o2 = [-52, -34];
  const oh = [-96, 16];
  const ohH = [-114, 6];
  g.append(bond(cc[0], cc[1], o2[0], o2[1], 2, { width: 2.2 }));
  let px = cc[0];
  let py = cc[1];
  for (let i = 0; i < 5; i += 1) {
    const nx = px + 26;
    const ny = i % 2 === 0 ? 20 : 0;
    g.append(bond(px, py, nx, ny, 1, { width: 2.2 }));
    g.append(atom(nx, ny, 'C', A_C));
    // two hydrogens on every tail carbon: this is why a fat has so much to burn
    for (const dy of [-1, 1]) {
      g.append(bond(nx, ny, nx + 3 * dy, ny + 21 * dy, 1, { width: 1.4 }));
      g.append(atom(nx + 3 * dy, ny + 21 * dy, 'H', A_H * 0.92, { label: false }));
    }
    px = nx;
    py = ny;
  }
  g.append(atom(o2[0], o2[1], 'O', A_O));
  g.append(atom(cc[0], cc[1], 'C', A_C));
  return { g, carbon: cc, oh: { o: oh, h: ohH, from: cc }, bridge: null, h: null, box: [-126, -46, 92, 46] };
}

// ---------------------------------------------------------------- style

const CSS = `${readoutCss('.tb-polymer')}
.tb-polymer { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  grid-template-rows: minmax(0, 68fr) minmax(0, 32fr);
  padding: 0.3rem 0.45rem var(--pm-pad, 3rem); row-gap: var(--space-2); font-family: var(--font-ui); }
.tb-polymer .pm-pane { position: relative; min-width: 0; min-height: 0; }
.tb-polymer .pm-pane > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tb-polymer svg text { font-family: var(--font-ui); }
.tb-polymer .pm-name { fill: var(--ink); font-weight: 600; }
.tb-polymer .pm-gives { fill: var(--ink-faint); }
.tb-polymer .pm-num { fill: var(--ink-faint); font-weight: 600; }
.tb-polymer .pm-read { fill: var(--ink); font-variant-numeric: lining-nums tabular-nums; font-weight: 600; }
.tb-polymer .pm-note { fill: var(--ink-faint); }
/* The halo scale, tree and levels use for a label over a drawing. The chain's two end labels take it
   because the strip is short and they are set hard against the heading rule above the chain: measured
   2026-09-17, "N end" was 3.91:1 light and 3.88:1 dark with a third of its glyphs standing on that rule.
   Where nothing is drawn under a label the halo is the stage's own paper and cannot be seen. */
.tb-polymer .pm-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3px; stroke-linejoin: round; }
/* Three groups on one rule: run the reaction, change the chain, choose the partners. */
.tb-polymer .fig-toolbar { justify-content: flex-start; }
.tb-polymer .pm-group { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.tb-polymer .pm-sep { width: 1px; min-height: 1.45rem; align-self: center; margin: 0 var(--space-1);
  background: var(--rule-strong); }
.tb-polymer .pm-primary { background: var(--paper); border-color: var(--rule-head); font-weight: 600; }
.tb-polymer .pm-short { display: none; }
.tb-polymer.is-narrow .pm-long { display: none; }
.tb-polymer.is-narrow .pm-short { display: inline; }
.tb-polymer.is-narrow .pm-sep { display: none; }
.tb-polymer.is-narrow .pm-group { gap: 0.28rem; }
/* The narrow arrangement is one pane, not two: at the registered 4/3 the stage is 342 x 256 on a
   390 px phone, and a second pane would leave the bench under 120 px. The counters move into the
   bench's own bottom line instead. */
.tb-polymer.is-narrow { grid-template-rows: minmax(0, 1fr); }
.tb-polymer.is-narrow .pm-strip { display: none; }
.tb-polymer.is-narrow .fig-btn { padding: 0.24rem 0.45rem; }
.tb-polymer.is-narrow .fig-toolbar { gap: 0.28rem; }
`;

const fmt = (v, dp = 1) => v.toFixed(dp);

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  let destroyed = false;
  let narrow = null;
  let padPx = 0;
  let ready = false;
  let raf = 0;
  let lastFrame = 0;

  // ---- state ----
  let family = 'sugar';
  let sugarForm = 'alpha';
  let units = 1; // monomers in the chain; for a fat, fatty acids attached
  let bonds = 0;
  let step = 0; // 0 apart, 1 hydroxyl off, 2 water assembled, 3 bond made
  let pos = 0; // the drawn interpolation between stops
  let direction = 'idle';
  let watersReleased = 0;
  let watersConsumed = 0;
  let playing = false;
  let playDir = 1;
  let t = ctx.pinnedTime ?? 0;
  let nextStopAt = 0;

  const startUnits = () => (family === 'fat' ? 0 : 1);
  const maxUnits = () => MAX_UNITS[family];

  // ---- DOM ----
  const wrap = h('div', { class: 'tb-polymer' });
  wrap.append(h('style', { text: CSS }));
  const benchSvg = el('svg', { class: 'pm-stage-hit', tabindex: '0', role: 'img', 'aria-label': 'Two partners on a bench. Right arrow runs the reaction one atom at a time, left arrow runs it backwards, space plays and pauses.' });
  const stripSvg = el('svg', { 'aria-hidden': 'true' });
  const benchPane = h('div', { class: 'pm-pane pm-bench' }, [benchSvg]);
  const stripPane = h('div', { class: 'pm-pane pm-strip' }, [stripSvg]);

  const twoLabels = (long, short) => [h('span', { class: 'pm-long', text: long }), h('span', { class: 'pm-short', text: short ?? long })];
  const button = (long, short, aria, onClick, attrs = {}, cls = '') => {
    const node = h('button', { class: `fig-btn ${cls}`.trim(), type: 'button', 'aria-label': aria, ...attrs }, twoLabels(long, short));
    node.addEventListener('click', onClick);
    return node;
  };

  // Accessible names begin with the button's own long label, so the name does not change with the stage
  // width and a recipe can find the control by the words on it.
  const btnBack = button('◀ Back', '◀', 'Back, run the reaction one stop backwards', () => stepBack());
  const btnFwd = button('Step ▶', '▶', 'Step, run the reaction one stop forwards', () => stepForward(), {}, 'pm-primary');
  const btnPlay = button('Play', 'Play', 'Play the reaction', () => setPlaying(!playing));
  const btnAdd = button('Add monomer', '+1', 'Add monomer, join one more unit in a single move', () => addMonomer());
  const btnReset = button('Reset', 'Reset', 'Reset, take the bench back to one unit', () => reset());
  const famBtns = Object.values(FAMILIES).map((f) => button(f.label, f.short, `${f.label}, joined by the ${f.bondName} bond`, () => setFamily(f.id), { 'aria-pressed': String(f.id === family) }));
  // The word joiner after the hyphen keeps a lone "α-" from ending a line, as docs/design/chapter-recipe.md
  // asks of every Greek letter hyphenated to a word. It is in the visible label only: the accessible name is
  // the aria-label, which the polymer recipe in tools/drive.js finds by /Glucose form/.
  const btnForm = button('α-\u2060glucose', 'α', 'Glucose form: alpha or beta', () => toggleForm(), { 'aria-pressed': 'false' });
  const group = (kids) => h('div', { class: 'pm-group' }, kids);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [
    group([btnBack, btnFwd, btnPlay]),
    h('span', { class: 'pm-sep', 'aria-hidden': 'true' }),
    group([btnAdd, btnReset]),
    h('span', { class: 'pm-sep', 'aria-hidden': 'true' }),
    group([...famBtns, btnForm]),
  ]);
  const live = h('span', { class: 'fig-ui', 'aria-live': 'polite', role: 'status' });
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: '0', border: '0', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });

  wrap.append(benchPane, stripPane, toolbar, live);
  root.append(wrap);

  // ---- reader actions ----
  function beginMove() {
    if (reduced || ctx.pinnedTime !== null) pos = step;
  }
  function stepForward() {
    if (step < 3) {
      step += 1;
      direction = 'condensation';
    } else if (units < maxUnits()) {
      units += 1;
      bonds += 1;
      watersReleased += 1;
      step = 0;
      pos = 0;
      direction = 'idle';
    } else {
      announce(`the bench holds ${maxUnits()} units; run it backwards, or press Reset`);
      return;
    }
    beginMove();
    redraw();
    announce();
  }
  function stepBack() {
    if (step > 0) {
      step -= 1;
      direction = 'hydrolysis';
    } else if (bonds > 0) {
      units -= 1;
      bonds -= 1;
      watersConsumed += 1;
      step = 3;
      pos = 3;
      direction = 'hydrolysis';
    } else {
      announce('nothing is joined yet, so there is nothing to take apart');
      return;
    }
    beginMove();
    redraw();
    announce();
  }
  function addMonomer() {
    if (units >= maxUnits()) {
      announce(`the bench holds ${maxUnits()} units`);
      return;
    }
    units += 1;
    bonds += 1;
    watersReleased += 1;
    step = 0;
    pos = 0;
    direction = 'idle';
    redraw();
    announce();
  }
  function reset() {
    setPlaying(false);
    units = startUnits();
    bonds = 0;
    step = 0;
    pos = 0;
    direction = 'idle';
    watersReleased = 0;
    watersConsumed = 0;
    redraw();
    announce();
  }
  function setFamily(id) {
    family = id;
    for (let i = 0; i < famBtns.length; i += 1) famBtns[i].setAttribute('aria-pressed', String(Object.values(FAMILIES)[i].id === family));
    btnForm.disabled = family !== 'sugar';
    btnForm.style.display = family === 'sugar' ? '' : 'none';
    reset();
  }
  function toggleForm() {
    sugarForm = sugarForm === 'alpha' ? 'beta' : 'alpha';
    btnForm.querySelector('.pm-long').textContent = `${sugarForm === 'alpha' ? 'α' : 'β'}-\u2060glucose`;
    btnForm.querySelector('.pm-short').textContent = sugarForm === 'alpha' ? 'α' : 'β';
    btnForm.setAttribute('aria-pressed', String(sugarForm === 'beta'));
    redraw();
    announce();
  }
  function setPlaying(next) {
    playing = next && !reduced && ctx.pinnedTime === null;
    btnPlay.querySelector('.pm-long').textContent = playing ? 'Pause' : 'Play';
    btnPlay.querySelector('.pm-short').textContent = playing ? 'Pause' : 'Play';
    // The accessible name follows the visible one: a button that says Pause and is named "Play the
    // reaction" is a lie to a screen reader, and nothing can find it by the word on it.
    btnPlay.setAttribute('aria-label', playing ? 'Pause the reaction' : 'Play the reaction');
    if (playing) {
      nextStopAt = t + PLAY_MS / 1000;
      schedule();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  function announce(msg) {
    const d = state();
    live.textContent = msg || `${d.units} units, ${d.bonds} ${d.bondName} bonds, ${d.watersReleased} waters released, ${d.watersConsumed} taken in. Stop ${d.step} of 3, ${d.direction}.`;
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stepForward(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stepBack(); }
    else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
  };
  benchSvg.addEventListener('keydown', onKey);

  // ---- derived ----
  function state() {
    const f = FAMILIES[family];
    return {
      family,
      bondName: f.bondName,
      direction,
      step,
      units,
      bonds,
      watersReleased,
      watersConsumed,
      donates: { ...f.donates },
      energyDirection: direction === 'hydrolysis' ? 'downhill' : 'uphill',
      sugarForm: family === 'sugar' ? sugarForm : null,
      chainShape: family === 'sugar' ? (sugarForm === 'alpha' ? 'coiled' : 'straight') : null,
      playing,
      t: round(t, 3),
      layout: narrow ? 'narrow' : 'wide',
    };
  }

  // ---------------------------------------------------------------- the bench

  function buildPartners() {
    const f = FAMILIES[family];
    if (family === 'sugar') {
      return [glucose({ role: f.ohSide === 'a' ? 'oh' : 'h', form: sugarForm }), glucose({ role: f.ohSide === 'a' ? 'h' : 'oh', form: sugarForm })];
    }
    if (family === 'peptide') {
      return [aminoAcid({ role: 'oh', side: 'H' }), aminoAcid({ role: 'h', side: 'CH₃' })];
    }
    return [glycerol({ attached: units }), fattyAcid()];
  }

  // ---------------------------------------------------------------- the narrow bench
  //
  // Not the wide drawing scaled down. At the registered narrowAspect the stage is about 342 x 256 on a
  // 390 px phone, and the full structures there would render their atom labels near four device pixels.
  // So the narrow arrangement draws each partner as a named block and draws ONLY the atoms that move —
  // the hydroxyl, the hydrogen, the bridge and the water — at a size that can be read. The reader is
  // watching which atoms leave, and those are exactly the atoms this arrangement keeps.
  // The box is what the drawing is fitted into, so it covers where the water ENDS UP, not only where it
  // starts: a box drawn round step 0 alone would leave the reaction sitting in the top third all the
  // way through, which is what a box of 142 did.
  const NB = { bw: 118, bh: 50, r: 11, hr: 7.4, mid: 40, box: [-4, -12, 348, 102] };

  function drawNarrowBench(w, hgt) {
    const f = FAMILIES[family];
    // Two lines of counters at the foot, set clear of the pane's bottom edge: the pane ends six pixels
    // above the toolbar, and a baseline three pixels up from it put the descenders on the buttons.
    const footer = 34;
    const bw = NB.box[2] - NB.box[0];
    const bh = NB.box[3] - NB.box[1];
    const s = Math.min(1.4, (w - 8) / bw, Math.max(20, hgt - footer) / bh);
    const ox = (w - bw * s) / 2 - NB.box[0] * s;
    const oy = Math.max(0, (hgt - footer - bh * s) / 2) - NB.box[1] * s;
    const X = (x) => ox + x * s;
    const Y = (y) => oy + y * s;

    const p1 = clamp(pos, 0, 1);
    const p2 = clamp(pos - 1, 0, 1);
    const p3 = clamp(pos - 2, 0, 1);
    // the blocks close on each other as the bond forms, exactly as the full drawing does
    const close = 24 * p3;
    const my = NB.mid;

    const carbon = [118 - close, my];
    const ohO = [150 - close, my];
    const ohH = [150 - close, my + 26];
    const bridge = [196 + close, my];
    const hP = [196 + close, my - 26];
    const meet = [173, my + 40];
    const drift = [173, my + 54];
    const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const at = lerp2(meet, drift, p3);

    const block = (x, title, note) => {
      const y = my - NB.bh / 2;
      const g = el('g');
      g.append(el('rect', { x: fmt(X(x), 1), y: fmt(Y(y), 1), width: fmt(NB.bw * s, 1), height: fmt(NB.bh * s, 1), rx: fmt(10 * s, 1), fill: C.paper2, stroke: C.ruleStrong, 'stroke-width': fmt(1.4 * s, 1) }));
      g.append(text(X(x + NB.bw / 2), Y(y + 21), title, { anchor: 'middle', class: 'pm-name', 'font-size': fmt(Math.max(10, 13 * s), 1) }));
      g.append(text(X(x + NB.bw / 2), Y(y + 37), note, { anchor: 'middle', class: 'pm-gives', 'font-size': fmt(Math.max(9, 10.4 * s), 1) }));
      return g;
    };
    const donorInfo = f.ohSide === 'a' ? f.a : f.b;
    const acceptorInfo = f.ohSide === 'a' ? f.b : f.a;
    benchSvg.append(block(0 - close, donorInfo.name, donorInfo.short));
    benchSvg.append(block(226 + close, acceptorInfo.name, acceptorInfo.short));

    const W = (p) => [X(p[0]), Y(p[1])];
    const r = NB.r * s;
    const hr = NB.hr * s;
    const wO = lerp2(W(ohO), W(at), p1);
    const wH1 = lerp2(W(ohH), [X(at[0] + 26), Y(at[1] + 13)], p1);
    const wH2 = lerp2(W(hP), [X(at[0] - 26), Y(at[1] + 13)], p2);

    if (p3 > 0) {
      const g = el('g', { opacity: fmt(p3, 2) });
      g.append(bond(X(carbon[0]), Y(carbon[1]), X(bridge[0]), Y(bridge[1]), 1, { width: 3.4 * s, colour: C.leaf }));
      g.append(text((X(carbon[0]) + X(bridge[0])) / 2, Y(my) - r - 8, `${f.bondName} bond`, { anchor: 'middle', style: `fill:${INK.leaf}`, 'font-size': fmt(Math.max(9.6, 11 * s), 1), 'font-weight': 600 }));
      benchSvg.append(g);
    }
    const gw = el('g', { opacity: p3 > 0 ? fmt(1 - p3 * 0.5, 2) : '1' });
    if (p1 < 1) gw.append(bond(X(carbon[0]), Y(carbon[1]), wO[0], wO[1], 1, { width: 2.2 * s, colour: C.faint }));
    gw.append(bond(X(bridge[0]), Y(bridge[1]), X(226 + close), Y(my), 1, { width: 2.2 * s }));
    if (p2 < 1) gw.append(bond(X(bridge[0]), Y(bridge[1]), wH2[0], wH2[1], 1, { width: 2 * s, colour: C.faint }));
    gw.append(bond(wO[0], wO[1], wH1[0], wH1[1], 1, { width: 2 * s }));
    if (p2 > 0) gw.append(bond(wO[0], wO[1], wH2[0], wH2[1], 1, { width: 2 * s }));
    gw.append(atom(X(bridge[0]), Y(bridge[1]), family === 'peptide' ? 'N' : 'O', r));
    gw.append(atom(wO[0], wO[1], 'O', r));
    gw.append(atom(wH1[0], wH1[1], 'H', hr, { label: hr >= 4.4 }));
    gw.append(atom(wH2[0], wH2[1], 'H', hr, { label: hr >= 4.4 }));
    if (pos < 2.4) {
      const ring = (p, rr) => el('circle', { cx: fmt(p[0], 1), cy: fmt(p[1], 1), r: fmt(rr, 1), fill: 'none', stroke: C.gold, 'stroke-width': fmt(2 * s, 1), 'stroke-dasharray': '4 3' });
      if (p1 < 1) gw.append(ring(wO, r * 1.9));
      if (p2 < 1) gw.append(ring(wH2, hr * 2.6));
    }
    // Clear of the hydrogen the water just gained, which sits 26 units out on this side.
    if (p2 >= 1 && p3 < 1) gw.append(text(wO[0] + 42 * s, wO[1] + 4, 'H₂O', { fill: C.soft, 'font-size': fmt(Math.max(10, 12 * s), 1), 'font-weight': 600 }));
    benchSvg.append(gw);

    // the counters, folded into this pane because the narrow stage has no room for a second one
    const shape = family === 'sugar' ? (sugarForm === 'alpha' ? ' · α, coils, starch' : ' · β, straight ribbon, cellulose') : '';
    benchSvg.append(text(4, hgt - 21, `units ${units} · bonds ${bonds} · waters out ${watersReleased} · in ${watersConsumed}`, { class: 'pm-read', 'font-size': 10.4 }));
    benchSvg.append(text(4, hgt - 7, `${direction === 'hydrolysis' ? 'hydrolysis: downhill' : 'condensation: uphill'}${shape}`, { class: 'pm-note', 'font-size': 9.8 }));
  }

  function drawBench(w, hgt) {
    benchSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    benchSvg.replaceChildren();
    if (narrow) {
      drawNarrowBench(w, hgt);
      benchSvg.append(focusMark(w, hgt));
      return;
    }
    const f = FAMILIES[family];
    const [pa, pb] = buildPartners();
    const labelH = 26;

    // Place the two partners so that both of their boxes fit, at the largest scale that still does.
    const boxW = (p) => p.box[2] - p.box[0];
    const boxH = (p) => p.box[3] - p.box[1];
    // The two partners meet over this gap and the water assembles in it, so it grows with the stage
    // rather than stopping at seventy pixels on a bench nine hundred wide.
    const gapX = clamp(w * 0.1, 32, 150);
    // 2.1 is a ceiling on how big the atoms are allowed to get, not a fit: past it a six-atom ring on a
    // wide stage reads as a cartoon rather than a molecule.
    const s = Math.min(2.1, (w - 24 - gapX) / (boxW(pa) + boxW(pb)), (hgt - labelH - 14) / Math.max(boxH(pa), boxH(pb)));
    const tw = (boxW(pa) + boxW(pb)) * s + gapX;
    const left = (w - tw) / 2;
    const midY = labelH + (hgt - labelH) / 2;
    const ax = left + (-pa.box[0]) * s;
    const ay = midY;
    const bx = left + boxW(pa) * s + gapX + (-pb.box[0]) * s;
    const by = midY;
    const place = (p, x, y) => {
      p.g.setAttribute('transform', `translate(${fmt(x, 1)} ${fmt(y, 1)}) scale(${s.toFixed(3)})`);
      p.world = (q) => [x + q[0] * s, y + q[1] * s];
    };
    place(pa, ax, ay);
    place(pb, bx, by);

    const donor = f.ohSide === 'a' ? pa : pb;
    const acceptor = f.ohSide === 'a' ? pb : pa;

    // Once the bond forms, the two partners close the gap between them, so the new bond ends up the
    // length of every other bond in the drawing rather than a rule across the bench.
    {
      const c0 = donor.world(donor.carbon);
      const b0 = acceptor.world(acceptor.bridge);
      const dx = b0[0] - c0[0];
      const dy = b0[1] - c0[1];
      const dist = Math.hypot(dx, dy) || 1;
      const shift = (Math.max(0, dist - 30 * s) / 2) * clamp(pos - 2, 0, 1);
      const ux = (dx / dist) * shift;
      const uy = (dy / dist) * shift;
      if (shift > 0.5) {
        const donorIsA = donor === pa;
        place(pa, ax + (donorIsA ? ux : -ux), ay + (donorIsA ? uy : -uy));
        place(pb, bx + (donorIsA ? -ux : ux), by + (donorIsA ? -uy : uy));
      }
    }

    const ohO = donor.world(donor.oh.o);
    const ohH = donor.world(donor.oh.h);
    const ohFrom = donor.world(donor.oh.from);
    const hP = acceptor.world(acceptor.h.p);
    const hFrom = acceptor.world(acceptor.h.from);
    const bridge = acceptor.world(acceptor.bridge);
    const carbon = donor.world(donor.carbon);

    // The three progressions the drawing is made of.
    const p1 = clamp(pos, 0, 1); // the hydroxyl leaves
    const p2 = clamp(pos - 1, 0, 1); // the hydrogen leaves and the water is assembled
    const p3 = clamp(pos - 2, 0, 1); // the bond forms and the water goes

    // where the water assembles: between the two departing atoms, pushed clear of both partners
    const meet = [(ohO[0] + hP[0]) / 2, (ohO[1] + hP[1]) / 2 - (narrow ? 0 : 44)];
    const driftTo = [meet[0] + (narrow ? 58 * s : 0), meet[1] - 46 * s];
    const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const waterAt = lerp2(meet, driftTo, p3);

    benchSvg.append(pa.g, pb.g);

    // the bond that is being made or broken
    if (p3 > 0) {
      const gbond = el('g', { opacity: fmt(p3, 2) });
      gbond.append(bond(carbon[0], carbon[1], bridge[0], bridge[1], 1, { width: 3 * s, colour: C.leaf }));
      benchSvg.append(gbond);
      // Well clear of the bond: at the centre it lands on the two carbon numbers the reader needs.
      const mid = lerp2(carbon, bridge, 0.5);
      if (s > 0.6) benchSvg.append(text(mid[0], mid[1] + 34 * s, `${f.bondName} bond`, { anchor: 'middle', style: `fill:${INK.leaf}`, 'font-size': fmt(Math.max(9.6, 10.5 * s), 1), 'font-weight': 600, opacity: fmt(p3, 2) }));
    }

    // the departing hydroxyl and hydrogen, and the water they become
    const oR = A_O * s * 1.05;
    const hR = A_H * s * 1.05;
    const wO = lerp2(ohO, [waterAt[0], waterAt[1]], p1);
    const wH1 = lerp2(ohH, [waterAt[0] + 15 * s, waterAt[1] + 9 * s], p1);
    const wH2 = lerp2(hP, [waterAt[0] - 15 * s, waterAt[1] + 9 * s], p2);
    const gw = el('g', { opacity: p3 > 0 ? fmt(1 - p3 * 0.55, 2) : '1' });
    if (p1 < 1) gw.append(bond(ohFrom[0], ohFrom[1], wO[0], wO[1], 1, { width: 1.8 * s, colour: C.faint }));
    if (p2 < 1) gw.append(bond(hFrom[0], hFrom[1], wH2[0], wH2[1], 1, { width: 1.6 * s, colour: C.faint }));
    gw.append(bond(wO[0], wO[1], wH1[0], wH1[1], 1, { width: 1.6 * s }));
    if (p2 > 0) gw.append(bond(wO[0], wO[1], wH2[0], wH2[1], 1, { width: 1.6 * s }));
    gw.append(atom(wO[0], wO[1], 'O', oR));
    gw.append(atom(wH1[0], wH1[1], 'H', hR, { label: false }));
    gw.append(atom(wH2[0], wH2[1], 'H', hR, { label: false }));
    // a ring while the atoms are still on their partners, so the reader sees what is about to move
    if (pos < 2.4) {
      const ring = (p, r) => el('circle', { cx: fmt(p[0], 1), cy: fmt(p[1], 1), r: fmt(r, 1), fill: 'none', stroke: C.gold, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      if (p1 < 1) gw.append(ring(ohO, oR * 2.9));
      if (p2 < 1) gw.append(ring(hP, hR * 3.4));
    }
    if (p2 >= 1 && p3 < 1) {
      gw.append(text(waterAt[0], waterAt[1] - oR - 7, 'H₂O', { anchor: 'middle', fill: C.soft, 'font-size': fmt(Math.max(9.6, 11 * s), 1), 'font-weight': 600 }));
    }
    benchSvg.append(gw);

    // names and what each partner gives
    const nameSize = Math.max(10, Math.min(12.5, 12.5 * s));
    const giveSize = Math.max(9, Math.min(10.6, 10.6 * s));
    const caption = (p, cx, top, info) => {
      benchSvg.append(text(cx, top, info.name, { anchor: 'middle', class: 'pm-name', 'font-size': fmt(nameSize, 1) }));
      benchSvg.append(text(cx, top + giveSize + 2.5, info.gives, { anchor: 'middle', class: 'pm-gives', 'font-size': fmt(giveSize, 1) }));
    };
    const aCx = ax + ((pa.box[0] + pa.box[2]) / 2) * s;
    const bCx = bx + ((pb.box[0] + pb.box[2]) / 2) * s;
    caption(pa, aCx, 12, f.a);
    caption(pb, bCx, 12, f.b);

    // the scale the drawing is at, stated
    const barLen = 26 * s;
    const sb = el('g');
    sb.append(el('path', { d: `M${fmt(w - 12 - barLen, 1)} ${fmt(hgt - 6, 1)} L${fmt(w - 12, 1)} ${fmt(hgt - 6, 1)} M${fmt(w - 12 - barLen, 1)} ${fmt(hgt - 9, 1)} L${fmt(w - 12 - barLen, 1)} ${fmt(hgt - 3, 1)} M${fmt(w - 12, 1)} ${fmt(hgt - 9, 1)} L${fmt(w - 12, 1)} ${fmt(hgt - 3, 1)}`, stroke: C.faint, 'stroke-width': 1 }));
    sb.append(text(w - 16 - barLen, hgt - 3, `${CC_BOND_PM} pm`, { anchor: 'end', class: 'pm-note', 'font-size': 9.4 }));
    benchSvg.append(sb);
    benchSvg.append(focusMark(w, hgt));
  }

  // ---------------------------------------------------------------- the chain, counters and energy

  // The strip under the bench: the chain the reaction has built, and the count.
  //
  // It used to be two thirty-pixel hexagons in a dead quadrant with four bordered pills crammed against
  // the right edge, and under them a progress bar carrying its own caption — dark text lying across a
  // coral fill, unreadable, and saying nothing the words alone do not say. The bar is gone, the pills are
  // gone, the count is the same reference table the chapter's other three benches print, and the chain
  // is sized from the room it has and centred in it, so few units read as a large diagram rather than as
  // a small one pushed into a corner.
  function drawStrip(w, hgt) {
    stripSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    stripSvg.replaceChildren();
    const f = FAMILIES[family];
    const down = direction === 'hydrolysis';
    const n = Math.max(units, 0);

    const tableW = clamp(w * 0.25, 150, 240);
    const tableX = w - tableW - 2;
    const rows = [
      ['units', String(n)],
      ['bonds', String(bonds)],
      ['waters released', String(watersReleased)],
      ['waters taken in', String(watersConsumed)],
      ['stop', `${step} of 3`],
      {
        note: down ? 'hydrolysis ↓ downhill in water' : 'condensation ↑ uphill: it must be paid for',
        colour: down ? INK.leaf : INK.coral, size: 10.2,
      },
    ];
    const opts = { title: 'The count', size: 10.4, titleSize: 9.2 };
    const { rowH } = fitRows(rows, hgt - 4, opts, 14, 26);
    readoutTable(stripSvg, rows, { ...opts, x: tableX, y: 1, width: tableW, rowH, size: clamp(rowH * 0.52, 10, 11.2) });

    // The chain, under one heading line: the name of the block at the left, what it is on its way to
    // becoming at the right, and a rule under both. On one line rather than two because height is what
    // this strip is short of, and height is what the chain needs.
    const left = 2;
    const chainRight = tableX - 26;
    const chainW = Math.max(60, chainRight - left);
    stripSvg.append(text(left, 9.2, 'The chain so far', { class: 'mol-rt-title', 'font-size': 9.2 }));
    stripSvg.append(text(chainRight, 9.4, f.product, { anchor: 'end', class: 'pm-note', 'font-size': 10.2 }));
    stripSvg.append(el('line', { x1: left, y1: 14, x2: fmt(chainRight, 1), y2: 14, stroke: C.ruleStrong }));

    const footNote = family === 'sugar'
      ? (sugarForm === 'alpha' ? 'α links · the chain coils · starch' : 'β links · every second unit flips · a straight ribbon · cellulose')
      : null;
    const top = 19;
    const bot = hgt - (footNote ? 15 : 3);
    const boxH = Math.max(26, bot - top);
    const cy = top + boxH / 2;
    const g = el('g');

    if (family === 'fat') {
      // glycerol with up to three tails: no repeating unit, so this one is not a polymer
      const sp = clamp(boxH * 0.32, 12, 30);
      const gx = left + 30;
      const seg = Math.max(8, Math.min(44, (chainW - 70) / 8));
      g.append(el('line', { x1: fmt(gx, 1), y1: fmt(cy - sp, 1), x2: fmt(gx, 1), y2: fmt(cy + sp, 1), stroke: C.ink, 'stroke-width': 2.6 }));
      [-1, 0, 1].forEach((row, i) => {
        const y = cy + row * sp;
        g.append(el('circle', { cx: fmt(gx, 1), cy: fmt(y, 1), r: 5.5, fill: C.soft }));
        if (i < n) {
          let d = `M${fmt(gx, 1)} ${fmt(y, 1)}`;
          for (let k = 1; k <= 8; k += 1) d += ` L${fmt(gx + k * seg, 1)} ${fmt(y + (k % 2 ? -6 : 6), 1)}`;
          g.append(el('path', { d, fill: 'none', stroke: C.gold, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
        }
      });
      g.append(text(gx, cy + sp + 17, 'glycerol', { anchor: 'middle', class: 'pm-note', 'font-size': 9.6 }));
    } else if (family === 'sugar') {
      const coiled = sugarForm === 'alpha';
      // Sized from the units actually on the bench, with a floor of three, so one glucose is a diagram
      // and six are a chain; the block is then centred, and an empty right half becomes a margin instead
      // of a hole.
      const r = clamp(Math.min(boxH * 0.42, (chainW - 20) / (Math.max(n, 3) * 2.55)), 9, 32);
      const stepX = r * 2.5;
      const total = Math.max(0, n - 1) * stepX + r * 2;
      const x0 = left + (chainW - total) / 2 + r;
      const wave = Math.min(r * 0.85, boxH * 0.2);
      for (let i = 0; i < n; i += 1) {
        const x = x0 + i * stepX;
        const y = coiled ? cy + Math.sin(i * 0.95) * wave : cy;
        const flip = !coiled && i % 2 === 1;
        const hexG = el('g', { transform: `translate(${fmt(x, 1)} ${fmt(y, 1)}) rotate(${flip ? 180 : 0})` });
        let d = '';
        for (let k = 0; k < 6; k += 1) {
          const a = ((k * 60 - 60) * Math.PI) / 180;
          d += `${k ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
        }
        hexG.append(el('path', { d: `${d} Z`, fill: tint(C.leaf, flip ? 30 : 18), stroke: C.leaf, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
        if (i > 0) {
          const py = coiled ? cy + Math.sin((i - 1) * 0.95) * wave : cy;
          g.append(el('line', { x1: fmt(x - stepX + r * 0.9, 1), y1: fmt(py, 1), x2: fmt(x - r * 0.9, 1), y2: fmt(y, 1), stroke: C.ink, 'stroke-width': 2.2 }));
        }
        g.append(hexG);
      }
    } else {
      const r = clamp(Math.min(boxH * 0.34, (chainW - 20) / (Math.max(n, 3) * 2.8)), 8, 26);
      const stepX = r * 2.8;
      const rise = Math.min(r * 0.75, boxH * 0.18);
      const total = Math.max(0, n - 1) * stepX + r * 2;
      const x0 = left + (chainW - total) / 2 + r;
      const yAt = (i) => cy + (i % 2 ? rise : -rise);
      for (let i = 0; i < n; i += 1) {
        const x = x0 + i * stepX;
        if (i > 0) g.append(el('line', { x1: fmt(x - stepX, 1), y1: fmt(yAt(i - 1), 1), x2: fmt(x, 1), y2: fmt(yAt(i), 1), stroke: C.ink, 'stroke-width': 2.4 }));
        g.append(el('circle', { cx: fmt(x, 1), cy: fmt(yAt(i), 1), r: fmt(r, 1), fill: tint(C.coral, 26), stroke: C.coral, 'stroke-width': 1.8 }));
      }
      if (n) {
        g.append(text(x0, yAt(0) - r - 6, 'N end', { anchor: 'middle', class: 'pm-note pm-halo', 'font-size': 9.6 }));
        g.append(text(x0 + (n - 1) * stepX, yAt(n - 1) + r + 14, 'C end', { anchor: 'middle', class: 'pm-note pm-halo', 'font-size': 9.6 }));
      }
    }
    stripSvg.append(g);
    if (footNote) stripSvg.append(text(left, hgt - 3, footNote, { class: 'pm-note', 'font-size': 10 }));
  }

  // ---------------------------------------------------------------- layout, clock

  function paneBox(pane) {
    const r = pane.getBoundingClientRect();
    return [Math.max(40, Math.round(r.width)), Math.max(30, Math.round(r.height))];
  }
  function redraw() {
    const [bw, bh] = paneBox(benchPane);
    const [sw, sh] = paneBox(stripPane);
    drawBench(bw, bh);
    drawStrip(sw, sh);
    // A reader action moves `step`; the easing loop that walks `pos` up to it starts here, so nothing
    // has to remember to start it, and nothing runs while the drawing is already where it should be.
    if (Math.abs(pos - step) > 1e-4) schedule();
  }

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const wantNarrow = w < NARROW_W || hgt < NARROW_H;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 18;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--pm-pad', `${pad}px`);
    }
    return true;
  }

  // The clock does two things: it eases `pos` towards the stop the reader has chosen, and while the
  // reaction is playing it chooses the next stop. Both are functions of t, so pinning t pins both.
  function tick(now) {
    raf = 0;
    if (destroyed) return;
    const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    t += dt;
    let changed = false;
    if (playing && t >= nextStopAt) {
      nextStopAt = t + PLAY_MS / 1000;
      if (playDir > 0) {
        if (step === 3 && units >= maxUnits()) playDir = -1;
        else stepForward();
      }
      if (playDir < 0) {
        if (step === 0 && bonds === 0) playDir = 1;
        else stepBack();
      }
      changed = true;
    }
    if (Math.abs(pos - step) > 1e-4) {
      const rate = (dt * 1000) / STEP_MS;
      const d = step - pos;
      pos += Math.sign(d) * Math.min(Math.abs(d), Math.max(rate, 0.004));
      changed = true;
    }
    if (changed) redraw();
    // Rescheduled here rather than through schedule(), which clears lastFrame because it is the cold
    // start. Going through it every frame made every dt zero, so the clock never moved: with the lab
    // unpinned, Play reported playing:true with t stuck at 0 for three seconds and the step tween never
    // ran. Caught by a probe that counted the page's own animation frames beside describe().t.
    if (playing || Math.abs(pos - step) > 1e-4) raf = requestAnimationFrame(tick);
  }
  // Start the loop from idle: the next frame is the first, so it carries no elapsed time.
  function schedule() {
    if (raf || destroyed) return;
    lastFrame = 0;
    raf = requestAnimationFrame(tick);
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    redraw();
    if (!ready) {
      ready = true;
      announce();
      ctx.onReady();
    }
  }

  setFamily('sugar');
  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(toolbar);
  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && ready) redraw(); });
  onResize();

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      benchSvg.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      setPlaying(false);
      t = Math.max(0, Number(seconds) || 0);
      pos = step; // a pinned frame never catches a tween half way
      if (ready) redraw();
    },
    setVisible(v) {
      if (v) { if (playing || Math.abs(pos - step) > 1e-4) schedule(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setTheme() {
      if (ready) redraw();
    },
    describe() {
      return state();
    },
  };
}
