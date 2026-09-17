# Chapter structure, after the owner's second revision

## Later: the width, and one accepted cost

The owner then said *"You are not taking advantage of the full width the page, especially on desktop."* Measured, that was a defect rather than a preference: the column was a fixed 698 px at every width, so the wider the screen the smaller the share of it the book used — 55% at 1280, 48% at 1440, **36% at 1920 with 1,222 px dead**. It now grows on a ladder from 1100 px, and the 原文's character grid steps with it: 20 characters at 1280 and 1440, 24 at 1920, against 17 before. The largest gain is the 譯文, whose measure goes from 15 characters to 25 — at 15 a modern Chinese sentence was a column of fragments.

**The cost, and the cap it led to.** The plain prose of 背景 and 思考 ran **52–56 characters a line at 1920 px** on the shipped ladder — **45** of them Han characters — against a comfortable band of 28–36 and a practical ceiling of 40, so it was past the ceiling rather than at the top of the band. The count that says 52–56 is `out/widthgate/probe-prose.mjs`, which measures every non-space glyph; the 45 is the same lines counted for Han characters alone: `out/measure/probe-prose-han.mjs` walks one character at a time with a `Range`, groups the characters into line boxes by their rounded `top`, drops each paragraph's last line, and counts U+3400–4DBF, U+4E00–9FFF, U+F900–FAFF and U+20000–2A6DF as Han and U+3000–303F with U+FF00–FFEF as punctuation, which it reports separately for exactly this reason. The trade this section first recorded (43.1 at 1920, an earlier state of the ladder) was that one measure must serve every prose block, and `npm run devices` still requires them to share a pair of edges; what settled it was a cap on the line rather than a wider rung. `--prose-measure: 50rem` in §6b of `zj.css` covers everything a section holds bar the 原文/譯文 pair and the boxes the shared sheet widens — not the paragraphs alone — so a section keeps its one pair of edges, and it holds the prose at **36 Han characters a line on chapter 1 and 35 on chapters 2 and 3, with the worst line 38, identical at 1280, 1440, 1600, 1920 and 2560 px** (`out/remeasure/probe-prose-han.mjs`, an independent copy of the instrument above with the file's sha256 bracketed on either side of all fifteen loads; the two agree character for character, and the copy's control arms put the same counter at 31 Han under a 43.6rem cap and 45 with the cap removed), with the reading column and the 原文/譯文 pair untouched at 848 / 838.4 / 998.4 / 1014.4 px. **The lever of 56 rem was not pulled**: the top rung stays where the ladder left it, and the line was shortened under it.

An earlier measurement of this same paragraph said 48 characters; re-measuring gave 43.1, and the difference is worth remembering: a characters-per-line figure derived from a column width and an assumed advance is an estimate, and this one was 11% out. Both numbers belong to the ladder before the cap; the 45 above is not one of them, because it is counted off the rendered lines rather than derived from the column's geometry.

## The four sections, in this order

| # | id | heading | holds |
|---|---|---|---|
| 1 | `source` | 原文 | the citation, then the 原文 **paired with its translation** |
| 2 | `notes` | 字词 | the clickable cards, and nothing else |
| 3 | `history` | 背景 | everything the book says about the passage, figures included |
| 4 | `discussion` | 思考 | the checks and the sort |

The opener's contents list and the rail renumber to 1.1–1.4 (ch02: 2.1–2.4, ch03: 3.1–3.4). The shell numbers from the sections, so only the authored list needs changing.

## Section 1 — 原文, paired

The owner's words: *"Just put original text on the left and corresponding translation on the right."*

So the standalone 现代汉语翻译 section **is deleted**, and each 原文 sentence carries its translation beside it:

```html
<ol class="zj-src" data-corpus="zj-001-wei-lie-23">
  <li class="zj-pair">
    <span class="zj-pair__src" lang="zh-Hant">…原文, every character in <tb-char>…</span>
    <span class="zj-pair__tr">…译文…</span>
  </li>
</ol>
```

- **One `<li>` per corpus string**, as now, so `test/corpus.test.js` still compares the page against the corpus entry it names. The sentence grouping inside a `<li>` stays as it is (the corpus's own grouping, with `<br>` between 句).
- **The translation is split the same way** — one `<span class="zj-pair__tr">` per corpus string, holding that string's translation. The 107 existing `zj-trans__row` pairs in ch02 and the 16 in ch03 already carry this mapping; use them rather than re-translating. If a corpus string holds several 句, the right cell carries the translation of all of them, kept in the same 句 order.
- **`lang="zh-Hant"` on the source cell, `lang="zh-Hans"` on the translation cell.** The page declares `zh-Hans`, so only the Traditional half needs the mark — but state both, because a screen reader switches voice at the cell and the intent should be visible in the markup.
- Layout: two columns at desktop, **stacked sentence by sentence below about 900 px**, so on a phone the translation sits directly under the sentence it translates. That is the owner's choice and the repository's own rule is that a pairing a reader cannot see at once is not a pairing.

## Section 2 — 字词, minimal

The owner: keep it, but minimal. So it holds **only what a reader can click**: the chapter's characters and words as cards, plus at most one short line saying what the section is for.

**Remove from it:** any hand-authored table of glosses, any instruction paragraph beyond one line, and the `dl.zj-lex` list if a table duplicates it. Keep `<tb-glossary>` where it is used — the end-of-chapter word list — because that is a browsing surface, and every one of its entries must still be used as a `<tb-term>` somewhere in the chapter or `npm run check` fails.

**Rule:** if a line in this section is prose *about* the words rather than a word you can click, it goes.

## Section 3 — 背景

Unchanged in purpose, and the owner likes it. Everything interpretative lives here: the paragraphs moved out of 原文, the provenance notes, and the figures with their `图 N.M` citations.

Ch03's 字與詞 figure is the exception and stays in 字词, beside the list it belongs to — with its citation, since `npm run check` fails a figure no paragraph names.

## What this does not change

- The 原文 text itself, character for character. `test/corpus.test.js` compares it against the corpus and a single changed character is red.
- The script split: 原文 and 通鑑 quotations Traditional, everything else Simplified.
- The lexicon, the cards, the figures' behaviour, the chapter navigation.

## How to check it

- `node tools/check-content.js` — all four `tongjian/` pages `ok`. The one failure is `biology/ch03-cells … has no items.js`, another round's.
- `node --test --experimental-test-isolation=none "test/*.test.js"` — 118 of 118, and in particular `640 of 640` coverage, `1,405` `<tb-char>` resolving, and `8 of 8` 原文 blocks matching the corpus.
- **Generate the pairs rather than hand-editing them.** The corpus holds the sentences and the existing translation rows hold the mapping; a script that emits the new markup from the two sources cannot introduce a transcription error, and hand-editing 107 rows can.
- Load a chapter and look at it at 1440 px and at 390 px in both themes. Nothing may clip, overlap or scroll sideways, and the two columns must share one left and one right edge.
