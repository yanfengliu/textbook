// One protein, ribosome to outside. A cutaway of the endomembrane system of a pancreatic acinar cell —
// Palade's own specimen — with one cargo protein travelling through it in eight stages, four lesions the
// reader can apply, and the pulse-chase experiment the route was worked out from.
//
// THE CELL is polarised, because a secretory cell is: the nucleus and the rough ER at the basal end, the
// Golgi in the middle, secretory granules and the plasma membrane at the apical end. It is authored once
// in its own 1000 x 560 space and fitted into whatever pane it is given; when that pane is taller than it
// is wide the cell stands up, apical face to the top, so the journey climbs rather than shrinks.
// The names are not part of the drawing: they are set in screen pixels after the cell is fitted, so a
// label is 10.5 px on a desktop and 10 px on a phone whatever the cell's own scale is.
//
// THE EIGHT STAGES, and what each one does to the cargo:
//   0 cytosol            a free ribosome starts translating, like any other
//   1 signal-recognised  a particle in the cytosol grips the first twenty or so amino acids and pauses
//   2 translocating      the ribosome docks on the ER and the chain threads through a channel
//   3 folding            the signal is cut off, chaperones fold the chain, core sugars are attached
//   4 er-to-golgi        a vesicle buds at an ER exit site and carries it to the cis face
//   5 golgi-processing   the sugars are trimmed and rebuilt across the stack
//   6 sorting            at the trans face it is addressed and packed
//   7 released           the vesicle fuses with the plasma membrane and the contents go outside
//
// THE FOUR LESIONS each strand it somewhere different, which is the same inference Palade made:
//   signal     no signal peptide, so nothing recognises it: it finishes in the cytosol
//   er-exit    vesicles cannot leave, so it piles up in the ER lumen
//   fusion     the vesicle reaches the membrane and cannot fuse, so it waits inside one
//   golgi-tag  the mannose-6-phosphate tag is the address for a LYSOSOME. A secreted protein does not
//              carry one, so disabling the tag does nothing to it — which is itself the lesson, and why
//              this figure carries a cargo switch the brief did not ask for: set the cargo to a
//              lysosomal enzyme and the same lesion sends it out of the cell instead, which is I-cell
//              disease and the sentence §3.4 ends that paragraph with.
//
// THE PULSE-CHASE is Jamieson and Palade's, 1967, on guinea-pig pancreas: a three-minute pulse of
// radioactive leucine, then a chase, with the label over the rough ER at 3 minutes, the Golgi at 7, the
// granules at 37 and discharged by 117. The four curves come from a four-compartment first-order model
// with those time constants, integrated once at mount, and the silver grains scattered over the cell are
// drawn in proportion to the same numbers.
//
// Every frame is a function of the clock: the journey's position is t ÷ 2.2 s per stage, the experiment's
// is t × 5 minutes per second, so setTime(t) reproduces a frame exactly. Under reduced motion Play is a
// cut to the end of the route rather than a run. Seeded generator only.
//
// describe() reports the brief's ten fields plus two the controls need to be gated on: `cargo`
// ('secreted' | 'lysosomal') and `membraneFaces` (the follow-the-membrane overlay).
import { mix, alpha, ORGANELLE_BY_ID } from '../palette.js';
import { h } from './lib/svg.js';
import {
  mulberry32, TAU, clamp, lerp, smoothstep, FONT, fitCanvas, smoothOpen, panelCss,
} from './lib/cell-common.js';

export const meta = { kind: 'secretion', title: 'One protein, ribosome to outside', needsWebGL: false, aspect: 16 / 9 };

const SEED = 30341;
const STAGE_SECONDS = 2.2;
const STAGES = 8;
const JOURNEY_SECONDS = STAGE_SECONDS * (STAGES - 1);
const PULSE_SECONDS = 24; // of clock, covering 120 minutes of experiment
const PULSE_MINUTES = 120;
const PULSE_LENGTH = 3; // minutes of radioactive leucine before the chase

const STAGE_NAMES = ['cytosol', 'signal-recognised', 'translocating', 'folding', 'er-to-golgi', 'golgi-processing', 'sorting', 'released'];
const STAGE_TITLE = ['Cytosol', 'Signal recognised', 'Translocating', 'Folding', 'ER to Golgi', 'Golgi', 'Sorting', 'Released'];
const STAGE_SHORT = ['Cytosol', 'Signal', 'Threading', 'Folding', 'Vesicle', 'Golgi', 'Sorting', 'Out'];
const COMPARTMENTS = ['cytosol', 'cytosol', 'er-lumen', 'er-lumen', 'transport-vesicle', 'golgi', 'secretory-vesicle', 'outside'];
const COMPARTMENT_NAME = {
  cytosol: 'cytosol', 'er-lumen': 'ER lumen', 'transport-vesicle': 'transport vesicle', golgi: 'Golgi',
  'secretory-vesicle': 'secretory vesicle', outside: 'outside the cell', lysosome: 'lysosome',
};
const STAGE_TEXT = [
  'A free ribosome in the cytosol begins translating, exactly as it would for a protein that is staying here.',
  'The first twenty or so amino acids are mostly water-hating: a particle in the cytosol grips them and pauses translation.',
  'The whole ribosome docks on a receptor in the ER membrane and the growing chain threads through a channel into the lumen.',
  'An enzyme clips the signal off. Chaperones fold the chain, quality control checks it, and the first sugar chains go on.',
  'A vesicle buds from a smooth patch of ER — an exit site — and carries the cargo to the receiving face of the Golgi.',
  'Across the stack, enzymes in successive sacs trim the sugars off and build different ones, so it comes out the far side bearing a pattern it did not go in with.',
  'At the shipping face each protein is packed into a vesicle addressed to a destination, and the address is a chemical tag.',
  'The vesicle fuses with the plasma membrane and spills the contents outside. What faced the ER lumen now faces the world.',
];

const MODS = {
  'signal-cleaved': 'signal cleaved',
  folded: 'folded',
  'core-sugars': 'core sugars added',
  'sugars-remodelled': 'sugars remodelled',
  tagged: 'M6P tag added',
  sorted: 'sorted',
  released: 'released',
};

const BLOCKS = ['signal', 'er-exit', 'golgi-tag', 'fusion'];
const BLOCK_LABEL = {
  signal: 'No signal peptide',
  'er-exit': 'No ER exit',
  'golgi-tag': 'No M6P tag',
  fusion: 'No fusion',
};
const BLOCK_SHORT = { signal: 'Signal', 'er-exit': 'ER exit', 'golgi-tag': 'M6P tag', fusion: 'Fusion' };
const BLOCK_WHY = {
  signal: 'With no signal peptide nothing recognises the chain, so it is never taken to the ER: it is finished on a free ribosome and stays in the cytosol.',
  'er-exit': 'Vesicles cannot bud from the ER, so folded, sugared cargo piles up in the lumen behind a door that will not open.',
  'golgi-tag': 'Mannose-6-phosphate is the address for a lysosome. Take it away and a lysosomal enzyme goes out of the cell by the default route instead — which is exactly what happens to children who cannot attach the mark.',
  fusion: 'The secretory vesicle reaches the plasma membrane, loaded, and cannot fuse with it. Nothing is released.',
};

const CARGOES = {
  secreted: { label: 'Secreted protein', short: 'Secreted', note: 'Insulin, or a digestive enzyme: it carries no lysosomal address, so the default route takes it outside.' },
  lysosomal: { label: 'Lysosomal enzyme', short: 'Lysosomal', note: 'A digestive enzyme bound for a lysosome. It is the mannose-6-phosphate tag, added in the Golgi, that gets it there.' },
};

// Where the wide layout stops fitting: the panel column cannot fall below 200px and the cell needs
// 400px beside it; under 430px of stage height the panel, the track and the toolbar leave the cell less
// than half the stage. Measured at 1000x562 and at 390x520.
const NARROW_W = 700;
const NARROW_H = 430;
const SHORT_W = 560;

// ---------- the pulse-chase model ----------
//
// Four compartments in series, first order, with a three-minute square pulse of label into the ER.
// Time constants are chosen so the peaks land where Jamieson and Palade found them: rough ER at 3 min,
// Golgi at 7, granules at 37, discharged by about 117.
function pulseChase() {
  const dt = 0.25; // minutes
  const n = Math.round(PULSE_MINUTES / dt) + 1;
  const er = new Float64Array(n);
  const golgi = new Float64Array(n);
  const gran = new Float64Array(n);
  const out = new Float64Array(n);
  const kER = 1 / 4.2;
  const kG = 1 / 11;
  const kS = 1 / 52;
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  for (let i = 0; i < n; i += 1) {
    const m = i * dt;
    const input = m < PULSE_LENGTH ? 1 / PULSE_LENGTH : 0;
    const fa = input - kER * a;
    const fb = kER * a - kG * b;
    const fc = kG * b - kS * c;
    const fd = kS * c;
    a += fa * dt;
    b += fb * dt;
    c += fc * dt;
    d += fd * dt;
    er[i] = a;
    golgi[i] = b;
    gran[i] = c;
    out[i] = d;
  }
  let peak = 0;
  for (let i = 0; i < n; i += 1) peak = Math.max(peak, er[i], golgi[i], gran[i], out[i]);
  return { dt, n, er, golgi, gran, out, peak };
}

// ---------- the cell, in its own 1000 x 560 space ----------
//
// Basal end at the left, apical at the right. Every position below was placed against the others: the
// free ribosome of stage 0 sits in clear cytosol under the ER stack, the chain docks on the lowest
// cisterna and folds inside it, the smooth patch is that cisterna's own end running to the exit site,
// and the route from the trans face to the membrane threads between the granules.
const U = { w: 1000, h: 560 };
const NUC = { x: 168, y: 280, rx: 116, ry: 150 };
// Rough cisternae: where each starts, its height and its length. They are continuous with the outer
// nuclear membrane, which is why they begin just clear of the envelope.
const ER = [
  { x: 292, y: 118, len: 150 },
  { x: 300, y: 200, len: 166 },
  { x: 306, y: 282, len: 170 },
  { x: 300, y: 364, len: 160 },
];
const EXIT = [536, 282];
// The transitional ER: the ends of the lower three cisternae, smooth, converging on the exit site.
const SMOOTH = [1, 2, 3].map((i) => [[ER[i].x + ER[i].len, ER[i].y], [ER[i].x + ER[i].len + 36, lerp(ER[i].y, EXIT[1], 0.45)], EXIT]);
const GOLGI = { x: 670, y: 282, n: 5, w: 168 }; // cis face at 586, trans face at 754
const GRANULES = [[812, 120, 34], [866, 300, 44], [816, 412, 38]];
const LYSO = { x: 740, y: 490, r: 38 };
const APICAL = 928;
const ANCHORS = [
  [330, 486], [350, 436], [372, 368], [405, 372], [548, 282], [670, 282], [790, 232], [APICAL + 22, 222],
];
const LYSO_ANCHOR = [LYSO.x, LYSO.y];

// The names. `side` says which side of its anchor a label sits, in the cell's own frame; when the cell
// stands up the sides turn with it and the text stays upright. 'strip' is the outside, set along the
// apical strip whichever way the cell is lying.
const LABELS = [
  { text: 'Nucleus', x: NUC.x, y: NUC.y - NUC.ry - 8, side: 'above' },
  { text: 'Rough ER', x: 372, y: ER[0].y - 41, side: 'above' },
  { text: 'Smooth ER', x: 515, y: 202, side: 'above' },
  { text: 'Golgi', x: GOLGI.x, y: GOLGI.y - 111, side: 'above' },
  { text: 'cis', x: 572, y: 358, side: 'below', small: true },
  { text: 'trans', x: 742, y: 386, side: 'below', small: true },
  { text: 'Secretory vesicles', x: 812, y: GRANULES[0][1] - GRANULES[0][2] - 13, side: 'above' },
  { text: 'Lysosome', x: LYSO.x, y: LYSO.y + LYSO.r + 13, side: 'below' },
  { text: 'Outside', x: APICAL + 36, y: 280, side: 'strip' },
];

// ---------- the figure ----------

const CSS = (s) => `${panelCss(s)}
/* A third of the stage for the panel: the cell is wider than its pane is tall, so the width it gives up
   costs the drawing nothing, and a seven-item list of what has been done to the cargo needs the room. */
.${s} { display: grid; grid-template-columns: minmax(0, 1fr) clamp(220px, 34%, 324px); grid-template-rows: minmax(0, 1fr) auto; padding-bottom: var(--se-pad, 3.1rem); box-sizing: border-box; }
.${s} .se-stage { grid-column: 1; grid-row: 1; position: relative; min-width: 0; min-height: 0; padding: var(--space-3) 0 var(--space-1) var(--space-3); box-sizing: border-box; }
.${s} .se-stage canvas { width: 100%; height: 100%; border-radius: var(--radius); }
/* The panel is a page, not a card: a stage head, its sentence, then a ruled table of what has been done
   and where it is going, then the controls. Every paragraph margin is set here, none is the browser's. */
.${s} .se-panel { grid-column: 2; grid-row: 1; padding: var(--space-3) var(--space-4) var(--space-1); gap: 0.3rem; box-sizing: border-box; overflow: hidden; }
.${s} .se-panel p { margin: 0; }
.${s} .se-title { display: flex; align-items: baseline; gap: 0.5em; flex-wrap: wrap; }
.${s} .se-num { font-size: 9.5px; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase; color: var(--ink-faint); }
.${s} .se-where { font-size: 11.5px; line-height: 1.35; color: var(--ink-soft); }
.${s} .se-where b { color: var(--ink); font-weight: 600; }
.${s} .se-rule { height: 1px; background: var(--rule); margin: 0.3rem 0 0.15rem; }
.${s} .se-row { display: grid; grid-template-columns: 5.2em minmax(0, 1fr); gap: 0 0.6em; align-items: baseline; }
.${s} .se-row .cl-head { padding-top: 1px; }
.${s} .se-done { font-size: 11px; line-height: 1.4; color: var(--ink-soft); }
.${s} .se-done i { font-style: normal; color: var(--ink-faint); }
.${s} .se-dest { font-size: 11.5px; line-height: 1.35; color: var(--ink-soft); }
.${s} .se-dest b { font-weight: 600; color: var(--ink); }
.${s} .se-dest[data-s="true"] b { color: var(--coral-text); }
.${s} .se-dest[data-s="false"] b { color: var(--leaf-text); }
.${s} .se-why { font-size: 10.5px; line-height: 1.35; color: var(--ink-faint); }
/* Palade's four curves live in the panel, where the journey's controls were: over the drawing they hid
   the lysosome and the trans face, which are what the grains are being compared with. */
.${s} .se-chart { display: block; width: 100%; height: 138px; margin-top: 0.35rem; }
.${s}.is-narrow .se-chart { height: 96px; margin-top: 0.1rem; }
/* The controls take the panel's whole width under their head: beside it, four lesion buttons wrapped
   one to a line and read as a list. */
.${s} .se-ctl { grid-template-columns: minmax(0, 1fr); gap: 0.2rem 0; margin-top: 0.15rem; }
.${s} .se-track { grid-column: 1 / -1; grid-row: 2; padding: 0 var(--space-4); box-sizing: border-box; }
.${s} .se-track input { width: 100%; margin: -3px 0 -4px; display: block; accent-color: var(--leaf); height: 24px; }
.${s} .se-track input:focus-visible { outline-offset: -3px; }
.${s} .se-ticks { position: relative; height: 15px; }
.${s} .se-tick { position: absolute; top: 0; transform: translateX(-50%); font-size: 9.5px; letter-spacing: 0.02em; color: var(--ink-faint); white-space: nowrap; }
.${s} .se-tick:first-child { transform: none; }
.${s} .se-tick:last-child { transform: translateX(-100%); }
.${s} .se-tick.is-now { color: var(--leaf-text); font-weight: 600; }
.${s} .se-tick.is-past { color: var(--ink-soft); }
.${s} .se-tick.is-blocked { color: var(--coral-text); }
.${s} .se-short { display: none; }
.${s}.is-short .se-long { display: none; }
.${s}.is-short .se-short { display: inline; }
.${s}.is-short .fig-btn { padding: 0.3rem 0.5rem; }
.${s}.is-short .fig-toolbar { gap: 0.3rem; }
.${s} .se-hide { display: none; }
/* Narrow: the cell keeps the top of the stage and the panel becomes four short lines and two rows of
   controls under it, so the drawing keeps at least half the stage. */
.${s}.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto auto; }
.${s}.is-narrow .se-stage { grid-column: 1; grid-row: 1; padding: var(--space-2) var(--space-3) 0; }
.${s}.is-narrow .se-panel { grid-column: 1; grid-row: 2; padding: var(--space-2) var(--space-3) 0; gap: 0.18rem; }
.${s}.is-narrow .se-track { grid-row: 3; padding: 0 var(--space-3); }
.${s}.is-narrow .cl-title { font-size: 13px; }
.${s}.is-narrow .se-body, .${s}.is-narrow .se-why, .${s}.is-narrow .se-rule { display: none; }
.${s}.is-narrow .se-row, .${s}.is-narrow .se-ctl { grid-template-columns: 4.6em minmax(0, 1fr); gap: 0 0.6em; }
.${s}.is-narrow .se-ctl { margin-top: 0.05rem; }
/* Eight stage names do not fit one row of a phone's track, so they take two, alternating. */
.${s}.is-narrow .se-ticks { height: 26px; }
.${s}.is-narrow .se-tick { font-size: 9px; }
.${s}.is-narrow .se-tick:nth-child(even) { top: 12px; }
`;

export function mount(root, ctx) {
  const scope = 'tb-sec';
  const reduced = Boolean(ctx.reducedMotion);
  let palette = ctx.palette;
  let theme = ctx.theme;
  let t = ctx.pinnedTime ?? 0;
  let playing = false;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  const pc = pulseChase();
  const rngGrains = mulberry32(SEED + 5);
  const grains = [];
  for (let i = 0; i < 260; i += 1) grains.push([rngGrains(), rngGrains(), rngGrains()]);

  const state = {
    mode: 'journey',
    blocks: new Set(),
    cargo: 'secreted',
    faces: false,
  };

  // ----- the route's arithmetic -----
  function maxStage() {
    if (state.blocks.has('signal')) return 1;
    if (state.blocks.has('er-exit')) return 3;
    if (state.blocks.has('fusion')) return 6;
    return 7;
  }
  function destination() {
    if (state.blocks.has('signal')) return 'cytosol';
    if (state.blocks.has('er-exit')) return 'er-lumen';
    if (state.blocks.has('fusion')) return 'secretory-vesicle';
    if (state.cargo === 'lysosomal' && !state.blocks.has('golgi-tag')) return 'lysosome';
    return 'outside';
  }
  const toLysosome = () => state.cargo === 'lysosomal' && !state.blocks.has('golgi-tag') && !state.blocks.has('fusion');
  const span = () => (state.mode === 'journey' ? maxStage() * STAGE_SECONDS : PULSE_SECONDS);
  // The position along the journey, in stages, as a pure function of the clock.
  const position = () => clamp(t / STAGE_SECONDS, 0, maxStage());
  const stageNow = () => Math.min(maxStage(), Math.floor(position() + 1e-9));
  const stranded = () => position() >= maxStage() - 1e-9 && maxStage() < 7;
  const minutesNow = () => clamp((t / PULSE_SECONDS) * PULSE_MINUTES, 0, PULSE_MINUTES);

  function modifications(stage) {
    const out = [];
    if (stage >= 3 && !state.blocks.has('signal')) out.push('signal-cleaved', 'folded', 'core-sugars');
    if (stage >= 5 && !state.blocks.has('signal')) out.push('sugars-remodelled');
    if (stage >= 6 && !state.blocks.has('signal')) {
      if (state.cargo === 'lysosomal' && !state.blocks.has('golgi-tag')) out.push('tagged');
      out.push('sorted');
    }
    if (stage >= 7) out.push('released');
    return out;
  }
  function compartment(stage) {
    if (stage === 7) return toLysosome() ? 'lysosome' : 'outside';
    return COMPARTMENTS[stage];
  }

  // ----- DOM -----
  const wrap = h('div', { class: scope });
  wrap.append(h('style', { text: CSS(scope) }));

  const canvas = h('canvas', {
    tabindex: 0,
    role: 'img',
    'aria-label': 'A secretory cell in section, with one protein travelling from a ribosome in the cytosol to outside the cell. The left and right arrow keys step the journey; Space plays and pauses it.',
  });
  const stage = h('div', { class: 'se-stage' }, [canvas]);

  const titleNum = h('span', { class: 'se-num' });
  const titleName = h('p', { class: 'cl-title' });
  const where = h('p', { class: 'se-where' });
  const body = h('p', { class: 'cl-note se-body' });
  const done = h('p', { class: 'se-done' });
  const dest = h('p', { class: 'se-dest', 'aria-live': 'polite' });
  const why = h('p', { class: 'se-why' });

  const mini = (label, short, onClick, cls = '') => {
    const b = h('button', { class: `cl-mini ${cls}`, type: 'button', 'aria-pressed': 'false', 'aria-label': label }, [
      h('span', { class: 'se-long', text: label }),
      h('span', { class: 'se-short', text: short }),
    ]);
    b.addEventListener('click', onClick);
    return b;
  };
  const blockButtons = BLOCKS.map((id) => mini(BLOCK_LABEL[id], BLOCK_SHORT[id], () => {
    if (state.blocks.has(id)) state.blocks.delete(id);
    else state.blocks.add(id);
    t = Math.min(t, maxStage() * STAGE_SECONDS);
    sync();
    draw();
  }, 'is-warn'));
  const cargoButtons = Object.entries(CARGOES).map(([id, c]) => mini(c.label, c.short, () => {
    state.cargo = id;
    sync();
    draw();
  }));

  const doneHead = h('p', { class: 'cl-head', text: 'Done so far' });
  const destHead = h('p', { class: 'cl-head', text: 'Goes to' });
  const chartCanvas = h('canvas', { class: 'se-chart se-hide', 'aria-hidden': 'true' });
  const row = (head, kids, cls = '') => h('div', { class: `se-row ${cls}` }, [typeof head === 'string' ? h('p', { class: 'cl-head', text: head }) : head, ...kids]);
  const panel = h('div', { class: 'cl-panel se-panel' }, [
    h('div', { class: 'se-title' }, [titleNum, titleName]),
    where,
    body,
    h('div', { class: 'se-rule' }),
    row(doneHead, [done]),
    row(destHead, [dest]),
    why,
    row('Cargo', [h('div', { class: 'cl-group' }, cargoButtons)], 'se-ctl se-cargo'),
    row('Block a step', [h('div', { class: 'cl-group' }, blockButtons)], 'se-ctl se-blocks'),
    chartCanvas,
  ]);

  const scrub = h('input', {
    type: 'range', class: 'fig-range', min: 0, max: 1000, step: 1, value: '0',
    'aria-label': 'Scrub the journey',
  });
  scrub.addEventListener('input', () => {
    const f = Number(scrub.value) / 1000;
    setPlaying(false);
    t = f * (state.mode === 'journey' ? JOURNEY_SECONDS : PULSE_SECONDS);
    draw();
  });
  const ticks = h('div', { class: 'se-ticks' });
  const track = h('div', { class: 'se-track' }, [scrub, ticks]);

  // Every accessible name begins with the button's own long label, so a recipe can find the control by
  // the words on it whatever the stage width shows.
  const btn = (label, short, onClick, aria) => {
    const b = h('button', { class: 'fig-btn', type: 'button', 'aria-label': aria ?? label }, [
      h('span', { class: 'se-long', text: label }),
      h('span', { class: 'se-short', text: short ?? label }),
    ]);
    b.addEventListener('click', onClick);
    return b;
  };
  const btnBack = btn('Back', null, () => step(-1), 'Back one stage');
  const btnNext = btn('Next', null, () => step(1), 'Next stage');
  const btnPlay = btn('Play', null, () => setPlaying(!playing), 'Play the journey');
  const btnMode = btn('Pulse-chase', 'Palade', () => {
    state.mode = state.mode === 'journey' ? 'pulse-chase' : 'journey';
    t = 0;
    setPlaying(false);
    sync();
    draw();
  });
  const btnFaces = btn('Follow the membrane', 'Faces', () => {
    state.faces = !state.faces;
    sync();
    draw();
  });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [btnBack, btnNext, btnPlay, btnMode, btnFaces]);

  wrap.append(stage, panel, track, toolbar);
  root.append(wrap);

  for (let i = 0; i < STAGES; i += 1) {
    ticks.append(h('span', { class: 'se-tick', style: `left:${(i / (STAGES - 1)) * 100}%`, text: STAGE_SHORT[i] }));
  }
  const tickNodes = Array.from(ticks.children);

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('this figure draws its cell on a 2D canvas and the browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  function step(d) {
    setPlaying(false);
    const next = clamp(Math.round(position()) + d, 0, maxStage());
    t = next * STAGE_SECONDS;
    draw();
  }
  function setPlaying(v) {
    if (v && reduced) {
      // Nothing moves on its own under reduced motion: Play is a cut to the end of the route.
      playing = false;
      t = span();
      draw();
      return;
    }
    playing = Boolean(v);
    const label = playing ? 'Pause' : 'Play';
    btnPlay.querySelector('.se-long').textContent = label;
    btnPlay.querySelector('.se-short').textContent = label;
    btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play the journey');
    if (playing) schedule();
    else stop();
  }

  // ---------- layout ----------
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let narrow = null;
  let short = null;
  let padPx = 0;
  // The cell's fit into the pane, recomputed by every draw: scale, and whether it is standing up.
  let fit = { s: 1, vertical: false };

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const wantNarrow = w < NARROW_W || hh < NARROW_H;
    const wantShort = w < SHORT_W;
    if (wantNarrow !== narrow || wantShort !== short) {
      narrow = wantNarrow;
      short = wantShort;
      wrap.classList.toggle('is-narrow', narrow);
      wrap.classList.toggle('is-short', short);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 22;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--se-pad', `${pad}px`);
    }
    return true;
  }
  function sizeCanvas() {
    const r = stage.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const f = fitCanvas(canvas, w, hh);
    cw = w;
    ch = hh;
    dpr = f.dpr;
    return true;
  }

  // A cell-space point in screen pixels, for the labels and anything else set in type.
  function toScreen(x, y) {
    if (fit.vertical) return [cw / 2 + (y - U.h / 2) * fit.s, ch / 2 - (x - U.w / 2) * fit.s];
    return [cw / 2 + (x - U.w / 2) * fit.s, ch / 2 + (y - U.h / 2) * fit.s];
  }

  function cargoAt(p) {
    const i = Math.floor(p);
    const f = p - i;
    const a = ANCHORS[clamp(i, 0, 7)];
    let b = ANCHORS[clamp(i + 1, 0, 7)];
    if (i === 6 && toLysosome()) b = LYSO_ANCHOR;
    if (i >= 7) return toLysosome() ? LYSO_ANCHOR : ANCHORS[7];
    const e = smoothstep(f);
    return [lerp(a[0], b[0], e), lerp(a[1], b[1], e)];
  }

  function colours() {
    const p = palette;
    const O = ORGANELLE_BY_ID;
    const cyto = mix(p.paper, O.cytoplasm.color, 0.55);
    return {
      cyto,
      outside: mix(p.paper, p.water, 0.14),
      membrane: O.membrane.color,
      nucleus: O.nucleus.color,
      nucleolus: O.nucleolus.color,
      chromatin: O.chromatin.color,
      rough: O.roughER.color,
      smooth: O.smoothER.color,
      golgi: O.golgi.color,
      vesicle: O.vesicle.color,
      lysosome: O.lysosome.color,
      ribosome: O.ribosome.color,
      cargo: p.leaf,
      // The lumen is the cytoplasm's own colour carried a little towards the ER, in both themes: taken
      // from the paper it came out near black on the dark page and every cisterna read as a bar.
      lumen: mix(cyto, O.roughER.color, 0.16),
      // The follow-the-membrane overlay: every membrane becomes two faces, the one that touches the
      // cytosol and the one that lines a lumen, and the second is what ends up facing the outside.
      faceCyto: mix(O.roughER.color, p.ink, 0.15),
      faceLumen: mix(p.gold, O.golgi.color, 0.4),
      // Type on the cytoplasm. The field is a lit object on the dark page, so the soft ink, which is
      // pale there, vanished on it; the names take a dark tone on the dark theme and the soft ink on
      // the light one, and the route dashes follow.
      label: theme === 'dark' ? mix(cyto, p.paper, 0.78) : p.inkSoft,
      // The outside strip is a tint of the paper in both themes, so the soft ink holds on it in both,
      // where the lit cytoplasm needed its own tone.
      labelOutside: p.inkSoft,
      ink: p.ink,
      soft: p.inkSoft,
      faint: p.inkFaint,
      rule: p.rule,
      coral: p.coral,
      gold: p.gold,
    };
  }

  // A cisterna: a flattened sac drawn as a thick round-capped stroke with a paler lumen inside it, so
  // the membrane and the space it encloses are two different things on the page.
  function cisterna(pts, thick, wallCol, lumenCol, tension = 5) {
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    smoothOpen(g, pts, tension);
    g.strokeStyle = wallCol;
    g.lineWidth = thick;
    g.stroke();
    g.beginPath();
    smoothOpen(g, pts, tension);
    g.strokeStyle = lumenCol;
    g.lineWidth = Math.max(1, thick - 7);
    g.stroke();
  }

  // The rough cisterna's own path: a little bowed, alternately up and down the stack.
  const erPath = (i) => {
    const e = ER[i];
    return [[e.x, e.y - 8], [e.x + e.len * 0.5, e.y + (i % 2 ? 10 : -10)], [e.x + e.len, e.y]];
  };

  // A round membrane, `w` thick at radius `r`. With the overlay on it is two rings: the outer half in
  // the cytosolic face's colour, the inner half in the lumen's, because a vesicle's inside is a lumen.
  function membraneRing(x, y, r, w, base) {
    if (!state.faces) {
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.strokeStyle = base;
      g.lineWidth = w;
      g.stroke();
      return;
    }
    const C = colours();
    g.lineWidth = w / 2;
    g.beginPath();
    g.arc(x, y, r + w / 4, 0, TAU);
    g.strokeStyle = C.faceCyto;
    g.stroke();
    g.beginPath();
    g.arc(x, y, r - w / 4, 0, TAU);
    g.strokeStyle = C.faceLumen;
    g.stroke();
  }

  function drawCell(C) {
    const face = state.faces;
    const wall = (base) => (face ? C.faceCyto : base);
    const lum = (base) => (face ? C.faceLumen : base);
    // The two faces of the cell run the whole height of the pane, whatever the pane's shape.
    const Y0 = -700;
    const Y1 = U.h + 700;

    // outside, beyond the apical membrane, and the basal side
    g.fillStyle = C.outside;
    g.fillRect(APICAL, Y0, U.w - APICAL + 700, Y1 - Y0);
    g.fillRect(-700, Y0, 722, Y1 - Y0);

    // The plasma membrane, apical and basal. With the overlay on, the half that touches the cytosol
    // and the half that faces the outside are drawn apart: the outside face is a lumen face.
    const membraneLine = (x, outward) => {
      if (!face) {
        g.strokeStyle = C.membrane;
        g.lineWidth = 11;
        g.beginPath();
        g.moveTo(x, Y0);
        g.lineTo(x, Y1);
        g.stroke();
        return;
      }
      g.lineWidth = 5.5;
      for (const [dx, col] of [[-outward * 2.75, C.faceCyto], [outward * 2.75, C.faceLumen]]) {
        g.strokeStyle = col;
        g.beginPath();
        g.moveTo(x + dx, Y0);
        g.lineTo(x + dx, Y1);
        g.stroke();
      }
    };
    membraneLine(APICAL, 1);
    membraneLine(22, -1);
    // microvilli on the apical face: a finger of membrane round a core of cytosol
    g.lineCap = 'round';
    for (const [width, col] of face ? [[8, C.faceLumen], [3, C.faceCyto]] : [[8, C.membrane]]) {
      g.strokeStyle = col;
      g.lineWidth = width;
      for (let i = -14; i < 26; i += 1) {
        const y = 26 + i * 50;
        g.beginPath();
        g.moveTo(APICAL, y);
        g.lineTo(APICAL + 34, y + (i % 2 ? 6 : -6));
        g.stroke();
      }
    }

    // the nucleus
    g.beginPath();
    g.ellipse(NUC.x, NUC.y, NUC.rx, NUC.ry, 0, 0, TAU);
    g.fillStyle = alpha(C.nucleus, 0.3);
    g.fill();
    const rngN = mulberry32(SEED + 2);
    for (let i = 0; i < 26; i += 1) {
      const a = rngN() * TAU;
      const rr = Math.sqrt(rngN()) * 0.92;
      g.beginPath();
      g.arc(NUC.x + Math.cos(a) * NUC.rx * rr, NUC.y + Math.sin(a) * NUC.ry * rr, 12 + rngN() * 18, 0, TAU);
      g.fillStyle = alpha(C.chromatin, 0.34);
      g.fill();
    }
    g.beginPath();
    g.arc(NUC.x - 22, NUC.y + 26, 32, 0, TAU);
    g.fillStyle = C.nucleolus;
    g.fill();
    // The envelope: two membranes with pores where they meet. The space between them is continuous
    // with the ER lumen, so with the overlay on the outer membrane's inner face and the inner
    // membrane's outer face are both lumen faces.
    for (const d of [0, -13]) {
      const parts = face
        ? [[d + 1.5, d === 0 ? C.faceCyto : C.faceLumen], [d - 1.5, d === 0 ? C.faceLumen : C.faceCyto]]
        : [[d, C.membrane]];
      for (const [off, col] of parts) {
        g.beginPath();
        g.ellipse(NUC.x, NUC.y, NUC.rx + off, NUC.ry + off, 0, 0, TAU);
        g.strokeStyle = col;
        g.lineWidth = face ? 3 : 6;
        g.stroke();
      }
    }
    g.strokeStyle = C.cyto;
    g.lineWidth = 15;
    for (let i = 0; i < 9; i += 1) {
      const a = (i / 9) * TAU + 0.3;
      g.beginPath();
      g.moveTo(NUC.x + Math.cos(a) * (NUC.rx - 16), NUC.y + Math.sin(a) * (NUC.ry - 16));
      g.lineTo(NUC.x + Math.cos(a) * (NUC.rx + 4), NUC.y + Math.sin(a) * (NUC.ry + 4));
      g.stroke();
    }

    // the rough ER: cisternae with ribosomes on both faces, continuous with the envelope
    const rngR = mulberry32(SEED + 3);
    for (let i = 0; i < ER.length; i += 1) {
      const pts = erPath(i);
      cisterna(pts, 26, wall(C.rough), lum(C.lumen));
      g.fillStyle = C.ribosome;
      for (let k = 0; k <= 12; k += 1) {
        const f = k / 12;
        const px = lerp(pts[0][0], pts[2][0], f);
        const py = lerp(pts[0][1], pts[2][1], f) + Math.sin(f * Math.PI) * (i % 2 ? 10 : -10);
        for (const sgn of [-1, 1]) {
          g.beginPath();
          g.arc(px + rngR() * 4, py + sgn * 17, 4.6, 0, TAU);
          g.fill();
        }
      }
    }
    // the transitional ER: the lower cisternae run on, smooth, to the exit site
    for (const pts of SMOOTH) cisterna(pts, 17, wall(C.smooth), lum(C.lumen), 4);

    // the Golgi: a stack from the cis face to the trans face, each sac a little wider than the last
    for (let i = 0; i < GOLGI.n; i += 1) {
      const x = GOLGI.x - GOLGI.w / 2 + (i * GOLGI.w) / (GOLGI.n - 1);
      const bow = 62 + i * 7;
      const pts = [[x - 18, GOLGI.y - bow], [x, GOLGI.y], [x - 18, GOLGI.y + bow]];
      const k = i / (GOLGI.n - 1);
      cisterna(pts, 25, wall(mix(C.golgi, C.rough, 0.28 * (1 - k))), lum(mix(C.lumen, C.golgi, 0.18)), 4);
    }
    // vesicles shuttling round the stack
    const rngV = mulberry32(SEED + 4);
    for (let i = 0; i < 7; i += 1) {
      const a = rngV() * TAU;
      const x = GOLGI.x + Math.cos(a) * (GOLGI.w * 0.62);
      const y = GOLGI.y + Math.sin(a) * 104;
      const r = 9 + rngV() * 4;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fillStyle = lum(C.vesicle);
      g.fill();
      if (face) membraneRing(x, y, r - 1.5, 3, C.membrane);
    }

    // secretory granules waiting under the apical membrane
    for (const [x, y, r] of GRANULES) {
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fillStyle = lum(alpha(C.vesicle, 0.5));
      g.fill();
      membraneRing(x, y, r, 7, C.membrane);
      g.fillStyle = alpha(C.cargo, 0.5);
      const rngG = mulberry32(SEED + Math.round(x));
      for (let i = 0; i < 9; i += 1) {
        const a = rngG() * TAU;
        const rr = Math.sqrt(rngG()) * (r - 12);
        g.beginPath();
        g.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 4.5, 0, TAU);
        g.fill();
      }
    }

    // the lysosome
    g.beginPath();
    g.arc(LYSO.x, LYSO.y, LYSO.r, 0, TAU);
    g.fillStyle = alpha(C.lysosome, 0.34);
    g.fill();
    membraneRing(LYSO.x, LYSO.y, LYSO.r, 7, C.membrane);
    const rngL = mulberry32(SEED + 9);
    g.fillStyle = alpha(C.lysosome, 0.85);
    for (let i = 0; i < 11; i += 1) {
      const a = rngL() * TAU;
      const rr = Math.sqrt(rngL()) * (LYSO.r - 12);
      g.beginPath();
      g.arc(LYSO.x + Math.cos(a) * rr, LYSO.y + Math.sin(a) * rr, 4 + rngL() * 3, 0, TAU);
      g.fill();
    }
  }

  // Returns the screen-space text the cargo needs set after the cell is drawn (the M6P mark).
  function drawCargo(C, p, st) {
    const [x, y] = cargoAt(p);
    const stageIdx = st.stage;
    const mods = modifications(stageIdx);
    const r = 15;
    const notes = [];
    // a chain that folds: a wiggle at the start, a compact blob once it is folded
    const folded = mods.includes('folded');
    g.save();
    g.translate(x, y);
    if (!folded) {
      g.strokeStyle = C.cargo;
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      const n = 9;
      for (let i = 0; i < n; i += 1) {
        const u = i / (n - 1);
        const px = -18 + u * 36;
        const py = Math.sin(u * 9 + st.wiggle) * 9;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    } else {
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.fillStyle = C.cargo;
      g.fill();
      g.strokeStyle = mix(C.cargo, C.ink, 0.3);
      g.lineWidth = 2.5;
      g.stroke();
    }
    // the sugar chains, drawn as little trees; remodelled ones branch differently
    if (mods.includes('core-sugars')) {
      const remodelled = mods.includes('sugars-remodelled');
      g.strokeStyle = mix(C.gold, C.ink, 0.1);
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      for (const a of [-0.8, 0.8, 2.6]) {
        const bx = Math.cos(a) * r;
        const by = Math.sin(a) * r;
        const ex = Math.cos(a) * (r + 13);
        const ey = Math.sin(a) * (r + 13);
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(ex, ey);
        const spread = remodelled ? 0.85 : 0.4;
        for (const s of [-1, 1]) {
          g.moveTo(ex, ey);
          g.lineTo(ex + Math.cos(a + s * spread) * 10, ey + Math.sin(a + s * spread) * 10);
        }
        g.stroke();
      }
    }
    // the mannose-6-phosphate tag
    if (mods.includes('tagged')) {
      g.beginPath();
      g.arc(0, -r - 16, 7, 0, TAU);
      g.fillStyle = C.coral;
      g.fill();
      notes.push({ text: 'M6P', x, y: y - r - 26, side: 'above', colour: mix(C.coral, C.label, 0.3), small: true });
    }
    g.restore();

    // what is carrying it, at the stages where that is the point
    if (stageIdx <= 2) {
      // the ribosome, and the signal recognition particle once it has bound
      g.fillStyle = C.ribosome;
      g.beginPath();
      g.ellipse(x - 2, y + 27, 21, 15, 0, 0, TAU);
      g.fill();
      g.beginPath();
      g.ellipse(x - 2, y + 42, 15, 10, 0, 0, TAU);
      g.fill();
      if (stageIdx >= 1) {
        g.fillStyle = C.coral;
        g.beginPath();
        g.ellipse(x - 26, y + 4, 12, 8, -0.6, 0, TAU);
        g.fill();
      }
    }
    if (stageIdx === 4 || (stageIdx === 6 && !st.strandedHere) || stageIdx === 7) {
      // the vesicle it is riding in
      membraneRing(x, y, 30, 6, C.membrane);
    }
    return notes;
  }

  function drawRoute(C) {
    g.setLineDash([7, 7]);
    g.strokeStyle = alpha(C.label, 0.45);
    g.lineWidth = 2;
    g.beginPath();
    for (let i = 0; i < ANCHORS.length; i += 1) {
      const a = ANCHORS[i];
      if (i === 0) g.moveTo(a[0], a[1]);
      else g.lineTo(a[0], a[1]);
    }
    g.stroke();
    if (state.cargo === 'lysosomal') {
      g.beginPath();
      g.moveTo(ANCHORS[6][0], ANCHORS[6][1]);
      g.lineTo(LYSO_ANCHOR[0], LYSO_ANCHOR[1]);
      g.stroke();
    }
    g.setLineDash([]);
  }

  // The lesions, drawn where they bite. Returns their names for the label pass.
  function drawBlocks(C) {
    const marks = [];
    if (state.blocks.has('signal')) marks.push([404, 440, 'no signal']);
    if (state.blocks.has('er-exit')) marks.push([EXIT[0], EXIT[1], 'no exit']);
    if (state.blocks.has('golgi-tag')) marks.push([GOLGI.x + GOLGI.w / 2 + 14, 200, 'no tag']);
    if (state.blocks.has('fusion')) marks.push([APICAL - 16, 222, 'no fusion']);
    const notes = [];
    for (const [x, y, label] of marks) {
      g.strokeStyle = C.coral;
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x - 15, y - 15);
      g.lineTo(x + 15, y + 15);
      g.moveTo(x + 15, y - 15);
      g.lineTo(x - 15, y + 15);
      g.stroke();
      notes.push({ text: label, x, y: y - 22, side: 'above', colour: mix(C.coral, C.label, 0.25) });
    }
    return notes;
  }

  // The autoradiograph: silver grains over whichever compartment holds the label now.
  function drawGrains(C, minutes) {
    const i = clamp(Math.round(minutes / pc.dt), 0, pc.n - 1);
    const shares = [pc.er[i], pc.golgi[i], pc.gran[i], pc.out[i]];
    const total = shares.reduce((a, b) => a + b, 0) || 1;
    const zones = [
      { pick: (u, v) => [lerp(292, 480, u), lerp(85, 400, v)] },
      { pick: (u, v) => [GOLGI.x + (u - 0.5) * GOLGI.w, GOLGI.y + (v - 0.5) * 190] },
      { pick: (u, v) => [lerp(770, 900, u), lerp(90, 460, v)] },
      { pick: (u, v) => [lerp(APICAL + 8, U.w - 6, u), lerp(30, U.h - 30, v)] },
    ];
    let at = 0;
    g.fillStyle = alpha(C.ink, 0.75);
    for (let z = 0; z < 4; z += 1) {
      const n = Math.round((shares[z] / total) * 180);
      for (let k = 0; k < n && at < grains.length; k += 1, at += 1) {
        const [u, v, s] = grains[at];
        const [x, y] = zones[z].pick(u, v);
        g.beginPath();
        g.arc(x, y, 2.2 + s * 2.2, 0, TAU);
        g.fill();
      }
    }
  }

  // The four curves, set in the panel on its own canvas as a chart on a page: no box, a baseline rule,
  // the legend on the title line and the clock at its end.
  function drawCurves(minutes) {
    const r = chartCanvas.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return;
    const f = fitCanvas(chartCanvas, w, hgt);
    const cg = chartCanvas.getContext('2d');
    if (!cg) return;
    const C = colours();
    const series = [
      { data: pc.er, colour: C.rough, name: 'rough ER' },
      { data: pc.golgi, colour: C.golgi, name: 'Golgi' },
      { data: pc.gran, colour: C.vesicle, name: 'granules' },
      { data: pc.out, colour: C.cargo, name: 'outside' },
    ];
    cg.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
    cg.clearRect(0, 0, w, hgt);
    const padB = 16;
    const padT = 20;
    const X = (m) => (m / PULSE_MINUTES) * w;
    const Y = (v) => hgt - padB - (v / pc.peak) * (hgt - padB - padT);
    // the pulse
    cg.fillStyle = alpha(C.ink, 0.07);
    cg.fillRect(X(0), padT - 4, X(PULSE_LENGTH) - X(0), hgt - padB - padT + 4);
    // the baseline
    cg.strokeStyle = C.rule;
    cg.lineWidth = 1;
    cg.beginPath();
    cg.moveTo(0, hgt - padB + 0.5);
    cg.lineTo(w, hgt - padB + 0.5);
    cg.stroke();
    for (const s of series) {
      cg.beginPath();
      for (let i = 0; i < pc.n; i += 1) {
        const x = X(i * pc.dt);
        const y = Y(s.data[i]);
        if (i === 0) cg.moveTo(x, y);
        else cg.lineTo(x, y);
      }
      cg.strokeStyle = s.colour;
      cg.lineWidth = 2;
      cg.lineJoin = 'round';
      cg.stroke();
    }
    // the now line
    cg.strokeStyle = C.ink;
    cg.lineWidth = 1.5;
    cg.beginPath();
    cg.moveTo(X(minutes), padT - 4);
    cg.lineTo(X(minutes), hgt - padB);
    cg.stroke();
    cg.textBaseline = 'alphabetic';
    cg.font = `9.5px ${FONT}`;
    cg.fillStyle = C.faint;
    cg.textAlign = 'right';
    cg.fillText('120 min', w, hgt - 4);
    cg.textAlign = 'left';
    cg.fillText(`${PULSE_LENGTH} min pulse`, X(0), hgt - 4);
    // the legend on the title line, with the clock at its end
    let lx = 0;
    cg.font = `600 9.5px ${FONT}`;
    for (const s of series) {
      cg.fillStyle = s.colour;
      cg.beginPath();
      cg.arc(lx + 3.5, 7.5, 3.5, 0, TAU);
      cg.fill();
      cg.fillStyle = C.soft;
      cg.fillText(s.name, lx + 10, 11);
      lx += 10 + cg.measureText(s.name).width + 10;
    }
    cg.font = `600 11px ${FONT}`;
    cg.textAlign = 'right';
    cg.fillStyle = C.ink;
    cg.fillText(`${Math.round(minutes)} min`, w, 11);
  }

  // Type over the drawing, in screen pixels: a name beside its anchor, with a halo of the ground it sits
  // on so it stays legible across an organelle. `side` is in the cell's frame and turns with the cell.
  function setLabel(L, C) {
    const [X, Y] = toScreen(L.x, L.y);
    const size = (L.small ? 9.5 : 10.5) - (short ? 0.5 : 0);
    g.save();
    g.font = `600 ${size}px ${FONT}`;
    g.lineJoin = 'round';
    g.lineWidth = 3;
    g.strokeStyle = L.halo ?? C.cyto;
    g.fillStyle = L.colour ?? C.label;
    let side = L.side;
    if (fit.vertical && side !== 'strip') side = { above: 'left', below: 'right', left: 'below', right: 'above' }[side];
    if (side === 'strip') {
      g.translate(X, Y);
      if (!fit.vertical) g.rotate(-Math.PI / 2);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.strokeText(L.text, 0, 0);
      g.fillText(L.text, 0, 0);
      g.restore();
      return;
    }
    g.textAlign = side === 'above' || side === 'below' ? 'center' : side === 'left' ? 'right' : 'left';
    g.textBaseline = side === 'above' ? 'bottom' : side === 'below' ? 'top' : 'middle';
    // The type is screen-sized and the cell is not, so on a small pane a name placed at the cell's edge
    // can fall off the canvas: it is held inside by its own measure instead.
    const tw = g.measureText(L.text).width;
    const x0 = g.textAlign === 'center' ? tw / 2 : g.textAlign === 'left' ? 0 : tw;
    const cx = clamp(X, x0 + 2, cw - (tw - x0) - 2);
    const top = g.textBaseline === 'top' ? 0 : g.textBaseline === 'bottom' ? size : size / 2;
    const cy = clamp(Y, top + 2, ch - (size - top) - 2);
    g.strokeText(L.text, cx, cy);
    g.fillText(L.text, cx, cy);
    g.restore();
  }

  // ---------- the frame ----------
  function draw() {
    if (!cw) return;
    const C = colours();
    const stageIdx = stageNow();
    const p = position();
    const st = { stage: stageIdx, wiggle: t * 6, strandedHere: stranded() };

    // Fit the cell's own 1000 x 560 space into the pane, and stand it up when the pane is taller than it
    // is wide: the apical face goes to the top and the journey climbs.
    const vertical = ch > cw;
    const sw = vertical ? U.h : U.w;
    const sh = vertical ? U.w : U.h;
    fit = { s: Math.min(cw / sw, ch / sh), vertical };

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = C.cyto;
    g.fillRect(0, 0, cw, ch);

    g.save();
    g.translate(cw / 2, ch / 2);
    g.scale(fit.s, fit.s);
    if (vertical) g.rotate(-Math.PI / 2);
    g.translate(-U.w / 2, -U.h / 2);

    drawCell(C);
    drawRoute(C);
    let notes = drawBlocks(C);
    if (state.mode === 'pulse-chase') drawGrains(C, minutesNow());
    else notes = notes.concat(drawCargo(C, p, st));
    g.restore();

    // the names, upright whichever way the cell is lying
    for (const L of LABELS) setLabel(L.side === 'strip' ? { ...L, halo: C.outside, colour: C.labelOutside } : L, C);
    for (const L of notes) setLabel(L, C);

    // the frame
    g.strokeStyle = palette.ruleStrong;
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, cw - 1, ch - 1);

    updatePanel(st);
    if (state.mode === 'pulse-chase') drawCurves(minutesNow());
    syncTrack();
  }

  function updatePanel(st) {
    const stageIdx = st.stage;
    const dst = destination();
    const isStranded = stranded();
    const blocked = maxStage();

    if (state.mode === 'pulse-chase') {
      const minutes = minutesNow();
      titleNum.textContent = 'Palade, 1967';
      titleName.textContent = 'Pulse-chase';
      where.innerHTML = `<b>${Math.round(minutes)} minutes</b> after a three-minute pulse of radioactive leucine.`;
      body.textContent = 'Feed the cells labelled amino acid for three minutes, wash it out, then fix a batch every few minutes and see where the label has got to. The route falls out of the order the grains appear in.';
      const i = clamp(Math.round(minutes / pc.dt), 0, pc.n - 1);
      const parts = [['rough ER', pc.er[i]], ['Golgi', pc.golgi[i]], ['granules', pc.gran[i]], ['outside', pc.out[i]]];
      const total = parts.reduce((a, b) => a + b[1], 0) || 1;
      const top = parts.slice().sort((a, b) => b[1] - a[1])[0];
      doneHead.textContent = 'Label over';
      done.innerHTML = parts.map(([name, v]) => `${name} ${Math.round((v / total) * 100)}%`).join(' · ');
      destHead.textContent = 'Most of it';
      dest.dataset.s = 'false';
      dest.innerHTML = `over the <b>${top[0]}</b>, ${Math.round((top[1] / total) * 100)}% of the label.`;
      why.textContent = 'Palade found it over the rough ER at 3 minutes, the Golgi at 7, the granules at 37, and discharged by 117.';
      return;
    }

    doneHead.textContent = 'Done so far';
    destHead.textContent = 'Goes to';
    titleNum.textContent = `Stage ${stageIdx} of 7`;
    titleName.textContent = STAGE_TITLE[stageIdx];
    where.innerHTML = `In the <b>${COMPARTMENT_NAME[compartment(stageIdx)]}</b>.`;
    body.textContent = STAGE_TEXT[stageIdx];
    const list = modifications(stageIdx);
    done.innerHTML = list.length ? list.map((m) => MODS[m]).join(' · ') : '<i>nothing yet</i>';

    dest.dataset.s = String(isStranded);
    dest.innerHTML = isStranded
      ? `<b>Stranded</b> in the ${COMPARTMENT_NAME[dst]}; it goes no further.`
      : `<b>${COMPARTMENT_NAME[dst][0].toUpperCase()}${COMPARTMENT_NAME[dst].slice(1)}</b>.`;

    const active = BLOCKS.filter((b) => state.blocks.has(b));
    if (active.length) {
      const bite = active.find((b) => (b === 'signal' && blocked === 1) || (b === 'er-exit' && blocked === 3) || (b === 'fusion' && blocked === 6))
        ?? (state.blocks.has('golgi-tag') ? 'golgi-tag' : active[0]);
      why.textContent = state.blocks.has('golgi-tag') && state.cargo === 'secreted' && bite === 'golgi-tag'
        ? 'The mannose-6-phosphate tag is an address for a lysosome, and a secreted protein does not carry one — so taking the tag away changes nothing here. Switch the cargo to a lysosomal enzyme to see what it costs.'
        : BLOCK_WHY[bite];
    } else if (state.faces) {
      why.textContent = 'Every membrane has two faces: teal touches the cytosol, gold lines a lumen. Follow the gold from the ER, round the vesicle, to the outside of the cell.';
    } else {
      why.textContent = CARGOES[state.cargo].note;
    }
  }

  function sync() {
    for (const [i, b] of blockButtons.entries()) b.setAttribute('aria-pressed', String(state.blocks.has(BLOCKS[i])));
    const ids = Object.keys(CARGOES);
    for (const [i, b] of cargoButtons.entries()) b.setAttribute('aria-pressed', String(ids[i] === state.cargo));
    btnFaces.setAttribute('aria-pressed', String(state.faces));
    const experiment = state.mode === 'pulse-chase';
    btnMode.setAttribute('aria-pressed', String(experiment));
    btnMode.querySelector('.se-long').textContent = experiment ? 'The journey' : 'Pulse-chase';
    btnMode.querySelector('.se-short').textContent = experiment ? 'Journey' : 'Palade';
    btnMode.setAttribute('aria-label', experiment ? 'The journey' : 'Pulse-chase');
    btnBack.disabled = experiment;
    btnNext.disabled = experiment;
    for (const b of blockButtons) b.disabled = experiment;
    for (const b of cargoButtons) b.disabled = experiment;
    ticks.classList.toggle('se-hide', experiment);
    panel.querySelector('.se-cargo').classList.toggle('se-hide', experiment);
    panel.querySelector('.se-blocks').classList.toggle('se-hide', experiment);
    chartCanvas.classList.toggle('se-hide', !experiment);
    tickNodes[7].textContent = destination() === 'lysosome' ? 'Lysosome' : STAGE_SHORT[7];
  }

  function syncTrack() {
    scrub.value = String(Math.round(clamp(t / (state.mode === 'journey' ? JOURNEY_SECONDS : PULSE_SECONDS), 0, 1) * 1000));
    scrub.setAttribute('aria-label', state.mode === 'journey' ? 'Scrub the journey' : 'Scrub the experiment, 0 to 120 minutes');
    if (state.mode !== 'journey') return;
    const now = stageNow();
    const cap = maxStage();
    for (const [i, node] of tickNodes.entries()) {
      node.classList.toggle('is-now', i === now);
      node.classList.toggle('is-past', i < now);
      node.classList.toggle('is-blocked', i > cap);
    }
  }

  // ---------- input ----------
  const onKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setPlaying(!playing);
    }
  };
  canvas.addEventListener('keydown', onKey);

  // ---------- the loop ----------
  function frame(now) {
    raf = 0;
    if (destroyed || !playing || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    const end = span();
    t = Math.min(end, t + dt);
    draw();
    if (t >= end - 1e-9) setPlaying(false);
    else raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (raf || destroyed || !playing || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    if (!sizeCanvas()) return;
    draw();
    if (!ready) {
      ready = true;
      ctx.onReady();
    }
  }

  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && cw) draw(); });

  sync();
  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(stage);
  observer.observe(toolbar);
  onResize();

  return {
    destroy() {
      destroyed = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      setPlaying(false);
      t = clamp(Number(seconds) || 0, 0, span());
      draw();
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else stop();
    },
    setTheme(nextTheme, nextPalette) {
      theme = nextTheme;
      palette = nextPalette;
      void theme;
      draw();
    },
    describe() {
      const s = stageNow();
      return {
        stage: s,
        stageName: STAGE_NAMES[s],
        compartment: compartment(s),
        modifications: modifications(s),
        blocks: BLOCKS.filter((b) => state.blocks.has(b)),
        stranded: stranded(),
        destination: destination(),
        mode: state.mode,
        t: Number(t.toFixed(3)),
        playing,
        cargo: state.cargo,
        membraneFaces: state.faces,
      };
    },
  };
}
