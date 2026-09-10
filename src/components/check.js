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

export class TbCheck extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const question = this.querySelector('.question');
    const options = Array.from(this.querySelectorAll('.options > li'));
    const explain = this.querySelector('.explain');
    const label = document.createElement('div');
    label.className = 'tb-check__label';
    const n = Array.from(document.querySelectorAll('tb-check')).indexOf(this) + 1;
    label.textContent = `Question ${n}`;
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
          v.textContent = right ? 'Right.' : 'Not quite.';
          explain.prepend(v);
        }
        live.textContent = `${right ? 'Correct.' : 'Incorrect.'} ${explain ? explain.textContent : ''}`;
      });
    }
  }
}

customElements.define('tb-check', TbCheck);
