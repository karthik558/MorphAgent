// Common keyboard and accessible-name support for both extension pages.
(() => {
  document.querySelectorAll('button[title], a[title]').forEach(el => {
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.title);
  });
  document.querySelectorAll('.device-card').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    const update = () => card.setAttribute('aria-pressed', String(card.classList.contains('active')));
    update();
    new MutationObserver(update).observe(card, { attributes: true, attributeFilter: ['class'] });
    card.addEventListener('keydown', event => {
      if (!card.disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); card.click(); }
    });
  });
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const update = () => {
      if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    };
    update();
    new MutationObserver(update).observe(link, { attributes: true, attributeFilter: ['class'] });
  });
  document.querySelectorAll('.settings-toggle-desc a').forEach(link => {
    link.addEventListener('click', event => event.stopPropagation());
  });
  document.querySelectorAll('#save-indicator, .toast').forEach(el => {
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
  });
})();
