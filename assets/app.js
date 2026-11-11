(() => {
  'use strict';
  const tools = document.querySelector('.catalog-tools');
  const cards = [...document.querySelectorAll('.project-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#project-search');
  const empty = document.querySelector('.empty-state');
  const status = document.querySelector('#result-status');
  let category = 'all';
  const normalize = value => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();

  function update() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const text = normalize(`${card.dataset.search} ${card.textContent}`);
      const visible = (category === 'all' || card.dataset.category === category) && words.every(word => text.includes(word));
      card.hidden = !visible;
      if (visible) count++;
    });
    empty.hidden = count > 0;
    document.querySelector('.project-grid').classList.toggle('is-filtered', category !== 'all' || words.length > 0);
    status.textContent = `Показано проектов: ${count} из ${cards.length}`;
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    update();
  }));
  search.addEventListener('input', update);
  document.querySelector('#reset-filters').addEventListener('click', () => {
    category = 'all';
    search.value = '';
    update();
    search.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const element = document.activeElement;
    if (element?.matches('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    search.focus();
    search.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  tools.hidden = false;
  update();
})();
