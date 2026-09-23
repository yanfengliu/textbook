# Review 1: integration

## Target

The textbook project's Claude Code session transcripts on this machine: 125 transcripts (2 top-level sessions and 123 subagents), snapshot 2026-09-23 16:54Z, with the auditing session excluded and 6 subagents still running. Also read: the account's usage meter on 2026-09-23, the installed Claude Code builds (for the compaction setting), and main's Git history at `5e9c981` for the lines and bytes added. The question: what is taking up tokens and time, and what would save the most.

The transcripts are local files outside Git, and this record does not keep them, so the counts can be derived again only while those files survive. Main's history at `5e9c981` can be recovered.

## Reviewers and coverage

`cost-audit`, a read-only worker the coordinator dispatched; the handoff does not record its model. Lens: the owner's third question, "What is taking up tokens and time?". Access: the transcripts, the installed builds and the repository; its working files are in the session scratchpad's `cost-audit` folder. It tags claims MEASURED, READ or INFERRED, and weights tokens by API price ratios: fresh input 1, cache write 1.25 (5-minute) or 2 (1-hour), cache read 0.1, output 5.

Missing coverage: the auditing session itself, and the 6 subagents still running at the snapshot. The critic found a further gap (round 5, check 3): 19 commits on 09-17 that no transcript on this machine covers, so every total here is a floor. The cause of the Bash wait is inferred, not measured.

## Reports

### cost-audit

Scope: 125 transcripts (2 top-level sessions + 123 subagents; the auditing session excluded), snapshot 2026-09-23 16:54Z with 6 subagents still running. Weighted = API price ratios: fresh input 1, cache write 1.25 (5 m) / 2 (1 h), cache read 0.1, output 5. Raw totals (MEASURED): 12,856 API calls; fresh input 0.1M, cache writes 92.2M, cache reads 3,964M, output 16.5M (9.0M thinking) → 599.7M weighted.

Top five token sinks (overlapping cuts): 1. Re-reading context: cache reads 396.4M weighted, 66.1%; average call re-reads 315k tokens; 71% of calls above 200k; no subagent ever compacted (largest 859k); the coordinator compacted twice at ~970k. 2. Verification steps 52.1%: probe scripts 19.8%, gates 11.2%, screenshots 10.0% (2,526 image reads), waiting 4.3%, writing probe scripts or gates 6.9%; writing product files 15.1%, reading 19.9%. 3. Figure work 227.5M, 37.9% — 40 agents, 6 of the 10 most expensive. 4. The coordinator's own context 66.0M, 11.0% (session e14 averaged 530k tokens per call over 798 calls). 5. Rewriting expired caches 63.3M extra, 10.5% — 163 calls rewrote more than half their context; subagents cache for 5 minutes only; 51.5% of rewrites followed a gap over 5 minutes. Always loaded: the fixed start context is 18.4% of all context tokens; AGENTS.md alone 5.0% of weighted, the 94-skill listing 2.7%.

Ten most expensive subagents (weighted): gate-speed 21.8M; figs-ch02a 20.9M; ch08-prose second dispatch 18.3M (killed); figs-ch02b 18.0M (killed); figs-ch05b 15.2M; figs-ch04b 14.8M; figs-ch04a 14.7M; fixed-fill-contrast 12.8M; design-pass 11.6M; polish-ch02 11.4M (killed). By class: figures 37.9%, prose and items 21.2%, site code 9.0%, design 0.6%, gates/tools 12.6%, coordinator 11.0%, diagnosis 3.5%, reviews 1.8%, landing 1.8%, process docs 0.5%.

Top five time sinks: 1. Usage-limit lockouts 260.8 h, 74.7% of the 349 h since the first record — two weekly lockouts (114.2 h, 132.9 h) and four 5-hour lockouts (13.7 h); the textbook was 35% and 57% of the account's usage in the two locked-out weeks; on 09-23 the account used 70 points of the 5-hour meter and 18 of the weekly in 84 minutes, so a week's allowance lasts about 7.8 hours of work. 2. Model generation 60.2 h, 57% of 105.1 subagent-hours. 3. Bash 38.4 h, 36% of subagent-hours (69.0 h with background runs) — probe scripts 19.5 h, gate-related 16.3–40.1 h, wait loops 11.5 h; 16 of the 20 longest calls were gate runs or waits. 4. A fixed wait on every Bash call: p1 4.7 s, median 9.2 s, against Read's median 0.03 s — 10.1–12.0 h over 7,692 calls, ~10% of subagent-hours; cause INFERRED as the auto-mode safety classifier. 5. Work killed by limits: 33 agents (13 five-hour, 17 weekly, 3 Fable) — 21.0 agent-hours (20%), 114.4M weighted (19.1%); 23 re-dispatches cost 76.0M (12.7%), 19.1M before their first edit; only 6.4M was spent after a killed agent's last edit.

Product vs verification-and-process: by agent class 408.2M vs 110.5M = 3.7 : 1; by step writing product 15.1% vs verifying 52.1% + process docs 0.7% = 1 : 3.5; lines added on main 85,895 vs 30,226 (gates and tests 24,047, process docs 6,179) = 2.8 : 1; bytes on main 4.83 MB vs 2.33 MB = 2.1 : 1 (gate-proofs.md alone 394 KB).

Three changes that would save the most: (1) compact at ~250k instead of ~970k and restart the coordinator each round — installed builds contain CLAUDE_AUTOCOMPACT_PCT_OVERRIDE (READ; effect INFERRED); ceiling 16–28% of weighted, expected net ~10–15%. (2) Take the classifier wait off read-only Bash — allowlist read-only commands and use Read/Grep; saves ~6.6 agent-hours on 3,194 trivial calls, up to 10–12 h. (3) Shrink what every agent loads: AGENTS.md ≈ 20k tokens (28.2 KB → 53.7 KB since 09-10) reaching 119 of 124 agents; the skill listing ≈ 11k; together 7.7% of weighted; halving both saves ~3.8%. Explore agents start at 31.7k tokens vs 59.2k for a general agent. Other signals: gate re-runs on an unchanged tree 22 of 1,672 (0.4 h); most-read files local-rules.md (43 reads by 42 agents) and chapter-recipe.md (37 by 34). Open question: the 09-23 meter implies a weekly allowance of ~765M weighted while the locked-out weeks recorded 549M and 488M.

## Findings and disposition

The dispositions are the coordinator's, read off its synthesis in `../plan.md` (Outcome, parts 1–5 and 4(a)–(g), cited here as "synthesis 3" and so on); the critic's checks are round 5. "Not taken up" means the synthesis does not mention the finding; it is not a rejection. The recorder added no judgement of its own.

| ID | Finding | Disposition and reason | Repair or follow-up |
|---|---|---|---|
| F10 | 599.7M weighted tokens over 12,856 API calls in the 125 transcripts. | Accepted as a floor, per the critic (round 5, check 3): 19 commits on 09-17 have no transcript. Synthesis 3 says "at least 600M". | None. |
| F11 | Re-reading context is 66.1% of weighted tokens: the average call re-reads 315k tokens, 71% of calls are above 200k, no subagent ever compacted (the largest reached 859k), and the coordinator compacted twice at ~970k. | Accepted; synthesis 1 and 3. It is the ground for the cuts in synthesis 5. | The compaction threshold and a fresh coordinator per round are harness settings, pending with the owner. |
| F12 | Verification steps are 52.1% of weighted tokens (probe scripts 19.8%, gates 11.2%, screenshots 10.0%, waiting 4.3%, writing probes or gates 6.9%), against 15.1% for writing product files. | Accepted; synthesis 3. The critic (round 5, alternative (a)) advises taking the probe saving through restructured verification rather than by decree. | The coordinator's advice, synthesis 5: a ~3-minute core on each commit and the full chain when a chapter lands. Not started. |
| F13 | Figure work is 37.9% of weighted tokens (227.5M; 40 agents; 6 of the 10 most expensive). | Accepted; synthesis 3. It is the ground for the figure cap in synthesis 5. | The figure cap is pending with the owner. |
| F14 | The coordinator's own context is 11.0% (66.0M); session e14 averaged 530k tokens a call over 798 calls. | Accepted; synthesis 3. | A fresh coordinator per round is pending with the owner. |
| F15 | Rewriting expired caches cost 63.3M extra (10.5%): 163 calls rewrote more than half their context, subagents cache for 5 minutes only, and 51.5% of rewrites followed a gap over 5 minutes. | Accepted; synthesis 5 ("never leave a large-context agent idle past the 5-minute cache"). | The coordinator's advice. Not started. |
| F16 | What every agent loads: the fixed start context is 18.4% of all context tokens; `AGENTS.md` alone is 5.0% of weighted tokens and reaches 119 of 124 agents (≈20k tokens; 28.2 KB → 53.7 KB since 09-10); the 94-skill listing is 2.7%. | Accepted; synthesis 3. | Trimming `AGENTS.md` is pending with the owner; `AGENTS.md` names changes to itself as high-risk, so it needs independent review. |
| F17 | Usage-limit lockouts took 260.8 h, 74.7% of the 349 h since the first record (weekly 114.2 h and 132.9 h; four 5-hour lockouts, 13.7 h). At the 09-23 rate, a week's allowance lasts about 7.8 hours of work. | Accepted as corrected by the critic (round 5, check 3): the share is nearer 71%. Synthesis 1 names this the bottleneck, at 71–75%. | Whether to buy more usage, and one textbook session at a time, are pending with the owner. |
| F18 | A fixed wait before every Bash call — p1 4.7 s, median 9.2 s, against Read's median 0.03 s — costs 10.1–12.0 h over 7,692 calls, ~10% of subagent-hours. The cause is INFERRED as the auto-mode safety classifier. | Accepted as a measurement; synthesis 3. Nobody verified the cause. | The report's change (2), allowlisting read-only Bash, is not taken up (F20). |
| F19 | Work killed by limits: 33 agents, 21.0 agent-hours (20%), 114.4M weighted (19.1%); 23 re-dispatches cost 76.0M (12.7%). | Accepted; synthesis 3. | None beyond synthesis 5. |
| F20 | The three changes that would save the most: (1) compact at ~250k instead of ~970k and restart the coordinator each round; (2) allowlist read-only Bash and use Read/Grep; (3) shrink what every agent loads. | (1) and (3) are accepted into the coordinator's advice, synthesis 5. (2) is not taken up. | (1) and (3) are pending with the owner. (2) is open. |
| F21 | Open question: the 09-23 meter implies a weekly allowance of ~765M weighted, while the locked-out weeks recorded 549M and 488M. | Unresolved; not taken up. | Open. |

The report's other measurements — model generation at 60.2 h of 105.1 subagent-hours, Bash at 38.4 h, the ten most expensive subagents, the product-to-verification ratios, the most-read files and the 22 gate re-runs on an unchanged tree — are recorded as reported and carry no finding ID.

## Verification

The counts come from the worker's own parsing of the transcripts; its scripts and outputs are in the scratchpad's `cost-audit` folder, not in Git. The critic re-checked the lockouts against the limit messages (09-11 07:49Z and 09-17 13:05Z) and the main checkout's reflog (round 5, check 3), which is where the floor and the 71% come from. The recorder re-ran nothing.

## Round outcome

Accepted into synthesis 1 and 3, with the critic's corrections applied to F10 and F17. Changes (1) and (3) became part of the coordinator's advice and wait on the owner. Still open: the cause in F18, change (2) in F20, and F21. The round was read-only, so nothing was repaired in it.
