# Handoff — Greek letters and mathematical symbols in the text face

Worker: `type-verify`, 2026-09-16, verifying and finishing a change a killed worker had implemented but never measured. Tree only; nothing committed. The scratch instruments named below are in the session scratchpad and are not tracked.

## Verdict

The change as it arrived was working but not to its own spec. Every Greek letter and the ⇌ were drawn by the chosen webfonts, but STIX Two Text's Greek is about a tenth taller than Newsreader's x-height, which reads as a large α on the line. STIX Two Text is replaced by Libertinus Serif, chosen by measurement; ◀▶ were added to the shared `text=` subset (the polymer figure's step buttons were the last system-font glyphs on chapter 2).

## Readback per glyph

Instrument: a scratch Playwright probe standing in for `tools/inspect.js`, opening the real page through `tools/serve.js` and `tools/lib/browser.js` with the gates' own handshake, wrapping one glyph of the reader's own text node in place with `Range.surroundContents`, and asking CDP `CSS.getPlatformFontsForNode` for that node. Light and dark gave identical faces.

| glyph | as arrived | now | Latin beside it |
|---|---|---|---|
| α in "α-helix", §2.7 | STIX Two Text | Libertinus Serif | Newsreader |
| β in "β-pleated" | STIX Two Text | Libertinus Serif | Newsreader |
| α, β in "α-glucose", "β-glucose", bare "α and β" | STIX Two Text | Libertinus Serif | Newsreader |
| ⇌ in the equation | STIX Two Math | Libertinus Serif (its `text=` face) | Newsreader, including the sub- and superscripts |
| µ in "20 µm" | Newsreader | Newsreader | Newsreader |

µ is U+00B5, which Newsreader's Latin-1 covers, and the book uses the micro sign everywhere, so it never fell out. A page-wide census with the same CDP call over every element with its own text on the library, the book page, chapters 1–3 and Today: after the change no element on any page draws with a system font. Before it, chapter 2's "◀ Back" and "Step ▶" were in Segoe UI Symbol.

## Why Libertinus Serif, measured

Single real glyphs screenshotted at 6 device px per CSS px and the ink measured in-browser: on chapter 2, Newsreader **a** 51 px tall, **o** 51, o's side strokes [9,9], l stem [8]. STIX **α** 57 (+12 %), strokes [5,6]: not bolder, bigger. Libertinus **α** 52, strokes [9,8]. On a scratch row beside Newsreader, thirteen Greek serifs on Google Fonts: STIX ο 56; Libertinus ο 52 with sides [10,10] against o [10,10]; EB Garamond matches height (50) but is light ([5,5]); Cardo 54; Source Serif 4 at 350 57; Literata 62; Noto Serif 64; Piazzolla 58; Tinos 55; Alegreya 54; Brygada 55; Gentium 56; Vollkorn 55. Also rendered on the real pages: STIX with `font-size-adjust: ex-height from-font`, which cures the height but shrinks every fallback glyph (⇌ and chapter 3's superscript minus included) and leaves the Greek a tenth lighter. `docs/design/textbook.md` records the numbers and the two rejected routes.

## Byte cost, cold, per page

Before the change: 454 KB on chapter 1, 473 KB on chapter 2 (Fraunces 121, Newsreader roman and italic 279, Inter 48). The brief's "about 0.3 MB" was wrong. As arrived with STIX: chapter 2 526 KB. Now: chapter 2 531 KB (Libertinus Greek 15.0, Libertinus `text=` 7.7, Inter `text=` 10.1, Noto Sans Math 7.6, stylesheets +2.4 gzipped), so +43 KB on a chapter with Greek and an equation and +12.6 KB on chapter 1. STIX Two Math is no longer fetched on any biology page.

## Files changed

`src/styles/tokens.css` (both serif stacks, comment rewritten with the measurements); `src/styles/components.css` (one comment line); `docs/design/textbook.md` (type table row, the Greek-and-symbols paragraph, the equation paragraph's last sentence); both font links in `index.html`, `lab/index.html`, `today/index.html`, `biology/index.html` and the three chapter pages. Not changed: `chapter-recipe.md` (the joiner sentence was already there, with the CSS routes it rules out), chapter 2's six joiners (all present and shown as one fragment at 320–1440 px), `tongjian/**`.

## Gates

`SHOT_PAGES=biology/ch02,biology/ch01`: 12 loads clean, all figures ready, no failed request. `DEVICE_PAGES=biology/ch02`: 9 loads clean. `npm run subpath`: 44 loads clean under `/textbook/`.

## Still imperfect, and where each went

1. Libertinus is served static at 400 and 600; Greek at weight 500 would draw at 400. No Greek sits at that weight today. A bound, accepted.
2. This changes a documented design choice in `docs/design/`, high-risk and needing independent review. In the focused re-review's scope.
3. Chapter 3's "µm⁻¹" sets ⁻ and ¹ from two faces. To `integration-fixes`.
4. Un-joined "α-glucose" in the polymer figure's button label and "α-helix and the β-pleated sheet" in chapter 2's item bank. To `integration-fixes`.
5. `tools/inspect.js` turns the book-qualified page id's slash into a directory. To `integration-fixes`.
6. `STIX+Two+Math` remains in the second font link and is never fetched. To `integration-fixes`.
