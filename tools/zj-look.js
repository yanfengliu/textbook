// Look at one page of the new book at several sizes and scales, and at one card open.
//
// The point is the images, not the assertions: this repository's rule is that typography is the product
// and that no gate can judge it, so the only useful output is frames at the artefact's own resolution for
// a person to inspect. The frames go to `out/zj-look/`, which is git-ignored.
//
// Usage: node tools/zj-look.js [page] [--open-card]
//   node tools/zj-look.js tongjian/ch01-san-jia-fen-jin/
//   node tools/zj-look.js tongjian/ch01-san-jia-fen-jin/ --open-card
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { startServer } from './serve.js';

const args = process.argv.slice(2);
const openCard = args.includes('--open-card');
const pagePath = (args.find((a) => !a.startsWith('--')) || 'tongjian/ch01-san-jia-fen-jin/').replace(/^\//, '');
const OUT = 'out/zj-look';
mkdirSync(OUT, { recursive: true });

// `dpr` is the device pixel ratio, which is the difference between "is it there" and "is it right": the
// owner's rule asks for 1x, 2x and 3x, and a defect in a hairline or a tone mark only shows at 3.
const SHOTS = [
  { id: 'desktop-light-1x', width: 1440, height: 1000, theme: 'light', dpr: 1 },
  { id: 'desktop-light-2x', width: 1440, height: 1000, theme: 'light', dpr: 2 },
  { id: 'desktop-dark-2x', width: 1440, height: 1000, theme: 'dark', dpr: 2 },
  // The card is the thing the reader clicks, so it gets its own frame at 3x: a tone mark, a hairline or
  // a mis-set glyph in the card is exactly the class of defect the owner's rule is about.
  { id: 'desktop-light-card', width: 1440, height: 1000, theme: 'light', dpr: 3, card: true },
  { id: 'desktop-dark-card', width: 1440, height: 1000, theme: 'dark', dpr: 3, card: true },
  { id: 'phone-light-3x', width: 390, height: 844, theme: 'light', dpr: 3 },
  { id: 'phone-dark-3x', width: 390, height: 844, theme: 'dark', dpr: 3 },
];

const server = await startServer({ port: 0, quiet: true });
const browser = await chromium.launch();
const written = [];

try {
  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: shot.dpr,
      colorScheme: shot.theme,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(`${server.url}/${pagePath}?eager=1`, { waitUntil: 'load' });
    try {
      await page.waitForFunction(() => window.__textbook?.state === 'ready', null, { timeout: 90_000 });
    } catch (err) {
      // The first version of this probe let the timeout escape, and a timeout says nothing about why:
      // the page may have thrown, a module may have 404ed, or a figure may be stuck. Read the page's own
      // state back before giving up, because that is the difference between a diagnosis and a mystery.
      const state = await page.evaluate(() => ({
        handshake: window.__textbook?.state ?? null,
        figures: Object.fromEntries(Object.entries(window.__textbook?.figures ?? {}).map(([k, v]) => [k, `${v.state}${v.error ? `: ${v.error}` : ''}`])),
        hasLexicon: Boolean(window.__textbook?.lexicon),
        chars: document.querySelectorAll('tb-char').length,
        terms: document.querySelectorAll('tb-term').length,
        figuresInDom: document.querySelectorAll('tb-figure').length,
      })).catch((e) => ({ evaluateFailed: e.message }));
      console.error(`FAIL ${shot.id}: the page did not become ready in 90s (${err.message.split('\n')[0]})`);
      console.error(`  page state: ${JSON.stringify(state, null, 2)}`);
      console.error(`  console/page errors: ${errors.length ? JSON.stringify(errors.slice(0, 8), null, 2) : 'none'}`);
      const failShot = `${OUT}/${pagePath.replace(/\//g, '_')}-${shot.id}-FAILED.png`;
      await page.screenshot({ path: failShot }).catch(() => {});
      console.error(`  screenshot of the failing load: ${failShot}`);
      await context.close();
      process.exitCode = 1;
      continue;
    }
    await page.evaluate(() => document.fonts?.ready);

    // Full page first: the composition is the thing a section-by-section look cannot judge.
    const full = `${OUT}/${pagePath.replace(/\//g, '_')}-${shot.id}-full.png`;
    await page.screenshot({ path: full, fullPage: true });
    written.push(full);

    // Then the 原文 and the card, at the top of the article where the reader starts.
    await page.evaluate(() => document.querySelector('.zj-src')?.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    const src = `${OUT}/${pagePath.replace(/\//g, '_')}-${shot.id}-source.png`;
    await page.screenshot({ path: src });
    written.push(src);

    if (shot.card) {
      // A real click on a real character, not a scripted popover: the click path is what the reader uses
      // and what a harness that calls `open()` directly would skip. Both the first character of the 原文
      // and a 詞 are opened, because they take different branches of the component.
      await page.evaluate(() => document.querySelector('.zj-src')?.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(200);
      const target = page.locator('.zj-src tb-char').first();
      await target.locator('button').click();
      await page.waitForSelector('.zj-src tb-char .tb-term__pop, .zj-src tb-char .tb-pop', { timeout: 5000 });
      await page.waitForTimeout(250);
      const card = `${OUT}/${pagePath.replace(/\//g, '_')}-${shot.id}.png`;
      await page.screenshot({ path: card });
      written.push(card);

      // The card's own text, so a frame that renders nothing cannot pass as a frame that renders right.
      const cardText = await page.locator('.zj-src tb-char .tb-term__pop, .zj-src tb-char .tb-pop').first().textContent();
      console.log(`  card text (${shot.id}): ${JSON.stringify((cardText || '').trim().slice(0, 200))}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);

      const word = page.locator('.zj-src tb-term').first();
      if (await word.count()) {
        await word.locator('button').click();
        await page.waitForSelector('.zj-src tb-term .tb-term__pop', { timeout: 5000 });
        await page.waitForTimeout(250);
        const wordCard = `${OUT}/${pagePath.replace(/\//g, '_')}-${shot.id}-word.png`;
        await page.screenshot({ path: wordCard });
        written.push(wordCard);
        const wordText = await page.locator('.zj-src tb-term .tb-term__pop').first().textContent();
        console.log(`  word card text (${shot.id}): ${JSON.stringify((wordText || '').trim().slice(0, 200))}`);
      }
    }

    if (errors.length) console.log(`  ${shot.id}: ${errors.length} console/page error(s): ${errors.slice(0, 3).join(' | ')}`);
    await context.close();
  }
  console.log(`zj-look: ${written.length} frame(s) written`);
  for (const f of written) console.log(`  ${f}`);
} finally {
  await browser.close();
  await server.close();
}
