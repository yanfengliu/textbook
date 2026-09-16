# Contracts — the frozen interfaces for the 資治通鑑 book

Everything three or more workers touch. If you need a change here, that is an escalation to the integration owner, not a local decision: whoever else is mid-file will not see it.

Source of truth for the design: [docs/design/tongjian.md](../../design/tongjian.md). This file is the machine-readable half of it.

## 1. Files, and who owns each

| Path | Owner | Notes |
|---|---|---|
| `tongjian/zj.css` | W1 | The book's type system. Scoped under `.zj`. Sets no `:root` token and no bare element selector. |
| `tongjian/ch01-san-jia-fen-jin/index.html` | W1 | The skeleton all three chapters copy. |
| `src/components/term.js` | W1 | `<tb-char>` added beside `<tb-term>`. Nobody else edits this file. |
| `tongjian/data/card.js` | W1 | Shared card markup. Imported by `term.js`. |
| `tongjian/corpus.js` | W2 | Verbatim passages, each with two sources. |
| `tongjian/lexicon.js` | W2 | 字 entries. |
| `tongjian/words.js` | W2 | 詞 entries. |
| `test/corpus.test.js`, `test/lexicon.test.js` | W2 | The gates over the two files above. |
| `src/figures/zj-*.js` | W3 | Three figure modules. |
| `tongjian/ch*/**` (except ch01's skeleton) | W4 | Prose, glossary, objectives, items, the two later chapters. |
| `src/figures/registry.js`, `tools/drive.js`, `index.html`, `today/index.html` | integration owner | Six lines of shared change. Nobody else. |
| `src/styles/*`, `tools/check-content.js`, `tools/lib/browser.js`, `test/pages.test.js`, `src/shell.js` | **nobody** | Not edited by this round at all. |

## 2. The page skeleton

`tongjian/chNN-<slug>/index.html`. Exactly this shape. Section ids and figure ids are frozen once W1 lands ch01; the other chapters copy them.

```html
<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>三家分晉 — 資治通鑑</title>
<meta name="description" content="…">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- The Han faces come first in the stack; see docs/design/tongjian.md, "The type system". -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap">
<link rel="stylesheet" href="../../src/styles/tokens.css">          <!-- two levels up to the repository root, then src/ -->
<link rel="stylesheet" href="../../src/styles/typography.css">
<link rel="stylesheet" href="../../src/styles/layout.css">
<link rel="stylesheet" href="../../src/styles/components.css">
<link rel="stylesheet" href="../zj.css">                          <!-- LAST, so it can override components.css -->
<script type="module">
  import { GLOSSARY } from './glossary.js';
  import { LEXICON } from '../lexicon.js';
  import { WORDS } from '../words.js';
  import { CHARS } from './chars.js';
  import { textbook } from '../../src/shell.js';
  import { registerLexicon } from '../data/card.js';
  textbook.registerGlossary(GLOSSARY);
  registerLexicon({ lexicon: LEXICON, words: WORDS, chars: CHARS, chapter: 'tongjian/ch01' });
  await import('../../src/components/index.js');
</script>
</head>
<body class="zj">
<a class="tb-skip" href="#source">跳到正文</a>
<tb-shell book="資治通鑑" book-href="../" library-href="../../" today-href="../../today/" chapter="周紀一"></tb-shell>
<div class="tb-page">
<nav class="tb-rail" aria-label="本章目錄"></nav>
<main class="tb-main" data-chapter="1" data-no-mastery>
  <header class="tb-opener">
    <p class="tb-opener__unit">資治通鑑 · 卷一</p>
    <p class="tb-opener__number" aria-hidden="true">1</p>
    <h1>三家分晉</h1>
    <p class="tb-opener__dek">…</p>
    <ol class="tb-opener__contents" aria-label="本章目錄">…</ol>
  </header>
  <div class="tb-text">
    <section id="read"><h2>怎麼讀這一章</h2>…</section>
    <section id="source"><h2>原文</h2>…</section>
    <section id="translation"><h2>現代漢語翻譯</h2>…</section>
    <section id="notes"><h2>字詞</h2>…</section>
    <section id="history"><h2>背景</h2>…</section>
    <section id="discussion"><h2>思考</h2>…</section>
  </div>
</main>
</div>
</body>
</html>
```

Notes that are not negotiable, because a gate or a rule holds each:

- `main[data-chapter]` must exist or the shell does not number sections **and does not build the contents rail at all** — the whole `if (main && chapterNumber)` block in `src/shell.js` is skipped, so the page loses its rail, the phone drawer and the section numbers. It also switches on the figure-citation rule.
- **`data-no-mastery`** on `<main>` switches off the study system's inline surfaces (`src/components/mastery.js` returns on it). Their labels are English and belong to the other book. This book ships no objectives and no items, so nothing would be scored anyway.
- **Figures are cited as `圖 N.M`**, where `N` is `data-chapter`'s value. `tools/check-content.js` reads the token from the page's own `<html lang>` — `Figure` for English, `圖` for Chinese — so a Chinese page cites `圖 1.1`, and `圖1.1` with no space is accepted too (`text-autospace` supplies the space in Chinese setting). An earlier version of the rule searched for the literal `Figure`, which made every figure on a Chinese page fail as never mentioned; the 資治通鑑 round fixed that on 2026-09-12.
- Every `<h2>` is a **direct child** of a `<section id>`, or `npm run check` fails.
- Exactly one `<h1>`.
- The chapter's 原文 lives in `#source`; that is where the tests read it from.
- No `TODO`, `FIXME`, `XXX` or `lorem ipsum` anywhere.
- All paths relative.

### The 原文 markup

```html
<ol class="zj-src" data-corpus="zj-001-wei-lie-23">
  <li><tb-char>初</tb-char><tb-char>命</tb-char><tb-char>晉</tb-char>…</li>
</ol>
```

- **One `<li>` per corpus string, not one per 句.** `test/corpus.test.js` joins a chapter's `<li>` texts with newlines and compares the result against the corpus entry's own `text` array, so the page must group its text the way the corpus groups it. Where a corpus string holds several 句, they go inside the one `<li>` separated by `<br>`, which keeps the sentence-per-line reading grid and lets the comparison pass. W4 built this and it is now the contract; the earlier version of this document specified one `<li>` per 句, which would have forced a page to re-split text the corpus had already grouped.
- The `<li>` text is the corpus's text exactly, punctuation included. The chapter 1 opening has **no comma after 初** — 「初命晉大夫魏斯、趙籍、韓虔為諸侯。」 — and an earlier version of this document showed one. The corpus and all five witnesses are the authority.
- **Every** character of the 原文 is inside a `<tb-char>`. Punctuation is not.
- A 詞 (two or more characters) is `<tb-term ref="…" word="大夫">大夫</tb-term>` and counts as a glossed unit; the `ref` must exist in the chapter's `glossary.js`.
- The `data-corpus` value names the `CORPUS` entry; `test/corpus.test.js` compares the section's text against it character for character.

## 3. The data shapes

### `tongjian/corpus.js`

```js
export const CORPUS = [
  {
    id: 'zj-001-wei-lie-23',            // unique, stable, referenced by data-corpus
    work: '資治通鑑',
    juan: '卷一 周紀一',
    section: '威烈王二十三年',
    url: 'https://…',                    // the source it was transcribed from
    verifiedAgainst: ['https://…'],      // at least one MORE source, actually fetched
    fetched: '2026-09-12',
    note: '',                            // mandatory text when sources disagree
    punctuation: '現代整理本標點',        // which collation's punctuation this is
    text: ['初，命晉大夫魏斯、趙籍、韓虔為諸侯。', '…'],   // one string per 句
  },
];
```

### `tongjian/lexicon.js`

```js
export const LEXICON = {
  '為': {
    pinyin: 'wéi',
    readings: ['wéi', 'wèi'],        // only for a 多音字, and only when both occur
    pos: '動',
    uses: [
      { id: 'wei2-become', gloss: '成為；做', note: '通用義。',
        examples: [{ text: '魏斯、趙籍、韓虔為諸侯。', at: '周紀一' }] },
    ],
    variants: ['爲'],                 // optional; the other forms of the same character
  },
};
```

- `examples[].text` is a **verbatim** substring of `corpus.js`. No exceptions, ever. An entry with no attested second use carries `examples: []` and says so in `note`.
- `at` names the 卷 (`周紀一`, `周紀二`, …) the example comes from, and the corpus must contain a passage from that 卷.
- `gloss` and `note` are modern Chinese, concise: `gloss` is the meaning, `note` is what a learner needs beyond it.

### `tongjian/words.js`

```js
export const WORDS = {
  '大夫': { pinyin: 'dà fū', pos: '名', gloss: '官名，諸侯之下、士之上的爵位。', note: '', examples: [{ text: '…', at: '周紀一' }] },
};
```

### `chNN/chars.js`

```js
export const CHARS = {
  '為': { use: 'wei2-become', word: ['為後'] },   // `use` picks the sense in this passage; `word` names the 詞 it forms here
};
```

A character present in the 原文 with no entry in `chars.js` inherits the first `use` of its `lexicon.js` entry. That is the common case and needs no line here.

### Two files, one element: how a 詞 is both a term and a word

A 詞 of two or more characters is one element serving two systems, and both must be satisfied or `npm run check` fails:

```html
<tb-term ref="dafu" word="大夫">大夫</tb-term>
```

| The attribute | Read by | Must exist in | If it does not |
|---|---|---|---|
| `ref="dafu"` | `src/components/term.js` and `tools/check-content.js` | `glossary.js` (`{ dafu: { term, def } }`) | the check fails: `<tb-term ref="dafu"> has no glossary entry`, and a glossary entry never used as a `<tb-term>` fails too, in the other direction |
| `word="大夫"` | the card, through `tongjian/words.js` | `words.js`, keyed by exactly that string | the card has nothing to show, and `test/lexicon.test.js` fails a word no chapter uses |

So a new 詞 costs **three** lines, not one: an entry in the chapter's `glossary.js`, an entry in `tongjian/words.js`, and the element in the prose. The two entries say different things and both are needed — the glossary is the chapter's list of what it introduces and what the end-of-chapter glossary renders; `words.js` is the shared lexicon the card reads, and it is keyed by the word itself so two chapters cannot disagree about it. Write the glossary `def` as the chapter's own short form and the `words.js` `gloss` as the lexicon's full one.

## 4. `<tb-char>` and the card

```html
<tb-char>為</tb-char>          <!-- key is the element's own text; exactly one character -->
<tb-char for="為">爲</tb-char> <!-- a variant spelling that shows another entry's card -->
```

Behaviour, all of which the gates exercise:

| Input | Result |
|---|---|
| hover | opens, hover-only, closes on pointer leave |
| `Tab` to it | opens, hover-only |
| click / tap | pins open |
| click again while pinned | closes |
| `Escape`, click elsewhere | closes |
| `Enter` / `Space` | pins open (it is a real `<button>` inside) |

The card's DOM, which the acceptance gate reads:

```html
<span class="tb-term__pop zj-card" role="tooltip" id="pop-…">
  <span class="zj-card__head"><b class="zj-card__glyph" lang="zh-Hant">為</b><span class="zj-card__pinyin">wéi</span><span class="zj-card__pos">動</span></span>
  <span class="zj-card__gloss">成為；做</span>
  <span class="zj-card__note">通用義。</span>
  <span class="zj-card__sec">通鑑用例</span>
  <span class="zj-card__ex"><span class="zj-card__ex-text">魏斯、趙籍、韓虔為諸侯。</span><span class="zj-card__ex-at">周紀一</span></span>
  <span class="zj-card__sec">在這一章</span>
  <ul class="zj-card__here"><li>詞 · 為後</li><li>…</li></ul>
  <a href="#notes">本章字詞 →</a>
</span>
```

The card's link goes to the chapter's own 字詞 section, not to an index on the book's contents page. It used to read `href="../#zj-為"`, naming an anchor nothing builds — and `npm run check` cannot see that, because it verifies a fragment against ids in the same document and a cross-document fragment is invisible to it. Every card would have carried a dead link. If the book later grows a real 字詞索引, this changes back and the ids it names come into existence with it.

Required by the acceptance gate, so do not rename: `zj-card__glyph`, `zj-card__pinyin`, `zj-card__gloss`, `zj-card__ex-text`. A card with no gloss, or with no example, is a failure — but a character whose entry honestly has no attested second use still shows its gloss and its 通鑑用例 heading with the gap stated, so the gate must read `examples.length` from the registry rather than assume a quote exists.

## 5. Figure contract (unchanged from `docs/design/textbook.md`)

```js
export const meta = { kind: 'zj-split', title: '…', aspect: 16 / 10, narrowAspect: 4 / 5 };
export function mount(root, ctx) { … return { destroy, setTime, describe, setVisible }; }
```

- `ctx` carries `{ palette, theme, t, pinnedTime, reducedMotion }` — read `src/components/figure.js` for the exact object before using a field.
- `describe()` may not report `id`, `kind`, `number` or `state`. Use a prefixed name (`splitState`, `phase`).
- No `Math.random`; a seeded generator if randomness is needed.
- No hex colours: `ctx.palette` or the CSS variables.
- Controls use the `.fig-*` classes from `components.css`. Figure-private styles are scoped under a unique class inside `root`.
- The figure must be a pure function of its clock and the reader's actions, and must work with the keyboard.
