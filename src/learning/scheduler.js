// The pure half of the adaptive design (docs/design/adaptive.md): one card per objective, and a
// function from a card plus an outcome to the next card. A compact variant of FSRS.
//
// Claim: every export here is a pure function of its arguments. No DOM, no storage, no network, no
// Math.random, and no clock — `now` is always passed in, which is what makes a replayed log produce
// the same cards on every machine and every run.
//
// Bound: the constants in PARAMS are tuned by hand, not fitted to this reader's data, so the numbers
// below are a starting schedule and not a measurement. What the tests hold are the properties in
// adaptive.md (a right answer never shortens the next interval, a lapse leaves the card below where it
// was, the same history gives the same card), never the constants themselves.
//
// A card:
//   { objective, state: 'new' | 'learning' | 'review' | 'lapsed',
//     stability,      // days: the interval at which recall is expected to sit at PARAMS.requestedRetention
//     difficulty,     // 1..10, higher is harder for this reader
//     due,            // ISO string, or null for a card never reviewed
//     reps, lapses,
//     lastReview }    // ISO string, or null
//
// An outcome is 'right' | 'wrong' | 'partial'. A 'right' answer slower than PARAMS.slowMs is graded
// 'slow' internally: it still counts as a success, but it grows the card much less and pushes its
// difficulty up, because right-but-slow is reconstruction rather than recall and it will lapse.

const DAY_MS = 86400000;

export const OUTCOMES = ['right', 'wrong', 'partial'];
export const STATES = ['new', 'learning', 'review', 'lapsed'];

export const PARAMS = {
  // --- the forgetting curve -------------------------------------------------
  // R(t) = (1 + factor * t / stability) ^ decay, the FSRS power-law curve. With decay -0.5 and
  // factor 19/81 the interval that lands on requestedRetention is exactly `stability` days, which is
  // why stability is quoted in days everywhere below.
  decay: -0.5,
  factor: 19 / 81,
  requestedRetention: 0.9, // a card comes due when its predicted recall falls to this

  // --- stability ------------------------------------------------------------
  initialStability: { right: 1.2, slow: 0.8, partial: 0.5, wrong: 0.25 }, // days, for a card's first answer
  minStability: 0.02, // ~29 minutes; a card can be weak but never zero
  maxStability: 365, // a year is as far ahead as this book schedules anything
  minGraduatedStability: 1.0, // a card that leaves learning or relearning on a right answer is worth at least a day

  // --- how a success grows stability ---------------------------------------
  // growth * (easy card?) * (young card?) * (was it nearly forgotten?) * (how good was the answer?)
  growth: 6.0, // the size of the whole bonus; ~1.7x per on-time success at difficulty 5
  stabilitySaturation: 0.2, // S^-0.2: a long-interval card grows proportionally less than a new one
  spacingBonus: 1.8, // exp(spacingBonus * (1 - R)) - 1: answering a card you had nearly forgotten is worth more
  outcomeGrowth: { right: 1, slow: 0.5, partial: 0.35 },
  minGrowth: { right: 1.05, slow: 1.02, partial: 1.0 }, // a success never shrinks a card
  maxGrowth: 4, // and never more than quadruples it in one answer

  // --- difficulty -----------------------------------------------------------
  initialDifficulty: 5, // the middle of the 1..10 range, before any evidence
  difficultyTarget: { right: 3.5, slow: 5.5, partial: 6.0, wrong: 8.0 },
  difficultyDrift: 0.25, // each answer moves difficulty a quarter of the way to that answer's target
  minDifficulty: 1,
  maxDifficulty: 10,

  // --- lapses and short steps ----------------------------------------------
  lapseFactor: 0.35, // a wrong answer on a card that had reached review cuts stability to about a third
  learningStepDays: 10 / 1440, // 10 minutes: the gap while a card is still being learned
  relearnStepDays: 10 / 1440, // 10 minutes: the gap while a lapsed card is being relearned
  minIntervalDays: 0.02, // ~29 minutes, deliberately longer than the two steps above
  maxIntervalDays: 365,

  // --- latency --------------------------------------------------------------
  slowMs: 20000, // a right answer at or above this is graded 'slow'; src/learning/store.js reads this same number
};

// ---------------------------------------------------------------------------
// small helpers

export function describeValue(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `an array of ${v.length}`;
  if (v instanceof Date) return `a Date (${v.toISOString?.() ?? 'invalid'})`;
  return `a ${typeof v}`;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round6 = (v) => Math.round(v * 1e6) / 1e6;

/** Epoch milliseconds from an ISO string, a Date, or a number. Throws naming the offending input. */
export function toMs(value, label = 'time') {
  if (value instanceof Date) {
    const ms = value.getTime();
    if (Number.isFinite(ms)) return ms;
    throw new Error(`${label} is an invalid Date; pass a Date that parses, an ISO string, or epoch milliseconds`);
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
    throw new Error(`${label} must be finite epoch milliseconds; got ${describeValue(value)}`);
  }
  if (typeof value === 'string') {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) return ms;
    throw new Error(`${label} must be a parseable date string (for example "2026-09-10T21:14:03.221Z"); got ${describeValue(value)}`);
  }
  throw new Error(`${label} must be an ISO date string, a Date, or epoch milliseconds; got ${describeValue(value)}`);
}

export const toIso = (ms) => new Date(Math.round(ms)).toISOString();

/** Fill in what a card is missing and check what it cannot do without, without mutating the input. */
export function normaliseCard(card) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    throw new Error(`a card must be an object like { objective, state, stability, difficulty, due, reps, lapses, lastReview }; got ${describeValue(card)}`);
  }
  if (typeof card.objective !== 'string' || !card.objective.trim()) {
    throw new Error(`a card needs an objective id (a non-empty string); got ${describeValue(card.objective)}`);
  }
  const state = STATES.includes(card.state) ? card.state : 'new';
  return {
    objective: card.objective,
    state,
    stability: Number.isFinite(card.stability) ? card.stability : 0,
    difficulty: Number.isFinite(card.difficulty) ? card.difficulty : PARAMS.initialDifficulty,
    due: card.due ?? null,
    reps: Number.isFinite(card.reps) ? card.reps : 0,
    lapses: Number.isFinite(card.lapses) ? card.lapses : 0,
    lastReview: card.lastReview ?? null,
  };
}

// ---------------------------------------------------------------------------
// the contract

/** A card for an objective that has never been answered. Due immediately, no evidence behind it. */
export function newCard(objective) {
  if (typeof objective !== 'string' || !objective.trim()) {
    throw new Error(`newCard() needs an objective id (a non-empty string, for example "feedback-direction"); got ${describeValue(objective)}`);
  }
  return {
    objective,
    state: 'new',
    stability: 0,
    difficulty: PARAMS.initialDifficulty,
    due: null,
    reps: 0,
    lapses: 0,
    lastReview: null,
  };
}

/** The interval a given stability buys, in days, clamped to the schedule's range. */
export function intervalDays(stability) {
  const target = Math.pow(PARAMS.requestedRetention, 1 / PARAMS.decay) - 1;
  return clamp((stability * target) / PARAMS.factor, PARAMS.minIntervalDays, PARAMS.maxIntervalDays);
}

/**
 * The gap this card is actually scheduled at, in days: the short step while it is being learned or
 * relearned, the full interval once it is in review, and 0 for a card that has never been seen.
 */
export function nextIntervalDays(card) {
  const c = normaliseCard(card);
  if (c.state === 'new') return 0;
  if (c.state === 'learning') return PARAMS.learningStepDays;
  if (c.state === 'lapsed') return PARAMS.relearnStepDays;
  return intervalDays(c.stability);
}

/** Predicted recall, 0..1. Exactly 1 at the moment of review, 0 for a card never reviewed. */
export function retrievability(card, now) {
  const c = normaliseCard(card);
  if (c.state === 'new' || !c.lastReview || c.stability <= 0) return 0;
  const elapsedDays = Math.max(0, (toMs(now, 'retrievability() now') - toMs(c.lastReview, 'card.lastReview')) / DAY_MS);
  return clamp(Math.pow(1 + (PARAMS.factor * elapsedDays) / c.stability, PARAMS.decay), 0, 1);
}

/** How far past its due date a card is, in days. Negative when it is not due yet; 0 for a new card. */
export function overdueDays(card, now) {
  const c = normaliseCard(card);
  if (c.state === 'new' || !c.due) return 0;
  return (toMs(now, 'overdueDays() now') - toMs(c.due, 'card.due')) / DAY_MS;
}

/** True when the card should be practised now. A card never seen is due immediately. */
export function isDue(card, now) {
  const c = normaliseCard(card);
  if (c.state === 'new' || !c.due) return true;
  return toMs(now, 'isDue() now') >= toMs(c.due, 'card.due');
}

function gradeOf(outcome, ms) {
  if (outcome === 'right' && Number.isFinite(ms) && ms >= PARAMS.slowMs) return 'slow';
  return outcome;
}

function nextState(state, outcome) {
  if (outcome === 'wrong') return state === 'review' || state === 'lapsed' ? 'lapsed' : 'learning';
  if (outcome === 'partial') {
    if (state === 'review') return 'review';
    if (state === 'lapsed') return 'lapsed';
    return 'learning';
  }
  return 'review';
}

function growthFactor(card, r, grade) {
  const d = clamp(card.difficulty, PARAMS.minDifficulty, PARAMS.maxDifficulty);
  const easiness = (PARAMS.maxDifficulty + 1 - d) / PARAMS.maxDifficulty; // 0.1 (hardest) .. 1.0 (easiest)
  const young = Math.pow(Math.max(card.stability, PARAMS.minStability), -PARAMS.stabilitySaturation);
  const spacing = Math.exp(PARAMS.spacingBonus * (1 - r)) - 1; // 0 when answered the instant it was learnt
  const raw = 1 + PARAMS.growth * easiness * young * spacing * PARAMS.outcomeGrowth[grade];
  return clamp(raw, PARAMS.minGrowth[grade], PARAMS.maxGrowth);
}

/**
 * The whole schedule: a card plus one answer gives the next card. Never mutates the input.
 * `now` is required — the maths here never reads a clock of its own.
 */
export function review(card, { outcome, ms, now } = {}) {
  const c = normaliseCard(card);
  if (!OUTCOMES.includes(outcome)) {
    throw new Error(`review() outcome for objective "${c.objective}" must be one of ${OUTCOMES.join(', ')}; got ${describeValue(outcome)}`);
  }
  if (now === undefined || now === null) {
    throw new Error(`review() for objective "${c.objective}" needs an explicit now (an ISO string, a Date, or epoch milliseconds) so the same history always gives the same card; got ${describeValue(now)}`);
  }
  if (ms !== undefined && ms !== null && !(Number.isFinite(ms) && ms >= 0)) {
    throw new Error(`review() ms for objective "${c.objective}" must be a non-negative number of milliseconds, or omitted; got ${describeValue(ms)}`);
  }
  const nowMs = toMs(now, 'review() now');
  const grade = gradeOf(outcome, ms);
  const r = retrievability(c, nowMs);
  const state = nextState(c.state, outcome);

  let stability;
  if (c.state === 'new' || c.stability <= 0) {
    stability = PARAMS.initialStability[grade];
  } else if (outcome === 'wrong') {
    // Never above where it was: a lapse cannot make a card stronger. It stops falling at minStability,
    // so a card already on the floor stays there rather than going below it.
    stability = Math.min(Math.max(c.stability * PARAMS.lapseFactor, PARAMS.minStability), c.stability);
  } else {
    stability = c.stability * growthFactor(c, r, grade);
  }
  if (state === 'review' && c.state !== 'review') stability = Math.max(stability, PARAMS.minGraduatedStability);
  stability = clamp(stability, PARAMS.minStability, PARAMS.maxStability);

  const target = PARAMS.difficultyTarget[grade];
  const difficulty = clamp(
    c.difficulty + (target - c.difficulty) * PARAMS.difficultyDrift,
    PARAMS.minDifficulty,
    PARAMS.maxDifficulty,
  );

  const gapDays = state === 'learning'
    ? PARAMS.learningStepDays
    : state === 'lapsed'
      ? PARAMS.relearnStepDays
      : intervalDays(stability);

  // A lapse is counted only on a card that had already reached review: failing something you are still
  // learning for the first time is not forgetting it.
  const lapsed = outcome === 'wrong' && (c.state === 'review' || c.state === 'lapsed');

  return {
    objective: c.objective,
    state,
    stability: round6(stability),
    difficulty: round6(difficulty),
    due: toIso(nowMs + gapDays * DAY_MS),
    reps: c.reps + 1,
    lapses: c.lapses + (lapsed ? 1 : 0),
    lastReview: toIso(nowMs),
  };
}
