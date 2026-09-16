// Shared Playwright helpers for the gates, and the one list of pages they visit.
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Headless chromium refuses WebGL on its software renderer (SwiftShader) unless this flag is set.
export const WEBGL_ARGS = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
// Try the real GPU through ANGLE/D3D11; falls back to SwiftShader when no GPU is usable.
export const GPU_ARGS = [...WEBGL_ARGS, '--use-angle=d3d11', '--enable-gpu-rasterization'];

export function launch({ gpu = false } = {}) {
  return chromium.launch({ args: gpu ? GPU_ARGS : WEBGL_ARGS });
}

// SwiftShader renders the 3D figures slowly on a machine without a GPU; give every page time.
export const ACTION_TIMEOUT_MS = 180_000;

// Every console error, uncaught page error, and failed request lands in the returned array.
// A font request that fails is reported like any other: the page is expected to be online for the
// gates, the same way it is for the Three.js CDN.
export function collectErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()} (${req.failure()?.errorText ?? 'unknown'})`));
  return errors;
}

// Load a page and wait for the handshake (src/shell.js sets window.__textbook.state to 'ready' once
// the shell is mounted and, under ?eager=1, every figure is ready or in error). Resolves with the
// figures' descriptions. Fails fast when a script request fails rather than at the timeout.
export async function openPage(page, url, { timeoutMs = 120_000 } = {}) {
  let failedRequest = null;
  const onFailed = (req) => {
    if (!failedRequest && /\.(m?js)(\?|$)/.test(req.url())) failedRequest = `${req.url()} (${req.failure()?.errorText ?? 'unknown'})`;
  };
  page.on('requestfailed', onFailed);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    const deadline = Date.now() + timeoutMs;
    while (true) {
      const state = await page.evaluate(() => window.__textbook?.state ?? null);
      if (state === 'ready') break;
      if (failedRequest) throw new Error(`a script failed to load: ${failedRequest}`);
      if (Date.now() > deadline) {
        const figures = await page.evaluate(() => Object.fromEntries(Object.entries(window.__textbook?.figures ?? {}).map(([k, v]) => [k, v.state])));
        throw new Error(`page did not become ready within ${timeoutMs} ms; figure states: ${JSON.stringify(figures)}`);
      }
      await page.waitForTimeout(100);
    }
  } finally {
    page.off('requestfailed', onFailed);
  }
  // Fonts and two more animation frames, so the screenshot shows the settled page.
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  return page.evaluate(() => window.__textbook.describeFigures());
}

// The pages every page-level gate visits. Paths are relative to the served root.
//
// Chapters are DISCOVERED, never listed. A chapter that has to be added to a list by hand is a chapter
// that can be written, gated green and never once visited by a gate, and the list existed in two places
// (here and tools/subpath.js) plus the book's own contents page, so forgetting one of them was the
// normal case rather than the unlucky one. Reading them off disk means `npm run shot`, `npm run check`,
// `npm run devices`, `npm run inspect` and `npm run subpath` all cover a new chapter the moment its
// index.html exists. The cost is that a half-written chapter turns those gates red, which is the truth.
const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

// A book is a directory with its own index.html holding at least one chNN-<slug>/index.html.
//
// A chapter's page id is qualified with its book (`biology/ch01`, `tongjian/ch01`). It used to be the
// chapter number alone, which was unique only while the repository had one book: the second book's
// chapter 1 collided with the first book's, so `test/pages.test.js`'s uniqueness assertion failed the
// moment a second `ch01-.../index.html` existed, and `SHOT_PAGES=ch01`, `DEVICE_PAGES=ch01` and
// `tools/inspect.js --page ch01` all silently addressed two pages. The study system had already chosen
// this shape — `tools/check-content.js` keys a chapter as `<book>/chNN` — so the page list now agrees
// with it. Found 2026-09-12 by the baseline probe for the second book (docs/work/4_zizhi-tongjian/plan.md).
export function discoverBooks(root = REPO_ROOT) {
  const books = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const bookDir = join(root, entry.name);
    if (!existsSync(join(bookDir, 'index.html'))) continue;
    const chapters = [];
    for (const sub of readdirSync(bookDir, { withFileTypes: true })) {
      const m = sub.isDirectory() && /^ch(\d{2})-/.exec(sub.name);
      if (!m || !existsSync(join(bookDir, sub.name, 'index.html'))) continue;
      chapters.push({ id: `${entry.name}/ch${m[1]}`, path: `/${entry.name}/${sub.name}/`, n: Number(m[1]), slug: sub.name });
    }
    if (!chapters.length) continue;
    chapters.sort((a, b) => a.n - b.n);
    books.push({ id: entry.name, path: `/${entry.name}/`, chapters });
  }
  return books.sort((a, b) => (a.id < b.id ? -1 : 1));
}

export const BOOKS = discoverBooks();

export const PAGES = [
  { id: 'library', path: '/' },
  ...BOOKS.flatMap((b) => [{ id: b.id, path: b.path }, ...b.chapters.map(({ id, path }) => ({ id, path }))]),
  { id: 'today', path: '/today/' },
];

export const VIEWPORTS = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 1024, height: 768 },
  { id: 'desktop', width: 1440, height: 900 },
];

export const THEMES = ['light', 'dark'];
