// One fetch per distinct external URL per gate run, instead of one per page load.
//
// What the gates fetch from outside: the fonts from `fonts.googleapis.com` and `fonts.gstatic.com`, and
// the pinned Three.js from `cdn.jsdelivr.net`. Every page load asks for them, and every gate here opens a
// FRESH browser context per load (`browser.newPage()` makes its own context), so chromium's HTTP cache is
// empty every single time: `npm run shot` does that 66 times, `npm run narrow` and `npm run legible` 72
// each, `npm run subpath` 48.
//
// What it is worth, measured rather than assumed — and it is LESS than it looks (out/netprobe/netprobe.json,
// 2026-09-16, five loads an arm, median, the same page in the same process):
//
//   chapter  cold 823 ms · cached 570 ms · cold again 692 ms   external 364 → 23 → 251 ms over 5 requests
//   lab      cold 291 ms · cached 158 ms                        external 104 → 3 ms over 2 requests
//   lab (3D) cold 957 ms · cached 755 ms                        external 245 → 28 ms over 5 requests
//
// The third column is the union of the busy intervals on those three origins, taken from the page's own
// Resource Timing, so overlapping requests are counted once. The "cold again" arm is the control: a cold
// arm on the far side of the cached one, because the cached arm runs second and gets a warmer local server
// and V8 cache for free, and without it that warming and this cache are the same number. It lands between
// the two, so the cache is worth roughly **130 to 250 ms a page load** and not the second a first reading
// of the cold/cached pair suggests. Over the whole chain that is tens of seconds, not minutes: real, free,
// and nowhere near the biggest thing wrong with these gates. An earlier draft of this comment claimed
// "1.06 s of a 1.94 s chapter load"; that number was written before the probe was run and was wrong.
//
// What this changes: the FIRST request for a URL in a run goes to the real network, exactly as before, and
// its bytes are kept. Every later request for that same URL, in any page or context of the same process, is
// answered from those bytes. Nothing about the response the page sees changes: the status, the headers and
// the body are the ones the network gave, replayed.
//
// What it therefore stops proving, stated plainly: that a CDN URL is reachable *on every page load*. It
// still proves it once per gate run — ten proofs per `npm test` rather than about three hundred — and the
// URL is one string in one file, so the 2nd through 300th fetch re-proved nothing the 1st did not. A URL
// that 404s, a DNS failure and an offline machine all still fail the run, on the first load, through the
// same `requestfailed` path as before: when the fetch fails, nothing is cached and the request is handed
// back to the browser to make and to fail for itself, so the error the gate reports is the browser's own.
//
// Keyed by url AND user agent, as a JSON pair rather than two strings joined by a separator. A NUL
// separator is what `tools/shot.js` used, and a literal control byte makes every tool that guesses a
// file's type refuse the whole file, so the refusal arrives as "binary file" rather than as the defect
// (docs/policies/local-rules.md, "A file a tool refuses to read is a defect in the tree";
// test/control-chars.test.js holds it). `JSON.stringify([ua, url])` is unambiguous and holds no
// control character at all. `fonts.googleapis.com` serves a different `@font-face` block to different
// browsers — woff2 to chromium, something else to an older UA — and `npm run devices` drives chromium,
// WebKit and Firefox in one process. One cache entry per URL would have handed Firefox chromium's
// stylesheet, which is a different rendering, so a shared entry would be a different page rather than a
// faster one.
//
// Not persisted to disk, deliberately. A cache that outlived the process would mean a run could pass with
// the CDN down, or with a URL that has stopped existing, for as long as the file sat there — and the
// staleness would be invisible. The memory dies with the gate.
//
// Bound: it covers the three origins in ORIGINS and nothing else; a page that starts fetching from a fourth
// host is not cached until that host is added here, which costs speed and never correctness. It does not
// cache anything the local server serves — those requests are never routed. `cacheStats()` is the
// instrument: a run prints how many URLs it fetched and how many requests it replayed, so a cache that
// silently did nothing reads as `0 replayed` rather than as a fast run. `NET_CACHE=0` turns it off for a
// run, which is both the way the saving was measured and the way to take the cache out of a font question.

// The off switch, and the reason there is one. `NET_CACHE=0` sends every external request to the network,
// which is what the gates did before this file existed. It is how the saving is measured — the same gate,
// on the same tree, with one variable moved, rather than two versions of a tool compared across a tree that
// moved between them — and it is how a font or CDN question is debugged when the replay is the suspect.
// Only `0` and `1` are accepted: a value this does not understand stops the run rather than being read as
// one of them, the same rule tools/lib/trim.js states for a name that matches nothing.
const RAW = process.env.NET_CACHE;
if (RAW !== undefined && RAW !== '0' && RAW !== '1' && RAW !== '') {
  console.error(`NET_CACHE=${JSON.stringify(RAW)} is not a value this understands, and guessing which one you meant would either cache when you asked for the network or ask the network when you asked for the cache. What would satisfy this: NET_CACHE=0 to fetch every external URL on every page load, NET_CACHE=1 or unset to fetch each one once per run (tools/lib/net-cache.js).`);
  process.exit(2);
}
const ENABLED = RAW !== '0';

/** The external origins the book's pages load from. Everything else goes straight to the network. */
export const ORIGINS = ['https://fonts.googleapis.com/', 'https://fonts.gstatic.com/', 'https://cdn.jsdelivr.net/'];

const PATTERNS = ORIGINS.map((o) => `${o}**`);

// key -> Promise<{ status, headers, body }>; one entry per (user agent, url).
const store = new Map();
let fetched = 0;
let replayed = 0;
let failed = 0;
let unreadable = 0;

// Headers that describe the transfer rather than the resource. The body handed to `fulfill` is already
// decoded and its length is the decoded length, so replaying the original `content-encoding` or
// `content-length` would describe bytes that are no longer there.
const DROP = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive', 'alt-svc']);

function keep(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) if (!DROP.has(k.toLowerCase())) out[k] = v;
  return out;
}

// The instrument prints itself, once, at the end of any process that routed a single request — rather
// than each gate remembering to print it. A cache that silently did nothing is the failure mode that
// matters here: it looks exactly like a fast run from outside, and it would quietly move the time it
// saved into a number a later session attributes to the network. `0 later request(s) replayed` says so.
let announced = false;
function announceOnce() {
  if (announced) return;
  announced = true;
  process.on('exit', () => {
    if (store.size) console.log(cacheLine());
  });
}

/**
 * Route this page's external requests through the run's memory.
 * @param {import('playwright').Page} page a page, freshly opened; call before `goto`.
 */
// Pages already routed. `openPage` is called once per page today, but a gate that navigated the same page
// twice would register the handlers twice, and the second registration would take every request while the
// first sat there — harmless for what the page receives, and enough to make `replayed` count a request
// twice, which is the one number this file offers as evidence about itself.
const routed = new WeakSet();

export async function cacheExternal(page) {
  if (!ENABLED || routed.has(page)) return;
  routed.add(page);
  announceOnce();
  // When the user agent cannot be read, this page gets a key of its own instead of an empty one. An
  // empty key would be SHARED by every page that failed the same way, including pages in different
  // engines, and the whole reason the key carries the user agent is that two engines must not be handed
  // each other's stylesheet. A key nothing else can match costs this page its replays and nothing else.
  const ua = await page.evaluate(() => navigator.userAgent).catch(() => `unread-${unreadable += 1}`);
  for (const pattern of PATTERNS) {
    await page.route(pattern, async (route) => {
      const url = route.request().url();
      const key = JSON.stringify([ua, url]);
      let entry = store.get(key);
      if (!entry) {
        entry = (async () => {
          const response = await route.fetch();
          return { status: response.status(), headers: keep(response.headers()), body: await response.body() };
        })();
        store.set(key, entry);
        try {
          const value = await entry;
          fetched += 1;
          await route.fulfill(value);
        } catch (err) {
          // The network said no. Drop the entry so the next load asks again, and hand the request back to
          // the browser so it makes it, fails it, and reports the failure in its own words through the
          // `requestfailed` listener every gate already has. A cache must never be the reason a run is
          // green, and must never be the reason a failure is described in the wrong words.
          store.delete(key);
          failed += 1;
          await route.fallback().catch(() => route.continue().catch(() => {}));
          void err;
        }
        return;
      }
      try {
        const value = await entry;
        replayed += 1;
        await route.fulfill(value);
      } catch {
        await route.fallback().catch(() => route.continue().catch(() => {}));
      }
    });
  }
}

/** What the cache did this run: distinct URLs fetched, requests replayed, fetches that failed. */
export function cacheStats() {
  return { urls: store.size, fetched, replayed, failed };
}

/** One line for a gate's summary, so a cache that did nothing says so. */
export function cacheLine() {
  const { urls, replayed, failed } = cacheStats();
  return `network: ${urls} external URL(s) fetched once, ${replayed} later request(s) replayed from memory${failed ? `, ${failed} fetch(es) failed and were handed back to the browser` : ''}`;
}
