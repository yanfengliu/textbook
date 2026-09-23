// The one matcher for tools/pages-exclude.txt, read by every consumer of that list, so the tree proved
// by `npm run subpath`, the tree deployed by .github/workflows/pages.yml and the tree asserted by
// test/publish.test.js cannot drift apart.
//
// Why it exists. The list used to be literal paths only, because the workflow deleted it with
// `xargs -r rm -rf` and neither `rm` nor `xargs` expands a glob. That made the two chapter briefs a
// roll-call: `biology/ch02-chemistry-of-life/FIGURES.md` and `biology/ch03-cells/FIGURES.md` were named
// one at a time, so chapter 4's brief — being written on 2026-09-16, tens of kilobytes of internal notes
// inside the published chapter directory — would have deployed to the live site, and so would every
// chapter after it. `docs/policies/local-rules.md` already forbids this shape: derive the list from the
// tree, do not maintain one.
//
// Why a Node module rather than a shell glob. Bash can expand `**/*.md` under `shopt -s globstar`, but
// then the workflow would be matching with bash's rules and `tools/subpath.js` with JavaScript's, and
// the two agreeing would be a coincidence maintained by hand — the same drift the single list exists to
// prevent, moved one level down. One compiler, three callers, and the workflow calls this file rather
// than re-deriving anything: `node tools/pages-exclude.js --print0 | xargs -0 rm -rf`.
//
// Bound: it matches paths, not contents. A file whose NAME says nothing about being internal is not
// caught by any pattern, and `test/publish.test.js` is what asks whether anything internal survives.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIST_URL = new URL('./pages-exclude.txt', import.meta.url);
export const LIST_PATH = 'tools/pages-exclude.txt';
const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));

// Dropped by actions/upload-pages-artifact itself, whatever the list says, and never walked here: .git
// is large and slow and nothing under it is ever published. They are not emitted for deletion, because
// the workflow has never deleted them and does not need to.
export const NEVER_WALKED = ['.git', '.github'];

/**
 * The patterns of one list, in file order. A blank line or a line whose first non-space character is
 * `#` is a comment. Everything else is a pattern. Pure, so a test can hand it a list that must be
 * refused without writing one to disk — and so a refusal it measures is this rule's and not the file
 * system's.
 */
export function parsePatterns(text, where = LIST_PATH) {
  const patterns = [];
  for (const [i, raw] of String(text).split('\n').entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('/') || line.includes('\\')) {
      throw new Error(`${where} line ${i + 1}: "${line}" — a pattern is relative to the repository root and uses "/" as its separator, so it may not start with "/" or contain "\\". Write it as biology/ch02-chemistry-of-life/FIGURES.md or **/*.md.`);
    }
    patterns.push(line);
  }
  if (!patterns.length) throw new Error(`${where} holds no patterns, so nothing would be trimmed from the published site and the whole repository would deploy. It must name at least one.`);
  return patterns;
}

export function readPatterns(url = LIST_URL) {
  return parsePatterns(readFileSync(url, 'utf8'));
}

// One pattern, compiled. `**` crosses path separators, `*` and `?` do not, and everything else is
// literal. A `**` followed by a slash may match zero segments, so `**/*.md` catches README.md at the
// root as well as biology/ch04-membranes-and-transport/FIGURES.md.
export function compile(pattern) {
  let out = '';
  for (let i = 0; i < pattern.length; i += 1) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        // `**/` swallows the slash so that it may also match zero segments.
        if (pattern[i + 2] === '/') { out += '(?:[^/]+/)*'; i += 2; } else { out += '.*'; i += 1; }
      } else out += '[^/]*';
    } else if (c === '?') out += '[^/]';
    else out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${out}$`);
}

/**
 * Does this path leave the published tree? `rel` is relative to the repository root, with either
 * separator. A pattern that matches a directory excludes everything under it, which is what makes the
 * literal entries (`docs`, `tools`) mean what they have always meant.
 */
export function makeMatcher(patterns = readPatterns()) {
  const res = patterns.map(compile);
  return (rel) => {
    const path = String(rel).split(sep).join('/').replace(/^\.\//, '');
    if (!path) return false;
    const segments = path.split('/');
    for (let n = 1; n <= segments.length; n += 1) {
      const prefix = segments.slice(0, n).join('/');
      if (res.some((re) => re.test(prefix))) return true;
    }
    return false;
  };
}

export const PATTERNS = readPatterns();
export const isExcluded = makeMatcher(PATTERNS);

/**
 * The shortest paths whose removal trims the tree: a directory that is excluded is named once rather
 * than file by file, and nothing under it is walked. Sorted, so the workflow's log reads the same way
 * twice. `.git` and `.github` are skipped and never named (see NEVER_WALKED).
 */
export function excludedPaths(root = REPO_ROOT, matches = isExcluded) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const abs = join(dir, entry.name);
      const rel = relative(root, abs).split(sep).join('/');
      if (NEVER_WALKED.includes(rel)) continue;
      if (matches(rel)) { found.push(rel); continue; }
      if (entry.isDirectory()) walk(abs);
    }
  };
  walk(root);
  return found;
}

/**
 * Every file that would be published, relative to the root and sorted. This is what a reader can fetch.
 */
export function publishedFiles(root = REPO_ROOT, matches = isExcluded) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const abs = join(dir, entry.name);
      const rel = relative(root, abs).split(sep).join('/');
      if (NEVER_WALKED.includes(rel) || matches(rel)) continue;
      if (entry.isDirectory()) walk(abs);
      else files.push(rel);
    }
  };
  walk(root);
  return files;
}

// CLI: what .github/workflows/pages.yml deletes from its checkout. --print0 because a path may hold a
// space and `xargs` splits on one; --print for a person reading the run's log.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const root = args.find((a) => !a.startsWith('--')) ?? process.cwd();
  const paths = excludedPaths(root);
  if (!paths.length) {
    console.error(`FAIL: ${LIST_PATH} matched nothing under ${root}. The trim would publish the whole repository, so this stops rather than deploying it.`);
    process.exit(1);
  }
  if (args.includes('--print0')) process.stdout.write(`${paths.join('\0')}\0`);
  else for (const p of paths) console.log(p);
}
