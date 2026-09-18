# 《资治通鉴》 — design of record

The second book in this library: 司马光's 资治通鉴, read as the original classical Chinese beside a modern Chinese translation, with every 字 and 词 in the original opening a card that gives its reading, its meaning here, and how the book itself uses it elsewhere.

Companion to [textbook.md](textbook.md) (the book's design), [chapter-recipe.md](chapter-recipe.md) (how a chapter is built) and [adaptive.md](adaptive.md) (the study system). Where this document differs from the recipe, the difference is stated and the reason given.

Status: **prototype built and published; two revision rounds landed** — the second, of 2026-09-19, is [below](#the-2026-09-19-revision-and-the-four-decisions-it-settles) and changes two rules stated in the sections above. Decisions marked **[owner]** came from the owner's request.

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

## Language: two scripts, and which is which

The owner read the first published version and settled this in two steps. First: *"我是说这本书一律用简体中文"*. Then, told how the 原文 is set: *"If the original text is in traditional chinese character that is fine. I just need the rest of the textbook and especially the translation to be in simplified chinese."*

So the book sets two scripts, and which one appears where is a rule rather than a habit:

| Where | Script | Why |
|---|---|---|
| The 原文 — every sentence inside `<ol class="zj-src">` | **Traditional** (繁體) | It is the book's text, as the witnesses print it. |
| Every quotation of 通鑑: a card's 通鑑用例, a quotation in the chapters' prose, a figure's `quote`, the `.zj-trans__src` copy beside the 譯文, the 字詞 tables' glyph and example columns | **Traditional** | It is the text, wherever it is quoted. |
| Everything else: the 譯文, 背景, 思考, headings, captions, the citation line, the figures' own labels and interface text, a card's `gloss` and `note` and its labels | **Simplified** (簡體) | The book's own voice, in the script its readers read. |

**It is a change of script, not of text.** The 原文 is a transcription of a received edition, and the transcription is what is faithful to the source. The conversion ran on 2026-09-18 (OpenCC's character table, per character) and the Traditional layer was put back **from the committed tree**, never by re-converting: 干 is 乾 in 乾坤 and 干 in 干戈, 后 is 後 and 后, 里 is 裡 and 里, and OpenCC's own phrase table maps 乾坤 to 干坤. The ledger — what was converted, what was held out, and the four decisions that were not mechanical — is in [tongjian/README.md](../../tongjian/README.md), "The two scripts, and what was converted".

**What the page declares.** `<html lang="zh-Hans">` for the book's own voice, and **`lang="zh-Hant"` on every element that carries the text** — each 原文 block in the markup, each `.zj-trans__src` copy, each `.zj-quote` example, each prose quotation the book sets off with 「」, and the card's glyph, its 通鑑用例 and its 在這一章 clauses, which `tongjian/data/card.js` builds. `lang` is what a screen reader uses to pick a voice, so a two-script page that declares one script reads the text wrongly aloud.

**One exception, and it is a title, not a script.** The corpus entry's `work` field keeps 資治通鑑, because that is the title as catalogued. Wherever the book sets the name in the reader's own prose it is 资治通鉴.

**Held out of the conversion, and why.** `variants` holds the glyph a fetched witness prints — the field's content is "this other form exists in the collation", so converting it would empty it. 乾 in 乾坤 is Simplified already. 絺 has an astral-plane Simplified form (𫄨, U+2B128) the webfont subsets do not carry, and is a surname here. All three are in the README ledger.

**What holds the rule.** `test/lexicon.test.js`, *the 原文 and its quotations are Traditional, and everything else is Simplified* — a checked-in character table, the pages' 原文 compared against the corpus character for character, and every `lang="zh-Hant"` run required to be a verbatim quotation. The rule had already been reversed twice in one session before the gate existed, which is what a gate is for.

### Which words are the book's, and which are 通鑑's

The owner, after the two-script rule had been in the book for a day: *"Just make it perfectly clear what came from the book what didn't it, everywhere."* On a page of this book "the book" is 資治通鑑, and the script rule above was only half an answer. The markup already carried the fact — every run of 通鑑's words has `lang="zh-Hant"`, and the check above proves every marked run IS a quotation — but **`lang` is invisible**. A quotation in 背景 was Traditional and otherwise identical to the sentence around it, so a reader could see the script and not know what it meant, which is the same complaint one layer down as the one that produced *原文 holds the original text and nothing else*.

Three things were added, and each answers a different half of the question.

**The mark is the quotation setting §"The type system" already specified.** That table has carried a row for 原文 quoted inside prose since the prototype — "same face, 0.95 em, `--ink-soft` — a quotation inside an argument should read as a quotation" — and the token `--zj-quoted-size` was declared for it and used by nothing. `zj.css` now implements it: `[lang="zh-Hant"]` inside the book's prose is set a step down and a step softer, except in the two containers that are already the quiet voice, where it inverts and steps *up* — see *The mark's reach, and the three places it inverts* below. **It is a step DOWN, and that is the point.** The 原文 stays at full ink and the full body size, because it is the primary object; a quotation of it inside the book's own argument is evidence being cited, and the contrast between the two settings is what a reader sees.

What is deliberately not added: **an underline**, because a solid hairline under a word already means "a 詞 you can open" (`tb-term`), and one mark with two meanings is one meaning lost; **a paper tint**, because nothing on this page is drawn on a fill but the lexicon card; and **a colour**, because the four hues here are the houses and the gold is a year. What carries the meaning is style, not paint.

**The key is stated once, on the contents page.** A reader who does not read the script difference at sight cannot get the rule out of the page, and a mark whose meaning is never stated is decoration. So the book's contents page carries one sentence — 繁体字都是《资治通鉴》自己的话：原文，以及正文各节里引自《通鉴》的句子；简体字都是本书自己的话——译文、背景、思考和注释；原文各节只读本书选定的段落，别处引到的《通鉴》是证据，不是读物 — set as apparatus, under a rule, a step below the dek. The closing clause is the answer to a question the book had been leaving to the reader: the 原文 sections carry the passages the book selected, and a 通鑑 sentence quoted in 背景 or 思考 is there as evidence for an argument, which is why figure 2.1 quotes the 前376 entry while the 原文 does not. **A chapter does not repeat it**, for the reason the 怎麼讀這一章 section was deleted: what a reader needs once belongs on the contents page, and the chapter's own 原文 is where the rule is seen working.

**Every quotation is marked, not most of them.** The rule was already in the markup but only where an author had remembered it: twenty-one runs of 通鑑's own words were printed in 背景 and 思考 as if the book had written them — 「臣光曰」, 「以人事知之」, 「城不浸者三版」, 「三家分智氏之田」, 「智伯之臣」, 「才德兼亡」, 「保障」 among them. A rule an author has to remember is not a rule, so the claim is now `test/provenance.test.js`'s: **every 「…」 run in a chapter's prose whose text is verbatim 通鑑 sits inside a marked element**, checked against the corpus, and the difference between a marked run and an unmarked one is the thing the reader sees.

**One place on a page where a quotation is not a citation, and it is exempt.** An `<aside data-note="textual">` discusses the text itself — a witness reads otherwise, the 底本 lacks these two characters, an editor supplied them from another edition — so a 「…」 run inside one may be a reading the received text does not carry. Chapter 2's 異文 note is exactly that case: it says 「不可」 is absent from the 底本, and the corpus prints it because the edition this book follows prints it. **Marking it as 通鑑's own words would contradict the note standing beside it**, which is the defect shape this section exists to remove, so those notes are outside the gate's requirement and their marked runs are held by `test/lexicon.test.js` instead — the weaker of the two checks, said here rather than left to be found. The first draft of the fix did mark it, and a review caught it; the note is the reason the exemption exists rather than a tidy-up of one page.

### The mark's reach, and the three places it inverts

The mark landed, and an independent typographic review measured the rendered page. Five things were wrong, and four of them were one shape: the rule was written about the containers its author had in mind rather than about the run.

**The rule does not reach five runs at all, and a whitelist of containers is why.** It read `:is(p, li, aside, blockquote, figcaption, td, th, dd) [lang="zh-Hant"]`, and `src/components/check.js:74` builds every `<tb-check>` option as a `<button>` from the `<li>`'s own innerHTML before `:82` replaces the `<li>`s — so the marked runs end up in `button > span` inside `div.tb-check__options` and no ancestor matches. Measured on chapter 3 at 1440 px: **5 marked runs in its options, `matched=0`, 17 px at full ink**, printed exactly as the book's own words, while the same quotation carries the mark in the question above them. `src/components/sort.js:116` builds a `<tb-sort>` card the same way, so the hole was waiting there too. The rule now reaches by exclusion — `.zj .tb-text [lang="zh-Hant"]` minus `.zj-src`, `.zj-card`, `tb-figure`, `.zj-cite`, `.tb-margin-note` and `tb-check .explain` — and the two roots that carry `lang` themselves need `:not(.zj-src)` as well as `:not(.zj-src *)`, because a root is not a descendant of itself; that is the job the whitelist was silently doing. Measured after, at 1440 px: chapter 3 has 23 marked runs in its prose outside the excluded regions and 22 of them are matched — the 23rd is the `.zj-cite` run, excluded on purpose — against 18 matched before.

**There is no size floor, and the one that stood there rested on a measurement that is false.** It read `max(var(--zj-quoted-size), 0.8125rem)` and claimed "at 390 px the floor holds it at 13 px where 0.95em alone would give 12.4". A 註 is 16 px at 390 px and at 1440 px, in both themes (`src/styles/layout.css:337-345` sets `--text-base`, 374-382 sets margin, padding and border only, and 884 is `@media print`), so a marked run in one is 15.2 px and 12.4 px occurs nowhere. Its one live firing was backwards: chapter 3's `.zj-cite` is 11.52 px (`--zj-rubric-size`, 0.72 rem), so the floor raised a marked run inside it to 13 px — **112.8 % of the line it sits in**, on the line whose design is that it carries the citation and nothing else. The citation line is excluded from the rule instead, and its run computes 11.52 px like the words around it.

**Where the container is already the quiet voice, the mark inverts.** A `.tb-margin-note` is `--ink-soft` at 16 px and `tb-check .explain` is `--ink-soft` at 17 px, so a marked run in one was 15.2 px and 16.15 px in **the same colour to the byte** — an ink step of 1.00:1 — and the book's quietest prose is where a reader most needs to know the words are not the book's. Quiet is unavailable there, so the mark spends the other direction: **full ink at the container's own size**. The device is already in the book — a lemma is ink and its gloss is not — so it spends no colour and invents nothing. Measured in chapter 2's 註: 15.2 px `rgb(92, 85, 77)` became 16 px `rgb(29, 26, 23)`, against the note's own soft ink.

**In a textual note the run keeps the note's colour and is marked by weight.** `[data-note="textual"]` is painted `--zj-note-textual` (青) to say *this note is about the text*, and the mark repainted a run inside it `--ink-soft` — measured on chapter 2's 異文 note, on 「既已委質為臣」: `rgb(92, 85, 77)` against the note's own `rgb(40, 113, 126)`, with `el.matches()` true, so the note's own statement was broken by exactly the run it is about. That run is now `color: inherit` and `font-weight: 500`, which the page already loads (Noto Serif SC 200–900) and already spends on head-words and glosses: a mark that costs no colour, which is what this section's argument against a third state of the mark requires.

**The exceptions are exclusion clauses on the mark rule, and the reason is a specificity number.** The mark rule is (0,8,2), and neither exception can be written above it without restating its whole exclusion chain. Measured with the exception rules placed after it and the two containers still matched: a 註 run stayed `--ink-soft` at 15.2 px, which is the defect unchanged — a lower rule does not win by being later. So the two containers are excluded from the mark rule and the exception rules then win on their own specificity. **This is the same failure the fourth house's colour had** (`[data-state="wei"]` matched while the browser painted ink), and it is why an added rule here is checked by what the browser paints rather than by `el.matches()`.

**A prose quotation now carries a citation rubric.** The mark says whose words a run is; it does not say why the book quotes rather than reads it, which is the question the owner was asking when they wanted to know why 「魏、韓、趙共廢晉靖公為家人而分其地。」 stood in 背景 rather than in the 原文. The card already hangs a 卷次 on each of its 通鑑用例 as a rubric and each figure hangs `quoteAt` on its quotation; prose quotations had no such mark. `.zj .tb-text .zj-at` is that device — Hei, `--zj-rubric-size`, `--ink-faint`, tracked, `nowrap` — and chapter 2's 背景 uses it once, on the year that entry is filed under: 《通鉴》要到 **周安王二十六年**（前376）才记下「…」.

**Still open, measured and not fixed in this round.** The contents page loads no `zj.css` at all, so the key's own page never shows the mark it explains: its three chapter-dek quotations are 16 px in the same `--ink-soft` as the Simplified words beside them — 100 % of the size and an ink step of 1.00:1. The device for it is the same inversion the 註 takes, in the contents page's own `<style>` block, and it belongs to the round that owns that page.
### Where a quotation comes from another work

《史記》《戰國策》、胡三省注 and 韋昭注 are quoted in this book, and 通鑑's own words must not be confused with theirs — 豫讓's 拔劍三躍 is 史記's scene, not 通鑑's, and a reader who takes it for 通鑑 has been misled by the page rather than by the sources.

**Those quotations carry no attribute, and the reason is that the sentence around each one already names the work.** 《史記·刺客列傳》作「豫让拔剑三跃而击之」, 《战国策·赵策一》作「豫让拔剑三跃，呼天击之」; 胡三省注给了折算——「高二尺为一版；三版，六尺」; 韋昭注...另一处说「君，康子。相，段规」. That is a fact about this book's prose rather than about an attribute a checker can read, so it is stated here rather than pretended to be gated. What the gate *can* hold, and does, is the other direction: a run of **通鑑's** words may not be printed unmarked, wherever it stands.

The same rule settled one sentence that was simply false. Chapter 2's 背景 said of the 前376 entry — the one that ends 晉, quoted in the 年表 with its citation — 「不在本书的取材范围之内，所以这里**只转述，不引原文**」. The chapter did quote it, four lines below, in figure 2.1. The sentence now says what the book does: 这一条不列入原文，图 2.1 里引它的原句为证. **A claim about provenance that the page contradicts four lines later is the defect this whole section exists to prevent**, and it was found by the owner reading the book, not by a gate.

## The type system, and the bar it is held to

The owner's standing directive — *"Use beautiful typography and UI design. Do not settle for anything that is less than supreme quality"* — outranks throughput here as it does everywhere in this repository. So this section is not a description of what the page happens to look like. It is the set of decisions the page is judged against, each with a reason, because a decision without a reason is a browser default and defaults are not design.

**The book does not inherit the biology book's type system.** That system is Latin: Fraunces and Newsreader on a 1.2 modular scale, old-style figures, a drop cap, small caps, negative tracking. Every one of those is wrong for a Song-style Chinese page, and a Chinese page that merely falls back to a system font is the exact defect [i18n.md](i18n.md) measured at 110 of 110 glyphs. So `tongjian/` carries its own families, its own scale and its own spacing, and `zj.css` sets them under `.zj` alone — no `:root` token, no global selector, nothing that can reach another book.

| | Family | Size | Leading | Reasoning |
|---|---|---|---|---|
| 原文 body | Noto Serif SC 400 | 1.25 rem | 2.0 | The primary object on the page. A full-width ideograph already reads larger than a Latin letter at the same size, so the step above the Latin body size is small and the leading does the work: a classical page is read character by character down a column, and 2.0 is where that stops being a grey slab. |
| 原文, quoted inside prose | same, 0.95 em, `--ink-soft` | — | — | A quotation inside an argument should read as a quotation. Where the container is already `--ink-soft` — a 註, a check's explanation — quiet is unavailable and the excerpt inverts instead: full ink at the container's own size. |
| 譯文 | Noto Serif SC 400 | 1.0625 rem | 1.85 | Deliberately a step *below* the original, in `--ink-soft`. It is an aid to the original, and a translation set at the same size and colour as the text it translates is a translation the reader reads instead of the original. This is the single most consequential size decision in the book. |
| 字詞卡 glyph | Noto Serif SC 500 | 2.2 rem | 1 | Large enough to be examined stroke by stroke. It is the thing the reader clicked. |
| Rubrics (卷次, 項目, 圖 n, and the citation a prose quotation carries, `.zj-at`) | Noto Sans SC 500 | 0.72 rem, tracked .16em | — | Chinese display type is Hei, and 疏排 is the Chinese rubric device as small caps is the Latin one. `text-transform: uppercase` is a no-op for Han and is not used. |
| UI and controls | Noto Sans SC 400–500 | 0.8125–0.9375 rem | — | A Song face at 11–13 px loses its horizontals on screen. |
| Latin inside Han | the Han face's own Latin | — | — | Units, pinyin, dates. Drawn by a Latin face they sit on a different baseline at a different weight, which is what makes mixed Chinese pages look assembled rather than set. |

**The two families are asked for twice, and the second request is a repair.** Noto Serif SC sets the text and Noto Sans SC the interface, and a range request for a Chinese family does not arrive as one file: Google Fonts slices it by `unicode-range` — 9,068 slices for Noto Serif SC, in 225,859 bytes of stylesheet (`out/glyphs/probe-corpus.txt`). Over the 1,937 code points this book uses — the corpus, `lexicon.js`, `words.js`, `glossary.js`, `chars.js` and the four pages, the population `out/glyphs/verify-links.txt` counts — **21 fall outside every slice**, so 21 of the characters the book prints were drawn by whatever face the reader's machine happened to have: SimSun here, tofu on a machine without one. The page had loaded the right two families and drawn the rest of the text with them, which is why nothing looked wrong; **a page can load a face and still not cover a character.**

**The second request names those characters.** Every page loads the same two families a second time with a `text=` list of 18 — the six that failed on chapter 2 (蜹 U+8739, 蠆 U+8806, 藺 U+85FA, 鼃 U+9F03, 驂 U+9A42, 讒 U+8B92), 紂 U+7D02, and eleven witness forms a card prints (䖍 䘮 僃 恱 摶 甞 矦 筈 聦 踈 鞶) — and all 18 are covered at weights 400, 500 and 700 in both stacks (`out/glyphs/probe-fix.txt`). All four `tongjian/` pages carry that same list, identical on each (`out/glyphs/verify-links.txt`). 紂 failed no run of the gate, because it stands only inside a card's 通鑑用例 and the census does not press controls; it is in the list because a reader who opens one of those cards would meet the same fallback. The cost is **13,236 B**, and only a page that draws one of the 18 pays it: the same probe that fetches 13,236 B for a page carrying the whole list fetches **0 B** for it when nothing on screen draws those characters, and a page drawing none of them loads its five usual slices and nothing extra (`out/glyphs/probe-fix.txt`). **The list is hand-maintained, and `npm run shot`'s font census is what tells an author when a character has fallen out of it.**

**Three forms are deliberately outside the list.** 𠆸 U+201B8, 𥳑 U+25CD1 and 𣳘 U+23CD8 are astral-plane forms — CJK Extension B — and nine families were asked for them (Noto Serif SC and TC, Noto Sans SC and TC, Noto Serif HK and Noto Sans HK, LXGW WenKai TC and Mono TC, and Noto Sans Symbols 2): every one answers HTTP 200 with a `unicode-range` that claims all three, and the census reads SimSun-ExtB for all three on every one of the nine, so no webfont this page can load draws them (`out/glyphs/probe-astral.txt`). They fall back to the machine's own SimSun-ExtB, and a machine without that meets tofu. It is the shape already recorded above for 絺's astral-plane Simplified form 𫄨 (U+2B128).

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
| `source` | 原文 | **the citation and the text, and nothing else** — see below |
| `translation` | 現代漢語翻譯 | the same passage, sentence against sentence |
| `notes` | 字詞 | the lexicon as a browsable list — the chapter's own characters, not the whole book's |
| `history` | 背景 | what the passage assumes, and everything the book has to say about it, figures included |
| `discussion` | 思考 | reading questions: the checks and the sort |

**There is no 怎麼讀這一章 section, and there will not be one again.** An early draft gave every chapter a first section explaining the page — that a character opens a card, that the translation is an aid. The owner read it and asked whether every chapter needed it, and the answer is no: it says the same thing three times to a reader who worked it out on the first page, and it delays the text they came for. What a reader genuinely needs once is on the book's contents page.

### 原文 holds the original text and nothing else

The owner, reading the published book: *"If a section says original text, then it should simply have the original text and nothing more. I can't tell what is original text and what is interpretation. It is not visually clear at all."*

That was a real failure, not a matter of taste. Each chapter's `#source` held the text, one or more explanatory paragraphs, a provenance note and a figure, **all at the same visual weight** — so a reader scanning the page could not tell which words were 司馬光's and which were the book's. The fix has two halves and both are required:

1. **The section holds the citation and the text.** One line naming the work, the 卷 and the year, then the `<ol class="zj-src">` blocks. Every explanatory paragraph, every provenance `aside` and every figure moves to `#history`, which is where the book explains things. A figure's `圖 N.M` citation moves with it, because `npm run check` fails a figure that no paragraph names.
2. **The text is unmistakably the page's primary object.** Full ink, the largest type on the page, generous space above and below so it reads as a quoted document rather than as another paragraph in a run of prose. **The original is never shrunk or muted to make this contrast** — the interpretation is what reads as secondary.

The rule generalises: a section says what its heading says. 原文 is the book's words; 譯文 is a translation; 背景 is interpretation. A reader should never have to work out which they are looking at.

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
- **`test/provenance.test.js`** — the other half of the script rule, and its gate. Every 「…」 run in a chapter's prose that is verbatim 通鑑 must sit inside `lang="zh-Hant"`; the contents page must carry the key; and each `src/figures/zj-*.js` must export **`QUOTED_FIELDS`**, the names of the object fields that hold whole 通鑑 句, checked in both directions — a field holding one must be declared, and a declared field must hold one — together with `lang: 'zh-Hant'` on the element the module builds for it. **That last part is a contract this book adds to its own three figures and not to the shared figure contract** ([textbook.md](textbook.md)): a figure that prints 通鑑 has to say which of its fields is the book's, and a figure of the biology book has no 通鑑 in it to declare. A new Chinese figure that holds 通鑑's words in its data and does not declare them fails this gate.
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
- **A third script setting inside the book.** The split is settled and gated: the 原文 and its quotations are Traditional, everything the book writes about them is Simplified. What is *not* offered is a reader-controlled toggle between the two — a page that reprinted the 原文 in Simplified would be re-deriving the text, which is the one thing the conversion record forbids (干/乾, 后/後, 里/裡), and `tongjian/README.md` says what that costs.
- **Training the study system on the lexicon.** The reader's record keys on objective ids like every other book; the cards are not scored and nothing about them is stored.

## The 2026-09-19 revision, and the four decisions it settles

The owner read the published book and gave three instructions, and two reader-proxies read it and found what a check cannot. What each defect was is in [../learning/defect-register.md](../learning/defect-register.md); what follows is the design it settled, and the measurements each decision rests on. Two of these **change a rule stated earlier in this document**, and they are marked as such rather than left for a reader to reconcile.

### `<tb-char>` and `<tb-term>` are atomic inlines, and the earlier rule was wrong

This section used to say that `<tb-char>` **carries no box**: no `display`, no padding, no border, no `inline-block`, on the reasoning that a box would introduce break opportunities a plain character does not have. The reasoning was right and the conclusion was backwards.

A term is `display: inline`, and **a card is an element inside it**. An inline element that gains a child element box gains a line-break opportunity *inside itself*, which for a justified CJK line means the line re-breaks. Measured on chapter 2's 原文: opening 獻子's card moved it **+318.3 px and one line up**, out from under the pointer that opened it, so the press landed on the enclosing `<span>` and the release on the button — and Chromium dispatches `click` on their nearest common ancestor, so the term's own handler never ran. The same append leaves the card flickering at about 10 Hz as the line breaks, the word leaves the pointer, and the line breaks back. **It is any second element box inside the term**: an absolutely positioned 0×0 span does it, a `display: none` span does not, and the same box in the paragraph or in the next character does not.

So both elements are `display: inline-block`, and the cost is measured rather than argued: **0 of 1,625 glyphs move** across the three chapters and the document height is unchanged, because an inline-block is atomic to the line breaker and a term was never a place a line should break. It also makes `top: 100%` in the card's placement resolve against the term's own box rather than the inline box carrying the line's leading, which is the ten-pixel error the placement code documents measuring around.

**The rule for anything added to the 原文 later:** a character or a word is one unbreakable unit, however much markup it carries.

### The reading column grows with the window, on a measured ladder

The owner: *"You are not taking advantage of the full width the page, especially on desktop."* It was a defect and not a preference. The measure was 43.6rem — **698 px at every width** — so the share of the window the book used fell as the window grew: 55% of 1280, 48% of 1440, **36% of 1920**, 27% of 2560.

| viewport | text column | share | 原文 cell | 譯文 text |
|---|---|---|---|---|
| 1280 px | 848 px | 66% | 424 px (20 characters) | 345 px (20.3 characters) |
| 1440 px | 838 px | 58% | 424 px (20) | 336 px (19.7) |
| 1920 px | 1014 px | 53% | 508.5 px (24) | 427 px (25.1) |
| 2560 px | 1014 px | 40% | 508.5 px (24) | 427 px (25.1) |

The ladder is six rungs in `zj.css` — 1100, 1200, 1400, 1480, 1600 px — each carrying its reasoning and its arithmetic in the file, and it changes three things together: the measure, the 原文's character grid (`--zj-grid-chars`, 17 → 20 → 24 characters), and the split between 原文 and 譯文 (`--zj-pair-chars`, 17 → 24). The grid is tuned against the rendered measure rather than guessed: a full line must land exactly on the cell's right edge with the pitch equal to the type size plus the tracking, and the worst ink past that edge over every line of every 句 is 0.05 px. The 譯文 is the largest gain — 15.2 characters at 1280 before to 25.1 at 1920 — because at 15 a modern Chinese sentence is a column of fragments.

**The ceiling is deliberate, and the cost is stated.** The measure stops at 63.4rem, which is why the share falls again above 1920: beyond that the 原文 would have to buy its width out of the 譯文, and the 譯文 is the reason the pairing exists. Plain prose (背景, 思考) now sets **36 Han characters a line on chapter 1 and 35 on chapters 2 and 3, with the worst line 38 on chapter 3**, measured by `out/remeasure/probe-prose-han.mjs` — Han characters alone, the per-paragraph median of every full line — and identical at 1280, 1440, 1600, 1920 and 2560 px, because the prose is capped at `--prose-measure: 50rem` inside the column: 800 px of 19.2 px type, 41.7 slots, on all three chapters. The **52–56 a line at 1920 px on chapter 2** this paragraph used to carry was real, and it is why the cap exists, but it was never a Han count: `out/widthgate/probe-prose.mjs` counts every non-space glyph, so the uncapped line that holds **45 Han characters at 1920 px** counts 52–56 with its punctuation in. Against a comfortable band of 28–36 and a practical ceiling of 40, that was past the ceiling on either count; the measure now sits inside the band, at its top edge on chapter 1, and the worst line is two under the ceiling. The retune is **taken and not pending, and it was taken on the line rather than on the ladder**: the rungs stay where they are, so the reading column and the 原文/譯文 pair keep the widths the same run measured — 848 px at 1280, 838.4 at 1440, 998.4 at 1600, 1014.4 at 1920 and 2560. One measure must still serve every prose block (`npm run devices` requires them to share a pair of edges), which is why the cap covers everything a section holds bar the 原文/譯文 pair and the boxes the shared sheet widens, and not the paragraphs alone. **The lever of 56 rem was not pulled**, and it is now the fallback rather than the plan: moving the top rung would widen the 譯文 with the 原文, where the cap shortens the line and touches neither. The numbers above are recorded in the 2026-09-19 note under the `devices` entry of [../learning/gate-proofs.md](../learning/gate-proofs.md), and the question they answer was [../work/4_zizhi-tongjian/restructure.md](../work/4_zizhi-tongjian/restructure.md)'s.

### Colour is apparatus, and each mark answers a question

The owner: the colours were fine and there should probably be more of them. The design they extend is the one already stated above — ink on paper, one accent, no decoration — so every mark added here has to answer a question a reader is already asking, and the test of a mark is what a reader **gains** from it rather than how it looks.

| mark | what the reader gains |
|---|---|
| `--zj-date-colour` — the date, in the prose and in the 年表's year column and its 干支 | which numbers on the page are years of the common era (前403) and which are a 卷 number, a figure number, or a year of a reign. The ones that are not stay ink, which is the visible proof the mark means something |
| `--zj-note-textual` — 青, on a margin note about the text | whether the note is about the **text** (異文, 異說, 底本, 兩存 — a witness disagrees, here is the reading taken) or about the **history** (this is what the passage means). No label is added, because a note labelled 校勘 would be a fifth rubric on a page that has four |
| `--zj-state-wei` / `-zhao` / `-han` — violet, coral, leaf | which house a name belongs to, spent only where the book **enumerates** the houses: the 氏 column, the 字 list, chapter 2's 世系 paragraphs, and the glossary's head-words. A reader meeting 智 in a 72-entry list of names cannot otherwise tell the family that was annihilated from the three that divided it |
| `--zj-state-zhi` — `--ink-faint` | the same, for the house of 智, and the grey **is** the information: the one house of the four that was annihilated at 晉陽 is the one drawn quiet |

Contrast was measured against all three paper surfaces in both themes, 60 pairs, every one matching chromium at 1440 and 390 px. The date is `color-mix(in srgb, var(--gold) 45%, var(--ink))` in light and 80% in dark, and the reason it is a mix at all is that **`--gold` itself is 2.26:1 on paper** and cannot be spent as type: mixing towards `--ink` moves a mark towards the paper's opposite in both themes, so light needs a low share of gold and dark a high one. The 45% was chosen by looking at the whole passing range side by side at the two sizes the book spends, not by taking the widest passing step — 52% is legible and reads as warm ink. The two rows deliberately **not** spent are `--gold` itself and the shared `--ink-faint` at 4.29:1 on `--paper-3`, from which this book's own `--ink-faint` is derived.

**One honest note, and it is the worker's judgement rather than a defect.** The 智 grey is the weakest of the nine: at 5.58:1 it is a real colour on the page and measurably not ink, but in a run of forty grey-and-ink glossary entries a reader will not name it as a colour. That is the quiet the design intends, and the alternative — a fifth hue for the house the story kills — would spend a colour on a mood rather than on a layer.

**One rule in this work failed silently, and the reason is worth keeping.** `.zj [data-state="wei"]` matched its element and did not paint it: chapter 1's 字 glyphs are `.zj .zj-lex__glyph { color: var(--ink) }`, the same specificity, stated 90 lines later, so the later rule won. `el.matches('.zj [data-state="wei"]')` was true while the computed colour was ink — **a shape of failure no screenshot can tell from "the rule is not there"**. The fix is one more unit of specificity (`[data-state="wei"][data-state]`), deliberately not the lexicon class, which would have fixed the one element in front of it and gone on losing to the next one. A rule added to this book should be checked by asking what colour the browser **paints**, not whether the selector matched.

### The 字詞 list needs an order a reader can scan

`localeCompare` on Han head-words returns ICU's radical-and-stroke order, which is neither pinyin nor anything a reader can predict: chapter 2's 72 entries came out 三版, 不如, 二心, 人臣, 代成君 … 飲器, 驂乘, 魏斯, 魏桓子. So a reader looking for a word had a 5,863 px column and no way in. The list now carries an index of its first characters — one link per contiguous run, with a count where a character leads more than one entry, because 智⁶ is six entries about one family and that is the reader's actual question. Chapter 2 has 59 distinct first characters for 72 entries, so the index is two lines at a desktop measure. **What is deliberately not there is a heading per run:** 59 headings into a list averaging 1.2 entries per run is 1,534 px of type repeating the first character of the head-word under it. The biology book's head-words are Latin, are alphabetical, and get the list exactly as it always was — the index is built only where the order is not one a reader can scan, which is decided from the head-words themselves and not from the book.
