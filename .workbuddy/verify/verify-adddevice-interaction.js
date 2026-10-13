/* 添加设备.html 子页面交互验证脚本（jsdom） */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const FILE = '/Users/zhangbin/Desktop/灵匠/云登pc端/Prototype/添加设备.html';
const html = fs.readFileSync(FILE, 'utf8');

(async () => {
const results = [];
function check(name, actual, expected) {
  const pass = typeof expected === 'function' ? expected(actual) : JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  url: 'http://127.0.0.1:8899/Prototype/添加设备.html?embedded=1'
});
const win = dom.window;
const doc = win.document;

win.tailwind = {};
win.lucide = { createIcons() {} };
win.structuredClone = win.structuredClone || (v => JSON.parse(JSON.stringify(v)));
const memStore = {};
Object.defineProperty(win, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} } });
Object.defineProperty(win, 'sessionStorage', {
  configurable: true,
  value: {
    getItem: k => (k in memStore ? memStore[k] : null),
    setItem: (k, v) => { memStore[k] = String(v); },
    removeItem: k => { delete memStore[k]; },
    clear() {}
  }
});
const sent = [];
Object.defineProperty(win, 'parent', { configurable: true, value: { postMessage: m => sent.push(m) } });

const blocks = [];
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(html)) !== null) blocks.push(m[1]);

const errors = [];
win.addEventListener('error', e => errors.push(String(e.message)));
try {
  blocks.forEach(code => win.eval(code));
} catch (err) {
  errors.push('eval: ' + err.message);
}

const $ = sel => doc.querySelector(sel);
const $$ = sel => Array.from(doc.querySelectorAll(sel));
const hidden = sel => $(sel).classList.contains('hidden');
function clickEl(el) { el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); }
function pick(sel) { const el = $(sel); el.checked = true; el.dispatchEvent(new win.Event('change', { bubbles: true })); }
function setValue(sel, value) {
  const el = $(sel);
  el.value = value;
  el.dispatchEvent(new win.Event('input', { bubbles: true }));
}

/* ===================== 1. 页头与页签 ===================== */
check('无脚本运行错误', errors, []);
check('页面标题已移除（页头只保留返回 + 添加方式页签）', [$('#pageTitle'), $$('main > section h1').length], [null, 0]);
check('返回按钮存在且为页头专属次按钮样式', [
  $('#backBtn') !== null,
  $('#backBtn').classList.contains('back-btn'),
  $('#backBtn').classList.contains('btn-secondary')
], [true, true, false]);
check('标题下分割线已移除', [!!$('.page-divider'), !!$('.add-head')], [false, true]);
check('页头顺序：返回按钮在左、页签紧随其右', Array.from($('.add-head').children).map(el => el.id || el.className.split(' ')[0]),
  ['backBtn', 'add-tabs', 'add-hint']);
check('添加方式页签', $$('.add-mode-tab').map(b => b.dataset.addMode), ['single', 'batch']);
check('页签状态与选中标识同步（aria-selected 与 is-active 一致）',
  $$('.add-mode-tab').map(b => [b.getAttribute('aria-selected'), b.classList.contains('is-active')]), [['true', true], ['false', false]]);
check('默认选中单个添加', [$('#singlePane').classList.contains('hidden'), $('#batchPane').classList.contains('hidden')], [false, true]);

/* ===================== 2. 单个添加字段 ===================== */
check('单个添加基础字段', ['deviceName', 'deviceType', 'networkRadio'].map(id => $('#' + id) !== null), [true, true, true]);
check('设备类型参数', $$('#deviceType option').map(o => o.value), ['HTTP', 'HTTPS', 'SOCKS5']);
check('网络属性参数', $$('#networkRadio input').map(i => i.value), ['静态', '动态']);
check('网络属性为卡片式单选', $$('#networkRadio .net-card').map(c => [
  c.querySelector('.net-card-title').textContent.trim(),
  c.querySelector('.net-card-desc').textContent.trim()
]), [['静态', '静态网络使用固定地址连接'], ['动态', '动态网络通过提取链接按规则获取IP']]);
check('网络属性默认选中「静态」，静态字段与检测区直接展示', [
  $$('#networkRadio input:checked').map(i => i.value),
  $$('#networkRadio .net-card.is-selected').map(c => c.querySelector('.net-card-title').textContent.trim()),
  $('#staticGroup').classList.contains('hidden'),
  $('#dynamicGroup').classList.contains('hidden'),
  $('#detectRow').classList.contains('hidden'),
  $('#duplicateOptionWrap').classList.contains('hidden')
], [['静态'], ['静态'], false, true, false, false]);
check('撤销选中网络属性时提交被拦截', (() => {
  /* 设备名称先填好，才能走到「网络属性未选」这条校验分支；
     原生 radio 无法点掉，这里按程序化置空并派发 change 模拟状态回退 */
  const staticRadio = $('#networkRadio input[value="静态"]');
  staticRadio.checked = false;
  staticRadio.dispatchEvent(new win.Event('change', { bubbles: true }));
  const cleared = [
    $('#staticGroup').classList.contains('hidden'),
    $('#dynamicGroup').classList.contains('hidden'),
    $('#detectRow').classList.contains('hidden')
  ];
  setValue('#deviceName', '临时设备');
  clickEl($('#submitBtn'));
  const message = $('#networkError').textContent;
  const cardErrors = $$('#networkRadio .net-card.is-error').length;
  setValue('#deviceName', '');
  /* 复原为默认的「静态」 */
  staticRadio.checked = true;
  staticRadio.dispatchEvent(new win.Event('change', { bubbles: true }));
  return { cleared, message, cardErrors, restored: $('#staticGroup').classList.contains('hidden') };
})(), { cleared: [true, true, true], message: '请选择网络属性', cardErrors: 2, restored: false });

const staticIds = ['addressType', 'deviceHost', 'devicePort', 'deviceAccount', 'devicePassword', 'deviceRemark', 'deviceExpires', 'deviceIpProvider'];
check('静态联动字段齐备', staticIds.map(id => $('#' + id) !== null), a => a.every(Boolean));
const staticLabels = $$('#staticGroup .form-label').map(el => el.textContent.replace(/[\s*]/g, ''));
check('静态联动字段标签', staticLabels, ['地址类型', '设备/域名', '设备账号', '设备密码', '备注', '到期时间', 'IP查询渠道']);
check('地址类型仅 IPv4 / IPv6', $$('#addressType option').map(o => o.value), ['IPv4', 'IPv6']);
check('设备账号提示语', $('#deviceAccount').getAttribute('placeholder'), '请输入设备账号');
check('设备密码提示语 + 显隐图标按钮', (() => {
  const wrap = $('#devicePassword').closest('.pwd-wrap');
  const btn = $('#devicePasswordToggle');
  return {
    placeholder: $('#devicePassword').getAttribute('placeholder'),
    type: $('#devicePassword').type,
    inPwdWrap: wrap !== null,
    btnType: btn.getAttribute('type'),
    ariaLabel: btn.getAttribute('aria-label'),
    ariaPressed: btn.getAttribute('aria-pressed'),
    ariaControls: btn.getAttribute('aria-controls'),
    icon: btn.querySelector('i').getAttribute('data-lucide')
  };
})(), { placeholder: '请输入设备密码', type: 'password', inPwdWrap: true, btnType: 'button', ariaLabel: '显示设备密码', ariaPressed: 'false', ariaControls: 'devicePassword', icon: 'eye' });
check('点击图标切换明文并同步图标与 aria', (() => {
  const btn = $('#devicePasswordToggle');
  setValue('#devicePassword', 'p@ssw0rd');
  clickEl(btn);
  const revealed = { type: $('#devicePassword').type, ariaPressed: btn.getAttribute('aria-pressed'), ariaLabel: btn.getAttribute('aria-label'), icon: btn.querySelector('i').getAttribute('data-lucide'), value: $('#devicePassword').value };
  clickEl(btn);
  const hidden = { type: $('#devicePassword').type, ariaPressed: btn.getAttribute('aria-pressed'), ariaLabel: btn.getAttribute('aria-label'), icon: btn.querySelector('i').getAttribute('data-lucide'), value: $('#devicePassword').value };
  setValue('#devicePassword', '');
  return { revealed, hidden };
})(), {
  revealed: { type: 'text', ariaPressed: 'true', ariaLabel: '隐藏设备密码', icon: 'eye-off', value: 'p@ssw0rd' },
  hidden: { type: 'password', ariaPressed: 'false', ariaLabel: '显示设备密码', icon: 'eye', value: 'p@ssw0rd' }
});
check('单个添加的检测设备为蓝字蓝描边按钮', (() => {
  const btn = $('#detectSingle');
  return {
    text: btn.textContent.trim(),
    outline: btn.classList.contains('btn-outline-primary') && !btn.classList.contains('btn-secondary')
  };
})(), { text: '检测设备', outline: true });
check('IP查询渠道参数', $$('#deviceIpProvider option').map(o => o.value), ['IPInfo', 'IP2Location', 'IPData']);
check('备注提示语与内置计数器', [
  $('#deviceRemark').getAttribute('placeholder'),
  $('#deviceRemarkCount').className,
  $('#deviceRemarkCount').parentElement.className
], ['请输入备注说明', 'count-inside', 'count-wrap']);
check('到期时间已改为日期下拉（不再是 datetime-local）', [
  $('#deviceExpires').type,
  $('#deviceExpiresTrigger') !== null,
  $('#deviceExpiresDisplay').textContent.trim()
], ['hidden', true, '请选择']);

pick('#networkRadio input[value="动态"]');
check('切到动态后联动', [$('#staticGroup').classList.contains('hidden'), $('#dynamicGroup').classList.contains('hidden')], [true, false]);
const dynamicLabels = $$('#dynamicGroup .form-label').map(el => el.textContent.replace(/[\s*]/g, ''));
check('动态联动字段标签（备注位于 IP查询渠道 上方）', dynamicLabels, ['提取方式', '提取链接', '备注', 'IP查询渠道']);
check('动态字段 id', ['extractMode', 'extractUrl', 'dynamicRemark', 'dynamicIpProvider'].map(id => $('#' + id) !== null), a => a.every(Boolean));
check('动态「备注」与静态同组件同口径（count-wrap + has-counter + 0/40 计数器 + 提示语）', (() => {
  const d = $('#dynamicRemark'), s = $('#deviceRemark');
  const dc = $('#dynamicRemarkCount'), sc = $('#deviceRemarkCount');
  return {
    sameTag: d.tagName === s.tagName,
    sameClass: d.className === s.className,
    samePlaceholder: d.getAttribute('placeholder') === s.getAttribute('placeholder'),
    sameMaxlength: d.getAttribute('maxlength') === s.getAttribute('maxlength'),
    counterClass: dc.className === sc.className,
    counterWrap: dc.parentElement.className === sc.parentElement.className,
    counterText: dc.textContent.trim(),
    labelText: $('#dynamicGroup label[for="dynamicRemark"]').textContent.trim(),
    /* 备注必须排在「IP查询渠道」之前（compareDocumentPosition & 4 = FOLLOWING） */
    aboveProvider: !!($('#dynamicRemark').compareDocumentPosition($('#dynamicIpProvider')) & 4)
  };
})(), {
  sameTag: true, sameClass: true, samePlaceholder: true, sameMaxlength: true,
  counterClass: true, counterWrap: true, counterText: '0/40', labelText: '备注', aboveProvider: true
});
check('动态备注输入后计数器同步（0/40 → 6/40）', (() => {
  setValue('#dynamicRemark', '动态备注回归');
  const text = $('#dynamicRemarkCount').textContent.trim();
  setValue('#dynamicRemark', '');
  return [text, $('#dynamicRemarkCount').textContent.trim()];
})(), ['6/40', '0/40']);
check('提取方式固定为「每次打开浏览器都提取新IP」且默认选中', [
  $$('#extractMode option').map(o => o.value),
  $('#extractMode').value,
  $('#extractMode').options[$('#extractMode').selectedIndex].selected
], [['每次打开浏览器都提取新IP'], '每次打开浏览器都提取新IP', true]);
check('动态网络下展示灰色提醒区块', [
  $('#dynamicNotice').classList.contains('hidden'),
  $('.notice-title', $('#dynamicNotice')).textContent.trim(),
  $$('#dynamicNotice .notice-line').map(p => {
    /* 气泡（.kf-pop）是链接的子节点，读取正文时要剥离，避免悬浮文案混入 */
    const clone = p.cloneNode(true);
    const pop = clone.querySelector('.kf-pop');
    if (pop) pop.remove();
    return clone.textContent.replace(/\s+/g, '');
  }).join('|')
], [false, '注意：', '1.部分代理平台需先将本机IP加入白名单，才能正常提取代理。|2.如返回格式暂不支持，请联系客服处理。']);
check('提醒区块含提醒图标与客服入口', [
  !!$('#dynamicNotice .notice-icon'),
  $('#kefuLink').textContent.trim(),
  !!$('#dynamicNotice .kf-pop'),
  ($('.kf-qr', $('#dynamicNotice')) || {}).getAttribute
    ? $('.kf-qr', $('#dynamicNotice')).getAttribute('src')
    : null
], [true, '联系客服', true, 'assets/kefu-qr.png']);
check('动态 IP查询渠道参数', $$('#dynamicIpProvider option').map(o => o.value), ['IPInfo', 'IP2Location', 'IPData']);
check('动态网络下同样提供校验重复项（与静态一致，位于操作栏左侧）', [
  $('#duplicateOptionWrap').classList.contains('hidden'),
  $('#detectDuplicate').checked
], [false, false]);
pick('#networkRadio input[value="静态"]');
check('静态网络下操作栏提供校验重复项且默认未勾选', [
  $('#duplicateOptionWrap').classList.contains('hidden'),
  $('#detectDuplicate').checked,
  $('#dynamicNotice').classList.contains('hidden'),
  $('#duplicateOptionWrap').closest('footer') !== null
], [false, false, true, true]);
check('切换网络属性保留勾选；仅「未选择网络属性」时隐藏并清空', (() => {
  $('#detectDuplicate').checked = true;
  pick('#networkRadio input[value="动态"]');
  const afterDynamic = $('#detectDuplicate').checked;
  pick('#networkRadio input[value="静态"]');
  const afterBack = $('#detectDuplicate').checked;
  const radios = $$('#networkRadio input');
  radios.forEach(r => { r.checked = false; });
  radios[0].dispatchEvent(new win.Event('change', { bubbles: true }));
  const afterNone = [$('#duplicateOptionWrap').classList.contains('hidden'), $('#detectDuplicate').checked];
  pick('#networkRadio input[value="静态"]');
  $('#detectDuplicate').checked = false;
  return { afterDynamic, afterBack, afterNone };
})(), { afterDynamic: true, afterBack: true, afterNone: [true, false] });
check('校验重复项位于操作栏左侧（提交按钮之前）', (() => {
  const wrap = $('#duplicateOptionWrap'), footer = wrap.closest('footer');
  const group = footer.querySelector('#submitBtn').closest('div');
  return {
    inFooter: footer !== null,
    beforeButtons: !!(wrap.compareDocumentPosition(group) & 4),
    leftSlotClass: /\bmr-auto\b/.test(wrap.className),
    tipText: wrap.querySelector('.dup-tip').textContent.trim(),
    tipHasProxyWording: /代理/.test(wrap.querySelector('.dup-tip').textContent)
  };
})(), {
  inFooter: true,
  beforeButtons: true,
  leftSlotClass: true,
  tipText: '与“自有设备列表”中已添加的设备对比，当设备信息与某项完全一致时，判定该项为重复项，不做添加。',
  tipHasProxyWording: false
});
check('切到批量添加后操作栏的校验重复项隐藏', (() => {
  clickEl($$('.add-mode-tab').find(b => b.dataset.addMode === 'batch'));
  const hiddenInBatch = $('#duplicateOptionWrap').classList.contains('hidden');
  clickEl($$('.add-mode-tab').find(b => b.dataset.addMode === 'single'));
  return [hiddenInBatch, $('#duplicateOptionWrap').classList.contains('hidden')];
})(), [true, false]);

/* ===================== 2b. 到期时间日期下拉 ===================== */
check('日期面板默认关闭', $('#deviceExpiresPicker').classList.contains('hidden'), true);
clickEl($('#deviceExpiresTrigger'));
check('点击触发器展开日期面板', [
  $('#deviceExpiresPicker').classList.contains('hidden'),
  $('#deviceExpiresTrigger').getAttribute('aria-expanded')
], [false, 'true']);
check('星期表头', $$('#expiresWeek span').map(s => s.textContent).join(''), '日一二三四五六');
check('日历渲染当月天数', $$('#expiresGrid [data-expires-day]').length, a => a >= 28 && a <= 31);
const monthTitle = $('#expiresMonthTitle').textContent;
clickEl($('#expiresNextMonth'));
check('切换到下月', $('#expiresMonthTitle').textContent !== monthTitle, true);
clickEl($('#expiresPrevMonth'));
check('切回原月份', $('#expiresMonthTitle').textContent, monthTitle);
const firstDay = $$('#expiresGrid [data-expires-day]')[0];
const pickedDay = firstDay.dataset.expiresDay;
clickEl(firstDay);
check('选择日期后面板收起', $('#deviceExpiresPicker').classList.contains('hidden'), true);
check('取值与展示同步且标记为已选', [
  $('#deviceExpires').value,
  $('#deviceExpiresDisplay').textContent.trim(),
  $('#deviceExpiresDisplay').classList.contains('is-selected')
], [pickedDay, pickedDay, true]);
clickEl($('#deviceExpiresTrigger'));
check('再次点击触发器可重新展开', $('#deviceExpiresPicker').classList.contains('hidden'), false);
clickEl($('#deviceExpiresTrigger'));
check('重复点击触发器收起面板', $('#deviceExpiresPicker').classList.contains('hidden'), true);

/* ===================== 2c. 检测设备与检测结果 ===================== */
setValue('#deviceHost', '203.0.113.21');
setValue('#devicePort', '8000');
check('检测结果区默认隐藏', $('#detectResultRow').classList.contains('hidden'), true);
clickEl($('#detectSingle'));
await sleep(1200);
check('检测后结果区展开', $('#detectResultRow').classList.contains('hidden'), false);
check('检测结果表头', $$('#detectResultRow th').map(th => th.textContent.trim()),
  ['设备名称', '设备/域名', '端口', '归属地', '检测结果']);
check('检测成功：归属地「中国-杭州」+ 结论「检测成功」+ 对勾图标', (() => {
  const cells = $$('#singleDetectBody tr td').map(td => td.textContent.trim());
  const verdict = $('#singleDetectBody .detect-verdict');
  return {
    cells,
    icon: verdict.querySelector('i').getAttribute('data-lucide'),
    color: verdict.getAttribute('style')
  };
})(), {
  cells: ['未命名设备', '203.0.113.21', '8000', '中国-杭州', '检测成功'],
  icon: 'circle-check',
  color: 'color:#0FC060'
});

$('#detectDuplicate').checked = true;
clickEl($('#detectSingle'));
await sleep(1200);
check('勾选校验重复项后判定为设备重复', $$('#singleDetectBody tr td').map(td => td.textContent.trim()),
  ['未命名设备', '203.0.113.21', '8000', '未知-未知', '设备重复']);

$('#detectDuplicate').checked = false;
setValue('#deviceHost', '203.0.113.2');
clickEl($('#detectSingle'));
await sleep(1200);
check('检测不通过时展示「设备有问题」', $$('#singleDetectBody tr td').map(td => td.textContent.trim()),
  ['未命名设备', '203.0.113.2', '8000', '未知-未知', '设备有问题']);
setValue('#deviceHost', '');
setValue('#devicePort', '');

/* ===================== 3. 批量添加 ===================== */
clickEl($('.add-mode-tab[data-add-mode="batch"]'));
check('切到批量添加', [$('#singlePane').classList.contains('hidden'), $('#batchPane').classList.contains('hidden')], [true, false]);
check('提交按钮文案固定为确定', $('#submitBtn').textContent.trim(), '确定');
check('批量网络属性参数', $$('#batchNetworkRadio input').map(i => i.value), ['静态', '动态']);
check('批量网络属性为卡片式单选且默认选中「静态」', [
  $$('#batchNetworkRadio .net-card').length,
  $$('#batchNetworkRadio input:checked').map(i => i.value),
  $$('#batchNetworkRadio .net-card.is-selected').map(c => c.querySelector('.net-card-title').textContent.trim()),
  $('#batchStatic').classList.contains('hidden'),
  $('#batchDynamic').classList.contains('hidden')
], [2, ['静态'], ['静态'], false, true]);
check('批量静态字段（设备类型统一在页签顶部，不再各自一份）', ['batchDeviceType', 'staticLines', 'staticIpProvider', 'detectStatic'].map(id => $('#' + id) !== null), a => a.every(Boolean));
check('批量静态 IP查询渠道参数', $$('#staticIpProvider option').map(o => o.value), ['IPInfo', 'IP2Location', 'IPData']);
pick('#batchNetworkRadio input[value="动态"]');
check('批量切到动态', [$('#batchStatic').classList.contains('hidden'), $('#batchDynamic').classList.contains('hidden')], [true, false]);
check('批量动态字段', ['dynamicLines', 'dynamicExtractMode', 'dynamicBatchIpProvider', 'detectDynamic'].map(id => $('#' + id) !== null), a => a.every(Boolean));
check('批量动态 IP查询渠道参数', $$('#dynamicBatchIpProvider option').map(o => o.value), ['IPInfo', 'IP2Location', 'IPData']);
check('批量动态填写说明与静态同构', (() => {
  const panel = $('#batchDynamic .guide-panel');
  const steps = panel.querySelector('.guide-steps');
  const fmt = panel.querySelector('.guide-fmt');
  const staticPanel = $('#batchStatic .guide-panel');
  return {
    title: panel.querySelector('h4').textContent.trim(),
    stepsTag: steps ? steps.tagName : null,
    stepsCount: steps ? steps.children.length : 0,
    subText: panel.querySelector('.guide-sub').textContent.trim(),
    fmtCount: fmt ? fmt.children.length : 0,
    fmtIsMono: /\bmono\b/.test(fmt.className),
    sameStructureAsStatic: ['.guide-steps', '.guide-sub', '.guide-fmt'].every(sel => !!panel.querySelector(sel) && !!staticPanel.querySelector(sel)),
    listStyle: win.getComputedStyle(steps).listStyleType
  };
})(), { title: '说明：', stepsTag: 'OL', stepsCount: 6, subText: '填写格式 (支持 HTTP、HTTPS):', fmtCount: 3, fmtIsMono: true, sameStructureAsStatic: true, listStyle: 'decimal' });
check('动态提取链接恢复花括号备注（placeholder / 说明规则 / 格式示例三处同步，示例逐行带 {备注}）', (() => {
  const placeholder = $('#dynamicLines').getAttribute('placeholder');
  const guideText = $('#batchDynamic .guide-panel').textContent;
  const fmtItems = [...$('#batchDynamic .guide-panel').querySelectorAll('.guide-fmt li')].map(li => li.textContent.trim());
  /* 首行是「每行一条提取链接，例如：」引导语，其余才是示例行 */
  const exampleLines = placeholder.split('\n').slice(1);
  return {
    placeholderHasBrace: placeholder.includes('{备注}'),
    placeholderExampleLines: exampleLines.length,
    placeholderBracedLines: exampleLines.filter(line => /^https?:\/\/.*\{备注\}$/.test(line.trim())).length,
    guideHasBraceNote: guideText.includes('备注写在花括号内，最多 40 字'),
    guideSteps: [...$('#batchDynamic .guide-panel').querySelectorAll('.guide-steps li')].map(li => li.textContent.trim()),
    fmtCount: fmtItems.length,
    fmtBracedCount: fmtItems.filter(item => /\{备注\}$/.test(item)).length
  };
})(), {
  placeholderHasBrace: true,
  placeholderExampleLines: 3,
  placeholderBracedLines: 3,
  guideHasBraceNote: true,
  guideSteps: ['每行一条提取链接，需以 http:// 或 https:// 开头', '每一行一条提取链接，一次最多添加500条', '备注写在花括号内，最多 40 字', '提取方式与设备类型统一作用于本批全部链接', '链接与令牌加密存储，列表与日志只显示脱敏值', '提取前请确认本机IP已在代理平台白名单内'],
  fmtCount: 3,
  fmtBracedCount: 3
});

/* ===================== 4. 批量检测（静态） ===================== */
pick('#batchNetworkRadio input[value="静态"]');
setValue('#staticLines', [
  '192.0.2.17:8000{美国备用}',
  '192.0.2.17:8000',
  'bad-line',
  'abc.example.test:443',
  '[2001:db8:2de:0:0:0:0:e13]:8000{IPv6线路}'
].join('\n'));
clickEl($('#detectStatic'));
await sleep(1200);
check('输入框下方逐行红字提示（批内重复 + 格式错误）', $('#staticLinesError').innerHTML.replace(/<br>/g, '|'),
  '第【2】行，设备重复：192.0.2.17:8000|第【3】行，格式错误');
check('批量静态检测结果面板可见 + 统计', [
  $('#staticDetectRow').classList.contains('hidden'),
  $('#staticDetectStats').textContent
], [false, '总数 3 · 成功 3 · 失败 0']);
check('静态结果表 11 列（设备类型右侧=地址类型、设备端口右侧=归属地、备注左侧=到期时间）+ 行内容', [
  $$('#staticDetectRow thead th').map(th => th.textContent.trim()),
  $$('#staticDetectBody tr').map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.trim()))
], [
  ['设备名称', '设备类型', '地址类型', '设备IP', '设备端口', '归属地', '设备账号', '设备密码', '检测结果', '到期时间', '备注'],
  [
    ['批量设备-1', 'http', 'IPv4', '192.0.2.17', '8000', '中国-杭州', '', '', '检测成功', '2026-11-30 23:59', '美国备用'],
    ['批量设备-2', 'http', 'IPv4', 'abc.example.test', '443', '中国-杭州', '', '', '检测成功', '2026-12-31 23:59', ''],
    ['批量设备-3', 'http', 'IPv6', '[2001:db8:2de:0:0:0:0:e13]', '8000', '中国-杭州', '', '', '检测成功', '2027-01-31 23:59', 'IPv6线路']
  ]
]);
check('地址类型由主机写法推导（[] 内为 IPv6，其余 IPv4），非可编辑列', (() => {
  const cells = $$('#staticDetectBody tr td:nth-child(3)');
  return {
    texts: cells.map(td => td.textContent.trim()),
    editable: cells.map(td => td.classList.contains('cell-editable')),
    values: [...new Set(cells.map(td => td.textContent.trim()))].sort()
  };
})(), { texts: ['IPv4', 'IPv4', 'IPv6'], editable: [false, false, false], values: ['IPv4', 'IPv6'] });
check('归属地为检测结论（成功中国-杭州），列位置在设备端口右侧', (() => {
  const heads = $$('#staticDetectRow thead th').map(th => th.textContent.trim());
  return {
    afterPort: heads.indexOf('归属地') === heads.indexOf('设备端口') + 1,
    texts: $$('#staticDetectBody tr td:nth-child(6)').map(td => td.textContent.trim())
  };
})(), { afterPort: true, texts: ['中国-杭州', '中国-杭州', '中国-杭州'] });
check('到期时间列在备注左侧、参数可编辑（与备注同款 cell-editable + 铅笔）', (() => {
  const heads = $$('#staticDetectRow thead th').map(th => th.textContent.trim());
  const cell = $('#staticDetectBody td.cell-editable[data-field="expires"]');
  return {
    beforeRemark: heads.indexOf('到期时间') === heads.indexOf('备注') - 1,
    editable: cell !== null,
    withHint: !!cell.querySelector('.cell-hint'),
    withValue: !!cell.querySelector('.cell-value'),
    addressTypeAfterType: heads.indexOf('地址类型') === heads.indexOf('设备类型') + 1
  };
})(), { beforeRemark: true, editable: true, withHint: true, withValue: true, addressTypeAfterType: true });
check('到期时间行内编辑：点单元格→输入→Enter 回填（与备注交互一致）', (() => {
  const cell = $('#staticDetectBody td.cell-editable[data-field="expires"]');
  clickEl(cell);
  const input = cell.querySelector('input.cell-input');
  const opened = input !== null && input.value === '2026-11-30 23:59' && input.placeholder === 'YYYY-MM-DD HH:mm';
  input.value = '2027-05-01 09:30';
  input.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return {
    opened,
    committed: cell.querySelector('.cell-value').textContent.trim(),
    inputRemoved: cell.querySelector('input.cell-input') === null
  };
})(), { opened: true, committed: '2027-05-01 09:30', inputRemoved: true });
check('到期时间 Esc 取消回原值', (() => {
  const cell = $('#staticDetectBody td.cell-editable[data-field="expires"]');
  clickEl(cell);
  const input = cell.querySelector('input.cell-input');
  input.value = '1999-01-01 00:00';
  input.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return cell.querySelector('.cell-value').textContent.trim();
})(), '2027-05-01 09:30');
check('检测结论三态语义色（成功 #0FC060 / 重复 #E7772D / 有问题 #D9001B）', (() => {
  const ok = $('#staticDetectBody .detect-verdict');
  return {
    icon: ok.querySelector('i').getAttribute('data-lucide'),
    text: ok.textContent.trim(),
    /* jsdom 读取 inline style 会归一化成 rgb 形式 */
    color: ok.style.color,
    ruleColors: ['#0FC060', '#E7772D', '#D9001B'].map(c => html.includes("color: '" + c + "'"))
  };
})(), { icon: 'circle-check', text: '检测成功', color: 'rgb(15, 192, 96)', ruleColors: [true, true, true] });
check('检测概览随结果刷新（时间非 --，已添加/成功/失败 = 3/3/0）', [
  $('#staticDetectTime').textContent.trim() === '--',
  $('#staticAddedCount').textContent.trim(),
  $('#staticSuccessCount').textContent.trim(),
  $('#staticFailCount').textContent.trim()
], [false, '3', '3', '0']);

/* ===================== 4b. 批量检测（动态）：结果表 8 列（设备名称/设备类型/提取链接/设备IP/设备端口/归属地/检测结果/备注） ===================== */
pick('#batchNetworkRadio input[value="动态"]');
setValue('#dynamicLines', [
  'https://api.example.test/token{上海机房}',
  'https://proxy.test/rotate/secret',
  'ftp://bad.example.test/x'
].join('\n'));
clickEl($('#detectDynamic'));
await sleep(1200);
check('动态行级红字提示（协议错误）', $('#dynamicLinesError').innerHTML.replace(/<br>/g, '|'),
  '第【3】行，提取链接需以 http:// 或 https:// 开头');
check('动态结果表 8 列（含 提取链接 / 归属地，不含 账号 / 密码 / 地址类型 / 到期时间）+ 行内容', [
  $$('#dynamicDetectRow thead th').map(th => th.textContent.trim()),
  $$('#dynamicDetectBody tr').map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.trim()))
], [
  ['设备名称', '设备类型', '提取链接', '设备IP', '设备端口', '归属地', '检测结果', '备注'],
  [
    ['批量动态设备-1', 'http', 'https://api.example.test/token', '198.51.100.11', '8000', '中国-杭州', '检测成功', '上海机房'],
    ['批量动态设备-2', 'http', 'https://proxy.test/rotate/secret', '198.51.100.12', '8001', '中国-杭州', '检测成功', '']
  ]
]);
check('动态结果表列位与可编辑性：提取链接紧跟设备类型、归属地紧跟设备端口；仅名称与备注可编辑', (() => {
  const heads = $$('#dynamicDetectRow thead th').map(th => th.textContent.trim());
  const first = $('#dynamicDetectBody tr');
  const cells = [...first.querySelectorAll('td')];
  return {
    heads: heads.length,
    endpointAfterType: heads.indexOf('提取链接') === heads.indexOf('设备类型') + 1,
    regionAfterPort: heads.indexOf('归属地') === heads.indexOf('设备端口') + 1,
    removed: ['设备账号', '设备密码', '地址类型', '到期时间'].every(h => heads.indexOf(h) === -1),
    editableFields: cells.filter(td => td.classList.contains('cell-editable')).map(td => td.dataset.field),
    accountCell: $('#dynamicDetectBody td.cell-editable[data-field="account"]'),
    expiresCell: $('#dynamicDetectBody td.cell-editable[data-field="expires"]'),
    /* 提取链接过长时省略展示，完整值挂 title */
    clipped: (() => {
      const span = cells[2].querySelector('.cell-clip');
      return span ? span.getAttribute('title') === 'https://api.example.test/token' : false;
    })()
  };
})(), {
  heads: 8, endpointAfterType: true, regionAfterPort: true, removed: true,
  editableFields: ['remark'], accountCell: null, expiresCell: null, clipped: true
});
check('动态结果表归属地随检测结论着色口径（成功 → 中国-杭州）',
  $$('#dynamicDetectBody tr td:nth-child(6)').map(td => td.textContent.trim()), ['中国-杭州', '中国-杭州']);
check('动态结果表统计与概览', [
  $('#dynamicDetectStats').textContent,
  $('#dynamicDetectTime').textContent.trim() === '--',
  $('#dynamicAddedCount').textContent.trim()
], ['总数 2 · 成功 2 · 失败 0', false, '2']);
pick('#batchNetworkRadio input[value="静态"]');

/* ===================== 5. 单个添加校验 ===================== */
clickEl($('.add-mode-tab[data-add-mode="single"]'));
setValue('#deviceName', '');
clickEl($('#submitBtn'));
check('空名称报错', $('#deviceNameError').textContent, '请输入设备名称');
check('空名称不跳转', sent.length, 0);

setValue('#deviceName', '测试静态设备');
clickEl($('#submitBtn'));
check('空地址报错', $('#deviceHostError').textContent, '请输入设备/域名');

/* 勾选「校验重复项」后命中自有设备列表 → 禁止添加并 Toast 提示 */
$('#detectDuplicate').checked = true;
setValue('#deviceHost', '203.0.113.21');
setValue('#devicePort', '8000');
clickEl($('#submitBtn'));
await sleep(120);
check('勾选校验重复项且命中重复时禁止添加（不跳转）', sent.length, 0);
check('重复拦截 Toast 文案', (() => {
  const t = $('.device-toast');
  return t ? t.textContent.trim() : null;
})(), '检测到您要添加的设备与“自有设备列表”中存在重复，禁止添加！若想添加，请不要勾选“校验重复项”！');
check('重复拦截 Toast 为 danger 语义（circle-x + danger 色）', (() => {
  const t = $('.device-toast');
  return t ? [t.querySelector('i').getAttribute('data-lucide'), t.querySelector('i').getAttribute('style'), t.getAttribute('role')] : null;
})(), ['circle-x', 'color:#D9001B', 'alert']);
check('重复拦截后提交按钮未被禁用（可修正后重试）', $('#submitBtn').disabled, false);
$('#detectDuplicate').checked = false;

setValue('#deviceHost', '192.0.2.99');
setValue('#devicePort', '8080');
setValue('#deviceRemark', '回归测试');
clickEl($('#submitBtn'));
await sleep(900);
check('单个添加写入会话存储', Object.keys(memStore).includes('yundeng-device-toast'), true);
check('单个添加 Toast 文案', memStore['yundeng-device-toast'], a => typeof a === 'string' && a.includes('测试静态设备') && a.includes('192.0.2.99:8080'));
check('单个添加返回列表页', sent.map(s => s.type + '|' + s.file), ['yundeng:route|设备管理.html']);

/* ===================== 6. 返回按钮 ===================== */
memStore['yundeng-device-toast'] = 'stale';
sent.length = 0;
clickEl($('#backBtn'));
check('返回按钮发出路由消息', sent.map(s => s.type + '|' + s.file), ['yundeng:route|设备管理.html']);
check('返回不覆盖已有提示', memStore['yundeng-device-toast'], 'stale');

/* ===================== 7. 注解零污染 ===================== */
check('页面无 annotations 相关 DOM 污染', doc.body.outerHTML.includes('data-anno'), false);
check('注解变量仅在脚本中声明', html.includes('var annotations_removed = {'), true);

/* ===================== 8. 批量提交（独立页面实例：主实例在单个提交后 submitting 已锁死） ===================== */
{
  const dom2 = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://127.0.0.1:8899/Prototype/添加设备.html?embedded=1' });
  const win2 = dom2.window;
  const doc2 = win2.document;
  win2.tailwind = {};
  win2.lucide = { createIcons() {} };
  win2.structuredClone = win2.structuredClone || (v => JSON.parse(JSON.stringify(v)));
  const store2 = {};
  Object.defineProperty(win2, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} } });
  Object.defineProperty(win2, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: k => (k in store2 ? store2[k] : null),
      setItem: (k, v) => { store2[k] = String(v); },
      removeItem: k => { delete store2[k]; },
      clear() {}
    }
  });
  const sent2 = [];
  Object.defineProperty(win2, 'parent', { configurable: true, value: { postMessage: m => sent2.push(m) } });
  blocks.forEach(code => win2.eval(code));
  const $2 = sel => doc2.querySelector(sel);
  const click2 = el => el.dispatchEvent(new win2.MouseEvent('click', { bubbles: true, cancelable: true }));
  const set2 = (sel, value) => { const el = $2(sel); el.value = value; el.dispatchEvent(new win2.Event('input', { bubbles: true })); };

  click2($2('.add-mode-tab[data-add-mode="batch"]'));
  set2('#staticLines', '192.0.2.17:8000{美国备用}\nsocks5://192.0.2.30:1080{内网}');
  click2($2('#detectStatic'));
  await sleep(1200);
  const tr = doc2.querySelector('#staticDetectBody tr');
  tr.querySelector('.cell-edit').click();
  const nameInput = tr.querySelector('input.cell-input');
  nameInput.value = '批量重命名设备';
  nameInput.dispatchEvent(new win2.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  check('行内改名后回显新名称', tr.querySelector('.cell-name .cell-value').textContent.trim(), '批量重命名设备');
  click2($2('#submitBtn'));
  await sleep(120);
  check('批量提交 Toast 文案', (() => {
    const t = doc2.querySelector('.device-toast');
    return t ? t.textContent.trim() : null;
  })(), '已添加 2 个静态设备');
  await sleep(700);
  check('批量提交后返回列表页', sent2.map(s => s.type + '|' + s.file), ['yundeng:route|设备管理.html']);
  check('批量提交回显提示', typeof store2['yundeng-device-toast'] === 'string' && store2['yundeng-device-toast'].includes('已添加 2 个静态设备'), true);
}

let failed = 0;
results.forEach(r => {
  if (!r.pass) failed += 1;
  console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.pass ? '' : '  => ' + JSON.stringify(r.actual)));
});
console.log('\n' + (results.length - failed) + '/' + results.length + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
