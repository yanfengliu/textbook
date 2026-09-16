// The page list the gates visit is discovered from disk (tools/lib/browser.js). Discovery that quietly
// finds nothing is the dangerous failure: PAGES would still hold the library and Today, every page gate
// would still go green, and it would have checked no chapter at all — a gate that cannot tell "passed"
// from "did not run" reports the second as the first.
//
// So this test derives the expected set a SECOND way, by walking the tree here, and requires the two to
// agree exactly. A check built out of the thing it checks proves only that the code agrees with itself.
//
// Bound: the repository as it is on disk now. It proves discovery finds every chapter that exists and
// invents none; it says nothing about whether those pages load, which is what `npm run shot` is for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, BOOKS, discoverBooks } from '../tools/lib/browser.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const NOT_BOOKS = new Set(['node_modules', 'src', 'tools', 'test', 'docs', 'out', '.git', '.github', 'progress']);

// Walk the tree independently of discoverBooks: any directory holding chNN-<slug>/index.html.
function chaptersOnDisk() {
  const found = [];
  for (const name of readdirSync(ROOT)) {
    if (NOT_BOOKS.has(name) || name.startsWith('.')) continue;
    const dir = join(ROOT, name);
    if (!statSync(dir).isDirectory()) continue;
    for (const sub of readdirSync(dir)) {
      if (!/^ch\d\d-/.test(sub)) continue;
      if (!existsSync(join(dir, sub, 'index.html'))) continue;
      found.push(`/${name}/${sub}/`);
    }
  }
  return found.sort();
}

test('discovery finds every chapter on disk and invents none', () => {
  const onDisk = chaptersOnDisk();
  assert.ok(onDisk.length > 0, 'this test found no chapters at all, so it cannot prove anything; the walk above is broken');
  const discovered = BOOKS.flatMap((b) => b.chapters.map((c) => c.path)).sort();
  assert.deepEqual(discovered, onDisk, 'discoverBooks() and a plain walk of the tree disagree about which chapters exist');
});

test('the gates visit every chapter', () => {
  const onDisk = chaptersOnDisk();
  for (const path of onDisk) {
    assert.ok(PAGES.some((p) => p.path === path), `${path} exists on disk but no gate visits it; PAGES is ${JSON.stringify(PAGES.map((p) => p.path))}`);
  }
});

test('PAGES holds the library, a book and at least one chapter', () => {
  // The shape every page gate assumes. Losing any of the three would leave the gates green over a
  // smaller and smaller site without a word.
  assert.ok(PAGES.some((p) => p.path === '/'), 'the library page is missing from PAGES');
  assert.ok(BOOKS.length > 0, 'no book was discovered');
  assert.ok(PAGES.filter((p) => /^\/[^/]+\/ch\d\d-/.test(p.path)).length > 0, 'PAGES contains no chapter');
  const ids = PAGES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, `two pages share an id: ${ids.join(', ')}`);
});

test('a chapter page id names its book, so two books cannot both have a "ch01"', () => {
  // The defect this exists for, found 2026-09-12 by the baseline probe that preceded the second book:
  // a chapter's id was the chapter number alone, so `biology/ch01` and `tongjian/ch01` were both `ch01`.
  // The uniqueness assertion above already existed and WOULD have caught it — but only once the second
  // book's page was on disk, which means a correct new chapter turned an unrelated gate red, and the
  // failure reads as "the new book broke pages.test.js" rather than "the page list only worked for one
  // book". `SHOT_PAGES=ch01`, `DEVICE_PAGES=ch01` and `tools/inspect.js --page ch01` were ambiguous in
  // the same way and silently measured two pages.
  //
  // Asserted on the id's own shape rather than on uniqueness, because after the fix uniqueness follows
  // from construction and a test of it would agree with the code by definition. This one fails if the
  // book component is ever dropped again.
  const byKey = new Map(PAGES.map((p) => [p.id, p]));
  for (const book of BOOKS) {
    for (const chapter of book.chapters) {
      assert.ok(chapter.id.startsWith(`${book.id}/`),
        `chapter ${chapter.path} has page id "${chapter.id}", which does not name the book "${book.id}"; two books then share an id for the same chapter number`);
      const page = byKey.get(chapter.id);
      assert.ok(page, `no page in PAGES carries the id "${chapter.id}" for ${chapter.path}`);
      assert.equal(page.path, chapter.path, `page "${chapter.id}" points at ${page.path}, not ${chapter.path}`);
    }
  }
  // And the study system's own key for a chapter already has this shape, so the two agree.
  for (const book of BOOKS) {
    for (const chapter of book.chapters) {
      assert.match(chapter.id, /^[^/]+\/ch\d\d$/, `chapter id "${chapter.id}" is not <book>/chNN`);
    }
  }
});

test('a book with no chapters is not a book, and a chapter needs its index.html', () => {
  // Discovery is pointed at a tree with neither, so an empty answer here is the right answer and an
  // exception is not. `today/` and `lab/` have an index.html and no chapters; they must not appear.
  const named = BOOKS.map((b) => b.id);
  assert.ok(!named.includes('today'), 'today/ has no chapters and must not be discovered as a book');
  assert.ok(!named.includes('lab'), 'lab/ has no chapters and must not be discovered as a book');
  assert.deepEqual(discoverBooks(fileURLToPath(new URL('../docs/', import.meta.url))), [], 'docs/ holds no book');
});

test('chapters come back in reading order', () => {
  for (const book of BOOKS) {
    const ns = book.chapters.map((c) => c.n);
    assert.deepEqual(ns, [...ns].sort((a, b) => a - b), `${book.id}'s chapters are out of order: ${ns.join(', ')}`);
  }
});
