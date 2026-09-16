// npm run check: static checks over every chapter page's authored HTML.
//
// Claim: for each chapter page, every <tb-figure> has a registered kind, a unique id, a <figcaption>
// and a data-alt; every <tb-term ref> names an entry in that chapter's glossary.js and every glossary
// entry is used; every <tb-check> has a question, at least two options, exactly one data-correct and an
// explanation; every <tb-sort> has at least two bins, and every item names a bin and carries a data-why;
// every id in the document is unique; there is exactly one <h1>, on a chapter page (main[data-chapter])
// every <h2> is the direct child of a <section id> so the shell can number it, and no heading level is
// skipped; every "Figure N.M" mentioned in the prose exists and
// every figure is mentioned at least once; every relative href resolves to a file; every objective's
// prerequisites resolve, in this chapter or another, with no cycle inside the chapter; and no TODO,
// FIXME, XXX or lorem is left in the page. For the study data (checkChapterData, checkStudySources):
// every figure task's `expect` is one the grader's own parser can evaluate against some figure
// (expectProblems in src/components/task.js — a clause no figure state can satisfy fails here, not
// in a sitting); and every chapter that has an items.js is listed as a tb-source, under the chapter
// id the store files it by, on every page that carries a <tb-sitting>, and at least one page does.
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
export function checkDocument(html, { glossary = {}, kinds = [], objectives = [], file = 'document', resolveHref = null } = {}) {
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

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const { KINDS } = await import(pathToFileURL(join(root, 'src/figures/registry.js')).href);
  const pages = [join(root, 'index.html')];
  for (const book of readdirSync(root)) {
    const dir = join(root, book);
    if (!statSync(dir).isDirectory() || ['node_modules', 'src', 'tools', 'test', 'docs', 'out', 'lab', '.git', '.github'].includes(book)) continue;
    if (existsSync(join(dir, 'index.html'))) pages.push(join(dir, 'index.html'));
    for (const ch of readdirSync(dir)) {
      const cdir = join(dir, ch);
      if (statSync(cdir).isDirectory() && existsSync(join(cdir, 'index.html'))) pages.push(join(cdir, 'index.html'));
    }
  }
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
    const all = [...fails, ...dataFails, ...sourceFails];
    total += all.length;
    const counts = [`${findAll(tree, (n) => n.tag === 'tb-figure').length} figures`, `${Object.keys(glossary).length} glossary entries`];
    if (objectives.length) counts.push(`${objectives.length} objectives`);
    if (items.length) counts.push(`${items.length} items`);
    if (hasSitting) counts.push(`${banks.length} item bank(s) on disk to list`);
    console.log(`${all.length ? 'FAIL' : 'ok  '} ${rel} (${counts.join(', ')})`);
    for (const f of all) console.log(`  ${f}`);
  }
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
