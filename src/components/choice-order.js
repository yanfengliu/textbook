// The order a multiple-choice question shows its options in.
//
// Why this exists: every item bank in the biology book was written with the correct option first — 233
// of 233 multiple-choice items across chapters 1 to 5, measured 2026-09-22 — and the Today page drew
// them in that order. A reader who pressed A every time was right every time, and the record said
// "right" about an answer that carried no knowledge. The chapters' own checks had a milder form of the
// same tell: their correct option was written at B or C in 34 of 36. The authored order is the order
// the author wrote the options in, and nothing more; the order a reader sees is drawn here.
//
// Claim: `displayOrder(key, asked, count)` returns a permutation of 0..count-1, `order`, where
// `order[shown]` is the authored index of the option shown at position `shown`. It is a pure function
// of its three arguments:
//
//   key    the question's identity: in Today, the item's id; in a chapter check, the check's id
//          qualified by its page ("biology/ch04-membranes-and-transport#q2"), because every chapter
//          numbers its checks q1 to q5.
//   asked  how many answers to this question the reader's record already holds, so the same question
//          asked again is shuffled again. A check records nothing, so it passes 0.
//   count  how many options the question has.
//
// The same three arguments always give the same order, so every gate that photographs a question sees
// the same frame from the same record. Nothing here calls Math.random: the generator is the fleet's
// seeded one (mulberry32, as in src/figures/lib/), seeded by an FNV-1a hash of the key and `asked`,
// and a Fisher-Yates shuffle draws from it.
//
// Each asking is its own independent draw. It is not forced to differ from the last one, on purpose: a
// correct option that always moved would tell a reader who remembers last time's letter where it is
// not. So an item asked again shows exactly the order it showed before 1 time in count! (1 in 24 for
// four options), and its correct option sits where it sat before 1 time in count, which is chance.
// test/choice-order.test.js measures both, over every bank on disk.
//
// Bound: this decides the order only. Keeping the letters in step with it, and recording which option
// was chosen rather than where it stood, is the job of the two components that render options:
// src/components/mastery.js for Today and src/components/check.js for the chapters' checks. What the
// words say is not decided here either. An explanation that names an option by where it is written
// ("the last option", 「前两个选项」) points at whichever option the draw put there, so
// `npm run check` fails that wording in a check's explanation and in a bank's explanations
// (tools/check-content.js, optionPositionWords()). Nor can any order hide an answer that gives itself
// away by its words: the correct option is also the longest in 220 of the 233 items.

// FNV-1a, 32 bits: a stable hash of a string, the same on every machine.
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32: the fleet's seeded generator, a number in [0, 1) per call.
function generator(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const describe = (v) => (typeof v === 'string' ? JSON.stringify(v) : v === null ? 'null' : Array.isArray(v) ? 'an array' : `${typeof v} ${String(v)}`);

export function displayOrder(key, asked, count) {
  if (typeof key !== 'string' || !key) {
    throw new Error(`displayOrder(): the key must be the question's id, a non-empty string such as "i-why-no-definition-1"; got ${describe(key)}`);
  }
  if (!Number.isInteger(asked) || asked < 0) {
    throw new Error(`displayOrder("${key}"): asked must be how many answers to this question the record already holds, a whole number of 0 or more; got ${describe(asked)}`);
  }
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`displayOrder("${key}"): count must be how many options the question has, a whole number; got ${describe(count)}`);
  }
  const order = Array.from({ length: count }, (_, i) => i);
  // The separator is a character no id in this repository uses, so "i-cell-1" asked 12 times and
  // "i-cell-11" asked twice cannot hash the same text.
  const next = generator(hash(`${key}␟${asked}`));
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
