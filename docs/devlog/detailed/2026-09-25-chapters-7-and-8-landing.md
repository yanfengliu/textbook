# Chapters 7 and 8 staged for publishing, and what only the landing could see, 2026-09-25

One integration worker, `land-4`, on a branch off main at `237c96e`, on 2026-09-24 and 25. It merged twelve branches: `term-comma`; `fig-ch08-a` and `fig-ch08-b`; `fig-ch07-a`, twice; `ch07`, three times as its accuracy fixes came in; `fig-ch07-b`, `fig-ch07-c`, `ch08`, `fig-ch07-d` and `polish`; `figfix-ch08`, three times; and `figfix-ch07`. Its own edits joined both chapters to the contents page and Today. Four reviews ran against the staged tree, and each is in `docs/work/2_rest-of-the-book/reviews/` under `2026-09-25-land-4-review-*`. The last three found no blocker, and review 2 of the text found every one of the 67 chapter 7 and 39 chapter 8 accuracy findings fixed. The branch is not on main: the full `npm test` and a delta review of the integration come first.

## What only the landing could see

- **A merge conflict whose easy resolution lost nine joins.** `figfix-ch07` and the landing both edited the paragraphs around Figure 5.4 in chapter 5. Taking either side whole dropped nine no-break joins (figures review 2, S2). The resolution in `dcf98d2` takes `figfix-ch07`'s order and the landing's text, and the file holds 240 joins, as before the merge.
- **A no-break space the term-hold did not hold.** `</tb-term>&nbsp;—` began a line with the space and the dash in chapter 8 at 52 and 41 of the 1,121 widths from 320 to 1440 px (review 1, S1). The probe that had measured "0 at every width" counted a no-break space as whitespace, so it could not see this case. `36cbc2f` holds it, and the typography pass merged in `276f58a` writes the same join after twelve more terms in chapters 3 to 6.
- **Figure 8.3's made-up rules were not marked hypothetical at 800 and 860 px windows** (figures review 2, S1). The banner that says so does not fit the flat stage there, and the controls' labels do not say it. Putting the plain word in front of the short sentences broke their four-line cap on a 360 px phone, so both were reworded to two lines (`efd6c8d`).
- **Figure 7.3 at an 800 px window drew complex III without its "+2"** while drawing +4 and +4, because each charge label could be dropped on its own (figures review 2, N3). The counts are now placed as a set, all or none (`50c22a0`).

## Found in figures already on main

- **Figures 3.2 and 3.3 in the smallest wide box.** At an 800 px window neither loaded, because a radius went negative; at 860 px neither drew a cell; and at 960 and 1024 px the cell was drawn 16 to 20 px across in 3.2 and 30 to 40 px tall in 3.3 (the wide-band probe of 2026-09-25). They now take a flat layout there (`1824eea`), with the scale and the corner radius floored at zero (`247549c`, `131e49b`, `6e12dbc`). Review 3 found no regression in it.
- **Figure 3.3 swam under a pinned clock once it was scrolled into view** (review 3, N1): `schedule()` did not look at `ctx.pinnedTime`. A GPU probe on chapter 3 at 390, 1024 and 1440 px, with both envelopes, saw the canvas change over 1.5 s in all six cases before `58a2c72` and in none after. `describe()` held still in all six throughout, which is one reason `npm run pinned` could not see it.
- **No click reached Figure 3.3's flagellum or archaellum from a 390 px window up**, because the click spot sat 0.4 of the way along a filament that runs off the canvas. Real clicks on the drawn filament selected it at none of 42 sample points before `1779c36`. After it, they select it at 2 of 7 points at 390 px and 6 of 7 at 1024 and 1440 px.
- **Figure 4.7's "pump" failed `npm run legible` on GitHub's runner** in the dark theme, where a striation crosses it, while the local run passed. `fb3f6b2` gives the heart cell's two names a halo of the cytoplasm.

## What was checked on the final text

- Every width from 320 to 1440 px, light theme, on chapters 7 and 8: no mark glued to a term begins a line (17 of chapter 7's 30 terms and 38 of chapter 8's 51 have one). Review 1's S1 measure finds chapter 8's two no-break-space dashes held at every width, and 32 of the 38 held cases strand once unheld, so the probe sees the class.
- Every character chapters 6, 7 and 8 and Today show is drawn by a face the page loaded (find-glyphs). Chapter 7 adds four runs that mix faces, in Figure 7.3's superscripts: the same kind as chapter 2's and chapter 8's.
- On `27d1626`, `npm run unit` passed 268 of 268 and `npm run check` passed 15 pages. `drive`, `pinned`, `narrow` and `legible`, run on the four figures the fixes of 2026-09-25 touched (`replication-fork`, `respiratory-chain`, `atp3d` and `prokaryote`), passed with 51 drive steps, 88 pinned mounts, 42 states at a 390 px stage and 2,250 glyph runs.
- The full `npm test` ran once, untrimmed, after this entry was written; the round's plan records its result.

## An environment note

`git worktree remove` emptied the main checkout's `node_modules` through a junction, for the second time; the first was on 2026-09-10. The check run before the removal said there was no junction, because a PowerShell path quoted inside a bash string never reached it. `npm ci` restored `node_modules` in about a second. `docs/learning/lessons.md` holds the entry, and the gate it is owed.
