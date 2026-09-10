// npm run figure -- <kind> [--theme dark] [--t 0] [--reduce] [--width 900] [--height 560]
//                  [--view theta,phi,distance] [--out out/lab/<kind>-<theme>.png]
//
// Screenshot one figure in the lab (lab/index.html) with its clock pinned. A worker's own check while
// building a figure, and the base the sweep gate is built on. Fails on any console error, page error,
// failed request, or a figure that does not reach ready. Prints describe() so the numbers are in the log.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';

function parseArgs(argv) {
  const out = { theme: 'light', t: '0', reduce: false, width: 1000, height: 640, view: null, out: null, kind: null, gpu: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--theme') out.theme = argv[++i];
    else if (a === '--t') out.t = argv[++i];
    else if (a === '--reduce') out.reduce = true;
    else if (a === '--gpu') out.gpu = true;
    else if (a === '--width') out.width = Number(argv[++i]);
    else if (a === '--height') out.height = Number(argv[++i]);
    else if (a === '--view') out.view = argv[++i].split(',').map(Number);
    else if (a === '--out') out.out = argv[++i];
    else if (!a.startsWith('--')) out.kind = a;
    else throw new Error(`unknown argument ${a}; see the header of tools/figure-shot.js`);
  }
  if (!out.kind) throw new Error('figure-shot needs a kind, e.g. `npm run figure -- cell3d --theme dark`');
  return out;
}

export async function shootFigure(opts) {
  const server = await startServer({ port: 0, quiet: true });
  const browser = await launch({ gpu: opts.gpu });
  let errors = [];
  let describe = null;
  try {
    const page = await browser.newPage({ viewport: { width: opts.width, height: opts.height }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(ACTION_TIMEOUT_MS);
    errors = collectErrors(page);
    const q = new URLSearchParams({ kind: opts.kind, theme: opts.theme, eager: '1', t: String(opts.t) });
    if (opts.reduce) q.set('reduce', '1');
    const figures = await openPage(page, `${server.url}/lab/?${q}`);
    const id = `lab-${opts.kind}`;
    describe = figures[id];
    if (!describe || describe.state !== 'ready') {
      const error = await page.evaluate((id) => window.__textbook.figures[id]?.error ?? null, id);
      throw new Error(`figure ${opts.kind} is in state "${describe?.state}"${error ? `: ${error}` : ''}${errors.length ? `; page errors: ${errors.join(' | ')}` : ''}`);
    }
    if (opts.view) {
      const [theta, phi, distance] = opts.view;
      await page.evaluate(({ id, theta, phi, distance }) => {
        const f = window.__textbook.figures[id];
        if (!f.handle?.setView) throw new Error(`figure ${id} has no setView`);
        f.handle.setView({ theta, phi, distance });
      }, { id, theta, phi, distance });
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      describe = await page.evaluate((id) => document.getElementById(id).describe(), id);
    }
    const out = opts.out || `out/lab/${opts.kind}-${opts.theme}${opts.view ? `-${opts.view.join('_')}` : ''}.png`;
    mkdirSync(dirname(out), { recursive: true });
    const stage = page.locator(`#${id} .tb-figure__stage`);
    await stage.screenshot({ path: out, type: 'png' });
    console.log(`wrote ${out}`);
    console.log(JSON.stringify(describe));
    return { out, describe, errors };
  } finally {
    await browser.close();
    await server.close();
  }
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname.toLowerCase().endsWith(process.argv[1].replace(/\\/g, '/').toLowerCase().split('/').slice(-2).join('/'));
if (isMain) {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
  shootFigure(opts).then(({ errors }) => {
    if (errors.length) {
      console.error(`FAIL: ${errors.length} page error(s):`);
      for (const e of errors) console.error(`  ${e}`);
      process.exit(1);
    }
  }).catch((err) => {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  });
}
