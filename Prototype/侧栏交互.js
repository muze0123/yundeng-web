/* 旧页面侧栏兼容层。当前 App Shell 的分组交互由 公共导航.js 负责。 */
(function () {
  'use strict';

  const groups = Array.from(document.querySelectorAll('aside nav .nav-item.group')).filter(button => !button.classList.contains('yundeng-group-toggle'));
  if (!groups.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .submenu{overflow:hidden;max-height:420px;opacity:1;transition:max-height .22s ease,opacity .16s ease}
    .submenu.is-collapsed{max-height:0!important;opacity:0;pointer-events:none}
    .nav-item.group .chev{transition:transform .22s ease}
    .nav-item.group[aria-expanded="false"] .chev{transform:rotate(-90deg)}
    @media(prefers-reduced-motion:reduce){.submenu,.nav-item.group .chev{transition:none!important}}
  `;
  document.head.appendChild(style);

  function rerenderAnnotations() {
    if (typeof renderAnnoBadges === 'function') renderAnnoBadges();
    else if (typeof renderAnno === 'function') renderAnno();
  }

  groups.forEach((button, index) => {
    const submenu = button.nextElementSibling;
    if (!submenu?.classList.contains('submenu')) return;

    const key = button.dataset.groupKey || button.textContent.trim() || String(index + 1);
    const storageKey = `yundeng-sidebar-group:${key}`;
    const submenuId = submenu.id || `legacy-sidebar-submenu-${index + 1}`;
    submenu.id = submenuId;
    button.onclick = null;
    button.setAttribute('aria-controls', submenuId);

    function setExpanded(expanded, persist) {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', `${expanded ? '收起' : '展开'}${key}子菜单`);
      submenu.classList.toggle('is-collapsed', !expanded);
      submenu.setAttribute('aria-hidden', String(!expanded));
      if (persist) {
        try { localStorage.setItem(storageKey, String(expanded)); } catch (_) {}
      }
      requestAnimationFrame(rerenderAnnotations);
    }

    let expanded = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) expanded = saved === 'true';
    } catch (_) {}
    setExpanded(expanded, false);
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true', true));
  });
})();
