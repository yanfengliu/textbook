// Zero-dependency static file server for the repo root. `npm run dev` serves http://localhost:8080/.
// The gates import startServer() and bind an ephemeral port so they never collide with a dev server.
//
// It also accepts POST /api/progress, the local half of docs/design/adaptive.md: the browser keeps the
// reader's record in localStorage and, when this server is running, mirrors each event here, one JSON
// object per line in progress/<learner>.jsonl. That file is the agent round's input (`npm run review`).
// Nothing leaves the machine, there is no account, and GET behaviour is untouched: a page that is not
// served by this server simply keeps its record in the browser.
import http from 'node:http';
import { appendFileSync, createReadStream, mkdirSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

export const PROGRESS_ROUTE = '/api/progress';
// TB_PROGRESS_DIR moves the appended file, so a gate or an experiment can write somewhere that is not
// the reader's own record.
export const PROGRESS_DIR = process.env.TB_PROGRESS_DIR
  ? resolve(process.env.TB_PROGRESS_DIR)
  : join(REPO_ROOT, 'progress');
/** 64 KB: a sitting's worth of events is a few kilobytes, so anything larger is a mistake or an attack. */
export const MAX_BODY_BYTES = 64 * 1024;
/** The learner names a file, so it may not contain a path separator, a dot, or anything else exotic. */
export const LEARNER_PATTERN = /^[a-z0-9_-]{1,32}$/;
const OUTCOMES = ['right', 'wrong', 'partial'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.wasm': 'application/wasm',
};

function show(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `an array of ${v.length}`;
  return `a ${typeof v}`;
}

/**
 * Check one event, returning the problems with it. Each problem names the field, what arrived, and
 * what would satisfy it, so a caller can fix the payload without reading this file.
 *
 * Exported because src/learning/store.js is what sends these: test/store.test.js runs every event the
 * store normalises through this function, so the two halves of the contract cannot drift apart without
 * a red test. It is a pure function — no file, no socket.
 */
export function progressEventProblems(event, i = 0) {
  const at = `event ${i}`;
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return [`${at}: expected a JSON object like {"objective":"feedback-direction","kind":"mcq","outcome":"right"}; got ${show(event)}`];
  }
  const problems = [];
  if (typeof event.objective !== 'string' || !event.objective.trim()) {
    problems.push(`${at}: "objective" must be the objective id this answer tests, a non-empty string (for example "feedback-direction"); got ${show(event.objective)}`);
  }
  if (!OUTCOMES.includes(event.outcome)) {
    problems.push(`${at}: "outcome" must be one of ${OUTCOMES.join(', ')}; got ${show(event.outcome)}`);
  }
  if (typeof event.kind !== 'string' || !event.kind.trim()) {
    problems.push(`${at}: "kind" must name the question format, a non-empty string (for example "mcq", "figure" or "free"); got ${show(event.kind)}`);
  }
  if (event.t !== undefined && !(typeof event.t === 'string' && Number.isFinite(Date.parse(event.t)))) {
    problems.push(`${at}: "t" must be an ISO timestamp (for example "2026-09-10T21:14:03.221Z") or be left out for the server's clock; got ${show(event.t)}`);
  }
  if (event.learner !== undefined && !(typeof event.learner === 'string' && LEARNER_PATTERN.test(event.learner))) {
    problems.push(`${at}: "learner" names the file this is appended to, so it must match ${LEARNER_PATTERN} (lower-case letters, digits, "_" and "-", 1 to 32 characters) or be left out for "default"; got ${show(event.learner)}`);
  }
  if (event.ms !== undefined && event.ms !== null && !(typeof event.ms === 'number' && Number.isFinite(event.ms) && event.ms >= 0)) {
    problems.push(`${at}: "ms" must be the milliseconds from first sight to answer, a non-negative number, or be left out; got ${show(event.ms)}`);
  }
  if (event.options !== undefined && event.options !== null && !(Number.isInteger(event.options) && event.options >= 2)) {
    problems.push(`${at}: "options" must be how many choices the item offered, an integer of 2 or more, or be left out; got ${show(event.options)}`);
  }
  for (const field of ['session', 'item', 'chose', 'confidence', 'source']) {
    if (event[field] !== undefined && event[field] !== null && typeof event[field] !== 'string') {
      problems.push(`${at}: "${field}" must be a string or be left out; got ${show(event[field])}`);
    }
  }
  return problems;
}

/** Append the validated events to progress/<learner>.jsonl, one JSON object per line. */
function appendEvents(events, dir) {
  const byLearner = new Map();
  for (const e of events) {
    const learner = e.learner ?? 'default';
    const line = `${JSON.stringify({ ...e, learner, t: e.t ?? new Date().toISOString() })}\n`;
    byLearner.set(learner, (byLearner.get(learner) ?? '') + line);
  }
  mkdirSync(dir, { recursive: true });
  const files = [];
  for (const [learner, text] of byLearner) {
    const file = resolve(join(dir, `${learner}.jsonl`));
    // The pattern above already forbids a separator; this is the second lock on the same door.
    if (!file.startsWith(resolve(dir) + sep)) throw new Error(`learner "${learner}" resolves to ${file}, outside ${dir}`);
    appendFileSync(file, text, 'utf8');
    files.push(file);
  }
  return files;
}

function handleProgressPost(req, res, dir) {
  const chunks = [];
  let size = 0;
  let refused = false;
  const fail = (status, message) => {
    refused = true;
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(message);
  };
  req.on('data', (chunk) => {
    if (refused) return;
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      fail(413, `Payload too large: POST ${PROGRESS_ROUTE} accepts at most ${MAX_BODY_BYTES} bytes (${Math.round(MAX_BODY_BYTES / 1024)} KB) per request, and this body is already ${size}. Send the events in smaller batches.`);
      res.on('finish', () => req.destroy());
      return;
    }
    chunks.push(chunk);
  });
  req.on('error', () => { if (!refused) fail(400, `Bad request: the body of POST ${PROGRESS_ROUTE} could not be read to the end`); });
  req.on('end', () => {
    if (refused) return;
    const body = Buffer.concat(chunks).toString('utf8');
    if (!body.trim()) {
      fail(400, `Bad request: POST ${PROGRESS_ROUTE} needs a JSON body — one event object, or an array of them. The body was empty.`);
      return;
    }
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      fail(400, `Bad request: the body of POST ${PROGRESS_ROUTE} is not JSON (${err.message}). Send one event object, or an array of them.`);
      return;
    }
    const events = Array.isArray(payload) ? payload : [payload];
    if (events.length === 0) {
      fail(400, `Bad request: POST ${PROGRESS_ROUTE} was sent an empty array. Send at least one event, or nothing at all.`);
      return;
    }
    const problems = events.flatMap((e, i) => progressEventProblems(e, i));
    if (problems.length) {
      fail(400, `Bad request: POST ${PROGRESS_ROUTE} rejected ${problems.length} problem(s) in ${events.length} event(s), and wrote nothing:\n${problems.map((p) => `  ${p}`).join('\n')}`);
      return;
    }
    let files;
    try {
      files = appendEvents(events, dir);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Could not append ${events.length} event(s) to ${dir}: ${err.message}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true, written: events.length, files: files.map((f) => f.slice(resolve(dir).length + 1)) }));
  });
}

export function startServer({ port = 8080, root = REPO_ROOT, quiet = false, progressDir = PROGRESS_DIR } = {}) {
  return new Promise((resolveStart, reject) => {
    const server = http.createServer((req, res) => {
      let pathname;
      try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(`Bad request: ${req.url} is not a valid percent-encoded path`);
        return;
      }
      // The one dynamic route. Only POST is intercepted: a GET to this path still falls through to the
      // static handler and 404s exactly as it did before.
      if (req.method === 'POST' && (pathname === PROGRESS_ROUTE || pathname === `${PROGRESS_ROUTE}/`)) {
        handleProgressPost(req, res, progressDir);
        return;
      }
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = resolve(join(root, pathname));
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end(`Forbidden: ${pathname} resolves outside the served root`);
        return;
      }
      let stat;
      try {
        stat = statSync(file);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Not found: ${pathname} (no such file under ${root})`);
        return;
      }
      if (stat.isDirectory()) {
        res.writeHead(301, { Location: `${pathname}/` });
        res.end();
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': 'no-store',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      createReadStream(file).pipe(res);
    });
    server.on('error', reject);
    server.listen(port, () => {
      const actualPort = server.address().port;
      const url = `http://127.0.0.1:${actualPort}`;
      if (!quiet) console.log(`serving ${root} at http://localhost:${actualPort}/ (Ctrl+C to stop)`);
      resolveStart({
        server,
        port: actualPort,
        url,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
}

if (isMainModule()) {
  const port = Number(process.env.PORT || 8080);
  startServer({ port }).catch((err) => {
    console.error(`dev server failed to start on port ${port}: ${err.message}`);
    process.exit(1);
  });
}
