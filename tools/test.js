// npm test: the unit tests, then the content check, then the page shots, then the reader flows, then the
// figure controls, then a study sitting, then the figures at phone width, then nine emulated devices,
// then the 3D sweep, then the site as GitHub Pages will serve it. Ten steps.
// Each step runs as its own process with inherited stdio; the first non-zero exit stops the run and is
// reported by name, so a red run always says which gate went red. There is no pipe anywhere in this
// file: a pipeline reports its last stage's status, not the gate's.
// Before the first step, and in this process, a preflight checks that the unit glob still runs every
// test file on disk and that every test file Git tracks is still there. The unit step is a glob over
// the files the disk happens to hold, so without it a deleted test file is a suite with one fewer test
// and the same green result — a gate reporting "did not run" as "passed".
import { spawnSync } from 'node:child_process';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const posix = (path) => path.split(sep).join('/');

// Every gate below is spawned with the quiet-browser preload ahead of its script.
//
// Why here and not in `tools/lib/browser.js`. `tools/zj-quiet-browser.cjs` patches `chromium.launch()`
// on playwright's own browser type, so ONE preload covers every launch in a process — including the
// launches that do not go through `lib/browser.js`, such as `tools/devices.js`'s WebKit and Firefox
// arms. Putting the three flags into `launch()` instead would cover only this repository's helper and
// leave those unquiet, and two mechanisms merging one flag list drift apart. So the wrapper stays the
// only place the flags are written, and the wiring is what makes it load.
//
// It did not load. Measured 2026-09-16 (`out/gpu/quiet-engaged.mjs`): a plain `node tools/devices.js`
// read back a 53-argument chromium command line with `--noerrdialogs --disable-crash-reporter
// --disable-features=Crashpad` all absent and `NODE_OPTIONS` unset, because nothing in this repository
// ever set it — the mitigation the wrapper exists for was inert in every run, while the unit test that
// asserts the wrapper's flag list stayed green (it says in its own header that it cannot see a patch
// that fails to apply). Recorded in docs/learning/defect-register.md.
//
// `.cjs` is spelled out because it has to be: this package is `"type": "module"`, and `--require
// ./tools/zj-quiet-browser` fails with MODULE_NOT_FOUND on Node 24 (measured). Forward slashes so the
// argument is the same string on Windows as anywhere else.
const QUIET_PRELOAD = `--require=${posix(join(ROOT, 'tools', 'zj-quiet-browser.cjs'))}`;

function run(label, args) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, [QUIET_PRELOAD, ...args], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`FAIL: ${label} exited with ${result.status ?? result.signal}`);
    process.exit(result.status || 1);
  }
}

function fail(lines) {
  for (const line of Array.isArray(lines) ? lines : [lines]) console.error(line);
  process.exit(1);
}

// ── before the first step: the suite the steps below run is the whole suite ───────────────────────
//
// The unit step is a glob over the files the disk happens to hold — `node --test test/*.test.js` —
// so a deleted test file is a suite with one fewer test and the same green result. That is the shape
// docs/policies/local-rules.md records under "a check must fail when its subject is missing", one
// level up from the checks themselves: a gate that reports "did not run" as "passed". It has already
// happened here. `test/control-chars.test.js` was written on 2026-09-16 for a real defect, was
// referenced only by prose in docs/policies/local-rules.md, and nothing in the repository would have
// noticed its absence until it was committed.
//
// This runs in this process, before anything is spawned, because it is a question about the list of
// files the runner is about to use rather than a gate of its own: it costs milliseconds. Git's index
// is the instrument, not the disk, because the disk cannot tell a deleted test file from one that
// never existed; the disk is the second derivation, so a file Git does not track yet is still caught
// when the glob would not run it. Adding a test file is not punished in either direction: a new
// top-level `test/*.test.js`, tracked or not, passes, and the count below goes up.
//
// What it notices: a test file Git tracks that is not on disk; a `*.test.js` file on disk, tracked or
// not, that UNIT_GLOB does not run; a glob that matches no file; and the unit command being spelled
// differently here and in package.json. What it does NOT notice: a deletion that has been committed —
// Git no longer lists the file, so neither the disk nor the index records that it existed, and only
// review reads the history — and a test file that is not named `*.test.js`, which is the convention
// this repository states (a test lives at `test/<name>.test.js`).
const UNIT_GLOB = 'test/*.test.js';
const NEVER_UNIT = ['.git/', 'node_modules/', 'out/', 'progress/'];

// Git's own record of the test files, which is the only thing that can say one is missing.
function trackedTestFiles() {
  const git = spawnSync('git', ['ls-files', '-z', '--', '*.test.js'], { cwd: ROOT, encoding: 'utf8' });
  if (git.error || git.status !== 0) {
    fail([
      `FAIL: test files — git ls-files exited ${git.error ? git.error.message : git.status}, so this check cannot read the repository's record of which test files exist and would compare nothing.`,
      '  Run the gate in a Git checkout with git on PATH: only Git can tell a test file deleted from the disk from one that never existed. Nothing was spawned.',
    ]);
  }
  return git.stdout.split('\0').filter(Boolean).map(posix);
}

function checkTestFiles() {
  console.log(`\n== test files (every *.test.js on disk is run, and every one Git tracks is on disk) ==`);
  if (typeof globSync !== 'function') {
    fail(`FAIL: test files — fs.globSync is not available on ${process.version}, so this check cannot expand the unit glob and would pass by not looking. It is in Node 22 and this repository pins Node 24 in .nvmrc.`);
  }
  const declared = /["']([^"']*\.test\.js)["']/.exec(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts?.unit ?? '')?.[1];
  if (declared !== UNIT_GLOB) {
    fail([
      `FAIL: test files — npm run unit runs ${JSON.stringify(declared ?? '(no .test.js glob in the command)')} and this runner runs ${JSON.stringify(UNIT_GLOB)}.`,
      '  Two spellings of one suite drift apart: a test file runs under the command a person types and not under the gate, or the other way round. Make them one string, here and in package.json.',
    ]);
  }

  const willRun = new Set(globSync(UNIT_GLOB, { cwd: ROOT }).map(posix));
  if (!willRun.size) {
    fail(`FAIL: test files — ${UNIT_GLOB} matches no file at all, so the unit step below would spawn a runner with nothing to run and exit 0. This check exists because that must not read as a pass.`);
  }
  const tracked = trackedTestFiles();
  if (!tracked.length) {
    fail('FAIL: test files — git ls-files lists no *.test.js at all, so the half of this check that catches a deleted test file compared nothing. If the test files moved, point that pathspec at where they went.');
  }
  const onDisk = new Set(globSync('**/*.test.js', { cwd: ROOT }).map(posix).filter((path) => !NEVER_UNIT.some((dir) => path.startsWith(dir))));
  for (const path of tracked) if (existsSync(join(ROOT, path))) onDisk.add(path);

  const notRun = [...onDisk].filter((path) => !willRun.has(path)).sort();
  if (notRun.length) {
    fail([
      `FAIL: test files — ${notRun.length} test file(s) are on disk and ${UNIT_GLOB} does not run them, so their tests would never execute and this gate would be green over them:`,
      ...notRun.map((path) => `  ${path}`),
      '  Move each under test/, or widen UNIT_GLOB here and in package.json — widening the glob is a decision to state in both places, because a glob that quietly stopped matching is the defect this catches.',
    ]);
  }
  const missing = tracked.filter((path) => !existsSync(join(ROOT, path))).sort();
  if (missing.length) {
    fail([
      `FAIL: test files — ${missing.length} test file(s) are tracked by Git and not on disk, so the unit step below would run one fewer file and still exit 0:`,
      ...missing.map((path) => `  ${path}`),
      '  Restore each with `git restore <path>`. If a test was removed on purpose, commit the removal and say why: a deletion in the working tree is a lost gate until it is recorded.',
    ]);
  }
  console.log(`ok: ${willRun.size} test file(s) run by ${UNIT_GLOB}, ${onDisk.size} on disk, ${tracked.length} tracked by Git`);
}
checkTestFiles();

// Node 24 given a bare directory runs one bogus test named "test" and fails it; the glob is what
// runs the files (88 tests on 2026-09-10, versus 1 failing with `test/`). The preflight above is what
// keeps that glob from being a shrinking list.
run(`unit tests (node --test ${UNIT_GLOB})`, ['--test', UNIT_GLOB]);
run('content check (tools/check-content.js)', ['tools/check-content.js']);
run('page shots (tools/shot.js)', ['tools/shot.js']);
run('reader flows (tools/flow.js)', ['tools/flow.js']);
run('figure controls (tools/drive.js)', ['tools/drive.js']);
run('a study sitting (tools/sitting.js)', ['tools/sitting.js']);
run('figures at phone width (tools/narrow.js)', ['tools/narrow.js']);
// The device gate belongs in the chain, not beside it. It was written as the answer to the owner's
// instruction after four defects they found on a real phone, and a gate that has to be remembered is a
// gate that does not run: it emulates devices with the input they actually have, where every other gate
// here sets a narrow viewport on a desktop browser with a mouse.
run('real devices (tools/devices.js)', ['tools/devices.js']);
run('3D sweep (tools/sweep3d.js)', ['tools/sweep3d.js']);
// Last, because it is the slowest and the least likely to be the thing you broke: it rebuilds the
// published tree and loads every page under the /textbook/ subpath GitHub Pages serves it at. The
// site is deployed from main on every push, so "it works at the root" is not the claim that matters.
run('published subpath (tools/subpath.js)', ['tools/subpath.js']);
console.log('\nPASS');
