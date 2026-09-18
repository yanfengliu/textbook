// What this file proves, and what it cannot.
//
// The three standing records are looked up, not read. `docs/learning/gate-proofs.md` and
// `docs/learning/defect-register.md` each open with a statement of the file's shape and an index of every
// entry, one line each, and a reader is told to read the top and then the one entry the index sends them
// to. An entry with no line in the index is therefore an entry nobody finds, and a line whose anchor
// matches no heading is a pointer that dead-ends. Nothing else in the repository can see either, because
// the files are prose: the promises in their own headers are the only contract they carry.
//
// The class is real and cost a round. Commit `3d3be2c` exists because a new `gate-proofs.md` entry landed
// without its index line, and the missing line was found only when the owner asked a second time whether
// the work was finished. The shell command that staged the file had selected the line with PowerShell's
// `-like` and a pattern beginning `- [a quotation…]`; in `-like`, `[...]` is a character class, so the
// pattern matched nothing, the line came back empty, and it was dropped from every commit while sitting
// correctly in the working tree.
//
// This file proves, holding each file to the promise its own header makes:
//
//   1. **Every entry is reachable from the index.** An entry is a `## ` heading that is not one of the
//      structural headings named in `STANDING` below; each one must be the target of a link somewhere in
//      the index region, or the reader the index serves never reaches it.
//   2. **Every index link resolves.** A `[text](#anchor)` link in the index whose anchor matches no
//      heading in the file is a broken pointer, and the failure names the link text, the anchor and the
//      file. Anchors are GitHub's slugs — lowercase, punctuation dropped, spaces to hyphens, Han
//      characters kept — because that is what the links are for; duplicate headings take GitHub's `-1`,
//      `-2` suffixes rather than colliding.
//   3. **The populations are not empty.** Each file must yield headings, entry headings and index links
//      before anything is compared, and the run prints every count it read. A scan that finds nothing
//      must not read as one that found everything.
//
// What it decides about `defect-register.md`'s "By area" section, and why:
//
//   The section is prose bullets naming entries by date and subject rather than by link, so there is no
//   anchor in it to resolve and nothing there is treated as a pointer. What is checkable is the date: a
//   bullet naming a date no entry carries is the same stale pointer as a dead anchor, one indirection
//   further out. Its header also states that the index groups by area at the end, so the section's
//   presence and at least one date in it are asserted too. The table above it is the part that must agree
//   in both directions, because its header says every line is one `## ` entry.
//
// Bound, stated rather than hidden:
//
//   - It proves the index and the entries **agree**. It does not check that a line's *description* of an
//     entry is accurate, and it says nothing about whether an entry's own claims are true. A line reading
//     "the base claim" that points at the wrong heading is caught; a line that describes the right
//     heading badly is not, and neither is a gate the entry describes that no longer exists or no longer
//     passes.
//   - `gate-proofs.md`'s index is a grouped bullet list, so a link there that resolves to a structural
//     heading rather than to an entry is not a failure: the promise a link makes is that its anchor
//     resolves. `defect-register.md`'s table is stricter, because its header promises one entry per line.
//   - The two files are read from the checkout that holds this test, or from the one `STANDING_DOCS_ROOT`
//     names — a check that reads whatever tree it was launched from reports on a tree nobody named. It
//     reads text, so it cannot see an anchor that resolves here but is broken on GitHub for a rule not
//     modelled below; the CJK anchors already in use are pinned by their own test, with the expected
//     strings typed out rather than derived, so the slugger cannot agree with itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.STANDING_DOCS_ROOT ?? fileURLToPath(new URL('../', import.meta.url));

// The structural headings of each file, excluded by name rather than by a pattern that happens to skip
// them: if one is renamed, `assertStructural` fails and says so, instead of the renamed section quietly
// becoming an "entry" that needs an index line, or an entry's heading quietly escaping the check.
const STANDING = [
  {
    file: 'docs/learning/gate-proofs.md',
    index: 'list',
    structural: [
      '# Gate proofs', // the file's title
      '## Read one entry, not the file', // how the file is meant to be used
      '### The shape of an entry', // the template an entry is copied from
      '## Index', // the index itself
      '# Six gates that were shipped unproved (2026-09-16)', // a batch heading over six entries, not a claim — the index says so on the line above them
    ],
  },
  {
    file: 'docs/learning/defect-register.md',
    index: 'table',
    structural: [
      '# Defect register', // the file's title
      '## Read one entry, not the file', // how the file is meant to be used
      '### The shape of an entry', // the template an entry is copied from
      '## Index', // the index itself
    ],
  },
];

const HEADING = /^(#{1,6})\s+(.*?)\s*$/;

// GitHub's slug rule, as the links in these files rely on it: lowercase, keep letters, numbers, combining
// marks, underscores and hyphens, drop everything else, then spaces to hyphens. Han characters are
// letters, so they survive — the provenance entry's anchor is the standing evidence.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}

// GitHub's duplicate rule: the first heading with a slug takes it bare, the next take `-1`, `-2`, …
function anchorsFor(headings) {
  const used = new Map();
  return headings.map((heading) => {
    const base = slugify(heading.text);
    let slug = base;
    if (used.has(base)) {
      let n = used.get(base) + 1;
      while (used.has(`${base}-${n}`)) n += 1;
      used.set(base, n);
      slug = `${base}-${n}`;
    }
    used.set(slug, 0);
    return slug;
  });
}

// Ranges of inline code on one line, so a backticked example like `` `[x](#y)` `` in the prose is not read
// as a link. The files quote anchors in backticks often.
function codeRanges(line) {
  const ranges = [];
  let open = -1;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] !== '`') continue;
    if (open < 0) open = i;
    else {
      ranges.push([open, i + 1]);
      open = -1;
    }
  }
  if (open >= 0) ranges.push([open, line.length]);
  return ranges;
}

function linksIn(line) {
  const code = codeRanges(line);
  const found = [];
  const link = /\[([^\]]*)\]\(([^)\s]+)\)/g;
  let m;
  while ((m = link.exec(line))) {
    if (code.some(([a, b]) => m.index >= a && m.index < b)) continue;
    if (!m[2].startsWith('#')) continue;
    found.push({ text: m[1], anchor: m[2].slice(1) });
  }
  return found;
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

// The nearest heading anchor to a broken one, offered only when the two share a real prefix, so the
// failure names the fix rather than dumping fifty anchors.
function nearestAnchor(anchor, anchors) {
  let best = null;
  let bestRun = 0;
  for (const a of anchors) {
    let n = 0;
    while (n < a.length && n < anchor.length && a[n] === anchor[n]) n += 1;
    if (n > bestRun) {
      bestRun = n;
      best = a;
    }
  }
  return bestRun >= 10 ? best : null;
}

function read(spec) {
  const path = join(ROOT, spec.file);
  assert.ok(
    existsSync(path),
    `standing-docs: ${spec.file} is not at ${path}. This test reads the standing records from the checkout that holds it, ` +
      `or from the one STANDING_DOCS_ROOT names, so point that variable at the tree you meant to check.`,
  );
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');

  const headings = [];
  lines.forEach((line, i) => {
    const m = HEADING.exec(line);
    if (m) headings.push({ line: i + 1, level: m[1].length, text: m[2] });
  });
  const anchors = anchorsFor(headings);
  const withAnchors = headings.map((h, i) => ({ ...h, anchor: anchors[i] }));

  const present = new Set(headings.map((h) => `${'#'.repeat(h.level)} ${h.text}`));
  const missingStructural = spec.structural.filter((h) => !present.has(h));

  const excluded = new Set(spec.structural);
  const entries = withAnchors.filter((h) => h.level === 2 && !excluded.has(`## ${h.text}`));

  const indexAt = lines.findIndex((line) => /^##\s+Index\s*$/.test(line));
  const after = indexAt < 0 ? -1 : lines.findIndex((line, i) => i > indexAt && /^##\s/.test(line));
  const end = after < 0 ? lines.length : after;

  const indexLinks = [];
  const rows = [];
  if (indexAt >= 0) {
    for (let i = indexAt + 1; i < end; i += 1) {
      if (spec.index === 'table' && /^\|\s*\[/.test(lines[i])) rows.push(i + 1);
      for (const link of linksIn(lines[i])) indexLinks.push({ ...link, line: i + 1 });
    }
  }

  return { spec, path, lines, headings, withAnchors, entries, indexAt, end, indexLinks, rows, missingStructural };
}

// Checked after the populations, so a file the mutation stripped fails on the empty population — the
// reason this test exists — rather than on the structural headings that went with it.
function assertStructural(r) {
  assert.deepEqual(
    r.missingStructural,
    [],
    `standing-docs: ${r.spec.file} no longer contains ${plural(r.missingStructural.length, 'heading', 'headings')} this test excludes ` +
      `by name as structural rather than as an entry:\n` +
      r.missingStructural.map((h) => `  ${h}`).join('\n') +
      `\nIf a section was renamed, rename it in STANDING with the reason it is not an entry; if it was deleted, delete it there too.`,
  );
}

function assertIndexPresent(r) {
  assert.ok(
    r.indexAt >= 0,
    `standing-docs: ${r.spec.file} has no "## Index" heading, so there is no index to hold the entries to; its header says every entry has one line there.`,
  );
}

function diagnostic(r) {
  const counts = [
    `${r.lines.length} lines`,
    `${r.headings.length} headings`,
    `${plural(r.entries.length, 'entry', 'entries')}`,
    `${plural(r.indexLinks.length, 'index link', 'index links')}`,
  ];
  if (r.spec.index === 'table') counts.push(`${plural(r.rows.length, 'table row', 'table rows')}`);
  return `standing-docs: ${r.spec.file} — read ${counts.join(', ')}`;
}

// The denominators first, so a file reduced to nothing fails here rather than passing every comparison
// below over an empty population.
function assertPopulations(r) {
  const where = `${r.spec.file} (read from ${r.path})`;
  assert.ok(
    r.headings.length > 0,
    `standing-docs: ${where} yielded no headings, so there is nothing to hold the index to. ` +
      `A scan that finds nothing must not read as one that found everything; check the file and check that ROOT is the tree you meant.`,
  );
  assert.ok(
    r.entries.length > 0,
    `standing-docs: ${where} yielded no entry headings, so every entry comparison would pass over nothing. ` +
      `If the entries really are gone, this file has no subject; if they were reworded into structural headings, STANDING needs the reason.`,
  );
  assert.ok(
    r.indexLinks.length > 0,
    `standing-docs: ${where} yielded no index links, so every link comparison would pass over nothing. ` +
      `An index that names nothing indexes nothing: put the entries back into the index, or delete the contradiction between the index and the file.`,
  );
  if (r.spec.index === 'table') {
    assert.ok(
      r.rows.length > 0,
      `standing-docs: ${where} yielded no table rows, so the "Every line is one \`## \` entry" promise is being checked against no lines. ` +
        `Restore the table, or update the header that promises it and this test with it.`,
    );
  }
}

function assertReachable(r) {
  const linked = new Set(r.indexLinks.map((l) => l.anchor));
  const unreachable = r.entries.filter((e) => !linked.has(e.anchor));
  assert.deepEqual(
    unreachable,
    [],
    `standing-docs: ${r.spec.file} has ${plural(unreachable.length, 'entry heading', 'entry headings')} with no line in its index, ` +
      `so a reader who follows the index never reaches ${unreachable.length === 1 ? 'it' : 'them'}:\n` +
      unreachable.map((e) => `  line ${e.line}: ## ${e.text}\n    add an index line linking to #${e.anchor}`).join('\n') +
      `\nEvery \`## \` heading that is an entry must be the target of a link in the index, and an entry with no line is the defect this test exists for.`,
  );
}

function assertResolvable(r) {
  const known = new Set(r.withAnchors.map((h) => h.anchor));
  const dead = r.indexLinks.filter((l) => !known.has(l.anchor));
  assert.deepEqual(
    dead,
    [],
    `standing-docs: ${r.spec.file} has ${plural(dead.length, 'index link', 'index links')} pointing at an anchor no heading in the file carries, ` +
      `so the pointer dead-ends:\n` +
      dead
        .map((l) => {
          const near = nearestAnchor(l.anchor, known);
          return (
            `  line ${l.line}: [${l.text}](#${l.anchor}) — no heading in ${r.spec.file} slugs to #${l.anchor}` +
            (near ? `; the nearest heading anchor is #${near}` : '')
          );
        })
        .join('\n') +
      `\nAnchors are GitHub's slugs: lowercase, punctuation dropped, spaces to hyphens, Han characters kept. ` +
      `A reworded heading needs its index line re-pointed; a link that names nothing needs a heading.`,
  );

  if (r.spec.index === 'table') {
    const entryAnchors = new Set(r.entries.map((e) => e.anchor));
    const stray = r.indexLinks.filter((l) => !entryAnchors.has(l.anchor));
    assert.deepEqual(
      stray,
      [],
      `standing-docs: ${r.spec.file} has ${plural(stray.length, 'table row', 'table rows')} pointing at a heading that is not an entry, ` +
        `while the file's header says every line is one \`## \` entry:\n` +
        stray.map((l) => `  line ${l.line}: [${l.text}](#${l.anchor})`).join('\n'),
    );
  }
}

// The "By area" bullets name entries by date rather than by link, so the date is the only part of them a
// machine can hold: a date no entry carries is a stale pointer one indirection out.
function assertByArea(r) {
  if (r.spec.index !== 'table') return;
  const at = r.lines.findIndex((line) => /^\*\*By area\b/.test(line));
  assert.ok(
    at >= 0,
    `standing-docs: ${r.spec.file} has no "**By area…**" section, which its header says the index ends with, ` +
      `so "what is still unwatched in an area you are changing" has no lookup. Restore it, or update the header and this test.`,
  );
  const region = r.lines.slice(at, r.end).join('\n');
  const dates = [...new Set(region.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [])];
  assert.ok(
    dates.length > 0,
    `standing-docs: ${r.spec.file}'s "By area" section names no date at all, so it points at no entry and the check would pass over nothing.`,
  );
  const entryDates = new Set(r.entries.map((e) => (e.text.match(/^\d{4}-\d{2}-\d{2}/) ?? [''])[0]));
  const stale = dates.filter((d) => !entryDates.has(d));
  assert.deepEqual(
    stale,
    [],
    `standing-docs: ${r.spec.file}'s "By area" section names ${plural(stale.length, 'date', 'dates')} no entry carries: ` +
      `${stale.join(', ')}. Each bullet names entries by date, so a date here that is not an entry is a pointer to nothing; ` +
      `correct the date or add the entry it means.`,
  );
}

test('the anchor rule is GitHub\'s, including the Han characters and the duplicates the index uses', () => {
  // Expected strings typed out rather than derived from `slugify`, so this pins the rule instead of asking
  // the slugger to agree with itself. The first is the standing CJK anchor the index links to today.
  assert.equal(
    slugify('provenance: a quotation of 通鑑 the page does not mark is invisible, and this is what makes it visible (`test/provenance.test.js`)'),
    'provenance-a-quotation-of-通鑑-the-page-does-not-mark-is-invisible-and-this-is-what-makes-it-visible-testprovenancetestjs',
    'the CJK anchor the index links to must resolve; Han characters are letters and survive the slug rule',
  );
  // Two spaces around a dropped `+` become two hyphens, as in the HOOK_CENSUS anchor.
  assert.equal(
    slugify('shot: a page may not carry fewer colour hooks than its census says (`tools/shot.js`, `HOOK_CENSUS` + `auditColourHooks`)'),
    'shot-a-page-may-not-carry-fewer-colour-hooks-than-its-census-says-toolsshotjs-hook_census--auditcolourhooks',
    'a dropped punctuation mark leaves the spaces that surrounded it, so they become two hyphens',
  );
  // The date-and-em-dash heading shape every defect-register entry uses.
  assert.equal(
    slugify('2026-09-10 — four defects on a real phone and a desktop, none of which any gate could see'),
    '2026-09-10--four-defects-on-a-real-phone-and-a-desktop-none-of-which-any-gate-could-see',
    "an em dash is dropped, its two spaces stay, and the entry's date keeps its hyphens",
  );
  // GitHub's duplicate rule: the first heading takes the bare slug, the next take -1, -2.
  assert.deepEqual(
    anchorsFor([{ text: 'Index' }, { text: 'Index' }, { text: 'Index' }]),
    ['index', 'index-1', 'index-2'],
    'duplicate headings must take GitHub\'s suffixes rather than collide, or a link to the second resolves to the first',
  );
  assert.deepEqual(
    anchorsFor([{ text: 'a  b' }, { text: 'a-b' }]),
    ['a--b', 'a-b'],
    'consecutive spaces become consecutive hyphens, and a slug that already ends in -1 is not overwritten',
  );
});

for (const spec of STANDING) {
  test(`${spec.file}: every entry is reachable from the index and every index link resolves`, () => {
    const r = read(spec);
    const linked = new Set(r.indexLinks.map((l) => l.anchor));
    const known = new Set(r.withAnchors.map((h) => h.anchor));
    const unreachable = r.entries.filter((e) => !linked.has(e.anchor));
    const dead = r.indexLinks.filter((l) => !known.has(l.anchor));
    // Printed before any assertion, so a run that fails a denominator still says what it read rather than
    // reading as a run that compared nothing.
    console.log(
      `${diagnostic(r)}, ${plural(unreachable.length, 'entry', 'entries')} unreachable, ${plural(dead.length, 'link', 'links')} broken`,
    );
    assertPopulations(r);
    assertStructural(r);
    assertIndexPresent(r);
    // Resolvability before reachability: a dead link also makes its entry unreachable, and the
    // dead-pointer failure names the link text, the anchor and the nearest heading, which is the more
    // precise statement of what is wrong.
    assertResolvable(r);
    assertReachable(r);
    assertByArea(r);
  });
}
