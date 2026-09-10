// The homeostasis model behind Figure 1.2 must do the two things the caption claims: return to the set
// point after a disturbance with feedback on, and drift away with it off. Bound: the model alone, at
// its shipped constants, over the two scripted disturbances below; nothing about the drawing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../src/figures/lib/homeostasis-model.js';

const last = (rows) => rows[rows.length - 1];
const REST = { ambient: 22, activity: 0, setPoint: 37, feedback: true };

test('at rest the core temperature sits at the set point', () => {
  const rows = simulate({ seconds: 300, dt: 0.1, events: [{ at: 0, inputs: REST }] });
  for (const r of rows) assert.ok(Math.abs(r.core - 37) < 0.15, `t=${r.t}: core ${r.core.toFixed(3)} left 37 ± 0.15 at rest`);
});

test('a cold plunge dips the core and feedback brings it back', () => {
  const rows = simulate({
    seconds: 240,
    dt: 0.1,
    events: [
      { at: 0, inputs: REST },
      { at: 10, inputs: { ambient: 5 } },
      { at: 40, inputs: { ambient: 22 } },
    ],
  });
  const min = Math.min(...rows.map((r) => r.core));
  assert.ok(min < 36.8, `the plunge should be visible: min core ${min.toFixed(3)} did not fall below 36.8`);
  assert.ok(min > 35.0, `the plunge should not be lethal in the model: min core ${min.toFixed(3)} fell below 35`);
  assert.ok(Math.abs(last(rows).core - 37) < 0.2, `after recovery the core is ${last(rows).core.toFixed(3)}, not within 0.2 of 37`);
  assert.ok(rows.some((r) => r.t > 10 && r.t < 60 && r.effector < 0), 'the model never shivered (effector < 0) during the plunge');
});

test('with feedback off the same plunge drifts away and stays away', () => {
  const rows = simulate({
    seconds: 240,
    dt: 0.1,
    events: [
      { at: 0, inputs: { ...REST, feedback: false } },
      { at: 10, inputs: { ambient: 5 } },
    ],
  });
  assert.ok(Math.abs(last(rows).core - 37) > 0.5, `with no feedback the core should drift; it ended at ${last(rows).core.toFixed(3)}`);
  assert.ok(rows.every((r) => r.effector === 0), 'with feedback off the effector must stay at 0');
});

test('a race heats the core and sweating cools it back', () => {
  const rows = simulate({
    seconds: 240,
    dt: 0.1,
    events: [
      { at: 0, inputs: REST },
      { at: 10, inputs: { activity: 1 } },
      { at: 40, inputs: { activity: 0 } },
    ],
  });
  const max = Math.max(...rows.map((r) => r.core));
  assert.ok(max > 37.2, `the race should be visible: max core ${max.toFixed(3)}`);
  assert.ok(rows.some((r) => r.effector > 0), 'the model never sweated (effector > 0) during the race');
  assert.ok(Math.abs(last(rows).core - 37) < 0.2, `after the race the core is ${last(rows).core.toFixed(3)}`);
});

test('a fever moves the defended value, not the loop', () => {
  const rows = simulate({
    seconds: 240,
    dt: 0.1,
    events: [
      { at: 0, inputs: REST },
      { at: 10, inputs: { setPoint: 39 } },
    ],
  });
  assert.ok(Math.abs(last(rows).core - 39) < 0.3, `with the set point at 39 the core should settle near 39, not ${last(rows).core.toFixed(3)}`);
});

test('the simulation is deterministic', () => {
  const a = simulate({ seconds: 60, dt: 0.1, events: [{ at: 0, inputs: REST }, { at: 5, inputs: { ambient: 5 } }] });
  const b = simulate({ seconds: 60, dt: 0.1, events: [{ at: 0, inputs: REST }, { at: 5, inputs: { ambient: 5 } }] });
  assert.deepEqual(a, b);
});
