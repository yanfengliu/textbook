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
// Used through NODE_OPTIONS=--require=./tools/zj-quiet-browser.cjs, which applies before any ESM import,
// so every `chromium.launch()` in the process is covered without editing the gate that calls it. The
// shared gate files (`tools/lib/browser.js`, `tools/shot.js`) are deliberately not changed by this round:
// another worker owns them, and the second book does not need to edit them to ship.
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
