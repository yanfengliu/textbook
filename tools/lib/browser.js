// Shared Playwright helpers for the gates.
import { chromium } from 'playwright';

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
export const PAGES = [
  { id: 'library', path: '/' },
  { id: 'biology', path: '/biology/' },
  { id: 'ch01', path: '/biology/ch01-what-is-life/' },
];

export const VIEWPORTS = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 1024, height: 768 },
  { id: 'desktop', width: 1440, height: 900 },
];

export const THEMES = ['light', 'dark'];
