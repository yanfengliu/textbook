// 字与词 — how single characters become words, which is the book's central lesson.
//
// 大夫 is not the sum of its two characters. 诸侯 is not "many" + "marquis". But 为后 — 为 "to make", 后 "heir" — is
// exactly the sum of its two characters, and that contrast is the thing a reader has to be able to make:
// some adjacent characters are a 词 with a meaning of its own, some are a phrase built from its parts.
// So the reader picks characters out of 通鉴's own sentences and the figure says which of the two they
// have picked, with each character's own gloss set above the compound's.
//
// Where the meanings come from. A chapter page imports tongjian/lexicon.js and tongjian/words.js and
// hands them to registerLexicon, which publishes { chapter, lookup(key, kind), card(key, kind) } on the
// handshake object (`window.__textbook.lexicon`, src/shell.js; the same slot src/components/term.js
// reads). The figure reads that and nothing else — no fetch, no import of the book's data, no second
// copy of a 272 KB dictionary, and no request that can fail: a figure that fetched its own data would
// download the lexicon a third time and turn a missing file into a failed request, which `npm run shot`
// fails a page for. On a host that publishes no registry — the lab, which `npm run drive` uses — the
// figure falls back to its own three-word set, says so on its face, and reports `source: 'seed'`.
//
// The seed is the figure's minimal set, not a shadow dictionary: three words with the glosses the book
// itself gives them (tongjian/words.js) and the six characters they are built from, trimmed from
// tongjian/lexicon.js so both arms of the figure say the same thing. If the two ever disagree the
// figure is teaching something the book does not say, so it is kept to what the book's own entries say.
//
// Which sense a character takes is TWO questions and the figure needs the second. The registry answers
// the chapter's: what does 夫 mean in 〈才德论〉, where chars.js binds fu2-initial (fú, 句首语气词)? The
// figure needs the word's: 夫 inside 大夫 is fū, and chapter 1 binds that very word to fu1-dafu. The two
// answers are not interchangeable, and printing the first where the second was meant is what put 「句首
// 语气词」 over 大夫 on the page that mounts this figure. `card.js` resolves one use per character and
// cannot be asked for a named one, so the six characters the three words are built from carry their
// word-sense in this file, each naming the use of tongjian/lexicon.js it is copied from, and the rows of
// a taught word take them in BOTH arms. Any other character still asks the page, which is the only
// authority for the chapter's own prose. TEACH and SEED are exported so a check can hold this copy of the
// book's wording against tongjian/lexicon.js; nothing in the frame reads either.
//
// Clock: one unit per taught word, in WORD_ORDER (0 = 大夫, 1 = 诸侯, 2 = 为后); the clock selects that
// word's run in the 原文. describe() -> { selection, chars, entryType, pinyin, pos, gloss, mark, line,
// source, pairs, tier, reduced }.
//
// Three arrangements, from the measured stage: wide (two columns), narrow (one column, on a capped
// measure), and small for a short stage — a phone in landscape or the 800px-window stage the frame
// makes at 480x300 — where the cells shrink, the 卷次 captions go, and the panel tightens.
import { h } from './lib/svg.js';

export const meta = {
  kind: 'zj-words',
  title: '字与词',
  needsWebGL: false,
  aspect: 16 / 10,
  // Measured at a 342px stage — the lab's stage at a 390px phone viewport, which is where `npm run narrow`
  // and the fit probe mount a figure — this composition needs 490px of height in the system Han fallback
  // and 476px with the book's Noto faces. 4/5 gives it 428 and clipped 64px of the card; 2/3 gives 513.
  // The three figures of this book share the value, so a reader meets the same shape three times. The
  // registry entry must carry the same number — the frame reads that, not this.
  narrowAspect: 2 / 3,
};

// Two sentences of 卷一, verbatim, every character pickable. The first is the book's opening line; the
// second is where 为后 comes from. Punctuation is set in its own cell and is not a control.
const LINES = [
  { id: 'open', text: '初命晉大夫魏斯、趙籍、韓虔為諸侯。', source: '卷一 周纪一 · 开篇' },
  { id: 'heir', text: '初，智宣子將以瑤為後。', source: '卷一 · 智宣子立后' },
];

const PUNCT = '，、。；：？！「」（）';

// The words the figure opens the reader onto, and the order the clock walks them in.
const WORD_ORDER = ['大夫', '諸侯', '為後'];

// What the figure teaches about a word, keyed by the word: which characters to take apart, the sense
// each of them takes inside it — a use id of tongjian/lexicon.js, whose reading and gloss SEED.lexicon
// below carries — and the mark that goes on the seal-red rule between their glosses and the word's. A
// word from the book that is not keyed here is still shown — its characters' glosses above its own — but
// with no mark and no claim, because the figure has nothing true to say about how that particular
// compound is put together.
export const TEACH = {
  '大夫': {
    chars: ['大', '夫'],
    uses: { '大': 'da4-dafu', '夫': 'fu1-dafu' },
    mark: '非两字相加',
    // The sentence says what the mark says, in the book's own words: the characters' glosses are the two
    // the rows above print, and 「大夫」 is a 官名, not those two meanings added together. It used to read
    // 「「大」「夫」两字相加是「大人」」, which needs 夫 to mean 男子 — a sense lexicon.js does not give it
    // (its two uses are fu1-dafu and fu2-initial, and the entry's own note says 「「丈夫」义本卷未见」) —
    // and 「大人」 appears nowhere in the book's data. A sum the data cannot supply is not this figure's
    // to state.
    taught: '「大」是官名用字，「夫」与「大」合成「大夫」；「大夫」是一个官名，不是两个字的意思相加。',
  },
  '諸侯': {
    chars: ['諸', '侯'],
    uses: { '諸': 'zhu1-all', '侯': 'hou2-lord' },
    mark: '另成一词',
    taught: '「諸」是众，「侯」是爵位；「諸侯」是一个固定的名号，不是「许多侯」。',
  },
  '為後': {
    chars: ['為', '後'],
    uses: { '為': 'wei2-become', '後': 'hou4-heir' },
    mark: '两字相加',
    taught: '「為」是立，「後」是继嗣；这是动宾短语，意思正是两字相加——与「大夫」正相反。',
  },
};

// The figure's minimal set: the three words with the glosses the book gives them (tongjian/words.js), used
// where no page registry exists, and the six characters those words are built from, each one use of
// tongjian/lexicon.js named by its id, with that use's own reading, gloss and note. The six are the rows
// of a taught word in BOTH arms, so the page and the lab teach the same thing; `readings` is the
// character's full set of readings, which the card shows and the row does not, because a row is about one
// sense and the row's reading is that sense's.
export const SEED = {
  words: {
    '大夫': {
      pinyin: 'dà fū',
      pos: '名',
      gloss: '官名。诸侯之下、士之上的爵位。',
      note: '《通鉴》此处的「晉大夫」指晋国韩、赵、魏三家的宗主，他们受命为诸侯，正是全书开端。',
    },
    '諸侯': {
      pinyin: 'zhū hóu',
      pos: '名',
      gloss: '天子所封的国君，有封国与社稷。',
      note: '《通鉴》开篇记周天子命晋国三位大夫为诸侯。',
    },
    '為後': {
      pinyin: 'wéi hòu',
      pos: '动',
      gloss: '立为继承人。',
      note: '「为后」「置后」都是立继承人的意思。',
    },
  },
  lexicon: {
    '大': { use: 'da4-dafu', pinyin: 'dà', pos: '形', gloss: '「大夫」的大，官名用字。', note: '与「夫」合成官名「大夫」。' },
    '夫': { use: 'fu1-dafu', pinyin: 'fū', readings: ['fū', 'fú'], pos: '名', gloss: '与「大」合成「大夫」，官名。', note: '读 fū；读 fú 时是句首语气词。' },
    '諸': { use: 'zhu1-all', pinyin: 'zhū', pos: '形', gloss: '众；各。', note: '本卷多与「侯」合成「諸侯」。' },
    '侯': { use: 'hou2-lord', pinyin: 'hóu', pos: '名', gloss: '诸侯；受天子册命的国君。', note: '爵位名：公、侯、伯、子、男。' },
    '為': { use: 'wei2-become', pinyin: 'wéi', readings: ['wéi', 'wèi'], pos: '动', gloss: '做；成为。', note: '通用义。' },
    '後': { use: 'hou4-heir', pinyin: 'hòu', pos: '名', gloss: '继承人；嗣子。', note: '「為後」即立继承人。' },
  },
};

// Where the arrangements are cut, in CSS pixels of stage. 460px of height is where the two-column
// composition stops fitting its card; 800px of width is where the one-column composition (原文 above the
// card, on a capped measure) reads better than two. The frame's own stage sizes make both thresholds
// necessary: 704x440 at a 1024px window, 390x585 and 768x960 at a phone and a tablet in portrait,
// 960x600 and 1100x688 on a desktop.
const SHORT_H = 460;
const ONE_COLUMN_W = 800;
const TINY_H = 340;
// The height under which the card's note comes off. The lexicon's note for a word is one or two lines of
// Chinese, and at a 656x410 stage (a 1024px window) the card's content runs 47px past its row without it
// being the first thing to go: the note is what a dictionary adds to a gloss, and the gloss, the
// characters' own meanings and the mark are what this figure is for.
const NOTE_H = 520;

const CSS = `
/* The three figures of this book share one system, because a reader meets all three in one sitting:
   a head of 2px --rule-head with a tracked rubric at its left (--text-xs, 600, 0.16em, --ink) and a quiet
   companion line at its right; section labels inside a panel as the same rubric at 0.14em in --ink-faint;
   a hero in --font-text at --text-2xl/500 with a --text-lg serif companion beside it; and one selection
   mark — a 2px seal inset on the edge the selection starts from (the foot of a horizontal control, the
   left of a row in a vertical list), a 6% ink ground and full ink on the label. */
.tb-zjw { --zjw-seal: var(--seal, var(--coral)); }
.tb-zjw {
  position: absolute; inset: 0; box-sizing: border-box;
  display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-3); padding: var(--space-4) var(--space-5) var(--space-3);
  font-family: var(--font-ui); color: var(--ink); text-align: left;
}
.tb-zjw .zjw-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3);
  padding-bottom: var(--space-2); border-bottom: 2px solid var(--rule-head); }
.tb-zjw .zjw-title { margin: 0; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.16em; }
.tb-zjw .zjw-folio { margin: 0; font-size: var(--text-xs); letter-spacing: 0.08em; color: var(--ink-faint); }
.tb-zjw .zjw-folio[data-source="seed"] { color: var(--zjw-seal); }

.tb-zjw .zjw-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--space-5); min-height: 0; }
/* At the widest stage both columns are taller than what they hold. A 1100x688 figure is not a page to be
   filled from the top: the reading and the 原文 sit on the middle of the stage, and the 原文's cells grow
   to 3rem so the characters the reader is picking are the largest thing in the figure — the original as
   the primary object, which is the book's rule. */
.tb-zjw[data-tier="wide"] .zjw-source, .tb-zjw[data-tier="wide"] .zjw-card { justify-content: center; }
.tb-zjw[data-tier="wide"] .zjw-cell { width: 3rem; height: 3rem; font-size: 1.8rem; }
.tb-zjw[data-tier="wide"] .zjw-glyphrun { font-size: var(--text-3xl); }

/* ---------- the 原文: a character grid, every character a control ---------- */
.tb-zjw .zjw-source { display: flex; flex-direction: column; gap: var(--space-3); min-width: 0; }
.tb-zjw .zjw-line { display: flex; flex-wrap: wrap; border-top: 1px solid var(--rule-strong); border-left: 1px solid var(--rule-strong);
  width: fit-content; max-width: 100%; }
.tb-zjw .zjw-cell { width: 2.5rem; height: 2.5rem; display: grid; place-items: center;
  border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  font-family: var(--font-text); font-size: 1.55rem; line-height: 1; color: var(--ink); }
.tb-zjw button.zjw-cell { appearance: none; padding: 0; background: transparent; cursor: pointer; border-radius: 0; }
.tb-zjw button.zjw-cell:hover { background: color-mix(in srgb, var(--ink) 5%, transparent); }
.tb-zjw button.zjw-cell:focus-visible { outline: 2px solid var(--ink); outline-offset: -2px; }
.tb-zjw button.zjw-cell[aria-pressed="true"] { background: color-mix(in srgb, var(--ink) 7%, transparent); box-shadow: inset 0 0 0 1px var(--ink); }
.tb-zjw .zjw-cell--punct { color: var(--ink-faint); }
.tb-zjw .zjw-caption { margin: 0; font-size: var(--text-xs); color: var(--ink-faint); }
.tb-zjw .zjw-hint { margin: 0; font-size: var(--text-sm); line-height: 1.5; color: var(--ink-soft); }

/* ---------- the card ---------- */
.tb-zjw .zjw-card { display: flex; flex-direction: column; gap: var(--space-2); min-width: 0; min-height: 0; }
.tb-zjw .zjw-cardhead { margin: 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.5em; }
.tb-zjw .zjw-glyphrun { font-family: var(--font-text); font-size: var(--text-2xl); font-weight: 500; line-height: 1; }
.tb-zjw .zjw-pinyin { font-family: var(--font-text); font-size: var(--text-lg); font-weight: 500; color: var(--ink-soft); }
.tb-zjw .zjw-pos { font-size: var(--text-xs); letter-spacing: 0.1em; color: var(--ink-faint); }
.tb-zjw .zjw-type { font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.14em; color: var(--ink-faint); }
.tb-zjw .zjw-gloss { margin: 0; font-family: var(--font-text); font-size: var(--text-body); line-height: 1.6; text-wrap: pretty; }
.tb-zjw .zjw-note { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.6; color: var(--ink-soft); text-wrap: pretty; }
.tb-zjw .zjw-note:empty, .tb-zjw .zjw-ex:empty { display: none; }
.tb-zjw .zjw-ex { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.5; color: var(--ink-soft);
  padding-left: var(--space-2); border-left: 1px solid var(--rule-strong); display: flex; gap: 0.4em; text-wrap: pretty; }
.tb-zjw .zjw-ex i { font-style: normal; font-size: var(--text-xs); color: var(--ink-faint); white-space: nowrap; }

/* 拆开看 above 合起来: the two blocks are the figure's argument, and the rule between them is the
   card's one piece of colour. */
.tb-zjw .zjw-split { display: flex; flex-direction: column; gap: var(--space-2); min-height: 0; }
.tb-zjw .zjw-split[hidden] { display: none; }
.tb-zjw .zjw-rubric { margin: 0; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.14em; color: var(--ink-faint); }
.tb-zjw .zjw-parts { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--space-1); }
.tb-zjw .zjw-part { display: grid; grid-template-columns: 1.8rem 3.4rem minmax(0, 1fr); align-items: baseline; gap: var(--space-2); }
.tb-zjw .zjw-part b { font-family: var(--font-text); font-size: var(--text-lg); font-weight: 500; }
.tb-zjw .zjw-part i { font-family: var(--font-text); font-style: normal; font-size: var(--text-sm); color: var(--ink-soft); }
.tb-zjw .zjw-part span { font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.5; color: var(--ink-soft); }
.tb-zjw .zjw-whole { margin: 0; padding-top: var(--space-2); border-top: 1px solid var(--zjw-seal); display: flex; flex-direction: column; gap: 0.3rem; }
.tb-zjw .zjw-whole-head { margin: 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.5em; }
.tb-zjw .zjw-whole-word { font-family: var(--font-text); font-size: var(--text-lg); font-weight: 600; }
.tb-zjw .zjw-mark { font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.1em; color: var(--zjw-seal); }
.tb-zjw .zjw-mark[hidden] { display: none; }
.tb-zjw .zjw-taught { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.6; color: var(--ink-soft); text-wrap: pretty; }
.tb-zjw .zjw-taught[hidden] { display: none; }

.tb-zjw .fig-toolbar { position: static; padding: 0; gap: var(--space-2); pointer-events: auto; }
/* The selection mark, the same device as zj-split's stops and zj-timeline's rows: a 2px seal inset on the
   foot of a horizontal control, a 6% ink ground, and full ink on the label. The colour is set here because
   the shared .fig-btn[aria-pressed="true"] paints the label --paper; leaving it out is a label at 1.2:1
   on the paper-tinted ground — invisible, and invisible in a way no gate in this repository measures. */
.tb-zjw .zjw-chip[aria-pressed="true"] { color: var(--ink); border-color: var(--ink);
  background: color-mix(in srgb, var(--ink) 6%, transparent); box-shadow: inset 0 -2px 0 var(--zjw-seal); }
.tb-zjw .zjw-clear { color: var(--ink-faint); }
.tb-zjw, .tb-zjw * { transition: background var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.tb-zjw.is-reduced, .tb-zjw.is-reduced * { transition: none; }

/* ---------- small: a short stage, two columns, nothing that does not fit ---------- */
.tb-zjw[data-tier="small"] { gap: var(--space-2); padding: var(--space-3) var(--space-4) var(--space-2); }
.tb-zjw[data-tier="small"] .zjw-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: var(--space-4); }
.tb-zjw[data-tier="small"] .zjw-source { gap: var(--space-2); }
.tb-zjw[data-tier="small"] .zjw-cell { width: 2rem; height: 2rem; font-size: 1.25rem; }
.tb-zjw[data-tier="small"] .zjw-caption, .tb-zjw[data-tier="small"] .zjw-hint { display: none; }
.tb-zjw[data-tier="small"] .zjw-glyphrun { font-size: var(--text-xl); }
.tb-zjw[data-tier="small"] .zjw-pinyin { font-size: var(--text-base); }
.tb-zjw[data-tier="small"] .zjw-gloss { font-size: var(--text-base); line-height: 1.5; }
.tb-zjw[data-tier="small"] .zjw-note { font-size: var(--text-xs); line-height: 1.45; }
.tb-zjw[data-tier="small"] .zjw-part { grid-template-columns: 1.5rem 2.8rem minmax(0, 1fr); }
.tb-zjw[data-tier="small"] .zjw-part b { font-size: var(--text-base); }
.tb-zjw[data-tier="small"] .zjw-part span, .tb-zjw[data-tier="small"] .zjw-part i,
.tb-zjw[data-tier="small"] .zjw-taught, .tb-zjw[data-tier="small"] .zjw-ex { font-size: var(--text-xs); line-height: 1.45; }
.tb-zjw[data-tier="small"] .zjw-whole-word { font-size: var(--text-base); }
.tb-zjw[data-tier="small"] .fig-btn { padding: 0.25rem 0.55rem; }
.tb-zjw[data-tier="small"] .zjw-card { gap: var(--space-1); }
/* Under 340px of height — a browser window at 800px, a phone in landscape — the card keeps what the
   figure is for (the two characters' own glosses, the word's meaning, and the mark that says the two do
   not add up) and gives up the lexicon's note and the teaching sentence, whose work the mark does in
   four characters. A cut-off line reads as a bug; an absent one does not. */
.tb-zjw[data-tiny="1"] { gap: var(--space-1); }
.tb-zjw[data-tiny="1"] .zjw-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: var(--space-3); }
.tb-zjw[data-tiny="1"] .zjw-cell { width: 1.5rem; height: 1.5rem; font-size: 1rem; }
.tb-zjw[data-tiny="1"] .zjw-card { gap: 2px; }
.tb-zjw[data-tiny="1"] .zjw-note, .tb-zjw[data-tiny="1"] .zjw-taught { display: none; }
.tb-zjw[data-tiny="1"] .zjw-gloss { font-size: var(--text-sm); }

/* ---------- narrow: one column, 原文 above the card, on a capped measure ----------
   A 390px stage holds both halves once the 卷次 captions and the hint come off — the figure opens on a
   worked example (大夫 taken apart) and the three chips name what else there is, so the hint has done its
   work by the time the reader is here — and the card's blocks sit one gap closer. */
.tb-zjw[data-tier="narrow"] { width: min(34rem, 100%); inset: 0 auto 0 50%; transform: translateX(-50%);
  gap: var(--space-2); padding: var(--space-3) var(--space-3) var(--space-2); }
.tb-zjw[data-tier="narrow"] .zjw-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: var(--space-2); }
.tb-zjw[data-tier="narrow"] .zjw-source { gap: var(--space-2); }
.tb-zjw[data-tier="narrow"] .zjw-caption, .tb-zjw[data-tier="narrow"] .zjw-hint { display: none; }
.tb-zjw[data-tier="narrow"] .zjw-card { gap: 3px; }
.tb-zjw[data-tier="narrow"] .zjw-split { gap: var(--space-1); }
.tb-zjw[data-tier="narrow"] .zjw-whole { padding-top: var(--space-1); }
.tb-zjw[data-tier="narrow"] .zjw-parts { gap: 0; }
.tb-zjw[data-tier="narrow"] .zjw-taught { line-height: 1.4; }
.tb-zjw[data-tier="narrow"] .zjw-cell { width: 1.9rem; height: 1.9rem; font-size: 1.2rem; }
.tb-zjw[data-tier="narrow"] .zjw-glyphrun { font-size: var(--text-xl); }
.tb-zjw[data-tier="narrow"] .zjw-pinyin { font-size: var(--text-base); }
.tb-zjw[data-tier="narrow"] .zjw-gloss { font-size: var(--text-base); }
.tb-zjw[data-tier="narrow"] .zjw-note { font-size: var(--text-xs); line-height: 1.45; }
.tb-zjw[data-tier="narrow"] .zjw-part { grid-template-columns: 1.5rem 3rem minmax(0, 1fr); }
.tb-zjw[data-tier="narrow"] .zjw-part b { font-size: var(--text-base); }
.tb-zjw[data-tier="narrow"] .zjw-part span, .tb-zjw[data-tier="narrow"] .zjw-part i,
.tb-zjw[data-tier="narrow"] .zjw-taught { font-size: var(--text-xs); }
.tb-zjw[data-tier="narrow"] .fig-toolbar { max-width: 34rem; margin-inline: auto; width: 100%; }
.tb-zjw[data-tier="narrow"] .fig-btn { padding: 0.25rem 0.55rem; }

/* The card's note is the last block to come off as the stage gets shorter: it is what the dictionary adds
   to the gloss, and the gloss, the characters' own meanings and the mark are what this figure is for. With
   the book's real lexicon a note is one or two lines, and at 656x410 (a 1024px window) that is 47px the
   card does not have. After the tier blocks on purpose: it has their specificity. */
.tb-zjw[data-short="1"] .zjw-note { display: none; }
`;

const cellsOf = (text) => [...text].map((ch) => ({ ch, punct: PUNCT.includes(ch) }));

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  let destroyed = false;

  // ---------- where the meanings come from ----------
  // The page's registry first (tongjian/data/card.js publishes it), then a lexicon the frame may one day
  // hand a figure through ctx, then this figure's own three words. Nothing is fetched.
  function registry() {
    const published = globalThis.__textbook?.lexicon;
    if (published?.lookup) return published;
    if (typeof ctx.lexicon?.lookup === 'function') return ctx.lexicon;
    return null;
  }

  function lookup(key, kind) {
    const reg = registry();
    if (reg) return reg.lookup(key, kind);
    if (kind === 'word') {
      const w = SEED.words[key];
      return w ? { key, layer: 'words', glyph: key, readings: [], examples: [], ...w } : null;
    }
    const c = SEED.lexicon[key];
    return c ? { key, layer: 'lexicon', glyph: key, readings: c.readings || [], examples: [], ...c } : null;
  }

  const source = () => (registry() ? 'chapter' : 'seed');

  // state: null, or { line, from, to } as indices into that line's cells.
  let pick = null;

  const wrap = h('div', { class: `tb-zjw${reduced ? ' is-reduced' : ''}` });
  wrap.append(h('style', { text: CSS }));
  const folio = h('p', { class: 'zjw-folio' });
  wrap.append(h('div', { class: 'zjw-head' }, [
    h('p', { class: 'zjw-title', text: '由字成词' }),
    folio,
  ]));

  // ---------- the 原文 ----------
  const lineCells = LINES.map((line) => cellsOf(line.text));
  const glyphs = [];
  const linesets = LINES.map((line, li) => {
    const lineEl = h('div', { class: 'zjw-line', role: 'group', 'aria-label': line.text });
    lineCells[li].forEach((cell, ci) => {
      if (cell.punct) {
        lineEl.append(h('span', { class: 'zjw-cell zjw-cell--punct', 'aria-hidden': 'true', text: cell.ch }));
        return;
      }
      const btn = h('button', {
        class: 'zjw-cell zjw-glyph', type: 'button', 'data-line': String(li), 'data-cell': String(ci),
        'aria-pressed': 'false', 'aria-label': `${cell.ch}，第${li + 1}句第${ci + 1}字`, text: cell.ch,
        tabindex: li === 0 && glyphs.length === 0 ? '0' : '-1',
      });
      btn.addEventListener('click', () => select(li, ci));
      lineEl.append(btn);
      glyphs.push({ btn, li, ci });
    });
    return h('div', {}, [lineEl, h('p', { class: 'zjw-caption', text: line.source })]);
  });
  const hint = h('p', { class: 'zjw-hint', text: '连点相邻两字，看合起来是什么；方向键选字，Enter 决定。' });
  const sourcePane = h('div', { class: 'zjw-source' }, [...linesets, hint]);

  // ---------- the card ----------
  const glyphRun = h('span', { class: 'zjw-glyphrun' });
  const pinyin = h('span', { class: 'zjw-pinyin' });
  const pos = h('span', { class: 'zjw-pos' });
  const type = h('span', { class: 'zjw-type' });
  const gloss = h('p', { class: 'zjw-gloss' });
  const note = h('p', { class: 'zjw-note' });
  const example = h('p', { class: 'zjw-ex' });
  const parts = h('ul', { class: 'zjw-parts' });
  const wholeWord = h('span', { class: 'zjw-whole-word' });
  const mark = h('span', { class: 'zjw-mark' });
  const taught = h('p', { class: 'zjw-taught' });
  // The card carries the word's meaning once, at the head of the column: the block under the rule says
  // what the two characters do *not* add up to, which is the figure's whole point, and repeating the
  // gloss there would cost a line of height at every stage for nothing.
  const split = h('div', { class: 'zjw-split' }, [
    h('p', { class: 'zjw-rubric', text: '拆开看' }),
    parts,
    h('div', { class: 'zjw-whole' }, [h('p', { class: 'zjw-whole-head' }, [wholeWord, mark]), taught]),
  ]);
  const card = h('div', { class: 'zjw-card', 'aria-live': 'polite' }, [
    h('p', { class: 'zjw-cardhead' }, [glyphRun, pinyin, pos, type]),
    gloss,
    note,
    example,
    split,
  ]);

  // ---------- the toolbar ----------
  const chips = WORD_ORDER.map((w) => {
    const btn = h('button', {
      class: 'fig-btn zjw-chip', type: 'button', 'data-word': w, 'aria-pressed': 'false',
      'aria-label': `看「${w}」`, text: w,
    });
    btn.addEventListener('click', () => showWord(w));
    return btn;
  });
  const clear = h('button', { class: 'fig-btn zjw-clear', type: 'button', 'aria-label': '清除选字', text: '清除' });
  clear.addEventListener('click', () => { pick = null; paint(); });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [...chips, clear]);

  wrap.append(h('div', { class: 'zjw-body' }, [sourcePane, card]), toolbar);
  root.append(wrap);

  // ---------- resolving a selection ----------
  const selectionText = () => (pick ? lineCells[pick.line].slice(pick.from, pick.to + 1).map((c) => c.ch).join('') : '');

  function entry() {
    const text = selectionText();
    if (!text) return { type: 'none' };
    const chars = [...text];
    // One character is a 字 whether or not the lexicon has reached it: the card then says the entry is
    // missing rather than calling a single character a phrase. Two or more are a 词 only when the word
    // list has them, and otherwise a run that this figure will not pretend is a word.
    if (chars.length === 1) return { type: 'glyph', key: text, data: lookup(text, 'char'), chars };
    const data = lookup(text, 'word');
    return data ? { type: 'word', key: text, data, chars } : { type: 'run', key: text, chars };
  }

  // The reading the card shows for a character: its `readings` when the entry has more than one, which
  // is how a 多音字 like 夫 (fū in 大夫, fú as a particle) is shown honestly.
  const readingOf = (data) => (!data ? '' : (data.readings?.length ? data.readings.join(' / ') : data.pinyin || ''));

  // What a looked-up character prints as its meaning. Three states, and the registry can tell them apart:
  // an entry with a sense the chapter bound, an entry the lexicon HAS but whose sense for this occurrence
  // the chapter's 字表 did not bind (`unbound`, with every sense it does have listed), and an entry the
  // lexicon does not have at all. Printing 「字词库未收此字。」 for the middle state is a claim about the
  // book's data that the book's data contradicts — the character is in the lexicon, with two to three
  // senses — and it is what the figure said for four of the six characters its own words are built from.
  // The popover's own wording for that state is 「此处义项未定。」, and both surfaces read one registry.
  const glossOf = (data) => {
    if (!data) return '字词库未收此字。';
    return data.unbound ? '此处义项未定。' : data.gloss || '字词库未收此字。';
  };
  const sensesOf = (data) => (data?.unbound && data.senses?.length ? `本章义项　${data.senses.join('；')}` : data?.note || '');

  // The sense a character takes inside a word the figure teaches. The word's own binding comes first: the
  // page's answer is about this chapter's prose, which is a different text from the sentence the figure
  // quotes — chapter 3 binds 夫 to fú, 句首语气词, and the 夫 of 大夫 is fū. A character the figure has no
  // word-sense for still asks the page, and its row then shows the character's own readings rather than a
  // reading this file would have had to invent.
  function senseIn(teach, ch) {
    const use = teach?.uses?.[ch];
    const own = use && SEED.lexicon[ch]?.use === use ? SEED.lexicon[ch] : null;
    const data = own || lookup(ch, 'char');
    return { data, reading: own ? own.pinyin || '' : readingOf(data) };
  }

  // Where each taught word stands in each line of the 原文. A reader may pick a longer run that contains one
  // — 「晉大夫」 is 晉 plus the word 大夫 — and each character in it keeps the sense it has where it stands.
  // Without this the 连读 note would gloss the 夫 of 「晉大夫」 with chapter 3's particle sense while the
  // 拆开看 rows a line below said fū, which is the defect this figure was just fixed for, in one panel.
  const wordSpans = lineCells.map((cells) => {
    const line = cells.map((c) => c.ch).join('');
    return WORD_ORDER.flatMap((w) => {
      const at = line.indexOf(w);
      return at < 0 ? [] : [{ word: w, from: at, to: at + w.length - 1 }];
    });
  });

  // The sense a character has where it stands: its word's, inside one of the three taught words, and the
  // page's everywhere else.
  function senseAt(li, ci) {
    const span = wordSpans[li].find((s) => ci >= s.from && ci <= s.to);
    return senseIn(span ? TEACH[span.word] : null, lineCells[li][ci].ch);
  }

  function paint() {
    const on = new Set();
    if (pick) for (let i = pick.from; i <= pick.to; i += 1) on.add(`${pick.line}:${i}`);
    for (const g of glyphs) {
      g.btn.setAttribute('aria-pressed', String(on.has(`${g.li}:${g.ci}`)));
      g.btn.tabIndex = on.has(`${g.li}:${g.ci}`) || (!pick && g.li === 0 && g.ci === 0) ? '0' : '-1';
    }
    folio.textContent = source() === 'chapter' ? '资治通鉴 · 卷一 周纪一' : '字词库未载入 · 本图仅示三词';
    folio.dataset.source = source();

    const e = entry();
    const text = selectionText();
    glyphRun.textContent = text;
    chips.forEach((b) => b.setAttribute('aria-pressed', String(e.type === 'word' && e.key === b.dataset.word)));

    if (e.type === 'none') {
      pinyin.textContent = '';
      pos.textContent = '';
      type.textContent = '';
      gloss.textContent = source() === 'chapter'
        ? '点原文里的字，看它是一个字，还是一个词。'
        : '点原文里的字，看它是一个字，还是一个词。（本图自带大夫、诸侯、为后三词）';
      note.textContent = '';
      example.textContent = '';
      split.hidden = true;
      return;
    }

    if (e.type === 'word') {
      const teach = TEACH[e.key];
      pinyin.textContent = e.data.pinyin || '';
      pos.textContent = e.data.pos || '';
      type.textContent = '词';
      gloss.textContent = e.data.gloss || '';
      note.textContent = e.data.note || '';
      example.textContent = '';
      split.hidden = false;
      const built = teach?.chars || e.chars;
      parts.replaceChildren(...built.map((ch) => {
        const sense = senseIn(teach, ch);
        return h('li', { class: 'zjw-part' }, [
          h('b', { text: ch }),
          h('i', { text: sense.reading }),
          h('span', { text: glossOf(sense.data) }),
        ]);
      }));
      wholeWord.textContent = e.key;
      mark.textContent = teach?.mark || '';
      mark.hidden = !teach?.mark;
      taught.textContent = teach?.taught || '';
      taught.hidden = !teach?.taught;
      return;
    }

    // A single character, or a run that is not a word: the characters' own meanings, and — where the
    // entry attests one — the 通鉴 sentence it was taken from.
    split.hidden = true;
    const data = e.type === 'glyph' ? e.data : null;
    pinyin.textContent = e.type === 'glyph' ? readingOf(data) : '';
    pos.textContent = data?.pos || '';
    type.textContent = e.type === 'glyph' ? '字' : '连读';
    if (e.type === 'glyph') {
      gloss.textContent = glossOf(data);
      note.textContent = sensesOf(data);
      const ex = data?.examples?.[0];
      example.textContent = ex ? `「${ex.text}」　${ex.at || ''}` : '';
    } else {
      gloss.textContent = `「${e.key}」在此不作一词；各字之义如下。`;
      note.textContent = e.chars.map((ch, i) => `${ch}　${glossOf(senseAt(pick.line, pick.from + i).data)}`).join('；');
      example.textContent = '';
    }
  }
  function select(li, ci) {
    const cells = lineCells[li];
    if (cells[ci].punct) return;
    if (pick && pick.line === li && ci === pick.from && ci === pick.to) pick = null;
    else if (pick && pick.line === li && (ci === pick.to + 1 || ci === pick.from - 1)) {
      pick = { line: li, from: Math.min(ci, pick.from), to: Math.max(ci, pick.to) };
    } else pick = { line: li, from: ci, to: ci };
    paint();
  }

  function showWord(w) {
    for (const [li, cells] of lineCells.entries()) {
      const at = cells.map((c) => c.ch).join('').indexOf(w);
      if (at < 0) continue;
      pick = { line: li, from: at, to: at + w.length - 1 };
      paint();
      return true;
    }
    return false;
  }

  // Roving focus across the whole 原文: one Tab stop, arrows to move, Enter or Space to pick. Twenty-odd
  // character buttons in the tab order would be a keyboard trap made of good intentions.
  const onKey = (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest('.zjw-glyph') : null;
    if (!btn) return;
    const li = Number(btn.dataset.line);
    const ci = Number(btn.dataset.cell);
    const live = (n) => glyphs.filter((g) => g.li === n);
    const move = (dLi, dCi) => {
      e.preventDefault();
      let nl = li;
      let nc = ci + dCi;
      while (nl >= 0 && nl < lineCells.length) {
        const row = live(nl);
        if (nc >= 0 && nc < lineCells[nl].length) {
          (row.find((g) => g.ci === nc) || (dCi > 0 ? row[0] : row[row.length - 1])).btn.focus();
          return;
        }
        nl += dLi || (dCi > 0 ? 1 : -1);
        nc = dCi > 0 ? 0 : lineCells[nl]?.length - 1;
      }
    };
    if (e.key === 'ArrowRight') move(0, 1);
    else if (e.key === 'ArrowLeft') move(0, -1);
    else if (e.key === 'ArrowDown') move(1, 0);
    else if (e.key === 'ArrowUp') move(-1, 0);
    else if (e.key === 'Home') { e.preventDefault(); live(li)[0]?.btn.focus(); }
    else if (e.key === 'End') { e.preventDefault(); live(li).at(-1)?.btn.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); pick = null; paint(); }
  };
  wrap.addEventListener('keydown', onKey);

  // ---------- the arrangement, from the stage the frame actually gave us ----------
  // The first measure must always write its attributes: a first pass that found "nothing changed" would
  // leave data-tier off the element and every rule keyed on it unapplied.
  let tier = null;
  let tiny = null;
  let short = null;
  function measure() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const nextTier = hgt < SHORT_H ? 'small' : (w < ONE_COLUMN_W ? 'narrow' : 'wide');
    const nextTiny = hgt < TINY_H;
    const nextShort = hgt < NOTE_H;
    if (nextTier === tier && nextTiny === tiny && nextShort === short) return false;
    tier = nextTier;
    tiny = nextTiny;
    short = nextShort;
    wrap.dataset.tier = tier;
    wrap.dataset.tiny = tiny ? '1' : '0';
    wrap.dataset.short = short ? '1' : '0';
    return true;
  }
  const ro = new ResizeObserver(() => { if (measure()) paint(); });
  ro.observe(root.closest('.tb-figure__stage') || root);
  measure();

  // The figure opens on its first taught word rather than on an empty card: the reader's first sight of
  // it should be a worked example — 大夫 taken apart into 大 and 夫 — not the instruction to go and find
  // one. Every other figure in this book opens the same way (zj-split on 前403年, zj-timeline on the year
  // the chapter is about).
  showWord(WORD_ORDER[0]);
  ctx.onReady();

  return {
    destroy() {
      destroyed = true;
      ro.disconnect();
      wrap.removeEventListener('keydown', onKey);
      root.replaceChildren();
      void destroyed;
    },
    // One unit per taught word: 0 = 大夫, 1 = 诸侯, 2 = 为后. The clock selects that word in the 原文.
    setTime(t) {
      const i = Math.round(Number(t));
      if (Number.isFinite(i)) showWord(WORD_ORDER[Math.min(WORD_ORDER.length - 1, Math.max(0, i))]);
    },
    describe() {
      const e = entry();
      const src = source();
      const known = WORD_ORDER.filter((w) => lookup(w, 'word')).length;
      return {
        selection: e.key || '',
        chars: e.chars || [],
        entryType: e.type,
        pinyin: e.data?.pinyin || '',
        pos: e.data?.pos || '',
        gloss: e.data?.gloss || (e.type === 'glyph' ? lookup(e.key, 'char')?.gloss || '' : ''),
        mark: e.type === 'word' ? TEACH[e.key]?.mark || '' : '',
        line: pick ? pick.line : -1,
        source: src,
        pairs: known,
        tier,
        reduced,
      };
    },
    setVisible() {
      // Nothing runs on its own: the figure is a function of what the reader picked.
    },
    setTheme() {
      // Every colour is a CSS variable, so a theme change repaints the figure with no code of its own.
    },
  };
}
