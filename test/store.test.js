// The reader's record: cards are a pure function of the events, the queue never offers something whose
// prerequisites are not in place, each of the six flags fires on a history built to trigger it and
// stays quiet on one built not to, and none of localStorage's three failures (absent, full, corrupt)
// reaches the reader.
//
// Bound: the histories written below, a four-objective graph registered in this file, and injected
// clock, storage and fetch. It exercises the store's own arithmetic, never a browser: no page, no real
// localStorage, no real network. Whether the UI records the right events is tools/flow.js's question,
// and whether the thresholds suit a human reader is the agent round's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, THRESHOLDS, FLAGS } from '../src/learning/store.js';
import { register, reset as resetObjectives, validate, prereqsOf, objective, allObjectives, has } from '../src/learning/objectives.js';
import { nextIntervalDays } from '../src/learning/scheduler.js';
import { progressEventProblems } from '../tools/serve.js';

const DAY_MS = 86400000;
const T0 = Date.parse('2026-01-01T09:00:00.000Z');
const at = (days) => new Date(T0 + days * DAY_MS).toISOString();

const OBJECTIVES = [
  { id: 'homeostasis', statement: 'Say what a steady internal state is.', prereqs: [], level: 'recall' },
  { id: 'set-point', statement: 'Say what value a loop defends.', prereqs: ['homeostasis'], level: 'explain' },
  { id: 'feedback-direction', statement: 'Predict which effector fires.', prereqs: ['homeostasis', 'set-point'], level: 'apply' },
  { id: 'fever', statement: 'Explain a fever as a moved set point.', prereqs: ['set-point'], level: 'explain' },
];

function fresh(options = {}) {
  resetObjectives();
  register('test/ch01', OBJECTIVES);
  return createStore({ storage: null, fetch: null, clock: () => T0, session: 's1', ...options });
}

/** Answer `id` right, on time, `reps` times, alternating formats unless one is named. */
function learn(store, id, { reps = 5, kinds = ['mcq', 'figure'], ms = 3000, from = 0, session = 's1' } = {}) {
  let day = from;
  for (let i = 0; i < reps; i += 1) {
    store.record({ t: at(day), objective: id, item: `q-${id}-${i % 4}`, kind: kinds[i % kinds.length], outcome: 'right', ms, session });
    day += nextIntervalDays(store.card(id));
  }
  return day;
}

const flagsOf = (store, id, day = 0) => store.mastery(id, at(day)).flags;

// --------------------------------------------------------------------------

test('the objective graph registered here is sound', () => {
  resetObjectives();
  register('test/ch01', OBJECTIVES);
  assert.deepEqual(validate(), []);
  assert.deepEqual(prereqsOf('feedback-direction'), ['homeostasis', 'set-point'], 'transitively, and a prereq before whatever needs it');
  assert.deepEqual(prereqsOf('homeostasis'), []);
  assert.equal(allObjectives().length, OBJECTIVES.length);
  assert.equal(objective('fever').chapter, 'test/ch01');
  assert.equal(has('nothing-like-this'), false);
  assert.throws(() => objective('nothing-like-this'), /unknown objective "nothing-like-this": the registered ids are homeostasis, set-point/);
});

test('validate reports an unknown prereq, a cycle and a duplicate id, all at once', () => {
  resetObjectives();
  register('test/a', [
    { id: 'a', statement: 'A.', prereqs: ['ghost'], level: 'recall' },
    { id: 'b', statement: 'B.', prereqs: ['c'], level: 'recall' },
    { id: 'c', statement: 'C.', prereqs: ['b'], level: 'recall' },
    { id: 'd', statement: 'D.', prereqs: [], level: 'recall' },
    { id: 'e', statement: '', prereqs: [], level: 'guessing' },
  ]);
  register('test/b', [{ id: 'd', statement: 'D again.', prereqs: [], level: 'recall' }]);
  const problems = validate();
  assert.ok(problems.some((p) => /objective "a" \(test\/a\) needs prereq "ghost", which no chapter registers/.test(p)), problems.join('\n'));
  assert.ok(problems.some((p) => /prerequisite cycle: (b -> c -> b|c -> b -> c)/.test(p)), problems.join('\n'));
  assert.ok(problems.some((p) => /duplicate objective id "d": chapter test\/b redefines one already registered by test\/a/.test(p)), problems.join('\n'));
  assert.ok(problems.some((p) => /"e" .* has no statement/.test(p)), problems.join('\n'));
  assert.ok(problems.some((p) => /has level "guessing"; it must be one of recall, explain, apply/.test(p)), problems.join('\n'));
  // A cycle must not hang prereqsOf, and re-registering a chapter must not leave two copies behind.
  assert.deepEqual(prereqsOf('b'), ['c']);
  register('test/b', [{ id: 'f', statement: 'F.', prereqs: [], level: 'recall' }]);
  assert.equal(has('a'), true, 'test/a still owns "a"');
  assert.ok(!validate().some((p) => /duplicate/.test(p)), 'the duplicate went with the chapter that caused it');
  assert.throws(() => register('test/c', 'not an array'), /needs an array of objective records/);
  assert.throws(() => register('test/c', [{ statement: 'no id' }]), /objective at index 0 needs an id/);
});

test('a replayed log reproduces the same cards', () => {
  const live = fresh();
  const day = learn(live, 'homeostasis', { reps: 4 });
  live.record({ t: at(day), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'wrong', ms: 30000 });
  live.record({ t: at(day + 0.01), objective: 'set-point', item: 'q-2', kind: 'free', outcome: 'partial', ms: 12000 });

  const replay = fresh();
  for (const e of live.events()) replay.record(e);
  assert.deepEqual(replay.cards(), live.cards());
  assert.deepEqual(replay.events(), live.events());

  // And the order events arrive in must not matter: the log is kept sorted by t.
  const shuffled = fresh();
  const backwards = [...live.events()].reverse();
  for (const e of backwards) shuffled.record(e);
  assert.deepEqual(shuffled.cards(), live.cards(), 'events recorded out of order gave different cards');
  assert.deepEqual(shuffled.events().map((e) => e.t), live.events().map((e) => e.t));
});

test('events({ since }) returns the window, oldest first', () => {
  const store = fresh();
  learn(store, 'homeostasis', { reps: 4 });
  const all = store.events();
  const sorted = [...all].sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
  assert.deepEqual(all, sorted);
  const since = all[2].t;
  assert.deepEqual(store.events({ since }).map((e) => e.t), all.slice(2).map((e) => e.t));
});

// --------------------------------------------------------------------------
// the queue

test('queue offers only objectives whose prerequisites are in place, in prerequisite order', () => {
  const store = fresh();
  const first = store.queue({ now: at(0) });
  assert.deepEqual(first.map((p) => p.objective), ['homeostasis'], 'with nothing learned, only the root objective is open');
  assert.equal(first[0].reason, 'new');
  assert.ok(first[0].why.length > 0, 'every pick carries a sentence the UI can print');

  const day = learn(store, 'homeostasis', { reps: 5 });
  const second = store.queue({ now: at(day) }).map((p) => p.objective);
  assert.ok(second.includes('set-point'), 'once its prereq is learned, set-point opens');
  assert.ok(!second.includes('feedback-direction'), 'feedback-direction still needs set-point');
  assert.ok(!second.includes('fever'), 'fever still needs set-point');

  const day2 = learn(store, 'set-point', { reps: 5, from: day });
  const third = store.queue({ now: at(day2) }).map((p) => p.objective);
  assert.ok(third.includes('feedback-direction') && third.includes('fever'), `both open now: ${third.join(', ')}`);
});

test('queue never returns a blocked objective, even when its own card is due', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 5 });
  const day2 = learn(store, 'set-point', { reps: 5, from: day });
  // feedback-direction is half learned: one wrong answer, so its card is in learning and due in minutes.
  store.record({ t: at(day2), objective: 'feedback-direction', item: 'q-fd', kind: 'mcq', outcome: 'wrong', ms: 18000 });

  // Now the prerequisite lapses. The dependent is due but must not be practised before it.
  store.record({ t: at(day2 + 0.02), objective: 'set-point', item: 'q-sp', kind: 'mcq', outcome: 'wrong', ms: 25000 });
  const now = day2 + 0.04;
  assert.equal(store.card('feedback-direction').state, 'learning');
  assert.equal(store.mastery('feedback-direction', at(now)).blockedBy.join(), 'set-point');
  assert.ok(store.mastery('feedback-direction', at(now)).flags.includes('blocked'));
  const picks = store.queue({ now: at(now) });
  assert.ok(!picks.some((p) => p.objective === 'feedback-direction'), `blocked objective offered: ${JSON.stringify(picks)}`);
  assert.ok(!store.due(at(now)).includes('feedback-direction'), 'due() must exclude blocked objectives too');
  assert.ok(picks.some((p) => p.objective === 'set-point' && p.reason === 'relearn'), `the prerequisite is what to work on: ${JSON.stringify(picks)}`);

  // Relearning the prerequisite in this same sitting unblocks it again.
  store.record({ t: at(now), objective: 'set-point', item: 'q-sp2', kind: 'figure', outcome: 'right', ms: 4000 });
  const after = store.queue({ now: at(now + 0.01) });
  assert.ok(after.some((p) => p.objective === 'feedback-direction'), `it should be open again: ${JSON.stringify(after)}`);
});

test('an objective the reader has already learned is never blocked by a stale prerequisite', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 5 });
  const day2 = learn(store, 'set-point', { reps: 5, from: day });
  const day3 = learn(store, 'feedback-direction', { reps: 4, from: day2 });
  const now = day3 + 400; // a year away; every card is stale, prerequisites included
  assert.equal(store.card('feedback-direction').state, 'review');
  assert.deepEqual(store.mastery('feedback-direction', at(now)).blockedBy, [], 'a card in review stands on its own evidence');
  assert.ok(store.due(at(now)).includes('feedback-direction'), 'or it would be starved of review for good');
});

test('queue puts the most overdue review first, then relearning, then at most a few new objectives', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 5 });
  const day2 = learn(store, 'set-point', { reps: 5, from: day });
  const now = day2 + 400; // both are long overdue by now
  const picks = store.queue({ now: at(now) });
  const reviews = picks.filter((p) => p.reason === 'overdue').map((p) => p.objective);
  assert.equal(reviews.length, 2);
  const overdue = reviews.map((id) => Date.parse(at(now)) - Date.parse(store.card(id).due));
  assert.ok(overdue[0] >= overdue[1], `the most overdue must come first: ${JSON.stringify(reviews)}`);
  assert.ok(picks.every((p) => p.reason === 'overdue'), `after a year away both prerequisites are stale, so nothing new opens: ${JSON.stringify(picks)}`);
  assert.ok(picks.length <= THRESHOLDS.queueSize);
  assert.equal(store.queue({ size: 1, now: at(now) }).length, 1, 'size caps the sitting');

  // On time, with the prerequisite fresh, a new objective joins the sitting — after what is due.
  // A separate store, because this one's log already holds answers dated after `day`.
  const early = fresh();
  learn(early, 'homeostasis', { reps: 5 });
  const onTime = early.queue({ now: early.card('homeostasis').due });
  assert.equal(onTime[0].objective, 'homeostasis');
  assert.equal(onTime[0].reason, 'overdue');
  assert.ok(onTime.findIndex((p) => p.reason === 'new') > 0, `new objectives come after what is due: ${JSON.stringify(onTime)}`);
  assert.ok(onTime.filter((p) => p.reason === 'new').length <= THRESHOLDS.newPerSitting);
});

test('a sitting takes at most a few new objectives, however many are open', () => {
  // The standard graph has only one root, so its queue could never exceed the cap and an assertion
  // there would pass whether the cap worked or not. This one has eight objectives with no
  // prerequisites at all: every one of them is open on the first morning, which is the two-hundred-item
  // first sitting the design says kills this kind of system.
  resetObjectives();
  register('test/wide', Array.from({ length: 8 }, (_, i) => ({ id: `wide-${i}`, statement: `Claim ${i}.`, prereqs: [], level: 'recall' })));
  const store = createStore({ storage: null, fetch: null, clock: () => T0, session: 's1' });
  const picks = store.queue({ now: at(0) });
  assert.equal(picks.length, THRESHOLDS.newPerSitting, `eight are open; the sitting must take ${THRESHOLDS.newPerSitting}, not ${picks.length}`);
  assert.ok(picks.every((p) => p.reason === 'new'));
  assert.deepEqual(picks.map((p) => p.objective), ['wide-0', 'wide-1', 'wide-2'], 'and in the order the chapter teaches them');
  assert.equal(store.summary(at(0)).new.length, 8, 'the other five are still listed as new, just not queued');
});

// --------------------------------------------------------------------------
// learned well

test('learnedWell needs two formats: a perfect record in one format is not enough', () => {
  const oneFormat = fresh();
  const day = learn(oneFormat, 'homeostasis', { reps: 6, kinds: ['mcq'] });
  const m = oneFormat.mastery('homeostasis', at(day));
  assert.ok(m.stability >= THRESHOLDS.learnedStability, `the card is strong (${m.stability} d) ...`);
  assert.ok(m.retrievability >= THRESHOLDS.learnedRetrievability, '... and freshly answered ...');
  assert.equal(m.formats.length, 1);
  assert.equal(m.learnedWell, false, '... but one format is the question learned, not the idea');
  assert.ok(!oneFormat.summary(at(day)).learnedWell.includes('homeostasis'));

  const twoFormats = fresh();
  const day2 = learn(twoFormats, 'homeostasis', { reps: 6, kinds: ['mcq', 'figure'] });
  const m2 = twoFormats.mastery('homeostasis', at(day2));
  assert.equal(m2.learnedWell, true, `two formats and a strong card should be learned well: ${JSON.stringify(m2.flags)}`);
  assert.ok(twoFormats.summary(at(day2)).learnedWell.includes('homeostasis'));

  // A success in only one of the two formats does not count either.
  const oneSuccess = fresh();
  let d = learn(oneSuccess, 'homeostasis', { reps: 6, kinds: ['mcq'] });
  oneSuccess.record({ t: at(d), objective: 'homeostasis', item: 'q-fig', kind: 'figure', outcome: 'wrong', ms: 9000 });
  assert.equal(oneSuccess.mastery('homeostasis', at(d)).learnedWell, false);
});

test('a learned card stops being learnedWell once it goes stale', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 6 });
  assert.equal(store.mastery('homeostasis', at(day)).learnedWell, true);
  assert.equal(store.mastery('homeostasis', at(day + 3650)).learnedWell, false, 'ten years later it is not still learned well');
});

// --------------------------------------------------------------------------
// the flags, one test each: it fires on a history built to trigger it, and not on one built not to

test('flag lapsing: two or more lapses', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 4 });
  store.record({ t: at(day), objective: 'homeostasis', item: 'q-a', kind: 'mcq', outcome: 'wrong', ms: 20000 });
  assert.ok(!flagsOf(store, 'homeostasis', day).includes('lapsing'), 'one lapse is not yet lapsing');
  store.record({ t: at(day + 0.02), objective: 'homeostasis', item: 'q-a', kind: 'mcq', outcome: 'wrong', ms: 20000 });
  const m = store.mastery('homeostasis', at(day + 0.02));
  assert.ok(m.flags.includes('lapsing'), JSON.stringify(m.flags));
  assert.match(m.flagReasons.lapsing, /2 lapses/);
  assert.equal(m.struggling, true);
  assert.ok(store.summary(at(day + 0.02)).struggling.includes('homeostasis'));
});

test('flag fragile: right but slow twice running, or stability that has not moved over four reps', () => {
  const slow = fresh();
  let day = learn(slow, 'homeostasis', { reps: 4 });
  assert.ok(!flagsOf(slow, 'homeostasis', day).includes('fragile'), 'four fast successes are not fragile');
  for (let i = 0; i < 2; i += 1) {
    slow.record({ t: at(day), objective: 'homeostasis', item: `q-s${i}`, kind: 'mcq', outcome: 'right', ms: THRESHOLDS.slowMs + 2000 });
    day += nextIntervalDays(slow.card('homeostasis'));
  }
  const m = slow.mastery('homeostasis', at(day));
  assert.ok(m.flags.includes('fragile'), JSON.stringify(m.flagReasons));
  assert.match(m.flagReasons.fragile, /right but slow 2x running/);

  const stalled = fresh();
  let d = 0;
  for (const outcome of ['right', 'wrong', 'right', 'wrong', 'right', 'wrong', 'right']) {
    stalled.record({ t: at(d), objective: 'homeostasis', item: 'q-x', kind: 'mcq', outcome, ms: 5000 });
    d += Math.max(0.02, nextIntervalDays(stalled.card('homeostasis')));
  }
  const s = stalled.mastery('homeostasis', at(d));
  assert.ok(s.flags.includes('fragile'), JSON.stringify(s.flagReasons));
  assert.match(s.flagReasons.fragile, /stability has not moved/);

  const moving = fresh();
  const md = learn(moving, 'homeostasis', { reps: 6 });
  assert.ok(!flagsOf(moving, 'homeostasis', md).includes('fragile'), 'a card whose interval keeps growing is not fragile');
});

test('flag guessing: at or below chance across one session', () => {
  const store = fresh();
  for (let i = 0; i < 4; i += 1) {
    store.record({ t: at(i * 0.01), objective: 'homeostasis', item: `q-${i}`, kind: 'mcq', outcome: i === 0 ? 'right' : 'wrong', ms: 2500, options: 4, session: 'sitting-1' });
  }
  const m = store.mastery('homeostasis', at(1));
  assert.ok(m.flags.includes('guessing'), JSON.stringify(m.flagReasons));
  assert.match(m.flagReasons.guessing, /1 right out of 4, at or below the 25%/);

  const better = fresh();
  for (let i = 0; i < 4; i += 1) {
    better.record({ t: at(i * 0.01), objective: 'homeostasis', item: `q-${i}`, kind: 'mcq', outcome: i === 3 ? 'wrong' : 'right', ms: 2500, options: 4, session: 'sitting-1' });
  }
  assert.ok(!flagsOf(better, 'homeostasis', 1).includes('guessing'), '3 right out of 4 is well above chance');

  const thin = fresh();
  for (let i = 0; i < 2; i += 1) {
    thin.record({ t: at(i * 0.01), objective: 'homeostasis', item: `q-${i}`, kind: 'mcq', outcome: 'wrong', ms: 2500, options: 4, session: 'sitting-1' });
  }
  assert.ok(!flagsOf(thin, 'homeostasis', 1).includes('guessing'), `two answers cannot tell guessing from bad luck (threshold ${THRESHOLDS.guessingMinAnswers})`);
});

test('flag blocked: a prerequisite that is not yet in place', () => {
  const store = fresh();
  assert.ok(flagsOf(store, 'set-point').includes('blocked'), 'nothing is learned, so set-point is blocked');
  assert.deepEqual(store.mastery('set-point', at(0)).blockedBy, ['homeostasis']);
  assert.ok(store.summary(at(0)).blocked.includes('set-point'));

  const day = learn(store, 'homeostasis', { reps: 5 });
  assert.ok(!flagsOf(store, 'set-point', day).includes('blocked'), 'with its prereq learned it is open');
  assert.ok(!flagsOf(store, 'homeostasis', day).includes('blocked'), 'an objective with no prereqs is never blocked');
  assert.ok(store.summary(at(day)).new.includes('set-point'));
});

test('flag stale-item: one item seen more often than recognition allows', () => {
  const store = fresh();
  const many = fresh();
  for (let i = 0; i < THRESHOLDS.staleItemViews; i += 1) {
    store.record({ t: at(i), objective: 'homeostasis', item: 'q-same', kind: 'mcq', outcome: 'right', ms: 3000 });
  }
  assert.ok(!flagsOf(store, 'homeostasis', 10).includes('stale-item'), `exactly ${THRESHOLDS.staleItemViews} views is the boundary, not past it`);
  for (let i = 0; i <= THRESHOLDS.staleItemViews; i += 1) {
    many.record({ t: at(i), objective: 'homeostasis', item: 'q-same', kind: 'mcq', outcome: 'right', ms: 3000 });
  }
  const m = many.mastery('homeostasis', at(10));
  assert.ok(m.flags.includes('stale-item'), JSON.stringify(m.flagReasons));
  assert.match(m.flagReasons['stale-item'], /q-same seen 6x/);

  const spread = fresh();
  for (let i = 0; i < 8; i += 1) {
    spread.record({ t: at(i), objective: 'homeostasis', item: `q-${i}`, kind: 'mcq', outcome: 'right', ms: 3000 });
  }
  assert.ok(!flagsOf(spread, 'homeostasis', 10).includes('stale-item'), 'eight different items are not one stale item');
});

test('flag thin-evidence: too few answers for the card to mean anything', () => {
  const store = fresh();
  store.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  const one = store.mastery('homeostasis', at(0));
  assert.ok(one.flags.includes('thin-evidence'), JSON.stringify(one.flags));
  assert.match(one.flagReasons['thin-evidence'], /1 answer recorded/);
  store.record({ t: at(0.02), objective: 'homeostasis', item: 'q-2', kind: 'mcq', outcome: 'right', ms: 3000 });
  store.record({ t: at(0.04), objective: 'homeostasis', item: 'q-3', kind: 'figure', outcome: 'right', ms: 3000 });
  assert.ok(!flagsOf(store, 'homeostasis', 0.04).includes('thin-evidence'), `${THRESHOLDS.thinEvidence} answers clears it`);
});

test('a healthy objective carries no flags at all, and every flag name is one of the six', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 6 });
  assert.deepEqual(store.mastery('homeostasis', at(day)).flags, []);
  const seen = new Set();
  for (const id of Object.keys(store.cards())) for (const f of store.mastery(id, at(day)).flags) seen.add(f);
  for (const f of seen) assert.ok(FLAGS.includes(f), `flag "${f}" is not one of ${FLAGS.join(', ')}`);
});

test('summary puts every objective in exactly one list', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 6 });
  store.record({ t: at(day), objective: 'set-point', item: 'q-sp', kind: 'mcq', outcome: 'wrong', ms: 30000 });
  const s = store.summary(at(day));
  const all = [...s.learnedWell, ...s.struggling, ...s.blocked, ...s.new, ...s.inProgress];
  assert.equal(new Set(all).size, all.length, `an objective appeared in two lists: ${JSON.stringify(s)}`);
  assert.deepEqual([...all].sort(), OBJECTIVES.map((o) => o.id).sort(), 'every registered objective is accounted for');
});

// --------------------------------------------------------------------------
// persistence

test('exportJSON and importJSON round-trip', () => {
  const a = fresh();
  const day = learn(a, 'homeostasis', { reps: 4 });
  a.record({ t: at(day), objective: 'set-point', item: 'q-sp', kind: 'free', outcome: 'partial', ms: 15000 });
  const json = a.exportJSON();
  assert.equal(typeof json, 'string');

  const b = fresh();
  const n = b.importJSON(json);
  assert.equal(n, a.events().length);
  assert.deepEqual(b.events(), a.events());
  assert.deepEqual(b.cards(), a.cards());

  // Importing the same file twice with merge does not double the record.
  b.importJSON(json, { merge: true });
  assert.deepEqual(b.events(), a.events(), 'a re-import added duplicate events');
  // Without merge it replaces.
  const c = fresh();
  c.record({ t: at(99), objective: 'homeostasis', item: 'q-z', kind: 'mcq', outcome: 'right', ms: 3000 });
  c.importJSON(json);
  assert.deepEqual(c.events(), a.events(), 'import without merge must replace the record');
  assert.throws(() => c.importJSON('{nope'), /the text is not JSON/);
  assert.throws(() => c.importJSON({ version: 1 }), /expected \{ version, events/);
});

function fakeStorage(initial = {}, { onSet } = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { onSet?.(k, v); map.set(k, String(v)); },
    removeItem: (k) => map.delete(k),
    get size() { return map.size; },
    peek: (k) => map.get(k),
  };
}

test('a corrupt localStorage value does not throw, and is kept rather than overwritten', () => {
  const warnings = [];
  const storage = fakeStorage({ 'tb-progress-v1': '{"events":[1,2,' });
  const store = createStore({ storage, fetch: null, clock: () => T0, warn: (m) => warnings.push(m) });
  assert.deepEqual(store.events(), []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /not readable/);
  assert.equal(storage.peek('tb-progress-v1.corrupt'), '{"events":[1,2,', 'the unreadable value is quarantined, not lost');
  // And the store still works.
  resetObjectives();
  register('test/ch01', OBJECTIVES);
  store.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(store.events().length, 1);
  assert.match(storage.peek('tb-progress-v1'), /"events"/);
});

test('a value of the wrong shape, and an unusable event inside a good one, are survived', () => {
  const warnings = [];
  const shape = createStore({ storage: fakeStorage({ 'tb-progress-v1': '"a string"' }), fetch: null, clock: () => T0, warn: (m) => warnings.push(m) });
  assert.deepEqual(shape.events(), []);
  assert.match(warnings[0], /not readable/);

  const mixed = createStore({
    storage: fakeStorage({ 'tb-progress-v1': JSON.stringify({ version: 1, events: [{ t: at(0), objective: 'homeostasis', kind: 'mcq', outcome: 'right' }, { objective: 'homeostasis', outcome: 'sideways', kind: 'mcq' }] }) }),
    fetch: null,
    clock: () => T0,
    warn: (m) => warnings.push(m),
  });
  assert.equal(mixed.events().length, 1, 'the good event survives its unusable neighbour');
  assert.match(warnings.at(-1), /saved event 1 is unusable/);
});

test('no storage at all, and a storage that is full, are survived', () => {
  const none = createStore({ storage: null, fetch: null, clock: () => T0 });
  none.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(none.events().length, 1);
  assert.equal(none.persisting, false);

  const warnings = [];
  const full = createStore({
    storage: fakeStorage({}, { onSet: (k) => { if (k === 'tb-progress-v1') throw new Error('QuotaExceededError'); } }),
    fetch: null,
    clock: () => T0,
    warn: (m) => warnings.push(m),
  });
  full.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  full.record({ t: at(1), objective: 'homeostasis', item: 'q-2', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(full.events().length, 2, 'the sitting continues in memory');
  assert.equal(full.persisting, false);
  assert.equal(warnings.length, 1, 'and it says so once, not on every answer');
  assert.match(warnings[0], /could not be saved.*QuotaExceededError/);

  // A browser set to block site data throws on the read as well, which is a different branch.
  const blocked = [];
  const locked = createStore({
    storage: { getItem: () => { throw new Error('The operation is insecure'); }, setItem: () => {}, removeItem: () => {} },
    fetch: null,
    clock: () => T0,
    warn: (m) => blocked.push(m),
  });
  assert.deepEqual(locked.events(), []);
  assert.match(blocked[0], /could not be read.*The operation is insecure/);
  locked.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(locked.events().length, 1, 'and the reader still studies');
});

test('a stored record is loaded back on the next visit', () => {
  const storage = fakeStorage();
  const first = createStore({ storage, fetch: null, clock: () => T0, session: 's1' });
  resetObjectives();
  register('test/ch01', OBJECTIVES);
  learn(first, 'homeostasis', { reps: 4 });
  const second = createStore({ storage, fetch: null, clock: () => T0, session: 's2' });
  assert.deepEqual(second.events(), first.events());
  assert.deepEqual(second.cards(), first.cards());
  second.reset();
  assert.deepEqual(second.events(), []);
  assert.equal(createStore({ storage, fetch: null, clock: () => T0 }).events().length, 0, 'reset clears the stored copy too');
});

test('each recorded event is posted to the dev server, and a dead endpoint is not retried', async () => {
  const sent = [];
  let fail = false;
  const store = fresh({
    fetch: (url, init) => {
      sent.push({ url, body: JSON.parse(init.body) });
      return fail ? Promise.reject(new Error('ECONNREFUSED')) : Promise.resolve({ ok: true });
    },
  });
  store.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, '/api/progress');
  assert.equal(sent[0].body.objective, 'homeostasis');
  fail = true;
  store.record({ t: at(1), objective: 'homeostasis', item: 'q-2', kind: 'mcq', outcome: 'right', ms: 3000 });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(store.posting, false, 'after a refused POST the store stops trying');
  store.record({ t: at(2), objective: 'homeostasis', item: 'q-3', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(sent.length, 2, 'the third event was not sent');
  assert.equal(store.events().length, 3, 'but it is still recorded');
});

test('onChange fires on record, import and reset, and unsubscribes', () => {
  const store = fresh();
  const seen = [];
  const off = store.onChange((d) => seen.push(d.reason));
  store.record({ t: at(0), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  store.importJSON(store.exportJSON());
  store.reset();
  assert.deepEqual(seen, ['record', 'import', 'reset']);
  off();
  store.record({ t: at(1), objective: 'homeostasis', item: 'q-1', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(seen.length, 3);
  assert.throws(() => store.onChange('not a function'), /needs a function/);
});

test('record() refuses an event it cannot use, naming the field and what would satisfy it', () => {
  const store = fresh();
  assert.throws(() => store.record({ kind: 'mcq', outcome: 'right' }), /event\.objective must be the id of the objective/);
  assert.throws(() => store.record({ objective: 'homeostasis', kind: 'mcq', outcome: 'nearly' }), /event\.outcome for objective "homeostasis" must be one of right, wrong, partial; got "nearly"/);
  assert.throws(() => store.record({ objective: 'homeostasis', outcome: 'right' }), /event\.kind .*must name the format/);
  assert.throws(() => store.record({ objective: 'homeostasis', kind: 'mcq', outcome: 'right', ms: 'ages' }), /event\.ms .*must be the milliseconds/);
  assert.throws(() => store.record({ objective: 'homeostasis', kind: 'mcq', outcome: 'right', learner: '../etc' }), /event\.learner must match/);
  assert.throws(() => store.record({ objective: 'homeostasis', kind: 'mcq', outcome: 'right', t: 'tuesday' }), /must be a parseable date string/);
  assert.throws(() => store.record({ objective: 'homeostasis', kind: 'mcq', outcome: 'right', options: 1 }), /event\.options .*integer of 2 or more/);
  assert.equal(store.events().length, 0, 'nothing that was refused was recorded');
});

test('an event recorded with no timestamp is stamped from the clock, and defaults are filled in', () => {
  const store = fresh({ clock: () => Date.parse(at(3)) });
  const e = store.record({ objective: 'homeostasis', kind: 'mcq', outcome: 'right', ms: 3000 });
  assert.equal(e.t, at(3));
  assert.equal(e.learner, 'default');
  assert.equal(e.session, 's1');
  assert.equal(e.source, 'chapter');
  assert.equal(store.mastery('homeostasis').evidence, 1, 'mastery() with no clock argument uses the store clock');
});

test('every event the store records is one the dev server would accept', () => {
  // The two halves of the same contract: store.record() normalises, POST /api/progress validates. If
  // one gains a field or tightens a rule without the other, this goes red instead of the reader's
  // answers being silently refused by a server that is not watching.
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 3 });
  store.record({ t: at(day), objective: 'set-point', item: 'q-1', kind: 'mcq', outcome: 'wrong', ms: 22000, chose: 'B', options: 4, confidence: 'unsure', source: 'today' });
  store.record({ objective: 'fever', kind: 'free', outcome: 'partial' }); // the sparsest event the store allows
  for (const [i, e] of store.events().entries()) {
    assert.deepEqual(progressEventProblems(e, i), [], `the server would refuse an event the store made: ${JSON.stringify(e)}`);
  }
  // And the server's own rules are not vacuous.
  assert.equal(progressEventProblems({ objective: 'x', kind: 'mcq', outcome: 'sideways' }, 0).length, 1);
});

test('mastery reports the evidence a surface needs to be honest about', () => {
  const store = fresh();
  const day = learn(store, 'homeostasis', { reps: 5, ms: 6000 });
  const m = store.mastery('homeostasis', at(day));
  assert.equal(m.evidence, 5);
  assert.deepEqual(m.formats, ['figure', 'mcq']);
  assert.deepEqual(m.recent, ['right', 'right', 'right']);
  assert.equal(m.medianMs, 6000);
  assert.equal(m.state, 'review');
  // learn() answers each rep exactly when it falls due, so `day` is the next due date: by construction
  // the card sits at the requested retention there, and at 1 the moment it was answered.
  assert.ok(Math.abs(m.retrievability - 0.9) < 0.01, `at its due date, not ${m.retrievability}`);
  assert.equal(store.mastery('homeostasis', store.card('homeostasis').lastReview).retrievability, 1);
  assert.equal(store.mastery('never-touched', at(0)).evidence, 0);
  assert.equal(store.mastery('never-touched', at(0)).state, 'new');
});
