// npm run drive: drive every figure's own controls through real input in the lab and assert what the
// figure reports afterwards, with a screenshot of the stage after each step in out/drive/.
//
// Claim: for each kind in the registry, the steps in RECIPES below, performed with Playwright's real
// mouse and keyboard on the figure's buttons, range inputs and focusable stage (never by calling the
// figure's methods), leave describe() in the state each step asserts, and the page logs no console
// error, uncaught error, or failed request. Fails naming the kind, the step and the assertion.
//
// Every step works at absolute coordinates, so the stage is scrolled into view before the recipe runs.
// Bound: one viewport (1000x640), the light theme, the steps listed, and describe()'s own account of
// state, not the pixels; a control that reports the right state and draws the wrong thing passes, which
// is what the screenshots are for. A kind with no recipe fails, so a new figure cannot land undriven,
// and a kind whose describe() uses one of the frame's four names (id, kind, number, state) fails too,
// as does one the frame holds no handle for or whose handle has no describe(): the ownership check
// inspects the figure's own describe(), and a subject it cannot find is a failure, not a clean result.
// DRIVE_KINDS=<a,b> trims the run to those kinds, a trimmed run proves only its part, and a name that
// is not a registered kind stops the run rather than running on to "no recipe" (tools/lib/trim.js).
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { trim } from './lib/trim.js';
import { KINDS } from '../src/figures/registry.js';

const OUT = 'out/drive';
const wanted = trim('DRIVE_KINDS', KINDS, { noun: 'kind' });

const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

// Each recipe is a list of [name, async (h) => {}] steps. `h` gives the step the page, the stage, the
// figure's current description, and helpers that all go through real input.
const RECIPES = {
  pond: [
    ['pause-stops-the-clock', async (h) => {
      await h.button(/^Pause/).click();
      const t1 = (await h.describe()).t;
      await h.page.waitForTimeout(600);
      const t2 = (await h.describe()).t;
      expect(near(t1, t2), `the clock kept running while paused: ${t1} -> ${t2}`);
    }],
    ['play-resumes', async (h) => {
      await h.button(/^Play/).click();
      const t1 = (await h.describe()).t;
      await h.page.waitForTimeout(600);
      const t2 = (await h.describe()).t;
      expect(t2 > t1 + 0.2, `the clock did not resume after Play: ${t1} -> ${t2}`);
    }],
    ['space-toggles', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Space');
      const t1 = (await h.describe()).t;
      await h.page.waitForTimeout(600);
      const t2 = (await h.describe()).t;
      expect(near(t1, t2), `Space did not pause: ${t1} -> ${t2}`);
    }],
  ],
  levels: [
    ['next-button', async (h) => {
      await h.button(/Next/).click();
      await h.page.waitForTimeout(400);
      expect((await h.describe()).level === 1, `Next did not go to level 1: ${JSON.stringify(await h.describe())}`);
    }],
    ['arrow-right-on-range', async (h) => {
      await h.stage.locator('input[type=range]').focus();
      await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(400);
      expect((await h.describe()).level === 2, `ArrowRight did not go to level 2: ${JSON.stringify(await h.describe())}`);
    }],
    ['click-a-thumbnail', async (h) => {
      await h.stage.locator('.lv-thumb').nth(7).click();
      await h.page.waitForTimeout(400);
      expect((await h.describe()).level === 7, `clicking thumbnail 8 did not go to level 7: ${JSON.stringify(await h.describe())}`);
    }],
    ['end-and-home', async (h) => {
      await h.stage.locator('input[type=range]').focus();
      await h.page.keyboard.press('End');
      await h.page.waitForTimeout(400);
      expect((await h.describe()).level === 11, `End did not reach level 11: ${JSON.stringify(await h.describe())}`);
      await h.page.keyboard.press('Home');
      await h.page.waitForTimeout(400);
      expect((await h.describe()).level === 0, `Home did not return to level 0: ${JSON.stringify(await h.describe())}`);
    }],
  ],
  scale: [
    ['arrow-left-moves-the-lens', async (h) => {
      const before = await h.describe();
      expect(before.nearest === 'animal-cell', `the lens does not start on the animal cell: ${JSON.stringify(before)}`);
      await h.stage.locator('.sc-lens').focus();
      await h.page.keyboard.press('ArrowLeft');
      await h.page.waitForTimeout(400);
      const after = await h.describe();
      expect(after.nearest !== 'animal-cell' && after.lensMetres > before.lensMetres, `ArrowLeft did not move the lens to something larger: ${JSON.stringify(after)}`);
    }],
    ['drag-the-lens-left', async (h) => {
      const lens = await h.centre('.sc-lens circle');
      const box = await h.stage.boundingBox();
      await h.drag(lens, { x: box.x + box.width * 0.12, y: lens.y });
      await h.page.waitForTimeout(400);
      const d = await h.describe();
      expect(d.lensMetres > 0.5, `dragging to the left end did not reach the metre scale: ${JSON.stringify(d)}`);
    }],
    ['range-input', async (h) => {
      const range = h.stage.locator('input[type=range]');
      await range.focus();
      for (let i = 0; i < 20; i += 1) await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(400);
      const d = await h.describe();
      expect(d.lensMetres < 0.5, `twenty ArrowRight on the range did not move the lens right: ${JSON.stringify(d)}`);
    }],
    ['next-button', async (h) => {
      const before = await h.describe();
      await h.button(/^Next/).click();
      await h.page.waitForTimeout(400);
      const after = await h.describe();
      expect(after.lensMetres < before.lensMetres, `the next button did not move the lens to something smaller: ${before.lensMetres} -> ${after.lensMetres}`);
    }],
  ],
  tree: [
    ['hover-highlights', async (h) => {
      const hit = h.stage.locator('.tr-hit').first();
      const label = hit.locator('.tr-hitlabel').first();
      const box = (await label.count()) ? await label.boundingBox() : await hit.boundingBox();
      await h.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.waitForTimeout(350);
      expect((await h.describe()).highlighted, `hovering the first target highlighted nothing: ${JSON.stringify(await h.describe())}`);
    }],
    ['click-pins-then-escape-clears', async (h) => {
      const hit = h.stage.locator('.tr-hit').first();
      const box = await hit.boundingBox();
      await h.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.mouse.move(5, 5);
      await h.page.waitForTimeout(350);
      expect((await h.describe()).highlighted, 'the click did not pin the highlight');
      await h.page.keyboard.press('Escape');
      await h.page.waitForTimeout(350);
      expect(!(await h.describe()).highlighted, 'Escape did not clear the highlight');
    }],
    ['tab-focus-highlights', async (h) => {
      // The click above left focus on the first target, so Tab moves it to the second and fires focusin.
      await h.page.keyboard.press('Tab');
      await h.page.waitForTimeout(350);
      expect((await h.describe()).highlighted, 'moving keyboard focus to a target highlighted nothing');
      await h.page.keyboard.press('Escape');
    }],
    ['modes', async (h) => {
      const start = (await h.describe()).mode;
      await h.button(/Endosymbiosis/).click();
      await h.page.waitForTimeout(350);
      const m1 = (await h.describe()).mode;
      expect(m1 !== start, `Endosymbiosis did not change the mode from ${start}`);
      await h.button(/Eukaryotes/).click();
      await h.page.waitForTimeout(350);
      const m2 = (await h.describe()).mode;
      expect(m2 !== m1 && m2 !== start, `Eukaryotes did not change the mode (${m2})`);
      await h.button(/Three domains/).click();
      await h.page.waitForTimeout(350);
      expect((await h.describe()).mode === start, 'Three domains did not restore the first mode');
    }],
  ],
  energy: [
    ['energy-mode', async (h) => {
      await h.button(/^Energy/).click();
      await h.page.waitForTimeout(350);
      expect((await h.describe()).mode === 'energy', `mode is ${JSON.stringify(await h.describe())}`);
    }],
    ['matter-mode', async (h) => {
      await h.button(/^Matter/).click();
      await h.page.waitForTimeout(350);
      expect((await h.describe()).mode === 'matter', `mode is ${JSON.stringify(await h.describe())}`);
    }],
    ['both-by-keyboard', async (h) => {
      await h.button(/^Both/).focus();
      await h.page.keyboard.press('Enter');
      await h.page.waitForTimeout(350);
      const d = await h.describe();
      expect(d.mode === 'both' && d.energyParticles > 0 && d.matterParticles > 0, `Both did not restore both systems: ${JSON.stringify(d)}`);
    }],
  ],
  homeostasis: [
    ['cold-plunge-records-an-event-and-cools', async (h) => {
      await h.button(/^Cold plunge/).click();
      await h.page.waitForTimeout(1500);
      const mid = await h.describe();
      expect(mid.events.length === 1, `expected one event, got ${JSON.stringify(mid.events)}`);
      expect(mid.ambient === 5, `fifteen simulated seconds into a thirty-second plunge the ambient is ${mid.ambient}, not 5`);
      await h.page.waitForTimeout(1200);
      const d = await h.describe();
      expect(d.core < 36.95, `the core did not fall during the cold: ${d.core}`);
      expect(d.effector < 0, `the model is not shivering: effector ${d.effector}`);
    }],
    ['feedback-toggle', async (h) => {
      await h.button(/^Feedback on/).click();
      await h.page.waitForTimeout(200);
      expect((await h.describe()).feedback === false, 'the toggle did not switch feedback off');
      await h.button(/^Feedback off/).click();
      await h.page.waitForTimeout(200);
      expect((await h.describe()).feedback === true, 'the toggle did not switch feedback back on');
    }],
    ['pause-and-scrub-by-keyboard', async (h) => {
      await h.button(/^Pause/).click();
      const t1 = (await h.describe()).t;
      await h.page.waitForTimeout(500);
      expect(near(t1, (await h.describe()).t, 1e-3), 'the clock kept running while paused');
      await h.stage.locator('canvas').first().focus();
      await h.page.keyboard.press('ArrowLeft');
      const t2 = (await h.describe()).t;
      expect(t2 < t1, `ArrowLeft did not scrub back: ${t1} -> ${t2}`);
    }],
    ['reset', async (h) => {
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.events.length === 0 && d.t < 5, `Reset left ${JSON.stringify(d)}`);
    }],
  ],
  pasteur: [
    ['boil', async (h) => {
      await h.button(/^Boil/).click();
      await h.page.waitForTimeout(400);
      expect((await h.describe()).boiled === true, `Boil did not register: ${JSON.stringify(await h.describe())}`);
    }],
    ['scrub-to-day-9-both-clear', async (h) => {
      await h.stage.locator('input[type=range]').fill('9');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(Math.round(d.day) === 9 && d.clearA && d.clearB, `at day 9 after boiling both should be clear: ${JSON.stringify(d)}`);
    }],
    ['snap-then-b-clouds', async (h) => {
      await h.button(/^Snap the neck/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).snapped !== false, 'the snap did not register');
      await h.stage.locator('input[type=range]').fill('16');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.clearA && !d.clearB, `a week after the snap B should be cloudy and A clear: ${JSON.stringify(d)}`);
    }],
    ['tilt-then-a-clouds', async (h) => {
      await h.button(/^Tilt flask A/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).tilted !== false, 'the tilt did not register');
      await h.stage.locator('input[type=range]').fill('24');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(!d.clearA, `a week after the tilt A should be cloudy: ${JSON.stringify(d)}`);
    }],
    ['arrow-keys-scrub', async (h) => {
      await h.focusable().focus();
      const d1 = await h.describe();
      await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(200);
      const d2 = await h.describe();
      expect(d2.day > d1.day, `ArrowRight did not advance the day: ${d1.day} -> ${d2.day}`);
    }],
  ],
  // ---- Chapter 2, The chemistry of life ----
  // Written by the worker who built these figures, against the numbers each one computes rather than
  // against what it happens to draw. The waiting is kept short: the gate runs every registered kind.
  soup: [
    ['freeze-locks-the-lattice', async (h) => {
      const before = await h.describe();
      expect(before.phase === 'liquid' && Math.abs(before.bondsPerWater - 3.5) < 0.3,
        `it should open as liquid water with about 3.5 bonds each: ${JSON.stringify(before)}`);
      await h.stage.locator('input[type=range]').fill('-10');
      await h.page.waitForTimeout(500);
      const d = await h.describe();
      expect(d.phase === 'ice', `at -10 C the phase is ${d.phase}`);
      expect(Math.abs(d.bondsPerWater - 4) < 0.2, `ice should hold four bonds each, not ${d.bondsPerWater}`);
      expect(d.meanBondLifePs > 1e5, `an ice bond should last far longer than a liquid one: ${d.meanBondLifePs} ps`);
    }],
    ['boil-drives-the-bonds-off', async (h) => {
      await h.stage.locator('input[type=range]').fill('115');
      await h.page.waitForTimeout(500);
      const d = await h.describe();
      expect(d.phase === 'steam', `at 115 C the phase is ${d.phase}`);
      expect(d.bondsPerWater < 1, `steam should have almost no hydrogen bonds: ${d.bondsPerWater}`);
      await h.stage.locator('input[type=range]').fill('25');
      await h.page.waitForTimeout(400);
    }],
    ['hydrogen-bond-toggle-hides-without-unmaking', async (h) => {
      await h.button(/Hydrogen bonds/).click();
      await h.page.waitForTimeout(300);
      const off = await h.describe();
      expect(off.showBonds === false, `the toggle did not hide the bonds: ${JSON.stringify(off)}`);
      expect(off.bonds > 100, 'hiding the links must not zero the count: the bonds are still there');
      await h.button(/Hydrogen bonds/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).showBonds === true, 'the toggle did not bring them back');
    }],
    ['click-names-a-molecule', async (h) => {
      const box = await h.stage.boundingBox();
      await h.page.mouse.click(box.x + box.width * 0.12, box.y + box.height * 0.5);
      await h.page.waitForTimeout(300);
      expect((await h.describe()).selected !== null, 'clicking in the water selected nothing');
      expect(await h.stage.locator('.fig-card').count() === 1, 'no card appeared for the selected molecule');
      await h.focusable().focus();
      await h.page.keyboard.press('Escape');
      await h.page.waitForTimeout(150);
      expect((await h.describe()).selected === null, 'Escape did not clear the card');
    }],
  ],

  bondlab: [
    ['ionic-pair-in-air', async (h) => {
      const d = await h.describe();
      expect(d.left === 'Na' && d.right === 'Cl', `the bench should open on sodium and chloride: ${d.left}/${d.right}`);
      expect(d.bond === 'ionic' && d.separationPm === 283, `not the ionic pair at rest: ${JSON.stringify(d)}`);
      expect(Math.abs(d.energyKjMol - 491) < 3, `a sodium-chloride pair at 283 pm in air is about 491 kJ/mol: ${d.energyKjMol}`);
      expect(d.thermalKjMol === 2.6, `the thermal reference should be 2.6 kJ/mol: ${d.thermalKjMol}`);
    }],
    ['water-collapses-the-ionic-bond', async (h) => {
      const dry = (await h.describe()).energyKjMol;
      await h.button(/^In water/).click();
      await h.page.waitForTimeout(300);
      const wet = await h.describe();
      expect(wet.medium === 'water', 'the switch did not flood the bench');
      expect(wet.separationPm === 283, 'flooding the bench must not move the atoms');
      expect(dry / wet.energyKjMol > 70, `water should divide it by about 78: ${dry} -> ${wet.energyKjMol}`);
    }],
    ['pull-it-apart-in-water', async (h) => {
      await h.stage.locator('.bl-bench').focus();
      for (let i = 0; i < 20; i += 1) await h.page.keyboard.press('Shift+ArrowRight');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.separationPm > 680, `twenty shifted steps should reach past 680 pm, not ${d.separationPm}`);
      expect(d.broken === true, `the bond should have given way by ${d.separationPm} pm`);
      expect(d.hydrationShell === 6, `each freed ion should pick up a shell of six waters: ${d.hydrationShell}`);
    }],
    ['the-covalent-pair-does-not-care-about-water', async (h) => {
      await h.stage.getByRole('button', { name: /Left atom: carbon/ }).click();
      await h.stage.getByRole('button', { name: /Right atom: oxygen/ }).click();
      await h.page.waitForTimeout(300);
      const wet = await h.describe();
      expect(wet.bond === 'covalent-polar' && wet.bondOrder === 2, `carbon and oxygen share two pairs: ${JSON.stringify(wet)}`);
      expect(Math.abs(wet.energyKjMol - 799) < 3, `a C=O bond is 799 kJ/mol: ${wet.energyKjMol}`);
      await h.button(/^In water/).click();
      await h.page.waitForTimeout(300);
      const dry = await h.describe();
      expect(Math.abs(dry.energyKjMol - wet.energyKjMol) < 0.05,
        `the medium must not change a covalent bond: ${wet.energyKjMol} -> ${dry.energyKjMol}`);
    }],
    ['drag-stretches-the-bond', async (h) => {
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(200);
      const before = (await h.describe()).separationPm;
      const box = await h.stage.locator('.bl-bench').boundingBox();
      await h.drag({ x: box.x + box.width * 0.62, y: box.y + box.height * 0.45 },
        { x: box.x + box.width * 0.9, y: box.y + box.height * 0.45 });
      await h.page.waitForTimeout(300);
      const after = await h.describe();
      expect(after.separationPm > before + 40, `dragging outwards did not stretch the bond: ${before} -> ${after.separationPm}`);
    }],
  ],

  water3d: [
    ['opens-on-liquid-water', async (h) => {
      const d = await h.describe();
      expect(d.angleDeg === 104.5 && d.bondLengthNm === 0.0958, `the geometry should be the real one: ${JSON.stringify(d)}`);
      expect(d.phase === 'liquid' && Math.abs(d.meanBonds - 3.5) < 0.5, `about three and a half bonds on average: ${d.meanBonds}`);
      expect(d.view && d.view.distance > 0, 'describe() must report a non-zero view distance');
    }],
    ['cooling-locks-the-lattice-and-floats', async (h) => {
      const warm = await h.describe();
      await h.stage.locator('input[type=range]').fill('-10');
      await h.page.waitForTimeout(600);
      const cold = await h.describe();
      expect(cold.phase === 'ice' && cold.latticeLocked === true, `it should have frozen: ${JSON.stringify(cold)}`);
      expect(cold.bondsHeld === 4, `ice holds exactly four: ${cold.bondsHeld}`);
      expect(cold.densityRel < warm.densityRel - 0.05, `freezing should lower the density: ${warm.densityRel} -> ${cold.densityRel}`);
      await h.stage.locator('input[type=range]').fill('25');
      await h.page.waitForTimeout(400);
    }],
    ['pull-a-neighbour-until-it-snaps', async (h) => {
      const before = await h.describe();
      expect(before.dragging === false && before.snapped === false, `nothing should be held before the pull: ${JSON.stringify({ dragging: before.dragging, snapped: before.snapped })}`);
      await h.button(/^Pull a neighbour/).click();
      await h.page.waitForTimeout(400);
      const d = await h.describe();
      expect(d.dragging === true, 'the pull did not register');
      // The pull holds one neighbour at 4.6 Å, past the 3.65 Å its bond gives way at, so `snapped` is
      // the figure's own verdict on that bond and does not depend on the clock. The other three bonds
      // blink on their own periods, so a count read before the click and again after it can rise on its
      // own (this step went red once, 2 -> 3, with no defect); what the count cannot do while one
      // neighbour is held away is reach four.
      expect(d.snapped === true, `the pulled neighbour's bond should have given way: ${JSON.stringify(d)}`);
      expect(d.bondsHeld <= 3, `with a neighbour held past the snap distance the count cannot be four: ${d.bondsHeld}`);
      await h.button(/^Let it go/).click();
      await h.page.waitForTimeout(600);
      const after = await h.describe();
      expect(after.dragging === false && after.snapped === false, `letting go did not release it: ${JSON.stringify({ dragging: after.dragging, snapped: after.snapped })}`);
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
    }],
    ['drag-orbits-and-reset-view', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      // From a corner, so the drag orbits instead of grabbing a neighbour molecule.
      await h.drag({ x: box.x + box.width * 0.12, y: box.y + box.height * 0.12 },
        { x: box.x + box.width * 0.3, y: box.y + box.height * 0.12 });
      await h.page.waitForTimeout(700);
      expect(Math.abs((await h.describe()).view.theta - before.theta) > 0.02, 'dragging did not orbit');
      await h.button(/^Reset view/).click();
      await h.page.waitForTimeout(900);
      expect((await h.describe()).view.distance > 0, 'Reset view left no view');
    }],
  ],

  waterprops: [
    ['tension-holds-the-needle', async (h) => {
      const d = await h.describe();
      expect(d.panel === 'tension' && d.hbondStrength === 1, `it should open on tension at full strength: ${JSON.stringify(d)}`);
      expect(Math.abs(d.tension.surfaceTensionMNm - 72) < 0.5, `water's surface tension is 72 mN/m: ${d.tension.surfaceTensionMNm}`);
      expect(d.tension.needleFloats === true, 'the needle should float at full strength');
    }],
    ['weaken-the-bond-and-all-four-fail-together', async (h) => {
      await h.stage.locator('input[type=range]').fill('0');
      await h.page.waitForTimeout(600);
      const d = await h.describe();
      expect(d.hbondStrength === 0, `the slider did not move: ${d.hbondStrength}`);
      expect(d.tension.needleFloats === false, 'with no hydrogen bonds the needle sinks');
      expect(d.ice.solidFloats === false, 'and the solid sinks');
      expect(d.ice.densestAtC === 0, `and the 4 C turn is gone: ${d.ice.densestAtC}`);
      await h.stage.locator('input[type=range]').fill('100');
      await h.page.waitForTimeout(400);
    }],
    ['the-heat-panel-and-its-comparison', async (h) => {
      await h.button(/^Warming up/).click();
      await h.page.waitForTimeout(1800);
      const d = await h.describe();
      expect(d.panel === 'heat', `the panel is ${d.panel}`);
      expect(d.heat.joulesAdded > 500, `the run should be under way: ${d.heat.joulesAdded} J`);
      expect(d.heat.comparisonC > d.heat.waterC + 5, `iron should be far ahead of water: ${JSON.stringify(d.heat)}`);
      await h.button(/Compare with ethanol/).click();
      await h.page.waitForTimeout(900);
      expect((await h.describe()).heat.comparison === 'ethanol', 'the comparison did not change');
    }],
    ['evaporation-cools-the-dish', async (h) => {
      await h.button(/^Evaporating/).click();
      await h.page.waitForTimeout(2200);
      const d = await h.describe();
      expect(d.panel === 'evaporation' && d.evaporation.escaped > 0, 'nothing evaporated');
      expect(d.evaporation.meanSpeedRel < 1, `those left behind should be slower: ${d.evaporation.meanSpeedRel}`);
    }],
    ['freezing-starts-warm-and-densest-at-four', async (h) => {
      // Deliberately not waiting out the fourteen-second freeze: the claim that matters at this
      // strength is the 4 C turn, and the frozen state is covered by the strength-0 step above.
      await h.button(/^Freezing/).click();
      await h.button(/^Restart/).click();
      await h.page.waitForTimeout(400);
      const d = await h.describe();
      expect(d.panel === 'ice', `the panel is ${d.panel}`);
      expect(d.ice.latticeFormed === false && d.ice.tempC > 15, `the tank should start warm: ${JSON.stringify(d.ice)}`);
      expect(Math.abs(d.ice.densestAtC - 4) < 0.1, `water is densest at 4 C: ${d.ice.densestAtC}`);
    }],
  ],

  phlab: [
    ['ten-drops-of-acid', async (h) => {
      for (let i = 0; i < 10; i += 1) await h.button(/Add acid/).click();
      const d = await h.describe();
      expect(d.dropsAdded === 10 && d.mmolAdded === 10, `ten drops gave ${d.dropsAdded} drops, ${d.mmolAdded} mmol`);
      expect(d.ph.water < 2.5, `water should have plunged: ${d.ph.water}`);
      expect(d.ph.buffer > 5.5 && d.ph.plasma > 7, `the buffered beakers should still hold: ${JSON.stringify(d.ph)}`);
      expect(d.inRange === false, `plasma should have left 7.35-7.45 by 10 mmol: ${d.ph.plasma}`);
    }],
    ['the-buffer-runs-out', async (h) => {
      for (let i = 0; i < 20; i += 1) await h.button(/Add acid/).click();
      const d = await h.describe();
      expect(d.mmolAdded === 30, `mmol ${d.mmolAdded}`);
      expect(d.exhausted === true, `not exhausted at 30 mmol: remaining ${d.bufferRemaining}`);
      expect(d.speciesMmol.hco3 < 1, `the bicarbonate should be gone: ${d.speciesMmol.hco3}`);
      expect(d.ph.buffer < 3, `the buffered curve should have fallen: ${d.ph.buffer}`);
    }],
    ['the-window-follows-the-chosen-beaker', async (h) => {
      await h.button(/Inside: plasma/).click();
      expect((await h.describe()).beaker === 'plasma', 'the inset did not follow plasma');
      await h.button(/Inside: water/).click();
      expect((await h.describe()).beaker === 'water', 'the inset did not follow water');
    }],
    ['reset-then-base', async (h) => {
      await h.button(/Reset/).click();
      let d = await h.describe();
      expect(d.dropsAdded === 0 && d.curve.length === 1, `reset left ${d.dropsAdded} drops`);
      for (let i = 0; i < 4; i += 1) await h.button(/Add base/).click();
      d = await h.describe();
      expect(d.reagent === 'base' && d.mmolAdded === -4, `reagent ${d.reagent}, mmol ${d.mmolAdded}`);
      expect(d.ph.water > 10, `base should have raised the water: ${d.ph.water}`);
    }],
    ['arrow-keys-pour-and-take-back', async (h) => {
      await h.button(/Reset/).click();
      await h.focusable().focus();
      for (let i = 0; i < 4; i += 1) await h.page.keyboard.press('ArrowRight');
      let d = await h.describe();
      expect(d.dropsAdded === 4, `four ArrowRight gave ${d.dropsAdded} drops`);
      await h.page.keyboard.press('ArrowLeft');
      d = await h.describe();
      expect(d.dropsAdded === 3, `ArrowLeft should take a drop back: ${d.dropsAdded}`);
    }],
  ],

  carbonkit: [
    ['grow-a-chain', async (h) => {
      await h.focusable().focus();
      for (let i = 0; i < 5; i += 1) await h.page.keyboard.press('Enter');
      const d = await h.describe();
      expect(d.carbons === 6 && d.match === 'hexane', `${d.carbons} carbons, match ${d.match}`);
      expect(d.freeBonds === 14, `hexane carries 14 hydrogens: ${d.freeBonds}`);
      expect(d.isomerOf === '2-methylpentane', `isomer ${d.isomerOf}`);
    }],
    ['a-group-takes-a-hydrogen', async (h) => {
      await h.button(/Reset/).click();
      await h.focusable().focus();
      await h.page.keyboard.press('Enter');
      const before = await h.describe();
      await h.page.keyboard.press('1');
      const d = await h.describe();
      expect(d.formula === 'C2H6O' && d.match === 'ethanol', `formula ${d.formula}, match ${d.match}`);
      expect(d.freeBonds === before.freeBonds - 1, `a hydroxyl costs one hydrogen: ${before.freeBonds} -> ${d.freeBonds}`);
      expect(d.polar === true && d.solubility === 'high', `polar ${d.polar}, solubility ${d.solubility}`);
      expect(d.isomerOf === 'dimethyl ether', `isomer ${d.isomerOf}`);
    }],
    ['four-bonds-and-no-more', async (h) => {
      await h.button(/Reset/).click();
      await h.focusable().focus();
      for (let i = 0; i < 5; i += 1) await h.page.keyboard.press('1');
      const d = await h.describe();
      expect(d.groups.length === 4, `the bench accepted a fifth bond: ${JSON.stringify(d.groups)}`);
      expect(d.freeBonds === 0 && d.valid === true, `freeBonds ${d.freeBonds}, valid ${d.valid}`);
    }],
    ['close-a-ring-and-make-benzene', async (h) => {
      await h.button(/Reset/).click();
      await h.focusable().focus();
      for (let i = 0; i < 5; i += 1) await h.page.keyboard.press('Enter');
      await h.page.keyboard.press('r');
      expect((await h.describe()).match === 'cyclohexane', 'the ring did not close to cyclohexane');
      for (const k of ['b', 'ArrowLeft', 'ArrowLeft', 'b', 'ArrowLeft', 'ArrowLeft', 'b']) await h.page.keyboard.press(k);
      const d = await h.describe();
      expect(d.formula === 'C6H6' && d.match === 'benzene', `formula ${d.formula}, match ${d.match}`);
      expect(d.rings === 1 && d.doubleBonds === 3, `rings ${d.rings}, doubles ${d.doubleBonds}`);
    }],
    ['glycine-is-a-zwitterion', async (h) => {
      await h.button(/Reset/).click();
      await h.focusable().focus();
      await h.page.keyboard.press('3');
      await h.page.keyboard.press('4');
      const d = await h.describe();
      expect(d.match === 'glycine' && d.chargeAtCellPh === 'zwitterion', `match ${d.match}, charge ${d.chargeAtCellPh}`);
      expect(d.formula === 'C2H5NO2', `formula ${d.formula}`);
    }],
    ['clicking-a-carbon-grows-from-it', async (h) => {
      await h.button(/Reset/).click();
      const c = await h.centre('.ck-hit');
      await h.page.mouse.click(c.x, c.y);
      await h.page.mouse.click(c.x, c.y);
      const d = await h.describe();
      expect(d.carbons === 2, `clicking a carbon twice should grow the chain: ${d.carbons}`);
    }],
  ],

  polymer: [
    ['three-stops-then-the-bond', async (h) => {
      for (let i = 0; i < 3; i += 1) { await h.button(/Step/).click(); await h.page.waitForTimeout(420); }
      const d = await h.describe();
      expect(d.step === 3 && d.direction === 'condensation', `step ${d.step}, direction ${d.direction}`);
      expect(d.units === 1 && d.watersReleased === 0, 'the unit is not counted until the reaction is committed');
      expect(d.donates.hydroxylFrom === 'glucose 1' && d.donates.hydrogenFrom === 'glucose 2', JSON.stringify(d.donates));
    }],
    ['committing-releases-a-water', async (h) => {
      await h.button(/Step/).click();
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.units === 2 && d.bonds === 1 && d.watersReleased === 1, `units ${d.units}, bonds ${d.bonds}, waters ${d.watersReleased}`);
    }],
    ['n-units-cost-n-minus-one-waters', async (h) => {
      for (let i = 0; i < 3; i += 1) await h.button(/Add monomer/).click();
      const d = await h.describe();
      expect(d.units === 5 && d.bonds === 4 && d.watersReleased === 4, `units ${d.units}, bonds ${d.bonds}, waters ${d.watersReleased}`);
    }],
    ['backwards-takes-a-water-in', async (h) => {
      for (let i = 0; i < 5; i += 1) { await h.button(/Back/).click(); await h.page.waitForTimeout(220); }
      const d = await h.describe();
      expect(d.direction === 'hydrolysis' && d.energyDirection === 'downhill', `direction ${d.direction}, energy ${d.energyDirection}`);
      expect(d.watersConsumed >= 1 && d.units < 5, `consumed ${d.watersConsumed}, units ${d.units}`);
    }],
    ['alpha-and-beta', async (h) => {
      await h.button(/Glucose form/).click();
      let d = await h.describe();
      expect(d.sugarForm === 'beta' && d.chainShape === 'straight', `form ${d.sugarForm}, shape ${d.chainShape}`);
      await h.button(/Glucose form/).click();
      d = await h.describe();
      expect(d.sugarForm === 'alpha' && d.chainShape === 'coiled', `form ${d.sugarForm}, shape ${d.chainShape}`);
    }],
    ['the-family-switch', async (h) => {
      await h.button(/Two amino acids/).click();
      let d = await h.describe();
      expect(d.bondName === 'peptide' && d.sugarForm === null, `bond ${d.bondName}, form ${d.sugarForm}`);
      expect(d.donates.hydroxylFrom === 'glycine' && d.donates.hydrogenFrom === 'alanine', JSON.stringify(d.donates));
      await h.button(/Glycerol/).click();
      d = await h.describe();
      expect(d.bondName === 'ester' && d.units === 0, `a fat starts with no tails: bond ${d.bondName}, units ${d.units}`);
      expect(d.donates.hydroxylFrom === 'fatty acid' && d.donates.hydrogenFrom === 'glycerol', JSON.stringify(d.donates));
    }],
    ['a-fat-costs-three-waters', async (h) => {
      for (let i = 0; i < 12; i += 1) { await h.button(/Step/).click(); await h.page.waitForTimeout(170); }
      const d = await h.describe();
      expect(d.units === 3 && d.watersReleased === 3, `three tails and three waters: ${d.units}, ${d.watersReleased}`);
    }],
    ['play-and-pause', async (h) => {
      await h.button(/Play the reaction/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).playing === true, 'Play did not start');
      await h.page.waitForTimeout(2200);
      const a = await h.describe();
      expect(a.t > 1.5, `the clock did not run: ${a.t}`);
      await h.button(/Pause the reaction/).click();
      const b = await h.describe();
      await h.page.waitForTimeout(700);
      const c = await h.describe();
      expect(b.playing === false, `pause left playing ${b.playing}`);
      expect(b.step === c.step && b.units === c.units, 'it kept moving while paused');
    }],
  ],

  foldlab: [
    ['the-search-is-visible-and-lands-folded', async (h) => {
      const before = await h.describe();
      expect(before.foldState === 'folded', `the bench should open folded: ${before.foldState}`);
      await h.button(/^Fold/).click();
      await h.page.waitForTimeout(220);
      const mid = await h.describe();
      await h.page.waitForTimeout(4200);
      const d = await h.describe();
      expect(mid.steps < d.steps, `the search should be visible: ${mid.steps} then ${d.steps}`);
      expect(d.foldState === 'folded', `foldState ${d.foldState}`);
      expect(d.buriedFraction >= 0.6, `the core should be buried: ${d.buriedFraction}`);
      expect(d.coords.length === d.length, `coords ${d.coords.length} for ${d.length} residues`);
    }],
    ['the-same-sequence-reaches-the-same-fold', async (h) => {
      for (let i = 0; i < 4; i += 1) { await h.button(/^Fold/).click(); await h.page.waitForTimeout(4200); }
      const d = await h.describe();
      expect(d.sameFoldFromDifferentStarts >= 3, `only ${d.sameFoldFromDifferentStarts} of the last 5 runs reached this fold`);
    }],
    ['a-residue-can-be-changed', async (h) => {
      const before = await h.describe();
      await h.stage.locator('.fl-seq .fl-hit').nth(4).click();
      const d = await h.describe();
      expect(d.sequence !== before.sequence, 'clicking a residue did not change it');
      expect(d.foldState === 'unfolded', `a new sequence must be refolded: ${d.foldState}`);
    }],
    ['length-has-a-floor-and-a-ceiling', async (h) => {
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(700);
      await h.button(/^Longer/).click();
      await h.button(/^Longer/).click();
      let d = await h.describe();
      expect(d.length === 24, `length ${d.length}`);
      for (let i = 0; i < 12; i += 1) await h.button(/^Shorter/).click();
      d = await h.describe();
      expect(d.length === 16, `the floor is 16: ${d.length}`);
    }],
    ['heat-denatures-and-boiling-aggregates', async (h) => {
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(4200);
      const heat = h.stage.locator('input[type=range]').first();
      await heat.focus();
      for (let i = 0; i < 45; i += 1) await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(1800);
      let d = await h.describe();
      expect(d.tempC === 70 && d.foldState === 'denatured', `temp ${d.tempC}, state ${d.foldState}`);
      for (let i = 0; i < 45; i += 1) await h.page.keyboard.press('ArrowLeft');
      await h.page.waitForTimeout(1800);
      d = await h.describe();
      expect(d.foldState === 'folded', `below 75 °C it should come back: ${d.foldState}`);
      for (let i = 0; i < 75; i += 1) await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(1800);
      d = await h.describe();
      expect(d.foldState === 'aggregated', `100 °C should aggregate it: ${d.foldState}`);
      expect(d.buriedFraction < 0.45, `the core should be open: ${d.buriedFraction}`);
      for (let i = 0; i < 75; i += 1) await h.page.keyboard.press('ArrowLeft');
      await h.page.waitForTimeout(1800);
      d = await h.describe();
      expect(d.foldState === 'aggregated', `cooling must not undo it: ${d.foldState}`);
    }],
    ['ph-strips-the-charges', async (h) => {
      const ph = h.stage.locator('input[type=range]').nth(1);
      await ph.focus();
      for (let i = 0; i < 44; i += 1) await h.page.keyboard.press('ArrowLeft');
      await h.page.waitForTimeout(1800);
      const d = await h.describe();
      expect(d.ph <= 3.1, `pH ${d.ph}`);
      expect(d.ionicStrength < 0.05, `the charges should be gone: ${d.ionicStrength}`);
    }],
    ['levels-and-a-second-chain', async (h) => {
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(4200);
      await h.button(/^Levels/).click();
      let d = await h.describe();
      expect(d.levelsShown.join(',') === 'primary,secondary,tertiary', `levels ${JSON.stringify(d.levelsShown)}`);
      await h.button(/^Second chain/).click();
      await h.page.waitForTimeout(5200);
      d = await h.describe();
      expect(d.chains === 2, `chains ${d.chains}`);
      expect(d.levelsShown.includes('quaternary'), `levels ${JSON.stringify(d.levelsShown)}`);
      expect(d.coords.length === d.length * 2, `coords ${d.coords.length}`);
    }],
  ],

  // ---- Chapter 3, Cells: symbiont, cytoskeleton, cilium, plantcell3d ----
  // Asserted against what each figure computes (verdicts, positions, arrangements, volumes), never
  // against what it draws; the step screenshots in out/drive/ are the check for the pixels.
  symbiont: [
    ['the-double-membrane-settles-nothing', async (h) => {
      const before = await h.describe();
      expect(before.observation === null && before.tested.length === 0, `it should open with nothing tested: ${JSON.stringify(before)}`);
      await h.button(/^Two membranes/).click();
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.observation === 'double-membrane', `the row did not select: ${d.observation}`);
      expect(d.verdict.endosymbiosis === 'supports' && d.verdict.infolding === 'supports', `both hypotheses predict two membranes: ${JSON.stringify(d.verdict)}`);
      expect(d.discriminates === false && d.discriminatingCount === 0, `two membranes must not count as discriminating: ${JSON.stringify(d)}`);
      expect(d.highlighted === 'membranes', `the membranes should be highlighted: ${d.highlighted}`);
    }],
    ['circular-dna-discriminates', async (h) => {
      await h.button(/^Circular DNA/).click();
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.observation === 'circular-dna' && d.highlighted === 'dna', `row 2 did not select the genome: ${JSON.stringify(d)}`);
      expect(d.verdict.endosymbiosis === 'supports' && d.verdict.infolding === 'contradicts', JSON.stringify(d.verdict));
      expect(d.discriminates === true && d.discriminatingCount === 1, `one of two should discriminate: ${JSON.stringify(d)}`);
      expect(d.tested.join(',') === 'double-membrane,circular-dna', `the tally keeps order: ${d.tested}`);
    }],
    ['the-chloroplast-comes-forward-and-keeps-the-tally', async (h) => {
      await h.button(/^Chloroplast/).click();
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.organelle === 'chloroplast', `the front organelle is ${d.organelle}`);
      expect(d.tested.length === 2 && d.observation === 'circular-dna', `switching organelle must not touch the reasoning: ${JSON.stringify(d)}`);
    }],
    ['cut-open-toggles-the-section', async (h) => {
      expect((await h.describe()).open === true, 'the chloroplast should start cut open');
      await h.button(/^Cut open/).click();
      await h.page.waitForTimeout(600);
      expect((await h.describe()).open === false, 'Cut open did not close the organelle');
      await h.button(/^Cut open/).click();
      await h.page.waitForTimeout(600);
      expect((await h.describe()).open === true, 'Cut open did not reopen it');
    }],
    ['the-back-organelle-is-a-keyboard-target', async (h) => {
      await h.stage.locator('.sy-backhit').focus();
      await h.page.keyboard.press('Enter');
      await h.page.waitForTimeout(300);
      expect((await h.describe()).organelle === 'mitochondrion', 'Enter on the back organelle did not bring it forward');
    }],
    ['all-seven-then-reset', async (h) => {
      for (const re of [/^Bacterial-type ribosomes/, /^Antibiotics/, /^Division by fission/, /^Genes match/, /^Most genes/]) {
        await h.button(re).click();
        await h.page.waitForTimeout(150);
      }
      let d = await h.describe();
      expect(d.tested.length === 7 && d.discriminatingCount === 5, `seven tested, five discriminate: ${JSON.stringify(d)}`);
      expect(d.observation === 'genes-in-nucleus' && d.discriminates === false, `the last row settles nothing either: ${JSON.stringify(d)}`);
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(300);
      d = await h.describe();
      expect(d.tested.length === 0 && d.observation === null && d.discriminatingCount === 0, `Reset left ${JSON.stringify(d)}`);
    }],
  ],

  cytoskeleton: [
    ['kinesin-walks-to-the-plus-end', async (h) => {
      const before = await h.describe();
      expect(before.filament === 'microtubule' && before.motor === 'kinesin' && before.compatible, `it should open with kinesin on a microtubule: ${JSON.stringify(before)}`);
      expect(before.filamentDiameterNm === 25 && before.stepNm === 8 && before.speedNmPerS === 800, JSON.stringify(before));
      await h.page.waitForTimeout(1500);
      const d = await h.describe();
      expect(d.direction === 'plus' && d.positionNm > before.positionNm && d.steps > 0, `the motor did not walk: ${JSON.stringify(d)}`);
    }],
    ['dynein-goes-the-other-way', async (h) => {
      await h.button(/^Dynein/).click();
      await h.page.waitForTimeout(200);
      const start = await h.describe();
      expect(start.motor === 'dynein' && start.direction === 'minus' && start.stepNm === 8, JSON.stringify(start));
      await h.page.waitForTimeout(1200);
      const d = await h.describe();
      expect(d.positionNm < start.positionNm, `dynein should walk toward the minus end: ${start.positionNm} -> ${d.positionNm}`);
    }],
    ['myosin-is-refused-on-a-microtubule', async (h) => {
      await h.button(/^Myosin/).click();
      await h.page.waitForTimeout(200);
      const d = await h.describe();
      expect(d.motor === 'myosin' && d.compatible === false && d.stalled === true && d.direction === 'none', JSON.stringify(d));
      const msg = await h.stage.locator('.cy-msg').textContent();
      expect(/cannot walk/i.test(msg), `the refusal should say why: ${JSON.stringify(msg.slice(0, 80))}`);
    }],
    ['actin-accepts-myosin', async (h) => {
      await h.button(/^Actin filament/).click();
      await h.page.waitForTimeout(200);
      const d = await h.describe();
      expect(d.filament === 'actin' && d.filamentDiameterNm === 7 && d.compatible === true && d.stepNm === 36, JSON.stringify(d));
      expect(d.direction === 'plus' && d.speedNmPerS === 400, JSON.stringify(d));
    }],
    ['no-atp-stalls-and-does-not-drift', async (h) => {
      const range = h.stage.locator('input[type=range]');
      await range.fill('0');
      await h.page.waitForTimeout(200);
      const stalled = await h.describe();
      expect(stalled.atp === 0 && stalled.stalled === true && stalled.speedNmPerS === 0 && stalled.direction === 'none', JSON.stringify(stalled));
      await h.page.waitForTimeout(600);
      expect(near((await h.describe()).positionNm, stalled.positionNm, 0.5), 'a stalled cargo must stay where it is');
      await range.fill('100');
      await h.page.waitForTimeout(200);
      expect((await h.describe()).stalled === false, 'ATP back to full did not restart the motor');
    }],
    ['latrunculin-takes-the-track-away', async (h) => {
      await h.button(/^Latrunculin/).click();
      await h.page.waitForTimeout(200);
      const d = await h.describe();
      expect(d.drug === 'latrunculin' && d.trackIntact === false && d.stalled === true, JSON.stringify(d));
      await h.button(/^Latrunculin/).click();
      await h.page.waitForTimeout(200);
      expect((await h.describe()).trackIntact === true, 'pressing the drug again did not clear it');
    }],
    ['taxol-freezes-a-microtubule-but-transport-goes-on', async (h) => {
      await h.button(/^Microtubule/).click();
      await h.button(/^Kinesin/).click();
      await h.button(/^Taxol/).click();
      await h.page.waitForTimeout(200);
      const d = await h.describe();
      expect(d.drug === 'taxol' && d.trackIntact === true && d.stalled === false, JSON.stringify(d));
      await h.button(/^Nocodazole/).click();
      await h.page.waitForTimeout(200);
      const n = await h.describe();
      expect(n.drug === 'nocodazole' && n.trackIntact === false && n.stalled === true, JSON.stringify(n));
    }],
    ['race-diffusion-then-reset', async (h) => {
      await h.button(/^Race/).click();
      await h.page.waitForTimeout(200);
      expect((await h.describe()).diffusionRace === true, 'the race did not start');
      await h.button(/^Race/).click();
      await h.page.waitForTimeout(200);
      expect((await h.describe()).diffusionRace === false, 'pressing Race again did not end it');
      // Reset puts the cargo back at the start; the clock is not pinned here, so it walks on at once.
      await h.button(/^Reset/).click();
      await h.page.waitForTimeout(200);
      const d = await h.describe();
      expect(d.drug === null && d.atp === 1 && d.trackIntact === true && d.positionNm < 80, `Reset left ${JSON.stringify(d)}`);
    }],
  ],

  cilium: [
    ['opens-as-nine-plus-two', async (h) => {
      const d = await h.describe();
      expect(d.mode === 'motile' && d.arrangement === '9+2' && d.centralPair === true && d.doublets === 9, JSON.stringify(d));
      expect(d.dyneinArms === true && d.nexinLinks === true && d.beating === false && d.bendAmplitudeUm === 0, JSON.stringify(d));
      expect(d.view && d.view.distance > 0, 'describe() must report a non-zero view distance');
    }],
    ['the-section-slides-to-the-basal-body', async (h) => {
      const section = h.stage.locator('input[type=range]').nth(1);
      await section.fill('2');
      await h.page.waitForTimeout(400);
      let d = await h.describe();
      expect(d.region === 'basal-body' && d.arrangement === '9 triplets' && d.centralPair === false, `at 0.02 µm: ${JSON.stringify(d)}`);
      await section.fill('50');
      await h.page.waitForTimeout(400);
      d = await h.describe();
      expect(d.region === 'transition' && d.arrangement === '9+0' && d.centralPair === false, `at 0.5 µm: ${JSON.stringify(d)}`);
      await section.fill('180');
      await h.page.waitForTimeout(400);
      d = await h.describe();
      expect(d.region === 'shaft' && d.arrangement === '9+2' && d.sectionUm === 1.8, `at 1.8 µm: ${JSON.stringify(d)}`);
    }],
    ['beat-turns-sliding-into-a-bend', async (h) => {
      await h.button(/^Beat/).click();
      await h.page.waitForTimeout(700);
      const d = await h.describe();
      expect(d.beating === true && d.bendAmplitudeUm > 0.05, `the shaft should bend: ${JSON.stringify(d)}`);
      expect(d.activeDoublets.length === 3 && d.activeDoublets.every((i) => i >= 1 && i <= 9), `three doublets drive a stroke: ${JSON.stringify(d.activeDoublets)}`);
      expect(d.stroke === 'effective' || d.stroke === 'recovery', `stroke ${d.stroke}`);
      // The reader is told, not just the gate: the readout names the stroke and the doublets driving it.
      // describe() reported both before any readout existed, so this reads the stage's own text and
      // demands it agree with describe() at the same instant.
      const [text, now] = await h.page.evaluate((id) => {
        const el = document.getElementById(id);
        return [el.querySelector('.cl-read')?.textContent ?? '', el.describe()];
      }, 'lab-cilium');
      expect(new RegExp(now.stroke === 'effective' ? '^Effective' : '^Recovery').test(text), `the readout should name the ${now.stroke} stroke: ${JSON.stringify(text)}`);
      expect(now.activeDoublets.every((i) => new RegExp(`\\b${i}\\b`).test(text)), `the readout should name doublets ${now.activeDoublets.join(', ')}: ${JSON.stringify(text)}`);
      // The section caption names the region as well as the arrangement.
      const caption = await h.stage.locator('.cl-caption').textContent();
      expect(/shaft/.test(caption) && /9\+2/.test(caption), `the section caption should name the region and the arrangement: ${JSON.stringify(caption)}`);
    }],
    ['the-frequency-slider', async (h) => {
      await h.stage.locator('input[type=range]').first().fill('20');
      await h.page.waitForTimeout(300);
      expect((await h.describe()).beatHz === 20, 'the slider did not reach 20 Hz');
    }],
    ['no-dynein-arms-and-it-goes-limp', async (h) => {
      await h.button(/^Dynein arms/).click();
      await h.page.waitForTimeout(500);
      const d = await h.describe();
      expect(d.dyneinArms === false && d.beating === false && d.bendAmplitudeUm === 0 && d.activeDoublets.length === 0, JSON.stringify(d));
    }],
    ['arms-back-and-the-bend-returns', async (h) => {
      await h.button(/^Dynein arms/).click();
      await h.page.waitForTimeout(500);
      expect((await h.describe()).bendAmplitudeUm > 0.05, 'the arms back on should restore the bend');
    }],
    ['released-links-slide-instead-of-bending', async (h) => {
      await h.button(/^Show sliding/).click();
      await h.page.waitForTimeout(500);
      const d = await h.describe();
      expect(d.nexinLinks === false && d.beating === true && d.bendAmplitudeUm === 0 && d.stroke === 'none', JSON.stringify(d));
    }],
    ['links-back-and-sliding-becomes-bending-again', async (h) => {
      await h.button(/^Show sliding/).click();
      await h.page.waitForTimeout(500);
      const d = await h.describe();
      expect(d.nexinLinks === true && d.bendAmplitudeUm > 0.05, `the links did not come back: ${JSON.stringify(d)}`);
    }],
    ['a-primary-cilium-has-no-central-pair', async (h) => {
      await h.button(/^Primary/).click();
      await h.page.waitForTimeout(500);
      const d = await h.describe();
      expect(d.mode === 'primary' && d.arrangement === '9+0' && d.centralPair === false && d.dyneinArms === false && d.beating === false, JSON.stringify(d));
      await h.button(/^Primary/).click();
      await h.page.waitForTimeout(500);
      expect((await h.describe()).mode === 'motile', 'pressing Primary again did not return to motile');
    }],
    ['drag-orbits-and-reset-view', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      await h.drag({ x: box.x + box.width * 0.3, y: box.y + box.height * 0.5 }, { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 });
      await h.page.waitForTimeout(700);
      expect(!near(before.theta, (await h.describe()).view.theta, 0.01), 'dragging did not orbit');
      await h.button(/^Reset view/).click();
      await h.page.waitForTimeout(900);
      expect((await h.describe()).view.distance > 0, 'Reset view left no view');
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
    }],
  ],

  plantcell3d: [
    ['opens-turgid-with-the-vacuole-most-of-the-cell', async (h) => {
      const d = await h.describe();
      expect(d.turgor === 1 && d.turgorState === 'turgid', `it should open fully turgid: ${JSON.stringify(d)}`);
      expect(d.vacuoleFraction > 0.75 && d.cytoplasmThicknessUm <= 1.5, `a turgid cell is mostly vacuole with a thin cytoplasm: ${d.vacuoleFraction}, ${d.cytoplasmThicknessUm} µm`);
      expect(d.structures >= 15 && d.plasmodesmata === 5 && d.cut === false && d.comparison === false, JSON.stringify(d));
      expect(d.view && d.view.distance > 0, 'describe() must report a non-zero view distance');
    }],
    ['cut-open', async (h) => {
      await h.button(/^Cut open/).click();
      await h.page.waitForTimeout(900);
      expect((await h.describe()).cut === true, 'Cut open did not register');
    }],
    ['half-the-water-and-the-cell-is-flaccid', async (h) => {
      await h.stage.locator('input[type=range]').fill('50');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.turgorState === 'flaccid' && d.vacuoleFraction < 0.75 && d.cytoplasmThicknessUm > 1.5, `at half turgor: ${JSON.stringify(d)}`);
    }],
    ['a-tenth-and-the-protoplast-leaves-the-wall', async (h) => {
      const flaccid = await h.describe();
      await h.stage.locator('input[type=range]').fill('10');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.turgorState === 'plasmolysed' && d.vacuoleFraction < 0.4 && d.cytoplasmThicknessUm > 2.5, `at a tenth: ${JSON.stringify(d)}`);
      expect(d.vacuoleFraction < flaccid.vacuoleFraction, 'the vacuole must keep shrinking as water leaves');
    }],
    ['water-back-and-turgor-returns', async (h) => {
      await h.stage.locator('input[type=range]').fill('100');
      await h.page.waitForTimeout(300);
      const d = await h.describe();
      expect(d.turgorState === 'turgid' && d.vacuoleFraction > 0.75, `water back in should restore turgor: ${JSON.stringify(d)}`);
    }],
    ['click-selects-a-structure', async (h) => {
      const box = await h.stage.boundingBox();
      await h.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.waitForTimeout(400);
      const d = await h.describe();
      expect(typeof d.selected === 'string' && d.selected.length > 0, `clicking the centre of the cut cell selected nothing: ${JSON.stringify(d)}`);
      expect(await h.stage.locator('.fig-card').count() === 1 && await h.stage.locator('.fig-card').isVisible(), 'no card appeared for the selected structure');
    }],
    ['escape-clears-the-selection', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Escape');
      await h.page.waitForTimeout(200);
      expect((await h.describe()).selected === null, 'Escape did not clear the selection');
    }],
    ['compare-puts-the-animal-cell-beside-it', async (h) => {
      await h.button(/^Compare/).click();
      await h.page.waitForTimeout(1000);
      const d = await h.describe();
      expect(d.comparison === true, 'Compare did not register');
      // The comparison is two captions under the two cells, each naming what only that cell has, and
      // the two animal-only structures labelled on the animal cell. It was a panel that covered the
      // animal cell, and this step read the panel's text, so it passed over the defect.
      const captions = await h.stage.locator('.pc-title:visible').allTextContents();
      expect(captions.length === 2, `two captions should hang under the two cells, not ${captions.length}`);
      const plant = captions.find((t) => /^Plant cell/.test(t)) || '';
      const animal = captions.find((t) => /^Animal cell/.test(t)) || '';
      expect(/chloroplasts/.test(plant) && /plasmodesmata/.test(plant), `the plant cell's caption should name what only it has: ${JSON.stringify(plant)}`);
      expect(/lysosomes/.test(animal) && /centrosome/.test(animal), `the animal cell's caption should name what only it has: ${JSON.stringify(animal)}`);
      const shown = await h.stage.locator('.fig-label:visible').allTextContents();
      expect(shown.includes('Lysosome') && shown.includes('Centrosome'), `the animal-only structures should be labelled on the animal cell; labels shown: ${shown.join(', ')}`);
    }],
    ['follow-a-plasmodesma', async (h) => {
      await h.button(/^Follow a plasmodesma/).click();
      await h.page.waitForTimeout(1200);
      const d = await h.describe();
      expect(d.following === true && d.cut === true && d.comparison === false, `following should cut and leave the comparison: ${JSON.stringify(d)}`);
      expect(d.view.distance < 12, `the camera should be close to the channel: ${d.view.distance}`);
      // What the view is for: the lining and the strand of ER through it, named on the channel itself.
      // Before this assertion the label went to a channel 11 µm off the stage and nothing was labelled.
      const shown = await h.stage.locator('.fig-label:visible').allTextContents();
      for (const want of ['Plasmodesma', 'Plasma membrane', 'Desmotubule']) expect(shown.some((t) => t.startsWith(want)), `the plasmodesma view should label "${want}"; labels shown: ${shown.join(', ')}`);
      // The card explains it and Escape dismisses it; it used to come straight back.
      expect(await h.stage.locator('.fig-card:visible').count() === 1, 'the plasmodesma card should be showing');
      await h.focusable().focus();
      await h.page.keyboard.press('Escape');
      await h.page.waitForTimeout(200);
      expect(await h.stage.locator('.fig-card:visible').count() === 0, 'Escape did not dismiss the plasmodesma card');
      expect((await h.describe()).following === true, 'dismissing the card must not leave the view');
    }],
    ['and-come-back-to-the-whole-cell', async (h) => {
      await h.button(/^Follow a plasmodesma/).click();
      await h.page.waitForTimeout(1200);
      const back = await h.describe();
      expect(back.following === false && back.view.distance > 60, `it should return to the whole cell: ${JSON.stringify(back.view)}`);
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      if (before) expect(await h.stage.locator('.fig-label:visible').count() > 5, 'fewer than six labels are on the stage with labels on');
    }],
    ['drag-orbits-arrows-orbit-and-wheel-zooms', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      await h.drag({ x: box.x + box.width * 0.5, y: box.y + box.height * 0.45 }, { x: box.x + box.width * 0.7, y: box.y + box.height * 0.45 });
      await h.page.waitForTimeout(700);
      const dragged = (await h.describe()).view;
      expect(!near(before.theta, dragged.theta, 0.01), `dragging did not orbit: theta ${before.theta} -> ${dragged.theta}`);
      await h.focusable().focus();
      await h.page.keyboard.press('ArrowLeft');
      await h.page.waitForTimeout(700);
      const keyed = (await h.describe()).view;
      expect(!near(dragged.theta, keyed.theta, 0.005), `ArrowLeft did not orbit: theta ${dragged.theta} -> ${keyed.theta}`);
      await h.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.mouse.wheel(0, -300);
      await h.page.waitForTimeout(700);
      expect((await h.describe()).view.distance < keyed.distance, 'the wheel did not zoom in');
    }],
    ['reset-view', async (h) => {
      await h.button(/^Reset view/).click();
      await h.page.waitForTimeout(900);
      const d = await h.describe();
      expect(d.view && d.view.distance > 0, `Reset view left no view: ${JSON.stringify(d)}`);
    }],
  ],

  // ---- Chapter 3, Cells: the four cell-scale figures ----
  // Against the numbers each figure computes. The stain and the wall take real seconds because they are
  // the figure's own clock, and the claim that matters is the state they end in.
  microscopes: [
    ['opens-on-the-light-microscope-at-196-nm', async (h) => {
      const d = await h.describe();
      expect(d.instrument === 'light' && d.wavelengthNm === 550 && d.na === 1.4, `it should open on the light microscope at 550 nm, NA 1.40: ${JSON.stringify(d)}`);
      expect(d.limitNm === 196, `550 ÷ (2 × 1.4) is 196 nm, not ${d.limitNm}`);
      expect(d.separationNm === 260 && d.resolved === true, `two objects 260 nm apart should be resolved at 196 nm: ${JSON.stringify(d)}`);
      expect(d.livingSpecimen === true && d.channels.length === 0, `a light microscope looks at a living, unlabelled specimen: ${JSON.stringify(d)}`);
      expect(d.smallestVisibleNm === 700, `the finest thing a 196 nm limit shows is a 700 nm mitochondrion: ${d.smallestVisibleNm}`);
    }],
    ['closing-the-gap-merges-the-pair', async (h) => {
      await h.focusable().focus();
      for (let i = 0; i < 8; i += 1) await h.page.keyboard.press('ArrowLeft');
      let d = await h.describe();
      expect(d.separationNm === 180, `eight ArrowLeft should take the gap from 260 to 180 nm: ${d.separationNm}`);
      expect(d.resolved === false, '180 nm is under the 196 nm limit, so the pair should be one blur');
      await h.stage.locator('input[type=range]').nth(2).fill('400');
      d = await h.describe();
      expect(d.separationNm === 400 && d.resolved === true, `at 400 nm the pair should separate again: ${JSON.stringify(d)}`);
    }],
    ['both-terms-of-abbe', async (h) => {
      await h.stage.locator('input[type=range]').nth(0).fill('400');
      let d = await h.describe();
      expect(d.wavelengthNm === 400 && d.limitNm === 143, `violet light should bring the limit to 143 nm: ${JSON.stringify(d)}`);
      await h.stage.locator('input[type=range]').nth(1).fill('0.5');
      d = await h.describe();
      expect(d.na === 0.5 && d.limitNm === 400, `a dry lens at NA 0.5 should raise it to 400 nm: ${JSON.stringify(d)}`);
      expect(d.resolved === true, 'a 400 nm gap at a 400 nm limit is just resolved');
      await h.stage.locator('input[type=range]').nth(2).fill('390');
      d = await h.describe();
      expect(d.resolved === false, `390 nm at a 400 nm limit should not be: ${JSON.stringify(d)}`);
    }],
    ['fluorescence-shows-what-it-cannot-resolve', async (h) => {
      await h.button(/^Fluorescence/).click();
      let d = await h.describe();
      expect(d.instrument === 'fluorescence' && d.limitNm === 400, `the same lens, the same limit: ${JSON.stringify(d)}`);
      expect(d.channels.length === 3 && d.livingSpecimen === true, `all three labels start on, on a living cell: ${JSON.stringify(d)}`);
      expect(d.smallestVisibleNm === 25, `a labelled 25 nm microtubule is visible below a 400 nm limit: ${d.smallestVisibleNm}`);
      await h.stage.getByRole('button', { name: /^Microtubules/ }).click();
      d = await h.describe();
      expect(d.channels.join(',') === 'mitochondria,nucleus', `the microtubule channel did not switch off: ${JSON.stringify(d.channels)}`);
      expect(d.smallestVisibleNm === 700, `with the microtubules unlabelled the finest thing is the mitochondrion again: ${d.smallestVisibleNm}`);
    }],
    ['electrons-fix-the-specimen', async (h) => {
      await h.button(/^Transmission EM/).click();
      let d = await h.describe();
      expect(d.instrument === 'tem' && d.livingSpecimen === false, `a TEM specimen is dead: ${JSON.stringify(d)}`);
      expect(d.limitNm === 2 && d.smallestVisibleNm === 7 && d.channels.length === 0, `at 2 nm a 7 nm membrane resolves: ${JSON.stringify(d)}`);
      expect(d.resolved === true, 'a 390 nm gap is far over a 2 nm limit');
      await h.button(/^Scanning EM/).click();
      d = await h.describe();
      expect(d.instrument === 'sem' && d.limitNm === 10 && d.smallestVisibleNm === 100, `an SEM sees surfaces, so its finest thing is a 100 nm microvillus: ${JSON.stringify(d)}`);
      await h.button(/^The naked eye/).click();
      d = await h.describe();
      expect(d.instrument === 'eye' && d.limitNm === 100_000 && d.livingSpecimen === true, `the eye's limit is 0.1 mm: ${JSON.stringify(d)}`);
      expect(d.resolved === false && d.smallestVisibleNm === 100_000, `nothing in a cell is 0.1 mm across: ${JSON.stringify(d)}`);
    }],
  ],

  'surface-volume': [
    ['opens-on-a-20-um-sphere', async (h) => {
      const d = await h.describe();
      expect(d.shape === 'sphere' && d.radiusUm === 10, `it should open on a 20 µm sphere: ${JSON.stringify(d)}`);
      expect(d.surfaceAreaUm2 === 1260 && d.volumeUm3 === 4190, `4πr² and 4πr³/3 at r = 10: ${d.surfaceAreaUm2}, ${d.volumeUm3}`);
      expect(d.ratioPerUm === 0.3 && d.sphereRatioPerUm === 0.3, `3/r is 0.300: ${d.ratioPerUm}`);
      expect(d.diffusionSeconds === 0.05, `r²/2D at 10 µm is 50 ms: ${d.diffusionSeconds}`);
      expect(d.verdict === 'comfortable' && d.supplyDemand > 10, `a 20 µm cell is well fed: ${JSON.stringify(d)}`);
      expect(d.clockSeconds === null, 'the clock should not be running yet');
    }],
    ['grow-it-to-a-millimetre', async (h) => {
      await h.stage.locator('input[type=range]').fill('1000');
      const d = await h.describe();
      expect(d.radiusUm === 500, `the right end of the axis is 1 mm across: ${d.radiusUm}`);
      expect(d.ratioPerUm === 0.006 && d.diffusionSeconds === 125, `3/500 and 500²/2000: ${d.ratioPerUm}, ${d.diffusionSeconds}`);
      expect(d.verdict === 'starving' && d.supplyDemand < 0.4, `at 500 µm the surface cannot feed the volume: ${JSON.stringify(d)}`);
    }],
    ['a-shape-buys-surface-at-fixed-volume', async (h) => {
      const V = (await h.describe()).volumeUm3;
      await h.button(/^Flat disc/).click();
      let d = await h.describe();
      expect(d.shape === 'disc' && d.volumeUm3 === V, `the disc must keep the volume: ${d.volumeUm3} vs ${V}`);
      expect(Math.abs(d.ratioPerUm / d.sphereRatioPerUm - 1.44) < 0.02, `a disc four times as wide as thick has 1.44× a sphere's ratio: ${d.ratioPerUm / d.sphereRatioPerUm}`);
      await h.button(/^Long cylinder/).click();
      d = await h.describe();
      expect(d.shape === 'cylinder' && Math.abs(d.ratioPerUm / d.sphereRatioPerUm - 1.73) < 0.02, `a rod ten times its width has 1.73×: ${d.ratioPerUm / d.sphereRatioPerUm}`);
      await h.button(/^Microvilli/).click();
      d = await h.describe();
      expect(d.shape === 'microvilli' && d.ratioPerUm / d.sphereRatioPerUm > 15, `a brush border should multiply the surface about twentyfold: ${d.ratioPerUm / d.sphereRatioPerUm}`);
      expect(d.verdict === 'comfortable', `with microvilli even a millimetre-wide cell is fed: ${JSON.stringify(d)}`);
      expect(d.volumeUm3 === V, `the villi must not change the volume: ${d.volumeUm3} vs ${V}`);
    }],
    ['home-and-arrow-keys', async (h) => {
      await h.stage.locator('input[type=range]').focus();
      await h.page.keyboard.press('Home');
      let d = await h.describe();
      expect(d.radiusUm === 0.5, `Home should reach the 1 µm end: ${d.radiusUm}`);
      await h.focusable().focus();
      for (let i = 0; i < 10; i += 1) await h.page.keyboard.press('ArrowRight');
      d = await h.describe();
      expect(Math.abs(d.radiusUm - 0.869) < 0.002, `ten ArrowRight on the drawing is 8% of the log axis, 1.74 µm across: ${d.radiusUm}`);
    }],
    ['run-the-clock', async (h) => {
      await h.button(/^Sphere/).click();
      await h.stage.locator('input[type=range]').fill('767');
      let d = await h.describe();
      expect(Math.abs(d.diffusionSeconds - 5.02) < 0.05, `a 200 µm cell waits about 5 s: ${d.diffusionSeconds}`);
      await h.button(/^Run the diffusion clock/).click();
      await h.page.waitForTimeout(1200);
      d = await h.describe();
      expect(d.clockSeconds !== null && d.clockSeconds > 0.5 && d.clockSeconds < 3, `1.2 s after starting, the clock should read about 1.2 s: ${d.clockSeconds}`);
      await h.button(/^Reset the diffusion clock/).click();
      d = await h.describe();
      expect(d.clockSeconds === null, `Reset should stop the clock: ${d.clockSeconds}`);
    }],
  ],

  // 《资治通鉴》 卷一 周纪一. These three address their controls by `data-` attribute rather than by
  // their labels, because their labels are Chinese: this file addresses 76 other controls by their
  // visible English text, and `docs/design/i18n.md` records that as the reason the gate cannot run on a
  // translated page. A `data-` attribute survives translation and rewording, which is what a gate wants.
  // Clock positions are read through `setTime` only where a figure's own clock is its interface; where a
  // control exists, the recipe presses the control, because driving the model directly is what a gate
  // must not do.
  'zj-split': [
    ['opens-at-403BC', async (h) => {
      const d = await h.describe();
      expect(d.phase === 'investiture', `it should open on the investiture, the year 通鉴 begins at: ${JSON.stringify(d)}`);
      expect(d.year === -403, `the opening year should be 前403: ${d.year}`);
      expect(d.commanded === true && d.zhi === '灭' && d.jinRemnant === '存', `at 403 the 智 clan is gone and 晋 still stands: ${JSON.stringify(d)}`);
      expect(d.houseStatus === '大夫→诸侯', `the three houses are being named 诸侯 at this step: ${d.houseStatus}`);
    }],
    ['the-first-step-is-jinyang', async (h) => {
      await h.stage.locator('.zjs-stop[data-step="0"]').click();
      await h.page.waitForTimeout(250);
      const d = await h.describe();
      expect(d.order === 0 && d.year === -453, `step 0 should be 前453年: ${JSON.stringify(d)}`);
      expect(d.commanded === false, `nothing has been commanded by the 周 court at 前453: ${JSON.stringify(d)}`);
    }],
    ['the-last-step-is-the-end-of-jin', async (h) => {
      await h.stage.locator('.zjs-stop[data-step="2"]').click();
      await h.page.waitForTimeout(250);
      const d = await h.describe();
      expect(d.order === 2 && d.year === -376 && d.jinRemnant === '亡', `step 2 should be 前376年, 晋亡: ${JSON.stringify(d)}`);
    }],
    ['keyboard-steps-through-the-three-dates', async (h) => {
      // Anchor the keyboard walk with a click rather than a bare `focus()`. The first version focused the
      // seat and pressed ArrowRight, and the gate reported order 2 after one press — a skip that the
      // figure's own handler cannot produce, since it does `go(order + 1)` and clamps. A click focuses the
      // button as a side effect of real input, which is what the reader does and what the gate should
      // exercise; the keyboard then moves from a state the recipe has established rather than assumed.
      await h.stage.locator('.zjs-stop[data-step="0"]').click();
      await h.page.waitForTimeout(250);
      const afterClick = await h.describe();
      expect(afterClick.order === 0, `clicking step 0 should select it: ${JSON.stringify(afterClick)}`);
      await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(250);
      const afterRight = await h.describe();
      expect(afterRight.order === 1,
        `ArrowRight from step 0 should reach 前403; the click left order ${afterClick.order} and ArrowRight gave ${afterRight.order}`);
      await h.page.keyboard.press('End');
      await h.page.waitForTimeout(250);
      expect((await h.describe()).order === 2, `End should reach the last step: ${JSON.stringify(await h.describe())}`);
      await h.page.keyboard.press('Home');
      await h.page.waitForTimeout(250);
      expect((await h.describe()).order === 0, `Home should return to the first step: ${JSON.stringify(await h.describe())}`);
    }],
  ],

  'zj-timeline': [
    ['opens-on-a-row-that-is-in-the-corpus', async (h) => {
      const d = await h.describe();
      expect(Number.isInteger(d.row) && d.rows > 1, `it should open on a row of a multi-row column: ${JSON.stringify(d)}`);
      expect(typeof d.yearLabel === 'string' && d.yearLabel.length > 0, `the row should carry a year: ${JSON.stringify(d)}`);
      expect(typeof d.event === 'string' && d.event.length > 0, `the row should carry an event: ${JSON.stringify(d)}`);
      expect(d.row >= 0 && d.row < d.rows, `the row index must be inside the column: ${JSON.stringify(d)}`);
    }],
    ['clicking-a-row-selects-it', async (h) => {
      const row = h.stage.locator('.zjt-row').nth(0);
      const label = await row.getAttribute('data-year');
      await row.click();
      await h.page.waitForTimeout(250);
      const d = await h.describe();
      expect(d.row === 0, `clicking the first row should select row 0: ${JSON.stringify(d)}`);
      expect(d.yearLabel === label, `the selected row should be the one clicked ("${label}"): ${d.yearLabel}`);
    }],
    ['keyboard-walks-the-column', async (h) => {
      await h.stage.locator('.zjt-row').nth(0).focus();
      await h.page.keyboard.press('ArrowDown');
      await h.page.waitForTimeout(250);
      expect((await h.describe()).row === 1, `ArrowDown should advance one row: ${JSON.stringify(await h.describe())}`);
      await h.page.keyboard.press('ArrowUp');
      await h.page.waitForTimeout(250);
      expect((await h.describe()).row === 0, `ArrowUp should come back: ${JSON.stringify(await h.describe())}`);
    }],
  ],

  'zj-words': [
    ['opens-on-a-taught-word', async (h) => {
      // `line` is an INDEX into the figure's own 原文 line list, not a string. The first version of this
      // recipe asserted a string and failed on a figure that was working: `line: 0` is the first line,
      // which is a pass, and `typeof 0 === 'number'`. An assertion written from what the field is *called*
      // rather than from what the figure *reports* is how a gate goes red on a correct figure.
      const d = await h.describe();
      expect(typeof d.selection === 'string' && d.selection.length > 0, `a word should be selected on open: ${JSON.stringify(d)}`);
      expect(typeof d.gloss === 'string' && d.gloss.length > 0, `the selected word should carry a gloss: ${JSON.stringify(d)}`);
      expect(Number.isInteger(d.line) && d.line >= 0, `it should name the 原文 line the word sits in, as an index: ${JSON.stringify(d)}`);
      expect(Array.isArray(d.chars) && d.chars.length > 0, `it should show how many characters the selected word is made of: ${JSON.stringify(d)}`);
      expect(d.entryType === 'word' || d.entryType === 'glyph', `it should say which layer the entry came from: ${JSON.stringify(d)}`);
      // `source` is which arm the figure is reading: 'chapter' when the page published a lexicon on the
      // handshake object, 'seed' when it fell back to its own three words. This recipe runs in the lab,
      // which publishes none, so it must say 'seed' — and that assertion is the one that would catch a
      // regression to the defect that shipped once: the figure used to fetch `tongjian/lexicon.js`
      // itself, which 404ed in the lab and on a chapter page alike. A figure that cannot reach its data
      // must say so in a field a gate reads, not fall back in silence.
      expect(d.source === 'seed', `in the lab, with no page-supplied lexicon, it should report source "seed": ${JSON.stringify(d)}`);
    }],
    ['a-chip-selects-its-word', async (h) => {
      const chip = h.stage.locator('.zjw-chip').nth(1);
      const want = await chip.getAttribute('data-word');
      await chip.click();
      await h.page.waitForTimeout(250);
      const d = await h.describe();
      expect(d.selection === want, `clicking the chip for "${want}" should select it: ${d.selection}`);
      expect(d.gloss.length > 0, `the newly selected word should carry a gloss: ${JSON.stringify(d)}`);
    }],
    ['every-chip-is-reachable-by-keyboard', async (h) => {
      const chips = await h.stage.locator('.zjw-chip').count();
      expect(chips >= 2, `the figure needs at least two words to compare: ${chips}`);
      await h.stage.locator('.zjw-chip').nth(0).focus();
      await h.page.keyboard.press('ArrowRight');
      await h.page.waitForTimeout(250);
      const after = await h.describe();
      expect(after.selection !== null && after.selection !== undefined, `ArrowRight should leave a word selected: ${JSON.stringify(after)}`);
    }],
  ],

  prokaryote: [
    ['opens-gram-positive-and-swimming', async (h) => {
      const d = await h.describe();
      expect(d.organism === 'bacterium' && d.envelope === 'gram-positive' && d.peptidoglycanNm === 30, `it should open as a gram-positive bacterium: ${JSON.stringify(d)}`);
      expect(d.wallLayers.join(',') === 'peptidoglycan,plasma membrane', `outside in: ${JSON.stringify(d.wallLayers)}`);
      expect(d.wallIntact === true && d.fate === 'intact' && d.externalSolute === 1 && d.stain === null && d.treatment === null, JSON.stringify(d));
      expect(d.appendages.join(',') === 'flagella' && (d.motility === 'run' || d.motility === 'tumble'), `with a flagellum it should be swimming: ${JSON.stringify(d)}`);
    }],
    ['penicillin-only-bites-a-growing-cell', async (h) => {
      await h.button(/^Penicillin/).click();
      await h.page.waitForTimeout(1300);
      let d = await h.describe();
      expect(d.treatment === 'penicillin' && d.growing === false, `penicillin on a resting cell: ${JSON.stringify(d)}`);
      expect(d.wallIntact === true && d.peptidoglycanNm === 30, `a cell that is not growing makes no cross-links to block: ${JSON.stringify(d)}`);
      await h.button(/^Growing/).click();
      await h.page.waitForTimeout(4600);
      d = await h.describe();
      expect(d.growing === true && d.wallIntact === false && d.peptidoglycanNm === 0, `four seconds of growth under penicillin should have cost the wall: ${JSON.stringify(d)}`);
      expect(d.wallLayers.join(',') === 'plasma membrane', `the wall should be gone from the layers: ${JSON.stringify(d.wallLayers)}`);
      expect(d.fate === 'swollen', `no wall in an isotonic medium: swollen, not burst: ${d.fate}`);
    }],
    ['dilute-the-medium-and-it-bursts', async (h) => {
      await h.stage.locator('input[type=range]').fill('30');
      await h.page.waitForTimeout(1600);
      const d = await h.describe();
      expect(d.externalSolute === 0.3, `the slider did not dilute the medium: ${d.externalSolute}`);
      expect(d.fate === 'lysed' && d.motility === 'none', `no wall and a dilute medium should burst it: ${JSON.stringify(d)}`);
    }],
    ['reset-then-plasmolyse', async (h) => {
      await h.button(/^Reset the cell/).click();
      let d = await h.describe();
      expect(d.fate === 'intact' && d.wallIntact === true && d.treatment === null && d.externalSolute === 1, `Reset should give the wall back: ${JSON.stringify(d)}`);
      await h.stage.locator('input[type=range]').fill('180');
      d = await h.describe();
      expect(d.fate === 'plasmolysed', `at 1.8× the cell should plasmolyse, wall or no wall: ${d.fate}`);
      await h.stage.locator('input[type=range]').fill('100');
      expect((await h.describe()).fate === 'intact', 'back to isotonic, back to intact');
    }],
    ['the-gram-stain-holds-in-a-thick-wall', async (h) => {
      await h.button(/^Run the gram stain/).click();
      await h.page.waitForTimeout(5700);
      const d = await h.describe();
      expect(d.stain === 'purple', `thirty nanometres of peptidoglycan should keep the crystal violet: ${JSON.stringify(d)}`);
    }],
    ['washing-the-stain-off', async (h) => {
      await h.button(/^Wash the stain off/).click();
      const d = await h.describe();
      expect(d.stain === null, `washing should clear the stain: ${d.stain}`);
    }],
    ['a-thin-wall-washes-out-pink', async (h) => {
      await h.button(/^Gram-negative/).click();
      let d = await h.describe();
      expect(d.envelope === 'gram-negative' && d.peptidoglycanNm === 3, `gram-negative is 3 nm of peptidoglycan: ${JSON.stringify(d)}`);
      expect(d.wallLayers.join(',') === 'outer membrane,peptidoglycan,plasma membrane', `outside in: ${JSON.stringify(d.wallLayers)}`);
      await h.button(/^Run the gram stain/).click();
      await h.page.waitForTimeout(5700);
      d = await h.describe();
      expect(d.stain === 'pink', `the alcohol should wash it out and the safranin show: ${JSON.stringify(d)}`);
    }],
    ['archaea-have-nothing-for-lysozyme-to-cut', async (h) => {
      await h.button(/^Archaeal/).click();
      const d = await h.describe();
      expect(d.organism === 'archaeon' && d.envelope === 'archaeal' && d.peptidoglycanNm === 0, JSON.stringify(d));
      expect(d.wallLayers.join(',') === 'S-layer,plasma membrane', `outside in: ${JSON.stringify(d.wallLayers)}`);
      expect(d.stain === null, 'switching the envelope should take the stain off');
      expect(await h.button(/^Lysozyme/).isDisabled() && await h.button(/^Penicillin/).isDisabled(), 'with no peptidoglycan the two attacks on it should be disabled');
    }],
    ['a-capsule-outside-and-no-flagellum', async (h) => {
      await h.button(/^Gram-positive/).click();
      await h.button(/^Capsule/).click();
      let d = await h.describe();
      expect(d.appendages.join(',') === 'capsule,flagella' && d.wallLayers[0] === 'capsule', `the capsule should be the outermost layer: ${JSON.stringify(d)}`);
      await h.button(/^Flagella/).click();
      d = await h.describe();
      expect(d.appendages.join(',') === 'capsule' && d.motility === 'none', `without a flagellum it cannot swim: ${JSON.stringify(d)}`);
    }],
    ['a-click-names-a-part', async (h) => {
      // The cell sits left of centre with its callout to the right; sweep the middle row until a part
      // answers, and demand that the card names it.
      const box = await h.stage.locator('canvas').first().boundingBox();
      let picked = null;
      for (let fx = 0.2; fx <= 0.62 && picked === null; fx += 0.03) {
        await h.page.mouse.click(box.x + box.width * fx, box.y + box.height * 0.5);
        picked = (await h.describe()).selected;
      }
      expect(typeof picked === 'string', 'no click along the middle of the drawing selected a part');
      expect(await h.stage.locator('.fig-card:visible').count() === 1, `${picked} was selected but no card names it`);
    }],
    ['escape-clears-the-card', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Escape');
      expect((await h.describe()).selected === null, 'Escape did not clear the selection');
      expect(await h.stage.locator('.fig-card:visible').count() === 0, 'the card is still showing');
    }],
  ],

  secretion: [
    ['opens-in-the-cytosol', async (h) => {
      const d = await h.describe();
      expect(d.stage === 0 && d.stageName === 'cytosol' && d.compartment === 'cytosol', `it should open at stage 0: ${JSON.stringify(d)}`);
      expect(d.modifications.length === 0 && d.blocks.length === 0 && d.stranded === false, JSON.stringify(d));
      expect(d.destination === 'outside' && d.mode === 'journey' && d.t === 0 && d.playing === false && d.cargo === 'secreted', JSON.stringify(d));
    }],
    ['three-steps-fold-it-in-the-er', async (h) => {
      for (let i = 0; i < 3; i += 1) await h.button(/^Next/).click();
      const d = await h.describe();
      expect(d.stage === 3 && d.stageName === 'folding' && d.compartment === 'er-lumen', `three Next should reach folding in the ER lumen: ${JSON.stringify(d)}`);
      expect(d.modifications.join(',') === 'signal-cleaved,folded,core-sugars', `by folding the signal is off and the core sugars are on: ${JSON.stringify(d.modifications)}`);
      expect(near(d.t, 6.6, 1e-3), `stage 3 is 6.6 s on the clock: ${d.t}`);
    }],
    ['arrow-keys-step-to-the-end-and-back', async (h) => {
      await h.focusable().focus();
      for (let i = 0; i < 4; i += 1) await h.page.keyboard.press('ArrowRight');
      let d = await h.describe();
      expect(d.stage === 7 && d.stageName === 'released' && d.compartment === 'outside', `four ArrowRight should release it: ${JSON.stringify(d)}`);
      expect(d.modifications.includes('sugars-remodelled') && d.modifications.at(-1) === 'released', JSON.stringify(d.modifications));
      await h.page.keyboard.press('ArrowLeft');
      d = await h.describe();
      expect(d.stage === 6 && d.compartment === 'secretory-vesicle', `ArrowLeft should step back to sorting: ${JSON.stringify(d)}`);
    }],
    ['blocking-er-exit-strands-it-in-the-lumen', async (h) => {
      await h.button(/^No ER exit/).click();
      let d = await h.describe();
      expect(d.blocks.join(',') === 'er-exit' && d.stage === 3 && d.stranded === true, `the block should pull the cargo back to the ER: ${JSON.stringify(d)}`);
      expect(d.destination === 'er-lumen' && d.compartment === 'er-lumen', JSON.stringify(d));
      await h.focusable().focus();
      await h.page.keyboard.press('ArrowRight');
      d = await h.describe();
      expect(d.stage === 3, `stepping on must not pass a blocked exit: ${d.stage}`);
    }],
    ['lifting-the-block-frees-the-route', async (h) => {
      await h.button(/^No ER exit/).click();
      const d = await h.describe();
      expect(d.blocks.length === 0 && d.stranded === false && d.destination === 'outside', `lifting the block should free the route: ${JSON.stringify(d)}`);
    }],
    ['the-m6p-tag-only-matters-to-a-lysosomal-enzyme', async (h) => {
      await h.button(/^No M6P tag/).click();
      let d = await h.describe();
      expect(d.blocks.join(',') === 'golgi-tag' && d.destination === 'outside' && d.stranded === false, `a secreted protein carries no tag to lose: ${JSON.stringify(d)}`);
      await h.button(/^Lysosomal enzyme/).click();
      d = await h.describe();
      expect(d.cargo === 'lysosomal' && d.destination === 'outside', `an untagged lysosomal enzyme takes the default route out: ${JSON.stringify(d)}`);
      await h.button(/^No M6P tag/).click();
      d = await h.describe();
      expect(d.blocks.length === 0 && d.destination === 'lysosome', `with its tag it is bound for the lysosome: ${JSON.stringify(d)}`);
      for (let i = 0; i < 4; i += 1) await h.button(/^Next/).click();
      d = await h.describe();
      expect(d.stage === 7 && d.compartment === 'lysosome' && d.modifications.includes('tagged'), `it should end in the lysosome, tagged: ${JSON.stringify(d)}`);
    }],
    ['scrub-play-and-pause', async (h) => {
      await h.button(/^Secreted protein/).click();
      await h.stage.locator('input[type=range]').fill('0');
      let d = await h.describe();
      expect(d.cargo === 'secreted' && d.t === 0 && d.stage === 0, `the scrubber should take it back to the start: ${JSON.stringify(d)}`);
      await h.button(/^Play the journey/).click();
      expect((await h.describe()).playing === true, 'Play did not start');
      await h.page.waitForTimeout(1200);
      d = await h.describe();
      expect(d.t > 0.8, `the clock should have run for about 1.2 s: ${d.t}`);
      await h.button(/^Pause/).click();
      const paused = await h.describe();
      await h.page.waitForTimeout(400);
      d = await h.describe();
      expect(paused.playing === false && near(paused.t, d.t, 1e-6), `it kept moving while paused: ${paused.t} -> ${d.t}`);
    }],
    ['follow-the-membrane', async (h) => {
      // From the start, not from wherever the pause left it: Next rounds to the nearest stage.
      await h.stage.locator('input[type=range]').fill('0');
      for (let i = 0; i < 4; i += 1) await h.button(/^Next/).click();
      await h.button(/^Follow the membrane/).click();
      const d = await h.describe();
      expect(d.membraneFaces === true && d.stage === 4, `the overlay should be on with the cargo in its vesicle: ${JSON.stringify(d)}`);
    }],
    ['pulse-chase-runs-the-experiment', async (h) => {
      await h.button(/^Follow the membrane/).click();
      await h.button(/^Pulse-chase/).click();
      let d = await h.describe();
      expect(d.membraneFaces === false && d.mode === 'pulse-chase' && d.t === 0, `the experiment should start at 0 minutes: ${JSON.stringify(d)}`);
      expect(await h.button(/^Next/).isDisabled() && await h.button(/^Back/).isDisabled(), 'the experiment has no stages to step');
      await h.stage.locator('input[type=range]').fill('500');
      d = await h.describe();
      expect(near(d.t, 12, 1e-3), `halfway along the scrubber is 12 s, 60 minutes: ${d.t}`);
    }],
    ['back-to-the-journey', async (h) => {
      await h.button(/^The journey/).click();
      const d = await h.describe();
      expect(d.mode === 'journey' && d.t === 0 && d.stage === 0, `back to the journey, from the start: ${JSON.stringify(d)}`);
    }],
  ],

  cell3d: [
    ['cut-open', async (h) => {
      await h.button(/^Cut open/).click();
      await h.page.waitForTimeout(900);
      expect((await h.describe()).cut === true, `Cut open did not register: ${JSON.stringify(await h.describe())}`);
    }],
    ['labels-toggle', async (h) => {
      // Labels start on, so the first click turns them off and the second brings them back.
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      if (before) expect(await h.stage.locator('.fig-label').count() > 5, 'fewer than six labels are on the stage with labels on');
    }],
    ['drag-orbits', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      await h.drag({ x: box.x + box.width * 0.5, y: box.y + box.height * 0.45 }, { x: box.x + box.width * 0.7, y: box.y + box.height * 0.45 });
      await h.page.waitForTimeout(700);
      const after = (await h.describe()).view;
      expect(!near(before.theta, after.theta, 0.01), `dragging did not orbit: theta ${before.theta} -> ${after.theta}`);
    }],
    ['arrow-keys-orbit-and-wheel-zooms', async (h) => {
      await h.focusable().focus();
      const before = (await h.describe()).view;
      await h.page.keyboard.press('ArrowLeft');
      await h.page.waitForTimeout(700);
      const mid = (await h.describe()).view;
      expect(!near(before.theta, mid.theta, 0.005), `ArrowLeft did not orbit: theta ${before.theta} -> ${mid.theta}`);
      const box = await h.stage.boundingBox();
      await h.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.mouse.wheel(0, -300);
      await h.page.waitForTimeout(700);
      const after = (await h.describe()).view;
      expect(after.distance < mid.distance, `the wheel did not zoom in: ${mid.distance} -> ${after.distance}`);
    }],
    ['click-selects-an-organelle', async (h) => {
      const box = await h.stage.boundingBox();
      await h.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.waitForTimeout(400);
      const d = await h.describe();
      expect(typeof d.selected === 'string' && d.selected.length > 0, `clicking the centre of the cut cell selected nothing: ${JSON.stringify(d)}`);
      expect(await h.stage.locator('.fig-card').count() === 1, 'no card appeared for the selected organelle');
    }],
    ['reset-view', async (h) => {
      await h.button(/^Reset view/).click();
      await h.page.waitForTimeout(900);
      const d = await h.describe();
      expect(d.view && d.view.distance > 0, `Reset view left no view: ${JSON.stringify(d)}`);
    }],
  ],
  dna3d: [
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await h.page.waitForTimeout(300);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      if (before) expect(await h.stage.locator('.fig-label').count() >= 5, 'fewer than five labels are on the stage with labels on');
    }],
    ['drag-orbits', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      await h.drag({ x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 }, { x: box.x + box.width * 0.7, y: box.y + box.height * 0.5 });
      await h.page.waitForTimeout(700);
      const after = (await h.describe()).view;
      expect(!near(before.theta, after.theta, 0.01), `dragging did not orbit: theta ${before.theta} -> ${after.theta}`);
    }],
    ['wheel-zooms', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      await h.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.mouse.wheel(0, -300);
      await h.page.waitForTimeout(700);
      const after = (await h.describe()).view;
      expect(after.distance < before.distance, `the wheel did not zoom in: ${before.distance} -> ${after.distance}`);
    }],
    ['click-a-rung', async (h) => {
      // This step asserted `selected !== undefined`, which `null` satisfies, so it passed whether or
      // not the click hit anything — and the single centre click it used often missed, because the
      // helix is a narrow column in a wide stage. It therefore proved nothing for as long as it was
      // green. It now sweeps the column until something is picked, and demands a real base pair.
      const box = await h.stage.boundingBox();
      expect((await h.describe()).selected === null, 'a rung was already selected before the click');
      let picked = null;
      const tried = [];
      for (let i = 1; i <= 9 && picked === null; i += 1) {
        const y = box.y + (box.height * i) / 10;
        for (const fx of [0.5, 0.46, 0.54]) {
          const x = box.x + box.width * fx;
          await h.page.mouse.click(x, y);
          await h.page.waitForTimeout(150);
          const d = await h.describe();
          tried.push(`${Math.round(x - box.x)},${Math.round(y - box.y)}`);
          if (d.selected !== null && d.selected !== undefined) {
            picked = d.selected;
            break;
          }
        }
      }
      expect(picked !== null, `no click anywhere down the helix selected a base pair; tried ${tried.length} points (${tried.slice(0, 6).join(' ')}…)`);
      expect(Number.isInteger(picked) && picked >= 0 && picked < 32, `selected is ${JSON.stringify(picked)}, not an index into the 32 base pairs`);
      expect(await h.stage.locator('.fig-card').count() === 1, 'a base pair was selected but no card named it');
      const card = await h.stage.locator('.fig-card').textContent();
      expect(/base pair/i.test(card), `the card does not name the base pair: ${JSON.stringify(card.slice(0, 60))}`);
    }],
    ['reset-view', async (h) => {
      await h.button(/^Reset view/).click();
      await h.page.waitForTimeout(900);
      const d = await h.describe();
      expect(d.view && d.view.distance > 0, `Reset view left no view: ${JSON.stringify(d)}`);
    }],
  ],
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const failures = [];
let steps = 0;
try {
  for (const kind of wanted) {
    const recipe = RECIPES[kind];
    if (!recipe) {
      failures.push(`${kind}: no recipe in tools/drive.js, so its controls are undriven`);
      console.log(`FAIL ${kind}: no recipe`);
      continue;
    }
    const page = await browser.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(ACTION_TIMEOUT_MS);
    const errors = collectErrors(page);
    const id = `lab-${kind}`;
    try {
      await openPage(page, `${server.url}/lab/?kind=${kind}&theme=light&eager=1`);
    } catch (err) {
      failures.push(`${kind}: ${err.message}`);
      console.log(`FAIL ${kind}: ${err.message}`);
      await page.close();
      continue;
    }
    const stage = page.locator(`#${id} .tb-figure__stage`);
    // Bring the stage fully into view before any step touches a coordinate. Every recipe below hovers,
    // clicks and drags at absolute page coordinates, so a stage pushed even a little below the fold
    // makes a step fail for a layout reason rather than a figure one.
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const h = {
      page,
      stage,
      describe: () => page.evaluate((id) => document.getElementById(id).describe(), id),
      button: (re) => stage.getByRole('button', { name: re }).first(),
      focusable: () => stage.locator('[tabindex="0"], canvas, svg').first(),
      centre: async (selector) => {
        const box = await stage.locator(selector).first().boundingBox();
        if (!box) throw new Error(`nothing matches ${selector}`);
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      },
      drag: async (from, to, n = 12) => {
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (let i = 1; i <= n; i += 1) await page.mouse.move(from.x + ((to.x - from.x) * i) / n, from.y + ((to.y - from.y) * i) / n);
        await page.mouse.up();
      },
    };
    // The frame owns id, kind, number and state; describe() spreads them last so a figure cannot
    // change what a gate reads. A figure that uses one of those names would have its own value dropped
    // in silence, so it is a failure here rather than a surprise later. The subject is the handle the
    // frame mounted, read off the element, and it must be the one the frame published for the other
    // gates (sweep3d reads window.__textbook.figures[id].handle). A missing handle, a describe() that is
    // not a function, or a describe() that returns no object is a failure of its own and not a clean
    // result: the first version read it through four `?.` and an `|| {}`, so no handle meant no field
    // and no finding (review, 2026-09-16).
    const own = await page.evaluate((figId) => {
      const el = document.getElementById(figId);
      const handle = el?.handle;
      const published = window.__textbook?.figures?.[figId]?.handle;
      if (!handle) return { problem: `the frame holds no handle for it (document.getElementById("${figId}").handle is ${String(handle)}), so its own describe() could not be inspected` };
      if (typeof handle.describe !== 'function') return { problem: `its handle has no describe() function (describe is ${typeof handle.describe}), so the figure reports nothing of its own to inspect` };
      if (published !== handle) return { problem: `the handle the frame mounted is not the one it published at window.__textbook.figures["${figId}"].handle (published: ${published === undefined ? 'nothing' : typeof published}), so the other gates would read a different figure` };
      let d;
      try {
        d = handle.describe();
      } catch (err) {
        return { problem: `its own describe() threw: ${err.message}` };
      }
      if (!d || typeof d !== 'object') return { problem: `its own describe() returned ${d === null ? 'null' : typeof d} rather than an object` };
      return { shadowed: ['id', 'kind', 'number', 'state'].filter((k) => Object.hasOwn(d, k)) };
    }, id);
    if (own.problem) {
      failures.push(`${kind}: ${own.problem}`);
      console.log(`FAIL ${kind}: ${own.problem}`);
    } else if (own.shadowed.length) {
      const msg = `describe() uses ${own.shadowed.map((k) => `"${k}"`).join(', ')}, which the frame owns; rename the figure's own field (foldlab reports foldState)`;
      failures.push(`${kind}: ${msg}`);
      console.log(`FAIL ${kind}: ${msg}`);
    }
    let n = 0;
    for (const [name, fn] of recipe) {
      n += 1;
      steps += 1;
      const file = `${OUT}/${kind}-${String(n).padStart(2, '0')}-${name}.png`;
      try {
        await fn(h);
        await stage.screenshot({ path: file, type: 'png' });
        console.log(`ok   ${kind} ${name} -> ${file}`);
      } catch (err) {
        await stage.screenshot({ path: file, type: 'png' }).catch(() => {});
        failures.push(`${kind} ${name}: ${err.message.split('\n')[0]}`);
        console.log(`FAIL ${kind} ${name}: ${err.message.split('\n')[0]}`);
      }
    }
    for (const e of errors) failures.push(`${kind}: ${e}`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} problem(s) over ${steps} steps:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`drive: ${steps} steps over ${wanted.length} figures passed; screenshots in ${OUT}/`);
