(function () {
  'use strict';

  const ASSET_VERSION = '20260821a';
  const DEFAULT_ROUTE_KEY = 'home';
  const ONBOARDING_ICON_HTML = '<i data-lucide="compass" class="yundeng-onboarding-icon" aria-hidden="true"></i>';

  const NAV = [
    { key: 'home', label: '首页', icon: 'house', href: '首页.html' },
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
    { key: 'settings', label: '设置', icon: 'settings-2', href: '设置.html' },
    { key: 'help', label: '帮助', icon: 'circle-help', href: '帮助.html' }
  ];
  const allItems = NAV.flatMap(item => item.children || [item]).concat(EXTRA);
  const basename = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const searchParams = new URLSearchParams(location.search);
  const shellParamNames = new Set(['page', 'module', 'moduleHash', 'moduleSearch', 'embedded', 'guide']);
  const isSystemFrame = basename === '系统框架.html';
  const isEmbedded = window.top !== window.self;
  const pageAliases = { '系统框架.html':DEFAULT_ROUTE_KEY, '首页.html':DEFAULT_ROUTE_KEY, '编辑浏览器.html':'environment' };
  const requestedPage = searchParams.get('page');
  const requestedItem = isSystemFrame && requestedPage
    ? allItems.find(item => item.key === requestedPage || item.label === requestedPage || item.href === requestedPage)
    : null;
  const routeItem = requestedItem || allItems.find(item => item.key === DEFAULT_ROUTE_KEY);
  const allowedModuleFiles = new Set(allItems.map(item => item.href).concat('编辑浏览器.html'));
  // 业务模块直开统一回到 SystemFrame；仅允许显式嵌入态在当前文档承载业务内容。
  const STANDALONE_FILES = new Set();
  const requestedModule = searchParams.get('module');
  const requestedModuleItem = allowedModuleFiles.has(requestedModule) ? itemForModule(requestedModule) : null;
  const routedModule = isSystemFrame
    ? (requestedModuleItem?.key === routeItem?.key ? requestedModule : routeItem?.href || '首页.html')
    : basename;
  const pageKey = isSystemFrame
    ? (routeItem?.key || DEFAULT_ROUTE_KEY)
    : (pageAliases[basename] || allItems.find(item => item.href === basename)?.key || 'index');
  const pageLabel = isSystemFrame
    ? (routedModule === '编辑浏览器.html' ? '编辑浏览器' : routeItem?.label || '首页')
    : ({ 'index.html':'原型导航', '系统框架.html':'系统框架', '编辑浏览器.html':'编辑浏览器' })[basename] || allItems.find(item => item.key === pageKey)?.label || document.title.replace(/^云登\s*[·-]?\s*|\s*[-·]\s*云登$/g, '');
  const shellAnnotationsEnabled = isSystemFrame;
  const shellAnno = id => shellAnnotationsEnabled ? `data-anno="${id}"` : '';
  const refreshAnnotations = () => requestAnimationFrame(() => {
    window.renderAnnoBadges?.();
    window.renderAnno?.();
  });
  const shellStateKey = 'yundeng-sidebar-expanded-v3';
  const shellTransitionKey = 'yundeng-sidebar-transition-v1';
  const compactStateKey = 'yundeng-sidebar-compact-v1';

  function itemForModule(file) {
    if (['首页.html', '系统框架.html', 'index.html'].includes(file)) return allItems.find(item => item.key === DEFAULT_ROUTE_KEY);
    if (file === '编辑浏览器.html') return allItems.find(item => item.key === 'environment');
    return allItems.find(item => item.href === file) || null;
  }

  function groupForPageKey(key) {
    return NAV.find(item => item.group && item.children.some(child => child.key === key)) || null;
  }

  function readExpandedGroups() {
    try {
      const saved = JSON.parse(localStorage.getItem(shellStateKey) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function writeExpandedGroups(expanded) {
    try { localStorage.setItem(shellStateKey, JSON.stringify(expanded)); } catch (_) {}
  }

  function syncExpandedGroupsForPage(targetPageKey, preserveOtherGroups = false) {
    const targetItem = allItems.find(item => item.key === targetPageKey);
    if (!targetItem) return;
    const targetGroup = groupForPageKey(targetItem.key);
    const expanded = readExpandedGroups();
    if (preserveOtherGroups && targetGroup) expanded[targetGroup.key] = true;
    else NAV.filter(item => item.group).forEach(item => { expanded[item.key] = item.key === targetGroup?.key; });
    writeExpandedGroups(expanded);
  }

  function rememberExpandedGroupTransition(targetPageKey, preserveOtherGroups) {
    try {
      if (preserveOtherGroups) sessionStorage.setItem(shellTransitionKey, JSON.stringify({ targetPageKey }));
      else sessionStorage.removeItem(shellTransitionKey);
    } catch (_) {}
  }

  function consumeExpandedGroupTransition(targetPageKey) {
    try {
      const transition = JSON.parse(sessionStorage.getItem(shellTransitionKey) || 'null');
      sessionStorage.removeItem(shellTransitionKey);
      return transition?.targetPageKey === targetPageKey;
    } catch (_) {
      return false;
    }
  }

  function syncExpandedGroupsForHref(href) {
    try {
      const url = new URL(href, location.href);
      const targetBasename = decodeURIComponent(url.pathname.split('/').pop() || '');
      if (targetBasename !== '系统框架.html') return;
      const targetPageKey = url.searchParams.get('page');
      const targetGroup = groupForPageKey(targetPageKey);
      const currentGroup = groupForPageKey(pageKey);
      const preserveOtherGroups = Boolean(targetGroup && targetGroup.key === currentGroup?.key);
      syncExpandedGroupsForPage(targetPageKey, preserveOtherGroups);
      rememberExpandedGroupTransition(targetPageKey, preserveOtherGroups);
    } catch (_) {}
  }

  function shellRouteHref(key, options = {}) {
    const item = allItems.find(candidate => candidate.key === key) || allItems.find(candidate => candidate.key === DEFAULT_ROUTE_KEY);
    // 业务页的品牌入口回到根导航；SystemFrame 内部仍使用 page=home。
    if (!isSystemFrame && !isEmbedded && item.key === DEFAULT_ROUTE_KEY && !options.module) return '../index.html';
    const moduleFile = allowedModuleFiles.has(options.module) ? options.module : item.href;
    const params = new URLSearchParams();
    params.set('page', item.key);
    if (moduleFile !== item.href) params.set('module', moduleFile);
    const namespacedModuleParams = new URLSearchParams();
    const outerParams = new URLSearchParams(String(options.search || '').replace(/^\?/, ''));
    new URLSearchParams(outerParams.get('moduleSearch') || '').forEach((value, name) => namespacedModuleParams.append(name, value));
    outerParams.forEach((value, name) => {
      if (!shellParamNames.has(name)) params.append(name, value);
    });
    const moduleParams = new URLSearchParams(String(options.moduleSearch || '').replace(/^\?/, ''));
    new URLSearchParams(moduleParams.get('moduleSearch') || '').forEach((value, name) => namespacedModuleParams.append(name, value));
    moduleParams.delete('moduleSearch');
    moduleParams.delete('embedded');
    moduleParams.forEach((value, name) => {
      if (shellParamNames.has(name)) namespacedModuleParams.append(name, value);
      else params.append(name, value);
    });
    if (namespacedModuleParams.size) params.set('moduleSearch', namespacedModuleParams.toString());
    const hash = String(options.hash || '').replace(/^#/, '');
    if (hash) params.set('moduleHash', hash);
    return `系统框架.html?${params.toString()}`;
  }

  function embeddedModuleSrc() {
    const params = new URLSearchParams(searchParams.get('moduleSearch') || '');
    searchParams.forEach((value, name) => {
      if (!shellParamNames.has(name)) params.append(name, value);
    });
    params.set('embedded', '1');
    const hash = searchParams.get('moduleHash');
    let normalizedHash = '';
    if (hash) {
      const hashUrl = new URL('https://yundeng.invalid/');
      hashUrl.hash = hash.startsWith('#') ? hash : `#${hash}`;
      normalizedHash = hashUrl.hash;
    }
    return `${routedModule}?${params.toString()}${normalizedHash}`;
  }

  function redirectStandaloneModule() {
    if (isSystemFrame || isEmbedded || STANDALONE_FILES.has(basename) || !allowedModuleFiles.has(basename)) return false;
    const item = itemForModule(basename);
    if (!item) return false;
    location.replace(shellRouteHref(item.key, { module: basename, moduleSearch: location.search, hash: location.hash }));
    return true;
  }

  if (redirectStandaloneModule()) return;
  document.documentElement.dataset.yundengRuntimePending = 'true';

  function addStyles() {
    ['公共导航.css', '筛选布局.css', '分页器.css'].forEach(file => {
      if (document.querySelector(`link[data-yundeng-asset="${file}"], link[href^="${file}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${file}?v=${ASSET_VERSION}`;
      link.dataset.yundengAsset = file;
      document.head.appendChild(link);
    });
  }

  function addPaginationEnhancer() {
    if (window.YDPager || document.querySelector('script[data-yundeng-pagination]')) {
      window.YDPager?.enhanceLegacy?.(document);
      return;
    }
    const script = document.createElement('script');
    script.src = `分页器.js?v=${ASSET_VERSION}`;
    script.dataset.yundengPagination = 'true';
    script.onload = () => window.YDPager?.enhanceLegacy?.(document);
    document.head.appendChild(script);
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
    const appColumn = main.parentElement === host ? main : main.parentElement;
    if (appColumn && appColumn !== document.body) appColumn.dataset.yundengAppColumn = 'true';
    return { sidebar, main, host };
  }

  function findTopbar(main) {
    const wrapper = main?.parentElement;
    return directChild(wrapper, 'header') || directChild(main, 'header') || document.querySelector('header.h-14');
  }

  function setupBrowserFrame(host, topbar) {
    if (!host) return null;
    let frame = document.getElementById('yundeng-app-frame');
    if (!frame) {
      frame = document.createElement('div');
      frame.id = 'yundeng-app-frame';
      host.parentNode.insertBefore(frame, host);
    }
    let browser = document.getElementById('yundeng-browser-frame');
    if (!browser) {
      browser = document.createElement('section');
      browser.id = 'yundeng-browser-frame';
    }
    browser.className = 'yundeng-browser-frame';
    browser.setAttribute('aria-label', '浏览器工具栏');
    browser.innerHTML = `
      <div class="yundeng-tab-strip">
        <div class="yundeng-window-controls" aria-hidden="true"><span class="is-danger"></span><span class="is-warning"></span><span class="is-success"></span></div>
        <div class="yundeng-tab-cluster">
          <div id="yundeng-browser-tabs" class="yundeng-browser-tabs" role="tablist" aria-label="浏览器标签页"></div>
          <button type="button" id="yundeng-new-tab" class="yundeng-browser-button yundeng-new-tab" ${shellAnno(3)} title="新增标签页" aria-label="新增标签页"><i data-lucide="plus"></i></button>
        </div>
      </div>
      <div class="yundeng-browser-toolbar">
        <div class="yundeng-history-actions" ${shellAnno(4)}>
          <button type="button" id="yundeng-browser-back" class="yundeng-browser-button" title="后退" aria-label="后退"><i data-lucide="arrow-left"></i></button>
          <button type="button" id="yundeng-browser-forward" class="yundeng-browser-button" title="前进" aria-label="前进"><i data-lucide="arrow-right"></i></button>
          <button type="button" id="yundeng-browser-reload" class="yundeng-browser-button" title="重新加载" aria-label="重新加载"><i data-lucide="rotate-cw"></i></button>
        </div>
        <form id="yundeng-address-form" class="yundeng-address-form" ${shellAnno(5)} role="search"><i data-lucide="search" aria-hidden="true"></i><input id="yundeng-address-input" type="text" autocomplete="off" spellcheck="false" aria-label="搜索或输入地址"><button type="button" id="yundeng-bookmark-button" class="yundeng-bookmark-button" data-yundeng-tooltip="为此标签页添加书签" title="为此标签页添加书签" aria-label="为此标签页添加书签" aria-pressed="false"><i data-lucide="star"></i></button></form>
        <div class="yundeng-browser-actions">
          <button type="button" id="yundeng-extensions-button" class="yundeng-browser-button" ${shellAnno(6)} title="扩展程序" aria-label="扩展程序" aria-haspopup="dialog" aria-controls="yundeng-extensions-panel" aria-expanded="false"><i data-lucide="puzzle"></i></button>
          <button type="button" id="yundeng-download-button" class="yundeng-browser-button" ${shellAnno(7)} title="下载内容" aria-label="下载内容" aria-haspopup="dialog" aria-controls="yundeng-download-panel" aria-expanded="false"><i data-lucide="download"></i></button>
          <button type="button" id="yundeng-more-button" class="yundeng-browser-button" ${shellAnno(8)} title="更多" aria-label="更多" aria-haspopup="menu" aria-controls="yundeng-more-panel" aria-expanded="false"><i data-lucide="ellipsis-vertical"></i></button>
          <div id="yundeng-extensions-panel" class="yundeng-browser-panel yundeng-extensions-panel hidden" role="dialog" aria-label="扩展程序" aria-modal="false" tabindex="-1">
            <div class="yundeng-panel-header"><strong>扩展程序</strong><button type="button" class="yundeng-panel-close" data-browser-panel-close title="关闭扩展程序" aria-label="关闭扩展程序"><i data-lucide="x"></i></button></div>
            <div class="yundeng-panel-copy"><strong>完全访问权限</strong><p>这些扩展程序可以查看和更改此网站上的信息。</p></div>
            <div class="yundeng-extension-row"><span class="yundeng-extension-icon"><i data-lucide="scan-line"></i></span><span class="yundeng-extension-name">element-selector</span><button type="button" class="yundeng-panel-icon-button" data-extension-action="pin" aria-pressed="false" title="固定扩展程序" aria-label="固定扩展程序"><i data-lucide="pin"></i></button><button type="button" class="yundeng-panel-icon-button" data-extension-action="more" aria-expanded="false" aria-controls="yundeng-extension-more-menu" title="更多扩展程序选项" aria-label="更多扩展程序选项"><i data-lucide="ellipsis-vertical"></i></button></div>
            <div id="yundeng-extension-more-menu" class="yundeng-extension-more-menu" role="menu" hidden><button type="button" role="menuitem" data-extension-action="copy"><i data-lucide="copy"></i><span>复制已选择元素</span></button><button type="button" role="menuitem" data-extension-action="permission"><i data-lucide="shield-check"></i><span>管理网站访问权限</span></button></div>
            <button type="button" class="yundeng-panel-footer" data-browser-action="manage-extensions"><i data-lucide="settings"></i><span>管理扩展程序</span></button>
          </div>
          <div id="yundeng-download-panel" class="yundeng-browser-panel yundeng-download-panel hidden" role="dialog" aria-label="下载内容" tabindex="-1"><div class="yundeng-panel-header"><strong>下载内容</strong><button type="button" class="yundeng-panel-close" data-browser-panel-close title="关闭下载内容" aria-label="关闭下载内容"><i data-lucide="x"></i></button></div><div class="yundeng-download-empty"><i data-lucide="download-cloud"></i><p>暂无下载任务</p></div></div>
          <div id="yundeng-more-panel" class="yundeng-browser-panel yundeng-more-panel hidden" role="menu" aria-label="更多" tabindex="-1">
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="new-tab"><i data-lucide="square-plus"></i><span>打开新的标签页</span><span class="yundeng-more-shortcut">⌘T</span></button>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="history"><i data-lucide="history"></i><span>历史记录</span><i data-lucide="chevron-right" class="yundeng-more-chevron"></i></button>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="downloads"><i data-lucide="download"></i><span>下载内容</span><span class="yundeng-more-shortcut">⌥⌘L</span></button>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="bookmarks"><i data-lucide="bookmark"></i><span>书签</span><i data-lucide="chevron-right" class="yundeng-more-chevron"></i></button>
            <div class="yundeng-more-divider" role="separator"></div>
            <div class="yundeng-zoom-row"><button type="button" class="yundeng-panel-icon-button" data-browser-action="zoom-out" title="缩小" aria-label="缩小"><i data-lucide="minus"></i></button><span id="yundeng-zoom-level">100%</span><button type="button" class="yundeng-panel-icon-button" data-browser-action="zoom-in" title="放大" aria-label="放大"><i data-lucide="plus"></i></button><button type="button" class="yundeng-panel-icon-button" data-browser-action="fullscreen" title="全屏" aria-label="全屏"><i data-lucide="maximize"></i></button></div>
            <div class="yundeng-more-divider" role="separator"></div>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="print"><i data-lucide="printer"></i><span>打印…</span><span class="yundeng-more-shortcut">⌘P</span></button>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="find"><i data-lucide="search"></i><span>查找…</span><span class="yundeng-more-shortcut">⌘F</span></button>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="more-tools"><i data-lucide="wrench"></i><span>更多工具</span><i data-lucide="chevron-right" class="yundeng-more-chevron"></i></button>
            <div class="yundeng-more-divider" role="separator"></div>
            <button type="button" class="yundeng-more-item" role="menuitem" data-browser-action="manage-extensions"><i data-lucide="puzzle"></i><span>插件管理</span></button>
          </div>
        </div>
        <span id="yundeng-browser-status" class="yundeng-sr-only" aria-live="polite"></span>
      </div>`;

    if (host.parentElement !== frame) frame.appendChild(host);
    frame.insertBefore(browser, frame.firstChild);
    if (topbar) frame.insertBefore(topbar, host);

    const tabsHost = browser.querySelector('#yundeng-browser-tabs');
    const addressForm = browser.querySelector('#yundeng-address-form');
    const addressInput = browser.querySelector('#yundeng-address-input');
    const bookmarkButton = browser.querySelector('#yundeng-bookmark-button');
    const backButton = browser.querySelector('#yundeng-browser-back');
    const forwardButton = browser.querySelector('#yundeng-browser-forward');
    const reloadButton = browser.querySelector('#yundeng-browser-reload');
    const extensionsButton = browser.querySelector('#yundeng-extensions-button');
    const downloadButton = browser.querySelector('#yundeng-download-button');
    const moreButton = browser.querySelector('#yundeng-more-button');
    const extensionsPanel = browser.querySelector('#yundeng-extensions-panel');
    const downloadPanel = browser.querySelector('#yundeng-download-panel');
    const morePanel = browser.querySelector('#yundeng-more-panel');
    const status = browser.querySelector('#yundeng-browser-status');
    let nextTabId = 1;
    const makeTab = (title = '新的标签页', address = 'https://app.yunlogin.com/new-tab') => ({ id: `browser-tab-${nextTabId++}`, title, history: [address], historyIndex: 0, bookmarked: false });
    let tabs = [makeTab(`云登 · ${pageLabel}`, `https://app.yunlogin.com/${pageKey}`)];
    let activeTabId = tabs[0].id;
    const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
    const activeTab = () => tabs.find(tab => tab.id === activeTabId) || tabs[0];
    const currentAddress = tab => tab.history[tab.historyIndex];
    const titleFromAddress = address => {
      try {
        const url = new URL(address);
        const query = url.searchParams.get('q');
        return query ? `搜索：${query}` : url.hostname.replace(/^www\./, '') || '新的标签页';
      } catch (_) { return address || '新的标签页'; }
    };
    const announce = message => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = message; }); };
    const syncBrowserControls = () => {
      const tab = activeTab();
      if (!tab) return;
      addressInput.value = currentAddress(tab);
      bookmarkButton.setAttribute('aria-pressed', String(Boolean(tab.bookmarked)));
      bookmarkButton.dataset.bookmarked = String(Boolean(tab.bookmarked));
      const browserNavigation = window.navigation;
      backButton.disabled = isSystemFrame
        ? (browserNavigation ? !browserNavigation.canGoBack : true)
        : tab.historyIndex <= 0;
      forwardButton.disabled = isSystemFrame
        ? (browserNavigation ? !browserNavigation.canGoForward : true)
        : tab.historyIndex >= tab.history.length - 1;
    };
    const renderTabs = () => {
      tabsHost.innerHTML = tabs.map(tab => `<div class="yundeng-browser-tab" ${tab.id === activeTabId ? shellAnno(1) : ''} data-tab-id="${tab.id}" data-active="${tab.id === activeTabId}" role="tab" aria-selected="${tab.id === activeTabId}" tabindex="${tab.id === activeTabId ? '0' : '-1'}" title="${escapeHtml(tab.title)}"><span class="yundeng-browser-tab-mark">云</span><span class="yundeng-browser-tab-title">${escapeHtml(tab.title)}</span><button type="button" class="yundeng-close-tab" ${tab.id === activeTabId ? shellAnno(2) : ''} data-close-tab="${tab.id}" title="关闭标签页" aria-label="关闭${escapeHtml(tab.title)}"><i data-lucide="x"></i></button></div>`).join('');
      syncBrowserControls();
      window.lucide?.createIcons?.();
      refreshAnnotations();
    };
    const selectTab = id => { if (!tabs.some(tab => tab.id === id)) return; activeTabId = id; renderTabs(); tabsHost.querySelector(`[data-tab-id="${id}"]`)?.scrollIntoView({ block:'nearest', inline:'nearest' }); };
    const addTab = () => { const tab = makeTab(); tabs.push(tab); activeTabId = tab.id; renderTabs(); addressInput.focus(); addressInput.select(); announce('已新增标签页'); };
    const closeTab = id => {
      const index = tabs.findIndex(tab => tab.id === id);
      if (index < 0) return;
      if (tabs.length === 1) tabs = [makeTab()];
      else tabs.splice(index, 1);
      if (!tabs.some(tab => tab.id === activeTabId)) activeTabId = tabs[Math.min(index, tabs.length - 1)].id;
      renderTabs();
      tabsHost.querySelector(`[data-tab-id="${activeTabId}"]`)?.focus();
      announce('已关闭标签页');
    };
    const normalizeAddress = raw => {
      const value = raw.trim();
      if (/^https?:\/\//i.test(value)) return value;
      if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(value) && !value.includes(' ')) return `https://${value}`;
      return `https://app.yunlogin.com/search?q=${encodeURIComponent(value)}`;
    };
    const commitAddress = raw => {
      if (!raw.trim()) {
        const message = '请输入搜索内容或地址';
        addressForm.dataset.invalid = 'true';
        addressInput.setAttribute('aria-invalid', 'true');
        addressInput.setCustomValidity(message);
        addressInput.reportValidity();
        announce(message);
        return;
      }
      delete addressForm.dataset.invalid;
      addressInput.removeAttribute('aria-invalid');
      addressInput.setCustomValidity('');
      const tab = activeTab();
      const address = normalizeAddress(raw);
      tab.history = tab.history.slice(0, tab.historyIndex + 1).concat(address);
      tab.historyIndex = tab.history.length - 1;
      tab.title = titleFromAddress(address);
      tab.bookmarked = false;
      renderTabs();
      announce(`已打开${tab.title}`);
    };
    const moveHistory = delta => {
      if (isSystemFrame) {
        if (window.yundengHistoryNavigate) window.yundengHistoryNavigate(delta);
        else history.go(delta);
        announce(delta < 0 ? '正在返回上一页' : '正在前往下一页');
        return;
      }
      const tab = activeTab();
      const next = tab.historyIndex + delta;
      if (next < 0 || next >= tab.history.length) return;
      tab.historyIndex = next;
      tab.title = titleFromAddress(currentAddress(tab));
      renderTabs();
      announce(delta < 0 ? '已后退' : '已前进');
    };
    const reload = () => {
      if (isSystemFrame) {
        announce('正在重新加载页面');
        if (window.yundengReloadShell) window.yundengReloadShell();
        else location.reload();
        return;
      }
      reloadButton.classList.remove('is-spinning');
      requestAnimationFrame(() => reloadButton.classList.add('is-spinning'));
      setTimeout(() => reloadButton.classList.remove('is-spinning'), 450);
      announce('页面已重新加载');
    };
    let panelReturnFocus = moreButton;
    const extensionMoreMenu = browser.querySelector('#yundeng-extension-more-menu');
    const annotationToggle = document.getElementById('annoToggle');
    let annotationToggleWasHidden = Boolean(annotationToggle?.hidden);
    const hideAnnotationToggle = () => {
      if (!annotationToggle) return;
      annotationToggleWasHidden = Boolean(annotationToggle.hidden);
      annotationToggle.hidden = true;
    };
    const restoreAnnotationToggle = () => {
      if (!annotationToggle || annotationToggleWasHidden) return;
      annotationToggle.hidden = false;
    };
    const closeExtensionMoreMenu = () => {
      if (!extensionMoreMenu) return;
      extensionMoreMenu.hidden = true;
      const more = extensionsPanel.querySelector('[data-extension-action="more"]');
      more?.setAttribute('aria-expanded', 'false');
    };
    const closePanels = () => {
      extensionsPanel.classList.add('hidden');
      downloadPanel.classList.add('hidden');
      morePanel.classList.add('hidden');
      closeExtensionMoreMenu();
      extensionsButton.setAttribute('aria-expanded', 'false');
      downloadButton.setAttribute('aria-expanded', 'false');
      moreButton.setAttribute('aria-expanded', 'false');
      restoreAnnotationToggle();
    };
    const togglePanel = (panel, button) => {
      const shouldOpen = panel.classList.contains('hidden');
      closePanels();
      if (shouldOpen) {
        panelReturnFocus = button;
        hideAnnotationToggle();
        panel.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
      }
    };

    tabsHost.addEventListener('click', event => { const close = event.target.closest('[data-close-tab]'); if (close) { event.stopPropagation(); closeTab(close.dataset.closeTab); return; } const tab = event.target.closest('[data-tab-id]'); if (tab) selectTab(tab.dataset.tabId); });
    tabsHost.addEventListener('keydown', event => { const tab = event.target.closest('[data-tab-id]'); if (!tab) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectTab(tab.dataset.tabId); } });
    browser.querySelector('#yundeng-new-tab').onclick = addTab;
    addressForm.onsubmit = event => { event.preventDefault(); commitAddress(addressInput.value); };
    addressInput.addEventListener('input', () => {
      if (!addressInput.validity.customError) return;
      delete addressForm.dataset.invalid;
      addressInput.removeAttribute('aria-invalid');
      addressInput.setCustomValidity('');
    });
    backButton.onclick = () => moveHistory(-1);
    forwardButton.onclick = () => moveHistory(1);
    reloadButton.onclick = reload;
    extensionsButton.onclick = event => { event.stopPropagation(); togglePanel(extensionsPanel, extensionsButton); };
    downloadButton.onclick = event => { event.stopPropagation(); togglePanel(downloadPanel, downloadButton); };
    moreButton.onclick = event => { event.stopPropagation(); togglePanel(morePanel, moreButton); };
    bookmarkButton.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      const tab = activeTab();
      tab.bookmarked = !tab.bookmarked;
      syncBrowserControls();
      announce(tab.bookmarked ? '已为此标签页添加书签' : '已取消此标签页书签');
    };
    browser.querySelectorAll('[data-browser-panel-close]').forEach(button => {
      button.onclick = event => { event.stopPropagation(); closePanels(); panelReturnFocus.focus(); };
    });
    extensionsPanel.addEventListener('click', event => {
      const browserAction = event.target.closest('[data-browser-action]')?.dataset.browserAction;
      if (browserAction === 'manage-extensions') {
        event.stopPropagation();
        announce('扩展程序管理将在后续版本接入');
        return;
      }
      const action = event.target.closest('[data-extension-action]')?.dataset.extensionAction;
      if (!action) return;
      event.stopPropagation();
      if (action === 'pin') {
        const button = event.target.closest('[data-extension-action="pin"]');
        const pinned = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(pinned));
        button.dataset.pinned = String(pinned);
        announce(pinned ? '已固定扩展程序' : '已取消固定扩展程序');
      } else if (action === 'more') {
        const button = event.target.closest('[data-extension-action="more"]');
        const open = extensionMoreMenu.hidden;
        closeExtensionMoreMenu();
        extensionMoreMenu.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
      } else if (action === 'copy') {
        closeExtensionMoreMenu();
        announce('已复制已选择元素');
      } else if (action === 'permission') {
        closeExtensionMoreMenu();
        announce('已打开网站访问权限设置');
      }
    });
    let zoomLevel = 100;
    const updateZoom = delta => {
      zoomLevel = Math.min(200, Math.max(50, zoomLevel + delta));
      browser.querySelector('#yundeng-zoom-level').textContent = `${zoomLevel}%`;
      announce(`缩放比例 ${zoomLevel}%`);
    };
    morePanel.onclick = event => {
      const action = event.target.closest('[data-browser-action]')?.dataset.browserAction;
      if (!action) return;
      event.stopPropagation();
      if (action === 'downloads') { closePanels(); togglePanel(downloadPanel, downloadButton); return; }
      closePanels();
      if (action === 'new-tab') addTab();
      else if (action === 'reload') reload();
      else if (action === 'manage-extensions') togglePanel(extensionsPanel, extensionsButton);
      else if (action === 'zoom-out') { togglePanel(morePanel, moreButton); updateZoom(-10); }
      else if (action === 'zoom-in') { togglePanel(morePanel, moreButton); updateZoom(10); }
      else if (action === 'fullscreen') announce('已切换全屏显示');
      else if (action === 'print') announce('打印功能将在后续版本接入');
      else if (action === 'find') { addressInput.focus(); announce('已聚焦搜索框'); }
      else if (action === 'history') announce('历史记录功能将在后续版本接入');
      else if (action === 'bookmarks') announce('书签管理功能将在后续版本接入');
      else if (action === 'more-tools') announce('更多工具功能将在后续版本接入');
    };
    document.addEventListener('click', event => { if (!event.target.closest('.yundeng-browser-actions')) closePanels(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && (!extensionsPanel.classList.contains('hidden') || !downloadPanel.classList.contains('hidden') || !morePanel.classList.contains('hidden'))) { closePanels(); panelReturnFocus.focus(); return; }
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'l') { event.preventDefault(); addressInput.focus(); addressInput.select(); }
      else if (key === 't') { event.preventDefault(); addTab(); }
      else if (key === 'w') { event.preventDefault(); closeTab(activeTabId); }
    });
    renderTabs();
    return browser;
  }

  function createShellSidebar(sidebar) {
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `<div class="yundeng-create-wrap"><a class="yundeng-create" href="${shellRouteHref('create')}" ${shellAnno(10)} title="新建浏览器"><i data-lucide="plus" class="w-4"></i><span class="create-label">新建浏览器</span></a></div><nav id="yundeng-primary-nav" aria-label="业务模块"></nav><div class="yundeng-sidebar-bottom"><div class="yundeng-sidebar-divider"></div><a class="yundeng-bottom-link" data-active="${pageKey === 'settings'}" href="${shellRouteHref('settings')}" title="设置"><i data-lucide="settings-2" class="menu-icon"></i><span class="bottom-label">设置</span></a><a class="yundeng-bottom-link" data-active="${pageKey === 'help'}" href="${shellRouteHref('help')}" title="帮助"><i data-lucide="circle-help" class="menu-icon"></i><span class="bottom-label">帮助</span></a></div><button type="button" id="collapseBtn" class="yundeng-sidebar-toggle" ${shellAnno(11)} title="收起侧栏" aria-label="收起侧栏" aria-expanded="true"><i data-lucide="triangle" class="yundeng-solid-arrow"></i></button>`;
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
    const icon = child ? '' : `<i data-lucide="${item.icon}" class="menu-icon"></i>`;
    return `<a href="${shellRouteHref(item.key)}" class="yundeng-menu-link ${child ? 'yundeng-secondary-link' : ''}" ${shellAnno(12)} data-active="${active}" data-page-key="${item.key}" title="${item.label}">${icon}<span class="menu-label nav-label truncate">${item.label}</span></a>`;
  }

  function renderNav(nav) {
    syncExpandedGroupsForPage(pageKey, consumeExpandedGroupTransition(pageKey));
    const expanded = readExpandedGroups();
    nav.innerHTML = NAV.map(item => item.group ? `<div class="yundeng-group"><button type="button" class="yundeng-group-toggle" ${shellAnno(13)} data-active="${item.children.some(child => child.key === pageKey)}" aria-expanded="${expanded[item.key] !== false}" data-group-key="${item.key}"><i data-lucide="${item.icon}" class="menu-icon"></i><span class="menu-label nav-label">${item.label}</span><i data-lucide="chevron-down" class="yundeng-group-chevron w-3.5 h-3.5 ml-auto"></i></button><div class="yundeng-subnav" data-expanded="${expanded[item.key] !== false}">${item.children.map(child => itemLink(child, true)).join('')}</div></div>` : itemLink(item, false)).join('');
    window.lucide?.createIcons?.();
  }

  function setupTopbar(topbar) {
    if (!topbar) return;
    topbar.dataset.yundengTopbar = 'true';
    const hadDirty = isSystemFrame || Boolean(document.getElementById('dirtyBadge'));
    topbar.className = '';
    topbar.innerHTML = `<div class="yundeng-topbar-start"><button type="button" id="mobileMenu" class="yundeng-mobile-menu yundeng-icon-button" aria-label="展开导航" aria-controls="sidebar" aria-expanded="false"><i data-lucide="menu"></i></button><a class="yundeng-platform-brand" ${shellAnno(9)} href="${shellRouteHref(DEFAULT_ROUTE_KEY)}" aria-label="云登首页"><span class="yundeng-platform-mark">云</span><span class="yundeng-platform-name">云登</span></a>${hadDirty ? '<span id="dirtyBadge" class="yundeng-dirty hidden">有未保存修改</span>' : ''}</div><div class="yundeng-topbar-actions"><button type="button" id="helpBtn" class="yundeng-icon-button" ${shellAnno(14)} aria-label="新手引导" data-yundeng-tooltip="新手引导" aria-haspopup="dialog" aria-controls="yundengOnboardingPanel" aria-expanded="false">${ONBOARDING_ICON_HTML}</button><button type="button" id="noticeBtn" class="yundeng-icon-button" ${shellAnno(15)} aria-label="通知" data-yundeng-tooltip="通知" aria-haspopup="dialog" aria-expanded="false"><i data-lucide="bell"></i></button><button type="button" id="languageBtn" class="yundeng-icon-button" ${shellAnno(16)} aria-label="界面语言" data-yundeng-tooltip="界面语言" aria-haspopup="dialog" aria-expanded="false"><i data-lucide="languages"></i></button><span class="yundeng-divider"></span><button type="button" id="accountBtn" class="yundeng-account" ${shellAnno(17)} aria-label="账号菜单" aria-haspopup="dialog" aria-expanded="false"><span class="yundeng-avatar">张</span><span class="yundeng-account-name">张小登</span><i data-lucide="chevron-down" class="yundeng-account-chevron"></i></button></div>`;
    window.lucide?.createIcons?.();
  }

  function setupPopovers(topbar) {
    const make = (name, label, html) => {
      let node = document.getElementById(`yundeng-${name}`);
      if (!node) {
        node = document.createElement('div');
        node.id = `yundeng-${name}`;
        node.className = 'yundeng-popover hidden';
        node.setAttribute('role', 'dialog');
        node.setAttribute('aria-label', label);
        node.innerHTML = html;
        document.body.appendChild(node);
      }
      return node;
    };
    const notices = make('notices', '通知', '<div class="px-4 py-3 border-b border-line flex items-center justify-between gap-4"><strong>通知</strong><button type="button" data-yundeng-read class="text-primary">全部已读</button></div><div class="px-4 py-4 text-[12px] text-ink-sub">暂无新的未读通知</div>');
    const language = make('languages', '界面语言', '<div class="px-3 py-3"><div class="text-[12px] text-ink-sub mb-2">当前界面语言</div><button type="button" data-lang="简体中文" aria-current="true" class="w-full text-left px-3 py-2 rounded bg-primary-bg text-primary">简体中文</button></div>');
    const account = make('account', '账号菜单', `<div class="px-3 py-2 text-[12px] text-ink-sub border-b border-line-lighter">团队管理员</div><a href="${shellRouteHref('account-settings')}" class="block px-3 py-2 rounded hover:bg-hover">账号设置</a><a href="${shellRouteHref('settings')}" class="block px-3 py-2 rounded hover:bg-hover">偏好设置</a>`);
    const pairs = [['noticeBtn', notices], ['languageBtn', language], ['accountBtn', account]];
    let activeButton = null;
    let closeTimer = null;

    const cancelScheduledClose = () => {
      if (closeTimer === null) return;
      clearTimeout(closeTimer);
      closeTimer = null;
    };

    const close = (restoreFocus = false) => {
      cancelScheduledClose();
      pairs.forEach(([id, node]) => {
        node.classList.add('hidden');
        topbar.querySelector(`#${id}`)?.setAttribute('aria-expanded', 'false');
      });
      if (restoreFocus) activeButton?.focus();
      activeButton = null;
    };
    const scheduleClose = () => {
      cancelScheduledClose();
      closeTimer = window.setTimeout(() => close(false), 180);
    };
    const open = (node, button) => {
      close(false);
      activeButton = button;
      const rect = button.getBoundingClientRect();
      node.style.top = `${rect.bottom + 8}px`;
      node.style.right = `${Math.max(12, innerWidth - rect.right)}px`;
      node.classList.remove('hidden');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-controls', node.id);
      requestAnimationFrame(() => node.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])')?.focus());
    };

    pairs.forEach(([id, node]) => {
      const button = topbar.querySelector(`#${id}`);
      if (!button) return;
      button.onclick = event => {
        event.stopPropagation();
        node.classList.contains('hidden') ? open(node, button) : close(true);
      };
      button.addEventListener('mouseenter', cancelScheduledClose);
      button.addEventListener('mouseleave', scheduleClose);
      node.addEventListener('mouseenter', cancelScheduledClose);
      node.addEventListener('mouseleave', scheduleClose);
    });
    document.addEventListener('click', event => { if (!event.target.closest('.yundeng-popover')) close(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && activeButton) close(true); });
  }

  function setupOnboardingGuide(topbar) {
    if (!isSystemFrame || !topbar || document.getElementById('yundengOnboardingOverlay')) return;
    document.querySelectorAll('#helpPopover, #yundeng-help').forEach(node => node.remove());

    const trigger = topbar.querySelector('#helpBtn');
    if (!trigger) return;
    const overlay = document.createElement('div');
    overlay.id = 'yundengOnboardingOverlay';
    overlay.className = 'yundeng-onboarding-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<section id="yundengOnboardingPanel" class="yundeng-onboarding-panel" role="dialog" aria-modal="true" aria-label="新手引导" aria-owns="yundengOnboardingAnnotationToggle" tabindex="-1"><div class="yundeng-onboarding-loading" role="status"><i data-lucide="loader-circle" aria-hidden="true"></i><span>正在准备新手引导</span></div><iframe id="yundengOnboardingFrame" class="yundeng-onboarding-frame" title="新手引导" loading="eager"></iframe></section><button id="yundengOnboardingAnnotationToggle" class="yundeng-onboarding-annotation-toggle" type="button" aria-pressed="false" aria-controls="yundengOnboardingFrame" aria-label="显示新手引导标注，长按可调整纵向位置" title="点击显示标注，长按调整位置"><i data-lucide="tags" aria-hidden="true"></i><span>显示标注</span></button>`;
    document.body.appendChild(overlay);

    const panel = overlay.querySelector('#yundengOnboardingPanel');
    const frame = overlay.querySelector('#yundengOnboardingFrame');
    const loading = overlay.querySelector('.yundeng-onboarding-loading');
    const guideAnnotationToggle = overlay.querySelector('#yundengOnboardingAnnotationToggle');
    const consumedKey = 'yundeng-new-user-guide-auto-consumed-v1';
    const previewSessionKey = 'yundeng-new-user-guide-preview-session-v1';
    const annotationPositionKey = 'yundeng-onboarding-annotation-toggle-position-v1';
    let frameReady = false;
    let pendingSource = null;
    let returnFocus = null;
    let annotationToggleWasHidden = false;
    let annotationLayerWasHidden = false;
    let assistantButtonWasHidden = false;
    let backgroundInertStates = [];
    let annotationPointerId = null;
    let annotationPointerStartY = 0;
    let annotationPointerStartTop = 0;
    let annotationPressTimer = null;
    let annotationDragging = false;
    let suppressAnnotationClick = false;

    const markConsumed = () => {
      try { localStorage.setItem(consumedKey, new Date().toISOString()); } catch (_) {}
    };
    const hasConsumed = () => {
      try { return Boolean(localStorage.getItem(consumedKey)); } catch (_) { return true; }
    };
    const markPreviewSession = () => {
      try { sessionStorage.setItem(previewSessionKey, '1'); } catch (_) {}
    };
    const hasPreviewSession = () => {
      try { return sessionStorage.getItem(previewSessionKey) === '1'; } catch (_) { return false; }
    };
    const syncGuideAnnotationToggle = visible => {
      const active = Boolean(visible);
      guideAnnotationToggle.setAttribute('aria-pressed', String(active));
      guideAnnotationToggle.dataset.annotationVisible = String(active);
      guideAnnotationToggle.setAttribute('aria-label', `${active ? '隐藏' : '显示'}新手引导标注，长按可调整纵向位置`);
      guideAnnotationToggle.title = `点击${active ? '隐藏' : '显示'}标注，长按调整位置`;
      const label = guideAnnotationToggle.querySelector('span');
      if (label) label.textContent = active ? '隐藏标注' : '显示标注';
    };
    const placeGuideAnnotationToggle = top => {
      const height = guideAnnotationToggle.getBoundingClientRect().height || 32;
      const safeTop = Math.min(Math.max(top, 8), Math.max(8, innerHeight - height - 8));
      guideAnnotationToggle.style.top = `${safeTop}px`;
      guideAnnotationToggle.style.transform = 'none';
      return safeTop;
    };
    const restoreGuideAnnotationPosition = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(annotationPositionKey) || '{}');
        if (Number.isFinite(saved.top)) placeGuideAnnotationToggle(saved.top);
      } catch (_) {}
    };
    const clearAnnotationPressTimer = () => {
      clearTimeout(annotationPressTimer);
      annotationPressTimer = null;
    };
    const hideBackgroundTools = () => {
      window.closeAnnoPopup?.();
      document.querySelector('[data-yundeng-assistant-close]')?.click();
      document.querySelector('#assistantDrawer:not(.hidden) [data-close="assistantDrawer"]')?.click();
      const annotationToggle = document.getElementById('annoToggle');
      const annotationLayer = document.getElementById('annoLayer');
      const assistantButton = document.querySelector('#assistantBtn, #assistantButton, [data-yundeng-assistant-button]');
      annotationToggleWasHidden = Boolean(annotationToggle?.hidden);
      annotationLayerWasHidden = Boolean(annotationLayer?.hidden);
      assistantButtonWasHidden = Boolean(assistantButton?.hidden);
      if (annotationToggle) annotationToggle.hidden = true;
      if (annotationLayer) annotationLayer.hidden = true;
      if (assistantButton) assistantButton.hidden = true;
    };
    const restoreBackgroundTools = () => {
      const annotationToggle = document.getElementById('annoToggle');
      const annotationLayer = document.getElementById('annoLayer');
      const assistantButton = document.querySelector('#assistantBtn, #assistantButton, [data-yundeng-assistant-button]');
      if (annotationToggle) annotationToggle.hidden = annotationToggleWasHidden;
      if (annotationLayer) annotationLayer.hidden = annotationLayerWasHidden;
      if (assistantButton) assistantButton.hidden = assistantButtonWasHidden;
    };
    const setBackgroundInert = inert => {
      if (inert) {
        backgroundInertStates = [...document.body.children]
          .filter(node => node instanceof HTMLElement && node !== overlay)
          .map(node => ({ node, inert: node.inert }));
        backgroundInertStates.forEach(({ node }) => { node.inert = true; });
        return;
      }
      backgroundInertStates.forEach(({ node, inert: previous }) => { node.inert = previous; });
      backgroundInertStates = [];
    };
    const show = source => {
      if (!overlay.hidden) return;
      // 原型使用 localStorage 模拟账号级“首次打开即消费”；guide=1 仅用于评审预览，不改变状态。
      if (source !== 'preview' && !hasConsumed()) markConsumed();
      returnFocus = source === 'topbar' ? trigger : document.activeElement;
      hideBackgroundTools();
      setBackgroundInert(true);
      overlay.hidden = false;
      syncGuideAnnotationToggle(false);
      document.body.classList.add('yundeng-onboarding-open');
      trigger.setAttribute('aria-expanded', 'true');
      window.pushAnnoScope?.(panel);
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-reset', source }, '*');
      requestAnimationFrame(() => {
        restoreGuideAnnotationPosition();
        frame.focus({ preventScroll: true });
      });
    };
    const requestOpen = source => {
      pendingSource = source;
      if (!frameReady) return;
      const requested = pendingSource;
      pendingSource = null;
      show(requested);
    };
    const close = (restoreFocus = true) => {
      if (overlay.hidden) return;
      overlay.hidden = true;
      syncGuideAnnotationToggle(false);
      document.body.classList.remove('yundeng-onboarding-open');
      trigger.setAttribute('aria-expanded', 'false');
      window.popAnnoScope?.(panel);
      setBackgroundInert(false);
      restoreBackgroundTools();
      if (restoreFocus) (returnFocus?.isConnected ? returnFocus : trigger).focus({ preventScroll: true });
      returnFocus = null;
    };

    trigger.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      requestOpen('topbar');
    });
    guideAnnotationToggle.style.touchAction = 'none';
    guideAnnotationToggle.style.userSelect = 'none';
    guideAnnotationToggle.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      annotationPointerId = event.pointerId;
      annotationPointerStartY = event.clientY;
      annotationPointerStartTop = guideAnnotationToggle.getBoundingClientRect().top;
      annotationDragging = false;
      suppressAnnotationClick = false;
      clearAnnotationPressTimer();
      annotationPressTimer = setTimeout(() => {
        if (annotationPointerId !== event.pointerId) return;
        annotationDragging = true;
        guideAnnotationToggle.dataset.dragging = 'true';
        guideAnnotationToggle.setPointerCapture?.(annotationPointerId);
      }, 350);
    });
    guideAnnotationToggle.addEventListener('pointermove', event => {
      if (event.pointerId !== annotationPointerId) return;
      const deltaY = event.clientY - annotationPointerStartY;
      if (!annotationDragging) {
        if (Math.abs(deltaY) > 6) {
          clearAnnotationPressTimer();
          suppressAnnotationClick = true;
        }
        return;
      }
      event.preventDefault();
      placeGuideAnnotationToggle(annotationPointerStartTop + deltaY);
    });
    const finishAnnotationPointer = event => {
      if (event.pointerId !== annotationPointerId) return;
      clearAnnotationPressTimer();
      if (annotationDragging) {
        const top = placeGuideAnnotationToggle(guideAnnotationToggle.getBoundingClientRect().top);
        try { localStorage.setItem(annotationPositionKey, JSON.stringify({ top })); } catch (_) {}
        suppressAnnotationClick = true;
      }
      if (guideAnnotationToggle.hasPointerCapture?.(annotationPointerId)) guideAnnotationToggle.releasePointerCapture(annotationPointerId);
      annotationPointerId = null;
      annotationDragging = false;
      delete guideAnnotationToggle.dataset.dragging;
    };
    guideAnnotationToggle.addEventListener('pointerup', finishAnnotationPointer);
    guideAnnotationToggle.addEventListener('pointercancel', finishAnnotationPointer);
    guideAnnotationToggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (suppressAnnotationClick) {
        suppressAnnotationClick = false;
        return;
      }
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-annotation-toggle' }, '*');
    });
    guideAnnotationToggle.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-focus-edge', edge: event.shiftKey ? 'last' : 'first' }, '*');
    });
    overlay.addEventListener('click', event => {
      if (event.target !== overlay) return;
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-close-request' }, '*');
      close(true);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || overlay.hidden) return;
      event.preventDefault();
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-close-request' }, '*');
      close(true);
    });
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || !event.data) return;
      if (event.data.type === 'yundeng:onboarding-annotation-state') {
        syncGuideAnnotationToggle(event.data.visible);
        return;
      }
      if (event.data.type === 'yundeng:onboarding-focus-annotation') {
        if (!overlay.hidden) guideAnnotationToggle.focus({ preventScroll: true });
        return;
      }
      if (event.data.type === 'yundeng:onboarding-ready') {
        frameReady = true;
        loading.hidden = true;
        if (pendingSource) {
          const requested = pendingSource;
          pendingSource = null;
          show(requested);
        }
        return;
      }
      if (event.data.type === 'yundeng:onboarding-close') {
        close(true);
        return;
      }
      if (event.data.type === 'yundeng:onboarding-navigate') {
        const item = allItems.find(candidate => candidate.key === event.data.page)
          || itemForModule(event.data.file)
          || allItems.find(candidate => candidate.key === 'environment');
        const moduleFile = allowedModuleFiles.has(event.data.file) ? event.data.file : item.href;
        const href = shellRouteHref(item.key, { module: moduleFile });
        if (window.yundengNavigateShell) {
          Promise.resolve(window.yundengNavigateShell(href)).then(navigated => {
            if (!navigated) {
              frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-navigation-cancelled' }, '*');
              return;
            }
            close(false);
          });
        } else {
          close(false);
          location.assign(href);
        }
      }
    });
    frame.addEventListener('load', () => {
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-ping' }, '*');
      setTimeout(() => {
        if (frameReady) return;
        frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-ping' }, '*');
        loading.innerHTML = '<i data-lucide="circle-alert" aria-hidden="true"></i><span>新手引导加载较慢，请稍候</span>';
        window.lucide?.createIcons?.();
      }, 4000);
    });
    window.addEventListener('resize', () => {
      if (overlay.hidden || !guideAnnotationToggle.style.top) return;
      placeGuideAnnotationToggle(parseFloat(guideAnnotationToggle.style.top));
    });

    frame.src = '新手引导.html?embedded=guide';
    window.openYundengOnboarding = () => requestOpen('topbar');
    const forceOpen = searchParams.get('guide') === '1';
    if (forceOpen) {
      markPreviewSession();
      searchParams.delete('guide');
      try {
        const cleanUrl = new URL(location.href);
        cleanUrl.searchParams.delete('guide');
        history.replaceState(history.state, '', cleanUrl);
      } catch (_) {}
    }
    if (forceOpen || (!hasConsumed() && !hasPreviewSession())) requestOpen(forceOpen ? 'preview' : 'auto');
    window.lucide?.createIcons?.();
  }

  function setupAssistant() {
    if (document.querySelector('#assistantBtn, #assistantButton, [data-yundeng-assistant-button]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'yundengAssistantButton';
    button.className = 'yundeng-assistant-button';
    button.dataset.yundengAssistantButton = 'true';
    button.title = '打开云登智能助手';
    button.setAttribute('aria-label', '打开云登智能助手');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'yundengAssistantPanel');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<i data-lucide="sparkles" aria-hidden="true"></i>';

    const overlay = document.createElement('div');
    overlay.id = 'yundengAssistantDrawer';
    overlay.className = 'yundeng-assistant-overlay';
    overlay.dataset.yundengAssistantDrawer = 'true';
    overlay.hidden = true;
    overlay.innerHTML = `<section id="yundengAssistantPanel" class="yundeng-assistant-panel" role="dialog" aria-modal="true" aria-labelledby="yundengAssistantTitle" tabindex="-1"><header class="yundeng-assistant-header"><div class="yundeng-assistant-heading"><span class="yundeng-assistant-mark" aria-hidden="true"><i data-lucide="sparkles"></i></span><h2 id="yundengAssistantTitle">云登智能助手</h2></div><button type="button" class="yundeng-assistant-close" data-yundeng-assistant-close title="关闭" aria-label="关闭云登智能助手"><i data-lucide="x" aria-hidden="true"></i></button></header><div class="yundeng-assistant-body"><div class="yundeng-assistant-welcome"><strong>你好，我是云登助手。</strong><p>今天需要处理什么？</p></div><div class="yundeng-assistant-questions" aria-label="常见问题"><button type="button" data-yundeng-question="如何新建浏览器？">如何新建浏览器？</button><button type="button" data-yundeng-question="在哪里管理代理？">在哪里管理代理？</button><button type="button" data-yundeng-question="如何邀请团队成员？">如何邀请团队成员？</button></div><div class="yundeng-assistant-reply" data-yundeng-assistant-reply role="status" aria-live="polite" hidden></div></div><form class="yundeng-assistant-form" data-yundeng-assistant-form novalidate><label class="yundeng-sr-only" for="yundengAssistantInput">输入问题</label><input id="yundengAssistantInput" type="text" maxlength="120" autocomplete="off" placeholder="输入问题"><button type="submit">发送</button></form></section>`;

    document.body.append(button, overlay);
    const panel = overlay.querySelector('#yundengAssistantPanel');
    const closeButton = overlay.querySelector('[data-yundeng-assistant-close]');
    const form = overlay.querySelector('[data-yundeng-assistant-form]');
    const input = overlay.querySelector('#yundengAssistantInput');
    const reply = overlay.querySelector('[data-yundeng-assistant-reply]');
    let returnFocus = null;
    let annotationToggleWasHidden = false;

    const focusableElements = () => Array.from(panel.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter(node => !node.hidden && node.getAttribute('aria-hidden') !== 'true');
    const open = () => {
      if (!overlay.hidden) return;
      returnFocus = document.activeElement;
      const annotationToggle = document.getElementById('annoToggle');
      annotationToggleWasHidden = Boolean(annotationToggle?.hidden);
      if (annotationToggle) annotationToggle.hidden = true;
      overlay.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      window.pushAnnoScope?.(panel);
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    };
    const close = () => {
      if (overlay.hidden) return;
      overlay.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      window.popAnnoScope?.(panel);
      const annotationToggle = document.getElementById('annoToggle');
      if (annotationToggle) annotationToggle.hidden = annotationToggleWasHidden;
      (returnFocus?.isConnected ? returnFocus : button).focus({ preventScroll: true });
      returnFocus = null;
    };

    button.addEventListener('click', open);
    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    overlay.querySelectorAll('[data-yundeng-question]').forEach(question => {
      question.addEventListener('click', () => {
        input.value = question.dataset.yundengQuestion;
        input.removeAttribute('aria-invalid');
        input.setCustomValidity('');
        input.focus();
      });
    });
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      input.setCustomValidity('');
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) {
        const message = '请输入问题后再发送';
        input.setAttribute('aria-invalid', 'true');
        input.setCustomValidity(message);
        input.reportValidity();
        return;
      }
      input.removeAttribute('aria-invalid');
      input.setCustomValidity('');
      reply.textContent = '助手服务暂未连接，请稍后再试。';
      reply.hidden = false;
    });
    document.addEventListener('keydown', event => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = focusableElements();
      if (!focusable.length) { event.preventDefault(); panel.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.lucide?.createIcons?.();
  }

  function initEmbeddedModule() {
    document.body.dataset.yundengEmbedded = 'true';
    const businessRoot = document.getElementById('mainContent')
      || document.querySelector('.app-shell main')
      || document.querySelector('main');

    if (businessRoot) {
      businessRoot.dataset.yundengBusinessRoot = 'true';
      let current = businessRoot;
      while (current && current !== document.body) {
        current.dataset.yundengEmbedPath = 'true';
        const parent = current.parentElement;
        if (!parent) break;
        Array.from(parent.children).forEach(sibling => {
          if (sibling === current) return;
          if (sibling.matches('aside, header, #sidebar, #mobileScrim, #yundeng-browser-frame, [data-yundeng-topbar], .topbar')) {
            sibling.dataset.yundengEmbedShell = 'true';
            sibling.setAttribute('aria-hidden', 'true');
          }
        });
        current = parent;
      }
    }

    document.querySelectorAll('#yundeng-browser-frame, #sidebar, #mobileScrim, .yundeng-mobile-backdrop, #assistantBtn, #assistantButton, #yundengAssistantButton, [data-yundeng-assistant-button], #assistantDrawer, #serviceRoot, #yundengAssistantDrawer, [data-yundeng-assistant-drawer], #noticePopover, #languagePopover, #helpPopover, #accountPopover, .yundeng-popover').forEach(node => {
      node.dataset.yundengEmbedShell = 'true';
      node.setAttribute('aria-hidden', 'true');
    });

    const postToShell = message => {
      if (window.parent === window) return;
      window.parent.postMessage(message, '*');
    };
    const syncAnnotations = visible => {
      const toggle = document.getElementById('annoToggle');
      if (!toggle) return;
      const stored = document.body.dataset.yundengAnnotationsVisible;
      const current = stored == null ? toggle.getAttribute('aria-pressed') === 'true' : stored === 'true';
      if (current === Boolean(visible)) return;
      if (typeof window.toggleAnnotations === 'function') window.toggleAnnotations();
      else toggle.click();
      document.body.dataset.yundengAnnotationsVisible = String(Boolean(visible));
      requestAnimationFrame(() => {
        window.renderAnnoBadges?.();
        window.renderAnno?.();
      });
    };
    const reportDirty = () => {
      const badge = document.getElementById('dirtyBadge');
      const dirty = Boolean(badge && !badge.classList.contains('hidden') && !badge.hidden);
      postToShell({ type: 'yundeng:dirty', dirty });
    };
    const pendingPreparations = new Map();
    const reportModuleState = () => {
      postToShell({ type: 'yundeng:module-state', file: basename, search: location.search, hash: location.hash, title: document.title });
    };
    ['pushState', 'replaceState'].forEach(method => {
      const original = history[method].bind(history);
      history[method] = function (...args) {
        const result = original(...args);
        queueMicrotask(reportModuleState);
        return result;
      };
    });
    window.addEventListener('hashchange', reportModuleState);
    window.addEventListener('popstate', reportModuleState);

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(?:mailto:|tel:|javascript:)/i.test(raw)) return;
      let target;
      try { target = new URL(raw, location.href); } catch (_) { return; }
      const file = decodeURIComponent(target.pathname.split('/').pop() || '');
      let targetFile = file;
      let targetSearch = target.search;
      let targetHash = target.hash;
      let item = itemForModule(file);
      if (file === '系统框架.html') {
        const page = target.searchParams.get('page');
        item = allItems.find(candidate => candidate.key === page || candidate.label === page || candidate.href === page) || item;
        const moduleFile = target.searchParams.get('module');
        targetFile = allowedModuleFiles.has(moduleFile) && itemForModule(moduleFile)?.key === item?.key ? moduleFile : item?.href;
        const params = new URLSearchParams(target.searchParams.get('moduleSearch') || '');
        target.searchParams.forEach((value, name) => {
          if (!shellParamNames.has(name)) params.append(name, value);
        });
        targetSearch = params.toString() ? `?${params.toString()}` : '';
        const moduleHash = target.searchParams.get('moduleHash');
        targetHash = moduleHash ? `#${moduleHash}` : target.hash;
      }
      if (!item) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      postToShell({ type: 'yundeng:route', file: allowedModuleFiles.has(targetFile) ? targetFile : item.href, search: targetSearch, hash: targetHash });
    }, true);

    window.addEventListener('message', event => {
      if (event.source !== window.parent || !event.data) return;
      if (event.data.type === 'yundeng:annotations') syncAnnotations(event.data.visible);
      if (event.data.type === 'yundeng:prepare-navigation') {
        const requestId = event.data.requestId;
        const dirtyBadge = document.getElementById('dirtyBadge');
        const preparationState = {
          cancelled: false,
          wasDirty: Boolean(dirtyBadge && !dirtyBadge.classList.contains('hidden') && !dirtyBadge.hidden)
        };
        pendingPreparations.set(requestId, preparationState);
        const acknowledge = () => {
          pendingPreparations.delete(requestId);
          if (preparationState.cancelled) {
            if (preparationState.wasDirty) dirtyBadge?.classList.remove('hidden');
            reportDirty();
            return;
          }
          dirtyBadge?.classList.add('hidden');
          reportDirty();
          postToShell({ type: 'yundeng:prepare-navigation-ack', requestId });
        };
        try {
          const preparation = window.yundengPrepareNavigation?.();
          if (preparation && typeof preparation.then === 'function') preparation.then(acknowledge, acknowledge);
          else acknowledge();
        } catch (_) {
          acknowledge();
        }
      }
      if (event.data.type === 'yundeng:prepare-navigation-cancel') {
        const preparationState = pendingPreparations.get(event.data.requestId);
        if (!preparationState) return;
        preparationState.cancelled = true;
        window.yundengCancelNavigationPreparation?.();
        if (preparationState.wasDirty) document.getElementById('dirtyBadge')?.classList.remove('hidden');
        reportDirty();
      }
    });

    const dirtyBadge = document.getElementById('dirtyBadge');
    if (dirtyBadge && typeof dirtyBadge.nodeType === 'number') {
      try { new MutationObserver(reportDirty).observe(dirtyBadge, { attributes: true, attributeFilter: ['class', 'hidden'] }); } catch (_) {}
    }
    requestAnimationFrame(() => {
      window.lucide?.createIcons?.();
      window.YDPager?.enhanceLegacy?.(document);
      window.renderAnnoBadges?.();
      window.renderAnno?.();
      window.dispatchEvent(new Event('resize'));
      reportDirty();
      postToShell({ type: 'yundeng:module-ready', file: basename, search: location.search, hash: location.hash, title: document.title });
    });
  }

  function setupRouter(main) {
    if (!isSystemFrame || !main) return null;
    document.body.dataset.yundengSystemFrame = 'true';
    document.title = `云登 · ${pageLabel}`;
    const outlet = document.getElementById('routeOutlet');
    if (!outlet) return null;
    outlet.className = 'yundeng-router-outlet';
    outlet.setAttribute('aria-label', `${pageLabel}业务内容区`);
    outlet.innerHTML = `<div class="yundeng-route-loading" data-state="loading" role="status" aria-live="polite"><i data-lucide="loader-circle" aria-hidden="true"></i><span>正在加载${pageLabel}</span></div><iframe id="yundengModuleFrame" class="yundeng-module-frame" name="yundeng-module-frame" title="${pageLabel}" src="${embeddedModuleSrc()}" loading="eager"></iframe>`;
    const frame = outlet.querySelector('#yundengModuleFrame');
    const loading = outlet.querySelector('.yundeng-route-loading');
    const dirtyBadge = document.getElementById('dirtyBadge');
    let moduleDirty = false;
    let moduleReady = false;
    let moduleBackgroundControls = [];
    let moduleBackgroundRequestedHidden = false;
    const syncModuleBackgroundControls = hidden => {
      const controls = [
        document.getElementById('annoToggle'),
        document.getElementById('annoLayer'),
        document.querySelector('#assistantBtn, #assistantButton, [data-yundeng-assistant-button]')
      ].filter(Boolean);
      if (hidden) {
        if (moduleBackgroundControls.length) return;
        moduleBackgroundControls = controls.map(node => ({ node, hidden: node.hidden, display: node.style.display }));
        controls.forEach(node => { node.hidden = true; node.style.display = 'none'; });
        return;
      }
      moduleBackgroundControls.forEach(({ node, hidden: wasHidden, display }) => {
        if (!node.isConnected) return;
        node.hidden = wasHidden;
        node.style.display = display;
      });
      moduleBackgroundControls = [];
    };
    const markReady = () => {
      moduleReady = true;
      clearTimeout(loadTimeout);
      loading.hidden = true;
    };
    const showLoadFailure = () => {
      if (moduleReady) return;
      moduleBackgroundRequestedHidden = false;
      syncModuleBackgroundControls(false);
      loading.hidden = false;
      loading.dataset.state = 'error';
      loading.innerHTML = `<i data-lucide="circle-alert" aria-hidden="true"></i><div><strong>${pageLabel}加载失败</strong><span>请确认模块文件存在后重新加载。</span></div><button type="button">重新加载</button>`;
      loading.querySelector('button').onclick = () => location.reload();
      window.lucide?.createIcons?.();
    };
    const loadTimeout = setTimeout(showLoadFailure, 8000);

    const setDirty = dirty => {
      moduleDirty = Boolean(dirty);
      dirtyBadge?.classList.toggle('hidden', !moduleDirty);
    };
    window.addEventListener('beforeunload', event => {
      if (!moduleDirty) return;
      event.preventDefault();
      event.returnValue = '';
    });
    const annotationsVisible = () => document.getElementById('annoToggle')?.getAttribute('aria-pressed') === 'true';
    const syncAnnotations = () => frame.contentWindow?.postMessage({ type: 'yundeng:annotations', visible: annotationsVisible() }, '*');
    let prepareSequence = 0;
    const prepareWaiters = new Map();
    const prepareChildNavigation = () => new Promise(resolve => {
      if (!frame.contentWindow || !moduleReady) {
        resolve(false);
        return;
      }
      const requestId = `prepare-${Date.now()}-${++prepareSequence}`;
      const timer = setTimeout(() => {
        prepareWaiters.delete(requestId);
        frame.contentWindow?.postMessage({ type: 'yundeng:prepare-navigation-cancel', requestId }, '*');
        resolve(false);
      }, 5000);
      prepareWaiters.set(requestId, { resolve, timer });
      frame.contentWindow.postMessage({ type: 'yundeng:prepare-navigation', requestId }, '*');
    });
    const confirmDiscard = () => !moduleDirty || confirm('当前有未保存修改，离开后将丢失。确定继续吗？');
    const syncModuleRouteState = data => {
      const item = itemForModule(data.file);
      if (!item || data.file !== routedModule) return false;
      const href = shellRouteHref(item.key, { module: data.file, moduleSearch: data.search, hash: data.hash });
      const nextUrl = new URL(href, location.href).href;
      if (nextUrl !== location.href) history.replaceState(history.state, '', href);
      return true;
    };
    const finishNavigation = async action => {
      if (moduleDirty && !await prepareChildNavigation()) return false;
      moduleBackgroundRequestedHidden = false;
      syncModuleBackgroundControls(false);
      setDirty(false);
      setTimeout(action, 0);
      return true;
    };
    const navigate = async (href, options = {}) => {
      if (!options.confirmed && !confirmDiscard()) return false;
      return finishNavigation(() => {
        syncExpandedGroupsForHref(href);
        if (options.replace) location.replace(href);
        else location.assign(href);
      });
    };
    window.yundengNavigateShell = navigate;
    window.yundengHistoryNavigate = async delta => {
      const browserNavigation = window.navigation;
      if (!browserNavigation) return false;
      if (browserNavigation && ((delta < 0 && !browserNavigation.canGoBack) || (delta > 0 && !browserNavigation.canGoForward))) return false;
      if (!confirmDiscard()) return false;
      return finishNavigation(() => history.go(delta));
    };
    window.yundengReloadShell = async () => {
      if (!confirmDiscard()) return false;
      return finishNavigation(() => location.reload());
    };

    frame.addEventListener('load', () => {
      syncModuleBackgroundControls(moduleBackgroundRequestedHidden);
      syncAnnotations();
    });
    frame.addEventListener('error', showLoadFailure);
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || !event.data) return;
      if (event.data.type === 'yundeng:chat-visibility') {
        moduleBackgroundRequestedHidden = event.data.visible === false;
        syncModuleBackgroundControls(moduleBackgroundRequestedHidden);
        return;
      }
      if (event.data.type === 'yundeng:prepare-navigation-ack') {
        const waiter = prepareWaiters.get(event.data.requestId);
        if (!waiter) return;
        clearTimeout(waiter.timer);
        prepareWaiters.delete(event.data.requestId);
        waiter.resolve(true);
        return;
      }
      if (event.data.type === 'yundeng:dirty') {
        setDirty(event.data.dirty);
        return;
      }
      if (event.data.type === 'yundeng:route') {
        const item = itemForModule(event.data.file);
        if (!item) return;
        navigate(shellRouteHref(item.key, { module: event.data.file, moduleSearch: event.data.search, hash: event.data.hash }));
        return;
      }
      if (event.data.type === 'yundeng:module-state') {
        syncModuleRouteState(event.data);
        return;
      }
      if (event.data.type === 'yundeng:module-ready') {
        syncModuleBackgroundControls(false);
        markReady();
        const item = itemForModule(event.data.file);
        if (!item) return;
        if (event.data.file !== routedModule) {
          navigate(shellRouteHref(item.key, { module: event.data.file, moduleSearch: event.data.search, hash: event.data.hash }), { replace: true, confirmed: true });
          return;
        }
        syncModuleRouteState(event.data);
        syncAnnotations();
      }
    });
    document.getElementById('annoToggle')?.addEventListener('click', () => setTimeout(syncAnnotations, 0));
    window.lucide?.createIcons?.();
    return frame;
  }

  function setupInteractions(sidebar, main, topbar) {
    const backdrop = document.createElement('div'); backdrop.className = 'yundeng-mobile-backdrop'; backdrop.dataset.open = 'false'; backdrop.setAttribute('aria-hidden', 'true'); document.body.appendChild(backdrop);
    const collapse = sidebar.querySelector('#collapseBtn');
    let compact = false;
    try { compact = localStorage.getItem(compactStateKey) === 'true'; } catch (_) {}
    const setCompact = (value, persist = true) => { compact = value; sidebar.classList.toggle('compact', compact); if (collapse) { collapse.title = compact ? '展开侧栏' : '收起侧栏'; collapse.setAttribute('aria-label', collapse.title); collapse.setAttribute('aria-expanded', String(!compact)); collapse.innerHTML = '<i data-lucide="triangle" class="yundeng-solid-arrow"></i>'; } if (persist) { try { localStorage.setItem(compactStateKey, String(compact)); } catch (_) {} } window.lucide?.createIcons?.(); window.dispatchEvent(new CustomEvent('yundeng:sidebar-toggle', { detail: { compact } })); refreshAnnotations(); setTimeout(refreshAnnotations, 240); };
    setCompact(compact, false);
    collapse && (collapse.onclick = () => setCompact(!compact));
    const mobile = topbar?.querySelector('#mobileMenu, .yundeng-mobile-menu');
    const setMobileOpen = open => { sidebar.classList.toggle('yundeng-mobile-open', open); backdrop.dataset.open = String(open); backdrop.setAttribute('aria-hidden', String(!open)); mobile?.setAttribute('aria-expanded', String(open)); refreshAnnotations(); setTimeout(refreshAnnotations, 240); };
    mobile && (mobile.onclick = () => setMobileOpen(!sidebar.classList.contains('yundeng-mobile-open')));
    backdrop.onclick = () => setMobileOpen(false);
    const nav = document.getElementById('yundeng-primary-nav');
    nav?.addEventListener('click', e => { const group = e.target.closest('[data-group-key]'); if (!group) return; e.preventDefault(); const sub = group.nextElementSibling; const expanded = group.getAttribute('aria-expanded') !== 'true'; group.setAttribute('aria-expanded', String(expanded)); sub.dataset.expanded = String(expanded); try { const saved = JSON.parse(localStorage.getItem(shellStateKey) || '{}'); saved[group.dataset.groupKey] = expanded; localStorage.setItem(shellStateKey, JSON.stringify(saved)); } catch (_) {} refreshAnnotations(); setTimeout(refreshAnnotations, 240); });
    document.addEventListener('click', e => {
      const link = e.target.closest('a.yundeng-menu-link, a.yundeng-create, a.yundeng-bottom-link');
      if (!link) return;
      setMobileOpen(false);
      const plainNavigation = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && link.target !== '_blank';
      if (!e.defaultPrevented && plainNavigation) syncExpandedGroupsForHref(link.href);
    });
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      const dirty = document.getElementById('dirtyBadge');
      const plainNavigation = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
      if (!plainNavigation || !link || link.target === '_blank' || link.hasAttribute('download') || !dirty || dirty.classList.contains('hidden')) return;
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(?:mailto:|tel:|javascript:)/i.test(raw)) return;
      e.preventDefault();
      if (window.yundengNavigateShell) window.yundengNavigateShell(link.href);
      else if (confirm('当前有未保存修改，离开后将丢失。确定继续吗？')) {
        window.yundengPrepareNavigation?.(link.href);
        location.assign(link.href);
      }
    }, true);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && sidebar.classList.contains('yundeng-mobile-open')) { setMobileOpen(false); mobile?.focus(); } });
    addEventListener('resize', () => { if (innerWidth >= 768) setMobileOpen(false); });
  }

  function init() {
    if (basename === 'index.html') {
      delete document.documentElement.dataset.yundengRuntimePending;
      return;
    }
    if (isSystemFrame && requestedPage && !requestedItem) {
      location.replace(shellRouteHref(DEFAULT_ROUTE_KEY, { search: location.search }));
      return;
    }
    addStyles();
    addPaginationEnhancer();
    ensureIcons();
    if (isEmbedded) {
      initEmbeddedModule();
      delete document.documentElement.dataset.yundengRuntimePending;
      return;
    }
    const { sidebar, main, host } = ensureShell();
    createShellSidebar(sidebar);
    const nav = document.getElementById('yundeng-primary-nav');
    renderNav(nav);
    const topbar = findTopbar(main);
    setupBrowserFrame(host, topbar);
    setupTopbar(topbar);
    setupPopovers(topbar);
    setupRouter(main);
    setupInteractions(sidebar, main, topbar);
    setupAssistant();
    setupOnboardingGuide(topbar);
    const create = sidebar.querySelector('.yundeng-create, #createBrowserBtn');
    if (create && create.tagName === 'BUTTON') create.onclick = () => { location.href = shellRouteHref('create'); };
    document.body.classList.add('yundeng-shell-ready');
    delete document.documentElement.dataset.yundengRuntimePending;
    document.dispatchEvent(new CustomEvent('yundeng:shell-ready', { detail: { pageKey, pageLabel } }));
    requestAnimationFrame(() => {
      const annotationToggle = document.getElementById('annoToggle');
      if (annotationToggle && annotationToggle.getBoundingClientRect().top < 140) annotationToggle.style.top = '156px';
      window.renderAnnoBadges?.();
      window.renderAnno?.();
      window.dispatchEvent(new Event('resize'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
