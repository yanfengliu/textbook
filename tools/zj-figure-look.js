// One element, cropped out of its page, at 3x — for looking at a single figure without a full-page frame.
//
// Usage: node tools/zj-figure-look.js <page> <selector> [outName]
//   node tools/zj-figure-look.js tongjian/ch03-cai-de-lun/ tb-figure zj-words-ch03
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { startServer } from './serve.js';

const [pagePath, selector, outName = 'figure'] = process.argv.slice(2);
if (!pagePath || !selector) {
  console.error('usage: node tools/zj-figure-look.js <page> <selector> [outName]');
  process.exit(1);
}
const OUT = 'out/zj-figlook';
mkdirSync(OUT, { recursive: true });

const server = await startServer({ port: 0, quiet: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 3 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
try {
  await page.goto(`${server.url}/${pagePath}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__textbook?.state === 'ready', null, { timeout: 90_000 });
  await page.evaluate(() => document.fonts?.ready);
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const file = `${OUT}/${outName}.png`;
  await el.screenshot({ path: file });
  const box = await el.boundingBox();
  console.log(`${file}  (${Math.round(box.width)}x${Math.round(box.height)} css px)`);
  if (errors.length) console.log(`errors: ${JSON.stringify(errors.slice(0, 4))}`);
} finally {
  await browser.close();
  await server.close();
}
