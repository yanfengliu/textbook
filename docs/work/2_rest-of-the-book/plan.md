# The rest of The Living World: chapters 2 to 32

Status: active
Owner: Integration owner (textbook session, 2026-09-10)
Created: 2026-09-10
Updated: 2026-09-11

## Problem and outcome

Chapter 1 exists and established the shape. The owner wants the book finished: all thirty-two chapters written to the same standard, with their figures, objectives and review banks, each passing the nine gates and committed as it lands.

Outcome: a reader can read *The Living World* end to end, and the study system has an objective graph and an item bank covering all of it.

## Approach

One chapter at a time through the pipeline in [chapter-recipe.md](../../design/chapter-recipe.md), two or three chapters in flight at once because a chapter's own files are a directory of its own and its figures are separate modules.

Per chapter: an author writes the prose, glossary, objectives and a figure brief; the integration owner registers the figures from that brief; figure workers and an item worker run in parallel; the integration owner mounts, gates, looks at the frames, and commits. **A chapter is committed when it is done, not batched** (owner instruction, 2026-09-10).

The only shared files are `src/figures/registry.js`, `tools/drive.js` and the chapter list on `biology/index.html`. The integration owner owns all three, so workers never touch them. `tools/lib/browser.js` used to be a fourth; chapters are discovered from disk now, so there is nothing to add.

## Acceptance criteria, per chapter

- [ ] Prose reads as a book, is accurate at first-year undergraduate level, and hedges where the science hedges.
- [ ] Six to nine figures, each showing a mechanism the reader can push on rather than a labelled picture.
- [ ] Twenty to thirty-five objectives with a sound prerequisite graph, which may reach back into earlier chapters.
- [ ] Three or more items per objective, mixing the formats, every distractor carrying the misconception it encodes.
- [ ] Every figure has a `drive` recipe and `npm test` passes all ten steps. The chapter no longer needs adding to `PAGES`: chapters are discovered from disk (2026-09-11), so a chapter is gated from the moment its `index.html` exists.
- [ ] Frames looked at by the integration owner at desktop and phone, in both themes.
- [ ] Committed and pushed on its own.

## Round 2 (2026-09-11): chapters 2 and 3 in build

Six workers in flight. None share a file.

| Worker | Owns | State |
|---|---|---|
| design-pass | `src/styles/**`, the book's furniture | running |
| polish-ch02 | soup, bondlab, water3d, waterprops | running |
| polish-ch02b | phlab, carbonkit, polymer, foldlab | running |
| figs-ch03a | microscopes, surface-volume, prokaryote, secretion | running |
| figs-ch03b | symbiont, cytoskeleton, cilium, plantcell3d | running |
| items-ch02 | `biology/ch02-chemistry-of-life/items.js` | running |
| design-i18n | `docs/design/i18n.md` (design only, no code) | running |

Chapter 2's eight figures are built and driven: 45 drive steps across the eight kinds. All eight came back
correct and gated and **went back for a design pass**, against the owner's standing rule in
[local-rules.md](../../policies/local-rules.md). The shared flaw in the second batch was a panel half empty
and readouts drawn as application chrome rather than as typography.

### Landed this round, outside either chapter

Four checks were found passing without checking anything. All four are now gated, with proofs in
[gate-proofs.md](../../learning/gate-proofs.md) and the pattern written up in
[local-rules.md](../../policies/local-rules.md):

- A figure could overwrite the frame's `state` in `describe()`. Under the defect every drive step still passed.
- A chapter with objectives and no `items.js` passed `npm run check`, because the rule was guarded on `items`.
- No page gate visited chapters 2 or 3: the page list was hand-maintained in two tools and a contents page.
- `npm run devices` was not one of the steps `npm test` ran.

### Open, to settle at integration

- **Four element-colour tables.** `lib/chem-atoms.js`, `lib/mol-draw.js`, `lib/cell-colours.js` and
  `lib/cell3-colours.js`. The values agree today and nothing proves they will. The repo's one-colour-table
  invariant covers `tokens.css` against `palette.js` only. Reconcile to one, with a test.
- **Chapter 3's item bank** is not started; its figures must land first so task expectations can be verified
  against a running figure rather than guessed.
- **`biology/index.html`** still lists chapters 2 and 3 as *In preparation*. Flip each with its own commit.
- **No independent read-only review** has been obtained for this round.

### Independent review, 2026-09-11

[reviews/2026-09-11-ch02-ch03-prose.md](reviews/2026-09-11-ch02-ch03-prose.md). A read-only agent with no authority to
edit the product. Not a multi-CLI review: Codex is out of credits until 2026-09-15, so the second opinion came from a
subagent, which is weaker and is recorded as such.

Verdict: chapter 2 ship with fixes, chapter 3 ship with fixes and the stronger of the two. Neither chapter repeats any
of the well-worn errors it was checked against. Every quantitative claim in both chapters was checked and found right,
which is why the two that are wrong matter.

Must fix, now with `fix-ch02` and `fix-ch03`:

- **Ch3 §3.2's diffusion crossover is out by two orders of magnitude**, against the chapter's own table, on the same
  screen, in the section whose method is that the reader checks the arithmetic.
- **Ch3 §3.5 credits mitochondrial division to bacterial machinery.** True of chloroplasts; animals, fungi and plants
  lost FtsZ and divide mitochondria with host dynamin. It sits inside the chapter's argument about which evidence
  discriminates, and points the other way.
- **Ch3 does not know ch2 exists.** Zero references, zero shared vocabulary, zero prerequisites. The study system loses
  every edge it should have between the chemistry and the cell.
- **Both chapters tell the reader the next chapter is "In preparation"** and link to the contents page, which says the
  same. Chapter 1 does it about chapter 2. Written chapters are unreachable from the book.
- Ch2 §2.4 runs the buffer equilibrium the wrong way across the page; `dna-vs-rna` tests strandedness the chapter never
  teaches; the buffer key idea is less accurate than the prose it summarises.

Three findings rest on the reviewer's recall rather than a source, and both fix workers were told to verify before
editing: the mitochondrial division machinery, de Duve at Louvain rather than Brussels, and the human proteome's median
melting point.

### Bilingual design accepted, 2026-09-11

[docs/design/i18n.md](../../design/i18n.md) is the design of record for English and Chinese; the round is
[3_bilingual](../3_bilingual/plan.md). Accepted as written. The architecture is one line drawn structurally: every
identifier stays English and single, every word a reader reads is authored twice, and the Chinese overlay can only name
keys the English files already declare, so **translating an identifier is impossible rather than forbidden**.

It is sequenced behind finishing chapters 2 and 3, for one concrete reason. Its stage 0 gives every driven control a
`data-action` and makes the gates match on that instead of on English labels — which rewrites `tools/drive.js` and
reaches into every figure module, all of which are being written right now. Stage 0 starts when the figure work settles.

One part of stage 0 could not wait and is with `harden-sitting`: `tools/sitting.js` matches `/^learned well$/i` against
`.tb-mark__word`. Reword the label or rename the class and the gate finds nothing, counts zero and reports success
having tested nothing. A worker is editing that component this session, so it is a live hazard rather than a
translation one.

Two findings from the browser worth keeping outside the design doc, because they are about this repo's stylesheet and
not about Chinese:

- With Chinese prose in chapter 1 and nothing else changed, **no family in `--font-text` has a single Han glyph**, so
  every reader's machine picks its own: SimSun here, PingFang on macOS, something else again elsewhere. The same page
  is a different typeface for every reader and none of them was chosen.
- `.tb-dropcap::first-line` carries `font-variant-caps: all-small-caps`, and Chromium synthesises small caps on
  ideographs **by scaling them**. The chapter's opening line renders at 72% of body size, measured per character.

Open question the owner may want to weigh: the Chinese fonts cost about 2.3 MB of first-load bytes against 0.3 MB
today. The doc states it plainly and rejects the cheap escape — listing locally installed Han families ahead of the
webfont — because that reinstates exactly the fallback lottery the section exists to end.

### Outage and recovery, 2026-09-15

A weekly API rate limit killed nine running workers at once. The host restarted; every subagent was unreachable
afterwards (`SendMessage` returned "No agent named X is reachable") and the only surviving state was the working tree.
Recovered by reading every owned file's diff before touching anything, which found `harden-sitting` had been killed
between applying its red-proof mutations and restoring them: both mastery labels in `src/components/mastery.js` were
`'牢牢掌握'`. Restored by hand to `'Holding'` and `'Learned well'`; the worker's real change (the two exports) kept.
`gate-expects` had not yet applied its mutation to `items.js`; `pond.js` was clean.

Then respawned cold, each brief carrying what was already on disk: `fix-ch02`, `fix-ch03`, `figs-ch03a`, `figs-ch03b`,
`harden-sitting`, `gate-expects`, `fix-inspect`, and one `polish-ch02-final` in place of the two polish workers, because
all 45 chapter-2 drive steps still passed and, looked at, six of the eight figures were already at the bar.

**Commit strategy, forced:** `4c4acb8` (HEAD, pushed) already holds chapters 2 and 3's prose and every registry
entry, made while 16 figure modules did not exist, so the registry test is red at HEAD and the live site serves a
chapter 2 whose figures cannot load (unlinked; direct URL only). No green commit exists until chapter 3 is complete —
figures, drive recipes and item bank — so both chapters land in one commit once the whole chain is green, then each
later chapter in its own. Chapter 3's item bank is therefore on the critical path and is dispatched the moment
`figs-ch03a`, `figs-ch03b` and `fix-ch03` have all handed off.

**A second session is live in this tree.** [docs/work/4_zizhi-tongjian](../4_zizhi-tongjian/plan.md) is a second book,
《资治通鉴》, built by another session on the owner's instruction to keep clear of this round and commit only its own
files. Its files under `tongjian/` were being written at 19:49 on 2026-09-15, so it is running concurrently, not
stranded. Its edits reach six shared files: the book-qualified page ids in `tools/lib/browser.js` (`biology/ch01`,
which this round now depends on), a book card in the library `index.html` that links to its uncommitted directory,
one comment line in `tools/check-content.js`, and entries in the devlog, the defect register, the gate proofs, the
local rules and the work registry. Its `tongjian/index.html` fails `npm run check` on three chapter hrefs it has
not built yet, which is its in-flight state and not this round's problem.

**Commit procedure, therefore:**

1. Stage by explicit path, never `git add -A`. Nothing under `tongjian/`, `docs/design/tongjian.md`,
   `docs/work/4_zizhi-tongjian/`, `test/browser-quiet.test.js` or `tools/zj-*` is staged.
2. Shared files: stage them whole, except the library's book card for `tongjian/`, which is reverse-applied from the
   index before committing so the committed library does not link to a directory the commit does not contain. The
   page-id change in `browser.js` is included because this round's gates run on it. The other session's entries in
   the shared docs ride along and the commit message says so; their own later commit of those files will simply have
   no diff there.
3. Verify the **committed revision**, not the working tree: `git worktree add ../textbook-verify HEAD`, `npm ci`,
   `npm test` there. The shared tree carries the other session's red page; the revision does not. A green run in the
   worktree is the evidence; a run in the shared tree proves nothing either way. Remove the worktree after.
4. Push only after 3 is green, then watch the Pages deploy.

**Looked at, 2026-09-15, desktop frames in `out/drive/`:** soup, bondlab, phlab, carbonkit, polymer, foldlab accepted;
waterprops has colliding series labels at the chart origin; water3d's readout is still a pill. **Not yet looked at by
anyone after the polish: all eight at phone width.** That is in `polish-ch02-final`'s brief.

### Integration checklist, this round

Two couplings cannot be messaged to a running worker in this build, so they are checked here instead:

- [x] `items-ch02` read `objectives.js` while `fix-ch02` was editing it. Ids were pinned in both briefs; confirm with
      `npm run check` that every item still names a live objective, and that items written against `dna-vs-rna` and
      `isomers` match what the chapter now teaches.
- [x] (with `type-greek-equation`) `fix-ch02` leaves the chapter's only inline `style=` in place, on the carbonic-acid equation. A displayed equation
      wants a class and a place on the baseline grid. Route to whoever owns `components.css` after `design-pass` lands.
- [ ] Four element-colour tables to reconcile to one, with a test: `lib/chem-atoms.js` (soup, bondlab, water3d, waterprops), `lib/mol-draw.js` (phlab, carbonkit, polymer, foldlab), `lib/cell-colours.js` (prokaryote), `lib/cell3-colours.js` (symbiont, cytoskeleton, cilium). Confirmed by both chapter-3 figure workers; each used what its modules import and merged nothing, as briefed.
- [x] `figs-ch03a` handed off 2026-09-15: microscopes, surface-volume, prokaryote, secretion finished, 31 drive steps, 8 narrow frames, 16 matrix frames, recipes in `tools/drive.js` before `cell3d:`. `secretion` rewritten (it had been half empty from default paragraph margins, with pill modifications and 8 px labels). Three `describe()` fields added for the recipes: `clockSeconds`, `cargo`, `membraneFaces`. Its four named imperfections, judged by the coordinator from the worker's kept frames (`scratchpad/drive4`, `matrix2`), 2026-09-15: **secretion wide**, the ~30 px cytoplasm bands above and below the route read as the cell's interior continuing, not as slack — accepted. **secretion at 390 px**, the nucleus at ~65 px and labels at ~7 CSS px, which is ~21 device px on a 3× phone, above the nine-pixel floor — accepted. **prokaryote lysed**, the burst cell filling its pane is the frame's argument — accepted; the envelope paragraph still describes the intact wall while the state line above it says the wall is gone, which is a description of the type rather than the state and is left. **surface-volume above ~50 µm**, microvilli below a pixel at a millimetre is physically true and the numbers change, which is the lesson — accepted. None carried as a defect.
- [ ] Shared `out/` directories: one worker's gate run empties another's frames mid-read (`figs-ch03a` lost drive and narrow frames twice to `polish-ch02-final`). Workers keep copies in the scratchpad. A per-run directory would fix it and `fix-inspect` argued against it for the instrument; for the gates it is an open question.
- [ ] `biology/index.html`: flip chapters 2 and 3 to Read with their own commits, once each passes.
- [ ] Chapter 3's item bank: `items-ch03` dispatched 2026-09-15 with objectives final and seven of eight figures on disk; mcq and free first, task items last, every expectation re-run through the grader against the live figure before handoff; `plantcell3d` tasks marked unverified if it has not landed.
- [ ] Greek letters (α, β, µ vs μ, Δ) and ⇌ fall out of Newsreader into a substitute face; found by `fix-ch02` in §2.7. With `type-greek-equation`, which also has the "β-" line-break hazard `fix-ch03` found and patched with word joiners.
- [ ] `symbiont.js` line 89 repeats the false mitochondrial-machinery claim the prose has dropped. Sent to `figs-ch03b`.
- [ ] `gate-expects`'s new rule rejects `2e-7` in chapter 1's `i-resolution-limits-2`. Sent back to it: settle with the grader which side is wrong; if the grader rejects it too, chapter 1 has carried an ungradeable item since it was written.
- [x] §3.5's key idea reworded to the corrected argument: now ends on "an organelle no cell can build from scratch" in place of fission.
- Handoffs with sources: [reviews/2026-09-15-fix-ch02-handoff.md](reviews/2026-09-15-fix-ch02-handoff.md), [reviews/2026-09-15-fix-ch03-handoff.md](reviews/2026-09-15-fix-ch03-handoff.md).
- [x] `tools/inspect.js` handed back stale frames. Fixed 2026-09-15: directory emptied per run, `--label` for a kept second run, selector in the filename, exit 2 when nothing matched. Two neighbours it looked at: `npm run figure` never clears `out/lab/`, a weaker form (same question always overwrites; a different question's old frame can sit beside it) whose honest fix is a per-kind directory and dropping `--out`, a design change deferred; `npm run perf` hardcodes chapter 1 while three chapters exist.
- [x] `tools/sitting.js` hardened and proved red four ways (translated word, moved class, no labels rendered, no word span); HEAD's gate passed all of them, measured. Two bounds it still has, recorded in its proof: labels collapsed behind "and N more" are not in the DOM, and the word is matched whole.
- [ ] Open observation, two workers now: at pinned `t=0`, PNGs of frames holding a 3D or animated figure differ by a few bytes between runs while pure-SVG frames are byte-identical, and the chapter-2 figure worker showed the SVG markup itself is identical across sessions. Rasteriser or encoder variance rather than figure state, on the evidence so far. Nothing chases it until a gate needs pixel identity.
- [ ] Ignored scratch under `out/` from 10 September (about twenty probe directories, hand-redirected logs) is stale evidence no task needs; delete at the commit, per canon.
- [ ] Bilingual stage 0 (`data-action` on driven controls, `tools/drive.js` and `tools/flow.js` off English labels) once the figure workers have handed off.
- [x] (resolved: `fix-ch02` confirmed all three passages unchanged on its second pass; no items to re-check) **Re-check three chapter-2 items** whose quoted prose was rewritten under the item worker while it wrote: the CO2 "barely interacts" distractor, the buffers explanation, and `i-denaturation-3`'s rubric. `fix-ch02` was still editing that prose afterwards, so they may have moved twice.
- [ ] Chapter 2's item bank names four weak spots its author could not fix from inside: `i-water-solvent-2` grades on half its question; two `soup`/`waterprops` tasks become true on their own as the clock runs, so only the `panel ===` clause proves the reader acted; and `i-molecular-scale-3` asks a phone reader to read a card the narrow `soup` layout does not draw. Decide each.
- [ ] `design-pass` left the devlog and defect-register entries to the coordinator deliberately, to avoid clobbering shared newest-first files while four workers were active. Both written 2026-09-11. Its own caution stands: two `devices` failures it saw did not reproduce, because `tools/devices.js` was being rewritten underneath the run.

## Status

`—` not started · `author` prose in progress · `build` figures and items in progress · `gate` integrating · `done` committed

| # | Chapter | State | Commit |
|---|---|---|---|
| 1 | What is life? | done | 7c6f905 |
| 2 | The chemistry of life | build | |
| 3 | Cells | build | |
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
