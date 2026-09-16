// Viewport frames down a page, at 2x, so the images are small enough to look at directly.
//
// A full-page capture of this chapter is 6341 px tall and the viewer refuses anything over 8192 px on a
// side at 2x, and a downscaled full-page frame answers "is it there" rather than "is it right" — the
// repository's own rule. So this walks the page in one-viewport steps and writes a frame each time.
//
// Usage: node tools/zj-frames.js [page] [theme] [width] [dpr]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { startServer } from './serve.js';

const [pagePath = 'tongjian/ch01-san-jia-fen-jin/', theme = 'light', width = '1440', dpr = '2'] = process.argv.slice(2);
const OUT = 'out/zj-frames';
mkdirSync(OUT, { recursive: true });

const server = await startServer({ port: 0, quiet: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: Number(dpr),
  colorScheme: theme,
});
const page = await context.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

try {
  await page.goto(`${server.url}/${pagePath}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__textbook?.state === 'ready', null, { timeout: 90_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 900;
  const n = Math.min(Math.ceil(total / step), 10);
  const slug = `${pagePath.replace(/\//g, '_')}-${theme}-${width}`;
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), i * step);
    await page.waitForTimeout(250);
    const file = `${OUT}/${slug}-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
  console.log(`page height ${total} px, ${n} frame(s)${errors.length ? `, ${errors.length} console error(s): ${errors.slice(0, 2).join(' | ')}` : ''}`);
} finally {
  await context.close();
  await browser.close();
  await server.close();
}
