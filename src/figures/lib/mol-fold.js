// The lattice protein model behind the foldlab figure, kept separate from the drawing so it can be
// run without a browser: a scratch harness, a unit test and the figure all drive the same code, which
// is the only way a measurement of the search means anything about the search the reader gets.
//
// THE MODEL. A chain of residues on a two-dimensional square lattice, each residue one of
//   H hydrophobic · P polar · + positively charged · − negatively charged
// and an energy that is lower the better folded:
//   H–H contact (neighbouring sites, not joined along the chain)                     −1.0
//   + with −                                                             −1.5 × ionic strength
//   + with + or − with −                                                 +1.0 × ionic strength
//   every face of a hydrophobic residue still touching empty water                   +0.3
// The last term is the hydrophobic effect itself — water excluding what it cannot hold — rather than
// an attraction between greasy residues, which is the distinction §2.3 makes.
//
// THE SEARCH is Metropolis Monte Carlo over pivot, corner, crankshaft and end moves, annealed from hot
// down to the reader's temperature with a greedy quench at the end, repeated from `restarts` different
// random starts, keeping the lowest-energy arrangement ever SEEN rather than the one the last anneal
// happens to stop on. The generator is mulberry32 seeded from the sequence and the run number and
// nothing here calls Math.random, so the same sequence and run number give the same fold everywhere.
//
// Measured, not guessed (tools: the scratch harness in the worker's scratchpad, 40 runs per sequence):
// a single 40 000-step anneal returned energies from −4.80 to −7.29 on the same sequence, so the
// figure's claim that the sequence decides the shape came out false because the SEARCH was weak.
// Independent restarts fixed that; the numbers are in the figure's handoff.

import { mulberry32, hashString } from './mol-draw.js';

export const TYPES = ['H', 'P', '+', '-'];
export const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export const SOLVENT_COST = 0.3;
export const HH_BOND = -1;
export const ION_ATTRACT = -1.5;
export const ION_REPEL = 1;
export const PKA_ACID = 4.5;
export const PKA_BASE = 9.5;
export const MELT_C = 60; // above this the fold shakes apart
export const AGGREGATE_C = 75; // above this the opened chains tangle and will not go back

export const kkey = (x, y) => `${x},${y}`;
// The reader's temperature as a Metropolis temperature. Flat below 30 °C, because a cell does not care
// whether it is 20 or 25, and steep above it so that 60 °C melts the fold and 75 °C ruins it.
export const kT = (tempC) => 0.25 + Math.max(0, tempC - 30) * 0.03;
// How much charge is left on the acidic and basic side chains at this pH, as a product: swing the pH
// far enough either way and one of the two is gone, so the ionic contacts go with it.
export const ionicStrength = (ph) => (1 / (1 + 10 ** (PKA_ACID - ph))) * (1 / (1 + 10 ** (ph - PKA_BASE)));

export function makeOcc(coords) {
  const occ = new Map();
  coords.forEach((p, i) => occ.set(kkey(p[0], p[1]), i));
  return occ;
}

export function straightChain(n, offset = 0) {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push([i, offset]);
  return out;
}

// Every pair of residues on neighbouring sites that are not joined along the chain.
export function contactsOf(coords, chainIds) {
  const occ = makeOcc(coords);
  const pairs = [];
  for (let i = 0; i < coords.length; i += 1) {
    for (const [dx, dy] of N4) {
      const j = occ.get(kkey(coords[i][0] + dx, coords[i][1] + dy));
      if (j === undefined || j <= i) continue;
      if (chainIds[i] === chainIds[j] && Math.abs(i - j) === 1) continue;
      pairs.push([i, j]);
    }
  }
  return { pairs, occ };
}

export function energyOf(seq, coords, chainIds, ionic) {
  const { pairs, occ } = contactsOf(coords, chainIds);
  let e = 0;
  let hh = 0;
  for (const [i, j] of pairs) {
    const a = seq[i];
    const b = seq[j];
    if (a === 'H' && b === 'H') { e += HH_BOND; hh += 1; } else if ((a === '+' && b === '-') || (a === '-' && b === '+')) e += ION_ATTRACT * ionic;
    else if ((a === '+' && b === '+') || (a === '-' && b === '-')) e += ION_REPEL * ionic;
  }
  for (let i = 0; i < coords.length; i += 1) {
    if (seq[i] !== 'H') continue;
    for (const [dx, dy] of N4) if (!occ.has(kkey(coords[i][0] + dx, coords[i][1] + dy))) e += SOLVENT_COST;
  }
  return { energy: e, contacts: hh, pairs, occ };
}

// A hydrophobic residue is buried when every face not used by its own chain neighbours is occupied.
export function burial(seq, coords) {
  const occ = makeOcc(coords);
  let total = 0;
  let buried = 0;
  for (let i = 0; i < coords.length; i += 1) {
    if (seq[i] !== 'H') continue;
    total += 1;
    let free = 0;
    for (const [dx, dy] of N4) if (!occ.has(kkey(coords[i][0] + dx, coords[i][1] + dy))) free += 1;
    if (free === 0) buried += 1;
  }
  return { total, buried, fraction: total ? buried / total : 0 };
}

// Two runs reached "the same fold" when they made the same set of favourable contacts. Only the
// contacts the model scores count: a stray polar residue that happens to sit next to another is not
// part of the fold, and counting it made two identical hydrophobic cores read as different answers.
// A set of residue index pairs is the same under rotation and reflection, so a mirror image counts as
// the same fold rather than a new one.
export function foldKey(seq, coords, chainIds) {
  const { pairs } = contactsOf(coords, chainIds);
  return pairs
    .filter(([i, j]) => {
      const a = seq[i];
      const b = seq[j];
      return (a === 'H' && b === 'H') || (a === '+' && b === '-') || (a === '-' && b === '+');
    })
    .map(([i, j]) => `${i}-${j}`)
    .sort()
    .join(' ');
}

// Two chains are held within one small volume, the way two chains of one protein are held inside one
// cell. Without it the second chain's whole-chain slides walk it off across the lattice, the drawing's
// bounding box grows with the distance between them, and both folds render at four device pixels while
// the figure claims to be showing a quaternary structure.
export const MAX_CHAIN_SEP = 9;

export function valid(coords, chainIds) {
  const seen = new Set();
  let twoChains = false;
  for (let i = 0; i < coords.length; i += 1) {
    const k = kkey(coords[i][0], coords[i][1]);
    if (seen.has(k)) return false;
    seen.add(k);
    if (chainIds[i] === 1) twoChains = true;
    if (i > 0 && chainIds[i] === chainIds[i - 1]) {
      const d = Math.abs(coords[i][0] - coords[i - 1][0]) + Math.abs(coords[i][1] - coords[i - 1][1]);
      if (d !== 1) return false;
    }
  }
  if (twoChains) {
    const c = [[0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < coords.length; i += 1) {
      const s = c[chainIds[i]];
      s[0] += coords[i][0];
      s[1] += coords[i][1];
      s[2] += 1;
    }
    if (c[0][2] && c[1][2]) {
      const dx = c[0][0] / c[0][2] - c[1][0] / c[1][2];
      const dy = c[0][1] / c[0][2] - c[1][1] / c[1][2];
      if (Math.hypot(dx, dy) > MAX_CHAIN_SEP) return false;
    }
  }
  return true;
}

function chainRange(chainIds, c) {
  let lo = -1;
  let hi = -1;
  for (let i = 0; i < chainIds.length; i += 1) {
    if (chainIds[i] !== c) continue;
    if (lo < 0) lo = i;
    hi = i;
  }
  return [lo, hi];
}

// One trial move. Returns a new coordinate array, or null when the move cannot be made; the caller
// still checks validity, because several of these can propose an arrangement that folds onto itself.
export function proposeMove(coords, chainIds, rnd, nChains) {
  const c = nChains > 1 && rnd() < 0.5 ? 1 : 0;
  const [lo, hi] = chainRange(chainIds, c);
  const len = hi - lo + 1;
  const roll = rnd();
  const next = coords.map((p) => [p[0], p[1]]);

  if (nChains > 1 && roll < 0.12) {
    // a whole chain slides one step, which is how two chains find each other
    const [dx, dy] = N4[Math.floor(rnd() * 4)];
    for (let i = lo; i <= hi; i += 1) {
      next[i][0] += dx;
      next[i][1] += dy;
    }
    return next;
  }
  if (roll < 0.45) {
    // pivot: rotate everything past a residue about it
    const pivot = lo + 1 + Math.floor(rnd() * Math.max(1, len - 2));
    const turns = 1 + Math.floor(rnd() * 3);
    const [px, py] = next[pivot];
    for (let i = pivot + 1; i <= hi; i += 1) {
      let dx = next[i][0] - px;
      let dy = next[i][1] - py;
      for (let t = 0; t < turns; t += 1) {
        const nx = -dy;
        const ny = dx;
        dx = nx;
        dy = ny;
      }
      next[i] = [px + dx, py + dy];
    }
    return next;
  }
  const i = lo + Math.floor(rnd() * len);
  if (i === lo || i === hi) {
    // end move: the end residue hops to any free neighbour of the one it is attached to
    const anchor = i === lo ? lo + 1 : hi - 1;
    if (anchor < lo || anchor > hi) return null;
    const [dx, dy] = N4[Math.floor(rnd() * 4)];
    next[i] = [next[anchor][0] + dx, next[anchor][1] + dy];
    return next;
  }
  if (roll < 0.8) {
    // corner flip: a residue at a bend hops to the other corner of its square
    const a = next[i - 1];
    const b = next[i + 1];
    if (a[0] === b[0] || a[1] === b[1]) return null; // collinear, no corner
    next[i] = [a[0] + b[0] - next[i][0], a[1] + b[1] - next[i][1]];
    return next;
  }
  // crankshaft: a U of four residues flips over
  if (i + 2 > hi) return null;
  const p0 = next[i - 1];
  const p1 = next[i];
  const p2 = next[i + 1];
  const p3 = next[i + 2];
  if (p0[0] !== p3[0] && p0[1] !== p3[1]) return null;
  next[i] = [p0[0] + (p0[0] - p1[0]), p0[1] + (p0[1] - p1[1])];
  next[i + 1] = [p3[0] + (p3[0] - p2[0]), p3[1] + (p3[1] - p2[1])];
  return next;
}

// ---------------------------------------------------------------- secondary structure, on a lattice
//
// A square lattice has no helix and no sheet in the protein sense, so this scores their lattice
// analogues and the figure says so on the stage. A straight run of four or more residues lying beside
// another such run is the sheet analogue — two strands packed side by side. A run of turns repeating
// left-left-right-right is the helix analogue: the tightest coil the lattice allows, advancing one
// site every four residues.
export function turnsOf(coords, chainIds) {
  const out = [];
  for (let i = 1; i < coords.length - 1; i += 1) {
    if (chainIds[i - 1] !== chainIds[i] || chainIds[i] !== chainIds[i + 1]) { out.push(null); continue; }
    const ax = coords[i][0] - coords[i - 1][0];
    const ay = coords[i][1] - coords[i - 1][1];
    const bx = coords[i + 1][0] - coords[i][0];
    const by = coords[i + 1][1] - coords[i][1];
    const cross = ax * by - ay * bx;
    out.push(cross === 0 ? 0 : Math.sign(cross));
  }
  return out;
}

export function secondary(coords, chainIds) {
  const t = turnsOf(coords, chainIds);
  const helix = new Set();
  const sheet = new Set();
  for (let start = 0; start < t.length; start += 1) {
    for (let len = Math.min(t.length - start, 12); len >= 4; len -= 1) {
      const seg = t.slice(start, start + len);
      if (seg.some((v) => v === null || v === 0)) continue;
      let ok = true;
      for (let k = 4; k < len; k += 1) if (seg[k] !== seg[k - 4]) { ok = false; break; }
      if (ok) {
        const period = seg.slice(0, 4);
        if (period[0] !== period[1] || period[2] !== period[3] || period[0] === period[2]) ok = false;
      }
      if (!ok) continue;
      // turn i sits between residues i and i+2, so a run of turns start..start+len-1 is the residues
      // start..start+len
      for (let k = start; k <= start + len; k += 1) helix.add(k);
      start += len - 1;
      break;
    }
  }
  const runs = [];
  let i = 0;
  while (i < t.length) {
    if (t[i] === 0) {
      let j = i;
      while (j < t.length && t[j] === 0) j += 1;
      if (j - i >= 2) runs.push([i, j + 1]);
      i = j;
    } else i += 1;
  }
  const inRun = new Map();
  runs.forEach((r, ri) => { for (let k = r[0]; k <= r[1]; k += 1) inRun.set(k, ri); });
  const occ = makeOcc(coords);
  for (const [k, ri] of inRun) {
    for (const [dx, dy] of N4) {
      const j = occ.get(kkey(coords[k][0] + dx, coords[k][1] + dy));
      if (j === undefined || Math.abs(j - k) <= 1) continue;
      if (inRun.has(j) && inRun.get(j) !== ri) { sheet.add(k); sheet.add(j); }
    }
  }
  for (const k of helix) sheet.delete(k);
  return { helix, sheet };
}

// ---------------------------------------------------------------- the search
//
// createSearch returns an object the caller steps at whatever rate it likes: the figure a few hundred
// steps per animation frame so the search is visible, a harness or a test straight to the end. Both
// take exactly the same path through the model, which is the point of it living here.
export function createSearch({ seq, chainIds, chains = 1, seed, tempC, ph, restarts = 1, stepsPerRestart, keepBest = true, quench = 0.25, hot = null, start = null }) {
  const rnd = mulberry32(seed >>> 0);
  const ionic = ionicStrength(ph);
  const cold = kT(tempC);
  const hotT = hot ?? Math.max(1.8, cold);
  const n = seq.length;

  const fresh = () => {
    let c = straightChain(chains === 2 ? n / 2 : n, 0);
    if (chains === 2) c = c.concat(straightChain(n / 2, 3));
    for (let i = 0; i < 400; i += 1) {
      const next = proposeMove(c, chainIds, rnd, chains);
      if (next && valid(next, chainIds)) c = next;
    }
    return c;
  };

  let coords = start ? start.map((p) => [p[0], p[1]]) : fresh();
  let left = stepsPerRestart;
  let restartsLeft = restarts;
  let best = coords.map((p) => [p[0], p[1]]);
  let bestE = energyOf(seq, coords, chainIds, ionic).energy;
  let steps = 0;
  let done = false;

  return {
    get coords() { return coords; },
    get steps() { return steps; },
    get done() { return done; },
    get bestEnergy() { return bestE; },
    // Run up to `budget` trial moves. Returns true when the whole search has finished.
    step(budget) {
      let left2 = budget;
      while (!done && left2 > 0) {
        let cur = energyOf(seq, coords, chainIds, ionic).energy;
        const take = Math.min(left2, left);
        for (let s = 0; s < take; s += 1) {
          const frac = 1 - left / stepsPerRestart;
          const temp = frac > 1 - quench ? cold * 0.2 : hotT + (cold - hotT) * Math.min(1, frac / (1 - quench));
          const next = proposeMove(coords, chainIds, rnd, chains);
          left -= 1;
          steps += 1;
          if (!next || !valid(next, chainIds)) continue;
          const e = energyOf(seq, next, chainIds, ionic).energy;
          if (e <= cur || rnd() < Math.exp(-(e - cur) / Math.max(0.02, temp))) {
            coords = next;
            cur = e;
            if (keepBest && cur < bestE - 1e-9) {
              bestE = cur;
              best = coords.map((p) => [p[0], p[1]]);
            }
          }
        }
        left2 -= take;
        if (left > 0) continue;
        restartsLeft -= 1;
        if (restartsLeft > 0) {
          coords = fresh();
          left = stepsPerRestart;
          continue;
        }
        if (keepBest) coords = best.map((p) => [p[0], p[1]]);
        done = true;
      }
      return done;
    },
    runToEnd() {
      while (!done) this.step(8000);
      return coords;
    },
  };
}

export function seedFor(seq, chains, runIndex, kind) {
  return hashString(`${seq}|${chains}|${runIndex}|${kind}`);
}
