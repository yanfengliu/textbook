# 2026-09-23 — the sort and its words

Branch `sort-layout` off `5e9c981`. It finishes a fix another worker started and could not complete: that worker left a flex-wrap stylesheet with its numbers in the comments, and no gate. Every number below was taken again on this branch, in Chromium, rather than copied from those comments.

## The sort gave its choices the row first

**Action:** `tb-sort .tb-sort__item` went from a grid, `minmax(0, 1fr) minmax(0, auto)`, to a wrapping flex line. The name asks for its own width from a floor of 11.5rem to a cap of 21rem, the choices ask for their whole row, and when the two do not fit the choices take a line of their own under the name, as a phone always had them.

**Result:** Grid sized the auto track first, to the choices' whole row. Chapter 5's name track was 0 px wide at 1024 and 1440 px, 358–717 px tall with its words running under the buttons; chapter 4's was 18.8 and 60.4 px; chapter 3's 148.4 and 190 px, 22 to 28 characters a line; chapter 2's 10.8 px in an 800 px window, which none of the gate's three widths reaches. Now chapters 3–5 stack at every width from 320 to 1920 px, and chapters 1 and 2 and the second book draw byte-identical pixels at 1024 and 1440 px in both themes. Below 600 px every sort keeps the grid's exact size at nine widths from 320 to 599 px; 53 of those 72 frames are byte-identical, and the other 19 differ only in the line breaks `text-wrap: pretty` moved (below).

**Reasoning:** The previous worker's numbers held when re-measured: 6.77 px a character over the 2,842 characters of the 24 observations in chapters 3–5, so 21rem is 49.7 characters; the widest short name in either book is 136.8 px; without the floor chapter 2's rows split between the two layouts from 600 to 626 px and from 846 to 896 px; without the phone rule the second book's chapter 1 would go side by side from 413 px and this book's from 508 px. The one claim that had to be corrected was a list of four widths where there are two bands.

**Validation:** A synthetic sort with five long bins and names from one word to a paragraph, built in chapter 5's page at 390, 800, 1024 and 1440 px in both themes, stacked every row, with nothing outside the tray and no name or choice running out of its box. A stacked sort at 1440 px was driven with a real click and a real drag, and both placed their cards.

## A flex wrap decides row by row, so a sort could zigzag

**Action:** `watchRows` in `src/components/sort.js` watches the tray's width and sets `data-stacked` on the sort once any row's choices have gone under its name, and the stylesheet then stacks every row.

**Result:** A synthetic sort of "A mule" and "A crystal of salt growing in brine" beside three short bins set the first row's choices at the right edge and the second's under the name in an 800 px window. With `watchRows` it stacks all four there and sets all four beside at 1024 px. No shipped sort splits at any width, with or without it.

**Reasoning:** CSS cannot make rows agree. Each flex line decides alone; a container query's threshold would have to depend on the words; giving every name the cap's 21rem would stack chapter 2 at every width, because 336 + 25.6 + 443.6 px of choices is wider than its 697.6 px tray. The observer reads width only. A placed card changes the tray's height, and deciding again then would move every remaining row under the reader's hand: placing the two names that forced the stack leaves the other two rows stacked until the width changes.

**Validation:** `npm run shot` fails a sort whose rows split, proved red with a middling name in chapter 2 and `watchRows` commented out (`docs/learning/gate-proofs.md`).

## A wrapped name ended on a one-word line

**Action:** `text-wrap: pretty` on the sort's names, as the check's question and the glossary already have it.

**Result:** Without it, 9 of the 24 names in chapters 3–5 ended on a line holding one word ("through.", "apart.", "vesicle.") at one or more of 320, 390, 1024 and 1440 px, 13 cases in all; 9 of them at 320 and 390 px, where the live site already set them. With it none do, and no name gains a line.

## What the gate measures, and how it stays out of the frame

**Action:** `auditTextBoxes` in `tools/shot.js`. It measures every text box a reader component sets beside a sibling it can lose width to, against its min-content width under normal breaking, and adds a ribbon floor of 15 em for a sort's wrapped names.

**Reasoning:** The longest word is the browser's own line breaker's answer, so a Han line and a Latin one are judged by their own break opportunities. The box itself is taken out of flow (`position: absolute` at `width: min-content`, then `max-content`) and put back in the same evaluation; a clone would run the `connectedCallback` of any custom element inside the box a second time. All the boxes are taken out together, because an absolutely positioned box's intrinsic width depends on nothing but its own content and inherited style; one at a time would force two layouts of the page per box. It costs 1 to 14 ms a load. The ribbon floor sits between what the layout gives a wrapped name (21 em or more) and what the defect gave chapter 3 (9.3 and 11.9 em), and it is the sort's alone, because a check's answers are 13.4 em on a 320 px phone by design.

## Two things a later comparison can trip over

- **An element screenshot of a tall element is not comparable across runs.** Chapter 4's grid-era sort at 1024 px, the same stylesheet served the same way, hashed `673ab67063…` in two runs and `9847f1d411…` in a third. Inside one run, two arms that lay out identically agreed byte for byte every time. The cause was not established; compare arms inside one process.
- **A probe that resizes a page in place and reads at once sees the previous width's `data-stacked` for that one reading**, because the observer runs at the next rendering step: a sweep read chapter 1's switch at 602 px where the stylesheet switches at 600. A reader never sees it, because the observer runs before that frame is painted.

## Found, and left for their owners

- **The second book's character card runs its unbound-sense note out of the card.** `.zj .zj-src .zj-kn { white-space: nowrap }` in `tongjian/zj.css` binds a character to the mark after it, and the card is appended inside that `<tb-char>`, so `.zj-card__note` inherits `nowrap`. At 390 px the note is one 469 px line in a 312 px box, cut at the card's edge, on 3 of chapter 1's 28 cards, 217 of chapter 2's 1291 and 42 of chapter 3's 304. `npm run shot` cannot see a card, because a card needs a press.
- **Five glossary terms print their markup.** `term` in `glossary.js` is set as text by design (`src/components/term.js` escapes it), so `Solute potential (Ψ<sub>s</sub>)` and `Pressure potential (Ψ<sub>p</sub>)` in chapter 4, and `Maximum rate (V<sub>max</sub>)`, `Michaelis constant (K<sub>m</sub>)` and `NAD<sup>+</sup>` in chapter 5, show their tags in the glossary and in their cards.
