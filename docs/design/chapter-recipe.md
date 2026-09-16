# How a chapter is built

The contract every chapter author and figure worker works to. Chapter 1 established it by being written; this is that shape written down so the next thirty-one do not each reinvent it. The book's design is [textbook.md](textbook.md); the study system's is [adaptive.md](adaptive.md).

Read `biology/ch01-what-is-life/` before writing anything. It is the reference implementation, and matching its voice matters more than any rule below.

## What a chapter is

A directory `biology/chNN-<slug>/` holding four files:

| File | What it is |
|---|---|
| `index.html` | The chapter: prose, figures, questions, end matter. Hand-authored. |
| `glossary.js` | Every term the chapter introduces, defined. |
| `objectives.js` | The claims a reader should be able to make, with prerequisites. |
| `items.js` | The review bank the study queue draws on. |

Plus the figure modules it needs, in `src/figures/`, one file per figure, registered in `src/figures/registry.js`.

## The prose

**It is a book, not a slide deck.** Paragraphs that argue, not bullets that list. A reader should be able to read a section straight through and come out with a picture, and the figures should be things they reach for when the prose has made them curious, not decoration.

- Eight or so numbered sections, each `<section id="slug">` with an `<h2>`; the shell numbers them.
- An opener: unit label, chapter number, title, a one-sentence promise, a hero figure, and the contents.
- Every term the chapter introduces is `<tb-term ref="...">` on first use, and has a glossary entry.
- Every figure is referred to in the prose by number ("Figure 3.4 shows…"), which `npm run check` enforces.
- Key ideas in `<tb-key>`, margin notes in `<aside class="tb-margin-note">` placed **before** the paragraph they annotate.
- End matter: key ideas, glossary, five `<tb-check>` questions, and a card pointing at the next chapter.
- British spelling. SI units with a space. Old-style figures in prose, lining and tabular in tables.
- A Greek letter hyphenated to a word — `α-helix`, `β-glucose` — takes a word joiner after the hyphen, `α-&#8288;helix`, because no CSS property stops a line breaking after a hyphen (`word-break`, `line-break` and `hyphens` were each tried at 390 px and every one still broke there) and a lone `β-` at the end of a line is what you get without it.
- Hedge where the science hedges: "all known life", not "all life".

**Accuracy is not negotiable.** Write at the level of Campbell Biology or OpenStax Biology 2e, and do not write a sentence you could not source. Chapter 1 went through a read-only review that found six wrong statements in prose that read perfectly well; assume yours has some too.

## The objectives

Twenty to thirty-five per chapter, each a claim the reader can be tested on:

```js
{ id: 'feedback-direction',
  statement: 'Predict which effectors fire when core temperature leaves its set point.',
  prereqs: ['negative-feedback', 'set-point'],
  teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
  level: 'apply' }             // recall | explain | apply
```

Prerequisites are what let the study queue work on a missing foundation instead of drilling what sits on top of it, so they are worth getting right. They may name objectives from **earlier chapters** as well as this one: a chapter is not an island, and `register()` keys them by chapter. No cycles. Every objective names at least one section that teaches it.

## The items

Three per objective, minimum, which `npm run check` enforces. Mix the formats, and an objective counts as mastered only across at least two of them:

- **`mcq`** — the cheap one. Every distractor carries a `why` saying what choosing it reveals. **This is the most important sentence in the file.** A distractor that is merely false teaches nothing; one that encodes a real, tempting error is what lets a study round name a misconception and write against it.
- **`task`** — the reader does something in a figure and the figure's own `describe()` grades it against `expect`. This is the format this repository can do that a flashcard app cannot. Verify against the real figure that the state you expect is reachable and the field you name is reported.
- **`free`** — a rubric of the points an answer should make.

The three items for one objective must not be one question reworded. They should differ in what they demand, and `apply` items should use cases the chapter never mentions.

## The figures

Six to nine per chapter. Each is a module against the contract in [textbook.md](textbook.md): `meta`, `mount(root, ctx)`, and a handle with `destroy`, `setTime`, `describe`, `setVisible`, `setTheme`, and `setView` for 3D.

What makes a good one here: it shows a mechanism rather than a picture of a noun, it can be pushed on, and what the reader does to it changes what they understand. A labelled diagram that could have been a static image is a weak figure. Prefer, in rough order: a simulation the reader perturbs, a 3D thing they turn over, a scrubbable sequence, an authored illustration that responds.

Every figure:

- colours from `ctx.palette` or the CSS variables, never a new hex
- is a pure function of its clock and the reader's actions, so `setTime` pins it and a screenshot is the same frame every run; a seeded generator, never `Math.random`
- works with the keyboard and respects `prefers-reduced-motion`
- carries a `narrowAspect` in the registry if it can fill any shape, and a **second composition** for a narrow stage if its type would otherwise shrink below about nine device pixels on a phone
- has a `data-alt` saying what a sighted reader learns from using it

## The order of work

1. **Author** writes `index.html`, `glossary.js`, `objectives.js`, and a **figure brief**: for each figure, its kind id, what it shows, what the reader can do to it, which objectives it teaches, and what `describe()` should report so tasks can be written against it.
2. **Integration owner** adds the registry entries from the brief, so the figure and item workers have something to code against.
3. **Figures and items in parallel.** Item workers need the objectives and the figure briefs; figure workers need the brief and the contract.
4. **Integration owner** mounts everything, runs the gates, looks at the frames, and commits.

## The gates a chapter must pass

`npm test`, all nine steps. The ones that bite a new chapter:

- `npm run check` — every figure cited in the prose, every term in the glossary and every entry used, every question naming an objective the chapter declares, prerequisites resolving with no cycle, three items per objective, a `why` on every distractor, a task naming something that can grade it.
- `npm run shot` — the chapter page at three widths in both themes with every figure mounted, failing on any console error or horizontal overflow. **Add the chapter to `PAGES` in `tools/lib/browser.js`.**
- `npm run drive` — **every registered kind needs a recipe in `tools/drive.js`, or the gate fails.** A figure cannot land undriven.
- `npm run narrow` — every figure at a 390 px stage.
- `npm run sweep3d` — every WebGL figure across a sweep of camera angles.

## What not to do

- Do not hide, lock or gate prose behind progress. The book stays a book.
- Do not write a figure that is a static diagram with a caption.
- Do not pad the item bank to hit three per objective. Three good items beat ten near-duplicates, and near-duplicates are how the bank rots.
- Do not invent a number. If you do not know a value, look it up or leave it out.
