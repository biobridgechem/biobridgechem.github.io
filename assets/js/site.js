(() => {
  // Keep static/cached pages safe without relying on a scheduled rebuild.
  const registrationLinks = [...document.querySelectorAll('[data-registration-link]')];
  const updateRegistration = () => {
    registrationLinks.forEach(link => {
      const cutoff = Date.parse(link.dataset.registrationCutoff);
      const open = Number.isFinite(cutoff) && Date.now() < cutoff;
      if (open) {
        link.href = link.dataset.registrationUrl;
        link.removeAttribute('aria-disabled');
        link.textContent = link.dataset.registrationLabel;
      } else {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.textContent = 'Registration closed';
      }
    });
  };
  registrationLinks.forEach(link => link.addEventListener('click', event => {
    updateRegistration();
    if (!link.hasAttribute('href')) event.preventDefault();
  }));
  updateRegistration();
  setInterval(updateRegistration, 1000);
  window.addEventListener('pageshow', updateRegistration);
  document.addEventListener('visibilitychange', updateRegistration);
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
