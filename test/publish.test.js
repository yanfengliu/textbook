// What GitHub Pages publishes, asserted without a browser.
//
// The defect. tools/pages-exclude.txt used to name each chapter's internal figure brief one at a time —
// `biology/ch02-chemistry-of-life/FIGURES.md`, `biology/ch03-cells/FIGURES.md` — because the workflow
// deleted the list with `xargs rm -rf` and neither `rm` nor `xargs` expands a glob. On 2026-09-16
// chapter 4 was being written, its brief was not on that list, and `biology/ch04-membranes-and-transport/
// FIGURES.md` appeared on disk while this test was being written: tens of kilobytes of internal notes
// that would have deployed to the live site, and the same for chapters 5 to 32. That is the shape
// docs/policies/local-rules.md forbids — derive the list from the tree, do not maintain one.
//
// What this holds. The patterns are the rule, so the assertions are about the RULE and not about today's
// tree: a brief in a chapter directory that does not exist yet must already be excluded. It also holds
// that both consumers of the list still go through the one matcher, because the single source is the
// whole design and nothing else would notice a consumer wandering off.
//
// Bound: it reads the working tree and the two consumers' source. It proves what the trim would remove
// and what would survive it; it proves nothing about GitHub actually serving that tree, which is
// `npm run subpath`'s claim, and nothing about whether a surviving file is correct. It matches on PATHS,
// so an internal file whose name looks like the site's is invisible to it — the census below is the only
// thing that would catch one, and it is a census of names, not of contents.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATTERNS, NEVER_WALKED, compile, makeMatcher, parsePatterns, readPatterns, isExcluded, excludedPaths, publishedFiles } from '../tools/pages-exclude.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// ------------------------------------------------------------------------------------------------
// The defect this file exists for
// ------------------------------------------------------------------------------------------------

test('no internal Markdown survives into the published tree', () => {
  const published = publishedFiles();
  assert.ok(published.length > 20, `the walk found only ${published.length} published file(s), so it is broken and proves nothing; a check that cannot tell "passed" from "did not run" reports the second as the first`);
  const markdown = published.filter((p) => /\.md$/i.test(p));
  assert.deepEqual(markdown, [], `these Markdown files would be fetchable on the live site: ${markdown.join(', ')}. Every one of them is an internal note — a figure brief, a data directory's provenance, an agent instruction — and none is fetched by a page. Add the class of file to tools/pages-exclude.txt, not the instance.`);
});

test('a chapter brief is excluded by its shape, not by its name being on a list', () => {
  // The whole point: these paths mostly do not exist. A rule keyed on the tree as it is today is a
  // roll-call with extra steps, and the next chapter is what it misses.
  const wouldLeak = [
    'biology/ch04-membranes-and-transport/FIGURES.md',
    'biology/ch05-energy/FIGURES.md',
    'biology/ch32-the-last-one/FIGURES.md',
    'tongjian/ch09-whatever/FIGURES.md',
    'a-third-book/ch01-anything/FIGURES.md',
    'biology/ch07-x/NOTES.md',
    'biology/ch07-x/draft.md',
    'a-third-book/README.md',
    'tongjian/README.md',
    'README.md',
    'AGENTS.md',
  ];
  for (const path of wouldLeak) {
    assert.ok(isExcluded(path), `${path} would be published. tools/pages-exclude.txt must exclude it by pattern; if a future file of this shape really is part of the site, the pattern is what has to change, so that the decision is stated once rather than remembered per chapter.`);
  }
});

test('the site itself survives the trim, including files no pattern mentions', () => {
  // Keyed on what a reader must be able to fetch. A pattern that ate the site would otherwise pass
  // every assertion above by publishing nothing at all.
  const mustSurvive = [
    'index.html',
    '.nojekyll',
    'biology/index.html',
    'biology/ch01-what-is-life/index.html',
    'biology/ch01-what-is-life/glossary.js',
    'biology/ch01-what-is-life/items.js',
    'tongjian/index.html',
    'tongjian/zj.css',
    'tongjian/lexicon.js',
    'today/index.html',
    'src/shell.js',
    'src/styles/tokens.css',
    'src/figures/registry.js',
  ];
  const published = new Set(publishedFiles());
  for (const path of mustSurvive) {
    assert.ok(!isExcluded(path), `${path} is excluded from the published site, so the live site would 404 on it`);
    assert.ok(published.has(path), `${path} is not in the published tree; either it has moved or a pattern in ${'tools/pages-exclude.txt'} is eating the site`);
  }
});

test("the workflow's own required-files guard names files that survive", () => {
  // .github/workflows/pages.yml fails the deploy when one of these is missing after the trim. If a
  // pattern ever removes one, this says so on `npm run unit` rather than on a deploy.
  const yml = read('.github/workflows/pages.yml');
  const line = /for required in ([^;]+); do/.exec(yml);
  assert.ok(line, 'the required-files guard has gone from .github/workflows/pages.yml; it is what stops a bad trim publishing a blank site');
  const required = line[1].trim().split(/\s+/);
  assert.ok(required.length >= 3, `the guard lists only ${required.length} file(s): ${required.join(', ')}`);
  const published = new Set(publishedFiles());
  for (const path of required) {
    assert.ok(published.has(path), `.github/workflows/pages.yml requires ${path} after the trim, but the trim removes it, so every deploy would fail`);
  }
});

// ------------------------------------------------------------------------------------------------
// One list, one matcher: the consumers
// ------------------------------------------------------------------------------------------------

test('both consumers of the list go through the one matcher', () => {
  // The list being single-source is the design. A consumer that re-implements the matching would agree
  // with it until the first glob, which is exactly the drift the single file exists to prevent — and
  // nothing else in the repository would notice.
  const subpath = read('tools/subpath.js');
  assert.match(subpath, /from '\.\/pages-exclude\.js'/, 'tools/subpath.js no longer imports the shared matcher, so the tree it serves can differ from the tree that deploys');
  assert.doesNotMatch(subpath, /pages-exclude\.txt/, 'tools/subpath.js reads tools/pages-exclude.txt directly again; it must go through tools/pages-exclude.js, which is where a pattern gets its meaning');

  const yml = read('.github/workflows/pages.yml');
  assert.match(yml, /node tools\/pages-exclude\.js/, '.github/workflows/pages.yml no longer calls tools/pages-exclude.js. It cannot expand a glob itself: `rm` does not and `xargs` does not, so a pattern like **/*.md would match nothing there and the whole repository would deploy.');
  assert.doesNotMatch(yml, /grep .* tools\/pages-exclude\.txt/, '.github/workflows/pages.yml reads the list with grep again, which matches literal paths only');
  assert.match(yml, /node-version-file: \.nvmrc/, 'the Pages workflow runs Node for the trim, so it must pin the same Node the repository does; otherwise a version mismatch reads as the trim failing');
});

test('the matcher and the published walk partition the tree', () => {
  // A second derivation, so the two cannot pass by agreeing on nothing. Every file on disk is either
  // published or under one of the roots the workflow deletes; a matcher that silently dropped a file
  // from both lists would be caught here and nowhere else.
  const onDisk = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      const rel = relative(ROOT, abs).split(sep).join('/');
      if (NEVER_WALKED.includes(rel)) continue;
      if (entry.isDirectory()) walk(abs);
      else onDisk.push(rel);
    }
  };
  walk(ROOT);
  assert.ok(onDisk.length > 100, `this test's own walk found ${onDisk.length} file(s), so it is broken`);

  const deleted = excludedPaths();
  assert.ok(deleted.length > 0, 'the trim would delete nothing, so the whole repository would deploy');
  const published = new Set(publishedFiles());
  for (const path of onDisk) {
    const underDeleted = deleted.some((d) => path === d || path.startsWith(`${d}/`));
    assert.ok(published.has(path) !== underDeleted,
      `${path} is ${published.has(path) ? 'both published and' : 'neither published nor'} under a deleted root. The two derivations disagree, so one of them is not reading the list the deploy reads.`);
  }
});

test('the deleted roots are the shortest ones, so the workflow log stays readable', () => {
  const deleted = excludedPaths();
  for (const path of deleted) {
    const parent = path.split('/').slice(0, -1).join('/');
    if (!parent) continue;
    assert.ok(!deleted.includes(parent), `${path} is named for deletion although its parent ${parent} already is`);
  }
  assert.ok(deleted.includes('docs'), 'docs/ is not being trimmed; the design notes and every work round would be published');
  assert.ok(deleted.includes('tools'), 'tools/ is not being trimmed');
});

// ------------------------------------------------------------------------------------------------
// The pattern language, so both consumers mean the same thing by one
// ------------------------------------------------------------------------------------------------

test('a literal pattern takes everything under it, and a glob stays inside its segment', () => {
  const match = makeMatcher(['docs', 'out', '*.log', 'a/*/b', '**/*.md', '**/x?z']);
  assert.ok(match('docs'), 'a literal pattern must match the path itself');
  assert.ok(match('docs/design/textbook.md'), 'a literal pattern must take everything under it');
  assert.ok(!match('docsy'), 'a literal pattern must not match a longer sibling name');
  assert.ok(!match('src/docs'), 'a literal pattern is anchored at the repository root');

  assert.ok(match('build.log'), '* must match inside one segment');
  assert.ok(!match('src/build.log'), '* must not cross a path separator');
  assert.ok(match('a/anything/b'), 'a * in the middle must match one whole segment');
  assert.ok(!match('a/one/two/b'), 'a * must not swallow two segments');

  assert.ok(match('README.md'), 'a ** followed by a slash must be able to match zero segments');
  assert.ok(match('biology/ch04-x/FIGURES.md'), '** must cross path separators');
  assert.ok(match('a/b/c/d/e.md'), '** must cross any number of path separators');
  assert.ok(!match('notes.mdx'), 'a pattern is anchored at both ends');
  assert.ok(match('deep/dir/xyz'), '? must match exactly one character');
  assert.ok(!match('deep/dir/xz'), '? must not match zero characters');
});

test('a regex metacharacter in a pattern is a literal', () => {
  const match = makeMatcher(['package.json', 'a+b', 'c(d)']);
  assert.ok(match('package.json'));
  assert.ok(!match('packageXjson'), 'a dot in a pattern is a dot, not "any character"');
  assert.ok(match('a+b') && !match('aab'), '+ is a literal');
  assert.ok(match('c(d)'), 'parentheses are literals');
});

test('a pattern the matcher cannot mean is refused, and says which line and what would satisfy it', () => {
  // The error is read, not just counted: `assert.throws` alone would pass on a TypeError from the test's
  // own scaffolding, which is how the first draft of this test passed while measuring nothing.
  const refusal = (text) => {
    try {
      parsePatterns(text, 'a-list');
    } catch (err) {
      return err.message;
    }
    return assert.fail(`parsePatterns accepted ${JSON.stringify(text)}`);
  };
  const leading = refusal('# a comment\n\n/docs\n');
  assert.match(leading, /a-list line 3/, 'the message must name the list and the offending line');
  assert.match(leading, /"\/docs"/, 'the message must quote the offending pattern');
  assert.match(leading, /relative to the repository root/, 'the message must say what would satisfy it');
  assert.match(refusal('biology\\ch04\n'), /a-list line 1/);
  assert.match(refusal('# only comments\n\n'), /at least one/, 'an empty list must stop rather than publish the whole repository');
  // And a list that is fine parses, so the refusals above are not a parser that refuses everything.
  assert.deepEqual(parsePatterns('# comment\n\ndocs\n  out  \n**/*.md\n'), ['docs', 'out', '**/*.md']);
});

test('the list on disk parses and holds the patterns the site depends on', () => {
  assert.deepEqual(PATTERNS, readPatterns(), 'the exported patterns are not what the file says');
  assert.ok(PATTERNS.includes('**/*.md'), 'tools/pages-exclude.txt no longer excludes Markdown by pattern, so the next chapter brief will deploy');
  const roll = PATTERNS.filter((p) => /FIGURES\.md$/.test(p));
  assert.deepEqual(roll, [], `tools/pages-exclude.txt names ${roll.join(', ')} one at a time again; the pattern covers them, and a roll-call is what published chapter 4's brief`);
  assert.ok(compile('**/*.md').test('biology/ch99-x/FIGURES.md'));
});
