// The bilayer tank's verdict at 90 °C, at the flattest tank the figure will draw. The figure's claim, and
// §4.2's, is that hot enough, nothing assembles; the reader is told so by the word the tank reports, which
// is what it has held over the last second of its clock (src/figures/bilayer.js, SAMPLE_SWEEPS).
//
// Why this exists beside `npm run drive`'s `hot-enough-and-nothing-assembles`. That step reads the verdict
// at sixty instants in the lab, where the tank is 13.8 nm tall — and the tank's height follows the shape
// of its pane, so its crowding does too. Until 2026-09-23 a chapter page at 1024 px gave a 10.4 nm tank,
// so crowded that at 90 °C it was a sheet or micelles in 89% of sweeps, and the drive step stayed green
// over it, because the lab never draws that tank: with the floor put back to 0.52 the step passes all
// seven of its steps (docs/learning/gate-proofs.md). So the claim is held here at the shape where it is
// weakest, the floor, MIN_RATIO of the tank's width, in Node, from the figure's own model code.
//
// Bound: three seeds (11, 12, 13 — the opening seed and the two Reset gives next), 20 s of clock each
// and not the drive step's 30, because this runs on every `npm run unit` and three 20 s windows are
// about 12 s of it; a read every 0.05 s; phospholipid only; and the floor alone. A taller tank is less
// crowded and parts sooner — measured, not assumed: 22 of 22 runs dispersed at 90 °C at each of 12.9,
// 13.8, 13.9 and 14.4 nm — but nothing here reads one. It says nothing about the drawing, about 85-89 °C, where the sheet is melting
// and the verdict is allowed to change, or about the other four molecules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { model } from '../src/figures/bilayer.js';

const { Tank, stepTank, heldArrangement, kTat, TANK_W, MIN_RATIO, SWEEPS_PER_SECOND } = model;
const FLOOR_H = TANK_W * MIN_RATIO;
const SAMPLE = 70; // sweeps between reads, the same 0.05 s the figure samples at

function run(seed, tempC, seconds, read) {
  const tank = new Tank('phospholipid', seed, TANK_W, FLOOR_H, true);
  const kT = kTat(tempC);
  let reads = 0;
  while (tank.sweeps < seconds * SWEEPS_PER_SECOND) {
    stepTank(tank, kT);
    if (tank.sweeps % SAMPLE === 0) { read(tank, tank.sweeps / SWEEPS_PER_SECOND); reads += 1; }
  }
  return reads;
}

for (const seed of [11, 12, 13]) {
  test(`90 °C, seed ${seed}, the flattest tank (${FLOOR_H.toFixed(1)} nm): dispersed at every read over 20 s of clock`, () => {
    const wrong = [];
    const reads = run(seed, 90, 20, (tank, t) => {
      const v = heldArrangement(tank);
      if (v !== 'dispersed') wrong.push(`${v} at t=${t.toFixed(2)}`);
    });
    assert.equal(reads, 400, `the window was not walked: ${reads} reads where 20 s at 0.05 s is 400`);
    assert.deepEqual(wrong.slice(0, 5), [], `at 90 °C nothing should assemble, but the tank reported ${wrong.length} of ${reads} reads as something else, first: ${wrong.slice(0, 5).join(', ')}`);
  });
}

// The other half, so the test above cannot pass on a model that never assembles anything: the same tank
// shape, cool, makes a sheet and keeps it.
test(`37 °C, seed 11, the flattest tank (${FLOOR_H.toFixed(1)} nm): a bilayer, held over the last 6 s of 12`, () => {
  const late = [];
  run(11, 37, 12, (tank, t) => { if (t > 6) late.push(heldArrangement(tank)); });
  const off = late.filter((v) => v !== 'bilayer');
  assert.ok(late.length === 120 && off.length === 0, `phospholipids at 37 °C should hold a bilayer: ${off.length} of ${late.length} late reads were ${[...new Set(off)].join(', ') || 'none'}`);
});
