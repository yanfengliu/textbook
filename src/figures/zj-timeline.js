// 年表 — where 前403年 sits, and why 司马光 began the whole work there.
//
// A 通鉴 year is not one date but a stack of them: the book's own heading is a 周 reign year
// (「威烈王二十三年」), its volume head dates the volume in 岁阴岁阳 names (「起著雍摄提格，尽玄黓困敦，
// 凡三十五年」), and the Western year and the 干支 a modern reader reaches for are additions — the 干支
// from 胡三省's 注, the number from a modern editor. A reader who conflates them cannot see why the book
// opens where it does, so the figure states all three registers and says on its face which is which.
//
// The column carries the years this passage needs: 前453年 (the destruction of 智氏, which 通鉴 narrates
// as background with no year of its own), 前403年 (the year the book opens at), the two reign changes
// between them, 前376年 (晋's extinction), and 前369年 (where 卷001 ends). Selecting a year shows what
// the book says about it, in its own words where the fetched sources give them; where they do not, the
// row shows the dating frame, which is the figure's subject, and nothing is composed to fill the space.
//
// A row never clips its own text. Each row is laid out at its content height (`flex: 1 0 auto`, so it
// grows with what it has to say and never shrinks into its neighbours), and the event string it carries
// is the short one — 晋阳之战, 命为诸侯 — with the full name of the year given in the reading panel,
// where there is room for it. A row whose text is cut in half is a defect no gate here can see.
//
// Clock: one unit per year row, in the order listed (0 = 前453年 … 6 = 前369年). `?t=1` pins 前403年.
// describe() -> { row, rows, year, yearLabel, event, frame, gan, season, tag, quoted, span, tier }.
//
// Two compositions, from the measured stage — its height as much as its width, because the frame keeps
// one aspect ratio at every viewport above 800px, so a 1024px window gives a 704x396 stage and a 1440px
// desktop an 1100x619 one. A width-only breakpoint put the two-column composition into 277px of body and
// clipped the panel's last lines off the bottom:
//   columns (w >= 440) — the year column and the reading panel side by side;
//   stacked (w < 440)  — one column, the years above the panel, on a capped measure (a phone);
// and `dense` (w < 860 or h < 520) steps the type down, drops the reign-year column from the rows and the
// 岁名 from the frame line, and gives the panel the larger share of the width; `tiny` (h < 340) drops the
// panel's note.
//
// The quotation's citation is a third thing, and it is not dropped by any tier. It says whose sentence the
// quotation is, and this whole figure exists to say where 通鑑's words sit, so whether it is drawn is
// MEASURED from the panel's own content rather than keyed to a stage size: `fitCitation` below reads the
// panel against the room it has, and where the panel cannot hold the citation and the note together the
// note yields. The stages this was measured at, and what a reader's phone does, are in the CSS block that
// draws it. `npm run flow`'s `phone-figure-citation` step is the check on the phone load.
import { h } from './lib/svg.js';

// The fields of a row that hold 資治通鑑's own words rather than this figure's. `quote` is the sentence
// the stylesheet marks with `lang="zh-Hant"` and `quoteAt` is its citation — the citation names the work
// rather than quoting it, so it is not here. `scope` is the 卷首 line in the head, which belongs to the
// 卷 rather than to any one year. A year's `season` (著雍攝提格, 玄黓困敦) is a name of the year rather
// than a sentence of the book's, and `body` writes the book's own sentence around it.
// `test/provenance.test.js` holds both directions of this declaration.
export const QUOTED_FIELDS = ['quote', 'scope'];

// 通鑑's own 卷首 line: it says what span the 卷 covers, and the figure prints it above the year column.
// The legend under it is where a reader is told that this line, like the 周纪年, is 通鑑's own text and
// that the 西元 and 干支 beside them were added later.
const SCOPE = { scope: '起著雍攝提格，盡玄黓困敦，凡三十五年' };

export const meta = {
  kind: 'zj-timeline',
  title: '周纪一的年表',
  needsWebGL: false,
  aspect: 16 / 9,
  // At a 390px stage the stacked composition measures 490px against a 4/5 stage's 488 and clipped its
  // last line; 2/3 gives it 585. The three figures of this book share the value, so a reader meets the
  // same shape three times. The registry entry must carry the same number — the frame reads that, not
  // this.
  narrowAspect: 2 / 3,
};

const DEFAULT_ROW = 1;

// Every quotation below is verbatim from the fetched 卷001 (see out/tongjian-recon/sources.md §1 and
// §2.2). A row with no quotation has none to give: a reign change is attested as a heading, not as a
// sentence, and inventing one is the defect this book is built to avoid.
//
// `event` is the year's full name, shown in the panel; `railEvent` is what the row says, kept to four or
// five characters so it fits one line at the narrowest rail the frame makes.
const YEARS = [
  {
    id: 'jinyang',
    year: -453,
    yearLabel: '前453',
    frame: '周贞定王十六年',
    gan: '—',
    season: '',
    event: '晋阳之战 · 智伯之死',
    railEvent: '晋阳之战',
    tag: '追叙',
    quote: '遂殺智伯，盡滅智氏之族。',
    quoteAt: '《资治通鉴》卷一 · 系于前403年条内追叙',
    body: '智伯与韩、魏围赵晋阳，决水灌城；韩、魏反与赵合，杀智伯，尽灭智氏之族，三家分其田。',
    noteLabel: '系年',
    note: '通鉴不为此年立目。胡三省注系于周贞定王十六年；皇甫谧别系于元王十一年。',
  },
  {
    id: 'investiture',
    year: -403,
    yearLabel: '前403',
    frame: '周威烈王二十三年',
    gan: '戊寅',
    season: '著雍攝提格',
    event: '初命三家为诸侯',
    railEvent: '命为诸侯',
    tag: '通鉴开篇',
    quote: '初命晉大夫魏斯、趙籍、韓虔為諸侯。',
    quoteAt: '《资治通鉴》卷一 周纪一 · 开篇第一句',
    body: '周天子命三位晋国大夫为诸侯：魏斯为魏文侯，赵籍为赵烈侯，韩虔为韩景侯。此年未尝分割土地；所易者，名分而已。',
    noteLabel: '何以始于此年',
    note: '胡三省注：「此温公书法所由始也。」司马光曰：三晋之列于诸侯，非三晋之坏礼，乃天子自坏之也。',
  },
  {
    id: 'weilie-24',
    year: -402,
    yearLabel: '前402',
    frame: '周威烈王二十四年',
    gan: '己卯',
    season: '',
    event: '威烈王崩，安王立',
    railEvent: '威烈王崩',
    tag: '',
    quote: '',
    quoteAt: '',
    body: '威烈王崩，子骄立，是为安王。天子易世，而三家受命为诸侯如故。',
    noteLabel: '纪年',
    note: '通鉴次年改书「安王元年」，纪年随天子之世而换。',
  },
  {
    id: 'an-1',
    year: -401,
    yearLabel: '前401',
    frame: '周安王元年',
    gan: '庚辰',
    season: '',
    event: '安王元年',
    railEvent: '安王元年',
    tag: '',
    quote: '',
    quoteAt: '',
    body: '周室纪年自此入安王之世，去前403年之命二年。',
    noteLabel: '',
    note: '',
  },
  {
    id: 'jin-end',
    year: -376,
    yearLabel: '前376',
    frame: '周安王二十六年',
    gan: '乙巳',
    season: '',
    event: '三家灭晋',
    railEvent: '三家灭晋',
    tag: '晋亡',
    quote: '魏、韓、趙共廢晉靖公為家人而分其地。',
    quoteAt: '《资治通鉴》卷一 · 安王二十六年',
    body: '晋君被废为庶人，公室余地尽分，晋亡。距前403年二十七年。是年周王崩，子烈王喜立。',
    noteLabel: '异说',
    note: '一说前349年再分晋静公残余食邑；通鉴系于此年。',
  },
  {
    id: 'lie-1',
    year: -375,
    yearLabel: '前375',
    frame: '周烈王元年',
    gan: '丙午',
    season: '',
    event: '烈王元年',
    railEvent: '烈王元年',
    tag: '',
    quote: '',
    quoteAt: '',
    body: '周室再易世。通鉴卷一自此至前369年而终。',
    noteLabel: '',
    note: '',
  },
  {
    id: 'juan-end',
    year: -369,
    yearLabel: '前369',
    frame: '玄黓困敦',
    gan: '壬子',
    season: '玄黓困敦',
    event: '周纪一讫于此年',
    railEvent: '卷终',
    tag: '卷终',
    quote: '',
    quoteAt: '',
    body: '通鉴卷一 起前403年（著雍攝提格），尽此年（玄黓困敦），凡三十五年。其下入卷二 周纪二。',
    noteLabel: '卷首',
    note: '「起著雍攝提格，盡玄黓困敦，凡三十五年」——通鉴每卷卷首以岁阴岁阳纪年之例。',
  },
];

const STACKED_W = 440;
const STRIP_H = 300; // below this the years lie on their side

const CSS = `
/* The three figures of this book share one system, because a reader meets all three in one sitting:
   a head of 2px --rule-head with a tracked rubric at its left (--text-xs, 600, 0.16em, --ink) and a quiet
   companion line at its right; section labels inside a panel as the same rubric at 0.14em in --ink-faint;
   a hero in --font-text at --text-2xl/500 with a --text-lg/600 serif line under it naming the thing; and
   one selection mark — a 2px seal inset on the edge the selection starts from (the foot of a horizontal
   control, the left of a row in a vertical list), a 6% ink ground and full ink on the label. A rule that
   resets the shared .fig-btn pressed state must reset its colour as well as its background, or the label
   is --paper on a paper-mixed ground: 1.2:1, invisible, and invisible to every gate here. */

.tb-zjt { --zjt-seal: var(--seal, var(--coral)); }
.tb-zjt {
  position: absolute; inset: 0; box-sizing: border-box;
  display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-3); padding: var(--space-4) var(--space-5) var(--space-3);
  font-family: var(--font-ui); color: var(--ink); text-align: left;
}
.tb-zjt .zjt-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3);
  padding-bottom: var(--space-2); border-bottom: 2px solid var(--rule-head); }
.tb-zjt .zjt-title { margin: 0; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.16em; }
.tb-zjt .zjt-scope { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); letter-spacing: 0.04em; color: var(--ink-soft); }
.tb-zjt .zjt-legend { margin: var(--space-2) 0 0; font-size: var(--text-xs); line-height: 1.5; color: var(--ink-faint); }
.tb-zjt .zjt-legend b { font-weight: 600; color: var(--ink-soft); }

.tb-zjt .zjt-body { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: var(--space-5); min-height: 0; }

/* ---------- the column of years ----------
   Rows grow with their text and never shrink into a neighbour: a row that clips its own event is the
   defect this figure was rebuilt for. The rail itself keeps to its box, and every row's height is
   measured by out/zj-figs/shoot.mjs at eight stage shapes. */
.tb-zjt .zjt-rail { display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--rule-strong); }
.tb-zjt .zjt-row { flex: 1 0 auto; display: grid; grid-template-columns: 4.2rem 8.4rem minmax(0, 1fr) auto;
  align-items: center; gap: var(--space-3); text-align: left; background: transparent; border: 0;
  border-bottom: 1px solid var(--rule); border-radius: 0; padding: 0.35rem var(--space-2) 0.35rem var(--space-4); }
.tb-zjt .zjt-row:hover { background: color-mix(in srgb, var(--ink) 4%, transparent); }
/* The selection mark, the same device in all three of this book's figures: a 2px seal inset on the edge
   the selection starts from (the left of a row in a vertical list, the foot of a horizontal control), a
   6% ink ground, and full ink on the label. The pressed state also resets the shared .fig-btn colour,
   which is --paper and would otherwise paint the label invisible on a paper-tinted ground. */
.tb-zjt .zjt-row[aria-pressed="true"] { background: color-mix(in srgb, var(--ink) 6%, transparent);
  color: var(--ink); box-shadow: inset 2px 0 0 var(--zjt-seal); }
.tb-zjt .zjt-row-year { font-family: var(--font-text); font-size: var(--text-base); color: var(--ink-faint);
  font-variant-numeric: lining-nums tabular-nums; white-space: nowrap; }
.tb-zjt .zjt-row[aria-pressed="true"] .zjt-row-year { color: var(--ink); font-weight: 500; }
.tb-zjt .zjt-row-frame { font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--ink-faint); }
.tb-zjt .zjt-row-event { font-family: var(--font-text); font-size: var(--text-base); color: var(--ink-soft); }
.tb-zjt .zjt-row[aria-pressed="true"] .zjt-row-event { color: var(--ink); }
.tb-zjt .zjt-row-tag { font-size: var(--text-xs); letter-spacing: 0.12em; color: var(--zjt-seal); white-space: nowrap; }
.tb-zjt .zjt-row-tag:empty { display: none; }

/* ---------- the panel: what the book says about the selected year ---------- */
.tb-zjt .zjt-panel { display: flex; flex-direction: column; gap: 6px; min-width: 0; min-height: 0; }
.tb-zjt .zjt-date { margin: 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.5em; }
.tb-zjt .zjt-year { font-family: var(--font-text); font-size: var(--text-2xl); font-weight: 500; line-height: 1;
  font-variant-numeric: lining-nums tabular-nums; }
.tb-zjt .zjt-gan { font-size: var(--text-xs); letter-spacing: 0.08em; color: var(--ink-faint); }
/* The date line's second half, and the one thing that is not part of it.
   zj.css paints .zjt-gan with --zj-date-colour, because the 干支 IS the same year in its other calendar,
   and that rule is true only while the element holds a 干支. A year whose 干支 胡三省 did not give would
   otherwise print 「干支未详」 in the colour this book keeps for a date — an absence carrying the mark of
   the thing that is absent — so the phrase gets an element of its own, in --ink-faint: the register the
   panel's other apparatus text uses (5.16:1 on the panel's ground, the same ratio zj.css measured for the
   cell it paints). Gold then means a date on every date line the figure draws, including this one. */
.tb-zjt .zjt-gan-none { font-size: var(--text-xs); letter-spacing: 0.08em; color: var(--ink-faint); }
.tb-zjt .zjt-gan[hidden], .tb-zjt .zjt-gan-none[hidden] { display: none; }
.tb-zjt .zjt-event { margin: 0; font-family: var(--font-text); font-size: var(--text-lg); font-weight: 600; line-height: 1.3; }
.tb-zjt .zjt-frame { margin: 0; font-family: var(--font-text); font-size: var(--text-base); color: var(--ink); }
.tb-zjt .zjt-frame span { font-family: var(--font-ui); font-size: var(--text-xs); color: var(--ink-faint); letter-spacing: 0.06em; }
.tb-zjt .zjt-quote { margin: 0; font-family: var(--font-text); font-size: var(--text-body); line-height: 1.75; text-wrap: pretty; }
.tb-zjt .zjt-quote[hidden], .tb-zjt .zjt-quote-at[hidden], .tb-zjt .zjt-note[hidden] { display: none; }
.tb-zjt .zjt-quote-at { margin: 0; font-size: var(--text-xs); color: var(--ink-faint); }

/* ---------- the citation, drawn where the panel can hold it ----------
   The attribution under a quotation is the strongest provenance statement in this figure: it says whose
   sentence the reader is looking at. So no tier drops it by rule. Whether it is drawn is MEASURED from the
   panel's own content — fitCitation in the module below — because the room it needs depends on how the
   year's own text wraps, which is a function of the stage width and the loaded font rather than of a tier
   name. The default in the two compositions that have to earn their room is off; [data-cite="1"] carries
   more specificity than the rule that hides it, so it needs no order trick.

   Measured by out/zj-citation/before-after.mjs on one page load with both arms, every row, at 2/3 aspect.
   The citation is one line of --text-xs (12px) at the leading it inherits (a 21.6px box), and it costs its
   box plus the panel's own gap. Clearance between the panel's last drawn line and the controls, negative
   being an overlap, on 前453 (the longest citation) and 前403 (the row the book opens at):
     390x585 (a 390px phone, full bleed)  前453 +12.8   前403 +12.8  — both blocks drawn, and +12.8 is
                                                                     what this stage measured before the rule
     360x540                              前453 +12.8   前403  +9.8  — both drawn
     350x525                              前453 +12.2   前403 +31.4  — 前403's note yields
     342x513 (the stage npm run narrow photographs, at the book's own font)  前453 +0.2   前403 +19.4
     320x480                              前453  +3.8   前403 -42.4
   The 320x480 column is not this rule's doing: 前403 already drew its note 42.4px over its own controls
   before it and still does, and the figure has no composition for that stage — the narrowest phone it was
   built for is 360. Where the citation does fit at 320x480 (前453 and 前376) the fit drops the note and
   the clearance improves from -8.2px to +3.8px, so the one stage that was drawing over its own buttons is
   the one this rule made safe rather than worse.
   The 16/9 stages the strip tier gets, measured by out/zj-citation/strip.mjs with the citation forced on:
   480x270 — the stage that tier was designed for — has 19.7px clear and the citation needs 25.6px, so it
   measures -8.3px and the strip keeps the composition it had; 440x247 measures -31.3px and 460x259
   -19.3px; 500x281 fits at +2.7px and is drawn there.
   So at the stages a reader's phone actually gives — 360x540 and up, full bleed — the citation and the
   note are both drawn and the clearance is unchanged from before the rule. Below 360 one of the two has to
   go, and the citation outranks the note: [data-cite-note="0"] takes the note out to make room for the
   attribution, which is a content loss on 前403 at stages 350 wide and under and is named here rather than
   left to be found. Where even that is not enough — 前403 at 320x480 — the citation comes off too, which
   is the composition that shipped before. :not([hidden]) keeps a year with no quotation of its own — four
   of the seven — from being drawn as an empty line. */
.tb-zjt[data-tier="stacked"] .zjt-quote-at,
.tb-zjt[data-tier="strip"] .zjt-quote-at { display: none; }
.tb-zjt[data-cite="1"] .zjt-quote-at:not([hidden]) { display: block; }
.tb-zjt[data-cite-note="0"] .zjt-note { display: none; }
.tb-zjt .zjt-body-text { margin: 0; font-family: var(--font-text); font-size: var(--text-base); line-height: 1.7;
  color: var(--ink-soft); text-wrap: pretty; }
.tb-zjt .zjt-note { margin-top: auto; padding-left: var(--space-3); border-left: 2px solid var(--rule-strong); }
.tb-zjt .zjt-note-label { display: block; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.14em; color: var(--ink-faint); }
.tb-zjt .zjt-note-text { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.6; color: var(--ink-soft); }

.tb-zjt .fig-toolbar { position: static; padding: 0; gap: var(--space-2); pointer-events: auto; }
.tb-zjt, .tb-zjt * { transition: color var(--dur) var(--ease), background var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.tb-zjt.is-reduced, .tb-zjt.is-reduced * { transition: none; }

/* ---------- dense: a smaller stage keeps both columns but steps everything down ---------- */
.tb-zjt[data-dense="1"] { gap: var(--space-2); padding: var(--space-3) var(--space-4) var(--space-2); }
.tb-zjt[data-dense="1"] .zjt-legend { display: none; }
.tb-zjt[data-dense="1"] .zjt-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: var(--space-4); }
.tb-zjt[data-dense="1"] .zjt-panel { gap: 4px; }
.tb-zjt[data-dense="1"] .zjt-row { grid-template-columns: 3.6rem minmax(0, 1fr) auto; gap: var(--space-2);
  padding: 0.25rem var(--space-2) 0.25rem var(--space-3); }
.tb-zjt[data-dense="1"] .zjt-row-frame { display: none; }
.tb-zjt[data-dense="1"] .zjt-row-year, .tb-zjt[data-dense="1"] .zjt-row-event { font-size: var(--text-sm); }
.tb-zjt[data-dense="1"] .zjt-year { font-size: var(--text-xl); }
.tb-zjt[data-dense="1"] .zjt-event { font-size: var(--text-base); }
.tb-zjt[data-dense="1"] .zjt-frame { font-size: var(--text-xs); }
.tb-zjt[data-dense="1"] .zjt-quote { font-size: var(--text-base); line-height: 1.5; }
.tb-zjt[data-dense="1"] .zjt-body-text { font-size: var(--text-sm); line-height: 1.45; }
.tb-zjt[data-dense="1"] .zjt-note-text { font-size: var(--text-xs); line-height: 1.45; }
.tb-zjt[data-dense="1"] .fig-btn { padding: 0.25rem 0.6rem; }

/* ---------- stacked: one column, the years above the panel ----------
   A 390px stage holds seven rows and the reading once the rows are tight and the 卷次 attribution under
   the quotation comes off (the chapter's caption names the volume); 何以始于此年 stays, because it is the
   reason the middle row is the one the book opens at. */
.tb-zjt[data-tier="stacked"] { width: min(34rem, 100%); inset: 0 auto 0 50%; transform: translateX(-50%);
  gap: var(--space-2); padding: var(--space-3) var(--space-3) var(--space-2); }
.tb-zjt[data-tier="stacked"] .zjt-scope { display: none; }
.tb-zjt[data-tier="stacked"] .zjt-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr);
  gap: var(--space-2); }
.tb-zjt[data-tier="stacked"] .zjt-row { padding: 0.05rem var(--space-2) 0.05rem var(--space-3); }
.tb-zjt[data-tier="stacked"] .zjt-row-year, .tb-zjt[data-tier="stacked"] .zjt-row-event { line-height: 1.25; }
/* The note's rubric goes at this size and its text stays: each note names its own register in its first
   words — 「通鉴不为此年立目」, 「一说…」, 「胡三省注：…」 — so the label is the one part that can. */
.tb-zjt[data-tier="stacked"] .zjt-note-label { display: none; }
.tb-zjt[data-tier="stacked"] .zjt-note { padding-left: var(--space-2); }
.tb-zjt[data-tier="stacked"] .zjt-panel { gap: 3px; }
.tb-zjt[data-tier="stacked"] .zjt-body-text { line-height: 1.35; }
.tb-zjt[data-tier="stacked"] .zjt-note-text { line-height: 1.3; }
.tb-zjt[data-tier="stacked"] .zjt-year { font-size: var(--text-lg); }
.tb-zjt[data-tier="stacked"] .zjt-event { font-size: var(--text-sm); }
.tb-zjt[data-tier="stacked"] .zjt-frame { font-size: var(--text-xs); }
.tb-zjt[data-tier="stacked"] .zjt-quote { font-size: var(--text-sm); line-height: 1.5; }
.tb-zjt[data-tier="stacked"] .zjt-body-text { font-size: var(--text-xs); line-height: 1.45; }
.tb-zjt[data-tier="stacked"] .zjt-note-text { font-size: var(--text-xs); line-height: 1.4; }
.tb-zjt[data-tier="stacked"] .fig-toolbar { max-width: 34rem; margin-inline: auto; width: 100%; }
.tb-zjt[data-tier="stacked"] .fig-btn { padding: 0.2rem 0.6rem; }

/* ---------- strip: a stage too short for two columns or for a column of years ----------
   The years lie on their side as one ruled strip and the panel takes the whole width; the panel keeps the
   date, the year's name, the register it is dated in and 通鉴's own sentence, which is what a 480x270
   stage holds. The seven rows are all still there and still pressable. */
.tb-zjt[data-tier="strip"] { gap: var(--space-2); padding: var(--space-2) var(--space-3) var(--space-2); }
.tb-zjt[data-tier="strip"] .zjt-scope, .tb-zjt[data-tier="strip"] .zjt-legend { display: none; }
.tb-zjt[data-tier="strip"] .zjt-head { padding-bottom: var(--space-1); }
.tb-zjt[data-tier="strip"] .zjt-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr);
  gap: var(--space-2); }
.tb-zjt[data-tier="strip"] .zjt-rail { flex-direction: row; border-top: 0; border-bottom: 1px solid var(--rule-strong); }
.tb-zjt[data-tier="strip"] .zjt-row { flex: 1 1 0; min-width: 0; grid-template-columns: minmax(0, 1fr);
  justify-items: center; gap: 0; padding: 0.2rem 0.1rem; border-bottom: 0; border-right: 1px solid var(--rule); }
.tb-zjt[data-tier="strip"] .zjt-row:last-child { border-right: 0; }
.tb-zjt[data-tier="strip"] .zjt-row[aria-pressed="true"] { box-shadow: inset 0 -2px 0 var(--zjt-seal); }
.tb-zjt[data-tier="strip"] .zjt-row-frame,
.tb-zjt[data-tier="strip"] .zjt-row-event,
.tb-zjt[data-tier="strip"] .zjt-row-tag { display: none; }
.tb-zjt[data-tier="strip"] .zjt-row-year { font-size: var(--text-xs); }
.tb-zjt[data-tier="strip"] .zjt-panel { gap: var(--space-1); }
.tb-zjt[data-tier="strip"] .zjt-year { font-size: var(--text-lg); }
.tb-zjt[data-tier="strip"] .zjt-event { font-size: var(--text-sm); }
.tb-zjt[data-tier="strip"] .zjt-quote { font-size: var(--text-sm); line-height: 1.5; }
.tb-zjt[data-tier="strip"] .zjt-body-text,
.tb-zjt[data-tier="strip"] .zjt-note { display: none; }

/* The last block off as the stage gets shorter: a cut-off line reads as a bug, an absent one does not.
   The citation is no longer one of these — it is measured, above — and mini is gone with it: at the
   480x270 stage it was written for, the measurement keeps the citation off by 8.3px, which is the same
   answer arrived at from the panel's content rather than from a height. */
.tb-zjt[data-tiny="1"] .zjt-note { display: none; }
.tb-zjt[data-short="1"] .zjt-note { display: none; }
`;

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  let row = DEFAULT_ROW;

  const wrap = h('div', { class: `tb-zjt${reduced ? ' is-reduced' : ''}` });
  wrap.append(h('style', { text: CSS }));

  const head = h('div', { class: 'zjt-head' }, [
    h('p', { class: 'zjt-title', text: '年表 · 周纪一' }),
    h('p', { class: 'zjt-scope', lang: 'zh-Hant', text: SCOPE.scope }),
  ]);
  // The head says which register each part of a date belongs to, because the figure's whole claim is that
  // they are not the same thing.
  const legend = h('p', { class: 'zjt-legend' }, [
    h('b', { text: '周纪年' }),
    '为通鉴本文（如「威烈王二十三年」）；',
    h('b', { text: '卷首岁名' }),
    '亦通鉴本文（如「著雍攝提格」）；',
    h('b', { text: '西元与干支' }),
    '为后人所加，干支见胡三省注。',
  ]);

  const rows = YEARS.map((y, i) => {
    const btn = h('button', {
      class: 'fig-btn zjt-row', type: 'button', 'data-year': y.yearLabel, 'aria-pressed': 'false',
      'aria-label': `${y.yearLabel}年：${y.event}`,
    }, [
      h('span', { class: 'zjt-row-year', text: y.yearLabel }),
      h('span', { class: 'zjt-row-frame', text: y.frame }),
      h('span', { class: 'zjt-row-event', text: y.railEvent }),
      h('span', { class: 'zjt-row-tag', text: y.tag }),
    ]);
    btn.addEventListener('click', () => go(i));
    return btn;
  });
  const rail = h('div', { class: 'zjt-rail', role: 'group', 'aria-label': '年表' }, rows);

  const yearEl = h('span', { class: 'zjt-year' });
  // Two elements, not one with two jobs: .zjt-gan holds the date's 干支 and zj.css paints it as a date,
  // and the phrase for a missing 干支 is a statement about the record, so it is a different element in the
  // quiet ink (see the rule in CSS above). Both live in the date line, where a reader looks for the
  // second half of the date, and exactly one of them is ever shown.
  const ganEl = h('span', { class: 'zjt-gan' });
  const ganNoneEl = h('span', { class: 'zjt-gan-none' });
  const eventEl = h('p', { class: 'zjt-event' });
  const frameEl = h('p', { class: 'zjt-frame' });
  const quoteEl = h('blockquote', { class: 'zjt-quote', lang: 'zh-Hant' });
  const quoteAtEl = h('p', { class: 'zjt-quote-at' });
  const bodyEl = h('p', { class: 'zjt-body-text' });
  const noteLabelEl = h('span', { class: 'zjt-note-label' });
  const noteTextEl = h('p', { class: 'zjt-note-text' });
  const noteEl = h('div', { class: 'zjt-note' }, [noteLabelEl, noteTextEl]);
  const panel = h('div', { class: 'zjt-panel', 'aria-live': 'polite' }, [
    h('p', { class: 'zjt-date' }, [yearEl, ganEl, ganNoneEl]),
    eventEl,
    frameEl,
    quoteEl,
    quoteAtEl,
    bodyEl,
    noteEl,
  ]);

  const prev = h('button', { class: 'fig-btn zjt-prev', type: 'button', 'aria-label': '前一年', text: '← 前一年' });
  const next = h('button', { class: 'fig-btn zjt-next', type: 'button', 'aria-label': '后一年', text: '后一年 →' });
  prev.addEventListener('click', () => go(row - 1));
  next.addEventListener('click', () => go(row + 1));
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, [prev, next]);

  wrap.append(h('div', { class: 'zjt-headblock' }, [head, legend]), h('div', { class: 'zjt-body' }, [rail, panel]), toolbar);
  root.append(wrap);

  function paint() {
    const y = YEARS[row];
    wrap.dataset.year = y.id;
    yearEl.textContent = y.yearLabel;
    // A year whose 干支 the sources do not give says so, and says it in the register of a note rather than
    // the register of a date: the 干支 element is emptied and hidden, and the phrase stands beside the year
    // in the same slot, in this figure's own ink.
    ganEl.textContent = y.gan === '—' ? '' : `· ${y.gan}`;
    ganEl.hidden = y.gan === '—';
    ganNoneEl.textContent = y.gan === '—' ? '干支未详' : '';
    ganNoneEl.hidden = y.gan !== '—';
    eventEl.textContent = y.event;
    // At a dense stage the frame line carries the reign year and the register it belongs to, and leaves
    // the 卷首岁名 for a stage with room for it: two lines of 12px is 40px a 396px stage does not have.
    frameEl.replaceChildren(
      document.createTextNode(y.frame),
      h('span', { text: dense ? '　通鉴纪年' : (y.season ? `　通鉴纪年 · 卷首岁名 ${y.season}` : '　通鉴纪年') }),
    );
    quoteEl.textContent = y.quote ? `「${y.quote}」` : '';
    quoteEl.hidden = !y.quote;
    quoteAtEl.textContent = y.quoteAt;
    quoteAtEl.hidden = !y.quoteAt;
    bodyEl.textContent = y.body;
    noteLabelEl.textContent = y.noteLabel;
    noteTextEl.textContent = y.note;
    noteEl.hidden = !y.note;
    rows.forEach((b, i) => b.setAttribute('aria-pressed', String(i === row)));
    prev.disabled = row === 0;
    next.disabled = row === YEARS.length - 1;
    // The row decides what the panel holds, so the fit is taken again on every paint, not only on a
    // resize: a year with no quotation has no citation to place and must not cost its note for one.
    fitCitation();
  }

  function go(i) {
    row = Math.min(YEARS.length - 1, Math.max(0, i));
    paint();
  }

  const onKey = (e) => {
    if (!(e.target instanceof HTMLButtonElement) || !rail.contains(e.target)) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(row + 1); rows[row].focus(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(row - 1); rows[row].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); rows[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); go(YEARS.length - 1); rows[row].focus(); }
  };
  rail.addEventListener('keydown', onKey);

  // ---------- the arrangement, from the measured stage ----------
  // The first measure must always write: the values start as null, not as the common case, because a
  // first pass that finds nothing changed leaves `data-tier` off the element and every rule keyed on it
  // unapplied — the whole composition then silently runs as the base layout.
  let tier = null;
  let dense = null;
  let tiny = null;
  let short = null;

  // Does everything the panel draws stay clear of the controls below it? The panel's box is not the whole
  // room it has — a gap separates it from the toolbar and a line that spills into that empty space is
  // still read, which the shipped composition already relies on (5.4px at the 342x513 stage, before this
  // rule existed). So the test is where the CONTENT ends against where the controls begin: scrollHeight
  // is the content's own height once it passes the box, and anything that reaches the toolbar fails. It is
  // read AFTER the data-cite attribute is written, because reading a layout property flushes style and the
  // rule that draws the citation is what the answer is about.
  const panelClears = () => panel.getBoundingClientRect().bottom
    + Math.max(0, panel.scrollHeight - panel.clientHeight) <= toolbar.getBoundingClientRect().top;

  // Whether the quotation's citation is drawn, MEASURED rather than keyed to a stage size. Three answers,
  // in the order of what the figure is for: the panel holds the citation and its note (the stages a
  // reader's phone gives, 360x540 and up); the note yields so the attribution can stand (350x525, the
  // lab's 342x513, at 前403); neither fits and the composition is the one that shipped before, with the
  // note and no attribution (前403 at 320x480, the 480x270 strip). Dropping a block never makes room for
  // fewer blocks, so the third answer is a fixed point and this cannot oscillate. A row with no quotation
  // of its own has no citation to place.
  function fitCitation() {
    const has = !quoteAtEl.hidden && quoteAtEl.textContent !== '';
    if (!has || (tier !== 'stacked' && tier !== 'strip')) {
      wrap.dataset.cite = '0';
      wrap.dataset.citeNote = '1';
      return;
    }
    wrap.dataset.cite = '1';
    wrap.dataset.citeNote = '1';
    if (panelClears()) return;
    wrap.dataset.citeNote = '0';
    if (panelClears()) return;
    wrap.dataset.cite = '0';
    wrap.dataset.citeNote = '1';
  }

  function measure() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hgt = Math.round(r.height);
    if (!w || !hgt) return false;
    const nextTier = w < STACKED_W ? 'stacked' : (hgt < STRIP_H ? 'strip' : 'columns');
    const nextDense = w < 860 || hgt < 520;
    const nextTiny = hgt < 340;
    // The panel's note is the last block to come off as the stage gets shorter: 何以始于此年 is the
    // reason the middle row is the one the book opens at, and it is worth 33px a 656x369 stage does not
    // have. The note's own text names its register, so the column reads without it.
    const nextShort = hgt < 420;
    const changed = !(nextTier === tier && nextDense === dense && nextTiny === tiny && nextShort === short);
    if (changed) {
      tier = nextTier;
      dense = nextDense;
      tiny = nextTiny;
      short = nextShort;
      wrap.dataset.tier = tier;
      wrap.dataset.dense = dense ? '1' : '0';
      wrap.dataset.tiny = tiny ? '1' : '0';
      wrap.dataset.short = short ? '1' : '0';
    }
    // Re-taken on every measure, not only when a size flag moved: it is a question about the panel's
    // content and the font it is set in, not about the stage's box alone.
    fitCitation();
    return changed;
  }
  const ro = new ResizeObserver(() => { measure(); });
  ro.observe(root.closest('.tb-figure__stage') || root);
  measure();

  // The two Han families arrive after this module mounts, and how the year's text wraps is exactly what
  // the fit above measures, so it is taken again once they are in. `document.fonts.ready` resolves on a
  // page that loads no webfont too, and `measure` re-reads the stage, so a late font cannot leave a stale
  // answer standing.
  let dead = false;
  document.fonts?.ready?.then(() => { if (!dead) measure(); });

  paint();
  ctx.onReady();

  return {
    destroy() {
      dead = true;
      ro.disconnect();
      rail.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    // One unit per row, in the order the rail lists them: 0 = 前453年 … 6 = 前369年.
    setTime(t) {
      const i = Math.round(Number(t));
      if (Number.isFinite(i)) go(i);
    },
    describe() {
      const y = YEARS[row];
      return {
        row,
        rows: YEARS.length,
        year: y.year,
        yearLabel: y.yearLabel,
        event: y.event,
        frame: y.frame,
        gan: y.gan,
        season: y.season,
        tag: y.tag,
        quoted: Boolean(y.quote),
        span: '前403–前369',
        tier,
        reduced,
      };
    },
    setVisible() {
      // Nothing runs on its own: the figure is a function of the row the reader selected.
    },
    setTheme() {
      // Every colour is a CSS variable, so a theme change repaints the figure with no code of its own.
    },
  };
}
