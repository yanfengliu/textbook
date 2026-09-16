# Handoff — chapter 2 fixes from the 2026-09-11 review

Worker: `fix-ch02`, respawned 2026-09-15 after the outage, finishing a previous worker's partial edits. Tree only; nothing committed. Files edited: `biology/ch02-chemistry-of-life/index.html` (six edits inside passages the previous worker had already rewritten). Verified and left as found: `glossary.js`, `objectives.js`, chapter 1's next-chapter card, `tools/pages-exclude.txt`.

## Per finding

| # | State on arrival | What the second worker did |
|---|---|---|
| 7 | Done: hydrogen ions sit at the right-hand end of the line, so adding them drives the reaction leftwards | Kept |
| 6 | Done: §2.8 and a summary bullet teach strandedness | Trimmed one clause. RNA "is discarded when the job is done" is true of messenger RNA and false of ribosomal and transfer RNA. Now "folds back on itself wherever it needs a shape". |
| 12 | Done: key idea and summary bullet | Kept verbatim; the items are aligned to it |
| 11 | Done | Kept verbatim; the items are aligned to it |
| 16 | Done: table cell reworded, `<tb-term ref="organic">` in §2.5, Wöhler margin note, glossary entry | Rewrote the margin note. "An unambiguously mineral salt" asserts exactly what historians dispute about Wöhler's cyanate, and "by the middle of the century nobody was defending the vital force" is wrong (Liebig, for one). Now "an inorganic salt", and the force "gave way over the following forty years, as one carbon compound after another was made without an organism's help" (Kolbe 1845, Berthelot 1850s–60s). |
| 14 | Done: Figure 2.7 cited at the end of §2.6's condensation paragraph | Kept |
| 17 | Done: `denaturation` ← `ph-scale`; "structural isomers" in prose and glossary | Kept |
| 9 | Done: two paragraphs organised by backbone bonds and side-chain bonds | One correction. "For most proteins the tertiary structure is the finished article" is unsupported; about half of proteins are oligomers. Now "a protein of a single chain is finished there. A great many proteins are more than one chain." Consistent with the items, which call quaternary the one optional level. |
| 15 | Done: the pairing paragraph rewritten as the archive argument, plus a key idea | Key idea and summary bullet counted "two hydrogen bonds to a rung" where G–C has three; fixed both. Rendered, the key ran to six lines of display type against two or three for every other key in the chapter, so cut to the claim alone: "An archive has to be permanent and openable at once. Only a rung of weak bonds can be both: nothing alone, a lifetime's hold by the million." The bullet keeps the full version. |
| 13 | Replaced with rat liver and muscle numbers | Verified against the source and kept verbatim |
| 3 | Done: `../ch03-cells/`, no "In preparation"; chapter 1's card too | Kept |
| 18 | Done: epigraph carries work and year; "matter" corrected to "mater" | Verified and kept. Inline `style` on the equation left for the designer; spec below. |

The three passages the item author had realigned to (the CO₂ sentence, the buffers key idea, the denaturation paragraph) are unchanged. No items need re-checking.

## Sources

- Finding 13: Ritchie KP, Keller BM, Syed KM, Lepock JR. "Hyperthermia (heat shock)-induced protein denaturation in liver, muscle and lens tissue as determined by differential scanning calorimetry." *Int J Hyperthermia* 1994;10(5):605–618, PMID 7806918. Abstract, verbatim: "Onset temperatures of denaturation (Tl) for rat liver, muscle, and lens are about 38, 39 and 48 degrees C … The values of Tl for the same tissue from the different animals correlates well with body temperature (rabbit 39.4, rat 38.2, and trout grown at 11 degrees C)". Every number and the rabbit comparison in the prose are exactly this. The remaining hedge about fever rests on the paper's "significant protein denaturation occurs in liver and muscle during mild hyperthermia (40–45 °C)"; the review's caution that fever danger is not mainly bulk denaturation stands, and the sentence does not claim otherwise.
- Epigraph: Szent-Györgyi A. "Biology and pathology of water." *Perspect Biol Med* 1971;14(2):239–249, PMID 5546252. "Water is life's mater and matrix, mother and medium" is the original wording.
- Finding 16: Ramberg, "Myth #7: That Friedrich Wöhler's synthesis of urea in 1828 destroyed vitalism and gave rise to organic chemistry" (2015).
- Finding 9: Seq2Symm, *Nat Commun* 2025, on the fraction of homo-oligomers.

## Verification

- `npm run check`: `ok biology/ch02-chemistry-of-life/index.html (8 figures, 53 glossary entries, 35 objectives, 105 items)`. Chapter 3 fails only for lacking `items.js`.
- `SHOT_PAGES=ch02 npm run shot`: six loads clean, eight figures ready each.
- `tools/inspect.js ch02` at the epigraph, the Wöhler note, both §2.7 paragraphs, the denaturation paragraph, the §2.8 paragraph and key, desktop and phone, looked at native size. The attribution sits on one line at desktop and wraps cleanly on a phone; the note fits its margin.
- Read the chapter through as a reader.

## Spec for the displayed equation, for whoever owns `components.css`

`.tb-equation` or similar: centred within the measure; lining figures, since an equation is table-like; `margin-block` of one baseline unit above and below from the `--space-*` scale rather than the paragraph default; `text-indent: 0`; `white-space: nowrap` with `overflow-x: auto` so a long equation scrolls in its own box on a phone instead of tripping the overflow gate; sub- and superscripts on a fixed shift so the line box does not grow. One equation in the book uses it today. Dispatched to `type-greek-equation`, 2026-09-15.

## Still weak, outside this worker's files

- `biology/index.html` lists chapters 2 and 3 as "In preparation", unlinked. A reader who finishes chapter 1 can now reach chapter 2, but the contents page still denies it exists. Held for the commit that lands both chapters.
- In §2.7, the α in "α-helix" and β in "β-pleated sheet" set in a fallback face: Newsreader has no Greek. Dispatched to `type-greek-equation`, 2026-09-15.
- The section opening on a quotation, and section titles as nouns (finding 18): left as out of brief.
