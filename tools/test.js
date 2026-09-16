// npm test: the unit tests, then the content check, then the page shots, then the reader flows, then the
// figure controls, then a study sitting, then the figures at phone width, then nine emulated devices,
// then the 3D sweep, then the site as GitHub Pages will serve it. Ten steps.
// Each step runs as its own process with inherited stdio; the first non-zero exit stops the run and is
// reported by name, so a red run always says which gate went red. There is no pipe anywhere in this
// file: a pipeline reports its last stage's status, not the gate's.
import { spawnSync } from 'node:child_process';

function run(label, args) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`FAIL: ${label} exited with ${result.status ?? result.signal}`);
    process.exit(result.status || 1);
  }
}

// Node 24 given a bare directory runs one bogus test named "test" and fails it; the glob is what
// runs the files (88 tests on 2026-09-10, versus 1 failing with `test/`).
run('unit tests (node --test "test/*.test.js")', ['--test', 'test/*.test.js']);
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
