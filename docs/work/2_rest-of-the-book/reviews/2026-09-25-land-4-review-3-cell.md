# land-4 review 3: Figures 3.2 and 3.3 in every box

Reviewer: independent and read-only. Date: 2026-09-25.

Revision reviewed: 1824eea on origin/land-4. Its parent is 97f1694. It changes only `src/figures/prokaryote.js` and `src/figures/surface-volume.js`.

Numbering: the brief calls prokaryote 3.2 and surface-volume 3.3. On the page and in the commit, surface-volume is Figure 3.2 and prokaryote is Figure 3.3. This review uses the page's numbers.

## Verdict

- I found no regression. Every land-4 claim I could test holds.
- There are no blockers and no should-fix findings. There are two notes, and both come from before this change.
- All six residuals were there at 97f1694, and none is worse. Residual 4 covers more than it says: the flagellum's hit is off the canvas as well as the archaellum's.
- Part B was not reviewed, because origin/land-4 was still at 1824eea.

## How it was checked

- The worktree was `C:/Users/38909/Documents/worktrees/textbook-review-cell`, detached at 1824eea, with its own `npm ci`. It has since been removed.
- A scratch probe stood in for `npm run shot` and `npm run narrow`, limited to chapter 3's two figures.
  - It loads `biology/ch03?eager=1` through the repo's `launch({ gpu: true })`, one browser at a time.
  - The "old" runs serve 97f1694's two modules in place of 1824eea's.
- The probe records:
  - text over text, controls over controls, and text over controls;
  - text or controls outside the stage;
  - the canvas's backing store against its own box;
  - 3.3's hit spots, read through one added line, `window.__pkHits = () => hits;`;
  - a real mouse click at every hit spot, read back through `describe().selected`.
- Widths: 360, 390, 600, 768, 800, 860, 960, 1024, 1150 and 1440 in light, and 800 in dark.
- States:
  - 3.3: Archaea, gram-negative, dilute, salty, swollen (penicillin, growing, dilute), the gram stain, the thinned wall (penicillin, growing) and swimming.
  - 3.2: the diffusion clock on the long cylinder.
- I looked at the frames at their real size, and at enlarged crops where labels meet the drawing.
- Limits of this check:
  - DPR 1 and Chromium only.
  - The swimming frames are samples of the swing, not the whole swing.
  - At 768 the figure is taller than the 900 px page, so the screenshot loses about 55 px of the stage's top. The DOM audit still covers that strip.

## land-4's claims

| Claim | Result |
|---|---|
| Both figures draw their cell in every box | Holds. At 97f1694 the canvas collapsed in the 800–1024 boxes. At 800 it was 439.6×0 CSS px for 3.2 and 439.6×27.5 for 3.3, with every 3.3 hit spot above the canvas. At 1024 it was 615.6×73.5 and 615.6×135.5. At 1824eea every width draws the cell (table below). |
| The panel sits beside the drawing in the wide box | Holds. 3.3 is flat from 800 to 1150, and 3.2 from 800 to 1024. |
| A tighter version at 800 to about 855 px | Holds. At 800 the stages are 270 px tall (3.2) and 300 px (3.3), under the tight limits of 300 and 336. At 860 they are 304 and 338, over the limits. At 800, 3.2 drops its working lines and 3.3 drops the fate's rule and heading. |
| The canvas is sized from its own box, so text is full size | Holds. The backing store equals the canvas box at all ten widths, and in dark. At 97f1694 it never did: 390×212 for a 351.6×199.3 box at 390, and 667×562 for 647.6×530 at 1440. The old drawing was shrunk by 3–10 %, by different amounts across and down. |
| Clicks land where aimed | Holds. I held the cell still (flagella off, `?t=0`) and clicked the centre of every hit spot with the real mouse. 59 of 60 clicks picked their own part at the ten widths, and 14 of 14 did in the archaeal state at 390 and 1024. The 60th is a tie at 800: the membrane's centre is 1 px from the wall's, both have a 7 px radius, and the rounded click picked the wall. 97f1694 had the same pair 1 px apart at 1024, and nothing could be clicked at 800. The hit circles now sit on the drawn parts. At 97f1694 they were off by the shrink factor; at 390 the cytoplasm's circle sat on the end of the wall. |
| 3.3 switches to the wide layout only at 540 px of stage height, which fixes the 1150 cut-off | Holds. At 1150 (782×489) 3.3 is now flat, with the extra lines of the roomy version. At 97f1694 five text runs of the fate and swimming lines fell outside the stage. Now none do. |
| The Archaea labels at 390 | Fixed. "S-layer 10 nm" and "Ether-linked 7 nm" stand apart. |
| The gram-negative fringe | Fixed. The LPS fringe is drawn. "Outer 7 nm", "Peptidoglycan 3 nm" and "Plasma 7 nm" stand apart at 390. |
| The water arrows | Fixed. At 390 the dilute arrows are outside the cell and point in; the salty arrows point out. "water in" and "water out" sit just above the wall, not over the cell. |
| The swollen cell | Fixed. At 390 and 800 the swollen cell and its burst outline fit the canvas. At 97f1694, at 390, the cell ran off the top of the canvas and the arrows were drawn through it. |
| The swimming cell | In the wide layout the swing is the same by construction. There `vertical` is true, so `room` is `Infinity` (prokaryote.js:1208) and the offset reduces to the old `swimX * scale * 0.2`. The flat layouts limit the swing to the room there is. |
| Figure contract | Holds for this change. The diff adds no `Math.random`, `Date.now`, `performance.now` or hex colour of its own. No new radius can go negative. `describe()` reports no field the frame owns. The layout reads only the root's box. |
| Scale ≥ 0 clamps (131e49b, 6e12dbc) | Still there, at prokaryote.js:1198 and surface-volume.js:437. |

A side fix the commit does not claim: under penicillin at 1440, 97f1694 labelled the strip "Peptidoglycan 0500000000018 nm", an unrounded number cut off at the canvas edge. 1824eea prints "10 nm" (`nmText`).

The DOM audit at 1824eea found no text over text, no overlapping controls, no text over controls, and no text or control outside the stage. That holds in every run: the ten widths, 800 in dark, and every state above.

Both revisions have the same count of 9 to 9.5 px DOM labels: 11–12 in 3.2 and 3–5 in 3.3.

The canvas box at 1824eea, in CSS px, with the stage in brackets:

| Window | 3.2 | 3.3 |
|---|---|---|
| 360 | 322×145 (360×450) | 322×162 (360×450) |
| 390 | 352×183 (390×488) | 352×199 (390×488) |
| 600 | 562×457 (600×750) | 562×475 (600×750) |
| 768 | 374×820 (768×960) | 495×872 (768×960) |
| 800 | 213×132 (480×270) | 220×227 (480×300) |
| 860 | 243×164 (540×304) | 275×264 (540×338) |
| 960 | 293×220 (640×360) | 331×327 (640×400) |
| 1024 | 301×229 (656×369) | 340×337 (656×410) |
| 1150 | 380×300 (782×440) | 454×416 (782×489) |
| 1440 | 488×416 (989×556) | 648×530 (989×618) |

## The six residuals

| # | Residual | Already there at 97f1694? | Worse at 1824eea? |
|---|---|---|---|
| 1 | The small cell in the 700–799 px layout | Yes. At 768 both figures use the wide layout in a tall 768×960 box, with the cell in the middle of a tall canvas. | No. 3.3's nucleoid hit radius is 17 CSS px, against 18 backing px (17.3 CSS px) before. 3.2 looks the same. |
| 2 | The swimming cell passes under the strip labels at 1440 | Yes. In 2 of 10 old frames the cell's end runs under both "Peptidoglycan 30 nm" and "Plasma membrane 7 nm". | No. The swing is the same by construction. In the new frames the cell's end reached only the "P" of "Peptidoglycan". Both revisions do this at 768 too. |
| 3 | "Peptidoglycan 30 nm" while the strip draws the wall thinner | Yes. Under penicillin plus growing, the strip draws and labels 10 nm. The panel's layers line (`.pk-layers`) still says 30 nm, and `describe().peptidoglycanNm` still reports 30. | No. At 1150 the line now shows in the roomy flat layout; before, it showed there in the wide layout, so it appears at the same widths. Because the strip now reads "10 nm" instead of the garbled number, the mismatch is easier to see. |
| 4 | The archaellum's hit spot is off the canvas from 390 up | Yes. At 97f1694 the archaellum's centre was at x −74 (radius 21) at 390 and −276 (radius 45) at 600, and the flagellum's was at −217 (radius 34) at 1440. | No. At 1824eea it is between −68 and −20 at 390, −207 at 600, −120 at 1024 and −199 at 1440. No circle reaches the canvas, so the appendage cannot be picked from 390 up. At 360 it is on the canvas. The same line (prokaryote.js:944) places the flagellum's hit spot, so the flagellum cannot be picked either. |
| 5 | The stain message covers the cell on phones | Yes. | No. At 360, about 20 px of the cell shows under "The alcohol wash…" in both revisions. At 390, the lower two-thirds of the cell shows in both. |
| 6 | No gate covers the flat layouts | Yes. No gate looked at the 800–1150 boxes, which is how the collapsed canvas shipped. | No change. It stays open, as the owner said no new gates. `npm run shot` photographs the flat layouts at 1024 but checks nothing about them. |

## Findings

### N1 (note, from before 1824eea): Figure 3.3 keeps swimming with the clock pinned once it scrolls into view

- **Measured:** with `?t=0` at 1024, the nucleoid's hit x read 188.6, 199.3, 189.5 and 200.9 over 1.5 s at 1824eea. At 97f1694 it read 334.2, 354, 335.8 and 356.9.
- **Likely cause:**
  - The frame calls `setVisible` from its IntersectionObserver (figure.js:171), which can happen after `setTime`.
  - `setVisible(true)` (prokaryote.js:1424) calls `schedule()`.
  - `schedule()` (prokaryote.js:1370–1371) checks `moving()` but not `ctx.pinnedTime`.
- **What it breaks:** the rule "nothing advances on its own while `ctx.pinnedTime` is set".
- **Why no gate reports it:** `tools/pinned.js` has no entry for prokaryote. That fits gate pages that never scroll the figure into view after `setTime`, but I did not check which gates scroll.
- **Effect:** none on readers, who never pin the clock. It does make any probe that scrolls to 3.3 give different results from run to run. That is why this review's clicks were taken with the flagella off.
- **Fix, if wanted:** return early from `schedule()` while `ctx.pinnedTime` is set. I propose no gate.

### N2 (note, from before 1824eea): picking the archaeal quasi-periplasm shows no card

- The click selects `quasi`, and `describe()` reports it, but no `.pk-card` appears.
- Seen at 390 and 1024, in both revisions.
- `quasi` has a layer entry (prokaryote.js:80) but no description of the part.

## Part B

Not reviewed. A `git fetch origin` after Part A showed origin/land-4 still at 1824eea. It had neither the merge of figfix-ch07 300da5f nor that of figfix-ch08 e29f6a0.

For the coordinator, what I saw in land-4's worktree. I did not review any of it.

- The local branch `land-4`, in `C:/Users/38909/Documents/worktrees/textbook-land-4`, is at 1800637.
- It has the two merges: dcf98d2 (300da5f) and c3adde5 (e29f6a0).
- It has efd6c8d, "Figure 8.3: every made-up rule's sentence starts 'Hypothetical'" (S1).
- It has 50c22a0, "Figure 7.3: the charge counts are drawn all together or not at all" (N3).
- It has 1800637, a fix to a chapter 7 check.
- It has an uncommitted edit to `biology/ch07-cellular-respiration/index.html`.
- S2 and N1 have no commit of their own. They may be inside the merge resolutions.

## Evidence

The evidence is in scratch files, not tracked, under `C:/Users/38909/AppData/Local/Temp/claude/C--Users-38909-Documents-github-textbook/e14c6a2a-6594-4fdf-9d15-46032c3e3ea7/scratchpad/review-cell/`:

- `cell.mjs`, the probe;
- `zoom.mjs`, which makes the enlarged crops;
- `run-*.log`;
- `out/` and `outpin/`, the frames and the JSON reports.

They go once this review is closed.
