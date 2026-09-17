// A preloaded patch that stops chromium's crash dialog from ever appearing on this machine.
//
// Why this exists: a chromium process that hits its internal breakpoint (0x80000003) puts up a modal
// `chrome-headless-shell.exe - Application Error` window and then waits for a click. The window is
// raised by the browser, not by the gate, so it survives the Node process that started it, blocks the
// desktop, and reads as the gate misbehaving. The owner reported it on 2026-09-12 while a gate run was
// in flight (docs/learning/defect-register.md).
//
// Measured before writing this (out/probe-browser/report.json): three plain launches — Playwright's
// defaults, the repo's `--enable-unsafe-swiftshader --ignore-gpu-blocklist`, and a quiet variant — all
// rendered and closed cleanly, so the dialog is not raised by starting a browser. It comes from a crash
// inside one, which is what these flags suppress.
//
// Applied by `--require ./tools/zj-quiet-browser.cjs` on each `node` invocation — every browser-launching
// script in package.json carries it, and `tools/test.js`'s spawner prepends it to each gate it runs, so the
// gates inherit it. `--require` is evaluated before any ESM import, which is what makes ONE preload cover
// every `chromium.launch()` in the process without editing the gate that calls it — including launches
// that do not go through `tools/lib/browser.js`, such as the WebKit and Firefox arms in `tools/devices.js`.
//
// **It used to say `NODE_OPTIONS=--require=…`, and nothing in this repository ever set `NODE_OPTIONS`.** So
// the mitigation was inert in every run: measured 2026-09-16 (`out/gpu/preload-engaged.mjs`), a plain
// `node tools/devices.js` read back a 52-argument chromium command line with all three flags absent and no
// preload in the process's own execArgv, while this file and the unit test asserting its flag list stayed
// green. The flags were right; the wiring was missing, and a comment naming the wrong mechanism is what a
// reader would have trusted. Recorded in docs/learning/defect-register.md.
//
// `.cjs` is spelled out because it has to be: this package is `"type": "module"`, and `--require
// ./tools/zj-quiet-browser.cjs` without the extension fails with MODULE_NOT_FOUND on Node 24 (measured).
const QUIET_ARGS = ['--noerrdialogs', '--disable-crash-reporter', '--disable-features=Crashpad'];

// Appends to the caller's args rather than replacing them: a gate's own flags (`--enable-unsafe-swiftshader`
// for WebGL, an ANGLE backend) must survive, or every 3D figure goes red for a reason that reads like a
// rendering bug.
function quietArgs(args) {
  return [...(args || []), ...QUIET_ARGS];
}

function patch(playwright) {
  for (const name of ['chromium', 'firefox', 'webkit']) {
    const type = playwright[name];
    if (!type || type.__zjQuiet) continue;
    const original = type.launch.bind(type);
    type.launch = (options = {}) => original({ ...options, args: quietArgs(options.args) });
    type.__zjQuiet = true;
  }
  return playwright;
}

module.exports = { QUIET_ARGS, quietArgs, patch };

try {
  patch(require('playwright'));
} catch {
  // Playwright may not be resolvable for a plain Node run; the test imports `patch` and applies it itself.
}
