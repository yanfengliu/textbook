// The scheduler must hold the properties docs/design/adaptive.md names, not the constants it happens
// to ship with: a right answer never shortens the next interval and a wrong one never lengthens it,
// intervals grow across a streak, a lapse leaves the card below where it was, the function is pure,
// and the same history always gives the same card.
//
// Bound: the properties below over two populations — a set of hand-built histories, and the 64
// pseudo-random histories of 24 answers each that seeds 1..64 generate through the mulberry32 below
// (no Math.random: a red run here reproduces exactly). It says nothing about whether the constants
// suit a human reader; only a reader's own log can say that, which is what `npm run review` reads.
// The determinism test also replays one history through src/learning/store.js, so a divergence
// between the bare scheduler and the store's replay fails here as well as in store.test.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PARAMS, OUTCOMES, newCard, review, retrievability, isDue, intervalDays, nextIntervalDays, overdueDays,
} from '../src/learning/scheduler.js';
import { createStore } from '../src/learning/store.js';

const DAY_MS = 86400000;
const T0 = Date.parse('2026-01-01T09:00:00.000Z');
const EPS = 1e-9;
const at = (days) => new Date(T0 + days * DAY_MS).toISOString();

/** mulberry32: a seeded generator, so every history in this file is reproducible from its seed. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A history of 24 answers at plausible gaps and latencies, from one seed. */
function history(seed, length = 24) {
  const r = rng(seed);
  const out = [];
  let day = 0;
  for (let i = 0; i < length; i += 1) {
    const roll = r();
    const outcome = roll < 0.6 ? 'right' : roll < 0.8 ? 'partial' : 'wrong';
    day += r() * 12;
    out.push({ outcome, ms: Math.round(1000 + r() * 40000), now: at(day) });
  }
  return out;
}

/** Fold a history into cards, keeping every step so the properties can be checked pairwise. */
function play(objective, answers) {
  let card = newCard(objective);
  const steps = [];
  for (const a of answers) {
    const next = review(card, a);
    steps.push({ before: card, answer: a, after: next });
    card = next;
  }
  return { card, steps };
}

const allSteps = () => {
  const out = [];
  for (let seed = 1; seed <= 64; seed += 1) out.push(...play(`obj-${seed}`, history(seed)).steps);
  return out;
};

test('PARAMS covers every grade the scheduler can award', () => {
  for (const grade of ['right', 'slow', 'partial', 'wrong']) {
    assert.ok(Number.isFinite(PARAMS.initialStability[grade]), `initialStability.${grade}`);
    assert.ok(Number.isFinite(PARAMS.difficultyTarget[grade]), `difficultyTarget.${grade}`);
  }
  for (const grade of ['right', 'slow', 'partial']) {
    assert.ok(Number.isFinite(PARAMS.outcomeGrowth[grade]), `outcomeGrowth.${grade}`);
    assert.ok(PARAMS.minGrowth[grade] >= 1, `minGrowth.${grade} must be at least 1: a success may not shrink a card`);
  }
  // The short steps must be shorter than the shortest full interval, or a lapse could lengthen the gap.
  assert.ok(PARAMS.relearnStepDays < PARAMS.minIntervalDays, 'relearnStepDays must be under minIntervalDays');
  assert.ok(PARAMS.learningStepDays < PARAMS.minIntervalDays, 'learningStepDays must be under minIntervalDays');
});

test('a right answer never shortens the next interval, and a wrong one never lengthens it', () => {
  let rights = 0;
  let wrongs = 0;
  for (const { before, answer, after } of allSteps()) {
    const gapBefore = nextIntervalDays(before);
    const gapAfter = nextIntervalDays(after);
    if (answer.outcome === 'right' || answer.outcome === 'partial') {
      rights += 1;
      assert.ok(gapAfter >= gapBefore - EPS, `${answer.outcome} on a ${before.state} card shortened the gap: ${gapBefore} d -> ${gapAfter} d`);
    } else {
      if (before.state === 'new') continue; // a card never seen has no interval to lengthen
      wrongs += 1;
      assert.ok(gapAfter <= gapBefore + EPS, `wrong on a ${before.state} card lengthened the gap: ${gapBefore} d -> ${gapAfter} d`);
      assert.ok(after.stability <= before.stability + EPS, `wrong on a ${before.state} card raised stability: ${before.stability} -> ${after.stability}`);
    }
  }
  assert.ok(rights > 800 && wrongs > 200, `the sweep must actually exercise both cases; saw ${rights} successes and ${wrongs} failures`);
});

test('intervals grow monotonically across a streak of right answers', () => {
  let card = newCard('streak');
  let day = 0;
  let previous = -1;
  const gaps = [];
  for (let i = 0; i < 8; i += 1) {
    card = review(card, { outcome: 'right', ms: 4000, now: at(day) });
    const gap = nextIntervalDays(card);
    assert.ok(gap > previous, `rep ${i + 1}: the interval went ${previous} d -> ${gap} d`);
    previous = gap;
    gaps.push(gap);
    day += gap; // answer each one exactly when it falls due
  }
  assert.equal(card.state, 'review');
  assert.ok(gaps[7] > gaps[0] * 10, `eight on-time successes should move the interval a long way: ${gaps[0].toFixed(2)} d -> ${gaps[7].toFixed(2)} d`);
  // And never decreasing even past the cap, where growth necessarily stops.
  for (let i = 0; i < 40; i += 1) {
    const next = review(card, { outcome: 'right', ms: 4000, now: at(day) });
    assert.ok(nextIntervalDays(next) >= nextIntervalDays(card) - EPS, 'a success past the cap must not shorten the interval');
    day += nextIntervalDays(next);
    card = next;
  }
  assert.ok(nextIntervalDays(card) <= PARAMS.maxIntervalDays + EPS, 'the interval must stop at maxIntervalDays');
});

test('a lapse leaves stability and the next interval below their pre-lapse values', () => {
  let card = newCard('lapse');
  let day = 0;
  for (let i = 0; i < 5; i += 1) {
    card = review(card, { outcome: 'right', ms: 4000, now: at(day) });
    day += nextIntervalDays(card);
  }
  const before = card;
  const after = review(before, { outcome: 'wrong', ms: 9000, now: at(day) });
  assert.ok(after.stability < before.stability, `stability ${before.stability} -> ${after.stability}`);
  assert.ok(nextIntervalDays(after) < nextIntervalDays(before), `interval ${nextIntervalDays(before)} d -> ${nextIntervalDays(after)} d`);
  assert.equal(after.state, 'lapsed');
  assert.equal(after.lapses, before.lapses + 1);
  // Relearning it does not silently restore the old interval either.
  const relearned = review(after, { outcome: 'right', ms: 4000, now: at(day + PARAMS.relearnStepDays) });
  assert.ok(nextIntervalDays(relearned) < nextIntervalDays(before), 'one right answer must not undo a lapse');
});

test('a lapse is counted only once the card has reached review', () => {
  const fresh = review(newCard('first'), { outcome: 'wrong', ms: 3000, now: at(0) });
  assert.equal(fresh.state, 'learning');
  assert.equal(fresh.lapses, 0, 'failing something you have never got right is not forgetting it');
  const learned = review(fresh, { outcome: 'right', ms: 3000, now: at(0.01) });
  const forgotten = review(learned, { outcome: 'wrong', ms: 3000, now: at(3) });
  assert.equal(forgotten.lapses, 1);
});

test('review() never mutates its input card', () => {
  for (const outcome of OUTCOMES) {
    const card = review(newCard('pure'), { outcome: 'right', ms: 3000, now: at(0) });
    const copy = JSON.parse(JSON.stringify(card));
    const next = review(card, { outcome, ms: 25000, now: at(4) });
    assert.deepEqual(card, copy, `review(..., ${outcome}) changed the card it was given`);
    assert.notEqual(next, card, 'review() must return a new object');
  }
});

test('the same history always yields the same card, in the scheduler and through a store replay', () => {
  const answers = history(7);
  const a = play('determinism', answers).card;
  const b = play('determinism', answers).card;
  assert.deepEqual(a, b, 'two runs of the same history disagreed');

  const events = answers.map((x, i) => ({
    t: x.now, objective: 'determinism', kind: i % 2 ? 'figure' : 'mcq', outcome: x.outcome, ms: x.ms, item: `q-${i % 3}`,
  }));
  const store = createStore({ storage: null, fetch: null, clock: () => T0 });
  for (const e of events) store.record(e);
  assert.deepEqual(store.card('determinism'), a, "the store's replay diverged from the bare scheduler");

  const replay = createStore({ storage: null, fetch: null, clock: () => T0 });
  replay.importJSON(JSON.stringify({ version: 1, events }));
  assert.deepEqual(replay.cards(), store.cards(), 'an imported log gave different cards from the same log recorded live');
});

test('retrievability is 1 at the moment of review and falls with elapsed time', () => {
  const card = review(newCard('decay'), { outcome: 'right', ms: 3000, now: at(0) });
  assert.equal(retrievability(card, at(0)), 1);
  let previous = 1;
  for (const days of [0.1, 0.5, 1, 2, 5, 10, 30, 365]) {
    const r = retrievability(card, at(days));
    assert.ok(r < previous, `retrievability did not fall between the last point and day ${days}: ${previous} -> ${r}`);
    assert.ok(r >= 0 && r <= 1, `retrievability ${r} is outside 0..1`);
    previous = r;
  }
  assert.equal(retrievability(newCard('never-seen'), at(0)), 0, 'a card never answered has no recall to predict');
  // At its own due date a card sits at the requested retention, which is what the interval is for.
  const r = retrievability(card, at(nextIntervalDays(card)));
  assert.ok(Math.abs(r - PARAMS.requestedRetention) < 0.01, `a card at its due date should sit near ${PARAMS.requestedRetention}; it was ${r.toFixed(3)}`);
});

test('a new card is due immediately and a reviewed card is not due before its interval', () => {
  const fresh = newCard('due');
  assert.equal(isDue(fresh, at(0)), true);
  assert.equal(overdueDays(fresh, at(0)), 0);

  const card = review(fresh, { outcome: 'right', ms: 3000, now: at(0) });
  const gap = nextIntervalDays(card);
  assert.equal(isDue(card, at(0)), false);
  assert.equal(isDue(card, at(gap * 0.99)), false, 'a card must not come due before its interval has run');
  assert.equal(isDue(card, at(gap + 0.001)), true);
  assert.ok(overdueDays(card, at(gap + 2)) > 1.9, 'overdueDays must grow past the due date');
});

test('right but slow is a weaker success than right and fast', () => {
  const start = review(newCard('slow'), { outcome: 'right', ms: 2000, now: at(0) });
  const day = nextIntervalDays(start);
  const fast = review(start, { outcome: 'right', ms: 2000, now: at(day) });
  const slow = review(start, { outcome: 'right', ms: PARAMS.slowMs + 1, now: at(day) });
  assert.ok(slow.stability < fast.stability, `slow ${slow.stability} should grow less than fast ${fast.stability}`);
  assert.ok(slow.stability >= start.stability, 'but it is still a success, so it never shrinks the card');
  assert.ok(slow.difficulty > fast.difficulty, 'and it reads as a harder card');
});

test('the error messages name the input and what would satisfy it', () => {
  assert.throws(() => review(newCard('x'), { outcome: 'nearly', now: at(0) }), /outcome for objective "x" must be one of right, wrong, partial; got "nearly"/);
  assert.throws(() => review(newCard('x'), { outcome: 'right' }), /needs an explicit now .*got undefined/);
  assert.throws(() => review(newCard('x'), { outcome: 'right', ms: -5, now: at(0) }), /ms for objective "x" must be a non-negative number/);
  assert.throws(() => review(newCard('x'), { outcome: 'right', now: 'tuesday' }), /must be a parseable date string .*got "tuesday"/);
  assert.throws(() => newCard(''), /newCard\(\) needs an objective id/);
  assert.throws(() => review({ state: 'review' }, { outcome: 'right', now: at(0) }), /a card needs an objective id/);
});

test('intervalDays is the inverse of the forgetting curve at the requested retention', () => {
  for (const stability of [0.5, 1, 7, 30, 180]) {
    const days = intervalDays(stability);
    const card = { objective: 'i', state: 'review', stability, difficulty: 5, due: at(days), reps: 1, lapses: 0, lastReview: at(0) };
    assert.ok(Math.abs(retrievability(card, at(days)) - PARAMS.requestedRetention) < 1e-6, `stability ${stability} d`);
  }
});
