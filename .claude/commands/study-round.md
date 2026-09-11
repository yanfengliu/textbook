# Study round

Read the reader's study record, work out what they are struggling with and why, and change the book to suit. One round, ending in a commit.

Run this when there is new evidence to read, not on a timer. `npm run review` tells you how much there is. Fewer than about twenty new events is usually not enough to distinguish a pattern from a bad afternoon, and a round with nothing to read produces a confident note about noise, which is worse than no note. If there is too little, say so and stop; that is a successful round.

## 1. Read the record

```bash
npm run review
```

It calls no model. It prints, for the window since the last round: every objective the reader touched with its state and history, the flagged objectives grouped by flag, the distractor histogram for every item missed more than once, and which items are going stale.

The flags are defined in `docs/design/adaptive.md`. Read them as claims to be checked, not conclusions:

- `lapsing` — was known, now missed. The interesting case: something displaced it, or it was never as solid as the schedule thought.
- `fragile` — right but slow. Being reconstructed rather than recalled, and it will lapse next.
- `guessing` — right at about chance across a session. Two right answers out of four options mean very little.
- `blocked` — the prerequisite is weak. Work on the prerequisite. Drilling the thing built on top of it is the commonest waste in this kind of system.
- `stale-item` — seen often enough that the reader may be recognising the item rather than knowing the idea.
- `thin-evidence` — too few answers to say anything. Say nothing.

## 2. Diagnose, and only as far as the evidence goes

For each flagged objective, open what teaches it (`teaches` in the chapter's `objectives.js` names the sections and figures) and the answers actually given.

The distractor histogram is the good part. A reader who picks the same wrong option every time has a specific, nameable, fixable belief, and every distractor in the bank carries a `why` saying what picking it reveals. A reader scattered across all the wrong options has no misconception; they have not learned it yet, which is a different problem with a different fix.

Write down which it is. Where the evidence does not support a diagnosis, write that instead of inventing one. "Three wrong answers, no pattern, needs more evidence" is a legitimate and useful finding.

## 3. Change the book

Do the smallest thing that addresses what you found.

- **A named misconception** gets an item built to catch it and an explanation built to correct it: add a `<tb-aside>` or a short worked example next to the prose that failed, in the chapter page.
- **A missing foundation** (`blocked`) gets its prerequisite worked on. Add items for the prerequisite if the bank is thin there. Do not add more items for the blocked objective.
- **A stale item** gets a sibling that asks the same objective a different way, and the stale one gets `retired: true` with a one-line reason. Never delete an item: the history refers to it.
- **A broken item** — everyone gets it right, or nobody does, or the reader's wrong answer is defensible — gets fixed or retired, and the reason goes in the note. An item the reader was right to fail is your mistake, not theirs.
- **Fragile but not wrong** usually needs no new content. Note it and let the schedule bring it back sooner.

New items go in the chapter's `items.js` in the existing format. Every distractor needs its `why`; that field is what makes the next round possible.

## 4. Write the note

`docs/study/rounds/<YYYY-MM-DD>.md`, and keep it short:

- The window read, and how many events.
- What moved since the last round, with the numbers.
- Each diagnosis, the evidence for it, and what you changed.
- What you are watching, and what would change your mind about it.
- Anything you decided not to act on, and why.

Write it to the reader, in plain words. They will read this more often than any other file in the repository.

## 5. Land it

```bash
npm run check
npm test
```

`npm run check` holds the new items: one correct answer, an explanation, a registered objective, a `why` on every distractor, three items minimum per objective. Then commit with a subject naming what the round found, not "study round".

## What this round must not do

- **Do not hide, lock, gate or reorder the prose.** The book stays a book. Adaptation changes practice and adds explanation; it never rations reading. This is a stated non-goal in the design, and it is the tempting wrong turn.
- **Do not tune the scheduler** to make the numbers look better. It is a pure function with its own tests; if it is genuinely wrong, that is a separate change with its own evidence.
- **Do not write encouragement you cannot support.** "You have this now" after two right answers is a lie the reader will find out about. Say how much evidence there is.
- **Do not generate items to fill a quota.** Three good items beat ten near-duplicates, and near-duplicates are how the bank rots.
