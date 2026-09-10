// npm run perf: frame time and draw calls for the chapter page with every figure mounted and running.
// A diagnostic, not a gate: it measures the machine it runs on. Asks for the GPU (PERF_GPU=0 forces
// SwiftShader) and prints the renderer it got, so numbers from two machines are never confused.
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';

const gpu = process.env.PERF_GPU !== '0';
const SECONDS = Number(process.env.PERF_SECONDS || 5);
const server = await startServer({ port: 0, quiet: true });
const browser = await launch({ gpu });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const errors = collectErrors(page);
  const figures = await openPage(page, `${server.url}/biology/ch01-what-is-life/?eager=1`);
  const renderer = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  // Every figure counts as visible so every loop runs, which is the worst case a reader can produce.
  await page.evaluate(() => {
    for (const f of Object.values(window.__textbook.figures)) f.handle?.setVisible?.(true);
  });
  const frames = await page.evaluate((seconds) => new Promise((done) => {
    const times = [];
    let last = performance.now();
    const end = last + seconds * 1000;
    const tick = (now) => {
      times.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else done(times);
    };
    requestAnimationFrame(tick);
  }), SECONDS);
  frames.sort((a, b) => a - b);
  const median = frames[Math.floor(frames.length / 2)];
  const p95 = frames[Math.floor(frames.length * 0.95)];
  const draw = await page.evaluate(() => Object.fromEntries(Object.entries(window.__textbook.describeFigures()).map(([k, v]) => [k, { drawCalls: v.drawCalls, triangles: v.triangles }])));
  console.log(`renderer: ${renderer}`);
  console.log(`frames over ${SECONDS} s: ${frames.length}; median ${median.toFixed(2)} ms; p95 ${p95.toFixed(2)} ms`);
  for (const [id, d] of Object.entries(draw)) if (d.drawCalls !== undefined) console.log(`${id}: ${d.drawCalls} draw calls, ${d.triangles} triangles`);
  console.log(`${Object.keys(figures).length} figures mounted`);
  if (errors.length) {
    console.error(`${errors.length} page error(s):`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
} finally {
  await browser.close();
  await server.close();
}
