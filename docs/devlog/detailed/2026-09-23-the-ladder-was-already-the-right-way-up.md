# 2026-09-23 — the ladder was already the right way up

Branch `atp-ladder` off `5e9c981`, from `c8c9f27` on. One figure, `src/figures/atp3d.js`'s ladder scene. The brief named two defects and neither was there. The two real defects were one step to the side of each.

## The rail was not upside down, and the brief that said so was stale

**Timestamp:** 2026-09-23 09:26–09:50

**Action:** Before changing anything, §5.3 was read, and then the rail was read off the figure. The drive recipe's own frame came first. Then a probe read every `<text>` in the ladder pane with its `y`, at 1000x640, 760, 390, 360 and 320 px in both themes, over eight donor/target pairs. Then the live chapter page was loaded at 1440 and 390 px, "Ladder" was pressed with the mouse, and the rungs were read the same way. The live `src/figures/atp3d.js` was fetched and compared with `main`: identical.

**Result:** In every frame the rungs run top to bottom −61.9, −49.4, −43.1, −43.0, −30.5, −20.9, −15.9, −13.8. That is §5.3's table order, with creatine phosphate the rung directly above ATP, as the prose says. A transfer that can happen is a solid arrow pointing down.

**Reasoning:** The module's own header records that the rail ran the other way until 2026-09-17. Chapter 5 first reached `main` in `5e9c981`, after that, so the live site never served it upside down. The brief was a true sentence about a tree that no longer existed. Nothing could have told it so, because no gate read where the rungs are drawn. describe() reports the donor and target as ids, and ids do not move when the rail does.

**Validation:** `the-rail-runs-the-way-up-the-chapter-prints-it` now reads the drawn rail against §5.3's table, parsed out of the chapter's HTML. Swapping `TOP_KJ` and `BOTTOM_KJ` turns it red (`docs/learning/gate-proofs.md`).

## What was wrong was around the rail

**Timestamp:** 2026-09-23 09:50–10:40

**Action:** The verdict now names the molecule a donor phosphorylates. Each rung carries its `acceptor`, which is pyruvate, 3-phosphoglycerate, acetate, creatine, ADP, glucose, fructose or glucose. The Donor and Target ranges now hold a height counted from the bottom, not the rung's place in `LADDER`. The bench's stepper gained `steps`, which gives the reader's glyph and words to the two buttons, and `valueText`, which becomes `aria-valuetext`. Both default to what every other stepper already does. The rule line and the ledger note said "cannot phosphorylate anything above it", the verdict's mistake in general form. They now say "cannot hand a phosphate to anything above it", which is §5.3's own verb. A verdict that wraps now keeps every line.

**Result:** "Phosphoenolpyruvate can phosphorylate ATP" is now "can phosphorylate ADP and make ATP". "ATP can phosphorylate Glucose 6-phosphate" is now "can phosphorylate glucose and make glucose 6-phosphate". The old template was wrong for all 56 ordered pairs. ArrowUp, End, a drag to the right and the ↑ button all move a marker toward phosphoenolpyruvate. Before, all of them moved it down, including a button a screen reader announced as "Donor, step up". At 320 px the verdict used to lose its last line ("which is", with "uphill." gone). Once the acceptor was named, the longest verdict (124 characters) would have lost a line at 390 px too.

**Reasoning:** The value is reversed rather than the keys intercepted, because a range input's direction is what every input path shares, and assistive technology reads it. A handler on ArrowUp would have left PageUp, End, the drag and the button still running the other way. The glyphs are ↑ and ↓ rather than + and −. On this rail "+" is ambiguous. Up is toward the more negative number, so a "+" that moves the marker up makes the printed figure fall. The verdict's lines are never cut, but the rule's still can be, because the ledger carries the rule too and nothing else carries the verdict.

**Validation:** `the-ladder-works-out-the-transfer-itself` checks the verdict class-first, with a pattern that matched 56 of 56 old verdicts and 0 of 56 new ones. `up-on-the-controls-is-up-on-the-rail` presses ArrowUp and ArrowDown at 1000x640 and each step button at 390x844, and reads which rung the marker was drawn on. Three arms turned these red. The first made the ranges count from the top again. The second swapped the buttons' glyphs and names. The third was the old template. The trimmed gates are all green: drive, pinned, narrow, sweep3d and legible for `atp3d`, plus unit and check. A probe read the ladder pane's text boxes for collisions at 1000, 760, 390 and 360 px over eight pairs and found none.

**Notes:** ↑ and ↓ are drawn by Inter from the page's second, `text=`-subset stylesheet. That file is fetched only when the ladder opens at a phone's width. The bench observes its toolbar, so a reflow when it arrives is re-measured.

## The fonts-ready re-layout the brief asked for already existed

**Timestamp:** 2026-09-23 09:40–09:55

**Action:** Every `fonts.gstatic.com` response was held back, and the ladder was opened with the mouse while Inter was still loading. Then the fonts were released, and the ladder pane's markup was compared with a run that had the fonts first.

**Result:** At 1100 px the donor and target words stood at x = 248.1 and 333.1 against the fallback face. They moved to 250.3 and 342.2 when the fonts arrived, and the pane's markup was then byte-identical to the control. At 390 px the words sit at the right edge and nothing moved. The bench already redraws every figure on `document.fonts.ready` (`handle()`), which is the re-lay-out `scale.js` does for itself, and a redraw of the ladder measures again.

**Reasoning:** No second handler was added, because it would do exactly what the bench does. A note at the measurement in `atp3d.js` now says where the redraw lives and what was measured, so the next reader does not raise the same alarm. What the bench's promise cannot cover is a font load that starts after it took the promise. No face the ladder pane uses is first requested by the pane: pressing "Ladder" on the untouched tree changed no face's status.

## Still open

- **The ladder at 320 px.** The narrow composition leaves the ladder pane 258x113 px under a four-row toolbar. Eight rungs cannot be spread there, so the top four overprint in every state. That was measured before this change and again after it. It needs a composition decision, such as one toolbar row for Donor and Target, and not another spread rule.
- **The Row stepper.** Its "step up" moves the highlight to the next row, which is down the ledger. This is the same kind of label-against-picture mismatch, left alone because no one has decided which way a table's rows run.
- **The rung figures are hyphen-minus.** `n1()` prints "-61.9" where `signed()` and the chapter print "−61.9".
