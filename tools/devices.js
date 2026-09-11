// npm run devices: load every page on a matrix of real emulated devices and check the things that
// break between one screen and another.
//
// Claim: on each device below, every page loads with no console error, page error or failed request;
// the document does not scroll sideways; every control in the header is fully inside the viewport and
// at least 24 px on its smallest side; the chapter's contents drawer is reachable and operable by the
// device's own input, closes when a link in it is followed, and is not present on screens wide enough
// to show the rail instead; and nothing that pops up over the text (a glossary definition, a figure's
// card) hangs off either edge; the drawer has a scrim, locks the page behind it, takes focus, and
// closes on a tap outside; and the blocks of a chapter share one left and one right edge.
// Fails naming the device, the page and the measure.
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
// not of products: it covers small phone, phone, large phone, tablet portrait, tablet landscape,
// small laptop and desktop, which is where the layout's breakpoints actually are.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { devices as playwrightDevices, chromium } from 'playwright';
import { startServer } from './serve.js';
import { WEBGL_ARGS, collectErrors, PAGES } from './lib/browser.js';

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

const themes = process.env.DEVICE_THEMES ? process.env.DEVICE_THEMES.split(',') : ['light'];
const only = process.env.DEVICE_ONLY ? process.env.DEVICE_ONLY.split(',') : null;
const wanted = only ? DEVICES.filter((d) => only.includes(d.id)) : DEVICES;
const pages = process.env.DEVICE_PAGES ? PAGES.filter((p) => process.env.DEVICE_PAGES.split(',').includes(p.id)) : PAGES;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = await startServer({ port: 0, quiet: true });
const browser = await chromium.launch({ args: WEBGL_ARGS });
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
  for (const device of wanted) {
    for (const theme of themes) {
      const context = await browser.newContext({ ...device.use });
      for (const pageDef of pages) {
        const where = `${device.id} ${pageDef.id}${themes.length > 1 ? ` ${theme}` : ''}`;
        const page = await context.newPage();
        page.setDefaultTimeout(120_000);
        const errors = collectErrors(page);
        const found = [];
        try {
          await page.goto(`${server.url}${pageDef.path}?theme=${theme}`, { waitUntil: 'load', timeout: 120_000 });
          await page.waitForFunction(() => window.__textbook?.state === 'ready', null, { timeout: 120_000 });
          await page.evaluate(() => document.fonts?.ready);
          await page.waitForTimeout(300);

          const width = page.viewportSize()?.width ?? device.use.viewport?.width ?? 0;

          // --- the document must not scroll sideways ---
          const doc = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
          if (doc.scrollWidth > doc.clientWidth + 1) found.push(`the page scrolls sideways: ${doc.scrollWidth} px of content in a ${doc.clientWidth} px viewport`);

          // --- every header control inside the viewport, and big enough to hit ---
          const header = await page.evaluate((min) => {
            const out = { controls: [], headerRight: null, headerHeight: null };
            const h = document.querySelector('.tb-header');
            if (!h) return out;
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
          }, MIN_TARGET);
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
          const hasRail = await page.locator('.tb-rail').count();
          if (hasRail) {
            const toggleVisible = await page.locator('.tb-navtoggle').isVisible();
            if (width < DRAWER_BELOW && !toggleVisible) {
              found.push(`at ${width} px the contents are a drawer, but its button is not visible, so the contents cannot be reached at all`);
            }
            if (width >= DRAWER_BELOW && toggleVisible) {
              found.push(`at ${width} px the rail is shown, so the drawer button should not also be there`);
            }
            if (width < DRAWER_BELOW && toggleVisible) {
              const closed = await page.evaluate(() => {
                const r = document.querySelector('.tb-rail').getBoundingClientRect();
                return { x: Math.round(r.x), w: Math.round(r.width) };
              });
              if (closed.x + closed.w > 1) found.push(`the drawer is already on screen before it is opened (x ${closed.x}, width ${closed.w})`);

              await press(page, page.locator('.tb-navtoggle'), device.kind);
              await page.waitForTimeout(650);
              const opened = await page.evaluate(() => {
                const rail = document.querySelector('.tb-rail');
                const r = rail.getBoundingClientRect();
                const cs = getComputedStyle(rail);
                // What is actually on top at the drawer's own left edge? If the drawer is behind the
                // text, a reader taps the article instead of a link and the drawer "does not work".
                const probe = document.elementFromPoint(Math.max(2, Math.min(r.x + 24, innerWidth - 2)), Math.round(r.y + Math.min(80, r.height / 2)));
                return {
                  x: Math.round(r.x), w: Math.round(r.width), visibility: cs.visibility, opacity: cs.opacity,
                  expanded: document.querySelector('.tb-navtoggle')?.getAttribute('aria-expanded'),
                  topmost: probe ? `${probe.tagName.toLowerCase()}${probe.className ? `.${String(probe.className).split(' ')[0]}` : ''}` : null,
                  inRail: probe ? Boolean(probe.closest('.tb-rail')) : false,
                  links: rail.querySelectorAll('a').length,
                };
              });
              if (opened.x > 1) found.push(`tapping the contents button did not bring the drawer on screen: it is at x ${opened.x}`);
              if (opened.visibility === 'hidden' || opened.opacity === '0') found.push(`the drawer moved on screen but is ${opened.visibility}/${opened.opacity}`);
              if (opened.expanded !== 'true') found.push(`the contents button reports aria-expanded="${opened.expanded}" after being pressed`);
              if (opened.links === 0) found.push('the drawer opened with no links in it');
              if (opened.x <= 1 && !opened.inRail) found.push(`the drawer is on screen but something else is on top of it: a tap at its left edge lands on ${opened.topmost}`);

              // A drawer owes the reader more than opening. These three were all missing, and their
              // absence is what "the sidebar does not work" meant: the reader opens it, changes their
              // mind, taps the article, and nothing happens.
              const dressing = await page.evaluate(() => {
                const scrim = document.querySelector('.tb-scrim');
                const r = scrim && !scrim.hidden ? scrim.getBoundingClientRect() : null;
                return {
                  scrim: Boolean(r) && Math.round(r.width) >= innerWidth && Math.round(r.height) >= innerHeight,
                  locked: getComputedStyle(document.documentElement).overflow === 'hidden',
                  focusInside: Boolean(document.activeElement?.closest('.tb-rail')),
                };
              });
              if (!dressing.scrim) found.push('the drawer opened with nothing over the page behind it, so there is nothing to tap to dismiss it and no sign the page is waiting');
              if (!dressing.locked) found.push('the page behind the open drawer still scrolls, so a swipe meant for the contents moves the article instead');
              if (!dressing.focusInside) found.push('opening the drawer left focus outside it, so a keyboard or screen-reader user is still in the article');

              // Tapping outside must dismiss it. This is the one a reader tries first.
              const outsideX = Math.min(width - 8, Math.round(width * 0.92));
              const outsideY = Math.round(page.viewportSize().height * 0.6);
              if (device.kind === 'touch') await page.touchscreen.tap(outsideX, outsideY);
              else await page.mouse.click(outsideX, outsideY);
              await page.waitForTimeout(650);
              const afterOutside = await page.evaluate(() => {
                const r = document.querySelector('.tb-rail').getBoundingClientRect();
                return { x: Math.round(r.x), w: Math.round(r.width) };
              });
              if (afterOutside.x + afterOutside.w > 1) found.push(`tapping outside the drawer did not close it (x ${afterOutside.x}); a reader who changes their mind is stuck with it over the text`);

              // And following a link must close it, go somewhere, and leave the page scrollable.
              await press(page, page.locator('.tb-navtoggle'), device.kind);
              await page.waitForTimeout(650);
              if (opened.links > 0) {
                const link = page.locator('.tb-rail a').first();
                await press(page, link, device.kind);
                await page.waitForTimeout(650);
                const closedAgain = await page.evaluate(() => {
                  const r = document.querySelector('.tb-rail').getBoundingClientRect();
                  return { x: Math.round(r.x), w: Math.round(r.width), hash: location.hash, locked: getComputedStyle(document.documentElement).overflow === 'hidden' };
                });
                if (closedAgain.x + closedAgain.w > 1) found.push(`following a link left the drawer open over the text (x ${closedAgain.x})`);
                if (!closedAgain.hash) found.push('following a link in the drawer did not navigate anywhere');
                if (closedAgain.locked) found.push('the page was left locked after the drawer closed, so nothing scrolls any more');
              }
            }
          }

          // --- anything that pops over the text must stay on screen ---
          const terms = await page.locator('tb-term button').count();
          if (terms) {
            // EVERY term, not a sample. The first version checked only the first and the last, and the
            // definition that hung off the left edge belonged to term 15 of 31: a term in the middle
            // of a line is the one the popover cannot be flipped to fit, because it is wider than the
            // space on either side of it. A gate that samples the ends cannot see the middle.
            for (let which = 0; which < terms; which += 1) {
              const t = page.locator('tb-term button').nth(which);
              await t.scrollIntoViewIfNeeded();
              await press(page, t, device.kind);
              await page.waitForTimeout(90);
              const pop = await page.evaluate(() => {
                const p = document.querySelector('.tb-term__pop');
                if (!p) return null;
                const r = p.getBoundingClientRect();
                return {
                  left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
                  overRight: Math.round(r.right - innerWidth), overLeft: Math.round(-r.left),
                };
              });
              if (!pop) {
                found.push(`tapping a glossary term (${which === 0 ? 'the first' : 'the last'}) opened no definition`);
              } else {
                if (pop.overRight > 1) found.push(`a glossary definition hangs ${pop.overRight} px off the right edge (${which === 0 ? 'first' : 'last'} term, width ${pop.width} in a ${width} px viewport)`);
                if (pop.overLeft > 1) found.push(`a glossary definition hangs ${pop.overLeft} px off the left edge (${which === 0 ? 'first' : 'last'} term)`);
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
          const cols = await page.evaluate(() => {
            const main = document.querySelector('.tb-main');
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
          });
          if (cols) {
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
        report.push({ device: device.id, page: pageDef.id, theme, problems: found });
        for (const p of found) problems.push(`${where}: ${p}`);
        console.log(`${found.length ? 'FAIL' : 'ok  '} ${where}${found.length ? ` (${found.length})` : ''}`);
        for (const p of found) console.log(`  ${p}`);
        await page.close();
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
if (problems.length) {
  console.error(`\nFAIL: ${problems.length} problem(s) over ${loads} load(s) on ${wanted.length} device(s); see ${OUT}/report.json`);
  process.exit(1);
}
console.log(`\ndevices: ${loads} loads clean across ${wanted.length} devices; screenshots in ${OUT}/`);
