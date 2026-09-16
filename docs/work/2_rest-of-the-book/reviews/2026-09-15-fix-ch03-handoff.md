# Handoff — chapter 3 fixes from the 2026-09-11 review

Worker: `fix-ch03`, respawned 2026-09-15 after the outage. It found the previous worker had finished every prose finding and all of `objectives.js`; it audited each edit against the review and against sources rather than trusting the diff, and finished or corrected nine places. Files touched: `biology/ch03-cells/index.html`, `glossary.js`, `objectives.js`. Tree only; nothing committed.

## Per finding

| # | State on arrival | What the second worker did |
|---|---|---|
| 1 motor vs diffusion | done; tightened | Arithmetic checked: 30 µm at 1 µm/s is 30 s; *t* = 900/(2·1000) = 0.45 s, so diffusion wins 70× for oxygen. The rescue uses a vesicle constant of "a few tenths" of µm²/s (40 nm particles measure ≈0.5 µm²/s in HEK293 cytoplasm; larger vesicles slower), giving a crossover *x* = 2*D*/*v* ≈ 0.2–1 µm, so "beyond about a micrometre" holds. §3.6's axon comparison stays consistent (1 m: motor ≈ 12 days, oxygen diffusion ≈ 16 years). *D* is now named where §3.2 defines it; the new paragraph had used *x*²/2*D* before the symbol existed. |
| 2 mitochondrial division | done; verified, tightened | Confirmed: Drp1/Dnm1 in animals and fungi, ADL2b in *Arabidopsis*; FtsZ lost on both branches and retained in diverse protists; *Cyanidioschyzon merolae* uses an inner FtsZ ring with an outer dynamin ring; chloroplast FtsZ1/2 nuclear-encoded and imported. "Only scattered protists" became "some … and a red alga has been caught using both rings at once". `fig-symbiont`'s alt and both objective statements carry no machinery claim. **Seam:** `src/figures/symbiont.js` line 89 still said "using proteins descended from the bacterial division machinery"; sent to `figs-ch03b`. |
| 4 seam with chapter 2 | done; tightened | *hydrophobic* used with Sec61's lateral gate; "almost nothing but hydrophobic" softened, since a signal peptide has a hydrophobic core rather than a wholly hydrophobic length. §3.6's weak-bond clause present. Cellulose cites §2.6 in one clause. The three prerequisites are in and `npm run check` resolves them acyclically. Decided against `organelle-architecture` ← `nucleotide-parts`. Also softened "work at no other" for lysosomal enzymes to "all but idle away from it". |
| 5 osmosis | done | Glossed at first use in §3.3, marked once, glossary entry present. |
| 8 de Duve | done; verified | "at Louvain": lysosome 1955 at the Catholic University of Louvain, Rockefeller from 1962, the Brussels institute 1975. |
| 9 junctions | done; corrected | Three observation-first paragraphs. Swapped the gut for the **bladder**: intestinal tight junctions are leaky by design and the urothelium is the exact case the sort activity uses. Replaced a bridge sentence that called the cells "fastened" one sentence before the text says a tight junction is not a fastening. |
| 10 filament table | done; corrected | Each paragraph opens on what the table cannot hold. Fixed "the other two are each built from a single protein": tubulin is an α/β pair. |
| 17 backwards prerequisite | done | `magnification-resolution` ← `cell-scale`; `abbe-limit` ← both. Checked against prose order. |
| 18 small things | done; rewritten twice | No `tb-term` marked twice (71 refs, 71 entries, none repeated). Antifungal note rewritten: β-glucans are 50–60 % of the wall and chitin 1–10 %; azoles hit Erg11 and echinocandins hit β-1,3-glucan synthase, so the previous version's "not the wall" was itself an overstatement. The note now gives the eukaryote reason and names both real targets. Maternal-line hedge updated for the 2023 finding that human sperm mitochondria carry no intact mtDNA, plus the disputed 2018 cases and their rebuttal. |

## Sources

- Vesicle diffusion: *Life Science Alliance* 2023, 7(1):e202302406.
- Mitochondrial division: Arimura & Tsutsumi, *PNAS* 2002 (ADL2b); Leger et al., *PNAS* 2015 (FtsZ distribution, *C. merolae*); Gilson et al., *Eukaryotic Cell* 2003 (*Dictyostelium*); chloroplast FtsZ, *JCB* 2012, 199(4):623.
- de Duve: Nobel Prize biographical facts; Britannica; Rockefeller University obituary.
- Fungal wall: *Microbiology Spectrum* FUNK-0035-2016; antifungal targets, *npj Antimicrobials and Resistance* 2023.
- Paternal mtDNA: *Nature Genetics* 2023, 55:1505; Luo et al., *PNAS* 2018; rebuttal, *Nature Communications* 2020.

## Verification

- `npm run check`: chapter 3 reports only the missing `items.js`. Chapter 1 now fails on `i-resolution-limits-2` (expect `2e-7`) because `tools/check-content.js` was edited between two runs — the `gate-expects` worker's new rule meeting scientific notation; sent to that worker.
- `inspect` and `shot` could not load the page while `plantcell3d.js` was missing, so a named stand-in probe (`harness:` line naming `inspect`, only the fast-fail relaxed) rendered eight frames at 1440 and 390 px, light theme. One real defect found and fixed: the fungal note broke a line after "β-"; word joiners added (`&#8288;` in prose, `⁠` in two glossary definitions) and the note shortened from 12 phone lines to 10. Dark theme not inspected (no colour or markup changed). Chapter read through before and after.

## Flagged for the coordinator, and what was done with each

- `symbiont.js` line 89 — sent to `figs-ch03b`.
- Chapter 2 has the same "α-" / "β-" line-break hazard — sent to `type-greek-equation` with the question of whether a CSS answer exists that needs no markup.
- §3.5's key idea still listed "division by fission" as evidence — sent back to `fix-ch03` to reword.
- Glossary `cellulose` is the only definition that cites a section — a style choice, left.
