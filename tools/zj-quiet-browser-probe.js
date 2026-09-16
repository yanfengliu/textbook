// The behavioural half of the browser-quiet check — the part that needs a browser, kept out of `npm run
// unit` on purpose.
//
// Claim: a chromium launched through the quiet-browser wrapper is really started with
// `--noerrdialogs --disable-crash-reporter --disable-features=Crashpad`, and with the caller's own flags
// kept. It reads the RUNNING browser's command line back through CDP, so it cannot pass on flags that
// merely appear in a file.
//
// Why it is not a unit test: `npm test`'s first step is `node --test test/*.test.js`, chosen because it is
// the cheapest gate and needs nothing but Node. A test that launches a browser makes that step depend on
// a downloaded chromium and on a session able to open a named pipe, and in a session that cannot, every
// such launch dies with `browserType.launch: spawn EPERM` — which reads as a repository defect. Measured
// 2026-09-12. So this is a probe: run it deliberately, on a machine that can open a browser.
//
// Run:
//   node tools/zj-quiet-browser-probe.js
// Exit code 0 with a printed flag list, or 1 with the missing flags named.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const wrapperPath = fileURLToPath(new URL('./zj-quiet-browser.cjs', import.meta.url));
const { QUIET_ARGS, patch } = require(wrapperPath);

// Literal, not read from the wrapper: reading it back would make this probe agree with whatever the
// wrapper says, and deleting a flag would then still pass the only check that launches a browser.
const EXPECTED = ['--noerrdialogs', '--disable-crash-reporter', '--disable-features=Crashpad'];
const GATE_FLAGS = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

const { chromium } = require('playwright');
patch({ chromium });

let browser;
try {
  // `Browser.getBrowserCommandLine` refuses to answer unless `--enable-automation` is set, and that is
  // also the only way to read the browser's own argv from inside it. Both facts cost an attempt each.
  browser = await chromium.launch({ args: [...GATE_FLAGS, '--enable-automation'] });
  const cdp = await browser.newBrowserCDPSession();
  const { arguments: flags } = await cdp.send('Browser.getBrowserCommandLine');
  if (!Array.isArray(flags) || !flags.length) {
    console.error('FAIL: the browser returned no command line, so this probe checked nothing');
    process.exit(1);
  }
  const missing = [...EXPECTED, ...GATE_FLAGS].filter((f) => !flags.includes(f));
  console.log(`browser flags read back: ${flags.length} arguments`);
  console.log(`  quiet flags expected: ${EXPECTED.join(' ')}`);
  console.log(`  gate flags expected:  ${GATE_FLAGS.join(' ')}`);
  if (missing.length) {
    console.error(`FAIL: the browser was started without ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('ok: every quiet flag and every gate flag reached the running browser');
  console.log(`     (wrapper declares: ${QUIET_ARGS.join(' ')})`);
} catch (err) {
  console.error(`FAIL: could not reach a running browser: ${err.message.split('\n')[0]}`);
  console.error('      a session that cannot open a named pipe cannot run this probe; that is the environment, not the repository');
  process.exit(1);
} finally {
  if (browser) await browser.close();
}
