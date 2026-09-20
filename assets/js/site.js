(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (menu && nav) {
    menu.hidden = false;
    document.documentElement.classList.add('has-js');
    const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  }
  const search = document.querySelector('#seminar-search');
  const year = document.querySelector('#seminar-year');
  if (search && year) {
    document.querySelector('[data-filter-controls]').hidden = false;
    const cards = [...document.querySelectorAll('[data-event-card]')];
    const filter = () => {
      const terms = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
      let visible = 0;
      cards.forEach(card => { const match = (!year.value || card.dataset.year === year.value) && terms.every(term => card.dataset.search.includes(term)); card.hidden = !match; if (match) visible++; });
      document.querySelector('#result-count').textContent = `${visible} ${visible === 1 ? 'event' : 'events'}`;
      document.querySelector('#empty-results').hidden = visible !== 0;
    };
    search.addEventListener('input', filter);
    year.addEventListener('change', filter);
  }
})();
