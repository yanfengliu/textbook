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
// is what the screenshots are for. Two recipes go past that bound on purpose and say so where they do:
// `feedback-pathway` and `atp3d` each drive a control that exists only at a phone's width at 420 or
// 390 px and put the viewport back, and `atp3d` reads its ladder's drawn text — the rail's order against
// §5.3's own table, and which rung a marker is drawn on after a press — because every field describe()
// reports for that scene is the same whichever way up the rail is drawn or the controls run.
// A kind with no recipe fails, so a new figure cannot land undriven, and a kind whose describe() uses
// one of the frame's four names (id, kind, number, state) fails too,
// as does one the frame holds no handle for or whose handle has no describe(): the ownership check
// inspects the figure's own describe(), and a subject it cannot find is a failure, not a clean result.
// DRIVE_KINDS=<a,b> trims the run to those kinds, a trimmed run proves only its part, and a name that
// is not a registered kind stops the run rather than running on to "no recipe" (tools/lib/trim.js).
//
// How a step waits, and the bound that carries. A recipe waits by polling the figure's own describe()
// through `until` below, never by sleeping; docs/policies/local-rules.md, "A wait in a gate must poll
// the artefact, never the wall clock". The recipes held 263.9 s of `waitForTimeout` on 2026-09-16 — half
// this gate's 542.9 s — and every one of them was an assertion about how busy the machine was rather
// than a wait for the figure. The round of 2026-09-17 put 165 polls where there had been 8, and left
// 48.9 s of sleep over 81 calls. Counted again at chapter 6's landing (2026-09-23), one per call site
// between `const RECIPES` and its closing brace, comment lines skipped, so a sleep inside a loop counts
// once: 390 calls to the poll helpers (`until` 344, `atValue` 37, `atLeast` 9), one retry loop of its
// own in `cilium`, and 66 sleeps holding 47.0 s. Chapter 6's four recipes added 92 of those polls and no
// sleep. Every second of the sleep is named:
// a sleep survives here only where the ELAPSED TIME IS THE MEASUREMENT — where the step's claim is that
// something did NOT happen while time passed (pond's paused clock, bilayer's, water3d's idle count,
// membrane3d's "nothing crosses", prokaryote's untouched wall, permeability's rate over a window), or
// where the sleep's real work is letting an animation settle before the step's out/drive/ screenshot,
// which is the frame a person looks at. Each of those is commented where it stands. The one figure
// that cannot be polled at all is `prokaryote`'s gram stain: it reports neither a clock nor a stain
// phase, and its `stain` field reads 'purple' from the first of four stain steps, so a poll would leave
// during the crystal violet and stop proving that the thick wall holds the dye through the alcohol.
// Giving that figure a phase or a clock in describe() would take 11.4 s off this gate.
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
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

// Wait for the FIGURE, not for the computer. docs/policies/local-rules.md, "A wait in a gate must poll
// the artefact, never the wall clock": every figure here advances its own clock as frames arrive, so on a
// machine carrying another gate the same behaviour arrives later without behaving differently. Measured
// 2026-09-16, with one other gate running, `bilayer` advanced 5 s of figure time in 13 s of wall time. A
// `await page.waitForTimeout(400)` is therefore not a wait for the figure; it is an assertion about how
// busy the machine is, and it is slow on a fast machine and wrong on a slow one. A `water3d` step went red
// once on a run that touched none of its code for exactly that reason.
//
// `until` polls the figure's own describe() every POLL_MS until `ok` is true or the budget runs out, and
// returns the last description either way. It never throws: the step's own `expect` below it re-reads
// describe() and fails with the step's own message, so a timeout reads as the assertion that did not hold
// rather than as a wait that expired. Budgets here are generous on purpose — several times the sleep each
// replaced — because the cost of a large budget is nothing when the figure arrives (the poll returns at
// once) and the cost of a small one is a false red on a loaded machine.
//
// Bound, and it is a real one. A fixed sleep asserts "the predicate holds N ms after the action"; a poll
// asserts "the predicate held at some moment within the budget, and still holds when the step re-reads
// it". A figure that reaches the asserted state and then leaves it before the re-read is caught by both; a
// figure that reaches it, leaves it, and comes back would be caught by the sleep and not by the poll. No
// step here asserts a state a figure passes through twice, and every step that measures a figure NOT
// changing keeps its wall-clock window — they are listed in this file's header and each is commented
// where it stands — because there the elapsed time IS the measurement and shortening it would be a
// weakening rather than a fix.
const POLL_MS = 50;
const until = async (h, ok, budgetMs) => {
  let d = await h.describe();
  const deadline = Date.now() + budgetMs;
  while (!ok(d) && Date.now() < deadline) {
    await h.page.waitForTimeout(POLL_MS);
    d = await h.describe();
  }
  return d;
};

// Wait for a CONTROL to carry the value the figure has already reported. `until` above waits for the
// figure; this waits for the thing the next step is about to press. They are not the same wait, and the
// fixed sleeps these polls replaced were quietly doing both: a figure can publish a new state through
// describe() a frame before it writes the matching value into its `<input type=range>`, and a key pressed
// in that gap increments the stale value. Returns the value it settled on, or the last one read at the
// budget, so the step's own assertion is still what fails and still says what it expected.
const atValue = async (h, locator, value, budgetMs = 5_000) => {
  const deadline = Date.now() + budgetMs;
  for (;;) {
    const got = await locator.first().inputValue();
    if (got === String(value) || Date.now() > deadline) return got;
    await h.page.waitForTimeout(POLL_MS);
  }
};

// Wait for the DOM to catch up with what the figure has already reported. Same lesson as `atValue`, from
// the other side: a 3D figure publishes `labels: true` out of its own state and draws the label elements
// on its NEXT frame, so a step that polls describe() and then counts `.fig-label` counts them before they
// exist. `plantcell3d labels-toggle` went red exactly there. The rule the three helpers share: poll the
// surface the assertion reads, and describe() is only one of the three surfaces a recipe reads.
const atLeast = async (h, locator, n, budgetMs = 5_000) => {
  const deadline = Date.now() + budgetMs;
  for (;;) {
    const got = await locator.count();
    if (got >= n || Date.now() > deadline) return got;
    await h.page.waitForTimeout(POLL_MS);
  }
};

// Wait for a number the figure reports to STOP CHANGING, for a step whose precondition is stillness rather
// than a named state. `until` needs a target to wait for; this needs only that the figure has settled, and
// settling is the other thing the fixed sleeps were quietly providing to the step AFTER them.
// `bilayer curl-takes-the-wrap-away` went red for this: it reads the sheet's edge as its baseline, the
// needle two steps earlier leaves that edge still relaxing, and with the upstream sleeps gone the baseline
// was read at 5.5 nm instead of the settled value, putting the target it then demands out of reach.
// Three consecutive readings within `eps`, because two 50 ms apart can agree by rounding while the value
// is still drifting. Returns the settled reading, or the last one at the budget.
const stable = async (h, read, budgetMs, eps = 0.05) => {
  const deadline = Date.now() + budgetMs;
  let last = read(await h.describe());
  let agreed = 0;
  for (;;) {
    if (Date.now() > deadline) return last;
    await h.page.waitForTimeout(POLL_MS);
    const now = read(await h.describe());
    agreed = Math.abs(now - last) <= eps ? agreed + 1 : 0;
    last = now;
    if (agreed >= 2) return now;
  }
};

// Several chapter-4 figures have one button that says Run and then says Pause, so a recipe that clicks
// `Run` twice waits three minutes for a control that is no longer there — which is what it did, four
// steps in a row, and reported as four separate timeouts. This asks the figure what it is doing and
// presses the button only if it needs pressing.
const ensureRunning = async (h) => {
  if (!(await h.describe()).playing) await h.button(/^Run|^Release/).click();
  expect((await h.describe()).playing === true, 'the figure would not start running');
};

// `atp3d`'s ladder, read off the DRAWING. describe() says which compound is the donor and which the
// target and nothing about where either is drawn, so a rail printed upside down, or controls that move a
// marker the wrong way along it, pass every describe() assertion in that recipe — both have happened.
// These read the ladder pane's own text: the eight rung figures (`.at-num`), the compounds' names, the
// verdict under the rail, and the words "donor" and "target", which sit on their rung's own line.
const ladderTexts = (h) => h.stage.locator('.tb-pane-ladder text').evaluateAll((ts) => ts.map((t) => ({
  s: t.textContent, y: Number(t.getAttribute('y')), cls: (t.getAttribute('class') || '').split(' '),
})));
// Which rung a marker word is on, counted from the TOP of the rail as drawn; -1 when it is not drawn.
// Counted afresh from each drawing, because the narrow rail is re-solved whenever the verdict under it
// changes length, so a rung's y in one state is not its y in the next.
const rungOfWord = async (h, word) => {
  const texts = await ladderTexts(h);
  const ys = texts.filter((t) => t.cls.includes('at-num')).map((t) => t.y).sort((a, b) => a - b);
  const at = texts.find((t) => t.s === word);
  return at ? ys.indexOf(at.y) : -1;
};
// The figure printed on the rung a marker word sits on, as a number; NaN when there is no such rung.
// A marker drawn one rung off its own compound every time would pass rungOfWord's relative checks, so
// each word is held against its own compound's ΔG°′ of hydrolysis: describe().rungKj for the donor,
// describe().targetKj for the target.
const figureAtWord = async (h, word) => {
  const texts = await ladderTexts(h);
  const at = texts.find((t) => t.s === word);
  const fig = at && texts.find((t) => t.cls.includes('at-num') && t.y === at.y);
  return fig ? Number(fig.s.replace('−', '-')) : NaN;
};
// §5.3's own table of phosphate compounds, read out of the chapter, as [{ name, kj }] in the order it is
// printed. It is the authority for which way up the ladder runs, and it is parsed rather than typed here
// so the check is the chapter's word against the figure's drawing, not the figure's LADDER against itself.
const chapterLadder = () => {
  const path = 'biology/ch05-energy-and-metabolism/index.html';
  const html = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const start = html.indexOf('<section id="atp">');
  const end = start < 0 ? -1 : html.indexOf('</section>', start);
  if (start < 0 || end < 0) throw new Error(`${path} has no complete <section id="atp">, so §5.3's table of phosphate compounds could not be read`);
  // Tags may carry attributes: a row the pattern skipped would drop out of the comparison without a word.
  const body = /<tbody[^>]*>([\s\S]*?)<\/tbody>/.exec(html.slice(start, end));
  if (!body) throw new Error(`${path}'s <section id="atp"> has no <tbody>, so §5.3's table of phosphate compounds could not be read`);
  const rows = [...body[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => c[1].replace(/<[^>]+>/g, '').trim()));
  const trs = (body[1].match(/<tr[\s>]/g) || []).length;
  if (rows.length !== trs) throw new Error(`${path}: §5.3's table has ${trs} <tr> and ${rows.length} of them could be read as rows`);
  const table = rows.map(([name, kj]) => ({ name, kj: Number(String(kj).replace('−', '-')) }));
  if (table.length < 3 || table.some((r) => !r.name || !Number.isFinite(r.kj))) {
    throw new Error(`${path}: §5.3's table of phosphate compounds read as ${JSON.stringify(table)}; it needs at least three rows, each a name and a number in kJ/mol`);
  }
  return table;
};

// `glycolysis`'s ledger, read off the DRAWING. describe() carries the tallies and names the donor, but
// which of §5.3's rungs the figure prints, with what values and in what order, which two it lights, and
// what it tells the reader about a donor, a shut step or a knock-out are only on the stage. A row is a
// key paired with the nearest value to its right on the same line, so the tallies and the ladder, drawn
// side by side, cannot borrow each other's numbers; `lit` is the inline colour the figure puts on the
// two rungs in play. `words` is every text in the pane joined as it was wrapped, spaces collapsed.
const glycolysisLedger = (h) => h.stage.locator('.tb-pane-ledger').first().evaluate((pane) => {
  const texts = [...pane.querySelectorAll('text')];
  const at = (t, a) => Number(t.getAttribute(a));
  const vals = texts.filter((t) => t.classList.contains('tb-rt-val'));
  const rows = texts.filter((t) => t.classList.contains('tb-rt-key')).map((k) => {
    const right = vals.filter((v) => v.getAttribute('y') === k.getAttribute('y') && at(v, 'x') > at(k, 'x')).sort((a, b) => at(a, 'x') - at(b, 'x'))[0];
    return { key: k.textContent, val: right ? right.textContent : null, y: at(k, 'y'), lit: Boolean(k.style.fill) };
  });
  return { rows, words: texts.map((t) => t.textContent).join(' ').replace(/\s+/g, ' ') };
});
// What a bench figure last said to a screen reader, polled until it matches. A press the figure refuses
// changes nothing describe() reports, so its words are the only surface that shows the press arrived.
// Returns the last text read, so the step's own assertion is what fails.
const liveSays = async (h, re, budgetMs = 5_000) => {
  const live = h.stage.locator('.tb-live').first();
  const deadline = Date.now() + budgetMs;
  for (;;) {
    const got = (await live.textContent()) ?? '';
    if (re.test(got) || Date.now() > deadline) return got;
    await h.page.waitForTimeout(POLL_MS);
  }
};

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
      await until(h, (x) => x.level === 1, 5_000);
      expect((await h.describe()).level === 1, `Next did not go to level 1: ${JSON.stringify(await h.describe())}`);
    }],
    ['arrow-right-on-range', async (h) => {
      // The slider has to have caught up before a key is pressed on it, and describe() reaching the new
      // level is NOT that: the figure reports the level first and writes the input's value after, so
      // ArrowRight pressed on the instant describe() said "1" incremented a slider still reading 0 and
      // landed back on level 1. Found by this step going red under the poll that replaced its sleep
      // (2026-09-16) — the sleep had been waiting for the control as well as for the figure, and only one
      // of those two things was written down. `atValue` waits for the control itself.
      const range = h.stage.locator('input[type=range]');
      await atValue(h, range, 1);
      await range.focus();
      await h.page.keyboard.press('ArrowRight');
      await until(h, (x) => x.level === 2, 5_000);
      expect((await h.describe()).level === 2, `ArrowRight did not go to level 2: ${JSON.stringify(await h.describe())}`);
    }],
    ['click-a-thumbnail', async (h) => {
      await h.stage.locator('.lv-thumb').nth(7).click();
      await until(h, (x) => x.level === 7, 5_000);
      expect((await h.describe()).level === 7, `clicking thumbnail 8 did not go to level 7: ${JSON.stringify(await h.describe())}`);
    }],
    ['end-and-home', async (h) => {
      await h.stage.locator('input[type=range]').focus();
      await h.page.keyboard.press('End');
      await until(h, (x) => x.level === 11, 5_000);
      expect((await h.describe()).level === 11, `End did not reach level 11: ${JSON.stringify(await h.describe())}`);
      await h.page.keyboard.press('Home');
      await until(h, (x) => x.level === 0, 5_000);
      expect((await h.describe()).level === 0, `Home did not return to level 0: ${JSON.stringify(await h.describe())}`);
    }],
  ],
  scale: [
    ['arrow-left-moves-the-lens', async (h) => {
      // The listener the NEXT step reads is installed here, a step early and before anything is pressed,
      // and that placement is the point. The next step has to press while the lens is still gliding, so
      // every round trip between its poll returning and its press eats the window it is aiming at:
      // installing it there instead of here took the step's hit rate against the reintroduced defect from
      // 17 of 20 down to 2 of 5. Nothing in this step causes a pointerdown, so recording here costs the
      // step nothing and it cannot see a press of its own. It is added after the figure's own handler, on
      // the same element in the same phase, so it runs second and reads the figure's verdict.
      await h.stage.locator('svg').first().evaluate((svg) => {
        window.__scaleTookPress = null;
        svg.addEventListener('pointerdown', (e) => { window.__scaleTookPress = e.defaultPrevented; }, false);
      });
      const before = await h.describe();
      expect(before.nearest === 'animal-cell', `the lens does not start on the animal cell: ${JSON.stringify(before)}`);
      await h.stage.locator('.sc-lens').focus();
      await h.page.keyboard.press('ArrowLeft');
      const after = await until(h, (x) => (x.nearest !== 'animal-cell' && x.lensMetres > before.lensMetres), 5_000);
      expect(after.nearest !== 'animal-cell' && after.lensMetres > before.lensMetres, `ArrowLeft did not move the lens to something larger: ${JSON.stringify(after)}`);
    }],
    ['drag-the-lens-left', async (h) => {
      // There is DELIBERATELY no settle between the arrow key in the step above and this press, and the
      // step asserts two things rather than one. The step above leaves the lens gliding (GLIDE_MS = 280
      // in src/figures/scale.js) and `until` returns the moment the lens has passed the next marker, so
      // this press arrives mid-glide — which is the one case the figure used to drop. `onDown` finished
      // the glide before asking whether the press had been on the lens, finishing repaints, the wide
      // layout's repaint rebuilds the lens's interior with `inner.replaceChildren()`, and the pressed
      // node was detached by the time `lensG.contains(e.target)` looked at it: `down()` returned null
      // and the drag did nothing. This step failed 17 of 20 runs on 2026-09-17 for exactly that, and it
      // read as flakiness because the 3 passes were the runs where the glide had already ended.
      //
      // So the first assertion is that the FIGURE TOOK THE PRESS — it calls preventDefault() only when
      // its layout's down() returned a mover — and the second is the outcome. Without the first, a press
      // silently dropped and a press that worked are told apart only by where the lens ends up, and a
      // press that lands on the track ends up in the same place.
      //
      // Bound: this presses inside a 280 ms glide it starts itself, a few round trips in, so the window
      // is owned rather than inherited — 10 of 10 runs red against the reintroduced defect, measured. It
      // is still a window and not a certainty: on a machine slow enough for 280 ms to pass between the
      // key and the press, the press is taken, this step passes, and it proves less. It is never red for
      // missing the window, only for a press that was dropped. The listener it reads is installed in the
      // step above, one step early, so that installing it costs this press none of the glide; `null` back
      // from it means no pointerdown reached the svg at all, which is a failure of its own rather than a
      // quiet pass.
      //
      // The arrow key here is not a second copy of the step above: it is how this step OWNS its window
      // rather than inheriting one. It starts a fresh 280 ms glide immediately before the press, so the
      // press lands a few round trips into it instead of wherever the previous step's poll happened to
      // return. Measured against the reintroduced defect: 5 of 10 runs red while the step relied on the
      // glide it inherited, 10 of 10 once it starts its own.
      await h.stage.locator('.sc-lens').focus();
      await h.page.keyboard.press('ArrowLeft');
      const lens = await h.centre('.sc-lens circle');
      const box = await h.stage.boundingBox();
      await h.drag(lens, { x: box.x + box.width * 0.12, y: lens.y });
      const took = await h.page.evaluate(() => window.__scaleTookPress);
      expect(took !== null, 'the press on the lens never reached the figure\'s svg, so this step measured nothing');
      expect(took === true, 'the figure did not take the press on the lens: its pointerdown handler returned without calling preventDefault(), which is what it does when down() found nothing under the pointer. A press that arrives while the lens is gliding must still be taken — finishing the glide repaints the lens and detaches the node the press targeted, so the hit has to be read before the glide is finished (src/figures/scale.js, onDown)');
      const d = await until(h, (x) => (x.lensMetres > 0.5), 5_000);
      expect(d.lensMetres > 0.5, `dragging to the left end did not reach the metre scale: ${JSON.stringify(d)}`);
    }],
    ['range-input', async (h) => {
      const range = h.stage.locator('input[type=range]');
      await range.focus();
      for (let i = 0; i < 20; i += 1) await h.page.keyboard.press('ArrowRight');
      const d = await until(h, (x) => (x.lensMetres < 0.5), 5_000);
      expect(d.lensMetres < 0.5, `twenty ArrowRight on the range did not move the lens right: ${JSON.stringify(d)}`);
    }],
    ['next-button', async (h) => {
      const before = await h.describe();
      await h.button(/^Next/).click();
      const after = await until(h, (x) => (x.lensMetres < before.lensMetres), 5_000);
      expect(after.lensMetres < before.lensMetres, `the next button did not move the lens to something smaller: ${before.lensMetres} -> ${after.lensMetres}`);
    }],
  ],
  tree: [
    ['hover-highlights', async (h) => {
      const hit = h.stage.locator('.tr-hit').first();
      const label = hit.locator('.tr-hitlabel').first();
      const box = (await label.count()) ? await label.boundingBox() : await hit.boundingBox();
      await h.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await until(h, (x) => x.highlighted, 5_000);
      expect((await h.describe()).highlighted, `hovering the first target highlighted nothing: ${JSON.stringify(await h.describe())}`);
    }],
    ['click-pins-then-escape-clears', async (h) => {
      const hit = h.stage.locator('.tr-hit').first();
      const box = await hit.boundingBox();
      await h.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await h.page.mouse.move(5, 5);
      await until(h, (x) => x.highlighted, 5_000);
      expect((await h.describe()).highlighted, 'the click did not pin the highlight');
      await h.page.keyboard.press('Escape');
      await until(h, (x) => !x.highlighted, 5_000);
      expect(!(await h.describe()).highlighted, 'Escape did not clear the highlight');
    }],
    ['tab-focus-highlights', async (h) => {
      // The click above left focus on the first target, so Tab moves it to the second and fires focusin.
      await h.page.keyboard.press('Tab');
      await until(h, (x) => x.highlighted, 5_000);
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
      await until(h, (x) => x.mode === start, 5_000);
      expect((await h.describe()).mode === start, 'Three domains did not restore the first mode');
    }],
  ],
  energy: [
    ['energy-mode', async (h) => {
      await h.button(/^Energy/).click();
      await until(h, (x) => x.mode === 'energy', 5_000);
      expect((await h.describe()).mode === 'energy', `mode is ${JSON.stringify(await h.describe())}`);
    }],
    ['matter-mode', async (h) => {
      await h.button(/^Matter/).click();
      await until(h, (x) => x.mode === 'matter', 5_000);
      expect((await h.describe()).mode === 'matter', `mode is ${JSON.stringify(await h.describe())}`);
    }],
    ['both-by-keyboard', async (h) => {
      await h.button(/^Both/).focus();
      await h.page.keyboard.press('Enter');
      const d = await until(h, (x) => (x.mode === 'both' && x.energyParticles > 0 && x.matterParticles > 0), 5_000);
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
      const d = await until(h, (x) => (x.core < 36.95) && (x.effector < 0), 7_200);
      expect(d.core < 36.95, `the core did not fall during the cold: ${d.core}`);
      expect(d.effector < 0, `the model is not shivering: effector ${d.effector}`);
    }],
    ['feedback-toggle', async (h) => {
      await h.button(/^Feedback on/).click();
      await until(h, (x) => x.feedback === false, 5_000);
      expect((await h.describe()).feedback === false, 'the toggle did not switch feedback off');
      await h.button(/^Feedback off/).click();
      await until(h, (x) => x.feedback === true, 5_000);
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
      const d = await until(h, (x) => (x.events.length === 0 && x.t < 5), 5_000);
      expect(d.events.length === 0 && d.t < 5, `Reset left ${JSON.stringify(d)}`);
    }],
  ],
  pasteur: [
    ['boil', async (h) => {
      await h.button(/^Boil/).click();
      await until(h, (x) => x.boiled === true, 5_000);
      expect((await h.describe()).boiled === true, `Boil did not register: ${JSON.stringify(await h.describe())}`);
    }],
    ['scrub-to-day-9-both-clear', async (h) => {
      await h.stage.locator('input[type=range]').fill('9');
      const d = await until(h, (x) => (Math.round(x.day) === 9 && x.clearA && x.clearB), 5_000);
      expect(Math.round(d.day) === 9 && d.clearA && d.clearB, `at day 9 after boiling both should be clear: ${JSON.stringify(d)}`);
    }],
    ['snap-then-b-clouds', async (h) => {
      await h.button(/^Snap the neck/).click();
      await until(h, (x) => x.snapped !== false, 5_000);
      expect((await h.describe()).snapped !== false, 'the snap did not register');
      await h.stage.locator('input[type=range]').fill('16');
      const d = await until(h, (x) => (x.clearA && !x.clearB), 5_000);
      expect(d.clearA && !d.clearB, `a week after the snap B should be cloudy and A clear: ${JSON.stringify(d)}`);
    }],
    ['tilt-then-a-clouds', async (h) => {
      await h.button(/^Tilt flask A/).click();
      await until(h, (x) => x.tilted !== false, 5_000);
      expect((await h.describe()).tilted !== false, 'the tilt did not register');
      await h.stage.locator('input[type=range]').fill('24');
      const d = await until(h, (x) => (!x.clearA), 5_000);
      expect(!d.clearA, `a week after the tilt A should be cloudy: ${JSON.stringify(d)}`);
    }],
    ['arrow-keys-scrub', async (h) => {
      await h.focusable().focus();
      const d1 = await h.describe();
      await h.page.keyboard.press('ArrowRight');
      const d2 = await until(h, (x) => (x.day > d1.day), 5_000);
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
      const d = await until(h, (x) => (x.phase === 'ice') && (Math.abs(x.bondsPerWater - 4) < 0.2) && (x.meanBondLifePs > 1e5), 5_000);
      expect(d.phase === 'ice', `at -10 C the phase is ${d.phase}`);
      expect(Math.abs(d.bondsPerWater - 4) < 0.2, `ice should hold four bonds each, not ${d.bondsPerWater}`);
      expect(d.meanBondLifePs > 1e5, `an ice bond should last far longer than a liquid one: ${d.meanBondLifePs} ps`);
    }],
    ['boil-drives-the-bonds-off', async (h) => {
      await h.stage.locator('input[type=range]').fill('115');
      const d = await until(h, (x) => (x.phase === 'steam') && (x.bondsPerWater < 1), 5_000);
      expect(d.phase === 'steam', `at 115 C the phase is ${d.phase}`);
      expect(d.bondsPerWater < 1, `steam should have almost no hydrogen bonds: ${d.bondsPerWater}`);
      await h.stage.locator('input[type=range]').fill('25');
      await h.page.waitForTimeout(400);
    }],
    ['hydrogen-bond-toggle-hides-without-unmaking', async (h) => {
      await h.button(/Hydrogen bonds/).click();
      const off = await until(h, (x) => (x.showBonds === false) && (x.bonds > 100), 5_000);
      expect(off.showBonds === false, `the toggle did not hide the bonds: ${JSON.stringify(off)}`);
      expect(off.bonds > 100, 'hiding the links must not zero the count: the bonds are still there');
      await h.button(/Hydrogen bonds/).click();
      await until(h, (x) => x.showBonds === true, 5_000);
      expect((await h.describe()).showBonds === true, 'the toggle did not bring them back');
    }],
    ['click-names-a-molecule', async (h) => {
      const box = await h.stage.boundingBox();
      await h.page.mouse.click(box.x + box.width * 0.12, box.y + box.height * 0.5);
      await until(h, (x) => x.selected !== null, 5_000);
      expect((await h.describe()).selected !== null, 'clicking in the water selected nothing');
      expect(await atLeast(h, h.stage.locator('.fig-card'), 1) === 1, 'no card appeared for the selected molecule');
      await h.focusable().focus();
      await h.page.keyboard.press('Escape');
      await until(h, (x) => x.selected === null, 5_000);
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
      const wet = await until(h, (x) => (x.medium === 'water') && (x.separationPm === 283) && (dry / x.energyKjMol > 70), 5_000);
      expect(wet.medium === 'water', 'the switch did not flood the bench');
      expect(wet.separationPm === 283, 'flooding the bench must not move the atoms');
      expect(dry / wet.energyKjMol > 70, `water should divide it by about 78: ${dry} -> ${wet.energyKjMol}`);
    }],
    ['pull-it-apart-in-water', async (h) => {
      await h.stage.locator('.bl-bench').focus();
      for (let i = 0; i < 20; i += 1) await h.page.keyboard.press('Shift+ArrowRight');
      const d = await until(h, (x) => (x.separationPm > 680) && (x.broken === true) && (x.hydrationShell === 6), 5_000);
      expect(d.separationPm > 680, `twenty shifted steps should reach past 680 pm, not ${d.separationPm}`);
      expect(d.broken === true, `the bond should have given way by ${d.separationPm} pm`);
      expect(d.hydrationShell === 6, `each freed ion should pick up a shell of six waters: ${d.hydrationShell}`);
    }],
    ['the-covalent-pair-does-not-care-about-water', async (h) => {
      await h.stage.getByRole('button', { name: /Left atom: carbon/ }).click();
      await h.stage.getByRole('button', { name: /Right atom: oxygen/ }).click();
      const wet = await until(h, (x) => (x.bond === 'covalent-polar' && x.bondOrder === 2) && (Math.abs(x.energyKjMol - 799) < 3), 5_000);
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
      const after = await until(h, (x) => (x.separationPm > before + 40), 5_000);
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
      const cold = await until(h, (x) => (x.phase === 'ice' && x.latticeLocked === true) && (x.bondsHeld === 4) && (x.densityRel < warm.densityRel - 0.05), 5_000);
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
      const d = await until(h, (x) => (x.dragging === true) && (x.snapped === true) && (x.bondsHeld <= 3), 5_000);
      expect(d.dragging === true, 'the pull did not register');
      // The pull holds one neighbour at 4.6 Å, past the 3.65 Å its bond gives way at, so `snapped` is
      // the figure's own verdict on that bond and does not depend on the clock. The other three bonds
      // blink on their own periods, so a count read before the click and again after it can rise on its
      // own (this step went red once, 2 -> 3, with no defect); what the count cannot do while one
      // neighbour is held away is reach four.
      expect(d.snapped === true, `the pulled neighbour's bond should have given way: ${JSON.stringify(d)}`);
      expect(d.bondsHeld <= 3, `with a neighbour held past the snap distance the count cannot be four: ${d.bondsHeld}`);
      await h.button(/^Let it go/).click();
      const after = await until(h, (x) => (x.dragging === false && x.snapped === false), 5_000);
      expect(after.dragging === false && after.snapped === false, `letting go did not release it: ${JSON.stringify({ dragging: after.dragging, snapped: after.snapped })}`);
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === !before, 5_000);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === before, 5_000);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
    }],
    ['drag-orbits-and-reset-view', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      // From a corner, so the drag orbits instead of grabbing a neighbour molecule.
      await h.drag({ x: box.x + box.width * 0.12, y: box.y + box.height * 0.12 },
        { x: box.x + box.width * 0.3, y: box.y + box.height * 0.12 });
      await until(h, (x) => Math.abs(x.view.theta - before.theta) > 0.02, 7_000);
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
      const d = await until(h, (x) => (x.hbondStrength === 0) && (x.tension.needleFloats === false) && (x.ice.solidFloats === false) && (x.ice.densestAtC === 0), 5_000);
      expect(d.hbondStrength === 0, `the slider did not move: ${d.hbondStrength}`);
      expect(d.tension.needleFloats === false, 'with no hydrogen bonds the needle sinks');
      expect(d.ice.solidFloats === false, 'and the solid sinks');
      expect(d.ice.densestAtC === 0, `and the 4 C turn is gone: ${d.ice.densestAtC}`);
      await h.stage.locator('input[type=range]').fill('100');
      await h.page.waitForTimeout(400);
    }],
    ['the-heat-panel-and-its-comparison', async (h) => {
      await h.button(/^Warming up/).click();
      const d = await until(h, (x) => (x.panel === 'heat') && (x.heat.joulesAdded > 500) && (x.heat.comparisonC > x.heat.waterC + 5), 10_800);
      expect(d.panel === 'heat', `the panel is ${d.panel}`);
      expect(d.heat.joulesAdded > 500, `the run should be under way: ${d.heat.joulesAdded} J`);
      expect(d.heat.comparisonC > d.heat.waterC + 5, `iron should be far ahead of water: ${JSON.stringify(d.heat)}`);
      await h.button(/Compare with ethanol/).click();
      await until(h, (x) => x.heat.comparison === 'ethanol', 9_000);
      expect((await h.describe()).heat.comparison === 'ethanol', 'the comparison did not change');
    }],
    ['evaporation-cools-the-dish', async (h) => {
      await h.button(/^Evaporating/).click();
      const d = await until(h, (x) => (x.panel === 'evaporation' && x.evaporation.escaped > 0) && (x.evaporation.meanSpeedRel < 1), 13_200);
      expect(d.panel === 'evaporation' && d.evaporation.escaped > 0, 'nothing evaporated');
      expect(d.evaporation.meanSpeedRel < 1, `those left behind should be slower: ${d.evaporation.meanSpeedRel}`);
    }],
    ['freezing-starts-warm-and-densest-at-four', async (h) => {
      // Deliberately not waiting out the fourteen-second freeze: the claim that matters at this
      // strength is the 4 C turn, and the frozen state is covered by the strength-0 step above.
      await h.button(/^Freezing/).click();
      await h.button(/^Restart/).click();
      const d = await until(h, (x) => (x.panel === 'ice') && (x.ice.latticeFormed === false && x.ice.tempC > 15) && (Math.abs(x.ice.densestAtC - 4) < 0.1), 5_000);
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
      const d = await until(h, (x) => (x.units === 2 && x.bonds === 1 && x.watersReleased === 1), 5_000);
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
      await until(h, (x) => x.playing === true, 5_000);
      expect((await h.describe()).playing === true, 'Play did not start');
      const a = await until(h, (x) => (x.t > 1.5), 13_200);
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
      const d = await until(h, (x) => (mid.steps < x.steps) && (x.foldState === 'folded') && (x.buriedFraction >= 0.6) && (x.coords.length === x.length), 25_200);
      expect(mid.steps < d.steps, `the search should be visible: ${mid.steps} then ${d.steps}`);
      expect(d.foldState === 'folded', `foldState ${d.foldState}`);
      expect(d.buriedFraction >= 0.6, `the core should be buried: ${d.buriedFraction}`);
      expect(d.coords.length === d.length, `coords ${d.coords.length} for ${d.length} residues`);
    }],
    ['the-same-sequence-reaches-the-same-fold', async (h) => {
      for (let i = 0; i < 4; i += 1) {
        await h.button(/^Fold/).click();
        // The bench's own signal that a search is over. `startJob` sets foldState to 'folding'
        // SYNCHRONOUSLY inside the click handler (src/figures/foldlab.js), so a poll taken after the
        // click has resolved cannot still be reading the previous run's 'folded': there is no race.
        await until(h, (x) => x.foldState === 'folded', 40_000);
      }
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
      await until(h, (x) => x.foldState === 'folded', 40_000);
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
      // Reset re-folds the bench (reset() ends in fold()), so this is that search, polled not slept.
      await until(h, (x) => x.foldState === 'folded', 40_000);
      const heat = h.stage.locator('input[type=range]').first();
      await heat.focus();
      for (let i = 0; i < 45; i += 1) await h.page.keyboard.press('ArrowRight');
      let d = await until(h, (x) => (x.tempC === 70 && x.foldState === 'denatured'), 10_800);
      expect(d.tempC === 70 && d.foldState === 'denatured', `temp ${d.tempC}, state ${d.foldState}`);
      for (let i = 0; i < 45; i += 1) await h.page.keyboard.press('ArrowLeft');
      d = await until(h, (x) => (x.foldState === 'folded'), 10_800);
      expect(d.foldState === 'folded', `below 75 °C it should come back: ${d.foldState}`);
      for (let i = 0; i < 75; i += 1) await h.page.keyboard.press('ArrowRight');
      d = await until(h, (x) => (x.foldState === 'aggregated') && (x.buriedFraction < 0.45), 10_800);
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
      const d = await until(h, (x) => (x.ph <= 3.1) && (x.ionicStrength < 0.05), 10_800);
      expect(d.ph <= 3.1, `pH ${d.ph}`);
      expect(d.ionicStrength < 0.05, `the charges should be gone: ${d.ionicStrength}`);
    }],
    ['levels-and-a-second-chain', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.foldState === 'folded', 40_000);
      await h.button(/^Levels/).click();
      let d = await h.describe();
      expect(d.levelsShown.join(',') === 'primary,secondary,tertiary', `levels ${JSON.stringify(d.levelsShown)}`);
      await h.button(/^Second chain/).click();
      d = await until(h, (x) => (x.chains === 2) && (x.levelsShown.includes('quaternary')) && (x.coords.length === x.length * 2), 31_200);
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
      const d = await until(h, (x) => (x.observation === 'double-membrane') && (x.verdict.endosymbiosis === 'supports' && x.verdict.infolding === 'supports') && (x.discriminates === false && x.discriminatingCount === 0) && (x.highlighted === 'membranes'), 5_000);
      expect(d.observation === 'double-membrane', `the row did not select: ${d.observation}`);
      expect(d.verdict.endosymbiosis === 'supports' && d.verdict.infolding === 'supports', `both hypotheses predict two membranes: ${JSON.stringify(d.verdict)}`);
      expect(d.discriminates === false && d.discriminatingCount === 0, `two membranes must not count as discriminating: ${JSON.stringify(d)}`);
      expect(d.highlighted === 'membranes', `the membranes should be highlighted: ${d.highlighted}`);
    }],
    ['circular-dna-discriminates', async (h) => {
      await h.button(/^Circular DNA/).click();
      const d = await until(h, (x) => (x.observation === 'circular-dna' && x.highlighted === 'dna') && (x.verdict.endosymbiosis === 'supports' && x.verdict.infolding === 'contradicts') && (x.discriminates === true && x.discriminatingCount === 1) && (x.tested.join(',') === 'double-membrane,circular-dna'), 5_000);
      expect(d.observation === 'circular-dna' && d.highlighted === 'dna', `row 2 did not select the genome: ${JSON.stringify(d)}`);
      expect(d.verdict.endosymbiosis === 'supports' && d.verdict.infolding === 'contradicts', JSON.stringify(d.verdict));
      expect(d.discriminates === true && d.discriminatingCount === 1, `one of two should discriminate: ${JSON.stringify(d)}`);
      expect(d.tested.join(',') === 'double-membrane,circular-dna', `the tally keeps order: ${d.tested}`);
    }],
    ['the-chloroplast-comes-forward-and-keeps-the-tally', async (h) => {
      await h.button(/^Chloroplast/).click();
      const d = await until(h, (x) => (x.organelle === 'chloroplast') && (x.tested.length === 2 && x.observation === 'circular-dna'), 5_000);
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
      await until(h, (x) => x.organelle === 'mitochondrion', 5_000);
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
      d = await until(h, (x) => (x.tested.length === 0 && x.observation === null && x.discriminatingCount === 0), 5_000);
      expect(d.tested.length === 0 && d.observation === null && d.discriminatingCount === 0, `Reset left ${JSON.stringify(d)}`);
    }],
  ],

  cytoskeleton: [
    ['kinesin-walks-to-the-plus-end', async (h) => {
      const before = await h.describe();
      expect(before.filament === 'microtubule' && before.motor === 'kinesin' && before.compatible, `it should open with kinesin on a microtubule: ${JSON.stringify(before)}`);
      expect(before.filamentDiameterNm === 25 && before.stepNm === 8 && before.speedNmPerS === 800, JSON.stringify(before));
      const d = await until(h, (x) => (x.direction === 'plus' && x.positionNm > before.positionNm && x.steps > 0), 9_000);
      expect(d.direction === 'plus' && d.positionNm > before.positionNm && d.steps > 0, `the motor did not walk: ${JSON.stringify(d)}`);
    }],
    ['dynein-goes-the-other-way', async (h) => {
      await h.button(/^Dynein/).click();
      const start = await until(h, (x) => (x.motor === 'dynein' && x.direction === 'minus' && x.stepNm === 8), 5_000);
      expect(start.motor === 'dynein' && start.direction === 'minus' && start.stepNm === 8, JSON.stringify(start));
      const d = await until(h, (x) => (x.positionNm < start.positionNm), 7_200);
      expect(d.positionNm < start.positionNm, `dynein should walk toward the minus end: ${start.positionNm} -> ${d.positionNm}`);
    }],
    ['myosin-is-refused-on-a-microtubule', async (h) => {
      await h.button(/^Myosin/).click();
      const d = await until(h, (x) => (x.motor === 'myosin' && x.compatible === false && x.stalled === true && x.direction === 'none'), 5_000);
      expect(d.motor === 'myosin' && d.compatible === false && d.stalled === true && d.direction === 'none', JSON.stringify(d));
      await atLeast(h, h.stage.locator('.cy-msg'), 1);
      const msg = await h.stage.locator('.cy-msg').textContent();
      expect(/cannot walk/i.test(msg), `the refusal should say why: ${JSON.stringify(msg.slice(0, 80))}`);
    }],
    ['actin-accepts-myosin', async (h) => {
      await h.button(/^Actin filament/).click();
      const d = await until(h, (x) => (x.filament === 'actin' && x.filamentDiameterNm === 7 && x.compatible === true && x.stepNm === 36) && (x.direction === 'plus' && x.speedNmPerS === 400), 5_000);
      expect(d.filament === 'actin' && d.filamentDiameterNm === 7 && d.compatible === true && d.stepNm === 36, JSON.stringify(d));
      expect(d.direction === 'plus' && d.speedNmPerS === 400, JSON.stringify(d));
    }],
    ['no-atp-stalls-and-does-not-drift', async (h) => {
      const range = h.stage.locator('input[type=range]');
      await range.fill('0');
      const stalled = await until(h, (x) => (x.atp === 0 && x.stalled === true && x.speedNmPerS === 0 && x.direction === 'none'), 5_000);
      expect(stalled.atp === 0 && stalled.stalled === true && stalled.speedNmPerS === 0 && stalled.direction === 'none', JSON.stringify(stalled));
      await h.page.waitForTimeout(600);
      expect(near((await h.describe()).positionNm, stalled.positionNm, 0.5), 'a stalled cargo must stay where it is');
      await range.fill('100');
      await until(h, (x) => x.stalled === false, 5_000);
      expect((await h.describe()).stalled === false, 'ATP back to full did not restart the motor');
    }],
    ['latrunculin-takes-the-track-away', async (h) => {
      await h.button(/^Latrunculin/).click();
      const d = await until(h, (x) => (x.drug === 'latrunculin' && x.trackIntact === false && x.stalled === true), 5_000);
      expect(d.drug === 'latrunculin' && d.trackIntact === false && d.stalled === true, JSON.stringify(d));
      await h.button(/^Latrunculin/).click();
      await until(h, (x) => x.trackIntact === true, 5_000);
      expect((await h.describe()).trackIntact === true, 'pressing the drug again did not clear it');
    }],
    ['taxol-freezes-a-microtubule-but-transport-goes-on', async (h) => {
      await h.button(/^Microtubule/).click();
      await h.button(/^Kinesin/).click();
      await h.button(/^Taxol/).click();
      const d = await until(h, (x) => (x.drug === 'taxol' && x.trackIntact === true && x.stalled === false), 5_000);
      expect(d.drug === 'taxol' && d.trackIntact === true && d.stalled === false, JSON.stringify(d));
      await h.button(/^Nocodazole/).click();
      const n = await until(h, (x) => (x.drug === 'nocodazole' && x.trackIntact === false && x.stalled === true), 5_000);
      expect(n.drug === 'nocodazole' && n.trackIntact === false && n.stalled === true, JSON.stringify(n));
    }],
    ['race-diffusion-then-reset', async (h) => {
      await h.button(/^Race/).click();
      await until(h, (x) => x.diffusionRace === true, 5_000);
      expect((await h.describe()).diffusionRace === true, 'the race did not start');
      await h.button(/^Race/).click();
      await until(h, (x) => x.diffusionRace === false, 5_000);
      expect((await h.describe()).diffusionRace === false, 'pressing Race again did not end it');
      // Reset puts the cargo back at the start; the clock is not pinned here, so it walks on at once.
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => (x.drug === null && x.atp === 1 && x.trackIntact === true && x.positionNm < 80), 5_000);
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
      let d = await until(h, (x) => (x.region === 'basal-body' && x.arrangement === '9 triplets' && x.centralPair === false), 5_000);
      expect(d.region === 'basal-body' && d.arrangement === '9 triplets' && d.centralPair === false, `at 0.02 µm: ${JSON.stringify(d)}`);
      await section.fill('50');
      d = await until(h, (x) => (x.region === 'transition' && x.arrangement === '9+0' && x.centralPair === false), 5_000);
      expect(d.region === 'transition' && d.arrangement === '9+0' && d.centralPair === false, `at 0.5 µm: ${JSON.stringify(d)}`);
      await section.fill('180');
      d = await until(h, (x) => (x.region === 'shaft' && x.arrangement === '9+2' && x.sectionUm === 1.8), 5_000);
      expect(d.region === 'shaft' && d.arrangement === '9+2' && d.sectionUm === 1.8, `at 1.8 µm: ${JSON.stringify(d)}`);
    }],
    ['beat-turns-sliding-into-a-bend', async (h) => {
      await h.button(/^Beat/).click();
      const d = await until(h, (x) => (x.beating === true && x.bendAmplitudeUm > 0.05) && (x.activeDoublets.length === 3 && x.activeDoublets.every((i) => i >= 1 && i <= 9)) && (x.stroke === 'effective' || x.stroke === 'recovery'), 5_000);
      expect(d.beating === true && d.bendAmplitudeUm > 0.05, `the shaft should bend: ${JSON.stringify(d)}`);
      expect(d.activeDoublets.length === 3 && d.activeDoublets.every((i) => i >= 1 && i <= 9), `three doublets drive a stroke: ${JSON.stringify(d.activeDoublets)}`);
      expect(d.stroke === 'effective' || d.stroke === 'recovery', `stroke ${d.stroke}`);
      // The reader is told, not just the gate: the readout names the stroke and the doublets driving it.
      // describe() reported both before any readout existed, so this reads the stage's own text and demands
      // it agree with what the figure says it is doing.
      //
      // Taken as a pair, and RETRIED until the pair agrees, because a beating cilium crosses a stroke
      // boundary about twice a second and the two halves of this reading come from different moments even
      // inside one evaluate: the readout text is whatever the last painted frame wrote, while describe()
      // recomputes from the clock when it is called. Seen 2026-09-17: describe() said `recovery` while the
      // readout still said `Effective`, one frame behind. "They always agree" was never true of a running
      // figure — the old fixed sleep simply landed away from a boundary — so what is asserted is that they
      // agree within a bounded number of tries, and a readout that is persistently wrong still fails here
      // with the step's own message, because no try will ever match it.
      let [text, now] = ['', null];
      const strokeWord = (s) => (s === 'effective' ? '^Effective' : '^Recovery');
      for (let i = 0; i < 40; i += 1) {
        [text, now] = await h.page.evaluate((id) => {
          const el = document.getElementById(id);
          return [el.querySelector('.cl-read')?.textContent ?? '', el.describe()];
        }, 'lab-cilium');
        if (new RegExp(strokeWord(now.stroke)).test(text)) break;
        await h.page.waitForTimeout(POLL_MS);
      }
      expect(new RegExp(now.stroke === 'effective' ? '^Effective' : '^Recovery').test(text), `the readout should name the ${now.stroke} stroke: ${JSON.stringify(text)}`);
      expect(now.activeDoublets.every((i) => new RegExp(`\\b${i}\\b`).test(text)), `the readout should name doublets ${now.activeDoublets.join(', ')}: ${JSON.stringify(text)}`);
      // The section caption names the region as well as the arrangement.
      const caption = await h.stage.locator('.cl-caption').textContent();
      expect(/shaft/.test(caption) && /9\+2/.test(caption), `the section caption should name the region and the arrangement: ${JSON.stringify(caption)}`);
    }],
    ['the-frequency-slider', async (h) => {
      await h.stage.locator('input[type=range]').first().fill('20');
      await until(h, (x) => x.beatHz === 20, 5_000);
      expect((await h.describe()).beatHz === 20, 'the slider did not reach 20 Hz');
    }],
    ['no-dynein-arms-and-it-goes-limp', async (h) => {
      await h.button(/^Dynein arms/).click();
      const d = await until(h, (x) => (x.dyneinArms === false && x.beating === false && x.bendAmplitudeUm === 0 && x.activeDoublets.length === 0), 5_000);
      expect(d.dyneinArms === false && d.beating === false && d.bendAmplitudeUm === 0 && d.activeDoublets.length === 0, JSON.stringify(d));
    }],
    ['arms-back-and-the-bend-returns', async (h) => {
      await h.button(/^Dynein arms/).click();
      await until(h, (x) => x.bendAmplitudeUm > 0.05, 5_000);
      expect((await h.describe()).bendAmplitudeUm > 0.05, 'the arms back on should restore the bend');
    }],
    ['released-links-slide-instead-of-bending', async (h) => {
      await h.button(/^Show sliding/).click();
      const d = await until(h, (x) => (x.nexinLinks === false && x.beating === true && x.bendAmplitudeUm === 0 && x.stroke === 'none'), 5_000);
      expect(d.nexinLinks === false && d.beating === true && d.bendAmplitudeUm === 0 && d.stroke === 'none', JSON.stringify(d));
    }],
    ['links-back-and-sliding-becomes-bending-again', async (h) => {
      await h.button(/^Show sliding/).click();
      const d = await until(h, (x) => (x.nexinLinks === true && x.bendAmplitudeUm > 0.05), 5_000);
      expect(d.nexinLinks === true && d.bendAmplitudeUm > 0.05, `the links did not come back: ${JSON.stringify(d)}`);
    }],
    ['a-primary-cilium-has-no-central-pair', async (h) => {
      await h.button(/^Primary/).click();
      const d = await until(h, (x) => (x.mode === 'primary' && x.arrangement === '9+0' && x.centralPair === false && x.dyneinArms === false && x.beating === false), 5_000);
      expect(d.mode === 'primary' && d.arrangement === '9+0' && d.centralPair === false && d.dyneinArms === false && d.beating === false, JSON.stringify(d));
      await h.button(/^Primary/).click();
      await until(h, (x) => x.mode === 'motile', 5_000);
      expect((await h.describe()).mode === 'motile', 'pressing Primary again did not return to motile');
    }],
    ['drag-orbits-and-reset-view', async (h) => {
      const before = (await h.describe()).view;
      const box = await h.stage.boundingBox();
      await h.drag({ x: box.x + box.width * 0.3, y: box.y + box.height * 0.5 }, { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 });
      await until(h, (x) => !near(before.theta, x.view.theta, 0.01), 7_000);
      expect(!near(before.theta, (await h.describe()).view.theta, 0.01), 'dragging did not orbit');
      await h.button(/^Reset view/).click();
      await h.page.waitForTimeout(900);
      expect((await h.describe()).view.distance > 0, 'Reset view left no view');
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === !before, 5_000);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === before, 5_000);
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
      const d = await until(h, (x) => (x.turgorState === 'flaccid' && x.vacuoleFraction < 0.75 && x.cytoplasmThicknessUm > 1.5), 5_000);
      expect(d.turgorState === 'flaccid' && d.vacuoleFraction < 0.75 && d.cytoplasmThicknessUm > 1.5, `at half turgor: ${JSON.stringify(d)}`);
    }],
    ['a-tenth-and-the-protoplast-leaves-the-wall', async (h) => {
      const flaccid = await h.describe();
      await h.stage.locator('input[type=range]').fill('10');
      const d = await until(h, (x) => (x.turgorState === 'plasmolysed' && x.vacuoleFraction < 0.4 && x.cytoplasmThicknessUm > 2.5) && (x.vacuoleFraction < flaccid.vacuoleFraction), 5_000);
      expect(d.turgorState === 'plasmolysed' && d.vacuoleFraction < 0.4 && d.cytoplasmThicknessUm > 2.5, `at a tenth: ${JSON.stringify(d)}`);
      expect(d.vacuoleFraction < flaccid.vacuoleFraction, 'the vacuole must keep shrinking as water leaves');
    }],
    ['water-back-and-turgor-returns', async (h) => {
      await h.stage.locator('input[type=range]').fill('100');
      const d = await until(h, (x) => (x.turgorState === 'turgid' && x.vacuoleFraction > 0.75), 5_000);
      expect(d.turgorState === 'turgid' && d.vacuoleFraction > 0.75, `water back in should restore turgor: ${JSON.stringify(d)}`);
    }],
    ['click-selects-a-structure', async (h) => {
      const box = await h.stage.boundingBox();
      await h.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      const d = await until(h, (x) => (typeof x.selected === 'string' && x.selected.length > 0), 5_000);
      expect(typeof d.selected === 'string' && d.selected.length > 0, `clicking the centre of the cut cell selected nothing: ${JSON.stringify(d)}`);
      expect(await atLeast(h, h.stage.locator('.fig-card'), 1) === 1 && await h.stage.locator('.fig-card').isVisible(), 'no card appeared for the selected structure');
    }],
    ['escape-clears-the-selection', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Escape');
      await until(h, (x) => x.selected === null, 5_000);
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
      const d = await until(h, (x) => (x.following === true && x.cut === true && x.comparison === false) && (x.view.distance < 12), 7_200);
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
      const back = await until(h, (x) => (x.following === false && x.view.distance > 60), 7_200);
      expect(back.following === false && back.view.distance > 60, `it should return to the whole cell: ${JSON.stringify(back.view)}`);
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === !before, 5_000);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === before, 5_000);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      // The labels are DOM elements the render loop places, so they arrive a frame after describe() says
      // they are on. Counted through `atLeast`, which waits for the thing being counted.
      if (before) expect(await atLeast(h, h.stage.locator('.fig-label:visible'), 6) > 5, 'fewer than six labels are on the stage with labels on');
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
      await until(h, (x) => x.view.distance < keyed.distance, 7_000);
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
      const d = await until(h, (x) => (x.order === 0 && x.year === -453) && (x.commanded === false), 5_000);
      expect(d.order === 0 && d.year === -453, `step 0 should be 前453年: ${JSON.stringify(d)}`);
      expect(d.commanded === false, `nothing has been commanded by the 周 court at 前453: ${JSON.stringify(d)}`);
    }],
    ['the-last-step-is-the-end-of-jin', async (h) => {
      await h.stage.locator('.zjs-stop[data-step="2"]').click();
      const d = await until(h, (x) => (x.order === 2 && x.year === -376 && x.jinRemnant === '亡'), 5_000);
      expect(d.order === 2 && d.year === -376 && d.jinRemnant === '亡', `step 2 should be 前376年, 晋亡: ${JSON.stringify(d)}`);
    }],
    ['keyboard-steps-through-the-three-dates', async (h) => {
      // Anchor the keyboard walk with a click rather than a bare `focus()`. The first version focused the
      // seat and pressed ArrowRight, and the gate reported order 2 after one press — a skip that the
      // figure's own handler cannot produce, since it does `go(order + 1)` and clamps. A click focuses the
      // button as a side effect of real input, which is what the reader does and what the gate should
      // exercise; the keyboard then moves from a state the recipe has established rather than assumed.
      await h.stage.locator('.zjs-stop[data-step="0"]').click();
      const afterClick = await until(h, (x) => (x.order === 0), 5_000);
      expect(afterClick.order === 0, `clicking step 0 should select it: ${JSON.stringify(afterClick)}`);
      await h.page.keyboard.press('ArrowRight');
      const afterRight = await until(h, (x) => (x.order === 1), 5_000);
      expect(afterRight.order === 1,
        `ArrowRight from step 0 should reach 前403; the click left order ${afterClick.order} and ArrowRight gave ${afterRight.order}`);
      await h.page.keyboard.press('End');
      await until(h, (x) => x.order === 2, 5_000);
      expect((await h.describe()).order === 2, `End should reach the last step: ${JSON.stringify(await h.describe())}`);
      await h.page.keyboard.press('Home');
      await until(h, (x) => x.order === 0, 5_000);
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
      const d = await until(h, (x) => (x.row === 0) && (x.yearLabel === label), 5_000);
      expect(d.row === 0, `clicking the first row should select row 0: ${JSON.stringify(d)}`);
      expect(d.yearLabel === label, `the selected row should be the one clicked ("${label}"): ${d.yearLabel}`);
    }],
    ['keyboard-walks-the-column', async (h) => {
      await h.stage.locator('.zjt-row').nth(0).focus();
      await h.page.keyboard.press('ArrowDown');
      await until(h, (x) => x.row === 1, 5_000);
      expect((await h.describe()).row === 1, `ArrowDown should advance one row: ${JSON.stringify(await h.describe())}`);
      await h.page.keyboard.press('ArrowUp');
      await until(h, (x) => x.row === 0, 5_000);
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
      const d = await until(h, (x) => (x.selection === want) && (x.gloss.length > 0), 5_000);
      expect(d.selection === want, `clicking the chip for "${want}" should select it: ${d.selection}`);
      expect(d.gloss.length > 0, `the newly selected word should carry a gloss: ${JSON.stringify(d)}`);
    }],
    ['every-chip-is-reachable-by-keyboard', async (h) => {
      const chips = await h.stage.locator('.zjw-chip').count();
      expect(chips >= 2, `the figure needs at least two words to compare: ${chips}`);
      await h.stage.locator('.zjw-chip').nth(0).focus();
      await h.page.keyboard.press('ArrowRight');
      const after = await until(h, (x) => (x.selection !== null && x.selection !== undefined), 5_000);
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
      d = await until(h, (x) => (x.growing === true && x.wallIntact === false && x.peptidoglycanNm === 0) && (x.wallLayers.join(',') === 'plasma membrane') && (x.fate === 'swollen'), 27_600);
      expect(d.growing === true && d.wallIntact === false && d.peptidoglycanNm === 0, `four seconds of growth under penicillin should have cost the wall: ${JSON.stringify(d)}`);
      expect(d.wallLayers.join(',') === 'plasma membrane', `the wall should be gone from the layers: ${JSON.stringify(d.wallLayers)}`);
      expect(d.fate === 'swollen', `no wall in an isotonic medium: swollen, not burst: ${d.fate}`);
    }],
    ['dilute-the-medium-and-it-bursts', async (h) => {
      await h.stage.locator('input[type=range]').fill('30');
      const d = await until(h, (x) => (x.externalSolute === 0.3) && (x.fate === 'lysed' && x.motility === 'none'), 9_600);
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
      d = await until(h, (x) => (x.stain === 'pink'), 34_200);
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
      d = await until(h, (x) => (x.t > 0.8), 7_200);
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

  // ---- Chapter 4, Membranes and transport ----
  //
  // These four wait on a clock, which most recipes here do not. They are simulations that open unrun,
  // so the thing worth asserting — that a sheet appears, that a hole closes, that a cell bursts — only
  // exists after the reader has let the figure run for a few seconds. The waits are the shortest that
  // reach the state, measured on this machine and then given about a third again.
  bilayer: [
    // These wait on the tank's own clock and not on the wall clock. The walk is the heaviest arithmetic
    // in the chapter and it runs inside a per-frame budget, so on a loaded machine its clock falls
    // behind the reader's: the same sheet appears, later. A fixed sleep therefore asserts how busy the
    // machine is, which is how this step went red — eleven seconds of wall time with the tank at 4.97.
    ['release-and-a-sheet-appears', async (h) => {
      const start = await h.describe();
      expect(start.assembly === 'dispersed' && start.playing === false, `the tank should open dispersed and unrun: ${JSON.stringify(start)}`);
      await h.button(/^Release/).click();
      let d = start;
      for (let i = 0; i < 70; i += 1) {
        await h.page.waitForTimeout(500);
        d = await h.describe();
        if (d.assembly === 'bilayer' && d.edgeLengthNm < 6 && d.t > 8) break;
      }
      expect(d.playing === true, `Release did not run the walk: playing ${d.playing}, t ${d.t}`);
      expect(d.assembly === 'bilayer', `phospholipids should have found a bilayer: ${d.assembly} at t=${d.t}, ${d.tailsBuried} buried`);
      expect(d.tailsBuried > 0.85, `most of the tail surface should be out of the water: ${d.tailsBuried} at t=${d.t}`);
      expect(d.thicknessNm > 5.0 && d.thicknessNm < 8.5, `the sheet should measure about 7 nm: ${d.thicknessNm}`);
      expect(d.edgeLengthNm < 6, `the sheet should have almost no rim left: ${d.edgeLengthNm} nm at t=${d.t}`);
    }],
    ['the-needle-opens-an-edge-and-the-sheet-closes-it', async (h) => {
      const before = await h.describe();
      await h.button(/^Needle/).click();
      const hit = await h.describe();
      expect(hit.punctured === true, `the needle did not register: ${JSON.stringify(hit)}`);
      expect(hit.edgeLengthNm > before.edgeLengthNm * 1.8 + 1, `the hole should have opened tail edge: ${before.edgeLengthNm} -> ${hit.edgeLengthNm}`);
      let d = hit;
      for (let i = 0; i < 40 && d.punctured; i += 1) {
        await h.page.waitForTimeout(500);
        d = await h.describe();
      }
      expect(d.punctured === false, `the hole is still open: edge ${d.edgeLengthNm} against ${before.edgeLengthNm} before, at t=${d.t}`);
      expect(d.healSeconds !== null && d.healSeconds > 0, `nothing timed the healing: ${d.healSeconds}`);
    }],
    ['curl-takes-the-wrap-away-and-the-sheet-rolls-up', async (h) => {
      // This step walks the clock with Step, half a second a press, from a fresh tank, so it reads the
      // same tank at the same clock values on every machine. It used to press Curl on whatever the running
      // walk held when the needle step above had finished, and whether that was a sheet reaching across
      // the tank — the only thing the wrap holds flat, and the only thing with ends for Curl to open —
      // depended on where the machine's load had left the clock: on 2026-09-23 it was red on 2 of 5 runs
      // of an unchanged recipe, "taking the wrap away should open two rims: 0 -> 0 nm", because the
      // needle's hole had healed as two capped pieces. A sheet that does not reach across is a real
      // outcome of the walk, so the step does not insist on one: it takes a fresh tank, up to four times,
      // until Curl opens rims, and fails only if none of the four does.
      //   It asserts the words as well as the numbers: after Curl the reading speaks of what Curl did,
      // not of the needle before it, and once the rims have closed it stops calling them open. Both were
      // wrong until 2026-09-23 — the overlay said "the sheet has two open ends" for as long as the wrap
      // was off, and the side sentence kept "The last hole closed in 1.00 s." (src/figures/bilayer.js).
      const words = async () => ({
        over: (await h.stage.locator('.bl-over').first().textContent()) || '',
        side: (await h.stage.locator('.bl-side text').allTextContents()).join(' '),
      });
      const stepUntil = async (ok, presses) => {
        let x = await h.describe();
        for (let i = 0; i < presses && !ok(x); i += 1) {
          const before = x.t;
          await h.button(/^Step/).click();
          x = await until(h, (y) => y.t > before, 10_000);
        }
        return x;
      };
      let flat = null;
      let opened = null;
      let tries = 0;
      while (!opened && tries < 4) {
        tries += 1;
        await h.button(/^Reset/).click();
        flat = await stepUntil((x) => x.t >= 10, 40);
        if (flat.assembly !== 'bilayer') continue;
        await h.button(/^Needle/).click();
        const healed = await stepUntil((x) => !x.punctured, 40);
        expect(!healed.punctured && healed.healSeconds !== null, `the needle's hole did not close within 20 s of clock: ${JSON.stringify(healed)}`);
        expect(/last hole closed in/i.test((await words()).side), `the heal time is not in the reading after the hole closed: ${JSON.stringify((await words()).side)}`);
        flat = healed;
        await h.button(/^Curl/).click();
        const after = await h.describe();
        // The wrap was what held the sheet flat, so taking it away opens two rims. That is the whole of
        // what this control does; the rolling up is the walk's, and it is what is asserted below. Whether
        // it opened any is the figure's own finding (`curl`), read here rather than re-derived with a
        // threshold of this step's own: the first version demanded 2 nm where the figure decides at 1, so a
        // Curl that opened 1.5 nm was a false red here (review, 2026-09-23). What this step adds is that
        // the edge rose when the figure says it opened, and that the overlay says so when it did not.
        if (after.curl === 'opened') {
          expect(after.edgeLengthNm > flat.edgeLengthNm, `the figure says Curl opened the ends, and the exposed edge did not rise: ${flat.edgeLengthNm} -> ${after.edgeLengthNm} nm`);
          opened = after;
        } else if (after.curl === 'none') {
          expect(/no ends opened/.test((await words()).over), `Curl opened no rims (${flat.edgeLengthNm} -> ${after.edgeLengthNm} nm) and the overlay did not say so: ${JSON.stringify((await words()).over)}`);
        }
      }
      expect(opened, `in ${tries} fresh tanks Curl never opened two rims: the last went ${flat?.edgeLengthNm} -> ${(await h.describe()).edgeLengthNm} nm, ${flat?.assembly}`);
      const open = await words();
      expect(/two open ends/.test(open.over), `with the rims just opened the overlay should say so: ${JSON.stringify(open.over)}`);
      expect(!/last hole closed/i.test(open.side), `after Curl the reading still speaks of the needle: ${JSON.stringify(open.side)}`);
      // What is asserted is that the edge GOES, which is the claim: an exposed rim is what a sheet
      // cannot tolerate. It closes by rolling its ends in and capping them rather than by making a ring
      // with water inside, because thirty-four molecules cannot make a ring — the figure's header has
      // the arithmetic, and its reading says which of the two it has done.
      const closed = await stepUntil((x) => x.sealed && x.tailsBuried > 0.95, 140);
      expect(closed.sealed === true, `the sheet should have closed its rims within 70 s of clock: edge ${closed.edgeLengthNm} nm at t=${closed.t}`);
      expect(closed.tailsBuried > 0.95, `and hidden nearly all its tail surface: ${closed.tailsBuried} at t=${closed.t}`);
      const shut = await words();
      expect(/sealed both ends/.test(shut.over) && !/open ends/.test(shut.over), `once the rims have closed the overlay should stop calling them open: ${JSON.stringify(shut.over)}`);
      expect(/capped them/.test(shut.side), `and the reading should say what Curl did: ${JSON.stringify(shut.side)}`);
    }],
    ['a-detergent-cannot-make-a-sheet', async (h) => {
      await h.button(/^Detergent/).click();
      const fresh = await h.describe();
      expect(fresh.molecule === 'detergent' && fresh.t === 0 && fresh.playing === false, `choosing a molecule should leave a fresh tank, unrun: ${JSON.stringify(fresh)}`);
      await h.button(/^Release/).click();
      let d = fresh;
      for (let i = 0; i < 40; i += 1) {
        await h.page.waitForTimeout(500);
        d = await h.describe();
        if (d.assembly === 'micelle' && d.t > 6) break;
      }
      expect(d.assembly === 'micelle', `one tail and a bulky head should give micelles: ${d.assembly} at t=${d.t}`);
    }],
    ['a-hydrocarbon-has-nothing-to-face-the-water-with', async (h) => {
      await h.button(/^Hydrocarbon/).click();
      await h.button(/^Release/).click();
      let d = await h.describe();
      for (let i = 0; i < 40; i += 1) {
        await h.page.waitForTimeout(500);
        d = await h.describe();
        if (d.assembly === 'droplet' && d.t > 5) break;
      }
      expect(d.assembly === 'droplet', `a molecule with no head should gather into a droplet: ${d.assembly} at t=${d.t}`);
    }],
    ['hot-enough-and-nothing-assembles', async (h) => {
      await h.button(/^Phospholipid/).click();
      // Reset first, THEN set the heat. This step used to do it the other way round and assert that 90 °C
      // survived the press, which pinned `bilayer`'s Reset narrower than the other seven figures of this
      // chapter — a reader who pressed Reset on a boiling tank got a tank that was still boiling, and the
      // gate was the reason it stayed that way. Reset now means "as it mounted" everywhere
      // (src/figures/bilayer.js), and this order proves the same claim: at 90 °C nothing assembles.
      await h.button(/^Reset/).click();
      await h.stage.locator('input[type=range]').fill('90');
      expect((await h.describe()).temperatureC === 90, 'the temperature slider did not reach 90 °C');
      // The claim is about a WINDOW of the tank's own clock, so it is asserted across one: thirty seconds
      // of clock walked forward with Step, half a second a press, and the verdict read after every press.
      // Step is real input and moves the clock by exactly half a second, so every run on every machine
      // reads the verdict at the same sixty clock values, and a tank that is dispersed at t = 8 and says
      // "Micelles" at t = 9.5 fails here instead of passing on whichever instant the machine landed on.
      //   It used to press Release, sleep 500 ms at a time until the clock passed 8 s, and assert once,
      // at a t the load on the machine chose — a wall-clock wait (docs/policies/local-rules.md, "A wait
      // in a gate must poll the artefact, never the wall clock"). GitHub's runner read "micelle at
      // t=8.033, 0.641 buried" where this machine had read dispersed. The figure was wrong and the gate
      // could only see it by luck: one sweep at 90 °C was a sheet or micelles about one time in ten, and
      // the verdict is now what the tank has held over the last second (src/figures/bilayer.js,
      // SAMPLE_SWEEPS). Run against the figure as it was, this step failed at the fourth read, t = 2, and
      // in a second run at the sixth, t = 3 (docs/learning/gate-proofs.md).
      //   Bound: one seed — whichever Reset gives at this point of the recipe, which the Curl step's
      // fresh tanks move on — the lab's tank shape, 90 °C, and sixty instants half a second apart. It
      // proves nothing at the temperatures between, nothing about a verdict that holds for less than half
      // a second between two reads, and nothing about any other tank shape: with the tank allowed as flat
      // as a 1024 px page once drew it, where 90 °C came together, this step stays green, which is why
      // test/bilayer-model.test.js holds the flattest shape the figure draws.
      const WINDOW_S = 30;
      const reads = [];
      let d = await h.describe();
      expect(d.t === 0 && d.playing === false, `Reset should leave a fresh tank, unrun: ${JSON.stringify(d)}`);
      while (d.t < WINDOW_S) {
        const before = d.t;
        await h.button(/^Step/).click();
        d = await until(h, (x) => x.t > before, 10_000);
        expect(d.t > before, `Step did not move the tank's clock past ${before}: ${JSON.stringify(d)}`);
        expect(d.playing === false, `Step set the walk running, so the reads are no longer at fixed clock values: ${JSON.stringify(d)}`);
        reads.push(d.tailsBuried);
        expect(d.assembly === 'dispersed', `at 90 °C the jostling should win at every point of ${WINDOW_S} s of clock: ${d.assembly} at t=${d.t}, ${d.tailsBuried} buried, after ${reads.length} reads`);
      }
      expect(reads.length >= WINDOW_S / 0.5, `the window was not walked: ${reads.length} reads to t=${d.t}`);
    }],
    ['step-moves-the-walk-without-running-it', async (h) => {
      await h.button(/^Pause|^Release/).click();
      const paused = await h.describe();
      if (paused.playing) await h.button(/^Pause/).click();
      const before = await h.describe();
      expect(before.playing === false, `the walk should be stopped: ${JSON.stringify(before)}`);
      await h.button(/^Step/).click();
      const after = await h.describe();
      expect(after.t > before.t && after.playing === false, `Step should advance the clock and leave it stopped: ${before.t} -> ${after.t}, playing ${after.playing}`);
      await h.page.waitForTimeout(600);
      expect(Math.abs((await h.describe()).t - after.t) < 1e-6, 'the clock kept running after Step');
    }],
  ],

  // The three-dimensional patch. It opens RUNNING — the lab passes no `t`, so the clock is not pinned —
  // which is why the toggle reads "Pause" here and not "Run", and why the walk has already moved by the
  // time a step asks anything of it. The fields worth asserting are the fitted ones: the diffusion
  // coefficient comes out of the reader's own bleach, and the immobile fraction out of which proteins
  // were tethered. The composition sliders are addressed by their aria-label, because there are three of
  // them and `input[type=range]` would find whichever came first in the DOM.
  membrane3d: [
    ['cut-away', async (h) => {
      await h.button(/^Cut away/).click();
      await until(h, (x) => x.cut === true, 5_000);
      expect((await h.describe()).cut === true, `Cut away did not register: ${JSON.stringify(await h.describe())}`);
      await h.button(/^Cut away/).click();
      await until(h, (x) => x.cut === false, 5_000);
      expect((await h.describe()).cut === false, 'Cut away did not toggle back');
    }],
    ['labels-toggle', async (h) => {
      const before = (await h.describe()).labels;
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === !before, 5_000);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === before, 5_000);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      if (before) expect(await atLeast(h, h.stage.locator('.fig-label'), 4) > 3, 'fewer than four labels are on the stage with labels on');
    }],
    ['drag-orbits-and-the-wheel-zooms', async (h) => {
      const box = await h.stage.boundingBox();
      const before = (await h.describe()).view;
      expect(before.distance > 0, `the view must carry a non-zero distance for the sweep: ${JSON.stringify(before)}`);
      await h.drag({ x: box.x + box.width * 0.5, y: box.y + box.height * 0.35 }, { x: box.x + box.width * 0.72, y: box.y + box.height * 0.35 });
      await h.page.waitForTimeout(600);
      const mid = (await h.describe()).view;
      expect(!near(before.theta, mid.theta, 0.01), `dragging did not orbit: theta ${before.theta} -> ${mid.theta}`);
      await h.focusable().focus();
      await h.page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.35);
      await h.page.mouse.wheel(0, -300);
      await h.page.waitForTimeout(600);
      const after = (await h.describe()).view;
      expect(after.distance < mid.distance, `the wheel did not zoom in: ${mid.distance} -> ${after.distance}`);
    }],
    ['the-sheet-shuffles-sideways-and-nothing-crosses', async (h) => {
      await h.page.waitForTimeout(1200);
      const d = await h.describe();
      expect(d.lateralSwaps > 1000, `the lipids should be exchanging places in their millions: ${d.lateralSwaps}`);
      expect(d.flipFlops === 0, `nothing should cross to the other leaflet on its own: ${d.flipFlops}`);
      expect(d.innerSugars === 0 && d.outerSugars > 0, `sugar chains stand on the outer face only: ${d.outerSugars} out, ${d.innerSugars} in`);
    }],
    ['force-a-flip-flop', async (h) => {
      await h.button(/^Force a flip-flop/).click();
      const d = await until(h, (x) => (x.flipFlops === 1) && (x.lateralSwaps > x.flipFlops * 1000), 8_400);
      expect(d.flipFlops === 1, `the forced crossing was not counted: ${d.flipFlops}`);
      expect(d.lateralSwaps > d.flipFlops * 1000, `sideways movement should dwarf a leaflet crossing: ${d.lateralSwaps} against ${d.flipFlops}`);
    }],
    ['click-a-molecule-and-follow-it', async (h) => {
      // One blind click at the middle of the stage, and then "it must have moved", is a step that fails
      // about one run in three — and not for a defect. A quarter of this sheet's proteins are tethered
      // (`tethered: i % 4 === 1` in src/figures/membrane3d.js), and the figure's own header says a
      // tethered protein does not diffuse at all: it is the point of having them. So the click picks
      // something that cannot move, and the step demands that it move. Same shape as `dna3d`'s
      // `click-a-rung`, which was green for weeks while picking nothing: a blind click asserting on
      // whatever it happened to hit. Found 2026-09-17 while converting this recipe's sleeps; the sleep
      // was not the cause and removing it was not the cure.
      //
      // So: sweep the sheet until something that CAN diffuse is picked, and say what was picked when it
      // fails. A tethered protein staying put is the correct behaviour and is not this step's subject.
      const box = await h.stage.boundingBox();
      const tried = [];
      let picked = null;
      for (let i = 2; i <= 7 && picked === null; i += 1) {
        for (const fx of [0.5, 0.42, 0.58]) {
          const x = box.x + box.width * fx;
          const y = box.y + (box.height * i) / 10;
          await h.page.mouse.click(x, y);
          const d = await h.describe();
          tried.push(`${Math.round(x - box.x)},${Math.round(y - box.y)}${d.tracked ? `=${d.tracked}` : ''}`);
          if (typeof d.tracked === 'string' && d.tracked !== 'tethered-protein') {
            picked = d.tracked;
            break;
          }
        }
      }
      expect(picked !== null, `no click anywhere down the sheet followed a molecule that can diffuse; tried ${tried.length} points (${tried.slice(0, 8).join(' ')}…)`);
      const d = await until(h, (x) => x.trackedDistanceUm > 0, 7_200);
      expect(typeof d.tracked === 'string' && d.tracked.length > 0, `the figure stopped following the ${picked} that was picked: ${JSON.stringify(d.tracked)}`);
      expect(d.trackedDistanceUm > 0, `the tracked ${d.tracked} has not moved: ${d.trackedDistanceUm} µm in ${d.trackedSeconds} s of the figure's own clock`);
    }],
    ['bleach-a-spot-and-fit-a-coefficient', async (h) => {
      await h.button(/^Bleach a spot/).click();
      const hit = await h.describe();
      expect(hit.bleached === true, `the bleach did not register: ${JSON.stringify(hit)}`);
      // Not zero: the disc is 7 nm across and a lipid moves about 0.9 nm a step, so a tenth of it is a
      // boundary layer that has swapped with the outside before the first reading can be taken. The
      // curve itself starts at zero — the sample is recorded at the moment of the bleach.
      expect(hit.recoveryFraction < 0.4, `the spot should start dark: ${hit.recoveryFraction}`);
      const d = await until(h, (x) => (x.recoveryFraction > 0.55) && (x.diffusionUm2PerS > 0.2 && x.diffusionUm2PerS < 6) && (x.immobileFraction >= 0 && x.immobileFraction <= 1), 30_000);
      expect(d.recoveryFraction > 0.55, `the spot should have come back after five seconds: ${d.recoveryFraction}`);
      expect(d.diffusionUm2PerS > 0.2 && d.diffusionUm2PerS < 6, `the fitted coefficient should be about 1 µm²/s: ${d.diffusionUm2PerS}`);
      expect(d.immobileFraction >= 0 && d.immobileFraction <= 1, `the immobile fraction is out of range: ${d.immobileFraction}`);
      expect(await atLeast(h, h.stage.locator('.m3-curve'), 1) === 1, 'no recovery curve appeared');
    }],
    ['cholesterol-moves-the-setting-point-and-the-order-in-opposite-senses', async (h) => {
      const chol = h.stage.locator('input[aria-label="Cholesterol"]');
      await chol.fill('0');
      await h.page.waitForTimeout(250);
      const bare = await h.describe();
      await chol.fill('50');
      const rich = await until(h, (x) => (x.cholesterolFraction === 0.5 && bare.cholesterolFraction === 0) && (x.transitionC < bare.transitionC - 4) && (x.order > bare.order + 0.1), 5_000);
      expect(rich.cholesterolFraction === 0.5 && bare.cholesterolFraction === 0, `the cholesterol slider did not move: ${bare.cholesterolFraction} -> ${rich.cholesterolFraction}`);
      expect(rich.transitionC < bare.transitionC - 4, `cholesterol should stop the sheet setting until it is colder: ${bare.transitionC} -> ${rich.transitionC} °C`);
      expect(rich.order > bare.order + 0.1, `and should make it stiffer at body temperature: order ${bare.order} -> ${rich.order}`);
    }],
    ['cold-enough-and-it-sets', async (h) => {
      await h.stage.locator('input[aria-label="Cholesterol"]').fill('0');
      await h.stage.locator('input[aria-label="Unsaturation"]').fill('0');
      await h.stage.locator('input[aria-label="Temperature"]').fill('5');
      const d = await until(h, (x) => (x.temperatureC === 5 && x.unsaturatedFraction === 0) && (x.phase === 'gel'), 5_000);
      expect(d.temperatureC === 5 && d.unsaturatedFraction === 0, `the two sliders did not move: ${JSON.stringify(d)}`);
      expect(d.phase === 'gel', `saturated tails at 5 °C should be a gel: phase ${d.phase}, order ${d.order}`);
    }],
  ],

  // Two scenes on one bench. The graph starts empty on purpose, so `plotted` is the field that proves the
  // reader swept it; the ceiling and the half-way concentration are the pair the second slider separates.
  'transport-lab': [
    ['sweeping-the-concentration-draws-the-curves', async (h) => {
      const start = await h.describe();
      expect(start.plotted === 0, `the graph should open empty: ${start.plotted} points`);
      const conc = h.stage.locator('input[aria-label="Concentration"]');
      for (const v of ['2', '8', '20', '40', '60', '100']) {
        await conc.fill(v);
        await h.page.waitForTimeout(90);
      }
      const d = await h.describe();
      expect(d.plotted >= 5, `sweeping should have plotted the points: ${d.plotted}`);
      expect(near(d.concentrationMM, 25, 0.01), `the slider should end at 25 mmol/L: ${d.concentrationMM}`);
      expect(d.saturationFraction > 0.9, `at 25 mmol/L the carriers should be near their ceiling: ${d.saturationFraction}`);
      expect(d.carrierFlux > d.simpleFlux * 10, `the carriers should be far ahead of the bare bilayer: ${d.carrierFlux} against ${d.simpleFlux}`);
    }],
    ['more-carriers-raise-the-ceiling-and-leave-the-half-way-point', async (h) => {
      const before = await h.describe();
      await h.stage.locator('input[aria-label="Carriers"]').fill('2000');
      const after = await until(h, (x) => (x.carriers === 2000) && (x.vmax > before.vmax) && (x.halfMaxMM === before.halfMaxMM) && (x.halfMaxMM >= 1 && x.halfMaxMM <= 2), 5_000);
      expect(after.carriers === 2000, `the carrier slider did not move: ${after.carriers}`);
      expect(after.vmax > before.vmax, `the ceiling should have risen: ${before.vmax} -> ${after.vmax}`);
      expect(after.halfMaxMM === before.halfMaxMM, `the half-way concentration must not move with the carrier count: ${before.halfMaxMM} -> ${after.halfMaxMM}`);
      expect(after.halfMaxMM >= 1 && after.halfMaxMM <= 2, `GLUT1 is half-saturated at 1 to 2 mmol/L: ${after.halfMaxMM}`);
    }],
    ['the-scene-switch-keeps-what-was-set', async (h) => {
      const before = await h.describe();
      await h.button(/^Channel/).click();
      const d = await until(h, (x) => (x.scene === 'channel') && (near(x.concentrationMM, before.concentrationMM, 1e-6) && x.carriers === before.carriers), 5_000);
      expect(d.scene === 'channel', `the scene did not switch: ${d.scene}`);
      expect(near(d.concentrationMM, before.concentrationMM, 1e-6) && d.carriers === before.carriers, `the scene switch lost what was set: ${JSON.stringify(d)}`);
    }],
    ['a-shut-gate-turns-everything-back', async (h) => {
      expect((await h.describe()).gateOpen === false, 'the channel should open with its gate shut');
      await h.button(/^Fire potassium/).click();
      const d = await until(h, (x) => (x.passes.potassium === 0 && x.rejects.potassium === 1), 5_000);
      expect(d.passes.potassium === 0 && d.rejects.potassium === 1, `a shut gate should turn potassium back: ${JSON.stringify(d.passes)} through, ${JSON.stringify(d.rejects)} back`);
    }],
    ['open-it-and-potassium-passes-where-sodium-does-not', async (h) => {
      await h.button(/^Voltage/).click();
      await until(h, (x) => x.gate === 'voltage', 5_000);
      expect((await h.describe()).gate === 'voltage', 'the voltage gate did not take');
      for (let i = 0; i < 6; i += 1) {
        await h.button(/^Fire potassium/).click();
        await h.page.waitForTimeout(120);
      }
      for (let i = 0; i < 6; i += 1) {
        await h.button(/^Fire sodium/).click();
        await h.page.waitForTimeout(120);
      }
      const d = await h.describe();
      expect(d.gateOpen === true, `the gate should be open: ${d.gate}`);
      expect(d.passes.potassium >= 4, `potassium should nearly always pass an open filter: ${d.passes.potassium} of 6`);
      expect(d.passes.sodium < d.passes.potassium, `sodium should not keep up with potassium: ${d.passes.sodium} against ${d.passes.potassium}`);
      expect(d.selectivityRatio > 2, `the filter should be visibly choosy: ${d.selectivityRatio}`);
    }],
    ['show-the-filter', async (h) => {
      await h.button(/^Show the filter/).click();
      await until(h, (x) => x.filterShown === true, 5_000);
      expect((await h.describe()).filterShown === true, 'the filter overlay did not appear');
    }],
    ['the-other-two-gates-have-their-own-causes', async (h) => {
      for (const [label, id] of [[/^Ligand/, 'ligand'], [/^Stretch/, 'stretch'], [/^Closed/, 'closed']]) {
        await h.button(label).click();
        const d = await until(h, (x) => (x.gate === id) && (x.gateOpen === (id !== 'closed')), 5_000);
        expect(d.gate === id, `the ${id} gate did not take: ${d.gate}`);
        expect(d.gateOpen === (id !== 'closed'), `gateOpen disagrees with the gate: ${d.gate}, ${d.gateOpen}`);
      }
    }],
  ],

  // The pump opens stopped at stage 0, so every number below has to be made true by pressing something.
  // The last two steps wait on a clock: the cell runs at about a minute a second while Run is on, and the
  // gradients are meant to take minutes rather than seconds to notice that the pump has stopped.
  pump: [
    ['six-steps-make-one-cycle', async (h) => {
      const start = await h.describe();
      expect(start.stage === 0 && start.cycles === 0 && start.running === false, `it should open stopped at stage 0: ${JSON.stringify(start)}`);
      expect(start.facing === 'in' && start.phosphorylated === false, `stage 0 faces the cytosol, unphosphorylated: ${start.facing}, ${start.phosphorylated}`);
      for (let i = 0; i < 6; i += 1) {
        await h.button(/^Step/).click();
        await h.page.waitForTimeout(90);
      }
      const d = await h.describe();
      expect(d.stage === 0 && d.stageName === 'na-binding', `six steps should return to the start: stage ${d.stage}, ${d.stageName}`);
      expect(d.cycles === 1 && d.atpSpent === 1, `one cycle costs one ATP: ${d.cycles} cycles, ${d.atpSpent} ATP`);
      expect(d.naMoved === 3 && d.kMoved === 2, `three sodium out and two potassium in: ${d.naMoved}, ${d.kMoved}`);
      expect(d.chargePerCycle === 1, `the pump is electrogenic, +1 out a cycle: ${d.chargePerCycle}`);
    }],
    ['the-sites-turn-over-with-the-shape', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('ArrowRight');
      const one = await until(h, (x) => (x.stage === 1 && x.phosphorylated === true && x.facing === 'in'), 5_000);
      expect(one.stage === 1 && one.phosphorylated === true && one.facing === 'in', `the phosphate arrives before the shape changes: ${JSON.stringify(one)}`);
      await h.page.keyboard.press('ArrowRight');
      const two = await until(h, (x) => (x.stage === 2 && x.facing === 'out' && x.stageName === 'na-released'), 5_000);
      expect(two.stage === 2 && two.facing === 'out' && two.stageName === 'na-released', `phosphorylated, it should turn outwards: ${JSON.stringify(two)}`);
      await h.page.keyboard.press('ArrowLeft');
      await until(h, (x) => x.stage === 1, 5_000);
      expect((await h.describe()).stage === 1, 'the left arrow did not step it back');
    }],
    ['ouabain-jams-it-from-the-outside', async (h) => {
      await h.button(/^Reset/).click();
      await h.button(/^Ouabain/).click();
      for (let i = 0; i < 6; i += 1) {
        await h.button(/^Step/).click();
        await h.page.waitForTimeout(90);
      }
      const d = await h.describe();
      expect(d.blocked === 'ouabain' && d.stalled === true, `ouabain should jam it: blocked ${d.blocked}, stalled ${d.stalled}`);
      expect(d.stageName === 'na-released' && d.facing === 'out', `it jams the outward-facing form: ${d.stageName}, facing ${d.facing}`);
      expect(d.cycles === 0, `it should not have completed a cycle: ${d.cycles}`);
    }],
    ['without-atp-it-stops-before-the-phosphate', async (h) => {
      await h.button(/^Reset/).click();
      await h.stage.locator('input[aria-label="ATP"]').fill('0');
      await h.page.waitForTimeout(150);
      await h.button(/^Step/).click();
      const d = await until(h, (x) => (x.atp === 0) && (x.blocked === 'no-atp' && x.stalled === true && x.stage === 0), 5_000);
      expect(d.atp === 0, `the ATP slider did not reach zero: ${d.atp}`);
      expect(d.blocked === 'no-atp' && d.stalled === true && d.stage === 0, `it should stall holding its sodium: ${JSON.stringify(d)}`);
    }],
    ['stopped-the-gradients-run-down-and-the-cell-swells', async (h) => {
      await h.button(/^Reset/).click();
      await h.button(/^Ouabain/).click();
      const before = await h.describe();
      expect(before.cellVolumeFraction === 1, `the cell should start at its resting volume: ${before.cellVolumeFraction}`);
      await h.button(/^Run/).click();
      // Run until the cell has got where the four assertions below need it, on ITS clock, rather than for
      // seven seconds of this machine's. Every term is a threshold the run climbs towards, so the poll
      // leaves at the first moment all four hold and the assertions are made there; on a loaded machine it
      // waits longer instead of failing, which is what the seven seconds could not do.
      await until(h, (x) => x.cellMinutes > 5 && x.naInsideMM > 20 && x.kInsideMM < before.kInsideMM - 5 && x.cellVolumeFraction > 1.02, 60_000);
      await h.button(/^Pause/).click();
      const d = await h.describe();
      expect(d.cellMinutes > 5, `several simulated minutes should have passed: ${d.cellMinutes}`);
      expect(d.naInsideMM > 20, `sodium should have leaked in: ${before.naInsideMM} -> ${d.naInsideMM} mmol/L`);
      expect(d.kInsideMM < before.kInsideMM - 5, `potassium should have leaked out: ${before.kInsideMM} -> ${d.kInsideMM}`);
      expect(d.cellVolumeFraction > 1.02, `and the cell should be swelling: ${d.cellVolumeFraction}`);
    }],
    ['a-leakier-membrane-outruns-the-pump', async (h) => {
      await h.button(/^Reset/).click();
      await h.stage.locator('input[aria-label="Leakiness"]').fill('100');
      await until(h, (x) => x.leakiness === 1, 5_000);
      expect((await h.describe()).leakiness === 1, 'the leakiness slider did not reach 100 %');
      await h.button(/^Run/).click();
      await until(h, (x) => x.naInsideMM > 15, 60_000);
      await h.button(/^Pause/).click();
      const d = await h.describe();
      expect(d.blocked === null, `nothing is blocking it: ${d.blocked}`);
      expect(d.naInsideMM > 15, `a membrane twice as leaky should outrun the pump: ${d.naInsideMM} mmol/L inside`);
    }],
  ],

  // The battery. The step that matters is `two-blockers-with-different-time-courses`: it is the whole
  // evidence for §4.7's claim that the resting potential is potassium leaking and not the pump pushing,
  // and it is checked as a pair of measurements rather than as a sentence. The cell runs at about a
  // minute a second, so the three-second wait below is three simulated minutes.
  'gradient-battery': [
    ['it-opens-with-nothing-concentrated', async (h) => {
      const d = await h.describe();
      expect(d.scene === 'gut-cell' && d.running === false, `it should open stopped on the gut cell: ${JSON.stringify(d.scene)}, running ${d.running}`);
      expect(near(d.glucoseRatio, 1, 1e-6), `glucose should start level in all three compartments: ratio ${d.glucoseRatio}`);
      expect(d.potentialMv < -65 && d.potentialMv > -80, `a resting cell sits near −70 mV: ${d.potentialMv}`);
      expect(d.nernstKMv < -90 && d.nernstKMv > -100, `and potassium's own balance point near −95 mV: ${d.nernstKMv}`);
      expect(near(d.naChemicalKj + d.naElectricalKj, d.naEnergyKjPerMol, 0.02), `the two terms should add to the total: ${d.naChemicalKj} + ${d.naElectricalKj} against ${d.naEnergyKjPerMol}`);
    }],
    ['run-it-and-glucose-climbs-above-the-lumen', async (h) => {
      await h.button(/^Run/).click();
      await until(h, (x) => x.glucoseRatio > 1.3 && x.glucoseLumenMM < 5 && x.naInsideMM < 25, 60_000);
      await h.button(/^Pause/).click();
      const d = await h.describe();
      expect(d.glucoseRatio > 1.3, `the symporter should have concentrated glucose above the lumen: ${d.glucoseCellMM} in the cell against ${d.glucoseLumenMM} in the lumen, ratio ${d.glucoseRatio}`);
      expect(d.glucoseLumenMM < 5, `and the lumen should be emptying: ${d.glucoseLumenMM}`);
      expect(d.naInsideMM < 25, `while the pump holds the sodium gradient: ${d.naInsideMM} mmol/L inside`);
    }],
    ['two-blockers-with-different-time-courses', async (h) => {
      await h.button(/^Reset/).click();
      const rest = await h.describe();
      await h.button(/^Block the pump/).click();
      await h.button(/^Run/).click();
      // The step's own statement of how long to wait is `cellMinutes > 2`, so that is what is polled — and
      // ONLY that. The assertion under it is a BOUND ("the potential should barely move for minutes"), and
      // a bound that is true now can be false later, so folding it into the poll would let the step leave
      // at the earliest moment it happened to hold rather than at the three simulated minutes it is about.
      await until(h, (x) => x.cellMinutes > 2, 60_000);
      await h.button(/^Pause/).click();
      const afterPump = await h.describe();
      expect(afterPump.pumpRunning === false && afterPump.blocked.includes('pump'), `the pump should be blocked: ${JSON.stringify(afterPump.blocked)}`);
      expect(afterPump.cellMinutes > 2, `three seconds should be about three simulated minutes: ${afterPump.cellMinutes}`);
      expect(Math.abs(afterPump.potentialMv - rest.potentialMv) < 4, `with the pump stopped the potential should barely move for minutes: ${rest.potentialMv} -> ${afterPump.potentialMv} mV after ${afterPump.cellMinutes} min`);
      expect(afterPump.naInsideMM > rest.naInsideMM, `though sodium has begun to leak in: ${rest.naInsideMM} -> ${afterPump.naInsideMM}`);
      await h.button(/^Block the leak/).click();
      const afterLeak = await until(h, (x) => (x.leakChannelsOpen === false) && (x.potentialMv - afterPump.potentialMv > 40), 5_000);
      expect(afterLeak.leakChannelsOpen === false, 'the leak channels should be blocked');
      expect(afterLeak.potentialMv - afterPump.potentialMv > 40, `blocking the leak should collapse the potential at once: ${afterPump.potentialMv} -> ${afterLeak.potentialMv} mV in under half a second`);
    }],
    ['sixty-one-and-a-half-millivolts-a-tenfold-change', async (h) => {
      await h.button(/^Reset/).click();
      const before = await h.describe();
      await h.stage.locator('input[aria-label="External potassium"]').fill('40');
      const after = await until(h, (x) => (x.kOutsideMM === 40), 5_000);
      expect(after.kOutsideMM === 40, `the potassium slider did not move: ${after.kOutsideMM}`);
      const moved = after.nernstKMv - before.nernstKMv;
      expect(Math.abs(moved - 61.5) < 1.5, `ten times the potassium outside should shift the predicted potential 61.5 mV: ${moved.toFixed(2)} mV`);
      expect(after.potentialMv > before.potentialMv + 30, `and the measured potential should follow it up: ${before.potentialMv} -> ${after.potentialMv}`);
    }],
    ['block-the-symporter-and-the-cell-gives-its-glucose-back', async (h) => {
      await h.button(/^Reset/).click();
      await h.button(/^Run/).click();
      const loaded = await until(h, (x) => (x.glucoseRatio > 1.2), 36_000);
      expect(loaded.glucoseRatio > 1.2, `the cell should have loaded first: ratio ${loaded.glucoseRatio}`);
      await h.button(/^Block the symporter/).click();
      await until(h, (x) => x.symporterActive === false && x.glucoseCellMM < loaded.glucoseCellMM, 60_000);
      await h.button(/^Pause/).click();
      const d = await h.describe();
      expect(d.symporterActive === false, 'the symporter should be blocked');
      expect(d.glucoseCellMM < loaded.glucoseCellMM, `with nothing pulling it in, glucose should drain away: ${loaded.glucoseCellMM} -> ${d.glucoseCellMM} mmol/L`);
    }],
    ['take-the-tight-junction-away-and-it-leaks-back-round', async (h) => {
      await h.button(/^Reset/).click();
      await h.button(/^Run/).click();
      // Load the cell to 1.3, not to 1.2, and the difference is the whole step. Without a tight junction the
      // ratio floors at about 1.114, so a baseline taken at the FIRST instant above 1.2 — which is what a
      // poll gives you — leaves a drop of 0.086 available and the assertion below demands 0.15. Measured:
      // `1.202 -> 1.114` fails where `1.30 -> 1.114` passes. A threshold a poll leaves at is a different
      // number from the same threshold a six-second sleep happened to overshoot, and this is the step where
      // that bites; the step above it loads to 1.3 and is the reason 1.3 is reachable.
      const sealed = await until(h, (x) => x.glucoseRatio > 1.3, 60_000);
      await h.button(/^Remove the tight junction/).click();
      await until(h, (x) => x.tightJunction === false && x.glucoseRatio < sealed.glucoseRatio - 0.15, 60_000);
      await h.button(/^Pause/).click();
      const d = await h.describe();
      expect(d.tightJunction === false, 'the tight junction should be gone');
      expect(d.glucoseRatio < sealed.glucoseRatio - 0.15, `the accumulated glucose should run back round the cell: ratio ${sealed.glucoseRatio} -> ${d.glucoseRatio}`);
    }],
    ['the-heart-cell-and-digoxin', async (h) => {
      await h.button(/^Reset/).click();
      await h.button(/^Heart cell/).click();
      const start = await until(h, (x) => (x.scene === 'heart-cell') && (near(x.calciumInsideNm, 100, 0.5) && near(x.contractionStrength, 1, 0.01)), 5_000);
      expect(start.scene === 'heart-cell', `the scene did not switch: ${start.scene}`);
      expect(near(start.calciumInsideNm, 100, 0.5) && near(start.contractionStrength, 1, 0.01), `a resting cell holds calcium near 100 nmol/L: ${JSON.stringify(start)}`);
      await h.button(/^Digoxin/).click();
      await h.button(/^Run/).click();
      await until(h, (x) => x.naInsideMM > start.naInsideMM + 1 && x.calciumInsideNm > 115 && x.contractionStrength > 1.03, 90_000);
      await h.button(/^Pause/).click();
      const d = await h.describe();
      expect(d.blocked.includes('digoxin'), `digoxin should be on the pump: ${JSON.stringify(d.blocked)}`);
      expect(d.naInsideMM > start.naInsideMM + 1, `sodium inside should rise: ${start.naInsideMM} -> ${d.naInsideMM} mmol/L`);
      expect(d.calciumInsideNm > 115, `so the antiporter expels less calcium: ${start.calciumInsideNm} -> ${d.calciumInsideNm} nmol/L`);
      expect(d.contractionStrength > 1.03, `and the cell contracts harder: ${d.contractionStrength} ×`);
    }],
  ],

  permeability: [
    ['sodium-is-refused-over-and-over', async (h) => {
      const start = await h.describe();
      expect(start.species === 'sodium' && start.barrier === 'charge' && start.hydrationShell === true, `the membrane should open with sodium at it: ${JSON.stringify(start)}`);
      await h.button(/^Run/).click();
      // Six seconds of the FIGURE's clock, not of this machine's. The second assertion below is a rate over
      // a window — "sodium should almost never get through" — so the window has to stay six seconds long;
      // what changes is that it is six seconds of the thing being measured. A busy machine now takes longer
      // in wall time and measures the same thing, where before it measured a shorter run and could fail for it.
      const t0 = (await h.describe()).t;
      await until(h, (x) => x.t >= t0 + 6, 90_000);
      const d = await h.describe();
      expect(d.rejections > 25, `sodium should have been turned away many times: ${d.rejections} in ${d.t} s`);
      expect(d.crossingsIn + d.crossingsOut <= 2, `sodium should almost never get through: ${d.crossingsIn} in, ${d.crossingsOut} out`);
    }],
    ['oxygen-goes-straight-through-and-equalises', async (h) => {
      await h.button(/^Oxygen/).click();
      expect((await h.describe()).barrier === 'none', 'oxygen should meet no barrier');
      const d = await until(h, (x) => (x.crossingsIn + x.crossingsOut > 10) && (x.equilibrated === true), 30_000);
      expect(d.crossingsIn + d.crossingsOut > 10, `oxygen should cross freely: ${d.crossingsIn} in, ${d.crossingsOut} out`);
      expect(d.equilibrated === true, `the two sides should have equalised: ${d.insideMM} in, ${d.outsideMM} out`);
    }],
    ['at-equilibrium-both-counters-are-still-climbing', async (h) => {
      const before = await h.describe();
      await h.page.waitForTimeout(3500);
      const after = await h.describe();
      expect(after.equilibrated === true, `it should still be at equilibrium: ${after.insideMM} in, ${after.outsideMM} out`);
      expect(after.crossingsIn > before.crossingsIn && after.crossingsOut > before.crossingsOut, `both counters should keep climbing at equilibrium: in ${before.crossingsIn}->${after.crossingsIn}, out ${before.crossingsOut}->${after.crossingsOut}`);
    }],
    ['a-channel-moves-the-bar-by-six-decades', async (h) => {
      await h.button(/^Sodium/).click();
      const bare = await h.describe();
      await h.button(/^Channel/).click();
      const withCh = await h.describe();
      expect(withCh.channelPresent === true, 'the channel did not register');
      const decades = Math.log10(withCh.permeabilityCmPerS / bare.permeabilityCmPerS);
      expect(decades > 5.5 && decades < 6.5, `a channel should raise the coefficient about six decades: ${decades.toFixed(2)}`);
      expect(withCh.fluxPerSecond > bare.fluxPerSecond * 1e5, `the flux should move with it: ${bare.fluxPerSecond} -> ${withCh.fluxPerSecond}`);
      await h.button(/^Channel/).click();
      expect((await h.describe()).channelPresent === false, 'the channel would not come out again');
    }],
    ['a-chloride-ion-is-pulled-one-way-by-each', async (h) => {
      // The earlier steps equalised the two sides, so the concentrations are set again here: a
      // concentration term of zero would satisfy "the two terms oppose" for the wrong reason, and it
      // did — the edit that was supposed to add these three lines was a silent no-op for an hour.
      await h.button(/^Chloride/).click();
      await h.stage.locator('input[type=range]').nth(0).fill('145');
      await h.stage.locator('input[type=range]').nth(1).fill('12');
      await h.stage.locator('input[type=range]').nth(2).fill('-70');
      const d = await h.describe();
      expect(d.outsideMM === 145 && d.insideMM === 12 && d.voltageMv === -70, `the sliders did not take: ${JSON.stringify(d)}`);
      expect(d.chemicalDrive > 5, `145 outside against 12 inside should pull chloride in hard: ${d.chemicalDrive} kJ/mol`);
      expect(d.electricalDrive < -5, `a negative interior should push an anion out just as hard: ${d.electricalDrive} kJ/mol`);
      // And the two nearly cancel, which is the finding: −70 mV is close to chloride's own equilibrium
      // potential for this pair of concentrations, so the readout should say so rather than pick a side.
      expect(Math.abs(d.chemicalDrive + d.electricalDrive) < 1.5, `the two should nearly cancel: ${d.chemicalDrive} + ${d.electricalDrive}`);
      expect(d.netDirection !== 'in', `with the electrical term the larger, nothing should be driving chloride inwards: ${d.netDirection}`);
    }],
    ['thickness-and-area-are-ficks-law', async (h) => {
      const before = await h.describe();
      await h.stage.locator('input[type=range]').nth(3).fill('8');
      const thick = await h.describe();
      expect(thick.thicknessNm === 8, `the thickness slider did not move: ${thick.thicknessNm}`);
      expect(Math.abs(thick.permeabilityCmPerS - before.permeabilityCmPerS / 2) < before.permeabilityCmPerS * 0.02, `doubling the thickness should halve the coefficient: ${before.permeabilityCmPerS} -> ${thick.permeabilityCmPerS}`);
      await h.stage.locator('input[type=range]').nth(4).fill('4');
      const wide = await h.describe();
      expect(wide.areaUm2 === 4, `the area slider did not move: ${wide.areaUm2}`);
      expect(Math.abs(wide.fluxPerSecond - thick.fluxPerSecond * 4) < thick.fluxPerSecond * 0.05, `four times the area should be four times the flux: ${thick.fluxPerSecond} -> ${wide.fluxPerSecond}`);
    }],
  ],

  osmometer: [
    ['the-piston-measures-the-osmotic-pressure', async (h) => {
      const start = await h.describe();
      expect(start.scene === 'osmometer' && start.pistonMPa === 0 && start.netWaterFlow === 'in', `the tube should open with water about to cross inwards: ${JSON.stringify(start)}`);
      const want = start.osmoticPressureMPa;
      expect(want > 0.2 && want < 0.5, `290 against 150 mOsm should come to about 0.36 MPa: ${want}`);
      await ensureRunning(h);
      await h.page.waitForTimeout(1200);
      expect((await h.describe()).netWaterFlow === 'in', 'water should be crossing');
      // The piston: pressed to the osmotic pressure, the flow stops. That is what the number means.
      await h.stage.locator('input[type=range]').nth(2).fill(String(Math.round(want * 20) / 20));
      const d = await until(h, (x) => (x.pistonMPa > 0.3) && (x.netWaterFlow === 'none' && x.equilibrated === true) && (Math.abs(x.psiInside - x.psiOutside) < 0.02), 5_000);
      expect(d.pistonMPa > 0.3, `the piston did not take: ${d.pistonMPa}`);
      expect(d.netWaterFlow === 'none' && d.equilibrated === true, `the piston should have stopped the flow: ${d.netWaterFlow}, Ψp inside ${d.psiPressureInside}`);
      expect(Math.abs(d.psiInside - d.psiOutside) < 0.02, `the two potentials should have met: ${d.psiInside} against ${d.psiOutside}`);
    }],
    ['an-animal-cell-in-the-same-pair-bursts', async (h) => {
      await h.button(/^Animal cell/).click();
      const fresh = await h.describe();
      expect(fresh.scene === 'animal-cell' && fresh.volumeFraction === 1 && fresh.playing === false && fresh.psiPressureInside === 0, `choosing a scene should give a fresh cell, unrun and with no pressure term: ${JSON.stringify(fresh)}`);
      expect(fresh.tonicity === 'hypotonic', `150 mOsm round a 290 mOsm cell is hypotonic: ${fresh.tonicity}`);
      await ensureRunning(h);
      const d = await until(h, (x) => (x.outcome === 'lysed') && (x.psiPressureInside === 0), 36_000);
      expect(d.outcome === 'lysed', `it should have burst: ${d.outcome} at ${d.volumeFraction} of resting volume`);
      expect(d.psiPressureInside === 0, `nothing should have converted the water into pressure: ${d.psiPressureInside}`);
    }],
    ['a-walled-cell-in-the-same-pair-turns-it-into-pressure', async (h) => {
      await h.button(/^Plant cell/).click();
      await ensureRunning(h);
      const d = await until(h, (x) => (x.outcome === 'turgid') && (x.psiPressureInside > 0.2) && (x.volumeFraction < 1.2) && (x.equilibrated === true), 36_000);
      expect(d.outcome === 'turgid', `the walled cell should be turgid: ${d.outcome}`);
      expect(d.psiPressureInside > 0.2, `the wall should be pushing back: ${d.psiPressureInside} MPa`);
      expect(d.volumeFraction < 1.2, `a wall barely lets the volume change: ${d.volumeFraction}`);
      expect(d.equilibrated === true, `the pressure should have stopped the water arriving: net flow ${d.netWaterFlow}`);
    }],
    ['salt-counts-twice', async (h) => {
      await h.button(/^Animal cell/).click();
      await h.stage.locator('input[type=range]').nth(0).fill('150');
      const sugar = await h.describe();
      await h.button(/^Salt/).click();
      const salt = await h.describe();
      expect(salt.soluteKind === 'salt' && salt.osmolarityOutside === sugar.osmolarityOutside * 2, `salt should give twice the osmolarity: ${sugar.osmolarityOutside} -> ${salt.osmolarityOutside}`);
      expect(salt.tonicity === 'hypertonic', `300 mOsm of salt round a 290 mOsm cell is hypertonic: ${salt.tonicity}`);
    }],
    ['iso-osmotic-urea-is-not-isotonic', async (h) => {
      await h.button(/^Animal cell/).click();
      await h.stage.locator('input[type=range]').nth(0).fill('290');
      await h.button(/^Urea/).click();
      const start = await h.describe();
      expect(start.permeantSolute === true, 'urea should be marked as crossing');
      expect(start.osmolarityOutside === start.osmolarityInside, `the two should start iso-osmotic: ${start.osmolarityOutside} against ${start.osmolarityInside}`);
      expect(start.tonicity === 'hypotonic', `iso-osmotic urea is still hypotonic: ${start.tonicity}`);
      await ensureRunning(h);
      const d = await until(h, (x) => (x.outcome === 'lysed'), 54_000);
      expect(d.outcome === 'lysed', `the cell should burst in iso-osmotic urea: ${d.outcome} at ${d.volumeFraction}`);
    }],
    ['a-hypertonic-bath-crenates-and-plasmolyses', async (h) => {
      await h.button(/^Sugar/).click();
      await h.stage.locator('input[type=range]').nth(0).fill('600');
      await h.button(/^Animal cell/).click();
      await ensureRunning(h);
      let d = await until(h, (x) => (x.outcome === 'crenated'), 30_000);
      expect(d.outcome === 'crenated', `a hypertonic bath should crenate it: ${d.outcome} at ${d.volumeFraction}`);
      await h.button(/^Plant cell/).click();
      await ensureRunning(h);
      d = await until(h, (x) => (x.outcome === 'plasmolysed') && (x.psiPressureInside === 0), 30_000);
      expect(d.outcome === 'plasmolysed', `the walled cell should plasmolyse: ${d.outcome} at ${d.volumeFraction}`);
      expect(d.psiPressureInside === 0, `a plasmolysed cell has no pressure in its wall: ${d.psiPressureInside}`);
    }],
  ],

  'bulk-transport': [
    ['drinking-alone-costs-the-cell-its-surface', async (h) => {
      const start = await h.describe();
      expect(start.membraneAreaUm2 === 1000 && start.areaBalance === 0, `the ledger should open flat: ${JSON.stringify(start)}`);
      await h.stage.locator('input[type=range]').nth(1).fill('12');
      expect((await h.describe()).pinocytosisRate === 12, 'the drinking slider did not take');
      // On the figure's own clock, not the wall clock: every one of these figures runs inside a
      // per-frame budget, so a machine with another gate on it delivers the same behaviour later.
      await ensureRunning(h);
      const d = await until(h, (x) => x.t > 5, 30_000);
      expect(d.vesiclesIn > 40, `twelve vesicles a second for five seconds of the figure's own clock is about sixty: ${d.vesiclesIn} at t=${d.t}`);
      expect(d.areaBalance < -1, `drinking with no secretion should cost the cell surface: ${d.areaBalance} µm²`);
      expect(d.membraneAreaUm2 < 999, `the surface should have shrunk: ${d.membraneAreaUm2}`);
    }],
    ['secreting-at-the-same-rate-brings-the-ledger-flat', async (h) => {
      const before = await h.describe();
      await h.stage.locator('input[type=range]').nth(2).fill('12');
      expect((await h.describe()).processes.includes('exocytosis'), 'setting a secretion rate should start exocytosis');
      const after = await until(h, (x) => x.t > before.t + 5, 30_000);
      const drift = Math.abs(after.areaBalance - before.areaBalance);
      expect(drift < 0.6, `matched flows should stop the drift: balance ${before.areaBalance} -> ${after.areaBalance}`);
      expect(after.vesiclesOut > 40, `the cell should be secreting too: ${after.vesiclesOut}`);
    }],
    ['a-broken-receptor-leaves-the-ldl-outside', async (h) => {
      await h.button(/^Reset/).click();
      await h.stage.locator('input[type=range]').nth(1).fill('0');
      await h.stage.locator('input[type=range]').nth(2).fill('0');
      await ensureRunning(h);
      const working = await until(h, (x) => x.ldlInternalised > 0 && x.t > 7, 40_000);
      expect(working.ldlInternalised > 0, `a working receptor should bring LDL in: ${working.ldlInternalised} at t=${working.t}`);
      await h.button(/^Break receptor/).click();
      expect((await h.describe()).receptorsWorking === false, 'the receptor did not break');
      const broken = await until(h, (x) => x.t > working.t + 8, 40_000);
      expect(broken.ldlInternalised === working.ldlInternalised, `a broken receptor should take nothing in: ${working.ldlInternalised} -> ${broken.ldlInternalised}`);
      expect(broken.ldlOutside > working.ldlOutside, `and the LDL should pile up outside: ${working.ldlOutside} -> ${broken.ldlOutside}`);
    }],
    ['phagocytosis-delivers-a-bacterium-to-a-lysosome', async (h) => {
      await h.button(/^Break receptor/).click();
      await h.button(/^Phagocytosis/).click();
      expect((await h.describe()).processes.includes('phagocytosis'), 'phagocytosis did not start');
      await ensureRunning(h);
      const d = await until(h, (x) => x.digested >= 1, 45_000);
      expect(d.digested >= 1, `one cycle should reach a lysosome in twelve seconds: ${d.digested} digested at t=${d.t}, stage "${d.stageName}"`);
      expect(d.areaBalance < -3, `a phagosome carries 4.5 µm² of surface in with it: ${d.areaBalance}`);
    }],
    ['a-patch-goes-out-and-comes-back-the-same-way-round', async (h) => {
      await h.button(/^Reset/).click();
      await h.button(/^Follow a patch/).click();
      const marked = await h.describe();
      expect(marked.markedPatchFace === 'vesicle-lumen' && marked.sugarsFacing === 'lumen', `a patch starts on a vesicle, sugars in its lumen: ${JSON.stringify(marked)}`);
      await ensureRunning(h);
      let face = null;
      const seen = [];
      for (let i = 0; i < 40 && face !== 'cell-exterior'; i += 1) {
        await h.page.waitForTimeout(400);
        face = (await h.describe()).markedPatchFace;
        if (!seen.includes(face)) seen.push(face);
      }
      expect(face === 'cell-exterior', `the patch should reach the outside within sixteen seconds; it went ${seen.join(' -> ')}`);
      expect((await h.describe()).sugarsFacing === 'exterior', 'the sugars should now face the outside');
      for (let i = 0; i < 40 && face !== 'endosome-lumen'; i += 1) {
        await h.page.waitForTimeout(400);
        face = (await h.describe()).markedPatchFace;
        if (!seen.includes(face)) seen.push(face);
      }
      expect(face === 'endosome-lumen', `and be taken back in within sixteen seconds; it went ${seen.join(' -> ')}`);
      const d = await h.describe();
      expect(d.sugarsFacing === 'lumen', 'back in a lumen, the same way round');
      expect(!seen.includes('cytosol'), `the patch faced the cytosol at some point, which no route in this model allows: ${seen.join(' -> ')}`);
    }],
    ['the-receptor-count-is-what-a-statin-raises', async (h) => {
      await h.button(/^Reset/).click();
      await h.stage.locator('input[type=range]').nth(0).fill('24');
      const d = await h.describe();
      expect(d.receptorCount === 24 && d.receptorsWorking === true, `the receptor slider did not take: ${JSON.stringify(d)}`);
      await ensureRunning(h);
      const many = await until(h, (x) => x.ldlInternalised >= 8, 40_000);
      expect(many.ldlInternalised >= 8, `more receptors should take in more LDL: ${many.ldlInternalised} at t=${many.t}`);
    }],
  ],

  'entropy-ledger': [
    ['opens-open-supplied-and-running', async (h) => {
      const d = await h.describe();
      expect(d.mode === 'open', `the compartment should open with its boundary open: ${d.mode}`);
      expect(d.playing === true, 'it should open running slowly, so the first thing to do is seal it');
      expect(d.chainLength >= 6, `it should open with a short chain already built: ${d.chainLength}`);
      expect(d.totalEverFell === false, 'the total has already fallen at t=0, which is a defect');
    }],
    ['perfect-efficiency-still-cannot-make-the-total-fall', async (h) => {
      const eff = h.stage.locator('input[type=range]').nth(1);
      await eff.fill('100');
      await atValue(h, eff, 100);
      const set = await until(h, (x) => x.efficiency === 1, 5_000);
      expect(set.efficiency === 1, `the efficiency slider did not take: ${JSON.stringify(set)}`);
      await ensureRunning(h);
      const before = await h.describe();
      const after = await until(h, (x) => x.entropyTotal > before.entropyTotal + 3, 30_000);
      expect(after.entropyTotal > before.entropyTotal + 3, `at efficiency 1 the total should still climb: ${before.entropyTotal} -> ${after.entropyTotal} at t=${after.t}`);
      expect(after.totalEverFell === false, `the total fell somewhere with efficiency at 1: ${JSON.stringify(after)}`);
      expect(after.entropyInside < 0, `the inside should have fallen as the chain grew: ${after.entropyInside}`);
    }],
    ['temperature-changes-the-rate-and-not-the-rule', async (h) => {
      const temp = h.stage.locator('input[type=range]').nth(2);
      await temp.fill('50');
      await atValue(h, temp, 50);
      const set = await until(h, (x) => x.temperatureC === 50, 5_000);
      expect(set.temperatureC === 50, `the temperature slider did not take: ${JSON.stringify(set)}`);
      const after = await until(h, (x) => x.heatShed > set.heatShed + 2, 30_000);
      expect(after.heatShed > set.heatShed + 2, `a warmer compartment should shed more heat: ${set.heatShed} -> ${after.heatShed} at t=${after.t}`);
      expect(after.totalEverFell === false, 'the total fell when the temperature was raised');
    }],
    ['sealing-stops-the-supply-and-the-chain-comes-apart', async (h) => {
      await h.button(/^Seal the boundary/).click();
      const sealed = await until(h, (x) => x.mode === 'sealed', 5_000);
      expect(sealed.mode === 'sealed', `Seal the boundary did not seal it: ${JSON.stringify(sealed)}`);
      await ensureRunning(h);
      const decaying = await until(h, (x) => x.decaying === true, 40_000);
      expect(decaying.decaying === true, `a sealed compartment should start losing its chain: ${JSON.stringify(decaying)}`);
      const gone = await until(h, (x) => x.chainLength < sealed.chainLength && x.entropyTotal > decaying.entropyTotal, 40_000);
      expect(gone.chainLength < sealed.chainLength, `the chain should be coming apart: ${sealed.chainLength} -> ${gone.chainLength}`);
      expect(gone.entropyInside > decaying.entropyInside, `the inside bar should climb back as the chain goes: ${decaying.entropyInside} -> ${gone.entropyInside}`);
      expect(gone.entropyTotal > decaying.entropyTotal, `and the total should still be rising: ${decaying.entropyTotal} -> ${gone.entropyTotal}`);
      expect(gone.totalEverFell === false, 'the total fell while the sealed chain came apart');
    }],
    ['reset-puts-every-control-back-where-it-opened', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.mode === 'open' && x.efficiency === 0.6, 5_000);
      expect(d.mode === 'open', `Reset left the boundary ${d.mode}`);
      expect(d.supplyRate === 4 && d.efficiency === 0.6 && d.temperatureC === 37, `Reset left the sliders at ${JSON.stringify({ supplyRate: d.supplyRate, efficiency: d.efficiency, temperatureC: d.temperatureC })}`);
      expect(d.playing === true, 'Reset should leave it running, which is how it opened');
      expect(d.totalEverFell === false && d.decaying === false && d.sealedSeconds === 0, `Reset left ${JSON.stringify({ totalEverFell: d.totalEverFell, decaying: d.decaying, sealedSeconds: d.sealedSeconds })}`);
      // The clock and the ledger both restart, so the books are the six opening monomers' again. The
      // bounds are loose because the compartment is running: at four food a second it builds one more
      // monomer every 250 ms, and a poll cannot stop the world to read an exact figure.
      expect(d.t < 2, `Reset did not restart the clock: t=${d.t}`);
      expect(d.chainLength >= 6 && d.chainLength <= 14, `Reset should put the chain back to its opening six: ${d.chainLength}`);
      expect(d.entropyOutside < 40, `Reset should clear the ledger: entropyOutside ${d.entropyOutside}`);
    }],
  ],

  'free-energy': [
    ['opens-mildly-exergonic-and-unrun', async (h) => {
      const d = await h.describe();
      expect(d.playing === false, 'it should open unrun');
      expect(d.verdict === 'exergonic' && d.deltaGKj < 0, `it should open mildly exergonic: ${JSON.stringify({ verdict: d.verdict, deltaGKj: d.deltaGKj })}`);
      expect(d.crossingsForward === 0 && d.crossingsBack === 0, `the tallies should start at nothing: ${d.crossingsForward}/${d.crossingsBack}`);
      expect(d.productRemoved === false, 'the cell switch should start off');
    }],
    ['the-concentrations-alone-turn-the-reaction-round', async (h) => {
      const before = await h.describe();
      const reactant = h.stage.locator('input[type=range]').nth(3);
      const product = h.stage.locator('input[type=range]').nth(4);
      await product.fill('40');
      await atValue(h, product, 40);
      await reactant.fill('0');
      await atValue(h, reactant, 0);
      const d = await until(h, (x) => x.verdict === 'endergonic', 5_000);
      expect(d.verdict === 'endergonic', `piling up the product should reverse it: ${JSON.stringify({ verdict: d.verdict, deltaGKj: d.deltaGKj, reactantMM: d.reactantMM, productMM: d.productMM })}`);
      // The section's whole claim: not one atom of the chemistry changed.
      expect(d.deltaGStandardKj === before.deltaGStandardKj, `the standard value moved with the concentrations: ${before.deltaGStandardKj} -> ${d.deltaGStandardKj}`);
      expect(d.equilibriumRatio === before.equilibriumRatio, `the equilibrium ratio moved with the concentrations: ${before.equilibriumRatio} -> ${d.equilibriumRatio}`);
      expect(d.concentrationTermKj > 0, `the concentration term should now be pushing back: ${d.concentrationTermKj}`);
    }],
    ['the-hydrophobic-preset-takes-heat-in-and-runs-anyway', async (h) => {
      await h.button(/^Hydrophobic effect/).click();
      const d = await until(h, (x) => x.entropyDriven === true, 5_000);
      expect(d.entropyDriven === true, `the preset should land on an entropy-driven reaction: ${JSON.stringify({ deltaHKj: d.deltaHKj, deltaGStandardKj: d.deltaGStandardKj })}`);
      expect(d.deltaHKj > 0, `its heat term should be positive: ${d.deltaHKj}`);
      expect(d.deltaGStandardKj < 0, `and its standard ΔG negative: ${d.deltaGStandardKj}`);
      expect(d.carryingTerm === 'entropy', `the entropy term should be the one carrying it: ${d.carryingTerm}`);
      expect(typeof d.flipTemperatureC === 'number', `both terms pull the same way, so there is a flip temperature: ${d.flipTemperatureC}`);
    }],
    ['running-settles-at-equilibrium-and-both-tallies-keep-climbing', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.crossingsForward === 0, 5_000);
      await ensureRunning(h);
      const eq = await until(h, (x) => x.atEquilibrium === true, 60_000);
      expect(eq.atEquilibrium === true, `it should reach equilibrium: ΔG ${eq.deltaGKj} at t=${eq.t}`);
      const later = await until(h, (x) => x.crossingsForward > eq.crossingsForward + 20, 30_000);
      expect(later.crossingsForward > eq.crossingsForward + 20, `the forward tally should keep climbing at equilibrium: ${eq.crossingsForward} -> ${later.crossingsForward}`);
      expect(later.crossingsBack > eq.crossingsBack + 10, `and so should the back one: ${eq.crossingsBack} -> ${later.crossingsBack}`);
      expect(later.atEquilibrium === true, `and it should still be at equilibrium while they do: ΔG ${later.deltaGKj}`);
    }],
    ['the-cell-switch-keeps-delta-g-negative', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.secondsNegative === 0, 5_000);
      const product = h.stage.locator('input[type=range]').nth(4);
      await product.fill('0');
      await atValue(h, product, 0);
      await h.button(/^Keep the product removed/).click();
      const on = await until(h, (x) => x.productRemoved === true, 5_000);
      expect(on.productRemoved === true, 'the cell switch did not go on');
      await ensureRunning(h);
      const held = await until(h, (x) => x.secondsNegative > 4, 40_000);
      expect(held.secondsNegative > 4, `ΔG should stay negative with the product removed: ${held.secondsNegative} s, ΔG ${held.deltaGKj}`);
      expect(held.deltaGKj < 0 && held.atEquilibrium === false, `and it should never reach equilibrium: ${JSON.stringify({ deltaGKj: held.deltaGKj, atEquilibrium: held.atEquilibrium })}`);
      expect(held.productMM <= on.productMM + 1e-6, `the product should be taken away as fast as it is made: ${on.productMM} -> ${held.productMM}`);
    }],
    ['reset-puts-every-control-back-where-it-opened', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.playing === false && x.crossingsForward === 0, 5_000);
      expect(d.playing === false, 'Reset should leave it unrun, which is how it opened');
      expect(d.deltaHKj === -20 && d.temperatureC === 37, `Reset left the chemistry at ${JSON.stringify({ deltaHKj: d.deltaHKj, deltaSKjPerK: d.deltaSKjPerK, temperatureC: d.temperatureC })}`);
      expect(d.productRemoved === false && d.secondsNegative === 0, `Reset left the cell switch at ${JSON.stringify({ productRemoved: d.productRemoved, secondsNegative: d.secondsNegative })}`);
      expect(d.crossingsForward === 0 && d.crossingsBack === 0, `Reset left the tallies at ${d.crossingsForward}/${d.crossingsBack}`);
      expect(d.verdict === 'exergonic' && d.t === 0, `Reset left ${JSON.stringify({ verdict: d.verdict, t: d.t })}`);
    }],
  ],

  'activation-barrier': [
    ['the-enzyme-moves-the-barrier-and-not-the-destination', async (h) => {
      const before = await h.describe();
      expect(before.enzymePresent === false, 'it should open with no enzyme');
      expect(before.activationKj === 68, `the bare forward barrier should be 68 kJ/mol: ${before.activationKj}`);
      await h.button(/^Add enzyme/).click();
      const after = await until(h, (x) => x.enzymePresent === true, 5_000);
      expect(after.enzymePresent === true, 'Add enzyme did not register');
      // §5.5's whole argument, as three assertions the figure cannot pass by accident.
      expect(after.deltaGKj === before.deltaGKj, `ΔG moved when the enzyme went on: ${before.deltaGKj} -> ${after.deltaGKj}`);
      expect(after.equilibriumRatio === before.equilibriumRatio, `the balance ratio moved when the enzyme went on: ${before.equilibriumRatio} -> ${after.equilibriumRatio}`);
      expect(after.activationKj < before.activationKj - 17, `the forward barrier should fall by about 17.8: ${before.activationKj} -> ${after.activationKj}`);
      const dF = before.activationKj - after.activationKj;
      const dR = before.activationReverseKj - after.activationReverseKj;
      expect(near(dF, dR, 1e-3), `both barriers must fall by the same amount: forward ${dF}, reverse ${dR}`);
      expect(after.speedUp > 900 && after.speedUp < 1100, `three decades off the barrier is a thousandfold at 37 °C: ${after.speedUp}`);
    }],
    ['a-run-from-product-lands-on-the-same-ratio', async (h) => {
      await ensureRunning(h);
      const fromReactant = await until(h, (x) => Math.abs(x.ratioNow - x.equilibriumRatio) / x.equilibriumRatio < 0.05, 60_000);
      expect(Math.abs(fromReactant.ratioNow - fromReactant.equilibriumRatio) / fromReactant.equilibriumRatio < 0.05,
        `starting from reactant it should settle on the balance ratio: ${fromReactant.ratioNow} against ${fromReactant.equilibriumRatio} at t=${fromReactant.t}`);
      await h.button(/^Start from product/).click();
      const flipped = await until(h, (x) => x.startedFrom === 'product' && x.ratioNow > x.equilibriumRatio * 2, 10_000);
      expect(flipped.startedFrom === 'product', `Start from product did not register: ${JSON.stringify(flipped)}`);
      const fromProduct = await until(h, (x) => Math.abs(x.ratioNow - x.equilibriumRatio) / x.equilibriumRatio < 0.05, 60_000);
      expect(Math.abs(fromProduct.ratioNow - fromProduct.equilibriumRatio) / fromProduct.equilibriumRatio < 0.05,
        `and from the other end it must land in the same place: ${fromProduct.ratioNow} against ${fromProduct.equilibriumRatio} at t=${fromProduct.t}`);
      expect(fromProduct.reverted > 0, `running back from pure product should count reversions: ${fromProduct.reverted}`);
    }],
    ['heat-unfolds-the-enzyme-and-the-barrier-springs-back', async (h) => {
      const temp = h.stage.locator('input[type=range]').nth(0);
      await temp.fill('55');
      await atValue(h, temp, 55);
      const set = await until(h, (x) => x.temperatureC === 55, 5_000);
      expect(set.temperatureC === 55, `the temperature slider did not take: ${JSON.stringify(set)}`);
      await ensureRunning(h);
      const dead = await until(h, (x) => x.denatured === true, 40_000);
      expect(dead.denatured === true, `55 °C should unfold the enzyme: intact ${dead.enzymeIntact} at t=${dead.t}`);
      const back = await until(h, (x) => x.activationKj > 64, 40_000);
      expect(back.activationKj > 64, `the barrier should spring back towards 68: ${back.activationKj}`);
      expect(back.speedUp < 5, `and the speed-up should collapse with it: ${back.speedUp}`);
      expect(back.deltaGKj === -12, `ΔG must not move when the enzyme is destroyed: ${back.deltaGKj}`);
    }],
    ['the-site-takes-the-substrate-refuses-the-wrong-shape-and-is-blocked-by-the-inhibitor', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.enzymePresent === false, 5_000);
      await h.button(/^Add enzyme/).click();
      await until(h, (x) => x.enzymePresent === true, 5_000);
      await h.button(/^Offer a wrong shape/).click();
      const wrong = await until(h, (x) => x.offered === 'wrong-shape', 5_000);
      expect(wrong.accepted === false && wrong.siteClosed === false, `the site must refuse a wrong shape: ${JSON.stringify({ offered: wrong.offered, accepted: wrong.accepted, siteClosed: wrong.siteClosed })}`);
      await h.button(/^Offer the substrate/).click();
      const right = await until(h, (x) => x.offered === 'substrate' && x.siteClosed === true, 5_000);
      expect(right.accepted === true && right.siteClosed === true, `the site must close on its substrate: ${JSON.stringify({ accepted: right.accepted, siteClosed: right.siteClosed })}`);
      await h.button(/^Offer an inhibitor/).click();
      const blocked = await until(h, (x) => x.offered === 'inhibitor', 5_000);
      expect(blocked.accepted === false, `an inhibitor is not converted, so the site has not taken it: ${blocked.accepted}`);
      expect(blocked.speedUp < right.speedUp, `an inhibitor should slow it: ${right.speedUp} -> ${blocked.speedUp}`);
      expect(blocked.equilibriumRatio === right.equilibriumRatio, `and an inhibitor must not move the destination either: ${right.equilibriumRatio} -> ${blocked.equilibriumRatio}`);
    }],
    ['the-transition-state-can-be-shown-and-put-away', async (h) => {
      await h.button(/^Show the transition state/).click();
      const on = await until(h, (x) => x.transitionShown === true, 5_000);
      expect(on.transitionShown === true, 'Show the transition state did not register');
      await h.button(/^Show the transition state/).click();
      const off = await until(h, (x) => x.transitionShown === false, 5_000);
      expect(off.transitionShown === false, 'pressing it again did not put it away');
    }],
    ['reset-puts-every-control-back-where-it-opened', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.enzymePresent === false && x.offered === 'none', 5_000);
      expect(d.enzymePresent === false && d.offered === 'none' && d.transitionShown === false,
        `Reset left ${JSON.stringify({ enzymePresent: d.enzymePresent, offered: d.offered, transitionShown: d.transitionShown })}`);
      expect(d.startedFrom === 'reactant' && d.temperatureC === 37 && d.enzymeIntact === 1,
        `Reset left ${JSON.stringify({ startedFrom: d.startedFrom, temperatureC: d.temperatureC, enzymeIntact: d.enzymeIntact })}`);
      expect(d.activationKj === 68 && d.deltaGKj === -12, `Reset left the landscape at ${JSON.stringify({ activationKj: d.activationKj, deltaGKj: d.deltaGKj })}`);
      // With no enzyme the bare reaction converts 0.035 molecules a second out of a hundred, so the
      // tallies still round to nothing for a quarter of a minute after the clock restarts.
      expect(d.converted === 0 && d.reverted === 0, `Reset left the tallies at ${d.converted}/${d.reverted}`);
    }],
  ],

  'enzyme-kinetics': [
    ['the-graph-starts-empty', async (h) => {
      const d = await h.describe();
      expect(d.plotted === 0, `the graph must start empty, because the reader draws it: ${d.plotted} points`);
      expect(d.preset === null && d.inhibitor === 'none', `it should open on the plain enzyme with no inhibitor: ${JSON.stringify({ preset: d.preset, inhibitor: d.inhibitor })}`);
      expect(d.km === 6 && d.enzymeUnits === 1, `opening constants: ${JSON.stringify({ km: d.km, enzymeUnits: d.enzymeUnits })}`);
    }],
    ['sweeping-the-substrate-draws-the-curve', async (h) => {
      const sub = h.stage.locator('input[type=range]').nth(0);
      for (const v of [8, 20, 40, 80, 120, 160]) {
        await sub.fill(String(v));
        await atValue(h, sub, v);
        await until(h, (x) => Math.abs(x.substrateMM - v / 4) < 1e-6, 5_000);
      }
      const d = await h.describe();
      expect(d.plotted >= 6, `six concentrations swept should plot six points: ${d.plotted}`);
      expect(Math.abs(d.substrateMM - 40) < 1e-6, `the slider should be at the top: ${d.substrateMM}`);
      expect(d.occupancy > 0.85, `at 40 mmol/L against a Km of 6 most sites are busy: ${d.occupancy}`);
      expect(d.rate > d.apparentVmax * 0.85, `and the rate should be near the ceiling: ${d.rate} against ${d.apparentVmax}`);
    }],
    ['more-enzyme-moves-the-ceiling-and-leaves-the-half-way-point-alone', async (h) => {
      const before = await h.describe();
      const enz = h.stage.locator('input[type=range]').nth(1);
      await enz.fill('12');
      await atValue(h, enz, 12);
      const d = await until(h, (x) => x.enzymeUnits === 3, 5_000);
      expect(d.enzymeUnits === 3, `the enzyme slider did not take: ${JSON.stringify(d)}`);
      expect(d.km === before.km, `the Michaelis constant must not move with the amount of enzyme: ${before.km} -> ${d.km}`);
      expect(d.apparentKm === before.apparentKm, `nor the apparent one: ${before.apparentKm} -> ${d.apparentKm}`);
      expect(near(d.vmax, before.vmax * 3, 0.5), `three times the enzyme is three times the ceiling: ${before.vmax} -> ${d.vmax}`);
      expect(d.plotted === 0, `changing a constant is a different experiment, so the sweep is cleared: ${d.plotted}`);
    }],
    ['competitive-is-beaten-by-more-substrate-and-non-competitive-is-not', async (h) => {
      const plain = await h.describe();
      await h.button(/^Competitive/).click();
      const comp = await until(h, (x) => x.inhibitor === 'competitive' && x.inhibitorMM > 0, 5_000);
      expect(comp.apparentVmax === plain.vmax, `a competitive inhibitor leaves the ceiling alone: ${plain.vmax} -> ${comp.apparentVmax}`);
      expect(comp.apparentKm > plain.km, `and makes the half-way concentration appear to rise: ${plain.km} -> ${comp.apparentKm}`);
      expect(comp.relievedBySubstrate === true, 'more substrate should win the site back from a competitive inhibitor');
      await h.button(/^Non-competitive/).click();
      const non = await until(h, (x) => x.inhibitor === 'noncompetitive', 5_000);
      expect(non.apparentKm === plain.km, `a non-competitive inhibitor leaves the half-way concentration alone: ${plain.km} -> ${non.apparentKm}`);
      expect(non.apparentVmax < plain.vmax, `and brings the ceiling down: ${plain.vmax} -> ${non.apparentVmax}`);
      expect(non.relievedBySubstrate === false, 'more substrate cannot help against a non-competitive inhibitor');
    }],
    ['penicillin-takes-enzymes-out-for-good', async (h) => {
      await h.button(/^Penicillin/).click();
      const loaded = await until(h, (x) => x.preset === 'penicillin', 5_000);
      expect(loaded.inhibitor === 'irreversible', `the penicillin case should load an irreversible inhibitor: ${loaded.inhibitor}`);
      await ensureRunning(h);
      const eaten = await until(h, (x) => x.enzymesDestroyed >= 1, 40_000);
      expect(eaten.enzymesDestroyed >= 1, `it should start finishing enzyme molecules: ${eaten.enzymesDestroyed} at t=${eaten.t}`);
      expect(eaten.apparentVmax < eaten.vmax, `and the ceiling should fall with the survivors: ${eaten.apparentVmax} against ${eaten.vmax}`);
      expect(eaten.relievedBySubstrate === false, 'no amount of substrate revives a finished enzyme');
      await h.button(/^No inhibitor/).click();
      const after = await until(h, (x) => x.inhibitor === 'none', 5_000);
      expect(after.enzymesDestroyed >= eaten.enzymesDestroyed, `taking the inhibitor away must not bring the enzyme back: ${eaten.enzymesDestroyed} -> ${after.enzymesDestroyed}`);
    }],
    ['hexokinase-is-saturated-at-blood-glucose-and-glucokinase-is-not', async (h) => {
      await h.button(/^Hexokinase/).click();
      const hexo = await until(h, (x) => x.preset === 'hexokinase', 5_000);
      expect(hexo.km === 0.1, `hexokinase's Km is a tenth of a millimole per litre: ${hexo.km}`);
      const sub = h.stage.locator('input[type=range]').nth(0);
      await sub.fill('20');
      await atValue(h, sub, 20);
      const atBlood = await until(h, (x) => Math.abs(x.substrateMM - 5) < 1e-6, 5_000);
      expect(atBlood.occupancy > 0.97, `at blood glucose hexokinase is saturated: ${atBlood.occupancy}`);
      await h.button(/^Glucokinase/).click();
      const gluco = await until(h, (x) => x.preset === 'glucokinase', 5_000);
      expect(gluco.km === 10, `glucokinase's Km is ten: ${gluco.km}`);
      expect(gluco.occupancy < 0.5, `at the same blood glucose the liver's version is not: ${gluco.occupancy}`);
    }],
    ['heat-unfolds-the-lane', async (h) => {
      const temp = h.stage.locator('input[type=range]').nth(3);
      await temp.fill('55');
      await atValue(h, temp, 55);
      const d = await until(h, (x) => x.temperatureC === 55, 5_000);
      expect(d.temperatureC === 55, `the temperature slider did not take: ${JSON.stringify(d)}`);
      expect(d.denatured === true, `55 °C should unfold the enzymes: ${JSON.stringify({ denatured: d.denatured, turnoverPerSecond: d.turnoverPerSecond })}`);
      expect(d.rate < 1, `and the rate should fall off a cliff: ${d.rate}`);
    }],
    ['reset-puts-every-control-back-where-it-opened', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.preset === null && x.inhibitor === 'none', 5_000);
      expect(d.preset === null && d.inhibitor === 'none' && d.inhibitorMM === 0, `Reset left ${JSON.stringify({ preset: d.preset, inhibitor: d.inhibitor, inhibitorMM: d.inhibitorMM })}`);
      expect(d.enzymeUnits === 1 && d.km === 6 && d.substrateMM === 1, `Reset left ${JSON.stringify({ enzymeUnits: d.enzymeUnits, km: d.km, substrateMM: d.substrateMM })}`);
      expect(d.temperatureC === 37 && d.ph === 7 && d.denatured === false, `Reset left ${JSON.stringify({ temperatureC: d.temperatureC, ph: d.ph, denatured: d.denatured })}`);
      expect(d.plotted === 0 && d.enzymesDestroyed === 0, `Reset left ${JSON.stringify({ plotted: d.plotted, enzymesDestroyed: d.enzymesDestroyed })}`);
    }],
  ],

  atp3d: [
    // Three steps rather than two, so out/drive/ holds a frame of the SPLIT molecule and a frame of the
    // two overlays over it. A recipe that hydrolyses and rejoins inside one step proves the same two
    // things and leaves a person nothing to look at but the state it started in.
    ['hydrolyse-takes-the-outer-phosphate-off', async (h) => {
      expect((await h.describe()).hydrolysed === false, 'it should open intact');
      await h.button(/^Hydrolyse/).click();
      expect((await until(h, (x) => x.hydrolysed === true, 5_000)).hydrolysed === true, 'Hydrolyse did not take the phosphate off');
      await h.page.waitForTimeout(900); // the split is animated; this is the frame a person looks at
    }],
    ['the-two-overlays-over-the-split-molecule', async (h) => {
      await h.button(/^Repulsion/).click();
      await h.button(/^Hydration/).click();
      const d = await until(h, (x) => x.repulsionShown && x.hydrationShown, 5_000);
      expect(d.repulsionShown === true && d.hydrationShown === true, `the overlays did not both come on: ${JSON.stringify({ r: d.repulsionShown, h: d.hydrationShown })}`);
      expect(d.hydrolysed === true, 'and the molecule should still be split under them');
    }],
    ['rejoin-puts-it-back', async (h) => {
      await h.button(/^Rejoin/).click();
      expect((await until(h, (x) => x.hydrolysed === false, 5_000)).hydrolysed === false, 'Rejoin did not put it back');
      await h.page.waitForTimeout(900);
    }],
    ['the-ledger-adds-up-and-the-bond-row-is-positive', async (h) => {
      // The figure's whole claim reduced to three numbers: breaking the bond COSTS, the four things that
      // pay for it are negative, and their sum is the measured standard value.
      const row = h.stage.getByRole('slider', { name: 'Row' });
      await row.fill('1');
      await atValue(h, row, 1);
      const d = await until(h, (x) => x.ledgerRow === 'bond', 5_000);
      expect(d.ledgerRow === 'bond', `the row slider did not select the bond row: ${JSON.stringify(d.ledgerRow)}`);
      expect(d.ledgerOpen === true, 'selecting a row should open the ledger');
      expect(d.bondBreakingKj > 0, `breaking the bond must cost: ${d.bondBreakingKj}`);
      for (const k of ['repulsionReliefKj', 'resonanceKj', 'hydrationKj', 'entropyKj']) {
        expect(d[k] < 0, `${k} must be what pays for it, so negative: ${d[k]}`);
      }
      const sum = d.bondBreakingKj + d.repulsionReliefKj + d.resonanceKj + d.hydrationKj + d.entropyKj;
      expect(near(sum, d.ledgerTotalKj, 0.05), `the five lines sum to ${sum.toFixed(2)} and the total says ${d.ledgerTotalKj}`);
      expect(near(d.ledgerTotalKj, d.deltaGStandardKj, 0.05), `the ledger total ${d.ledgerTotalKj} must equal the standard value ${d.deltaGStandardKj}`);
    }],
    ['one-mole-per-litre-is-what-standard-means', async (h) => {
      const before = await h.describe();
      expect(before.deltaGKj < before.deltaGStandardKj - 15, `at a cell's concentrations ATP should be worth well more than the table: ${before.deltaGKj}`);
      for (const name of ['ATP', 'ADP', 'Pᵢ']) {
        const slider = h.stage.getByRole('slider', { name });
        await slider.fill('1000');
        await atValue(h, slider, 1000);
      }
      const d = await until(h, (x) => Math.abs(x.deltaGKj - x.deltaGStandardKj) < 0.6, 8_000);
      expect(near(d.deltaGKj, d.deltaGStandardKj, 0.6), `with all three at one mole per litre the true value should be the standard one: ${d.deltaGKj} against ${d.deltaGStandardKj}`);
    }],
    ['drag-orbits-and-the-view-has-a-distance', async (h) => {
      const before = (await h.describe()).view;
      expect(before && before.distance > 0, `describe() must report a non-zero view distance: ${JSON.stringify(before)}`);
      const box = await h.stage.boundingBox();
      await h.drag({ x: box.x + box.width * 0.3, y: box.y + box.height * 0.4 }, { x: box.x + box.width * 0.5, y: box.y + box.height * 0.4 });
      await h.page.waitForTimeout(700);
      const after = (await h.describe()).view;
      expect(!near(before.theta, after.theta, 0.01), `dragging did not orbit: theta ${before.theta} -> ${after.theta}`);
    }],
    ['the-ladder-works-out-the-transfer-itself', async (h) => {
      await h.button(/^Ladder/).click();
      expect((await until(h, (x) => x.scene === 'ladder', 5_000)).scene === 'ladder', 'the ladder scene did not open');
      // What the rail and the table beside it call the quantity. §5.3's column is headed "ΔG°′ of
      // hydrolysis (kJ/mol)"; the rail said "RELEASED ON HYDROLYSIS" over a column of negative numbers,
      // and the table "It releases −61.9 kJ/mol", until 2026-09-23.
      const rail = (await ladderTexts(h)).map((t) => t.s);
      expect(rail.includes('ΔG°′ of hydrolysis, kJ/mol'), `the rail should be headed "ΔG°′ of hydrolysis, kJ/mol", as §5.3's table heads its column; its first line reads ${JSON.stringify(rail[0])}`);
      const beside = await h.stage.locator('.tb-pane-ledger text').allTextContents();
      expect(beside.filter((s) => s === 'Its ΔG°′ of hydrolysis').length === 2 && !beside.some((s) => /releases/i.test(s)), `the table beside the rail should name the quantity, "Its ΔG°′ of hydrolysis", once for the donor and once for the target; it reads ${JSON.stringify(beside)}`);
      const donor = h.stage.getByRole('slider', { name: 'Donor' });
      // Home and End rather than a number: the range holds a HEIGHT on the rail, so End is the top rung.
      // Home first, because the donor opens on the top rung, and an End pressed there would pass by
      // standing still.
      await donor.press('Home');
      let d = await until(h, (x) => x.donor === 'g6p', 5_000);
      expect(d.donor === 'g6p', `Home on the Donor slider should reach the bottom rung, glucose 6-phosphate; it reached ${d.donor}`);
      expect(d.transferPossible === false, `glucose 6-phosphate must not be able to phosphorylate ADP: ${JSON.stringify({ donor: d.donor, rung: d.rungKj })}`);
      expect(d.rungKj > -30.5, `it sits below ATP on the ladder, so it releases less: ${d.rungKj}`);
      // The verdict, as the rail prints it. §5.3: a compound above ATP can "hand a phosphate to ADP and
      // so make ATP". It printed "can phosphorylate ATP" until 2026-09-23: the phosphate put onto the
      // thing it makes. The class first, then the sentence: no rung is ever the thing phosphorylated,
      // because a rung is what a transfer MAKES. The pattern matches all eight names — ATP, the two long
      // ones and the five that end "phosphate" — and none of the molecules that really take a phosphate.
      // The sentences are matched case and all, so a rung's name set mid-sentence is checked too.
      const verdictSays = async (sentence, text) => {
        const said = (await ladderTexts(h)).map((t) => t.s).join(' ');
        const onto = /phosphorylate (?:ATP|phosphoenolpyruvate|1,3-bisphosphoglycerate|\S+ (?:\d-)?phosphate)\b/i.exec(said);
        expect(!onto, `the rail says "${onto?.[0]}": a rung is what a transfer makes, not what it phosphorylates; the rail's text ends ${JSON.stringify(said.slice(-120))}`);
        expect(sentence.test(said), `the verdict should say ${text}; the rail's text ends ${JSON.stringify(said.slice(-120))}`);
      };
      await verdictSays(/Glucose 6-phosphate cannot phosphorylate ADP to make ATP under standard conditions: \+16\.7 kJ\/mol, uphill\./, '"Glucose 6-phosphate cannot phosphorylate ADP to make ATP under standard conditions: +16.7 kJ/mol, uphill."');
      // Every "cannot" on the stage names the standard conditions it holds in: the verdict under the rail,
      // and the rule in the table beside it. The rule said it flatly until 2026-09-23, and took back what
      // the verdict's clause says: ATP phosphorylating creatine, a rung above it, is what resting muscle does.
      const stage = [...(await ladderTexts(h)).map((t) => t.s), ...(await h.stage.locator('.tb-pane-ledger text').allTextContents())].join(' ');
      const flat = stage.split(/(?<=\.)\s+/).filter((s) => /\bcannot\b/.test(s) && !/under standard conditions/i.test(s));
      expect(flat.length === 0, `every "cannot" on the stage should say "under standard conditions"; these do not: ${JSON.stringify(flat)}`);
      await donor.press('End');
      d = await until(h, (x) => x.donor === 'pep', 5_000);
      expect(d.donor === 'pep', `End on the Donor slider should reach the top rung, phosphoenolpyruvate; it reached ${d.donor}`);
      expect(d.transferPossible === true, `phosphoenolpyruvate should be able to phosphorylate ADP: ${JSON.stringify({ donor: d.donor, target: d.target, rung: d.rungKj })}`);
      await verdictSays(/Phosphoenolpyruvate can phosphorylate ADP and make ATP: −31\.4 kJ\/mol\./, '"Phosphoenolpyruvate can phosphorylate ADP and make ATP: −31.4 kJ/mol."');
      // And a target that is not ATP, where the phosphate goes onto a sugar and the rung's name is set in
      // the middle of the sentence.
      const target = h.stage.getByRole('slider', { name: 'Target' });
      await target.press('Home');
      d = await until(h, (x) => x.target === 'g6p', 5_000);
      expect(d.target === 'g6p', `Home on the Target slider should reach the bottom rung, glucose 6-phosphate; it reached ${d.target}`);
      await verdictSays(/Phosphoenolpyruvate can phosphorylate glucose and make glucose 6-phosphate: −48\.1 kJ\/mol\./, '"Phosphoenolpyruvate can phosphorylate glucose and make glucose 6-phosphate: −48.1 kJ/mol."');
    }],
    ['the-rail-runs-the-way-up-the-chapter-prints-it', async (h) => {
      // §5.3's table, top to bottom, is the rail top to bottom: every compound it lists is drawn at the
      // number it gives, each one lower down than the one before. And all eight rung figures fall from
      // the most negative at the top. The rail ran the other way until 2026-09-17, drawn by the same
      // numbers, and no gate could see it: describe() reports ids, which do not move when the rail does.
      const table = chapterLadder();
      const texts = await ladderTexts(h);
      const figures = texts.filter((t) => t.cls.includes('at-num')).sort((a, b) => a.y - b.y);
      const values = figures.map((t) => Number(t.s.replace('−', '-')));
      expect(figures.length === 8, `the rail should draw eight rung figures; it drew ${figures.length}`);
      expect(values.every((v, i) => i === 0 || v > values[i - 1]), `from the top of the rail down, the rung figures read ${values.join(', ')}; §5.3's table runs from the most negative at the top`);
      let above = null;
      for (const row of table) {
        const name = texts.find((t) => t.s === row.name && !t.cls.includes('at-num'));
        expect(name, `§5.3's table lists ${row.name}, and the rail draws no rung with that name`);
        const nearest = figures.reduce((best, t) => (Math.abs(t.y - name.y) < Math.abs(best.y - name.y) ? t : best));
        const drawn = Number(nearest.s.replace('−', '-'));
        expect(Math.abs(drawn - row.kj) < 0.05, `§5.3's table gives ${row.name} ${row.kj} kJ/mol, and the rail draws it at ${drawn}`);
        expect(!above || name.y > above.y, `§5.3's table puts ${above?.name} above ${row.name}, and the rail draws ${row.name} at y=${name.y}, above ${above?.name} at y=${above?.y}: it runs the other way up`);
        above = { name: row.name, y: name.y };
      }
    }],
    ['up-on-the-controls-is-up-on-the-rail', async (h) => {
      // A control that says up moves its marker UP THE RAIL AS DRAWN, toward phosphoenolpyruvate, and
      // down moves it down. Until 2026-09-23 the Donor and Target ranges counted rungs from the top, so
      // ArrowUp and a button a screen reader called "Donor, step up" both moved the marker one rung down.
      // Read off the drawing, never off the range's number: which rung a number means is what is tested.
      const pairs = [['Donor', 'donor'], ['Target', 'target']];
      // Both markers in the middle of the rail and apart, so either direction has a rung to go to.
      for (const [name, value] of [['Donor', 3], ['Target', 1]]) {
        const slider = h.stage.getByRole('slider', { name });
        await slider.fill(String(value));
        await atValue(h, slider, value);
      }
      // Every press: wait for the figure to report the change, check that each marker word is on its own
      // compound's rung, and say which rung the pressed marker is now drawn on.
      const press = async (word, act) => {
        const before = (await h.describe())[word];
        await act();
        const now = await until(h, (x) => x[word] !== before, 5_000);
        for (const [marker, kj, id] of [['donor', now.rungKj, now.donor], ['target', now.targetKj, now.target]]) {
          const fig = await figureAtWord(h, marker);
          expect(fig === kj, `the word "${marker}" should sit on the ${marker}'s own rung, ${id} at ${kj}; it sits on the rung printed ${fig}`);
        }
        return rungOfWord(h, word);
      };
      for (const [name, word] of pairs) {
        const slider = h.stage.getByRole('slider', { name });
        const from = await rungOfWord(h, word);
        expect(from > 0 && from < 7, `the ${word} should start away from both ends of the rail; it is on rung ${from + 1} from the top`);
        const up = await press(word, () => slider.press('ArrowUp'));
        expect(up === from - 1, `ArrowUp on the ${name} slider should move the ${word} one rung UP the rail as drawn, from rung ${from + 1} to rung ${from} counting from the top; it went to rung ${up + 1}`);
        const back = await press(word, () => slider.press('ArrowDown'));
        expect(back === from, `ArrowDown on the ${name} slider should move the ${word} back down to rung ${from + 1}; it went to rung ${back + 1}`);
      }
      // The step buttons exist only at a phone's width, so they are pressed there, with the mouse.
      await h.page.setViewportSize({ width: 390, height: 844 });
      try {
        const d = await until(h, (x) => x.layout === 'narrow', 10_000);
        expect(d.layout === 'narrow', `a 390 px viewport should put the figure in its narrow layout: ${d.layout}`);
        for (const [name, word] of pairs) {
          const upButton = h.stage.getByRole('button', { name: `${name}, one rung up` });
          const downButton = h.stage.getByRole('button', { name: `${name}, one rung down` });
          const shows = [(await upButton.textContent()).trim(), (await downButton.textContent()).trim()];
          expect(shows[0] === '↑' && shows[1] === '↓', `"${name}, one rung up" should show ↑ and "${name}, one rung down" ↓; they show ${JSON.stringify(shows)}`);
          const from = await rungOfWord(h, word);
          expect(from > 0 && from < 7, `at 390 px the ${word} should start away from both ends of the rail; it is on rung ${from + 1} from the top`);
          const up = await press(word, () => upButton.click());
          expect(up === from - 1, `the button "${name}, one rung up" should move the ${word} one rung up the rail as drawn, from rung ${from + 1} to rung ${from} counting from the top; it went to rung ${up + 1}`);
          const back = await press(word, () => downButton.click());
          expect(back === from, `the button "${name}, one rung down" should move the ${word} back down to rung ${from + 1}; it went to rung ${back + 1}`);
        }
        // The harness photographs a step after it returns, when the viewport is back at 1000x640, so the
        // phone's state is photographed here, where a person can look at it.
        await h.stage.screenshot({ path: `${OUT}/atp3d-up-on-the-controls-is-up-on-the-rail-390px.png`, type: 'png' });
      } finally {
        await h.page.setViewportSize({ width: 1000, height: 640 });
        await until(h, (x) => x.layout === 'wide', 10_000);
      }
    }],
    ['the-verdict-is-drawn-whole-however-long', async (h) => {
      // A verdict that wraps to three lines at a phone's width loses nothing. The narrow layout used to
      // keep two lines of it and drop the rest without a word: at a 272 px stage the "uphill." was gone,
      // and the standard-conditions clause made the longest verdicts wrap to three at 390 px. This sets the
      // longest one there is — fructose 6-phosphate to 1,3-bisphosphoglycerate — at 390 px and reads the
      // lines under the rail. It also checks that the verdict really took three lines, so a later layout
      // that fits it on two turns this red rather than letting it pass without testing anything.
      for (const [name, value] of [['Donor', 1], ['Target', 6]]) {
        const slider = h.stage.getByRole('slider', { name });
        await slider.fill(String(value));
        await atValue(h, slider, value);
      }
      const set = await until(h, (x) => x.donor === 'f6p' && x.target === 'bpg', 5_000);
      expect(set.donor === 'f6p' && set.target === 'bpg', `heights 1 and 6 should put the donor on fructose 6-phosphate and the target on 1,3-bisphosphoglycerate; they put them on ${set.donor} and ${set.target}`);
      await h.page.setViewportSize({ width: 390, height: 844 });
      try {
        const d = await until(h, (x) => x.layout === 'narrow', 10_000);
        expect(d.layout === 'narrow', `a 390 px viewport should put the figure in its narrow layout: ${d.layout}`);
        // Photographed before anything is asserted, so a failure leaves the frame that shows it.
        await h.stage.screenshot({ path: `${OUT}/atp3d-the-verdict-is-drawn-whole-however-long-390px.png`, type: 'png' });
        const texts = await ladderTexts(h);
        const lowest = Math.max(...texts.filter((t) => t.cls.includes('at-num')).map((t) => t.y));
        const foot = texts.filter((t) => t.y > lowest && !t.cls.includes('at-num')).sort((a, b) => a.y - b.y).map((t) => t.s);
        const end = foot.findIndex((s) => s.endsWith('uphill.'));
        const verdict = foot.slice(0, end + 1);
        const whole = 'Fructose 6-phosphate cannot phosphorylate 3-phosphoglycerate to make 1,3-bisphosphoglycerate under standard conditions: +33.5 kJ/mol, uphill.';
        expect(verdict.join(' ') === whole, `under the rail at 390 px the verdict should read ${JSON.stringify(whole)}; the lines there read ${JSON.stringify(foot)}`);
        expect(verdict.length >= 3, `the verdict took ${verdict.length} line(s) at 390 px, so this step no longer tests one that wraps to three; choose a longer one, or a narrower width`);
      } finally {
        await h.page.setViewportSize({ width: 1000, height: 640 });
        await until(h, (x) => x.layout === 'wide', 10_000);
      }
    }],
    ['reset-returns-it-to-the-state-it-mounted-in', async (h) => {
      // Not /^Reset/: this figure has a `Reset view` as well, and a control is found by its accessible
      // name, which is the long label and then what it does.
      await h.button(/^Reset, put the whole/).click();
      const d = await until(h, (x) => x.scene === 'molecule' && x.hydrolysed === false, 5_000);
      expect(d.scene === 'molecule' && d.hydrolysed === false, `Reset left ${JSON.stringify({ scene: d.scene, hydrolysed: d.hydrolysed })}`);
      expect(d.repulsionShown === false && d.hydrationShown === false && d.ledgerOpen === true && d.ledgerRow === null, `Reset left ${JSON.stringify({ r: d.repulsionShown, hy: d.hydrationShown, open: d.ledgerOpen, row: d.ledgerRow })}`);
      expect(d.atpMM === 5 && d.adpMM === 0.5 && d.phosphateMM === 5, `Reset left ${JSON.stringify({ atp: d.atpMM, adp: d.adpMM, pi: d.phosphateMM })}`);
      expect(near(d.deltaGKj, -50.1, 0.2), `Reset should put ATP back at a cell's value: ${d.deltaGKj}`);
      expect(d.donor === 'pep' && d.target === 'atp', `Reset left the ladder at ${d.donor} -> ${d.target}`);
      expect(d.playing === false && d.t < 1, `Reset should stop the turn and put the clock back: ${JSON.stringify({ playing: d.playing, t: d.t })}`);
      // The distance is fitted to the pane's own shape — square at desktop width, a shallow strip on a
      // phone — so what Reset restores is the angle and a distance in the zoom range, not one number.
      expect(near(d.view.theta, 0.34, 0.02) && near(d.view.phi, 1.3, 0.02), `Reset should put the camera back: ${JSON.stringify(d.view)}`);
      expect(d.view.distance > 11 && d.view.distance < 60, `and leave it framed: ${d.view.distance}`);
    }],
  ],

  'coupling-bench': [
    ['uncoupled-spends-the-source-and-does-nothing', async (h) => {
      const start = await h.describe();
      expect(start.coupled === false && start.playing === false, 'it should open uncoupled and not running, so the reader\'s first press produces the failure');
      expect(start.intermediate === null, 'nothing is coupled, so there is no intermediate');
      for (let i = 0; i < 3; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.sourceSpent >= 3, 5_000);
      expect(d.sourceSpent === 3, `three transactions should spend three ATP: ${d.sourceSpent}`);
      expect(d.jobsDone === 0, `and get no job done: ${d.jobsDone}`);
      expect(d.intermediate === null, `and form no intermediate: ${JSON.stringify(d.intermediate)}`);
      expect(near(d.heatKj, 91.5, 0.2), `every kilojoule should have arrived as heat: ${d.heatKj}`);
    }],
    ['coupling-is-the-only-difference-and-the-same-ATP-is-spent', async (h) => {
      await h.button(/^Couple/).click();
      let d = await until(h, (x) => x.coupled === true, 5_000);
      expect(d.coupled === true, 'the couple control did not take');
      expect(typeof d.intermediate === 'string' && d.intermediate.length > 0, `coupled, an intermediate must be named: ${JSON.stringify(d.intermediate)}`);
      expect(d.proceeds === true, `glutamine on ATP sums to ${d.sumKj}, which should proceed`);
      for (let i = 0; i < 3; i += 1) await h.button(/^Step/).click();
      d = await until(h, (x) => x.sourceSpent >= 6, 5_000);
      expect(d.sourceSpent === 6, `three more transactions should spend three more ATP — the same rate as uncoupled: ${d.sourceSpent}`);
      expect(d.jobsDone === 3, `and this time get the job done three times: ${d.jobsDone}`);
      expect(near(d.heatKj, 91.5, 0.2), `and produce no further heat: ${d.heatKj}`);
    }],
    ['a-sum-that-is-not-negative-does-not-run', async (h) => {
      await h.button(/^Sodium/).click();
      await h.button(/^Gradient/).click();
      const before = await until(h, (x) => x.job === 'sodium' && x.source === 'sodium-gradient', 5_000);
      expect(before.sumKj > 0, `three sodium out against one falling in should sum positive: ${before.sumKj}`);
      expect(before.proceeds === false, 'a positive sum must not proceed even when coupled');
      const spent = before.sourceSpent;
      await h.button(/^Step/).click();
      await h.page.waitForTimeout(250);
      const after = await h.describe();
      expect(after.sourceSpent === spent, `nothing should be spent when the coupled pair cannot run: ${spent} -> ${after.sourceSpent}`);
    }],
    ['no-source-means-no-intermediate-however-it-is-coupled', async (h) => {
      await h.button(/^None/).click();
      const d = await until(h, (x) => x.source === 'none', 5_000);
      expect(d.coupled === true, 'the couple switch should still be on');
      expect(d.intermediate === null, `with no source there is nothing to couple to, so intermediate must be null: ${JSON.stringify(d.intermediate)}`);
      expect(d.proceeds === false, 'and nothing proceeds');
    }],
    ['the-pump-cycle-and-the-point-where-it-reverses', async (h) => {
      await h.button(/^Pump/).click();
      let d = await until(h, (x) => x.scene === 'pump', 5_000);
      expect(near(d.cycleCostKj, 44.4, 0.3), `chapter 4's values should cost about 44.4 a cycle: ${d.cycleCostKj}`);
      expect(near(d.naCostKj, 39.6, 0.3) && near(d.kCostKj, 4.8, 0.3), `the two rows should be 39.6 and 4.8: ${JSON.stringify({ na: d.naCostKj, k: d.kCostKj })}`);
      expect(d.direction === 'pumping' && d.marginKj < 0, `it should still be pumping: ${JSON.stringify({ dir: d.direction, margin: d.marginKj })}`);
      const out = h.stage.getByRole('slider', { name: /Na.* outside/ });
      const inside = h.stage.getByRole('slider', { name: /Na.* inside/ });
      await out.fill('220');
      await atValue(h, out, 220);
      await inside.fill('1');
      await atValue(h, inside, 1);
      d = await until(h, (x) => x.direction === 'reversed', 8_000);
      expect(d.direction === 'reversed', `a steep enough gradient must reverse the pump: ${JSON.stringify({ dir: d.direction, margin: d.marginKj, cost: d.cycleCostKj })}`);
      expect(d.marginKj > 0, `and the margin must be positive when it does: ${d.marginKj}`);
    }],
    ['reset-returns-it-to-the-state-it-mounted-in', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.scene === 'bench' && x.jobsDone === 0, 5_000);
      expect(d.scene === 'bench' && d.job === 'glutamine' && d.source === 'atp', `Reset left ${JSON.stringify({ scene: d.scene, job: d.job, source: d.source })}`);
      expect(d.coupled === false && d.intermediate === null && d.proceeds === false, `Reset left ${JSON.stringify({ coupled: d.coupled, intermediate: d.intermediate })}`);
      expect(d.jobsDone === 0 && d.sourceSpent === 0 && d.heatKj === 0, `Reset left ${JSON.stringify({ done: d.jobsDone, spent: d.sourceSpent, heat: d.heatKj })}`);
      expect(d.naInsideMM === 12 && d.naOutsideMM === 145 && d.potentialMv === -70, `Reset left ${JSON.stringify({ naIn: d.naInsideMM, naOut: d.naOutsideMM, mv: d.potentialMv })}`);
      expect(d.playing === false && d.t < 1, `Reset left ${JSON.stringify({ playing: d.playing, t: d.t })}`);
    }],
  ],

  'feedback-pathway': [
    ['it-opens-running-and-in-balance', async (h) => {
      const d = await h.describe();
      expect(d.playing === true, 'it should open running, in balance, at a moderate demand');
      expect(d.loopIntact === true && d.knockedOut === null, 'and with nothing cut and nothing knocked out');
      expect(d.firstEnzymeActivity > 0.2 && d.firstEnzymeActivity < 0.95, `the loop should be doing something at the opening demand: ${d.firstEnzymeActivity}`);
      expect(d.accumulatingAt === null, `nothing should be piling up in balance: ${JSON.stringify(d.accumulatingAt)}`);
      expect(d.runaway === false, 'and it should not be running away');
    }],
    ['demand-brings-the-first-enzyme-back-on', async (h) => {
      const before = await h.describe();
      const demand = h.stage.getByRole('slider', { name: 'Demand' });
      await demand.fill('2.5');
      await atValue(h, demand, 2.5);
      const d = await until(h, (x) => x.firstEnzymeActivity > before.firstEnzymeActivity + 0.15, 20_000);
      expect(d.firstEnzymeActivity > before.firstEnzymeActivity + 0.15, `raising the demand should lift the first enzyme: ${before.firstEnzymeActivity} -> ${d.firstEnzymeActivity}`);
      await demand.fill('1');
      await atValue(h, demand, 1);
    }],
    ['knocking-one-out-piles-up-the-pool-in-front-of-it', async (h) => {
      const knock = h.stage.getByRole('slider', { name: 'Knock out' });
      await knock.fill('3');
      await atValue(h, knock, 3);
      const d = await until(h, (x) => x.accumulatingAt === 3, 25_000);
      expect(d.knockedOut === 3, `the knockout control did not take: ${JSON.stringify(d.knockedOut)}`);
      expect(d.accumulatingAt === 3, `the pool in front of enzyme 3 should be the one piling up: ${JSON.stringify({ at: d.accumulatingAt, pools: d.intermediatesMM })}`);
      expect(d.intermediatesMM[2] > d.intermediatesMM[3] * 3, `and it should stand well above the one after it: ${JSON.stringify(d.intermediatesMM)}`);
      await knock.fill('0');
      await atValue(h, knock, 0);
    }],
    ['cutting-the-loop-is-the-only-way-to-a-runaway', async (h) => {
      const demand = h.stage.getByRole('slider', { name: 'Demand' });
      await demand.fill('0');
      await atValue(h, demand, 0);
      // With the loop intact and no demand at all the product still climbs, and `runaway` must stay
      // false: it is the CUT that makes a runaway, not a high product.
      const held = await until(h, (x) => x.productMM > 1.6, 25_000);
      expect(held.productMM > 1.6, `with no demand the product should climb: ${held.productMM}`);
      expect(held.runaway === false, `runaway must be unreachable while the loop is intact: ${JSON.stringify({ product: held.productMM, loop: held.loopIntact })}`);
      await h.button(/^Break the loop/).click();
      const d = await until(h, (x) => x.runaway === true, 25_000);
      expect(d.loopIntact === false, 'the loop control did not take');
      expect(d.runaway === true, `with the site mutated the pathway should run away: ${JSON.stringify({ product: d.productMM })}`);
      await h.button(/^Break the loop/).click();
      await demand.fill('1');
      await atValue(h, demand, 1);
    }],
    ['subunits-move-the-steepness-and-not-the-half-point', async (h) => {
      const before = await h.describe();
      expect(before.subunits === 4 && before.curveShape === 'sigmoid', `it should open on four subunits: ${JSON.stringify({ n: before.subunits, shape: before.curveShape })}`);
      expect(before.steepness > 3, `four subunits should be steep: ${before.steepness}`);
      await h.button(/^One subunit/).click();
      const d = await until(h, (x) => x.subunits === 1, 5_000);
      expect(d.curveShape === 'hyperbolic', `one subunit should give the ordinary bending curve: ${d.curveShape}`);
      expect(near(d.steepness, 1, 0.05), `and a Hill slope of about 1: ${d.steepness}`);
      expect(d.halfSaturationMM === before.halfSaturationMM, `the half-saturating concentration must not move with the subunit count: ${before.halfSaturationMM} -> ${d.halfSaturationMM}`);
      await h.button(/^Four subunits/).click();
      await until(h, (x) => x.subunits === 4, 5_000);
    }],
    ['the-covalent-switch-holds-until-the-phosphatase-acts', async (h) => {
      await h.button(/^Kinase/).click();
      let d = await until(h, (x) => x.phosphorylated === true, 10_000);
      expect(d.phosphorylated === true, 'the kinase did not throw the switch');
      expect(d.atpSpent >= 1, `throwing it should have cost an ATP: ${d.atpSpent}`);
      await h.button(/^Kinase/).click();
      // The claim is that the switch HOLDS with neither enzyme running; the held time is what says so,
      // and polling it is polling the figure rather than the wall clock.
      d = await until(h, (x) => x.switchHeldSeconds > 0.8, 10_000);
      expect(d.phosphorylated === true, 'the switch let go on its own with the kinase off');
      expect(d.switchHeldSeconds > 0.8, `it should report how long it has held: ${d.switchHeldSeconds}`);
      await h.button(/^Phosphatase/).click();
      d = await until(h, (x) => x.phosphorylated === false, 10_000);
      expect(d.phosphorylated === false, 'the phosphatase did not take it off');
      await h.button(/^Phosphatase/).click();
    }],
    ['the-narrow-layout-has-the-second-pane-behind-a-control', async (h) => {
      // The pane switch exists only at a phone's width, because at desktop width both panes are already
      // on the stage. A recipe that never changes the viewport would never drive it at all.
      await h.page.setViewportSize({ width: 420, height: 760 });
      let d = await until(h, (x) => x.layout === 'narrow', 10_000);
      expect(d.layout === 'narrow', `a 420 px viewport should put the figure in its narrow layout: ${d.layout}`);
      expect(d.pane === 'pathway', `and open on the pathway: ${d.pane}`);
      await h.button(/^Enzyme/).click();
      d = await until(h, (x) => x.pane === 'enzyme', 5_000);
      expect(d.pane === 'enzyme', `the narrow pane switch did not take: ${d.pane}`);
      await h.button(/^Pathway/).click();
      await until(h, (x) => x.pane === 'pathway', 5_000);
      await h.page.setViewportSize({ width: 1000, height: 640 });
      d = await until(h, (x) => x.layout === 'wide', 10_000);
      expect(d.layout === 'wide', `restoring the viewport should put it back: ${d.layout}`);
    }],
    ['reset-returns-it-to-the-state-it-mounted-in', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.knockedOut === null && x.loopIntact === true, 10_000);
      expect(d.loopIntact === true && d.knockedOut === null && d.productAddedMM === 0, `Reset left ${JSON.stringify({ loop: d.loopIntact, out: d.knockedOut, added: d.productAddedMM })}`);
      expect(d.subunits === 4 && d.curveShape === 'sigmoid', `Reset left ${JSON.stringify({ n: d.subunits, shape: d.curveShape })}`);
      expect(d.demand === 1, `Reset left the demand at ${d.demand}`);
      expect(d.phosphorylated === false && d.kinaseOn === false && d.phosphataseOn === false && d.atpSpent === 0, `Reset left ${JSON.stringify({ p: d.phosphorylated, k: d.kinaseOn, pa: d.phosphataseOn, atp: d.atpSpent })}`);
      expect(d.playing === true, 'it opens running, so Reset leaves it running');
      expect(d.t < 1, `Reset should put the clock back: ${d.t}`);
      expect(d.pane === 'pathway', `Reset left the pane on ${d.pane}`);
    }],
  ],

  'metabolic-map': [
    ['knocking-one-out-piles-up-the-compound-in-front-of-it', async (h) => {
      const start = await h.describe();
      expect(start.scene === 'map' && start.fuel === 'glucose' && start.knockedOut === null, 'it should open on the map with one fuel and nothing knocked out');
      expect(start.accumulating === null && start.drainedAway.length === 0, `and nothing blocked: ${JSON.stringify({ acc: start.accumulating, drained: start.drainedAway })}`);
      const knock = h.stage.getByRole('slider', { name: 'Knock out' });
      await knock.fill('2');
      await atValue(h, knock, 2);
      const d = await until(h, (x) => x.accumulating !== null, 10_000);
      expect(d.knockedOut === 'Glycolysis, lumped', `the knockout control did not take: ${JSON.stringify(d.knockedOut)}`);
      expect(d.accumulating === 'Glucose 6-phosphate', `the compound in front of the gap should pile up: ${JSON.stringify(d.accumulating)}`);
      expect(d.drainedAway.length >= 2, `and everything past it should drain away: ${JSON.stringify(d.drainedAway)}`);
      await knock.fill('0');
      await atValue(h, knock, 0);
    }],
    ['a-different-fuel-is-a-different-route-to-the-same-waist', async (h) => {
      await h.button(/^Fatty acid/).click();
      const d = await until(h, (x) => x.fuel === 'fatty-acid', 5_000);
      expect(d.route[0] === 'Fatty acid', `the route should start at the fuel: ${JSON.stringify(d.route)}`);
      expect(d.route[d.route.length - 1] === 'Citrate', `and end in the waist: ${JSON.stringify(d.route)}`);
      expect(d.waistCompounds === 5, `the waist should hold five shared intermediates: ${d.waistCompounds}`);
      expect(d.route.every((c) => typeof c === 'string' && c.length > 0), `every compound on the route must be named: ${JSON.stringify(d.route)}`);
      expect(d.knockedOut === null, 'changing the fuel should clear the knockout, because the routes are not the same length');
    }],
    ['the-two-directions-are-never-one-route', async (h) => {
      await h.button(/^Anabolic/).click();
      const d = await until(h, (x) => x.direction === 'anabolic', 5_000);
      expect(d.stepsThatDiffer > 0, `some step must differ between the two directions, or nothing could be regulated apart: ${d.stepsThatDiffer}`);
      await h.button(/^Catabolic/).click();
      await until(h, (x) => x.direction === 'catabolic', 5_000);
    }],
    ['the-same-fall-taken-two-ways', async (h) => {
      await h.button(/^Electrons/).click();
      let d = await until(h, (x) => x.scene === 'electrons', 5_000);
      expect(near(d.fallKj, 220, 1), `NADH to oxygen should be the 220 the prose quotes: ${d.fallKj}`);
      expect(near(d.capturedKj + d.heatKj, d.fallKj, 0.05), `captured and heat must sum to the whole fall: ${d.capturedKj} + ${d.heatKj} against ${d.fallKj}`);
      const oneDrop = d.capturedFraction;
      expect(oneDrop < 0.3, `dropped in one go, most of it should leave as heat: ${oneDrop}`);
      await h.button(/^In stages/).click();
      d = await until(h, (x) => x.dropMode === 'stepwise', 5_000);
      expect(d.capturedFraction > oneDrop * 2, `the same fall in parcels should catch far more: ${oneDrop} -> ${d.capturedFraction}`);
      expect(near(d.capturedKj + d.heatKj, d.fallKj, 0.05), `and the two halves must still sum to the fall: ${d.capturedKj} + ${d.heatKj}`);
      expect(near(d.fallKj, 220, 1), `while the fall itself has not changed: ${d.fallKj}`);
    }],
    ['a-full-pool-stops-the-oxidation-above-it', async (h) => {
      for (let i = 0; i < 5; i += 1) await h.button(/^Load a pair/).click();
      let d = await until(h, (x) => x.poolFull === true, 8_000);
      expect(d.carrierLoaded === d.carrierPool, `five presses on a pool of ${d.carrierPool} should fill it and no more: ${d.carrierLoaded}`);
      expect(d.poolFull === true, 'and the figure should say the pool is full');
      await h.button(/^Let them fall/).click();
      d = await until(h, (x) => x.poolFull === false, 8_000);
      expect(d.poolFull === false, 'spending one should make room again');
      expect(d.atpMade > 0, `and the drop should have made some ATP: ${d.atpMade}`);
    }],
    ['reset-returns-it-to-the-state-it-mounted-in', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.scene === 'map' && x.fuel === 'glucose', 5_000);
      expect(d.scene === 'map' && d.fuel === 'glucose' && d.overlay === 'matter' && d.direction === 'catabolic', `Reset left ${JSON.stringify({ scene: d.scene, fuel: d.fuel, overlay: d.overlay, dir: d.direction })}`);
      expect(d.knockedOut === null && d.accumulating === null && d.drainedAway.length === 0, `Reset left ${JSON.stringify({ out: d.knockedOut, acc: d.accumulating, drained: d.drainedAway })}`);
      expect(d.carrier === 'nad' && d.carrierLoaded === 0 && d.dropMode === 'one-step' && d.atpMade === 0, `Reset left ${JSON.stringify({ carrier: d.carrier, loaded: d.carrierLoaded, mode: d.dropMode, atp: d.atpMade })}`);
      expect(d.playing === false && d.t < 1, `Reset left ${JSON.stringify({ playing: d.playing, t: d.t })}`);
    }],
  ],

  // Figure 6.1. Every assertion is on a computed field — absorbedFraction, actionPoints, and actionAt
  // against absorbanceAt — never on the field a button sets. The numbers are §6.3's: about a third of the
  // green absorbed by the extracted pigment and about three-quarters by the whole leaf, at 550 nm.
  'pigment-spectra': [
    ['opens-on-chlorophyll-a-with-nothing-measured', async (h) => {
      const d = await h.describe();
      expect(d.scene === 'spectrum' && d.sample === 'extracted' && d.wavelengthNm === 550, `it should open on the spectrum, the extract and 550 nm: ${JSON.stringify({ scene: d.scene, sample: d.sample, nm: d.wavelengthNm })}`);
      expect(JSON.stringify(d.curvesShown) === '["chl-a"]', `only chlorophyll a's curve should be shown at first: ${JSON.stringify(d.curvesShown)}`);
      expect(d.actionPoints === 0, `the action chart starts empty, because the reader builds it: ${d.actionPoints} points`);
      expect(d.absorbedFraction >= 0.33 && d.absorbedFraction <= 0.36, `a leaf's worth of extracted pigment absorbs about a third of the green at 550 nm: ${d.absorbedFraction}`);
    }],
    ['the-whole-leaf-catches-three-quarters-of-the-green', async (h) => {
      const extract = (await h.describe()).absorbedFraction;
      await h.button(/^Whole leaf/).click();
      const leaf = await until(h, (x) => x.sample === 'leaf', 5_000);
      expect(leaf.sample === 'leaf', `Whole leaf did not take: ${leaf.sample}`);
      expect(leaf.absorbedFraction >= 0.72 && leaf.absorbedFraction <= 0.78, `a whole leaf absorbs roughly three-quarters of the green (§6.3): ${leaf.absorbedFraction}`);
      expect(leaf.absorbedFraction > extract + 0.3, `the scattering should fill the green trough most of the way in: ${extract} extracted against ${leaf.absorbedFraction} in the leaf`);
      expect(/green/.test(leaf.transmittedName), `what gets through a leaf is still green, because green is where it absorbs least: ${leaf.transmittedName}`);
      await h.button(/^Whole leaf/).click();
      const back = await until(h, (x) => x.sample === 'extracted', 5_000);
      expect(back.absorbedFraction === extract, `back to the extract, the number should come back with it: ${extract} -> ${back.absorbedFraction}`);
    }],
    ['measuring-plots-the-action-spectrum-point-by-point', async (h) => {
      const slider = h.stage.getByRole('slider', { name: 'Wavelength' });
      let plotted = 0;
      for (const nm of [450, 480, 640]) {
        await slider.fill(String(nm));
        await atValue(h, slider, nm);
        await until(h, (x) => x.wavelengthNm === nm, 5_000);
        await h.button(/^Measure here/).click();
        plotted += 1;
        const d = await until(h, (x) => x.actionPoints === plotted, 5_000);
        expect(d.actionPoints === plotted, `Measure here at ${nm} nm should plot point ${plotted}: ${d.actionPoints}`);
      }
      // The keyboard on the chart: one step right is 5 nm, and Enter measures there.
      await h.stage.locator('.tb-pane-chart svg').focus();
      await h.page.keyboard.press('ArrowRight');
      await until(h, (x) => x.wavelengthNm === 645, 5_000);
      await h.page.keyboard.press('Enter');
      const d = await until(h, (x) => x.actionPoints === 4, 5_000);
      expect(d.wavelengthNm === 645 && d.actionPoints === 4, `ArrowRight then Enter on the chart should measure at 645 nm: ${JSON.stringify({ nm: d.wavelengthNm, points: d.actionPoints })}`);
    }],
    ['chlorophyll-a-alone-leaves-a-gap-the-accessory-pigments-close', async (h) => {
      const slider = h.stage.getByRole('slider', { name: 'Wavelength' });
      await slider.fill('480');
      await atValue(h, slider, 480);
      const alone = await until(h, (x) => x.wavelengthNm === 480, 5_000);
      expect(alone.actionAt - alone.absorbanceAt > 0.25, `at 480 nm the alga makes oxygen chlorophyll a barely accounts for: action ${alone.actionAt}, chlorophyll a ${alone.absorbanceAt}`);
      await h.button(/^Chlorophyll b/).click();
      await h.button(/^Carotenoids/).click();
      const all = await until(h, (x) => x.curvesShown.length === 3, 5_000);
      expect(all.curvesShown.length === 3, `both accessory pigments should now be shown: ${JSON.stringify(all.curvesShown)}`);
      expect(Math.abs(all.actionAt - all.absorbanceAt) < 0.002, `with all three shown the absorption should account for the action: action ${all.actionAt}, absorption ${all.absorbanceAt}`);
    }],
    ['reset-clears-the-points', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.actionPoints === 0 && x.curvesShown.length === 1, 5_000);
      expect(d.actionPoints === 0 && d.wavelengthNm === 550 && d.sample === 'extracted', `Reset left ${JSON.stringify({ points: d.actionPoints, nm: d.wavelengthNm, sample: d.sample })}`);
      expect(JSON.stringify(d.curvesShown) === '["chl-a"]' && d.absorbedFraction >= 0.33 && d.absorbedFraction <= 0.36, `Reset left ${JSON.stringify({ shown: d.curvesShown, absorbed: d.absorbedFraction })}`);
    }],
  ],

  // Figure 6.3, chapter 6. Every step presses the figure's own Step, Run, Light, Label and Starch
  // buttons and its two supply sliders; what it asserts is what the model computed from those, never
  // what a control set: `stalledPhase`, `accumulating`, `activatedEnzymes`, the books at the end of a
  // turn, and `sixCarbonLeftEnzyme`, which is read after every single reaction of a turn.
  'calvin-cycle': [
    ['opens-paused-at-the-start-of-carboxylation', async (h) => {
      const d = await h.describe();
      expect(d.phase === 'carboxylation' && d.co2Fixed === 0 && d.turns === 0 && d.playing === false, `it should open paused at the start of carboxylation: ${JSON.stringify({ phase: d.phase, fixed: d.co2Fixed, turns: d.turns, playing: d.playing })}`);
      expect(d.labelledAtomAt === null && d.atpSupply === 1 && d.nadphSupply === 1, `with nothing labelled and both supplies full: ${JSON.stringify({ lab: d.labelledAtomAt, atp: d.atpSupply, nadph: d.nadphSupply })}`);
      expect(d.lightOn && d.stromaPh === 8 && d.magnesiumInStroma && d.thioredoxinReduced && d.rubiscoActivated && d.activatedEnzymes === 4, `lit, the stroma should be switched on: ${JSON.stringify({ ph: d.stromaPh, mg: d.magnesiumInStroma, trx: d.thioredoxinReduced, rub: d.rubiscoActivated, n: d.activatedEnzymes })}`);
      expect(d.stalledPhase === null && d.accumulating === null && d.sixCarbonLeftEnzyme === false && d.kjNeededPerGlucose === 2870, `nothing stalled at the opening: ${JSON.stringify({ stalled: d.stalledPhase, acc: d.accumulating, six: d.sixCarbonLeftEnzyme, kj: d.kjNeededPerGlucose })}`);
    }],
    ['five-and-one-make-six-and-the-six-never-leaves-the-enzyme', async (h) => {
      await h.button(/^Step/).click();
      let d = await until(h, (x) => x.co2Fixed === 1, 5_000);
      expect(d.co2Fixed === 1 && d.carbonsIn === 1 && d.phase === 'carboxylation', `one Step should fix one carbon dioxide onto an acceptor: ${JSON.stringify({ fixed: d.co2Fixed, in: d.carbonsIn, phase: d.phase })}`);
      expect(d.sixCarbonLeftEnzyme === false, 'the six-carbon compound is on the enzyme, not off it');
      expect(d.playing === false, 'a Step does not set the cycle running');
      const t = d.t;
      await h.button(/^Step/).click();
      d = await until(h, (x) => x.t > t, 5_000);
      expect(d.sixCarbonLeftEnzyme === false && d.co2Fixed === 1, `the cut should leave nothing six carbons long anywhere but the enzyme: ${JSON.stringify({ six: d.sixCarbonLeftEnzyme, fixed: d.co2Fixed })}`);
    }],
    ['one-turn-balances-the-books', async (h) => {
      // Step to the end of the first complete turn, reading describe() after every reaction: the
      // six-carbon compound must never be anywhere but the enzyme, at any point in the turn.
      let d = await h.describe();
      for (let i = 0; i < 60 && d.turns < 1; i += 1) {
        const before = d.t;
        await h.button(/^Step/).click();
        d = await until(h, (x) => x.t > before || x.turns >= 1, 5_000);
        expect(d.sixCarbonLeftEnzyme === false, `a six-carbon molecule left the enzyme at step ${i}, in ${d.phase}`);
      }
      expect(d.turns === 1, `the first turn should end within sixty steps: ${d.turns} turns, ${d.co2Fixed} fixed`);
      expect(d.carbonsIn === 3 && d.carbonsOut === 3 && d.g3pExported === 1, `the books should balance at the end of the turn, three in and three out: ${JSON.stringify({ in: d.carbonsIn, out: d.carbonsOut, g3p: d.g3pExported })}`);
      expect(d.atpSpent === 9 && d.nadphSpent === 6, `nine ATP and six NADPH per three CO2: ${d.atpSpent} and ${d.nadphSpent}`);
      expect(d.atpByPhase.carboxylation === 0 && d.nadphByPhase.carboxylation === 0, `rubisco needs neither: ${JSON.stringify({ atp: d.atpByPhase, nadph: d.nadphByPhase })}`);
      expect(d.atpByPhase.reduction === 6 && d.nadphByPhase.reduction === 6, `the reduction takes six and six: ${JSON.stringify({ atp: d.atpByPhase, nadph: d.nadphByPhase })}`);
      expect(d.atpByPhase.regeneration * 3 === d.atpSpent && d.nadphByPhase.regeneration === 0, `the regeneration holds a third of the ATP and no NADPH: ${JSON.stringify({ atp: d.atpByPhase, nadph: d.nadphByPhase })}`);
      expect(d.kjSpent === 9 * 50 + 6 * 220, `nine ATP at 50 and six NADPH at 220 are ${9 * 50 + 6 * 220} kJ: ${d.kjSpent}`);
      expect(d.sucrosePool === 1 && d.starchPool === 0 && d.exportTo === 'sucrose', `the G3P that left went to sucrose: ${JSON.stringify({ suc: d.sucrosePool, starch: d.starchPool, to: d.exportTo })}`);
    }],
    ['a-labelled-carbon-can-be-followed-round', async (h) => {
      await h.button(/^Label/).click();
      let d = await until(h, (x) => x.labelledAtomAt === 'carbon dioxide', 5_000);
      expect(d.labelledAtomAt === 'carbon dioxide', `Label should mark the next carbon dioxide: ${d.labelledAtomAt}`);
      const seen = new Set([d.labelledAtomAt]);
      for (let i = 0; i < 40 && !['RuBP', 'sucrose', 'starch'].includes(d.labelledAtomAt); i += 1) {
        const before = d.t;
        await h.button(/^Step/).click();
        d = await until(h, (x) => x.t > before, 5_000);
        seen.add(d.labelledAtomAt);
      }
      for (const place of ['six-carbon compound', '3-phosphoglycerate', 'G3P']) {
        expect(seen.has(place), `the labelled carbon should pass through ${place}; it was seen in ${[...seen].join(', ')}`);
      }
      expect(['RuBP', 'sucrose'].includes(d.labelledAtomAt), `it should end in the exported sugar or the rebuilt acceptor: ${d.labelledAtomAt}`);
    }],
    ['starving-atp-piles-up-3-phosphoglycerate', async (h) => {
      const atp = h.stage.getByRole('slider', { name: 'ATP supply' });
      await atp.fill('0');
      await atValue(h, atp, 0);
      let d = await until(h, (x) => x.atpSupply === 0, 5_000);
      expect(d.stalledPhase === 'reduction', `with no ATP the reduction should stall: ${d.stalledPhase}`);
      const fixed = d.co2Fixed;
      const regen = d.atpByPhase.regeneration;
      const t = d.t;
      await ensureRunning(h);
      // Poll the figure's own clock: rubisco carries on until the acceptor is used up.
      d = await until(h, (x) => x.accumulating === '3-phosphoglycerate' && x.t > t + 4, 30_000);
      await h.button(/^Pause/).click();
      d = await until(h, (x) => x.playing === false, 5_000);
      expect(d.accumulating === '3-phosphoglycerate', `3-phosphoglycerate should pile up behind the stall: ${d.accumulating}`);
      expect(d.co2Fixed > fixed, `rubisco needs no ATP, so carboxylation should carry on: ${fixed} -> ${d.co2Fixed}`);
      expect(d.atpByPhase.regeneration === regen, `with no ATP the regeneration stalls as well: its ATP went ${regen} -> ${d.atpByPhase.regeneration}`);
      await atp.fill('100');
      await atValue(h, atp, 100);
      d = await until(h, (x) => x.atpSupply === 1 && x.stalledPhase === null, 5_000);
      expect(d.stalledPhase === null && d.accumulating === null, `fed again, nothing should be stalled: ${JSON.stringify({ stalled: d.stalledPhase, acc: d.accumulating })}`);
    }],
    ['starving-nadph-from-the-opening-drains-all-three-acceptors', async (h) => {
      // From the opening, so the pile is this starvation's own and not the last one's.
      await h.button(/^Reset/).click();
      await until(h, (x) => x.co2Fixed === 0 && x.t === 0, 5_000);
      const nadph = h.stage.getByRole('slider', { name: 'NADPH supply' });
      await nadph.fill('0');
      await atValue(h, nadph, 0);
      let d = await until(h, (x) => x.nadphSupply === 0, 5_000);
      expect(d.stalledPhase === 'reduction', `with no NADPH the reduction should stall: ${d.stalledPhase}`);
      await ensureRunning(h);
      d = await until(h, (x) => x.co2Fixed === 3 && x.accumulating === '3-phosphoglycerate' && x.t > 4, 30_000);
      await h.button(/^Pause/).click();
      d = await until(h, (x) => x.playing === false, 5_000);
      expect(d.accumulating === '3-phosphoglycerate', `the phosphorylation lies far on the side of 3-phosphoglycerate, so that is what piles up with no NADPH too: ${d.accumulating}`);
      expect(d.co2Fixed === 3 && d.nadphSpent === 0, `rubisco carried on until all three acceptors were used, and not one NADPH was spent: ${JSON.stringify({ fixed: d.co2Fixed, nadph: d.nadphSpent })}`);
      expect(d.atpByPhase.reduction === 0, `nothing was phosphorylated that could not then be reduced: ${JSON.stringify(d.atpByPhase)}`);
      await nadph.fill('100');
      await atValue(h, nadph, 100);
      await until(h, (x) => x.nadphSupply === 1, 5_000);
    }],
    ['dark-with-both-supplies-full-it-barely-turns', async (h) => {
      // From the opening, so there are acceptors for a lit cycle to fix carbon onto.
      await h.button(/^Reset/).click();
      await until(h, (x) => x.co2Fixed === 0 && x.t === 0, 5_000);
      await h.button(/^Light/).click();
      let d = await until(h, (x) => x.lightOn === false, 5_000);
      expect(d.stromaPh === 7 && !d.magnesiumInStroma && !d.thioredoxinReduced, `dark, the stroma should be at pH 7 with no magnesium and thioredoxin oxidised: ${JSON.stringify({ ph: d.stromaPh, mg: d.magnesiumInStroma, trx: d.thioredoxinReduced })}`);
      expect(d.rubiscoActivated === false && d.activatedEnzymes === 0, `rubisco and thioredoxin's four should all be off: ${JSON.stringify({ rub: d.rubiscoActivated, n: d.activatedEnzymes })}`);
      expect(d.atpSupply === 1 && d.nadphSupply === 1 && d.stalledPhase === null, `both supplies are full by hand, so nothing is starved: ${JSON.stringify({ atp: d.atpSupply, nadph: d.nadphSupply, stalled: d.stalledPhase })}`);
      await ensureRunning(h);
      // The elapsed model time IS the measurement here: lit, eight seconds of the cycle fix about
      // three carbon dioxides; dark, at a fiftieth of the rate, at most the one already on the way.
      d = await until(h, (x) => x.t > 8, 30_000);
      expect(d.t > 8, `the clock should have run eight seconds: ${d.t}`);
      expect(d.co2Fixed <= 1, `dark, the cycle should barely turn even with ATP and NADPH supplied by hand: ${d.co2Fixed} fixed in ${d.t} s`);
      const t = d.t;
      await h.button(/^Light/).click();
      d = await until(h, (x) => x.lightOn === true && x.co2Fixed >= 3, 30_000);
      await h.button(/^Pause/).click();
      d = await until(h, (x) => x.playing === false, 5_000);
      expect(d.rubiscoActivated === true && d.activatedEnzymes === 4, `lit again, rubisco and all four should be back on: ${JSON.stringify({ rub: d.rubiscoActivated, n: d.activatedEnzymes })}`);
      expect(d.co2Fixed >= 3, `and the same cycle, lit, should turn: ${d.co2Fixed} fixed by ${d.t} s, having been dark until ${t} s`);
    }],
    ['export-to-starch-and-the-pool-grows', async (h) => {
      await h.button(/^Starch/).click();
      let d = await until(h, (x) => x.exportTo === 'starch', 5_000);
      const starch = d.starchPool;
      const exported = d.g3pExported;
      await ensureRunning(h);
      d = await until(h, (x) => x.g3pExported > exported, 40_000);
      await h.button(/^Pause/).click();
      d = await until(h, (x) => x.playing === false, 5_000);
      expect(d.starchPool > starch, `a G3P exported with Starch chosen should grow the starch pool: ${starch} -> ${d.starchPool}`);
      expect(d.carbonsOut === 3 * d.g3pExported, `three carbons leave with every G3P: ${d.carbonsOut} for ${d.g3pExported}`);
    }],
    ['reset-returns-it-to-the-state-it-mounted-in', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.co2Fixed === 0 && x.t === 0, 5_000);
      expect(d.co2Fixed === 0 && d.turns === 0 && d.atpSpent === 0 && d.nadphSpent === 0 && d.labelledAtomAt === null, `Reset left ${JSON.stringify({ fixed: d.co2Fixed, turns: d.turns, atp: d.atpSpent, nadph: d.nadphSpent, lab: d.labelledAtomAt })}`);
      expect(d.exportTo === 'sucrose' && d.sucrosePool === 0 && d.starchPool === 0 && d.lightOn && d.atpSupply === 1 && d.nadphSupply === 1, `Reset left ${JSON.stringify({ to: d.exportTo, suc: d.sucrosePool, starch: d.starchPool, light: d.lightOn, atp: d.atpSupply, nadph: d.nadphSupply })}`);
      expect(d.playing === false && d.phase === 'carboxylation', `Reset left ${JSON.stringify({ playing: d.playing, phase: d.phase })}`);
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
      await until(h, (x) => x.labels === !before, 5_000);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === before, 5_000);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      if (before) expect(await atLeast(h, h.stage.locator('.fig-label'), 6) > 5, 'fewer than six labels are on the stage with labels on');
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
      const d = await until(h, (x) => (typeof x.selected === 'string' && x.selected.length > 0), 5_000);
      expect(typeof d.selected === 'string' && d.selected.length > 0, `clicking the centre of the cut cell selected nothing: ${JSON.stringify(d)}`);
      expect(await atLeast(h, h.stage.locator('.fig-card'), 1) === 1, 'no card appeared for the selected organelle');
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
      await until(h, (x) => x.labels === !before, 5_000);
      expect((await h.describe()).labels === !before, `Labels did not toggle from ${before}`);
      await h.button(/^Labels/).click();
      await until(h, (x) => x.labels === before, 5_000);
      expect((await h.describe()).labels === before, 'Labels did not toggle back');
      if (before) expect(await atLeast(h, h.stage.locator('.fig-label'), 5) >= 5, 'fewer than five labels are on the stage with labels on');
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

  // Chapter 6, Figure 6.2. Written at the end of the table, apart from the chapter's other three recipes,
  // which were being written at the same time. After every press the assertion is on what
  // the figure COMPUTED — stalledAt, starvedAt, clusterCount, oxygenReleased, capturedFraction,
  // flashOxygen — and never only on the count the button itself moved.
  zscheme: [
    ['opens-dark-with-nothing-fired', async (h) => {
      const d = await h.describe();
      expect(d.path === 'linear' && d.playing === false, `it should open on the linear path, unrun: ${JSON.stringify({ path: d.path, playing: d.playing })}`);
      expect(d.photonsAtPsii === 0 && d.photonsAtPsi === 0 && d.clusterCount === 0, `nothing fired and the counter at zero: ${JSON.stringify({ ii: d.photonsAtPsii, i: d.photonsAtPsi, cluster: d.clusterCount })}`);
      expect(d.oxygenReleased === 0 && d.nadphMade === 0 && d.protonsToLumen === 0, `the three counters should open at zero: ${JSON.stringify({ o2: d.oxygenReleased, nadph: d.nadphMade, h: d.protonsToLumen })}`);
      expect(Object.values(d.carrierFill).every((v) => v === 0), `every carrier should open empty: ${JSON.stringify(d.carrierFill)}`);
      expect(d.stalledAt === null && d.starvedAt === null && d.flashTrain === false && d.flashOxygen.length === 0, `nothing stalled and no train: ${JSON.stringify({ stalledAt: d.stalledAt, starvedAt: d.starvedAt, flashOxygen: d.flashOxygen })}`);
      expect(d.climbVolts === 1.14 && d.climbKjPerTwoElectrons === 220, `the ledger should read §6.4's 1.14 V and §5.8's 220 kJ/mol: ${d.climbVolts} V, ${d.climbKjPerTwoElectrons} kJ/mol`);
    }],
    ['three-photons-at-II-release-no-oxygen', async (h) => {
      const fireII = h.button(/^Fire at photosystem II,/);
      for (let i = 1; i <= 3; i += 1) {
        await fireII.click();
        await until(h, (x) => x.photonsAtPsii === i, 5_000);
      }
      const d = await h.describe();
      expect(d.photonsAtPsii === 3, `three presses should have fired three photons: ${d.photonsAtPsii}`);
      expect(d.clusterCount === 3 && d.oxygenReleased === 0, `three holes on the cluster and no oxygen: ${JSON.stringify({ cluster: d.clusterCount, o2: d.oxygenReleased })}`);
    }],
    ['the-fourth-releases-one-oxygen-and-four-protons', async (h) => {
      const before = await h.describe();
      await h.button(/^Fire at photosystem II,/).click();
      const d = await until(h, (x) => x.oxygenReleased === 1, 5_000);
      expect(d.oxygenReleased === 1 && d.clusterCount === 0, `the fourth photon should release one oxygen and empty the counter: ${JSON.stringify({ o2: d.oxygenReleased, cluster: d.clusterCount })}`);
      expect(d.protonsToLumen - before.protonsToLumen === 4, `and its two waters should drop four protons into the lumen: ${before.protonsToLumen} -> ${d.protonsToLumen}`);
    }],
    ['photosystem-II-alone-stalls-at-plastoquinone', async (h) => {
      await h.button(/^Fire at photosystem II,/).click();
      const d = await until(h, (x) => x.photonsAtPsii === 5, 5_000);
      expect(d.stalledAt === 'plastoquinone' && d.starvedAt === 'ferredoxin', `photosystem II alone should jam: ${JSON.stringify({ stalledAt: d.stalledAt, starvedAt: d.starvedAt })}`);
      expect(d.carrierFill.plastoquinone === 1 && d.carrierFill.cytochromeB6f === 1 && d.carrierFill.plastocyanin === 1, `with every carrier between the photosystems full: ${JSON.stringify(d.carrierFill)}`);
      expect(d.clusterCount === 0 && d.oxygenReleased === 1, `a closed photosystem II should move the cluster not at all: ${JSON.stringify({ cluster: d.clusterCount, o2: d.oxygenReleased })}`);
      expect(d.photonKjSupplied > 870 && d.capturedFraction === 0, `five photons' worth of light and nothing kept: ${d.photonKjSupplied} kJ/mol, ${d.capturedFraction}`);
    }],
    ['photosystem-I-unjams-it-and-makes-nadph', async (h) => {
      const fireI = h.button(/^Fire at photosystem I,/);
      await fireI.click();
      const one = await until(h, (x) => x.photonsAtPsi === 1, 5_000);
      expect(one.stalledAt === null && one.carrierFill.plastoquinone === 0.5, `one photon at photosystem I should make room: ${JSON.stringify({ stalledAt: one.stalledAt, fill: one.carrierFill })}`);
      await fireI.click();
      const d = await until(h, (x) => x.nadphMade === 1, 5_000);
      expect(d.nadphMade === 1, `two electrons at NADP+ should make one NADPH: ${d.nadphMade}`);
      expect(d.capturedFraction > 0.1 && d.capturedFraction < 0.317, `and some of the light is now kept, less than the best case: ${d.capturedFraction}`);
    }],
    ['photosystem-I-alone-stalls-at-P700', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.photonsAtPsii === 0 && x.photonsAtPsi === 0, 5_000);
      const fireI = h.button(/^Fire at photosystem I,/);
      await fireI.click();
      const d = await until(h, (x) => x.stalledAt === 'P700', 5_000);
      expect(d.stalledAt === 'P700' && d.starvedAt === 'plastocyanin', `photosystem I alone should drain the chain after one electron: ${JSON.stringify({ stalledAt: d.stalledAt, starvedAt: d.starvedAt })}`);
      await fireI.click();
      const again = await until(h, (x) => x.photonsAtPsi === 2, 5_000);
      expect(again.carrierFill.ferredoxin === 0 && again.nadphMade === 0 && again.stalledAt === 'P700', `a second photon at an oxidised P700 should move nothing: ${JSON.stringify({ fill: again.carrierFill, nadph: again.nadphMade, stalledAt: again.stalledAt })}`);
    }],
    ['both-in-turn-run-water-to-nadph-at-the-ledger-rate', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.photonsAtPsii === 0 && x.photonsAtPsi === 0, 5_000);
      for (let i = 1; i <= 4; i += 1) {
        await h.button(/^Fire at photosystem II,/).click();
        await until(h, (x) => x.photonsAtPsii === i, 5_000);
        await h.button(/^Fire at photosystem I,/).click();
        await until(h, (x) => x.photonsAtPsi === i, 5_000);
      }
      const d = await h.describe();
      expect(d.nadphMade === 2 && d.oxygenReleased === 1 && d.stalledAt === null, `four electrons from water should make two NADPH and one oxygen without a stall: ${JSON.stringify({ nadph: d.nadphMade, o2: d.oxygenReleased, stalledAt: d.stalledAt })}`);
      expect(d.protonsToLumen === 12, `four from the water and two per electron through the cytochrome complex: ${d.protonsToLumen}`);
      expect(Math.abs(d.capturedFraction - 0.317) < 0.002, `four photons per NADPH keeps 220 of 693.6 kJ/mol: ${d.capturedFraction}`);
    }],
    ['cyclic-flow-moves-protons-and-makes-no-nadph-or-oxygen', async (h) => {
      await h.button(/^Cyclic flow/).click();
      const before = await until(h, (x) => x.path === 'cyclic', 5_000);
      expect(before.path === 'cyclic', `the path switch did not take: ${before.path}`);
      for (let i = 1; i <= 6; i += 1) {
        await h.button(/^Fire at photosystem I,/).click();
        await until(h, (x) => x.photonsAtPsi === before.photonsAtPsi + i, 5_000);
      }
      const d = await h.describe();
      expect(d.nadphMade === before.nadphMade && d.oxygenReleased === before.oxygenReleased, `no NADPH and no oxygen on the cyclic path: ${JSON.stringify({ nadph: [before.nadphMade, d.nadphMade], o2: [before.oxygenReleased, d.oxygenReleased] })}`);
      expect(d.protonsToLumen === before.protonsToLumen + 12, `six turns of the loop should move twelve protons: ${before.protonsToLumen} -> ${d.protonsToLumen}`);
      expect(d.stalledAt === null, `photosystem I alone keeps an electron going round the loop without stalling: ${d.stalledAt}`);
    }],
    ['on-the-cyclic-path-photosystem-II-jams-and-the-oxygen-stops', async (h) => {
      const fireII = h.button(/^Fire at photosystem II,/);
      let d = await h.describe();
      for (let i = 0; i < 6 && d.stalledAt !== 'plastoquinone'; i += 1) {
        const n = d.photonsAtPsii;
        await fireII.click();
        d = await until(h, (x) => x.photonsAtPsii === n + 1, 5_000);
      }
      expect(d.stalledAt === 'plastoquinone' && d.starvedAt === null, `with nothing leaving the loop, photosystem II should fill it and jam: ${JSON.stringify({ stalledAt: d.stalledAt, starvedAt: d.starvedAt })}`);
      const jammed = d;
      for (let i = 1; i <= 4; i += 1) {
        await fireII.click();
        d = await until(h, (x) => x.photonsAtPsii === jammed.photonsAtPsii + i, 5_000);
      }
      expect(d.oxygenReleased === jammed.oxygenReleased && d.nadphMade === jammed.nadphMade, `four more photons at a jammed photosystem II should release no oxygen: ${JSON.stringify({ o2: [jammed.oxygenReleased, d.oxygenReleased], nadph: d.nadphMade })}`);
    }],
    ['the-flash-train-counts-in-fours', async (h) => {
      await h.button(/^Linear flow/).click();
      await until(h, (x) => x.path === 'linear', 5_000);
      await h.button(/^Flash train/).click();
      const started = await until(h, (x) => x.flashTrain === true, 5_000);
      expect(started.flashTrain === true && started.clusterCount === 1 && started.oxygenReleased === 0, `the train should start from the dark, the cluster one step along: ${JSON.stringify({ train: started.flashTrain, cluster: started.clusterCount, o2: started.oxygenReleased })}`);
      const mid = await until(h, (x) => x.flashOxygen.length >= 4, 30_000);
      expect(mid.flashOxygen.length >= 4, `the train should be firing: ${mid.flashOxygen.length} flashes`);
      await h.button(/^Pause/).click();
      const paused = await until(h, (x) => x.playing === false, 5_000);
      expect(paused.playing === false && paused.flashTrain === true && paused.flashOxygen.length < 12, `Pause should stop the train part-way: ${JSON.stringify({ playing: paused.playing, flashes: paused.flashOxygen.length })}`);
      await h.button(/^Run/).click();
      const d = await until(h, (x) => x.flashOxygen.length === 12 && x.flashTrain === false, 60_000);
      const y = d.flashOxygen;
      expect(y.length === 12 && d.flashTrain === false, `Run should carry the train on to twelve flashes: ${y.length}`);
      const peak = (n) => y[n - 1] > y[n - 2] && y[n - 1] > y[n];
      expect(y[0] === 0 && y[1] < 0.1, `almost nothing on the first two flashes: ${y.join(', ')}`);
      expect(y[2] === Math.max(...y), `the third flash should give the most: ${y.join(', ')}`);
      expect(peak(3) && peak(7) && peak(11), `peaks on flashes 3, 7 and 11: ${y.join(', ')}`);
      expect(y[2] > y[6] && y[6] > y[10], `each lower than the last, as the population drifts out of step: ${y.join(', ')}`);
      expect(d.oxygenReleased === 3, `the drawn cluster, starting one step along, should release on flashes 3, 7 and 11: ${d.oxygenReleased}`);
    }],
    ['keys-fire-and-reset', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Home');
      await until(h, (x) => x.photonsAtPsii === 0 && x.flashOxygen.length === 0, 5_000);
      await h.page.keyboard.press('2');
      const d = await until(h, (x) => x.photonsAtPsii === 1, 5_000);
      expect(d.photonsAtPsii === 1 && d.clusterCount === 1, `2 should fire at photosystem II: ${JSON.stringify({ ii: d.photonsAtPsii, cluster: d.clusterCount })}`);
      await h.page.keyboard.press('1');
      const e = await until(h, (x) => x.photonsAtPsi === 1, 5_000);
      expect(e.photonsAtPsi === 1 && e.carrierFill.ferredoxin === 0, `1 should fire at photosystem I: ${JSON.stringify({ i: e.photonsAtPsi, fill: e.carrierFill })}`);
    }],
    ['reset-puts-everything-back', async (h) => {
      await h.button(/^Cyclic flow/).click();
      await until(h, (x) => x.path === 'cyclic', 5_000);
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.photonsAtPsii === 0 && x.path === 'linear', 5_000);
      expect(d.path === 'linear' && d.playing === false && d.t === 0, `Reset should leave the linear path, unrun, at t = 0: ${JSON.stringify({ path: d.path, playing: d.playing, t: d.t })}`);
      expect(d.photonsAtPsi === 0 && d.oxygenReleased === 0 && d.nadphMade === 0 && d.protonsToLumen === 0 && d.clusterCount === 0, `Reset left counts behind: ${JSON.stringify({ i: d.photonsAtPsi, o2: d.oxygenReleased, nadph: d.nadphMade, h: d.protonsToLumen, cluster: d.clusterCount })}`);
      expect(d.stalledAt === null && d.flashOxygen.length === 0 && d.photonKjSupplied === 0, `Reset left ${JSON.stringify({ stalledAt: d.stalledAt, flashOxygen: d.flashOxygen, kj: d.photonKjSupplied })}`);
    }],
  ],

  // Chapter 6, Figure 6.4. The fields asserted are the computed ones — dissolvedRatio, workingRatio,
  // netGainPercent — each after the control that should move it and alongside the ones it should not,
  // because the figure's claim is WHICH line of §6.7's arithmetic each slider moves.
  'rubisco-fork': [
    ['opens-on-todays-air-with-no-turns-taken', async (h) => {
      const d = await h.describe();
      expect(d.scene === 'site' && d.era === 'today' && d.playing === false, `it should open on the site in today's air, unrun: ${JSON.stringify({ scene: d.scene, era: d.era, playing: d.playing })}`);
      expect(d.airCo2Ppm === 420 && d.airO2Percent === 21 && d.temperatureC === 25 && d.stomaOpen === 0.5, `it should open at 420 ppm, 21 %, 25 °C and the pore half open: ${JSON.stringify({ airCo2Ppm: d.airCo2Ppm, airO2Percent: d.airO2Percent, temperatureC: d.temperatureC, stomaOpen: d.stomaOpen })}`);
      expect(d.carboxylations === 0 && d.oxygenations === 0, `no turns should have been taken: ${d.carboxylations}/${d.oxygenations}`);
      // §6.7's four steps, to the prose's own numbers.
      expect(near(d.airRatio, 500, 0.5) && near(d.dissolvedRatio, 20, 0.05) && near(d.preference, 100, 0.1) && near(d.workingRatio, 3, 0.02), `the table should open at 500, 20, a hundredfold and 3: ${JSON.stringify({ airRatio: d.airRatio, dissolvedRatio: d.dissolvedRatio, preference: d.preference, workingRatio: d.workingRatio })}`);
      expect(near(d.netGainPercent, 62.5, 0.1), `net carbon gain should open at 62.5 %: ${d.netGainPercent}`);
      // The carbon dioxide range holds a rung, an index into the figure's list of concentrations, so what a
      // screen reader hears is only right if the figure says it: aria-valuetext, in the stage's own units.
      const spoken = await h.stage.getByRole('slider', { name: 'Carbon dioxide' }).getAttribute('aria-valuetext');
      expect(spoken === '420 parts per million', `the carbon dioxide range should say its concentration, not its rung: ${JSON.stringify(spoken)}`);
    }],
    ['warming-moves-the-solubility-and-the-preference', async (h) => {
      const before = await h.describe();
      const temp = h.stage.getByRole('slider', { name: 'Temperature' });
      await temp.fill('35');
      await atValue(h, temp, 35);
      const d = await until(h, (x) => x.temperatureC === 35, 5_000);
      expect(d.temperatureC === 35, `the temperature did not reach 35 °C: ${d.temperatureC}`);
      expect(d.airRatio === before.airRatio, `warming moved the air's ratio, which has no temperature in it: ${before.airRatio} -> ${d.airRatio}`);
      expect(d.dissolvedRatio > before.dissolvedRatio + 1, `carbon dioxide should dissolve less well warm, raising the dissolved ratio: ${before.dissolvedRatio} -> ${d.dissolvedRatio}`);
      expect(d.preference < 70, `the enzyme's own preference should fall as it warms: ${d.preference}`);
      expect(d.workingRatio < 2.1 && d.netGainPercent < before.netGainPercent - 10, `both terms should take the working ratio and the gain down: ${JSON.stringify({ workingRatio: d.workingRatio, netGainPercent: d.netGainPercent })}`);
    }],
    ['closing-the-pore-lowers-only-the-last-step', async (h) => {
      const temp = h.stage.getByRole('slider', { name: 'Temperature' });
      await temp.fill('25');
      await atValue(h, temp, 25);
      const before = await until(h, (x) => x.temperatureC === 25, 5_000);
      const pore = h.stage.getByRole('slider', { name: 'Pore' });
      await pore.fill('10');
      await atValue(h, pore, 10);
      const d = await until(h, (x) => x.stomaOpen === 0.1, 5_000);
      expect(d.stomaOpen === 0.1, `the pore did not close to 10 %: ${d.stomaOpen}`);
      expect(d.internalCo2Ppm < before.internalCo2Ppm - 100, `the leaf's internal carbon dioxide should fall well below the air's: ${before.internalCo2Ppm} -> ${d.internalCo2Ppm}`);
      expect(d.airRatio === before.airRatio && d.dissolvedRatio === before.dissolvedRatio && d.preference === before.preference, `the pore moved a step it does not enter: ${JSON.stringify({ airRatio: d.airRatio, dissolvedRatio: d.dissolvedRatio, preference: d.preference })}`);
      expect(d.workingRatio < 1.5 && d.netGainPercent < before.netGainPercent - 15, `closing the pore should take the working ratio and the gain down: ${JSON.stringify({ workingRatio: d.workingRatio, netGainPercent: d.netGainPercent })}`);
    }],
    ['more-carbon-dioxide-moves-the-first-step', async (h) => {
      const pore = h.stage.getByRole('slider', { name: 'Pore' });
      await pore.fill('50');
      await atValue(h, pore, 50);
      const before = await until(h, (x) => x.stomaOpen === 0.5, 5_000);
      const co2 = h.stage.getByRole('slider', { name: 'Carbon dioxide' });
      await co2.fill('20'); // the rung for 1000 ppm
      await atValue(h, co2, 20);
      const d = await until(h, (x) => x.airCo2Ppm === 1000, 5_000);
      expect(d.airCo2Ppm === 1000, `the air did not reach 1000 ppm: ${d.airCo2Ppm}`);
      const spoken = await co2.getAttribute('aria-valuetext');
      expect(spoken === '1000 parts per million', `the carbon dioxide range should say 1000 parts per million after the move: ${JSON.stringify(spoken)}`);
      expect(near(d.airRatio, 210, 0.5) && d.dissolvedRatio < before.dissolvedRatio / 2, `the first two steps should fall with more carbon dioxide: ${JSON.stringify({ airRatio: d.airRatio, dissolvedRatio: d.dissolvedRatio })}`);
      expect(d.preference === before.preference, `the enzyme's preference moved with the air: ${before.preference} -> ${d.preference}`);
      expect(d.workingRatio > 6 && d.netGainPercent > before.netGainPercent, `more carbon dioxide should raise the working ratio and the gain: ${JSON.stringify({ workingRatio: d.workingRatio, netGainPercent: d.netGainPercent })}`);
    }],
    ['the-turns-settle-near-the-working-ratio', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.airCo2Ppm === 420 && x.carboxylations === 0 && x.playing === false, 5_000);
      await ensureRunning(h);
      const d = await until(h, (x) => x.carboxylations + x.oxygenations >= 90, 90_000);
      await h.button(/^Pause/).click();
      await until(h, (x) => x.playing === false, 5_000);
      expect(d.carboxylations + d.oxygenations >= 90, `90 turns should have been taken at three a second: ${d.carboxylations}/${d.oxygenations} at t=${d.t}`);
      expect(d.oxygenations > 0, 'in today\'s air some turns should be oxygenations');
      const counted = d.carboxylations / d.oxygenations;
      expect(Math.abs(counted - d.workingRatio) < 0.6, `the counted ratio should have settled near the table's: counted ${counted.toFixed(2)} against ${d.workingRatio}`);
    }],
    ['one-turn-at-a-time', async (h) => {
      const before = await h.describe();
      const n0 = before.carboxylations + before.oxygenations;
      for (let i = 0; i < 4; i += 1) await h.button(/^Take a turn/).click();
      const d = await until(h, (x) => x.carboxylations + x.oxygenations === n0 + 4, 5_000);
      expect(d.carboxylations + d.oxygenations === n0 + 4, `four presses should be four turns: ${n0} -> ${d.carboxylations + d.oxygenations}`);
      expect(d.playing === false, 'a single turn should not leave the figure running');
    }],
    ['the-keys-take-a-turn', async (h) => {
      const before = await h.describe();
      const n0 = before.carboxylations + before.oxygenations;
      await h.focusable().focus();
      await h.page.keyboard.press('Enter');
      const d = await until(h, (x) => x.carboxylations + x.oxygenations === n0 + 1, 5_000);
      expect(d.carboxylations + d.oxygenations === n0 + 1, `Enter on the site should take one turn: ${n0} -> ${d.carboxylations + d.oxygenations}`);
    }],
    ['archaean-air-turns-oxygenation-off', async (h) => {
      await h.button(/^Archaean air/).click();
      const on = await until(h, (x) => x.era === 'archaean', 5_000);
      expect(on.era === 'archaean' && on.airO2Percent === 0 && on.airCo2Ppm === 10000, `Archaean air should hold no oxygen and far more carbon dioxide: ${JSON.stringify({ era: on.era, airO2Percent: on.airO2Percent, airCo2Ppm: on.airCo2Ppm })}`);
      expect(on.workingRatio === Infinity && on.netGainPercent === 100, `with no oxygen every turn is a carboxylation: ${JSON.stringify({ workingRatio: on.workingRatio, netGainPercent: on.netGainPercent })}`);
      expect(on.carboxylations === 0 && on.oxygenations === 0, `the count should start again with the new air: ${on.carboxylations}/${on.oxygenations}`);
      expect(on.preference === 100, `the enzyme itself should not have changed: preference ${on.preference}`);
      await ensureRunning(h);
      const d = await until(h, (x) => x.carboxylations >= 30, 60_000);
      await h.button(/^Pause/).click();
      await until(h, (x) => x.playing === false, 5_000);
      expect(d.carboxylations >= 30, `30 turns should have been taken: ${d.carboxylations}`);
      expect(d.oxygenations === 0, `no oxygenation is possible with no oxygen: ${d.oxygenations}`);
    }],
    ['the-salvage-counts-what-comes-back', async (h) => {
      await h.button(/^Salvage route/).click();
      const d0 = await until(h, (x) => x.scene === 'salvage', 5_000);
      expect(d0.scene === 'salvage' && d0.salvageStep === 'chloroplast', `the salvage should open in the chloroplast: ${JSON.stringify({ scene: d0.scene, salvageStep: d0.salvageStep })}`);
      expect(d0.carbonLost === 0 && d0.carbonRecovered === 0 && d0.atpSpentOnSalvage === 0, `nothing should be counted yet: ${JSON.stringify({ carbonLost: d0.carbonLost, carbonRecovered: d0.carbonRecovered, atpSpentOnSalvage: d0.atpSpentOnSalvage })}`);
      await h.button(/^Next step/).click();
      await until(h, (x) => x.salvageStep === 'peroxisome', 5_000);
      await h.button(/^Next step/).click();
      const d2 = await until(h, (x) => x.salvageStep === 'mitochondrion', 5_000);
      expect(d2.salvageStep === 'mitochondrion' && d2.carbonLost === 1 && d2.carbonRecovered === 0, `the mitochondrion should release one carbon and recover none yet: ${JSON.stringify({ salvageStep: d2.salvageStep, carbonLost: d2.carbonLost, carbonRecovered: d2.carbonRecovered })}`);
      await h.button(/^Next step/).click();
      await until(h, (x) => x.salvageStep === 'peroxisome-back', 5_000);
      await h.button(/^Next step/).click();
      const d4 = await until(h, (x) => x.salvageStep === 'chloroplast-back', 5_000);
      expect(d4.carbonRecovered === 3 && d4.carbonLost === 1 && d4.atpSpentOnSalvage === 2, `three carbons in four should come back, for two ATP: ${JSON.stringify({ salvageStep: d4.salvageStep, carbonRecovered: d4.carbonRecovered, carbonLost: d4.carbonLost, atpSpentOnSalvage: d4.atpSpentOnSalvage })}`);
    }],
    ['running-the-salvage-stops-at-the-end', async (h) => {
      await h.button(/^Next step/).click();
      await until(h, (x) => x.salvageStep === 'chloroplast', 5_000);
      await ensureRunning(h);
      const d = await until(h, (x) => x.salvageStep === 'chloroplast-back' && x.playing === false, 40_000);
      expect(d.salvageStep === 'chloroplast-back' && d.playing === false, `a run should carry the molecule round and stop: ${JSON.stringify({ salvageStep: d.salvageStep, playing: d.playing, t: d.t })}`);
      expect(d.carbonRecovered === 3 && d.atpSpentOnSalvage === 2, `and leave the ledger complete: ${JSON.stringify({ carbonRecovered: d.carbonRecovered, atpSpentOnSalvage: d.atpSpentOnSalvage })}`);
    }],
    ['less-rubisco-leaves-the-odds-alone', async (h) => {
      await h.button(/^Active site/).click();
      const before = await until(h, (x) => x.scene === 'site', 5_000);
      const share = h.stage.getByRole('slider', { name: 'Rubisco' });
      await share.fill('10');
      await atValue(h, share, 10);
      const d = await until(h, (x) => x.rubiscoFractionOfProtein === 0.1, 5_000);
      expect(d.rubiscoFractionOfProtein === 0.1, `rubisco should be a tenth of the leaf's protein: ${d.rubiscoFractionOfProtein}`);
      expect(d.workingRatio === before.workingRatio && d.netGainPercent === before.netGainPercent && d.dissolvedRatio === before.dissolvedRatio, `how much rubisco there is changes the rate, not the odds: ${JSON.stringify({ workingRatio: d.workingRatio, netGainPercent: d.netGainPercent })}`);
    }],
    ['reset-puts-everything-back', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.era === 'today' && x.rubiscoFractionOfProtein === 0.4 && x.salvageStep === null, 5_000);
      expect(d.scene === 'site' && d.era === 'today' && d.playing === false, `Reset left ${JSON.stringify({ scene: d.scene, era: d.era, playing: d.playing })}`);
      expect(d.airCo2Ppm === 420 && d.temperatureC === 25 && d.stomaOpen === 0.5 && d.rubiscoFractionOfProtein === 0.4, `Reset left the controls at ${JSON.stringify({ airCo2Ppm: d.airCo2Ppm, temperatureC: d.temperatureC, stomaOpen: d.stomaOpen, rubiscoFractionOfProtein: d.rubiscoFractionOfProtein })}`);
      expect(d.carboxylations === 0 && d.oxygenations === 0 && d.salvageStep === null && d.t === 0, `Reset left ${JSON.stringify({ carboxylations: d.carboxylations, oxygenations: d.oxygenations, salvageStep: d.salvageStep, t: d.t })}`);
      expect(near(d.workingRatio, 3, 0.02) && near(d.netGainPercent, 62.5, 0.1), `Reset left the table at ${JSON.stringify({ workingRatio: d.workingRatio, netGainPercent: d.netGainPercent })}`);
    }],
  ],

  // Figure 7.1. The ledger's numbers below are §7.2's arithmetic, worked by hand from the steps and not
  // read from the module: two ATP spent on the whole glucose at steps 1 and 3, and from step 4 two lanes,
  // each making an NADH at step 6, an ATP at steps 7 and 10, and a pyruvate at step 10.
  glycolysis: [
    ['opens-on-one-glucose-paused-with-nothing-spent', async (h) => {
      const d = await h.describe();
      expect(d.step === 0 && d.playing === false && d.t === 0, `it should open before step 1, paused: ${JSON.stringify({ step: d.step, playing: d.playing, t: d.t })}`);
      expect(d.phase === 'investment' && d.carbonsPerMolecule === 6 && d.moleculesInFlight === 1, `it should open on one six-carbon glucose: ${JSON.stringify({ phase: d.phase, carbonsPerMolecule: d.carbonsPerMolecule, moleculesInFlight: d.moleculesInFlight })}`);
      expect(d.atpSpent === 0 && d.atpMade === 0 && d.atpNet === 0 && d.nadhMade === 0 && d.pyruvateMade === 0 && d.ledgerPer === 'glucose', `nothing should be counted yet, per glucose: ${JSON.stringify({ atpSpent: d.atpSpent, atpMade: d.atpMade, atpNet: d.atpNet, nadhMade: d.nadhMade, pyruvateMade: d.pyruvateMade, ledgerPer: d.ledgerPer })}`);
      expect(d.atpMM === 3 && d.ampMM === 0.1 && d.citrateMM === 0.2 && d.committedStepOpen === true && d.closedBy === null, `it should open at a resting cell's levels with the committed step open: ${JSON.stringify({ atpMM: d.atpMM, ampMM: d.ampMM, citrateMM: d.citrateMM, committedStepOpen: d.committedStepOpen, closedBy: d.closedBy })}`);
      expect(d.knockedOut === null && d.accumulating === null && Array.isArray(d.drainedAway) && d.drainedAway.length === 0 && d.donorForStep === null, `nothing should be knocked out and no donor named: ${JSON.stringify({ knockedOut: d.knockedOut, accumulating: d.accumulating, drainedAway: d.drainedAway, donorForStep: d.donorForStep })}`);
    }],
    ['the-net-goes-down-before-it-comes-up', async (h) => {
      // After each step, per glucose: [net, spent, made, NADH, pyruvate, where the step's phosphate came from].
      const WALK = [
        null,
        [-1, 1, 0, 0, 0, 'ATP'],
        [-1, 1, 0, 0, 0, null],
        [-2, 2, 0, 0, 0, 'ATP'],
        [-2, 2, 0, 0, 0, null],
        [-2, 2, 0, 0, 0, null],
        [-2, 2, 0, 2, 0, 'inorganic phosphate'],
        [0, 2, 2, 2, 0, '1,3-bisphosphoglycerate'],
        [0, 2, 2, 2, 0, null],
        [0, 2, 2, 2, 0, null],
        [2, 2, 4, 2, 2, 'phosphoenolpyruvate'],
      ];
      const nets = [];
      for (let k = 1; k <= 10; k += 1) {
        await h.button(/^Step forward/).click();
        const d = await until(h, (x) => x.step === k, 5_000);
        expect(d.step === k, `Step forward should reach step ${k}: it is at ${d.step}`);
        const [net, spent, made, nadh, pyr, donor] = WALK[k];
        const got = { atpNet: d.atpNet, atpSpent: d.atpSpent, atpMade: d.atpMade, nadhMade: d.nadhMade, pyruvateMade: d.pyruvateMade };
        expect(d.atpNet === net && d.atpSpent === spent && d.atpMade === made && d.nadhMade === nadh && d.pyruvateMade === pyr, `after step ${k} the ledger per glucose should read net ${net}, ${spent} spent, ${made} made, ${nadh} NADH and ${pyr} pyruvate: ${JSON.stringify(got)}`);
        expect(d.donorForStep === donor, `step ${k}'s phosphate should come from ${donor === null ? 'nowhere (null)' : donor}: ${JSON.stringify(d.donorForStep)}`);
        const cut = k >= 4;
        expect(d.carbonsPerMolecule === (cut ? 3 : 6) && d.moleculesInFlight === (cut ? 2 : 1) && d.phase === (k <= 5 ? 'investment' : 'payoff'), `after step ${k}: ${JSON.stringify({ phase: d.phase, carbonsPerMolecule: d.carbonsPerMolecule, moleculesInFlight: d.moleculesInFlight })}`);
        expect(d.playing === false, `a step should not start the run: after step ${k} playing is ${d.playing}`);
        nets.push(d.atpNet);
      }
      expect(Math.min(...nets) < 0 && nets[nets.length - 1] > 0, `the net should go negative before it comes back positive: ${nets.join(', ')}`);
      // There is no eleventh step: the press is refused, and the figure says why.
      await h.button(/^Step forward/).click();
      const said = await liveSays(h, /end of the line/);
      expect(/end of the line/.test(said) && (await h.describe()).step === 10, `a press at pyruvate should be refused and say so: ${JSON.stringify(said)}`);
    }],
    ['the-ladder-is-the-chapters-and-lights-the-donor', async (h) => {
      // §5.3's own table, parsed out of chapter 5, against the rungs the figure draws at step 10.
      expect((await h.describe()).step === 10, 'this step reads the ladder at step 10');
      const table = chapterLadder();
      const { rows, words } = await glycolysisLedger(h);
      const bare = (s) => String(s).replace(/†/g, '').trim().toLowerCase();
      const kj = (s) => Number(String(s).replace('≈', '').replace('−', '-').trim());
      const onTable = rows.filter((r) => table.some((t) => bare(t.name) === bare(r.key)));
      for (const r of onTable) {
        const t = table.find((x) => bare(x.name) === bare(r.key));
        expect(kj(r.val) === t.kj, `the rung "${r.key}" should print §5.3's ${t.kj} kJ/mol: it prints ${JSON.stringify(r.val)}`);
      }
      for (const name of ['Phosphoenolpyruvate', 'Creatine phosphate', 'ATP', 'Glucose 6-phosphate']) {
        expect(onTable.some((r) => bare(r.key) === bare(name)), `the ladder should print §5.3's rung "${name}": it prints ${JSON.stringify(rows.map((r) => r.key))}`);
      }
      const down = [...onTable].sort((a, b) => a.y - b.y).map((r) => kj(r.val));
      expect(down.every((v, i) => i === 0 || v > down[i - 1]), `the rungs should run down the page as §5.3's table does, the most negative at the top: ${down.join(', ')}`);
      // 1,3-Bisphosphoglycerate is not on the table, and the figure says so rather than that the table lists
      // it: a dagger, an approximate value, and a place between creatine phosphate and the top rung.
      expect(!table.some((t) => bare(t.name) === '1,3-bisphosphoglycerate'), `§5.3's table now lists 1,3-bisphosphoglycerate, so the figure's dagger saying it does not is wrong: ${JSON.stringify(table)}`);
      const bpg = rows.find((r) => bare(r.key) === '1,3-bisphosphoglycerate');
      expect(bpg && bpg.key.includes('†') && String(bpg.val).includes('≈'), `1,3-bisphosphoglycerate should be printed with a dagger and an approximate value: ${JSON.stringify(bpg)}`);
      const pep = onTable.find((r) => bare(r.key) === 'phosphoenolpyruvate');
      const crp = onTable.find((r) => bare(r.key) === 'creatine phosphate');
      expect(kj(bpg.val) > kj(pep.val) && kj(bpg.val) < kj(crp.val) && bpg.y > pep.y && bpg.y < crp.y, `1,3-bisphosphoglycerate belongs between phosphoenolpyruvate and creatine phosphate, in value and on the page: ${JSON.stringify({ pep, bpg, crp })}`);
      expect(words.includes('† Not on Section 5.3’s table'), `the dagger should be explained under the rungs: ${words}`);
      // Step 10's phosphate runs from the top rung down to ATP, and the drawing lights exactly those two.
      const lit = rows.filter((r) => r.lit);
      const from = lit.find((r) => bare(r.key) === 'phosphoenolpyruvate');
      const to = lit.find((r) => bare(r.key) === 'atp');
      expect(lit.length === 2 && from && to && from.y < to.y, `step 10 should light phosphoenolpyruvate, above ATP, and ATP: it lights ${JSON.stringify(lit.map((r) => r.key))}`);
    }],
    ['stepping-back-walks-the-net-down-again', async (h) => {
      for (const [k, net] of [[9, 0], [8, 0], [7, 0], [6, -2]]) {
        await h.button(/^Step back/).click();
        const d = await until(h, (x) => x.step === k, 5_000);
        expect(d.step === k && d.atpNet === net, `Step back should reach step ${k} at net ${net} per glucose: step ${d.step}, net ${d.atpNet}`);
        if (k !== 7) continue;
        // The other ATP-making step: its donor, named, lit above ATP, and said to sit above it.
        const { rows, words } = await glycolysisLedger(h);
        const lit = rows.filter((r) => r.lit);
        const from = lit.find((r) => r.key.startsWith('1,3-Bisphosphoglycerate'));
        const to = lit.find((r) => r.key === 'ATP');
        expect(lit.length === 2 && from && to && from.y < to.y, `step 7 should light 1,3-bisphosphoglycerate, above ATP, and ATP: it lights ${JSON.stringify(lit.map((r) => r.key))}`);
        expect(d.donorForStep === '1,3-bisphosphoglycerate' && words.includes('above ATP'), `step 7 should name its donor and say it sits above ATP: ${JSON.stringify(d.donorForStep)}; the ledger says ${words}`);
      }
      const d = await h.describe();
      expect(d.atpMade === 0 && d.nadhMade === 2 && d.pyruvateMade === 0, `back at step 6 the ATP made should be undone and the NADH kept: ${JSON.stringify({ atpMade: d.atpMade, nadhMade: d.nadhMade, pyruvateMade: d.pyruvateMade })}`);
    }],
    ['per-fragment-halves-every-tally', async (h) => {
      await h.button(/^Per fragment/).click();
      const d = await until(h, (x) => x.ledgerPer === 'fragment', 5_000);
      expect(d.ledgerPer === 'fragment' && d.step === 6, `Per fragment should switch the ledger and leave the walk at step 6: ${JSON.stringify({ ledgerPer: d.ledgerPer, step: d.step })}`);
      expect(d.atpNet === -1 && d.atpSpent === 1 && d.atpMade === 0 && d.nadhMade === 1 && d.pyruvateMade === 0, `a fragment's share at step 6 is net −1, 1 spent and 1 NADH: ${JSON.stringify({ atpNet: d.atpNet, atpSpent: d.atpSpent, atpMade: d.atpMade, nadhMade: d.nadhMade, pyruvateMade: d.pyruvateMade })}`);
      for (let k = 7; k <= 10; k += 1) {
        await h.button(/^Step forward/).click();
        await until(h, (x) => x.step === k, 5_000);
      }
      const end = await h.describe();
      expect(end.step === 10 && end.atpNet === 1 && end.atpSpent === 1 && end.atpMade === 2 && end.nadhMade === 1 && end.pyruvateMade === 1, `a fragment's share of the whole walk is net +1: 1 spent, 2 made, 1 NADH and 1 pyruvate: ${JSON.stringify({ step: end.step, atpNet: end.atpNet, atpSpent: end.atpSpent, atpMade: end.atpMade, nadhMade: end.nadhMade, pyruvateMade: end.pyruvateMade })}`);
      await h.button(/^Per glucose/).click();
      const back = await until(h, (x) => x.ledgerPer === 'glucose', 5_000);
      expect(back.atpNet === 2 && back.atpMade === 4 && back.nadhMade === 2 && back.pyruvateMade === 2, `per glucose again the walk nets +2, with 4 made, 2 NADH and 2 pyruvate: ${JSON.stringify({ atpNet: back.atpNet, atpMade: back.atpMade, nadhMade: back.nadhMade, pyruvateMade: back.pyruvateMade })}`);
    }],
    ['raising-atp-shuts-the-committed-step', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.step === 0 && x.ledgerPer === 'glucose', 5_000);
      const atp = h.stage.getByRole('slider', { name: 'ATP', exact: true });
      await atp.fill('6');
      await atValue(h, atp, 6);
      const six = await until(h, (x) => x.atpMM === 6, 5_000);
      expect(six.atpMM === 6 && six.committedStepOpen === true && six.closedBy === null, `at 6 mM ATP the committed step should still be open: ${JSON.stringify({ atpMM: six.atpMM, committedStepOpen: six.committedStepOpen, closedBy: six.closedBy })}`);
      await atp.fill('7');
      await atValue(h, atp, 7);
      const seven = await until(h, (x) => x.atpMM === 7, 5_000);
      expect(seven.atpMM === 7 && seven.committedStepOpen === false && seven.closedBy === 'atp', `at 7 mM ATP it should be shut, by ATP: ${JSON.stringify({ atpMM: seven.atpMM, committedStepOpen: seven.committedStepOpen, closedBy: seven.closedBy })}`);
      const { words } = await glycolysisLedger(h);
      expect(/ATP has shut the committed step|Shut by ATP/.test(words), `the ledger should say that ATP shut it: ${words}`);
      for (let i = 0; i < 3; i += 1) await h.button(/^Step forward/).click();
      const said = await liveSays(h, /step 3 cannot be taken/);
      const d = await h.describe();
      expect(d.step === 2 && /shut by ATP: step 3 cannot be taken/.test(said), `the line should stop before step 3 and say which control shut it: step ${d.step}, ${JSON.stringify(said)}`);
    }],
    ['amp-opens-it-again', async (h) => {
      const amp = h.stage.getByRole('slider', { name: 'AMP', exact: true });
      await amp.fill('0.2');
      await atValue(h, amp, 0.2);
      const d = await until(h, (x) => x.ampMM === 0.2, 5_000);
      expect(d.ampMM === 0.2 && d.atpMM === 7 && d.committedStepOpen === true && d.closedBy === null, `one press of AMP should open the step against 7 mM ATP: ${JSON.stringify({ ampMM: d.ampMM, atpMM: d.atpMM, committedStepOpen: d.committedStepOpen, closedBy: d.closedBy })}`);
      await h.button(/^Step forward/).click();
      const on = await until(h, (x) => x.step === 3, 5_000);
      expect(on.step === 3 && on.atpNet === -2, `with the step open the glucose should take step 3: ${JSON.stringify({ step: on.step, atpNet: on.atpNet })}`);
    }],
    ['citrate-shuts-it-and-run-waits-at-the-gate', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.step === 0 && x.atpMM === 3 && x.ampMM === 0.1, 5_000);
      const cit = h.stage.getByRole('slider', { name: 'Citrate', exact: true });
      await cit.fill('1.4');
      await atValue(h, cit, 1.4);
      const low = await until(h, (x) => x.citrateMM === 1.4, 5_000);
      expect(low.citrateMM === 1.4 && low.committedStepOpen === true, `at 1.4 mM citrate the step should be open: ${JSON.stringify({ citrateMM: low.citrateMM, committedStepOpen: low.committedStepOpen })}`);
      await cit.fill('1.6');
      await atValue(h, cit, 1.6);
      const high = await until(h, (x) => x.citrateMM === 1.6, 5_000);
      expect(high.citrateMM === 1.6 && high.committedStepOpen === false && high.closedBy === 'citrate', `at 1.6 mM citrate it should be shut, by citrate: ${JSON.stringify({ citrateMM: high.citrateMM, committedStepOpen: high.committedStepOpen, closedBy: high.closedBy })}`);
      await ensureRunning(h);
      const at2 = await until(h, (x) => x.step === 2, 60_000);
      expect(at2.step === 2 && at2.playing === true, `Run should carry the glucose to step 2: ${JSON.stringify({ step: at2.step, playing: at2.playing, t: at2.t })}`);
      // Waiting is measured on the figure's own clock, not the wall's: two more steps' worth of Run, and
      // the glucose is still in front of the shut step.
      const later = await until(h, (x) => x.t >= at2.t + 2.5, 60_000);
      expect(later.t >= at2.t + 2.5 && later.step === 2 && later.playing === true, `Run should wait before step 3 while citrate holds it shut: ${JSON.stringify({ from: at2.t, t: later.t, step: later.step, playing: later.playing })}`);
      await cit.fill('1.4');
      await atValue(h, cit, 1.4);
      const on = await until(h, (x) => x.step >= 3, 60_000);
      expect(on.step >= 3 && on.committedStepOpen === true, `lowering citrate should open the step and let the waiting run go on: ${JSON.stringify({ step: on.step, committedStepOpen: on.committedStepOpen })}`);
      await h.button(/^Pause/).click();
      await until(h, (x) => x.playing === false, 5_000);
    }],
    ['a-knocked-out-kinase-piles-up-its-substrate', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.step === 0 && x.citrateMM === 0.2 && x.playing === false, 5_000);
      for (let k = 1; k <= 10; k += 1) await h.button(/^Step forward/).click();
      await until(h, (x) => x.step === 10, 5_000);
      const ko = h.stage.getByRole('slider', { name: 'Knock out', exact: true });
      await ko.fill('7');
      await atValue(h, ko, 7);
      const d = await until(h, (x) => x.knockedOut !== null, 5_000);
      expect(d.knockedOut === 'phosphoglycerate kinase' && d.accumulating === '1,3-bisphosphoglycerate', `knocking out step 7 should pile up 1,3-bisphosphoglycerate: ${JSON.stringify({ knockedOut: d.knockedOut, accumulating: d.accumulating })}`);
      const past = ['3-phosphoglycerate', '2-phosphoglycerate', 'phosphoenolpyruvate', 'pyruvate'];
      expect(d.drainedAway.length === past.length && past.every((m) => d.drainedAway.includes(m)), `everything past step 7, and nothing before it, should drain away: ${JSON.stringify(d.drainedAway)}`);
      // A glucose already past the gap is pulled back to it.
      expect(d.step === 6 && d.atpNet === -2 && d.nadhMade === 2 && d.pyruvateMade === 0, `the glucose should be pulled back to the gap, before step 7: ${JSON.stringify({ step: d.step, atpNet: d.atpNet, nadhMade: d.nadhMade, pyruvateMade: d.pyruvateMade })}`);
      await h.button(/^Step forward/).click();
      const said = await liveSays(h, /is knocked out: nothing passes it/);
      expect((await h.describe()).step === 6 && /phosphoglycerate kinase, is knocked out/.test(said), `step 7 should refuse the glucose and say why: ${JSON.stringify(said)}`);
      const { words } = await glycolysisLedger(h);
      expect(/1,3-bisphosphoglycerate piles up/.test(words), `the ledger should say what piles up: ${words}`);
    }],
    ['without-its-isomerase-one-piece-runs-the-payoff', async (h) => {
      const ko = h.stage.getByRole('slider', { name: 'Knock out', exact: true });
      await ko.fill('5');
      await atValue(h, ko, 5);
      const d = await until(h, (x) => x.knockedOut === 'triose phosphate isomerase', 5_000);
      expect(d.knockedOut === 'triose phosphate isomerase' && d.accumulating === 'dihydroxyacetone phosphate' && d.drainedAway.length === 0, `without the isomerase dihydroxyacetone phosphate should pile up and nothing drain away: ${JSON.stringify({ knockedOut: d.knockedOut, accumulating: d.accumulating, drainedAway: d.drainedAway })}`);
      for (let k = d.step + 1; k <= 10; k += 1) await h.button(/^Step forward/).click();
      const end = await until(h, (x) => x.step === 10, 5_000);
      expect(end.step === 10 && end.atpNet === 0 && end.atpSpent === 2 && end.atpMade === 2 && end.nadhMade === 1 && end.pyruvateMade === 1, `with one piece running the payoff a glucose nets 0 ATP, 1 NADH and 1 pyruvate: ${JSON.stringify({ step: end.step, atpNet: end.atpNet, atpSpent: end.atpSpent, atpMade: end.atpMade, nadhMade: end.nadhMade, pyruvateMade: end.pyruvateMade })}`);
    }],
    ['run-walks-the-line-and-stops-at-pyruvate', async (h) => {
      await h.button(/^Reset/).click();
      const d0 = await until(h, (x) => x.step === 0 && x.knockedOut === null && x.t === 0, 5_000);
      expect(d0.step === 0 && d0.knockedOut === null && d0.t === 0 && d0.playing === false, `Reset should put the glucose back unrun: ${JSON.stringify({ step: d0.step, knockedOut: d0.knockedOut, t: d0.t, playing: d0.playing })}`);
      await ensureRunning(h);
      const mid = await until(h, (x) => x.step >= 2, 60_000);
      await h.button(/^Pause/).click();
      const paused = await until(h, (x) => x.playing === false, 5_000);
      expect(mid.step >= 2 && mid.t > 0 && paused.playing === false, `Run should walk the glucose on, and Pause stop it: ${JSON.stringify({ step: mid.step, t: mid.t, playing: paused.playing })}`);
      await ensureRunning(h);
      const end = await until(h, (x) => x.step === 10 && x.playing === false, 90_000);
      expect(end.step === 10 && end.playing === false && end.atpNet === 2, `Run should walk to pyruvate and stop there: ${JSON.stringify({ step: end.step, playing: end.playing, atpNet: end.atpNet, t: end.t })}`);
    }],
    ['the-keys-walk-count-and-run', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.step === 0 && x.t === 0 && x.playing === false, 5_000);
      await h.focusable().focus();
      await h.page.keyboard.press('ArrowRight');
      await h.page.keyboard.press('ArrowRight');
      const two = await until(h, (x) => x.step === 2, 5_000);
      expect(two.step === 2, `two presses of the right arrow should reach step 2: ${two.step}`);
      await h.page.keyboard.press('ArrowLeft');
      const one = await until(h, (x) => x.step === 1, 5_000);
      expect(one.step === 1 && one.atpNet === -1, `the left arrow should step back to step 1: ${JSON.stringify({ step: one.step, atpNet: one.atpNet })}`);
      await h.page.keyboard.press('f');
      const frag = await until(h, (x) => x.ledgerPer === 'fragment', 5_000);
      expect(frag.ledgerPer === 'fragment' && frag.atpNet === -0.5 && frag.atpSpent === 0.5, `F should count per fragment, half an ATP spent: ${JSON.stringify({ ledgerPer: frag.ledgerPer, atpNet: frag.atpNet, atpSpent: frag.atpSpent })}`);
      await h.page.keyboard.press('g');
      const glu = await until(h, (x) => x.ledgerPer === 'glucose', 5_000);
      expect(glu.ledgerPer === 'glucose' && glu.atpNet === -1, `G should count per glucose again: ${JSON.stringify({ ledgerPer: glu.ledgerPer, atpNet: glu.atpNet })}`);
      await h.page.keyboard.press('Space');
      const on = await until(h, (x) => x.playing === true, 5_000);
      expect(on.playing === true, 'Space should start the run');
      await h.page.keyboard.press('Space');
      const off = await until(h, (x) => x.playing === false, 5_000);
      expect(off.playing === false, 'Space again should pause it');
      await h.page.keyboard.press('Home');
      const home = await until(h, (x) => x.step === 0 && x.t === 0, 5_000);
      expect(home.step === 0 && home.t === 0 && home.playing === false, `Home should reset the walk: ${JSON.stringify({ step: home.step, t: home.t, playing: home.playing })}`);
    }],
    ['reset-puts-everything-back', async (h) => {
      const slider = (name) => h.stage.getByRole('slider', { name, exact: true });
      await h.button(/^Per fragment/).click();
      for (const [name, v] of [['Knock out', 3], ['ATP', 9], ['AMP', 0.5], ['Citrate', 1]]) {
        await slider(name).fill(String(v));
        await atValue(h, slider(name), v);
      }
      await h.button(/^Step forward/).click();
      const moved = await until(h, (x) => x.step === 1 && x.ledgerPer === 'fragment' && x.knockedOut === 'phosphofructokinase' && x.atpMM === 9 && x.ampMM === 0.5 && x.citrateMM === 1, 5_000);
      expect(moved.step === 1 && moved.ledgerPer === 'fragment' && moved.knockedOut === 'phosphofructokinase' && moved.atpMM === 9 && moved.ampMM === 0.5 && moved.citrateMM === 1, `every control should have moved: ${JSON.stringify({ step: moved.step, ledgerPer: moved.ledgerPer, knockedOut: moved.knockedOut, atpMM: moved.atpMM, ampMM: moved.ampMM, citrateMM: moved.citrateMM })}`);
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.step === 0 && x.ledgerPer === 'glucose' && x.knockedOut === null && x.atpMM === 3, 5_000);
      expect(d.step === 0 && d.t === 0 && d.playing === false && d.ledgerPer === 'glucose' && d.atpNet === 0, `Reset left ${JSON.stringify({ step: d.step, t: d.t, playing: d.playing, ledgerPer: d.ledgerPer, atpNet: d.atpNet })}`);
      expect(d.atpMM === 3 && d.ampMM === 0.1 && d.citrateMM === 0.2 && d.committedStepOpen === true && d.closedBy === null, `Reset left the committed step's levels at ${JSON.stringify({ atpMM: d.atpMM, ampMM: d.ampMM, citrateMM: d.citrateMM, committedStepOpen: d.committedStepOpen })}`);
      expect(d.knockedOut === null && d.accumulating === null && d.drainedAway.length === 0, `Reset left a knock-out: ${JSON.stringify({ knockedOut: d.knockedOut, accumulating: d.accumulating, drainedAway: d.drainedAway })}`);
      // And the controls say so, not only describe(): each range's own value, and which ledger button is down.
      for (const [name, v] of [['Knock out', 0], ['ATP', 3], ['AMP', 0.1], ['Citrate', 0.2]]) {
        const got = await atValue(h, slider(name), v);
        expect(got === String(v), `Reset should put the ${name} range back to ${v}: it reads ${got}`);
      }
      expect((await h.button(/^Per glucose/).getAttribute('aria-pressed')) === 'true', 'Reset should press Per glucose again');
    }],
  ],

  // Chapter 8, Figure 8.1. The fields asserted are the brief's — missingLayerLines and matchesPhotograph
  // for the photograph, pairFits and chargaffHolds for the pairs — each after the control that should move
  // it. The canvas is drawn from the same model describe() reports, so these hold the model; the frames
  // are what show the pattern.
  'helix-lab': [
    ['opens-on-one-strand-off-the-photograph', async (h) => {
      const d = await h.describe();
      expect(d.scene === 'photograph' && d.strands === 1 && d.measurementsShown === true, `it should open on the photograph, one strand, the measurements shown: ${JSON.stringify({ scene: d.scene, strands: d.strands, measurementsShown: d.measurementsShown })}`);
      expect(Array.isArray(d.missingLayerLines) && d.missingLayerLines.length === 0 && d.matchesPhotograph === false, `one strand should silence no row and match nothing: ${JSON.stringify({ missingLayerLines: d.missingLayerLines, matchesPhotograph: d.matchesPhotograph })}`);
      expect(d.pitchNm === 2.8 && d.basesPerTurn === 7 && d.radiusNm === 0.6, `it should open off every B value: ${JSON.stringify({ pitchNm: d.pitchNm, basesPerTurn: d.basesPerTurn, radiusNm: d.radiusNm })}`);
      expect(await h.stage.getByRole('slider', { name: 'Offset' }).isDisabled(), 'the offset should be disabled while there is one strand to offset from');
      // The rise range holds 20 − N, so what a screen reader hears is only right if the figure says it.
      const spoken = await h.stage.getByRole('slider', { name: 'Rise per base' }).getAttribute('aria-valuetext');
      expect(spoken === '0.40 nanometres a base, 7 bases a turn', `the rise should say its length and its count, not its rung: ${JSON.stringify(spoken)}`);
    }],
    ['a-second-strand-half-a-turn-along-silences-the-odd-rows', async (h) => {
      const strands = h.stage.getByRole('slider', { name: 'Strands' });
      await strands.fill('2');
      await atValue(h, strands, 2);
      const d = await until(h, (x) => x.strands === 2, 5_000);
      expect(d.strands === 2 && d.offsetTurns === 0.5, `two strands, half a turn apart: ${JSON.stringify({ strands: d.strands, offsetTurns: d.offsetTurns })}`);
      expect(JSON.stringify(d.missingLayerLines) === '[1,3,5,7,9]', `half a turn apart should silence every odd row: ${JSON.stringify(d.missingLayerLines)}`);
      expect(d.matchesPhotograph === false, 'two strands at the opening values should not match the photograph');
    }],
    ['the-b-values-match-the-photograph', async (h) => {
      for (const [name, value] of [['Pitch', 3.4], ['Rise per base', 10], ['Radius', 1], ['Offset', 6]]) {
        const s = h.stage.getByRole('slider', { name });
        await s.fill(String(value));
        await atValue(h, s, value);
      }
      const d = await until(h, (x) => x.matchesPhotograph === true, 5_000);
      expect(d.matchesPhotograph === true && JSON.stringify(d.missingLayerLines) === '[4]', `the B values should silence row 4 alone and match: ${JSON.stringify({ missingLayerLines: d.missingLayerLines, matchesPhotograph: d.matchesPhotograph })}`);
      expect(d.pitchNm === 3.4 && d.basesPerTurn === 10 && d.riseNm === 0.34 && d.radiusNm === 1 && d.offsetTurns === 0.375, `the controls should have reached the B values: ${JSON.stringify({ pitchNm: d.pitchNm, basesPerTurn: d.basesPerTurn, riseNm: d.riseNm, radiusNm: d.radiusNm, offsetTurns: d.offsetTurns })}`);
      expect(near(d.layerLineSpacingPerNm, 0.294, 0.0005) && near(d.meridionalPerNm, 2.941, 0.0005), `rows every 1/3.4 and the arc at 1/0.34 per nm: ${JSON.stringify({ layerLineSpacingPerNm: d.layerLineSpacingPerNm, meridionalPerNm: d.meridionalPerNm })}`);
    }],
    ['one-strand-or-three-lose-the-match', async (h) => {
      const strands = h.stage.getByRole('slider', { name: 'Strands' });
      await strands.fill('1');
      await atValue(h, strands, 1);
      const one = await until(h, (x) => x.strands === 1, 5_000);
      expect(one.missingLayerLines.length === 0 && one.matchesPhotograph === false, `one strand at the B values should still silence no row: ${JSON.stringify({ missingLayerLines: one.missingLayerLines, matchesPhotograph: one.matchesPhotograph })}`);
      await strands.fill('3');
      await atValue(h, strands, 3);
      const three = await until(h, (x) => x.strands === 3, 5_000);
      expect(three.matchesPhotograph === false && JSON.stringify(three.missingLayerLines) === '[1,7,9]', `three strands 3/8 of a turn apart should silence rows 1, 7 and 9 and not match: ${JSON.stringify({ missingLayerLines: three.missingLayerLines, matchesPhotograph: three.matchesPhotograph })}`);
      await strands.fill('2');
      await atValue(h, strands, 2);
      const two = await until(h, (x) => x.strands === 2 && x.matchesPhotograph === true, 5_000);
      expect(two.matchesPhotograph === true, 'back at two strands it should match again');
    }],
    ['the-offset-chooses-which-rows-go', async (h) => {
      const offset = h.stage.getByRole('slider', { name: 'Offset' });
      for (const [v, rows] of [[5, '[5,8]'], [8, '[1,3,5,7,9]'], [4, '[2,6]'], [7, '[1,8]'], [6, '[4]']]) {
        await offset.fill(String(v));
        await atValue(h, offset, v);
        const d = await until(h, (x) => x.offsetTurns === v / 16, 5_000);
        expect(JSON.stringify(d.missingLayerLines) === rows, `at ${v}/16 of a turn the rows missing should be ${rows}: ${JSON.stringify(d.missingLayerLines)}`);
        expect(d.matchesPhotograph === (v === 6), `only 3/8 of a turn should match: ${v}/16 gave ${d.matchesPhotograph}`);
      }
    }],
    ['each-b-value-is-needed', async (h) => {
      for (const [name, off, back, field] of [['Pitch', 3.8, 3.4, 'pitchNm'], ['Rise per base', 11, 10, 'basesPerTurn'], ['Radius', 0.6, 1, 'radiusNm']]) {
        const s = h.stage.getByRole('slider', { name });
        await s.fill(String(off));
        await atValue(h, s, off);
        const d = await until(h, (x) => x.matchesPhotograph === false, 5_000);
        expect(d.matchesPhotograph === false && JSON.stringify(d.missingLayerLines) === '[4]', `moving ${name} alone should lose the match with row 4 still missing: ${JSON.stringify({ [field]: d[field], missingLayerLines: d.missingLayerLines, matchesPhotograph: d.matchesPhotograph })}`);
        await s.fill(String(back));
        await atValue(h, s, back);
        const e = await until(h, (x) => x.matchesPhotograph === true, 5_000);
        expect(e.matchesPhotograph === true, `putting ${name} back should restore the match: ${JSON.stringify({ [field]: e[field] })}`);
      }
    }],
    ['the-photograph-keys', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('ArrowUp');
      await h.page.keyboard.press('ArrowUp');
      const up = await until(h, (x) => x.pitchNm === 3.6, 5_000);
      expect(up.pitchNm === 3.6 && up.matchesPhotograph === false, `two presses of the up arrow should lengthen the pitch to 3.6 nm and lose the match: ${JSON.stringify({ pitchNm: up.pitchNm, matchesPhotograph: up.matchesPhotograph })}`);
      await h.page.keyboard.press('ArrowDown');
      await h.page.keyboard.press('ArrowDown');
      const down = await until(h, (x) => x.pitchNm === 3.4, 5_000);
      expect(down.pitchNm === 3.4 && down.matchesPhotograph === true, `two presses of the down arrow should bring it back: ${JSON.stringify({ pitchNm: down.pitchNm, matchesPhotograph: down.matchesPhotograph })}`);
      await h.page.keyboard.press('1');
      const one = await until(h, (x) => x.strands === 1, 5_000);
      expect(one.strands === 1 && one.missingLayerLines.length === 0, `1 should leave one strand: ${JSON.stringify({ strands: one.strands, missingLayerLines: one.missingLayerLines })}`);
      await h.page.keyboard.press('2');
      await until(h, (x) => x.strands === 2, 5_000);
      await h.page.keyboard.press('o');
      const o = await until(h, (x) => x.offsetTurns === 7 / 16, 5_000);
      expect(o.offsetTurns === 7 / 16 && JSON.stringify(o.missingLayerLines) === '[1,8]', `O should move the offset on to 7/16: ${JSON.stringify({ offsetTurns: o.offsetTurns, missingLayerLines: o.missingLayerLines })}`);
      await h.page.keyboard.press('m');
      const m = await until(h, (x) => x.measurementsShown === false, 5_000);
      expect(m.measurementsShown === false, 'M should hide the measurements');
      await h.page.keyboard.press('m');
      const m2 = await until(h, (x) => x.measurementsShown === true, 5_000);
      expect(m2.measurementsShown === true, 'M again should show them');
    }],
    ['two-purines-are-too-wide', async (h) => {
      await h.button(/^The pairs/).click();
      const d = await until(h, (x) => x.scene === 'pairs', 5_000);
      expect(d.scene === 'pairs' && d.leftBase === 'A' && d.rightBase === 'G' && d.pairType === 'purine-purine', `the pairs should open on adenine across from guanine: ${JSON.stringify({ scene: d.scene, leftBase: d.leftBase, rightBase: d.rightBase, pairType: d.pairType })}`);
      expect(d.pairFits === false && d.whyNot === 'too-wide' && d.pairWidthNm === 1.3 && d.hydrogenBonds === 0, `two purines should be too wide to fit: ${JSON.stringify({ pairFits: d.pairFits, whyNot: d.whyNot, pairWidthNm: d.pairWidthNm, hydrogenBonds: d.hydrogenBonds })}`);
      expect(await h.button(/^Add pair/).isDisabled(), 'Add pair should be disabled while the pair does not fit');
      expect(d.pairsBuilt === 0, `nothing should be built yet: ${d.pairsBuilt}`);
    }],
    ['adenine-across-from-thymine-fits-and-builds', async (h) => {
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      await right.fill('3');
      await atValue(h, right, 3);
      const d = await until(h, (x) => x.rightBase === 'T', 5_000);
      expect(d.pairFits === true && d.whyNot === null && d.hydrogenBonds === 2 && d.pairWidthNm === 1.1 && d.pairType === 'purine-pyrimidine', `A across from T should fit, two bonds at 1.1 nm: ${JSON.stringify({ pairFits: d.pairFits, whyNot: d.whyNot, hydrogenBonds: d.hydrogenBonds, pairWidthNm: d.pairWidthNm, pairType: d.pairType })}`);
      await h.button(/^Add pair/).click();
      const e = await until(h, (x) => x.pairsBuilt === 1, 5_000);
      expect(e.pairsBuilt === 1 && e.countA === 1 && e.countT === 1 && e.chargaffHolds === true, `one A·T pair should be built: ${JSON.stringify({ pairsBuilt: e.pairsBuilt, countA: e.countA, countT: e.countT, chargaffHolds: e.chargaffHolds })}`);
    }],
    ['guanine-across-from-cytosine-makes-three-bonds', async (h) => {
      const left = h.stage.getByRole('slider', { name: 'Left base' });
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      await left.fill('1');
      await atValue(h, left, 1);
      await right.fill('2');
      await atValue(h, right, 2);
      const d = await until(h, (x) => x.leftBase === 'G' && x.rightBase === 'C', 5_000);
      expect(d.pairFits === true && d.hydrogenBonds === 3 && d.pairWidthNm === 1.1, `G across from C should fit with three bonds at 1.1 nm: ${JSON.stringify({ pairFits: d.pairFits, hydrogenBonds: d.hydrogenBonds, pairWidthNm: d.pairWidthNm })}`);
      await h.button(/^Add pair/).click();
      const e = await until(h, (x) => x.pairsBuilt === 2, 5_000);
      expect(e.pairsBuilt === 2 && e.countG === 1 && e.countC === 1 && e.chargaffHolds === true, `a G·C pair should be built beside the A·T: ${JSON.stringify({ pairsBuilt: e.pairsBuilt, countG: e.countG, countC: e.countC, chargaffHolds: e.chargaffHolds })}`);
    }],
    ['the-wrong-partners-fail-for-their-own-reasons', async (h) => {
      const left = h.stage.getByRole('slider', { name: 'Left base' });
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      const cases = [
        [1, 3, 'G', 'T', 'no-hydrogen-bonds', 1.1],
        [3, 3, 'T', 'T', 'too-narrow', 0.9],
        [2, 3, 'C', 'T', 'too-narrow', 0.9],
        [0, 2, 'A', 'C', 'no-hydrogen-bonds', 1.1],
      ];
      for (const [l, r, L, R, why, width] of cases) {
        await left.fill(String(l));
        await atValue(h, left, l);
        await right.fill(String(r));
        await atValue(h, right, r);
        const d = await until(h, (x) => x.leftBase === L && x.rightBase === R, 5_000);
        expect(d.pairFits === false && d.whyNot === why && d.pairWidthNm === width && d.hydrogenBonds === 0, `${L} across from ${R} should fail as ${why} at ${width} nm: ${JSON.stringify({ pairFits: d.pairFits, whyNot: d.whyNot, pairWidthNm: d.pairWidthNm, hydrogenBonds: d.hydrogenBonds })}`);
        expect(await h.button(/^Add pair/).isDisabled(), `Add pair should be disabled for ${L} across from ${R}`);
      }
    }],
    ['the-rare-form-breaks-the-watson-crick-pairs', async (h) => {
      const left = h.stage.getByRole('slider', { name: 'Left base' });
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      await left.fill('1');
      await atValue(h, left, 1);
      await right.fill('2');
      await atValue(h, right, 2);
      await until(h, (x) => x.leftBase === 'G' && x.rightBase === 'C' && x.pairFits === true, 5_000);
      await h.button(/^Rare form/).click();
      const g = await until(h, (x) => x.tautomer === 'rare', 5_000);
      expect(g.pairFits === false && g.whyNot === 'rare-tautomer', `rare guanine should not pair with cytosine: ${JSON.stringify({ tautomer: g.tautomer, pairFits: g.pairFits, whyNot: g.whyNot })}`);
      await left.fill('0');
      await atValue(h, left, 0);
      await right.fill('3');
      await atValue(h, right, 3);
      const t = await until(h, (x) => x.leftBase === 'A' && x.rightBase === 'T', 5_000);
      expect(t.pairFits === false && t.whyNot === 'rare-tautomer', `rare thymine should not pair with adenine: ${JSON.stringify({ pairFits: t.pairFits, whyNot: t.whyNot })}`);
      expect(await h.button(/^Add pair/).isDisabled(), 'Add pair should be disabled in the rare form');
      await h.button(/^Usual form/).click();
      const u = await until(h, (x) => x.tautomer === 'usual', 5_000);
      expect(u.pairFits === true, `back in the usual form A·T should fit again: ${JSON.stringify({ tautomer: u.tautomer, pairFits: u.pairFits, whyNot: u.whyNot })}`);
    }],
    // The rare form is one base's, never both, so it makes the mispair the prose describes: a rare G pairs
    // with T and a rare T with G, three bonds at the right width. Add pair stays off for it, by the button
    // and by the key, so the duplex keeps to Chargaff's rules. Ends back on A·T in the usual form.
    ['the-rare-form-pairs-with-the-wrong-partner', async (h) => {
      const left = h.stage.getByRole('slider', { name: 'Left base' });
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      await h.button(/^Rare form/).click();
      await until(h, (x) => x.tautomer === 'rare', 5_000);
      for (const [l, r, L, R] of [[1, 3, 'G', 'T'], [3, 1, 'T', 'G']]) {
        await left.fill(String(l));
        await atValue(h, left, l);
        await right.fill(String(r));
        await atValue(h, right, r);
        const d = await until(h, (x) => x.leftBase === L && x.rightBase === R, 5_000);
        expect(d.pairFits === true && d.whyNot === null && d.hydrogenBonds === 3 && d.pairWidthNm === 1.1 && d.mispair === true, `in the rare form ${L} across from ${R} should pair with three bonds at 1.1 nm, as a mispair: ${JSON.stringify({ pairFits: d.pairFits, whyNot: d.whyNot, hydrogenBonds: d.hydrogenBonds, pairWidthNm: d.pairWidthNm, mispair: d.mispair })}`);
        expect(await h.button(/^Add pair/).isDisabled(), `Add pair should stay off for the mispair ${L}·${R}`);
      }
      // Keys are handled in order, so once T has switched back to the usual form, a pair that Enter added
      // would already be counted.
      const before = (await h.describe()).pairsBuilt;
      await h.focusable().focus();
      await h.page.keyboard.press('Enter');
      await h.page.keyboard.press('t');
      const u = await until(h, (x) => x.tautomer === 'usual', 5_000);
      expect(u.pairsBuilt === before, `Enter should not add the mispair: ${before} pairs before it, ${u.pairsBuilt} after`);
      expect(u.pairFits === false && u.whyNot === 'no-hydrogen-bonds' && u.mispair === false, `in the usual form T across from G should not pair: ${JSON.stringify({ pairFits: u.pairFits, whyNot: u.whyNot, mispair: u.mispair })}`);
      await left.fill('0');
      await atValue(h, left, 0);
      await right.fill('3');
      await atValue(h, right, 3);
      await until(h, (x) => x.leftBase === 'A' && x.rightBase === 'T' && x.pairFits === true, 5_000);
    }],
    ['parallel-strands-put-the-sugar-on-the-wrong-side', async (h) => {
      await h.button(/^Parallel/).click();
      const at = await until(h, (x) => x.strandsRun === 'parallel', 5_000);
      expect(at.pairFits === false && at.whyNot === 'sugars-misplaced' && at.hydrogenBonds === 2, `run parallel, A·T still makes two bonds but its sugar is misplaced: ${JSON.stringify({ strandsRun: at.strandsRun, pairFits: at.pairFits, whyNot: at.whyNot, hydrogenBonds: at.hydrogenBonds })}`);
      const left = h.stage.getByRole('slider', { name: 'Left base' });
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      await left.fill('1');
      await atValue(h, left, 1);
      await right.fill('2');
      await atValue(h, right, 2);
      const gc = await until(h, (x) => x.leftBase === 'G' && x.rightBase === 'C', 5_000);
      expect(gc.pairFits === false && gc.whyNot === 'sugars-misplaced', `run parallel, G·C should not fit either: ${JSON.stringify({ pairFits: gc.pairFits, whyNot: gc.whyNot })}`);
      await h.button(/^Antiparallel/).click();
      const back = await until(h, (x) => x.strandsRun === 'antiparallel', 5_000);
      expect(back.pairFits === true && back.hydrogenBonds === 3, `antiparallel again, G·C should fit: ${JSON.stringify({ pairFits: back.pairFits, hydrogenBonds: back.hydrogenBonds })}`);
    }],
    ['the-pair-keys', async (h) => {
      const left = h.stage.getByRole('slider', { name: 'Left base' });
      const right = h.stage.getByRole('slider', { name: 'Right base' });
      await left.fill('0');
      await atValue(h, left, 0);
      await right.fill('3');
      await atValue(h, right, 3);
      await until(h, (x) => x.leftBase === 'A' && x.rightBase === 'T' && x.pairFits === true, 5_000);
      await h.focusable().focus();
      await h.page.keyboard.press('Enter');
      const d = await until(h, (x) => x.pairsBuilt === 3, 5_000);
      expect(d.pairsBuilt === 3 && d.countA === 2 && d.countT === 2 && d.countG === 1 && d.countC === 1 && d.chargaffHolds === true, `Enter should add a second A·T: ${JSON.stringify({ pairsBuilt: d.pairsBuilt, countA: d.countA, countT: d.countT, countG: d.countG, countC: d.countC, chargaffHolds: d.chargaffHolds })}`);
      await h.page.keyboard.press('t');
      const rare = await until(h, (x) => x.tautomer === 'rare', 5_000);
      expect(rare.whyNot === 'rare-tautomer', `T should switch to the rare form: ${JSON.stringify({ tautomer: rare.tautomer, whyNot: rare.whyNot })}`);
      await h.page.keyboard.press('t');
      await until(h, (x) => x.tautomer === 'usual', 5_000);
      await h.page.keyboard.press('p');
      const par = await until(h, (x) => x.strandsRun === 'parallel', 5_000);
      expect(par.whyNot === 'sugars-misplaced', `P should run the strands parallel: ${JSON.stringify({ strandsRun: par.strandsRun, whyNot: par.whyNot })}`);
      await h.page.keyboard.press('p');
      await until(h, (x) => x.strandsRun === 'antiparallel', 5_000);
      await h.page.keyboard.press('ArrowRight');
      const aa = await until(h, (x) => x.rightBase === 'A', 5_000);
      expect(aa.rightBase === 'A' && aa.whyNot === 'too-wide', `the right arrow should move the right base on from T to A: ${JSON.stringify({ rightBase: aa.rightBase, whyNot: aa.whyNot })}`);
      await h.page.keyboard.press('s');
      await until(h, (x) => x.scene === 'photograph', 5_000);
      await h.page.keyboard.press('s');
      const back = await until(h, (x) => x.scene === 'pairs', 5_000);
      expect(back.scene === 'pairs' && back.pairsBuilt === 3, `S twice should come back to the pairs with the duplex kept: ${JSON.stringify({ scene: back.scene, pairsBuilt: back.pairsBuilt })}`);
    }],
    ['reset-puts-everything-back-and-keeps-the-scene', async (h) => {
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.pairsBuilt === 0 && x.rightBase === 'G' && x.strands === 1, 5_000);
      expect(d.scene === 'pairs', `Reset should keep the scene: ${d.scene}`);
      expect(d.leftBase === 'A' && d.rightBase === 'G' && d.tautomer === 'usual' && d.strandsRun === 'antiparallel' && d.pairFits === false, `Reset left the pair at ${JSON.stringify({ leftBase: d.leftBase, rightBase: d.rightBase, tautomer: d.tautomer, strandsRun: d.strandsRun, pairFits: d.pairFits })}`);
      expect(d.pairsBuilt === 0 && d.countA === 0 && d.countT === 0 && d.countG === 0 && d.countC === 0 && d.chargaffHolds === true && d.t === 0, `Reset left the duplex at ${JSON.stringify({ pairsBuilt: d.pairsBuilt, countA: d.countA, countT: d.countT, countG: d.countG, countC: d.countC, t: d.t })}`);
      expect(d.strands === 1 && d.pitchNm === 2.8 && d.basesPerTurn === 7 && d.radiusNm === 0.6 && d.offsetTurns === 0.5 && d.measurementsShown === true, `Reset left the helix at ${JSON.stringify({ strands: d.strands, pitchNm: d.pitchNm, basesPerTurn: d.basesPerTurn, radiusNm: d.radiusNm, offsetTurns: d.offsetTurns, measurementsShown: d.measurementsShown })}`);
      expect(d.matchesPhotograph === false && d.missingLayerLines.length === 0, `Reset should leave no match: ${JSON.stringify({ matchesPhotograph: d.matchesPhotograph, missingLayerLines: d.missingLayerLines })}`);
      await h.button(/^The photograph/).click();
      await until(h, (x) => x.scene === 'photograph', 5_000);
      const shown = await atValue(h, h.stage.getByRole('slider', { name: 'Strands' }), 1);
      expect(shown === '1', `the Strands control should read 1 after Reset: ${shown}`);
      expect(await h.stage.getByRole('slider', { name: 'Offset' }).isDisabled(), 'the offset should be disabled again with one strand');
    }],
  ],
  // Figure 8.2. The fields worth asserting are the computed ones — ruledOut, matchesData and strandBands —
  // and never the ones a button sets. FIGURES.md's invariant: ruledOut does not contain 'dispersive' at
  // generation 1, because one generation cannot tell the dispersive scheme from the semiconservative one.
  'meselson-stahl': (() => {
    // [name, g/cm3, share] for each band, lightest first.
    const bandsAre = (list, want) => Array.isArray(list) && list.length === want.length
      && list.every((b, i) => b.name === want[i][0] && near(b.densityGcm3, want[i][1], 1e-6) && near(b.fraction, want[i][2], 1e-9));
    const brief = (list) => JSON.stringify((list || []).map((b) => [b.name, b.densityGcm3, b.fraction]));
    const toGeneration = async (h, g) => {
      const s = h.stage.getByRole('slider', { name: 'Generation' });
      await s.fill(String(g));
      await atValue(h, s, g);
      return until(h, (x) => x.generation === g, 5_000);
    };
    const toScheme = async (h, re, id) => {
      await h.button(re).click();
      return until(h, (x) => x.scheme === id, 5_000);
    };
    return [
      ['opens-at-generation-0-on-one-heavy-band', async (h) => {
        const d = await h.describe();
        expect(d.scheme === 'semiconservative' && d.generation === 0 && d.dataShown === false && d.heated === false, `it should open at generation 0, semiconservative, the data hidden, not heated: ${JSON.stringify({ scheme: d.scheme, generation: d.generation, dataShown: d.dataShown, heated: d.heated })}`);
        expect(bandsAre(d.bands, [['heavy', 1.724, 1]]) && d.bandCount === 1, `one heavy band at 1.724: ${brief(d.bands)}`);
        expect(d.matchesData === true && Array.isArray(d.ruledOut) && d.ruledOut.length === 0, `generation 0 should match and rule nothing out: ${JSON.stringify({ matchesData: d.matchesData, ruledOut: d.ruledOut })}`);
        expect(Array.isArray(d.strandBands) && d.strandBands.length === 0 && d.strandsMatchData === null, `no strand bands before heating: ${JSON.stringify({ strandBands: d.strandBands, strandsMatchData: d.strandsMatchData })}`);
        expect(await h.button(/^Semiconservative/).getAttribute('aria-pressed') === 'true', 'the Semiconservative button should be the one pressed');
      }],
      ['semiconservative-makes-hybrid-then-hybrid-and-light', async (h) => {
        const one = await toGeneration(h, 1);
        expect(bandsAre(one.bands, [['hybrid', 1.717, 1]]) && one.matchesData === true, `generation 1 should be one hybrid band, as photographed: ${brief(one.bands)}`);
        expect(JSON.stringify(one.ruledOut) === '["conservative"]', `generation 1 rules out the conservative scheme alone: ${JSON.stringify(one.ruledOut)}`);
        const two = await toGeneration(h, 2);
        expect(bandsAre(two.bands, [['light', 1.71, 0.5], ['hybrid', 1.717, 0.5]]) && two.matchesData === true, `generation 2 should be light and hybrid, half each: ${brief(two.bands)}`);
        expect(JSON.stringify(two.ruledOut) === '["conservative","dispersive"]', `generation 2 rules out both rivals: ${JSON.stringify(two.ruledOut)}`);
        const four = await toGeneration(h, 4);
        expect(bandsAre(four.bands, [['light', 1.71, 0.875], ['hybrid', 1.717, 0.125]]) && four.matchesData === true, `generation 4 should be seven-eighths light: ${brief(four.bands)}`);
      }],
      ['conservative-parts-from-the-photograph-at-generation-1', async (h) => {
        await toScheme(h, /^Conservative/, 'conservative');
        const d = await toGeneration(h, 1);
        expect(bandsAre(d.bands, [['light', 1.71, 0.5], ['heavy', 1.724, 0.5]]) && d.bandCount === 2, `conservative copying at generation 1 should give light and heavy, half each: ${brief(d.bands)}`);
        expect(d.matchesData === false && bandsAre(d.observedBands, [['hybrid', 1.717, 1]]), `it should not match the one hybrid band photographed: ${JSON.stringify({ matchesData: d.matchesData, observedBands: brief(d.observedBands) })}`);
        expect(JSON.stringify(d.ruledOut) === '["conservative"]', `ruledOut at generation 1 should be the conservative scheme alone: ${JSON.stringify(d.ruledOut)}`);
      }],
      ['dispersive-survives-generation-1-and-fails-at-2', async (h) => {
        const one = await toScheme(h, /^Dispersive/, 'dispersive');
        expect(one.generation === 1 && bandsAre(one.bands, [['hybrid', 1.717, 1]]) && one.matchesData === true, `dispersive copying at generation 1 should give the photograph's one hybrid band: ${brief(one.bands)}`);
        expect(!one.ruledOut.includes('dispersive'), `one generation is not enough to rule out the dispersive scheme: ${JSON.stringify(one.ruledOut)}`);
        const two = await toGeneration(h, 2);
        expect(bandsAre(two.bands, [['intermediate', 1.7135, 1]]) && two.matchesData === false, `at generation 2 one intermediate band at 1.710 + 0.014/4: ${brief(two.bands)}`);
        expect(two.ruledOut.includes('dispersive') && two.ruledOut.includes('conservative'), `generation 2 rules the dispersive scheme out: ${JSON.stringify(two.ruledOut)}`);
        const four = await toGeneration(h, 4);
        expect(bandsAre(four.bands, [['intermediate', 1.710875, 1]]), `at generation 4 the one band sits at 1.710 + 0.014/16: ${brief(four.bands)}`);
      }],
      ['heat-tells-dispersive-from-the-others-but-not-conservative-from-semiconservative', async (h) => {
        await toGeneration(h, 1);
        await h.button(/^Heat/).click();
        const disp = await until(h, (x) => x.heated === true, 5_000);
        expect(disp.scheme === 'dispersive' && bandsAre(disp.strandBands, [['intermediate', 1.7325, 1]]), `heated dispersive DNA should give one intermediate strand band: ${brief(disp.strandBands)}`);
        expect(bandsAre(disp.observedStrandBands, [['light', 1.725, 0.5], ['heavy', 1.74, 0.5]]) && disp.strandsMatchData === false, `the 1958 heated DNA gave light and heavy strands, which dispersive copying does not: ${JSON.stringify({ observedStrandBands: brief(disp.observedStrandBands), strandsMatchData: disp.strandsMatchData })}`);
        expect(bandsAre(disp.bands, [['hybrid', 1.717, 1]]) && disp.matchesData === true && JSON.stringify(disp.ruledOut) === '["conservative"]', `heat should change neither the bands before it nor what is ruled out: ${JSON.stringify({ bands: brief(disp.bands), matchesData: disp.matchesData, ruledOut: disp.ruledOut })}`);
        const cons = await toScheme(h, /^Conservative/, 'conservative');
        expect(cons.heated === true && bandsAre(cons.strandBands, [['light', 1.725, 0.5], ['heavy', 1.74, 0.5]]) && cons.strandsMatchData === true, `heated conservative DNA at generation 1 should also give light and heavy strands, half each: ${brief(cons.strandBands)}`);
        expect(near(cons.strandBands[1].densityGcm3 - cons.strandBands[0].densityGcm3, 0.015, 1e-9), `the two strand bands should be 0.015 g/cm3 apart: ${brief(cons.strandBands)}`);
        expect(cons.matchesData === false && JSON.stringify(cons.ruledOut) === '["conservative"]', `heat does not rescue the conservative scheme: ${JSON.stringify({ matchesData: cons.matchesData, ruledOut: cons.ruledOut })}`);
        const semi = await toScheme(h, /^Semiconservative/, 'semiconservative');
        expect(bandsAre(semi.strandBands, [['light', 1.725, 0.5], ['heavy', 1.74, 0.5]]) && semi.strandsMatchData === true && semi.matchesData === true, `heated hybrid DNA should give light and heavy strands, as in 1958: ${brief(semi.strandBands)}`);
      }],
      ['heat-at-generations-0-and-2-has-no-1958-counterpart', async (h) => {
        const zero = await toGeneration(h, 0);
        expect(zero.heated === true && bandsAre(zero.strandBands, [['heavy', 1.74, 1]]), `heated generation 0 should be all heavy strands at 1.740: ${brief(zero.strandBands)}`);
        expect(zero.strandsMatchData === null && zero.observedStrandBands.length === 0, `no heated DNA was photographed at generation 0: ${JSON.stringify({ strandsMatchData: zero.strandsMatchData, observedStrandBands: zero.observedStrandBands })}`);
        const two = await toGeneration(h, 2);
        expect(bandsAre(two.strandBands, [['light', 1.725, 0.75], ['heavy', 1.74, 0.25]]) && two.strandsMatchData === null, `heated generation 2 should be three-quarters light strands: ${brief(two.strandBands)}`);
        await h.button(/^Heat/).click();
        const cool = await until(h, (x) => x.heated === false, 5_000);
        expect(cool.heated === false && cool.strandBands.length === 0 && cool.strandsMatchData === null, `pressing Heat again should put the strands back together: ${JSON.stringify({ heated: cool.heated, strandBands: cool.strandBands })}`);
      }],
      ['the-1958-data-show-and-change-no-verdict', async (h) => {
        const before = await h.describe();
        await h.button(/^Show the 1958 data/).click();
        const on = await until(h, (x) => x.dataShown === true, 5_000);
        expect(on.dataShown === true && on.matchesData === before.matchesData && JSON.stringify(on.ruledOut) === JSON.stringify(before.ruledOut), `showing the data should change no computed field: ${JSON.stringify({ matchesData: on.matchesData, ruledOut: on.ruledOut })}`);
        expect(await h.button(/^Show the 1958 data/).getAttribute('aria-pressed') === 'true', 'the data button should say it is pressed');
        await h.button(/^Show the 1958 data/).click();
        const off = await until(h, (x) => x.dataShown === false, 5_000);
        expect(off.dataShown === false, 'pressing it again should hide the data');
      }],
      ['the-keys', async (h) => {
        await h.focusable().focus();
        await h.page.keyboard.press('ArrowRight');
        const three = await until(h, (x) => x.generation === 3, 5_000);
        expect(three.generation === 3, `the right arrow should step on to generation 3: ${three.generation}`);
        await h.page.keyboard.press('ArrowLeft');
        await h.page.keyboard.press('ArrowLeft');
        const one = await until(h, (x) => x.generation === 1, 5_000);
        expect(one.generation === 1, `two presses of the left arrow should step back to generation 1: ${one.generation}`);
        await h.page.keyboard.press('4');
        await until(h, (x) => x.generation === 4, 5_000);
        await h.page.keyboard.press('1');
        const back = await until(h, (x) => x.generation === 1, 5_000);
        expect(back.generation === 1, `the number keys should choose the generation: ${back.generation}`);
        await h.page.keyboard.press('s');
        const cons = await until(h, (x) => x.scheme === 'conservative', 5_000);
        expect(cons.scheme === 'conservative' && cons.matchesData === false, `S should move on to the conservative scheme: ${cons.scheme}`);
        await h.page.keyboard.press('s');
        const disp = await until(h, (x) => x.scheme === 'dispersive', 5_000);
        expect(disp.scheme === 'dispersive' && disp.matchesData === true, `S again should move on to the dispersive scheme: ${disp.scheme}`);
        expect(await h.button(/^Dispersive/).getAttribute('aria-pressed') === 'true', 'the Dispersive button should follow the key');
        await h.page.keyboard.press('h');
        const hot = await until(h, (x) => x.heated === true, 5_000);
        expect(hot.heated === true && hot.strandsMatchData === false, `H should heat the DNA: ${JSON.stringify({ heated: hot.heated, strandsMatchData: hot.strandsMatchData })}`);
        await h.page.keyboard.press('d');
        const shown = await until(h, (x) => x.dataShown === true, 5_000);
        expect(shown.dataShown === true, 'D should show the 1958 data');
      }],
      ['reset-puts-everything-back', async (h) => {
        await h.button(/^Reset/).click();
        const d = await until(h, (x) => x.generation === 0 && x.scheme === 'semiconservative' && x.heated === false && x.dataShown === false, 5_000);
        expect(d.scheme === 'semiconservative' && d.generation === 0 && d.heated === false && d.dataShown === false && d.t === 0, `Reset left ${JSON.stringify({ scheme: d.scheme, generation: d.generation, heated: d.heated, dataShown: d.dataShown, t: d.t })}`);
        expect(bandsAre(d.bands, [['heavy', 1.724, 1]]) && d.ruledOut.length === 0 && d.strandBands.length === 0, `Reset should leave the one heavy band: ${JSON.stringify({ bands: brief(d.bands), ruledOut: d.ruledOut, strandBands: d.strandBands })}`);
        const shownGen = await atValue(h, h.stage.getByRole('slider', { name: 'Generation' }), 0);
        expect(shownGen === '0', `the Generation control should read 0 after Reset: ${shownGen}`);
        expect(await h.button(/^Semiconservative/).getAttribute('aria-pressed') === 'true', 'the Semiconservative button should be pressed again after Reset');
        expect(await h.button(/^Heat/).getAttribute('aria-pressed') === 'false' && await h.button(/^Show the 1958 data/).getAttribute('aria-pressed') === 'false', 'Heat and the data should be off after Reset');
      }],
    ];
  })(),
  // Figure 8.3. Step is synchronous — it advances the fork a quarter of a second, or the chromosome's
  // clock one step, inside the click — so each step polls forkTimeS or elapsedMinutes for the press it
  // made and then reads the fields the brief names: laggingContinuous, forkStalled and
  // pyrophosphateReleased. The counts asserted exactly are the model's at the named time, and each is the
  // same on every run because the fork is a pure function of the presses.
  'replication-fork': [
    ['opens-on-the-fork-just-leaving-its-origin', async (h) => {
      const d = await h.describe();
      expect(d.scene === 'fork' && d.rule === 'as-they-are' && d.playing === false && d.forkTimeS === 0, `it should open on the fork under the rules as they are, unrun: ${JSON.stringify({ scene: d.scene, rule: d.rule, playing: d.playing, forkTimeS: d.forkTimeS })}`);
      expect(d.laggingContinuous === false && d.forkStalled === false && d.stalledBecause === null, `the lagging strand should be made in pieces and the fork free: ${JSON.stringify({ laggingContinuous: d.laggingContinuous, forkStalled: d.forkStalled, stalledBecause: d.stalledBecause })}`);
      expect(d.removed.length === 0 && d.chainTerminated === false && d.terminatedStrand === null, `every enzyme should be there and no chain stopped: ${JSON.stringify({ removed: d.removed, chainTerminated: d.chainTerminated })}`);
      expect(d.unwoundNt === 1500 && d.leadingLengthNt === 1480 && d.fragmentsStarted === 1 && d.primersInPlace === 2 && d.nicksUnsealed === 0, `the fork should open 1500 nt from its origin, with one fragment begun and a primer on each template: ${JSON.stringify({ unwoundNt: d.unwoundNt, leadingLengthNt: d.leadingLengthNt, fragmentsStarted: d.fragmentsStarted, primersInPlace: d.primersInPlace, nicksUnsealed: d.nicksUnsealed })}`);
      // One pyrophosphate per nucleotide joined, RNA or DNA: the leading strand's 1480, its primer
      // included, and the first fragment's 10-nucleotide primer.
      expect(d.pyrophosphateReleased === 1490, `the opening should count 1490 pyrophosphates: ${d.pyrophosphateReleased}`);
      expect(d.twistAheadTurns === 0, `no twist should have built up yet: ${d.twistAheadTurns}`);
    }],
    ['a-step-is-a-quarter-second-of-copying', async (h) => {
      const before = await h.describe();
      await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === before.forkTimeS + 0.25, 5_000);
      expect(d.forkTimeS === before.forkTimeS + 0.25 && d.playing === false, `one press should be a quarter of a second at the fork, and leave it paused: ${JSON.stringify({ forkTimeS: d.forkTimeS, playing: d.playing })}`);
      expect(d.unwoundNt === before.unwoundNt + 250 && d.leadingLengthNt === before.leadingLengthNt + 250, `at 1000 nt/s a quarter-second opens 250 nt, and the leading strand keeps up: ${JSON.stringify({ unwoundNt: d.unwoundNt, leadingLengthNt: d.leadingLengthNt })}`);
      expect(d.pyrophosphateReleased >= before.pyrophosphateReleased + 250, `every nucleotide the leading strand gained should release a pyrophosphate: ${before.pyrophosphateReleased} -> ${d.pyrophosphateReleased}`);
      expect(d.twistAheadTurns > 0 && d.forkStalled === false, `opening the helix should push turns ahead of it, which the topoisomerase keeps down: ${JSON.stringify({ twistAheadTurns: d.twistAheadTurns, forkStalled: d.forkStalled })}`);
    }],
    ['a-run-makes-new-fragments-and-pause-stops-it', async (h) => {
      const before = await h.describe();
      await ensureRunning(h);
      const d = await until(h, (x) => x.fragmentsStarted > before.fragmentsStarted && x.unwoundNt >= before.unwoundNt + 1000, 60_000);
      await h.button(/^Pause/).click();
      const p = await until(h, (x) => x.playing === false, 5_000);
      expect(d.unwoundNt >= before.unwoundNt + 1000, `a run should move the fork on at least 1000 nt: ${before.unwoundNt} -> ${d.unwoundNt} at t=${d.t}`);
      expect(p.playing === false, 'Pause should stop the run');
      expect(p.fragmentsStarted > before.fragmentsStarted && p.laggingContinuous === false, `the lagging strand should have begun new fragments: ${before.fragmentsStarted} -> ${p.fragmentsStarted}`);
      expect(p.pyrophosphateReleased > before.pyrophosphateReleased + 1000, `the count should rise with the strands made: ${before.pyrophosphateReleased} -> ${p.pyrophosphateReleased}`);
      expect(p.forkStalled === false && p.twistAheadTurns < 20, `with the topoisomerase working the twist should stay small: ${JSON.stringify({ forkStalled: p.forkStalled, twistAheadTurns: p.twistAheadTurns })}`);
    }],
    ['no-topoisomerase-and-the-twist-stalls-the-fork', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && x.unwoundNt === 1500, 5_000);
      await h.button(/^Topoisomerase/).click();
      const off = await until(h, (x) => x.removed.includes('topoisomerase'), 5_000);
      expect(off.removed.join() === 'topoisomerase', `the toggle should take the topoisomerase away: ${JSON.stringify(off.removed)}`);
      for (let i = 0; i < 6; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === 1.5, 5_000);
      // One turn for every ten pairs opened, and nothing taking them out: 1000 nt on, 100 turns.
      expect(d.forkStalled === true && d.stalledBecause === 'twist', `the fork should have stalled on its own twist: ${JSON.stringify({ forkStalled: d.forkStalled, stalledBecause: d.stalledBecause, twistAheadTurns: d.twistAheadTurns })}`);
      expect(d.twistAheadTurns === 100 && d.unwoundNt === 2500, `it should stall at 100 turns, 1000 nt on: ${JSON.stringify({ twistAheadTurns: d.twistAheadTurns, unwoundNt: d.unwoundNt })}`);
      expect(d.laggingContinuous === false, 'taking an enzyme away does not change the rule');
      await h.button(/^Step/).click();
      const still = await until(h, (x) => x.forkTimeS === 1.75, 5_000);
      expect(still.forkTimeS === 1.75 && still.unwoundNt === 2500 && still.forkStalled === true, `a stalled fork should open nothing more: ${JSON.stringify({ forkTimeS: still.forkTimeS, unwoundNt: still.unwoundNt })}`);
      await h.button(/^Topoisomerase/).click();
      await until(h, (x) => x.removed.length === 0, 5_000);
      await h.button(/^Step/).click();
      const back = await until(h, (x) => x.forkTimeS === 2, 5_000);
      expect(back.forkStalled === false && back.stalledBecause === null && back.unwoundNt > 2500 && back.twistAheadTurns < 100, `with the topoisomerase back the twist should come out and the fork move again: ${JSON.stringify({ forkStalled: back.forkStalled, unwoundNt: back.unwoundNt, twistAheadTurns: back.twistAheadTurns })}`);
    }],
    ['no-helicase-and-the-helix-stays-shut', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && x.removed.length === 0, 5_000);
      await h.button(/^Helicase/).click();
      await until(h, (x) => x.removed.includes('helicase'), 5_000);
      for (let i = 0; i < 2; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === 0.5, 5_000);
      expect(d.forkStalled === true && d.stalledBecause === 'no-helicase', `with no helicase the fork should not move: ${JSON.stringify({ forkStalled: d.forkStalled, stalledBecause: d.stalledBecause })}`);
      expect(d.unwoundNt === 1500 && d.twistAheadTurns === 0, `nothing more should be unwound, and no twist pushed ahead: ${JSON.stringify({ unwoundNt: d.unwoundNt, twistAheadTurns: d.twistAheadTurns })}`);
      expect(d.leadingLengthNt === 1480 && d.laggingContinuous === false, `the leading strand should wait at the shut helix: ${d.leadingLengthNt}`);
    }],
    ['no-primase-and-no-new-fragment-starts', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && x.removed.length === 0, 5_000);
      await h.button(/^Primase/).click();
      await until(h, (x) => x.removed.includes('primase'), 5_000);
      for (let i = 0; i < 8; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === 2, 5_000);
      expect(d.fragmentsStarted === 1, `with no primase no fragment after the first, primed at the opening, can start: ${d.fragmentsStarted}`);
      expect(d.unwoundNt === 3500 && d.leadingLengthNt === 3480 && d.forkStalled === false, `the fork, and the leading strand already primed, should carry on: ${JSON.stringify({ unwoundNt: d.unwoundNt, leadingLengthNt: d.leadingLengthNt, forkStalled: d.forkStalled })}`);
      expect(d.laggingContinuous === false, 'the lagging strand is still made in pieces; there is just no piece to make');
    }],
    ['no-ligase-leaves-the-nicks-and-changes-no-count', async (h) => {
      // The same twelve presses with every enzyme there, for the counts to hold the others against.
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && x.removed.length === 0, 5_000);
      for (let i = 0; i < 12; i += 1) await h.button(/^Step/).click();
      const full = await until(h, (x) => x.forkTimeS === 3, 5_000);
      expect(full.nicksUnsealed === 0 && full.fragmentsStarted >= 3, `with every enzyme there each join should be sealed: ${JSON.stringify({ nicksUnsealed: full.nicksUnsealed, fragmentsStarted: full.fragmentsStarted })}`);
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0, 5_000);
      await h.button(/^Ligase/).click();
      await until(h, (x) => x.removed.includes('ligase'), 5_000);
      for (let i = 0; i < 12; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === 3, 5_000);
      expect(d.nicksUnsealed >= 2 && d.fragmentsStarted === full.fragmentsStarted, `with no ligase the fragments should be made and left unjoined: ${JSON.stringify({ nicksUnsealed: d.nicksUnsealed, fragmentsStarted: d.fragmentsStarted })}`);
      expect(d.primersInPlace === full.primersInPlace, `the primers are still replaced: ${full.primersInPlace} -> ${d.primersInPlace}`);
      // E. coli's ligase is driven by NAD+, not by a nucleoside triphosphate, so sealing releases no
      // pyrophosphate: the count is the same with it or without it.
      expect(d.pyrophosphateReleased === full.pyrophosphateReleased, `sealing a nick should release no pyrophosphate: ${full.pyrophosphateReleased} with ligase, ${d.pyrophosphateReleased} without`);
      expect(d.laggingContinuous === false && d.forkStalled === false, 'the fork itself is unaffected');
    }],
    ['no-primer-removal-leaves-the-rna-in', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && x.removed.length === 0, 5_000);
      for (let i = 0; i < 12; i += 1) await h.button(/^Step/).click();
      const full = await until(h, (x) => x.forkTimeS === 3, 5_000);
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0, 5_000);
      await h.button(/^Primer removal/).click();
      await until(h, (x) => x.removed.includes('primer-removal'), 5_000);
      for (let i = 0; i < 12; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === 3, 5_000);
      expect(d.primersInPlace > full.primersInPlace, `the RNA primers should stay in the strand: ${full.primersInPlace} with removal, ${d.primersInPlace} without`);
      expect(d.nicksUnsealed >= 1, `a primer left in should leave its nick unsealable: ${d.nicksUnsealed}`);
      // Polymerase I's DNA in place of each primer is nucleotides joined, each with its pyrophosphate.
      expect(d.pyrophosphateReleased < full.pyrophosphateReleased, `with no primer replaced, fewer nucleotides should have been joined: ${full.pyrophosphateReleased} -> ${d.pyrophosphateReleased}`);
      expect(d.laggingContinuous === false, 'taking an enzyme away does not change the rule');
    }],
    ['a-chain-terminator-stops-the-strand-that-takes-it-in', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && x.removed.length === 0, 5_000);
      for (let i = 0; i < 3; i += 1) await h.button(/^Step/).click();
      await until(h, (x) => x.forkTimeS === 0.75, 5_000);
      await h.button(/^Add a chain terminator/).click();
      for (let i = 0; i < 3; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.forkTimeS === 1.5, 5_000);
      expect(d.chainTerminated === true && d.terminatedStrand === 'leading', `the leading strand, the next to add a nucleotide, should have taken it in and stopped: ${JSON.stringify({ chainTerminated: d.chainTerminated, terminatedStrand: d.terminatedStrand })}`);
      for (let i = 0; i < 2; i += 1) await h.button(/^Step/).click();
      const e = await until(h, (x) => x.forkTimeS === 2, 5_000);
      expect(e.leadingLengthNt === d.leadingLengthNt, `nothing can be added after a nucleotide with no 3′ hydroxyl: ${d.leadingLengthNt} -> ${e.leadingLengthNt}`);
      expect(e.unwoundNt > d.unwoundNt && e.pyrophosphateReleased > d.pyrophosphateReleased, `the fork, and the lagging strand, should carry on: ${JSON.stringify({ unwoundNt: e.unwoundNt, pyrophosphateReleased: e.pyrophosphateReleased })}`);
    }],
    ['either-hypothetical-rule-makes-the-lagging-strand-continuous', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.forkTimeS === 0 && !x.chainTerminated, 5_000);
      for (const [press, rule] of [[/^Strands run the same way/, 'same-direction'], [/^Polymerase can add at either end/, 'either-end']]) {
        await h.button(press).click();
        const d0 = await until(h, (x) => x.rule === rule, 5_000);
        expect(d0.rule === rule && d0.laggingContinuous === true && d0.fragmentsStarted === 0, `under ${rule} both new strands should be made continuously: ${JSON.stringify({ rule: d0.rule, laggingContinuous: d0.laggingContinuous, fragmentsStarted: d0.fragmentsStarted })}`);
        for (let i = 0; i < 6; i += 1) await h.button(/^Step/).click();
        const d = await until(h, (x) => x.forkTimeS === 1.5, 5_000);
        expect(d.fragmentsStarted === 0 && d.primersInPlace === 2 && d.laggingContinuous === true, `under ${rule} no fragment should ever start, only the one primer on each template: ${JSON.stringify({ fragmentsStarted: d.fragmentsStarted, primersInPlace: d.primersInPlace })}`);
        expect(d.leadingLengthNt === 2980 && d.pyrophosphateReleased > 2 * 2900, `both strands should grow with the fork: ${JSON.stringify({ leadingLengthNt: d.leadingLengthNt, pyrophosphateReleased: d.pyrophosphateReleased })}`);
      }
      await h.button(/^As they are/).click();
      const back = await until(h, (x) => x.rule === 'as-they-are', 5_000);
      expect(back.laggingContinuous === false && back.fragmentsStarted === 1 && back.unwoundNt === 1500, `the rules as they are should bring the fragments back, from a fresh fork: ${JSON.stringify({ laggingContinuous: back.laggingContinuous, fragmentsStarted: back.fragmentsStarted, unwoundNt: back.unwoundNt })}`);
    }],
    ['the-keys-step-change-the-rule-and-reset', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Enter');
      const d = await until(h, (x) => x.forkTimeS === 0.25, 5_000);
      expect(d.forkTimeS === 0.25 && d.unwoundNt === 1750, `Enter on the fork should step it: ${JSON.stringify({ forkTimeS: d.forkTimeS, unwoundNt: d.unwoundNt })}`);
      await h.page.keyboard.press('r');
      const r = await until(h, (x) => x.rule === 'same-direction', 5_000);
      expect(r.rule === 'same-direction' && r.laggingContinuous === true, `R should move to the next rule: ${r.rule}`);
      await h.page.keyboard.press('Home');
      const home = await until(h, (x) => x.rule === 'as-they-are' && x.forkTimeS === 0, 5_000);
      expect(home.rule === 'as-they-are' && home.forkTimeS === 0 && home.unwoundNt === 1500, `Home should reset: ${JSON.stringify({ rule: home.rule, forkTimeS: home.forkTimeS })}`);
    }],
    ['the-whole-chromosome-opens-on-e-coli', async (h) => {
      await h.button(/^Whole chromosome/).click();
      const d = await until(h, (x) => x.scene === 'chromosome', 5_000);
      expect(d.scene === 'chromosome' && d.organism === 'e-coli' && d.originCount === 1 && d.forkSpeedNtPerS === 1000, `the chromosome should open on E. coli, one origin, forks at 1000 nt/s: ${JSON.stringify({ scene: d.scene, organism: d.organism, originCount: d.originCount, forkSpeedNtPerS: d.forkSpeedNtPerS })}`);
      // 4.6 million bp copied by two forks at 1000 nt/s: 2300 s.
      expect(d.finishMinutes === 38.3 && d.elapsedMinutes === 0 && d.copiedPercent === 0, `it should finish at 38.3 min and start at none: ${JSON.stringify({ finishMinutes: d.finishMinutes, elapsedMinutes: d.elapsedMinutes, copiedPercent: d.copiedPercent })}`);
      const enzymes = await h.stage.getByRole('button', { name: /^Primase/ }).count();
      const origins = await h.stage.getByRole('button', { name: /^All origins/ }).count();
      expect(enzymes === 0 && origins === 1, `the scene should show its own controls and hide the fork's: ${enzymes} primase toggle(s), ${origins} origins choice(s)`);
    }],
    ['e-coli-is-copied-in-under-forty-minutes', async (h) => {
      for (let i = 0; i < 3; i += 1) await h.button(/^Step/).click();
      const d = await until(h, (x) => x.elapsedMinutes === 15, 5_000);
      expect(d.elapsedMinutes === 15 && near(d.copiedPercent, 39.1, 0.01), `three steps should be 15 min and 39.1 % copied: ${JSON.stringify({ elapsedMinutes: d.elapsedMinutes, copiedPercent: d.copiedPercent })}`);
      await ensureRunning(h);
      const end = await until(h, (x) => x.playing === false && x.copiedPercent === 100, 60_000);
      expect(end.playing === false && end.copiedPercent === 100 && end.elapsedMinutes === 38.3, `a run should stop at the finish, all copied at 38.3 min: ${JSON.stringify({ playing: end.playing, copiedPercent: end.copiedPercent, elapsedMinutes: end.elapsedMinutes })}`);
    }],
    ['human-chromosome-1-from-one-origin-takes-a-month', async (h) => {
      await h.button(/^Human chromosome 1/).click();
      const d = await until(h, (x) => x.organism === 'human-chr1', 5_000);
      // 249 million bp, two forks at 50 nt/s: 2.49 million s, 41,500 min, 28.8 days.
      expect(d.originCount === 1 && d.forkSpeedNtPerS === 50 && d.finishMinutes === 41500 && d.elapsedMinutes === 0, `one origin, forks at 50 nt/s, 41,500 min to finish, from the start: ${JSON.stringify({ originCount: d.originCount, forkSpeedNtPerS: d.forkSpeedNtPerS, finishMinutes: d.finishMinutes, elapsedMinutes: d.elapsedMinutes })}`);
      for (let i = 0; i < 2; i += 1) await h.button(/^Step/).click();
      const s = await until(h, (x) => x.elapsedMinutes === 8640, 5_000);
      expect(s.elapsedMinutes === 8640 && near(s.copiedPercent, 20.8, 0.01), `two steps should be six days and 20.8 % copied: ${JSON.stringify({ elapsedMinutes: s.elapsedMinutes, copiedPercent: s.copiedPercent })}`);
    }],
    ['all-its-origins-copy-it-in-eight-hours', async (h) => {
      await h.button(/^All origins/).click();
      const d = await until(h, (x) => x.origins === 'all', 5_000);
      expect(d.originCount === 1606 && d.finishMinutes === 480 && d.elapsedMinutes === 0 && d.copiedPercent === 0, `the chromosome's 1606 origins should finish it in 480 min, from the start: ${JSON.stringify({ originCount: d.originCount, finishMinutes: d.finishMinutes, elapsedMinutes: d.elapsedMinutes, copiedPercent: d.copiedPercent })}`);
      for (let i = 0; i < 3; i += 1) await h.button(/^Step/).click();
      const s = await until(h, (x) => x.elapsedMinutes === 180, 5_000);
      // From one origin, three hours copies 2 × 50 × 60 × 180 nt: 0.4 %.
      expect(s.elapsedMinutes === 180 && s.copiedPercent > 20 && s.copiedPercent < 100, `three hours with every origin should copy far more than one origin's 0.4 %: ${JSON.stringify({ elapsedMinutes: s.elapsedMinutes, copiedPercent: s.copiedPercent })}`);
      for (let i = 0; i < 5; i += 1) await h.button(/^Step/).click();
      const end = await until(h, (x) => x.elapsedMinutes === 480, 5_000);
      expect(end.elapsedMinutes === 480 && end.copiedPercent === 100, `eight steps should reach the finish with all of it copied: ${JSON.stringify({ elapsedMinutes: end.elapsedMinutes, copiedPercent: end.copiedPercent })}`);
      await h.button(/^Step/).click();
      const again = await until(h, (x) => x.elapsedMinutes === 0, 5_000);
      expect(again.elapsedMinutes === 0 && again.copiedPercent === 0, `a step at the finish should start the clock again: ${JSON.stringify({ elapsedMinutes: again.elapsedMinutes, copiedPercent: again.copiedPercent })}`);
    }],
    ['reset-puts-everything-back', async (h) => {
      await h.button(/^Fork/).click();
      await until(h, (x) => x.scene === 'fork', 5_000);
      await h.button(/^Ligase/).click();
      await h.button(/^Add a chain terminator/).click();
      for (let i = 0; i < 4; i += 1) await h.button(/^Step/).click();
      const changed = await until(h, (x) => x.forkTimeS === 1 && x.chainTerminated, 5_000);
      expect(changed.removed.includes('ligase') && changed.chainTerminated === true, `the state to reset should have been reached: ${JSON.stringify({ removed: changed.removed, chainTerminated: changed.chainTerminated })}`);
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.forkTimeS === 0 && x.removed.length === 0 && !x.chainTerminated, 5_000);
      expect(d.scene === 'fork' && d.rule === 'as-they-are' && d.playing === false && d.removed.length === 0 && d.chainTerminated === false, `Reset left ${JSON.stringify({ scene: d.scene, rule: d.rule, playing: d.playing, removed: d.removed, chainTerminated: d.chainTerminated })}`);
      expect(d.unwoundNt === 1500 && d.fragmentsStarted === 1 && d.primersInPlace === 2 && d.nicksUnsealed === 0 && d.pyrophosphateReleased === 1490, `Reset left the fork at ${JSON.stringify({ unwoundNt: d.unwoundNt, fragmentsStarted: d.fragmentsStarted, primersInPlace: d.primersInPlace, nicksUnsealed: d.nicksUnsealed, pyrophosphateReleased: d.pyrophosphateReleased })}`);
      expect(d.organism === 'e-coli' && d.origins === 'one' && d.elapsedMinutes === 0, `Reset left the chromosome at ${JSON.stringify({ organism: d.organism, origins: d.origins, elapsedMinutes: d.elapsedMinutes })}`);
    }],
  ],
  // Figure 8.4. Step, Divide and the telomerase and shape controls move the model inside the press, so
  // each step polls describe() for the state its press makes and then reads the fields the brief names:
  // gapAtEnd, lostLastDivisionBp and senescent. The numbers asserted exactly are the model's: a tail of
  // twice the loss, one copy a whole tail short and the other not, so 50 bp an end at each division by
  // default, and a stop at 7,500 bp after fifty divisions. Only the two run steps wait on the clock.
  'chromosome-end': [
    ['opens-before-the-first-division', async (h) => {
      const d = await h.describe();
      expect(d.phase === 'before' && d.divisions === 0 && d.playing === false, `it should open before the first division, paused: ${JSON.stringify({ phase: d.phase, divisions: d.divisions, playing: d.playing })}`);
      expect(d.telomereBp === 10000 && d.startBp === 10000 && d.thresholdBp === 7500 && d.divisionsLeft === 50, `it should open at 10,000 bp, fifty divisions from the stop at 7,500: ${JSON.stringify({ telomereBp: d.telomereBp, startBp: d.startBp, thresholdBp: d.thresholdBp, divisionsLeft: d.divisionsLeft })}`);
      expect(d.lossPerDivisionBp === 50 && d.overhangNt === 100 && d.lostLastDivisionBp === 0, `it should open at 50 bp an end from a 100-nt tail, nothing lost yet: ${JSON.stringify({ lossPerDivisionBp: d.lossPerDivisionBp, overhangNt: d.overhangNt, lostLastDivisionBp: d.lostLastDivisionBp })}`);
      expect(d.gapAtEnd === false && d.senescent === false && d.telomerase === false && d.repeatsAdded === 0 && d.shape === 'linear', `it should open linear, with no gap, no stop and no telomerase: ${JSON.stringify({ gapAtEnd: d.gapAtEnd, senescent: d.senescent, telomerase: d.telomerase, repeatsAdded: d.repeatsAdded, shape: d.shape })}`);
    }],
    ['two-steps-copy-the-end-and-leave-the-last-gap', async (h) => {
      await h.button(/^Step/).click();
      const c = await until(h, (x) => x.phase === 'copying', 5_000);
      expect(c.phase === 'copying' && c.divisions === 0 && c.gapAtEnd === false && c.telomereBp === 10000, `one step should copy the end, the division not yet counted: ${JSON.stringify({ phase: c.phase, divisions: c.divisions, gapAtEnd: c.gapAtEnd, telomereBp: c.telomereBp })}`);
      await h.button(/^Step/).click();
      const d = await until(h, (x) => x.phase === 'after', 5_000);
      expect(d.phase === 'after' && d.divisions === 1 && d.gapAtEnd === true, `the second step should leave the last primer's gap open: ${JSON.stringify({ phase: d.phase, divisions: d.divisions, gapAtEnd: d.gapAtEnd })}`);
      // One copy is a whole 100-nt tail short and the other is not: 50 bp from the average end.
      expect(d.lostLastDivisionBp === 50 && d.telomereBp === 9950 && d.divisionsLeft === 49, `the division should take 50 bp from the average end: ${JSON.stringify({ lostLastDivisionBp: d.lostLastDivisionBp, telomereBp: d.telomereBp, divisionsLeft: d.divisionsLeft })}`);
      expect(d.playing === false && d.senescent === false, `a step should leave it paused and still dividing: ${JSON.stringify({ playing: d.playing, senescent: d.senescent })}`);
    }],
    ['divide-to-the-stop-after-fifty-divisions', async (h) => {
      for (let i = 0; i < 49; i += 1) await h.button(/^Divide/).click();
      const d = await until(h, (x) => x.divisions === 50, 10_000);
      expect(d.divisions === 50 && d.telomereBp === 7500 && d.senescent === true && d.divisionsLeft === 0, `fifty divisions should bring it to 7,500 bp and stop it: ${JSON.stringify({ divisions: d.divisions, telomereBp: d.telomereBp, senescent: d.senescent, divisionsLeft: d.divisionsLeft })}`);
      expect(d.lostLastDivisionBp === 50 && d.gapAtEnd === true && d.phase === 'after', `the last division should still lose 50 bp at an open gap: ${JSON.stringify({ lostLastDivisionBp: d.lostLastDivisionBp, gapAtEnd: d.gapAtEnd, phase: d.phase })}`);
      // Both presses act inside the click, so the state read straight after them is the state they made.
      await h.button(/^Divide/).click();
      await h.button(/^Step/).click();
      const still = await h.describe();
      expect(still.divisions === 50 && still.telomereBp === 7500 && still.phase === 'after' && still.senescent === true, `a cell that has stopped should not divide again: ${JSON.stringify({ divisions: still.divisions, telomereBp: still.telomereBp, phase: still.phase, senescent: still.senescent })}`);
    }],
    ['telomerase-at-the-stop-keeps-the-length', async (h) => {
      await h.button(/^Telomerase/).click();
      const d = await until(h, (x) => x.telomerase === true, 5_000);
      // The division on show is re-done with the enzyme there: nothing lost, so nothing stops it.
      expect(d.senescent === false && d.lostLastDivisionBp === 0 && d.gapAtEnd === false && d.telomereBp === 7550 && d.divisionsLeft === null, `telomerase should undo the last division's loss and the stop: ${JSON.stringify({ senescent: d.senescent, lostLastDivisionBp: d.lostLastDivisionBp, gapAtEnd: d.gapAtEnd, telomereBp: d.telomereBp, divisionsLeft: d.divisionsLeft })}`);
      // 100 nt added back, six to a repeat: sixteen whole repeats.
      expect(d.repeatsAdded === 16, `the tail's 100 nt should be sixteen whole repeats: ${d.repeatsAdded}`);
      await h.button(/^Divide/).click();
      const e = await until(h, (x) => x.divisions === 51, 5_000);
      // Two divisions' tails, 200 nt, are 33 whole repeats: the count is of the nucleotides, not the divisions.
      expect(e.divisions === 51 && e.telomereBp === 7550 && e.lostLastDivisionBp === 0 && e.repeatsAdded === 33 && e.senescent === false, `with telomerase a division should lose nothing: ${JSON.stringify({ divisions: e.divisions, telomereBp: e.telomereBp, lostLastDivisionBp: e.lostLastDivisionBp, repeatsAdded: e.repeatsAdded, senescent: e.senescent })}`);
    }],
    ['run-divisions-goes-on-and-pause-stops-it', async (h) => {
      const before = await h.describe();
      await ensureRunning(h);
      const d = await until(h, (x) => x.divisions >= before.divisions + 2, 30_000);
      await h.button(/^Pause/).click();
      const p = await until(h, (x) => x.playing === false, 5_000);
      expect(d.divisions >= before.divisions + 2, `a run should go on dividing: ${before.divisions} -> ${d.divisions} at t=${d.t}`);
      expect(p.playing === false, 'Pause should stop the run');
      expect(p.telomereBp === 7550 && p.senescent === false, `with telomerase on the length should hold through the run: ${JSON.stringify({ telomereBp: p.telomereBp, senescent: p.senescent })}`);
    }],
    ['a-run-stops-by-itself-at-the-threshold', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.divisions === 0 && x.telomerase === false && x.phase === 'before', 5_000);
      for (let i = 0; i < 48; i += 1) await h.button(/^Divide/).click();
      const d = await until(h, (x) => x.divisions === 48, 10_000);
      expect(d.divisions === 48 && d.telomereBp === 7600 && d.senescent === false && d.divisionsLeft === 2, `48 divisions should leave 7,600 bp, two from the stop: ${JSON.stringify({ divisions: d.divisions, telomereBp: d.telomereBp, divisionsLeft: d.divisionsLeft })}`);
      await ensureRunning(h);
      const end = await until(h, (x) => x.playing === false && x.senescent === true, 30_000);
      expect(end.playing === false && end.senescent === true && end.divisions === 50 && end.telomereBp === 7500, `the run should stop itself at 7,500 bp after fifty divisions: ${JSON.stringify({ playing: end.playing, senescent: end.senescent, divisions: end.divisions, telomereBp: end.telomereBp })}`);
    }],
    ['the-loss-control-sets-the-tail', async (h) => {
      await h.button(/^Reset/).click();
      await until(h, (x) => x.divisions === 0 && x.phase === 'before', 5_000);
      const slider = h.stage.getByRole('slider', { name: 'Loss per division' });
      await slider.fill('100');
      await atValue(h, slider, 100);
      const d = await until(h, (x) => x.lossPerDivisionBp === 100, 5_000);
      expect(d.lossPerDivisionBp === 100 && d.overhangNt === 200 && d.divisionsLeft === 25, `100 bp an end should come from a 200-nt tail, 25 divisions from the stop: ${JSON.stringify({ lossPerDivisionBp: d.lossPerDivisionBp, overhangNt: d.overhangNt, divisionsLeft: d.divisionsLeft })}`);
      await h.button(/^Divide/).click();
      const e = await until(h, (x) => x.divisions === 1, 5_000);
      expect(e.lostLastDivisionBp === 100 && e.telomereBp === 9900 && e.gapAtEnd === true, `a division should take 100 bp: ${JSON.stringify({ lostLastDivisionBp: e.lostLastDivisionBp, telomereBp: e.telomereBp, gapAtEnd: e.gapAtEnd })}`);
      await slider.fill('25');
      await atValue(h, slider, 25);
      const f = await until(h, (x) => x.lossPerDivisionBp === 25, 5_000);
      // The division on show is re-done at the new setting.
      expect(f.overhangNt === 50 && f.lostLastDivisionBp === 25 && f.telomereBp === 9975 && f.divisionsLeft === 99, `at 25 bp the division on show should be re-done from a 50-nt tail: ${JSON.stringify({ overhangNt: f.overhangNt, lostLastDivisionBp: f.lostLastDivisionBp, telomereBp: f.telomereBp, divisionsLeft: f.divisionsLeft })}`);
    }],
    ['a-circle-has-no-end-to-lose', async (h) => {
      await h.button(/^Circular/).click();
      const d = await until(h, (x) => x.shape === 'circular', 5_000);
      expect(d.divisions === 0 && d.phase === 'before' && d.overhangNt === 0 && d.divisionsLeft === null && d.lossPerDivisionBp === 25, `a circle should start again, keep the setting, and have no tail and no stop: ${JSON.stringify({ divisions: d.divisions, phase: d.phase, overhangNt: d.overhangNt, divisionsLeft: d.divisionsLeft, lossPerDivisionBp: d.lossPerDivisionBp })}`);
      for (let i = 0; i < 2; i += 1) await h.button(/^Step/).click();
      const a = await until(h, (x) => x.phase === 'after', 5_000);
      expect(a.divisions === 1 && a.gapAtEnd === false && a.lostLastDivisionBp === 0 && a.telomereBp === 10000, `the other fork's leading strand should fill the last gap, and nothing be lost: ${JSON.stringify({ divisions: a.divisions, gapAtEnd: a.gapAtEnd, lostLastDivisionBp: a.lostLastDivisionBp, telomereBp: a.telomereBp })}`);
      for (let i = 0; i < 10; i += 1) await h.button(/^Divide/).click();
      const many = await until(h, (x) => x.divisions === 11, 5_000);
      expect(many.divisions === 11 && many.telomereBp === 10000 && many.gapAtEnd === false && many.senescent === false, `a circle should lose nothing however often it divides: ${JSON.stringify({ divisions: many.divisions, telomereBp: many.telomereBp, gapAtEnd: many.gapAtEnd, senescent: many.senescent })}`);
      await h.button(/^Linear/).click();
      const lin = await until(h, (x) => x.shape === 'linear', 5_000);
      expect(lin.divisions === 0 && lin.phase === 'before' && lin.telomereBp === 10000 && lin.overhangNt === 50, `back to linear should start again with the setting kept: ${JSON.stringify({ divisions: lin.divisions, phase: lin.phase, telomereBp: lin.telomereBp, overhangNt: lin.overhangNt })}`);
    }],
    ['the-keys-step-divide-switch-and-reset', async (h) => {
      await h.focusable().focus();
      await h.page.keyboard.press('Enter');
      const s = await until(h, (x) => x.phase === 'copying', 5_000);
      expect(s.phase === 'copying' && s.divisions === 0, `Enter should step into copying: ${JSON.stringify({ phase: s.phase, divisions: s.divisions })}`);
      await h.page.keyboard.press('d');
      const d = await until(h, (x) => x.divisions === 1 && x.phase === 'after', 5_000);
      expect(d.divisions === 1 && d.phase === 'after' && d.gapAtEnd === true, `D should finish the division: ${JSON.stringify({ divisions: d.divisions, phase: d.phase, gapAtEnd: d.gapAtEnd })}`);
      await h.page.keyboard.press('t');
      const t = await until(h, (x) => x.telomerase === true, 5_000);
      expect(t.telomerase === true && t.lostLastDivisionBp === 0 && t.gapAtEnd === false, `T should switch telomerase on: ${JSON.stringify({ telomerase: t.telomerase, lostLastDivisionBp: t.lostLastDivisionBp })}`);
      await h.page.keyboard.press('c');
      const c = await until(h, (x) => x.shape === 'circular', 5_000);
      expect(c.shape === 'circular' && c.divisions === 0 && c.telomerase === true, `C should move to the next shape and keep the settings: ${JSON.stringify({ shape: c.shape, divisions: c.divisions, telomerase: c.telomerase })}`);
      await h.page.keyboard.press('Home');
      const home = await until(h, (x) => x.shape === 'linear' && x.telomerase === false && x.lossPerDivisionBp === 50, 5_000);
      expect(home.phase === 'before' && home.divisions === 0 && home.telomereBp === 10000 && home.overhangNt === 100 && home.playing === false, `Home should reset: ${JSON.stringify({ phase: home.phase, divisions: home.divisions, telomereBp: home.telomereBp, overhangNt: home.overhangNt, playing: home.playing })}`);
    }],
    ['reset-puts-everything-back', async (h) => {
      await h.button(/^Telomerase/).click();
      const slider = h.stage.getByRole('slider', { name: 'Loss per division' });
      await slider.fill('80');
      await atValue(h, slider, 80);
      await h.button(/^Circular/).click();
      for (let i = 0; i < 3; i += 1) await h.button(/^Divide/).click();
      const changed = await until(h, (x) => x.shape === 'circular' && x.divisions === 3, 5_000);
      expect(changed.shape === 'circular' && changed.divisions === 3 && changed.telomerase === true && changed.lossPerDivisionBp === 80, `the state to reset should have been reached: ${JSON.stringify({ shape: changed.shape, divisions: changed.divisions, telomerase: changed.telomerase, lossPerDivisionBp: changed.lossPerDivisionBp })}`);
      await h.button(/^Reset/).click();
      const d = await until(h, (x) => x.shape === 'linear' && x.divisions === 0 && x.telomerase === false && x.lossPerDivisionBp === 50, 5_000);
      expect(d.phase === 'before' && d.divisions === 0 && d.telomereBp === 10000 && d.overhangNt === 100 && d.repeatsAdded === 0 && d.playing === false, `Reset left ${JSON.stringify({ phase: d.phase, divisions: d.divisions, telomereBp: d.telomereBp, overhangNt: d.overhangNt, repeatsAdded: d.repeatsAdded, playing: d.playing })}`);
      expect(d.shape === 'linear' && d.telomerase === false && d.lossPerDivisionBp === 50, `Reset left the settings at ${JSON.stringify({ shape: d.shape, telomerase: d.telomerase, lossPerDivisionBp: d.lossPerDivisionBp })}`);
      const shown = await atValue(h, slider, 50);
      expect(shown === '50', `Reset should put the slider back at 50: ${shown}`);
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
