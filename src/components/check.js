// <tb-check id="q1">
//   <p class="question">Which of these ...?</p>
//   <ul class="options">
//     <li data-correct>The right answer</li>
//     <li>A wrong answer</li>
//   </ul>
//   <p class="explain">Why the right answer is right.</p>
// </tb-check>
//
// One multiple-choice question. Choosing an option marks it right or wrong, reveals the correct one,
// shows the explanation, and announces the result through a live region. Options are real buttons,
// so the keyboard works without any extra handling.
//
// The options are not shown in the order they are written. The chapters' checks were written with the
// correct option at B or C in 34 of 36, so pressing B was right 21 times in 36. They are shown in an
// order drawn by displayOrder() (src/components/choice-order.js), and the letters follow the screen: A
// is always the option at the top. The draw is seeded by the check's id qualified by its page, because
// every chapter numbers its checks q1 to q5. A check records nothing, so the same page always draws the
// same order. An explanation must therefore name an option by what it says, never by where it stands
// ("the last option", 「前两个选项」); `npm run check` fails one that does.
import { displayOrder } from './choice-order.js';

// The words this component says, per language. The verdict is the one moment the component addresses
// the reader directly, and it was the literal English `Right.` / `Not quite.` on a page whose every
// other word is Chinese — reported by a reader of the 通鉴 book, who had all eleven of its questions
// answer them in English.
//
// English is the default, so an English page reads character for character as it did. The language is
// the page's own `<html lang>`, the way `tools/check-content.js` chooses its figure-citation token and
// `src/components/figure.js` the word before a figure number; a language with no table here keeps
// English rather than being quietly exempted.
//
// A page may publish its own words on the shared handshake object, because a component cannot know
// what a book wants to say — `textbook.strings.check` is merged over the table below, one key at a
// time:
//
//   textbook.strings = { check: { right: '对了。' } };
const CHECK_WORDS = {
  en: {
    question: (n) => `Question ${n}`,
    right: 'Right.',
    wrong: 'Not quite.',
    correct: 'Correct.',
    incorrect: 'Incorrect.',
  },
  zh: {
    // 第1题: a Chinese exercise labels its questions that way, and text-autospace sets the numeral
    // off the ideographs, so no space is authored between them (docs/design/i18n.md).
    question: (n) => `第${n}题`,
    right: '对了。',
    wrong: '不对。',
    correct: '回答正确。',
    incorrect: '回答错误。',
  },
};

function checkWords() {
  const lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().split('-')[0];
  return { ...(CHECK_WORDS[lang] ?? CHECK_WORDS.en), ...(window.__textbook?.strings?.check || {}) };
}

// The page a check is on, as the folders of its book and its chapter, such as
// "biology/ch04-membranes-and-transport". It is read off the last two folders of the page's own address,
// so the site served at the root and the site published under /textbook/ draw the same order, and a
// query or a hash changes nothing. Bound: a chapter page is `<book>/<chapter>/index.html`, and no other
// page carries a check. A check on a page at another depth could draw a different order at the two
// addresses; nothing else would change.
function pageOf() {
  const path = new URL(document.URL).pathname.replace(/\/index\.html?$/i, '/');
  return path.split('/').filter(Boolean).slice(-2).join('/');
}

export class TbCheck extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const question = this.querySelector('.question');
    const options = Array.from(this.querySelectorAll('.options > li'));
    const explain = this.querySelector('.explain');
    const words = checkWords();
    const label = document.createElement('div');
    label.className = 'tb-check__label';
    const n = Array.from(document.querySelectorAll('tb-check')).indexOf(this) + 1;
    label.textContent = words.question(n);
    const list = document.createElement('div');
    list.className = 'tb-check__options';
    list.setAttribute('role', 'group');
    const letters = 'ABCDEFGH';
    // `order[shown]` is the authored index of the option shown at position `shown`. A check with no id
    // is keyed by its number on the page, which is as stable as the page.
    const order = displayOrder(`${pageOf()}#${this.id || `q${n}`}`, 0, options.length);
    const buttons = order.map((authored, shown) => {
      const li = options[authored];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tb-check__opt';
      // `data-correct` follows the option, not the position: it is what marks the answer below, and it
      // is how tools/flow.js finds the right and the wrong option to press.
      b.dataset.correct = li.hasAttribute('data-correct') ? '1' : '';
      const k = document.createElement('span');
      k.className = 'k';
      k.textContent = letters[shown];
      const text = document.createElement('span');
      text.innerHTML = li.innerHTML;
      b.append(k, text);
      list.append(b);
      return b;
    });
    const live = document.createElement('div');
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    if (explain) explain.hidden = true;
    this.replaceChildren(label, question || '', list, explain || '', live);
    for (const b of buttons) {
      b.addEventListener('click', () => {
        if (this.hasAttribute('data-answered')) return;
        this.setAttribute('data-answered', b.dataset.correct ? 'right' : 'wrong');
        const right = Boolean(b.dataset.correct);
        for (const o of buttons) {
          if (o.dataset.correct) o.classList.add('is-correct');
          o.disabled = true;
        }
        if (!right) b.classList.add('is-wrong');
        if (explain) {
          explain.hidden = false;
          const v = document.createElement('span');
          v.className = `tb-check__verdict ${right ? 'ok' : 'no'}`;
          v.textContent = right ? words.right : words.wrong;
          explain.prepend(v);
        }
        live.textContent = `${right ? words.correct : words.incorrect} ${explain ? explain.textContent : ''}`;
      });
    }
  }
}

customElements.define('tb-check', TbCheck);
