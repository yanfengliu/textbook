// npm run check: static checks over every chapter page's authored HTML.
//
// Claim: for each chapter page, every <tb-figure> has a registered kind, a unique id, a <figcaption>
// and a data-alt; every <tb-term ref> names an entry in that chapter's glossary.js and every glossary
// entry is used; every <tb-check> has a question, at least two options, exactly one data-correct and an
// explanation; every <tb-sort> has at least two bins, and every item names a bin and carries a data-why;
// every id in the document is unique; there is exactly one <h1>, on a chapter page (main[data-chapter])
// every <h2> is the direct child of a <section id> so the shell can number it, and no heading level is
// skipped; every "Figure N.M" mentioned in the prose exists and
// every figure is mentioned at least once; every relative href resolves to a file; the closing
// <a class="tb-next"> points at the next chapter whenever that chapter's directory is on disk, names its
// number, and does not call it unwritten; every objective's
// prerequisites resolve, in this chapter or another, with no cycle inside the chapter; and no TODO,
// FIXME, XXX or lorem is left in the page. For the study data (checkChapterData, checkStudySources):
// every figure task's `expect` is one the grader's own parser can evaluate against some figure
// (expectProblems in src/components/task.js — a clause no figure state can satisfy fails here, not
// in a sitting); and every chapter that has an items.js is listed as a tb-source, under the chapter
// id the store files it by, on every page that carries a <tb-sitting>, and at least one page does.
// Which chapters a page says can be read (checkChapterAvailability): a book's contents page links and
// tags each chapter exactly as its directory's presence on disk says, and the library page's shelf
// cards and README.md claim no chapter list or count the disk contradicts. Its own bound, prose it
// cannot parse, is stated beside it.
//
// Bound: it reads the authored HTML with a small tolerant tokenizer, not the rendered DOM, so it knows
// nothing about what the scripts produce (numbering, popovers, figure content) and nothing about
// pixels. The tokenizer handles the markup this repo writes; it is not an HTML5 parser. The expect
// check knows the grammar and not the figure: a path a figure does not report is found only by
// grading against that figure's describe().
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expectProblems } from '../src/components/task.js';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);

// The ways a closing card has said "the chapter after this one does not exist yet". The list is the
// bound of that half of the card rule: a card that says it some other way passes here and is caught by
// the href half, which does not depend on wording.
const UNWRITTEN = ['in preparation', 'coming soon', 'not yet written', 'being written', 'yet to be written', 'to come'];

// Tokenise HTML into a tree of { tag, attrs, children, text }. Text nodes are { text }.
export function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const tagRe = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/gi;
  let last = 0;
  let m;
  while ((m = tagRe.exec(html))) {
    if (m.index > last) stack[stack.length - 1].children.push({ text: html.slice(last, m.index) });
    last = tagRe.lastIndex;
    if (m[0].startsWith('<!--') || m[0].toLowerCase().startsWith('<!doctype')) continue;
    if (m[1]) {
      const name = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const name = m[2].toLowerCase();
    const attrs = {};
    const attrRe = /([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    while ((a = attrRe.exec(m[3] || ''))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    const node = { tag: name, attrs, children: [], line: html.slice(0, m.index).split('\n').length };
    stack[stack.length - 1].children.push(node);
    if (RAW.has(name)) {
      const close = html.indexOf(`</${name}`, last);
      const end = close === -1 ? html.length : close;
      node.children.push({ text: html.slice(last, end) });
      tagRe.lastIndex = end;
      last = end;
      continue;
    }
    if (!VOID.has(name) && !m[4]) stack.push(node);
  }
  if (last < html.length) root.children.push({ text: html.slice(last) });
  return root;
}

export function walk(node, fn, parent = null) {
  fn(node, parent);
  for (const c of node.children || []) walk(c, fn, node);
}

export function findAll(node, pred) {
  const out = [];
  walk(node, (n, p) => {
    if (n.tag && pred(n, p)) out.push(n);
  });
  return out;
}

export function textOf(node) {
  if (node.text !== undefined) return node.text;
  return (node.children || []).map(textOf).join('');
}

function hasClass(node, cls) {
  return (node.attrs.class || '').split(/\s+/).includes(cls);
}

// Check one document. Returns an array of failure strings (empty means the document passes).
export function checkDocument(html, { glossary = {}, kinds = [], objectives = [], file = 'document', resolveHref = null, nextChapter = null } = {}) {
  const fails = [];
  const doc = parseHtml(html);
  const fail = (msg, node) => fails.push(`${file}${node?.line ? `:${node.line}` : ''}: ${msg}`);

  // The word the prose cites a figure with. This was the literal `Figure`, which made the rule
  // unpassable on a page whose prose is not English: a Chinese chapter writes 图 1.1, the rule looked
  // for `Figure\s+1\.1`, and every figure on the page failed as "never mentioned in the prose" — a
  // failure that cannot be fixed from the page side without writing the English word into Chinese
  // prose. Found 2026-09-12 while adding the 資治通鑑 book, and the bilingual plan
  // (docs/design/i18n.md) had already recorded the same finding for its own chapters.
  //
  // Chosen from the page's own `<html lang>`, defaulting to English: an English page is unaffected, and
  // a page in another language states its own token. `\s*` rather than `\s+` because Chinese needs no
  // space between the token and the number. A language with no token here keeps the English one and is
  // not silently exempted — the rule still runs and still fails, which is the honest outcome.
  //
  // The Chinese token is a list, and both spellings are accepted: 图 is what a Simplified page writes
  // and 圖 is what a Traditional one writes (the 資治通鑑 book was converted from one to the other on
  // 2026-09-18). This checker's claim is that the prose cites the figure, not which script the page is
  // set in — the script has its own gate, `test/lexicon.test.js`, "the book is set in Simplified" — and
  // a red here for a script reason would report the wrong defect on a correct page.
  const FIGURE_TOKENS = { en: 'Figure', zh: '图' };
  const ZH_FIGURE_WORDS = ['图', '圖'];
  const lang = (findAll(doc, (n) => n.tag === 'html')[0]?.attrs.lang || 'en').toLowerCase();
  const figureWord = FIGURE_TOKENS[lang.split('-')[0]] ?? FIGURE_TOKENS.en;
  const figurePattern = lang.split('-')[0] === 'zh' ? ZH_FIGURE_WORDS.join('|') : figureWord;

  // ids unique
  const ids = new Map();
  walk(doc, (n) => {
    if (n.tag && n.attrs.id !== undefined) {
      if (ids.has(n.attrs.id)) fail(`id "${n.attrs.id}" is used twice (first at line ${ids.get(n.attrs.id)})`, n);
      else ids.set(n.attrs.id, n.line);
    }
  });

  // figures
  const figures = findAll(doc, (n) => n.tag === 'tb-figure');
  figures.forEach((f, i) => {
    const kind = f.attrs.kind;
    if (!kind) fail('<tb-figure> has no kind', f);
    else if (!kinds.includes(kind)) fail(`<tb-figure kind="${kind}"> is not a registered kind (registered: ${kinds.join(', ')})`, f);
    if (!f.attrs.id) fail(`<tb-figure kind="${kind}"> (figure ${i + 1}) has no id`, f);
    if (!findAll(f, (n) => n.tag === 'figcaption').length) fail(`<tb-figure id="${f.attrs.id}"> has no <figcaption>`, f);
    if (!f.attrs['data-alt'] || f.attrs['data-alt'].trim().length < 40) fail(`<tb-figure id="${f.attrs.id}"> needs a data-alt of at least 40 characters describing what a sighted reader learns`, f);
  });

  // figure mentions in prose
  const chapter = findAll(doc, (n) => n.tag === 'main' && n.attrs['data-chapter'] !== undefined)[0]?.attrs['data-chapter'];
  if (chapter !== undefined) {
    const prose = findAll(doc, (n) => n.tag === 'p' || n.tag === 'li' || n.tag === 'aside').filter((n) => !findAll(n, (x) => x.tag === 'figcaption').length);
    const mentioned = new Set();
    const re = new RegExp(`(?:${figurePattern})\\s*${chapter}\\.(\\d+)`, 'g');
    for (const p of prose) {
      let m;
      const t = textOf(p);
      while ((m = re.exec(t))) mentioned.add(Number(m[1]));
    }
    for (const n of mentioned) if (n < 1 || n > figures.length) fail(`prose mentions ${figureWord} ${chapter}.${n} but the chapter has ${figures.length} figures`);
    figures.forEach((f, i) => {
      if (!mentioned.has(i + 1)) fail(`${figureWord} ${chapter}.${i + 1} (<tb-figure id="${f.attrs.id}">) is never mentioned in the prose`, f);
    });
  }

  // terms
  const terms = findAll(doc, (n) => n.tag === 'tb-term');
  const used = new Set();
  for (const t of terms) {
    const ref = t.attrs.ref;
    if (!ref) fail('<tb-term> has no ref', t);
    else if (!glossary[ref]) fail(`<tb-term ref="${ref}"> has no glossary entry`, t);
    else used.add(ref);
    if (!textOf(t).trim()) fail(`<tb-term ref="${ref}"> has no text`, t);
  }
  if (findAll(doc, (n) => n.tag === 'tb-glossary').length) {
    for (const ref of Object.keys(glossary)) if (!used.has(ref)) fail(`glossary entry "${ref}" is never used as a <tb-term> in the chapter`);
    for (const [ref, e] of Object.entries(glossary)) {
      if (!e || !e.term || !e.def) fail(`glossary entry "${ref}" needs both term and def`);
    }
  }

  // checks
  for (const c of findAll(doc, (n) => n.tag === 'tb-check')) {
    const id = c.attrs.id || '(no id)';
    if (!findAll(c, (n) => hasClass(n, 'question')).length) fail(`<tb-check id="${id}"> has no .question`, c);
    const optionsList = findAll(c, (n) => hasClass(n, 'options'))[0];
    const options = optionsList ? optionsList.children.filter((n) => n.tag === 'li') : [];
    if (options.length < 2) fail(`<tb-check id="${id}"> needs at least two options, has ${options.length}`, c);
    const correct = options.filter((o) => o.attrs['data-correct'] !== undefined).length;
    if (correct !== 1) fail(`<tb-check id="${id}"> needs exactly one data-correct option, has ${correct}`, c);
    if (!findAll(c, (n) => hasClass(n, 'explain')).length) fail(`<tb-check id="${id}"> has no .explain`, c);
  }

  // sorts
  for (const s of findAll(doc, (n) => n.tag === 'tb-sort')) {
    const id = s.attrs.id || '(no id)';
    const binsList = findAll(s, (n) => hasClass(n, 'bins'))[0];
    const bins = binsList ? binsList.children.filter((n) => n.tag === 'li').map((n) => n.attrs['data-bin']) : [];
    if (bins.length < 2) fail(`<tb-sort id="${id}"> needs at least two bins, has ${bins.length}`, s);
    const itemsList = findAll(s, (n) => hasClass(n, 'items'))[0];
    const items = itemsList ? itemsList.children.filter((n) => n.tag === 'li') : [];
    if (items.length < 2) fail(`<tb-sort id="${id}"> needs at least two items, has ${items.length}`, s);
    for (const it of items) {
      const name = textOf(it).trim();
      if (!bins.includes(it.attrs['data-bin'])) fail(`<tb-sort id="${id}"> item "${name}" names bin "${it.attrs['data-bin']}", which is not one of ${bins.join(', ')}`, it);
      if (!it.attrs['data-why']) fail(`<tb-sort id="${id}"> item "${name}" has no data-why`, it);
    }
  }

  // headings
  const h1s = findAll(doc, (n) => n.tag === 'h1');
  if (h1s.length !== 1) fail(`expected exactly one <h1>, found ${h1s.length}`);
  let lastLevel = 1;
  walk(doc, (n, p) => {
    if (!n.tag || !/^h[2-4]$/.test(n.tag)) return;
    const level = Number(n.tag[1]);
    if (chapter !== undefined && n.tag === 'h2' && !(p && p.tag === 'section' && p.attrs.id)) fail(`<h2> "${textOf(n).trim()}" is not the direct child of a <section id>`, n);
    if (level > lastLevel + 1) fail(`heading level skips from h${lastLevel} to ${n.tag} at "${textOf(n).trim()}"`, n);
    lastLevel = level;
  });

  // hrefs
  if (resolveHref) {
    for (const a of findAll(doc, (n) => n.tag === 'a' || n.tag === 'link')) {
      const href = a.attrs.href;
      if (!href || /^(https?:|mailto:|#|\/\/)/.test(href)) continue;
      if (href.startsWith('#')) continue;
      const path = href.split('#')[0].split('?')[0];
      if (!path) continue;
      if (!resolveHref(path)) fail(`href "${href}" does not resolve to a file`, a);
    }
    for (const id of findAll(doc, (n) => n.tag === 'a' && n.attrs.href?.startsWith('#')).map((n) => n.attrs.href.slice(1))) {
      if (id && !ids.has(id)) fail(`href "#${id}" points at no element with that id`);
    }
  }

  // The closing card. It is authored by hand and nothing repoints it when the next chapter lands, so it
  // goes stale silently: chapters 1 and 2 told readers the next chapter was in preparation for six days
  // while it sat finished on disk beside them, and chapter 3 then did the same for chapter 4. The href
  // rule alone cannot catch it — `href="../"` resolves to the book page, which exists — so the fact the
  // card has to be checked against is the tree, not the link.
  //
  // Bound: a page that carries an <a class="tb-next">, and only when a later chapter directory exists in
  // the same book (main() supplies it). The last chapter's card points at the book page and is right to,
  // so no rule fires there. A chapter with no card at all is not checked — the 資治通鑑 chapters have
  // none, and requiring one of them is a decision about that book, not a defect this rule saw.
  if (nextChapter) {
    // "../ch04-membranes-and-transport/", "../ch04-membranes-and-transport" and ".../index.html" are one
    // destination; "../" is not.
    const aim = (h) => posix.normalize(h.replace(/(^|\/)index\.html$/, '$1')).replace(/\/+$/, '');
    const want = `../${nextChapter.dir}/`;
    for (const card of findAll(doc, (n) => n.tag === 'a' && hasClass(n, 'tb-next'))) {
      const href = (card.attrs.href || '').split('#')[0].split('?')[0];
      if (aim(href) !== aim(want)) {
        fail(`<a class="tb-next" href="${href}"> does not point at the next chapter, which is on disk at ${nextChapter.path}/; write href="${want}". A reader finishing this chapter is sent somewhere else while the chapter that follows it sits written`, card);
      }
      const stated = /^\s*(\d+)/.exec(textOf(findAll(card, (n) => n.tag === 'strong')[0] ?? { text: '' }));
      if (stated && Number(stated[1]) !== nextChapter.number) {
        fail(`<a class="tb-next"> announces chapter ${stated[1]} and the chapter that follows this one on disk is ${nextChapter.number} (${nextChapter.path}/)`, card);
      }
      const words = textOf(card).toLowerCase();
      for (const phrase of UNWRITTEN) {
        if (words.includes(phrase)) fail(`<a class="tb-next"> tells the reader the next chapter is "${phrase}" and ${nextChapter.path}/ is on disk; say what that chapter is about instead`, card);
      }
    }
  }

  // every question names the objective it tests, and that objective exists
  if (objectives.length) {
    const known = new Set(objectives.map((o) => o.id));
    for (const q of findAll(doc, (n) => n.tag === 'tb-check' || n.tag === 'tb-sort')) {
      const ref = q.attrs.objective;
      const id = q.attrs.id || '(no id)';
      if (!ref) fail(`<${q.tag} id="${id}"> names no objective; add objective="<id>" from objectives.js`, q);
      else if (!known.has(ref)) fail(`<${q.tag} id="${id}"> names objective "${ref}", which is not in objectives.js (known: ${[...known].slice(0, 4).join(', ')}…)`, q);
    }
  }

  // leftovers
  const bodyText = textOf(doc);
  for (const word of ['TODO', 'FIXME', 'XXX', 'lorem ipsum']) {
    if (bodyText.toLowerCase().includes(word.toLowerCase())) fail(`the page still contains "${word}"`);
  }
  return fails;
}

// Check a chapter's objective graph and its review item bank. Separate from checkDocument because
// these are data files, not markup: the prose check reads HTML, this reads what the adaptive study
// system (docs/design/adaptive.md) runs on. Bound: structure and cross-references only. It cannot
// tell a good question from a bad one, which is what the agent's rounds and the owner's reading are for.
export function checkChapterData({ objectives = [], items = [], sections = [], figures = [], kinds = [], otherChapterObjectiveIds = [], file = 'chapter', itemsFile = file } = {}) {
  const fails = [];
  const fail = (msg) => fails.push(`${file}: ${msg}`);
  // A problem in an item is named against the bank it lives in, not the objective file beside it.
  const failItem = (msg) => fails.push(`${itemsFile}: ${msg}`);
  if (!objectives.length) return fails;

  const byId = new Map();
  for (const o of objectives) {
    if (!o.id) fail('an objective has no id');
    else if (byId.has(o.id)) fail(`objective id "${o.id}" is used twice`);
    else byId.set(o.id, o);
    if (!o.statement || o.statement.length < 20) fail(`objective "${o.id}" needs a statement saying what the reader can do`);
    if (!['recall', 'explain', 'apply'].includes(o.level)) fail(`objective "${o.id}" has level "${o.level}"; expected recall, explain or apply`);
    for (const s of o.teaches?.sections ?? []) {
      if (sections.length && !sections.includes(s)) fail(`objective "${o.id}" is taught by section "${s}", which the chapter does not have`);
    }
    for (const f of o.teaches?.figures ?? []) {
      if (figures.length && !figures.includes(f)) fail(`objective "${o.id}" is taught by figure "${f}", which the chapter does not have`);
    }
    if (!(o.teaches?.sections ?? []).length) fail(`objective "${o.id}" names no section that teaches it`);
  }
  // A prerequisite may live in an earlier chapter: that is what makes the study queue work across the
  // book rather than within one chapter, and `src/learning/objectives.js` resolves them that way at
  // runtime. The first version of this check looked only at the chapter's own array and reported every
  // one of them as unresolved, which is how both chapter 2 and chapter 3 first came back red.
  const elsewhere = new Set(otherChapterObjectiveIds);
  for (const o of objectives) {
    for (const p of o.prereqs ?? []) {
      if (byId.has(p) || elsewhere.has(p)) continue;
      fail(`objective "${o.id}" requires "${p}", which is not an objective of this chapter or of any other`);
    }
  }
  // A cycle in the prerequisite graph would hang the queue: it would look for a foundation forever.
  // Only within this chapter: a cross-chapter cycle would need every chapter at once, which
  // `validate()` in src/learning/objectives.js does at runtime over the whole registered book.
  const mark = new Map();
  const walk = (id, trail) => {
    if (mark.get(id) === 'done') return;
    if (mark.get(id) === 'open') {
      fail(`the prerequisites form a cycle: ${[...trail, id].join(' -> ')}`);
      return;
    }
    mark.set(id, 'open');
    for (const p of byId.get(id)?.prereqs ?? []) if (byId.has(p)) walk(p, [...trail, id]);
    mark.set(id, 'done');
  };
  for (const o of objectives) walk(o.id, []);

  // The item bank
  const seen = new Set();
  const perObjective = new Map([...byId.keys()].map((id) => [id, 0]));
  for (const it of items) {
    const id = it.id || '(no id)';
    if (!it.id) failItem('an item has no id');
    else if (seen.has(it.id)) failItem(`item id "${it.id}" is used twice`);
    else seen.add(it.id);
    if (!byId.has(it.objective)) failItem(`item "${id}" tests objective "${it.objective}", which this chapter does not declare`);
    else perObjective.set(it.objective, perObjective.get(it.objective) + 1);
    if (!it.explain) failItem(`item "${id}" has no explanation, so a reader who gets it wrong learns nothing`);
    if (it.kind === 'mcq') {
      const options = it.options ?? [];
      if (options.length < 2) failItem(`item "${id}" has ${options.length} option(s); a multiple choice needs at least two`);
      const correct = options.filter((o) => o.correct).length;
      if (correct !== 1) failItem(`item "${id}" has ${correct} correct options; exactly one is required`);
      for (const o of options) {
        if (!o.correct && !o.why) failItem(`item "${id}" has a distractor with no "why"; a distractor must say what choosing it reveals`);
      }
    } else if (it.kind === 'task') {
      if (!it.figure) failItem(`item "${id}" is a task with no figure`);
      else if (figures.length && !figures.includes(it.figure)) failItem(`item "${id}" sets a task on figure "${it.figure}", which the chapter does not have`);
      if (!it.expect) failItem(`item "${id}" is a task with no "expect", so nothing can grade it`);
      // Parsed by the grader's own parser, because the claim is "the grader can evaluate this" and
      // only the grader can make it. Chapter 2 shipped `heat.comparisonC > heat.waterC`: this check
      // passed it, the grammar has no second path, and it threw on every grade until the author re-ran
      // all 26 expectations against recorded describe() snapshots by hand. The next author would not.
      else for (const p of expectProblems(it.expect)) failItem(`item "${id}" has an expect no figure state can satisfy: ${p}`);
    } else if (it.kind === 'free') {
      if (!(it.rubric ?? []).length) failItem(`item "${id}" is free response with no rubric, so nothing can grade it`);
    } else {
      failItem(`item "${id}" has kind "${it.kind}"; expected mcq, task or free`);
    }
  }
  // Not `if (items.length)`. Guarding this rule on the thing it checks made it silently skip the one
  // case it exists for: a chapter with objectives and no items at all passed, and chapters 2 and 3 did
  // exactly that — written, gated green, and invisible to the spaced-repetition queue, because every
  // objective had zero items and zero is not less than three when the loop never runs.
  if (objectives.length) {
    if (!items.length) {
      fail(`${file} declares ${objectives.length} objective(s) and has no items.js, so nothing it teaches can ever be reviewed`);
    } else {
      for (const [id, n] of perObjective) {
        if (n < 3) fail(`objective "${id}" has ${n} item(s); the review queue needs at least three so a reader cannot memorise the one`);
      }
    }
  }
  return fails;
}

// The study page lists the banks it studies from as <a class="tb-source" href data-key> inside
// <tb-sitting>: src/components/mastery.js reads objectives.js and items.js from the href and registers
// the objectives under data-key, which is the chapter id (`<book>/chNN`) the store files them by.
// There is no build step, so that list is authored by hand, and a chapter with a bank that is not on
// it is invisible to every sitting: chapter 2 sat there with 105 items across 35 objectives while
// Today said 33 ideas were waiting, and `npm run sitting` passed having never asked one of them.
//
// Claim: every chapter that has an items.js is listed on this page, by an href that resolves to that
// chapter and a data-key equal to its chapter id, and no two sources share a key (register() keeps one
// chapter per key, so the second would replace the first). Given no bank at all it fails rather than
// passing, because a check that found nothing has checked nothing. Bound: one book, one study page —
// it asks that THIS page list every bank on disk. A second study page for a second book would fail
// here on the first book's chapters, loudly, and the rule would then need a book column.
export function checkStudySources({ html, banks = [], pageDir = 'today', file = 'today/index.html' } = {}) {
  const fails = [];
  const fail = (msg, node) => fails.push(`${file}${node?.line ? `:${node.line}` : ''}: ${msg}`);
  const doc = parseHtml(html);
  const sittings = findAll(doc, (n) => n.tag === 'tb-sitting');
  if (!sittings.length) {
    fail('has no <tb-sitting>, so nothing on it can list a chapter to study from');
    return fails;
  }
  if (!banks.length) {
    fail('the study-source check was given no chapter with an items.js, so it has nothing to check; the walk that finds item banks is broken, because chapters 1 and 2 have one');
    return fails;
  }
  const byDir = new Map();
  const keys = new Map();
  for (const a of sittings.flatMap((s) => findAll(s, (n) => n.tag === 'a' && hasClass(n, 'tb-source')))) {
    const href = a.attrs.href || '';
    byDir.set(posix.normalize(posix.join(pageDir, href)).replace(/\/$/, ''), a);
    const key = a.attrs['data-key'];
    if (!key) fail(`<a class="tb-source" href="${href}"> has no data-key; the store files that chapter's objectives under it, so write data-key="<book>/chNN"`, a);
    else if (keys.has(key)) fail(`two sources share data-key="${key}" (the first is at line ${keys.get(key)}); register() keeps one chapter per key, so the second replaces the first`, a);
    else keys.set(key, a.line);
  }
  for (const b of banks) {
    const element = `<a class="tb-source" href="${posix.relative(pageDir, b.dir)}/" data-key="${b.key}">${b.number} · ${b.title}</a>`;
    const a = byDir.get(b.dir);
    if (!a) {
      fail(`${b.dir}/items.js exists (${b.items} items) and no tb-source in ${file} points at it, so no sitting can ask one of them; add inside <tb-sitting>: ${element}`);
    } else if (a.attrs['data-key'] !== b.key) {
      fail(`the source for ${b.dir} has data-key="${a.attrs['data-key'] ?? ''}" and the chapter id is "${b.key}"; write ${element}`, a);
    }
  }
  return fails;
}

// ── Which chapters a page says can be read, against the chapter directories on disk ─────────────────
//
// Five times a page has told readers a finished chapter was not written: the book's contents page for
// chapters 2 and 3 (6d854cf, both on disk and listed "In preparation"), chapter 4's closing card, the
// contents page again for chapters 4 and 5, and then the library page and README.md, which said
// "Chapter 1, “What is life?”, is ready; thirty-one more are outlined" with five chapters published.
// The closing-card rule in checkDocument covers one of those places. The fact every one of them has to
// be checked against is the tree, never the page, so this rule is handed the chapter directories.
//
// Claim, in two halves.
//   The contents: on a book's own index.html, every <li> of an <ol class="chapters"> is read by the
//   number in its <span class="n">. A chapter whose chNN- directory is on disk must be an <a> whose href
//   is that directory and whose .tag is the page language's word for readable (English "Read"); one
//   whose directory is absent must be a .soon line with no link, tagged with the word for unwritten
//   ("In preparation"). Every chapter directory on disk must have a line, and no number may be listed
//   twice. A contents page with no list at all, or a line with no number, fails rather than passing:
//   a check that cannot find its subject has checked nothing.
//   The prose: on the library page (index.html), each shelf card <a class="book" href="<book>/"> is read
//   as a statement about that book; in README.md, each paragraph is read as a statement about the book
//   whose title (its contents page's <h1>) it names. A sentence naming chapters as ready ("Chapter 1 …
//   is ready", "Chapters 1 to 5 are written", "the first five chapters are ready") is read as the whole
//   list and must name exactly the chapters on disk; a count ("five chapters are ready") must be their
//   number; "N more are outlined" must be the lines in the contents minus the chapters on disk; and a
//   chapter called unwritten ("chapter 6 is in preparation") must not be on disk. A statement in a place
//   the rule cannot tie to one book fails and says so.
//
// Bound: prose it cannot parse. The prose half recognises the English sentence shapes above, with the
// number written as digits or as a word up to ninety-nine; a claim made any other way ("everything up
// to membranes", "half the book", a sentence in Chinese) passes unread. It reads only the library page's
// shelf cards and README.md — not chapter prose, not docs/ (docs/design/textbook.md's status line is
// prose this rule never sees), and not the pages outside a book. The contents half reads structure,
// not wording, except for the one tag word per state, and it knows those words only for the languages
// in CONTENTS_TAGS; a book in another language fails until its words are added.
//
// The Chinese words are accepted in both scripts, for the reason FIGURE_TOKENS accepts 图 and 圖: this
// rule's claim is which chapters can be read, and the script has its own gate (test/lexicon.test.js).
// The first word of each list is the one a failure tells the author to write.
const CONTENTS_TAGS = {
  en: { ready: ['Read'], soon: ['In preparation'] },
  zh: { ready: ['可读', '可讀'], soon: ['未写', '未寫'] },
};

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_WORDS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const NUM = `(\\d+|(?:${Object.keys(TENS_WORDS).join('|')})(?:[-\\s](?:${NUMBER_WORDS.slice(1, 10).join('|')}))?|${[...NUMBER_WORDS].reverse().join('|')})`;
const READY = '(?:ready|written|published|available|finished|complete|readable)';
const UNREADY = '(?:in preparation|coming soon|not yet written|being written|yet to be written|to come|outlined|planned|unwritten)';

function numberOf(word) {
  const w = word.toLowerCase().trim();
  if (/^\d+$/.test(w)) return Number(w);
  if (NUMBER_WORDS.includes(w)) return NUMBER_WORDS.indexOf(w);
  const m = /^([a-z]+)(?:[-\s]([a-z]+))?$/.exec(w);
  if (m && TENS_WORDS[m[1]] !== undefined) return TENS_WORDS[m[1]] + (m[2] ? NUMBER_WORDS.indexOf(m[2]) : 0);
  return null;
}

const listOf = (ns) => (ns.length ? ns.map(String).join(', ').replace(/, (\d+)$/, ' and $1') : 'none');
const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// The visible text of a node, without the contents of <script> and <style>, and with a space around
// each block, so a heading and the paragraph under it do not run together into one word: "World" and
// "Five" joined as "WorldFive" have no word boundary between them, and the sentence went unread.
const BLOCKS = new Set(['address', 'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'section', 'table', 'td', 'th', 'tr', 'ul']);
function proseOf(node) {
  if (node.text !== undefined) return node.text;
  if (RAW.has(node.tag)) return '';
  const inner = (node.children || []).map(proseOf).join('');
  return BLOCKS.has(node.tag) ? ` ${inner} ` : inner;
}

// What one piece of prose says about which of a book's chapters can be read. `book` is { dir, title,
// onDisk: [{ dir, number }], outline } with outline the number of lines in its contents (or null).
// Returns the failures, each with the words it quotes so a caller can find the line they are on, and
// how many statements it recognised, so a caller that cannot place the prose in a book can still tell
// whether it claimed anything.
function proseClaims(text, { where, book }) {
  const fails = [];
  let found = 0;
  const said = text.replace(/[*_`]/g, '').replace(/\s+/g, ' ');
  const disk = book.onDisk.map((c) => c.number).sort((a, b) => a - b);
  const diskText = `${book.dir} has ${disk.length === 1 ? 'chapter' : 'chapters'} ${listOf(disk)} on disk (${book.onDisk.map((c) => `${book.dir}/${c.dir}/`).join(', ')})`;
  const fix = `Say it without naming chapters — "the book's contents page says which chapters are ready" cannot go stale, because npm run check holds that page to the tree — or name exactly the chapters on disk`;
  let m;
  const push = (msg) => fails.push({ msg: `${where} ${msg.replace('%q', () => `"${m[0].trim()}"`)}`, quote: m[0].trim() });

  // "Chapter 1, “What is life?”, is ready", "Chapters 1 to 5 are written", "chapters 1 and 2 are ready".
  // The words between the number and the verb may hold a title ("What is life?" has an "is" in it) but
  // not a sentence end, and not a second "chapter": "chapter 3 explains …, and chapter 4 is ready" is
  // a statement about chapter 4.
  const named = new RegExp(`\\bchapters?\\s+${NUM}(?:\\s*(to|through|–|—|-|and)\\s*${NUM})?\\b((?:(?!\\bchapters?\\b)[^.;:!])*?)\\b(?:is|are)\\s+(?:now\\s+|already\\s+|still\\s+)?(${READY}|${UNREADY})\\b`, 'gi');
  while ((m = named.exec(said))) {
    const a = numberOf(m[1]);
    const b = m[3] ? numberOf(m[3]) : a;
    if (a === null || b === null) continue;
    found += 1;
    const set = m[2] && m[2].toLowerCase() === 'and' ? [a, b] : range(Math.min(a, b), Math.max(a, b));
    const verb = m[5].toLowerCase();
    if (new RegExp(`^${READY}$`, 'i').test(verb)) {
      if (!sameSet(set, disk)) push(`says ${set.length === 1 ? `chapter ${set[0]} is` : `chapters ${listOf(set)} are`} ${verb}, and nothing else is (%q), and ${diskText}. ${fix}`);
    } else {
      const written = set.filter((n) => disk.includes(n));
      if (written.length) push(`says ${written.length === 1 ? `chapter ${written[0]} is` : `chapters ${listOf(written)} are`} ${verb} (%q), and ${diskText}. Say what the chapter is about, or drop the sentence`);
    }
  }

  // "the first five chapters are ready", "five chapters are written", "5 of 32 chapters are ready".
  const counted = new RegExp(`\\b(?:(the first)\\s+|only\\s+|just\\s+)?${NUM}\\s+(?:of\\s+(?:the\\s+|its\\s+)?${NUM}\\s+)?chapters?\\s+(?:is|are|has been|have been)\\s+(?:now\\s+|already\\s+)?${READY}\\b`, 'gi');
  while ((m = counted.exec(said))) {
    const n = numberOf(m[2]);
    if (n === null) continue;
    found += 1;
    if (m[1] ? !sameSet(range(1, n), disk) : n !== disk.length) push(`says ${m[1] ? 'the first ' : ''}${n} chapter${n === 1 ? ' is' : 's are'} ready (%q), and ${diskText}. ${fix}`);
    const of = m[3] ? numberOf(m[3]) : null;
    if (of !== null && book.outline !== null && of !== book.outline) push(`says the book has ${of} chapters (%q), and its contents page lists ${book.outline}; write ${book.outline}`);
  }

  // "thirty-one more are outlined": the lines in the contents that are not on disk.
  const more = new RegExp(`\\b${NUM}\\s+(?:more|other|further)(?:\\s+chapters?)?\\s+(?:are|remain)\\s+(?:still\\s+)?(?:only\\s+)?${UNREADY}\\b`, 'gi');
  while ((m = more.exec(said))) {
    const n = numberOf(m[1]);
    if (n === null) continue;
    found += 1;
    if (book.outline === null) continue;
    const left = book.outline - disk.length;
    if (n !== left) push(`says ${n} more chapters are unwritten (%q), and its contents page lists ${book.outline} with ${disk.length} on disk, so ${left} are; write ${left}, or say it without a count, which cannot go stale`);
  }
  return { fails, found };
}

// The rule. `books` maps a book's directory to { title, onDisk: [{ dir, number }] }; `contentsOf(dir)`
// returns that book's index.html source (or null), which the shelf and README halves need for the
// number of lines in its contents. Exactly one of `html` and `markdown` is given.
export function checkChapterAvailability({ file, html = null, markdown = null, books = new Map(), contentsOf = () => null } = {}) {
  const fails = [];
  const bookOf = (dir) => {
    const b = books.get(dir);
    if (!b) return null;
    const src = contentsOf(dir);
    const outline = src ? findAll(parseHtml(src), (n) => n.tag === 'ol' && hasClass(n, 'chapters')).flatMap((ol) => ol.children.filter((c) => c.tag === 'li')).length : null;
    return { dir, title: b.title, onDisk: b.onDisk, outline: outline || null };
  };

  if (markdown !== null) {
    // Paragraphs with the line each starts on. A fenced block keeps its newlines and loses its text, so
    // a command in the README is never read as a sentence and the line numbers stay true.
    const lines = markdown.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, '')).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').split('\n');
    const paragraphs = [];
    let current = null;
    lines.forEach((l, i) => {
      if (!l.trim()) { current = null; return; }
      if (!current) paragraphs.push((current = { line: i + 1, text: '' }));
      current.text += `${l}\n`;
    });
    for (const p of paragraphs) {
      const at = `${file}:${p.line}`;
      const flat = p.text.replace(/[*_`]/g, '');
      const named = [...books.keys()].filter((dir) => books.get(dir).title && flat.includes(books.get(dir).title));
      if (named.length === 1) {
        fails.push(...proseClaims(p.text, { where: `${at}: the paragraph about ${named[0]}`, book: bookOf(named[0]) }).fails.map((f) => f.msg));
      } else if (proseClaims(p.text, { where: at, book: { dir: '?', onDisk: [], outline: null } }).found) {
        // A claim nobody can tie to a book is a claim nobody checks.
        fails.push(`${at}: a paragraph says which chapters are ready and names ${named.length ? `${named.length} books (${named.join(', ')})` : 'no book by its title'}, so this rule cannot tell which book's chapters to check it against; name the one book it is about, by the title its contents page's <h1> gives it`);
      }
    }
    return fails;
  }

  const doc = parseHtml(html);
  const fail = (msg, node) => fails.push(`${file}${node?.line ? `:${node.line}` : ''}: ${msg}`);
  const lang = (findAll(doc, (n) => n.tag === 'html')[0]?.attrs.lang || 'en').toLowerCase().split('-')[0];
  const [top, sub] = file.split('/');

  // A book's contents page: <book>/index.html.
  if (sub === 'index.html' && books.has(top)) {
    const { onDisk } = books.get(top);
    const words = CONTENTS_TAGS[lang];
    const lists = findAll(doc, (n) => n.tag === 'ol' && hasClass(n, 'chapters'));
    if (!lists.length) {
      fail(`${top} has ${onDisk.length} chapter director${onDisk.length === 1 ? 'y' : 'ies'} on disk and this page has no <ol class="chapters">, so no line of its contents can be checked against them; the contents are read from that list`);
      return fails;
    }
    if (!words) fail(`the page's lang is "${lang}" and CONTENTS_TAGS in tools/check-content.js has no words for it, so the tag on each line cannot be checked; add the word this book prints for a chapter that can be read and the one for a chapter that cannot`);
    const listed = new Map();
    for (const li of lists.flatMap((ol) => ol.children.filter((c) => c.tag === 'li'))) {
      const nText = textOf(findAll(li, (n) => hasClass(n, 'n'))[0] ?? { text: '' }).trim();
      const number = /^\d+$/.test(nText) ? Number(nText) : null;
      const title = textOf(findAll(li, (n) => hasClass(n, 'title'))[0] ?? { text: '' }).trim().replace(/\s+/g, ' ');
      if (number === null) {
        fail(`a line of the contents ("${textOf(li).trim().replace(/\s+/g, ' ').slice(0, 60)}") has no <span class="n"> holding its chapter number, so this rule cannot tell which chapter it lists; give it one`, li);
        continue;
      }
      if (listed.has(number)) fail(`chapter ${number} is listed twice (first at line ${listed.get(number)}); a book has one line per chapter`, li);
      listed.set(number, li.line);
      const here = onDisk.find((c) => c.number === number);
      const link = findAll(li, (n) => n.tag === 'a')[0];
      const tag = textOf(findAll(li, (n) => hasClass(n, 'tag'))[0] ?? { text: '' }).trim();
      const name = `chapter ${number}${title ? ` (${title})` : ''}`;
      if (here) {
        const want = `${here.dir}/`;
        if (!link) {
          fail(`${name} is on disk at ${top}/${here.dir}/ and the contents list it${tag ? ` as "${tag}"` : ''} with no link, so a reader of the book page cannot reach it; make the line <li><a href="${want}"><span class="n">${number}</span><span><span class="title">${title || '…'}</span><span class="dek">what the chapter covers</span></span><span class="tag">${words?.ready[0] ?? '…'}</span></a></li>`, li);
          continue;
        }
        const href = (link.attrs.href || '').split('#')[0].split('?')[0];
        if (posix.normalize(href.replace(/(^|\/)index\.html$/, '$1')).replace(/\/+$/, '') !== here.dir) {
          fail(`${name}'s line links href="${link.attrs.href ?? ''}", and chapter ${number} is on disk at ${top}/${here.dir}/; write href="${want}"`, link);
        }
        if (words && !words.ready.includes(tag)) fail(`${name} is on disk and linked, and its tag says "${tag}"; write <span class="tag">${words.ready[0]}</span>`, li);
      } else {
        if (link) {
          fail(`${name}'s line links href="${link.attrs.href ?? ''}", and ${top}/ has no ch${String(number).padStart(2, '0')}- directory, so the contents promise a chapter a reader cannot open; make the line <li><span class="soon"><span class="n">${number}</span><span class="title">${title || '…'}</span><span class="tag">${words?.soon[0] ?? '…'}</span></span></li>`, link);
        } else if (words && !words.soon.includes(tag)) {
          fail(`${name} has no directory in ${top}/ and its tag says "${tag}"; write <span class="tag">${words.soon[0]}</span>`, li);
        }
      }
    }
    for (const c of onDisk) {
      if (!listed.has(c.number)) fail(`${top}/${c.dir}/ is on disk and the contents list no chapter ${c.number}, so no reader can find it from the book page; add its line, in number order, inside the unit it belongs to: <li><a href="${c.dir}/"><span class="n">${c.number}</span>…<span class="tag">${words?.ready[0] ?? '…'}</span></a></li>`);
    }
    return fails;
  }

  // The library page: one shelf card per book, each read as a statement about the book it opens.
  if (file === 'index.html') {
    const cards = findAll(doc, (n) => n.tag === 'a' && hasClass(n, 'book'));
    for (const card of cards) {
      const dir = (card.attrs.href || '').split('#')[0].split('?')[0].replace(/(^|\/)index\.html$/, '$1').replace(/^\.\//, '').replace(/\/+$/, '');
      const book = bookOf(dir);
      if (!book) continue;
      // Named at the line of the innermost element holding the quoted words, not the card's first line.
      const flat = (n) => proseOf(n).replace(/[*_`]/g, '').replace(/\s+/g, ' ');
      for (const f of proseClaims(proseOf(card), { where: `the shelf card for ${dir}`, book }).fails) {
        fail(f.msg, findAll(card, (n) => flat(n).includes(f.quote)).pop() ?? card);
      }
    }
    // Anything the page says outside a card is about no one book.
    const outside = parseHtml(html.replace(/<a\b[^>]*\bclass="[^"]*\bbook\b[^"]*"[\s\S]*?<\/a>/gi, ''));
    const main = findAll(outside, (n) => n.tag === 'main')[0];
    if (main && proseClaims(proseOf(main), { where: file, book: { dir: '?', onDisk: [], outline: null } }).found) {
      fail('the library page says which chapters are ready outside any shelf card, so this rule cannot tell which book it means; say it inside the card for that book');
    }
  }
  return fails;
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const { KINDS } = await import(pathToFileURL(join(root, 'src/figures/registry.js')).href);
  const pages = [join(root, 'index.html')];
  // Every chapter directory of every book, by the number in its name, so a page can be told which chapter
  // follows it — the fact the closing card is checked against. Read from the tree and never from the card.
  const chapters = new Map();
  for (const book of readdirSync(root)) {
    const dir = join(root, book);
    if (!statSync(dir).isDirectory() || ['node_modules', 'src', 'tools', 'test', 'docs', 'out', 'lab', '.git', '.github'].includes(book)) continue;
    if (existsSync(join(dir, 'index.html'))) pages.push(join(dir, 'index.html'));
    for (const ch of readdirSync(dir)) {
      const cdir = join(dir, ch);
      if (!statSync(cdir).isDirectory() || !existsSync(join(cdir, 'index.html'))) continue;
      pages.push(join(cdir, 'index.html'));
      const n = /^ch(\d+)-/.exec(ch);
      if (n) {
        if (!chapters.has(book)) chapters.set(book, []);
        chapters.get(book).push({ dir: ch, number: Number(n[1]) });
      }
    }
  }
  // The chapter that follows this one: the lowest-numbered sibling above it, so a gap in the numbering
  // does not silently switch the rule off.
  const nextChapterOf = (rel) => {
    const [book, ch] = posix.dirname(rel).split('/');
    const mine = ch && /^ch(\d+)-/.exec(ch);
    if (!mine) return null;
    const after = (chapters.get(book) ?? []).filter((c) => c.number > Number(mine[1])).sort((a, b) => a.number - b.number)[0];
    return after ? { ...after, path: `${book}/${after.dir}` } : null;
  };
  // Every objective id in the book, so a chapter's prerequisites may reach into another chapter.
  const allObjectiveIds = new Set();
  for (const page of pages) {
    const objPath = join(dirname(page), 'objectives.js');
    if (!existsSync(objPath)) continue;
    for (const o of (await import(pathToFileURL(objPath).href)).OBJECTIVES) allObjectiveIds.add(o.id);
  }
  // Every chapter with an item bank, found from the tree and never listed, for checkStudySources: the
  // page that lists them is authored HTML, and the relationship between that list and the tree is
  // what is checked. The chapter id is the one src/components/mastery.js registers the chapter under.
  const banks = [];
  for (const page of pages) {
    const dir = dirname(page);
    if (!existsSync(join(dir, 'items.js'))) continue;
    const relDir = posix.dirname(page.slice(root.length + 1).replace(/\\/g, '/'));
    const [book, sub] = relDir.split('/');
    if (!sub) continue;
    const tree = parseHtml(readFileSync(page, 'utf8'));
    const m = /^ch(\d{2})-/.exec(sub);
    const h1 = findAll(tree, (n) => n.tag === 'h1')[0];
    const { ITEMS } = await import(pathToFileURL(join(dir, 'items.js')).href);
    banks.push({
      dir: relDir,
      key: `${book}/${m ? `ch${m[1]}` : sub}`,
      number: findAll(tree, (n) => n.tag === 'main' && n.attrs['data-chapter'] !== undefined)[0]?.attrs['data-chapter'] ?? (m ? Number(m[1]) : sub),
      title: h1 ? textOf(h1).trim().replace(/\s+/g, ' ') : sub,
      items: Array.isArray(ITEMS) ? ITEMS.length : 0,
    });
  }

  // For checkChapterAvailability: each book's chapters on disk and its title, the <h1> of its contents
  // page, which is how README.md names the book a paragraph is about.
  const contentsOf = (book) => (existsSync(join(root, book, 'index.html')) ? readFileSync(join(root, book, 'index.html'), 'utf8') : null);
  const books = new Map([...chapters].map(([book, onDisk]) => {
    const h1 = contentsOf(book) && findAll(parseHtml(contentsOf(book)), (n) => n.tag === 'h1')[0];
    return [book, { title: h1 ? textOf(h1).trim().replace(/\s+/g, ' ') : null, onDisk }];
  }));

  let total = 0;
  let sittingPages = 0;
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const dir = dirname(page);
    let glossary = {};
    if (existsSync(join(dir, 'glossary.js'))) glossary = (await import(pathToFileURL(join(dir, 'glossary.js')).href)).GLOSSARY;
    let objectives = [];
    if (existsSync(join(dir, 'objectives.js'))) objectives = (await import(pathToFileURL(join(dir, 'objectives.js')).href)).OBJECTIVES;
    let items = [];
    if (existsSync(join(dir, 'items.js'))) items = (await import(pathToFileURL(join(dir, 'items.js')).href)).ITEMS;
    const rel = page.slice(root.length + 1).replace(/\\/g, '/');
    const fails = checkDocument(html, {
      glossary,
      kinds: KINDS,
      objectives,
      file: rel,
      nextChapter: nextChapterOf(rel),
      resolveHref: (p) => {
        const target = resolve(dir, p);
        return existsSync(target) && (!statSync(target).isDirectory() || existsSync(join(target, 'index.html')));
      },
    });
    const tree = parseHtml(html);
    const dataFails = checkChapterData({
      objectives,
      items,
      sections: findAll(tree, (n) => n.tag === 'section' && n.attrs.id).map((n) => n.attrs.id),
      figures: findAll(tree, (n) => n.tag === 'tb-figure').map((n) => n.attrs.id),
      kinds: KINDS,
      otherChapterObjectiveIds: [...allObjectiveIds].filter((id) => !objectives.some((o) => o.id === id)),
      file: `${posix.dirname(rel)}/objectives.js`,
      itemsFile: `${posix.dirname(rel)}/items.js`,
    });
    const hasSitting = findAll(tree, (n) => n.tag === 'tb-sitting').length > 0;
    if (hasSitting) sittingPages += 1;
    const sourceFails = hasSitting ? checkStudySources({ html, banks, pageDir: posix.dirname(rel), file: rel }) : [];
    const availabilityFails = checkChapterAvailability({ file: rel, html, books, contentsOf });
    const all = [...fails, ...dataFails, ...sourceFails, ...availabilityFails];
    total += all.length;
    const counts = [`${findAll(tree, (n) => n.tag === 'tb-figure').length} figures`, `${Object.keys(glossary).length} glossary entries`];
    if (objectives.length) counts.push(`${objectives.length} objectives`);
    if (items.length) counts.push(`${items.length} items`);
    if (hasSitting) counts.push(`${banks.length} item bank(s) on disk to list`);
    // What checkChapterAvailability compared, so a run that read no contents line says so.
    const [top, sub] = rel.split('/');
    if (sub === 'index.html' && books.has(top)) counts.push(`${findAll(tree, (n) => n.tag === 'ol' && hasClass(n, 'chapters')).flatMap((ol) => ol.children.filter((c) => c.tag === 'li')).length} contents line(s) against ${books.get(top).onDisk.length} chapter(s) on disk`);
    if (rel === 'index.html') counts.push(`${findAll(tree, (n) => n.tag === 'a' && hasClass(n, 'book')).length} shelf card(s) read`);
    console.log(`${all.length ? 'FAIL' : 'ok  '} ${rel} (${counts.join(', ')})`);
    for (const f of all) console.log(`  ${f}`);
  }
  // README.md is not a page, and it is where the library page's stale sentence was also written.
  const readmeFails = checkChapterAvailability({ file: 'README.md', markdown: readFileSync(join(root, 'README.md'), 'utf8'), books, contentsOf });
  total += readmeFails.length;
  console.log(`${readmeFails.length ? 'FAIL' : 'ok  '} README.md (read for which chapters it says are ready, against ${[...books].map(([b, v]) => `${b}'s ${v.onDisk.length}`).join(' and ')} on disk)`);
  for (const f of readmeFails) console.log(`  ${f}`);
  // Keyed on the banks, not on the page: with no study page at all the loop above ran the source
  // check on nothing, and a check that did not run must not read as one that passed.
  if (banks.length && !sittingPages) {
    total += 1;
    console.log(`FAIL (no study page): ${banks.length} chapter(s) have an items.js and no page carries a <tb-sitting> to list them in, so no sitting can reach them`);
  }
  if (total) {
    console.error(`FAIL: ${total} content problem(s) across ${pages.length} page(s)`);
    process.exit(1);
  }
  console.log(`check: ${pages.length} page(s) pass`);
}

const isMain = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isMain) main().catch((err) => {
  console.error(`FAIL: ${err.stack || err.message}`);
  process.exit(1);
});
