// npm run review [-- --learner <id>] [--file <path>] [--since <iso>] [--now <iso>] [--stale <n>] [--json]
//
// The instrument the agent round reads (docs/design/adaptive.md). It calls no model and writes
// nothing: it replays progress/<learner>.jsonl through the same scheduler the browser runs, and prints
// what the arithmetic can see — every objective touched with its state and history, the flagged ones
// with the evidence behind each flag, the distractor histogram for items missed more than once, and
// the items the reader has now seen often enough to recognise rather than recall.
//
// Claim: the cards printed here are exactly the cards the reader's browser holds, because both come
// from src/learning/scheduler.js applied to the same events in the same order. The thresholds behind
// every flag are src/learning/store.js's THRESHOLDS, read from that file rather than restated here.
//
// Bound: one learner's log, and only what was recorded. Card state is always the state after the whole
// log; the window (--since) trims the counts, the latencies and the last-three-outcomes column, not the
// replay, because a card cannot be replayed from the middle. It cannot see why an answer was wrong,
// whether an item is a fair question, or anything the reader did that produced no event. Naming the
// misconception is the round's job, not this tool's.
//
// Exit status: 0 whenever it could do its work, including when there is no log yet. Non-zero only for a
// bad flag, an unreadable file, or a date it cannot parse.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore, THRESHOLDS, FLAGS } from '../src/learning/store.js';
import { register, reset as resetObjectives, validate, allObjectives, has as objectiveKnown } from '../src/learning/objectives.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ROUNDS = join(ROOT, 'docs', 'study', 'rounds');
const LEARNER_PATTERN = /^[a-z0-9_-]{1,32}$/;

const USAGE = `usage: node tools/review.js [--learner <id>] [--file <path>] [--since <iso>] [--now <iso>] [--stale <n>] [--json]
  --learner  which record to read, default "default"; must match ${LEARNER_PATTERN}
  --file     read this file instead of progress/<learner>.jsonl
  --since    the window's start; default is the newest round in docs/study/rounds/, else all time
  --now      the moment to judge retrievability and due dates against; default is the clock
  --stale    how many views of one item counts as stale; default ${THRESHOLDS.staleItemViews}
  --json     machine-readable output instead of the tables`;

function die(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { learner: 'default', file: null, since: null, now: null, stale: THRESHOLDS.staleItemViews, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) die(`${arg} needs a value.\n${USAGE}`);
      i += 1;
      return v;
    };
    if (arg === '--json') out.json = true;
    else if (arg === '--help' || arg === '-h') { console.log(USAGE); process.exit(0); }
    else if (arg === '--learner') out.learner = value();
    else if (arg === '--file') out.file = value();
    else if (arg === '--since') out.since = value();
    else if (arg === '--now') out.now = value();
    else if (arg === '--stale') out.stale = Number(value());
    else die(`unknown option ${arg}.\n${USAGE}`);
  }
  if (!LEARNER_PATTERN.test(out.learner)) die(`--learner must match ${LEARNER_PATTERN} (lower-case letters, digits, "_" and "-", 1 to 32 characters), because it names a file; got "${out.learner}"`);
  if (!Number.isInteger(out.stale) || out.stale < 1) die(`--stale must be a whole number of views of 1 or more; got "${out.stale}"`);
  for (const field of ['since', 'now']) {
    if (out[field] !== null && !Number.isFinite(Date.parse(out[field]))) {
      die(`--${field} must be a date this can parse, for example 2026-09-01 or 2026-09-01T09:00:00Z; got "${out[field]}"`);
    }
  }
  return out;
}

/** The newest dated note in docs/study/rounds/, which is where the last round ended. */
function lastRound() {
  if (!existsSync(ROUNDS)) return null;
  const dated = readdirSync(ROUNDS)
    .filter((f) => /^\d{4}-\d{2}-\d{2}/.test(f))
    .sort();
  if (!dated.length) return null;
  const name = dated[dated.length - 1];
  return { name, at: new Date(`${name.slice(0, 10)}T00:00:00.000Z`).toISOString() };
}

/** Register every chapter's objectives, so prerequisites and the blocked flag mean something. */
function loadObjectives() {
  const chapters = [];
  for (const book of readdirSync(ROOT, { withFileTypes: true })) {
    if (!book.isDirectory() || book.name.startsWith('.') || ['node_modules', 'out', 'docs', 'tools', 'test', 'src', 'progress'].includes(book.name)) continue;
    for (const chapter of readdirSync(join(ROOT, book.name), { withFileTypes: true })) {
      if (!chapter.isDirectory()) continue;
      const file = join(ROOT, book.name, chapter.name, 'objectives.js');
      if (existsSync(file)) chapters.push({ id: `${book.name}/${chapter.name}`, file });
    }
  }
  return chapters;
}

function readLog(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    die(`could not read ${file}: ${err.message}`);
  }
  const events = [];
  const bad = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    try {
      const parsed = JSON.parse(line);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not a JSON object');
      events.push(parsed);
    } catch (err) {
      bad.push(`line ${i + 1}: ${err.message}`);
    }
  });
  return { events, bad };
}

// ---------------------------------------------------------------------------
// formatting

function table(headers, rows) {
  if (!rows.length) return '  (none)';
  const all = [headers, ...rows].map((r) => r.map((c) => (c === null || c === undefined ? '' : String(c))));
  const widths = headers.map((_, i) => Math.max(...all.map((r) => r[i].length)));
  const numeric = headers.map((_, i) => rows.every((r) => r[i] === null || r[i] === undefined || r[i] === '' || /^-?[\d.]+ ?\w*$/.test(String(r[i]))));
  const line = (cells) => `  ${cells.map((c, i) => (numeric[i] ? c.padStart(widths[i]) : c.padEnd(widths[i]))).join('  ')}`.trimEnd();
  return [line(all[0]), `  ${widths.map((w) => '-'.repeat(w)).join('  ')}`, ...all.slice(1).map(line)].join('\n');
}

const days = (n) => (n === null || n === undefined ? '' : `${n.toFixed(n < 10 ? 2 : 1)} d`);
const pct = (n) => `${Math.round(n * 100)}%`;
const secs = (ms) => (ms === null || ms === undefined ? '' : `${(ms / 1000).toFixed(1)} s`);
const when = (iso, nowMs) => {
  if (!iso) return '';
  const delta = (Date.parse(iso) - nowMs) / 86400000;
  if (Math.abs(delta) < 1 / 24) return 'now';
  return delta < 0 ? `${(-delta).toFixed(1)} d ago` : `in ${delta.toFixed(1)} d`;
};

// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const file = args.file ? resolve(args.file) : join(ROOT, 'progress', `${args.learner}.jsonl`);
const round = lastRound();
const since = args.since ?? round?.at ?? null;
const nowIso = args.now ?? new Date().toISOString();
const nowMs = Date.parse(nowIso);

if (!existsSync(file)) {
  const out = { learner: args.learner, file, since, now: nowIso, events: 0, note: 'no progress recorded yet' };
  if (args.json) console.log(JSON.stringify(out, null, 2));
  else {
    console.log(`no progress recorded yet: ${file.startsWith(ROOT + sep) ? file.slice(ROOT.length + 1) : file} does not exist.`);
    console.log('Read a chapter and answer something, or bring a record over with `npm run progress:import -- <file>`.');
  }
  process.exit(0);
}

const { events: raw, bad } = readLog(file);

resetObjectives();
const chapters = loadObjectives();
for (const chapter of chapters) {
  const mod = await import(`file://${chapter.file.split(sep).join('/')}`);
  const list = mod.OBJECTIVES ?? mod.default;
  if (!Array.isArray(list)) {
    die(`${chapter.file} must export OBJECTIVES as an array; a chapter's objectives.js is read by both the page and this tool`);
  }
  register(chapter.id, list);
}
const graphProblems = validate();

// Replay the whole log: a card cannot be replayed from the middle of its history.
const store = createStore({ storage: null, fetch: null, clock: () => nowMs });
const dropped = [];
for (const [i, event] of raw.entries()) {
  try {
    store.record(event);
  } catch (err) {
    dropped.push(`event ${i + 1}: ${err.message}`);
  }
}

const all = store.events();
const window = store.events(since ? { since } : {});
const sessions = new Set(window.map((e) => e.session ?? '(none)'));
const touched = [...new Set(window.map((e) => e.objective))].sort();
const minutes = window.reduce((sum, e) => sum + (Number.isFinite(e.ms) ? e.ms : 0), 0) / 60000;

const rows = touched.map((id) => {
  const m = store.mastery(id, nowMs);
  const inWindow = window.filter((e) => e.objective === id);
  const lat = inWindow.filter((e) => Number.isFinite(e.ms)).map((e) => e.ms).sort((a, b) => a - b);
  const medianMs = lat.length ? (lat.length % 2 ? lat[lat.length >> 1] : Math.round((lat[(lat.length >> 1) - 1] + lat[lat.length >> 1]) / 2)) : null;
  return {
    objective: id,
    known: objectiveKnown(id),
    state: m.state,
    stability: m.stability,
    retrievability: m.retrievability,
    due: m.due,
    reps: m.reps,
    lapses: m.lapses,
    medianMs,
    lastThree: inWindow.slice(-3).map((e) => e.outcome),
    formats: m.formats,
    flags: m.flags,
    flagReasons: m.flagReasons,
    evidence: m.evidence,
    learnedWell: m.learnedWell,
    struggling: m.struggling,
  };
});

// Distractors: every item answered wrongly more than once, and what was chosen instead.
const perItem = new Map();
for (const e of all) {
  if (!e.item) continue;
  const it = perItem.get(e.item) ?? { item: e.item, objective: e.objective, views: 0, wrong: 0, choices: new Map() };
  it.views += 1;
  if (e.outcome === 'wrong') it.wrong += 1;
  const key = e.chose ?? '(not recorded)';
  const c = it.choices.get(key) ?? { chose: key, n: 0, right: 0, wrong: 0, partial: 0 };
  c.n += 1;
  c[e.outcome] = (c[e.outcome] ?? 0) + 1;
  it.choices.set(key, c);
  perItem.set(e.item, it);
}
const distractors = [...perItem.values()]
  .filter((it) => it.wrong > 1)
  .sort((a, b) => b.wrong - a.wrong)
  .map((it) => ({ ...it, choices: [...it.choices.values()].sort((a, b) => b.n - a.n) }));
const stale = [...perItem.values()].filter((it) => it.views > args.stale).sort((a, b) => b.views - a.views);

const byFlag = {};
for (const flag of FLAGS) {
  const hits = rows.filter((r) => r.flags.includes(flag));
  if (hits.length) byFlag[flag] = hits.map((r) => ({ objective: r.objective, evidence: r.flagReasons[flag] }));
}

if (args.json) {
  console.log(JSON.stringify({
    learner: args.learner,
    file,
    since,
    lastRound: round?.name ?? null,
    now: nowIso,
    thresholds: THRESHOLDS,
    counts: { events: window.length, eventsAllTime: all.length, sessions: sessions.size, minutes: Number(minutes.toFixed(1)), objectives: touched.length },
    unusable: { unparsableLines: bad, rejectedEvents: dropped },
    graphProblems,
    objectives: rows,
    flags: byFlag,
    distractors: distractors.map((d) => ({ item: d.item, objective: d.objective, views: d.views, wrong: d.wrong, choices: d.choices })),
    stale: stale.map((s) => ({ item: s.item, objective: s.objective, views: s.views })),
    summary: store.summary(nowMs),
  }, null, 2));
  process.exit(0);
}

const rel = file.startsWith(ROOT + sep) ? file.slice(ROOT.length + 1) : file;
console.log(`study review — learner "${args.learner}", ${rel}`);
console.log(`window: ${since ? `since ${since}${round && since === round.at ? ` (the last round, ${round.name})` : ''}` : 'all time (no round has been run yet)'}; judged at ${nowIso}`);
if (!chapters.length) console.log('note: no chapter objectives.js was found, so prerequisites and the "blocked" flag are not evaluated.');
if (graphProblems.length) {
  console.log(`\nthe objective graph has ${graphProblems.length} problem(s):`);
  for (const p of graphProblems) console.log(`  ${p}`);
}
if (bad.length) console.log(`\nskipped ${bad.length} unparsable line(s): ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ' ...' : ''}`);
if (dropped.length) console.log(`\nskipped ${dropped.length} event(s) the store refused: ${dropped.slice(0, 3).join('; ')}${dropped.length > 3 ? ' ...' : ''}`);

console.log('\ncounts');
console.log(`  ${window.length} events (${all.length} all time), ${sessions.size} sessions, ${minutes.toFixed(1)} minutes answering, ${touched.length} objectives touched`);

console.log('\nobjectives touched in this window');
console.log(table(
  ['objective', 'state', 'stability', 'recall', 'due', 'reps', 'lapses', 'median', 'last three'],
  rows.map((r) => [
    r.objective + (r.known ? '' : ' (unregistered)'),
    r.state,
    days(r.stability),
    pct(r.retrievability),
    when(r.due, nowMs),
    r.reps,
    r.lapses,
    secs(r.medianMs),
    r.lastThree.join(' ') || '',
  ]),
));

const flagged = Object.keys(byFlag);
console.log(`\nflags (${flagged.length ? flagged.join(', ') : 'none'})`);
for (const flag of flagged) {
  console.log(`  ${flag}`);
  for (const hit of byFlag[flag]) console.log(`    ${hit.objective}: ${hit.evidence}`);
}

console.log('\nitems answered wrongly more than once');
if (!distractors.length) console.log('  (none)');
for (const d of distractors) {
  console.log(`  ${d.item} (${d.objective}) — ${d.wrong} wrong of ${d.views} answers`);
  console.log(table(
    ['chose', 'times', 'right', 'wrong', 'partial'],
    d.choices.map((c) => [c.chose, c.n, c.right ?? 0, c.wrong ?? 0, c.partial ?? 0]),
  ).split('\n').map((l) => `  ${l}`).join('\n'));
}

console.log(`\nitems going stale (seen more than ${args.stale} times)`);
console.log(table(['item', 'objective', 'views'], stale.map((s) => [s.item, s.objective, s.views])));

const summary = store.summary(nowMs);
console.log('\nwhere the reader stands');
for (const [label, ids] of Object.entries(summary)) {
  console.log(`  ${label.padEnd(12)} ${ids.length ? ids.join(', ') : '(none)'}`);
}
const untouched = allObjectives().filter((o) => !store.card(o.id).reps).length;
console.log(`\n${allObjectives().length} objectives registered across ${chapters.length} chapter(s); ${untouched} never answered.`);
