# The site said one chapter, and CI could not finish, 2026-09-23

One worker on branch `site-and-ci`, off `main` at `f7cb330`. Two defects from the project audit: the library page and `README.md` said only chapter 1 was ready with five published, and `ci.yml` could not pass as configured.

## The rule that reads the tree for which chapters can be read

`checkChapterAvailability` in `tools/check-content.js` has two halves. The contents half holds each book's `index.html` to its `chNN-` directories. The prose half reads the library page's shelf cards and `README.md` for sentences naming ready chapters, counts, and "N more are outlined". The texts now name no chapter, so the prose half passes them because they claim nothing, and it stays in place to fail a claim written back in. The proof is in `docs/learning/gate-proofs.md` and the defect in `docs/learning/defect-register.md`.

Three things went wrong while writing it, and a later change to it could trip over each:

- **Adjacent blocks ran together.** `textOf` joins text nodes with nothing between them, so a card's `<h2>The Living World</h2><p>Five of its 32…` read as "WorldFive". "Five" then had no word boundary, and the parser matched "32 chapters are written" instead. The real page has newlines between its elements and would have passed with the bug; a fixture written on one line caught it. `proseOf` now puts a space around each block element.
- **The first historical run failed the second book for its script.** At `6d854cf`, `tongjian/index.html` printed `可讀` and `未寫` under `lang="zh-Hans"`, and the rule, knowing only the Simplified words, failed it six times. The script has its own gate (`test/lexicon.test.js`), so the tag words are now accepted in both scripts, as `FIGURE_TOKENS` already does for 图 and 圖.
- **A sentence naming chapters is read as the whole list.** "Chapter 5, the newest, is ready" fails although it is true. That is on purpose, since all five defects in this class were partial lists; reword such a sentence rather than widen the parser.

## CI: three engines and 180 minutes, unverified until main runs it

`ci.yml` installed only chromium, and `tools/devices.js` launches WebKit and Firefox with no fallback. It now installs all three. The 30-minute limit could never be met, because unit, check, shot, flow and drive alone used 16 minutes on the runner (run `35902188268`). The new limit is 180, with the estimate behind it written in the workflow. A step now prints the runner's CPU count and memory, because the log did not say either.

- **A YAML error was caught before it shipped.** The first version of that step was `- run: echo "runner: $(nproc) …"`. That is a plain scalar holding `: `, which YAML reads as a mapping. Parsed locally, it failed with `mapping values are not allowed here`. On main it would have made the whole workflow invalid, so no run would have started at all and nothing would have been red to read. It is a block scalar now.
- **What else assumes the local machine.** `pinned` starts eight shards by default. Its window counts animation frames, so its verdict holds on fewer cores, but its per-press timeouts are 5 s of wall clock (`b.click({ timeout: 5_000 })` and the `focus` calls). A press that misses its timeout is skipped, not failed, so on an oversubscribed runner the tell is a lower press or key count in its totals, not a red step. The network is needed (Google Fonts and jsdelivr) and GitHub's runners have it. Nothing else found is specific to Windows or to this machine.
- **What the first run on main will probably show.** The last two runs went red in `drive` at `bilayer hot-enough-and-nothing-assembles` (`micelle at t=8.033, 0.641 buried`), which passes locally. `tools/test.js` stops at the first red step. So until that is fixed, no run reaches `devices`, where the engines matter, or runs long enough to test the timeout. The first run shows that the three-engine install works and how big the runner is. It does not show that the chain fits.
