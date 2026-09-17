// Shared Playwright helpers for the gates, and the one list of pages they visit.
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Headless chromium refuses WebGL on its software renderer (SwiftShader) unless this flag is set.
// Measured 2026-09-16: this flag is also what PINS the software fallback. Without it chromium reaches
// the GPU through ANGLE's default backend and reports the real device; with it, a machine carrying an
// RTX 4090 renders every gate through SwiftShader. So this is not a fallback enabler but the switch that
// chooses the CPU rasterizer, and it is the reason the default below stays on the CPU.
export const WEBGL_ARGS = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
// Try the real GPU through ANGLE/D3D11; falls back to SwiftShader when no GPU is usable.
// `--use-angle=d3d11` alone reaches the GPU; no headful launch and no `--headless=new` is needed, and
// `--use-gl=angle` is redundant with it (measured on all eight configurations, out/gpu/renderer.json).
export const GPU_ARGS = [...WEBGL_ARGS, '--use-angle=d3d11', '--enable-gpu-rasterization'];

// Why the default is the CPU rasterizer, and what it costs.
//
// On a machine with an RTX 4090 (`ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11
// vs_5_0 ps_5_0, D3D11)` against `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)
// (0x0000C0DE)), SwiftShader driver)`), `gpu: true` runs `npm run sweep3d` in a median 52.1 s against
// 101.1 s — **1.94x**, over nine arms, of which the four GPU arms sat inside 10% and the CPU arms
// ranged 61.1-155.4 s (out/gpu/renderer.json, out/gpu/arm*.log). It is declined because the CPU is
// byte-reproducible and the GPU is not: two CPU runs of the sweep produced 180/180 identical frames at
// max delta 0, two GPU runs 119/180 with a 1-2/255 jitter in the rest. "Every frame is a pure function
// of its clock and the reader's actions" is exactly the promise that a screenshot is the same frame
// every run, and 1.94x is not worth spending it. The speed is still reachable per tool through
// PERF_GPU / SHOT_GPU / SWEEP_GPU, which is where a developer who wants the fast loop should ask for it.
//
// The segment that dominates either way is the screenshot readback, not the raster: 762.4 of 922.9 ms
// per frame on the GPU and 885.8 of 1643.2 ms on the CPU, and it barely moved between them, so the
// raster gain cannot move the gate much. That is the next lever, and it is a readback problem.
// `--enable-automation` is added to every launch for one reason: `Browser.getBrowserCommandLine` refuses
// to answer without it, and that is the only way to read back what chromium was REALLY started with.
export function launch({ gpu = false, args: extraArgs = [], ...options } = {}) {
  const args = [...(gpu ? GPU_ARGS : WEBGL_ARGS), ...extraArgs, AUTOMATION_FLAG];
  return chromium.launch({ ...options, args }).then(async (browser) => {
    console.log(await rendererLine(browser, args));
    return browser;
  });
}

const AUTOMATION_FLAG = '--enable-automation';

// The flags worth printing: the three the quiet-browser preload supplies (so their absence is as visible
// as their presence) and the ones that decide which rasterizer ANGLE picks. `disable-features` is matched
// only when its value is exactly the quiet set — chromium passes a sixty-name `disable-features` of its
// own, and printing that buries the two flags that matter in a paragraph of defaults.
const INTERESTING = ['noerrdialogs', 'disable-crash-reporter', 'enable-unsafe-swiftshader', 'ignore-gpu-blocklist', 'use-angle', 'use-gl', 'enable-gpu-rasterization'];
const QUIET_FEATURE_VALUE = 'Crashpad';

// Which rasterizer is drawing the frames, reported once per launch.
//
// Why this exists: nothing here read the renderer string, so every gate could report a green sweep of
// ninety frames without saying whether a GPU or SwiftShader drew them, and the two do not produce the
// same bytes. This line is the instrument that closes that class, in the shape `npm run shot` uses for
// its font census — the run states which face drew the glyphs, and now which rasterizer drew the frame.
//
// Report-only, deliberately: it must never fail because the renderer is SwiftShader or because it is not
// some expected string. CI runs on GitHub Actions with no GPU, so a check that named a device would be
// red there for being correct. It fails only when no renderer string can be read at all, because then
// the instrument is broken and a silent pass would read as agreement (see docs/learning/defect-register.md).
export async function rendererLine(browser, args = []) {
  const page = await browser.newPage();
  let info;
  try {
    info = await page.evaluate(htmlProbe);
  } finally {
    await page.close();
  }
  if (info.error) throw new Error(`cannot read the WebGL renderer, so this run cannot say which rasterizer drew its frames: ${info.error}`);
  // The flags are read back off the RUNNING browser, not echoed from the list this module built. The
  // quiet-browser preload appends its three flags inside `chromium.launch`, after `launch()` above has
  // assembled its own args, so echoing the list would report the gate's intent and not the launch — and
  // would print the same thing whether the preload ran or not, which is evidence of nothing. The
  // difference is the whole point: with the preload engaged the line carries `--noerrdialogs
  // --disable-crash-reporter --disable-features=Crashpad`, and without it the line does not. That is the
  // half `test/browser-quiet.test.js:20-21` says its own checks cannot see, because a patch that silently
  // fails to apply is a silent no-op.
  //
  // When the browser will not answer, the args are OMITTED rather than filled in with the intended list:
  // a wrong instrument is worse than an absent one, and an absent claim sends the reader to the probe.
  let argPart = '';
  try {
    const cdp = await browser.newBrowserCDPSession();
    const { arguments: argv } = await cdp.send('Browser.getBrowserCommandLine');
    if (Array.isArray(argv) && argv.length) {
      // Only the flags this repository's gates decide. Chromium's own argv is sixty-odd defaults
      // (user-data-dir, disable-background-networking, …) and printing them would bury the line that
      // matters under a paragraph of noise in every gate log.
      const flat = argv.map((a) => a.replace(/^--/, ''));
      const shown = flat.filter((a) => INTERESTING.some((f) => a === f || a.startsWith(`${f}=`))
        || (a.startsWith('disable-features=') && a.slice('disable-features='.length).split(',').includes(QUIET_FEATURE_VALUE)));
      argPart = ` | args as launched (${shown.length} of ${flat.length}) ${shown.join(' ')}`;
    } else {
      argPart = ' | args as launched (the browser returned no command line, so this line makes no claim about them)';
    }
  } catch (err) {
    argPart = ` | args as launched (unreadable: ${err.message.split('\n')[0]})`;
  }
  const masked = info.masked ? ' [unmasked strings unavailable; this is the masked renderer]' : '';
  return `browser: renderer ${info.renderer} | vendor ${info.vendor} | preload ${preloadState()}${argPart}${masked}`;
}

// WHICH of the two silent outcomes happened. The wrapper's `catch` covers an unresolvable playwright, so
// "the patch ran and found nothing to patch" and "the patch never ran" are otherwise the same log line.
// `__zjQuiet` is the marker it sets on each browser type it patches, so:
//   engaged  — at least one type carries it: the preload ran AND found playwright.
//   absent   — no type carries it: the preload did not run, or it ran and could not resolve playwright.
// The second is still two states in one word, and telling them apart needs the wrapper to record a marker
// before its `require` — left as owed in the defect register rather than guessed at here.
function preloadState() {
  for (const name of ['chromium', 'firefox', 'webkit']) {
    if (chromium?.[name]?.__zjQuiet) return `engaged (__zjQuiet on ${name})`;
  }
  return 'absent (no __zjQuiet marker on chromium, firefox or webkit)';
}

// The in-page half of the probe, a named function so the failure path can be exercised on a page that
// has been made to fail. It is evaluated in the page and reaches nothing outside itself. The red proof
// runs it on a page whose getContext returns null and on one whose context reports no renderer, because
// a branch that cannot be reached is a branch nobody has proved runs (out/gpu/renderer-red.mjs).
export function htmlProbe() {
  let gl = null;
  try {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  } catch { /* reported below as an unreadable instrument */ }
  if (!gl) return { error: 'no WebGL context is available, so the renderer cannot be read' };
  let debug = null;
  try { debug = gl.getExtension('WEBGL_debug_renderer_info'); } catch { /* fall back to the masked strings */ }
  const renderer = (debug && gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER);
  const vendor = (debug && gl.getParameter(debug.UNMASKED_VENDOR_WEBGL)) || gl.getParameter(gl.VENDOR);
  if (!renderer) return { error: 'the WebGL context reports no renderer string' };
  return { renderer: String(renderer), vendor: String(vendor ?? ''), masked: !debug };
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
