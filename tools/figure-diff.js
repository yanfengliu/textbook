// node tools/figure-diff.js record <kind[,kind]>   — run one figure's gates twice, keep the frames, and
//                                                    measure which pixels of them are not reproducible
// node tools/figure-diff.js compare <kind[,kind]>  — run them again and say whether anything moved
//
// Claim: for the kinds named, every pixel that `tools/drive.js`, `tools/narrow.js` and — for a WebGL
// kind — `tools/sweep3d.js` draw, outside the region those same gates were measured to draw
// unreproducibly, is the same as when the recording was taken. Exit 0 means nothing moved. Exit 1 names
// each frame that was added, removed, or moved, with how many pixels, the largest channel delta, and
// where. Exit 2 means the tool could not do its job at all.
//
// Why it exists: no gate in this repository can see composition. `npm run narrow` asks whether a frame
// is blank, flat or near-black; `npm run drive` asserts `describe()`, not pixels; `npm run sweep3d`
// detects an absent frame, not a wrong one. So a change that is MEANT to change nothing — moving a
// figure onto `src/figures/lib/bench.js`, say — had no way to prove it changed nothing, and the honest
// answer to "may an accepted figure be touched?" was otherwise no. A figure whose frames did not move
// needs no second look from a person; a frame that moved is a design change and goes back through
// acceptance (docs/design/figure-bench.md, step 0).
//
// ── why this is not a hash comparison, which is what the design asked for ─────────────────────────
//
// It was one, for an hour. It reported a change when nothing had changed, most runs. **The gates'
// screenshots are not reproducible**, and two separate causes were measured on this tree on 2026-09-16,
// both of them inside the toolbar:
//
//  1. `tools/drive.js` screenshots the stage the instant a click returns, and `components.css` gives
//     `.fig-btn` `transition: background var(--dur) …` with `--dur` at 240 ms. A recipe step that
//     presses a DIFFERENT button from the one before it therefore lands mid-transition on four buttons
//     at once — two changing hover, two changing `aria-pressed`. Measured on `phlab` step 03: six
//     identical runs gave FOUR distinct PNGs; the same six waiting 900 ms gave two; the difference
//     between two of them was 9,242 px of 510,272 at a maximum channel delta of 23, all of it in the
//     30-pixel band the toolbar occupies.
//  2. `backdrop-filter: blur(8px)`, also on `.fig-btn`, does not rasterize bit-exactly across page
//     loads. Eight fresh loads of an unchanged `phlab` gave two distinct PNGs, four each; the same eight
//     with the blur switched off gave one. Those two differed in 80 px of 510,272 at a maximum channel
//     delta of 2, again inside the toolbar band.
//
// Neither is settling — within one page the frame is identical at 0, 120, 400, 900 and 1600 ms after
// the last click — and neither is the webfonts, which report `loaded` at both ends of every run. Both
// are `tools/drive.js`'s and `components.css`'s business, not this tool's, and a comparator cannot fix
// a measurement that does not repeat. So this tool **measures the unreproducible region instead of
// guessing a tolerance for it**: `record` runs every gate twice and stores, per frame, the 16-pixel
// tiles whose pixels differed between those two runs, and the largest channel delta seen inside them.
// `compare` then fails on any pixel that differs outside those tiles, and on any pixel inside them that
// differs by more than the recording itself showed there. Both thresholds are measurements taken on
// this machine minutes earlier, not constants someone chose.
//
// Bound, and it is a narrow one.
//  - **It is blind inside the mask.** For `phlab` the mask is the toolbar band, so this tool proves the
//    DRAWING did not move and says almost nothing about the buttons' own pixels: a change there has to
//    exceed the recorded in-mask delta (23 levels for phlab) to be seen. Look at the toolbar yourself.
//  - It compares the frames those three gates happen to write, at the widths and in the themes they
//    happen to use: drive at 1000x640 in the light theme after each recipe step, narrow at 390x844 at
//    3x in both themes, sweep3d at fifteen views. It is blind to every width, theme and state none of
//    them reaches, and blind to the figure at its own aspect on a chapter page.
//  - It says a frame moved. It never says whether the move is an improvement. That is a person at the
//    frame's own resolution, which is what `out/drive/`, `out/narrow/` and `out/sweep/` are for.
//  - A figure whose clock free-runs would differ from itself everywhere, and `record` would mask the
//    whole frame. A mask covering a large fraction of a frame is printed as a warning for that reason:
//    it means the recording measured a moving figure and `compare` will see nothing.
//  - Run `record` then `compare` with nothing changed before trusting a red `compare`. That null run is
//    the control on the instrument and it is one command.
//
// A gate that writes no frame for a kind it was asked about is a failure here, not a clean result: a
// recording of nothing compares against a recording of nothing and exits 0, which is a run that did not
// happen reported as a run that found nothing (`tools/lib/trim.js` records the same shape).
//
// No new dependency: chromium already writes the PNGs, node:crypto already hashes, and the decode is
// the same `createImageBitmap` path `tools/lib/pixels.js` uses, so no image library is needed either.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './lib/browser.js';
import { FIGURES, KINDS } from '../src/figures/registry.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const posix = (path) => path.split(sep).join('/');
const rel = (abs) => posix(abs.slice(ROOT.length));
const OUT = join(ROOT, 'out', 'figure-diff');

// The mask's grain. 16 device pixels is fine enough that the toolbar band does not swallow the row of
// drawing above it, and coarse enough that a mask is a few dozen numbers rather than a bitmap.
const TILE = 16;
// How many times `record` runs each gate. Two was not enough: see the comment at the pass loop below.
const PASSES = Number(process.env.FIGURE_DIFF_PASSES || 3);
if (!Number.isInteger(PASSES) || PASSES < 2) {
  console.error(`figure-diff: FIGURE_DIFF_PASSES=${process.env.FIGURE_DIFF_PASSES} is not a whole number of passes above one. One pass measures no instability at all, and a mask of nothing makes every later run's noise read as a change.`);
  process.exit(2);
}
// The floor under the measured in-mask delta, for the case where two recording runs happen to land on
// the same rendering and measure an instability of zero. Two levels out of 255 is the backdrop blur's
// own measured spread (header, cause 2). It is not a budget to be raised: raising it is a decision to
// state here with a new measurement beside it.
const NOISE_DELTA = 2;

// The same preload every gate in tools/test.js is spawned with: it patches chromium.launch() before any
// ESM import, so the crash dialog cannot appear behind a run started from here either.
const QUIET_PRELOAD = `--require=${posix(join(ROOT, 'tools', 'zj-quiet-browser.cjs'))}`;

function die(lines) {
  for (const line of Array.isArray(lines) ? lines : [lines]) console.error(line);
  process.exit(2);
}

// This tool is typed as `node tools/figure-diff.js`, not through an npm script, so nothing puts the
// preload on ITS process — and it launches a browser of its own to decode PNGs. It said so in its own
// log (`preload absent (no __zjQuiet marker…)`) the first time it decoded anything. Rather than adding a
// thirteenth place that has to remember the flag, it re-runs itself once with the preload ahead of it.
// `--require` is evaluated before any ESM import, which is why this cannot be done from inside.
if (!process.execArgv.some((a) => a.includes('zj-quiet-browser'))) {
  const again = spawnSync(process.execPath, [QUIET_PRELOAD, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { cwd: ROOT, stdio: 'inherit' });
  if (again.error) die(`figure-diff: could not re-run itself under the quiet-browser preload (${again.error.message}).`);
  process.exit(again.status ?? 1);
}

// Each gate: the script, the variable that trims it to one kind, the directory it writes, and whether
// this kind is in its subject at all.
const GATES = [
  { id: 'drive', script: 'tools/drive.js', trim: 'DRIVE_KINDS', dir: 'out/drive', covers: () => true },
  { id: 'narrow', script: 'tools/narrow.js', trim: 'NARROW_KINDS', dir: 'out/narrow', covers: () => true },
  { id: 'sweep3d', script: 'tools/sweep3d.js', trim: 'SWEEP_KINDS', dir: 'out/sweep', covers: (kind) => Boolean(FIGURES[kind]?.needsWebGL) },
];

const USAGE = [
  "figure-diff: prove a figure's frames did not move.",
  '',
  '  node tools/figure-diff.js record  <kind[,kind…]> [--label <name>]   two runs: keep the frames, measure the noise',
  '  node tools/figure-diff.js compare <kind[,kind…]> [--label <name>]   one run: say whether anything moved',
  '',
  '  --label   which recording to write or read; default "before". Kept in out/figure-diff/<label>/.',
  '',
  '  Run record, then compare with nothing changed, before believing a red compare: that null run is',
  '  the check on the instrument, and it is one command.',
].join('\n');

// ── arguments ────────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const verb = argv[0];
if (!verb || verb === '--help' || verb === '-h') die(USAGE);
if (verb !== 'record' && verb !== 'compare') {
  die([`figure-diff: "${verb}" is not a command; it takes "record" or "compare".`, '', USAGE]);
}

let label = 'before';
const names = [];
for (let i = 1; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--label') {
    label = argv[i + 1];
    i += 1;
    if (!label || label.startsWith('--')) die(`figure-diff: --label needs a name after it, e.g. --label before. It was given ${label === undefined ? 'nothing' : `"${label}"`}.`);
    if (!/^[\w.-]+$/.test(label)) die(`figure-diff: --label "${label}" is not a usable directory name; letters, digits, dot, dash and underscore only, because it becomes out/figure-diff/<label>/.`);
  } else if (arg.startsWith('--')) {
    die([`figure-diff: "${arg}" is not an option here; the only option is --label.`, '', USAGE]);
  } else {
    names.push(...arg.split(',').map((s) => s.trim()).filter(Boolean));
  }
}
if (!names.length) die([`figure-diff: ${verb} needs at least one figure kind. The registry holds: ${KINDS.join(', ')}.`, '', USAGE]);
const unknown = names.filter((n) => !KINDS.includes(n));
if (unknown.length) {
  die(`figure-diff: ${unknown.map((u) => `"${u}"`).join(', ')} names no registered figure kind, so the gates would be trimmed to nothing and this would compare nothing. The kinds are: ${KINDS.join(', ')}.`);
}
const kinds = KINDS.filter((k) => names.includes(k)); // registry order, deduplicated

// ── running a gate, and hashing what it wrote ────────────────────────────────────────────────────

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const flat = (key) => key.replace(/\//g, '__');

// Every PNG the gate left in its own directory, keyed by the path a reader would type. Each of these
// gates empties its directory at the start of its run, so what is there afterwards is this run's.
// Only the frames named for the kinds asked about. These directories are shared: another worker running
// `tools/drive.js` for another figure empties and refills the same `out/drive/`, and on 2026-09-16 three
// `gradient-battery` frames landed in the middle of a phlab run. Frames belonging to nobody asked for
// are reported by checkCoverage below rather than hashed into this recording.
function framesIn(dir, subject) {
  const abs = join(ROOT, dir);
  const out = { mine: {}, strays: [] };
  if (!existsSync(abs)) return out;
  for (const name of readdirSync(abs).sort()) {
    if (!name.endsWith('.png')) continue;
    if (!subject.some((k) => name.startsWith(`${k}-`))) {
      out.strays.push(name);
      continue;
    }
    out.mine[`${dir}/${name}`] = { hash: sha256(join(abs, name)), path: join(abs, name) };
  }
  return out;
}

function runGate(gate, subject, pass) {
  const started = Date.now();
  // No pipe, and stdio inherited: a pipeline exits with its last stage's status, and this needs the
  // gate's own. The gate's own output is the reader's evidence that it ran at all.
  console.log(`\n== ${gate.id} (${gate.trim}=${subject.join(',')})${pass ? ` pass ${pass}` : ''} ==`);
  const result = spawnSync(process.execPath, [QUIET_PRELOAD, gate.script], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, [gate.trim]: subject.join(',') },
  });
  if (result.error) {
    die(`figure-diff: could not start ${gate.script} (${result.error.message}). Nothing was recorded; a gate that did not start is not a figure that did not change.`);
  }
  const status = result.status ?? `signal:${result.signal}`;
  const { mine, strays } = framesIn(gate.dir, subject);
  console.log(`-- ${gate.id}: exit ${status}, ${Object.keys(mine).length} frame(s) in ${gate.dir}/, ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (strays.length) {
    console.log(`   note: ${gate.dir}/ also holds ${strays.length} frame(s) for other figures (${strays.slice(0, 3).join(', ')}${strays.length > 3 ? ', …' : ''}).`);
    console.log(`   They are not part of this recording. The gates empty this directory when they start, so another`);
    console.log(`   process is writing it — a second worker running ${gate.script} for a different kind. This run's own`);
    console.log(`   frames are still its own, but its TIMING is not, and a run of that gate that lands mid-flight would`);
    console.log(`   delete them: if the coverage check below goes red, that is what happened.`);
  }
  return { status, frames: mine };
}

// A gate that was asked about a kind and wrote no frame carrying its name did not run on it. That is a
// failure of the measurement, not a figure with no frames.
function checkCoverage(gateId, frames, subject) {
  const problems = [];
  for (const kind of subject) {
    if (!Object.keys(frames).some((f) => basename(f).startsWith(`${kind}-`))) {
      problems.push(`${gateId} left no frame named for "${kind}", so this run measured nothing about it. Read the gate's own output above: it went red before it drew, its file naming changed and this tool is looking for the wrong prefix, or another process running ${gateId} emptied the directory underneath it.`);
    }
  }
  return problems;
}

function takeRun(pass) {
  const gates = {};
  const skipped = [];
  const problems = [];
  for (const gate of GATES) {
    const subject = kinds.filter((k) => gate.covers(k));
    if (!subject.length) {
      skipped.push(`${gate.id}: not run — ${kinds.length === 1 ? `${kinds[0]} is` : `${kinds.join(', ')} are`} not a WebGL kind, so this gate has no subject here and proves nothing about ${kinds.length === 1 ? 'it' : 'them'}`);
      gates[gate.id] = { skipped: true, status: null, frames: {} };
      continue;
    }
    const { status, frames } = runGate(gate, subject, pass);
    problems.push(...checkCoverage(gate.id, frames, subject));
    gates[gate.id] = { skipped: false, status, frames };
  }
  if (problems.length) {
    console.error(`\nFAIL: ${problems.length} problem(s) with the run itself, so there is nothing to ${verb}:`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  return { gates, skipped };
}

// ── comparing two frames, in chromium, the way tools/lib/pixels.js decodes one ────────────────────
//
// `mask` is null when the question is "which tiles differ at all" (recording) and a list of tile
// indices when it is "does anything differ outside these" (comparing).
async function measure(pairs) {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto('about:blank');
  const out = [];
  try {
    for (const pair of pairs) {
      const dataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
      out.push({
        ...pair,
        result: await page.evaluate(async ([a, b, mask, tile]) => {
          const bits = async (src) => {
            const bmp = await createImageBitmap(await (await fetch(src)).blob());
            const c = document.createElement('canvas');
            c.width = bmp.width;
            c.height = bmp.height;
            const g = c.getContext('2d', { willReadFrequently: true });
            g.drawImage(bmp, 0, 0);
            return { w: bmp.width, h: bmp.height, d: g.getImageData(0, 0, bmp.width, bmp.height).data };
          };
          const A = await bits(a);
          const B = await bits(b);
          if (A.w !== B.w || A.h !== B.h) return { resized: `${A.w}x${A.h} -> ${B.w}x${B.h}` };
          const cols = Math.ceil(A.w / tile);
          const masked = mask ? new Set(mask) : null;
          const tiles = new Set();
          const inside = { n: 0, maxDelta: 0 };
          const outside = { n: 0, maxDelta: 0, x0: Infinity, y0: Infinity, x1: -1, y1: -1 };
          for (let i = 0; i < A.d.length; i += 4) {
            const d = Math.max(
              Math.abs(A.d[i] - B.d[i]),
              Math.abs(A.d[i + 1] - B.d[i + 1]),
              Math.abs(A.d[i + 2] - B.d[i + 2]),
              Math.abs(A.d[i + 3] - B.d[i + 3]),
            );
            if (!d) continue;
            const p = i / 4;
            const x = p % A.w;
            const y = (p / A.w) | 0;
            const t = ((y / tile) | 0) * cols + ((x / tile) | 0);
            tiles.add(t);
            if (masked && masked.has(t)) {
              inside.n += 1;
              if (d > inside.maxDelta) inside.maxDelta = d;
            } else {
              outside.n += 1;
              if (d > outside.maxDelta) outside.maxDelta = d;
              if (x < outside.x0) outside.x0 = x;
              if (x > outside.x1) outside.x1 = x;
              if (y < outside.y0) outside.y0 = y;
              if (y > outside.y1) outside.y1 = y;
            }
          }
          return { w: A.w, h: A.h, total: A.w * A.h, cols, rows: Math.ceil(A.h / tile), tiles: [...tiles].sort((m, n) => m - n), inside, outside };
        }, [dataUrl(pair.a), dataUrl(pair.b), pair.mask ?? null, TILE]),
      });
    }
  } finally {
    await browser.close();
  }
  return out;
}

// One tile index widened to itself and its eight neighbours: a pixel that is unstable on a tile edge
// bleeds into the tile beside it from one run to the next, and a mask that stops at the boundary then
// reports that bleed as a change.
function widen(tiles, cols, rows) {
  const out = new Set();
  for (const t of tiles) {
    const cx = t % cols;
    const cy = (t / cols) | 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < cols && y >= 0 && y < rows) out.add(y * cols + x);
      }
    }
  }
  return [...out].sort((a, b) => a - b);
}

// ── record ───────────────────────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const keepDir = join(OUT, label);
const manifestPath = join(OUT, `${label}.json`);

if (verb === 'record') {
  const runA = takeRun(`1 of ${PASSES}`);
  rmSync(keepDir, { recursive: true, force: true });
  mkdirSync(keepDir, { recursive: true });
  const kept = {};
  for (const [id, g] of Object.entries(runA.gates)) {
    for (const [key, { path, hash }] of Object.entries(g.frames)) {
      const to = join(keepDir, flat(key));
      copyFileSync(path, to);
      kept[key] = { gate: id, hash, path: to };
    }
  }
  // Every later pass is compared against the first. Two passes were not enough: with two, phlab's
  // step 05 recorded a 39-tile mask from the backdrop blur alone, and a later run caught a fourth
  // button mid-transition 301 px outside it — a red null run, which is the tool crying wolf. Three
  // passes, and the union below, is what stopped that.
  const pairs = [];
  for (let pass = 2; pass <= PASSES; pass += 1) {
    const later = takeRun(`${pass} of ${PASSES}`);
    const dir = join(OUT, `${label}.pass${pass}`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const g of Object.values(later.gates)) {
      for (const [key, { path }] of Object.entries(g.frames)) {
        if (!kept[key]) continue;
        const to = join(dir, flat(key));
        copyFileSync(path, to);
        pairs.push({ key, pass, a: kept[key].path, b: to, dir });
      }
    }
    const onlyOnce = Object.keys(kept).filter((k) => !pairs.some((p) => p.pass === pass && p.key === k));
    if (onlyOnce.length) {
      die([
        `figure-diff: ${onlyOnce.length} frame(s) were written by pass 1 and not by pass ${pass}, so the passes are not of the same thing and no noise mask can be measured:`,
        ...onlyOnce.map((k) => `  ${k}`),
        '  A gate that writes a different set of frames from one run to the next is the thing to fix first.',
      ]);
    }
  }

  const measured = await measure(pairs);
  // Per frame, the union of every pass's differing tiles and the largest delta any pass showed.
  const perFrame = {};
  for (const m of measured) {
    if (m.result.resized) die(`figure-diff: ${m.key} came out at two different sizes in two passes (${m.result.resized}), so nothing about it can be compared.`);
    const f = perFrame[m.key] ?? (perFrame[m.key] = { tiles: new Set(), pixels: 0, delta: 0, cols: m.result.cols, rows: m.result.rows });
    for (const t of m.result.tiles) f.tiles.add(t);
    f.pixels = Math.max(f.pixels, m.result.outside.n);
    f.delta = Math.max(f.delta, m.result.outside.maxDelta);
  }
  // Then the union across every frame of the same gate at the same size. What is unreproducible here is
  // the CHROME — `.fig-btn`'s 240 ms transition and its backdrop blur — and the chrome sits in the same
  // band of every frame that gate writes. Deriving the band from whichever step happened to reveal it,
  // rather than from each step separately, is what makes the mask a property of the gate instead of a
  // lottery over which buttons a given recipe step left in flight.
  const groups = {};
  for (const [key, f] of Object.entries(perFrame)) {
    const g = `${kept[key].gate}:${f.cols}x${f.rows}`;
    const acc = groups[g] ?? (groups[g] = { tiles: new Set(), delta: 0 });
    for (const t of f.tiles) acc.tiles.add(t);
    acc.delta = Math.max(acc.delta, f.delta);
  }

  const frames = {};
  let maskedTiles = 0;
  let allTiles = 0;
  for (const [key, f] of Object.entries(perFrame)) {
    const acc = groups[`${kept[key].gate}:${f.cols}x${f.rows}`];
    const mask = widen([...acc.tiles], f.cols, f.rows);
    frames[key] = {
      gate: kept[key].gate,
      hash: kept[key].hash,
      // The instability this machine actually showed, and what compare may ignore because of it.
      unstablePixels: f.pixels,
      ownDelta: f.delta,
      unstableDelta: Math.max(NOISE_DELTA, acc.delta),
      mask,
      tiles: f.cols * f.rows,
      cols: f.cols,
      rows: f.rows,
    };
    maskedTiles += mask.length;
    allTiles += f.cols * f.rows;
  }
  for (let pass = 2; pass <= PASSES; pass += 1) rmSync(join(OUT, `${label}.pass${pass}`), { recursive: true, force: true });

  const manifest = {
    label,
    takenAt: new Date().toISOString(),
    node: process.version,
    passes: PASSES,
    tile: TILE,
    noiseDeltaFloor: NOISE_DELTA,
    kinds,
    gates: Object.fromEntries(Object.entries(runA.gates).map(([id, g]) => [id, { skipped: g.skipped, status: g.status }])),
    frames,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('');
  for (const line of runA.skipped) console.log(`skip ${line}`);
  console.log(`\nfigure-diff record: ${Object.keys(frames).length} frame(s) for ${kinds.join(', ')} over ${PASSES} passes, kept in ${rel(keepDir)}/, hashed and noise-measured into ${rel(manifestPath)}`);
  for (const [key, f] of Object.entries(frames)) {
    console.log(`  ${f.unstablePixels ? 'noisy ' : 'stable'} ${key} — ${f.unstablePixels} px unreproducible across ${PASSES} passes, own max delta ${f.ownDelta}, mask ${f.mask.length}/${f.tiles} tiles (${((f.mask.length / f.tiles) * 100).toFixed(1)}%) at delta ${f.unstableDelta}`);
  }
  const pct = allTiles ? (maskedTiles / allTiles) * 100 : 0;
  if (pct > 25) {
    console.log(`\n  WARNING: ${pct.toFixed(1)}% of the recorded area is masked as unreproducible. A figure that differs from`);
    console.log('  itself over that much of its frame is moving under the recording, and compare will see almost');
    console.log('  nothing. Check that the figure honours ctx.pinnedTime before reading a green compare as proof.');
  } else {
    console.log(`\n  ${pct.toFixed(1)}% of the recorded area is masked. compare is blind inside it — see this file's header.`);
  }
  console.log(`  Now make the change, then: node tools/figure-diff.js compare ${kinds.join(',')}${label === 'before' ? '' : ` --label ${label}`}`);
  process.exit(0);
}

// ── compare ──────────────────────────────────────────────────────────────────────────────────────
if (!existsSync(manifestPath)) {
  die(`figure-diff: there is no recording at ${rel(manifestPath)} to compare against, so this run has nothing to say. Take one before the change: node tools/figure-diff.js record ${kinds.join(',')}${label === 'before' ? '' : ` --label ${label}`}`);
}
let before;
try {
  before = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (err) {
  die(`figure-diff: ${rel(manifestPath)} is not readable as a manifest (${err.message}). Delete it and record again.`);
}
if (String(before.kinds?.join(',')) !== kinds.join(',')) {
  die(`figure-diff: the recording at ${rel(manifestPath)} is about ${before.kinds?.join(', ') || 'nothing'} and this run is about ${kinds.join(', ')}. Comparing the two would report every frame of each as added or removed.`);
}
if (!before.frames || !Object.keys(before.frames).length) {
  die(`figure-diff: the recording at ${rel(manifestPath)} holds no frame at all, so a comparison against it would pass by having nothing to compare. Record again.`);
}

const now = takeRun();
console.log('');
for (const line of now.skipped) console.log(`skip ${line}`);

const moved = [];
const held = [];
let identical = 0;
const toMeasure = [];

for (const gate of GATES) {
  const b = before.gates?.[gate.id] ?? { skipped: true, status: null };
  const a = now.gates[gate.id];
  if (Boolean(b.skipped) !== Boolean(a.skipped)) {
    moved.push(`${gate.id}: it ${b.skipped ? 'did not run' : 'ran'} when the recording was taken and ${a.skipped ? 'does not run' : 'runs'} now, so the two runs do not cover the same ground`);
  }
  if (String(b.status) !== String(a.status)) {
    moved.push(`${gate.id}: exit status ${b.status} -> ${a.status}. The gate's own verdict changed, whatever the pixels did; read its output above.`);
  }
}
const recorded = Object.keys(before.frames);
const current = Object.values(now.gates).flatMap((g) => Object.entries(g.frames));
const currentByKey = Object.fromEntries(current);
for (const key of [...new Set([...recorded, ...Object.keys(currentByKey)])].sort()) {
  const was = before.frames[key];
  const is = currentByKey[key];
  if (was && !is) moved.push(`gone    ${key} — the frame was recorded and this run did not write it`);
  else if (!was && is) moved.push(`new     ${key} — this run wrote a frame that was not recorded`);
  else if (was.hash === is.hash) identical += 1;
  else if (!existsSync(join(keepDir, flat(key)))) moved.push(`changed ${key} — its bytes differ and the recorded frame is missing from ${rel(keepDir)}/, so the change cannot be measured. Record again.`);
  else toMeasure.push({ key, a: join(keepDir, flat(key)), b: is.path, mask: was.mask });
}

const measured = toMeasure.length ? await measure(toMeasure) : [];
for (const m of measured) {
  const was = before.frames[m.key];
  if (m.result.resized) {
    moved.push(`changed ${m.key} — the frame changed size, ${m.result.resized}`);
    continue;
  }
  const { inside, outside } = m.result;
  if (outside.n) {
    moved.push(`changed ${m.key} — ${outside.n} of ${m.result.total} px (${((outside.n / m.result.total) * 100).toFixed(3)}%) differ OUTSIDE the recorded noise mask, max channel delta ${outside.maxDelta}, box x ${outside.x0}..${outside.x1} y ${outside.y0}..${outside.y1} in ${m.result.w}x${m.result.h}`);
  } else if (inside.maxDelta > was.unstableDelta) {
    moved.push(`changed ${m.key} — ${inside.n} px inside the recorded noise mask differ by up to ${inside.maxDelta} levels, over the ${was.unstableDelta} the recording itself showed there. That is more than the mask accounts for.`);
  } else {
    held.push(`noise   ${m.key} — ${inside.n} px inside the mask, max delta ${inside.maxDelta} against the recorded ${was.unstableDelta}; nothing outside it`);
  }
}

for (const h of held) console.log(`  ${h}`);
if (moved.length) {
  console.error(`\nFAIL: ${moved.length} difference(s) against ${rel(manifestPath)}; ${identical} frame(s) byte-identical, ${held.length} inside the recorded noise.`);
  for (const d of moved) console.error(`  ${d}`);
  console.error('');
  console.error('  A frame that moved is a design change, not a refactor: look at it at its own size, in both');
  console.error('  themes, before accepting it. The new frames are in out/drive/, out/narrow/ and out/sweep/;');
  console.error(`  the recorded ones are in ${rel(keepDir)}/.`);
  process.exit(1);
}
console.log(`\nfigure-diff compare: ${identical + held.length} frame(s) for ${kinds.join(', ')} unmoved against ${rel(manifestPath)} (recorded ${before.takenAt}).`);
console.log(`  ${identical} byte-identical, ${held.length} differing only inside the noise mask measured at record time, 0 moved.`);
for (const [id, g] of Object.entries(now.gates)) {
  console.log(`  ${id}: ${g.skipped ? 'not run (no subject)' : `exit ${g.status}, ${Object.keys(g.frames).length} frame(s)`}`);
}
console.log("  Nothing this tool can see moved. What it cannot see is in its header.");
