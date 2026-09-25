# Adaptive study — design of record

How the book tracks what the reader has learned, what they are struggling with, and how it reorganises practice around that. Companion to [textbook.md](textbook.md), which stays the design of the book itself.

Status: **design agreed, first increment being built**. Decisions marked **[owner]** came from the owner's request.

## What the owner asked for **[owner]**

Keep track of what I learned well and what I struggle to master, organise the content and the quizzes accordingly, and have the agent review my progress in rounds.

## The one architectural idea

Three layers, and the value of the design is that they are separate.

| Layer | What it is | Who runs it | When |
|---|---|---|---|
| **Evidence** | An append-only log of what the reader did and how it went | The browser | Every interaction |
| **Schedule** | A pure function from that history to "what is due, and how shaky is it" | The browser | Instantly, offline, on every page load |
| **Judgement** | Diagnosis, new questions, new explanations, reordering | The agent | In rounds, on the owner's command |

Conflating the last two is the tempting mistake. A model that re-derives review intervals every night is slower, costlier, and worse than twenty lines of arithmetic, and it cannot run while the reader is mid-sitting. The agent earns its place on the things arithmetic cannot do: noticing *why* an answer was wrong, writing a question that discriminates, and saying so in words.

So the scheduler never calls a model, and the agent never schedules.

## The unit of mastery is an objective, not a chapter

"You are at 62% on chapter 1" is useless. What a reader needs to hear is which claim they cannot yet make.

A chapter declares its objectives beside its glossary, in `objectives.js`:

```js
{
  id: 'feedback-direction',
  statement: 'Predict which effector fires when core temperature leaves its set point, and which way the response pushes.',
  prereqs: ['homeostasis', 'set-point'],
  teaches: { sections: ['properties'], figures: ['fig-homeostasis'] },
  level: 'apply',            // recall | explain | apply
}
```

Every question and every task names the objective it tests (`<tb-check objective="feedback-direction">`). Mastery is then a statement about a claim, traceable in both directions: from a wrong answer to the paragraph and the figure that teach it, and from a paragraph to the evidence that it landed.

Prerequisites are what make the ordering honest. An objective whose prereqs are shaky is not "failed", it is **blocked**, and the queue works on the prerequisite instead.

## Evidence: what gets recorded

One event per interaction, appended, never edited:

```js
{ t: '2026-09-10T21:14:03.221Z', learner: 'default', session: 'e7f2…',
  objective: 'feedback-direction', item: 'q-hom-1', kind: 'mcq',
  outcome: 'right' | 'wrong' | 'partial',
  chose: 'B',            // which option, for a multiple choice
  ms: 8400,              // time from first sight to answer
  confidence: 'unsure',  // optional, self-reported before answering
  source: 'chapter' | 'today' }
```

Two fields carry most of the diagnostic weight, and neither is the score. `chose` turns "wrong three times" into "picks the option that reverses cause and effect, every time", which is a named misconception and therefore fixable. `ms` separates knowing from reconstructing: right-but-slow is fragile and will lapse, and it looks identical to mastery in a percentage.

**Where it lives.** `localStorage` always, so the book works offline and on GitHub Pages with no server. When the local dev server is running, each event is also POSTed to `/api/progress`, which appends it to `progress/<learner>.jsonl`. That file is the agent's input.

`progress/` is **git-ignored by default**. It is raw evidence, which the fleet keeps out of Git until review promotes it; it is also mildly personal, and this repository is published. What gets committed is what the round *concludes*: new items, new explanations, and the round note. `npm run progress:export` writes a backup, and `npm run progress:import` takes a file exported from a browser that had no server, which is how reading on a phone gets back into the record.

## Schedule: the pure part

`src/learning/scheduler.js` holds one card per objective:

```js
{ objective, state: 'new' | 'learning' | 'review' | 'lapsed',
  stability, difficulty, due, reps, lapses, lastReview }
```

The update is a compact variant of FSRS: stability grows on a success by a factor set by the card's difficulty and by how overdue the review was, difficulty drifts toward the observed outcome, and a lapse cuts stability hard and drops the card into relearning. The exact constants matter far less than the properties, which is what the tests assert:

- a right answer never shortens the next interval, and a wrong one never lengthens it
- intervals grow monotonically across a streak, and a lapse leaves the card below its pre-lapse interval
- the function is pure and deterministic, so the same history always produces the same queue

"Learned well" is not a number on its own. It is high stability, plus a recent success, plus success in **more than one format** — otherwise the reader has learned the question rather than the idea. "Struggling" is any of: two or more lapses, stability that has not moved after four reps, right-but-slow twice running, or a right answer at chance rate across a session.

## Judgement: what the agent round does

`npm run review` is the instrument, and it calls no model. It prints, for the window since the last round: every objective with its state and history, the flags above, a distractor histogram per item, and which items are going stale because the reader has now seen them often enough to recognise rather than recall.

The round itself is a command the owner invokes, and it does the five things arithmetic cannot:

1. **Diagnose.** Read the prose and the figure that teach each flagged objective, and the answers given. Name the misconception where the evidence supports one, and say the evidence is thin where it is not.
2. **Author.** Write items that discriminate, rather than more of the same: a case to work, a pair of explanations where one is wrong, a figure task. A new item for an objective the reader keeps missing is the point of the round.
3. **Explain.** Where the chapter's own prose is what failed, add a targeted aside or a worked example next to it.
4. **Retire.** Mark items the reader has memorised, and items whose observed difficulty says they are broken: everyone gets them right, or nobody does.
5. **Report.** Write `docs/study/rounds/<date>.md`: what moved, what it changed and why, and what it is watching next.

Everything it produces is a commit the owner can read. There is no hidden model of the reader: the state is a JSON file and a folder of dated notes.

**Cadence is driven by evidence, not by the clock.** A round on a day with no studying is a no-op that costs money and buries the real notes. The round runs when there are at least twenty new events, or three days have passed with any new events at all. The fleet's standing rule is that nothing here runs unattended, so this is a command; turning it into a scheduled task is a decision for the owner and is not taken by default.

## Dynamically organising the content

Three surfaces change, and one deliberately does not.

- **Today** (`/today/`) is the new front door for a sitting: a queue of about ten items assembled from what is due, in prerequisite order, mixing formats, with a short honest summary of where the reader stands. This is where adaptivity mostly lives.
- **The chapter page annotates itself.** Each section carries a small mastery marker, and a section holding a lapsed objective gets an inline nudge into Today. Reversible, dismissible.
- **The book page orders what to read next** by prerequisite readiness rather than by chapter number alone.
- **The prose is never hidden, locked, or gated.** A textbook's worth is that you can read it, including the parts you are bad at and the parts you have not earned. Adaptation reorders *practice* and annotates; it does not ration the book. Nothing in this design unlocks a chapter.

## Question formats, and why the mix matters

Multiple choice measures recognition, and a reader who is assessed only by multiple choice learns to spot distractors. Three formats, and an objective counts as mastered only across at least two of them:

- **Multiple choice** (`<tb-check>`): cheap, instant, already built.
- **Figure tasks** (`<tb-task figure="fig-homeostasis">`): "turn the feedback off, run a race, and say what happens to the core temperature." The figure grades it from its own `describe()`. This is the format this repository can do that a flashcard app cannot, and it is the best evidence that an idea has landed.
- **Free response**: graded by a runtime model call, which the fleet authorises. With no network it is queued and graded in the next round.

## Cold start

With no history every objective is `new`, and a queue of two hundred items on the first morning is how this kind of system dies. The first visit offers a two-minute calibration: a handful of items spread across the book, plus the option to mark what is already known. After that the queue introduces a few new objectives per sitting and lets the schedule do the rest.

## What this risks, and what holds it

- **The item bank rots.** An agent writing questions nightly will accumulate near-duplicates and quietly bad items. Held by: every generated item passes the content gate (one correct answer, an explanation, a registered objective), calibration retires items whose observed difficulty is degenerate, and every round is a reviewable diff.
- **The reader games the measure.** Held by the format mix, by rotating items within an objective, and by counting latency and the chosen distractor rather than the score alone.
- **The schedule is trusted past its evidence.** A card's state after two answers is nearly noise. The surfaces say how much evidence is behind a claim, and the round says "thin evidence" instead of inventing a diagnosis.
- **The record is lost.** It is a local ignored file. Held by an export command and by the round notes, which carry the conclusions even if the raw log goes.

## Amendment to the book's non-goals

`textbook.md` lists "accounts or progress sync" as a non-goal. That stands as written for accounts and for any cloud service. What this design adds is local: a browser-local record, and a local dev-server endpoint that appends to a local file. There is still no account, no server-side rendering, and nothing leaves the machine.
