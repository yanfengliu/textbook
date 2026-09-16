// <tb-sort id="alive">
//   <p class="intro">Sort each one.</p>
//   <ul class="bins"><li data-bin="alive">Alive</li><li data-bin="not">Not alive</li></ul>
//   <ul class="items">
//     <li data-bin="alive" data-why="...">An oak tree</li>
//   </ul>
// </tb-sort>
//
// A sorting activity. Each item is a card in a tray with one button per bin (tap or keyboard) and is
// also draggable onto a bin. Placing it moves the card into the bin, marks it right or wrong against
// data-bin, and reveals data-why. A live region announces each placement and the running score.

// The words this component says, per language, and what a page publishes to replace them.
//
// The status line is a sentence and not a label, so it is assembled per language rather than
// translated: the English one names a biologist, which is the biology book's voice and means nothing
// in a book about 司马光, and a Chinese count does not agree with a plural. A translated plural
// template is how an interface reads wrong in a way nobody can point at (docs/design/i18n.md,
// "Grammar is not a string"). Same default, same `<html lang>` lookup and same page override as
// `check.js`: four sentences did not need that document's full string layer.
//
//   textbook.strings = { sort: { status: ({ placed, n, right, last }) => `…` } };
const SORT_WORDS = {
  en: {
    tray: 'Items to sort',
    placeIn: (name) => `Place ${name} in`,
    yes: 'Yes.',
    no: (label) => `Not this one — ${label}.`,
    announce: (name, verdict, why) => `${name}: ${verdict} ${why}`,
    status: ({ placed, n, right, last }) => {
      const summary = placed === n
        ? `All ${n} sorted, ${right} of ${n} placed where a biologist would put them.`
        : `${placed} of ${n} sorted.`;
      return last ? `${last} ${summary}` : summary;
    },
  },
  zh: {
    tray: '待归类的条目',
    placeIn: (name) => `把「${name}」放进哪一格`,
    yes: '归对了。',
    no: (label) => `归错了——应归入「${label}」。`,
    // A full-width colon, and no space after a full stop: a half-width mark in Chinese text is a Latin
    // mark in the wrong type system.
    announce: (name, verdict, why) => `${name}：${verdict}${why}`,
    // 还剩…没归 rather than a count of what is done: Chinese writes the remainder, and it reads at
    // every count including none. The standard the sorting is judged by is the book's to name, and the
    // page supplies its own sentence when it has one.
    status: ({ placed, n, right, last }) => {
      const summary = placed === n ? `${n}条都归好了，对了${right}条。` : `还剩${n - placed}条没归。`;
      return last ? `${last}${summary}` : summary;
    },
  },
};

function sortWords() {
  const lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().split('-')[0];
  return { ...(SORT_WORDS[lang] ?? SORT_WORDS.en), ...(window.__textbook?.strings?.sort || {}) };
}

export class TbSort extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
    const words = sortWords();
    this.words = words;
    const intro = this.querySelector('.intro');
    const bins = Array.from(this.querySelectorAll('.bins > li')).map((li) => ({ id: li.dataset.bin, label: li.textContent.trim() }));
    const items = Array.from(this.querySelectorAll('.items > li')).map((li, i) => ({
      id: `${this.id || 'sort'}-${i}`,
      name: li.innerHTML,
      bin: li.dataset.bin,
      why: li.dataset.why || '',
    }));
    this.items = items;
    this.bins = bins;
    this.placed = 0;
    this.right = 0;

    const tray = document.createElement('div');
    tray.className = 'tb-sort__tray';
    tray.setAttribute('aria-label', words.tray);
    const binsEl = document.createElement('div');
    binsEl.className = 'tb-sort__bins';
    const binEls = {};
    for (const bin of bins) {
      const el = document.createElement('div');
      el.className = 'tb-sort__bin';
      el.dataset.bin = bin.id;
      el.innerHTML = `<h5>${bin.label}</h5>`;
      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        el.classList.add('is-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('is-over'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('is-over');
        const id = e.dataTransfer.getData('text/plain');
        const card = tray.querySelector(`[data-id="${id}"]`);
        if (card) this.place(card, bin.id);
      });
      binsEl.append(el);
      binEls[bin.id] = el;
    }
    this.binEls = binEls;
    const status = document.createElement('p');
    status.className = 'tb-sort__status';
    status.setAttribute('aria-live', 'polite');
    this.status = status;

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'tb-sort__item';
      card.dataset.id = item.id;
      card.draggable = true;
      card.innerHTML = `<span class="name">${item.name}</span><span class="choose" role="group" aria-label="${words.placeIn(item.name.replace(/<[^>]+>/g, ''))}"></span>`;
      const choose = card.querySelector('.choose');
      for (const bin of bins) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = bin.label;
        b.addEventListener('click', () => this.place(card, bin.id));
        choose.append(b);
      }
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      tray.append(card);
    }
    const dropIntro = intro ? (intro.classList.add('tb-sort__intro'), intro) : '';
    this.replaceChildren(dropIntro, tray, binsEl, status);
    this.tray = tray;
    this.updateStatus();
  }

  place(card, binId) {
    const item = this.items.find((i) => i.id === card.dataset.id);
    if (!item || card.dataset.placed) return;
    card.dataset.placed = binId;
    card.draggable = false;
    const right = item.bin === binId;
    card.classList.add(right ? 'is-right' : 'is-wrong');
    card.querySelector('.choose')?.remove();
    const verdict = document.createElement('span');
    verdict.className = 'verdict';
    const correctLabel = this.bins.find((b) => b.id === item.bin)?.label;
    verdict.textContent = right ? this.words.yes : this.words.no(correctLabel);
    const why = document.createElement('span');
    why.className = 'why';
    why.textContent = item.why;
    card.append(verdict, why);
    this.binEls[binId].append(card);
    this.placed += 1;
    if (right) this.right += 1;
    this.updateStatus(this.words.announce(item.name.replace(/<[^>]+>/g, ''), verdict.textContent, item.why));
  }

  updateStatus(last = '') {
    this.status.textContent = this.words.status({ placed: this.placed, n: this.items.length, right: this.right, last });
  }

  describe() {
    return { placed: this.placed, right: this.right, total: this.items.length };
  }
}

customElements.define('tb-sort', TbSort);
