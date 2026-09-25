# Wide-band probe: chapters 1-7 at 800-1150 px

2026-09-25. Read-only probe, run from a detached worktree at `origin/land-4`, commit
`f1ae404639c22517f4ab93f1744a01755e40b6eb`. No tracked file was changed; `npm test` was never run.

## Why

A reviewer found two chapter 7 figures break in browser windows between about 800 and 1150 px wide.
The frame (`src/styles/components.css:505`) gives a figure its tall "narrow" box only when the whole
window is below 800 px. A figure that picks its own layout by its own stage width can get the
wide/flat box from the frame while its actual stage — narrowed further by the `.tb-rail` sidebar grid
— is too narrow for that wide layout. This probe checks every figure in chapters 1-7 for that failure
in that band, and for a second, related failure this probe turned up: a figure's own "narrow"
composition, correctly selected, can still break internally once the stage gets small enough in
absolute pixels.

## What was shot

Every `<tb-figure>` on every chapter-1-7 page (`window.__textbook.describeFigures()`, document order),
at window widths 800, 860, 960, 1024, 1150 px, height 900, light theme, each figure's opening state,
DPR 1. 48 figures in scope (krebs, 7.2, is skipped — not merged on `land-4`, its page shows an error
banner independent of width). 48 × 5 = 240 frames. Every figure's stage width/height at each window
width was recorded alongside its screenshot.

For every figure judged broken: the same width re-shot in dark theme, and one state past the opening
reached through the figure's own controls (a real click, not a state set directly), both re-examined
by the same eye.

## (a) Table: chapter, figure, kind, ok/break by width

"ok" = read properly: nothing overlapping, nothing cut off outside its stage, no control that
doesn't fit, nothing too small to read. A broken cell names the fault in a few words and the file
that decides it; full detail for every broken figure is in section (b).

| Ch | # | kind | 800 | 860 | 960 | 1024 | 1150 |
|---|---|---|---|---|---|---|---|
| 1 | 1.1 | pond | ok | ok | ok | ok | ok |
| 1 | 1.2 | homeostasis | ok | ok | ok | ok | ok |
| 1 | 1.3 | levels | ok | ok | ok | ok | ok |
| 1 | 1.4 | scale | ok | ok | ok | ok | ok |
| 1 | 1.5 | cell3d | ok | ok | ok | ok | ok |
| 1 | 1.6 | dna3d | ok | ok | ok | ok | ok |
| 1 | 1.7 | energy | ok | ok | ok | ok | ok |
| 1 | 1.8 | tree | ok | ok | ok | ok | ok |
| 1 | 1.9 | pasteur | ok | ok | ok | ok | ok |
| 2 | 2.1 | soup | ok | ok | ok | ok | ok |
| 2 | 2.2 | bondlab | ok | ok | ok | ok | ok |
| 2 | 2.3 | water3d | ok | ok | ok | ok | ok |
| 2 | 2.4 | waterprops | ok | ok | ok | ok | ok |
| 2 | 2.5 | phlab | ok | ok | ok | ok | ok |
| 2 | 2.6 | carbonkit | ok | ok | ok | **3 stat blocks overlap** — `src/figures/carbonkit.js:1123` | **same, persists** — `src/figures/carbonkit.js:1123` |
| 2 | 2.7 | polymer | ok | ok | ok | ok | ok |
| 2 | 2.8 | foldlab | ok | ok | ok | ok | ok |
| 3 | 3.1 | microscopes | ok | ok | ok | ok | ok |
| 3 | 3.2 | surface-volume | **crash: negative arc radius** — `src/figures/surface-volume.js:424` | ok | ok | ok | ok |
| 3 | 3.3 | prokaryote | **crash: negative arcTo radius** — `src/figures/lib/cell-common.js:64` | ok | ok | ok | ok |
| 3 | 3.4 | secretion | **mini-diagram labels overlap** — `src/figures/secretion.js:487` | **same** — `src/figures/secretion.js:487` | ok | ok | ok |
| 3 | 3.5 | symbiont | **list clipped + unclickable** — `src/figures/symbiont.js:143` | **list clipped** — `src/figures/symbiont.js:143` | ok | ok | ok |
| 3 | 3.6 | cytoskeleton | ok | ok | ok | ok | ok |
| 3 | 3.7 | cilium | ok | ok | ok | ok | ok |
| 3 | 3.8 | plantcell3d | ok | ok | ok | ok | ok |
| 4 | 4.1 | bilayer | ok | ok | ok | ok | ok |
| 4 | 4.2 | membrane3d | ok | ok | ok | ok | ok |
| 4 | 4.3 | permeability | **tab strip cut mid-word** — `src/figures/permeability.js` | **tab hidden, no cut** — `src/figures/permeability.js` | ok | ok | ok |
| 4 | 4.4 | osmometer | ok | ok | ok | ok | ok |
| 4 | 4.5 | transport-lab | ok | ok | ok | ok | ok |
| 4 | 4.6 | pump | **rows garble + 3-way overlap** — `src/figures/pump.js:816` | **heading/row overlap remains** — `src/figures/pump.js:816` | ok | ok | ok |
| 4 | 4.7 | gradient-battery | **2 readouts + buttons overlap** — `src/figures/gradient-battery.js:942` | **2 readouts overlap** — `src/figures/gradient-battery.js:942` | ok | ok | ok |
| 4 | 4.8 | bulk-transport | ok | ok | ok | ok | ok |
| 5 | 5.1 | entropy-ledger | **"THE BILL" header overlaps Total row** — `src/figures/entropy-ledger.js` | ok | ok | ok | ok |
| 5 | 5.2 | free-energy | ok | ok | ok | ok | ok |
| 5 | 5.3 | atp3d | **ledger silently drops 3 trailing rows** — `src/figures/atp3d.js:325` | ok | ok | ok | ok |
| 5 | 5.4 | coupling-bench | ok | ok | ok | ok | ok |
| 5 | 5.5 | activation-barrier | ok | ok | ok | ok | ok |
| 5 | 5.6 | enzyme-kinetics | ok | ok | ok | ok | ok |
| 5 | 5.7 | feedback-pathway | ok | ok | ok | ok | ok |
| 5 | 5.8 | metabolic-map | ok | ok | ok | ok | ok |
| 6 | 6.1 | pigment-spectra | ok | ok | ok | ok | ok |
| 6 | 6.2 | zscheme | ok | ok | ok | ok | ok |
| 6 | 6.3 | calvin-cycle | ok | ok | ok | ok | ok |
| 6 | 6.4 | rubisco-fork | ok | ok | ok | ok | ok |
| 7 | 7.1 | glycolysis | ok (control) | ok | ok | ok | ok |
| 7 | 7.2 | krebs | skipped — not merged on `land-4`, errors at every width | | | | |
| 7 | 7.3 | respiratory-chain | ok (control) | ok | ok | ok | ok |
| 7 | 7.4 | fermentation | **NAD-pool arc overlaps Mitochondrion pill** — `src/figures/fermentation.js:113` | **same** | **same** | **same** | ok |

Systemic enabler for every row above except the two crashes: the frame gives every width in this
band (800-1150) the WIDE box (`src/styles/components.css:505` only switches below 800), while the
`.tb-rail` sidebar grid shrinks the actual stage well below the window width — e.g. window 1024 →
stage 656 px, window 800 → stage 480 px. Each broken figure's own `NARROW_W`/`wantNarrow` test then
either (i) picks WIDE for a stage too narrow to hold the wide composition (carbonkit, fermentation),
or (ii) correctly picks NARROW but that composition itself collides at very small absolute pixel
sizes (secretion, symbiont, permeability, pump, gradient-battery, entropy-ledger, atp3d). The two
crashes (surface-volume, prokaryote) are a third, distinct mechanism: a shared shape-drawing helper
handed a negative radius once the stage shrinks past a threshold — unrelated to which composition was
picked.

## (b) Breaking figures, narrowest width that reads properly

11 of 48 in-scope figures break somewhere in 800-1150 px. For each: the narrowest width in the tested
set at which it next reads properly (">1150" if it never recovers in-band), what breaks, and the
file:line that decides it.

1. **carbonkit (2.6)** — clean only ≤960 (stage ≤640); broken at 1024 and **still broken at 1150**,
   the top of this band — never recovers in-band. `src/figures/carbonkit.js:38` sets
   `NARROW_W = 640`; `:1123` `wantNarrow = w < NARROW_W || hgt < NARROW_H`. Past 640 px stage it
   switches to a wide, multi-block composition whose "WHAT IT IS MADE OF", "GROUPS TO HANG ON" and
   "IN WATER" stat blocks overlap each other at every wide stage tested (656 px and 782 px alike) —
   this is the wide layout itself being too tall for the space it's given, not a misclassification
   at one width. Confirmed in dark theme at both widths, and the overlap persists unchanged after
   clicking a "—OH / Hydroxyl" group button (now labelled methanol).

2. **surface-volume (3.2)** — clean from 860 (stage 540×304) up; crashes at 800 (stage 480×270).
   Not an overlap: the frame's own `describe()` reports `state: "error"` and the figure's stage
   shows only "This figure could not load: Failed to execute 'arc' on
   'CanvasRenderingContext2D': The radius provided (-10.5) is negative." `src/figures/surface-volume.js:424`
   — `g.arc(cx, cy, (sg.draw.w / 2) * scale, 0, TAU)` — is not clamped to ≥ 0, unlike the guarded
   version two lines below it (`Math.max(0, geo.draw.w / 2 - inset)` at line 434). At this stage size
   `(sg.draw.w / 2) * scale` goes negative and the canvas call throws. Confirmed identical error text
   in dark theme. No controls render for a crashed figure, so no post-opening state exists to shoot.

3. **prokaryote (3.3)** — clean from 860 (stage 540×338) up; crashes at 800 (stage 480×300), same
   mechanism family as surface-volume but a different call site: `state: "error"`,
   "Failed to execute 'arcTo' ... The radius provided (-7.94545) is negative." Root cause is the
   shared helper `src/figures/lib/cell-common.js:64` — `const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);`
   has no floor at 0, so a negative `r` passed in at extreme stage sizes survives as a negative `rr`
   and is handed straight to `g.arcTo(...)`. Both of prokaryote's `roundRectPath` calls
   (`src/figures/prokaryote.js:571`, `:733`) pass `Math.min(w, hgt) * scale` as `r`. Confirmed
   identical error text in dark theme; no controls render at 800, so no post-opening state exists.

4. **secretion (3.4)** — clean from 960 (stage 640) up; broken at 800 and 860 alike (480 and 540 px
   stage — both already inside its own narrow threshold, `src/figures/secretion.js:112-113`
   `NARROW_W=700, NARROW_H=430`; `:487` `wantNarrow`). The top mini-diagram's organelle labels
   (Nucleus, Rough ER, Smooth ER, Golgi cis/trans, Secretory vesicles, Lysosome, Outside) overlap and
   truncate severely at both widths. Confirmed in dark theme at both widths; persists unchanged after
   clicking the "Secreted" cargo toggle.

5. **symbiont (3.5)** — clean from 960 (stage exactly 640; `640 < 640` is false, so wide) up; broken
   at 800 and 860. `src/figures/symbiont.js:36` `NARROW_W = 640`; `:726` `wantNarrow = w < 640`;
   `:143` gives the six-item observation list a fixed-height `overflow: clip` container, which the
   "Pick an observation." paragraph beneath it overlaps and slices ("Bacterial-type ribosomes" and
   "Antibiotics act on them" rows cut/overlapped). Confirmed in dark theme at both widths. **New
   this probe**: at 800 the defect is not only visual — a real click at the first observation row
   timed out after 180 s of Playwright actionability retries, because the overlapping
   `<svg class="sy-art">` diagram intercepts pointer events over the button. A reader cannot actually
   use that control at this width, not just read it awkwardly.

6. **permeability (4.3)** — clean from 960 up; broken at 800 and 860. The substance-tab strip
   (Oxygen/Carbon dioxide/Water/Urea/Glycerol/Glucose/Chloride/Potassium/Sodium) overflows
   horizontally with no fade or ellipsis affordance. At 800 the leftmost visible tab is cut mid-word
   ("Carbon dioxide" shows only "…oxide"); at 860 "Oxygen" is hidden whole, no mid-word cut. Confirmed
   in dark theme at both widths; persists after clicking the "Glucose" tab — the same mid-word cut sits
   at the strip's start regardless of which tab is selected.

7. **pump (4.6)** — clean from 960 up; broken at 800 and 860. `src/figures/pump.js:816`
   `wantNarrow = w < 620 || hgt < 330`. At 800 (480×300): "K+ inside"(140) and "ATP spent"(0) rows
   garble into "0140", and "Cycles completed" collides three ways with the bold stage-heading and
   "Charge out per cycle". At 860 (540×338) the K+ row is fixed but the stage-heading/"Cycles
   completed" overlap remains. Confirmed in dark theme at both widths; after clicking "Step", a new
   step caption ("ATP hands over its phosphate") overlaps "Charge out per cycle" instead — the
   collision moves but does not go away.

8. **gradient-battery (4.7)** — clean from 960 up; broken at 800 and 860, and worse after
   interaction. `src/figures/gradient-battery.js:942` `wantNarrow = w < 700 || hgt < 330`. At 800
   (480×300) two readout blocks overlap each other and the button row; at 860 (540×338) the two
   readout blocks still overlap each other. Confirmed in dark theme at both widths. After clicking
   "Heart cell" (switches to the cardiac-contraction mode, which adds a chart and more readout rows)
   the overlap gets worse, not better: the new "CONTRACTION, AGAINST UNTREATED" heading and four more
   rows all collide near the button row.

9. **entropy-ledger (5.1)** — clean from 860 up; broken at 800 only (480×270). The "Total" row's
   label is directly overlapped by the "THE BILL" section header below it. Confirmed in dark theme;
   persists unchanged after clicking the Supply "−" control.

10. **atp3d (5.3)** — clean from 860 up; broken at 800 only (480×300), and not an overlap but a
    silent drop. `src/figures/atp3d.js:325` `NARROW_W = 700`; the file's own comment (~line 1183)
    documents that the ledger pane clips rather than overflows so a table taller than the pane loses
    its bottom rows instead of painting over the toolbar — at 480×300 that clip line falls before the
    Water, Two-not-one and Total rows, so the figure shows only ΔG here/The bond/Repulsion/Spread and
    silently drops its own payoff number with no affordance that anything is missing. Confirmed in
    dark theme; persists unchanged after clicking the "Molecule" view toggle.

11. **fermentation (7.4)** — clean only at 1150 (stage 782, the one width in this band where
    `NARROW_W = 720` at `src/figures/fermentation.js:113` picks the WIDE composition); broken at
    800, 860, 960 **and** 1024 (stages 480/540/640/656, all < 720). This is wider than the seed
    report's "breaks at 860 and 1024" — this probe's own sweep found it also breaks at 800 and 960;
    it is the frame's own box-vs-stage mismatch described in "Why" above, about as directly as it
    gets: the frame gives every width in this band the wide/flat box, the figure's narrow, vertically
    stacked composition (NAD-pool circle arc directly above the Mitochondrion pill) needs more height
    than that box has, and the arc overlaps the pill's "Chain"/"O₂→H₂O"/"by a shuttle" text and the
    "ATP AND THE NAD POOL" heading at all four narrow widths. Confirmed in dark theme at all four;
    persists unchanged after clicking "Lactate" (which adds more readout rows into the same cramped
    space).

## (c) Instrument

Two read-only Playwright scripts, run from the `land-4` worktree against its own `tools/serve.js` and
`tools/lib/browser.js` (chromium, `window.__textbook.describeFigures()` for figure discovery, the same
handshake the gates wait on):

- `probe-band.mjs` — the main sweep. Every figure on chapters 1-7, all 5 widths, opening state, DPR 1.
  Wrote 240 PNGs plus `manifest.json` (chapter, figure number, kind, id, width, height, theme, stage
  width/height, state) and `problems.json` (page-level errors, timeouts). All under the session
  scratchpad, never the worktree.
- `zoom-shot.mjs` — targeted re-shoots at 1-3x device scale, used to confirm every suspected defect
  from the main sweep at higher resolution before it was recorded as broken, and to re-shoot every
  breaking figure's breaking width(s) in dark theme.
- `state-shot.mjs` — for each breaking figure, clicks one real control inside its stage (preferring a
  mode/shape/tab button over a bare "Reset") and shoots the result, for the "one state past opening"
  requirement. For symbiont at 800 the click itself failed after 180 s of Playwright actionability
  retries — recorded as a finding (an unclickable control), not a script bug.

Every one of the 240 main-sweep frames was opened and looked at, full size, by the same eye, against
this checklist: words on words or words on shapes; a part drawn over another part; text cut off or
outside its stage; a readout or control that doesn't fit; type too small to read. One initial
suspicion (chapter 3's `microscopes`, misread as a "blank strip" from the low-resolution sweep image
alone) was walked back after a 2x zoom re-shoot showed it to be a valid narrower composition that
legitimately omits the top preview image — nothing was cut off or overlapping. Every figure recorded
broken above was independently re-confirmed at higher resolution, cross-checked against its exact
stage pixel size in `manifest.json`, and traced to a source file:line before being written down. Every
breaking figure was re-shot in dark theme (22 frames) and driven one step past its opening state
through its own controls (9 of 11 — the two crashes render no controls to click); all 30 of those
confirmation frames were looked at the same way, and all confirmed the same fault the light-theme
opening-state sweep found, unchanged or (gradient-battery) worse.
