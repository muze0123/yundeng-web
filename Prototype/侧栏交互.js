(function () {
  const groupButton = document.querySelector('aside nav .nav-item.group');
  const submenu = groupButton?.nextElementSibling;
  if (!groupButton || !submenu?.classList.contains('submenu')) return;

  const storageKey = 'yundeng-sidebar-data-tracking-expanded';
  const style = document.createElement('style');
  style.textContent = `
    .submenu{overflow:hidden;max-height:280px;opacity:1;transition:max-height .22s ease,opacity .16s ease,margin-top .22s ease}
    .submenu.is-collapsed{max-height:0!important;opacity:0;margin-top:0!important;pointer-events:none}
    .nav-item.group .chev{transition:transform .22s ease}
    .nav-item.group[aria-expanded="false"] .chev{transform:rotate(-90deg)}
    @media(prefers-reduced-motion:reduce){.submenu,.nav-item.group .chev{transition:none!important}}
  `;
  document.head.appendChild(style);

  groupButton.onclick = null;
  groupButton.setAttribute('aria-controls', 'data-tracking-submenu');
  submenu.id = 'data-tracking-submenu';

  function setExpanded(expanded, persist) {
    groupButton.setAttribute('aria-expanded', String(expanded));
    groupButton.setAttribute('aria-label', `${expanded ? '收起' : '展开'}数据埋点子菜单`);
    submenu.classList.toggle('is-collapsed', !expanded);
    submenu.setAttribute('aria-hidden', String(!expanded));
    if (persist) {
      try { localStorage.setItem(storageKey, String(expanded)); } catch (_) {}
    }
    requestAnimationFrame(() => {
      if (typeof renderAnno === 'function') renderAnno();
    });
  }

  let initialExpanded = true;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) initialExpanded = saved === 'true';
  } catch (_) {}
  setExpanded(initialExpanded, false);

  groupButton.addEventListener('click', () => {
    setExpanded(groupButton.getAttribute('aria-expanded') !== 'true', true);
  });
})();
