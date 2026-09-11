# 2026-09-10 — adaptive study, GitHub Pages, and a polish pass

The book learned to track what a reader knows and to reorganise practice around it, the site went live on GitHub Pages, and the figures and stylesheets had a craft pass. Status is in `docs/work/1_adaptive-study/plan.md`; the design is `docs/design/adaptive.md`.

## Believed and proved false

- **The page said "Learned well" after one right answer.** The store said `learnedWell: false, evidence: 1, formats: ['mcq'], stability: 1.2`, and the surfaces printed "Learned well" anyway, because they were labelling the scheduler's `review` state, which only means a card is past its learning steps. Two modules, each correct about itself, disagreeing in the gap between them. No unit test on either side could have caught it; it was caught by looking at a screenshot of the end-of-sitting summary. `review` is now **Holding**, and the store's stricter verdict is the only thing that earns the other words. `npm run sitting` holds it and goes red on the original defect.
- **The study surfaces treated `store.cards()` as an array.** It is keyed by objective id, which is the contract. `safe(fn, [])` could not catch it: the object it returned was perfectly defined, and only `.map` on it threw. It was at three call sites, and the third was found only when the Today page was added to the subpath gate, because that was the first gate that loaded the page.
- **The 3D helix's pick step had never proved anything.** `expect(d.selected !== undefined)` is satisfied by `null`, which is what the figure reports when nothing is picked, and the step clicked one point at the centre of a wide stage where the helix is a narrow column. A worker probing a 6x8 grid found clicks that selected nothing at all. It now sweeps the column and demands a base-pair index in range plus a card that names it.
- **The subpath gate mirrored the reader's private study record.** It copies the local working tree, and `progress/` exists locally but never in CI's checkout, so it both leaked the record into a temp mirror and measured a tree Pages would never build. `progress` is now in `tools/pages-exclude.txt`, which the workflow and the tool both read.
- **`actions/upload-pages-artifact` has no `exclude_assets` input.** Unknown inputs only warn, so the first workflow would have shipped `test/`, `tools/`, `docs/` and `package.json` while looking green. It also defaults `include-hidden-files: false`, which tars with `--exclude='.[^/]*'` and would have dropped `.nojekyll`, silently breaking every path Jekyll touches.
- **The three-column grid switched on 198px before it fitted.** Between 1200 and 1398px the third column was paid for out of the text column, so at 1280px the measure fell fifteen characters short with an empty margin beside it.
- **A floated margin note was painted over by the wide figure after it.** Beside Figure 1.2 the fever note lost four of its five lines, and the reader never saw them. Margin notes now clear the float, and each one moved above the paragraph it annotates so it sits beside its text rather than below it.
- **Two CSS custom properties were named but never defined.** `--space-5` and `--space-10` were used by two stylesheets and silently fell through to hand-written fallbacks. Defining them moved every figure 25.6px down, which pushed the tree figure's first hit label one pixel past the drive harness's viewport and turned a figure gate red for a layout reason.

## What a reviewer or worker caught that the author missed

- The Pages worker: the `cards()` mismatch, before anything else saw it, and the three wrong action versions above.
- The learning-core worker: that `tools/flow.js` answers the chapter's questions for real, so every gate run was appending a robot's answers to the reader's own record. The store now refuses to post when `navigator.webdriver` is set.
- The item-bank worker: the fake helix gate, and that the cut-open cell still raycasts its clipped-away membrane, so a click at most points selects a surface the reader cannot see.
- The style worker: seven colour pairs under WCAG AA, including `--ink-faint` at 3.51:1 in light and 3.56:1 in dark. Their contrast probe had a bug they caught before trusting it: `color-mix()` computes to `color(srgb …)`, not `rgb()`, so it was reading mixed colours as white and reporting 1.08 on text that is actually at 5.6.
- The learning-core worker found a vacuous test of their own: the new-objective cap was asserted inside a fixture whose graph never had more than three open objectives, so it held whether the cap worked or not.

## Numbers

- Gates: eight steps. 83 unit tests; 4 pages, 24 page loads; 7 reader flows; 38 figure-control steps; 4 keyboard-only sittings; 30 sweep frames; 20 subpath loads.
- Chapter 1: 33 objectives with a prerequisite graph, 99 review items (49 multiple choice, 23 figure tasks, 27 free response), 147 distractors each carrying the misconception it encodes.
- Contrast, light theme before and after: `--ink-faint` on paper 3.51 to 5.08; coral as text 3.32 to 5.34; water 4.33 to 5.24; leaf on its own tint 4.10 to 4.91.
- The mastery threshold: one right answer gives `learnedWell: false`; seven right answers spaced over forty days across two formats gives `true` at a stability of 20.6 days.

## Process

- Six workers in parallel on disjoint files against contracts fixed before they started. Two integration defects came from the seams between them, both in the direction the fleet predicts: a shape mismatch a defensive default swallowed, and a word that meant different things on either side.
- Three scratch probes became gates this round: the figure-control driver, the reader-flow driver and the sitting driver. The pattern is holding that a probe written to answer one question about a user flow is usually the gate that flow was missing.
- The Pages worker broke and repaired `node_modules` with a `git worktree remove --force` that followed a junction. Any missing-playwright failure another worker saw in that window was that, not their code.
