// npm run devices: load every page on a matrix of real emulated devices and check the things that
// break between one screen and another.
//
// Claim: on each device below, every page loads with no console error, page error or failed request;
// the document does not scroll sideways; the header is there and every control in it is fully inside
// the viewport and at least 24 px on its smallest side; on a chapter page the contents drawer is there,
// reachable and operable by the device's own input, closes when a link in it is followed, and is not
// present on screens wide enough to show the rail instead; the drawer has a scrim, locks the page
// behind it, takes focus, and closes on a tap outside; on a chapter page there are glossary terms, and
// nothing that pops up over the text (a glossary definition, a figure's card) hangs off either edge;
// and on a chapter page there is a text column, and its blocks share one left and one right edge.
// Fails naming the device, the page and the measure — and, when a suite finds none of its subject on a
// page that must have it, naming the selector and the page rather than skipping.
//
// Why it exists, and why it is not tools/narrow.js: every other gate here sets a narrow VIEWPORT on a
// desktop browser, which has a mouse, hover, and `pointer: fine`. A phone has touch, no hover and
// `pointer: coarse`, and three defects the owner hit on a real phone were invisible to a 390 px
// desktop window (docs/learning/defect-register.md, 2026-09-10). This gate emulates the device, not
// just its width: touch, user agent, device pixel ratio and all.
//
// Bound: structure and reachability, not beauty. It cannot tell you a layout is ugly, only that a
// control is off screen, too small to hit, overflowing, or unreachable by the input the device has.
// The screenshots in out/devices/ are for the beauty question. The device list is a sample of shapes,
// not of products: it covers small phone, phone, Android phone, phone landscape, tablet portrait,
// tablet landscape, small laptop, desktop and wide desktop — nine — which is where the layout's
// breakpoints actually are. It presses the controls it checks — the contents button, one link in the
// drawer, every glossary term, a tap outside the drawer — and nothing else: no check option, no sort
// control and no figure control, which are tools/flow.js's and tools/drive.js's questions.
// DEVICE_PAGES, DEVICE_ONLY, DEVICE_ENGINES and DEVICE_THEMES trim the run, a trimmed run proves only
// its part, and a value naming nothing stops the run rather than emptying it (tools/lib/trim.js).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { devices as playwrightDevices, chromium, webkit, firefox } from 'playwright';
import { startServer } from './serve.js';
import { WEBGL_ARGS, collectErrors, PAGES, BOOKS } from './lib/browser.js';
import { trim, PAGE_HINT } from './lib/trim.js';

const OUT = 'out/devices';

// Each entry is a shape the layout has to survive. `touch` devices are emulated as phones and tablets
// (touch events, mobile user agent, coarse pointer); the rest are ordinary desktop browsers.
export const DEVICES = [
  { id: 'phone-small', use: { ...playwrightDevices['iPhone SE'] }, kind: 'touch' },
  { id: 'phone', use: { ...playwrightDevices['iPhone 13'] }, kind: 'touch' },
  { id: 'phone-android', use: { ...playwrightDevices['Pixel 7'] }, kind: 'touch' },
  { id: 'phone-landscape', use: { ...playwrightDevices['iPhone 13 landscape'] }, kind: 'touch' },
  { id: 'tablet', use: { ...playwrightDevices['iPad Mini'] }, kind: 'touch' },
  { id: 'tablet-landscape', use: { ...playwrightDevices['iPad Mini landscape'] }, kind: 'touch' },
  { id: 'laptop', use: { viewport: { width: 1024, height: 640 }, deviceScaleFactor: 1 }, kind: 'mouse' },
  { id: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, kind: 'mouse' },
  { id: 'desktop-wide', use: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }, kind: 'mouse' },
];

// Below this the chapter's rail becomes a drawer behind a button; at or above it the rail is shown and
// the button is not. One number, matching the breakpoint in src/styles/layout.css.
const DRAWER_BELOW = 800;

// WCAG 2.2 target size (minimum) is 24 by 24 CSS pixels.
const MIN_TARGET = 24;

// Three engines, not one. Emulating an iPhone in Chromium gives you an iPhone's SIZE and an iPhone's
// INPUT, and Blink's layout — but a real iPhone runs WebKit, and the owner's four defects were found on
// a real phone. So the phone and desktop shapes are re-run on WebKit and Gecko over the two pages that
// between them carry everything this gate checks, while Chromium carries the full device matrix.
// Widening every engine to every device and page would triple a gate that is already the slowest in
// the chain for a thin return: the engines differ in layout and input handling, not in how many screen
// sizes exist.
//
// Firefox cannot emulate a mobile device in Playwright (`isMobile` is unsupported and throws), so its
// phone run is a narrow viewport with touch, and it is the weakest of the three. It is here for layout
// differences, not for input ones, and that is the limit of what it proves.
const ENGINES = [
  { id: 'chromium', launch: () => chromium.launch({ args: WEBGL_ARGS }), full: true },
  { id: 'webkit', launch: () => webkit.launch(), full: false },
  { id: 'firefox', launch: () => firefox.launch(), full: false },
];

// What the two secondary engines run: the shapes either side of the drawer breakpoint, over the library
// and one chapter, which between them carry everything the suites below check — the header, which every
// page has, and the rail, the glossary terms and the text column, which a chapter has. Page ids are
// book-qualified (see `discoverBooks`), so this names one chapter rather than whichever chapter 1
// happens to match first. Today is not here: its study surfaces are `npm run sitting`'s, on Chromium
// only, and nothing below presses them.
const CROSS_DEVICES = ['phone', 'desktop'];
const CROSS_PAGES = ['library', 'biology/ch01'];

// The selectors the suites read, in one place, so a rename fails by name below.
const SEL = { header: '.tb-header', rail: '.tb-rail', toggle: '.tb-navtoggle', scrim: '.tb-scrim', term: 'tb-term button', pop: '.tb-term__pop', main: '.tb-main' };

// What each page must carry, so a suite that finds nothing fails instead of skipping. The header,
// drawer, popover and edge suites were each guarded on their own selector, so a renamed class emptied
// the suite and the load stayed `ok` (review of 2026-09-16, finding 5). The requirement is keyed on the
// page's shape, which is what makes a component required: the shell builds the rail for
// `main[data-chapter]`, and a chapter's recipe puts terms and prose in the text column. The other three
// shapes are stated too, so a page that legitimately lacks a component is on record here rather than
// silently exempt. Every page has the header. A page carrying something this table does not require is
// still checked: the table says what must be there, not what may be.
const EXPECT = {
  chapter: { rail: true, terms: true, column: true },
  book: { rail: false, terms: false, column: false },
  library: { rail: false, terms: false, column: false },
  today: { rail: false, terms: false, column: false },
};
function shapeOf(pageDef) {
  if (pageDef.id === 'library' || pageDef.id === 'today') return pageDef.id;
  return BOOKS.some((b) => b.id === pageDef.id) ? 'book' : 'chapter';
}

// Firefox rejects isMobile; strip it and keep the viewport, touch and scale factor.
function contextFor(engineId, device) {
  const use = { ...device.use };
  if (engineId === 'firefox') delete use.isMobile;
  return use;
}

const themes = trim('DEVICE_THEMES', ['light', 'dark'], { noun: 'theme', unset: ['light'] });
const wanted = trim('DEVICE_ONLY', DEVICES, { idOf: (d) => d.id, noun: 'device' });
const pages = trim('DEVICE_PAGES', PAGES, { idOf: (p) => p.id, noun: 'page', hint: PAGE_HINT });
const engines = trim('DEVICE_ENGINES', ENGINES, { idOf: (e) => e.id, noun: 'engine' });

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = await startServer({ port: 0, quiet: true });
let browser = null;
const problems = [];
const report = [];
let loads = 0;

// Tap on a touch device, click on a mouse one: the point of this gate is to use the input the device
// actually has, because a drawer that opens on click and not on tap is exactly the defect it hunts.
async function press(page, locator, kind) {
  if (kind === 'touch') await locator.tap();
  else await locator.click();
}

try {
  for (const engine of engines) {
    // The full matrix on Chromium; the two shapes either side of the drawer breakpoint on the others.
    const engineDevices = engine.full ? wanted : wanted.filter((d) => CROSS_DEVICES.includes(d.id));
    const enginePages = engine.full ? pages : pages.filter((p) => CROSS_PAGES.includes(p.id));
    if (!engineDevices.length || !enginePages.length) continue;
    browser = await engine.launch();
    try {
    for (const device of engineDevices) {
      for (const theme of themes) {
        const context = await browser.newContext(contextFor(engine.id, device));
        for (const pageDef of enginePages) {
          const where = `${engine.id} ${device.id} ${pageDef.id}${themes.length > 1 ? ` ${theme}` : ''}`;
          const expect = EXPECT[shapeOf(pageDef)];
          const page = await context.newPage();
          page.setDefaultTimeout(120_000);
          const errors = collectErrors(page);
          const found = [];
          // What each suite actually measured, printed on every line so a load that checked nothing
          // cannot read like one that checked everything.
          const counts = { controls: 0, drawer: false, terms: 0, column: false, prose: 0, wide: 0 };
          try {
            await page.goto(`${server.url}${pageDef.path}?theme=${theme}`, { waitUntil: 'load', timeout: 120_000 });
            await page.waitForFunction(() => window.__textbook?.state === 'ready', null, { timeout: 120_000 });
            await page.evaluate(() => document.fonts?.ready);
            await page.waitForTimeout(300);

            const width = page.viewportSize()?.width ?? device.use.viewport?.width ?? 0;

            // --- the document must not scroll sideways ---
            const doc = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
            if (doc.scrollWidth > doc.clientWidth + 1) found.push(`the page scrolls sideways: ${doc.scrollWidth} px of content in a ${doc.clientWidth} px viewport`);

            // --- the header is there, and every control in it inside the viewport and big enough to hit ---
            const header = await page.evaluate(({ sel, min }) => {
              const out = { found: false, controls: [], headerRight: null, headerHeight: null };
              const h = document.querySelector(sel);
              if (!h) return out;
              out.found = true;
              const hr = h.getBoundingClientRect();
              out.headerRight = Math.round(innerWidth - hr.right);
              out.headerHeight = Math.round(hr.height);
              out.headerPadRight = getComputedStyle(h).paddingRight;
              for (const el of h.querySelectorAll('button, a')) {
                const r = el.getBoundingClientRect();
                if (r.width === 0 && r.height === 0) continue;
                out.controls.push({
                  name: (el.className || el.tagName).toString().split(' ')[0],
                  label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24),
                  left: Math.round(r.left), right: Math.round(r.right),
                  top: Math.round(r.top), bottom: Math.round(r.bottom),
                  w: Math.round(r.width), h: Math.round(r.height),
                  small: Math.min(r.width, r.height) < min,
                  offRight: r.right > innerWidth + 0.5, offLeft: r.left < -0.5,
                  offTop: r.top < -0.5,
                });
              }
              return out;
            }, { sel: SEL.header, min: MIN_TARGET });
            counts.controls = header.controls.length;
            if (!header.found) found.push(`nothing matches ${SEL.header}, so the header suite measured nothing on a page that must have a header`);
            else if (!header.controls.length) found.push(`${SEL.header} holds no button or link, so there is no header control to measure`);
            for (const c of header.controls) {
              if (c.offRight) found.push(`the header control "${c.label || c.name}" runs past the right edge: right ${c.right} in a ${width} px viewport`);
              if (c.offLeft) found.push(`the header control "${c.label || c.name}" runs past the left edge: left ${c.left}`);
              if (c.offTop) found.push(`the header control "${c.label || c.name}" is above the top edge: top ${c.top}`);
              if (c.small) found.push(`the header control "${c.label || c.name}" is ${c.w} by ${c.h}, under the ${MIN_TARGET} px minimum target size`);
            }
            // The rightmost control should sit against the header's own right padding, not adrift.
            const rightmost = header.controls.slice().sort((a, b) => b.right - a.right)[0];
            if (rightmost) {
              const gap = width - rightmost.right;
              // It should sit on the header's own right padding and nowhere else. The first version of
              // this check allowed 40 px, and the toggle sat 35 px short on a phone and passed: the
              // breadcrumb that pushes it right is display:none below 800 px, so nothing pinned it and
              // the gap moved with the length of the book's title.
              const pad = Math.round(parseFloat(header.headerPadRight) || 0);
              if (gap > pad + 4) found.push(`the rightmost header control "${rightmost.label || rightmost.name}" sits ${gap} px from the right edge, where the header's own padding is ${pad} px, so it is adrift rather than in the corner`);
            }

            // --- the contents drawer, on a chapter page ---
            const hasRail = await page.locator(SEL.rail).count();
            if (expect.rail && !hasRail) found.push(`nothing matches ${SEL.rail} on this chapter page, so the contents drawer was not checked at all`);
            if (hasRail) {
              counts.drawer = true;
              const toggleVisible = await page.locator(SEL.toggle).isVisible();
              if (width < DRAWER_BELOW && !toggleVisible) {
                found.push(`at ${width} px the contents are a drawer, but its button (${SEL.toggle}) is not visible, so the contents cannot be reached at all`);
              }
              if (width >= DRAWER_BELOW && toggleVisible) {
                found.push(`at ${width} px the rail is shown, so the drawer button should not also be there`);
              }
              if (width < DRAWER_BELOW && toggleVisible) {
                const closed = await page.evaluate((sel) => {
                  const r = document.querySelector(sel.rail).getBoundingClientRect();
                  return { x: Math.round(r.x), w: Math.round(r.width) };
                }, SEL);
                if (closed.x + closed.w > 1) found.push(`the drawer is already on screen before it is opened (x ${closed.x}, width ${closed.w})`);

                await press(page, page.locator(SEL.toggle), device.kind);
                await page.waitForTimeout(650);
                const opened = await page.evaluate((sel) => {
                  const rail = document.querySelector(sel.rail);
                  const r = rail.getBoundingClientRect();
                  const cs = getComputedStyle(rail);
                  // What is actually on top at the drawer's own left edge? If the drawer is behind the
                  // text, a reader taps the article instead of a link and the drawer "does not work".
                  const probe = document.elementFromPoint(Math.max(2, Math.min(r.x + 24, innerWidth - 2)), Math.round(r.y + Math.min(80, r.height / 2)));
                  return {
                    x: Math.round(r.x), w: Math.round(r.width), visibility: cs.visibility, opacity: cs.opacity,
                    expanded: document.querySelector(sel.toggle)?.getAttribute('aria-expanded'),
                    topmost: probe ? `${probe.tagName.toLowerCase()}${probe.className ? `.${String(probe.className).split(' ')[0]}` : ''}` : null,
                    inRail: probe ? Boolean(probe.closest(sel.rail)) : false,
                    links: rail.querySelectorAll('a').length,
                  };
                }, SEL);
                if (opened.x > 1) found.push(`tapping the contents button did not bring the drawer on screen: it is at x ${opened.x}`);
                if (opened.visibility === 'hidden' || opened.opacity === '0') found.push(`the drawer moved on screen but is ${opened.visibility}/${opened.opacity}`);
                if (opened.expanded !== 'true') found.push(`the contents button reports aria-expanded="${opened.expanded}" after being pressed`);
                if (opened.links === 0) found.push('the drawer opened with no links in it');
                if (opened.x <= 1 && !opened.inRail) found.push(`the drawer is on screen but something else is on top of it: a tap at its left edge lands on ${opened.topmost}`);

                // A drawer owes the reader more than opening. These three were all missing, and their
                // absence is what "the sidebar does not work" meant: the reader opens it, changes their
                // mind, taps the article, and nothing happens.
                const dressing = await page.evaluate((sel) => {
                  const scrim = document.querySelector(sel.scrim);
                  const r = scrim && !scrim.hidden ? scrim.getBoundingClientRect() : null;
                  return {
                    scrim: Boolean(r) && Math.round(r.width) >= innerWidth && Math.round(r.height) >= innerHeight,
                    locked: getComputedStyle(document.documentElement).overflow === 'hidden',
                    focusInside: Boolean(document.activeElement?.closest(sel.rail)),
                  };
                }, SEL);
                if (!dressing.scrim) found.push('the drawer opened with nothing over the page behind it, so there is nothing to tap to dismiss it and no sign the page is waiting');
                if (!dressing.locked) found.push('the page behind the open drawer still scrolls, so a swipe meant for the contents moves the article instead');
                if (!dressing.focusInside) found.push('opening the drawer left focus outside it, so a keyboard or screen-reader user is still in the article');

                // Tapping outside must dismiss it. This is the one a reader tries first.
                const outsideX = Math.min(width - 8, Math.round(width * 0.92));
                const outsideY = Math.round(page.viewportSize().height * 0.6);
                if (device.kind === 'touch') await page.touchscreen.tap(outsideX, outsideY);
                else await page.mouse.click(outsideX, outsideY);
                await page.waitForTimeout(650);
                const afterOutside = await page.evaluate((sel) => {
                  const r = document.querySelector(sel.rail).getBoundingClientRect();
                  return { x: Math.round(r.x), w: Math.round(r.width) };
                }, SEL);
                if (afterOutside.x + afterOutside.w > 1) found.push(`tapping outside the drawer did not close it (x ${afterOutside.x}); a reader who changes their mind is stuck with it over the text`);

                // And following a link must close it, go somewhere, and leave the page scrollable.
                await press(page, page.locator(SEL.toggle), device.kind);
                await page.waitForTimeout(650);
                if (opened.links > 0) {
                  const link = page.locator(`${SEL.rail} a`).first();
                  await press(page, link, device.kind);
                  await page.waitForTimeout(650);
                  const closedAgain = await page.evaluate((sel) => {
                    const r = document.querySelector(sel.rail).getBoundingClientRect();
                    return { x: Math.round(r.x), w: Math.round(r.width), hash: location.hash, locked: getComputedStyle(document.documentElement).overflow === 'hidden' };
                  }, SEL);
                  if (closedAgain.x + closedAgain.w > 1) found.push(`following a link left the drawer open over the text (x ${closedAgain.x})`);
                  if (!closedAgain.hash) found.push('following a link in the drawer did not navigate anywhere');
                  if (closedAgain.locked) found.push('the page was left locked after the drawer closed, so nothing scrolls any more');
                }
              }
            }

            // --- anything that pops over the text must stay on screen ---
            const terms = await page.locator(SEL.term).count();
            counts.terms = terms;
            if (expect.terms && !terms) found.push(`nothing matches ${SEL.term} on this chapter page, so no glossary popover was opened`);
            if (terms) {
              // EVERY term, not a sample. The first version checked only the first and the last, and the
              // definition that hung off the left edge belonged to term 15 of 31: a term in the middle
              // of a line is the one the popover cannot be flipped to fit, because it is wider than the
              // space on either side of it. A gate that samples the ends cannot see the middle. Each
              // message names the term by its place and its text, because "the last" was said of every
              // term but the first.
              for (let which = 0; which < terms; which += 1) {
                const t = page.locator(SEL.term).nth(which);
                const text = ((await t.textContent()) || '').trim().slice(0, 24);
                const label = `term ${which + 1} of ${terms} ("${text}")`;
                await t.scrollIntoViewIfNeeded();
                await press(page, t, device.kind);
                await page.waitForTimeout(90);
                const pop = await page.evaluate((sel) => {
                  const p = document.querySelector(sel);
                  if (!p) return null;
                  const r = p.getBoundingClientRect();
                  return {
                    left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
                    overRight: Math.round(r.right - innerWidth), overLeft: Math.round(-r.left),
                  };
                }, SEL.pop);
                if (!pop) {
                  found.push(`tapping glossary ${label} opened no definition (nothing matches ${SEL.pop})`);
                } else {
                  if (pop.overRight > 1) found.push(`a glossary definition hangs ${pop.overRight} px off the right edge (${label}, width ${pop.width} in a ${width} px viewport)`);
                  if (pop.overLeft > 1) found.push(`a glossary definition hangs ${pop.overLeft} px off the left edge (${label})`);
                }
                // Close it before reaching for the next term: an open definition covers the line below it,
                // and the next tap then waits for a target it can never hit.
                await page.keyboard.press('Escape');
              }
            }

            // --- one column, one set of edges ---
            // The blocks of a chapter should line up. They did not: the opener sat outside the text
            // column so its title ran 38 px past the prose, the hero figure's breakout landed 38 px past
            // every other wide figure, and `--measure: 66ch` resolved against each element's own font,
            // so a small-caps label and body prose ended 88 px apart on the same page.
            const cols = await page.evaluate((sel) => {
              const main = document.querySelector(sel);
              if (!main) return null;
              const round = (n) => Math.round(n);
              const prose = [];
              const wide = [];
              const proseSel = '.tb-text > section > p, .tb-text > section > ul, .tb-text > section > h2, .tb-text > section > tb-key, .tb-opener > h1';
              for (const el of main.querySelectorAll(proseSel)) {
                const r = el.getBoundingClientRect();
                if (r.width < 40) continue;
                prose.push({ what: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0] || ''}`, l: round(r.left), r: round(r.right) });
              }
              for (const el of main.querySelectorAll('[data-width="wide"]')) {
                const r = el.getBoundingClientRect();
                if (r.width < 40) continue;
                wide.push({ what: `${el.tagName.toLowerCase()}#${el.id || ''}`, l: round(r.left), r: round(r.right) });
              }
              return { prose, wide };
            }, SEL.main);
            counts.column = Boolean(cols);
            if (expect.column && !cols) found.push(`nothing matches ${SEL.main} on this chapter page, so the text column's edges were not measured`);
            if (cols) {
              counts.prose = cols.prose.length;
              counts.wide = cols.wide.length;
              if (expect.column && cols.prose.length < 2) found.push(`only ${cols.prose.length} prose block(s) inside ${SEL.main} on this chapter page, so there are no edges to compare`);
              for (const [name, group] of [['the text column', cols.prose], ['the wide figures', cols.wide]]) {
                if (group.length < 2) continue;
                const lefts = [...new Set(group.map((g) => g.l))].sort((a, b) => a - b);
                const rights = [...new Set(group.map((g) => g.r))].sort((a, b) => a - b);
                if (lefts.length > 1) found.push(`${name} does not share one left edge: ${lefts.join(', ')} (${group.filter((g) => g.l !== lefts[0]).slice(0, 3).map((g) => `${g.what} at ${g.l}`).join('; ')})`);
                if (rights.length > 1) found.push(`${name} does not share one right edge: ${rights.join(', ')} (${group.filter((g) => g.r !== rights[0]).slice(0, 3).map((g) => `${g.what} at ${g.r}`).join('; ')})`);
              }
            }

            await page.screenshot({ path: `${OUT}/${device.id}-${pageDef.id}-${theme}.png`, fullPage: false });
          } catch (err) {
            found.push(err.message.split('\n')[0]);
          }
          for (const e of errors) found.push(e);
          loads += 1;
          report.push({ engine: engine.id, device: device.id, page: pageDef.id, theme, counts, problems: found });
          for (const p of found) problems.push(`${where}: ${p}`);
          const measured = [
            `${counts.controls} header control(s)`,
            counts.drawer ? 'the drawer' : 'no drawer',
            `${counts.terms} term(s)`,
            counts.column ? `${counts.prose} prose block(s), ${counts.wide} wide` : 'no text column',
          ].join(', ');
          console.log(`${found.length ? 'FAIL' : 'ok  '} ${where}${found.length ? ` (${found.length})` : ''}: ${measured}`);
          for (const p of found) console.log(`  ${p}`);
          await page.close();
        }
        await context.close();
      }
    }
    } finally {
      await browser.close();
      browser = null;
    }
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

// Report what actually ran, not what was configured. `wanted.length` was printed here and it is the
// device list, not the run: a WebKit-only run over two shapes announced "across 9 devices". A gate that
// overstates its own coverage is the same failure as a gate that checks nothing, one step later.
const ran = new Set(report.map((r) => `${r.engine}/${r.device}`));
const engineIds = [...new Set(report.map((r) => r.engine))].join(", ");
const pageCount = new Set(report.map((r) => r.page)).size;
const coverage = `${loads} load(s) over ${ran.size} engine-device pair(s) (${engineIds}) on ${pageCount} page(s)`;
if (problems.length) {
  console.error(`
FAIL: ${problems.length} problem(s) over ${coverage}; see ${OUT}/report.json`);
  process.exit(1);
}
console.log(`
devices: ${coverage}, all clean; screenshots in ${OUT}/`);
