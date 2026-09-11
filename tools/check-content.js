// npm run check: static checks over every chapter page's authored HTML.
//
// Claim: for each chapter page, every <tb-figure> has a registered kind, a unique id, a <figcaption>
// and a data-alt; every <tb-term ref> names an entry in that chapter's glossary.js and every glossary
// entry is used; every <tb-check> has a question, at least two options, exactly one data-correct and an
// explanation; every <tb-sort> has at least two bins, and every item names a bin and carries a data-why;
// every id in the document is unique; there is exactly one <h1>, on a chapter page (main[data-chapter])
// every <h2> is the direct child of a <section id> so the shell can number it, and no heading level is
// skipped; every "Figure N.M" mentioned in the prose exists and
// every figure is mentioned at least once; every relative href resolves to a file; and no TODO,
// FIXME, XXX or lorem is left in the page.
//
// Bound: it reads the authored HTML with a small tolerant tokenizer, not the rendered DOM, so it knows
// nothing about what the scripts produce (numbering, popovers, figure content) and nothing about
// pixels. The tokenizer handles the markup this repo writes; it is not an HTML5 parser.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
    const re = new RegExp(`Figure\\s+${chapter}\\.(\\d+)`, 'g');
    for (const p of prose) {
      let m;
      const t = textOf(p);
      while ((m = re.exec(t))) mentioned.add(Number(m[1]));
    }
    for (const n of mentioned) if (n < 1 || n > figures.length) fail(`prose mentions Figure ${chapter}.${n} but the chapter has ${figures.length} figures`);
    figures.forEach((f, i) => {
      if (!mentioned.has(i + 1)) fail(`Figure ${chapter}.${i + 1} (<tb-figure id="${f.attrs.id}">) is never mentioned in the prose`, f);
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
export function checkChapterData({ objectives = [], items = [], sections = [], figures = [], kinds = [], file = 'chapter' } = {}) {
  const fails = [];
  const fail = (msg) => fails.push(`${file}: ${msg}`);
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
  for (const o of objectives) {
    for (const p of o.prereqs ?? []) {
      if (!byId.has(p)) fail(`objective "${o.id}" requires "${p}", which is not an objective of this chapter`);
    }
  }
  // A cycle in the prerequisite graph would hang the queue: it would look for a foundation forever.
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
    if (!it.id) fail('an item has no id');
    else if (seen.has(it.id)) fail(`item id "${it.id}" is used twice`);
    else seen.add(it.id);
    if (!byId.has(it.objective)) fail(`item "${id}" tests objective "${it.objective}", which this chapter does not declare`);
    else perObjective.set(it.objective, perObjective.get(it.objective) + 1);
    if (!it.explain) fail(`item "${id}" has no explanation, so a reader who gets it wrong learns nothing`);
    if (it.kind === 'mcq') {
      const options = it.options ?? [];
      if (options.length < 2) fail(`item "${id}" has ${options.length} option(s); a multiple choice needs at least two`);
      const correct = options.filter((o) => o.correct).length;
      if (correct !== 1) fail(`item "${id}" has ${correct} correct options; exactly one is required`);
      for (const o of options) {
        if (!o.correct && !o.why) fail(`item "${id}" has a distractor with no "why"; a distractor must say what choosing it reveals`);
      }
    } else if (it.kind === 'task') {
      if (!it.figure) fail(`item "${id}" is a task with no figure`);
      else if (figures.length && !figures.includes(it.figure)) fail(`item "${id}" sets a task on figure "${it.figure}", which the chapter does not have`);
      if (!it.expect) fail(`item "${id}" is a task with no "expect", so nothing can grade it`);
    } else if (it.kind === 'free') {
      if (!(it.rubric ?? []).length) fail(`item "${id}" is free response with no rubric, so nothing can grade it`);
    } else {
      fail(`item "${id}" has kind "${it.kind}"; expected mcq, task or free`);
    }
  }
  if (items.length) {
    for (const [id, n] of perObjective) {
      if (n < 3) fail(`objective "${id}" has ${n} item(s); the review queue needs at least three so a reader cannot memorise the one`);
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
  let total = 0;
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
      file: `${dirname(rel)}/objectives.js`,
    });
    const all = [...fails, ...dataFails];
    total += all.length;
    const counts = [`${findAll(tree, (n) => n.tag === 'tb-figure').length} figures`, `${Object.keys(glossary).length} glossary entries`];
    if (objectives.length) counts.push(`${objectives.length} objectives`);
    if (items.length) counts.push(`${items.length} items`);
    console.log(`${all.length ? 'FAIL' : 'ok  '} ${rel} (${counts.join(', ')})`);
    for (const f of all) console.log(`  ${f}`);
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
