// npm run progress:export [-- --learner <id>] [--out <file>]
// npm run progress:import -- <file> [--learner <id>]
//
// The reader's study record lives in `progress/<learner>.jsonl`, which is git-ignored: it is raw
// evidence and it is theirs (docs/design/adaptive.md). These two commands are how it survives and how
// it gets in from somewhere else.
//
// Export writes a timestamped copy, because the working file is one `rm -rf out progress` away from
// gone and nothing in Git carries it.
//
// Import takes the JSON that the book's own export button produces in a browser, which is the only way
// a sitting read on a phone or on the published site reaches the agent: there is no server there, so
// the events sat in that browser's localStorage until someone carried them over. It merges rather than
// replaces, and it drops events already present, so importing the same file twice is safe.
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'progress');

const LEARNER_RE = /^[a-z0-9_-]{1,32}$/;

function parseArgs(argv) {
  const out = { mode: argv[0], learner: 'default', file: null, out: null };
  for (let i = 1; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--learner') out.learner = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (!a.startsWith('--')) out.file = a;
    else throw new Error(`unknown argument "${a}"; expected --learner or --out, or a file path`);
  }
  if (out.mode !== 'export' && out.mode !== 'import') {
    throw new Error(`progress needs a mode: "export" or "import", not "${out.mode ?? '(nothing)'}"`);
  }
  if (!LEARNER_RE.test(out.learner)) {
    throw new Error(`learner "${out.learner}" is not usable as a file name; use 1 to 32 characters of a-z, 0-9, underscore or hyphen`);
  }
  if (out.mode === 'import' && !out.file) {
    throw new Error('import needs the file to read, for example: npm run progress:import -- my-export.json');
  }
  return out;
}

// One event per line. A line that will not parse is reported and skipped rather than killing the run:
// a truncated last line is what a crash mid-append looks like, and the rest of the record is fine.
function readLog(path) {
  if (!existsSync(path)) return { events: [], bad: 0 };
  const events = [];
  let bad = 0;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const s = line.trim();
    if (!s) continue;
    try {
      events.push(JSON.parse(s));
    } catch {
      bad += 1;
    }
  }
  return { events, bad };
}

// Two events are the same event if the same learner recorded the same answer to the same item at the
// same instant. Nothing else is stable across a browser export.
const keyOf = (e) => `${e.t}|${e.item ?? ''}|${e.objective ?? ''}|${e.outcome ?? ''}`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const log = join(DIR, `${opts.learner}.jsonl`);

  if (opts.mode === 'export') {
    const { events, bad } = readLog(log);
    if (!events.length) {
      console.log(`No study record yet for "${opts.learner}" (looked in ${log}). Read a chapter and answer something first.`);
      return;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const out = opts.out || join(DIR, `export-${opts.learner}-${stamp}.json`);
    mkdirSync(dirname(out), { recursive: true });
    const first = events[0].t;
    const last = events[events.length - 1].t;
    writeFileSync(out, JSON.stringify({ learner: opts.learner, exported: new Date().toISOString(), events }, null, 2));
    console.log(`Wrote ${events.length} events to ${out}`);
    console.log(`  covering ${first} to ${last}`);
    if (bad) console.log(`  ${bad} unreadable line(s) in ${log} were skipped`);
    return;
  }

  const raw = readFileSync(opts.file, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${opts.file} is not valid JSON (${err.message}); it should be the file the book's export button produced`);
  }
  const incoming = Array.isArray(parsed) ? parsed : parsed.events;
  if (!Array.isArray(incoming)) {
    throw new Error(`${opts.file} has no events: expected an array, or an object with an "events" array, and found ${typeof parsed}`);
  }
  const { events: existing, bad } = readLog(log);
  const seen = new Set(existing.map(keyOf));
  const fresh = incoming.filter((e) => e && e.t && !seen.has(keyOf(e)));
  mkdirSync(DIR, { recursive: true });
  if (fresh.length) appendFileSync(log, `${fresh.map((e) => JSON.stringify(e)).join('\n')}\n`);
  console.log(`Imported ${fresh.length} new event(s) into ${log}`);
  console.log(`  ${incoming.length - fresh.length} were already there, ${existing.length + fresh.length} in the record now`);
  if (bad) console.log(`  ${bad} unreadable line(s) already in the record were left alone`);
  if (fresh.length) console.log('Run `npm run review` to see what it says.');
}

const isMain = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isMain) {
  try {
    main();
  } catch (err) {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  }
}

export { readLog, keyOf, parseArgs };
