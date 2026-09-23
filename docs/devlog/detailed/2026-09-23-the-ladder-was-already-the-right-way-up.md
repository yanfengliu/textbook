# 2026-09-23 — the ladder was already the right way up

Branch `atp-ladder` off `5e9c981`, commits `c8c9f27` … `c5777c1` and the docs after them. One figure, `src/figures/atp3d.js`'s ladder scene, and the bench's stepper. The brief named two defects and neither was there. The real ones were one step to the side of each, and the review of the first fix found more.

## The rail was not upside down, and the brief that said so was stale

**Timestamp:** 2026-09-23 09:26–09:50

**Action:** Before changing anything, §5.3 was read, and then the rail was read off the figure. The drive recipe's own frame came first. Then a probe read every `<text>` in the ladder pane with its `y`, at 1000x640, 760, 390, 360 and 320 px in both themes, over eight donor/target pairs. Then the live chapter page was loaded at 1440 and 390 px, "Ladder" was pressed with the mouse, and the rungs were read the same way. The live `src/figures/atp3d.js` was fetched and compared with `main`: identical.

**Result:** In every frame the rungs run top to bottom −61.9, −49.4, −43.1, −43.0, −30.5, −20.9, −15.9, −13.8. That is §5.3's table order, with creatine phosphate the rung directly above ATP, as the prose says. A transfer that can happen is a solid arrow pointing down.

**Reasoning:** The module's own header records that the rail ran the other way until 2026-09-17. Chapter 5 first reached `main` in `5e9c981`, after that, so the live site never served it upside down. The brief was a true sentence about a tree that no longer existed. Nothing could have told it so, because no gate read where the rungs are drawn. describe() reports the donor and target as ids, and ids do not move when the rail does.

**Validation:** `the-rail-runs-the-way-up-the-chapter-prints-it` now reads the drawn rail against §5.3's table, parsed out of the chapter's HTML. Swapping `TOP_KJ` and `BOTTOM_KJ` turns it red (`docs/learning/gate-proofs.md`).

## What was wrong was around the rail

**Timestamp:** 2026-09-23 09:50–10:40, then 10:40–12:10 after the review

**Action:**
- The verdict now names the molecule a donor phosphorylates. Each rung carries its `acceptor`: pyruvate, 3-phosphoglycerate, acetate, creatine, ADP, glucose, fructose, glucose.
- The Donor and Target ranges now hold a height counted from the bottom, not the rung's place in `LADDER`.
- The bench's stepper gained `steps`, the reader's glyph and words for the two buttons, and `valueText`, which becomes `aria-valuetext`. Both default to what every other stepper already does.
- The rule line said "cannot phosphorylate anything above it", the verdict's mistake in general form. It now uses §5.3's verb: "cannot hand a phosphate to anything above it".
- A verdict that wraps now keeps every line.
- After §5.3's table was renamed, the rail's heading and the table beside it name the quantity the same way. "RELEASED ON HYDROLYSIS, kJ/mol" became "ΔG°′ of hydrolysis, kJ/mol", and "It releases" became "Its ΔG°′ of hydrolysis".

**Result:**
- "Phosphoenolpyruvate can phosphorylate ATP" is now "can phosphorylate ADP and make ATP". "ATP can phosphorylate Glucose 6-phosphate" is now "can phosphorylate glucose and make glucose 6-phosphate". The old template was wrong for all 56 ordered pairs.
- ArrowUp, End, a drag to the right and the ↑ button all move a marker toward phosphoenolpyruvate. Before, all of them moved it down, including a button a screen reader announced as "Donor, step up".
- At a 272 px stage the verdict used to lose its last line: "which is", with "uphill." gone.

**Reasoning:**
- The value is reversed rather than the keys intercepted. A range input's direction is what every input path shares, and assistive technology reads it. A handler on ArrowUp would have left PageUp, End, the drag and the button still running the other way.
- The glyphs are ↑ and ↓ rather than + and −. On this rail up is toward the more negative number, so a "+" that moves the marker up makes the printed figure fall.
- The verdict's lines are never cut, but the rule's still can be.

**Validation:**
- `the-ladder-works-out-the-transfer-itself` checks the heading, the rows and three verdicts. The class pattern matched 56 of 56 old verdicts and 0 of 56 new ones.
- `up-on-the-controls-is-up-on-the-rail` presses ArrowUp and ArrowDown at 1000x640 and each step button at 390x844, and reads which rung the marker was drawn on.
- `the-verdict-is-drawn-whole-however-long` holds the longest verdict at 390 px.
- Seven arms turned these red.

**Notes:** ↑ and ↓ are drawn by Inter from the page's second, `text=`-subset stylesheet. That file is fetched only when the ladder opens at a phone's width. The bench observes its toolbar, so a reflow when it arrives is re-measured.

## The fonts-ready re-layout the brief asked for already existed

**Timestamp:** 2026-09-23 09:40–09:55

**Action:** Every `fonts.gstatic.com` response was held back, and the ladder was opened with the mouse while Inter was still loading. Then the fonts were released, and the ladder pane's markup was compared with a run that had the fonts first.

**Result:** At 1100 px the donor and target words stood at x = 248.1 and 333.1 against the fallback face. They moved to 250.3 and 342.2 when the fonts arrived, and the pane's markup was then byte-identical to the control. At 390 px the words sit at the right edge and nothing moved. The bench already redraws every figure on `document.fonts.ready` (`handle()`), which is the re-lay-out `scale.js` does for itself. A redraw of the ladder measures again.

**Reasoning:** No second handler was added, because it would do exactly what the bench does. A note at the measurement in `atp3d.js` now says where the redraw lives and what was measured, so the next reader does not raise the same alarm. What the bench's promise cannot cover is a font load that starts after it took the promise. No face the ladder pane uses is first requested by the pane: pressing "Ladder" on the untouched tree changed no face's status.

## What the review caught

**Timestamp:** 2026-09-23 10:31–11:00 (review of `32927ac`), 11:00–12:10 (fixes)

**Action:** Both CLI reviewers were unavailable.
- Codex: the configured `gpt-6-astra` needs a newer CLI than the installed 0.148.0. The supported `gpt-5.6-sol` hit the account's usage limit, which clears on 2026-09-26.
- Claude: the CLI's OAuth session had expired.

The review ran instead as a fresh-context read-only subagent over `5e9c981..32927ac`. It found no blockers, eight should-fix findings and eleven nits. The dispositions:

- **The verdict's "cannot" denied what cells do.** Once the acceptor was named, "ATP cannot phosphorylate creatine" was flatly false: that is how resting muscle recharges §5.3's reserve, and §5.2 says a ΔG°′ a little above zero runs when the concentrations allow. It now says "under standard conditions", and ends ", uphill." to stay short.
- **A layout claim was false.** The comment said the 320 px pile-up was a reader's problem. The lab's stage is 48 px narrower than the chapter page's below 800 px, where a wide figure is `100vw`. Measured on the chapter page at 320, 360, 375 and 390 px, over nine pairs, before and after: no text overprints anywhere. The 272 px stage only the lab has is where four rungs overprint, before and after alike.
- **A wider toolbar button.** That same measurement found ↑ and ↓ 2.5 px wider than + and −. On a 320 px phone this pushed the two steppers onto separate rows, and the ladder lost 34 px and its rule line. A figure-scoped padding put the buttons at 25.7 px against 25.8. After that, every pane size and every state that shows the rule matched the untouched tree.
- **Wrong comments.** The rule line is not carried by the ledger at a phone's width, where the ledger is hidden. No verdict wraps to three lines at the narrowest wide stage. Both were stated in comments and are corrected.
- **Gaps in the gate.** The verdict's no-cut fix had no gate: there is now a step for it. End was pressed with the donor already at the top: Home now comes first. The narrow loop lacked the end-of-rail guard, and a marker drawn one rung off its own compound would have passed: both are now checked. The only verdicts tested had ATP as the target, so a sugar-target verdict is checked now, case-sensitively. The chapter parse silently dropped rows that carry attributes: it now reads them, and fails when any `<tr>` cannot be read.
- **The bench.** `set(v)` handed the raw number to `valueText`. It now reads the clamped value back off the input.
- **Wider gates.** The bench changed, so drive, narrow and pinned were also run on the nine figures built on it: 61 of 61 drive steps, narrow green, pinned PASS.
- **Left for the coordinator.**
  - A defect-register entry, which belongs there only if the brief relayed the owner's words.
  - The chapter's caption hint, "which compounds can phosphorylate which", which is chapter prose.
  - The Row stepper's "step up", which moves the highlight down the ledger.
  - AGENTS.md's line for `npm run drive`, which does not yet say it reads drawn text for this figure.

## Still open

- **The Row stepper.** Its "step up" moves the highlight to the next row, which is down the ledger. This is the same kind of label-against-picture mismatch. It is left alone because no one has decided which way a table's rows run.
- **The rung figures are hyphen-minus.** `n1()` prints "-61.9" where `signed()` and the chapter print "−61.9".
- **The lab at 320 px** is a 272 px stage no reader gets, and there the rail cannot fit.
