// The objective registry: the claims a chapter teaches, what each one needs first, and where it is
// taught. A chapter declares its own beside its glossary, in `objectives.js`, and registers them:
//
//   import { register } from '../../src/learning/objectives.js';
//   register('biology/ch01', OBJECTIVES);
//
// A record (docs/design/adaptive.md):
//   { id: 'feedback-direction',
//     statement: 'Predict which effector fires when core temperature leaves its set point...',
//     prereqs: ['homeostasis', 'set-point'],
//     teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
//     level: 'recall' | 'explain' | 'apply' }
//
// Claim: this module holds the graph and answers questions about it. It is pure apart from the module
// -level registry itself, and it never throws on a graph problem — `validate()` reports problems so a
// gate can print all of them at once, rather than the first one stopping the page.
//
// Bound: it knows only what has been registered in this process. A page that has not imported a
// chapter's objectives.js sees none of that chapter's objectives, so `prereqsOf` and the store's
// "blocked" flag are silent about them rather than wrong about them.

const LEVELS = ['recall', 'explain', 'apply'];

function describeValue(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `an array of ${v.length}`;
  return `a ${typeof v}`;
}

/** id -> record. Insertion order is registration order, which is the order a chapter teaches in. */
const records = new Map();
/** Every id claimed twice, so a duplicate can name both chapters. */
let duplicates = [];
/** Monotonic, so `order` stays a stable tie-break even when a chapter re-registers. */
let counter = 0;

/**
 * Register one chapter's objectives. Registering the same chapter again replaces that chapter's
 * records, so a page that reloads a module does not accumulate copies.
 */
export function register(chapterId, objectives) {
  if (typeof chapterId !== 'string' || !chapterId.trim()) {
    throw new Error(`register() needs a chapter id (a non-empty string, for example "biology/ch01"); got ${describeValue(chapterId)}`);
  }
  if (!Array.isArray(objectives)) {
    throw new Error(`register("${chapterId}") needs an array of objective records; got ${describeValue(objectives)}`);
  }
  for (const [id, rec] of [...records]) if (rec.chapter === chapterId) records.delete(id);
  duplicates = duplicates.filter((d) => d.chapter !== chapterId);
  const out = [];
  objectives.forEach((raw, i) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(`register("${chapterId}"): objective at index ${i} must be an object with at least { id, statement }; got ${describeValue(raw)}`);
    }
    if (typeof raw.id !== 'string' || !raw.id.trim()) {
      throw new Error(`register("${chapterId}"): objective at index ${i} needs an id (a non-empty string); got ${describeValue(raw.id)}`);
    }
    const record = {
      id: raw.id,
      chapter: chapterId,
      statement: typeof raw.statement === 'string' ? raw.statement : '',
      prereqs: Array.isArray(raw.prereqs) ? raw.prereqs.filter((p) => typeof p === 'string') : [],
      teaches: {
        sections: Array.isArray(raw.teaches?.sections) ? raw.teaches.sections.slice() : [],
        figures: Array.isArray(raw.teaches?.figures) ? raw.teaches.figures.slice() : [],
      },
      level: typeof raw.level === 'string' ? raw.level : 'recall',
      order: counter++,
    };
    const existing = records.get(record.id);
    if (existing) duplicates.push({ id: record.id, chapter: chapterId, alreadyIn: existing.chapter });
    records.set(record.id, record);
    out.push(record);
  });
  return out;
}

/** True when this id has been registered. Lets a caller ask without catching. */
export function has(id) {
  return records.has(id);
}

/** The record, or a throw naming the id and what is registered. */
export function objective(id) {
  const record = records.get(id);
  if (record) return record;
  const known = [...records.keys()];
  const list = known.length === 0
    ? 'nothing is registered yet — a chapter calls register(chapterId, OBJECTIVES) from its objectives.js'
    : known.length <= 20
      ? `the registered ids are ${known.join(', ')}`
      : `the registered ids start ${known.slice(0, 20).join(', ')} and ${known.length - 20} more`;
  throw new Error(`unknown objective ${describeValue(id)}: ${list}`);
}

/** Every record, in registration order. */
export function allObjectives() {
  return [...records.values()];
}

/**
 * Every prerequisite of this objective, transitively, in dependency order: a prerequisite always
 * comes before whatever needs it, and the objective itself is not included. Unknown ids are returned
 * as they are (an unregistered chapter is a gap, not a lie), and a cycle is broken rather than
 * followed — `validate()` is what reports it.
 */
export function prereqsOf(id) {
  const out = [];
  const done = new Set();
  const onStack = new Set();
  const visit = (current) => {
    if (done.has(current) || onStack.has(current)) return;
    onStack.add(current);
    for (const p of records.get(current)?.prereqs ?? []) visit(p);
    onStack.delete(current);
    done.add(current);
    if (current !== id) out.push(current);
  };
  visit(id);
  return out;
}

/**
 * Every problem in the registered graph, as strings a person can act on. An empty array means the
 * graph is sound. Reported: a duplicate id, a prerequisite nobody registered, a cycle, a missing
 * statement, and a level outside recall/explain/apply.
 */
export function validate() {
  const problems = [];
  for (const d of duplicates) {
    problems.push(`duplicate objective id "${d.id}": chapter ${d.chapter} redefines one already registered by ${d.alreadyIn}; give it a different id`);
  }
  for (const rec of records.values()) {
    if (!rec.statement.trim()) problems.push(`objective "${rec.id}" (${rec.chapter}) has no statement; write the claim the reader should be able to make`);
    if (!LEVELS.includes(rec.level)) problems.push(`objective "${rec.id}" (${rec.chapter}) has level ${describeValue(rec.level)}; it must be one of ${LEVELS.join(', ')}`);
    for (const p of rec.prereqs) {
      if (!records.has(p)) problems.push(`objective "${rec.id}" (${rec.chapter}) needs prereq "${p}", which no chapter registers; register it or drop it from prereqs`);
    }
  }
  // Cycles: depth-first, reporting each cycle once by the path that closes it.
  const state = new Map(); // id -> 'open' | 'done'
  const reported = new Set();
  const walk = (id, path) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') {
      const cycle = path.slice(path.indexOf(id)).concat(id);
      const key = [...cycle].sort().join('>');
      if (!reported.has(key)) {
        reported.add(key);
        problems.push(`prerequisite cycle: ${cycle.join(' -> ')}; an objective cannot be its own prerequisite, directly or through others`);
      }
      return;
    }
    state.set(id, 'open');
    for (const p of records.get(id)?.prereqs ?? []) {
      if (records.has(p)) walk(p, [...path, id]);
    }
    state.set(id, 'done');
  };
  for (const id of records.keys()) walk(id, []);
  return problems;
}

/** Empty the registry. For tests, and for a tool that loads chapters one at a time. */
export function reset() {
  records.clear();
  duplicates = [];
  counter = 0;
}
