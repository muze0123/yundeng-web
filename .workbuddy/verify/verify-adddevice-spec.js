/* 设备管理-自有设备-添加设备.html 对 design.md 规范合规性验证脚本（jsdom）
 * 口径说明：
 *  - 结构性属性（grid-template-columns / animation / appearance 等）jsdom 的 cssstyle 不支持，
 *    改为对 <style> 规则原文做归一化子串断言 —— 规则原文即「规范落地值」的单一事实来源。
 *  - 颜色 / 尺寸等 cssstyle 支持的属性，一律以 getComputedStyle 实测值为权威口径。
 */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const FILE = '/Users/zhangbin/Desktop/灵匠/云登pc端/Prototype/设备管理-自有设备-添加设备.html';
const html = fs.readFileSync(FILE, 'utf8');

const results = [];
function check(name, actual, expected) {
  const pass = typeof expected === 'function' ? expected(actual) : JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual });
}
const nz = s => String(s).replace(/\s+/g, '');

/* ---------- 解析 <style>：selector -> 声明原文 ---------- */
const cssText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const ruleMap = new Map();
{
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    const sel = m[1].trim();
    if (!sel || sel.startsWith('@')) continue;
    ruleMap.set(sel, (ruleMap.get(sel) || '') + ';' + m[2]);
  }
}
/** 规则原文子串断言（忽略空白差异）；支持逗号选择器组（如 `.calendar-week, .calendar-grid`） */
function hasDecl(selector, decl) {
  const bodies = [];
  const hit = ruleMap.get(selector);
  if (hit) bodies.push(hit);
  for (const key of ruleMap.keys()) {
    if (key !== selector && key.split(',').map(s => s.trim()).includes(selector)) bodies.push(ruleMap.get(key));
  }
  return bodies.some(body => nz(body).includes(nz(decl)));
}
/** 规则是否存在（支持逗号选择器组） */
function hasRule(selector) {
  if (ruleMap.has(selector)) return true;
  for (const key of ruleMap.keys()) {
    if (key.split(',').map(s => s.trim()).includes(selector)) return true;
  }
  return false;
}

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'http://127.0.0.1:8899/Prototype/设备管理-自有设备-添加设备.html?embedded=1'
  });
  const win = dom.window;
  const doc = win.document;

  win.tailwind = {};
  win.lucide = { createIcons() {} };
  win.structuredClone = win.structuredClone || (v => JSON.parse(JSON.stringify(v)));
  Object.defineProperty(win, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} } });
  Object.defineProperty(win, 'sessionStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} } });
  Object.defineProperty(win, 'parent', { configurable: true, value: { postMessage() {} } });

  const blocks = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  const errors = [];
  win.addEventListener('error', e => errors.push(String(e.message)));
  try { blocks.forEach(code => win.eval(code)); } catch (err) { errors.push('eval: ' + err.message); }
  await sleep(60);

  const $ = sel => doc.querySelector(sel);
  const $$ = sel => Array.from(doc.querySelectorAll(sel));
  function cs(sel, prop) {
    const el = $(sel);
    if (!el) return '__NO_ELEMENT__';
    return win.getComputedStyle(el).getPropertyValue(prop);
  }

  /* ========== A. 页面骨架（§5.0 单区块 / §6.1 标题内嵌首卡） ========== */
  check('A1 脚本零报错', errors, []);
  check('A2 页面根容器为 .page-content 且四边 16px 留白', (() => {
    const el = $('#mainContent');
    return !!el && el.classList.contains('page-content') && el.classList.contains('p-4');
  })(), true);
  check('A3 唯一业务区块 = bg-white rounded-lg + 纵向撑满 + 裁切圆角', (() => {
    const secs = $$('main > section');
    if (secs.length !== 1) return false;
    const c = secs[0].classList;
    return ['bg-white', 'rounded-lg', 'flex', 'flex-1', 'min-h-0', 'flex-col', 'overflow-hidden'].every(k => c.contains(k));
  })(), true);
  check('A3b 表单区独立滚动并保留 20px/24px 内边距', (() => {
    const a = $('#formArea');
    if (!a) return '__NO_FORM_AREA__';
    return ['flex-1', 'min-h-0', 'overflow-auto', 'p-5', 'md:p-6'].every(k => a.classList.contains(k));
  })(), true);
  check('A4 页头不再渲染页面标题，为「返回 + 添加方式页签」单行页头 + 下方分割线（需求 18）', (() => {
    const sec = $('main > section');
    const head = $('.add-head');
    if (!head || !sec.contains(head)) return '__NO_HEAD__';
    const divider = $('.page-divider');
    return {
      /* 标题已移除（不再有页面级 h1） */
      titleRemoved: !$('#pageTitle') && $$('main > section h1').length === 0,
      /* 返回按钮在左、页签紧随其右（同一行内的第 1 / 第 2 个子元素） */
      headOrder: Array.from(head.children).map((el, i) => (i < 2 ? el.id || el.className.split(' ')[0] : el.className.split(' ')[0])),
      tablistInHead: !!head.querySelector('[role="tablist"]'),
      backBtnInHead: !!head.querySelector('#backBtn'),
      /* 分割线紧跟在页头之后，划开「页头栏」与表单内容 */
      dividerNext: !!divider && divider.previousElementSibling === head,
      dividerDecl: hasDecl('.page-divider', 'height:1px') && hasDecl('.page-divider', 'background:#DFE1E5')
    };
  })(), {
    titleRemoved: true,
    headOrder: ['backBtn', 'add-tabs', 'add-hint'],
    tablistInHead: true, backBtnInHead: true,
    dividerNext: true, dividerDecl: true
  });
  check('A5 单区块页无需外描边（section 未声明 border）', hasDecl('main > section', 'border'), false);

  /* ========== B. 按钮（§5.1） ========== */
  check('B1 按钮高 32px', cs('#submitBtn', 'height'), '32px');
  check('B2 按钮圆角 4px', cs('#submitBtn', 'border-radius'), '4px');
  check('B3 主按钮底色 primary #0066FF', cs('#submitBtn', 'background-color'), 'rgb(0, 102, 255)');
  check('B4 主按钮字色白', cs('#submitBtn', 'color'), 'rgb(255, 255, 255)');
  check('B5 次按钮白底', cs('#cancelBtn', 'background-color'), 'rgb(255, 255, 255)');
  check('B6 次按钮 line 描边', cs('#cancelBtn', 'border-top-color'), 'rgb(223, 225, 229)');
  check('B7 次按钮字色 ink-body', cs('#cancelBtn', 'color'), 'rgb(58, 63, 74)');
  check('B8 主按钮 hover 态 primary-hover', hasDecl('.btn-primary:hover:not(:disabled)', 'background:#0052CC'), true);
  check('B9 按钮禁用于 32px 高度 4px 圆角统一', hasRule('.btn'), true);

  /* ========== C. 表单控件（§5.9 配置型） ========== */
  check('C1 控件宽 500px', cs('#deviceName', 'width'), '500px');
  check('C2 控件高 32px', cs('#deviceName', 'height'), '32px');
  check('C3 控件圆角 4px', cs('#deviceName', 'border-radius'), '4px');
  check('C4 控件 1px line 描边', cs('#deviceName', 'border-top-width') + '|' + cs('#deviceName', 'border-top-color'), '1px|rgb(223, 225, 229)');
  check('C5 下拉框自绘箭头（appearance:none）', hasDecl('select.control', 'appearance:none') && hasDecl('select.control', 'background-image:url("data:image/svg+xml'), true);
  check('C6 多行文本域高度自适应 + min-height 80px', hasDecl('textarea.control', 'height:auto') && hasDecl('textarea.control', 'min-height:80px'), true);
  check('C7 带计数器控件预留 48px 右侧内边距', cs('#deviceName', 'padding-right'), '48px');
  check('C8 焦点态用 primary 描边（不用浏览器默认）', hasDecl('.control:focus', 'border-color:#0066FF'), true);
  check('C9「IP查询渠道」行（单个/批量 × 静态/动态 共 4 处）下拉与其它控件同为 500px', (() => {
    const ids = ['deviceIpProvider', 'dynamicIpProvider', 'staticIpProvider', 'dynamicBatchIpProvider'];
    const widths = ids.map(id => cs('#' + id, 'width'));
    return {
      widths,
      allEqual: new Set(widths).size === 1 && widths[0] === '500px',
      /* 根因约束：.field-inline 不得再被 max-width:100% 夹住（会被 .control 的 500px 截短 26px = 8px gap + 18px 帮助图标） */
      noMaxWidth: nz(ruleMap.get('.field-inline') || '').includes('max-width') === false,
      flexNone: hasDecl('.field-inline > .control', 'flex:none'),
      innerGap: hasDecl('.field-inline', 'gap:8px'),
      widthMaxContent: hasDecl('.field-inline', 'width:max-content'),
      /* 行内帮助图标排在 500px 控件之外 */
      helpOutsideControl: $$('.field-inline').every(row => {
        const help = row.querySelector('.field-help');
        const ctrl = row.querySelector('.control');
        return !help || !ctrl || (ctrl.compareDocumentPosition(help) & 4) !== 0;
      })
    };
  })(), {
    widths: ['500px', '500px', '500px', '500px'],
    allEqual: true, noMaxWidth: true, flexNone: true, innerGap: true, widthMaxContent: true, helpOutsideControl: true
  });

  /* ========== D. 表单栅格（§5.9 配置型长表单） ========== */
  check('D1 标签列 120px 右对齐', hasDecl('.form-row', 'grid-template-columns:120pxminmax(0,1fr)'), true);
  check('D2 字段纵向间距 16px', hasDecl('.form-row', 'margin-top:16px'), true);
  check('D3 标签右对齐（justify-content:flex-end + text-align:right）',
    hasDecl('.form-label', 'justify-content:flex-end') && hasDecl('.form-label', 'text-align:right'), true);
  check('D4 标签列行高与控件等高对齐（min-height 32px）', hasDecl('.form-label', 'min-height:32px'), true);
  check('D5 必填星号在标签文字左侧', (() => {
    const label = $('#deviceName') && doc.querySelector('label[for="deviceName"]');
    if (!label) return false;
    const star = label.querySelector('.required');
    if (!star) return false;
    // 星号节点的下一个兄弟必须是标签文字节点（允许空白）
    let node = star.nextSibling;
    while (node && node.nodeType === 3 && !node.textContent.trim()) node = node.nextSibling;
    return !!node && node.nodeType === 3 && node.textContent.trim().startsWith('设备名称');
  })(), true);
  check('D6 必填星号用 danger 色', cs('#deviceName', 'color') !== '__NO_ELEMENT__' && nz(ruleMap.get('.required') || '').includes('color:#D9001B'), true);
  check('D7 配置型标签不显示中文冒号', (() => {
    return $$('.form-label').every(el => !el.textContent.includes('：') && !el.textContent.includes(':'));
  })(), true);
  check('D8 移动端标签移至控件上方左对齐', hasDecl('.form-label:empty', 'display:none') &&
    nz(cssText).includes('@media(max-width:767px)') && nz(cssText).includes('.form-label{justify-content:flex-start'), true);
  check('D9 动态「备注」与静态同构（count-wrap + has-counter + maxlength 40 + 0/40 计数器），位于「IP查询渠道」上方', (() => {
    const d = $('#dynamicRemark'), s = $('#deviceRemark');
    const rowOf = el => el.closest('.form-row');
    const rowChildren = el => Array.from(rowOf(el).children).map(c => c.className).join('|');
    const counter = id => {
      const el = $('#' + id);
      return el ? el.className + '|' + el.parentElement.className + '|' + el.textContent.trim() : '__NO_ELEMENT__';
    };
    return {
      exists: d !== null && $('#dynamicRemarkCount') !== null,
      sameAttrs: d.getAttribute('maxlength') === s.getAttribute('maxlength') &&
        d.getAttribute('placeholder') === s.getAttribute('placeholder') &&
        d.className === s.className && d.tagName === s.tagName,
      rowStructure: rowChildren(d) === rowChildren(s),
      counterPair: counter('dynamicRemarkCount') === counter('deviceRemarkCount'),
      /* 备注须排在动态「IP查询渠道」之前（compareDocumentPosition & 4 = FOLLOWING） */
      aboveProvider: (d.compareDocumentPosition($('#dynamicIpProvider')) & 4) !== 0,
      payload: /payload\.remark\s*=\s*\$\('#dynamicRemark'\)\.value\.trim\(\)/.test(html),
      counterBind: /\$\('#dynamicRemark'\)\.addEventListener\('input'/.test(html)
    };
  })(), { exists: true, sameAttrs: true, rowStructure: true, counterPair: true, aboveProvider: true, payload: true, counterBind: true });

  /* ========== E. 字符计数器（§5.9） ========== */
  check('E1 单行计数器在控件内右侧定位', hasDecl('.count-inline', 'position:absolute') && hasDecl('.count-inline', 'right:12px'), true);
  check('E2 单行计数器垂直居中', hasDecl('.count-inline', 'top:50%') && hasDecl('.count-inline', 'transform:translateY(-50%)'), true);
  check('E3 单行计数器不拦截点击', hasDecl('.count-inline', 'pointer-events:none'), true);
  check('E4 多行计数器叠加在组件内右下角，并为文本域预留底部空间',
    hasDecl('.count-inside', 'position:absolute') && hasDecl('.count-inside', 'right:10px') &&
    hasDecl('.count-inside', 'bottom:6px') && hasDecl('.count-wrap', 'position:relative') &&
    hasDecl('textarea.control.has-counter', 'padding-bottom:24px'), true);
  check('E5 计数器样式 12px ink-muted', hasDecl('.count-inline', 'color:#9DA2AC') && hasDecl('.count-inside', 'color:#9DA2AC') &&
    nz(ruleMap.get('.count-inline') || '').includes('font:12px/18px') &&
    nz(ruleMap.get('.count-inside') || '').includes('font:12px/18px'), true);
  check('E6 计数器文本格式 x/y', [$('#deviceNameCount').textContent.trim(), $('#deviceRemarkCount').textContent.trim()], ['0/100', '0/40']);

  /* ========== F. 字段帮助入口（§5.9） ========== */
  check('F1 帮助入口为 18×18px', hasDecl('.field-help', 'width:18px') && hasDecl('.field-help', 'height:18px'), true);
  check('F2 帮助入口为低对比度灰色圆形', hasDecl('.field-help', 'border-radius:50%') &&
    nz(ruleMap.get('.field-help') || '').includes('color:#9DA2AC'), true);
  check('F3 帮助入口为 button 且可键盘聚焦（非装饰 span）', (() => {
    const helps = $$('.field-help');
    return helps.length > 0 && helps.every(el => el.tagName === 'BUTTON' && el.querySelector('[role="tooltip"]'));
  })(), true);
  check('F4 Popover 同时支持 hover 与键盘 focus', hasRule('.field-help:hover .field-help-tip') &&
    hasRule('.field-help:focus-visible .field-help-tip'), true);
  check('F5 帮助说明默认隐藏', hasDecl('.field-help-tip', 'display:none'), true);

  /* ========== G. Toast（§5.8.1） ========== */
  check('G1 Toast 固定业务视口顶部 24px 水平居中',
    hasDecl('.device-toast', 'position:fixed') && hasDecl('.device-toast', 'top:24px') &&
    hasDecl('.device-toast', 'left:50%') && hasDecl('.device-toast', 'transform:translateX(-50%)'), true);
  check('G2 Toast 宽度区间 min-width 320px / max-width min(480px, calc(100vw-32px))',
    hasDecl('.device-toast', 'min-width:320px') && hasDecl('.device-toast', 'max-width:min(480px,calc(100vw-32px))'), true);
  check('G3 Toast min-height 44px', hasDecl('.device-toast', 'min-height:44px'), true);
  check('G4 Toast 白底 8px 圆角无描边',
    hasDecl('.device-toast', 'background:#FFFFFF') && hasDecl('.device-toast', 'border-radius:8px') &&
    hasDecl('.device-toast', 'border:0'), true);
  check('G5 Toast 中层阴影 0 6px 24px rgba(0,0,0,.12)', hasDecl('.device-toast', 'box-shadow:06px24pxrgba(0,0,0,.12)'), true);
  check('G6 Toast 入场 150ms / 离场 180ms', hasDecl('.device-toast', 'animation:device-toast-in.15s') &&
    hasDecl('.device-toast.is-leaving', 'animation:device-toast-out.18s'), true);
  check('G7 Toast 入场为淡入 + 下移复位（from opacity 0 / translateY -8px）',
    nz(cssText).includes('@keyframesdevice-toast-in{from{opacity:0;transform:translate(-50%,-8px);}to{opacity:1;transform:translate(-50%,0);}}'), true);
  check('G8 prefers-reduced-motion 关闭位移/动画', nz(cssText).includes('@media(prefers-reduced-motion:reduce){.device-toast'), true);
  check('G9 正文保持 ink-body（不使用黑色实底胶囊）', hasDecl('.device-toast', 'color:#3A3F4A'), true);
  check('G10 Toast 语义图标与语义色一一对应', (() => {
    const src = html;
    return src.includes("'circle-check', color: '#0FC060'") &&
      src.includes("'info', color: '#0091D5'") &&
      src.includes("'triangle-alert', color: '#E7772D'") &&
      src.includes("'circle-x', color: '#D9001B'");
  })(), true);
  check('G11 Toast 默认展示 3000ms', html.includes('}, 3000);'), true);

  /* ========== H. 语义色 token（§1.3） ========== */
  /* 用花括号配对提取 tailwind.config 对象（正则易被缩进差异打断） */
  const cfg = (() => {
    const i = html.indexOf('tailwind.config');
    if (i < 0) return '';
    const start = html.indexOf('{', i);
    if (start < 0) return '';
    let depth = 0;
    for (let j = start; j < html.length; j += 1) {
      if (html[j] === '{') depth += 1;
      else if (html[j] === '}') { depth -= 1; if (depth === 0) return html.slice(start, j + 1); }
    }
    return '';
  })();
  const palette = {
    primary: '#0066FF', primaryHover: '#0052CC', primaryActive: '#0047B3',
    inkTitle: '#1A1D24', inkBody: '#3A3F4A', inkSub: '#6E7685', inkMuted: '#9DA2AC',
    line: '#DFE1E5', lineLight: '#E8EAED', lineLighter: '#F0F1F3',
    page: '#F7F8FA', card: '#FFFFFF',
    success: '#0FC060', successBg: '#E7F9F0',
    warning: '#E7772D', warningBg: '#FDF2E9',
    danger: '#D9001B', dangerBg: '#FFE8EB',
    info: '#0091D5', infoBg: '#E4F4FB'
  };
  const missing = Object.entries(palette).filter(([, v]) => !cfg.includes(v)).map(([k]) => k);
  check('H1 语义色 token 与 design.md §1.3 完全一致', missing, []);

  /* ========== I. 圆角 / 间距 token（§3.1 §3.2） ========== */
  check('I1 圆角梯度仅 4px 默认 / 6px md / 8px lg', /borderRadius:\s*\{\s*DEFAULT:\s*'4px',\s*md:\s*'6px',\s*lg:\s*'8px'/.test(cfg), true);
  check('I2 未出现规范外的圆角取值', (() => {
    const bad = [...cssText.matchAll(/border-radius:\s*([^;}]+)/g)].map(x => x[1].trim())
      .filter(v => !/^(4px|6px|8px|50%|2px 2px 0 0)$/.test(v.replace(/\s+/g, ' ')));
    return bad;
  })(), []);

  /* ========== J. 界面语言（§2.3） ========== */
  check('J1 无「IP 查询渠道」中英空格残留', html.includes('IP 查询渠道'), false);
  check('J2 无装饰性英文标题 / 中英双标题', (() => {
    const h = $$('h1,h2,h3,h4').map(el => el.textContent.trim());
    return h.filter(t => /^[A-Za-z][A-Za-z\s]{2,}$/.test(t));
  })(), []);
  check('J3 技术枚举保留（HTTP/HTTPS/SOCKS5、IPv4/IPv6、IP 查询渠道值）', (() => {
    const IP_PROVIDERS = 'IPInfo,IP2Location,IPData';
    const providerIds = ['#deviceIpProvider', '#dynamicIpProvider', '#staticIpProvider', '#dynamicBatchIpProvider'];
    return $$('#deviceType option').map(o => o.value).join(',') === 'HTTP,HTTPS,SOCKS5' &&
      $$('#addressType option').map(o => o.value).join(',') === 'IPv4,IPv6' &&
      providerIds.every(id => $$(id + ' option').map(o => o.value).join(',') === IP_PROVIDERS);
  })(), true);

  /* ========== K. 页签一致性（§5.0 同类组件全站外观一致） ========== */
  /* 需求 18：页签规格对齐设备商城页头（设备管理-平台设备-购买设备.html .store-tab），不再是设备来源页签那一套 */
  check('K1 页签对齐「购买设备」页（.add-mode-tab 44px 高 / min-width 104px / 2px 透明下划线底）',
    hasDecl('.add-mode-tab', 'height:44px') && hasDecl('.add-mode-tab', 'min-width:104px') &&
    hasDecl('.add-mode-tab', 'border-bottom:2px solid transparent') && hasDecl('.add-tabs', 'gap:8px'), true);
  check('K1b 选中态：primary 字色 + primary 下划线 + 600 字重 + 白底；hover 浅灰底',
    hasDecl('.add-mode-tab[aria-selected="true"]', 'border-bottom-color:#0066FF') &&
    hasDecl('.add-mode-tab.is-active', 'color:#0066FF') &&
    hasDecl('.add-mode-tab.is-active', 'font-weight:600') &&
    hasDecl('.add-mode-tab:hover', 'background:#F3F4F6'), true);
  check('K2 页签具备 tablist/tab 语义', (() => {
    const list = $('[role="tablist"]');
    return !!list && $$('[role="tab"]').length === 2 &&
      $$('[role="tabpanel"]').length === 2 && $$('#singlePane').length === 1 && $$('#batchPane').length === 1;
  })(), true);
  check('K3 仅一个页签 is-active', $$('.add-mode-tab.is-active').length, 1);
  /* 返回按钮与设备商城子页页头同款：专属类 .back-btn，写死 14px 字号（本页 body 是 13px） */
  check('K4 返回按钮与设备商城页头同款（32px 高 / 0 16px 内边距 / 14px 字号 / 15px 图标）',
    hasDecl('.add-head .back-btn', 'height:32px') && hasDecl('.add-head .back-btn', 'padding:0 16px') &&
    hasDecl('.add-head .back-btn', 'font-size:14px') && hasDecl('.add-head .back-btn svg', 'width:15px'), true);
  check('K5 页头容器（.add-head）44px 高 / 16px 间距 / 页签区占满剩余宽度',
    hasDecl('.add-head', 'height:44px') && hasDecl('.add-head', 'gap:16px') &&
    hasDecl('.add-head', 'display:flex') && hasDecl('.add-head .add-tabs', 'flex:1 1 auto'), true);
  check('K6 返回按钮实测：32px 高 / 14px 字号 / 白底 / line 描边', (() => {
    return [cs('#backBtn', 'height'), cs('#backBtn', 'font-size'),
      cs('#backBtn', 'background-color'), cs('#backBtn', 'border-top-color')];
  })(), ['32px', '14px', 'rgb(255, 255, 255)', 'rgb(223, 225, 229)']);
  check('K7 页签实测：44px 高 / min-width 104px / 选中项字色 primary', (() => {
    return [cs('.add-mode-tab', 'height'), cs('.add-mode-tab', 'min-width'), cs('.add-mode-tab.is-active', 'color')];
  })(), ['44px', '104px', 'rgb(0, 102, 255)']);

  /* ========== L. 结构健康（HTML 合法性） ========== */
  check('L1 页面内 id 全局唯一', (() => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]);
    return ids.filter((v, ix) => ids.indexOf(v) !== ix);
  })(), []);
  check('L2 <style> 花括号配平', (() => {
    return [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].every(m =>
      (m[1].match(/\{/g) || []).length === (m[1].match(/\}/g) || []).length);
  })(), true);
  check('L3 遗留旧类名已清零', (() => {
    const legacy = ['form-grid', 'add-tab', 'tab-underline', 'form-note', 'is-danger', 'accent-primary'];
    return legacy.filter(c => new RegExp(`(?<![\\w-])${c}(?![\\w-])`).test(html));
  })(), []);
  check('L4 所有 label[for] 都能命中对应控件', (() => {
    return $$('label[for]').filter(l => !doc.getElementById(l.getAttribute('for'))).map(l => l.getAttribute('for'));
  })(), []);
  check('L5 页签按钮已绑定点击委托（切换有效）', (() => {
    const batch = $('.add-mode-tab[data-add-mode="batch"]');
    batch.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    const okSwitch = $('#batchPane').classList.contains('hidden') === false;
    const single = $('.add-mode-tab[data-add-mode="single"]');
    single.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    const okBack = $('#singlePane').classList.contains('hidden') === false;
    return okSwitch && okBack;
  })(), true);

  /* ========== M. 区块底部固定操作栏（对齐 环境管理-编辑环境.html） ========== */
  /* 注意：jsdom 下 Tailwind class 无样式支撑，`justify-*` / `h-16` / `bg-card` 读计算样式会恒为默认值，
     因此这里断言 class 列表；真实生效情况由 agent-browser 侧 `getComputedStyle` 复核。 */
  check('M1 按钮组右对齐（justify-end，不残留 justify-between / justify-start）', (() => {
    const f = $('main > section > footer');
    if (!f) return '__NO_FOOTER__';
    return {
      hasEnd: f.classList.contains('justify-end'),
      hasBetween: f.classList.contains('justify-between'),
      hasStart: f.classList.contains('justify-start')
    };
  })(), { hasEnd: true, hasBetween: false, hasStart: false });
  check('M2 操作栏样式与「编辑环境」页底部操作栏一致', (() => {
    const f = $('main > section > footer');
    if (!f) return '__NO_FOOTER__';
    return ['h-16', 'shrink-0', 'bg-card', 'border-t', 'border-line', 'z-20', 'flex', 'items-center', 'justify-end', 'px-4', 'md:px-6']
      .filter(c => !f.classList.contains(c));
  })(), []);
  check('M2b 操作栏承载在区块底部（#formArea 之外、section 的直接子项）', (() => {
    const f = $('main > section > footer');
    if (!f) return '__NO_FOOTER__';
    return { isFormAreaChild: $('#formArea').contains(f), parentIsSection: f.parentElement === $('main > section') };
  })(), { isFormAreaChild: false, parentIsSection: true });
  check('M2c 操作栏不含左侧说明文案，只有按钮组', (() => {
    const f = $('main > section > footer');
    if (!f) return '__NO_FOOTER__';
    return {
      paragraphs: $$('main > section > footer p').length,
      otherText: Array.from(f.children).filter(el => el.tagName !== 'DIV').length,
      statusRemoved: !$('#footerStatus'),
      hasFooterStatusRule: hasRule('.footer-status')
    };
  })(), { paragraphs: 0, otherText: 0, statusRemoved: true, hasFooterStatusRule: false });
  /* 本页 `.hidden{display:none!important}` 会压掉 Tailwind 的 `md:block` 等响应式显示类，
     任何「.hidden + 响应式显示类」混用都会导致元素永久不可见 —— 全页扫描守住这个坑。 */
  check('M2d 全页无「.hidden 与响应式显示类」混用', (() => {
    return $$('.hidden')
      .filter(el => /(?:^|\s)(?:sm|md|lg|xl):(?:block|flex|inline|inline-flex|grid|table)\b/.test(el.className))
      .map(el => el.id || el.className);
  })(), []);
  check('M3 按钮顺序「取消」在前、「确定」在后', $$('main > section > footer button').map(b => b.id), ['cancelBtn', 'submitBtn']);
  check('M4 取消为次按钮（btn-secondary），确定为按钮（btn-primary），均为 min-w-[92px]', (() => {
    const c = $('#cancelBtn').className, s = $('#submitBtn').className;
    return {
      cancelOk: c.includes('btn-secondary') && c.includes('min-w-[92px]') && !c.includes('btn-primary'),
      submitOk: s.includes('btn-primary') && s.includes('min-w-[92px]')
    };
  })(), { cancelOk: true, submitOk: true });
  check('M5 提交按钮文案固定为「确定」，不随添加方式变化', (() => {
    const b = $('.add-mode-tab[data-add-mode="batch"]');
    b.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    const batch = $('#submitBtn').textContent.trim();
    const s = $('.add-mode-tab[data-add-mode="single"]');
    s.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    return [batch, $('#submitBtn').textContent.trim()];
  })(), ['确定', '确定']);
  check('M5b 按钮组容器为 flex + gap-3', (() => {
    /* 操作栏左侧新增了校验重复项槽位，按钮组要用 #submitBtn 反查，不能取 footer 的第一个 div */
    const g = $('#submitBtn').closest('div');
    if (!g) return '__NO_GROUP__';
    return ['flex', 'gap-3'].filter(c => !g.classList.contains(c));
  })(), []);
  check('M6 页面上不再出现旧文案「添加设备 / 批量添加」作为提交按钮文本', (() => {
    const t = $('#submitBtn').textContent.trim();
    return t === '确定';
  })(), true);

  /* ========== N. 网络属性卡片式单选（design.md §3.1 卡片圆角 8px） ========== */
  check('N1 卡片：8px 圆角 / 1px line 描边 / 白底 / 12px 内边距',
    hasDecl('.net-card', 'border-radius:8px') && hasDecl('.net-card', 'border:1pxsolid#DFE1E5') &&
    hasDecl('.net-card', 'background:#FFFFFF') && hasDecl('.net-card', 'padding:12px'), true);
  check('N2 选中态：primary 描边 + primary 浅底 + 标题转 primary',
    hasDecl('.net-card.is-selected', 'border-color:#0066FF') &&
    hasDecl('.net-card.is-selected', 'background:#E6F0FF') &&
    hasDecl('.net-card.is-selected .net-card-title', 'color:#0066FF'), true);
  check('N3 两列等宽栅格且总宽 500px（与配置型控件同宽）',
    hasDecl('.net-cards', 'grid-template-columns:repeat(2,minmax(0,1fr))') &&
    hasDecl('.net-cards', 'width:500px'), true);
  check('N4 卡片描述为 12px ink-sub', hasDecl('.net-card-desc', 'color:#6E7685') &&
    nz(ruleMap.get('.net-card-desc') || '').includes('font-size:12px'), true);
  check('N5 用原生 radio 视觉隐藏，保留键盘可达性',
    $$('#networkRadio input[type="radio"]').length === 2 && hasDecl('.net-card-input', 'opacity:0'), true);
  check('N6 卡片为 label 包裹，整卡可点', (() => {
    return $$('#networkRadio .net-card, #batchNetworkRadio .net-card')
      .every(card => card.tagName === 'LABEL' && card.querySelector('input[type="radio"]'));
  })(), true);
  check('N7 未选择提交时卡片进入 danger 错误态', hasDecl('.net-card.is-error', 'border-color:#D9001B'), true);
  check('N7b 错误态优先于焦点环（danger 色环压过 primary 焦点环，避免蓝红混色）',
    hasDecl('.net-card.is-error', 'box-shadow:0002pxrgba(217,0,27,.08)') &&
    hasDecl('.net-card.is-error:has(.net-card-input:focus-visible)', 'box-shadow:0002pxrgba(217,0,27,.08)'), true);
  check('N8 单个/批量两个页签的卡片结构一致', (() => {
    const sig = root => $$('.net-card', $(root)).map(c => [
      c.querySelector('.net-card-input').value,
      c.querySelector('.net-card-title').textContent.trim(),
      c.querySelector('.net-card-desc').textContent.trim()
    ]);
    return JSON.stringify(sig('#networkRadio')) === JSON.stringify(sig('#batchNetworkRadio'));
  })(), true);
  check('N9 窄屏卡片改单列', nz(cssText).includes('@media(max-width:767px)') &&
    /@media\s*\(max-width:\s*767px\)\s*\{[\s\S]*?\.net-cards\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(cssText), true);

  /* ========== O. 到期时间日期下拉（沿用系统 em-date-trigger 视觉） ========== */
  check('O1 触发器 32px 高 / 4px 圆角 / line 描边 / 占位 ink-muted',
    hasDecl('.date-trigger', 'height:32px') && hasDecl('.date-trigger', 'border-radius:4px') &&
    hasDecl('.date-trigger', 'border:1pxsolid#DFE1E5') && hasDecl('.date-trigger', 'color:#9DA2AC'), true);
  check('O2 已选值用 mono + ink-body', hasDecl('.date-value.is-selected', 'color:#3A3F4A') &&
    nz(ruleMap.get('.date-value.is-selected') || '').includes("font-family:'JetBrainsMono'"), true);
  check('O3 面板 8px 圆角 / 白底 / line 描边 / 中层阴影',
    hasDecl('.date-picker', 'border-radius:8px') && hasDecl('.date-picker', 'background:#FFFFFF') &&
    hasDecl('.date-picker', 'border:1pxsolid#DFE1E5') &&
    hasDecl('.date-picker', 'box-shadow:06px24pxrgba(0,0,0,.12)'), true);
  check('O4 日历 7 列网格 / 日期格 30px / 选中态 primary 实底白字',
    hasDecl('.calendar-grid', 'grid-template-columns:repeat(7,minmax(0,1fr))') &&
    hasDecl('.calendar-day', 'height:30px') &&
    hasDecl('.calendar-day.is-selected', 'background:#0066FF') &&
    hasDecl('.calendar-day.is-selected', 'color:#FFFFFF'), true);
  check('O5 非当前月日期弱化', hasDecl('.calendar-day.is-other', 'color:#C7CAD1'), true);
  check('O6 触发器具备 dialog 语义与 aria 关联', (() => {
    const trigger = $('#deviceExpiresTrigger');
    return {
      haspopup: trigger.getAttribute('aria-haspopup'),
      controls: trigger.getAttribute('aria-controls'),
      labelledby: trigger.getAttribute('aria-labelledby'),
      panelRole: $('#deviceExpiresPicker').getAttribute('role')
    };
  })(), { haspopup: 'dialog', controls: 'deviceExpiresPicker', labelledby: 'deviceExpiresLabel', panelRole: 'dialog' });
  check('O7 取值字段为隐藏 input（提交逻辑沿用 .value）',
    $('#deviceExpires').tagName === 'INPUT' && $('#deviceExpires').type === 'hidden', true);
  check('O8 页面上不再使用原生 datetime-local', html.includes('datetime-local'), false);
  check('O9 表单区为滚动容器，面板下方放不下时向上翻转（避免只露出一条）',
    /\boverflow-auto\b/.test($('#formArea').className) &&
    hasDecl('.date-picker.is-drop-up', 'top:auto') &&
    hasDecl('.date-picker.is-drop-up', 'bottom:calc(100%+6px)') &&
    /picker\.offsetHeight\s*\+\s*12/.test(html) &&
    /picker\.classList\.add\('is-drop-up'\)/.test(html), true);
  check('O10 检测结果展示后保证落在可视区内（含 jsdom 兜底）',
    /if\s*\(row\.scrollIntoView\)\s*row\.scrollIntoView\(\{\s*block:\s*'nearest'/.test(html), true);

  /* ========== P. 检测结果表格（design.md §5.2 表格规范） ========== */
  check('P1 表头：line-lighter 底 + ink-sub 字 + 12px/600 + 9px 12px + line 下边框',
    hasDecl('.data-table th', 'background:#F0F1F3') && hasDecl('.data-table th', 'color:#6E7685') &&
    hasDecl('.data-table th', 'font-size:12px') && hasDecl('.data-table th', 'font-weight:600') &&
    hasDecl('.data-table th', 'padding:9px12px') && hasDecl('.data-table th', 'border-bottom:1pxsolid#DFE1E5'), true);
  check('P2 数据行：13px ink-body + 9px 12px + line-lighter 下边框',
    nz(ruleMap.get('.data-table') || '').includes('font-size:13px') &&
    hasDecl('.data-table td', 'color:#3A3F4A') && hasDecl('.data-table td', 'padding:9px12px') &&
    hasDecl('.data-table td', 'border-bottom:1pxsolid#F0F1F3'), true);
  check('P3 五个列头与产品定义一致', $$('#detectResultRow th').map(th => th.textContent.trim()),
    ['设备名称', '设备/域名', '端口', '归属地', '检测结果']);
  check('P4 结论用语义色 + Lucide 图标（成功/重复/失败三态）',
    html.includes("ok: { icon: 'circle-check', color: '#0FC060'") &&
    html.includes("duplicate: { icon: 'triangle-alert', color: '#E7772D'") &&
    html.includes("fail: { icon: 'circle-x', color: '#D9001B'"), true);
  check('T1 检测设备按钮为描边主按钮（蓝字蓝描边），单个与批量共用同类',
    hasDecl('.btn-outline-primary', 'color:#0066FF') && hasDecl('.btn-outline-primary', 'border-color:#0066FF') &&
    /id="detectSingle"[^>]*class="btn btn-outline-primary"/.test(html) &&
    /id="detectStatic"[^>]*class="btn btn-outline-primary"/.test(html) &&
    /id="detectDynamic"[^>]*class="btn btn-outline-primary"/.test(html), true);
  check('T2 密码显隐按钮：输入框右侧内嵌 + 右侧留白 + 焦点环',
    hasDecl('.pwd-wrap', 'position:relative') && hasDecl('.pwd-wrap > .control', 'padding-right:36px') &&
    hasDecl('.pwd-toggle', 'position:absolute') && hasDecl('.pwd-toggle', 'right:8px') &&
    hasDecl('.pwd-toggle:focus-visible', 'outline:2pxsolid#0066FF'), true);
  check('T3 检测成功口径：归属地「中国-杭州」+ 结论「检测成功」',
    html.includes("region: verdict === 'ok' ? '中国-杭州'") && html.includes("text: '检测成功'"), true);
  check('T4 设备账号 / 设备密码提示语按产品定义',
    $('#deviceAccount').getAttribute('placeholder') === '请输入设备账号' &&
    $('#devicePassword').getAttribute('placeholder') === '请输入设备密码' &&
    $('#devicePasswordToggle').getAttribute('aria-controls') === 'devicePassword', true);
  check('T5 批量静态检测结果表 11 列：地址类型紧跟设备类型、归属地紧跟设备端口、到期时间位于备注左侧', (() => {
    const heads = $$('#staticDetectRow th').map(th => th.textContent.trim());
    return {
      heads,
      count: heads.length,
      addressTypeAfterType: heads.indexOf('地址类型') === heads.indexOf('设备类型') + 1,
      regionAfterPort: heads.indexOf('归属地') === heads.indexOf('设备端口') + 1,
      expiresBeforeRemark: heads.indexOf('到期时间') === heads.indexOf('备注') - 1
    };
  })(), {
    heads: ['设备名称', '设备类型', '地址类型', '设备IP', '设备端口', '归属地', '设备账号', '设备密码', '检测结果', '到期时间', '备注'],
    count: 11, addressTypeAfterType: true, regionAfterPort: true, expiresBeforeRemark: true
  });
  check('T5b 批量动态检测结果表 8 列：设备类型右侧为「提取链接」、设备端口右侧为「归属地」（不含 账号/密码/地址类型/到期时间）',
    $$('#dynamicDetectRow th').map(th => th.textContent.trim()),
    ['设备名称', '设备类型', '提取链接', '设备IP', '设备端口', '归属地', '检测结果', '备注']);
  check('T5d 动态结果表落地口径：提取链接省略展示并挂 title；动态分支不渲染账号/密码/到期时间', (() => {
    const dynBranch = /\} else \{\s*cells = nameCellHtml\(row\) \+([\s\S]{0,700}?)editableCellHtml\('remark', row\);/;
    const hit = dynBranch.exec(html);
    const body = hit ? hit[1] : '';
    return {
      clipRule: hasDecl('.cell-clip', 'display:block') && hasDecl('.cell-clip', 'max-width:240px') &&
        hasDecl('.cell-clip', 'overflow:hidden') && hasDecl('.cell-clip', 'text-overflow:ellipsis') &&
        hasDecl('.cell-clip', 'white-space:nowrap'),
      endpointCell: /cell-clip" title="' \+ escapeHtml\(row\.endpoint\)/.test(html) &&
        html.includes("escapeHtml(row.endpoint) + '</span></td>'"),
      dynamicHasRemark: !!hit && html.includes("editableCellHtml('remark', row);"),
      dynamicNoAccount: body.includes("editableCellHtml('account', row)") === false,
      dynamicNoExpires: body.includes("editableCellHtml('expires', row)") === false,
      dynamicHasRegion: body.includes('escapeHtml(row.region)')
    };
  })(), {
    clipRule: true, endpointCell: true, dynamicHasRemark: true,
    dynamicNoAccount: true, dynamicNoExpires: true, dynamicHasRegion: true
  });
  check('T5c 静态独有列的落地口径：地址类型由主机 [] 写法推导、归属地随检测结论、到期时间可编辑且限 16 字', (() => {
    const m = /if \(isStatic\) \{\s*cells = nameCellHtml\(row\) \+([\s\S]{0,900}?)editableCellHtml\('remark', row\);/.exec(html);
    const body = m ? m[1] : '';
    return {
      derive: /addressType:\s*host\.charAt\(0\)\s*===\s*'\['\s*\?\s*'IPv6'\s*:\s*'IPv4'/.test(html),
      regionRule: /region:\s*verdict\s*===\s*'ok'\s*\?\s*'中国-杭州'\s*:\s*'未知-未知'/.test(html),
      label: /EDITABLE_LABELS\s*=\s*\{[^}]*expires:\s*'到期时间'/.test(html),
      maxLength: /field === 'expires' \? 16/.test(html),
      placeholder: /input\.placeholder = 'YYYY-MM-DD HH:mm'/.test(html),
      staticBranch: {
        hit: !!m,
        addressType: body.includes('escapeHtml(row.addressType)'),
        region: body.includes('escapeHtml(row.region)'),
        expires: body.includes("editableCellHtml('expires', row)"),
        account: body.includes("editableCellHtml('account', row)"),
        password: body.includes("editableCellHtml('password', row)")
      },
      samples: /BATCH_EXPIRES_SAMPLES\s*=\s*\['2026-11-30 23:59'/.test(html)
    };
  })(), {
    derive: true, regionRule: true, label: true, maxLength: true, placeholder: true,
    staticBranch: { hit: true, addressType: true, region: true, expires: true, account: true, password: true },
    samples: true
  });
  check('U1 说明区块与左侧输入框等高（共用 --entry-height，加宽到 490px 并收缩字号后不再卡内滚动）',
    hasDecl('.device-entry-grid', '--entry-height:240px') &&
    hasDecl('.device-entry-grid', 'grid-template-columns:minmax(0,500px)minmax(0,490px)') &&
    hasDecl('textarea.control.lines-lg', 'min-height:var(--entry-height,240px)') &&
    hasDecl('.guide-panel', 'height:var(--entry-height,240px)') &&
    hasDecl('.guide-panel', 'overflow-y:auto') &&
    hasDecl('.guide-panel', 'padding:12px') &&
    hasDecl('.guide-panel', 'font-size:11px') && hasDecl('.guide-panel', 'line-height:15px') &&
    hasDecl('.guide-panel h4', 'font-size:12px') && hasDecl('.guide-panel h4', 'line-height:15px') &&
    hasDecl('.guide-steps li + li', 'margin-top:4px') &&
    hasDecl('.guide-sub', 'font-size:11px') && hasDecl('.guide-sub', 'line-height:15px') &&
    hasDecl('.guide-fmt', 'font-size:10px') && hasDecl('.guide-fmt', 'line-height:12px') &&
    hasDecl('.guide-fmt li + li', 'margin-top:1px'), true);
  check('U2 动态提取链接恢复花括号备注（placeholder / 说明规则 / 格式示例三处同步，示例逐行带 {备注}）', (() => {
    const placeholder = $('#dynamicLines').getAttribute('placeholder');
    const fmt = $$('#batchDynamic .guide-fmt li').map(li => li.textContent.trim());
    return {
      placeholderBracedLines: placeholder.split('\n').slice(1).filter(line => /^https?:\/\/.*\{备注\}$/.test(line.trim())).length,
      braceRuleCount: $$('#batchDynamic .guide-steps li').filter(li => li.textContent.trim() === '备注写在花括号内，最多 40 字').length,
      fmtTexts: fmt,
      fmtAllBraced: fmt.length === 3 && fmt.every(item => /\{备注\}$/.test(item)),
      parseDepth: html.includes('备注超过 40 字') && /remarkMatch/.test(html)
    };
  })(), {
    placeholderBracedLines: 3,
    braceRuleCount: 1,
    fmtTexts: ['https://api.example.test/token{备注}', 'https://proxy.test/rotate/secret{备注}', 'http://127.0.0.1:8080/get?token=abc{备注}'],
    fmtAllBraced: true,
    parseDepth: true
  });
  check('U3 批量检测结果成功态与单个添加统一为「检测成功」，旧文案「设备正常」已彻底移除',
    html.includes("ok: { icon: 'circle-check', color: '#0FC060', text: '检测成功' }") &&
    html.includes('设备正常') === false &&
    // 两处结果表各自的文案映射（单个添加 / 批量）都指向「检测成功」
    (html.match(/text: '检测成功' \}/g) || []).length === 2, true);

  /* ========== V. 批量检测概览（「检测设备」按钮右侧的时间 + 三计数） ========== */
  check('V1 概览与检测按钮同容器同行、紧随其后，容器不再锁 500px',
    (() => {
      const staticBar = $('#staticDetectMeta').closest('.detect-bar');
      const dynamicBar = $('#dynamicDetectMeta').closest('.detect-bar');
      return {
        sameBarStatic: staticBar === $('#detectStatic').closest('.detect-bar'),
        sameBarDynamic: dynamicBar === $('#detectDynamic').closest('.detect-bar'),
        metaAfterStaticBtn: !!($('#detectStatic').compareDocumentPosition($('#staticDetectMeta')) & 4),
        metaAfterDynamicBtn: !!($('#detectDynamic').compareDocumentPosition($('#dynamicDetectMeta')) & 4),
        barFlex: hasDecl('.detect-bar', 'display:flex') && hasDecl('.detect-bar', 'align-items:center'),
        metaFlex: hasDecl('.detect-meta', 'display:flex'),
        noFixedWidth: $('#staticDetectMeta').closest('.form-control').classList.contains('is-composite')
      };
    })(), {
      sameBarStatic: true, sameBarDynamic: true, metaAfterStaticBtn: true, metaAfterDynamicBtn: true,
      barFlex: true, metaFlex: true, noFixedWidth: true
    });
  check('V2 概览四项文案与初始值（时间 --、三计数归 0），时间置于 aria-live 区',
    (() => {
      const read = (key) => $$('#' + key + 'DetectMeta .detect-meta-item').map(item => item.textContent.trim());
      return {
        static: read('static'),
        dynamic: read('dynamic'),
        timeInMono: $('#staticDetectTime').classList.contains('mono'),
        ariaLive: $('#staticDetectMeta').getAttribute('aria-live'),
        role: $('#staticDetectMeta').getAttribute('role')
      };
    })(), {
      static: ['上次检测时间：--', '已添加设备数量：0', '检测成功数：0', '检测失败数：0'],
      dynamic: ['上次检测时间：--', '已添加设备数量：0', '检测成功数：0', '检测失败数：0'],
      timeInMono: true, ariaLive: 'polite', role: 'status'
    });
  check('V3 概览为次级文字：12px / 18px / ink-sub，数值转 ink-body', (() => {
    const style = win.getComputedStyle($('#staticDetectMeta'));
    const valueStyle = win.getComputedStyle($('#staticAddedCount'));
    return { fontSize: style.fontSize, lineHeight: style.lineHeight, label: style.color, value: valueStyle.color };
  })(), { fontSize: '12px', lineHeight: '18px', label: 'rgb(110, 118, 133)', value: 'rgb(58, 63, 74)' });
  check('V4 概览刷新口径：检测后写当前时间（精确到秒），无结果回落 --、计数归 0',
    /function pad2\(value\)/.test(html) &&
    /function formatDateTime\(date\)/.test(html) &&
    /getFullYear\(\)[\s\S]{0,240}getSeconds\(\)/.test(html) &&
    html.includes("rows ? formatDateTime(new Date()) : '--'") &&
    html.includes("rows ? String(rows.length) : '0'") &&
    /\$\('#dynamicDetectStats'\)\.textContent = stats;\s*renderDetectMeta\(isStatic, rows\)/.test(html) &&
    /renderDetectMeta\(true, null\);\s*renderDetectMeta\(false, null\);/.test(html), true);

  /* ========== W. 检测结果表行内编辑：编辑态不移动其他字段列位置 ========== */
  check('W1 行内编辑输入框脱离文档流（绝对定位 + translateY 居中），宽度 = 列宽 − 24px 且上限 300px',
    hasDecl('.cell-editable', 'position:relative') &&
    hasDecl('.cell-input', 'position:absolute') &&
    hasDecl('.cell-input', 'top:50%') &&
    hasDecl('.cell-input', 'left:12px') &&
    hasDecl('.cell-input', 'transform:translateY(-50%)') &&
    hasDecl('.cell-input', 'width:calc(100%-24px)') &&
    hasDecl('.cell-input', 'max-width:300px') &&
    hasDecl('.cell-input', 'height:28px') &&
    /* 否定约束：不得再出现独立 width:300px / min-width（归一化后 ';width:300px' 可区分 max-width 误命中） */
    nz(ruleMap.get('.cell-input') || '').includes(';width:300px') === false &&
    nz(ruleMap.get('.cell-input') || '').includes('min-width') === false &&
    nz(ruleMap.get('.data-table') || '').includes('width:100%'), true);
  check('W2 编辑态用 visibility 保占位隐藏原值（display:none 会改变列内容宽度，再次触发表格重排）',
    hasDecl('.cell-value.is-veiled', 'visibility:hidden') &&
    hasDecl('.cell-editable.is-editing .cell-hint', 'visibility:hidden') &&
    nz(ruleMap.get('.cell-value.is-veiled') || '').includes('display:none') === false &&
    nz(ruleMap.get('.cell-editable.is-editing .cell-hint') || '').includes('display:none') === false &&
    html.includes('span.classList.add(\'is-veiled\')') &&
    html.includes('span.classList.remove(\'is-veiled\')') &&
    html.includes('span.classList.add(\'hidden\')') === false, true);
  check('W3 输入框就地插入到 td 内（insertBefore 到原值之前），提交/Esc 后移除并还原',
    hasDecl('.cell-input', 'font:inherit') &&
    hasDecl('.cell-input', 'border:1pxsolid#0066FF') &&
    /cell\.insertBefore\(input,\s*span\)/.test(html) &&
    /state\.input\.remove\(\)/.test(html) &&
    /cell\.classList\.add\('is-editing'\)/.test(html) &&
    /state\.cell\.classList\.remove\('is-editing'\)/.test(html), true);
  check('P5 默认选中「静态」时检测区直接展示，结果区仍隐藏（避免空表格占位）',
    $('#detectRow').classList.contains('hidden') === false &&
    $('#detectResultRow').classList.contains('hidden'), true);
  check('P6 校验重复项位于底部操作栏左侧，默认未勾选且随「单个添加 + 已选网络属性」展示', (() => {
    const wrap = $('#duplicateOptionWrap');
    const footer = wrap.closest('footer');
    return {
      unchecked: $('#detectDuplicate').checked === false,
      inFooter: footer !== null,
      leftSlot: /\bmr-auto\b/.test(wrap.className),
      shownWithDefaultStatic: wrap.classList.contains('hidden') === false,
      text: wrap.querySelector('label').textContent.trim(),
      notInDetectRow: $('#detectRow').contains(wrap) === false,
      /* 显隐口径：单个添加 + 已选网络属性（静态 / 动态都提供），批量由 batchOptionsWrap 承担 */
      syncScope: /duplicateOptionWrap'\)\.classList\.toggle\('hidden',\s*!\(addMode\s*===\s*'single'\s*&&\s*Boolean\(singleNetwork\)\)\)/.test(html),
      /* 切换网络属性保留勾选：只有「未选择网络属性」才清空 */
      keepChecked: /if\s*\(!selected\)\s*\$\('#detectDuplicate'\)\.checked\s*=\s*false;/.test(html)
    };
  })(), { unchecked: true, inFooter: true, leftSlot: true, shownWithDefaultStatic: true, text: '校验重复项', notInDetectRow: true, syncScope: true, keepChecked: true });

  /* ========== Q. 动态网络提醒区块与客服气泡（design.md §3.1 圆角 8px / §1.3 语义色） ========== */
  check('Q1 提醒区块为灰底 8px 圆角 12px 内边距，默认隐藏且仅在动态网络下展示',
    hasDecl('.notice-block', 'background:#F7F8FA') && hasDecl('.notice-block', 'border-radius:8px') &&
    hasDecl('.notice-block', 'padding:12px') && hasDecl('.notice-block', 'display:flex') &&
    $('#dynamicNotice').classList.contains('hidden') &&
    /dynamicNotice'\)\.classList\.toggle\('hidden',\s*!isDynamic\)/.test(html), true);
  check('Q2 提醒图标 16px ink-muted，标题 13px/500 ink-body，正文 12px ink-sub',
    hasDecl('.notice-icon', 'width:16px') && hasDecl('.notice-icon', 'height:16px') &&
    hasDecl('.notice-icon', 'color:#9DA2AC') &&
    hasDecl('.notice-title', 'color:#3A3F4A') && hasDecl('.notice-title', 'font-weight:500') &&
    hasDecl('.notice-line', 'color:#6E7685') && hasDecl('.notice-line', 'font-size:12px'), true);
  check('Q3 提醒文案两条与产品定义一致（气泡文案不计入正文）', (() => {
    const lineText = p => {
      const clone = p.cloneNode(true);
      const pop = clone.querySelector('.kf-pop');
      if (pop) pop.remove();
      return clone.textContent.replace(/\s+/g, '');
    };
    return $$('#dynamicNotice .notice-line').map(lineText);
  })(), ['1.部分代理平台需先将本机IP加入白名单，才能正常提取代理。', '2.如返回格式暂不支持，请联系客服处理。']);
  check('Q4 提醒图标用 circle-alert（语义化提醒而非告警）',
    ($('.notice-icon', $('#dynamicNotice')) || {}).dataset ? $('.notice-icon', $('#dynamicNotice')).dataset.lucide : null, 'circle-alert');
  check('Q5 联系客服：primary 蓝 + 下划线 + hover 加深',
    hasDecl('.kf-link', 'color:#0066FF') && hasDecl('.kf-link', 'text-decoration:underline') &&
    hasDecl('.kf-link:hover', 'color:#0052CC'), true);
  check('Q6 气泡：白卡 8px 圆角 + line 描边 + 中层阴影，链接上方居中展开',
    hasDecl('.kf-pop', 'background:#FFFFFF') && hasDecl('.kf-pop', 'border-radius:8px') &&
    hasDecl('.kf-pop', 'border:1pxsolid#DFE1E5') &&
    hasDecl('.kf-pop', 'box-shadow:06px24pxrgba(0,0,0,.12)') &&
    hasDecl('.kf-pop', 'bottom:calc(100%+8px)'), true);
  check('Q7 气泡由 hover 与键盘聚焦（focus-within）双通道触发，默认不可见',
    /kf-wrap:hover\s+\.kf-pop/.test(html) && /kf-wrap:focus-within\s+\.kf-pop/.test(html) &&
    hasDecl('.kf-pop', 'opacity:0') && hasDecl('.kf-pop', 'visibility:hidden') &&
    hasDecl('.kf-pop', 'pointer-events:none'), true);
  check('Q8 二维码资源与气泡标题', [
    $('.kf-qr').getAttribute('src'),
    fs.existsSync('/Users/zhangbin/Desktop/灵匠/云登pc端/Prototype/assets/kefu-qr.png'),
    $('.kf-pop-title').textContent.trim(),
    ($('.kf-qr').getAttribute('width') + 'x' + $('.kf-qr').getAttribute('height'))
  ], ['assets/kefu-qr.png', true, '扫码添加专属客服', '120x120']);
  check('Q9 提取方式固定为「每次打开浏览器都提取新IP」且默认选中', (() => {
    const sel = $('#extractMode');
    return {
      options: $$('#extractMode option').map(o => o.value),
      value: sel.value,
      selected: sel.options[sel.selectedIndex].selected
    };
  })(), { options: ['每次打开浏览器都提取新IP'], value: '每次打开浏览器都提取新IP', selected: true });

  /* ========== R. 校验重复项移入操作栏 + 提交拦截（design.md §5.9 底部操作栏） ========== */
  check('R1 操作栏结构：左侧槽 mr-auto，提交按钮组仍居右',
    /\bmr-auto\b/.test($('#duplicateOptionWrap').className) &&
    /\bjustify-end\b/.test($('footer').className) &&
    $('#duplicateOptionWrap').closest('footer') === $('footer') &&
    $('#detectRow').contains($('#duplicateOptionWrap')) === false, true);
  check('R2 气泡沿用页面 .field-help-tip 视觉 token（白卡 + line 描边 + 4px 圆角 + 轻阴影）',
    hasDecl('.dup-tip', 'background:#FFFFFF') && hasDecl('.dup-tip', 'border:1pxsolid#DFE1E5') &&
    hasDecl('.dup-tip', 'border-radius:4px') && hasDecl('.dup-tip', 'box-shadow:02px8pxrgba(0,0,0,.06)') &&
    hasDecl('.dup-tip', 'font-size:12px') && hasDecl('.dup-tip', 'color:#3A3F4A'), true);
  check('R3 气泡在触发器上方展开、默认不可见，hover 与键盘聚焦双通道触发',
    hasDecl('.dup-tip', 'bottom:calc(100%+8px)') && hasDecl('.dup-tip', 'left:0') &&
    hasDecl('.dup-tip', 'display:none') &&
    /\.dup-option:hover\s+\.dup-tip/.test(html) && /\.dup-option:focus-within\s+\.dup-tip/.test(html), true);
  check('R4 气泡文案与产品定义一致（单个 / 批量两处同文案，措辞统一为「设备」）', (() => {
    const tips = $$('.dup-tip').map(tip => tip.textContent.trim());
    return {
      count: tips.length,
      texts: [...new Set(tips)],
      anyProxyWording: tips.some(t => /代理/.test(t)),
      bubbleInSingle: $('#duplicateOptionWrap') !== null && $('#duplicateOptionWrap .dup-tip') !== null,
      bubbleInBatch: $('#batchOptionsWrap .dup-tip') !== null
    };
  })(), {
    count: 2,
    texts: ['与“自有设备列表”中已添加的设备对比，当设备信息与某项完全一致时，判定该项为重复项，不做添加。'],
    anyProxyWording: false,
    bubbleInSingle: true,
    bubbleInBatch: true
  });
  check('R5「单个添加」的静态与动态网络都提供校验重复项（未选网络属性时不展示且清空勾选；批量有独立勾选项）',
    /duplicateOptionWrap'\)\.classList\.toggle\('hidden',\s*!\(addMode\s*===\s*'single'\s*&&\s*Boolean\(singleNetwork\)\)\)/.test(html) &&
    /batchOptionsWrap'\)\.classList\.toggle\('hidden',\s*addMode\s*!==\s*'batch'\)/.test(html) &&
    html.includes("if (!selected) $('#detectDuplicate').checked = false;") &&
    /* 切换网络属性保留勾选：不得出现「切到动态就清空」或「仅静态」的守卫 */
    /singleNetwork\s*===\s*'静态'\s*&&\s*!\$\(/.test(html) === false, true);
  check('R6 勾选后提交命中重复 → danger Toast 并禁止添加（静态按 主机:端口、动态按 提取链接）', (() => {
    return {
      anyScope: /\$\('#detectDuplicate'\)\.checked\)\s*\{[\s\S]{0,60}var\s+duplicateStatic\s*=\s*payload\.network\s*===\s*'静态'/.test(html),
      endpointRule: /duplicateStatic\s*\?\s*payload\.host\s*\+\s*':' \+ payload\.port\s*:\s*payload\.endpoint/.test(html),
      pools: /duplicateStatic\s*\?\s*EXISTING_STATIC_ENDPOINTS\s*:\s*EXISTING_EXTRACT_URLS/.test(html),
      message: html.includes("toast('检测到您要添加的设备与“自有设备列表”中存在重复，禁止添加！若想添加，请不要勾选“校验重复项”！', 'danger')") &&
        html.includes('自有代理列表') === false,
      blockedBeforeSubmitting: /existing\.indexOf\(endpoint\)\s*!==\s*-1\)\s*\{[\s\S]{0,400}return;[\s\S]{0,200}submitting = true;/.test(html)
    };
  })(), { anyScope: true, endpointRule: true, pools: true, message: true, blockedBeforeSubmitting: true });
  check('R7 点「检测设备」时同口径判重：静态与动态都按各自池全等比对，命中即「设备重复」', (() => {
    return {
      endpointRule: /var\s+endpoint\s*=\s*\(isStatic\s*\?\s*address\s*\+\s*':' \+ port\s*:\s*address\)\.toLowerCase\(\)/.test(html),
      pools: /var\s+existing\s*=\s*isStatic\s*\?\s*EXISTING_STATIC_ENDPOINTS\s*:\s*EXISTING_EXTRACT_URLS/.test(html),
      gated: /var\s+duplicate\s*=\s*\$\('#detectDuplicate'\)\.checked\s*&&\s*existing\.indexOf\(endpoint\)\s*!==\s*-1/.test(html),
      noNetworkGuard: /\$\('#detectDuplicate'\)\.checked\s*&&\s*isStatic/.test(html) === false &&
        /\$\('#detectDuplicate'\)\.checked\s*&&\s*!isStatic/.test(html) === false
    };
  })(), { endpointRule: true, pools: true, gated: true, noNetworkGuard: true });

  /* ========== S. 单个添加字段间距（design.md §5.9「字段间距 垂直 16px」） ========== */
  check('S1 字段行相邻间距 16px，首行不额外留白',
    hasDecl('.form-row', 'margin-top:16px') && hasDecl('.form-row:first-child', 'margin-top:0') &&
    hasDecl('#staticGroup, #dynamicGroup, #batchStatic, #batchDynamic', 'margin-top:16px'), true);
  check('S2 无错误文案时错误位不占位（不再让字段间距忽大忽小）',
    hasDecl('.field-error:empty', 'min-height:0') && hasDecl('.field-error:empty', 'margin-top:0'), true);
  check('S3 错误位保持 18px 行高且不用 display:none（aria-live 区域始终可朗读）',
    hasDecl('.field-error', 'min-height:18px') && hasDecl('.field-error', 'line-height:18px') &&
    nz(ruleMap.get('.field-error:empty') || '').includes('display:none') === false, true);
  check('S4 备注文本域改块级，去掉 inline 基线间隙（行高 = 文本域高度）',
    hasDecl('.count-wrap > .control', 'display:block'), true);

  /* ========== 输出 ========== */
  let failed = 0;
  results.forEach(r => {
    if (!r.pass) failed += 1;
    console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.pass ? '' : '  => ' + JSON.stringify(r.actual)));
  });
  console.log('\n' + (results.length - failed) + '/' + results.length + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
