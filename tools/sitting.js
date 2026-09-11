// npm run sitting: complete a study sitting on the Today page the way a reader does, using only the
// keyboard, in both themes at two widths, and check what the page then claims about what they know.
//
// Claim: from a clean record, the Today page offers a calibration sitting; every question can be
// reached and answered with Tab and Enter alone; each answer is recorded with the objective it tested,
// the format, and which option was chosen; the sitting reaches an end summary; and no word the page
// shows overstates what the record supports. Fails naming the theme, the width and the step, and on
// any console error, page error or failed request.
//
// Bound: the reader's path through Today, not the chapter (tools/flow.js) and not the figures'
// controls (tools/drive.js). It answers by choosing the first option offered, so it exercises the
// path rather than the pedagogy: it cannot tell a good question from a bad one, and it says nothing
// about a record with history behind it, only about the first sitting from empty.
//
// The label check is here rather than in a unit test because the defect it catches lived in the gap
// between two correct modules: the store said `learnedWell: false` and the page said "Learned well",
// because the page was reading the scheduler's `review` state, which only means the card is past its
// learning steps. Nothing either module could assert about itself would have caught that.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';

const OUT = 'out/sitting';
const THEMES = process.env.SITTING_THEMES ? process.env.SITTING_THEMES.split(',') : ['light', 'dark'];
const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'phone', width: 390, height: 844 },
];

// The page's own classes. If one of these stops matching, the run fails on "could not answer" rather
// than passing silently, which is the failure mode a selector-driven gate has to get right.
const OPTION = '.tb-opt';
const ADVANCE = /next|continue|reveal|check|show|finish|done|skip/i;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const problems = [];
let shots = 0;
let sittings = 0;

try {
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      const where = `${theme}/${vp.id}`;
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      page.setDefaultTimeout(ACTION_TIMEOUT_MS);
      const errors = collectErrors(page);
      const snap = async (name) => {
        shots += 1;
        await page.screenshot({ path: `${OUT}/${String(shots).padStart(2, '0')}-${theme}-${vp.id}-${name}.png`, type: 'png' });
      };

      await openPage(page, `${server.url}/today/?theme=${theme}`);
      // A gate must start from a known record, not from whatever a previous run left behind.
      await page.evaluate(async () => {
        const { store } = await import('../src/learning/store.js');
        store.reset();
      });
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(600);
      await snap('arrive');

      let answered = 0;
      let advanced = 0;
      for (let step = 0; step < 24; step += 1) {
        const kind = await page.evaluate(({ optionSel, advanceSrc }) => {
          const advance = new RegExp(advanceSrc, 'i');
          const visible = (el) => el.offsetParent !== null && !el.disabled;
          const opt = [...document.querySelectorAll(optionSel)].filter(visible)[0];
          if (opt) {
            opt.setAttribute('data-gate-target', '1');
            return 'option';
          }
          const next = [...document.querySelectorAll('button')].filter(visible).find((b) => advance.test(b.textContent));
          if (next) {
            next.setAttribute('data-gate-target', '1');
            return 'advance';
          }
          return null;
        }, { optionSel: OPTION, advanceSrc: ADVANCE.source });
        if (!kind) break;

        const target = page.locator('[data-gate-target="1"]').first();
        await target.focus();
        const tookFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-gate-target') === '1');
        if (!tookFocus) problems.push(`${where}: the ${kind} at step ${step} could not take keyboard focus`);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        await page.evaluate(() => document.querySelectorAll('[data-gate-target]').forEach((e) => e.removeAttribute('data-gate-target')));
        if (kind === 'option') answered += 1;
        else advanced += 1;
        if (answered <= 2 && kind === 'option') await snap(`answer-${answered}`);
      }
      await snap('end');

      if (answered === 0) problems.push(`${where}: no question could be answered with the keyboard alone`);
      if (advanced === 0) problems.push(`${where}: nothing advanced the sitting, so it never reached an end`);

      // What was recorded, and whether the page's words are supported by it.
      const verdict = await page.evaluate(async () => {
        const { store } = await import('../src/learning/store.js');
        const events = store.events({});
        const overstated = [];
        const seen = new Set(events.map((e) => e.objective));
        for (const id of seen) {
          const m = store.mastery(id);
          if (!m.learnedWell) overstated.push({ id, evidence: m.evidence, formats: m.formats, stability: m.stability });
        }
        // The per-objective labels, which is where a claim about one idea is made. The running prose
        // is not checked here: "0 ideas are learned well" contains the phrase and is perfectly honest,
        // so matching on the words of the page rather than its sentences is the whole point.
        const words = [...document.querySelectorAll('.tb-mark__word')].map((n) => n.textContent.trim());
        return {
          events: events.length,
          withObjective: events.filter((e) => e.objective).length,
          withKind: events.filter((e) => e.kind).length,
          withChose: events.filter((e) => e.chose !== null && e.chose !== undefined).length,
          notLearnedWell: overstated.length,
          seen: seen.size,
          labelledLearnedWell: words.filter((w) => /^learned well$/i.test(w)).length,
          words,
        };
      });

      if (verdict.events === 0) problems.push(`${where}: answered ${answered} question(s) and recorded nothing`);
      if (verdict.withObjective !== verdict.events) problems.push(`${where}: ${verdict.events - verdict.withObjective} recorded event(s) name no objective, so they cannot be scored against anything`);
      if (verdict.withKind !== verdict.events) problems.push(`${where}: ${verdict.events - verdict.withKind} recorded event(s) name no format, and mastery counts formats`);
      if (answered > 0 && verdict.withChose === 0) problems.push(`${where}: no recorded event says which option was chosen, which is the field the rounds diagnose from`);
      // The overstatement check: after one sitting nothing can honestly be "learned well", because the
      // threshold wants about a week of stability and two formats. If the page says it anyway, the
      // words have drifted from the record again.
      if (verdict.labelledLearnedWell > 0 && verdict.notLearnedWell === verdict.seen) {
        problems.push(`${where}: ${verdict.labelledLearnedWell} objective(s) are labelled "Learned well" after one sitting, but the record says none of its ${verdict.seen} qualifies (labels shown: ${[...new Set(verdict.words)].join(', ') || 'none'})`);
      }

      for (const e of errors) problems.push(`${where} page error: ${e}`);
      console.log(`${problems.length ? 'note' : 'ok  '} ${where}: ${answered} answered, ${verdict.events} recorded, ${verdict.withChose} with a chosen option`);
      sittings += 1;
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} problem(s) across ${sittings} sitting(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`sitting: ${sittings} keyboard-only sittings completed; ${shots} screenshots in ${OUT}/`);
