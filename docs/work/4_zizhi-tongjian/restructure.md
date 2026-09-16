# Chapter structure, after the owner's second revision

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
