// The pages that load the shell, read off the tree a reader can fetch.
//
// Why a second page list beside PAGES in tools/lib/browser.js. PAGES is what the page gates visit — the
// library, each book, its chapters and Today — and it leaves out lab/, which is published, loads the
// shell, and can be opened by anyone. The theme block in src/theme-early.js is owed by every page whose
// modules reach src/shell.js, because the shell is what applies the reader's theme, and it applies it
// only after the page has been styled once. So the rule is keyed on that — which pages load the shell —
// and not on which pages a gate happens to visit (docs/policies/local-rules.md, "Key a rule on the thing
// that makes it required").
//
// How. Every .html file the published site would serve (`publishedFiles` in tools/pages-exclude.js, the
// matcher the Pages workflow deploys through, so a page under test/ or docs/ is not a page), each page's
// <script> elements read for the modules they load, and every module followed through its own static
// `import`, `export … from` and `import('…')` of a string literal, until src/shell.js is reached or the
// graph runs out. A `<script src>` is a URL, resolved against the page, so `src="lab.js"` is the page's
// neighbour; an `import` specifier follows module rules, so a bare one (`three`) resolves through the
// import map to a CDN and is not followed. Neither is anything on another origin or outside the repository.
//
// Bound: it reads source text. An import whose specifier is computed at runtime is not followed, so a
// page that reached the shell only that way would not be found; and an `import` written at the start of
// a line inside a template string would be followed as if it were code, which can only add a page.
// test/theme-early.test.js derives the population a second way — the gates' own PAGES, and a plain
// search of every published page for the shell's two entry modules — and fails if this walk found fewer.
// Neither derivation sees a page outside PAGES that names neither module in its markup, so that case, a
// page loading its own script by a relative `src`, is held by a fixture in the same test.
import { existsSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publishedFiles } from '../pages-exclude.js';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** The module every page that owes the theme block reaches. */
export const SHELL_MODULE = 'src/shell.js';

/**
 * Every HTML comment replaced by spaces, its newlines kept, so an offset or a line number found in the
 * result points at the same place in the file on disk. A comment can mention `<script>` or `<link>`
 * (tongjian/index.html explains its own `<html>` tag in one), and read as markup that would be a page
 * carrying something it does not.
 */
export function blankComments(html) {
  return String(html).replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

// A static import or re-export must begin its line; a dynamic import of a string literal may sit
// anywhere. The first two are anchored so that `export const KEY = 'x'` is not read as a module.
const STATIC_IMPORT = /^[ \t]*import\s*(?:[\w$*{}\s,]+?\s*from\s*)?['"]([^'"\n]+)['"]/gm;
const REEXPORT = /^[ \t]*export\s*(?:\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s*from\s*['"]([^'"\n]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*['"]([^'"\n]+)['"]\s*\)/g;

/** The module specifiers a script names. */
export function specifiers(js) {
  const text = String(js);
  return [...text.matchAll(STATIC_IMPORT), ...text.matchAll(REEXPORT), ...text.matchAll(DYNAMIC_IMPORT)].map((m) => m[1]);
}

/**
 * A page's `<script src>` as a repository-relative path, or null when it names another origin. A `src`
 * is a URL resolved against the page, so `lab.js`, `./lab.js`, `../src/shell.js` and `/src/shell.js` all
 * resolve; the import-specifier rule below, where a bare name goes through the import map, is for
 * `import` alone (review finding R3, 2026-09-23: `src="lab.js"` had been dropped as a bare specifier).
 */
function resolveSrc(pageFile, src) {
  const base = 'http://page.invalid/';
  let url;
  try {
    url = new URL(src, base + pageFile);
  } catch {
    return null;
  }
  if (url.origin !== new URL(base).origin) return null;
  return decodeURIComponent(url.pathname).replace(/^\/+/, '') || null;
}

/** An import specifier as a repository-relative path, or null when it leaves the repository. */
function resolveFrom(fromFile, spec) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(spec) || spec.startsWith('//')) return null;
  const bare = spec.split(/[?#]/)[0];
  let out;
  if (bare.startsWith('/')) out = posix.normalize(bare.slice(1));
  else if (bare.startsWith('./') || bare.startsWith('../')) out = posix.normalize(posix.join(posix.dirname(fromFile), bare));
  else return null;
  return out.startsWith('../') ? null : out;
}

/** A page's scripts: the files it loads by `src`, and the text of the ones written inline. */
export function scriptsOf(html) {
  const found = { sources: [], inline: [] };
  for (const m of blankComments(html).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = m[1];
    const type = (/\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1] ?? '').toLowerCase();
    // An import map or a JSON island holds no code; everything else might.
    if (type && !['module', 'text/javascript', 'application/javascript'].includes(type)) continue;
    const src = /\bsrc\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1];
    if (src) found.sources.push(src);
    else found.inline.push(m[2]);
  }
  return found;
}

/**
 * The chain of files by which a page reaches the shell — the page, then each module in turn, ending in
 * src/shell.js — or null when it never does.
 */
export function shellChain(pageFile, root = REPO_ROOT) {
  const { sources, inline } = scriptsOf(readFileSync(join(root, pageFile), 'utf8'));
  const parent = new Map();
  const queue = [];
  const visit = (from, file) => {
    if (!file || parent.has(file)) return;
    parent.set(file, from);
    queue.push(file);
  };
  for (const src of sources) visit(pageFile, resolveSrc(pageFile, src));
  for (const body of inline) for (const spec of specifiers(body)) visit(pageFile, resolveFrom(pageFile, spec));
  while (queue.length) {
    const file = queue.shift();
    if (file === SHELL_MODULE) {
      const chain = [file];
      for (let at = parent.get(file); at !== pageFile; at = parent.get(at)) chain.unshift(at);
      return [pageFile, ...chain];
    }
    const abs = join(root, file);
    if (!/\.m?js$/.test(file) || !existsSync(abs)) continue;
    for (const spec of specifiers(readFileSync(abs, 'utf8'))) visit(file, resolveFrom(file, spec));
  }
  return null;
}

/** The URL path a published HTML file is served at, relative to the site's root. */
export function servedPath(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`;
  return `/${file}`;
}

/**
 * Every published page that loads the shell: `{ file, path, via }`, where `file` is repository-relative,
 * `path` is where the site serves it, and `via` is the chain of modules that reaches src/shell.js.
 * Sorted by file.
 */
export function shellPages(root = REPO_ROOT) {
  return publishedFiles(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ file, path: servedPath(file), via: shellChain(file, root) }))
    .filter((page) => page.via !== null);
}
