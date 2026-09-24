// npm run theme: the reader's theme is on the page before the page is first styled.
//
// Claim: on every published page that loads the shell (tools/lib/shell-pages.js — the library, both
// books' contents pages, every chapter, Today and the lab), in each of the seven situations below,
// `data-theme` on <html> is the theme the page is to be drawn in from the moment <body> is inserted to the
// moment the handshake is ready — at every instant of that interval, not only at its two ends — and it is
// the value the shell leaves on <html> there:
//
//   stored-dark-on-light   the system prefers light and the reader chose dark         -> "dark" from the start
//   stored-light-on-dark   the system prefers dark and the reader chose light         -> "light"
//   url-dark-on-light      ?theme=dark on a light system, nothing stored             -> "dark", and nothing stored
//   url-light-on-dark      ?theme=light on a dark system over a stored "dark"        -> "light", and "dark" still stored
//   nothing-chosen         a dark system, nothing stored, no ?theme=                -> no attribute: the CSS follows the system
//   getitem-throws         a stored "dark" that localStorage.getItem refuses to read -> no attribute
//   storage-blocked        the localStorage accessor itself throws                   -> no attribute
//
// In every one the page must also reach the handshake with no console error, page error or failed
// request, and show its content — a <main> with a laid-out box and text in it — which is what the two
// throwing situations are for: a script in <head> that let a storage error escape would leave the page
// in whatever theme the system chose, and one that broke the page would break it before anything drew.
//
// Why: docs/learning/defect-register.md, 2026-09-22. src/shell.js applied the reader's theme while its
// module evaluated, after the page had already been styled once in the system's theme, so a reader whose
// choice differed saw one to three frames of the whole page in the other theme and then its titles fade
// across over 240 ms — measured on Today in 6 of 6 loads, the biology contents page 5 of 6, chapter 1 4 of
// 6 and the library 2 of 6. The fix is the block in src/theme-early.js that every such page carries in its
// <head>. test/theme-early.test.js holds each page's copy of it as text; this holds what it does.
//
// How it is read, and why it does not depend on timing. An init script installs a MutationObserver on the
// document before the page's first byte is parsed, watching child insertions and the `data-theme`
// attribute with its old value. Records arrive in the order the mutations happened, whenever the callback
// runs, so the value at the moment <body> went in is the old value of the first `data-theme` change after
// that insertion, or, if there was none, the value the attribute still has. Every later change's old value
// is the value the attribute held since the change before it, so those old values and the value at the
// handshake cover the whole interval between them: one that is not the page's theme is a stretch of the
// load drawn in the other theme, however briefly (review finding R4, 2026-09-23: the first version read
// only the two ends, and passed a shell that removed the attribute and put it back after an await). No
// wall clock and no frame count enters it: a slower machine delivers the same records in the same order.
//
// The instruments are checked, so a broken probe cannot pass as a clean page: the emulated colour scheme
// must read back as the one the situation asked for (otherwise it is not the opposite of the reader's
// choice and measures nothing); the observer must have seen <body> inserted; and in the two throwing
// situations the page's own code must have hit the throw at least once.
//
// Bound: Chromium only, one viewport (1024x768), and no `?eager=1` — the figures are not the subject, so
// the handshake here is the shell and any <tb-sitting>, not every figure. It proves the attribute. That
// tokens.css answers the attribute with the right colours is test/palette.test.js's and test/theme.test.js's;
// that nothing on a loaded page is still moving is the settle wait in `npm run shot`. It cannot see a
// flash that happens in the right theme — a stylesheet or a font arriving late — and says nothing about
// WebKit or Gecko, which run the same classic script at the same point of the parse but are not loaded
// here. THEME_PAGES trims the page list; a trimmed run proves only the pages it names, and says so.
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS, PAGES } from './lib/browser.js';
import { trim, PAGE_HINT } from './lib/trim.js';
import { shellPages } from './lib/shell-pages.js';
import { THEME_KEY } from '../src/theme-early.js';

const SCENARIOS = [
  { id: 'stored-dark-on-light', scheme: 'light', stored: 'dark', query: null, expect: 'dark' },
  { id: 'stored-light-on-dark', scheme: 'dark', stored: 'light', query: null, expect: 'light' },
  { id: 'url-dark-on-light', scheme: 'light', stored: null, query: 'dark', expect: 'dark' },
  { id: 'url-light-on-dark', scheme: 'dark', stored: 'dark', query: 'light', expect: 'light' },
  { id: 'nothing-chosen', scheme: 'dark', stored: null, query: null, expect: null },
  { id: 'getitem-throws', scheme: 'light', stored: 'dark', query: null, breakStorage: 'getItem', expect: null },
  { id: 'storage-blocked', scheme: 'light', stored: 'dark', query: null, breakStorage: 'accessor', expect: null },
];

const discovered = shellPages();
if (!discovered.length) {
  console.error('FAIL: tools/lib/shell-pages.js found no published page that loads src/shell.js, so this gate would load nothing and pass. The walk is broken, not the site: test/theme-early.test.js derives the same population a second way and will say which half disagrees.');
  process.exit(1);
}
// A page the other gates visit keeps their id (`biology/ch01`); the lab, which none of them visits, is
// named by its directory.
const idOfPath = new Map(PAGES.map((p) => [p.path, p.id]));
const ALL = discovered.map((p) => ({ ...p, id: idOfPath.get(p.path) ?? (p.path.replace(/^\/|\/$/g, '') || p.file) }));
const pages = trim('THEME_PAGES', ALL, { idOf: (p) => p.id, noun: 'page', hint: PAGE_HINT });

// Runs in the page before any of its scripts, on every document the page loads.
function installProbe({ key, stored, breakStorage }) {
  // `after` holds, in order, the old value of every `data-theme` change after <body> went in: the first is
  // the value at <body>, and each later one is the value held since the change before it.
  const probe = { bodySeen: false, atBody: null, settled: false, after: [], throws: 0, getItem: Storage.prototype.getItem, storage: null };
  // Seed first, so that the page's own read is the first read, and keep hold of the real store so it can
  // be read back after the page's own way to it has been broken. The initial about:blank has no storage.
  try {
    probe.storage = window.localStorage;
    if (stored !== null) probe.storage.setItem(key, stored);
  } catch { /* about:blank */ }
  if (breakStorage === 'getItem') {
    Storage.prototype.getItem = function getItem() {
      probe.throws += 1;
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
  } else if (breakStorage === 'accessor') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        probe.throws += 1;
        throw new DOMException('Access is denied for this document.', 'SecurityError');
      },
    });
  }
  const take = (records) => {
    for (const r of records) {
      if (r.type === 'childList') {
        if (!probe.bodySeen) for (const n of r.addedNodes) if (n.nodeName === 'BODY') probe.bodySeen = true;
      } else if (r.attributeName === 'data-theme' && r.target === document.documentElement && probe.bodySeen) {
        probe.after.push(r.oldValue);
        if (!probe.settled) {
          probe.atBody = r.oldValue;
          probe.settled = true;
        }
      }
    }
  };
  const observer = new MutationObserver(take);
  observer.observe(document, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-theme'] });
  Object.defineProperty(window, '__tbThemeProbe', {
    value: {
      read() {
        take(observer.takeRecords());
        const html = document.documentElement;
        let storedAfter;
        try { storedAfter = probe.getItem.call(probe.storage, key); } catch { storedAfter = '(unreadable)'; }
        const main = document.querySelector('main');
        const box = main?.getBoundingClientRect();
        return {
          bodySeen: probe.bodySeen,
          atBody: probe.settled ? probe.atBody : (probe.bodySeen ? html.getAttribute('data-theme') : null),
          after: probe.after.slice(),
          final: html.getAttribute('data-theme'),
          scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          throws: probe.throws,
          storedAfter,
          main: main ? { height: Math.round(box.height), chars: main.innerText.trim().length } : null,
        };
      },
    },
  });
}

const show = (v) => (v === null || v === undefined ? 'absent' : `"${v}"`);

const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
let loads = 0;
let failures = 0;
try {
  for (const pageDef of pages) {
    for (const sc of SCENARIOS) {
      const label = `${pageDef.id} ${sc.id}`;
      const context = await browser.newContext({ colorScheme: sc.scheme, viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });
      await context.addInitScript(installProbe, { key: THEME_KEY, stored: sc.stored, breakStorage: sc.breakStorage ?? null });
      const page = await context.newPage();
      page.setDefaultTimeout(ACTION_TIMEOUT_MS);
      const errors = collectErrors(page);
      const problems = [];
      let r = null;
      const started = Date.now();
      try {
        await openPage(page, `${server.url}${pageDef.path}${sc.query ? `?theme=${sc.query}` : ''}`);
        r = await page.evaluate(() => window.__tbThemeProbe.read());
      } catch (err) {
        problems.push(err.message.split('\n')[0]);
      }
      if (r) {
        if (r.scheme !== sc.scheme) problems.push(`the emulated colour scheme reads back "${r.scheme}", not the "${sc.scheme}" this situation asked for, so it is not the opposite of the reader's choice and measures nothing. The instrument is broken, not the page.`);
        if (!r.bodySeen) problems.push('the observer installed before the page loaded never saw <body> inserted, so it cannot say what the theme was at that moment. The instrument is broken, not the page.');
        if (sc.breakStorage && r.throws < 1) problems.push(`storage was set to throw (${sc.breakStorage}) and nothing on the page reached for it, so this situation tested nothing. The instrument is broken, not the page.`);
        if (r.bodySeen && r.atBody !== sc.expect) {
          const flash = sc.expect && r.atBody === null
            ? ` Nothing had applied the reader's theme by then, so the page is first styled in the system's "${sc.scheme}" and the shell switches it to "${sc.expect}" later: that is the flash, and then every title with a colour transition fading across. The page's <head> is missing the block from src/theme-early.js, carries a copy that has drifted from it, or no longer runs it before <body> — test/theme-early.test.js says which, and prints the block.`
            : '';
          problems.push(`data-theme on <html> was ${show(r.atBody)} when <body> was inserted, where this page should be drawn ${sc.expect ? `"${sc.expect}"` : 'with no attribute, following the system'} from its first frame.${flash}`);
        }
        // The interval, not its two ends (review finding R4). The first old value is the value at <body>,
        // judged above; each later one is what <html> carried between two changes before the handshake.
        r.after.forEach((old, i) => {
          if (i === 0 || old === sc.expect) return;
          problems.push(`after <body> was inserted, data-theme changed ${r.after.length} time(s) before the handshake, and between change ${i} and change ${i + 1} it was ${show(old)}, where this page is drawn ${sc.expect ? `"${sc.expect}"` : 'with no attribute, following the system'} from <body> to the handshake. For that stretch the page was styled in another theme: the flash again, in the middle of the load instead of before it. Something after the block in <head> removed or replaced the attribute and then put it back; src/shell.js's applyTheme is where the page writes it, and during a load it may only write the value the block already set.`);
        });
        if (r.final !== sc.expect) problems.push(`the shell left data-theme ${show(r.final)} once the handshake was ready, where this situation gives ${show(sc.expect)}.`);
        // Only when something WAS applied before <body>: a missing block is the message above, not a drift.
        if (r.bodySeen && r.atBody !== null && r.atBody !== r.final) problems.push(`the theme at <body> (${show(r.atBody)}) and the theme the shell left (${show(r.final)}) disagree, so the block in <head> and src/shell.js no longer resolve the reader's theme the same way; one of them has drifted from the rule in src/theme-early.js's header.`);
        if (!sc.breakStorage && r.storedAfter !== sc.stored) problems.push(`localStorage "${THEME_KEY}" is ${show(r.storedAfter)} after the load and was ${show(sc.stored)} before it: ${sc.query ? '?theme= is for one page load and is never stored' : 'loading a page must not change the reader\'s stored choice'}.`);
        if (!r.main) problems.push('the page reached the handshake with no <main> element, so whether it shows its content cannot be read.');
        else if (r.main.height < 1 || r.main.chars < 1) problems.push(`the page reached the handshake and shows nothing: <main> is ${r.main.height} px high with ${r.main.chars} character(s) of text.`);
      }
      for (const e of errors) problems.push(e);
      await context.close();
      loads += 1;
      const ms = Date.now() - started;
      if (problems.length) {
        failures += 1;
        console.log(`FAIL ${label} (${ms} ms)`);
        for (const p of problems) console.log(`  ${p}`);
      } else {
        const storage = sc.breakStorage ? `${r.throws} storage throw(s) survived` : `"${THEME_KEY}" ${show(r.storedAfter)} before and after`;
        // How many changes the interval held is printed on every clean line, so a page whose attribute was
        // never written after <body> does not read the same as one written and checked.
        const changes = `${r.after.length} change(s) between <body> and the handshake${r.after.length ? `, every one from ${show(sc.expect)}` : ''}`;
        console.log(`ok   ${label} (${ms} ms, system ${r.scheme}, at <body> ${show(r.atBody)}, ${changes}, after the handshake ${show(r.final)}, ${storage}, <main> ${r.main.height} px)`);
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}
const judged = pages.map((p) => p.id);
const unjudged = ALL.filter((p) => !judged.includes(p.id)).map((p) => p.id);
const scope = unjudged.length ? ` — a trimmed run: judged ${judged.join(', ')}; NOT judged ${unjudged.join(', ')}` : ` — every page that loads the shell: ${judged.join(', ')}`;
if (failures) {
  console.error(`FAIL: ${failures} of ${loads} load(s) had problems${scope}`);
  process.exit(1);
}
console.log(`theme: ${loads} load(s) clean, ${SCENARIOS.length} situation(s) on each of ${pages.length} page(s)${scope}`);
