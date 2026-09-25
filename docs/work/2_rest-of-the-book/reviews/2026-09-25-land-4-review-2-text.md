# land-4, review pass 2 (text): the prose, banks, tools and docs that ship with chapters 7 and 8

Reviewer: `review-text`, independent and read-only. Written 2026-09-25.

## Revisions reviewed

| Ref | SHA | Role |
|---|---|---|
| `origin/main` | `237c96e` | base |
| `origin/land-4` | `97f1694` | integration; moved to `1824eea` during the review (see Limits) |
| `origin/figfix-ch07` | `300da5f` | shipping chapter 7 |
| `origin/figfix-ch08` | `e29f6a0` | shipping chapter 8; differs from land-4's chapter 8 only in Figure 8.3's `data-alt` and FIGURES.md |
| `origin/polish` | `feacf55` | merged into land-4 as `276f58a` |

At the end, `git ls-remote` showed main, figfix-ch07, figfix-ch08 and polish unmoved. land-4 had gained one commit, `1824eea`, which touches no prose, bank, tool or lesson.

Scope: the brief's priorities 1 to 5. These are the chapter 7 and 8 accuracy findings on the shipping text, the page checks and banks, three tool commits, the docs, and polish's other commits. The eight chapter 7 and 8 figure modules belong to the other reviewer. Their alt text, captions and FIGURES.md lines are covered here where the text makes a claim.

Method:
- I read diffs at the SHAs above.
- I ran the unit tests in a detached worktree at `97f1694`, with node_modules junctioned. The junction and the worktree are both removed.
- Two read-only subagents took the chapter 7 and chapter 8 findings lists, page checks and banks. I re-read each of their should-fix findings, and two of their nits, against the shipping text myself.
- I tried the landing's merges with `git merge-tree --write-tree`, which touches no worktree.
- Scratch evidence is under `scratchpad/review-text/`.

## Verdict

**No blocker. 0 blockers, 4 should-fix, 8 nits.**

- **Accuracy findings:** all 67 of chapter 7's and all 39 of chapter 8's are fixed in the shipping text, and none was declined. The chapter 8 fixer's one decline was not a numbered finding ("about 10–50" for human fork speed), and it is sound.
- **Page checks:** every one changed in chapters 1, 2, 6, 7 and 8 has a right key and no second right option. Each tests the same objective, and each explanation names options by what they say. The length claims in `b4effc6` and `21dd236` hold.
- **Banks:** every changed item in the chapter 7 and 8 banks, and 15 unchanged items from each, are sound.
- **Tools, docs and polish:** right, apart from two nits (N7 and N8).
- **One manual step for the landing:** land-4 and figfix-ch07 conflict in chapter 5 (SF1). The resolution is mechanical, but the wrong resolution is silent.

## Findings

### SF1 (should-fix). land-4 and figfix-ch07 conflict in chapter 5; a careless resolution drops polish's joins or the moved note

**Location.** `biology/ch05-energy-and-metabolism/index.html`: land-4 lines 207 to 215 against figfix-ch07 lines 207 to 215.

**What happens.**
- `git merge-tree --write-tree --name-only origin/land-4 origin/figfix-ch07` reports `CONFLICT (content): Merge conflict in biology/ch05-energy-and-metabolism/index.html`. That was trial tree `0504b36` at land-4 `97f1694`, and it is the same at `1824eea`.
- Figfix-ch07's `56bac8f` moves the margin note on motor proteins. It was before the "And onto a motor" paragraph (land-4:207) and is now after Figure 5.4 (figfix-ch07:213).
- Polish's `090da73` joined the paragraphs on both sides of the note, at land-4:209 and :215: `Section&nbsp;3.6`, `8&nbsp;nm`, the spaced dashes, `Chapter&nbsp;4` and the millimoles.
- `registry.js` and `drive.js` merge automatically.
- land-4 merges cleanly with figfix-ch08 (tree `f053366`, or `3ee33ca` at `1824eea`). The two figfix branches also merge cleanly with each other (tree `89652c3`).

**Failure scenarios.**
- Taking figfix-ch07's side of either hunk puts back an unjoined paragraph. "Section / 3.6", "8 / nm" or a line that starts with a dash then return on a phone. The chain stays green, because no gate sees a line break (the lesson of `1305f96`).
- Taking land-4's side of both hunks puts the note back before the figure, which undoes `56bac8f`.
- Keeping both sides duplicates the note.

**Evidence.** The note's line is byte-identical on main, land-4 and figfix-ch07 (its sha256 begins `27f6d19d85110e01`), and polish changed nothing else near it.

**Fix.** Keep land-4's text for both paragraphs, and put the note on its own line after the `</tb-figure>` of `fig-coupling`.

**Check.** After the merge, `git diff origin/land-4 HEAD -- biology/ch05-energy-and-metabolism/index.html` should show only the note's line, with its blank line, removed at 207 and added after the figure. `grep -c 'tb-margin-note">Not every case'` on the file should give 1.

### SF2 (should-fix). Chapter 7's q3 explanation prices the glycerol phosphate shuttle at 30 in a check about the old 38

**Location.** `biology/ch07-cellular-respiration/index.html:511` (q3's explanation), against `items.js:1520` (i-why-not-38-1).

**What happens.** q3 asks which assumptions produce the old 38: 3 ATP per NADH, 2 per FADH₂, and free export. Its explanation says the glycerol 3-phosphate shuttle "lowers the figure, to 30". On the check's own assumptions that shuttle gives 36, because glycolysis's two NADH enter at 2 ATP each instead of 3. 30 is today's figure for that shuttle, where malate–aspartate gives 32.

**Failure scenario.** A reader works out 38 − 2 = 36 and reads 30 on the page. In a sitting they then meet "36 for skeletal muscle" in i-why-not-38-1.

**Fix.** "to 36 on the old counting, 30 on today's". The key is unaffected.

### SF3 (should-fix). Chapter 7 says only complex I can empty the matrix's NADH, and its own bank says yeast has no complex I

**Location.** `index.html:340` says "complex I is the only thing that can empty the matrix's NADH in any quantity". The same claim is at `items.js:993`, `:1632` and `:1641`. It is contradicted by `items.js:1703` and `:1706` ("baker's yeast, whose chain has no complex I") and by `FIGURES.md:313`.

**What happens.** The claim holds for an animal cell. Baker's yeast empties its matrix NADH through Ndi1, a one-protein NADH dehydrogenase that pumps nothing.

**Failure scenario.** A reader meets both claims in one sitting, and nothing on the page reconciles them. The trace's conclusion still stands, because Ndi1 also feeds ubiquinone and stops when the chain does.

**Fix.** Scope the claim ("in an animal cell"), or name yeast's stand-in, at all four places.

### SF4 (should-fix). Figure 8.4's alt text puts the loss on the leading strand's end; the text and the bank put it on the lagging strand's

**Location.**
- The figure's side: `biology/ch08-dna/index.html:329` (Figure 8.4's `data-alt`, added in `9ad754a`) and `FIGURES.md:250` say "the one made by the leading strand is a tail's length shorter, the other has lost nothing".
- The text's side: the prose at `:319` says "the new strand is shorter than its template at that end, and every round of copying shortens it again". The key idea at `:333` and `glossary.js:80` agree with it.
- The bank's side: the why of i-end-replication-problem-1's leading-strand distractor, at `items.js:1752`, says "it is the lagging strand that falls short".

**What happens.** Each account is right in its own frame. The text describes the ends before the deliberate trimming, and the figure describes them after it (Lingner, Cooper and Cech 1995). `:319` says the ends are "trimmed deliberately" but never says which end takes the loss, so nothing on the page joins the two accounts.

**Failure scenario.** A reader steps through Figure 8.4 and sees the leading strand's end come out a tail shorter while the lagging strand's end loses nothing. A sitting then tells them that it is the lagging strand that falls short.

**Fix.**
- At `:319`–`:321`, add one clause: once both ends are trimmed, the lagging end's gap becomes part of its tail, and the net loss falls on the end made by the leading strand.
- At `items.js:1752`, change "falls short" to "cannot be finished".
- No key changes. The figure's drawing is the other reviewer's.

### Nits

**N1.** `ch07 index.html:328` says Section 7.8 is about an animal deciding "to pay all of it on purpose".
- §7.8 at `:417` now says "making almost no ATP". The bank's copy of this sentence (`items.js:1595`) says "almost all".
- Finding 28's fix did not reach this line.
- Fix: "almost all of it".

**N2.** `ch07 index.html:328`, `:464` and `items.js:1587` (the key of i-respiration-efficiency-2) treat the uncaptured energy as the whole "hundred-watt heater".
- At rest, the ATP that was captured is also spent and ends as heat, so the uncaptured part is between under half and two-thirds of the 100 W.
- The key is still the only right option.

**N3.** `ch07 items.js:1940` (i-uncoupling-2, rubric point 2) says "rises to its maximum", in a stem about a body.
- Finding 40 removed the same dish-versus-body overstatement from point 3 at `:1941`.
- The phrase at `:2104` is fine, because that stem is a suspension of mitochondria.

**N4.** `ch07 index.html:307` and `items.js:1376` and `:1491` now value the malate–aspartate shuttle's electrons at "almost the full 2.5" (finding 5's fix).
- The yield table at `index.html:318` still counts them at 2.5, for a total of 32, and so does `items.js:1495` ("a liver cell gets 32").
- The difference is rounding only. "about 32" would close it.

**N5.** `ch08 index.html:448` (q3's explanation) says "the dispersive scheme is ruled out only by the second" generation.
- The page rules it out at the first generation too, by heating the hybrid DNA: see `:162`, Figure 8.2's caption at `:167`, and point 6 of i-meselson-stahl-result-3.
- A reader who has just used the heat control is told "only".
- Fix: "by the bands alone".

**N6.** `ch08 items.js:1839` (i-telomerase-3's explanation) says "the cancers that lack it keep their telomeres by recombination".
- `index.html:327` and `items.js:1871` and `:1883` say "most of the rest".
- This is the accuracy review's own F33 wording, applied as written.
- Fix: "most of the cancers that lack it".

**N7.** `test/term-hold.test.js:243`–`:252` leave two of `heldRun`'s rules unpinned, and two mutants of `src/components/term.js` pass the whole file.
- **The mutants:**
  - M1, where a no-break space after glue counts as a break (`BREAKING_SPACE` = any whitespace), passes 8 of 8.
  - M5, where glue counts only as the run's first character, passes 8 of 8.
  - The pre-fix code and four other mutants all go red.
- **The two unpinned rules:**
  - A no-break space after glue is itself glue. The case is a word joiner, then U+00A0, then " — and", after "d". This should hold 3; M1 holds 1.
  - Glue after a held character still glues. The case is "s", then U+00A0, then "(DNA) and", after "m". This should hold 7; M5 holds 2.
- **Failure scenario:** a later edit that makes either change still passes `npm run unit`, and a term followed by such a run strands its mark again, which no gate sees.
- **The gap is latent today.** Across all 389 terms on the shipping pages of chapters 1 to 8, neither mutant changes a single held run.
- **gate-proofs.md:133** records its nineteen red arms truthfully. These two are mutants it did not try.
- **Fix:** add the two cases above.
- **Evidence:** `scratchpad/review-text/mut1/`: `mutate.mjs` and `mutate.log` for the mutants, and `probe2.log` and `probe3.log` for the cases and the page sweep. The restored `term.js` hashes to `0d49b5a528743e1c…`, the value gate-proofs.md records.

**N8.** The phosphate slider's accessible name is the two letters "Pi" (`src/figures/atp3d.js:715`, and the comment at `:723`–`:724`).
- **Failure scenario:** NVDA and VoiceOver read the mixed-case word "Pi" as "pie". A screen-reader user whose task goal says "phosphate" (`6c09b4f`) then hears "pie, slider".
- **Fix:** an accessible name such as "Pi, phosphate". It still contains the visible label, as label-in-name needs, and the drive recipe's `getByRole('slider', { name: 'Pi' })` still matches it, because Playwright matches a name as a substring unless `exact` is set.

## Per-finding verification

### Chapter 7 accuracy review (67 findings, at `300da5f`): 67 fixed, 0 declined, 0 not fixed

Figure notes 769–779 were skipped as briefed. Bare line numbers are `index.html`. Line numbers prefixed `items`, `glossary`, `objectives` or `FIGURES` are those files.

1. Fixed. :300 (the leak-corrected 2.5 and 1.5 are "close to" 2.7 and 1.6; ten protons out against 3.7 spent "do not divide evenly") and :302. Also :332, :463, :511, items:25–26.
2. Fixed. :302: the leak "takes its largest share when … spending little ATP".
3. Fixed. :324: "early, difficult measurements read as whole numbers". Also :511.
4. Fixed. :326 (34 % at standard prices, 56 % at the cell's; "not fair is to mix"). Also :328, :332, :464.
5. Fixed. :307 (the exchange is driven one way, inwards, and that proton is its only cost) and :308. See N4.
6. Fixed. :342 (scoped to the lactate and alcohol fermentations, with the bacterial extra ATP). Also :379, :465, glossary:59, objectives:334, FIGURES:105 and :119, items:22.
7. Fixed. :348 (Adh2 respires the ethanol later, with oxygen). Also :356, :379.
8. Fixed. :364 and :377: 15 kJ priced from NADH, and hydrogen "roughly doubles both figures". That checks: H₂ to methane is about 33 kJ, and H₂ to sulfate about 37 kJ. Also :379, :467, glossary:47 and :62, FIGURES:235 and :247.
9. Fixed. :216 (charges 4, 2 and 4, making 10) and :224 (193 kJ; complex III 39 against 41; complex IV 77 against 110). Also :232, :234, :377, FIGURES:235. The table's H⁺ column (4/0/4/2) agrees.
10. Fixed. The card at :435 (matrix NADH; the cycle stalls). Also :350, objectives:327.
11. Fixed. :403: two inhibitors are competitive, malonate with succinate and carbon monoxide with oxygen.
12. Fixed. :411 (the hypothesis could accommodate uncouplers, but not weak-acid protonophores). Also :385, :432, :447, :468, :533.
13. Fixed. :419: mitochondrial DNA diseases are maternal, nuclear ones Mendelian.
14. Fixed. :73: respires while the vat has oxygen, ferments once it is sealed.
15. Fixed at :340, as asked. See SF3 for what remains.
16. Fixed. :362: "one influential, though disputed, account".
17. Fixed. :129 ("an activating site of their own") and :132 ("levels are illustrative").
18. Fixed. :151 (both losses; the glyoxylate cycle). Also :456, glossary:34.
19. Fixed. :222 ("joins ADP to phosphate") and :499.
20. Fixed. :405: glutamate with malate keeps running; on pyruvate it stops too.
21. Fixed. :262.
22. Fixed. :218 and glossary:45.
23. Fixed. :222: "the three that pump".
24. Fixed. :230.
25. Fixed. :244.
26. Fixed. :276.
27. Fixed. :252 ("In isolated thylakoids … argued over") and objectives:95 ("mostly").
28. Fixed. :417 ("almost no ATP"; "Most newborn"; "a few degrees above freezing"). Also objectives:385, glossary:66–67, the card at :436. The residue at :328 is N1.
29. Fixed. :346 ("nothing lost as gas") and :348 ("at least nine thousand years").
30. Fixed. :360, :362, :379, :466.
31. Fixed. :367–373: the row reads "Nitrate → nitrite", and the note and column references at :377 follow it.
32. Fixed. glossary:30, :36, :40.
33. Fixed. items:1703 (yeast gets 16–20), :1706 ("about eight to ten times"), :1712.
34. Fixed. items:475, :485, :509, :517, and the header at :88–91.
35. Fixed. items:975, :1008, and the header at :18–20.
36. Fixed. items:1056 (+0.25 V) and :1063 (four charges, about one ATP).
37. Fixed. items:601, :619.
38. Fixed. items:1006 ("none of it goes straight into the CO₂") and :1014.
39. Fixed. items:360, :370.
40. Fixed. items:1941. Point 2 at :1940 is N3.
41. Fixed. items:1957 ("he must be cooled"), :1959, :1963 ("no antidote"), and the header at :72.
42. Fixed. "fast" added at items:1405, :1412, :1471, :1481, :1493, :1495, :1569, the header at :103, and :314.
43. Fixed. items:897: "about 95".
44. Fixed. items:55–57 (Bueno, Pinedo and Cava).
45. Fixed. items:301.
46. Fixed. items:1381, :1392–1397, :1413, :1428–1432, :1454, :1461–1463, :1555, :1562, and the header at :25–26.
47. Fixed, with 46. Also items:1544.
48. Fixed. items:1542, :1432.
49. Fixed. items:1572, :1577, :1601–1608.
50. Fixed. items:1491, :1492, :1494, :1497.
51. Fixed. items:1671–1675, :1687–1694, :1703–1712, :1837–1861, and the header at :22.
52. Fixed. items:1751–1761.
53. Fixed. items:1824, :1837, :1844, :1853–1861.
54. Fixed. items:988, :994, :998, :1632, :1638, :1894.
55. Fixed. items:1880: two are competitive, malonate with succinate and carbon monoxide with oxygen.
56. Fixed. items:1937, :1944, :1947, :1976, :1994, :2108.
57. Fixed. items:140, :166.
58. Fixed. items:993, :1632, :1641. See SF3 for what remains.
59. Fixed. items:1776, :1793.
60. Fixed. items:436, :447, :458–468. The key of i-…-3 is still right.
61. Fixed. items:568.
62. Fixed. items:926, :946, :961, :1307, :2010, and the header at :16.
63. Fixed. items:1880–1882, :1888, :1896.
64. Fixed. items:831, :865.
65. Fixed. items:2035, :2042, :2104.
66. Fixed. items:1754.
67. Fixed. items:1772, :1791, :1795, :1809, :1811, and the header at :27–28.

The joins in chapter 7 change no words. With U+00A0, `&nbsp;`, U+2060 and `&#8288;` normalised away, no word change in index.html, items.js, glossary.js or objectives.js is whitespace-only. Nothing in index.html or items.js names an option by its letter or place.

### Chapter 8 accuracy review (39 findings, at `e29f6a0`): 39 fixed, 0 declined, 0 not fixed

This agrees with the fixer's handoff. Bare line numbers are `index.html`.

1. Fixed. The parallel strands now "move" the lagging strand to the other fork. This is at :192, the alt text at :194, the caption at :195, and q4's explanation at :460. FIGURES has it at :12, :104, :205, :218, :223, :241 and :296. No either-change claim is left.
2. Fixed. :258.
3. Fixed. objectives:288.
4. Fixed. :402.
5. Fixed. :204.
6. Fixed. :311. No "1.65" is left anywhere.
7. Fixed. glossary:84. It agrees with the 17 % at :357 and with glossary:88.
8. Fixed. :200, items:932, :957.
9. Fixed. :382.
10. Fixed. :76 and :86, including the optional point 3b.
11. Fixed. :126, glossary:33, and the alt text at :106.
12. Fixed. :136.
13. Fixed. glossary:42.
14. Fixed. :299 and items:1601.
15. Fixed. :299 and items:1735.
16. Fixed. items:973 and :1001, plus a new rubric line at :1009.
17. Fixed. items:928, :932, :957, :1769. The generic "cannot start a chain" at items:925 and glossary:59 is acceptable at this chapter's level.
18. Fixed. items:558.
19. Fixed. items:540.
20. Fixed. items:361.
21. Fixed. items:712.
22. Fixed. items:730.
23. Fixed. items:1073–1074.
24. Fixed. items:1204.
25. Fixed. items:1255.
26. Fixed. items:1365.
27. Fixed. items:1393–1394.
28. Fixed. items:1480.
29. Fixed. items:1608.
30. Fixed. items:1702.
31. Fixed. items:1680 and :1688. The fixer also widened the objective at objectives:334. That goes beyond the ask but is supported by :307.
32. Fixed. items:1787.
33. Fixed as written. items:1839. See N6.
34. Fixed. items:2000–2001.
35. Fixed. items:2066.
36. Fixed. items:942–945.
37. Fixed. items:1624–1625.
38. Fixed. items:2016–2017.
39. Fixed. items:1534, :1541.

The optional rewording of "figure" to "number" was taken at items:1271, :1564, :1577 and :1923.

### Page checks

**Chapter 7, `21dd236`, at `300da5f`.**
- All keys are right, no distractor is also right, and each check tests its objective. The explanations name options by content.
- By length, the keys are now 2nd, 2nd, 3rd of 5, 2nd, and 3rd of 5, with markup stripped. At `db5f0ae` all five keys were the strictly longest option.
- On q3, see SF2.

**Chapter 8, at `e29f6a0`.**
- All five keys are right, no distractor is also right, and none is named by letter or place. On q3, see N5.
- The keys run 102, 58, 78, 115 and 73 characters. That makes them 3rd, 2nd, 3rd, 2nd and 3rd longest.

**Chapters 1, 2 and 6, `b4effc6`.** I checked each changed check against the key, the distractors, the objective and the explanation's references.
- **ch01 q2 (borderline-cases):** the key "no cells or metabolism of its own and reproduces only inside a host cell" is right. The size distractor is a true fact that is not the reason, which the explanation disposes of with "Size is not a criterion".
- **ch01 q4 (energy-vs-matter):** right.
- **ch01 q5 (pasteur-logic):** dropping "and microbes" leaves the key right, and the explanation's dust-carries-the-microbes point still fits.
- **ch02 q2 (ice-floats):** right. The three distractors are each wrong, and the explanation refutes the bond-breaking one.
- **ch02 q5 (denaturation):** right. The peptide-bond and sequence distractors are refuted by "the covalent backbone survives intact".
- **ch06 q1 to q5:** all right. Each explanation's paraphrase still matches its option's new wording: "light simply carries more energy", "a leaf reflects the green", "only one flash in four is bright enough", "acid switching the synthase on", "in the bundle sheath", "its speed" and "working hotter". The q4 distractor on either direction stays true but not what the experiment shows, and the explanation says so.
- **Length ranks:** the commit's ranks were recomputed, and they hold. ch01's q3 and ch02's q1 and q3 are left longest, by 3, 1 and 1 characters, as the commit says.

### Banks: changed items and samples

**Chapter 7:**
- 38 items changed in stem, options or key after the accuracy review, and all are sound. The other 23 changed ids changed only a `why` or an explanation, and are covered by findings 46 to 67.
- The bank statistics `c9b43fd` claims were confirmed: 77 multiple-choice items with keys at A, B, C and D 19, 19, 19 and 20 times, and the key strictly longest in 18 and strictly shortest in 18.
- Every item's objective exists.
- **Sample:** every 4th of the 59 unchanged ids, starting from the first (15 items), all sound. It is reproducible with `ch07agent/sample.mjs`.

**Chapter 8:**
- 32 items changed after `93b06d4`, 12 of them in stem, options or key, and all are sound.
- The bank has 120 items, 3 for each of its 40 objectives. The key is longest in 20, 2nd in 19, 3rd in 21 and shortest in 20, and sits in each position 20 times.
- **Sample:** every 6th of the 88 unchanged ids (15 items), all sound.

**Chapters 2 and 3, `3e013ac`:**
- 36 strings changed, holding 60 `<sub>` and `<sup>` runs, across rubric (10), question (4), option text (10), explanation (7) and why (5).
- Each one equals the old string with each Unicode super- or subscript run turned into markup: 0 mismatches, no super- or subscript characters left, and no keys or other fields changed.
- Today renders these strings through `fragmentOf`, which allows SUB and SUP (`mastery.js:1245`). It records the option's authored letter, not its text, so no stored answer changes.

### Tools

- **`d487747`, sound.**
  - `chapterLadder()` now reads a cell as a reader sees it. Tags are dropped and character references decoded. U+2060, U+200B and U+00AD are dropped, U+00A0 and U+202F read as a space, and an unknown reference throws, naming the cell (`tools/drive.js:204`).
  - It weakens nothing. The rung comparisons (atp3d at `:2953`, glycolysis at `:3984`) still fail on a renamed rung, which is the commit's own control.
  - The negative check at `:4000` (1,3-bisphosphoglycerate is not on the table) now compares decoded names. Before, an entity or a joiner in a name would have let it pass without comparing anything.
- **`36cbc2f`, sound.**
  - `heldRun` and `holdAfter` hold a no-break space, a narrow no-break space or a word joiner and what it glues on.
  - The unit file passes 8 of 8, and the pre-fix code is red (6 pass, 2 fail).
  - See N7 for the two rules it does not pin.
- **`66a3cca`, sound.**
  - P<sub>i</sub> is set as markup in HTML and as a subscript tspan in SVG.
  - The fix survives the merge. In the trial merge of land-4 `1824eea` with figfix-ch07, whose copies of `atp3d.js` and `coupling-bench.js` predate this commit, the only U+1D62 left in `biology/` and `src/` is in a comment (`glycolysis.js:122`).
  - The drive addresses the slider by the name "Pi". See N8.

### Docs

- **`e7a8bad`, gate-proofs.md:133, right.** The term-hold entry matches `redproof-s1.log` verbatim. Its index line is present, and the restoration hash (`0d49b5a528743e1c…`) matches.
- **`c7e4162`, defect-register.md:851, right.** The corrected row measures before and after `36cbc2f`. It says honestly that chapter 7's re-measure is owed until figfix-ch07 lands, and plan.md item 5 carries the same debt.
- **Lessons, right.** Each names the gate that retires it.
  - `3e1fff6` owes a figure sweep at an 800 to 860 px window. Its claim that the frame's narrow box starts below 800 px is right: `components.css:505` is `@media (max-width: 799.98px)`.
  - `5fa215b` owes a check of the hover background in flow's wrong-answer steps. Its claim holds: `tools/flow.js:426`–`:430` and `:569`–`:577` click a real option and assert only the classes, counts and text.
  - `1305f96` owes a width sweep of every page's prose.
- **`ef5e8d8`, right.** `docs/design/adaptive.md:117` and `mastery.js:650` now say the calibration is "spread across the book", which is what `calibrationSteps` does. It takes 6 objectives evenly down `byObjective`, and the banks load in source order.

### Polish and figfix-ch07's other commits

- **`6478436`, right.** `tb-check .tb-check__opt:hover:not(:disabled)` no longer outranks the verdict tints, and `check.js:114`–`:123` disables every option on answer.
- **`090da73`, right.**
  - I count 2,988 inserted join characters against the commit's 2,931 joins, and did not reconcile the gap.
  - No join is inside a `tb-term`, and none follows "Figure", so the checker's figure citations are untouched (it reads raw text; `check-content.js:209`).
  - One join is in a heading: `ch06:228`, "Chapter&nbsp;4's battery, charged by light". It is harmless: the shell numbers the section, and the heading still reads the same.
  - Nine joins are inside `data-why` attributes, which is right, because those are shown text.
  - In the JS no id, `objective`, `expect` or key changed. Only text fields changed: why, question, explanation, option text, rubric, goal, statement and definition.
  - Chapter 5's pump table keeps plain spaces, as the commit says.
  - Chapter 3's radius table now scrolls further at 390 px (457 px of content). The commit reports it, and below 800 px the table carries its own scroll by design (`typography.css:327`–`:340`).
- **`a2b3bc1`, right.** `Unit&nbsp;I` to `VI` on the contents page.
- **`f1a941b`, right.** Today's first sitting is a spread across the book. The on-screen words claim no more than the calibration does.
- **`6c09b4f`, right.** The ATP task's goal says "ATP, ADP and phosphate", because a goal is set as text and `<sub>` would print. The comments at `items.js:99`–`:101` keep Na⁺ and NAD⁺ precomposed for the same reason.
- **`feacf55`, right.** Chapter 2's bond lines stay with their formulas (13 joins), and no unjoined bond line is left in the book.
- **`56bac8f`, right in itself.** The note moved unchanged. See SF1 for the merge.

### Review 1's hand-over to this pass

- `krebs` is registered in the land-4 plus figfix-ch07 merge: once in `registry.js` and 20 times in `drive.js`, both merged automatically.
- Chapter 8's accuracy review is on land-4, at `docs/work/2_rest-of-the-book/reviews/2026-09-24-ch08-accuracy.md`.
- S1's re-measure is still owed for chapter 7, after figfix-ch07 lands, as the register and plan.md say. Chapter 8's prose at `e29f6a0` equals land-4's, apart from Figure 8.3's `data-alt`.

## Limits of this pass

- **Not re-read at the new tip.** land-4 moved to `1824eea` during the review. That commit changes only two chapter 3 figure modules (`prokaryote.js`, `surface-volume.js`) and adds a dated correction line to the wide-band probe report; the line matches the report's rows 55–56. Neither reviewer's brief as written covers chapter 3's figure code, so the coordinator should either assign a look at `1824eea` or record that it was not reviewed.
- **Gates run:** only `unit`, in the worktree. `npm run check` was not run on any merged tree. That is where a stray letter reference, a broken term or a figure-citation count would show, so the landing's chain must run it after SF1 is resolved.
- **Accuracy source:** the accuracy checks used the reviewers' knowledge of the subject and the chapter's own text. No OpenStax Biology 2e page was fetched in this pass.
- **Samples:** they were systematic (every 4th or every 6th unchanged id), not random. Both are reproducible from the scratch scripts.
- **Delegated work:** the chapter 7 and 8 per-finding lists come from two read-only subagents. I re-read SF2, SF3 and SF4, and N1 and N2, against the shipping text myself; the rest is their reading.
- **Line breaks:** no probe was run. N7's page sweep checks what `heldRun` returns, not how a line breaks.
