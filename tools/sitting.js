// npm run sitting: complete a study sitting on the Today page the way a reader does, using only the
// keyboard, in both themes at two widths, and check what the page then claims about what they know.
//
// Claim: from a clean record, the Today page offers a calibration sitting; every question can be
// reached and answered with Tab and Enter alone; each answer is recorded with the objective it tested,
// the format, and which option was chosen; the sitting reaches an end summary; that summary carries at
// least one per-objective label; and none of those labels says the word the component reserves for the
// store's strictest verdict while the record says nothing has earned it. Fails naming the theme, the
// width and the step, and on any console error, page error or failed request.
//
// Where the label check gets its subject, and why not from a literal: the element's class and the word
// are read from src/components/mastery.js (`MARK_WORD_CLASS`, `LEARNED_WELL_WORD`, `markElement`), so
// rewording the label, translating it (docs/design/i18n.md) or renaming the class moves this check with
// it rather than emptying it. That is not the page agreeing with itself: the other half of the
// comparison is `store.mastery()`, which knows nothing about how the page spells anything. When those
// exports are missing, or when the finished sitting shows no label at all, the run fails and says which
// of the two it is — a check that cannot find its subject has tested nothing, and must never report
// success for it.
//
// Bound: the reader's path through Today, not the chapter (tools/flow.js) and not the figures'
// controls (tools/drive.js). It answers by choosing the first option offered, so it exercises the
// path rather than the pedagogy: it cannot tell a good question from a bad one, and it says nothing
// about a record with history behind it, only about the first sitting from empty. The label check
// reads the per-objective label elements and never the running prose, so the honest sentence "0 ideas
// are learned well" cannot trip it — and a claim made in a sentence rather than in a label is outside
// what it can see. Its comparison is the aggregate one a first sitting allows: nothing in the record
// qualifies, so no label may say it. It does not pair each label with the objective it stands beside,
// and a record with history behind it would need a gate that does.
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
let labelsChecked = 0;

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

      // What was recorded, and whether the page's words are supported by it. The component is asked
      // which element carries a claim about one objective and which word the store has to support;
      // the record comes from the store, which is the half of the comparison no edit to the page's
      // vocabulary can move.
      const verdict = await page.evaluate(async () => {
        const { store } = await import('../src/learning/store.js');
        const events = store.events({});
        const overstated = [];
        const seen = new Set(events.map((e) => e.objective));
        for (const id of seen) {
          const m = store.mastery(id);
          if (!m.learnedWell) overstated.push({ id, evidence: m.evidence, formats: m.formats, stability: m.stability });
        }
        const record = {
          events: events.length,
          withObjective: events.filter((e) => e.objective).length,
          withKind: events.filter((e) => e.kind).length,
          withChose: events.filter((e) => e.chose !== null && e.chose !== undefined).length,
          notLearnedWell: overstated.length,
          seen: seen.size,
        };

        let ui;
        try {
          const m = await import('../src/components/mastery.js');
          const missing = ['MARK_WORD_CLASS', 'LEARNED_WELL_WORD'].filter((k) => typeof m[k] !== 'string' || !m[k].trim());
          if (typeof m.markElement !== 'function') missing.push('markElement()');
          if (missing.length) throw new Error(`it exports no ${missing.join(' and no ')}`);
          ui = m;
        } catch (e) {
          return { ...record, uiProblem: String(e?.message || e) };
        }
        const selector = `.${ui.MARK_WORD_CLASS}`;
        // Does the component still put its word in an element that selector finds? A marker built here
        // and queried the same way is what tells a page that rendered no label apart from a component
        // whose word element has moved out from under the class it exports.
        const probe = { built: 0, error: null };
        try {
          const box = document.createElement('div');
          box.append(ui.markElement('review', { word: ui.LEARNED_WELL_WORD }));
          probe.built = box.querySelectorAll(selector).length;
        } catch (e) {
          probe.error = String(e?.message || e);
        }
        // The per-objective labels, which is where a claim about one idea is made. The running prose
        // is not checked here: "0 ideas are learned well" contains the phrase and is perfectly honest,
        // so matching on the words of the page rather than its sentences is the whole point.
        const words = [...document.querySelectorAll(selector)].map((n) => n.textContent.trim());
        const claim = ui.LEARNED_WELL_WORD.trim().toLowerCase();
        return {
          ...record,
          uiProblem: null,
          selector,
          claim: ui.LEARNED_WELL_WORD,
          probe,
          labels: words.length,
          labelledLearnedWell: words.filter((w) => w.toLowerCase() === claim).length,
          words,
        };
      });

      if (verdict.events === 0) problems.push(`${where}: answered ${answered} question(s) and recorded nothing`);
      if (verdict.withObjective !== verdict.events) problems.push(`${where}: ${verdict.events - verdict.withObjective} recorded event(s) name no objective, so they cannot be scored against anything`);
      if (verdict.withKind !== verdict.events) problems.push(`${where}: ${verdict.events - verdict.withKind} recorded event(s) name no format, and mastery counts formats`);
      if (answered > 0 && verdict.withChose === 0) problems.push(`${where}: no recorded event says which option was chosen, which is the field the rounds diagnose from`);
      // Before the overstatement check, the two ways it can have nothing to check. Either is a failure:
      // a run that inspected no label has compared no words against the record, and reporting that as
      // success is the defect this whole file exists to stop, one level up.
      if (verdict.uiProblem) {
        problems.push(`${where}: the label check could not read its subject from src/components/mastery.js — ${verdict.uiProblem}. It needs MARK_WORD_CLASS (the class on the element carrying one objective's word), LEARNED_WELL_WORD (the word only store.mastery().learnedWell earns) and markElement(). Export those three from wherever that element is built now and this check follows the rename; without them it would count zero labels and pass having tested nothing.`);
      } else if (verdict.labels === 0 && verdict.probe.built > 0) {
        problems.push(`${where}: the sitting ended with no per-objective label on the page — 0 elements match ${verdict.selector} — although markElement() built one here that does match, so the component is intact and the page rendered none. Nothing was compared against the record. A passing run finds a label beside each objective the page names in "Where you stand", "What moved" and "Look at these again" — at least 1, and 8 over the ${verdict.seen} objectives of the tree this was written against; ${OUT}/ holds the frames this run saw.`);
      } else if (verdict.labels === 0) {
        const why = verdict.probe.error
          ? `markElement() threw when asked to build one: ${verdict.probe.error}`
          : 'a marker from markElement() matches it 0 times either';
        problems.push(`${where}: no per-objective label was found — 0 elements match ${verdict.selector}, the class src/components/mastery.js exports as MARK_WORD_CLASS — and ${why}, so the exported class no longer describes the element the component puts its word in. Nothing was compared against the record. Point MARK_WORD_CLASS at the element that carries the word now, and a passing run finds at least 1 label (8 on the tree this was written against).`);
      }
      // The precondition the overstatement check rests on, asserted rather than assumed: after one
      // sitting from an empty record nothing can honestly be learned well, so every label on the page
      // is a claim the record must refuse. If that ever stops being true the check below stops firing,
      // and a check that quietly disarms is the same failure as one that finds nothing.
      if (!verdict.uiProblem && verdict.seen > 0 && verdict.notLearnedWell !== verdict.seen) {
        problems.push(`${where}: the record says ${verdict.seen - verdict.notLearnedWell} of ${verdict.seen} objective(s) are already learned well after a single sitting from an empty record, which the threshold — high recall, about a week of stability, a recent success, two formats — should put out of reach. Either the threshold has been loosened or store.reset() did not clear the record. Until none of them qualifies, the label check under this one cannot fire, so the run says so rather than passing quietly.`);
      }
      // The overstatement check: after one sitting nothing can honestly be "learned well", because the
      // threshold wants about a week of stability and two formats. If the page says it anyway, the
      // words have drifted from the record again.
      if (verdict.labelledLearnedWell > 0 && verdict.notLearnedWell === verdict.seen) {
        problems.push(`${where}: ${verdict.labelledLearnedWell} of ${verdict.labels} per-objective label(s) say "${verdict.claim}" after one sitting, the word src/components/mastery.js reserves for store.mastery().learnedWell, but the record says none of its ${verdict.seen} objectives qualifies (labels shown: ${[...new Set(verdict.words)].join(', ') || 'none'})`);
      }

      for (const e of errors) problems.push(`${where} page error: ${e}`);
      labelsChecked += verdict.labels ?? 0;
      // The label count is printed because a run that checked nothing must not read like a run that
      // checked everything: `0 labels` on this line is the shape of the failure above.
      console.log(`${problems.length ? 'note' : 'ok  '} ${where}: ${answered} answered, ${verdict.events} recorded, ${verdict.withChose} with a chosen option, ${verdict.labels ?? 0} label(s) read against the record`);
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
console.log(`sitting: ${sittings} keyboard-only sittings completed; ${labelsChecked} per-objective label(s) read against the record; ${shots} screenshots in ${OUT}/`);
