# 《资治通鉴》 — design of record

The second book in this library: 司马光's 资治通鉴, read as the original classical Chinese beside a modern Chinese translation, with every 字 and 词 in the original opening a card that gives its reading, its meaning here, and how the book itself uses it elsewhere.

Companion to [textbook.md](textbook.md) (the book's design), [chapter-recipe.md](chapter-recipe.md) (how a chapter is built) and [adaptive.md](adaptive.md) (the study system). Where this document differs from the recipe, the difference is stated and the reason given.

Status: **prototype built**. Decisions marked **[owner]** came from the owner's request.

## What the owner asked for **[owner]**

*"Start a new textbook that provides the original chinese version of 资治通鉴 and its modern translation. If I click on any 字 or 词 it should give me the meaning and examples of how it is used. Do a few chapters as prototype. Do it in a way that minimizes interferences with other ongoing work for other textbooks in this repo. Only commit what you or your subagents changed."*

## The one architectural idea

The lexicon is the book, not an appendix to it.

A translation tells a reader what a passage says. It does not teach them to read it. What teaches them is a gloss on the character in front of them, in the position it holds, with another place in the same book where it does something different. 资治通鉴 is 294 volumes of one author's Chinese, and it is the best corpus in existence for its own vocabulary — so the examples a reader gets are not dictionary sentences written for a textbook. They are 通鉴 sentences, dated, with the book's own voice.

That has a structural consequence, and it is the whole design: **the original text is the primary object on the page, and the translation is set beside it rather than above it.**

```
原始文字          智宣子將以瑤為後
現代漢語翻譯      智宣子打算立智瑤為繼承人。
```

Everything else follows from that. The lexicon is per-character and per-word, keyed to the character, reachable from the text and browsable as a list. The prose sections exist to give the reader the history the passage assumes. The figures let them push on the thing the passage is about — the partition of 晋, the chronology, how two characters become one word.

## The prototype's scope

Three chapters, all from 周纪一 — the opening of the whole work, which is also its most quoted passage and the one a Chinese reader is most likely to have met.

| # | Chapter | The passage |
|---|---|---|
| 1 | 三家分晉 | 威烈王二十三年，初命晉大夫魏斯、趙籍、韓虔為諸侯 — the 通鑑's first entry, and the act 司马光 chose to begin with |
| 2 | 智伯之亡 | 智宣子立瑤，智伯請地，晉陽之戰，三家滅智 — the long narrative the first entry hangs on |
| 3 | 才德論 | 臣光曰：智伯之亡也，才勝德也 — the commentary that gives the opening its argument |

They are consecutive in the source and share a cast, so the prototype is one continuous reading rather than three samples.

### Four things the sources say that this book must not get wrong

Found while verifying the text, and each one is a way a plausible book would be wrong. They are here rather than in a footnote because they govern what the chapters may assert.

1. **Our chapter order is not 通鑑's.** In 卷001 the sequence is: the opening entry and the 禮論 臣光曰; then 智宣子立瑤 through 盡滅智氏之族，唯輔果在; then the 才德論, continuous with it and separated by nothing; then 豫讓 and the succession notices. Chapters 1 to 3 read 三家分晉, 智伯之亡, 才德論, which is a teaching order — narrative first, argument after. The book says so, in the chapter that reorders, so a reader never takes our sequence for the author's.
2. **豫讓's famous scene is not in 通鑑.** 「豫讓拔劍三躍，呼天擊之」, the robe, the suicide — that is 《史記·刺客列傳》. 通鑑 compresses the whole encounter to 「襄子出，豫讓伏於橋下。襄子至橋，馬驚，索之，得豫讓，遂殺之。」 A chapter may tell the story, and must attribute every part 通鑑 does not carry to 史記. It may not put those words in quotation marks as 通鑑's.
3. **「三家分晉」 is a later writer's label and is not a string in the book.** What the text says is 「初命晉大夫魏斯、趙籍、韓虔為諸侯」, 「剖分晉國」 in the 禮論, and 「三家分智氏之田」 — which is 智氏's land, not 晉's. The chapter uses the name and says whose name it is.
4. **避諱 is why the text reads 田常 and 常山.** 司馬光 avoided 宋真宗 趙恆's name, so 田恆 became 田常 and 恆山 became 常山. A reader who does not know this will read a taboo substitution as the original wording, or "correct" 常山 back as if it were the innovator. The 背景 section says it once, plainly.

One claim in an earlier draft of this document was wrong and is recorded here so it does not come back. It described a 「通鑑三家注」 tradition. There is no such thing: two independent searches found no source for it, the term belongs to 《史記》 where it names 裴駰集解、司馬貞索隱、張守節正義 exactly, and the sources give *more* than three early 通鑑 commentaries rather than three — 胡三省's 序 names 劉安世《音義》、史炤《釋文》 and a 司馬康《釋文》 whose authenticity he doubts, and the 四庫 提要 names five. What the book may describe is what is attested: 胡三省《音注》 with 陳仁錫 評閱, plus 司馬光's own 《考異》 and 《目錄》. The provenance record keeps the refutation rather than the claim, because a claim a book makes about its own sources is the one a reader cannot check.

The verification behind each, with URLs and the variant readings, is in `out/tongjian-recon/sources.md` at the time of writing; what enters the repository is the corpus and the `tongjian/README.md` provenance record.

## Where the files live

A book directory at the repository root, exactly like `biology/`:

```text
tongjian/
  index.html                    the book's contents page
  zj.css                        this book's own stylesheet, scoped under .zj
  lexicon.js                    every 字 gloss, keyed by hanzi   (generated; see below)
  words.js                      every 词 gloss, keyed by word
  README.md                     what the book is, and how the lexicon is maintained
  ch01-san-jia-fen-jin/
    index.html                  the chapter: prose, 原文, 译文, 字词索引, figures
    glossary.js                 the terms the chapter introduces
    chars.js                    which hanzi of this chapter use which lexicon entry
    objectives.js               the claims a reader should be able to make
    items.js                    the review bank
  ch02-zhi-bo-zhi-wang/ ...
  ch03-cai-de-lun/ ...
src/figures/
  zj-split.js  zj-timeline.js  zj-words.js    three figure modules, registered in registry.js
src/components/term.js                       gains <tb-char>, beside <tb-term>
```

`chNN-<slug>/index.html` is what makes the four page gates find the book, which is the mechanism local-rules already requires. The slug is pinyin: a directory name is a path, and a path that is Chinese is a URL that has to be percent-decoded by anything that shares it.

## The lexicon

### Two layers, and why

**`tongjian/lexicon.js` — 字.** One entry per character, holding every meaning that character carries in 通鉴, each with an attested 通鉴 sentence. This is the shared layer: a character has one entry however many chapters use it, so two chapters cannot disagree about what 為 means.

**`chNN/chars.js` — which entry, and which use.** A chapter declares the set of characters it puts on the page and, where it matters, which sense the passage takes. This is the per-chapter layer, and it is small.

```js
// tongjian/lexicon.js
export const LEXICON = {
  '為': {
    pinyin: 'wéi',                                            // the reading in this use
    pos: '動',
    uses: [
      { id: 'wei2-become', gloss: '成為；做', note: '通用義。',
        examples: [{ text: '魏斯、趙籍、韓虔為諸侯。', at: '周紀一' }] },
      { id: 'wei2-for',    gloss: '為了；替', note: '讀 wèi。',
        examples: [{ text: '將以瑤為後。', at: '周紀一' }] },
    ],
  },
  …
};

// ch01-san-jia-fen-jin/chars.js
export const CHARS = {
  '為': { use: 'wei2-become', in: ['「初命晉大夫魏斯、趙籍、韓虔為諸侯」'], word: ['為後'] },
  …
};
```

An entry may carry `readings` for a character whose reading the passage cannot settle from the text alone, and `variants` for 異體字. A character whose uses in 通鉴 are not attested by a source the worker could fetch carries **no** `examples` and says so in `note`; it never carries an invented one. That rule is the difference between a lexicon and a plausible-looking pile of fiction.

**`tongjian/words.js` — 词.** One entry per word, keyed by the word as it appears:

```js
export const WORDS = {
  '大夫': { pinyin: 'dà fū', pos: '名', gloss: '官名。諸侯之下、士之上的爵位。',
            note: '通鑑此處指晉國三家之祖的官職。',
            examples: [{ text: '公、侯、卿、大夫是也。', at: '周紀一' }] },
};
```

### Rule 5, and the one place it cannot hold

A card's example must not be the sentence the reader is looking at. The rule is mechanical and gated where it can be: `test/corpus.test.js` requires that for a chapter whose 原文 is a single 句, no entry's example is a substring of it, and it was proved red by putting the opening line back as 初's example.

**Where it cannot hold, stated rather than hidden.** Over one continuous reading, most characters occur in the very passage that would show them, so a *shared* lexicon cannot give every entry an example from elsewhere — 722 of the book's examples are drawn from the text of the chapter that displays them. The reader's experience of the rule is nevertheless the right one, because `chars.js` binds each character to the sentence it actually occurs in and the card's 在這一章 section shows that sentence beside the example: a reader clicking 為 in 「初命晉大夫魏斯、趙籍、韓虔為諸侯」 sees 「魏斯者，桓子之孫也，是為文侯。」 as the 通鑑用例 and their own sentence under 在這一章. What is forbidden is the *same sentence in both places*, and that is what was found and fixed — fifteen uses across fourteen entries had the reader's own line as their only or first example, which taught nothing and, for 為, printed one sentence twice and made the card scroll.

### How a character on the page finds its entry

A one-character word is a 字; anything longer is a 词. Both are the same element with the same card, because from the reader's side there is one gesture and one question:

```html
<tb-char>智</tb-char><tb-char>宣</tb-char><tb-char>子</tb-char>
<tb-term ref="wei-si" word="大夫">大夫</tb-term>
```

- `<tb-char>智</tb-char>` — the character's own text is the lookup key, one character. In chapter 1 every character of the 原文 is wrapped in one, which is what "click on any 字" means.
- `<tb-term ref="…" word="大夫">大夫</tb-term>` — a 词, keyed by the `word` attribute; it also serves as the chapter's glossary term, so one element carries both the word card and the reading term.
- A repeated character inside one chapter may point at the first card with `<tb-char for="…">` when it is a variant spelling, and otherwise stands alone.

### What the card shows

```
┌───────────────────────────────────────┐
│ 為  wéi  動                            │
│ 成為；做                                │
│ 通用義。                                │
│ ── 通鑑用例 ──                          │
│ 魏斯、趙籍、韓虔為諸侯。  周紀一          │
│ ── 在這一章 ──                          │
│ 初命晉大夫魏斯、趙籍、韓虔為諸侯          │
│ 詞 · 為後                               │
│ 本章字詞 →                              │
└───────────────────────────────────────┘
```

Every field is optional except the gloss, and a field with no data is absent rather than empty. The section headed 在這一章 is built from `chars.js`, so the card tells the reader where else **this chapter** uses the character, which is the question a learner actually has. Its link goes to the chapter's own 字詞 section — not to an index on the book's contents page, which does not exist and which a cross-document fragment would not be checked against.

### The corpus: grounding that is checked, not promised

A page of classical Chinese is the easiest thing in the world to produce plausibly and wrongly. A language model asked for 资治通鉴 will return fluent text with substituted characters, and a substituted character in a quotation is a false citation that a reader cannot detect. So provenance is not a note in a document here. It is a **tracked file the gates read**.

**`tongjian/corpus.js`** holds the passages the book quotes, one entry each, exactly as fetched:

```js
export const CORPUS = [
  { id: 'zj-001-wei-lie-23',
    work: '資治通鑑', juan: '卷一 周紀一', section: '威烈王二十三年',
    url: 'https://…', fetched: '2026-09-11', verifiedAgainst: ['https://…'],
    note: '兩處來源在此字上有異文，採用…',
    text: ['初，命晉大夫魏斯、趙籍、韓虔為諸侯。', '…'] },
  …
];
```

Boundaries, stated because a file like this invites overreach: the corpus is **not** an edition of 通鑑, it is the set of passages this book quotes, and it covers only 周纪一. It is a verification fixture, and the fleet's size ceilings apply — it is text, it is a few tens of kilobytes, and it is nobody's property: 資治通鑑 is a Song dynasty text and its punctuation and collation are the only editorial layer, which is why the collation source is named per entry.

From that one file follow four rules, all of them tests:

1. **Quotation is verbatim.** Every 原文 block, every 通鑑 example in the lexicon, and every passage in the prose is a substring of the corpus, character for character, including punctuation. A quotation that is one character different is a red gate, and the failure names both strings. `test/corpus.test.js` holds this, and it is the check that makes the rest of the book safe to write quickly.
2. **The transcription is verified twice.** Each entry names a second URL, and the worker compares the two character by character; where they disagree the entry carries a `note` giving both readings and which was taken. An entry whose `verifiedAgainst` is empty is a fail, so "I fetched one source" cannot pass as verification.
3. **The corpus is what the chapters read from.** A chapter's 原文 is not a second hand-typed copy: the page's text is compared against the corpus entry it names. Two copies of one passage is exactly the drift this design exists to prevent, and `figureInfo`-style naming (`data-corpus="zj-001-wei-lie-23"`) makes the page say which entry it is quoting.
4. **Nothing outside the corpus is quoted as 通鑑.** An example that is not in the corpus is not a quotation, it is a sentence someone composed, and the test fails it. Where a character genuinely has no second attested use in the corpus, the entry says so in `note` and carries **no** example — an honest gap, which is worth more than a filled one.

Every gloss, note and translation sentence is **authored content and is reviewed as content**. The corpus test proves the text is real; it cannot prove a gloss is right, and that is what the independent review in the plan is for.

**Model output is a draft, and is labelled as one until it is checked.** The fleet authorises runtime model calls, so a worker may use one to draft glosses at speed. What may not happen is a draft reaching `lexicon.js` without passing the checks below, all of which run as unit tests over the data:

1. **Every character of every 原文 has an entry.** The test walks each chapter's `index.html`, extracts the text of `.zj-src`, and fails on a character with no entry. A page cannot quietly stop annotating half a passage.
2. **Every entry is complete.** Each use has `id`, `gloss` and `note`; each example has `text` and `at`; every example's `text` is verbatim from `tongjian/corpus.js`.
3. **Every 通鑑 quotation is verbatim.** Covered by the corpus rules above: a composed example is a red gate, not a style question.
4. **Every example's `at` names a 卷 the corpus covers.** A 卷 the book cites exists in the corpus.
5. **No example is repeated as its own source.** A character's example must come from a different passage than the one the reader is on, or the entry says why in `note`.
6. **Pinyin carries its tone, and a 多音字 with two readings has `readings`.** A single pinyin on a character the corpus uses with two readings is a fail.

Bound, and stated in the test header: the checks prove the quotations are real and the data is complete. They cannot prove a gloss is *right*, which is what the independent review in the plan is for, and the reviewer reads both.

## Language, and which script belongs where

The book sets two scripts, and which one appears where is a rule rather than a habit:

| Where | Script | Why |
|---|---|---|
| The 原文, and every quotation from 通鑑 | **Traditional** (繁體) | It is the book's text. Printing it in Simplified would be a silent editorial change to a Song work, and the vocabulary is not always the same word. |
| The 譯文, 背景, 思考, headings, the chapter's own prose | **Simplified** (簡體) | The modern reading layer, in the script a modern reader reads most easily. |
| A card's `gloss` and `note` | **Simplified** | They are commentary about the text, not the text. |
| A card's 通鑑用例 | **Traditional** | It is a quotation. |

**What the page declares.** `<html lang="zh-Hans">` because the book's own voice is Simplified, and **`lang="zh-Hant"` on every element that carries Traditional text** — the 原文's blocks, the quoted sentences in a card, and a figure that quotes the text. `lang` is what a screen reader uses to pick a voice and what the browser uses for line breaking, so a page that declares one script while printing both is a page that reads the text wrongly aloud. A reviewer found exactly that: `zh-Hans` everywhere with `zh-Hant` only on the card's glyph.

## The type system, and the bar it is held to

The owner's standing directive — *"Use beautiful typography and UI design. Do not settle for anything that is less than supreme quality"* — outranks throughput here as it does everywhere in this repository. So this section is not a description of what the page happens to look like. It is the set of decisions the page is judged against, each with a reason, because a decision without a reason is a browser default and defaults are not design.

**The book does not inherit the biology book's type system.** That system is Latin: Fraunces and Newsreader on a 1.2 modular scale, old-style figures, a drop cap, small caps, negative tracking. Every one of those is wrong for a Song-style Chinese page, and a Chinese page that merely falls back to a system font is the exact defect [i18n.md](i18n.md) measured at 110 of 110 glyphs. So `tongjian/` carries its own families, its own scale and its own spacing, and `zj.css` sets them under `.zj` alone — no `:root` token, no global selector, nothing that can reach another book.

| | Family | Size | Leading | Reasoning |
|---|---|---|---|---|
| 原文 body | Noto Serif SC 400 | 1.25 rem | 2.0 | The primary object on the page. A full-width ideograph already reads larger than a Latin letter at the same size, so the step above the Latin body size is small and the leading does the work: a classical page is read character by character down a column, and 2.0 is where that stops being a grey slab. |
| 原文, quoted inside prose | same, 0.95 em, `--ink-soft` | — | — | A quotation inside an argument should read as a quotation. |
| 譯文 | Noto Serif SC 400 | 1.0625 rem | 1.85 | Deliberately a step *below* the original, in `--ink-soft`. It is an aid to the original, and a translation set at the same size and colour as the text it translates is a translation the reader reads instead of the original. This is the single most consequential size decision in the book. |
| 字詞卡 glyph | Noto Serif SC 500 | 2.2 rem | 1 | Large enough to be examined stroke by stroke. It is the thing the reader clicked. |
| Rubrics (卷次, 項目, 圖 n) | Noto Sans SC 500 | 0.72 rem, tracked .16em | — | Chinese display type is Hei, and 疏排 is the Chinese rubric device as small caps is the Latin one. `text-transform: uppercase` is a no-op for Han and is not used. |
| UI and controls | Noto Sans SC 400–500 | 0.8125–0.9375 rem | — | A Song face at 11–13 px loses its horizontals on screen. |
| Latin inside Han | the Han face's own Latin | — | — | Units, pinyin, dates. Drawn by a Latin face they sit on a different baseline at a different weight, which is what makes mixed Chinese pages look assembled rather than set. |

**The character grid.** The 原文 is set so that a line holds a whole number of characters and the columns line up down the passage: `letter-spacing` plus `text-align: justify` with `text-align-last: left`, tuned against the rendered measure, not guessed. A classical page whose columns drift is a page that reads as a web page. The measure is stated in characters rather than `rem` for the same reason, and the gate reports the character count per line.

**Punctuation is set, not typed.** Full-width marks take their full-width space, 引號 hang correctly at a line's start, and no line begins with a closing mark or ends with an opening one. `line-break: strict` is on. A Western comma in a Chinese sentence is a wrong glyph and is checked for.

**`<tb-char>` carries no box.** It sets type properties and nothing else — no `display`, no `padding`, no `margin`, no `border`, no `inline-block`. A character wrapper is inline in the flow, and giving it a box would introduce break opportunities and edges that plain text does not have, so a 36-character line would wrap at a different character than the corpus's line does, and the character grid — the thing this book's typography is built on — would stop lining up with the text it is a grid of. A probe read the spec for this (`display`'s initial value is `inline`, and no user-agent stylesheet knows the element) and flagged that the design did not say it; this is that sentence. The focus ring on a character is a `text-decoration` and an outline, not a box.

**Numerals and dates** are lining and tabular wherever a column can form (the 年表, the lexicon index), because a reader compares them down a column. `oldstyle-nums`, which the Latin book uses in prose, is turned off — old-style figures beside ideographs that fill the em box read as a different size.

**The lexicon card is the book's centrepiece and gets the most design attention of anything in it.** It is a dictionary entry set by someone who cares: glyph large and centred, pinyin above it in Hei with a tone mark that is a character and not decoration, 詞性 as a tracked rubric, the gloss as the largest text in the card, the 通鑑 example indented under a hairline with its 卷次 hung at the right, and the chapter-local uses listed last as a quiet way back into the text. Space, rules and weight carry the hierarchy; no fills, no shadows, no rounded card with a coloured header.

**The one accent.** A single `--seal` red, mixed from existing tokens rather than a new hex, used in exactly three places: the current section mark in the rail, the focus ring on a character, and the rule under a figure's number. Everything else is ink on paper. A classical page with several accents is a modern page wearing a costume.

**Motion** is the minimum that makes the page legible: a card fades in over `--dur`, a figure moves only when the reader pushes it, and `prefers-reduced-motion` turns the rest off. Nothing animates to be noticed.

**Every value in `zj.css` comes from the modular scale, the baseline grid and the existing tokens; a one-off value carries its reason in a comment in the same commit.** That is local-rules quoted back, and it is the thing the independent typographic review is pointed at.

## The page

### Sections

A chapter has six sections in a fixed order, and each one has a job:

| id | heading | what it is |
|---|---|---|
| `read` | 怎麼讀這一章 | how to use the page: the card, the translation, the levels. Short. |
| `source` | 原文 | the passage, every character clickable, figures cited here |
| `translation` | 現代漢語翻譯 | the same passage, paragraph for paragraph against the original |
| `notes` | 字詞 | the lexicon as a browsable, filterable list — the chapter's own characters, not the whole book's |
| `history` | 背景 | what the passage assumes: who these people are, what 晋 was, why this year |
| `discussion` | 思考 | reading questions: the checks and the sort, about the passage rather than about a graded objective |

### The study layer is deliberately absent, and that is a scope decision

This book ships **no `objectives.js` and no `items.js`**, and its questions carry no `objective` attribute.

The reason is interference, and it is the owner's instruction twice over. `tools/check-content.js` requires three review items per objective, and `checkStudySources` then requires every chapter with an `items.js` to be listed on `today/index.html` — a file the bilingual round is editing in the same period. Three chapters of classical Chinese in the Today page's sitting is also a product decision about what the study queue is *for*, and a prototype is not the place to make it.

So the book opts out, which costs it one gate's worth of coverage and buys back a shared file. What it keeps is a real reading experience: `#discussion` holds comprehension questions with real distractors and explanations, and they are worth reading even though nothing scores them. When the study layer is wanted, the recipe is [chapter-recipe.md](chapter-recipe.md)'s, and the cost is one `items.js` per chapter plus a `tb-source` line on the Today page.

The study system's inline surfaces are also switched off, with `<main data-no-mastery>` — `src/components/mastery.js` reads that attribute and returns. Its labels are English and belong to the other book.

### The original text is set to a character grid

Each 句 of the 原文 is its own list item, one line of characters, so a reader can see where a sentence ends without punctuation carrying the whole load:

```html
<ol class="zj-src">
  <li><tb-char>初</tb-char>，<tb-char>命</tb-char>…</li>
</ol>
```

The grid is CSS: `letter-spacing` and `text-align: justify` with `text-align-last: left`, tuned so a line rarely ends with a single orphan character, and the reading column is one measure of whole characters rather than a length in `rem`.

**No drop cap.** 中國古籍 do not sink a first character, the mechanism is wrong for ideographs for the reasons [i18n.md](i18n.md) measured, and the opener already carries its authority in the head rule and the folio.

**No italic and no synthesised bold.** `<em>` in Chinese is a 着重号 — `text-emphasis: filled dot` under the character — and `<b>` uses the variable font's real 700. A slanted or smeared ideograph is a defect, not an emphasis.

### The translation is set beside the original, not above it

On a wide screen, 原文 and 譯文 are two columns of a grid, aligned by sentence so the reader's eye can cross between them. Below about 900 px they stack, and the translation follows its own sentence. The alignment is a CSS grid with `subgrid` where it is available and a plain flow where it is not, so the page is correct without it.

This is the one place the design departs from the recipe's single-column rule, and the reason is the whole point of the book: a translation a reader cannot see at the same time as the original is a translation they will read instead of the original.

### Colour, weight and space

Everything comes from the existing tokens. The one addition is the book's own accent use: 原文 in `--ink` at full weight, 譯文 in `--ink-soft`, the lexicon card on `--paper-2` with a `--rule-strong` hairline, and no new hex anywhere. **`zj.css` sets no `:root` token and no global element selector**, so it cannot reach a biology page even though the pages load it last.

## What is shared, and what this book touches

The book is added the way the repository already discovers things, and the shared files it touches are held to a short, listed set:

| File | Change | Why it cannot be avoided |
|---|---|---|
| `index.html` | one shelf entry | the library is where a book is found |
| `src/figures/registry.js` | three entries | a figure kind that is not registered does not render |
| `tools/drive.js` | three recipes | the gate fails a registered kind with no recipe |
| `src/components/term.js` | `<tb-char>`, plus the card's new optional fields | the reader's gesture must be one component, and the popover is where the positioning already works |
| `tools/check-content.js` | the figure-citation token follows the page's language | the rule was English-only, so every figure on a Chinese page failed. `docs/design/i18n.md` predicted this break for its own chapters; the second book reached it first |
| `docs/*` | this file, the plan, the devlog, the lessons | the canon requires it |

**`today/index.html` is not touched**, because the book ships no study layer: see below. That is one fewer shared file than the six-line promise this document used to make, and it is bought by cutting a feature rather than by weakening a check.

Nothing else. In particular **`tools/lib/browser.js` (beyond the page-id fix recorded in the plan), `test/pages.test.js` (likewise), `src/shell.js` and every file under `src/styles/` are not touched**, and the new book passes the gates as the gates already stand. That is the interference boundary the owner asked for, and it is also the strongest available evidence that the boundary is real: the gates were written for one book and did not need rewriting for the second.

## Gates

The book is subject to every gate the repository has, with no exemptions, plus the data tests above. What is added:

- **Unit tests over the lexicon** (the six checks listed under the lexicon), in `test/lexicon.test.js`. No browser, cheap, and it fails on the one defect that matters most: a quotation that is not in the source.
- **`npm run check`** — the existing content checker, unchanged. It is what proves the chapter's structure, its terms, its figures and its item bank.
- **`npm run shot`, `narrow`, `devices`, `subpath`, `flow`, `drive`, `sweep3d`** — visited automatically, because the pages are discovered from disk.
- **A card-level gate**, because the click is the product: a Playwright check that opens a card on the first character of each chapter's 原文, with the mouse, by keyboard, and by touch, and asserts that the card is on screen, that it names the character, that it carries a gloss, and that it carries at least one 通鑑 example. Bound: it proves a card opens and is populated; it says nothing about whether the gloss is right.

**Proving the new tests red** is required and goes in `docs/learning/gate-proofs.md`: a character removed from `chars.js`, a quotation with one character changed, an example with no `at`, and a 多音字 given one reading.

**Visual acceptance.** The owner's standing rule is that typography is the product, so no chapter is done until a person has looked at it at 1×, 2× and 3×, at 390 px and 1440 px, in both themes, and said so in the plan. The gate's screenshots are the check for the pixels; the looking is the acceptance.

## Two English strings this book cannot yet remove

The book's own prose, headings, cards and figures are Chinese. Two sentences on every chapter page are not, and they are worth naming rather than leaving for a reader to find:

- **`tb-sort`'s verdict and status**, from `src/components/sort.js`: `Yes.` / `Not this one — …` and `N of M sorted.`
- **`tb-check`'s verdict**, from `src/components/check.js`: `Right.` / `Not quite.`

They are built as different sentences per state, so CSS cannot replace them the way it replaces `Question 1` with `問題 1` and `In this chapter` with `本章目錄` — a counter or a `::before` can stand in for a fixed label, not for a sentence assembled in JavaScript. Reaching them means changing a shared component, which is the bilingual round's work ([i18n.md](i18n.md) plans exactly this: `src/strings.js` and a per-language formatter) and not a thing to do sideways in a prototype.

**They are therefore a known gap, not a defect to be discovered.** The check and sort still work, the questions and options are Chinese, and a reader meets two English sentences where they answer. When the string layer lands, this book is the second consumer of it and these two lines are what it fixes.

## What is deliberately not done

- **The whole of 通鉴.** Three chapters of 周纪一, chosen because they are one continuous reading. Chapter 4 onward is the same recipe.
- **Vertical setting.** 古籍 are set vertically, and CSS `writing-mode: vertical-rl` would do it — but a vertical column on a phone is a horizontal scroll, the figures would need a second composition each, and no gate here could see the result. It is the right second stage, not the first.
- **A general classical-Chinese dictionary.** The lexicon covers the characters of these three chapters. It is not 漢語大詞典 and does not claim to be.
- **Traditional characters as an option.** 通鑑 is read in both; the prototype sets the 原文 in Traditional and everything else in Simplified, which is the rule in "Language, and which script belongs where". A reader who wants the whole page in Traditional is asking for a translation job, not a setting, because converting mechanically produces wrong terminology.
- **Training the study system on the lexicon.** The reader's record keys on objective ids like every other book; the cards are not scored and nothing about them is stored.
