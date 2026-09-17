// 三家分晋 — the figure for 卷一 周纪一's opening: what each of its three dates actually is.
//
// The mistake this figure exists to prevent is reading 前403年 as the year 晋 was divided. It was not.
// 通鉴 opens at the year the 周 king recognised three of 晋's 大夫 as 诸侯 — 「初命晋大夫魏斯、赵籍、
// 韩虔为诸侯」 — an act of naming, not of drawing borders. The land had already moved at 晋阳 (453,
// narrated by 通鉴 as background inside the 403 entry, with no year of its own) and 晋 itself lived on
// until 376, when its last lord was deposed. So the figure has three steps, and each step says what that
// date *is*, with the sentence 通鉴 gives it.
//
// The drawing is the state as a plate: the 周 court on its head rule, the three houses across its middle,
// the 智 clan's band under them, the 公室's band at the foot. Stepping changes what the plate says; at
// 403 the court's 命 seal turns the rule under it red and drops a hairline into each of the three houses
// — one command, three men — which is the whole content of the date.
//
// Clock: one unit per step. 0 = 前453, 1 = 前403 (the year the book opens at), 2 = 前376. `?t=1` pins
// the middle one. describe() -> { order, steps, year, yearLabel, phase, frame, houses, houseStatus, zhi,
// jinRemnant, commanded, tier, tiny, reduced }.
//
// Three arrangements, chosen from the measured stage — its height as much as its width, because the frame
// keeps one aspect ratio at every viewport above 800px, so a 1024px laptop gets a 704x440 stage and a
// 1440px desktop a 1100x687 one. A width-only breakpoint put the full two-column composition into 316px
// of body and clipped the last three lines off the panel:
//   wide   (h >= 470 and w >= 620) — plate and panel side by side, everything shown;
//   small  (h < 470)               — the same two columns, tightened: no folio, shorter plate rows;
//   narrow (h >= 470 and w < 620)  — one column, the full reading, centred in a capped measure;
// and under 400px of height the plate drops its lineage line and the panel its apparatus (臣光曰 and the
// source), because at that size they are the difference between a figure and a cropped one.
import { h } from './lib/svg.js';

// The fields of a step that hold 資治通鑑's own words rather than this figure's. A reader is told which
// is which by the mark the stylesheet puts on `lang="zh-Hant"`, and a checker reads this list to know
// what the figure claims — a 通鑑 sentence in a field that is not here is a quotation the book never
// says is one. `test/provenance.test.js` holds both directions. `source` and `asideLabel` are the
// citation, not the text: they name the work rather than quoting it.
export const QUOTED_FIELDS = ['quote', 'aside'];

export const meta = {
  kind: 'zj-split',
  title: '三家分晋：从灭智到命侯',
  needsWebGL: false,
  aspect: 16 / 10,
  // At a 390px stage the one-column composition needs about 550px for the plate, the sentence, the
  // 臣光曰 line and the stops; 4/5 gives it 487 and clipped the last three lines. 2/3 gives 585.
  narrowAspect: 2 / 3,
};

// The step the figure opens on when no clock is pinned: 前403年, the date the 通鉴 itself opens at.
const DEFAULT_ORDER = 1;

const STEPS = [
  {
    key: 'jinyang',
    year: -453,
    yearLabel: '前453',
    frame: '周贞定王十六年',
    king: '贞定王',
    kingYear: '十六年',
    courtNote: '通鉴此年无目',
    event: '晋阳之战 · 智伯之死',
    stopName: '智伯死',
    quote: '遂殺智伯，盡滅智氏之族。',
    source: '《资治通鉴》卷一 · 系于前403年条内追叙',
    note: '智伯率韩、魏围赵晋阳，决水灌城；韩、魏反与赵合，杀智伯，尽灭智氏之族，三家分其田。通鉴不为此年立目，其事附见于前403年条。',
    asideLabel: '异说',
    aside: '胡三省系于周贞定王十六年；皇甫谧别系于元王十一年。',
    zhiNote: '前四五三年，三家杀之，尽灭其族，分其田。',
    dukeNote: '晋君之公室犹在',
    mark: '',
    commanded: false,
  },
  {
    key: 'investiture',
    year: -403,
    yearLabel: '前403',
    frame: '周威烈王二十三年',
    king: '威烈王',
    kingYear: '二十三年',
    courtNote: '天子之命',
    event: '命三家为诸侯',
    stopName: '命诸侯',
    quote: '初命晉大夫魏斯、趙籍、韓虔為諸侯。',
    source: '《资治通鉴》卷一 周纪一 · 开篇第一句',
    note: '周天子命三位晋国大夫——魏斯、赵籍、韩虔——为诸侯。此年未尝分割土地；所易者，名分而已。',
    asideLabel: '臣光曰',
    aside: '故三晉之列於諸侯，非三晉之壞禮，乃天子自壞之也。',
    zhiNote: '智氏已灭，其田分入三家。',
    dukeNote: '受命之后，晋君尚保绛、曲沃二城，与三家并立二十七年。',
    mark: '《资治通鉴》全书始于此年',
    commanded: true,
  },
  {
    key: 'end',
    year: -376,
    yearLabel: '前376',
    frame: '周安王二十六年',
    king: '安王',
    kingYear: '二十六年',
    courtNote: '是年王崩，子烈王喜立',
    event: '三家灭晋',
    stopName: '晋亡',
    quote: '魏、韓、趙共廢晉靖公為家人而分其地。',
    source: '《资治通鉴》卷一 · 安王二十六年',
    note: '晋君被废为庶人，公室余地尽分。自前403年受命至此二十七年，晋亡。',
    asideLabel: '异说',
    aside: '一说前349年再分晋静公残余食邑；通鉴系于此年。',
    zhiNote: '智氏已灭，其田分入三家。',
    // The band note is this figure's own sentence about the house of 晋. The 通鑑 line that says the
    // same thing is the step's `quote`, printed once with its citation; putting it here as well would
    // print 通鑑's words a second time with nothing beside them to say whose they are.
    dukeNote: '晋君被废为家人，公室余地尽分，晋亡。',
    mark: '',
    commanded: false,
  },
];

// 魏、赵、韩 in 通鉴's own order, each with the place it holds in the 智伯 story and the line 通鉴 gives
// its man. The places are the ones the passage or 胡三省's 注 gives; no map is drawn, because no fetched
// source gives coordinates and a coast-line nobody can check is a fact invented by the person drawing it.
// The lineage is 通鉴's own sentence in B (「魏斯者，桓子之孙也，是为文侯」 and the two beside it); where
// 世本 disagrees with it the book prints 通鉴 and notes the conflict, which is W4's prose to carry.
const HOUSES = [
  { key: 'wei', char: '魏', man: '斯', place: '安邑', line: '桓子之孙，是为文侯' },
  { key: 'zhao', char: '赵', man: '籍', place: '晋阳', line: '献子之子，是为烈侯' },
  { key: 'han', char: '韩', man: '虔', place: '平阳', line: '康子之孙，是为景侯' },
];

// The stage sizes the three arrangements are cut for, in CSS pixels. 470 is where the full two-column
// composition stops fitting: at 620x470 its panel needs about 320px of body and has 346. 400 is where the
// plate's role line and the panel's apparatus stop fitting at all.
const WIDE_MIN_H = 470;
const NARROW_MAX_W = 620;
const TINY_H = 400;
// The height below which the plate's two band notes come off. 545 is the lab's phone stage (342x513)
// plus a margin: there the system Han fallback makes every line ~15% taller than the book's own face,
// and the notes are what pushed the panel under the toolbar at that size.
const TIGHT_H = 545;

const CSS = `
/* The three figures of this book share one system, because a reader meets all three in one sitting:
   a head of 2px --rule-head with a tracked rubric at its left (--text-xs, 600, 0.16em, --ink) and a quiet
   companion line at its right; section labels inside a panel as the same rubric at 0.14em in --ink-faint;
   a hero in --font-text at --text-2xl/500 with a --text-lg/600 serif line under it naming the thing; and
   one selection mark — a 2px seal inset on the edge the selection starts from (the foot of a horizontal
   control, the left of a row in a vertical list), a 6% ink ground and full ink on the label. A rule that
   resets the shared .fig-btn pressed state must reset its colour as well as its background, or the label
   is --paper on a paper-mixed ground: 1.2:1, invisible, and invisible to every gate here. */

/* The page's seal red if W1's zj.css defines one, the palette's coral if it does not: a figure never
   carries a hex of its own. It is used here for one thing only — the act of 前403年. */
.tb-zjs { --zjs-seal: var(--seal, var(--coral)); }

.tb-zjs {
  position: absolute; inset: 0; box-sizing: border-box;
  display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-3); padding: var(--space-4) var(--space-5) var(--space-3);
  font-family: var(--font-ui); color: var(--ink); text-align: left;
}
.tb-zjs .zjs-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3);
  padding-bottom: var(--space-2); border-bottom: 2px solid var(--rule-head); }
.tb-zjs .zjs-rubric { margin: 0; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.16em; color: var(--ink); }
.tb-zjs .zjs-folio { margin: 0; font-size: var(--text-xs); letter-spacing: 0.08em; color: var(--ink-faint); }

.tb-zjs .zjs-body { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 4fr); gap: var(--space-5); min-height: 0; }

/* ---------- the plate: the 周 court above, the state of 晋 below ----------
   The plate is not a second surface: the stage is already the ground, so the plate is its rule and the
   one band that has to read as somewhere else — the court's. The band is mixed from --ink, which is dark
   on the light paper and light on the dark one, so it reads as the same band in both themes. */
.tb-zjs .zjs-field { display: grid; grid-template-rows: auto minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 0.9fr);
  min-height: 0; border: 1px solid var(--rule-strong); }
.tb-zjs .zjs-court { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem;
  background: color-mix(in srgb, var(--ink) 5%, var(--paper-2)); border-bottom: 1px solid var(--rule-strong); }
.tb-zjs.is-commanded .zjs-court { border-bottom-color: var(--zjs-seal); }
.tb-zjs .zjs-court-name { font-family: var(--font-text); font-size: var(--text-lg); line-height: 1; }
.tb-zjs .zjs-court-king { font-family: var(--font-text); font-size: var(--text-base); line-height: 1; }
.tb-zjs .zjs-court-year { font-size: var(--text-xs); letter-spacing: 0.06em; color: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.tb-zjs .zjs-court-note { margin-left: auto; font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--ink-faint); }
/* The seal: the figure's one piece of colour, and the only thing on the plate that 前403年 adds. */
.tb-zjs .zjs-seal { flex: none; display: none; width: 1.9rem; height: 1.9rem; border: 2px solid var(--zjs-seal);
  border-radius: 3px; color: var(--zjs-seal); font-family: var(--font-text); font-size: 1.15rem; line-height: 1.65rem; text-align: center; }
.tb-zjs.is-commanded .zjs-seal { display: block; }
.tb-zjs .zjs-court-note + .zjs-seal { margin-left: var(--space-2); }

.tb-zjs .zjs-houses { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); min-height: 0; }
/* The plate's own label sits on the rule the command crosses, the way a figure's number sits on a rule. */
.tb-zjs .zjs-plate-label { position: absolute; top: -0.68em; left: 0.7rem; margin: 0; padding: 0 0.4rem;
  background: var(--paper-2); font-family: var(--font-text); font-size: var(--text-sm); letter-spacing: 0.1em; color: var(--ink); }
.tb-zjs .zjs-plate-label[data-jin="亡"] { color: var(--ink-faint); text-decoration: line-through; }
.tb-zjs .zjs-house { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.12rem; padding: var(--space-3) var(--space-2); min-width: 0; }
.tb-zjs .zjs-house + .zjs-house { border-left: 1px solid var(--rule); }
/* Where the command lands: a hairline dropped from the court's rule into the house it names. */
.tb-zjs .zjs-house::before { content: ""; position: absolute; top: 0; left: 50%; width: 1px; height: 0.55rem;
  background: var(--zjs-seal); opacity: 0; }
.tb-zjs.is-commanded .zjs-house::before { opacity: 1; }
.tb-zjs .zjs-house-name { margin: 0; display: flex; align-items: baseline; gap: 0.3em; line-height: 1.2; }
.tb-zjs .zjs-house-char { font-family: var(--font-text); font-size: 2.3rem; font-weight: 500; line-height: 1; }
.tb-zjs .zjs-house-man { font-family: var(--font-text); font-size: var(--text-lg); line-height: 1; color: var(--ink-soft); }
/* The 氏 of each house takes the book's house colour where the book is loaded. This plate is the one place
   in the book that ENUMERATES 魏、趙、韓 as a set, and it is where a reader who has learned the key — from
   the 世系 table, chapter 1's 字 list, the glossary — sees it apply, so the three names read as three
   families rather than as three words. tongjian/zj.css declares --zj-state-wei/zhao/han on .zj, which is
   on <body> of a chapter page, and a custom property inherits from there into this figure. (No backtick
   quoting anywhere below: this whole block is one CSS template literal, and a lone backtick in a comment
   closes it. That defect has already hit this file once — test/registry.test.js now fails a module that
   does not parse, and defect-register.md's 2026-09-12 entry is the record.)

   The second value is for the pages that do NOT load the book's sheet, and they are the ones a worker
   looks at: npm run figure, npm run drive and npm run narrow all mount this figure on lab/index.html,
   which carries the shared tokens and no .zj. Without it var() is invalid at computed-value time and
   color falls back to inherited ink — the plate would lose the colour exactly where it is being judged.
   Each fallback is the shared accent the book's own value is mixed from: 趙 and 韓 land on the value the
   book uses (--coral-text, --leaf-text), 魏 on the accent itself, because --violet-text is not a token in
   src/styles/tokens.css — a step brighter than the book's mix, which is the harsher of the two to judge.
   No hex of this figure's own, and no second copy of the book's arithmetic.

   Only the 氏 glyph takes it. 斯、籍、虔 are men, the place, the lineage and the title are the cell's
   apparatus, and the 智 band below keeps what it had — the faint grey and the line-through already say
   that house is gone, which is the statement --zj-state-zhi makes in the prose. */
.tb-zjs .zjs-house[data-house="wei"] .zjs-house-char { color: var(--zj-state-wei, var(--violet)); }
.tb-zjs .zjs-house[data-house="zhao"] .zjs-house-char { color: var(--zj-state-zhao, var(--coral-text)); }
.tb-zjs .zjs-house[data-house="han"] .zjs-house-char { color: var(--zj-state-han, var(--leaf-text)); }
.tb-zjs .zjs-house-place { margin: 0; font-size: var(--text-xs); letter-spacing: 0.12em; color: var(--ink-faint); }
.tb-zjs .zjs-house-line { margin: 0; font-size: var(--text-xs); letter-spacing: 0.02em; color: var(--ink-faint); text-align: center; }
.tb-zjs .zjs-house-title { margin: 0.1rem 0 0; font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--ink-soft); text-align: center; }
.tb-zjs .zjs-house-title b { font-weight: 600; color: var(--ink); }
.tb-zjs .zjs-house-title .zjs-arrow { color: var(--zjs-seal); padding: 0 0.2em; }
.tb-zjs .zjs-gain { margin: 0; font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--ink-faint); }

.tb-zjs .zjs-band { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-4);
  border-top: 1px solid var(--rule); min-width: 0; }
.tb-zjs .zjs-band-name { margin: 0; flex: none; display: flex; align-items: baseline; gap: 0.25em; }
.tb-zjs .zjs-band-char { font-family: var(--font-text); font-size: var(--text-xl); line-height: 1.15; }
.tb-zjs .zjs-band-sub { font-size: var(--text-xs); color: var(--ink-soft); }
.tb-zjs .zjs-band-note { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.5; color: var(--ink-soft); }
.tb-zjs .zjs-band.is-dead .zjs-band-char { color: var(--ink-faint); text-decoration: line-through; text-decoration-thickness: 1px; }
.tb-zjs .zjs-band.is-dead .zjs-band-note { color: var(--ink-faint); }

/* ---------- the panel: what 通鉴 says at this date ----------
   The reading sits at the head of the column and the apparatus — the commentator's line, the volume, and
   the marker that this is where the book begins — at its foot, above a rule. A footnote is where 臣光曰
   belongs, and it keeps the page from being a paragraph adrift in white. */
.tb-zjs .zjs-panel { display: flex; flex-direction: column; gap: var(--space-2); min-width: 0; min-height: 0; }
.tb-zjs .zjs-date { margin: 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.5em; }
.tb-zjs .zjs-year { font-family: var(--font-text); font-size: var(--text-2xl); font-weight: 500; line-height: 1;
  font-variant-numeric: lining-nums tabular-nums; }
.tb-zjs .zjs-frame { font-size: var(--text-xs); letter-spacing: 0.08em; color: var(--ink-faint); }
.tb-zjs .zjs-event { margin: 0; font-family: var(--font-text); font-size: var(--text-lg); font-weight: 600; line-height: 1.3; }
.tb-zjs .zjs-quote { margin: 0; font-family: var(--font-text); font-size: var(--text-body); line-height: 1.75;
  color: var(--ink); text-wrap: pretty; }
.tb-zjs .zjs-note { margin: 0; font-family: var(--font-text); font-size: var(--text-base); line-height: 1.7;
  color: var(--ink-soft); text-wrap: pretty; }
.tb-zjs .zjs-foot { margin-top: auto; display: flex; flex-direction: column; gap: var(--space-2);
  padding-top: var(--space-3); border-top: 1px solid var(--rule); }
.tb-zjs .zjs-aside { margin: 0; padding-left: var(--space-3); border-left: 2px solid var(--rule-strong); }
.tb-zjs .zjs-aside-label { display: block; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.14em; color: var(--ink-faint); }
.tb-zjs .zjs-aside-text { margin: 0; font-family: var(--font-text); font-size: var(--text-sm); line-height: 1.6; color: var(--ink-soft); }
.tb-zjs .zjs-mark { margin: 0; font-size: var(--text-xs); letter-spacing: 0.06em; color: var(--zjs-seal); }
.tb-zjs .zjs-mark[hidden], .tb-zjs .zjs-aside[hidden] { display: none; }
.tb-zjs .zjs-source { margin: 0; font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--ink-faint); }

/* ---------- the stops: the step control, and the three dates with their meanings ---------- */
.tb-zjs .fig-toolbar { position: static; padding: 0; gap: var(--space-2); pointer-events: auto; }
.tb-zjs .zjs-stop { flex: 1 1 0; min-width: 0; display: grid; gap: 0.1rem; text-align: left; background: transparent;
  border-radius: var(--radius); padding: 0.35rem 0.7rem 0.4rem; }
.tb-zjs .zjs-stop-year { font-family: var(--font-text); font-size: var(--text-base); font-weight: 500; color: var(--ink-faint);
  font-variant-numeric: lining-nums tabular-nums; }
.tb-zjs .zjs-stop-name { font-size: var(--text-xs); color: var(--ink-faint); }
.tb-zjs .zjs-stop:hover .zjs-stop-year { color: var(--ink); }
/* The pressed state resets everything the shared .fig-btn[aria-pressed="true"] sets — background, colour
   and border. A rule that resets one of the three leaves the label in --paper on a paper-mixed ground,
   which is a 1.2:1 label: invisible, and invisible in a way no gate here measures. */
.tb-zjs .zjs-stop[aria-pressed="true"] { background: color-mix(in srgb, var(--ink) 6%, transparent);
  border-color: var(--ink); color: var(--ink); box-shadow: inset 0 -2px 0 var(--zjs-seal); }
.tb-zjs .zjs-stop[aria-pressed="true"] .zjs-stop-year,
.tb-zjs .zjs-stop[aria-pressed="true"] .zjs-stop-name { color: var(--ink); }

/* Motion here is a state change, not an animation: reduced motion makes it a cut. */
.tb-zjs, .tb-zjs * { transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease), background var(--dur) var(--ease); }
.tb-zjs.is-reduced, .tb-zjs.is-reduced * { transition: none; }

/* ---------- small: the same two columns, tightened for a short stage (a 1024px laptop's 704x440) ----------
   The panel needs about 300px of height at that size and has 279, so at this tier it takes the wider
   share of the body, its blocks sit one gap closer, and the volume line comes off — the caption carries
   it. The plate's rows are content-sized here: fractional rows in a short body squeeze below their own
   text, and the text then paints over the band below it. */
.tb-zjs[data-tier="small"] { gap: var(--space-2); padding: var(--space-3) var(--space-4) var(--space-2); }
.tb-zjs[data-tier="small"] .zjs-folio { display: none; }
.tb-zjs[data-tier="small"] .zjs-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: var(--space-4); }
.tb-zjs[data-tier="small"] .zjs-panel { gap: var(--space-1); }
.tb-zjs[data-tier="small"] .zjs-source { display: none; }
.tb-zjs[data-tier="small"] .zjs-foot { padding-top: var(--space-2); }
.tb-zjs[data-tier="small"] .zjs-court { padding: 0.25rem 0.6rem; }
.tb-zjs[data-tier="small"] .zjs-court-note { display: none; }
.tb-zjs[data-tier="small"] .zjs-court-note + .zjs-seal { margin-left: auto; }
.tb-zjs[data-tier="small"] .zjs-seal { width: 1.5rem; height: 1.5rem; border-width: 1.5px; font-size: 0.95rem; line-height: 1.3rem; }
.tb-zjs[data-tier="small"] .zjs-field { grid-template-rows: auto auto auto auto; }
.tb-zjs[data-tier="small"] .zjs-house { gap: 0.05rem; padding: var(--space-2) var(--space-1); }
.tb-zjs[data-tier="small"] .zjs-house-char { font-size: 1.7rem; }
.tb-zjs[data-tier="small"] .zjs-house-man { font-size: var(--text-base); }
.tb-zjs[data-tier="small"] .zjs-house-place, .tb-zjs[data-tier="small"] .zjs-gain { display: none; }
.tb-zjs[data-tier="small"] .zjs-band { padding: 0.3rem 0.7rem; gap: var(--space-2); }
.tb-zjs[data-tier="small"] .zjs-band-char { font-size: var(--text-lg); }
.tb-zjs[data-tier="small"] .zjs-band-note { font-size: var(--text-xs); line-height: 1.45; }
.tb-zjs[data-tier="small"] .zjs-year { font-size: var(--text-xl); }
.tb-zjs[data-tier="small"] .zjs-event { font-size: var(--text-base); }
.tb-zjs[data-tier="small"] .zjs-quote { font-size: var(--text-base); line-height: 1.6; }
.tb-zjs[data-tier="small"] .zjs-note { font-size: var(--text-sm); line-height: 1.55; }
.tb-zjs[data-tier="small"] .zjs-aside-text { font-size: var(--text-xs); line-height: 1.5; }
.tb-zjs[data-tier="small"] .zjs-stop { padding: 0.25rem 0.6rem 0.3rem; }
.tb-zjs[data-tier="small"] .zjs-stop-year { font-size: var(--text-sm); }

/* Under 400px of height — a phone in landscape, a browser window at 800px — the plate keeps its names,
   its status line and its struck-through dead, and the panel keeps the date, the sentence and the book's
   own words. The lineage, the two band notes, the explanation, the 臣光曰 line and the volume come off:
   at 480x300 the body row is 161px and the plate has to be 147 of it. Every court label is nowrap and a
   step down, because a span that wraps inside itself is what turned the reign year into three lines
   there. A cut-off line reads as a bug; an absent one does not. */
.tb-zjs[data-tiny="1"] { gap: var(--space-1); }
.tb-zjs[data-tiny="1"] .zjs-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: var(--space-3); }
.tb-zjs[data-tiny="1"] .zjs-court { padding: 0.15rem 0.4rem; gap: 0.25rem; }
.tb-zjs[data-tiny="1"] .zjs-court-name { font-size: var(--text-base); }
.tb-zjs[data-tiny="1"] .zjs-court-king { font-size: var(--text-sm); }
.tb-zjs[data-tiny="1"] .zjs-court-year { font-size: 0.6875rem; white-space: nowrap; }
.tb-zjs[data-tiny="1"] .zjs-court-king, .tb-zjs[data-tiny="1"] .zjs-court-name { white-space: nowrap; }
.tb-zjs[data-tiny="1"] .zjs-seal { width: 1.25rem; height: 1.25rem; border-width: 1.5px; font-size: 0.8rem; line-height: 1.05rem; }
.tb-zjs[data-tiny="1"] .zjs-house { padding: 0.2rem 0.1rem; gap: 0; }
.tb-zjs[data-tiny="1"] .zjs-house-char { font-size: 1.25rem; }
.tb-zjs[data-tiny="1"] .zjs-house-man { font-size: var(--text-xs); }
.tb-zjs[data-tiny="1"] .zjs-band { padding: 0.15rem 0.5rem; }
.tb-zjs[data-tiny="1"] .zjs-band-char { font-size: var(--text-base); }
.tb-zjs[data-tiny="1"] .zjs-band-sub { font-size: 0.6875rem; }
.tb-zjs[data-tiny="1"] .zjs-house-line,
.tb-zjs[data-tiny="1"] .zjs-band-note,
.tb-zjs[data-tiny="1"] .zjs-note,
.tb-zjs[data-tiny="1"] .zjs-aside,
.tb-zjs[data-tiny="1"] .zjs-source { display: none; }

/* A stage under 545px of height is the one the lab gives a phone (the narrow gate's 342x513), where the
   system Han fallback makes every line box taller than the book's Noto face does. At 342x513 the body row
   is 391px and the plate and the reading want 398, so the lineage line, the two band notes and the plain
   explanation come off and what remains is 通鉴's own sentence, 臣光曰 and the mark — the original first,
   which is the book's rule everywhere else. The 390px page's own 585px stage, and every wider one, keeps
   all of it. This block sits after the tier blocks on purpose: it has their specificity, so source order
   is what makes it win. */
.tb-zjs[data-tight="1"] .zjs-house-line,
.tb-zjs[data-tight="1"] .zjs-band-note,
.tb-zjs[data-tight="1"] .zjs-note { display: none; }
.tb-zjs[data-tight="1"] .zjs-note { font-size: var(--text-xs); line-height: 1.4; }

/* ---------- narrow: one column, the full reading, on a capped measure ----------
   The stage is 390x585 here and the reading — the plate, the date, 通鉴's sentence, the explanation and
   the 臣光曰 line — comes to about 550px of it. What goes is the volume line, which the figure's own
   caption carries (the chapter prints 图 1.1 and the volume), and the paddings come in a step. */
.tb-zjs[data-tier="narrow"] { width: min(34rem, 100%); inset: 0 auto 0 50%; transform: translateX(-50%);
  gap: var(--space-2); padding: var(--space-3) var(--space-3) var(--space-2); }
.tb-zjs[data-tier="narrow"] .zjs-folio { display: none; }
.tb-zjs[data-tier="narrow"] .zjs-source { display: none; }
.tb-zjs[data-tier="narrow"] .zjs-head { padding-bottom: var(--space-1); }
.tb-zjs[data-tier="narrow"] .zjs-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto;
  align-content: center; gap: var(--space-2); }
.tb-zjs[data-tier="narrow"] .zjs-field { grid-template-rows: auto auto auto auto; }
.tb-zjs[data-tier="narrow"] .zjs-court { padding: 0.2rem 0.6rem; gap: 0.35rem; }
.tb-zjs[data-tier="narrow"] .zjs-court-note { display: none; }
.tb-zjs[data-tier="narrow"] .zjs-court-note + .zjs-seal { margin-left: auto; }
.tb-zjs[data-tier="narrow"] .zjs-seal { width: 1.35rem; height: 1.35rem; border-width: 1.5px; font-size: 0.85rem; line-height: 1.15rem; }
.tb-zjs[data-tier="narrow"] .zjs-house { padding: 0.4rem 0.2rem; }
.tb-zjs[data-tier="narrow"] .zjs-house-char { font-size: 1.5rem; }
.tb-zjs[data-tier="narrow"] .zjs-house-man { font-size: var(--text-sm); }
.tb-zjs[data-tier="narrow"] .zjs-house-place, .tb-zjs[data-tier="narrow"] .zjs-gain { display: none; }
.tb-zjs[data-tier="narrow"] .zjs-plate-label { left: 0.4rem; font-size: var(--text-xs); }
.tb-zjs[data-tier="narrow"] .zjs-band { gap: var(--space-2); padding: 0.2rem 0.6rem; }
.tb-zjs[data-tier="narrow"] .zjs-band-char { font-size: var(--text-lg); }
.tb-zjs[data-tier="narrow"] .zjs-band-note { font-size: var(--text-xs); line-height: 1.4; }
.tb-zjs[data-tier="narrow"] .zjs-panel { gap: 3px; }
.tb-zjs[data-tier="narrow"] .zjs-year { font-size: var(--text-xl); }
.tb-zjs[data-tier="narrow"] .zjs-event { font-size: var(--text-base); }
.tb-zjs[data-tier="narrow"] .zjs-quote { font-size: var(--text-base); line-height: 1.55; }
.tb-zjs[data-tier="narrow"] .zjs-note { font-size: var(--text-sm); line-height: 1.5; }
.tb-zjs[data-tier="narrow"] .zjs-aside-text { font-size: var(--text-xs); line-height: 1.5; }
.tb-zjs[data-tier="narrow"] .zjs-foot { gap: var(--space-1); padding-top: var(--space-2); }
.tb-zjs[data-tier="narrow"] .fig-toolbar { max-width: 34rem; margin-inline: auto; width: 100%; }
.tb-zjs[data-tier="narrow"] .zjs-stop { padding: 0.3rem 0.5rem; }
.tb-zjs[data-tier="narrow"] .zjs-stop-year { font-size: var(--text-sm); }
`;

function houseCell(spec) {
  const pre = h('span', { class: 'zjs-pre', text: '晋大夫' });
  const arrow = h('span', { class: 'zjs-arrow', text: '→' });
  const post = h('b', { class: 'zjs-post', text: '诸侯' });
  return h('div', { class: 'zjs-house', 'data-house': spec.key }, [
    h('p', { class: 'zjs-house-name' }, [
      h('span', { class: 'zjs-house-char', text: spec.char }),
      h('span', { class: 'zjs-house-man', text: spec.man }),
    ]),
    h('p', { class: 'zjs-house-place', text: spec.place }),
    h('p', { class: 'zjs-house-line', text: spec.line }),
    h('p', { class: 'zjs-house-title' }, [pre, arrow, post]),
    h('p', { class: 'zjs-gain', text: '＋智氏之田' }),
  ]);
}

export function mount(root, ctx) {
  const reduced = Boolean(ctx.reducedMotion);
  let order = DEFAULT_ORDER;

  const wrap = h('div', { class: `tb-zjs${reduced ? ' is-reduced' : ''}` });
  wrap.append(h('style', { text: CSS }));

  const head = h('div', { class: 'zjs-head' }, [
    h('p', { class: 'zjs-rubric', text: '三家分晋' }),
    h('p', { class: 'zjs-folio', text: '资治通鉴 · 卷一 周纪一' }),
  ]);

  // ---------- the plate ----------
  const courtKing = h('span', { class: 'zjs-court-king', text: STEPS[0].king });
  const courtYear = h('span', { class: 'zjs-court-year', text: STEPS[0].kingYear });
  const courtNote = h('span', { class: 'zjs-court-note', text: STEPS[0].courtNote });
  const seal = h('span', { class: 'zjs-seal', 'aria-hidden': 'true', text: '命' });
  const court = h('div', { class: 'zjs-court' }, [
    h('span', { class: 'zjs-court-name', text: '周' }),
    courtKing,
    courtYear,
    courtNote,
    seal,
  ]);

  const cells = HOUSES.map(houseCell);
  const plateLabel = h('p', { class: 'zjs-plate-label', 'data-jin': '存', text: '晋' });
  const houses = h('div', { class: 'zjs-houses' }, [plateLabel, ...cells]);

  const zhiNote = h('p', { class: 'zjs-band-note', text: STEPS[0].zhiNote });
  const zhiBand = h('div', { class: 'zjs-band is-dead' }, [
    h('p', { class: 'zjs-band-name' }, [
      h('span', { class: 'zjs-band-char', text: '智' }),
      h('span', { class: 'zjs-band-sub', text: '瑶（智伯）' }),
    ]),
    zhiNote,
  ]);

  const dukeNote = h('p', { class: 'zjs-band-note', text: STEPS[0].dukeNote });
  const dukeBand = h('div', { class: 'zjs-band' }, [
    h('p', { class: 'zjs-band-name' }, [
      h('span', { class: 'zjs-band-char', text: '晋' }),
      h('span', { class: 'zjs-band-sub', text: '公室 · 绛、曲沃' }),
    ]),
    dukeNote,
  ]);

  const field = h('div', { class: 'zjs-field' }, [court, houses, zhiBand, dukeBand]);

  // ---------- the panel ----------
  const year = h('span', { class: 'zjs-year', text: STEPS[0].yearLabel });
  const frame = h('span', { class: 'zjs-frame' });
  const event = h('p', { class: 'zjs-event', text: STEPS[0].event });
  const quote = h('blockquote', { class: 'zjs-quote', lang: 'zh-Hant', text: `「${STEPS[0].quote}」` });
  const note = h('p', { class: 'zjs-note', text: STEPS[0].note });
  const asideLabel = h('span', { class: 'zjs-aside-label', text: STEPS[0].asideLabel });
  const asideText = h('p', { class: 'zjs-aside-text', text: STEPS[0].aside });
  const aside = h('div', { class: 'zjs-aside' }, [asideLabel, asideText]);
  const mark = h('p', { class: 'zjs-mark', text: STEPS[0].mark });
  const source = h('p', { class: 'zjs-source', text: STEPS[0].source });
  const panel = h('div', { class: 'zjs-panel', 'aria-live': 'polite' }, [
    h('p', { class: 'zjs-date' }, [year, frame]),
    event,
    quote,
    note,
    h('div', { class: 'zjs-foot' }, [aside, mark, source]),
  ]);

  // ---------- the stops ----------
  const seats = STEPS.map((s, i) => {
    const btn = h('button', {
      class: 'fig-btn zjs-stop', type: 'button', 'data-step': String(i), 'aria-pressed': 'false',
      'aria-label': `${s.yearLabel}年：${s.event}`,
    }, [
      h('span', { class: 'zjs-stop-year', text: s.yearLabel }),
      h('span', { class: 'zjs-stop-name', text: s.stopName }),
    ]);
    btn.addEventListener('click', () => go(i));
    return btn;
  });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui zjs-stops', role: 'group', 'aria-label': '年代' }, seats);

  wrap.append(head, h('div', { class: 'zjs-body' }, [field, panel]), toolbar);
  root.append(wrap);

  function paint() {
    const s = STEPS[order];
    wrap.dataset.step = s.key;
    wrap.classList.toggle('is-commanded', s.commanded);
    year.textContent = s.yearLabel;
    frame.textContent = `· ${s.frame}`;
    event.textContent = s.event;
    quote.textContent = `「${s.quote}」`;
    note.textContent = s.note;
    asideLabel.textContent = s.asideLabel;
    asideText.textContent = s.aside;
    // `臣光曰` is 司馬光's own words and the label above it says so; an `异说` note is this figure
    // talking. The mark follows the label, which is the attribution the reader is already given.
    asideText.lang = s.asideLabel === '臣光曰' ? 'zh-Hant' : '';
    mark.textContent = s.mark;
    mark.hidden = !s.mark;
    source.textContent = s.source;
    courtKing.textContent = s.king;
    courtYear.textContent = s.kingYear;
    courtNote.textContent = s.courtNote;
    zhiNote.textContent = s.zhiNote;
    dukeNote.textContent = s.dukeNote;
    dukeBand.classList.toggle('is-dead', s.key === 'end');
    plateLabel.dataset.jin = s.key === 'end' ? '亡' : '存';
    plateLabel.textContent = s.key === 'end' ? '晋（亡）' : '晋';
    // 晋大夫 at 前453年; 晋大夫 → 诸侯 at 前403年, which is the change the year consists of; 诸侯 after.
    // At a stage under 400px tall the three parts collapse to the one that is true now — a cell 50px wide
    // cannot hold 「晋大夫 → 诸侯」 on one line, and a wrapped title is what pushed the plate past the
    // body row at 480x300.
    for (const cell of cells) {
      const pre = cell.querySelector('.zjs-pre');
      const arrow = cell.querySelector('.zjs-arrow');
      const post = cell.querySelector('.zjs-post');
      pre.hidden = tiny ? s.key !== 'jinyang' : s.key === 'end';
      arrow.hidden = tiny || s.key !== 'investiture';
      post.hidden = s.key === 'jinyang';
    }
    seats.forEach((b, i) => b.setAttribute('aria-pressed', String(i === order)));
  }

  function go(next, focus = false) {
    const i = Math.min(STEPS.length - 1, Math.max(0, next));
    if (i !== order) {
      order = i;
      paint();
    }
    if (focus) seats[i].focus();
  }

  // The three dates are one control, so Left/Right and Home/End move between them from any seat, and the
  // pointer is not the only way in.
  const onKey = (e) => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(order + 1, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(order - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); go(0, true); }
    else if (e.key === 'End') { e.preventDefault(); go(STEPS.length - 1, true); }
  };
  toolbar.addEventListener('keydown', onKey);

  // ---------- the arrangement, from the stage the frame actually gave us ----------
  // The first measure must always write its attributes: a first pass that found "nothing changed" would
  // leave data-tier off the element and every rule keyed on it unapplied.
  let tier = null;
  let tiny = null;
  let tight = null;
  function measure() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (!w || !h) return false;
    const nextTier = h < WIDE_MIN_H ? 'small' : (w < NARROW_MAX_W ? 'narrow' : 'wide');
    const nextTiny = h < TINY_H;
    const nextTight = h < TIGHT_H;
    if (nextTier === tier && nextTiny === tiny && nextTight === tight) return false;
    tier = nextTier;
    tiny = nextTiny;
    tight = nextTight;
    wrap.dataset.tier = tier;
    wrap.dataset.tiny = tiny ? '1' : '0';
    wrap.dataset.tight = tight ? '1' : '0';
    return true;
  }
  const ro = new ResizeObserver(() => { if (measure()) paint(); });
  ro.observe(root.closest('.tb-figure__stage') || root);
  measure();

  paint();
  ctx.onReady();

  return {
    destroy() {
      ro.disconnect();
      toolbar.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    // One unit per step: t = 0 is 前453年, t = 1 is 前403年, t = 2 is 前376年.
    setTime(t) {
      const i = Math.round(Number(t));
      if (Number.isFinite(i)) go(i);
    },
    describe() {
      const s = STEPS[order];
      return {
        order,
        steps: STEPS.length,
        year: s.year,
        yearLabel: s.yearLabel,
        phase: s.key,
        frame: s.frame,
        houses: HOUSES.map((x) => x.char),
        houseStatus: s.key === 'jinyang' ? '晋大夫' : s.key === 'investiture' ? '大夫→诸侯' : '诸侯',
        zhi: '灭',
        jinRemnant: s.key === 'end' ? '亡' : '存',
        commanded: s.commanded,
        tier,
        tiny,
        reduced,
      };
    },
    setVisible() {
      // Nothing runs on its own: the figure is a function of the step the reader chose, so leaving the
      // viewport has nothing to pause.
    },
    setTheme() {
      // Every colour is a CSS variable, so a theme change repaints the figure with no code of its own.
    },
  };
}
