// The body-temperature model behind the homeostasis figure. Pure: no DOM, no clock of its own, so it
// runs the same under `node --test` as in the browser.
//
// Core temperature T (°C) obeys
//   dT/dt = (basal heat + activity heat + effector heat − loss to ambient) / heat capacity
// where the loss is k·(T − ambient) with a conductance k the skin vessels change (dilated skin loses
// heat faster, constricted skin slower), sweating adds an evaporative loss, and shivering adds heat.
//
// Two effector channels, each a number in [−1, 1] that lags the error T − setPoint by a few seconds:
//   vasomotor  — skin blood flow: a saturating function of the error with no dead band, as in the
//                body, where the vessels fine-tune heat loss inside the zone where nothing else acts;
//   effector   — sweating (positive) or shivering (negative): a saturating function of the error past
//                a dead band of ±0.2 °C either side of the set point.
// With feedback off both decay to zero and the body is a passive lump.
//
// Time is simulated seconds. The constants are tuned for the figure, not from a physiology table: a
// real body has far more thermal mass, so a real cold plunge plays out over many minutes, not one.

export const CONSTANTS = Object.freeze({
  heatCapacity: 100,   // heat units per °C
  conductance: 0.28,   // heat units per s per °C, at neutral skin blood flow
  basalHeat: 4.2,      // = conductance × (37 − 22): rest at 22 °C balances at exactly 37 °C
  activityHeat: 3.2,   // extra heat units per s at activity = 1
  shiverHeat: 1.8,     // heat units per s at full shivering (effector = −1)
  sweatLoss: 2.3,      // heat units per s of evaporation at full sweating (effector = +1)
  vasoRange: 0.4,      // conductance × (1 + vasoRange·vasomotor)
  vasoWidth: 0.3,      // °C of error for the vasomotor output to reach tanh(1) ≈ 0.76
  deadBand: 0.2,       // °C either side of the set point where sweating and shivering rest
  gainWidth: 0.35,     // °C of error past the dead band for the effector to reach tanh(1) ≈ 0.76
  effectorTau: 4,      // s, first-order lag between the error and both outputs
});

export const DEFAULT_INPUTS = Object.freeze({ ambient: 22, activity: 0, setPoint: 37, feedback: true });

// Target sweating/shivering output for an error (°C above the set point): a dead band, then saturation.
export function effectorTarget(error, c = CONSTANTS) {
  const past = Math.max(0, Math.abs(error) - c.deadBand);
  if (past === 0) return 0;
  return Math.sign(error) * Math.tanh(past / c.gainWidth);
}

// Target vasomotor output: saturating, no dead band.
export function vasomotorTarget(error, c = CONSTANTS) {
  return Math.tanh(error / c.vasoWidth);
}

export function createModel(options = {}) {
  const c = { ...CONSTANTS, ...(options.constants || {}) };
  const inputs = { ...DEFAULT_INPUTS, ...(options.inputs || {}) };
  const state = {
    t: 0,
    core: options.core ?? inputs.setPoint,
    effector: 0,
    vasomotor: 0,
    error: 0,
    ambient: inputs.ambient,
    activity: inputs.activity,
    setPoint: inputs.setPoint,
    feedback: inputs.feedback,
    // The two sides of the heat budget from the last step, in °C per second, for a chart or a label.
    heatIn: 0,
    heatOut: 0,
  };
  state.error = state.core - state.setPoint;

  function setInputs(patch) {
    if (patch.ambient !== undefined) state.ambient = patch.ambient;
    if (patch.activity !== undefined) state.activity = patch.activity;
    if (patch.setPoint !== undefined) state.setPoint = patch.setPoint;
    if (patch.feedback !== undefined) state.feedback = Boolean(patch.feedback);
    state.error = state.core - state.setPoint;
  }

  function step(dt) {
    const error = state.core - state.setPoint;
    const eTarget = state.feedback ? effectorTarget(error, c) : 0;
    const vTarget = state.feedback ? vasomotorTarget(error, c) : 0;
    // Both outputs lag the error; exact solution of the first-order relaxation over dt.
    const k = 1 - Math.exp(-dt / c.effectorTau);
    state.effector += (eTarget - state.effector) * k;
    state.vasomotor += (vTarget - state.vasomotor) * k;
    const e = state.effector;
    const conductance = c.conductance * (1 + c.vasoRange * state.vasomotor);
    const heatIn = c.basalHeat + c.activityHeat * state.activity + c.shiverHeat * Math.max(0, -e);
    const heatOut = conductance * (state.core - state.ambient) + c.sweatLoss * Math.max(0, e);
    state.core += ((heatIn - heatOut) / c.heatCapacity) * dt;
    state.t += dt;
    state.error = state.core - state.setPoint;
    state.heatIn = heatIn / c.heatCapacity;
    state.heatOut = heatOut / c.heatCapacity;
    return state;
  }

  return { state, step, setInputs, constants: c };
}

// The name the figure shows for a sweating/shivering output.
export function effectorName(effector) {
  if (effector > 0.05) return 'Sweating';
  if (effector < -0.05) return 'Shivering';
  return 'Resting';
}

// Run the model for `seconds` with fixed steps, applying each event's inputs once its time arrives.
// events: [{ at, inputs: { ambient?, activity?, setPoint?, feedback? } }], in any order.
// Returns one sample per step (the state at t = 0 first), each { t, core, effector, vasomotor, error,
// ambient, activity, setPoint, feedback }.
export function simulate({ seconds, dt = 0.1, events = [], initial = {}, constants = null } = {}) {
  const model = createModel({ inputs: initial, constants });
  const queue = [...events].sort((a, b) => a.at - b.at);
  let next = 0;
  const snapshot = () => ({
    t: model.state.t,
    core: model.state.core,
    effector: model.state.effector,
    vasomotor: model.state.vasomotor,
    error: model.state.error,
    ambient: model.state.ambient,
    activity: model.state.activity,
    setPoint: model.state.setPoint,
    feedback: model.state.feedback,
  });
  const out = [];
  const steps = Math.round(seconds / dt);
  for (let i = 0; i <= steps; i += 1) {
    while (next < queue.length && queue[next].at <= model.state.t + 1e-9) {
      model.setInputs(queue[next].inputs);
      next += 1;
    }
    out.push(snapshot());
    if (i < steps) model.step(dt);
  }
  return out;
}

// The figure's episodes: what each button does, as an interval of changed inputs.
export const EPISODES = Object.freeze({
  coldPlunge: { label: 'Cold plunge', duration: 30, inputs: { ambient: 5 } },
  race: { label: 'Run a race', duration: 30, inputs: { activity: 1 } },
  fever: { label: 'Fever', duration: 60, inputs: { setPoint: 39 } },
});

// The inputs in force at time t given the reader's actions: episodes [{ at, kind }] and feedback
// toggles [{ at, kind: 'feedback', value }]. Overlapping episodes of one kind simply extend each other.
export function inputsAt(t, actions) {
  const inputs = { ...DEFAULT_INPUTS };
  let feedbackAt = -Infinity;
  for (const a of actions) {
    if (a.kind === 'feedback') {
      if (a.at <= t && a.at >= feedbackAt) {
        feedbackAt = a.at;
        inputs.feedback = a.value;
      }
      continue;
    }
    const ep = EPISODES[a.kind];
    if (!ep) continue;
    if (a.at <= t && t < a.at + ep.duration) Object.assign(inputs, ep.inputs);
  }
  return inputs;
}

// Turn a list of actions into the plain event list `simulate` takes: one event at every moment the
// inputs can change, carrying the full inputs in force from then on.
export function eventsFromActions(actions) {
  const times = new Set([0]);
  for (const a of actions) {
    times.add(a.at);
    const ep = EPISODES[a.kind];
    if (ep) times.add(a.at + ep.duration);
  }
  return [...times].sort((a, b) => a - b).map((at) => ({ at, inputs: inputsAt(at, actions) }));
}
