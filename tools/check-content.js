// npm run check: static checks over every chapter page's authored HTML.
//
// Claim: for each chapter page, every <tb-figure> has a registered kind, a unique id, a <figcaption>
// and a data-alt; every <tb-term ref> names an entry in that chapter's glossary.js and every glossary
// entry is used, and no entry's term carries markup (checkGlossaryTerms, above main());
// every <tb-check> has a question, at least two options, exactly one data-correct and an
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
// No multiple-choice question names an option by where it is written: not a <tb-check>'s explanation
// or its options, and not a multiple-choice item's explanation, its options or their whys
// (optionPositionWords(), below).
//
// Bound: it reads the authored HTML with a small tolerant tokenizer, not the rendered DOM, so it knows
// nothing about what the scripts produce (numbering, popovers, figure content) and nothing about
// pixels. The tokenizer handles the markup this repo writes; it is not an HTML5 parser. The expect
// check knows the grammar and not the figure: a path a figure does not report is found only by
// grading against that figure's describe(). The option-position rule knows the phrasings in
// OPTION_POSITION and no others; its own comment lists what it cannot see.
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

// The ways a sentence names a multiple-choice option by where it is written rather than by what it says.
// No reader sees the written order. Today has shown options in a drawn order since 2026-09-22, and the
// chapters' checks since 2026-09-23 (src/components/choice-order.js). So "the last option" points at
// whichever option the draw put last, and an explanation can tell a reader the right option is the
// mistake. Seven check explanations said it this way when the checks were first shuffled: biology
// chapter 4 q2, chapter 5 q1 to q5, and 通鑑 chapter 3's q-bianjie (「前两个选项…第三个」).
//
// Bound: these phrasings and no others. Each is narrow on purpose, because the rule reads explanations
// and a whole-word "first" or 第一个 is ordinary prose there. "The first two options" is seen; "the last
// is wrong", "the first two", "the one above" and a bare 第三个 are not. Nor is "answer" with an ordinal:
// this book writes "the first answer" for the first reason a section gives. An explanation flagged for
// one phrase is usually reworded whole, which takes such a phrase with it: chapter 5's q4 says "The last
// is wrong" in the sentence after "The first option". The rule reads a check's explanation and options and
// a bank's explanations, options and whys. It does not read a question's stem, which may say "the
// options below" of all of them at once.
const OPTION_POSITION = [
  // "the last option", "The third option", "the first two options", "the second choice"
  /\bthe\s+(?:first|second|third|fourth|fifth|sixth|seventh|eighth|last|final|penultimate|middle)\s+(?:(?:two|three|four)\s+)?(?:option|choice)s?\b/gi,
  // "option B", "options B and C", "choice (c)", "answer D": a letter names a place on the screen
  /\b(?:[Oo]ptions?|[Cc]hoices?|[Aa]nswers?)\s+(?:[A-H]|\([A-Ha-h]\))(?![\w-])/g,
  // "both A and B", "neither B nor C"
  /\b(?:[Bb]oth|[Ee]ither|[Nn]either)\s+[A-H]\s+(?:and|or|nor)\s+[A-H]\b/g,
  // "all of the above", "none of the above", "the options below"
  /\b(?:all|none|both|neither|either|each|any)\s+of\s+the\s+(?:above|below)\b|\b(?:option|choice|answer)s?\s+(?:above|below)\b/gi,
  // 第三个选项, 前两个选项, 后两个选项, 最后一个选项, 第二个答案
  /(?:第[一二三四五六七八]|前[两二三四]|后[两二三四]|最后一)个(?:选项|答案)/g,
  // 选项B, B项 (not the A of "DNA项目")
  /选项\s*[A-HＡ-Ｈ]|(?<![A-Za-zＡ-Ｚａ-ｚ])[A-HＡ-Ｈ]\s*项/g,
  // 以上选项, 上述各项, 以上都不对, 以上皆是
  /(?:以上|上述)(?:选项|各项|几项)|以上(?:都|皆|均)(?:对|是|不对|不是|错|正确|不正确)/g,
];

// Every phrase in `text` that names an option by where it is written, pattern by pattern.
function optionPositionWords(text) {
  const found = [];
  for (const re of OPTION_POSITION) for (const m of String(text ?? '').matchAll(re)) found.push(m[0]);
  return found;
}

// What an author is told when the rule fires: what was found, why it is wrong, and what would pass.
function optionPositionMessage(what, found) {
  return `${what} names an option by where it is written (${found.map((f) => `"${f}"`).join(', ')}). Options are shown in a drawn order (src/components/choice-order.js), so these words point at whichever option the draw put there. Name the option by what it says.`;
}

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
    const explains = findAll(c, (n) => hasClass(n, 'explain'));
    if (!explains.length) fail(`<tb-check id="${id}"> has no .explain`, c);
    for (const e of explains) {
      const found = optionPositionWords(textOf(e));
      if (found.length) fail(optionPositionMessage(`<tb-check id="${id}">'s explanation`, found), e);
    }
    options.forEach((o, i) => {
      const found = optionPositionWords(textOf(o));
      if (found.length) fail(optionPositionMessage(`<tb-check id="${id}">'s option ${i + 1} as written`, found), o);
    });
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
      const explained = optionPositionWords(it.explain);
      if (explained.length) failItem(optionPositionMessage(`item "${id}"'s explanation`, explained));
      options.forEach((o, i) => {
        const text = optionPositionWords(o?.text ?? o?.html ?? o?.label ?? o);
        if (text.length) failItem(optionPositionMessage(`item "${id}"'s option ${i + 1} as written`, text));
        const why = optionPositionWords(o?.why);
        if (why.length) failItem(optionPositionMessage(`item "${id}"'s why for option ${i + 1} as written`, why));
      });
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
//   as a statement about that book, and a card whose book has no chapter directory is read against an
//   empty shelf; in README.md, each paragraph is read as a statement about the book whose title (its
//   contents page's <h1>) it names. A sentence naming chapters as ready ("Chapter 1 … is ready",
//   "Chapters 1, 2 and 3 are written", "Chapters 1 to 5 have been published", "the first five chapters
//   are ready") is read as the whole list and must name exactly the chapters on disk; a count ("five
//   chapters are ready", "5 of the book's 32 chapters") must be their number; "N more are outlined",
//   in a sentence about chapters, must be the lines in the contents minus the chapters on disk; and a
//   chapter called unwritten ("chapter 6 is in preparation") must not be on disk. A statement inside
//   the library page's <main> but in no card, and a README paragraph that names no book or two, fail
//   and say why. Each run prints how many statements it compared, because 0 is a run that compared
//   nothing.
//
// Bound: prose it cannot parse. The prose half recognises the English sentence shapes above, with
// numbers written as digits or as words up to ninety-nine and HTML entities decoded; a claim made any
// other way ("everything up to membranes", "half the book", a claim split across two sentences, a
// sentence in Chinese) passes unread, and a sentence using one of its words in another sense ("chapter
// 1 is written for a reader who…") fails and is reworded. It reads the library page's <main> and
// README.md, and nothing else: not chapter prose, not text outside <main>, not docs/
// (docs/design/textbook.md's status line is prose this rule never sees), and not the pages outside a
// book. The contents half reads structure, not wording, except for the one tag word per state, and it
// knows those words only for the languages in CONTENTS_TAGS; a book in another language fails until
// its words are added. A book with no chapter directory at all has no contents half.
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
// A hyphen inside a number word may be a plain one, U+2010 or the non-breaking U+2011 (&#8209;).
const JOIN = '[-\\u2010\\u2011\\s]';
const NUM_WORD = `(?:\\d+|(?:${Object.keys(TENS_WORDS).join('|')})(?:${JOIN}(?:${NUMBER_WORDS.slice(1, 10).join('|')}))?|${[...NUMBER_WORDS].reverse().join('|')})`;
const NUM = `(${NUM_WORD})`;
// Between two numbers of a list: ", ", ", and ", " and ", " to ", " through ", or a dash for a range.
const LINK = '(?:\\s*,\\s*(?:and\\s+)?|\\s+(?:and|to|through)\\s+|\\s*[–—-]\\s*)';
const READY = '(?:ready|written|published|available|finished|complete|readable)';
const UNREADY = '(?:in preparation|coming soon|not yet written|being written|yet to be written|to come|outlined|planned|unwritten)';

function numberOf(word) {
  const w = word.toLowerCase().trim();
  if (/^\d+$/.test(w)) return Number(w);
  if (NUMBER_WORDS.includes(w)) return NUMBER_WORDS.indexOf(w);
  const m = /^([a-z]+)(?:[-‐‑\s]([a-z]+))?$/.exec(w);
  if (m && TENS_WORDS[m[1]] !== undefined) return TENS_WORDS[m[1]] + (m[2] ? NUMBER_WORDS.indexOf(m[2]) : 0);
  return null;
}

// "1, 2 and 3" is three chapters, "1 to 5 and 7" is six, and "1–3" is three.
function numbersIn(list) {
  const out = [];
  let last = null;
  let ranging = false;
  const re = new RegExp(`${NUM}|(to|through|[–—-])|(,|and)`, 'gi');
  let t;
  while ((t = re.exec(list))) {
    if (t[1] !== undefined) {
      const n = numberOf(t[1]);
      if (n === null) return null;
      if (ranging && last !== null) out.push(...range(Math.min(last, n), Math.max(last, n)));
      else out.push(n);
      last = n;
      ranging = false;
    } else if (t[2] !== undefined) {
      ranging = true;
    }
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

const listOf = (ns) => (ns.length ? ns.map(String).join(', ').replace(/, (\d+)$/, ' and $1') : 'none');
const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// The entities an author writes in running text, so "Chapter&nbsp;1" is read as "Chapter 1".
const ENTITIES = { nbsp: ' ', amp: '&', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…', quot: '"', apos: "'", lt: '<', gt: '>' };
const decode = (s) => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (all, dec, hex, name) => {
  if (dec) return String.fromCodePoint(Number(dec));
  if (hex) return String.fromCodePoint(parseInt(hex, 16));
  return ENTITIES[name.toLowerCase()] ?? all;
});

// The visible text of a node, without the contents of <script> and <style>, and with a space around
// each block, so a heading and the paragraph under it do not run together into one word: "World" and
// "Five" joined as "WorldFive" have no word boundary between them, and the sentence went unread.
const BLOCKS = new Set(['address', 'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'section', 'table', 'td', 'th', 'tr', 'ul']);
function proseOf(node) {
  if (node.text !== undefined) return decode(node.text);
  if (RAW.has(node.tag)) return '';
  const inner = (node.children || []).map(proseOf).join('');
  return BLOCKS.has(node.tag) ? ` ${inner} ` : inner;
}
const flatten = (s) => s.replace(/[*_`]/g, '').replace(/\s+/g, ' ');

// What one piece of prose says about which of a book's chapters can be read. `book` is { dir, title,
// onDisk: [{ dir, number }], outline } with outline the number of lines in its contents (or null).
// Returns the failures, each with the words it quotes so a caller can find the line they are on, and
// every statement it recognised, so a caller that cannot place the prose in a book can still tell
// whether it claimed anything, and a run can say how many it compared.
function proseClaims(text, { where, book }) {
  const fails = [];
  const claims = [];
  const said = flatten(text);
  const disk = book.onDisk.map((c) => c.number).sort((a, b) => a - b);
  const diskText = disk.length
    ? `${book.dir} has ${disk.length === 1 ? 'chapter' : 'chapters'} ${listOf(disk)} on disk (${book.onDisk.map((c) => `${book.dir}/${c.dir}/`).join(', ')})`
    : `${book.dir}/ has no chapter directory on disk`;
  const fix = `Say it without naming chapters — "the book's contents page says which chapters are ready" cannot go stale, because npm run check holds that page to the tree — or name exactly the chapters on disk`;
  let m;
  const push = (msg) => fails.push({ msg: `${where} ${msg.replace('%q', () => `"${m[0].trim()}"`)}`, quote: m[0].trim() });
  const saw = () => claims.push({ quote: m[0].trim() });

  // "Chapter 1, “What is life?”, is ready", "Chapters 1, 2 and 3 are written", "Chapters 1 to 5 have
  // been published". The words between the numbers and the verb may hold a title ("What is life?" has
  // an "is" in it) but not a sentence end, and not a second "chapter": "chapter 3 explains …, and
  // chapter 4 is ready" is a statement about chapter 4. A question mark ends the sentence when a word
  // follows it, and not when a comma or a closing quote does, as in a title.
  const named = new RegExp(`\\bchapters?\\s+(${NUM_WORD}(?:${LINK}${NUM_WORD})*)\\b((?:(?!\\bchapters?\\b)(?!\\?\\s+[a-z])[^.;:!])*?)\\b(?:is|are|has been|have been)\\s+(?:now\\s+|already\\s+|still\\s+)?(${READY}|${UNREADY})\\b`, 'gi');
  while ((m = named.exec(said))) {
    const set = numbersIn(m[1]);
    if (!set || !set.length) continue;
    saw();
    const verb = m[3].toLowerCase();
    if (new RegExp(`^${READY}$`, 'i').test(verb)) {
      if (!sameSet(set, disk)) push(`says ${set.length === 1 ? `chapter ${set[0]} is` : `chapters ${listOf(set)} are`} ${verb}, and nothing else is (%q), and ${diskText}. ${fix}`);
    } else {
      const written = set.filter((n) => disk.includes(n));
      if (written.length) push(`says ${written.length === 1 ? `chapter ${written[0]} is` : `chapters ${listOf(written)} are`} ${verb} (%q), and ${diskText}. Say what the chapter is about, or drop the sentence`);
    }
  }

  // "the first five chapters are ready", "five chapters are written", "5 of the book's 32 chapters
  // are ready".
  const counted = new RegExp(`\\b(?:(the first)\\s+|only\\s+|just\\s+)?${NUM}\\s+(?:of\\s+(?:[a-z’'-]+\\s+){0,2}?${NUM}\\s+)?chapters?\\s+(?:is|are|has been|have been)\\s+(?:now\\s+|already\\s+)?${READY}\\b`, 'gi');
  while ((m = counted.exec(said))) {
    const n = numberOf(m[2]);
    if (n === null) continue;
    saw();
    if (m[1] ? !sameSet(range(1, n), disk) : n !== disk.length) push(`says ${m[1] ? 'the first ' : ''}${n} chapter${n === 1 ? ' is' : 's are'} ready (%q), and ${diskText}. ${fix}`);
    const of = m[3] ? numberOf(m[3]) : null;
    if (of !== null && book.outline !== null && of !== book.outline) push(`says the book has ${of} chapters (%q), and its contents page lists ${book.outline}; write ${book.outline}`);
  }

  // "thirty-one more are outlined": the lines in the contents that are not on disk. Only in a sentence
  // about chapters: "eight figures; two more are planned" is about figures.
  const more = new RegExp(`\\b${NUM}\\s+(?:more|other|further)(\\s+chapters?)?\\s+(?:are|remain)\\s+(?:still\\s+)?(?:only\\s+)?${UNREADY}\\b`, 'gi');
  while ((m = more.exec(said))) {
    const n = numberOf(m[1]);
    if (n === null) continue;
    const sentence = said.slice(0, m.index).split(/[.!?]\s/).pop();
    if (!m[2] && !/\bchapters?\b/i.test(sentence)) continue;
    saw();
    if (book.outline === null) continue;
    const left = book.outline - disk.length;
    if (n !== left) push(`says ${n} more chapters are unwritten (%q), and its contents page lists ${book.outline} with ${disk.length} on disk, so ${left} are; write ${left}, or say it without a count, which cannot go stale`);
  }
  return { fails, claims };
}

// The rule. `books` maps a book's directory to { title, onDisk: [{ dir, number }] }; `contentsOf(dir)`
// returns that book's index.html source (or null), which the shelf and README halves need for the
// number of lines in its contents. Exactly one of `html` and `markdown` is given. The array it returns
// carries a non-enumerable `compared`, { lines, claims }: what a run compared, for the line it prints.
export function checkChapterAvailability({ file, html = null, markdown = null, books = new Map(), contentsOf = () => null } = {}) {
  const fails = [];
  const compared = { lines: 0, claims: 0 };
  Object.defineProperty(fails, 'compared', { value: compared, enumerable: false });
  const bookOf = (dir) => {
    const b = books.get(dir);
    if (!b) return null;
    const src = contentsOf(dir);
    const outline = src ? findAll(parseHtml(src), (n) => n.tag === 'ol' && hasClass(n, 'chapters')).flatMap((ol) => ol.children.filter((c) => c.tag === 'li')).length : null;
    return { dir, title: b.title, onDisk: b.onDisk, outline: outline || null };
  };
  const nowhere = { dir: '?', onDisk: [], outline: null };

  if (markdown !== null) {
    // Paragraphs with the line each starts on. Code — a fenced block (``` or ~~~), an indented block —
    // and HTML comments keep their newlines and lose their text, so a command or a note in the README is
    // never read as a sentence and the line numbers stay true.
    const lines = decode(markdown.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''))).split('\n');
    let fence = null;
    let prevBlank = true;
    const prose = lines.map((l) => {
      const opens = /^\s{0,3}(`{3,}|~{3,})/.exec(l);
      if (fence) {
        if (opens && opens[1][0] === fence[0] && opens[1].length >= fence.length) fence = null;
        return '';
      }
      if (opens) { fence = opens[1]; return ''; }
      const code = /^( {4}|\t)/.test(l) && prevBlank;
      prevBlank = !l.trim() || (code && prevBlank);
      return code ? '' : l.replace(/\[([^\]\n]*)\]\([^)\n]*\)/g, '$1');
    });
    const paragraphs = [];
    let current = null;
    prose.forEach((l, i) => {
      if (!l.trim()) { current = null; return; }
      if (!current) paragraphs.push((current = { line: i + 1, text: '' }));
      current.text += `${l}\n`;
    });
    const titles = [...books].filter(([, b]) => b.title).map(([dir, b]) => `"${b.title}" (${dir})`).join(', ');
    for (const p of paragraphs) {
      const at = `${file}:${p.line}`;
      const flat = flatten(p.text);
      const named = [...books.keys()].filter((dir) => books.get(dir).title && flat.includes(books.get(dir).title));
      if (named.length === 1) {
        const r = proseClaims(p.text, { where: `${at}: the paragraph about ${named[0]}`, book: bookOf(named[0]) });
        compared.claims += r.claims.length;
        fails.push(...r.fails.map((f) => f.msg));
      } else {
        // A claim nobody can tie to a book is a claim nobody checks.
        const r = proseClaims(p.text, { where: at, book: nowhere });
        compared.claims += r.claims.length;
        if (r.claims.length) fails.push(`${at}: a paragraph says "${r.claims[0].quote}" and names ${named.length ? `${named.length} books (${named.join(', ')})` : 'no book by its title'}, so this rule cannot tell which book's chapters to check it against; name the one book it is about by its title, one of ${titles}`);
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
      compared.lines += 1;
      const nSpan = findAll(li, (n) => hasClass(n, 'n'))[0];
      const nText = nSpan ? textOf(nSpan).trim() : '';
      const number = /^\d+$/.test(nText) ? Number(nText) : null;
      const title = textOf(findAll(li, (n) => hasClass(n, 'title'))[0] ?? { text: '' }).trim().replace(/\s+/g, ' ');
      if (number === null) {
        const what = nSpan ? `its <span class="n"> holds "${nText}", which is not a chapter number` : 'it has no <span class="n"> holding its chapter number';
        fail(`a line of the contents ("${textOf(li).trim().replace(/\s+/g, ' ').slice(0, 60)}") cannot be read: ${what}, so this rule cannot tell which chapter it lists; write the number alone, as <span class="n">7</span>`, li);
        continue;
      }
      if (listed.has(number)) fail(`chapter ${number} is listed twice (first at line ${listed.get(number)}); a book has one line per chapter`, li);
      listed.set(number, li.line);
      const here = onDisk.find((c) => c.number === number);
      const link = findAll(li, (n) => n.tag === 'a')[0];
      const tag = textOf(findAll(li, (n) => hasClass(n, 'tag'))[0] ?? { text: '' }).trim();
      const name = `chapter ${number}${title ? ` (${title})` : ''}`;
      const soonLine = `<li><span class="soon"><span class="n">${number}</span><span class="title">${title || '…'}</span><span class="tag">${words?.soon[0] ?? '…'}</span></span></li>`;
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
      } else if (link) {
        fail(`${name}'s line links href="${link.attrs.href ?? ''}", and ${top}/ has no ch${String(number).padStart(2, '0')}- directory, so the contents promise a chapter a reader cannot open; make the line ${soonLine}`, link);
      } else if (!findAll(li, (n) => hasClass(n, 'soon')).length) {
        fail(`${name} has no directory in ${top}/, and its line is neither a link nor a .soon line, so it is set as neither; make the line ${soonLine}`, li);
      } else if (words && !words.soon.includes(tag)) {
        fail(`${name} has no directory in ${top}/ and its tag says "${tag}"; write <span class="tag">${words.soon[0]}</span>`, li);
      }
    }
    for (const c of onDisk) {
      if (!listed.has(c.number)) fail(`${top}/${c.dir}/ is on disk and the contents list no chapter ${c.number}, so no reader can find it from the book page; add its line, in number order, inside the unit it belongs to: <li><a href="${c.dir}/"><span class="n">${c.number}</span>…<span class="tag">${words?.ready[0] ?? '…'}</span></a></li>`);
    }
    return fails;
  }

  // The library page: one shelf card per book, each read as a statement about the book it opens. A card
  // whose book has no chapter directory is read against an empty shelf, so it can claim no chapter.
  if (file === 'index.html') {
    const at = (root, quote) => findAll(root, (n) => flatten(proseOf(n)).includes(quote)).pop() ?? root;
    for (const card of findAll(doc, (n) => n.tag === 'a' && hasClass(n, 'book'))) {
      const dir = (card.attrs.href || '').split('#')[0].split('?')[0].replace(/(^|\/)index\.html$/, '$1').replace(/^\.\//, '').replace(/\/+$/, '');
      if (!dir) continue;
      const r = proseClaims(proseOf(card), { where: `the shelf card for ${dir}`, book: bookOf(dir) ?? { dir, onDisk: [], outline: null } });
      compared.claims += r.claims.length;
      for (const f of r.fails) fail(f.msg, at(card, f.quote));
    }
    // Anything else the page's <main> says is about no one book. The cards are blanked rather than cut,
    // so every line number below is the page's own.
    const rest = parseHtml(html.replace(/<a\b[^>]*\bclass="[^"]*\bbook\b[^"]*"[\s\S]*?<\/a>/gi, (card) => card.replace(/[^\n]/g, '')));
    const main = findAll(rest, (n) => n.tag === 'main')[0];
    if (main) {
      const r = proseClaims(proseOf(main), { where: file, book: nowhere });
      compared.claims += r.claims.length;
      const linkless = findAll(main, (n) => hasClass(n, 'book'));
      for (const c of r.claims) {
        const card = linkless.find((n) => flatten(proseOf(n)).includes(c.quote));
        fail(card
          ? `the card at line ${card.line} says "${c.quote}", and it is a <${card.tag}> with no link to a book directory — a book with nothing on disk — so no chapter of it can be ready; drop the sentence, or make the card <a class="book" href="<book>/"> once its book has chapters`
          : `the library page says "${c.quote}" outside every shelf card, so this rule cannot tell which book it means; move the sentence into the <a class="book" href="<book>/"> card of the book it is about`, at(main, c.quote));
      }
    }
  }
  return fails;
}

// Claim: no glossary entry's `term` carries markup, whether a tag or an entity such as `&#8288;`. A term is
// set as text wherever the book shows it: the glossary list writes it with textContent, and every popover
// escapes it (src/components/term.js: "`term` is escaped and `def` is not"). So markup in a term is shown
// to the reader exactly as it is written. Found 2026-09-23: chapter 5's glossary printed "Maximum rate
// (V<sub>max</sub>)", "Michaelis constant (K<sub>m</sub>)" and "NAD<sup>+</sup>" with the tags on the page,
// and chapter 4's two water potentials the same way. What passes is the name in the term and the symbol,
// with its markup, in the definition, which is HTML by design.
//
// Keyed on the entries, not on a <tb-glossary>: a page with no list still shows each term in the popover of
// every <tb-term> that names it. `source` is the glossary file's own text, used only to give the failure a
// line number.
//
// Bound: it reads each term as a string, so a bare "&" passes as the text it is, and so does any character
// at all. A precomposed "⁺" in a term is plain text and passes here, although a heading set in the bold
// face takes it from Libertinus Serif, smaller and lighter than the letters beside it at 3x; the font
// census in npm run shot passes it too, because that face is one the page loads. Whether a term looks
// right is still a question for a person looking at the page.
export function checkGlossaryTerms(glossary = {}, { file = 'glossary.js', source = '' } = {}) {
  const fails = [];
  const lines = String(source).split(/\r?\n/);
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  for (const [ref, entry] of Object.entries(glossary ?? {})) {
    const term = String(entry?.term ?? '');
    const tags = term.match(/<[^>]*>?/g) ?? [];
    const entities = term.match(/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi) ?? [];
    if (!tags.length && !entities.length) continue;
    const key = new RegExp(`(^|[\\s{,])(['"]?)${escape(ref)}\\2\\s*:`);
    const at = lines.findIndex((l) => key.test(l));
    const fixes = [];
    // "Solute potential (Ψ<sub>s</sub>)" already holds its own fix: the name before the bracket and the
    // symbol inside it. Any other shape gets the worked example.
    const named = /^(.+?)\s*\(([^()]*<[^()]*)\)\s*$/.exec(term);
    const example = named ? `term "${named[1]}", and a definition that says it is written ${named[2]}` : 'term "Maximum rate", and a definition that says it is written V<sub>max</sub>';
    if (tags.length) fixes.push(`put the full name in the term and the symbol, with its markup, in the definition (${example})`);
    if (entities.length) fixes.push('write the character itself in the term, as a \\u escape in the string (a word joiner is \\u2060)');
    fails.push(`${file}${at >= 0 ? `:${at + 1}` : ''}: glossary entry "${ref}" has markup in its term, ${[...tags, ...entities].map((m) => `"${m}"`).join(', ')}, in "${term}". A term is set as text in the glossary list and in every popover (src/components/term.js escapes it), so the reader sees the markup exactly as it is written. To pass, ${fixes.join('; and ')}.`);
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
    const glossaryFile = join(dir, 'glossary.js');
    const termFails = existsSync(glossaryFile) ? checkGlossaryTerms(glossary, { file: `${posix.dirname(rel)}/glossary.js`, source: readFileSync(glossaryFile, 'utf8') }) : [];
    const all = [...fails, ...dataFails, ...sourceFails, ...termFails, ...availabilityFails];
    total += all.length;
    const counts = [`${findAll(tree, (n) => n.tag === 'tb-figure').length} figures`, `${Object.keys(glossary).length} glossary entries`];
    if (objectives.length) counts.push(`${objectives.length} objectives`);
    if (items.length) counts.push(`${items.length} items`);
    if (hasSitting) counts.push(`${banks.length} item bank(s) on disk to list`);
    // What checkChapterAvailability compared, so a run that compared nothing says so.
    const [top, sub] = rel.split('/');
    const { compared } = availabilityFails;
    if (sub === 'index.html' && books.has(top)) counts.push(`${compared.lines} contents line(s) against ${books.get(top).onDisk.length} chapter(s) on disk`);
    if (rel === 'index.html') counts.push(`${findAll(tree, (n) => n.tag === 'a' && hasClass(n, 'book')).length} shelf card(s) read, ${compared.claims} statement(s) about which chapters are ready compared`);
    console.log(`${all.length ? 'FAIL' : 'ok  '} ${rel} (${counts.join(', ')})`);
    for (const f of all) console.log(`  ${f}`);
  }
  // README.md is not a page, and it is where the library page's stale sentence was also written.
  const readmeFails = checkChapterAvailability({ file: 'README.md', markdown: readFileSync(join(root, 'README.md'), 'utf8'), books, contentsOf });
  total += readmeFails.length;
  console.log(`${readmeFails.length ? 'FAIL' : 'ok  '} README.md (${readmeFails.compared.claims} statement(s) about which chapters are ready compared, against ${[...books].map(([b, v]) => `${b}'s ${v.onDisk.length}`).join(' and ')} on disk)`);
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
