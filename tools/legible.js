// npm run legible: every figure's own type, measured against the pixels actually behind it, in both
// themes.
//
// Claim: for every registered kind, in both themes, at a 1000x640 viewport, in the figure's opening
// state and after each of its own visible enabled buttons has been pressed once, every glyph the figure
// puts in the DOM clears WCAG 2.x AA against the surface under it — 4.5:1, or 3:1 where the glyph is
// RENDERED at 24 px or more (18.66 px at weight 700 or more). Fails naming the kind, the theme, the
// state, the words, the two colours and the ratio.
//
// Why it exists. `src/palette.js` and `src/figures/lib/cell3-colours.js` hold fills that do not move with
// the theme (`ORGANELLES`, `EXTRA_ORGANELLES`, `BASES`, and every colour derived from them), while `ink`
// and `paper` do: ink is #1d1a17 on a light page and #e9e4da on a dark one. A figure that writes
// `var(--ink)` over a fixed pale fill is therefore right in one theme and unreadable in the other, and
// nothing here could see it. The accents are the same trap from the other side — `--coral` is a mid red
// on a light page and a LIGHT salmon on a dark one, so ink over it fails dark and paper over it fails
// light — and tokens.css says in its own comment that the accents are "tuned for figures, where they sit
// against each other in large areas" and that `--coral-text`, `--water-text` and `--leaf-text` are the
// values for text. A figure that spends the figure accent on type fails the LIGHT theme at 3.07–4.36:1.
// Found by measurement on 2026-09-16 in gradient-battery (a voltmeter on the cytoplasm's fixed cream),
// then in levels, scale, tree, homeostasis and pasteur; `docs/learning/defect-register.md` has the
// entries. Every other gate is blind to it: `npm run shot` asks whether a page threw, `npm run narrow`
// and `npm run sweep3d` judge whether a frame is blank, flat or near-black — which pale type on a pale
// fill passes perfectly — and `npm run drive` presses real controls but runs the light theme only and
// asserts describe(), not pixels.
//
// How it measures. It does not read the source and it does not trust a computed background: a figure's
// text and the shape under it are set far apart, the fill is often a `tint()` of a table value, and a 3D
// figure paints under a light rig. Each state is rendered three times — as it is, with every measured
// glyph transparent, and with every measured glyph forced to magenta. The magenta frame gives per-pixel
// glyph coverage; a mask read off the figure's own frame would be circular, because text the same colour
// as the fill under it changes no pixel and the very defect looked for would read as "this text draws
// nothing". The transparent frame gives the surface under each covered pixel, with every fill, gradient,
// backdrop and halo stroke exactly where the reader sees them. The text colour is the computed `fill`
// (SVG) or `color` (HTML), composited over that surface when it carries alpha.
//
// What WORST CASE means, and why it replaced a dominant surface. Until 2026-09-17 this gate demanded one
// clean colour under a glyph: the commonest 16-level bucket had to hold at least 40% of the glyph's core
// pixels, and a glyph that did not offer one was reported as sitting on "varied ground" and NOT measured.
// A radial gradient never offers one, so a figure that draws its atoms as lit spheres was invisible here.
// Counted on `bondlab` (docs/learning/gate-proofs.md): of 48 `.bl-sym` glyph runs, 44 were skipped as
// varied ground, 4 were measured, ALL FOUR FAILED, and the gate reported one problem for a figure in
// which every O, N and S was below the bar. The skip count was printed on every run and read by nobody.
//
// The transparent frame already holds the actual pixel under every covered pixel, so no surface has to be
// named to judge one. Each core pixel is given its own ratio — the paint, composited over THAT pixel —
// and the glyph's ratio is the order statistic: sort them and take the one at ceil(TOLERATED x n), so
// **the number reported is the ratio that at least 95% of the glyph's core pixels beat**, and at most 5%
// of them are worse — never fewer than one, because the count is rounded up. That 5% is where a hairline
// rule crossing a stem lives, or the one pixel where a halo has thinned to nothing — things a reader
// reads through, and the reason this is a percentile and not the literal extreme pixel. Antialiasing
// cannot fake a failure into it either: an antialiased pixel is a blend of the two surfaces either side
// of an edge, so its ratio lies BETWEEN theirs and can never be worse than the worse one. Every failure
// this reports is therefore a real surface that real pixels of the glyph stand on, thin or not, and the
// line prints what share of them are under the bar so thin and thick can be told apart at a glance.
//
// Two things follow. A label half over a failing fill and half over the paper is now caught, because the
// failing half is 50% of its pixels and the tolerance is 5%. And the 40% rule survives only as a COUNTER:
// `VARIED_SHARE` below decides nothing, it just counts the runs whose ground this gate could not have
// named before, and every summary line prints that count so the class stays visible.
//
// Bound, and what it cannot see.
//   · ONE stage size, 1000x640, the size `npm run drive` uses. Five figures carry a second composition
//     below 800 px and `levels` HIDES its plate notes below a 640 px container, so the narrow layouts are
//     not this gate's subject; `npm run narrow` renders those and judges blankness, not contrast.
//   · The opening state plus ONE press of each visible enabled button, pressed in DOM order and
//     cumulatively. A colour pair a figure paints only after a slider moves, after its drawing is
//     clicked, or after two controls are held together is not reached. Two measured instances live
//     exactly there and are in the register: `scale`'s ruler tick under the moving lens, and the
//     Fluorescence channel of `microscopes`.
//   · Only text in the DOM. A glyph a figure paints into a canvas or through WebGL is invisible to it,
//     which is why `canvas` is counted and printed for every figure: a figure that draws all of its type
//     into one must not read as a clean figure.
//   · The surface is the WORST pixel under the glyph's core (pixels the glyph covers more than half),
//     past the TOLERATED share of them — 5%, so the number reported is the one at least 95% of a glyph's
//     core pixels beat. It is an order statistic and not a colour this gate had to name, which is why a
//     gradient, a texture or a photograph is now in range: see "What WORST CASE means" above. A glyph
//     finer than about two pixels still has no core and is reported as unmeasured rather than as clean.
//   · It judges a colour PAIR. It says nothing about type size, about whether the colour is the right
//     one, about a hover or focus state, or about the frames an animation passes through.
//   · WCAG's LARGE-TEXT bar of 3:1 is applied, and it is much weaker than it looks. A pair at 3.32:1 is
//     a pass at 18.66 px weight 700 and a failure at 18.0 px, so the same colours can be green across a
//     whole figure because of its type sizes. That is what happened: `bondlab` drew every O, N and S on
//     the bare accent — 3.32, 4.33 and 2.26 to one — and this gate reported one failure, the single glyph
//     that rendered at 18.0 px. Each line now prints how many of its glyphs were judged at that bar, so
//     a figure carrying its contrast on font size alone says so on every run.
//   · A DISABLED control's words are not measured, which is WCAG 1.4.3's own exemption and this book's
//     design: `.fig-btn:disabled` dims the whole pill so that unavailable reads as unavailable. So a
//     figure that disables a control it should not have is outside this gate.
//   · A state that will not hold still — the figure's own clock kept running, or a transition would not
//     finish — is reported as NOT measured and named, three tries over. `microscopes`'s two Fluorescence
//     states are that, here. A kind with no measured state at all fails the run: a census that compared
//     nothing must never read as a census that found nothing.
//
// Cost, measured 2026-09-17 on this machine over the whole registry — 66 figure/theme pairs, 33 kinds,
// the other 11 deferred at the time (chapter 4's eight have since been added; not re-measured). Green runs measure 340.7-347.1 s, against 339.7 s for the dominant-surface
// rule this replaced: judging every core pixel instead of one named colour costs about 2%, and buys the
// 98 glyph runs that rule refused to look at. 15,280-15,284 runs compared — the handful of runs of spread
// is `prokaryote` dark, the figure this gate already records as racing its own press-and-measure
// sequence — and no pair over 11.4 s.
//
// It was 24 minutes before the control loop below stopped addressing the toolbar by index, and that is
// the whole difference between this gate and a three-hour one. Six pairs were each sitting out one 180 s
// timeout on a control that had been hidden under them; the loop's comment has the mechanism and the A/B.
// A stale number is worth as much as a stale gate: "1435 s, six pairs at 185" was still being quoted on
// 2026-09-17, a day after the fix that made it 347, because nobody re-ran it.
//
// LEGIBLE_KINDS and LEGIBLE_THEMES trim the run, a trimmed run proves only its part, and a value naming
// no kind or theme stops the run rather than emptying it (tools/lib/trim.js).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { trim } from './lib/trim.js';
import { KINDS } from '../src/figures/registry.js';

const OUT = 'out/legible';
const WIDTH = 1000;
const HEIGHT = 640;
/**
 * The share of a glyph's core pixels that may be worse than the ratio reported for it. The glyph's ratio
 * is the one at ceil(TOLERATED_SHARE x n) once its per-pixel ratios are sorted, so 0.05 means the number
 * reported is beaten by at least 95% of its core pixels, and — because the count is rounded UP — that at
 * least one pixel is always set aside, so no single pixel can fail a label. See "What WORST CASE means"
 * above for why this is a percentile rather than the extreme pixel, and why antialiasing cannot get in.
 */
const TOLERATED_SHARE = 0.05;
/**
 * Not a rule any more: the share the commonest 16-level surface bucket had to reach before 2026-09-17,
 * kept only to COUNT the glyph runs that would have been skipped as "varied ground" and are now measured.
 * Every summary line prints that count, so the class this gate was blind to stays visible on green runs.
 */
const VARIED_SHARE = 0.4;
const THEMES = trim('LEGIBLE_THEMES', ['light', 'dark'], { noun: 'theme' });

/**
 * Figures this gate does NOT visit yet, each with the count it measured on the day it was written and the
 * reason it is deferred. This is not a way to make the gate green: every one of these was measured, the
 * findings are in docs/learning/defect-register.md and in docs/work/2_rest-of-the-book/plan.md, and the
 * list is printed in full on every run, red or green, so that nobody has to go looking for it.
 *
 * The group left is deferred because it belongs to work in flight that this round was told not to
 * touch: the second book has a colour round of its own with its own tokens in tongjian/zj.css. Clearing it
 * is the follow-up, and the moment it is cleared its line comes out of this list. Chapter 4's eight figures
 * were the other group, deferred while another worker was still writing them; they came off on 2026-09-23,
 * when the first run over them found 30 pairs under AA in four figures, all fixed without an `ALLOWED`
 * entry (docs/learning/gate-proofs.md).
 *
 * A name here that is not a registered kind fails the run, so the list cannot outlive its subject.
 */
const DEFERRED = [
  { kinds: ['zj-split', 'zj-timeline', 'zj-words'],
    found: '35 pairs under AA on 2026-09-16, nearly all of them --coral or --water spent as type at 3.07:1 in the light theme',
    why: "the second book sets its own colours in tongjian/zj.css and had a colour round of its own; out/colour2/contrast.mjs is that round's instrument" },
];
const deferred = new Set(DEFERRED.flatMap((d) => d.kinds));
const strays = [...deferred].filter((k) => !KINDS.includes(k));
if (strays.length) {
  console.error(`FAIL: DEFERRED in tools/legible.js names ${strays.length} kind(s) the registry does not have: ${strays.join(', ')}. A deferral that outlived its figure hides nothing and excuses nothing; delete the name, or fix the spelling.`);
  process.exit(2);
}
const wanted = trim('LEGIBLE_KINDS', KINDS, { noun: 'kind' }).filter((k) => !deferred.has(k));

/**
 * Pairs this book has looked at and has NOT yet decided, each with the number it was measured at and the
 * reason it is still here. An entry is not a way to quiet the gate: it names the kind, the theme, the
 * element, the words, and a floor, and it stops applying the moment the ratio drops below that floor —
 * so a pair that gets WORSE fails even though it is listed. Every allowance spent is printed on every
 * run, green ones included, because an exception nobody reads is an exception that never expires.
 *
 * It is EMPTY, and it has been empty twice on 2026-09-17. It filled that morning when the surface rule
 * above stopped demanding a dominant colour and started judging the worst pixel: the first run under the
 * new rule went from 1 problem to 23 over 14 figure/theme pairs, and the twenty-one entries were the
 * handover to the workers who owned those files, not a verdict. Every one of the 23 was real and every
 * one is now fixed in the figure rather than argued away here. What they were, and what answered them:
 *
 *   · EIGHT were `bondlab`'s element symbols on its lit spheres, the class the old rule could not see at
 *     all — `sphere()` laid a 62% white specular over the disc and wrote the symbol in `paper`, so the
 *     pair was legible everywhere except under the highlight, down to 1.87:1 for an N with 96% of its
 *     pixels under the bar. ONE change answered all eight: the specular is masked off the middle of the
 *     disc, so the symbol keeps the element's own colour and the light sits on the rim.
 *   · FOURTEEN were labels straddling two grounds, which the old rule's 40% share let through by naming
 *     the lighter one — a caption over a plate, a note over a lattice's dots, a summary line centred on
 *     a chart's own hairline. They took the halo `scale` and `tree` already use, or moved off the rule.
 *   · ONE, `free-energy`'s "exergonic" at 4.36:1, was a figure accent spent as type and took --leaf-text.
 *
 * The run fails if an entry here is never spent, so the list cannot outlive its subjects, and an entry
 * covers one (kind, theme, element, words): where one label fails on two different grounds the floor is
 * the lower of them and `why` names both.
 */
const ALLOWED = [
];

// ---------------------------------------------------------------- in the page

/** Every text-bearing node inside the stage, with its computed paint and its box relative to the stage. */
function collectText(stageSel) {
  const stage = document.querySelector(stageSel);
  const base = stage.getBoundingClientRect();
  const nodes = [];
  for (const e of document.querySelectorAll('[data-legible]')) e.removeAttribute('data-legible');
  const push = (el, how) => {
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return;
    // A disabled control is exempt, by WCAG 1.4.3's own words ("text that is part of an inactive user
    // interface component ... has no contrast requirement"), and by design: the book's `.fig-btn:disabled`
    // and `.cl-mini:disabled` dim the whole pill so that unavailable reads as unavailable. Measured
    // without this, pasteur's Snap the neck and Tilt flask A reported 2.08:1 in both themes for a button
    // that is greyed out precisely because it cannot be pressed.
    if (el.closest('button:disabled, input:disabled, select:disabled, textarea:disabled, fieldset:disabled, [aria-disabled="true"]')) return;
    const str = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!str) return;
    // The size the reader SEES, not the size the stylesheet names. An SVG figure draws in its own user
    // units and the viewBox scales them, so `font-size: 40px` inside one of levels' thumbnails is six
    // device pixels on the screen; judging WCAG's large-text bar on the declared size called that glyph
    // large and let it through at 1.95:1.
    let scale = 1;
    if (how === 'svg') {
      const m = el.getScreenCTM?.();
      if (m) scale = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
    }
    const px = parseFloat(cs.fontSize) * scale;
    nodes.push({
      i: nodes.length,
      how,
      text: str.length > 44 ? `${str.slice(0, 44)}…` : str,
      paint: how === 'svg' ? cs.fill : cs.color,
      fontSize: px,
      weight: cs.fontWeight,
      // WCAG 2.x: 3:1 for large text (24 px, or 18.66 px at 700 or more), 4.5:1 for everything else.
      bar: (px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700)) ? 3 : 4.5,
      where: `${el.tagName.toLowerCase()}${el.getAttribute('class') ? `.${String(el.getAttribute('class')).trim().split(/\s+/)[0]}` : ''}`,
      rect: { x: r.x - base.x, y: r.y - base.y, w: r.width, h: r.height },
    });
    el.setAttribute('data-legible', String(nodes.length - 1));
  };
  // An SVG <text> owns its glyphs; a <tspan> that sets a fill of its own is measured separately, because
  // a two-colour line is two colour pairs.
  for (const t of stage.querySelectorAll('svg text')) {
    const spans = [...t.querySelectorAll('tspan')];
    const own = spans.filter((s) => s.getAttribute('fill') || (s.getAttribute('class') && getComputedStyle(s).fill !== getComputedStyle(t).fill));
    if (own.length && own.length === spans.length) for (const s of own) push(s, 'svg');
    else push(t, 'svg');
  }
  for (const e of stage.querySelectorAll('*')) {
    if (e.closest('svg')) continue;
    if ([...e.childNodes].some((n) => n.nodeType === 3 && n.data.trim())) push(e, 'html');
  }
  return nodes;
}

/**
 * A figure that is still running gives three frames from three moments, and the measurement then reads
 * one moment's glyphs against another moment's pixels: `prokaryote`'s swimming readout said "run" in one
 * frame and "tumble" in the next, with the cyan flagellum swum across the box between them, and reported
 * 1.06:1 for a word that is plainly legible. So the page's animation frame is stopped and every running
 * animation is finished before the frames are taken — a CSS transition is not driven by the animation
 * frame, and `.cl-mini` transitions its background AND its colour, so a button pressed a moment ago sits
 * between two colours — and the DOM is read again afterwards to prove it held still.
 */
function freezeJs() {
  window.__legibleRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = () => 0;
  for (const a of document.getAnimations()) { try { a.finish(); } catch { /* an infinite one cannot */ } }
}
function thawJs() {
  if (window.__legibleRaf) window.requestAnimationFrame = window.__legibleRaf;
  delete window.__legibleRaf;
}
/** Exactly what the measurement assumes did not move: each measured node's words, paint and box. */
function signature() {
  return [...document.querySelectorAll('[data-legible]')].map((e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    const paint = e.namespaceURI?.includes('svg') ? cs.fill : cs.color;
    return `${e.getAttribute('data-legible')} "${(e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)}" ${paint} ${r.x.toFixed(1)},${r.y.toFixed(1)},${r.width.toFixed(1)}`;
  }).join('\n');
}

/** Contrast of every collected node against the pixels under its glyphs. Runs inside the page. */
async function measureJs([mUrl, bUrl, nodes, tolerated, variedShare]) {
  const load = async (src) => {
    const bmp = await createImageBitmap(await (await fetch(src)).blob());
    const c = document.createElement('canvas');
    c.width = bmp.width;
    c.height = bmp.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    return { ctx, w: bmp.width, h: bmp.height };
  };
  const M = await load(mUrl);
  const B = await load(bUrl);
  const chan = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  const between = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const hex = ([r, g, b]) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
  // One luminance per distinct 8-bit surface colour, for the run. A gradient under a glyph is now judged
  // pixel by pixel rather than collapsed to one colour, so the same handful of colours is asked for
  // thousands of times; without this the whole gate spends its time in `**2.4`.
  const lumCache = new Map();
  const lumOf = (rgb) => {
    const key = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    let v = lumCache.get(key);
    if (v === undefined) { v = lum(rgb); lumCache.set(key, v); }
    return v;
  };
  // Chromium hands a resolved `color-mix()` back as `color(srgb 0.44 0.74 0.78)`, float components and
  // all, and the book's text accents are exactly that. A parser that knew only `rgb()` refused them, so
  // every glyph in `--water-text` or `--coral-text` was skipped as "not an opaque colour" — a hole shaped
  // like the very token this gate tells people to use.
  const parse = (css) => {
    const text = String(css).trim();
    const srgb = text.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)$/i);
    if (srgb) {
      const raw = srgb[4];
      const a = raw === undefined ? 1 : Number(String(raw).replace('%', '')) / (String(raw).endsWith('%') ? 100 : 1);
      const to8 = (v) => Math.round(Math.min(1, Math.max(0, Number(v))) * 255);
      return { rgb: [to8(srgb[1]), to8(srgb[2]), to8(srgb[3])], a };
    }
    const m = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i);
    if (!m) return null;
    const raw = m[4];
    const a = raw === undefined ? 1 : Number(String(raw).replace('%', '')) / (String(raw).endsWith('%') ? 100 : 1);
    return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a };
  };
  const MAG = [255, 0, 255];

  const out = [];
  for (const n of nodes) {
    const x0 = Math.max(0, Math.floor(n.rect.x));
    const y0 = Math.max(0, Math.floor(n.rect.y));
    const w = Math.min(B.w - x0, Math.ceil(n.rect.w) + 1);
    const h = Math.min(B.h - y0, Math.ceil(n.rect.h) + 1);
    const paint = parse(n.paint);
    if (!paint || paint.a === 0) { out.push({ ...n, skip: `its paint is "${n.paint}", which is not an opaque colour` }); continue; }
    if (w <= 0 || h <= 0) { out.push({ ...n, skip: 'its box falls outside the stage frame' }); continue; }
    const bg = B.ctx.getImageData(x0, y0, w, h).data;
    const mk = M.ctx.getImageData(x0, y0, w, h).data;
    const opaque = paint.a === 1;
    const paintLum = opaque ? lumOf(paint.rgb) : 0;
    // Every core pixel gets its own ratio: the paint, composited over THAT pixel. No surface is named, so
    // a gradient, a texture or a photograph is measured like a flat fill. The 16-level histogram survives
    // only to count how varied the ground was — see VARIED_SHARE.
    const core = [];
    const hist = new Map();
    for (let p = 0; p < bg.length; p += 4) {
      let a = 0;
      for (let c = 0; c < 3; c += 1) {
        const span = MAG[c] - bg[p + c];
        if (Math.abs(span) < 24) continue;
        a = Math.max(a, (mk[p + c] - bg[p + c]) / span);
      }
      if (a < 0.6) continue; // the antialiased rim contributes no surface of its own
      const rgb = [bg[p], bg[p + 1], bg[p + 2]];
      const front = opaque ? paintLum : lumOf(paint.rgb.map((v, i) => Math.round(v * paint.a + rgb[i] * (1 - paint.a))));
      core.push({ p, r: between(front, lumOf(rgb)) });
      const key = ((bg[p] >> 4) << 8) | ((bg[p + 1] >> 4) << 4) | (bg[p + 2] >> 4);
      hist.set(key, (hist.get(key) ?? 0) + 1);
    }
    const covered = core.length;
    if (!covered) { out.push({ ...n, skip: 'no pixel of it is more than half covered by a glyph: it is clipped, hidden behind something, or drawn finer than two pixels' }); continue; }
    // The order statistic. `setAside` pixels — the most extreme TOLERATED share — may be worse than the
    // number reported, and that is the whole allowance: a hairline rule crossing a stem, or the pixel
    // where a halo thinned to nothing. The literal extreme would condemn a plainly readable label on one
    // of those; the 95th-percentile-worst does not, and is still a REAL surface rather than a named one.
    core.sort((a, b) => a.r - b.r);
    // Rounded UP, and that is the guard for a short run rather than a second knob: `ceil` sets at least
    // one pixel aside whenever a glyph has more than one, so **a single pixel can never fail a label**.
    // Measured 2026-09-17 with `floor`: `scale` dark's "Human egg" has 15 core pixels, one of them under
    // the bar, and it failed at 4.14:1 on the strength of that one pixel while the rest of the glyph sat
    // at up to 11.70:1. Nothing else in the registry moved — the next thinnest finding, `levels` light's
    // "8 electrons", is 6 pixels of 119, which is the 5% boundary itself; every finding carrying real
    // weight (9% to 96% of its core pixels under the bar) fails under either rounding.
    const setAside = Math.min(Math.ceil(tolerated * covered), covered - 1);
    const pick = core[Math.max(0, setAside)];
    const surface = [bg[pick.p], bg[pick.p + 1], bg[pick.p + 2]];
    let underBar = 0;
    for (const c of core) { if (c.r < n.bar) underBar += 1; else break; }
    const dominant = Math.max(...hist.values()) / covered;
    out.push({
      ...n,
      corePx: covered,
      setAside,
      paintHex: hex(paint.rgb),
      surfaceHex: hex(surface),
      ratio: pick.r,
      // The worst surface, quantised 8 levels to the channel, for the per-figure report's key only. The
      // exact byte cannot be the key — on a gradient it moves a little in every state, and one defect
      // would print fifteen near-identical lines — but dropping the surface entirely is worse: measured
      // 2026-09-17 with the three literal-coral oxygens back in `bondlab`, a paint-only key collapsed the
      // FLAT coral disc at 3.32:1 into the LIT coral sphere at 1.78:1 and printed one line for two
      // different grounds, so a reader fixing the sphere would never have heard about the disc. The cost
      // of quantising is a boundary flip: two surfaces a byte apart can land either side of a step and
      // print two lines for one defect (`bl-symdark` "H" at 2.14 on #9c9da0 and 2.15 on #9b9d9f, the left
      // and right atom of the same bench). An extra line is the cheap failure here; a hidden defect is not.
      surfaceKey: `${surface[0] >> 5},${surface[1] >> 5},${surface[2] >> 5}`,
      best: core[covered - 1].r,
      underShare: underBar / covered,
      surfaces: hist.size,
      // True where the old rule would have refused to name a surface and skipped the run outright.
      varied: dominant < variedShare,
    });
  }
  return out;
}

// ---------------------------------------------------------------- the run

// How many times a state had to be measured again because the figure moved between the two frames. It is
// printed per figure on every line, clean ones included: `AGENTS.md` says nothing advances on its own
// while `ctx.pinnedTime` is set, and this gate loads the lab with `&t=0`, so a retry that fires is either
// a broken invariant in that figure or a transition this tool failed to finish — and either way it is a
// thing to look at rather than a thing to absorb. A count that stays at zero is the evidence for deleting
// the retry.
let retried = 0;
/** Three frames, one measurement, and the proof that the figure held still between them. */
async function census(page, stageSel, state, dumpDir, attempt = 0) {
  const stage = page.locator(stageSel);
  const asIs = await stage.screenshot({ type: 'png' });
  await page.evaluate(freezeJs);
  const nodes = await page.evaluate(collectText, stageSel);
  if (!nodes.length) { await page.evaluate(thawJs); return { rows: [], nodes: 0 }; }
  const before = await page.evaluate(signature);
  // The element's OWN inline paint is saved before the first repaint and written back exactly, because
  // several figures set one — `phlab` draws its pH readouts with `style="fill:var(--ink)"`. Removing the
  // property instead of restoring it left those texts with no fill at all, so they computed to the
  // initial value, black, and this gate reported a 1.27:1 readout that the frame beside it shows in the
  // ink. A measurement that damages its subject measures the damage.
  const repaint = (colour) => page.evaluate((c) => {
    for (const e of document.querySelectorAll('[data-legible]')) {
      const prop = e.namespaceURI?.includes('svg') ? 'fill' : 'color';
      if (e.dataset.legibleWas === undefined) {
        e.dataset.legibleWas = e.style.getPropertyValue(prop);
        e.dataset.legibleWasPriority = e.style.getPropertyPriority(prop);
      }
      e.style.setProperty(prop, c, 'important');
    }
  }, colour);
  const restore = () => page.evaluate(() => {
    for (const e of document.querySelectorAll('[data-legible]')) {
      const prop = e.namespaceURI?.includes('svg') ? 'fill' : 'color';
      e.style.removeProperty(prop);
      if (e.dataset.legibleWas) e.style.setProperty(prop, e.dataset.legibleWas, e.dataset.legibleWasPriority || '');
      delete e.dataset.legibleWas;
      delete e.dataset.legibleWasPriority;
    }
  });
  // Every repaint is finished before its frame is taken, and the restore is finished before the page is
  // read back. Several figures transition `fill`, so without this the two frames are caught partway
  // through this gate's OWN repaint — `bondlab`'s symbols came back as `rgba(230, 13, 228, 0.773)`,
  // three-quarters of the way to the magenta — and every state of that figure was thrown away as one
  // that would not hold still.
  const finish = () => page.evaluate(() => {
    for (const a of document.getAnimations()) { try { a.finish(); } catch { /* an infinite one cannot */ } }
  });
  await repaint('transparent');
  await finish();
  const bare = await stage.screenshot({ type: 'png' });
  await repaint('#ff00ff');
  await finish();
  const mask = await stage.screenshot({ type: 'png' });
  await restore();
  await finish();
  const after = await page.evaluate(signature);
  await page.evaluate(thawJs);
  if (after !== before) {
    if (attempt < 2) {
      retried += 1;
      return census(page, stageSel, state, dumpDir, attempt + 1);
    }
    const a = before.split('\n');
    const b = after.split('\n');
    const moved = a.map((line, i) => (line === b[i] ? null : `${line}  ->  ${b[i] ?? '(gone)'}`)).filter(Boolean).slice(0, 2);
    return { rows: [], nodes: nodes.length, unmeasured: `${state}: the figure would not hold still for three tries, so nothing here was measured — ${moved.join(' ; ')}. What would satisfy this: a figure whose drawing stops when its animation frame does.` };
  }
  const rows = await page.evaluate(measureJs, [
    `data:image/png;base64,${mask.toString('base64')}`,
    `data:image/png;base64,${bare.toString('base64')}`,
    nodes, TOLERATED_SHARE, VARIED_SHARE,
  ]);
  const out = rows.map((r) => ({ ...r, state }));
  if (out.some((r) => !r.skip && r.ratio < r.bar)) {
    const safe = state.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
    writeFileSync(`${dumpDir}/${safe}-as-is.png`, asIs);
    writeFileSync(`${dumpDir}/${safe}-surface.png`, bare);
  }
  return { rows: out, nodes: nodes.length, signature: before };
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const problems = [];
const spent = [];
const report = [];
let compared = 0;

try {
  for (const kind of wanted) {
    for (const theme of THEMES) {
      const where = `${kind} ${theme}`;
      const dumpDir = `${OUT}/${kind}-${theme}`;
      mkdirSync(dumpDir, { recursive: true });
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
      page.setDefaultTimeout(ACTION_TIMEOUT_MS);
      const errors = collectErrors(page);
      const id = `lab-${kind}`;
      const started = Date.now();
      const rows = [];
      const unmeasured = [];
      const seen = new Set();
      let states = 0;
      retried = 0;
      let repeats = 0;
      let canvases = 0;
      try {
        const figures = await openPage(page, `${server.url}/lab/?kind=${kind}&theme=${theme}&eager=1&t=0&width=wide`);
        if (figures[id]?.state !== 'ready') throw new Error(`the figure is in state "${figures[id]?.state}"${figures[id]?.error ? `: ${figures[id].error}` : ''}`);
        const stageSel = `#${id} .tb-figure__stage`;
        canvases = await page.evaluate((s) => document.querySelectorAll(`${s} canvas`).length, stageSel);
        const stage = page.locator(stageSel);
        const take = async (tag) => {
          const got = await census(page, stageSel, tag, dumpDir);
          states += 1;
          if (got.unmeasured) { unmeasured.push(got.unmeasured); return; }
          if (got.signature !== undefined) {
            // A state that draws the same words in the same colours in the same places as one already
            // measured is the same state. Skipping it is what keeps a figure with fourteen buttons
            // affordable; it is counted and printed, so a run that measured one state is not read as a
            // run that measured fifteen.
            if (seen.has(got.signature)) { repeats += 1; return; }
            seen.add(got.signature);
          }
          rows.push(...got.rows);
        };
        await take('open');
        // The figure's own controls, once each and cumulatively. Two of levels' three live defects are on
        // its plate at levels 2 and 6, which only a press reaches.
        //
        // The toolbar is READ AGAIN before every press, and a control is addressed by an element handle
        // rather than by its index, because a figure's controls can DISAPPEAR under the loop. Measured
        // 2026-09-16 by the worker timing the chain: six figure/theme pairs at 184.8-187.0 s, all within
        // 2.2 s of each other, which is a timeout signature and not work, while the other 66 were under
        // 10 s.
        //
        // What it actually is, counted 2026-09-17 rather than assumed (out/legib/visible-count.mjs). It
        // is NOT a rebuilt toolbar: `polymer` builds its buttons once and only edits their words. It is
        // one control being HIDDEN. `polymer` shows 9 buttons at open and `src/figures/polymer.js:450`
        // sets `btnForm.style.display = family === 'sugar' ? '' : 'none'`, so pressing "Two amino acids"
        // leaves 8 and index 8 - the last one a list counted at open would hold - matches nothing.
        // `secretion` shows 11 and drops to 5 on "Pulse-chase", six indices stale at once. A locator that
        // matches nothing does not fail: `isEnabled()` WAITS for it, and with no timeout of its own it
        // waits `ACTION_TIMEOUT_MS` from tools/lib/browser.js - 180 s - before `.catch()` turns it into a
        // shrug. One stale index, one 180 s wait, 185 s for the pair, every run.
        //
        // Proved by A/B on 2026-09-17, this loop against the index loop it replaced, same tree, same
        // figures: polymer light 5.2 s against 185.0 s, polymer dark 5.2 against 185.2, secretion light
        // 8.1 against 186.6, secretion dark 8.0 against 186.2 - and polymer reports its 9 states either
        // way, which is why the cost never looked like missing work. Bounding the timeout alone would
        // have hidden the defect rather than fixed it - a control that exists answers in milliseconds -
        // so the addressing is what changed, and the timeout came down to 1 s as well.
        const pressedNames = new Set();
        for (let round = 0; round < 60; round += 1) {
          const handles = await stage.locator('button:visible').elementHandles();
          let next = null;
          for (const handle of handles) {
            const name = (await handle.evaluate((e) => `${(e.textContent || '').replace(/\s+/g, ' ').trim()}|${e.getAttribute('aria-label') || ''}`)).slice(0, 40);
            if (next || pressedNames.has(name)) { await handle.dispose(); continue; }
            if (!(await handle.isEnabled({ timeout: 1000 }).catch(() => false))) {
              pressedNames.add(name); // disabled here and now: not a control this pass can drive
              await handle.dispose();
              continue;
            }
            next = { handle, name };
          }
          if (!next) break;
          pressedNames.add(next.name);
          let clicked = true;
          try {
            await next.handle.click({ timeout: 5000 });
          } catch {
            clicked = false; // it moved or vanished under the press; the next round re-reads the toolbar
          }
          await next.handle.dispose();
          if (!clicked) continue;
          // The pointer goes to the corner because [aria-pressed="true"]:hover is a third background, and
          // a gate that measured it would be judging a state a keyboard reader never sees.
          await page.mouse.move(2, 2);
          await page.waitForTimeout(250);
          await take(`after pressing "${next.name.replace(/\|$/, '')}"`);
        }
      } catch (err) {
        problems.push(`${where}: ${err.message}`);
      }
      for (const e of errors) problems.push(`${where} page error: ${e}`);

      const judged = rows.filter((r) => !r.skip);
      compared += judged.length;
      // One line per (words, paint, surface): a figure driven through fifteen states repeats the same
      // axis label fifteen times, and a report that lists it fifteen times buries what is new.
      const worst = new Map();
      for (const r of judged) {
        // JSON, not a separator: a NUL joined into a key is a literal control byte in this file, and a file
        // holding one reads as binary to the repository's own edit tool (test/control-chars.test.js).
        // The surface enters the key quantised, not as a byte; see `surfaceKey` above for the measurement.
        const key = JSON.stringify([r.where, r.text, r.paintHex, r.surfaceKey]);
        if (!worst.has(key) || worst.get(key).ratio > r.ratio) worst.set(key, r);
      }
      const bad = [...worst.values()].filter((r) => r.ratio < r.bar).sort((a, b) => a.ratio - b.ratio);
      let excused = 0;
      for (const r of bad) {
        const excuse = ALLOWED.find((a) => a.kind === kind && a.theme === theme && a.where === r.where && r.text === a.text && r.ratio >= a.floor);
        if (excuse) {
          spent.push(`${where}: "${r.text}" in ${r.where} is ${r.ratio.toFixed(2)}:1, allowed above ${excuse.floor} — ${excuse.why}`);
          excused += 1;
          continue;
        }
        problems.push(`${where}: "${r.text}" is ${r.ratio.toFixed(2)}:1 — ${r.paintHex} on ${r.surfaceHex} — and it is drawn at ${r.fontSize.toFixed(1)} px weight ${r.weight}, so it needs ${r.bar}:1. That is the worst surface under it once the ${(TOLERATED_SHARE * 100).toFixed(0)}% most extreme of its ${r.corePx} core pixels are set aside (${r.setAside} of them); ${(r.underShare * 100).toFixed(0)}% of those pixels are under the bar and the best of them is ${r.best.toFixed(2)}:1${r.varied ? ', and its ground is varied enough that this gate could not have measured it at all before 2026-09-17' : ''}. Its element is ${r.where}, ${r.state}. A reader in the ${theme} theme cannot read it. What would satisfy this: a fill that follows the theme (mix it towards the paper with tint(), so it moves when --paper moves), or one of the book's text accents (--coral-text, --water-text, --leaf-text) in place of the figure accent, rather than a colour invented here or a light-theme ink written out as a hex.`);
      }
      // A kind whose text could not be measured at all must not read as a kind with no problem.
      if (judged.length === 0 && rows.length + unmeasured.length > 0) {
        problems.push(`${where}: ${rows.length} text node(s) were found and NONE of them could be measured${unmeasured.length ? `, and ${unmeasured.length} state(s) would not hold still` : ''}. A census that compared nothing must not read as a census that found nothing. What would satisfy this: a figure whose type is in the DOM and whose drawing stops when its animation frame does.`);
      }
      for (const u of unmeasured) console.log(`     -- ${where}: ${u}`);
      // Why a glyph was NOT compared, counted by reason and printed on every line, clean ones included. A
      // skip is a hole in the census, and the reason matters: "the ground is varied" is this gate's stated
      // bound, while "not an opaque colour" once meant the parser could not read `color(srgb …)` and every
      // glyph in the book's own text accents was silently dropped.
      const why = new Map();
      for (const r of rows) {
        if (!r.skip) continue;
        const reason = r.skip.replace(/ — .*/, '').replace(/:.*/, '').slice(0, 40);
        why.set(reason, (why.get(reason) ?? 0) + 1);
      }
      const skipped = [...why].map(([k, v]) => `${v} ${k}`).join('; ');
      // Glyphs judged against WCAG's LARGE-TEXT bar of 3:1 rather than 4.5:1, printed on every line. A
      // large glyph is compared, not skipped, so this is not a hole in the census — but it is a much
      // weaker claim, and one worth seeing without going looking. Measured 2026-09-17: `bondlab` drew
      // every O, N and S symbol on the bare accent at 3.32, 4.33 and 2.26 to one, and this gate was green
      // on all but one of them, because `.bl-sym` is weight 700 and nearly every one of those glyphs
      // renders at 18.66 px or more. The one that failed was drawn at 18.0 px. So the figure's colours
      // were wrong the whole way along and the gate was reading a font size — green for a reason with
      // nothing to do with its subject, and indistinguishable from green because the subject is sound.
      // A line that says "31 of 42 judged at the large-text bar" is what makes that visible next time.
      const large = judged.filter((r) => r.bar === 3).length;
      const largeNote = large ? `, ${large} of ${judged.length} at the large-text bar` : '';
      // Glyph runs on ground the OLD rule could not name — a gradient, a texture, a label straddling two
      // fills — printed on every line for the same reason the large-text count is. Until 2026-09-17 each
      // of these was a skip, and 44 of `bondlab`'s 48 element symbols were in here while the gate reported
      // one problem. The number is now a count of what is covered rather than of what is missing, and a
      // figure whose subject is drawn on a gradient says so on every run either way.
      const varied = judged.filter((r) => r.varied).length;
      const variedNote = varied ? `, ${varied} on varied ground` : '';
      report.push({ kind, theme, states, repeats, retried, canvases, compared: judged.length, large, varied, skipped: [...why].map(([k, v]) => ({ reason: k, n: v })), unmeasured, bad: bad.map((r) => ({ where: r.where, text: r.text, paintHex: r.paintHex, surfaceHex: r.surfaceHex, ratio: r.ratio, best: r.best, underShare: r.underShare, corePx: r.corePx, varied: r.varied, bar: r.bar, state: r.state })) });
      console.log(`${bad.length > excused ? 'FAIL' : 'ok  '} ${where}: ${states} state(s) (${repeats} repeated, ${unmeasured.length} unmeasurable), ${judged.length} glyph run(s) compared${largeNote}${variedNote}, ${rows.length - judged.length} skipped${skipped ? ` (${skipped})` : ''}, ${retried} re-measured, ${canvases} canvas(es), ${bad.length - excused} under bar${excused ? `, ${excused} allowed` : ''} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

writeFileSync(`${OUT}/report.json`, JSON.stringify({ allowed: ALLOWED, spent, deferred: DEFERRED, figures: report }, null, 1));
// The deferrals, printed on every run. A gate that quietly does not visit eleven of its subjects reads
// exactly like a gate that visited them and found nothing.
for (const d of DEFERRED) {
  console.log(`
NOT VISITED: ${d.kinds.join(', ')} — ${d.why}. Measured anyway: ${d.found}.`);
}
// Printed on a green run as well as a red one. An allowance nobody reads is an allowance that never
// expires, and every entry in ALLOWED is a decision somebody still owes.
if (spent.length) {
  console.log(`
${spent.length} allowance(s) spent from ALLOWED in tools/legible.js:`);
  for (const s of spent) console.log(`  ${s}`);
}
// Only on a FULL run. A trimmed run proves only its part, so an allowance for a kind it did not visit is
// not an allowance that lost its subject.
const trimmed = Boolean(process.env.LEGIBLE_KINDS || process.env.LEGIBLE_THEMES);
const unspent = trimmed ? [] : ALLOWED.filter((a) => !spent.some((s) => s.startsWith(`${a.kind} ${a.theme}: "${a.text}"`)));
if (unspent.length) {
  console.error(`FAIL: ${unspent.length} entr(y/ies) in ALLOWED were never spent, so each one now excuses nothing and hides whatever takes its place:`);
  for (const a of unspent) console.error(`  ${a.kind} ${a.theme} ${a.where} "${a.text}" above ${a.floor} — ${a.why}`);
  console.error('  Delete each one, or find out why the pair it names is no longer measured. An exception that outlives its subject is how a gate quietly stops covering something.');
  process.exit(1);
}
if (problems.length) {
  console.error(`FAIL: ${problems.length} problem(s); the frames that failed are in ${OUT}/`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`legible: ${compared} glyph run(s) compared over ${report.length} figure/theme pairs at ${WIDTH}x${HEIGHT}; frames in ${OUT}/`);
