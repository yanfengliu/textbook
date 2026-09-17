# Gates that could not say what went wrong

Round of 2026-09-19. Two gates were fixed for the same reason and neither fix made a gate easier: both made a failure say which part of it failed. A third finding is a mitigation that had never run. Read this if you are about to trust a green gate here, or about to change a launch flag.

## `npm run devices` went red and blamed the screenshot

A gate load on `tongjian` at 750x342 (iPhone 13 landscape) timed out, and the failure was recorded as a screenshot timeout. It was never reproduced: **four attempts across two sessions**, 68 full gate-path loads, 24 more with 64 burner threads held on 32 cores, and the gate's own tuple green in 7.3 s on a machine already at 100% CPU.

The cost investigation was a dead end, and the reason is worth keeping. Every timeout in `tools/devices.js` was one flat `page.setDefaultTimeout(120_000)`, and the worst capture ever measured on this tree is **3348 ms** over 68 rounds at exactly that shape — a budget 36× the worst case. Nothing about capture cost can explain two minutes. Two hypotheses died on the way: the shape is **not** slow (the failing shape is the fastest of its 2.3 MP group, at 42–63 ms per megapixel across aspects 0.59 to 7.20, and the widest-shortest viewport is the slowest), and fonts are not racing (24 of 24 rounds `document.fonts.status === 'loaded'`, `stuck: []`).

The real defect was the message. Playwright's `page.screenshot` is **three waits under one `progress.race`** — an all-frames prepare evaluate, `document.fonts.ready` in the utility world, and the CDP capture — and all three reject with the identical string `page.screenshot: Timeout 120000ms exceeded`. One flat budget covered navigation, the handshake, the font wait, all six suites and the capture, so a red named none of them.

`cae7e79` gave each phase its own named budget — navigation 120 s, ready handshake 120 s, fonts 30 s, suite groups 60 s, capture 45 s — none looser than the number it replaced, and each failure says which phase ran out and what would satisfy it. Proved red by `CAPTURE_BUDGET_MS = 1` and green on the gate's own tuple under 32 burner threads at 100% CPU, 34.4 s, then re-verified unloaded at 2.8 s.

**What it caught immediately is the argument for it.** The new message found two bugs in its own author's code inside twenty minutes, both naming the phase: `Too many arguments…` thrown in the header and sideways-scroll phase, and `budgetedOptions is not defined` thrown in the ready handshake. The first would have been a bare Playwright string before.

A third mutation, `FONTS_BUDGET_MS = 1`, did **not** go red — the font wait resolved inside the 6 ms the timer took to fire. That is a measurement, not a failed proof: the wait genuinely costs single digits on this page.

## The crash-dialog mitigation had never run

`tools/zj-quiet-browser.cjs` passes `--noerrdialogs --disable-crash-reporter --disable-features=Crashpad` to suppress a modal chromium crash dialog the owner reported on 2026-09-12. It was applied by a `NODE_OPTIONS` preload — **and nothing in this repository ever set `NODE_OPTIONS`**. No `package.json` script, no workflow, and `tools/test.js` spawned gates with no `env`. Measured: a plain `node tools/devices.js` read back a 52-argument chromium command line with all three flags absent, while the wrapper and the unit test asserting its flag list stayed green.

`test/browser-quiet.test.js:20-21` had already named the hole in its own header — *"this half cannot see a patch that silently fails to apply"* — and deferred the effect to a probe "run deliberately". So the probe passed when a person engaged the preload by hand, and every `npm test` ran without it.

`437437b` wires it: `--require ./tools/zj-quiet-browser.cjs` on each `node` invocation, prepended by `tools/test.js` to every gate it spawns. One preload covers launches that do not go through `tools/lib/browser.js`, such as the WebKit and Firefox arms, and two mechanisms merging one flag list would drift apart. `3da77fd` fixed the report line itself, which had read `chromium[name].__zjQuiet` — looking for `chromium.chromium`, so it never found the marker and printed `preload absent` beside args containing `noerrdialogs`. A wired run now reads:

```
preload engaged (__zjQuiet marker on the chromium browser type) |
args as launched (8 of 56) enable-unsafe-swiftshader ignore-gpu-blocklist noerrdialogs
disable-crash-reporter disable-features=Crashpad use-gl=angle use-angle=swiftshader-webgl
```

That line is the fix for the class, not the instance: engagement is now visible in any gate's own log, and its absence equally so. Still owed: `zj-quiet-browser.cjs:40-44`'s `catch` makes *"the patch ran and resolved nothing"* indistinguishable from *"the patch never ran"*, which needs a marker recorded before the `require`; and `out/gpu/wiring-check.mjs` (18 of 18 scripts wired; 13 problems when stripped, 1 when only `sweep3d` is unwired) should be promoted into `test/browser-quiet.test.js` so `npm run unit` sees it.

**The wiring gap is a candidate for the `devices` hang, explicitly not a cause.** The shape is consistent — suppression inert means a gate could sit to a 120 s timeout and be logged as a screenshot timeout — but no measurement connects them, and all nine GPU arms ran to completion unwired with no dialog. What would settle it, on the next reproduction: capture the launch line plus a task list for a `chrome-headless-shell.exe` with a modal window. Recurring with `preload engaged` eliminates the wiring; recurring with `absent` points at a spawn path that does not honour `--require`.

## The GPU is reachable, and the default stays on the CPU

One flag reaches the hardware — `--use-angle=d3d11`, needing neither headful nor `--headless=new` — and `--enable-unsafe-swiftshader` is what *pins* the software fallback, so `GPU_ARGS` in `tools/lib/browser.js` was already correct. `npm run sweep3d` is **1.94× faster** on the GPU (CPU median 101.1 s, GPU 52.1 s over nine arms) and raster 4.7× faster, with readback — not raster — the real bottleneck at 762 of 923 ms.

**The flags are not changed, and the reason is not speed.** The CPU path is byte-reproducible and the GPU path is not: two CPU gate runs were identical in **180 of 180** frames at max Δ 0, while two GPU runs matched in **119 of 180**, the rest off by 1–2/255. The frame contract promises a screenshot is the same frame every run, and only the CPU honours it exactly. `launch({gpu})` already reaches the benefit through `PERF_GPU`/`SHOT_GPU`/`SWEEP_GPU` without moving a default. Both findings are in `docs/learning/defect-register.md`; neither belongs in `gate-proofs.md`, because no gate can be made red by either.

Two controls make the comparison trustworthy: CPU-vs-CPU is every pixel Δ0 across 36 frames and GPU-vs-GPU is every pixel Δ0 across 180 pairs, so the frames are pure functions of clock and actions under both renderers and the CPU-vs-GPU deltas are the rasterizer's alone. The largest settled-figure gap is `cell3d-light-03-bare` at mean |Δluma| 0.66, and the diff is an MSAA silhouette halo consistent with `antialias: true`.

## What this round could not establish, and the gaps it carries

- The **cause** of the `devices` hang. Nothing measured here explains two minutes, and the machine's state at the time — cold cache, slow font CDN, a wedged GPU process — is unrecoverable from the old message.
- Whether that intermittent is **one defect or several**: an older `tapping a glossary term opened no definition` intermittent in the same gate has never been seen alongside it.
- **Verdict-safety on the GPU** for `shot`, `narrow`, `drive` and `devices` — only `sweep3d` was run under both renderers.
- The **CPU baseline on a quiet machine**: every arm ran at 82–100% load.
- `tiny_people` and `voxel` **cannot carry the canon on `HEAD`** until their sessions commit the prose they hold in the same `AGENTS.md`. A clean checkout still reads `bb31c741ed27` there, and the fleet drift gate reads red for those two.
- **`npm run check` is red** on `biology/ch04-membranes-and-transport`, another session's in-flight chapter, which declares 37 objectives and has no `items.js`. Ten of eleven pages are clean, including all four `tongjian/` pages. Full `npm test` therefore cannot be green on this tree for a reason unrelated to this round.
- The canon names `docs/learning/lessons-evidence.md` as the recovery route for a retired lesson. It is tracked in **16 repos but not this one**; the pre-retirement text is recoverable from `git show 0865e89:docs/learning/lessons.md`, but the named route reads nothing here.
- One worktree audit, measured twice and **not atomic**: 61 then 62 linked trees across nine repos, of which 47 held no unique commits and no local changes with none touched in the previous 24 hours, 11 held uncommitted work, and 3 held commits on no `main` — `lego` (+612/−23, silent since 2026-08-07), `idle-life` (+258/−96, silent since 2026-08-08) and `voxel` (a CI change, live). All three branches are also on `origin`, so nothing was unpushed; they are unmerged. None was deleted, because they belong to other repositories and other sessions.

## A figure's own type had never been measured against what is behind it

A chapter-4 worker reported that `gradient-battery`'s voltmeter reading went near-white on near-white in the dark theme, and fixed that one instance. This round was sent to find out whether it was unique. It was not, and the shape of the cause is the useful part.

**The palette has two kinds of colour and they invert against each other.** `ORGANELLES`, `EXTRA_ORGANELLES` and `BASES` are fixed hexes; `ink` and `paper` move with the theme; and the five accents move the *wrong* way — `--coral` is a mid red on a light page and a light salmon on a dark one. So ink over a coral fill is 4.88:1 light and **1.95:1 dark**, paper over the same fill is 3.32:1 light and 7.26:1 dark, and **neither choice reads in both themes**. Ten live pairs across three published chapters came out of it, in `levels`, `scale`, `tree`, `homeostasis`, `bondlab` and `phlab`. The register has the table.

**Not one of them came from a fixed fill**, which is the opposite of what the shape suggests and is why the recommendation in `docs/work/2_rest-of-the-book/plan.md` is not to give those tables a theme variant. A fixed fill with a fixed label — which is what `MEMBRANE` and `src/figures/lib/chem-atoms.js` already carry, and what `gradient-battery` reads as `LIGHT[membranePart('pump').label]` — is the one pair in this palette that cannot invert. What failed was every colour that *does* move: a figure accent spent as 10 px type (3.07–4.36:1 in the light theme, six figures), and ink or paper written over an accent fill.

**The one thing this round could not close** is the element table's `label: 'paper'`. Measured against the palette's own values, paper on a `coral` disc is 3.32:1, on `water` 4.33:1 and on `gold` **2.26:1** in the light theme, all of them fine in the dark. It is live on published chapter 2 and the table is a contract chapter 4 is being written against right now, so it is four floored entries in the gate's `ALLOWED`, printed on every run, with the fix and its cost written up for the integration owner.

### The instrument was wrong three times before it was believed

Each was caught by looking at the frames the gate writes, never at its numbers, and each is now the comment above the code that fixes it.

- **Hiding the text hid the button.** `visibility: hidden` takes an element's background with it, so every pressed control read as paper-on-paper at 1.08:1 — a number about the page behind the button. The glyphs are repainted now, not hidden.
- **Restoring by `removeProperty` destroyed the author's paint.** `phlab` sets `style="fill:var(--ink)"` on its pH readouts; with the property removed they computed to the initial value, black, and the gate reported five readouts at **1.27:1** that the frame beside them shows in the ink. The inline value and its priority are saved and written back.
- **A figure that would not hold still.** `prokaryote` reported 1.06:1 for the word `run` because the cell had swum between the two frames: the background frame said `run`, the mask frame said `tumble`. The animation frame is stopped and every running animation finished before the frames are taken, and the DOM is read back afterwards to prove it held still. Asked directly, with `?t=0` and `requestAnimationFrame` stopped, `prokaryote` holds still in its opening state and after each of its eleven controls, so the pinned-clock invariant is intact and the four re-measurements it still needs per theme are a race in the gate's own press-and-measure sequence. The count is printed per figure so it cannot quietly become something else.

### The one that would have been invisible to any other design

A mask read off the figure's own frame is circular. Text the same colour as the fill under it changes no pixel, so the defect being looked for reports as *"this text draws nothing"* — which is exactly how `bondlab`'s δ+ at **1.00:1**, coral on its own coral oxygen, would have read as clean. The gate paints every measured glyph magenta to find out where the glyphs are, and only then reads what is underneath.

### Two things found on the way that are not about colour

- **A CSS rule beats an SVG presentation attribute.** Nine labels in `levels` asked for a colour with `text(…, { fill: C.paper })` and `.tb-levels svg text { fill: var(--ink) }` won every time. Three were live defects; the other six still render in the soft ink, still pass, and are listed in the plan because the author's intent is in the file and is not on the page.
- **`symbiont` threw on every load.** `const tw = tween({ … done: () => tweens.delete(tw) })` reaches `tw` inside its own temporal dead zone, because `tween()` runs `done` synchronously when it is instant — which is every mount under reduced motion and every gate that pins the clock. It is a `let` declared before the call now. No gate had reported it, because the page error only appears on a figure whose clock is pinned.

### The cost, and what moved it

The gate was 24 minutes before the control loop stopped addressing the toolbar by index. `polymer`, `secretion` and `gradient-battery` rebuild their toolbar when pressed, so a list counted once and addressed as `nth(i)` names indices that no longer exist and each one sits out its whole timeout: six figure-theme pairs at 184.8–187.0 s, all within 2.2 s of each other, which is a timeout signature and not work. The toolbar is re-read before every press and each control addressed by an element handle. **4 min 20 s** for the whole gate now, 9,631 glyph runs over 50 figure/theme pairs, no pair over 16 s.
