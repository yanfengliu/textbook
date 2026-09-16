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
    const buttons = options.map((li, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tb-check__opt';
      b.dataset.correct = li.hasAttribute('data-correct') ? '1' : '';
      b.innerHTML = `<span class="k">${letters[i]}</span><span>${li.innerHTML}</span>`;
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
