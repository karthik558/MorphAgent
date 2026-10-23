// Styled single-select menus. Native selects remain the source of truth for settings.
(() => {
  const names = { 'platform-select': 'Platform', 'browser-select': 'Browser',
    'profile-select': 'Device profile', 'geo-preset': 'Location',
    'dns-provider-select': 'DNS provider', 'proxyium-node-select': 'Proxy region',
    categorySelect: 'Device category', platformSelect: 'Platform',
    browserSelect: 'Browser', profileSelect: 'Device profile' };
  let opened = null;
  document.querySelectorAll('select.custom-select').forEach(select => {
    const associatedLabels = [...select.labels];
    const accessibleName = names[select.id] || associatedLabels.map(label => label.textContent.trim()).join(' ') || 'Choose option';
    let wrapper = select.parentElement;
    if (!wrapper.classList.contains('select-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'select-wrapper';
      select.before(wrapper);
      wrapper.append(select);
    }
    wrapper.classList.add('enhanced-select');
    select.hidden = true;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'select-trigger';
    trigger.id = `${select.id}-trigger`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', accessibleName);
    const label = document.createElement('span');
    label.className = 'select-trigger-label';
    const chevron = document.createElement('span');
    chevron.className = 'menu-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(label, chevron);
    wrapper.append(trigger);
    associatedLabels.forEach(label => label.htmlFor = trigger.id);
    const menu = document.createElement('div');
    menu.id = `${select.id}-menu`;
    menu.className = 'select-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', accessibleName);
    trigger.setAttribute('aria-controls', menu.id);
    document.body.append(menu);
    let active = -1;
    let search = '';
    let searchTime = 0;
    const options = () => [...select.options];
    function close() {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      if (opened?.trigger === trigger) opened = null;
    }
    function highlight(index) {
      active = index;
      [...menu.children].forEach((item, i) => item.classList.toggle('highlighted', i === index));
      const item = menu.children[index];
      if (item) {
        trigger.setAttribute('aria-activedescendant', item.id);
        item.scrollIntoView({ block: 'nearest' });
      }
    }
    function choose(index) {
      if (!select.options[index] || select.options[index].disabled) return;
      const changed = select.selectedIndex !== index;
      select.selectedIndex = index;
      close();
      if (changed) {
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      sync();
      trigger.focus({ preventScroll: true });
    }
    function sync() {
      label.textContent = select.selectedOptions[0]?.textContent || 'Choose an option';
      trigger.title = label.textContent;
      trigger.disabled = select.disabled || !select.options.length;
      if (trigger.disabled) close();
      if (!menu.hidden) render();
    }
    function render() {
      menu.replaceChildren(...options().map((option, index) => {
        const item = document.createElement('div');
        item.className = 'select-option';
        item.id = `${menu.id}-${index}`;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(index === select.selectedIndex));
        item.setAttribute('aria-disabled', String(option.disabled));
        item.textContent = option.textContent;
        item.addEventListener('pointerdown', e => e.preventDefault());
        item.addEventListener('click', () => choose(index));
        item.addEventListener('pointermove', () => { if (!option.disabled) highlight(index); });
        return item;
      }));
    }
    function open() {
      if (trigger.disabled) return;
      opened?.close();
      opened = { trigger, close, menu };
      render();
      const rect = trigger.getBoundingClientRect();
      const below = innerHeight - rect.bottom - 8;
      const above = rect.top - 8;
      const upward = below < 160 && above > below;
      menu.style.width = `${Math.min(Math.max(rect.width, 240), innerWidth - 16)}px`;
      menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - parseFloat(menu.style.width) - 8))}px`;
      menu.style.maxHeight = `${Math.max(40, Math.min(260, upward ? above : below))}px`;
      menu.style.top = upward ? 'auto' : `${rect.bottom + 4}px`;
      menu.style.bottom = upward ? `${innerHeight - rect.top + 4}px` : 'auto';
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      highlight(select.selectedIndex >= 0 ? select.selectedIndex : 0);
    }
    trigger.addEventListener('click', () => menu.hidden ? open() : close());
    trigger.addEventListener('keydown', event => {
      const opts = options();
      if (event.key === 'Escape' || event.key === 'Tab') {
        if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopPropagation(); }
        close(); return;
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (menu.hidden) open();
        let index = event.key === 'Home' ? 0 : event.key === 'End' ? opts.length - 1 : active + (event.key === 'ArrowDown' ? 1 : -1);
        const direction = event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1;
        while (index >= 0 && index < opts.length && opts[index].disabled) index += direction;
        if (index >= 0 && index < opts.length) highlight(index);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (menu.hidden) open(); else choose(active);
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        if (menu.hidden) open();
        search = Date.now() - searchTime > 700 ? event.key : search + event.key;
        searchTime = Date.now();
        const index = opts.findIndex(o => !o.disabled && o.textContent.trim().toLowerCase().startsWith(search.toLowerCase()));
        if (index >= 0) highlight(index);
      }
    });
    trigger.addEventListener('blur', close);
    select.addEventListener('change', sync);
    new MutationObserver(sync).observe(select, { subtree: true, childList: true, attributes: true, characterData: true });
    // Storage hydration and dependent profile changes set these without firing events.
    for (const key of ['value', 'selectedIndex']) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, key);
      Object.defineProperty(select, key, { configurable: true,
        get() { return descriptor.get.call(this); },
        set(value) { descriptor.set.call(this, value); sync(); }
      });
    }
    sync();
  });
  document.addEventListener('pointerdown', event => {
    if (opened && !opened.trigger.contains(event.target) && !opened.menu.contains(event.target)) opened.close();
  });
  document.addEventListener('scroll', event => {
    if (opened && !opened.menu.contains(event.target)) opened.close();
  }, true);
  window.addEventListener('resize', () => opened?.close());
})();
