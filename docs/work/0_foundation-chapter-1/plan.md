# Textbook foundation and chapter 1 prototype

Status: complete
Owner: Integration owner (textbook session, 2026-09-08)
Created: 2026-09-08
Updated: 2026-09-10

## Problem and outcome

The repository is an empty shell: a README line, a licence, a `.gitignore`. The owner wants a web-based interactive biology textbook with beautiful type, illustrations, 3D models, and animations, built to the fleet's rules, with the first chapter as the prototype that fixes the shape of every later one.

Outcome: the repo is in the fleet census with a synced canon block and the fleet's document set; `docs/design/textbook.md` is the design of record; a reader can open the site, pick the biology book, and read chapter 1 ("What is life?") end to end with its nine interactive figures working in both themes at phone, tablet, and desktop widths; the gates in `AGENTS.md` run and pass, and every one has been made to go red.

## Scope

Included:

- Fleet onboarding: census entry in `../fleet/scripts/lib/fleet-repos.mjs`, stamped canon markers filled by `npm run sync-canon -- --apply`, `CLAUDE.md` pointer, `docs/policies/local-rules.md`, devlog, learning files, and this work folder allocated through the fleet's `work-docs.mjs`.
- The design of record and this plan.
- The site foundation: tokens, typography, layout, theme, shell, the custom-element vocabulary, the figure contract and registry, the dev server.
- Chapter 1 prose, glossary, checks, and its figures: pond-water opener, "is it alive?" sort, homeostasis simulation, levels of organisation, scale lens, 3D animal cell, 3D double helix, energy flow, tree of life, Pasteur's flasks.
- The gates: `check`, `shot`, `sweep3d`, unit tests, and their red proofs; a CI workflow that runs them.

Excluded, deliberately:

- Chapters 2 onward (titles only, in the design doc and the book page).
- Deployment to GitHub Pages: publishing needs the owner's authorisation, so the workflow that would do it is not added.
- Vendored fonts, downloaded models, raster images.
- Accounts, progress sync, search.

Dependencies: Node 24, Playwright chromium, network for the Three.js CDN and Google Fonts.

Ownership: the integration owner writes the foundation, the prose, the tools, and the docs, and integrates. Figure modules are delegated to workers against the figure contract in the design doc, each owning only its own files under `src/figures/`.

## Approach

Plain HTML, CSS, and ES modules with no build step, following the fleet's proven pattern in `../scenes` (pinned Three.js through an import map, Playwright gates, procedural assets). Custom elements give the prose a small vocabulary; a figure is a module with a fixed contract so the frame, the gates, and the theme toggle treat every figure the same way. Details and alternatives: [the design of record](../../design/textbook.md).

Delegation: three figure workers in parallel on disjoint files (3D figures; SVG illustration figures; simulation and canvas figures), each handed the contract, the palette, and the acceptance for their figures, each verifying visually in the browser before handoff. The integration owner inspects every handoff in the integrated page, runs the gates, and looks at the shots and the 3D sweep at native resolution.

## Acceptance criteria

- [x] `../fleet` `npm test` is green with `textbook` in the census (102 tests, 2026-09-08), and this repo's AGENTS.md carries the current canon stamp (`npm run sync-canon` reports it current).
- [x] `docs/design/textbook.md` states typography, colour, layout, components, the figure contract, 3D and motion conventions, gates, and the book outline.
- [x] The library page, the book page, and chapter 1 load with no console error, page error, or failed request at 390, 1024, and 1440 widths in both themes (`npm run shot`: 18 loads clean, 9 figures ready in each chapter load).
- [x] Every one of chapter 1's figures reaches `ready` under `?eager=1` (shot), works with the keyboard where it is interactive (`npm run drive`: 38 steps over 9 figures, keyboard steps in every recipe), and respects `prefers-reduced-motion` (each worker's `--reduce` lab shots, listed in `reviews/handoffs.md`).
- [x] The two 3D figures render correctly across a sweep of camera angles and distances (`npm run sweep3d`, 30 frames green). All thirty labelled frames were opened one by one at native resolution on 2026-09-10 by the integration owner: every organelle stays inside the membrane from every angle, labels sit on their anchors, the near view fills the stage and the far view keeps the cell centred, the helix reads as a stack of coloured rungs end-on and shows both grooves side-on, and the dark frames hold. Left as known: 5′/3′ labels touch at the helix ends in some views.
- [x] `npm run check` passes: every term resolves, every figure has a caption and a registered kind, every check has one correct answer and an explanation, ids are unique, headings are in order (3 pages pass, 9 figures, 31 glossary entries).
- [x] `npm test` is green on the final tree (2026-09-10: 24 unit tests, 3 pages checked, 18 page loads clean, 7 flow steps, 38 drive steps over 9 figures, 30 sweep frames, `npm audit` 0 vulnerabilities), and each gate has a recorded red run in `docs/learning/gate-proofs.md`.
- [x] The prose is accurate biology at first-year undergraduate level, and a read-only review of the integrated chapter has been obtained and its findings dispositioned in `reviews/` (`reviews/review-1.md`: accept with fixes, 30 findings, all applied).
- [x] Devlog summary and detailed entries are written; the work is committed on main and pushed (the first commit after the initial one carries the whole round).

## Implementation steps

- [x] Fleet onboarding: census, stamped markers, sync, pointer, docs skeleton, work folder 0.
- [x] Design of record and this plan.
- [x] Foundation: `package.json`, `.nvmrc`, styles, `palette.js`, `shell.js`, `components/`, `figures/registry.js`, `tools/serve.js`. Owner: integration owner.
- [x] Figure workers (parallel, after the foundation): 3D (`cell3d`, `dna3d`); SVG (`levels`, `scale`, `tree`, `energy`); simulation (`pond`, `homeostasis`, `pasteur`). Each hands off with screenshots and `describe()` output. The first three workers were lost with the host process on 2026-09-08 and three fresh ones finished from the surviving files on 2026-09-09; handoffs are summarised in `reviews/handoffs.md`.
- [x] Chapter 1 prose, glossary, checks, sort activity. Owner: integration owner, while the workers build.
- [x] Gates: `check`, `shot`, `flow`, `drive`, `sweep3d`, unit tests, `test`, CI workflow; each proved red (`docs/learning/gate-proofs.md`).
- [x] Integration: mount every figure in the chapter, run the gates, inspect shots and sweeps, fix, re-run. Frames looked at on 2026-09-10: `out/shots/` (library, book, chapter at three widths and two themes), `out/inspect/` (the chapter at every figure, desktop light and dark, phone light), `out/sweep/` (all 30), `out/flow/` (7), `out/drive/` (cell and helix steps).
- [x] Independent read-only review of the integrated chapter; disposition; fixes; re-check (`reviews/review-1.md`).
- [x] AGENTS.md Gates, Invariants, Conventions filled from the real commands; devlog; commit; push; fleet census commit (`../fleet` 709fab2, pushed 2026-09-10).

## Outcome

Done, 2026-09-10. The repo is in the fleet census with a synced canon block; the design of record, the site foundation, chapter 1 with its nine figures, and seven proved gates are on main. Every acceptance criterion above is ticked against the final tree, with the evidence named beside it.

Verified by the integration owner, not from worker summaries: every gate run on the combined tree; the 30 sweep frames, the 19 integrated-page frames (desktop light and dark, phone light), the 18 page shots, the 7 flow frames and the cell and helix drive frames opened one by one at native resolution; the read-only prose review dispositioned in `reviews/review-1.md` with all 30 findings applied and the check and unit gates re-run after them.

Left as known limits, recorded rather than fixed: on a phone the SVG figures (ruler, tree, energy, Pasteur) keep their desktop layout and shrink their text to a few pixels, and the homeostasis figure shows only its chart; the energy figure draws matter returning through the soil only, which the caption now qualifies; the 5′/3′ labels touch at the helix ends in some views; the far cell view has long leader lines; a `figure-shot cell3d --theme dark` error state was seen twice in about 25 runs under six parallel browsers and never alone. Deployment to GitHub Pages was deliberately not set up: publishing needs the owner's say.

Review status: the prose and figure data had an independent read-only review (above). The code had no separate independent review this round; the gates, their red proofs and the owner's frame-by-frame inspection are the evidence, and that gap is stated here rather than implied closed.
