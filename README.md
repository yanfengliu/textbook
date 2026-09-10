# textbook

Interactive textbooks with beautiful type, illustrations, animations, and 3D models, read in a browser with no build step.

The first book is **The Living World**, an introduction to biology. Chapter 1, *What is life?*, is written: nine interactive figures, from a drifting drop of pond water to an animal cell you can cut open and a double helix you can turn, set in Fraunces, Newsreader and Inter on warm paper, in light and dark.

## Read it

```bash
npm run dev
```

Then open http://localhost:8080/ for the library, or http://localhost:8080/biology/ch01-what-is-life/ for the chapter. Nothing is installed to read the site; `npm install` is only needed for the gates below. The pages fetch two things from the network: the three font families from Google Fonts, and a pinned copy of Three.js from a CDN for the 3D figures.

## How it is built

- One hand-authored HTML page per chapter, with a small vocabulary of custom elements for figures, glossary terms, callouts, questions and sorting activities (`src/components/`).
- Every figure is a module with one contract (`src/figures/`): it mounts into a frame, pins its clock for deterministic screenshots, pauses off screen, and respects reduced motion.
- Every colour comes from one token table (`src/styles/tokens.css`, mirrored in `src/palette.js`), so a diagram and the prose around it are the same picture.
- No bundler, no framework, no raster images. The design of record is `docs/design/textbook.md`.

## The gates

```bash
npm install
npx playwright install chromium
npm test
```

`npm test` runs the unit tests, the static content check, page screenshots at three widths in both themes, and a camera sweep of every 3D figure. The screenshots land in `out/shots/` and `out/sweep/` for a person to look at, because a green gate proves the pages load, not that they are beautiful. `AGENTS.md` lists every gate with what it does and does not prove.
