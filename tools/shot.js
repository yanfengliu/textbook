// npm run shot: load every page at phone, tablet and desktop widths in both themes, with every figure
// mounted (?eager=1) and every clock pinned (?t=0), and write full-page screenshots to out/shots/.
//
// Claim: a page passes when it reaches the handshake with no console error, no uncaught page error, no
// failed request, no figure in the error state, no horizontal overflow of the document, no colour hook
// that paints nothing, no hook on a page with a floor table found on fewer elements than its floor, and no
// marked target no hook reaches (a page that must carry a hook and has none, a hook the page carries
// fewer times than its census says, a rule that matches its element and loses the cascade, a hook with
// nothing to paint, a target of a hook's rule with no hook above it, or a page that rebuilds while an
// attribute is off — see the hook block below), no geometric attribute in a mounted figure's SVG that is
// negative where SVG forbids it or is not a finite number (see the geometry block below), no character
// anywhere on the page drawn by a face the page did not load through `@font-face` (see the font block
// below), no `<tb-sitting>` still unbooted when the shutter opens and none missing from a page that must
// carry one (see the sitting block below) — and — on a page whose
// `<html lang>` this gate knows the script of — every figure caption's
// number word (`.fig-num`) and the figure's aria-label in that script's word. Fails otherwise and names
// the page, viewport, theme and the errors.
//
// Bound: three viewports, two themes, one pinned time, one renderer (SwiftShader unless SHOT_GPU=1);
// SHOT_PAGES, SHOT_VIEWPORTS and SHOT_THEMES trim the matrix and a trimmed run proves only its part, and
// a value naming no page, viewport or theme stops the run rather than emptying it (tools/lib/trim.js).
//
// The directory is the run. `out/shots/` is emptied before the first frame is written, the way every
// gate empties its own directory, so after a run each file in it is from that run and nothing from an
// earlier one sits beside them under a name a reader would take as current. That is also why two runs in
// one tree destroy each other: on 2026-09-16 the 24 acceptance frames of a green run were deleted by a
// second run before anybody could look at them, and only the log survived, which no exit status showed.
// SHOT_LABEL=<name> writes to `out/shots-<name>/` instead, emptied the same way, so a second run keeps
// its own frames beside the first one's rather than over them — the same shape as `tools/inspect.js
// --label`, which is where the rule was already written for a tool with the same problem. A run with no
// label writes `out/shots/` exactly as it always did. The name is 1 to 32 characters of a-z, 0-9,
// underscore or hyphen, so the directory is always one of this tool's own; anything else stops the run
// before it empties anything at all.
// It proves the pages load and lay out; it says nothing about whether the pixels are right, which is
// what the screenshots it writes are for. A visual defect inside a figure that throws nothing passes
// this gate. The caption-word check knows English and Chinese (`en`, `zh`, `zh-Hans`, `zh-Hant`) and
// nothing else; a page in another language is not asked. The colour-hook check reads its hooks from the
// stylesheets the page loads and only from rules scoped to the book that declare a colour property; it
// proves the attribute changes a computed colour, not that the colour is the right one or a readable one
// (out/colour2/contrast.mjs measures contrast), not that it survives a hover or a pressed state, and not
// that a page's JavaScript paints anything — `el.style.color = …`, a canvas and an SVG `fill`/`stroke`
// written as a presentation attribute in the markup are outside it entirely (the CSS `fill`/`stroke`
// PROPERTIES are measured, and so are `color`, the background and the four border colours of each
// element and of its `::before` and `::after`; other pseudo-elements are not read). A hook whose only
// rule sits inside a media block that excludes one of the three
// widths fails at that width, which is intended for a mark that must be there and wrong for one the design
// means to drop; a rule inside a block that does not apply is reported as such rather than as a cascade
// loss. The half that catches an unreached target derives its target from the rule text: the rules
// `<hook="value"> <subject>` are read together as "every `<subject>` in this book sits under an element
// carrying the hook attribute, with one of the values those rules spend". The values have to be read
// together, because the figure's houses are three rules over one shared `.zjs-house-char` class and each
// char is reached by its own house's rule and not the other two. That is still a claim about CSS that is
// not true in general: a rule scoping a shared class to one value while the other values' elements are
// meant to stay unpainted (`.zj [data-state="wei"] .zj-lex__pinyin`) fails this check until a rule exists
// for each value or the subject is narrowed to what it means. A selector reaching its subject through a
// sibling combinator is skipped rather than guessed at.
// The geometry check reads the settled DOM, so a bad value in a frame
// already replaced is the console-error check's to catch and not this one's; it covers the attributes
// listed in `auditFigureGeometry`, asks only whether each value is a finite number of the sign SVG
// allows, and sees only figures a page mounts — a registered kind no chapter uses yet belongs to
// `npm run drive` and `npm run narrow`. The font census asks which face Chromium actually used, per
// distinct computed stack and per distinct code point, and calls a face chosen when the page loaded it
// through `@font-face`: the chosen set is derived from each page, so `tongjian/**`'s Noto Serif SC and
// Noto Sans SC need no entry here and neither will a third book's stack. It cannot see text drawn into a
// canvas or by WebGL, a character that only appears once a control is pressed, or `lab/`, which this
// gate does not visit and whose debug dump is deliberately `monospace`; it judges code points apart, so a
// combining sequence is split; and it asks whether a face was loaded, never whether the right loaded face
// was picked or whether the glyph is well drawn. Measured 2026-09-16: 21–98 ms per load on the Latin
// pages and 162–294 ms on tongjian/ch02, whose 2400 text nodes carry 1644 distinct code points — 1004 ms
// against 36.6 s of page-load time over chapters 1 and 2, 2.7% of the run. The failing path is the
// expensive one, because narrowing re-probes in chunks and then one code point at a time.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES, VIEWPORTS, THEMES } from './lib/browser.js';
import { trim, PAGE_HINT } from './lib/trim.js';

// The run's own directory, and the rule that keeps two runs from sharing one. A label is validated
// before anything below runs, because `rmSync(OUT)` at the foot of this file is what a mistyped name
// must never reach: the check `tools/inspect.js` makes with its `--label`, in this tool's own shape (an
// environment variable rather than an argument, like SHOT_PAGES). An empty SHOT_LABEL means unset, the
// same convention `tools/lib/trim.js` gives an empty trimming variable.
const OUT_DIR = 'out/shots';
const LABEL_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const label = process.env.SHOT_LABEL || null;
if (label !== null && !LABEL_RE.test(label)) {
  console.error(`SHOT_LABEL="${label}" is not usable as a directory name; use 1 to 32 characters of a-z, 0-9, underscore or hyphen, starting with a letter or digit. A run with no SHOT_LABEL empties ${OUT_DIR}/ before it writes, so a second run in this tree deletes the first one's frames; give the second run a label of its own and it writes ${OUT_DIR}-<label>/ instead. What would satisfy this: SHOT_LABEL=after, SHOT_LABEL=worker-2, or no SHOT_LABEL at all.`);
  process.exit(2);
}
const OUT = label === null ? OUT_DIR : `${OUT_DIR}-${label}`;
const gpu = process.env.SHOT_GPU === '1';
const themes = trim('SHOT_THEMES', THEMES, { noun: 'theme' });
const viewports = trim('SHOT_VIEWPORTS', VIEWPORTS, { idOf: (v) => v.id, noun: 'viewport' });
const pages = trim('SHOT_PAGES', PAGES, { idOf: (p) => p.id, noun: 'page', hint: PAGE_HINT });

// The word the frame writes before a figure's number, by the page's script. `test/lexicon.test.js`
// reads authored files and cannot see what the frame writes at runtime: every caption of the Simplified
// 資治通鑑 pages read 圖 N.1 over prose citing 图 N.1, because src/components/figure.js keyed its word on
// the primary subtag alone (found by review, 2026-09-16). This table is this gate's own and not the
// frame's, so it is not the code agreeing with itself.
function figureWordFor(lang) {
  const l = String(lang || '').toLowerCase();
  if (l === 'zh-hant' || l.startsWith('zh-hant-')) return '圖';
  if (l === 'zh' || l.startsWith('zh-')) return '图';
  if (l === 'en' || l.startsWith('en-')) return 'Figure';
  return null;
}

// ------------------------------------------------------------------------------------------------
// Colour hooks: a declared mark that paints nothing
// ------------------------------------------------------------------------------------------------
//
// 《资治通鉴》 paints several classes of mark from a data attribute: a house colour from `data-state`
// (wei / zhao / han / zhi), a gold for the common-era years from `data-date`, 青 for a textual-criticism
// note from `data-note="textual"`, and in the figures `data-jin`, `data-source` and the rest (§6c of
// tongjian/zj.css; out/colour2/handoff.md says what each mark means). Landing them produced a failure no
// other gate here can see. `.zj [data-state="wei"]` matched its element and did not paint it: chapter
// 1's 字 glyphs are `.zj .zj-lex__glyph { color: var(--ink) }`, the same specificity (0,2,0) stated 90
// lines later, so the later rule won and the glyph stayed ink. `el.matches('.zj [data-state="wei"]')`
// was true while the computed colour was #1d1a17. `npm run check` reads authored HTML and cannot see a
// cascade; a screenshot shows a colour on the elements that work and nothing suspicious on the ones that
// do not; and every check above this one in this file is about console errors, figures, overflow and
// caption words. A rule that silently loses the cascade and a rule that was never written are the same
// pixels.
//
// So this check measures the cascade directly: for every element a hook is declared on, remove the
// attribute, read the computed colour of the element and of everything inside it, put the attribute
// back, and compare. The hook must have changed something. It is deliberately per ELEMENT and not per
// attribute: on the very page that produced it, `data-state="wei"` painted the 氏 column and did not
// paint the 字 glyphs, so an attribute-level check would have passed while three glyphs stayed ink.
//
// What a hook is, and what a future one must do to be covered. The hooks are not a list in this file;
// they are read out of each page, from the stylesheets it loads. A rule is a hook when
//   · its selector is scoped to this book — its first compound is `.zj` or the `.tb-zj…` of one of its
//     figures — so a shared sheet's own state attributes (`tb-figure[data-state="ready"]` in
//     src/styles/components.css, `.tb-mark[data-state="review"]` in src/styles/learning.css) are not
//     this gate's subject;
//   · it declares a COLOUR property (`color`, `background`, `fill`, `stroke`, an explicit
//     `border-*-color`); a border SHORTHAND is how a layout rule draws a rule line, so it does not make
//     a hook. Each property here is read back off the settled page — `fill`/`stroke` included, on the
//     element, on `::before` and `::after` — so the list above is what the check measures and not a
//     promise it does not keep; and
//   · it keys that colour on a `data-*` attribute, taking the attribute's value where the selector names
//     one. `[data-state="wei"][data-state]` is ONE hook, not two: the second test is the specificity
//     device that fixed the cascade loss, and it matches exactly when the first one does.
// A new hook therefore needs no entry here. Write the rule in this book's stylesheet or in one of its
// figure modules, scope it under `.zj`/`.tb-zj…`, take the colour from a `data-*` attribute, put the
// attribute on the page — and it is covered the moment it exists. That is how the figure hook the colour
// round listed as its next piece of work was covered: it landed while this check was being written
// (`.tb-zjs .zjs-house[data-house="wei"] .zjs-house-char`, one rule per house in src/figures/zj-split.js,
// a figure module's `<style>` being one of the page's stylesheets too) and needed no line here.
//
// A page that must carry hooks and has none fails, from the table below, the way `npm run devices` fails
// on a chapter with no glossary terms — and so does a page carrying fewer of them than the table counts.
// The table is chapters 1–3's own census, VERIFIED against the rendered pages rather than taken from the
// colour round's prose, which counts markup text and cannot see the `dt` elements src/components/term.js
// tags from each chapter's glossary.js:
//   ch01  [data-state="wei"]×2  [data-state="zhao"]×2  [data-state="han"]×2  [data-date]×2
//   ch02  [data-state="wei"]×3  [data-state="zhao"]×7  [data-state="han"]×2  [data-state="zhi"]×6
//         — 3 in markup plus 15 through the glossary's `state` — [data-date]×6, [data-note="textual"]×7
//   ch03  [data-state="zhi"]×1 (the glossary), [data-note="textual"]×1
// The book's contents page, and every page of the other book, declares none and is not asked.
//
// The table asks for a FLOOR per hook, not for presence and not for an exact count. Presence passed a page
// that had lost all but one of its marks — a chapter with one marked year of four, a glossary tagging two
// head-words of fifteen — and both are the live defect this check was written for, one size smaller:
// chapter 1's own bug left one `data-date` on a paragraph with no year under it and three years with no
// hook above them. An exact count would fail a chapter that ADDS a 魏 mark, so the check tests
// `found < floor` and nothing above it: one mark more is free, one mark fewer is not.
//
// Each floor is the census itself — the margin is zero — and that is deliberate. Every number below is
// one-to-one with a mark the page's own sources declare: the `data-*` attributes in the chapter's
// index.html, plus the `state:` fields in its glossary.js, which src/components/term.js tags onto the
// `dt` it builds (chapter 2's eighteen `data-state` are 3 in markup and 15 from the glossary, measured).
// A count below its floor therefore means either that a declared mark stopped reaching the reader — this
// check's whole subject — or that the source lost the mark too. A margin of one would let the first of
// those through in silence, which is the defect; for the second, the failure names this table, and
// lowering the number is the one-line record of a deliberate removal, made in the same commit. `where`
// says what each number is made of. The numbers were measured on the RENDERED DOM on 2026-09-19 at all
// three viewports of this gate — out/gatefix/census.mjs, 9 loads, the same count at 390, 1024 and 1440 px,
// because the markup is the same at every width — and each agrees with what the page's sources declare.
//
// Re-measured afterwards, 18 loads (both themes as well as all three viewports), because that first census
// was taken before chapter 2's 世系 and 年代 paragraphs landed: the page carried `[data-date]` six times
// where this table asked for four, so two marked years could have gone with the gate still green — the
// partial loss this floor exists to catch, in the book whose year marks were the defect. That floor is 6
// now. The other eleven rows were re-read against the rendered pages in the same run and every one of them
// matched its floor exactly, so no other number moved.
// A hook whose floor is missing or is not a whole number of marks ≥ 1 fails the run rather than falling
// back to presence, which is the check this table replaced.
//
// Its selectors are measured even when no rule is found for them, so a DELETED rule — the one failure a
// discovery by rule cannot see — fails too.
const HOOK_CENSUS = {
  'tongjian/ch01': {
    why: 'chapter 1 enumerates the houses in the 氏 column of 背景 and in the 字 list of 字詞, and marks the years in 背景',
    hooks: [
      { sel: '[data-state="wei"]', floor: 2, where: '魏氏 in the 氏 column of 背景, 魏 in the 字 list of 字詞' },
      { sel: '[data-state="zhao"]', floor: 2, where: '趙氏 in the 氏 column, 趙 in the 字 list' },
      { sel: '[data-state="han"]', floor: 2, where: '韓氏 in the 氏 column, 韓 in the 字 list' },
      { sel: '[data-date]', floor: 2, where: 'the two 背景 paragraphs that carry years' },
    ],
  },
  'tongjian/ch02': {
    why: 'chapter 2 names the houses in its 世系 paragraphs and tags fifteen glossary head-words from glossary.js, and marks the years and the textual notes in 背景 and 原文',
    hooks: [
      { sel: '[data-state="wei"]', floor: 3, where: 'the 世系 paragraph in 背景, and 魏斯 and 魏桓子 in the glossary' },
      { sel: '[data-state="zhao"]', floor: 7, where: 'the 世系 paragraph, and six 趙 head-words in the glossary' },
      { sel: '[data-state="han"]', floor: 2, where: 'the 世系 paragraph, and 韓康子 in the glossary' },
      { sel: '[data-state="zhi"]', floor: 6, where: 'six 智 head-words in the glossary, the house the 原文 names' },
      { sel: '[data-date]', floor: 6, where: 'the six 背景 paragraphs that carry years' },
      { sel: '[data-note="textual"]', floor: 7, where: 'the seven notes that question the text, six in 原文 and one in 背景' },
    ],
  },
  'tongjian/ch03': {
    why: 'chapter 3 tags its 智 head-word from glossary.js and marks the note that says the text is in question',
    hooks: [
      { sel: '[data-state="zhi"]', floor: 1, where: 'the 智 head-word in the glossary' },
      { sel: '[data-note="textual"]', floor: 1, where: 'the one note that says the text is in question' },
    ],
  },
};

/**
 * Every colour hook on the page, measured: does removing its attribute change what is painted? Runs
 * inside the page and returns { problems, measured, targets, declared, census, rebuilds, unread }, with
 * `problems` already phrased for the report. `census` is one entry per hook this page's table requires,
 * `{ key, found, floor }`, so a run can report the counts it compared rather than only the failures. It
 * leaves the DOM as it found it: each attribute is restored in the same evaluation that removes it, and a
 * MutationObserver over the whole document catches a rebuild (a childList or characterData mutation)
 * while an attribute is off, because that would mean the checks after this one are looking at a page the
 * reader never gets.
 */
function auditColourHooks({ page: pageId, viewport, required = [], why = '' }) {
  // What "painted" means, and why each entry is here. `fill` and `stroke` are CSS properties as well as
  // SVG presentation attributes, and the COLOUR test below accepts a rule that declares either as a
  // colour hook — so the measurement has to read them, or a mark spent through `fill` would be reported as
  // painting nothing while it painted. The pseudo-element channels are the other half of the same
  // correction: a mark can live on `::before` or `::after` (`content: ""` plus an accent bar), where the
  // element's own computed `color` never moves, and the element alone reads that hook as inert. Both are
  // read on every NODE — the hooked element and everything inside it — and on each node's own two
  // pseudo-elements. Outside this list, and so outside this check: the other pseudo-elements (`::marker`,
  // `::selection`, `::first-line`, `::placeholder`), a canvas, an SVG `fill` or `stroke` PRESENTATION
  // ATTRIBUTE written in the markup rather than declared by a rule, and `el.style.color = …` set by
  // JavaScript. A node whose pseudo-element style this engine will not give up contributes no channel
  // there; those nodes are counted in `unread` and the run prints the count, because a channel that
  // silently stopped being read is the same shape as a check that stopped running.
  const PAINT = ['color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'background-color', 'fill', 'stroke'];
  const PSEUDO = ['::before', '::after'];
  // A colour DECLARATION, read from the rule's own text. `rule.style.getPropertyValue('border-top-color')`
  // cannot make this distinction: CSSOM expands `border-top: 1px solid var(--rule-strong)` into a colour,
  // so every layout rule that draws a rule line would read as a colour hook. `cssText` keeps a shorthand a
  // shorthand, and an explicit `border-top-color:` stays in.
  const COLOUR = /(?:^|;)\s*(?:color|background|background-color|border-color|border-(?:top|right|bottom|left)-color|fill|stroke|outline-color|text-decoration-color|caret-color|column-rule-color)\s*:/i;
  const ATTR = /\[\s*(data-[a-z0-9-]+)\s*(?:([~^$*|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*\]/gi;
  const BOOK = /^\s*(?:\.zj\b|\.zj-|\.tb-zj)/;
  const problems = [];

  // Selector lists split at top-level commas only: a comma inside `:is(…)` or an attribute value belongs
  // to one selector.
  const splitTop = (text) => {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === '(' || ch === '[') depth += 1;
      else if (ch === ')' || ch === ']') depth -= 1;
      else if (ch === ',' && depth === 0) {
        parts.push(text.slice(start, i));
        start = i + 1;
      }
    }
    parts.push(text.slice(start));
    return parts.map((s) => s.trim()).filter(Boolean);
  };
  // The subject of a selector — its last compound. Used to PHRASE a failure and never to decide one, so a
  // compound this cannot split exactly costs a worse sentence and not a wrong verdict.
  const subjectOf = (sel) => sel.replace(/\s+/g, ' ').split(/[\s>+~]+/).filter(Boolean).pop();

  const hooks = new Map();
  // `when` carries the condition of the `@media`/`@supports` block a rule sits in, because a selector that
  // matches an element and paints nothing means something different inside a block that does not apply at
  // this viewport: the hook is declared, and this width is not where it is spent. Chapter 2 and 3's textual
  // note is written that way on purpose — a base rule for the margin, a media rule that moves the accent to
  // the left edge once the note folds into the column — so the distinction is live in this book.
  const readRules = (rules, when) => {
    for (const rule of rules) {
      if (rule.cssRules && !rule.selectorText) {
        readRules(rule.cssRules, rule.conditionText ? rule.conditionText.trim() : when);
        continue;
      }
      if (!rule.selectorText || !rule.style || !COLOUR.test(`;${rule.style.cssText}`)) continue;
      for (const part of splitTop(rule.selectorText)) {
        if (!BOOK.test(part)) continue;
        // One hook per attribute per compound: a bare presence test is dropped when the same compound also
        // names a value for that attribute, because then it is the specificity device described above.
        const byAttr = new Map();
        for (const m of part.matchAll(ATTR)) {
          const attr = m[1].toLowerCase();
          const value = m[3] ?? m[4] ?? m[5] ?? null;
          const seen = byAttr.get(attr);
          if (seen === undefined || (seen === null && value !== null)) byAttr.set(attr, value);
        }
        for (const [attr, value] of byAttr) {
          const key = value === null ? attr : `${attr}="${value}"`;
          if (!hooks.has(key)) hooks.set(key, { key, attr, value, selectors: [] });
          const hook = hooks.get(key);
          if (!hook.selectors.some((s) => s.text === part)) hook.selectors.push({ text: part, when: when ?? '' });
        }
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      readRules(sheet.cssRules, '');
    } catch {
      // A sheet this page cannot read is not this book's; the gates serve the repository, so the only
      // ones here are Google Fonts' and the figure modules' are inline.
    }
  }
  // The pages in the table are measured whether or not a rule was found for their hooks: a rule that has
  // been DELETED leaves elements no discovery can see, and removing the attribute is what catches that.
  // Each entry is `{ sel, floor }`; a floor the check cannot read fails the run rather than quietly
  // becoming the presence test this table was changed to replace.
  for (const entry of required) {
    const sel = entry?.sel;
    const m = typeof sel === 'string' && /^\[\s*(data-[a-z0-9-]+)\s*(?:=\s*"([^"]*)"\s*)?\]$/.exec(sel);
    if (!m) {
      problems.push(`${pageId} ${viewport}: the hook table in tools/shot.js carries ${JSON.stringify(entry)}, which this check cannot read. Fix the table: an entry is { sel: '[data-name]' or '[data-name="value"]', floor: <whole number of marks, 1 or more>, where: '<what the marks are>' }.`);
      continue;
    }
    if (!Number.isInteger(entry.floor) || entry.floor < 1) {
      problems.push(`${pageId} ${viewport}: the hook table in tools/shot.js gives ${sel} the floor ${JSON.stringify(entry.floor)}, which is not a whole number of marks of 1 or more. A hook with no floor passes on a single element, which is the partial loss this floor was added to catch, so the run stops here instead. Fix the table.`);
      continue;
    }
    const key = m[2] === undefined ? m[1] : `${m[1]}="${m[2]}"`;
    if (!hooks.has(key)) hooks.set(key, { key, attr: m[1], value: m[2] ?? null, selectors: [] });
    Object.assign(hooks.get(key), { required: sel, floor: entry.floor });
  }

  const describe = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList.length ? `.${[...el.classList].slice(0, 2).join('.')}` : '';
    const section = el.closest('section[id]')?.id;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 14);
    return `<${el.tagName.toLowerCase()}${id}${cls}${section ? ` in #${section}` : ''}>${text ? ` "${text}"` : ''}`;
  };
  const rebuilds = new Map();
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') continue; // this check's own remove and restore
      const what = `${record.type} on <${(record.target.tagName || record.target.nodeName).toLowerCase()}>`;
      rebuilds.set(what, (rebuilds.get(what) ?? 0) + 1);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  let measured = 0;
  const census = [];
  const unreadPseudo = new Set();
  for (const hook of hooks.values()) {
    const probe = hook.value === null ? `[${hook.attr}]` : `[${hook.attr}="${hook.value}"]`;
    const els = [...document.querySelectorAll(probe)].filter((el) => el.closest('.zj'));
    if (hook.floor !== undefined) {
      census.push({ key: hook.key, found: els.length, floor: hook.floor });
      // The count that DROPS is the failure this floor is for, and it is worded to stand alone: a page
      // that lost every mark and a page that lost one of fifteen are the same defect, one size apart.
      if (els.length < hook.floor) {
        const found = els.length
          ? `is on ${els.length} element(s) here, where this page's census says at least ${hook.floor}`
          : `matches no element at all, where this page's census says at least ${hook.floor}`;
        problems.push(`${pageId} ${viewport}: the colour hook ${hook.required} ${found} — ${why} — so ${hook.floor - els.length} of the mark(s) this page carries are gone. A hook that is not there paints nothing, and a hook that is there fewer times than the census says is the same defect one size smaller: the missing marks are invisible to every other check in this file. What would satisfy this: put the mark back on the element that lost it, or, if the removal is deliberate, lower this hook's floor in HOOK_CENSUS in tools/shot.js in the same commit — that table is this page's record of the marks it carries.`);
      }
    }
    for (const el of els) {
      const nodes = [el, ...el.querySelectorAll('*')];
      // One string per node, built from the same three channels in the same order both times, so the two
      // snapshots line up index for index and a channel that cannot be read says so instead of shifting
      // the rest along.
      const snap = () => nodes.map((n) => {
        const parts = [];
        for (const which of [null, ...PSEUDO]) {
          let style = null;
          try {
            style = which ? getComputedStyle(n, which) : getComputedStyle(n);
          } catch {
            unreadPseudo.add(n); // no pseudo-element channel for this node; counted and printed
          }
          parts.push(style ? PAINT.map((p) => style.getPropertyValue(p)).join(' / ') : '(unreadable)');
        }
        return parts.join(' ‖ ');
      });
      const names = (n) => hook.selectors.filter((s) => {
        try {
          return n.matches(s.text);
        } catch {
          return false; // a selector this engine will not match (a pseudo-element subject, say)
        }
      });
      const matched = nodes.filter((n) => names(n).length).map((n) => [n, names(n)]);
      const before = snap();
      const saved = el.getAttribute(hook.attr);
      el.removeAttribute(hook.attr);
      const after = snap();
      el.setAttribute(hook.attr, saved);
      measured += 1;
      if (el.getAttribute(hook.attr) !== saved) {
        problems.push(`${pageId} ${viewport}: the attribute ${hook.attr} of ${describe(el)} did not come back as it was — it was "${saved}" and is now "${el.getAttribute(hook.attr)}". This check removes an attribute to measure it and restores it in the same evaluation; an element that rewrites it leaves later checks reading a different page.`);
        continue;
      }
      if (before.some((value, i) => value !== after[i])) continue;
      const always = (list) => list.filter((s) => !s.when);
      if (matched.length) {
        const [node, selectors] = matched[0];
        // A selector inside a block that does not apply at this viewport can match the element and still
        // paint nothing, and that is a different sentence from "a later rule is winning": the hook is
        // declared, and this width is not one it is spent at.
        const live = always(selectors);
        if (!live.length) {
          problems.push(`${pageId} ${viewport}: the colour hook ${hook.key} on ${describe(el)} painted nothing at this viewport — "${selectors.map((s) => s.text).join('", "')}" matches it, but that rule is written inside @media ${selectors[0].when} and no rule outside it paints this hook. What would satisfy this: state the colour in a rule that applies at this viewport, or stop marking this element as hooked.`);
        } else {
          problems.push(`${pageId} ${viewport}: the colour hook ${hook.key} on ${describe(el)} painted nothing — "${live.map((s) => s.text).join('", "')}" matches ${describe(node)}, and removing the attribute changed no computed colour on it or on anything inside it, so a later rule or a heavier one is winning and the mark is missing exactly as it would be if this rule did not exist. What would satisfy this: one more unit of specificity in that rule, or stating it after the rule that beats it.`);
        }
      } else {
        const texts = hook.selectors.map((s) => s.text);
        const subjects = [...new Set(texts.map(subjectOf))];
        problems.push(`${pageId} ${viewport}: the colour hook ${hook.key} on ${describe(el)} painted nothing, and the rule that spends it names no element here — "${texts.join('", "')}" has the subject "${subjects.join('", "')}", which matches nothing on or inside this element. Either the rule stopped matching the element the attribute is on, or the element holds nothing for it to paint; its subject is what the element must contain.`);
      }
    }
  }
  // The other half of the same defect, which the attribute test above cannot see: a target the rule marks
  // with no hook over it. `[data-date] .zj-yr` claims every year glyph in this book takes the gold from
  // the hook above it, so a `.zj-yr` with no `[data-date]` ancestor is a year that stays ink — and
  // removing an attribute from an ancestor those spans do not have changes nothing they inherit either.
  //
  // The claim is made per (attribute, subject) with every value the rules spend on that subject, because
  // this book writes one rule per value over one shared class: the figure's houses are
  // `.tb-zjs .zjs-house[data-house="wei"] .zjs-house-char` and two more like it, so a 趙 char under
  // `data-house="zhao"` is reached by its own house's rule and not by the wei one. Reading each rule on
  // its own would fail that figure three times over; reading the values together, a house that lost its
  // rule is a char whose ancestors carry no value any rule claims, which is the failure this half names.
  const claims = new Map();
  for (const hook of hooks.values()) {
    for (const { text: part } of hook.selectors) {
      if (/[~+]/.test(part.replace(ATTR, '[]'))) continue; // reaches sideways: not this claim
      const subject = subjectOf(part);
      if (!subject || subject.includes(hook.attr)) continue; // the hook element is its own target
      const key = `${hook.attr}\u0000${subject}`;
      if (!claims.has(key)) claims.set(key, { attr: hook.attr, subject, values: new Set(), rules: [] });
      const claim = claims.get(key);
      claim.values.add(hook.value);
      if (!claim.rules.includes(part)) claim.rules.push(part);
    }
  }
  let reached = 0;
  for (const claim of claims.values()) {
    let nodes = [];
    try {
      nodes = [...document.querySelectorAll(claim.subject)];
    } catch {
      continue; // a subject this engine will not match on its own — a pseudo-element, say
    }
    const bare = claim.values.has(null);
    const values = [...claim.values].filter((value) => value !== null);
    const wanted = bare ? `[${claim.attr}]` : values.map((value) => `[${claim.attr}="${value}"]`).join(' or ');
    for (const node of nodes) {
      if (!node.closest('.zj')) continue;
      let ok = false;
      for (let p = node.parentElement; p && !ok; p = p.parentElement) {
        if (p.hasAttribute(claim.attr)) ok = bare || values.includes(p.getAttribute(claim.attr));
      }
      if (ok) {
        reached += 1;
        continue;
      }
      problems.push(`${pageId} ${viewport}: ${claim.subject} is a target of "${claim.rules.join('", "')}" and no ${claim.attr} reaches it — ${describe(node)} takes that rule's colour only when an ancestor carries ${wanted}, and without one it keeps the colour of the prose around it, so the mark the rule was written for is absent. What would satisfy this: put ${wanted} on the element that holds it, or take the mark off this element.`);
    }
  }
  observer.disconnect();
  for (const [what, n] of rebuilds) {
    problems.push(`${pageId} ${viewport}: the page rebuilt while this check had a hook's attribute off (${n} × ${what}). Every attribute is restored in the same evaluation, but a component that re-renders on the change leaves the checks after this one reading a page the reader never gets, and this check cannot tell the rebuild from the attribute's own effect. What would satisfy this: a page that does not rebuild when a data-* attribute changes.`);
  }
  return { problems, measured, targets: reached, declared: hooks.size, census, unread: unreadPseudo.size, rebuilds: [...rebuilds].map(([what, n]) => `${n} × ${what}`) };
}

/**
 * Every geometric attribute the figures have written into the DOM, read back off the settled page.
 * Runs inside the page and returns { problems, elements, attributes, figures, kinds }, with `problems`
 * already phrased for the report.
 *
 * Why it is not covered by the console-error check above. A figure builds its SVG from numbers, and a
 * number that comes out wrong reaches the attribute either way; what differs is whether the browser
 * says so. `<rect width="-0.1">` is refused loudly, and that is how chapter 3's cytoskeleton lattice was
 * found (2026-09-16): a hairline gap in pixels subtracted from a dimer's width in nanometres, on a
 * stage where a nanometre was under a tenth of a pixel. But `stroke-width="-2"`, `stroke-width="NaN"`,
 * `opacity="NaN"` and `transform="translate(NaN 4)"` are presentation values the browser drops in
 * silence: the shape draws with the default, or does not draw, and nothing is logged. Those are the
 * same defect — a figure's arithmetic went negative or undefined — and no gate here could see them.
 *
 * Bound. It reads the DOM as it stands when the page has settled, so a bad value in a frame that was
 * replaced before the scan is the console-error check's to catch, not this one's; the two together are
 * what covers the class. It asks whether a value is a number and whether it has the sign SVG allows,
 * not whether it is the right number. Only figures that a page mounts are scanned — a registered kind
 * no chapter uses yet is `npm run drive`'s and `npm run narrow`'s subject — and only authored SVG: a
 * canvas or a WebGL figure writes no attributes here, which is why the count is reported per load.
 */
function auditFigureGeometry({ page: pageId, viewport, theme }) {
  // A length, or a list of lengths, where SVG calls a negative value an error. The browser refuses the
  // whole attribute, so the shape falls back to its default or vanishes.
  const NON_NEGATIVE = new Set(['width', 'height', 'r', 'rx', 'ry', 'stroke-width', 'stroke-dasharray',
    'font-size', 'markerWidth', 'markerHeight', 'pathLength', 'letter-spacing', 'word-spacing']);
  // A number where any sign is fine but NaN, Infinity and undefined are not.
  const FINITE = new Set(['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2', 'dx', 'dy', 'fx', 'fy', 'fr',
    'offset', 'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-dashoffset', 'stroke-miterlimit',
    'rotate', 'startOffset', 'textLength', 'orient']);
  // A string built out of numbers: the numbers are not separable, so it is read for the words a broken
  // one carries.
  const BUILT = ['d', 'points', 'transform', 'gradientTransform', 'patternTransform', 'viewBox'];
  // The words SVG allows where a number would otherwise go. `auto-start-reverse` is here because it is
  // not hypothetical: `<marker orient="auto-start-reverse">` on chapter 1's homeostasis figure is how
  // this check first went red, on a page with nothing wrong with it. A list like this is the way a scan
  // of attribute values fails — against the corpus, before it lands — so it was built by running the
  // check over every page of both books rather than from the specification alone.
  const KEYWORD = /^(auto|auto-start-reverse|auto-reverse|none|inherit|initial|unset|revert|normal|currentcolor|context-fill|context-stroke|medium|small|large|x-small|x-large|xx-small|xx-large|smaller|larger)$/i;
  const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?(%|px|pt|pc|cm|mm|in|em|ex|rem|ch|vw|vh|q|deg|grad|rad|turn|s|ms)?$/i;
  const BROKEN = /\b(NaN|Infinity|undefined|null)\b/;

  const where = (node) => {
    const fig = node.closest('tb-figure');
    const kind = fig?.getAttribute('kind') || '?';
    const id = fig?.id || '?';
    const cls = node.classList.length ? `.${[...node.classList].slice(0, 2).join('.')}` : '';
    const parent = node.parentElement?.getAttribute('class');
    return `${kind} (${id}) <${node.tagName.toLowerCase()}${cls}>${parent ? ` inside .${parent.split(/\s+/)[0]}` : ''}`;
  };
  const say = (node, name, value, what) => `${pageId} ${viewport} ${theme}: ${where(node)} has ${name}="${value}", and ${what}. A figure writes its shapes from arithmetic, so this is a number that came out wrong upstream — work out why the value inverts or goes undefined rather than clamping it here; what would satisfy this is ${name} being a finite number${NON_NEGATIVE.has(name) ? ' that is not negative' : ''}, or the shape not being drawn at all.`;

  const problems = [];
  let elements = 0;
  let attributes = 0;
  const kinds = new Set();
  const mounted = [...document.querySelectorAll('tb-figure')];
  // The one way this scan could stop running and still report a clean page: a figure that moved its
  // drawing into a shadow root, which querySelectorAll does not enter. A page with no authored SVG at
  // all is an ordinary result — a canvas figure, a WebGL figure and 字与词 draw none — so the counts
  // below are printed on every line instead of being asserted against a table of which kind draws what.
  for (const fig of mounted) {
    if (fig.shadowRoot) problems.push(`${pageId} ${viewport} ${theme}: ${fig.getAttribute('kind')} (${fig.id}) has a shadow root, and this check reads the light DOM, so every shape inside it went unread. What would satisfy this: the scan below entering the shadow root, or the figure drawing where the other gates can see it.`);
  }
  for (const svg of document.querySelectorAll('tb-figure svg')) {
    for (const node of [svg, ...svg.querySelectorAll('*')]) {
      elements += 1;
      const fig = node.closest('tb-figure');
      if (fig) kinds.add(fig.getAttribute('kind') || '?');
      for (const attr of node.attributes) {
        const name = attr.name;
        const value = attr.value;
        const nonNeg = NON_NEGATIVE.has(name);
        if (nonNeg || FINITE.has(name)) {
          attributes += 1;
          for (const token of value.trim().split(/[\s,]+/)) {
            if (!token || KEYWORD.test(token) || /^(var|calc|attr)\(/i.test(token)) continue;
            if (!NUMBER.test(token)) {
              problems.push(say(node, name, value, `"${token}" is not a number`));
            } else if (nonNeg && parseFloat(token) < 0) {
              problems.push(say(node, name, value, `${token} is negative, which SVG does not allow for ${name}`));
            }
          }
        } else if (BUILT.includes(name)) {
          attributes += 1;
          const m = BROKEN.exec(value);
          if (m) problems.push(say(node, name, value.length > 90 ? `${value.slice(0, 90)}…` : value, `it carries "${m[1]}", so the arithmetic that built it did not produce a number`));
        }
      }
    }
  }
  // One problem per element and attribute would bury the report under a repeating lattice; the first
  // six say which figure and which attribute, and the count says how far it goes.
  const shown = problems.slice(0, 6);
  if (problems.length > shown.length) shown.push(`${pageId} ${viewport} ${theme}: and ${problems.length - shown.length} more geometric attribute(s) like the ones above.`);
  return { problems: shown, found: problems.length, elements, attributes, kinds: [...kinds] };
}

// ------------------------------------------------------------------------------------------------
// Fonts: a character drawn by a face the page never loaded
// ------------------------------------------------------------------------------------------------
//
// On 2026-09-16 a worker proved by scratch probe that no element on a biology page was drawn by a system
// font, after finding that a chapter's step buttons had been rendering their arrows in Segoe UI Symbol.
// The probe went with the worker, and the book now leans on a Google Fonts `text=` subset URL that names
// an explicit character list — so the next new symbol an author types falls out of the subset, is drawn
// by whatever the reader's machine has, and looks almost right. Almost right is the whole problem: this
// machine happens to have Noto Sans SC installed, which is why the library page's Chinese looked fine
// here while it was falling back on every load (found by this check's first run, the same day).
//
// How it measures. CDP's `CSS.getPlatformFontsForNode` reports the faces that actually drew a node's
// text, and whether each came from an `@font-face` the page loaded (`isCustomFont`). It cannot be asked
// once for the page: Chromium walks at most two levels below the node it is given, so `<body>` reported
// 19 glyphs on a chapter of 1316 text nodes. So the page is reduced instead — every text node and every
// `::before`/`::after` string is grouped by its computed (font-family, weight, style, numeric-variant),
// a probe span per group carries that group's distinct code points, and one call per span asks which
// faces drew them. A chapter collapses to 16–25 groups, so the green case costs one DOM walk and about
// twenty protocol calls. A group drawn by a face the page did not load is then split into chunks and
// single code points, so the failure names the characters and not just the stack.
//
// What counts as chosen is derived from the page, never listed here: any face the page loaded through
// `@font-face`. The biology pages load Fraunces, Newsreader, Inter, Libertinus Serif and Noto Sans Math;
// `tongjian/**` loads Noto Serif SC and Noto Sans SC by that book's own design; a third book with a third
// stack needs no entry, and a page that drops a family from its `<link>` fails without anybody updating
// a table. Libertinus Serif is a loaded face, so the handful of glyphs Newsreader lacks and it supplies
// pass — a declared fallback that was paid for is not a fallback to the machine.
//
// Bound. It reads the DOM as it stands after the handshake, at each viewport and theme, including text in
// a subtree that is hidden at this width, because a closed drawer is one press from being read. It asks
// per code point, so a combining sequence is split and judged apart; it asks whether a face was loaded,
// never whether the RIGHT loaded face was picked, whether the glyph is well drawn, or whether the size or
// weight is the intended one. It cannot see text a figure paints into a canvas or through WebGL, nor a
// character that only appears once a control is pressed — those are `npm run drive`'s and `npm run
// flow`'s. It does not visit `lab/`, whose `<pre>` debug dump is deliberately `monospace`: the lab is a
// developer surface and is not in this gate's page list. The face a fallback lands on differs by machine
// (SimSun here, something else on the Ubuntu runner) but the verdict does not, because the question is
// whether the page loaded it. Cost measured 2026-09-16: 30–370 ms per page load, the upper end on
// tongjian/ch02's 2400 text nodes.
const PROBE_HOST = '__tb-font-probe';

/** Every distinct (stack, weight, style, numeric variant) on the page, with the code points drawn in it. */
function collectFontRuns() {
  const cased = (s, how) => {
    if (how === 'uppercase') return s.toUpperCase();
    if (how === 'lowercase') return s.toLowerCase();
    if (how === 'capitalize') return s.replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
    return s;
  };
  // Whitespace and the invisible formatting characters draw nothing a reader can judge, and a zero-width
  // joiner in a probe span would change how its neighbours shape.
  const INVISIBLE = /[\s\u0000-\u001f­​-‏⁠﻿]/u;
  const describe = (el) => {
    const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/)[0]}` : '';
    const section = el.closest('section[id]')?.id;
    return `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}${section ? ` in #${section}` : ''}>`;
  };
  const groups = new Map();
  const add = (style, text, where) => {
    const chars = [...String(text)].filter((c) => !INVISIBLE.test(c));
    if (!chars.length) return;
    const key = [style.fontFamily, style.fontWeight, style.fontStyle, style.fontVariantNumeric].join('\u0000');
    if (!groups.has(key)) {
      groups.set(key, { family: style.fontFamily, weight: style.fontWeight, style: style.fontStyle, variant: style.fontVariantNumeric, chars: new Set(), where: [], runs: 0 });
    }
    const g = groups.get(key);
    g.runs += 1;
    if (g.where.length < 3 && !g.where.includes(where)) g.where.push(where);
    for (const c of chars) g.chars.add(c);
  };

  let textNodes = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    if (!el) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'title' || tag === 'noscript') continue;
    const style = getComputedStyle(el);
    textNodes += 1;
    add(style, cased(node.data, style.textTransform), describe(el));
  }
  let pseudo = 0;
  for (const el of document.querySelectorAll('*')) {
    for (const which of ['::before', '::after']) {
      const style = getComputedStyle(el, which);
      const raw = style.content;
      if (!raw || !raw.startsWith('"')) continue; // none, normal, a counter, an image: no string of ours
      let text = raw.slice(1, -1);
      try {
        text = JSON.parse(raw.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => JSON.stringify(String.fromCodePoint(parseInt(hex, 16))).slice(1, -1)));
      } catch { /* an escape this cannot read: the raw string still names its characters */ }
      pseudo += 1;
      add(style, cased(text, style.textTransform), `${describe(el)}${which}`);
    }
  }
  return {
    textNodes,
    pseudo,
    loaded: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))].sort(),
    groups: [...groups.values()].map((g) => ({ ...g, chars: [...g.chars].join('') })),
  };
}

/** Insert one probe span per run and ask CDP which faces drew each. Returns the faces, span by span. */
async function measureRuns(page, cdp, runs) {
  await page.evaluate(({ host: hostId, runs: list }) => {
    document.getElementById(hostId)?.remove();
    const host = document.createElement('div');
    host.id = hostId;
    host.setAttribute('aria-hidden', 'true');
    // Fixed, clipped and one pixel square, so it contributes nothing to the document's scroll width: the
    // overflow check above must not be able to fail because of this check's own scaffolding. The spans
    // inside still lay out at their natural size, which is where the face is chosen.
    host.style.cssText = 'position:fixed;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;';
    for (const [i, run] of list.entries()) {
      const span = document.createElement('span');
      span.id = `${hostId}-${i}`;
      span.style.whiteSpace = 'pre';
      span.style.fontFamily = run.family;
      span.style.fontWeight = run.weight;
      span.style.fontStyle = run.style;
      span.style.fontVariantNumeric = run.variant;
      span.textContent = run.chars;
      host.appendChild(span);
    }
    document.body.appendChild(host);
    host.getBoundingClientRect(); // force layout, which is what picks the faces
  }, { host: PROBE_HOST, runs });
  await page.evaluate(() => document.fonts.ready);
  const { root } = await cdp.send('DOM.getDocument', { depth: 1 });
  const out = [];
  for (let i = 0; i < runs.length; i += 1) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `#${PROBE_HOST}-${i}` });
    const { fonts } = nodeId ? await cdp.send('CSS.getPlatformFontsForNode', { nodeId }) : { fonts: [] };
    out.push(fonts ?? []);
  }
  return out;
}

/**
 * The census for one page load. Returns { problems, runs, codePoints, faces, measured } with `problems`
 * already phrased for the report.
 */
async function auditFonts(page, cdp, { page: pageId, viewport, theme }) {
  const problems = [];
  const started = Date.now();
  const census = await page.evaluate(collectFontRuns);
  const runs = census.groups;
  const codePoints = runs.reduce((n, r) => n + [...r.chars].length, 0);
  if (!runs.length) {
    return { problems: [`${pageId} ${viewport} ${theme}: the font census found no text at all, over ${census.textNodes} text node(s). A census that measured nothing must not read as a census that found nothing; the collector above is broken, or this page really has no prose, and either way this check proved nothing here.`], runs: 0, codePoints: 0, faces: [], measured: 0, ms: Date.now() - started };
  }
  const drawn = await measureRuns(page, cdp, runs);

  const faces = new Map();
  let measured = 0;
  const strays = [];
  for (const [i, fonts] of drawn.entries()) {
    const run = runs[i];
    if (!fonts.length) {
      problems.push(`${pageId} ${viewport} ${theme}: the font probe for the stack "${run.family}" reported no face at all, although it carries ${[...run.chars].length} code point(s) from ${run.where.join(', ')}. The probe span did not lay out, so this stack was not measured and a clean line here would be a run that did not happen.`);
      continue;
    }
    for (const f of fonts) {
      measured += f.glyphCount;
      const key = `${f.familyName}${f.isCustomFont ? '' : ' (not loaded)'}`;
      faces.set(key, (faces.get(key) ?? 0) + f.glyphCount);
      if (!f.isCustomFont) strays.push({ run, index: i, face: f });
    }
  }

  // Only now, and only for the runs that failed, is it worth paying for the narrowing: the failure has to
  // name the characters, because "this stack falls back somewhere" is not something an author can act on.
  for (const { run, face } of strays) {
    const chars = [...run.chars];
    const CHUNK = 24;
    const chunks = [];
    for (let i = 0; i < chars.length; i += CHUNK) chunks.push(chars.slice(i, i + CHUNK));
    const chunkRuns = chunks.map((c) => ({ ...run, chars: c.join('') }));
    const chunkFonts = await measureRuns(page, cdp, chunkRuns);
    const suspect = [];
    for (const [i, fonts] of chunkFonts.entries()) {
      if (fonts.some((f) => !f.isCustomFont)) suspect.push(...chunks[i]);
    }
    const singles = suspect.map((c) => ({ ...run, chars: c }));
    const singleFonts = singles.length ? await measureRuns(page, cdp, singles) : [];
    const guilty = [];
    for (const [i, fonts] of singleFonts.entries()) {
      const stray = fonts.find((f) => !f.isCustomFont);
      if (stray) guilty.push({ char: suspect[i], face: stray.familyName });
    }
    const named = guilty.length
      ? guilty.map(({ char, face: fam }) => `${JSON.stringify(char)} (U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} → ${fam})`).join(', ')
      : `not isolated — the chunks disagreed with the whole run, so read the ${chars.length} code point(s) of this stack yourself`;
    problems.push(`${pageId} ${viewport} ${theme}: ${face.glyphCount} glyph(s) in ${run.where.join(', ')} are drawn by ${face.familyName}, which this page never loaded. The stack is "${run.family}" at weight ${run.weight}, and the page loaded ${census.loaded.join(', ') || 'no webfont at all'}. The characters that fall out of it: ${named}. A character no loaded face covers is drawn by whatever the reader's machine has, which looks almost right on a machine that happens to have a suitable font and is tofu on one that does not. What would satisfy this: add the character to the subset the page's Google Fonts <link> asks for (the \`text=\` list), load a family that covers it, or stop writing the character.`);
  }
  await page.evaluate((hostId) => document.getElementById(hostId)?.remove(), PROBE_HOST);
  // `ms` is in the report rather than on the console line: this check was added to a gate that already
  // took 93 seconds, and what it costs is a number somebody will want without re-deriving it.
  return { problems, runs: runs.length, codePoints, faces: [...faces].map(([k, v]) => `${k}:${v}`), measured, ms: Date.now() - started, loaded: census.loaded, textNodes: census.textNodes, pseudo: census.pseudo };
}

// ───────────── the study surface has to have rendered before the shutter opens ─────────────
//
// It does, and the shell is what makes it so. `window.__textbook.state` does not become 'ready' until
// every <tb-sitting> on the page has booted (src/shell.js), so this gate inherits the wait through
// openPage() and so does every other gate, including the two that load /today/ and never knew they had
// to — `npm run devices`, which does not even pass ?eager=1, and `npm run subpath`.
//
// What this block is now is the census, not the wait. The three things it says that the handshake cannot:
// that the page whose subject this is still carries a <tb-sitting> at all (the shell's term is vacuously
// true on a page that lost the element, so something has to notice); that the shell still exposes
// describeSittings(), which is where the numbers below come from; and that every sitting reads back as
// booted AFTER the handshake resolved, which is the assertion that the shell's term actually ran — delete
// the term from _check() and this goes red on the Today page. It reads the shell's own predicate on
// purpose: a second copy of "booted" living here is the thing that drifts.
//
// The history, because it is the reason the term exists. This gate used to wait for the sitting itself,
// in animation frames, and before that it did not wait at all:
//
// Measured 2026-09-17 on a still tree (every file the page is made of hashed identical before and after
// each arm): two `SHOT_PAGES=today` runs with NOTHING between them already differed on 3 of their 6
// frames, and the difference was not a rounding one — 102,349 bytes against 163,667 for the same frame.
// Six loads of /today/ in one process came back 1446 px high once and 900 px high five times, the short
// ones carrying the page's heading and intro and none of the sitting at all. The first load is the one
// that rendered: it fetched the fonts over the network and gave the boot time to finish, and every load
// after it was served from the run's memory and beat the boot. So the gate's own cache decided what the
// page looked like, and a frame from a fresh run and a frame from a warm one are different pictures.
//
// That is ALSO the answer to the order dependency this was looked for under. `npm run sitting` does not
// reach this gate's frames: the record lives in localStorage, which is per browser context and does not
// survive a process, and the server-side mirror is off under automation (src/learning/store.js's
// shouldPost() returns false when navigator.webdriver is true, and progress/ is empty after a sitting
// run). Both were measured before this was written. The non-reproducibility was never the record.
//
// Bound, and it is a real one, and it is the shell's now rather than this file's: the handshake makes the
// frame a picture of a BOOTED sitting, not of a determined one. It does not pin the plan (nothing in
// src/components/mastery.js or src/learning/scheduler.js calls Math.random, and the plan from an empty
// record is the calibration set, so the plan is the same every run — but that is a property of those
// files, not something the handshake enforces).
//
// The pages that MUST carry one. A census that finds nothing to count on the one page whose subject this
// is would be a check that quietly compared nothing (docs/policies/local-rules.md).
const SITTING_PAGES = new Set(['today']);

async function readSittings(page, pageId) {
  const states = await page.evaluate(() => (typeof window.__textbook?.describeSittings === 'function'
    ? window.__textbook.describeSittings()
    : null));
  const problems = [];
  if (states === null) {
    problems.push(`window.__textbook.describeSittings() is not a function on this page, so whether the handshake waited for a <tb-sitting> cannot be read. src/shell.js exports it beside describeFigures(); if it was renamed, rename it here too rather than dropping the check, because without it a Today frame is again a photograph of whatever had finished by the time the shutter opened.`);
    return { problems, found: -1, states: [] };
  }
  if (SITTING_PAGES.has(pageId) && !states.length) {
    problems.push(`this page carries no <tb-sitting> at all, and it is the page whose subject that is. Either the element was renamed or the page lost it, and without it every check below is being made about a page with no study surface on it — and the handshake's own sitting term is vacuously true, so nothing else on the page would say so.`);
  }
  for (const [i, s] of states.entries()) {
    if (!s.booted) {
      problems.push(`<tb-sitting> ${i + 1} of ${states.length} had still rendered nothing into its .tb-standing section, and the page had ALREADY reported window.__textbook.state === 'ready'. That is the handshake's sitting term not running: src/shell.js's _check() must hold 'loading' until every <tb-sitting> has booted. It reports ${s.steps ?? -1} step(s) from ${s.items ?? -1} item(s).`);
      continue;
    }
    if (!s.readable) problems.push(`<tb-sitting> ${i + 1} of ${states.length} has painted its .tb-standing section but its describe() threw or is missing, so nothing on this line can say how long the sitting is. src/components/mastery.js's describe() reads fields build() creates; a booted sitting must be able to answer it.`);
  }
  return { problems, found: states.length, states };
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch({ gpu });
const report = [];
let failures = 0;
try {
  for (const pageDef of pages) {
    for (const vp of viewports) {
      for (const theme of themes) {
        const label = `${pageDef.id} ${vp.id} ${theme}`;
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
        page.setDefaultTimeout(ACTION_TIMEOUT_MS);
        const errors = collectErrors(page);
        const problems = [];
        let figures = {};
        let captionNote = '';
        let hookNote = '';
        let geomNote = '';
        let fontNote = '';
        let hooking = { measured: 0, targets: 0, declared: 0, census: [], unread: 0 };
        let geometry = { found: 0, elements: 0, attributes: 0, kinds: [] };
        let fonts = { runs: 0, codePoints: 0, faces: [], measured: 0 };
        let sittingNote = '';
        const started = Date.now();
        try {
          figures = await openPage(page, `${server.url}${pageDef.path}?eager=1&t=0&theme=${theme}`);
          for (const [id, f] of Object.entries(figures)) {
            if (f.state !== 'ready') problems.push(`figure ${id} (${f.kind}) is in state "${f.state}"${f.error ? `: ${f.error}` : ''}`);
          }
          const sittings = await readSittings(page, pageDef.id);
          problems.push(...sittings.problems);
          // Printed on every line, clean or not: `0 sitting(s)` is a page this census had nothing to
          // count, and a census that counted nothing must not read as a page that had settled.
          sittingNote = `, ${sittings.found} sitting(s)${sittings.found > 0 ? ` booted (${sittings.states.map((s) => `${s.steps ?? -1} step(s) from ${s.items ?? -1} item(s)`).join('; ')})` : ''}`;
          const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
          if (overflow.scrollWidth > overflow.clientWidth + 1) problems.push(`the document overflows horizontally: scrollWidth ${overflow.scrollWidth} > viewport ${overflow.clientWidth}`);
          const census = HOOK_CENSUS[pageDef.id];
          hooking = await page.evaluate(auditColourHooks, { page: pageDef.id, viewport: vp.id, required: census?.hooks ?? [], why: census?.why ?? '' });
          problems.push(...hooking.problems);
          // The counts, not only the failures. A page with a floor table prints what each hook was found
          // on against what its floor allows, so a clean line cannot be a count that was never taken, and a
          // page with no table prints nothing here rather than a zero that would read like one.
          const counted = (hooking.census ?? []).map((c) => `${c.key.replace(/^data-/, '').replace(/"/g, '')} ${c.found}/${c.floor}`).join(', ');
          hookNote = `, ${[
            hooking.measured ? `${hooking.measured} colour-hook mark(s) painted` : 'no colour hooks',
            hooking.targets ? `${hooking.targets} hooked target(s) reached` : '',
            counted ? `census ${counted}` : census ? 'census table carries no readable hook' : '',
            hooking.unread ? `${hooking.unread} node(s) with no ::before/::after channel` : '',
          ].filter(Boolean).join(', ')}`;
          geometry = await page.evaluate(auditFigureGeometry, { page: pageDef.id, viewport: vp.id, theme });
          problems.push(...geometry.problems);
          // Printed on every line, including the clean ones: `0 SVG attr(s)` is a scan that compared
          // nothing, and a scan that compared nothing must not read as a scan that found nothing.
          geomNote = `, ${geometry.attributes} SVG attr(s) over ${geometry.elements} element(s) in ${geometry.kinds.length} figure(s)`;
          const captions = await page.evaluate(() => ({
            lang: document.documentElement.getAttribute('lang') || '',
            nums: [...document.querySelectorAll('tb-figure figcaption .fig-num')].map((n) => ({
              id: n.closest('tb-figure')?.id ?? '?',
              text: n.textContent.trim(),
              label: n.closest('figure')?.getAttribute('aria-label') ?? '',
            })),
          }));
          const word = figureWordFor(captions.lang);
          if (word) {
            for (const c of captions.nums) {
              if (!c.text.startsWith(`${word} `)) problems.push(`the caption of ${c.id} numbers itself "${c.text}", but a page in lang="${captions.lang}" writes its figure word as "${word}"`);
              if (!c.label.startsWith(`${word} `)) problems.push(`the aria-label of ${c.id} is "${c.label}", so a screen reader hears a word other than "${word}" before it on a lang="${captions.lang}" page`);
            }
            captionNote = `, ${captions.nums.length} caption(s) in "${word}"`;
          }
          const file = `${OUT}/${pageDef.id}-${vp.id}-${theme}.png`;
          await page.screenshot({ path: file, type: 'png', fullPage: true });
          // Last, and after the screenshot: it inserts probe spans, and nothing above it should be able
          // to see them. The host is removed again inside auditFonts.
          const cdp = await page.context().newCDPSession(page);
          await cdp.send('DOM.enable');
          await cdp.send('CSS.enable');
          fonts = await auditFonts(page, cdp, { page: pageDef.id, viewport: vp.id, theme });
          problems.push(...fonts.problems);
          // Printed on every line. `0 stack(s)` or `0 glyph(s)` is a census that compared nothing, and a
          // census that compared nothing must not read as one that found nothing.
          fontNote = `, ${fonts.measured} glyph(s) over ${fonts.codePoints} code point(s) in ${fonts.runs} stack(s): ${fonts.faces.join(' ')}`;
        } catch (err) {
          problems.push(err.message);
        }
        for (const e of errors) problems.push(e);
        await page.close();
        const ms = Date.now() - started;
        const entry = { page: pageDef.id, viewport: vp.id, theme, ms, figures: Object.fromEntries(Object.entries(figures).map(([k, v]) => [k, { kind: v.kind, state: v.state, drawCalls: v.drawCalls, triangles: v.triangles }])), hooks: hooking, geometry, fonts, problems };
        report.push(entry);
        if (problems.length) {
          failures += 1;
          console.log(`FAIL ${label} (${ms} ms)`);
          for (const p of problems) console.log(`  ${p}`);
        } else {
          console.log(`ok   ${label} (${ms} ms, ${Object.keys(figures).length} figures ready${sittingNote}${captionNote}${hookNote}${geomNote}${fontNote})`);
        }
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
if (failures) {
  console.error(`FAIL: ${failures} of ${report.length} page loads had problems; see ${OUT}/report.json`);
  process.exit(1);
}
console.log(`shot: ${report.length} page loads clean; screenshots in ${OUT}/`);
