# Handoff — the publish list derived, and the fonts gated

Worker: `publish-and-fonts`, 2026-09-16. Tree only; nothing committed. Changed: `tools/pages-exclude.txt`, `tools/subpath.js`, `.github/workflows/pages.yml`, `tools/shot.js`, `index.html`, and the `unit`, `shot` and `subpath` bullets in `AGENTS.md`. New: `tools/pages-exclude.js`, `test/publish.test.js`.

**The two red proofs below are held here because `docs/learning/gate-proofs.md` was open to another worker.** Move them into that file once `six-proofs` has landed.

## 1. The publish exclusion is a pattern, and one matcher serves every consumer

`tools/pages-exclude.txt` now holds patterns: `*` and `?` within a segment, `**` across segments, a wildcard-free line meaning the literal path and everything under it, blanks and `#` comments allowed, and a leading `/`, a backslash or an empty list refused with the line number and what would satisfy it.

Both consumers honour it **through one matcher**, not by each expanding globs, because bash and JavaScript agreeing would be a coincidence maintained by hand, which is the same drift one level down. `tools/pages-exclude.js` is imported by `subpath.js` and by the test, and called by the workflow as `node tools/pages-exclude.js --print0 . > /tmp/pages-exclude.0` then `xargs -0 -r rm -rf` — written to a file rather than piped, so a pipeline's exit status cannot hide a failed matcher. The workflow gained `actions/setup-node@v4` reading `.nvmrc`, since the trim now runs Node.

Proved by running the workflow's trim step verbatim on a copy: it removed chapter 4's brief, which had appeared on disk mid-task, plus `tongjian/README.md` and the other thirteen roots; 94 files remained and `find . -name '*.md'` returned nothing.

**Two internal files had been shipping.** `tongjian/README.md`, 37 KB of transcription provenance whose links into `docs/` the trim deletes, so they 404 on the live site; and the root `README.md`, reader-facing but never linked from the site, which now stays in the repository where GitHub renders it. Everything surviving is HTML, CSS, JS, `.nojekyll` and `LICENSE`; every published page was checked for a fetched `.md` path and the only hits are prose inside comments.

### Red proof — publish: no internal Markdown reaches the live site (`test/publish.test.js`)

- **The defect.** The list named each chapter's figure brief one at a time, because the workflow deleted it with `xargs rm -rf` and neither `rm` nor `xargs` expands a glob. Chapter 4's brief appeared during this task and was not on it; nor would chapters 5 to 32 be.
- **Claim, in the test's header.** No `.md` survives the trim; a brief in a chapter directory that does not exist yet is already excluded; the site survives, including files no pattern mentions; the workflow's required-files guard names files that survive; both consumers go through the one matcher; and the published walk and the deletion walk partition the tree. Bound: it reads the working tree and the consumers' source, and matches on **paths**, so an internal file named like the site's is invisible to it. It proves nothing about GitHub serving the tree, which is `npm run subpath`'s claim.
- **Mutation.** `**/*.md` replaced by the old roll-call. This is the real defect, not a synthetic one. Three of eleven tests red:
  - `these Markdown files would be fetchable on the live site: README.md, biology/ch04-membranes-and-transport/FIGURES.md, tongjian/README.md. Every one of them is an internal note … Add the class of file to tools/pages-exclude.txt, not the instance.`
  - `biology/ch04-membranes-and-transport/FIGURES.md would be published … if a future file of this shape really is part of the site, the pattern is what has to change, so that the decision is stated once rather than remembered per chapter.`
  - `tools/pages-exclude.txt no longer excludes Markdown by pattern, so the next chapter brief will deploy`
- **Clean run.** 11 of 11. `pages-exclude.txt` sha256 `d30d8882…`, `pages-exclude.js` `ee0a1f56…`, `publish.test.js` `f74348c1…`.
- **One sub-test was unsound first**: it wrapped `parsePatterns` in `assert.throws` alone and passed on a `TypeError` from the test's own scaffolding rather than on the refusal it meant to measure. It now reads the message and also asserts a valid list parses, so a parser that refused everything would fail it.

## 2. The font census, in `npm run shot`

Every text node and `::before`/`::after` string is grouped by computed family, weight, style and numeric variant; one probe span per group carries that group's code points; CDP `CSS.getPlatformFontsForNode` says which faces drew them. A face counts as chosen when the page loaded it through `@font-face`, so the chosen set is **derived per page** and a third book in a third script needs no entry.

It cannot be asked once for the page: Chromium walks only two levels below the node it is given, and `<body>` reported 19 glyphs on a chapter of 1316 text nodes. On failure it re-probes in chunks and then single code points, so the message names the character, its code point and the face.

Blind to: canvas and WebGL text, characters that appear only after a control is pressed, and `lab/`, whose `<pre>` is deliberately `monospace`. It judges code points apart, so a combining sequence is split, and it never asks whether the *right* loaded face was picked.

**Cost, measured**: 62–98 ms per load on the Latin pages, 21–31 ms on Today, 162–294 ms on `tongjian/ch02` (2400 text nodes). Over chapters 1 and 2, 1004 ms against 36.6 s of page-load time, 2.7 %. Projected across the full 72-load matrix, 7 to 9 seconds on the 93-second baseline.

### Red proof — shot: no character is drawn by a face the page did not load (`tools/shot.js`)

- **The gap.** A worker had proved this by scratch probe on 2026-09-16 after finding the chapter's step buttons in Segoe UI Symbol; the probe left with the worker. The book depends on a `text=` subset naming an explicit character list, so the next new symbol falls back silently.
- **Mutation.** `⟹` (U+27F9) and `☡` (U+2621) added to chapter 2's opener dek. Exit 1:
  `biology/ch02 desktop light: 1 glyph(s) in <a.tb-skip>, <p.tb-opener__dek>, <figcaption> are drawn by Segoe UI Symbol, which this page never loaded. The stack is "Newsreader, "Libertinus Serif", … Georgia, serif" at weight 400, and the page loaded Fraunces, Inter, Libertinus Serif, Newsreader, Noto Sans Math. The characters that fall out of it: "⟹" (U+27F9 → Cambria Math), "☡" (U+2621 → Segoe UI Symbol).`
- **Clean run.** `ok biology/ch02 desktop light (… 814 glyph(s) over 816 code point(s) in 25 stack(s): Newsreader 16pt:322 Libertinus Serif:5 Fraunces:118 Inter:368 Noto Sans Math:1)`. Libertinus drawing five glyphs is the correct verdict: a declared fallback that was paid for is not a fallback to the machine.
- **Two real defects on its first run, before any mutation**: the library page drawing 67 Han glyphs in a system font, and `tongjian/ch02` drawing six rare characters in SimSun. Both fixed; the second by that book's own session, independently, which the gate then confirmed.

## Verification

`npm run unit` 158 of 160, the two failures in the other session's mid-edit lexicon. `npm run subpath` exit 1, 44 of 48 clean, tree sha256 `52144581fc8cb062`, 92 files, 147 s — the four failures all chapter 4's unregistered figure kinds. `SHOT_PAGES=biology/ch02,biology/ch01` exit 0, 12 loads, 37.7 s. `SHOT_PAGES=library` and `tongjian/ch02,tongjian/ch01,today` clean. `check-content` exit 1, all nine problems chapter 4's.

## Passed on

- **Concurrent gate runs destroy each other's evidence.** `out/shots/report.json` vanished twice mid-task because another worker's `shot` does `rmSync(OUT)` at startup. Exit statuses were unaffected; the reports were gone before they could be read. This is the third worker to report it.
- **`AGENTS.md` says 122 unit tests; the suite is 160** with more in flight. Deliberately not guessed at, since a number would be stale on landing.
