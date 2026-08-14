(function () {
  'use strict';

  const NAV = [
    { key: 'environment', label: '环境管理', icon: 'monitor-cog', href: '环境管理.html' },
    { key: 'proxy', label: '代理管理', icon: 'network', href: '代理管理.html' },
    { key: 'store', label: '商城', icon: 'shopping-bag', href: '商城.html' },
    { key: 'billing', label: '费用管理', icon: 'wallet-cards', href: '费用管理.html' },
    { key: 'team', label: '团队', icon: 'users-round', group: true, children: [
      { key: 'team-management', label: '团队管理', icon: 'building-2', href: '团队管理.html' },
      { key: 'members', label: '成员管理', icon: 'user-round-cog', href: '成员管理.html' },
      { key: 'account-management', label: '账号管理', icon: 'contact', href: '账号管理.html' },
      { key: 'transfer', label: '分享转移', icon: 'arrow-right-left', href: '分享转移.html' },
      { key: 'logs', label: '日志管理', icon: 'scroll-text', href: '日志管理.html' },
      { key: 'account-settings', label: '账号设置', icon: 'key-round', href: '账号设置.html' }
    ]},
    { key: 'plugins', label: '插件管理', icon: 'blocks', href: '插件管理.html' },
    { key: 'automation', label: '自动化', icon: 'workflow', group: true, children: [
      { key: 'api', label: 'API', icon: 'braces', href: 'API.html' },
      { key: 'rpa', label: 'RPA', icon: 'bot', href: 'RPA.html' }
    ]},
    { key: 'recycle', label: '回收站', icon: 'trash-2', href: '回收站.html' }
  ];
  const EXTRA = [
    { key: 'create', label: '新建浏览器', icon: 'circle-plus', href: '新建浏览器.html' },
    { key: 'settings', label: '偏好设置', icon: 'settings-2', href: '设置.html' },
    { key: 'design-system', label: '设计规范', icon: 'swatch-book', href: '设计系统.html' }
  ];
  const allItems = NAV.flatMap(item => item.children || [item]).concat(EXTRA);
  const basename = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const pageAliases = { '系统框架.html':'environment', '编辑浏览器.html':'environment' };
  const pageKey = pageAliases[basename] || allItems.find(item => item.href === basename)?.key || 'index';
  const pageLabel = ({ 'index.html':'原型导航', '系统框架.html':'系统框架', '编辑浏览器.html':'编辑浏览器' })[basename] || allItems.find(item => item.key === pageKey)?.label || document.title.replace(/^云登\s*[·-]?\s*|\s*[-·]\s*云登$/g, '');
  const shellStateKey = 'yundeng-sidebar-expanded-v3';

  function addStyles() {
    if (document.querySelector('link[data-yundeng-nav-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '公共导航.css?v=20260813';
    link.dataset.yundengNavCss = 'true';
    document.head.appendChild(link);
  }

  function ensureIcons() {
    if (window.lucide) { window.lucide.createIcons(); return; }
    if (document.querySelector('script[data-yundeng-lucide]')) return;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@latest';
    script.dataset.yundengLucide = 'true';
    script.onload = () => window.lucide?.createIcons?.();
    document.head.appendChild(script);
  }

  function directChild(parent, selector) {
    return parent ? Array.from(parent.children).find(node => node.matches(selector)) : null;
  }

  function ensureShell() {
    let sidebar = document.getElementById('sidebar');
    if (!sidebar) sidebar = document.querySelector('body > div > aside, body > aside, body aside.w-\\[220px\\], body aside.sidebar');
    let main = document.getElementById('mainContent');
    if (!main) main = document.querySelector('body > div > main, body > main, body main');

    if (!sidebar || !main) {
      const original = Array.from(document.body.children).filter(node => !['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT'].includes(node.tagName));
      const oldTopbar = original.find(node => node.matches('header.topbar'));
      if (oldTopbar) oldTopbar.remove();
      const layout = document.createElement('div');
      layout.id = 'yundeng-shell';
      layout.className = 'flex min-h-screen h-screen overflow-hidden';
      sidebar = document.createElement('aside');
      sidebar.id = 'sidebar';
      sidebar.className = 'sidebar shrink-0 bg-card flex flex-col overflow-hidden';
      main = document.createElement('main');
      main.id = 'mainContent';
      main.className = 'flex-1 min-w-0 overflow-auto bg-page';
      const app = document.createElement('div');
      app.className = 'min-w-0 flex-1 flex flex-col min-h-screen';
      const header = document.createElement('header');
      header.className = '';
      app.append(header, main);
      layout.append(sidebar, app);
      document.body.prepend(layout);
      original.forEach(node => { if (node.parentNode === document.body) main.appendChild(node); });
    }
    sidebar.id = 'sidebar';
    if (!main.id) main.id = 'mainContent';
    document.body.dataset.yundengShell = 'true';
    const host = sidebar.parentElement;
    if (host && host !== document.body && (host.contains(main) || main.parentElement?.parentElement === host)) host.classList.add('yundeng-shell-host');
    if (host && !host.id && host.children.length === 2) host.id = 'yundeng-shell';
    return { sidebar, main };
  }

  function findTopbar(main) {
    const wrapper = main?.parentElement;
    return directChild(wrapper, 'header') || directChild(main, 'header') || document.querySelector('header.h-14');
  }

  function createShellSidebar(sidebar) {
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `<div class="brand-row"><a class="brand-link" href="系统框架.html" aria-label="云登首页"><span class="brand-mark">云</span><span class="brand-copy">云登</span></a><button type="button" id="collapseBtn" title="收起侧栏" aria-label="收起侧栏"><i data-lucide="panel-left-close" class="w-[18px]"></i></button></div><div class="yundeng-create-wrap"><a class="yundeng-create" href="新建浏览器.html"><i data-lucide="plus" class="w-4"></i><span class="create-label">新建浏览器</span></a></div><nav id="yundeng-primary-nav" aria-label="业务模块"></nav><div class="yundeng-sidebar-bottom"><div class="yundeng-sidebar-divider"></div><a class="yundeng-bottom-link" data-active="${pageKey === 'settings'}" href="设置.html"><i data-lucide="settings-2" class="menu-icon"></i><span class="bottom-label">偏好设置</span></a><a class="yundeng-bottom-link" data-active="${pageKey === 'design-system'}" href="设计系统.html"><i data-lucide="swatch-book" class="menu-icon"></i><span class="bottom-label">设计规范</span></a></div>`;
  }

  function normalizeExistingSidebar(sidebar) {
    if (!sidebar.querySelector('#collapseBtn')) {
      const row = sidebar.querySelector(':scope > div:first-child') || sidebar.prepend(document.createElement('div'));
      row.classList.add('brand-row');
      const button = document.createElement('button');
      button.type = 'button'; button.id = 'collapseBtn'; button.className = 'ml-auto w-8 h-8 shrink-0 rounded flex items-center justify-center text-ink-sub hover:bg-hover';
      button.title = '收起侧栏'; button.setAttribute('aria-label', button.title); button.innerHTML = '<i data-lucide="panel-left-close" class="w-[18px]"></i>';
      row.appendChild(button);
    }
    let nav = sidebar.querySelector('#primaryNav, nav');
    if (!nav) { nav = document.createElement('nav'); sidebar.appendChild(nav); }
    nav.id = 'yundeng-primary-nav';
    return nav;
  }

  function itemLink(item, child) {
    const active = pageKey === item.key;
    return `<a href="${item.href}" class="yundeng-menu-link flex items-center gap-3 px-2 ${child ? 'pl-3' : ''} mb-1" data-active="${active}" data-page-key="${item.key}"><i data-lucide="${item.icon}" class="menu-icon w-[17px] h-[17px] shrink-0"></i><span class="menu-label nav-label truncate">${item.label}</span></a>`;
  }

  function renderNav(nav) {
    let expanded = {};
    try { expanded = JSON.parse(localStorage.getItem(shellStateKey) || '{}'); } catch (_) {}
    nav.innerHTML = NAV.map(item => item.group ? `<div class="yundeng-group"><button type="button" class="yundeng-group-toggle" data-active="${item.children.some(child => child.key === pageKey)}" aria-expanded="${expanded[item.key] !== false}" data-group-key="${item.key}"><i data-lucide="${item.icon}" class="menu-icon w-[17px] h-[17px] shrink-0"></i><span class="menu-label nav-label">${item.label}</span><i data-lucide="chevron-down" class="yundeng-group-chevron w-3.5 h-3.5 ml-auto"></i></button><div class="yundeng-subnav" data-expanded="${expanded[item.key] !== false}">${item.children.map(child => itemLink(child, true)).join('')}</div></div>` : itemLink(item, false)).join('');
    window.lucide?.createIcons?.();
  }

  function setupTopbar(topbar) {
    if (!topbar) return;
    topbar.dataset.yundengTopbar = 'true';
    const hadDirty = Boolean(document.getElementById('dirtyBadge'));
    topbar.className = '';
    topbar.innerHTML = `<div class="yundeng-topbar-start"><button type="button" id="mobileMenu" class="yundeng-mobile-menu yundeng-icon-button" aria-label="展开导航"><i data-lucide="menu"></i></button><span class="yundeng-breadcrumb">管理中心 / ${pageLabel}</span>${hadDirty ? '<span id="dirtyBadge" class="yundeng-dirty hidden">有未保存修改</span>' : ''}</div><div class="yundeng-topbar-actions"><button type="button" id="helpBtn" class="yundeng-icon-button" aria-label="新手帮助" title="新手帮助"><i data-lucide="circle-help"></i></button><button type="button" id="noticeBtn" class="yundeng-icon-button" aria-label="通知" title="通知"><i data-lucide="bell"></i></button><button type="button" id="languageBtn" class="yundeng-icon-button" aria-label="切换语言" title="切换语言"><i data-lucide="languages"></i></button><span class="yundeng-divider"></span><button type="button" id="accountBtn" class="yundeng-account" aria-label="账号菜单"><span class="yundeng-avatar">张</span><span class="yundeng-account-name">张小登</span><i data-lucide="chevron-down" class="yundeng-account-chevron"></i></button></div>`;
    window.lucide?.createIcons?.();
  }

  function setupPopovers(topbar) {
    const make = (name, html) => { let node = document.getElementById(`yundeng-${name}`); if (!node) { node = document.createElement('div'); node.id = `yundeng-${name}`; node.className = 'yundeng-popover hidden'; node.innerHTML = html; document.body.appendChild(node); } return node; };
    const notices = make('notices', '<div class="px-4 py-3 border-b border-line flex items-center justify-between"><strong>通知</strong><button type="button" data-yundeng-read>全部已读</button></div><div class="px-4 py-4 text-[12px] text-ink-sub">暂无新的未读通知</div>');
    const language = make('languages', '<div class="p-1"><button type="button" data-lang="简体中文" class="w-full text-left px-3 py-2 rounded hover:bg-hover">简体中文</button><button type="button" data-lang="English" class="w-full text-left px-3 py-2 rounded hover:bg-hover">English</button></div>');
    const help = make('help', '<div class="p-1"><button type="button" class="w-full text-left px-3 py-2 rounded hover:bg-hover">新手教程</button><button type="button" class="w-full text-left px-3 py-2 rounded hover:bg-hover">快捷键说明</button><button type="button" class="w-full text-left px-3 py-2 rounded hover:bg-hover">联系支持</button></div>');
    const account = make('account', '<div class="px-3 py-2 text-[12px] text-ink-sub border-b border-line-lighter">团队管理员</div><a href="账号设置.html" class="block px-3 py-2 rounded hover:bg-hover">账号设置</a><a href="设置.html" class="block px-3 py-2 rounded hover:bg-hover">偏好设置</a>');
    const anchor = name => topbar.querySelector(`#${name}`);
    const close = () => document.querySelectorAll('.yundeng-popover').forEach(x => x.classList.add('hidden'));
    const open = (node, button) => { close(); const r = button.getBoundingClientRect(); node.style.top = `${r.bottom + 8}px`; node.style.right = `${Math.max(12, innerWidth - r.right)}px`; node.classList.remove('hidden'); };
    [['noticeBtn', notices], ['languageBtn', language], ['helpBtn', help], ['accountBtn', account]].forEach(([id, node]) => { const button = anchor(id); if (button) button.onclick = e => { e.stopPropagation(); node.classList.contains('hidden') ? open(node, button) : close(); }; });
    document.addEventListener('click', e => { if (!e.target.closest('.yundeng-popover')) close(); });
  }

  function setupInteractions(sidebar, main, topbar) {
    const backdrop = document.createElement('div'); backdrop.className = 'yundeng-mobile-backdrop'; backdrop.dataset.open = 'false'; document.body.appendChild(backdrop);
    const collapse = sidebar.querySelector('#collapseBtn');
    let compact = false;
    const setCompact = value => { compact = value; sidebar.classList.toggle('compact', compact); if (collapse) { collapse.title = compact ? '展开侧栏' : '收起侧栏'; collapse.setAttribute('aria-label', collapse.title); collapse.innerHTML = `<i data-lucide="${compact ? 'panel-left-open' : 'panel-left-close'}" class="w-[18px]"></i>`; } window.lucide?.createIcons?.(); };
    collapse && (collapse.onclick = () => setCompact(!compact));
    const mobile = topbar?.querySelector('#mobileMenu, .yundeng-mobile-menu');
    mobile && (mobile.onclick = () => { const open = !sidebar.classList.contains('yundeng-mobile-open'); sidebar.classList.toggle('yundeng-mobile-open', open); backdrop.dataset.open = String(open); });
    backdrop.onclick = () => { sidebar.classList.remove('yundeng-mobile-open'); backdrop.dataset.open = 'false'; };
    const nav = document.getElementById('yundeng-primary-nav');
    nav?.addEventListener('click', e => { const group = e.target.closest('[data-group-key]'); if (!group) return; e.preventDefault(); const sub = group.nextElementSibling; const expanded = group.getAttribute('aria-expanded') !== 'true'; group.setAttribute('aria-expanded', String(expanded)); sub.dataset.expanded = String(expanded); try { const saved = JSON.parse(localStorage.getItem(shellStateKey) || '{}'); saved[group.dataset.groupKey] = expanded; localStorage.setItem(shellStateKey, JSON.stringify(saved)); } catch (_) {} });
    document.addEventListener('click', e => { if (e.target.closest('a.yundeng-menu-link, .yundeng-create, .yundeng-bottom-link')) sidebar.classList.remove('yundeng-mobile-open'); });
    document.addEventListener('click', e => {
      const link = e.target.closest('a.yundeng-menu-link, a.yundeng-create, a.yundeng-bottom-link');
      const dirty = document.getElementById('dirtyBadge');
      if (!link || !dirty || dirty.classList.contains('hidden')) return;
      if (!confirm('当前有未保存修改，离开后将丢失。确定继续吗？')) { e.preventDefault(); return; }
      window.yundengPrepareNavigation?.(link.href);
    }, true);
  }

  function init() {
    addStyles();
    ensureIcons();
    const { sidebar, main } = ensureShell();
    createShellSidebar(sidebar);
    const nav = document.getElementById('yundeng-primary-nav');
    renderNav(nav);
    const topbar = findTopbar(main);
    setupTopbar(topbar);
    setupPopovers(topbar);
    setupInteractions(sidebar, main, topbar);
    const create = sidebar.querySelector('.yundeng-create, #createBrowserBtn');
    if (create && create.tagName === 'BUTTON') create.onclick = () => { location.href = '新建浏览器.html'; };
    document.body.classList.add('yundeng-shell-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
