# Devlog — 2026-09-23, chapter 4's figures

One worker on branch `ch04-figs` (worktree `textbook-ch04-figs`), with two sub-workers in worktrees of their own for the osmometer's words (`ch04-osmo`) and the contrast pairs (`ch04-contrast`), both merged back. Four defects from the coordinator's brief: `bilayer` saying "Micelles" at 90 °C, `bilayer`'s words after Curl, `osmometer`'s "pull" wording against the rewritten §4.4, and chapter 4's figures deferred from `npm run legible`.

## The bilayer verdict was one sweep of a thermal walk

**Timestamp:** 2026-09-23, evening, Pacific.

**Action:** The figure's own model code was exported into Node (a copy of `src/figures/bilayer.js` with the model appended to its exports) and run for 30 s of clock at every slider temperature and at the tank shape of every layout, the verdict read every 0.05 s. The verdict is now what the tank has held over the last second, with hysteresis (`SAMPLE_SWEEPS`, `nextVerdict`); the tank's height floor went from 0.52 to 0.66 of its width, and a pane flatter than that is given the whole tank, drawn narrower. `sealed` is now the edge averaged over a full second of samples taken since the last press that changed it.

**Result:** At 90 °C in the lab's tank, one sweep had been a sheet or micelles in 8.8-12.8% of reads over 23 seeds, changing its word about 100 times in 30 s; held, 0 reads in 23 runs. Between 70 and 84 °C, where the sheet melts, the word changed 180-280 times a run and now 2-3 on average. A 1024 px chapter page's 10.4 nm tank had held a sheet or micelles in 89% of sweeps at 90 °C; the new floor, 13.2 nm, held none in 9 runs at 88 °C or 90 °C.

**Reasoning:** A margin could not work: a sheet at 65 °C dips to 0.65 buried and a hot tank reaches 0.75, so the one-sweep distributions overlap. A plain majority over the second was tried first and still flipped 65 times in 30 s at 80 °C; the hysteresis (switch at 14 of 20 samples, or when the reported arrangement falls under 5) brought it to 4. The floor is physics, not layout: the count is fixed, so a flatter tank is a more crowded one, and a crowded enough tank cannot be taken apart by any heat the slider offers.

**Validation:** Two drive steps rewritten to walk the clock with Step and proved red on the figure as it was and on two one-line mutations; a Node test at the floor proved red with the old floor put back. `docs/learning/gate-proofs.md` has all five arms verbatim.

**Notes:** Two things believed during the round and found false. First, a prediction from the Node model of which read the drive step would fail at (t = 8.0 for seed 12) did not match the gate (t = 2, then t = 3 once the Curl step's Resets moved the seed on): the browser's tank is not exactly the one the probe assumed, so no comment quotes a Node prediction as a gate result. Second, the first rule for "Curl opened the ends" asked whether the biggest cluster had a molecule in every twelfth of the tank; a sheet just healed from the needle failed that while unwrapping it opened 4.5 nm of edge, so the rule is now the edge the unwrapping itself exposes.

## The Curl step was a coin toss, and the words after Curl were wrong

**Action:** The overlay after Curl now says whether the rims are open, sealed, or were never opened (a sheet that did not reach across the tank has no ends); the side sentence speaks of the heal time only while the needle is the last thing the reader did. The Curl step now takes a fresh tank, walks it with Step, and asserts the words.

**Result:** The Curl step as it was went red on 2 of 5 runs of an unchanged recipe (`taking the wrap away should open two rims: 1.9 -> 0 nm`, `0 -> 0 nm`): it pressed Curl on whatever the running walk held, and the needle's hole had sometimes healed as two capped pieces with nothing across the tank to open.

## The review

**Code reviewer comments:** One independent read-only review by a fresh subagent, of `f7cb330..a673ab6` for `src/figures/bilayer.js`, `tools/drive.js` and `test/bilayer-model.test.js`, with its own Node probes of the exported model. No blockers; four should-fix, all fixed in `034d406`:
- Curl's "ends opened" was decided for any tank, so a Curl pressed on a dispersed tank before Release (exposing 1.3-4.1 nm as the edge molecules lost their neighbours across the boundary) was later reported as a sheet that had rolled its ends in; the flag also survived choosing a molecule and the rewind branch. Now it is decided only for a tank that held a sheet, and reset on both paths.
- "Sealed" could be said at the instant of Curl: 50 of 2408 Curl instants (2.1%) opened between 1.0 and about 2.5 nm, and the edge from before the press filled the second. Now the edge has its own history, begun again at Curl and at the needle, and "sealed" needs a full second of samples taken since.
- Curl began the arrangement's history again from one sweep, which gave that sweep a second's weight: at 90 °C, 86 of 1806 Curl instants would have reported micelles or a sheet for 0.7 s. The arrangement's history now runs on through every press.
- The drive step decided "opened" at 2 nm where the figure decides at 1.0, a false red on 5% of Curl instants. It now reads the figure's own `curl` finding.
Nits kept as findings: the model test does not assert `heldSealed` or the Curl and needle paths; the step's "no ends opened" branch has never run against a passing figure.

## The osmometer's words, and chapter 4's contrast

**Action:** `ch04-osmo` rewrote every string that gave the solute agency over the water ("Neither side pulls", "stops pulling", "pulled away from its wall") and three that disagreed with §4.4 in some states (the urea membrane label; "isotonic" said of any cell at its resting volume; "what an isotonic bath does to a plant" in any bath). `ch04-contrast` fixed the 30 pairs under AA in `permeability`, `transport-lab`, `pump` and `gradient-battery` with no `ALLOWED` entry and no palette change.

**Result:** `npm run legible` over the eight kinds: 30 problems on the first run, then `6436 glyph run(s) compared over 16 figure/theme pairs`, 0 under bar.

**Notes:** Four of `permeability`'s failing "pairs" were neighbours drawn over a symbol, not a colour: the gate finds a glyph's pixels inside its bounding box. The worker read that from the code and the colours, not by experiment. Found and not fixed, each listed in the round's handoff: a tank of pure cholesterol at 37 °C is reported as a bilayer; ions still overlap at 390 px in `permeability`, `transport-lab` and `gradient-battery`; the osmometer's phone readouts say "mmol/L" before any slider moves and "mM" after; and at 390 px `gradient-battery`'s heart cell prints "1.00 × the untreated contraction" over the next panel's heading, which the figure did on `f7cb330` too.
