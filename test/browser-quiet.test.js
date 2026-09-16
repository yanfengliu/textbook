// The browser-quiet check, source half.
//
// Claim: `tools/zj-quiet-browser.cjs` declares the flags that suppress chromium's crash dialog, and
// applies them by APPENDING to a launch's own args rather than replacing them.
//
// Why it exists: chromium reports an internal breakpoint (0x80000003) by putting up a modal
// `chrome-headless-shell.exe - Application Error` window. The window is raised by the browser, so it
// outlives the Node process that started it, blocks the desktop, and reads as the gate misbehaving. The
// owner reported it on 2026-09-12 while a gate run was in flight (docs/learning/defect-register.md).
//
// Why this file does NOT launch a browser, and where that check went instead. The first version of this
// test called `chromium.launch()` and read the running command line back. That is better evidence, and it
// was wrong to put here: `npm test` runs this directory as its FIRST step, on the grounds that it is the
// cheapest gate and needs nothing but Node, and a test that launches a browser makes the cheapest gate
// depend on a downloaded chromium and on a session that can open a named pipe. Measured 2026-09-12 in a
// session that could not: every such launch dies with `browserType.launch: spawn EPERM`, which reads as a
// repository defect. So the launch assertion lives in `tools/zj-quiet-browser-probe.js`, which is run
// deliberately and needs a browser, and this file checks what can be checked without one.
//
// What that costs, stated rather than glossed: this half cannot see a patch that silently fails to apply.
// It proves the intent, the flag list, and the merge function. The probe proves the effect.
//
// Bound: text and behaviour of one module's argument handling. Nothing here says a dialog never appears —
// that is environment, and a headless browser cannot observe its own process's windows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const WRAPPER = fileURLToPath(new URL('../tools/zj-quiet-browser.cjs', import.meta.url));
const require = createRequire(import.meta.url);

// Written out as literals on purpose. Reading them from the module's own QUIET_ARGS would make this test
// agree with whatever the wrapper happens to say, so deleting a flag from the wrapper would pass it.
// Proved red by deleting `--noerrdialogs` (docs/learning/gate-proofs.md).
const EXPECTED_FLAGS = ['--noerrdialogs', '--disable-crash-reporter', '--disable-features=Crashpad'];

test('the quiet-browser wrapper declares every flag the dialog needs suppressed', () => {
  const { QUIET_ARGS } = require(WRAPPER);
  assert.deepEqual(QUIET_ARGS.slice().sort(), EXPECTED_FLAGS.slice().sort(),
    'the wrapper\'s flags and this test\'s expectation disagree; change both deliberately and update the defect register entry');
});

test('the quiet flags are appended to a launch that already has some, never replacing them', () => {
  const { quietArgs } = require(WRAPPER);
  const gateArgs = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const merged = quietArgs(gateArgs);
  for (const flag of gateArgs) {
    assert.ok(merged.includes(flag), `${flag} was dropped; a gate's own flags must survive the patch, or every 3D figure goes red for a reason that reads like a rendering bug`);
  }
  for (const flag of EXPECTED_FLAGS) assert.ok(merged.includes(flag), `${flag} is missing from the patched args`);
  assert.deepEqual(quietArgs(), EXPECTED_FLAGS, 'a launch with no args of its own must still get the quiet flags');
});

test('the wrapper patches a browser type rather than a single launch', () => {
  // `patch` is applied through NODE_OPTIONS before any ESM import, so every `chromium.launch()` in the
  // process is covered. A patch that hooked one call would leave every other gate unquiet, which is the
  // failure this asserts against — a fake playwright object, no browser involved.
  const { patch, quietArgs } = require(WRAPPER);
  const calls = [];
  const fake = () => ({ launch: (options) => { calls.push(options); return 'launched'; } });
  const playwright = { chromium: fake(), firefox: fake(), webkit: fake() };
  patch(playwright);
  for (const engine of ['chromium', 'firefox', 'webkit']) {
    playwright[engine].launch({ args: ['--enable-unsafe-swiftshader'] });
  }
  assert.equal(calls.length, 3, 'patch() did not reach all three browser types');
  for (const options of calls) {
    assert.deepEqual(options.args, quietArgs(['--enable-unsafe-swiftshader']),
      'a patched launch was not given the merged args; NODE_OPTIONS preloading covers every launch, so this is the whole mechanism');
  }
  assert.ok(!readFileSync(WRAPPER, 'utf8').includes('TODO'), 'the wrapper still carries a TODO');
});
