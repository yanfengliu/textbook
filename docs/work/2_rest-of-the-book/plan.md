# The rest of The Living World: chapters 2 to 32

Status: active
Owner: Integration owner (textbook session, 2026-09-10)
Created: 2026-09-10
Updated: 2026-09-24

## Where this round stands

Updated 2026-09-24, when the round was reopened to publish chapters 7 and 8. **This section and the chapter table under it are the live state; everything below them is the round's narrative, oldest first, and it is history** — what was believed, what proved false, what a review caught, what a number was before it moved. Read the narrative for the evidence behind a decision, not for what to do next.

**The round stopped at chapter 6's landing, by the owner's decision of 2026-09-23: "Reduce scope and stop at your current chapter's completion." On 2026-09-24 the owner told the coordinator: "If chapters are written then of course publish them." Chapters 7 and 8 were the written ones, so the round is reopened to publish them. Nothing after chapter 8 starts until the owner asks** ([local-rules.md, point 10](../../policies/local-rules.md#the-usage-allowance-is-the-budget-the-owners-direction-of-2026-09-23)). Chapter 6 is on main, and it shipped at reduced scope:

- 4 of its 8 figures: `pigment-spectra`, `zscheme`, `calvin-cycle`, `rubisco-fork`;
- questions in place of figure tasks;
- two independent reviews, both applied: the prose review of chapters 6 and 7 ([reviews/2026-09-22-ch06-ch07-prose.md](reviews/2026-09-22-ch06-ch07-prose.md)), and the accuracy review against OpenStax *Biology 2e* chapter 8 that the owner's direction now asks of every chapter before it ships, which covered the prose, the item bank and the four figures against their captions ([reviews/2026-09-24-ch06-accuracy.md](reviews/2026-09-24-ch06-accuracy.md));
- no new gates.

Chapters 7 and 8 ship at the same scope: four figures each, questions in place of figure tasks, an accuracy review against OpenStax *Biology 2e* applied before they land, and no new gates. Where they stand is under In progress. The stop still supersedes the standing goal of writing the whole book, which is what this file's title and the chapter table below still describe.

The compaction setting (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=25` in `.claude/settings.json`) is on main as `237c96e`. The peer session's branch `autocompact-setting` (`55fee72`) was not merged.

### On main

Biology chapters 1 to 6 are published, and so are the second book's chapters 1 to 3.

- `5e9c981` (2026-09-22) landed chapters 4 and 5 and the week's gate work. Its local chain ran 12 of 12 green in 2322 s. GitHub's `test` job went red at `drive`, on `bilayer`'s 90 °C step.
- `26d47cf` (2026-09-23) applies the reader's theme before first paint, makes `npm run shot` wait for the page to stop moving before it photographs, adds `npm run theme` as a chain step, and says what a shot frame is for. Its review is [reviews/2026-09-22-shot-reproducibility-review.md](reviews/2026-09-22-shot-reproducibility-review.md).
- The first landing of 2026-09-23 merged five branches, each cut from `5e9c981`. `fix-ch04` and `fix-ch05` apply [reviews/2026-09-22-ch04-ch05-prose.md](reviews/2026-09-22-ch04-ch05-prose.md), balance option lengths so the longest option no longer gives the answer away, take the markup out of glossary terms, and add a content rule against markup in a term. `choice-order` shows the options of Today and of the chapter checks in a drawn order, and adds a content rule against an explanation that names an option by its place. `sort-layout` wraps a sort's rows instead of collapsing names to 0 px, and makes `npm run shot` fail a text box narrower than its own words. `atp-ladder` makes Figure 5.3's verdict say the donor phosphorylates ADP, and makes up move the marker up.
- Chapter 6's landing, 2026-09-23, from branch `land-3`, merged eight branches and took chapter 6's bank from `items-ch06` as a file, leaving chapter 7 on that branch:
  - `ch04-figs` reads `bilayer`'s verdict over a window of its own clock instead of one sweep, and raises its tank floor. That is meant to end the 90 °C flicker that turned GitHub's `test` job red on `5e9c981` and on `407827c`; the run on `fff1646` also went red after about 20 minutes, and its log can no longer be read. Whether the fix holds on GitHub's runner is for the first run on main after this landing to say. It also fixes the Curl words and the osmometer's, fixes chapter 4's 30 contrast pairs, and takes chapter 4 off `npm run legible`'s deferred list.
  - `site-and-ci` stops the library page and `README.md` naming chapters, and adds `checkChapterAvailability` to `npm run check`. CI now runs on three engines for up to 240 minutes, on a pinned image.
  - `term-markup` keeps a glossary term's markup in its label, and keeps its card on a phone's screen.
  - `ch06` and the four figure branches bring the chapter itself.
  - The landing's own edits join chapter 6 to the contents page, chapter 5's card and Today, and apply the accuracy review's ten figure findings. They also fix two defects only the combined tree had: the glossary's term column was too narrow for "Photophosphorylation", and a hyphen Figure 6.1 draws was missing from chapter 6's font subset.
  - The full `npm test` ran once, untrimmed, on `3764814` before the push: 13 of 13 steps green in 2356 s, with the tree's head and status the same before and after. The commit that records this result touches only `docs/devlog/summary.md` and this file, so it is the one thing on main the chain did not run over; `npm run unit` and `npm run check` ran over it.
- No independent review has been done of `5e9c981`, of the first 2026-09-23 landing, or of chapter 6's landing beyond the accuracy review of its figures; see Review under Open.
- Since chapter 6's landing, main has taken two fleet canon syncs and `237c96e`, the compaction setting.
- GitHub's CI went red at `npm run legible` on every main commit whose job log was read: `a1566c8`, `aedd40d` and `237c96e`, four job logs in all. In Figure 4.7's heart cell, "pump" measured 4.33:1 in the dark theme where a striation crosses it. Locally the same gate was green, because fewer of the glyph's pixels fell on the line. The chain stops at its first red step, so `devices`, `sweep3d` and `subpath` did not run in those jobs. `fb3f6b2` on `land-4` fixes the label, and it reaches main with the landing.

### In progress

Publishing chapters 7 and 8. The landing is staged on `origin/land-4`, which is not merged to main. It holds:

- merges of `term-comma` (a mark after a glossary term stays on the term's line; [the register's entry](../../learning/defect-register.md#2026-09-24--a-comma-after-a-glossary-term-began-a-line-on-its-own)), of `ch07` at `bc523ab` with all 67 findings of [its accuracy review](reviews/2026-09-24-ch07-accuracy.md) applied, of `fig-ch07-a` (Figure 7.1), and of `fig-ch08-a` and `fig-ch08-b` (Figures 8.1 to 8.4);
- the landing's own edits: chapter 6's closing card and its `FIGURES.md`, the contents page and Today for chapters 7 and 8, chapter 5's pointer to gene control (Chapter 12, not 8), a no-break space between a name and its Roman numeral in chapters 1 to 7 (229 of them), the Figure 4.7 fix above, this section, and the owner's direction in `AGENTS.md` and `local-rules.md`.

The final landing still needs, in this order:

1. The branches still being worked on, merged: Figures 7.2 `krebs` (`fig-ch07-d`), 7.3 `respiratory-chain` (`fig-ch07-b`) and 7.4 `fermentation` (`fig-ch07-c`); `fig-ch07-a` again, which moved on to `924381b` after it was merged; chapter 8 from `origin/ch08`, which holds its bank and its accuracy review's findings; and `fig-ch08-a` and `fig-ch08-b` again if the review of chapter 8's four figures moves them. `npm run check` then finds chapter 7's four kinds registered and chapter 8's bank.
2. Chapter 8's name–numeral pass (DNA polymerase I and III and the like), and the six "Unit I" to "Unit VI" labels on the biology contents page.
3. Chapter 8's accuracy review, copied into reviews/.
4. A look at two things in the shot frames: §7.7's acceptor table, which scrolls sideways at 390 px, and about 250 px of empty column before Figure 7.4 at 1440 px. Each is fixed if it falls short of how earlier chapters handle wide tables and margin notes.
5. The fonts checked again once every figure is in, and the stranded-mark measurement repeated on chapters 7 and 8 as landed, since `term-comma` measured drafts.
6. One full `npm test`, untrimmed, and an independent review of the integrated diff, before the push to main.

`origin/ch06-07`, `origin/items-ch07`, `origin/items-ch07-final`, `origin/items-ch08` and `origin/ch08-dna` are not merged: `ch07` and `ch08` took their files from them. The `textbook-wt-*` worktrees, the `provenance-*` and `autocompact-setting` branches and `stash@{0}` belong to other sessions.

### Open

Open, not scheduled. Nothing below is dispatched, and any of it that is picked up must fit the owner's decision above.

**Reader-visible**

- Today's inset focus ring covers the first stroke of the focused option's letter. Found by `choice-order`.
- Table headings are uppercased by CSS, so units print as "KJ/MOL" and "MMOL/L", and a capital K is wrong for kilo. Units need `text-transform: none` (a `.unit` span), or the headings should not be uppercased. A check for the class goes with the fix.
- A precomposed "NAD⁺" passes the glossary rule but looks wrong at 3x. The recipe's §7 says super- and subscripts are markup.
- Two decisions: curly or straight quotes book-wide, and whether "carbon–carbon" may break after the dash on a phone.
- The second book's character card runs its unbound-sense note out of the card at 390 px. Found by `sort-layout`.
- Chapter 4, left open by `fix-ch04`: §4.1 says a needle hole self-heals, where living cells actively patch it (McNeil & Steinhardt 2003); "electron micrographs of the day" is dated 1935; the claim that aquaporins refuse protons is contested; and `i-tonicity-animal-1`'s distractor is "true as far as it goes". The other two it left, `bilayer`'s "two open ends" and the osmometer's "pull", were fixed by `ch04-figs`.
- Chapter 4, left open by `ch04-figs`:
  - `gradient-battery` at 390 px prints "1.00 × the untreated contraction" over the next heading;
  - a tank of pure cholesterol at 37 °C reads "Bilayer";
  - ions overlap at 390 px in `permeability`, `transport-lab` and `gradient-battery`;
  - the osmometer shows mmol/L before a slider moves and mM after, and draws stray dots on a burst.
- Chapter 6's closing card names "7 · Cellular respiration" and links to the contents page, where chapter 7 is in preparation. That is the shape of the 2026-09-22 prose review's finding 27. Fixed on `land-4` in `099868a`, and it reaches main with the landing.
- `i-cyclic-flow-2` asks the objective's old question, "Name the two things it therefore cannot be used for". Its rubric covers both wordings.
- The multiple-choice length tell in chapters 1 to 3: the correct option is the longest in 42 of 49, 49 of 52 and 43 of 45. Rebalance by rewording, never by reordering the options of a shipped bank, and add a bank-level binomial check to `tools/check-content.js`.
- `soup.js` should redraw when the webfonts arrive; bundle it with the next change to a chapter 2 figure. `docs/learning/defect-register.md` already records soup, so the fix updates that entry with its gate rather than adding one.
- `docs/design/textbook.md` lines 3 and 194 still say only chapter 1 exists. It is a design doc, so the change needs review. Found by `site-and-ci`.

**Study system**

- "Export on Today", which the 2026-09-23 project audit recommended.

**Gates and CI**

- `npm run flow` drives the checks of chapter 1 and the second book only, so it says nothing about the checks of chapters 2 to 6.
- `npm run devices` cannot see a glossary card that runs off a phone's screen. It measures against `innerWidth`, which the card inflates, and it checks sideways scroll before any card opens. The bound is stated in its header and in `docs/policies/gates.md`. The defect it missed, chapter 5's NAD⁺ card at 63–415 px, fixed by `term-markup`, has no entry in `docs/learning/defect-register.md` and no gate, under the owner's "no new gates".
- Figure 6.1's alga panel draws its light only while the slider stands where it was lit (the accuracy review's finding 15). `describe()` does not report the panel and no `drive` step reads its label, so nothing gates it.
- The lab page's font link lacks U+2010, λ, Ψ and Δ, which chapter 6's figures draw. `npm run shot` does not visit the lab, so no gate sees it.
- `npm run pinned` starts eight shards by default, and GitHub's runner has 4 CPUs. A press that misses its 5 s timeout is skipped, not failed, so the gate cannot tell a press that did nothing from one that never ran. Found by `site-and-ci`.
- `docs/policies/local-rules.md` says `node --test "test/*.test.js"` cannot run on this machine (`spawn EPERM`). On 2026-09-23 it ran 260 of 260 here, so the note may be stale.
- The audit's gate recommendations are still owed: a core gate per commit, the full chain at a chapter's landing, and CI blocking Pages. `npm test` stays the commit gate until a core gate exists.

**Docs and records**

- Stale sentences: the defect register's "six figures", three gate-proof entries that say they have no index row, and the gate-proofs introduction's "ten gates".
- Register rounds 5 and 6 in `docs/work/registry.json` through the allocator. They belong to the 資治通鑑 session, whose round-6 note is `stash@{0}` in the primary checkout.
- The recipe's §7 may need a line: a worker reported that the Write and Edit tools turned a typed `&#8288;` into a raw U+2060. On 2026-09-23 the Write tool kept it as typed in a Markdown file, so when it happens is not pinned down.
- `fix-ch04` re-ided two osmosis items, `i-osmosis-mechanism-1` to `-4` and `-3` to `-5`. The scheduler's `slotFor` keeps one card per objective, so a reader's earlier right answers under the old ids still count. Left as the owner's call: the stakes are low, since the chapter had just been published.

**Review**

- Independent code review is owed for `5e9c981`, for `choice-order`'s `mastery.js` diff, for the first 2026-09-23 landing, and for the integration edits of chapter 6's landing. Those edits are the merges' conflict resolutions, the registry order, the glossary column, the font subset, `tools/drive.js`'s header, the `devices` bound in `docs/policies/gates.md` and in the gate's header, and four gate-proof entries. `mastery.js`, the content checker's rules, `docs/policies/gates.md` and `AGENTS.md` are on the high-risk list.
- The lanes, as a peer session reported them on 2026-09-23: the `claude` CLI's login has expired and the owner must log in again; Codex is out of usage until 2026-09-26 16:29, and CLI 0.148.0 is too old for its pinned model. Until then an independent review is a fresh read-only subagent, and the work says so.

**Brought into scope by the owner's answer of 2026-09-24**

This list was out of scope until then. Each item is now part of publishing chapters 7 and 8, under In progress.

- `fix-ch07`: chapter 7's half of the chapter 6 and 7 prose review ([reviews/2026-09-22-ch06-ch07-prose.md](reviews/2026-09-22-ch06-ch07-prose.md)). Applied on `ch07`.
- `ch67-contract`'s chapter 7 half: registering chapter 7's kinds and writing their drive recipes. Each figure branch does this for its own figure.
- Chapter 7's figures and landing. Its task items are questions instead, at chapter 6's scope.
- `ch08-finish`: a review of chapter 8, the typographic-quote pass it held back, and the gloss that ¹⁵N differs by weight, not by radioactivity. The review is done. Whether the other two reached `origin/ch08` is checked at the landing.

The live state this section replaced, last written on 2026-09-16, is kept [at the end of the narrative](#the-live-state-as-it-stood-from-2026-09-16-superseded-2026-09-23). Its items were not re-checked one by one on 2026-09-23.

### Chapters

`—` not started · `author` prose in progress · `build` figures and items in progress · `gate` integrating · `done` committed · `held` written, kept off main by the owner's decision

Under the owner's decisions of 2026-09-23 and 2026-09-24, chapters 9 to 32 are not started until the owner asks.

| # | Chapter | State | Commit |
|---|---|---|---|
| 1 | What is life? | done | 7c6f905 |
| 2 | The chemistry of life | done | 0482dde |
| 3 | Cells | done | 0482dde |
| 4 | Membranes and transport | done | 5e9c981; review fixes f7cf38f |
| 5 | Energy and metabolism | done | 5e9c981; review fixes d1f9db2 |
| 6 | Photosynthesis | done, reduced scope | `land-3`: prose b35cdc1, figures eb6c2c8–7dfe80d, items fa104a5 |
| 7 | Cellular respiration | build | prose and bank `origin/ch07` (`bc523ab`) and Figure 7.1, staged on `land-4`; Figures 7.2 to 7.4 on their branches |
| 8 | DNA | build | prose and bank on `origin/ch08`, review findings being applied; Figures 8.1 to 8.4 staged on `land-4` |
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

## Problem and outcome

Chapter 1 exists and established the shape. The owner wants the book finished: all thirty-two chapters written to the same standard, with their figures, objectives and review banks, each passing the nine gates and committed as it lands.

Outcome: a reader can read *The Living World* end to end, and the study system has an objective graph and an item bank covering all of it.

## Approach

One chapter at a time through the pipeline in [chapter-recipe.md](../../design/chapter-recipe.md), two or three chapters in flight at once because a chapter's own files are a directory of its own and its figures are separate modules.

Per chapter: an author writes the prose, glossary, objectives and a figure brief; the integration owner registers the figures from that brief; figure workers and an item worker run in parallel; the integration owner mounts, gates, looks at the frames, and commits. **A chapter is committed when it is done, not batched** (owner instruction, 2026-09-10).

The only shared files are `src/figures/registry.js`, `tools/drive.js` and the chapter list on `biology/index.html`. The integration owner owns all three, so workers never touch them. `tools/lib/browser.js` used to be a fourth; chapters are discovered from disk now, so there is nothing to add.

## Acceptance criteria, per chapter

- [ ] Prose reads as a book, is accurate at first-year undergraduate level, and hedges where the science hedges.
- [ ] At most about four bespoke interactive figures, each showing a mechanism the reader can push on rather than a labelled picture, with authored static SVG elsewhere. This is the owner's direction of 2026-09-23; until then the criterion was six to nine.
- [ ] An independent accuracy review against the matching OpenStax *Biology 2e* section, covering the prose, the figures against their captions and the item bank, applied before the chapter ships. Also the owner's direction of 2026-09-23.
- [ ] Twenty to thirty-five objectives with a sound prerequisite graph, which may reach back into earlier chapters.
- [ ] Three or more items per objective, mixing the formats, every distractor carrying the misconception it encodes.
- [ ] Every figure has a `drive` recipe and `npm test` passes all thirteen steps. The chapter no longer needs adding to `PAGES`: chapters are discovered from disk (2026-09-11), so a chapter is gated from the moment its `index.html` exists.
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

Open *as of 2026-09-11*, kept as written. The live list is [Open](#open) at the top of this file.

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

**Overtaken, 2026-09-15 21:21.** The second book's session committed `6d854cf` — 105 files, the whole working tree,
this round's uncommitted work included — and pushed it, then `e6daf7a` at 23:02. The commit procedure above never
ran. What that put on main: chapter 2 complete with its bank; chapter 3's prose, objectives and all eight figure
modules, with `plantcell3d` mid-build (its compare view had not landed) and no `items.js`, so `npm run check` is red
on main and the live site serves chapter 3 without a bank; the furniture redesign; every gate change; the typography
worker's stylesheet edits with their verification never run; and the chapter-2 polish mid-verification. Also: a
session limit then killed the four remaining workers (`figs-ch03b`, `polish-ch02-final`, `type-greek-equation`,
`items-ch03`) and the host restart took them with it, as before. At the next look (2026-09-16) the tree was three
modified files, all the other session's or the canon sync's. Recovery is therefore respawns against main, and the
next commits are ordinary ones: main is already carrying this round, green or not.

**Canon, 2026-09-15, and how this round now applies it.** Two owner directives reached `AGENTS.md` through the
fleet sync on 2026-09-16 (block `bb31c741ed27`, to be committed by pathspec with the Gates edits). *Size the team to
the work continuously; an expensive gate is a resource exactly one worker runs at a time.* This round had been running
up to nine workers each firing browser gates at once, and they emptied each other's `out/` directories mid-read
(`figs-ch03a` lost its frames twice). From the 2026-09-16 respawns: four workers, disjoint files, kind-trimmed runs
only (`DRIVE_KINDS`, `NARROW_KINDS`, `SWEEP_KINDS`, `SHOT_PAGES`, `DEVICE_PAGES`), frames copied out of `out/`
immediately, and the full chain run once, by the coordinator, at the end. *Anything slow on the critical path is a
defect to identify and fix, not a cost to schedule around.* Candidates here, not yet acted on: `foldlab`'s recipe
waits ~4 s per fold and ~40 s in all; `polymer`'s recipe sleeps between steps; `devices` runs three engines; every
gate re-fetches fonts and Three.js from the network. Which of that a verdict depends on is the question to answer
before the next full-chain run.

**Looked at, 2026-09-15, desktop frames in `out/drive/`:** soup, bondlab, phlab, carbonkit, polymer, foldlab accepted;
waterprops has colliding series labels at the chart origin; water3d's readout is still a pill. **Not yet looked at by
anyone after the polish: all eight at phone width.** That is in `polish-ch02-final`'s brief.

### Independent review of the gates and the contract, 2026-09-16

[reviews/2026-09-16-gates-and-contract-review.md](reviews/2026-09-16-gates-and-contract-review.md), read-only, no browser.
Verdicts: the `describe()` ownership change sound with fixes; the grammar change sound with fixes; the checker rules
sound; the sitting hardening sound with fixes; discovery sound; the device gate sound with fixes; the design doc sound
with fixes; the stylesheet claims sound for the chapter pages and false for the study page.

The findings that matter, all of the round's own pattern — a gate that reports success having tested nothing:

- A `DEVICE_PAGES`, `DEVICE_ONLY`, `SHOT_PAGES` or `SHOT_VIEWPORTS` value that matches nothing runs zero loads and
  exits 0. The page ids became book-qualified this round, so the exact commands quoted as evidence in
  `gate-proofs.md` (`DEVICE_PAGES=library,ch01`) now silently drop the chapter.
- `drive.js`'s ownership check reads a missing handle as "nothing shadowed".
- `sitting.js` never checks the sitting finished, caps at 24 steps unstated, and counts labels document-wide, where
  "Where you stand" renders labels before any question; removing only the closing list's labels stays green.
- `devices.js`'s header, drawer, popover and edge suites skip silently when their selector matches nothing.
- `expectProblems` accepts `x > ""`, `x > null`, `x > true`.
- `figure.js` gives every `zh-Hans` page a Traditional 圖 in its captions, and an English aria-label.
- The Furniture rule is true of `components.css` and false of `learning.css`: the study page still has the bordered
  card, bordered rows and outlined circle the design doc says were removed.

Checked and clean, with numbers: the tokeniser A/B over both banks (48 of 49 identical, only `2e-7` differs);
every `describe()` consumer; `checkStudySources`; discovery derived twice; ten steps, nine devices, three engines;
contrast by arithmetic ≥ 4.70:1 for every text token on the backgrounds it is set on; no synthesised italic; no
colour literal outside the print block.

Dispatched: `gate-fixes` (every gate finding, each proved red; the docs-versus-code items; the `figure.js` word
table) and `today-furniture` (the study page to the rule, with a contrast sweep).

### Three workers have now reported the same thing: concurrent gate runs destroy each other's evidence

`shot`, `drive`, `narrow`, `devices` and `sweep3d` each `rmSync(OUT)` at startup. When two workers run browser gates
at once, the second wipes the first's frames and report mid-read. Reported by `figs-ch03a` (lost its drive and narrow
frames twice), by `polish-ch02-final-2`, and now by `publish-and-fonts` (lost `out/shots/report.json` twice).

Exit statuses were never affected, which is why it took three reports to surface: the verdict is right and the
evidence for it is gone, so a worker that wants to look at what it just proved cannot. The canon's answer is that an
expensive gate is a resource exactly one worker runs at a time, and I have been enforcing that; but the gates should
not be silently destructive either, since the rule protects the machine and not the evidence. `fix-inspect` argued
against per-run directories for the instrument and for clearing, on the grounds that a stale frame is worse than a
missing one. That argument holds for a person reading one run; it does not hold for two runs at once. A run id in
the directory name, with a `latest` pointer, would satisfy both. Not yet dispatched.

### Chapter 4 written, 2026-09-16 — the recipe's first test

`biology/ch04-membranes-and-transport/`, eight sections, 37 objectives, 57 glossary entries, eight figure briefs.
Written against the rewritten recipe, and the difference shows where it was meant to:

- **21 prerequisite edges reach out of the chapter**, covering 20 of its 37 objectives: ten to chapter 2, nine to
  chapter 3, two to chapter 1. Chapter 3 had **zero** to chapter 2 and it cost a full rework pass.
- The author **found and fixed five arithmetic errors in its own draft** before handing off, all of the kind the
  independent review had to catch in chapter 3: a tenfold where the gradient is 35-fold (twice, once inside a key
  idea), fifteen orders of magnitude for a thirteen-order contrast, sixty times where the chapter's own numbers give
  forty, and a closing line miscounting its own promises.
- It paid chapter 3's osmosis debt in the first paragraph of the section that owes it.

Open, and with `ch04-contract`: the eight kinds are unregistered, and the palette wants a chapter-4 set that chapters
5 and 7 will reuse. Held for later: it is the longest chapter in the book at 12,511 words against chapter 3's 10,274,
and the author names two paragraphs a trimming pass would not miss.

One trap it passed on, worth keeping: a layout measurement 600 ms after load reported 117 overflowing elements and a
683 px scroll width at a 390 px viewport; the same measurement at 1800 ms reported zero, because the shell had not
yet moved the contents drawer off-canvas. Any overflow probe that does not wait on the handshake is measuring the
page mid-build.

### The recipe is now the thing that stops the rework, 2026-09-16

Three chapters in eight days, twenty-nine to go, and almost none of that was writing: it was rework, because the
criteria lived in rejection messages rather than in the contract. `docs/design/chapter-recipe.md` is rewritten as
eight stages with 49 yes/no boxes, and `docs/design/figures-template.md` is new, so a figure worker reads the
criteria in its own brief. Each item names the pass it would have prevented and the evidence.

It also found the old recipe telling authors to add a chapter to `PAGES` in `tools/lib/browser.js` — wrong since
chapters became discovered from disk on 2026-09-11. An author following the recipe would have edited a list that no
longer works that way.

Five things it could not turn into a checkable line, worth keeping visible:

- "Is this panel composed?" and "does this distractor encode a real misconception?" have no operational test. Only
  the negative, plus who looks, at what resolution, in which themes.
- Labels cannot be proved not to collide: the state space is unbounded, and collisions appeared at one slider value
  and not another. The gate-shaped hole is a check that sweeps a figure's controls and diffs label bounding boxes.
- `tools/pages-exclude.txt` is hand-maintained, so chapter 4's `FIGURES.md` would have deployed to the live site.
  With `publish-and-fonts`, which derives it and gates it.
- Nothing proves no glyph is drawn by a system font; the census that proved it was a scratch probe and is gone. Also
  with `publish-and-fonts`, folded into `npm run shot`.

### The full chain, timed, 2026-09-16 on `f5bd0e9`

Run once by the coordinator with no worker competing, each gate as its own process, wall-clock per step:

| gate | result | time |
|---|---|---|
| unit | pass | 2 s |
| check | pass | 1 s |
| flow | pass | 4 s |
| sitting | pass | 21 s |
| sweep3d | pass | 36 s |
| narrow | pass | 79 s |
| shot | **fail** | 93 s |
| subpath | **fail** | 138 s |
| drive | pass | 230 s |
| devices | **fail** | 1479 s |

**Three failures, one defect.** A chapter-3 figure hands the DOM `<rect width="-0.1">` at tablet and desktop, and
not at phone; it is on main, pushed, and logging console errors on the live site. `shot` sees it at three
page-loads, `devices` at two, `subpath` at one. With `fix-negative-rect`, which also gates the class, because a
figure that produced a `NaN` on an attribute the browser ignores silently would still pass everything.

**The slow thing, per the canon directive of 2026-09-15.** `devices` is 25 minutes of a 36-minute chain: 98 loads
over 13 engine-device pairs on 10 pages, and it grew by a book and two chapters this round without its shape
changing. `drive` is 230 s, of which `foldlab` alone waits ~40 s on real anneals. Neither is slowness a verdict
depends on: `devices` re-runs nine shapes over pages whose components are identical, and `drive`'s waits are for a
search whose result the figure already reports. Next after the proofs, and before this chain is run again.

### The figure bench: designed, and my own diagnosis corrected

[docs/design/figure-bench.md](../../design/figure-bench.md). I told the owner 93 % of figure code was duplicated.
That was wrong, and the design says so with measurements: 93 % sits outside `src/figures/lib/`, but the genuinely
absorbable scaffolding is **about 24 % of a figure** — 212 of `osmometer.js`'s 874 lines, accounted for block by
block with line ranges. Of the code, 10.5 % is CSS, 12.1 % comment and 6.1 % blank. The saving is real but it is
two hundred lines of nine hundred, not eight hundred.

**Recommendation, accepted: build the bench, make it mandatory from chapter 5, migrate `phlab` alone as the proof,
and leave the other thirty-five.** The reason is not the edit, it is the re-acceptance: no gate here can see
composition, so a migrated figure needs a person at 390 px, 3x, in both themes. That cost is not worth paying on a
figure already accepted.

**Three findings that changed it:**

- **The duplication is my process, not laziness.** A figure worker may not edit a shared file, so each chapter's
  helper library was created up front by the coordinator and could not reach back into the previous chapter's.
  That is why `mulberry32` is defined six times. The bench inherits the constraint: it must be one file, finished
  before workers start, that a worker cannot extend mid-chapter.
- **`lib/cell-common.js` ships a pill and a rounded progress bar**, both now forbidden by the figure template's own
  header, and three figures still draw them. A shared component that outlives its design spreads the defect and
  makes it look sanctioned.
- **Twelve byte-identical copies of the primary-action rule exist to fight `components.css`**, where
  `.fig-btn[aria-pressed="true"]` is a fill while the criterion wants `--rule-head` on the edge. Fixing the cause
  leaves the copies nothing to fight.

**The load-bearing prerequisite is `tools/figure-diff.js`**, not the bench: hash every frame a kind's trimmed runs
write and compare across a change, so byte-identical frames mean no second look is needed. Without it the honest
answer to "migrate the thirty-six" is simply no.

Also counted: 12 identical copies of the toolbar divider, 11 of the live-region inline style, 6 of the 0.53-em
advance estimate, and **three competing readout vocabularies** — 12 figures on `mol-draw`, 4 on `cell-common`, 12
on their own.

### Chapter 4's eight figures are done, 2026-09-16

`figs-ch04a` landed `bilayer`, `permeability`, `osmometer` and `bulk-transport`: 25 drive steps, 8 narrow frames,
6 clean page loads of the chapter with 8,625 to 11,341 SVG attributes scanned per load and no negative or `NaN`
among them. All 36 registered kinds now have a drive recipe; one handoff reports `membrane3d` as missing, and it is
not — that worker checked before the other's insert landed, and it sits at `tools/drive.js:1647`.

Two of its named imperfections are contracts for the item bank, and were sent to `items-ch04`:

- **`bilayer` can never report `assembly: "vesicle"`.** 34 molecules at 1.16 nm against a 5.7 nm sheet cannot close
  a ring; about ninety could. Curl closes the rims by capping instead, and the readout says which it did. An item
  written against that value would never grade.
- **`bilayer`'s `thicknessNm` is 5.6–6.9, not the chapter's 7**, and is right: it is bare lipid, whose oily core row
  reads the 3.3 nm §4.1 gives. The 7 nm is a membrane with its proteins.

It also found the deeper reason a gate flakes, now a local rule: **a fixed sleep in a recipe is an assertion about
how busy the machine is.** With another gate running, `bilayer` advanced 5 s of figure time in 13 s of wall time.
Every wait in these recipes polls `describe()` instead. This is also why `drive` takes 230 s.

One request for the shared table, not acted on: an LDL receptor has no colour in `MEMBRANE`, and was drawn in the
book's protein violet. If chapter 5 or 7 wants one, that is a change to `src/palette.js` and mine to assign.

### Chapter 4's transport figures, 2026-09-16, and a class defect they exposed

`figs-ch04b` landed `membrane3d`, `transport-lab`, `pump` and `gradient-battery`: 29 drive steps, 8 narrow frames,
15 sweep frames, 175 unit tests, and a geometry scan of 38,400 SVG attributes over 64 mounts with no negative or
`NaN` value. §4.7's claim is now carried by numbers rather than assertion — blocking the pump moves the potential
0.94 mV in three minutes, blocking the leak moves it 74.65 mV in under half a second, eighty times the movement in a
two-thousandth of the time, with both markers on one trace.

**Four defects it caught by looking, none of which a green step saw.** The pump never changed shape through its six
stages, so the one thing the figure exists to show was not happening while the readout said it was. It reached state
`error` at 390 px only, from a wrap helper indexing an empty array. Removing the tight junction made the glucose
ratio *rise*, the opposite of the chapter's point, because the leak was smaller than the symporter's flux. And the
bleached spot could not recover, because at 7 nm it was a third of the patch.

**The class defect, now with `fixed-fill-contrast`.** The `MEMBRANE` label trap generalises: `ORGANELLES`,
`EXTRA_ORGANELLES`, `MEMBRANE` and `BASES` are all **fixed hexes that do not follow the theme**, while `ink` and
`paper` do. So any text written in `ink` over a pale fixed fill is right in light and unreadable in dark.
`gradient-battery` had exactly this, a voltmeter reading near-white on near-white cytoplasm. **Sixteen figure modules
read an organelle lookup and twelve of them are on published chapters**, so instances may be live now. Fixed by
mixing the fill towards the paper so it follows the theme, adding no colour.

The underlying question, which that worker is asked to answer with evidence rather than taste: four fixed tables
against two theme-varying tokens is a design that invites this every time somebody writes on a fill.

### The six proofs, 2026-09-16 — five red, one honestly refused

`six-proofs` landed 222 lines in `docs/learning/gate-proofs.md`. Five gates were made to fail by reintroducing their
defect and restored to the byte, hashes recorded. The sixth could not be, and saying so is the result:

**`src/components/figure.js`'s Traditional branch cannot be made red, because no page in the repository is
`zh-Hant`.** Every tracked page is English except the four 資治通鑑 pages, which declare `zh-Hans`. So
`FIGURE_WORDS['zh-hant']` and `shot`'s own 圖 branch are unreached by every gate, and `test/strings.test.js` asserts
that the key exists rather than that the lookup reaches it — a check built from the same symbol as the thing it
checks. The Simplified half **was** proved, using the real pre-fix code from `e6daf7a`. Decision: keep the data,
since `docs/design/i18n.md` admits a third language without change, but the test must stop implying coverage it does
not have. Queued.

Three findings from the proving that are worth more than the proofs:

- **Only `devices` has a backstop.** With `trim.js`'s guard disabled, `devices` still fails through its own zero-load
  check; the other five exit 0 announcing `0 steps over 0 figures passed`. The guard is the only thing standing
  between those five and a green run that did nothing.
- **The sitting gate's scope is justified by a number.** With the end summary's labels removed, 0 match inside
  `.tb-close` while **2 still match elsewhere on the page** — so the page-wide count this replaced would have passed.
- **A figure that returns nothing cannot reach the branch written for it.** `figure.js` does `mount(…) || {}`, so a
  falsy return becomes an empty object and lands in the second branch. The first branch catches only a handle whose
  `describe` is missing. The third branch, a mounted handle differing from the published one, remains unproved.

Also corrected: the organelle table's gate is `test/organelle-table.test.js`, not the element table's. And the
`unit` bullet no longer pins a count — it states the claim that matters, that `node --test test/` on Node 24 reads no
test file at all and fails one bogus test named `test`, so a run that touched none of the suite still prints a count.
The number had been wrong twice.

### Six gates shipped without a red proof, 2026-09-16

The model limit killed `gate-fixes`, `today-furniture` and `one-organelle-table` mid-verification, and the second
book's session then committed and pushed the tree again (`0482dde`). All three had got further than their last
messages implied — `tools/lib/trim.js` is real and used by six tools, `CLOSING_CLASS` is exported and read,
`drive.js` inspects the handle, `learning.css` is 689 lines changed, `cell-colours.js` is deleted into
`cell3-colours.js` — but **the red proofs were not recorded**, and the canon is that a gate counts only once it has
been made to go red by reintroducing the defect. `AGENTS.md` now describes all of them as if they were proved.

Unproven, on main, pushed, and live:

| Gate | The claim in its header | Proof |
|---|---|---|
| `tools/lib/trim.js`, six tools | a trimming variable naming nothing stops the gate instead of running nothing and passing | none; the one "trim" line in the proofs file is a correction to a quoted command |
| `tools/sitting.js` | the sitting reaches its end summary within 24 presses, read from `describe().finished`, and that summary carries a label | none; the `sitting` section proves the 2026-09-15 word and class hardening, not this |
| `tools/drive.js` | a kind the frame holds no handle for, or whose handle has no `describe()`, fails | none |
| `src/components/figure.js` | `zh-Hans` gets 图 and `zh-Hant` 圖, in the caption and the aria-label | none |
| `tools/devices.js` | a suite finding none of its subject on a page that must have it fails, from a per-page table | none |
| `src/figures/lib/cell3-colours.js`, `test/element-table.test.js` | one organelle table, consistent with `ORGANELLES` | none; the one "organelle" line is in the element table's own "what it does not prove" |

### Closed at integration, this round

Closed checklist items, kept for their evidence: each records what a worker handed off, what looking found, and which named imperfections were accepted and why. The live list is [Open](#open) at the top.

- [x] `items-ch02` read `objectives.js` while `fix-ch02` was editing it. Ids were pinned in both briefs; confirm with

      `npm run check` that every item still names a live objective, and that items written against `dna-vs-rna` and

      `isomers` match what the chapter now teaches.

- [x] (with `type-greek-equation`) `fix-ch02` leaves the chapter's only inline `style=` in place, on the carbonic-acid equation. A displayed equation

      wants a class and a place on the baseline grid. Route to whoever owns `components.css` after `design-pass` lands.

- [x] (chapter 2 half, 2026-09-16) `one-element-table`: `lib/chem-atoms.js` keeps the one element table (now with `label` tokens and K, Ca, Mg with sourced radii); `lib/mol-draw.js` derives its CSS from it and re-exports the one `mulberry32`; no figure import changed; every CSS string byte-identical; `test/element-table.test.js` proved red four ways. Chapter 3's organelle pair is with `one-organelle-table`, with the test recipe the worker left. Found and not fixed: `mulberry32` is defined six times under `src/figures/` (pond, pasteur, cell-common, cell3-draw, three-common, and the one true copy); `bondlab.js` carries its own token→CSS map; Cl's covalent radius was 99 in one table and 102 in the other, kept at 99 which `bondlab` reports.

- [x] `figs-ch03a` handed off 2026-09-15: microscopes, surface-volume, prokaryote, secretion finished, 31 drive steps, 8 narrow frames, 16 matrix frames, recipes in `tools/drive.js` before `cell3d:`. `secretion` rewritten (it had been half empty from default paragraph margins, with pill modifications and 8 px labels). Three `describe()` fields added for the recipes: `clockSeconds`, `cargo`, `membraneFaces`. Its four named imperfections, judged by the coordinator from the worker's kept frames (`scratchpad/drive4`, `matrix2`), 2026-09-15: **secretion wide**, the ~30 px cytoplasm bands above and below the route read as the cell's interior continuing, not as slack — accepted. **secretion at 390 px**, the nucleus at ~65 px and labels at ~7 CSS px, which is ~21 device px on a 3× phone, above the nine-pixel floor — accepted. **prokaryote lysed**, the burst cell filling its pane is the frame's argument — accepted; the envelope paragraph still describes the intact wall while the state line above it says the wall is gone, which is a description of the type rather than the state and is left. **surface-volume above ~50 µm**, microvilli below a pixel at a millimetre is physically true and the numbers change, which is the lesson — accepted. None carried as a defect.

- [x] (2026-09-16) `biology/index.html`: chapters 2 and 3 marked Read with links and one-line deks, once `npm run check` passed all ten pages. Their own commits were made impossible by `6d854cf`; they land in the next commit together.

- [x] (2026-09-16) `items-ch03` handed off: 105 items, 45 mcq / 29 task / 31 free, every objective in two formats; all 29 task expectations verified three ways against the running figures (false at mount, false after three idle seconds so no figure's own clock can satisfy one, true after the real controls), through the grader's own parser; fourteen phone-width end states inspected and four goals reworded to the short labels a phone shows. The corrected chapter-3 claims are load-bearing in items, not avoided. Chapter 3's `tb-source` added to `today/index.html` by the coordinator. Figure-side defects it saw, queued for `ch3-phone-fixes` once the organelle-table worker is out of those files: `secretion` stage 7 reads "In the outside the cell."; `prokaryote` at 390 px overprints the archaeal envelope strip's three labels; `cilium` at 390 px clips its section chip at the stage's right edge and its "Sliding, not bending" card overlaps the toolbar; `surface-volume`'s phone labels ("Villi", "Rod", "Disc", "Clock") differ from the goals' desktop names.

- [x] (2026-09-16) `integration-fixes`: joiners in the polymer button label (visible text only; the aria-label carries none, so the recipe's regex stands) and in chapter 2's item 1337; chapter 3's four `µm⁻¹` cells as `µm<sup>−1</sup>`; `tools/inspect.js` flattens the book-qualified id's slash to a hyphen; `STIX+Two+Math` removed from the seven heads and both stacks. Found and not fixed: the same mixed-face superscript in nine item texts (chapter 3's `items.js` 216, 234, 245; chapter 2's 221, 225, 247, 843, 987, 1007), where `<sup>` markup works because the study page keeps `SUB`/`SUP` — queued for `ch3-phone-fixes`; `docs/design/textbook.md` still named STIX Two Math for relations, corrected by the coordinator.

- [x] (2026-09-16, `type-verify`; handoff in [reviews/2026-09-16-type-verify-handoff.md](reviews/2026-09-16-type-verify-handoff.md)) Greek and ⇌ now drawn by Libertinus Serif, chosen by measuring thirteen faces against Newsreader's x-height and stroke; a page-wide census finds no system-font glyph on any biology page; +43 KB on a chapter with Greek. The design-of-record change is in the focused re-review's scope. Four loose ends with `integration-fixes`. Greek letters (α, β, µ vs μ, Δ) and ⇌ fall out of Newsreader into a substitute face; found by `fix-ch02` in §2.7. With `type-greek-equation`, which also has the "β-" line-break hazard `fix-ch03` found and patched with word joiners.

- [x] §3.5's key idea reworded to the corrected argument: now ends on "an organelle no cell can build from scratch" in place of fission.

- Handoffs with sources: [reviews/2026-09-15-fix-ch02-handoff.md](reviews/2026-09-15-fix-ch02-handoff.md), [reviews/2026-09-15-fix-ch03-handoff.md](reviews/2026-09-15-fix-ch03-handoff.md).

- [x] `tools/inspect.js` handed back stale frames. Fixed 2026-09-15: directory emptied per run, `--label` for a kept second run, selector in the filename, exit 2 when nothing matched. Two neighbours it looked at: `npm run figure` never clears `out/lab/`, a weaker form (same question always overwrites; a different question's old frame can sit beside it) whose honest fix is a per-kind directory and dropping `--out`, a design change deferred; `npm run perf` hardcodes chapter 1 while three chapters exist.

- [x] `tools/sitting.js` hardened and proved red four ways (translated word, moved class, no labels rendered, no word span); HEAD's gate passed all of them, measured. Two bounds it still has, recorded in its proof: labels collapsed behind "and N more" are not in the DOM, and the word is matched whole.

- [x] (resolved: `fix-ch02` confirmed all three passages unchanged on its second pass; no items to re-check) **Re-check three chapter-2 items** whose quoted prose was rewritten under the item worker while it wrote: the CO2 "barely interacts" distractor, the buffers explanation, and `i-denaturation-3`'s rubric. `fix-ch02` was still editing that prose afterwards, so they may have moved twice.

- [x] `figs-ch03b-finish` handed off 2026-09-16: symbiont, cytoskeleton, cilium, plantcell3d finished; 38 drive steps, 8 narrow frames, 15 sweep frames, 15 matrix frames, all looked at. On arrival all four **passed every gate**, and looking found seven defects in plantcell3d alone (the comparison table drawn over the animal cell it described; the two animal-only structures never labelled; "follow a plasmodesma" labelling a channel 11 µm off the stage; translucent shells drawing bands through the channel; a card that could not be dismissed and ran under the toolbar on a phone; a slider label wrapping the toolbar over the nucleus labels; a translucent-box readout). Each recipe now demands the thing that was missing. `turgorState` replaces the brief's `state`. Its three named imperfections, judged by the coordinator from the worker's kept frames (`scratchpad/drive1`), 2026-09-16: the sweep's along-the-axis views clipping the cell's ends behind the toolbar is the sweep instrument's own framing distance, not a reader's view — accepted; the symbiont membrane tag sitting close above "Mitochondrion" does not touch it in the two-tested frame — accepted; the cilium's basal-body caption reaching nearly to the stage edge stays inside it — accepted. Frames looked at: plantcell3d compare and follow, cilium beat and at rest, symbiont with two observations tested. None carried as a defect.

- [x] `polish-ch02-final-2` handed off 2026-09-16: all eight looked at narrow at 3× in both themes. Three touched — soup's narrow key band clipped (half-molecules had poked over the rule), waterprops' heat label kept clear of its own line in the close case and its freezing preview drawn to −10 °C so the branch no longer ends mid-air, phlab's tight-pane inset given a 28 px gap with the arrow stacked. water3d's pill and waterprops' label collision had already been fixed by the killed worker. Pre-existing and left: the teal focus ring on soup's canvas after a mouse click; water3d's two interstitial molecules fading to dark brown on dark paper.

## Notes as they accumulate

- The `drive` gate fails on any registered kind without a recipe, so a chapter's figures cannot land before their recipes do. Writing the recipe from the figure brief, before the figure exists, is the cheaper order.
- Prerequisites reaching back into earlier chapters are what make the study queue work across the book rather than within one chapter. Chapter 2 onward should use them.

## The colour tables, and whether they are the fault (2026-09-16, the legibility round)

**Short answer: the fixed tables are not the fault. The `label` convention is, and it lives in two places that disagree with each other.**

The round was sent to find out whether `ORGANELLES`, `EXTRA_ORGANELLES`, `MEMBRANE` and `BASES` being fixed hexes, against `ink` and `paper` that move with the theme, is a design that invites an unreadable label every time somebody writes on a fill. Every registered figure was rendered in both themes and every glyph measured against the pixels under it (`npm run legible`, and `docs/learning/defect-register.md` has the full census). The evidence says the opposite of what the shape suggests.

**Not one instance came from a fixed fill.** `ORGANELLES` and `EXTRA_ORGANELLES` are used by sixteen figures across two published chapters, and none of the ten defects the census found was ink or paper over one of their values. The reason is in the table beside them: `MEMBRANE` already carries a `label` field naming the one of `paper` and `ink` that holds AA against each fill, and `src/figures/lib/chem-atoms.js` carries the same field for every element. Both were measured. A FIXED fill with a FIXED label is the one combination in this palette that cannot invert: neither value moves, so a ratio measured once stays true in both themes. `gradient-battery` reads them that way — `LIGHT[membranePart('pump').label]`, the light palette's token deliberately, whatever the page's theme.

**Every instance came from a colour that DOES move.** Two shapes, both of them the theme working against itself:

1. **A figure accent spent as type.** `--coral` is a mid red on a light page and a light salmon on a dark one; as 10 px type on the paper it is 3.07–3.32:1 in the light theme and fine in the dark. Six figures did this (`tree`, `scale`, `homeostasis`, `bondlab`, `polymer`, `foldlab`). `src/styles/tokens.css` already says, in its own comment, that the accents are "tuned for figures, where they sit against each other in large areas" and that `--leaf-text`, `--water-text` and `--coral-text` are the values for small text. The fix in every case was to spend the text token. Nothing new was invented.
2. **Ink or paper over an accent fill.** Both ends move, and in the same direction, so no single choice reads in both themes: paper on `--coral` is 3.32:1 light and 7.26:1 dark, ink on the same fill is 4.88:1 light and 1.95:1 dark. Mixing the FILL further towards the paper fixes it (`levels`'s ventricle, 74% coral to 52%), or giving the glyph its own ground with the halo `scale` and `tree` already use.

### The recommendation, with its cost

**Do not give `ORGANELLES` and `EXTRA_ORGANELLES` a theme variant.** It would double a table that nothing has gone wrong in, and it would make an organelle a different colour on a dark page from the one on a light page, which `src/figures/lib/cell3-colours.js` already argues against in its own header.

**Do give them the `label` field `MEMBRANE` has**, and state the rule the two existing tables only imply: *a colour a symbol is written on carries the token to write it in, and that token is read from the LIGHT palette, because the fill does not move either.* Today a figure writing on `ORGANELLE_BY_ID.golgi.color` has to work the pair out for itself, and six of them tried and got it wrong somewhere else in the same file. Cost: fifteen entries in `ORGANELLES` and twenty-one in `EXTRA_ORGANELLES`, each measured against `LIGHT.paper` and `LIGHT.ink` — about an hour, and a unit test in the shape of the one that already holds `MEMBRANE`'s labels. It changes no pixel.

**The one element table needs a decision, and it is the only live thing this round could not close.** `src/figures/lib/chem-atoms.js` sets `label: 'paper'` for every coloured disc. Measured against the palette's own values, in the LIGHT theme:

| disc | paper on it, light | paper on it, dark |
|---|---|---|
| `violet` (P) | 6.04 | 6.18 |
| `inkSoft` (C) | 6.86 | 6.67 |
| `leaf` (the ions) | 4.71 | 7.05 |
| `water` (N) | **4.33** | 7.58 |
| `coral` (O) | **3.32** | 7.26 |
| `gold` (S) | **2.26** | 9.80 |

Three of the six fail AA in the light theme, and the gold is the worst pair either book holds. It is live on published chapter 2 — `bondlab`, `phlab` and `polymer` each draw an oxygen's O in paper on coral — and `npm run legible` carries four `ALLOWED` entries for it, each with its measured ratio and a floor, so a pair that gets worse still fails. **That table is a contract across chapters 2 and 4 and chapter 4's eight figures are being written against it right now, so this round did not touch it.**

The fix that costs no new hue, if the answer is to fix it: push each disc towards the ink for the three that fail, the way `foldlab`'s residue classes were pushed in this round — `tint(C.gold, 55, C.ink)`, `tint(C.water, 86, C.ink)` and `tint(C.coral, 70, C.ink)`, which are `--water-text` and `--coral-text` exactly and a gold in the same family. Measured: paper on them is 5.25, 5.30 and 5.34 in the light theme and 11.54, 8.31 and 8.84 in the dark. Cost: every atom of oxygen, nitrogen and sulfur in the book gets a deeper disc, `test/chem-table.test.js`'s colour assertions move, and the four `ALLOWED` entries come out. The alternative — leaving it — means the book ships three symbols under AA on every molecule it draws, in the theme most readers use.

### One thing to fix that is not about colour at all

`levels` asked for a colour on nine of its labels with a `fill` PRESENTATION ATTRIBUTE, and a CSS rule beats a presentation attribute, so `.tb-levels svg text { fill: var(--ink) }` and `.tb-levels .lv-note { fill: var(--ink-soft) }` won every time. Three of those labels were live defects and are fixed; the other six (`8 protons` in coral, `8 electrons` in water, `arteries`, `veins`) still render in the soft ink and still PASS, so the gate cannot see them and this round left them alone rather than change how a published figure looks on its own judgement. They are listed here because the author's intent is in the file and is not on the page.

## The live state as it stood from 2026-09-16, superseded 2026-09-23

This was the top of this file from 2026-09-16 until the owner's scope decision of 2026-09-23 replaced it. It is moved here unchanged, apart from three parts: its opening sentence on what counts as live, which the new section restates; its `### Open` heading, which the new section now carries; and its chapter table, which the one at the top replaces. `git show f7cb330:docs/work/2_rest-of-the-book/plan.md` has all three as they were. Its items were not re-checked one by one when it was replaced: `5e9c981` and later commits closed several, and some may still be open.

Main already carries this round, green or not: the second book's session committed and pushed the whole working tree three times (`6d854cf`, `e6daf7a`, `0482dde`), so every commit after that is an ordinary one. Chapters 2 and 3 are written, figured and banked, and the `biology/index.html` flip that marks them Read sits in the working tree for the next commit. Chapter 4's prose, objectives and eight figure modules are on disk and its item bank is not, which is what `npm run check` is red on. The last full chain ran on `f5bd0e9` — [timed below](#the-full-chain-timed-2026-09-16-on-f5bd0e9) — with three failures from one defect. Six gates reached main before their red proofs; [five have since been proved and the sixth honestly refused](#the-six-proofs-2026-09-16--five-red-one-honestly-refused).

**Candidate gate, awaiting one worker's judgement: a static check for use-before-declaration across
`src/figures/**`.** A `const` declared below a guard that reads it is not defended by `if (x)` — the reference
throws rather than evaluating falsy, so the guard reads as handled and is a landmine. Found in `enzyme-kinetics.js`
(one live, two latent: `presetCtl`, `inhibitorCtl`). The class is invisible to everything the repo runs: `node
--check` sees only syntax, and a page gate reaches the path only if it runs on load. 44 modules, ~35,000 lines, and
a throw during mount puts an error box where a figure should be. Cheap as a unit test, no browser.


**The bench's round two, specified by its first real user. Dispatch the moment `figs-ch05b` releases
`src/figures/lib/bench.js`.** Four chapter-5 figures were built on it and its author ranked what it lacks:

1. **A stepper and a segmented control — "worth more than every other extension combined."** The bench offers only
   `slider` and `button`, so five sliders take five rows of a 390 px toolbar and eleven buttons take five more. That
   is what costs `free-energy` and `activation-barrier` most of their stage on a phone, and `FIGURES.md` asks for
   steppers by name for 5.1 and 5.2.
2. **`readout().note()` does not wrap.** One `<text>` element, so a sentence longer than the column runs off the
   stage. All four figures carry an identical ten-line `noteLines()` helper. The bench already knows the column width.
3. **No disclosure control.** §5.6 needs one, so the figure sets `slider.node.style.display` directly — reaching into
   the bench's own DOM, which is exactly what it exists to prevent.
4. **`narrowUnit` is unreachable from a slider that uses `format`**, so a computed value cannot drop its unit at
   narrow. Worked around by reading `b.narrow` inside `format`, which then needs a `lastNarrow` flag in `onDraw`
   because there is no layout hook. A `b.onLayout(fn)` removes both workarounds.
5. **Table fitting is left to the figure**, and the build-measure-rebuild loop is written four times.
6. `b.choice` has no unselected state; a `b.action` toggle's `aria-pressed` is the figure's to maintain.

**Also for chapter 5's prose owner**, a knowing departure the figure author declared: `enzyme-kinetics` models the
temperature factor as **reversible**, where §5.6 says the fall past the optimum is largely irreversible. It is
reversible so the slider can be swept both ways, which is the only way to see the curve's shape, and that shape is
the figure's subject; §5.5 models the loss one-way. Stated in the module header. Either the prose gains a clause or
the figure gains a note.


**Next, once `gate-speed` releases `tools/legible.js`: the legibility gate is blind to any figure drawn in
gradients, and that is its largest bound.** Measured 2026-09-17 on `bondlab`: of its 48 `.bl-sym` glyph runs, **44
were skipped as "varied ground", 4 were measured, all 4 failed, and 0 were exempt by size.** The gate reported "1
problem" for a figure in which *every* element symbol was below the bar. The cause is `sphere()` — bondlab draws its
atoms as radial gradients, and the gate requires a clean surface under at least 40 % of a glyph's core pixels, which
a gradient never provides.

My own hypothesis, that the large-text exemption was hiding them, was **wrong**; the count disproved it. The
exemption is real elsewhere (`carbonkit` 61 of 646, `foldlab` 22 of 545) and is worth printing, but it was not what
hid `bondlab`.

The fix is available and the gate already has what it needs: it renders a transparent-glyph frame, so it holds the
actual surface pixels under every glyph. Judging worst-case contrast against the extreme pixel in the glyph's
footprint, rather than requiring a uniform surface, would cover gradients, photographs and any textured ground.
Until then, every gradient-drawn figure in the book is unchecked and the gate says so only as a skip count.


**Next, the moment `gate-speed` releases the browser gates: remove the 240 ms `transition` and the
`backdrop-filter: blur(8px)` from `.fig-btn` in `src/styles/components.css`.** `bench-build` measured both as the
sole reason figure screenshots are not reproducible — six identical runs of one `phlab` drive step gave four
distinct PNGs mid-transition, and eight fresh page loads gave two distinct PNGs from the blur alone. Removing them
takes `tools/figure-diff.js`'s mask to about zero and makes every figure gate's frames comparable, which is what
would let any gate here detect a visual regression for the first time. It is a visible change to 36 accepted
figures, so it needs a person to look at a sample in both themes. Held only for the gate contention.


**Chapter 5 written 2026-09-16** (`biology/ch05-energy-and-metabolism/`, 39 objectives, 46 glossary entries, eight
figure briefs). **33 prerequisite edges reach back** — 6 to chapter 1, 12 to chapter 2, 3 to chapter 3, 6 to chapter
4 — against chapter 3's original zero. Its author caught seven errors in its own draft, including a check question
that stated a free-energy change and an equilibrium constant its own chapter's arithmetic falsifies, and cut one
prerequisite for pointing downstream. Needs: eight kinds registered, palette additions (it asks for six and names
which to cut first), figures, item bank.

Two things it found: creating its directory turned chapter 4's closing card red, which is the card rule catching a
defect the moment it became one — with `ch04-defects`. And Δ (U+0394) is a new symbol on its page, added to the
`text=` subset, but whether Noto Sans Math carries it is a question only the font census answers and that has not
been re-run.

Also confirmed obsolete: chapter 4's instruction to add a `FIGURES.md` line to `tools/pages-exclude.txt`. The list
holds `**/*.md` and `node tools/pages-exclude.js` already prints chapter 5's brief.


The round's live checklist. Items closed this round keep their evidence and have moved to [Closed at integration](#closed-at-integration-this-round) at the end of the narrative.

Two couplings cannot be messaged to a running worker in this build, so they are checked here instead:

- [ ] `water3d`'s drive step `pull-a-neighbour-until-it-snaps` went red once (`2 -> 3`) on a run that touched none of its code: it reads a clock-driven count twice on the unpinned clock. With `one-organelle-table`.

- [ ] Four element-colour tables to reconcile to one, with a test: `lib/chem-atoms.js` (soup, bondlab, water3d, waterprops), `lib/mol-draw.js` (phlab, carbonkit, polymer, foldlab), `lib/cell-colours.js` (prokaryote), `lib/cell3-colours.js` (symbiont, cytoskeleton, cilium). Confirmed by both chapter-3 figure workers; each used what its modules import and merged nothing, as briefed.

- [ ] Respawned 2026-09-16 against main after the session-limit kill: `figs-ch03b-finish` (plantcell3d's compare view; verify the other three), `polish-ch02-final-2` (the two open desktop defects; all eight at phone width), `type-verify` (the STIX/Noto Math change was implemented but its glyph readback, byte cost and gates never ran), `items-ch03` (no bank had been written).

- [ ] Move the two red proofs in [reviews/2026-09-16-publish-and-fonts-handoff.md](reviews/2026-09-16-publish-and-fonts-handoff.md) into `docs/learning/gate-proofs.md` once `six-proofs` has landed; they were held out to avoid clobbering it.

- [ ] At integration: add chapter 3's `tb-source` to `today/index.html` (`npm run check` prints the exact element); commit `AGENTS.md` by pathspec for the canon block; run the full chain once.

- [ ] Shared `out/` directories: one worker's gate run empties another's frames mid-read (`figs-ch03a` lost drive and narrow frames twice to `polish-ch02-final`). Workers keep copies in the scratchpad. A per-run directory would fix it and `fix-inspect` argued against it for the instrument; for the gates it is an open question.

- [ ] Chapter 3's item bank: `items-ch03` dispatched 2026-09-15 with objectives final and seven of eight figures on disk; mcq and free first, task items last, every expectation re-run through the grader against the live figure before handoff; `plantcell3d` tasks marked unverified if it has not landed.

- [ ] `symbiont.js` line 89 repeats the false mitochondrial-machinery claim the prose has dropped. Sent to `figs-ch03b`.

- [ ] `gate-expects`'s new rule rejects `2e-7` in chapter 1's `i-resolution-limits-2`. Sent back to it: settle with the grader which side is wrong; if the grader rejects it too, chapter 1 has carried an ungradeable item since it was written.

- [ ] Open observation, two workers now: at pinned `t=0`, PNGs of frames holding a 3D or animated figure differ by a few bytes between runs while pure-SVG frames are byte-identical, and the chapter-2 figure worker showed the SVG markup itself is identical across sessions. Rasteriser or encoder variance rather than figure state, on the evidence so far. Nothing chases it until a gate needs pixel identity.

- [ ] Ignored scratch under `out/` from 10 September (about twenty probe directories, hand-redirected logs) is stale evidence no task needs; delete at the commit, per canon.

- [ ] Bilingual stage 0 (`data-action` on driven controls, `tools/drive.js` and `tools/flow.js` off English labels) once the figure workers have handed off.

- [ ] Chapter 2's item bank names four weak spots its author could not fix from inside: `i-water-solvent-2` grades on half its question; two `soup`/`waterprops` tasks become true on their own as the clock runs, so only the `panel ===` clause proves the reader acted; and `i-molecular-scale-3` asks a phone reader to read a card the narrow `soup` layout does not draw. Decide each. **Decided 2026-09-16:** soup's `narrowAspect` goes from 4/3 to 4/5 in the registry, on the polish worker's probe (protein mid-field, key on one line, the card the question needs); the other three stay as the item author wrote them.

- [ ] `design-pass` left the devlog and defect-register entries to the coordinator deliberately, to avoid clobbering shared newest-first files while four workers were active. Both written 2026-09-11. Its own caution stands: two `devices` failures it saw did not reproduce, because `tools/devices.js` was being rewritten underneath the run.

- [ ] Next-chapter cards, which `npm run check` passes because `../` resolves and the recipe requires the next chapter's directory: **chapter 3's is due now** — it still points at `../` and `biology/ch04-membranes-and-transport/` exists, so repoint it to `../ch04-membranes-and-transport/` when chapter 4 is integrated; **chapter 4's points at `../`** and names chapter 5 in its text, so repoint it to `../ch05-.../` the day chapter 5's directory lands. Chapters 1 and 2 went six days with a card that said the next chapter did not exist.

## Outcome

In progress.
