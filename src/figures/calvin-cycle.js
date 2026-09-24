// The cycle with its books open: Figure 6.3, §6.6.
//
// WHAT IS ON THE STAGE. The Calvin cycle as a ring in the stroma, turning clockwise, with its three
// phases marked on it and every intermediate drawn as a chain of carbon atoms, so the carbon count is
// something a reader sees rather than something they are told. Beside it, a ledger set as type: the ATP
// and NADPH spent by phase and in total, per carbon dioxide and per glucose, and in kilojoules against
// the 2870 a glucose holds. The ring's centre carries the carbon counter, which prints a sum at every
// step and the running books under it.
//
// THE MODEL is a sequence of whole reactions on whole molecules, one at a time, which is what lets a
// reader step it and lets the books balance exactly. It opens with three acceptors (RuBP) and nothing
// else on the ring. The reactions, each with its enzyme:
//   fix            RuBP + CO2 -> the six-carbon compound, held in rubisco's active site   rubisco
//   cut            the six-carbon compound -> two 3-phosphoglycerate, still on the enzyme  rubisco
//   phosphorylate  3-phosphoglycerate + ATP -> 1,3-bisphosphoglycerate                   the kinase
//   reduce         1,3-bisphosphoglycerate + NADPH -> G3P                                GAPDH
//   revert         1,3-bisphosphoglycerate -> 3-phosphoglycerate, when there is no NADPH  the kinase
//   export         every sixth G3P made leaves, to sucrose or to starch                  the transporter
//   shuffle        a G3P's three carbons join the regeneration pool                      FBPase, SBPase
//   rebuild        five carbons from that pool + ATP -> RuBP                             PRK
// The next reaction is always the one furthest round the ring that can go, so a molecule is carried
// through before a new one enters. Nothing is random. The one choice with no chemistry in it is which
// G3P leaves: the sixth made, as §6.6 says, and that sixth is always the one carrying the third carbon
// dioxide's own carbon, so a labelled carbon either leaves at once or goes round again.
//
// WHY THE REGENERATION IS A POOL AND NOT ONE STEP. §6.6's table does it as five G3P in and three RuBP
// out, and a figure that did it that way would need all fifteen carbons in G3P at once — which, with
// three acceptors, is a moment with no RuBP and no 3-phosphoglycerate on the ring at all. A reader who
// starved the cycle of ATP at that moment would see the carbon stuck in G3P and no 3-phosphoglycerate
// piling up, the opposite of §6.6's claim and of what a leaf does. The regeneration is in fact a dozen
// steps through a pool of three- to seven-carbon sugars, and taking G3P in one at a time and rebuilding
// RuBP whenever five carbons are there is both truer to it and what keeps the acceptor pool from ever
// emptying in normal running (it goes three, two, three). So starving either supply always piles up
// 3-phosphoglycerate and drains the acceptor, whatever moment it is done at.
//
// THE STARVATION. The phosphorylation that begins the reduction runs close to an equilibrium far on the
// side of 3-phosphoglycerate, so it only goes forward when an NADPH is there to pull it: with no NADPH a
// 1,3-bisphosphoglycerate falls back to 3-phosphoglycerate and gives its ATP back. With no ATP nothing
// is phosphorylated at all, and the rebuild, which is PRK's and needs ATP, stops too. Either way
// rubisco, which needs neither, carries on until the acceptor is used up — `stalledPhase` is the
// reduction and `accumulating` is 3-phosphoglycerate in both cases, and what differs is that with no ATP
// the regeneration stalls as well. That is the brief's reasoning and this model reproduces it; it was
// not assumed.
//
// THE LIGHT does three things at once, and they are three fields: the stroma's pH goes from 7 to 8,
// magnesium moves in, and thioredoxin is reduced. The first two switch rubisco on; the third switches on
// four named enzymes, GAPDH, FBPase, SBPase and PRK, and rubisco is not one of them. Dark, each of those
// works at DARK of its lit rate, so with both supplies set by hand to full the cycle still slows almost
// to nothing. The two switches are instant here, which a leaf's rubisco is not (§6.6's margin note: it
// takes minutes), because the figure's point is the direction of the switch and not its kinetics.
//
// THE NUMBERS. ATP at 50 kJ/mol (§5.3's value for a cell), NADPH at 220 (§5.8), a glucose 2870, which is
// §6.6's own arithmetic: eighteen ATP and twelve NADPH per glucose are 900 and 2640 kJ, 3540 in all.
// Per three carbon dioxides, 9 ATP and 6 NADPH: 6 and 6 in the reduction, 3 ATP in the regeneration.
//
// THE SIX-CARBON COMPOUND never leaves the enzyme: it is only ever in rubisco's site (`six`) or being
// cut there (`event.six`). `sixCarbonLeftEnzyme` is computed, not written as false: it looks for a
// six-carbon molecule anywhere else on the ring, and there is no path by which one gets there.
//
// COMPOSITION. Two panes. Wide, the ring fills a left column and the ledger the right. Narrow (below
// NARROW_W of stage width), the ring stays and the ledger goes beneath it as rows, one per phase with
// the phase named on the row. The carbon-count line keeps its wording at both widths.
//
// WHAT THE BENCH COULD NOT DO, and where the figure drops through. (1) A readout row, a note and a
// button label are set as plain text, and a formula needs a subscript: every string here is written
// with `_2` and `^{2+}` and `typeset()` rebuilds those as tspans after each draw (and `markupButton` as
// <sub>/<sup> in a button), so CO₂ is CO<sub>2</sub> and never a Unicode subscript digit, which the
// font census would also fail. (2) Phase names follow the ring, which needs a <textPath> in <defs>; they
// go in through `pane.add()`.
import { C, el, clamp, lerp, polar } from './lib/svg.js';
import { INK, element } from './lib/mol-draw.js';
import { metabolismPart, membranePart } from '../palette.js';
import { bench } from './lib/bench.js';

export const meta = {
  kind: 'calvin-cycle',
  title: 'The cycle with its books open',
  needsWebGL: false,
  aspect: 16 / 10,
  narrowAspect: 1,
};

// ---------------------------------------------------------------- the numbers

const ATP_KJ = 50;
const NADPH_KJ = 220;
const GLUCOSE_KJ = 2870;
const ACCEPTORS = 3;
const START_CARBONS = ACCEPTORS * 5;
// Each reaction's length in seconds of the cycle's own clock, at full supply in the light. A lit turn
// of three carbon dioxides is about 8.7 s, which is slow enough to watch and fast enough to run.
const BASE = Object.freeze({
  fix: 0.5, cut: 0.2, phosphorylate: 0.28, reduce: 0.28, revert: 0.24, export: 0.45, shuffle: 0.32, rebuild: 0.4,
});
// What a regulated enzyme keeps of its lit rate in the dark: "slows almost to nothing".
const DARK = 0.02;
// One press of Step runs the cycle to the end of the next reaction, but never for more than this many
// seconds of its own clock: in the dark a reaction takes fifty times as long, and a press that silently
// spent twenty-five seconds would hide the very thing the dark is for.
const STEP_CAP = 3;
// At night the starch grain is drawn down into sucrose, one G3P's worth every NIGHT_DRAW seconds.
const NIGHT_DRAW = 2.5;
const TRACE_EVERY = 0.5;
const TRACE_WINDOW = 96;

const PHASES = Object.freeze(['carboxylation', 'reduction', 'regeneration']);
const PHASE_OF = Object.freeze({
  fix: 'carboxylation', cut: 'carboxylation',
  phosphorylate: 'reduction', reduce: 'reduction', revert: 'reduction',
  export: 'regeneration', shuffle: 'regeneration', rebuild: 'regeneration',
});
const PHASE_WORD = Object.freeze({ carboxylation: 'Carboxylation', reduction: 'Reduction', regeneration: 'Regeneration' });

// Thioredoxin's four. Rubisco is not in this list and cannot be counted from it: it is switched on by
// the stroma's pH and magnesium, a separate mechanism (review of 2026-09-22, finding 18).
const TARGETS = Object.freeze([
  { id: 'gapdh', short: 'GAPDH', name: 'glyceraldehyde-3-phosphate dehydrogenase' },
  { id: 'fbpase', short: 'FBPase', name: 'fructose-1,6-bisphosphatase' },
  { id: 'sbpase', short: 'SBPase', name: 'sedoheptulose-1,7-bisphosphatase' },
  { id: 'prk', short: 'PRK', name: 'phosphoribulokinase' },
]);

// Where the carbons of the six-carbon compound go when it is cut. Indices 0–4 are the acceptor's C1–C5
// and 5 is the carbon the CO2 brought, which sits on C2. The cut falls between C2 and C3: the upper
// piece is the new carbon (which becomes its carboxyl, C1), C2 and C1; the lower is C3, C4 and C5.
const UPPER = Object.freeze([5, 1, 0]);
const LOWER = Object.freeze([2, 3, 4]);

// ---------------------------------------------------------------- colour

const ENZ = metabolismPart('enzyme');
const ATP = metabolismPart('atp');
const NADPH = metabolismPart('electronCarrierLoaded');
const SUGAR = membranePart('glucose');
const CARBON = element('C');
const OXYGEN = element('O');

const CSS = (scope) => `
${scope} .cc-head { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.09em; }
${scope} .cc-phase { fill: var(--ink-faint); font-weight: 600; letter-spacing: 0.14em; }
${scope} .cc-phase.is-now { fill: var(--ink); }
${scope} .cc-name { fill: var(--ink); font-weight: 600; }
${scope} .cc-note { fill: var(--ink-soft); }
${scope} .cc-faint { fill: var(--ink-faint); }
${scope} .cc-num { fill: var(--ink); font-weight: 650; font-variant-numeric: lining-nums tabular-nums; }
${scope} .cc-tab { font-variant-numeric: lining-nums tabular-nums; }
${scope} .cc-alert { fill: var(--coral-text); font-weight: 600; }
${scope} .cc-gold { fill: ${INK.gold}; font-weight: 600; }
${scope} .cc-halo { paint-order: stroke; stroke: var(--paper-2); stroke-width: 3px; stroke-linejoin: round; }
`;

const fmt = (v, dp = 1) => Number(v).toFixed(dp);
const round = (v, dp = 3) => Number(Number(v).toFixed(dp));
const sum = (o) => o.carboxylation + o.reduction + o.regeneration;

// ---------------------------------------------------------------- the model, pure

function freshModel() {
  return {
    simT: 0,
    rubp: Array.from({ length: ACCEPTORS }, () => ({ c: 5, lab: -1 })),
    six: null,
    pga: [],
    bpg: null,
    g3p: [],
    shuffle: [],
    co2Lab: false,
    event: null,
    done: 0,
    last: null,
    lastPhase: 'carboxylation',
    co2Fixed: 0,
    g3pMade: 0,
    g3pExported: 0,
    atp: { carboxylation: 0, reduction: 0, regeneration: 0 },
    nadph: { carboxylation: 0, reduction: 0, regeneration: 0 },
    sucrose: 0,
    sucroseLab: false,
    starch: [],
    nightClock: 0,
    traceClock: 0,
    trace: [{ sucrose: 0, starch: 0, lit: true }],
    book: null,
  };
}

// A reaction's rate as a fraction of its lit, fully supplied rate. Zero only for a reaction that needs
// a supply which is at zero, and `choose` never starts one of those.
function rateOf(kind, env) {
  const on = env.lightOn ? 1 : DARK;
  switch (kind) {
    case 'fix':
    case 'cut': return on; // rubisco: pH 8 and magnesium
    case 'phosphorylate': return env.atpSupply; // the kinase is not regulated; it waits for ATP
    case 'reduce': return on * env.nadphSupply; // GAPDH
    case 'shuffle': return on; // FBPase and SBPase
    case 'rebuild': return on * env.atpSupply; // PRK
    default: return 1; // revert, export
  }
}

// The reaction furthest round the ring that can go.
function choose(m, env) {
  if (m.six) return 'cut';
  if (m.bpg) return env.nadphSupply > 0 ? 'reduce' : 'revert';
  if (m.shuffle.length >= 5 && env.atpSupply > 0) return 'rebuild';
  if (m.g3p.some((g) => g.leaving)) return 'export';
  if (m.g3p.length) return 'shuffle';
  if (m.pga.length && env.atpSupply > 0 && env.nadphSupply > 0) return 'phosphorylate';
  if (m.rubp.length) return 'fix';
  return null;
}

function start(m, kind) {
  const ev = { kind, p: 0 };
  if (kind === 'fix') {
    ev.rubp = m.rubp.shift();
    ev.co2Lab = m.co2Lab;
    m.co2Lab = false;
  } else if (kind === 'cut') {
    ev.six = m.six;
    m.six = null;
  } else if (kind === 'phosphorylate') {
    ev.mol = m.pga.shift();
  } else if (kind === 'reduce' || kind === 'revert') {
    ev.mol = m.bpg;
    m.bpg = null;
  } else if (kind === 'export') {
    ev.mol = m.g3p.splice(m.g3p.findIndex((g) => g.leaving), 1)[0];
  } else if (kind === 'shuffle') {
    ev.mol = m.g3p.splice(m.g3p.findIndex((g) => !g.leaving), 1)[0];
  } else if (kind === 'rebuild') {
    ev.carbons = m.shuffle.splice(0, 5);
  }
  m.event = ev;
}

function complete(m, env) {
  const ev = m.event;
  m.event = null;
  m.done += 1;
  m.lastPhase = PHASE_OF[ev.kind];
  const last = { kind: ev.kind, made: [] };
  if (ev.kind === 'fix') {
    m.six = { c: 6, lab: ev.co2Lab ? 5 : ev.rubp.lab };
    m.co2Fixed += 1;
    last.made = [m.six];
  } else if (ev.kind === 'cut') {
    const upper = { c: 3, lab: UPPER.indexOf(ev.six.lab) };
    const lower = { c: 3, lab: LOWER.indexOf(ev.six.lab) };
    m.pga.push(lower, upper);
    last.made = [lower, upper];
  } else if (ev.kind === 'phosphorylate') {
    m.bpg = ev.mol;
    m.atp.reduction += 1;
    last.made = [ev.mol];
  } else if (ev.kind === 'reduce') {
    m.g3pMade += 1;
    const g = { c: 3, lab: ev.mol.lab, leaving: m.g3pMade % 6 === 0 };
    m.g3p.push(g);
    m.nadph.reduction += 1;
    last.made = [g];
  } else if (ev.kind === 'revert') {
    // The phosphorylation runs backwards and makes its ATP again, so the ledger takes it back.
    m.pga.unshift(ev.mol);
    m.atp.reduction -= 1;
    last.made = [ev.mol];
  } else if (ev.kind === 'export') {
    m.g3pExported += 1;
    m.book = { co2: m.co2Fixed, atp: sum(m.atp), nadph: sum(m.nadph) };
    if (env.exportTo === 'starch') m.starch.push(ev.mol.lab >= 0);
    else {
      m.sucrose += 1;
      if (ev.mol.lab >= 0) m.sucroseLab = true;
    }
    last.to = env.exportTo;
  } else if (ev.kind === 'shuffle') {
    last.before = m.shuffle.length;
    m.shuffle.push(ev.mol.lab === 0, ev.mol.lab === 1, ev.mol.lab === 2);
    last.after = m.shuffle.length;
  } else if (ev.kind === 'rebuild') {
    const r = { c: 5, lab: ev.carbons.findIndex(Boolean) };
    m.rubp.push(r);
    m.atp.regeneration += 1;
    last.made = [r];
    last.after = m.shuffle.length;
    last.before = last.after + 5;
  }
  m.last = last;
}

// Hand a reaction's inputs back. Only the three that need a supply can be cut off part way, and only
// by that supply going to zero.
function abort(m) {
  const ev = m.event;
  m.event = null;
  if (ev.kind === 'phosphorylate') m.pga.unshift(ev.mol);
  else if (ev.kind === 'reduce') m.bpg = ev.mol;
  else if (ev.kind === 'rebuild') m.shuffle.unshift(...ev.carbons);
}

// Run the cycle for `dt` seconds of its own clock. With `until`, stop the moment the reaction count
// reaches it, so a press of Step ends on the reaction it asked for and not on the first sixtieth of the
// next one; the clock, the night and the trace are then given only the time that was used.
function tick(m, env, dt, until = Infinity) {
  let budget = dt;
  for (let guard = 0; budget > 1e-9 && guard < 64; guard += 1) {
    if (m.done >= until) break;
    if (!m.event) {
      const next = choose(m, env);
      if (!next) break;
      start(m, next);
    }
    const r = rateOf(m.event.kind, env);
    if (r <= 0) {
      abort(m);
      continue;
    }
    const need = ((1 - m.event.p) * BASE[m.event.kind]) / r;
    if (need <= budget) {
      budget -= need;
      complete(m, env);
    } else {
      m.event.p += (budget * r) / BASE[m.event.kind];
      budget = 0;
    }
  }
  passTime(m, env, until === Infinity ? dt : dt - budget);
}

function passTime(m, env, dt) {
  m.simT += dt;
  // Night: the grain is drawn down into sucrose, oldest first, so a labelled G3P stored at dawn is
  // shipped before one stored at dusk.
  if (!env.lightOn && m.starch.length) {
    m.nightClock += dt;
    while (m.nightClock >= NIGHT_DRAW && m.starch.length) {
      m.nightClock -= NIGHT_DRAW;
      const labelled = m.starch.shift();
      m.sucrose += 1;
      if (labelled) m.sucroseLab = true;
    }
  } else m.nightClock = 0;
  m.traceClock += dt;
  while (m.traceClock >= TRACE_EVERY) {
    m.traceClock -= TRACE_EVERY;
    m.trace.push({ sucrose: m.sucrose, starch: m.starch.length, lit: env.lightOn });
    if (m.trace.length > TRACE_WINDOW * 2) m.trace.splice(0, m.trace.length - TRACE_WINDOW);
  }
}

// Every carbon the drawing puts on the ring, counted off the pools rather than off the books, so the
// books line compares two independent sums.
function carbonsOnRing(m) {
  let n = 5 * m.rubp.length + 3 * (m.pga.length + m.g3p.length) + m.shuffle.length;
  if (m.six) n += 6;
  if (m.bpg) n += 3;
  const ev = m.event;
  if (ev) {
    if (ev.kind === 'fix') n += 5;
    else if (ev.kind === 'cut') n += 6;
    else if (ev.kind === 'rebuild') n += 5;
    else n += 3;
  }
  return n;
}

function whereLabel(m) {
  if (m.co2Lab) return 'carbon dioxide';
  const ev = m.event;
  if (ev) {
    if (ev.kind === 'fix' && ev.co2Lab) return 'carbon dioxide';
    if (ev.kind === 'fix' && ev.rubp.lab >= 0) return 'RuBP';
    if (ev.kind === 'cut' && ev.six.lab >= 0) return 'six-carbon compound';
    if (ev.kind === 'phosphorylate' && ev.mol.lab >= 0) return '3-phosphoglycerate';
    if ((ev.kind === 'reduce' || ev.kind === 'revert') && ev.mol.lab >= 0) return '1,3-bisphosphoglycerate';
    if ((ev.kind === 'export' || ev.kind === 'shuffle') && ev.mol.lab >= 0) return 'G3P';
    if (ev.kind === 'rebuild' && ev.carbons.some(Boolean)) return 'shuffle';
  }
  if (m.six && m.six.lab >= 0) return 'six-carbon compound';
  if (m.pga.some((x) => x.lab >= 0)) return '3-phosphoglycerate';
  if (m.bpg && m.bpg.lab >= 0) return '1,3-bisphosphoglycerate';
  if (m.g3p.some((x) => x.lab >= 0)) return 'G3P';
  if (m.shuffle.some(Boolean)) return 'shuffle';
  if (m.rubp.some((x) => x.lab >= 0)) return 'RuBP';
  if (m.starch.some(Boolean)) return 'starch';
  if (m.sucroseLab) return 'sucrose';
  return null;
}

function clearLabels(m) {
  m.co2Lab = false;
  for (const x of [...m.rubp, ...m.pga, ...m.g3p]) x.lab = -1;
  if (m.six) m.six.lab = -1;
  if (m.bpg) m.bpg.lab = -1;
  m.shuffle = m.shuffle.map(() => false);
  m.starch = m.starch.map(() => false);
  m.sucroseLab = false;
  const ev = m.event;
  if (ev) {
    ev.co2Lab = false;
    for (const x of [ev.rubp, ev.six, ev.mol]) if (x) x.lab = -1;
    if (ev.carbons) ev.carbons = ev.carbons.map(() => false);
  }
}

// ---------------------------------------------------------------- typesetting
//
// `CO_2`, `Mg^{2+}`, `NADP^+`, `^{14}C`: a subscript or superscript is one character after `_` or `^`,
// or a braced group. Set as a tspan at 72% with its baseline moved, which is what <sub> and <sup> do in
// the prose; a Unicode subscript digit is a different glyph from a different face.
const MARK = /([_^])(?:\{([^}]*)\}|(.))/g;

function segments(str) {
  const out = [];
  let last = 0;
  MARK.lastIndex = 0;
  for (let hit = MARK.exec(str); hit; hit = MARK.exec(str)) {
    if (hit.index > last) out.push({ text: str.slice(last, hit.index), shift: null });
    out.push({ text: hit[2] ?? hit[3], shift: hit[1] === '_' ? 'sub' : 'sup' });
    last = MARK.lastIndex;
  }
  if (last < str.length) out.push({ text: str.slice(last), shift: null });
  return out;
}

// The string a reader hears: the marks dropped, so `CO_2` reads "CO2".
const plain = (str) => segments(str).map((s) => s.text).join('');

function typeset(svg) {
  for (const t of svg.querySelectorAll('text, textPath')) {
    if (t.tagName === 'text' && t.querySelector('textPath')) continue;
    const s = t.textContent;
    if (!s || !/[_^]/.test(s)) continue;
    t.textContent = '';
    for (const part of segments(s)) {
      if (!part.shift) t.append(part.text);
      else t.append(el('tspan', { 'baseline-shift': part.shift === 'sub' ? '-0.3em' : '0.55em', 'font-size': '72%', text: part.text }));
    }
  }
}

function markupButton(node, str) {
  for (const span of node.querySelectorAll('.tb-long, .tb-short')) {
    span.textContent = '';
    for (const part of segments(str)) {
      if (!part.shift) span.append(part.text);
      else {
        const tag = document.createElement(part.shift);
        tag.textContent = part.text;
        span.append(tag);
      }
    }
  }
}

// ---------------------------------------------------------------- the figure

export function mount(root, ctx) {
  const NARROW_W = 600;
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: NARROW_W }, seed: 20260923 });

  let m = freshModel();
  const env = { atpSupply: 1, nadphSupply: 1, lightOn: true, exportTo: 'sucrose' };
  // What the last press of Step did, when it did not finish a reaction: 'dark' when the cap ran out
  // part way through one, 'stuck' when nothing could start at all.
  let stepNote = null;

  // ---- panes ----
  const ring = b.pane('ring', {
    as: 'svg',
    focus: true,
    aria: 'The Calvin cycle as a ring, each intermediate a chain of carbon atoms, with a carbon counter in the middle. Press S or the right arrow to step one reaction, Space to run, L for the light, C to label a carbon dioxide, Home to reset.',
  });
  const ledger = b.pane('ledger', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 60fr) minmax(0, 40fr)',
      rows: 'minmax(0, 1fr)',
      at: { ring: [1, 1], ledger: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 66fr) minmax(0, 34fr)',
      at: { ring: [1, 1], ledger: [1, 2] },
    },
  });

  // ---- controls: what to run, what to switch, what to supply, where the sugar goes ----
  const stepBtn = b.action('Step', () => { stepOnce(); }, { primary: true, aria: 'Step, turn the cycle on by one reaction' });
  const runCtl = b.run({ primary: false, onChange: () => { stepNote = null; b.redraw(); b.announce(); } });
  b.action('Reset', () => reset(), { aria: 'Reset, put the cycle back as it opened' });
  b.divide();

  const lightCtl = b.toggle('Light', (on) => {
    env.lightOn = on;
    stepNote = null;
    b.redraw();
    b.announce();
  }, { pressed: true, aria: 'Light, switch the stroma between lit and dark' });
  const labelBtn = b.action('Label a CO2', () => {
    clearLabels(m);
    m.co2Lab = true;
    stepNote = null;
    b.redraw();
    b.announce();
  }, { aria: 'Label a CO2, mark the next carbon dioxide with carbon-14 and follow its carbon round' });
  markupButton(labelBtn, 'Label a CO_2');
  b.divide();

  const supply = (label, short, key) => b.stepper(label, {
    min: 0, max: 100, step: 10, value: 100, short,
    format: (v) => (Number(v) === 0 ? 'none' : `${v}%`),
    onInput: (v) => {
      env[key] = Number(v) / 100;
      stepNote = null;
      b.redraw();
      b.announce();
    },
  });
  const atpSlider = supply('ATP supply', 'ATP', 'atpSupply');
  const nadphSlider = supply('NADPH supply', 'NADPH', 'nadphSupply');
  b.divide();

  const pickExport = b.choice('Export', [
    { id: 'sucrose', label: 'Sucrose', aria: 'Sucrose, send each G3P that leaves out of the chloroplast to become sucrose' },
    { id: 'starch', label: 'Starch', aria: 'Starch, store each G3P that leaves in the stroma as starch' },
  ], (id) => {
    env.exportTo = id;
    b.redraw();
    b.announce();
  }, { value: 'sucrose', segmented: true });

  b.keys({
    ' ': () => runCtl.toggle(),
    ArrowRight: () => stepOnce(),
    s: () => stepOnce(),
    S: () => stepOnce(),
    l: () => lightCtl.toggle(),
    L: () => lightCtl.toggle(),
    c: () => labelBtn.click(),
    C: () => labelBtn.click(),
    Home: () => reset(),
  });

  // ---- reader actions ----

  // Run the cycle to the end of the next reaction, spending at most STEP_CAP of its own seconds. It is
  // the same `tick` the clock drives, in the same sixtieths, so a stepped cycle and a run one arrive at
  // the same states.
  function stepOnce() {
    if (b.playing) runCtl.set(false);
    stepNote = null;
    if (!m.event && !choose(m, env)) {
      stepNote = 'stuck';
    } else {
      const target = m.done + 1;
      let spent = 0;
      while (m.done < target && spent < STEP_CAP - 1e-9) {
        tick(m, env, 1 / 60, target);
        spent += 1 / 60;
        if (!m.event && m.done < target && !choose(m, env)) break;
      }
      if (m.done < target) stepNote = m.event ? 'dark' : 'stuck';
    }
    b.redraw();
    b.announce();
  }

  function reset() {
    m = freshModel();
    stepNote = null;
    env.atpSupply = 1;
    env.nadphSupply = 1;
    env.lightOn = true;
    env.exportTo = 'sucrose';
    runCtl.set(false);
    lightCtl.set(true, { quiet: true });
    atpSlider.set(100);
    nadphSlider.set(100);
    pickExport.set('sucrose', { quiet: true });
    b.restart();
    b.announce();
  }

  b.clock({
    step: 1 / 60,
    advance(dt) {
      if (b.playing) tick(m, env, dt);
    },
    restart() {
      m = freshModel();
      stepNote = null;
    },
  });

  // ---- what describe() reports ----
  function stalledPhase() {
    return env.atpSupply === 0 || env.nadphSupply === 0 ? 'reduction' : null;
  }
  function accumulating() {
    return stalledPhase() === 'reduction' && m.pga.length > 0 ? '3-phosphoglycerate' : null;
  }
  function sixCarbonLeftEnzyme() {
    const off = [...m.rubp, ...m.pga, ...m.g3p, m.bpg, m.event?.mol, m.event?.rubp];
    return off.some((x) => x && x.c === 6);
  }
  function state() {
    const lightOn = env.lightOn;
    const stromaPh = lightOn ? 8 : 7;
    const magnesiumInStroma = lightOn;
    const thioredoxinReduced = lightOn;
    const atpSpent = sum(m.atp);
    const nadphSpent = sum(m.nadph);
    return {
      phase: m.event ? PHASE_OF[m.event.kind] : m.lastPhase,
      turns: m.g3pExported,
      co2Fixed: m.co2Fixed,
      carbonsIn: m.co2Fixed,
      carbonsOut: 3 * m.g3pExported,
      sixCarbonLeftEnzyme: sixCarbonLeftEnzyme(),
      labelledAtomAt: whereLabel(m),
      atpSpent,
      nadphSpent,
      atpByPhase: { ...m.atp },
      nadphByPhase: { ...m.nadph },
      g3pExported: m.g3pExported,
      kjSpent: ATP_KJ * atpSpent + NADPH_KJ * nadphSpent,
      kjNeededPerGlucose: GLUCOSE_KJ,
      atpSupply: env.atpSupply,
      nadphSupply: env.nadphSupply,
      stalledPhase: stalledPhase(),
      accumulating: accumulating(),
      lightOn,
      stromaPh,
      magnesiumInStroma,
      thioredoxinReduced,
      rubiscoActivated: stromaPh === 8 && magnesiumInStroma,
      activatedEnzymes: TARGETS.filter(() => thioredoxinReduced).length,
      exportTo: env.exportTo,
      sucrosePool: m.sucrose,
      starchPool: m.starch.length,
      t: round(m.simT, 3),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // ---------------------------------------------------------------- words
  //
  // Every sentence below is read in every state its parts can take. Each is written with `_2` marks
  // and set by `typeset`; `plain` strips them for the live region.

  const LABEL_WORD = {
    'carbon dioxide': 'a carbon dioxide, waiting',
    RuBP: 'an acceptor, RuBP',
    'six-carbon compound': 'the six-carbon compound, on the enzyme',
    '3-phosphoglycerate': 'a 3-phosphoglycerate',
    '1,3-bisphosphoglycerate': 'a 1,3-bisphosphoglycerate',
    G3P: 'a G3P',
    shuffle: 'the regeneration’s sugars',
    sucrose: 'sucrose, exported',
    starch: 'the starch grain',
  };

  // The carbon counter: the sum the last reaction did, and a line under it saying what that was.
  function counter() {
    const last = m.last;
    const ev = m.event;
    const kind = ev ? ev.kind : last?.kind;
    const running = Boolean(ev);
    if (!kind) return { sum: `${ACCEPTORS} × 5 = ${START_CARBONS}`, says: 'three acceptors, loaded' };
    switch (kind) {
      case 'fix': return running ? { sum: '5 + 1', says: 'a CO_2 arrives at an acceptor' } : { sum: '5 + 1 = 6', says: 'six carbons, on the enzyme' };
      case 'cut': return running ? { sum: '6 = 3 + 3', says: 'cut in two, still on the enzyme' } : { sum: '6 = 3 + 3', says: 'cut in two before it leaves' };
      case 'phosphorylate': return { sum: '3 = 3', says: 'ATP puts a phosphate on first' };
      case 'reduce': return { sum: '3 = 3', says: 'then NADPH reduces it, to G3P' };
      case 'revert': return { sum: '3 = 3', says: 'no NADPH: the phosphate comes off' };
      case 'export': {
        const onRing = carbonsOnRing(m);
        return running ? { sum: `${onRing} − 3`, says: 'every sixth G3P leaves' } : { sum: `${onRing + 3} − 3 = ${onRing}`, says: `the sixth G3P leaves, as ${last.to}` };
      }
      case 'shuffle':
        return running ? { sum: `${m.shuffle.length} + 3`, says: 'into the regeneration' } : { sum: `${last.before} + 3 = ${last.after}`, says: 'into the regeneration' };
      case 'rebuild':
        return running ? { sum: `${m.shuffle.length + 5} = 5 + ${m.shuffle.length}`, says: 'ATP finishes a RuBP' } : { sum: `${last.before} = 5 + ${last.after}`, says: 'ATP finishes a RuBP' };
      default: return { sum: '', says: '' };
    }
  }

  // The running books. Its wording is the same at both widths; only the numbers move.
  function booksLine() {
    return `${START_CARBONS} + ${m.co2Fixed} in − ${3 * m.g3pExported} out = ${carbonsOnRing(m)} on the ring`;
  }

  // What the cycle is doing now, as a sentence. The order is the order a reader would ask in.
  function nowSentence(d, short = false) {
    if (d.stalledPhase) {
      const which = d.atpSupply === 0 && d.nadphSupply === 0 ? 'no ATP and no NADPH' : d.atpSupply === 0 ? 'no ATP' : 'no NADPH';
      const regen = d.atpSupply === 0 ? ' The regeneration has stalled too: it needs ATP to finish each RuBP.' : '';
      if (short) return `Stalled at the reduction: ${which}. 3-phosphoglycerate piles up.`;
      if (!m.rubp.length && m.pga.length) return `The reduction has stalled: ${which}. Rubisco needs neither, so it carried on until the acceptor ran out, and 3-phosphoglycerate has piled up behind the stall.${regen}`;
      return `The reduction has stalled: ${which}. Rubisco needs neither and carries on, so 3-phosphoglycerate piles up and the acceptor drains.${regen}`;
    }
    if (!d.lightOn) {
      if (short) return 'Dark: rubisco and thioredoxin’s four are off, so the cycle barely turns.';
      return 'The light is off. The stroma is at pH 7 with no Mg^{2+}, so rubisco is off, and thioredoxin is oxidised, so its four enzymes are off too. With ATP and NADPH supplied by hand it still barely turns: the light does not merely supply this cycle, it turns it on.';
    }
    if (m.six || m.event?.kind === 'cut') {
      if (short) return 'The six-carbon compound never leaves the enzyme.';
      return 'The six-carbon compound never leaves the enzyme: the active site adds water and cuts it in two within a fraction of a second. Catching it took stopping the enzyme with acid about twelve thousandths of a second in. Off the enzyme, half of it is still intact after an hour; it is the active site that is quick.';
    }
    if (d.labelledAtomAt) {
      const where = LABEL_WORD[d.labelledAtomAt];
      if (short) return `The labelled carbon is in ${where}.`;
      if (d.labelledAtomAt === '3-phosphoglycerate') return `The labelled carbon is in ${where}: the first compound Calvin’s group found the label in, a few seconds after feeding the algae ^{14}CO_2.`;
      if (d.labelledAtomAt === 'sucrose' || d.labelledAtomAt === 'starch') return `The labelled carbon has left the cycle, in ${where}. One G3P in every six leaves; the other five rebuild the acceptor.`;
      if (d.labelledAtomAt === 'RuBP') return `The labelled carbon is back in ${where}, rebuilt: five of every six G3P go on rebuilding the acceptor, so it goes round again.`;
      return `The labelled carbon is in ${where}.`;
    }
    if (short) return 'Nine ATP and six NADPH per three CO_2.';
    return 'Nine ATP and six NADPH per three CO_2. A third of the ATP, and five of every six sugars made, go on rebuilding the acceptor: that is not overhead, it is what makes this a cycle.';
  }

  b.onAnnounce((d) => {
    const c = counter();
    const step = stepNote === 'stuck'
      ? 'Nothing can happen next. '
      : stepNote === 'dark' ? 'No reaction finished in that step. ' : '';
    return plain(`${step}${c.sum}: ${c.says}. ${booksLine()}. ${nowSentence(d, true)}`);
  });

  // ---------------------------------------------------------------- the ring

  // Where things sit round the ring, in degrees clockwise from twelve o'clock. The four pools take the
  // four diagonals, which is where a pane has the most room outside a circle; the inputs come in at the
  // sides, the carbon dioxide at the top, and the sugar leaves at the bottom.
  const AT = Object.freeze({
    rubisco: 0, pga: 45, pgk: 78, gapdh: 102, g3p: 135, exit: 180, fbpase: 202, pool: 225, sbpase: 248, prk: 282, rubp: 315,
  });
  // The phases as arcs of the ring: carboxylation from the acceptor round to 3-phosphoglycerate,
  // reduction from there to the exit, regeneration from the exit back to the acceptor.
  const ARC = Object.freeze({
    carboxylation: [AT.rubp, AT.pga + 360],
    reduction: [AT.pga, AT.exit],
    regeneration: [AT.exit, AT.rubp],
  });

  const P = (g, deg, r = g.R) => polar(g.cx, g.cy, r, deg);

  // Every size on the ring comes from the pane: the carbon's radius `r` and the bond `s` from its short
  // side, the ring's radius from what the pools, the inputs and the exit leave room for.
  function geometry(w, hgt, narrow) {
    const short = Math.min(w, hgt);
    const fs = narrow ? clamp(Math.min(w / 40, hgt / 17), 7.2, 8.8) : clamp(short / 46, 8.8, 10.8);
    const r = narrow ? clamp(short * 0.0195, 2.5, 3.8) : clamp(short * 0.0128, 3.4, 6.4);
    const s = r * 2.3;
    const g = { w, h: hgt, narrow, fs, r, s };
    // Rubisco holds the six-carbon compound and its own name under it; the other sites hold a chain.
    g.rub = narrow
      ? { rx: (4 * s + 2 * r) / 2 + s * 1.2, ry: s * 1.75 + r }
      : { rx: (4 * s + 2 * r) / 2 + s * 1.05, ry: s * 1.5 + r };
    const pad = narrow ? r * 0.6 : s * 0.4;
    g.site3 = { rx: s + r + pad, ry: r + pad };
    g.site5 = { rx: 2 * s + r + pad, ry: r + pad };
    g.dr = r * 1.3; // a currency disc
    g.gap = narrow ? r * 2.4 : r * 3;
    const top = g.rub.ry + r * 4.6 + 3;
    const bottom = narrow ? fs * 2.4 + 3 : fs * 5.4 + 4;
    const inLabel = fs * 0.56 * (narrow ? 'NADPH'.length : 'NADPH 100%'.length);
    const side = narrow
      ? Math.max(g.site3.ry + r * 2 + g.dr * 2 + inLabel + 6, w * 0.2)
      : Math.max(g.site3.ry + r * 3 + g.dr * 2 + inLabel + 10, 4 * s + 2 * r + 30);
    g.R = clamp(Math.min(w / 2 - side, (hgt - top - bottom) / 2), 24, 260);
    g.cx = w / 2;
    g.cy = top + g.R + Math.max(0, hgt - top - bottom - 2 * g.R) / 2;
    return g;
  }

  function arcD(g, radius, a1, a2) {
    const [x1, y1] = P(g, a1, radius);
    const [x2, y2] = P(g, a2, radius);
    const sweep = (((a2 - a1) % 360) + 360) % 360;
    return `M${fmt(x1, 2)} ${fmt(y1, 2)} A${fmt(radius, 2)} ${fmt(radius, 2)} 0 ${sweep > 180 ? 1 : 0} 1 ${fmt(x2, 2)} ${fmt(y2, 2)}`;
  }

  // One carbon. The labelled one is gold with a ring round it; a carbon the last reaction touched
  // carries an ink edge instead of the paper one.
  function carbon(x, y, g, { labelled = false, touched = false, parent } = {}) {
    ring.circle(x, y, g.r, {
      fill: labelled ? INK.gold : CARBON.fill,
      stroke: touched ? C.ink : 'var(--paper-2)',
      'stroke-width': fmt(touched ? Math.max(0.9, g.r * 0.26) : g.r * 0.32, 2),
    }, parent);
    if (labelled) ring.circle(x, y, g.r * 1.66, { fill: 'none', stroke: INK.gold, 'stroke-width': fmt(Math.max(1, g.r * 0.3), 2) }, parent);
  }

  // A chain of `n` carbons centred on (x, y), left to right. `branch` hangs a sixth carbon above C2,
  // which is the six-carbon compound; `split` opens the C2–C3 bond by that many pixels, which is its
  // cut. Drawn into `parent`, so a site on the ring can turn it to lie along the ring.
  function chain(x, y, n, g, { lab = -1, touched = false, branch = false, split = 0, parent } = {}) {
    const x0 = x - chainW(n, g) / 2 - split / 2;
    const pts = [];
    for (let i = 0; i < n; i += 1) pts.push([x0 + i * g.s + (branch && i >= 2 ? split : 0), y]);
    if (branch) pts.push([x0 + g.s, y - g.s * 0.98]);
    const bond = (a, c) => ring.line(a[0], a[1], c[0], c[1], { stroke: C.soft, 'stroke-width': fmt(Math.max(0.8, g.r * 0.46), 2), 'stroke-linecap': 'round' }, parent);
    for (let i = 0; i + 1 < n; i += 1) {
      if (branch && i === 1 && split > 0.5) continue;
      bond(pts[i], pts[i + 1]);
    }
    if (branch) bond(pts[1], pts[5]);
    pts.forEach(([px, py], i) => carbon(px, py, g, { labelled: i === lab, touched, parent }));
  }
  const chainW = (n, g) => (n - 1) * g.s;

  function co2Glyph(x, y, g, labelled) {
    const d = g.s * 0.92;
    for (const sgn of [-1, 1]) {
      for (const off of [-g.r * 0.3, g.r * 0.3]) ring.line(x, y + off, x + sgn * d, y + off, { stroke: C.soft, 'stroke-width': fmt(Math.max(0.7, g.r * 0.24), 2) });
      ring.circle(x + sgn * d, y, g.r * 0.9, { fill: OXYGEN.fill, stroke: 'var(--paper-2)', 'stroke-width': fmt(g.r * 0.3, 2) });
    }
    carbon(x, y, g, { labelled });
  }

  // A stack of chains, rows first then columns. (ax, ay) is the corner nearest the ring; `dx` and `dy`
  // say which way the stack grows from it. Returns the box it drew in.
  function stack(mols, n, ax, ay, dx, dy, g, { maxRows = 3, touched = [] } = {}) {
    const cw = chainW(n, g) + g.r * 2;
    const colGap = g.s * 0.9;
    const pitch = g.r * 2 + g.s * 0.46;
    const rows = Math.max(1, Math.min(maxRows, mols.length));
    const cols = Math.max(1, Math.ceil(mols.length / maxRows));
    const bw = cols * cw + (cols - 1) * colGap;
    const bh = rows * pitch - (pitch - g.r * 2);
    const x0 = dx > 0 ? ax : ax - bw;
    const y0 = dy > 0 ? ay : ay - bh;
    mols.forEach((mol, i) => {
      const col = Math.floor(i / maxRows);
      const row = i % maxRows;
      // Rows fill from the ring outwards, so a pool that shrinks shrinks back towards the ring.
      const yRow = dy > 0 ? y0 + g.r + row * pitch : y0 + bh - g.r - row * pitch;
      const xCol = dx > 0 ? x0 + cw / 2 + col * (cw + colGap) : x0 + bw - cw / 2 - col * (cw + colGap);
      chain(xCol, yRow, n, g, { lab: mol.lab, touched: touched.includes(mol) });
    });
    return { x: x0, y: y0, w: mols.length ? bw : 0, h: mols.length ? bh : 0 };
  }

  const SWITCHED_OFF = { fill: 'var(--paper-3)', stroke: C.ruleStrong, 'stroke-width': 1.1, 'stroke-dasharray': '3 2.4' };

  // A site on the ring that holds its substrate: an ellipse lying along the ring at `deg`, and a group
  // turned the same way for whatever it holds.
  function site(g, deg, size, on) {
    const [x, y] = P(g, deg);
    const grp = ring.group({ transform: `translate(${fmt(x, 2)} ${fmt(y, 2)}) rotate(${fmt(deg, 2)})` });
    ring.ellipse(0, 0, size.rx, size.ry, on ? { fill: ENZ.color } : SWITCHED_OFF, grp);
    return grp;
  }

  // The name an enzyme is labelled with, and under it the switch it carries, set inside the ring
  // beside it. `side` is which way the words run from the anchor.
  function siteName(g, deg, size, name, mark, anchor) {
    if (g.narrow) return;
    const [x, y] = P(g, deg, g.R - size.ry - g.fs * 0.55);
    const fs = g.narrow ? Math.max(6.8, g.fs * 0.84) : g.fs * 0.88;
    const lines = mark ? [name, mark] : [name];
    const lh = fs * 1.2;
    const y0 = y - ((lines.length - 1) * lh) / 2 + fs * 0.35;
    lines.forEach((line, i) => ring.text(x, y0 + i * lh, line, {
      anchor, 'font-size': fmt(i ? fs * 0.86 : fs), class: i ? 'cc-note' : 'cc-name',
    }));
  }

  // An enzyme that holds nothing the figure draws: its name on it, and its switch under the name.
  function bead(g, deg, name, on, mark) {
    const [x, y] = P(g, deg);
    if (g.narrow) {
      ring.ellipse(x, y, g.r * 2.3, g.r * 1.5, on ? { fill: ENZ.color } : SWITCHED_OFF);
      return;
    }
    const fs = g.narrow ? Math.max(6.8, g.fs * 0.84) : g.fs * 0.88;
    const ms = fs * 0.84;
    const wide = Math.max(fs * name.length * 0.62, mark ? ms * 5 * 0.62 : 0);
    const rx = wide / 2 + fs * 0.75;
    const ry = mark ? fs * 1.42 : fs * 0.95;
    ring.ellipse(x, y, rx, ry, on ? { fill: ENZ.color } : SWITCHED_OFF);
    const ink = `fill:${on ? ENZ.symbolColor : 'var(--ink-soft)'}`;
    ring.text(x, y + (mark ? -fs * 0.1 : fs * 0.35), name, { anchor: 'middle', 'font-size': fmt(fs), 'font-weight': 600, style: ink });
    if (mark) ring.text(x, y + fs * 0.98, mark, { anchor: 'middle', 'font-size': fmt(ms), style: ink });
  }

  function currency(x, y, g, part, on) {
    if (on) ring.circle(x, y, g.dr, { fill: part.color, stroke: 'var(--paper-2)', 'stroke-width': fmt(g.r * 0.3, 2) });
    else ring.circle(x, y, g.dr, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.1, 'stroke-dasharray': '2.4 2' });
  }

  function drawRing() {
    const { w, h: hgt } = ring.clear().box;
    const g = geometry(w, hgt, b.narrow);
    const d = state();

    // ---- the ring, the arc of the phase now working, the phase boundaries, the direction ----
    ring.circle(g.cx, g.cy, g.R, { fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1.3 });
    const [a1, a2] = ARC[d.phase];
    ring.path(arcD(g, g.R, a1, a2), { fill: 'none', stroke: C.ink, 'stroke-width': 2.2 });
    for (const at of [AT.pga, AT.exit, AT.rubp]) {
      const [x1, y1] = P(g, at, g.R - 5);
      const [x2, y2] = P(g, at, g.R + 5);
      ring.line(x1, y1, x2, y2, { stroke: C.ink, 'stroke-width': 1.3 });
    }
    for (const at of [30, 158, 225]) {
      const [x, y] = P(g, at);
      const th = (at * Math.PI) / 180;
      const tx = Math.cos(th);
      const ty = Math.sin(th);
      const k = clamp(g.r * 1.25, 3.4, 6.4);
      ring.path(`M${fmt(x - tx * k - ty * k * 0.75, 2)} ${fmt(y - ty * k + tx * k * 0.75, 2)} L${fmt(x, 2)} ${fmt(y, 2)} L${fmt(x - tx * k + ty * k * 0.75, 2)} ${fmt(y - ty * k - tx * k * 0.75, 2)}`, {
        fill: 'none', stroke: C.ink, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      });
    }

    drawStations(g, d);

    // ---- the phase names, inside the ring and square to the page ----
    const ps = g.narrow ? Math.max(6.8, g.fs * 0.8) : g.fs * 0.84;
    const under = g.cy - g.R + g.rub.ry + (g.narrow ? ps * 1.6 : g.fs * 2.2 + ps * 1.5);
    const names = {
      carboxylation: [g.cx, under],
      reduction: [g.cx + g.R * 0.42, g.cy + g.R * 0.56],
      regeneration: [g.cx - g.R * 0.42, g.cy + g.R * 0.56],
    };
    for (const phase of g.narrow ? [] : PHASES) {
      const [x, y] = names[phase];
      ring.text(x, y, phase.toUpperCase(), { anchor: 'middle', 'font-size': fmt(ps), class: `cc-phase${phase === d.phase ? ' is-now' : ''}` });
    }

    drawCentre(g);
    drawCorners(g);
    ring.focusMark();
    typeset(ring.node);
  }

  function drawStations(g, d) {
    const { fs, r, s } = g;
    const lit = env.lightOn;
    const ev = m.event;
    const touched = ev ? [] : (m.last?.made ?? []);
    const switchMark = (on) => (g.narrow ? null : on ? 'SH HS' : 'S–S');

    // ---- rubisco at twelve o'clock: its active site, and its name under what it holds ----
    const [rx0, ry0] = P(g, AT.rubisco);
    ring.ellipse(rx0, ry0, g.rub.rx, g.rub.ry, lit ? { fill: ENZ.color } : SWITCHED_OFF);
    const siteY = ry0 - s * 0.12;
    if (ev?.kind === 'fix') {
      chain(rx0, siteY, 5, g, { lab: ev.rubp.lab });
    } else if (ev?.kind === 'cut') {
      chain(rx0, siteY, 5, g, { lab: ev.six.lab, branch: true, split: ev.p * s * 1.2 });
    } else if (m.six) {
      chain(rx0, siteY, 5, g, { lab: m.six.lab, branch: true, touched: true });
    }
    const nameFs = g.narrow ? Math.max(6.8, fs * 0.84) : fs * 0.88;
    ring.text(rx0, ry0 + g.rub.ry * 0.66, 'rubisco', { anchor: 'middle', 'font-size': fmt(nameFs), 'font-weight': 600, style: `fill:${lit ? ENZ.symbolColor : 'var(--ink-soft)'}` });
    // Its switch is the stroma's pH and magnesium, and it is not one of thioredoxin's.
    if (!g.narrow) ring.text(rx0, ry0 + g.rub.ry + fs * 1.3, lit ? 'on: pH 8, Mg^{2+}' : 'off: pH 7, no Mg^{2+}', { anchor: 'middle', 'font-size': fmt(fs * 0.86), class: 'cc-note cc-tab' });

    // The carbon dioxide waits above the enzyme, and comes down onto C2.
    const co2Y = ry0 - g.rub.ry - r * 3;
    const c2x = rx0 - s;
    const inFlight = ev?.kind === 'fix';
    const labelled = m.co2Lab || (inFlight && ev.co2Lab);
    co2Glyph(inFlight ? lerp(rx0, c2x, ev.p) : rx0, inFlight ? lerp(co2Y, siteY - s * 0.98, ev.p) : co2Y, g, inFlight ? ev.co2Lab : m.co2Lab);
    if (!g.narrow) ring.text(rx0 - s * 1.95, co2Y + fs * 0.35, labelled ? '^{14}CO_2, labelled' : 'CO_2 from the air', { anchor: 'end', 'font-size': fmt(fs), class: labelled ? 'cc-gold' : 'cc-note' });
    else if (labelled) ring.text(rx0 - s * 1.6, co2Y + fs * 0.35, '^{14}C', { anchor: 'end', 'font-size': fmt(fs), class: 'cc-gold' });

    // ---- the reduction: the kinase puts a phosphate on, then GAPDH reduces ----
    const pgk = site(g, AT.pgk, g.site3, true);
    const gapdh = site(g, AT.gapdh, g.site3, lit);
    if (ev?.kind === 'phosphorylate') chain(0, 0, 3, g, { lab: ev.mol.lab, parent: pgk });
    if (ev && (ev.kind === 'reduce' || ev.kind === 'revert')) chain(0, 0, 3, g, { lab: ev.mol.lab, parent: gapdh });
    else if (m.bpg) chain(0, 0, 3, g, { lab: m.bpg.lab, parent: gapdh, touched: !ev });
    siteName(g, AT.pgk, g.site3, 'kinase', null, 'end');
    siteName(g, AT.gapdh, g.site3, 'GAPDH', switchMark(lit), 'end');

    // ---- the regeneration: two phosphatases in the shuffle, and PRK to finish each RuBP ----
    bead(g, AT.fbpase, 'FBPase', lit, switchMark(lit));
    bead(g, AT.sbpase, 'SBPase', lit, switchMark(lit));
    const prk = site(g, AT.prk, g.site5, lit);
    if (ev?.kind === 'rebuild') chain(0, 0, 5, g, { lab: ev.carbons.findIndex(Boolean), parent: prk });
    siteName(g, AT.prk, g.site5, 'PRK', switchMark(lit), 'start');

    // ---- the pools ----
    const count = (name, n) => `${name} · ${n}`;
    const [ubx, uby] = P(g, AT.rubp, g.R + g.gap);
    const rubpBox = stack(m.rubp, 5, ubx, uby, -1, -1, g, { maxRows: g.narrow ? 2 : 3, touched });
    ring.text(ubx, (m.rubp.length ? rubpBox.y : uby) - fs * 0.7, count('RuBP', m.rubp.length), { anchor: 'end', 'font-size': fmt(fs), class: m.rubp.length ? 'cc-name cc-tab' : 'cc-alert cc-tab' });

    const [pgx, pgy] = P(g, AT.pga, g.R + g.gap);
    const pgaBox = stack(m.pga, 3, pgx, pgy, 1, -1, g, { maxRows: g.narrow ? 2 : 4, touched });
    const piling = d.accumulating !== null;
    const pgaTop = (m.pga.length ? pgaBox.y : pgy) - fs * 0.7;
    if (g.narrow) {
      ring.text(pgx, pgaTop, `${count('3-PG', m.pga.length)}${piling ? ', piling up' : ''}`, { 'font-size': fmt(fs), class: piling ? 'cc-alert cc-tab' : 'cc-name cc-tab' });
    } else {
      ring.text(pgx, pgaTop, count('3-phosphoglycerate', m.pga.length), { 'font-size': fmt(fs), class: piling ? 'cc-alert cc-tab' : 'cc-name cc-tab' });
      if (piling) ring.text(pgx, pgaTop - fs * 1.2, 'piling up', { 'font-size': fmt(fs), class: 'cc-alert' });
    }

    const [gx, gy] = P(g, AT.g3p, g.R + g.gap);
    const g3pBox = stack(m.g3p, 3, gx, gy, 1, 1, g, { maxRows: g.narrow ? 1 : 3, touched });
    if (g.narrow) ring.text(gx + g3pBox.w + fs * 0.5, gy + g.r + fs * 0.35, count('G3P', m.g3p.length), { 'font-size': fmt(fs), class: 'cc-name cc-tab' });
    else ring.text(gx, gy + g3pBox.h + fs * 1.3, count('G3P', m.g3p.length), { 'font-size': fmt(fs), class: 'cc-name cc-tab' });

    // The shuffle's loose carbons: each G3P's three go in, and five come out as a RuBP.
    const [sx, sy] = P(g, AT.pool, g.R + g.gap);
    const perRow = 5;
    const pitch = r * 2.55;
    const n = m.shuffle.length;
    const justIn = !ev && m.last?.kind === 'shuffle' ? m.last.before : Infinity;
    for (let i = 0; i < n; i += 1) {
      carbon(sx - r - (i % perRow) * pitch, sy + r + Math.floor(i / perRow) * pitch, g, { labelled: m.shuffle[i], touched: i >= justIn });
    }
    const poolRows = Math.ceil(n / perRow);
    if (g.narrow) ring.text(sx - Math.min(n, perRow) * pitch - fs * 0.4, sy + r + fs * 0.35, count('shuffle', n), { anchor: 'end', 'font-size': fmt(fs), class: 'cc-name cc-tab' });
    else ring.text(sx, sy + poolRows * pitch + fs * 1.3, `the shuffle · ${n} ${n === 1 ? 'carbon' : 'carbons'}`, { anchor: 'end', 'font-size': fmt(fs), class: 'cc-name cc-tab' });

    // ---- the inputs: ATP into the kinase, NADPH into GAPDH, ATP into PRK ----
    const atpOn = env.atpSupply > 0;
    const nadphOn = env.nadphSupply > 0;
    const pct = (v) => `${Math.round(v * 100)}%`;
    const outR = g.R + g.site3.ry + r * 2 + g.dr;
    const [ax, ay] = P(g, AT.pgk, outR);
    const [nx, ny] = P(g, AT.gapdh, outR);
    currency(ax, ay, g, ATP, atpOn);
    currency(nx, ny, g, NADPH, nadphOn);
    const inWord = (word, on, v) => (on ? (g.narrow ? word : `${word} ${pct(v)}`) : `no ${word}`);
    ring.text(ax + g.dr + fs * 0.45, ay + fs * 0.35, inWord('ATP', atpOn, env.atpSupply), { 'font-size': fmt(fs), class: atpOn ? 'cc-name cc-tab' : 'cc-alert' });
    ring.text(nx + g.dr + fs * 0.45, ny + fs * 0.35, inWord('NADPH', nadphOn, env.nadphSupply), { 'font-size': fmt(fs), class: nadphOn ? 'cc-name cc-tab' : 'cc-alert' });
    const [kx, ky] = P(g, AT.prk, g.R + g.site5.ry + r * 2 + g.dr);
    currency(kx, ky, g, ATP, atpOn);
    ring.text(kx - g.dr - fs * 0.45, ky + fs * 0.35, atpOn ? 'ATP' : 'no ATP', { anchor: 'end', 'font-size': fmt(fs), class: atpOn ? 'cc-name' : 'cc-alert' });

    // The currency travelling into the site that spends it.
    const moving = (fromX, fromY, deg, part) => {
      const [tx, ty] = P(g, deg);
      ring.circle(lerp(fromX, tx, ev.p), lerp(fromY, ty, ev.p), g.dr, { fill: part.color, stroke: 'var(--paper-2)', 'stroke-width': fmt(r * 0.3, 2) });
    };
    if (ev?.kind === 'phosphorylate') moving(ax, ay, AT.pgk, ATP);
    if (ev?.kind === 'reduce') moving(nx, ny, AT.gapdh, NADPH);
    if (ev?.kind === 'rebuild') moving(kx, ky, AT.prk, ATP);

    // ---- a G3P on its way: into the shuffle, or out through the exit ----
    const [ex0, ey0] = P(g, AT.exit, g.R + 1.5);
    const forkY = ey0 + (g.narrow ? fs * 0.8 : fs * 1.9);
    const spread = g.R * (g.narrow ? 0.5 : 0.56);
    const drop = g.narrow ? fs * 0.7 : fs * 1.2;
    if (ev?.kind === 'shuffle') {
      const [x, y] = P(g, lerp(AT.g3p, AT.pool, ev.p), g.R + g.gap + r * 1.6);
      chain(x, y, 3, g, { lab: ev.mol.lab });
    }

    // ---- the exit: every sixth G3P leaves, to sucrose or to starch ----
    ring.line(ex0, ey0, ex0, forkY, { stroke: C.ink, 'stroke-width': 1.3 });
    for (const [side, key] of [[-1, 'sucrose'], [1, 'starch']]) {
      const on = env.exportTo === key;
      const endX = ex0 + side * spread;
      const endY = forkY + drop;
      ring.path(`M${fmt(ex0, 2)} ${fmt(forkY, 2)} Q${fmt(ex0 + side * spread * 0.6, 2)} ${fmt(forkY, 2)} ${fmt(endX, 2)} ${fmt(endY, 2)}`, {
        fill: 'none', stroke: on ? C.ink : C.ruleStrong, 'stroke-width': on ? 1.4 : 1.1, 'stroke-dasharray': on ? null : '3 3',
      });
      const pool = key === 'sucrose' ? m.sucrose : m.starch.length;
      const word = g.narrow ? key : (key === 'sucrose' ? 'sucrose, shipped' : 'starch, stored');
      const at = g.narrow ? [endX + side * fs * 0.45, endY + fs * 0.35] : [endX + side * fs * 0.2, endY + fs * 1.3];
      ring.text(at[0], at[1], count(word, pool), { anchor: side < 0 ? 'end' : 'start', 'font-size': fmt(fs), class: on ? 'cc-name cc-tab' : 'cc-note cc-tab' });
    }
    if (ev?.kind === 'export') {
      const side = env.exportTo === 'sucrose' ? -1 : 1;
      const k = ev.p;
      const [fx, fy] = P(g, AT.g3p, g.R + g.gap + r);
      const x = k < 0.45 ? lerp(fx, ex0, k / 0.45) : lerp(ex0, ex0 + side * spread, (k - 0.45) / 0.55);
      const y = k < 0.45 ? lerp(fy, forkY, k / 0.45) : lerp(forkY, forkY + drop, (k - 0.45) / 0.55);
      chain(x, y, 3, g, { lab: ev.mol.lab });
    }
  }

  function drawCentre(g) {
    const c = counter();
    const big = g.narrow ? clamp(g.R * 0.3, 11, 17) : clamp(g.R * 0.16, 15, 28);
    const y0 = g.cy - g.R * (g.narrow ? 0.0 : 0.05);
    ring.text(g.cx, y0, c.sum, { anchor: 'middle', 'font-size': fmt(big), class: 'cc-num' });
    if (!g.narrow) {
      ring.text(g.cx, y0 + g.fs * 1.8, c.says, { anchor: 'middle', 'font-size': fmt(g.fs * 0.96), class: 'cc-note' });
      ring.text(g.cx, y0 + g.fs * 3.55, booksLine(), { anchor: 'middle', 'font-size': fmt(g.fs * 0.9), class: 'cc-faint cc-tab' });
    } else {
      const phase = m.event ? PHASE_OF[m.event.kind] : m.lastPhase;
      ring.text(g.cx, y0 + g.fs * 1.55, phase.toUpperCase(), { anchor: 'middle', 'font-size': fmt(Math.max(6.8, g.fs * 0.8)), class: 'cc-phase is-now' });
    }
  }

  function drawCorners(g) {
    const { fs } = g;
    const pad = 4;
    const lit = env.lightOn;
    ring.text(pad, pad + fs * 0.9, lit ? 'THE STROMA, LIT' : 'THE STROMA, DARK', { 'font-size': fmt(fs * 0.84), class: 'cc-head' });
    if (!g.narrow) ring.text(pad, pad + fs * 2.25, lit ? 'thioredoxin reduced' : 'thioredoxin oxidised', { 'font-size': fmt(fs * 0.9), class: 'cc-note' });
    if (stepNote) {
      const msg = stepNote === 'stuck' ? 'Nothing can happen next.' : g.narrow ? 'No reaction finished.' : 'No reaction finished in that step.';
      // On a phone the foot holds the two sugar pools, so the note takes the line under the heading.
      if (g.narrow) ring.text(pad, pad + fs * 2.2, msg, { 'font-size': fmt(fs), class: 'cc-alert' });
      else ring.text(g.w - pad, pad + fs * 0.9, msg, { anchor: 'end', 'font-size': fmt(fs * 0.95), class: 'cc-alert' });
    }
  }

  // ---------------------------------------------------------------- the ledger

  // The per-CO2 and per-glucose lines are read off the books as they stood at the end of the last
  // complete turn, never off a turn in progress: half way round, the reduction has been paid for and
  // the regeneration has not, and a ratio taken then said 2 ATP per CO2, or 957 per cent efficient.
  function perTurn() {
    const bk = m.book;
    if (!bk || !bk.co2) return null;
    const atp = bk.atp / bk.co2;
    const nadph = bk.nadph / bk.co2;
    return { atp, nadph, atpGlucose: atp * 6, nadphGlucose: nadph * 6, kjGlucose: 6 * (atp * ATP_KJ + nadph * NADPH_KJ) };
  }
  const num = (v, dp = 0) => (Number.isInteger(v) ? String(v) : fmt(v, dp));

  function drawLedger() {
    const { w, h: hgt } = ledger.clear().box;
    const d = state();
    const pt = perTurn();
    const pad = b.narrow ? 2 : 6;
    const width = Math.max(40, w - pad * 2);
    if (b.narrow) {
      const r = ledger.readout({ x: pad, width, size: 9.6, minRow: 12, maxRow: 22 });
      r.fit(hgt, (t, level) => {
        t.note(booksLine());
        for (const ph of PHASES) t.row(PHASE_WORD[ph], `${d.atpByPhase[ph]} ATP · ${d.nadphByPhase[ph]} NADPH`);
        t.sum('Spent', `${d.atpSpent} ATP · ${d.nadphSpent} NADPH`);
        if (level < 2) t.row('Per glucose, kJ', pt ? `${num(pt.kjGlucose)} for ${GLUCOSE_KJ}` : `— for ${GLUCOSE_KJ}`);
        if (level < 1) t.note(nowSentence(d, true));
      }, { levels: 3 });
      typeset(ledger.node);
      return;
    }
    const traceH = clamp(hgt * 0.17, 46, 90);
    const r = ledger.readout({ title: 'THE LEDGER', columns: ['ATP', 'NADPH'], x: pad, width, size: 10.4, minRow: 13, maxRow: 24 });
    const dash = '—';
    r.fit(hgt - traceH - 12, (t, level) => {
      for (const ph of PHASES) t.row(PHASE_WORD[ph], [String(d.atpByPhase[ph]), String(d.nadphByPhase[ph])]);
      t.sum('Spent so far', [String(d.atpSpent), String(d.nadphSpent)]);
      t.head('PER COMPLETE TURN');
      t.row('Per CO_2 fixed', pt ? [num(pt.atp, 2), num(pt.nadph, 2)] : [dash, dash]);
      t.row('Per glucose, six CO_2', pt ? [num(pt.atpGlucose, 1), num(pt.nadphGlucose, 1)] : [dash, dash]);
      t.row('In kJ, at 50 and 220', pt ? [num(pt.atpGlucose * ATP_KJ), num(pt.nadphGlucose * NADPH_KJ)] : [dash, dash]);
      t.sum('Spent per glucose, kJ', ['', pt ? num(pt.kjGlucose) : dash]);
      t.row('A glucose holds, kJ', ['', String(GLUCOSE_KJ)]);
      if (level < 2) t.note(efficiencySentence(pt));
      t.head('NOW');
      t.note(nowSentence(d, level >= 1));
    }, { levels: 3 });
    drawTrace(pad, hgt - traceH, width, traceH - 4);
    typeset(ledger.node);
  }

  function efficiencySentence(pt) {
    if (!pt) return 'These fill at the end of the first complete turn: three CO_2 in, one G3P out, and the books balanced.';
    const pct = Math.round((GLUCOSE_KJ / pt.kjGlucose) * 100);
    return `${GLUCOSE_KJ} of ${num(pt.kjGlucose)} kJ ends up in the sugar: about ${pct} per cent, roughly four-fifths efficient, and about a quarter more spent than the minimum.`;
  }

  // Sucrose and starch on one scale, in G3P, so a night's drawdown reads as one line falling while the
  // other rises by the same amount.
  function drawTrace(x, y, width, height) {
    const fs = 9.2;
    ledger.text(x, y + fs, 'SUGAR, IN G3P, OVER A DAY AND A NIGHT', { 'font-size': fmt(fs), class: 'tb-rt-head' });
    const top = y + fs + 9;
    const base = y + height - fs * 1.25;
    const kept = m.trace.slice(-TRACE_WINDOW);
    // A single sample is still a line: the pools as they stand, level, until the clock moves them.
    const rows = kept.length >= 2 ? kept : [kept[0], kept[0]];
    const hi = Math.max(4, ...rows.map((r) => Math.max(r.sucrose, r.starch)));
    const scaleW = fs * 0.62 * String(hi).length + 5;
    const x0 = x + scaleW;
    const plotW = width * 0.72 - scaleW;
    const X = (i) => x0 + (i / (rows.length - 1)) * plotW;
    const Y = (v) => base - (v / hi) * (base - top);
    ledger.line(x0, base, x0 + plotW, base, { stroke: C.ruleStrong });
    // The nights, marked on the time axis as a heavier rule with the word under it: a mark on the axis
    // rather than a band behind the lines, because the stage is the only drawn rectangle in the book.
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].lit !== false) continue;
      let j = i;
      while (j + 1 < rows.length && rows[j + 1].lit === false) j += 1;
      const nx = X(Math.max(0, i - 0.5));
      const nx2 = X(Math.min(rows.length - 1, j + 0.5));
      ledger.line(nx, base, nx2, base, { stroke: C.ink, 'stroke-width': 3 });
      if (nx2 - nx > fs * 2.6) ledger.text(nx, base + fs * 1.15, 'night', { 'font-size': fmt(fs * 0.9), class: 'cc-faint' });
      i = j;
    }
    ledger.text(x0 - 4, top + fs * 0.35, String(hi), { anchor: 'end', 'font-size': fmt(fs * 0.9), class: 'cc-faint cc-tab' });
    ledger.text(x0 - 4, base, '0', { anchor: 'end', 'font-size': fmt(fs * 0.9), class: 'cc-faint cc-tab' });
    const series = [['sucrose', INK.gold, 'sucrose'], ['starch', C.soft, 'starch']];
    const ends = [];
    for (const [key, colour, word] of series) {
      const dd = rows.map((r, i) => `${i ? 'L' : 'M'}${fmt(X(i), 2)} ${fmt(Y(r[key]), 2)}`).join(' ');
      ledger.path(dd, { fill: 'none', stroke: colour, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      const v = rows[rows.length - 1][key];
      ends.push({ word, v, y: Y(v) });
    }
    // The two end labels may not sit on each other when the pools are close: they are pushed apart
    // about their midpoint until a line of type separates them, and kept inside the plot.
    const [upper, lower] = ends[0].y <= ends[1].y ? [ends[0], ends[1]] : [ends[1], ends[0]];
    const need = fs * 1.3;
    if (lower.y - upper.y < need) {
      const mid = clamp((upper.y + lower.y) / 2, top + need / 2, base - need / 2);
      upper.y = mid - need / 2;
      lower.y = mid + need / 2;
    }
    for (const e of ends) ledger.text(x0 + plotW + 8, e.y + fs * 0.35, `${e.word} ${e.v}`, { 'font-size': fmt(fs), class: 'cc-note cc-tab' });
    if (kept.length < 2) ledger.text(x0 + plotW / 2, (top + base) / 2 + fs * 0.35, 'fills as the cycle runs', { anchor: 'middle', 'font-size': fmt(fs), class: 'cc-faint' });
  }

  // ---------------------------------------------------------------- drawing

  b.onDraw(() => {
    drawRing();
    drawLedger();
  });

  return b.handle();
}
