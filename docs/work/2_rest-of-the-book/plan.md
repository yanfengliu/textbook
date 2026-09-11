# The rest of The Living World: chapters 2 to 32

Status: active
Owner: Integration owner (textbook session, 2026-09-10)
Created: 2026-09-10
Updated: 2026-09-10

## Problem and outcome

Chapter 1 exists and established the shape. The owner wants the book finished: all thirty-two chapters written to the same standard, with their figures, objectives and review banks, each passing the nine gates and committed as it lands.

Outcome: a reader can read *The Living World* end to end, and the study system has an objective graph and an item bank covering all of it.

## Approach

One chapter at a time through the pipeline in [chapter-recipe.md](../../design/chapter-recipe.md), two or three chapters in flight at once because a chapter's own files are a directory of its own and its figures are separate modules.

Per chapter: an author writes the prose, glossary, objectives and a figure brief; the integration owner registers the figures from that brief; figure workers and an item worker run in parallel; the integration owner mounts, gates, looks at the frames, and commits. **A chapter is committed when it is done, not batched** (owner instruction, 2026-09-10).

The only shared files are `src/figures/registry.js`, `tools/drive.js`, `tools/lib/browser.js` and the chapter list on `biology/index.html`. The integration owner owns all four, so workers never touch them.

## Acceptance criteria, per chapter

- [ ] Prose reads as a book, is accurate at first-year undergraduate level, and hedges where the science hedges.
- [ ] Six to nine figures, each showing a mechanism the reader can push on rather than a labelled picture.
- [ ] Twenty to thirty-five objectives with a sound prerequisite graph, which may reach back into earlier chapters.
- [ ] Three or more items per objective, mixing the formats, every distractor carrying the misconception it encodes.
- [ ] The chapter is in `PAGES`, every figure has a `drive` recipe, and `npm test` passes all nine steps.
- [ ] Frames looked at by the integration owner at desktop and phone, in both themes.
- [ ] Committed and pushed on its own.

## Status

`—` not started · `author` prose in progress · `build` figures and items in progress · `gate` integrating · `done` committed

| # | Chapter | State | Commit |
|---|---|---|---|
| 1 | What is life? | done | 7c6f905 |
| 2 | The chemistry of life | author | |
| 3 | Cells | author | |
| 4 | Membranes and transport | — | |
| 5 | Energy and metabolism | — | |
| 6 | Photosynthesis | — | |
| 7 | Cellular respiration | — | |
| 8 | DNA | — | |
| 9 | From genes to proteins | — | |
| 10 | The cell cycle and mitosis | — | |
| 11 | Meiosis and inheritance | — | |
| 12 | Gene regulation | — | |
| 13 | Biotechnology | — | |
| 14 | Darwin and natural selection | — | |
| 15 | Population genetics | — | |
| 16 | Speciation | — | |
| 17 | The history and tree of life | — | |
| 18 | Bacteria and archaea | — | |
| 19 | Protists | — | |
| 20 | Fungi | — | |
| 21 | Plants | — | |
| 22 | Animals | — | |
| 23 | Plant structure | — | |
| 24 | Animal structure and homeostasis | — | |
| 25 | Nervous systems | — | |
| 26 | Circulation and gas exchange | — | |
| 27 | Immunity | — | |
| 28 | Reproduction and development | — | |
| 29 | Populations | — | |
| 30 | Communities | — | |
| 31 | Ecosystems | — | |
| 32 | The biosphere and conservation | — | |

## Notes as they accumulate

- The `drive` gate fails on any registered kind without a recipe, so a chapter's figures cannot land before their recipes do. Writing the recipe from the figure brief, before the figure exists, is the cheaper order.
- Prerequisites reaching back into earlier chapters are what make the study queue work across the book rather than within one chapter. Chapter 2 onward should use them.

## Outcome

In progress.
