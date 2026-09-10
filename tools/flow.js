// npm run flow: drive the chapter's reader-facing controls through real input and assert what they
// produce, with a screenshot after each step in out/flow/.
//
// Claim: on the chapter page, (1) clicking a wrong option in the first check marks it wrong, reveals
// the correct one and the explanation, and disables the options; (2) pressing Enter on a keyboard-
// focused option in the second check answers it; (3) placing a sort card by its button moves it into
// that bin with a verdict and a reason, and dragging a card onto a bin does the same; (4) a glossary
// term opens its definition on click and closes on Escape; (5) the header toggle switches the theme
// and the figures are told; (6) at phone width the menu button opens the contents drawer and a link in
// it closes it. Fails naming the step, and on any console or page error.
//
// Bound: the shipped components on the chapter page, one desktop and one phone viewport, light theme
// first. It exercises the input path the reader uses (mouse, keyboard, drag) rather than calling the
// components' methods; it does not exercise the figures' own controls, which the figure modules and the
// sweep cover.
import { mkdirSync, rmSync } from 'node:fs';
import { startServer } from './serve.js';
import { launch, collectErrors, openPage, ACTION_TIMEOUT_MS } from './lib/browser.js';

const OUT = 'out/flow';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const server = await startServer({ port: 0, quiet: true });
const browser = await launch();
const failures = [];
let step = 0;

async function check(page, name, fn) {
  step += 1;
  const file = `${OUT}/${String(step).padStart(2, '0')}-${name}.png`;
  let snapped = false;
  // A step that wants its screenshot mid-way (before it closes what it opened) calls snap().
  const snap = async () => {
    await page.screenshot({ path: file, type: 'png' });
    snapped = true;
  };
  try {
    await fn(snap);
    if (!snapped) await page.screenshot({ path: file, type: 'png' });
    console.log(`ok   ${name} -> ${file}`);
  } catch (err) {
    await page.screenshot({ path: file, type: 'png' }).catch(() => {});
    failures.push(`${name}: ${err.message}`);
    console.log(`FAIL ${name}: ${err.message}`);
  }
}

const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

try {
  // Desktop flows. The figures are mounted lazily here, as a reader would have them.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const errors = collectErrors(page);
  await openPage(page, `${server.url}/biology/ch01-what-is-life/?theme=light`);

  await check(page, 'check-wrong-answer', async () => {
    const q = page.locator('#q1');
    await q.scrollIntoViewIfNeeded();
    await q.locator('.tb-check__opt').nth(0).click();
    expect(await q.getAttribute('data-answered') === 'wrong', 'the check did not record a wrong answer');
    expect(await q.locator('.tb-check__opt.is-wrong').count() === 1, 'the chosen option is not marked wrong');
    expect(await q.locator('.tb-check__opt.is-correct').count() === 1, 'the correct option is not revealed');
    expect(await q.locator('.explain').isVisible(), 'the explanation is not shown');
    expect((await q.locator('.tb-check__verdict').textContent()).includes('Not quite'), 'the verdict text is missing');
    expect(await q.locator('.tb-check__opt').nth(2).isDisabled(), 'options were not disabled after answering');
  });

  await check(page, 'check-keyboard-answer', async () => {
    const q = page.locator('#q2');
    await q.scrollIntoViewIfNeeded();
    await q.locator('.tb-check__opt').nth(1).focus();
    await page.keyboard.press('Enter');
    expect(await q.getAttribute('data-answered') === 'right', `Enter on the correct option gave data-answered="${await q.getAttribute('data-answered')}"`);
    expect((await q.locator('.tb-check__verdict').textContent()).includes('Right'), 'the verdict text is missing');
  });

  await check(page, 'sort-by-button', async () => {
    const sort = page.locator('#alive');
    await sort.scrollIntoViewIfNeeded();
    const card = sort.locator('.tb-sort__tray .tb-sort__item').first();
    const name = await card.locator('.name').textContent();
    await card.getByRole('button', { name: 'Alive', exact: true }).click();
    const placed = sort.locator('.tb-sort__bin[data-bin="alive"] .tb-sort__item');
    expect(await placed.count() === 1, 'the card did not land in the Alive bin');
    expect((await placed.locator('.name').textContent()) === name, 'a different card landed in the bin');
    expect(await placed.locator('.why').count() === 1, 'the reason is not shown');
    expect((await sort.locator('.tb-sort__status').textContent()).includes('1 of 9 sorted'), 'the status line did not update');
  });

  await check(page, 'sort-by-drag', async () => {
    const sort = page.locator('#alive');
    const card = sort.locator('.tb-sort__tray .tb-sort__item').first();
    const bin = sort.locator('.tb-sort__bin[data-bin="not"]');
    await card.dragTo(bin);
    expect(await bin.locator('.tb-sort__item').count() === 1, 'the dragged card did not land in the Not alive bin');
    expect((await sort.locator('.tb-sort__status').textContent()).includes('2 of 9 sorted'), 'the status line did not count the drag');
  });

  await check(page, 'term-popover', async (snap) => {
    const term = page.locator('tb-term[ref="homeostasis"]').first();
    await term.scrollIntoViewIfNeeded();
    await term.locator('button').click();
    const pop = term.locator('.tb-term__pop');
    expect(await pop.count() === 1, 'no popover opened');
    expect((await pop.textContent()).includes('Homeostasis'), 'the popover does not name the term');
    expect(await term.locator('button').getAttribute('aria-expanded') === 'true', 'aria-expanded is not true');
    await snap();
    await page.keyboard.press('Escape');
    expect(await term.locator('.tb-term__pop').count() === 0, 'Escape did not close the popover');
  });

  await check(page, 'theme-toggle', async () => {
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    const told = await page.evaluate(() => new Promise((done) => {
      document.addEventListener('tb-theme-change', (e) => done(e.detail.theme), { once: true });
      document.querySelector('.tb-themetoggle').click();
    }));
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(before === 'light' && after === 'dark', `theme went ${before} -> ${after}`);
    expect(told === 'dark', `figures were told "${told}"`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg === 'rgb(21, 23, 26)', `body background is ${bg}, not the dark paper`);
  });
  for (const e of errors) failures.push(`desktop page error: ${e}`);
  await page.close();

  // Phone: the contents drawer.
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  phone.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const phoneErrors = collectErrors(phone);
  await openPage(phone, `${server.url}/biology/ch01-what-is-life/?theme=light`);
  await check(phone, 'phone-drawer', async () => {
    const rail = phone.locator('.tb-rail');
    const box0 = await rail.boundingBox();
    expect(box0.x + box0.width <= 0, `the drawer is not off screen before opening (x ${box0.x}, width ${box0.width})`);
    // The drawer slides over 400 ms; poll its box until it settles rather than sleeping a fixed time,
    // because a loaded machine can leave it 3 px short of closed at 500 ms (seen 2026-09-10).
    const settle = async (done, what) => {
      const deadline = Date.now() + 4000;
      let box = await rail.boundingBox();
      while (!done(box) && Date.now() < deadline) {
        await phone.waitForTimeout(100);
        box = await rail.boundingBox();
      }
      expect(done(box), `${what} (x ${box.x}, width ${box.width}, after 4 s)`);
      return box;
    };
    await phone.locator('.tb-navtoggle').click();
    await settle((b) => Math.abs(b.x) < 0.5, 'the drawer did not open');
    expect(await phone.locator('.tb-navtoggle').getAttribute('aria-expanded') === 'true', 'aria-expanded is not true');
    await rail.locator('a[href="#cell"]').click();
    await settle((b) => b.x + b.width <= 0.5, 'the drawer did not close after following a link');
    const hash = await phone.evaluate(() => location.hash);
    expect(hash === '#cell', `the link did not navigate (hash ${hash})`);
  });
  for (const e of phoneErrors) failures.push(`phone page error: ${e}`);
  await phone.close();
} finally {
  await browser.close();
  await server.close();
}
if (failures.length) {
  console.error(`FAIL: ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`flow: ${step} steps passed; screenshots in ${OUT}/`);
