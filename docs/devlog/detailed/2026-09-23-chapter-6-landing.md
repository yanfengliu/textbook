# Chapter 6 landed, and what only the landing could see, 2026-09-23

One integration worker, branch `land-3` off `main` at `fff1646`, in two phases with the accuracy review's figure pass between them. Phase A merged eight branches in order — `ch04-figs`, `site-and-ci`, `term-markup`, `ch06`, then `fig-pigment`, `fig-zscheme`, `fig-calvin` and `fig-rubisco` — took chapter 6's item bank from `items-ch06` as a file, since that branch also carries chapter 7, and joined the chapter to the contents page, chapter 5's closing card and Today. Phase B applied the review's ten figure findings, ran the full chain once, and pushed `land-3` to `main`. What follows is what a later landing could trip over.

## Two defects only the combined tree had

`SHOT_PAGES=biology/ch06 npm run shot` went red at all six loads on the merged tree, for two reasons that live in different branches and only meet on the page.

- **The glossary's term column was a fixed 11.5rem.** That leaves a term 158.4 px after its padding, and chapter 6's "Photophosphorylation" needs 171.1 px, so the text-box check failed it at tablet and desktop in both themes. The same page and stylesheet are on `ch06`, so its own `shot` would have gone red the same way; nobody ran it there. The column is now `minmax(11.5rem, min-content)`: the longest word wins only when it is wider, so chapter 6's column comes to about 197 px and every other chapter's stays exactly as it was. The check itself forbids the other ways out, a smaller size or a word broken mid-way.
- **Figure 6.1 writes a true hyphen, U+2010, on purpose,** because Inter's tabular hyphen-minus is a figure wide and split "yellow-green" in three. The chapter page's font subset (`text=` in its second Google Fonts link) did not list it, so Segoe UI Semibold drew it — a face the page never loaded. It was found only because the census counts figure text too, and only on the chapter page. The lab page's link still lacks U+2010, and λ, Ψ and Δ as well, and `npm run shot` never visits the lab.

## The figure workers' red proofs were re-run, not copied

Three figure workers made their gates go red but could not open `docs/learning/gate-proofs.md`. Their handoffs gave the mutations and some numbers; only one left a log, and that log was for a different mutation from the one its handoff described. The rubisco worker's log emptied the list the words are read from, where the handoff said the bare position was put back. So every arm was put back on the landing tree (`633ba26`) through `scratchpad/land-3/prove.mjs`, which changes one exact string that must occur once, runs the gate, keeps its whole output and restores the file's bytes by hash. All nine went red at the steps that name them. For rubisco both forms of the defect were run, and they read `null` and `"12"`/`"20"`. The entries say what each gate still cannot see — the path factor held to a band rather than a constant, a count of enzymes rather than their names, a dark "much slower" rather than a fiftieth, and the rubisco figure's three other ranges asserted nowhere.

## `tools/drive.js`'s count of polls and sleeps could not be reproduced from any commit

The header said "165 polls where they held 8, and 48.9 s of sleep is left over 81 calls". Counted one per call site inside `RECIPES`, `0482dde` (the last commit before that work) holds 0 polls and 168 sleeps, and `5e9c981` (the squashed landing that carried the sentence) holds 292 polls and 68 sleeps. Neither end matches, because the numbers were taken on an uncommitted tree during the 2026-09-17 round and chapters 4 and 5 added recipes before it was committed. The header now keeps them as that round's, beside a count taken at this landing by a stated method: 390 calls to the poll helpers, one retry loop of `cilium`'s own, and 66 sleeps holding 47.0 s. Chapter 6's four recipes added 92 polls and no sleep. The script is `scratchpad/land-3/count-waits.mjs`.

## What `out/drive/`'s frames of Figure 6.2 show

The zscheme readout counts what the drawing has reached, which trails `describe()` by the length of the motion, and `npm run drive` photographs a step the instant it returns. So every zscheme frame in `out/drive/` shows NADPH, oxygen and protons at 0, while the step asserts they moved. That is by design, not a defect, but it means those frames are not the state a reader sees a second later. A settled frame needs a wait on the drawn text. The first probe waited on the stage's `innerText`, and that includes the visually hidden live region, which speaks the model's counts. So it photographed an unsettled readout while reporting it settled. The probe now drops `.tb-live` before it reads.

## The accuracy review's figure pass

Its ten findings, 13 to 22, are applied, one error and nine smaller. The error is Figure 6.3's alt text calling Calvin's carbon-14 experiment "the fourteen-carbon experiment". Three things went a little past the review's own list, each for a reason it gives:

- **Finding 17's names were also on a phone.** At a phone's width the salvage ledger prints each stop's short `brief`, not its `say`, and the fourth stop's `brief` still said "leaving glycerate". The review had looked at the narrow compositions' opening frames only.
- **The zscheme header's claim was false after the merge.** It said §6.4 does not explain the third flash. `ch06` added that clause after the figure branch forked, so the comment now says §6.4 does.
- **The brief repeated the old wordings.** `FIGURES.md` describes the figures as built, and it still gave the old Reset and Flash train wording, and the "barely absorbs at 640 nm" claim, so it follows the stage now.

Finding 15 is a change to what the stage draws, not only to its words. The alga panel is lit only while the slider stands where Measure here lit it, and otherwise says "last lit at … nm". `describe()` does not report that panel and no recipe reads its label, so nothing gates it.

## One environment note

`node --test "test/*.test.js"` ran here, 260 of 260, with no `spawn EPERM`. `docs/policies/local-rules.md` records EPERM as an environment fact on this machine; it did not reproduce on 2026-09-23, so that note may be stale.
