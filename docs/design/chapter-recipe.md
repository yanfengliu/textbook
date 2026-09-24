# How a chapter is built

The order an author works in, and what to check before handing each stage on. Chapter 1 established the shape by being written. Chapters 2 and 3 established the cost of not writing it down: eight days for two chapters, almost none of it spent writing. Every figure set was built, rejected, re-composed and polished again at phone width, and the same defects came back each pass because the criteria lived in rejection messages instead of here. Everything below was once a rejection message.

Read `biology/ch01-what-is-life/` before writing anything, in a browser rather than as source. It is the reference implementation, and matching its voice matters more than any rule here.

The book's design is [textbook.md](textbook.md); the study system's is [adaptive.md](adaptive.md); the gates are listed in `AGENTS.md`; the owner's standing quality bar and current direction are in [local-rules.md](../policies/local-rules.md). Those four are read. What each gate proves is looked up, one entry at a time, in [gates.md](../policies/gates.md). The two standing records — [gate-proofs.md](../learning/gate-proofs.md) and [defect-register.md](../learning/defect-register.md) — are **looked up**: each opens with an index, and you read the one entry it sends you to. Between them they run to hundreds of kilobytes, and no line of a chapter depends on reading either end to end.

## What a chapter is

A directory `biology/chNN-<slug>/` holding five files:

| File | What it is |
|---|---|
| `index.html` | The chapter: prose, figures, questions, end matter. Hand-authored. |
| `glossary.js` | Every term the chapter introduces, defined. |
| `objectives.js` | The claims a reader should be able to make, with prerequisites. |
| `items.js` | The review bank the study queue draws on. |
| `FIGURES.md` | The figure brief, copied from [figures-template.md](figures-template.md). Excluded from the published site. |

Plus the figure modules, one file each in `src/figures/`, registered in `src/figures/registry.js`, each with a recipe in `tools/drive.js`.

`index.html`'s `<head>` is copied from the previous chapter, and one thing in it is load-bearing: the two lines of `THEME_BLOCK` from `src/theme-early.js`, before the first stylesheet — every page carries them on the line after `<meta name="viewport" …>`. They apply the reader's stored theme before the page is first styled. A page without them shows a reader whose choice differs from their system the whole page in the other theme for a few frames, and then its titles fading across. Copy them verbatim and never edit a page's copy. `test/theme-early.test.js`, in `npm run unit`, fails a page that loads the shell and is missing them, carries a drifted copy, or carries them after a stylesheet; it names the page and prints the block to paste. `npm run theme` checks in a browser that the theme is on `<html>` before `<body>` exists.

## What a gate can see, and what it cannot

Read this twice. `npm test` runs every gate before every commit, and **not one of them can see a page**. Every gate says so in its own header; `local-rules.md` says it as a rule.

| A gate answers | Only a person answers |
|---|---|
| The page is structurally complete and internally consistent — `npm run check` | Whether a sentence is true |
| Every registered kind has a module that parses, is registered and calls no `Math.random` — `npm run unit` | Whether the prose reads as a book |
| Every page loads clean at three widths in two themes with no console error and no sideways scroll — `npm run shot` | Whether a panel is composed or half empty |
| The reader's controls and every figure's own controls do what the figure reports — `npm run flow`, `npm run drive` | Whether a readout is typography or application chrome |
| Every figure mounts and draws something at a 390 px stage — `npm run narrow` | Whether two labels collide, or whether type is legible on a phone |
| Every 3D figure renders from fifteen views — `npm run sweep3d` | Whether a distractor encodes a real misconception or is merely false |
| Nine real devices, with touch where the device has touch — `npm run devices` | Whether three items ask three different things |
| A sitting completes and no label claims more than the record — `npm run sitting` | Whether a prerequisite points at the foundation or downstream |
| Every path still works under `/textbook/` — `npm run subpath` | Whether a figure's own words agree with the chapter's |

So: **nothing in the checklists below is answered by a gate unless the line names one.** A bare line is a person looking, at the artefact's own resolution, in both themes, at the sizes a reader uses. A contact sheet or a scaled-down page answers "is it there", never "is it right".

---

## 1 · Before you write

**Owner: the author.** Half a day. This stage exists because chapter 3 skipped it.

Read the previous chapter's prose, `glossary.js` and `objectives.js`. You are going to use its words and hang prerequisites on its objectives; a chapter is not an island.

Chapter 3 referred to chapter 2 zero times. Across its 75 KB it used "hydrogen bond" 0 times against chapter 2's 24, "hydrophobic" 0 against 16, and not one of its thirty-five objectives named a chapter-2 prerequisite. The cost showed up as paraphrase — a signal peptide called "a mostly water-hating stretch" in a book that had spent a section on *hydrophobic* — and the study queue lost every edge it should have had between the chemistry and the cell. One rework pass, and the deepest one.

- [ ] I have read the previous chapter's prose, glossary and objectives.
- [ ] I can name the terms from earlier chapters this chapter will use rather than re-explain.
- [ ] I know which of my objectives will hang on which earlier chapter's objectives.

## 2 · The prose

**Owner: the author.** The deliverable. It is a book, not a slide deck: paragraphs that argue, not bullets that list. A reader should come out of a section with a picture, and reach for a figure because the prose made them curious.

The shape: eight or so `<section id="slug">` with an `<h2>`, which the shell numbers. An opener with unit label, chapter number, title, one-sentence promise, hero figure and contents. Key ideas in `<tb-key>`, margin notes in `<aside class="tb-margin-note">` before the paragraph they annotate. Every `<tb-figure>` carries a `<figcaption>` saying what it shows and a `data-alt` saying what a sighted reader learns from using it; the check counts them, nothing checks that they are true. End matter: key ideas, glossary, five `<tb-check>` questions, and a card pointing at the next chapter. British spelling, SI units with a space, old-style figures in prose and lining tabular figures in tables. Hedge where the science hedges — "all known life", not "all life".

Title a section with a claim or a question, the way chapter 1 does ("Life runs on information"), not with a noun label ("Water"). The sections in chapters 2 and 3 that read like this book are the ones that did.

**Write at the level of Campbell Biology or OpenStax Biology 2e, and do not write a sentence you could not source.** Chapter 1's review found six wrong statements in prose that read perfectly well. Assume yours has some too.

Where chapters 2 and 3 each lost a pass:

- **A claim that contradicts the chapter's own table or equation.** §3.2 said motors beat diffusion "over any distance greater than a few tens of micrometres"; the table three paragraphs above gives *t* = *x*²/2*D* at *D* = 1000 µm² s⁻¹, which makes diffusion about seventy times faster at 30 µm. Out by two orders of magnitude, on the same screen, in the section whose method is that the reader checks the arithmetic. §2.4 pushed hydrogen ions in "from the left" when the equation two lines above has H⁺ on the right. Do the arithmetic of every comparison you make, against the numbers on the same screen.
- **A key idea less accurate than the prose it summarises.** The buffer key said a buffer "stops the acid being felt", which is the exact misconception the section was built to prevent. A key idea is the sentence a reader carries away. Write it last, from the finished prose, and check it back against the prose.
- **A word the chapter leans on and never defines.** "Osmosis" carried three load-bearing steps in chapter 3 — why a bacterium needs a wall, why a plant stands up, how the vacuole solves §3.2 — with no `<tb-term>` and no entry in any glossary. `npm run check` cannot see this, because an unmarked word is not a term.
- **A term marked twice.** Chapter 3 marked `cell-wall` and `lysosome` in two sections each. A second dotted underline reads as a second introduction; `<tb-term>` is first use.
- **A figure cited a section away from where it sits.** Figure 2.7 sat in §2.6 and was first cited in §2.7, by which time the reader had scrolled past it. `npm run check` is satisfied by a citation anywhere on the page. Cite in the paragraph immediately before or after.
- **A next-chapter card that says the next chapter does not exist.** Both chapters told the reader the next was "In preparation" and linked to a contents page that said the same, so written chapters were unreachable from the book. `npm run check` passes it because `../` resolves.
- **A number nobody sourced, and a fix nobody checked.** The reviewer checked every quantitative claim in both chapters against standard values and found them all right; what was wrong was derived rather than looked up, which is why the two failures were the claims nobody thought needed a source. Three of that reviewer's own findings rested on recall rather than a source, and all three were worth verifying: each was confirmed and each changed the text anyway. So did three of the *fixes* — a margin note asserted what historians dispute about Wöhler, "for most proteins the tertiary structure is the finished article" was unsupported, and "the other two are each built from a single protein" missed that tubulin is an α/β pair. **A correction is a claim and gets the same check as the claim it replaced.**

- [ ] Every number in the chapter has a source I could name, and every comparison I make checks against the chapter's own table.
- [ ] Every key idea is at least as accurate as the paragraph it summarises.
- [ ] Every word the prose leans on is a `<tb-term>` with a glossary entry, or glossed in line at first use.
- [ ] No term is marked twice.
- [ ] Every figure is cited in the paragraph before or after it.
- [ ] The next-chapter card points at the next chapter's directory, with no "In preparation".
- [ ] I used the previous chapter's vocabulary where it applies, rather than paraphrasing it.
- [ ] I read the chapter through as a reader, in a browser, after the last edit.

## 3 · The objectives

**Owner: the author**, with the prose. Twenty to thirty-five, each a claim the reader can be tested on.

```js
{ id: 'feedback-direction',
  statement: 'Predict which effectors fire when core temperature leaves its set point.',
  prereqs: ['negative-feedback', 'set-point'],
  teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
  level: 'apply' }             // recall | explain | apply
```

`npm run check` holds that every prerequisite resolves, in this chapter or another, with no cycle, and that every objective names a section and a figure that exist. It cannot hold either of the two things that go wrong.

- **An objective that tests something no section teaches.** `dna-vs-rna` asked for strandedness §2.8 never states; `isomers` promised "structural isomers" the prose taught but never named. The objective is the contract an item writer works to, and three items get written against a claim nobody made. The check verifies that a section is *named*, not that it teaches.
- **A prerequisite that sends a struggling reader downstream.** `denaturation ← blood-ph` sent a reader who fumbled denaturation to practise renal bicarbonate handling. `magnification-resolution ← resolution-limits` made the simple distinction depend on the derived fact that is built on top of it, so a reader failing the derived one was walked back to something testing it again. For every edge, say what a reader who failed the objective is missing, and check that the edge names that.

- [ ] Every objective's statement uses only words its named section actually uses.
- [ ] For each prerequisite edge I can say what the failing reader is missing, and the edge names it.
- [ ] Several edges reach back into earlier chapters.

## 4 · The figure brief

**Owner: the author**, before any figure is written. Copy [figures-template.md](figures-template.md) to `biology/chNN-<slug>/FIGURES.md` and fill it in. Its header is the contract the figures are judged against, and it lives in the brief so a figure worker reads it before writing code rather than after.

At most about four bespoke interactive figures, each justified in the brief by what handling it teaches that prose cannot. Authored static SVG illustrations are allowed elsewhere in the chapter, and raster images still are not ([the owner's direction of 2026-09-23](../policies/local-rules.md#the-usage-allowance-is-the-budget-the-owners-direction-of-2026-09-23), point 3). How a static illustration is authored and checked is not decided yet: the first chapter that uses one decides it and writes it here. Write the brief well enough that the drive recipes and the task items can be written from it before the modules exist, because that is the cheaper order: `npm run drive` fails any registered kind without a recipe.

- [ ] The brief has at most about four bespoke interactive figures. Each shows a mechanism the reader changes, and its one-line "why it is a mechanism" says what handling it teaches that prose cannot.
- [ ] Every `describe()` field a task or a drive recipe will need is in the brief, and none is named `id`, `kind`, `number` or `state`.
- [ ] Every figure that can fill any shape has an `aspect` and a `narrowAspect`, and the brief says what its narrow composition drops or re-stacks.
- [ ] Kind ids and figure ids are clear of every other chapter's.
- [ ] The brief is a `.md` file inside the chapter directory, so `tools/pages-exclude.txt`'s `**/*.md` keeps it off the live site with nothing added to that list. Naming it there by hand is the roll-call the list exists to end.

## 5 · The figures

**Owner: figure workers, in parallel.** The criteria are the "What every figure here owes" section of the brief they were handed; this is the acceptance list.

A figure that passes every gate is not done. Chapter 3's last four figures passed every gate on arrival, and looking found seven defects in `plantcell3d` alone. Four of chapter 2's landed correct, deterministic and green over 26 drive steps, and went straight back for a design pass.

- [ ] Every panel is composed, at every width. No half-empty pane, and nothing was filled rather than re-composed.
- [ ] Every readout is set as typography. No pills, chips, bordered boxes, progress bars with text over the fill, or letter circles. The stage is still the only drawn rectangle.
- [ ] Control rows are grouped by what they do, and the primary action reads as primary.
- [ ] No label collides with another label, with the thing it names, with the toolbar or with the stage edge — checked at several points through a run, at 390 px and at desktop, in both themes.
- [ ] Every assembled sentence in a readout is grammatical in every state, and describes the state the figure is in.
- [ ] Every figure that needs a second composition has one, and I have looked at all of them at 390 px, at 3×, in both themes (`out/narrow/`).
- [ ] No negative or `NaN` geometry at any width.
- [ ] `describe()` reports nothing named `id`, `kind`, `number` or `state`, and every field a task will name is reachable only by the reader acting.
- [ ] Any factual sentence inside the module matches what the chapter now says.
- [ ] `DRIVE_KINDS=<mine> npm run drive`, `NARROW_KINDS=<mine> npm run narrow`, and `SWEEP_KINDS=<mine> npm run sweep3d` for a 3D figure, all green — and the frames each wrote have been looked at, not just counted.

## 6 · The items

**Owner: an item worker**, after the objectives are final and the figures are on disk. Three per objective minimum, which `npm run check` enforces; an objective counts as mastered only across at least two formats.

- **`mcq`** — every distractor carries a `why` saying what choosing it reveals. **This is the most important sentence in the file.** A distractor that is merely false teaches nothing; one that encodes a real, tempting error is what lets a study round name a misconception and write against it. The gate checks that the `why` exists, never that it is true.
- **`task`** — the reader does something in a figure and its own `describe()` grades the `expect`. This is the format this repository can do that a flashcard app cannot.
- **`free`** — a rubric of the points an answer should make.

The three items for one objective must not be one question reworded; they should differ in what they demand, and `apply` items should use cases the chapter never mentions. Do not pad a bank to reach three. Three good items beat ten near-duplicates, and near-duplicates are how a bank rots.

**Writing a `task` expectation.** `npm run check` runs every expect through the grader's own parser (`expectProblems` in `src/components/task.js`), so a clause no figure state could satisfy fails in the tree. It knows the grammar and not the figure. So:

- Take a `describe()` snapshot by **driving the real figure** — through `npm run figure -- <kind>`, which prints `describe()`, or in the lab — and write the expectation from that snapshot. Never from the brief alone.
- Then re-run it through the parser against a **fresh** snapshot before handing off. A snapshot taken before the figure's last change is a snapshot of a different figure.
- **The expectation must be false at mount, and false after the figure's clock has run on its own.** Two of chapter 2's tasks became true by themselves as the clock ran, so the only load-bearing clause was the `panel ===` one that proved the reader had acted. Chapter 3's twenty-nine were each checked three ways: false at mount, false after three idle seconds, true after the real controls.
- **The grammar compares a field against a literal, never against a second field.** A bare word on the right-hand side is a string literal, so `stepNm === filamentDiameterNm` compares the field against the text "filamentDiameterNm" and can never be true. `>`, `>=`, `<` and `<=` need a number.
- A goal must quote the label the reader actually sees, and the phone label is often not the desktop one. Do not ask a phone reader to read something the narrow composition does not draw.
- Grade on the whole question. `i-water-solvent-2` asks two things and grades one.

- [ ] Three items per objective, in at least two formats, each demanding something different.
- [ ] Every distractor's `why` names a real misconception a reader could hold, not a reason the option is false.
- [ ] Every `expect` was written from a snapshot of the running figure and re-checked against a fresh one.
- [ ] Every `expect` is false at mount, false after the figure has idled, and true only after the reader acts.
- [ ] No `expect` compares two fields.
- [ ] Every goal quotes a label the reader sees at the width the item will be answered at, and I have looked at the phone end states.
- [ ] Every item grades the whole of what it asks.

## 7 · The typographic pass

**Owner: whoever owns the chapter's prose**, after the prose is final. Small, and it has cost a pass on its own.

- **Greek letters, arrows and relations are drawn by faces chosen for them.** Newsreader, Fraunces and Inter carry no Greek block and no arrows, so before the stacks in `tokens.css` named Libertinus Serif and Noto Sans Math, every α, ⇌ and ◀ was drawn by whatever the reader's machine offered. The subsets are requested per page as an explicit `text=` list, so **a symbol the book has not used before is not covered until it is added to that list** — and until then it falls silently to a system font. If this chapter introduces one, add it and re-run the page-wide `CSS.getPlatformFontsForNode` census that proved no system-font glyph remains.
- **A Greek letter hyphenated to a word takes a word joiner**: `α-&#8288;helix`, `β-&#8288;glucose`. No CSS property stops a line breaking after a hyphen — `word-break`, `line-break` and `hyphens` were each tried at 390 px and every one still broke there — and a lone `β-` at the end of a line is what you get without it. This applies to figure button labels and item text too, not just prose.
- **A displayed equation is `<p class="tb-equation">`**, the only class a chapter puts on a paragraph. Chapter 2's carbonic-acid equation was the one inline `style=` in the book for weeks.
- **A superscript or subscript is markup, not a precomposed character.** `µm<sup>−1</sup>`, not `µm⁻¹`: the precomposed ⁻ and ¹ come from two different faces and set at two different weights.

- [ ] No glyph on any of this chapter's pages is drawn by a system font.
- [ ] Every Greek-hyphen-word compound carries a word joiner, in prose, in item text and in figure labels.
- [ ] Every displayed equation uses `.tb-equation`.
- [ ] Every super- and subscript is markup.

## 8 · Integration and acceptance

**Owner: the integration owner.** It does not implement; it delegates, inspects handoffs, and accepts.

The order of work, across the stages above:

1. Author writes prose, glossary, objectives and the figure brief (stages 1–4).
2. Integration owner adds the registry entries and writes the drive recipes from the brief, so figure and item workers have something to code against.
3. Figures and items in parallel (stages 5–6), then the typographic pass (stage 7).
4. Integration owner mounts everything, runs the chain, looks at the frames, and merges.

Sizing and resources: one worker per disjoint set of files, and **exactly one expensive gate at a time** — a browser gate owns a port and the CPU, and workers firing them at once empty each other's `out/` directories mid-read. Workers run kind-trimmed and page-trimmed gates (`DRIVE_KINDS`, `NARROW_KINDS`, `SWEEP_KINDS`, `SHOT_PAGES`, `DEVICE_PAGES`) and copy frames out of `out/` immediately. A trimming value that names nothing stops the gate rather than running nothing and passing. Page ids are book-qualified: `biology/ch04`, not `ch04`. The full chain runs once, by the integration owner, at the end; on `f5bd0e9` that was 36 minutes, of which `devices` was 25.

- [ ] `npm test` green, every step, run once with no worker competing.
- [ ] `npm run audit` green if any dependency changed.
- [ ] The chapter's `tb-source` is in `today/index.html` — `npm run check` prints the exact element when it is missing.
- [ ] The chapter is marked Read with a link and a dek on `biology/index.html`, and the previous chapter's next-card points at it.
- [ ] I have looked at the chapter page at desktop and phone width, in both themes, and at every figure's frames — not at a contact sheet.
- [ ] Every imperfection a worker named in its handoff is written into the round's `plan.md` with a judgement: fixed, or accepted with a reason. Nothing ships with a known visual defect and a note about it.
- [ ] Any defect the owner reported is in `docs/learning/defect-register.md` with a check covering its whole class — the entry written to the shape stated at the top of that file, and added to its index.
- [ ] Independent accuracy review obtained for the prose, for the figures against their captions and for the item bank, checked against the matching OpenStax Biology 2e section and recorded in the round's work folder. The chapter does not ship without it ([local-rules.md](../policies/local-rules.md#the-usage-allowance-is-the-budget-the-owners-direction-of-2026-09-23), point 4).
- [ ] Merged to main. A branch or a worktree does not count.

---

## What not to do

- Do not hide, lock, gate or reorder prose behind progress. The book stays a book.
- Do not write more than about four bespoke interactive figures in a chapter, or one the brief cannot justify by what handling it teaches that prose cannot. Where the chapter needs a picture beyond those, an authored static SVG illustration is allowed; a raster image is not.
- Do not pad an item bank to hit three per objective.
- Do not invent a number. Look it up or leave it out.
- Do not fix a half-empty panel by putting something in it.
- Do not accept a figure because the gates are green. They prove it runs, not that it is right.
- Do not record a criterion in a rejection message. Put it in this file, or in the brief's header, the same session.
