// The fork, with its chemistry left in (Figure 8.3). A replication fork drawn along its length: ahead,
// the parent helix being opened by a helicase, with a topoisomerase working further ahead and the twist
// that builds up in front of the fork drawn as the unopened DNA winding tighter and coiling on itself;
// behind, the two templates, single-strand binding protein on the one waiting to be copied, and the two
// new strands — the leading strand extended continuously towards the fork, and the lagging strand made
// backwards in fragments, each begun on a dashed RNA primer near the fork, later replaced with DNA by
// polymerase I, which cuts the RNA away ahead of itself, and joined by ligase. Beside it, a table counts
// what has been made, and the pyrophosphate each added nucleotide releases. A second scene draws a whole
// chromosome to scale with its origins, its forks and a clock.
//
// It is a mechanism because the reader takes away each fact the lagging strand depends on and watches
// it go: remove an enzyme and its own failure appears; change the end a polymerase can add to and the
// fragments disappear; make the strands run the same way and they move to the other fork.
//
// THE TWO SENTENCES THIS FIGURE TURNS ON (FIGURES.md, "A figure's words are prose"). DNA polymerase adds
// only to a 3′ end. And the lagging strand follows from that fact and the antiparallel strands, and from
// nothing else. So `laggingContinuous` and `strandsInFragments` are COMPUTED from the two facts and
// nothing else, and no enzyme enters them. A lagging strand goes only when a polymerase can add at
// either end: `laggingContinuous` is `!addsOnlyAtThreePrime`. Strands that run the same way only move
// it, because the forks leave an origin in both directions: both new strands grow towards one fork and
// away from the other, so `strandsInFragments`, [this fork, the other fork], is [0, 2]. Under
// 'as-they-are' `laggingContinuous` is false in every reachable state, with any set of enzymes removed.
// The fork drawn is the one both strands grow towards under 'same-direction', so it makes no fragments
// under either hypothetical rule. Each hypothetical rule is marked as such
// wherever it appears: in its control's accessible name, in a line on the drawing, and in the table.
//
// THE FORK IS AN E. COLI FORK, because §8.4 names E. coli's enzymes: polymerase III copies, polymerase I
// replaces each primer, and ligase seals the nick with energy from NAD⁺ (in E. coli; ATP elsewhere).
//   Fork speed      1000 nt/s, §8.4 ("about a thousand nucleotides a second"). THE DRAWING RUNS FOUR
//                   TIMES SLOWER THAN LIFE (SLOW), so a reader can follow each enzyme: the fork opens
//                   250 nt per second of the figure's clock, and the table's Time row is the fork's own
//                   time, the clock divided by four, so Unwound and Time agree with the prose's speed.
//   Fragments       1000–2000 nt each, §8.4's E. coli range; each fragment's length is drawn from that
//                   range by a hash of its number, so a run is the same run every time.
//   Primers         10 nt, §8.4 ("about ten nucleotides long"). DRAWN NOT TO SCALE: at the fork's scale
//                   a primer would be a pixel long, so it is drawn at least 10–12 px, about ten times
//                   too long. The stage says so: in the opening sentence, and in the primer's name,
//                   "RNA primer (not to scale)", wherever the longer name finds room.
//   Twist           one extra turn ahead per 10 base pairs opened, §8.4. A topoisomerase takes turns out
//                   at a rate proportional to how many there are (TOPO_RATE, a model value), which holds
//                   about ten turns ahead at the fork's speed. With no topoisomerase the turns build and
//                   the fork stalls at TW_STALL = 100 turns: A MODEL THRESHOLD, since §8.4 says only that
//                   left alone the twist "would soon stop the fork". It restarts below 85.
//   Timings         polymerase I takes 0.6 s of the figure's clock to replace a primer and ligase 0.6 s
//                   to seal a nick. Drawing values, chosen to be watchable, and not measured rates.
//   Pyrophosphate   one per nucleotide joined to a chain, RNA or DNA, polymerase I's replacements
//                   included: a primer's first nucleotide releases none, since nothing is added to it and
//                   it keeps its 5′ triphosphate, so a 10-nt primer releases 9. Computed from the lengths
//                   made (`forkCounts`): 1488 at the opening. Ligase's step releases none in E. coli, whose
//                   ligase spends NAD⁺, so it is not counted.
//   The origin      the fork opens 1500 nt from its origin, a second and a half after it left, with the
//                   leading strand run up to the fork on its one primer and the lagging strand's first
//                   primer just laid: one primer on each template, as the brief asks. (1500 rather than
//                   less so that the first fragment, which runs back to the origin, is in §8.4's range.) The DNA to the left of the origin was copied by the
//                   fork that left the origin the other way, which is not drawn; its strands are drawn
//                   faint. The leading strand's own primer, at the origin, is replaced from that side once
//                   this fork is 1500 nt further on (ORIGIN_FIX_NT, a model value), and the first lagging
//                   fragment ends at the origin in a nick, since there is no primer of this fork's there.
//
// WHAT EACH REMOVAL DOES, and each is the brief's failure. Helicase: the fork does not move
// (`stalledBecause: 'no-helicase'`). Topoisomerase: the twist builds until the fork stalls ('twist').
// Primase: no new fragment is started, and the lagging template waits uncopied behind the fork. Ligase:
// the fragments are finished and never joined, and each nick stays (`nicksUnsealed` climbs). Primer
// removal: the primers stay in the finished strand (`primersInPlace` climbs), and the nick beside each
// is counted as unsealed as well, because E. coli's ligase joins a 3′ end only to a 5′ monophosphate and
// the primer's 5′ end, where primase began it, carries three phosphates. A stalled fork's polymerases
// still finish the template already open to them.
//
// THE CHAIN TERMINATOR goes into the pool on a press; the next strand being extended takes it in 30 nt
// later and stops there for good. The leading strand is served first when both are extending. A stopped
// leading strand leaves its template single-stranded behind a fork that, in this model, keeps opening (a
// real fork uncouples and slows, and may prime again beyond the block); a stopped lagging fragment leaves
// a gap where it should have met the fragment before it, so the primer there is never replaced.
//
// THE RULES. 'as-they-are': antiparallel templates and a polymerase that adds only at a 3′ end, so the
// lower template's new strand runs away from the fork and is made in fragments. 'same-direction'
// (HYPOTHETICAL): both templates run the same way, so at the fork drawn both new strands grow at a 3′ end
// towards the fork, each from one primer at the origin; at the fork leaving the origin the other way, not
// drawn, both would grow away from their fork and be made in fragments, and the stage says so.
// 'either-end' (HYPOTHETICAL): the templates stay antiparallel, but a polymerase may add at a 5′ end too,
// so the lower new strand grows towards the fork at its 5′ end, again from one primer at the origin, and
// so at every fork. Under either, `fragmentsStarted` at the fork drawn is 0; `laggingContinuous` is true
// only under 'either-end'; `strandsInFragments` is [1, 1], [0, 2] and [0, 0] under the three rules.
// Changing the rule starts the fork again from its origin, keeping the enzymes the reader has removed.
//
// THE WHOLE CHROMOSOME, every number from §8.4 and its table.
//   E. coli             4.6 million bp in one circle, one origin, two forks at 1000 nt/s. Each fork copies
//                       half, 2.3 million bp, in 2300 s: `finishMinutes` 38.3 (§8.4: "about 38 minutes").
//   Human chromosome 1  249 million bp, forks at 50 nt/s (the table gives 25–50; §8.4's own arithmetic
//                       uses fifty). ONE ORIGIN, in the middle: 249 million over 100 nt/s is 2.49 million
//                       s, `finishMinutes` 41,500, about 29 days — "about a month". ALL ORIGINS: chromosome
//                       1's share of a cell's 30,000–50,000, taken at the midpoint, 40,000 × 249 / 6200 =
//                       1606 origins, about 155 kb apart, placed with a seeded jitter. Their firing times
//                       follow a smooth made-up profile of early and late regions (four waves, 8 to 60
//                       million bp long), scaled so that the last forks meet at eight hours, the prose's
//                       figure: `finishMinutes` 480. That time is the schedule's, and the model's work is
//                       the arithmetic — how 1606 origins at 50 nt/s share a chromosome that one origin
//                       would take a month over. The profile is gentle enough that every origin fires
//                       before a neighbour's fork reaches it (`HUMAN_ALL.fired` checks), so all 1606 are
//                       used, as the table's "origins used" says.
//   The clock runs at 3.2 minutes a second for E. coli, 40 minutes a second for all origins, and two days
//   a second for one origin, which is what makes the month something a reader waits through. A run stops
//   when the copying is done; Step moves 5 minutes, an hour, or three days.
//
// THE NARROW COMPOSITION. Below 800 px the fork turns through 90 degrees: the parent helix runs down the
// stage from the top into the fork, and the two new strands run side by side below it, the leading
// strand's arm on the left and the lagging strand's on the right, with their labels to the sides. The
// brief's "the fork moves downwards" is read as the DNA flowing down through a fork that holds its place:
// a fork always moves towards the helix it opens, so with the helix at the top the fork climbs from its
// origin until it reaches its working height, and from then on the DNA scrolls down past it. The table
// becomes two columns of rows beneath, with the rule and the fork's state in a sentence under them; the
// rules control keeps its desktop labels. The whole-chromosome scene keeps its chromosome horizontal at
// full width, with the clock beneath it and the counts under that. `narrowAspect` is 9/16 and not the
// brief's 3/4: measured at the narrow gate's 342 px stage, the toolbar needs five rows for the fork
// scene's eleven controls, and a 3/4 stage leaves the drawing and the table 284 px between them.
//
// CHAPTER 10 IS EXPECTED TO ASK for the whole-chromosome scene, for S phase. It is reached by `scene:
// 'chromosome'` alone (OPEN below), and every number it uses is a named constant here rather than a
// figure-private one, so chapter 10 mounts this kind with a different opening scene instead of keeping a
// copy of it.
import { C, clamp, lerp, el, h } from './lib/svg.js';
import { bench } from './lib/bench.js';
import { hash2, mulberry32 } from './lib/chem-atoms.js';
import { metabolismPart } from '../palette.js';

export const meta = {
  kind: 'replication-fork',
  title: 'The fork, with its chemistry left in',
  needsWebGL: false,
  aspect: 21 / 9,
  narrowAspect: 9 / 16,
};

const CSS = `
.tb-replication-fork .rf-num { font-variant-numeric: lining-nums tabular-nums; }
.tb-replication-fork .rf-caps { letter-spacing: 0.08em; text-transform: uppercase; }
`;

// ---- the opening state, which a later chapter changes to mount another scene ----
const OPEN = Object.freeze({ scene: 'fork', rule: 'as-they-are', organism: 'e-coli', origins: 'one' });

// ---- the fork (an E. coli fork) ----
const ECOLI_FORK_NT_S = 1000; // §8.4
const SLOW = 4; // the drawing runs four times slower than life
const V = ECOLI_FORK_NT_S / SLOW; // nt the fork opens per second of the figure's clock
const POL_CATCH = 1.25; // a polymerase with template in front of it runs this much faster than the fork
const LEAD_GAP = 20; // nt between the leading strand's 3′ end and the fork, the helicase's footprint
const PRIMER_NT = 10; // §8.4
const PRIME_BEHIND = 60; // nt behind the fork at which primase lays a primer
const FRAG_MIN = 1000; // §8.4, E. coli's Okazaki fragments
const FRAG_MAX = 2000;
const F0 = 1500; // the fork opens this far from its origin
const TURN_BP = 10; // §8.4: every ten pairs unwound pushes one extra turn in front
const TOPO_RATE = 2.5; // per second of the figure's clock; a model value
const TW_STALL = 100; // turns at which the fork stalls with no topoisomerase; a model threshold
const TW_RESUME = 0.85 * TW_STALL;
const POL1_S = 0.6; // seconds for polymerase I to replace one primer; a drawing value
const LIG_S = 0.6; // seconds for ligase to seal one nick; a drawing value
const ORIGIN_FIX_NT = 1500; // see the header: when the leading strand's own primer is replaced
const TERM_AFTER_NT = 30; // nt a strand runs on after taking a terminator in the pool
const BEHIND_NT = 3600; // how much of the copied DNA the drawing shows behind the fork, at its working place
const BEHIND_NT_NARROW = 2800; // the same on a phone, where the stage is short along the DNA

const ENZYMES = Object.freeze([
  { id: 'helicase', label: 'Helicase' },
  { id: 'topoisomerase', label: 'Topoisomerase' },
  { id: 'primase', label: 'Primase' },
  { id: 'ligase', label: 'Ligase' },
  { id: 'primer-removal', label: 'Primer removal' },
]);

const RULES = Object.freeze([
  { id: 'as-they-are', label: 'As they are', aria: 'As they are, antiparallel strands and a polymerase that adds only at a 3′ end' },
  { id: 'same-direction', label: 'Strands run the same way', aria: 'Strands run the same way, a hypothetical rule' },
  { id: 'either-end', label: 'Polymerase can add at either end', aria: 'Polymerase can add at either end, a hypothetical rule' },
]);

// The two facts, and the lagging strand computed from them and from nothing else. A lagging strand goes
// only if a polymerase can add at either end; strands running the same way move it to the other fork.
const antiparallel = (rule) => rule !== 'same-direction';
const addsOnlyAtThreePrime = (rule) => rule !== 'either-end';
const laggingIsContinuous = (rule) => !addsOnlyAtThreePrime(rule);
// [this fork, the fork leaving the origin the other way]
const strandsInFragments = (rule) => (!addsOnlyAtThreePrime(rule) ? [0, 0] : antiparallel(rule) ? [1, 1] : [0, 2]);
// The fork drawn makes its lower new strand in one piece when it makes no strand in fragments.
const bothContinuousHere = (rule) => strandsInFragments(rule)[0] === 0;

// A fragment's length, from §8.4's range, by a hash of its number: the same run every time.
const fragLen = (k) => FRAG_MIN + (FRAG_MAX - FRAG_MIN) * hash2(k + 1, 803);

// ---- the whole chromosome ----
const ECOLI_BP = 4.6e6; // §8.4 table
const ECOLI_NT_S = 1000;
const CHR1_BP = 249e6; // §8.4
const HUMAN_NT_S = 50; // §8.4's arithmetic; the table gives 25–50
const HUMAN_GENOME_BP = 6.2e9; // §8.4 table
const HUMAN_ORIGINS = 40000; // the midpoint of the table's 30,000–50,000
const CHR1_ORIGINS = Math.round((CHR1_BP / HUMAN_GENOME_BP) * HUMAN_ORIGINS); // 1606
const S_PHASE_MIN = 480; // "about eight hours"
// The timing profile's waves: [length in bp, weight]. Gentle enough that no fork reaches an origin
// before it fires (checked in HUMAN_ALL.fired).
const WAVES = [[60e6, 0.4], [25e6, 0.3], [12e6, 0.2], [8e6, 0.1]];
const ZOOM = [119e6, 125e6]; // the stretch the all-origins scene draws enlarged

const HUMAN_ALL = (() => {
  const rnd = mulberry32(8043);
  const n = CHR1_ORIGINS;
  const spacing = CHR1_BP / n;
  const pos = new Float64Array(n);
  for (let j = 0; j < n; j += 1) pos[j] = (j + 0.5 + 0.7 * (rnd() - 0.5)) * spacing;
  const waves = WAVES.map(([len, amp]) => ({ len, amp, phase: rnd() * Math.PI * 2 }));
  const raw = Array.from(pos, (x) => waves.reduce((sum, wv) => sum + wv.amp * Math.sin((2 * Math.PI * x) / wv.len + wv.phase), 0));
  let lo = Infinity;
  let hi = -Infinity;
  for (const r of raw) {
    lo = Math.min(lo, r);
    hi = Math.max(hi, r);
  }
  const unit = raw.map((r) => (r - lo) / (hi - lo));
  const v = HUMAN_NT_S * 60; // nt a minute
  const finishFor = (span) => {
    let f = Math.max(unit[0] * span + pos[0] / v, unit[n - 1] * span + (CHR1_BP - pos[n - 1]) / v);
    for (let j = 0; j + 1 < n; j += 1) f = Math.max(f, (unit[j] * span + unit[j + 1] * span + (pos[j + 1] - pos[j]) / v) / 2);
    return f;
  };
  let a = 0;
  let z = S_PHASE_MIN;
  for (let i = 0; i < 60; i += 1) {
    const mid = (a + z) / 2;
    if (finishFor(mid) < S_PHASE_MIN) a = mid;
    else z = mid;
  }
  const T = Float64Array.from(unit, (u) => u * a);
  const meetX = new Float64Array(n - 1);
  let passive = 0;
  for (let j = 0; j + 1 < n; j += 1) {
    const d = pos[j + 1] - pos[j];
    if (Math.abs(T[j + 1] - T[j]) * v >= d) passive += 1;
    meetX[j] = pos[j] + ((T[j + 1] - T[j]) * v + d) / 2;
  }
  return { pos, T, meetX, v, finish: finishFor(a), fired: n - passive };
})();

function humanAllExtents(m, j) {
  const { pos, T, meetX, v } = HUMAN_ALL;
  const n = pos.length;
  const run = Math.max(0, (m - T[j]) * v);
  const leftRoom = j === 0 ? pos[0] : pos[j] - meetX[j - 1];
  const rightRoom = j === n - 1 ? CHR1_BP - pos[n - 1] : meetX[j] - pos[j];
  return [Math.min(leftRoom, run), Math.min(rightRoom, run), run > 0 && run < leftRoom, run > 0 && run < rightRoom];
}

function humanAllCopied(m) {
  let sum = 0;
  for (let j = 0; j < HUMAN_ALL.pos.length; j += 1) {
    const [l, r] = humanAllExtents(m, j);
    sum += l + r;
  }
  return clamp(sum / CHR1_BP, 0, 1);
}

function chromosome(organism, origins) {
  if (organism === 'e-coli') {
    return {
      name: 'E. coli', bp: ECOLI_BP, speed: ECOLI_NT_S, originCount: 1,
      finish: ECOLI_BP / (2 * ECOLI_NT_S * 60), rate: 3.2, step: 5,
      copied: (m) => clamp((2 * ECOLI_NT_S * 60 * m) / ECOLI_BP, 0, 1),
    };
  }
  if (origins === 'one') {
    return {
      name: 'Human chromosome 1', bp: CHR1_BP, speed: HUMAN_NT_S, originCount: 1,
      finish: CHR1_BP / (2 * HUMAN_NT_S * 60), rate: 2880, step: 4320,
      copied: (m) => clamp((2 * HUMAN_NT_S * 60 * m) / CHR1_BP, 0, 1),
    };
  }
  return {
    name: 'Human chromosome 1', bp: CHR1_BP, speed: HUMAN_NT_S, originCount: HUMAN_ALL.fired,
    finish: HUMAN_ALL.finish, rate: 40, step: 60, copied: humanAllCopied,
  };
}

// ---- the fork model: pure data and pure steps, so a run is a function of the clock and the presses ----
const newStrand = () => ({ end: F0 - LEAD_GAP, termAt: null, stopped: false, origin: { state: 'open', p: 0 } });
const newFragment = (k, q, target) => ({ k, q, end: q - PRIMER_NT, target, termAt: null, stopped: false, done: false, junction: { state: 'open', p: 0 } });

function newFork(rule) {
  const f = {
    F: F0, tw: 0, stall: false, tau: 0,
    top: newStrand(),
    bot: bothContinuousHere(rule) ? newStrand() : null,
    frags: [], lagPol: -1, lastQ: 0, pending: 0, terminated: null,
  };
  if (!f.bot) {
    const q = F0 - PRIME_BEHIND;
    f.frags.push(newFragment(0, q, 0));
    f.lastQ = q;
    f.lagPol = 0;
  }
  return f;
}

function extendContinuous(f, s, step, which) {
  if (s.stopped) return;
  let add = Math.min(step, f.F - LEAD_GAP - s.end);
  if (add <= 0) return;
  if (s.termAt === null && f.pending > 0) {
    s.termAt = s.end + TERM_AFTER_NT;
    f.pending -= 1;
  }
  if (s.termAt !== null && s.end + add >= s.termAt) {
    add = s.termAt - s.end;
    s.stopped = true;
    f.terminated ??= which;
  }
  s.end += add;
}

function extendFragment(f, g, step) {
  let add = Math.min(step, g.end - g.target);
  if (add > 0 && g.termAt === null && f.pending > 0 && g.end - g.target > 2) {
    g.termAt = Math.max(g.target + 1, g.end - TERM_AFTER_NT);
    f.pending -= 1;
  }
  if (g.termAt !== null && g.end - add <= g.termAt) {
    g.end = g.termAt;
    g.stopped = true;
    g.done = true;
    g.junction.state = 'gap';
    f.terminated ??= 'lagging';
    f.lagPol = -1;
    return;
  }
  g.end -= add;
  if (g.end <= g.target + 1e-9) {
    g.end = g.target;
    g.done = true;
    // The first fragment ends at the origin, against DNA the other fork made: a nick with no primer.
    g.junction.state = g.k === 0 ? 'nick' : 'primer';
    f.lagPol = -1;
  }
}

function advanceJunction(j, dt, has) {
  if (j.state === 'primer' && has('primer-removal')) {
    j.state = 'pol1';
    j.p = 0;
  }
  if (j.state === 'pol1' && has('primer-removal')) {
    j.p += dt / POL1_S;
    if (j.p >= 1) {
      j.state = 'nick';
      j.p = 0;
    }
  }
  if (j.state === 'nick' && has('ligase')) {
    j.state = 'ligase';
    j.p = 0;
  }
  if (j.state === 'ligase' && has('ligase')) {
    j.p += dt / LIG_S;
    if (j.p >= 1) {
      j.state = 'sealed';
      j.p = 1;
    }
  }
}

function advanceFork(f, dt, has) {
  f.tau += dt;
  if (has('topoisomerase')) f.tw *= Math.exp(-TOPO_RATE * dt);
  if (has('helicase')) {
    if (f.stall && f.tw < TW_RESUME) f.stall = false;
    if (!f.stall) {
      let dF = V * dt;
      const room = Math.max(0, (TW_STALL - f.tw) * TURN_BP);
      if (dF >= room) {
        dF = room;
        f.stall = true;
      }
      f.F += dF;
      f.tw += dF / TURN_BP;
    }
  }
  const step = V * POL_CATCH * dt;
  extendContinuous(f, f.top, step, 'leading');
  if (f.bot) extendContinuous(f, f.bot, step, 'lower');
  for (const s of [f.top, f.bot]) {
    if (s && s.origin.state === 'open' && f.F >= F0 + ORIGIN_FIX_NT) s.origin.state = 'primer';
  }
  if (!f.bot) {
    if (has('primase')) {
      const q = f.F - PRIME_BEHIND;
      if (q - f.lastQ >= fragLen(f.frags.length)) {
        f.frags.push(newFragment(f.frags.length, q, f.lastQ));
        f.lastQ = q;
      }
    }
    if (f.lagPol < 0) f.lagPol = f.frags.findIndex((g) => !g.done);
    if (f.lagPol >= 0) extendFragment(f, f.frags[f.lagPol], step);
  }
  for (const s of [f.top, f.bot]) if (s) advanceJunction(s.origin, dt, has);
  for (const g of f.frags) advanceJunction(g.junction, dt, has);
}

const replacedShare = (j) => (j.state === 'pol1' ? j.p : j.state === 'nick' || j.state === 'ligase' || j.state === 'sealed' ? 1 : 0);
const unsealed = (j) => j.state === 'primer' || j.state === 'pol1' || j.state === 'nick' || j.state === 'ligase';

// What the table counts, computed from the lengths made: one pyrophosphate per nucleotide joined to a
// chain. Every strand and fragment starts on a primer laid whole, whose first nucleotide is joined to
// nothing and releases none, hence the one taken off each.
function forkCounts(f) {
  let primers = 0;
  let nicks = 0;
  let ppi = 0;
  for (const s of [f.top, f.bot]) {
    if (!s) continue;
    ppi += s.end - 1 + PRIMER_NT * replacedShare(s.origin);
    if (replacedShare(s.origin) < 1) primers += 1;
    if (unsealed(s.origin)) nicks += 1;
  }
  f.frags.forEach((g, i) => {
    ppi += g.q - g.end - 1; // its primer, less the primer's first nucleotide, and the DNA polymerase III made on it
    if (g.k > 0) ppi += PRIMER_NT * replacedShare(g.junction); // polymerase I's DNA in the primer before it
    const next = f.frags[i + 1];
    if (!next || replacedShare(next.junction) < 1) primers += 1;
    if (unsealed(g.junction)) nicks += 1;
  });
  return { primers, nicks, ppi };
}

const nt = (v) => Math.round(v).toLocaleString('en-GB');

function clockText(min, organism, origins) {
  if (organism === 'e-coli') return `${min.toFixed(1)} min`;
  if (origins === 'one') {
    const d = Math.floor(min / 1440 + 1e-9);
    const hh = Math.floor((min - d * 1440) / 60 + 1e-9);
    return `${d} day${d === 1 ? '' : 's'} ${hh} h`;
  }
  const hh = Math.floor(min / 60 + 1e-9);
  const mm = Math.floor(min - hh * 60 + 1e-9);
  return `${hh} h ${String(mm).padStart(2, '0')} min`;
}

function finishText(ch, organism, origins) {
  if (organism === 'e-coli') return `${ch.finish.toFixed(1)} min`;
  if (origins === 'one') return `${(ch.finish / 1440).toFixed(1)} days`;
  return `${(ch.finish / 60).toFixed(1)} h`;
}

export function mount(root, ctx) {
  const b = bench(root, ctx, { kind: meta.kind, css: CSS, narrowBelow: { width: 800 }, seed: 803 });
  const ENZYME = metabolismPart('enzyme');
  const PROTEIN = { fill: ENZYME.color, stroke: ENZYME.symbolColor, 'stroke-width': 1, 'stroke-opacity': 0.35 };

  let scene = OPEN.scene;
  let rule = OPEN.rule;
  const removed = new Set();
  let organism = OPEN.organism;
  let origins = OPEN.origins;
  let chrMin = 0;
  let fk = newFork(rule);
  const has = (id) => !removed.has(id);

  // ---- panes ----
  const forkPane = b.pane('fork', {
    as: 'svg',
    focus: true,
    aria: 'A replication fork: the parent helix ahead being opened by a helicase, a topoisomerase relieving the twist in front of it, and behind it the leading strand made continuously and the lagging strand made backwards in fragments on RNA primers, which polymerase I replaces and ligase joins. A second scene draws a whole chromosome with its origins and a clock. Space runs or pauses, Enter steps, S switches scene, R changes the rule, T adds a chain terminator, and Home resets.',
  });
  const table = b.pane('table', { as: 'svg' });

  b.compose({
    wide: {
      columns: 'minmax(0, 73fr) minmax(0, 27fr)',
      rows: 'minmax(0, 1fr)',
      at: { fork: [1, 1], table: [2, 1] },
    },
    narrow: {
      columns: 'minmax(0, 1fr)',
      rows: 'minmax(0, 71fr) minmax(0, 29fr)',
      at: { fork: [1, 1], table: [1, 2] },
    },
  });

  // ---- controls: what to run, what to show, the rules, and the enzymes ----
  const runCtl = b.run({ aria: 'Run, move the fork on, or run the chromosome’s clock', onChange: (on) => onRun(on) });
  b.action('Step', () => stepOnce(), { aria: 'Step, a quarter of a second at the fork, or one step of the chromosome’s clock' });
  b.action('Reset', () => resetAll(), { aria: 'Reset, put the figure back as it opened' });
  b.divide();
  const sceneCtl = b.choice('Scene', [
    { id: 'fork', label: 'Fork' },
    { id: 'chromosome', label: 'Whole chromosome', short: 'Chromosome' },
  ], (id) => setScene(id), { segmented: true, value: OPEN.scene });
  b.divide();
  const ruleCtl = b.choice('Rules', RULES, (id) => setRule(id), { segmented: true, value: OPEN.rule });
  b.divide();
  const enzymeCtl = ENZYMES.map((e) => b.toggle(e.label, (on) => setEnzyme(e.id, on), {
    pressed: true,
    aria: `${e.label}, take it away from the fork or put it back`,
  }));
  const termBtn = b.action('Add a chain terminator', () => addTerminator(), {
    short: 'Add terminator',
    aria: 'Add a chain terminator, a nucleotide with no 3′ hydroxyl, to the pool',
  });
  b.divide();
  const organismCtl = b.choice('Organism', [
    { id: 'e-coli', label: 'E. coli' },
    { id: 'human-chr1', label: 'Human chromosome 1' },
  ], (id) => setOrganism(id), { segmented: true, value: OPEN.organism });
  const originsCtl = b.choice('Origins', [
    { id: 'one', label: 'One origin', short: 'One', aria: 'One origin, a single origin in the middle' },
    { id: 'all', label: 'All origins', short: 'All', aria: 'All origins, the chromosome’s share of the cell’s origins' },
  ], (id) => setOrigins(id), { segmented: true, value: OPEN.origins });
  // A species name is set in italic, on the control as in the prose.
  for (const s of organismCtl.nodes[0].querySelectorAll('.tb-long, .tb-short')) s.replaceChildren(h('i', { text: 'E. coli' }));

  b.keys({
    ' ': () => runCtl.toggle(),
    Enter: () => stepOnce(),
    s: () => sceneCtl.next(),
    S: () => sceneCtl.next(),
    r: () => { if (scene === 'fork') ruleCtl.next(); },
    R: () => { if (scene === 'fork') ruleCtl.next(); },
    t: () => { if (scene === 'fork') addTerminator(); },
    T: () => { if (scene === 'fork') addTerminator(); },
    Home: () => resetAll(),
  });

  const forkOnly = [...ruleCtl.nodes, ...enzymeCtl.map((c) => c.node), termBtn];
  const chromosomeOnly = [...organismCtl.nodes, ...originsCtl.nodes];
  function applySceneControls() {
    for (const n of forkOnly) n.style.display = scene === 'fork' ? '' : 'none';
    for (const n of chromosomeOnly) n.style.display = scene === 'chromosome' ? '' : 'none';
    for (const strip of [ruleCtl.strip]) strip.style.display = scene === 'fork' ? '' : 'none';
    for (const strip of [organismCtl.strip, originsCtl.strip]) strip.style.display = scene === 'chromosome' ? '' : 'none';
  }
  applySceneControls();

  // ---- reader actions ----
  function afterChange() {
    b.redraw();
    b.announce();
  }

  function onRun(on) {
    if (on && scene === 'chromosome' && chrMin >= chromosome(organism, origins).finish - 1e-9) chrMin = 0;
    afterChange();
  }

  function stepOnce() {
    if (b.playing) runCtl.set(false);
    if (scene === 'fork') {
      for (let i = 0; i < 60; i += 1) advanceFork(fk, 1 / 60, has);
    } else {
      const ch = chromosome(organism, origins);
      chrMin = chrMin >= ch.finish - 1e-9 ? 0 : Math.min(ch.finish, chrMin + ch.step);
    }
    afterChange();
  }

  function setScene(id) {
    if (scene === id) return;
    if (b.playing) runCtl.set(false);
    scene = id;
    applySceneControls();
    afterChange();
  }

  function setRule(id) {
    if (rule === id) return;
    rule = id;
    fk = newFork(rule);
    afterChange();
  }

  function setEnzyme(id, present) {
    if (present) removed.delete(id);
    else removed.add(id);
    afterChange();
  }

  function addTerminator() {
    fk.pending += 1;
    afterChange();
  }

  function setOrganism(id) {
    if (organism === id) return;
    organism = id;
    chrMin = 0;
    afterChange();
  }

  function setOrigins(id) {
    if (origins === id) return;
    origins = id;
    chrMin = 0;
    afterChange();
  }

  function resetAll() {
    if (b.playing) runCtl.set(false);
    b.restart(); // which calls restartModel()
    b.announce();
  }

  function restartModel() {
    scene = OPEN.scene;
    rule = OPEN.rule;
    removed.clear();
    organism = OPEN.organism;
    origins = OPEN.origins;
    chrMin = 0;
    fk = newFork(rule);
    sceneCtl.set(OPEN.scene, { quiet: true });
    ruleCtl.set(OPEN.rule, { quiet: true });
    for (const c of enzymeCtl) c.set(true, { quiet: true });
    organismCtl.set(OPEN.organism, { quiet: true });
    originsCtl.set(OPEN.origins, { quiet: true });
    applySceneControls();
  }

  // ---- the clock ----
  b.clock({
    step: 1 / 60,
    restart: restartModel,
    running: () => b.playing,
    advance: (dt) => {
      if (!b.playing) return;
      if (scene === 'fork') {
        advanceFork(fk, dt, has);
        return;
      }
      const ch = chromosome(organism, origins);
      chrMin = Math.min(ch.finish, chrMin + dt * ch.rate);
      if (chrMin >= ch.finish - 1e-9) runCtl.set(false);
    },
  });

  // ---- what describe() reports ----
  const stalledBecause = () => (!has('helicase') ? 'no-helicase' : fk.stall ? 'twist' : null);

  function state() {
    const c = forkCounts(fk);
    const ch = chromosome(organism, origins);
    return {
      scene,
      rule,
      laggingContinuous: laggingIsContinuous(rule),
      strandsInFragments: strandsInFragments(rule),
      removed: ENZYMES.filter((e) => removed.has(e.id)).map((e) => e.id),
      forkTimeS: Number((fk.tau / SLOW).toFixed(3)),
      unwoundNt: Math.round(fk.F),
      leadingLengthNt: Math.round(fk.top.end),
      fragmentsStarted: fk.bot ? 0 : fk.frags.length,
      primersInPlace: c.primers,
      nicksUnsealed: c.nicks,
      pyrophosphateReleased: Math.round(c.ppi),
      twistAheadTurns: Number(fk.tw.toFixed(1)),
      forkStalled: stalledBecause() !== null,
      stalledBecause: stalledBecause(),
      chainTerminated: fk.terminated !== null,
      terminatedStrand: fk.terminated,
      organism,
      origins,
      originCount: ch.originCount,
      forkSpeedNtPerS: ch.speed,
      copiedPercent: Number((100 * ch.copied(chrMin)).toFixed(1)),
      elapsedMinutes: Number(chrMin.toFixed(1)),
      finishMinutes: Number(ch.finish.toFixed(1)),
      t: Number(b.time.toFixed(3)),
      playing: b.playing,
    };
  }
  b.onDescribe(state);

  // ---- the words: the rule, and what the fork is doing now ----
  // `short` is the phone's wording. Its three lines under the readout hold about 180 characters at a
  // 390 px stage, fewer at 360, and the banner across the top of the stage already says the rule is
  // hypothetical. Every fact the long wording gives that the drawing does not show stays in the short one.
  function ruleWords(short = false) {
    if (rule === 'same-direction' && short) return 'At this fork both new strands grow towards it, each from one primer. At the other fork, not drawn, both would be made in fragments.';
    if (rule === 'either-end' && short) return 'A polymerase that could add at a 5′ end makes the lower new strand towards the fork too, from one primer: no fragments at any fork.';
    if (rule === 'same-direction') return 'Hypothetical: the two strands run the same way. At this fork both new strands grow at a 3′ end towards it, each from one primer. At the fork leaving the origin the other way, not drawn, both would grow away from their fork and be made in fragments: the fragments move there, and do not go.';
    if (rule === 'either-end') return 'Hypothetical: a polymerase that could add at a 5′ end makes the lower new strand towards the fork too, from one primer, and so at every fork: no fragments anywhere.';
    return null;
  }

  function forkWords(short = false) {
    const why = stalledBecause();
    if (why === 'no-helicase') return 'No helicase: the parent helix stays shut, so the fork cannot move.';
    if (why === 'twist') return 'No topoisomerase: the twist ahead has built up until the fork has stalled.';
    if (!has('topoisomerase')) return 'No topoisomerase: every ten pairs opened add a turn ahead, and nothing takes them out.';
    if (!has('primase') && !fk.bot) return 'No primase: no new fragment can start, so the lagging template waits uncopied.';
    if (!has('primer-removal')) return 'No primer removal: the RNA primers stay in the strand, and the nick beside each cannot be sealed.';
    if (!has('ligase')) return 'No ligase: the fragments are made but never joined, so each nick stays open.';
    if (fk.terminated === 'leading' && short) return 'A chain terminator has stopped the leading strand: nothing can be added after it. A real fork would slow, and might start again on a new primer.';
    if (fk.terminated === 'leading') return 'A chain terminator has stopped the leading strand: nothing can be added after it. In this drawing the fork keeps opening; a real fork slows, and may start the strand again beyond the block on a new primer.';
    if (fk.terminated) return `A chain terminator has stopped ${fk.terminated === 'lower' ? 'the lower strand' : 'a lagging fragment'}: nothing can be added after it.`;
    if (fk.pending > 0) return 'A chain terminator is in the pool: the next strand to take one in stops there.';
    if (fk.bot) return null; // the rule's own sentence says what the fork is doing
    if (fk.tau === 0 && short) return 'The fork is just leaving its origin, one primer on each template. Drawn four times slower than life, and the 10-nucleotide primers ten times too long so they can be seen.';
    if (fk.tau === 0) return 'The fork is just leaving its origin, with one primer on each template. Drawn four times slower than life, and the primers, 10 nucleotides each, about ten times too long, so that they can be seen.';
    return 'The leading strand grows towards the fork; the lagging strand is made backwards in fragments, each on its own primer.';
  }

  // `short` as for ruleWords: two lines under the readout at a 360 px stage.
  function chromosomeWords(ch, short = false) {
    if (organism === 'e-coli') return 'One circle and one origin: two forks at 1000 nt/s, each copying half the circle, meet on the far side.';
    if (origins === 'one') return 'One origin in the middle, with two forks at 50 nt/s: about a month to copy the chromosome.';
    if (short) return `${nt(ch.originCount)} origins, fired over the eight hours; fired all at once, they would finish in under an hour.`;
    return `${nt(ch.originCount)} origins, fired at different times through the eight hours; the forks from neighbouring origins meet and join. Fired all at once, these forks would finish in under an hour; the eight hours is how long the firing is spread over.`;
  }

  b.onAnnounce(() => {
    if (scene === 'chromosome') {
      const ch = chromosome(organism, origins);
      return `${ch.name}, ${ch.originCount === 1 ? 'one origin' : `${nt(ch.originCount)} origins`}, forks at ${ch.speed} nucleotides a second. ${Math.round(100 * ch.copied(chrMin))} per cent copied after ${clockText(chrMin, organism, origins)}; finished at ${finishText(ch, organism, origins)}.`;
    }
    const c = forkCounts(fk);
    const r = ruleWords();
    return `${[r, forkWords()].filter(Boolean).join(' ')} ${nt(fk.F)} nucleotides unwound, ${fk.bot ? 'no fragments' : `${fk.frags.length} fragment${fk.frags.length === 1 ? '' : 's'} started`}, ${c.primers} primer${c.primers === 1 ? '' : 's'} in place, ${c.nicks} nick${c.nicks === 1 ? '' : 's'} not sealed, ${nt(c.ppi)} pyrophosphates released.`;
  });

  // ---- drawing ----
  b.onDraw(() => {
    forkPane.clear();
    table.clear();
    if (scene === 'fork') {
      drawFork();
      drawForkTable();
    } else {
      drawChromosome();
      drawChromosomeTable();
      italicSpecies(forkPane);
      italicSpecies(table);
    }
  });

  // A species name is set in italic wherever the figure writes it, as the prose sets it.
  function italicSpecies(pane) {
    for (const t of pane.node.querySelectorAll('text')) {
      const str = t.textContent;
      const at = str.indexOf('E. coli');
      if (at < 0 || t.querySelector('tspan')) continue;
      const name = el('tspan', { 'font-style': 'italic' });
      name.textContent = 'E. coli';
      t.textContent = '';
      if (at > 0) t.append(str.slice(0, at));
      t.append(name);
      if (at + 7 < str.length) t.append(str.slice(at + 7));
    }
  }

  // Labels are placed, not positioned: each asks for the first of its candidate spots that no earlier
  // label, glyph or strand has taken, and a label with nowhere to go is left out. A collision is a
  // state, not a layout (FIGURES.md), and a run passes through thousands of states.
  function placer(pane) {
    const { w, h: hgt } = pane.box;
    const boxes = [];
    const hits = (bx) => boxes.some((o) => bx.x0 < o.x1 && bx.x1 > o.x0 && bx.y0 < o.y1 && bx.y1 > o.y0);
    // The width is estimated, not measured: measuring forces a layout per label per frame. Lower case
    // in the book's face runs about 0.5 em a character, spaced capitals about 0.7.
    const boxOf = (x, y, str, size, anchor, caps) => {
      const tw = String(str).length * size * (caps ? 0.74 : 0.56);
      const x0 = anchor === 'middle' ? x - tw / 2 : anchor === 'end' ? x - tw : x;
      return { x0: x0 - 2, y0: y - size * 0.8 - 1.5, x1: x0 + tw + 2, y1: y + size * 0.25 + 1.5 };
    };
    return {
      reserve(x0, y0, x1, y1) { boxes.push({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }); },
      reservePath(pts, pad = 2) {
        for (let i = 1; i < pts.length; i += 1) {
          const [xa, ya] = pts[i - 1];
          const [xb, yb] = pts[i];
          boxes.push({ x0: Math.min(xa, xb) - pad, y0: Math.min(ya, yb) - pad, x1: Math.max(xa, xb) + pad, y1: Math.max(ya, yb) + pad });
        }
      },
      place(cands, str, { size = 10.5, fill = C.ink, cls = null } = {}) {
        for (const [x, y, anchor] of cands) {
          const bx = boxOf(x, y, str, size, anchor, cls === 'rf-caps');
          if (bx.x0 < 1 || bx.y0 < 1 || bx.x1 > w - 1 || bx.y1 > hgt - 1 || hits(bx)) continue;
          boxes.push(bx);
          pane.label(x, y, str, { size, anchor, fill, ...(cls ? { class: cls } : {}) });
          return bx;
        }
        return null;
      },
    };
  }

  // The fork's frame. `a` runs along the DNA, from the origin's side towards the helix; `c` runs across
  // it, positive towards the leading strand's arm. Wide, a is x and c is up; narrow, a is up the stage
  // from its foot and c is to the left, which is the whole of the 90-degree turn: the helix at the top,
  // the leading strand's arm on the left and the lagging strand's on the right.
  function forkGeom() {
    const { w, h: hgt } = forkPane.box;
    const narrow = b.narrow;
    const along = narrow ? hgt : w;
    const armSep = narrow ? clamp(w * 0.17, 34, 110) : clamp(hgt * 0.27, 36, 110);
    const g = narrow ? 7.5 : clamp(hgt * 0.032, 8, 10);
    const aWork = along * 0.6;
    const a0 = narrow ? 14 : 18;
    const s = aWork / (narrow ? BEHIND_NT_NARROW : BEHIND_NT);
    const originA = Math.min(a0, aWork - fk.F * s);
    const aV = originA + fk.F * s;
    const cx = w / 2;
    const cy = hgt * 0.5;
    const ringR = narrow ? 9 : clamp(hgt * 0.042, 9, 12);
    const polRa = narrow ? 10 : 12;
    const polRc = narrow ? 8 : 9.5;
    return {
      w, hgt, narrow, along, armSep, g, A: g * 0.62, s, originA, aV, ringR, polRa, polRc,
      P: narrow ? (a, c) => [cx - c, hgt - a] : (a, c) => [a, cy - c],
      Ltr: armSep * 0.62,
      // Nothing the polymerases make is drawn nearer the fork than this: the helicase and a polymerase
      // take up room that a few tens of nucleotides do not, so the drawing is not to scale there.
      gapPx: ringR + polRa + 3,
      // On a phone the helix stops short of the top under a hypothetical rule, for the banner that names
      // the rule: the strands' end labels there are the rule's whole point.
      aEnd: along - (narrow ? (rule === 'as-they-are' ? 20 : 36) : 22),
      size: narrow ? 10 : clamp(hgt * 0.036, 10, 11.5),
    };
  }

  function drawFork() {
    const G = forkGeom();
    const { P, narrow } = G;
    const p = forkPane;
    const lab = placer(p);
    const S = G.size;
    const aOf = (u) => G.originA + u * G.s;
    const clampA = (a) => Math.min(a, G.aV - G.gapPx);
    const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
    const armOpen = (a) => smooth01((G.aV - a) / G.Ltr);
    const armC = (a) => G.armSep * armOpen(a);
    // The twist ahead: the helix winds tighter towards the fork, and the axis coils on itself, both in
    // proportion to the turns the fork has pushed in front of it. Neither is to scale.
    const tw01 = clamp(fk.tw / TW_STALL, 0, 1);
    const pitch = narrow ? 20 : 26;
    const Lenv = Math.max(30, (G.aEnd - G.aV) * 0.55);
    const phase = (a) => ((2 * Math.PI) / pitch) * ((a - G.originA) + 1.4 * tw01 * Lenv * (1 - Math.exp(-(a - G.aV) / Lenv)));
    const writhe = (a) => tw01 * G.armSep * 0.34 * Math.sin((2 * Math.PI * (a - G.aV)) / (pitch * 2.3)) * Math.exp(-(a - G.aV) / (Lenv * 1.4)) * (1 - Math.exp(-(a - G.aV) / 10));
    const helixC = (a, sign) => writhe(a) + sign * G.A * Math.cos(phase(a));
    const startTop = helixC(G.aV, 1);
    const startBot = helixC(G.aV, -1);
    // The templates are each arm's outer strand and the new strands its inner one. The leading strand's
    // template is the top arm's; the lagging strand's, the bottom's.
    const tmplTop = (a) => armC(a) + G.g / 2 + (1 - armOpen(a)) * (startTop - G.g / 2);
    const tmplBot = (a) => -(armC(a) + G.g / 2) + (1 - armOpen(a)) * (startBot + G.g / 2);
    const newTop = (a) => tmplTop(a) - G.g;
    const newBot = (a) => tmplBot(a) + G.g;
    const midTop = (a) => tmplTop(a) - G.g / 2;
    const midBot = (a) => tmplBot(a) + G.g / 2;

    const clipId = b.uid('rf-clip');
    const clip = el('clipPath', { id: clipId });
    p.rect(0, 0, G.w, G.hgt, {}, clip);
    p.add(clip);
    const dna = p.group({ 'clip-path': `url(#${clipId})` });
    const marks = p.group({ 'clip-path': `url(#${clipId})` });
    const proteins = p.group({ 'clip-path': `url(#${clipId})` });

    const pts = (a0, a1, cFn, stepPx = 3) => {
      const out = [];
      if (!(a1 > a0)) return out;
      const n = Math.max(1, Math.ceil((a1 - a0) / stepPx));
      for (let i = 0; i <= n; i += 1) {
        const a = a0 + ((a1 - a0) * i) / n;
        out.push(P(a, cFn(a)));
      }
      return out;
    };
    const dOf = (list) => list.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const stroke = (list, attrs, { reserve = true, parent = dna } = {}) => {
      if (list.length < 2) return;
      p.path(dOf(list), { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs }, parent);
      if (reserve) lab.reservePath(list, 3);
    };
    const OLD = { stroke: C.soft, 'stroke-width': narrow ? 1.5 : 1.7 };
    const NEW = { stroke: C.ink, 'stroke-width': narrow ? 2.4 : 2.7 };
    const OTHER = { stroke: C.faint, 'stroke-width': 1.5, 'stroke-dasharray': '1 3' };
    const RNA = { ...NEW, 'stroke-dasharray': '3.2 2.2', 'stroke-linecap': 'butt' };
    const primerPx = Math.max(PRIMER_NT * G.s, narrow ? 10 : 12);
    const aLo = -4;
    const aOrigin = aOf(0);

    // ---- the parent helix ahead, with its twist ----
    const aStart = G.aV;
    const aStop = Math.max(aStart + 4, G.aEnd);
    const rungs = [];
    for (let a = aStart + 3; a < aStop; a += narrow ? 4 : 5) {
      const [x1, y1] = P(a, helixC(a, 1));
      const [x2, y2] = P(a, helixC(a, -1));
      rungs.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
    if (rungs.length) p.path(rungs.join(''), { stroke: C.faint, 'stroke-width': 1, 'stroke-opacity': 0.75 }, dna);
    stroke(pts(aStart, aStop, (a) => helixC(a, 1), 2), OLD);
    stroke(pts(aStart, aStop, (a) => helixC(a, -1), 2), OLD);

    // ---- the two arms behind the fork: templates to the pane's edge, the other fork's strands faint ----
    stroke(pts(aLo, G.aV, tmplTop), OLD);
    stroke(pts(aLo, G.aV, tmplBot), OLD);
    if (aOrigin > 0) {
      stroke(pts(aLo, aOrigin - 1, newTop), OTHER, { reserve: false });
      stroke(pts(aLo, aOrigin - 1, newBot), OTHER, { reserve: false });
    }

    // Single-stranded template, coated in binding protein: beads on every stretch no new strand covers.
    const beads = [];
    const beadRun = (u0, u1, cFn) => {
      const from = Math.max(aLo, aOf(u0) + 3);
      const to = Math.min(aOf(u1), G.aV - G.ringR - 2);
      for (let a = from + 2; a < to; a += narrow ? 6 : 7) beads.push([a, cFn(a)]);
    };
    const inset = narrow ? 2.3 : 2.7;
    beadRun(fk.top.end, fk.F, (a) => tmplTop(a) - inset);
    if (fk.bot) beadRun(fk.bot.end, fk.F, (a) => tmplBot(a) + inset);
    else {
      const covered = fk.frags.map((g) => [g.stopped ? g.end : g.end, g.q]).sort((x, y) => x[0] - y[0]);
      let from = 0;
      for (const [u0, u1] of covered) {
        if (u0 > from + 1) beadRun(from, u0, (a) => tmplBot(a) + inset);
        from = Math.max(from, u1);
      }
      if (from < fk.F) beadRun(from, fk.F, (a) => tmplBot(a) + inset);
    }
    for (const [a, c] of beads) {
      const [x, y] = P(a, c);
      p.circle(x, y, narrow ? 1.8 : 2.1, { fill: C.faint }, marks);
    }

    // A continuous new strand from the origin: its primer, dashed until polymerase I has replaced it
    // (working in from the origin's side), then DNA to its growing end.
    const drawContinuous = (s, newFn) => {
      const aEndS = clampA(aOf(s.end));
      const aP0 = aOrigin;
      const aP1 = aP0 + primerPx;
      const aRna0 = aP0 + replacedShare(s.origin) * primerPx;
      if (aRna0 > aP0 + 0.5) stroke(pts(Math.max(aLo, aP0), Math.min(aRna0, aEndS), newFn), NEW);
      if (aP1 > aRna0 + 0.5) stroke(pts(Math.max(aLo, aRna0), Math.min(aP1, aEndS), newFn), RNA);
      if (aEndS > aP1) stroke(pts(Math.max(aLo, aP1), aEndS, newFn), NEW);
      return { aEnd: aEndS, aP0, aP1 };
    };
    const top = drawContinuous(fk.top, newTop);
    const bot = fk.bot ? drawContinuous(fk.bot, newBot) : null;

    // The lagging strand's fragments: each from its growing 3′ end back to its primer at the fork side,
    // which stays dashed until polymerase I, arriving from the next fragment, has replaced it.
    const frags = [];
    if (!fk.bot) {
      fk.frags.forEach((g, i) => {
        const next = fk.frags[i + 1];
        const aQ = clampA(aOf(g.q));
        const aE = Math.min(clampA(aOf(g.end)), aQ);
        const aRna1 = aQ - (next ? replacedShare(next.junction) : 0) * primerPx;
        const aRna0 = Math.max(aE, aQ - primerPx);
        if (aQ < aLo) return;
        if (aRna0 > aE + 0.5) stroke(pts(Math.max(aLo, aE), aRna0, newBot), NEW);
        if (aRna1 > aRna0 + 0.5) stroke(pts(Math.max(aLo, aRna0), aRna1, newBot), RNA);
        if (aQ > aRna1 + 0.5) stroke(pts(Math.max(aLo, aRna1), aQ, newBot), NEW);
        frags.push({ g, i, aQ, aE, aRna0, aRna1 });
      });
    }

    // The direction each strand is being made in: an arrow beside the stretch just made, pointing at
    // the end a polymerase is adding to.
    const arrows = [];
    const arrowAlong = (aTip, dir, cFn) => {
      const len = narrow ? 26 : 34;
      const a1 = aTip - dir * (narrow ? 14 : 17);
      const a0 = a1 - dir * len;
      if (Math.min(a0, a1) < 4) return;
      const line = pts(Math.min(a0, a1), Math.max(a0, a1), cFn, 4);
      stroke(line, { stroke: C.soft, 'stroke-width': 1.2 }, { parent: marks });
      const [tx, ty] = P(a1, cFn(a1));
      const [bx, by] = P(a1 - dir * 5, cFn(a1 - dir * 5));
      const ux = (tx - bx) / 5;
      const uy = (ty - by) / 5;
      p.path(`M${(tx + ux * 1.5).toFixed(1)} ${(ty + uy * 1.5).toFixed(1)}L${(bx - uy * 3.2).toFixed(1)} ${(by + ux * 3.2).toFixed(1)}L${(bx + uy * 3.2).toFixed(1)} ${(by - ux * 3.2).toFixed(1)}Z`, { fill: C.soft }, marks);
      arrows.push(line);
    };
    const inner = narrow ? 7 : 8;
    if (!fk.top.stopped && top.aEnd - Math.max(top.aP0, 0) > 60) arrowAlong(top.aEnd, 1, (a) => newTop(a) - inner);
    if (bot && !fk.bot.stopped && bot.aEnd - Math.max(bot.aP0, 0) > 60) arrowAlong(bot.aEnd, 1, (a) => newBot(a) + inner);
    const working = !fk.bot && fk.lagPol >= 0 ? frags.find((f) => f.i === fk.lagPol) : null;
    if (working && working.aQ - working.aE > 60) arrowAlong(working.aE, -1, (a) => newBot(a) + inner);

    // ---- the proteins ----
    const glyphs = [];
    const blob = (a, c, ra, rc) => {
      const [x, y] = P(a, c);
      const rx = narrow ? rc : ra;
      const ry = narrow ? ra : rc;
      p.ellipse(x, y, rx, ry, PROTEIN, proteins);
      glyphs.push([x - rx, y - ry, x + rx, y + ry]);
    };

    // Topoisomerase, two lobes clasping the helix ahead.
    const aTopo = G.aV + clamp((G.aEnd - G.aV) * 0.5, 30, 170);
    let topoAt = null;
    if (has('topoisomerase') && aTopo < G.aEnd - 8) {
      const c0 = writhe(aTopo);
      const lobe = [narrow ? 5.5 : 7, narrow ? 4 : 5];
      blob(aTopo, c0 + G.A + lobe[1] - 1, lobe[0], lobe[1]);
      blob(aTopo, c0 - G.A - lobe[1] + 1, lobe[0], lobe[1]);
      topoAt = [aTopo, c0];
    }

    // Polymerase III at each 3′ end being extended. The lagging strand's works on the oldest fragment not
    // yet finished and waits by the fork when there is none.
    const polIII = [];
    if (!fk.top.stopped) polIII.push({ a: top.aEnd, c: midTop(top.aEnd), side: 1 });
    if (bot && !fk.bot.stopped) polIII.push({ a: bot.aEnd, c: midBot(bot.aEnd), side: -1 });
    if (!fk.bot) {
      const a = working ? working.aE : G.aV - G.gapPx - G.polRa - 4;
      polIII.push({ a, c: midBot(a), side: -1, idle: !working });
    }
    for (const q of polIII) blob(q.a, q.c, G.polRa, G.polRc);

    // Polymerase I and ligase at the joins, and a nick drawn where one is still open.
    const joins = [];
    frags.forEach((f, n) => {
      const j = f.g.junction;
      if (j.state === 'open' || j.state === 'sealed') return;
      const prev = n > 0 ? frags[n - 1] : null;
      const prevQ = prev ? prev.aQ : aOrigin;
      let a;
      if (j.state === 'gap') a = f.aE;
      else if (j.state === 'primer') a = prevQ;
      else if (j.state === 'pol1') a = prev ? prev.aRna1 : prevQ;
      else a = prev ? prev.aQ - primerPx : prevQ;
      joins.push({ a, j, arm: -1 });
    });
    for (const [s, arm] of [[fk.top, 1], [fk.bot, -1]]) {
      if (!s) continue;
      const j = s.origin;
      if (j.state === 'open' || j.state === 'sealed') continue;
      joins.push({ a: aOrigin + (j.state === 'pol1' ? j.p : j.state === 'primer' ? 0 : 1) * primerPx, j, arm });
    }
    const polI = [];
    const ligases = [];
    const breaks = [];
    for (const q of joins) {
      if (q.a < aLo || q.a > G.aV) continue;
      const mid = q.arm > 0 ? midTop(q.a) : midBot(q.a);
      const on = q.arm > 0 ? newTop(q.a) : newBot(q.a);
      if (q.j.state === 'gap') breaks.push({ a: q.a, c: on, arm: q.arm, kind: 'gap' });
      else if (q.j.state === 'pol1' && has('primer-removal')) {
        blob(q.a, mid, narrow ? 7 : 8.5, narrow ? 5.5 : 7);
        polI.push({ a: q.a, c: mid, arm: q.arm });
      } else if (q.j.state === 'ligase' && has('ligase')) {
        // Ligase, a clamp open on one side, round the nick it is sealing.
        const [x, y] = P(q.a, mid);
        const r = narrow ? 5.5 : 7;
        const open = narrow ? -Math.PI / 2 : 0;
        const arc = [];
        for (let t = 0; t <= 16; t += 1) {
          const ang = lerp(open + 0.9, open + 2 * Math.PI - 0.9, t / 16);
          arc.push([x + r * Math.cos(ang), y + r * Math.sin(ang)]);
        }
        p.path(dOf(arc), { fill: 'none', stroke: ENZYME.color, 'stroke-width': narrow ? 4 : 5, 'stroke-linecap': 'round' }, proteins);
        glyphs.push([x - r - 3, y - r - 3, x + r + 3, y + r + 3]);
        ligases.push({ a: q.a, c: mid, arm: q.arm });
      } else breaks.push({ a: q.a, c: on, arm: q.arm, kind: q.j.state === 'primer' ? 'blocked' : 'nick' });
    }
    // A break is a short paper-coloured cut through the strand, with a tick across it.
    const cut = (a, c, len) => {
      const [x, y] = P(a, c);
      return narrow
        ? `M${(x - len).toFixed(1)} ${y.toFixed(1)}L${(x + len).toFixed(1)} ${y.toFixed(1)}`
        : `M${x.toFixed(1)} ${(y - len).toFixed(1)}L${x.toFixed(1)} ${(y + len).toFixed(1)}`;
    };
    for (const n of breaks) {
      p.path(cut(n.a, n.c, 3.2), { stroke: C.paper, 'stroke-width': 3.2 }, proteins);
      p.path(cut(n.a, n.c, narrow ? 5 : 6), { stroke: C.ink, 'stroke-width': 1.1 }, proteins);
    }
    // A strand stopped by a terminator ends in a bar across it.
    const stops = [];
    for (const [s, arm, info] of [[fk.top, 1, top], [fk.bot, -1, bot]]) {
      if (!s || !s.stopped) continue;
      const on = arm > 0 ? newTop(info.aEnd) : newBot(info.aEnd);
      p.path(cut(info.aEnd, on, narrow ? 5 : 6), { stroke: C.ink, 'stroke-width': 2.4, 'stroke-linecap': 'butt' }, proteins);
      stops.push({ a: info.aEnd, c: on, arm });
    }
    for (const n of breaks) {
      if (n.kind !== 'gap') continue;
      p.path(cut(n.a, n.c, narrow ? 5 : 6), { stroke: C.ink, 'stroke-width': 2.4, 'stroke-linecap': 'butt' }, proteins);
      stops.push({ a: n.a, c: n.c, arm: n.arm });
    }

    // Primase, just behind the helicase on the lagging strand's template, where it lays each primer.
    let primaseAt = null;
    if (has('primase')) {
      const a = G.aV - G.ringR - 3;
      const c = tmplBot(a) - (narrow ? 6.5 : 8);
      blob(a, c, narrow ? 5.5 : 6.5, narrow ? 4 : 4.5);
      primaseAt = [a, c];
    }

    // Helicase, a ring of six round the lagging strand's template at the fork.
    let helicaseAt = null;
    if (has('helicase')) {
      const [x, y] = P(G.aV, -G.g * 0.25);
      for (let i = 0; i < 6; i += 1) {
        const ang = (i / 6) * Math.PI * 2 + Math.PI / 6;
        p.circle(x + G.ringR * 0.7 * Math.cos(ang), y + G.ringR * 0.7 * Math.sin(ang), G.ringR * 0.42, PROTEIN, proteins);
      }
      glyphs.push([x - G.ringR - 1, y - G.ringR - 1, x + G.ringR + 1, y + G.ringR + 1]);
      helicaseAt = [G.aV, -G.g * 0.25];
    }

    // The origin, marked across both arms.
    if (aOrigin > 2 && aOrigin < G.aV) {
      const [xa, ya] = P(aOrigin, tmplTop(aOrigin) + 6);
      const [xb, yb] = P(aOrigin, tmplBot(aOrigin) - 6);
      p.path(`M${xa.toFixed(1)} ${ya.toFixed(1)}L${xb.toFixed(1)} ${yb.toFixed(1)}`, { stroke: C.faint, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, marks);
    }

    for (const bx of glyphs) lab.reserve(...bx);

    // ---- the labels, most important first ----
    // Candidate spots on one side of a point: `side` +1 is towards the leading strand's arm (above, or to
    // the left on a phone), −1 towards the lagging strand's; `shifts` slide it along the DNA.
    const around = (a, c, side, { offs = [12, 24, 36], shifts = [0, 18, -18, 36, -36, 54, -54] } = {}) => {
      const out = [];
      for (const off of offs) {
        for (const sh of shifts) {
          const [x, y] = P(a + sh, c);
          if (!narrow) out.push([x, side > 0 ? y - off : y + off + S * 0.72, 'middle']);
          else out.push([side > 0 ? x - off : x + off, y + S * 0.35, side > 0 ? 'end' : 'start']);
        }
      }
      return out;
    };
    const place = (cands, str, size = S) => lab.place(cands, str, { size });
    const hypothetical = ruleWords() !== null;
    if (hypothetical) {
      const words = rule === 'same-direction' ? 'Hypothetical: strands run the same way' : 'Hypothetical: polymerase adds at either end';
      const size = narrow ? 9 : S * 0.92;
      const spots = narrow ? [[6, 12, 'start'], [6, G.hgt - 6, 'start']] : [[6, 14, 'start'], [6, G.hgt - 8, 'start']];
      lab.place(spots, words.toUpperCase(), { size, cls: 'rf-caps' });
    }
    const why = stalledBecause();
    if (why) {
      const words = why === 'no-helicase'
        ? (narrow ? 'no helicase: helix shut' : 'no helicase: the helix stays shut')
        : (narrow ? 'stalled by the twist' : 'stalled: too much twist ahead');
      const opts = { offs: [16, 30, 44], shifts: [0, 30, 60, 90] };
      const wr = writhe(G.aV + 30);
      place([...around(G.aV + 30, wr + G.A, 1, opts), ...around(G.aV + 30, wr - G.A, -1, opts)], words);
    }
    if (helicaseAt) place(around(G.aV + G.ringR * 0.6, -G.A - G.ringR * 0.4, -1, { offs: [10, 20, 30], shifts: [18, 30, 44, 6] }), 'helicase');
    for (const q of polIII) {
      if (q.idle) continue;
      const edge = q.side > 0 ? tmplTop(q.a) + 1 : tmplBot(q.a) - 1;
      place(around(q.a, edge, q.side, { offs: [11, 22, 33], shifts: [0, -14, 14, -28, 28] }), 'pol III');
    }
    if (primaseAt) place(around(primaseAt[0], primaseAt[1] - 3, -1, { offs: [10, 20, 30], shifts: [6, 20, -8, 34, -22] }), 'primase');
    const nameAt = (a0, a1) => clamp((a0 + a1) / 2, 40, G.aV - 50);
    const leadMid = nameAt(Math.max(aOrigin, 0), top.aEnd);
    place(around(leadMid, tmplTop(leadMid) + 1, 1, { offs: [11, 22, 33], shifts: [0, -30, 30, -60, 60] }), 'leading strand');
    // The lower strand's name goes over what has been made of it, not over bare template.
    // With no fragment in view (no primase, and the last one gone off the stage) the arm is bare template
    // and goes unnamed; the table's note says why.
    let lagMid = null;
    if (bot) lagMid = nameAt(Math.max(aOrigin, 0), bot.aEnd);
    else if (frags.length) {
      const seen = frags.map((f) => ({ f, len: f.aQ - Math.max(f.aE, 0) })).sort((x, y) => y.len - x.len)[0];
      lagMid = seen && seen.len > 40 ? clamp((Math.max(seen.f.aE, 0) + seen.f.aQ) / 2, 40, G.aV - 40) : G.aV - G.gapPx - 30;
    }
    if (lagMid !== null) place(around(lagMid, tmplBot(lagMid) - 1, -1, { offs: [11, 22, 33], shifts: [0, -30, 30, -60, 60] }), !fk.bot ? 'lagging strand' : rule === 'same-direction' ? (narrow ? 'continuous here' : 'continuous at this fork only') : (narrow ? 'also continuous' : 'made continuously too'));
    // The newest primer on the lagging strand, or else the leading strand's own at the origin. A primer
    // is drawn about ten times its length, so its name says so wherever there is room for the words.
    const primerName = (cands) => place(cands, 'RNA primer (not to scale)') || place(cands, 'RNA primer');
    const newest = frags.length ? frags[frags.length - 1] : null;
    if (newest && newest.aRna1 > newest.aRna0 + 1) {
      const a = (newest.aRna0 + newest.aRna1) / 2;
      primerName([...around(a, newBot(a) + 2, 1, { offs: [9, 19], shifts: [-6, -20, 8, -34] }), ...around(a, tmplBot(a) - 1, -1, { offs: [22, 34], shifts: [-10, -30, -50] })]);
    } else if (top.aP1 > 6 && replacedShare(fk.top.origin) < 1) {
      const a = (top.aP0 + top.aP1) / 2;
      primerName(around(a, newTop(a) - 2, -1, { offs: [9, 19], shifts: [8, 22, 36] }));
    }
    if (topoAt) place(around(topoAt[0], topoAt[1] + G.A + 9, 1, { offs: [8, 18, 28], shifts: [0, 22, -22, 44] }), 'topoisomerase');
    if (beads.length > 5) {
      const [a, c] = beads[Math.floor(beads.length * 0.6)];
      place(around(a, c - (c < 0 ? 4 : -4), c < 0 ? -1 : 1, { offs: [9, 19, 29], shifts: [0, 14, -14, 28, -28] }), 'SSB', S * 0.95);
    }
    for (const q of polI) place(around(q.a, q.arm > 0 ? tmplTop(q.a) + 1 : tmplBot(q.a) - 1, q.arm, { offs: [10, 21, 32], shifts: [0, 16, -16, 32, -32] }), 'pol I');
    for (const q of ligases) place(around(q.a, q.arm > 0 ? tmplTop(q.a) + 1 : tmplBot(q.a) - 1, q.arm, { offs: [10, 21, 32], shifts: [0, 16, -16, 32, -32] }), 'ligase');
    const nick = breaks.find((n) => n.kind !== 'gap');
    if (nick) place(around(nick.a, nick.c - nick.arm * 3, -nick.arm, { offs: [9, 19, 29], shifts: [0, 14, -14, 28] }), nick.kind === 'blocked' ? 'cannot be sealed' : 'nick');
    for (const st of stops) place(around(st.a, st.c - st.arm * 3, -st.arm, { offs: [10, 20, 30], shifts: [-10, -26, 6, -42] }), 'terminator');
    // One finished fragment named, inside the fork.
    const whole = frags.filter((f) => f.g.done && !f.g.stopped && f.aQ - f.aE > 70 && f.aE > 10);
    if (whole.length) {
      const f = whole[whole.length - 1];
      const a = (f.aE + f.aQ) / 2;
      place([...around(a, newBot(a) + 2, 1, { offs: [11, 22], shifts: [0, -20, 20, -40] }), ...around(a, tmplBot(a) - 1, -1, { offs: [11, 22, 33], shifts: [0, -20, 20, -40] })], 'Okazaki fragment');
    }
    // The growing ends. A new strand is made 5′ to 3′, so its growing end is its 3′ end — except under
    // the hypothetical rule that lets the lower one grow at its 5′ end.
    if (!fk.top.stopped && top.aEnd > 40) place(around(top.aEnd - G.polRa - 4, newTop(top.aEnd) - 2, -1, { offs: [9, 18], shifts: [0, -10, -20] }), '3′', S * 0.95);
    if (bot && !fk.bot.stopped && bot.aEnd > 40) place(around(bot.aEnd - G.polRa - 4, newBot(bot.aEnd) + 2, 1, { offs: [9, 18], shifts: [0, -10, -20] }), rule === 'either-end' ? '5′' : '3′', S * 0.95);
    if (working && working.aQ - working.aE > 26) {
      place(around(working.aE + G.polRa + 4, newBot(working.aE) + 2, 1, { offs: [9, 18], shifts: [0, 10, 20] }), '3′', S * 0.95);
      place(around(working.aQ, newBot(working.aQ) + 2, 1, { offs: [9, 18], shifts: [0, -8, 8] }), '5′', S * 0.95);
    }
    if (aOrigin > 8) place(around(aOrigin, tmplBot(aOrigin) - 6, -1, { offs: [10, 20], shifts: [0, 12, 24] }), 'origin');
    // The template strands' ends, where the helix leaves the stage: antiparallel, or not.
    const endC = [helixC(aStop, 1), helixC(aStop, -1)];
    const upper = endC[0] >= endC[1] ? 0 : 1;
    const endWords = ['5′', antiparallel(rule) ? '3′' : '5′'];
    for (const k of [0, 1]) {
      const [x, y] = P(aStop, endC[k]);
      const up = k === upper;
      if (!narrow) lab.place([[x + 5, y + (up ? -2 : 9), 'start'], [x + 5, y + (up ? -8 : 15), 'start']], endWords[k], { size: S * 0.95 });
      else {
        // Above the strand's own end first: beside it, the strand's first turn is in the way.
        const anchor = up ? 'end' : 'start';
        lab.place([[x + (up ? -3 : 3), y - 8, anchor], [x + (up ? -5 : 5), y - 4, anchor], [x + (up ? -10 : 10), y + 4, anchor]], endWords[k], { size: S * 0.95 });
      }
    }
    const aHelixName = Math.min(G.aEnd - 40, G.aV + (G.aEnd - G.aV) * 0.78);
    if (aHelixName > G.aV + 30) place(around(aHelixName, -G.A - 2, -1, { offs: [12, 24, 36], shifts: [0, -24, 24, -48] }), 'parent helix');
  }

  function drawForkTable() {
    const { w, h: hgt } = table.box;
    const c = forkCounts(fk);
    const rows = [
      ['Time', `${(fk.tau / SLOW).toFixed(2)} s`],
      ['Unwound', `${nt(fk.F)} nt`],
      ['Leading strand', `${nt(fk.top.end)} nt`],
      ['Fragments started', fk.bot ? '0' : String(fk.frags.length)],
      ['Primers in place', String(c.primers)],
      ['Nicks not sealed', String(c.nicks)],
      ['Pyrophosphate released', nt(c.ppi)],
      ['Twist ahead', `${Math.round(fk.tw)} turn${Math.round(fk.tw) === 1 ? '' : 's'}`],
    ];
    const r = ruleWords(b.narrow);
    const words = forkWords(b.narrow);
    if (!b.narrow) {
      const size = clamp(Math.max(w * 0.04, hgt * 0.033), 9.6, 11.6);
      table.readout({ title: 'At the fork', x: 6, width: Math.min(w - 8, 320), size, minRow: 14, maxRow: 24 }).fit(hgt, (t, level) => {
        for (const [k, v] of rows) t.row(k, v);
        if (r) t.note(r, { size: size - 0.6 });
        if (words && (level < 1 || !r)) t.note(words, { size: size - 0.6 });
      }, { levels: 2 });
      return;
    }
    // Narrow: the rows in two columns, the sentences under them at full width.
    const size = 10;
    const colW = (w - 14) / 2;
    const notes = [r, words].filter(Boolean);
    const noteT = table.readout({ x: 0, width: w, size });
    for (const n of notes) noteT.note(n, { size: 9.4 });
    const noteH = noteT.height(14);
    const into = Math.max(60, hgt - noteH - 2);
    const left = table.readout({ title: 'At the fork', x: 0, width: colW, size, minRow: 13, maxRow: 20 });
    for (const [k, v] of rows.slice(0, 4)) left.row(k, v);
    const bottomL = left.fill(into);
    const right = table.readout({ title: 'Made', x: colW + 14, width: colW, size, minRow: 13, maxRow: 20 });
    for (const [k, v] of rows.slice(4)) right.row(k === 'Pyrophosphate released' ? 'Pyrophosphate' : k, v);
    const bottomR = right.fill(into);
    const noteAt = table.readout({ x: 0, y: Math.max(bottomL, bottomR) + 2, width: w, size });
    for (const n of notes) noteAt.note(n, { size: 9.4 });
    noteAt.draw(14, hgt - Math.max(bottomL, bottomR) - 2);
  }

  // ---- the whole chromosome ----
  function drawChromosome() {
    const p = forkPane;
    const { w, h: hgt } = p.box;
    const narrow = b.narrow;
    const ch = chromosome(organism, origins);
    const frac = ch.copied(chrMin);
    const lab = placer(p);
    const S = narrow ? 10 : clamp(hgt * 0.034, 10, 11.5);
    const clockSize = narrow ? 24 : clamp(hgt * 0.1, 22, 34);
    const drawClock = (x, y, anchor) => {
      p.text(x, y - clockSize - 6, 'Copying time', { anchor, class: 'tb-rt-title', 'font-size': 9.4 });
      p.text(x, y, clockText(chrMin, organism, origins), { anchor, class: 'rf-num', 'font-size': clockSize.toFixed(1), 'font-weight': 600, style: `fill:${C.ink}` });
      lab.reserve(anchor === 'middle' ? x - 110 : x - 2, y - clockSize - 18, anchor === 'middle' ? x + 110 : x + 230, y + 6);
    };
    if (organism === 'e-coli') {
      const cx = narrow ? w / 2 : w * 0.36;
      const cy = narrow ? hgt * 0.4 : hgt * 0.5;
      const R = narrow ? Math.min(w * 0.34, hgt * 0.3) : Math.min(hgt * 0.38, w * 0.22);
      const th = Math.PI * frac;
      const at = (phi, r) => [cx + r * Math.cos(phi), cy + r * Math.sin(phi)];
      const arc = (p0, p1, r) => {
        const n = Math.max(2, Math.ceil(Math.abs(p1 - p0) / 0.04));
        let d = '';
        for (let i = 0; i <= n; i += 1) {
          const [x, y] = at(lerp(p0, p1, i / n), r);
          d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        return d;
      };
      const top = -Math.PI / 2;
      if (th < Math.PI - 1e-6) p.path(arc(top + th, top + 2 * Math.PI - th, R), { fill: 'none', stroke: C.soft, 'stroke-width': 2 });
      if (th > 1e-6) {
        p.path(arc(top - th, top + th, R - 3.2), { fill: 'none', stroke: C.ink, 'stroke-width': 1.6 });
        p.path(arc(top - th, top + th, R + 3.2), { fill: 'none', stroke: C.ink, 'stroke-width': 1.6 });
      }
      for (let k = 0; k < 48; k += 1) {
        const [x, y] = at((k / 48) * 2 * Math.PI, R);
        lab.reserve(x - 6, y - 6, x + 6, y + 6);
      }
      // The origin, and a fork at each end of the copied arc, pointing the way it travels.
      const [ox, oy] = at(top, R + 7);
      const [ix, iy] = at(top, R - 7);
      p.path(`M${ox.toFixed(1)} ${oy.toFixed(1)}L${ix.toFixed(1)} ${iy.toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.4 });
      lab.place([[cx, cy - R - 12, 'middle']], 'origin', { size: S });
      if (frac > 0.004 && frac < 1) {
        for (const dir of [1, -1]) {
          const phi = top + dir * th;
          const [fx, fy] = at(phi, R);
          const tx = -Math.sin(phi) * dir;
          const ty = Math.cos(phi) * dir;
          const nx = Math.cos(phi);
          const ny = Math.sin(phi);
          const tip = [fx + tx * 7, fy + ty * 7];
          const b1 = [fx - tx * 2 + nx * 5, fy - ty * 2 + ny * 5];
          const b2 = [fx - tx * 2 - nx * 5, fy - ty * 2 - ny * 5];
          p.path(`M${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}L${b2[0].toFixed(1)} ${b2[1].toFixed(1)}Z`, { fill: C.ink });
          const [lx, ly] = at(phi, R + 18);
          lab.place([[lx, ly + 4, 'middle'], [lx + dir * 10, ly + 14, 'middle']], 'fork', { size: S });
        }
      } else if (frac >= 1) {
        lab.place([[cx, cy + R + 22, 'middle']], 'the forks meet', { size: S });
      }
      lab.place([[cx, cy + 4, 'middle']], '4.6 million bp', { size: S });
      if (narrow) drawClock(w / 2, hgt - 10, 'middle');
      else drawClock(w * 0.66, hgt * 0.62, 'start');
      return;
    }

    // Human chromosome 1, drawn as a line to scale.
    const x0 = 12;
    const x1 = w - 12;
    const X = (bp) => x0 + ((x1 - x0) * bp) / CHR1_BP;
    const yL = narrow ? hgt * 0.16 : hgt * 0.24;
    const half = 3.2;
    lab.place([[x0, yL - 14, 'start']], narrow ? 'chromosome 1, 249 million bp' : 'human chromosome 1, 249 million bp', { size: S });
    // The copied stretches, as the bubbles they are, and the rest as one line.
    const spans = [];
    const forks = [];
    if (origins === 'one') {
      const e = Math.min(CHR1_BP / 2, HUMAN_NT_S * 60 * chrMin);
      if (e > 0) spans.push([CHR1_BP / 2 - e, CHR1_BP / 2 + e]);
      if (e > 0 && e < CHR1_BP / 2) forks.push([CHR1_BP / 2 - e, -1], [CHR1_BP / 2 + e, 1]);
    } else {
      let cur = null;
      for (let j = 0; j < HUMAN_ALL.pos.length; j += 1) {
        const [l, r, fl, fr] = humanAllExtents(chrMin, j);
        if (l + r <= 0) continue;
        const s0 = HUMAN_ALL.pos[j] - l;
        const s1 = HUMAN_ALL.pos[j] + r;
        if (fl) forks.push([s0, -1]);
        if (fr) forks.push([s1, 1]);
        if (cur && s0 <= cur[1] + 1) cur[1] = Math.max(cur[1], s1);
        else {
          if (cur) spans.push(cur);
          cur = [s0, s1];
        }
      }
      if (cur) spans.push(cur);
    }
    const lineAt = (y, yh, segs, gaps, scaleX) => {
      let dOne = '';
      let dTwo = '';
      let from = 0;
      for (const [s0, s1] of segs) {
        if (scaleX(s0) > scaleX(from) + 0.3) dOne += `M${scaleX(from).toFixed(1)} ${y.toFixed(1)}L${scaleX(s0).toFixed(1)} ${y.toFixed(1)}`;
        const xa = scaleX(s0);
        const xb = Math.max(scaleX(s1), xa + 0.8);
        dTwo += `M${xa.toFixed(1)} ${(y - yh).toFixed(1)}L${xb.toFixed(1)} ${(y - yh).toFixed(1)}M${xa.toFixed(1)} ${(y + yh).toFixed(1)}L${xb.toFixed(1)} ${(y + yh).toFixed(1)}`;
        from = s1;
      }
      if (gaps.end > from) dOne += `M${scaleX(from).toFixed(1)} ${y.toFixed(1)}L${scaleX(gaps.end).toFixed(1)} ${y.toFixed(1)}`;
      if (dOne) p.path(dOne, { stroke: C.soft, 'stroke-width': 2, fill: 'none' });
      if (dTwo) p.path(dTwo, { stroke: C.ink, 'stroke-width': 1.4, fill: 'none' });
    };
    lineAt(yL, half, spans, { end: CHR1_BP }, X);
    // The chromosome's two ends.
    p.path(`M${x0} ${(yL - 6).toFixed(1)}V${(yL + 6).toFixed(1)}M${x1} ${(yL - 6).toFixed(1)}V${(yL + 6).toFixed(1)}`, { stroke: C.ink, 'stroke-width': 1.4 });
    lab.reserve(x0 - 2, yL - 8, x1 + 2, yL + 8);
    // Origins, as ticks under the line: dark once fired.
    const tickY = yL + 7;
    if (origins === 'one') {
      const x = X(CHR1_BP / 2);
      p.path(`M${x.toFixed(1)} ${tickY.toFixed(1)}v6`, { stroke: C.ink, 'stroke-width': 1.4 });
      lab.place([[x, tickY + 18, 'middle']], 'origin', { size: S });
      for (const [bp, dir] of forks) {
        const x2 = X(bp);
        p.path(`M${(x2 + dir * 6).toFixed(1)} ${yL.toFixed(1)}L${(x2 - dir * 1).toFixed(1)} ${(yL - 5).toFixed(1)}L${(x2 - dir * 1).toFixed(1)} ${(yL + 5).toFixed(1)}Z`, { fill: C.ink });
      }
    } else {
      let dOn = '';
      let dOff = '';
      for (let j = 0; j < HUMAN_ALL.pos.length; j += 1) {
        const x = X(HUMAN_ALL.pos[j]).toFixed(1);
        if (HUMAN_ALL.T[j] <= chrMin) dOn += `M${x} ${tickY.toFixed(1)}v5`;
        else dOff += `M${x} ${tickY.toFixed(1)}v5`;
      }
      if (dOff) p.path(dOff, { stroke: C.faint, 'stroke-width': 0.5, 'stroke-opacity': 0.8 });
      if (dOn) p.path(dOn, { stroke: C.ink, 'stroke-width': 0.5 });
    }
    lab.reserve(x0, tickY - 1, x1, tickY + 7);
    // Two bars to the same scale: fifty million pairs, and the whole of E. coli's chromosome.
    const yBar = yL + (narrow ? 34 : 40);
    const barX = x1 - (X(50e6) - x0);
    p.path(`M${barX.toFixed(1)} ${yBar.toFixed(1)}H${x1}M${barX.toFixed(1)} ${(yBar - 3).toFixed(1)}v6M${x1} ${(yBar - 3).toFixed(1)}v6`, { stroke: C.ink, 'stroke-width': 1.2 });
    lab.place([[(barX + x1) / 2, yBar + 15, 'middle']], '50 million bp', { size: S * 0.95 });
    const eW = Math.max(2, X(ECOLI_BP) - x0);
    p.path(`M${x0} ${yBar.toFixed(1)}h${eW.toFixed(1)}`, { stroke: C.ink, 'stroke-width': 3 });
    lab.place([[x0, yBar + 15, 'start']], narrow ? 'E. coli, same scale' : 'E. coli’s whole chromosome, to the same scale', { size: S * 0.95 });

    if (origins === 'all') {
      // A stretch enlarged, where one origin's forks can be told from its neighbours'.
      const yZ = narrow ? hgt * 0.5 : hgt * 0.58;
      const Z = (bp) => x0 + ((x1 - x0) * (bp - ZOOM[0])) / (ZOOM[1] - ZOOM[0]);
      const inZoom = spans.map(([s0, s1]) => [Math.max(ZOOM[0], s0), Math.min(ZOOM[1], s1)]).filter(([s0, s1]) => s1 > s0);
      p.path(`M${X(ZOOM[0]).toFixed(1)} ${(tickY + 7).toFixed(1)}L${x0} ${(yZ - 16).toFixed(1)}M${X(ZOOM[1]).toFixed(1)} ${(tickY + 7).toFixed(1)}L${x1} ${(yZ - 16).toFixed(1)}`, { stroke: C.faint, 'stroke-width': 0.8, 'stroke-dasharray': '2 3' });
      // Its own line, from the zoom's left edge.
      const Zs = (bp) => Z(bp + ZOOM[0]);
      lineAt(yZ, 4.5, inZoom.map(([s0, s1]) => [s0 - ZOOM[0], s1 - ZOOM[0]]), { end: ZOOM[1] - ZOOM[0] }, Zs);
      let dOn = '';
      let dOff = '';
      for (let j = 0; j < HUMAN_ALL.pos.length; j += 1) {
        const bp = HUMAN_ALL.pos[j];
        if (bp < ZOOM[0] || bp > ZOOM[1]) continue;
        const x = Z(bp).toFixed(1);
        if (HUMAN_ALL.T[j] <= chrMin) dOn += `M${x} ${(yZ + 8).toFixed(1)}v6`;
        else dOff += `M${x} ${(yZ + 8).toFixed(1)}v6`;
      }
      if (dOff) p.path(dOff, { stroke: C.faint, 'stroke-width': 1 });
      if (dOn) p.path(dOn, { stroke: C.ink, 'stroke-width': 1.2 });
      for (const [bp, dir] of forks) {
        if (bp < ZOOM[0] || bp > ZOOM[1]) continue;
        const x = Z(bp);
        p.path(`M${(x + dir * 5).toFixed(1)} ${yZ.toFixed(1)}L${(x - dir * 1).toFixed(1)} ${(yZ - 4.5).toFixed(1)}L${(x - dir * 1).toFixed(1)} ${(yZ + 4.5).toFixed(1)}Z`, { fill: C.ink });
      }
      lab.reserve(x0, yZ - 8, x1, yZ + 15);
      const zoomWords = `${((ZOOM[1] - ZOOM[0]) / 1e6).toFixed(0)} million bp enlarged`;
      lab.place([[x0, yZ + 30, 'start']], narrow ? `${zoomWords}: origins and forks` : `${zoomWords}: origins, and the forks leaving them`, { size: S * 0.95 });
    }
    // The clock goes under the drawing, and for one origin, where there is no enlargement, in the middle
    // of the room the enlargement would have taken.
    const clockY = origins === 'all' ? hgt - (narrow ? 10 : 12) : Math.min(hgt - 12, (yBar + 24 + hgt) / 2 + clockSize / 2);
    if (narrow) drawClock(w / 2, clockY, 'middle');
    else drawClock(x0, clockY, 'start');
  }

  function drawChromosomeTable() {
    const { w, h: hgt } = table.box;
    const ch = chromosome(organism, origins);
    const rows = [
      ['Length', organism === 'e-coli' ? '4.6 million bp' : '249 million bp'],
      ['Origins', nt(ch.originCount)],
      ['Fork speed', `${ch.speed} nt/s`],
      ['Copied', `${(100 * ch.copied(chrMin)).toFixed(1)} %`],
      ['Elapsed', clockText(chrMin, organism, origins)],
      ['Finished at', finishText(ch, organism, origins)],
    ];
    const words = chromosomeWords(ch);
    const title = organism === 'e-coli' ? 'E. coli' : 'Human chromosome 1';
    if (!b.narrow) {
      const size = clamp(Math.max(w * 0.04, hgt * 0.033), 9.6, 11.6);
      table.readout({ title, x: 6, width: Math.min(w - 8, 320), size, minRow: 14, maxRow: 26 }).fit(hgt, (t, level) => {
        for (const [k, v] of rows) t.row(k, v);
        if (level < 1) t.note(words, { size: size - 0.6 });
      }, { levels: 2 });
      return;
    }
    const size = 10;
    const colW = (w - 14) / 2;
    const noteT = table.readout({ x: 0, width: w, size });
    const brief = chromosomeWords(ch, true);
    noteT.note(brief, { size: 9.4 });
    const into = Math.max(60, hgt - noteT.height(14) - 2);
    const left = table.readout({ title, x: 0, width: colW, size, minRow: 13, maxRow: 22 });
    for (const [k, v] of rows.slice(0, 3)) left.row(k, v);
    const bl = left.fill(into);
    const right = table.readout({ title: 'The clock', x: colW + 14, width: colW, size, minRow: 13, maxRow: 22 });
    for (const [k, v] of rows.slice(3)) right.row(k, v);
    const br = right.fill(into);
    const noteAt = table.readout({ x: 0, y: Math.max(bl, br) + 2, width: w, size });
    noteAt.note(brief, { size: 9.4 });
    noteAt.draw(14, hgt - Math.max(bl, br) - 2);
  }

  // describe() — what the gates and any task read. The frame adds id, kind, number and state; the bench
  // adds layout. The computed fields are the ones worth asserting:
  //   scene               'fork' | 'chromosome'
  //   rule                'as-they-are' | 'same-direction' | 'either-end'
  //   laggingContinuous   computed from the two facts alone: true only under 'either-end', whose polymerase
  //                       adds at either end; false in every state under 'as-they-are', and false under
  //                       'same-direction', which moves the fragments to the other fork
  //   strandsInFragments  [this fork, the fork leaving the origin the other way], computed from the two
  //                       facts alone: [1, 1] under 'as-they-are', [0, 2] under 'same-direction', [0, 0]
  //                       under 'either-end'
  //   removed             the enzymes taken away, in the toolbar's order
  //   forkTimeS           the time at the fork, in real seconds: a quarter of the figure's, as the table shows it
  //   unwoundNt           how far the fork has opened from its origin (opens at 1500)
  //   leadingLengthNt     the leading (top) strand, primer included
  //   fragmentsStarted    Okazaki fragments begun at the fork drawn; 0 under either hypothetical rule
  //   primersInPlace      RNA primers not yet replaced (2 at the opening)
  //   nicksUnsealed       joins not yet sealed, the primer-blocked ones included
  //   pyrophosphateReleased  one per nucleotide joined to a chain, from the lengths made; a primer's
  //                       first nucleotide releases none (1488 at the opening)
  //   twistAheadTurns     turns of overwinding ahead of the fork
  //   forkStalled         computed; true only with the helicase or the topoisomerase taken away
  //   stalledBecause      'no-helicase' | 'twist' | null
  //   chainTerminated     a strand has stopped at a terminator the reader added
  //   terminatedStrand    which: 'leading' | 'lower' (under a hypothetical rule) | 'lagging' (a fragment) | null
  //   organism            'e-coli' | 'human-chr1'
  //   origins             'one' | 'all' (E. coli has one either way)
  //   originCount         1, 1, or 1606
  //   forkSpeedNtPerS     1000 for E. coli, 50 for human
  //   copiedPercent       of the chromosome, 0–100
  //   elapsedMinutes      on the chromosome's clock
  //   finishMinutes       38.3, 41,500 or 480, computed from the length, the origins and the speed
  //   t, playing          the clock, in seconds to three decimals, and whether it runs
  return b.handle();
}
