// npm run pinned: press every control every figure has, with the clock pinned, and fail a figure that
// keeps moving afterwards.
//
// Claim: for each kind in the registry, loading `lab/?kind=<k>&theme=light&eager=1&t=0` and then working
// each of the figure's enabled controls once through Playwright's real mouse and real keyboard — every
// visible button clicked, every visible range input driven to its maximum, its minimum and one page-step
// above its minimum by End, Home and PageUp on the control itself, and every element the figure makes
// focusable sent each key in KEYS — leaves describe() reporting the same thing across an untouched window
// after every one of them, and across an untouched window before any of them. That is AGENTS.md's
// invariant — "nothing advances on its own while `ctx.pinnedTime` is set" — and it is what makes a
// screenshot the same frame every run.
//
// WHY THIS GATE EXISTS, and why none of the others could see it. `npm run shot` loads every page pinned
// and is the gate that depends on this invariant, but it presses nothing, so it only ever photographed
// figures that happened to be still because nothing had started them. `npm run drive` presses every
// control, but it opens the lab UNPINNED, and several of its recipes assert that a clock DID move — its
// whole contract is the opposite of this one. Measured 2026-09-17 on a frozen tree, with the clock pinned
// at t=0: one press of Run on `gradient-battery` ran the cell at a simulated minute per second
// (cellMinutes 0 -> 0.52, t 0 -> 0.517 in one second), and one press of Play on `secretion` advanced its
// clock 0.983 s in the same window. Both figures are photographed by `npm run shot` at `?t=0`.
//
// WHY ITS OWN FILE rather than a step inside tools/drive.js, which already mounts every kind and knows
// every control. Three reasons, and the third is the one that decides it. (1) drive's page is unpinned by
// contract; this check needs a second page with the opposite contract, so it would be a different gate
// sharing a file rather than the same gate. (2) drive fails a kind that has no recipe, and this check must
// need no recipe at all — that is what lets it cover a figure the day it lands, before anyone writes steps
// for it. (3) drive's recipes deliberately do not press some controls; this presses all of them, which is
// how `gradient-battery` was caught, and widening drive's recipes to match would change what drive claims.
//
// ONE ACTION PER MOUNT, and this is not an optimisation to undo. The first version of this gate pressed a
// kind's buttons in order on one page, and it reported `secretion` as CLEAN with its guard deliberately
// removed: by the time the loop reached "Play the journey", earlier presses had already walked the clock
// to the end of the route, so Play started a journey that was already over and stopped again within one
// frame. The gate would have gone green over the exact defect it was written for — a fixture that ends
// early measuring a figure that has nothing left to do. So every control is worked on a figure that has
// just mounted, and the control lists are read once from a fresh mount so that index i is the same control
// every time rather than whatever an earlier action left in its place. The one thing that does NOT force a
// remount is an action the figure ignored outright: a key that the figure neither cancels nor answers with
// any change in describe() has left the mount as fresh as it found it, and paying a page load for it would
// have put a minute and a half on this gate for the keys no figure binds. `probe` below draws that line.
//
// The bound that shape carries: this gate works ONE control at a time, so a clock that only starts on a
// combination — press A, then press B — is outside it. `npm run drive`'s recipes are what press controls
// in sequence, and they run unpinned.
//
// HOW AN ACTION IS JUDGED, and the bound that carries. After each action the figure is left alone and
// describe() is read across one window of animation frames after another, up to MAX_WINDOWS of them. The
// first window whose reading holds still ends it: what came before was a transition settling after the
// action, and it is reported and not failed. A figure still changing in the MAX_WINDOWS'th window is
// MOVING — a clock, which never settles. So the bound is: an advance that outlives MAX_WINDOWS windows is
// caught, a transition shorter than one window is not seen at all, and one that settles inside the cap is
// seen and reported. TWO windows were not enough once this gate started sending arrow keys: a damped
// camera nudged by an arrow takes about four windows to converge, and cell3d, dna3d, water3d, cilium and
// plantcell3d were all reported as breaking the invariant over camera easings that measurably stop —
// dna3d's view.theta moved -2.8e-2, then -3.8e-3, then -6.0e-4, then nothing at all for eleven more
// windows. A gate that cannot tell an easing from a clock reports the wrong figures with the same
// confidence as the right ones. The window is counted in ANIMATION FRAMES, not milliseconds
// (docs/policies/local-rules.md, "a wait in a gate must poll the artefact, never the wall clock"): a
// figure advances its clock as frames arrive, so on a machine carrying another gate a fixed millisecond
// window gives the figure fewer chances to move and reads a broken figure as clean. That is also what
// keeps the cap steady — an easing needs the same number of FRAMES on a loaded machine as on an idle one.
// A floor in milliseconds sits under it for a figure driven by a timer rather than by frames.
//
// WHAT IS NOT COMPARED: `frameMs`, `drawCalls`, `triangles` and `fps`. Those report on the last frame the
// renderer drew rather than on the figure's state, and a figure that redraws an unchanged scene while
// pinned is not advancing. Every other field describe() reports is state and is compared, including
// strings and arrays.
//
// HOW A KEY IS DELIVERED, and how the gate decides a figure ignored it. The key goes through Playwright's
// real keyboard to whichever element the figure made focusable, after focusing it, so it arrives by the
// same path a reader's key does. An init script records, for the last keydown, whether it reached the
// window and whether anything cancelled it; every keyboard handler in src/figures calls preventDefault on
// the keys it binds, so a key that came back uncancelled AND changed nothing in describe() across two
// animation frames is one the figure does not handle, and it is not measured. TWO frames, because one is
// not enough to see a clock that has just started: a figure's first frame computes dt from a zeroed `last`
// and moves nothing, so a one-frame probe read a started clock as an ignored key. The bound: a figure that
// handles a key without cancelling it and whose answer takes longer than two frames to show in describe()
// is read as ignoring it. A handler that calls stopPropagation is counted as handling the key, because the
// record never reaches the window.
//
// Other bounds: one viewport (1000x640), the light theme, one action per fresh mount, and no drag, no
// modifier, no wheel and no pointer anywhere but a button — so a clock that only a drag on the stage, a
// Shift+key or a pinch can start is outside this gate. A range is driven to three values (End, Home, one
// PageUp above the minimum), so a figure that only misbehaves at a value between them is outside it too.
// KEYS is the set sent to every focusable, and it is the named keys plus the single letters and digits the
// focusable's own aria-label names as keys; a label that names a key word this gate does not send —
// Shift, Tab, Ctrl — is printed under "not pressed" every run rather than failed, because a label is prose
// and that match is not exact. `PINNED_KINDS=<a,b>` trims the run to those kinds, a trimmed run proves only
// its part, and a name that is not a registered kind stops the run rather than running on
// (tools/lib/trim.js).
//
// THE OUTSTANDING LIST. `KNOWN` below holds figures measured to break this invariant that the round which
// measured them was not scoped to change. It is empty today. An entry is not a skip: the kind is worked and
// measured like the rest, printed by name every run WITH WHAT THIS RUN MEASURED rather than only with the
// sentence the entry carries about itself, and a kind in the list that STOPS moving fails the gate, so the
// list cannot rot into a silent exception — whoever fixes one deletes its entry in the same commit. The
// measurement is printed beside the note because an entry can be wrong: the pump entry read "Ouabain → the
// pump cycle steps on its own" from the run that pressed a kind's buttons in order on one page, and on a
// fresh mount Ouabain moves nothing — only Run did. A kind that is NOT in the list and moves fails, which
// is the part that covers every figure written from now on.
//
// IT RUNS AS SHARDS, and the shape is chosen by what makes the verdict safe rather than by what is
// fastest. The 44 kinds are independent — each is its own page, its own mount, its own judgement — so
// the run is split across processes, `PINNED_SHARDS` of them, eight by default. A shard is this same
// file with `PINNED_KINDS` set to its slice, so the measuring code below is the one the single-process
// run uses and nothing about how a kind is judged changes with the shard count. Measured 2026-09-17 on
// this machine (32 logical CPUs): 1 process 418 s, 4 processes 144 s, 8 processes 81 s, every shard
// exit 0, and the shards summing to exactly the single run's work — 44 kinds, 775 mounts, 337 presses,
// 927 keys.
//
// WHY IT SURVIVES SHARDING when a gate normally cannot. This one counts ANIMATION FRAMES, not
// milliseconds (see the window below), so a figure on a machine carrying seven other chromiums gets the
// same number of chances to move as one on an idle machine and is judged the same. A gate with a wall
// clock in it would have been made to lie by its own parallelism.
//
// ONE COMMAND, ONE VERDICT, and a shard that vanishes is a failure. The parent fails when a shard exits
// non-zero, when it is killed by a signal, when it cannot be spawned at all, when it exits 0 and prints
// no totals record — a shard that did not run must never read as one that passed — and when the shards'
// kind counts do not add up to the population dispatched. The parent relays every shard's whole output
// in shard order and sums their counts, so the summary a reader gets is the summary a single process
// printed. `PINNED_SHARDS=1` runs everything in this process and is the reference run.
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { trim } from './lib/trim.js';
import { KINDS } from '../src/figures/registry.js';

const OUT = 'out/pinned';
const FRAMES = 12; // animation frames in one untouched window
const FLOOR_MS = 150; // and no shorter than this in wall time, for a figure driven by a timer
const MAX_WINDOWS = 8; // windows of change before a figure is called moving rather than settling
const IGNORE = new Set(['frameMs', 'drawCalls', 'triangles', 'fps']);

// Each entry is the press that starts it and what moves; `npm run pinned` prints the list, and what it
// measured against each entry, every run. Delete an entry in the commit that fixes its figure — this gate
// fails if a listed kind has stopped moving. It is EMPTY, and the six kinds that were on it — pond,
// homeostasis, pasteur, soup, waterprops and pump — were fixed on 2026-09-17; their before-and-after
// measurements and the mutation that proves this gate red are in docs/learning/gate-proofs.md.
const KNOWN = new Map([]);
// Deliberately NOT on that list, and this is the distinction MAX_WINDOWS above exists to draw: cell3d,
// cilium and plantcell3d (labelsShown easing in), water3d (a held molecule easing out), prokaryote (a
// lysis animation), atp3d (a camera easing back) and surface-volume (a diffusion clock that runs to its
// end) all change state after a press and all stop inside one window, and every 3D figure's camera eases
// for about four windows after an arrow key. A one-window probe reported the first seven as breaking the
// invariant, and a two-window one reported five of the cameras; they are transitions with an end, not
// clocks, and the run prints each of them under "settled".

const wanted = trim('PINNED_KINDS', KINDS, { noun: 'kind' });

// ─────────────────────────────── the shard ───────────────────────────────
// A shard is this same file, spawned with PINNED_KINDS set to its slice and PINNED_SHARD set to its
// number. PINNED_SHARD is the parent's to set and nobody else's: it is what tells a process it is a
// shard, so it must never be typed by hand — a process that thinks it is a shard does not clear
// out/pinned/ and prints a totals record its parent is waiting for.
const SHARD = process.env.PINNED_SHARD ? Number(process.env.PINNED_SHARD) : null;
const MAX_SHARDS = 32;
const DEFAULT_SHARDS = 8;
// The one line a shard's parent reads back. It is a marked JSON record rather than the summary sentence
// below it, because parsing prose would make the totals a guess about wording; the parent requires
// exactly one of these from every shard and fails a shard that printed none.
const TOTALS = '##pinned-shard-totals';

// How many shards, validated the way a trimming variable is: a value that names nothing runnable stops
// the run and says what would satisfy it, rather than running something nobody asked for.
function shardCount() {
  const raw = process.env.PINNED_SHARDS;
  if (raw === undefined || raw.trim() === '') return DEFAULT_SHARDS;
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < 1 || n > MAX_SHARDS) {
    throw new Error(`PINNED_SHARDS=${raw} is not a number of shards. It must be a whole number from 1 to ${MAX_SHARDS}: 1 runs every kind in this one process, which is the reference run, and the default is ${DEFAULT_SHARDS}. This machine reports ${availableParallelism()} logical CPU(s).`);
  }
  return n;
}

// Round robin, not contiguous blocks: the kinds cost wildly different amounts — one with eleven
// focusables is minutes and one with two buttons is seconds — so dealing them out one at a time spreads
// the expensive ones instead of stacking them into one shard and leaving the run waiting on it.
function deal(kinds, n) {
  const groups = Array.from({ length: n }, () => []);
  kinds.forEach((k, i) => groups[i % n].push(k));
  return groups.filter((g) => g.length);
}

async function runShards(groups) {
  const t0 = Date.now();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  console.log(`${groups.length} shard(s) of tools/pinned.js, ${wanted.length} kind(s) dealt round robin, all started at once. This machine reports ${availableParallelism()} logical CPU(s). PINNED_SHARDS=1 runs the lot in one process.`);
  for (const [i, g] of groups.entries()) console.log(`  shard ${i + 1}: ${g.length} kind(s) — ${g.join(', ')}`);

  const self = fileURLToPath(import.meta.url);
  // An interrupted parent must not leave eight chromiums behind. This is housekeeping, not a verdict —
  // a run cut short by a signal has no verdict — and it is here because a stray browser process on this
  // machine has already cost a session (docs/policies/local-rules.md, the crash dialog).
  const children = new Set();
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      for (const c of children) c.kill();
      process.exit(130);
    });
  }
  const results = await Promise.all(groups.map((group, i) => new Promise((resolve) => {
    const shard = i + 1;
    const started = Date.now();
    // `process.execArgv` carries this process's own --require, so the quiet-browser preload reaches every
    // shard. Without it each shard would launch chromium unquieted and a crash would put a modal dialog
    // on the desktop that outlives the gate (docs/policies/local-rules.md). Each shard's own renderer
    // line, relayed below, says `preload engaged` or `absent`, so this is visible and not assumed.
    const child = spawn(process.execPath, [...process.execArgv, self], {
      env: { ...process.env, PINNED_SHARD: String(shard), PINNED_KINDS: group.join(',') },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.add(child);
    const chunks = [];
    child.stdout.on('data', (b) => chunks.push(b));
    // stderr into the same buffer, so a shard's failure list stays next to the lines that led to it.
    child.stderr.on('data', (b) => chunks.push(b));
    let settled = false;
    const done = (r) => {
      if (settled) return;
      settled = true;
      children.delete(child);
      const seconds = Math.round((Date.now() - started) / 1000);
      console.log(`  shard ${shard} finished: ${r.problem ?? `exit ${r.code}`} in ${seconds} s`);
      resolve({ shard, group, seconds, output: Buffer.concat(chunks).toString('utf8'), ...r });
    };
    child.on('error', (err) => done({ code: null, problem: `could not be spawned or died: ${err.message}` }));
    child.on('close', (code, signal) => done({ code, problem: signal ? `was killed by ${signal}` : null }));
  })));

  const failures = [];
  let kinds = 0;
  let mounts = 0;
  let presses = 0;
  let sent = 0;
  let windows = 0;
  let settled = 0;
  let notPressed = 0;
  const frameCounts = new Set();
  for (const r of results) {
    process.stdout.write(`\n──────── shard ${r.shard} of ${results.length}: ${r.group.join(', ')} ────────\n`);
    process.stdout.write(r.output.endsWith('\n') || !r.output ? r.output : `${r.output}\n`);
    const rerun = `PINNED_SHARDS=1 PINNED_KINDS=${r.group.join(',')} npm run pinned`;
    const lines = r.output.split('\n').filter((l) => l.startsWith(TOTALS));
    let rec = null;
    if (lines.length === 1) {
      try { rec = JSON.parse(lines[0].slice(TOTALS.length)); } catch (err) { rec = { broken: err.message }; }
    }
    if (r.problem) failures.push(`shard ${r.shard} (${r.group.join(', ')}) ${r.problem}. Run it alone with: ${rerun}`);
    else if (r.code !== 0) failures.push(`shard ${r.shard} (${r.group.join(', ')}) exited ${r.code}; its output is above. Run it alone with: ${rerun}`);
    // A shard that exits 0 having printed nothing about what it did is a shard that may never have
    // worked a kind, and "did not run" must not read as "passed". This is the check that makes the
    // shard safe to add at all.
    if (!lines.length) {
      failures.push(`shard ${r.shard} (${r.group.join(', ')}) printed no ${TOTALS} record, so there is nothing to say it worked its ${r.group.length} kind(s) at all — an exit status alone cannot tell a shard that passed from one that did nothing. Run it alone with: ${rerun}`);
      continue;
    }
    if (lines.length > 1 || !rec || rec.broken) {
      failures.push(`shard ${r.shard} (${r.group.join(', ')}) printed ${lines.length} ${TOTALS} record(s)${rec?.broken ? ` and the first would not parse: ${rec.broken}` : ''}, so its counts cannot be added to the run's. Run it alone with: ${rerun}`);
      continue;
    }
    if (rec.kinds !== r.group.length) {
      failures.push(`shard ${r.shard} was given ${r.group.length} kind(s) — ${r.group.join(', ')} — and reports having worked ${rec.kinds}, so ${Math.abs(r.group.length - rec.kinds)} of them went unmeasured while the shard exited ${r.code}. Run it alone with: ${rerun}`);
    }
    kinds += rec.kinds;
    mounts += rec.mounts;
    presses += rec.presses;
    sent += rec.keys;
    windows += rec.windows;
    settled += rec.settled;
    notPressed += rec.notPressed;
    frameCounts.add(rec.frames);
  }
  // The shards between them must add up to the population this process dispatched. Derived a second
  // way — from the kind list, not from the records — so a shard silently working the wrong slice, or a
  // record that lies about its own count, is caught by the sum rather than by trusting each report.
  if (kinds !== wanted.length) {
    failures.push(`the shards report ${kinds} kind(s) between them and ${wanted.length} were dispatched, so the run did not cover its population.`);
  }
  if (frameCounts.size > 1) {
    failures.push(`the shards used different window lengths (${[...frameCounts].join(', ')} animation frames), so their counts are not the same measurement and adding them would be meaningless.`);
  }
  const wall = Math.round((Date.now() - t0) / 1000);
  console.log(`\n${results.length} shard(s) in ${wall} s. ${settled} transition(s) settled and ${notPressed} control(s) documented a key this gate does not send, both listed in the shard blocks above.`);
  console.log(`${kinds} kind(s), ${mounts} mount(s), ${presses} press(es), ${sent} key(s), ${windows} untouched window(s) of ${[...frameCounts][0] ?? FRAMES} animation frames each.`);
  if (failures.length) {
    console.error(`\nFAIL: ${failures.length} problem(s) across the shards:`);
    for (const f of failures) console.error(`  ${f}`);
    return 1;
  }
  console.log('PASS');
  return 0;
}

// process.exit() drops whatever is still queued for a stdout that is a pipe, and the parent's stdout is
// a pipe whenever a run is redirected to a log — which is how the long gates are read here. The relayed
// shard blocks are the evidence, so they are flushed before the process is ended.
async function endRun(code) {
  await new Promise((r) => process.stdout.write('', r));
  await new Promise((r) => process.stderr.write('', r));
  process.exit(code);
}

const shards = SHARD === null ? shardCount() : 1;
if (SHARD === null && shards > 1 && wanted.length > 1) {
  await endRun(await runShards(deal(wanted, Math.min(shards, wanted.length))));
}

// One round trip: read describe(), let the page run FRAMES animation frames (and at least FLOOR_MS), read
// describe() again, hand both back. Two reads taken from the same evaluate so nothing between them is this
// gate's own latency.
const window_ = (page, id) => page.evaluate(async ({ figId, frames, floorMs }) => {
  const read = () => document.getElementById(figId).describe();
  const before = read();
  const t0 = performance.now();
  let n = 0;
  await new Promise((resolve) => {
    const step = () => {
      n += 1;
      if (n >= frames && performance.now() - t0 >= floorMs) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  return { before, after: read(), frames: n, ms: Math.round(performance.now() - t0) };
}, { figId: id, frames: FRAMES, floorMs: FLOOR_MS });

const flat = (d, prefix = '') => {
  const out = {};
  for (const [k, v] of Object.entries(d || {})) {
    if (IGNORE.has(k)) continue;
    if (v === null || typeof v !== 'object') out[prefix + k] = String(v);
    else if (Array.isArray(v)) out[prefix + k] = JSON.stringify(v);
    else Object.assign(out, flat(v, `${prefix + k}.`));
  }
  return out;
};
const changes = (a, b) => {
  const x = flat(a);
  const y = flat(b);
  return Object.keys(y).filter((k) => x[k] !== y[k]).map((k) => `${k}: ${x[k]} -> ${y[k]}`);
};

// The keys sent to every focusable element a figure exposes, Space first because it is the one that starts
// a clock in nine figures and it has to meet a figure that has just mounted. Every one of these is bound by
// something in src/figures today; `+` and `-` are membrane3d's zoom.
const NAMED_KEYS = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Delete', 'Backspace', 'PageUp', 'PageDown', 'Home', 'End', '+', '-'];
// The three values a range input is driven to, in this order: away from where it opened first, then the two
// ends. Each is delivered as a key ON THE CONTROL, which is a reader's own path into it and needs no
// assignment to `value` — a gate that sets state directly is blind to the input path it skipped.
const RANGE_KEYS = ['PageUp', 'End', 'Home'];
// A letter or a digit standing alone in a control's own label is that control's documented key: "K fires a
// potassium ion", "R closes a ring", "the number keys 1 to 7". `a` and `I` are left out because they are
// English words, and a digit anywhere brings all ten, because a label names the ends of a run of them.
// Only spellings that are key names and nothing else: "control" and "command" are left out because a
// figure's label uses both as ordinary words, and `waterprops` printed a note about "one control" here.
const KEY_WORDS = /\b(shift|ctrl|cmd|alt|meta|f\d{1,2})\b/gi;
function keysFor(label) {
  const keys = [...NAMED_KEYS];
  const tokens = String(label || '').split(/[^A-Za-z0-9+]+/).filter((s) => s.length === 1);
  const letters = new Set(tokens.filter((s) => /[A-Za-z]/.test(s) && !/^[aAiI]$/.test(s)).map((s) => s.toLowerCase()));
  for (const c of letters) keys.push(c);
  if (tokens.some((s) => /[0-9]/.test(s))) for (let d = 0; d <= 9; d += 1) keys.push(String(d));
  return keys;
}

// A shard never empties this directory: its parent did that once, before any shard started, and eight
// shards each emptying it would delete one another's screenshots as they were written.
if (SHARD === null) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const moving = new Map(); // kind -> [ 'after "<control>": <fields>' ]
const settling = [];
const failures = [];
const notPressed = []; // a key word a control's own label names that this gate does not send
let windows = 0;
let presses = 0;
let sent = 0; // keys sent to a focusable or a slider
let mounts = 0;
try {
  for (const kind of wanted) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(ACTION_TIMEOUT_MS);
    const errors = collectErrors(page);
    const id = `lab-${kind}`;
    const url = `${server.url}/lab/?kind=${kind}&theme=light&eager=1&t=0`;
    const stage = page.locator(`#${id} .tb-figure__stage`);
    // The fate of the last keydown. The capture listener runs before the figure's handler and clears the
    // record, the bubble listener runs after it and writes what became of the event, so `seen: false` means
    // a handler stopped the event on its way up — which counts as handling it.
    await page.addInitScript(() => {
      window.__pinnedKey = null;
      addEventListener('keydown', () => { window.__pinnedKey = { seen: false, prevented: false }; }, true);
      addEventListener('keydown', (e) => { window.__pinnedKey = { seen: true, prevented: e.defaultPrevented }; }, false);
    });
    // A fresh mount: the figure back at the state every other pinned gate photographs it in.
    const remount = async () => {
      await openPage(page, url);
      await stage.scrollIntoViewIfNeeded();
      mounts += 1;
    };
    try {
      await remount();
    } catch (err) {
      failures.push(`${kind}: the pinned lab page would not load: ${err.message.split('\n')[0]}`);
      console.log(`FAIL ${kind}: ${err.message.split('\n')[0]}`);
      await page.close();
      continue;
    }

    // Work a control, then leave the figure alone and see whether it is still moving. Returns the fields
    // still changing in the MAX_WINDOWS'th untouched window, or [] if it settled before then or never moved.
    const stillMoving = async (what) => {
      let first = null;
      let latest = [];
      for (let i = 1; i <= MAX_WINDOWS; i += 1) {
        const w = await window_(page, id);
        windows += 1;
        latest = changes(w.before, w.after);
        if (!latest.length) {
          if (first) settling.push(`${kind} after ${what}: settled within ${i - 1} window(s) (${first.slice(0, 3).join('; ')})`);
          return [];
        }
        if (!first) first = latest;
      }
      return latest;
    };

    // Before any press. Nothing in this repository may drift at mount with the clock pinned: that is the
    // claim `npm run shot` rests on directly, and it is not quarantined for anyone.
    const atMount = await stillMoving('mounting, with nothing pressed');
    if (atMount.length) {
      const msg = `it advances with the clock pinned and NOTHING pressed: ${atMount.slice(0, 4).join('; ')}`;
      failures.push(`${kind}: ${msg}`);
      console.log(`FAIL ${kind}: ${msg}`);
      await stage.screenshot({ path: `${OUT}/${kind}-mount.png`, type: 'png' }).catch(() => {});
    }

    // describe() two animation frames after an action, with what became of the key that caused it.
    const answer = () => page.evaluate(async (fid) => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const k = window.__pinnedKey;
      return { d: document.getElementById(fid).describe(), handled: !k || !k.seen || k.prevented };
    }, id);
    const read = () => page.evaluate((fid) => document.getElementById(fid).describe(), id);

    const hits = [];
    let dirty = false; // this mount has been acted on, so the next action needs a new one
    let broken = false;
    const fresh = async () => {
      if (broken) return false;
      if (!dirty) return true;
      try {
        await remount();
      } catch (err) {
        broken = true;
        failures.push(`${kind}: the pinned lab page would not reload between actions: ${err.message.split('\n')[0]}`);
        return false;
      }
      dirty = false;
      return true;
    };
    // One action on a figure that has just mounted, then the untouched windows that judge what it left
    // behind. `act` returns false when the control was not there to work. A cheap action — a key — is
    // judged first on whether the figure answered it at all: one it neither cancelled nor answered has left
    // the mount as fresh as it found it, so it costs no window and no page load.
    const probe = async (what, act, cheap = false) => {
      if (!(await fresh())) return;
      const before = cheap ? await read() : null;
      let ok = false;
      try { ok = await act(); } catch { ok = false; }
      if (!ok) return;
      if (cheap) {
        const a = await answer();
        if (!a.handled && !changes(before, a.d).length) return;
      }
      dirty = true;
      const moved = await stillMoving(what);
      if (moved.length) {
        hits.push(`after ${what}: ${moved.slice(0, 4).join('; ')}`);
        await stage.screenshot({ path: `${OUT}/${kind}-${String(hits.length).padStart(2, '0')}.png`, type: 'png' }).catch(() => {});
      }
    };
    const nameOf = async (loc, fallback) => {
      const label = (await loc.getAttribute('aria-label').catch(() => null)) || (await loc.textContent().catch(() => null)) || fallback;
      return label.trim().replace(/\s+/g, ' ').slice(0, 44);
    };

    // The control lists, read once from the fresh mount above, so index i names the same control on every
    // remount below. A figure that shows a different set of controls after some action is not reached here;
    // tools/drive.js's recipes are what walk a figure through its states.
    const buttons = stage.locator('button:not([disabled])');
    const nButtons = await buttons.count();
    for (let i = 0; i < nButtons; i += 1) {
      if (!(await fresh())) break;
      const b = buttons.nth(i);
      if (!(await b.isVisible().catch(() => false))) continue;
      const name = await nameOf(b, `button ${i + 1}`);
      await probe(`"${name}"`, async () => {
        // noWaitAfter: a figure that IS animating makes Playwright wait for the control to hold still,
        // which is the defect's own symptom and must not be reported as a timeout.
        await b.click({ timeout: 5_000, noWaitAfter: true });
        presses += 1;
        return true;
      });
    }

    // Every slider, driven by the keyboard on the control itself.
    const ranges = stage.locator('input[type=range]:not([disabled])');
    const nRanges = await ranges.count();
    for (let i = 0; i < nRanges; i += 1) {
      for (const key of RANGE_KEYS) {
        if (!(await fresh())) break;
        const r = ranges.nth(i);
        if (!(await r.isVisible().catch(() => false))) break;
        const name = await nameOf(r, `slider ${i + 1}`);
        await probe(`${key} on the "${name}" slider`, async () => {
          await r.focus({ timeout: 5_000 });
          await page.keyboard.press(key);
          sent += 1;
          return true;
        }, true);
      }
    }

    // Every element the figure makes focusable, sent the named keys and the ones its own label documents.
    const targets = stage.locator('[tabindex]:not([tabindex^="-"]):not(button):not(input)');
    const nTargets = await targets.count();
    for (let i = 0; i < nTargets; i += 1) {
      if (!(await fresh())) break;
      const el = targets.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue;
      const label = ((await el.getAttribute('aria-label').catch(() => null)) || '').trim().replace(/\s+/g, ' ');
      const words = [...new Set((label.match(KEY_WORDS) || []).map((w) => w.toLowerCase()))];
      if (words.length) notPressed.push(`${kind}: a control's label names ${words.join(', ')}, and this gate sends no modifier and no function key`);
      const short = label.slice(0, 36) || `focusable ${i + 1}`;
      for (const key of keysFor(label)) {
        if (!(await fresh())) break;
        await probe(`${key} on "${short}"`, async () => {
          await el.focus({ timeout: 5_000 });
          await page.keyboard.press(key);
          sent += 1;
          return true;
        }, true);
      }
    }
    if (hits.length) moving.set(kind, hits);

    const known = KNOWN.has(kind);
    const verdict = hits.length ? (known ? 'known' : 'FAIL ') : (known ? 'FIXED' : 'ok   ');
    console.log(`${verdict} ${kind.padEnd(20)} ${nButtons} button(s), ${nRanges} slider(s), ${nTargets} focusable(s)${hits.length ? `, ${hits.length} left it advancing` : ''}`);
    for (const e of errors) failures.push(`${kind}: ${e}`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

// A kind that moves and is not on the outstanding list is a new break of the invariant.
for (const [kind, hits] of moving) {
  if (KNOWN.has(kind)) continue;
  failures.push(`${kind}: a control starts it with the clock pinned, which breaks "nothing advances on its own while ctx.pinnedTime is set" (AGENTS.md) and makes its frame in out/shots/ depend on what was pressed before it:\n${hits.map((x) => `      ${x}`).join('\n')}\n      Guard the figure's play/run control on ctx.pinnedTime, as bilayer, bulk-transport, homeostasis, osmometer, pasteur, permeability, polymer, pond, pump, secretion, soup, waterprops and gradient-battery do, and work it here again. The guard goes BEFORE any reduced-motion branch, because that branch's cut to a final state moves the clock too.`);
}
// And a kind on the list that has stopped moving means the list is stale. It is deleted in the commit that
// fixes the figure, so that this gate can never quietly hold an exception nobody needs any more.
for (const [kind, note] of KNOWN) {
  if (!wanted.includes(kind) || moving.has(kind)) continue;
  failures.push(`${kind}: it is listed as outstanding in tools/pinned.js and it no longer moves — delete its KNOWN entry in the commit that fixed it, so the list stays the true outstanding set. The entry says: ${note}`);
}

if (settling.length) {
  console.log(`\n${settling.length} transition(s) settled within one untouched window, which this gate reports and does not fail:`);
  for (const s of settling) console.log(`  ${s}`);
}
if (notPressed.length) {
  console.log(`\n${notPressed.length} control(s) document a key this gate does not send, which is a bound of the run and not a failure:`);
  for (const s of notPressed) console.log(`  ${s}`);
}
const outstanding = [...KNOWN.keys()].filter((k) => moving.has(k));
if (outstanding.length) {
  console.log(`\n${outstanding.length} figure(s) still break the pinned-clock invariant and are recorded in tools/pinned.js and docs/learning/defect-register.md. The entry is what was written down; under it is what THIS run measured, because the two can differ:`);
  for (const k of outstanding) {
    console.log(`  ${k}: ${KNOWN.get(k)}`);
    for (const h of moving.get(k)) console.log(`      measured: ${h}`);
  }
}
console.log(`\n${wanted.length} kind(s), ${mounts} mount(s), ${presses} press(es), ${sent} key(s), ${windows} untouched window(s) of ${FRAMES} animation frames each.`);
// A shard's counts, for its parent to add up. Printed BEFORE the failure block and on the way out of
// either path, because a shard that is about to exit 1 still has to say what it worked: a parent that
// only heard from the shards that passed could not tell a red run from a run that half happened.
if (SHARD !== null) {
  console.log(`${TOTALS}${JSON.stringify({
    shard: SHARD,
    kinds: wanted.length,
    mounts,
    presses,
    keys: sent,
    windows,
    frames: FRAMES,
    settled: settling.length,
    notPressed: notPressed.length,
    failures: failures.length,
  })}`);
}
if (failures.length) {
  console.error(`\nFAIL: ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('PASS');
