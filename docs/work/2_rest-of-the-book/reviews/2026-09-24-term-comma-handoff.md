# Handoff — a mark after a glossary term stays on the term's line

Worker: `term-comma`, 2026-09-24. Branch `term-comma` at `65b9ea5`, based on `237c96e`, merged into `land-4` as `5294d77`. Copied from the coordinator's scratchpad by `land-4`; everything below this line is the worker's text, unchanged.

The mark after a glossary term now stays on the term's line. I measured 0 stranded marks after the fix, down from 4 at 390 px and 6 more at 320 px. The fix is committed and pushed on its own branch, not merged.

- **Branch:** `term-comma` at `65b9ea560f6d55d47be253c6ae1637e6d295739a`, in `C:/Users/38909/Documents/worktrees/textbook-term-comma`. It is based on 237c96e.
- **Before:** 218 terms in chapters 1–8 are followed directly by a mark (`,` 129, `.` 44, `:` 39, `;` 6).
  - At 390 px, 4 stranded their mark, the same in both themes: ch01 endosymbiosis, ch03 cell wall and gap junctions, ch08 pyrimidine dimer.
  - At 320 px, 6 more stranded: ch02 polymers and monosaccharide, ch03 green fluorescent protein, ch04 electrochemical gradient, ch05 phosphorylation, ch08 proofreading.
  - At some width from 320 to 1440 px, 172 of the 218 stranded.
  - 資治通鑑: 0 stranded.
- **After:** 0 stranded at 390 and 320 px in both themes, and 0 at every width from 320 to 1440 px, in biology ch01–08 and 資治通鑑 ch01–03. Nothing overflows.
  - Compared line by line with main, 0 of 608 term paragraphs that main didn't strand in break differently. Only the 10 that main stranded in changed, and 4 of those are one line longer.
- **Probe:** a scratch script, `strand.mjs`, stands in for `npm run inspect`, which frames named elements but doesn't count what starts a line. `arms.mjs` did the line comparison against main.
- **The fix:**
  - **Wrapper:** `term.js` now wraps each term and the text glued to its end (the mark, or a plural's "s") in a `<tb-term-hold>`, which `components.css` sets to `white-space: nowrap`.
  - **Zero-width space:** a zero-width space after the wrapper, set back to normal wrapping, stops Chromium pushing the pair down a line early.
  - **Wrapping restored:** the button and the popover card set wrapping back to normal.
  - **Unit test:** a new unit test, `test/term-hold.test.js`, covers all this.
- **Checks, all green:** unit 267/267, check (13 pages), flow (42 steps), devices (9 loads, 31 terms pressed on each), shot at phone width (26 loads).

**Why not a CSS-only fix.** The button is laid out as an inline-block, and a line may break after one even when a comma follows. The only thing that reliably stops that break is `nowrap` on an element holding both the term and its mark.
- A word joiner (U+2060) left 180, 180 and 179 stranded in Chromium, WebKit and Firefox.
- `display: contents` removes the box that the gates press and that the focus ring and card need.
- A plain `<span>` wrapper turned "cells," into a block in ch01's list of the properties of life, because ch01 styles those spans as blocks. That is why the wrapper is its own element.
- Plain `nowrap` alone re-broke 2.26% of unaffected paragraphs in Chromium on phones, where paragraphs hyphenate. `<wbr>` re-broke 1.14%, and turning hyphenation off on the wrapper didn't help. The zero-width space brought it to 0.02% in a test layout and 0 on real pages.

**Accessibility.** In Chromium, keyboard use and the popover work (flow, and devices across Chromium, WebKit and Firefox). The accessibility tree is unchanged: the wrapper is ignored, no name contains the zero-width space, and the button keeps its role, name, focus and expanded state.

**Frames I looked at, at native size:**
- 20 crops of the formerly stranded cases at 390 and 320 px, in both themes.
- The shot gate's own phone frames, cropped at each fixed term, in both themes:
  - ch01: endosymbiosis, homeostasis, cells
  - ch03: cell wall, gap junctions, green fluorescent protein
  - ch04: electrochemical gradient
  - ch05: phosphorylation
  - 資治通鑑 ch02: 伯魯 and 無恤
- Flow frame 05 (the glossary popover).

All are correct, and ch01's list of the properties of life lays out normally.

**Also verified:**
- **Unit test goes red when broken:** I broke the fix 12 ways (5 in the stylesheet, 7 in `term.js`) and each one made it fail. It passes 7/7 with the fix restored.
- **Remote CI didn't run:** `ci.yml` only runs on pushes to main and on pull requests.
- **Not run:** the full `npm test`, as you asked, and `npm run audit`, since no dependency changed.

**Open items:**
1. **Remove the junction before `git worktree remove`:** the `node_modules` junction is still in the worktree, pointing at the primary checkout's `node_modules`.
2. **Ragged lines at 320 px:** long terms cause no overflow but leave short lines before them, such as "second was" before "green fluorescent protein," and "is called the" before "electrochemical gradient.". Fixing that would mean a label that isn't a single box, which conflicts with the gates, the focus ring and the card placement. It's your call whether to pursue it.
3. **No gate checks the line layout:** you said no new gates this round, so only the scratch probe measured it. The unit test covers the wrapping and the stylesheet text, not where lines break.
4. **ch07 and ch08 were measured in their own worktrees:** they aren't on main, so I measured them in `textbook-ch07` and `textbook-ch08` at about 09:20, with my two files swapped in. Their text may change before landing, and my gate runs covered main's pages only.
5. **Two side effects on the 資治通鑑 cards:**
   - A card opened inside a `.zj-kn` span now wraps. On main it was set on one line and its gloss was cut off (565 px of text in a 350 px card).
   - Still broken on both main and the branch: the example rows (`.zj-card__ex`) run 8 and 47 px past the card at 390 px.
6. **Literal character in the stylesheet:** the CSS holds the zero-width space as the literal character, not the escape `\200B`. `test/strings.test.js` would read the "B" in the escape as an English word that the Chinese pages must replace. The unit test pins the character, or `strings.test.js` could be taught to decode escapes.
7. **Opening marks aren't handled:** a mark before a term isn't wrapped. Biology has none, and the 9 in 資治通鑑 are already held by the page's own markup and strand 0.
8. **Unclear server error:** `tools/serve.js` returns 403 for everything when given a forward-slash Windows root. The page then times out with "figure states: {}", which doesn't point at the cause.
9. **No independent review ran:** subagents were excluded for this task.

The brief's `SHOT_VIEWPORTS=390` isn't a valid value; `phone` is the 390 px width, so that's what I ran.

**Draft defect-register entry.** Symptom: in a phone frame of §8.5 in chapter 8, the comma after "pyrimidine dimer" began a line on its own. Cause: `<button>` is laid out as an inline-block whatever its `display` says, and a line may break after one. Now checked by the unit test for the wrapping and stylesheet rules, plus a probe measurement at landing. No gate checks the layout, by your decision for this round.

Scratch evidence is in `C:/Users/38909/AppData/Local/Temp/claude/C--Users-38909-Documents-github-textbook/e14c6a2a-6594-4fdf-9d15-46032c3e3ea7/scratchpad/term-comma/`, about 257 MB after I deleted the superseded runs. The main files are `run-final.log`, the `gate-*.log` files, `redproof/redproof.log` and `redproof2.log`, `shots-final/` and `frames/`.