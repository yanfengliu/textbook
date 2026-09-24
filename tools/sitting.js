// npm run sitting: complete a study sitting on the Today page the way a reader does, using only the
// keyboard, in both themes at two widths, and check what the page then claims about what they know.
//
// Claim: from a clean record, the Today page offers a calibration sitting; every question can be
// reached and answered from the keyboard alone — Enter on a focused option, and on every other question
// the letter printed on the option instead; each answer is recorded with the objective it tested, the
// format, and which option was chosen, and for a multiple choice the recorded `chose` is the bank's own
// letter for the option whose text was on the button pressed, read back through the bank the page
// loaded — options are shown in a drawn order (src/components/choice-order.js), so the letter on the
// screen and the letter in the record differ; the sitting reaches its end summary within MAX_STEPS presses
// (the component's own describe() says `finished`); that summary carries at least one per-objective
// label; and no label anywhere on the page says the word the component reserves for the store's
// strictest verdict while the record says nothing has earned it. Fails naming the theme, the width and
// the step, and on any console error, page error or failed request.
//
// Where the label check gets its subject, and why not from a literal: the element's class, the word
// and the end summary's class are read from src/components/mastery.js (`MARK_WORD_CLASS`,
// `LEARNED_WELL_WORD`, `CLOSING_CLASS`, `markElement`), so rewording the label, translating it
// (docs/design/i18n.md) or renaming either class moves this check with it rather than emptying it. That
// is not the page agreeing with itself: the other half of the comparison is `store.mastery()`, which
// knows nothing about how the page spells anything. When those exports are missing, or when the end
// summary shows no label at all, the run fails and says which of the two it is — a check that cannot
// find its subject has tested nothing, and must never report success for it. The "at least one label"
// claim is made of the end summary alone: "Where you stand" renders labels before a single question is
// answered, and a document-wide count stayed green with the summary's own labels gone (review,
// 2026-09-16). The overstatement check still reads every label on the page, because a label claiming
// the reserved word after a first sitting is wrong wherever it stands.
//
// Bound: the reader's path through Today, not the chapter (tools/flow.js) and not the figures'
// controls (tools/drive.js). It answers at a position that moves down one with each question, moved on
// to the next position whose letter on the screen is not the option's letter in the bank, because a
// read-back where the two letters agree cannot tell a record that names the option from one that names
// the position; a sitting in which no read-back could tell them apart fails. It presses no digit. So it
// exercises the path rather than the pedagogy: over one sitting of about six questions it cannot say
// whether the correct option's position gives it away — test/choice-order.test.js measures that over
// every bank — nor tell a good question from a bad one, and it says nothing
// about a record with history behind it, only about the first sitting from empty. The step cap is
// MAX_STEPS presses — a calibration sitting is six questions, each an option and an advance, so the cap
// is about twice the path — and a sitting that has not finished by then fails with the count rather
// than stopping quietly. The label check reads the per-objective label elements and never the running
// prose, so the honest sentence "0 ideas are learned well" cannot trip it — and a claim made in a
// sentence rather than in a label is outside what it can see. Its comparison is the aggregate one a
// first sitting allows: nothing in the record qualifies, so no label may say it. It does not pair each
// label with the objective it stands beside, and a record with history behind it would need a gate
// that does. SITTING_THEMES trims the themes, and a value naming no theme stops the run rather than
// emptying it (tools/lib/trim.js).
//
// The label check is here rather than in a unit test because the defect it catches lived in the gap
// between two correct modules: the store said `learnedWell: false` and the page said "Learned well",
// because the page was reading the scheduler's `review` state, which only means the card is past its
// learning steps. Nothing either module could assert about itself would have caught that.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';
import { trim } from './lib/trim.js';

const OUT = 'out/sitting';
const THEMES = trim('SITTING_THEMES', ['light', 'dark'], { noun: 'theme' });
const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'phone', width: 390, height: 844 },
];

// The most presses one sitting may take before the run calls it unfinished; see the header.
const MAX_STEPS = 24;

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
let closingLabelsChecked = 0;
let choicesChecked = 0;
let lettersPressed = 0;
let choicesTellable = 0;

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
      let byLetter = 0;
      let choicesRead = 0;
      // Read-backs where the letter on the screen and the letter in the bank differ: the only ones that
      // can tell a record naming the option from one naming the position.
      let choicesTold = 0;
      for (let step = 0; step < MAX_STEPS; step += 1) {
        const found = await page.evaluate(async ({ optionSel, advanceSrc, answered: n }) => {
          const advance = new RegExp(advanceSrc, 'i');
          const visible = (el) => el.offsetParent !== null && !el.disabled;
          const opts = [...document.querySelectorAll(optionSel)].filter(visible);
          if (opts.length) {
            const norm = (s) => s.replace(/\s+/g, ' ').trim();
            const shown = opts.map((o) => norm([...o.children].filter((c) => !c.classList.contains('k')).map((c) => c.textContent).join('')));
            const written = (option) => {
              const box = document.createElement('div');
              box.innerHTML = option.text ?? option.html ?? option.label ?? String(option);
              return norm(box.textContent);
            };
            // The item on screen, found in the bank the page loaded by its options' text rather than by
            // asking the component which item it drew.
            const item = (document.querySelector('tb-sitting')?.items || []).find((i) => i.options?.length === shown.length && i.options.every((o) => shown.includes(written(o))));
            // A different position each question, so the presses do not all land on A — moved on to the
            // next position whose letter on the screen is not the option's letter in the bank, because a
            // read-back where the two letters agree cannot tell a right record from a wrong one.
            const differs = shown.map((text, p) => Boolean(item) && written(item.options[p]) !== text);
            let pick = n % opts.length;
            for (let d = 0; d < opts.length; d += 1) {
              if (differs[(n + d) % opts.length]) {
                pick = (n + d) % opts.length;
                break;
              }
            }
            const opt = opts[pick];
            opt.setAttribute('data-gate-target', '1');
            const { store } = await import('../src/learning/store.js');
            return {
              kind: 'option',
              letter: opt.querySelector('.k')?.textContent.trim() ?? '',
              text: shown[pick],
              differs: differs[pick],
              recorded: store.events().length,
            };
          }
          const next = [...document.querySelectorAll('button')].filter(visible).find((b) => advance.test(b.textContent));
          if (next) {
            next.setAttribute('data-gate-target', '1');
            return { kind: 'advance' };
          }
          return null;
        }, { optionSel: OPTION, advanceSrc: ADVANCE.source, answered });
        if (!found) break;
        const { kind } = found;

        // Every other question is answered by the letter printed on the chosen option, pressed where the
        // page left focus: the second keyboard path to an option, and the one that has to address what
        // is on the screen rather than what the bank wrote.
        const letterPath = kind === 'option' && answered % 2 === 1 && /^[A-H]$/.test(found.letter);
        if (letterPath) {
          await page.keyboard.press(found.letter.toLowerCase());
          byLetter += 1;
        } else {
          const target = page.locator('[data-gate-target="1"]').first();
          await target.focus();
          const tookFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-gate-target') === '1');
          if (!tookFocus) problems.push(`${where}: the ${kind} at step ${step} could not take keyboard focus`);
          await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(300);
        await page.evaluate(() => document.querySelectorAll('[data-gate-target]').forEach((e) => e.removeAttribute('data-gate-target')));
        if (kind === 'option') {
          answered += 1;
          // Which option the record says was chosen, read back through the bank the page loaded: the
          // letter in the record is the bank's, the letter on the screen is the display order's.
          const got = await page.evaluate(async ({ before }) => {
            const { store } = await import('../src/learning/store.js');
            for (let i = 0; i < 120 && store.events().length <= before; i += 1) await new Promise((r) => requestAnimationFrame(r));
            const events = store.events();
            if (events.length !== before + 1) return { problem: `the press recorded ${events.length - before} event(s), not 1` };
            const e = events[events.length - 1];
            const item = (document.querySelector('tb-sitting')?.items || []).find((i) => i.id === e.item);
            if (!item) return { problem: `the answer names item "${e.item}", which no bank the page loaded holds` };
            const at = 'ABCDEFGH'.indexOf(e.chose ?? '-');
            const option = at >= 0 ? item.options?.[at] : null;
            if (!option) return { problem: `the answer to "${e.item}" says chose ${JSON.stringify(e.chose)}, which names none of its ${item.options?.length ?? 0} options` };
            const box = document.createElement('div');
            box.innerHTML = option.text ?? option.html ?? option.label ?? String(option);
            return { item: e.item, chose: e.chose, text: box.textContent.replace(/\s+/g, ' ').trim() };
          }, { before: found.recorded });
          const how = letterPath ? `the key "${found.letter.toLowerCase()}"` : 'Enter';
          if (got.problem) problems.push(`${where}: step ${step}, the option shown at ${found.letter} pressed with ${how}: ${got.problem}`);
          else if (got.text !== found.text) problems.push(`${where}: step ${step}: the reader pressed ${how} on the option shown at ${found.letter}, "${found.text.slice(0, 80)}", and the record says item "${got.item}" chose ${got.chose}, which the bank writes as "${got.text.slice(0, 80)}". \`chose\` must name the option that was on the button pressed, by its letter in the bank, whatever letter the screen gave it (src/components/choice-order.js).`);
          else {
            choicesRead += 1;
            if (found.differs) choicesTold += 1;
          }
        } else {
          advanced += 1;
        }
        if (answered <= 2 && kind === 'option') await snap(`answer-${answered}`);
      }
      await snap('end');

      if (answered === 0) problems.push(`${where}: no question could be answered with the keyboard alone`);
      if (advanced === 0) problems.push(`${where}: nothing advanced the sitting, so it never reached an end`);
      // A run that never pressed a letter has not tested that path, and must not read as one that did:
      // the letter is read from the option's own `.k` label, so a renamed label would quietly fall back
      // to Enter every time.
      if (choicesRead > 0 && choicesTold === 0) problems.push(`${where}: ${choicesRead} chosen option(s) were read back and in none of them did the letter on the screen differ from the option's letter in the bank, so the read-back could not tell a record that names the option from one that names the position`);
      if (answered > 1 && byLetter === 0) problems.push(`${where}: ${answered} question(s) were answered and none by the letter printed on an option — no visible ${OPTION} carried a single letter A to H in its .k label — so that keyboard path was not exercised`);

      // Did it end? The component says so itself: `finished` is whether its closing summary is showing.
      // Asked before the labels, because a label count over a sitting that is still running compares
      // the wrong page — and `snap('end')` above is a file name, not a claim.
      const ended = await page.evaluate(() => {
        const el = document.querySelector('tb-sitting');
        if (!el) return { problem: 'there is no <tb-sitting> on the page, so whether a sitting ended cannot be read' };
        if (typeof el.describe !== 'function') return { problem: '<tb-sitting> has no describe(), so whether it ended cannot be read' };
        const d = el.describe();
        return { finished: d.finished === true, at: d.at, steps: d.steps };
      });
      const finished = ended.finished === true;
      if (ended.problem) problems.push(`${where}: ${ended.problem}`);
      else if (!finished) problems.push(`${where}: the sitting had not reached its end summary after ${answered + advanced} press(es) — ${answered} answered, ${advanced} advanced, the cap is ${MAX_STEPS} — and tb-sitting.describe() reports finished: false at step ${ended.at} of ${ended.steps}. Either the sitting is longer than the cap, a button on the path is not one this gate looks for (${OPTION}, ${ADVANCE}), or the summary never shows; ${OUT}/ holds the frames`);

      // What was recorded, and whether the page's words are supported by it. The component is asked
      // which element carries a claim about one objective, which word the store has to support and
      // which element is the end summary; the record comes from the store, which is the half of the
      // comparison no edit to the page's vocabulary can move.
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
          const missing = ['MARK_WORD_CLASS', 'LEARNED_WELL_WORD', 'CLOSING_CLASS'].filter((k) => typeof m[k] !== 'string' || !m[k].trim());
          if (typeof m.markElement !== 'function') missing.push('markElement()');
          if (missing.length) throw new Error(`it exports no ${missing.join(' and no ')}`);
          ui = m;
        } catch (e) {
          return { ...record, uiProblem: String(e?.message || e) };
        }
        const selector = `.${ui.MARK_WORD_CLASS}`;
        const closingSel = `.${ui.CLOSING_CLASS}`;
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
        // so matching on the words of the page rather than its sentences is the whole point. Counted
        // twice: inside the end summary, which is the "at least one" claim, and over the whole page,
        // which is the overstatement claim.
        const closing = document.querySelector(closingSel);
        const inClosing = closing && !closing.hidden ? [...closing.querySelectorAll(selector)] : [];
        const words = [...document.querySelectorAll(selector)].map((n) => n.textContent.trim());
        const claim = ui.LEARNED_WELL_WORD.trim().toLowerCase();
        return {
          ...record,
          uiProblem: null,
          selector,
          closingSel,
          closingFound: Boolean(closing),
          closingShown: Boolean(closing && !closing.hidden),
          claim: ui.LEARNED_WELL_WORD,
          probe,
          closingLabels: inClosing.length,
          labels: words.length,
          labelledLearnedWell: words.filter((w) => w.toLowerCase() === claim).length,
          words,
        };
      });

      if (verdict.events === 0) problems.push(`${where}: answered ${answered} question(s) and recorded nothing`);
      if (verdict.withObjective !== verdict.events) problems.push(`${where}: ${verdict.events - verdict.withObjective} recorded event(s) name no objective, so they cannot be scored against anything`);
      if (verdict.withKind !== verdict.events) problems.push(`${where}: ${verdict.events - verdict.withKind} recorded event(s) name no format, and mastery counts formats`);
      if (answered > 0 && verdict.withChose === 0) problems.push(`${where}: no recorded event says which option was chosen, which is the field the rounds diagnose from`);
      // Before the overstatement check, the ways it can have nothing to check. Each is a failure: a run
      // that inspected no label has compared no words against the record, and reporting that as
      // success is the defect this whole file exists to stop, one level up.
      if (verdict.uiProblem) {
        problems.push(`${where}: the label check could not read its subject from src/components/mastery.js — ${verdict.uiProblem}. It needs MARK_WORD_CLASS (the class on the element carrying one objective's word), LEARNED_WELL_WORD (the word only store.mastery().learnedWell earns), CLOSING_CLASS (the class on the end summary) and markElement(). Export those four from wherever they are built now and this check follows the rename; without them it would count zero labels and pass having tested nothing.`);
      } else if (!verdict.closingFound) {
        problems.push(`${where}: no element matches ${verdict.closingSel}, the class src/components/mastery.js exports as CLOSING_CLASS for the end summary, so the summary's labels could not be counted. Point CLOSING_CLASS at the element that holds the end summary now.`);
      } else if (finished && verdict.closingLabels === 0 && verdict.labels > 0) {
        problems.push(`${where}: the end summary carries no per-objective label — 0 elements match ${verdict.selector} inside ${verdict.closingSel} — while ${verdict.labels} match elsewhere on the page ("Where you stand" renders labels before any question is answered), so the summary the sitting ended on says nothing per objective. A passing run finds a label beside each objective the summary names under "What moved" and "Look at these again" — at least 1, and 6 on the tree this was written against; ${OUT}/ holds the frames this run saw.`);
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
      closingLabelsChecked += verdict.closingLabels ?? 0;
      choicesChecked += choicesRead;
      lettersPressed += byLetter;
      choicesTellable += choicesTold;
      // The label counts are printed because a run that checked nothing must not read like a run that
      // checked everything: `0 label(s)` on this line is the shape of the failures above.
      console.log(`${problems.length ? 'note' : 'ok  '} ${where}: ${answered} answered (${byLetter} by letter), ${verdict.events} recorded, ${verdict.withChose} with a chosen option, ${choicesRead} of them read back against the bank (${choicesTold} where the screen's letter and the bank's differ), finished: ${finished}, ${verdict.closingLabels ?? 0} label(s) in the end summary and ${verdict.labels ?? 0} on the page read against the record`);
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
console.log(`sitting: ${sittings} keyboard-only sittings completed; ${choicesChecked} chosen option(s) read back against the bank, ${choicesTellable} of them where the screen's letter and the bank's differ and ${lettersPressed} pressed by letter; ${closingLabelsChecked} per-objective label(s) in the end summaries and ${labelsChecked} on the pages read against the record; ${shots} screenshots in ${OUT}/`);
