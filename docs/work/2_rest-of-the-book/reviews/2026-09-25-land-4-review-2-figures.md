# Land-4 review 2: the chapter 7 and 8 figures, as they will ship

2026-09-25. An independent, read-only review. It made no commits, pushed nothing, changed no tracked file and did not run `npm test`.

## What was reviewed

- origin/main: 237c96e.
- origin/land-4: 97f1694.
- origin/figfix-ch07: 300da5f. It shares two merge bases with land-4, f1ae404 and 6a30a4c.
- origin/figfix-ch08: e29f6a0. land-4 has merged it up to 0dd22d2.
- Diffs read:
  - f1ae404..300da5f for glycolysis, respiratory-chain, fermentation, the chapter 7 page and its FIGURES.md;
  - 6a30a4c..300da5f for krebs;
  - 0dd22d2..e29f6a0 for the four chapter 8 modules, the chapter 8 page and its FIGURES.md.
  - In all, 2,411 diff lines.
- How the frames were made:
  - From a detached worktree: chapter 7 at 300da5f, chapter 8 at e29f6a0.
  - Served by `tools/serve.js` and driven with Playwright chromium.
  - Each chapter page was loaded with `?eager=1&theme=light`, waiting on `window.__textbook.state === 'ready'`.
  - Windows were 900 px tall at DPR 1, or DPR 2 where noted.
  - States were reached only through the figures' own buttons, with real waits.
- Evidence: frames and logs are under `<scratch>/review-figs/`, where `<scratch>` is `C:/Users/38909/AppData/Local/Temp/claude/C--Users-38909-Documents-github-textbook/e14c6a2a-6594-4fdf-9d15-46032c3e3ea7/scratchpad`.
  - `ch07b/` and `ch08/`: every figure at 800 and 1024 px, plus a text-geometry report.
  - `ch07/`: 7.2 and 7.4 at 390 px.
  - `states/` and `states8/`: driven states, each with a log of every word visible on the stage and `describe()`.

## Verdict

There are no blockers.

- Counts: 3 should-fix and 4 nits.
- All 36 findings from the two figure reviews are fixed in the modules.
- F5's optional origin label was declined, for a sound reason.
- F17 and F23 are fixed in the modules, but the gate their review named was never added (S3).

The new 8.3 sentences are right, and they agree with the table and the drawing in every state I drove.

- The one real defect is at 800 and 860 px windows: a made-up rule is shown with nothing on the stage saying it is hypothetical (S1).
- Merging figfix-ch07 into land-4 stops on a conflict in chapter 5. One way of resolving it would silently undo nine no-break joins (S2).

## Should-fix

### S1. At 800 and 860 px windows, 8.3 marks neither made-up rule as hypothetical

**Where**, all in `src/figures/replication-fork.js` at e29f6a0:
- 1219–1225: the banner. Both the full "HYPOTHETICAL: STRANDS RUN THE SAME WAY" and the flat-stage fallback "HYPOTHETICAL RULE" fail to place in the short fork pane, and nothing else is tried.
- 713–714: the short rule sentences, which the flat table keeps longest, do not say "hypothetical".
- 196–197: the controls' visible labels became "Same way" and "Either end" in efdafc4. Only their accessible names say "a hypothetical rule".
- 706–711: this comment says "The banner across the top of the stage already says the rule is hypothetical". That is untrue here.
- 24–25: the header promises the mark "in a line on the drawing, and in the table".
- `biology/ch08-dna/FIGURES.md:206` says the two rules "are marked as hypothetical wherever they appear".

**Scenario**: at an 800 px window, the reader presses Same way.
- The fork is redrawn with both templates' 5′ ends on the right.
- The sentence reads "At this fork both new strands grow towards it, each from one primer…".
- No visible word on the stage says that this is not how DNA is. Either end is the same.
- The chapter's brief calls antiparallel strands and 3′-only addition the two facts its figures must never contradict (FIGURES.md:104), and they are allowed here only because they carry the mark.
- The caption's "change the rules" and the "As they are" option soften the risk, so this is not a blocker.

**Evidence**: the visible-word dumps count the word "hypothetical".

| Window | Rule | Count | Files |
|---|---|---|---|
| 800 | Same way, with Ligase off | 0 | `states8/rf-800-same-ligase.log`, `states8/rf-800-same-ligase-dpr2.png` |
| 800 | Either end | 0 | `states8/rf-800-either-end.log` |
| 860 | Same way | 0 | `states8/rf-860-same-way.log`, `.png` |
| 960 | Same way | 1, the banner | `states8/rf-960-same-way.log` |

**Fix**: start both short rule sentences with "Hypothetical: ". The flat table drops them last, and the phone shows them too. Then recheck their line count at 360 and 390 px, because the comment at 707–709 caps a rule's sentence plus an enzyme's at four lines on a 360 px stage. Alternatively, give the banner a shorter fallback, "HYPOTHETICAL", or keep a place free for it.

### S2. Merging figfix-ch07 into land-4 conflicts in chapter 5, and the easy resolution drops nine no-break joins

**Where**: `biology/ch05-energy-and-metabolism/index.html`, two hunks around the margin note before Figure 5.4.
- Found with `git merge-tree --write-tree origin/land-4 origin/figfix-ch07`, which gives tree 0504b36: "CONFLICT (content): Merge conflict in biology/ch05-energy-and-metabolism/index.html".
- registry.js and drive.js merge on their own.
- The two sides:
  - figfix-ch07's 56bac8f moves the aside below the figure.
  - land-4's 090da73, the chapters 1–6 typography pass, rewrote the same two paragraphs with `&nbsp;` joins.

**Scenario**: the person landing the branch takes figfix-ch07's side of both hunks.
- The land-4 side has 9 joins (`&nbsp;` or `&#8288;`) and the figfix-ch07 side has 0. This was counted with awk over the conflict markers in the merged file.
- Examples of what goes back to breakable spaces: "Section 3.6's", "8 nm", "Chapter 4", "145 millimoles".
- No gate would notice: `tools/check-content.js` only decodes `&nbsp;`, at line 612, and has no rule about joins.

**Fix**:
1. Keep land-4's text for both paragraphs.
2. Move only the `<aside class="tb-margin-note">` to follow the figure, as 56bac8f intends.

figfix-ch08 merges into land-4 without conflict, giving tree f053366, and into figfix-ch07 without conflict too, giving 89652c3.

### S3. No gate shoots the 800–860 px windows where the new flat compositions live

**Where**: the gates in AGENTS.md.
- `npm run shot` uses 390, 1024 and 1440 px.
- `npm run narrow` uses a 390 px stage.
- `git grep 860` finds no figure gate that uses such a window.

**Scenario**: the new compositions are checked only by hand.
- The flat compositions exist only for windows of 800 to about 1150 px, where the stage is 480 to 782 px wide:
  - 7.2's `NARROW_W = 800`, `krebs.js:448`;
  - 7.4's `arrange()`, `fermentation.js:1211`;
  - 8.1 to 8.4's `flat`;
  - 7.1's 800 px ledger.
- A regression at 800 or 860 px would reach readers. S1 is one already: it cannot be seen at 1024.
- The chapter 7 figure review's "where the fixes go" listed "A gate that shoots an 860 px viewport: 17 and 23", and that part never landed.

**Fix**: a coordinator decision, within the budget. For example, add an 800 px window to `npm run narrow`'s figure pass, or to `SHOT_VIEWPORTS` for the chapter 7 and 8 pages only.

## Nits

- **N1. 8.3 speaks of a nick before there is one.** `replication-fork.js:732`, and 733 for the unchanged as-they-are wording.
  - With primer removal off, the stage says "…and the nick beside it cannot be sealed" from the opening state onwards.
  - But the table reads "Nicks not sealed 0" until the other fork's DNA reaches the origin primer. That is 1.5 s on the fork's clock, about 6 s on screen.
  - Evidence: `states8/rf-same-removal.log`, at time 0.00 s with 0 nicks. `states8/rf-same-removal-run.log` shows 2 nicks at 1.61 s.
  - The ligase sentence already uses "once each new strand's primer at the origin is replaced…", and the same "once" would fix this one.
- **N2. At 800 px, 8.3's fork scene shows none of the table's eight counts.** Its drawing also names only helicase and topoisomerase.
  - The stage is 480 × 206, with three rows of controls and a fork pane about 80 px tall.
  - Evidence: `states8/rf-800-dpr2.png`.
  - efdafc4 says this is by design, and the sentence still says what fails.
  - Worth rechecking if S3's gate lands.
- **N3. At 800 px, 7.3 drops complex III's "+2".**
  - The charge labels are `optional: true` at `respiratory-chain.js:1187`.
  - The drawing then reads +4 and +4, while the table says 10 charges a pair and the caption now asks the reader to count the charges.
  - Evidence: `states/rc-800-dpr2.png` and `states/rc-800.log`.
  - This predates the fixes.
- **N4. Small type at DPR 1 inside the band.**
  - 7.1 at 1024 draws 34 runs of text under 8.5 px: the step names at 7.5 px and the band headers at 7.2 px. At 800 it draws 11 runs of 7–8 px (`ch07b/report-ch07-800_1024.json`).
  - 8.4's enlargement labels are 8.6–8.8 px, and 8.1's legend is 8.5 px at 800 (`ch08/report-ch08-800_1024.json`).
  - The band probe rated 7.1 ok at f1ae404, so this predates the fixes.
  - The other sub-9 px entries are subscripts and superscripts: "2" in CO₂, "15" in ¹⁵N, "3" in cm³.

## Checked and found right

**8.3's science.** I drove 11 states through the figure's own buttons and read every sentence against the table and the drawing on screen at the same time.
- At 1024 px:
  - Same way with Primase, Ligase or Primer removal off, each at 0 s, and Ligase and Primer removal again after running;
  - Either end with Primase or Ligase off at 0 s, and Primer removal off after running;
  - As they are with Primase off at 0 s, and Ligase off after running.
- At 800, 860 and 960 px: the rules alone.
- Against OpenStax Biology 2e 14.4, every sentence agrees:
  - primase lays the RNA primer;
  - pol I removes primers and fills the gap;
  - ligase seals the nick;
  - replication runs both ways from an origin.
- A primer left in place keeps its 5′ triphosphate, which ligase cannot join. The long same-way sentence ("the fragments move to that fork, and do not go away") is right.
- The fixer's claim to have checked every rule with every toggle held in every combination I tried.

**`describe()`.** `laggingContinuous` is false, false and true for As they are, Same way and Either end. `strandsInFragments` is [1,1], [0,2] and [0,0].

**Pyrophosphate (F6).**
- As they are at 0 s: 1,488 = (1,480 − 1) + (10 − 1).
- Under a made-up rule: 2,958 = 2 × (1,480 − 1).

**Flat layouts.** No text over text, no text over a control, nothing cut off and no control that does not fit, in every frame listed below. The text-geometry report flags only the visually hidden live region.
- All eight figures at 800 and 1024 px.
- 7.2 and 7.4 at 390 px.
- 7.2's step-3 state (label C1, three steps) at 800, 860 and 1024 px.
- 7.3 at 800 px and DPR 2.
- 8.1 and 8.2 at 800 px and DPR 2.

**Contract.** Over the added lines of the diffs:
- no added `Math.random`, `Date.now`, `performance.now`, `setTimeout`, `setInterval` or `new Date`;
- no hex colours;
- no `describe()` key named `id`, `kind`, `number` or `state`.
- Each module picks its composition from its stage box alone. 8.3's `arrange()` reads `b.wrap`'s rect, at `replication-fork.js:779–781`.

**Seams.**
- registry.js:
  - krebs appears once, at line 122, after glycolysis at 115 and before respiratory-chain at 125;
  - that holds on land-4, on figfix-ch07 and in the trial merge;
  - the merged registry is identical to land-4's.
- drive.js in the trial merge 0504b36:
  - the chapter 7 and 8 recipes run in chapter order: glycolysis 3987, krebs 4250, respiratory-chain 4466, fermentation 4715, helix-lab 4856, meselson-stahl 5119, replication-fork 5249, chromosome-end 5472;
  - no key appears twice;
  - "krebs" occurs 20 times on each of land-4, figfix-ch07 and the merge.
- FIGURES.md's aspect and narrowAspect match registry.js and each module's `meta` for all eight figures.

## Not checked

- The dark theme.
- Windows of 1150 px and up.
- 8.3's chromosome scene and 8.4's driven states in the band.
- Any gate run.

## Note on the environment

- At 23:20 the main checkout's `node_modules` was found empty, at the moment another agent removed seven worktrees.
- I reported it to the coordinator, who restored it with `npm ci`.
- This review's worktree used its own `npm ci` copy in place of the junction, and that copy was removed with the worktree.

## The 36 findings, one line each

Chapter 7, from `2026-09-24-ch07-figures-accuracy.md`, checked on figfix-ch07 300da5f:

1. Fixed. The caption hint at `index.html:132` says "The levels are illustrative: the real enzyme is turned down by degrees, not shut at one level."
2. Fixed. `index.html:129` reads "…lets ATP, AMP and citrate each be pushed."
3. Fixed.
   - `respiratory-chain.js:152` adds `+ 1e-9`.
   - Sulfate's sentence is at 750 and carbon dioxide's at 755.
   - `drive.js:4586` has `[3, 'sulfate', -0.22, 19, 1, 'ubiquinone']`.
4. Fixed.
   - `col()` shows 'uphill' at `:1554` and the bracket at `:1226`.
   - The fit test samples 'uphill', at `:824`.
5. Fixed. The menaquinone sentence is at `:774`.
6. Fixed. `B.IIm` reaches the membrane midline `g.sx`, at `:932`.
7. Fixed. "From the cycle's FADH₂…" is at `:765`.
8. Fixed. The page says "count the charges" at `:232`, `:235` and `:377`, and the new data-alt is at `:234`.
9. Fixed. In FIGURES.md:
   - the 7.3 row is 16 / 10 and 2 / 3;
   - the acceptor table has `chargesPerPair` and sulfate at 1;
   - the FADH₂ line is present;
   - "the hard cases";
   - `chargesAreCeiling`.
10. Fixed. "N ATP" and "per glucose" now sit under "Mitochondrion" in all three drawings (`fermentation.js:719–721`, `851–853` and `991–993`).
11. Fixed. The caption ends "…while ATP per glucose stays at two, because the fermentation step makes none."
12. Fixed. `SCALE_NOTE` is at `fermentation.js:308`.
13. Fixed. `CLEAR_NOTE` and its short form, at `:304–305`, call the split illustrative.
14. Fixed. The ethanol `tissueNote` is at `:295–296`.
15. Fixed. The data-alt counts three fates and the "demand low enough" condition, at `index.html:352`.
16. Fixed. In FIGURES.md:
    - the 7.1 row is 16 / 9;
    - the 7.4 row is 2 / 3;
    - the timeline has three fates;
    - the lactate fields are marked illustrative;
    - "one column".
17. Fixed in the module, by the flat composition in 5203bdb. Clean at 800, 860 and 1024 px, including the step-3 state. The 860 px gate this finding named was not added; see S3.
18. Fixed.
    - The glycolysis arrow carries ATP and NADH, at `krebs.js:1435`.
    - "2 acetyl-CoA" is at `:1520`.
    - The route line is at `:1552`.
19. Fixed. The rows read "Carbons in as acetyl" and "Carbons out as CO₂", at `:1645`.
20. Fixed. `Math.round(y.total)` is at `:1724`.
21. Fixed. The data-alt says "turn by turn" and "one of three intermediates", at `index.html:178`.
22. Fixed. In FIGURES.md:
    - the 7.2 row is 2 / 3;
    - "Below 800 px";
    - all 17 `describe()` fields are present.
23. Fixed in the module, by the flat composition in 07d1c96. The pool clears the capsule at 800 and 1024 px. The gate was not added; see S3.

Chapter 8, from `2026-09-24-ch08-figures-accuracy.md`, checked on figfix-ch08 e29f6a0:

1. Fixed. In `helix-lab.js`:
   - `rareL` and `rareR` are at 304–305;
   - `mispair` is at 767;
   - both drawings are at 1359 and 1415;
   - the "neither base…" note is at 329.
2. Fixed. 'none in this shape' and 'none at this width' are at `:1608`, and the `describe()` comment at `:1695`.
3. Fixed. "C1′ to C1′" is at 1504, 1522, 1629 and 1638, and "backbones 2 nm apart, at the phosphates" at 1517.
4. Fixed. In `meselson-stahl.js`:
   - "Ruled out by the bands so far" is at 480 and 716;
   - the heat sentence is at 739.
5. Fixed.
   - `laggingIsContinuous` and `strandsInFragments` are at `replication-fork.js:204` and `679–680`, and were confirmed by driving.
   - The page's alt text and FIGURES.md:206 carry the new wording.
   - The optional origin label was declined, and that is sound: the sentences name the origin wherever it matters.
6. Fixed. One is subtracted for each primer, at `:440` and `:445`; the arithmetic is above.
7. Fixed. "Fired all at once, these forks would finish in under an hour…" is at `:752`.
8. Fixed. "In this drawing the fork keeps opening; a real fork slows…" is at `:738`, with a short form at `:737`.
9. Fixed. The opening sentence discloses the primers' length, at `:742–743`.
10. Fixed. The alt text reads "One control, with two settings each marked as hypothetical…", on land-4 and on figfix-ch08.
11. Fixed. In `chromosome-end.js`, "this model's limit" and the shortest-telomere reason are at 273, 430 and 1083, as the review worded them.
12. Fixed.
    - `LOSS` min 40 is at `:127`.
    - `drive.js:4859–4875` expects 80 nt at 40 bp.
    - FIGURES.md says "from 40 to 100 base pairs".
13. Fixed. The alt text says "Both new ends are then trimmed…", and FIGURES.md:244 says "both new ends are trimmed…". Both are on land-4 and on figfix-ch08.
