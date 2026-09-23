// Two atoms and a meter. The bench takes two elements, works out what the pair does, and measures what
// it takes to pull them apart — first in air, then in water.
//
// The argument the figure exists to make is the chapter's: the water switch changes nothing about the
// two atoms and changes the answer completely. So the two energy models are kept apart on purpose:
//
//   covalent   a Morse well of depth D (the measured bond dissociation energy) with its minimum at the
//              sum of the covalent radii. Nothing in it refers to the medium, so flooding the bench
//              moves the needle by exactly zero.
//   ionic      the Coulomb energy of a +1 and a -1 ion at the sum of their ionic radii, divided by the
//              relative permittivity of the medium — 1 in air, 78.4 in water. Na+Cl- at 283 pm comes
//              out at 491 kJ/mol in air and 6.3 kJ/mol in water, which is the chapter's "a few".
//   hydrogen   a softer Morse well, 20 kJ/mol deep at 280 pm between two isolated water molecules. In
//              liquid water the same bond has to compete with every other partner a molecule could take
//              instead, so the bench uses 8 kJ/mol there and says why. That 8 is a stated model value,
//              not a measurement: it is the conventional "a few kJ/mol" for a hydrogen bond in water.
//
// The bond snaps when the energy still needed falls to the thermal energy available at 37 C, 2.6 kJ/mol,
// because at that point the jostling finishes the job. That makes `broken` a pure function of the two
// elements, the medium and the separation, so dragging back re-forms it and a screenshot is repeatable.
//
// Two compositions, chosen by a ResizeObserver on the mount: wide puts the two atom cards either side of
// the bench, narrow puts them in a row above it and stacks the bench and the meter underneath. The only
// thing that moves is the grid; one model, one set of controls.
//
// The clock drives one thing: the pair rattles with an amplitude set by how much thermal energy is worth
// against the depth of the well, so a covalent pair is rock steady and an ionic pair in water shakes.
import { el, h, text, C, uid } from './lib/svg.js';
import {
  ELEMENTS, shortOf, gives, bondLengthPm, ionPairPm, bondEnergyKjMol,
  morseRemaining, morseForce, coulombRemaining, coulombForce, COULOMB_KJ_NM,
  THERMAL_KJ_MOL, EPS_WATER, KJ_PER_MOL_NM_TO_PN, mulberry32, clamp,
} from './lib/chem-atoms.js';
import { element } from './lib/mol-draw.js';

export const meta = { kind: 'bondlab', title: 'Two atoms and a meter', needsWebGL: false, aspect: 16 / 9 };

const PICKER = ['H', 'C', 'N', 'O', 'Na', 'Cl'];
const MAX_SEP_PM = 800;
// Atoms are drawn at this fraction of their real radius, ball-and-stick fashion. It was 0.46 when the
// bench was a middle column a third of the frame wide; with the bench across the whole width the same
// fraction made a chloride ion a hundred and fifty pixels across, and the pair read as two balloons.
const DISPLAY_K = 0.34;
const MORSE_A = 20; // nm^-1, the width of a covalent well
const MORSE_A_H = 12; // the hydrogen bond is softer
const HBOND_KJ_AIR = 20;
const HBOND_KJ_WATER = 8;
const HBOND_PM = 280; // O...O in a water dimer
const SHELL_WATERS = 6; // water molecules bound to each freed ion
const E_MIN = 0.3;
const E_MAX = 1200;
const SEED = 20260211;

// The share of a lit sphere's radius that keeps the element's own colour, with the specular highlight
// faded in only beyond it (`lightDefs` below). 0.72 is the symbol's reach, measured rather than guessed:
// the widest symbol drawn on a disc here is a two-letter one on a shell diagram's nucleus, set at
// 0.95 x rNuc with its baseline 0.38 x rNuc below centre, so its ink runs to about 0.57 across and 0.38
// down — 0.69 of the radius at the corner — and 0.72 clears that with the glyph's own antialiased rim
// inside it. A smaller value puts white back under the symbols this exists to keep readable.
const KEEP_R = 0.72;

// Below this stage width the cards move above the bench. Measured: at 560 px the three-column grid gives
// each card 150 px, and the shell diagram's 11 px labels start colliding with the ring dots.
const NARROW_W = 640;

// The one element table's colours, as CSS, through mol-draw's accessor. This was a TOKEN map of its own —
// `{ coral: C.coral, … }` indexed by `ELEMENTS[sym].token` — a third place the element colours lived,
// after lib/chem-atoms.js and lib/mol-draw.js. It read the table faithfully and was wrong anyway: `token`
// is not the colour to draw, `deepen` decides whether the disc takes the token or the token's `-text`
// value, and a map that has never heard of `deepen` drew every O, N and S on the bare accent. `paper` on
// bare coral is 3.32:1 and on bare gold 2.26:1, and `npm run legible` was green on nearly all of them
// because `.bl-sym` is weight 700 and a glyph at 18.66 px or more is judged against WCAG's large-text
// bar of 3:1, which 3.32 clears — one state drew at 18.0 px and failed. The gate was reading a font size.
// test/element-table.test.js now fails any module but those two that reads `.token` or `.outline`.
const fillOf = (sym) => element(sym).fill;
const strokeOf = (sym) => element(sym).stroke;
// The oxygen of a water molecule, for the three vignettes this figure draws by hand rather than through
// fillOf. They wrote `C.coral` as a literal and so were not even reading the table.
const WATER_O = () => element('O').fill;

const SHELL_CAPS = [2, 8, 8];
const Z = { H: 1, C: 6, N: 7, O: 8, Na: 11, Cl: 17 };

function shellCounts(sym) {
  let left = Z[sym];
  const out = [];
  for (const cap of SHELL_CAPS) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    out.push(n);
    left -= n;
  }
  return out;
}

// ---------- the model ----------

// What the pair does, and the well it sits in. Everything the meter reads comes from here.
function classify(left, right, medium) {
  const water = medium === 'water';
  if (left === 'H2O' || right === 'H2O') {
    return {
      bond: 'hydrogen',
      bondOrder: 0,
      deltaEN: Number((ELEMENTS.O.en - ELEMENTS.H.en).toFixed(2)),
      partial: { left: 0.25, right: -0.5 },
      rePm: HBOND_PM,
      depth: water ? HBOND_KJ_WATER : HBOND_KJ_AIR,
      kind: 'morse',
      a: MORSE_A_H,
      note: water
        ? 'In liquid water this bond competes with every other partner either molecule could take, so its net worth is only a few kilojoules per mole. It is made and broken thousands of times a second.'
        : 'A δ+ hydrogen reaching for a δ− oxygen. About 20 kJ/mol between two isolated molecules — a twentieth of the covalent bond inside each of them.',
      name: 'Hydrogen bond',
    };
  }
  const a = ELEMENTS[left];
  const b = ELEMENTS[right];
  const dEN = Number(Math.abs(a.en - b.en).toFixed(2));
  if (a.metal && b.metal) {
    return {
      bond: 'none', bondOrder: 0, deltaEN: dEN, partial: { left: null, right: null },
      rePm: ionPairPm(left, right), depth: 0, kind: 'none',
      note: 'Both of these would rather give an electron away, and neither will take one. Two sodium atoms in a cell do not bond; they drift apart as ions.',
      name: 'No bond',
    };
  }
  if (a.metal || b.metal) {
    const metal = a.metal ? left : right;
    const other = a.metal ? right : left;
    const needs = shortOf(other);
    const ratio = needs > 1 ? `${needs} sodium atoms for each ${ELEMENTS[other].name.toLowerCase()}` : null;
    return {
      bond: 'ionic',
      bondOrder: 0,
      deltaEN: dEN,
      partial: a.metal ? { left: 1, right: -1 } : { left: -1, right: 1 },
      rePm: ionPairPm(metal, other),
      depth: null, // Coulomb has no well depth: the energy is read straight off the separation
      kind: 'coulomb',
      note: water
        ? 'Water turns its negative ends to the positive ion and its positive ends to the negative one. That screening is worth a factor of 78, and what was unbreakable is now worth a few kilojoules per mole.'
        : `One electron moves across. Both atoms end with a full shell and opposite charges, and nothing but distance weakens the attraction.${ratio ? ` The real solid takes ${ratio}.` : ''}`,
      name: 'Ionic bond',
    };
  }
  const order = clamp(Math.min(shortOf(left), shortOf(right)), 1, 3);
  const depth = bondEnergyKjMol(left, right, order);
  const polar = dEN >= 0.4;
  // Pauling's estimate of the ionic character of a bond, used here as the partial charge in units of e.
  const delta = Number((0.16 * dEN + 0.035 * dEN * dEN).toFixed(2));
  const more = a.en >= b.en ? 'left' : 'right';
  return {
    bond: polar ? 'covalent-polar' : 'covalent',
    bondOrder: order,
    deltaEN: dEN,
    partial: polar
      ? { left: more === 'left' ? -delta : delta, right: more === 'left' ? delta : -delta }
      : { left: null, right: null },
    rePm: bondLengthPm(left, right, order),
    depth,
    kind: 'morse',
    a: MORSE_A,
    note: polar
      ? `${ELEMENTS[more === 'left' ? left : right].name} pulls harder on the shared electrons, so it carries a partial negative charge and its partner a partial positive one. The medium makes no difference at all: a shared pair is shared in air and in water.`
      : 'The pull is even, so the shared pair sits in the middle and neither atom carries a charge. Nothing outside the bond can weaken it.',
    name: order === 3 ? 'Triple covalent bond' : order === 2 ? 'Double covalent bond' : polar ? 'Polar covalent bond' : 'Covalent bond',
  };
}

// The energy still needed to take the pair apart from separation r (pm), and the force holding it.
function measure(model, sepPm, medium) {
  const r = sepPm / 1000;
  if (model.kind === 'none') return { energy: 0, force: 0 };
  if (model.kind === 'coulomb') {
    const eps = medium === 'water' ? EPS_WATER : 1;
    return { energy: coulombRemaining(1, r, eps), force: coulombForce(1, r, eps) * KJ_PER_MOL_NM_TO_PN };
  }
  const re = model.rePm / 1000;
  return {
    energy: morseRemaining(model.depth, re, r, model.a),
    force: morseForce(model.depth, re, r, model.a) * KJ_PER_MOL_NM_TO_PN,
  };
}

// The separation at which what is left to pay falls to the thermal energy the cell already has.
function breakPointPm(model, medium) {
  if (model.kind === 'none') return 0;
  if (model.kind === 'coulomb') {
    const eps = medium === 'water' ? EPS_WATER : 1;
    return (COULOMB_KJ_NM / (eps * THERMAL_KJ_MOL)) * 1000;
  }
  const D = model.depth;
  if (D <= THERMAL_KJ_MOL) return model.rePm;
  // D x (2 - x) = thermal, with x = exp(-a (r - re)); take the small root.
  const y = THERMAL_KJ_MOL / D;
  const x = 1 - Math.sqrt(1 - y);
  return model.rePm + (-Math.log(x) / model.a) * 1000;
}

// ---------- drawing helpers ----------

// One arrangement at every width, tightened on a phone rather than rebuilt. The bench is the thing the
// reader uses and it now has the whole width: it was in a middle column with a large static shell
// diagram in a third of the frame on either side of it, which left the subject of the figure as the
// smallest thing in it. Read top to bottom: who is on the bench and what each of them wants, the bench
// itself, the reading, the verdict, the controls.
const CSS = `
.tb-bondlab { position: absolute; inset: 0; display: grid; box-sizing: border-box;
  padding: 0.55rem 0.85rem var(--bl-pad, 3rem); gap: 0.3rem 1rem; font-family: var(--font-ui);
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas: "left right" "bench bench" "meter meter"; }
.tb-bondlab .bl-left { grid-area: left; }
.tb-bondlab .bl-right { grid-area: right; }
.tb-bondlab .bl-bench { grid-area: bench; position: relative; min-width: 0; min-height: 0; outline: none;
  touch-action: pan-y; cursor: ew-resize; user-select: none; -webkit-user-select: none; }
.tb-bondlab .bl-meter { grid-area: meter; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.tb-bondlab .bl-meterbox { position: relative; height: 4.4rem; min-width: 0; }
.tb-bondlab .bl-bench:focus-visible { box-shadow: inset 0 0 0 2px var(--water); border-radius: var(--radius); }
/* Absolute, not 100% high: a percentage height inside an auto-height box resolves to nothing, which is
   how the shell diagrams and the meter came out as empty strips the first time this was drawn. */
.tb-bondlab svg { display: block; position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.tb-bondlab .bl-card { display: flex; flex-direction: row; align-items: center; gap: 0.5rem;
  min-width: 0; min-height: 0; }
/* The right-hand card is the left one mirrored, so the two bracket the bench. It has to come after
   .bl-card or .bl-card's own flex-direction wins on equal specificity, which put the chlorine's shell
   diagram in the middle of the picture. */
.tb-bondlab .bl-card.bl-right { flex-direction: row-reverse; text-align: right; }
.tb-bondlab .bl-card.bl-right .bl-pick { justify-content: flex-end; }
.tb-bondlab .bl-shell { position: relative; flex: 0 0 3.1rem; height: 3.1rem; }
.tb-bondlab .bl-text { min-width: 0; flex: 1 1 auto; }
.tb-bondlab .bl-name { font-family: var(--font-display); font-size: var(--text-base); font-weight: 500;
  color: var(--ink); line-height: 1.1; }
.tb-bondlab .bl-need { font-size: var(--text-xs); color: var(--ink-soft); line-height: 1.32;
  font-variant-numeric: lining-nums tabular-nums; }
/* One row of six, in the order of the periodic table the chapter uses. Two ragged rows of pill buttons
   read as a form; a single strip reads as a set of keys, which is what it is. */
.tb-bondlab .bl-pick { display: flex; gap: 0.2rem; margin-top: 0.28rem; }
.tb-bondlab .bl-pick button { appearance: none; font: inherit; font-family: var(--font-ui);
  font-size: var(--text-xs); font-weight: 500; line-height: 1; color: var(--ink-soft);
  background: transparent; border: 1px solid var(--rule-strong); border-radius: var(--radius);
  padding: 0.22rem 0; width: 1.85rem; cursor: pointer;
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.tb-bondlab .bl-pick button:hover { border-color: var(--ink-faint); color: var(--ink); }
.tb-bondlab .bl-pick button[aria-pressed="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.tb-bondlab .bl-pick button:focus-visible { outline: 2px solid var(--water); outline-offset: 1px; }
.tb-bondlab .bl-verdict { font-size: var(--text-xs); color: var(--ink-soft); line-height: 1.4;
  margin: 0.2rem 0 0; text-wrap: pretty; max-width: 46rem; }
.tb-bondlab .bl-verdict b { color: var(--ink); font-weight: 600; }
.tb-bondlab text { font-family: var(--font-ui); }
.tb-bondlab .bl-sym { font-weight: 700; fill: var(--paper); }
.tb-bondlab .bl-symdark { font-weight: 700; fill: var(--ink); }
/* The measurements are drawn over the bench, and the bench may be full of water. paint-order puts a
   paper-coloured stroke behind the glyphs so a number never has a molecule through the middle of it —
   the map-maker's halo, not a filled box, which at two characters reads as a sticker. */
.tb-bondlab .bl-dim, .tb-bondlab .bl-tick { paint-order: stroke; stroke: var(--paper);
  stroke-width: 3px; stroke-linejoin: round; }
.tb-bondlab .bl-dim { fill: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
/* The delta glyphs are TYPE, so they take the book's text accents (--coral-text, --water-text) and
   never the figure accents: --coral on the paper is 3.32:1 at 10 px and --water 4.33:1, both under
   AA, measured 2026-09-16 by npm run legible. */
.tb-bondlab .bl-glyph { font-weight: 600; paint-order: stroke; stroke: var(--paper); stroke-width: 3px; stroke-linejoin: round; }
/* The halo is not decoration. In the In water scene a delta glyph lands on a neighbouring molecule and on
   the scene's own tinted ground, 80% and 100% of its pixels: 2.13:1 and 4.49:1 measured 2026-09-16. With
   its own paper ground it reads against one colour in both themes. */
.tb-bondlab .bl-plus { fill: var(--coral-text); }
.tb-bondlab .bl-minus { fill: var(--water-text); }
.tb-bondlab .bl-tick { fill: var(--ink-faint); font-variant-numeric: lining-nums tabular-nums; }
.tb-bondlab .bl-big { fill: var(--ink); font-family: var(--font-display); font-weight: 500;
  font-variant-numeric: lining-nums tabular-nums; }
.tb-bondlab .bl-note { fill: var(--ink-soft); font-family: var(--font-ui); font-weight: 400;
  font-variant-numeric: lining-nums tabular-nums; }
/* On a phone each column is 157 px wide, and a strip of six keys beside a shell diagram cannot fit in
   it: the two strips ran into each other. The card turns the other way there — the diagram on top, the
   keys across the whole column under it — which is what the strip needs and what the column has. */
.tb-bondlab.is-narrow { padding-left: 0.6rem; padding-right: 0.6rem; gap: 0.25rem 1.1rem; }
.tb-bondlab.is-narrow .bl-card { flex-direction: column; align-items: flex-start; gap: 0.15rem; }
.tb-bondlab.is-narrow .bl-card.bl-right { flex-direction: column; align-items: flex-end; }
.tb-bondlab.is-narrow .bl-shell { flex: 0 0 2.2rem; height: 2.2rem; width: 2.2rem; }
.tb-bondlab.is-narrow .bl-text { width: 100%; }
.tb-bondlab.is-narrow .bl-name { font-size: var(--text-sm); }
.tb-bondlab.is-narrow .bl-meterbox { height: 4rem; }
.tb-bondlab.is-narrow .bl-pick { gap: 0.14rem; margin-top: 0.2rem; }
.tb-bondlab.is-narrow .bl-pick button { width: auto; flex: 1 1 0; padding: 0.22rem 0; }
`;

// ---------- the figure ----------

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  const rand = mulberry32(SEED);
  let t = ctx.pinnedTime ?? 0;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  let narrow = null;

  let left = 'Na';
  let right = 'Cl';
  let medium = 'air';
  let model = classify(left, right, medium);
  let sepPm = model.rePm;

  // Background water for the flooded bench: a jittered lattice rather than points scattered at random,
  // because random points clump and leave holes and the result reads as confetti, not as a liquid. The
  // jitter is seeded once; how many columns and rows it is laid out on follows the size of the bench,
  // so the density is the same on a phone and on a desktop.
  const bgWater = Array.from({ length: 220 }, () => ({
    jx: (rand() - 0.5) * 0.62,
    jy: (rand() - 0.5) * 0.62,
    rot: rand() * Math.PI * 2,
    f: 0.5 + rand() * 0.9,
    p: rand() * Math.PI * 2,
    // How near the front of the slab this molecule sits: it sets both its size and how strongly it is
    // drawn, so a hundred of them read as a depth of water and not as a pattern of identical dots.
    s: 0.72 + rand() * 0.5,
  }));

  // One water molecule's drawn radius on a bench of this height: the same for the bulk and for a
  // hydration shell, because they are the same molecules. Sizing the shell off the ion's own radius
  // made six water molecules each half the size of the sodium they were surrounding.
  const waterR = (hgt) => Math.max(5, Math.min(11, hgt * 0.046));

  // One circle as a path subpath, so many of them can share a single node.
  const disc = (x, y, r) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(r * 2).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-r * 2).toFixed(1)} 0Z`;

  // ----- DOM -----
  const wrap = h('div', { class: 'tb-bondlab' });
  wrap.append(h('style', { text: CSS }));

  function makeCard(side) {
    const shellHost = h('div', { class: 'bl-shell' });
    const name = h('div', { class: 'bl-name' });
    const need = h('div', { class: 'bl-need' });
    const pick = h('div', { class: 'bl-pick', role: 'group', 'aria-label': `${side === 'left' ? 'Left' : 'Right'} atom` });
    const buttons = new Map();
    for (const sym of PICKER) {
      const b = h('button', {
        type: 'button',
        text: sym,
        'aria-label': `${side === 'left' ? 'Left' : 'Right'} atom: ${ELEMENTS[sym].name.toLowerCase()}`,
        'aria-pressed': 'false',
      });
      b.addEventListener('click', () => setElement(side, sym));
      pick.append(b);
      buttons.set(sym, b);
    }
    const textBox = h('div', { class: 'bl-text' }, [name, need, pick]);
    const card = h('div', { class: `bl-card bl-${side}` }, [shellHost, textBox]);
    return { card, shellHost, name, need, buttons };
  }

  const cardL = makeCard('left');
  const cardR = makeCard('right');
  const bench = h('div', {
    class: 'bl-bench',
    tabindex: 0,
    role: 'application',
    'aria-label': 'The bench: two atoms and the bond between them. Drag either atom away from the other, or use the left and right arrow keys, to stretch the bond; Home puts the pair back.',
  });
  const meterBox = h('div', { class: 'bl-meterbox' });
  const verdict = h('p', { class: 'bl-verdict' });
  const meterHost = h('div', { class: 'bl-meter' }, [meterBox, verdict]);
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' });

  // The accessible name starts with the visible words: an aria-label replaces the text outright, and a
  // label that began "Put a pair of…" made the button unfindable by the name on it.
  const btnPair = h('button', { class: 'fig-btn', type: 'button', text: 'Water pair', 'aria-label': 'Water pair: two water molecules on the bench' });
  btnPair.addEventListener('click', () => {
    left = 'H2O';
    right = 'H2O';
    rebuild(true);
  });
  const btnWater = h('button', { class: 'fig-btn', type: 'button', text: 'In water', 'aria-pressed': 'false' });
  btnWater.addEventListener('click', () => {
    medium = medium === 'water' ? 'air' : 'water';
    btnWater.setAttribute('aria-pressed', String(medium === 'water'));
    rebuild(false);
  });
  const btnReset = h('button', { class: 'fig-btn', type: 'button', text: 'Reset' });
  btnReset.addEventListener('click', () => {
    model = classify(left, right, medium);
    sepPm = model.rePm;
    paint();
  });
  toolbar.append(btnPair, btnWater, btnReset);

  wrap.append(cardL.card, bench, cardR.card, meterHost, toolbar);
  root.append(wrap);

  // ----- the shell diagram -----
  // Below this the inner shells are dropped and only the outer one is drawn. Measured: at a 50 px
  // diagram the eight dots of a full second shell are 1.7 px apart, which is a texture and not a count,
  // and the outer shell is the only one the bench's argument uses.
  const OUTER_ONLY = 78;

  function paintShell(host, sym, size) {
    host.replaceChildren();
    const s = Math.max(30, size);
    const svg = el('svg', { viewBox: `0 0 ${s} ${s}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
    const cx = s / 2;
    const cy = s / 2;
    svg.append(lightDefs());
    if (sym === 'H2O') {
      // Not an atom: a water molecule, shown at the same size as a shell diagram would be.
      const R = s * 0.2;
      const d = R * 1.05;
      const half = (104.5 / 2) * (Math.PI / 180);
      for (const k of [-1, 1]) {
        const a = k * half;
        svg.append(sphere(cx + Math.sin(a) * d, cy - Math.cos(a) * d + R * 0.35, R * 0.78, C.paper3, C.ruleStrong, 1));
      }
      svg.append(sphere(cx, cy + R * 0.35, R, WATER_O(), WATER_O(), 0.8));
      svg.append(text(cx, cy + R * 0.35 + R * 0.36, 'O', { anchor: 'middle', class: 'bl-sym', 'font-size': R * 1.05 }));
      host.append(svg);
      return;
    }
    const all = shellCounts(sym);
    const small = s < OUTER_ONLY;
    const counts = small ? [all.at(-1)] : all;
    const rings = counts.length;
    const rMax = s * 0.42;
    const rNuc = s * (small ? 0.22 : 0.13);
    const outerIdx = rings - 1;
    const metal = ELEMENTS[sym].metal;
    for (let i = 0; i < rings; i += 1) {
      const r = rNuc + ((i + 1) / rings) * (rMax - rNuc);
      // The outer shell is the one the whole figure argues about, so it is the one drawn with a rule
      // that can be seen; the inner shells are scaffolding.
      const outer = i === outerIdx;
      svg.append(el('circle', {
        cx, cy, r, fill: 'none', stroke: outer ? C.ruleStrong : C.rule, 'stroke-width': outer ? 1 : 0.8,
      }));
      const cap = small ? SHELL_CAPS.at(-1) : SHELL_CAPS[i];
      const n = counts[i];
      const holes = outer && !metal ? cap - n : 0;
      const total = outer ? n + holes : n;
      const dot = Math.max(small ? 2.4 : 1.6, s * (small ? 0.048 : 0.03));
      for (let k = 0; k < total; k += 1) {
        const a = (k / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (k < n) svg.append(el('circle', { cx: x, cy: y, r: dot, fill: outer ? C.ink : C.soft }));
        else svg.append(el('circle', { cx: x, cy: y, r: dot, fill: C.paper, stroke: C.coral, 'stroke-width': 1, 'stroke-dasharray': '1.5 1.3' }));
      }
    }
    svg.append(sphere(cx, cy, rNuc, fillOf(sym), strokeOf(sym), 1));
    svg.append(text(cx, cy + rNuc * 0.38, sym, {
      anchor: 'middle',
      class: sym === 'H' ? 'bl-symdark' : 'bl-sym',
      'font-size': (rNuc * (sym.length > 1 ? 0.95 : 1.15)).toFixed(1),
    }));
    host.append(svg);
  }

  // ----- the bench -----
  // Every atom in chapter 2 is a lit sphere with the light up and to the left, so the two on the bench
  // are too. The highlight and the shading are white and black gradients rather than mixes of each
  // atom's own colour, so one pair of definitions serves every element and both themes.
  const SPEC = uid('bl-spec');
  const SHADE = uid('bl-shade');
  const KEEP = uid('bl-keep');
  const KEEP_RAMP = uid('bl-keep-ramp');
  function lightDefs() {
    const spec = el('radialGradient', { id: SPEC, cx: '34%', cy: '30%', r: '62%' }, [
      el('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.62' }),
      el('stop', { offset: '0.55', 'stop-color': '#ffffff', 'stop-opacity': '0.16' }),
      el('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }),
    ]);
    const shade = el('radialGradient', { id: SHADE, cx: '36%', cy: '32%', r: '80%' }, [
      el('stop', { offset: '0.45', 'stop-color': '#000000', 'stop-opacity': '0' }),
      el('stop', { offset: '1', 'stop-color': '#000000', 'stop-opacity': '0.30' }),
    ]);
    // The highlight stops before the symbol's box, instead of the symbol fighting it. The disc keeps its
    // own colour out to KEEP_R of its radius and the white is faded in over the ramp beyond that, so the
    // sphere is lit along its upper-left rim and the element's colour reads true where its symbol sits.
    //
    // It is one mask rather than a second gradient because the specular is centred up and to the LEFT of
    // the disc and the ground to protect is centred on the disc: no single radial gradient has both
    // centres, and every attempt to shrink or move the specular instead still bled into the middle.
    // Measured 2026-09-17: the old specular put 28% white over the centre of every disc, and the element
    // fills have no room for it. Nitrogen's own fill gives `paper` 4.68:1; that wash took the pixels
    // under its N to 1.87:1, and the arithmetic says the wash may be at most about 2% white before the
    // pair drops under 4.5:1. So it is not a highlight to soften — it has to stop.
    const ramp = el('radialGradient', { id: KEEP_RAMP, cx: '50%', cy: '50%', r: '50%' }, [
      el('stop', { offset: KEEP_R, 'stop-color': '#000000' }),
      el('stop', { offset: '1', 'stop-color': '#ffffff' }),
    ]);
    // maskContentUnits, so one mask serves every sphere whatever its radius: the rect is the disc's own
    // bounding box and the gradient inside it is that box's circle.
    const keep = el('mask', { id: KEEP, maskContentUnits: 'objectBoundingBox' }, [
      el('rect', { x: '0', y: '0', width: '1', height: '1', fill: `url(#${KEEP_RAMP})` }),
    ]);
    return el('defs', {}, [spec, shade, ramp, keep]);
  }

  function sphere(x, y, r, fill, stroke, strokeWidth = 1.2) {
    return el('g', {}, [
      el('circle', { cx: x, cy: y, r, fill, stroke, 'stroke-width': strokeWidth }),
      el('circle', { cx: x, cy: y, r, fill: `url(#${SHADE})` }),
      el('circle', { cx: x, cy: y, r, fill: `url(#${SPEC})`, mask: `url(#${KEEP})` }),
    ]);
  }

  function benchSvg(w, hgt) {
    const svg = el('svg', { viewBox: `0 0 ${w} ${hgt}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg.append(lightDefs());
    const cx = w / 2;
    // Three bands measured from the top: the pair, the separation, the pull track. On a phone the bench
    // is under 150 px tall and there is only room for two, so the dimension line goes and the track's
    // own handle carries the number.
    const compact = hgt < 210;
    const cy = hgt * (compact ? 0.34 : 0.40);
    const dimY = cy + Math.max(44, hgt * 0.30);
    // The track is the bottom band, not a line hung under the dimension: pinned to the dimension it left
    // a third of a tall bench empty below it.
    const trackY = hgt - (compact ? 30 : 28);
    // Sodium is the largest atom the picker offers; the 1.4 is the room its charge glyph needs beyond
    // its own rim, which at full stretch was hanging over the edge of the bench.
    const widest = 227 * DISPLAY_K * 1.4;
    const pxPerPm = Math.max(0.05, (w / 2 - 8) / (MAX_SEP_PM / 2 + widest));
    const jig = jiggle();
    const shown = clamp(sepPm + jig, model.rePm * 0.55, MAX_SEP_PM + 40);
    const half = (shown / 2) * pxPerPm;
    const broken = sepPm > breakPointPm(model, medium);

    // Flooding the bench has to look like water, not like a grey box with dots on it. The body is a
    // tint with a surface line across the top of it, and the molecules stand on a jittered lattice at a
    // density a liquid has, each turned its own way, so what the reader sees is a wall of water the two
    // atoms are sitting in.
    if (medium === 'water') {
      svg.append(el('rect', { x: 0, y: 0, width: w, height: hgt, rx: 8, fill: C.water, opacity: 0.06 }));
      svg.append(el('line', { x1: 1, y1: 3.5, x2: w - 1, y2: 3.5, stroke: C.water, 'stroke-width': 1.6, opacity: 0.5 }));
      // A hundred molecules in two paths rather than in nine hundred circles: the bench rebuilds its SVG
      // on every frame that the pair rattles, and a wall of water at that price would be the most
      // expensive thing in the chapter. One path for the oxygens, one for the hydrogens.
      const R = waterR(hgt);
      const cols = clamp(Math.round(w / (R * 4.2)), 6, 24);
      const rows = clamp(Math.round(hgt / (R * 4.2)), 3, 9);
      const half = (104.5 / 2) * (Math.PI / 180);
      // Two depths, four paths: the ones towards the back are smaller and fainter than the ones in
      // front, which is what a slab of liquid looks like and what stops a hundred identical discs from
      // reading as polka dots.
      const d = [[[], []], [[], []]];
      for (let i = 0; i < Math.min(cols * rows, bgWater.length); i += 1) {
        const b = bgWater[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = ((col + 0.5 + (row % 2 ? 0.5 : 0) + b.jx) / cols) * w + Math.sin(t * b.f + b.p) * 2.2;
        const y = ((row + 0.5 + b.jy) / rows) * hgt + Math.cos(t * b.f * 0.8 + b.p) * 2.2;
        if (x < R * 1.8 || x > w - R * 1.8 || y < R * 1.8 || y > hgt - R * 1.8) continue;
        const rot = b.rot + t * 0.25 * (b.f - 0.9);
        const r = R * b.s;
        const near = b.s >= 0.97 ? 1 : 0;
        d[near][0].push(disc(x, y, r * 0.86));
        for (const k of [-1, 1]) {
          const a = rot + k * half;
          d[near][1].push(disc(x + Math.sin(a) * r * 0.95, y - Math.cos(a) * r * 0.95, r * 0.66));
        }
      }
      for (const near of [0, 1]) {
        const g0 = el('g', { opacity: near ? 0.72 : 0.4 });
        // Hydrogen is a paper-coloured atom, and on paper that leaves it invisible: what shows is its
        // outline, so the outline is the ink and not the rule.
        g0.append(el('path', { d: d[near][1].join(' '), fill: C.paper3, stroke: C.faint, 'stroke-width': 0.9 }));
        g0.append(el('path', { d: d[near][0].join(' '), fill: C.coral, stroke: C.coral, 'stroke-width': 0.5 }));
        svg.append(g0);
      }
    }

    const isPair = left === 'H2O';
    const rL = isPair ? 0 : displayRadius(left) * pxPerPm;
    const rR = isPair ? 0 : displayRadius(right) * pxPerPm;
    const xL = cx - half;
    const xR = cx + half;

    // The bond itself, under the atoms so the discs clip it.
    if (!broken && model.bond !== 'none') {
      const stretch = clamp((sepPm - model.rePm) / Math.max(1, breakPointPm(model, medium) - model.rePm), 0, 1);
      if (model.bond === 'ionic') {
        svg.append(el('line', {
          x1: xL, y1: cy, x2: xR, y2: cy, stroke: C.gold, 'stroke-width': 3 - stretch * 1.6,
          'stroke-linecap': 'round', 'stroke-dasharray': `0.1 ${(5 + stretch * 5).toFixed(1)}`,
        }));
      } else if (model.bond === 'hydrogen') {
        // From the donated hydrogen, not from the oxygen behind it: the bond is the reach of that
        // hydrogen for the oxygen opposite.
        const R = Math.min(20, hgt * 0.085);
        svg.append(el('line', {
          x1: xL + R * 1.05, y1: cy, x2: xR - R * 0.95, y2: cy, stroke: C.faint, 'stroke-width': 2.4 - stretch,
          'stroke-linecap': 'round', 'stroke-dasharray': `${(5 - stretch * 2).toFixed(1)} ${(4 + stretch * 4).toFixed(1)}`,
        }));
      } else {
        const n = model.bondOrder;
        const spread = Math.min(7, hgt * 0.028);
        for (let k = 0; k < n; k += 1) {
          const off = (k - (n - 1) / 2) * spread * 2;
          svg.append(el('line', {
            x1: xL, y1: cy + off, x2: xR, y2: cy + off, stroke: C.ink,
            'stroke-width': Math.max(1.4, 3.4 - stretch * 2), 'stroke-linecap': 'round',
          }));
        }
        // The shared pair, drawn where it sits: in the middle for a nonpolar bond, pulled towards the
        // hungrier atom for a polar one.
        const bias = model.partial.left === null ? 0 : -model.partial.left * 1.6;
        const px = cx + bias * half * 0.5;
        for (const k of [-1, 1]) {
          svg.append(el('circle', { cx: px + k * 3.4, cy: cy - Math.min(7, hgt * 0.028) * (n - 1) - 9, r: 2.2, fill: C.ink, opacity: 0.75 }));
        }
      }
    }

    if (isPair) {
      svg.append(waterMolecule(xL, cy, 0.5, Math.min(20, hgt * 0.085), 'donor'));
      svg.append(waterMolecule(xR, cy, -0.5, Math.min(20, hgt * 0.085), 'acceptor'));
    } else {
      drawAtom(svg, xL, cy, left, rL, model.partial.left, broken, -1, waterR(hgt));
      drawAtom(svg, xR, cy, right, rR, model.partial.right, broken, 1, waterR(hgt));
    }

    // The dimension line, set the way a drawing sets one: extension lines down from each atom, a rule
    // between them with end ticks, and the measurement in a break in the middle of the rule rather than
    // hung underneath it, so the number reads as part of the measure.
    const dy = dimY;
    const arm = 4.5;
    if (!compact) {
      const label = `${Math.round(sepPm)} pm`;
      const halfLabel = label.length * 3.4 + 6;
      const room = xR - xL > halfLabel * 2 + 16;
      svg.append(el('path', {
        d: `M${xL} ${cy + (isPair ? 24 : rL) + 6} L${xL} ${dy - arm - 2} M${xR} ${cy + (isPair ? 24 : rR) + 6} L${xR} ${dy - arm - 2}`,
        stroke: C.rule, 'stroke-width': 1,
      }));
      const rule = room
        ? `M${xL} ${dy} L${cx - halfLabel} ${dy} M${cx + halfLabel} ${dy} L${xR} ${dy}`
        : `M${xL} ${dy} L${xR} ${dy}`;
      svg.append(el('path', {
        d: `${rule} M${xL} ${dy - arm} L${xL} ${dy + arm} M${xR} ${dy - arm} L${xR} ${dy + arm}`,
        stroke: C.ruleStrong, 'stroke-width': 1.2,
      }));
      svg.append(text(cx, dy + (room ? 4 : 15), label, { anchor: 'middle', class: 'bl-dim', 'font-size': 11.5 }));
    }
    if (broken) {
      // A break mark where the bond was, and the word beside it. The word alone, floating above the
      // pair, could have belonged to anything on the bench.
      const by = cy;
      svg.append(el('path', {
        d: `M${cx - 9} ${by - 11} L${cx + 3} ${by - 3} L${cx - 3} ${by + 3} L${cx + 9} ${by + 11}`,
        stroke: C.coral, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }));
      svg.append(text(cx, Math.max(13, by - 20), 'snapped', { anchor: 'middle', class: 'bl-glyph bl-plus', 'font-size': 11.5 }));
    }

    // A track from the rest length to the end of the bench, with the rest position, the point where
    // the bond gives way, and where the reader has got to. It says what the drag is for.
    const ty = trackY;
    const tx0 = Math.max(24, w * 0.1);
    const tx1 = w - tx0;
    const T = (pm) => tx0 + (clamp(pm, 0, MAX_SEP_PM) / MAX_SEP_PM) * (tx1 - tx0);
    // A measured rail with the travelled part drawn over it, rather than two fat capsules: the track is
    // a measure, and a measure is a ruled line with its divisions on it. Without the divisions it read
    // as a stray hairline with two words floating near it.
    svg.append(el('line', { x1: tx0, y1: ty, x2: tx1, y2: ty, stroke: C.ruleStrong, 'stroke-width': 1.2 }));
    if (!compact) {
      const ticks = [];
      for (let pm = 0; pm <= MAX_SEP_PM; pm += 200) ticks.push(`M${T(pm).toFixed(1)} ${ty} L${T(pm).toFixed(1)} ${ty + 4}`);
      svg.append(el('path', { d: ticks.join(' '), stroke: C.rule, 'stroke-width': 1 }));
      svg.append(text(tx0, ty - 9, 'drag them apart', { class: 'bl-tick', 'font-size': 10 }));
    }
    svg.append(el('line', { x1: T(model.rePm), y1: ty, x2: T(sepPm), y2: ty, stroke: broken ? C.coral : C.water, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    const brk = breakPointPm(model, medium);
    if (model.kind !== 'none' && brk <= MAX_SEP_PM) {
      svg.append(el('line', { x1: T(brk), y1: ty - 6, x2: T(brk), y2: ty + 6, stroke: C.coral, 'stroke-width': 1.6 }));
      svg.append(text(T(brk), ty + 18, `gives way at ${Math.round(brk)} pm`, {
        anchor: T(brk) > w * 0.7 ? 'end' : 'middle', class: 'bl-tick', 'font-size': 10, fill: C.coral,
      }));
    } else if (model.kind !== 'none') {
      // Above the rail, opposite "drag them apart" — except on a short bench, where the handle carries
      // its own reading up there and the two collided.
      svg.append(text(tx1, compact ? ty + 18 : ty - 9, 'it does not give way on this bench',
        { anchor: 'end', class: 'bl-tick', 'font-size': 10, fill: C.faint }));
    }
    svg.append(el('circle', { cx: T(model.rePm), cy: ty, r: 3, fill: C.leaf }));
    if (!compact) {
      svg.append(text(T(model.rePm), ty - 10, `at rest ${model.rePm} pm`, {
        anchor: T(model.rePm) < w * 0.3 ? 'start' : 'middle', class: 'bl-tick', 'font-size': 10, fill: C.leaf,
      }));
    }
    svg.append(el('circle', { cx: T(sepPm), cy: ty, r: 4.6, fill: C.paper, stroke: broken ? C.coral : C.water, 'stroke-width': 2.2 }));
    if (compact) {
      svg.append(text(T(sepPm), ty - 12, `${Math.round(sepPm)} pm`, {
        anchor: T(sepPm) > w * 0.7 ? 'end' : T(sepPm) < w * 0.3 ? 'start' : 'middle', class: 'bl-dim', 'font-size': 11,
      }));
    }
    return svg;
  }

  // Both atoms of a pair are drawn at the same fraction of their real radius, so their relative sizes
  // are true and an ion visibly shrinks when it gives its electron away. The fraction is capped so that
  // the two surfaces never meet at the resting separation: at DISPLAY_K a carbon and an oxygen 124 pm
  // apart overlap completely and the double bond between them cannot be seen at all.
  function trueRadius(sym) {
    const e = ELEMENTS[sym];
    return model.bond === 'ionic' && e.ionic ? e.ionic : e.vdw;
  }

  function displayK() {
    if (left === 'H2O' || right === 'H2O') return DISPLAY_K;
    const sum = trueRadius(left) + trueRadius(right);
    return Math.min(DISPLAY_K, (0.70 * model.rePm) / sum);
  }

  function displayRadius(sym) {
    return trueRadius(sym) * displayK();
  }

  function drawAtom(svg, x, y, sym, r, charge, broken, side, R) {
    const g = el('g');
    // A freed ion in water picks up its shell: the waters turn their negative ends to a positive ion
    // and their positive ends to a negative one. They are the same molecules as the bulk, drawn at the
    // same size and at full strength, so the ring reads as a shell rather than as six of the crowd —
    // and never as six balloons, which is what scaling them off the ion's own radius produced.
    if (broken && medium === 'water' && model.bond === 'ionic') {
      for (let k = 0; k < SHELL_WATERS; k += 1) {
        const a = (k / SHELL_WATERS) * Math.PI * 2 + side * 0.4 + t * 0.12;
        const d = r + R * 2.1;
        g.append(tinyWater(x + Math.cos(a) * d, y + Math.sin(a) * d, a + (charge > 0 ? Math.PI : 0), R));
      }
    }
    g.append(sphere(x, y, r, fillOf(sym), strokeOf(sym), 1.2));
    const size = Math.max(9, r * (sym.length > 1 ? 0.72 : 0.9));
    g.append(text(x, y + size * 0.35, sym, { anchor: 'middle', class: sym === 'H' ? 'bl-symdark' : 'bl-sym', 'font-size': size.toFixed(1) }));
    // Charge is never colour alone: a full charge is + or −, a partial one δ+ or δ−.
    if (charge !== null && charge !== 0) {
      const glyph = Math.abs(charge) === 1 && model.bond === 'ionic'
        ? (charge > 0 ? '+' : '−')
        : (charge > 0 ? 'δ+' : 'δ−');
      // On a small bench the atom itself is only ten pixels across and a badge on its shoulder covers
      // it, so below that size the charge sits clear above the atom instead.
      const gs = Math.max(8.5, r * 0.46);
      const gx = r < 17 ? x : x + r * 0.80;
      const gy = r < 17 ? y - r - gs * 0.95 : y - r * 0.80;
      g.append(el('circle', { cx: gx, cy: gy, r: gs * 0.84, fill: C.paper, stroke: charge > 0 ? C.coral : C.water, 'stroke-width': 1.3 }));
      g.append(text(gx, gy + gs * 0.34, glyph, {
        anchor: 'middle', class: `bl-glyph ${charge > 0 ? 'bl-plus' : 'bl-minus'}`, 'font-size': gs.toFixed(1),
      }));
    }
    svg.append(g);
  }

  // A water molecule at (x, y) turned so its oxygen points along `rot`; used for the background and the
  // hydration shells. The shell is lit like every other atom in the chapter; the hundred molecules of
  // the bulk are drawn flat, because three circles each is nine hundred nodes rebuilt every frame and a
  // catchlight on something at this size and this opacity is a cost with nothing to show for it.
  function tinyWater(x, y, rot, R, lit = true) {
    const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((rot * 180) / Math.PI).toFixed(1)})` });
    const half = (104.5 / 2) * (Math.PI / 180);
    const disc = (cx, cy, r, fill, stroke, sw) => (lit
      ? sphere(cx, cy, r, fill, stroke, sw)
      : el('circle', { cx, cy, r, fill, stroke, 'stroke-width': sw }));
    for (const k of [-1, 1]) {
      const a = k * half;
      g.append(disc(Math.sin(a) * R * 0.95, -Math.cos(a) * R * 0.95, R * 0.66, C.paper3, C.ruleStrong, 0.7));
    }
    g.append(disc(0, 0, R * 0.86, WATER_O(), WATER_O(), 0.5));
    return g;
  }

  // The two molecules of the water pair, drawn large enough to show which end faces which.
  function waterMolecule(x, y, face, R, role) {
    const g = el('g');
    const half = (104.5 / 2) * (Math.PI / 180);
    // The donor turns one hydrogen towards the partner; the acceptor turns its oxygen.
    const base = role === 'donor' ? Math.PI / 2 - half : -Math.PI / 2;
    const dir = face > 0 ? 1 : -1;
    for (const k of [-1, 1]) {
      const a = base * dir + k * half * dir;
      const hx = x + Math.sin(a) * R * 1.05;
      const hy = y - Math.cos(a) * R * 1.05;
      g.append(el('circle', { cx: hx, cy: hy, r: R * 0.7, fill: C.paper3, stroke: C.ruleStrong, 'stroke-width': 1.1 }));
      const gs = Math.max(9, R * 0.5);
      // Along the O->H line, past the hydrogen. Drawn straight up (hy - R * 0.95) it sat ON the
      // oxygen disc whenever the donor turned a hydrogen sideways, and coral on coral is 1.00:1.
      g.append(text(hx + Math.sin(a) * R * 0.85, hy - Math.cos(a) * R * 0.85 + gs * 0.35, 'δ+', { anchor: 'middle', class: 'bl-glyph bl-plus', 'font-size': gs.toFixed(1) }));
    }
    g.append(el('circle', { cx: x, cy: y, r: R * 0.92, fill: WATER_O(), stroke: WATER_O(), 'stroke-width': 0.8 }));
    g.append(text(x, y + R * 0.34, 'O', { anchor: 'middle', class: 'bl-sym', 'font-size': (R * 0.9).toFixed(1) }));
    g.append(text(x, y + R * 1.05 + Math.max(11, R * 0.6), 'δ−', { anchor: 'middle', class: 'bl-glyph bl-minus', 'font-size': Math.max(9, R * 0.5).toFixed(1) }));
    return g;
  }

  // ----- the meter -----
  // An instrument, printed: the reading set large in the book's own display face, a hairline axis with
  // its decades ticked and labelled, the current value drawn as a bar standing on that axis, and the
  // thermal energy marked in gold with a flag. It was a fat teal capsule with 1 · 10 · 100 · 1000 under
  // it, which is the shape of a download.
  function meterSvg(w, hgt) {
    const svg = el('svg', { viewBox: `0 0 ${w} ${hgt}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    const { energy, force } = measure(model, sepPm, medium);
    const broken = sepPm > breakPointPm(model, medium);
    const x0 = 2;
    const x1 = w - 2;
    const axisY = hgt - 14;
    const barH = 7;
    const span = Math.log10(E_MAX / E_MIN);
    const X = (E) => x0 + (Math.log10(Math.max(E, E_MIN) / E_MIN) / span) * (x1 - x0);

    const shownE = energy >= 100 ? String(Math.round(energy)) : energy.toFixed(1);
    const bigSize = narrow ? 17 : 21;
    // The reading: the number and its unit in the display face, the rest of the sentence beside it in
    // the small sans, so the eye lands on the quantity and reads the qualifier after.
    const headY = bigSize * 0.82;
    let big = '';
    let rest = '';
    if (broken) { big = 'apart'; rest = '— nothing left to pay'; }
    else if (model.kind === 'none') { big = 'nothing'; rest = 'to separate'; }
    // At the bottom of the well the net force is zero: you have to pull before anything pulls back.
    else if (force < 0.5) { big = `${shownE} kJ/mol`; rest = 'still to pay · at rest, so nothing is pulling back yet'; }
    else { big = `${shownE} kJ/mol`; rest = `still to pay · ${force >= 100 ? Math.round(force) : force.toFixed(1)} pN pulling back`; }
    // One text element with two spans, so the browser sets the qualifier after the number rather than
    // the figure guessing at the number's width — which it would have to do before the SVG is in the
    // document, where getComputedTextLength answers zero.
    const head = el('text', { x: x0, y: headY, class: 'bl-big', 'font-size': bigSize }, [
      el('tspan', { text: big }),
      el('tspan', { class: 'bl-note', 'font-size': narrow ? 10.5 : 11.5, dx: 8, text: rest }),
    ]);
    svg.append(head);

    // The axis, its decades, and the reading standing on it. The band runs from the thermal mark to the
    // reading rather than from the left end, because the distance between those two is the whole
    // argument: how much more than the jostling is still owed. Filled from zero it was a progress bar,
    // and a progress bar at 89 per cent says nothing about a bond.
    svg.append(el('line', { x1: x0, y1: axisY + 0.5, x2: x1, y2: axisY + 0.5, stroke: C.ruleStrong, 'stroke-width': 1 }));
    const shown = broken ? 0 : energy;
    const xt = X(THERMAL_KJ_MOL);
    if (shown > E_MIN) {
      const above = shown > THERMAL_KJ_MOL;
      const xa = Math.min(xt, X(shown));
      const xb = Math.max(xt, X(shown));
      svg.append(el('rect', {
        x: xa, y: axisY - barH, width: Math.max(1.5, xb - xa), height: barH,
        fill: above ? C.water : C.coral, opacity: 0.85,
      }));
      // The needle: where the reading actually falls, marked so it can be read off the axis.
      const xr = X(shown);
      svg.append(el('path', {
        d: `M${xr.toFixed(1)} ${axisY - barH - 4} L${xr.toFixed(1)} ${axisY + 4}`,
        stroke: above ? C.water : C.coral, 'stroke-width': 1.6,
      }));
    }
    for (const tick of [1, 10, 100, 1000]) {
      const x = X(tick);
      svg.append(el('line', { x1: x, y1: axisY, x2: x, y2: axisY + 4, stroke: C.ruleStrong, 'stroke-width': 1 }));
      svg.append(text(tick === 1000 ? x - 2 : x, axisY + 11, String(tick), { anchor: tick === 1000 ? 'end' : 'middle', class: 'bl-tick', 'font-size': 9.5 }));
    }
    if (!narrow) {
      svg.append(text(x1, headY, 'kJ per mole, logarithmic', { anchor: 'end', class: 'bl-tick', 'font-size': 9.5 }));
    }
    // The thermal mark: a rule with its flag above the axis, because the whole argument of the figure is
    // which side of this line a bond falls on.
    svg.append(el('line', { x1: xt, y1: axisY - barH - 6, x2: xt, y2: axisY + 4, stroke: C.gold, 'stroke-width': 1.6 }));
    svg.append(text(xt + 4, axisY - barH - 8, narrow ? `${THERMAL_KJ_MOL} — the jostling at 37 °C` : `${THERMAL_KJ_MOL} kJ/mol — the jostling at 37 °C`,
      { class: 'bl-tick', 'font-size': 10, fill: C.gold }));
    return svg;
  }

  // ----- state -----
  function jiggle() {
    if (reduced) return 0;
    const { energy } = measure(model, model.rePm, medium);
    const depth = model.kind === 'coulomb' ? energy : model.depth || THERMAL_KJ_MOL;
    const amp = 42 * clamp(Math.sqrt(THERMAL_KJ_MOL / Math.max(depth, THERMAL_KJ_MOL)), 0, 1);
    return amp * (0.62 * Math.sin(t * 7.1) + 0.38 * Math.sin(t * 11.7 + 1.1));
  }

  function setElement(side, sym) {
    if (left === 'H2O' || right === 'H2O') { left = side === 'left' ? sym : 'O'; right = side === 'right' ? sym : 'O'; }
    if (side === 'left') left = sym;
    else right = sym;
    rebuild(true);
  }

  // `reseat` puts the pair back at rest: choosing a new element must not leave the old separation, but
  // flipping the medium must, because the whole point is that the same pair at the same distance now
  // reads a different number.
  function rebuild(reseat) {
    model = classify(left, right, medium);
    if (reseat) sepPm = model.rePm;
    paint();
  }

  const NEED_TEXT = (sym) => {
    if (sym === 'H2O') return ['Water', 'a molecule, not an atom'];
    const e = ELEMENTS[sym];
    const n = shortOf(sym);
    const g = gives(sym);
    const outer = shellCounts(sym).at(-1);
    const wants = g ? `gives ${g === 1 ? 'it' : `${g}`} away` : n ? `needs ${n} more` : 'full already';
    return [
      `${e.name} · ${sym}`,
      // One line on a phone, where every line the two cards take comes off the bench below them.
      narrow ? `${outer} outer · ${wants}` : `${outer} outer ${outer === 1 ? 'electron' : 'electrons'}\n${wants}`,
    ];
  };

  function paintCard(card, sym) {
    const [name, need] = NEED_TEXT(sym);
    card.name.textContent = name;
    card.need.replaceChildren();
    need.split('\n').forEach((line, i) => {
      if (i) card.need.append(document.createElement('br'));
      card.need.append(document.createTextNode(line));
    });
    const box = card.shellHost.getBoundingClientRect();
    const size = Math.max(34, Math.round(Math.min(box.width || 56, box.height || 56)));
    paintShell(card.shellHost, sym, Math.min(size, 130));
    for (const [s, b] of card.buttons) b.setAttribute('aria-pressed', String(s === sym));
  }

  function paint() {
    const bw = Math.max(80, Math.round(bench.clientWidth));
    const bh = Math.max(70, Math.round(bench.clientHeight));
    bench.replaceChildren(benchSvg(bw, bh));
    const mw = Math.max(120, Math.round(meterBox.clientWidth));
    const mh = Math.max(48, Math.round(meterBox.clientHeight));
    meterBox.replaceChildren(meterSvg(mw, mh));
    paintCard(cardL, left);
    paintCard(cardR, right);
    const broken = sepPm > breakPointPm(model, medium);
    const hydration = broken && medium === 'water' && model.bond === 'ionic' ? SHELL_WATERS : 0;
    verdict.replaceChildren();
    const b = h('b', { text: `${model.name}${model.bondOrder ? ` · order ${model.bondOrder}` : ''} · in ${medium === 'water' ? 'water' : 'air'}. ` });
    verdict.append(b, document.createTextNode(
      hydration
        ? `${model.note} Each freed ion now carries a shell of about ${hydration} water molecules.`
        : model.note,
    ));
  }

  // ----- input -----
  let drag = null;
  function pmPerPx() {
    const bw = Math.max(80, bench.clientWidth);
    const widest = 227 * DISPLAY_K * 1.4;
    const pxPerPm = Math.max(0.05, (bw / 2 - 8) / (MAX_SEP_PM / 2 + widest));
    return 1 / pxPerPm;
  }

  bench.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const r = bench.getBoundingClientRect();
    const side = e.clientX - r.left < r.width / 2 ? -1 : 1;
    drag = { x: e.clientX, sep: sepPm, side };
    bench.setPointerCapture(e.pointerId);
    bench.focus({ preventScroll: true });
  });
  bench.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const d = (e.clientX - drag.x) * drag.side * 2 * pmPerPx();
    setSep(drag.sep + d);
  });
  const endDrag = (e) => { if (drag) { drag = null; bench.releasePointerCapture?.(e.pointerId); } };
  bench.addEventListener('pointerup', endDrag);
  bench.addEventListener('pointercancel', endDrag);

  function setSep(next) {
    sepPm = clamp(Math.round(next), Math.round(model.rePm * 0.62), MAX_SEP_PM);
    paint();
  }

  bench.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 25 : 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setSep(sepPm + step); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setSep(sepPm - step); }
    else if (e.key === 'Home') { e.preventDefault(); setSep(model.rePm); }
    else if (e.key === 'End') { e.preventDefault(); setSep(MAX_SEP_PM); }
  });

  // ----- clock: the rattle, and nothing else -----
  // The rattle is the only thing that moves, and a bond deep enough not to rattle is not worth rebuilding
  // forty SVG nodes a frame for: a covalent pair stands still, which is the point being made.
  function frame() {
    raf = 0;
    if (destroyed || !visible || reduced || ctx.pinnedTime !== null) return;
    const now = performance.now();
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    if (Math.abs(jiggle()) > 0.8 || Math.abs(lastJiggle) > 0.8) {
      lastJiggle = jiggle();
      bench.replaceChildren(benchSvg(Math.max(80, bench.clientWidth), Math.max(70, bench.clientHeight)));
    }
    raf = requestAnimationFrame(frame);
  }
  let lastJiggle = 0;
  function schedule() {
    if (raf || destroyed || !visible || reduced || ctx.pinnedTime !== null) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  // ----- layout -----
  let padPx = 0;
  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    if (!w) return false;
    const wantNarrow = w < NARROW_W;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 28;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--bl-pad', `${pad}px`);
    }
    return true;
  }

  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    if (!applyLayout()) return;
    paint();
    if (!ready) { ready = true; ctx.onReady(); }
  });
  observer.observe(root);
  observer.observe(toolbar);
  observer.observe(bench);
  if (applyLayout()) {
    paint();
    ready = true;
    ctx.onReady();
  }
  schedule();

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      root.replaceChildren();
    },
    setTime(seconds) {
      t = Number(seconds) || 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      paint();
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setTheme() { paint(); },
    describe() {
      const { energy, force } = measure(model, sepPm, medium);
      const broken = sepPm > breakPointPm(model, medium);
      return {
        left,
        right,
        leftValence: left === 'H2O' ? 0 : shellCounts(left).at(-1),
        rightValence: right === 'H2O' ? 0 : shellCounts(right).at(-1),
        leftNeeds: left === 'H2O' ? 0 : shortOf(left),
        rightNeeds: right === 'H2O' ? 0 : shortOf(right),
        bond: model.bond,
        bondOrder: model.bondOrder,
        deltaEN: model.deltaEN,
        partialCharges: { left: model.partial.left, right: model.partial.right },
        medium,
        separationPm: sepPm,
        energyKjMol: Number((broken ? 0 : energy).toFixed(1)),
        thermalKjMol: THERMAL_KJ_MOL,
        broken,
        hydrationShell: broken && medium === 'water' && model.bond === 'ionic' ? SHELL_WATERS : 0,
        forcePn: Number((broken ? 0 : force).toFixed(1)),
        restPm: model.rePm,
        layout: narrow ? 'narrow' : 'wide',
      };
    },
  };
}
