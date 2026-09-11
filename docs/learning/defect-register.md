# Defect register

Every defect the owner reports is recorded here and gated, never only fixed. The entry stays after it becomes a gate: this is the standing list of what the gates could not see, which is where the next defect comes from.

## 2026-09-10 — four defects on a real phone and a desktop, none of which any gate could see

The owner read the published site on a phone and reported, in their words: *"Sidebar on mobile doesn't work"*, *"the light dark toggle is not quite at the top right corner"*, *"the glossary tooltip goes off screen on mobile"*, and, on the desktop version, *"I don't like the inconsistent widths among elements (text, animation, quiz cards, etc)"*. They added the diagnosis that mattered most: *"You need to dynamically check for the phone screen layout."*

**They were right about the cause, and it was one cause.** Every gate here set a narrow **viewport** on a desktop browser. A 390 px Chromium window has a mouse, hover, and `pointer: fine`. A phone has touch, no hover, `pointer: coarse`, a different user agent and a device pixel ratio of 2 or 3. `npm run shot` and `npm run narrow` both looked at 390 px and both passed, because neither was looking at a phone. Three of the four defects lived in that gap, and the fourth lived in a dimension no gate measured at all.

### The four

| Symptom as reported | Root cause | Now checked by |
|---|---|---|
| The sidebar does not work | The drawer opened, but nothing dismissed it except the button that opened it. No scrim, so no target to tap and no sign the page was waiting; tapping the article did nothing; the page behind kept scrolling, so a swipe meant for the contents moved the article; focus stayed in the article. | `npm run devices` opens the drawer with the device's own input and requires a scrim covering the viewport, a locked page behind it, focus inside it, dismissal by a tap outside, and a link that closes it and leaves the page scrollable again. |
| The theme toggle is not quite in the corner | Only the breadcrumb had `flex-grow`, and the breadcrumb is `display: none` below 800 px. So on a phone nothing pushed the right-hand controls right: they packed from the left and the toggle landed wherever the book's title happened to end, 35 px short, moving with the length of the title. | The toggle pins itself with `margin-left: auto`. The gate requires the rightmost header control to sit within 4 px of the header's own right padding; it previously allowed 40 px and passed at 35. |
| The glossary tooltip goes off screen | The popover handled only the right edge, by flipping its anchor to `right: 0` of its term. A term in the middle of a phone line is less than the popover's own width from *both* edges, so the flip pushed it off the **left** instead: 10 px off at term 15 of 31 on a 390 px screen. Flipping cannot fit a box wider than the space on either side of its anchor. | The popover is clamped into the viewport along its own axis, and capped at `calc(100vw - 16px)`. The gate now opens **every** term, not the first and last: the defect was in the middle, and a gate that samples the ends cannot see the middle. |
| Inconsistent widths on desktop | Three causes at once. The chapter opener sits outside `.tb-text`, so its children resolved against the whole grid track and the title ran 38 px past the prose. The hero figure inside it computed its "wide" breakout from that same wider parent and landed 38 px past every other wide figure. And `--measure` was `66ch`, which resolves against **each element's own font**, so a small-caps label in Inter at 12 px and body prose in Newsreader at 19.2 px ended 88 px apart. Five distinct right edges on one page. | The opener is clamped to the measure, and the measure is one fixed length (43.6 rem, which is 66 characters of the body face). The gate requires the text column to share one left and one right edge, and the wide figures to share another. Two edges now, where there were five. |

### What changed about how this is checked

`npm run devices` is new and is the answer to the owner's instruction. It emulates **devices**, not widths: small phone, phone, Android phone, phone landscape, tablet portrait and landscape, small laptop, desktop, and wide desktop, with touch where the device has touch and a mouse where it does not, and it presses controls with the input the device actually has. WebKit and Firefox are installed alongside Chromium, and the three engines were checked by hand during this investigation; the standing gate runs Chromium, and widening it to all three is the obvious next step.

The gate caught a fifth thing on its first full run that nobody had reported: the breadcrumb links were 46 by 17 px, under the WCAG 2.2 minimum target size of 24. That is what a gate is for.

### The lesson underneath all four

Three of these were invisible because the instrument resembled the thing it was standing in for closely enough to be trusted. A 390 px desktop window looks exactly like a phone in a screenshot. It is not one, and the difference is precisely where the defects were. The fourth was invisible because no gate measured alignment at all: every gate asked whether something was broken, and none asked whether the page was *coherent*.
