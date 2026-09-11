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
// is what the screenshots are for. A kind with no recipe fails, so a new figure cannot land undriven.
// DRIVE_KINDS=<a,b> trims the run to those kinds, and a trimmed run proves only its part.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { KINDS } from '../src/figures/registry.js';

const OUT = 'out/drive';
const wanted = process.env.DRIVE_KINDS ? process.env.DRIVE_KINDS.split(',') : KINDS;

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
