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

export class TbSort extends HTMLElement {
  connectedCallback() {
    if (this.__built) return;
    this.__built = true;
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
    tray.setAttribute('aria-label', 'Items to sort');
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
      card.innerHTML = `<span class="name">${item.name}</span><span class="choose" role="group" aria-label="Place ${item.name.replace(/<[^>]+>/g, '')} in"></span>`;
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
    verdict.textContent = right ? 'Yes.' : `Not this one — ${correctLabel}.`;
    const why = document.createElement('span');
    why.className = 'why';
    why.textContent = item.why;
    card.append(verdict, why);
    this.binEls[binId].append(card);
    this.placed += 1;
    if (right) this.right += 1;
    this.updateStatus(`${item.name.replace(/<[^>]+>/g, '')}: ${verdict.textContent} ${item.why}`);
  }

  updateStatus(last = '') {
    const n = this.items.length;
    const summary = this.placed === n
      ? `All ${n} sorted, ${this.right} of ${n} placed where a biologist would put them.`
      : `${this.placed} of ${n} sorted.`;
    this.status.textContent = last ? `${last} ${summary}` : summary;
  }

  describe() {
    return { placed: this.placed, right: this.right, total: this.items.length };
  }
}

customElements.define('tb-sort', TbSort);
