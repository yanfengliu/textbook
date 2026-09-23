# Review 2: integration

## Target

The `textbook` repository at `5e9c981`, run through all twelve steps of `npm test` in the worker's own worktree on 2026-09-23, 16:42–17:22 UTC (Node v24.18.1, 32 logical CPUs, with 4 chrome-headless-shell and 25 node processes already running), and compared against the 2026-09-17 baseline of 2484.6 s. Also read, with `gh`: the GitHub Actions record of `.github/workflows/ci.yml` — 46 runs, the last green one `34556241252` at `94815eb` on 2026-09-11, the latest `35823618314` at `5e9c981` — and of `.github/workflows/pages.yml` (run `35823618357`, deployment `6607237948`). The question: what the gates cost in time, and whether the remote gate works.

The tree can be recovered at `5e9c981`, and the Actions runs are on GitHub under the IDs above. The local run's logs are not kept.

## Reviewers and coverage

`gate-clock`, a read-only worker the coordinator dispatched; the handoff does not record its model. Lens: the time half of the owner's third question, from the gates' side, and whether the remote gate stands between main and readers. Access: it ran the gates in its own worktree at `5e9c981` and read Actions with `gh` as yanfengliu; its logs are in the session scratchpad's `gate-clock` folder.

Missing coverage: the machine was 72–100% busy with other sessions, so every time here is an upper bound. No CI run has reached steps 6–12, so there is no remote time or verdict for them.

## Reports

### gate-clock

All twelve steps green locally; the chain took 2180.4 s (36.3 min), 12% under the 2026-09-17 baseline; the remote CI gate does not work. Tree 5e9c981, own worktree, 2026-09-23 16:42–17:22 UTC, Node v24.18.1, 32 logical CPUs; 4 chrome-headless-shell and 25 node processes already running.

Steps (seconds, share, exit): unit 4.2, 0.2%, 0; check 1.3, 0.1%, 0; shot 175.9, 8.1%, 0; flow 38.2, 1.8%, 0; drive 513.4, 23.5%, 0; pinned 136.5, 6.3%, 0; sitting 27.0, 1.2%, 0; narrow 118.0, 5.4%, 0; legible 396.6, 18.2%, 0; devices 558.2, 25.6%, 0; sweep3d 48.2, 2.2%, 0; subpath 162.9, 7.5%, 0; total 2180.4. Against the 2484.6 s baseline (no pinned step then), today without pinned is 2043.9 s (−18%); the whole saving is legible (1435.8 → 396.6 s); every other step grew (devices 379 → 558, drive 327 → 513, subpath 107 → 163, shot 96 → 176, narrow 80 → 118, flow 3.4 → 38) because chapters 4–5 and 通鑑 ch02–03 landed since. Each log's verdict: 217/217 unit, 72 shot loads clean, 269 drive steps, pinned PASS, 67 device loads, 52 subpath loads.

Where the time goes: devices — tongjian/ch02 alone 166 s (30%; 172 glossary terms pressed on 6 shapes); biology/ch01 103 s over 9 loads; chromium 499 s over 59 loads, WebKit 41 s over 4, Firefox 18 s over 4. drive — six figures take 273 s (53%): membrane3d 63.5, activation-barrier 54.6, bulk-transport 47.7, bilayer 37.8, cilium 34.9, free-energy 34.2; worst step activation-barrier a-run-from-product-lands-on-the-same-ratio 48.6 s. legible — spread over 66 pairs; largest metabolic-map 25.7 s; the old ~185 s pairs are now 5.5–8.4 s. pinned — its time is its slowest shard (135 s vs 46 s; kinds dealt round-robin regardless of cost).

Caveat: mean CPU busy 72–100% during the steps; the runner's own tree used 0.9–3.2% of the machine while everything else used 53–90% (other Claude sessions' short-lived processes, Defender 7–11%, another session's headless chromium); these are upper bounds. On a 4-vCPU CI runner, shot took 135 s vs 176 s here.

CI (gh, as yanfengliu): the last 40 ci.yml runs all failed (2026-09-16 → 2026-09-23), all real red gates, none cancelled or timed out. 39 of 40 went red at shot in 117–255 s, all on biology/ch03 in all six loads with `<rect> attribute width: A negative value is not valid ("-0.5")` (and height "-0.6"); that page passes locally. The latest run (35823618314, 5e9c981) passed shot and flow and went red in drive after 763 s: `bilayer hot-enough-and-nothing-assembles: at 90 °C the jostling should win: micelle at t=8.033, 0.641 buried` (passes locally). 46 runs ever; last green 34556241252 on 2026-09-11 (94815eb); all 43 since failed. No run reached steps 6–12. Even all-green, CI could not finish: steps 1–5 used 16.2 of 30 minutes and steps 6–12 took 24.1 min here; ci.yml installs only chromium while tools/devices.js launches WebKit and Firefox with no fallback (line 537). Pages deployed 5e9c981 (run 35823618357, 21 s; deployment 6607237948 at 05:44:11Z); pages.yml does not wait for CI, so the site shipped 16 minutes before CI went red. legible does not visit 11 of 44 kinds and still reports green.

## Findings and disposition

The dispositions are the coordinator's, read off its synthesis in `../plan.md` (Outcome, parts 1–5 and 4(a)–(g), cited here as "synthesis 4(c)" and so on); the critic's checks are round 5. "Not taken up" means the synthesis does not mention the finding; it is not a rejection. The recorder added no judgement of its own.

| ID | Finding | Disposition and reason | Repair or follow-up |
|---|---|---|---|
| F22 | All twelve steps are green locally. The chain took 2180.4 s (36.3 min), 12% under the 2026-09-17 baseline, with devices at 25.6%, drive 23.5% and legible 18.2%. Legible's speed-up is the whole saving; every other step grew as chapters 4–5 and 通鑑 ch02–03 landed. | Accepted; synthesis 1 (gate wall time is not the bottleneck) and 3. | None. |
| F23 | The times are upper bounds: the CPU was 72–100% busy, and the runner's own tree used 0.9–3.2% of the machine while other sessions' processes, Defender and another session's chromium used 53–90%. | Accepted; synthesis 3. | One textbook session at a time is pending with the owner. |
| F24 | The remote gate does not work. The last 40 `ci.yml` runs failed, 39 of them at shot on biology/ch03's negative `<rect>` width and height (-0.5, -0.6), a page that passes locally; the latest (`35823618314`, at `5e9c981`) failed in drive on bilayer at 90 °C. All 43 runs since the last green one on 2026-09-11 failed, and none reached steps 6–12. | Accepted. The critic (round 5, check 2) confirmed 46 runs, 3 green and 43 red, and that "39 of the last 40" holds. It corrected a reading of this as "all 43 failed on the chapter-3 rect": `6d854cf` failed the content check. Synthesis 4(c). | None in this round. |
| F25 | CI could not finish even if every gate were green: steps 1–5 used 16.2 of its 30 minutes, and steps 6–12 took 24.1 min here. `ci.yml` installs only chromium, while `tools/devices.js` launches WebKit and Firefox with no fallback (line 537). | Accepted; synthesis 4(c). | The coordinator's advice, synthesis 5: a CI that fits and blocks the deploy. Not started. |
| F26 | `pages.yml` does not wait for CI: the site shipped `5e9c981` 16 minutes before CI went red. | Accepted; synthesis 4(c). | As F25. |
| F27 | legible does not visit 11 of 44 kinds and still reports green. | Accepted; synthesis 4(f). | None in this round. |

Where the time goes inside devices, drive and legible, and pinned waiting on its slowest shard (135 s against 46 s, because kinds are dealt round-robin regardless of cost), are recorded as reported and carry no finding ID; the synthesis does not take them up.

## Verification

The worker ran the full chain once and read each step's log for its verdict: 217/217 unit, 72 shot loads clean, 269 drive steps, pinned PASS, 67 device loads, 52 subpath loads. Its logs are in the scratchpad's `gate-clock` folder, not in Git. The critic re-checked the CI record with `gh` (round 5, check 2). The recorder re-ran nothing.

## Round outcome

Accepted into synthesis 1, 3, 4(c) and 4(f). The CI findings, F24–F26, stay open and material: main deploys on every push while its remote gate has been red since 2026-09-11. The round was read-only, so nothing was repaired in it.
