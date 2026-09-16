// The one rule for a trimming variable — SHOT_PAGES, DEVICE_ONLY, DRIVE_KINDS and the rest: a value
// that names nothing that exists stops the run, naming the variable, the value it was given and what
// it could have been. It never empties the run. `DEVICE_PAGES=ch01` used to filter the page list down
// to nothing, run zero loads and exit 0 behind "0 load(s) … all clean": a green that meant the gate had
// not run, one level above the checks the gates make (docs/policies/local-rules.md, "A check must fail
// when its subject is missing"). The page ids became book-qualified on 2026-09-12 — `ch01` is
// `biology/ch01` now — which is exactly how every trimmed command quoted in docs/learning/gate-proofs.md
// went stale without a word. Found by review, 2026-09-16.
//
// Bound: every name given must be in the list given, and that is all it checks. A run trimmed to one
// page proves that page and no other; that claim is the calling gate's header's to make.

// A hint for page lists, because the stale shape is a known one.
export const PAGE_HINT = 'Page ids carry their book: biology/ch01, not ch01.';

/**
 * The entries of `all` that the environment variable `name` selects, in `all`'s own order. Unset,
 * or set to nothing but separators, means `unset` — all of them unless the caller says otherwise
 * (the device gate runs one theme unless asked). A name that matches no entry throws.
 * @param {string} name the variable, e.g. 'SHOT_PAGES'
 * @param {Array} all everything that exists
 * @param {object} [options]
 * @param {(entry: any) => string} [options.idOf] how an entry is named in the variable; default: the entry itself
 * @param {string} [options.noun] what one entry is, for the message: 'page', 'kind', 'theme'
 * @param {string} [options.hint] one sentence added to the failure
 * @param {Array} [options.unset] what an unset variable means; default: `all`
 */
export function trim(name, all, { idOf = (x) => x, noun = 'value', hint = '', unset = all } = {}) {
  const raw = process.env[name];
  const wanted = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  if (!wanted.length) return unset;
  const ids = all.map(idOf);
  const unknown = wanted.filter((w) => !ids.includes(w));
  if (unknown.length) {
    throw new Error(`${name}=${raw} names no such ${noun}: ${unknown.map((u) => `"${u}"`).join(', ')}. A name that matches nothing would run nothing, and a gate that runs nothing must not pass. The ${noun}s are: ${ids.join(', ')}.${hint ? ` ${hint}` : ''}`);
  }
  return all.filter((x) => wanted.includes(idOf(x)));
}
