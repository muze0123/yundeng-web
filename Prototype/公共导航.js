(function () {
  'use strict';

  // Keep module initialization alive when the CDN icon script is delayed or unavailable.
  if (!window.lucide) window.lucide = { __yundengIconStub: true, createIcons() {} };

  const ASSET_VERSION = '20261013e';
  const DEFAULT_ROUTE_KEY = 'home';
  const ONBOARDING_ICON_HTML = '<i data-lucide="compass" class="yundeng-onboarding-icon" aria-hidden="true"></i>';
  const ACCOUNT_TRAFFIC_USAGE = Object.freeze([
    { key: 'plan', label: '套餐流量', used: 6.4, remaining: 3.6, total: 10, note: '每月 1 日重置', noteIcon: 'refresh-cw' },
    { key: 'package', label: '流量包', used: 18.5, remaining: 31.5, total: 50, note: '2026-11-22 到期', noteIcon: 'calendar-clock' }
  ]);

  const NAV = [
    { key: 'home', label: '首页', icon: 'house', href: '首页.html' },
    { key: 'environment', label: '环境管理', icon: 'monitor-cog', href: '环境管理.html' },
    { key: 'proxy', label: '设备管理', icon: 'network', href: '设备管理-自有设备.html' },
    // 商城不再作为一级菜单：设备商城 / 购物车改由「设备管理 ▸ 购买设备」进入（见 STORE_VARIANTS）。
    { key: 'billing', label: '费用管理', icon: 'wallet-cards', group: true, children: [
      { key: 'billing-recharge', label: '云币充值', icon: 'wallet-cards', href: '费用管理-云币充值.html' },
      { key: 'billing-balance-details', label: '余额明细', icon: 'list', href: '费用管理-余额明细.html' },
      { key: 'billing-orders', label: '订单管理', icon: 'receipt-text', href: '费用管理-订单管理.html' },
      { key: 'billing-invoice', label: '开票管理', icon: 'file-text', href: '费用管理-开票管理.html' },
      { key: 'billing-coupons', label: '优惠券', icon: 'ticket-percent', href: '费用管理-优惠券.html' }
    ]},
    { key: 'team', label: '团队管理', icon: 'users-round', group: true, children: [
      { key: 'team-members', label: '成员管理', icon: 'users', href: '团队管理-成员管理.html' },
      { key: 'team-departments', label: '部门管理', icon: 'network', href: '团队管理-部门管理.html' },
      { key: 'team-roles', label: '角色管理', icon: 'shield-check', href: '团队管理-角色管理.html' },
      { key: 'team-applications', label: '成员申请', icon: 'user-round-plus', href: '团队管理-成员申请.html' },
      { key: 'team-logins', label: '登录请求', icon: 'monitor-check', href: '团队管理-登录请求.html' }
    ]},
    { key: 'account-management', label: '账号管理', icon: 'contact', href: '账号管理.html' },
    { key: 'transfer', label: '分享转移', icon: 'arrow-right-left', href: '分享转移.html' },
    { key: 'logs', label: '日志管理', icon: 'scroll-text', href: '日志管理.html' },
    { key: 'account-settings', label: '账号设置', icon: 'key-round', href: '账号设置.html' },
    { key: 'security', label: '安全策略', icon: 'shield-check', group: true, children: [
      { key: 'access-policy', label: '访问策略设置', icon: 'shield-check', href: '访问策略.html' },
      { key: 'access-logs', label: '访问拦截日志', icon: 'scroll-text', href: '访问日志.html' }
    ]},
    { key: 'plugins', label: '插件管理', icon: 'blocks', href: '插件管理.html' },
    { key: 'automation', label: '自动化', icon: 'workflow', group: true, children: [
      { key: 'api', label: 'API', icon: 'braces', href: 'API.html' },
      { key: 'rpa', label: 'RPA', icon: 'bot', href: 'RPA.html' }
    ]},
    { key: 'recycle', label: '回收站', icon: 'trash-2', href: '回收站.html' }
  ];
  const EXTRA = [
    { key: 'create', label: '新建环境', icon: 'circle-plus', href: '新建浏览器.html' },
    { key: 'settings', label: '设置', icon: 'settings-2', href: '设置.html' },
    { key: 'help', label: '帮助', icon: 'circle-help', href: '帮助.html' }
  ];
  // 商城相关页面已撤出一级菜单：设备商城（含购物车子页面）供「设备管理 ▸ 购买设备」跳转，
  // 套餐与套餐计价模拟仅保留文件与路由，不再在侧栏暴露入口。
  const STORE_VARIANTS = [
    { key: 'store', label: '设备商城', icon: 'shopping-bag', href: '设备管理-平台设备-购买设备.html', routeOnly: true },
    { key: 'store-plan-calculator', label: '套餐计价模拟', icon: 'calculator', href: '商城-套餐计价模拟.html', routeOnly: true }
  ];
  const ROUTE_ONLY = [
    { key: 'promotion-reward', label: '推广奖励', icon: 'badge-percent', href: '推广奖励.html', routeOnly: true },
    { key: 'device-create', label: '添加设备', icon: 'circle-plus', href: '设备管理-自有设备-添加设备.html', routeOnly: true }
  ];
  // 路由专用页面不渲染到侧栏，但必须登记到统一解析表，供 page key 和模块直开使用。
  const allItems = NAV.flatMap(item => item.children || [item]).concat(EXTRA, STORE_VARIANTS, ROUTE_ONLY);
  const STORE_PAGE_KEYS = new Set(['store', 'store-plan-calculator']);
  // 「设备商城」是唯一一个多页签共用同一 route key 的模块：page key 恒为 store，
  // 「购买设备」与「购物车」两个页签分别落在不同 HTML 文件。这里登记「页签 → 模块文件」映射，
  // 使链接只需 page=store + moduleSearch=tab=xxx 即可定位子页，地址栏不再出现中文 module 文件名，
  // 与「设备管理 ▸ 购买设备」入口（index.html?page=store）保持同一格式。
  const STORE_TAB_MODULE_FILES = Object.freeze({
    proxy: '设备管理-平台设备-购买设备.html',
    cart: '设备管理-平台设备-购物车.html'
  });
  const STORE_MODULE_TAB_FILES = Object.freeze(
    Object.fromEntries(Object.entries(STORE_TAB_MODULE_FILES).map(([tab, file]) => [file, tab]))
  );
  // 从查询串（或模块查询串）解析 tab 并反查 store 子页文件；支持整串 URL 搜索参数与嵌套 moduleSearch 两种形态。
  function storeModuleFromQuery(raw) {
    const params = new URLSearchParams(String(raw || '').replace(/^\?/, ''));
    const direct = STORE_TAB_MODULE_FILES[params.get('tab')];
    if (direct) return direct;
    const nested = new URLSearchParams(params.get('moduleSearch') || '');
    return STORE_TAB_MODULE_FILES[nested.get('tab')] || null;
  }
  const basename = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const searchParams = new URLSearchParams(location.search);
  const shellParamNames = new Set(['page', 'module', 'moduleHash', 'moduleSearch', 'embedded', 'guide', 'indexHost']);
  // 左侧菜单待处理角标：key -> 数量（team-logins = 待处理的登录请求条数，
  // team-applications = 待审批的成员申请条数）。
  // 数据来源：团队模块通过 postMessage 上报，或由共享团队数据仓库的 logins / applications 状态计算。
  const NAV_BADGE_STORE_KEY = 'yunlogin-nav-badges-v1';
  const NAV_BADGE_KEYS = ['team-logins', 'team-applications'];
  // 侧栏高亮跟随当前路由：pageKey 只是文档加载时的初始路由，
  // 壳内软导航切换模块后必须改用这个可变值，否则角标刷新等重绘会按初始
  // pageKey 渲染，左侧菜单高亮停留在上一个菜单。
  let shellCurrentPageKey = '';
  const navBadges = Object.create(null);
  const normalizeBadgeCount = value => {
    const count = Math.floor(Number(value));
    return Number.isFinite(count) && count > 0 ? count : 0;
  };
  // 待处理状态文案：登录请求「等待授权」、成员申请「待审批（兼容待审核）」。
  const PENDING_LOGIN_STATUS = new Set(['等待授权']);
  const PENDING_APPLICATION_STATUS = new Set(['待审批', '待审核']);
  // 旧版登录请求状态文案。共享数据里只要出现这些值，就说明这份 logins 还是旧结构
  //（状态旧文案 + 手机号脱敏），不能作为角标依据，否则会把模块最新上报的角标算错 / 清零。
  const LEGACY_LOGIN_STATUS = new Set(['待处理', '已允许', '已拒绝']);
  // 旧版成员申请数据同样不能作为角标依据：成员管理 / 部门管理 / 角色管理 等页面遗留的
  // 旧样例只有 1 条待审批（状态「不通过」+ 联系方式脱敏），直接派生会把「成员申请」页
  // 上报的正确角标覆盖成 1。判定口径与 团队管理-成员申请.html 的 migrateApplications 保持一致。
  const LEGACY_APPLICATION_STATUS = new Set(['不通过', '待处理']);
  const isLegacyApplication = item => Boolean(item) && (LEGACY_APPLICATION_STATUS.has(item.status) || String(item.contact || '').includes('*'));
  // 派生待处理数：字段缺失或结构不可用时返回 null（表示「未知」），
  // 调用方跳过刷新，保留模块最近一次上报的角标。
  // legacyCheck 支持状态集合或自定义判定函数（不传表示这份数据没有旧结构风险）。
  const countPending = (store, field, statuses, legacyCheck) => {
    if (!store || !Array.isArray(store[field])) return null;
    if (legacyCheck) {
      const isLegacy = typeof legacyCheck === 'function' ? legacyCheck : item => Boolean(item) && legacyCheck.has(item.status);
      if (store[field].some(isLegacy)) return null;
    }
    return store[field].filter(item => item && statuses.has(item.status)).length;
  };
  const applyDerivedNavBadges = store => {
    const logins = countPending(store, 'logins', PENDING_LOGIN_STATUS, LEGACY_LOGIN_STATUS);
    const applications = countPending(store, 'applications', PENDING_APPLICATION_STATUS, isLegacyApplication);
    if (logins !== null) setNavBadge('team-logins', logins, false);
    if (applications !== null) setNavBadge('team-applications', applications, false);
  };
  const readNavBadges = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(NAV_BADGE_STORE_KEY) || '{}');
      if (saved && typeof saved === 'object') NAV_BADGE_KEYS.forEach(key => { navBadges[key] = normalizeBadgeCount(saved[key]); });
    } catch (_) {}
  };
  const writeNavBadges = () => {
    try {
      const snapshot = {};
      NAV_BADGE_KEYS.forEach(key => { snapshot[key] = normalizeBadgeCount(navBadges[key]); });
      localStorage.setItem(NAV_BADGE_STORE_KEY, JSON.stringify(snapshot));
    } catch (_) {}
  };
  const setNavBadge = (key, value, persist = true) => {
    if (!NAV_BADGE_KEYS.includes(key)) return;
    const next = normalizeBadgeCount(value);
    if (navBadges[key] === next) return;
    navBadges[key] = next;
    if (persist) writeNavBadges();
    const nav = document.getElementById('yundeng-primary-nav');
    if (nav) renderNav(nav);
  };
  readNavBadges();

  const isSystemFrame = basename === '系统框架.html';
  const isIndexHosted = isSystemFrame && searchParams.get('indexHost') === '1';
  const isEmbedded = window.top !== window.self && !isIndexHosted;
  if (isSystemFrame) {
    const teamFiles = new Set(['团队管理-成员管理.html', '团队管理-部门管理.html', '团队管理-角色管理.html', '团队管理-成员申请.html', '团队管理-登录请求.html']);
    const teamStoreKey = 'yunlogin-team-prototype-v1';
    let teamStoreMemory = null;
    let teamOverlayRestore = null;
    try { teamStoreMemory = JSON.parse(localStorage.getItem(teamStoreKey) || 'null'); } catch (_) {}
    // 已存在共享团队数据时，直接按 logins / applications 的待处理状态回填左侧菜单角标。
    if (teamStoreMemory) applyDerivedNavBadges(teamStoreMemory);
    window.addEventListener('message', event => {
      const frame = document.getElementById('yundengModuleFrame');
      if (!frame || event.source !== frame.contentWindow) return;
      let file;
      try { file = decodeURIComponent(new URL(frame.src, location.href).pathname.split('/').pop()); } catch (_) { return; }
      if (!teamFiles.has(file)) return;
      if (event.data?.type === 'yundeng:nav-badge') {
        setNavBadge(event.data.key, event.data.count);
        return;
      }
      if (event.data?.type === 'yundeng:team-overlay') {
        const assistant = document.getElementById('assistantBtn');
        if (assistant && event.data.open === true && !teamOverlayRestore) {
          teamOverlayRestore = { hidden: assistant.hidden, display: assistant.style.getPropertyValue('display'), priority: assistant.style.getPropertyPriority('display') };
          assistant.hidden = true;
          assistant.style.setProperty('display', 'none', 'important');
        } else if (assistant && event.data.open !== true && teamOverlayRestore) {
          assistant.hidden = teamOverlayRestore.hidden;
          if (teamOverlayRestore.display) assistant.style.setProperty('display', teamOverlayRestore.display, teamOverlayRestore.priority);
          else assistant.style.removeProperty('display');
          teamOverlayRestore = null;
        }
        return;
      }
      if (event.data?.type === 'yundeng:team-store-get') {
        event.source.postMessage({ type: 'yundeng:team-store', value: teamStoreMemory }, '*');
      } else if (event.data?.type === 'yundeng:team-store-set') {
        const value = event.data.value;
        if (value?.version !== 1 || !['members', 'departments', 'roles', 'applications', 'logins'].every(key => Array.isArray(value[key]))) return;
        const serialized = JSON.stringify(value);
        if (serialized.length > 2000000) return;
        teamStoreMemory = value;
        applyDerivedNavBadges(value);
        try { localStorage.setItem(teamStoreKey, serialized); }
        catch (_) { event.source.postMessage({ type: 'yundeng:team-store-error' }, '*'); }
      }
    });
  }

  const pageAliases = {
    '系统框架.html': DEFAULT_ROUTE_KEY,
    '首页.html': DEFAULT_ROUTE_KEY,
    '编辑浏览器.html': 'environment',
    '环境管理-编辑环境.html': 'environment',
    '费用管理-云币充值.html': 'billing-recharge',
    '费用管理-账户充值.html': 'billing-recharge', // 兼容旧文件名
    '费用管理-订单管理.html': 'billing-orders',
    '费用管理-余额明细.html': 'billing-balance-details',
    '费用管理-交易流水.html': 'billing-balance-details', // 兼容旧文件名
    '费用管理-开票管理.html': 'billing-invoice',
    '费用管理-优惠券.html': 'billing-coupons'
  };
  const moduleAliases = {
    '设备购买须知.html': 'store',
    '代理购买须知.html': 'store', // 兼容旧文件名
    '设备管理-平台设备-购买设备.html': 'store',
    '商城-代理.html': 'store', // 兼容旧文件名
    '设备管理-平台设备.html': 'store',
    '设备管理-平台设备-购物车.html': 'store',
    '商城-设备.html': 'store', // 兼容旧文件名（2026-10-13 改名前）
    '商城-套餐.html': 'store', // 兼容旧文件名（2026-10-13 改名前）
    '商城-购物车.html': 'store', // 兼容旧文件名（2026-10-13 改名前）
    '商城-套餐计价模拟.html': 'store-plan-calculator',
    '费用管理-云币充值.html': 'billing-recharge',
    '费用管理-账户充值.html': 'billing-recharge', // 兼容旧文件名
    '商城-云币充值.html': 'billing-recharge', // 兼容旧文件名
    '费用管理-订单管理.html': 'billing-orders',
    '费用管理-余额明细.html': 'billing-balance-details',
    '费用管理-交易流水.html': 'billing-balance-details', // 兼容旧文件名
    '费用管理-云币交易流水.html': 'billing-balance-details', // 兼容旧文件名
    '费用管理-开票管理.html': 'billing-invoice',
    '费用管理-优惠券.html': 'billing-coupons'
  };
  const requestedPageAliases = Object.freeze({
    '首页':'home',
    '环境管理':'environment',
    '设备管理':'proxy',
    '代理管理':'proxy',
    '商城':'store',
    '商城代理':'store',
    '设备商城':'store',
    'billing':'billing-orders',
    '费用管理':'billing-orders',
    '费管理':'billing-orders',
    '账户充值':'billing-recharge',
    'billing-recharge':'billing-recharge',
    '云币充值':'billing-recharge',
    'store-coin':'billing-recharge', // 旧 key 兼容
    'billing-coin':'billing-recharge', // 旧 key 兼容
    '余额明细':'billing-balance-details',
    'billing-balance-details':'billing-balance-details',
    '交易流水':'billing-balance-details', // 旧称兼容
    'billing-transactions':'billing-balance-details', // 旧 key 兼容
    '云币交易流水':'billing-balance-details', // 旧称兼容
    'billing-coin-transactions':'billing-balance-details', // 旧 key 兼容
    '订单管理':'billing-orders',
    '开票管理':'billing-invoice',
    '优惠券':'billing-coupons',
    '团队管理':'team-members',
    'team-management':'team-members',
    '成员管理':'team-members',
    '部门管理':'team-departments',
    '角色管理':'team-roles',
    '成员申请':'team-applications',
    '登录请求':'team-logins',

    '账号管理':'account-management',
    '推广奖励':'promotion-reward',
    '分享转移':'transfer',
    '日志管理':'logs',
    '账号设置':'account-settings',
    '安全策略':'access-policy',
    '访问策略管理':'access-policy',
    '访问策略':'access-policy',
    '访问日志':'access-logs',
    '插件管理':'plugins',
    'API':'api',
    'RPA':'rpa',
    '回收站':'recycle',
    '新建浏览器':'create',
    '设置':'settings',
    '帮助':'help'
  });
  const normalizeRequestedPage = value => requestedPageAliases[String(value || '').trim()] || value;
  const requestedPage = searchParams.get('page');
  const normalizedRequestedPage = normalizeRequestedPage(requestedPage);
  const requestedItem = isSystemFrame && normalizedRequestedPage
    ? allItems.find(item => item.key === normalizedRequestedPage || item.label === normalizedRequestedPage || item.href === normalizedRequestedPage)
    : null;
  const routeItem = requestedItem || allItems.find(item => item.key === DEFAULT_ROUTE_KEY);
  const allowedModuleFiles = new Set(allItems.map(item => item.href).concat(
    '编辑浏览器.html',
    '环境管理-编辑环境.html',
    '设备购买须知.html',
    '代理购买须知.html', // 兼容旧文件名
    '设备管理-平台设备-购买设备.html',
    '商城-代理.html', // 兼容旧文件名
    '设备管理-平台设备.html',
    '设备管理-平台设备-购物车.html',
    '商城-设备.html', // 兼容旧文件名（2026-10-13 改名前）
    '商城-套餐.html', // 兼容旧文件名（2026-10-13 改名前）
    '商城-购物车.html', // 兼容旧文件名（2026-10-13 改名前）
    '设备管理.html', // 兼容旧文件名（2026-10-13 改名前）
    '添加设备.html', // 兼容旧文件名（2026-10-13 改名前）
    '商城-云币充值.html',
    '商城-套餐计价模拟.html'
  ));
  // 业务模块直开统一回到 SystemFrame；仅允许显式嵌入态在当前文档承载业务内容。
  const STANDALONE_FILES = new Set();
  // 编辑页采用新文件名；兼容已有的旧 module 书签。模块改名（代理 → 设备）后同样保留旧名回退。
  const LEGACY_MODULE_FILE_ALIASES = Object.freeze({
    '代理管理.html': '设备管理-自有设备.html',
    '商城-代理.html': '设备管理-平台设备-购买设备.html',
    '代理购买须知.html': '设备购买须知.html',
    // 2026-10-13 商城/设备模块改名前文件名 → 现文件名，保证旧 module 书签仍可打开
    '商城-设备.html': '设备管理-平台设备-购买设备.html',
    '商城-套餐.html': '设备管理-平台设备.html',
    '商城-购物车.html': '设备管理-平台设备-购物车.html',
    '设备管理.html': '设备管理-自有设备.html',
    '添加设备.html': '设备管理-自有设备-添加设备.html',
    '商城-云币充值.html': '费用管理-云币充值.html',
    '费用管理-账户充值.html': '费用管理-云币充值.html',
    '费用管理-交易流水.html': '费用管理-余额明细.html',
    '费用管理-云币交易流水.html': '费用管理-余额明细.html'
  });
  const normalizeModuleFile = file => {
    const aliased = LEGACY_MODULE_FILE_ALIASES[file] || file;
    return aliased === '编辑浏览器.html' ? '环境管理-编辑环境.html' : aliased;
  };
  const requestedModule = normalizeModuleFile(searchParams.get('module'));
  const requestedModuleItem = allowedModuleFiles.has(requestedModule) ? itemForModule(requestedModule) : null;
  // store 子页允许省略 module 参数：page=store + moduleSearch=tab=cart 即可定位购物车页（见 STORE_TAB_MODULE_FILES）。
  const requestedTabModule = routeItem?.key === 'store' ? storeModuleFromQuery(location.search) : null;
  const routedModule = isSystemFrame
    ? (requestedModuleItem?.key === routeItem?.key && allowedModuleFiles.has(requestedModule)
        ? requestedModule
        : (allowedModuleFiles.has(requestedTabModule) ? requestedTabModule : routeItem?.href || '首页.html'))
    : basename;
  const pageKey = isSystemFrame
    ? (routeItem?.key || DEFAULT_ROUTE_KEY)
    : (pageAliases[basename] || allItems.find(item => item.href === basename)?.key || 'index');
  // 初始路由即为当前高亮 key，后续由 applySidebarActiveState 在软导航时更新。
  shellCurrentPageKey = pageKey;
  const pageLabel = isSystemFrame
    ? (routedModule === '环境管理-编辑环境.html' ? '编辑环境' : routeItem?.label || '首页')
    : ({ 'index.html':'原型导航', '系统框架.html':'系统框架', '编辑浏览器.html':'编辑环境', '环境管理-编辑环境.html':'编辑环境' })[basename] || allItems.find(item => item.key === pageKey)?.label || document.title.replace(/^云登\s*[·-]?\s*|\s*[-·]\s*云登$/g, '');
  function reportIndexHostRoute() {
    if (!isIndexHosted || window.parent === window) return;
    window.parent.postMessage({ type: 'yundeng:index-route-state', page: pageKey, search: location.search }, '*');
  }
  const shellStateKey = 'yundeng-sidebar-expanded-v3';
  const compactStateKey = 'yundeng-sidebar-compact-v1';

  function itemForModule(file) {
    if (['首页.html', '系统框架.html', 'index.html'].includes(file)) return allItems.find(item => item.key === DEFAULT_ROUTE_KEY);
    if (['编辑浏览器.html', '环境管理-编辑环境.html'].includes(file)) return allItems.find(item => item.key === 'environment');
    if (moduleAliases[file]) return allItems.find(item => item.key === moduleAliases[file]);
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

  // 侧栏分组采用手风琴交互：任意时刻仅一个分组展开，其余分组一律收起。
  function syncExpandedGroupsForPage(targetPageKey) {
    const targetItem = allItems.find(item => item.key === targetPageKey);
    const targetGroup = targetItem ? groupForPageKey(targetItem.key) : null;
    const expanded = {};
    NAV.filter(item => item.group).forEach(item => { expanded[item.key] = item.key === targetGroup?.key; });
    writeExpandedGroups(expanded);
  }

  const isGroupExpanded = (expanded, key) => expanded[key] === true;

  function applySidebarExpandedState() {
    const expanded = readExpandedGroups();
    const nav = document.getElementById('yundeng-primary-nav');
    NAV.filter(item => item.group).forEach(item => {
      const toggle = nav?.querySelector(`[data-group-key="${item.key}"]`);
      const sub = toggle?.nextElementSibling;
      const isOpen = isGroupExpanded(expanded, item.key);
      toggle?.setAttribute('aria-expanded', String(isOpen));
      if (sub) sub.dataset.expanded = String(isOpen);
    });
  }

  function syncExpandedGroupsForHref(href) {
    try {
      const url = new URL(href, location.href);
      const targetBasename = decodeURIComponent(url.pathname.split('/').pop() || '');
      if (targetBasename !== '系统框架.html' && targetBasename !== 'index.html') return;
      syncExpandedGroupsForPage(url.searchParams.get('page'));
    } catch (_) {}
  }

  function shellRouteHref(key, options = {}) {
    const item = allItems.find(candidate => candidate.key === key) || allItems.find(candidate => candidate.key === DEFAULT_ROUTE_KEY);
    // 业务页的品牌入口回到根导航；SystemFrame 内部仍使用 page=home。
    if (!isSystemFrame && !isEmbedded && item.key === DEFAULT_ROUTE_KEY && !options.module) return '../index.html';
    const moduleFile = allowedModuleFiles.has(options.module) ? normalizeModuleFile(options.module) : item.href;
    const params = new URLSearchParams();
    params.set('page', item.key);
    // store 子页可由 page + tab 精确推导（见 STORE_TAB_MODULE_FILES）时省略 module 参数，
    // 使购物车链接与「购买设备」入口同格式，地址栏不出现中文文件名。
    const tabResolvable = item.key === 'store'
      && [options.moduleSearch, options.search].some(raw => storeModuleFromQuery(raw) === moduleFile);
    if (moduleFile !== item.href && !tabResolvable) params.set('module', moduleFile);
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
    if (!isSystemFrame && !isEmbedded) return `../index.html?${params.toString()}`;
    if (isIndexHosted) params.set('indexHost', '1');
    return `系统框架.html?${params.toString()}`;
  }

  function buildEmbeddedModuleSrc(moduleFile, shellSearch) {
    const shellParams = new URLSearchParams(shellSearch || '');
    const params = new URLSearchParams(shellParams.get('moduleSearch') || '');
    shellParams.forEach((value, name) => {
      if (!shellParamNames.has(name)) params.append(name, value);
    });
    params.set('embedded', '1');
    const hash = shellParams.get('moduleHash');
    let normalizedHash = '';
    if (hash) {
      const hashUrl = new URL('https://yundeng.invalid/');
      hashUrl.hash = hash.startsWith('#') ? hash : `#${hash}`;
      normalizedHash = hashUrl.hash;
    }
    return `${moduleFile}?${params.toString()}${normalizedHash}`;
  }

  function embeddedModuleSrc() {
    return buildEmbeddedModuleSrc(routedModule, location.search);
  }

  function redirectStandaloneModule() {
    if (isSystemFrame || isEmbedded || STANDALONE_FILES.has(basename) || !allowedModuleFiles.has(basename)) return false;
    const item = itemForModule(basename);
    if (!item) return false;
    // store 非默认子页（购物车）独立打开时补上页签参数：转成 page=store + tab 的紧凑路由，
    // 地址栏不出现中文 module 文件名，与「购买设备」入口保持同一格式。
    const storeTab = item.key === 'store' && basename !== item.href ? STORE_MODULE_TAB_FILES[basename] : '';
    const standaloneParams = new URLSearchParams(String(location.search || '').replace(/^\?/, ''));
    if (storeTab && !standaloneParams.get('tab')) standaloneParams.set('tab', storeTab);
    const standaloneSearch = standaloneParams.toString() ? `?${standaloneParams}` : '';
    location.replace(shellRouteHref(item.key, { module: basename, moduleSearch: standaloneSearch, hash: location.hash }));
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
    if (window.lucide && !window.lucide.__yundengIconStub) { window.lucide.createIcons(); return; }
    if (document.querySelector('script[data-yundeng-lucide]')) return;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@1.34.0/dist/umd/lucide.min.js';
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

  // App Shell：把 TopBar 与工作区包进唯一的 #yundeng-app-frame 容器。
  // 壳层只保留 TopBar + Sidebar + Router Outlet。
  function setupAppFrame(host, topbar) {
    if (!host || !host.parentElement) return null;
    let frame = document.getElementById('yundeng-app-frame');
    if (!frame) {
      frame = document.createElement('div');
      frame.id = 'yundeng-app-frame';
      host.parentElement.insertBefore(frame, host);
    }
    if (host.parentElement !== frame) frame.appendChild(host);
    if (topbar && topbar.parentElement !== frame) frame.insertBefore(topbar, host);
    return frame;
  }

  function createShellSidebar(sidebar) {
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `<div class="yundeng-create-wrap"><a class="yundeng-create" href="${shellRouteHref('create')}" title="新建环境"><i data-lucide="plus" class="w-4"></i><span class="create-label">新建环境</span></a></div><nav id="yundeng-primary-nav" aria-label="业务模块"></nav><div class="yundeng-sidebar-bottom"><div class="yundeng-sidebar-divider"></div><a class="yundeng-bottom-link" data-active="${shellCurrentPageKey === 'settings'}" href="${shellRouteHref('settings')}" title="设置"><i data-lucide="settings-2" class="menu-icon"></i><span class="bottom-label">设置</span></a><a class="yundeng-bottom-link" data-active="${shellCurrentPageKey === 'help'}" href="${shellRouteHref('help')}" title="帮助"><i data-lucide="circle-help" class="menu-icon"></i><span class="bottom-label">帮助</span></a></div><button type="button" id="collapseBtn" class="yundeng-sidebar-toggle" title="收起侧栏" aria-label="收起侧栏" aria-expanded="true"><i data-lucide="triangle" class="yundeng-solid-arrow"></i></button>`;
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

  // 菜单待处理角标：仅 NAV_BADGE_KEYS 中登记的 key 会渲染，数字超过 99 时显示 99+。
  function badgeHTML(count, text) {
    if (!count) return '';
    const value = count > 99 ? '99+' : String(count);
    return `<span class="yundeng-menu-badge" title="${text} ${value}" aria-label="${text} ${value}">${value}</span>`;
  }

  function itemLink(item, child) {
    // 费用管理二级页面与其他导航项使用同一选中态规则。
    // 必须读取 shellCurrentPageKey（软导航会更新），不能读取页面加载时的 pageKey。
    const active = item.key === 'store' ? STORE_PAGE_KEYS.has(shellCurrentPageKey) : shellCurrentPageKey === item.key;
    const icon = child ? '' : `<i data-lucide="${item.icon}" class="menu-icon"></i>`;
    return `<a href="${shellRouteHref(item.key)}" class="yundeng-menu-link ${child ? 'yundeng-secondary-link' : ''}" data-active="${active}" data-page-key="${item.key}" title="${item.label}">${icon}<span class="menu-label nav-label truncate">${item.label}</span>${badgeHTML(navBadges[item.key], '待处理')}</a>`;
  }

  function renderNav(nav) {
    syncExpandedGroupsForPage(shellCurrentPageKey);
    const expanded = readExpandedGroups();
    nav.innerHTML = NAV.map(item => {
      if (!item.group) return itemLink(item, false);
      // 分组角标为组内二级菜单待处理数之和；分组展开后由二级菜单自行展示，避免重复。
      const groupCount = item.children.reduce((sum, child) => sum + (navBadges[child.key] || 0), 0);
      // 箭头始终贴右侧：由 .yundeng-group-toggle > .menu-label 占满剩余空间撑开，
      // 不能依赖角标的 margin-left:auto（分组展开时角标会被隐藏，箭头会随之左移）。
      return `<div class="yundeng-group"><button type="button" class="yundeng-group-toggle" data-active="${item.children.some(child => child.key === shellCurrentPageKey)}" aria-expanded="${isGroupExpanded(expanded, item.key)}" data-group-key="${item.key}"><i data-lucide="${item.icon}" class="menu-icon"></i><span class="menu-label nav-label">${item.label}</span>${badgeHTML(groupCount, '待处理')}<i data-lucide="chevron-down" class="yundeng-group-chevron w-3.5 h-3.5 ml-auto"></i></button><div class="yundeng-subnav" data-expanded="${isGroupExpanded(expanded, item.key)}">${item.children.map(child => itemLink(child, true)).join('')}</div></div>`;
    }).join('');
    window.lucide?.createIcons?.();
  }

  function setupTopbar(topbar) {
    if (!topbar) return;
    topbar.dataset.yundengTopbar = 'true';
    const hadDirty = isSystemFrame || Boolean(document.getElementById('dirtyBadge'));
    topbar.className = '';
    topbar.innerHTML = `<div class="yundeng-topbar-start"><button type="button" id="mobileMenu" class="yundeng-mobile-menu yundeng-icon-button" aria-label="展开导航" aria-controls="sidebar" aria-expanded="false"><i data-lucide="menu"></i></button><a class="yundeng-platform-brand" href="${shellRouteHref(DEFAULT_ROUTE_KEY)}" aria-label="云登首页"><span class="yundeng-platform-mark">云</span><span class="yundeng-platform-name">云登</span></a>${hadDirty ? '<span id="dirtyBadge" class="yundeng-dirty hidden">有未保存修改</span>' : ''}</div><div class="yundeng-topbar-actions"><button type="button" id="helpBtn" class="yundeng-icon-button" aria-label="新手引导" data-yundeng-tooltip="新手引导" aria-haspopup="dialog" aria-controls="yundengOnboardingPanel" aria-expanded="false">${ONBOARDING_ICON_HTML}</button><button type="button" id="noticeBtn" class="yundeng-icon-button" aria-label="通知" data-yundeng-tooltip="通知" aria-haspopup="dialog" aria-expanded="false"><i data-lucide="bell"></i></button><button type="button" id="languageBtn" class="yundeng-icon-button" aria-label="界面语言" data-yundeng-tooltip="界面语言" aria-haspopup="dialog" aria-expanded="false"><i data-lucide="languages"></i></button><span class="yundeng-divider"></span><button type="button" id="accountBtn" class="yundeng-account" aria-label="账号菜单" aria-haspopup="dialog" aria-expanded="false"><span class="yundeng-avatar"></span><span class="yundeng-account-name">17723500832的团队</span><i data-lucide="chevron-down" class="yundeng-account-chevron"></i></button></div>`;
    window.lucide?.createIcons?.();
  }

  function emitToast(message, kind = 'info') {
    const host = document.getElementById('toastContainer');
    if (!host) return;
    const node = document.createElement('div');
    const palette = { info: 'bg-info', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' };
    node.className = `toast ${palette[kind] || palette.info} text-white px-4 py-2 rounded shadow-[0_2px_8px_rgba(0,0,0,.12)] text-[13px]`;
    node.textContent = message;
    host.appendChild(node);
    setTimeout(() => node.remove(), 2800);
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
    const trafficUsageHtml = ACCOUNT_TRAFFIC_USAGE.map(item => {
      const usedPercent = Math.min(100, Math.max(0, item.used / item.total * 100));
      const formatAmount = value => `${Number.isInteger(value) ? value : value.toFixed(1)}GB`;
      const remainingPercent = Math.max(0, 100 - usedPercent);
      return `
        <article class="yundeng-account-traffic-item" data-traffic-kind="${item.key}">
          <div class="yundeng-account-traffic-item-head">
            <strong>${item.label}</strong>
          </div>
          <div class="yundeng-account-traffic-track" role="progressbar" aria-label="${item.label}已使用 ${formatAmount(item.used)}，剩余 ${formatAmount(item.remaining)} / ${formatAmount(item.total)}" aria-valuemin="0" aria-valuemax="${item.total}" aria-valuenow="${item.used}" aria-valuetext="已用 ${formatAmount(item.used)}，剩余 ${formatAmount(item.remaining)} / ${formatAmount(item.total)}">
            <span class="yundeng-account-traffic-fill yundeng-account-traffic-fill-used" style="width:${usedPercent}%"></span>
            <span class="yundeng-account-traffic-fill yundeng-account-traffic-fill-remaining" style="width:${remainingPercent}%"></span>
          </div>
          <div class="yundeng-account-traffic-metrics">
            <span class="yundeng-account-traffic-metric-used"><em>已用：</em><b class="mono">${formatAmount(item.used)}</b></span>
            <span class="yundeng-account-traffic-metric-remaining"><em>剩余：</em><b class="mono">${formatAmount(item.remaining)}/${formatAmount(item.total)}</b></span>
          </div>
          <div class="yundeng-account-traffic-note"><i data-lucide="${item.noteIcon}" aria-hidden="true"></i><span>${item.note}</span></div>
        </article>`;
    }).join('');
    const account = make('account', '账号菜单', `
      <div class="yundeng-account-panel">
        <a class="yundeng-account-head" href="${shellRouteHref('account-settings')}" data-account-nav="profile" aria-label="进入账号设置">
          <span class="yundeng-account-head-avatar" aria-hidden="true"></span>
          <span class="yundeng-account-head-copy">
            <span class="yundeng-account-title-row">
              <span class="yundeng-account-title">17723500832的团队</span>
            </span>
            <span class="yundeng-account-subtitle-row">
              <span>未认证</span>
              <span class="yundeng-account-dot" aria-hidden="true"></span>
              <span>团队创始人</span>
            </span>
          </span>
          <i data-lucide="chevron-right" class="yundeng-account-head-chevron" aria-hidden="true"></i>
        </a>

        <section class="yundeng-account-section" aria-label="账户资产">
          <div class="yundeng-account-balance">
            <div class="yundeng-account-balance-item">
              <div class="yundeng-account-balance-top">
                <span class="yundeng-account-balance-label">云币数</span>
                <button type="button" class="yundeng-account-balance-action" data-account-action="recharge">充值</button>
              </div>
              <div class="yundeng-account-balance-value mono">0.00</div>
            </div>
            <div class="yundeng-account-balance-item">
              <div class="yundeng-account-balance-top">
                <span class="yundeng-account-balance-label">设备数</span>
                <button type="button" class="yundeng-account-balance-action" data-account-action="purchase">购买</button>
              </div>
              <div class="yundeng-account-balance-value mono">2</div>
            </div>
          </div>
        </section>

        <button type="button" class="yundeng-account-vip" data-account-action="vip">
          <span class="yundeng-account-vip-left">
            <span class="yundeng-account-vip-mark" aria-hidden="true"><i data-lucide="gem"></i></span>
            <span class="yundeng-account-vip-copy">VIP 开通VIP套餐享更多环境席位</span>
          </span>
          <span class="yundeng-account-vip-badge">立即购买</span>
        </button>

        <section class="yundeng-account-section" aria-label="套餐概览">
          <div class="yundeng-account-package">
            <div class="yundeng-account-package-item">
              <div class="yundeng-account-package-count mono">9/10</div>
              <div class="yundeng-account-package-label">环境数</div>
            </div>
            <div class="yundeng-account-package-item">
              <div class="yundeng-account-package-count mono">1/1</div>
              <div class="yundeng-account-package-label">用户数</div>
            </div>
            <div class="yundeng-account-package-expired">试用套餐已过期</div>
          </div>
        </section>

        <section class="yundeng-account-traffic" aria-labelledby="yundengAccountTrafficTitle">
          <div class="yundeng-account-traffic-heading">
            <h3 id="yundengAccountTrafficTitle">流量使用</h3>
            <button type="button" class="yundeng-account-traffic-action" data-account-action="traffic-package"><i data-lucide="shopping-bag" aria-hidden="true"></i><span>购买流量包</span></button>
          </div>
          <div class="yundeng-account-traffic-list">${trafficUsageHtml}</div>
        </section>

        <section class="yundeng-account-menu" aria-label="账号功能">
          <a href="${shellRouteHref('account-settings')}" class="yundeng-account-menu-item" data-account-action="settings">
            <i data-lucide="user-round-cog" class="yundeng-account-menu-icon" aria-hidden="true"></i>
            <span class="menu-label">账号设置</span>
            <i data-lucide="chevron-right" class="yundeng-account-list-chevron" aria-hidden="true"></i>
          </a>
          <a href="${shellRouteHref('plugins')}" class="yundeng-account-menu-item" data-account-action="plugins">
            <i data-lucide="blocks" class="yundeng-account-menu-icon" aria-hidden="true"></i>
            <span class="menu-label">我的插件</span>
            <i data-lucide="chevron-right" class="yundeng-account-list-chevron" aria-hidden="true"></i>
          </a>
          <a href="${shellRouteHref('help')}" class="yundeng-account-menu-item" data-account-action="help">
            <i data-lucide="circle-help" class="yundeng-account-menu-icon" aria-hidden="true"></i>
            <span class="menu-label">帮助中心</span>
            <i data-lucide="chevron-right" class="yundeng-account-list-chevron" aria-hidden="true"></i>
          </a>
          <button type="button" class="yundeng-account-menu-item" data-account-action="reward">
            <i data-lucide="gift" class="yundeng-account-menu-icon" aria-hidden="true"></i>
            <span class="menu-label">推广奖励</span>
            <i data-lucide="chevron-right" class="yundeng-account-list-chevron" aria-hidden="true"></i>
          </button>
          <div class="yundeng-account-menu-logout">
            <button type="button" class="yundeng-account-menu-item yundeng-account-logout" data-account-action="logout">
              <i data-lucide="log-out" class="yundeng-account-menu-icon" aria-hidden="true"></i>
              <span class="menu-label">退出登录</span>
            </button>
          </div>
        </section>
      </div>
    `);
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
    account.addEventListener('click', event => {
      const action = event.target.closest('[data-account-action]')?.dataset.accountAction;
      if (!action) return;
      if (action === 'profile' || action === 'settings') {
        close(false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      close(false);
      if (action === 'recharge') {
        window.yundengNavigateShell ? window.yundengNavigateShell(shellRouteHref('billing-recharge')) : location.assign(shellRouteHref('billing-recharge'));
      } else if (action === 'purchase') {
        const href = shellRouteHref('store', { moduleSearch: 'tab=proxy' });
        window.yundengNavigateShell ? window.yundengNavigateShell(href) : location.assign(href);
      } else if (action === 'traffic-package') {
        const href = shellRouteHref('store', { moduleSearch: 'purchase=traffic_package&proxy_type=dynamic&focus=traffic-pack' });
        window.yundengNavigateShell ? window.yundengNavigateShell(href) : location.assign(href);
      } else if (action === 'plugins') {
        window.yundengNavigateShell ? window.yundengNavigateShell(shellRouteHref('plugins')) : location.assign(shellRouteHref('plugins'));
      } else if (action === 'help') {
        window.yundengNavigateShell ? window.yundengNavigateShell(shellRouteHref('help')) : location.assign(shellRouteHref('help'));
      } else if (action === 'vip') {
        const href = shellRouteHref('store', { moduleSearch: 'tab=proxy' });
        window.yundengNavigateShell ? window.yundengNavigateShell(href) : location.assign(href);
      } else if (action === 'reward') {
        const href = shellRouteHref('promotion-reward');
        window.yundengNavigateShell ? window.yundengNavigateShell(href) : location.assign(href);
      } else if (action === 'logout') {
        location.href = '登录.html';
      }
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
    overlay.innerHTML = `<section id="yundengOnboardingPanel" class="yundeng-onboarding-panel" role="dialog" aria-modal="true" aria-label="新手引导" tabindex="-1"><div class="yundeng-onboarding-loading" role="status"><i data-lucide="loader-circle" aria-hidden="true"></i><span>正在准备新手引导</span></div><iframe id="yundengOnboardingFrame" class="yundeng-onboarding-frame" title="新手引导" loading="eager"></iframe></section>`;
    document.body.appendChild(overlay);

    const panel = overlay.querySelector('#yundengOnboardingPanel');
    const frame = overlay.querySelector('#yundengOnboardingFrame');
    const loading = overlay.querySelector('.yundeng-onboarding-loading');
    const consumedKey = 'yundeng-new-user-guide-auto-consumed-v1';
    const previewSessionKey = 'yundeng-new-user-guide-preview-session-v1';
    let frameReady = false;
    let pendingSource = null;
    let returnFocus = null;
    let assistantButtonWasHidden = false;
    let backgroundInertStates = [];

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
    const hideBackgroundTools = () => {
      document.querySelector('[data-yundeng-assistant-close]')?.click();
      document.querySelector('#assistantDrawer:not(.hidden) [data-close="assistantDrawer"]')?.click();
      const assistantButton = document.querySelector('#assistantBtn, #assistantButton, [data-yundeng-assistant-button]');
      assistantButtonWasHidden = Boolean(assistantButton?.hidden);
      if (assistantButton) assistantButton.hidden = true;
    };
    const restoreBackgroundTools = () => {
      const assistantButton = document.querySelector('#assistantBtn, #assistantButton, [data-yundeng-assistant-button]');
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
      document.body.classList.add('yundeng-onboarding-open');
      trigger.setAttribute('aria-expanded', 'true');
      frame.contentWindow?.postMessage({ type: 'yundeng:onboarding-reset', source }, '*');
      requestAnimationFrame(() => {
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
      document.body.classList.remove('yundeng-onboarding-open');
      trigger.setAttribute('aria-expanded', 'false');
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

    frame.src = `新手引导.html?embedded=guide&v=${ASSET_VERSION}`;
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
    overlay.innerHTML = `<section id="yundengAssistantPanel" class="yundeng-assistant-panel" role="dialog" aria-modal="true" aria-labelledby="yundengAssistantTitle" tabindex="-1"><header class="yundeng-assistant-header"><div class="yundeng-assistant-heading"><span class="yundeng-assistant-mark" aria-hidden="true"><i data-lucide="sparkles"></i></span><h2 id="yundengAssistantTitle">云登智能助手</h2></div><button type="button" class="yundeng-assistant-close" data-yundeng-assistant-close title="关闭" aria-label="关闭云登智能助手"><i data-lucide="x" aria-hidden="true"></i></button></header><div class="yundeng-assistant-body"><div class="yundeng-assistant-welcome"><strong>你好，我是云登助手。</strong><p>今天需要处理什么？</p></div><div class="yundeng-assistant-questions" aria-label="常见问题"><button type="button" data-yundeng-question="如何新建浏览器？">如何新建浏览器？</button><button type="button" data-yundeng-question="在哪里管理设备？">在哪里管理设备？</button><button type="button" data-yundeng-question="如何邀请团队成员？">如何邀请团队成员？</button></div><div class="yundeng-assistant-reply" data-yundeng-assistant-reply role="status" aria-live="polite" hidden></div></div><form class="yundeng-assistant-form" data-yundeng-assistant-form novalidate><label class="yundeng-sr-only" for="yundengAssistantInput">输入问题</label><input id="yundengAssistantInput" type="text" maxlength="120" autocomplete="off" placeholder="输入问题"><button type="submit">发送</button></form></section>`;

    document.body.append(button, overlay);
    const panel = overlay.querySelector('#yundengAssistantPanel');
    const closeButton = overlay.querySelector('[data-yundeng-assistant-close]');
    const form = overlay.querySelector('[data-yundeng-assistant-form]');
    const input = overlay.querySelector('#yundengAssistantInput');
    const reply = overlay.querySelector('[data-yundeng-assistant-reply]');
    let returnFocus = null;

    const focusableElements = () => Array.from(panel.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter(node => !node.hidden && node.getAttribute('aria-hidden') !== 'true');
    const open = () => {
      if (!overlay.hidden) return;
      returnFocus = document.activeElement;
      overlay.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    };
    const close = () => {
      if (overlay.hidden) return;
      overlay.hidden = true;
      button.setAttribute('aria-expanded', 'false');
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
          if (sibling.matches('aside, header, #sidebar, #mobileScrim, [data-yundeng-topbar], .topbar')) {
            sibling.dataset.yundengEmbedShell = 'true';
            sibling.setAttribute('aria-hidden', 'true');
          }
        });
        current = parent;
      }
    }

    document.querySelectorAll('#sidebar, #mobileScrim, .yundeng-mobile-backdrop, #assistantBtn, #assistantButton, #yundengAssistantButton, [data-yundeng-assistant-button], #assistantDrawer, #serviceRoot, #yundengAssistantDrawer, [data-yundeng-assistant-drawer], #noticePopover, #languagePopover, #helpPopover, #accountPopover, .yundeng-popover').forEach(node => {
      node.dataset.yundengEmbedShell = 'true';
      node.setAttribute('aria-hidden', 'true');
    });

    const postToShell = message => {
      if (window.parent === window) return;
      window.parent.postMessage(message, '*');
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
      if (file === '系统框架.html' || file === 'index.html') {
        const page = target.searchParams.get('page');
        item = allItems.find(candidate => candidate.key === page || candidate.label === page || candidate.href === page) || item;
        const moduleFile = target.searchParams.get('module');
        // 无 module 的 store 链接（page=store + tab）同样要落到对应子页。
        const tabModule = item?.key === 'store' ? storeModuleFromQuery(target.search) : null;
        targetFile = allowedModuleFiles.has(moduleFile) && itemForModule(moduleFile)?.key === item?.key
          ? moduleFile
          : (allowedModuleFiles.has(tabModule) ? tabModule : item?.href);
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

    requestAnimationFrame(() => {
      window.lucide?.createIcons?.();
      window.YDPager?.enhanceLegacy?.(document);
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
    // 软导航运行时路由上下文（模块内事件与失败提示均以当前值为准）。
    let activeRoutedModule = routedModule;
    let activePageLabel = pageLabel;
    const syncModuleBackgroundControls = hidden => {
      const controls = [
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
      loading.innerHTML = `<i data-lucide="circle-alert" aria-hidden="true"></i><div><strong>${activePageLabel}加载失败</strong><span>请确认模块文件存在后重新加载。</span></div><button type="button">重新加载</button>`;
      loading.querySelector('button').onclick = () => location.reload();
      window.lucide?.createIcons?.();
    };
    let loadTimeout = setTimeout(showLoadFailure, 8000);

    const setDirty = dirty => {
      moduleDirty = Boolean(dirty);
      dirtyBadge?.classList.toggle('hidden', !moduleDirty);
    };
    window.addEventListener('beforeunload', event => {
      if (!moduleDirty) return;
      event.preventDefault();
      event.returnValue = '';
    });
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
      if (!item || data.file !== activeRoutedModule) return false;
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
    // —— 软导航：同一 SystemFrame 文档内切换业务模块，侧栏不重建、菜单不收起-展开 ——
    const parseShellRoute = href => {
      try {
        const url = new URL(href, location.href);
        if (decodeURIComponent(url.pathname.split('/').pop() || '') !== '系统框架.html') return null;
        const key = normalizeRequestedPage(url.searchParams.get('page')) || DEFAULT_ROUTE_KEY;
        const item = allItems.find(candidate => candidate.key === key);
        if (!item) return null;
        const moduleParam = normalizeModuleFile(url.searchParams.get('module'));
        const moduleItem = moduleParam ? itemForModule(moduleParam) : null;
        // page=store + tab 也能定位子页（见 STORE_TAB_MODULE_FILES）：无有效 module 时按 tab 反查。
        const tabModule = item.key === 'store' ? storeModuleFromQuery(url.search) : null;
        const moduleFile = moduleItem?.key === item.key
          ? moduleParam
          : (allowedModuleFiles.has(tabModule) ? tabModule : item.href);
        return { url, key, label: moduleFile === '环境管理-编辑环境.html' ? '编辑环境' : item.label, moduleFile };
      } catch (_) { return null; }
    };
    const applySidebarActiveState = nextKey => {
      // 记录当前路由 key，供后续 renderNav（角标刷新等）重绘时保持左侧菜单高亮正确。
      if (nextKey) shellCurrentPageKey = nextKey;
      const nav = document.getElementById('yundeng-primary-nav');
      nav?.querySelectorAll('a[data-page-key]').forEach(link => {
        const key = link.dataset.pageKey;
        link.dataset.active = String(key === 'store' ? STORE_PAGE_KEYS.has(nextKey) : key === nextKey);
      });
      NAV.filter(item => item.group).forEach(item => {
        const toggle = nav?.querySelector(`[data-group-key="${item.key}"]`);
        toggle?.setAttribute('data-active', String(item.children.some(child => child.key === nextKey)));
      });
      document.querySelectorAll('a.yundeng-bottom-link').forEach(link => {
        try {
          const page = new URL(link.getAttribute('href'), location.href).searchParams.get('page');
          link.dataset.active = String(page === nextKey);
        } catch (_) {}
      });
    };
    const softApplyRoute = (href, { push = true } = {}) => {
      const target = parseShellRoute(href);
      if (!target || !frame) return false;
      // index 宿主模式下历史由外层 index.html 维护，仅同步外层地址。
      if (!(isIndexHosted && window.parent !== window)) {
        try {
          if (push) history.pushState(history.state, '', href);
          else history.replaceState(history.state, '', href);
        } catch (_) { return false; }
      }
      const nextModuleSrc = buildEmbeddedModuleSrc(target.moduleFile, target.url.search);
      let sameModule = false;
      try { sameModule = new URL(nextModuleSrc, location.href).href === new URL(frame.getAttribute('src'), location.href).href; } catch (_) {}
      syncExpandedGroupsForHref(href);
      applySidebarActiveState(target.key);
      applySidebarExpandedState();
      activePageLabel = target.label;
      document.title = `云登 · ${target.label}`;
      outlet.setAttribute('aria-label', `${target.label}业务内容区`);
      frame.title = target.label;
      if (!sameModule) {
        moduleReady = false;
        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(showLoadFailure, 8000);
        setDirty(false);
        moduleBackgroundRequestedHidden = false;
        syncModuleBackgroundControls(false);
        loading.hidden = false;
        loading.dataset.state = 'loading';
        loading.innerHTML = `<i data-lucide="loader-circle" aria-hidden="true"></i><span>正在加载${target.label}</span>`;
        window.lucide?.createIcons?.();
        activeRoutedModule = target.moduleFile;
        frame.src = nextModuleSrc;
      }
      if (isIndexHosted && window.parent !== window) {
        window.parent.postMessage({ type: 'yundeng:index-route-state', page: target.key, search: target.url.search }, '*');
      }
      return true;
    };
    if (!(isIndexHosted && window.parent !== window)) {
      window.addEventListener('popstate', () => { softApplyRoute(location.href, { push: false }); });
    }
    const navigate = async (href, options = {}) => {
      if (!options.confirmed && !confirmDiscard()) return false;
      return finishNavigation(() => {
        if (!options.replace && softApplyRoute(href, { push: true })) return;
        syncExpandedGroupsForHref(href);
        if (isIndexHosted && window.parent !== window) {
          window.parent.postMessage({ type: 'yundeng:index-route-request', href }, '*');
        } else if (options.replace) location.replace(href);
        else location.assign(href);
      });
    };
    window.yundengNavigateShell = navigate;
    window.yundengHistoryNavigate = async delta => {
      const browserNavigation = window.navigation;
      if (!browserNavigation) return false;
      if (browserNavigation && ((delta < 0 && !browserNavigation.canGoBack) || (delta > 0 && !browserNavigation.canGoForward))) return false;
      if (!confirmDiscard()) return false;
      return finishNavigation(() => {
        if (isIndexHosted && window.parent !== window) {
          window.parent.postMessage({ type: 'yundeng:index-history', delta }, '*');
        } else {
          history.go(delta);
        }
      });
    };
    window.yundengReloadShell = async () => {
      if (!confirmDiscard()) return false;
      return finishNavigation(() => location.reload());
    };

    frame.addEventListener('load', () => {
      syncModuleBackgroundControls(moduleBackgroundRequestedHidden);
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
        if (event.data.file !== activeRoutedModule) {
          navigate(shellRouteHref(item.key, { module: event.data.file, moduleSearch: event.data.search, hash: event.data.hash }), { replace: true, confirmed: true });
          return;
        }
        syncModuleRouteState(event.data);
      }
    });
    window.lucide?.createIcons?.();
    return frame;
  }

  function setupInteractions(sidebar, main, topbar) {
    const backdrop = document.createElement('div'); backdrop.className = 'yundeng-mobile-backdrop'; backdrop.dataset.open = 'false'; backdrop.setAttribute('aria-hidden', 'true'); document.body.appendChild(backdrop);
    const collapse = sidebar.querySelector('#collapseBtn');
    let compact = false;
    try { compact = localStorage.getItem(compactStateKey) === 'true'; } catch (_) {}
    const setCompact = (value, persist = true) => { compact = value; sidebar.classList.toggle('compact', compact); if (collapse) { collapse.title = compact ? '展开侧栏' : '收起侧栏'; collapse.setAttribute('aria-label', collapse.title); collapse.setAttribute('aria-expanded', String(!compact)); collapse.innerHTML = '<i data-lucide="triangle" class="yundeng-solid-arrow"></i>'; } if (persist) { try { localStorage.setItem(compactStateKey, String(compact)); } catch (_) {} } window.lucide?.createIcons?.(); window.dispatchEvent(new CustomEvent('yundeng:sidebar-toggle', { detail: { compact } })); };
    setCompact(compact, false);
    collapse && (collapse.onclick = () => setCompact(!compact));
    const mobile = topbar?.querySelector('#mobileMenu, .yundeng-mobile-menu');
    const setMobileOpen = open => { sidebar.classList.toggle('yundeng-mobile-open', open); backdrop.dataset.open = String(open); backdrop.setAttribute('aria-hidden', String(!open)); mobile?.setAttribute('aria-expanded', String(open)); };
    mobile && (mobile.onclick = () => setMobileOpen(!sidebar.classList.contains('yundeng-mobile-open')));
    backdrop.onclick = () => setMobileOpen(false);
    const nav = document.getElementById('yundeng-primary-nav');
    // 一级菜单遵循手风琴：展开目标分组时收起其它分组，收起时保持全部收起。
    nav?.addEventListener('click', e => {
      const toggle = e.target.closest('[data-group-key]');
      if (!toggle) return;
      e.preventDefault();
      const groupKey = toggle.dataset.groupKey;
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      const expanded = {};
      NAV.filter(item => item.group).forEach(item => { expanded[item.key] = willOpen && item.key === groupKey; });
      writeExpandedGroups(expanded);
      applySidebarExpandedState();
    });
    document.addEventListener('click', e => {
      const link = e.target.closest('a.yundeng-menu-link, a.yundeng-create, a.yundeng-bottom-link');
      if (!link) return;
      setMobileOpen(false);
      const plainNavigation = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && link.target !== '_blank';
      if (!e.defaultPrevented && plainNavigation) {
        // 优先走壳内软导航（不重载侧栏）；不可用时退回整页跳转。
        if (window.yundengNavigateShell) {
          window.yundengNavigateShell(link.href);
          e.preventDefault();
        } else {
          syncExpandedGroupsForHref(link.href);
        }
      }
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

  /* =====================================================================
     列表工具栏搜索组件（design.md 5.4.2 统一标准的唯一实现）
     - 结构、样式、范围下拉、键盘与匹配语义全部由本组件负责；
     - 页面只声明容器、可检索字段与重绘回调，禁止在页面内复制实现。
     用法：
       YDSearchBox.init('#memberSearchBox', {
         label: '成员',
         inputId: 'keyword',
         scopes: [{ key: 'all', label: '全局搜索' }, { key: 'name', label: '成员名称' }],
         values: row => ({ name: row.name, phone: row.phone }),
         onChange: () => renderResults()
       });
       过滤时：YDSearchBox.matches('#memberSearchBox', row)
     ===================================================================== */
  const SEARCH_PLACEHOLDER_TEXT = '请输入关键词，多个用中文逗号分隔';
  const SEARCH_BOX_STATES = new Map();
  const SEARCH_BOX_INSTANCES = new WeakMap();

  function searchEscapeHtml(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function searchSplitKeywords(value) {
    return String(value || '').split('，').map(part => part.trim().toLowerCase()).filter(Boolean);
  }

  function searchFieldValues(fieldMap, key) {
    if (!fieldMap || typeof fieldMap !== 'object') return [];
    const raw = fieldMap[key];
    if (raw === null || raw === undefined) return [];
    return (Array.isArray(raw) ? raw : [raw]).map(item => String(item));
  }

  function resolveSearchTarget(target) {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target);
    return target instanceof Element ? target : null;
  }

  function createSearchBox(container, config) {
    const options = config || {};
    const scopes = Array.isArray(options.scopes) && options.scopes.length ? options.scopes.slice() : [{ key: 'all', label: '全局搜索' }];
    const label = options.label || '列表';
    /* 占位符默认沿用全局文案；页面可按需传入 options.placeholder 覆盖（当前无页面覆盖，保留该能力以便按页定制）。 */
    const placeholderText = options.placeholder || SEARCH_PLACEHOLDER_TEXT;
    const inputId = options.inputId || container.getAttribute('data-search-input') || (container.id ? container.id + 'Keyword' : '');
    if (!inputId) return null;
    const stateKey = options.key || container.id || inputId;
    let state = SEARCH_BOX_STATES.get(stateKey);
    if (!state) {
      state = { value: '', draft: '', scopeKey: scopes[0].key, activeIndex: 0, committed: false, hadFocus: false };
      SEARCH_BOX_STATES.set(stateKey, state);
    }
    if (typeof state.draft !== 'string') state.draft = state.value;
    if (typeof options.value === 'string' && options.value !== state.value) {
      state.value = options.value;
      state.draft = options.value;
      if (!options.value) { state.scopeKey = scopes[0].key; state.activeIndex = 0; state.committed = false; }
    }

    container.classList.add('order-global-search');
    if (!container.hasAttribute('role')) container.setAttribute('role', 'search');
    if (!container.querySelector('input')) {
      const prefixId = inputId + 'ScopePrefix';
      const clearId = inputId + 'Clear';
      const submitId = inputId + 'Submit';
      const menuId = inputId + 'ScopeMenu';
      container.classList.remove('has-committed-scope', 'is-open');
      container.insertAdjacentHTML('afterbegin',
        '<label class="sr-only" for="' + inputId + '">搜索' + searchEscapeHtml(label) + '</label>' +
        '<span id="' + prefixId + '" class="order-search-scope-prefix hidden" aria-hidden="true">' + searchEscapeHtml(scopes[0].label) + '包含：</span>' +
        '<input id="' + inputId + '" class="field" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + menuId + '" autocomplete="off" placeholder="' + searchEscapeHtml(placeholderText) + '">' +
        '<button id="' + clearId + '" type="button" class="order-search-clear hidden" aria-label="清空' + searchEscapeHtml(label) + '搜索"><i data-lucide="x" class="w-4 h-4" aria-hidden="true"></i></button>' +
        '<button id="' + submitId + '" type="button" class="order-search-submit" aria-label="搜索' + searchEscapeHtml(label) + '"><i data-lucide="search" class="order-search-icon" aria-hidden="true"></i></button>' +
        '<div id="' + menuId + '" class="order-search-scope-menu hidden" role="listbox" aria-label="选择' + searchEscapeHtml(label) + '搜索范围"></div>');
    }

    const input = container.querySelector('input[type="search"]') || container.querySelector('input');
    const prefix = container.querySelector('.order-search-scope-prefix');
    const clearButton = container.querySelector('.order-search-clear');
    const submitButton = container.querySelector('.order-search-submit');
    const menu = container.querySelector('.order-search-scope-menu');
    if (!input || !prefix || !clearButton || !submitButton || !menu) return null;

    const instance = { key: stateKey, container, input, state, scopes };
    const renderList = () => { if (typeof options.onChange === 'function') options.onChange(instance); };
    const optionId = index => inputId + 'ScopeOption' + index;
    const activeScope = () => scopes.find(item => item.key === state.scopeKey) || scopes[0];

    /* 字段名长度不一（如「请求授权姓名包含：」），前缀宽度按实际内容量取后写回容器，
       输入框左内边距随 --yd-search-prefix-width 调整，避免文字被裁切或压住输入内容。 */
    const syncPrefixWidth = () => {
      if (prefix.classList.contains('hidden')) {
        container.style.removeProperty('--yd-search-prefix-width');
        return;
      }
      const width = Math.ceil(prefix.getBoundingClientRect().width);
      if (width > 0) container.style.setProperty('--yd-search-prefix-width', width + 'px');
    };

    const sync = () => {
      const scope = activeScope();
      prefix.textContent = scope.label + '包含：';
      prefix.classList.toggle('hidden', !state.committed);
      container.classList.toggle('has-committed-scope', state.committed);
      syncPrefixWidth();
      clearButton.classList.toggle('hidden', !state.draft);
      if (input.value !== state.draft) input.value = state.draft;
      input.setAttribute('aria-label', state.committed ? label + '搜索，' + scope.label : label + '搜索');
    };

    const renderMenu = () => {
      const query = String(state.draft || '').trim();
      menu.innerHTML = scopes.map((scope, index) =>
        '<button id="' + optionId(index) + '" type="button" class="order-search-scope-option ' + (index === state.activeIndex ? 'is-active' : '') + '" role="option" tabindex="-1" aria-selected="' + String(scope.key === activeScope().key) + '" data-yd-search-index="' + index + '"><span class="order-search-scope-radio" aria-hidden="true"></span><span class="order-search-scope-label">' + searchEscapeHtml(scope.label) + '</span><span class="order-search-scope-relation">包含</span><span class="order-search-scope-query">' + searchEscapeHtml(query) + '</span></button>'
      ).join('');
      if (!menu.classList.contains('hidden')) {
        input.setAttribute('aria-activedescendant', optionId(state.activeIndex));
        menu.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
      }
    };

    const setOpen = open => {
      const shouldOpen = Boolean(open && String(state.draft || '').trim());
      container.classList.toggle('is-open', shouldOpen);
      menu.classList.toggle('hidden', !shouldOpen);
      input.setAttribute('aria-expanded', String(shouldOpen));
      if (shouldOpen) renderMenu();
      else input.removeAttribute('aria-activedescendant');
    };

    const selectScope = index => {
      const scope = scopes[index];
      if (!scope) return;
      state.scopeKey = scope.key;
      state.activeIndex = index;
      state.committed = true;
      state.value = state.draft;
      sync();
      renderList();
      setOpen(false);
      input.focus();
    };

    const confirm = () => {
      if (!String(state.draft || '').trim()) { setOpen(false); input.focus(); return; }
      if (!menu.classList.contains('hidden')) selectScope(state.activeIndex);
      else if (!state.committed) selectScope(0);
      else { state.value = state.draft; sync(); renderList(); }
      input.focus();
      setOpen(false);
    };

    const clear = (clearOptions) => {
      const shouldFocus = !clearOptions || clearOptions.focus !== false;
      state.value = '';
      state.draft = '';
      state.scopeKey = scopes[0].key;
      state.activeIndex = 0;
      state.committed = false;
      input.value = '';
      sync();
      setOpen(false);
      renderList();
      if (shouldFocus) input.focus();
    };

    input.addEventListener('input', () => {
      state.draft = input.value;
      if (!state.draft.trim()) {
        state.value = '';
        state.scopeKey = scopes[0].key;
        state.activeIndex = 0;
        state.committed = false;
        sync();
        setOpen(false);
        renderList();
      } else {
        state.activeIndex = Math.max(0, scopes.findIndex(scope => scope.key === state.scopeKey));
        sync();
        renderMenu();
        setOpen(true);
      }
    });
    input.addEventListener('focus', () => { state.hadFocus = true; if (state.draft.trim()) setOpen(true); });
    input.addEventListener('click', () => { state.hadFocus = true; if (state.draft.trim()) setOpen(true); });
    input.addEventListener('blur', () => { state.hadFocus = false; });
    input.addEventListener('keydown', event => {
      if (!state.draft.trim()) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
        state.activeIndex = (state.activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + scopes.length) % scopes.length;
        renderMenu();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        confirm();
      } else if (event.key === 'Escape' && !menu.classList.contains('hidden')) {
        event.preventDefault();
        setOpen(false);
      }
    });
    clearButton.addEventListener('click', () => clear());
    submitButton.addEventListener('click', confirm);
    menu.addEventListener('pointerdown', event => event.preventDefault());
    menu.addEventListener('click', event => {
      const option = event.target.closest('[data-yd-search-index]');
      if (option) selectScope(Number(option.dataset.ydSearchIndex));
    });
    document.addEventListener('click', event => { if (!container.contains(event.target)) setOpen(false); });

    instance.value = () => state.value;
    instance.draft = () => state.draft;
    instance.scope = () => activeScope().key;
    instance.keywords = () => searchSplitKeywords(state.value);
    instance.committed = () => state.committed;
    instance.setValue = next => {
      const raw = String(next === null || next === undefined ? '' : next);
      state.value = raw;
      state.draft = raw;
      if (!raw.trim()) { state.scopeKey = scopes[0].key; state.activeIndex = 0; state.committed = false; setOpen(false); }
      sync();
    };
    instance.clear = clear;
    instance.sync = sync;
    instance.matches = row => {
      const keywords = searchSplitKeywords(state.value);
      if (!keywords.length) return true;
      const fieldMap = typeof options.values === 'function' ? options.values(row) : null;
      const keys = fieldMap && typeof fieldMap === 'object' ? Object.keys(fieldMap) : [];
      /* 已提交范围在当前上下文的字段清单中不存在时（如页签切换后字段集合变化），
         与前缀展示保持一致退回全局语义，避免「前缀显示全局搜索却匹配不到任何行」。 */
      const scopeKey = activeScope().key;
      const source = scopeKey === 'all' || !keys.includes(scopeKey)
        ? keys.reduce((acc, key) => acc.concat(searchFieldValues(fieldMap, key)), [])
        : searchFieldValues(fieldMap, scopeKey);
      const searchable = source.join(' ').toLowerCase();
      return keywords.some(keyword => searchable.includes(keyword));
    };

    state.activeIndex = Math.max(0, scopes.findIndex(scope => scope.key === state.scopeKey));
    sync();
    window.addEventListener('resize', syncPrefixWidth);
    window.lucide?.createIcons?.();
    SEARCH_BOX_INSTANCES.set(container, instance);
    if (state.hadFocus) {
      input.focus();
      const end = input.value.length;
      try { input.setSelectionRange(end, end); } catch (error) { /* type=search 在部分浏览器不支持，忽略 */ }
    }
    return instance;
  }

  function initSearchBox(target, options) {
    const container = resolveSearchTarget(target);
    if (!container) return null;
    const live = SEARCH_BOX_INSTANCES.get(container);
    if (live && container.querySelector('input')) { live.sync(); return live; }
    return createSearchBox(container, options);
  }

  window.YDSearchBox = {
    init: initSearchBox,
    get(target) {
      const container = resolveSearchTarget(target);
      return container ? SEARCH_BOX_INSTANCES.get(container) || null : null;
    },
    matches(target, row) {
      const instance = window.YDSearchBox.get(target);
      return instance ? instance.matches(row) : true;
    },
    keywords(target) {
      const instance = window.YDSearchBox.get(target);
      return instance ? instance.keywords() : [];
    },
    value(target) {
      const instance = window.YDSearchBox.get(target);
      return instance ? instance.value() : '';
    },
    draft(target) {
      const instance = window.YDSearchBox.get(target);
      return instance ? instance.draft() : '';
    },
    setValue(target, next) {
      window.YDSearchBox.get(target)?.setValue(next);
    },
    clear(target, options) {
      window.YDSearchBox.get(target)?.clear(options);
    },
    sync(target) {
      window.YDSearchBox.get(target)?.sync();
    }
  };

  function init() {
    if (basename === 'index.html') {
      delete document.documentElement.dataset.yundengRuntimePending;
      return;
    }
    if (isSystemFrame && requestedPage && !requestedItem) {
      const fallbackHref = shellRouteHref(DEFAULT_ROUTE_KEY, { search: location.search });
      if (isIndexHosted && window.parent !== window) {
        window.parent.postMessage({ type: 'yundeng:index-route-request', href: fallbackHref }, '*');
      } else {
        location.replace(fallbackHref);
      }
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
    setupAppFrame(host, topbar);
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
    reportIndexHostRoute();
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
