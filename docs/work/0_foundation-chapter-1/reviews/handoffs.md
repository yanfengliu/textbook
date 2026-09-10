# Worker handoffs, chapter 1 figures

Three implementation workers built the nine figures against the contract in `docs/design/textbook.md`, each owning only its files under `src/figures/`. The first three workers were lost when the host process exited on 2026-09-08; their files survived and three fresh workers finished from them on 2026-09-09. What each reported, and what the integration owner did with it.

## 3D: `cell3d`, `dna3d`, `lib/three-common.js`

- Cell: 17 draw calls, 124,060 triangles; default view `{ theta: 0.6, phi: 1.15, distance: 38 }`, zoom 14–70. The cut is a fixed section through the nucleus, ER stack, Golgi and two mitochondria; cutting turns the camera to face it when the reader would see it edge-on. Label placement by candidate search; labels hide when occluded by the nucleus or off the stage.
- Helix: 4 draw calls, 44,768 triangles; 32 bp, 10.5 bp per turn, 3.4 nm pitch (rise 0.324 nm), backbones 129° apart across the minor groove; default view `{ theta: 0.5, phi: 1.25, distance: 26 }`.
- Verified by the worker: 30 sweep frames, 20 lab shots, 24 driven frames, `perf` on the owner's GPU at a vsync-locked 16.7 ms with all nine figures running.
- Reported to the owner and acted on: the frame called `ready()` before the handle existed when a figure reports ready inside `mount()` (fixed in `figure.js`); `figure-shot` printed no cause on an error state (now prints the figure's error and the page errors); the caption's "ten and a half base pairs" fixed the rise at 0.324 nm rather than 0.34 nm (kept: the caption and the model agree, and both values appear in textbooks).
- Left imperfect: 5′/3′ labels can sit on the frame edge at near views; the smooth ER reads as a bundle; far views have long leader lines. An intermittent `state "error"` on `figure-shot cell3d --theme dark` twice in about 25 runs under heavy parallel load, never reproduced alone.

## SVG: `levels`, `scale`, `tree`, `energy`, `lib/svg.js`

- Scale: a log ruler over 11 decades with 17 things at true sizes, a lens at 2.6× with collision-free labels, keyboard slider semantics on the lens (`role=slider`, arrows jump between things, Shift nudges), a range mirror. Tree: three domains with example icons, endosymbiosis arrows, ten hover/click/focus targets, three emphasis modes. Energy: a landscape with thinning gold energy arrows and heat wisps, looping green matter arrows, 27 clock-driven beads. Levels: reused unchanged from the first worker.
- Verified by the worker: lab shots in both themes, reduced motion and phone width for all four; driven frames for every control; 2× crops of the energy figure's animals.
- Reported to the owner and acted on: the placeholder's fade ghosting through pinned lab shots (fixed in `figure.js`: removed at once under eager or pinned mode); `node --test test/` on Node 24 running one bogus failing test (fixed: the unit script globs `test/*.test.js`); the scratch `drive.mjs` promoted, with the simulation worker's, into `tools/drive.js`.
- Left imperfect: at phone width the ruler and tree text are about 4 px; the tree's targets are `<g role="button" tabindex="0">` because SVG has no native button.

## Simulation: `pond`, `homeostasis`, `pasteur`, `lib/homeostasis-model.js`

- Model constants: heat capacity 100, conductance 0.28, basal heat 4.2, activity heat 3.2, shiver heat 1.8, sweat loss 2.3, vasomotor range 0.4, dead band 0.2, effector time constant 4 s. A 30 s plunge to 5 °C bottoms at 36.5 °C and is back within 0.003 of 37 about 93 s after it starts; a race peaks at 37.5 °C; with feedback off the race climbs to 37.89 and stays. `test/homeostasis-model.test.js`: 6 of 6 pass unchanged.
- Homeostasis figure: loop diagram with the active path lit and dashed, the working effector's box filling with its output, a live chart with set point, comfort band, episode bands and an air-temperature strip; 10 simulated seconds per real second; scrub by keyboard; reduced motion jumps 90 s per episode in one cut. Pasteur: two flasks with S necks, boil, snap, tilt, a 30-day scrubber, dust collecting in the bend, haze and specks for cloudiness; unboiled flasks cloud from day 1 and the card says why.
- Pond: unchanged; determinism reconfirmed (`--t 13` twice byte-identical), 1.3–1.4 ms per frame.
- Reported to the owner and acted on: the same unit-runner and placeholder findings as above; the shared scratchpad between concurrent workers (one worker's scratch script overwrote another's; each renamed).
- Left imperfect: at phone width the homeostasis figure shows only the chart with a small plot, and the Pasteur toolbar covers the bench; the Pasteur card says both are clouding from the moment of the tilt though the haze starts 0.8 day later; the first pond fission happens in a crowded corner.

## Integration owner's acceptance

Every handoff was checked against the integrated page, not the report: the lab shots and driven frames named above were opened at native resolution, `npm test` was run over the combined tree (results in `plan.md`), and the review round in this folder covers the integrated revision.
