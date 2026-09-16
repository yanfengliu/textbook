# 2026-09-11 — The gates that were not running

Chapters 2 and 3 are written and their figures are being built. Integrating the first batch turned up four
checks that were passing without checking anything, which is a worse failure than a check that goes red.

## A figure could overwrite the frame's account of itself

`src/components/figure.js` built its description as `{ id, kind, number, state, ...handle.describe() }`.
The spread came last, so a figure reporting a field of its own called `state` replaced the frame's.
`foldlab` reports whether the protein is folded or denatured, and `npm run figure -- foldlab` died with
*figure foldlab is in state "folded"* — every gate that asks whether a figure reached `ready` had been
reading the figure's word for it, not the frame's.

The chapter-2 worker found this and asked which way to resolve it. Both ways, as it turns out. The frame's
four fields are now spread last and always win, so no figure can change what a gate reads. But winning
silently drops the figure's own value without a word, so `npm run drive` now fails any kind whose handle
reports `id`, `kind`, `number` or `state`.

The detail worth keeping: with `state: 'MUTATION'` added to `pond.js`, **all three of pond's recipe steps
still passed**. Not one assertion in any recipe could see it. That is why the check is a separate statement
about the shape of `describe()` rather than something a recipe could have caught.

## A chapter with no questions passed the content check

`tools/check-content.js` required at least three review items per objective, written as:

```js
if (items.length) {
  for (const [id, n] of perObjective) { if (n < 3) fail(...); }
}
```

Guarded on the very thing it checks. A chapter with 35 objectives and no `items.js` skipped the loop and
passed, because zero is not less than three when the loop never runs. Chapters 2 and 3 were both in that
state: written, gated green, and invisible to the spaced-repetition queue. The rule is now keyed on
objectives, not items, and the tree that reported `check: 6 page(s) pass` reports two failures.

## The gates were not visiting the new chapters at all

The page list lived in `tools/lib/browser.js`, again in `tools/subpath.js`, and a third time as links on
the book's contents page. `shot`, `devices`, `inspect` and `subpath` all read the first one. A chapter had
to be added to each by hand, so chapters 2 and 3 existed on disk and no page gate had ever loaded them.
`npm run check` covered them only because it walks the tree itself.

Chapters are now discovered from disk: any `<book>/chNN-<slug>/index.html`. `subpath.js` derives from the
same list. The cost is that a half-written chapter turns the gates red, which is the truth and is the point.

That fix introduces its own way to fail silently, and it is the dangerous one: discovery that quietly
finds nothing leaves `PAGES` holding the library and Today, and every page gate goes green having checked
no chapter. `test/pages.test.js` walks the tree a second time, independently, and requires the two to
agree — and asserts its own walk found something, so it cannot pass by finding nothing twice. Under the
mutation it reports `PAGES is ["/","/today/"]`, which is exactly the silent state it exists to catch.

## The device gate was not in the chain

`npm run devices` was written after the owner found four defects on a real phone. It was runnable and it
was not one of the nine steps `npm test` runs, so it only ran when someone remembered it. It is a step now.
`npm test` runs ten.

## Four figures that pass and are not good enough

`phlab`, `carbonkit`, `polymer` and `foldlab` landed correct, deterministic, and green over 26 new drive
steps. Looked at full size they share one flaw: a panel half empty, and readouts drawn as application
chrome — bordered pills, tinted chips, a progress bar with its caption overlapping the fill. `polymer`
holds two 30 px hexagons in a dead lower-left quadrant. They went back for a design pass.

This is the owner's standing rule doing its job: *"If anything is less than supreme quality then don't even
bother."* The gates cannot produce that and never claim to. Every one of them says so in its own header.

## Still open

Two element-colour tables exist (`src/figures/lib/chem-atoms.js` and `lib/mol-draw.js`), and chapter 3 is
adding two more. Values agree today; nothing proves they will. The repo's one-colour-table invariant covers
`tokens.css` against `palette.js` and says nothing about these. To be reconciled at integration, with a test.

## 2026-09-15 — Nine workers killed mid-edit, and what the tree looked like afterwards

A weekly API rate limit stopped every running worker at once and the host restarted. Nothing survived but the working tree. What a later session should know:

- **A killed worker can leave a red-proof mutation applied.** `harden-sitting` was between applying its mutations and restoring them; both mastery labels in `src/components/mastery.js` read `'牢牢掌握'`. A tree in that state passes `node --check`, and the only thing that finds it is reading `git diff` on every file a dead worker owned before touching anything. Restored by hand from `git show HEAD:`.
- **`SendMessage` cannot reach a subagent across a host restart**, whatever its docs say about resuming from a transcript. Every send returned "No agent named X is reachable". The recovery is a cold respawn whose brief names the last transcript line (it is in the failure notification) and what is already on disk.
- **Two polish workers had finished more than their last words implied.** Both were reported mid-edit; all 45 chapter-2 drive steps passed and six of the eight figures were already at the bar when looked at. Reading the frames before respawning turned two heavy briefs into one small one.
- **The commit at `4c4acb8` was made red.** It contains chapters 2 and 3's prose and all 25 registry entries while 16 of the figure modules did not exist, so the registry unit test fails at HEAD, and HEAD is pushed: the live site serves `biology/ch02-chemistry-of-life/` with eight figures that cannot load, reachable by direct URL only because nothing links to it. Consequence for the next commit: the tree cannot be green until chapter 3 is complete, so chapters 2 and 3 land together rather than one at a time as the owner asked. There is no smaller green commit available without removing chapter 3 from the tree.

## 2026-09-15 — Another session committed this round's tree

The second book's session, briefed by the owner to commit only what it changed, committed `6d854cf` at 21:21 with 105 files: its book and every uncommitted file of this round, including a figure module mid-build, a chapter with no question bank, and two workers' edits mid-verification. It pushed. The content check is red on main as a result and the live site serves chapter 3 without a bank. A later session should know two things from this: a shared working tree offers no protection against another session's `git add`, whatever that session's own plan says, so anything that must not be committed half-done has to live outside the tree (a worktree, or the scratchpad); and a red main is recovered forwards, by finishing, not by rewriting history, which needs the owner.
