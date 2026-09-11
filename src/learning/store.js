// The reader's record: the append-only event log from docs/design/adaptive.md, the cards the
// scheduler derives from it, and the mastery judgements the surfaces read.
//
// Claim: the cards are a pure function of the events. Everything that is not pure lives at the edges
// of this file — the clock that stamps a new event, localStorage, and the fire-and-forget POST to the
// dev server — and each of those is injectable, so a test and a replay see the same store as a page.
//
// Bound: mastery here is arithmetic over what was recorded. It can say that an answer was right,
// slow, or at chance rate; it cannot say why, and it never claims a misconception. That is the
// agent's round (`npm run review`), which reads the same numbers and the distractor histogram.
//
// Storage: localStorage under one key, and it must survive a private window, a full quota and a
// corrupt value without throwing. Any of those falls back to an in-memory record with a console
// warning, and the reader keeps studying; only the persistence is lost.

import {
  PARAMS, OUTCOMES, newCard, review as applyReview, retrievability, isDue, overdueDays,
  nextIntervalDays, toMs, toIso, describeValue,
} from './scheduler.js';
import { has as objectiveKnown, objective as objectiveRecord, allObjectives, prereqsOf } from './objectives.js';

export const STORAGE_KEY = 'tb-progress-v1';
export const RECORD_VERSION = 1;
export const ENDPOINT = '/api/progress';

/** The learner id the server will accept, checked here so the browser cannot record what the file rejects. */
export const LEARNER_PATTERN = /^[a-z0-9_-]{1,32}$/;

/**
 * Every number behind "learned well", "struggling" and the six flags, in one place, so this file, the
 * tests and `npm run review` read the same thresholds. Changing one changes all three at once.
 */
export const THRESHOLDS = {
  // learned well: high recall, a recent success, and success in more than one format
  learnedRetrievability: 0.85, // predicted recall now
  learnedStability: 7, // days: the card must survive a week, not a sitting
  learnedFormats: 2, // distinct kinds with at least one right answer

  // struggling
  strugglingLapses: 2, // 'lapsing': two or more lapses
  stalledReps: 4, // 'fragile': stability has not moved over this many reps...
  stalledGrowth: 1.5, // ...meaning it grew by less than this factor across them
  slowMs: PARAMS.slowMs, // 'fragile': right but slow, by the scheduler's own definition of slow
  slowRun: 2, // ...twice running
  guessingMinAnswers: 3, // 'guessing': at least this many answers within one session...
  guessingChanceRate: 1 / 3, // ...at or below chance, where an event that carries `options` uses 1/options

  // the rest
  prereqRetrievability: 0.5, // 'blocked': a prereq counts as satisfied above this, once it has reached review
  thinEvidence: 3, // 'thin-evidence': fewer than this many answers behind the card
  staleItemViews: 5, // 'stale-item': one item seen more than this many times by the same learner

  // the sitting
  queueSize: 10, // about ten items, per the design
  newPerSitting: 3, // at most three new objectives introduced in one sitting
};

export const FLAGS = ['lapsing', 'fragile', 'guessing', 'blocked', 'stale-item', 'thin-evidence'];

const EVENT_FIELDS = ['t', 'learner', 'session', 'objective', 'item', 'kind', 'outcome', 'chose', 'ms', 'confidence', 'options', 'source'];

/** Two events are the same answer when the reader, the moment, the item and the verdict all match. */
const fingerprint = (e) => `${e.t}|${e.session}|${e.objective}|${e.item ?? ''}|${e.outcome}`;

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

function defaultStorage() {
  try {
    const s = globalThis.localStorage;
    if (!s) return null;
    // Touch it: a browser set to block site data throws on access, not on read.
    const probe = `${STORAGE_KEY}.probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * Whether to mirror events to the dev server. Yes on http, which is the dev server (the published
 * site is https and has no server at all, so a POST there is a failed request and nothing else).
 *
 * No under WebDriver, whatever the origin: the gates drive a real browser through the real controls,
 * and tools/flow.js answers the chapter's questions for real. Without this, every gate run would
 * append a robot's answers to the reader's own progress/<learner>.jsonl and the agent round would be
 * reading a machine. Set window.__tbPostProgress = true to post anyway, which is how a gate that means
 * to exercise this path would do it.
 */
function shouldPost() {
  try {
    if (globalThis.__tbPostProgress === true) return true;
    if (globalThis.navigator?.webdriver) return false;
    const l = globalThis.location;
    if (!l) return false;
    if (l.protocol === 'http:') return true;
    return ['localhost', '127.0.0.1', '::1'].includes(l.hostname);
  } catch {
    return false;
  }
}

function newSessionId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().slice(0, 8);
  } catch { /* fall through */ }
  return Math.abs(Date.now() % 0xffffffff).toString(16).padStart(8, '0');
}

/**
 * A store. `store` below is the one a page uses; a test or a tool makes its own with the clock,
 * storage and fetch it wants.
 */
export function createStore(options = {}) {
  const key = options.key ?? STORAGE_KEY;
  const endpoint = options.endpoint ?? ENDPOINT;
  const clock = options.clock ?? (() => Date.now());
  const warn = options.warn ?? ((msg) => console.warn(msg));
  const hasStorageOption = Object.prototype.hasOwnProperty.call(options, 'storage');
  const hasFetchOption = Object.prototype.hasOwnProperty.call(options, 'fetch');
  let storage = hasStorageOption ? options.storage : defaultStorage();
  const fetchImpl = hasFetchOption ? options.fetch : (globalThis.fetch ? globalThis.fetch.bind(globalThis) : null);
  let postEnabled = Boolean(fetchImpl) && (hasFetchOption || shouldPost());
  const sessionId = options.session ?? newSessionId();

  /** Every event, always sorted by t, oldest first. */
  let events = [];
  /** objective id -> { card, events, stabilities } */
  let byObjective = new Map();
  const listeners = new Set();

  // ---- persistence -------------------------------------------------------
  function load() {
    if (!storage) return [];
    let raw;
    try {
      raw = storage.getItem(key);
    } catch (err) {
      warn(`tb: localStorage could not be read (${err.message}); this sitting is kept in memory only and will not persist`);
      storage = null;
      return [];
    }
    if (raw == null) return [];
    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed?.events;
      if (!Array.isArray(list)) throw new Error(`expected { version, events: [...] }, found ${describeValue(parsed)}`);
      return list;
    } catch (err) {
      // Keep the corrupt value rather than overwriting it: it is the only copy of whatever was there.
      try {
        storage.setItem(`${key}.corrupt`, raw);
      } catch { /* the quarantine is a courtesy, not a requirement */ }
      warn(`tb: the saved progress under "${key}" is not readable (${err.message}); it has been kept as "${key}.corrupt" and this sitting starts from an empty record`);
      return [];
    }
  }

  function persist() {
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify({ version: RECORD_VERSION, events }));
    } catch (err) {
      warn(`tb: progress could not be saved (${err.message}); ${events.length} event(s) are kept in memory for this sitting only. Free some browser storage, or export from the study page.`);
      storage = null;
    }
  }

  function send(event) {
    if (!postEnabled || !fetchImpl) return;
    try {
      const result = fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      });
      Promise.resolve(result).then(
        (res) => { if (res && res.ok === false) postEnabled = false; },
        () => { postEnabled = false; },
      );
    } catch {
      postEnabled = false; // no server here: localStorage is the record, which is the GitHub Pages case
    }
  }

  // ---- events ------------------------------------------------------------
  function normaliseEvent(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(`record() needs an event object like { objective, kind, outcome }; got ${describeValue(raw)}`);
    }
    if (typeof raw.objective !== 'string' || !raw.objective.trim()) {
      throw new Error(`record(): event.objective must be the id of the objective this answer tests (a non-empty string, for example "feedback-direction"); got ${describeValue(raw.objective)}`);
    }
    if (!OUTCOMES.includes(raw.outcome)) {
      throw new Error(`record(): event.outcome for objective "${raw.objective}" must be one of ${OUTCOMES.join(', ')}; got ${describeValue(raw.outcome)}`);
    }
    if (typeof raw.kind !== 'string' || !raw.kind.trim()) {
      throw new Error(`record(): event.kind for objective "${raw.objective}" must name the format of the question (a non-empty string, for example "mcq", "figure" or "free"); got ${describeValue(raw.kind)}. Mastery counts formats, so an unnamed one would be counted wrongly.`);
    }
    if (raw.ms !== undefined && raw.ms !== null && !(Number.isFinite(raw.ms) && raw.ms >= 0)) {
      throw new Error(`record(): event.ms for objective "${raw.objective}" must be the milliseconds from first sight to answer (a non-negative number), or omitted; got ${describeValue(raw.ms)}`);
    }
    if (raw.options !== undefined && raw.options !== null && !(Number.isInteger(raw.options) && raw.options >= 2)) {
      throw new Error(`record(): event.options for objective "${raw.objective}" must be how many choices the item offered (an integer of 2 or more), or omitted; got ${describeValue(raw.options)}`);
    }
    const learner = raw.learner ?? 'default';
    if (!LEARNER_PATTERN.test(learner)) {
      throw new Error(`record(): event.learner must match ${LEARNER_PATTERN} (lower-case letters, digits, "_" and "-", 1 to 32 characters), because it names the file the dev server appends to; got ${describeValue(raw.learner)}`);
    }
    let t = raw.t ?? toIso(clock());
    toMs(t, 'record(): event.t'); // throws naming the value if it will not parse
    t = toIso(toMs(t, 'record(): event.t'));
    const event = { ...raw, t, learner, session: raw.session ?? sessionId, objective: raw.objective, kind: raw.kind, outcome: raw.outcome };
    if (event.item !== undefined && typeof event.item !== 'string') {
      throw new Error(`record(): event.item for objective "${raw.objective}" must be the item id (a string), or omitted; got ${describeValue(raw.item)}`);
    }
    if (event.source === undefined) event.source = 'chapter';
    return event;
  }

  function slotFor(objective) {
    let slot = byObjective.get(objective);
    if (!slot) {
      slot = { card: newCard(objective), events: [], stabilities: [] };
      byObjective.set(objective, slot);
    }
    return slot;
  }

  function apply(event) {
    const slot = slotFor(event.objective);
    slot.card = applyReview(slot.card, { outcome: event.outcome, ms: event.ms, now: event.t });
    slot.events.push(event);
    slot.stabilities.push(slot.card.stability);
  }

  function rebuild() {
    byObjective = new Map();
    for (const e of events) apply(e);
  }

  function notify(detail) {
    for (const fn of [...listeners]) {
      try {
        fn(detail);
      } catch (err) {
        warn(`tb: a progress listener threw (${err.message}); the record itself is unaffected`);
      }
    }
  }

  // ---- mastery -----------------------------------------------------------
  function prereqSatisfied(id, nowMs) {
    const slot = byObjective.get(id);
    if (!slot) return !objectiveKnown(id); // an id nobody registered and nobody answered cannot block anything
    return slot.card.state === 'review' && retrievability(slot.card, nowMs) >= THRESHOLDS.prereqRetrievability;
  }

  function directPrereqs(id) {
    if (!objectiveKnown(id)) return [];
    return objectiveRecord(id).prereqs;
  }

  /**
   * The prerequisites standing in this objective's way. A card that has already reached review is
   * never blocked: the reader has demonstrably learned it, so its own review stands on its own
   * evidence, and suppressing it because a prerequisite went stale would starve it for good. What
   * blocking is for is the other direction — not starting, or not relearning, something whose
   * foundation is not there.
   */
  function blockedBy(id, nowMs) {
    if (byObjective.get(id)?.card.state === 'review') return [];
    return directPrereqs(id).filter((p) => !prereqSatisfied(p, nowMs));
  }

  function masteryOf(objectiveId, nowMs) {
    const slot = byObjective.get(objectiveId);
    const card = slot ? slot.card : newCard(objectiveId);
    const own = slot ? slot.events : [];
    const flags = [];
    const reasons = {};
    // One flag can fire for more than one reason — fragile from latency and from a flat stability, or
    // guessing in two sittings. Every reason is kept: the round reads the evidence, not just the name.
    const add = (flag, why) => {
      if (!flags.includes(flag)) flags.push(flag);
      reasons[flag] = reasons[flag] ? `${reasons[flag]}; ${why}` : why;
    };

    const formats = [...new Set(own.map((e) => e.kind))].sort();
    const successFormats = [...new Set(own.filter((e) => e.outcome === 'right').map((e) => e.kind))].sort();
    const latencies = own.filter((e) => Number.isFinite(e.ms)).map((e) => e.ms);
    const recent = own.slice(-3).map((e) => e.outcome);
    const r = retrievability(card, nowMs);

    // lapsing
    if (card.lapses >= THRESHOLDS.strugglingLapses) {
      add('lapsing', `${card.lapses} lapses (a wrong answer on a card that had reached review), threshold ${THRESHOLDS.strugglingLapses}`);
    }

    // fragile: right but slow twice running, or stability that has not moved over four reps
    const rights = own.filter((e) => e.outcome === 'right');
    const lastRights = rights.slice(-THRESHOLDS.slowRun);
    if (lastRights.length === THRESHOLDS.slowRun && lastRights.every((e) => Number.isFinite(e.ms) && e.ms >= THRESHOLDS.slowMs)) {
      add('fragile', `right but slow ${THRESHOLDS.slowRun}x running (${lastRights.map((e) => `${(e.ms / 1000).toFixed(1)} s`).join(', ')}), slow is ${(THRESHOLDS.slowMs / 1000).toFixed(0)} s or more`);
    }
    // Stability that has not moved over four reps. The comparison is between the best the card has
    // ever been, then and now: a struggling card oscillates — lapse, relearn, lapse — so comparing two
    // point values lands on a trough and a crest and reads as progress. A card that is already strong
    // is exempt, because a card sitting at the schedule's ceiling has stopped growing for the opposite
    // reason.
    const series = slot ? slot.stabilities : [];
    if (series.length >= THRESHOLDS.stalledReps && card.stability < THRESHOLDS.learnedStability) {
      const then = Math.max(...series.slice(0, series.length - THRESHOLDS.stalledReps + 1));
      const peak = Math.max(...series);
      if (then > 0 && peak / then < THRESHOLDS.stalledGrowth) {
        add('fragile', `stability has not moved over the last ${THRESHOLDS.stalledReps} of ${series.length} reps (best ${then.toFixed(2)} d then, ${peak.toFixed(2)} d now, under ${THRESHOLDS.stalledGrowth}x)`);
      }
    }

    // guessing: at or below chance across one session
    const sessions = new Map();
    for (const e of own) {
      const s = sessions.get(e.session) ?? { n: 0, right: 0, chance: 0 };
      s.n += 1;
      if (e.outcome === 'right') s.right += 1;
      s.chance += Number.isInteger(e.options) && e.options >= 2 ? 1 / e.options : THRESHOLDS.guessingChanceRate;
      sessions.set(e.session, s);
    }
    for (const [id, s] of sessions) {
      const chance = s.chance / s.n;
      if (s.n >= THRESHOLDS.guessingMinAnswers && s.right / s.n <= chance) {
        add('guessing', `session ${id}: ${s.right} right out of ${s.n}, at or below the ${(chance * 100).toFixed(0)}% a guess would score`);
      }
    }

    // blocked
    const blockers = blockedBy(objectiveId, nowMs);
    if (blockers.length) {
      add('blocked', `prerequisite${blockers.length > 1 ? 's' : ''} not yet learned: ${blockers.join(', ')}`);
    }

    // stale-item
    const perItem = new Map();
    for (const e of own) if (e.item) perItem.set(e.item, (perItem.get(e.item) ?? 0) + 1);
    const stale = [...perItem].filter(([, n]) => n > THRESHOLDS.staleItemViews).sort((a, b) => b[1] - a[1]);
    if (stale.length) {
      add('stale-item', `${stale.map(([item, n]) => `${item} seen ${n}x`).join(', ')}, over the ${THRESHOLDS.staleItemViews} at which recognition replaces recall`);
    }

    // thin-evidence
    if (own.length < THRESHOLDS.thinEvidence) {
      add('thin-evidence', `${own.length} answer${own.length === 1 ? '' : 's'} recorded, under the ${THRESHOLDS.thinEvidence} this model needs before its state means anything`);
    }

    const lastEvent = own[own.length - 1] ?? null;
    const learnedWell = r >= THRESHOLDS.learnedRetrievability
      && card.stability >= THRESHOLDS.learnedStability
      && lastEvent?.outcome === 'right'
      && successFormats.length >= THRESHOLDS.learnedFormats;
    const struggling = flags.includes('lapsing') || flags.includes('fragile') || flags.includes('guessing');

    return {
      objective: objectiveId,
      state: card.state,
      retrievability: r,
      evidence: own.length,
      formats,
      flags,
      // additive, and what `npm run review` and the surfaces print:
      flagReasons: reasons,
      successFormats,
      learnedWell,
      struggling,
      blockedBy: blockers,
      stability: card.stability,
      difficulty: card.difficulty,
      due: card.due,
      reps: card.reps,
      lapses: card.lapses,
      lastReview: card.lastReview,
      lastOutcome: lastEvent?.outcome ?? null,
      recent,
      medianMs: median(latencies),
      card,
    };
  }

  // ---- the store ---------------------------------------------------------
  const store = {
    /** The session id every event recorded through this store carries unless it brings its own. */
    get session() { return sessionId; },
    /** False once a write has failed: the record is then in memory for this sitting only. */
    get persisting() { return Boolean(storage); },
    /** False when there is no dev server to mirror events to, which is the GitHub Pages case. */
    get posting() { return postEnabled; },

    record(event) {
      const e = normaliseEvent(event);
      const last = events[events.length - 1];
      if (!last || toMs(e.t) >= toMs(last.t)) {
        events.push(e);
        apply(e);
      } else {
        // Out of order (a phone's log imported mid-sitting): keep the log sorted and replay, so the
        // cards never depend on the order the events arrived in.
        const at = events.findIndex((x) => toMs(x.t) > toMs(e.t));
        events.splice(at === -1 ? events.length : at, 0, e);
        rebuild();
      }
      persist();
      send(e);
      notify({ reason: 'record', event: e });
      return e;
    },

    events({ since } = {}) {
      if (since === undefined || since === null) return events.slice();
      const from = toMs(since, 'events({ since })');
      return events.filter((e) => toMs(e.t) >= from);
    },

    cards() {
      const out = {};
      for (const [id, slot] of byObjective) out[id] = slot.card;
      return out;
    },

    card(objectiveId) {
      return byObjective.get(objectiveId)?.card ?? newCard(objectiveId);
    },

    mastery(objectiveId, now = clock()) {
      return masteryOf(objectiveId, toMs(now, 'mastery() now'));
    },

    /**
     * Objectives to practise now, most overdue first. New objectives are not included — they have no
     * due date to be overdue against; `queue()` is what introduces them, and `summary().new` lists them.
     */
    due(now = clock()) {
      const nowMs = toMs(now, 'due() now');
      return [...byObjective.values()]
        .filter((slot) => slot.card.state !== 'new')
        .filter((slot) => isDue(slot.card, nowMs))
        .filter((slot) => blockedBy(slot.card.objective, nowMs).length === 0)
        .sort((a, b) => overdueDays(b.card, nowMs) - overdueDays(a.card, nowMs) || (a.card.objective < b.card.objective ? -1 : 1))
        .map((slot) => slot.card.objective);
    },

    /**
     * The sitting's order: overdue review cards first, most overdue first; then cards in learning or
     * relearning; then at most THRESHOLDS.newPerSitting new objectives whose prerequisites are
     * satisfied. A blocked objective never appears, at any position.
     *
     * Each pick carries `reason`, one of 'overdue', 'relearn', 'learning', 'new', for the UI to switch
     * on, and `why`, a sentence for it to print.
     */
    queue({ size = THRESHOLDS.queueSize, now = clock() } = {}) {
      const nowMs = toMs(now, 'queue() now');
      const picks = [];
      const taken = new Set();
      const open = (id) => !taken.has(id) && blockedBy(id, nowMs).length === 0;

      const dueSlots = [...byObjective.values()]
        .filter((slot) => slot.card.state !== 'new' && isDue(slot.card, nowMs) && open(slot.card.objective))
        .sort((a, b) => overdueDays(b.card, nowMs) - overdueDays(a.card, nowMs) || (a.card.objective < b.card.objective ? -1 : 1));

      const push = (id, reason, why) => {
        if (picks.length >= size || taken.has(id)) return;
        taken.add(id);
        picks.push({ objective: id, reason, why });
      };

      for (const slot of dueSlots.filter((s) => s.card.state === 'review')) {
        const late = overdueDays(slot.card, nowMs);
        const r = retrievability(slot.card, nowMs);
        push(slot.card.objective, 'overdue', `due ${late <= 0 ? 'now' : `${late.toFixed(1)} d ago`}, predicted recall ${(r * 100).toFixed(0)}%`);
      }
      for (const slot of dueSlots.filter((s) => s.card.state === 'lapsed')) {
        push(slot.card.objective, 'relearn', `lapsed ${slot.card.lapses}x; being relearned from a ${Math.round(PARAMS.relearnStepDays * 1440)} minute step`);
      }
      for (const slot of dueSlots.filter((s) => s.card.state === 'learning')) {
        push(slot.card.objective, 'learning', `still being learned: ${slot.card.reps} answer${slot.card.reps === 1 ? '' : 's'} so far`);
      }

      let introduced = 0;
      const fresh = allObjectives()
        .filter((rec) => !byObjective.has(rec.id) || byObjective.get(rec.id).card.state === 'new')
        .filter((rec) => open(rec.id))
        .sort((a, b) => prereqsOf(a.id).length - prereqsOf(b.id).length || a.order - b.order);
      for (const rec of fresh) {
        if (introduced >= THRESHOLDS.newPerSitting || picks.length >= size) break;
        const need = directPrereqs(rec.id);
        push(rec.id, 'new', need.length ? `new; its prerequisites (${need.join(', ')}) are in place` : 'new; nothing has to come first');
        introduced += 1;
      }
      return picks;
    },

    /**
     * Where the reader stands, in four disjoint lists, in this precedence: blocked, then struggling,
     * then learned well, then new. `inProgress` holds everything in none of them.
     */
    summary(now = clock()) {
      const nowMs = toMs(now, 'summary() now');
      const ids = new Set([...byObjective.keys(), ...allObjectives().map((o) => o.id)]);
      const out = { learnedWell: [], struggling: [], blocked: [], new: [], inProgress: [] };
      for (const id of [...ids].sort()) {
        const m = masteryOf(id, nowMs);
        if (m.flags.includes('blocked')) out.blocked.push(id);
        else if (m.struggling) out.struggling.push(id);
        else if (m.learnedWell) out.learnedWell.push(id);
        else if (m.state === 'new') out.new.push(id);
        else out.inProgress.push(id);
      }
      return out;
    },

    exportJSON() {
      return JSON.stringify({
        version: RECORD_VERSION,
        exportedAt: toIso(clock()),
        events,
        // Derived, for a person reading the file. importJSON() ignores it and replays the events.
        cards: store.cards(),
      }, null, 2);
    },

    /**
     * Replace the record with the events in `json` (a string or an already-parsed object). Pass
     * { merge: true } to add them to what is here instead, dropping events already recorded.
     */
    importJSON(json, { merge = false } = {}) {
      let parsed;
      if (typeof json === 'string') {
        try {
          parsed = JSON.parse(json);
        } catch (err) {
          throw new Error(`importJSON(): the text is not JSON (${err.message}); pass the contents of a file written by exportJSON()`);
        }
      } else {
        parsed = json;
      }
      const list = Array.isArray(parsed) ? parsed : parsed?.events;
      if (!Array.isArray(list)) {
        throw new Error(`importJSON(): expected { version, events: [...] } or a bare array of events; got ${describeValue(parsed)}`);
      }
      const incoming = list.map((raw, i) => {
        try {
          return normaliseEvent(raw);
        } catch (err) {
          throw new Error(`importJSON(): event at index ${i} is not usable — ${err.message}`);
        }
      });
      const seen = new Set(merge ? events.map(fingerprint) : []);
      const kept = merge ? events.slice() : [];
      for (const e of incoming) {
        const f = fingerprint(e);
        if (seen.has(f)) continue;
        seen.add(f);
        kept.push(e);
      }
      events = kept.sort((a, b) => toMs(a.t) - toMs(b.t));
      rebuild();
      persist();
      notify({ reason: 'import', added: incoming.length });
      return events.length;
    },

    onChange(listener) {
      if (typeof listener !== 'function') {
        throw new Error(`onChange() needs a function to call when the record changes; got ${describeValue(listener)}`);
      }
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    reset() {
      events = [];
      byObjective = new Map();
      if (storage) {
        try {
          storage.removeItem(key);
        } catch { /* already unusable; the in-memory record is reset either way */ }
      }
      notify({ reason: 'reset' });
    },
  };

  events = load().map((raw, i) => {
    try {
      return normaliseEvent(raw);
    } catch (err) {
      warn(`tb: saved event ${i} is unusable and was dropped (${err.message})`);
      return null;
    }
  }).filter(Boolean).sort((a, b) => toMs(a.t) - toMs(b.t));
  rebuild();

  return store;
}

/** The page's store. One per document, reading and writing localStorage under STORAGE_KEY. */
export const store = createStore();

export { nextIntervalDays, retrievability, isDue };
