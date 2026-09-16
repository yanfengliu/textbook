# English and Chinese editions of the book

Status: planned
Owner: Integration owner (textbook session, 2026-09-11)
Created: 2026-09-11
Updated: 2026-09-11

> **Allocation blocker.** `node scripts/work-docs.mjs create --repo ../textbook --theme bilingual` refuses to run: `docs/work/registry.json` and `.git/work-docs-state.json` both record allocation 0 only, while folders `1_adaptive-study` and `2_rest-of-the-book` exist on disk. The tool reports *"Unexpected directory/file … 1_adaptive-study; every unit folder must match one registry allocation."* This ID follows the folder sequence already in use, on the explicit instruction of the session that commissioned this document. The integration owner should reconcile the registry with the three existing folders before the next allocation; do not renumber these folders to make the tool pass.

## Problem and outcome

The owner asked, in one line, for the textbook to support English and Chinese. Nothing exists: every page is `<html lang="en">`, there is no message catalogue, no locale switch, and the only locale-aware call in the tree is a hardcoded `toLocaleString('en-GB')`.

Outcome: a reader can read *The Living World* in Simplified Chinese, set to a standard a typographer would accept, switch language at any section and keep their place, and practise in either language against one shared mastery record. Adding the Chinese edition of a chapter costs two authored files and no code change.

The design of record is [docs/design/i18n.md](../../design/i18n.md). This plan holds status and the order of work.

## Scope

**Included.** Simplified Chinese as a second reading language: a Chinese type system, a per-language authored page per chapter, a string layer for the shell, the components, the palette's display names and the figures, a language switcher, and the gate changes that prove all of it.

**Excluded.** Traditional Chinese (the design admits it; converting Simplified mechanically produces wrong terminology in a science text). Translating `lab/`, `describe()` values, ids, or anything under `progress/`. Server-side content negotiation. Machine translation of prose — the prose is the product and is authored.

**Dependencies.** Stage 0 is a prerequisite for everything: `tools/drive.js` addresses 76 controls by their visible English label, and four figures return the same string they draw, so translating anything before that fix turns the chain red in a way that looks like a code failure.

**Ownership boundaries.** The integration owner owns `src/strings.js`, `src/strings/en.js`, `src/figures/strings.zh.js`, `src/styles/tokens.css`, `src/styles/typography.css`, `tools/lib/browser.js`, `tools/check-content.js`, `tools/test.js` and `tools/drive.js`'s helper — every one of them is shared by all workers. A chapter's `index.zh.html` and `zh.js` belong to that chapter's worker.

**Concurrent work.** `docs/work/2_rest-of-the-book` is active and writing chapters 2 onward; a worker there was editing `docs/design/textbook.md` while this design was written, so `textbook.md` is untouched here and gains its link to `i18n.md` in stage 3.

## Approach

Six stages, each ending green. The design's own summary of the two decisions that matter:

- **Where the prose lives.** A sibling authored page per language in the chapter's own directory (`index.html`, `index.zh.html`), with `objectives.js`, `items.js` and `glossary.js` staying single language-neutral files and a `zh.js` overlay keyed by their ids. The Chinese file declares no ids of its own, so an identifier cannot be translated.
- **Chinese typography is a second type system, not a translated one.** The colour tokens, the spacing unit, the baseline grid, the modular scale and the structural vocabulary of rules are shared; the families, the leading, the emphasis device, the numerals, the rubric treatment and the chapter opener are not.

Full reasoning, the alternatives weighed, and the measured evidence are in the design.

## Acceptance criteria

- [ ] `npm test` passes all steps in both languages, including the new `npm run han`, on Node 24.18.1.
- [ ] Every new gate rule has been made red by reintroducing the defect, recorded in `docs/learning/gate-proofs.md`.
- [ ] `tools/drive.js` addresses no control by visible text; `tools/flow.js` asserts on attributes plus one word imported from the string table; `tools/sitting.js` cannot report "did not run" as "passed" when the mastery word is translated.
- [ ] A Chinese chapter page renders every Han glyph in Noto Serif SC or Noto Sans SC, with no synthesised weight and no synthesised slant, verified through `CSS.getPlatformFontsForNode`.
- [ ] The English and Chinese pages of a chapter have the same section ids, figure ids and kinds, term refs and question objectives, in the same order, proved by `npm run check`.
- [ ] A reader's record is one record: answering an item in Chinese and the same item in English moves one objective's mastery.
- [ ] The switcher preserves `location.hash`, uses a relative href, and `npm run subpath` stays green.
- [ ] A person has looked at the Chinese chapter at 1×, 2× and 3×, at 390 px and 1440 px, in both themes, and said so in this plan.
- [ ] Independent review of the type system and of the `check-content` rule changes (locally high-risk: the content checker's rules, and a change of this size to the design of record).

## Implementation steps

| # | Stage | State | Owner | Notes |
|---|---|---|---|---|
| 0 | Unblock the gates: `data-action` on driven controls, `h.button` matches it, display maps for `polymer`/`carbonkit`/`soup`/`water3d`/`foldlab`, `flow`'s literals to attributes | — | | No Chinese. `npm test` green, no behaviour changed. |
| 1 | `src/strings.js` + `src/strings/en.js`; shell, components, `palette.js` names/roles, four CSS `content:` rules; `ctx.t` on the frame and `meta.strings` on figures, English only | — | | ~1,000 strings move; nothing reads differently. |
| 2 | The Chinese type system: tokens, `typography.css` block, font links, `npm run han` and its red proofs, against one hand-translated specimen | — | | The stage to get right. Independent review. |
| 3 | Chapter 1 end to end: `index.zh.html`, `zh.js`, the switcher, `<html lang>`, discovery in `check-content` / `browser.js` / `pages.test.js`, the skeleton rule, the citation and length rules | — | | `textbook.md` gains its link to `i18n.md` here. |
| 4 | The chrome: library, book contents, `today/`; `navigator.languages` on first visit; the disabled switcher on untranslated chapters | — | | |
| 5 | `src/figures/strings.zh.js` and the component strings | — | | Reviewed by a person reading the figures: a mistranslated axis label is a wrong figure. |
| 6 | Chapters 2 and 3, then each chapter as it is written | — | | One session per chapter, alongside `docs/work/2_rest-of-the-book`. |

## Evidence behind the design

Taken in this repository's own headless Chromium (149.0.7827.55) against the real chapter with Chinese substituted into it. The probe scripts and screenshots are under the ignored `out/probe/` and the session scratchpad; they are task-run evidence and are deleted once stage 2 has its own gate. What they proved:

| Finding | How it was measured |
|---|---|
| Han glyphs fall back to SimSun on Windows — a different typeface on every reader's OS | `CSS.getPlatformFontsForNode`: `SimSun`, 110/110 glyphs |
| The chapter's opening line renders at 72% size under `font-variant-caps: all-small-caps` | per-character `Range`: 13.78 px on line 1 against 19.22 px on line 2 |
| The drop cap's ink collides with the third line | 3× clip of `.tb-dropcap` |
| Newsreader wins U+2014 and U+2018–201D, so the Chinese em dash and quotes render Latin-width | `CSS.getPlatformFontsForNode`: 2 and 4 glyphs to Newsreader |
| Putting the Han family first fixes all of them, and costs the true italic | the same probe under both stack orders |
| Synthesised Han bold smears; the variable font's 700 does not | side-by-side at 3× |
| 1.55 leading sets a grey slab; 1.75–1.9 reads | ladder at 2× |
| A Song at 400 is too light at 68.8 px for a title | four treatments at 2× |
| `text-autospace` is Baseline (Nov 2025) and its initial value is `normal`; `text-spacing-trim` has limited availability | MDN, plus `CSS.supports` in the gate browser |
| `text-emphasis: filled dot` is the right emphasis device; slant, underline and bold are not | four devices side by side at 3× |
| One chapter's Chinese type costs 1.70 MB (Noto Serif SC) + 0.63 MB (Noto Sans SC); pinning the weight axis changes nothing | response bytes from `fonts.gstatic.com`, cold cache, 401 prose + ~150 interface characters |

## Outcome

Pending. Nothing is implemented.
