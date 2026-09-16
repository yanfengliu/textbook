// The reader-facing surfaces of the adaptive study system (docs/design/adaptive.md):
//
//   <tb-mastery for="feedback-direction">   a quiet marker of one objective's state
//   <tb-mastery section="properties">       the same for every objective a section teaches
//   annotateChapter()                       runs on a chapter page: a marker beside each section
//                                           heading, and a dismissible nudge where something lapsed
//   <tb-sitting>                            the Today page: where you stand, a queue of about ten
//                                           items one at a time, and what moved when you finish
//
// Two rules from the design hold everywhere in this file. The prose is never hidden, locked or gated:
// a marker annotates a section, it never collapses or closes one. And a claim is only as strong as the
// evidence under it: two answers is nearly noise, so the surfaces say "not much to go on yet" rather
// than dressing a guess as a measurement.
//
// The four states are told apart by shape and by word before colour, because a reader with a colour
// vision deficiency must be able to read the marker: a dotted ring is not started, a half-filled disc
// is being learned, a filled disc with a tick is learned well, a barred ring has slipped.

import { learning, record } from './task.js';

// ---------- the state vocabulary ----------

const STATES = {
  new: { word: 'Not started', order: 2 },
  learning: { word: 'Learning', order: 3 },
  review: { word: 'Holding', order: 1 },
  lapsed: { word: 'Slipped', order: 4 },
};

// The word the store has earned the right to use. `review` only means the card is past its learning
// steps; `mastery.learnedWell` additionally wants high recall, about a week of stability, a recent
// success, and success in two different formats, because one format is the question learned rather
// than the idea. Only that says "Learned well".
//
// Exported, with the class of the element that carries it, because `tools/sitting.js` checks that no
// per-objective label claims more than the record supports, and a check written against the English
// literal `'Learned well'` or against a hard-coded `.tb-mark__word` empties itself the moment either
// is reworded, translated (docs/design/i18n.md) or renamed. The gate reads both from here so the two
// cannot drift; the record it compares them against is the store's, which is the independent half.
export const LEARNED_WELL_WORD = 'Learned well';
export const MARK_WORD_CLASS = 'tb-mark__word';
// The end summary's class, exported for the same reason: the gate counts the labels inside it rather
// than across the page, because "Where you stand" renders labels before a question is answered.
export const CLOSING_CLASS = 'tb-close';

const GLYPH = {
  // Five round dashes, not a fine dotted line: at the 11px this is drawn at, a 1.5-unit dash on a
  // 27-unit circumference disappears, and the fourth state stops being tellable from the others.
  new: '<circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2.6 2.9"/>',
  learning: '<circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 1.6A4.4 4.4 0 0 1 6 10.4Z" fill="currentColor"/>',
  review: '<circle cx="6" cy="6" r="4.7" fill="currentColor"/><path d="M3.8 6.1 5.3 7.6 8.3 4.4" fill="none" stroke="var(--paper)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  lapsed: '<circle cx="6" cy="6" r="4.3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 6h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
};

// A flag never changes the shape — four states, four marks — it only adds words, so the reader can
// always tell the four apart and still hears what the evidence says.
const FLAG_WORDS = {
  lapsing: 'drifting out of reach',
  fragile: 'right, but slow',
  guessing: 'answers look like guesses',
  blocked: 'waiting on a prerequisite',
  'stale-item': 'you know the question, not the idea',
  'thin-evidence': 'not much to go on yet',
};

const LETTERS = 'ABCDEFGH';

// At most this many written answers in one sitting: they cost minutes each, and ten of them is not
// the ten-minute sitting the page promises.
const MAX_FREE = 2;

// ---------- small tolerant readers over the store ----------
// The store is another module's contract and its counts may be numbers or lists; these say what this
// file needs from it without pretending to know which.

const asArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const countOf = (v) => (Array.isArray(v) ? v.length : Number(v) || 0);
const namesOf = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : x?.objective ?? x?.id)).filter(Boolean) : []);

function safe(fn, fallback = null) {
  try {
    const v = fn();
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

function whenDue(card) {
  const raw = card?.due;
  if (raw == null) return null;
  const ms = typeof raw === 'number' ? raw : Date.parse(raw);
  return Number.isFinite(ms) ? ms : null;
}

// Everything the surfaces need about one objective, with the store's own words where it has them.
function readState(l, id) {
  const mastery = safe(() => l.store.mastery(id), null) || {};
  const card = safe(() => l.store.card(id), null) || {};
  const state = STATES[mastery.state] ? mastery.state : STATES[card.state] ? card.state : 'new';
  const flags = asArray(mastery.flags).filter((f) => FLAG_WORDS[f]);
  const evidence = countOf(mastery.evidence ?? card.reps ?? 0);
  // A card still in the review cycle but carrying a warning is not simply "learned well": the shape
  // stays the review disc, because the state has not changed, and the word says what the flag says.
  const shaky = flags.some((f) => f === 'fragile' || f === 'lapsing' || f === 'guessing');
  return {
    id,
    state,
    flags,
    evidence,
    formats: asArray(mastery.formats),
    retrievability: typeof mastery.retrievability === 'number' ? mastery.retrievability : null,
    learnedWell: mastery.learnedWell === true,
    card,
    word: state === 'review' && shaky ? 'Learned, but shaky'
      : state === 'review' && mastery.learnedWell === true ? LEARNED_WELL_WORD
        : STATES[state].word,
    detail: flags.map((f) => FLAG_WORDS[f]),
    objective: safe(() => l.objective?.(id), null) || { id, statement: id, teaches: { sections: [] } },
  };
}

// The state to show for a group of objectives: attention first, and a section half started reads as
// being learned rather than as untouched.
function worstState(states) {
  if (!states.length) return 'new';
  if (states.some((s) => s === 'lapsed')) return 'lapsed';
  if (states.some((s) => s === 'learning')) return 'learning';
  if (states.some((s) => s === 'new') && states.some((s) => s === 'review')) return 'learning';
  if (states.every((s) => s === 'new')) return 'new';
  return 'review';
}

// ---------- the marker ----------

export function markElement(state, { word = null, detail = [], hidden = '' } = {}) {
  const mark = document.createElement('span');
  mark.className = 'tb-mark';
  mark.dataset.state = state;
  const glyph = document.createElement('span');
  glyph.className = 'tb-mark__glyph';
  glyph.innerHTML = `<svg viewBox="0 0 12 12" aria-hidden="true">${GLYPH[state]}</svg>`;
  const label = document.createElement('span');
  label.className = MARK_WORD_CLASS;
  label.textContent = word ?? STATES[state].word;
  mark.append(glyph, label);
  if (detail.length) {
    const extra = document.createElement('span');
    extra.className = 'tb-mark__detail';
    extra.textContent = detail.join(' · ');
    mark.append(extra);
  }
  if (hidden) {
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = ` ${hidden}`;
    mark.append(sr);
  }
  return mark;
}

export class TbMastery extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    // Nothing is drawn until there is something true to draw: an empty marker is quieter than a
    // placeholder that flashes a state the reader is not in.
    this.replaceChildren();
    learning().then((l) => {
      if (!l) {
        this.remove();
        return;
      }
      this.paint(l);
    });
  }

  paint(l) {
    const section = this.getAttribute('section');
    const ids = section ? sectionObjectives(l, section) : [this.getAttribute('for')].filter(Boolean);
    if (!ids.length) {
      this.remove();
      return;
    }
    const states = ids.map((id) => readState(l, id));
    if (states.length === 1) {
      const s = states[0];
      this.render(s.state, {
        word: s.word,
        detail: s.detail,
        hidden: `${s.objective.statement} — ${s.word}${s.detail.length ? `, ${s.detail.join(', ')}` : ''}.`,
      });
      return;
    }
    const worst = worstState(states.map((s) => s.state));
    // `review` only means past the learning steps. The store's stricter verdict is what earns the
    // words "learned well"; everything else in the review cycle is holding, which is not the same claim.
    const solid = states.filter((s) => s.learnedWell).length;
    const holding = states.filter((s) => s.state === 'review' && !s.learnedWell).length;
    const slipped = states.filter((s) => s.state === 'lapsed').length;
    const detail = [];
    if (solid) detail.push(`${solid} of ${states.length} learned well`);
    if (holding) detail.push(`${holding} holding`);
    if (!solid && !holding) detail.push(`${states.length} to go`);
    if (slipped) detail.push(`${slipped} slipped`);
    this.render(worst, {
      word: STATES[worst].word,
      detail,
      hidden: `${states.length} ideas in this section: ${states.map((s) => `${s.objective.statement} — ${s.word}`).join('; ')}.`,
    });
  }

  render(state, opts) {
    this.replaceChildren(markElement(state, opts));
    this.dataset.state = state;
  }
}

// Which objectives a section teaches. The objectives module is the authority; where it offers no way
// to list them, the store's own cards are, because every registered objective has one.
function allObjectiveIds(l) {
  for (const source of [l.allObjectives, l.all, l.objectives, l.list]) {
    if (typeof source === 'function') {
      const got = safe(() => source(), null);
      if (Array.isArray(got) && got.length) return got.map((o) => (typeof o === 'string' ? o : o.id)).filter(Boolean);
    }
  }
  if (Array.isArray(l.OBJECTIVES) && l.OBJECTIVES.length) return l.OBJECTIVES.map((o) => o.id);
  const cards = Object.values(safe(() => l.store.cards(), {}) || {});
  return cards.map((c) => c.objective ?? c.id).filter(Boolean);
}

function sectionObjectives(l, sectionId) {
  return allObjectiveIds(l).filter((id) => {
    const o = safe(() => l.objective?.(id), null);
    return asArray(o?.teaches?.sections).includes(sectionId);
  });
}

// ---------- the chapter annotation ----------
// A margin annotation in a book, not a progress bar in an app: a small mark beside the heading, and
// where something has slipped one sentence offering the practice. Both are additions; nothing in the
// chapter is hidden, reordered or closed.

const NUDGE_KEY = 'tb-nudge-dismissed';

function dismissed(key) {
  try {
    return (localStorage.getItem(NUDGE_KEY) || '').split(' ').includes(key);
  } catch {
    return false;
  }
}

function dismiss(key) {
  try {
    const all = new Set((localStorage.getItem(NUDGE_KEY) || '').split(' ').filter(Boolean));
    all.add(key);
    localStorage.setItem(NUDGE_KEY, [...all].join(' '));
  } catch {
    // Storage may be unavailable; the nudge simply comes back next time.
  }
}

function todayHref() {
  const library = document.querySelector('tb-shell')?.getAttribute('library-href') || '../../';
  return `${library.endsWith('/') ? library : `${library}/`}today/`;
}

export async function annotateChapter() {
  const main = document.querySelector('main[data-chapter]');
  if (!main || main.hasAttribute('data-no-mastery')) return;
  const l = await learning();
  if (!l) return;
  const ids = allObjectiveIds(l);
  if (!ids.length) return;
  const byId = new Map(ids.map((id) => [id, readState(l, id)]));

  for (const section of main.querySelectorAll('section[id]')) {
    const h2 = section.querySelector(':scope > h2');
    if (!h2) continue;
    const here = [...byId.values()].filter((s) => asArray(s.objective.teaches?.sections).includes(section.id));
    if (!here.length) continue;

    const holder = document.createElement('tb-mastery');
    holder.setAttribute('section', section.id);
    holder.className = 'tb-mastery--heading';
    h2.append(holder);
    h2.classList.add('has-mastery');

    const slipped = here.filter((s) => s.state === 'lapsed');
    if (!slipped.length) continue;
    const key = `${section.id}:${slipped.map((s) => `${s.id}.${s.card.lapses ?? 0}`).join(',')}`;
    if (dismissed(key)) continue;
    section.insertBefore(nudge(slipped, key), h2.nextSibling);
  }
}

function nudge(slipped, key) {
  const box = document.createElement('aside');
  box.className = 'tb-nudge';
  box.setAttribute('aria-label', 'Something in this section has slipped');
  const text = document.createElement('p');
  text.className = 'tb-nudge__text';
  const lead = slipped.length === 1
    ? 'You had this and it has slipped: '
    : `${slipped.length} ideas here have slipped: `;
  text.append(lead);
  slipped.forEach((s, i) => {
    const em = document.createElement('em');
    const last = i === slipped.length - 1;
    // An objective statement is a sentence and ends in a full stop. Between two of them that would
    // read ".;", so the stop is dropped from every one but the last.
    em.textContent = last ? s.objective.statement : s.objective.statement.replace(/\s*\.$/, '');
    text.append(em);
    text.append(last ? ' ' : '; ');
  });
  const link = document.createElement('a');
  link.href = todayHref();
  link.textContent = slipped.length === 1 ? 'Practise it in Today' : 'Practise them in Today';
  text.append(link, '.');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'tb-nudge__dismiss';
  close.setAttribute('aria-label', 'Dismiss this note');
  close.textContent = '×';
  close.addEventListener('click', () => {
    dismiss(key);
    box.remove();
  });
  box.append(text, close);
  return box;
}

// ---------- Today ----------

// The store's own reason codes (src/learning/store.js queue(): overdue, relearn, learning, new) and
// the flag names, each turned into a sentence. Anything else the store sends is printed as it comes.
const REASONS = {
  due: 'Due today: long enough that you are about to lose it.',
  overdue: 'This should have come round a while ago, so it is first.',
  relearn: 'You had this and it slipped, so it is being learned again from a short interval.',
  learning: 'Still being learned: not enough answers yet for the schedule to stretch out.',
  new: 'New, and you have everything it builds on.',
  lapsed: 'You had this and it slipped.',
  lapsing: 'This is drifting out of reach.',
  fragile: 'You got this right last time, but slowly, which usually means it is about to go.',
  guessing: 'Your answers here have been at about the rate of guessing.',
  prereq: 'Something else is waiting on this, so it comes first.',
  prerequisite: 'Something else is waiting on this, so it comes first.',
  blocked: 'The thing you wanted is blocked; this is what it needs.',
  'thin-evidence': 'One or two answers is not much to go on, so here it is again.',
  'stale-item': 'You have seen that question often enough to recognise it. Here is another for the same idea.',
  calibration: 'Part of a spread across the chapter, to see where you already stand.',
};

function reasonText(reason) {
  if (!reason) return '';
  const key = String(reason).trim();
  if (REASONS[key]) return REASONS[key];
  if (/\s/.test(key)) return /[.!?]$/.test(key) ? key : `${key}.`;
  return key;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// An objective that is due but has no item in the bank cannot be practised, and saying so is more
// use to this reader — who also writes the questions — than quietly dropping it.
const gap = (n) => (n === 1
  ? 'One idea was due but has no question written for it yet, so the queue passed over it.'
  : `${n} ideas were due but have no question written for them yet, so the queue passed over them.`);

function sentence(parts) {
  if (!parts.length) return '';
  if (parts.length === 1) return `${parts[0]}.`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}.`;
}

export class TbSitting extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    this.size = Math.max(1, Number(this.getAttribute('size')) || 10);
    this.sources = [...this.querySelectorAll('a.tb-source')].map((a) => ({
      href: a.getAttribute('href'),
      url: new URL(a.getAttribute('href'), document.baseURI).href,
      key: a.dataset.key || a.getAttribute('href'),
      label: a.textContent.trim(),
    }));
    this.answered = [];
    this.boot();
  }

  // ----- boot -----

  async boot() {
    this.build();
    const l = await learning();
    if (!l) {
      this.fail('The study record could not load', 'src/learning/store.js did not load, so there is nothing to schedule from. The chapters themselves are unaffected — the prose and every figure still work.');
      return;
    }
    this.l = l;
    if (!this.sources.length) {
      this.fail('No chapters listed', 'This page lists no chapter to study from. Add a link with class="tb-source" inside <tb-sitting>.');
      return;
    }
    this.items = [];
    this.home = new Map();
    const missingBanks = [];
    for (const source of this.sources) {
      const objectives = await import(new URL('objectives.js', source.url).href).catch(() => null);
      if (objectives?.OBJECTIVES && typeof l.register === 'function') {
        safe(() => l.register(source.key, objectives.OBJECTIVES));
        for (const o of objectives.OBJECTIVES) this.home.set(o.id, source);
      }
      const bank = await import(new URL('items.js', source.url).href).catch(() => null);
      const items = bank?.ITEMS;
      if (!Array.isArray(items) || !items.length) {
        missingBanks.push(source);
        continue;
      }
      for (const item of items) this.items.push({ ...item, source });
    }
    this.byObjective = new Map();
    for (const item of this.items) {
      if (!item.objective) continue;
      if (!this.byObjective.has(item.objective)) this.byObjective.set(item.objective, []);
      this.byObjective.get(item.objective).push(item);
    }
    if (!this.items.length) {
      this.fail(
        'No questions to practise yet',
        `${missingBanks.map((s) => s.label).join(', ')} has no question bank: Today reads ${missingBanks.map((s) => `${s.href}items.js`).join(', ')}, which exports ITEMS. Until one exists there is nothing to schedule. The chapter itself still reads and its own checks still work.`,
      );
      return;
    }
    if (this.items.some((i) => i.kind === 'task')) await this.loadFigureKinds();
    this.now = Date.now();
    // The plan is made first so the summary can say how long the sitting actually is.
    this.started = Object.values(safe(() => l.store.cards(), {}) || {}).some((c) => Number(c.reps ?? 0) > 0);
    this.plan();
    this.paintStanding();
    this.renderStep();
  }

  // A task names a chapter figure by id (fig-cell); the kind that mounts it (cell3d) lives in the
  // chapter's own markup, so read the pairs off the page rather than guessing at the name.
  async loadFigureKinds() {
    this.figureKinds = new Map();
    for (const source of this.sources) {
      const html = await fetch(new URL('index.html', source.url).href).then((r) => (r.ok ? r.text() : '')).catch(() => '');
      const re = /<tb-figure\b[^>]*>/g;
      let m;
      while ((m = re.exec(html))) {
        const kind = /\bkind="([^"]+)"/.exec(m[0])?.[1];
        const id = /\bid="([^"]+)"/.exec(m[0])?.[1];
        if (kind && id) this.figureKinds.set(id, kind);
      }
    }
  }

  build() {
    this.standing = document.createElement('section');
    this.standing.className = 'tb-standing';
    this.run = document.createElement('section');
    this.run.className = 'tb-run';
    this.closing = document.createElement('section');
    this.closing.className = CLOSING_CLASS;
    this.closing.hidden = true;
    this.live = document.createElement('div');
    this.live.className = 'visually-hidden';
    this.live.setAttribute('aria-live', 'polite');
    this.live.setAttribute('aria-atomic', 'true');
    this.replaceChildren(this.standing, this.run, this.closing, this.live);
    this.addEventListener('keydown', (e) => this.onKey(e));
    this.addEventListener('tb-answer', (e) => {
      if (e.detail?.kind === 'task') this.afterTask(e.detail);
    });
  }

  fail(title, body) {
    const box = document.createElement('div');
    box.className = 'tb-unavailable';
    const h = document.createElement('h2');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = body;
    box.append(h, p);
    this.standing.replaceChildren(box);
    // Never a dead end: the book is the thing, and it is one link away.
    const source = this.sources[0];
    if (source) {
      const back = document.createElement('p');
      back.className = 'tb-close__back';
      const a = document.createElement('a');
      a.href = source.href;
      a.textContent = `Read ${source.label}`;
      back.append(a);
      this.run.replaceChildren(back);
    } else {
      this.run.replaceChildren();
    }
  }

  // ----- where you stand -----

  paintStanding() {
    const l = this.l;
    const summary = safe(() => l.store.summary(this.now), null) || {};
    const cards = Object.values(safe(() => l.store.cards(), {}) || {});
    const dueCards = cards.filter((c) => c.state !== 'new' && whenDue(c) !== null && whenDue(c) <= this.now);
    const known = cards.filter((c) => whenDue(c) !== null).length > 0;
    const solid = countOf(summary.learnedWell);
    const shaky = countOf(summary.struggling);
    const blocked = countOf(summary.blocked);
    const fresh = countOf(summary.new);

    const head = document.createElement('h2');
    head.textContent = 'Where you stand';
    const lede = document.createElement('p');
    lede.className = 'tb-standing__lede';

    if (!this.started) {
      const waiting = this.byObjective.size;
      const tooMany = waiting > this.size ? ', which is more than any first morning should try' : '';
      lede.textContent = `You have not answered anything yet, so nothing is scheduled. ${plural(waiting, 'idea in this book has', 'ideas in this book have')} a question waiting${tooMany}. Start instead with a short spread across the chapter — ${plural(this.steps.length, 'question', 'questions')}, about two minutes — and say which of them you already know.`;
      this.standing.replaceChildren(head, lede);
      return;
    }

    const due = known ? dueCards.length : countOf(summary.due);
    const here = [`${plural(solid, 'idea is', 'ideas are')} learned well`];
    if (shaky) here.push(`${plural(shaky, 'is', 'are')} getting shaky`);
    here.push(due ? `${plural(due, 'is', 'are')} due today` : 'nothing is due today');
    const rest = [];
    if (fresh) rest.push(`${plural(fresh, 'has', 'have')} not been started`);
    if (blocked) rest.push(`${plural(blocked, 'is', 'are')} waiting on something you have not learned yet`);
    lede.textContent = rest.length ? `${sentence(here)} Beyond those, ${sentence(rest)}` : sentence(here);

    const nodes = [head, lede];
    // What is shaky, then what is blocked. A blocked objective is always shown even when the shaky
    // ones would fill the list: it is the one thing the queue cannot work on, so a reader who never
    // sees it never learns why it is missing.
    const blockedIds = new Set(namesOf(summary.blocked));
    const strugglers = namesOf(summary.struggling);
    const blocked2 = [...blockedIds].filter((id) => !strugglers.includes(id));
    const named = [...strugglers.slice(0, 4), ...blocked2.slice(0, 2)];
    const overflow = Math.max(0, strugglers.length - 4) + Math.max(0, blocked2.length - 2);
    const list = named.length ? named : cards.filter((c) => c.state === 'lapsed').map((c) => c.objective ?? c.id).slice(0, 4);
    if (list.length) {
      const ul = document.createElement('ul');
      ul.className = 'tb-standing__list';
      for (const id of list) {
        const s = readState(l, id);
        const li = document.createElement('li');
        li.append(markElement(s.state, { word: s.word, detail: s.detail }));
        const a = document.createElement('a');
        a.className = 'tb-standing__statement';
        a.href = this.hrefFor(id);
        a.textContent = s.objective.statement;
        li.append(a);
        const blockers = blockedIds.has(id) || s.flags.includes('blocked') ? this.blockersOf(id) : [];
        if (blockers.length) {
          const why = document.createElement('span');
          why.className = 'tb-standing__blocked';
          why.textContent = `waiting on: ${blockers.join(', ')}`;
          li.append(why);
        }
        ul.append(li);
      }
      if (overflow) {
        const li = document.createElement('li');
        li.className = 'tb-standing__more';
        li.textContent = `and ${overflow} more.`;
        ul.append(li);
      }
      nodes.push(ul);
    }

    const thin = list.map((id) => readState(l, id)).filter((s) => s.evidence > 0 && s.evidence < 3).length;
    if (thin) {
      const caveat = document.createElement('p');
      caveat.className = 'tb-standing__caveat';
      caveat.textContent = `${plural(thin, 'of these rests', 'of these rest')} on one or two answers, which is not much to go on. Treat it as a hunch rather than a measurement.`;
      nodes.push(caveat);
    }
    this.standing.replaceChildren(...nodes);
  }

  blockersOf(id) {
    const l = this.l;
    const prereqs = safe(() => l.prereqsOf?.(id), []) || [];
    return prereqs
      .map((p) => (typeof p === 'string' ? p : p?.id))
      .filter(Boolean)
      .filter((p) => readState(l, p).state !== 'review')
      .map((p) => readState(l, p).objective.statement);
  }

  hrefFor(id) {
    const l = this.l;
    const o = safe(() => l.objective?.(id), null);
    const source = this.home.get(id) || this.sources[0];
    const section = asArray(o?.teaches?.sections)[0];
    return section ? `${source.href}#${section}` : source.href;
  }

  // ----- the plan for this sitting -----

  plan() {
    this.steps = this.started ? this.queueSteps() : this.calibrationSteps();
    this.calibration = !this.started;
    this.at = 0;
  }

  queueSteps() {
    const l = this.l;
    // Ask for more objectives than the sitting needs: many have no question written yet, and one
    // without an item cannot be practised, however due it is.
    const wanted = safe(() => l.store.queue({ size: this.size * 4, now: this.now }), []) || [];
    const steps = [];
    let freeSoFar = 0;
    this.withoutItems = [];
    for (const entry of wanted) {
      const id = typeof entry === 'string' ? entry : entry.objective;
      const pool = this.byObjective.get(id);
      if (!pool?.length) {
        this.withoutItems.push(id);
        continue;
      }
      const item = this.pick(pool, id, freeSoFar >= MAX_FREE);
      if (item.kind === 'free') freeSoFar += 1;
      steps.push({
        objective: id,
        reason: typeof entry === 'string' ? null : entry.reason,
        // The store's own sentence about this pick: the arithmetic behind the reason, in its words.
        evidence: typeof entry === 'string' ? null : entry.why,
        item,
      });
      if (steps.length >= this.size) break;
    }
    return steps;
  }

  // A spread across the chapter rather than everything at once: one item each from objectives taken
  // evenly down the bank, so the first sitting touches the start, the middle and the end.
  calibrationSteps() {
    const ids = [...this.byObjective.keys()];
    const want = Math.min(6, ids.length);
    const steps = [];
    for (let n = 0; n < want; n += 1) {
      const id = ids[Math.round((n * (ids.length - 1)) / Math.max(1, want - 1))];
      if (steps.some((s) => s.objective === id)) continue;
      steps.push({ objective: id, reason: 'calibration', item: this.pick(this.byObjective.get(id), id) });
    }
    this.withoutItems = [];
    return steps;
  }

  // Prefer a format this objective has not been answered in — an objective is only mastered across
  // two — and otherwise rotate by the number of reps, so the same question does not come round twice.
  pick(pool, id, noMoreFree = false) {
    const s = readState(this.l, id);
    const done = new Set(s.formats.map((f) => (typeof f === 'string' ? f : f?.kind)));
    // A sitting of written answers is a different, much longer sitting. Past the cap, this objective
    // is asked in whatever other format it has.
    const allowed = noMoreFree && pool.some((i) => i.kind !== 'free') ? pool.filter((i) => i.kind !== 'free') : pool;
    const fresh = allowed.filter((i) => !done.has(i.kind));
    const list = fresh.length ? fresh : allowed;
    return list[Number(s.card.reps ?? 0) % list.length];
  }

  // ----- one step at a time -----

  renderStep() {
    if (!this.steps.length) {
      this.nothingDue();
      return;
    }
    if (this.at >= this.steps.length) {
      this.finish();
      return;
    }
    const step = this.steps[this.at];
    const item = step.item;
    const head = document.createElement('h2');
    head.className = 'tb-run__head';
    head.textContent = this.calibration ? 'A short calibration' : 'This sitting';

    const wrap = document.createElement('div');
    wrap.className = 'tb-step';
    wrap.setAttribute('role', 'group');

    const meta = document.createElement('p');
    meta.className = 'tb-step__meta';
    const count = document.createElement('span');
    count.className = 'tb-step__count';
    count.textContent = `${this.at + 1} of ${this.steps.length}`;
    meta.append(count);
    const level = safe(() => this.l.objective?.(step.objective)?.level, null);
    if (level) {
      const chip = document.createElement('span');
      chip.className = 'tb-step__level';
      chip.textContent = level;
      meta.append(chip);
    }
    const kindChip = document.createElement('span');
    kindChip.className = 'tb-step__kind';
    kindChip.textContent = item.kind === 'task' ? 'figure task' : item.kind === 'free' ? 'written' : 'multiple choice';
    meta.append(kindChip);
    wrap.append(meta);

    // In a calibration every item has the same reason; saying it once is honest, saying it six times
    // is noise.
    const why = this.calibration && this.at > 0 ? '' : reasonText(step.reason);
    if (why) {
      const p = document.createElement('p');
      p.className = 'tb-step__why';
      const label = document.createElement('span');
      label.className = 'tb-step__whylabel';
      label.textContent = 'Why this';
      p.append(label, why);
      if (step.evidence) {
        const ev = document.createElement('span');
        ev.className = 'tb-step__evidence';
        ev.textContent = step.evidence;
        p.append(ev);
      }
      wrap.append(p);
    }

    step.shownAt = performance.now();
    if (item.kind === 'task') this.renderTask(wrap, step);
    else if (item.kind === 'free') this.renderFree(wrap, step);
    else this.renderChoice(wrap, step);

    wrap.append(this.footFor(step));
    this.run.replaceChildren(head, wrap);
    this.stepEl = wrap;
    // Focus lands on the first control the step is answered with, never on the question itself: a ring
    // around a paragraph reads as a text field, and a reader arriving at the page should be able to
    // read the summary above rather than be scrolled past it.
    this.focusFirstControl(step);
    this.live.textContent = `Question ${this.at + 1} of ${this.steps.length}. ${textOf(item.question || item.goal || '')}`;
  }

  focusFirstControl(step) {
    const inStep = () => !document.activeElement || document.activeElement === document.body || this.stepEl?.contains(document.activeElement);
    if (step.buttons?.length) {
      step.buttons[0].focus({ preventScroll: true });
      return;
    }
    const figure = step.taskEl?.querySelector('tb-figure');
    if (!figure) return;
    const arm = () => {
      if (figure.dataset.state !== 'ready') return false;
      if (inStep()) figure.querySelector('.fig-btn, button, [tabindex]')?.focus({ preventScroll: true });
      return true;
    };
    if (arm()) return;
    const watch = new MutationObserver(() => {
      if (arm()) watch.disconnect();
    });
    watch.observe(figure, { attributes: true, attributeFilter: ['data-state'] });
  }

  // Nothing is due, and that is a real answer rather than an empty page: the reader is told what the
  // queue is waiting for instead of being handed busywork.
  nothingDue() {
    const head = document.createElement('h2');
    head.textContent = 'Nothing is due';
    const p = document.createElement('p');
    p.className = 'tb-run__idle';
    p.textContent = this.withoutItems?.length
      ? `Nothing is due that has a question written for it. ${gap(this.withoutItems.length)}`
      : 'Nothing is due today. Spacing is the point: coming back before you have begun to forget teaches you less, not more.';
    const back = document.createElement('p');
    back.className = 'tb-close__back';
    const a = document.createElement('a');
    a.href = this.sources[0].href;
    a.textContent = `Read ${this.sources[0].label}`;
    back.append(a);
    this.run.replaceChildren(head, p, back);
    this.live.textContent = p.textContent;
  }

  renderChoice(wrap, step) {
    const item = step.item;
    const stem = document.createElement('div');
    stem.className = 'tb-step__stem';
    stem.id = `${this.id || 'sitting'}-stem-${this.at}`;
    stem.append(...fragmentOf(item.question ?? item.stem ?? item.prompt ?? '(this item has no question)'));
    const opts = document.createElement('div');
    opts.className = 'tb-opts';
    opts.setAttribute('role', 'group');
    // The question names the group, so a reader who lands on option A hears what is being asked.
    opts.setAttribute('aria-labelledby', stem.id);
    step.buttons = (item.options || []).map((option, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tb-opt';
      const k = document.createElement('span');
      k.className = 'k';
      k.textContent = LETTERS[i];
      const text = document.createElement('span');
      text.append(...fragmentOf(option.text ?? option.html ?? option.label ?? String(option)));
      b.append(k, text);
      b.addEventListener('click', () => this.answerChoice(step, i));
      opts.append(b);
      return b;
    });
    step.result = document.createElement('div');
    step.result.className = 'tb-step__result';
    wrap.append(stem, opts, step.result);
  }

  // A written answer. Nothing here grades it: the design has the agent round do that, with the
  // reader's own text in the record. What this surface can honestly do is show the points a good
  // answer makes and let the reader mark themselves against them, with the record saying it was
  // self-marked so no later reading mistakes it for a measurement.
  renderFree(wrap, step) {
    const item = step.item;
    const stem = document.createElement('div');
    stem.className = 'tb-step__stem';
    stem.id = `${this.id || 'sitting'}-stem-${this.at}`;
    stem.append(...fragmentOf(item.question ?? item.prompt ?? '(this item has no question)'));

    const box = document.createElement('textarea');
    box.className = 'tb-free__answer';
    box.rows = 6;
    box.setAttribute('aria-labelledby', stem.id);
    box.placeholder = 'Write your answer here. Nothing is checked until you ask.';
    step.answerBox = box;

    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'tb-free__reveal';
    reveal.textContent = 'Show what a good answer makes';
    reveal.addEventListener('click', () => this.revealRubric(step));
    step.revealButton = reveal;

    step.result = document.createElement('div');
    step.result.className = 'tb-step__result';
    wrap.append(stem, box, reveal, step.result);
  }

  revealRubric(step) {
    if (step.revealed) return;
    step.revealed = true;
    step.revealButton.remove();
    const item = step.item;
    const nodes = [];
    const head = document.createElement('h3');
    head.textContent = 'What a good answer makes';
    nodes.push(head);
    const list = document.createElement('ul');
    list.className = 'tb-free__rubric';
    for (const point of item.rubric || []) {
      const li = document.createElement('li');
      li.append(...fragmentOf(point));
      list.append(li);
    }
    nodes.push(list);
    if (item.explain) {
      const e = document.createElement('div');
      e.className = 'tb-explain';
      e.append(...fragmentOf(item.explain));
      nodes.push(e);
    }
    const note = document.createElement('p');
    note.className = 'tb-free__note';
    note.textContent = 'Nothing here marks this for you. Your answer goes into the record with the rest, and the next agent round reads it. Say how you did, and the record will show it was your own judgement.';
    nodes.push(note);
    const group = document.createElement('div');
    group.className = 'tb-free__mark';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'How did your answer do?');
    const options = [['I made those points', 'right'], ['I made some of them', 'partial'], ['I could not answer it', 'wrong']];
    for (const [label, outcome] of options) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tb-free__markbtn';
      b.textContent = label;
      b.addEventListener('click', () => this.markFree(step, outcome));
      group.append(b);
    }
    nodes.push(group);
    step.result.replaceChildren(...nodes);
    group.querySelector('button')?.focus();
  }

  markFree(step, outcome) {
    if (step.done) return;
    step.done = true;
    step.outcome = outcome;
    record({
      objective: step.objective,
      item: step.item.id,
      kind: 'free',
      outcome,
      chose: null,
      ms: Math.round(performance.now() - step.shownAt),
      confidence: 'self',
      source: 'today',
      // The text itself, so the round that grades free responses has something to read.
      text: step.answerBox?.value ?? '',
    });
    const said = document.createElement('p');
    said.className = `tb-verdict ${outcome === 'right' ? 'ok' : outcome === 'wrong' ? 'no' : 'tb-verdict--known'}`;
    said.textContent = outcome === 'right'
      ? 'Recorded as made, on your own judgement.'
      : outcome === 'partial'
        ? 'Recorded as partly made, on your own judgement.'
        : 'Recorded as missed, on your own judgement.';
    step.result.append(said, this.taught(step));
    this.finishStep(step, said.textContent);
  }

  renderTask(wrap, step) {
    const item = step.item;
    const task = document.createElement('tb-task');
    task.id = item.id;
    task.setAttribute('objective', item.objective);
    task.setAttribute('figure', item.figure || '');
    const kind = item.figureKind || this.figureKinds?.get(item.figure);
    if (kind) task.setAttribute('kind', kind);
    task.setAttribute('goal', item.goal ?? item.question ?? '');
    task.setAttribute('expect', item.expect ?? '');
    if (item.alt) task.dataset.alt = item.alt;
    if (item.explain) {
      const explain = document.createElement('p');
      explain.className = 'explain';
      explain.append(...fragmentOf(item.explain));
      task.append(explain);
    }
    step.result = document.createElement('div');
    step.result.className = 'tb-step__result';
    step.taskEl = task;
    wrap.append(task, step.result);
  }

  footFor(step) {
    const foot = document.createElement('div');
    foot.className = 'tb-step__foot';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'tb-step__next';
    next.textContent = this.at + 1 >= this.steps.length ? 'Finish the sitting' : 'Next';
    next.hidden = true;
    next.addEventListener('click', () => this.advance());
    step.nextButton = next;
    foot.append(next);

    if (this.calibration) {
      const known = document.createElement('button');
      known.type = 'button';
      known.className = 'tb-step__known';
      known.textContent = 'I already know this';
      known.addEventListener('click', () => this.selfReport(step));
      step.knownButton = known;
      foot.append(known);
    }
    if (this.answered.length) {
      const stop = document.createElement('button');
      stop.type = 'button';
      stop.className = 'tb-step__stop';
      stop.textContent = 'Finish here';
      stop.addEventListener('click', () => this.finish());
      foot.append(stop);
    }
    return foot;
  }

  // ----- answering -----

  answerChoice(step, index) {
    if (step.done) return;
    step.done = true;
    const option = step.item.options[index];
    const right = Boolean(option.correct);
    const ms = Math.round(performance.now() - step.shownAt);
    step.outcome = right ? 'right' : 'wrong';
    step.chose = LETTERS[index];
    step.buttons.forEach((b, i) => {
      b.disabled = true;
      if (step.item.options[i].correct) b.classList.add('is-correct');
    });
    if (!right) step.buttons[index].classList.add('is-wrong');
    record({
      objective: step.objective,
      item: step.item.id,
      kind: step.item.kind || 'mcq',
      outcome: step.outcome,
      chose: step.chose,
      ms,
      // How many choices there were, so "right at about the rate of guessing" can be worked out.
      options: step.item.options.length,
      confidence: null,
      source: 'today',
    });
    this.afterAnswer(step, right, option.why);
  }

  afterTask(detail) {
    const step = this.steps[this.at];
    if (!step || step.done) return;
    step.done = true;
    step.outcome = detail.outcome;
    if (detail.outcome === 'right' || detail.outcome === 'wrong') this.afterAnswer(step, detail.outcome === 'right', null, { quiet: true });
    else this.afterAnswer(step, null, null, { quiet: true });
  }

  selfReport(step) {
    if (step.done) return;
    step.done = true;
    step.outcome = 'known';
    step.buttons?.forEach((b) => { b.disabled = true; });
    record({
      objective: step.objective,
      item: step.item.id,
      kind: 'self-report',
      outcome: 'right',
      chose: null,
      ms: Math.round(performance.now() - step.shownAt),
      confidence: 'known',
      source: 'today',
    });
    const said = document.createElement('p');
    said.className = 'tb-verdict tb-verdict--known';
    said.textContent = 'Taken on your word. It will still come round once to check.';
    step.result.replaceChildren(said, this.taught(step));
    this.finishStep(step, said.textContent);
  }

  afterAnswer(step, right, why, { quiet = false } = {}) {
    const nodes = [];
    if (!quiet) {
      const verdict = document.createElement('p');
      verdict.className = `tb-verdict ${right ? 'ok' : 'no'}`;
      verdict.textContent = right ? 'Right.' : 'Not quite.';
      nodes.push(verdict);
      if (!right && why) {
        const w = document.createElement('p');
        w.className = 'tb-explain tb-explain--why';
        w.append(...fragmentOf(why));
        nodes.push(w);
      }
      if (step.item.explain) {
        const e = document.createElement('div');
        e.className = 'tb-explain';
        e.append(...fragmentOf(step.item.explain));
        nodes.push(e);
      }
    }
    nodes.push(this.taught(step));
    step.result.replaceChildren(...nodes);
    this.finishStep(step, quiet ? '' : `${right ? 'Right.' : 'Not quite.'} ${textOf(step.item.explain || '')}`);
  }

  // What this item was really asking, and where the book says it. Shown only after answering, so it
  // never gives the answer away.
  taught(step) {
    const p = document.createElement('p');
    p.className = 'tb-step__taught';
    const s = readState(this.l, step.objective);
    p.append('This tested: ');
    const a = document.createElement('a');
    a.href = this.hrefFor(step.objective);
    a.textContent = s.objective.statement;
    p.append(a);
    return p;
  }

  finishStep(step, spoken) {
    step.knownButton?.remove();
    step.nextButton.hidden = false;
    step.nextButton.focus();
    this.answered.push(step);
    if (spoken) this.live.textContent = spoken;
  }

  advance() {
    this.at += 1;
    this.renderStep();
  }

  onKey(e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const step = this.steps?.[this.at];
    if (!step) return;
    const onControl = e.target instanceof HTMLElement && e.target.closest('button, a, input, select, textarea, canvas, [contenteditable]');
    if (!step.done && step.buttons?.length) {
      const key = e.key.toUpperCase();
      const byLetter = LETTERS.indexOf(key);
      const byDigit = /^[1-9]$/.test(e.key) ? Number(e.key) - 1 : -1;
      const index = byLetter >= 0 ? byLetter : byDigit;
      if (index >= 0 && index < step.buttons.length) {
        e.preventDefault();
        this.answerChoice(step, index);
        return;
      }
    }
    if (step.done && (e.key === 'Enter' || e.key === 'n' || e.key === 'N') && !onControl) {
      e.preventDefault();
      this.advance();
    }
  }

  // ----- the closing summary -----

  finish() {
    const done = this.answered;
    const right = done.filter((s) => s.outcome === 'right').length;
    const wrong = done.filter((s) => s.outcome === 'wrong');
    // A written answer the reader marked as partly made: it moved the card and it still wants a
    // second look, so it is counted in the total and listed under what to come back to.
    const partial = done.filter((s) => s.outcome === 'partial');
    const known = done.filter((s) => s.outcome === 'known');
    const skipped = done.filter((s) => s.outcome === 'skipped' || s.outcome === 'broken');

    const head = document.createElement('h2');
    head.textContent = 'That sitting';
    const lede = document.createElement('p');
    lede.className = 'tb-close__lede';
    if (!done.length) {
      lede.textContent = 'Nothing answered this time. The queue is where you left it.';
    } else {
      const graded = done.filter((s) => ['right', 'wrong', 'partial'].includes(s.outcome)).length;
      const bits = [`${plural(graded, 'question', 'questions')} answered, ${right} right`];
      if (partial.length) bits.push(`${partial.length} partly made`);
      if (known.length) bits.push(`${known.length} taken on your word`);
      if (skipped.length) bits.push(`${skipped.length} skipped because the figure could not run`);
      lede.textContent = sentence(bits);
    }
    const nodes = [head, lede];

    const moved = done.filter((s) => s.outcome === 'right' || s.outcome === 'known');
    if (moved.length) {
      nodes.push(heading3('What moved'), this.objectiveList(moved));
    }
    const again = [...wrong, ...partial];
    if (again.length) {
      nodes.push(heading3('Look at these again'));
      const where = document.createElement('p');
      where.className = 'tb-close__where';
      where.textContent = 'Each one links to the section of the book that teaches it.';
      nodes.push(where, this.objectiveList(again));
    }
    if (this.withoutItems?.length) {
      const p = document.createElement('p');
      p.className = 'tb-close__gap';
      p.textContent = gap(this.withoutItems.length);
      nodes.push(p);
    }
    const back = document.createElement('p');
    back.className = 'tb-close__back';
    const a = document.createElement('a');
    a.href = this.sources[0].href;
    a.textContent = `Back to ${this.sources[0].label}`;
    back.append(a);
    nodes.push(back);

    this.closing.replaceChildren(...nodes);
    this.closing.hidden = false;
    this.run.replaceChildren();
    // The record has moved under us, so the summary is read again rather than left as it was.
    this.started = this.started || done.length > 0;
    this.paintStanding();
    head.tabIndex = -1;
    head.focus();
    this.live.textContent = lede.textContent;
  }

  objectiveList(steps) {
    const ul = document.createElement('ul');
    ul.className = 'tb-close__list';
    const seen = new Set();
    for (const step of steps) {
      if (seen.has(step.objective)) continue;
      seen.add(step.objective);
      const s = readState(this.l, step.objective);
      const li = document.createElement('li');
      li.append(markElement(s.state, { word: s.word, detail: s.detail }));
      const a = document.createElement('a');
      a.className = 'tb-close__statement';
      a.href = this.hrefFor(step.objective);
      a.textContent = s.objective.statement;
      li.append(a);
      ul.append(li);
    }
    return ul;
  }

  describe() {
    return {
      steps: this.steps?.length ?? 0,
      at: this.at ?? 0,
      calibration: Boolean(this.calibration),
      answered: this.answered.map((s) => ({ objective: s.objective, item: s.item.id, kind: s.item.kind, outcome: s.outcome, chose: s.chose ?? null })),
      finished: !this.closing.hidden,
      items: this.items?.length ?? 0,
    };
  }
}

function heading3(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

// Item text is authored HTML in a data module, and a question is prose: it may carry <em>, <strong>
// and the like. Everything else is unwrapped, and every attribute is dropped, so a bank can never
// bring script, styling or a link onto this page.
const INLINE = new Set(['EM', 'STRONG', 'B', 'I', 'CODE', 'SUB', 'SUP', 'BR', 'SMALL', 'VAR', 'ABBR', 'Q', 'SPAN', 'P', 'UL', 'OL', 'LI']);

export function fragmentOf(html) {
  const box = document.createElement('div');
  box.innerHTML = String(html ?? '');
  for (const el of [...box.querySelectorAll('*')]) {
    if (INLINE.has(el.tagName)) {
      for (const attr of [...el.attributes]) el.removeAttribute(attr.name);
    } else {
      el.replaceWith(...el.childNodes);
    }
  }
  return [...box.childNodes];
}

function textOf(html) {
  const box = document.createElement('div');
  box.innerHTML = String(html ?? '');
  return box.textContent.trim();
}

customElements.define('tb-mastery', TbMastery);
customElements.define('tb-sitting', TbSitting);

// A chapter annotates itself: no chapter markup is needed, and <main data-no-mastery> opts out.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => annotateChapter());
else annotateChapter();
