# Independent typographic review of the provenance mark — 2026-09-17

Read-only. The reviewer edited nothing outside `out/`, took its own measurements with two scratch probes (`out/review-mark/probe.mjs`, `probe2.mjs`, both deletable), and deliberately did **not** read the other worker's measurement table so that its own numbers are independent. It was asked to rule on the device, on the quiet containers, on the textual-note conflict, on whether 原文 and a context quotation should be distinguishable, and on anything else wrong with the mark.

Its report is summarised here with every number it measured and every spec it gave, because the next round implements from this file. Where it labels something a judgement call rather than a defect, that label is kept.

## What it verified first, by opening frames

- `out/inspect-acc1/…ch02-phone-dark-00-history-p-nth-of-type-8.png` — dark, 390 px, ch02 背景. 「魏、韓、趙共廢晉靖公為家人而分其地。」 is visibly smaller and greyer than the sentence carrying it. It reads as a quotation, not as a rendering accident.
- `out/inspect-acc2/…ch02-phone-light-00-history-aside-nth-of-type-1.png` — the note 「損其戶數」是故意把户口报少…: the run is a hair smaller and identically coloured.
- `out/inspect-acc3/…ch03-phone-dark-00-history-aside-nth-of-type-1.png` — the same for 「才有餘而德不足」.
- `out/inspect-acc4/…ch02-desktop-light-00-history-aside-nth-of-type-2.png` — the 異文 note is teal as a whole; the colour of the inner run is not resolvable by eye, so the finding there is settled **by measurement, not by the frame**.

## The measurements it took (probe 1, `?eager=1&t=0`, Chromium)

| context | run | parent | run colour | parent colour | mark selector matches |
|---|---|---|---|---|---|
| ch02 prose, 390 px | 16.72 px | 17.6 px | `rgb(92,85,77)` | `rgb(29,26,23)` | yes |
| ch02 prose, 1440 px | 18.24 px | 19.2 px | `rgb(92,85,77)` | `rgb(29,26,23)` | yes |
| ch02 `aside.tb-margin-note` | 15.2 px | **16 px** | `rgb(92,85,77)` | `rgb(92,85,77)` | yes |
| ch02 `aside[data-note="textual"]` | 15.2 px | 16 px | `rgb(92,85,77)` | `color(srgb 0.157569 0.442588 0.494902)` | **yes** |
| ch03 `p.zj-cite` | **13 px** | **11.52 px** | `rgb(92,85,77)` | `rgb(92,85,77)` | yes |
| ch03 `tb-check` option (5 runs) | 17 px | 17 px | `rgb(29,26,23)` | `rgb(29,26,23)` | **no** |
| ch03 `tb-check` question | 21.89 px | 23.04 px | `rgb(92,85,77)` | `rgb(29,26,23)` | yes |
| ch03 `tb-check .explain` (8 runs) | 16.15 px | **17 px, ink-soft** | `rgb(92,85,77)` | `rgb(92,85,77)` | yes |
| ch02 原文 cell, 390/1440 | 18 / 20 px | — | `rgb(29,26,23)` | — | **no** (51 runs, all unmatched) |

## Defects — each contradicts a stated rule, a stated number, or the design of record

1. **The rule does not reach five runs at all.** `src/components/check.js:74` builds each `<tb-check>` option as a `<button>` from the `<li>`'s innerHTML and `:82` replaces the original `<li>`s, so the runs sit in `button > span` inside `div.tb-check__options` and the rule's container whitelist `:is(p, li, aside, blockquote, figcaption, td, th, dd)` matches no ancestor. Measured on ch03 at 1440 px: **5 runs, matched 0, 17 px, full ink** — identical to the book's own words. Visible in one question: the quotation is marked in the question (`ch03:223`) and unmarked in the option that answers it (`ch03:228`). `tb-sort`'s items (`src/components/sort.js:116`) are the same hole waiting for the first sort card that carries a quotation, and `dt` in the lexicon list is a third. **Invisible to `test/provenance.test.js`, which reads markup and says so in its own header.**
2. **The `max()` floor's justifying measurement is false, and its only live firing inverts the mark.** The comment claims the floor holds a note's run at 13 px "at 390 px where 0.95em alone would give 12.4"; the note is **16 px at 390 px and at 1440 px, both themes**, so 12.4 px occurs nowhere and `--text-sm` is not in the note. Where it fires is ch03's `.zj-cite`: **13 px against the citation's own 11.52 px — a step up**, on the one line the design says carries the citation and nothing else. (It labels as a hypothesis that the false 12.4 came from reinvesting the floor's own 13 px as its input; the falsity of the measurement is certain.)
3. **A `data-note="textual"` run is repainted out of the note's 青.** Measured, and `matches()` is true, so it is the paint and not the selector. The note's colour is a statement about the note, and the run it repaints is the variant reading the note is about (「既已委質為臣」).
4. **The same "already-quiet container" defect as the note exists in `tb-check .explain`** (16.15 px against 17 px, both already `--ink-soft`) **and on the contents page's dek** — neither was in the acceptance pass.
5. **What the gate cannot see.** Everything here that is about *paint* rather than markup — 1, 3, 4 — is invisible to `test/provenance.test.js`: the markup says the run carries the mark and the shipped DOM disagrees. The reviewer's recommended whole-class check: **on the rendered page, assert that every `[lang="zh-Hant"]` inside `.tb-text` outside the excluded regions is matched by the mark rule and that its computed size or colour differs from its parent's.** That would have caught the options, the citation inversion and the textual-note repaint in one run, and it is the check it would add before this round closes.

## Judgement calls, with the specs it gave

6. **Invert the mark inside an already-soft container** — full ink at the container's own size, because "quieter" is unavailable and the book already has the lemma-is-ink device. Spec given for `.tb-margin-note` and `tb-check .explain`.
7. **Keep the note's colour in a textual note and mark by weight 500** — the page loads Noto Serif SC 200–900 and already spends 500 on head-words and glosses, so it is a mark that costs no colour.
8. **Keep the provenance mark binary.** 原文 and a context quotation do not look alike today (20 px full ink in a justified grid under the head rule, against 18.24 px soft inside prose); what a reader lacks is not authorship but *why this one is quoted rather than read*, and that is a citation question, not a third state of the mark — a third state would give one mark two meanings, which is the design's own argument against the underline. Recommended instead: a citation rubric for prose quotations (the device the card already hangs on its 通鑑用例), and one clause in the contents-page key.
9. **Leave the 引號 outside the marked run** — all 31 marked prose runs are `「<span lang="zh-Hant">…</span>」`, so the brackets are set at the surrounding size and ink. It would not change it: `lang` belongs to the text and the bracket is the book's punctuation, and closing the span around the marks would thin the boundary rather than sharpen it. If a worker does change it, it is a 31-run markup edit with no gate either way and should be said in the round rather than done silently.
10. **Leave the ≤1-character prose line growth.** The longest quoted run is 17 characters; each gives back 0.96 px, so the worst full line (38 Han) could reach 39 against the stated ceiling of 40.

## Already right, and it wants that on the record

11. **The device itself, and the result in body prose.** 5 % is enough against full ink; it would not enlarge it. `0.9em` is the only larger step it would consider and it recommends against it: below `0.885em` the quotation becomes smaller than the 譯文 (`1.0625rem` against `1.2rem`), i.e. a third body size saying the source is less than a translation of it.
12. **The 原文 is untouched** — 0 of 51 runs match; sizes, tracking, ink and the character grid are unchanged, so the design's claims about the grid hold.
13. **No baseline, leading or alignment defect** — unitless `line-height: 1.8` is inherited, the marked run's own line box shrinks but the line box is set by the surrounding text on any line that has unmarked text on it, and both sit on the same baseline.
14. **No new break opportunity and kinsoku unchanged** — the rule adds declarations only.
15. **Excluding `tb-figure` and `.zj-card` is correct and verified** — the figures' own quotes compute 14 px (年表) and 19.2 px (字词) by their own rules and are matched by nothing here.
16. **The mark is applied by a gate rather than by an author's memory**, and the gate states its own bound — the two things that made the change worth landing.

**One more bound worth recording, not caused by this change:** the sort cards print 通鑑's own vocabulary in Simplified and unmarked (`ch03:253-261`), because both the script rule and the mark's requirement are bounded by 「」. That is the gateway the owner's question came in through and it is still open.
