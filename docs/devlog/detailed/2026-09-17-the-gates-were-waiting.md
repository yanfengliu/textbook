# The gates were waiting, 2026-09-17

The chain was 68 minutes. It is 41, and the 41 is mostly one gate that is not mine.

## What was measured, and on what

A byte copy of the working tree at `d778606` plus the uncommitted tree of 2026-09-16 23:00, frozen in the scratchpad with `node_modules` junctioned in and its own `git init` so `tools/test.js`'s preflight had an index to read. Every arm ran against that copy, each gate as its own process with stdout and stderr on raw descriptors and no pipe anywhere, so an exit status is the gate's. Between the arms **only `tools/` moved**: `git status` over `src`, `biology`, `tongjian`, `test`, `today`, `index.html` and `lab` was empty before and after, which is the one thing an A/B needs and the one thing a working tree with four other workers in it will not give you.

| gate | before | after | |
|---|---:|---:|---|
| unit | 2.2 | 2.0 | untouched |
| check | 0.5 | 0.4 | untouched |
| shot | 145.4 | 95.5 | see the warning below |
| flow | 3.7 | 3.4 | |
| drive | 542.9 | **327.3** | −40% |
| sitting | 20.6 | 19.8 | |
| narrow | 95.3 | 79.7 | −16% |
| legible | 1451.8 | 1435.8 | not mine |
| devices | 1661.5 | **379.1** | −77% |
| sweep3d | 36.8 | 34.2 | |
| subpath | 115.6 | 106.6 | |
| **chain** | **4076.2** | **2484.6** | **−39%** |

Excluding `legible`, which this round did not touch beyond the shared cache: **2624.4 s → 1048.8 s, −60%**.

## The number in that table that is wrong, and why it is left there

`shot` 145.4 → 95.5 s credits this round with 49.9 s. The honest figure is **15.9 s**.

`shot`'s only change is that `openPage` now installs the external-request cache. So the cache was measured directly, with `NET_CACHE` as the only variable, on the same tree minutes apart: **cache on 91.9, 92.4, 96.2 s; cache off 105.9, 108.3, 108.9 s** (per-load sums over 66 loads). The cached arm won whether it ran first or second, so ordering does not explain it. The gap is 15.9 s at the median, −14.7%.

The other 32 s is the environment. The baseline's `shot` was **the first browser gate of a cold session**; every later comparison in the table ran warm on both sides, because `shot` is the third step and everything after it inherits a warmed DNS and CDN. The row is left as measured, with this paragraph beside it, because deleting a number that was really taken is worse than explaining it — and because it is the sharpest thing this round learned about its own instrument. *The tree held still and the environment did not.*

## `devices`: the cost was never the gate's own waiting

The brief pointed at the fixed sleeps. They were there — four 650 ms waits round the drawer, 300 ms after the fonts, 90 ms after each of about 1,400 glossary presses in a run. Converting all of them to polls bought **6%**: 193.7 s → 181.5 s on the same trimmed run.

Then one variable moved: the page loaded with `&t=0`. **181.5 s → 27.3 s, 6.6×**, with identical findings and identical counts on every load (31 terms, 45 prose blocks, 9 wide).

A chapter page mounts nine animated figures. Every Playwright action — `tap`, `click`, `scrollIntoViewIfNeeded` — runs actionability checks that wait for the element to hold still across animation frames, so all 1,400 presses were queueing behind a page doing continuous work. The gate was not waiting on purpose; it was waiting because the page would not stop moving.

**This is a cut and it is written as one**, in the tool's header and in its summary. One load per run stays unpinned — chromium, the smallest phone, a chapter page, because a figure whose box grows as it animates does its worst where there is least room — and the run prints `running: 1 of 62 load(s) …` so nobody reads the gate as covering animation across nine shapes. The rest of that crossing is gone: it now lives in `npm run flow`, which drives the same page unpinned through real input, and `npm run drive`, which runs all 36 figures unpinned. Nobody had chosen that crossing — `shot`, `narrow`, `sweep3d`, `legible` and `subpath` all already load at `t=0`, and `devices` was simply the last page gate that did not.

**It was also red before and is green now, and the two failures were not product defects**: `page.screenshot: Timeout 45000ms exceeded`, twice, on the tongjian book page. The gate's own message says that shape is the browser process not answering rather than a slow render. It was failing because it was slow, which is the canon line this round came from, stated by the gate about itself.

## `drive`: 215 seconds of sleep, and the three ways removing it goes wrong

`tools/drive.js` held **263.9 s of `waitForTimeout`** — half the gate. 48.9 s of it is left, and every second of that is named: a sleep survives only where the elapsed time *is* the measurement (a step whose claim is that something did **not** happen while time passed) or where it is letting an animation settle before the step's `out/drive/` screenshot, which is the frame a person looks at. One figure cannot be polled at all — `prokaryote`'s gram stain reports neither a clock nor a stain phase, and its `stain` field reads `'purple'` from the first of four stain steps, so a poll would leave during the crystal violet and stop proving that the thick wall holds the dye through the alcohol. Giving that figure a phase or a clock in `describe()` would take 11.4 s off the gate.

**591 assertions before, 591 after; 216 steps before, 216 after.** The only assertion text that changed is one message that named a seven-second wait that no longer elapses.

The conversion produced four regressions, and they are the useful part of the round. All four are now in `docs/policies/local-rules.md` under the sleep-to-poll rule:

1. **The sleep was doing a second job nobody wrote down.** `levels`' `arrow-right-on-range` went red the moment its sleep became a poll on `describe()`. The sleep had been waiting both for the figure to report the new level *and* for the figure to write that level into its `<input type=range>`. `describe()` publishes first; `ArrowRight` pressed on the instant it said `1` incremented a slider still reading `0` and landed back where it started. A poll on `describe()` cannot see this, because `describe()` is already right. Same shape from the other side in `plantcell3d`, where the label elements arrive a frame after `labels: true` does. Helpers: `atValue`, `atLeast`.
2. **The threshold a poll leaves at is not the threshold a sleep overshot.** `gradient-battery`'s tight-junction step polled for `glucoseRatio > 1.2` where the 6 s sleep had been reaching 1.30; without a tight junction the ratio floors at 1.114, so a 1.202 baseline could not give the drop of 0.15 the step then demands. Found by the coordinator, measured `1.202 → 1.114` against `1.203 → 1.114`.
3. **Polling for "stopped" without first requiring "started" is a coin toss.** In `tools/devices.js`, replacing the drawer's 650 ms sleeps with a stability poll produced six `tapping outside the drawer did not close it (x 0)` failures on loads that had passed for as long as that gate had existed — a press hands its work to the browser, the element has not begun moving for a frame or two, two reads agree at the origin, and the poll leaves holding exactly what the press was meant to change. Every one would have read as a product defect. The shape that works is *moved, then stopped*, and `settled` now **requires** its `from` argument rather than defaulting it, so the racy version cannot be written by writing less.
4. **A figure that is genuinely still moving cannot be caught still.** `cilium`'s readout and its `describe()` come from different moments even inside one `page.evaluate` — the text is the last painted frame, the description recomputes from the clock — and a beating cilium crosses a stroke boundary twice a second. "They always agree" was never true; the old sleep simply landed away from a boundary. The pair is now retried until it agrees, and a readout that is persistently wrong still fails because no try will match it.

## The network, and what it was actually worth

Every gate opens a fresh browser context per load (`browser.newPage()` makes its own), so chromium's HTTP cache was empty every time and the fonts and Three.js were re-fetched on all 66 loads of `shot`, 72 of `narrow`, 72 of `legible`, 48 of `subpath`. `tools/lib/net-cache.js` fetches each distinct external URL once per gate process and replays it from memory afterwards, keyed by URL **and** user agent because `devices` drives three engines in one process and Google serves them different stylesheets.

Worth **15.9 s on `shot`**, 130–250 ms a page load, tens of seconds over the chain. Nothing is written to disk, deliberately: a cache that outlived the process would let a run pass with the CDN down. What it stops proving is that a CDN URL is reachable on *every* page load — ten proofs a chain instead of about three hundred, of one string in one file. `NET_CACHE=0` turns it off, which is how it was measured, and every run prints how many URLs it fetched and how many it replayed, so a cache that silently did nothing reads as `0 replayed` rather than as a fast run.

The better argument for keeping it is not the 15.9 s. It is that the baseline's `shot` was 32 s slower than the same gate warm, entirely because of network weather — and a gate whose wall time swings 30% with the weather is a gate whose failures are harder to read.

## What was left alone, and why

- **`narrow`'s 500 ms after the press.** The claim is that the figure *stays* ready, so the elapsed time is the window in which a delayed failure would arrive. Shortening it is a weakening, not a fix. 36 s of the chain.
- **`polymer`'s stepper loops** (5.1 s). Converting them needs a per-click progress signal the figure does not clearly report, and a wrong conversion costs 5 s a click on a red run. Not worth the risk for 0.2% of the chain.
- **Every negative-assertion window** in `drive`: `pond`'s paused clock, `bilayer`'s, `water3d`'s idle count, `membrane3d`'s "nothing crosses", `prokaryote`'s untouched wall, `permeability`'s rate over a window. `permeability`'s was converted to a poll on the *figure's own clock* instead — same six seconds of exposure, but six seconds of the thing being measured, so a busy machine now waits longer rather than measuring less.
- **`devices`' derived matrix.** Already cut from 107 loads to 62 in an earlier round; no further honest cut was found. A chapter's glossary terms are not interchangeable between chapters — 31, 53, 71 and 57 of them, at different places on their lines — so the walk cannot be deduplicated across pages.

## `legible` is now the chain

1435.8 s, **58% of what is left**, and 1114 s of it is six figure-theme pairs at 184.5–186.5 s each while the other 66 are under 10 s. Reproduced across two independent full runs, every pair within 0.5 s of itself. `polymer`, `secretion` and `gradient-battery`, in both themes — the three figures with a Run/Play control.

The gate loads at `t=0`, so its pages start still. It then presses every visible button. If pressing Play makes a figure animate despite `ctx.pinnedTime`, every later action on that page inherits the slow actionability path *and* `census` starts retrying because the figure "would not hold still" — one cause, both symptoms, and the same mechanism this round found in `devices`. That is one probe away from being settled: press Play on `lab/?kind=polymer&t=0` and read `describe()` twice a second apart. If the clock moved, the `AGENTS.md` invariant — nothing advances on its own while `ctx.pinnedTime` is set — is broken in those figures, and it is a defect-register entry rather than a gate-tuning question.

Not chased here: `tools/legible.js` and those figures belong to another worker who was in the file.

## What the next person should know before touching a wait

Read `docs/policies/local-rules.md`, "A wait in a gate must poll the artefact, never the wall clock" — it now carries all four failure modes above. The one-line version: **poll what the next line touches, not only what this line asserts; a poll leaves at the threshold, not past it; require it to have started before you believe it has stopped.**
